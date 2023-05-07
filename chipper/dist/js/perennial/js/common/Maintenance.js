// Copyright 2018, University of Colorado Boulder

/**
 * The main persistent state-bearing object for maintenance releases. Can be loaded from or saved to a dedicated file.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const production = require('../grunt/production');
const rc = require('../grunt/rc');
const ChipperVersion = require('./ChipperVersion');
const ModifiedBranch = require('./ModifiedBranch');
const Patch = require('./Patch');
const ReleaseBranch = require('./ReleaseBranch');
const build = require('./build');
const checkoutMaster = require('./checkoutMaster');
const checkoutTarget = require('./checkoutTarget');
const execute = require('./execute');
const getActiveRepos = require('./getActiveRepos');
const getBranches = require('./getBranches');
const getBranchMap = require('./getBranchMap');
const getDependencies = require('./getDependencies');
const gitAdd = require('./gitAdd');
const gitCheckout = require('./gitCheckout');
const gitCherryPick = require('./gitCherryPick');
const gitCommit = require('./gitCommit');
const gitCreateBranch = require('./gitCreateBranch');
const gitIsClean = require('./gitIsClean');
const gitPull = require('./gitPull');
const gitPush = require('./gitPush');
const gitRevParse = require('./gitRevParse');
const assert = require('assert');
const fs = require('fs');
const repl = require('repl');
const winston = require('winston');
const gruntCommand = require('./gruntCommand');
const chipperSupportsOutputJSGruntTasks = require('./chipperSupportsOutputJSGruntTasks');

// constants
const MAINTENANCE_FILE = '.maintenance.json';

// const PUBLIC_FUNCTIONS = [
//   'addAllNeededPatches',
//   'addNeededPatch',
//   'addNeededPatches',
//   'addNeededPatchesAfter',
//   'addNeededPatchesBefore',
//   'addNeededPatchesBuildFilter',
//   'addNeededPatchReleaseBranch',
//   'addPatchSHA',
//   'applyPatches',
//   'buildAll',
//   'checkBranchStatus',
//   'checkoutBranch',
//   'createPatch',
//   'deployProduction',
//   'deployReleaseCandidates',
//   'list',
//   'listLinks',
//   'removeNeededPatch',
//   'removeNeededPatches',
//   'removeNeededPatchesAfter',
//   'removeNeededPatchesBefore',
//   'removePatch',
//   'removePatchSHA',
//   'reset',
//   'updateDependencies'
//   'getAllMaintenanceBranches'
// ];

/**
 * @typedef SerializedMaintenance - see Maintenance.serialize()
 * @property {Array.<Object>} patches
 * @property {Array.<Object>} modifiedBranches
 * @property {Array.<Object>} allReleaseBranches
 */

