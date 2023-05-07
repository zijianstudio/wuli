// Copyright 2017-2019, University of Colorado Boulder

/**
 * Deploys a decaf simulation after incrementing the test version number.  This file ported from dev.js
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

const assert = require('assert');
const SimVersion = require('../../common/SimVersion');
const buildLocal = require('../../common/buildLocal');
const devDirectoryExists = require('../../common/devDirectoryExists');
const devScp = require('../../common/devScp');
const devSsh = require('../../common/devSsh');
const getBranch = require('../../common/getBranch');
const getRemoteBranchSHAs = require('../../common/getRemoteBranchSHAs');
const gitIsClean = require('../../common/gitIsClean');
const gitRevParse = require('../../common/gitRevParse');
const loadJSON = require('../../common/loadJSON');
const vpnCheck = require('../../common/vpnCheck');
const grunt = require('grunt');
const _ = require('lodash'); // eslint-disable-line no-unused-vars
const fs = require('fs');

// constants
const BUILD_LOCAL_FILENAME = `${process.env.HOME}/.phet/build-local.json`;

/**
 * Deploys a dev version after incrementing the test version number.
 * @public
 *
 * @param {string} project
 * @param {boolean} dev
 * @param {boolean} production
 * @returns {Promise}
 */
module.exports = async function (project, dev, production) {
  const buildLocalJSON = JSON.parse(fs.readFileSync(BUILD_LOCAL_FILENAME, {
    encoding: 'utf-8'
  }));
  const gitRoot = buildLocalJSON.gitRoot;
  const trunkPath = buildLocalJSON.decafTrunkPath;
  assert && assert(gitRoot !== undefined, 'buildLocal.gitRoot is undefined');
  assert && assert(trunkPath !== undefined, 'buildLocal.decafTrunkPath is undefined');
  const stringFiles = fs.readdirSync(`${trunkPath}/simulations-java/simulations/${project}/data/${project}/localization`);
  const locales = stringFiles.filter(stringFile => stringFile.indexOf('_') >= 0).map(file => file.substring(file.indexOf('_') + 1, file.lastIndexOf('.')));
  console.log(locales.join('\n'));

  // Output the flavors and locales
  const javaProperties = fs.readFileSync(`${trunkPath}/simulations-java/simulations/${project}/${project}-build.properties`, 'utf-8');
  // console.log(javaProperties);

  // like  project.flavor.moving-man.mainclass=edu.colorado.phet.movingman.MovingManApplication

  const flavorLines = javaProperties.split('\n').filter(line => line.startsWith('project.flavor'));
  const flavors = flavorLines.length > 0 ? flavorLines.map(line => line.split('.')[2]) : [`${project}`];
  console.log(flavors.join('\n'));
  if (!(await vpnCheck())) {
    grunt.fail.fatal('VPN or being on campus is required for this build. Ensure VPN is enabled, or that you have access to phet-server2.int.colorado.edu');
  }
  const currentBranch = await getBranch('decaf');
  if (currentBranch !== 'master') {
    grunt.fail.fatal(`deployment should be on the branch master, not: ${currentBranch ? currentBranch : '(detached head)'}`);
  }
  const packageFileRelative = `projects/${project}/package.json`;
  const packageFile = `../decaf/${packageFileRelative}`;
  const packageObject = await loadJSON(packageFile);
  const version = SimVersion.parse(packageObject.version);
  const isClean = await gitIsClean('decaf');
  if (!isClean) {
    throw new Error(`Unclean status in ${project}, cannot deploy`);
  }
  const currentSHA = await gitRevParse('decaf', 'HEAD');
  const latestSHA = (await getRemoteBranchSHAs('decaf')).master;
  if (currentSHA !== latestSHA) {
    // See https://github.com/phetsims/chipper/issues/699
    grunt.fail.fatal(`Out of date with remote, please push or pull repo. Current SHA: ${currentSHA}, latest SHA: ${latestSHA}`);
  }
  const versionString = version.toString();

  // await gitAdd( 'decaf', packageFileRelative );
  // await gitCommit( 'decaf', `Bumping version to ${version.toString()}` );
  // await gitPush( 'decaf', 'master' );

  // Create (and fix permissions for) the main simulation directory, if it didn't already exist
  if (dev) {
    const simPath = buildLocal.decafDeployPath + project;
    const versionPath = `${simPath}/${versionString}`;
    const simPathExists = await devDirectoryExists(simPath);
    const versionPathExists = await devDirectoryExists(versionPath);
    if (versionPathExists) {
      grunt.fail.fatal(`Directory ${versionPath} already exists.  If you intend to replace the content then remove the directory manually from ${buildLocal.devDeployServer}.`);
    }
    if (!simPathExists) {
      await devSsh(`mkdir -p "${simPath}" && echo "IndexOrderDefault Descending Date\n" > "${simPath}/.htaccess"`);
    }

    // Create the version-specific directory
    await devSsh(`mkdir -p "${versionPath}"`);

    // Copy the build contents into the version-specific directory
    console.log(`../decaf/projects/${project}`);
    console.log(`${versionPath}/`);
    await devScp(`../decaf/projects/${project}/build/${project}_all.jar`, `${versionPath}/`);
    await devScp(`../decaf/projects/${project}/build/${project}_all.jar.js`, `${versionPath}/`);
    await devScp(`../decaf/projects/${project}/build/${project}.html`, `${versionPath}/`);
    await devScp(`../decaf/projects/${project}/build/splash.gif`, `${versionPath}/`);
    await devScp(`../decaf/projects/${project}/build/style.css`, `${versionPath}/`);
    await devScp(`../decaf/projects/${project}/build/dependencies.json`, `${versionPath}/`);
    await devScp(`../decaf/projects/${project}/build/locales.txt`, `${versionPath}/`);
    await devScp(`../decaf/projects/${project}/build/simulations.txt`, `${versionPath}/`);
    const versionURL = `https://phet-dev.colorado.edu/decaf/${project}/${versionString}`;
    console.log('DEPLOYED');
    if (!fs.existsSync(`${gitRoot}/decaf/build/log.txt`)) {
      fs.mkdirSync(`${gitRoot}/decaf/build`);
    }
    flavors.forEach(flavor => {
      const url = `${versionURL}/${project}.html?simulation=${flavor}`;
      grunt.log.writeln(url);
      fs.appendFileSync(`${gitRoot}/decaf/build/log.txt`, `${url}\n`);
    });
    if (flavors.length === 0) {
      const URL = `${versionURL}/${project}.html`;
      grunt.log.writeln(URL);
      fs.appendFileSync(`${gitRoot}/decaf/build/log.txt`, `${URL}\n`);
    }
  }
  console.log('FLAVORS');
  console.log(flavors.join(', '));
  console.log('LOCALES');
  console.log(locales.join(', '));
  if (production) {
    const productionServerURL = buildLocal.productionServerURL || 'https://phet.colorado.edu';
    // await devSsh( `mkdir -p "/data/web/static/phetsims/sims/cheerpj/${project}"` );
    const template = `cd /data/web/static/phetsims/sims/cheerpj/
sudo -u phet-admin mkdir -p ${project}
cd ${project}
sudo -u phet-admin scp -r bayes.colorado.edu:/data/web/htdocs/dev/decaf/${project}/${version} .

sudo chmod g+w *
printf "RewriteEngine on\\nRewriteBase /sims/cheerpj/${project}/\\nRewriteRule ^latest(.*) ${version}\\$1\\nHeader set Access-Control-Allow-Origin \\"*\\"\\n" > .htaccess

cd ${version}
sudo chmod g+w *

token=$(grep serverToken ~/.phet/build-local.json | sed -r 's/ *"serverToken": "(.*)",/\\1/') && \\
curl -u "token:$\{token}" '${productionServerURL}/services/deploy-cheerpj?project=${project}&version=${version}&locales=${locales.join(',')}&simulations=${flavors.join(',')}'
`;
    console.log('SERVER SCRIPT TO PROMOTE DEV VERSION TO PRODUCTION VERSION');
    console.log(template);
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3NlcnQiLCJyZXF1aXJlIiwiU2ltVmVyc2lvbiIsImJ1aWxkTG9jYWwiLCJkZXZEaXJlY3RvcnlFeGlzdHMiLCJkZXZTY3AiLCJkZXZTc2giLCJnZXRCcmFuY2giLCJnZXRSZW1vdGVCcmFuY2hTSEFzIiwiZ2l0SXNDbGVhbiIsImdpdFJldlBhcnNlIiwibG9hZEpTT04iLCJ2cG5DaGVjayIsImdydW50IiwiXyIsImZzIiwiQlVJTERfTE9DQUxfRklMRU5BTUUiLCJwcm9jZXNzIiwiZW52IiwiSE9NRSIsIm1vZHVsZSIsImV4cG9ydHMiLCJwcm9qZWN0IiwiZGV2IiwicHJvZHVjdGlvbiIsImJ1aWxkTG9jYWxKU09OIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwiZW5jb2RpbmciLCJnaXRSb290IiwidHJ1bmtQYXRoIiwiZGVjYWZUcnVua1BhdGgiLCJ1bmRlZmluZWQiLCJzdHJpbmdGaWxlcyIsInJlYWRkaXJTeW5jIiwibG9jYWxlcyIsImZpbHRlciIsInN0cmluZ0ZpbGUiLCJpbmRleE9mIiwibWFwIiwiZmlsZSIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiY29uc29sZSIsImxvZyIsImpvaW4iLCJqYXZhUHJvcGVydGllcyIsImZsYXZvckxpbmVzIiwic3BsaXQiLCJsaW5lIiwic3RhcnRzV2l0aCIsImZsYXZvcnMiLCJsZW5ndGgiLCJmYWlsIiwiZmF0YWwiLCJjdXJyZW50QnJhbmNoIiwicGFja2FnZUZpbGVSZWxhdGl2ZSIsInBhY2thZ2VGaWxlIiwicGFja2FnZU9iamVjdCIsInZlcnNpb24iLCJpc0NsZWFuIiwiRXJyb3IiLCJjdXJyZW50U0hBIiwibGF0ZXN0U0hBIiwibWFzdGVyIiwidmVyc2lvblN0cmluZyIsInRvU3RyaW5nIiwic2ltUGF0aCIsImRlY2FmRGVwbG95UGF0aCIsInZlcnNpb25QYXRoIiwic2ltUGF0aEV4aXN0cyIsInZlcnNpb25QYXRoRXhpc3RzIiwiZGV2RGVwbG95U2VydmVyIiwidmVyc2lvblVSTCIsImV4aXN0c1N5bmMiLCJta2RpclN5bmMiLCJmb3JFYWNoIiwiZmxhdm9yIiwidXJsIiwid3JpdGVsbiIsImFwcGVuZEZpbGVTeW5jIiwiVVJMIiwicHJvZHVjdGlvblNlcnZlclVSTCIsInRlbXBsYXRlIl0sInNvdXJjZXMiOlsiZGVwbG95RGVjYWYuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAxOSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGVwbG95cyBhIGRlY2FmIHNpbXVsYXRpb24gYWZ0ZXIgaW5jcmVtZW50aW5nIHRoZSB0ZXN0IHZlcnNpb24gbnVtYmVyLiAgVGhpcyBmaWxlIHBvcnRlZCBmcm9tIGRldi5qc1xyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcblxyXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xyXG5jb25zdCBTaW1WZXJzaW9uID0gcmVxdWlyZSggJy4uLy4uL2NvbW1vbi9TaW1WZXJzaW9uJyApO1xyXG5jb25zdCBidWlsZExvY2FsID0gcmVxdWlyZSggJy4uLy4uL2NvbW1vbi9idWlsZExvY2FsJyApO1xyXG5jb25zdCBkZXZEaXJlY3RvcnlFeGlzdHMgPSByZXF1aXJlKCAnLi4vLi4vY29tbW9uL2RldkRpcmVjdG9yeUV4aXN0cycgKTtcclxuY29uc3QgZGV2U2NwID0gcmVxdWlyZSggJy4uLy4uL2NvbW1vbi9kZXZTY3AnICk7XHJcbmNvbnN0IGRldlNzaCA9IHJlcXVpcmUoICcuLi8uLi9jb21tb24vZGV2U3NoJyApO1xyXG5jb25zdCBnZXRCcmFuY2ggPSByZXF1aXJlKCAnLi4vLi4vY29tbW9uL2dldEJyYW5jaCcgKTtcclxuY29uc3QgZ2V0UmVtb3RlQnJhbmNoU0hBcyA9IHJlcXVpcmUoICcuLi8uLi9jb21tb24vZ2V0UmVtb3RlQnJhbmNoU0hBcycgKTtcclxuY29uc3QgZ2l0SXNDbGVhbiA9IHJlcXVpcmUoICcuLi8uLi9jb21tb24vZ2l0SXNDbGVhbicgKTtcclxuY29uc3QgZ2l0UmV2UGFyc2UgPSByZXF1aXJlKCAnLi4vLi4vY29tbW9uL2dpdFJldlBhcnNlJyApO1xyXG5jb25zdCBsb2FkSlNPTiA9IHJlcXVpcmUoICcuLi8uLi9jb21tb24vbG9hZEpTT04nICk7XHJcbmNvbnN0IHZwbkNoZWNrID0gcmVxdWlyZSggJy4uLy4uL2NvbW1vbi92cG5DaGVjaycgKTtcclxuY29uc3QgZ3J1bnQgPSByZXF1aXJlKCAnZ3J1bnQnICk7XHJcbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEJVSUxEX0xPQ0FMX0ZJTEVOQU1FID0gYCR7cHJvY2Vzcy5lbnYuSE9NRX0vLnBoZXQvYnVpbGQtbG9jYWwuanNvbmA7XHJcblxyXG4vKipcclxuICogRGVwbG95cyBhIGRldiB2ZXJzaW9uIGFmdGVyIGluY3JlbWVudGluZyB0aGUgdGVzdCB2ZXJzaW9uIG51bWJlci5cclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcHJvamVjdFxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGRldlxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHByb2R1Y3Rpb25cclxuICogQHJldHVybnMge1Byb21pc2V9XHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCBwcm9qZWN0LCBkZXYsIHByb2R1Y3Rpb24gKSB7XHJcblxyXG4gIGNvbnN0IGJ1aWxkTG9jYWxKU09OID0gSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBCVUlMRF9MT0NBTF9GSUxFTkFNRSwgeyBlbmNvZGluZzogJ3V0Zi04JyB9ICkgKTtcclxuICBjb25zdCBnaXRSb290ID0gYnVpbGRMb2NhbEpTT04uZ2l0Um9vdDtcclxuICBjb25zdCB0cnVua1BhdGggPSBidWlsZExvY2FsSlNPTi5kZWNhZlRydW5rUGF0aDtcclxuXHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggZ2l0Um9vdCAhPT0gdW5kZWZpbmVkLCAnYnVpbGRMb2NhbC5naXRSb290IGlzIHVuZGVmaW5lZCcgKTtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCB0cnVua1BhdGggIT09IHVuZGVmaW5lZCwgJ2J1aWxkTG9jYWwuZGVjYWZUcnVua1BhdGggaXMgdW5kZWZpbmVkJyApO1xyXG5cclxuICBjb25zdCBzdHJpbmdGaWxlcyA9IGZzLnJlYWRkaXJTeW5jKCBgJHt0cnVua1BhdGh9L3NpbXVsYXRpb25zLWphdmEvc2ltdWxhdGlvbnMvJHtwcm9qZWN0fS9kYXRhLyR7cHJvamVjdH0vbG9jYWxpemF0aW9uYCApO1xyXG4gIGNvbnN0IGxvY2FsZXMgPSBzdHJpbmdGaWxlcy5maWx0ZXIoIHN0cmluZ0ZpbGUgPT4gc3RyaW5nRmlsZS5pbmRleE9mKCAnXycgKSA+PSAwICkubWFwKCBmaWxlID0+IGZpbGUuc3Vic3RyaW5nKCBmaWxlLmluZGV4T2YoICdfJyApICsgMSwgZmlsZS5sYXN0SW5kZXhPZiggJy4nICkgKSApO1xyXG4gIGNvbnNvbGUubG9nKCBsb2NhbGVzLmpvaW4oICdcXG4nICkgKTtcclxuXHJcbiAgLy8gT3V0cHV0IHRoZSBmbGF2b3JzIGFuZCBsb2NhbGVzXHJcbiAgY29uc3QgamF2YVByb3BlcnRpZXMgPSBmcy5yZWFkRmlsZVN5bmMoIGAke3RydW5rUGF0aH0vc2ltdWxhdGlvbnMtamF2YS9zaW11bGF0aW9ucy8ke3Byb2plY3R9LyR7cHJvamVjdH0tYnVpbGQucHJvcGVydGllc2AsICd1dGYtOCcgKTtcclxuICAvLyBjb25zb2xlLmxvZyhqYXZhUHJvcGVydGllcyk7XHJcblxyXG4vLyBsaWtlICBwcm9qZWN0LmZsYXZvci5tb3ZpbmctbWFuLm1haW5jbGFzcz1lZHUuY29sb3JhZG8ucGhldC5tb3ZpbmdtYW4uTW92aW5nTWFuQXBwbGljYXRpb25cclxuXHJcbiAgY29uc3QgZmxhdm9yTGluZXMgPSBqYXZhUHJvcGVydGllcy5zcGxpdCggJ1xcbicgKS5maWx0ZXIoIGxpbmUgPT4gbGluZS5zdGFydHNXaXRoKCAncHJvamVjdC5mbGF2b3InICkgKTtcclxuICBjb25zdCBmbGF2b3JzID0gZmxhdm9yTGluZXMubGVuZ3RoID4gMCA/IGZsYXZvckxpbmVzLm1hcCggbGluZSA9PiBsaW5lLnNwbGl0KCAnLicgKVsgMiBdICkgOiBbIGAke3Byb2plY3R9YCBdO1xyXG4gIGNvbnNvbGUubG9nKCBmbGF2b3JzLmpvaW4oICdcXG4nICkgKTtcclxuXHJcbiAgaWYgKCAhKCBhd2FpdCB2cG5DaGVjaygpICkgKSB7XHJcbiAgICBncnVudC5mYWlsLmZhdGFsKCAnVlBOIG9yIGJlaW5nIG9uIGNhbXB1cyBpcyByZXF1aXJlZCBmb3IgdGhpcyBidWlsZC4gRW5zdXJlIFZQTiBpcyBlbmFibGVkLCBvciB0aGF0IHlvdSBoYXZlIGFjY2VzcyB0byBwaGV0LXNlcnZlcjIuaW50LmNvbG9yYWRvLmVkdScgKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGN1cnJlbnRCcmFuY2ggPSBhd2FpdCBnZXRCcmFuY2goICdkZWNhZicgKTtcclxuICBpZiAoIGN1cnJlbnRCcmFuY2ggIT09ICdtYXN0ZXInICkge1xyXG4gICAgZ3J1bnQuZmFpbC5mYXRhbCggYGRlcGxveW1lbnQgc2hvdWxkIGJlIG9uIHRoZSBicmFuY2ggbWFzdGVyLCBub3Q6ICR7Y3VycmVudEJyYW5jaCA/IGN1cnJlbnRCcmFuY2ggOiAnKGRldGFjaGVkIGhlYWQpJ31gICk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBwYWNrYWdlRmlsZVJlbGF0aXZlID0gYHByb2plY3RzLyR7cHJvamVjdH0vcGFja2FnZS5qc29uYDtcclxuICBjb25zdCBwYWNrYWdlRmlsZSA9IGAuLi9kZWNhZi8ke3BhY2thZ2VGaWxlUmVsYXRpdmV9YDtcclxuICBjb25zdCBwYWNrYWdlT2JqZWN0ID0gYXdhaXQgbG9hZEpTT04oIHBhY2thZ2VGaWxlICk7XHJcbiAgY29uc3QgdmVyc2lvbiA9IFNpbVZlcnNpb24ucGFyc2UoIHBhY2thZ2VPYmplY3QudmVyc2lvbiApO1xyXG5cclxuICBjb25zdCBpc0NsZWFuID0gYXdhaXQgZ2l0SXNDbGVhbiggJ2RlY2FmJyApO1xyXG4gIGlmICggIWlzQ2xlYW4gKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoIGBVbmNsZWFuIHN0YXR1cyBpbiAke3Byb2plY3R9LCBjYW5ub3QgZGVwbG95YCApO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgY3VycmVudFNIQSA9IGF3YWl0IGdpdFJldlBhcnNlKCAnZGVjYWYnLCAnSEVBRCcgKTtcclxuXHJcbiAgY29uc3QgbGF0ZXN0U0hBID0gKCBhd2FpdCBnZXRSZW1vdGVCcmFuY2hTSEFzKCAnZGVjYWYnICkgKS5tYXN0ZXI7XHJcbiAgaWYgKCBjdXJyZW50U0hBICE9PSBsYXRlc3RTSEEgKSB7XHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzY5OVxyXG4gICAgZ3J1bnQuZmFpbC5mYXRhbCggYE91dCBvZiBkYXRlIHdpdGggcmVtb3RlLCBwbGVhc2UgcHVzaCBvciBwdWxsIHJlcG8uIEN1cnJlbnQgU0hBOiAke2N1cnJlbnRTSEF9LCBsYXRlc3QgU0hBOiAke2xhdGVzdFNIQX1gICk7XHJcbiAgfVxyXG5cclxuICBjb25zdCB2ZXJzaW9uU3RyaW5nID0gdmVyc2lvbi50b1N0cmluZygpO1xyXG5cclxuXHJcbiAgLy8gYXdhaXQgZ2l0QWRkKCAnZGVjYWYnLCBwYWNrYWdlRmlsZVJlbGF0aXZlICk7XHJcbiAgLy8gYXdhaXQgZ2l0Q29tbWl0KCAnZGVjYWYnLCBgQnVtcGluZyB2ZXJzaW9uIHRvICR7dmVyc2lvbi50b1N0cmluZygpfWAgKTtcclxuICAvLyBhd2FpdCBnaXRQdXNoKCAnZGVjYWYnLCAnbWFzdGVyJyApO1xyXG5cclxuICAvLyBDcmVhdGUgKGFuZCBmaXggcGVybWlzc2lvbnMgZm9yKSB0aGUgbWFpbiBzaW11bGF0aW9uIGRpcmVjdG9yeSwgaWYgaXQgZGlkbid0IGFscmVhZHkgZXhpc3RcclxuICBpZiAoIGRldiApIHtcclxuXHJcbiAgICBjb25zdCBzaW1QYXRoID0gYnVpbGRMb2NhbC5kZWNhZkRlcGxveVBhdGggKyBwcm9qZWN0O1xyXG4gICAgY29uc3QgdmVyc2lvblBhdGggPSBgJHtzaW1QYXRofS8ke3ZlcnNpb25TdHJpbmd9YDtcclxuXHJcbiAgICBjb25zdCBzaW1QYXRoRXhpc3RzID0gYXdhaXQgZGV2RGlyZWN0b3J5RXhpc3RzKCBzaW1QYXRoICk7XHJcbiAgICBjb25zdCB2ZXJzaW9uUGF0aEV4aXN0cyA9IGF3YWl0IGRldkRpcmVjdG9yeUV4aXN0cyggdmVyc2lvblBhdGggKTtcclxuXHJcbiAgICBpZiAoIHZlcnNpb25QYXRoRXhpc3RzICkge1xyXG4gICAgICBncnVudC5mYWlsLmZhdGFsKCBgRGlyZWN0b3J5ICR7dmVyc2lvblBhdGh9IGFscmVhZHkgZXhpc3RzLiAgSWYgeW91IGludGVuZCB0byByZXBsYWNlIHRoZSBjb250ZW50IHRoZW4gcmVtb3ZlIHRoZSBkaXJlY3RvcnkgbWFudWFsbHkgZnJvbSAke2J1aWxkTG9jYWwuZGV2RGVwbG95U2VydmVyfS5gICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCAhc2ltUGF0aEV4aXN0cyApIHtcclxuICAgICAgYXdhaXQgZGV2U3NoKCBgbWtkaXIgLXAgXCIke3NpbVBhdGh9XCIgJiYgZWNobyBcIkluZGV4T3JkZXJEZWZhdWx0IERlc2NlbmRpbmcgRGF0ZVxcblwiID4gXCIke3NpbVBhdGh9Ly5odGFjY2Vzc1wiYCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgdmVyc2lvbi1zcGVjaWZpYyBkaXJlY3RvcnlcclxuICAgIGF3YWl0IGRldlNzaCggYG1rZGlyIC1wIFwiJHt2ZXJzaW9uUGF0aH1cImAgKTtcclxuXHJcbiAgICAvLyBDb3B5IHRoZSBidWlsZCBjb250ZW50cyBpbnRvIHRoZSB2ZXJzaW9uLXNwZWNpZmljIGRpcmVjdG9yeVxyXG4gICAgY29uc29sZS5sb2coIGAuLi9kZWNhZi9wcm9qZWN0cy8ke3Byb2plY3R9YCApO1xyXG4gICAgY29uc29sZS5sb2coIGAke3ZlcnNpb25QYXRofS9gICk7XHJcbiAgICBhd2FpdCBkZXZTY3AoIGAuLi9kZWNhZi9wcm9qZWN0cy8ke3Byb2plY3R9L2J1aWxkLyR7cHJvamVjdH1fYWxsLmphcmAsIGAke3ZlcnNpb25QYXRofS9gICk7XHJcbiAgICBhd2FpdCBkZXZTY3AoIGAuLi9kZWNhZi9wcm9qZWN0cy8ke3Byb2plY3R9L2J1aWxkLyR7cHJvamVjdH1fYWxsLmphci5qc2AsIGAke3ZlcnNpb25QYXRofS9gICk7XHJcbiAgICBhd2FpdCBkZXZTY3AoIGAuLi9kZWNhZi9wcm9qZWN0cy8ke3Byb2plY3R9L2J1aWxkLyR7cHJvamVjdH0uaHRtbGAsIGAke3ZlcnNpb25QYXRofS9gICk7XHJcbiAgICBhd2FpdCBkZXZTY3AoIGAuLi9kZWNhZi9wcm9qZWN0cy8ke3Byb2plY3R9L2J1aWxkL3NwbGFzaC5naWZgLCBgJHt2ZXJzaW9uUGF0aH0vYCApO1xyXG4gICAgYXdhaXQgZGV2U2NwKCBgLi4vZGVjYWYvcHJvamVjdHMvJHtwcm9qZWN0fS9idWlsZC9zdHlsZS5jc3NgLCBgJHt2ZXJzaW9uUGF0aH0vYCApO1xyXG4gICAgYXdhaXQgZGV2U2NwKCBgLi4vZGVjYWYvcHJvamVjdHMvJHtwcm9qZWN0fS9idWlsZC9kZXBlbmRlbmNpZXMuanNvbmAsIGAke3ZlcnNpb25QYXRofS9gICk7XHJcbiAgICBhd2FpdCBkZXZTY3AoIGAuLi9kZWNhZi9wcm9qZWN0cy8ke3Byb2plY3R9L2J1aWxkL2xvY2FsZXMudHh0YCwgYCR7dmVyc2lvblBhdGh9L2AgKTtcclxuICAgIGF3YWl0IGRldlNjcCggYC4uL2RlY2FmL3Byb2plY3RzLyR7cHJvamVjdH0vYnVpbGQvc2ltdWxhdGlvbnMudHh0YCwgYCR7dmVyc2lvblBhdGh9L2AgKTtcclxuXHJcbiAgICBjb25zdCB2ZXJzaW9uVVJMID0gYGh0dHBzOi8vcGhldC1kZXYuY29sb3JhZG8uZWR1L2RlY2FmLyR7cHJvamVjdH0vJHt2ZXJzaW9uU3RyaW5nfWA7XHJcbiAgICBjb25zb2xlLmxvZyggJ0RFUExPWUVEJyApO1xyXG5cclxuICAgIGlmICggIWZzLmV4aXN0c1N5bmMoIGAke2dpdFJvb3R9L2RlY2FmL2J1aWxkL2xvZy50eHRgICkgKSB7XHJcbiAgICAgIGZzLm1rZGlyU3luYyggYCR7Z2l0Um9vdH0vZGVjYWYvYnVpbGRgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZmxhdm9ycy5mb3JFYWNoKCBmbGF2b3IgPT4ge1xyXG4gICAgICBjb25zdCB1cmwgPSBgJHt2ZXJzaW9uVVJMfS8ke3Byb2plY3R9Lmh0bWw/c2ltdWxhdGlvbj0ke2ZsYXZvcn1gO1xyXG4gICAgICBncnVudC5sb2cud3JpdGVsbiggdXJsICk7XHJcbiAgICAgIGZzLmFwcGVuZEZpbGVTeW5jKCBgJHtnaXRSb290fS9kZWNhZi9idWlsZC9sb2cudHh0YCwgYCR7dXJsfVxcbmAgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBpZiAoIGZsYXZvcnMubGVuZ3RoID09PSAwICkge1xyXG4gICAgICBjb25zdCBVUkwgPSBgJHt2ZXJzaW9uVVJMfS8ke3Byb2plY3R9Lmh0bWxgO1xyXG4gICAgICBncnVudC5sb2cud3JpdGVsbiggVVJMICk7XHJcbiAgICAgIGZzLmFwcGVuZEZpbGVTeW5jKCBgJHtnaXRSb290fS9kZWNhZi9idWlsZC9sb2cudHh0YCwgYCR7VVJMfVxcbmAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnNvbGUubG9nKCAnRkxBVk9SUycgKTtcclxuICBjb25zb2xlLmxvZyggZmxhdm9ycy5qb2luKCAnLCAnICkgKTtcclxuXHJcbiAgY29uc29sZS5sb2coICdMT0NBTEVTJyApO1xyXG4gIGNvbnNvbGUubG9nKCBsb2NhbGVzLmpvaW4oICcsICcgKSApO1xyXG5cclxuICBpZiAoIHByb2R1Y3Rpb24gKSB7XHJcbiAgICBjb25zdCBwcm9kdWN0aW9uU2VydmVyVVJMID0gYnVpbGRMb2NhbC5wcm9kdWN0aW9uU2VydmVyVVJMIHx8ICdodHRwczovL3BoZXQuY29sb3JhZG8uZWR1JztcclxuICAgIC8vIGF3YWl0IGRldlNzaCggYG1rZGlyIC1wIFwiL2RhdGEvd2ViL3N0YXRpYy9waGV0c2ltcy9zaW1zL2NoZWVycGovJHtwcm9qZWN0fVwiYCApO1xyXG4gICAgY29uc3QgdGVtcGxhdGUgPSBgY2QgL2RhdGEvd2ViL3N0YXRpYy9waGV0c2ltcy9zaW1zL2NoZWVycGovXHJcbnN1ZG8gLXUgcGhldC1hZG1pbiBta2RpciAtcCAke3Byb2plY3R9XHJcbmNkICR7cHJvamVjdH1cclxuc3VkbyAtdSBwaGV0LWFkbWluIHNjcCAtciBiYXllcy5jb2xvcmFkby5lZHU6L2RhdGEvd2ViL2h0ZG9jcy9kZXYvZGVjYWYvJHtwcm9qZWN0fS8ke3ZlcnNpb259IC5cclxuXHJcbnN1ZG8gY2htb2QgZyt3ICpcclxucHJpbnRmIFwiUmV3cml0ZUVuZ2luZSBvblxcXFxuUmV3cml0ZUJhc2UgL3NpbXMvY2hlZXJwai8ke3Byb2plY3R9L1xcXFxuUmV3cml0ZVJ1bGUgXmxhdGVzdCguKikgJHt2ZXJzaW9ufVxcXFwkMVxcXFxuSGVhZGVyIHNldCBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4gXFxcXFwiKlxcXFxcIlxcXFxuXCIgPiAuaHRhY2Nlc3NcclxuXHJcbmNkICR7dmVyc2lvbn1cclxuc3VkbyBjaG1vZCBnK3cgKlxyXG5cclxudG9rZW49JChncmVwIHNlcnZlclRva2VuIH4vLnBoZXQvYnVpbGQtbG9jYWwuanNvbiB8IHNlZCAtciAncy8gKlwic2VydmVyVG9rZW5cIjogXCIoLiopXCIsL1xcXFwxLycpICYmIFxcXFxcclxuY3VybCAtdSBcInRva2VuOiRcXHt0b2tlbn1cIiAnJHtwcm9kdWN0aW9uU2VydmVyVVJMfS9zZXJ2aWNlcy9kZXBsb3ktY2hlZXJwaj9wcm9qZWN0PSR7cHJvamVjdH0mdmVyc2lvbj0ke3ZlcnNpb259JmxvY2FsZXM9JHtsb2NhbGVzLmpvaW4oICcsJyApfSZzaW11bGF0aW9ucz0ke2ZsYXZvcnMuam9pbiggJywnICl9J1xyXG5gO1xyXG4gICAgY29uc29sZS5sb2coICdTRVJWRVIgU0NSSVBUIFRPIFBST01PVEUgREVWIFZFUlNJT04gVE8gUFJPRFVDVElPTiBWRVJTSU9OJyApO1xyXG4gICAgY29uc29sZS5sb2coIHRlbXBsYXRlICk7XHJcbiAgfVxyXG59OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxNQUFNQSxNQUFNLEdBQUdDLE9BQU8sQ0FBRSxRQUFTLENBQUM7QUFDbEMsTUFBTUMsVUFBVSxHQUFHRCxPQUFPLENBQUUseUJBQTBCLENBQUM7QUFDdkQsTUFBTUUsVUFBVSxHQUFHRixPQUFPLENBQUUseUJBQTBCLENBQUM7QUFDdkQsTUFBTUcsa0JBQWtCLEdBQUdILE9BQU8sQ0FBRSxpQ0FBa0MsQ0FBQztBQUN2RSxNQUFNSSxNQUFNLEdBQUdKLE9BQU8sQ0FBRSxxQkFBc0IsQ0FBQztBQUMvQyxNQUFNSyxNQUFNLEdBQUdMLE9BQU8sQ0FBRSxxQkFBc0IsQ0FBQztBQUMvQyxNQUFNTSxTQUFTLEdBQUdOLE9BQU8sQ0FBRSx3QkFBeUIsQ0FBQztBQUNyRCxNQUFNTyxtQkFBbUIsR0FBR1AsT0FBTyxDQUFFLGtDQUFtQyxDQUFDO0FBQ3pFLE1BQU1RLFVBQVUsR0FBR1IsT0FBTyxDQUFFLHlCQUEwQixDQUFDO0FBQ3ZELE1BQU1TLFdBQVcsR0FBR1QsT0FBTyxDQUFFLDBCQUEyQixDQUFDO0FBQ3pELE1BQU1VLFFBQVEsR0FBR1YsT0FBTyxDQUFFLHVCQUF3QixDQUFDO0FBQ25ELE1BQU1XLFFBQVEsR0FBR1gsT0FBTyxDQUFFLHVCQUF3QixDQUFDO0FBQ25ELE1BQU1ZLEtBQUssR0FBR1osT0FBTyxDQUFFLE9BQVEsQ0FBQztBQUNoQyxNQUFNYSxDQUFDLEdBQUdiLE9BQU8sQ0FBRSxRQUFTLENBQUMsQ0FBQyxDQUFDO0FBQy9CLE1BQU1jLEVBQUUs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