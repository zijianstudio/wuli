// Copyright 2020-2022, University of Colorado Boulder

/**
 * Holds data related to a CT snapshot
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const copyDirectory = require('../../../perennial/js/common/copyDirectory');
const createDirectory = require('../../../perennial/js/common/createDirectory');
const deleteDirectory = require('../../../perennial/js/common/deleteDirectory');
const execute = require('../../../perennial/js/common/execute');
const getRepoList = require('../../../perennial/js/common/getRepoList');
const gitLastCommitTimestamp = require('../../../perennial/js/common/gitLastCommitTimestamp');
const gitRevParse = require('../../../perennial/js/common/gitRevParse');
const Test = require('./Test');
const fs = require('fs');
const winston = require('winston');
class Snapshot {
  /**
   * @param {string} rootDir
   * @param {function({string})} setStatus
   */
  constructor(rootDir, setStatus) {
    // @public {string}
    this.rootDir = rootDir;

    // @private {function}
    this.setStatus = setStatus;

    // @private {boolean}
    this.constructed = false;
  }

  /**
   * Creates this snapshot.
   * @public
   *
   * @param {boolean} [useRootDir] - If true, we won't create/copy, and we'll just use the files there instead
   */
  async create(useRootDir = false) {
    const timestamp = Date.now();
    const snapshotDir = `${this.rootDir}/ct-snapshots`;
    this.setStatus(`Initializing new snapshot: ${timestamp}`);

    // @public {boolean}
    this.useRootDir = useRootDir;

    // @public {number}
    this.timestamp = timestamp;

    // @public {string}
    this.name = `snapshot-${timestamp}`;

    // @public {boolean}
    this.exists = true;

    // @public {string|null} - Set to null when it's deleted fully
    this.directory = useRootDir ? this.rootDir : `${snapshotDir}/${timestamp}`;
    if (!useRootDir) {
      if (!fs.existsSync(snapshotDir)) {
        await createDirectory(snapshotDir);
      }
      await createDirectory(this.directory);
    }

    // @public {Array.<string>}
    this.repos = getRepoList('active-repos');

    // @public {Object} - maps repo {string} => sha {string}
    this.shas = {};
    for (const repo of this.repos) {
      this.shas[repo] = await gitRevParse(repo, 'master');
    }
    if (!useRootDir) {
      for (const repo of this.repos) {
        this.setStatus(`Copying snapshot files: ${repo}`);
        await copyDirectory(`${this.rootDir}/${repo}`, `${this.directory}/${repo}`, {});
      }
    }
    this.setStatus('Scanning commit timestamps');
    const lastRepoTimestamps = {};
    for (const repo of this.repos) {
      lastRepoTimestamps[repo] = await gitLastCommitTimestamp(repo);
    }
    const lastRunnableTimestamps = {};
    for (const repo of getRepoList('active-runnables')) {
      this.setStatus(`Scanning dependencies for timestamps: ${repo}`);
      try {
        const output = await execute('node', ['js/scripts/print-dependencies.js', repo], `${this.rootDir}/chipper`);
        const dependencies = output.trim().split(',');
        let timestamp = 0;
        for (const dependency of dependencies) {
          const dependencyTime = lastRepoTimestamps[dependency];
          if (dependencyTime && dependencyTime > timestamp) {
            timestamp = dependencyTime;
          }
        }
        if (timestamp) {
          lastRunnableTimestamps[repo] = timestamp;
        }
      } catch (e) {
        winston.error(`Could not read dependencies of repo ${repo}: ${e}`);
      }
    }
    this.setStatus('Loading tests from perennial');

    // @public {Array.<Test>}
    this.tests = JSON.parse(await execute('node', ['js/listContinuousTests.js'], '../perennial')).map(description => {
      const potentialRepo = description && description.test && description.test[0];
      return new Test(this, description, lastRepoTimestamps[potentialRepo] || 0, lastRunnableTimestamps[potentialRepo] || 0);
    });
    const listContinuousTestsTest = new Test(this, {
      test: ['perennial', 'listContinuousTests'],
      type: 'internal'
    }, lastRepoTimestamps.perennial || 0, lastRunnableTimestamps.perennial || 0);
    this.tests.push(listContinuousTestsTest);
    let continuousTestErrorString = '';

    // @public {Object.<nameString:string,Test>} - ephemeral, we use this.tests for saving things
    this.testMap = {};
    this.tests.forEach(test => {
      if (this.testMap[test.nameString]) {
        continuousTestErrorString += `Duplicate test specified in listContinuousTests: ${test.nameString}\n`;
      }
      this.testMap[test.nameString] = test;
    });
    if (continuousTestErrorString.length) {
      listContinuousTestsTest.recordResult(false, 0, continuousTestErrorString);
    } else {
      listContinuousTestsTest.recordResult(true, 0, null);
    }
    this.constructed = true;
  }

  /**
   * Removes the snapshot's files.
   * @public
   */
  async remove() {
    this.exists = false;
    if (!this.useRootDir) {
      await deleteDirectory(this.directory);
    }
    this.directory = null;
  }

  /**
   * Finds a given test by its names.
   * @public
   *
   * @param {Array.<string>} names
   * @returns {Test|null}
   */
  findTest(names) {
    return this.testMap[Test.namesToNameString(names)] || null;
  }

  /**
   * Returns all of the available local tests.
   * @public
   *
   * @returns {Array.<Object>}
   */
  getAvailableLocalTests() {
    return this.tests.filter(test => test.isLocallyAvailable());
  }

  /**
   * Returns all of the available browser tests.
   * @public
   *
   * @param {boolean} es5Only
   * @returns {Array.<Object>}
   */
  getAvailableBrowserTests(es5Only) {
    return this.tests.filter(test => test.isBrowserAvailable(es5Only));
  }

  /**
   * Creates a pojo-style object for saving/restoring
   * @public
   *
   * @returns {Object}
   */
  serialize() {
    if (!this.constructed) {
      return this.serializeStub();
    } else {
      return {
        rootDir: this.rootDir,
        useRootDir: this.useRootDir,
        timestamp: this.timestamp,
        constructed: this.constructed,
        name: this.name,
        exists: this.exists,
        directory: this.directory,
        repos: this.repos,
        shas: this.shas,
        tests: this.tests.map(test => test.serialize())
      };
    }
  }

  /**
   * Creates a pojo-style object for saving/restoring, but meant for tracking references so we can clean up things.
   * @public
   *
   * @returns {Object}
   */
  serializeStub() {
    return {
      rootDir: this.rootDir,
      constructed: this.constructed,
      directory: this.directory,
      useRootDir: this.useRootDir
    };
  }

  /**
   * Creates the in-memory representation from the serialized form
   * @public
   *
   * @param {Object} serialization
   * @returns {Snapshot}
   */
  static deserialize(serialization) {
    const snapshot = new Snapshot(serialization.rootDir, () => {});
    snapshot.useRootDir = serialization.useRootDir || false;
    snapshot.constructed = serialization.constructed === undefined ? true : serialization.constructed;
    snapshot.timestamp = serialization.timestamp;
    snapshot.name = serialization.name;
    snapshot.exists = serialization.exists;
    snapshot.directory = serialization.directory;
    snapshot.repos = serialization.repos;
    snapshot.shas = serialization.shas;
    snapshot.tests = serialization.tests.map(testSerialization => Test.deserialize(snapshot, testSerialization));
    snapshot.testMap = {};
    snapshot.tests.forEach(test => {
      snapshot.testMap[test.nameString] = test;
    });
    return snapshot;
  }

  /**
   * Creates the in-memory representation from the stub serialized form
   * @public
   *
   * @param {Object} serialization
   * @returns {Snapshot}
   */
  static deserializeStub(serialization) {
    const snapshot = new Snapshot(serialization.rootDir, () => {});
    snapshot.constructed = serialization.constructed === undefined ? true : serialization.constructed;
    snapshot.directory = serialization.directory;
    snapshot.useRootDir = serialization.useRootDir || false;
    return snapshot;
  }
}
module.exports = Snapshot;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3B5RGlyZWN0b3J5IiwicmVxdWlyZSIsImNyZWF0ZURpcmVjdG9yeSIsImRlbGV0ZURpcmVjdG9yeSIsImV4ZWN1dGUiLCJnZXRSZXBvTGlzdCIsImdpdExhc3RDb21taXRUaW1lc3RhbXAiLCJnaXRSZXZQYXJzZSIsIlRlc3QiLCJmcyIsIndpbnN0b24iLCJTbmFwc2hvdCIsImNvbnN0cnVjdG9yIiwicm9vdERpciIsInNldFN0YXR1cyIsImNvbnN0cnVjdGVkIiwiY3JlYXRlIiwidXNlUm9vdERpciIsInRpbWVzdGFtcCIsIkRhdGUiLCJub3ciLCJzbmFwc2hvdERpciIsIm5hbWUiLCJleGlzdHMiLCJkaXJlY3RvcnkiLCJleGlzdHNTeW5jIiwicmVwb3MiLCJzaGFzIiwicmVwbyIsImxhc3RSZXBvVGltZXN0YW1wcyIsImxhc3RSdW5uYWJsZVRpbWVzdGFtcHMiLCJvdXRwdXQiLCJkZXBlbmRlbmNpZXMiLCJ0cmltIiwic3BsaXQiLCJkZXBlbmRlbmN5IiwiZGVwZW5kZW5jeVRpbWUiLCJlIiwiZXJyb3IiLCJ0ZXN0cyIsIkpTT04iLCJwYXJzZSIsIm1hcCIsImRlc2NyaXB0aW9uIiwicG90ZW50aWFsUmVwbyIsInRlc3QiLCJsaXN0Q29udGludW91c1Rlc3RzVGVzdCIsInR5cGUiLCJwZXJlbm5pYWwiLCJwdXNoIiwiY29udGludW91c1Rlc3RFcnJvclN0cmluZyIsInRlc3RNYXAiLCJmb3JFYWNoIiwibmFtZVN0cmluZyIsImxlbmd0aCIsInJlY29yZFJlc3VsdCIsInJlbW92ZSIsImZpbmRUZXN0IiwibmFtZXMiLCJuYW1lc1RvTmFtZVN0cmluZyIsImdldEF2YWlsYWJsZUxvY2FsVGVzdHMiLCJmaWx0ZXIiLCJpc0xvY2FsbHlBdmFpbGFibGUiLCJnZXRBdmFpbGFibGVCcm93c2VyVGVzdHMiLCJlczVPbmx5IiwiaXNCcm93c2VyQXZhaWxhYmxlIiwic2VyaWFsaXplIiwic2VyaWFsaXplU3R1YiIsImRlc2VyaWFsaXplIiwic2VyaWFsaXphdGlvbiIsInNuYXBzaG90IiwidW5kZWZpbmVkIiwidGVzdFNlcmlhbGl6YXRpb24iLCJkZXNlcmlhbGl6ZVN0dWIiLCJtb2R1bGUiLCJleHBvcnRzIl0sInNvdXJjZXMiOlsiU25hcHNob3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSG9sZHMgZGF0YSByZWxhdGVkIHRvIGEgQ1Qgc25hcHNob3RcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcblxyXG5jb25zdCBjb3B5RGlyZWN0b3J5ID0gcmVxdWlyZSggJy4uLy4uLy4uL3BlcmVubmlhbC9qcy9jb21tb24vY29weURpcmVjdG9yeScgKTtcclxuY29uc3QgY3JlYXRlRGlyZWN0b3J5ID0gcmVxdWlyZSggJy4uLy4uLy4uL3BlcmVubmlhbC9qcy9jb21tb24vY3JlYXRlRGlyZWN0b3J5JyApO1xyXG5jb25zdCBkZWxldGVEaXJlY3RvcnkgPSByZXF1aXJlKCAnLi4vLi4vLi4vcGVyZW5uaWFsL2pzL2NvbW1vbi9kZWxldGVEaXJlY3RvcnknICk7XHJcbmNvbnN0IGV4ZWN1dGUgPSByZXF1aXJlKCAnLi4vLi4vLi4vcGVyZW5uaWFsL2pzL2NvbW1vbi9leGVjdXRlJyApO1xyXG5jb25zdCBnZXRSZXBvTGlzdCA9IHJlcXVpcmUoICcuLi8uLi8uLi9wZXJlbm5pYWwvanMvY29tbW9uL2dldFJlcG9MaXN0JyApO1xyXG5jb25zdCBnaXRMYXN0Q29tbWl0VGltZXN0YW1wID0gcmVxdWlyZSggJy4uLy4uLy4uL3BlcmVubmlhbC9qcy9jb21tb24vZ2l0TGFzdENvbW1pdFRpbWVzdGFtcCcgKTtcclxuY29uc3QgZ2l0UmV2UGFyc2UgPSByZXF1aXJlKCAnLi4vLi4vLi4vcGVyZW5uaWFsL2pzL2NvbW1vbi9naXRSZXZQYXJzZScgKTtcclxuY29uc3QgVGVzdCA9IHJlcXVpcmUoICcuL1Rlc3QnICk7XHJcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xyXG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XHJcblxyXG5jbGFzcyBTbmFwc2hvdCB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJvb3REaXJcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKHtzdHJpbmd9KX0gc2V0U3RhdHVzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHJvb3REaXIsIHNldFN0YXR1cyApIHtcclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ31cclxuICAgIHRoaXMucm9vdERpciA9IHJvb3REaXI7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufVxyXG4gICAgdGhpcy5zZXRTdGF0dXMgPSBzZXRTdGF0dXM7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59XHJcbiAgICB0aGlzLmNvbnN0cnVjdGVkID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoaXMgc25hcHNob3QuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBbdXNlUm9vdERpcl0gLSBJZiB0cnVlLCB3ZSB3b24ndCBjcmVhdGUvY29weSwgYW5kIHdlJ2xsIGp1c3QgdXNlIHRoZSBmaWxlcyB0aGVyZSBpbnN0ZWFkXHJcbiAgICovXHJcbiAgYXN5bmMgY3JlYXRlKCB1c2VSb290RGlyID0gZmFsc2UgKSB7XHJcblxyXG4gICAgY29uc3QgdGltZXN0YW1wID0gRGF0ZS5ub3coKTtcclxuICAgIGNvbnN0IHNuYXBzaG90RGlyID0gYCR7dGhpcy5yb290RGlyfS9jdC1zbmFwc2hvdHNgO1xyXG5cclxuICAgIHRoaXMuc2V0U3RhdHVzKCBgSW5pdGlhbGl6aW5nIG5ldyBzbmFwc2hvdDogJHt0aW1lc3RhbXB9YCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59XHJcbiAgICB0aGlzLnVzZVJvb3REaXIgPSB1c2VSb290RGlyO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMudGltZXN0YW1wID0gdGltZXN0YW1wO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ31cclxuICAgIHRoaXMubmFtZSA9IGBzbmFwc2hvdC0ke3RpbWVzdGFtcH1gO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59XHJcbiAgICB0aGlzLmV4aXN0cyA9IHRydWU7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7c3RyaW5nfG51bGx9IC0gU2V0IHRvIG51bGwgd2hlbiBpdCdzIGRlbGV0ZWQgZnVsbHlcclxuICAgIHRoaXMuZGlyZWN0b3J5ID0gdXNlUm9vdERpciA/IHRoaXMucm9vdERpciA6IGAke3NuYXBzaG90RGlyfS8ke3RpbWVzdGFtcH1gO1xyXG5cclxuICAgIGlmICggIXVzZVJvb3REaXIgKSB7XHJcbiAgICAgIGlmICggIWZzLmV4aXN0c1N5bmMoIHNuYXBzaG90RGlyICkgKSB7XHJcbiAgICAgICAgYXdhaXQgY3JlYXRlRGlyZWN0b3J5KCBzbmFwc2hvdERpciApO1xyXG4gICAgICB9XHJcbiAgICAgIGF3YWl0IGNyZWF0ZURpcmVjdG9yeSggdGhpcy5kaXJlY3RvcnkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48c3RyaW5nPn1cclxuICAgIHRoaXMucmVwb3MgPSBnZXRSZXBvTGlzdCggJ2FjdGl2ZS1yZXBvcycgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtPYmplY3R9IC0gbWFwcyByZXBvIHtzdHJpbmd9ID0+IHNoYSB7c3RyaW5nfVxyXG4gICAgdGhpcy5zaGFzID0ge307XHJcbiAgICBmb3IgKCBjb25zdCByZXBvIG9mIHRoaXMucmVwb3MgKSB7XHJcbiAgICAgIHRoaXMuc2hhc1sgcmVwbyBdID0gYXdhaXQgZ2l0UmV2UGFyc2UoIHJlcG8sICdtYXN0ZXInICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCAhdXNlUm9vdERpciApIHtcclxuICAgICAgZm9yICggY29uc3QgcmVwbyBvZiB0aGlzLnJlcG9zICkge1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdHVzKCBgQ29weWluZyBzbmFwc2hvdCBmaWxlczogJHtyZXBvfWAgKTtcclxuICAgICAgICBhd2FpdCBjb3B5RGlyZWN0b3J5KCBgJHt0aGlzLnJvb3REaXJ9LyR7cmVwb31gLCBgJHt0aGlzLmRpcmVjdG9yeX0vJHtyZXBvfWAsIHt9ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNldFN0YXR1cyggJ1NjYW5uaW5nIGNvbW1pdCB0aW1lc3RhbXBzJyApO1xyXG5cclxuICAgIGNvbnN0IGxhc3RSZXBvVGltZXN0YW1wcyA9IHt9O1xyXG4gICAgZm9yICggY29uc3QgcmVwbyBvZiB0aGlzLnJlcG9zICkge1xyXG4gICAgICBsYXN0UmVwb1RpbWVzdGFtcHNbIHJlcG8gXSA9IGF3YWl0IGdpdExhc3RDb21taXRUaW1lc3RhbXAoIHJlcG8gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsYXN0UnVubmFibGVUaW1lc3RhbXBzID0ge307XHJcbiAgICBmb3IgKCBjb25zdCByZXBvIG9mIGdldFJlcG9MaXN0KCAnYWN0aXZlLXJ1bm5hYmxlcycgKSApIHtcclxuICAgICAgdGhpcy5zZXRTdGF0dXMoIGBTY2FubmluZyBkZXBlbmRlbmNpZXMgZm9yIHRpbWVzdGFtcHM6ICR7cmVwb31gICk7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3Qgb3V0cHV0ID0gYXdhaXQgZXhlY3V0ZSggJ25vZGUnLCBbICdqcy9zY3JpcHRzL3ByaW50LWRlcGVuZGVuY2llcy5qcycsIHJlcG8gXSwgYCR7dGhpcy5yb290RGlyfS9jaGlwcGVyYCApO1xyXG4gICAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IG91dHB1dC50cmltKCkuc3BsaXQoICcsJyApO1xyXG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSAwO1xyXG4gICAgICAgIGZvciAoIGNvbnN0IGRlcGVuZGVuY3kgb2YgZGVwZW5kZW5jaWVzICkge1xyXG4gICAgICAgICAgY29uc3QgZGVwZW5kZW5jeVRpbWUgPSBsYXN0UmVwb1RpbWVzdGFtcHNbIGRlcGVuZGVuY3kgXTtcclxuICAgICAgICAgIGlmICggZGVwZW5kZW5jeVRpbWUgJiYgZGVwZW5kZW5jeVRpbWUgPiB0aW1lc3RhbXAgKSB7XHJcbiAgICAgICAgICAgIHRpbWVzdGFtcCA9IGRlcGVuZGVuY3lUaW1lO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHRpbWVzdGFtcCApIHtcclxuICAgICAgICAgIGxhc3RSdW5uYWJsZVRpbWVzdGFtcHNbIHJlcG8gXSA9IHRpbWVzdGFtcDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgICAgd2luc3Rvbi5lcnJvciggYENvdWxkIG5vdCByZWFkIGRlcGVuZGVuY2llcyBvZiByZXBvICR7cmVwb306ICR7ZX1gICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNldFN0YXR1cyggJ0xvYWRpbmcgdGVzdHMgZnJvbSBwZXJlbm5pYWwnICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPFRlc3Q+fVxyXG4gICAgdGhpcy50ZXN0cyA9IEpTT04ucGFyc2UoIGF3YWl0IGV4ZWN1dGUoICdub2RlJywgWyAnanMvbGlzdENvbnRpbnVvdXNUZXN0cy5qcycgXSwgJy4uL3BlcmVubmlhbCcgKSApLm1hcCggZGVzY3JpcHRpb24gPT4ge1xyXG4gICAgICBjb25zdCBwb3RlbnRpYWxSZXBvID0gZGVzY3JpcHRpb24gJiYgZGVzY3JpcHRpb24udGVzdCAmJiBkZXNjcmlwdGlvbi50ZXN0WyAwIF07XHJcblxyXG4gICAgICByZXR1cm4gbmV3IFRlc3QoIHRoaXMsIGRlc2NyaXB0aW9uLCBsYXN0UmVwb1RpbWVzdGFtcHNbIHBvdGVudGlhbFJlcG8gXSB8fCAwLCBsYXN0UnVubmFibGVUaW1lc3RhbXBzWyBwb3RlbnRpYWxSZXBvIF0gfHwgMCApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGxpc3RDb250aW51b3VzVGVzdHNUZXN0ID0gbmV3IFRlc3QoIHRoaXMsIHtcclxuICAgICAgdGVzdDogWyAncGVyZW5uaWFsJywgJ2xpc3RDb250aW51b3VzVGVzdHMnIF0sXHJcbiAgICAgIHR5cGU6ICdpbnRlcm5hbCdcclxuICAgIH0sIGxhc3RSZXBvVGltZXN0YW1wcy5wZXJlbm5pYWwgfHwgMCwgbGFzdFJ1bm5hYmxlVGltZXN0YW1wcy5wZXJlbm5pYWwgfHwgMCApO1xyXG4gICAgdGhpcy50ZXN0cy5wdXNoKCBsaXN0Q29udGludW91c1Rlc3RzVGVzdCApO1xyXG5cclxuICAgIGxldCBjb250aW51b3VzVGVzdEVycm9yU3RyaW5nID0gJyc7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7T2JqZWN0LjxuYW1lU3RyaW5nOnN0cmluZyxUZXN0Pn0gLSBlcGhlbWVyYWwsIHdlIHVzZSB0aGlzLnRlc3RzIGZvciBzYXZpbmcgdGhpbmdzXHJcbiAgICB0aGlzLnRlc3RNYXAgPSB7fTtcclxuICAgIHRoaXMudGVzdHMuZm9yRWFjaCggdGVzdCA9PiB7XHJcbiAgICAgIGlmICggdGhpcy50ZXN0TWFwWyB0ZXN0Lm5hbWVTdHJpbmcgXSApIHtcclxuICAgICAgICBjb250aW51b3VzVGVzdEVycm9yU3RyaW5nICs9IGBEdXBsaWNhdGUgdGVzdCBzcGVjaWZpZWQgaW4gbGlzdENvbnRpbnVvdXNUZXN0czogJHt0ZXN0Lm5hbWVTdHJpbmd9XFxuYDtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnRlc3RNYXBbIHRlc3QubmFtZVN0cmluZyBdID0gdGVzdDtcclxuICAgIH0gKTtcclxuXHJcbiAgICBpZiAoIGNvbnRpbnVvdXNUZXN0RXJyb3JTdHJpbmcubGVuZ3RoICkge1xyXG4gICAgICBsaXN0Q29udGludW91c1Rlc3RzVGVzdC5yZWNvcmRSZXN1bHQoIGZhbHNlLCAwLCBjb250aW51b3VzVGVzdEVycm9yU3RyaW5nICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgbGlzdENvbnRpbnVvdXNUZXN0c1Rlc3QucmVjb3JkUmVzdWx0KCB0cnVlLCAwLCBudWxsICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jb25zdHJ1Y3RlZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIHRoZSBzbmFwc2hvdCdzIGZpbGVzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhc3luYyByZW1vdmUoKSB7XHJcbiAgICB0aGlzLmV4aXN0cyA9IGZhbHNlO1xyXG5cclxuICAgIGlmICggIXRoaXMudXNlUm9vdERpciApIHtcclxuICAgICAgYXdhaXQgZGVsZXRlRGlyZWN0b3J5KCB0aGlzLmRpcmVjdG9yeSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZGlyZWN0b3J5ID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmRzIGEgZ2l2ZW4gdGVzdCBieSBpdHMgbmFtZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gbmFtZXNcclxuICAgKiBAcmV0dXJucyB7VGVzdHxudWxsfVxyXG4gICAqL1xyXG4gIGZpbmRUZXN0KCBuYW1lcyApIHtcclxuICAgIHJldHVybiB0aGlzLnRlc3RNYXBbIFRlc3QubmFtZXNUb05hbWVTdHJpbmcoIG5hbWVzICkgXSB8fCBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbGwgb2YgdGhlIGF2YWlsYWJsZSBsb2NhbCB0ZXN0cy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPE9iamVjdD59XHJcbiAgICovXHJcbiAgZ2V0QXZhaWxhYmxlTG9jYWxUZXN0cygpIHtcclxuICAgIHJldHVybiB0aGlzLnRlc3RzLmZpbHRlciggdGVzdCA9PiB0ZXN0LmlzTG9jYWxseUF2YWlsYWJsZSgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFsbCBvZiB0aGUgYXZhaWxhYmxlIGJyb3dzZXIgdGVzdHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBlczVPbmx5XHJcbiAgICogQHJldHVybnMge0FycmF5LjxPYmplY3Q+fVxyXG4gICAqL1xyXG4gIGdldEF2YWlsYWJsZUJyb3dzZXJUZXN0cyggZXM1T25seSApIHtcclxuICAgIHJldHVybiB0aGlzLnRlc3RzLmZpbHRlciggdGVzdCA9PiB0ZXN0LmlzQnJvd3NlckF2YWlsYWJsZSggZXM1T25seSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgcG9qby1zdHlsZSBvYmplY3QgZm9yIHNhdmluZy9yZXN0b3JpbmdcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxyXG4gICAqL1xyXG4gIHNlcmlhbGl6ZSgpIHtcclxuICAgIGlmICggIXRoaXMuY29uc3RydWN0ZWQgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnNlcmlhbGl6ZVN0dWIoKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHJvb3REaXI6IHRoaXMucm9vdERpcixcclxuICAgICAgICB1c2VSb290RGlyOiB0aGlzLnVzZVJvb3REaXIsXHJcbiAgICAgICAgdGltZXN0YW1wOiB0aGlzLnRpbWVzdGFtcCxcclxuICAgICAgICBjb25zdHJ1Y3RlZDogdGhpcy5jb25zdHJ1Y3RlZCxcclxuICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXHJcbiAgICAgICAgZXhpc3RzOiB0aGlzLmV4aXN0cyxcclxuICAgICAgICBkaXJlY3Rvcnk6IHRoaXMuZGlyZWN0b3J5LFxyXG4gICAgICAgIHJlcG9zOiB0aGlzLnJlcG9zLFxyXG4gICAgICAgIHNoYXM6IHRoaXMuc2hhcyxcclxuICAgICAgICB0ZXN0czogdGhpcy50ZXN0cy5tYXAoIHRlc3QgPT4gdGVzdC5zZXJpYWxpemUoKSApXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgcG9qby1zdHlsZSBvYmplY3QgZm9yIHNhdmluZy9yZXN0b3JpbmcsIGJ1dCBtZWFudCBmb3IgdHJhY2tpbmcgcmVmZXJlbmNlcyBzbyB3ZSBjYW4gY2xlYW4gdXAgdGhpbmdzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAgICovXHJcbiAgc2VyaWFsaXplU3R1YigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJvb3REaXI6IHRoaXMucm9vdERpcixcclxuICAgICAgY29uc3RydWN0ZWQ6IHRoaXMuY29uc3RydWN0ZWQsXHJcbiAgICAgIGRpcmVjdG9yeTogdGhpcy5kaXJlY3RvcnksXHJcbiAgICAgIHVzZVJvb3REaXI6IHRoaXMudXNlUm9vdERpclxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIGluLW1lbW9yeSByZXByZXNlbnRhdGlvbiBmcm9tIHRoZSBzZXJpYWxpemVkIGZvcm1cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gc2VyaWFsaXphdGlvblxyXG4gICAqIEByZXR1cm5zIHtTbmFwc2hvdH1cclxuICAgKi9cclxuICBzdGF0aWMgZGVzZXJpYWxpemUoIHNlcmlhbGl6YXRpb24gKSB7XHJcbiAgICBjb25zdCBzbmFwc2hvdCA9IG5ldyBTbmFwc2hvdCggc2VyaWFsaXphdGlvbi5yb290RGlyLCAoKSA9PiB7fSApO1xyXG5cclxuICAgIHNuYXBzaG90LnVzZVJvb3REaXIgPSBzZXJpYWxpemF0aW9uLnVzZVJvb3REaXIgfHwgZmFsc2U7XHJcbiAgICBzbmFwc2hvdC5jb25zdHJ1Y3RlZCA9IHNlcmlhbGl6YXRpb24uY29uc3RydWN0ZWQgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBzZXJpYWxpemF0aW9uLmNvbnN0cnVjdGVkO1xyXG4gICAgc25hcHNob3QudGltZXN0YW1wID0gc2VyaWFsaXphdGlvbi50aW1lc3RhbXA7XHJcbiAgICBzbmFwc2hvdC5uYW1lID0gc2VyaWFsaXphdGlvbi5uYW1lO1xyXG4gICAgc25hcHNob3QuZXhpc3RzID0gc2VyaWFsaXphdGlvbi5leGlzdHM7XHJcbiAgICBzbmFwc2hvdC5kaXJlY3RvcnkgPSBzZXJpYWxpemF0aW9uLmRpcmVjdG9yeTtcclxuICAgIHNuYXBzaG90LnJlcG9zID0gc2VyaWFsaXphdGlvbi5yZXBvcztcclxuICAgIHNuYXBzaG90LnNoYXMgPSBzZXJpYWxpemF0aW9uLnNoYXM7XHJcbiAgICBzbmFwc2hvdC50ZXN0cyA9IHNlcmlhbGl6YXRpb24udGVzdHMubWFwKCB0ZXN0U2VyaWFsaXphdGlvbiA9PiBUZXN0LmRlc2VyaWFsaXplKCBzbmFwc2hvdCwgdGVzdFNlcmlhbGl6YXRpb24gKSApO1xyXG4gICAgc25hcHNob3QudGVzdE1hcCA9IHt9O1xyXG4gICAgc25hcHNob3QudGVzdHMuZm9yRWFjaCggdGVzdCA9PiB7XHJcbiAgICAgIHNuYXBzaG90LnRlc3RNYXBbIHRlc3QubmFtZVN0cmluZyBdID0gdGVzdDtcclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gc25hcHNob3Q7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBpbi1tZW1vcnkgcmVwcmVzZW50YXRpb24gZnJvbSB0aGUgc3R1YiBzZXJpYWxpemVkIGZvcm1cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gc2VyaWFsaXphdGlvblxyXG4gICAqIEByZXR1cm5zIHtTbmFwc2hvdH1cclxuICAgKi9cclxuICBzdGF0aWMgZGVzZXJpYWxpemVTdHViKCBzZXJpYWxpemF0aW9uICkge1xyXG4gICAgY29uc3Qgc25hcHNob3QgPSBuZXcgU25hcHNob3QoIHNlcmlhbGl6YXRpb24ucm9vdERpciwgKCkgPT4ge30gKTtcclxuXHJcbiAgICBzbmFwc2hvdC5jb25zdHJ1Y3RlZCA9IHNlcmlhbGl6YXRpb24uY29uc3RydWN0ZWQgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBzZXJpYWxpemF0aW9uLmNvbnN0cnVjdGVkO1xyXG4gICAgc25hcHNob3QuZGlyZWN0b3J5ID0gc2VyaWFsaXphdGlvbi5kaXJlY3Rvcnk7XHJcbiAgICBzbmFwc2hvdC51c2VSb290RGlyID0gc2VyaWFsaXphdGlvbi51c2VSb290RGlyIHx8IGZhbHNlO1xyXG5cclxuICAgIHJldHVybiBzbmFwc2hvdDtcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU25hcHNob3Q7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxNQUFNQSxhQUFhLEdBQUdDLE9BQU8sQ0FBRSw0Q0FBNkMsQ0FBQztBQUM3RSxNQUFNQyxlQUFlLEdBQUdELE9BQU8sQ0FBRSw4Q0FBK0MsQ0FBQztBQUNqRixNQUFNRSxlQUFlLEdBQUdGLE9BQU8sQ0FBRSw4Q0FBK0MsQ0FBQztBQUNqRixNQUFNRyxPQUFPLEdBQUdILE9BQU8sQ0FBRSxzQ0FBdUMsQ0FBQztBQUNqRSxNQUFNSSxXQUFXLEdBQUdKLE9BQU8sQ0FBRSwwQ0FBMkMsQ0FBQztBQUN6RSxNQUFNSyxzQkFBc0IsR0FBR0wsT0FBTyxDQUFFLHFEQUFzRCxDQUFDO0FBQy9GLE1BQU1NLFdBQVcsR0FBR04sT0FBTyxDQUFFLDBDQUEyQyxDQUFDO0FBQ3pFLE1BQU1PLElBQUksR0FBR1AsT0FBTyxDQUFFLFFBQVMsQ0FBQztBQUNoQyxNQUFNUSxFQUFFLEdBQUdSLE9BQU8sQ0FBRSxJQUFLLENBQUM7QUFDMUIsTUFBTVMsT0FBTyxHQUFHVCxPQUFPLENBQUUsU0FBVSxDQUFDO0FBRXBDLE1BQU1VLFFBQVEsQ0FBQztFQUNiO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLE9BQU8sRUFBRUMsU0FBUyxFQUFH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