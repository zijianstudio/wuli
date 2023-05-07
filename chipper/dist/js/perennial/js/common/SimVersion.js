// Copyright 2017-2020, University of Colorado Boulder

/**
 * Handles serializing and deserializing versions for simulations.
 *
 * See https://github.com/phetsims/chipper/issues/560 for discussion on version ID definition.
 *
 * The canonical description of our general versions:
 *
 * Each version string has the form: {{MAJOR}}.{{MINOR}}.{{MAINTENANCE}}[-{{TEST_TYPE}}.{{TEST_NUMBER}}] where:
 *
 * MAJOR: Sequential integer, starts at 1, and is generally incremented when there are significant changes to a simulation.
 * MINOR: Sequential integer, starts at 0, and is generally incremented when there are smaller changes to a simulation.
 *   Resets to 0 whenever the major number is incremented.
 * MAINTENANCE: Sequential integer, starts at 0, and is incremented whenever we build with the same major/minor (but with different SHAs).
 *   Resets to 0 whenever the minor number is incremented.
 * TEST_TYPE (when present): Indicates that this is a non-production build when present. Typically will take the values:
 *   'dev' - A normal dev deployment, which goes to phet-dev.colorado.edu/html/
 *   'rc' -  A release-candidate deployment (off of a release branch). Also goes to phet-dev.colorado.edu/html/ only.
 *   anything else - A one-off deployment name, which is the same name as the branch it was deployed from.
 * TEST_NUMBER (when present): Indicates the version of the test/one-off type (gets incremented for every deployment).
 *   starts at 0 in package.json, but since it is incremented on every deploy, the first version published will be 1.
 *
 * It used to be (pre-chipper-2.0) that sometimes a shortened form of the (non-'phet') brand would be added to the end
 * (e.g. '1.3.0-dev.1-phetio' or '1.3.0-dev.1-adaptedfromphet'), or as a direct prefix for the TEST_TYPE (e.g.
 * 1.1.0-phetiodev.1 or 1.1.0-phetio). We have since moved to a deployment model where there are
 * subdirectories for each brand, so this is no longer part of the version. Since this was not used for any production sim
 * builds that we need statistics from, it is excluded in SimVersion.js or its description.
 *
 * Examples:
 *
 * 1.5.0                - Production simulation version (no test type). Major = 1, minor = 5, maintenance = 0
 * 1.5.0-rc.1           - Example of a release-candidate build version that would be published before '1.5.0' for testing.
 * 1.5.0-dev.1          - Example of a dev build that would be from master.
 * 1.5.0-sonification.1 - Example of a one-off build (which would be from the branch 'sonification')
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

/* eslint-env browser, node */

