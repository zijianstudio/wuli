// Copyright 2022-2023, University of Colorado Boulder

/**
 * A Node script that handles multiple browser clients for Continuous Testing's server. This file uses Workers to kick
 * off instances of Puppeteer that will load the continuous-loop. This file is hard coded to point to bayes via https,
 * and will need to be updated if that URL is no longer correct.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

const _ = require('lodash');
const path = require('path');
const assert = require('assert');
const {
  Worker
} = require('worker_threads'); // eslint-disable-line require-statement-match
const sleep = require('../../../perennial/js/common/sleep');
process.on('SIGINT', () => process.exit(0));
class ContinuousServerClient {
  constructor(options) {
    options = {
      // Path to the root of PhET git repos (relative to this file)
      rootDir: path.normalize(`${__dirname}/../../../`),
      // How many instances (worker threads) should be created?
      numberOfPuppeteers: 8,
      numberOfFirefoxes: 0,
      ctID: 'Sparky',
      serverURL: 'https://sparky.colorado.edu/',
      ...options
    };

    // @public {string} - root of your GitHub working copy, relative to the name of the directory that the
    // currently-executing script resides in
    this.rootDir = options.rootDir;
    this.numberOfPuppeteers = options.numberOfPuppeteers;
    this.numberOfFirefoxes = options.numberOfFirefoxes;
    this.ctID = options.ctID;
    this.serverURL = options.serverURL;
    this.firefoxWorkers = [];
    this.puppeteerWorkers = [];
  }

  /**
   * Kick off a worker, add it to a list, and when complete, remove it from that list
   * @private
   * @param {Worker[]} workerList
   * @param {number} workerNumber
   * @param {string} clientScriptName
   * @returns {Promise<unknown>}
   */
  newClientWorker(workerList, workerNumber, clientScriptName = 'puppeteerCTClient.js') {
    console.log(`Worker${workerNumber} new instance`);
    const worker = new Worker(`${this.rootDir}/aqua/js/server/${clientScriptName}`, {
      argv: [this.ctID, this.serverURL]
    });
    workerList.push(worker);
    worker.on('message', message => {
      console.log(`Worker${workerNumber} Message from puppeteerClient:`, message);
    });
    worker.on('error', e => {
      console.error(`Worker${workerNumber} Error from puppeteerClient:`, e);
    });
    worker.on('exit', code => {
      console.log(`Worker${workerNumber} instance complete`);
      const index = _.indexOf(workerList, worker);
      assert(index !== -1, 'worker must be in list');
      workerList.splice(index, 1);
      if (code !== 0) {
        console.error(`Worker${workerNumber} stopped with exit code ${code}`);
      }
    });
  }

  /**
   * @public
   */
  async startMainLoop() {
    let count = 0;
    console.log(`Starting up ${this.numberOfPuppeteers} test browsers`);
    console.log(`ctID: ${this.ctID}`);
    console.log(`serverURL: ${this.serverURL}`);
    while (true) {
      // eslint-disable-line no-constant-condition

      // Always keep this many workers chugging away
      while (this.puppeteerWorkers.length < this.numberOfPuppeteers) {
        this.newClientWorker(this.puppeteerWorkers, count++);
      }
      // Always keep this many workers chugging away
      while (this.firefoxWorkers.length < this.numberOfFirefoxes) {
        this.newClientWorker(this.firefoxWorkers, count++, 'playwrightCTClient.js');
      }

      // Check back in every 5 seconds to see if we need to restart any workers.
      await sleep(5000);
    }
  }
}
module.exports = ContinuousServerClient;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsInBhdGgiLCJhc3NlcnQiLCJXb3JrZXIiLCJzbGVlcCIsInByb2Nlc3MiLCJvbiIsImV4aXQiLCJDb250aW51b3VzU2VydmVyQ2xpZW50IiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwicm9vdERpciIsIm5vcm1hbGl6ZSIsIl9fZGlybmFtZSIsIm51bWJlck9mUHVwcGV0ZWVycyIsIm51bWJlck9mRmlyZWZveGVzIiwiY3RJRCIsInNlcnZlclVSTCIsImZpcmVmb3hXb3JrZXJzIiwicHVwcGV0ZWVyV29ya2VycyIsIm5ld0NsaWVudFdvcmtlciIsIndvcmtlckxpc3QiLCJ3b3JrZXJOdW1iZXIiLCJjbGllbnRTY3JpcHROYW1lIiwiY29uc29sZSIsImxvZyIsIndvcmtlciIsImFyZ3YiLCJwdXNoIiwibWVzc2FnZSIsImUiLCJlcnJvciIsImNvZGUiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJzdGFydE1haW5Mb29wIiwiY291bnQiLCJsZW5ndGgiLCJtb2R1bGUiLCJleHBvcnRzIl0sInNvdXJjZXMiOlsiQ29udGludW91c1NlcnZlckNsaWVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIE5vZGUgc2NyaXB0IHRoYXQgaGFuZGxlcyBtdWx0aXBsZSBicm93c2VyIGNsaWVudHMgZm9yIENvbnRpbnVvdXMgVGVzdGluZydzIHNlcnZlci4gVGhpcyBmaWxlIHVzZXMgV29ya2VycyB0byBraWNrXHJcbiAqIG9mZiBpbnN0YW5jZXMgb2YgUHVwcGV0ZWVyIHRoYXQgd2lsbCBsb2FkIHRoZSBjb250aW51b3VzLWxvb3AuIFRoaXMgZmlsZSBpcyBoYXJkIGNvZGVkIHRvIHBvaW50IHRvIGJheWVzIHZpYSBodHRwcyxcclxuICogYW5kIHdpbGwgbmVlZCB0byBiZSB1cGRhdGVkIGlmIHRoYXQgVVJMIGlzIG5vIGxvbmdlciBjb3JyZWN0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuY29uc3QgXyA9IHJlcXVpcmUoICdsb2Rhc2gnICk7XHJcbmNvbnN0IHBhdGggPSByZXF1aXJlKCAncGF0aCcgKTtcclxuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSggJ2Fzc2VydCcgKTtcclxuY29uc3QgeyBXb3JrZXIgfSA9IHJlcXVpcmUoICd3b3JrZXJfdGhyZWFkcycgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZXF1aXJlLXN0YXRlbWVudC1tYXRjaFxyXG5jb25zdCBzbGVlcCA9IHJlcXVpcmUoICcuLi8uLi8uLi9wZXJlbm5pYWwvanMvY29tbW9uL3NsZWVwJyApO1xyXG5cclxucHJvY2Vzcy5vbiggJ1NJR0lOVCcsICgpID0+IHByb2Nlc3MuZXhpdCggMCApICk7XHJcblxyXG5jbGFzcyBDb250aW51b3VzU2VydmVyQ2xpZW50IHtcclxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0ge1xyXG5cclxuICAgICAgLy8gUGF0aCB0byB0aGUgcm9vdCBvZiBQaEVUIGdpdCByZXBvcyAocmVsYXRpdmUgdG8gdGhpcyBmaWxlKVxyXG4gICAgICByb290RGlyOiBwYXRoLm5vcm1hbGl6ZSggYCR7X19kaXJuYW1lfS8uLi8uLi8uLi9gICksXHJcblxyXG4gICAgICAvLyBIb3cgbWFueSBpbnN0YW5jZXMgKHdvcmtlciB0aHJlYWRzKSBzaG91bGQgYmUgY3JlYXRlZD9cclxuICAgICAgbnVtYmVyT2ZQdXBwZXRlZXJzOiA4LFxyXG4gICAgICBudW1iZXJPZkZpcmVmb3hlczogMCxcclxuICAgICAgY3RJRDogJ1NwYXJreScsXHJcbiAgICAgIHNlcnZlclVSTDogJ2h0dHBzOi8vc3Bhcmt5LmNvbG9yYWRvLmVkdS8nLFxyXG4gICAgICAuLi5vcHRpb25zXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ30gLSByb290IG9mIHlvdXIgR2l0SHViIHdvcmtpbmcgY29weSwgcmVsYXRpdmUgdG8gdGhlIG5hbWUgb2YgdGhlIGRpcmVjdG9yeSB0aGF0IHRoZVxyXG4gICAgLy8gY3VycmVudGx5LWV4ZWN1dGluZyBzY3JpcHQgcmVzaWRlcyBpblxyXG4gICAgdGhpcy5yb290RGlyID0gb3B0aW9ucy5yb290RGlyO1xyXG5cclxuICAgIHRoaXMubnVtYmVyT2ZQdXBwZXRlZXJzID0gb3B0aW9ucy5udW1iZXJPZlB1cHBldGVlcnM7XHJcbiAgICB0aGlzLm51bWJlck9mRmlyZWZveGVzID0gb3B0aW9ucy5udW1iZXJPZkZpcmVmb3hlcztcclxuICAgIHRoaXMuY3RJRCA9IG9wdGlvbnMuY3RJRDtcclxuICAgIHRoaXMuc2VydmVyVVJMID0gb3B0aW9ucy5zZXJ2ZXJVUkw7XHJcblxyXG4gICAgdGhpcy5maXJlZm94V29ya2VycyA9IFtdO1xyXG4gICAgdGhpcy5wdXBwZXRlZXJXb3JrZXJzID0gW107XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBLaWNrIG9mZiBhIHdvcmtlciwgYWRkIGl0IHRvIGEgbGlzdCwgYW5kIHdoZW4gY29tcGxldGUsIHJlbW92ZSBpdCBmcm9tIHRoYXQgbGlzdFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIHtXb3JrZXJbXX0gd29ya2VyTGlzdFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3b3JrZXJOdW1iZXJcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gY2xpZW50U2NyaXB0TmFtZVxyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHVua25vd24+fVxyXG4gICAqL1xyXG4gIG5ld0NsaWVudFdvcmtlciggd29ya2VyTGlzdCwgd29ya2VyTnVtYmVyLCBjbGllbnRTY3JpcHROYW1lID0gJ3B1cHBldGVlckNUQ2xpZW50LmpzJyApIHtcclxuXHJcbiAgICBjb25zb2xlLmxvZyggYFdvcmtlciR7d29ya2VyTnVtYmVyfSBuZXcgaW5zdGFuY2VgICk7XHJcblxyXG4gICAgY29uc3Qgd29ya2VyID0gbmV3IFdvcmtlciggYCR7dGhpcy5yb290RGlyfS9hcXVhL2pzL3NlcnZlci8ke2NsaWVudFNjcmlwdE5hbWV9YCwge1xyXG4gICAgICBhcmd2OiBbIHRoaXMuY3RJRCwgdGhpcy5zZXJ2ZXJVUkwgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIHdvcmtlckxpc3QucHVzaCggd29ya2VyICk7XHJcblxyXG4gICAgd29ya2VyLm9uKCAnbWVzc2FnZScsIG1lc3NhZ2UgPT4geyBjb25zb2xlLmxvZyggYFdvcmtlciR7d29ya2VyTnVtYmVyfSBNZXNzYWdlIGZyb20gcHVwcGV0ZWVyQ2xpZW50OmAsIG1lc3NhZ2UgKTsgfSApO1xyXG4gICAgd29ya2VyLm9uKCAnZXJyb3InLCBlID0+IHsgY29uc29sZS5lcnJvciggYFdvcmtlciR7d29ya2VyTnVtYmVyfSBFcnJvciBmcm9tIHB1cHBldGVlckNsaWVudDpgLCBlICk7IH0gKTtcclxuICAgIHdvcmtlci5vbiggJ2V4aXQnLCBjb2RlID0+IHtcclxuICAgICAgY29uc29sZS5sb2coIGBXb3JrZXIke3dvcmtlck51bWJlcn0gaW5zdGFuY2UgY29tcGxldGVgICk7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gXy5pbmRleE9mKCB3b3JrZXJMaXN0LCB3b3JrZXIgKTtcclxuICAgICAgYXNzZXJ0KCBpbmRleCAhPT0gLTEsICd3b3JrZXIgbXVzdCBiZSBpbiBsaXN0JyApO1xyXG4gICAgICB3b3JrZXJMaXN0LnNwbGljZSggaW5kZXgsIDEgKTtcclxuICAgICAgaWYgKCBjb2RlICE9PSAwICkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoIGBXb3JrZXIke3dvcmtlck51bWJlcn0gc3RvcHBlZCB3aXRoIGV4aXQgY29kZSAke2NvZGV9YCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYXN5bmMgc3RhcnRNYWluTG9vcCgpIHtcclxuXHJcbiAgICBsZXQgY291bnQgPSAwO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKCBgU3RhcnRpbmcgdXAgJHt0aGlzLm51bWJlck9mUHVwcGV0ZWVyc30gdGVzdCBicm93c2Vyc2AgKTtcclxuICAgIGNvbnNvbGUubG9nKCBgY3RJRDogJHt0aGlzLmN0SUR9YCApO1xyXG4gICAgY29uc29sZS5sb2coIGBzZXJ2ZXJVUkw6ICR7dGhpcy5zZXJ2ZXJVUkx9YCApO1xyXG5cclxuICAgIHdoaWxlICggdHJ1ZSApIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zdGFudC1jb25kaXRpb25cclxuXHJcbiAgICAgIC8vIEFsd2F5cyBrZWVwIHRoaXMgbWFueSB3b3JrZXJzIGNodWdnaW5nIGF3YXlcclxuICAgICAgd2hpbGUgKCB0aGlzLnB1cHBldGVlcldvcmtlcnMubGVuZ3RoIDwgdGhpcy5udW1iZXJPZlB1cHBldGVlcnMgKSB7XHJcbiAgICAgICAgdGhpcy5uZXdDbGllbnRXb3JrZXIoIHRoaXMucHVwcGV0ZWVyV29ya2VycywgY291bnQrKyApO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIEFsd2F5cyBrZWVwIHRoaXMgbWFueSB3b3JrZXJzIGNodWdnaW5nIGF3YXlcclxuICAgICAgd2hpbGUgKCB0aGlzLmZpcmVmb3hXb3JrZXJzLmxlbmd0aCA8IHRoaXMubnVtYmVyT2ZGaXJlZm94ZXMgKSB7XHJcbiAgICAgICAgdGhpcy5uZXdDbGllbnRXb3JrZXIoIHRoaXMuZmlyZWZveFdvcmtlcnMsIGNvdW50KyssICdwbGF5d3JpZ2h0Q1RDbGllbnQuanMnICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIGJhY2sgaW4gZXZlcnkgNSBzZWNvbmRzIHRvIHNlZSBpZiB3ZSBuZWVkIHRvIHJlc3RhcnQgYW55IHdvcmtlcnMuXHJcbiAgICAgIGF3YWl0IHNsZWVwKCA1MDAwICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENv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