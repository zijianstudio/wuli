// Copyright 2020-2023, University of Colorado Boulder

/**
 * Coordinates continuous testing, and provides HTTP APIs for reports or clients that run browser tests.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const asyncFilter = require('../../../perennial/js/common/asyncFilter');
const cloneMissingRepos = require('../../../perennial/js/common/cloneMissingRepos');
const execute = require('../../../perennial/js/common/execute');
const getRepoList = require('../../../perennial/js/common/getRepoList');
const gitPull = require('../../../perennial/js/common/gitPull');
const gitRevParse = require('../../../perennial/js/common/gitRevParse');
const gruntCommand = require('../../../perennial/js/common/gruntCommand');
const isStale = require('../../../perennial/js/common/isStale');
const npmUpdate = require('../../../perennial/js/common/npmUpdate');
const outputJSAll = require('../../../perennial/js/common/outputJSAll');
const sleep = require('../../../perennial/js/common/sleep');
const Snapshot = require('./Snapshot');
const assert = require('assert');
const fs = require('fs');
const http = require('http');
const _ = require('lodash');
const path = require('path');
const url = require('url');
const winston = require('winston');

// in days, any shapshots that are older will be removed from the continuous report
const NUMBER_OF_DAYS_TO_KEEP_SNAPSHOTS = 2;

// Headers that we'll include in all server replies
const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
};

// Useful, and we can't import dot's Util here
const linear = (a1, a2, b1, b2, a3) => {
  return (b2 - b1) / (a2 - a1) * (a3 - a1) + b1;
};

// {number} - in milliseconds
const twoHours = 1000 * 60 * 60 * 2;
const twelveHours = 1000 * 60 * 60 * 12;
const NUM_SNAPSHOTS_TO_KEEP_IN_REPORT = 100;
class ContinuousServer {
  /**
   * @param {boolean} useRootDir - If true, we won't create/copy, and we'll just use the files there instead
   */
  constructor(useRootDir = false) {
    winston.info(`useRootDir: ${useRootDir}`);

    // @public {boolean}
    this.useRootDir = useRootDir;

    // @public {string} - root of your GitHub working copy, relative to the name of the directory that the
    // currently-executing script resides in
    this.rootDir = path.normalize(`${__dirname}/../../../`);

    // @public {string} - Where we'll load/save our state
    this.saveFile = `${this.rootDir}/aqua/.continuous-testing-state.json`;

    // @public {Array.<Snapshot>} - All of our snapshots
    this.snapshots = [];

    // @public {Snapshot|null} - The snapshot being created, so that if we're interrupted, we can clear the directory.
    this.pendingSnapshot = null;

    // @public {Array.<Snapshot>} - Snapshots being actively removed, but we'll want to track them in case we restart
    // before they're fully removed.
    this.trashSnapshots = [];

    // @public {string}
    this.reportJSON = '{}';

    // @public {string}
    this.status = 'Starting up';

    // @public {string}
    this.lastErrorString = '';

    // @public {number}
    this.startupTimestamp = Date.now();
    try {
      this.loadFromFile();
    } catch (e) {
      this.setError(`error loading from file: ${e}`);
    }
  }

  /**
   * Starts the HTTP server part (that will connect with any reporting features).
   * @public
   *
   * @param {number} port
   */
  startServer(port) {
    assert(typeof port === 'number', 'port should be a number');

    // Main server creation
    http.createServer((req, res) => {
      try {
        const requestInfo = url.parse(req.url, true);
        if (requestInfo.pathname === '/aquaserver/next-test') {
          // ?old=true or ?old=false, determines whether ES6 or other newer features can be run directly in the browser
          this.deliverBrowserTest(res, requestInfo.query.old === 'true');
        }
        if (requestInfo.pathname === '/aquaserver/test-result') {
          const result = JSON.parse(requestInfo.query.result);
          let message = result.message;
          const snapshot = _.find(this.snapshots, snapshot => snapshot.name === result.snapshotName);
          if (snapshot) {
            const testNames = result.test;
            const test = _.find(snapshot.tests, test => {
              return _.isEqual(testNames, test.names);
            });
            if (test) {
              if (!message || message.indexOf('errors.html#timeout') < 0) {
                if (!result.passed) {
                  message = `${result.message ? `${result.message}\n` : ''}id: ${result.id}`;
                }
                const milliseconds = Date.now() - result.timestamp;
                if (result.passed) {
                  ContinuousServer.testPass(test, milliseconds, message);
                } else {
                  ContinuousServer.testFail(test, milliseconds, message);
                }
              }
            } else {
              winston.info(`Could not find test under snapshot: ${result.snapshotName} ${result.test.toString()}`);
            }
          } else {
            winston.info(`Could not find snapshot for name: ${result.snapshotName}`);
          }
          res.writeHead(200, jsonHeaders);
          res.end(JSON.stringify({
            received: 'true'
          }));
        }
        if (requestInfo.pathname === '/aquaserver/status') {
          res.writeHead(200, jsonHeaders);
          res.end(JSON.stringify({
            status: this.status,
            startupTimestamp: this.startupTimestamp,
            lastErrorString: this.lastErrorString
          }));
        }
        if (requestInfo.pathname === '/aquaserver/report') {
          res.writeHead(200, jsonHeaders);
          res.end(this.reportJSON);
        }
      } catch (e) {
        this.setError(`server error: ${e}`);
      }
    }).listen(port);
    winston.info(`running on port ${port}`);
  }

  /**
   * Respond to an HTTP request with a response
   * @private
   *
   * @param {ServerResponse} res
   * @param {Test|null} test
   */
  static deliverTest(res, test) {
    const object = test.getObjectForBrowser();
    test.count++;
    winston.info(`[SEND] ${object.snapshotName} ${test.names.join(',')} ${object.url}`);
    res.writeHead(200, jsonHeaders);
    res.end(JSON.stringify(object));
  }

  /**
   * Respond to an HTTP request with an empty test (will trigger checking for a new test without testing anything).
   * @private
   *
   * @param {ServerResponse} res
   */
  static deliverEmptyTest(res) {
    res.writeHead(200, jsonHeaders);
    res.end(JSON.stringify({
      snapshotName: null,
      test: null,
      url: 'no-test.html'
    }));
  }

  /**
   * Sends a random browser test (from those with the lowest count) to the ServerResponse.
   * @private
   *
   * @param {ServerResponse} res
   * @param {boolean} es5Only
   */
  deliverBrowserTest(res, es5Only) {
    if (this.snapshots.length === 0) {
      ContinuousServer.deliverEmptyTest(res);
      return;
    }

    // Pick from one of the first two snapshots
    let queue = this.snapshots[0].getAvailableBrowserTests(es5Only);
    if (this.snapshots.length > 1) {
      queue = queue.concat(this.snapshots[1].getAvailableBrowserTests(es5Only));
    }
    let lowestCount = Infinity;
    let lowestTests = [];
    queue.forEach(test => {
      if (lowestCount > test.count) {
        lowestCount = test.count;
        lowestTests = [];
      }
      if (lowestCount === test.count) {
        lowestTests.push(test);
      }
    });

    // Deliver a random available test currently
    if (lowestTests.length) {
      ContinuousServer.deliverTest(res, this.weightedSampleTest(lowestTests));
    } else {
      ContinuousServer.deliverEmptyTest(res);
    }
  }

  /**
   * Sets the status message.
   * @public
   *
   * @param {string} str
   */
  setStatus(str) {
    this.status = `[${new Date().toLocaleString().replace(/^.*, /g, '').replace(' AM', 'am').replace(' PM', 'pm')}] ${str}`;
    winston.info(`status: ${this.status}`);
  }

  /**
   * Sets the last error message.
   * @public
   *
   * @param {string} message
   */
  setError(message) {
    this.lastErrorString = `${new Date().toUTCString()}: ${message}`;
    winston.error(message);
  }

  /**
   * Saves the state of snapshots to our save file.
   * @public
   */
  saveToFile() {
    // Don't save or load state if useRootDir is true
    if (this.useRootDir) {
      return;
    }
    fs.writeFileSync(this.saveFile, JSON.stringify({
      snapshots: this.snapshots.map(snapshot => snapshot.serialize()),
      pendingSnapshot: this.pendingSnapshot ? this.pendingSnapshot.serializeStub() : null,
      trashSnapshots: this.trashSnapshots.map(snapshot => snapshot.serializeStub())
    }, null, 2), 'utf-8');
  }

  /**
   * loads the state of snapshots from our save file, if it exists.
   * @public
   */
  loadFromFile() {
    // Don't save or load state if useRootDir is true
    if (this.useRootDir) {
      return;
    }
    if (fs.existsSync(this.saveFile)) {
      const serialization = JSON.parse(fs.readFileSync(this.saveFile, 'utf-8'));
      this.snapshots = serialization.snapshots.map(Snapshot.deserialize);
      this.trashSnapshots = serialization.trashSnapshots ? serialization.trashSnapshots.map(Snapshot.deserializeStub) : [];
      if (serialization.pendingSnapshot && serialization.pendingSnapshot.directory) {
        this.trashSnapshots.push(Snapshot.deserializeStub(serialization.pendingSnapshot));
      }
    }
  }

  /**
   * Records a test pass from any source.
   * @private
   *
   * @param {Test} test
   * @param {number} milliseconds
   * @param {string|undefined} message
   */
  static testPass(test, milliseconds, message) {
    winston.info(`[PASS] ${test.snapshot.name} ${test.names.join(',')} ${milliseconds}`);
    test.recordResult(true, milliseconds, message);
  }

  /**
   * Records a test failure from any source.
   * @private
   *
   * @param {Test} test
   * @param {number} milliseconds
   * @param {string|undefined} message
   */
  static testFail(test, milliseconds, message) {
    winston.info(`[FAIL] ${test.snapshot.name} ${test.names.join(',')} ${milliseconds}`);
    test.recordResult(false, milliseconds, message);
  }

  /**
   * Returns the weight used for a given test at the moment.
   * @public
   *
   * @param {Test} test
   * @returns {number}
   */
  getTestWeight(test) {
    const snapshotTests = this.snapshots.map(snapshot => snapshot.findTest(test.names)).filter(test => !!test);
    const lastTestedIndex = _.findIndex(snapshotTests, snapshotTest => snapshotTest.results.length > 0);
    const lastFailedIndex = _.findIndex(snapshotTests, snapshotTest => _.some(snapshotTest.results, testResult => !testResult.passed));
    let weight = test.priority;
    const adjustPriority = (immediatePriorityMultiplier, twoHourPriorityMultiplier, twelveHourPriorityMultiplier, elapsed) => {
      if (elapsed < twoHours) {
        weight *= linear(0, twoHours, immediatePriorityMultiplier, twoHourPriorityMultiplier, elapsed);
      } else if (elapsed < twelveHours) {
        weight *= linear(twoHours, twelveHours, twoHourPriorityMultiplier, twelveHourPriorityMultiplier, elapsed);
      } else {
        weight *= twelveHourPriorityMultiplier;
      }
    };
    if (test.repoCommitTimestamp) {
      adjustPriority(2, 1, 0.5, Date.now() - test.repoCommitTimestamp);
    }
    if (test.dependenciesCommitTimestamp) {
      adjustPriority(1.5, 1, 0.75, Date.now() - test.dependenciesCommitTimestamp);
    }
    if (lastFailedIndex >= 0) {
      if (lastFailedIndex < 3) {
        weight *= 6;
      } else {
        weight *= 3;
      }
    } else {
      if (lastTestedIndex === -1) {
        weight *= 1.5;
      } else if (lastTestedIndex === 0) {
        weight *= 0.3;
      } else if (lastTestedIndex === 1) {
        weight *= 0.7;
      }
    }
    return weight;
  }

  /**
   * Recomputes the desired weights for all recent tests.
   * @private
   */
  computeRecentTestWeights() {
    this.snapshots.slice(0, 2).forEach(snapshot => snapshot.tests.forEach(test => {
      test.weight = this.getTestWeight(test);
    }));
  }

  /**
   * Picks a test based on the tests' relative weights.
   * @public
   *
   * @param {Array.<Test>} tests
   * @returns {Test}
   */
  weightedSampleTest(tests) {
    assert(tests.length);
    const weights = tests.map(test => test.weight);
    const totalWeight = _.sum(weights);
    const cutoffWeight = totalWeight * Math.random();
    let cumulativeWeight = 0;
    for (let i = 0; i < tests.length; i++) {
      cumulativeWeight += weights[i];
      if (cumulativeWeight >= cutoffWeight) {
        return tests[i];
      }
    }

    // The fallback is the last test
    return tests[tests.length - 1];
  }

  /**
   * Deletes a snapshot marked for removal
   * @private
   *
   * @param {Snapshot} snapshot
   */
  async deleteTrashSnapshot(snapshot) {
    winston.info(`Deleting snapshot files: ${snapshot.directory}`);
    await snapshot.remove();

    // Remove it from the snapshots
    this.trashSnapshots = this.trashSnapshots.filter(snap => snap !== snapshot);
  }

  /**
   * Kicks off a loop that will create snapshots.
   * @public
   */
  async createSnapshotLoop() {
    // {boolean} Whether our last scan of SHAs found anything stale.
    let wasStale = true;

    // when loading from a file
    if (this.snapshots.length) {
      this.setStatus('Scanning checked out state to determine whether the server is stale');
      wasStale = false;
      for (const repo of Object.keys(this.snapshots[0].shas)) {
        if ((await gitRevParse(repo, 'master')) !== this.snapshots[0].shas[repo]) {
          wasStale = true;
          break;
        }
      }
      winston.info(`Initial wasStale: ${wasStale}`);
    }

    // Kick off initial old snapshot removal
    if (!this.useRootDir) {
      for (const snapshot of this.trashSnapshots) {
        // NOTE: NO await here, we're going to do that asynchronously so we don't block
        this.deleteTrashSnapshot(snapshot);
      }
    }

    // initial NPM checks, so that all repos will have node_modules that need them
    for (const repo of getRepoList('active-repos')) {
      this.setStatus(`Running initial node_modules checks: ${repo}`);
      if (fs.existsSync(`../${repo}/package.json`) && !fs.existsSync(`../${repo}/node_modules`)) {
        await npmUpdate(repo);
      }
    }
    if (this.useRootDir) {
      const snapshot = new Snapshot(this.rootDir, this.setStatus.bind(this));

      // Create a snapshot without copying files
      await snapshot.create(true);
      this.snapshots.push(snapshot);
      this.computeRecentTestWeights();
    }
    while (!this.useRootDir) {
      try {
        const staleMessage = wasStale ? 'Changes detected, waiting for stable SHAs' : 'No changes';
        const reposToCheck = getRepoList('active-repos');
        const staleRepos = await asyncFilter(reposToCheck, async repo => {
          this.setStatus(`${staleMessage}; checking ${repo}`);
          return isStale(repo);
        });
        if (staleRepos.length) {
          wasStale = true;
          this.setStatus(`Stale repos (pulling/npm): ${staleRepos.join(', ')}`);
          for (const repo of staleRepos) {
            await gitPull(repo);
          }
          const clonedRepos = await cloneMissingRepos();

          // Run the following updates on any changed repos, so we can keep our npm status good in our checked out version
          // npm prune/update first
          for (const repo of [...staleRepos, ...clonedRepos]) {
            if (fs.existsSync(`../${repo}/package.json`)) {
              await npmUpdate(repo);
            }
          }

          // Output JS for any updated repos. May use the updated node_modules from the prior loop
          this.setStatus('Running outputJSAll');
          await outputJSAll();
        } else {
          winston.info('No stale repos');
          const completedAllTests = this.snapshots.length === 0 || this.snapshots[0].getAvailableBrowserTests(false).filter(test => test.count === 0).length === 0;
          if (wasStale) {
            if (new Date().getHours() < 5 && !completedAllTests) {
              winston.info('Waiting until 5am (or completed tests) to create a snapshot');
            } else {
              wasStale = false;
              winston.info('Stable point reached');
              const snapshot = new Snapshot(this.rootDir, this.setStatus.bind(this));
              this.pendingSnapshot = snapshot;
              await snapshot.create();
              this.snapshots.unshift(snapshot);
              this.pendingSnapshot = null;
              const cutoffTimestamp = Date.now() - 1000 * 60 * 60 * 24 * NUMBER_OF_DAYS_TO_KEEP_SNAPSHOTS;
              while (this.snapshots.length > 70 || this.snapshots[this.snapshots.length - 1].timestamp < cutoffTimestamp && !this.snapshots[this.snapshots.length - 1].exists) {
                this.snapshots.pop();
              }
              this.computeRecentTestWeights();

              // Save after creating the snapshot, so that if we crash here, we won't be creating permanent garbage
              // files under ct-snapshots.
              this.saveToFile();
              this.setStatus('Removing old snapshot files');
              const numActiveSnapshots = 3;
              for (const snapshot of this.snapshots.slice(numActiveSnapshots)) {
                if (snapshot.exists && !this.trashSnapshots.includes(snapshot)) {
                  this.trashSnapshots.push(snapshot);

                  // NOTE: NO await here, we're going to do that asynchronously so we don't block
                  this.deleteTrashSnapshot(snapshot).then(() => this.saveToFile());
                }
              }
            }
          }
        }
      } catch (e) {
        this.setError(`snapshot error: ${e}`);
      }
    }
  }

  /**
   * Kicks off a loop that will try to tackle any locally-based tests available (e.g. grunt tasks, building/linting)
   * @public
   */
  async localTaskLoop() {
    while (true) {
      // eslint-disable-line no-constant-condition
      try {
        if (this.snapshots.length === 0) {
          await sleep(1000);
          continue;
        }

        // Pick from one of the first two snapshots
        let availableTests = this.snapshots[0].getAvailableLocalTests();
        if (this.snapshots.length > 1) {
          availableTests = availableTests.concat(this.snapshots[1].getAvailableLocalTests());
        }
        if (!availableTests.length) {
          await sleep(1000);
          continue;
        }
        const test = this.weightedSampleTest(availableTests);
        const snapshot = test.snapshot;
        const startTimestamp = Date.now();
        if (test.type === 'lint') {
          test.complete = true;
          try {
            const output = await execute(gruntCommand, ['lint'], `${snapshot.directory}/${test.repo}`);
            ContinuousServer.testPass(test, Date.now() - startTimestamp, output);
          } catch (e) {
            ContinuousServer.testFail(test, Date.now() - startTimestamp, `Lint failed with status code ${e.code}:\n${e.stdout}\n${e.stderr}`.trim());
          }
        } else if (test.type === 'lint-everything') {
          test.complete = true;
          try {
            const output = await execute(gruntCommand, ['lint-everything', '--hide-progress-bar'], `${snapshot.directory}/perennial`);
            ContinuousServer.testPass(test, Date.now() - startTimestamp, output);
          } catch (e) {
            ContinuousServer.testFail(test, Date.now() - startTimestamp, `Lint-everything failed with status code ${e.code}:\n${e.stdout}\n${e.stderr}`.trim());
          }
        } else if (test.type === 'build') {
          test.complete = true;
          try {
            const output = await execute(gruntCommand, [`--brands=${test.brands.join(',')}`, '--lint=false'], `${snapshot.directory}/${test.repo}`);
            ContinuousServer.testPass(test, Date.now() - startTimestamp, output);
            test.success = true;
          } catch (e) {
            ContinuousServer.testFail(test, Date.now() - startTimestamp, `Build failed with status code ${e.code}:\n${e.stdout}\n${e.stderr}`.trim());
          }
        } else {
          // uhhh, don't know what happened? Don't loop here without sleeping
          await sleep(1000);
        }
      } catch (e) {
        this.setError(`local error: ${e}`);
      }
    }
  }

  /**
   * Starts computing weights for tests.
   * @public
   */
  async computeWeightsLoop() {
    while (true) {
      // eslint-disable-line no-constant-condition
      try {
        this.computeRecentTestWeights();
      } catch (e) {
        this.setError(`weights error: ${e} ${e.stack}`);
      }
      await sleep(30 * 1000);
    }
  }

  /**
   * Regularly saves progress, so that when CT is restarted, not EVERYTHING is lost.
   * @public
   */
  async autosaveLoop() {
    while (true) {
      // eslint-disable-line no-constant-condition
      try {
        this.saveToFile();
      } catch (e) {
        this.setError(`autosave error: ${e} ${e.stack}`);
      }
      await sleep(5 * 60 * 1000); // Run this every 5 minutes
    }
  }

  /**
   * Starts generating reports from the available data.
   * @public
   */
  async generateReportLoop() {
    while (true) {
      // eslint-disable-line no-constant-condition
      try {
        winston.info('Generating Report');
        const testNameMap = {};
        this.snapshots.forEach(snapshot => snapshot.tests.forEach(test => {
          testNameMap[test.nameString] = test.names;
        }));
        const testNameStrings = _.sortBy(Object.keys(testNameMap));
        const testNames = testNameStrings.map(nameString => testNameMap[nameString]);
        const elapsedTimes = testNames.map(() => 0);
        const numElapsedTimes = testNames.map(() => 0);
        const snapshotSummaries = [];
        for (const snapshot of this.snapshots.slice(0, NUM_SNAPSHOTS_TO_KEEP_IN_REPORT)) {
          snapshotSummaries.push({
            timestamp: snapshot.timestamp,
            shas: snapshot.shas,
            tests: testNames.map((names, i) => {
              const test = snapshot.findTest(names);
              if (test) {
                const passedTestResults = test.results.filter(testResult => testResult.passed);
                const failedTestResults = test.results.filter(testResult => !testResult.passed);
                const failMessages = _.uniq(failedTestResults.map(testResult => testResult.message).filter(_.identity));
                test.results.forEach(testResult => {
                  if (testResult.milliseconds) {
                    elapsedTimes[i] += testResult.milliseconds;
                    numElapsedTimes[i]++;
                  }
                });
                const result = {
                  y: passedTestResults.length,
                  n: failedTestResults.length
                };
                if (failMessages.length) {
                  result.m = failMessages;
                }
                return result;
              } else {
                return {};
              }
            })
          });
          await sleep(0); // allow other async stuff to happen
        }

        const testAverageTimes = elapsedTimes.map((time, i) => {
          if (time === 0) {
            return time;
          } else {
            return time / numElapsedTimes[i];
          }
        });
        const testWeights = [];
        for (const names of testNames) {
          const test = this.snapshots[0] && this.snapshots[0].findTest(names);
          if (test) {
            testWeights.push(Math.ceil(test.weight * 100) / 100);
          } else {
            testWeights.push(0);
          }
          await sleep(0); // allow other async stuff to happen
        }

        const report = {
          snapshots: snapshotSummaries,
          testNames: testNames,
          testAverageTimes: testAverageTimes,
          testWeights: testWeights
        };
        await sleep(0); // allow other async stuff to happen

        this.reportJSON = JSON.stringify(report);
      } catch (e) {
        this.setError(`report error: ${e}`);
      }
      await sleep(5000);
    }
  }
}
module.exports = ContinuousServer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0ZpbHRlciIsInJlcXVpcmUiLCJjbG9uZU1pc3NpbmdSZXBvcyIsImV4ZWN1dGUiLCJnZXRSZXBvTGlzdCIsImdpdFB1bGwiLCJnaXRSZXZQYXJzZSIsImdydW50Q29tbWFuZCIsImlzU3RhbGUiLCJucG1VcGRhdGUiLCJvdXRwdXRKU0FsbCIsInNsZWVwIiwiU25hcHNob3QiLCJhc3NlcnQiLCJmcyIsImh0dHAiLCJfIiwicGF0aCIsInVybCIsIndpbnN0b24iLCJOVU1CRVJfT0ZfREFZU19UT19LRUVQX1NOQVBTSE9UUyIsImpzb25IZWFkZXJzIiwibGluZWFyIiwiYTEiLCJhMiIsImIxIiwiYjIiLCJhMyIsInR3b0hvdXJzIiwidHdlbHZlSG91cnMiLCJOVU1fU05BUFNIT1RTX1RPX0tFRVBfSU5fUkVQT1JUIiwiQ29udGludW91c1NlcnZlciIsImNvbnN0cnVjdG9yIiwidXNlUm9vdERpciIsImluZm8iLCJyb290RGlyIiwibm9ybWFsaXplIiwiX19kaXJuYW1lIiwic2F2ZUZpbGUiLCJzbmFwc2hvdHMiLCJwZW5kaW5nU25hcHNob3QiLCJ0cmFzaFNuYXBzaG90cyIsInJlcG9ydEpTT04iLCJzdGF0dXMiLCJsYXN0RXJyb3JTdHJpbmciLCJzdGFydHVwVGltZXN0YW1wIiwiRGF0ZSIsIm5vdyIsImxvYWRGcm9tRmlsZSIsImUiLCJzZXRFcnJvciIsInN0YXJ0U2VydmVyIiwicG9ydCIsImNyZWF0ZVNlcnZlciIsInJlcSIsInJlcyIsInJlcXVlc3RJbmZvIiwicGFyc2UiLCJwYXRobmFtZSIsImRlbGl2ZXJCcm93c2VyVGVzdCIsInF1ZXJ5Iiwib2xkIiwicmVzdWx0IiwiSlNPTiIsIm1lc3NhZ2UiLCJzbmFwc2hvdCIsImZpbmQiLCJuYW1lIiwic25hcHNob3ROYW1lIiwidGVzdE5hbWVzIiwidGVzdCIsInRlc3RzIiwiaXNFcXVhbCIsIm5hbWVzIiwiaW5kZXhPZiIsInBhc3NlZCIsImlkIiwibWlsbGlzZWNvbmRzIiwidGltZXN0YW1wIiwidGVzdFBhc3MiLCJ0ZXN0RmFpbCIsInRvU3RyaW5nIiwid3JpdGVIZWFkIiwiZW5kIiwic3RyaW5naWZ5IiwicmVjZWl2ZWQiLCJsaXN0ZW4iLCJkZWxpdmVyVGVzdCIsIm9iamVjdCIsImdldE9iamVjdEZvckJyb3dzZXIiLCJjb3VudCIsImpvaW4iLCJkZWxpdmVyRW1wdHlUZXN0IiwiZXM1T25seSIsImxlbmd0aCIsInF1ZXVlIiwiZ2V0QXZhaWxhYmxlQnJvd3NlclRlc3RzIiwiY29uY2F0IiwibG93ZXN0Q291bnQiLCJJbmZpbml0eSIsImxvd2VzdFRlc3RzIiwiZm9yRWFjaCIsInB1c2giLCJ3ZWlnaHRlZFNhbXBsZVRlc3QiLCJzZXRTdGF0dXMiLCJzdHIiLCJ0b0xvY2FsZVN0cmluZyIsInJlcGxhY2UiLCJ0b1VUQ1N0cmluZyIsImVycm9yIiwic2F2ZVRvRmlsZSIsIndyaXRlRmlsZVN5bmMiLCJtYXAiLCJzZXJpYWxpemUiLCJzZXJpYWxpemVTdHViIiwiZXhpc3RzU3luYyIsInNlcmlhbGl6YXRpb24iLCJyZWFkRmlsZVN5bmMiLCJkZXNlcmlhbGl6ZSIsImRlc2VyaWFsaXplU3R1YiIsImRpcmVjdG9yeSIsInJlY29yZFJlc3VsdCIsImdldFRlc3RXZWlnaHQiLCJzbmFwc2hvdFRlc3RzIiwiZmluZFRlc3QiLCJmaWx0ZXIiLCJsYXN0VGVzdGVkSW5kZXgiLCJmaW5kSW5kZXgiLCJzbmFwc2hvdFRlc3QiLCJyZXN1bHRzIiwibGFzdEZhaWxlZEluZGV4Iiwic29tZSIsInRlc3RSZXN1bHQiLCJ3ZWlnaHQiLCJwcmlvcml0eSIsImFkanVzdFByaW9yaXR5IiwiaW1tZWRpYXRlUHJpb3JpdHlNdWx0aXBsaWVyIiwidHdvSG91clByaW9yaXR5TXVsdGlwbGllciIsInR3ZWx2ZUhvdXJQcmlvcml0eU11bHRpcGxpZXIiLCJlbGFwc2VkIiwicmVwb0NvbW1pdFRpbWVzdGFtcCIsImRlcGVuZGVuY2llc0NvbW1pdFRpbWVzdGFtcCIsImNvbXB1dGVSZWNlbnRUZXN0V2VpZ2h0cyIsInNsaWNlIiwid2VpZ2h0cyIsInRvdGFsV2VpZ2h0Iiwic3VtIiwiY3V0b2ZmV2VpZ2h0IiwiTWF0aCIsInJhbmRvbSIsImN1bXVsYXRpdmVXZWlnaHQiLCJpIiwiZGVsZXRlVHJhc2hTbmFwc2hvdCIsInJlbW92ZSIsInNuYXAiLCJjcmVhdGVTbmFwc2hvdExvb3AiLCJ3YXNTdGFsZSIsInJlcG8iLCJPYmplY3QiLCJrZXlzIiwic2hhcyIsImJpbmQiLCJjcmVhdGUiLCJzdGFsZU1lc3NhZ2UiLCJyZXBvc1RvQ2hlY2siLCJzdGFsZVJlcG9zIiwiY2xvbmVkUmVwb3MiLCJjb21wbGV0ZWRBbGxUZXN0cyIsImdldEhvdXJzIiwidW5zaGlmdCIsImN1dG9mZlRpbWVzdGFtcCIsImV4aXN0cyIsInBvcCIsIm51bUFjdGl2ZVNuYXBzaG90cyIsImluY2x1ZGVzIiwidGhlbiIsImxvY2FsVGFza0xvb3AiLCJhdmFpbGFibGVUZXN0cyIsImdldEF2YWlsYWJsZUxvY2FsVGVzdHMiLCJzdGFydFRpbWVzdGFtcCIsInR5cGUiLCJjb21wbGV0ZSIsIm91dHB1dCIsImNvZGUiLCJzdGRvdXQiLCJzdGRlcnIiLCJ0cmltIiwiYnJhbmRzIiwic3VjY2VzcyIsImNvbXB1dGVXZWlnaHRzTG9vcCIsInN0YWNrIiwiYXV0b3NhdmVMb29wIiwiZ2VuZXJhdGVSZXBvcnRMb29wIiwidGVzdE5hbWVNYXAiLCJuYW1lU3RyaW5nIiwidGVzdE5hbWVTdHJpbmdzIiwic29ydEJ5IiwiZWxhcHNlZFRpbWVzIiwibnVtRWxhcHNlZFRpbWVzIiwic25hcHNob3RTdW1tYXJpZXMiLCJwYXNzZWRUZXN0UmVzdWx0cyIsImZhaWxlZFRlc3RSZXN1bHRzIiwiZmFpbE1lc3NhZ2VzIiwidW5pcSIsImlkZW50aXR5IiwieSIsIm4iLCJtIiwidGVzdEF2ZXJhZ2VUaW1lcyIsInRpbWUiLCJ0ZXN0V2VpZ2h0cyIsImNlaWwiLCJyZXBvcnQiLCJtb2R1bGUiLCJleHBvcnRzIl0sInNvdXJjZXMiOlsiQ29udGludW91c1NlcnZlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb29yZGluYXRlcyBjb250aW51b3VzIHRlc3RpbmcsIGFuZCBwcm92aWRlcyBIVFRQIEFQSXMgZm9yIHJlcG9ydHMgb3IgY2xpZW50cyB0aGF0IHJ1biBicm93c2VyIHRlc3RzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuY29uc3QgYXN5bmNGaWx0ZXIgPSByZXF1aXJlKCAnLi4vLi4vLi4vcGVyZW5uaWFsL2pzL2NvbW1vbi9hc3luY0ZpbHRlcicgKTtcclxuY29uc3QgY2xvbmVNaXNzaW5nUmVwb3MgPSByZXF1aXJlKCAnLi4vLi4vLi4vcGVyZW5uaWFsL2pzL2NvbW1vbi9jbG9uZU1pc3NpbmdSZXBvcycgKTtcclxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuLi8uLi8uLi9wZXJlbm5pYWwvanMvY29tbW9uL2V4ZWN1dGUnICk7XHJcbmNvbnN0IGdldFJlcG9MaXN0ID0gcmVxdWlyZSggJy4uLy4uLy4uL3BlcmVubmlhbC9qcy9jb21tb24vZ2V0UmVwb0xpc3QnICk7XHJcbmNvbnN0IGdpdFB1bGwgPSByZXF1aXJlKCAnLi4vLi4vLi4vcGVyZW5uaWFsL2pzL2NvbW1vbi9naXRQdWxsJyApO1xyXG5jb25zdCBnaXRSZXZQYXJzZSA9IHJlcXVpcmUoICcuLi8uLi8uLi9wZXJlbm5pYWwvanMvY29tbW9uL2dpdFJldlBhcnNlJyApO1xyXG5jb25zdCBncnVudENvbW1hbmQgPSByZXF1aXJlKCAnLi4vLi4vLi4vcGVyZW5uaWFsL2pzL2NvbW1vbi9ncnVudENvbW1hbmQnICk7XHJcbmNvbnN0IGlzU3RhbGUgPSByZXF1aXJlKCAnLi4vLi4vLi4vcGVyZW5uaWFsL2pzL2NvbW1vbi9pc1N0YWxlJyApO1xyXG5jb25zdCBucG1VcGRhdGUgPSByZXF1aXJlKCAnLi4vLi4vLi4vcGVyZW5uaWFsL2pzL2NvbW1vbi9ucG1VcGRhdGUnICk7XHJcbmNvbnN0IG91dHB1dEpTQWxsID0gcmVxdWlyZSggJy4uLy4uLy4uL3BlcmVubmlhbC9qcy9jb21tb24vb3V0cHV0SlNBbGwnICk7XHJcbmNvbnN0IHNsZWVwID0gcmVxdWlyZSggJy4uLy4uLy4uL3BlcmVubmlhbC9qcy9jb21tb24vc2xlZXAnICk7XHJcbmNvbnN0IFNuYXBzaG90ID0gcmVxdWlyZSggJy4vU25hcHNob3QnICk7XHJcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XHJcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xyXG5jb25zdCBodHRwID0gcmVxdWlyZSggJ2h0dHAnICk7XHJcbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xyXG5jb25zdCBwYXRoID0gcmVxdWlyZSggJ3BhdGgnICk7XHJcbmNvbnN0IHVybCA9IHJlcXVpcmUoICd1cmwnICk7XHJcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcclxuXHJcbi8vIGluIGRheXMsIGFueSBzaGFwc2hvdHMgdGhhdCBhcmUgb2xkZXIgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGNvbnRpbnVvdXMgcmVwb3J0XHJcbmNvbnN0IE5VTUJFUl9PRl9EQVlTX1RPX0tFRVBfU05BUFNIT1RTID0gMjtcclxuXHJcbi8vIEhlYWRlcnMgdGhhdCB3ZSdsbCBpbmNsdWRlIGluIGFsbCBzZXJ2ZXIgcmVwbGllc1xyXG5jb25zdCBqc29uSGVhZGVycyA9IHtcclxuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKidcclxufTtcclxuXHJcbi8vIFVzZWZ1bCwgYW5kIHdlIGNhbid0IGltcG9ydCBkb3QncyBVdGlsIGhlcmVcclxuY29uc3QgbGluZWFyID0gKCBhMSwgYTIsIGIxLCBiMiwgYTMgKSA9PiB7XHJcbiAgcmV0dXJuICggYjIgLSBiMSApIC8gKCBhMiAtIGExICkgKiAoIGEzIC0gYTEgKSArIGIxO1xyXG59O1xyXG5cclxuLy8ge251bWJlcn0gLSBpbiBtaWxsaXNlY29uZHNcclxuY29uc3QgdHdvSG91cnMgPSAxMDAwICogNjAgKiA2MCAqIDI7XHJcbmNvbnN0IHR3ZWx2ZUhvdXJzID0gMTAwMCAqIDYwICogNjAgKiAxMjtcclxuXHJcbmNvbnN0IE5VTV9TTkFQU0hPVFNfVE9fS0VFUF9JTl9SRVBPUlQgPSAxMDA7XHJcblxyXG5jbGFzcyBDb250aW51b3VzU2VydmVyIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVzZVJvb3REaXIgLSBJZiB0cnVlLCB3ZSB3b24ndCBjcmVhdGUvY29weSwgYW5kIHdlJ2xsIGp1c3QgdXNlIHRoZSBmaWxlcyB0aGVyZSBpbnN0ZWFkXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHVzZVJvb3REaXIgPSBmYWxzZSApIHtcclxuXHJcbiAgICB3aW5zdG9uLmluZm8oIGB1c2VSb290RGlyOiAke3VzZVJvb3REaXJ9YCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59XHJcbiAgICB0aGlzLnVzZVJvb3REaXIgPSB1c2VSb290RGlyO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ30gLSByb290IG9mIHlvdXIgR2l0SHViIHdvcmtpbmcgY29weSwgcmVsYXRpdmUgdG8gdGhlIG5hbWUgb2YgdGhlIGRpcmVjdG9yeSB0aGF0IHRoZVxyXG4gICAgLy8gY3VycmVudGx5LWV4ZWN1dGluZyBzY3JpcHQgcmVzaWRlcyBpblxyXG4gICAgdGhpcy5yb290RGlyID0gcGF0aC5ub3JtYWxpemUoIGAke19fZGlybmFtZX0vLi4vLi4vLi4vYCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ30gLSBXaGVyZSB3ZSdsbCBsb2FkL3NhdmUgb3VyIHN0YXRlXHJcbiAgICB0aGlzLnNhdmVGaWxlID0gYCR7dGhpcy5yb290RGlyfS9hcXVhLy5jb250aW51b3VzLXRlc3Rpbmctc3RhdGUuanNvbmA7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPFNuYXBzaG90Pn0gLSBBbGwgb2Ygb3VyIHNuYXBzaG90c1xyXG4gICAgdGhpcy5zbmFwc2hvdHMgPSBbXTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtTbmFwc2hvdHxudWxsfSAtIFRoZSBzbmFwc2hvdCBiZWluZyBjcmVhdGVkLCBzbyB0aGF0IGlmIHdlJ3JlIGludGVycnVwdGVkLCB3ZSBjYW4gY2xlYXIgdGhlIGRpcmVjdG9yeS5cclxuICAgIHRoaXMucGVuZGluZ1NuYXBzaG90ID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48U25hcHNob3Q+fSAtIFNuYXBzaG90cyBiZWluZyBhY3RpdmVseSByZW1vdmVkLCBidXQgd2UnbGwgd2FudCB0byB0cmFjayB0aGVtIGluIGNhc2Ugd2UgcmVzdGFydFxyXG4gICAgLy8gYmVmb3JlIHRoZXkncmUgZnVsbHkgcmVtb3ZlZC5cclxuICAgIHRoaXMudHJhc2hTbmFwc2hvdHMgPSBbXTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtzdHJpbmd9XHJcbiAgICB0aGlzLnJlcG9ydEpTT04gPSAne30nO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ31cclxuICAgIHRoaXMuc3RhdHVzID0gJ1N0YXJ0aW5nIHVwJztcclxuXHJcbiAgICAvLyBAcHVibGljIHtzdHJpbmd9XHJcbiAgICB0aGlzLmxhc3RFcnJvclN0cmluZyA9ICcnO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMuc3RhcnR1cFRpbWVzdGFtcCA9IERhdGUubm93KCk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgdGhpcy5sb2FkRnJvbUZpbGUoKTtcclxuICAgIH1cclxuICAgIGNhdGNoKCBlICkge1xyXG4gICAgICB0aGlzLnNldEVycm9yKCBgZXJyb3IgbG9hZGluZyBmcm9tIGZpbGU6ICR7ZX1gICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGFydHMgdGhlIEhUVFAgc2VydmVyIHBhcnQgKHRoYXQgd2lsbCBjb25uZWN0IHdpdGggYW55IHJlcG9ydGluZyBmZWF0dXJlcykuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBvcnRcclxuICAgKi9cclxuICBzdGFydFNlcnZlciggcG9ydCApIHtcclxuICAgIGFzc2VydCggdHlwZW9mIHBvcnQgPT09ICdudW1iZXInLCAncG9ydCBzaG91bGQgYmUgYSBudW1iZXInICk7XHJcblxyXG4gICAgLy8gTWFpbiBzZXJ2ZXIgY3JlYXRpb25cclxuICAgIGh0dHAuY3JlYXRlU2VydmVyKCAoIHJlcSwgcmVzICkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHJlcXVlc3RJbmZvID0gdXJsLnBhcnNlKCByZXEudXJsLCB0cnVlICk7XHJcblxyXG4gICAgICAgIGlmICggcmVxdWVzdEluZm8ucGF0aG5hbWUgPT09ICcvYXF1YXNlcnZlci9uZXh0LXRlc3QnICkge1xyXG4gICAgICAgICAgLy8gP29sZD10cnVlIG9yID9vbGQ9ZmFsc2UsIGRldGVybWluZXMgd2hldGhlciBFUzYgb3Igb3RoZXIgbmV3ZXIgZmVhdHVyZXMgY2FuIGJlIHJ1biBkaXJlY3RseSBpbiB0aGUgYnJvd3NlclxyXG4gICAgICAgICAgdGhpcy5kZWxpdmVyQnJvd3NlclRlc3QoIHJlcywgcmVxdWVzdEluZm8ucXVlcnkub2xkID09PSAndHJ1ZScgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCByZXF1ZXN0SW5mby5wYXRobmFtZSA9PT0gJy9hcXVhc2VydmVyL3Rlc3QtcmVzdWx0JyApIHtcclxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IEpTT04ucGFyc2UoIHJlcXVlc3RJbmZvLnF1ZXJ5LnJlc3VsdCApO1xyXG4gICAgICAgICAgbGV0IG1lc3NhZ2UgPSByZXN1bHQubWVzc2FnZTtcclxuXHJcbiAgICAgICAgICBjb25zdCBzbmFwc2hvdCA9IF8uZmluZCggdGhpcy5zbmFwc2hvdHMsIHNuYXBzaG90ID0+IHNuYXBzaG90Lm5hbWUgPT09IHJlc3VsdC5zbmFwc2hvdE5hbWUgKTtcclxuICAgICAgICAgIGlmICggc25hcHNob3QgKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlc3ROYW1lcyA9IHJlc3VsdC50ZXN0O1xyXG5cclxuICAgICAgICAgICAgY29uc3QgdGVzdCA9IF8uZmluZCggc25hcHNob3QudGVzdHMsIHRlc3QgPT4ge1xyXG4gICAgICAgICAgICAgIHJldHVybiBfLmlzRXF1YWwoIHRlc3ROYW1lcywgdGVzdC5uYW1lcyApO1xyXG4gICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICAgIGlmICggdGVzdCApIHtcclxuICAgICAgICAgICAgICBpZiAoICFtZXNzYWdlIHx8IG1lc3NhZ2UuaW5kZXhPZiggJ2Vycm9ycy5odG1sI3RpbWVvdXQnICkgPCAwICkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCAhcmVzdWx0LnBhc3NlZCApIHtcclxuICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGAke3Jlc3VsdC5tZXNzYWdlID8gKCBgJHtyZXN1bHQubWVzc2FnZX1cXG5gICkgOiAnJ31pZDogJHtyZXN1bHQuaWR9YDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IG1pbGxpc2Vjb25kcyA9IERhdGUubm93KCkgLSByZXN1bHQudGltZXN0YW1wO1xyXG4gICAgICAgICAgICAgICAgaWYgKCByZXN1bHQucGFzc2VkICkge1xyXG4gICAgICAgICAgICAgICAgICBDb250aW51b3VzU2VydmVyLnRlc3RQYXNzKCB0ZXN0LCBtaWxsaXNlY29uZHMsIG1lc3NhZ2UgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBDb250aW51b3VzU2VydmVyLnRlc3RGYWlsKCB0ZXN0LCBtaWxsaXNlY29uZHMsIG1lc3NhZ2UgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgd2luc3Rvbi5pbmZvKCBgQ291bGQgbm90IGZpbmQgdGVzdCB1bmRlciBzbmFwc2hvdDogJHtyZXN1bHQuc25hcHNob3ROYW1lfSAke3Jlc3VsdC50ZXN0LnRvU3RyaW5nKCl9YCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgd2luc3Rvbi5pbmZvKCBgQ291bGQgbm90IGZpbmQgc25hcHNob3QgZm9yIG5hbWU6ICR7cmVzdWx0LnNuYXBzaG90TmFtZX1gICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmVzLndyaXRlSGVhZCggMjAwLCBqc29uSGVhZGVycyApO1xyXG4gICAgICAgICAgcmVzLmVuZCggSlNPTi5zdHJpbmdpZnkoIHsgcmVjZWl2ZWQ6ICd0cnVlJyB9ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCByZXF1ZXN0SW5mby5wYXRobmFtZSA9PT0gJy9hcXVhc2VydmVyL3N0YXR1cycgKSB7XHJcbiAgICAgICAgICByZXMud3JpdGVIZWFkKCAyMDAsIGpzb25IZWFkZXJzICk7XHJcbiAgICAgICAgICByZXMuZW5kKCBKU09OLnN0cmluZ2lmeSgge1xyXG4gICAgICAgICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxyXG4gICAgICAgICAgICBzdGFydHVwVGltZXN0YW1wOiB0aGlzLnN0YXJ0dXBUaW1lc3RhbXAsXHJcbiAgICAgICAgICAgIGxhc3RFcnJvclN0cmluZzogdGhpcy5sYXN0RXJyb3JTdHJpbmdcclxuICAgICAgICAgIH0gKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHJlcXVlc3RJbmZvLnBhdGhuYW1lID09PSAnL2FxdWFzZXJ2ZXIvcmVwb3J0JyApIHtcclxuICAgICAgICAgIHJlcy53cml0ZUhlYWQoIDIwMCwganNvbkhlYWRlcnMgKTtcclxuICAgICAgICAgIHJlcy5lbmQoIHRoaXMucmVwb3J0SlNPTiApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBjYXRjaCggZSApIHtcclxuICAgICAgICB0aGlzLnNldEVycm9yKCBgc2VydmVyIGVycm9yOiAke2V9YCApO1xyXG4gICAgICB9XHJcbiAgICB9ICkubGlzdGVuKCBwb3J0ICk7XHJcblxyXG4gICAgd2luc3Rvbi5pbmZvKCBgcnVubmluZyBvbiBwb3J0ICR7cG9ydH1gICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNwb25kIHRvIGFuIEhUVFAgcmVxdWVzdCB3aXRoIGEgcmVzcG9uc2VcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTZXJ2ZXJSZXNwb25zZX0gcmVzXHJcbiAgICogQHBhcmFtIHtUZXN0fG51bGx9IHRlc3RcclxuICAgKi9cclxuICBzdGF0aWMgZGVsaXZlclRlc3QoIHJlcywgdGVzdCApIHtcclxuICAgIGNvbnN0IG9iamVjdCA9IHRlc3QuZ2V0T2JqZWN0Rm9yQnJvd3NlcigpO1xyXG4gICAgdGVzdC5jb3VudCsrO1xyXG5cclxuICAgIHdpbnN0b24uaW5mbyggYFtTRU5EXSAke29iamVjdC5zbmFwc2hvdE5hbWV9ICR7dGVzdC5uYW1lcy5qb2luKCAnLCcgKX0gJHtvYmplY3QudXJsfWAgKTtcclxuICAgIHJlcy53cml0ZUhlYWQoIDIwMCwganNvbkhlYWRlcnMgKTtcclxuICAgIHJlcy5lbmQoIEpTT04uc3RyaW5naWZ5KCBvYmplY3QgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzcG9uZCB0byBhbiBIVFRQIHJlcXVlc3Qgd2l0aCBhbiBlbXB0eSB0ZXN0ICh3aWxsIHRyaWdnZXIgY2hlY2tpbmcgZm9yIGEgbmV3IHRlc3Qgd2l0aG91dCB0ZXN0aW5nIGFueXRoaW5nKS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTZXJ2ZXJSZXNwb25zZX0gcmVzXHJcbiAgICovXHJcbiAgc3RhdGljIGRlbGl2ZXJFbXB0eVRlc3QoIHJlcyApIHtcclxuICAgIHJlcy53cml0ZUhlYWQoIDIwMCwganNvbkhlYWRlcnMgKTtcclxuICAgIHJlcy5lbmQoIEpTT04uc3RyaW5naWZ5KCB7XHJcbiAgICAgIHNuYXBzaG90TmFtZTogbnVsbCxcclxuICAgICAgdGVzdDogbnVsbCxcclxuICAgICAgdXJsOiAnbm8tdGVzdC5odG1sJ1xyXG4gICAgfSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZW5kcyBhIHJhbmRvbSBicm93c2VyIHRlc3QgKGZyb20gdGhvc2Ugd2l0aCB0aGUgbG93ZXN0IGNvdW50KSB0byB0aGUgU2VydmVyUmVzcG9uc2UuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2VydmVyUmVzcG9uc2V9IHJlc1xyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZXM1T25seVxyXG4gICAqL1xyXG4gIGRlbGl2ZXJCcm93c2VyVGVzdCggcmVzLCBlczVPbmx5ICkge1xyXG4gICAgaWYgKCB0aGlzLnNuYXBzaG90cy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgIENvbnRpbnVvdXNTZXJ2ZXIuZGVsaXZlckVtcHR5VGVzdCggcmVzICk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQaWNrIGZyb20gb25lIG9mIHRoZSBmaXJzdCB0d28gc25hcHNob3RzXHJcbiAgICBsZXQgcXVldWUgPSB0aGlzLnNuYXBzaG90c1sgMCBdLmdldEF2YWlsYWJsZUJyb3dzZXJUZXN0cyggZXM1T25seSApO1xyXG4gICAgaWYgKCB0aGlzLnNuYXBzaG90cy5sZW5ndGggPiAxICkge1xyXG4gICAgICBxdWV1ZSA9IHF1ZXVlLmNvbmNhdCggdGhpcy5zbmFwc2hvdHNbIDEgXS5nZXRBdmFpbGFibGVCcm93c2VyVGVzdHMoIGVzNU9ubHkgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBsb3dlc3RDb3VudCA9IEluZmluaXR5O1xyXG4gICAgbGV0IGxvd2VzdFRlc3RzID0gW107XHJcbiAgICBxdWV1ZS5mb3JFYWNoKCB0ZXN0ID0+IHtcclxuICAgICAgaWYgKCBsb3dlc3RDb3VudCA+IHRlc3QuY291bnQgKSB7XHJcbiAgICAgICAgbG93ZXN0Q291bnQgPSB0ZXN0LmNvdW50O1xyXG4gICAgICAgIGxvd2VzdFRlc3RzID0gW107XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBsb3dlc3RDb3VudCA9PT0gdGVzdC5jb3VudCApIHtcclxuICAgICAgICBsb3dlc3RUZXN0cy5wdXNoKCB0ZXN0ICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBEZWxpdmVyIGEgcmFuZG9tIGF2YWlsYWJsZSB0ZXN0IGN1cnJlbnRseVxyXG4gICAgaWYgKCBsb3dlc3RUZXN0cy5sZW5ndGggKSB7XHJcbiAgICAgIENvbnRpbnVvdXNTZXJ2ZXIuZGVsaXZlclRlc3QoIHJlcywgdGhpcy53ZWlnaHRlZFNhbXBsZVRlc3QoIGxvd2VzdFRlc3RzICkgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBDb250aW51b3VzU2VydmVyLmRlbGl2ZXJFbXB0eVRlc3QoIHJlcyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgc3RhdHVzIG1lc3NhZ2UuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0clxyXG4gICAqL1xyXG4gIHNldFN0YXR1cyggc3RyICkge1xyXG4gICAgdGhpcy5zdGF0dXMgPSBgWyR7bmV3IERhdGUoKS50b0xvY2FsZVN0cmluZygpLnJlcGxhY2UoIC9eLiosIC9nLCAnJyApLnJlcGxhY2UoICcgQU0nLCAnYW0nICkucmVwbGFjZSggJyBQTScsICdwbScgKX1dICR7c3RyfWA7XHJcbiAgICB3aW5zdG9uLmluZm8oIGBzdGF0dXM6ICR7dGhpcy5zdGF0dXN9YCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgbGFzdCBlcnJvciBtZXNzYWdlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXHJcbiAgICovXHJcbiAgc2V0RXJyb3IoIG1lc3NhZ2UgKSB7XHJcbiAgICB0aGlzLmxhc3RFcnJvclN0cmluZyA9IGAke25ldyBEYXRlKCkudG9VVENTdHJpbmcoKX06ICR7bWVzc2FnZX1gO1xyXG5cclxuICAgIHdpbnN0b24uZXJyb3IoIG1lc3NhZ2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNhdmVzIHRoZSBzdGF0ZSBvZiBzbmFwc2hvdHMgdG8gb3VyIHNhdmUgZmlsZS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2F2ZVRvRmlsZSgpIHtcclxuICAgIC8vIERvbid0IHNhdmUgb3IgbG9hZCBzdGF0ZSBpZiB1c2VSb290RGlyIGlzIHRydWVcclxuICAgIGlmICggdGhpcy51c2VSb290RGlyICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZnMud3JpdGVGaWxlU3luYyggdGhpcy5zYXZlRmlsZSwgSlNPTi5zdHJpbmdpZnkoIHtcclxuICAgICAgc25hcHNob3RzOiB0aGlzLnNuYXBzaG90cy5tYXAoIHNuYXBzaG90ID0+IHNuYXBzaG90LnNlcmlhbGl6ZSgpICksXHJcbiAgICAgIHBlbmRpbmdTbmFwc2hvdDogdGhpcy5wZW5kaW5nU25hcHNob3QgPyB0aGlzLnBlbmRpbmdTbmFwc2hvdC5zZXJpYWxpemVTdHViKCkgOiBudWxsLFxyXG4gICAgICB0cmFzaFNuYXBzaG90czogdGhpcy50cmFzaFNuYXBzaG90cy5tYXAoIHNuYXBzaG90ID0+IHNuYXBzaG90LnNlcmlhbGl6ZVN0dWIoKSApXHJcbiAgICB9LCBudWxsLCAyICksICd1dGYtOCcgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGxvYWRzIHRoZSBzdGF0ZSBvZiBzbmFwc2hvdHMgZnJvbSBvdXIgc2F2ZSBmaWxlLCBpZiBpdCBleGlzdHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGxvYWRGcm9tRmlsZSgpIHtcclxuICAgIC8vIERvbid0IHNhdmUgb3IgbG9hZCBzdGF0ZSBpZiB1c2VSb290RGlyIGlzIHRydWVcclxuICAgIGlmICggdGhpcy51c2VSb290RGlyICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBmcy5leGlzdHNTeW5jKCB0aGlzLnNhdmVGaWxlICkgKSB7XHJcbiAgICAgIGNvbnN0IHNlcmlhbGl6YXRpb24gPSBKU09OLnBhcnNlKCBmcy5yZWFkRmlsZVN5bmMoIHRoaXMuc2F2ZUZpbGUsICd1dGYtOCcgKSApO1xyXG4gICAgICB0aGlzLnNuYXBzaG90cyA9IHNlcmlhbGl6YXRpb24uc25hcHNob3RzLm1hcCggU25hcHNob3QuZGVzZXJpYWxpemUgKTtcclxuICAgICAgdGhpcy50cmFzaFNuYXBzaG90cyA9IHNlcmlhbGl6YXRpb24udHJhc2hTbmFwc2hvdHMgPyBzZXJpYWxpemF0aW9uLnRyYXNoU25hcHNob3RzLm1hcCggU25hcHNob3QuZGVzZXJpYWxpemVTdHViICkgOiBbXTtcclxuICAgICAgaWYgKCBzZXJpYWxpemF0aW9uLnBlbmRpbmdTbmFwc2hvdCAmJiBzZXJpYWxpemF0aW9uLnBlbmRpbmdTbmFwc2hvdC5kaXJlY3RvcnkgKSB7XHJcbiAgICAgICAgdGhpcy50cmFzaFNuYXBzaG90cy5wdXNoKCBTbmFwc2hvdC5kZXNlcmlhbGl6ZVN0dWIoIHNlcmlhbGl6YXRpb24ucGVuZGluZ1NuYXBzaG90ICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVjb3JkcyBhIHRlc3QgcGFzcyBmcm9tIGFueSBzb3VyY2UuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VGVzdH0gdGVzdFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaWxsaXNlY29uZHNcclxuICAgKiBAcGFyYW0ge3N0cmluZ3x1bmRlZmluZWR9IG1lc3NhZ2VcclxuICAgKi9cclxuICBzdGF0aWMgdGVzdFBhc3MoIHRlc3QsIG1pbGxpc2Vjb25kcywgbWVzc2FnZSApIHtcclxuICAgIHdpbnN0b24uaW5mbyggYFtQQVNTXSAke3Rlc3Quc25hcHNob3QubmFtZX0gJHt0ZXN0Lm5hbWVzLmpvaW4oICcsJyApfSAke21pbGxpc2Vjb25kc31gICk7XHJcbiAgICB0ZXN0LnJlY29yZFJlc3VsdCggdHJ1ZSwgbWlsbGlzZWNvbmRzLCBtZXNzYWdlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWNvcmRzIGEgdGVzdCBmYWlsdXJlIGZyb20gYW55IHNvdXJjZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUZXN0fSB0ZXN0XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1pbGxpc2Vjb25kc1xyXG4gICAqIEBwYXJhbSB7c3RyaW5nfHVuZGVmaW5lZH0gbWVzc2FnZVxyXG4gICAqL1xyXG4gIHN0YXRpYyB0ZXN0RmFpbCggdGVzdCwgbWlsbGlzZWNvbmRzLCBtZXNzYWdlICkge1xyXG4gICAgd2luc3Rvbi5pbmZvKCBgW0ZBSUxdICR7dGVzdC5zbmFwc2hvdC5uYW1lfSAke3Rlc3QubmFtZXMuam9pbiggJywnICl9ICR7bWlsbGlzZWNvbmRzfWAgKTtcclxuICAgIHRlc3QucmVjb3JkUmVzdWx0KCBmYWxzZSwgbWlsbGlzZWNvbmRzLCBtZXNzYWdlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB3ZWlnaHQgdXNlZCBmb3IgYSBnaXZlbiB0ZXN0IGF0IHRoZSBtb21lbnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUZXN0fSB0ZXN0XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRUZXN0V2VpZ2h0KCB0ZXN0ICkge1xyXG4gICAgY29uc3Qgc25hcHNob3RUZXN0cyA9IHRoaXMuc25hcHNob3RzLm1hcCggc25hcHNob3QgPT4gc25hcHNob3QuZmluZFRlc3QoIHRlc3QubmFtZXMgKSApLmZpbHRlciggdGVzdCA9PiAhIXRlc3QgKTtcclxuXHJcbiAgICBjb25zdCBsYXN0VGVzdGVkSW5kZXggPSBfLmZpbmRJbmRleCggc25hcHNob3RUZXN0cywgc25hcHNob3RUZXN0ID0+IHNuYXBzaG90VGVzdC5yZXN1bHRzLmxlbmd0aCA+IDAgKTtcclxuICAgIGNvbnN0IGxhc3RGYWlsZWRJbmRleCA9IF8uZmluZEluZGV4KCBzbmFwc2hvdFRlc3RzLCBzbmFwc2hvdFRlc3QgPT4gXy5zb21lKCBzbmFwc2hvdFRlc3QucmVzdWx0cywgdGVzdFJlc3VsdCA9PiAhdGVzdFJlc3VsdC5wYXNzZWQgKSApO1xyXG5cclxuICAgIGxldCB3ZWlnaHQgPSB0ZXN0LnByaW9yaXR5O1xyXG5cclxuICAgIGNvbnN0IGFkanVzdFByaW9yaXR5ID0gKCBpbW1lZGlhdGVQcmlvcml0eU11bHRpcGxpZXIsIHR3b0hvdXJQcmlvcml0eU11bHRpcGxpZXIsIHR3ZWx2ZUhvdXJQcmlvcml0eU11bHRpcGxpZXIsIGVsYXBzZWQgKSA9PiB7XHJcbiAgICAgIGlmICggZWxhcHNlZCA8IHR3b0hvdXJzICkge1xyXG4gICAgICAgIHdlaWdodCAqPSBsaW5lYXIoIDAsIHR3b0hvdXJzLCBpbW1lZGlhdGVQcmlvcml0eU11bHRpcGxpZXIsIHR3b0hvdXJQcmlvcml0eU11bHRpcGxpZXIsIGVsYXBzZWQgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggZWxhcHNlZCA8IHR3ZWx2ZUhvdXJzICkge1xyXG4gICAgICAgIHdlaWdodCAqPSBsaW5lYXIoIHR3b0hvdXJzLCB0d2VsdmVIb3VycywgdHdvSG91clByaW9yaXR5TXVsdGlwbGllciwgdHdlbHZlSG91clByaW9yaXR5TXVsdGlwbGllciwgZWxhcHNlZCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHdlaWdodCAqPSB0d2VsdmVIb3VyUHJpb3JpdHlNdWx0aXBsaWVyO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGlmICggdGVzdC5yZXBvQ29tbWl0VGltZXN0YW1wICkge1xyXG4gICAgICBhZGp1c3RQcmlvcml0eSggMiwgMSwgMC41LCBEYXRlLm5vdygpIC0gdGVzdC5yZXBvQ29tbWl0VGltZXN0YW1wICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIHRlc3QuZGVwZW5kZW5jaWVzQ29tbWl0VGltZXN0YW1wICkge1xyXG4gICAgICBhZGp1c3RQcmlvcml0eSggMS41LCAxLCAwLjc1LCBEYXRlLm5vdygpIC0gdGVzdC5kZXBlbmRlbmNpZXNDb21taXRUaW1lc3RhbXAgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGxhc3RGYWlsZWRJbmRleCA+PSAwICkge1xyXG4gICAgICBpZiAoIGxhc3RGYWlsZWRJbmRleCA8IDMgKSB7XHJcbiAgICAgICAgd2VpZ2h0ICo9IDY7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgd2VpZ2h0ICo9IDM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBpZiAoIGxhc3RUZXN0ZWRJbmRleCA9PT0gLTEgKSB7XHJcbiAgICAgICAgd2VpZ2h0ICo9IDEuNTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggbGFzdFRlc3RlZEluZGV4ID09PSAwICkge1xyXG4gICAgICAgIHdlaWdodCAqPSAwLjM7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGxhc3RUZXN0ZWRJbmRleCA9PT0gMSApIHtcclxuICAgICAgICB3ZWlnaHQgKj0gMC43O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHdlaWdodDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlY29tcHV0ZXMgdGhlIGRlc2lyZWQgd2VpZ2h0cyBmb3IgYWxsIHJlY2VudCB0ZXN0cy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGNvbXB1dGVSZWNlbnRUZXN0V2VpZ2h0cygpIHtcclxuICAgIHRoaXMuc25hcHNob3RzLnNsaWNlKCAwLCAyICkuZm9yRWFjaCggc25hcHNob3QgPT4gc25hcHNob3QudGVzdHMuZm9yRWFjaCggdGVzdCA9PiB7XHJcbiAgICAgIHRlc3Qud2VpZ2h0ID0gdGhpcy5nZXRUZXN0V2VpZ2h0KCB0ZXN0ICk7XHJcbiAgICB9ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBpY2tzIGEgdGVzdCBiYXNlZCBvbiB0aGUgdGVzdHMnIHJlbGF0aXZlIHdlaWdodHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48VGVzdD59IHRlc3RzXHJcbiAgICogQHJldHVybnMge1Rlc3R9XHJcbiAgICovXHJcbiAgd2VpZ2h0ZWRTYW1wbGVUZXN0KCB0ZXN0cyApIHtcclxuICAgIGFzc2VydCggdGVzdHMubGVuZ3RoICk7XHJcblxyXG4gICAgY29uc3Qgd2VpZ2h0cyA9IHRlc3RzLm1hcCggdGVzdCA9PiB0ZXN0LndlaWdodCApO1xyXG4gICAgY29uc3QgdG90YWxXZWlnaHQgPSBfLnN1bSggd2VpZ2h0cyApO1xyXG5cclxuICAgIGNvbnN0IGN1dG9mZldlaWdodCA9IHRvdGFsV2VpZ2h0ICogTWF0aC5yYW5kb20oKTtcclxuICAgIGxldCBjdW11bGF0aXZlV2VpZ2h0ID0gMDtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0ZXN0cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY3VtdWxhdGl2ZVdlaWdodCArPSB3ZWlnaHRzWyBpIF07XHJcbiAgICAgIGlmICggY3VtdWxhdGl2ZVdlaWdodCA+PSBjdXRvZmZXZWlnaHQgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRlc3RzWyBpIF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGUgZmFsbGJhY2sgaXMgdGhlIGxhc3QgdGVzdFxyXG4gICAgcmV0dXJuIHRlc3RzWyB0ZXN0cy5sZW5ndGggLSAxIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZWxldGVzIGEgc25hcHNob3QgbWFya2VkIGZvciByZW1vdmFsXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U25hcHNob3R9IHNuYXBzaG90XHJcbiAgICovXHJcbiAgYXN5bmMgZGVsZXRlVHJhc2hTbmFwc2hvdCggc25hcHNob3QgKSB7XHJcbiAgICB3aW5zdG9uLmluZm8oIGBEZWxldGluZyBzbmFwc2hvdCBmaWxlczogJHtzbmFwc2hvdC5kaXJlY3Rvcnl9YCApO1xyXG5cclxuICAgIGF3YWl0IHNuYXBzaG90LnJlbW92ZSgpO1xyXG5cclxuICAgIC8vIFJlbW92ZSBpdCBmcm9tIHRoZSBzbmFwc2hvdHNcclxuICAgIHRoaXMudHJhc2hTbmFwc2hvdHMgPSB0aGlzLnRyYXNoU25hcHNob3RzLmZpbHRlciggc25hcCA9PiBzbmFwICE9PSBzbmFwc2hvdCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogS2lja3Mgb2ZmIGEgbG9vcCB0aGF0IHdpbGwgY3JlYXRlIHNuYXBzaG90cy5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYXN5bmMgY3JlYXRlU25hcHNob3RMb29wKCkge1xyXG4gICAgLy8ge2Jvb2xlYW59IFdoZXRoZXIgb3VyIGxhc3Qgc2NhbiBvZiBTSEFzIGZvdW5kIGFueXRoaW5nIHN0YWxlLlxyXG4gICAgbGV0IHdhc1N0YWxlID0gdHJ1ZTtcclxuXHJcbiAgICAvLyB3aGVuIGxvYWRpbmcgZnJvbSBhIGZpbGVcclxuICAgIGlmICggdGhpcy5zbmFwc2hvdHMubGVuZ3RoICkge1xyXG4gICAgICB0aGlzLnNldFN0YXR1cyggJ1NjYW5uaW5nIGNoZWNrZWQgb3V0IHN0YXRlIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBzZXJ2ZXIgaXMgc3RhbGUnICk7XHJcblxyXG4gICAgICB3YXNTdGFsZSA9IGZhbHNlO1xyXG4gICAgICBmb3IgKCBjb25zdCByZXBvIG9mIE9iamVjdC5rZXlzKCB0aGlzLnNuYXBzaG90c1sgMCBdLnNoYXMgKSApIHtcclxuICAgICAgICBpZiAoIGF3YWl0IGdpdFJldlBhcnNlKCByZXBvLCAnbWFzdGVyJyApICE9PSB0aGlzLnNuYXBzaG90c1sgMCBdLnNoYXNbIHJlcG8gXSApIHtcclxuICAgICAgICAgIHdhc1N0YWxlID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgd2luc3Rvbi5pbmZvKCBgSW5pdGlhbCB3YXNTdGFsZTogJHt3YXNTdGFsZX1gICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gS2ljayBvZmYgaW5pdGlhbCBvbGQgc25hcHNob3QgcmVtb3ZhbFxyXG4gICAgaWYgKCAhdGhpcy51c2VSb290RGlyICkge1xyXG4gICAgICBmb3IgKCBjb25zdCBzbmFwc2hvdCBvZiB0aGlzLnRyYXNoU25hcHNob3RzICkge1xyXG4gICAgICAgIC8vIE5PVEU6IE5PIGF3YWl0IGhlcmUsIHdlJ3JlIGdvaW5nIHRvIGRvIHRoYXQgYXN5bmNocm9ub3VzbHkgc28gd2UgZG9uJ3QgYmxvY2tcclxuICAgICAgICB0aGlzLmRlbGV0ZVRyYXNoU25hcHNob3QoIHNuYXBzaG90ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpbml0aWFsIE5QTSBjaGVja3MsIHNvIHRoYXQgYWxsIHJlcG9zIHdpbGwgaGF2ZSBub2RlX21vZHVsZXMgdGhhdCBuZWVkIHRoZW1cclxuICAgIGZvciAoIGNvbnN0IHJlcG8gb2YgZ2V0UmVwb0xpc3QoICdhY3RpdmUtcmVwb3MnICkgKSB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdHVzKCBgUnVubmluZyBpbml0aWFsIG5vZGVfbW9kdWxlcyBjaGVja3M6ICR7cmVwb31gICk7XHJcbiAgICAgIGlmICggZnMuZXhpc3RzU3luYyggYC4uLyR7cmVwb30vcGFja2FnZS5qc29uYCApICYmICFmcy5leGlzdHNTeW5jKCBgLi4vJHtyZXBvfS9ub2RlX21vZHVsZXNgICkgKSB7XHJcbiAgICAgICAgYXdhaXQgbnBtVXBkYXRlKCByZXBvICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMudXNlUm9vdERpciApIHtcclxuICAgICAgY29uc3Qgc25hcHNob3QgPSBuZXcgU25hcHNob3QoIHRoaXMucm9vdERpciwgdGhpcy5zZXRTdGF0dXMuYmluZCggdGhpcyApICk7XHJcblxyXG4gICAgICAvLyBDcmVhdGUgYSBzbmFwc2hvdCB3aXRob3V0IGNvcHlpbmcgZmlsZXNcclxuICAgICAgYXdhaXQgc25hcHNob3QuY3JlYXRlKCB0cnVlICk7XHJcblxyXG4gICAgICB0aGlzLnNuYXBzaG90cy5wdXNoKCBzbmFwc2hvdCApO1xyXG5cclxuICAgICAgdGhpcy5jb21wdXRlUmVjZW50VGVzdFdlaWdodHMoKTtcclxuICAgIH1cclxuXHJcbiAgICB3aGlsZSAoICF0aGlzLnVzZVJvb3REaXIgKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3Qgc3RhbGVNZXNzYWdlID0gd2FzU3RhbGUgPyAnQ2hhbmdlcyBkZXRlY3RlZCwgd2FpdGluZyBmb3Igc3RhYmxlIFNIQXMnIDogJ05vIGNoYW5nZXMnO1xyXG5cclxuICAgICAgICBjb25zdCByZXBvc1RvQ2hlY2sgPSBnZXRSZXBvTGlzdCggJ2FjdGl2ZS1yZXBvcycgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc3RhbGVSZXBvcyA9IGF3YWl0IGFzeW5jRmlsdGVyKCByZXBvc1RvQ2hlY2ssIGFzeW5jIHJlcG8gPT4ge1xyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0dXMoIGAke3N0YWxlTWVzc2FnZX07IGNoZWNraW5nICR7cmVwb31gICk7XHJcbiAgICAgICAgICByZXR1cm4gaXNTdGFsZSggcmVwbyApO1xyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgaWYgKCBzdGFsZVJlcG9zLmxlbmd0aCApIHtcclxuICAgICAgICAgIHdhc1N0YWxlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICB0aGlzLnNldFN0YXR1cyggYFN0YWxlIHJlcG9zIChwdWxsaW5nL25wbSk6ICR7c3RhbGVSZXBvcy5qb2luKCAnLCAnICl9YCApO1xyXG5cclxuICAgICAgICAgIGZvciAoIGNvbnN0IHJlcG8gb2Ygc3RhbGVSZXBvcyApIHtcclxuICAgICAgICAgICAgYXdhaXQgZ2l0UHVsbCggcmVwbyApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3QgY2xvbmVkUmVwb3MgPSBhd2FpdCBjbG9uZU1pc3NpbmdSZXBvcygpO1xyXG5cclxuICAgICAgICAgIC8vIFJ1biB0aGUgZm9sbG93aW5nIHVwZGF0ZXMgb24gYW55IGNoYW5nZWQgcmVwb3MsIHNvIHdlIGNhbiBrZWVwIG91ciBucG0gc3RhdHVzIGdvb2QgaW4gb3VyIGNoZWNrZWQgb3V0IHZlcnNpb25cclxuICAgICAgICAgIC8vIG5wbSBwcnVuZS91cGRhdGUgZmlyc3RcclxuICAgICAgICAgIGZvciAoIGNvbnN0IHJlcG8gb2YgWyAuLi5zdGFsZVJlcG9zLCAuLi5jbG9uZWRSZXBvcyBdICkge1xyXG4gICAgICAgICAgICBpZiAoIGZzLmV4aXN0c1N5bmMoIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAgKSApIHtcclxuICAgICAgICAgICAgICBhd2FpdCBucG1VcGRhdGUoIHJlcG8gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIE91dHB1dCBKUyBmb3IgYW55IHVwZGF0ZWQgcmVwb3MuIE1heSB1c2UgdGhlIHVwZGF0ZWQgbm9kZV9tb2R1bGVzIGZyb20gdGhlIHByaW9yIGxvb3BcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdHVzKCAnUnVubmluZyBvdXRwdXRKU0FsbCcgKTtcclxuICAgICAgICAgIGF3YWl0IG91dHB1dEpTQWxsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgd2luc3Rvbi5pbmZvKCAnTm8gc3RhbGUgcmVwb3MnICk7XHJcblxyXG4gICAgICAgICAgY29uc3QgY29tcGxldGVkQWxsVGVzdHMgPSB0aGlzLnNuYXBzaG90cy5sZW5ndGggPT09IDAgfHwgdGhpcy5zbmFwc2hvdHNbIDAgXS5nZXRBdmFpbGFibGVCcm93c2VyVGVzdHMoIGZhbHNlICkuZmlsdGVyKCB0ZXN0ID0+IHRlc3QuY291bnQgPT09IDAgKS5sZW5ndGggPT09IDA7XHJcbiAgICAgICAgICBpZiAoIHdhc1N0YWxlICkge1xyXG4gICAgICAgICAgICBpZiAoIG5ldyBEYXRlKCkuZ2V0SG91cnMoKSA8IDUgJiYgIWNvbXBsZXRlZEFsbFRlc3RzICkge1xyXG4gICAgICAgICAgICAgIHdpbnN0b24uaW5mbyggJ1dhaXRpbmcgdW50aWwgNWFtIChvciBjb21wbGV0ZWQgdGVzdHMpIHRvIGNyZWF0ZSBhIHNuYXBzaG90JyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgIHdhc1N0YWxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgIHdpbnN0b24uaW5mbyggJ1N0YWJsZSBwb2ludCByZWFjaGVkJyApO1xyXG5cclxuICAgICAgICAgICAgICBjb25zdCBzbmFwc2hvdCA9IG5ldyBTbmFwc2hvdCggdGhpcy5yb290RGlyLCB0aGlzLnNldFN0YXR1cy5iaW5kKCB0aGlzICkgKTtcclxuICAgICAgICAgICAgICB0aGlzLnBlbmRpbmdTbmFwc2hvdCA9IHNuYXBzaG90O1xyXG5cclxuICAgICAgICAgICAgICBhd2FpdCBzbmFwc2hvdC5jcmVhdGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgdGhpcy5zbmFwc2hvdHMudW5zaGlmdCggc25hcHNob3QgKTtcclxuICAgICAgICAgICAgICB0aGlzLnBlbmRpbmdTbmFwc2hvdCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgIGNvbnN0IGN1dG9mZlRpbWVzdGFtcCA9IERhdGUubm93KCkgLSAxMDAwICogNjAgKiA2MCAqIDI0ICogTlVNQkVSX09GX0RBWVNfVE9fS0VFUF9TTkFQU0hPVFM7XHJcbiAgICAgICAgICAgICAgd2hpbGUgKCB0aGlzLnNuYXBzaG90cy5sZW5ndGggPiA3MCB8fCB0aGlzLnNuYXBzaG90c1sgdGhpcy5zbmFwc2hvdHMubGVuZ3RoIC0gMSBdLnRpbWVzdGFtcCA8IGN1dG9mZlRpbWVzdGFtcCAmJiAhdGhpcy5zbmFwc2hvdHNbIHRoaXMuc25hcHNob3RzLmxlbmd0aCAtIDEgXS5leGlzdHMgKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNuYXBzaG90cy5wb3AoKTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHRoaXMuY29tcHV0ZVJlY2VudFRlc3RXZWlnaHRzKCk7XHJcblxyXG4gICAgICAgICAgICAgIC8vIFNhdmUgYWZ0ZXIgY3JlYXRpbmcgdGhlIHNuYXBzaG90LCBzbyB0aGF0IGlmIHdlIGNyYXNoIGhlcmUsIHdlIHdvbid0IGJlIGNyZWF0aW5nIHBlcm1hbmVudCBnYXJiYWdlXHJcbiAgICAgICAgICAgICAgLy8gZmlsZXMgdW5kZXIgY3Qtc25hcHNob3RzLlxyXG4gICAgICAgICAgICAgIHRoaXMuc2F2ZVRvRmlsZSgpO1xyXG5cclxuICAgICAgICAgICAgICB0aGlzLnNldFN0YXR1cyggJ1JlbW92aW5nIG9sZCBzbmFwc2hvdCBmaWxlcycgKTtcclxuICAgICAgICAgICAgICBjb25zdCBudW1BY3RpdmVTbmFwc2hvdHMgPSAzO1xyXG4gICAgICAgICAgICAgIGZvciAoIGNvbnN0IHNuYXBzaG90IG9mIHRoaXMuc25hcHNob3RzLnNsaWNlKCBudW1BY3RpdmVTbmFwc2hvdHMgKSApIHtcclxuICAgICAgICAgICAgICAgIGlmICggc25hcHNob3QuZXhpc3RzICYmICF0aGlzLnRyYXNoU25hcHNob3RzLmluY2x1ZGVzKCBzbmFwc2hvdCApICkge1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLnRyYXNoU25hcHNob3RzLnB1c2goIHNuYXBzaG90ICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAvLyBOT1RFOiBOTyBhd2FpdCBoZXJlLCB3ZSdyZSBnb2luZyB0byBkbyB0aGF0IGFzeW5jaHJvbm91c2x5IHNvIHdlIGRvbid0IGJsb2NrXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlVHJhc2hTbmFwc2hvdCggc25hcHNob3QgKS50aGVuKCAoKSA9PiB0aGlzLnNhdmVUb0ZpbGUoKSApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBjYXRjaCggZSApIHtcclxuICAgICAgICB0aGlzLnNldEVycm9yKCBgc25hcHNob3QgZXJyb3I6ICR7ZX1gICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEtpY2tzIG9mZiBhIGxvb3AgdGhhdCB3aWxsIHRyeSB0byB0YWNrbGUgYW55IGxvY2FsbHktYmFzZWQgdGVzdHMgYXZhaWxhYmxlIChlLmcuIGdydW50IHRhc2tzLCBidWlsZGluZy9saW50aW5nKVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhc3luYyBsb2NhbFRhc2tMb29wKCkge1xyXG4gICAgd2hpbGUgKCB0cnVlICkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGlmICggdGhpcy5zbmFwc2hvdHMubGVuZ3RoID09PSAwICkge1xyXG4gICAgICAgICAgYXdhaXQgc2xlZXAoIDEwMDAgKTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUGljayBmcm9tIG9uZSBvZiB0aGUgZmlyc3QgdHdvIHNuYXBzaG90c1xyXG4gICAgICAgIGxldCBhdmFpbGFibGVUZXN0cyA9IHRoaXMuc25hcHNob3RzWyAwIF0uZ2V0QXZhaWxhYmxlTG9jYWxUZXN0cygpO1xyXG4gICAgICAgIGlmICggdGhpcy5zbmFwc2hvdHMubGVuZ3RoID4gMSApIHtcclxuICAgICAgICAgIGF2YWlsYWJsZVRlc3RzID0gYXZhaWxhYmxlVGVzdHMuY29uY2F0KCB0aGlzLnNuYXBzaG90c1sgMSBdLmdldEF2YWlsYWJsZUxvY2FsVGVzdHMoKSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCAhYXZhaWxhYmxlVGVzdHMubGVuZ3RoICkge1xyXG4gICAgICAgICAgYXdhaXQgc2xlZXAoIDEwMDAgKTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdGVzdCA9IHRoaXMud2VpZ2h0ZWRTYW1wbGVUZXN0KCBhdmFpbGFibGVUZXN0cyApO1xyXG4gICAgICAgIGNvbnN0IHNuYXBzaG90ID0gdGVzdC5zbmFwc2hvdDtcclxuICAgICAgICBjb25zdCBzdGFydFRpbWVzdGFtcCA9IERhdGUubm93KCk7XHJcblxyXG4gICAgICAgIGlmICggdGVzdC50eXBlID09PSAnbGludCcgKSB7XHJcbiAgICAgICAgICB0ZXN0LmNvbXBsZXRlID0gdHJ1ZTtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG91dHB1dCA9IGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgWyAnbGludCcgXSwgYCR7c25hcHNob3QuZGlyZWN0b3J5fS8ke3Rlc3QucmVwb31gICk7XHJcblxyXG4gICAgICAgICAgICBDb250aW51b3VzU2VydmVyLnRlc3RQYXNzKCB0ZXN0LCBEYXRlLm5vdygpIC0gc3RhcnRUaW1lc3RhbXAsIG91dHB1dCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgICAgICAgIENvbnRpbnVvdXNTZXJ2ZXIudGVzdEZhaWwoIHRlc3QsIERhdGUubm93KCkgLSBzdGFydFRpbWVzdGFtcCwgYExpbnQgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJHtlLmNvZGV9OlxcbiR7ZS5zdGRvdXR9XFxuJHtlLnN0ZGVycn1gLnRyaW0oKSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggdGVzdC50eXBlID09PSAnbGludC1ldmVyeXRoaW5nJyApIHtcclxuICAgICAgICAgIHRlc3QuY29tcGxldGUgPSB0cnVlO1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3Qgb3V0cHV0ID0gYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICdsaW50LWV2ZXJ5dGhpbmcnLCAnLS1oaWRlLXByb2dyZXNzLWJhcicgXSwgYCR7c25hcHNob3QuZGlyZWN0b3J5fS9wZXJlbm5pYWxgICk7XHJcblxyXG4gICAgICAgICAgICBDb250aW51b3VzU2VydmVyLnRlc3RQYXNzKCB0ZXN0LCBEYXRlLm5vdygpIC0gc3RhcnRUaW1lc3RhbXAsIG91dHB1dCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgICAgICAgIENvbnRpbnVvdXNTZXJ2ZXIudGVzdEZhaWwoIHRlc3QsIERhdGUubm93KCkgLSBzdGFydFRpbWVzdGFtcCwgYExpbnQtZXZlcnl0aGluZyBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAke2UuY29kZX06XFxuJHtlLnN0ZG91dH1cXG4ke2Uuc3RkZXJyfWAudHJpbSgpICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCB0ZXN0LnR5cGUgPT09ICdidWlsZCcgKSB7XHJcbiAgICAgICAgICB0ZXN0LmNvbXBsZXRlID0gdHJ1ZTtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG91dHB1dCA9IGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgWyBgLS1icmFuZHM9JHt0ZXN0LmJyYW5kcy5qb2luKCAnLCcgKX1gLCAnLS1saW50PWZhbHNlJyBdLCBgJHtzbmFwc2hvdC5kaXJlY3Rvcnl9LyR7dGVzdC5yZXBvfWAgKTtcclxuXHJcbiAgICAgICAgICAgIENvbnRpbnVvdXNTZXJ2ZXIudGVzdFBhc3MoIHRlc3QsIERhdGUubm93KCkgLSBzdGFydFRpbWVzdGFtcCwgb3V0cHV0ICk7XHJcbiAgICAgICAgICAgIHRlc3Quc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYXRjaCggZSApIHtcclxuICAgICAgICAgICAgQ29udGludW91c1NlcnZlci50ZXN0RmFpbCggdGVzdCwgRGF0ZS5ub3coKSAtIHN0YXJ0VGltZXN0YW1wLCBgQnVpbGQgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJHtlLmNvZGV9OlxcbiR7ZS5zdGRvdXR9XFxuJHtlLnN0ZGVycn1gLnRyaW0oKSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIHVoaGgsIGRvbid0IGtub3cgd2hhdCBoYXBwZW5lZD8gRG9uJ3QgbG9vcCBoZXJlIHdpdGhvdXQgc2xlZXBpbmdcclxuICAgICAgICAgIGF3YWl0IHNsZWVwKCAxMDAwICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGNhdGNoKCBlICkge1xyXG4gICAgICAgIHRoaXMuc2V0RXJyb3IoIGBsb2NhbCBlcnJvcjogJHtlfWAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RhcnRzIGNvbXB1dGluZyB3ZWlnaHRzIGZvciB0ZXN0cy5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYXN5bmMgY29tcHV0ZVdlaWdodHNMb29wKCkge1xyXG4gICAgd2hpbGUgKCB0cnVlICkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHRoaXMuY29tcHV0ZVJlY2VudFRlc3RXZWlnaHRzKCk7XHJcbiAgICAgIH1cclxuICAgICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgICAgdGhpcy5zZXRFcnJvciggYHdlaWdodHMgZXJyb3I6ICR7ZX0gJHtlLnN0YWNrfWAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgYXdhaXQgc2xlZXAoIDMwICogMTAwMCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVndWxhcmx5IHNhdmVzIHByb2dyZXNzLCBzbyB0aGF0IHdoZW4gQ1QgaXMgcmVzdGFydGVkLCBub3QgRVZFUllUSElORyBpcyBsb3N0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhc3luYyBhdXRvc2F2ZUxvb3AoKSB7XHJcbiAgICB3aGlsZSAoIHRydWUgKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc3RhbnQtY29uZGl0aW9uXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgdGhpcy5zYXZlVG9GaWxlKCk7XHJcbiAgICAgIH1cclxuICAgICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgICAgdGhpcy5zZXRFcnJvciggYGF1dG9zYXZlIGVycm9yOiAke2V9ICR7ZS5zdGFja31gICk7XHJcbiAgICAgIH1cclxuICAgICAgYXdhaXQgc2xlZXAoIDUgKiA2MCAqIDEwMDAgKTsgLy8gUnVuIHRoaXMgZXZlcnkgNSBtaW51dGVzXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGFydHMgZ2VuZXJhdGluZyByZXBvcnRzIGZyb20gdGhlIGF2YWlsYWJsZSBkYXRhLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhc3luYyBnZW5lcmF0ZVJlcG9ydExvb3AoKSB7XHJcbiAgICB3aGlsZSAoIHRydWUgKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc3RhbnQtY29uZGl0aW9uXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgd2luc3Rvbi5pbmZvKCAnR2VuZXJhdGluZyBSZXBvcnQnICk7XHJcbiAgICAgICAgY29uc3QgdGVzdE5hbWVNYXAgPSB7fTtcclxuICAgICAgICB0aGlzLnNuYXBzaG90cy5mb3JFYWNoKCBzbmFwc2hvdCA9PiBzbmFwc2hvdC50ZXN0cy5mb3JFYWNoKCB0ZXN0ID0+IHtcclxuICAgICAgICAgIHRlc3ROYW1lTWFwWyB0ZXN0Lm5hbWVTdHJpbmcgXSA9IHRlc3QubmFtZXM7XHJcbiAgICAgICAgfSApICk7XHJcbiAgICAgICAgY29uc3QgdGVzdE5hbWVTdHJpbmdzID0gXy5zb3J0QnkoIE9iamVjdC5rZXlzKCB0ZXN0TmFtZU1hcCApICk7XHJcbiAgICAgICAgY29uc3QgdGVzdE5hbWVzID0gdGVzdE5hbWVTdHJpbmdzLm1hcCggbmFtZVN0cmluZyA9PiB0ZXN0TmFtZU1hcFsgbmFtZVN0cmluZyBdICk7XHJcblxyXG4gICAgICAgIGNvbnN0IGVsYXBzZWRUaW1lcyA9IHRlc3ROYW1lcy5tYXAoICgpID0+IDAgKTtcclxuICAgICAgICBjb25zdCBudW1FbGFwc2VkVGltZXMgPSB0ZXN0TmFtZXMubWFwKCAoKSA9PiAwICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHNuYXBzaG90U3VtbWFyaWVzID0gW107XHJcbiAgICAgICAgZm9yICggY29uc3Qgc25hcHNob3Qgb2YgdGhpcy5zbmFwc2hvdHMuc2xpY2UoIDAsIE5VTV9TTkFQU0hPVFNfVE9fS0VFUF9JTl9SRVBPUlQgKSApIHtcclxuICAgICAgICAgIHNuYXBzaG90U3VtbWFyaWVzLnB1c2goIHtcclxuICAgICAgICAgICAgdGltZXN0YW1wOiBzbmFwc2hvdC50aW1lc3RhbXAsXHJcbiAgICAgICAgICAgIHNoYXM6IHNuYXBzaG90LnNoYXMsXHJcbiAgICAgICAgICAgIHRlc3RzOiB0ZXN0TmFtZXMubWFwKCAoIG5hbWVzLCBpICkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHRlc3QgPSBzbmFwc2hvdC5maW5kVGVzdCggbmFtZXMgKTtcclxuICAgICAgICAgICAgICBpZiAoIHRlc3QgKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXNzZWRUZXN0UmVzdWx0cyA9IHRlc3QucmVzdWx0cy5maWx0ZXIoIHRlc3RSZXN1bHQgPT4gdGVzdFJlc3VsdC5wYXNzZWQgKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZhaWxlZFRlc3RSZXN1bHRzID0gdGVzdC5yZXN1bHRzLmZpbHRlciggdGVzdFJlc3VsdCA9PiAhdGVzdFJlc3VsdC5wYXNzZWQgKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZhaWxNZXNzYWdlcyA9IF8udW5pcSggZmFpbGVkVGVzdFJlc3VsdHMubWFwKCB0ZXN0UmVzdWx0ID0+IHRlc3RSZXN1bHQubWVzc2FnZSApLmZpbHRlciggXy5pZGVudGl0eSApICk7XHJcbiAgICAgICAgICAgICAgICB0ZXN0LnJlc3VsdHMuZm9yRWFjaCggdGVzdFJlc3VsdCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgIGlmICggdGVzdFJlc3VsdC5taWxsaXNlY29uZHMgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxhcHNlZFRpbWVzWyBpIF0gKz0gdGVzdFJlc3VsdC5taWxsaXNlY29uZHM7XHJcbiAgICAgICAgICAgICAgICAgICAgbnVtRWxhcHNlZFRpbWVzWyBpIF0rKztcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcclxuICAgICAgICAgICAgICAgICAgeTogcGFzc2VkVGVzdFJlc3VsdHMubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgICBuOiBmYWlsZWRUZXN0UmVzdWx0cy5sZW5ndGhcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpZiAoIGZhaWxNZXNzYWdlcy5sZW5ndGggKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJlc3VsdC5tID0gZmFpbE1lc3NhZ2VzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge307XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IClcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIGF3YWl0IHNsZWVwKCAwICk7IC8vIGFsbG93IG90aGVyIGFzeW5jIHN0dWZmIHRvIGhhcHBlblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdGVzdEF2ZXJhZ2VUaW1lcyA9IGVsYXBzZWRUaW1lcy5tYXAoICggdGltZSwgaSApID0+IHtcclxuICAgICAgICAgIGlmICggdGltZSA9PT0gMCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRpbWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRpbWUgLyBudW1FbGFwc2VkVGltZXNbIGkgXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgY29uc3QgdGVzdFdlaWdodHMgPSBbXTtcclxuICAgICAgICBmb3IgKCBjb25zdCBuYW1lcyBvZiB0ZXN0TmFtZXMgKSB7XHJcbiAgICAgICAgICBjb25zdCB0ZXN0ID0gdGhpcy5zbmFwc2hvdHNbIDAgXSAmJiB0aGlzLnNuYXBzaG90c1sgMCBdLmZpbmRUZXN0KCBuYW1lcyApO1xyXG4gICAgICAgICAgaWYgKCB0ZXN0ICkge1xyXG4gICAgICAgICAgICB0ZXN0V2VpZ2h0cy5wdXNoKCBNYXRoLmNlaWwoIHRlc3Qud2VpZ2h0ICogMTAwICkgLyAxMDAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0ZXN0V2VpZ2h0cy5wdXNoKCAwICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBhd2FpdCBzbGVlcCggMCApOyAvLyBhbGxvdyBvdGhlciBhc3luYyBzdHVmZiB0byBoYXBwZW5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlcG9ydCA9IHtcclxuICAgICAgICAgIHNuYXBzaG90czogc25hcHNob3RTdW1tYXJpZXMsXHJcbiAgICAgICAgICB0ZXN0TmFtZXM6IHRlc3ROYW1lcyxcclxuICAgICAgICAgIHRlc3RBdmVyYWdlVGltZXM6IHRlc3RBdmVyYWdlVGltZXMsXHJcbiAgICAgICAgICB0ZXN0V2VpZ2h0czogdGVzdFdlaWdodHNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBhd2FpdCBzbGVlcCggMCApOyAvLyBhbGxvdyBvdGhlciBhc3luYyBzdHVmZiB0byBoYXBwZW5cclxuXHJcbiAgICAgICAgdGhpcy5yZXBvcnRKU09OID0gSlNPTi5zdHJpbmdpZnkoIHJlcG9ydCApO1xyXG4gICAgICB9XHJcbiAgICAgIGNhdGNoKCBlICkge1xyXG4gICAgICAgIHRoaXMuc2V0RXJyb3IoIGByZXBvcnQgZXJyb3I6ICR7ZX1gICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGF3YWl0IHNsZWVwKCA1MDAwICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRpbnVvdXNTZXJ2ZXI7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNQSxXQUFXLEdBQUdDLE9BQU8sQ0FBRSwwQ0FBMkMsQ0FBQztBQUN6RSxNQUFNQyxpQkFBaUIsR0FBR0QsT0FBTyxDQUFFLGdEQUFpRCxDQUFDO0FBQ3JGLE1BQU1FLE9BQU8sR0FBR0YsT0FBTyxDQUFFLHNDQUF1QyxDQUFDO0FBQ2pFLE1BQU1HLFdBQVcsR0FBR0gsT0FBTyxDQUFFLDBDQUEyQyxDQUFDO0FBQ3pFLE1BQU1JLE9BQU8sR0FBR0osT0FBTyxDQUFFLHNDQUF1QyxDQUFDO0FBQ2pFLE1BQU1LLFdBQVcsR0FBR0wsT0FBTyxDQUFFLDBDQUEyQyxDQUFDO0FBQ3pFLE1BQU1NLFlBQVksR0FBR04sT0FBTyxDQUFFLDJDQUE0QyxDQUFDO0FBQzNFLE1BQU1PLE9BQU8sR0FBR1AsT0FBTyxDQUFF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