(function (global) {
  // To support loading in Node.js and the browser
  const assert = typeof module !== 'undefined' ? require('assert') : global && global.assert;
  const SimVersion = class {
    /**
     * @constructor
     *
     * @param {number|string} major - The major part of the version (the 3 in 3.1.2)
     * @param {number|string} minor - The minor part of the version (the 1 in 3.1.2)
     * @param {number|string} maintenance - The maintenance part of the version (the 2 in 3.1.2)
     * @param {Object} [options]
     */
    constructor(major, minor, maintenance, options = {}) {
      if (typeof major === 'string') {
        major = Number(major);
      }
      if (typeof minor === 'string') {
        minor = Number(minor);
      }
      if (typeof maintenance === 'string') {
        maintenance = Number(maintenance);
      }
      if (typeof options.testNumber === 'string') {
        options.testNumber = Number(options.testNumber);
      }
      const {
        // {string|null} - If provided, indicates the time at which the sim file was built
        buildTimestamp = null,
        // {string|null} - The test name, e.g. the 'rc' in rc.1. Also can be the one-off version name, if provided.
        testType = null,
        // {number|string|null} - The test number, e.g. the 1 in rc.1
        testNumber = null
      } = options;
      assert && assert(typeof major === 'number' && major >= 0 && major % 1 === 0, 'major version should be a non-negative integer');
      assert && assert(typeof minor === 'number' && minor >= 0 && minor % 1 === 0, 'minor version should be a non-negative integer');
      assert && assert(typeof maintenance === 'number' && maintenance >= 0 && maintenance % 1 === 0, 'maintenance version should be a non-negative integer');
      assert && assert(typeof testType !== 'string' || typeof testNumber === 'number', 'if testType is provided, testNumber should be a number');

      // @public {number}
      this.major = major;

      // @public {number}
      this.minor = minor;

      // @public {number}
      this.maintenance = maintenance;

      // @public {string|null}
      this.testType = testType;

      // @public {number|null}
      this.testNumber = testNumber;

      // @public {string|null} - If provided, like '2015-06-12 16:05:03 UTC' (phet.chipper.buildTimestamp)
      this.buildTimestamp = buildTimestamp;
    }

    /**
     * Convert into a plain JS object meant for JSON serialization.
     * @public
     *
     * @returns {Object}
     */
    serialize() {
      return {
        major: this.major,
        minor: this.minor,
        maintenance: this.maintenance,
        testType: this.testType,
        testNumber: this.testNumber,
        buildTimestamp: this.buildTimestamp
      };
    }

    /**
     * @returns {boolean}
     * @public
     */
    get isSimNotPublished() {
      return this.major < 1 ||
      // e.g. 0.0.0-dev.1
      this.major === 1 &&
      // e.g. 1.0.0-dev.1
      this.minor === 0 && this.maintenance === 0 && this.testType;
    }

    /**
     * @returns {boolean}
     * @public
     */
    get isSimPublished() {
      return !this.isSimNotPublished;
    }

    /**
     * Takes a serialized form of the SimVersion and returns an actual instance.
     * @public
     *
     * @param {Object}
     * @returns {SimVersion}
     */
    static deserialize({
      major,
      minor,
      maintenance,
      testType,
      testNumber,
      buildTimestamp
    }) {
      return new SimVersion(major, minor, maintenance, {
        testType: testType,
        testNumber: testNumber,
        buildTimestamp: buildTimestamp
      });
    }

    /**
     * Compares versions, returning -1 if this version is before the passed in version, 0 if equal, or 1 if this version
     * is after.
     * @public
     *
     * This function only compares major/minor/maintenance, leaving other details to the client.
     *
     * @param {SimVersion} version
     */
    compareNumber(version) {
      return SimVersion.comparator(this, version);
    }

    /**
     * Compares versions in standard "comparator" static format, returning -1 if the first parameter SimVersion is
     * before the second parameter SimVersion in version-string, 0 if equal, or 1 if the first parameter SimVersion is
     * after.
     * @public
     *
     * This function only compares major/minor/maintenance, leaving other details to the client.
     *
     * @param {SimVersion} a
     * @param {SimVersion} b
     */
    static comparator(a, b) {
      if (a.major < b.major) {
        return -1;
      }
      if (a.major > b.major) {
        return 1;
      }
      if (a.minor < b.minor) {
        return -1;
      }
      if (a.minor > b.minor) {
        return 1;
      }
      if (a.maintenance < b.maintenance) {
        return -1;
      }
      if (a.maintenance > b.maintenance) {
        return 1;
      }
      return 0; // equal
    }

    /**
     * Returns true if the specified version is strictly after this version
     * @param {SimVersion} version
     * @returns {boolean}
     * @public
     */
    isAfter(version) {
      return this.compareNumber(version) === 1;
    }

    /**
     * Returns true if the specified version matches or comes before this version.
     * @param version
     * @returns {boolean}
     * @public
     */
    isBeforeOrEqualTo(version) {
      return this.compareNumber(version) <= 0;
    }

    /**
     * Returns the string form of the version.
     * @public
     *
     * @returns {string}
     */
    toString() {
      let str = `${this.major}.${this.minor}.${this.maintenance}`;
      if (typeof this.testType === 'string') {
        str += `-${this.testType}.${this.testNumber}`;
      }
      return str;
    }

    /**
     * Parses a sim version from a string form.
     * @public
     *
     * @param {string} versionString - e.g. '1.0.0', '1.0.1-dev.3', etc.
     * @param {string} [buildTimestamp] - Optional build timestamp, like '2015-06-12 16:05:03 UTC' (phet.chipper.buildTimestamp)
     * @returns {SimVersion}
     */
    static parse(versionString, buildTimestamp) {
      const matches = versionString.match(/^(\d+)\.(\d+)\.(\d+)(-(([^.-]+)\.(\d+)))?(-([^.-]+))?$/);
      if (!matches) {
        throw new Error(`could not parse version: ${versionString}`);
      }
      const major = Number(matches[1]);
      const minor = Number(matches[2]);
      const maintenance = Number(matches[3]);
      const testType = matches[6];
      const testNumber = matches[7] === undefined ? matches[7] : Number(matches[7]);
      return new SimVersion(major, minor, maintenance, {
        testType: testType,
        testNumber: testNumber,
        buildTimestamp: buildTimestamp
      });
    }

    /**
     * Parses a branch in the form {{MAJOR}}.{{MINOR}} and returns a corresponding version. Uses 0 for the maintenance version (unknown).
     * @public
     *
     * @param {string} branch - e.g. '1.0'
     * @returns {SimVersion}
     */
    static fromBranch(branch) {
      const bits = branch.split('.');
      assert && assert(bits.length === 2, `Bad branch, should be {{MAJOR}}.{{MINOR}}, had: ${branch}`);
      const major = Number(branch.split('.')[0]);
      const minor = Number(branch.split('.')[1]);
      return new SimVersion(major, minor, 0);
    }

    /**
     * Ensures that a branch name is ok to be a release branch.
     * @public
     *
     * @param {string} branch - e.g. '1.0'
     */
    static ensureReleaseBranch(branch) {
      const version = SimVersion.fromBranch(branch.split('-')[0]);
      assert && assert(version.major > 0, 'Major version for a branch should be greater than zero');
      assert && assert(version.minor >= 0, 'Minor version for a branch should be greater than (or equal) to zero');
    }
  };

  // Node.js-compatible definition
  if (typeof module !== 'undefined') {
    module.exports = SimVersion;
  } else {
    // Browser support, assign with
    window.phet = window.phet || {};
    window.phet.preloads = window.phet.preloads || {};
    window.phet.preloads.chipper = window.phet.preloads.chipper || {};
    window.phet.preloads.chipper.SimVersion = SimVersion;
  }
})((1, eval)('this')); // eslint-disable-line no-eval
// Indirect eval usage done since babel likes to wrap things in strict mode.
// See http://perfectionkills.com/unnecessarily-comprehensive-look-into-a-rather-insignificant-issue-of-global-objects-creation/#ecmascript_5_strict_mode
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnbG9iYWwiLCJhc3NlcnQiLCJtb2R1bGUiLCJyZXF1aXJlIiwiU2ltVmVyc2lvbiIsImNvbnN0cnVjdG9yIiwibWFqb3IiLCJtaW5vciIsIm1haW50ZW5hbmNlIiwib3B0aW9ucyIsIk51bWJlciIsInRlc3ROdW1iZXIiLCJidWlsZFRpbWVzdGFtcCIsInRlc3RUeXBlIiwic2VyaWFsaXplIiwiaXNTaW1Ob3RQdWJsaXNoZWQiLCJpc1NpbVB1Ymxpc2hlZCIsImRlc2VyaWFsaXplIiwiY29tcGFyZU51bWJlciIsInZlcnNpb24iLCJjb21wYXJhdG9yIiwiYSIsImIiLCJpc0FmdGVyIiwiaXNCZWZvcmVPckVxdWFsVG8iLCJ0b1N0cmluZyIsInN0ciIsInBhcnNlIiwidmVyc2lvblN0cmluZyIsIm1hdGNoZXMiLCJtYXRjaCIsIkVycm9yIiwidW5kZWZpbmVkIiwiZnJvbUJyYW5jaCIsImJyYW5jaCIsImJpdHMiLCJzcGxpdCIsImxlbmd0aCIsImVuc3VyZVJlbGVhc2VCcmFuY2giLCJleHBvcnRzIiwid2luZG93IiwicGhldCIsInByZWxvYWRzIiwiY2hpcHBlciIsImV2YWwiXSwic291cmNlcyI6WyJTaW1WZXJzaW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEhhbmRsZXMgc2VyaWFsaXppbmcgYW5kIGRlc2VyaWFsaXppbmcgdmVyc2lvbnMgZm9yIHNpbXVsYXRpb25zLlxyXG4gKlxyXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzU2MCBmb3IgZGlzY3Vzc2lvbiBvbiB2ZXJzaW9uIElEIGRlZmluaXRpb24uXHJcbiAqXHJcbiAqIFRoZSBjYW5vbmljYWwgZGVzY3JpcHRpb24gb2Ygb3VyIGdlbmVyYWwgdmVyc2lvbnM6XHJcbiAqXHJcbiAqIEVhY2ggdmVyc2lvbiBzdHJpbmcgaGFzIHRoZSBmb3JtOiB7e01BSk9SfX0ue3tNSU5PUn19Lnt7TUFJTlRFTkFOQ0V9fVste3tURVNUX1RZUEV9fS57e1RFU1RfTlVNQkVSfX1dIHdoZXJlOlxyXG4gKlxyXG4gKiBNQUpPUjogU2VxdWVudGlhbCBpbnRlZ2VyLCBzdGFydHMgYXQgMSwgYW5kIGlzIGdlbmVyYWxseSBpbmNyZW1lbnRlZCB3aGVuIHRoZXJlIGFyZSBzaWduaWZpY2FudCBjaGFuZ2VzIHRvIGEgc2ltdWxhdGlvbi5cclxuICogTUlOT1I6IFNlcXVlbnRpYWwgaW50ZWdlciwgc3RhcnRzIGF0IDAsIGFuZCBpcyBnZW5lcmFsbHkgaW5jcmVtZW50ZWQgd2hlbiB0aGVyZSBhcmUgc21hbGxlciBjaGFuZ2VzIHRvIGEgc2ltdWxhdGlvbi5cclxuICogICBSZXNldHMgdG8gMCB3aGVuZXZlciB0aGUgbWFqb3IgbnVtYmVyIGlzIGluY3JlbWVudGVkLlxyXG4gKiBNQUlOVEVOQU5DRTogU2VxdWVudGlhbCBpbnRlZ2VyLCBzdGFydHMgYXQgMCwgYW5kIGlzIGluY3JlbWVudGVkIHdoZW5ldmVyIHdlIGJ1aWxkIHdpdGggdGhlIHNhbWUgbWFqb3IvbWlub3IgKGJ1dCB3aXRoIGRpZmZlcmVudCBTSEFzKS5cclxuICogICBSZXNldHMgdG8gMCB3aGVuZXZlciB0aGUgbWlub3IgbnVtYmVyIGlzIGluY3JlbWVudGVkLlxyXG4gKiBURVNUX1RZUEUgKHdoZW4gcHJlc2VudCk6IEluZGljYXRlcyB0aGF0IHRoaXMgaXMgYSBub24tcHJvZHVjdGlvbiBidWlsZCB3aGVuIHByZXNlbnQuIFR5cGljYWxseSB3aWxsIHRha2UgdGhlIHZhbHVlczpcclxuICogICAnZGV2JyAtIEEgbm9ybWFsIGRldiBkZXBsb3ltZW50LCB3aGljaCBnb2VzIHRvIHBoZXQtZGV2LmNvbG9yYWRvLmVkdS9odG1sL1xyXG4gKiAgICdyYycgLSAgQSByZWxlYXNlLWNhbmRpZGF0ZSBkZXBsb3ltZW50IChvZmYgb2YgYSByZWxlYXNlIGJyYW5jaCkuIEFsc28gZ29lcyB0byBwaGV0LWRldi5jb2xvcmFkby5lZHUvaHRtbC8gb25seS5cclxuICogICBhbnl0aGluZyBlbHNlIC0gQSBvbmUtb2ZmIGRlcGxveW1lbnQgbmFtZSwgd2hpY2ggaXMgdGhlIHNhbWUgbmFtZSBhcyB0aGUgYnJhbmNoIGl0IHdhcyBkZXBsb3llZCBmcm9tLlxyXG4gKiBURVNUX05VTUJFUiAod2hlbiBwcmVzZW50KTogSW5kaWNhdGVzIHRoZSB2ZXJzaW9uIG9mIHRoZSB0ZXN0L29uZS1vZmYgdHlwZSAoZ2V0cyBpbmNyZW1lbnRlZCBmb3IgZXZlcnkgZGVwbG95bWVudCkuXHJcbiAqICAgc3RhcnRzIGF0IDAgaW4gcGFja2FnZS5qc29uLCBidXQgc2luY2UgaXQgaXMgaW5jcmVtZW50ZWQgb24gZXZlcnkgZGVwbG95LCB0aGUgZmlyc3QgdmVyc2lvbiBwdWJsaXNoZWQgd2lsbCBiZSAxLlxyXG4gKlxyXG4gKiBJdCB1c2VkIHRvIGJlIChwcmUtY2hpcHBlci0yLjApIHRoYXQgc29tZXRpbWVzIGEgc2hvcnRlbmVkIGZvcm0gb2YgdGhlIChub24tJ3BoZXQnKSBicmFuZCB3b3VsZCBiZSBhZGRlZCB0byB0aGUgZW5kXHJcbiAqIChlLmcuICcxLjMuMC1kZXYuMS1waGV0aW8nIG9yICcxLjMuMC1kZXYuMS1hZGFwdGVkZnJvbXBoZXQnKSwgb3IgYXMgYSBkaXJlY3QgcHJlZml4IGZvciB0aGUgVEVTVF9UWVBFIChlLmcuXHJcbiAqIDEuMS4wLXBoZXRpb2Rldi4xIG9yIDEuMS4wLXBoZXRpbykuIFdlIGhhdmUgc2luY2UgbW92ZWQgdG8gYSBkZXBsb3ltZW50IG1vZGVsIHdoZXJlIHRoZXJlIGFyZVxyXG4gKiBzdWJkaXJlY3RvcmllcyBmb3IgZWFjaCBicmFuZCwgc28gdGhpcyBpcyBubyBsb25nZXIgcGFydCBvZiB0aGUgdmVyc2lvbi4gU2luY2UgdGhpcyB3YXMgbm90IHVzZWQgZm9yIGFueSBwcm9kdWN0aW9uIHNpbVxyXG4gKiBidWlsZHMgdGhhdCB3ZSBuZWVkIHN0YXRpc3RpY3MgZnJvbSwgaXQgaXMgZXhjbHVkZWQgaW4gU2ltVmVyc2lvbi5qcyBvciBpdHMgZGVzY3JpcHRpb24uXHJcbiAqXHJcbiAqIEV4YW1wbGVzOlxyXG4gKlxyXG4gKiAxLjUuMCAgICAgICAgICAgICAgICAtIFByb2R1Y3Rpb24gc2ltdWxhdGlvbiB2ZXJzaW9uIChubyB0ZXN0IHR5cGUpLiBNYWpvciA9IDEsIG1pbm9yID0gNSwgbWFpbnRlbmFuY2UgPSAwXHJcbiAqIDEuNS4wLXJjLjEgICAgICAgICAgIC0gRXhhbXBsZSBvZiBhIHJlbGVhc2UtY2FuZGlkYXRlIGJ1aWxkIHZlcnNpb24gdGhhdCB3b3VsZCBiZSBwdWJsaXNoZWQgYmVmb3JlICcxLjUuMCcgZm9yIHRlc3RpbmcuXHJcbiAqIDEuNS4wLWRldi4xICAgICAgICAgIC0gRXhhbXBsZSBvZiBhIGRldiBidWlsZCB0aGF0IHdvdWxkIGJlIGZyb20gbWFzdGVyLlxyXG4gKiAxLjUuMC1zb25pZmljYXRpb24uMSAtIEV4YW1wbGUgb2YgYSBvbmUtb2ZmIGJ1aWxkICh3aGljaCB3b3VsZCBiZSBmcm9tIHRoZSBicmFuY2ggJ3NvbmlmaWNhdGlvbicpXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG4vKiBlc2xpbnQtZW52IGJyb3dzZXIsIG5vZGUgKi9cclxuXHJcbiggZnVuY3Rpb24oIGdsb2JhbCApIHtcclxuXHJcbiAgLy8gVG8gc3VwcG9ydCBsb2FkaW5nIGluIE5vZGUuanMgYW5kIHRoZSBicm93c2VyXHJcbiAgY29uc3QgYXNzZXJ0ID0gdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyByZXF1aXJlKCAnYXNzZXJ0JyApIDogZ2xvYmFsICYmIGdsb2JhbC5hc3NlcnQ7XHJcblxyXG4gIGNvbnN0IFNpbVZlcnNpb24gPSBjbGFzcyB7XHJcbiAgICAvKipcclxuICAgICAqIEBjb25zdHJ1Y3RvclxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfHN0cmluZ30gbWFqb3IgLSBUaGUgbWFqb3IgcGFydCBvZiB0aGUgdmVyc2lvbiAodGhlIDMgaW4gMy4xLjIpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcnxzdHJpbmd9IG1pbm9yIC0gVGhlIG1pbm9yIHBhcnQgb2YgdGhlIHZlcnNpb24gKHRoZSAxIGluIDMuMS4yKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ8c3RyaW5nfSBtYWludGVuYW5jZSAtIFRoZSBtYWludGVuYW5jZSBwYXJ0IG9mIHRoZSB2ZXJzaW9uICh0aGUgMiBpbiAzLjEuMilcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoIG1ham9yLCBtaW5vciwgbWFpbnRlbmFuY2UsIG9wdGlvbnMgPSB7fSApIHtcclxuXHJcbiAgICAgIGlmICggdHlwZW9mIG1ham9yID09PSAnc3RyaW5nJyApIHtcclxuICAgICAgICBtYWpvciA9IE51bWJlciggbWFqb3IgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHR5cGVvZiBtaW5vciA9PT0gJ3N0cmluZycgKSB7XHJcbiAgICAgICAgbWlub3IgPSBOdW1iZXIoIG1pbm9yICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCB0eXBlb2YgbWFpbnRlbmFuY2UgPT09ICdzdHJpbmcnICkge1xyXG4gICAgICAgIG1haW50ZW5hbmNlID0gTnVtYmVyKCBtYWludGVuYW5jZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggdHlwZW9mIG9wdGlvbnMudGVzdE51bWJlciA9PT0gJ3N0cmluZycgKSB7XHJcbiAgICAgICAgb3B0aW9ucy50ZXN0TnVtYmVyID0gTnVtYmVyKCBvcHRpb25zLnRlc3ROdW1iZXIgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qge1xyXG4gICAgICAgIC8vIHtzdHJpbmd8bnVsbH0gLSBJZiBwcm92aWRlZCwgaW5kaWNhdGVzIHRoZSB0aW1lIGF0IHdoaWNoIHRoZSBzaW0gZmlsZSB3YXMgYnVpbHRcclxuICAgICAgICBidWlsZFRpbWVzdGFtcCA9IG51bGwsXHJcblxyXG4gICAgICAgIC8vIHtzdHJpbmd8bnVsbH0gLSBUaGUgdGVzdCBuYW1lLCBlLmcuIHRoZSAncmMnIGluIHJjLjEuIEFsc28gY2FuIGJlIHRoZSBvbmUtb2ZmIHZlcnNpb24gbmFtZSwgaWYgcHJvdmlkZWQuXHJcbiAgICAgICAgdGVzdFR5cGUgPSBudWxsLFxyXG5cclxuICAgICAgICAvLyB7bnVtYmVyfHN0cmluZ3xudWxsfSAtIFRoZSB0ZXN0IG51bWJlciwgZS5nLiB0aGUgMSBpbiByYy4xXHJcbiAgICAgICAgdGVzdE51bWJlciA9IG51bGxcclxuICAgICAgfSA9IG9wdGlvbnM7XHJcblxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbWFqb3IgPT09ICdudW1iZXInICYmIG1ham9yID49IDAgJiYgbWFqb3IgJSAxID09PSAwLCAnbWFqb3IgdmVyc2lvbiBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG1pbm9yID09PSAnbnVtYmVyJyAmJiBtaW5vciA+PSAwICYmIG1pbm9yICUgMSA9PT0gMCwgJ21pbm9yIHZlcnNpb24gc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXInICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBtYWludGVuYW5jZSA9PT0gJ251bWJlcicgJiYgbWFpbnRlbmFuY2UgPj0gMCAmJiBtYWludGVuYW5jZSAlIDEgPT09IDAsICdtYWludGVuYW5jZSB2ZXJzaW9uIHNob3VsZCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyJyApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdGVzdFR5cGUgIT09ICdzdHJpbmcnIHx8IHR5cGVvZiB0ZXN0TnVtYmVyID09PSAnbnVtYmVyJywgJ2lmIHRlc3RUeXBlIGlzIHByb3ZpZGVkLCB0ZXN0TnVtYmVyIHNob3VsZCBiZSBhIG51bWJlcicgKTtcclxuXHJcbiAgICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgICAgdGhpcy5tYWpvciA9IG1ham9yO1xyXG5cclxuICAgICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgICB0aGlzLm1pbm9yID0gbWlub3I7XHJcblxyXG4gICAgICAvLyBAcHVibGljIHtudW1iZXJ9XHJcbiAgICAgIHRoaXMubWFpbnRlbmFuY2UgPSBtYWludGVuYW5jZTtcclxuXHJcbiAgICAgIC8vIEBwdWJsaWMge3N0cmluZ3xudWxsfVxyXG4gICAgICB0aGlzLnRlc3RUeXBlID0gdGVzdFR5cGU7XHJcblxyXG4gICAgICAvLyBAcHVibGljIHtudW1iZXJ8bnVsbH1cclxuICAgICAgdGhpcy50ZXN0TnVtYmVyID0gdGVzdE51bWJlcjtcclxuXHJcbiAgICAgIC8vIEBwdWJsaWMge3N0cmluZ3xudWxsfSAtIElmIHByb3ZpZGVkLCBsaWtlICcyMDE1LTA2LTEyIDE2OjA1OjAzIFVUQycgKHBoZXQuY2hpcHBlci5idWlsZFRpbWVzdGFtcClcclxuICAgICAgdGhpcy5idWlsZFRpbWVzdGFtcCA9IGJ1aWxkVGltZXN0YW1wO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCBpbnRvIGEgcGxhaW4gSlMgb2JqZWN0IG1lYW50IGZvciBKU09OIHNlcmlhbGl6YXRpb24uXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge09iamVjdH1cclxuICAgICAqL1xyXG4gICAgc2VyaWFsaXplKCkge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIG1ham9yOiB0aGlzLm1ham9yLFxyXG4gICAgICAgIG1pbm9yOiB0aGlzLm1pbm9yLFxyXG4gICAgICAgIG1haW50ZW5hbmNlOiB0aGlzLm1haW50ZW5hbmNlLFxyXG4gICAgICAgIHRlc3RUeXBlOiB0aGlzLnRlc3RUeXBlLFxyXG4gICAgICAgIHRlc3ROdW1iZXI6IHRoaXMudGVzdE51bWJlcixcclxuICAgICAgICBidWlsZFRpbWVzdGFtcDogdGhpcy5idWlsZFRpbWVzdGFtcFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIGdldCBpc1NpbU5vdFB1Ymxpc2hlZCgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMubWFqb3IgPCAxIHx8IC8vIGUuZy4gMC4wLjAtZGV2LjFcclxuICAgICAgICAgICAgICggdGhpcy5tYWpvciA9PT0gMSAmJiAvLyBlLmcuIDEuMC4wLWRldi4xXHJcbiAgICAgICAgICAgICAgIHRoaXMubWlub3IgPT09IDAgJiZcclxuICAgICAgICAgICAgICAgdGhpcy5tYWludGVuYW5jZSA9PT0gMCAmJlxyXG4gICAgICAgICAgICAgICB0aGlzLnRlc3RUeXBlICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgZ2V0IGlzU2ltUHVibGlzaGVkKCkge1xyXG4gICAgICByZXR1cm4gIXRoaXMuaXNTaW1Ob3RQdWJsaXNoZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUYWtlcyBhIHNlcmlhbGl6ZWQgZm9ybSBvZiB0aGUgU2ltVmVyc2lvbiBhbmQgcmV0dXJucyBhbiBhY3R1YWwgaW5zdGFuY2UuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9XHJcbiAgICAgKiBAcmV0dXJucyB7U2ltVmVyc2lvbn1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGRlc2VyaWFsaXplKCB7IG1ham9yLCBtaW5vciwgbWFpbnRlbmFuY2UsIHRlc3RUeXBlLCB0ZXN0TnVtYmVyLCBidWlsZFRpbWVzdGFtcCB9ICkge1xyXG4gICAgICByZXR1cm4gbmV3IFNpbVZlcnNpb24oIG1ham9yLCBtaW5vciwgbWFpbnRlbmFuY2UsIHtcclxuICAgICAgICB0ZXN0VHlwZTogdGVzdFR5cGUsXHJcbiAgICAgICAgdGVzdE51bWJlcjogdGVzdE51bWJlcixcclxuICAgICAgICBidWlsZFRpbWVzdGFtcDogYnVpbGRUaW1lc3RhbXBcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29tcGFyZXMgdmVyc2lvbnMsIHJldHVybmluZyAtMSBpZiB0aGlzIHZlcnNpb24gaXMgYmVmb3JlIHRoZSBwYXNzZWQgaW4gdmVyc2lvbiwgMCBpZiBlcXVhbCwgb3IgMSBpZiB0aGlzIHZlcnNpb25cclxuICAgICAqIGlzIGFmdGVyLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIFRoaXMgZnVuY3Rpb24gb25seSBjb21wYXJlcyBtYWpvci9taW5vci9tYWludGVuYW5jZSwgbGVhdmluZyBvdGhlciBkZXRhaWxzIHRvIHRoZSBjbGllbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtTaW1WZXJzaW9ufSB2ZXJzaW9uXHJcbiAgICAgKi9cclxuICAgIGNvbXBhcmVOdW1iZXIoIHZlcnNpb24gKSB7XHJcbiAgICAgIHJldHVybiBTaW1WZXJzaW9uLmNvbXBhcmF0b3IoIHRoaXMsIHZlcnNpb24gKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbXBhcmVzIHZlcnNpb25zIGluIHN0YW5kYXJkIFwiY29tcGFyYXRvclwiIHN0YXRpYyBmb3JtYXQsIHJldHVybmluZyAtMSBpZiB0aGUgZmlyc3QgcGFyYW1ldGVyIFNpbVZlcnNpb24gaXNcclxuICAgICAqIGJlZm9yZSB0aGUgc2Vjb25kIHBhcmFtZXRlciBTaW1WZXJzaW9uIGluIHZlcnNpb24tc3RyaW5nLCAwIGlmIGVxdWFsLCBvciAxIGlmIHRoZSBmaXJzdCBwYXJhbWV0ZXIgU2ltVmVyc2lvbiBpc1xyXG4gICAgICogYWZ0ZXIuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogVGhpcyBmdW5jdGlvbiBvbmx5IGNvbXBhcmVzIG1ham9yL21pbm9yL21haW50ZW5hbmNlLCBsZWF2aW5nIG90aGVyIGRldGFpbHMgdG8gdGhlIGNsaWVudC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1NpbVZlcnNpb259IGFcclxuICAgICAqIEBwYXJhbSB7U2ltVmVyc2lvbn0gYlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY29tcGFyYXRvciggYSwgYiApIHtcclxuICAgICAgaWYgKCBhLm1ham9yIDwgYi5tYWpvciApIHsgcmV0dXJuIC0xOyB9XHJcbiAgICAgIGlmICggYS5tYWpvciA+IGIubWFqb3IgKSB7IHJldHVybiAxOyB9XHJcbiAgICAgIGlmICggYS5taW5vciA8IGIubWlub3IgKSB7IHJldHVybiAtMTsgfVxyXG4gICAgICBpZiAoIGEubWlub3IgPiBiLm1pbm9yICkgeyByZXR1cm4gMTsgfVxyXG4gICAgICBpZiAoIGEubWFpbnRlbmFuY2UgPCBiLm1haW50ZW5hbmNlICkgeyByZXR1cm4gLTE7IH1cclxuICAgICAgaWYgKCBhLm1haW50ZW5hbmNlID4gYi5tYWludGVuYW5jZSApIHsgcmV0dXJuIDE7IH1cclxuICAgICAgcmV0dXJuIDA7IC8vIGVxdWFsXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNwZWNpZmllZCB2ZXJzaW9uIGlzIHN0cmljdGx5IGFmdGVyIHRoaXMgdmVyc2lvblxyXG4gICAgICogQHBhcmFtIHtTaW1WZXJzaW9ufSB2ZXJzaW9uXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgaXNBZnRlciggdmVyc2lvbiApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY29tcGFyZU51bWJlciggdmVyc2lvbiApID09PSAxO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBtYXRjaGVzIG9yIGNvbWVzIGJlZm9yZSB0aGlzIHZlcnNpb24uXHJcbiAgICAgKiBAcGFyYW0gdmVyc2lvblxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIGlzQmVmb3JlT3JFcXVhbFRvKCB2ZXJzaW9uICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5jb21wYXJlTnVtYmVyKCB2ZXJzaW9uICkgPD0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHN0cmluZyBmb3JtIG9mIHRoZSB2ZXJzaW9uLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHRvU3RyaW5nKCkge1xyXG4gICAgICBsZXQgc3RyID0gYCR7dGhpcy5tYWpvcn0uJHt0aGlzLm1pbm9yfS4ke3RoaXMubWFpbnRlbmFuY2V9YDtcclxuICAgICAgaWYgKCB0eXBlb2YgdGhpcy50ZXN0VHlwZSA9PT0gJ3N0cmluZycgKSB7XHJcbiAgICAgICAgc3RyICs9IGAtJHt0aGlzLnRlc3RUeXBlfS4ke3RoaXMudGVzdE51bWJlcn1gO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzdHI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZXMgYSBzaW0gdmVyc2lvbiBmcm9tIGEgc3RyaW5nIGZvcm0uXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZlcnNpb25TdHJpbmcgLSBlLmcuICcxLjAuMCcsICcxLjAuMS1kZXYuMycsIGV0Yy5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbYnVpbGRUaW1lc3RhbXBdIC0gT3B0aW9uYWwgYnVpbGQgdGltZXN0YW1wLCBsaWtlICcyMDE1LTA2LTEyIDE2OjA1OjAzIFVUQycgKHBoZXQuY2hpcHBlci5idWlsZFRpbWVzdGFtcClcclxuICAgICAqIEByZXR1cm5zIHtTaW1WZXJzaW9ufVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgcGFyc2UoIHZlcnNpb25TdHJpbmcsIGJ1aWxkVGltZXN0YW1wICkge1xyXG4gICAgICBjb25zdCBtYXRjaGVzID0gdmVyc2lvblN0cmluZy5tYXRjaCggL14oXFxkKylcXC4oXFxkKylcXC4oXFxkKykoLSgoW14uLV0rKVxcLihcXGQrKSkpPygtKFteLi1dKykpPyQvICk7XHJcblxyXG4gICAgICBpZiAoICFtYXRjaGVzICkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvciggYGNvdWxkIG5vdCBwYXJzZSB2ZXJzaW9uOiAke3ZlcnNpb25TdHJpbmd9YCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBtYWpvciA9IE51bWJlciggbWF0Y2hlc1sgMSBdICk7XHJcbiAgICAgIGNvbnN0IG1pbm9yID0gTnVtYmVyKCBtYXRjaGVzWyAyIF0gKTtcclxuICAgICAgY29uc3QgbWFpbnRlbmFuY2UgPSBOdW1iZXIoIG1hdGNoZXNbIDMgXSApO1xyXG4gICAgICBjb25zdCB0ZXN0VHlwZSA9IG1hdGNoZXNbIDYgXTtcclxuICAgICAgY29uc3QgdGVzdE51bWJlciA9IG1hdGNoZXNbIDcgXSA9PT0gdW5kZWZpbmVkID8gbWF0Y2hlc1sgNyBdIDogTnVtYmVyKCBtYXRjaGVzWyA3IF0gKTtcclxuXHJcbiAgICAgIHJldHVybiBuZXcgU2ltVmVyc2lvbiggbWFqb3IsIG1pbm9yLCBtYWludGVuYW5jZSwge1xyXG4gICAgICAgIHRlc3RUeXBlOiB0ZXN0VHlwZSxcclxuICAgICAgICB0ZXN0TnVtYmVyOiB0ZXN0TnVtYmVyLFxyXG4gICAgICAgIGJ1aWxkVGltZXN0YW1wOiBidWlsZFRpbWVzdGFtcFxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZXMgYSBicmFuY2ggaW4gdGhlIGZvcm0ge3tNQUpPUn19Lnt7TUlOT1J9fSBhbmQgcmV0dXJucyBhIGNvcnJlc3BvbmRpbmcgdmVyc2lvbi4gVXNlcyAwIGZvciB0aGUgbWFpbnRlbmFuY2UgdmVyc2lvbiAodW5rbm93bikuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGJyYW5jaCAtIGUuZy4gJzEuMCdcclxuICAgICAqIEByZXR1cm5zIHtTaW1WZXJzaW9ufVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZnJvbUJyYW5jaCggYnJhbmNoICkge1xyXG4gICAgICBjb25zdCBiaXRzID0gYnJhbmNoLnNwbGl0KCAnLicgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYml0cy5sZW5ndGggPT09IDIsIGBCYWQgYnJhbmNoLCBzaG91bGQgYmUge3tNQUpPUn19Lnt7TUlOT1J9fSwgaGFkOiAke2JyYW5jaH1gICk7XHJcblxyXG4gICAgICBjb25zdCBtYWpvciA9IE51bWJlciggYnJhbmNoLnNwbGl0KCAnLicgKVsgMCBdICk7XHJcbiAgICAgIGNvbnN0IG1pbm9yID0gTnVtYmVyKCBicmFuY2guc3BsaXQoICcuJyApWyAxIF0gKTtcclxuXHJcbiAgICAgIHJldHVybiBuZXcgU2ltVmVyc2lvbiggbWFqb3IsIG1pbm9yLCAwICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFbnN1cmVzIHRoYXQgYSBicmFuY2ggbmFtZSBpcyBvayB0byBiZSBhIHJlbGVhc2UgYnJhbmNoLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBicmFuY2ggLSBlLmcuICcxLjAnXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBlbnN1cmVSZWxlYXNlQnJhbmNoKCBicmFuY2ggKSB7XHJcbiAgICAgIGNvbnN0IHZlcnNpb24gPSBTaW1WZXJzaW9uLmZyb21CcmFuY2goIGJyYW5jaC5zcGxpdCggJy0nIClbIDAgXSApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZXJzaW9uLm1ham9yID4gMCwgJ01ham9yIHZlcnNpb24gZm9yIGEgYnJhbmNoIHNob3VsZCBiZSBncmVhdGVyIHRoYW4gemVybycgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdmVyc2lvbi5taW5vciA+PSAwLCAnTWlub3IgdmVyc2lvbiBmb3IgYSBicmFuY2ggc2hvdWxkIGJlIGdyZWF0ZXIgdGhhbiAob3IgZXF1YWwpIHRvIHplcm8nICk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLy8gTm9kZS5qcy1jb21wYXRpYmxlIGRlZmluaXRpb25cclxuICBpZiAoIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICkge1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTaW1WZXJzaW9uO1xyXG4gIH1cclxuICBlbHNlIHtcclxuXHJcbiAgICAvLyBCcm93c2VyIHN1cHBvcnQsIGFzc2lnbiB3aXRoXHJcbiAgICB3aW5kb3cucGhldCA9IHdpbmRvdy5waGV0IHx8IHt9O1xyXG4gICAgd2luZG93LnBoZXQucHJlbG9hZHMgPSB3aW5kb3cucGhldC5wcmVsb2FkcyB8fCB7fTtcclxuICAgIHdpbmRvdy5waGV0LnByZWxvYWRzLmNoaXBwZXIgPSB3aW5kb3cucGhldC5wcmVsb2Fkcy5jaGlwcGVyIHx8IHt9O1xyXG4gICAgd2luZG93LnBoZXQucHJlbG9hZHMuY2hpcHBlci5TaW1WZXJzaW9uID0gU2ltVmVyc2lvbjtcclxuICB9XHJcbn0gKSggKCAxLCBldmFsICkoICd0aGlzJyApICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZXZhbFxyXG4vLyBJbmRpcmVjdCBldmFsIHVzYWdlIGRvbmUgc2luY2UgYmFiZWwgbGlrZXMgdG8gd3JhcCB0aGluZ3MgaW4gc3RyaWN0IG1vZGUuXHJcbi8vIFNlZSBodHRwOi8vcGVyZmVjdGlvbmtpbGxzLmNvbS91bm5lY2Vzc2FyaWx5LWNvbXByZWhlbnNpdmUtbG9vay1pbnRvLWEtcmF0aGVyLWluc2lnbmlmaWNhbnQtaXNzdWUtb2YtZ2xvYmFsLW9iamVjdHMtY3Jl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