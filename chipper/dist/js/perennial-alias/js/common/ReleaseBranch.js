// Copyright 2018, University of Colorado Boulder

/**
 * Represents a simulation release branch for deployment
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const ChipperVersion = require('./ChipperVersion');
const checkoutTarget = require('./checkoutTarget');
const createDirectory = require('./createDirectory');
const execute = require('./execute');
const getActiveSims = require('./getActiveSims');
const getBranchDependencies = require('./getBranchDependencies');
const getBranches = require('./getBranches');
const getBuildArguments = require('./getBuildArguments');
const getDependencies = require('./getDependencies');
const getBranchMap = require('./getBranchMap');
const getBranchVersion = require('./getBranchVersion');
const getFileAtBranch = require('./getFileAtBranch');
const gitCheckout = require('./gitCheckout');
const gitFetch = require('./gitFetch');
const gitFirstDivergingCommit = require('./gitFirstDivergingCommit');
const gitIsAncestor = require('./gitIsAncestor');
const gitPull = require('./gitPull');
const gitRevParse = require('./gitRevParse');
const gitTimestamp = require('./gitTimestamp');
const gruntCommand = require('./gruntCommand');
const npmCommand = require('./npmCommand');
const puppeteerLoad = require('./puppeteerLoad');
const simMetadata = require('./simMetadata');
const simPhetioMetadata = require('./simPhetioMetadata');
const withServer = require('./withServer');
const assert = require('assert');
const fs = require('fs');
const winston = require('winston');
module.exports = function () {
  //REVIEW: Rename to 'release-branches'
  const MAINTENANCE_DIRECTORY = '../.maintenance';
  class ReleaseBranch {
    /**
     * @public
     * @constructor
     *
     * @param {string} repo
     * @param {string} branch
     * @param {Array.<string>} brands
     * @param {boolean} isReleased
     */
    constructor(repo, branch, brands, isReleased) {
      assert(typeof repo === 'string');
      assert(typeof branch === 'string');
      assert(Array.isArray(brands));
      assert(typeof isReleased === 'boolean');

      // @public {string}
      this.repo = repo;
      this.branch = branch;

      // @public {Array.<string>}
      this.brands = brands;

      // @public {boolean}
      this.isReleased = isReleased;
    }

    /**
     * Convert into a plain JS object meant for JSON serialization.
     * @public
     *
     * @returns {Object}
     */
    serialize() {
      return {
        repo: this.repo,
        branch: this.branch,
        brands: this.brands,
        isReleased: this.isReleased
      };
    }

    /**
     * Takes a serialized form of the ReleaseBranch and returns an actual instance.
     * @public
     *
     * @param {Object}
     * @returns {ReleaseBranch}
     */
    static deserialize({
      repo,
      branch,
      brands,
      isReleased
    }) {
      return new ReleaseBranch(repo, branch, brands, isReleased);
    }

    /**
     * Returns whether the two release branches contain identical information.
     * @public
     *
     * @param {ReleaseBranch} releaseBranch
     * @returns {boolean}
     */
    equals(releaseBranch) {
      return this.repo === releaseBranch.repo && this.branch === releaseBranch.branch && this.brands.join(',') === releaseBranch.brands.join(',') && this.isReleased === releaseBranch.isReleased;
    }

    /**
     * Converts it to a (debuggable) string form.
     * @public
     *
     * @returns {string}
     */
    toString() {
      return `${this.repo} ${this.branch} ${this.brands.join(',')}${this.isReleased ? '' : ' (unpublished)'}`;
    }

    /**
     * @public
     *
     * @param repo {string}
     * @param branch {string}
     * @returns {string}
     */
    static getCheckoutDirectory(repo, branch) {
      return `${MAINTENANCE_DIRECTORY}/${repo}-${branch}`;
    }

    /**
     * Returns the maintenance directory, for things that want to use it directly.
     * @public
     *
     * @returns {string}
     */
    static getMaintenanceDirectory() {
      return MAINTENANCE_DIRECTORY;
    }

    /**
     * Returns the path (relative to the repo) to the built phet-brand HTML file
     * @public
     *
     * @returns {Promise<string>}
     */
    async getLocalPhetBuiltHTMLPath() {
      const usesChipper2 = await this.usesChipper2();
      return `build/${usesChipper2 ? 'phet/' : ''}${this.repo}_en${usesChipper2 ? '_phet' : ''}.html`;
    }

    /**
     * Returns the path (relative to the repo) to the built phet-io-brand HTML file
     * @public
     *
     * @returns {Promise<string>}
     */
    async getLocalPhetIOBuiltHTMLPath() {
      const usesChipper2 = await this.usesChipper2();
      return `build/${usesChipper2 ? 'phet-io/' : ''}${this.repo}${usesChipper2 ? '_all_phet-io' : '_en-phetio'}.html`;
    }

    /**
     * Returns the query parameter to use for activating phet-io standalone mode
     * @public
     *
     * @returns {Promise<string>}
     */
    async getPhetioStandaloneQueryParameter() {
      return (await this.usesOldPhetioStandalone()) ? 'phet-io.standalone' : 'phetioStandalone';
    }

    /**
     * @public
     */
    async updateCheckout() {
      winston.info(`updating checkout for ${this.toString()}`);

      //REVIEW: We can avoid thrashing our main copy here (or needing it) by using the maintenance directory checkout
      //REVIEW: for the repo. We'll somehow have to get it cloned first (worth it?)
      await gitFetch(this.repo);
      await gitCheckout(this.repo, this.branch);
      await gitPull(this.repo);
      const dependencies = await getDependencies(this.repo);
      await gitCheckout(this.repo, 'master');

      //REVIEW: make this more parallelizable (NPM and main copy thrashing)

      if (!fs.existsSync(MAINTENANCE_DIRECTORY)) {
        winston.info(`creating directory ${MAINTENANCE_DIRECTORY}`);
        await createDirectory(MAINTENANCE_DIRECTORY);
      }
      const checkoutDirectory = ReleaseBranch.getCheckoutDirectory(this.repo, this.branch);
      if (!fs.existsSync(checkoutDirectory)) {
        winston.info(`creating directory ${checkoutDirectory}`);
        await createDirectory(checkoutDirectory);
      }
      dependencies.babel = {
        sha: 'master',
        branch: 'master'
      };
      const dependencyRepos = Object.keys(dependencies).filter(repo => repo !== 'comment');
      await Promise.all(dependencyRepos.map(async repo => {
        const repoPwd = `${checkoutDirectory}/${repo}`;
        if (!fs.existsSync(`${checkoutDirectory}/${repo}`)) {
          winston.info(`cloning repo ${repo} in ${checkoutDirectory}`);
          if (repo === 'perennial-alias') {
            await execute('git', ['clone', 'https://github.com/phetsims/perennial.git', repo], `${checkoutDirectory}`);
          } else {
            await execute('git', ['clone', `https://github.com/phetsims/${repo}.git`], `${checkoutDirectory}`);
          }
        } else {
          await execute('git', ['fetch'], repoPwd);
        }
        await execute('git', ['checkout', dependencies[repo].sha], repoPwd);
        if (repo === 'chipper' || repo === 'perennial-alias' || repo === this.repo) {
          winston.info(`npm ${repo} in ${checkoutDirectory}`);

          //REVIEW: Allow these to lock and be parallelized safely
          await execute(npmCommand, ['prune'], repoPwd);
          await execute(npmCommand, ['update'], repoPwd);
        }
      }));
    }

    /**
     * @public
     */
    async build() {
      const checkoutDirectory = ReleaseBranch.getCheckoutDirectory(this.repo, this.branch);
      const repoDirectory = `${checkoutDirectory}/${this.repo}`;
      const chipperVersion = ChipperVersion.getFromPackageJSON(JSON.parse(fs.readFileSync(`${checkoutDirectory}/chipper/package.json`, 'utf8')));
      const args = getBuildArguments(chipperVersion, {
        brands: this.brands,
        allHTML: true,
        debugHTML: true
      });
      winston.info(`building ${checkoutDirectory} with grunt ${args.join(' ')}`);
      await execute(gruntCommand, args, repoDirectory);
    }

    /**
     * @public
     */
    async transpile() {
      const checkoutDirectory = ReleaseBranch.getCheckoutDirectory(this.repo, this.branch);
      const repoDirectory = `${checkoutDirectory}/${this.repo}`;
      winston.info(`transpiling ${checkoutDirectory}`);

      // We might not be able to run this command!
      await execute(gruntCommand, ['output-js-project'], repoDirectory, {
        errors: 'resolve'
      });
    }

    /**
     * @public
     *
     * @returns {Promise<string|null>} - Error string, or null if no error
     */
    async checkUnbuilt() {
      try {
        return await withServer(async port => {
          const url = `http://localhost:${port}/${this.repo}/${this.repo}_en.html?brand=phet&ea&fuzzMouse&fuzzTouch`;
          try {
            return await puppeteerLoad(url, {
              waitAfterLoad: 20000
            });
          } catch (e) {
            return `Failure for ${url}: ${e}`;
          }
        }, {
          path: ReleaseBranch.getCheckoutDirectory(this.repo, this.branch)
        });
      } catch (e) {
        return `[ERROR] Failure to check: ${e}`;
      }
    }

    /**
     * @public
     *
     * @returns {Promise<string|null>} - Error string, or null if no error
     */
    async checkBuilt() {
      try {
        const usesChipper2 = await this.usesChipper2();
        return await withServer(async port => {
          const url = `http://localhost:${port}/${this.repo}/build/${usesChipper2 ? 'phet/' : ''}${this.repo}_en${usesChipper2 ? '_phet' : ''}.html?fuzzMouse&fuzzTouch`;
          try {
            return puppeteerLoad(url, {
              waitAfterLoad: 20000
            });
          } catch (error) {
            return `Failure for ${url}: ${error}`;
          }
        }, {
          path: ReleaseBranch.getCheckoutDirectory(this.repo, this.branch)
        });
      } catch (e) {
        return `[ERROR] Failure to check: ${e}`;
      }
    }

    /**
     * Checks this release branch out.
     * @public
     *
     * @param {boolean} includeNpmUpdate
     */
    async checkout(includeNpmUpdate) {
      await checkoutTarget(this.repo, this.branch, includeNpmUpdate);
    }

    /**
     * Whether this release branch includes the given SHA for the given repo dependency. Will be false if it doesn't
     * depend on this repository.
     * @public
     *
     * @param {string} repo
     * @param {string} sha
     * @returns {Promise.<boolean>}
     */
    async includesSHA(repo, sha) {
      let result = false;
      await gitCheckout(this.repo, this.branch);
      const dependencies = await getDependencies(this.repo);
      if (dependencies[repo]) {
        const currentSHA = dependencies[repo].sha;
        result = sha === currentSHA || (await gitIsAncestor(repo, sha, currentSHA));
      }
      await gitCheckout(this.repo, 'master');
      return result;
    }

    /**
     * Whether this release branch does NOT include the given SHA for the given repo dependency. Will be false if it doesn't
     * depend on this repository.
     * @public
     *
     * @param {string} repo
     * @param {string} sha
     * @returns {Promise.<boolean>}
     */
    async isMissingSHA(repo, sha) {
      let result = false;
      await gitCheckout(this.repo, this.branch);
      const dependencies = await getDependencies(this.repo);
      if (dependencies[repo]) {
        const currentSHA = dependencies[repo].sha;
        result = sha !== currentSHA && !(await gitIsAncestor(repo, sha, currentSHA));
      }
      await gitCheckout(this.repo, 'master');
      return result;
    }

    /**
     * The SHA at which this release branch's main repository diverged from master.
     * @public
     *
     * @returns {Promise.<string>}
     */
    async getDivergingSHA() {
      await gitCheckout(this.repo, this.branch);
      await gitPull(this.repo);
      await gitCheckout(this.repo, 'master');
      return gitFirstDivergingCommit(this.repo, this.branch, 'master');
    }

    /**
     * The timestamp at which this release branch's main repository diverged from master.
     * @public
     *
     * @returns {Promise.<number>}
     */
    async getDivergingTimestamp() {
      return gitTimestamp(this.repo, await this.getDivergingSHA());
    }

    /**
     * Returns the dependencies.json for this release branch
     * @public
     *
     * @returns {Promise}
     */
    async getDependencies() {
      return getBranchDependencies(this.repo, this.branch);
    }

    /**
     * Returns the SimVersion for this release branch
     * @public
     *
     * @returns {Promise<SimVersion>}
     */
    async getSimVersion() {
      return getBranchVersion(this.repo, this.branch);
    }

    /**
     * Returns a list of status messages of anything out-of-the-ordinary
     * @public
     *
     * @returns {Promise.<Array.<string>>}
     */
    async getStatus(getBranchMapAsyncCallback = getBranchMap) {
      const results = [];
      const dependencies = await this.getDependencies();
      const dependencyNames = Object.keys(dependencies).filter(key => {
        return key !== 'comment' && key !== this.repo;
      });

      // Check our own dependency
      if (dependencies[this.repo]) {
        try {
          const currentCommit = await gitRevParse(this.repo, this.branch);
          const previousCommit = await gitRevParse(this.repo, `${currentCommit}^`);
          if (dependencies[this.repo].sha !== previousCommit) {
            results.push('[INFO] Potential changes (dependency is not previous commit)');
            results.push(`[INFO] ${currentCommit} ${previousCommit} ${dependencies[this.repo].sha}`);
          }
          if ((await this.getSimVersion()).testType === 'rc' && this.isReleased) {
            results.push('[INFO] Release candidate version detected (see if there is a QA issue)');
          }
        } catch (e) {
          results.push(`[ERROR] Failure to check current/previous commit: ${e.message}`);
        }
      } else {
        results.push('[WARNING] Own repository not included in dependencies');
      }
      for (const dependency of dependencyNames) {
        const potentialReleaseBranch = `${this.repo}-${this.branch}`;
        const branchMap = await getBranchMapAsyncCallback(dependency);
        if (Object.keys(branchMap).includes(potentialReleaseBranch)) {
          if (dependencies[dependency].sha !== branchMap[potentialReleaseBranch]) {
            results.push(`[WARNING] Dependency mismatch for ${dependency} on branch ${potentialReleaseBranch}`);
          }
        }
      }
      return results;
    }

    /**
     * Returns whether the sim is compatible with ES6 features
     * @public
     *
     * @returns {Promise<boolean>}
     */
    async usesES6() {
      await gitCheckout(this.repo, this.branch);
      const dependencies = await getDependencies(this.repo);
      const sha = dependencies.chipper.sha;
      await gitCheckout(this.repo, 'master');
      return gitIsAncestor('chipper', '80b4ad62cd8f2057b844f18d3c00cf5c0c89ed8d', sha);
    }

    /**
     * Returns whether this sim uses initialize-globals based query parameters
     * @public
     *
     * If true:
     *   phet.chipper.queryParameters.WHATEVER
     *   AND it needs to be in the schema
     *
     * If false:
     *   phet.chipper.getQueryParameter( 'WHATEVER' )
     *   FLAGS should use !!phet.chipper.getQueryParameter( 'WHATEVER' )
     *
     * @returns {Promise<boolean>}
     */
    async usesInitializeGlobalsQueryParameters() {
      await gitCheckout(this.repo, this.branch);
      const dependencies = await getDependencies(this.repo);
      const sha = dependencies.chipper.sha;
      await gitCheckout(this.repo, 'master');
      return gitIsAncestor('chipper', 'e454f88ff51d1e3fabdb3a076d7407a2a9e9133c', sha);
    }

    /**
     * Returns whether phet-io.standalone is the correct phet-io query parameter (otherwise it's the newer
     * phetioStandalone).
     * Looks for the presence of https://github.com/phetsims/chipper/commit/4814d6966c54f250b1c0f3909b71f2b9cfcc7665.
     * @public
     *
     * @returns {Promise.<boolean>}
     */
    async usesOldPhetioStandalone() {
      await gitCheckout(this.repo, this.branch);
      const dependencies = await getDependencies(this.repo);
      const sha = dependencies.chipper.sha;
      await gitCheckout(this.repo, 'master');
      return !(await gitIsAncestor('chipper', '4814d6966c54f250b1c0f3909b71f2b9cfcc7665', sha));
    }

    /**
     * Returns whether the relativeSimPath query parameter is used for wrappers (instead of launchLocalVersion).
     * Looks for the presence of https://github.com/phetsims/phet-io/commit/e3fc26079358d86074358a6db3ebaf1af9725632
     * @public
     *
     * @returns {Promise.<boolean>}
     */
    async usesRelativeSimPath() {
      await gitCheckout(this.repo, this.branch);
      const dependencies = await getDependencies(this.repo);
      if (!dependencies['phet-io']) {
        return true; // Doesn't really matter now, does it?
      }

      const sha = dependencies['phet-io'].sha;
      await gitCheckout(this.repo, 'master');
      return gitIsAncestor('phet-io', 'e3fc26079358d86074358a6db3ebaf1af9725632', sha);
    }

    /**
     * Returns whether phet-io Studio is being used instead of deprecated instance proxies wrapper.
     * @public
     *
     * @returns {Promise.<boolean>}
     */
    async usesPhetioStudio() {
      await gitCheckout(this.repo, this.branch);
      const dependencies = await getDependencies(this.repo);
      const sha = dependencies.chipper.sha;
      await gitCheckout(this.repo, 'master');
      return gitIsAncestor('chipper', '7375f6a57b5874b6bbf97a54c9a908f19f88d38f', sha);
    }

    /**
     * Returns whether phet-io Studio top-level (index.html) is used instead of studio.html.
     * @public
     *
     * @returns {Promise.<boolean>}
     */
    async usesPhetioStudioIndex() {
      await gitCheckout(this.repo, this.branch);
      const dependencies = await getDependencies(this.repo);
      const dependency = dependencies['phet-io-wrappers'];
      if (!dependency) {
        return false;
      }
      const sha = dependency.sha;
      await gitCheckout(this.repo, 'master');
      return gitIsAncestor('phet-io-wrappers', '7ec1a04a70fb9707b381b8bcab3ad070815ef7fe', sha);
    }

    /**
     * Returns whether an additional folder exists in the build directory of the sim based on the brand.
     * @public
     *
     * @returns {Promise.<boolean>}
     */
    async usesChipper2() {
      await gitCheckout(this.repo, this.branch);
      const dependencies = await getDependencies(this.repo);
      await gitCheckout('chipper', dependencies.chipper.sha);
      const chipperVersion = ChipperVersion.getFromRepository();
      const result = chipperVersion.major !== 0 || chipperVersion.minor !== 0;
      await gitCheckout(this.repo, 'master');
      await gitCheckout('chipper', 'master');
      return result;
    }

    /**
     * Runs a predicate function with the contents of a specific file's contents in the release branch (with false if
     * it doesn't exist).
     * @public
     *
     * @param {string} file
     * @param {function(contents:string):boolean} predicate
     * @returns {Promise.<boolean>}
     */
    async withFile(file, predicate) {
      await this.checkout(false);
      if (fs.existsSync(file)) {
        const contents = fs.readFileSync(file, 'utf-8');
        return predicate(contents);
      }
      return false;
    }

    /**
     * Gets a list of ReleaseBranches which would be potential candidates for a maintenance release. This includes:
     * - All published phet brand release branches (from metadata)
     * - All published phet-io brand release branches (from metadata)
     * - All unpublished local release branches
     *
     * @public
     * @returns {Promise.<ReleaseBranch[]>}
     * @rejects {ExecuteError}
     */
    static async getAllMaintenanceBranches() {
      winston.debug('retrieving available sim branches');
      console.log('loading phet brand ReleaseBranches');
      const simMetadataResult = await simMetadata({
        type: 'html'
      });

      // Released phet branches
      const phetBranches = simMetadataResult.projects.map(simData => {
        const repo = simData.name.slice(simData.name.indexOf('/') + 1);
        const branch = `${simData.version.major}.${simData.version.minor}`;
        return new ReleaseBranch(repo, branch, ['phet'], true);
      });
      console.log('loading phet-io brand ReleaseBranches');
      const phetioBranches = (await simPhetioMetadata({
        active: true,
        latest: true
      })).filter(simData => simData.active && simData.latest).map(simData => {
        let branch = `${simData.versionMajor}.${simData.versionMinor}`;
        if (simData.versionSuffix.length) {
          branch += `-${simData.versionSuffix}`; // additional dash required
        }

        return new ReleaseBranch(simData.name, branch, ['phet-io'], true);
      });
      console.log('loading unreleased ReleaseBranches');
      const unreleasedBranches = [];
      for (const repo of getActiveSims()) {
        // Exclude explicitly excluded repos
        if (JSON.parse(fs.readFileSync(`../${repo}/package.json`, 'utf8')).phet.ignoreForAutomatedMaintenanceReleases) {
          continue;
        }
        const branches = await getBranches(repo);
        const releasedBranches = phetBranches.concat(phetioBranches);
        for (const branch of branches) {
          // We aren't unreleased if we're included in either phet or phet-io metadata.
          // See https://github.com/phetsims/balancing-act/issues/118
          if (releasedBranches.filter(releaseBranch => releaseBranch.repo === repo && releaseBranch.branch === branch).length) {
            continue;
          }
          const match = branch.match(/^(\d+)\.(\d+)$/);
          if (match) {
            const major = Number(match[1]);
            const minor = Number(match[2]);

            // Assumption that there is no phet-io brand sim that isn't also released with phet brand
            const projectMetadata = simMetadataResult.projects.find(project => project.name === `html/${repo}`) || null;
            const productionVersion = projectMetadata ? projectMetadata.version : null;
            if (!productionVersion || major > productionVersion.major || major === productionVersion.major && minor > productionVersion.minor) {
              // Do a checkout so we can determine supported brands
              const packageObject = JSON.parse(await getFileAtBranch(repo, branch, 'package.json'));
              const includesPhetio = packageObject.phet && packageObject.phet.supportedBrands && packageObject.phet.supportedBrands.includes('phet-io');
              const brands = ['phet',
              // Assumption that there is no phet-io brand sim that isn't also released with phet brand
              ...(includesPhetio ? ['phet-io'] : [])];
              if (!packageObject.phet.ignoreForAutomatedMaintenanceReleases) {
                unreleasedBranches.push(new ReleaseBranch(repo, branch, brands, false));
              }
            }
          }
        }
      }
      return ReleaseBranch.combineLists([...phetBranches, ...phetioBranches, ...unreleasedBranches]);
    }

    /**
     * Combines multiple matching ReleaseBranches into one where appropriate, and sorts. For example, two ReleaseBranches
     * of the same repo but for different brands are combined into a single ReleaseBranch with multiple brands.
     * @public
     *
     * @param {Array.<ReleaseBranch>} simBranches
     * @returns {Array.<ReleaseBranch>}
     */
    static combineLists(simBranches) {
      const resultBranches = [];
      for (const simBranch of simBranches) {
        let foundBranch = false;
        for (const resultBranch of resultBranches) {
          if (simBranch.repo === resultBranch.repo && simBranch.branch === resultBranch.branch) {
            foundBranch = true;
            resultBranch.brands = [...resultBranch.brands, ...simBranch.brands];
            break;
          }
        }
        if (!foundBranch) {
          resultBranches.push(simBranch);
        }
      }
      resultBranches.sort((a, b) => {
        if (a.repo !== b.repo) {
          return a.repo < b.repo ? -1 : 1;
        }
        if (a.branch !== b.branch) {
          return a.branch < b.branch ? -1 : 1;
        }
        return 0;
      });
      return resultBranches;
    }
  }
  return ReleaseBranch;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGlwcGVyVmVyc2lvbiIsInJlcXVpcmUiLCJjaGVja291dFRhcmdldCIsImNyZWF0ZURpcmVjdG9yeSIsImV4ZWN1dGUiLCJnZXRBY3RpdmVTaW1zIiwiZ2V0QnJhbmNoRGVwZW5kZW5jaWVzIiwiZ2V0QnJhbmNoZXMiLCJnZXRCdWlsZEFyZ3VtZW50cyIsImdldERlcGVuZGVuY2llcyIsImdldEJyYW5jaE1hcCIsImdldEJyYW5jaFZlcnNpb24iLCJnZXRGaWxlQXRCcmFuY2giLCJnaXRDaGVja291dCIsImdpdEZldGNoIiwiZ2l0Rmlyc3REaXZlcmdpbmdDb21taXQiLCJnaXRJc0FuY2VzdG9yIiwiZ2l0UHVsbCIsImdpdFJldlBhcnNlIiwiZ2l0VGltZXN0YW1wIiwiZ3J1bnRDb21tYW5kIiwibnBtQ29tbWFuZCIsInB1cHBldGVlckxvYWQiLCJzaW1NZXRhZGF0YSIsInNpbVBoZXRpb01ldGFkYXRhIiwid2l0aFNlcnZlciIsImFzc2VydCIsImZzIiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJNQUlOVEVOQU5DRV9ESVJFQ1RPUlkiLCJSZWxlYXNlQnJhbmNoIiwiY29uc3RydWN0b3IiLCJyZXBvIiwiYnJhbmNoIiwiYnJhbmRzIiwiaXNSZWxlYXNlZCIsIkFycmF5IiwiaXNBcnJheSIsInNlcmlhbGl6ZSIsImRlc2VyaWFsaXplIiwiZXF1YWxzIiwicmVsZWFzZUJyYW5jaCIsImpvaW4iLCJ0b1N0cmluZyIsImdldENoZWNrb3V0RGlyZWN0b3J5IiwiZ2V0TWFpbnRlbmFuY2VEaXJlY3RvcnkiLCJnZXRMb2NhbFBoZXRCdWlsdEhUTUxQYXRoIiwidXNlc0NoaXBwZXIyIiwiZ2V0TG9jYWxQaGV0SU9CdWlsdEhUTUxQYXRoIiwiZ2V0UGhldGlvU3RhbmRhbG9uZVF1ZXJ5UGFyYW1ldGVyIiwidXNlc09sZFBoZXRpb1N0YW5kYWxvbmUiLCJ1cGRhdGVDaGVja291dCIsImluZm8iLCJkZXBlbmRlbmNpZXMiLCJleGlzdHNTeW5jIiwiY2hlY2tvdXREaXJlY3RvcnkiLCJiYWJlbCIsInNoYSIsImRlcGVuZGVuY3lSZXBvcyIsIk9iamVjdCIsImtleXMiLCJmaWx0ZXIiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwicmVwb1B3ZCIsImJ1aWxkIiwicmVwb0RpcmVjdG9yeSIsImNoaXBwZXJWZXJzaW9uIiwiZ2V0RnJvbVBhY2thZ2VKU09OIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwiYXJncyIsImFsbEhUTUwiLCJkZWJ1Z0hUTUwiLCJ0cmFuc3BpbGUiLCJlcnJvcnMiLCJjaGVja1VuYnVpbHQiLCJwb3J0IiwidXJsIiwid2FpdEFmdGVyTG9hZCIsImUiLCJwYXRoIiwiY2hlY2tCdWlsdCIsImVycm9yIiwiY2hlY2tvdXQiLCJpbmNsdWRlTnBtVXBkYXRlIiwiaW5jbHVkZXNTSEEiLCJyZXN1bHQiLCJjdXJyZW50U0hBIiwiaXNNaXNzaW5nU0hBIiwiZ2V0RGl2ZXJnaW5nU0hBIiwiZ2V0RGl2ZXJnaW5nVGltZXN0YW1wIiwiZ2V0U2ltVmVyc2lvbiIsImdldFN0YXR1cyIsImdldEJyYW5jaE1hcEFzeW5jQ2FsbGJhY2siLCJyZXN1bHRzIiwiZGVwZW5kZW5jeU5hbWVzIiwia2V5IiwiY3VycmVudENvbW1pdCIsInByZXZpb3VzQ29tbWl0IiwicHVzaCIsInRlc3RUeXBlIiwibWVzc2FnZSIsImRlcGVuZGVuY3kiLCJwb3RlbnRpYWxSZWxlYXNlQnJhbmNoIiwiYnJhbmNoTWFwIiwiaW5jbHVkZXMiLCJ1c2VzRVM2IiwiY2hpcHBlciIsInVzZXNJbml0aWFsaXplR2xvYmFsc1F1ZXJ5UGFyYW1ldGVycyIsInVzZXNSZWxhdGl2ZVNpbVBhdGgiLCJ1c2VzUGhldGlvU3R1ZGlvIiwidXNlc1BoZXRpb1N0dWRpb0luZGV4IiwiZ2V0RnJvbVJlcG9zaXRvcnkiLCJtYWpvciIsIm1pbm9yIiwid2l0aEZpbGUiLCJmaWxlIiwicHJlZGljYXRlIiwiY29udGVudHMiLCJnZXRBbGxNYWludGVuYW5jZUJyYW5jaGVzIiwiZGVidWciLCJjb25zb2xlIiwibG9nIiwic2ltTWV0YWRhdGFSZXN1bHQiLCJ0eXBlIiwicGhldEJyYW5jaGVzIiwicHJvamVjdHMiLCJzaW1EYXRhIiwibmFtZSIsInNsaWNlIiwiaW5kZXhPZiIsInZlcnNpb24iLCJwaGV0aW9CcmFuY2hlcyIsImFjdGl2ZSIsImxhdGVzdCIsInZlcnNpb25NYWpvciIsInZlcnNpb25NaW5vciIsInZlcnNpb25TdWZmaXgiLCJsZW5ndGgiLCJ1bnJlbGVhc2VkQnJhbmNoZXMiLCJwaGV0IiwiaWdub3JlRm9yQXV0b21hdGVkTWFpbnRlbmFuY2VSZWxlYXNlcyIsImJyYW5jaGVzIiwicmVsZWFzZWRCcmFuY2hlcyIsImNvbmNhdCIsIm1hdGNoIiwiTnVtYmVyIiwicHJvamVjdE1ldGFkYXRhIiwiZmluZCIsInByb2plY3QiLCJwcm9kdWN0aW9uVmVyc2lvbiIsInBhY2thZ2VPYmplY3QiLCJpbmNsdWRlc1BoZXRpbyIsInN1cHBvcnRlZEJyYW5kcyIsImNvbWJpbmVMaXN0cyIsInNpbUJyYW5jaGVzIiwicmVzdWx0QnJhbmNoZXMiLCJzaW1CcmFuY2giLCJmb3VuZEJyYW5jaCIsInJlc3VsdEJyYW5jaCIsInNvcnQiLCJhIiwiYiJdLCJzb3VyY2VzIjpbIlJlbGVhc2VCcmFuY2guanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYSBzaW11bGF0aW9uIHJlbGVhc2UgYnJhbmNoIGZvciBkZXBsb3ltZW50XHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5jb25zdCBDaGlwcGVyVmVyc2lvbiA9IHJlcXVpcmUoICcuL0NoaXBwZXJWZXJzaW9uJyApO1xyXG5jb25zdCBjaGVja291dFRhcmdldCA9IHJlcXVpcmUoICcuL2NoZWNrb3V0VGFyZ2V0JyApO1xyXG5jb25zdCBjcmVhdGVEaXJlY3RvcnkgPSByZXF1aXJlKCAnLi9jcmVhdGVEaXJlY3RvcnknICk7XHJcbmNvbnN0IGV4ZWN1dGUgPSByZXF1aXJlKCAnLi9leGVjdXRlJyApO1xyXG5jb25zdCBnZXRBY3RpdmVTaW1zID0gcmVxdWlyZSggJy4vZ2V0QWN0aXZlU2ltcycgKTtcclxuY29uc3QgZ2V0QnJhbmNoRGVwZW5kZW5jaWVzID0gcmVxdWlyZSggJy4vZ2V0QnJhbmNoRGVwZW5kZW5jaWVzJyApO1xyXG5jb25zdCBnZXRCcmFuY2hlcyA9IHJlcXVpcmUoICcuL2dldEJyYW5jaGVzJyApO1xyXG5jb25zdCBnZXRCdWlsZEFyZ3VtZW50cyA9IHJlcXVpcmUoICcuL2dldEJ1aWxkQXJndW1lbnRzJyApO1xyXG5jb25zdCBnZXREZXBlbmRlbmNpZXMgPSByZXF1aXJlKCAnLi9nZXREZXBlbmRlbmNpZXMnICk7XHJcbmNvbnN0IGdldEJyYW5jaE1hcCA9IHJlcXVpcmUoICcuL2dldEJyYW5jaE1hcCcgKTtcclxuY29uc3QgZ2V0QnJhbmNoVmVyc2lvbiA9IHJlcXVpcmUoICcuL2dldEJyYW5jaFZlcnNpb24nICk7XHJcbmNvbnN0IGdldEZpbGVBdEJyYW5jaCA9IHJlcXVpcmUoICcuL2dldEZpbGVBdEJyYW5jaCcgKTtcclxuY29uc3QgZ2l0Q2hlY2tvdXQgPSByZXF1aXJlKCAnLi9naXRDaGVja291dCcgKTtcclxuY29uc3QgZ2l0RmV0Y2ggPSByZXF1aXJlKCAnLi9naXRGZXRjaCcgKTtcclxuY29uc3QgZ2l0Rmlyc3REaXZlcmdpbmdDb21taXQgPSByZXF1aXJlKCAnLi9naXRGaXJzdERpdmVyZ2luZ0NvbW1pdCcgKTtcclxuY29uc3QgZ2l0SXNBbmNlc3RvciA9IHJlcXVpcmUoICcuL2dpdElzQW5jZXN0b3InICk7XHJcbmNvbnN0IGdpdFB1bGwgPSByZXF1aXJlKCAnLi9naXRQdWxsJyApO1xyXG5jb25zdCBnaXRSZXZQYXJzZSA9IHJlcXVpcmUoICcuL2dpdFJldlBhcnNlJyApO1xyXG5jb25zdCBnaXRUaW1lc3RhbXAgPSByZXF1aXJlKCAnLi9naXRUaW1lc3RhbXAnICk7XHJcbmNvbnN0IGdydW50Q29tbWFuZCA9IHJlcXVpcmUoICcuL2dydW50Q29tbWFuZCcgKTtcclxuY29uc3QgbnBtQ29tbWFuZCA9IHJlcXVpcmUoICcuL25wbUNvbW1hbmQnICk7XHJcbmNvbnN0IHB1cHBldGVlckxvYWQgPSByZXF1aXJlKCAnLi9wdXBwZXRlZXJMb2FkJyApO1xyXG5jb25zdCBzaW1NZXRhZGF0YSA9IHJlcXVpcmUoICcuL3NpbU1ldGFkYXRhJyApO1xyXG5jb25zdCBzaW1QaGV0aW9NZXRhZGF0YSA9IHJlcXVpcmUoICcuL3NpbVBoZXRpb01ldGFkYXRhJyApO1xyXG5jb25zdCB3aXRoU2VydmVyID0gcmVxdWlyZSggJy4vd2l0aFNlcnZlcicgKTtcclxuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSggJ2Fzc2VydCcgKTtcclxuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XHJcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gKCBmdW5jdGlvbigpIHtcclxuXHJcbiAgLy9SRVZJRVc6IFJlbmFtZSB0byAncmVsZWFzZS1icmFuY2hlcydcclxuICBjb25zdCBNQUlOVEVOQU5DRV9ESVJFQ1RPUlkgPSAnLi4vLm1haW50ZW5hbmNlJztcclxuXHJcbiAgY2xhc3MgUmVsZWFzZUJyYW5jaCB7XHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBjb25zdHJ1Y3RvclxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZXBvXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYnJhbmNoXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBicmFuZHNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNSZWxlYXNlZFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvciggcmVwbywgYnJhbmNoLCBicmFuZHMsIGlzUmVsZWFzZWQgKSB7XHJcbiAgICAgIGFzc2VydCggdHlwZW9mIHJlcG8gPT09ICdzdHJpbmcnICk7XHJcbiAgICAgIGFzc2VydCggdHlwZW9mIGJyYW5jaCA9PT0gJ3N0cmluZycgKTtcclxuICAgICAgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBicmFuZHMgKSApO1xyXG4gICAgICBhc3NlcnQoIHR5cGVvZiBpc1JlbGVhc2VkID09PSAnYm9vbGVhbicgKTtcclxuXHJcbiAgICAgIC8vIEBwdWJsaWMge3N0cmluZ31cclxuICAgICAgdGhpcy5yZXBvID0gcmVwbztcclxuICAgICAgdGhpcy5icmFuY2ggPSBicmFuY2g7XHJcblxyXG4gICAgICAvLyBAcHVibGljIHtBcnJheS48c3RyaW5nPn1cclxuICAgICAgdGhpcy5icmFuZHMgPSBicmFuZHM7XHJcblxyXG4gICAgICAvLyBAcHVibGljIHtib29sZWFufVxyXG4gICAgICB0aGlzLmlzUmVsZWFzZWQgPSBpc1JlbGVhc2VkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCBpbnRvIGEgcGxhaW4gSlMgb2JqZWN0IG1lYW50IGZvciBKU09OIHNlcmlhbGl6YXRpb24uXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge09iamVjdH1cclxuICAgICAqL1xyXG4gICAgc2VyaWFsaXplKCkge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlcG86IHRoaXMucmVwbyxcclxuICAgICAgICBicmFuY2g6IHRoaXMuYnJhbmNoLFxyXG4gICAgICAgIGJyYW5kczogdGhpcy5icmFuZHMsXHJcbiAgICAgICAgaXNSZWxlYXNlZDogdGhpcy5pc1JlbGVhc2VkXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUYWtlcyBhIHNlcmlhbGl6ZWQgZm9ybSBvZiB0aGUgUmVsZWFzZUJyYW5jaCBhbmQgcmV0dXJucyBhbiBhY3R1YWwgaW5zdGFuY2UuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9XHJcbiAgICAgKiBAcmV0dXJucyB7UmVsZWFzZUJyYW5jaH1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGRlc2VyaWFsaXplKCB7IHJlcG8sIGJyYW5jaCwgYnJhbmRzLCBpc1JlbGVhc2VkIH0gKSB7XHJcbiAgICAgIHJldHVybiBuZXcgUmVsZWFzZUJyYW5jaCggcmVwbywgYnJhbmNoLCBicmFuZHMsIGlzUmVsZWFzZWQgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgd2hldGhlciB0aGUgdHdvIHJlbGVhc2UgYnJhbmNoZXMgY29udGFpbiBpZGVudGljYWwgaW5mb3JtYXRpb24uXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtSZWxlYXNlQnJhbmNofSByZWxlYXNlQnJhbmNoXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZXF1YWxzKCByZWxlYXNlQnJhbmNoICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5yZXBvID09PSByZWxlYXNlQnJhbmNoLnJlcG8gJiZcclxuICAgICAgICAgICAgIHRoaXMuYnJhbmNoID09PSByZWxlYXNlQnJhbmNoLmJyYW5jaCAmJlxyXG4gICAgICAgICAgICAgdGhpcy5icmFuZHMuam9pbiggJywnICkgPT09IHJlbGVhc2VCcmFuY2guYnJhbmRzLmpvaW4oICcsJyApICYmXHJcbiAgICAgICAgICAgICB0aGlzLmlzUmVsZWFzZWQgPT09IHJlbGVhc2VCcmFuY2guaXNSZWxlYXNlZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnRzIGl0IHRvIGEgKGRlYnVnZ2FibGUpIHN0cmluZyBmb3JtLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHRvU3RyaW5nKCkge1xyXG4gICAgICByZXR1cm4gYCR7dGhpcy5yZXBvfSAke3RoaXMuYnJhbmNofSAke3RoaXMuYnJhbmRzLmpvaW4oICcsJyApfSR7dGhpcy5pc1JlbGVhc2VkID8gJycgOiAnICh1bnB1Ymxpc2hlZCknfWA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHJlcG8ge3N0cmluZ31cclxuICAgICAqIEBwYXJhbSBicmFuY2gge3N0cmluZ31cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXRDaGVja291dERpcmVjdG9yeSggcmVwbywgYnJhbmNoICkge1xyXG4gICAgICByZXR1cm4gYCR7TUFJTlRFTkFOQ0VfRElSRUNUT1JZfS8ke3JlcG99LSR7YnJhbmNofWA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBtYWludGVuYW5jZSBkaXJlY3RvcnksIGZvciB0aGluZ3MgdGhhdCB3YW50IHRvIHVzZSBpdCBkaXJlY3RseS5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0TWFpbnRlbmFuY2VEaXJlY3RvcnkoKSB7XHJcbiAgICAgIHJldHVybiBNQUlOVEVOQU5DRV9ESVJFQ1RPUlk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBwYXRoIChyZWxhdGl2ZSB0byB0aGUgcmVwbykgdG8gdGhlIGJ1aWx0IHBoZXQtYnJhbmQgSFRNTCBmaWxlXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgZ2V0TG9jYWxQaGV0QnVpbHRIVE1MUGF0aCgpIHtcclxuICAgICAgY29uc3QgdXNlc0NoaXBwZXIyID0gYXdhaXQgdGhpcy51c2VzQ2hpcHBlcjIoKTtcclxuXHJcbiAgICAgIHJldHVybiBgYnVpbGQvJHt1c2VzQ2hpcHBlcjIgPyAncGhldC8nIDogJyd9JHt0aGlzLnJlcG99X2VuJHt1c2VzQ2hpcHBlcjIgPyAnX3BoZXQnIDogJyd9Lmh0bWxgO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgcGF0aCAocmVsYXRpdmUgdG8gdGhlIHJlcG8pIHRvIHRoZSBidWlsdCBwaGV0LWlvLWJyYW5kIEhUTUwgZmlsZVxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGdldExvY2FsUGhldElPQnVpbHRIVE1MUGF0aCgpIHtcclxuICAgICAgY29uc3QgdXNlc0NoaXBwZXIyID0gYXdhaXQgdGhpcy51c2VzQ2hpcHBlcjIoKTtcclxuXHJcbiAgICAgIHJldHVybiBgYnVpbGQvJHt1c2VzQ2hpcHBlcjIgPyAncGhldC1pby8nIDogJyd9JHt0aGlzLnJlcG99JHt1c2VzQ2hpcHBlcjIgPyAnX2FsbF9waGV0LWlvJyA6ICdfZW4tcGhldGlvJ30uaHRtbGA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBxdWVyeSBwYXJhbWV0ZXIgdG8gdXNlIGZvciBhY3RpdmF0aW5nIHBoZXQtaW8gc3RhbmRhbG9uZSBtb2RlXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgZ2V0UGhldGlvU3RhbmRhbG9uZVF1ZXJ5UGFyYW1ldGVyKCkge1xyXG4gICAgICByZXR1cm4gKCBhd2FpdCB0aGlzLnVzZXNPbGRQaGV0aW9TdGFuZGFsb25lKCkgKSA/ICdwaGV0LWlvLnN0YW5kYWxvbmUnIDogJ3BoZXRpb1N0YW5kYWxvbmUnO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICovXHJcbiAgICBhc3luYyB1cGRhdGVDaGVja291dCgpIHtcclxuICAgICAgd2luc3Rvbi5pbmZvKCBgdXBkYXRpbmcgY2hlY2tvdXQgZm9yICR7dGhpcy50b1N0cmluZygpfWAgKTtcclxuXHJcbiAgICAgIC8vUkVWSUVXOiBXZSBjYW4gYXZvaWQgdGhyYXNoaW5nIG91ciBtYWluIGNvcHkgaGVyZSAob3IgbmVlZGluZyBpdCkgYnkgdXNpbmcgdGhlIG1haW50ZW5hbmNlIGRpcmVjdG9yeSBjaGVja291dFxyXG4gICAgICAvL1JFVklFVzogZm9yIHRoZSByZXBvLiBXZSdsbCBzb21laG93IGhhdmUgdG8gZ2V0IGl0IGNsb25lZCBmaXJzdCAod29ydGggaXQ/KVxyXG4gICAgICBhd2FpdCBnaXRGZXRjaCggdGhpcy5yZXBvICk7XHJcbiAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCB0aGlzLnJlcG8sIHRoaXMuYnJhbmNoICk7XHJcbiAgICAgIGF3YWl0IGdpdFB1bGwoIHRoaXMucmVwbyApO1xyXG4gICAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBhd2FpdCBnZXREZXBlbmRlbmNpZXMoIHRoaXMucmVwbyApO1xyXG4gICAgICBhd2FpdCBnaXRDaGVja291dCggdGhpcy5yZXBvLCAnbWFzdGVyJyApO1xyXG5cclxuICAgICAgLy9SRVZJRVc6IG1ha2UgdGhpcyBtb3JlIHBhcmFsbGVsaXphYmxlIChOUE0gYW5kIG1haW4gY29weSB0aHJhc2hpbmcpXHJcblxyXG4gICAgICBpZiAoICFmcy5leGlzdHNTeW5jKCBNQUlOVEVOQU5DRV9ESVJFQ1RPUlkgKSApIHtcclxuICAgICAgICB3aW5zdG9uLmluZm8oIGBjcmVhdGluZyBkaXJlY3RvcnkgJHtNQUlOVEVOQU5DRV9ESVJFQ1RPUll9YCApO1xyXG4gICAgICAgIGF3YWl0IGNyZWF0ZURpcmVjdG9yeSggTUFJTlRFTkFOQ0VfRElSRUNUT1JZICk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgY2hlY2tvdXREaXJlY3RvcnkgPSBSZWxlYXNlQnJhbmNoLmdldENoZWNrb3V0RGlyZWN0b3J5KCB0aGlzLnJlcG8sIHRoaXMuYnJhbmNoICk7XHJcbiAgICAgIGlmICggIWZzLmV4aXN0c1N5bmMoIGNoZWNrb3V0RGlyZWN0b3J5ICkgKSB7XHJcbiAgICAgICAgd2luc3Rvbi5pbmZvKCBgY3JlYXRpbmcgZGlyZWN0b3J5ICR7Y2hlY2tvdXREaXJlY3Rvcnl9YCApO1xyXG4gICAgICAgIGF3YWl0IGNyZWF0ZURpcmVjdG9yeSggY2hlY2tvdXREaXJlY3RvcnkgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZGVwZW5kZW5jaWVzLmJhYmVsID0geyBzaGE6ICdtYXN0ZXInLCBicmFuY2g6ICdtYXN0ZXInIH07XHJcblxyXG4gICAgICBjb25zdCBkZXBlbmRlbmN5UmVwb3MgPSBPYmplY3Qua2V5cyggZGVwZW5kZW5jaWVzICkuZmlsdGVyKCByZXBvID0+IHJlcG8gIT09ICdjb21tZW50JyApO1xyXG5cclxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoIGRlcGVuZGVuY3lSZXBvcy5tYXAoIGFzeW5jIHJlcG8gPT4ge1xyXG4gICAgICAgIGNvbnN0IHJlcG9Qd2QgPSBgJHtjaGVja291dERpcmVjdG9yeX0vJHtyZXBvfWA7XHJcblxyXG4gICAgICAgIGlmICggIWZzLmV4aXN0c1N5bmMoIGAke2NoZWNrb3V0RGlyZWN0b3J5fS8ke3JlcG99YCApICkge1xyXG4gICAgICAgICAgd2luc3Rvbi5pbmZvKCBgY2xvbmluZyByZXBvICR7cmVwb30gaW4gJHtjaGVja291dERpcmVjdG9yeX1gICk7XHJcbiAgICAgICAgICBpZiAoIHJlcG8gPT09ICdwZXJlbm5pYWwtYWxpYXMnICkge1xyXG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAnY2xvbmUnLCAnaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BlcmVubmlhbC5naXQnLCByZXBvIF0sIGAke2NoZWNrb3V0RGlyZWN0b3J5fWAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAnY2xvbmUnLCBgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zLyR7cmVwb30uZ2l0YCBdLCBgJHtjaGVja291dERpcmVjdG9yeX1gICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgYXdhaXQgZXhlY3V0ZSggJ2dpdCcsIFsgJ2ZldGNoJyBdLCByZXBvUHdkICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAnY2hlY2tvdXQnLCBkZXBlbmRlbmNpZXNbIHJlcG8gXS5zaGEgXSwgcmVwb1B3ZCApO1xyXG5cclxuICAgICAgICBpZiAoIHJlcG8gPT09ICdjaGlwcGVyJyB8fCByZXBvID09PSAncGVyZW5uaWFsLWFsaWFzJyB8fCByZXBvID09PSB0aGlzLnJlcG8gKSB7XHJcbiAgICAgICAgICB3aW5zdG9uLmluZm8oIGBucG0gJHtyZXBvfSBpbiAke2NoZWNrb3V0RGlyZWN0b3J5fWAgKTtcclxuXHJcbiAgICAgICAgICAvL1JFVklFVzogQWxsb3cgdGhlc2UgdG8gbG9jayBhbmQgYmUgcGFyYWxsZWxpemVkIHNhZmVseVxyXG4gICAgICAgICAgYXdhaXQgZXhlY3V0ZSggbnBtQ29tbWFuZCwgWyAncHJ1bmUnIF0sIHJlcG9Qd2QgKTtcclxuICAgICAgICAgIGF3YWl0IGV4ZWN1dGUoIG5wbUNvbW1hbmQsIFsgJ3VwZGF0ZScgXSwgcmVwb1B3ZCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGJ1aWxkKCkge1xyXG4gICAgICBjb25zdCBjaGVja291dERpcmVjdG9yeSA9IFJlbGVhc2VCcmFuY2guZ2V0Q2hlY2tvdXREaXJlY3RvcnkoIHRoaXMucmVwbywgdGhpcy5icmFuY2ggKTtcclxuICAgICAgY29uc3QgcmVwb0RpcmVjdG9yeSA9IGAke2NoZWNrb3V0RGlyZWN0b3J5fS8ke3RoaXMucmVwb31gO1xyXG5cclxuICAgICAgY29uc3QgY2hpcHBlclZlcnNpb24gPSBDaGlwcGVyVmVyc2lvbi5nZXRGcm9tUGFja2FnZUpTT04oXHJcbiAgICAgICAgSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBgJHtjaGVja291dERpcmVjdG9yeX0vY2hpcHBlci9wYWNrYWdlLmpzb25gLCAndXRmOCcgKSApXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBjb25zdCBhcmdzID0gZ2V0QnVpbGRBcmd1bWVudHMoIGNoaXBwZXJWZXJzaW9uLCB7XHJcbiAgICAgICAgYnJhbmRzOiB0aGlzLmJyYW5kcyxcclxuICAgICAgICBhbGxIVE1MOiB0cnVlLFxyXG4gICAgICAgIGRlYnVnSFRNTDogdHJ1ZVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICB3aW5zdG9uLmluZm8oIGBidWlsZGluZyAke2NoZWNrb3V0RGlyZWN0b3J5fSB3aXRoIGdydW50ICR7YXJncy5qb2luKCAnICcgKX1gICk7XHJcbiAgICAgIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgYXJncywgcmVwb0RpcmVjdG9yeSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICovXHJcbiAgICBhc3luYyB0cmFuc3BpbGUoKSB7XHJcbiAgICAgIGNvbnN0IGNoZWNrb3V0RGlyZWN0b3J5ID0gUmVsZWFzZUJyYW5jaC5nZXRDaGVja291dERpcmVjdG9yeSggdGhpcy5yZXBvLCB0aGlzLmJyYW5jaCApO1xyXG4gICAgICBjb25zdCByZXBvRGlyZWN0b3J5ID0gYCR7Y2hlY2tvdXREaXJlY3Rvcnl9LyR7dGhpcy5yZXBvfWA7XHJcblxyXG4gICAgICB3aW5zdG9uLmluZm8oIGB0cmFuc3BpbGluZyAke2NoZWNrb3V0RGlyZWN0b3J5fWAgKTtcclxuXHJcbiAgICAgIC8vIFdlIG1pZ2h0IG5vdCBiZSBhYmxlIHRvIHJ1biB0aGlzIGNvbW1hbmQhXHJcbiAgICAgIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgWyAnb3V0cHV0LWpzLXByb2plY3QnIF0sIHJlcG9EaXJlY3RvcnksIHtcclxuICAgICAgICBlcnJvcnM6ICdyZXNvbHZlJ1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nfG51bGw+fSAtIEVycm9yIHN0cmluZywgb3IgbnVsbCBpZiBubyBlcnJvclxyXG4gICAgICovXHJcbiAgICBhc3luYyBjaGVja1VuYnVpbHQoKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHdpdGhTZXJ2ZXIoIGFzeW5jIHBvcnQgPT4ge1xyXG4gICAgICAgICAgY29uc3QgdXJsID0gYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fS8ke3RoaXMucmVwb30vJHt0aGlzLnJlcG99X2VuLmh0bWw/YnJhbmQ9cGhldCZlYSZmdXp6TW91c2UmZnV6elRvdWNoYDtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBwdXBwZXRlZXJMb2FkKCB1cmwsIHtcclxuICAgICAgICAgICAgICB3YWl0QWZ0ZXJMb2FkOiAyMDAwMFxyXG4gICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYXRjaCggZSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGBGYWlsdXJlIGZvciAke3VybH06ICR7ZX1gO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgIHBhdGg6IFJlbGVhc2VCcmFuY2guZ2V0Q2hlY2tvdXREaXJlY3RvcnkoIHRoaXMucmVwbywgdGhpcy5icmFuY2ggKVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgICBjYXRjaCggZSApIHtcclxuICAgICAgICByZXR1cm4gYFtFUlJPUl0gRmFpbHVyZSB0byBjaGVjazogJHtlfWA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmd8bnVsbD59IC0gRXJyb3Igc3RyaW5nLCBvciBudWxsIGlmIG5vIGVycm9yXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGNoZWNrQnVpbHQoKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgdXNlc0NoaXBwZXIyID0gYXdhaXQgdGhpcy51c2VzQ2hpcHBlcjIoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHdpdGhTZXJ2ZXIoIGFzeW5jIHBvcnQgPT4ge1xyXG4gICAgICAgICAgY29uc3QgdXJsID0gYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fS8ke3RoaXMucmVwb30vYnVpbGQvJHt1c2VzQ2hpcHBlcjIgPyAncGhldC8nIDogJyd9JHt0aGlzLnJlcG99X2VuJHt1c2VzQ2hpcHBlcjIgPyAnX3BoZXQnIDogJyd9Lmh0bWw/ZnV6ek1vdXNlJmZ1enpUb3VjaGA7XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXR1cm4gcHVwcGV0ZWVyTG9hZCggdXJsLCB7XHJcbiAgICAgICAgICAgICAgd2FpdEFmdGVyTG9hZDogMjAwMDBcclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2F0Y2goIGVycm9yICkge1xyXG4gICAgICAgICAgICByZXR1cm4gYEZhaWx1cmUgZm9yICR7dXJsfTogJHtlcnJvcn1gO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgIHBhdGg6IFJlbGVhc2VCcmFuY2guZ2V0Q2hlY2tvdXREaXJlY3RvcnkoIHRoaXMucmVwbywgdGhpcy5icmFuY2ggKVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgICBjYXRjaCggZSApIHtcclxuICAgICAgICByZXR1cm4gYFtFUlJPUl0gRmFpbHVyZSB0byBjaGVjazogJHtlfWA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB0aGlzIHJlbGVhc2UgYnJhbmNoIG91dC5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGluY2x1ZGVOcG1VcGRhdGVcclxuICAgICAqL1xyXG4gICAgYXN5bmMgY2hlY2tvdXQoIGluY2x1ZGVOcG1VcGRhdGUgKSB7XHJcbiAgICAgIGF3YWl0IGNoZWNrb3V0VGFyZ2V0KCB0aGlzLnJlcG8sIHRoaXMuYnJhbmNoLCBpbmNsdWRlTnBtVXBkYXRlICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGV0aGVyIHRoaXMgcmVsZWFzZSBicmFuY2ggaW5jbHVkZXMgdGhlIGdpdmVuIFNIQSBmb3IgdGhlIGdpdmVuIHJlcG8gZGVwZW5kZW5jeS4gV2lsbCBiZSBmYWxzZSBpZiBpdCBkb2Vzbid0XHJcbiAgICAgKiBkZXBlbmQgb24gdGhpcyByZXBvc2l0b3J5LlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZXBvXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2hhXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48Ym9vbGVhbj59XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGluY2x1ZGVzU0hBKCByZXBvLCBzaGEgKSB7XHJcbiAgICAgIGxldCByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCB0aGlzLnJlcG8sIHRoaXMuYnJhbmNoICk7XHJcblxyXG4gICAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBhd2FpdCBnZXREZXBlbmRlbmNpZXMoIHRoaXMucmVwbyApO1xyXG5cclxuICAgICAgaWYgKCBkZXBlbmRlbmNpZXNbIHJlcG8gXSApIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50U0hBID0gZGVwZW5kZW5jaWVzWyByZXBvIF0uc2hhO1xyXG4gICAgICAgIHJlc3VsdCA9IHNoYSA9PT0gY3VycmVudFNIQSB8fCBhd2FpdCBnaXRJc0FuY2VzdG9yKCByZXBvLCBzaGEsIGN1cnJlbnRTSEEgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHRoaXMucmVwbywgJ21hc3RlcicgKTtcclxuXHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGV0aGVyIHRoaXMgcmVsZWFzZSBicmFuY2ggZG9lcyBOT1QgaW5jbHVkZSB0aGUgZ2l2ZW4gU0hBIGZvciB0aGUgZ2l2ZW4gcmVwbyBkZXBlbmRlbmN5LiBXaWxsIGJlIGZhbHNlIGlmIGl0IGRvZXNuJ3RcclxuICAgICAqIGRlcGVuZCBvbiB0aGlzIHJlcG9zaXRvcnkuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzaGFcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlLjxib29sZWFuPn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgaXNNaXNzaW5nU0hBKCByZXBvLCBzaGEgKSB7XHJcbiAgICAgIGxldCByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCB0aGlzLnJlcG8sIHRoaXMuYnJhbmNoICk7XHJcblxyXG4gICAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBhd2FpdCBnZXREZXBlbmRlbmNpZXMoIHRoaXMucmVwbyApO1xyXG5cclxuICAgICAgaWYgKCBkZXBlbmRlbmNpZXNbIHJlcG8gXSApIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50U0hBID0gZGVwZW5kZW5jaWVzWyByZXBvIF0uc2hhO1xyXG4gICAgICAgIHJlc3VsdCA9IHNoYSAhPT0gY3VycmVudFNIQSAmJiAhKCBhd2FpdCBnaXRJc0FuY2VzdG9yKCByZXBvLCBzaGEsIGN1cnJlbnRTSEEgKSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhd2FpdCBnaXRDaGVja291dCggdGhpcy5yZXBvLCAnbWFzdGVyJyApO1xyXG5cclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBTSEEgYXQgd2hpY2ggdGhpcyByZWxlYXNlIGJyYW5jaCdzIG1haW4gcmVwb3NpdG9yeSBkaXZlcmdlZCBmcm9tIG1hc3Rlci5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48c3RyaW5nPn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgZ2V0RGl2ZXJnaW5nU0hBKCkge1xyXG4gICAgICBhd2FpdCBnaXRDaGVja291dCggdGhpcy5yZXBvLCB0aGlzLmJyYW5jaCApO1xyXG4gICAgICBhd2FpdCBnaXRQdWxsKCB0aGlzLnJlcG8gKTtcclxuICAgICAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHRoaXMucmVwbywgJ21hc3RlcicgKTtcclxuXHJcbiAgICAgIHJldHVybiBnaXRGaXJzdERpdmVyZ2luZ0NvbW1pdCggdGhpcy5yZXBvLCB0aGlzLmJyYW5jaCwgJ21hc3RlcicgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0aW1lc3RhbXAgYXQgd2hpY2ggdGhpcyByZWxlYXNlIGJyYW5jaCdzIG1haW4gcmVwb3NpdG9yeSBkaXZlcmdlZCBmcm9tIG1hc3Rlci5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48bnVtYmVyPn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgZ2V0RGl2ZXJnaW5nVGltZXN0YW1wKCkge1xyXG4gICAgICByZXR1cm4gZ2l0VGltZXN0YW1wKCB0aGlzLnJlcG8sIGF3YWl0IHRoaXMuZ2V0RGl2ZXJnaW5nU0hBKCkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGRlcGVuZGVuY2llcy5qc29uIGZvciB0aGlzIHJlbGVhc2UgYnJhbmNoXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGdldERlcGVuZGVuY2llcygpIHtcclxuICAgICAgcmV0dXJuIGdldEJyYW5jaERlcGVuZGVuY2llcyggdGhpcy5yZXBvLCB0aGlzLmJyYW5jaCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgU2ltVmVyc2lvbiBmb3IgdGhpcyByZWxlYXNlIGJyYW5jaFxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFNpbVZlcnNpb24+fVxyXG4gICAgICovXHJcbiAgICBhc3luYyBnZXRTaW1WZXJzaW9uKCkge1xyXG4gICAgICByZXR1cm4gZ2V0QnJhbmNoVmVyc2lvbiggdGhpcy5yZXBvLCB0aGlzLmJyYW5jaCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIGxpc3Qgb2Ygc3RhdHVzIG1lc3NhZ2VzIG9mIGFueXRoaW5nIG91dC1vZi10aGUtb3JkaW5hcnlcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48QXJyYXkuPHN0cmluZz4+fVxyXG4gICAgICovXHJcbiAgICBhc3luYyBnZXRTdGF0dXMoIGdldEJyYW5jaE1hcEFzeW5jQ2FsbGJhY2sgPSBnZXRCcmFuY2hNYXAgKSB7XHJcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcclxuXHJcbiAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IGF3YWl0IHRoaXMuZ2V0RGVwZW5kZW5jaWVzKCk7XHJcbiAgICAgIGNvbnN0IGRlcGVuZGVuY3lOYW1lcyA9IE9iamVjdC5rZXlzKCBkZXBlbmRlbmNpZXMgKS5maWx0ZXIoIGtleSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGtleSAhPT0gJ2NvbW1lbnQnICYmIGtleSAhPT0gdGhpcy5yZXBvO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBDaGVjayBvdXIgb3duIGRlcGVuZGVuY3lcclxuICAgICAgaWYgKCBkZXBlbmRlbmNpZXNbIHRoaXMucmVwbyBdICkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBjdXJyZW50Q29tbWl0ID0gYXdhaXQgZ2l0UmV2UGFyc2UoIHRoaXMucmVwbywgdGhpcy5icmFuY2ggKTtcclxuICAgICAgICAgIGNvbnN0IHByZXZpb3VzQ29tbWl0ID0gYXdhaXQgZ2l0UmV2UGFyc2UoIHRoaXMucmVwbywgYCR7Y3VycmVudENvbW1pdH1eYCApO1xyXG4gICAgICAgICAgaWYgKCBkZXBlbmRlbmNpZXNbIHRoaXMucmVwbyBdLnNoYSAhPT0gcHJldmlvdXNDb21taXQgKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCggJ1tJTkZPXSBQb3RlbnRpYWwgY2hhbmdlcyAoZGVwZW5kZW5jeSBpcyBub3QgcHJldmlvdXMgY29tbWl0KScgKTtcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKCBgW0lORk9dICR7Y3VycmVudENvbW1pdH0gJHtwcmV2aW91c0NvbW1pdH0gJHtkZXBlbmRlbmNpZXNbIHRoaXMucmVwbyBdLnNoYX1gICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoICggYXdhaXQgdGhpcy5nZXRTaW1WZXJzaW9uKCkgKS50ZXN0VHlwZSA9PT0gJ3JjJyAmJiB0aGlzLmlzUmVsZWFzZWQgKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCggJ1tJTkZPXSBSZWxlYXNlIGNhbmRpZGF0ZSB2ZXJzaW9uIGRldGVjdGVkIChzZWUgaWYgdGhlcmUgaXMgYSBRQSBpc3N1ZSknICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoKCBlICkge1xyXG4gICAgICAgICAgcmVzdWx0cy5wdXNoKCBgW0VSUk9SXSBGYWlsdXJlIHRvIGNoZWNrIGN1cnJlbnQvcHJldmlvdXMgY29tbWl0OiAke2UubWVzc2FnZX1gICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJlc3VsdHMucHVzaCggJ1tXQVJOSU5HXSBPd24gcmVwb3NpdG9yeSBub3QgaW5jbHVkZWQgaW4gZGVwZW5kZW5jaWVzJyApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKCBjb25zdCBkZXBlbmRlbmN5IG9mIGRlcGVuZGVuY3lOYW1lcyApIHtcclxuICAgICAgICBjb25zdCBwb3RlbnRpYWxSZWxlYXNlQnJhbmNoID0gYCR7dGhpcy5yZXBvfS0ke3RoaXMuYnJhbmNofWA7XHJcbiAgICAgICAgY29uc3QgYnJhbmNoTWFwID0gYXdhaXQgZ2V0QnJhbmNoTWFwQXN5bmNDYWxsYmFjayggZGVwZW5kZW5jeSApO1xyXG5cclxuICAgICAgICBpZiAoIE9iamVjdC5rZXlzKCBicmFuY2hNYXAgKS5pbmNsdWRlcyggcG90ZW50aWFsUmVsZWFzZUJyYW5jaCApICkge1xyXG4gICAgICAgICAgaWYgKCBkZXBlbmRlbmNpZXNbIGRlcGVuZGVuY3kgXS5zaGEgIT09IGJyYW5jaE1hcFsgcG90ZW50aWFsUmVsZWFzZUJyYW5jaCBdICkge1xyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2goIGBbV0FSTklOR10gRGVwZW5kZW5jeSBtaXNtYXRjaCBmb3IgJHtkZXBlbmRlbmN5fSBvbiBicmFuY2ggJHtwb3RlbnRpYWxSZWxlYXNlQnJhbmNofWAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiByZXN1bHRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBzaW0gaXMgY29tcGF0aWJsZSB3aXRoIEVTNiBmZWF0dXJlc1xyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fVxyXG4gICAgICovXHJcbiAgICBhc3luYyB1c2VzRVM2KCkge1xyXG4gICAgICBhd2FpdCBnaXRDaGVja291dCggdGhpcy5yZXBvLCB0aGlzLmJyYW5jaCApO1xyXG4gICAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBhd2FpdCBnZXREZXBlbmRlbmNpZXMoIHRoaXMucmVwbyApO1xyXG4gICAgICBjb25zdCBzaGEgPSBkZXBlbmRlbmNpZXMuY2hpcHBlci5zaGE7XHJcbiAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCB0aGlzLnJlcG8sICdtYXN0ZXInICk7XHJcblxyXG4gICAgICByZXR1cm4gZ2l0SXNBbmNlc3RvciggJ2NoaXBwZXInLCAnODBiNGFkNjJjZDhmMjA1N2I4NDRmMThkM2MwMGNmNWMwYzg5ZWQ4ZCcsIHNoYSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgc2ltIHVzZXMgaW5pdGlhbGl6ZS1nbG9iYWxzIGJhc2VkIHF1ZXJ5IHBhcmFtZXRlcnNcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBJZiB0cnVlOlxyXG4gICAgICogICBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLldIQVRFVkVSXHJcbiAgICAgKiAgIEFORCBpdCBuZWVkcyB0byBiZSBpbiB0aGUgc2NoZW1hXHJcbiAgICAgKlxyXG4gICAgICogSWYgZmFsc2U6XHJcbiAgICAgKiAgIHBoZXQuY2hpcHBlci5nZXRRdWVyeVBhcmFtZXRlciggJ1dIQVRFVkVSJyApXHJcbiAgICAgKiAgIEZMQUdTIHNob3VsZCB1c2UgISFwaGV0LmNoaXBwZXIuZ2V0UXVlcnlQYXJhbWV0ZXIoICdXSEFURVZFUicgKVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fVxyXG4gICAgICovXHJcbiAgICBhc3luYyB1c2VzSW5pdGlhbGl6ZUdsb2JhbHNRdWVyeVBhcmFtZXRlcnMoKSB7XHJcbiAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCB0aGlzLnJlcG8sIHRoaXMuYnJhbmNoICk7XHJcbiAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IGF3YWl0IGdldERlcGVuZGVuY2llcyggdGhpcy5yZXBvICk7XHJcbiAgICAgIGNvbnN0IHNoYSA9IGRlcGVuZGVuY2llcy5jaGlwcGVyLnNoYTtcclxuICAgICAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHRoaXMucmVwbywgJ21hc3RlcicgKTtcclxuXHJcbiAgICAgIHJldHVybiBnaXRJc0FuY2VzdG9yKCAnY2hpcHBlcicsICdlNDU0Zjg4ZmY1MWQxZTNmYWJkYjNhMDc2ZDc0MDdhMmE5ZTkxMzNjJywgc2hhICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgcGhldC1pby5zdGFuZGFsb25lIGlzIHRoZSBjb3JyZWN0IHBoZXQtaW8gcXVlcnkgcGFyYW1ldGVyIChvdGhlcndpc2UgaXQncyB0aGUgbmV3ZXJcclxuICAgICAqIHBoZXRpb1N0YW5kYWxvbmUpLlxyXG4gICAgICogTG9va3MgZm9yIHRoZSBwcmVzZW5jZSBvZiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9jb21taXQvNDgxNGQ2OTY2YzU0ZjI1MGIxYzBmMzkwOWI3MWYyYjljZmNjNzY2NS5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48Ym9vbGVhbj59XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHVzZXNPbGRQaGV0aW9TdGFuZGFsb25lKCkge1xyXG4gICAgICBhd2FpdCBnaXRDaGVja291dCggdGhpcy5yZXBvLCB0aGlzLmJyYW5jaCApO1xyXG4gICAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBhd2FpdCBnZXREZXBlbmRlbmNpZXMoIHRoaXMucmVwbyApO1xyXG4gICAgICBjb25zdCBzaGEgPSBkZXBlbmRlbmNpZXMuY2hpcHBlci5zaGE7XHJcbiAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCB0aGlzLnJlcG8sICdtYXN0ZXInICk7XHJcblxyXG4gICAgICByZXR1cm4gISggYXdhaXQgZ2l0SXNBbmNlc3RvciggJ2NoaXBwZXInLCAnNDgxNGQ2OTY2YzU0ZjI1MGIxYzBmMzkwOWI3MWYyYjljZmNjNzY2NScsIHNoYSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHJlbGF0aXZlU2ltUGF0aCBxdWVyeSBwYXJhbWV0ZXIgaXMgdXNlZCBmb3Igd3JhcHBlcnMgKGluc3RlYWQgb2YgbGF1bmNoTG9jYWxWZXJzaW9uKS5cclxuICAgICAqIExvb2tzIGZvciB0aGUgcHJlc2VuY2Ugb2YgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vY29tbWl0L2UzZmMyNjA3OTM1OGQ4NjA3NDM1OGE2ZGIzZWJhZjFhZjk3MjU2MzJcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48Ym9vbGVhbj59XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHVzZXNSZWxhdGl2ZVNpbVBhdGgoKSB7XHJcbiAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCB0aGlzLnJlcG8sIHRoaXMuYnJhbmNoICk7XHJcbiAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IGF3YWl0IGdldERlcGVuZGVuY2llcyggdGhpcy5yZXBvICk7XHJcblxyXG4gICAgICBpZiAoICFkZXBlbmRlbmNpZXNbICdwaGV0LWlvJyBdICkge1xyXG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBEb2Vzbid0IHJlYWxseSBtYXR0ZXIgbm93LCBkb2VzIGl0P1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBzaGEgPSBkZXBlbmRlbmNpZXNbICdwaGV0LWlvJyBdLnNoYTtcclxuICAgICAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHRoaXMucmVwbywgJ21hc3RlcicgKTtcclxuXHJcbiAgICAgIHJldHVybiBnaXRJc0FuY2VzdG9yKCAncGhldC1pbycsICdlM2ZjMjYwNzkzNThkODYwNzQzNThhNmRiM2ViYWYxYWY5NzI1NjMyJywgc2hhICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgcGhldC1pbyBTdHVkaW8gaXMgYmVpbmcgdXNlZCBpbnN0ZWFkIG9mIGRlcHJlY2F0ZWQgaW5zdGFuY2UgcHJveGllcyB3cmFwcGVyLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlLjxib29sZWFuPn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgdXNlc1BoZXRpb1N0dWRpbygpIHtcclxuICAgICAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHRoaXMucmVwbywgdGhpcy5icmFuY2ggKTtcclxuICAgICAgY29uc3QgZGVwZW5kZW5jaWVzID0gYXdhaXQgZ2V0RGVwZW5kZW5jaWVzKCB0aGlzLnJlcG8gKTtcclxuXHJcbiAgICAgIGNvbnN0IHNoYSA9IGRlcGVuZGVuY2llcy5jaGlwcGVyLnNoYTtcclxuICAgICAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHRoaXMucmVwbywgJ21hc3RlcicgKTtcclxuXHJcbiAgICAgIHJldHVybiBnaXRJc0FuY2VzdG9yKCAnY2hpcHBlcicsICc3Mzc1ZjZhNTdiNTg3NGI2YmJmOTdhNTRjOWE5MDhmMTlmODhkMzhmJywgc2hhICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgcGhldC1pbyBTdHVkaW8gdG9wLWxldmVsIChpbmRleC5odG1sKSBpcyB1c2VkIGluc3RlYWQgb2Ygc3R1ZGlvLmh0bWwuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPGJvb2xlYW4+fVxyXG4gICAgICovXHJcbiAgICBhc3luYyB1c2VzUGhldGlvU3R1ZGlvSW5kZXgoKSB7XHJcbiAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCB0aGlzLnJlcG8sIHRoaXMuYnJhbmNoICk7XHJcbiAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IGF3YWl0IGdldERlcGVuZGVuY2llcyggdGhpcy5yZXBvICk7XHJcblxyXG4gICAgICBjb25zdCBkZXBlbmRlbmN5ID0gZGVwZW5kZW5jaWVzWyAncGhldC1pby13cmFwcGVycycgXTtcclxuICAgICAgaWYgKCAhZGVwZW5kZW5jeSApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHNoYSA9IGRlcGVuZGVuY3kuc2hhO1xyXG4gICAgICBhd2FpdCBnaXRDaGVja291dCggdGhpcy5yZXBvLCAnbWFzdGVyJyApO1xyXG5cclxuICAgICAgcmV0dXJuIGdpdElzQW5jZXN0b3IoICdwaGV0LWlvLXdyYXBwZXJzJywgJzdlYzFhMDRhNzBmYjk3MDdiMzgxYjhiY2FiM2FkMDcwODE1ZWY3ZmUnLCBzaGEgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgd2hldGhlciBhbiBhZGRpdGlvbmFsIGZvbGRlciBleGlzdHMgaW4gdGhlIGJ1aWxkIGRpcmVjdG9yeSBvZiB0aGUgc2ltIGJhc2VkIG9uIHRoZSBicmFuZC5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48Ym9vbGVhbj59XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHVzZXNDaGlwcGVyMigpIHtcclxuICAgICAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHRoaXMucmVwbywgdGhpcy5icmFuY2ggKTtcclxuICAgICAgY29uc3QgZGVwZW5kZW5jaWVzID0gYXdhaXQgZ2V0RGVwZW5kZW5jaWVzKCB0aGlzLnJlcG8gKTtcclxuICAgICAgYXdhaXQgZ2l0Q2hlY2tvdXQoICdjaGlwcGVyJywgZGVwZW5kZW5jaWVzLmNoaXBwZXIuc2hhICk7XHJcblxyXG4gICAgICBjb25zdCBjaGlwcGVyVmVyc2lvbiA9IENoaXBwZXJWZXJzaW9uLmdldEZyb21SZXBvc2l0b3J5KCk7XHJcblxyXG4gICAgICBjb25zdCByZXN1bHQgPSBjaGlwcGVyVmVyc2lvbi5tYWpvciAhPT0gMCB8fCBjaGlwcGVyVmVyc2lvbi5taW5vciAhPT0gMDtcclxuXHJcbiAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCB0aGlzLnJlcG8sICdtYXN0ZXInICk7XHJcbiAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCAnY2hpcHBlcicsICdtYXN0ZXInICk7XHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUnVucyBhIHByZWRpY2F0ZSBmdW5jdGlvbiB3aXRoIHRoZSBjb250ZW50cyBvZiBhIHNwZWNpZmljIGZpbGUncyBjb250ZW50cyBpbiB0aGUgcmVsZWFzZSBicmFuY2ggKHdpdGggZmFsc2UgaWZcclxuICAgICAqIGl0IGRvZXNuJ3QgZXhpc3QpLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKGNvbnRlbnRzOnN0cmluZyk6Ym9vbGVhbn0gcHJlZGljYXRlXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48Ym9vbGVhbj59XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHdpdGhGaWxlKCBmaWxlLCBwcmVkaWNhdGUgKSB7XHJcbiAgICAgIGF3YWl0IHRoaXMuY2hlY2tvdXQoIGZhbHNlICk7XHJcblxyXG4gICAgICBpZiAoIGZzLmV4aXN0c1N5bmMoIGZpbGUgKSApIHtcclxuICAgICAgICBjb25zdCBjb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyggZmlsZSwgJ3V0Zi04JyApO1xyXG4gICAgICAgIHJldHVybiBwcmVkaWNhdGUoIGNvbnRlbnRzICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgYSBsaXN0IG9mIFJlbGVhc2VCcmFuY2hlcyB3aGljaCB3b3VsZCBiZSBwb3RlbnRpYWwgY2FuZGlkYXRlcyBmb3IgYSBtYWludGVuYW5jZSByZWxlYXNlLiBUaGlzIGluY2x1ZGVzOlxyXG4gICAgICogLSBBbGwgcHVibGlzaGVkIHBoZXQgYnJhbmQgcmVsZWFzZSBicmFuY2hlcyAoZnJvbSBtZXRhZGF0YSlcclxuICAgICAqIC0gQWxsIHB1Ymxpc2hlZCBwaGV0LWlvIGJyYW5kIHJlbGVhc2UgYnJhbmNoZXMgKGZyb20gbWV0YWRhdGEpXHJcbiAgICAgKiAtIEFsbCB1bnB1Ymxpc2hlZCBsb2NhbCByZWxlYXNlIGJyYW5jaGVzXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPFJlbGVhc2VCcmFuY2hbXT59XHJcbiAgICAgKiBAcmVqZWN0cyB7RXhlY3V0ZUVycm9yfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0QWxsTWFpbnRlbmFuY2VCcmFuY2hlcygpIHtcclxuICAgICAgd2luc3Rvbi5kZWJ1ZyggJ3JldHJpZXZpbmcgYXZhaWxhYmxlIHNpbSBicmFuY2hlcycgKTtcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKCAnbG9hZGluZyBwaGV0IGJyYW5kIFJlbGVhc2VCcmFuY2hlcycgKTtcclxuICAgICAgY29uc3Qgc2ltTWV0YWRhdGFSZXN1bHQgPSBhd2FpdCBzaW1NZXRhZGF0YSgge1xyXG4gICAgICAgIHR5cGU6ICdodG1sJ1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBSZWxlYXNlZCBwaGV0IGJyYW5jaGVzXHJcbiAgICAgIGNvbnN0IHBoZXRCcmFuY2hlcyA9IHNpbU1ldGFkYXRhUmVzdWx0LnByb2plY3RzLm1hcCggc2ltRGF0YSA9PiB7XHJcbiAgICAgICAgY29uc3QgcmVwbyA9IHNpbURhdGEubmFtZS5zbGljZSggc2ltRGF0YS5uYW1lLmluZGV4T2YoICcvJyApICsgMSApO1xyXG4gICAgICAgIGNvbnN0IGJyYW5jaCA9IGAke3NpbURhdGEudmVyc2lvbi5tYWpvcn0uJHtzaW1EYXRhLnZlcnNpb24ubWlub3J9YDtcclxuICAgICAgICByZXR1cm4gbmV3IFJlbGVhc2VCcmFuY2goIHJlcG8sIGJyYW5jaCwgWyAncGhldCcgXSwgdHJ1ZSApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZyggJ2xvYWRpbmcgcGhldC1pbyBicmFuZCBSZWxlYXNlQnJhbmNoZXMnICk7XHJcbiAgICAgIGNvbnN0IHBoZXRpb0JyYW5jaGVzID0gKCBhd2FpdCBzaW1QaGV0aW9NZXRhZGF0YSgge1xyXG4gICAgICAgIGFjdGl2ZTogdHJ1ZSxcclxuICAgICAgICBsYXRlc3Q6IHRydWVcclxuICAgICAgfSApICkuZmlsdGVyKCBzaW1EYXRhID0+IHNpbURhdGEuYWN0aXZlICYmIHNpbURhdGEubGF0ZXN0ICkubWFwKCBzaW1EYXRhID0+IHtcclxuICAgICAgICBsZXQgYnJhbmNoID0gYCR7c2ltRGF0YS52ZXJzaW9uTWFqb3J9LiR7c2ltRGF0YS52ZXJzaW9uTWlub3J9YDtcclxuICAgICAgICBpZiAoIHNpbURhdGEudmVyc2lvblN1ZmZpeC5sZW5ndGggKSB7XHJcbiAgICAgICAgICBicmFuY2ggKz0gYC0ke3NpbURhdGEudmVyc2lvblN1ZmZpeH1gOyAvLyBhZGRpdGlvbmFsIGRhc2ggcmVxdWlyZWRcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBSZWxlYXNlQnJhbmNoKCBzaW1EYXRhLm5hbWUsIGJyYW5jaCwgWyAncGhldC1pbycgXSwgdHJ1ZSApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZyggJ2xvYWRpbmcgdW5yZWxlYXNlZCBSZWxlYXNlQnJhbmNoZXMnICk7XHJcbiAgICAgIGNvbnN0IHVucmVsZWFzZWRCcmFuY2hlcyA9IFtdO1xyXG4gICAgICBmb3IgKCBjb25zdCByZXBvIG9mIGdldEFjdGl2ZVNpbXMoKSApIHtcclxuXHJcbiAgICAgICAgLy8gRXhjbHVkZSBleHBsaWNpdGx5IGV4Y2x1ZGVkIHJlcG9zXHJcbiAgICAgICAgaWYgKCBKU09OLnBhcnNlKCBmcy5yZWFkRmlsZVN5bmMoIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAsICd1dGY4JyApICkucGhldC5pZ25vcmVGb3JBdXRvbWF0ZWRNYWludGVuYW5jZVJlbGVhc2VzICkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBicmFuY2hlcyA9IGF3YWl0IGdldEJyYW5jaGVzKCByZXBvICk7XHJcbiAgICAgICAgY29uc3QgcmVsZWFzZWRCcmFuY2hlcyA9IHBoZXRCcmFuY2hlcy5jb25jYXQoIHBoZXRpb0JyYW5jaGVzICk7XHJcblxyXG4gICAgICAgIGZvciAoIGNvbnN0IGJyYW5jaCBvZiBicmFuY2hlcyApIHtcclxuICAgICAgICAgIC8vIFdlIGFyZW4ndCB1bnJlbGVhc2VkIGlmIHdlJ3JlIGluY2x1ZGVkIGluIGVpdGhlciBwaGV0IG9yIHBoZXQtaW8gbWV0YWRhdGEuXHJcbiAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2JhbGFuY2luZy1hY3QvaXNzdWVzLzExOFxyXG4gICAgICAgICAgaWYgKCByZWxlYXNlZEJyYW5jaGVzLmZpbHRlciggcmVsZWFzZUJyYW5jaCA9PiByZWxlYXNlQnJhbmNoLnJlcG8gPT09IHJlcG8gJiYgcmVsZWFzZUJyYW5jaC5icmFuY2ggPT09IGJyYW5jaCApLmxlbmd0aCApIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc3QgbWF0Y2ggPSBicmFuY2gubWF0Y2goIC9eKFxcZCspXFwuKFxcZCspJC8gKTtcclxuXHJcbiAgICAgICAgICBpZiAoIG1hdGNoICkge1xyXG4gICAgICAgICAgICBjb25zdCBtYWpvciA9IE51bWJlciggbWF0Y2hbIDEgXSApO1xyXG4gICAgICAgICAgICBjb25zdCBtaW5vciA9IE51bWJlciggbWF0Y2hbIDIgXSApO1xyXG5cclxuICAgICAgICAgICAgLy8gQXNzdW1wdGlvbiB0aGF0IHRoZXJlIGlzIG5vIHBoZXQtaW8gYnJhbmQgc2ltIHRoYXQgaXNuJ3QgYWxzbyByZWxlYXNlZCB3aXRoIHBoZXQgYnJhbmRcclxuICAgICAgICAgICAgY29uc3QgcHJvamVjdE1ldGFkYXRhID0gc2ltTWV0YWRhdGFSZXN1bHQucHJvamVjdHMuZmluZCggcHJvamVjdCA9PiBwcm9qZWN0Lm5hbWUgPT09IGBodG1sLyR7cmVwb31gICkgfHwgbnVsbDtcclxuICAgICAgICAgICAgY29uc3QgcHJvZHVjdGlvblZlcnNpb24gPSBwcm9qZWN0TWV0YWRhdGEgPyBwcm9qZWN0TWV0YWRhdGEudmVyc2lvbiA6IG51bGw7XHJcblxyXG4gICAgICAgICAgICBpZiAoICFwcm9kdWN0aW9uVmVyc2lvbiB8fFxyXG4gICAgICAgICAgICAgICAgIG1ham9yID4gcHJvZHVjdGlvblZlcnNpb24ubWFqb3IgfHxcclxuICAgICAgICAgICAgICAgICAoIG1ham9yID09PSBwcm9kdWN0aW9uVmVyc2lvbi5tYWpvciAmJiBtaW5vciA+IHByb2R1Y3Rpb25WZXJzaW9uLm1pbm9yICkgKSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIERvIGEgY2hlY2tvdXQgc28gd2UgY2FuIGRldGVybWluZSBzdXBwb3J0ZWQgYnJhbmRzXHJcbiAgICAgICAgICAgICAgY29uc3QgcGFja2FnZU9iamVjdCA9IEpTT04ucGFyc2UoIGF3YWl0IGdldEZpbGVBdEJyYW5jaCggcmVwbywgYnJhbmNoLCAncGFja2FnZS5qc29uJyApICk7XHJcbiAgICAgICAgICAgICAgY29uc3QgaW5jbHVkZXNQaGV0aW8gPSBwYWNrYWdlT2JqZWN0LnBoZXQgJiYgcGFja2FnZU9iamVjdC5waGV0LnN1cHBvcnRlZEJyYW5kcyAmJiBwYWNrYWdlT2JqZWN0LnBoZXQuc3VwcG9ydGVkQnJhbmRzLmluY2x1ZGVzKCAncGhldC1pbycgKTtcclxuXHJcbiAgICAgICAgICAgICAgY29uc3QgYnJhbmRzID0gW1xyXG4gICAgICAgICAgICAgICAgJ3BoZXQnLCAvLyBBc3N1bXB0aW9uIHRoYXQgdGhlcmUgaXMgbm8gcGhldC1pbyBicmFuZCBzaW0gdGhhdCBpc24ndCBhbHNvIHJlbGVhc2VkIHdpdGggcGhldCBicmFuZFxyXG4gICAgICAgICAgICAgICAgLi4uKCBpbmNsdWRlc1BoZXRpbyA/IFsgJ3BoZXQtaW8nIF0gOiBbXSApXHJcbiAgICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKCAhcGFja2FnZU9iamVjdC5waGV0Lmlnbm9yZUZvckF1dG9tYXRlZE1haW50ZW5hbmNlUmVsZWFzZXMgKSB7XHJcbiAgICAgICAgICAgICAgICB1bnJlbGVhc2VkQnJhbmNoZXMucHVzaCggbmV3IFJlbGVhc2VCcmFuY2goIHJlcG8sIGJyYW5jaCwgYnJhbmRzLCBmYWxzZSApICk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gUmVsZWFzZUJyYW5jaC5jb21iaW5lTGlzdHMoIFsgLi4ucGhldEJyYW5jaGVzLCAuLi5waGV0aW9CcmFuY2hlcywgLi4udW5yZWxlYXNlZEJyYW5jaGVzIF0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbWJpbmVzIG11bHRpcGxlIG1hdGNoaW5nIFJlbGVhc2VCcmFuY2hlcyBpbnRvIG9uZSB3aGVyZSBhcHByb3ByaWF0ZSwgYW5kIHNvcnRzLiBGb3IgZXhhbXBsZSwgdHdvIFJlbGVhc2VCcmFuY2hlc1xyXG4gICAgICogb2YgdGhlIHNhbWUgcmVwbyBidXQgZm9yIGRpZmZlcmVudCBicmFuZHMgYXJlIGNvbWJpbmVkIGludG8gYSBzaW5nbGUgUmVsZWFzZUJyYW5jaCB3aXRoIG11bHRpcGxlIGJyYW5kcy5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5LjxSZWxlYXNlQnJhbmNoPn0gc2ltQnJhbmNoZXNcclxuICAgICAqIEByZXR1cm5zIHtBcnJheS48UmVsZWFzZUJyYW5jaD59XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBjb21iaW5lTGlzdHMoIHNpbUJyYW5jaGVzICkge1xyXG4gICAgICBjb25zdCByZXN1bHRCcmFuY2hlcyA9IFtdO1xyXG5cclxuICAgICAgZm9yICggY29uc3Qgc2ltQnJhbmNoIG9mIHNpbUJyYW5jaGVzICkge1xyXG4gICAgICAgIGxldCBmb3VuZEJyYW5jaCA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAoIGNvbnN0IHJlc3VsdEJyYW5jaCBvZiByZXN1bHRCcmFuY2hlcyApIHtcclxuICAgICAgICAgIGlmICggc2ltQnJhbmNoLnJlcG8gPT09IHJlc3VsdEJyYW5jaC5yZXBvICYmIHNpbUJyYW5jaC5icmFuY2ggPT09IHJlc3VsdEJyYW5jaC5icmFuY2ggKSB7XHJcbiAgICAgICAgICAgIGZvdW5kQnJhbmNoID0gdHJ1ZTtcclxuICAgICAgICAgICAgcmVzdWx0QnJhbmNoLmJyYW5kcyA9IFsgLi4ucmVzdWx0QnJhbmNoLmJyYW5kcywgLi4uc2ltQnJhbmNoLmJyYW5kcyBdO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCAhZm91bmRCcmFuY2ggKSB7XHJcbiAgICAgICAgICByZXN1bHRCcmFuY2hlcy5wdXNoKCBzaW1CcmFuY2ggKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlc3VsdEJyYW5jaGVzLnNvcnQoICggYSwgYiApID0+IHtcclxuICAgICAgICBpZiAoIGEucmVwbyAhPT0gYi5yZXBvICkge1xyXG4gICAgICAgICAgcmV0dXJuIGEucmVwbyA8IGIucmVwbyA/IC0xIDogMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBhLmJyYW5jaCAhPT0gYi5icmFuY2ggKSB7XHJcbiAgICAgICAgICByZXR1cm4gYS5icmFuY2ggPCBiLmJyYW5jaCA/IC0xIDogMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHJldHVybiByZXN1bHRCcmFuY2hlcztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBSZWxlYXNlQnJhbmNoO1xyXG59ICkoKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLGNBQWMsR0FBR0MsT0FBTyxDQUFFLGtCQUFtQixDQUFDO0FBQ3BELE1BQU1DLGNBQWMsR0FBR0QsT0FBTyxDQUFFLGtCQUFtQixDQUFDO0FBQ3BELE1BQU1FLGVBQWUsR0FBR0YsT0FBTyxDQUFFLG1CQUFvQixDQUFDO0FBQ3RELE1BQU1HLE9BQU8sR0FBR0gsT0FBTyxDQUFFLFdBQVksQ0FBQztBQUN0QyxNQUFNSSxhQUFhLEdBQUdKLE9BQU8sQ0FBRSxpQkFBa0IsQ0FBQztBQUNsRCxNQUFNSyxxQkFBcUIsR0FBR0wsT0FBTyxDQUFFLHlCQUEwQixDQUFDO0FBQ2xFLE1BQU1NLFdBQVcsR0FBR04sT0FBTyxDQUFFLGVBQWdCLENBQUM7QUFDOUMsTUFBTU8saUJBQWlCLEdBQUdQLE9BQU8sQ0FBRSxxQkFBc0IsQ0FBQztBQUMxRCxNQUFNUSxlQUFlLEdBQUdSLE9BQU8sQ0FBRSxtQkFBb0IsQ0FBQztBQUN0RCxNQUFNUyxZQUFZLEdBQUdULE9BQU8sQ0FBRSxnQkFBaUIsQ0FBQztBQUNoRCxNQUFNVSxnQkFBZ0IsR0FBR1YsT0FBTyxDQUFFLG9CQUFxQixDQUFDO0FBQ3hELE1BQU1XLGVBQWUsR0FBR1gsT0FBTyxDQUFFLG1CQUFvQixDQUFDO0FBQ3RELE1BQU1ZLFdBQVcsR0FBR1osT0FBTyxDQUFFLGVBQWdCLENBQUM7QUFDOUMsTUFBTWEsUUFBUSxHQUFH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