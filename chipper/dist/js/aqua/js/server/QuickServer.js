// Copyright 2022-2023, University of Colorado Boulder

/**
 * Coordinates continuous testing, and provides HTTP APIs for reports or clients that run browser tests.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

const cloneMissingRepos = require('../../../perennial/js/common/cloneMissingRepos');
const deleteDirectory = require('../../../perennial/js/common/deleteDirectory');
const execute = require('../../../perennial/js/common/execute');
const getRepoList = require('../../../perennial/js/common/getRepoList');
const gitPull = require('../../../perennial/js/common/gitPull');
const gitRevParse = require('../../../perennial/js/common/gitRevParse');
const gruntCommand = require('../../../perennial/js/common/gruntCommand');
const isStale = require('../../../perennial/js/common/isStale');
const npmUpdate = require('../../../perennial/js/common/npmUpdate');
const puppeteerLoad = require('../../../perennial/js/common/puppeteerLoad');
const withServer = require('../../../perennial/js/common/withServer');
const assert = require('assert');
const http = require('http');
const _ = require('lodash');
const path = require('path');
const url = require('url');
const winston = require('winston');
const puppeteer = require('puppeteer');
const sendSlackMessage = require('./sendSlackMessage');
const ctqType = {
  LINT: 'lint',
  TSC: 'tsc',
  SIM_FUZZ: 'simFuzz',
  // Should end with "Fuzz"
  STUDIO_FUZZ: 'studioFuzz' // Should end with "Fuzz"
};

// Headers that we'll include in all server replies
const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
};
const FUZZ_SIM = 'natural-selection';
const STUDIO_FUZZ_SIM = 'states-of-matter';
const WAIT_BETWEEN_RUNS = 20000; // in ms
const EXECUTE_OPTIONS = {
  errors: 'resolve'
};
class QuickServer {
  constructor(options) {
    options = {
      rootDir: path.normalize(`${__dirname}/../../../`),
      isTestMode: false,
      ...options
    };

    // @public {*} - the tests object stores the results of tests so that they can be iterated through for "all results"
    this.testingState = {
      tests: {}
    };

    // @public {string} - root of your GitHub working copy, relative to the name of the directory that the
    // currently-executing script resides in
    this.rootDir = options.rootDir;

    // @public {boolean} - whether we are in testing mode. if true, tests are continuously forced to run
    this.isTestMode = options.isTestMode;

    // @private {string[]} - errors found in any given loop from any portion of the testing state
    this.errorMessages = [];

    // Keep track of if we should wait for the next test or not kick it off immediately.
    this.forceTests = this.isTestMode;

    // How many times has the quick-test loop run
    this.testCount = 0;

    // For now, provide an initial message every time, so treat it as broken when it starts
    this.lastBroken = false;

    // Passed to puppeteerLoad()
    this.puppeteerOptions = {};
    this.wireUpMessageOnExit();
  }

  /**
   * Send a slack message when exiting unexpectedly to say that we exited.
   * @private
   */
  wireUpMessageOnExit() {
    // catching signals and do something before exit
    ['SIGINT', 'SIGHUP', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM', 'beforeExit', 'uncaughtException', 'unhandledRejection'].forEach(sig => {
      process.on(sig, () => {
        const message = `CTQ has caught ${sig} and will now exit.`;
        winston.info(message);
        this.slackMessage(message).then(() => {
          process.exit(1);
        });
      });
    });
  }

  // @private
  async getStaleReposFrom(reposToCheck) {
    const staleRepos = [];
    await Promise.all(reposToCheck.map(async repo => {
      if (await isStale(repo)) {
        staleRepos.push(repo);
        winston.info(`QuickServer: ${repo} stale`);
      }
    }));
    return staleRepos;
  }

  /**
   * @public
   */
  async startMainLoop() {
    // Factor out so that webstorm doesn't complain about this whole block inline with the `launch` call
    const launchOptions = {
      handleSIGHUP: false,
      handleSIGINT: false,
      handleSIGTERM: false,
      // With this flag, temp files are written to /tmp/ on bayes, which caused https://github.com/phetsims/aqua/issues/145
      // /dev/shm/ is much bigger
      ignoreDefaultArgs: ['--disable-dev-shm-usage'],
      // Command line arguments passed to the chrome instance,
      args: ['--enable-precise-memory-info',
      // To prevent filling up `/tmp`, see https://github.com/phetsims/aqua/issues/145
      `--user-data-dir=${process.cwd()}/../tmp/puppeteerUserData/`,
      // Fork child processes directly to prevent orphaned chrome instances from lingering on sparky, https://github.com/phetsims/aqua/issues/150#issuecomment-1170140994
      '--no-zygote', '--no-sandbox']
    };

    // Launch the browser once and reuse it to generate new pages in puppeteerLoad
    const browser = await puppeteer.launch(launchOptions);
    this.puppeteerOptions = {
      waitAfterLoad: this.isTestMode ? 3000 : 10000,
      allowedTimeToLoad: 120000,
      gotoTimeout: 120000,
      browser: browser
    };
    while (true) {
      // eslint-disable-line no-constant-condition

      // Run the test, and let us know if we should wait for next test, or proceed immediately.
      await this.runQuickTest();
      !this.forceTests && (await new Promise(resolve => setTimeout(resolve, WAIT_BETWEEN_RUNS)));
    }
  }

  /**
   * @private
   */
  async runQuickTest() {
    try {
      const reposToCheck = this.isTestMode ? ['natural-selection'] : getRepoList('active-repos');
      const staleRepos = await this.getStaleReposFrom(reposToCheck);
      const timestamp = Date.now();
      if (staleRepos.length || this.testCount === 0 || this.forceTests) {
        winston.info(`QuickServer: stale repos: ${staleRepos}`);
        const shas = await this.synchronizeRepos(staleRepos, reposToCheck);

        // Run the tests and get the results
        this.testingState = {
          tests: {
            lint: this.executeResultToTestData(await this.testLint(), ctqType.LINT),
            tsc: this.executeResultToTestData(await this.testTSC(), ctqType.TSC),
            simFuzz: this.fuzzResultToTestData(await this.testSimFuzz(), ctqType.SIM_FUZZ),
            studioFuzz: this.fuzzResultToTestData(await this.testStudioFuzz(), ctqType.STUDIO_FUZZ)
          },
          shas: shas,
          timestamp: timestamp
        };
        const broken = this.isBroken(this.testingState);
        winston.info(`QuickServer broken: ${broken}`);
        await this.reportErrorStatus(broken);
        this.lastBroken = broken;
      }
      this.forceTests = this.isTestMode;
    } catch (e) {
      winston.info(`QuickServer error: ${e}`);
      console.error(e);
      this.forceTests = true; // ensure we immediately kick off next test
    }
  }

  /**
   * @private
   * @param {Object} testingState
   * @returns {boolean}
   */
  isBroken(testingState = this.testingState) {
    return _.some(Object.keys(testingState.tests), name => !testingState.tests[name].passed);
  }

  /**
   * @private
   @returns {Promise<{code:number,stdout:string,stderr:string}>}
   */
  async testLint() {
    winston.info('QuickServer: linting');
    return execute(gruntCommand, ['lint-everything', '--hide-progress-bar'], `${this.rootDir}/perennial`, EXECUTE_OPTIONS);
  }

  /**
   * @private
   * @returns {Promise<{code:number,stdout:string,stderr:string}>}
   */
  async testTSC() {
    winston.info('QuickServer: tsc');

    // Use the "node" executable so that it works across platforms, launching `tsc` as the command on windows results in ENOENT -4058.
    // Pretty false will make the output more machine readable.
    return execute('node', ['../../../chipper/node_modules/typescript/bin/tsc', '--pretty', 'false'], `${this.rootDir}/chipper/tsconfig/all`, EXECUTE_OPTIONS);
  }

  /**
   * @private
   * @returns {Promise<{code:number,stdout:string,stderr:string}>}
   */
  async transpile() {
    winston.info('QuickServer: transpiling');
    return execute('node', ['js/scripts/transpile.js'], `${this.rootDir}/chipper`, EXECUTE_OPTIONS);
  }

  /**
   * @private
   * @returns {Promise<string|null>}
   */
  async testSimFuzz() {
    winston.info('QuickServer: sim fuzz');
    let simFuzz = null;
    try {
      await withServer(async port => {
        const url = `http://localhost:${port}/${FUZZ_SIM}/${FUZZ_SIM}_en.html?brand=phet&ea&debugger&fuzz`;
        await puppeteerLoad(url, this.puppeteerOptions);
      });
    } catch (e) {
      simFuzz = e.toString();
    }
    return simFuzz;
  }

  /**
   * @private
   * @returns {Promise<string|null>}
   */
  async testStudioFuzz() {
    winston.info('QuickServer: studio fuzz');
    let studioFuzz = null;
    try {
      await withServer(async port => {
        const url = `http://localhost:${port}/studio/index.html?sim=${STUDIO_FUZZ_SIM}&phetioElementsDisplay=all&fuzz&phetioWrapperDebug=true`;
        await puppeteerLoad(url, this.puppeteerOptions);
      });
    } catch (e) {
      studioFuzz = e.toString();
    }
    return studioFuzz;
  }

  /**
   * @private
   * @param {string[]} staleRepos
   * @param {string[]} allRepos
   * @returns {Promise<Object<string,string>>} - shas for repos
   */
  async synchronizeRepos(staleRepos, allRepos) {
    for (const repo of staleRepos) {
      winston.info(`QuickServer: pulling ${repo}`);
      await gitPull(repo);
    }
    winston.info('QuickServer: cloning missing repos');
    const clonedRepos = await cloneMissingRepos();
    for (const repo of [...staleRepos, ...clonedRepos]) {
      if (['chipper', 'perennial', 'perennial-alias'].includes(repo)) {
        winston.info(`QuickServer: npm update ${repo}`);
        await npmUpdate(repo);
      }
    }
    winston.info('QuickServer: checking SHAs');
    const shas = {};
    for (const repo of allRepos) {
      shas[repo] = await gitRevParse(repo, 'master');
    }

    // Periodically clean chipper/dist, but not on the first time for easier local testing
    // If CTQ takes 1 minute to run, then this will happen every 16 hours or so.
    if (this.testCount++ % 1000 === 999 && !this.isTestMode) {
      await deleteDirectory(`${this.rootDir}/chipper/dist`);
    }
    await this.transpile();
    return shas;
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
        if (requestInfo.pathname === '/quickserver/status') {
          res.writeHead(200, jsonHeaders);
          res.end(JSON.stringify(this.testingState, null, 2));
        }
      } catch (e) {
        winston.error(`server error: ${e}`);
      }
    }).listen(port);
    winston.info(`QuickServer: running on port ${port}`);
  }

  /**
   * Checks the error messages and reports the current status to the logs and Slack.
   *
   * @param {boolean} broken
   * @private
   */
  async reportErrorStatus(broken) {
    // Robustness handling just in case there are errors that are tracked from last broken state
    if (!broken) {
      this.errorMessages.length = 0;
    }
    if (this.lastBroken && !broken) {
      winston.info('broken -> passing, sending CTQ passing message to Slack');
      await this.slackMessage('CTQ passing');
    } else if (!broken && this.testCount === 1) {
      winston.info('startup -> passing, sending CTQ startup-passing message to Slack');
      await this.slackMessage('CTQ started up and passing');
    } else if (broken) {
      await this.handleBrokenState();
    } else {
      winston.info('passing -> passing');
    }
  }

  /**
   * When in a broken state, handle all cases that may occur:
   * - Newly broken (report everything)
   * - Same broken as last state (report nothing)
   * - Some new items are broken (report only new things)
   * - Some previously broken items have been fixed (update internal state but no new reporting)
   *
   * @private
   */
  async handleBrokenState() {
    // The message reported to slack, depending on our state
    let message = '';

    // Number of errors that were not in the previous broken state
    let newErrorCount = 0;

    // Keep track of the previous errors that still exist so we don't duplicate reporting
    const previousErrorsFound = [];
    const checkForNewErrors = testResult => {
      !testResult.passed && testResult.errorMessages.forEach(errorMessage => {
        let isPreexisting = false;
        for (let i = 0; i < this.errorMessages.length; i++) {
          const preexistingErrorMessage = this.errorMessages[i];

          // Remove spaces for a bit more maintainability in case the spacing of errors changes for an outside reason
          if (preexistingErrorMessage.replace(/\s/g, '') === errorMessage.replace(/\s/g, '')) {
            isPreexisting = true;
            break;
          }
        }

        // If this message matches any we currently have
        if (isPreexisting) {
          previousErrorsFound.push(errorMessage);
        } else {
          this.errorMessages.push(errorMessage);
          message += `\n${errorMessage}`;
          newErrorCount++;
        }
      });
    };

    // See if there are any new errors in our tests
    Object.keys(this.testingState.tests).forEach(testKeyName => checkForNewErrors(this.testingState.tests[testKeyName]));
    if (message.length > 0) {
      if (previousErrorsFound.length || this.lastBroken) {
        winston.info('broken -> more broken, sending additional CTQ failure message to Slack');
        const sForFailure = newErrorCount > 1 ? 's' : '';
        message = `CTQ additional failure${sForFailure}:\n\`\`\`${message}\`\`\``;
        if (previousErrorsFound.length) {
          assert(this.lastBroken, 'Last cycle must be broken if pre-existing errors were found');
          const sForError = previousErrorsFound.length > 1 ? 's' : '';
          const sForRemain = previousErrorsFound.length === 1 ? 's' : '';
          message += `\n${previousErrorsFound.length} pre-existing error${sForError} remain${sForRemain}.`;
        } else {
          assert(this.lastBroken, 'Last cycle must be broken if no pre-existing errors were found and you made it here');
          message += '\nAll other pre-existing errors fixed.';
        }
      } else {
        winston.info('passing -> broken, sending CTQ failure message to Slack');
        message = 'CTQ failing:\n```' + message + '```';
      }
      await this.slackMessage(message, this.isTestMode);
    } else {
      winston.info('broken -> broken, no new failures to report to Slack');
      assert(newErrorCount === 0, 'No new errors if no message');
      assert(previousErrorsFound.length, 'Previous errors must exist if no new errors are found and CTQ is still broken');
    }
  }

  /**
   * send a message to slack, with error handling
   * @param {string} message
   * @returns {Promise<void>}
   * @private
   */
  async slackMessage(message) {
    try {
      winston.info(`Sending to slack: ${message}`);
      await sendSlackMessage(message, this.isTestMode);
    } catch (e) {
      winston.info(`Slack error: ${e}`);
      console.error(e);
    }
  }

  /**
   * @private
   * @param {string} result
   * @param {string} name
   * @returns {{errorMessages: string[], passed: boolean, message: string}}
   */
  executeResultToTestData(result, name) {
    return {
      passed: result.code === 0,
      // full length message, used when someone clicks on a quickNode in CT for error details
      message: `code: ${result.code}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
      // trimmed down and separated error messages, used to track the state of individual errors and show
      // abbreviated errors for the Slack CT Notifier
      errorMessages: result.code === 0 ? [] : this.parseCompositeError(result.stdout, name, result.stderr)
    };
  }

  /**
   * @private
   * @param {string} result
   * @param {string} name
   * @returns {{errorMessages: string[], passed: boolean, message: string}}
   */
  fuzzResultToTestData(result, name) {
    if (result === null) {
      return {
        passed: true,
        message: '',
        errorMessages: []
      };
    } else {
      // We want to remove the "port" variation so that the same sim error has the same error message
      result = result.replace(/localhost:\d+/g, 'localhost:8080');
      return {
        passed: false,
        message: '' + result,
        errorMessages: this.parseCompositeError(result, name)
      };
    }
  }

  /**
   * @private
   * @param {string} message
   * @returns {string}
   */
  splitAndTrimMessage(message) {
    return message.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  }

  /**
   * Parses individual errors out of a collection of the same type of error, e.g. lint
   *
   * @param {string} message
   * @param {string} name
   * @param {string} stderr - if the error is in the running process, and not the report
   * @returns {string[]}
   * @private
   */
  parseCompositeError(message, name, stderr = '') {
    const errorMessages = [];

    // If there is stderr from a process, assume that means there was a problem conducting the test, and ignore the message
    if (stderr) {
      errorMessages.push(`error testing ${name}: ${stderr}`);
      return errorMessages;
    }

    // most lint and tsc errors have a file associated with them. look for them in a line via 4 sets of slashes
    // Extensions should match those found in CHIPPER/lint
    // Don't match to the end of the line ($),  because tsc puts the file and error on the same line.
    const fileNameRegex = /^[^\s]*([\\/][^/\\]+){4}[^\s]*(\.js|\.ts|\.jsx|\.tsx|\.cjs|\.mjs)/;
    const lintProblemRegex = /^\d+:\d+\s+error\s/; // row:column error {{ERROR}}

    if (name === ctqType.LINT) {
      let currentFilename = null;

      // This message is duplicated in CHIPPER/lint, please change cautiously.
      const IMPORTANT_MESSAGE = 'All results (repeated from above)';
      assert(message.includes(IMPORTANT_MESSAGE), 'expected formatting from lint ' + message);
      message = message.split(IMPORTANT_MESSAGE)[1].trim();

      // split up the error message by line for parsing
      const messageLines = this.splitAndTrimMessage(message);

      // Look for a filename. once found, all subsequent lines are an individual errors to add until the next filename is reached
      messageLines.forEach(line => {
        if (currentFilename) {
          // Assumes here that all problems are directly below the filename (no white spaces)
          if (lintProblemRegex.test(line)) {
            errorMessages.push(`lint: ${currentFilename} -- ${line}`);
          } else {
            currentFilename = null;
          }
        }
        if (!currentFilename && fileNameRegex.test(line)) {
          currentFilename = line.match(fileNameRegex)[0];
        }
      });
    } else if (name === ctqType.TSC) {
      // split up the error message by line for parsing
      const messageLines = this.splitAndTrimMessage(message);

      // Some errors span multiple lines, like a stack, but each new error starts with a file/row/column/error number
      let currentError = '';
      const addCurrentError = () => {
        if (currentError.length) {
          errorMessages.push(currentError);
        }
      };

      // look for a filename. if found, all subsequent lines that don't contain filenames are part of the same error to
      // add until a new filename line is found
      messageLines.forEach(line => {
        if (fileNameRegex.test(line)) {
          addCurrentError();
          currentError = `tsc: ${line}`;
        } else {
          currentError += `\n${line}`;
        }
      });

      // Push the final error file
      addCurrentError();
    }

    // if we are not a lint or tsc error, or if those errors were not able to be parsed above, send the whole message
    if (!errorMessages.length) {
      errorMessages.push(`${name}: ${message}`);
    }
    return errorMessages;
  }
}
module.exports = QuickServer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjbG9uZU1pc3NpbmdSZXBvcyIsInJlcXVpcmUiLCJkZWxldGVEaXJlY3RvcnkiLCJleGVjdXRlIiwiZ2V0UmVwb0xpc3QiLCJnaXRQdWxsIiwiZ2l0UmV2UGFyc2UiLCJncnVudENvbW1hbmQiLCJpc1N0YWxlIiwibnBtVXBkYXRlIiwicHVwcGV0ZWVyTG9hZCIsIndpdGhTZXJ2ZXIiLCJhc3NlcnQiLCJodHRwIiwiXyIsInBhdGgiLCJ1cmwiLCJ3aW5zdG9uIiwicHVwcGV0ZWVyIiwic2VuZFNsYWNrTWVzc2FnZSIsImN0cVR5cGUiLCJMSU5UIiwiVFNDIiwiU0lNX0ZVWloiLCJTVFVESU9fRlVaWiIsImpzb25IZWFkZXJzIiwiRlVaWl9TSU0iLCJTVFVESU9fRlVaWl9TSU0iLCJXQUlUX0JFVFdFRU5fUlVOUyIsIkVYRUNVVEVfT1BUSU9OUyIsImVycm9ycyIsIlF1aWNrU2VydmVyIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwicm9vdERpciIsIm5vcm1hbGl6ZSIsIl9fZGlybmFtZSIsImlzVGVzdE1vZGUiLCJ0ZXN0aW5nU3RhdGUiLCJ0ZXN0cyIsImVycm9yTWVzc2FnZXMiLCJmb3JjZVRlc3RzIiwidGVzdENvdW50IiwibGFzdEJyb2tlbiIsInB1cHBldGVlck9wdGlvbnMiLCJ3aXJlVXBNZXNzYWdlT25FeGl0IiwiZm9yRWFjaCIsInNpZyIsInByb2Nlc3MiLCJvbiIsIm1lc3NhZ2UiLCJpbmZvIiwic2xhY2tNZXNzYWdlIiwidGhlbiIsImV4aXQiLCJnZXRTdGFsZVJlcG9zRnJvbSIsInJlcG9zVG9DaGVjayIsInN0YWxlUmVwb3MiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwicmVwbyIsInB1c2giLCJzdGFydE1haW5Mb29wIiwibGF1bmNoT3B0aW9ucyIsImhhbmRsZVNJR0hVUCIsImhhbmRsZVNJR0lOVCIsImhhbmRsZVNJR1RFUk0iLCJpZ25vcmVEZWZhdWx0QXJncyIsImFyZ3MiLCJjd2QiLCJicm93c2VyIiwibGF1bmNoIiwid2FpdEFmdGVyTG9hZCIsImFsbG93ZWRUaW1lVG9Mb2FkIiwiZ290b1RpbWVvdXQiLCJydW5RdWlja1Rlc3QiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsInRpbWVzdGFtcCIsIkRhdGUiLCJub3ciLCJsZW5ndGgiLCJzaGFzIiwic3luY2hyb25pemVSZXBvcyIsImxpbnQiLCJleGVjdXRlUmVzdWx0VG9UZXN0RGF0YSIsInRlc3RMaW50IiwidHNjIiwidGVzdFRTQyIsInNpbUZ1enoiLCJmdXp6UmVzdWx0VG9UZXN0RGF0YSIsInRlc3RTaW1GdXp6Iiwic3R1ZGlvRnV6eiIsInRlc3RTdHVkaW9GdXp6IiwiYnJva2VuIiwiaXNCcm9rZW4iLCJyZXBvcnRFcnJvclN0YXR1cyIsImUiLCJjb25zb2xlIiwiZXJyb3IiLCJzb21lIiwiT2JqZWN0Iiwia2V5cyIsIm5hbWUiLCJwYXNzZWQiLCJ0cmFuc3BpbGUiLCJwb3J0IiwidG9TdHJpbmciLCJhbGxSZXBvcyIsImNsb25lZFJlcG9zIiwiaW5jbHVkZXMiLCJzdGFydFNlcnZlciIsImNyZWF0ZVNlcnZlciIsInJlcSIsInJlcyIsInJlcXVlc3RJbmZvIiwicGFyc2UiLCJwYXRobmFtZSIsIndyaXRlSGVhZCIsImVuZCIsIkpTT04iLCJzdHJpbmdpZnkiLCJsaXN0ZW4iLCJoYW5kbGVCcm9rZW5TdGF0ZSIsIm5ld0Vycm9yQ291bnQiLCJwcmV2aW91c0Vycm9yc0ZvdW5kIiwiY2hlY2tGb3JOZXdFcnJvcnMiLCJ0ZXN0UmVzdWx0IiwiZXJyb3JNZXNzYWdlIiwiaXNQcmVleGlzdGluZyIsImkiLCJwcmVleGlzdGluZ0Vycm9yTWVzc2FnZSIsInJlcGxhY2UiLCJ0ZXN0S2V5TmFtZSIsInNGb3JGYWlsdXJlIiwic0ZvckVycm9yIiwic0ZvclJlbWFpbiIsInJlc3VsdCIsImNvZGUiLCJzdGRvdXQiLCJzdGRlcnIiLCJwYXJzZUNvbXBvc2l0ZUVycm9yIiwic3BsaXRBbmRUcmltTWVzc2FnZSIsInNwbGl0IiwibGluZSIsInRyaW0iLCJmaWx0ZXIiLCJmaWxlTmFtZVJlZ2V4IiwibGludFByb2JsZW1SZWdleCIsImN1cnJlbnRGaWxlbmFtZSIsIklNUE9SVEFOVF9NRVNTQUdFIiwibWVzc2FnZUxpbmVzIiwidGVzdCIsIm1hdGNoIiwiY3VycmVudEVycm9yIiwiYWRkQ3VycmVudEVycm9yIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJzb3VyY2VzIjpbIlF1aWNrU2VydmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvb3JkaW5hdGVzIGNvbnRpbnVvdXMgdGVzdGluZywgYW5kIHByb3ZpZGVzIEhUVFAgQVBJcyBmb3IgcmVwb3J0cyBvciBjbGllbnRzIHRoYXQgcnVuIGJyb3dzZXIgdGVzdHMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuY29uc3QgY2xvbmVNaXNzaW5nUmVwb3MgPSByZXF1aXJlKCAnLi4vLi4vLi4vcGVyZW5uaWFsL2pzL2NvbW1vbi9jbG9uZU1pc3NpbmdSZXBvcycgKTtcclxuY29uc3QgZGVsZXRlRGlyZWN0b3J5ID0gcmVxdWlyZSggJy4uLy4uLy4uL3BlcmVubmlhbC9qcy9jb21tb24vZGVsZXRlRGlyZWN0b3J5JyApO1xyXG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4uLy4uLy4uL3BlcmVubmlhbC9qcy9jb21tb24vZXhlY3V0ZScgKTtcclxuY29uc3QgZ2V0UmVwb0xpc3QgPSByZXF1aXJlKCAnLi4vLi4vLi4vcGVyZW5uaWFsL2pzL2NvbW1vbi9nZXRSZXBvTGlzdCcgKTtcclxuY29uc3QgZ2l0UHVsbCA9IHJlcXVpcmUoICcuLi8uLi8uLi9wZXJlbm5pYWwvanMvY29tbW9uL2dpdFB1bGwnICk7XHJcbmNvbnN0IGdpdFJldlBhcnNlID0gcmVxdWlyZSggJy4uLy4uLy4uL3BlcmVubmlhbC9qcy9jb21tb24vZ2l0UmV2UGFyc2UnICk7XHJcbmNvbnN0IGdydW50Q29tbWFuZCA9IHJlcXVpcmUoICcuLi8uLi8uLi9wZXJlbm5pYWwvanMvY29tbW9uL2dydW50Q29tbWFuZCcgKTtcclxuY29uc3QgaXNTdGFsZSA9IHJlcXVpcmUoICcuLi8uLi8uLi9wZXJlbm5pYWwvanMvY29tbW9uL2lzU3RhbGUnICk7XHJcbmNvbnN0IG5wbVVwZGF0ZSA9IHJlcXVpcmUoICcuLi8uLi8uLi9wZXJlbm5pYWwvanMvY29tbW9uL25wbVVwZGF0ZScgKTtcclxuY29uc3QgcHVwcGV0ZWVyTG9hZCA9IHJlcXVpcmUoICcuLi8uLi8uLi9wZXJlbm5pYWwvanMvY29tbW9uL3B1cHBldGVlckxvYWQnICk7XHJcbmNvbnN0IHdpdGhTZXJ2ZXIgPSByZXF1aXJlKCAnLi4vLi4vLi4vcGVyZW5uaWFsL2pzL2NvbW1vbi93aXRoU2VydmVyJyApO1xyXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xyXG5jb25zdCBodHRwID0gcmVxdWlyZSggJ2h0dHAnICk7XHJcbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xyXG5jb25zdCBwYXRoID0gcmVxdWlyZSggJ3BhdGgnICk7XHJcbmNvbnN0IHVybCA9IHJlcXVpcmUoICd1cmwnICk7XHJcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcclxuY29uc3QgcHVwcGV0ZWVyID0gcmVxdWlyZSggJ3B1cHBldGVlcicgKTtcclxuY29uc3Qgc2VuZFNsYWNrTWVzc2FnZSA9IHJlcXVpcmUoICcuL3NlbmRTbGFja01lc3NhZ2UnICk7XHJcblxyXG5jb25zdCBjdHFUeXBlID0ge1xyXG4gIExJTlQ6ICdsaW50JyxcclxuICBUU0M6ICd0c2MnLFxyXG4gIFNJTV9GVVpaOiAnc2ltRnV6eicsIC8vIFNob3VsZCBlbmQgd2l0aCBcIkZ1enpcIlxyXG4gIFNUVURJT19GVVpaOiAnc3R1ZGlvRnV6eicgLy8gU2hvdWxkIGVuZCB3aXRoIFwiRnV6elwiXHJcbn07XHJcblxyXG4vLyBIZWFkZXJzIHRoYXQgd2UnbGwgaW5jbHVkZSBpbiBhbGwgc2VydmVyIHJlcGxpZXNcclxuY29uc3QganNvbkhlYWRlcnMgPSB7XHJcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonXHJcbn07XHJcblxyXG5jb25zdCBGVVpaX1NJTSA9ICduYXR1cmFsLXNlbGVjdGlvbic7XHJcbmNvbnN0IFNUVURJT19GVVpaX1NJTSA9ICdzdGF0ZXMtb2YtbWF0dGVyJztcclxuY29uc3QgV0FJVF9CRVRXRUVOX1JVTlMgPSAyMDAwMDsgLy8gaW4gbXNcclxuY29uc3QgRVhFQ1VURV9PUFRJT05TID0geyBlcnJvcnM6ICdyZXNvbHZlJyB9O1xyXG5cclxuY2xhc3MgUXVpY2tTZXJ2ZXIge1xyXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSB7XHJcbiAgICAgIHJvb3REaXI6IHBhdGgubm9ybWFsaXplKCBgJHtfX2Rpcm5hbWV9Ly4uLy4uLy4uL2AgKSxcclxuICAgICAgaXNUZXN0TW9kZTogZmFsc2UsXHJcbiAgICAgIC4uLm9wdGlvbnNcclxuICAgIH07XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Kn0gLSB0aGUgdGVzdHMgb2JqZWN0IHN0b3JlcyB0aGUgcmVzdWx0cyBvZiB0ZXN0cyBzbyB0aGF0IHRoZXkgY2FuIGJlIGl0ZXJhdGVkIHRocm91Z2ggZm9yIFwiYWxsIHJlc3VsdHNcIlxyXG4gICAgdGhpcy50ZXN0aW5nU3RhdGUgPSB7IHRlc3RzOiB7fSB9O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ30gLSByb290IG9mIHlvdXIgR2l0SHViIHdvcmtpbmcgY29weSwgcmVsYXRpdmUgdG8gdGhlIG5hbWUgb2YgdGhlIGRpcmVjdG9yeSB0aGF0IHRoZVxyXG4gICAgLy8gY3VycmVudGx5LWV4ZWN1dGluZyBzY3JpcHQgcmVzaWRlcyBpblxyXG4gICAgdGhpcy5yb290RGlyID0gb3B0aW9ucy5yb290RGlyO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gd2hldGhlciB3ZSBhcmUgaW4gdGVzdGluZyBtb2RlLiBpZiB0cnVlLCB0ZXN0cyBhcmUgY29udGludW91c2x5IGZvcmNlZCB0byBydW5cclxuICAgIHRoaXMuaXNUZXN0TW9kZSA9IG9wdGlvbnMuaXNUZXN0TW9kZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7c3RyaW5nW119IC0gZXJyb3JzIGZvdW5kIGluIGFueSBnaXZlbiBsb29wIGZyb20gYW55IHBvcnRpb24gb2YgdGhlIHRlc3Rpbmcgc3RhdGVcclxuICAgIHRoaXMuZXJyb3JNZXNzYWdlcyA9IFtdO1xyXG5cclxuICAgIC8vIEtlZXAgdHJhY2sgb2YgaWYgd2Ugc2hvdWxkIHdhaXQgZm9yIHRoZSBuZXh0IHRlc3Qgb3Igbm90IGtpY2sgaXQgb2ZmIGltbWVkaWF0ZWx5LlxyXG4gICAgdGhpcy5mb3JjZVRlc3RzID0gdGhpcy5pc1Rlc3RNb2RlO1xyXG5cclxuICAgIC8vIEhvdyBtYW55IHRpbWVzIGhhcyB0aGUgcXVpY2stdGVzdCBsb29wIHJ1blxyXG4gICAgdGhpcy50ZXN0Q291bnQgPSAwO1xyXG5cclxuICAgIC8vIEZvciBub3csIHByb3ZpZGUgYW4gaW5pdGlhbCBtZXNzYWdlIGV2ZXJ5IHRpbWUsIHNvIHRyZWF0IGl0IGFzIGJyb2tlbiB3aGVuIGl0IHN0YXJ0c1xyXG4gICAgdGhpcy5sYXN0QnJva2VuID0gZmFsc2U7XHJcblxyXG4gICAgLy8gUGFzc2VkIHRvIHB1cHBldGVlckxvYWQoKVxyXG4gICAgdGhpcy5wdXBwZXRlZXJPcHRpb25zID0ge307XHJcblxyXG4gICAgdGhpcy53aXJlVXBNZXNzYWdlT25FeGl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZW5kIGEgc2xhY2sgbWVzc2FnZSB3aGVuIGV4aXRpbmcgdW5leHBlY3RlZGx5IHRvIHNheSB0aGF0IHdlIGV4aXRlZC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHdpcmVVcE1lc3NhZ2VPbkV4aXQoKSB7XHJcblxyXG4gICAgLy8gY2F0Y2hpbmcgc2lnbmFscyBhbmQgZG8gc29tZXRoaW5nIGJlZm9yZSBleGl0XHJcbiAgICBbICdTSUdJTlQnLCAnU0lHSFVQJywgJ1NJR1FVSVQnLCAnU0lHSUxMJywgJ1NJR1RSQVAnLCAnU0lHQUJSVCcsICdTSUdCVVMnLCAnU0lHRlBFJywgJ1NJR1VTUjEnLFxyXG4gICAgICAnU0lHU0VHVicsICdTSUdVU1IyJywgJ1NJR1RFUk0nLCAnYmVmb3JlRXhpdCcsICd1bmNhdWdodEV4Y2VwdGlvbicsICd1bmhhbmRsZWRSZWplY3Rpb24nXHJcbiAgICBdLmZvckVhY2goIHNpZyA9PiB7XHJcbiAgICAgIHByb2Nlc3Mub24oIHNpZywgKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgQ1RRIGhhcyBjYXVnaHQgJHtzaWd9IGFuZCB3aWxsIG5vdyBleGl0LmA7XHJcbiAgICAgICAgd2luc3Rvbi5pbmZvKCBtZXNzYWdlICk7XHJcbiAgICAgICAgdGhpcy5zbGFja01lc3NhZ2UoIG1lc3NhZ2UgKS50aGVuKCAoKSA9PiB7XHJcbiAgICAgICAgICBwcm9jZXNzLmV4aXQoIDEgKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlXHJcbiAgYXN5bmMgZ2V0U3RhbGVSZXBvc0Zyb20oIHJlcG9zVG9DaGVjayApIHtcclxuICAgIGNvbnN0IHN0YWxlUmVwb3MgPSBbXTtcclxuICAgIGF3YWl0IFByb21pc2UuYWxsKCByZXBvc1RvQ2hlY2subWFwKCBhc3luYyByZXBvID0+IHtcclxuICAgICAgaWYgKCBhd2FpdCBpc1N0YWxlKCByZXBvICkgKSB7XHJcbiAgICAgICAgc3RhbGVSZXBvcy5wdXNoKCByZXBvICk7XHJcbiAgICAgICAgd2luc3Rvbi5pbmZvKCBgUXVpY2tTZXJ2ZXI6ICR7cmVwb30gc3RhbGVgICk7XHJcbiAgICAgIH1cclxuICAgIH0gKSApO1xyXG4gICAgcmV0dXJuIHN0YWxlUmVwb3M7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYXN5bmMgc3RhcnRNYWluTG9vcCgpIHtcclxuXHJcbiAgICAvLyBGYWN0b3Igb3V0IHNvIHRoYXQgd2Vic3Rvcm0gZG9lc24ndCBjb21wbGFpbiBhYm91dCB0aGlzIHdob2xlIGJsb2NrIGlubGluZSB3aXRoIHRoZSBgbGF1bmNoYCBjYWxsXHJcbiAgICBjb25zdCBsYXVuY2hPcHRpb25zID0ge1xyXG4gICAgICBoYW5kbGVTSUdIVVA6IGZhbHNlLFxyXG4gICAgICBoYW5kbGVTSUdJTlQ6IGZhbHNlLFxyXG4gICAgICBoYW5kbGVTSUdURVJNOiBmYWxzZSxcclxuXHJcbiAgICAgIC8vIFdpdGggdGhpcyBmbGFnLCB0ZW1wIGZpbGVzIGFyZSB3cml0dGVuIHRvIC90bXAvIG9uIGJheWVzLCB3aGljaCBjYXVzZWQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FxdWEvaXNzdWVzLzE0NVxyXG4gICAgICAvLyAvZGV2L3NobS8gaXMgbXVjaCBiaWdnZXJcclxuICAgICAgaWdub3JlRGVmYXVsdEFyZ3M6IFsgJy0tZGlzYWJsZS1kZXYtc2htLXVzYWdlJyBdLFxyXG5cclxuICAgICAgLy8gQ29tbWFuZCBsaW5lIGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIGNocm9tZSBpbnN0YW5jZSxcclxuICAgICAgYXJnczogW1xyXG4gICAgICAgICctLWVuYWJsZS1wcmVjaXNlLW1lbW9yeS1pbmZvJyxcclxuXHJcbiAgICAgICAgLy8gVG8gcHJldmVudCBmaWxsaW5nIHVwIGAvdG1wYCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hcXVhL2lzc3Vlcy8xNDVcclxuICAgICAgICBgLS11c2VyLWRhdGEtZGlyPSR7cHJvY2Vzcy5jd2QoKX0vLi4vdG1wL3B1cHBldGVlclVzZXJEYXRhL2AsXHJcblxyXG4gICAgICAgIC8vIEZvcmsgY2hpbGQgcHJvY2Vzc2VzIGRpcmVjdGx5IHRvIHByZXZlbnQgb3JwaGFuZWQgY2hyb21lIGluc3RhbmNlcyBmcm9tIGxpbmdlcmluZyBvbiBzcGFya3ksIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hcXVhL2lzc3Vlcy8xNTAjaXNzdWVjb21tZW50LTExNzAxNDA5OTRcclxuICAgICAgICAnLS1uby16eWdvdGUnLFxyXG4gICAgICAgICctLW5vLXNhbmRib3gnXHJcbiAgICAgIF1cclxuICAgIH07XHJcblxyXG4gICAgLy8gTGF1bmNoIHRoZSBicm93c2VyIG9uY2UgYW5kIHJldXNlIGl0IHRvIGdlbmVyYXRlIG5ldyBwYWdlcyBpbiBwdXBwZXRlZXJMb2FkXHJcbiAgICBjb25zdCBicm93c2VyID0gYXdhaXQgcHVwcGV0ZWVyLmxhdW5jaCggbGF1bmNoT3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMucHVwcGV0ZWVyT3B0aW9ucyA9IHtcclxuICAgICAgd2FpdEFmdGVyTG9hZDogdGhpcy5pc1Rlc3RNb2RlID8gMzAwMCA6IDEwMDAwLFxyXG4gICAgICBhbGxvd2VkVGltZVRvTG9hZDogMTIwMDAwLFxyXG4gICAgICBnb3RvVGltZW91dDogMTIwMDAwLFxyXG4gICAgICBicm93c2VyOiBicm93c2VyXHJcbiAgICB9O1xyXG5cclxuICAgIHdoaWxlICggdHJ1ZSApIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zdGFudC1jb25kaXRpb25cclxuXHJcbiAgICAgIC8vIFJ1biB0aGUgdGVzdCwgYW5kIGxldCB1cyBrbm93IGlmIHdlIHNob3VsZCB3YWl0IGZvciBuZXh0IHRlc3QsIG9yIHByb2NlZWQgaW1tZWRpYXRlbHkuXHJcbiAgICAgIGF3YWl0IHRoaXMucnVuUXVpY2tUZXN0KCk7XHJcblxyXG4gICAgICAhdGhpcy5mb3JjZVRlc3RzICYmIGF3YWl0IG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHNldFRpbWVvdXQoIHJlc29sdmUsIFdBSVRfQkVUV0VFTl9SVU5TICkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgYXN5bmMgcnVuUXVpY2tUZXN0KCkge1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlcG9zVG9DaGVjayA9IHRoaXMuaXNUZXN0TW9kZSA/IFsgJ25hdHVyYWwtc2VsZWN0aW9uJyBdIDogZ2V0UmVwb0xpc3QoICdhY3RpdmUtcmVwb3MnICk7XHJcblxyXG4gICAgICBjb25zdCBzdGFsZVJlcG9zID0gYXdhaXQgdGhpcy5nZXRTdGFsZVJlcG9zRnJvbSggcmVwb3NUb0NoZWNrICk7XHJcblxyXG4gICAgICBjb25zdCB0aW1lc3RhbXAgPSBEYXRlLm5vdygpO1xyXG5cclxuICAgICAgaWYgKCBzdGFsZVJlcG9zLmxlbmd0aCB8fCB0aGlzLnRlc3RDb3VudCA9PT0gMCB8fCB0aGlzLmZvcmNlVGVzdHMgKSB7XHJcblxyXG4gICAgICAgIHdpbnN0b24uaW5mbyggYFF1aWNrU2VydmVyOiBzdGFsZSByZXBvczogJHtzdGFsZVJlcG9zfWAgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc2hhcyA9IGF3YWl0IHRoaXMuc3luY2hyb25pemVSZXBvcyggc3RhbGVSZXBvcywgcmVwb3NUb0NoZWNrICk7XHJcblxyXG4gICAgICAgIC8vIFJ1biB0aGUgdGVzdHMgYW5kIGdldCB0aGUgcmVzdWx0c1xyXG4gICAgICAgIHRoaXMudGVzdGluZ1N0YXRlID0ge1xyXG4gICAgICAgICAgdGVzdHM6IHtcclxuICAgICAgICAgICAgbGludDogdGhpcy5leGVjdXRlUmVzdWx0VG9UZXN0RGF0YSggYXdhaXQgdGhpcy50ZXN0TGludCgpLCBjdHFUeXBlLkxJTlQgKSxcclxuICAgICAgICAgICAgdHNjOiB0aGlzLmV4ZWN1dGVSZXN1bHRUb1Rlc3REYXRhKCBhd2FpdCB0aGlzLnRlc3RUU0MoKSwgY3RxVHlwZS5UU0MgKSxcclxuICAgICAgICAgICAgc2ltRnV6ejogdGhpcy5mdXp6UmVzdWx0VG9UZXN0RGF0YSggYXdhaXQgdGhpcy50ZXN0U2ltRnV6eigpLCBjdHFUeXBlLlNJTV9GVVpaICksXHJcbiAgICAgICAgICAgIHN0dWRpb0Z1eno6IHRoaXMuZnV6elJlc3VsdFRvVGVzdERhdGEoIGF3YWl0IHRoaXMudGVzdFN0dWRpb0Z1enooKSwgY3RxVHlwZS5TVFVESU9fRlVaWiApXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgc2hhczogc2hhcyxcclxuICAgICAgICAgIHRpbWVzdGFtcDogdGltZXN0YW1wXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgYnJva2VuID0gdGhpcy5pc0Jyb2tlbiggdGhpcy50ZXN0aW5nU3RhdGUgKTtcclxuXHJcbiAgICAgICAgd2luc3Rvbi5pbmZvKCBgUXVpY2tTZXJ2ZXIgYnJva2VuOiAke2Jyb2tlbn1gICk7XHJcblxyXG4gICAgICAgIGF3YWl0IHRoaXMucmVwb3J0RXJyb3JTdGF0dXMoIGJyb2tlbiApO1xyXG5cclxuICAgICAgICB0aGlzLmxhc3RCcm9rZW4gPSBicm9rZW47XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5mb3JjZVRlc3RzID0gdGhpcy5pc1Rlc3RNb2RlO1xyXG4gICAgfVxyXG4gICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgIHdpbnN0b24uaW5mbyggYFF1aWNrU2VydmVyIGVycm9yOiAke2V9YCApO1xyXG4gICAgICBjb25zb2xlLmVycm9yKCBlICk7XHJcbiAgICAgIHRoaXMuZm9yY2VUZXN0cyA9IHRydWU7IC8vIGVuc3VyZSB3ZSBpbW1lZGlhdGVseSBraWNrIG9mZiBuZXh0IHRlc3RcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IHRlc3RpbmdTdGF0ZVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzQnJva2VuKCB0ZXN0aW5nU3RhdGUgPSB0aGlzLnRlc3RpbmdTdGF0ZSApIHtcclxuICAgIHJldHVybiBfLnNvbWUoIE9iamVjdC5rZXlzKCB0ZXN0aW5nU3RhdGUudGVzdHMgKSwgbmFtZSA9PiAhdGVzdGluZ1N0YXRlLnRlc3RzWyBuYW1lIF0ucGFzc2VkICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICBAcmV0dXJucyB7UHJvbWlzZTx7Y29kZTpudW1iZXIsc3Rkb3V0OnN0cmluZyxzdGRlcnI6c3RyaW5nfT59XHJcbiAgICovXHJcbiAgYXN5bmMgdGVzdExpbnQoKSB7XHJcbiAgICB3aW5zdG9uLmluZm8oICdRdWlja1NlcnZlcjogbGludGluZycgKTtcclxuICAgIHJldHVybiBleGVjdXRlKCBncnVudENvbW1hbmQsIFsgJ2xpbnQtZXZlcnl0aGluZycsICctLWhpZGUtcHJvZ3Jlc3MtYmFyJyBdLCBgJHt0aGlzLnJvb3REaXJ9L3BlcmVubmlhbGAsIEVYRUNVVEVfT1BUSU9OUyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTx7Y29kZTpudW1iZXIsc3Rkb3V0OnN0cmluZyxzdGRlcnI6c3RyaW5nfT59XHJcbiAgICovXHJcbiAgYXN5bmMgdGVzdFRTQygpIHtcclxuICAgIHdpbnN0b24uaW5mbyggJ1F1aWNrU2VydmVyOiB0c2MnICk7XHJcblxyXG4gICAgLy8gVXNlIHRoZSBcIm5vZGVcIiBleGVjdXRhYmxlIHNvIHRoYXQgaXQgd29ya3MgYWNyb3NzIHBsYXRmb3JtcywgbGF1bmNoaW5nIGB0c2NgIGFzIHRoZSBjb21tYW5kIG9uIHdpbmRvd3MgcmVzdWx0cyBpbiBFTk9FTlQgLTQwNTguXHJcbiAgICAvLyBQcmV0dHkgZmFsc2Ugd2lsbCBtYWtlIHRoZSBvdXRwdXQgbW9yZSBtYWNoaW5lIHJlYWRhYmxlLlxyXG4gICAgcmV0dXJuIGV4ZWN1dGUoICdub2RlJywgWyAnLi4vLi4vLi4vY2hpcHBlci9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC9iaW4vdHNjJywgJy0tcHJldHR5JywgJ2ZhbHNlJyBdLFxyXG4gICAgICBgJHt0aGlzLnJvb3REaXJ9L2NoaXBwZXIvdHNjb25maWcvYWxsYCwgRVhFQ1VURV9PUFRJT05TICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHtjb2RlOm51bWJlcixzdGRvdXQ6c3RyaW5nLHN0ZGVycjpzdHJpbmd9Pn1cclxuICAgKi9cclxuICBhc3luYyB0cmFuc3BpbGUoKSB7XHJcbiAgICB3aW5zdG9uLmluZm8oICdRdWlja1NlcnZlcjogdHJhbnNwaWxpbmcnICk7XHJcbiAgICByZXR1cm4gZXhlY3V0ZSggJ25vZGUnLCBbICdqcy9zY3JpcHRzL3RyYW5zcGlsZS5qcycgXSwgYCR7dGhpcy5yb290RGlyfS9jaGlwcGVyYCwgRVhFQ1VURV9PUFRJT05TICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZ3xudWxsPn1cclxuICAgKi9cclxuICBhc3luYyB0ZXN0U2ltRnV6eigpIHtcclxuICAgIHdpbnN0b24uaW5mbyggJ1F1aWNrU2VydmVyOiBzaW0gZnV6eicgKTtcclxuXHJcbiAgICBsZXQgc2ltRnV6eiA9IG51bGw7XHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCB3aXRoU2VydmVyKCBhc3luYyBwb3J0ID0+IHtcclxuICAgICAgICBjb25zdCB1cmwgPSBgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9LyR7RlVaWl9TSU19LyR7RlVaWl9TSU19X2VuLmh0bWw/YnJhbmQ9cGhldCZlYSZkZWJ1Z2dlciZmdXp6YDtcclxuICAgICAgICBhd2FpdCBwdXBwZXRlZXJMb2FkKCB1cmwsIHRoaXMucHVwcGV0ZWVyT3B0aW9ucyApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCggZSApIHtcclxuICAgICAgc2ltRnV6eiA9IGUudG9TdHJpbmcoKTtcclxuICAgIH1cclxuICAgIHJldHVybiBzaW1GdXp6O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmd8bnVsbD59XHJcbiAgICovXHJcbiAgYXN5bmMgdGVzdFN0dWRpb0Z1enooKSB7XHJcbiAgICB3aW5zdG9uLmluZm8oICdRdWlja1NlcnZlcjogc3R1ZGlvIGZ1enonICk7XHJcblxyXG4gICAgbGV0IHN0dWRpb0Z1enogPSBudWxsO1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgd2l0aFNlcnZlciggYXN5bmMgcG9ydCA9PiB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fS9zdHVkaW8vaW5kZXguaHRtbD9zaW09JHtTVFVESU9fRlVaWl9TSU19JnBoZXRpb0VsZW1lbnRzRGlzcGxheT1hbGwmZnV6eiZwaGV0aW9XcmFwcGVyRGVidWc9dHJ1ZWA7XHJcbiAgICAgICAgYXdhaXQgcHVwcGV0ZWVyTG9hZCggdXJsLCB0aGlzLnB1cHBldGVlck9wdGlvbnMgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgIHN0dWRpb0Z1enogPSBlLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3R1ZGlvRnV6ejtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gc3RhbGVSZXBvc1xyXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IGFsbFJlcG9zXHJcbiAgICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0PHN0cmluZyxzdHJpbmc+Pn0gLSBzaGFzIGZvciByZXBvc1xyXG4gICAqL1xyXG4gIGFzeW5jIHN5bmNocm9uaXplUmVwb3MoIHN0YWxlUmVwb3MsIGFsbFJlcG9zICkge1xyXG4gICAgZm9yICggY29uc3QgcmVwbyBvZiBzdGFsZVJlcG9zICkge1xyXG4gICAgICB3aW5zdG9uLmluZm8oIGBRdWlja1NlcnZlcjogcHVsbGluZyAke3JlcG99YCApO1xyXG4gICAgICBhd2FpdCBnaXRQdWxsKCByZXBvICk7XHJcbiAgICB9XHJcblxyXG4gICAgd2luc3Rvbi5pbmZvKCAnUXVpY2tTZXJ2ZXI6IGNsb25pbmcgbWlzc2luZyByZXBvcycgKTtcclxuICAgIGNvbnN0IGNsb25lZFJlcG9zID0gYXdhaXQgY2xvbmVNaXNzaW5nUmVwb3MoKTtcclxuXHJcbiAgICBmb3IgKCBjb25zdCByZXBvIG9mIFsgLi4uc3RhbGVSZXBvcywgLi4uY2xvbmVkUmVwb3MgXSApIHtcclxuICAgICAgaWYgKCBbICdjaGlwcGVyJywgJ3BlcmVubmlhbCcsICdwZXJlbm5pYWwtYWxpYXMnIF0uaW5jbHVkZXMoIHJlcG8gKSApIHtcclxuICAgICAgICB3aW5zdG9uLmluZm8oIGBRdWlja1NlcnZlcjogbnBtIHVwZGF0ZSAke3JlcG99YCApO1xyXG4gICAgICAgIGF3YWl0IG5wbVVwZGF0ZSggcmVwbyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgd2luc3Rvbi5pbmZvKCAnUXVpY2tTZXJ2ZXI6IGNoZWNraW5nIFNIQXMnICk7XHJcbiAgICBjb25zdCBzaGFzID0ge307XHJcbiAgICBmb3IgKCBjb25zdCByZXBvIG9mIGFsbFJlcG9zICkge1xyXG4gICAgICBzaGFzWyByZXBvIF0gPSBhd2FpdCBnaXRSZXZQYXJzZSggcmVwbywgJ21hc3RlcicgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQZXJpb2RpY2FsbHkgY2xlYW4gY2hpcHBlci9kaXN0LCBidXQgbm90IG9uIHRoZSBmaXJzdCB0aW1lIGZvciBlYXNpZXIgbG9jYWwgdGVzdGluZ1xyXG4gICAgLy8gSWYgQ1RRIHRha2VzIDEgbWludXRlIHRvIHJ1biwgdGhlbiB0aGlzIHdpbGwgaGFwcGVuIGV2ZXJ5IDE2IGhvdXJzIG9yIHNvLlxyXG4gICAgaWYgKCB0aGlzLnRlc3RDb3VudCsrICUgMTAwMCA9PT0gOTk5ICYmICF0aGlzLmlzVGVzdE1vZGUgKSB7XHJcbiAgICAgIGF3YWl0IGRlbGV0ZURpcmVjdG9yeSggYCR7dGhpcy5yb290RGlyfS9jaGlwcGVyL2Rpc3RgICk7XHJcbiAgICB9XHJcblxyXG4gICAgYXdhaXQgdGhpcy50cmFuc3BpbGUoKTtcclxuXHJcbiAgICByZXR1cm4gc2hhcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0YXJ0cyB0aGUgSFRUUCBzZXJ2ZXIgcGFydCAodGhhdCB3aWxsIGNvbm5lY3Qgd2l0aCBhbnkgcmVwb3J0aW5nIGZlYXR1cmVzKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcG9ydFxyXG4gICAqL1xyXG4gIHN0YXJ0U2VydmVyKCBwb3J0ICkge1xyXG4gICAgYXNzZXJ0KCB0eXBlb2YgcG9ydCA9PT0gJ251bWJlcicsICdwb3J0IHNob3VsZCBiZSBhIG51bWJlcicgKTtcclxuXHJcbiAgICAvLyBNYWluIHNlcnZlciBjcmVhdGlvblxyXG4gICAgaHR0cC5jcmVhdGVTZXJ2ZXIoICggcmVxLCByZXMgKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcmVxdWVzdEluZm8gPSB1cmwucGFyc2UoIHJlcS51cmwsIHRydWUgKTtcclxuXHJcbiAgICAgICAgaWYgKCByZXF1ZXN0SW5mby5wYXRobmFtZSA9PT0gJy9xdWlja3NlcnZlci9zdGF0dXMnICkge1xyXG4gICAgICAgICAgcmVzLndyaXRlSGVhZCggMjAwLCBqc29uSGVhZGVycyApO1xyXG4gICAgICAgICAgcmVzLmVuZCggSlNPTi5zdHJpbmdpZnkoIHRoaXMudGVzdGluZ1N0YXRlLCBudWxsLCAyICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgICAgd2luc3Rvbi5lcnJvciggYHNlcnZlciBlcnJvcjogJHtlfWAgKTtcclxuICAgICAgfVxyXG4gICAgfSApLmxpc3RlbiggcG9ydCApO1xyXG5cclxuICAgIHdpbnN0b24uaW5mbyggYFF1aWNrU2VydmVyOiBydW5uaW5nIG9uIHBvcnQgJHtwb3J0fWAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrcyB0aGUgZXJyb3IgbWVzc2FnZXMgYW5kIHJlcG9ydHMgdGhlIGN1cnJlbnQgc3RhdHVzIHRvIHRoZSBsb2dzIGFuZCBTbGFjay5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYnJva2VuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBhc3luYyByZXBvcnRFcnJvclN0YXR1cyggYnJva2VuICkge1xyXG5cclxuICAgIC8vIFJvYnVzdG5lc3MgaGFuZGxpbmcganVzdCBpbiBjYXNlIHRoZXJlIGFyZSBlcnJvcnMgdGhhdCBhcmUgdHJhY2tlZCBmcm9tIGxhc3QgYnJva2VuIHN0YXRlXHJcbiAgICBpZiAoICFicm9rZW4gKSB7XHJcbiAgICAgIHRoaXMuZXJyb3JNZXNzYWdlcy5sZW5ndGggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy5sYXN0QnJva2VuICYmICFicm9rZW4gKSB7XHJcbiAgICAgIHdpbnN0b24uaW5mbyggJ2Jyb2tlbiAtPiBwYXNzaW5nLCBzZW5kaW5nIENUUSBwYXNzaW5nIG1lc3NhZ2UgdG8gU2xhY2snICk7XHJcbiAgICAgIGF3YWl0IHRoaXMuc2xhY2tNZXNzYWdlKCAnQ1RRIHBhc3NpbmcnICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggIWJyb2tlbiAmJiB0aGlzLnRlc3RDb3VudCA9PT0gMSApIHtcclxuICAgICAgd2luc3Rvbi5pbmZvKCAnc3RhcnR1cCAtPiBwYXNzaW5nLCBzZW5kaW5nIENUUSBzdGFydHVwLXBhc3NpbmcgbWVzc2FnZSB0byBTbGFjaycgKTtcclxuICAgICAgYXdhaXQgdGhpcy5zbGFja01lc3NhZ2UoICdDVFEgc3RhcnRlZCB1cCBhbmQgcGFzc2luZycgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBicm9rZW4gKSB7XHJcbiAgICAgIGF3YWl0IHRoaXMuaGFuZGxlQnJva2VuU3RhdGUoKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB3aW5zdG9uLmluZm8oICdwYXNzaW5nIC0+IHBhc3NpbmcnICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGVuIGluIGEgYnJva2VuIHN0YXRlLCBoYW5kbGUgYWxsIGNhc2VzIHRoYXQgbWF5IG9jY3VyOlxyXG4gICAqIC0gTmV3bHkgYnJva2VuIChyZXBvcnQgZXZlcnl0aGluZylcclxuICAgKiAtIFNhbWUgYnJva2VuIGFzIGxhc3Qgc3RhdGUgKHJlcG9ydCBub3RoaW5nKVxyXG4gICAqIC0gU29tZSBuZXcgaXRlbXMgYXJlIGJyb2tlbiAocmVwb3J0IG9ubHkgbmV3IHRoaW5ncylcclxuICAgKiAtIFNvbWUgcHJldmlvdXNseSBicm9rZW4gaXRlbXMgaGF2ZSBiZWVuIGZpeGVkICh1cGRhdGUgaW50ZXJuYWwgc3RhdGUgYnV0IG5vIG5ldyByZXBvcnRpbmcpXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGFzeW5jIGhhbmRsZUJyb2tlblN0YXRlKCkge1xyXG5cclxuICAgIC8vIFRoZSBtZXNzYWdlIHJlcG9ydGVkIHRvIHNsYWNrLCBkZXBlbmRpbmcgb24gb3VyIHN0YXRlXHJcbiAgICBsZXQgbWVzc2FnZSA9ICcnO1xyXG5cclxuICAgIC8vIE51bWJlciBvZiBlcnJvcnMgdGhhdCB3ZXJlIG5vdCBpbiB0aGUgcHJldmlvdXMgYnJva2VuIHN0YXRlXHJcbiAgICBsZXQgbmV3RXJyb3JDb3VudCA9IDA7XHJcblxyXG4gICAgLy8gS2VlcCB0cmFjayBvZiB0aGUgcHJldmlvdXMgZXJyb3JzIHRoYXQgc3RpbGwgZXhpc3Qgc28gd2UgZG9uJ3QgZHVwbGljYXRlIHJlcG9ydGluZ1xyXG4gICAgY29uc3QgcHJldmlvdXNFcnJvcnNGb3VuZCA9IFtdO1xyXG5cclxuICAgIGNvbnN0IGNoZWNrRm9yTmV3RXJyb3JzID0gdGVzdFJlc3VsdCA9PiB7XHJcbiAgICAgICF0ZXN0UmVzdWx0LnBhc3NlZCAmJiB0ZXN0UmVzdWx0LmVycm9yTWVzc2FnZXMuZm9yRWFjaCggZXJyb3JNZXNzYWdlID0+IHtcclxuXHJcbiAgICAgICAgbGV0IGlzUHJlZXhpc3RpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5lcnJvck1lc3NhZ2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgY29uc3QgcHJlZXhpc3RpbmdFcnJvck1lc3NhZ2UgPSB0aGlzLmVycm9yTWVzc2FnZXNbIGkgXTtcclxuXHJcbiAgICAgICAgICAvLyBSZW1vdmUgc3BhY2VzIGZvciBhIGJpdCBtb3JlIG1haW50YWluYWJpbGl0eSBpbiBjYXNlIHRoZSBzcGFjaW5nIG9mIGVycm9ycyBjaGFuZ2VzIGZvciBhbiBvdXRzaWRlIHJlYXNvblxyXG4gICAgICAgICAgaWYgKCBwcmVleGlzdGluZ0Vycm9yTWVzc2FnZS5yZXBsYWNlKCAvXFxzL2csICcnICkgPT09IGVycm9yTWVzc2FnZS5yZXBsYWNlKCAvXFxzL2csICcnICkgKSB7XHJcbiAgICAgICAgICAgIGlzUHJlZXhpc3RpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIHRoaXMgbWVzc2FnZSBtYXRjaGVzIGFueSB3ZSBjdXJyZW50bHkgaGF2ZVxyXG4gICAgICAgIGlmICggaXNQcmVleGlzdGluZyApIHtcclxuICAgICAgICAgIHByZXZpb3VzRXJyb3JzRm91bmQucHVzaCggZXJyb3JNZXNzYWdlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5lcnJvck1lc3NhZ2VzLnB1c2goIGVycm9yTWVzc2FnZSApO1xyXG4gICAgICAgICAgbWVzc2FnZSArPSBgXFxuJHtlcnJvck1lc3NhZ2V9YDtcclxuICAgICAgICAgIG5ld0Vycm9yQ291bnQrKztcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gU2VlIGlmIHRoZXJlIGFyZSBhbnkgbmV3IGVycm9ycyBpbiBvdXIgdGVzdHNcclxuICAgIE9iamVjdC5rZXlzKCB0aGlzLnRlc3RpbmdTdGF0ZS50ZXN0cyApLmZvckVhY2goIHRlc3RLZXlOYW1lID0+IGNoZWNrRm9yTmV3RXJyb3JzKCB0aGlzLnRlc3RpbmdTdGF0ZS50ZXN0c1sgdGVzdEtleU5hbWUgXSApICk7XHJcblxyXG4gICAgaWYgKCBtZXNzYWdlLmxlbmd0aCA+IDAgKSB7XHJcblxyXG4gICAgICBpZiAoIHByZXZpb3VzRXJyb3JzRm91bmQubGVuZ3RoIHx8IHRoaXMubGFzdEJyb2tlbiApIHtcclxuICAgICAgICB3aW5zdG9uLmluZm8oICdicm9rZW4gLT4gbW9yZSBicm9rZW4sIHNlbmRpbmcgYWRkaXRpb25hbCBDVFEgZmFpbHVyZSBtZXNzYWdlIHRvIFNsYWNrJyApO1xyXG4gICAgICAgIGNvbnN0IHNGb3JGYWlsdXJlID0gbmV3RXJyb3JDb3VudCA+IDEgPyAncycgOiAnJztcclxuICAgICAgICBtZXNzYWdlID0gYENUUSBhZGRpdGlvbmFsIGZhaWx1cmUke3NGb3JGYWlsdXJlfTpcXG5cXGBcXGBcXGAke21lc3NhZ2V9XFxgXFxgXFxgYDtcclxuXHJcbiAgICAgICAgaWYgKCBwcmV2aW91c0Vycm9yc0ZvdW5kLmxlbmd0aCApIHtcclxuICAgICAgICAgIGFzc2VydCggdGhpcy5sYXN0QnJva2VuLCAnTGFzdCBjeWNsZSBtdXN0IGJlIGJyb2tlbiBpZiBwcmUtZXhpc3RpbmcgZXJyb3JzIHdlcmUgZm91bmQnICk7XHJcbiAgICAgICAgICBjb25zdCBzRm9yRXJyb3IgPSBwcmV2aW91c0Vycm9yc0ZvdW5kLmxlbmd0aCA+IDEgPyAncycgOiAnJztcclxuICAgICAgICAgIGNvbnN0IHNGb3JSZW1haW4gPSBwcmV2aW91c0Vycm9yc0ZvdW5kLmxlbmd0aCA9PT0gMSA/ICdzJyA6ICcnO1xyXG4gICAgICAgICAgbWVzc2FnZSArPSBgXFxuJHtwcmV2aW91c0Vycm9yc0ZvdW5kLmxlbmd0aH0gcHJlLWV4aXN0aW5nIGVycm9yJHtzRm9yRXJyb3J9IHJlbWFpbiR7c0ZvclJlbWFpbn0uYDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBhc3NlcnQoIHRoaXMubGFzdEJyb2tlbiwgJ0xhc3QgY3ljbGUgbXVzdCBiZSBicm9rZW4gaWYgbm8gcHJlLWV4aXN0aW5nIGVycm9ycyB3ZXJlIGZvdW5kIGFuZCB5b3UgbWFkZSBpdCBoZXJlJyApO1xyXG4gICAgICAgICAgbWVzc2FnZSArPSAnXFxuQWxsIG90aGVyIHByZS1leGlzdGluZyBlcnJvcnMgZml4ZWQuJztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgd2luc3Rvbi5pbmZvKCAncGFzc2luZyAtPiBicm9rZW4sIHNlbmRpbmcgQ1RRIGZhaWx1cmUgbWVzc2FnZSB0byBTbGFjaycgKTtcclxuICAgICAgICBtZXNzYWdlID0gJ0NUUSBmYWlsaW5nOlxcbmBgYCcgKyBtZXNzYWdlICsgJ2BgYCc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGF3YWl0IHRoaXMuc2xhY2tNZXNzYWdlKCBtZXNzYWdlLCB0aGlzLmlzVGVzdE1vZGUgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB3aW5zdG9uLmluZm8oICdicm9rZW4gLT4gYnJva2VuLCBubyBuZXcgZmFpbHVyZXMgdG8gcmVwb3J0IHRvIFNsYWNrJyApO1xyXG4gICAgICBhc3NlcnQoIG5ld0Vycm9yQ291bnQgPT09IDAsICdObyBuZXcgZXJyb3JzIGlmIG5vIG1lc3NhZ2UnICk7XHJcbiAgICAgIGFzc2VydCggcHJldmlvdXNFcnJvcnNGb3VuZC5sZW5ndGgsICdQcmV2aW91cyBlcnJvcnMgbXVzdCBleGlzdCBpZiBubyBuZXcgZXJyb3JzIGFyZSBmb3VuZCBhbmQgQ1RRIGlzIHN0aWxsIGJyb2tlbicgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHNlbmQgYSBtZXNzYWdlIHRvIHNsYWNrLCB3aXRoIGVycm9yIGhhbmRsaW5nXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VcclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGFzeW5jIHNsYWNrTWVzc2FnZSggbWVzc2FnZSApIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHdpbnN0b24uaW5mbyggYFNlbmRpbmcgdG8gc2xhY2s6ICR7bWVzc2FnZX1gICk7XHJcbiAgICAgIGF3YWl0IHNlbmRTbGFja01lc3NhZ2UoIG1lc3NhZ2UsIHRoaXMuaXNUZXN0TW9kZSApO1xyXG4gICAgfVxyXG4gICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgIHdpbnN0b24uaW5mbyggYFNsYWNrIGVycm9yOiAke2V9YCApO1xyXG4gICAgICBjb25zb2xlLmVycm9yKCBlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZXN1bHRcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxyXG4gICAqIEByZXR1cm5zIHt7ZXJyb3JNZXNzYWdlczogc3RyaW5nW10sIHBhc3NlZDogYm9vbGVhbiwgbWVzc2FnZTogc3RyaW5nfX1cclxuICAgKi9cclxuICBleGVjdXRlUmVzdWx0VG9UZXN0RGF0YSggcmVzdWx0LCBuYW1lICkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcGFzc2VkOiByZXN1bHQuY29kZSA9PT0gMCxcclxuXHJcbiAgICAgIC8vIGZ1bGwgbGVuZ3RoIG1lc3NhZ2UsIHVzZWQgd2hlbiBzb21lb25lIGNsaWNrcyBvbiBhIHF1aWNrTm9kZSBpbiBDVCBmb3IgZXJyb3IgZGV0YWlsc1xyXG4gICAgICBtZXNzYWdlOiBgY29kZTogJHtyZXN1bHQuY29kZX1cXG5zdGRvdXQ6XFxuJHtyZXN1bHQuc3Rkb3V0fVxcbnN0ZGVycjpcXG4ke3Jlc3VsdC5zdGRlcnJ9YCxcclxuXHJcbiAgICAgIC8vIHRyaW1tZWQgZG93biBhbmQgc2VwYXJhdGVkIGVycm9yIG1lc3NhZ2VzLCB1c2VkIHRvIHRyYWNrIHRoZSBzdGF0ZSBvZiBpbmRpdmlkdWFsIGVycm9ycyBhbmQgc2hvd1xyXG4gICAgICAvLyBhYmJyZXZpYXRlZCBlcnJvcnMgZm9yIHRoZSBTbGFjayBDVCBOb3RpZmllclxyXG4gICAgICBlcnJvck1lc3NhZ2VzOiByZXN1bHQuY29kZSA9PT0gMCA/IFtdIDogdGhpcy5wYXJzZUNvbXBvc2l0ZUVycm9yKCByZXN1bHQuc3Rkb3V0LCBuYW1lLCByZXN1bHQuc3RkZXJyIClcclxuICAgIH07XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVzdWx0XHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcclxuICAgKiBAcmV0dXJucyB7e2Vycm9yTWVzc2FnZXM6IHN0cmluZ1tdLCBwYXNzZWQ6IGJvb2xlYW4sIG1lc3NhZ2U6IHN0cmluZ319XHJcbiAgICovXHJcbiAgZnV6elJlc3VsdFRvVGVzdERhdGEoIHJlc3VsdCwgbmFtZSApIHtcclxuICAgIGlmICggcmVzdWx0ID09PSBudWxsICkge1xyXG4gICAgICByZXR1cm4geyBwYXNzZWQ6IHRydWUsIG1lc3NhZ2U6ICcnLCBlcnJvck1lc3NhZ2VzOiBbXSB9O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBXZSB3YW50IHRvIHJlbW92ZSB0aGUgXCJwb3J0XCIgdmFyaWF0aW9uIHNvIHRoYXQgdGhlIHNhbWUgc2ltIGVycm9yIGhhcyB0aGUgc2FtZSBlcnJvciBtZXNzYWdlXHJcbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKCAvbG9jYWxob3N0OlxcZCsvZywgJ2xvY2FsaG9zdDo4MDgwJyApO1xyXG4gICAgICByZXR1cm4geyBwYXNzZWQ6IGZhbHNlLCBtZXNzYWdlOiAnJyArIHJlc3VsdCwgZXJyb3JNZXNzYWdlczogdGhpcy5wYXJzZUNvbXBvc2l0ZUVycm9yKCByZXN1bHQsIG5hbWUgKSB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgc3BsaXRBbmRUcmltTWVzc2FnZSggbWVzc2FnZSApIHtcclxuICAgIHJldHVybiBtZXNzYWdlLnNwbGl0KCAvXFxyP1xcbi8gKS5tYXAoIGxpbmUgPT4gbGluZS50cmltKCkgKS5maWx0ZXIoIGxpbmUgPT4gbGluZS5sZW5ndGggPiAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQYXJzZXMgaW5kaXZpZHVhbCBlcnJvcnMgb3V0IG9mIGEgY29sbGVjdGlvbiBvZiB0aGUgc2FtZSB0eXBlIG9mIGVycm9yLCBlLmcuIGxpbnRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RkZXJyIC0gaWYgdGhlIGVycm9yIGlzIGluIHRoZSBydW5uaW5nIHByb2Nlc3MsIGFuZCBub3QgdGhlIHJlcG9ydFxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmdbXX1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHBhcnNlQ29tcG9zaXRlRXJyb3IoIG1lc3NhZ2UsIG5hbWUsIHN0ZGVyciA9ICcnICkge1xyXG4gICAgY29uc3QgZXJyb3JNZXNzYWdlcyA9IFtdO1xyXG5cclxuICAgIC8vIElmIHRoZXJlIGlzIHN0ZGVyciBmcm9tIGEgcHJvY2VzcywgYXNzdW1lIHRoYXQgbWVhbnMgdGhlcmUgd2FzIGEgcHJvYmxlbSBjb25kdWN0aW5nIHRoZSB0ZXN0LCBhbmQgaWdub3JlIHRoZSBtZXNzYWdlXHJcbiAgICBpZiAoIHN0ZGVyciApIHtcclxuICAgICAgZXJyb3JNZXNzYWdlcy5wdXNoKCBgZXJyb3IgdGVzdGluZyAke25hbWV9OiAke3N0ZGVycn1gICk7XHJcbiAgICAgIHJldHVybiBlcnJvck1lc3NhZ2VzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1vc3QgbGludCBhbmQgdHNjIGVycm9ycyBoYXZlIGEgZmlsZSBhc3NvY2lhdGVkIHdpdGggdGhlbS4gbG9vayBmb3IgdGhlbSBpbiBhIGxpbmUgdmlhIDQgc2V0cyBvZiBzbGFzaGVzXHJcbiAgICAvLyBFeHRlbnNpb25zIHNob3VsZCBtYXRjaCB0aG9zZSBmb3VuZCBpbiBDSElQUEVSL2xpbnRcclxuICAgIC8vIERvbid0IG1hdGNoIHRvIHRoZSBlbmQgb2YgdGhlIGxpbmUgKCQpLCAgYmVjYXVzZSB0c2MgcHV0cyB0aGUgZmlsZSBhbmQgZXJyb3Igb24gdGhlIHNhbWUgbGluZS5cclxuICAgIGNvbnN0IGZpbGVOYW1lUmVnZXggPSAvXlteXFxzXSooW1xcXFwvXVteL1xcXFxdKyl7NH1bXlxcc10qKFxcLmpzfFxcLnRzfFxcLmpzeHxcXC50c3h8XFwuY2pzfFxcLm1qcykvO1xyXG4gICAgY29uc3QgbGludFByb2JsZW1SZWdleCA9IC9eXFxkKzpcXGQrXFxzK2Vycm9yXFxzLzsgLy8gcm93OmNvbHVtbiBlcnJvciB7e0VSUk9SfX1cclxuXHJcbiAgICBpZiAoIG5hbWUgPT09IGN0cVR5cGUuTElOVCApIHtcclxuICAgICAgbGV0IGN1cnJlbnRGaWxlbmFtZSA9IG51bGw7XHJcblxyXG4gICAgICAvLyBUaGlzIG1lc3NhZ2UgaXMgZHVwbGljYXRlZCBpbiBDSElQUEVSL2xpbnQsIHBsZWFzZSBjaGFuZ2UgY2F1dGlvdXNseS5cclxuICAgICAgY29uc3QgSU1QT1JUQU5UX01FU1NBR0UgPSAnQWxsIHJlc3VsdHMgKHJlcGVhdGVkIGZyb20gYWJvdmUpJztcclxuICAgICAgYXNzZXJ0KCBtZXNzYWdlLmluY2x1ZGVzKCBJTVBPUlRBTlRfTUVTU0FHRSApLCAnZXhwZWN0ZWQgZm9ybWF0dGluZyBmcm9tIGxpbnQgJyArIG1lc3NhZ2UgKTtcclxuICAgICAgbWVzc2FnZSA9IG1lc3NhZ2Uuc3BsaXQoIElNUE9SVEFOVF9NRVNTQUdFIClbIDEgXS50cmltKCk7XHJcblxyXG4gICAgICAvLyBzcGxpdCB1cCB0aGUgZXJyb3IgbWVzc2FnZSBieSBsaW5lIGZvciBwYXJzaW5nXHJcbiAgICAgIGNvbnN0IG1lc3NhZ2VMaW5lcyA9IHRoaXMuc3BsaXRBbmRUcmltTWVzc2FnZSggbWVzc2FnZSApO1xyXG5cclxuICAgICAgLy8gTG9vayBmb3IgYSBmaWxlbmFtZS4gb25jZSBmb3VuZCwgYWxsIHN1YnNlcXVlbnQgbGluZXMgYXJlIGFuIGluZGl2aWR1YWwgZXJyb3JzIHRvIGFkZCB1bnRpbCB0aGUgbmV4dCBmaWxlbmFtZSBpcyByZWFjaGVkXHJcbiAgICAgIG1lc3NhZ2VMaW5lcy5mb3JFYWNoKCBsaW5lID0+IHtcclxuICAgICAgICBpZiAoIGN1cnJlbnRGaWxlbmFtZSApIHtcclxuXHJcbiAgICAgICAgICAvLyBBc3N1bWVzIGhlcmUgdGhhdCBhbGwgcHJvYmxlbXMgYXJlIGRpcmVjdGx5IGJlbG93IHRoZSBmaWxlbmFtZSAobm8gd2hpdGUgc3BhY2VzKVxyXG4gICAgICAgICAgaWYgKCBsaW50UHJvYmxlbVJlZ2V4LnRlc3QoIGxpbmUgKSApIHtcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlcy5wdXNoKCBgbGludDogJHtjdXJyZW50RmlsZW5hbWV9IC0tICR7bGluZX1gICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudEZpbGVuYW1lID0gbnVsbDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICggIWN1cnJlbnRGaWxlbmFtZSAmJiBmaWxlTmFtZVJlZ2V4LnRlc3QoIGxpbmUgKSApIHtcclxuICAgICAgICAgIGN1cnJlbnRGaWxlbmFtZSA9IGxpbmUubWF0Y2goIGZpbGVOYW1lUmVnZXggKVsgMCBdO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIG5hbWUgPT09IGN0cVR5cGUuVFNDICkge1xyXG5cclxuICAgICAgLy8gc3BsaXQgdXAgdGhlIGVycm9yIG1lc3NhZ2UgYnkgbGluZSBmb3IgcGFyc2luZ1xyXG4gICAgICBjb25zdCBtZXNzYWdlTGluZXMgPSB0aGlzLnNwbGl0QW5kVHJpbU1lc3NhZ2UoIG1lc3NhZ2UgKTtcclxuXHJcbiAgICAgIC8vIFNvbWUgZXJyb3JzIHNwYW4gbXVsdGlwbGUgbGluZXMsIGxpa2UgYSBzdGFjaywgYnV0IGVhY2ggbmV3IGVycm9yIHN0YXJ0cyB3aXRoIGEgZmlsZS9yb3cvY29sdW1uL2Vycm9yIG51bWJlclxyXG4gICAgICBsZXQgY3VycmVudEVycm9yID0gJyc7XHJcbiAgICAgIGNvbnN0IGFkZEN1cnJlbnRFcnJvciA9ICgpID0+IHtcclxuICAgICAgICBpZiAoIGN1cnJlbnRFcnJvci5sZW5ndGggKSB7XHJcbiAgICAgICAgICBlcnJvck1lc3NhZ2VzLnB1c2goIGN1cnJlbnRFcnJvciApO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIGxvb2sgZm9yIGEgZmlsZW5hbWUuIGlmIGZvdW5kLCBhbGwgc3Vic2VxdWVudCBsaW5lcyB0aGF0IGRvbid0IGNvbnRhaW4gZmlsZW5hbWVzIGFyZSBwYXJ0IG9mIHRoZSBzYW1lIGVycm9yIHRvXHJcbiAgICAgIC8vIGFkZCB1bnRpbCBhIG5ldyBmaWxlbmFtZSBsaW5lIGlzIGZvdW5kXHJcbiAgICAgIG1lc3NhZ2VMaW5lcy5mb3JFYWNoKCBsaW5lID0+IHtcclxuICAgICAgICBpZiAoIGZpbGVOYW1lUmVnZXgudGVzdCggbGluZSApICkge1xyXG4gICAgICAgICAgYWRkQ3VycmVudEVycm9yKCk7XHJcblxyXG4gICAgICAgICAgY3VycmVudEVycm9yID0gYHRzYzogJHtsaW5lfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgY3VycmVudEVycm9yICs9IGBcXG4ke2xpbmV9YDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIFB1c2ggdGhlIGZpbmFsIGVycm9yIGZpbGVcclxuICAgICAgYWRkQ3VycmVudEVycm9yKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgd2UgYXJlIG5vdCBhIGxpbnQgb3IgdHNjIGVycm9yLCBvciBpZiB0aG9zZSBlcnJvcnMgd2VyZSBub3QgYWJsZSB0byBiZSBwYXJzZWQgYWJvdmUsIHNlbmQgdGhlIHdob2xlIG1lc3NhZ2VcclxuICAgIGlmICggIWVycm9yTWVzc2FnZXMubGVuZ3RoICkge1xyXG4gICAgICBlcnJvck1lc3NhZ2VzLnB1c2goIGAke25hbWV9OiAke21lc3NhZ2V9YCApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGVycm9yTWVzc2FnZXM7XHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFF1aWNrU2VydmVyO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLGlCQUFpQixHQUFHQyxPQUFPLENBQUUsZ0RBQWlELENBQUM7QUFDckYsTUFBTUMsZUFBZSxHQUFHRCxPQUFPLENBQUUsOENBQStDLENBQUM7QUFDakYsTUFBTUUsT0FBTyxHQUFHRixPQUFPLENBQUUsc0NBQXVDLENBQUM7QUFDakUsTUFBTUcsV0FBVyxHQUFHSCxPQUFPLENBQUUsMENBQTJDLENBQUM7QUFDekUsTUFBTUksT0FBTyxHQUFHSixPQUFPLENBQUUsc0NBQXVDLENBQUM7QUFDakUsTUFBTUssV0FBVyxHQUFHTCxPQUFPLENBQUUsMENBQTJDLENBQUM7QUFDekUs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