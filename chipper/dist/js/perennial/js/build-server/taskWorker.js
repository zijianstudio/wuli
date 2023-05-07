// Copyright 2017-2019, University of Colorado Boulder

const ChipperVersion = require('../common/ChipperVersion');
const constants = require('./constants');
const createTranslationsXML = require('./createTranslationsXML');
const devDeploy = require('./devDeploy');
const execute = require('../common/execute');
const fs = require('fs');
const gitCheckout = require('../common/gitCheckout');
const gitPull = require('../common/gitPull');
const getLocales = require('./getLocales');
const notifyServer = require('./notifyServer');
const pullMaster = require('./pullMaster');
const rsync = require('rsync');
const SimVersion = require('../common/SimVersion');
const winston = require('winston');
const writeFile = require('../common/writeFile');
const writePhetHtaccess = require('./writePhetHtaccess');
const writePhetioHtaccess = require('../common/writePhetioHtaccess');
const deployImages = require('./deployImages');
const persistentQueue = require('./persistentQueue');
const buildDir = './js/build-server/tmp';

/**
 * checkout master everywhere and abort build with err
 * @param {String|Error} err - error logged and sent via email
 */
const abortBuild = async err => {
  winston.log('error', `BUILD ABORTED! ${err}`);
  err.stack && winston.log('error', err.stack);
  winston.log('info', 'build aborted: checking out master for every repo in case build shas are still checked out');
  await execute('grunt', ['checkout-master-all'], constants.PERENNIAL);
  throw new Error(`Build aborted, ${err}`);
};

/**
 * Clean up after deploy. Checkout master for every repo and remove tmp dir.
 */
const afterDeploy = async buildDir => {
  try {
    await execute('grunt', ['checkout-master-all'], constants.PERENNIAL);
    await execute('rm', ['-rf', buildDir], '.');
  } catch (err) {
    await abortBuild(err);
  }
};

/**
 * taskQueue ensures that only one build/deploy process will be happening at the same time.  The main build/deploy logic is here.
 *
 * @property {JSON} repos
 * @property {String} api
 * @property {String} locales - comma separated list of locale codes
 * @property {String} simName - lower case simulation name used for creating files/directories
 * @property {String} version - sim version identifier string
 * @property {String} servers - deployment targets, subset of [ 'dev', 'production' ]
 * @property {string[]} brands - deployment brands
 * @property {String} email - used for sending notifications about success/failure
 * @property {String} translatorId - rosetta user id for adding translators to the website
 * @property {winston} winston - logger
 * @param options
 */