module.exports = function () {
  class Maintenance {
    /**
     * @public
     * @constructor
     *
     * @param {Array.<Patch>} [patches]
     * @param {Array.<ModifiedBranch>} [modifiedBranches]
     * @param  {Array.<ReleaseBranch>} [allReleaseBranches]
     */
    constructor(patches = [], modifiedBranches = [], allReleaseBranches = []) {
      assert(Array.isArray(patches));
      patches.forEach(patch => assert(patch instanceof Patch));
      assert(Array.isArray(modifiedBranches));
      modifiedBranches.forEach(branch => assert(branch instanceof ModifiedBranch));

      // @public {Array.<Patch>}
      this.patches = patches;

      // @public {Array.<ModifiedBranch>}
      this.modifiedBranches = modifiedBranches;

      // @public {Array.<ReleaseBranch>}
      this.allReleaseBranches = allReleaseBranches;
    }

    /**
     * Resets ALL of the maintenance state to a default "blank" state.
     * @public
     *
     * CAUTION: This will remove any information about any ongoing/complete maintenance release from your
     * .maintenance.json. Generally this should be done before any new maintenance release.
     */
    static reset() {
      console.log('Make sure to check on the active PhET-iO Deploy Status on phet.colorado.edu to ensure that the ' + 'right PhET-iO sims are included in this maintenance release.');
      new Maintenance().save();
    }

    /**
     * Runs a number of checks through every release branch.
     * @public
     *
     * @param {function(ReleaseBranch):Promise.<boolean>} [filter] - Optional filter, release branches will be skipped
     *                                                               if this resolves to false
     * @returns {Promise}
     */
    static async checkBranchStatus(filter) {
      for (const repo of getActiveRepos()) {
        if (repo !== 'perennial' && !(await gitIsClean(repo))) {
          console.log(`Unclean repository: ${repo}, please resolve this and then run checkBranchStatus again`);
          return;
        }
      }
      const releaseBranches = await Maintenance.getMaintenanceBranches(filter);

      // Set up a cache of branchMaps so that we don't make multiple requests
      const branchMaps = {};
      const getBranchMapAsyncCallback = async repo => {
        if (!branchMaps[repo]) {
          branchMaps[repo] = await getBranchMap(repo);
        }
        return branchMaps[repo];
      };
      for (const releaseBranch of releaseBranches) {
        if (!filter || (await filter(releaseBranch))) {
          console.log(`${releaseBranch.repo} ${releaseBranch.branch}`);
          for (const line of await releaseBranch.getStatus(getBranchMapAsyncCallback)) {
            console.log(`  ${line}`);
          }
        } else {
          console.log(`${releaseBranch.repo} ${releaseBranch.branch} (skipping due to filter)`);
        }
      }
    }

    /**
     * Builds all release branches (so that the state of things can be checked). Puts in in perennial/build.
     * @public
     */
    static async buildAll() {
      const releaseBranches = await Maintenance.getMaintenanceBranches();
      const failed = [];
      for (const releaseBranch of releaseBranches) {
        console.log(`building ${releaseBranch.repo} ${releaseBranch.branch}`);
        try {
          await checkoutTarget(releaseBranch.repo, releaseBranch.branch, true); // include npm update
          await build(releaseBranch.repo, {
            brands: releaseBranch.brands
          });
          throw new Error('UNIMPLEMENTED, copy over');
        } catch (e) {
          failed.push(`${releaseBranch.repo} ${releaseBranch.brand}`);
        }
      }
      if (failed.length) {
        console.log(`Failed builds:\n${failed.join('\n')}`);
      } else {
        console.log('Builds complete');
      }
    }

    /**
     * Displays a listing of the current maintenance status.
     * @public
     *
     * @returns {Promise}
     */
    static async list() {
      const maintenance = Maintenance.load();
      if (maintenance.allReleaseBranches.length > 0) {
        console.log(`${maintenance.allReleaseBranches.length} ReleaseBranches loaded`);
      }
      for (const modifiedBranch of maintenance.modifiedBranches) {
        console.log(`${modifiedBranch.repo} ${modifiedBranch.branch} ${modifiedBranch.brands.join(',')}${modifiedBranch.releaseBranch.isReleased ? '' : ' (unreleased)'}`);
        if (modifiedBranch.deployedVersion) {
          console.log(`  deployed: ${modifiedBranch.deployedVersion.toString()}`);
        }
        if (modifiedBranch.neededPatches.length) {
          console.log(`  needs: ${modifiedBranch.neededPatches.map(patch => patch.name).join(',')}`);
        }
        if (modifiedBranch.pushedMessages.length) {
          console.log(`  pushedMessages: ${modifiedBranch.pushedMessages.join(' and ')}`);
        }
        if (modifiedBranch.pendingMessages.length) {
          console.log(`  pendingMessages: ${modifiedBranch.pendingMessages.join(' and ')}`);
        }
        if (Object.keys(modifiedBranch.changedDependencies).length > 0) {
          console.log('  deps:');
          for (const key of Object.keys(modifiedBranch.changedDependencies)) {
            console.log(`    ${key}: ${modifiedBranch.changedDependencies[key]}`);
          }
        }
      }
      for (const patch of maintenance.patches) {
        console.log(`[${patch.name}]${patch.name !== patch.repo ? ` (${patch.repo})` : ''} ${patch.message}`);
        for (const sha of patch.shas) {
          console.log(`  ${sha}`);
        }
        for (const modifiedBranch of maintenance.modifiedBranches) {
          if (modifiedBranch.neededPatches.includes(patch)) {
            console.log(`    ${modifiedBranch.repo} ${modifiedBranch.branch} ${modifiedBranch.brands.join(',')}`);
          }
        }
      }
    }

    /**
     * Shows any required testing links for the simulations.
     * @public
     *
     * @param {function(ModifiedBranch):boolean} [filter] - Control which branches are shown
     */
    static async listLinks(filter = () => true) {
      const maintenance = Maintenance.load();
      const deployedBranches = maintenance.modifiedBranches.filter(modifiedBranch => !!modifiedBranch.deployedVersion && filter(modifiedBranch));
      const productionBranches = deployedBranches.filter(modifiedBranch => modifiedBranch.deployedVersion.testType === null);
      const releaseCandidateBranches = deployedBranches.filter(modifiedBranch => modifiedBranch.deployedVersion.testType === 'rc');
      if (productionBranches.length) {
        console.log('\nProduction links\n');
        for (const modifiedBranch of productionBranches) {
          const links = await modifiedBranch.getDeployedLinkLines();
          for (const link of links) {
            console.log(link);
          }
        }
      }
      if (releaseCandidateBranches.length) {
        console.log('\nRelease Candidate links\n');
        for (const modifiedBranch of releaseCandidateBranches) {
          const links = await modifiedBranch.getDeployedLinkLines();
          for (const link of links) {
            console.log(link);
          }
        }
      }
    }

    /**
     * Creates an issue to note patches on all unreleased branches that include a pushed message.
     * @public
     *
     * @param {string} [additionalNotes]
     */
    static async createUnreleasedIssues(additionalNotes = '') {
      const maintenance = Maintenance.load();
      for (const modifiedBranch of maintenance.modifiedBranches) {
        if (!modifiedBranch.releaseBranch.isReleased && modifiedBranch.pushedMessages.length > 0) {
          console.log(`Creating issue for ${modifiedBranch.releaseBranch.toString()}`);
          await modifiedBranch.createUnreleasedIssue(additionalNotes);
        }
      }
      console.log('Finished creating unreleased issues');
    }

    /**
     * Creates a patch
     * @public
     *
     * @param {string} repo
     * @param {string} message
     * @param {string} [patchName] - If no name is provided, the repo string will be used.
     * @returns {Promise}
     */
    static async createPatch(repo, message, patchName) {
      const maintenance = Maintenance.load();
      patchName = patchName || repo;
      for (const patch of maintenance.patches) {
        if (patch.name === patchName) {
          throw new Error('Multiple patches with the same name are not concurrently supported');
        }
      }
      maintenance.patches.push(new Patch(repo, patchName, message));
      maintenance.save();
      console.log(`Created patch for ${repo} with message: ${message}`);
    }

    /**
     * Removes a patch
     * @public
     *
     * @param {string} patchName
     * @returns {Promise}
     */
    static async removePatch(patchName) {
      const maintenance = Maintenance.load();
      const patch = maintenance.findPatch(patchName);
      for (const branch of maintenance.modifiedBranches) {
        if (branch.neededPatches.includes(patch)) {
          throw new Error('Patch is marked as needed by at least one branch');
        }
      }
      maintenance.patches.splice(maintenance.patches.indexOf(patch), 1);
      maintenance.save();
      console.log(`Removed patch for ${patchName}`);
    }

    /**
     * Adds a particular SHA (to cherry-pick) to a patch.
     * @public
     *
     * @param {string} patchName
     * @param {string} [sha]
     * @returns {Promise}
     */
    static async addPatchSHA(patchName, sha) {
      const maintenance = Maintenance.load();
      const patch = maintenance.findPatch(patchName);
      if (!sha) {
        sha = await gitRevParse(patch.repo, 'HEAD');
        console.log(`SHA not provided, detecting SHA: ${sha}`);
      }
      patch.shas.push(sha);
      maintenance.save();
      console.log(`Added SHA ${sha} to patch ${patchName}`);
    }

    /**
     * Removes a particular SHA (to cherry-pick) from a patch.
     * @public
     *
     * @param {string} patchName
     * @param {string} sha
     * @returns {Promise}
     */
    static async removePatchSHA(patchName, sha) {
      const maintenance = Maintenance.load();
      const patch = maintenance.findPatch(patchName);
      const index = patch.shas.indexOf(sha);
      assert(index >= 0, 'SHA not found');
      patch.shas.splice(index, 1);
      maintenance.save();
      console.log(`Removed SHA ${sha} from patch ${patchName}`);
    }

    /**
     * Removes all patch SHAs for a particular patch.
     * @public
     *
     * @param {string} patchName
     * @returns {Promise}
     */
    static async removeAllPatchSHAs(patchName) {
      const maintenance = Maintenance.load();
      const patch = maintenance.findPatch(patchName);
      for (const sha of patch.shas) {
        console.log(`Removing SHA ${sha} from patch ${patchName}`);
      }
      patch.shas = [];
      maintenance.save();
    }

    /**
     * Adds a needed patch to a given modified branch.
     * @public
     *
     * @param {string} repo
     * @param {string} branch
     * @param {string} patchName
     */
    static async addNeededPatch(repo, branch, patchName) {
      const maintenance = Maintenance.load();
      const patch = maintenance.findPatch(patchName);
      const modifiedBranch = await maintenance.ensureModifiedBranch(repo, branch);
      modifiedBranch.neededPatches.push(patch);
      maintenance.save();
      console.log(`Added patch ${patchName} as needed for ${repo} ${branch}`);
    }

    /**
     * Adds a needed patch to a given release branch
     * @public
     *
     * @param {ReleaseBranch} releaseBranch
     * @param {string} patchName
     */
    static async addNeededPatchReleaseBranch(releaseBranch, patchName) {
      const maintenance = Maintenance.load();
      const patch = maintenance.findPatch(patchName);
      const modifiedBranch = new ModifiedBranch(releaseBranch);
      maintenance.modifiedBranches.push(modifiedBranch);
      modifiedBranch.neededPatches.push(patch);
      maintenance.save();
      console.log(`Added patch ${patchName} as needed for ${releaseBranch.repo} ${releaseBranch.branch}`);
    }

    /**
     * Adds a needed patch to whatever subset of release branches match the filter.
     * @public
     *
     * @param {string} patchName
     * @param {function(ReleaseBranch):Promise.<boolean>} filter
     */
    static async addNeededPatches(patchName, filter) {
      const maintenance = Maintenance.load();
      const patch = maintenance.findPatch(patchName);
      const releaseBranches = await Maintenance.getMaintenanceBranches();
      for (const releaseBranch of releaseBranches) {
        const needsPatch = await filter(releaseBranch);
        if (!needsPatch) {
          console.log(`  skipping ${releaseBranch.repo} ${releaseBranch.branch}`);
          continue;
        }
        const modifiedBranch = await maintenance.ensureModifiedBranch(releaseBranch.repo, releaseBranch.branch, false, releaseBranches);
        if (!modifiedBranch.neededPatches.includes(patch)) {
          modifiedBranch.neededPatches.push(patch);
          console.log(`Added needed patch ${patchName} to ${releaseBranch.repo} ${releaseBranch.branch}`);
          maintenance.save(); // save here in case a future failure would "revert" things
        } else {
          console.log(`Patch ${patchName} already included in ${releaseBranch.repo} ${releaseBranch.branch}`);
        }
      }
      maintenance.save();
    }

    /**
     * Adds a needed patch to all release branches.
     * @public
     *
     * @param {string} patchName
     */
    static async addAllNeededPatches(patchName) {
      await Maintenance.addNeededPatches(patchName, async () => true);
    }

    /**
     * Adds a needed patch to all release branches that do NOT include the given commit on the repo
     * @public
     *
     * @param {string} patchName
     * @param {string} sha
     */
    static async addNeededPatchesBefore(patchName, sha) {
      const maintenance = Maintenance.load();
      const patch = maintenance.findPatch(patchName);
      await Maintenance.addNeededPatches(patchName, async releaseBranch => {
        return releaseBranch.isMissingSHA(patch.repo, sha);
      });
    }

    /**
     * Adds a needed patch to all release branches that DO include the given commit on the repo
     * @public
     *
     * @param {string} patchName
     * @param {string} sha
     */
    static async addNeededPatchesAfter(patchName, sha) {
      const maintenance = Maintenance.load();
      const patch = maintenance.findPatch(patchName);
      await Maintenance.addNeededPatches(patchName, async releaseBranch => {
        return releaseBranch.includesSHA(patch.repo, sha);
      });
    }

    /**
     * Adds a needed patch to all release branches that satisfy the given filter( releaseBranch, builtFileString )
     * where it builds the simulation with the defaults (brand=phet) and provides it as a string.
     * @public
     *
     * @param {string} patchName
     * @param {function(ReleaseBranch, builtFile:string): Promise.<boolean>} filter
     */
    static async addNeededPatchesBuildFilter(patchName, filter) {
      await Maintenance.addNeededPatches(patchName, async releaseBranch => {
        await checkoutTarget(releaseBranch.repo, releaseBranch.branch, true);
        await gitPull(releaseBranch.repo);
        await build(releaseBranch.repo);
        const chipperVersion = ChipperVersion.getFromRepository();
        let filename;
        if (chipperVersion.major !== 0) {
          filename = `../${releaseBranch.repo}/build/phet/${releaseBranch.repo}_en_phet.html`;
        } else {
          filename = `../${releaseBranch.repo}/build/${releaseBranch.repo}_en.html`;
        }
        return filter(releaseBranch, fs.readFileSync(filename, 'utf8'));
      });
    }

    /**
     * Removes a needed patch from a given modified branch.
     * @public
     *
     * @param {string} repo
     * @param {string} branch
     * @param {string} patchName
     */
    static async removeNeededPatch(repo, branch, patchName) {
      const maintenance = Maintenance.load();
      const patch = maintenance.findPatch(patchName);
      const modifiedBranch = await maintenance.ensureModifiedBranch(repo, branch);
      const index = modifiedBranch.neededPatches.indexOf(patch);
      assert(index >= 0, 'Could not find needed patch on the modified branch');
      modifiedBranch.neededPatches.splice(index, 1);
      maintenance.tryRemovingModifiedBranch(modifiedBranch);
      maintenance.save();
      console.log(`Removed patch ${patchName} from ${repo} ${branch}`);
    }

    /**
     * Removes a needed patch from whatever subset of (current) release branches match the filter.
     * @public
     *
     * @param {string} patchName
     * @param {function(ReleaseBranch): Promise.<boolean>} filter
     */
    static async removeNeededPatches(patchName, filter) {
      const maintenance = Maintenance.load();
      const patch = maintenance.findPatch(patchName);
      for (const modifiedBranch of maintenance.modifiedBranches) {
        const needsRemoval = await filter(modifiedBranch.releaseBranch);
        if (!needsRemoval) {
          console.log(`  skipping ${modifiedBranch.repo} ${modifiedBranch.branch}`);
          continue;
        }

        // Check if there's actually something to remove
        const index = modifiedBranch.neededPatches.indexOf(patch);
        if (index < 0) {
          continue;
        }
        modifiedBranch.neededPatches.splice(index, 1);
        maintenance.tryRemovingModifiedBranch(modifiedBranch);
        console.log(`Removed needed patch ${patchName} from ${modifiedBranch.repo} ${modifiedBranch.branch}`);
      }
      maintenance.save();
    }

    /**
     * Removes a needed patch from all release branches that do NOT include the given commit on the repo
     * @public
     *
     * @param {string} patchName
     * @param {string} sha
     */
    static async removeNeededPatchesBefore(patchName, sha) {
      const maintenance = Maintenance.load();
      const patch = maintenance.findPatch(patchName);
      await Maintenance.removeNeededPatches(patchName, async releaseBranch => {
        return releaseBranch.isMissingSHA(patch.repo, sha);
      });
    }

    /**
     * Removes a needed patch from all release branches that DO include the given commit on the repo
     * @public
     *
     * @param {string} patchName
     * @param {string} sha
     */
    static async removeNeededPatchesAfter(patchName, sha) {
      const maintenance = Maintenance.load();
      const patch = maintenance.findPatch(patchName);
      await Maintenance.removeNeededPatches(patchName, async releaseBranch => {
        return releaseBranch.includesSHA(patch.repo, sha);
      });
    }

    /**
     * Helper for adding patches based on specific patterns, e.g.:
     * Maintenance.addNeededPatches( 'phetmarks', Maintenance.singleFileReleaseBranchFilter( '../phetmarks/js/phetmarks.js' ), content => content.includes( 'data/wrappers' ) );
     * @public
     *
     * @param {string} file
     * @param {function(string):boolean}
     * @returns {function}
     */
    static singleFileReleaseBranchFilter(file, predicate) {
      return async releaseBranch => {
        await releaseBranch.checkout(false);
        if (fs.existsSync(file)) {
          const contents = fs.readFileSync(file, 'utf-8');
          return predicate(contents);
        }
        return false;
      };
    }

    /**
     * Checks out a specific branch (using local commit data as necessary).
     * @public
     *
     * @param {string} repo
     * @param {string} branch
     * @param {boolean} outputJS=false - if true, once checked out this will also run `grunt output-js-project`
     */
    static async checkoutBranch(repo, branch, outputJS = false) {
      const maintenance = Maintenance.load();
      const modifiedBranch = await maintenance.ensureModifiedBranch(repo, branch, true);
      await modifiedBranch.checkout();
      if (outputJS && chipperSupportsOutputJSGruntTasks()) {
        console.log('Running output-js-project');

        // We might not be able to run this command!
        await execute(gruntCommand, ['output-js-project'], `../${repo}`, {
          errors: 'resolve'
        });
      }

      // No need to save, shouldn't be changing things
      console.log(`Checked out ${repo} ${branch}`);
    }

    /**
     * Attempts to apply patches to the modified branches that are marked as needed.
     * @public
     */
    static async applyPatches() {
      const maintenance = Maintenance.load();
      let numApplied = 0;
      for (const modifiedBranch of maintenance.modifiedBranches) {
        if (modifiedBranch.neededPatches.length === 0) {
          continue;
        }
        const repo = modifiedBranch.repo;
        const branch = modifiedBranch.branch;

        // Defensive copy, since we modify it during iteration
        for (const patch of modifiedBranch.neededPatches.slice()) {
          if (patch.shas.length === 0) {
            continue;
          }
          const patchRepo = patch.repo;
          try {
            // Checkout whatever the latest patched SHA is (if we've patched it)
            if (modifiedBranch.changedDependencies[patchRepo]) {
              await gitCheckout(patchRepo, modifiedBranch.changedDependencies[patchRepo]);
            } else {
              // Look up the SHA to check out
              await gitCheckout(repo, branch);
              await gitPull(repo);
              const dependencies = await getDependencies(repo);
              const sha = dependencies[patchRepo].sha;
              await gitCheckout(repo, 'master');

              // Then check it out
              await gitCheckout(patchRepo, sha);
            }
            console.log(`Checked out ${patchRepo} SHA for ${repo} ${branch}`);
            for (const sha of patch.shas) {
              const cherryPickSuccess = await gitCherryPick(patchRepo, sha);
              if (cherryPickSuccess) {
                const currentSHA = await gitRevParse(patchRepo, 'HEAD');
                console.log(`Cherry-pick success for ${sha}, result is ${currentSHA}`);
                modifiedBranch.changedDependencies[patchRepo] = currentSHA;
                modifiedBranch.neededPatches.splice(modifiedBranch.neededPatches.indexOf(patch), 1);
                numApplied++;

                // Don't include duplicate messages, since multiple patches might be for a single issue
                if (!modifiedBranch.pendingMessages.includes(patch.message)) {
                  modifiedBranch.pendingMessages.push(patch.message);
                }
                break;
              } else {
                console.log(`Could not cherry-pick ${sha}`);
              }
            }
          } catch (e) {
            maintenance.save();
            throw new Error(`Failure applying patch ${patchRepo} to ${repo} ${branch}: ${e}`);
          }
        }
        await gitCheckout(modifiedBranch.repo, 'master');
      }
      maintenance.save();
      console.log(`${numApplied} patches applied`);
    }

    /**
     * Pushes local changes up to GitHub.
     * @public
     *
     * @param {function(ModifiedBranch):Promise.<boolean>} [filter] - Optional filter, modified branches will be skipped
     *                                                                if this resolves to false
     */
    static async updateDependencies(filter) {
      const maintenance = Maintenance.load();
      for (const modifiedBranch of maintenance.modifiedBranches) {
        const changedRepos = Object.keys(modifiedBranch.changedDependencies);
        if (changedRepos.length === 0) {
          continue;
        }
        if (filter && !(await filter(modifiedBranch))) {
          console.log(`Skipping dependency update for ${modifiedBranch.repo} ${modifiedBranch.branch}`);
          continue;
        }
        try {
          // No NPM needed
          await checkoutTarget(modifiedBranch.repo, modifiedBranch.branch, false);
          console.log(`Checked out ${modifiedBranch.repo} ${modifiedBranch.branch}`);
          const dependenciesJSONFile = `../${modifiedBranch.repo}/dependencies.json`;
          const dependenciesJSON = JSON.parse(fs.readFileSync(dependenciesJSONFile, 'utf-8'));

          // Modify the "self" in the dependencies.json as expected
          dependenciesJSON[modifiedBranch.repo].sha = await gitRevParse(modifiedBranch.repo, modifiedBranch.branch);
          for (const dependency of changedRepos) {
            const dependencyBranch = modifiedBranch.dependencyBranch;
            const branches = await getBranches(dependency);
            const sha = modifiedBranch.changedDependencies[dependency];
            dependenciesJSON[dependency].sha = sha;
            if (branches.includes(dependencyBranch)) {
              console.log(`Branch ${dependencyBranch} already exists in ${dependency}`);
              await gitCheckout(dependency, dependencyBranch);
              await gitPull(dependency);
              const currentSHA = await gitRevParse(dependency, 'HEAD');
              if (sha !== currentSHA) {
                console.log(`Attempting to (hopefully fast-forward) merge ${sha}`);
                await execute('git', ['merge', sha], `../${dependency}`);
                await gitPush(dependency, dependencyBranch);
              }
            } else {
              console.log(`Branch ${dependencyBranch} does not exist in ${dependency}, creating.`);
              await gitCheckout(dependency, sha);
              await gitCreateBranch(dependency, dependencyBranch);
              await gitPush(dependency, dependencyBranch);
            }
            delete modifiedBranch.changedDependencies[dependency];
            modifiedBranch.deployedVersion = null;
            maintenance.save(); // save here in case a future failure would "revert" things
          }

          const message = modifiedBranch.pendingMessages.join(' and ');
          fs.writeFileSync(dependenciesJSONFile, JSON.stringify(dependenciesJSON, null, 2));
          await gitAdd(modifiedBranch.repo, 'dependencies.json');
          await gitCommit(modifiedBranch.repo, `updated dependencies.json for ${message}`);
          await gitPush(modifiedBranch.repo, modifiedBranch.branch);

          // Move messages from pending to pushed
          for (const message of modifiedBranch.pendingMessages) {
            if (!modifiedBranch.pushedMessages.includes(message)) {
              modifiedBranch.pushedMessages.push(message);
            }
          }
          modifiedBranch.pendingMessages = [];
          maintenance.save(); // save here in case a future failure would "revert" things

          await checkoutMaster(modifiedBranch.repo, false);
        } catch (e) {
          maintenance.save();
          throw new Error(`Failure updating dependencies for ${modifiedBranch.repo} to ${modifiedBranch.branch}: ${e}`);
        }
      }
      maintenance.save();
      console.log('Dependencies updated');
    }

    /**
     * Deploys RC versions of the modified branches that need it.
     * @public
     *
     * @param {function(ModifiedBranch):Promise.<boolean>} [filter] - Optional filter, modified branches will be skipped
     *                                                                if this resolves to false
     */
    static async deployReleaseCandidates(filter) {
      const maintenance = Maintenance.load();
      for (const modifiedBranch of maintenance.modifiedBranches) {
        if (!modifiedBranch.isReadyForReleaseCandidate || !modifiedBranch.releaseBranch.isReleased) {
          continue;
        }
        console.log('================================================');
        if (filter && !(await filter(modifiedBranch))) {
          console.log(`Skipping RC deploy for ${modifiedBranch.repo} ${modifiedBranch.branch}`);
          continue;
        }
        try {
          console.log(`Running RC deploy for ${modifiedBranch.repo} ${modifiedBranch.branch}`);
          const version = await rc(modifiedBranch.repo, modifiedBranch.branch, modifiedBranch.brands, true, modifiedBranch.pushedMessages.join(', '));
          modifiedBranch.deployedVersion = version;
          maintenance.save(); // save here in case a future failure would "revert" things
        } catch (e) {
          maintenance.save();
          throw new Error(`Failure with RC deploy for ${modifiedBranch.repo} to ${modifiedBranch.branch}: ${e}`);
        }
      }
      maintenance.save();
      console.log('RC versions deployed');
    }

    /**
     * Deploys production versions of the modified branches that need it.
     * @public
     *
     * @param {function(ModifiedBranch):Promise.<boolean>} [filter] - Optional filter, modified branches will be skipped
     *                                                                if this resolves to false
     */
    static async deployProduction(filter) {
      const maintenance = Maintenance.load();
      for (const modifiedBranch of maintenance.modifiedBranches) {
        if (!modifiedBranch.isReadyForProduction || !modifiedBranch.releaseBranch.isReleased) {
          continue;
        }
        if (filter && !(await filter(modifiedBranch))) {
          console.log(`Skipping production deploy for ${modifiedBranch.repo} ${modifiedBranch.branch}`);
          continue;
        }
        try {
          console.log(`Running production deploy for ${modifiedBranch.repo} ${modifiedBranch.branch}`);
          const version = await production(modifiedBranch.repo, modifiedBranch.branch, modifiedBranch.brands, true, modifiedBranch.pushedMessages.join(', '));
          modifiedBranch.deployedVersion = version;
          modifiedBranch.pushedMessages = [];
          maintenance.save(); // save here in case a future failure would "revert" things
        } catch (e) {
          maintenance.save();
          throw new Error(`Failure with production deploy for ${modifiedBranch.repo} to ${modifiedBranch.branch}: ${e}`);
        }
      }
      maintenance.save();
      console.log('production versions deployed');
    }

    /**
     * @public
     *
     * @param {function(ReleaseBranch):Promise.<boolean>} [filter] - Optional filter, release branches will be skipped
     *                                                               if this resolves to false
     */
    static async updateCheckouts(filter) {
      console.log('Updating checkouts');
      const releaseBranches = await Maintenance.getMaintenanceBranches();
      for (const releaseBranch of releaseBranches) {
        if (!filter || (await filter(releaseBranch))) {
          console.log(`Updating ${releaseBranch}`);
          await releaseBranch.updateCheckout();
          await releaseBranch.transpile();
          try {
            await releaseBranch.build();
          } catch (e) {
            console.log(`failed to build ${releaseBranch.toString()} ${e}`);
          }
        }
      }
    }

    /**
     * @public
     *
     * @param {function(ReleaseBranch):Promise.<boolean>} [filter] - Optional filter, release branches will be skipped
     *                                                               if this resolves to false
     */
    static async checkUnbuiltCheckouts(filter) {
      console.log('Checking unbuilt checkouts');
      const releaseBranches = await Maintenance.getMaintenanceBranches();
      for (const releaseBranch of releaseBranches) {
        if (!filter || (await filter(releaseBranch))) {
          console.log(releaseBranch.toString());
          const unbuiltResult = await releaseBranch.checkUnbuilt();
          if (unbuiltResult) {
            console.log(unbuiltResult);
          }
        }
      }
    }

    /**
     * @public
     *
     * @param {function(ReleaseBranch):Promise.<boolean>} [filter] - Optional filter, release branches will be skipped
     *                                                               if this resolves to false
     */
    static async checkBuiltCheckouts(filter) {
      console.log('Checking built checkouts');
      const releaseBranches = await Maintenance.getMaintenanceBranches();
      for (const releaseBranch of releaseBranches) {
        if (!filter || (await filter(releaseBranch))) {
          console.log(releaseBranch.toString());
          const builtResult = await releaseBranch.checkBuilt();
          if (builtResult) {
            console.log(builtResult);
          }
        }
      }
    }

    /**
     * Redeploys production versions of all release branches (or those matching a specific filter
     * @public
     *
     * NOTE: This does not use the current maintenance state!
     *
     * @param {string} message - Generally an issue to reference
     * @param {function(ReleaseBranch):Promise.<boolean>} [filter] - Optional filter, release branches will be skipped
     *                                                                if this resolves to false
     */
    static async redeployAllProduction(message, filter) {
      // Ignore unreleased branches!
      const releaseBranches = await Maintenance.getMaintenanceBranches(() => true, false);
      for (const releaseBranch of releaseBranches) {
        if (filter && !(await filter(releaseBranch))) {
          continue;
        }
        console.log(releaseBranch.toString());
        await rc(releaseBranch.repo, releaseBranch.branch, releaseBranch.brands, true, message);
        await production(releaseBranch.repo, releaseBranch.branch, releaseBranch.brands, true, message);
      }
      console.log('Finished redeploying');
    }

    /**
     * @public
     * TODO: remove the second param? https://github.com/phetsims/perennial/issues/318
     * @param {function(ReleaseBranch):boolean} filterRepo - return false if the ReleaseBranch should be excluded.
     * @param {function} checkUnreleasedBranches - If false, will skip checking for unreleased branches. This checking needs all repos checked out
     * @param {boolean} forceCacheBreak=false - true if you want to force a recalculation of all ReleaseBranches
     * @returns {Promise.<Array.<ReleaseBranch>>}
     * @rejects {ExecuteError}
     */
    static async getMaintenanceBranches(filterRepo = () => true, checkUnreleasedBranches = true, forceCacheBreak = false) {
      const releaseBranches = await Maintenance.loadAllMaintenanceBranches(forceCacheBreak);
      return releaseBranches.filter(releaseBranch => {
        if (!checkUnreleasedBranches && !releaseBranch.isReleased) {
          return false;
        }
        return filterRepo(releaseBranch);
      });
    }

    /**
     * Loads every potential ReleaseBranch (published phet and phet-io brands, as well as unreleased branches), and
     * saves it to the maintenance state.
     * @public
     *
     * Call this with true to break the cache and force a recalculation of all ReleaseBranches
     *
     * @param {boolean} forceCacheBreak=false - true if you want to force a recalculation of all ReleaseBranches
     * @returns {Promise<ReleaseBranch[]>}
     */
    static async loadAllMaintenanceBranches(forceCacheBreak = false) {
      const maintenance = Maintenance.load();
      let releaseBranches = null;
      if (maintenance.allReleaseBranches.length > 0 && !forceCacheBreak) {
        releaseBranches = maintenance.allReleaseBranches.map(releaseBranchData => ReleaseBranch.deserialize(releaseBranchData));
      } else {
        // cache miss
        releaseBranches = await ReleaseBranch.getAllMaintenanceBranches();
        maintenance.allReleaseBranches = releaseBranches;
        maintenance.save();
      }
      return releaseBranches;
    }

    /**
     * Convert into a plain JS object meant for JSON serialization.
     * @public
     *
     * @returns {SerializedMaintenance} - see Patch.serialize() and ModifiedBranch.serialize()
     */
    serialize() {
      return {
        patches: this.patches.map(patch => patch.serialize()),
        modifiedBranches: this.modifiedBranches.map(modifiedBranch => modifiedBranch.serialize()),
        allReleaseBranches: this.allReleaseBranches.map(releaseBranch => releaseBranch.serialize())
      };
    }

    /**
     * Takes a serialized form of the Maintenance and returns an actual instance.
     * @public
     *
     * @param {SerializedMaintenance} - see Maintenance.serialize()
     * @returns {Maintenance}
     */
    static deserialize({
      patches,
      modifiedBranches,
      allReleaseBranches
    }) {
      // Pass in patch references to branch deserialization
      const deserializedPatches = patches.map(Patch.deserialize);
      modifiedBranches = modifiedBranches.map(modifiedBranch => ModifiedBranch.deserialize(modifiedBranch, deserializedPatches));
      modifiedBranches.sort((a, b) => {
        if (a.repo !== b.repo) {
          return a.repo < b.repo ? -1 : 1;
        }
        if (a.branch !== b.branch) {
          return a.branch < b.branch ? -1 : 1;
        }
        return 0;
      });
      const deserializedReleaseBranches = allReleaseBranches.map(releaseBranch => ReleaseBranch.deserialize(releaseBranch));
      return new Maintenance(deserializedPatches, modifiedBranches, deserializedReleaseBranches);
    }

    /**
     * Saves the state of this object into the maintenance file.
     * @public
     */
    save() {
      return fs.writeFileSync(MAINTENANCE_FILE, JSON.stringify(this.serialize(), null, 2));
    }

    /**
     * Loads a new Maintenance object (if possible) from the maintenance file.
     * @public
     *
     * @returns {Maintenance}
     */
    static load() {
      if (fs.existsSync(MAINTENANCE_FILE)) {
        return Maintenance.deserialize(JSON.parse(fs.readFileSync(MAINTENANCE_FILE, 'utf8')));
      } else {
        return new Maintenance();
      }
    }

    /**
     * Starts a command-line REPL with features loaded.
     * @public
     *
     * @returns {Promise}
     */
    static startREPL() {
      return new Promise((resolve, reject) => {
        winston.default.transports.console.level = 'error';
        const session = repl.start({
          prompt: 'maintenance> ',
          useColors: true,
          replMode: repl.REPL_MODE_STRICT,
          ignoreUndefined: true
        });

        // Wait for promises before being ready for input
        const nodeEval = session.eval;
        session.eval = async (cmd, context, filename, callback) => {
          nodeEval(cmd, context, filename, (_, result) => {
            if (result instanceof Promise) {
              result.then(val => callback(_, val)).catch(e => {
                if (e.stack) {
                  console.error(`Maintenance task failed:\n${e.stack}\nFull Error details:\n${JSON.stringify(e, null, 2)}`);
                } else if (typeof e === 'string') {
                  console.error(`Maintenance task failed: ${e}`);
                } else {
                  console.error(`Maintenance task failed with unknown error: ${JSON.stringify(e, null, 2)}`);
                }
              });
            } else {
              callback(_, result);
            }
          });
        };

        // Only autocomplete "public" API functions for Maintenance.
        // const nodeCompleter = session.completer;
        // session.completer = function( text, cb ) {
        //   nodeCompleter( text, ( _, [ completions, completed ] ) => {
        //     const match = completed.match( /^Maintenance\.(\w*)+/ );
        //     if ( match ) {
        //       const funcStart = match[ 1 ];
        //       cb( null, [ PUBLIC_FUNCTIONS.filter( f => f.startsWith( funcStart ) ).map( f => `Maintenance.${f}` ), completed ] );
        //     }
        //     else {
        //       cb( null, [ completions, completed ] );
        //     }
        //   } );
        // };

        // Allow controlling verbosity
        Object.defineProperty(global, 'verbose', {
          get() {
            return winston.default.transports.console.level === 'info';
          },
          set(value) {
            winston.default.transports.console.level = value ? 'info' : 'error';
          }
        });
        session.context.Maintenance = Maintenance;
        session.context.m = Maintenance;
        session.context.M = Maintenance;
        session.context.ReleaseBranch = ReleaseBranch;
        session.context.rb = ReleaseBranch;
        session.on('exit', resolve);
      });
    }

    /**
     * Looks up a patch by its name.
     * @public
     *
     * @param {string} patchName
     * @returns {Patch}
     */
    findPatch(patchName) {
      const patch = this.patches.find(p => p.name === patchName);
      assert(patch, `Patch not found for ${patchName}`);
      return patch;
    }

    /**
     * Looks up (or adds) a ModifiedBranch by its identifying information.
     * @private
     *
     * @param {string} repo
     * @param {string} branch
     * @param {boolean} [errorIfMissing]
     * @param {Array.<ReleaseBranch>} [releaseBranches] - If provided, it will speed up the process
     * @returns {Promise.<ModifiedBranch>}
     */
    async ensureModifiedBranch(repo, branch, errorIfMissing = false, releaseBranches = null) {
      let modifiedBranch = this.modifiedBranches.find(modifiedBranch => modifiedBranch.repo === repo && modifiedBranch.branch === branch);
      if (!modifiedBranch) {
        if (errorIfMissing) {
          throw new Error(`Could not find a tracked modified branch for ${repo} ${branch}`);
        }
        releaseBranches = releaseBranches || (await Maintenance.getMaintenanceBranches(testRepo => testRepo === repo));
        const releaseBranch = releaseBranches.find(release => release.repo === repo && release.branch === branch);
        assert(releaseBranch, `Could not find a release branch for repo=${repo} branch=${branch}`);
        modifiedBranch = new ModifiedBranch(releaseBranch);

        // If we are creating it, add it to our list.
        this.modifiedBranches.push(modifiedBranch);
      }
      return modifiedBranch;
    }

    /**
     * Attempts to remove a modified branch (if it doesn't need to be kept around).
     * @public
     *
     * @param {ModifiedBranch} modifiedBranch
     */
    tryRemovingModifiedBranch(modifiedBranch) {
      if (modifiedBranch.isUnused) {
        const index = this.modifiedBranches.indexOf(modifiedBranch);
        assert(index >= 0);
        this.modifiedBranches.splice(index, 1);
      }
    }
  }
  return Maintenance;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwcm9kdWN0aW9uIiwicmVxdWlyZSIsInJjIiwiQ2hpcHBlclZlcnNpb24iLCJNb2RpZmllZEJyYW5jaCIsIlBhdGNoIiwiUmVsZWFzZUJyYW5jaCIsImJ1aWxkIiwiY2hlY2tvdXRNYXN0ZXIiLCJjaGVja291dFRhcmdldCIsImV4ZWN1dGUiLCJnZXRBY3RpdmVSZXBvcyIsImdldEJyYW5jaGVzIiwiZ2V0QnJhbmNoTWFwIiwiZ2V0RGVwZW5kZW5jaWVzIiwiZ2l0QWRkIiwiZ2l0Q2hlY2tvdXQiLCJnaXRDaGVycnlQaWNrIiwiZ2l0Q29tbWl0IiwiZ2l0Q3JlYXRlQnJhbmNoIiwiZ2l0SXNDbGVhbiIsImdpdFB1bGwiLCJnaXRQdXNoIiwiZ2l0UmV2UGFyc2UiLCJhc3NlcnQiLCJmcyIsInJlcGwiLCJ3aW5zdG9uIiwiZ3J1bnRDb21tYW5kIiwiY2hpcHBlclN1cHBvcnRzT3V0cHV0SlNHcnVudFRhc2tzIiwiTUFJTlRFTkFOQ0VfRklMRSIsIm1vZHVsZSIsImV4cG9ydHMiLCJNYWludGVuYW5jZSIsImNvbnN0cnVjdG9yIiwicGF0Y2hlcyIsIm1vZGlmaWVkQnJhbmNoZXMiLCJhbGxSZWxlYXNlQnJhbmNoZXMiLCJBcnJheSIsImlzQXJyYXkiLCJmb3JFYWNoIiwicGF0Y2giLCJicmFuY2giLCJyZXNldCIsImNvbnNvbGUiLCJsb2ciLCJzYXZlIiwiY2hlY2tCcmFuY2hTdGF0dXMiLCJmaWx0ZXIiLCJyZXBvIiwicmVsZWFzZUJyYW5jaGVzIiwiZ2V0TWFpbnRlbmFuY2VCcmFuY2hlcyIsImJyYW5jaE1hcHMiLCJnZXRCcmFuY2hNYXBBc3luY0NhbGxiYWNrIiwicmVsZWFzZUJyYW5jaCIsImxpbmUiLCJnZXRTdGF0dXMiLCJidWlsZEFsbCIsImZhaWxlZCIsImJyYW5kcyIsIkVycm9yIiwiZSIsInB1c2giLCJicmFuZCIsImxlbmd0aCIsImpvaW4iLCJsaXN0IiwibWFpbnRlbmFuY2UiLCJsb2FkIiwibW9kaWZpZWRCcmFuY2giLCJpc1JlbGVhc2VkIiwiZGVwbG95ZWRWZXJzaW9uIiwidG9TdHJpbmciLCJuZWVkZWRQYXRjaGVzIiwibWFwIiwibmFtZSIsInB1c2hlZE1lc3NhZ2VzIiwicGVuZGluZ01lc3NhZ2VzIiwiT2JqZWN0Iiwia2V5cyIsImNoYW5nZWREZXBlbmRlbmNpZXMiLCJrZXkiLCJtZXNzYWdlIiwic2hhIiwic2hhcyIsImluY2x1ZGVzIiwibGlzdExpbmtzIiwiZGVwbG95ZWRCcmFuY2hlcyIsInByb2R1Y3Rpb25CcmFuY2hlcyIsInRlc3RUeXBlIiwicmVsZWFzZUNhbmRpZGF0ZUJyYW5jaGVzIiwibGlua3MiLCJnZXREZXBsb3llZExpbmtMaW5lcyIsImxpbmsiLCJjcmVhdGVVbnJlbGVhc2VkSXNzdWVzIiwiYWRkaXRpb25hbE5vdGVzIiwiY3JlYXRlVW5yZWxlYXNlZElzc3VlIiwiY3JlYXRlUGF0Y2giLCJwYXRjaE5hbWUiLCJyZW1vdmVQYXRjaCIsImZpbmRQYXRjaCIsInNwbGljZSIsImluZGV4T2YiLCJhZGRQYXRjaFNIQSIsInJlbW92ZVBhdGNoU0hBIiwiaW5kZXgiLCJyZW1vdmVBbGxQYXRjaFNIQXMiLCJhZGROZWVkZWRQYXRjaCIsImVuc3VyZU1vZGlmaWVkQnJhbmNoIiwiYWRkTmVlZGVkUGF0Y2hSZWxlYXNlQnJhbmNoIiwiYWRkTmVlZGVkUGF0Y2hlcyIsIm5lZWRzUGF0Y2giLCJhZGRBbGxOZWVkZWRQYXRjaGVzIiwiYWRkTmVlZGVkUGF0Y2hlc0JlZm9yZSIsImlzTWlzc2luZ1NIQSIsImFkZE5lZWRlZFBhdGNoZXNBZnRlciIsImluY2x1ZGVzU0hBIiwiYWRkTmVlZGVkUGF0Y2hlc0J1aWxkRmlsdGVyIiwiY2hpcHBlclZlcnNpb24iLCJnZXRGcm9tUmVwb3NpdG9yeSIsImZpbGVuYW1lIiwibWFqb3IiLCJyZWFkRmlsZVN5bmMiLCJyZW1vdmVOZWVkZWRQYXRjaCIsInRyeVJlbW92aW5nTW9kaWZpZWRCcmFuY2giLCJyZW1vdmVOZWVkZWRQYXRjaGVzIiwibmVlZHNSZW1vdmFsIiwicmVtb3ZlTmVlZGVkUGF0Y2hlc0JlZm9yZSIsInJlbW92ZU5lZWRlZFBhdGNoZXNBZnRlciIsInNpbmdsZUZpbGVSZWxlYXNlQnJhbmNoRmlsdGVyIiwiZmlsZSIsInByZWRpY2F0ZSIsImNoZWNrb3V0IiwiZXhpc3RzU3luYyIsImNvbnRlbnRzIiwiY2hlY2tvdXRCcmFuY2giLCJvdXRwdXRKUyIsImVycm9ycyIsImFwcGx5UGF0Y2hlcyIsIm51bUFwcGxpZWQiLCJzbGljZSIsInBhdGNoUmVwbyIsImRlcGVuZGVuY2llcyIsImNoZXJyeVBpY2tTdWNjZXNzIiwiY3VycmVudFNIQSIsInVwZGF0ZURlcGVuZGVuY2llcyIsImNoYW5nZWRSZXBvcyIsImRlcGVuZGVuY2llc0pTT05GaWxlIiwiZGVwZW5kZW5jaWVzSlNPTiIsIkpTT04iLCJwYXJzZSIsImRlcGVuZGVuY3kiLCJkZXBlbmRlbmN5QnJhbmNoIiwiYnJhbmNoZXMiLCJ3cml0ZUZpbGVTeW5jIiwic3RyaW5naWZ5IiwiZGVwbG95UmVsZWFzZUNhbmRpZGF0ZXMiLCJpc1JlYWR5Rm9yUmVsZWFzZUNhbmRpZGF0ZSIsInZlcnNpb24iLCJkZXBsb3lQcm9kdWN0aW9uIiwiaXNSZWFkeUZvclByb2R1Y3Rpb24iLCJ1cGRhdGVDaGVja291dHMiLCJ1cGRhdGVDaGVja291dCIsInRyYW5zcGlsZSIsImNoZWNrVW5idWlsdENoZWNrb3V0cyIsInVuYnVpbHRSZXN1bHQiLCJjaGVja1VuYnVpbHQiLCJjaGVja0J1aWx0Q2hlY2tvdXRzIiwiYnVpbHRSZXN1bHQiLCJjaGVja0J1aWx0IiwicmVkZXBsb3lBbGxQcm9kdWN0aW9uIiwiZmlsdGVyUmVwbyIsImNoZWNrVW5yZWxlYXNlZEJyYW5jaGVzIiwiZm9yY2VDYWNoZUJyZWFrIiwibG9hZEFsbE1haW50ZW5hbmNlQnJhbmNoZXMiLCJyZWxlYXNlQnJhbmNoRGF0YSIsImRlc2VyaWFsaXplIiwiZ2V0QWxsTWFpbnRlbmFuY2VCcmFuY2hlcyIsInNlcmlhbGl6ZSIsImRlc2VyaWFsaXplZFBhdGNoZXMiLCJzb3J0IiwiYSIsImIiLCJkZXNlcmlhbGl6ZWRSZWxlYXNlQnJhbmNoZXMiLCJzdGFydFJFUEwiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImRlZmF1bHQiLCJ0cmFuc3BvcnRzIiwibGV2ZWwiLCJzZXNzaW9uIiwic3RhcnQiLCJwcm9tcHQiLCJ1c2VDb2xvcnMiLCJyZXBsTW9kZSIsIlJFUExfTU9ERV9TVFJJQ1QiLCJpZ25vcmVVbmRlZmluZWQiLCJub2RlRXZhbCIsImV2YWwiLCJjbWQiLCJjb250ZXh0IiwiY2FsbGJhY2siLCJfIiwicmVzdWx0IiwidGhlbiIsInZhbCIsImNhdGNoIiwic3RhY2siLCJlcnJvciIsImRlZmluZVByb3BlcnR5IiwiZ2xvYmFsIiwiZ2V0Iiwic2V0IiwidmFsdWUiLCJtIiwiTSIsInJiIiwib24iLCJmaW5kIiwicCIsImVycm9ySWZNaXNzaW5nIiwidGVzdFJlcG8iLCJyZWxlYXNlIiwiaXNVbnVzZWQiXSwic291cmNlcyI6WyJNYWludGVuYW5jZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIG1haW4gcGVyc2lzdGVudCBzdGF0ZS1iZWFyaW5nIG9iamVjdCBmb3IgbWFpbnRlbmFuY2UgcmVsZWFzZXMuIENhbiBiZSBsb2FkZWQgZnJvbSBvciBzYXZlZCB0byBhIGRlZGljYXRlZCBmaWxlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuY29uc3QgcHJvZHVjdGlvbiA9IHJlcXVpcmUoICcuLi9ncnVudC9wcm9kdWN0aW9uJyApO1xyXG5jb25zdCByYyA9IHJlcXVpcmUoICcuLi9ncnVudC9yYycgKTtcclxuY29uc3QgQ2hpcHBlclZlcnNpb24gPSByZXF1aXJlKCAnLi9DaGlwcGVyVmVyc2lvbicgKTtcclxuY29uc3QgTW9kaWZpZWRCcmFuY2ggPSByZXF1aXJlKCAnLi9Nb2RpZmllZEJyYW5jaCcgKTtcclxuY29uc3QgUGF0Y2ggPSByZXF1aXJlKCAnLi9QYXRjaCcgKTtcclxuY29uc3QgUmVsZWFzZUJyYW5jaCA9IHJlcXVpcmUoICcuL1JlbGVhc2VCcmFuY2gnICk7XHJcbmNvbnN0IGJ1aWxkID0gcmVxdWlyZSggJy4vYnVpbGQnICk7XHJcbmNvbnN0IGNoZWNrb3V0TWFzdGVyID0gcmVxdWlyZSggJy4vY2hlY2tvdXRNYXN0ZXInICk7XHJcbmNvbnN0IGNoZWNrb3V0VGFyZ2V0ID0gcmVxdWlyZSggJy4vY2hlY2tvdXRUYXJnZXQnICk7XHJcbmNvbnN0IGV4ZWN1dGUgPSByZXF1aXJlKCAnLi9leGVjdXRlJyApO1xyXG5jb25zdCBnZXRBY3RpdmVSZXBvcyA9IHJlcXVpcmUoICcuL2dldEFjdGl2ZVJlcG9zJyApO1xyXG5jb25zdCBnZXRCcmFuY2hlcyA9IHJlcXVpcmUoICcuL2dldEJyYW5jaGVzJyApO1xyXG5jb25zdCBnZXRCcmFuY2hNYXAgPSByZXF1aXJlKCAnLi9nZXRCcmFuY2hNYXAnICk7XHJcbmNvbnN0IGdldERlcGVuZGVuY2llcyA9IHJlcXVpcmUoICcuL2dldERlcGVuZGVuY2llcycgKTtcclxuY29uc3QgZ2l0QWRkID0gcmVxdWlyZSggJy4vZ2l0QWRkJyApO1xyXG5jb25zdCBnaXRDaGVja291dCA9IHJlcXVpcmUoICcuL2dpdENoZWNrb3V0JyApO1xyXG5jb25zdCBnaXRDaGVycnlQaWNrID0gcmVxdWlyZSggJy4vZ2l0Q2hlcnJ5UGljaycgKTtcclxuY29uc3QgZ2l0Q29tbWl0ID0gcmVxdWlyZSggJy4vZ2l0Q29tbWl0JyApO1xyXG5jb25zdCBnaXRDcmVhdGVCcmFuY2ggPSByZXF1aXJlKCAnLi9naXRDcmVhdGVCcmFuY2gnICk7XHJcbmNvbnN0IGdpdElzQ2xlYW4gPSByZXF1aXJlKCAnLi9naXRJc0NsZWFuJyApO1xyXG5jb25zdCBnaXRQdWxsID0gcmVxdWlyZSggJy4vZ2l0UHVsbCcgKTtcclxuY29uc3QgZ2l0UHVzaCA9IHJlcXVpcmUoICcuL2dpdFB1c2gnICk7XHJcbmNvbnN0IGdpdFJldlBhcnNlID0gcmVxdWlyZSggJy4vZ2l0UmV2UGFyc2UnICk7XHJcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XHJcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xyXG5jb25zdCByZXBsID0gcmVxdWlyZSggJ3JlcGwnICk7XHJcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcclxuY29uc3QgZ3J1bnRDb21tYW5kID0gcmVxdWlyZSggJy4vZ3J1bnRDb21tYW5kJyApO1xyXG5jb25zdCBjaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3MgPSByZXF1aXJlKCAnLi9jaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3MnICk7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTUFJTlRFTkFOQ0VfRklMRSA9ICcubWFpbnRlbmFuY2UuanNvbic7XHJcblxyXG4vLyBjb25zdCBQVUJMSUNfRlVOQ1RJT05TID0gW1xyXG4vLyAgICdhZGRBbGxOZWVkZWRQYXRjaGVzJyxcclxuLy8gICAnYWRkTmVlZGVkUGF0Y2gnLFxyXG4vLyAgICdhZGROZWVkZWRQYXRjaGVzJyxcclxuLy8gICAnYWRkTmVlZGVkUGF0Y2hlc0FmdGVyJyxcclxuLy8gICAnYWRkTmVlZGVkUGF0Y2hlc0JlZm9yZScsXHJcbi8vICAgJ2FkZE5lZWRlZFBhdGNoZXNCdWlsZEZpbHRlcicsXHJcbi8vICAgJ2FkZE5lZWRlZFBhdGNoUmVsZWFzZUJyYW5jaCcsXHJcbi8vICAgJ2FkZFBhdGNoU0hBJyxcclxuLy8gICAnYXBwbHlQYXRjaGVzJyxcclxuLy8gICAnYnVpbGRBbGwnLFxyXG4vLyAgICdjaGVja0JyYW5jaFN0YXR1cycsXHJcbi8vICAgJ2NoZWNrb3V0QnJhbmNoJyxcclxuLy8gICAnY3JlYXRlUGF0Y2gnLFxyXG4vLyAgICdkZXBsb3lQcm9kdWN0aW9uJyxcclxuLy8gICAnZGVwbG95UmVsZWFzZUNhbmRpZGF0ZXMnLFxyXG4vLyAgICdsaXN0JyxcclxuLy8gICAnbGlzdExpbmtzJyxcclxuLy8gICAncmVtb3ZlTmVlZGVkUGF0Y2gnLFxyXG4vLyAgICdyZW1vdmVOZWVkZWRQYXRjaGVzJyxcclxuLy8gICAncmVtb3ZlTmVlZGVkUGF0Y2hlc0FmdGVyJyxcclxuLy8gICAncmVtb3ZlTmVlZGVkUGF0Y2hlc0JlZm9yZScsXHJcbi8vICAgJ3JlbW92ZVBhdGNoJyxcclxuLy8gICAncmVtb3ZlUGF0Y2hTSEEnLFxyXG4vLyAgICdyZXNldCcsXHJcbi8vICAgJ3VwZGF0ZURlcGVuZGVuY2llcydcclxuLy8gICAnZ2V0QWxsTWFpbnRlbmFuY2VCcmFuY2hlcydcclxuLy8gXTtcclxuXHJcbi8qKlxyXG4gKiBAdHlwZWRlZiBTZXJpYWxpemVkTWFpbnRlbmFuY2UgLSBzZWUgTWFpbnRlbmFuY2Uuc2VyaWFsaXplKClcclxuICogQHByb3BlcnR5IHtBcnJheS48T2JqZWN0Pn0gcGF0Y2hlc1xyXG4gKiBAcHJvcGVydHkge0FycmF5LjxPYmplY3Q+fSBtb2RpZmllZEJyYW5jaGVzXHJcbiAqIEBwcm9wZXJ0eSB7QXJyYXkuPE9iamVjdD59IGFsbFJlbGVhc2VCcmFuY2hlc1xyXG4gKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gKCBmdW5jdGlvbigpIHtcclxuXHJcbiAgY2xhc3MgTWFpbnRlbmFuY2Uge1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5LjxQYXRjaD59IFtwYXRjaGVzXVxyXG4gICAgICogQHBhcmFtIHtBcnJheS48TW9kaWZpZWRCcmFuY2g+fSBbbW9kaWZpZWRCcmFuY2hlc11cclxuICAgICAqIEBwYXJhbSAge0FycmF5LjxSZWxlYXNlQnJhbmNoPn0gW2FsbFJlbGVhc2VCcmFuY2hlc11cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoIHBhdGNoZXMgPSBbXSwgbW9kaWZpZWRCcmFuY2hlcyA9IFtdLCBhbGxSZWxlYXNlQnJhbmNoZXMgPSBbXSApIHtcclxuICAgICAgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBwYXRjaGVzICkgKTtcclxuICAgICAgcGF0Y2hlcy5mb3JFYWNoKCBwYXRjaCA9PiBhc3NlcnQoIHBhdGNoIGluc3RhbmNlb2YgUGF0Y2ggKSApO1xyXG4gICAgICBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIG1vZGlmaWVkQnJhbmNoZXMgKSApO1xyXG4gICAgICBtb2RpZmllZEJyYW5jaGVzLmZvckVhY2goIGJyYW5jaCA9PiBhc3NlcnQoIGJyYW5jaCBpbnN0YW5jZW9mIE1vZGlmaWVkQnJhbmNoICkgKTtcclxuXHJcbiAgICAgIC8vIEBwdWJsaWMge0FycmF5LjxQYXRjaD59XHJcbiAgICAgIHRoaXMucGF0Y2hlcyA9IHBhdGNoZXM7XHJcblxyXG4gICAgICAvLyBAcHVibGljIHtBcnJheS48TW9kaWZpZWRCcmFuY2g+fVxyXG4gICAgICB0aGlzLm1vZGlmaWVkQnJhbmNoZXMgPSBtb2RpZmllZEJyYW5jaGVzO1xyXG5cclxuICAgICAgLy8gQHB1YmxpYyB7QXJyYXkuPFJlbGVhc2VCcmFuY2g+fVxyXG4gICAgICB0aGlzLmFsbFJlbGVhc2VCcmFuY2hlcyA9IGFsbFJlbGVhc2VCcmFuY2hlcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlc2V0cyBBTEwgb2YgdGhlIG1haW50ZW5hbmNlIHN0YXRlIHRvIGEgZGVmYXVsdCBcImJsYW5rXCIgc3RhdGUuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQ0FVVElPTjogVGhpcyB3aWxsIHJlbW92ZSBhbnkgaW5mb3JtYXRpb24gYWJvdXQgYW55IG9uZ29pbmcvY29tcGxldGUgbWFpbnRlbmFuY2UgcmVsZWFzZSBmcm9tIHlvdXJcclxuICAgICAqIC5tYWludGVuYW5jZS5qc29uLiBHZW5lcmFsbHkgdGhpcyBzaG91bGQgYmUgZG9uZSBiZWZvcmUgYW55IG5ldyBtYWludGVuYW5jZSByZWxlYXNlLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgcmVzZXQoKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCAnTWFrZSBzdXJlIHRvIGNoZWNrIG9uIHRoZSBhY3RpdmUgUGhFVC1pTyBEZXBsb3kgU3RhdHVzIG9uIHBoZXQuY29sb3JhZG8uZWR1IHRvIGVuc3VyZSB0aGF0IHRoZSAnICtcclxuICAgICAgICAgICAgICAgICAgICdyaWdodCBQaEVULWlPIHNpbXMgYXJlIGluY2x1ZGVkIGluIHRoaXMgbWFpbnRlbmFuY2UgcmVsZWFzZS4nICk7XHJcbiAgICAgIG5ldyBNYWludGVuYW5jZSgpLnNhdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJ1bnMgYSBudW1iZXIgb2YgY2hlY2tzIHRocm91Z2ggZXZlcnkgcmVsZWFzZSBicmFuY2guXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihSZWxlYXNlQnJhbmNoKTpQcm9taXNlLjxib29sZWFuPn0gW2ZpbHRlcl0gLSBPcHRpb25hbCBmaWx0ZXIsIHJlbGVhc2UgYnJhbmNoZXMgd2lsbCBiZSBza2lwcGVkXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHRoaXMgcmVzb2x2ZXMgdG8gZmFsc2VcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgY2hlY2tCcmFuY2hTdGF0dXMoIGZpbHRlciApIHtcclxuICAgICAgZm9yICggY29uc3QgcmVwbyBvZiBnZXRBY3RpdmVSZXBvcygpICkge1xyXG4gICAgICAgIGlmICggcmVwbyAhPT0gJ3BlcmVubmlhbCcgJiYgISggYXdhaXQgZ2l0SXNDbGVhbiggcmVwbyApICkgKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyggYFVuY2xlYW4gcmVwb3NpdG9yeTogJHtyZXBvfSwgcGxlYXNlIHJlc29sdmUgdGhpcyBhbmQgdGhlbiBydW4gY2hlY2tCcmFuY2hTdGF0dXMgYWdhaW5gICk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCByZWxlYXNlQnJhbmNoZXMgPSBhd2FpdCBNYWludGVuYW5jZS5nZXRNYWludGVuYW5jZUJyYW5jaGVzKCBmaWx0ZXIgKTtcclxuXHJcbiAgICAgIC8vIFNldCB1cCBhIGNhY2hlIG9mIGJyYW5jaE1hcHMgc28gdGhhdCB3ZSBkb24ndCBtYWtlIG11bHRpcGxlIHJlcXVlc3RzXHJcbiAgICAgIGNvbnN0IGJyYW5jaE1hcHMgPSB7fTtcclxuICAgICAgY29uc3QgZ2V0QnJhbmNoTWFwQXN5bmNDYWxsYmFjayA9IGFzeW5jIHJlcG8gPT4ge1xyXG4gICAgICAgIGlmICggIWJyYW5jaE1hcHNbIHJlcG8gXSApIHtcclxuICAgICAgICAgIGJyYW5jaE1hcHNbIHJlcG8gXSA9IGF3YWl0IGdldEJyYW5jaE1hcCggcmVwbyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYnJhbmNoTWFwc1sgcmVwbyBdO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgZm9yICggY29uc3QgcmVsZWFzZUJyYW5jaCBvZiByZWxlYXNlQnJhbmNoZXMgKSB7XHJcbiAgICAgICAgaWYgKCAhZmlsdGVyIHx8IGF3YWl0IGZpbHRlciggcmVsZWFzZUJyYW5jaCApICkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coIGAke3JlbGVhc2VCcmFuY2gucmVwb30gJHtyZWxlYXNlQnJhbmNoLmJyYW5jaH1gICk7XHJcbiAgICAgICAgICBmb3IgKCBjb25zdCBsaW5lIG9mIGF3YWl0IHJlbGVhc2VCcmFuY2guZ2V0U3RhdHVzKCBnZXRCcmFuY2hNYXBBc3luY0NhbGxiYWNrICkgKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCBgICAke2xpbmV9YCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCBgJHtyZWxlYXNlQnJhbmNoLnJlcG99ICR7cmVsZWFzZUJyYW5jaC5icmFuY2h9IChza2lwcGluZyBkdWUgdG8gZmlsdGVyKWAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEJ1aWxkcyBhbGwgcmVsZWFzZSBicmFuY2hlcyAoc28gdGhhdCB0aGUgc3RhdGUgb2YgdGhpbmdzIGNhbiBiZSBjaGVja2VkKS4gUHV0cyBpbiBpbiBwZXJlbm5pYWwvYnVpbGQuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhc3luYyBidWlsZEFsbCgpIHtcclxuICAgICAgY29uc3QgcmVsZWFzZUJyYW5jaGVzID0gYXdhaXQgTWFpbnRlbmFuY2UuZ2V0TWFpbnRlbmFuY2VCcmFuY2hlcygpO1xyXG5cclxuICAgICAgY29uc3QgZmFpbGVkID0gW107XHJcblxyXG4gICAgICBmb3IgKCBjb25zdCByZWxlYXNlQnJhbmNoIG9mIHJlbGVhc2VCcmFuY2hlcyApIHtcclxuICAgICAgICBjb25zb2xlLmxvZyggYGJ1aWxkaW5nICR7cmVsZWFzZUJyYW5jaC5yZXBvfSAke3JlbGVhc2VCcmFuY2guYnJhbmNofWAgKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgYXdhaXQgY2hlY2tvdXRUYXJnZXQoIHJlbGVhc2VCcmFuY2gucmVwbywgcmVsZWFzZUJyYW5jaC5icmFuY2gsIHRydWUgKTsgLy8gaW5jbHVkZSBucG0gdXBkYXRlXHJcbiAgICAgICAgICBhd2FpdCBidWlsZCggcmVsZWFzZUJyYW5jaC5yZXBvLCB7XHJcbiAgICAgICAgICAgIGJyYW5kczogcmVsZWFzZUJyYW5jaC5icmFuZHNcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ1VOSU1QTEVNRU5URUQsIGNvcHkgb3ZlcicgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgICAgICBmYWlsZWQucHVzaCggYCR7cmVsZWFzZUJyYW5jaC5yZXBvfSAke3JlbGVhc2VCcmFuY2guYnJhbmR9YCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBmYWlsZWQubGVuZ3RoICkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCBgRmFpbGVkIGJ1aWxkczpcXG4ke2ZhaWxlZC5qb2luKCAnXFxuJyApfWAgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBjb25zb2xlLmxvZyggJ0J1aWxkcyBjb21wbGV0ZScgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGlzcGxheXMgYSBsaXN0aW5nIG9mIHRoZSBjdXJyZW50IG1haW50ZW5hbmNlIHN0YXR1cy5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIGxpc3QoKSB7XHJcbiAgICAgIGNvbnN0IG1haW50ZW5hbmNlID0gTWFpbnRlbmFuY2UubG9hZCgpO1xyXG5cclxuICAgICAgaWYgKCBtYWludGVuYW5jZS5hbGxSZWxlYXNlQnJhbmNoZXMubGVuZ3RoID4gMCApIHtcclxuICAgICAgICBjb25zb2xlLmxvZyggYCR7bWFpbnRlbmFuY2UuYWxsUmVsZWFzZUJyYW5jaGVzLmxlbmd0aH0gUmVsZWFzZUJyYW5jaGVzIGxvYWRlZGAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yICggY29uc3QgbW9kaWZpZWRCcmFuY2ggb2YgbWFpbnRlbmFuY2UubW9kaWZpZWRCcmFuY2hlcyApIHtcclxuICAgICAgICBjb25zb2xlLmxvZyggYCR7bW9kaWZpZWRCcmFuY2gucmVwb30gJHttb2RpZmllZEJyYW5jaC5icmFuY2h9ICR7bW9kaWZpZWRCcmFuY2guYnJhbmRzLmpvaW4oICcsJyApfSR7bW9kaWZpZWRCcmFuY2gucmVsZWFzZUJyYW5jaC5pc1JlbGVhc2VkID8gJycgOiAnICh1bnJlbGVhc2VkKSd9YCApO1xyXG4gICAgICAgIGlmICggbW9kaWZpZWRCcmFuY2guZGVwbG95ZWRWZXJzaW9uICkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coIGAgIGRlcGxveWVkOiAke21vZGlmaWVkQnJhbmNoLmRlcGxveWVkVmVyc2lvbi50b1N0cmluZygpfWAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBtb2RpZmllZEJyYW5jaC5uZWVkZWRQYXRjaGVzLmxlbmd0aCApIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCBgICBuZWVkczogJHttb2RpZmllZEJyYW5jaC5uZWVkZWRQYXRjaGVzLm1hcCggcGF0Y2ggPT4gcGF0Y2gubmFtZSApLmpvaW4oICcsJyApfWAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBtb2RpZmllZEJyYW5jaC5wdXNoZWRNZXNzYWdlcy5sZW5ndGggKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyggYCAgcHVzaGVkTWVzc2FnZXM6ICR7bW9kaWZpZWRCcmFuY2gucHVzaGVkTWVzc2FnZXMuam9pbiggJyBhbmQgJyApfWAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBtb2RpZmllZEJyYW5jaC5wZW5kaW5nTWVzc2FnZXMubGVuZ3RoICkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coIGAgIHBlbmRpbmdNZXNzYWdlczogJHttb2RpZmllZEJyYW5jaC5wZW5kaW5nTWVzc2FnZXMuam9pbiggJyBhbmQgJyApfWAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBPYmplY3Qua2V5cyggbW9kaWZpZWRCcmFuY2guY2hhbmdlZERlcGVuZGVuY2llcyApLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyggJyAgZGVwczonICk7XHJcbiAgICAgICAgICBmb3IgKCBjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoIG1vZGlmaWVkQnJhbmNoLmNoYW5nZWREZXBlbmRlbmNpZXMgKSApIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coIGAgICAgJHtrZXl9OiAke21vZGlmaWVkQnJhbmNoLmNoYW5nZWREZXBlbmRlbmNpZXNbIGtleSBdfWAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoIGNvbnN0IHBhdGNoIG9mIG1haW50ZW5hbmNlLnBhdGNoZXMgKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coIGBbJHtwYXRjaC5uYW1lfV0ke3BhdGNoLm5hbWUgIT09IHBhdGNoLnJlcG8gPyBgICgke3BhdGNoLnJlcG99KWAgOiAnJ30gJHtwYXRjaC5tZXNzYWdlfWAgKTtcclxuICAgICAgICBmb3IgKCBjb25zdCBzaGEgb2YgcGF0Y2guc2hhcyApIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCBgICAke3NoYX1gICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAoIGNvbnN0IG1vZGlmaWVkQnJhbmNoIG9mIG1haW50ZW5hbmNlLm1vZGlmaWVkQnJhbmNoZXMgKSB7XHJcbiAgICAgICAgICBpZiAoIG1vZGlmaWVkQnJhbmNoLm5lZWRlZFBhdGNoZXMuaW5jbHVkZXMoIHBhdGNoICkgKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCBgICAgICR7bW9kaWZpZWRCcmFuY2gucmVwb30gJHttb2RpZmllZEJyYW5jaC5icmFuY2h9ICR7bW9kaWZpZWRCcmFuY2guYnJhbmRzLmpvaW4oICcsJyApfWAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3dzIGFueSByZXF1aXJlZCB0ZXN0aW5nIGxpbmtzIGZvciB0aGUgc2ltdWxhdGlvbnMuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihNb2RpZmllZEJyYW5jaCk6Ym9vbGVhbn0gW2ZpbHRlcl0gLSBDb250cm9sIHdoaWNoIGJyYW5jaGVzIGFyZSBzaG93blxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgbGlzdExpbmtzKCBmaWx0ZXIgPSAoKSA9PiB0cnVlICkge1xyXG4gICAgICBjb25zdCBtYWludGVuYW5jZSA9IE1haW50ZW5hbmNlLmxvYWQoKTtcclxuXHJcbiAgICAgIGNvbnN0IGRlcGxveWVkQnJhbmNoZXMgPSBtYWludGVuYW5jZS5tb2RpZmllZEJyYW5jaGVzLmZpbHRlciggbW9kaWZpZWRCcmFuY2ggPT4gISFtb2RpZmllZEJyYW5jaC5kZXBsb3llZFZlcnNpb24gJiYgZmlsdGVyKCBtb2RpZmllZEJyYW5jaCApICk7XHJcbiAgICAgIGNvbnN0IHByb2R1Y3Rpb25CcmFuY2hlcyA9IGRlcGxveWVkQnJhbmNoZXMuZmlsdGVyKCBtb2RpZmllZEJyYW5jaCA9PiBtb2RpZmllZEJyYW5jaC5kZXBsb3llZFZlcnNpb24udGVzdFR5cGUgPT09IG51bGwgKTtcclxuICAgICAgY29uc3QgcmVsZWFzZUNhbmRpZGF0ZUJyYW5jaGVzID0gZGVwbG95ZWRCcmFuY2hlcy5maWx0ZXIoIG1vZGlmaWVkQnJhbmNoID0+IG1vZGlmaWVkQnJhbmNoLmRlcGxveWVkVmVyc2lvbi50ZXN0VHlwZSA9PT0gJ3JjJyApO1xyXG5cclxuICAgICAgaWYgKCBwcm9kdWN0aW9uQnJhbmNoZXMubGVuZ3RoICkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCAnXFxuUHJvZHVjdGlvbiBsaW5rc1xcbicgKTtcclxuXHJcbiAgICAgICAgZm9yICggY29uc3QgbW9kaWZpZWRCcmFuY2ggb2YgcHJvZHVjdGlvbkJyYW5jaGVzICkge1xyXG4gICAgICAgICAgY29uc3QgbGlua3MgPSBhd2FpdCBtb2RpZmllZEJyYW5jaC5nZXREZXBsb3llZExpbmtMaW5lcygpO1xyXG4gICAgICAgICAgZm9yICggY29uc3QgbGluayBvZiBsaW5rcyApIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coIGxpbmsgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggcmVsZWFzZUNhbmRpZGF0ZUJyYW5jaGVzLmxlbmd0aCApIHtcclxuICAgICAgICBjb25zb2xlLmxvZyggJ1xcblJlbGVhc2UgQ2FuZGlkYXRlIGxpbmtzXFxuJyApO1xyXG5cclxuICAgICAgICBmb3IgKCBjb25zdCBtb2RpZmllZEJyYW5jaCBvZiByZWxlYXNlQ2FuZGlkYXRlQnJhbmNoZXMgKSB7XHJcbiAgICAgICAgICBjb25zdCBsaW5rcyA9IGF3YWl0IG1vZGlmaWVkQnJhbmNoLmdldERlcGxveWVkTGlua0xpbmVzKCk7XHJcbiAgICAgICAgICBmb3IgKCBjb25zdCBsaW5rIG9mIGxpbmtzICkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyggbGluayApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhbiBpc3N1ZSB0byBub3RlIHBhdGNoZXMgb24gYWxsIHVucmVsZWFzZWQgYnJhbmNoZXMgdGhhdCBpbmNsdWRlIGEgcHVzaGVkIG1lc3NhZ2UuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFthZGRpdGlvbmFsTm90ZXNdXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhc3luYyBjcmVhdGVVbnJlbGVhc2VkSXNzdWVzKCBhZGRpdGlvbmFsTm90ZXMgPSAnJyApIHtcclxuICAgICAgY29uc3QgbWFpbnRlbmFuY2UgPSBNYWludGVuYW5jZS5sb2FkKCk7XHJcblxyXG4gICAgICBmb3IgKCBjb25zdCBtb2RpZmllZEJyYW5jaCBvZiBtYWludGVuYW5jZS5tb2RpZmllZEJyYW5jaGVzICkge1xyXG4gICAgICAgIGlmICggIW1vZGlmaWVkQnJhbmNoLnJlbGVhc2VCcmFuY2guaXNSZWxlYXNlZCAmJiBtb2RpZmllZEJyYW5jaC5wdXNoZWRNZXNzYWdlcy5sZW5ndGggPiAwICkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coIGBDcmVhdGluZyBpc3N1ZSBmb3IgJHttb2RpZmllZEJyYW5jaC5yZWxlYXNlQnJhbmNoLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgICAgICAgYXdhaXQgbW9kaWZpZWRCcmFuY2guY3JlYXRlVW5yZWxlYXNlZElzc3VlKCBhZGRpdGlvbmFsTm90ZXMgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKCAnRmluaXNoZWQgY3JlYXRpbmcgdW5yZWxlYXNlZCBpc3N1ZXMnICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgcGF0Y2hcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcmVwb1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcGF0Y2hOYW1lXSAtIElmIG5vIG5hbWUgaXMgcHJvdmlkZWQsIHRoZSByZXBvIHN0cmluZyB3aWxsIGJlIHVzZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIGNyZWF0ZVBhdGNoKCByZXBvLCBtZXNzYWdlLCBwYXRjaE5hbWUgKSB7XHJcbiAgICAgIGNvbnN0IG1haW50ZW5hbmNlID0gTWFpbnRlbmFuY2UubG9hZCgpO1xyXG5cclxuICAgICAgcGF0Y2hOYW1lID0gcGF0Y2hOYW1lIHx8IHJlcG87XHJcblxyXG4gICAgICBmb3IgKCBjb25zdCBwYXRjaCBvZiBtYWludGVuYW5jZS5wYXRjaGVzICkge1xyXG4gICAgICAgIGlmICggcGF0Y2gubmFtZSA9PT0gcGF0Y2hOYW1lICkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnTXVsdGlwbGUgcGF0Y2hlcyB3aXRoIHRoZSBzYW1lIG5hbWUgYXJlIG5vdCBjb25jdXJyZW50bHkgc3VwcG9ydGVkJyApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgbWFpbnRlbmFuY2UucGF0Y2hlcy5wdXNoKCBuZXcgUGF0Y2goIHJlcG8sIHBhdGNoTmFtZSwgbWVzc2FnZSApICk7XHJcblxyXG4gICAgICBtYWludGVuYW5jZS5zYXZlKCk7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZyggYENyZWF0ZWQgcGF0Y2ggZm9yICR7cmVwb30gd2l0aCBtZXNzYWdlOiAke21lc3NhZ2V9YCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhIHBhdGNoXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGNoTmFtZVxyXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhc3luYyByZW1vdmVQYXRjaCggcGF0Y2hOYW1lICkge1xyXG4gICAgICBjb25zdCBtYWludGVuYW5jZSA9IE1haW50ZW5hbmNlLmxvYWQoKTtcclxuXHJcbiAgICAgIGNvbnN0IHBhdGNoID0gbWFpbnRlbmFuY2UuZmluZFBhdGNoKCBwYXRjaE5hbWUgKTtcclxuXHJcbiAgICAgIGZvciAoIGNvbnN0IGJyYW5jaCBvZiBtYWludGVuYW5jZS5tb2RpZmllZEJyYW5jaGVzICkge1xyXG4gICAgICAgIGlmICggYnJhbmNoLm5lZWRlZFBhdGNoZXMuaW5jbHVkZXMoIHBhdGNoICkgKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdQYXRjaCBpcyBtYXJrZWQgYXMgbmVlZGVkIGJ5IGF0IGxlYXN0IG9uZSBicmFuY2gnICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBtYWludGVuYW5jZS5wYXRjaGVzLnNwbGljZSggbWFpbnRlbmFuY2UucGF0Y2hlcy5pbmRleE9mKCBwYXRjaCApLCAxICk7XHJcblxyXG4gICAgICBtYWludGVuYW5jZS5zYXZlKCk7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZyggYFJlbW92ZWQgcGF0Y2ggZm9yICR7cGF0Y2hOYW1lfWAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSBwYXJ0aWN1bGFyIFNIQSAodG8gY2hlcnJ5LXBpY2spIHRvIGEgcGF0Y2guXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGNoTmFtZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzaGFdXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIGFkZFBhdGNoU0hBKCBwYXRjaE5hbWUsIHNoYSApIHtcclxuICAgICAgY29uc3QgbWFpbnRlbmFuY2UgPSBNYWludGVuYW5jZS5sb2FkKCk7XHJcblxyXG4gICAgICBjb25zdCBwYXRjaCA9IG1haW50ZW5hbmNlLmZpbmRQYXRjaCggcGF0Y2hOYW1lICk7XHJcblxyXG4gICAgICBpZiAoICFzaGEgKSB7XHJcbiAgICAgICAgc2hhID0gYXdhaXQgZ2l0UmV2UGFyc2UoIHBhdGNoLnJlcG8sICdIRUFEJyApO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCBgU0hBIG5vdCBwcm92aWRlZCwgZGV0ZWN0aW5nIFNIQTogJHtzaGF9YCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwYXRjaC5zaGFzLnB1c2goIHNoYSApO1xyXG5cclxuICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpO1xyXG5cclxuICAgICAgY29uc29sZS5sb2coIGBBZGRlZCBTSEEgJHtzaGF9IHRvIHBhdGNoICR7cGF0Y2hOYW1lfWAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYSBwYXJ0aWN1bGFyIFNIQSAodG8gY2hlcnJ5LXBpY2spIGZyb20gYSBwYXRjaC5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0Y2hOYW1lXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2hhXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIHJlbW92ZVBhdGNoU0hBKCBwYXRjaE5hbWUsIHNoYSApIHtcclxuICAgICAgY29uc3QgbWFpbnRlbmFuY2UgPSBNYWludGVuYW5jZS5sb2FkKCk7XHJcblxyXG4gICAgICBjb25zdCBwYXRjaCA9IG1haW50ZW5hbmNlLmZpbmRQYXRjaCggcGF0Y2hOYW1lICk7XHJcblxyXG4gICAgICBjb25zdCBpbmRleCA9IHBhdGNoLnNoYXMuaW5kZXhPZiggc2hhICk7XHJcbiAgICAgIGFzc2VydCggaW5kZXggPj0gMCwgJ1NIQSBub3QgZm91bmQnICk7XHJcblxyXG4gICAgICBwYXRjaC5zaGFzLnNwbGljZSggaW5kZXgsIDEgKTtcclxuXHJcbiAgICAgIG1haW50ZW5hbmNlLnNhdmUoKTtcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKCBgUmVtb3ZlZCBTSEEgJHtzaGF9IGZyb20gcGF0Y2ggJHtwYXRjaE5hbWV9YCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhbGwgcGF0Y2ggU0hBcyBmb3IgYSBwYXJ0aWN1bGFyIHBhdGNoLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRjaE5hbWVcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgcmVtb3ZlQWxsUGF0Y2hTSEFzKCBwYXRjaE5hbWUgKSB7XHJcbiAgICAgIGNvbnN0IG1haW50ZW5hbmNlID0gTWFpbnRlbmFuY2UubG9hZCgpO1xyXG5cclxuICAgICAgY29uc3QgcGF0Y2ggPSBtYWludGVuYW5jZS5maW5kUGF0Y2goIHBhdGNoTmFtZSApO1xyXG5cclxuICAgICAgZm9yICggY29uc3Qgc2hhIG9mIHBhdGNoLnNoYXMgKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coIGBSZW1vdmluZyBTSEEgJHtzaGF9IGZyb20gcGF0Y2ggJHtwYXRjaE5hbWV9YCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwYXRjaC5zaGFzID0gW107XHJcblxyXG4gICAgICBtYWludGVuYW5jZS5zYXZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgbmVlZGVkIHBhdGNoIHRvIGEgZ2l2ZW4gbW9kaWZpZWQgYnJhbmNoLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZXBvXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYnJhbmNoXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0Y2hOYW1lXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhc3luYyBhZGROZWVkZWRQYXRjaCggcmVwbywgYnJhbmNoLCBwYXRjaE5hbWUgKSB7XHJcbiAgICAgIGNvbnN0IG1haW50ZW5hbmNlID0gTWFpbnRlbmFuY2UubG9hZCgpO1xyXG5cclxuICAgICAgY29uc3QgcGF0Y2ggPSBtYWludGVuYW5jZS5maW5kUGF0Y2goIHBhdGNoTmFtZSApO1xyXG5cclxuICAgICAgY29uc3QgbW9kaWZpZWRCcmFuY2ggPSBhd2FpdCBtYWludGVuYW5jZS5lbnN1cmVNb2RpZmllZEJyYW5jaCggcmVwbywgYnJhbmNoICk7XHJcbiAgICAgIG1vZGlmaWVkQnJhbmNoLm5lZWRlZFBhdGNoZXMucHVzaCggcGF0Y2ggKTtcclxuXHJcbiAgICAgIG1haW50ZW5hbmNlLnNhdmUoKTtcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKCBgQWRkZWQgcGF0Y2ggJHtwYXRjaE5hbWV9IGFzIG5lZWRlZCBmb3IgJHtyZXBvfSAke2JyYW5jaH1gICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgbmVlZGVkIHBhdGNoIHRvIGEgZ2l2ZW4gcmVsZWFzZSBicmFuY2hcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1JlbGVhc2VCcmFuY2h9IHJlbGVhc2VCcmFuY2hcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRjaE5hbWVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIGFkZE5lZWRlZFBhdGNoUmVsZWFzZUJyYW5jaCggcmVsZWFzZUJyYW5jaCwgcGF0Y2hOYW1lICkge1xyXG4gICAgICBjb25zdCBtYWludGVuYW5jZSA9IE1haW50ZW5hbmNlLmxvYWQoKTtcclxuXHJcbiAgICAgIGNvbnN0IHBhdGNoID0gbWFpbnRlbmFuY2UuZmluZFBhdGNoKCBwYXRjaE5hbWUgKTtcclxuXHJcbiAgICAgIGNvbnN0IG1vZGlmaWVkQnJhbmNoID0gbmV3IE1vZGlmaWVkQnJhbmNoKCByZWxlYXNlQnJhbmNoICk7XHJcbiAgICAgIG1haW50ZW5hbmNlLm1vZGlmaWVkQnJhbmNoZXMucHVzaCggbW9kaWZpZWRCcmFuY2ggKTtcclxuICAgICAgbW9kaWZpZWRCcmFuY2gubmVlZGVkUGF0Y2hlcy5wdXNoKCBwYXRjaCApO1xyXG4gICAgICBtYWludGVuYW5jZS5zYXZlKCk7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZyggYEFkZGVkIHBhdGNoICR7cGF0Y2hOYW1lfSBhcyBuZWVkZWQgZm9yICR7cmVsZWFzZUJyYW5jaC5yZXBvfSAke3JlbGVhc2VCcmFuY2guYnJhbmNofWAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSBuZWVkZWQgcGF0Y2ggdG8gd2hhdGV2ZXIgc3Vic2V0IG9mIHJlbGVhc2UgYnJhbmNoZXMgbWF0Y2ggdGhlIGZpbHRlci5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0Y2hOYW1lXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKFJlbGVhc2VCcmFuY2gpOlByb21pc2UuPGJvb2xlYW4+fSBmaWx0ZXJcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIGFkZE5lZWRlZFBhdGNoZXMoIHBhdGNoTmFtZSwgZmlsdGVyICkge1xyXG4gICAgICBjb25zdCBtYWludGVuYW5jZSA9IE1haW50ZW5hbmNlLmxvYWQoKTtcclxuXHJcbiAgICAgIGNvbnN0IHBhdGNoID0gbWFpbnRlbmFuY2UuZmluZFBhdGNoKCBwYXRjaE5hbWUgKTtcclxuICAgICAgY29uc3QgcmVsZWFzZUJyYW5jaGVzID0gYXdhaXQgTWFpbnRlbmFuY2UuZ2V0TWFpbnRlbmFuY2VCcmFuY2hlcygpO1xyXG5cclxuICAgICAgZm9yICggY29uc3QgcmVsZWFzZUJyYW5jaCBvZiByZWxlYXNlQnJhbmNoZXMgKSB7XHJcbiAgICAgICAgY29uc3QgbmVlZHNQYXRjaCA9IGF3YWl0IGZpbHRlciggcmVsZWFzZUJyYW5jaCApO1xyXG5cclxuICAgICAgICBpZiAoICFuZWVkc1BhdGNoICkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coIGAgIHNraXBwaW5nICR7cmVsZWFzZUJyYW5jaC5yZXBvfSAke3JlbGVhc2VCcmFuY2guYnJhbmNofWAgKTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbW9kaWZpZWRCcmFuY2ggPSBhd2FpdCBtYWludGVuYW5jZS5lbnN1cmVNb2RpZmllZEJyYW5jaCggcmVsZWFzZUJyYW5jaC5yZXBvLCByZWxlYXNlQnJhbmNoLmJyYW5jaCwgZmFsc2UsIHJlbGVhc2VCcmFuY2hlcyApO1xyXG4gICAgICAgIGlmICggIW1vZGlmaWVkQnJhbmNoLm5lZWRlZFBhdGNoZXMuaW5jbHVkZXMoIHBhdGNoICkgKSB7XHJcbiAgICAgICAgICBtb2RpZmllZEJyYW5jaC5uZWVkZWRQYXRjaGVzLnB1c2goIHBhdGNoICk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyggYEFkZGVkIG5lZWRlZCBwYXRjaCAke3BhdGNoTmFtZX0gdG8gJHtyZWxlYXNlQnJhbmNoLnJlcG99ICR7cmVsZWFzZUJyYW5jaC5icmFuY2h9YCApO1xyXG4gICAgICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpOyAvLyBzYXZlIGhlcmUgaW4gY2FzZSBhIGZ1dHVyZSBmYWlsdXJlIHdvdWxkIFwicmV2ZXJ0XCIgdGhpbmdzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coIGBQYXRjaCAke3BhdGNoTmFtZX0gYWxyZWFkeSBpbmNsdWRlZCBpbiAke3JlbGVhc2VCcmFuY2gucmVwb30gJHtyZWxlYXNlQnJhbmNoLmJyYW5jaH1gICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBtYWludGVuYW5jZS5zYXZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgbmVlZGVkIHBhdGNoIHRvIGFsbCByZWxlYXNlIGJyYW5jaGVzLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRjaE5hbWVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIGFkZEFsbE5lZWRlZFBhdGNoZXMoIHBhdGNoTmFtZSApIHtcclxuICAgICAgYXdhaXQgTWFpbnRlbmFuY2UuYWRkTmVlZGVkUGF0Y2hlcyggcGF0Y2hOYW1lLCBhc3luYyAoKSA9PiB0cnVlICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgbmVlZGVkIHBhdGNoIHRvIGFsbCByZWxlYXNlIGJyYW5jaGVzIHRoYXQgZG8gTk9UIGluY2x1ZGUgdGhlIGdpdmVuIGNvbW1pdCBvbiB0aGUgcmVwb1xyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRjaE5hbWVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzaGFcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIGFkZE5lZWRlZFBhdGNoZXNCZWZvcmUoIHBhdGNoTmFtZSwgc2hhICkge1xyXG4gICAgICBjb25zdCBtYWludGVuYW5jZSA9IE1haW50ZW5hbmNlLmxvYWQoKTtcclxuICAgICAgY29uc3QgcGF0Y2ggPSBtYWludGVuYW5jZS5maW5kUGF0Y2goIHBhdGNoTmFtZSApO1xyXG5cclxuICAgICAgYXdhaXQgTWFpbnRlbmFuY2UuYWRkTmVlZGVkUGF0Y2hlcyggcGF0Y2hOYW1lLCBhc3luYyByZWxlYXNlQnJhbmNoID0+IHtcclxuICAgICAgICByZXR1cm4gcmVsZWFzZUJyYW5jaC5pc01pc3NpbmdTSEEoIHBhdGNoLnJlcG8sIHNoYSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgbmVlZGVkIHBhdGNoIHRvIGFsbCByZWxlYXNlIGJyYW5jaGVzIHRoYXQgRE8gaW5jbHVkZSB0aGUgZ2l2ZW4gY29tbWl0IG9uIHRoZSByZXBvXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGNoTmFtZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNoYVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgYWRkTmVlZGVkUGF0Y2hlc0FmdGVyKCBwYXRjaE5hbWUsIHNoYSApIHtcclxuICAgICAgY29uc3QgbWFpbnRlbmFuY2UgPSBNYWludGVuYW5jZS5sb2FkKCk7XHJcbiAgICAgIGNvbnN0IHBhdGNoID0gbWFpbnRlbmFuY2UuZmluZFBhdGNoKCBwYXRjaE5hbWUgKTtcclxuXHJcbiAgICAgIGF3YWl0IE1haW50ZW5hbmNlLmFkZE5lZWRlZFBhdGNoZXMoIHBhdGNoTmFtZSwgYXN5bmMgcmVsZWFzZUJyYW5jaCA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHJlbGVhc2VCcmFuY2guaW5jbHVkZXNTSEEoIHBhdGNoLnJlcG8sIHNoYSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgbmVlZGVkIHBhdGNoIHRvIGFsbCByZWxlYXNlIGJyYW5jaGVzIHRoYXQgc2F0aXNmeSB0aGUgZ2l2ZW4gZmlsdGVyKCByZWxlYXNlQnJhbmNoLCBidWlsdEZpbGVTdHJpbmcgKVxyXG4gICAgICogd2hlcmUgaXQgYnVpbGRzIHRoZSBzaW11bGF0aW9uIHdpdGggdGhlIGRlZmF1bHRzIChicmFuZD1waGV0KSBhbmQgcHJvdmlkZXMgaXQgYXMgYSBzdHJpbmcuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGNoTmFtZVxyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihSZWxlYXNlQnJhbmNoLCBidWlsdEZpbGU6c3RyaW5nKTogUHJvbWlzZS48Ym9vbGVhbj59IGZpbHRlclxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgYWRkTmVlZGVkUGF0Y2hlc0J1aWxkRmlsdGVyKCBwYXRjaE5hbWUsIGZpbHRlciApIHtcclxuICAgICAgYXdhaXQgTWFpbnRlbmFuY2UuYWRkTmVlZGVkUGF0Y2hlcyggcGF0Y2hOYW1lLCBhc3luYyByZWxlYXNlQnJhbmNoID0+IHtcclxuICAgICAgICBhd2FpdCBjaGVja291dFRhcmdldCggcmVsZWFzZUJyYW5jaC5yZXBvLCByZWxlYXNlQnJhbmNoLmJyYW5jaCwgdHJ1ZSApO1xyXG4gICAgICAgIGF3YWl0IGdpdFB1bGwoIHJlbGVhc2VCcmFuY2gucmVwbyApO1xyXG4gICAgICAgIGF3YWl0IGJ1aWxkKCByZWxlYXNlQnJhbmNoLnJlcG8gKTtcclxuICAgICAgICBjb25zdCBjaGlwcGVyVmVyc2lvbiA9IENoaXBwZXJWZXJzaW9uLmdldEZyb21SZXBvc2l0b3J5KCk7XHJcbiAgICAgICAgbGV0IGZpbGVuYW1lO1xyXG4gICAgICAgIGlmICggY2hpcHBlclZlcnNpb24ubWFqb3IgIT09IDAgKSB7XHJcbiAgICAgICAgICBmaWxlbmFtZSA9IGAuLi8ke3JlbGVhc2VCcmFuY2gucmVwb30vYnVpbGQvcGhldC8ke3JlbGVhc2VCcmFuY2gucmVwb31fZW5fcGhldC5odG1sYDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBmaWxlbmFtZSA9IGAuLi8ke3JlbGVhc2VCcmFuY2gucmVwb30vYnVpbGQvJHtyZWxlYXNlQnJhbmNoLnJlcG99X2VuLmh0bWxgO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmlsdGVyKCByZWxlYXNlQnJhbmNoLCBmcy5yZWFkRmlsZVN5bmMoIGZpbGVuYW1lLCAndXRmOCcgKSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGEgbmVlZGVkIHBhdGNoIGZyb20gYSBnaXZlbiBtb2RpZmllZCBicmFuY2guXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBicmFuY2hcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRjaE5hbWVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIHJlbW92ZU5lZWRlZFBhdGNoKCByZXBvLCBicmFuY2gsIHBhdGNoTmFtZSApIHtcclxuICAgICAgY29uc3QgbWFpbnRlbmFuY2UgPSBNYWludGVuYW5jZS5sb2FkKCk7XHJcblxyXG4gICAgICBjb25zdCBwYXRjaCA9IG1haW50ZW5hbmNlLmZpbmRQYXRjaCggcGF0Y2hOYW1lICk7XHJcblxyXG4gICAgICBjb25zdCBtb2RpZmllZEJyYW5jaCA9IGF3YWl0IG1haW50ZW5hbmNlLmVuc3VyZU1vZGlmaWVkQnJhbmNoKCByZXBvLCBicmFuY2ggKTtcclxuICAgICAgY29uc3QgaW5kZXggPSBtb2RpZmllZEJyYW5jaC5uZWVkZWRQYXRjaGVzLmluZGV4T2YoIHBhdGNoICk7XHJcbiAgICAgIGFzc2VydCggaW5kZXggPj0gMCwgJ0NvdWxkIG5vdCBmaW5kIG5lZWRlZCBwYXRjaCBvbiB0aGUgbW9kaWZpZWQgYnJhbmNoJyApO1xyXG5cclxuICAgICAgbW9kaWZpZWRCcmFuY2gubmVlZGVkUGF0Y2hlcy5zcGxpY2UoIGluZGV4LCAxICk7XHJcbiAgICAgIG1haW50ZW5hbmNlLnRyeVJlbW92aW5nTW9kaWZpZWRCcmFuY2goIG1vZGlmaWVkQnJhbmNoICk7XHJcblxyXG4gICAgICBtYWludGVuYW5jZS5zYXZlKCk7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZyggYFJlbW92ZWQgcGF0Y2ggJHtwYXRjaE5hbWV9IGZyb20gJHtyZXBvfSAke2JyYW5jaH1gICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGEgbmVlZGVkIHBhdGNoIGZyb20gd2hhdGV2ZXIgc3Vic2V0IG9mIChjdXJyZW50KSByZWxlYXNlIGJyYW5jaGVzIG1hdGNoIHRoZSBmaWx0ZXIuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGNoTmFtZVxyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihSZWxlYXNlQnJhbmNoKTogUHJvbWlzZS48Ym9vbGVhbj59IGZpbHRlclxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgcmVtb3ZlTmVlZGVkUGF0Y2hlcyggcGF0Y2hOYW1lLCBmaWx0ZXIgKSB7XHJcbiAgICAgIGNvbnN0IG1haW50ZW5hbmNlID0gTWFpbnRlbmFuY2UubG9hZCgpO1xyXG5cclxuICAgICAgY29uc3QgcGF0Y2ggPSBtYWludGVuYW5jZS5maW5kUGF0Y2goIHBhdGNoTmFtZSApO1xyXG5cclxuICAgICAgZm9yICggY29uc3QgbW9kaWZpZWRCcmFuY2ggb2YgbWFpbnRlbmFuY2UubW9kaWZpZWRCcmFuY2hlcyApIHtcclxuICAgICAgICBjb25zdCBuZWVkc1JlbW92YWwgPSBhd2FpdCBmaWx0ZXIoIG1vZGlmaWVkQnJhbmNoLnJlbGVhc2VCcmFuY2ggKTtcclxuXHJcbiAgICAgICAgaWYgKCAhbmVlZHNSZW1vdmFsICkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coIGAgIHNraXBwaW5nICR7bW9kaWZpZWRCcmFuY2gucmVwb30gJHttb2RpZmllZEJyYW5jaC5icmFuY2h9YCApO1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDaGVjayBpZiB0aGVyZSdzIGFjdHVhbGx5IHNvbWV0aGluZyB0byByZW1vdmVcclxuICAgICAgICBjb25zdCBpbmRleCA9IG1vZGlmaWVkQnJhbmNoLm5lZWRlZFBhdGNoZXMuaW5kZXhPZiggcGF0Y2ggKTtcclxuICAgICAgICBpZiAoIGluZGV4IDwgMCApIHtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbW9kaWZpZWRCcmFuY2gubmVlZGVkUGF0Y2hlcy5zcGxpY2UoIGluZGV4LCAxICk7XHJcbiAgICAgICAgbWFpbnRlbmFuY2UudHJ5UmVtb3ZpbmdNb2RpZmllZEJyYW5jaCggbW9kaWZpZWRCcmFuY2ggKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coIGBSZW1vdmVkIG5lZWRlZCBwYXRjaCAke3BhdGNoTmFtZX0gZnJvbSAke21vZGlmaWVkQnJhbmNoLnJlcG99ICR7bW9kaWZpZWRCcmFuY2guYnJhbmNofWAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhIG5lZWRlZCBwYXRjaCBmcm9tIGFsbCByZWxlYXNlIGJyYW5jaGVzIHRoYXQgZG8gTk9UIGluY2x1ZGUgdGhlIGdpdmVuIGNvbW1pdCBvbiB0aGUgcmVwb1xyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRjaE5hbWVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzaGFcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIHJlbW92ZU5lZWRlZFBhdGNoZXNCZWZvcmUoIHBhdGNoTmFtZSwgc2hhICkge1xyXG4gICAgICBjb25zdCBtYWludGVuYW5jZSA9IE1haW50ZW5hbmNlLmxvYWQoKTtcclxuICAgICAgY29uc3QgcGF0Y2ggPSBtYWludGVuYW5jZS5maW5kUGF0Y2goIHBhdGNoTmFtZSApO1xyXG5cclxuICAgICAgYXdhaXQgTWFpbnRlbmFuY2UucmVtb3ZlTmVlZGVkUGF0Y2hlcyggcGF0Y2hOYW1lLCBhc3luYyByZWxlYXNlQnJhbmNoID0+IHtcclxuICAgICAgICByZXR1cm4gcmVsZWFzZUJyYW5jaC5pc01pc3NpbmdTSEEoIHBhdGNoLnJlcG8sIHNoYSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGEgbmVlZGVkIHBhdGNoIGZyb20gYWxsIHJlbGVhc2UgYnJhbmNoZXMgdGhhdCBETyBpbmNsdWRlIHRoZSBnaXZlbiBjb21taXQgb24gdGhlIHJlcG9cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0Y2hOYW1lXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2hhXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhc3luYyByZW1vdmVOZWVkZWRQYXRjaGVzQWZ0ZXIoIHBhdGNoTmFtZSwgc2hhICkge1xyXG4gICAgICBjb25zdCBtYWludGVuYW5jZSA9IE1haW50ZW5hbmNlLmxvYWQoKTtcclxuICAgICAgY29uc3QgcGF0Y2ggPSBtYWludGVuYW5jZS5maW5kUGF0Y2goIHBhdGNoTmFtZSApO1xyXG5cclxuICAgICAgYXdhaXQgTWFpbnRlbmFuY2UucmVtb3ZlTmVlZGVkUGF0Y2hlcyggcGF0Y2hOYW1lLCBhc3luYyByZWxlYXNlQnJhbmNoID0+IHtcclxuICAgICAgICByZXR1cm4gcmVsZWFzZUJyYW5jaC5pbmNsdWRlc1NIQSggcGF0Y2gucmVwbywgc2hhICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhlbHBlciBmb3IgYWRkaW5nIHBhdGNoZXMgYmFzZWQgb24gc3BlY2lmaWMgcGF0dGVybnMsIGUuZy46XHJcbiAgICAgKiBNYWludGVuYW5jZS5hZGROZWVkZWRQYXRjaGVzKCAncGhldG1hcmtzJywgTWFpbnRlbmFuY2Uuc2luZ2xlRmlsZVJlbGVhc2VCcmFuY2hGaWx0ZXIoICcuLi9waGV0bWFya3MvanMvcGhldG1hcmtzLmpzJyApLCBjb250ZW50ID0+IGNvbnRlbnQuaW5jbHVkZXMoICdkYXRhL3dyYXBwZXJzJyApICk7XHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVcclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oc3RyaW5nKTpib29sZWFufVxyXG4gICAgICogQHJldHVybnMge2Z1bmN0aW9ufVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgc2luZ2xlRmlsZVJlbGVhc2VCcmFuY2hGaWx0ZXIoIGZpbGUsIHByZWRpY2F0ZSApIHtcclxuICAgICAgcmV0dXJuIGFzeW5jIHJlbGVhc2VCcmFuY2ggPT4ge1xyXG4gICAgICAgIGF3YWl0IHJlbGVhc2VCcmFuY2guY2hlY2tvdXQoIGZhbHNlICk7XHJcblxyXG4gICAgICAgIGlmICggZnMuZXhpc3RzU3luYyggZmlsZSApICkge1xyXG4gICAgICAgICAgY29uc3QgY29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoIGZpbGUsICd1dGYtOCcgKTtcclxuICAgICAgICAgIHJldHVybiBwcmVkaWNhdGUoIGNvbnRlbnRzICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3Mgb3V0IGEgc3BlY2lmaWMgYnJhbmNoICh1c2luZyBsb2NhbCBjb21taXQgZGF0YSBhcyBuZWNlc3NhcnkpLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZXBvXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYnJhbmNoXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IG91dHB1dEpTPWZhbHNlIC0gaWYgdHJ1ZSwgb25jZSBjaGVja2VkIG91dCB0aGlzIHdpbGwgYWxzbyBydW4gYGdydW50IG91dHB1dC1qcy1wcm9qZWN0YFxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgY2hlY2tvdXRCcmFuY2goIHJlcG8sIGJyYW5jaCwgb3V0cHV0SlMgPSBmYWxzZSApIHtcclxuICAgICAgY29uc3QgbWFpbnRlbmFuY2UgPSBNYWludGVuYW5jZS5sb2FkKCk7XHJcblxyXG4gICAgICBjb25zdCBtb2RpZmllZEJyYW5jaCA9IGF3YWl0IG1haW50ZW5hbmNlLmVuc3VyZU1vZGlmaWVkQnJhbmNoKCByZXBvLCBicmFuY2gsIHRydWUgKTtcclxuICAgICAgYXdhaXQgbW9kaWZpZWRCcmFuY2guY2hlY2tvdXQoKTtcclxuXHJcbiAgICAgIGlmICggb3V0cHV0SlMgJiYgY2hpcHBlclN1cHBvcnRzT3V0cHV0SlNHcnVudFRhc2tzKCkgKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coICdSdW5uaW5nIG91dHB1dC1qcy1wcm9qZWN0JyApO1xyXG5cclxuICAgICAgICAvLyBXZSBtaWdodCBub3QgYmUgYWJsZSB0byBydW4gdGhpcyBjb21tYW5kIVxyXG4gICAgICAgIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgWyAnb3V0cHV0LWpzLXByb2plY3QnIF0sIGAuLi8ke3JlcG99YCwge1xyXG4gICAgICAgICAgZXJyb3JzOiAncmVzb2x2ZSdcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE5vIG5lZWQgdG8gc2F2ZSwgc2hvdWxkbid0IGJlIGNoYW5naW5nIHRoaW5nc1xyXG4gICAgICBjb25zb2xlLmxvZyggYENoZWNrZWQgb3V0ICR7cmVwb30gJHticmFuY2h9YCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXR0ZW1wdHMgdG8gYXBwbHkgcGF0Y2hlcyB0byB0aGUgbW9kaWZpZWQgYnJhbmNoZXMgdGhhdCBhcmUgbWFya2VkIGFzIG5lZWRlZC5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIGFwcGx5UGF0Y2hlcygpIHtcclxuICAgICAgY29uc3QgbWFpbnRlbmFuY2UgPSBNYWludGVuYW5jZS5sb2FkKCk7XHJcbiAgICAgIGxldCBudW1BcHBsaWVkID0gMDtcclxuXHJcbiAgICAgIGZvciAoIGNvbnN0IG1vZGlmaWVkQnJhbmNoIG9mIG1haW50ZW5hbmNlLm1vZGlmaWVkQnJhbmNoZXMgKSB7XHJcbiAgICAgICAgaWYgKCBtb2RpZmllZEJyYW5jaC5uZWVkZWRQYXRjaGVzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVwbyA9IG1vZGlmaWVkQnJhbmNoLnJlcG87XHJcbiAgICAgICAgY29uc3QgYnJhbmNoID0gbW9kaWZpZWRCcmFuY2guYnJhbmNoO1xyXG5cclxuICAgICAgICAvLyBEZWZlbnNpdmUgY29weSwgc2luY2Ugd2UgbW9kaWZ5IGl0IGR1cmluZyBpdGVyYXRpb25cclxuICAgICAgICBmb3IgKCBjb25zdCBwYXRjaCBvZiBtb2RpZmllZEJyYW5jaC5uZWVkZWRQYXRjaGVzLnNsaWNlKCkgKSB7XHJcbiAgICAgICAgICBpZiAoIHBhdGNoLnNoYXMubGVuZ3RoID09PSAwICkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBwYXRjaFJlcG8gPSBwYXRjaC5yZXBvO1xyXG5cclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIENoZWNrb3V0IHdoYXRldmVyIHRoZSBsYXRlc3QgcGF0Y2hlZCBTSEEgaXMgKGlmIHdlJ3ZlIHBhdGNoZWQgaXQpXHJcbiAgICAgICAgICAgIGlmICggbW9kaWZpZWRCcmFuY2guY2hhbmdlZERlcGVuZGVuY2llc1sgcGF0Y2hSZXBvIF0gKSB7XHJcbiAgICAgICAgICAgICAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHBhdGNoUmVwbywgbW9kaWZpZWRCcmFuY2guY2hhbmdlZERlcGVuZGVuY2llc1sgcGF0Y2hSZXBvIF0gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAvLyBMb29rIHVwIHRoZSBTSEEgdG8gY2hlY2sgb3V0XHJcbiAgICAgICAgICAgICAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHJlcG8sIGJyYW5jaCApO1xyXG4gICAgICAgICAgICAgIGF3YWl0IGdpdFB1bGwoIHJlcG8gKTtcclxuICAgICAgICAgICAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBhd2FpdCBnZXREZXBlbmRlbmNpZXMoIHJlcG8gKTtcclxuICAgICAgICAgICAgICBjb25zdCBzaGEgPSBkZXBlbmRlbmNpZXNbIHBhdGNoUmVwbyBdLnNoYTtcclxuICAgICAgICAgICAgICBhd2FpdCBnaXRDaGVja291dCggcmVwbywgJ21hc3RlcicgKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gVGhlbiBjaGVjayBpdCBvdXRcclxuICAgICAgICAgICAgICBhd2FpdCBnaXRDaGVja291dCggcGF0Y2hSZXBvLCBzaGEgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coIGBDaGVja2VkIG91dCAke3BhdGNoUmVwb30gU0hBIGZvciAke3JlcG99ICR7YnJhbmNofWAgKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoIGNvbnN0IHNoYSBvZiBwYXRjaC5zaGFzICkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGNoZXJyeVBpY2tTdWNjZXNzID0gYXdhaXQgZ2l0Q2hlcnJ5UGljayggcGF0Y2hSZXBvLCBzaGEgKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKCBjaGVycnlQaWNrU3VjY2VzcyApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRTSEEgPSBhd2FpdCBnaXRSZXZQYXJzZSggcGF0Y2hSZXBvLCAnSEVBRCcgKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCBgQ2hlcnJ5LXBpY2sgc3VjY2VzcyBmb3IgJHtzaGF9LCByZXN1bHQgaXMgJHtjdXJyZW50U0hBfWAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBtb2RpZmllZEJyYW5jaC5jaGFuZ2VkRGVwZW5kZW5jaWVzWyBwYXRjaFJlcG8gXSA9IGN1cnJlbnRTSEE7XHJcbiAgICAgICAgICAgICAgICBtb2RpZmllZEJyYW5jaC5uZWVkZWRQYXRjaGVzLnNwbGljZSggbW9kaWZpZWRCcmFuY2gubmVlZGVkUGF0Y2hlcy5pbmRleE9mKCBwYXRjaCApLCAxICk7XHJcbiAgICAgICAgICAgICAgICBudW1BcHBsaWVkKys7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRG9uJ3QgaW5jbHVkZSBkdXBsaWNhdGUgbWVzc2FnZXMsIHNpbmNlIG11bHRpcGxlIHBhdGNoZXMgbWlnaHQgYmUgZm9yIGEgc2luZ2xlIGlzc3VlXHJcbiAgICAgICAgICAgICAgICBpZiAoICFtb2RpZmllZEJyYW5jaC5wZW5kaW5nTWVzc2FnZXMuaW5jbHVkZXMoIHBhdGNoLm1lc3NhZ2UgKSApIHtcclxuICAgICAgICAgICAgICAgICAgbW9kaWZpZWRCcmFuY2gucGVuZGluZ01lc3NhZ2VzLnB1c2goIHBhdGNoLm1lc3NhZ2UgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggYENvdWxkIG5vdCBjaGVycnktcGljayAke3NoYX1gICk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYXRjaCggZSApIHtcclxuICAgICAgICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpO1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgRmFpbHVyZSBhcHBseWluZyBwYXRjaCAke3BhdGNoUmVwb30gdG8gJHtyZXBvfSAke2JyYW5jaH06ICR7ZX1gICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhd2FpdCBnaXRDaGVja291dCggbW9kaWZpZWRCcmFuY2gucmVwbywgJ21hc3RlcicgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpO1xyXG5cclxuICAgICAgY29uc29sZS5sb2coIGAke251bUFwcGxpZWR9IHBhdGNoZXMgYXBwbGllZGAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFB1c2hlcyBsb2NhbCBjaGFuZ2VzIHVwIHRvIEdpdEh1Yi5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE1vZGlmaWVkQnJhbmNoKTpQcm9taXNlLjxib29sZWFuPn0gW2ZpbHRlcl0gLSBPcHRpb25hbCBmaWx0ZXIsIG1vZGlmaWVkIGJyYW5jaGVzIHdpbGwgYmUgc2tpcHBlZFxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdGhpcyByZXNvbHZlcyB0byBmYWxzZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgdXBkYXRlRGVwZW5kZW5jaWVzKCBmaWx0ZXIgKSB7XHJcbiAgICAgIGNvbnN0IG1haW50ZW5hbmNlID0gTWFpbnRlbmFuY2UubG9hZCgpO1xyXG5cclxuICAgICAgZm9yICggY29uc3QgbW9kaWZpZWRCcmFuY2ggb2YgbWFpbnRlbmFuY2UubW9kaWZpZWRCcmFuY2hlcyApIHtcclxuICAgICAgICBjb25zdCBjaGFuZ2VkUmVwb3MgPSBPYmplY3Qua2V5cyggbW9kaWZpZWRCcmFuY2guY2hhbmdlZERlcGVuZGVuY2llcyApO1xyXG4gICAgICAgIGlmICggY2hhbmdlZFJlcG9zLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCBmaWx0ZXIgJiYgISggYXdhaXQgZmlsdGVyKCBtb2RpZmllZEJyYW5jaCApICkgKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyggYFNraXBwaW5nIGRlcGVuZGVuY3kgdXBkYXRlIGZvciAke21vZGlmaWVkQnJhbmNoLnJlcG99ICR7bW9kaWZpZWRCcmFuY2guYnJhbmNofWAgKTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIC8vIE5vIE5QTSBuZWVkZWRcclxuICAgICAgICAgIGF3YWl0IGNoZWNrb3V0VGFyZ2V0KCBtb2RpZmllZEJyYW5jaC5yZXBvLCBtb2RpZmllZEJyYW5jaC5icmFuY2gsIGZhbHNlICk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyggYENoZWNrZWQgb3V0ICR7bW9kaWZpZWRCcmFuY2gucmVwb30gJHttb2RpZmllZEJyYW5jaC5icmFuY2h9YCApO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGRlcGVuZGVuY2llc0pTT05GaWxlID0gYC4uLyR7bW9kaWZpZWRCcmFuY2gucmVwb30vZGVwZW5kZW5jaWVzLmpzb25gO1xyXG4gICAgICAgICAgY29uc3QgZGVwZW5kZW5jaWVzSlNPTiA9IEpTT04ucGFyc2UoIGZzLnJlYWRGaWxlU3luYyggZGVwZW5kZW5jaWVzSlNPTkZpbGUsICd1dGYtOCcgKSApO1xyXG5cclxuICAgICAgICAgIC8vIE1vZGlmeSB0aGUgXCJzZWxmXCIgaW4gdGhlIGRlcGVuZGVuY2llcy5qc29uIGFzIGV4cGVjdGVkXHJcbiAgICAgICAgICBkZXBlbmRlbmNpZXNKU09OWyBtb2RpZmllZEJyYW5jaC5yZXBvIF0uc2hhID0gYXdhaXQgZ2l0UmV2UGFyc2UoIG1vZGlmaWVkQnJhbmNoLnJlcG8sIG1vZGlmaWVkQnJhbmNoLmJyYW5jaCApO1xyXG5cclxuICAgICAgICAgIGZvciAoIGNvbnN0IGRlcGVuZGVuY3kgb2YgY2hhbmdlZFJlcG9zICkge1xyXG4gICAgICAgICAgICBjb25zdCBkZXBlbmRlbmN5QnJhbmNoID0gbW9kaWZpZWRCcmFuY2guZGVwZW5kZW5jeUJyYW5jaDtcclxuICAgICAgICAgICAgY29uc3QgYnJhbmNoZXMgPSBhd2FpdCBnZXRCcmFuY2hlcyggZGVwZW5kZW5jeSApO1xyXG4gICAgICAgICAgICBjb25zdCBzaGEgPSBtb2RpZmllZEJyYW5jaC5jaGFuZ2VkRGVwZW5kZW5jaWVzWyBkZXBlbmRlbmN5IF07XHJcblxyXG4gICAgICAgICAgICBkZXBlbmRlbmNpZXNKU09OWyBkZXBlbmRlbmN5IF0uc2hhID0gc2hhO1xyXG5cclxuICAgICAgICAgICAgaWYgKCBicmFuY2hlcy5pbmNsdWRlcyggZGVwZW5kZW5jeUJyYW5jaCApICkge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCBgQnJhbmNoICR7ZGVwZW5kZW5jeUJyYW5jaH0gYWxyZWFkeSBleGlzdHMgaW4gJHtkZXBlbmRlbmN5fWAgKTtcclxuICAgICAgICAgICAgICBhd2FpdCBnaXRDaGVja291dCggZGVwZW5kZW5jeSwgZGVwZW5kZW5jeUJyYW5jaCApO1xyXG4gICAgICAgICAgICAgIGF3YWl0IGdpdFB1bGwoIGRlcGVuZGVuY3kgKTtcclxuICAgICAgICAgICAgICBjb25zdCBjdXJyZW50U0hBID0gYXdhaXQgZ2l0UmV2UGFyc2UoIGRlcGVuZGVuY3ksICdIRUFEJyApO1xyXG5cclxuICAgICAgICAgICAgICBpZiAoIHNoYSAhPT0gY3VycmVudFNIQSApIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCBgQXR0ZW1wdGluZyB0byAoaG9wZWZ1bGx5IGZhc3QtZm9yd2FyZCkgbWVyZ2UgJHtzaGF9YCApO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgZXhlY3V0ZSggJ2dpdCcsIFsgJ21lcmdlJywgc2hhIF0sIGAuLi8ke2RlcGVuZGVuY3l9YCApO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgZ2l0UHVzaCggZGVwZW5kZW5jeSwgZGVwZW5kZW5jeUJyYW5jaCApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyggYEJyYW5jaCAke2RlcGVuZGVuY3lCcmFuY2h9IGRvZXMgbm90IGV4aXN0IGluICR7ZGVwZW5kZW5jeX0sIGNyZWF0aW5nLmAgKTtcclxuICAgICAgICAgICAgICBhd2FpdCBnaXRDaGVja291dCggZGVwZW5kZW5jeSwgc2hhICk7XHJcbiAgICAgICAgICAgICAgYXdhaXQgZ2l0Q3JlYXRlQnJhbmNoKCBkZXBlbmRlbmN5LCBkZXBlbmRlbmN5QnJhbmNoICk7XHJcbiAgICAgICAgICAgICAgYXdhaXQgZ2l0UHVzaCggZGVwZW5kZW5jeSwgZGVwZW5kZW5jeUJyYW5jaCApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkZWxldGUgbW9kaWZpZWRCcmFuY2guY2hhbmdlZERlcGVuZGVuY2llc1sgZGVwZW5kZW5jeSBdO1xyXG4gICAgICAgICAgICBtb2RpZmllZEJyYW5jaC5kZXBsb3llZFZlcnNpb24gPSBudWxsO1xyXG4gICAgICAgICAgICBtYWludGVuYW5jZS5zYXZlKCk7IC8vIHNhdmUgaGVyZSBpbiBjYXNlIGEgZnV0dXJlIGZhaWx1cmUgd291bGQgXCJyZXZlcnRcIiB0aGluZ3NcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBtZXNzYWdlID0gbW9kaWZpZWRCcmFuY2gucGVuZGluZ01lc3NhZ2VzLmpvaW4oICcgYW5kICcgKTtcclxuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoIGRlcGVuZGVuY2llc0pTT05GaWxlLCBKU09OLnN0cmluZ2lmeSggZGVwZW5kZW5jaWVzSlNPTiwgbnVsbCwgMiApICk7XHJcbiAgICAgICAgICBhd2FpdCBnaXRBZGQoIG1vZGlmaWVkQnJhbmNoLnJlcG8sICdkZXBlbmRlbmNpZXMuanNvbicgKTtcclxuICAgICAgICAgIGF3YWl0IGdpdENvbW1pdCggbW9kaWZpZWRCcmFuY2gucmVwbywgYHVwZGF0ZWQgZGVwZW5kZW5jaWVzLmpzb24gZm9yICR7bWVzc2FnZX1gICk7XHJcbiAgICAgICAgICBhd2FpdCBnaXRQdXNoKCBtb2RpZmllZEJyYW5jaC5yZXBvLCBtb2RpZmllZEJyYW5jaC5icmFuY2ggKTtcclxuXHJcbiAgICAgICAgICAvLyBNb3ZlIG1lc3NhZ2VzIGZyb20gcGVuZGluZyB0byBwdXNoZWRcclxuICAgICAgICAgIGZvciAoIGNvbnN0IG1lc3NhZ2Ugb2YgbW9kaWZpZWRCcmFuY2gucGVuZGluZ01lc3NhZ2VzICkge1xyXG4gICAgICAgICAgICBpZiAoICFtb2RpZmllZEJyYW5jaC5wdXNoZWRNZXNzYWdlcy5pbmNsdWRlcyggbWVzc2FnZSApICkge1xyXG4gICAgICAgICAgICAgIG1vZGlmaWVkQnJhbmNoLnB1c2hlZE1lc3NhZ2VzLnB1c2goIG1lc3NhZ2UgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbW9kaWZpZWRCcmFuY2gucGVuZGluZ01lc3NhZ2VzID0gW107XHJcbiAgICAgICAgICBtYWludGVuYW5jZS5zYXZlKCk7IC8vIHNhdmUgaGVyZSBpbiBjYXNlIGEgZnV0dXJlIGZhaWx1cmUgd291bGQgXCJyZXZlcnRcIiB0aGluZ3NcclxuXHJcbiAgICAgICAgICBhd2FpdCBjaGVja291dE1hc3RlciggbW9kaWZpZWRCcmFuY2gucmVwbywgZmFsc2UgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgICAgICBtYWludGVuYW5jZS5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgRmFpbHVyZSB1cGRhdGluZyBkZXBlbmRlbmNpZXMgZm9yICR7bW9kaWZpZWRCcmFuY2gucmVwb30gdG8gJHttb2RpZmllZEJyYW5jaC5icmFuY2h9OiAke2V9YCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpO1xyXG5cclxuICAgICAgY29uc29sZS5sb2coICdEZXBlbmRlbmNpZXMgdXBkYXRlZCcgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERlcGxveXMgUkMgdmVyc2lvbnMgb2YgdGhlIG1vZGlmaWVkIGJyYW5jaGVzIHRoYXQgbmVlZCBpdC5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE1vZGlmaWVkQnJhbmNoKTpQcm9taXNlLjxib29sZWFuPn0gW2ZpbHRlcl0gLSBPcHRpb25hbCBmaWx0ZXIsIG1vZGlmaWVkIGJyYW5jaGVzIHdpbGwgYmUgc2tpcHBlZFxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdGhpcyByZXNvbHZlcyB0byBmYWxzZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgZGVwbG95UmVsZWFzZUNhbmRpZGF0ZXMoIGZpbHRlciApIHtcclxuICAgICAgY29uc3QgbWFpbnRlbmFuY2UgPSBNYWludGVuYW5jZS5sb2FkKCk7XHJcblxyXG4gICAgICBmb3IgKCBjb25zdCBtb2RpZmllZEJyYW5jaCBvZiBtYWludGVuYW5jZS5tb2RpZmllZEJyYW5jaGVzICkge1xyXG4gICAgICAgIGlmICggIW1vZGlmaWVkQnJhbmNoLmlzUmVhZHlGb3JSZWxlYXNlQ2FuZGlkYXRlIHx8ICFtb2RpZmllZEJyYW5jaC5yZWxlYXNlQnJhbmNoLmlzUmVsZWFzZWQgKSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCAnPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09JyApO1xyXG5cclxuICAgICAgICBpZiAoIGZpbHRlciAmJiAhKCBhd2FpdCBmaWx0ZXIoIG1vZGlmaWVkQnJhbmNoICkgKSApIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCBgU2tpcHBpbmcgUkMgZGVwbG95IGZvciAke21vZGlmaWVkQnJhbmNoLnJlcG99ICR7bW9kaWZpZWRCcmFuY2guYnJhbmNofWAgKTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCBgUnVubmluZyBSQyBkZXBsb3kgZm9yICR7bW9kaWZpZWRCcmFuY2gucmVwb30gJHttb2RpZmllZEJyYW5jaC5icmFuY2h9YCApO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHZlcnNpb24gPSBhd2FpdCByYyggbW9kaWZpZWRCcmFuY2gucmVwbywgbW9kaWZpZWRCcmFuY2guYnJhbmNoLCBtb2RpZmllZEJyYW5jaC5icmFuZHMsIHRydWUsIG1vZGlmaWVkQnJhbmNoLnB1c2hlZE1lc3NhZ2VzLmpvaW4oICcsICcgKSApO1xyXG4gICAgICAgICAgbW9kaWZpZWRCcmFuY2guZGVwbG95ZWRWZXJzaW9uID0gdmVyc2lvbjtcclxuICAgICAgICAgIG1haW50ZW5hbmNlLnNhdmUoKTsgLy8gc2F2ZSBoZXJlIGluIGNhc2UgYSBmdXR1cmUgZmFpbHVyZSB3b3VsZCBcInJldmVydFwiIHRoaW5nc1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCggZSApIHtcclxuICAgICAgICAgIG1haW50ZW5hbmNlLnNhdmUoKTtcclxuXHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBGYWlsdXJlIHdpdGggUkMgZGVwbG95IGZvciAke21vZGlmaWVkQnJhbmNoLnJlcG99IHRvICR7bW9kaWZpZWRCcmFuY2guYnJhbmNofTogJHtlfWAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG1haW50ZW5hbmNlLnNhdmUoKTtcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKCAnUkMgdmVyc2lvbnMgZGVwbG95ZWQnICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXBsb3lzIHByb2R1Y3Rpb24gdmVyc2lvbnMgb2YgdGhlIG1vZGlmaWVkIGJyYW5jaGVzIHRoYXQgbmVlZCBpdC5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE1vZGlmaWVkQnJhbmNoKTpQcm9taXNlLjxib29sZWFuPn0gW2ZpbHRlcl0gLSBPcHRpb25hbCBmaWx0ZXIsIG1vZGlmaWVkIGJyYW5jaGVzIHdpbGwgYmUgc2tpcHBlZFxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdGhpcyByZXNvbHZlcyB0byBmYWxzZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgZGVwbG95UHJvZHVjdGlvbiggZmlsdGVyICkge1xyXG4gICAgICBjb25zdCBtYWludGVuYW5jZSA9IE1haW50ZW5hbmNlLmxvYWQoKTtcclxuXHJcbiAgICAgIGZvciAoIGNvbnN0IG1vZGlmaWVkQnJhbmNoIG9mIG1haW50ZW5hbmNlLm1vZGlmaWVkQnJhbmNoZXMgKSB7XHJcbiAgICAgICAgaWYgKCAhbW9kaWZpZWRCcmFuY2guaXNSZWFkeUZvclByb2R1Y3Rpb24gfHwgIW1vZGlmaWVkQnJhbmNoLnJlbGVhc2VCcmFuY2guaXNSZWxlYXNlZCApIHtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCBmaWx0ZXIgJiYgISggYXdhaXQgZmlsdGVyKCBtb2RpZmllZEJyYW5jaCApICkgKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyggYFNraXBwaW5nIHByb2R1Y3Rpb24gZGVwbG95IGZvciAke21vZGlmaWVkQnJhbmNoLnJlcG99ICR7bW9kaWZpZWRCcmFuY2guYnJhbmNofWAgKTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCBgUnVubmluZyBwcm9kdWN0aW9uIGRlcGxveSBmb3IgJHttb2RpZmllZEJyYW5jaC5yZXBvfSAke21vZGlmaWVkQnJhbmNoLmJyYW5jaH1gICk7XHJcblxyXG4gICAgICAgICAgY29uc3QgdmVyc2lvbiA9IGF3YWl0IHByb2R1Y3Rpb24oIG1vZGlmaWVkQnJhbmNoLnJlcG8sIG1vZGlmaWVkQnJhbmNoLmJyYW5jaCwgbW9kaWZpZWRCcmFuY2guYnJhbmRzLCB0cnVlLCBtb2RpZmllZEJyYW5jaC5wdXNoZWRNZXNzYWdlcy5qb2luKCAnLCAnICkgKTtcclxuICAgICAgICAgIG1vZGlmaWVkQnJhbmNoLmRlcGxveWVkVmVyc2lvbiA9IHZlcnNpb247XHJcbiAgICAgICAgICBtb2RpZmllZEJyYW5jaC5wdXNoZWRNZXNzYWdlcyA9IFtdO1xyXG4gICAgICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpOyAvLyBzYXZlIGhlcmUgaW4gY2FzZSBhIGZ1dHVyZSBmYWlsdXJlIHdvdWxkIFwicmV2ZXJ0XCIgdGhpbmdzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoKCBlICkge1xyXG4gICAgICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpO1xyXG5cclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggYEZhaWx1cmUgd2l0aCBwcm9kdWN0aW9uIGRlcGxveSBmb3IgJHttb2RpZmllZEJyYW5jaC5yZXBvfSB0byAke21vZGlmaWVkQnJhbmNoLmJyYW5jaH06ICR7ZX1gICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBtYWludGVuYW5jZS5zYXZlKCk7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZyggJ3Byb2R1Y3Rpb24gdmVyc2lvbnMgZGVwbG95ZWQnICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihSZWxlYXNlQnJhbmNoKTpQcm9taXNlLjxib29sZWFuPn0gW2ZpbHRlcl0gLSBPcHRpb25hbCBmaWx0ZXIsIHJlbGVhc2UgYnJhbmNoZXMgd2lsbCBiZSBza2lwcGVkXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHRoaXMgcmVzb2x2ZXMgdG8gZmFsc2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIHVwZGF0ZUNoZWNrb3V0cyggZmlsdGVyICkge1xyXG4gICAgICBjb25zb2xlLmxvZyggJ1VwZGF0aW5nIGNoZWNrb3V0cycgKTtcclxuXHJcbiAgICAgIGNvbnN0IHJlbGVhc2VCcmFuY2hlcyA9IGF3YWl0IE1haW50ZW5hbmNlLmdldE1haW50ZW5hbmNlQnJhbmNoZXMoKTtcclxuICAgICAgZm9yICggY29uc3QgcmVsZWFzZUJyYW5jaCBvZiByZWxlYXNlQnJhbmNoZXMgKSB7XHJcbiAgICAgICAgaWYgKCAhZmlsdGVyIHx8IGF3YWl0IGZpbHRlciggcmVsZWFzZUJyYW5jaCApICkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coIGBVcGRhdGluZyAke3JlbGVhc2VCcmFuY2h9YCApO1xyXG5cclxuICAgICAgICAgIGF3YWl0IHJlbGVhc2VCcmFuY2gudXBkYXRlQ2hlY2tvdXQoKTtcclxuICAgICAgICAgIGF3YWl0IHJlbGVhc2VCcmFuY2gudHJhbnNwaWxlKCk7XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhd2FpdCByZWxlYXNlQnJhbmNoLmJ1aWxkKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYXRjaCggZSApIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coIGBmYWlsZWQgdG8gYnVpbGQgJHtyZWxlYXNlQnJhbmNoLnRvU3RyaW5nKCl9ICR7ZX1gICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihSZWxlYXNlQnJhbmNoKTpQcm9taXNlLjxib29sZWFuPn0gW2ZpbHRlcl0gLSBPcHRpb25hbCBmaWx0ZXIsIHJlbGVhc2UgYnJhbmNoZXMgd2lsbCBiZSBza2lwcGVkXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHRoaXMgcmVzb2x2ZXMgdG8gZmFsc2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIGNoZWNrVW5idWlsdENoZWNrb3V0cyggZmlsdGVyICkge1xyXG4gICAgICBjb25zb2xlLmxvZyggJ0NoZWNraW5nIHVuYnVpbHQgY2hlY2tvdXRzJyApO1xyXG5cclxuICAgICAgY29uc3QgcmVsZWFzZUJyYW5jaGVzID0gYXdhaXQgTWFpbnRlbmFuY2UuZ2V0TWFpbnRlbmFuY2VCcmFuY2hlcygpO1xyXG4gICAgICBmb3IgKCBjb25zdCByZWxlYXNlQnJhbmNoIG9mIHJlbGVhc2VCcmFuY2hlcyApIHtcclxuICAgICAgICBpZiAoICFmaWx0ZXIgfHwgYXdhaXQgZmlsdGVyKCByZWxlYXNlQnJhbmNoICkgKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyggcmVsZWFzZUJyYW5jaC50b1N0cmluZygpICk7XHJcbiAgICAgICAgICBjb25zdCB1bmJ1aWx0UmVzdWx0ID0gYXdhaXQgcmVsZWFzZUJyYW5jaC5jaGVja1VuYnVpbHQoKTtcclxuICAgICAgICAgIGlmICggdW5idWlsdFJlc3VsdCApIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coIHVuYnVpbHRSZXN1bHQgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKFJlbGVhc2VCcmFuY2gpOlByb21pc2UuPGJvb2xlYW4+fSBbZmlsdGVyXSAtIE9wdGlvbmFsIGZpbHRlciwgcmVsZWFzZSBicmFuY2hlcyB3aWxsIGJlIHNraXBwZWRcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdGhpcyByZXNvbHZlcyB0byBmYWxzZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgY2hlY2tCdWlsdENoZWNrb3V0cyggZmlsdGVyICkge1xyXG4gICAgICBjb25zb2xlLmxvZyggJ0NoZWNraW5nIGJ1aWx0IGNoZWNrb3V0cycgKTtcclxuXHJcbiAgICAgIGNvbnN0IHJlbGVhc2VCcmFuY2hlcyA9IGF3YWl0IE1haW50ZW5hbmNlLmdldE1haW50ZW5hbmNlQnJhbmNoZXMoKTtcclxuICAgICAgZm9yICggY29uc3QgcmVsZWFzZUJyYW5jaCBvZiByZWxlYXNlQnJhbmNoZXMgKSB7XHJcbiAgICAgICAgaWYgKCAhZmlsdGVyIHx8IGF3YWl0IGZpbHRlciggcmVsZWFzZUJyYW5jaCApICkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coIHJlbGVhc2VCcmFuY2gudG9TdHJpbmcoKSApO1xyXG4gICAgICAgICAgY29uc3QgYnVpbHRSZXN1bHQgPSBhd2FpdCByZWxlYXNlQnJhbmNoLmNoZWNrQnVpbHQoKTtcclxuICAgICAgICAgIGlmICggYnVpbHRSZXN1bHQgKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCBidWlsdFJlc3VsdCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVkZXBsb3lzIHByb2R1Y3Rpb24gdmVyc2lvbnMgb2YgYWxsIHJlbGVhc2UgYnJhbmNoZXMgKG9yIHRob3NlIG1hdGNoaW5nIGEgc3BlY2lmaWMgZmlsdGVyXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogTk9URTogVGhpcyBkb2VzIG5vdCB1c2UgdGhlIGN1cnJlbnQgbWFpbnRlbmFuY2Ugc3RhdGUhXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBHZW5lcmFsbHkgYW4gaXNzdWUgdG8gcmVmZXJlbmNlXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKFJlbGVhc2VCcmFuY2gpOlByb21pc2UuPGJvb2xlYW4+fSBbZmlsdGVyXSAtIE9wdGlvbmFsIGZpbHRlciwgcmVsZWFzZSBicmFuY2hlcyB3aWxsIGJlIHNraXBwZWRcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHRoaXMgcmVzb2x2ZXMgdG8gZmFsc2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIHJlZGVwbG95QWxsUHJvZHVjdGlvbiggbWVzc2FnZSwgZmlsdGVyICkge1xyXG4gICAgICAvLyBJZ25vcmUgdW5yZWxlYXNlZCBicmFuY2hlcyFcclxuICAgICAgY29uc3QgcmVsZWFzZUJyYW5jaGVzID0gYXdhaXQgTWFpbnRlbmFuY2UuZ2V0TWFpbnRlbmFuY2VCcmFuY2hlcyggKCkgPT4gdHJ1ZSwgZmFsc2UgKTtcclxuXHJcbiAgICAgIGZvciAoIGNvbnN0IHJlbGVhc2VCcmFuY2ggb2YgcmVsZWFzZUJyYW5jaGVzICkge1xyXG4gICAgICAgIGlmICggZmlsdGVyICYmICEoIGF3YWl0IGZpbHRlciggcmVsZWFzZUJyYW5jaCApICkgKSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCByZWxlYXNlQnJhbmNoLnRvU3RyaW5nKCkgKTtcclxuICAgICAgICBhd2FpdCByYyggcmVsZWFzZUJyYW5jaC5yZXBvLCByZWxlYXNlQnJhbmNoLmJyYW5jaCwgcmVsZWFzZUJyYW5jaC5icmFuZHMsIHRydWUsIG1lc3NhZ2UgKTtcclxuICAgICAgICBhd2FpdCBwcm9kdWN0aW9uKCByZWxlYXNlQnJhbmNoLnJlcG8sIHJlbGVhc2VCcmFuY2guYnJhbmNoLCByZWxlYXNlQnJhbmNoLmJyYW5kcywgdHJ1ZSwgbWVzc2FnZSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zb2xlLmxvZyggJ0ZpbmlzaGVkIHJlZGVwbG95aW5nJyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogVE9ETzogcmVtb3ZlIHRoZSBzZWNvbmQgcGFyYW0/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wZXJlbm5pYWwvaXNzdWVzLzMxOFxyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihSZWxlYXNlQnJhbmNoKTpib29sZWFufSBmaWx0ZXJSZXBvIC0gcmV0dXJuIGZhbHNlIGlmIHRoZSBSZWxlYXNlQnJhbmNoIHNob3VsZCBiZSBleGNsdWRlZC5cclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNoZWNrVW5yZWxlYXNlZEJyYW5jaGVzIC0gSWYgZmFsc2UsIHdpbGwgc2tpcCBjaGVja2luZyBmb3IgdW5yZWxlYXNlZCBicmFuY2hlcy4gVGhpcyBjaGVja2luZyBuZWVkcyBhbGwgcmVwb3MgY2hlY2tlZCBvdXRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yY2VDYWNoZUJyZWFrPWZhbHNlIC0gdHJ1ZSBpZiB5b3Ugd2FudCB0byBmb3JjZSBhIHJlY2FsY3VsYXRpb24gb2YgYWxsIFJlbGVhc2VCcmFuY2hlc1xyXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPEFycmF5LjxSZWxlYXNlQnJhbmNoPj59XHJcbiAgICAgKiBAcmVqZWN0cyB7RXhlY3V0ZUVycm9yfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0TWFpbnRlbmFuY2VCcmFuY2hlcyggZmlsdGVyUmVwbyA9ICgpID0+IHRydWUsIGNoZWNrVW5yZWxlYXNlZEJyYW5jaGVzID0gdHJ1ZSwgZm9yY2VDYWNoZUJyZWFrID0gZmFsc2UgKSB7XHJcbiAgICAgIGNvbnN0IHJlbGVhc2VCcmFuY2hlcyA9IGF3YWl0IE1haW50ZW5hbmNlLmxvYWRBbGxNYWludGVuYW5jZUJyYW5jaGVzKCBmb3JjZUNhY2hlQnJlYWsgKTtcclxuXHJcbiAgICAgIHJldHVybiByZWxlYXNlQnJhbmNoZXMuZmlsdGVyKCByZWxlYXNlQnJhbmNoID0+IHtcclxuICAgICAgICBpZiAoICFjaGVja1VucmVsZWFzZWRCcmFuY2hlcyAmJiAhcmVsZWFzZUJyYW5jaC5pc1JlbGVhc2VkICkge1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmlsdGVyUmVwbyggcmVsZWFzZUJyYW5jaCApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMb2FkcyBldmVyeSBwb3RlbnRpYWwgUmVsZWFzZUJyYW5jaCAocHVibGlzaGVkIHBoZXQgYW5kIHBoZXQtaW8gYnJhbmRzLCBhcyB3ZWxsIGFzIHVucmVsZWFzZWQgYnJhbmNoZXMpLCBhbmRcclxuICAgICAqIHNhdmVzIGl0IHRvIHRoZSBtYWludGVuYW5jZSBzdGF0ZS5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBDYWxsIHRoaXMgd2l0aCB0cnVlIHRvIGJyZWFrIHRoZSBjYWNoZSBhbmQgZm9yY2UgYSByZWNhbGN1bGF0aW9uIG9mIGFsbCBSZWxlYXNlQnJhbmNoZXNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGZvcmNlQ2FjaGVCcmVhaz1mYWxzZSAtIHRydWUgaWYgeW91IHdhbnQgdG8gZm9yY2UgYSByZWNhbGN1bGF0aW9uIG9mIGFsbCBSZWxlYXNlQnJhbmNoZXNcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFJlbGVhc2VCcmFuY2hbXT59XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhc3luYyBsb2FkQWxsTWFpbnRlbmFuY2VCcmFuY2hlcyggZm9yY2VDYWNoZUJyZWFrID0gZmFsc2UgKSB7XHJcbiAgICAgIGNvbnN0IG1haW50ZW5hbmNlID0gTWFpbnRlbmFuY2UubG9hZCgpO1xyXG5cclxuICAgICAgbGV0IHJlbGVhc2VCcmFuY2hlcyA9IG51bGw7XHJcbiAgICAgIGlmICggbWFpbnRlbmFuY2UuYWxsUmVsZWFzZUJyYW5jaGVzLmxlbmd0aCA+IDAgJiYgIWZvcmNlQ2FjaGVCcmVhayApIHtcclxuICAgICAgICByZWxlYXNlQnJhbmNoZXMgPSBtYWludGVuYW5jZS5hbGxSZWxlYXNlQnJhbmNoZXMubWFwKCByZWxlYXNlQnJhbmNoRGF0YSA9PiBSZWxlYXNlQnJhbmNoLmRlc2VyaWFsaXplKCByZWxlYXNlQnJhbmNoRGF0YSApICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gY2FjaGUgbWlzc1xyXG4gICAgICAgIHJlbGVhc2VCcmFuY2hlcyA9IGF3YWl0IFJlbGVhc2VCcmFuY2guZ2V0QWxsTWFpbnRlbmFuY2VCcmFuY2hlcygpO1xyXG4gICAgICAgIG1haW50ZW5hbmNlLmFsbFJlbGVhc2VCcmFuY2hlcyA9IHJlbGVhc2VCcmFuY2hlcztcclxuICAgICAgICBtYWludGVuYW5jZS5zYXZlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiByZWxlYXNlQnJhbmNoZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0IGludG8gYSBwbGFpbiBKUyBvYmplY3QgbWVhbnQgZm9yIEpTT04gc2VyaWFsaXphdGlvbi5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7U2VyaWFsaXplZE1haW50ZW5hbmNlfSAtIHNlZSBQYXRjaC5zZXJpYWxpemUoKSBhbmQgTW9kaWZpZWRCcmFuY2guc2VyaWFsaXplKClcclxuICAgICAqL1xyXG4gICAgc2VyaWFsaXplKCkge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHBhdGNoZXM6IHRoaXMucGF0Y2hlcy5tYXAoIHBhdGNoID0+IHBhdGNoLnNlcmlhbGl6ZSgpICksXHJcbiAgICAgICAgbW9kaWZpZWRCcmFuY2hlczogdGhpcy5tb2RpZmllZEJyYW5jaGVzLm1hcCggbW9kaWZpZWRCcmFuY2ggPT4gbW9kaWZpZWRCcmFuY2guc2VyaWFsaXplKCkgKSxcclxuICAgICAgICBhbGxSZWxlYXNlQnJhbmNoZXM6IHRoaXMuYWxsUmVsZWFzZUJyYW5jaGVzLm1hcCggcmVsZWFzZUJyYW5jaCA9PiByZWxlYXNlQnJhbmNoLnNlcmlhbGl6ZSgpIClcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRha2VzIGEgc2VyaWFsaXplZCBmb3JtIG9mIHRoZSBNYWludGVuYW5jZSBhbmQgcmV0dXJucyBhbiBhY3R1YWwgaW5zdGFuY2UuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtTZXJpYWxpemVkTWFpbnRlbmFuY2V9IC0gc2VlIE1haW50ZW5hbmNlLnNlcmlhbGl6ZSgpXHJcbiAgICAgKiBAcmV0dXJucyB7TWFpbnRlbmFuY2V9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBkZXNlcmlhbGl6ZSggeyBwYXRjaGVzLCBtb2RpZmllZEJyYW5jaGVzLCBhbGxSZWxlYXNlQnJhbmNoZXMgfSApIHtcclxuICAgICAgLy8gUGFzcyBpbiBwYXRjaCByZWZlcmVuY2VzIHRvIGJyYW5jaCBkZXNlcmlhbGl6YXRpb25cclxuICAgICAgY29uc3QgZGVzZXJpYWxpemVkUGF0Y2hlcyA9IHBhdGNoZXMubWFwKCBQYXRjaC5kZXNlcmlhbGl6ZSApO1xyXG4gICAgICBtb2RpZmllZEJyYW5jaGVzID0gbW9kaWZpZWRCcmFuY2hlcy5tYXAoIG1vZGlmaWVkQnJhbmNoID0+IE1vZGlmaWVkQnJhbmNoLmRlc2VyaWFsaXplKCBtb2RpZmllZEJyYW5jaCwgZGVzZXJpYWxpemVkUGF0Y2hlcyApICk7XHJcbiAgICAgIG1vZGlmaWVkQnJhbmNoZXMuc29ydCggKCBhLCBiICkgPT4ge1xyXG4gICAgICAgIGlmICggYS5yZXBvICE9PSBiLnJlcG8gKSB7XHJcbiAgICAgICAgICByZXR1cm4gYS5yZXBvIDwgYi5yZXBvID8gLTEgOiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGEuYnJhbmNoICE9PSBiLmJyYW5jaCApIHtcclxuICAgICAgICAgIHJldHVybiBhLmJyYW5jaCA8IGIuYnJhbmNoID8gLTEgOiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgICAgfSApO1xyXG4gICAgICBjb25zdCBkZXNlcmlhbGl6ZWRSZWxlYXNlQnJhbmNoZXMgPSBhbGxSZWxlYXNlQnJhbmNoZXMubWFwKCByZWxlYXNlQnJhbmNoID0+IFJlbGVhc2VCcmFuY2guZGVzZXJpYWxpemUoIHJlbGVhc2VCcmFuY2ggKSApO1xyXG5cclxuICAgICAgcmV0dXJuIG5ldyBNYWludGVuYW5jZSggZGVzZXJpYWxpemVkUGF0Y2hlcywgbW9kaWZpZWRCcmFuY2hlcywgZGVzZXJpYWxpemVkUmVsZWFzZUJyYW5jaGVzICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTYXZlcyB0aGUgc3RhdGUgb2YgdGhpcyBvYmplY3QgaW50byB0aGUgbWFpbnRlbmFuY2UgZmlsZS5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgc2F2ZSgpIHtcclxuICAgICAgcmV0dXJuIGZzLndyaXRlRmlsZVN5bmMoIE1BSU5URU5BTkNFX0ZJTEUsIEpTT04uc3RyaW5naWZ5KCB0aGlzLnNlcmlhbGl6ZSgpLCBudWxsLCAyICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIExvYWRzIGEgbmV3IE1haW50ZW5hbmNlIG9iamVjdCAoaWYgcG9zc2libGUpIGZyb20gdGhlIG1haW50ZW5hbmNlIGZpbGUuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01haW50ZW5hbmNlfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgbG9hZCgpIHtcclxuICAgICAgaWYgKCBmcy5leGlzdHNTeW5jKCBNQUlOVEVOQU5DRV9GSUxFICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIE1haW50ZW5hbmNlLmRlc2VyaWFsaXplKCBKU09OLnBhcnNlKCBmcy5yZWFkRmlsZVN5bmMoIE1BSU5URU5BTkNFX0ZJTEUsICd1dGY4JyApICkgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gbmV3IE1haW50ZW5hbmNlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0cyBhIGNvbW1hbmQtbGluZSBSRVBMIHdpdGggZmVhdHVyZXMgbG9hZGVkLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgc3RhcnRSRVBMKCkge1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xyXG4gICAgICAgIHdpbnN0b24uZGVmYXVsdC50cmFuc3BvcnRzLmNvbnNvbGUubGV2ZWwgPSAnZXJyb3InO1xyXG5cclxuICAgICAgICBjb25zdCBzZXNzaW9uID0gcmVwbC5zdGFydCgge1xyXG4gICAgICAgICAgcHJvbXB0OiAnbWFpbnRlbmFuY2U+ICcsXHJcbiAgICAgICAgICB1c2VDb2xvcnM6IHRydWUsXHJcbiAgICAgICAgICByZXBsTW9kZTogcmVwbC5SRVBMX01PREVfU1RSSUNULFxyXG4gICAgICAgICAgaWdub3JlVW5kZWZpbmVkOiB0cnVlXHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAvLyBXYWl0IGZvciBwcm9taXNlcyBiZWZvcmUgYmVpbmcgcmVhZHkgZm9yIGlucHV0XHJcbiAgICAgICAgY29uc3Qgbm9kZUV2YWwgPSBzZXNzaW9uLmV2YWw7XHJcbiAgICAgICAgc2Vzc2lvbi5ldmFsID0gYXN5bmMgKCBjbWQsIGNvbnRleHQsIGZpbGVuYW1lLCBjYWxsYmFjayApID0+IHtcclxuICAgICAgICAgIG5vZGVFdmFsKCBjbWQsIGNvbnRleHQsIGZpbGVuYW1lLCAoIF8sIHJlc3VsdCApID0+IHtcclxuICAgICAgICAgICAgaWYgKCByZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlICkge1xyXG4gICAgICAgICAgICAgIHJlc3VsdC50aGVuKCB2YWwgPT4gY2FsbGJhY2soIF8sIHZhbCApICkuY2F0Y2goIGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCBlLnN0YWNrICkge1xyXG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCBgTWFpbnRlbmFuY2UgdGFzayBmYWlsZWQ6XFxuJHtlLnN0YWNrfVxcbkZ1bGwgRXJyb3IgZGV0YWlsczpcXG4ke0pTT04uc3RyaW5naWZ5KCBlLCBudWxsLCAyICl9YCApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIHR5cGVvZiBlID09PSAnc3RyaW5nJyApIHtcclxuICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvciggYE1haW50ZW5hbmNlIHRhc2sgZmFpbGVkOiAke2V9YCApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIGBNYWludGVuYW5jZSB0YXNrIGZhaWxlZCB3aXRoIHVua25vd24gZXJyb3I6ICR7SlNPTi5zdHJpbmdpZnkoIGUsIG51bGwsIDIgKX1gICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgIGNhbGxiYWNrKCBfLCByZXN1bHQgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIE9ubHkgYXV0b2NvbXBsZXRlIFwicHVibGljXCIgQVBJIGZ1bmN0aW9ucyBmb3IgTWFpbnRlbmFuY2UuXHJcbiAgICAgICAgLy8gY29uc3Qgbm9kZUNvbXBsZXRlciA9IHNlc3Npb24uY29tcGxldGVyO1xyXG4gICAgICAgIC8vIHNlc3Npb24uY29tcGxldGVyID0gZnVuY3Rpb24oIHRleHQsIGNiICkge1xyXG4gICAgICAgIC8vICAgbm9kZUNvbXBsZXRlciggdGV4dCwgKCBfLCBbIGNvbXBsZXRpb25zLCBjb21wbGV0ZWQgXSApID0+IHtcclxuICAgICAgICAvLyAgICAgY29uc3QgbWF0Y2ggPSBjb21wbGV0ZWQubWF0Y2goIC9eTWFpbnRlbmFuY2VcXC4oXFx3KikrLyApO1xyXG4gICAgICAgIC8vICAgICBpZiAoIG1hdGNoICkge1xyXG4gICAgICAgIC8vICAgICAgIGNvbnN0IGZ1bmNTdGFydCA9IG1hdGNoWyAxIF07XHJcbiAgICAgICAgLy8gICAgICAgY2IoIG51bGwsIFsgUFVCTElDX0ZVTkNUSU9OUy5maWx0ZXIoIGYgPT4gZi5zdGFydHNXaXRoKCBmdW5jU3RhcnQgKSApLm1hcCggZiA9PiBgTWFpbnRlbmFuY2UuJHtmfWAgKSwgY29tcGxldGVkIF0gKTtcclxuICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgIC8vICAgICBlbHNlIHtcclxuICAgICAgICAvLyAgICAgICBjYiggbnVsbCwgWyBjb21wbGV0aW9ucywgY29tcGxldGVkIF0gKTtcclxuICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgIC8vICAgfSApO1xyXG4gICAgICAgIC8vIH07XHJcblxyXG4gICAgICAgIC8vIEFsbG93IGNvbnRyb2xsaW5nIHZlcmJvc2l0eVxyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggZ2xvYmFsLCAndmVyYm9zZScsIHtcclxuICAgICAgICAgIGdldCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHdpbnN0b24uZGVmYXVsdC50cmFuc3BvcnRzLmNvbnNvbGUubGV2ZWwgPT09ICdpbmZvJztcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBzZXQoIHZhbHVlICkge1xyXG4gICAgICAgICAgICB3aW5zdG9uLmRlZmF1bHQudHJhbnNwb3J0cy5jb25zb2xlLmxldmVsID0gdmFsdWUgPyAnaW5mbycgOiAnZXJyb3InO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgc2Vzc2lvbi5jb250ZXh0Lk1haW50ZW5hbmNlID0gTWFpbnRlbmFuY2U7XHJcbiAgICAgICAgc2Vzc2lvbi5jb250ZXh0Lm0gPSBNYWludGVuYW5jZTtcclxuICAgICAgICBzZXNzaW9uLmNvbnRleHQuTSA9IE1haW50ZW5hbmNlO1xyXG4gICAgICAgIHNlc3Npb24uY29udGV4dC5SZWxlYXNlQnJhbmNoID0gUmVsZWFzZUJyYW5jaDtcclxuICAgICAgICBzZXNzaW9uLmNvbnRleHQucmIgPSBSZWxlYXNlQnJhbmNoO1xyXG5cclxuICAgICAgICBzZXNzaW9uLm9uKCAnZXhpdCcsIHJlc29sdmUgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTG9va3MgdXAgYSBwYXRjaCBieSBpdHMgbmFtZS5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0Y2hOYW1lXHJcbiAgICAgKiBAcmV0dXJucyB7UGF0Y2h9XHJcbiAgICAgKi9cclxuICAgIGZpbmRQYXRjaCggcGF0Y2hOYW1lICkge1xyXG4gICAgICBjb25zdCBwYXRjaCA9IHRoaXMucGF0Y2hlcy5maW5kKCBwID0+IHAubmFtZSA9PT0gcGF0Y2hOYW1lICk7XHJcbiAgICAgIGFzc2VydCggcGF0Y2gsIGBQYXRjaCBub3QgZm91bmQgZm9yICR7cGF0Y2hOYW1lfWAgKTtcclxuXHJcbiAgICAgIHJldHVybiBwYXRjaDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIExvb2tzIHVwIChvciBhZGRzKSBhIE1vZGlmaWVkQnJhbmNoIGJ5IGl0cyBpZGVudGlmeWluZyBpbmZvcm1hdGlvbi5cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBicmFuY2hcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Vycm9ySWZNaXNzaW5nXVxyXG4gICAgICogQHBhcmFtIHtBcnJheS48UmVsZWFzZUJyYW5jaD59IFtyZWxlYXNlQnJhbmNoZXNdIC0gSWYgcHJvdmlkZWQsIGl0IHdpbGwgc3BlZWQgdXAgdGhlIHByb2Nlc3NcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlLjxNb2RpZmllZEJyYW5jaD59XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGVuc3VyZU1vZGlmaWVkQnJhbmNoKCByZXBvLCBicmFuY2gsIGVycm9ySWZNaXNzaW5nID0gZmFsc2UsIHJlbGVhc2VCcmFuY2hlcyA9IG51bGwgKSB7XHJcbiAgICAgIGxldCBtb2RpZmllZEJyYW5jaCA9IHRoaXMubW9kaWZpZWRCcmFuY2hlcy5maW5kKCBtb2RpZmllZEJyYW5jaCA9PiBtb2RpZmllZEJyYW5jaC5yZXBvID09PSByZXBvICYmIG1vZGlmaWVkQnJhbmNoLmJyYW5jaCA9PT0gYnJhbmNoICk7XHJcblxyXG4gICAgICBpZiAoICFtb2RpZmllZEJyYW5jaCApIHtcclxuICAgICAgICBpZiAoIGVycm9ySWZNaXNzaW5nICkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgQ291bGQgbm90IGZpbmQgYSB0cmFja2VkIG1vZGlmaWVkIGJyYW5jaCBmb3IgJHtyZXBvfSAke2JyYW5jaH1gICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlbGVhc2VCcmFuY2hlcyA9IHJlbGVhc2VCcmFuY2hlcyB8fCBhd2FpdCBNYWludGVuYW5jZS5nZXRNYWludGVuYW5jZUJyYW5jaGVzKCB0ZXN0UmVwbyA9PiB0ZXN0UmVwbyA9PT0gcmVwbyApO1xyXG4gICAgICAgIGNvbnN0IHJlbGVhc2VCcmFuY2ggPSByZWxlYXNlQnJhbmNoZXMuZmluZCggcmVsZWFzZSA9PiByZWxlYXNlLnJlcG8gPT09IHJlcG8gJiYgcmVsZWFzZS5icmFuY2ggPT09IGJyYW5jaCApO1xyXG4gICAgICAgIGFzc2VydCggcmVsZWFzZUJyYW5jaCwgYENvdWxkIG5vdCBmaW5kIGEgcmVsZWFzZSBicmFuY2ggZm9yIHJlcG89JHtyZXBvfSBicmFuY2g9JHticmFuY2h9YCApO1xyXG5cclxuICAgICAgICBtb2RpZmllZEJyYW5jaCA9IG5ldyBNb2RpZmllZEJyYW5jaCggcmVsZWFzZUJyYW5jaCApO1xyXG5cclxuICAgICAgICAvLyBJZiB3ZSBhcmUgY3JlYXRpbmcgaXQsIGFkZCBpdCB0byBvdXIgbGlzdC5cclxuICAgICAgICB0aGlzLm1vZGlmaWVkQnJhbmNoZXMucHVzaCggbW9kaWZpZWRCcmFuY2ggKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIG1vZGlmaWVkQnJhbmNoO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXR0ZW1wdHMgdG8gcmVtb3ZlIGEgbW9kaWZpZWQgYnJhbmNoIChpZiBpdCBkb2Vzbid0IG5lZWQgdG8gYmUga2VwdCBhcm91bmQpLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7TW9kaWZpZWRCcmFuY2h9IG1vZGlmaWVkQnJhbmNoXHJcbiAgICAgKi9cclxuICAgIHRyeVJlbW92aW5nTW9kaWZpZWRCcmFuY2goIG1vZGlmaWVkQnJhbmNoICkge1xyXG4gICAgICBpZiAoIG1vZGlmaWVkQnJhbmNoLmlzVW51c2VkICkge1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5tb2RpZmllZEJyYW5jaGVzLmluZGV4T2YoIG1vZGlmaWVkQnJhbmNoICk7XHJcbiAgICAgICAgYXNzZXJ0KCBpbmRleCA+PSAwICk7XHJcblxyXG4gICAgICAgIHRoaXMubW9kaWZpZWRCcmFuY2hlcy5zcGxpY2UoIGluZGV4LCAxICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBNYWludGVuYW5jZTtcclxufSApKCk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNQSxVQUFVLEdBQUdDLE9BQU8sQ0FBRSxxQkFBc0IsQ0FBQztBQUNuRCxNQUFNQyxFQUFFLEdBQUdELE9BQU8sQ0FBRSxhQUFjLENBQUM7QUFDbkMsTUFBTUUsY0FBYyxHQUFHRixPQUFPLENBQUUsa0JBQW1CLENBQUM7QUFDcEQsTUFBTUcsY0FBYyxHQUFHSCxPQUFPLENBQUUsa0JBQW1CLENBQUM7QUFDcEQsTUFBTUksS0FBSyxHQUFHSixPQUFPLENBQUUsU0FBVSxDQUFDO0FBQ2xDLE1BQU1LLGFBQWEsR0FBR0wsT0FBTyxDQUFFLGlCQUFrQixDQUFDO0FBQ2xELE1BQU1NLEtBQUssR0FBR04sT0FBTyxDQUFFLFNBQVUsQ0FBQztBQUNsQyxNQUFNTyxjQUFjLEdBQUdQLE9BQU8sQ0FBRSxrQkFBbUIsQ0FBQztBQUNwRCxNQUFNUSxjQUFjLEdBQUdSLE9BQU8sQ0FBRSxrQkFBbUIsQ0FBQztBQUNwRCxNQUFNUyxPQUFPLEdBQUdULE9BQU8sQ0FBRSxXQUFZLENBQUM7QUFDdEMsTUFBTVUsY0FBYyxHQUFHVixPQUFPLENBQUUsa0JBQW1CLENBQUM7QUFDcEQsTUFBTVcsV0FBVyxHQUFHWCxPQUFPLENBQUUsZUFBZ0IsQ0FBQztBQUM5QyxNQUFNWSxZQUFZLEdBQUdaLE9BQU8sQ0FBRSxnQkFBaUIsQ0FBQztBQUNoRCxNQUFNYSxlQUFlLEdBQUdiLE9BQU8sQ0FBRSxtQkFBb0IsQ0FBQztBQUN0RCxNQUFNYyxNQUFNLEdBQUdkLE9BQU8sQ0FBRSxVQUFXLENBQUM7QUFDcEMsTUFBTWUsV0FBVyxHQUFHZixPQUFPLENBQUUsZUFBZ0IsQ0FBQztBQUM5QyxNQUFNZ0IsYUFBYSxHQUFHaEIsT0FBTyxDQUFFLGlCQUFrQixDQUFDO0FBQ2xELE1BQU1pQixTQUFTLEdBQUdqQixPQUFPLENBQUUsYUFBYyxDQUFDO0FBQzFDLE1BQU1rQixlQUFlLEdBQUdsQixPQUFPLENBQUUsbUJBQW9CLENBQUM7QUFDdEQsTUFBTW1CLFVBQVUsR0FBR25CLE9BQU8sQ0FBRSxjQUFlLENBQUM7QUFDNUMsTUFBTW9CLE9BQU8sR0FBR3BCLE9BQU8sQ0FBRSxXQUFZLENBQUM7QUFDdEMsTUFBTXFCLE9BQU8sR0FBR3JCLE9BQU8sQ0FBRSxXQUFZLENBQUM7QUFDdEMsTUFBTXNCLFdBQVcsR0FBR3RCLE9BQU8sQ0FBRSxlQUFnQixDQUFDO0FBQzlDLE1BQU11QixNQUFNLEdBQUd2QixPQUFPLENBQUUsUUFBUyxDQUFDO0FBQ2xDLE1BQU13QixFQUFFLEdBQUd4QixPQUFPLENBQUUsSUFBSyxDQUFDO0FBQzFCLE1BQU15QixJQUFJLEdBQUd6QixPQUFPLENBQUUsTUFBTyxDQUFDO0FBQzlCLE1BQU0wQixPQUFPLEdBQUcxQixPQUFPLENBQUUsU0FBVSxDQUFDO0FBQ3BDLE1BQU0yQixZQUFZLEdBQUczQixPQUFPLENBQUUsZ0JBQWlCLENBQUM7QUFDaEQsTUFBTTRCLGlDQUFpQyxHQUFHNUIsT0FBTyxDQUFFLHFDQUFzQyxDQUFDOztBQUUxRjtBQUNBLE1BQU02QixnQkFBZ0IsR0FBRyxtQkFBbUI7O0FBRTVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQUMsTUFBTSxDQUFDQyxPQUFPLEdBQUssWUFBVztFQUU1QixNQUFNQyxXQUFXLENBQUM7SUFDaEI7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNJQyxXQUFXQSxDQUFFQyxPQUFPLEdBQUcsRUFBRSxFQUFFQyxnQkFBZ0IsR0FBRyxFQUFFLEVBQUVDLGtCQUFrQixHQUFHLEVBQUUsRUFBRztNQUMxRWIsTUFBTSxDQUFFYyxLQUFLLENBQUNDLE9BQU8sQ0FBRUosT0FBUSxDQUFFLENBQUM7TUFDbENBLE9BQU8sQ0FBQ0ssT0FBTyxDQUFFQyxLQUFLLElBQUlqQixNQUFNLENBQUVpQixLQUFLLFlBQVlwQyxLQUFNLENBQUUsQ0FBQztNQUM1RG1CLE1BQU0sQ0FBRWMsS0FBSyxDQUFDQyxPQUFPLENBQUVILGdCQUFpQixDQUFFLENBQUM7TUFDM0NBLGdCQUFnQixDQUFDSSxPQUFPLENBQUVFLE1BQU0sSUFBSWxCLE1BQU0sQ0FBRWtCLE1BQU0sWUFBWXRDLGNBQWUsQ0FBRSxDQUFDOztNQUVoRjtNQUNBLElBQUksQ0FBQytCLE9BQU8sR0FBR0EsT0FBTzs7TUFFdEI7TUFDQSxJQUFJLENBQUNDLGdCQUFnQixHQUFHQSxnQkFBZ0I7O01BRXhDO01BQ0EsSUFBSSxDQUFDQyxrQkFBa0IsR0FBR0Esa0JBQWtCO0lBQzlDOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksT0FBT00sS0FBS0EsQ0FBQSxFQUFHO01BQ2JDLE9BQU8sQ0FBQ0MsR0FBRyxDQUFFLGlHQUFpRyxHQUNqRyw4REFBK0QsQ0FBQztNQUM3RSxJQUFJWixXQUFXLENBQUMsQ0FBQyxDQUFDYSxJQUFJLENBQUMsQ0FBQztJQUMxQjs7SUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksYUFBYUMsaUJBQWlCQSxDQUFFQyxNQUFNLEVBQUc7TUFDdkMsS0FBTSxNQUFNQyxJQUFJLElBQUl0QyxjQUFjLENBQUMsQ0FBQyxFQUFHO1FBQ3JDLElBQUtzQyxJQUFJLEtBQUssV0FBVyxJQUFJLEVBQUcsTUFBTTdCLFVBQVUsQ0FBRTZCLElBQUssQ0FBQyxDQUFFLEVBQUc7VUFDM0RMLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLHVCQUFzQkksSUFBSyw0REFBNEQsQ0FBQztVQUN0RztRQUNGO01BQ0Y7TUFFQSxNQUFNQyxlQUFlLEdBQUcsTUFBTWpCLFdBQVcsQ0FBQ2tCLHNCQUFzQixDQUFFSCxNQUFPLENBQUM7O01BRTFFO01BQ0EsTUFBTUksVUFBVSxHQUFHLENBQUMsQ0FBQztNQUNyQixNQUFNQyx5QkFBeUIsR0FBRyxNQUFNSixJQUFJLElBQUk7UUFDOUMsSUFBSyxDQUFDRyxVQUFVLENBQUVILElBQUksQ0FBRSxFQUFHO1VBQ3pCRyxVQUFVLENBQUVILElBQUksQ0FBRSxHQUFHLE1BQU1wQyxZQUFZLENBQUVvQyxJQUFLLENBQUM7UUFDakQ7UUFDQSxPQUFPRyxVQUFVLENBQUVILElBQUksQ0FBRTtNQUMzQixDQUFDO01BRUQsS0FBTSxNQUFNSyxhQUFhLElBQUlKLGVBQWUsRUFBRztRQUM3QyxJQUFLLENBQUNGLE1BQU0sS0FBSSxNQUFNQSxNQUFNLENBQUVNLGFBQWMsQ0FBQyxHQUFHO1VBQzlDVixPQUFPLENBQUNDLEdBQUcsQ0FBRyxHQUFFUyxhQUFhLENBQUNMLElBQUssSUFBR0ssYUFBYSxDQUFDWixNQUFPLEVBQUUsQ0FBQztVQUM5RCxLQUFNLE1BQU1hLElBQUksSUFBSSxNQUFNRCxhQUFhLENBQUNFLFNBQVMsQ0FBRUgseUJBQTBCLENBQUMsRUFBRztZQUMvRVQsT0FBTyxDQUFDQyxHQUFHLENBQUcsS0FBSVUsSUFBSyxFQUFFLENBQUM7VUFDNUI7UUFDRixDQUFDLE1BQ0k7VUFDSFgsT0FBTyxDQUFDQyxHQUFHLENBQUcsR0FBRVMsYUFBYSxDQUFDTCxJQUFLLElBQUdLLGFBQWEsQ0FBQ1osTUFBTywyQkFBMkIsQ0FBQztRQUN6RjtNQUNGO0lBQ0Y7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7SUFDSSxhQUFhZSxRQUFRQSxDQUFBLEVBQUc7TUFDdEIsTUFBTVAsZUFBZSxHQUFHLE1BQU1qQixXQUFXLENBQUNrQixzQkFBc0IsQ0FBQyxDQUFDO01BRWxFLE1BQU1PLE1BQU0sR0FBRyxFQUFFO01BRWpCLEtBQU0sTUFBTUosYUFBYSxJQUFJSixlQUFlLEVBQUc7UUFDN0NOLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLFlBQVdTLGFBQWEsQ0FBQ0wsSUFBSyxJQUFHSyxhQUFhLENBQUNaLE1BQU8sRUFBRSxDQUFDO1FBQ3ZFLElBQUk7VUFDRixNQUFNakMsY0FBYyxDQUFFNkMsYUFBYSxDQUFDTCxJQUFJLEVBQUVLLGFBQWEsQ0FBQ1osTUFBTSxFQUFFLElBQUssQ0FBQyxDQUFDLENBQUM7VUFDeEUsTUFBTW5DLEtBQUssQ0FBRStDLGFBQWEsQ0FBQ0wsSUFBSSxFQUFFO1lBQy9CVSxNQUFNLEVBQUVMLGFBQWEsQ0FBQ0s7VUFDeEIsQ0FBRSxDQUFDO1VBQ0gsTUFBTSxJQUFJQyxLQUFLLENBQUUsMEJBQTJCLENBQUM7UUFDL0MsQ0FBQyxDQUNELE9BQU9DLENBQUMsRUFBRztVQUNUSCxNQUFNLENBQUNJLElBQUksQ0FBRyxHQUFFUixhQUFhLENBQUNMLElBQUssSUFBR0ssYUFBYSxDQUFDUyxLQUFNLEVBQUUsQ0FBQztRQUMvRDtNQUNGO01BRUEsSUFBS0wsTUFBTSxDQUFDTSxNQUFNLEVBQUc7UUFDbkJwQixPQUFPLENBQUNDLEdBQUcsQ0FBRyxtQkFBa0JhLE1BQU0sQ0FBQ08sSUFBSSxDQUFFLElBQUssQ0FBRSxFQUFFLENBQUM7TUFDekQsQ0FBQyxNQUNJO1FBQ0hyQixPQUFPLENBQUNDLEdBQUcsQ0FBRSxpQkFBa0IsQ0FBQztNQUNsQztJQUNGOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNJLGFBQWFxQixJQUFJQSxDQUFBLEVBQUc7TUFDbEIsTUFBTUMsV0FBVyxHQUFHbEMsV0FBVyxDQUFDbUMsSUFBSSxDQUFDLENBQUM7TUFFdEMsSUFBS0QsV0FBVyxDQUFDOUIsa0JBQWtCLENBQUMyQixNQUFNLEdBQUcsQ0FBQyxFQUFHO1FBQy9DcEIsT0FBTyxDQUFDQyxHQUFHLENBQUcsR0FBRXNCLFdBQVcsQ0FBQzlCLGtCQUFrQixDQUFDMkIsTUFBTyx5QkFBeUIsQ0FBQztNQUNsRjtNQUVBLEtBQU0sTUFBTUssY0FBYyxJQUFJRixXQUFXLENBQUMvQixnQkFBZ0IsRUFBRztRQUMzRFEsT0FBTyxDQUFDQyxHQUFHLENBQUcsR0FBRXdCLGNBQWMsQ0FBQ3BCLElBQUssSUFBR29CLGNBQWMsQ0FBQzNCLE1BQU8sSUFBRzJCLGNBQWMsQ0FBQ1YsTUFBTSxDQUFDTSxJQUFJLENBQUUsR0FBSSxDQUFFLEdBQUVJLGNBQWMsQ0FBQ2YsYUFBYSxDQUFDZ0IsVUFBVSxHQUFHLEVBQUUsR0FBRyxlQUFnQixFQUFFLENBQUM7UUFDdEssSUFBS0QsY0FBYyxDQUFDRSxlQUFlLEVBQUc7VUFDcEMzQixPQUFPLENBQUNDLEdBQUcsQ0FBRyxlQUFjd0IsY0FBYyxDQUFDRSxlQUFlLENBQUNDLFFBQVEsQ0FBQyxDQUFFLEVBQUUsQ0FBQztRQUMzRTtRQUNBLElBQUtILGNBQWMsQ0FBQ0ksYUFBYSxDQUFDVCxNQUFNLEVBQUc7VUFDekNwQixPQUFPLENBQUNDLEdBQUcsQ0FBRyxZQUFXd0IsY0FBYyxDQUFDSSxhQUFhLENBQUNDLEdBQUcsQ0FBRWpDLEtBQUssSUFBSUEsS0FBSyxDQUFDa0MsSUFBSyxDQUFDLENBQUNWLElBQUksQ0FBRSxHQUFJLENBQUUsRUFBRSxDQUFDO1FBQ2xHO1FBQ0EsSUFBS0ksY0FBYyxDQUFDTyxjQUFjLENBQUNaLE1BQU0sRUFBRztVQUMxQ3BCLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLHFCQUFvQndCLGNBQWMsQ0FBQ08sY0FBYyxDQUFDWCxJQUFJLENBQUUsT0FBUSxDQUFFLEVBQUUsQ0FBQztRQUNyRjtRQUNBLElBQUtJLGNBQWMsQ0FBQ1EsZUFBZSxDQUFDYixNQUFNLEVBQUc7VUFDM0NwQixPQUFPLENBQUNDLEdBQUcsQ0FBRyxzQkFBcUJ3QixjQUFjLENBQUNRLGVBQWUsQ0FBQ1osSUFBSSxDQUFFLE9BQVEsQ0FBRSxFQUFFLENBQUM7UUFDdkY7UUFDQSxJQUFLYSxNQUFNLENBQUNDLElBQUksQ0FBRVYsY0FBYyxDQUFDVyxtQkFBb0IsQ0FBQyxDQUFDaEIsTUFBTSxHQUFHLENBQUMsRUFBRztVQUNsRXBCLE9BQU8sQ0FBQ0MsR0FBRyxDQUFFLFNBQVUsQ0FBQztVQUN4QixLQUFNLE1BQU1vQyxHQUFHLElBQUlILE1BQU0sQ0FBQ0MsSUFBSSxDQUFFVixjQUFjLENBQUNXLG1CQUFvQixDQUFDLEVBQUc7WUFDckVwQyxPQUFPLENBQUNDLEdBQUcsQ0FBRyxPQUFNb0MsR0FBSSxLQUFJWixjQUFjLENBQUNXLG1CQUFtQixDQUFFQyxHQUFHLENBQUcsRUFBRSxDQUFDO1VBQzNFO1FBQ0Y7TUFDRjtNQUVBLEtBQU0sTUFBTXhDLEtBQUssSUFBSTBCLFdBQVcsQ0FBQ2hDLE9BQU8sRUFBRztRQUN6Q1MsT0FBTyxDQUFDQyxHQUFHLENBQUcsSUFBR0osS0FBSyxDQUFDa0MsSUFBSyxJQUFHbEMsS0FBSyxDQUFDa0MsSUFBSSxLQUFLbEMsS0FBSyxDQUFDUSxJQUFJLEdBQUksS0FBSVIsS0FBSyxDQUFDUSxJQUFLLEdBQUUsR0FBRyxFQUFHLElBQUdSLEtBQUssQ0FBQ3lDLE9BQVEsRUFBRSxDQUFDO1FBQ3ZHLEtBQU0sTUFBTUMsR0FBRyxJQUFJMUMsS0FBSyxDQUFDMkMsSUFBSSxFQUFHO1VBQzlCeEMsT0FBTyxDQUFDQyxHQUFHLENBQUcsS0FBSXNDLEdBQUksRUFBRSxDQUFDO1FBQzNCO1FBQ0EsS0FBTSxNQUFNZCxjQUFjLElBQUlGLFdBQVcsQ0FBQy9CLGdCQUFnQixFQUFHO1VBQzNELElBQUtpQyxjQUFjLENBQUNJLGFBQWEsQ0FBQ1ksUUFBUSxDQUFFNUMsS0FBTSxDQUFDLEVBQUc7WUFDcERHLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLE9BQU13QixjQUFjLENBQUNwQixJQUFLLElBQUdvQixjQUFjLENBQUMzQixNQUFPLElBQUcyQixjQUFjLENBQUNWLE1BQU0sQ0FBQ00sSUFBSSxDQUFFLEdBQUksQ0FBRSxFQUFFLENBQUM7VUFDM0c7UUFDRjtNQUNGO0lBQ0Y7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksYUFBYXFCLFNBQVNBLENBQUV0QyxNQUFNLEdBQUdBLENBQUEsS0FBTSxJQUFJLEVBQUc7TUFDNUMsTUFBTW1CLFdBQVcsR0FBR2xDLFdBQVcsQ0FBQ21DLElBQUksQ0FBQyxDQUFDO01BRXRDLE1BQU1tQixnQkFBZ0IsR0FBR3BCLFdBQVcsQ0FBQy9CLGdCQUFnQixDQUFDWSxNQUFNLENBQUVxQixjQUFjLElBQUksQ0FBQyxDQUFDQSxjQUFjLENBQUNFLGVBQWUsSUFBSXZCLE1BQU0sQ0FBRXFCLGNBQWUsQ0FBRSxDQUFDO01BQzlJLE1BQU1tQixrQkFBa0IsR0FBR0QsZ0JBQWdCLENBQUN2QyxNQUFNLENBQUVxQixjQUFjLElBQUlBLGNBQWMsQ0FBQ0UsZUFBZSxDQUFDa0IsUUFBUSxLQUFLLElBQUssQ0FBQztNQUN4SCxNQUFNQyx3QkFBd0IsR0FBR0gsZ0JBQWdCLENBQUN2QyxNQUFNLENBQUVxQixjQUFjLElBQUlBLGNBQWMsQ0FBQ0UsZUFBZSxDQUFDa0IsUUFBUSxLQUFLLElBQUssQ0FBQztNQUU5SCxJQUFLRCxrQkFBa0IsQ0FBQ3hCLE1BQU0sRUFBRztRQUMvQnBCLE9BQU8sQ0FBQ0MsR0FBRyxDQUFFLHNCQUF1QixDQUFDO1FBRXJDLEtBQU0sTUFBTXdCLGNBQWMsSUFBSW1CLGtCQUFrQixFQUFHO1VBQ2pELE1BQU1HLEtBQUssR0FBRyxNQUFNdEIsY0FBYyxDQUFDdUIsb0JBQW9CLENBQUMsQ0FBQztVQUN6RCxLQUFNLE1BQU1DLElBQUksSUFBSUYsS0FBSyxFQUFHO1lBQzFCL0MsT0FBTyxDQUFDQyxHQUFHLENBQUVnRCxJQUFLLENBQUM7VUFDckI7UUFDRjtNQUNGO01BRUEsSUFBS0gsd0JBQXdCLENBQUMxQixNQUFNLEVBQUc7UUFDckNwQixPQUFPLENBQUNDLEdBQUcsQ0FBRSw2QkFBOEIsQ0FBQztRQUU1QyxLQUFNLE1BQU13QixjQUFjLElBQUlxQix3QkFBd0IsRUFBRztVQUN2RCxNQUFNQyxLQUFLLEdBQUcsTUFBTXRCLGNBQWMsQ0FBQ3VCLG9CQUFvQixDQUFDLENBQUM7VUFDekQsS0FBTSxNQUFNQyxJQUFJLElBQUlGLEtBQUssRUFBRztZQUMxQi9DLE9BQU8sQ0FBQ0MsR0FBRyxDQUFFZ0QsSUFBSyxDQUFDO1VBQ3JCO1FBQ0Y7TUFDRjtJQUNGOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNJLGFBQWFDLHNCQUFzQkEsQ0FBRUMsZUFBZSxHQUFHLEVBQUUsRUFBRztNQUMxRCxNQUFNNUIsV0FBVyxHQUFHbEMsV0FBVyxDQUFDbUMsSUFBSSxDQUFDLENBQUM7TUFFdEMsS0FBTSxNQUFNQyxjQUFjLElBQUlGLFdBQVcsQ0FBQy9CLGdCQUFnQixFQUFHO1FBQzNELElBQUssQ0FBQ2lDLGNBQWMsQ0FBQ2YsYUFBYSxDQUFDZ0IsVUFBVSxJQUFJRCxjQUFjLENBQUNPLGNBQWMsQ0FBQ1osTUFBTSxHQUFHLENBQUMsRUFBRztVQUMxRnBCLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLHNCQUFxQndCLGNBQWMsQ0FBQ2YsYUFBYSxDQUFDa0IsUUFBUSxDQUFDLENBQUUsRUFBRSxDQUFDO1VBQzlFLE1BQU1ILGNBQWMsQ0FBQzJCLHFCQUFxQixDQUFFRCxlQUFnQixDQUFDO1FBQy9EO01BQ0Y7TUFFQW5ELE9BQU8sQ0FBQ0MsR0FBRyxDQUFFLHFDQUFzQyxDQUFDO0lBQ3REOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNJLGFBQWFvRCxXQUFXQSxDQUFFaEQsSUFBSSxFQUFFaUMsT0FBTyxFQUFFZ0IsU0FBUyxFQUFHO01BQ25ELE1BQU0vQixXQUFXLEdBQUdsQyxXQUFXLENBQUNtQyxJQUFJLENBQUMsQ0FBQztNQUV0QzhCLFNBQVMsR0FBR0EsU0FBUyxJQUFJakQsSUFBSTtNQUU3QixLQUFNLE1BQU1SLEtBQUssSUFBSTBCLFdBQVcsQ0FBQ2hDLE9BQU8sRUFBRztRQUN6QyxJQUFLTSxLQUFLLENBQUNrQyxJQUFJLEtBQUt1QixTQUFTLEVBQUc7VUFDOUIsTUFBTSxJQUFJdEMsS0FBSyxDQUFFLG9FQUFxRSxDQUFDO1FBQ3pGO01BQ0Y7TUFFQU8sV0FBVyxDQUFDaEMsT0FBTyxDQUFDMkIsSUFBSSxDQUFFLElBQUl6RCxLQUFLLENBQUU0QyxJQUFJLEVBQUVpRCxTQUFTLEVBQUVoQixPQUFRLENBQUUsQ0FBQztNQUVqRWYsV0FBVyxDQUFDckIsSUFBSSxDQUFDLENBQUM7TUFFbEJGLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLHFCQUFvQkksSUFBSyxrQkFBaUJpQyxPQUFRLEVBQUUsQ0FBQztJQUNyRTs7SUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNJLGFBQWFpQixXQUFXQSxDQUFFRCxTQUFTLEVBQUc7TUFDcEMsTUFBTS9CLFdBQVcsR0FBR2xDLFdBQVcsQ0FBQ21DLElBQUksQ0FBQyxDQUFDO01BRXRDLE1BQU0zQixLQUFLLEdBQUcwQixXQUFXLENBQUNpQyxTQUFTLENBQUVGLFNBQVUsQ0FBQztNQUVoRCxLQUFNLE1BQU14RCxNQUFNLElBQUl5QixXQUFXLENBQUMvQixnQkFBZ0IsRUFBRztRQUNuRCxJQUFLTSxNQUFNLENBQUMrQixhQUFhLENBQUNZLFFBQVEsQ0FBRTVDLEtBQU0sQ0FBQyxFQUFHO1VBQzVDLE1BQU0sSUFBSW1CLEtBQUssQ0FBRSxrREFBbUQsQ0FBQztRQUN2RTtNQUNGO01BRUFPLFdBQVcsQ0FBQ2hDLE9BQU8sQ0FBQ2tFLE1BQU0sQ0FBRWxDLFdBQVcsQ0FBQ2hDLE9BQU8sQ0FBQ21FLE9BQU8sQ0FBRTdELEtBQU0sQ0FBQyxFQUFFLENBQUUsQ0FBQztNQUVyRTBCLFdBQVcsQ0FBQ3JCLElBQUksQ0FBQyxDQUFDO01BRWxCRixPQUFPLENBQUNDLEdBQUcsQ0FBRyxxQkFBb0JxRCxTQUFVLEVBQUUsQ0FBQztJQUNqRDs7SUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksYUFBYUssV0FBV0EsQ0FBRUwsU0FBUyxFQUFFZixHQUFHLEVBQUc7TUFDekMsTUFBTWhCLFdBQVcsR0FBR2xDLFdBQVcsQ0FBQ21DLElBQUksQ0FBQyxDQUFDO01BRXRDLE1BQU0zQixLQUFLLEdBQUcwQixXQUFXLENBQUNpQyxTQUFTLENBQUVGLFNBQVUsQ0FBQztNQUVoRCxJQUFLLENBQUNmLEdBQUcsRUFBRztRQUNWQSxHQUFHLEdBQUcsTUFBTTVELFdBQVcsQ0FBRWtCLEtBQUssQ0FBQ1EsSUFBSSxFQUFFLE1BQU8sQ0FBQztRQUM3Q0wsT0FBTyxDQUFDQyxHQUFHLENBQUcsb0NBQW1Dc0MsR0FBSSxFQUFFLENBQUM7TUFDMUQ7TUFFQTFDLEtBQUssQ0FBQzJDLElBQUksQ0FBQ3RCLElBQUksQ0FBRXFCLEdBQUksQ0FBQztNQUV0QmhCLFdBQVcsQ0FBQ3JCLElBQUksQ0FBQyxDQUFDO01BRWxCRixPQUFPLENBQUNDLEdBQUcsQ0FBRyxhQUFZc0MsR0FBSSxhQUFZZSxTQUFVLEVBQUUsQ0FBQztJQUN6RDs7SUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksYUFBYU0sY0FBY0EsQ0FBRU4sU0FBUyxFQUFFZixHQUFHLEVBQUc7TUFDNUMsTUFBTWhCLFdBQVcsR0FBR2xDLFdBQVcsQ0FBQ21DLElBQUksQ0FBQyxDQUFDO01BRXRDLE1BQU0zQixLQUFLLEdBQUcwQixXQUFXLENBQUNpQyxTQUFTLENBQUVGLFNBQVUsQ0FBQztNQUVoRCxNQUFNTyxLQUFLLEdBQUdoRSxLQUFLLENBQUMyQyxJQUFJLENBQUNrQixPQUFPLENBQUVuQixHQUFJLENBQUM7TUFDdkMzRCxNQUFNLENBQUVpRixLQUFLLElBQUksQ0FBQyxFQUFFLGVBQWdCLENBQUM7TUFFckNoRSxLQUFLLENBQUMyQyxJQUFJLENBQUNpQixNQUFNLENBQUVJLEtBQUssRUFBRSxDQUFFLENBQUM7TUFFN0J0QyxXQUFXLENBQUNyQixJQUFJLENBQUMsQ0FBQztNQUVsQkYsT0FBTyxDQUFDQyxHQUFHLENBQUcsZUFBY3NDLEdBQUksZUFBY2UsU0FBVSxFQUFFLENBQUM7SUFDN0Q7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDSSxhQUFhUSxrQkFBa0JBLENBQUVSLFNBQVMsRUFBRztNQUMzQyxNQUFNL0IsV0FBVyxHQUFHbEMsV0FBVyxDQUFDbUMsSUFBSSxDQUFDLENBQUM7TUFFdEMsTUFBTTNCLEtBQUssR0FBRzBCLFdBQVcsQ0FBQ2lDLFNBQVMsQ0FBRUYsU0FBVSxDQUFDO01BRWhELEtBQU0sTUFBTWYsR0FBRyxJQUFJMUMsS0FBSyxDQUFDMkMsSUFBSSxFQUFHO1FBQzlCeEMsT0FBTyxDQUFDQyxHQUFHLENBQUcsZ0JBQWVzQyxHQUFJLGVBQWNlLFNBQVUsRUFBRSxDQUFDO01BQzlEO01BRUF6RCxLQUFLLENBQUMyQyxJQUFJLEdBQUcsRUFBRTtNQUVmakIsV0FBVyxDQUFDckIsSUFBSSxDQUFDLENBQUM7SUFDcEI7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNJLGFBQWE2RCxjQUFjQSxDQUFFMUQsSUFBSSxFQUFFUCxNQUFNLEVBQUV3RCxTQUFTLEVBQUc7TUFDckQsTUFBTS9CLFdBQVcsR0FBR2xDLFdBQVcsQ0FBQ21DLElBQUksQ0FBQyxDQUFDO01BRXRDLE1BQU0zQixLQUFLLEdBQUcwQixXQUFXLENBQUNpQyxTQUFTLENBQUVGLFNBQVUsQ0FBQztNQUVoRCxNQUFNN0IsY0FBYyxHQUFHLE1BQU1GLFdBQVcsQ0FBQ3lDLG9CQUFvQixDQUFFM0QsSUFBSSxFQUFFUCxNQUFPLENBQUM7TUFDN0UyQixjQUFjLENBQUNJLGFBQWEsQ0FBQ1gsSUFBSSxDQUFFckIsS0FBTSxDQUFDO01BRTFDMEIsV0FBVyxDQUFDckIsSUFBSSxDQUFDLENBQUM7TUFFbEJGLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLGVBQWNxRCxTQUFVLGtCQUFpQmpELElBQUssSUFBR1AsTUFBTyxFQUFFLENBQUM7SUFDM0U7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDSSxhQUFhbUUsMkJBQTJCQSxDQUFFdkQsYUFBYSxFQUFFNEMsU0FBUyxFQUFHO01BQ25FLE1BQU0vQixXQUFXLEdBQUdsQyxXQUFXLENBQUNtQyxJQUFJLENBQUMsQ0FBQztNQUV0QyxNQUFNM0IsS0FBSyxHQUFHMEIsV0FBVyxDQUFDaUMsU0FBUyxDQUFFRixTQUFVLENBQUM7TUFFaEQsTUFBTTdCLGNBQWMsR0FBRyxJQUFJakUsY0FBYyxDQUFFa0QsYUFBYyxDQUFDO01BQzFEYSxXQUFXLENBQUMvQixnQkFBZ0IsQ0FBQzBCLElBQUksQ0FBRU8sY0FBZSxDQUFDO01BQ25EQSxjQUFjLENBQUNJLGFBQWEsQ0FBQ1gsSUFBSSxDQUFFckIsS0FBTSxDQUFDO01BQzFDMEIsV0FBVyxDQUFDckIsSUFBSSxDQUFDLENBQUM7TUFFbEJGLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLGVBQWNxRCxTQUFVLGtCQUFpQjVDLGFBQWEsQ0FBQ0wsSUFBSyxJQUFHSyxhQUFhLENBQUNaLE1BQU8sRUFBRSxDQUFDO0lBQ3ZHOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksYUFBYW9FLGdCQUFnQkEsQ0FBRVosU0FBUyxFQUFFbEQsTUFBTSxFQUFHO01BQ2pELE1BQU1tQixXQUFXLEdBQUdsQyxXQUFXLENBQUNtQyxJQUFJLENBQUMsQ0FBQztNQUV0QyxNQUFNM0IsS0FBSyxHQUFHMEIsV0FBVyxDQUFDaUMsU0FBUyxDQUFFRixTQUFVLENBQUM7TUFDaEQsTUFBTWhELGVBQWUsR0FBRyxNQUFNakIsV0FBVyxDQUFDa0Isc0JBQXNCLENBQUMsQ0FBQztNQUVsRSxLQUFNLE1BQU1HLGFBQWEsSUFBSUosZUFBZSxFQUFHO1FBQzdDLE1BQU02RCxVQUFVLEdBQUcsTUFBTS9ELE1BQU0sQ0FBRU0sYUFBYyxDQUFDO1FBRWhELElBQUssQ0FBQ3lELFVBQVUsRUFBRztVQUNqQm5FLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLGNBQWFTLGFBQWEsQ0FBQ0wsSUFBSyxJQUFHSyxhQUFhLENBQUNaLE1BQU8sRUFBRSxDQUFDO1VBQ3pFO1FBQ0Y7UUFFQSxNQUFNMkIsY0FBYyxHQUFHLE1BQU1GLFdBQVcsQ0FBQ3lDLG9CQUFvQixDQUFFdEQsYUFBYSxDQUFDTCxJQUFJLEVBQUVLLGFBQWEsQ0FBQ1osTUFBTSxFQUFFLEtBQUssRUFBRVEsZUFBZ0IsQ0FBQztRQUNqSSxJQUFLLENBQUNtQixjQUFjLENBQUNJLGFBQWEsQ0FBQ1ksUUFBUSxDQUFFNUMsS0FBTSxDQUFDLEVBQUc7VUFDckQ0QixjQUFjLENBQUNJLGFBQWEsQ0FBQ1gsSUFBSSxDQUFFckIsS0FBTSxDQUFDO1VBQzFDRyxPQUFPLENBQUNDLEdBQUcsQ0FBRyxzQkFBcUJxRCxTQUFVLE9BQU01QyxhQUFhLENBQUNMLElBQUssSUFBR0ssYUFBYSxDQUFDWixNQUFPLEVBQUUsQ0FBQztVQUNqR3lCLFdBQVcsQ0FBQ3JCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixDQUFDLE1BQ0k7VUFDSEYsT0FBTyxDQUFDQyxHQUFHLENBQUcsU0FBUXFELFNBQVUsd0JBQXVCNUMsYUFBYSxDQUFDTCxJQUFLLElBQUdLLGFBQWEsQ0FBQ1osTUFBTyxFQUFFLENBQUM7UUFDdkc7TUFDRjtNQUVBeUIsV0FBVyxDQUFDckIsSUFBSSxDQUFDLENBQUM7SUFDcEI7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksYUFBYWtFLG1CQUFtQkEsQ0FBRWQsU0FBUyxFQUFHO01BQzVDLE1BQU1qRSxXQUFXLENBQUM2RSxnQkFBZ0IsQ0FBRVosU0FBUyxFQUFFLFlBQVksSUFBSyxDQUFDO0lBQ25FOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksYUFBYWUsc0JBQXNCQSxDQUFFZixTQUFTLEVBQUVmLEdBQUcsRUFBRztNQUNwRCxNQUFNaEIsV0FBVyxHQUFHbEMsV0FBVyxDQUFDbUMsSUFBSSxDQUFDLENBQUM7TUFDdEMsTUFBTTNCLEtBQUssR0FBRzBCLFdBQVcsQ0FBQ2lDLFNBQVMsQ0FBRUYsU0FBVSxDQUFDO01BRWhELE1BQU1qRSxXQUFXLENBQUM2RSxnQkFBZ0IsQ0FBRVosU0FBUyxFQUFFLE1BQU01QyxhQUFhLElBQUk7UUFDcEUsT0FBT0EsYUFBYSxDQUFDNEQsWUFBWSxDQUFFekUsS0FBSyxDQUFDUSxJQUFJLEVBQUVrQyxHQUFJLENBQUM7TUFDdEQsQ0FBRSxDQUFDO0lBQ0w7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDSSxhQUFhZ0MscUJBQXFCQSxDQUFFakIsU0FBUyxFQUFFZixHQUFHLEVBQUc7TUFDbkQsTUFBTWhCLFdBQVcsR0FBR2xDLFdBQVcsQ0FBQ21DLElBQUksQ0FBQyxDQUFDO01BQ3RDLE1BQU0zQixLQUFLLEdBQUcwQixXQUFXLENBQUNpQyxTQUFTLENBQUVGLFNBQVUsQ0FBQztNQUVoRCxNQUFNakUsV0FBVyxDQUFDNkUsZ0JBQWdCLENBQUVaLFNBQVMsRUFBRSxNQUFNNUMsYUFBYSxJQUFJO1FBQ3BFLE9BQU9BLGFBQWEsQ0FBQzhELFdBQVcsQ0FBRTNFLEtBQUssQ0FBQ1EsSUFBSSxFQUFFa0MsR0FBSSxDQUFDO01BQ3JELENBQUUsQ0FBQztJQUNMOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDSSxhQUFha0MsMkJBQTJCQSxDQUFFbkIsU0FBUyxFQUFFbEQsTUFBTSxFQUFHO01BQzVELE1BQU1mLFdBQVcsQ0FBQzZFLGdCQUFnQixDQUFFWixTQUFTLEVBQUUsTUFBTTVDLGFBQWEsSUFBSTtRQUNwRSxNQUFNN0MsY0FBYyxDQUFFNkMsYUFBYSxDQUFDTCxJQUFJLEVBQUVLLGFBQWEsQ0FBQ1osTUFBTSxFQUFFLElBQUssQ0FBQztRQUN0RSxNQUFNckIsT0FBTyxDQUFFaUMsYUFBYSxDQUFDTCxJQUFLLENBQUM7UUFDbkMsTUFBTTFDLEtBQUssQ0FBRStDLGFBQWEsQ0FBQ0wsSUFBSyxDQUFDO1FBQ2pDLE1BQU1xRSxjQUFjLEdBQUduSCxjQUFjLENBQUNvSCxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3pELElBQUlDLFFBQVE7UUFDWixJQUFLRixjQUFjLENBQUNHLEtBQUssS0FBSyxDQUFDLEVBQUc7VUFDaENELFFBQVEsR0FBSSxNQUFLbEUsYUFBYSxDQUFDTCxJQUFLLGVBQWNLLGFBQWEsQ0FBQ0wsSUFBSyxlQUFjO1FBQ3JGLENBQUMsTUFDSTtVQUNIdUUsUUFBUSxHQUFJLE1BQUtsRSxhQUFhLENBQUNMLElBQUssVUFBU0ssYUFBYSxDQUFDTCxJQUFLLFVBQVM7UUFDM0U7UUFDQSxPQUFPRCxNQUFNLENBQUVNLGFBQWEsRUFBRTdCLEVBQUUsQ0FBQ2lHLFlBQVksQ0FBRUYsUUFBUSxFQUFFLE1BQU8sQ0FBRSxDQUFDO01BQ3JFLENBQUUsQ0FBQztJQUNMOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDSSxhQUFhRyxpQkFBaUJBLENBQUUxRSxJQUFJLEVBQUVQLE1BQU0sRUFBRXdELFNBQVMsRUFBRztNQUN4RCxNQUFNL0IsV0FBVyxHQUFHbEMsV0FBVyxDQUFDbUMsSUFBSSxDQUFDLENBQUM7TUFFdEMsTUFBTTNCLEtBQUssR0FBRzBCLFdBQVcsQ0FBQ2lDLFNBQVMsQ0FBRUYsU0FBVSxDQUFDO01BRWhELE1BQU03QixjQUFjLEdBQUcsTUFBTUYsV0FBVyxDQUFDeUMsb0JBQW9CLENBQUUzRCxJQUFJLEVBQUVQLE1BQU8sQ0FBQztNQUM3RSxNQUFNK0QsS0FBSyxHQUFHcEMsY0FBYyxDQUFDSSxhQUFhLENBQUM2QixPQUFPLENBQUU3RCxLQUFNLENBQUM7TUFDM0RqQixNQUFNLENBQUVpRixLQUFLLElBQUksQ0FBQyxFQUFFLG9EQUFxRCxDQUFDO01BRTFFcEMsY0FBYyxDQUFDSSxhQUFhLENBQUM0QixNQUFNLENBQUVJLEtBQUssRUFBRSxDQUFFLENBQUM7TUFDL0N0QyxXQUFXLENBQUN5RCx5QkFBeUIsQ0FBRXZELGNBQWUsQ0FBQztNQUV2REYsV0FBVyxDQUFDckIsSUFBSSxDQUFDLENBQUM7TUFFbEJGLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLGlCQUFnQnFELFNBQVUsU0FBUWpELElBQUssSUFBR1AsTUFBTyxFQUFFLENBQUM7SUFDcEU7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDSSxhQUFhbUYsbUJBQW1CQSxDQUFFM0IsU0FBUyxFQUFFbEQsTUFBTSxFQUFHO01BQ3BELE1BQU1tQixXQUFXLEdBQUdsQyxXQUFXLENBQUNtQyxJQUFJLENBQUMsQ0FBQztNQUV0QyxNQUFNM0IsS0FBSyxHQUFHMEIsV0FBVyxDQUFDaUMsU0FBUyxDQUFFRixTQUFVLENBQUM7TUFFaEQsS0FBTSxNQUFNN0IsY0FBYyxJQUFJRixXQUFXLENBQUMvQixnQkFBZ0IsRUFBRztRQUMzRCxNQUFNMEYsWUFBWSxHQUFHLE1BQU05RSxNQUFNLENBQUVxQixjQUFjLENBQUNmLGFBQWMsQ0FBQztRQUVqRSxJQUFLLENBQUN3RSxZQUFZLEVBQUc7VUFDbkJsRixPQUFPLENBQUNDLEdBQUcsQ0FBRyxjQUFhd0IsY0FBYyxDQUFDcEIsSUFBSyxJQUFHb0IsY0FBYyxDQUFDM0IsTUFBTyxFQUFFLENBQUM7VUFDM0U7UUFDRjs7UUFFQTtRQUNBLE1BQU0rRCxLQUFLLEdBQUdwQyxjQUFjLENBQUNJLGFBQWEsQ0FBQzZCLE9BQU8sQ0FBRTdELEtBQU0sQ0FBQztRQUMzRCxJQUFLZ0UsS0FBSyxHQUFHLENBQUMsRUFBRztVQUNmO1FBQ0Y7UUFFQXBDLGNBQWMsQ0FBQ0ksYUFBYSxDQUFDNEIsTUFBTSxDQUFFSSxLQUFLLEVBQUUsQ0FBRSxDQUFDO1FBQy9DdEMsV0FBVyxDQUFDeUQseUJBQXlCLENBQUV2RCxjQUFlLENBQUM7UUFFdkR6QixPQUFPLENBQUNDLEdBQUcsQ0FBRyx3QkFBdUJxRCxTQUFVLFNBQVE3QixjQUFjLENBQUNwQixJQUFLLElBQUdvQixjQUFjLENBQUMzQixNQUFPLEVBQUUsQ0FBQztNQUN6RztNQUVBeUIsV0FBVyxDQUFDckIsSUFBSSxDQUFDLENBQUM7SUFDcEI7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDSSxhQUFhaUYseUJBQXlCQSxDQUFFN0IsU0FBUyxFQUFFZixHQUFHLEVBQUc7TUFDdkQsTUFBTWhCLFdBQVcsR0FBR2xDLFdBQVcsQ0FBQ21DLElBQUksQ0FBQyxDQUFDO01BQ3RDLE1BQU0zQixLQUFLLEdBQUcwQixXQUFXLENBQUNpQyxTQUFTLENBQUVGLFNBQVUsQ0FBQztNQUVoRCxNQUFNakUsV0FBVyxDQUFDNEYsbUJBQW1CLENBQUUzQixTQUFTLEVBQUUsTUFBTTVDLGFBQWEsSUFBSTtRQUN2RSxPQUFPQSxhQUFhLENBQUM0RCxZQUFZLENBQUV6RSxLQUFLLENBQUNRLElBQUksRUFBRWtDLEdBQUksQ0FBQztNQUN0RCxDQUFFLENBQUM7SUFDTDs7SUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNJLGFBQWE2Qyx3QkFBd0JBLENBQUU5QixTQUFTLEVBQUVmLEdBQUcsRUFBRztNQUN0RCxNQUFNaEIsV0FBVyxHQUFHbEMsV0FBVyxDQUFDbUMsSUFBSSxDQUFDLENBQUM7TUFDdEMsTUFBTTNCLEtBQUssR0FBRzBCLFdBQVcsQ0FBQ2lDLFNBQVMsQ0FBRUYsU0FBVSxDQUFDO01BRWhELE1BQU1qRSxXQUFXLENBQUM0RixtQkFBbUIsQ0FBRTNCLFNBQVMsRUFBRSxNQUFNNUMsYUFBYSxJQUFJO1FBQ3ZFLE9BQU9BLGFBQWEsQ0FBQzhELFdBQVcsQ0FBRTNFLEtBQUssQ0FBQ1EsSUFBSSxFQUFFa0MsR0FBSSxDQUFDO01BQ3JELENBQUUsQ0FBQztJQUNMOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNJLE9BQU84Qyw2QkFBNkJBLENBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFHO01BQ3RELE9BQU8sTUFBTTdFLGFBQWEsSUFBSTtRQUM1QixNQUFNQSxhQUFhLENBQUM4RSxRQUFRLENBQUUsS0FBTSxDQUFDO1FBRXJDLElBQUszRyxFQUFFLENBQUM0RyxVQUFVLENBQUVILElBQUssQ0FBQyxFQUFHO1VBQzNCLE1BQU1JLFFBQVEsR0FBRzdHLEVBQUUsQ0FBQ2lHLFlBQVksQ0FBRVEsSUFBSSxFQUFFLE9BQVEsQ0FBQztVQUNqRCxPQUFPQyxTQUFTLENBQUVHLFFBQVMsQ0FBQztRQUM5QjtRQUVBLE9BQU8sS0FBSztNQUNkLENBQUM7SUFDSDs7SUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksYUFBYUMsY0FBY0EsQ0FBRXRGLElBQUksRUFBRVAsTUFBTSxFQUFFOEYsUUFBUSxHQUFHLEtBQUssRUFBRztNQUM1RCxNQUFNckUsV0FBVyxHQUFHbEMsV0FBVyxDQUFDbUMsSUFBSSxDQUFDLENBQUM7TUFFdEMsTUFBTUMsY0FBYyxHQUFHLE1BQU1GLFdBQVcsQ0FBQ3lDLG9CQUFvQixDQUFFM0QsSUFBSSxFQUFFUCxNQUFNLEVBQUUsSUFBSyxDQUFDO01BQ25GLE1BQU0yQixjQUFjLENBQUMrRCxRQUFRLENBQUMsQ0FBQztNQUUvQixJQUFLSSxRQUFRLElBQUkzRyxpQ0FBaUMsQ0FBQyxDQUFDLEVBQUc7UUFDckRlLE9BQU8sQ0FBQ0MsR0FBRyxDQUFFLDJCQUE0QixDQUFDOztRQUUxQztRQUNBLE1BQU1uQyxPQUFPLENBQUVrQixZQUFZLEVBQUUsQ0FBRSxtQkFBbUIsQ0FBRSxFQUFHLE1BQUtxQixJQUFLLEVBQUMsRUFBRTtVQUNsRXdGLE1BQU0sRUFBRTtRQUNWLENBQUUsQ0FBQztNQUNMOztNQUVBO01BQ0E3RixPQUFPLENBQUNDLEdBQUcsQ0FBRyxlQUFjSSxJQUFLLElBQUdQLE1BQU8sRUFBRSxDQUFDO0lBQ2hEOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0lBQ0ksYUFBYWdHLFlBQVlBLENBQUEsRUFBRztNQUMxQixNQUFNdkUsV0FBVyxHQUFHbEMsV0FBVyxDQUFDbUMsSUFBSSxDQUFDLENBQUM7TUFDdEMsSUFBSXVFLFVBQVUsR0FBRyxDQUFDO01BRWxCLEtBQU0sTUFBTXRFLGNBQWMsSUFBSUYsV0FBVyxDQUFDL0IsZ0JBQWdCLEVBQUc7UUFDM0QsSUFBS2lDLGNBQWMsQ0FBQ0ksYUFBYSxDQUFDVCxNQUFNLEtBQUssQ0FBQyxFQUFHO1VBQy9DO1FBQ0Y7UUFFQSxNQUFNZixJQUFJLEdBQUdvQixjQUFjLENBQUNwQixJQUFJO1FBQ2hDLE1BQU1QLE1BQU0sR0FBRzJCLGNBQWMsQ0FBQzNCLE1BQU07O1FBRXBDO1FBQ0EsS0FBTSxNQUFNRCxLQUFLLElBQUk0QixjQUFjLENBQUNJLGFBQWEsQ0FBQ21FLEtBQUssQ0FBQyxDQUFDLEVBQUc7VUFDMUQsSUFBS25HLEtBQUssQ0FBQzJDLElBQUksQ0FBQ3BCLE1BQU0sS0FBSyxDQUFDLEVBQUc7WUFDN0I7VUFDRjtVQUVBLE1BQU02RSxTQUFTLEdBQUdwRyxLQUFLLENBQUNRLElBQUk7VUFFNUIsSUFBSTtZQUNGO1lBQ0EsSUFBS29CLGNBQWMsQ0FBQ1csbUJBQW1CLENBQUU2RCxTQUFTLENBQUUsRUFBRztjQUNyRCxNQUFNN0gsV0FBVyxDQUFFNkgsU0FBUyxFQUFFeEUsY0FBYyxDQUFDVyxtQkFBbUIsQ0FBRTZELFNBQVMsQ0FBRyxDQUFDO1lBQ2pGLENBQUMsTUFDSTtjQUNIO2NBQ0EsTUFBTTdILFdBQVcsQ0FBRWlDLElBQUksRUFBRVAsTUFBTyxDQUFDO2NBQ2pDLE1BQU1yQixPQUFPLENBQUU0QixJQUFLLENBQUM7Y0FDckIsTUFBTTZGLFlBQVksR0FBRyxNQUFNaEksZUFBZSxDQUFFbUMsSUFBSyxDQUFDO2NBQ2xELE1BQU1rQyxHQUFHLEdBQUcyRCxZQUFZLENBQUVELFNBQVMsQ0FBRSxDQUFDMUQsR0FBRztjQUN6QyxNQUFNbkUsV0FBVyxDQUFFaUMsSUFBSSxFQUFFLFFBQVMsQ0FBQzs7Y0FFbkM7Y0FDQSxNQUFNakMsV0FBVyxDQUFFNkgsU0FBUyxFQUFFMUQsR0FBSSxDQUFDO1lBQ3JDO1lBRUF2QyxPQUFPLENBQUNDLEdBQUcsQ0FBRyxlQUFjZ0csU0FBVSxZQUFXNUYsSUFBSyxJQUFHUCxNQUFPLEVBQUUsQ0FBQztZQUVuRSxLQUFNLE1BQU15QyxHQUFHLElBQUkxQyxLQUFLLENBQUMyQyxJQUFJLEVBQUc7Y0FDOUIsTUFBTTJELGlCQUFpQixHQUFHLE1BQU05SCxhQUFhLENBQUU0SCxTQUFTLEVBQUUxRCxHQUFJLENBQUM7Y0FFL0QsSUFBSzRELGlCQUFpQixFQUFHO2dCQUN2QixNQUFNQyxVQUFVLEdBQUcsTUFBTXpILFdBQVcsQ0FBRXNILFNBQVMsRUFBRSxNQUFPLENBQUM7Z0JBQ3pEakcsT0FBTyxDQUFDQyxHQUFHLENBQUcsMkJBQTBCc0MsR0FBSSxlQUFjNkQsVUFBVyxFQUFFLENBQUM7Z0JBRXhFM0UsY0FBYyxDQUFDVyxtQkFBbUIsQ0FBRTZELFNBQVMsQ0FBRSxHQUFHRyxVQUFVO2dCQUM1RDNFLGNBQWMsQ0FBQ0ksYUFBYSxDQUFDNEIsTUFBTSxDQUFFaEMsY0FBYyxDQUFDSSxhQUFhLENBQUM2QixPQUFPLENBQUU3RCxLQUFNLENBQUMsRUFBRSxDQUFFLENBQUM7Z0JBQ3ZGa0csVUFBVSxFQUFFOztnQkFFWjtnQkFDQSxJQUFLLENBQUN0RSxjQUFjLENBQUNRLGVBQWUsQ0FBQ1EsUUFBUSxDQUFFNUMsS0FBSyxDQUFDeUMsT0FBUSxDQUFDLEVBQUc7a0JBQy9EYixjQUFjLENBQUNRLGVBQWUsQ0FBQ2YsSUFBSSxDQUFFckIsS0FBSyxDQUFDeUMsT0FBUSxDQUFDO2dCQUN0RDtnQkFFQTtjQUNGLENBQUMsTUFDSTtnQkFDSHRDLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLHlCQUF3QnNDLEdBQUksRUFBRSxDQUFDO2NBQy9DO1lBQ0Y7VUFDRixDQUFDLENBQ0QsT0FBT3RCLENBQUMsRUFBRztZQUNUTSxXQUFXLENBQUNyQixJQUFJLENBQUMsQ0FBQztZQUVsQixNQUFNLElBQUljLEtBQUssQ0FBRywwQkFBeUJpRixTQUFVLE9BQU01RixJQUFLLElBQUdQLE1BQU8sS0FBSW1CLENBQUUsRUFBRSxDQUFDO1VBQ3JGO1FBQ0Y7UUFFQSxNQUFNN0MsV0FBVyxDQUFFcUQsY0FBYyxDQUFDcEIsSUFBSSxFQUFFLFFBQVMsQ0FBQztNQUNwRDtNQUVBa0IsV0FBVyxDQUFDckIsSUFBSSxDQUFDLENBQUM7TUFFbEJGLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLEdBQUU4RixVQUFXLGtCQUFrQixDQUFDO0lBQ2hEOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksYUFBYU0sa0JBQWtCQSxDQUFFakcsTUFBTSxFQUFHO01BQ3hDLE1BQU1tQixXQUFXLEdBQUdsQyxXQUFXLENBQUNtQyxJQUFJLENBQUMsQ0FBQztNQUV0QyxLQUFNLE1BQU1DLGNBQWMsSUFBSUYsV0FBVyxDQUFDL0IsZ0JBQWdCLEVBQUc7UUFDM0QsTUFBTThHLFlBQVksR0FBR3BFLE1BQU0sQ0FBQ0MsSUFBSSxDQUFFVixjQUFjLENBQUNXLG1CQUFvQixDQUFDO1FBQ3RFLElBQUtrRSxZQUFZLENBQUNsRixNQUFNLEtBQUssQ0FBQyxFQUFHO1VBQy9CO1FBQ0Y7UUFFQSxJQUFLaEIsTUFBTSxJQUFJLEVBQUcsTUFBTUEsTUFBTSxDQUFFcUIsY0FBZSxDQUFDLENBQUUsRUFBRztVQUNuRHpCLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLGtDQUFpQ3dCLGNBQWMsQ0FBQ3BCLElBQUssSUFBR29CLGNBQWMsQ0FBQzNCLE1BQU8sRUFBRSxDQUFDO1VBQy9GO1FBQ0Y7UUFFQSxJQUFJO1VBQ0Y7VUFDQSxNQUFNakMsY0FBYyxDQUFFNEQsY0FBYyxDQUFDcEIsSUFBSSxFQUFFb0IsY0FBYyxDQUFDM0IsTUFBTSxFQUFFLEtBQU0sQ0FBQztVQUN6RUUsT0FBTyxDQUFDQyxHQUFHLENBQUcsZUFBY3dCLGNBQWMsQ0FBQ3BCLElBQUssSUFBR29CLGNBQWMsQ0FBQzNCLE1BQU8sRUFBRSxDQUFDO1VBRTVFLE1BQU15RyxvQkFBb0IsR0FBSSxNQUFLOUUsY0FBYyxDQUFDcEIsSUFBSyxvQkFBbUI7VUFDMUUsTUFBTW1HLGdCQUFnQixHQUFHQyxJQUFJLENBQUNDLEtBQUssQ0FBRTdILEVBQUUsQ0FBQ2lHLFlBQVksQ0FBRXlCLG9CQUFvQixFQUFFLE9BQVEsQ0FBRSxDQUFDOztVQUV2RjtVQUNBQyxnQkFBZ0IsQ0FBRS9FLGNBQWMsQ0FBQ3BCLElBQUksQ0FBRSxDQUFDa0MsR0FBRyxHQUFHLE1BQU01RCxXQUFXLENBQUU4QyxjQUFjLENBQUNwQixJQUFJLEVBQUVvQixjQUFjLENBQUMzQixNQUFPLENBQUM7VUFFN0csS0FBTSxNQUFNNkcsVUFBVSxJQUFJTCxZQUFZLEVBQUc7WUFDdkMsTUFBTU0sZ0JBQWdCLEdBQUduRixjQUFjLENBQUNtRixnQkFBZ0I7WUFDeEQsTUFBTUMsUUFBUSxHQUFHLE1BQU03SSxXQUFXLENBQUUySSxVQUFXLENBQUM7WUFDaEQsTUFBTXBFLEdBQUcsR0FBR2QsY0FBYyxDQUFDVyxtQkFBbUIsQ0FBRXVFLFVBQVUsQ0FBRTtZQUU1REgsZ0JBQWdCLENBQUVHLFVBQVUsQ0FBRSxDQUFDcEUsR0FBRyxHQUFHQSxHQUFHO1lBRXhDLElBQUtzRSxRQUFRLENBQUNwRSxRQUFRLENBQUVtRSxnQkFBaUIsQ0FBQyxFQUFHO2NBQzNDNUcsT0FBTyxDQUFDQyxHQUFHLENBQUcsVUFBUzJHLGdCQUFpQixzQkFBcUJELFVBQVcsRUFBRSxDQUFDO2NBQzNFLE1BQU12SSxXQUFXLENBQUV1SSxVQUFVLEVBQUVDLGdCQUFpQixDQUFDO2NBQ2pELE1BQU1uSSxPQUFPLENBQUVrSSxVQUFXLENBQUM7Y0FDM0IsTUFBTVAsVUFBVSxHQUFHLE1BQU16SCxXQUFXLENBQUVnSSxVQUFVLEVBQUUsTUFBTyxDQUFDO2NBRTFELElBQUtwRSxHQUFHLEtBQUs2RCxVQUFVLEVBQUc7Z0JBQ3hCcEcsT0FBTyxDQUFDQyxHQUFHLENBQUcsZ0RBQStDc0MsR0FBSSxFQUFFLENBQUM7Z0JBQ3BFLE1BQU16RSxPQUFPLENBQUUsS0FBSyxFQUFFLENBQUUsT0FBTyxFQUFFeUUsR0FBRyxDQUFFLEVBQUcsTUFBS29FLFVBQVcsRUFBRSxDQUFDO2dCQUM1RCxNQUFNakksT0FBTyxDQUFFaUksVUFBVSxFQUFFQyxnQkFBaUIsQ0FBQztjQUMvQztZQUNGLENBQUMsTUFDSTtjQUNINUcsT0FBTyxDQUFDQyxHQUFHLENBQUcsVUFBUzJHLGdCQUFpQixzQkFBcUJELFVBQVcsYUFBYSxDQUFDO2NBQ3RGLE1BQU12SSxXQUFXLENBQUV1SSxVQUFVLEVBQUVwRSxHQUFJLENBQUM7Y0FDcEMsTUFBTWhFLGVBQWUsQ0FBRW9JLFVBQVUsRUFBRUMsZ0JBQWlCLENBQUM7Y0FDckQsTUFBTWxJLE9BQU8sQ0FBRWlJLFVBQVUsRUFBRUMsZ0JBQWlCLENBQUM7WUFDL0M7WUFFQSxPQUFPbkYsY0FBYyxDQUFDVyxtQkFBbUIsQ0FBRXVFLFVBQVUsQ0FBRTtZQUN2RGxGLGNBQWMsQ0FBQ0UsZUFBZSxHQUFHLElBQUk7WUFDckNKLFdBQVcsQ0FBQ3JCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztVQUN0Qjs7VUFFQSxNQUFNb0MsT0FBTyxHQUFHYixjQUFjLENBQUNRLGVBQWUsQ0FBQ1osSUFBSSxDQUFFLE9BQVEsQ0FBQztVQUM5RHhDLEVBQUUsQ0FBQ2lJLGFBQWEsQ0FBRVAsb0JBQW9CLEVBQUVFLElBQUksQ0FBQ00sU0FBUyxDQUFFUCxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsQ0FBRSxDQUFFLENBQUM7VUFDckYsTUFBTXJJLE1BQU0sQ0FBRXNELGNBQWMsQ0FBQ3BCLElBQUksRUFBRSxtQkFBb0IsQ0FBQztVQUN4RCxNQUFNL0IsU0FBUyxDQUFFbUQsY0FBYyxDQUFDcEIsSUFBSSxFQUFHLGlDQUFnQ2lDLE9BQVEsRUFBRSxDQUFDO1VBQ2xGLE1BQU01RCxPQUFPLENBQUUrQyxjQUFjLENBQUNwQixJQUFJLEVBQUVvQixjQUFjLENBQUMzQixNQUFPLENBQUM7O1VBRTNEO1VBQ0EsS0FBTSxNQUFNd0MsT0FBTyxJQUFJYixjQUFjLENBQUNRLGVBQWUsRUFBRztZQUN0RCxJQUFLLENBQUNSLGNBQWMsQ0FBQ08sY0FBYyxDQUFDUyxRQUFRLENBQUVILE9BQVEsQ0FBQyxFQUFHO2NBQ3hEYixjQUFjLENBQUNPLGNBQWMsQ0FBQ2QsSUFBSSxDQUFFb0IsT0FBUSxDQUFDO1lBQy9DO1VBQ0Y7VUFDQWIsY0FBYyxDQUFDUSxlQUFlLEdBQUcsRUFBRTtVQUNuQ1YsV0FBVyxDQUFDckIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOztVQUVwQixNQUFNdEMsY0FBYyxDQUFFNkQsY0FBYyxDQUFDcEIsSUFBSSxFQUFFLEtBQU0sQ0FBQztRQUNwRCxDQUFDLENBQ0QsT0FBT1ksQ0FBQyxFQUFHO1VBQ1RNLFdBQVcsQ0FBQ3JCLElBQUksQ0FBQyxDQUFDO1VBRWxCLE1BQU0sSUFBSWMsS0FBSyxDQUFHLHFDQUFvQ1MsY0FBYyxDQUFDcEIsSUFBSyxPQUFNb0IsY0FBYyxDQUFDM0IsTUFBTyxLQUFJbUIsQ0FBRSxFQUFFLENBQUM7UUFDakg7TUFDRjtNQUVBTSxXQUFXLENBQUNyQixJQUFJLENBQUMsQ0FBQztNQUVsQkYsT0FBTyxDQUFDQyxHQUFHLENBQUUsc0JBQXVCLENBQUM7SUFDdkM7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDSSxhQUFhK0csdUJBQXVCQSxDQUFFNUcsTUFBTSxFQUFHO01BQzdDLE1BQU1tQixXQUFXLEdBQUdsQyxXQUFXLENBQUNtQyxJQUFJLENBQUMsQ0FBQztNQUV0QyxLQUFNLE1BQU1DLGNBQWMsSUFBSUYsV0FBVyxDQUFDL0IsZ0JBQWdCLEVBQUc7UUFDM0QsSUFBSyxDQUFDaUMsY0FBYyxDQUFDd0YsMEJBQTBCLElBQUksQ0FBQ3hGLGNBQWMsQ0FBQ2YsYUFBYSxDQUFDZ0IsVUFBVSxFQUFHO1VBQzVGO1FBQ0Y7UUFFQTFCLE9BQU8sQ0FBQ0MsR0FBRyxDQUFFLGtEQUFtRCxDQUFDO1FBRWpFLElBQUtHLE1BQU0sSUFBSSxFQUFHLE1BQU1BLE1BQU0sQ0FBRXFCLGNBQWUsQ0FBQyxDQUFFLEVBQUc7VUFDbkR6QixPQUFPLENBQUNDLEdBQUcsQ0FBRywwQkFBeUJ3QixjQUFjLENBQUNwQixJQUFLLElBQUdvQixjQUFjLENBQUMzQixNQUFPLEVBQUUsQ0FBQztVQUN2RjtRQUNGO1FBRUEsSUFBSTtVQUNGRSxPQUFPLENBQUNDLEdBQUcsQ0FBRyx5QkFBd0J3QixjQUFjLENBQUNwQixJQUFLLElBQUdvQixjQUFjLENBQUMzQixNQUFPLEVBQUUsQ0FBQztVQUV0RixNQUFNb0gsT0FBTyxHQUFHLE1BQU01SixFQUFFLENBQUVtRSxjQUFjLENBQUNwQixJQUFJLEVBQUVvQixjQUFjLENBQUMzQixNQUFNLEVBQUUyQixjQUFjLENBQUNWLE1BQU0sRUFBRSxJQUFJLEVBQUVVLGNBQWMsQ0FBQ08sY0FBYyxDQUFDWCxJQUFJLENBQUUsSUFBSyxDQUFFLENBQUM7VUFDL0lJLGNBQWMsQ0FBQ0UsZUFBZSxHQUFHdUYsT0FBTztVQUN4QzNGLFdBQVcsQ0FBQ3JCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQ0QsT0FBT2UsQ0FBQyxFQUFHO1VBQ1RNLFdBQVcsQ0FBQ3JCLElBQUksQ0FBQyxDQUFDO1VBRWxCLE1BQU0sSUFBSWMsS0FBSyxDQUFHLDhCQUE2QlMsY0FBYyxDQUFDcEIsSUFBSyxPQUFNb0IsY0FBYyxDQUFDM0IsTUFBTyxLQUFJbUIsQ0FBRSxFQUFFLENBQUM7UUFDMUc7TUFDRjtNQUVBTSxXQUFXLENBQUNyQixJQUFJLENBQUMsQ0FBQztNQUVsQkYsT0FBTyxDQUFDQyxHQUFHLENBQUUsc0JBQXVCLENBQUM7SUFDdkM7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDSSxhQUFha0gsZ0JBQWdCQSxDQUFFL0csTUFBTSxFQUFHO01BQ3RDLE1BQU1tQixXQUFXLEdBQUdsQyxXQUFXLENBQUNtQyxJQUFJLENBQUMsQ0FBQztNQUV0QyxLQUFNLE1BQU1DLGNBQWMsSUFBSUYsV0FBVyxDQUFDL0IsZ0JBQWdCLEVBQUc7UUFDM0QsSUFBSyxDQUFDaUMsY0FBYyxDQUFDMkYsb0JBQW9CLElBQUksQ0FBQzNGLGNBQWMsQ0FBQ2YsYUFBYSxDQUFDZ0IsVUFBVSxFQUFHO1VBQ3RGO1FBQ0Y7UUFFQSxJQUFLdEIsTUFBTSxJQUFJLEVBQUcsTUFBTUEsTUFBTSxDQUFFcUIsY0FBZSxDQUFDLENBQUUsRUFBRztVQUNuRHpCLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLGtDQUFpQ3dCLGNBQWMsQ0FBQ3BCLElBQUssSUFBR29CLGNBQWMsQ0FBQzNCLE1BQU8sRUFBRSxDQUFDO1VBQy9GO1FBQ0Y7UUFFQSxJQUFJO1VBQ0ZFLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLGlDQUFnQ3dCLGNBQWMsQ0FBQ3BCLElBQUssSUFBR29CLGNBQWMsQ0FBQzNCLE1BQU8sRUFBRSxDQUFDO1VBRTlGLE1BQU1vSCxPQUFPLEdBQUcsTUFBTTlKLFVBQVUsQ0FBRXFFLGNBQWMsQ0FBQ3BCLElBQUksRUFBRW9CLGNBQWMsQ0FBQzNCLE1BQU0sRUFBRTJCLGNBQWMsQ0FBQ1YsTUFBTSxFQUFFLElBQUksRUFBRVUsY0FBYyxDQUFDTyxjQUFjLENBQUNYLElBQUksQ0FBRSxJQUFLLENBQUUsQ0FBQztVQUN2SkksY0FBYyxDQUFDRSxlQUFlLEdBQUd1RixPQUFPO1VBQ3hDekYsY0FBYyxDQUFDTyxjQUFjLEdBQUcsRUFBRTtVQUNsQ1QsV0FBVyxDQUFDckIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLENBQUMsQ0FDRCxPQUFPZSxDQUFDLEVBQUc7VUFDVE0sV0FBVyxDQUFDckIsSUFBSSxDQUFDLENBQUM7VUFFbEIsTUFBTSxJQUFJYyxLQUFLLENBQUcsc0NBQXFDUyxjQUFjLENBQUNwQixJQUFLLE9BQU1vQixjQUFjLENBQUMzQixNQUFPLEtBQUltQixDQUFFLEVBQUUsQ0FBQztRQUNsSDtNQUNGO01BRUFNLFdBQVcsQ0FBQ3JCLElBQUksQ0FBQyxDQUFDO01BRWxCRixPQUFPLENBQUNDLEdBQUcsQ0FBRSw4QkFBK0IsQ0FBQztJQUMvQzs7SUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDSSxhQUFhb0gsZUFBZUEsQ0FBRWpILE1BQU0sRUFBRztNQUNyQ0osT0FBTyxDQUFDQyxHQUFHLENBQUUsb0JBQXFCLENBQUM7TUFFbkMsTUFBTUssZUFBZSxHQUFHLE1BQU1qQixXQUFXLENBQUNrQixzQkFBc0IsQ0FBQyxDQUFDO01BQ2xFLEtBQU0sTUFBTUcsYUFBYSxJQUFJSixlQUFlLEVBQUc7UUFDN0MsSUFBSyxDQUFDRixNQUFNLEtBQUksTUFBTUEsTUFBTSxDQUFFTSxhQUFjLENBQUMsR0FBRztVQUM5Q1YsT0FBTyxDQUFDQyxHQUFHLENBQUcsWUFBV1MsYUFBYyxFQUFFLENBQUM7VUFFMUMsTUFBTUEsYUFBYSxDQUFDNEcsY0FBYyxDQUFDLENBQUM7VUFDcEMsTUFBTTVHLGFBQWEsQ0FBQzZHLFNBQVMsQ0FBQyxDQUFDO1VBQy9CLElBQUk7WUFDRixNQUFNN0csYUFBYSxDQUFDL0MsS0FBSyxDQUFDLENBQUM7VUFDN0IsQ0FBQyxDQUNELE9BQU9zRCxDQUFDLEVBQUc7WUFDVGpCLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLG1CQUFrQlMsYUFBYSxDQUFDa0IsUUFBUSxDQUFDLENBQUUsSUFBR1gsQ0FBRSxFQUFFLENBQUM7VUFDbkU7UUFDRjtNQUNGO0lBQ0Y7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksYUFBYXVHLHFCQUFxQkEsQ0FBRXBILE1BQU0sRUFBRztNQUMzQ0osT0FBTyxDQUFDQyxHQUFHLENBQUUsNEJBQTZCLENBQUM7TUFFM0MsTUFBTUssZUFBZSxHQUFHLE1BQU1qQixXQUFXLENBQUNrQixzQkFBc0IsQ0FBQyxDQUFDO01BQ2xFLEtBQU0sTUFBTUcsYUFBYSxJQUFJSixlQUFlLEVBQUc7UUFDN0MsSUFBSyxDQUFDRixNQUFNLEtBQUksTUFBTUEsTUFBTSxDQUFFTSxhQUFjLENBQUMsR0FBRztVQUM5Q1YsT0FBTyxDQUFDQyxHQUFHLENBQUVTLGFBQWEsQ0FBQ2tCLFFBQVEsQ0FBQyxDQUFFLENBQUM7VUFDdkMsTUFBTTZGLGFBQWEsR0FBRyxNQUFNL0csYUFBYSxDQUFDZ0gsWUFBWSxDQUFDLENBQUM7VUFDeEQsSUFBS0QsYUFBYSxFQUFHO1lBQ25CekgsT0FBTyxDQUFDQyxHQUFHLENBQUV3SCxhQUFjLENBQUM7VUFDOUI7UUFDRjtNQUNGO0lBQ0Y7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksYUFBYUUsbUJBQW1CQSxDQUFFdkgsTUFBTSxFQUFHO01BQ3pDSixPQUFPLENBQUNDLEdBQUcsQ0FBRSwwQkFBMkIsQ0FBQztNQUV6QyxNQUFNSyxlQUFlLEdBQUcsTUFBTWpCLFdBQVcsQ0FBQ2tCLHNCQUFzQixDQUFDLENBQUM7TUFDbEUsS0FBTSxNQUFNRyxhQUFhLElBQUlKLGVBQWUsRUFBRztRQUM3QyxJQUFLLENBQUNGLE1BQU0sS0FBSSxNQUFNQSxNQUFNLENBQUVNLGFBQWMsQ0FBQyxHQUFHO1VBQzlDVixPQUFPLENBQUNDLEdBQUcsQ0FBRVMsYUFBYSxDQUFDa0IsUUFBUSxDQUFDLENBQUUsQ0FBQztVQUN2QyxNQUFNZ0csV0FBVyxHQUFHLE1BQU1sSCxhQUFhLENBQUNtSCxVQUFVLENBQUMsQ0FBQztVQUNwRCxJQUFLRCxXQUFXLEVBQUc7WUFDakI1SCxPQUFPLENBQUNDLEdBQUcsQ0FBRTJILFdBQVksQ0FBQztVQUM1QjtRQUNGO01BQ0Y7SUFDRjs7SUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNJLGFBQWFFLHFCQUFxQkEsQ0FBRXhGLE9BQU8sRUFBRWxDLE1BQU0sRUFBRztNQUNwRDtNQUNBLE1BQU1FLGVBQWUsR0FBRyxNQUFNakIsV0FBVyxDQUFDa0Isc0JBQXNCLENBQUUsTUFBTSxJQUFJLEVBQUUsS0FBTSxDQUFDO01BRXJGLEtBQU0sTUFBTUcsYUFBYSxJQUFJSixlQUFlLEVBQUc7UUFDN0MsSUFBS0YsTUFBTSxJQUFJLEVBQUcsTUFBTUEsTUFBTSxDQUFFTSxhQUFjLENBQUMsQ0FBRSxFQUFHO1VBQ2xEO1FBQ0Y7UUFFQVYsT0FBTyxDQUFDQyxHQUFHLENBQUVTLGFBQWEsQ0FBQ2tCLFFBQVEsQ0FBQyxDQUFFLENBQUM7UUFDdkMsTUFBTXRFLEVBQUUsQ0FBRW9ELGFBQWEsQ0FBQ0wsSUFBSSxFQUFFSyxhQUFhLENBQUNaLE1BQU0sRUFBRVksYUFBYSxDQUFDSyxNQUFNLEVBQUUsSUFBSSxFQUFFdUIsT0FBUSxDQUFDO1FBQ3pGLE1BQU1sRixVQUFVLENBQUVzRCxhQUFhLENBQUNMLElBQUksRUFBRUssYUFBYSxDQUFDWixNQUFNLEVBQUVZLGFBQWEsQ0FBQ0ssTUFBTSxFQUFFLElBQUksRUFBRXVCLE9BQVEsQ0FBQztNQUNuRztNQUVBdEMsT0FBTyxDQUFDQyxHQUFHLENBQUUsc0JBQXVCLENBQUM7SUFDdkM7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksYUFBYU0sc0JBQXNCQSxDQUFFd0gsVUFBVSxHQUFHQSxDQUFBLEtBQU0sSUFBSSxFQUFFQyx1QkFBdUIsR0FBRyxJQUFJLEVBQUVDLGVBQWUsR0FBRyxLQUFLLEVBQUc7TUFDdEgsTUFBTTNILGVBQWUsR0FBRyxNQUFNakIsV0FBVyxDQUFDNkksMEJBQTBCLENBQUVELGVBQWdCLENBQUM7TUFFdkYsT0FBTzNILGVBQWUsQ0FBQ0YsTUFBTSxDQUFFTSxhQUFhLElBQUk7UUFDOUMsSUFBSyxDQUFDc0gsdUJBQXVCLElBQUksQ0FBQ3RILGFBQWEsQ0FBQ2dCLFVBQVUsRUFBRztVQUMzRCxPQUFPLEtBQUs7UUFDZDtRQUNBLE9BQU9xRyxVQUFVLENBQUVySCxhQUFjLENBQUM7TUFDcEMsQ0FBRSxDQUFDO0lBQ0w7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDSSxhQUFhd0gsMEJBQTBCQSxDQUFFRCxlQUFlLEdBQUcsS0FBSyxFQUFHO01BQ2pFLE1BQU0xRyxXQUFXLEdBQUdsQyxXQUFXLENBQUNtQyxJQUFJLENBQUMsQ0FBQztNQUV0QyxJQUFJbEIsZUFBZSxHQUFHLElBQUk7TUFDMUIsSUFBS2lCLFdBQVcsQ0FBQzlCLGtCQUFrQixDQUFDMkIsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDNkcsZUFBZSxFQUFHO1FBQ25FM0gsZUFBZSxHQUFHaUIsV0FBVyxDQUFDOUIsa0JBQWtCLENBQUNxQyxHQUFHLENBQUVxRyxpQkFBaUIsSUFBSXpLLGFBQWEsQ0FBQzBLLFdBQVcsQ0FBRUQsaUJBQWtCLENBQUUsQ0FBQztNQUM3SCxDQUFDLE1BQ0k7UUFDSDtRQUNBN0gsZUFBZSxHQUFHLE1BQU01QyxhQUFhLENBQUMySyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ2pFOUcsV0FBVyxDQUFDOUIsa0JBQWtCLEdBQUdhLGVBQWU7UUFDaERpQixXQUFXLENBQUNyQixJQUFJLENBQUMsQ0FBQztNQUNwQjtNQUVBLE9BQU9JLGVBQWU7SUFDeEI7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0lnSSxTQUFTQSxDQUFBLEVBQUc7TUFDVixPQUFPO1FBQ0wvSSxPQUFPLEVBQUUsSUFBSSxDQUFDQSxPQUFPLENBQUN1QyxHQUFHLENBQUVqQyxLQUFLLElBQUlBLEtBQUssQ0FBQ3lJLFNBQVMsQ0FBQyxDQUFFLENBQUM7UUFDdkQ5SSxnQkFBZ0IsRUFBRSxJQUFJLENBQUNBLGdCQUFnQixDQUFDc0MsR0FBRyxDQUFFTCxjQUFjLElBQUlBLGNBQWMsQ0FBQzZHLFNBQVMsQ0FBQyxDQUFFLENBQUM7UUFDM0Y3SSxrQkFBa0IsRUFBRSxJQUFJLENBQUNBLGtCQUFrQixDQUFDcUMsR0FBRyxDQUFFcEIsYUFBYSxJQUFJQSxhQUFhLENBQUM0SCxTQUFTLENBQUMsQ0FBRTtNQUM5RixDQUFDO0lBQ0g7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDSSxPQUFPRixXQUFXQSxDQUFFO01BQUU3SSxPQUFPO01BQUVDLGdCQUFnQjtNQUFFQztJQUFtQixDQUFDLEVBQUc7TUFDdEU7TUFDQSxNQUFNOEksbUJBQW1CLEdBQUdoSixPQUFPLENBQUN1QyxHQUFHLENBQUVyRSxLQUFLLENBQUMySyxXQUFZLENBQUM7TUFDNUQ1SSxnQkFBZ0IsR0FBR0EsZ0JBQWdCLENBQUNzQyxHQUFHLENBQUVMLGNBQWMsSUFBSWpFLGNBQWMsQ0FBQzRLLFdBQVcsQ0FBRTNHLGNBQWMsRUFBRThHLG1CQUFvQixDQUFFLENBQUM7TUFDOUgvSSxnQkFBZ0IsQ0FBQ2dKLElBQUksQ0FBRSxDQUFFQyxDQUFDLEVBQUVDLENBQUMsS0FBTTtRQUNqQyxJQUFLRCxDQUFDLENBQUNwSSxJQUFJLEtBQUtxSSxDQUFDLENBQUNySSxJQUFJLEVBQUc7VUFDdkIsT0FBT29JLENBQUMsQ0FBQ3BJLElBQUksR0FBR3FJLENBQUMsQ0FBQ3JJLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQ2pDO1FBQ0EsSUFBS29JLENBQUMsQ0FBQzNJLE1BQU0sS0FBSzRJLENBQUMsQ0FBQzVJLE1BQU0sRUFBRztVQUMzQixPQUFPMkksQ0FBQyxDQUFDM0ksTUFBTSxHQUFHNEksQ0FBQyxDQUFDNUksTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDckM7UUFDQSxPQUFPLENBQUM7TUFDVixDQUFFLENBQUM7TUFDSCxNQUFNNkksMkJBQTJCLEdBQUdsSixrQkFBa0IsQ0FBQ3FDLEdBQUcsQ0FBRXBCLGFBQWEsSUFBSWhELGFBQWEsQ0FBQzBLLFdBQVcsQ0FBRTFILGFBQWMsQ0FBRSxDQUFDO01BRXpILE9BQU8sSUFBSXJCLFdBQVcsQ0FBRWtKLG1CQUFtQixFQUFFL0ksZ0JBQWdCLEVBQUVtSiwyQkFBNEIsQ0FBQztJQUM5Rjs7SUFFQTtBQUNKO0FBQ0E7QUFDQTtJQUNJekksSUFBSUEsQ0FBQSxFQUFHO01BQ0wsT0FBT3JCLEVBQUUsQ0FBQ2lJLGFBQWEsQ0FBRTVILGdCQUFnQixFQUFFdUgsSUFBSSxDQUFDTSxTQUFTLENBQUUsSUFBSSxDQUFDdUIsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBRSxDQUFFLENBQUM7SUFDMUY7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksT0FBTzlHLElBQUlBLENBQUEsRUFBRztNQUNaLElBQUszQyxFQUFFLENBQUM0RyxVQUFVLENBQUV2RyxnQkFBaUIsQ0FBQyxFQUFHO1FBQ3ZDLE9BQU9HLFdBQVcsQ0FBQytJLFdBQVcsQ0FBRTNCLElBQUksQ0FBQ0MsS0FBSyxDQUFFN0gsRUFBRSxDQUFDaUcsWUFBWSxDQUFFNUYsZ0JBQWdCLEVBQUUsTUFBTyxDQUFFLENBQUUsQ0FBQztNQUM3RixDQUFDLE1BQ0k7UUFDSCxPQUFPLElBQUlHLFdBQVcsQ0FBQyxDQUFDO01BQzFCO0lBQ0Y7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksT0FBT3VKLFNBQVNBLENBQUEsRUFBRztNQUNqQixPQUFPLElBQUlDLE9BQU8sQ0FBRSxDQUFFQyxPQUFPLEVBQUVDLE1BQU0sS0FBTTtRQUN6Q2hLLE9BQU8sQ0FBQ2lLLE9BQU8sQ0FBQ0MsVUFBVSxDQUFDakosT0FBTyxDQUFDa0osS0FBSyxHQUFHLE9BQU87UUFFbEQsTUFBTUMsT0FBTyxHQUFHckssSUFBSSxDQUFDc0ssS0FBSyxDQUFFO1VBQzFCQyxNQUFNLEVBQUUsZUFBZTtVQUN2QkMsU0FBUyxFQUFFLElBQUk7VUFDZkMsUUFBUSxFQUFFekssSUFBSSxDQUFDMEssZ0JBQWdCO1VBQy9CQyxlQUFlLEVBQUU7UUFDbkIsQ0FBRSxDQUFDOztRQUVIO1FBQ0EsTUFBTUMsUUFBUSxHQUFHUCxPQUFPLENBQUNRLElBQUk7UUFDN0JSLE9BQU8sQ0FBQ1EsSUFBSSxHQUFHLE9BQVFDLEdBQUcsRUFBRUMsT0FBTyxFQUFFakYsUUFBUSxFQUFFa0YsUUFBUSxLQUFNO1VBQzNESixRQUFRLENBQUVFLEdBQUcsRUFBRUMsT0FBTyxFQUFFakYsUUFBUSxFQUFFLENBQUVtRixDQUFDLEVBQUVDLE1BQU0sS0FBTTtZQUNqRCxJQUFLQSxNQUFNLFlBQVluQixPQUFPLEVBQUc7Y0FDL0JtQixNQUFNLENBQUNDLElBQUksQ0FBRUMsR0FBRyxJQUFJSixRQUFRLENBQUVDLENBQUMsRUFBRUcsR0FBSSxDQUFFLENBQUMsQ0FBQ0MsS0FBSyxDQUFFbEosQ0FBQyxJQUFJO2dCQUNuRCxJQUFLQSxDQUFDLENBQUNtSixLQUFLLEVBQUc7a0JBQ2JwSyxPQUFPLENBQUNxSyxLQUFLLENBQUcsNkJBQTRCcEosQ0FBQyxDQUFDbUosS0FBTSwwQkFBeUIzRCxJQUFJLENBQUNNLFNBQVMsQ0FBRTlGLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBRSxDQUFFLEVBQUUsQ0FBQztnQkFDL0csQ0FBQyxNQUNJLElBQUssT0FBT0EsQ0FBQyxLQUFLLFFBQVEsRUFBRztrQkFDaENqQixPQUFPLENBQUNxSyxLQUFLLENBQUcsNEJBQTJCcEosQ0FBRSxFQUFFLENBQUM7Z0JBQ2xELENBQUMsTUFDSTtrQkFDSGpCLE9BQU8sQ0FBQ3FLLEtBQUssQ0FBRywrQ0FBOEM1RCxJQUFJLENBQUNNLFNBQVMsQ0FBRTlGLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBRSxDQUFFLEVBQUUsQ0FBQztnQkFDaEc7Y0FDRixDQUFFLENBQUM7WUFDTCxDQUFDLE1BQ0k7Y0FDSDZJLFFBQVEsQ0FBRUMsQ0FBQyxFQUFFQyxNQUFPLENBQUM7WUFDdkI7VUFDRixDQUFFLENBQUM7UUFDTCxDQUFDOztRQUVEO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTlILE1BQU0sQ0FBQ29JLGNBQWMsQ0FBRUMsTUFBTSxFQUFFLFNBQVMsRUFBRTtVQUN4Q0MsR0FBR0EsQ0FBQSxFQUFHO1lBQ0osT0FBT3pMLE9BQU8sQ0FBQ2lLLE9BQU8sQ0FBQ0MsVUFBVSxDQUFDakosT0FBTyxDQUFDa0osS0FBSyxLQUFLLE1BQU07VUFDNUQsQ0FBQztVQUNEdUIsR0FBR0EsQ0FBRUMsS0FBSyxFQUFHO1lBQ1gzTCxPQUFPLENBQUNpSyxPQUFPLENBQUNDLFVBQVUsQ0FBQ2pKLE9BQU8sQ0FBQ2tKLEtBQUssR0FBR3dCLEtBQUssR0FBRyxNQUFNLEdBQUcsT0FBTztVQUNyRTtRQUNGLENBQUUsQ0FBQztRQUVIdkIsT0FBTyxDQUFDVSxPQUFPLENBQUN4SyxXQUFXLEdBQUdBLFdBQVc7UUFDekM4SixPQUFPLENBQUNVLE9BQU8sQ0FBQ2MsQ0FBQyxHQUFHdEwsV0FBVztRQUMvQjhKLE9BQU8sQ0FBQ1UsT0FBTyxDQUFDZSxDQUFDLEdBQUd2TCxXQUFXO1FBQy9COEosT0FBTyxDQUFDVSxPQUFPLENBQUNuTSxhQUFhLEdBQUdBLGFBQWE7UUFDN0N5TCxPQUFPLENBQUNVLE9BQU8sQ0FBQ2dCLEVBQUUsR0FBR25OLGFBQWE7UUFFbEN5TCxPQUFPLENBQUMyQixFQUFFLENBQUUsTUFBTSxFQUFFaEMsT0FBUSxDQUFDO01BQy9CLENBQUUsQ0FBQztJQUNMOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0l0RixTQUFTQSxDQUFFRixTQUFTLEVBQUc7TUFDckIsTUFBTXpELEtBQUssR0FBRyxJQUFJLENBQUNOLE9BQU8sQ0FBQ3dMLElBQUksQ0FBRUMsQ0FBQyxJQUFJQSxDQUFDLENBQUNqSixJQUFJLEtBQUt1QixTQUFVLENBQUM7TUFDNUQxRSxNQUFNLENBQUVpQixLQUFLLEVBQUcsdUJBQXNCeUQsU0FBVSxFQUFFLENBQUM7TUFFbkQsT0FBT3pELEtBQUs7SUFDZDs7SUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNJLE1BQU1tRSxvQkFBb0JBLENBQUUzRCxJQUFJLEVBQUVQLE1BQU0sRUFBRW1MLGNBQWMsR0FBRyxLQUFLLEVBQUUzSyxlQUFlLEdBQUcsSUFBSSxFQUFHO01BQ3pGLElBQUltQixjQUFjLEdBQUcsSUFBSSxDQUFDakMsZ0JBQWdCLENBQUN1TCxJQUFJLENBQUV0SixjQUFjLElBQUlBLGNBQWMsQ0FBQ3BCLElBQUksS0FBS0EsSUFBSSxJQUFJb0IsY0FBYyxDQUFDM0IsTUFBTSxLQUFLQSxNQUFPLENBQUM7TUFFckksSUFBSyxDQUFDMkIsY0FBYyxFQUFHO1FBQ3JCLElBQUt3SixjQUFjLEVBQUc7VUFDcEIsTUFBTSxJQUFJakssS0FBSyxDQUFHLGdEQUErQ1gsSUFBSyxJQUFHUCxNQUFPLEVBQUUsQ0FBQztRQUNyRjtRQUNBUSxlQUFlLEdBQUdBLGVBQWUsS0FBSSxNQUFNakIsV0FBVyxDQUFDa0Isc0JBQXNCLENBQUUySyxRQUFRLElBQUlBLFFBQVEsS0FBSzdLLElBQUssQ0FBQztRQUM5RyxNQUFNSyxhQUFhLEdBQUdKLGVBQWUsQ0FBQ3lLLElBQUksQ0FBRUksT0FBTyxJQUFJQSxPQUFPLENBQUM5SyxJQUFJLEtBQUtBLElBQUksSUFBSThLLE9BQU8sQ0FBQ3JMLE1BQU0sS0FBS0EsTUFBTyxDQUFDO1FBQzNHbEIsTUFBTSxDQUFFOEIsYUFBYSxFQUFHLDRDQUEyQ0wsSUFBSyxXQUFVUCxNQUFPLEVBQUUsQ0FBQztRQUU1RjJCLGNBQWMsR0FBRyxJQUFJakUsY0FBYyxDQUFFa0QsYUFBYyxDQUFDOztRQUVwRDtRQUNBLElBQUksQ0FBQ2xCLGdCQUFnQixDQUFDMEIsSUFBSSxDQUFFTyxjQUFlLENBQUM7TUFDOUM7TUFFQSxPQUFPQSxjQUFjO0lBQ3ZCOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNJdUQseUJBQXlCQSxDQUFFdkQsY0FBYyxFQUFHO01BQzFDLElBQUtBLGNBQWMsQ0FBQzJKLFFBQVEsRUFBRztRQUM3QixNQUFNdkgsS0FBSyxHQUFHLElBQUksQ0FBQ3JFLGdCQUFnQixDQUFDa0UsT0FBTyxDQUFFakMsY0FBZSxDQUFDO1FBQzdEN0MsTUFBTSxDQUFFaUYsS0FBSyxJQUFJLENBQUUsQ0FBQztRQUVwQixJQUFJLENBQUNyRSxnQkFBZ0IsQ0FBQ2lFLE1BQU0sQ0FBRUksS0FBSyxFQUFFLENBQUUsQ0FBQztNQUMxQztJQUNGO0VBQ0Y7RUFFQSxPQUFPeEUsV0FBVztBQUNwQixDQUFDLENBQUcsQ0FBQyJ9