async function runTask(options) {
  persistentQueue.removeTask(options);
  if (options.deployImages) {
    try {
      await deployImages(options);
      await gitCheckout('chipper', 'master');
      await gitPull('chipper');
      await gitCheckout('perennial-alias', 'master');
      await gitPull('perennial-alias');
      winston.info('Deploy images completed successfully.');
      return;
    } catch (e) {
      winston.error(e);
      winston.error('Deploy images failed. See previous logs for details.');
      throw e;
    }
  }
  try {
    //-------------------------------------------------------------------------------------
    // Parse and validate parameters
    //-------------------------------------------------------------------------------------
    const api = options.api;
    const repos = options.repos;
    let locales = options.locales;
    const simName = options.simName;
    let version = options.version;
    const email = options.email;
    const brands = options.brands;
    const servers = options.servers;
    const userId = options.userId;
    let branch = options.branch;
    if (userId) {
      winston.log('info', `setting userId = ${userId}`);
    }
    const simNameRegex = /^[a-z-]+$/;
    winston.debug(JSON.stringify(repos));
    if (branch === null) {
      branch = repos[simName].branch;
    }

    // make sure the repos passed in validates
    for (const key in repos) {
      if (repos.hasOwnProperty(key)) {
        winston.log('info', `Validating repo: ${key}`);

        // make sure all keys in repos object are valid sim names
        if (!simNameRegex.test(key)) {
          await abortBuild(`invalid simName in repos: ${simName}`);
        }
        const value = repos[key];
        if (key === 'comment') {
          if (typeof value !== 'string') {
            await abortBuild('invalid comment in repos: should be a string');
          }
        } else if (value instanceof Object && value.hasOwnProperty('sha')) {
          if (!/^[a-f0-9]{40}$/.test(value.sha)) {
            await abortBuild(`invalid sha in repos. key: ${key} value: ${value} sha: ${value.sha}`);
          }
        } else {
          await abortBuild(`invalid item in repos. key: ${key} value: ${value}`);
        }
      }
    }

    // validate simName
    if (!simNameRegex.test(simName)) {
      await abortBuild(`invalid simName ${simName}`);
    }

    // Infer brand from version string and keep unstripped version for phet-io
    const originalVersion = version;
    if (api === '1.0') {
      // validate version and strip suffixes since just the numbers are used in the directory name on dev and production servers
      const versionMatch = version.match(/^(\d+\.\d+\.\d+)(?:-.*)?$/);
      if (versionMatch && versionMatch.length === 2) {
        if (servers.includes('dev')) {
          // if deploying an rc version use the -rc.[number] suffix
          version = versionMatch[0];
        } else {
          // otherwise strip any suffix
          version = versionMatch[1];
        }
        winston.log('info', `detecting version number: ${version}`);
      } else {
        await abortBuild(`invalid version number: ${version}`);
      }
    }
    const simDir = `../${simName}`;
    winston.log('info', `building sim ${simName}`);

    // Create the temporary build dir, removing the existing dir if it exists.
    if (fs.existsSync(buildDir)) {
      await execute('rm', ['-rf', buildDir], '.');
    }
    await fs.promises.mkdir(buildDir, {
      recursive: true
    });
    await writeFile(`${buildDir}/dependencies.json`, JSON.stringify(repos));
    winston.log('info', `wrote file ${buildDir}/dependencies.json`);
    await execute('git', ['pull'], constants.PERENNIAL);
    await execute('npm', ['prune'], constants.PERENNIAL);
    await execute('npm', ['update'], constants.PERENNIAL);
    await execute('./perennial/bin/clone-missing-repos.sh', [], '..');
    await pullMaster(repos);
    await execute('grunt', ['checkout-shas', '--buildServer=true', `--repo=${simName}`], constants.PERENNIAL);
    await execute('git', ['checkout', repos[simName].sha], simDir);
    await execute('npm', ['prune'], '../chipper');
    await execute('npm', ['update'], '../chipper');
    await execute('npm', ['prune'], '../perennial-alias');
    await execute('npm', ['update'], '../perennial-alias');
    await execute('npm', ['prune'], simDir);
    await execute('npm', ['update'], simDir);
    if (api === '1.0') {
      locales = await getLocales(locales, simName);
    }
    const brandLocales = brands.indexOf(constants.PHET_BRAND) >= 0 ? locales : 'en';
    winston.log('info', `building for brands: ${brands} version: ${version}`);
    const chipperVersion = ChipperVersion.getFromRepository();
    winston.debug(`Chipper version detected: ${chipperVersion.toString()}`);
    if (chipperVersion.major === 2 && chipperVersion.minor === 0) {
      await execute('grunt', ['--allHTML', '--debugHTML', `--brands=${brands.join(',')}`, `--locales=${brandLocales}`], simDir);
    } else if (chipperVersion.major === 0 && chipperVersion.minor === 0) {
      const args = ['build-for-server', `--brand=${brands[0]}`, `--locales=${brandLocales}`];
      if (brands[0] === constants.PHET_BRAND) {
        args.push('--allHTML');
      }
      await execute('grunt', args, simDir);
    } else {
      await abortBuild('Unsupported chipper version');
    }
    winston.debug(`deploying to servers: ${JSON.stringify(servers)}`);
    if (servers.indexOf(constants.DEV_SERVER) >= 0) {
      winston.info('deploying to dev');
      if (brands.indexOf(constants.PHET_IO_BRAND) >= 0) {
        const htaccessLocation = chipperVersion.major === 2 && chipperVersion.minor === 0 ? `${simDir}/build/phet-io` : `${simDir}/build`;
        await writePhetioHtaccess(htaccessLocation);
      }
      await devDeploy(simDir, simName, version, chipperVersion, brands);
    }
    const localesArray = typeof locales === 'string' ? locales.split(',') : locales;

    // if this build request comes from rosetta it will have a userId field and only one locale
    const isTranslationRequest = userId && localesArray.length === 1 && localesArray[0] !== '*';
    if (servers.indexOf(constants.PRODUCTION_SERVER) >= 0) {
      winston.info('deploying to production');
      let targetVersionDir;
      let targetSimDir;
      // Loop over all brands
      for (const i in brands) {
        if (brands.hasOwnProperty(i)) {
          const brand = brands[i];
          winston.info(`deploying brand: ${brand}`);

          // Pre-copy steps
          if (brand === constants.PHET_BRAND) {
            targetSimDir = constants.HTML_SIMS_DIRECTORY + simName;
            targetVersionDir = `${targetSimDir}/${version}/`;
            if (chipperVersion.major === 2 && chipperVersion.minor === 0) {
              // Remove _phet from all filenames in the phet directory
              const files = fs.readdirSync(`${simDir}/build/phet`);
              for (const i in files) {
                if (files.hasOwnProperty(i)) {
                  const filename = files[i];
                  if (filename.indexOf('_phet') >= 0) {
                    const newFilename = filename.replace('_phet', '');
                    await execute('mv', [filename, newFilename], `${simDir}/build/phet`);
                  }
                }
              }
            }
          } else if (brand === constants.PHET_IO_BRAND) {
            targetSimDir = constants.PHET_IO_SIMS_DIRECTORY + simName;
            targetVersionDir = `${targetSimDir}/${originalVersion}`;

            // Chipper 1.0 has -phetio in the version schema for PhET-iO branded sims
            if (chipperVersion.major === 0 && !originalVersion.match('-phetio')) {
              targetVersionDir += '-phetio';
            }
            targetVersionDir += '/';
          }

          // Copy steps - allow EEXIST errors but reject anything else
          winston.debug(`Creating version dir: ${targetVersionDir}`);
          try {
            await fs.promises.mkdir(targetVersionDir, {
              recursive: true
            });
            winston.debug('Success creating sim dir');
          } catch (err) {
            if (err.code !== 'EEXIST') {
              winston.error('Failure creating version dir');
              winston.error(err);
              throw err;
            }
          }
          let sourceDir = `${simDir}/build`;
          if (chipperVersion.major === 2 && chipperVersion.minor === 0) {
            sourceDir += `/${brand}`;
          }
          await new Promise((resolve, reject) => {
            winston.debug(`Copying recursive ${sourceDir} to ${targetVersionDir}`);
            new rsync().flags('razpO').set('no-perms').set('exclude', '.rsync-filter').source(`${sourceDir}/`).destination(targetVersionDir).output(stdout => {
              winston.debug(stdout.toString());
            }, stderr => {
              winston.error(stderr.toString());
            }).execute((err, code, cmd) => {
              if (err && code !== 23) {
                winston.debug(code);
                winston.debug(cmd);
                reject(err);
              } else {
                resolve();
              }
            });
          });
          winston.debug('Copy finished');

          // Post-copy steps
          if (brand === constants.PHET_BRAND) {
            await writePhetHtaccess(simName, version);
            await createTranslationsXML(simName, version);
            await notifyServer({
              simName: simName,
              email: email,
              brand: brand,
              locales: locales,
              translatorId: isTranslationRequest ? userId : undefined
            });
          } else if (brand === constants.PHET_IO_BRAND) {
            const suffix = originalVersion.split('-').length >= 2 ? originalVersion.split('-')[1] : chipperVersion.major < 2 ? 'phetio' : '';
            const parsedVersion = SimVersion.parse(version, '');
            const simPackage = JSON.parse(fs.readFileSync(`${simDir}/package.json`));
            const ignoreForAutomatedMaintenanceReleases = !!(simPackage && simPackage.phet && simPackage.phet.ignoreForAutomatedMaintenanceReleases);
            await notifyServer({
              simName: simName,
              email: email,
              brand: brand,
              phetioOptions: {
                branch: branch,
                suffix: suffix,
                version: parsedVersion,
                ignoreForAutomatedMaintenanceReleases: ignoreForAutomatedMaintenanceReleases
              }
            });
            winston.debug('server notified');
            await writePhetioHtaccess(targetVersionDir, {
              simName: simName,
              version: originalVersion,
              directory: constants.PHET_IO_SIMS_DIRECTORY
            });
          }
        }
      }
      if (!isTranslationRequest) {
        await deployImages({
          branch: 'master',
          // chipper branch, always deploy images from master
          simulation: options.simName,
          brands: options.brands,
          version: options.version
        });
      }
    }
  } catch (err) {
    await abortBuild(err);
  }
  await afterDeploy();
}
module.exports = function taskWorker(task, taskCallback) {
  runTask(task).then(() => {
    taskCallback();
  }).catch(reason => {
    taskCallback(reason);
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGlwcGVyVmVyc2lvbiIsInJlcXVpcmUiLCJjb25zdGFudHMiLCJjcmVhdGVUcmFuc2xhdGlvbnNYTUwiLCJkZXZEZXBsb3kiLCJleGVjdXRlIiwiZnMiLCJnaXRDaGVja291dCIsImdpdFB1bGwiLCJnZXRMb2NhbGVzIiwibm90aWZ5U2VydmVyIiwicHVsbE1hc3RlciIsInJzeW5jIiwiU2ltVmVyc2lvbiIsIndpbnN0b24iLCJ3cml0ZUZpbGUiLCJ3cml0ZVBoZXRIdGFjY2VzcyIsIndyaXRlUGhldGlvSHRhY2Nlc3MiLCJkZXBsb3lJbWFnZXMiLCJwZXJzaXN0ZW50UXVldWUiLCJidWlsZERpciIsImFib3J0QnVpbGQiLCJlcnIiLCJsb2ciLCJzdGFjayIsIlBFUkVOTklBTCIsIkVycm9yIiwiYWZ0ZXJEZXBsb3kiLCJydW5UYXNrIiwib3B0aW9ucyIsInJlbW92ZVRhc2siLCJpbmZvIiwiZSIsImVycm9yIiwiYXBpIiwicmVwb3MiLCJsb2NhbGVzIiwic2ltTmFtZSIsInZlcnNpb24iLCJlbWFpbCIsImJyYW5kcyIsInNlcnZlcnMiLCJ1c2VySWQiLCJicmFuY2giLCJzaW1OYW1lUmVnZXgiLCJkZWJ1ZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJrZXkiLCJoYXNPd25Qcm9wZXJ0eSIsInRlc3QiLCJ2YWx1ZSIsIk9iamVjdCIsInNoYSIsIm9yaWdpbmFsVmVyc2lvbiIsInZlcnNpb25NYXRjaCIsIm1hdGNoIiwibGVuZ3RoIiwiaW5jbHVkZXMiLCJzaW1EaXIiLCJleGlzdHNTeW5jIiwicHJvbWlzZXMiLCJta2RpciIsInJlY3Vyc2l2ZSIsImJyYW5kTG9jYWxlcyIsImluZGV4T2YiLCJQSEVUX0JSQU5EIiwiY2hpcHBlclZlcnNpb24iLCJnZXRGcm9tUmVwb3NpdG9yeSIsInRvU3RyaW5nIiwibWFqb3IiLCJtaW5vciIsImpvaW4iLCJhcmdzIiwicHVzaCIsIkRFVl9TRVJWRVIiLCJQSEVUX0lPX0JSQU5EIiwiaHRhY2Nlc3NMb2NhdGlvbiIsImxvY2FsZXNBcnJheSIsInNwbGl0IiwiaXNUcmFuc2xhdGlvblJlcXVlc3QiLCJQUk9EVUNUSU9OX1NFUlZFUiIsInRhcmdldFZlcnNpb25EaXIiLCJ0YXJnZXRTaW1EaXIiLCJpIiwiYnJhbmQiLCJIVE1MX1NJTVNfRElSRUNUT1JZIiwiZmlsZXMiLCJyZWFkZGlyU3luYyIsImZpbGVuYW1lIiwibmV3RmlsZW5hbWUiLCJyZXBsYWNlIiwiUEhFVF9JT19TSU1TX0RJUkVDVE9SWSIsImNvZGUiLCJzb3VyY2VEaXIiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImZsYWdzIiwic2V0Iiwic291cmNlIiwiZGVzdGluYXRpb24iLCJvdXRwdXQiLCJzdGRvdXQiLCJzdGRlcnIiLCJjbWQiLCJ0cmFuc2xhdG9ySWQiLCJ1bmRlZmluZWQiLCJzdWZmaXgiLCJwYXJzZWRWZXJzaW9uIiwicGFyc2UiLCJzaW1QYWNrYWdlIiwicmVhZEZpbGVTeW5jIiwiaWdub3JlRm9yQXV0b21hdGVkTWFpbnRlbmFuY2VSZWxlYXNlcyIsInBoZXQiLCJwaGV0aW9PcHRpb25zIiwiZGlyZWN0b3J5Iiwic2ltdWxhdGlvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJ0YXNrV29ya2VyIiwidGFzayIsInRhc2tDYWxsYmFjayIsInRoZW4iLCJjYXRjaCIsInJlYXNvbiJdLCJzb3VyY2VzIjpbInRhc2tXb3JrZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAxOSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5cclxuY29uc3QgQ2hpcHBlclZlcnNpb24gPSByZXF1aXJlKCAnLi4vY29tbW9uL0NoaXBwZXJWZXJzaW9uJyApO1xyXG5jb25zdCBjb25zdGFudHMgPSByZXF1aXJlKCAnLi9jb25zdGFudHMnICk7XHJcbmNvbnN0IGNyZWF0ZVRyYW5zbGF0aW9uc1hNTCA9IHJlcXVpcmUoICcuL2NyZWF0ZVRyYW5zbGF0aW9uc1hNTCcgKTtcclxuY29uc3QgZGV2RGVwbG95ID0gcmVxdWlyZSggJy4vZGV2RGVwbG95JyApO1xyXG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4uL2NvbW1vbi9leGVjdXRlJyApO1xyXG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcclxuY29uc3QgZ2l0Q2hlY2tvdXQgPSByZXF1aXJlKCAnLi4vY29tbW9uL2dpdENoZWNrb3V0JyApO1xyXG5jb25zdCBnaXRQdWxsID0gcmVxdWlyZSggJy4uL2NvbW1vbi9naXRQdWxsJyApO1xyXG5jb25zdCBnZXRMb2NhbGVzID0gcmVxdWlyZSggJy4vZ2V0TG9jYWxlcycgKTtcclxuY29uc3Qgbm90aWZ5U2VydmVyID0gcmVxdWlyZSggJy4vbm90aWZ5U2VydmVyJyApO1xyXG5jb25zdCBwdWxsTWFzdGVyID0gcmVxdWlyZSggJy4vcHVsbE1hc3RlcicgKTtcclxuY29uc3QgcnN5bmMgPSByZXF1aXJlKCAncnN5bmMnICk7XHJcbmNvbnN0IFNpbVZlcnNpb24gPSByZXF1aXJlKCAnLi4vY29tbW9uL1NpbVZlcnNpb24nICk7XHJcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcclxuY29uc3Qgd3JpdGVGaWxlID0gcmVxdWlyZSggJy4uL2NvbW1vbi93cml0ZUZpbGUnICk7XHJcbmNvbnN0IHdyaXRlUGhldEh0YWNjZXNzID0gcmVxdWlyZSggJy4vd3JpdGVQaGV0SHRhY2Nlc3MnICk7XHJcbmNvbnN0IHdyaXRlUGhldGlvSHRhY2Nlc3MgPSByZXF1aXJlKCAnLi4vY29tbW9uL3dyaXRlUGhldGlvSHRhY2Nlc3MnICk7XHJcbmNvbnN0IGRlcGxveUltYWdlcyA9IHJlcXVpcmUoICcuL2RlcGxveUltYWdlcycgKTtcclxuY29uc3QgcGVyc2lzdGVudFF1ZXVlID0gcmVxdWlyZSggJy4vcGVyc2lzdGVudFF1ZXVlJyApO1xyXG5cclxuY29uc3QgYnVpbGREaXIgPSAnLi9qcy9idWlsZC1zZXJ2ZXIvdG1wJztcclxuXHJcbi8qKlxyXG4gKiBjaGVja291dCBtYXN0ZXIgZXZlcnl3aGVyZSBhbmQgYWJvcnQgYnVpbGQgd2l0aCBlcnJcclxuICogQHBhcmFtIHtTdHJpbmd8RXJyb3J9IGVyciAtIGVycm9yIGxvZ2dlZCBhbmQgc2VudCB2aWEgZW1haWxcclxuICovXHJcbmNvbnN0IGFib3J0QnVpbGQgPSBhc3luYyBlcnIgPT4ge1xyXG4gIHdpbnN0b24ubG9nKCAnZXJyb3InLCBgQlVJTEQgQUJPUlRFRCEgJHtlcnJ9YCApO1xyXG4gIGVyci5zdGFjayAmJiB3aW5zdG9uLmxvZyggJ2Vycm9yJywgZXJyLnN0YWNrICk7XHJcblxyXG4gIHdpbnN0b24ubG9nKCAnaW5mbycsICdidWlsZCBhYm9ydGVkOiBjaGVja2luZyBvdXQgbWFzdGVyIGZvciBldmVyeSByZXBvIGluIGNhc2UgYnVpbGQgc2hhcyBhcmUgc3RpbGwgY2hlY2tlZCBvdXQnICk7XHJcbiAgYXdhaXQgZXhlY3V0ZSggJ2dydW50JywgWyAnY2hlY2tvdXQtbWFzdGVyLWFsbCcgXSwgY29uc3RhbnRzLlBFUkVOTklBTCApO1xyXG4gIHRocm93IG5ldyBFcnJvciggYEJ1aWxkIGFib3J0ZWQsICR7ZXJyfWAgKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDbGVhbiB1cCBhZnRlciBkZXBsb3kuIENoZWNrb3V0IG1hc3RlciBmb3IgZXZlcnkgcmVwbyBhbmQgcmVtb3ZlIHRtcCBkaXIuXHJcbiAqL1xyXG5jb25zdCBhZnRlckRlcGxveSA9IGFzeW5jIGJ1aWxkRGlyID0+IHtcclxuICB0cnkge1xyXG4gICAgYXdhaXQgZXhlY3V0ZSggJ2dydW50JywgWyAnY2hlY2tvdXQtbWFzdGVyLWFsbCcgXSwgY29uc3RhbnRzLlBFUkVOTklBTCApO1xyXG4gICAgYXdhaXQgZXhlY3V0ZSggJ3JtJywgWyAnLXJmJywgYnVpbGREaXIgXSwgJy4nICk7XHJcbiAgfVxyXG4gIGNhdGNoKCBlcnIgKSB7XHJcbiAgICBhd2FpdCBhYm9ydEJ1aWxkKCBlcnIgKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogdGFza1F1ZXVlIGVuc3VyZXMgdGhhdCBvbmx5IG9uZSBidWlsZC9kZXBsb3kgcHJvY2VzcyB3aWxsIGJlIGhhcHBlbmluZyBhdCB0aGUgc2FtZSB0aW1lLiAgVGhlIG1haW4gYnVpbGQvZGVwbG95IGxvZ2ljIGlzIGhlcmUuXHJcbiAqXHJcbiAqIEBwcm9wZXJ0eSB7SlNPTn0gcmVwb3NcclxuICogQHByb3BlcnR5IHtTdHJpbmd9IGFwaVxyXG4gKiBAcHJvcGVydHkge1N0cmluZ30gbG9jYWxlcyAtIGNvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIGxvY2FsZSBjb2Rlc1xyXG4gKiBAcHJvcGVydHkge1N0cmluZ30gc2ltTmFtZSAtIGxvd2VyIGNhc2Ugc2ltdWxhdGlvbiBuYW1lIHVzZWQgZm9yIGNyZWF0aW5nIGZpbGVzL2RpcmVjdG9yaWVzXHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSB2ZXJzaW9uIC0gc2ltIHZlcnNpb24gaWRlbnRpZmllciBzdHJpbmdcclxuICogQHByb3BlcnR5IHtTdHJpbmd9IHNlcnZlcnMgLSBkZXBsb3ltZW50IHRhcmdldHMsIHN1YnNldCBvZiBbICdkZXYnLCAncHJvZHVjdGlvbicgXVxyXG4gKiBAcHJvcGVydHkge3N0cmluZ1tdfSBicmFuZHMgLSBkZXBsb3ltZW50IGJyYW5kc1xyXG4gKiBAcHJvcGVydHkge1N0cmluZ30gZW1haWwgLSB1c2VkIGZvciBzZW5kaW5nIG5vdGlmaWNhdGlvbnMgYWJvdXQgc3VjY2Vzcy9mYWlsdXJlXHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSB0cmFuc2xhdG9ySWQgLSByb3NldHRhIHVzZXIgaWQgZm9yIGFkZGluZyB0cmFuc2xhdG9ycyB0byB0aGUgd2Vic2l0ZVxyXG4gKiBAcHJvcGVydHkge3dpbnN0b259IHdpbnN0b24gLSBsb2dnZXJcclxuICogQHBhcmFtIG9wdGlvbnNcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHJ1blRhc2soIG9wdGlvbnMgKSB7XHJcbiAgcGVyc2lzdGVudFF1ZXVlLnJlbW92ZVRhc2soIG9wdGlvbnMgKTtcclxuICBpZiAoIG9wdGlvbnMuZGVwbG95SW1hZ2VzICkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgZGVwbG95SW1hZ2VzKCBvcHRpb25zICk7XHJcbiAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCAnY2hpcHBlcicsICdtYXN0ZXInICk7XHJcbiAgICAgIGF3YWl0IGdpdFB1bGwoICdjaGlwcGVyJyApO1xyXG4gICAgICBhd2FpdCBnaXRDaGVja291dCggJ3BlcmVubmlhbC1hbGlhcycsICdtYXN0ZXInICk7XHJcbiAgICAgIGF3YWl0IGdpdFB1bGwoICdwZXJlbm5pYWwtYWxpYXMnICk7XHJcbiAgICAgIHdpbnN0b24uaW5mbyggJ0RlcGxveSBpbWFnZXMgY29tcGxldGVkIHN1Y2Nlc3NmdWxseS4nICk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNhdGNoKCBlICkge1xyXG4gICAgICB3aW5zdG9uLmVycm9yKCBlICk7XHJcbiAgICAgIHdpbnN0b24uZXJyb3IoICdEZXBsb3kgaW1hZ2VzIGZhaWxlZC4gU2VlIHByZXZpb3VzIGxvZ3MgZm9yIGRldGFpbHMuJyApO1xyXG4gICAgICB0aHJvdyBlO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG5cclxuICB0cnkge1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBQYXJzZSBhbmQgdmFsaWRhdGUgcGFyYW1ldGVyc1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBjb25zdCBhcGkgPSBvcHRpb25zLmFwaTtcclxuICAgIGNvbnN0IHJlcG9zID0gb3B0aW9ucy5yZXBvcztcclxuICAgIGxldCBsb2NhbGVzID0gb3B0aW9ucy5sb2NhbGVzO1xyXG4gICAgY29uc3Qgc2ltTmFtZSA9IG9wdGlvbnMuc2ltTmFtZTtcclxuICAgIGxldCB2ZXJzaW9uID0gb3B0aW9ucy52ZXJzaW9uO1xyXG4gICAgY29uc3QgZW1haWwgPSBvcHRpb25zLmVtYWlsO1xyXG4gICAgY29uc3QgYnJhbmRzID0gb3B0aW9ucy5icmFuZHM7XHJcbiAgICBjb25zdCBzZXJ2ZXJzID0gb3B0aW9ucy5zZXJ2ZXJzO1xyXG4gICAgY29uc3QgdXNlcklkID0gb3B0aW9ucy51c2VySWQ7XHJcbiAgICBsZXQgYnJhbmNoID0gb3B0aW9ucy5icmFuY2g7XHJcblxyXG4gICAgaWYgKCB1c2VySWQgKSB7XHJcbiAgICAgIHdpbnN0b24ubG9nKCAnaW5mbycsIGBzZXR0aW5nIHVzZXJJZCA9ICR7dXNlcklkfWAgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzaW1OYW1lUmVnZXggPSAvXlthLXotXSskLztcclxuXHJcbiAgICB3aW5zdG9uLmRlYnVnKCBKU09OLnN0cmluZ2lmeSggcmVwb3MgKSApO1xyXG5cclxuICAgIGlmICggYnJhbmNoID09PSBudWxsICkge1xyXG4gICAgICBicmFuY2ggPSByZXBvc1sgc2ltTmFtZSBdLmJyYW5jaDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBtYWtlIHN1cmUgdGhlIHJlcG9zIHBhc3NlZCBpbiB2YWxpZGF0ZXNcclxuICAgIGZvciAoIGNvbnN0IGtleSBpbiByZXBvcyApIHtcclxuICAgICAgaWYgKCByZXBvcy5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgKSB7XHJcbiAgICAgICAgd2luc3Rvbi5sb2coICdpbmZvJywgYFZhbGlkYXRpbmcgcmVwbzogJHtrZXl9YCApO1xyXG5cclxuICAgICAgICAvLyBtYWtlIHN1cmUgYWxsIGtleXMgaW4gcmVwb3Mgb2JqZWN0IGFyZSB2YWxpZCBzaW0gbmFtZXNcclxuICAgICAgICBpZiAoICFzaW1OYW1lUmVnZXgudGVzdCgga2V5ICkgKSB7XHJcbiAgICAgICAgICBhd2FpdCBhYm9ydEJ1aWxkKCBgaW52YWxpZCBzaW1OYW1lIGluIHJlcG9zOiAke3NpbU5hbWV9YCApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSByZXBvc1sga2V5IF07XHJcbiAgICAgICAgaWYgKCBrZXkgPT09ICdjb21tZW50JyApIHtcclxuICAgICAgICAgIGlmICggdHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyApIHtcclxuICAgICAgICAgICAgYXdhaXQgYWJvcnRCdWlsZCggJ2ludmFsaWQgY29tbWVudCBpbiByZXBvczogc2hvdWxkIGJlIGEgc3RyaW5nJyApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggdmFsdWUgaW5zdGFuY2VvZiBPYmplY3QgJiYgdmFsdWUuaGFzT3duUHJvcGVydHkoICdzaGEnICkgKSB7XHJcbiAgICAgICAgICBpZiAoICEvXlthLWYwLTldezQwfSQvLnRlc3QoIHZhbHVlLnNoYSApICkge1xyXG4gICAgICAgICAgICBhd2FpdCBhYm9ydEJ1aWxkKCBgaW52YWxpZCBzaGEgaW4gcmVwb3MuIGtleTogJHtrZXl9IHZhbHVlOiAke3ZhbHVlfSBzaGE6ICR7dmFsdWUuc2hhfWAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBhd2FpdCBhYm9ydEJ1aWxkKCBgaW52YWxpZCBpdGVtIGluIHJlcG9zLiBrZXk6ICR7a2V5fSB2YWx1ZTogJHt2YWx1ZX1gICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdmFsaWRhdGUgc2ltTmFtZVxyXG4gICAgaWYgKCAhc2ltTmFtZVJlZ2V4LnRlc3QoIHNpbU5hbWUgKSApIHtcclxuICAgICAgYXdhaXQgYWJvcnRCdWlsZCggYGludmFsaWQgc2ltTmFtZSAke3NpbU5hbWV9YCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEluZmVyIGJyYW5kIGZyb20gdmVyc2lvbiBzdHJpbmcgYW5kIGtlZXAgdW5zdHJpcHBlZCB2ZXJzaW9uIGZvciBwaGV0LWlvXHJcbiAgICBjb25zdCBvcmlnaW5hbFZlcnNpb24gPSB2ZXJzaW9uO1xyXG4gICAgaWYgKCBhcGkgPT09ICcxLjAnICkge1xyXG4gICAgICAvLyB2YWxpZGF0ZSB2ZXJzaW9uIGFuZCBzdHJpcCBzdWZmaXhlcyBzaW5jZSBqdXN0IHRoZSBudW1iZXJzIGFyZSB1c2VkIGluIHRoZSBkaXJlY3RvcnkgbmFtZSBvbiBkZXYgYW5kIHByb2R1Y3Rpb24gc2VydmVyc1xyXG4gICAgICBjb25zdCB2ZXJzaW9uTWF0Y2ggPSB2ZXJzaW9uLm1hdGNoKCAvXihcXGQrXFwuXFxkK1xcLlxcZCspKD86LS4qKT8kLyApO1xyXG4gICAgICBpZiAoIHZlcnNpb25NYXRjaCAmJiB2ZXJzaW9uTWF0Y2gubGVuZ3RoID09PSAyICkge1xyXG5cclxuICAgICAgICBpZiAoIHNlcnZlcnMuaW5jbHVkZXMoICdkZXYnICkgKSB7XHJcbiAgICAgICAgICAvLyBpZiBkZXBsb3lpbmcgYW4gcmMgdmVyc2lvbiB1c2UgdGhlIC1yYy5bbnVtYmVyXSBzdWZmaXhcclxuICAgICAgICAgIHZlcnNpb24gPSB2ZXJzaW9uTWF0Y2hbIDAgXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAvLyBvdGhlcndpc2Ugc3RyaXAgYW55IHN1ZmZpeFxyXG4gICAgICAgICAgdmVyc2lvbiA9IHZlcnNpb25NYXRjaFsgMSBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5zdG9uLmxvZyggJ2luZm8nLCBgZGV0ZWN0aW5nIHZlcnNpb24gbnVtYmVyOiAke3ZlcnNpb259YCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGF3YWl0IGFib3J0QnVpbGQoIGBpbnZhbGlkIHZlcnNpb24gbnVtYmVyOiAke3ZlcnNpb259YCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc2ltRGlyID0gYC4uLyR7c2ltTmFtZX1gO1xyXG4gICAgd2luc3Rvbi5sb2coICdpbmZvJywgYGJ1aWxkaW5nIHNpbSAke3NpbU5hbWV9YCApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgdGVtcG9yYXJ5IGJ1aWxkIGRpciwgcmVtb3ZpbmcgdGhlIGV4aXN0aW5nIGRpciBpZiBpdCBleGlzdHMuXHJcbiAgICBpZiAoIGZzLmV4aXN0c1N5bmMoIGJ1aWxkRGlyICkgKSB7XHJcbiAgICAgIGF3YWl0IGV4ZWN1dGUoICdybScsIFsgJy1yZicsIGJ1aWxkRGlyIF0sICcuJyApO1xyXG4gICAgfVxyXG4gICAgYXdhaXQgZnMucHJvbWlzZXMubWtkaXIoIGJ1aWxkRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9ICk7XHJcblxyXG5cclxuICAgIGF3YWl0IHdyaXRlRmlsZSggYCR7YnVpbGREaXJ9L2RlcGVuZGVuY2llcy5qc29uYCwgSlNPTi5zdHJpbmdpZnkoIHJlcG9zICkgKTtcclxuICAgIHdpbnN0b24ubG9nKCAnaW5mbycsIGB3cm90ZSBmaWxlICR7YnVpbGREaXJ9L2RlcGVuZGVuY2llcy5qc29uYCApO1xyXG5cclxuICAgIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbICdwdWxsJyBdLCBjb25zdGFudHMuUEVSRU5OSUFMICk7XHJcbiAgICBhd2FpdCBleGVjdXRlKCAnbnBtJywgWyAncHJ1bmUnIF0sIGNvbnN0YW50cy5QRVJFTk5JQUwgKTtcclxuICAgIGF3YWl0IGV4ZWN1dGUoICducG0nLCBbICd1cGRhdGUnIF0sIGNvbnN0YW50cy5QRVJFTk5JQUwgKTtcclxuICAgIGF3YWl0IGV4ZWN1dGUoICcuL3BlcmVubmlhbC9iaW4vY2xvbmUtbWlzc2luZy1yZXBvcy5zaCcsIFtdLCAnLi4nICk7XHJcbiAgICBhd2FpdCBwdWxsTWFzdGVyKCByZXBvcyApO1xyXG4gICAgYXdhaXQgZXhlY3V0ZSggJ2dydW50JywgWyAnY2hlY2tvdXQtc2hhcycsICctLWJ1aWxkU2VydmVyPXRydWUnLCBgLS1yZXBvPSR7c2ltTmFtZX1gIF0sIGNvbnN0YW50cy5QRVJFTk5JQUwgKTtcclxuICAgIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbICdjaGVja291dCcsIHJlcG9zWyBzaW1OYW1lIF0uc2hhIF0sIHNpbURpciApO1xyXG4gICAgYXdhaXQgZXhlY3V0ZSggJ25wbScsIFsgJ3BydW5lJyBdLCAnLi4vY2hpcHBlcicgKTtcclxuICAgIGF3YWl0IGV4ZWN1dGUoICducG0nLCBbICd1cGRhdGUnIF0sICcuLi9jaGlwcGVyJyApO1xyXG4gICAgYXdhaXQgZXhlY3V0ZSggJ25wbScsIFsgJ3BydW5lJyBdLCAnLi4vcGVyZW5uaWFsLWFsaWFzJyApO1xyXG4gICAgYXdhaXQgZXhlY3V0ZSggJ25wbScsIFsgJ3VwZGF0ZScgXSwgJy4uL3BlcmVubmlhbC1hbGlhcycgKTtcclxuICAgIGF3YWl0IGV4ZWN1dGUoICducG0nLCBbICdwcnVuZScgXSwgc2ltRGlyICk7XHJcbiAgICBhd2FpdCBleGVjdXRlKCAnbnBtJywgWyAndXBkYXRlJyBdLCBzaW1EaXIgKTtcclxuXHJcbiAgICBpZiAoIGFwaSA9PT0gJzEuMCcgKSB7XHJcbiAgICAgIGxvY2FsZXMgPSBhd2FpdCBnZXRMb2NhbGVzKCBsb2NhbGVzLCBzaW1OYW1lICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYnJhbmRMb2NhbGVzID0gKCBicmFuZHMuaW5kZXhPZiggY29uc3RhbnRzLlBIRVRfQlJBTkQgKSA+PSAwICkgPyBsb2NhbGVzIDogJ2VuJztcclxuICAgIHdpbnN0b24ubG9nKCAnaW5mbycsIGBidWlsZGluZyBmb3IgYnJhbmRzOiAke2JyYW5kc30gdmVyc2lvbjogJHt2ZXJzaW9ufWAgKTtcclxuXHJcbiAgICBjb25zdCBjaGlwcGVyVmVyc2lvbiA9IENoaXBwZXJWZXJzaW9uLmdldEZyb21SZXBvc2l0b3J5KCk7XHJcbiAgICB3aW5zdG9uLmRlYnVnKCBgQ2hpcHBlciB2ZXJzaW9uIGRldGVjdGVkOiAke2NoaXBwZXJWZXJzaW9uLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIGlmICggY2hpcHBlclZlcnNpb24ubWFqb3IgPT09IDIgJiYgY2hpcHBlclZlcnNpb24ubWlub3IgPT09IDAgKSB7XHJcbiAgICAgIGF3YWl0IGV4ZWN1dGUoICdncnVudCcsIFsgJy0tYWxsSFRNTCcsICctLWRlYnVnSFRNTCcsIGAtLWJyYW5kcz0ke2JyYW5kcy5qb2luKCAnLCcgKX1gLCBgLS1sb2NhbGVzPSR7YnJhbmRMb2NhbGVzfWAgXSwgc2ltRGlyICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggY2hpcHBlclZlcnNpb24ubWFqb3IgPT09IDAgJiYgY2hpcHBlclZlcnNpb24ubWlub3IgPT09IDAgKSB7XHJcbiAgICAgIGNvbnN0IGFyZ3MgPSBbICdidWlsZC1mb3Itc2VydmVyJywgYC0tYnJhbmQ9JHticmFuZHNbIDAgXX1gLCBgLS1sb2NhbGVzPSR7YnJhbmRMb2NhbGVzfWAgXTtcclxuICAgICAgaWYgKCBicmFuZHNbIDAgXSA9PT0gY29uc3RhbnRzLlBIRVRfQlJBTkQgKSB7XHJcbiAgICAgICAgYXJncy5wdXNoKCAnLS1hbGxIVE1MJyApO1xyXG4gICAgICB9XHJcbiAgICAgIGF3YWl0IGV4ZWN1dGUoICdncnVudCcsIGFyZ3MsIHNpbURpciApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGF3YWl0IGFib3J0QnVpbGQoICdVbnN1cHBvcnRlZCBjaGlwcGVyIHZlcnNpb24nICk7XHJcbiAgICB9XHJcblxyXG4gICAgd2luc3Rvbi5kZWJ1ZyggYGRlcGxveWluZyB0byBzZXJ2ZXJzOiAke0pTT04uc3RyaW5naWZ5KCBzZXJ2ZXJzICl9YCApO1xyXG5cclxuICAgIGlmICggc2VydmVycy5pbmRleE9mKCBjb25zdGFudHMuREVWX1NFUlZFUiApID49IDAgKSB7XHJcbiAgICAgIHdpbnN0b24uaW5mbyggJ2RlcGxveWluZyB0byBkZXYnICk7XHJcbiAgICAgIGlmICggYnJhbmRzLmluZGV4T2YoIGNvbnN0YW50cy5QSEVUX0lPX0JSQU5EICkgPj0gMCApIHtcclxuICAgICAgICBjb25zdCBodGFjY2Vzc0xvY2F0aW9uID0gKCBjaGlwcGVyVmVyc2lvbi5tYWpvciA9PT0gMiAmJiBjaGlwcGVyVmVyc2lvbi5taW5vciA9PT0gMCApID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7c2ltRGlyfS9idWlsZC9waGV0LWlvYCA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke3NpbURpcn0vYnVpbGRgO1xyXG4gICAgICAgIGF3YWl0IHdyaXRlUGhldGlvSHRhY2Nlc3MoIGh0YWNjZXNzTG9jYXRpb24gKTtcclxuICAgICAgfVxyXG4gICAgICBhd2FpdCBkZXZEZXBsb3koIHNpbURpciwgc2ltTmFtZSwgdmVyc2lvbiwgY2hpcHBlclZlcnNpb24sIGJyYW5kcyApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxvY2FsZXNBcnJheSA9IHR5cGVvZiAoIGxvY2FsZXMgKSA9PT0gJ3N0cmluZycgPyBsb2NhbGVzLnNwbGl0KCAnLCcgKSA6IGxvY2FsZXM7XHJcblxyXG4gICAgLy8gaWYgdGhpcyBidWlsZCByZXF1ZXN0IGNvbWVzIGZyb20gcm9zZXR0YSBpdCB3aWxsIGhhdmUgYSB1c2VySWQgZmllbGQgYW5kIG9ubHkgb25lIGxvY2FsZVxyXG4gICAgY29uc3QgaXNUcmFuc2xhdGlvblJlcXVlc3QgPSB1c2VySWQgJiYgbG9jYWxlc0FycmF5Lmxlbmd0aCA9PT0gMSAmJiBsb2NhbGVzQXJyYXlbIDAgXSAhPT0gJyonO1xyXG5cclxuICAgIGlmICggc2VydmVycy5pbmRleE9mKCBjb25zdGFudHMuUFJPRFVDVElPTl9TRVJWRVIgKSA+PSAwICkge1xyXG4gICAgICB3aW5zdG9uLmluZm8oICdkZXBsb3lpbmcgdG8gcHJvZHVjdGlvbicgKTtcclxuICAgICAgbGV0IHRhcmdldFZlcnNpb25EaXI7XHJcbiAgICAgIGxldCB0YXJnZXRTaW1EaXI7XHJcbiAgICAgIC8vIExvb3Agb3ZlciBhbGwgYnJhbmRzXHJcbiAgICAgIGZvciAoIGNvbnN0IGkgaW4gYnJhbmRzICkge1xyXG4gICAgICAgIGlmICggYnJhbmRzLmhhc093blByb3BlcnR5KCBpICkgKSB7XHJcbiAgICAgICAgICBjb25zdCBicmFuZCA9IGJyYW5kc1sgaSBdO1xyXG4gICAgICAgICAgd2luc3Rvbi5pbmZvKCBgZGVwbG95aW5nIGJyYW5kOiAke2JyYW5kfWAgKTtcclxuXHJcbiAgICAgICAgICAvLyBQcmUtY29weSBzdGVwc1xyXG4gICAgICAgICAgaWYgKCBicmFuZCA9PT0gY29uc3RhbnRzLlBIRVRfQlJBTkQgKSB7XHJcbiAgICAgICAgICAgIHRhcmdldFNpbURpciA9IGNvbnN0YW50cy5IVE1MX1NJTVNfRElSRUNUT1JZICsgc2ltTmFtZTtcclxuICAgICAgICAgICAgdGFyZ2V0VmVyc2lvbkRpciA9IGAke3RhcmdldFNpbURpcn0vJHt2ZXJzaW9ufS9gO1xyXG5cclxuICAgICAgICAgICAgaWYgKCBjaGlwcGVyVmVyc2lvbi5tYWpvciA9PT0gMiAmJiBjaGlwcGVyVmVyc2lvbi5taW5vciA9PT0gMCApIHtcclxuICAgICAgICAgICAgICAvLyBSZW1vdmUgX3BoZXQgZnJvbSBhbGwgZmlsZW5hbWVzIGluIHRoZSBwaGV0IGRpcmVjdG9yeVxyXG4gICAgICAgICAgICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoIGAke3NpbURpcn0vYnVpbGQvcGhldGAgKTtcclxuICAgICAgICAgICAgICBmb3IgKCBjb25zdCBpIGluIGZpbGVzICkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCBmaWxlcy5oYXNPd25Qcm9wZXJ0eSggaSApICkge1xyXG4gICAgICAgICAgICAgICAgICBjb25zdCBmaWxlbmFtZSA9IGZpbGVzWyBpIF07XHJcbiAgICAgICAgICAgICAgICAgIGlmICggZmlsZW5hbWUuaW5kZXhPZiggJ19waGV0JyApID49IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3RmlsZW5hbWUgPSBmaWxlbmFtZS5yZXBsYWNlKCAnX3BoZXQnLCAnJyApO1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGV4ZWN1dGUoICdtdicsIFsgZmlsZW5hbWUsIG5ld0ZpbGVuYW1lIF0sIGAke3NpbURpcn0vYnVpbGQvcGhldGAgKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoIGJyYW5kID09PSBjb25zdGFudHMuUEhFVF9JT19CUkFORCApIHtcclxuICAgICAgICAgICAgdGFyZ2V0U2ltRGlyID0gY29uc3RhbnRzLlBIRVRfSU9fU0lNU19ESVJFQ1RPUlkgKyBzaW1OYW1lO1xyXG4gICAgICAgICAgICB0YXJnZXRWZXJzaW9uRGlyID0gYCR7dGFyZ2V0U2ltRGlyfS8ke29yaWdpbmFsVmVyc2lvbn1gO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hpcHBlciAxLjAgaGFzIC1waGV0aW8gaW4gdGhlIHZlcnNpb24gc2NoZW1hIGZvciBQaEVULWlPIGJyYW5kZWQgc2ltc1xyXG4gICAgICAgICAgICBpZiAoIGNoaXBwZXJWZXJzaW9uLm1ham9yID09PSAwICYmICFvcmlnaW5hbFZlcnNpb24ubWF0Y2goICctcGhldGlvJyApICkge1xyXG4gICAgICAgICAgICAgIHRhcmdldFZlcnNpb25EaXIgKz0gJy1waGV0aW8nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRhcmdldFZlcnNpb25EaXIgKz0gJy8nO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIENvcHkgc3RlcHMgLSBhbGxvdyBFRVhJU1QgZXJyb3JzIGJ1dCByZWplY3QgYW55dGhpbmcgZWxzZVxyXG4gICAgICAgICAgd2luc3Rvbi5kZWJ1ZyggYENyZWF0aW5nIHZlcnNpb24gZGlyOiAke3RhcmdldFZlcnNpb25EaXJ9YCApO1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYXdhaXQgZnMucHJvbWlzZXMubWtkaXIoIHRhcmdldFZlcnNpb25EaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0gKTtcclxuICAgICAgICAgICAgd2luc3Rvbi5kZWJ1ZyggJ1N1Y2Nlc3MgY3JlYXRpbmcgc2ltIGRpcicgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNhdGNoKCBlcnIgKSB7XHJcbiAgICAgICAgICAgIGlmICggZXJyLmNvZGUgIT09ICdFRVhJU1QnICkge1xyXG4gICAgICAgICAgICAgIHdpbnN0b24uZXJyb3IoICdGYWlsdXJlIGNyZWF0aW5nIHZlcnNpb24gZGlyJyApO1xyXG4gICAgICAgICAgICAgIHdpbnN0b24uZXJyb3IoIGVyciApO1xyXG4gICAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGxldCBzb3VyY2VEaXIgPSBgJHtzaW1EaXJ9L2J1aWxkYDtcclxuICAgICAgICAgIGlmICggY2hpcHBlclZlcnNpb24ubWFqb3IgPT09IDIgJiYgY2hpcHBlclZlcnNpb24ubWlub3IgPT09IDAgKSB7XHJcbiAgICAgICAgICAgIHNvdXJjZURpciArPSBgLyR7YnJhbmR9YDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcclxuICAgICAgICAgICAgd2luc3Rvbi5kZWJ1ZyggYENvcHlpbmcgcmVjdXJzaXZlICR7c291cmNlRGlyfSB0byAke3RhcmdldFZlcnNpb25EaXJ9YCApO1xyXG4gICAgICAgICAgICBuZXcgcnN5bmMoKVxyXG4gICAgICAgICAgICAgIC5mbGFncyggJ3JhenBPJyApXHJcbiAgICAgICAgICAgICAgLnNldCggJ25vLXBlcm1zJyApXHJcbiAgICAgICAgICAgICAgLnNldCggJ2V4Y2x1ZGUnLCAnLnJzeW5jLWZpbHRlcicgKVxyXG4gICAgICAgICAgICAgIC5zb3VyY2UoIGAke3NvdXJjZURpcn0vYCApXHJcbiAgICAgICAgICAgICAgLmRlc3RpbmF0aW9uKCB0YXJnZXRWZXJzaW9uRGlyIClcclxuICAgICAgICAgICAgICAub3V0cHV0KCBzdGRvdXQgPT4geyB3aW5zdG9uLmRlYnVnKCBzdGRvdXQudG9TdHJpbmcoKSApOyB9LFxyXG4gICAgICAgICAgICAgICAgc3RkZXJyID0+IHsgd2luc3Rvbi5lcnJvciggc3RkZXJyLnRvU3RyaW5nKCkgKTsgfSApXHJcbiAgICAgICAgICAgICAgLmV4ZWN1dGUoICggZXJyLCBjb2RlLCBjbWQgKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIGVyciAmJiBjb2RlICE9PSAyMyApIHtcclxuICAgICAgICAgICAgICAgICAgd2luc3Rvbi5kZWJ1ZyggY29kZSApO1xyXG4gICAgICAgICAgICAgICAgICB3aW5zdG9uLmRlYnVnKCBjbWQgKTtcclxuICAgICAgICAgICAgICAgICAgcmVqZWN0KCBlcnIgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgeyByZXNvbHZlKCk7IH1cclxuICAgICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgICAgd2luc3Rvbi5kZWJ1ZyggJ0NvcHkgZmluaXNoZWQnICk7XHJcblxyXG4gICAgICAgICAgLy8gUG9zdC1jb3B5IHN0ZXBzXHJcbiAgICAgICAgICBpZiAoIGJyYW5kID09PSBjb25zdGFudHMuUEhFVF9CUkFORCApIHtcclxuICAgICAgICAgICAgYXdhaXQgd3JpdGVQaGV0SHRhY2Nlc3MoIHNpbU5hbWUsIHZlcnNpb24gKTtcclxuICAgICAgICAgICAgYXdhaXQgY3JlYXRlVHJhbnNsYXRpb25zWE1MKCBzaW1OYW1lLCB2ZXJzaW9uICk7XHJcbiAgICAgICAgICAgIGF3YWl0IG5vdGlmeVNlcnZlcigge1xyXG4gICAgICAgICAgICAgIHNpbU5hbWU6IHNpbU5hbWUsXHJcbiAgICAgICAgICAgICAgZW1haWw6IGVtYWlsLFxyXG4gICAgICAgICAgICAgIGJyYW5kOiBicmFuZCxcclxuICAgICAgICAgICAgICBsb2NhbGVzOiBsb2NhbGVzLFxyXG4gICAgICAgICAgICAgIHRyYW5zbGF0b3JJZDogaXNUcmFuc2xhdGlvblJlcXVlc3QgPyB1c2VySWQgOiB1bmRlZmluZWRcclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoIGJyYW5kID09PSBjb25zdGFudHMuUEhFVF9JT19CUkFORCApIHtcclxuICAgICAgICAgICAgY29uc3Qgc3VmZml4ID0gb3JpZ2luYWxWZXJzaW9uLnNwbGl0KCAnLScgKS5sZW5ndGggPj0gMiA/IG9yaWdpbmFsVmVyc2lvbi5zcGxpdCggJy0nIClbIDEgXSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICggY2hpcHBlclZlcnNpb24ubWFqb3IgPCAyID8gJ3BoZXRpbycgOiAnJyApO1xyXG4gICAgICAgICAgICBjb25zdCBwYXJzZWRWZXJzaW9uID0gU2ltVmVyc2lvbi5wYXJzZSggdmVyc2lvbiwgJycgKTtcclxuICAgICAgICAgICAgY29uc3Qgc2ltUGFja2FnZSA9IEpTT04ucGFyc2UoIGZzLnJlYWRGaWxlU3luYyggYCR7c2ltRGlyfS9wYWNrYWdlLmpzb25gICkgKTtcclxuICAgICAgICAgICAgY29uc3QgaWdub3JlRm9yQXV0b21hdGVkTWFpbnRlbmFuY2VSZWxlYXNlcyA9ICEhKCBzaW1QYWNrYWdlICYmIHNpbVBhY2thZ2UucGhldCAmJiBzaW1QYWNrYWdlLnBoZXQuaWdub3JlRm9yQXV0b21hdGVkTWFpbnRlbmFuY2VSZWxlYXNlcyApO1xyXG4gICAgICAgICAgICBhd2FpdCBub3RpZnlTZXJ2ZXIoIHtcclxuICAgICAgICAgICAgICBzaW1OYW1lOiBzaW1OYW1lLFxyXG4gICAgICAgICAgICAgIGVtYWlsOiBlbWFpbCxcclxuICAgICAgICAgICAgICBicmFuZDogYnJhbmQsXHJcbiAgICAgICAgICAgICAgcGhldGlvT3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgYnJhbmNoOiBicmFuY2gsXHJcbiAgICAgICAgICAgICAgICBzdWZmaXg6IHN1ZmZpeCxcclxuICAgICAgICAgICAgICAgIHZlcnNpb246IHBhcnNlZFZlcnNpb24sXHJcbiAgICAgICAgICAgICAgICBpZ25vcmVGb3JBdXRvbWF0ZWRNYWludGVuYW5jZVJlbGVhc2VzOiBpZ25vcmVGb3JBdXRvbWF0ZWRNYWludGVuYW5jZVJlbGVhc2VzXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgICAgICB3aW5zdG9uLmRlYnVnKCAnc2VydmVyIG5vdGlmaWVkJyApO1xyXG4gICAgICAgICAgICBhd2FpdCB3cml0ZVBoZXRpb0h0YWNjZXNzKCB0YXJnZXRWZXJzaW9uRGlyLCB7XHJcbiAgICAgICAgICAgICAgc2ltTmFtZTogc2ltTmFtZSxcclxuICAgICAgICAgICAgICB2ZXJzaW9uOiBvcmlnaW5hbFZlcnNpb24sXHJcbiAgICAgICAgICAgICAgZGlyZWN0b3J5OiBjb25zdGFudHMuUEhFVF9JT19TSU1TX0RJUkVDVE9SWVxyXG4gICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoICFpc1RyYW5zbGF0aW9uUmVxdWVzdCApIHtcclxuICAgICAgICBhd2FpdCBkZXBsb3lJbWFnZXMoIHtcclxuICAgICAgICAgIGJyYW5jaDogJ21hc3RlcicsIC8vIGNoaXBwZXIgYnJhbmNoLCBhbHdheXMgZGVwbG95IGltYWdlcyBmcm9tIG1hc3RlclxyXG4gICAgICAgICAgc2ltdWxhdGlvbjogb3B0aW9ucy5zaW1OYW1lLFxyXG4gICAgICAgICAgYnJhbmRzOiBvcHRpb25zLmJyYW5kcyxcclxuICAgICAgICAgIHZlcnNpb246IG9wdGlvbnMudmVyc2lvblxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBjYXRjaCggZXJyICkge1xyXG4gICAgYXdhaXQgYWJvcnRCdWlsZCggZXJyICk7XHJcbiAgfVxyXG5cclxuICBhd2FpdCBhZnRlckRlcGxveSgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRhc2tXb3JrZXIoIHRhc2ssIHRhc2tDYWxsYmFjayApIHtcclxuICBydW5UYXNrKCB0YXNrIClcclxuICAgIC50aGVuKCAoKSA9PiB7XHJcbiAgICAgICAgdGFza0NhbGxiYWNrKCk7XHJcbiAgICAgIH1cclxuICAgICkuY2F0Y2goIHJlYXNvbiA9PiB7XHJcbiAgICB0YXNrQ2FsbGJhY2soIHJlYXNvbiApO1xyXG4gIH0gKTtcclxufTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUdBLE1BQU1BLGNBQWMsR0FBR0MsT0FBTyxDQUFFLDBCQUEyQixDQUFDO0FBQzVELE1BQU1DLFNBQVMsR0FBR0QsT0FBTyxDQUFFLGFBQWMsQ0FBQztBQUMxQyxNQUFNRSxxQkFBcUIsR0FBR0YsT0FBTyxDQUFFLHlCQUEwQixDQUFDO0FBQ2xFLE1BQU1HLFNBQVMsR0FBR0gsT0FBTyxDQUFFLGFBQWMsQ0FBQztBQUMxQyxNQUFNSSxPQUFPLEdBQUdKLE9BQU8sQ0FBRSxtQkFBb0IsQ0FBQztBQUM5QyxNQUFNSyxFQUFFLEdBQUdMLE9BQU8sQ0FBRSxJQUFLLENBQUM7QUFDMUIsTUFBTU0sV0FBVyxHQUFHTixPQUFPLENBQUUsdUJBQXdCLENBQUM7QUFDdEQsTUFBTU8sT0FBTyxHQUFHUCxPQUFPLENBQUUsbUJBQW9CLENBQUM7QUFDOUMsTUFBTVEsVUFBVSxHQUFHUixPQUFPLENBQUUsY0FBZSxDQUFDO0FBQzVDLE1BQU1TLFlBQVksR0FBR1QsT0FBTyxDQUFFLGdCQUFpQixDQUFDO0FBQ2hELE1BQU1VLFVBQVUsR0FBR1YsT0FBTyxDQUFFLGNBQWUsQ0FBQztBQUM1QyxNQUFNVyxLQUFLLEdBQUdYLE9BQU8sQ0FBRSxPQUFRLENBQUM7QUFDaEMsTUFBTVksVUFBVSxHQUFHWixPQUFPLENBQUUsc0JBQXVCLENBQUM7QUFDcEQsTUFBTWEsT0FBTyxHQUFHYixPQUFPLENBQUUsU0FBVSxD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