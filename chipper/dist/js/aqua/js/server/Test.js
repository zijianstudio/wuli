// Copyright 2020-2023, University of Colorado Boulder

/**
 * Holds data related to a specific test.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const TestResult = require('./TestResult');
const assert = require('assert');
const _ = require('lodash');

// constants
const TEST_TYPES = ['lint', 'lint-everything', 'build', 'sim-test', 'qunit-test', 'pageload-test', 'wrapper-test', 'internal' // Used for tests that aqua itself generates
];

class Test {
  /**
   * @param {Snapshot} snapshot
   * @param {Object} description - from listContinuousTests.js
   * @param {number} repoCommitTimestamp
   * @param {number} dependenciesCommitTimestamp
   */
  constructor(snapshot, description, repoCommitTimestamp, dependenciesCommitTimestamp) {
    assert(Array.isArray(description.test), 'Test descriptions should have a test-name array');
    assert(typeof description.type === 'string', 'Test descriptions should have a type');
    assert(TEST_TYPES.includes(description.type), `Unknown type: ${description.type}`);

    // @public {Snapshot}
    this.snapshot = snapshot;

    // @private {Object} - Saved for future serialization
    this.description = description;

    // @public {number}
    this.repoCommitTimestamp = repoCommitTimestamp;
    this.dependenciesCommitTimestamp = dependenciesCommitTimestamp;

    // @public {Array.<string>}
    this.names = description.test;

    // @public {string} - Used for faster lookups, single tests, etc. - ephemeral
    this.nameString = Test.namesToNameString(this.names);

    // @public {string}
    this.type = description.type;

    // @public {Array.<TestResult>}
    this.results = [];

    // @public {number}
    this.priority = 1;

    // @public {number} - ephemeral
    this.weight = 1; // a default so things will work in case it isn't immediately set

    if (description.priority) {
      assert(typeof description.priority === 'number', 'priority should be a number');
      this.priority = description.priority;
    }

    // @public {string|null}
    this.repo = null;
    if (this.type === 'lint' || this.type === 'build') {
      assert(typeof description.repo === 'string', `${this.type} tests should have a repo`);
      this.repo = description.repo;
    }

    // @public {Array.<string>}
    this.brands = null;
    if (this.type === 'build') {
      assert(Array.isArray(description.brands), 'build tests should have a brands');
      this.brands = description.brands;
    }

    // @public {string|null}
    this.url = null;
    if (this.type === 'sim-test' || this.type === 'qunit-test' || this.type === 'pageload-test' || this.type === 'wrapper-test') {
      assert(typeof description.url === 'string', `${this.type} tests should have a url`);
      this.url = description.url;
    }

    // @public {string|null}
    this.queryParameters = null;
    if (description.queryParameters) {
      assert(typeof description.queryParameters === 'string', 'queryParameters should be a string if provided');
      this.queryParameters = description.queryParameters;
    }

    // @public {string|null}
    this.testQueryParameters = null;
    if (description.testQueryParameters) {
      assert(typeof description.testQueryParameters === 'string', 'testQueryParameters should be a string if provided');
      this.testQueryParameters = description.testQueryParameters;
    }

    // @public {boolean} - If false, we won't send this test to browsers that only support es5 (IE11, etc.)
    this.es5 = false;
    if (description.es5) {
      this.es5 = true;
    }

    // @public {Array.<string>} - The repos that need to be built before this test will be provided
    this.buildDependencies = [];
    if (description.buildDependencies) {
      assert(Array.isArray(description.buildDependencies), 'buildDependencies should be an array');
      this.buildDependencies = description.buildDependencies;
    }

    // @public {boolean} - For server-side tests run only once
    this.complete = false;

    // @public {boolean} - For server-side tests run only once, indicating it was successful
    this.success = false;

    // @public {number} - For browser-side tests, the number of times we have sent this test to a browser
    this.count = 0;
  }

  /**
   * Records a test result
   * @public
   *
   * @param {boolean} passed
   * @param {number} milliseconds
   * @param {string|null} [message]
   */
  recordResult(passed, milliseconds, message) {
    this.results.push(new TestResult(this, passed, milliseconds, message));
  }

  /**
   * Whether this test can be run locally.
   * @public
   *
   * @returns {boolean}
   */
  isLocallyAvailable() {
    return !this.complete && (this.type === 'lint' || this.type === 'lint-everything' || this.type === 'build');
  }

  /**
   * Whether this test can be run in a browser.
   * @public
   *
   * @param {booealn} es5Only
   * @returns {boolean}
   */
  isBrowserAvailable(es5Only) {
    if (this.type !== 'sim-test' && this.type !== 'qunit-test' && this.type !== 'pageload-test' && this.type !== 'wrapper-test') {
      return false;
    }
    if (es5Only && !this.es5) {
      return false;
    }
    if (this.buildDependencies) {
      for (const repo of this.buildDependencies) {
        const buildTest = _.find(this.snapshot.tests, test => test.type === 'build' && test.repo === repo);
        if (!buildTest || !buildTest.success) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Returns the object sent to the browser for this test.
   * @public
   *
   * @returns {Object}
   */
  getObjectForBrowser() {
    assert(this.type === 'sim-test' || this.type === 'qunit-test' || this.type === 'pageload-test' || this.type === 'wrapper-test', 'Needs to be a browser test');
    const baseURL = this.snapshot.useRootDir ? '../..' : `../../ct-snapshots/${this.snapshot.timestamp}`;
    let url;
    if (this.type === 'sim-test') {
      url = `sim-test.html?url=${encodeURIComponent(`${baseURL}/${this.url}`)}`;
      if (this.queryParameters) {
        url += `&simQueryParameters=${encodeURIComponent(this.queryParameters)}`;
      }
    } else if (this.type === 'qunit-test') {
      url = `qunit-test.html?url=${encodeURIComponent(`${baseURL}/${this.url}`)}`;
    } else if (this.type === 'pageload-test') {
      url = `pageload-test.html?url=${encodeURIComponent(`${baseURL}/${this.url}`)}`;
    } else if (this.type === 'wrapper-test') {
      url = `wrapper-test.html?url=${encodeURIComponent(`${baseURL}/${this.url}`)}`;
    }
    if (this.testQueryParameters) {
      url = `${url}&${this.testQueryParameters}`;
    }
    return {
      snapshotName: this.snapshot.name,
      test: this.names,
      url: url,
      timestamp: Date.now()
    };
  }

  /**
   * Returns a single string from a list of names
   * @public
   *
   * @param {Array.<string>} names
   * @returns {string}
   */
  static namesToNameString(names) {
    return names.join('.');
  }

  /**
   * Creates a pojo-style object for saving/restoring
   * @public
   *
   * @returns {Object}
   */
  serialize() {
    return {
      description: this.description,
      results: this.results.map(testResult => testResult.serialize()),
      complete: this.complete,
      success: this.success,
      count: this.count,
      repoCommitTimestamp: this.repoCommitTimestamp,
      dependenciesCommitTimestamp: this.dependenciesCommitTimestamp
    };
  }

  /**
   * Creates the in-memory representation from the serialized form
   * @public
   *
   * @param {Snapshot} snapshot
   * @param {Object} serialization
   * @returns {Test}
   */
  static deserialize(snapshot, serialization) {
    const test = new Test(snapshot, serialization.description, serialization.repoCommitTimestamp, serialization.dependenciesCommitTimestamp);
    test.complete = serialization.complete;
    test.success = serialization.success;
    test.count = serialization.count;
    test.results = serialization.results.map(resultSerialization => TestResult.deserialize(test, resultSerialization));
    return test;
  }
}
module.exports = Test;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZXN0UmVzdWx0IiwicmVxdWlyZSIsImFzc2VydCIsIl8iLCJURVNUX1RZUEVTIiwiVGVzdCIsImNvbnN0cnVjdG9yIiwic25hcHNob3QiLCJkZXNjcmlwdGlvbiIsInJlcG9Db21taXRUaW1lc3RhbXAiLCJkZXBlbmRlbmNpZXNDb21taXRUaW1lc3RhbXAiLCJBcnJheSIsImlzQXJyYXkiLCJ0ZXN0IiwidHlwZSIsImluY2x1ZGVzIiwibmFtZXMiLCJuYW1lU3RyaW5nIiwibmFtZXNUb05hbWVTdHJpbmciLCJyZXN1bHRzIiwicHJpb3JpdHkiLCJ3ZWlnaHQiLCJyZXBvIiwiYnJhbmRzIiwidXJsIiwicXVlcnlQYXJhbWV0ZXJzIiwidGVzdFF1ZXJ5UGFyYW1ldGVycyIsImVzNSIsImJ1aWxkRGVwZW5kZW5jaWVzIiwiY29tcGxldGUiLCJzdWNjZXNzIiwiY291bnQiLCJyZWNvcmRSZXN1bHQiLCJwYXNzZWQiLCJtaWxsaXNlY29uZHMiLCJtZXNzYWdlIiwicHVzaCIsImlzTG9jYWxseUF2YWlsYWJsZSIsImlzQnJvd3NlckF2YWlsYWJsZSIsImVzNU9ubHkiLCJidWlsZFRlc3QiLCJmaW5kIiwidGVzdHMiLCJnZXRPYmplY3RGb3JCcm93c2VyIiwiYmFzZVVSTCIsInVzZVJvb3REaXIiLCJ0aW1lc3RhbXAiLCJlbmNvZGVVUklDb21wb25lbnQiLCJzbmFwc2hvdE5hbWUiLCJuYW1lIiwiRGF0ZSIsIm5vdyIsImpvaW4iLCJzZXJpYWxpemUiLCJtYXAiLCJ0ZXN0UmVzdWx0IiwiZGVzZXJpYWxpemUiLCJzZXJpYWxpemF0aW9uIiwicmVzdWx0U2VyaWFsaXphdGlvbiIsIm1vZHVsZSIsImV4cG9ydHMiXSwic291cmNlcyI6WyJUZXN0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEhvbGRzIGRhdGEgcmVsYXRlZCB0byBhIHNwZWNpZmljIHRlc3QuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5cclxuY29uc3QgVGVzdFJlc3VsdCA9IHJlcXVpcmUoICcuL1Rlc3RSZXN1bHQnICk7XHJcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XHJcbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRFU1RfVFlQRVMgPSBbXHJcbiAgJ2xpbnQnLFxyXG4gICdsaW50LWV2ZXJ5dGhpbmcnLFxyXG4gICdidWlsZCcsXHJcbiAgJ3NpbS10ZXN0JyxcclxuICAncXVuaXQtdGVzdCcsXHJcbiAgJ3BhZ2Vsb2FkLXRlc3QnLFxyXG4gICd3cmFwcGVyLXRlc3QnLFxyXG4gICdpbnRlcm5hbCcgLy8gVXNlZCBmb3IgdGVzdHMgdGhhdCBhcXVhIGl0c2VsZiBnZW5lcmF0ZXNcclxuXTtcclxuXHJcbmNsYXNzIFRlc3Qge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7U25hcHNob3R9IHNuYXBzaG90XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGRlc2NyaXB0aW9uIC0gZnJvbSBsaXN0Q29udGludW91c1Rlc3RzLmpzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlcG9Db21taXRUaW1lc3RhbXBcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVwZW5kZW5jaWVzQ29tbWl0VGltZXN0YW1wXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHNuYXBzaG90LCBkZXNjcmlwdGlvbiwgcmVwb0NvbW1pdFRpbWVzdGFtcCwgZGVwZW5kZW5jaWVzQ29tbWl0VGltZXN0YW1wICkge1xyXG4gICAgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBkZXNjcmlwdGlvbi50ZXN0ICksICdUZXN0IGRlc2NyaXB0aW9ucyBzaG91bGQgaGF2ZSBhIHRlc3QtbmFtZSBhcnJheScgKTtcclxuICAgIGFzc2VydCggdHlwZW9mIGRlc2NyaXB0aW9uLnR5cGUgPT09ICdzdHJpbmcnLCAnVGVzdCBkZXNjcmlwdGlvbnMgc2hvdWxkIGhhdmUgYSB0eXBlJyApO1xyXG4gICAgYXNzZXJ0KCBURVNUX1RZUEVTLmluY2x1ZGVzKCBkZXNjcmlwdGlvbi50eXBlICksIGBVbmtub3duIHR5cGU6ICR7ZGVzY3JpcHRpb24udHlwZX1gICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7U25hcHNob3R9XHJcbiAgICB0aGlzLnNuYXBzaG90ID0gc25hcHNob3Q7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge09iamVjdH0gLSBTYXZlZCBmb3IgZnV0dXJlIHNlcmlhbGl6YXRpb25cclxuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9XHJcbiAgICB0aGlzLnJlcG9Db21taXRUaW1lc3RhbXAgPSByZXBvQ29tbWl0VGltZXN0YW1wO1xyXG4gICAgdGhpcy5kZXBlbmRlbmNpZXNDb21taXRUaW1lc3RhbXAgPSBkZXBlbmRlbmNpZXNDb21taXRUaW1lc3RhbXA7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPHN0cmluZz59XHJcbiAgICB0aGlzLm5hbWVzID0gZGVzY3JpcHRpb24udGVzdDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtzdHJpbmd9IC0gVXNlZCBmb3IgZmFzdGVyIGxvb2t1cHMsIHNpbmdsZSB0ZXN0cywgZXRjLiAtIGVwaGVtZXJhbFxyXG4gICAgdGhpcy5uYW1lU3RyaW5nID0gVGVzdC5uYW1lc1RvTmFtZVN0cmluZyggdGhpcy5uYW1lcyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ31cclxuICAgIHRoaXMudHlwZSA9IGRlc2NyaXB0aW9uLnR5cGU7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPFRlc3RSZXN1bHQ+fVxyXG4gICAgdGhpcy5yZXN1bHRzID0gW107XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy5wcmlvcml0eSA9IDE7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIGVwaGVtZXJhbFxyXG4gICAgdGhpcy53ZWlnaHQgPSAxOyAvLyBhIGRlZmF1bHQgc28gdGhpbmdzIHdpbGwgd29yayBpbiBjYXNlIGl0IGlzbid0IGltbWVkaWF0ZWx5IHNldFxyXG5cclxuICAgIGlmICggZGVzY3JpcHRpb24ucHJpb3JpdHkgKSB7XHJcbiAgICAgIGFzc2VydCggdHlwZW9mIGRlc2NyaXB0aW9uLnByaW9yaXR5ID09PSAnbnVtYmVyJywgJ3ByaW9yaXR5IHNob3VsZCBiZSBhIG51bWJlcicgKTtcclxuXHJcbiAgICAgIHRoaXMucHJpb3JpdHkgPSBkZXNjcmlwdGlvbi5wcmlvcml0eTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHVibGljIHtzdHJpbmd8bnVsbH1cclxuICAgIHRoaXMucmVwbyA9IG51bGw7XHJcblxyXG4gICAgaWYgKCB0aGlzLnR5cGUgPT09ICdsaW50JyB8fCB0aGlzLnR5cGUgPT09ICdidWlsZCcgKSB7XHJcbiAgICAgIGFzc2VydCggdHlwZW9mIGRlc2NyaXB0aW9uLnJlcG8gPT09ICdzdHJpbmcnLCBgJHt0aGlzLnR5cGV9IHRlc3RzIHNob3VsZCBoYXZlIGEgcmVwb2AgKTtcclxuXHJcbiAgICAgIHRoaXMucmVwbyA9IGRlc2NyaXB0aW9uLnJlcG87XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPHN0cmluZz59XHJcbiAgICB0aGlzLmJyYW5kcyA9IG51bGw7XHJcblxyXG4gICAgaWYgKCB0aGlzLnR5cGUgPT09ICdidWlsZCcgKSB7XHJcbiAgICAgIGFzc2VydCggQXJyYXkuaXNBcnJheSggZGVzY3JpcHRpb24uYnJhbmRzICksICdidWlsZCB0ZXN0cyBzaG91bGQgaGF2ZSBhIGJyYW5kcycgKTtcclxuXHJcbiAgICAgIHRoaXMuYnJhbmRzID0gZGVzY3JpcHRpb24uYnJhbmRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ3xudWxsfVxyXG4gICAgdGhpcy51cmwgPSBudWxsO1xyXG5cclxuICAgIGlmICggdGhpcy50eXBlID09PSAnc2ltLXRlc3QnIHx8IHRoaXMudHlwZSA9PT0gJ3F1bml0LXRlc3QnIHx8IHRoaXMudHlwZSA9PT0gJ3BhZ2Vsb2FkLXRlc3QnIHx8IHRoaXMudHlwZSA9PT0gJ3dyYXBwZXItdGVzdCcgKSB7XHJcbiAgICAgIGFzc2VydCggdHlwZW9mIGRlc2NyaXB0aW9uLnVybCA9PT0gJ3N0cmluZycsIGAke3RoaXMudHlwZX0gdGVzdHMgc2hvdWxkIGhhdmUgYSB1cmxgICk7XHJcblxyXG4gICAgICB0aGlzLnVybCA9IGRlc2NyaXB0aW9uLnVybDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHVibGljIHtzdHJpbmd8bnVsbH1cclxuICAgIHRoaXMucXVlcnlQYXJhbWV0ZXJzID0gbnVsbDtcclxuXHJcbiAgICBpZiAoIGRlc2NyaXB0aW9uLnF1ZXJ5UGFyYW1ldGVycyApIHtcclxuICAgICAgYXNzZXJ0KCB0eXBlb2YgZGVzY3JpcHRpb24ucXVlcnlQYXJhbWV0ZXJzID09PSAnc3RyaW5nJywgJ3F1ZXJ5UGFyYW1ldGVycyBzaG91bGQgYmUgYSBzdHJpbmcgaWYgcHJvdmlkZWQnICk7XHJcbiAgICAgIHRoaXMucXVlcnlQYXJhbWV0ZXJzID0gZGVzY3JpcHRpb24ucXVlcnlQYXJhbWV0ZXJzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ3xudWxsfVxyXG4gICAgdGhpcy50ZXN0UXVlcnlQYXJhbWV0ZXJzID0gbnVsbDtcclxuXHJcbiAgICBpZiAoIGRlc2NyaXB0aW9uLnRlc3RRdWVyeVBhcmFtZXRlcnMgKSB7XHJcbiAgICAgIGFzc2VydCggdHlwZW9mIGRlc2NyaXB0aW9uLnRlc3RRdWVyeVBhcmFtZXRlcnMgPT09ICdzdHJpbmcnLCAndGVzdFF1ZXJ5UGFyYW1ldGVycyBzaG91bGQgYmUgYSBzdHJpbmcgaWYgcHJvdmlkZWQnICk7XHJcbiAgICAgIHRoaXMudGVzdFF1ZXJ5UGFyYW1ldGVycyA9IGRlc2NyaXB0aW9uLnRlc3RRdWVyeVBhcmFtZXRlcnM7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn0gLSBJZiBmYWxzZSwgd2Ugd29uJ3Qgc2VuZCB0aGlzIHRlc3QgdG8gYnJvd3NlcnMgdGhhdCBvbmx5IHN1cHBvcnQgZXM1IChJRTExLCBldGMuKVxyXG4gICAgdGhpcy5lczUgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoIGRlc2NyaXB0aW9uLmVzNSApIHtcclxuICAgICAgdGhpcy5lczUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxzdHJpbmc+fSAtIFRoZSByZXBvcyB0aGF0IG5lZWQgdG8gYmUgYnVpbHQgYmVmb3JlIHRoaXMgdGVzdCB3aWxsIGJlIHByb3ZpZGVkXHJcbiAgICB0aGlzLmJ1aWxkRGVwZW5kZW5jaWVzID0gW107XHJcblxyXG4gICAgaWYgKCBkZXNjcmlwdGlvbi5idWlsZERlcGVuZGVuY2llcyApIHtcclxuICAgICAgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBkZXNjcmlwdGlvbi5idWlsZERlcGVuZGVuY2llcyApLCAnYnVpbGREZXBlbmRlbmNpZXMgc2hvdWxkIGJlIGFuIGFycmF5JyApO1xyXG5cclxuICAgICAgdGhpcy5idWlsZERlcGVuZGVuY2llcyA9IGRlc2NyaXB0aW9uLmJ1aWxkRGVwZW5kZW5jaWVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gRm9yIHNlcnZlci1zaWRlIHRlc3RzIHJ1biBvbmx5IG9uY2VcclxuICAgIHRoaXMuY29tcGxldGUgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufSAtIEZvciBzZXJ2ZXItc2lkZSB0ZXN0cyBydW4gb25seSBvbmNlLCBpbmRpY2F0aW5nIGl0IHdhcyBzdWNjZXNzZnVsXHJcbiAgICB0aGlzLnN1Y2Nlc3MgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gRm9yIGJyb3dzZXItc2lkZSB0ZXN0cywgdGhlIG51bWJlciBvZiB0aW1lcyB3ZSBoYXZlIHNlbnQgdGhpcyB0ZXN0IHRvIGEgYnJvd3NlclxyXG4gICAgdGhpcy5jb3VudCA9IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWNvcmRzIGEgdGVzdCByZXN1bHRcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHBhc3NlZFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaWxsaXNlY29uZHNcclxuICAgKiBAcGFyYW0ge3N0cmluZ3xudWxsfSBbbWVzc2FnZV1cclxuICAgKi9cclxuICByZWNvcmRSZXN1bHQoIHBhc3NlZCwgbWlsbGlzZWNvbmRzLCBtZXNzYWdlICkge1xyXG4gICAgdGhpcy5yZXN1bHRzLnB1c2goIG5ldyBUZXN0UmVzdWx0KCB0aGlzLCBwYXNzZWQsIG1pbGxpc2Vjb25kcywgbWVzc2FnZSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoaXMgdGVzdCBjYW4gYmUgcnVuIGxvY2FsbHkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNMb2NhbGx5QXZhaWxhYmxlKCkge1xyXG4gICAgcmV0dXJuICF0aGlzLmNvbXBsZXRlICYmICggdGhpcy50eXBlID09PSAnbGludCcgfHwgdGhpcy50eXBlID09PSAnbGludC1ldmVyeXRoaW5nJyB8fCB0aGlzLnR5cGUgPT09ICdidWlsZCcgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgdGhpcyB0ZXN0IGNhbiBiZSBydW4gaW4gYSBicm93c2VyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vZWFsbn0gZXM1T25seVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzQnJvd3NlckF2YWlsYWJsZSggZXM1T25seSApIHtcclxuICAgIGlmICggdGhpcy50eXBlICE9PSAnc2ltLXRlc3QnICYmIHRoaXMudHlwZSAhPT0gJ3F1bml0LXRlc3QnICYmIHRoaXMudHlwZSAhPT0gJ3BhZ2Vsb2FkLXRlc3QnICYmIHRoaXMudHlwZSAhPT0gJ3dyYXBwZXItdGVzdCcgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGVzNU9ubHkgJiYgIXRoaXMuZXM1ICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLmJ1aWxkRGVwZW5kZW5jaWVzICkge1xyXG4gICAgICBmb3IgKCBjb25zdCByZXBvIG9mIHRoaXMuYnVpbGREZXBlbmRlbmNpZXMgKSB7XHJcbiAgICAgICAgY29uc3QgYnVpbGRUZXN0ID0gXy5maW5kKCB0aGlzLnNuYXBzaG90LnRlc3RzLCB0ZXN0ID0+IHRlc3QudHlwZSA9PT0gJ2J1aWxkJyAmJiB0ZXN0LnJlcG8gPT09IHJlcG8gKTtcclxuXHJcbiAgICAgICAgaWYgKCAhYnVpbGRUZXN0IHx8ICFidWlsZFRlc3Quc3VjY2VzcyApIHtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG9iamVjdCBzZW50IHRvIHRoZSBicm93c2VyIGZvciB0aGlzIHRlc3QuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge09iamVjdH1cclxuICAgKi9cclxuICBnZXRPYmplY3RGb3JCcm93c2VyKCkge1xyXG4gICAgYXNzZXJ0KCB0aGlzLnR5cGUgPT09ICdzaW0tdGVzdCcgfHwgdGhpcy50eXBlID09PSAncXVuaXQtdGVzdCcgfHwgdGhpcy50eXBlID09PSAncGFnZWxvYWQtdGVzdCcgfHwgdGhpcy50eXBlID09PSAnd3JhcHBlci10ZXN0JywgJ05lZWRzIHRvIGJlIGEgYnJvd3NlciB0ZXN0JyApO1xyXG5cclxuICAgIGNvbnN0IGJhc2VVUkwgPSB0aGlzLnNuYXBzaG90LnVzZVJvb3REaXIgPyAnLi4vLi4nIDogYC4uLy4uL2N0LXNuYXBzaG90cy8ke3RoaXMuc25hcHNob3QudGltZXN0YW1wfWA7XHJcbiAgICBsZXQgdXJsO1xyXG5cclxuICAgIGlmICggdGhpcy50eXBlID09PSAnc2ltLXRlc3QnICkge1xyXG4gICAgICB1cmwgPSBgc2ltLXRlc3QuaHRtbD91cmw9JHtlbmNvZGVVUklDb21wb25lbnQoIGAke2Jhc2VVUkx9LyR7dGhpcy51cmx9YCApfWA7XHJcblxyXG4gICAgICBpZiAoIHRoaXMucXVlcnlQYXJhbWV0ZXJzICkge1xyXG4gICAgICAgIHVybCArPSBgJnNpbVF1ZXJ5UGFyYW1ldGVycz0ke2VuY29kZVVSSUNvbXBvbmVudCggdGhpcy5xdWVyeVBhcmFtZXRlcnMgKX1gO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy50eXBlID09PSAncXVuaXQtdGVzdCcgKSB7XHJcbiAgICAgIHVybCA9IGBxdW5pdC10ZXN0Lmh0bWw/dXJsPSR7ZW5jb2RlVVJJQ29tcG9uZW50KCBgJHtiYXNlVVJMfS8ke3RoaXMudXJsfWAgKX1gO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMudHlwZSA9PT0gJ3BhZ2Vsb2FkLXRlc3QnICkge1xyXG4gICAgICB1cmwgPSBgcGFnZWxvYWQtdGVzdC5odG1sP3VybD0ke2VuY29kZVVSSUNvbXBvbmVudCggYCR7YmFzZVVSTH0vJHt0aGlzLnVybH1gICl9YDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLnR5cGUgPT09ICd3cmFwcGVyLXRlc3QnICkge1xyXG4gICAgICB1cmwgPSBgd3JhcHBlci10ZXN0Lmh0bWw/dXJsPSR7ZW5jb2RlVVJJQ29tcG9uZW50KCBgJHtiYXNlVVJMfS8ke3RoaXMudXJsfWAgKX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLnRlc3RRdWVyeVBhcmFtZXRlcnMgKSB7XHJcbiAgICAgIHVybCA9IGAke3VybH0mJHt0aGlzLnRlc3RRdWVyeVBhcmFtZXRlcnN9YDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzbmFwc2hvdE5hbWU6IHRoaXMuc25hcHNob3QubmFtZSxcclxuICAgICAgdGVzdDogdGhpcy5uYW1lcyxcclxuICAgICAgdXJsOiB1cmwsXHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzaW5nbGUgc3RyaW5nIGZyb20gYSBsaXN0IG9mIG5hbWVzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gbmFtZXNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBuYW1lc1RvTmFtZVN0cmluZyggbmFtZXMgKSB7XHJcbiAgICByZXR1cm4gbmFtZXMuam9pbiggJy4nICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgcG9qby1zdHlsZSBvYmplY3QgZm9yIHNhdmluZy9yZXN0b3JpbmdcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxyXG4gICAqL1xyXG4gIHNlcmlhbGl6ZSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmRlc2NyaXB0aW9uLFxyXG4gICAgICByZXN1bHRzOiB0aGlzLnJlc3VsdHMubWFwKCB0ZXN0UmVzdWx0ID0+IHRlc3RSZXN1bHQuc2VyaWFsaXplKCkgKSxcclxuICAgICAgY29tcGxldGU6IHRoaXMuY29tcGxldGUsXHJcbiAgICAgIHN1Y2Nlc3M6IHRoaXMuc3VjY2VzcyxcclxuICAgICAgY291bnQ6IHRoaXMuY291bnQsXHJcbiAgICAgIHJlcG9Db21taXRUaW1lc3RhbXA6IHRoaXMucmVwb0NvbW1pdFRpbWVzdGFtcCxcclxuICAgICAgZGVwZW5kZW5jaWVzQ29tbWl0VGltZXN0YW1wOiB0aGlzLmRlcGVuZGVuY2llc0NvbW1pdFRpbWVzdGFtcFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIGluLW1lbW9yeSByZXByZXNlbnRhdGlvbiBmcm9tIHRoZSBzZXJpYWxpemVkIGZvcm1cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NuYXBzaG90fSBzbmFwc2hvdFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzZXJpYWxpemF0aW9uXHJcbiAgICogQHJldHVybnMge1Rlc3R9XHJcbiAgICovXHJcbiAgc3RhdGljIGRlc2VyaWFsaXplKCBzbmFwc2hvdCwgc2VyaWFsaXphdGlvbiApIHtcclxuICAgIGNvbnN0IHRlc3QgPSBuZXcgVGVzdCggc25hcHNob3QsIHNlcmlhbGl6YXRpb24uZGVzY3JpcHRpb24sIHNlcmlhbGl6YXRpb24ucmVwb0NvbW1pdFRpbWVzdGFtcCwgc2VyaWFsaXphdGlvbi5kZXBlbmRlbmNpZXNDb21taXRUaW1lc3RhbXAgKTtcclxuXHJcbiAgICB0ZXN0LmNvbXBsZXRlID0gc2VyaWFsaXphdGlvbi5jb21wbGV0ZTtcclxuICAgIHRlc3Quc3VjY2VzcyA9IHNlcmlhbGl6YXRpb24uc3VjY2VzcztcclxuICAgIHRlc3QuY291bnQgPSBzZXJpYWxpemF0aW9uLmNvdW50O1xyXG5cclxuICAgIHRlc3QucmVzdWx0cyA9IHNlcmlhbGl6YXRpb24ucmVzdWx0cy5tYXAoIHJlc3VsdFNlcmlhbGl6YXRpb24gPT4gVGVzdFJlc3VsdC5kZXNlcmlhbGl6ZSggdGVzdCwgcmVzdWx0U2VyaWFsaXphdGlvbiApICk7XHJcblxyXG4gICAgcmV0dXJuIHRlc3Q7XHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3Q7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxNQUFNQSxVQUFVLEdBQUdDLE9BQU8sQ0FBRSxjQUFlLENBQUM7QUFDNUMsTUFBTUMsTUFBTSxHQUFHRCxPQUFPLENBQUUsUUFBUyxDQUFDO0FBQ2xDLE1BQU1FLENBQUMsR0FBR0YsT0FBTyxDQUFFLFFBQVMsQ0FBQzs7QUFFN0I7QUFDQSxNQUFNRyxVQUFVLEdBQUcsQ0FDakIsTUFBTSxFQUNOLGlCQUFpQixFQUNqQixPQUFPLEVBQ1AsVUFBVSxFQUNWLFlBQVksRUFDWixlQUFlLEVBQ2YsY0FBYyxFQUNkLFVBQVUsQ0FBQztBQUFBLENBQ1o7O0FBRUQsTUFBTUMsSUFBSSxDQUFDO0VBQ1Q7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLFFBQVEsRUFBRUMsV0FBVyxFQUFFQyxtQkFBbUIsRUFBRUMsMkJBQTJCLEVBQUc7SUFDckZSLE1BQU0sQ0FBRVMsS0FBSyxDQUFDQyxPQUFPLENBQUVKLFdBQVcsQ0FBQ0ssSUFBSyxDQUFDLEVBQUUsaURBQWtELENBQUM7SUFDOUZYLE1BQU0sQ0FBRSxPQUFPTSxXQUFXLENBQUNNLElBQUksS0FBSyxRQUFRLEVBQUUsc0NBQXVDLENBQUM7SUFDdEZaLE1BQU0sQ0FBRUUsVUFBVSxDQUFDVyxRQUFRLENBQUVQLFdBQVcsQ0FBQ00sSUFBSyxDQUFDLEVBQUcsaUJBQWdCTixXQUFXLENBQUNNLElBQUssRUFBRSxDQUFDOztJQUV0RjtJQUNBLElBQUksQ0FBQ1AsUUFBUSxHQUFHQSxRQUFROztJQUV4QjtJQUNBLElBQUksQ0FBQ0MsV0FBVyxHQUFHQSxXQUFXOztJQUU5QjtJQUNBLElBQUksQ0FBQ0MsbUJBQW1CLEdBQUdBLG1CQUFtQjtJQUM5QyxJQUFJLENBQUNDLDJCQUEyQixHQUFHQSwyQkFBMkI7O0lBRTlEO0lBQ0EsSUFBSSxDQUFDTSxLQUFLLEdBQUdSLFdBQVcsQ0FBQ0ssSUFBSTs7SUFFN0I7SUFDQSxJQUFJLENBQUNJLFVBQVUsR0FBR1osSUFBSSxDQUFDYSxpQkFBaUIsQ0FBRSxJQUFJLENBQUNGLEtBQU0sQ0FBQzs7SUFFdEQ7SUFDQSxJQUFJLENBQUNGLElBQUksR0FBR04sV0FBVyxDQUFDTSxJQUFJOztJQUU1QjtJQUNBLElBQUksQ0FBQ0ssT0FBTyxHQUFHLEVBQUU7O0lBRWpCO0lBQ0EsSUFBSSxDQUFDQyxRQUFRLEdBQUcsQ0FBQzs7SUFFakI7SUFDQSxJQUFJLENBQUNDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzs7SUFFakIsSUFBS2IsV0FBVyxDQUFDWSxRQUFRLEVBQUc7TUFDMUJsQixNQUFNLENBQUUsT0FBT00sV0FBVyxDQUFDWSxRQUFRLEtBQUssUUFBUSxFQUFFLDZCQUE4QixDQUFDO01BRWpGLElBQUksQ0FBQ0EsUUFBUSxHQUFHWixXQUFXLENBQUNZLFFBQVE7SUFDdEM7O0lBRUE7SUFDQSxJQUFJLENBQUNFLElBQUksR0FBRyxJQUFJO0lBRWhCLElBQUssSUFBSSxDQUFDUixJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksQ0FBQ0EsSUFBSSxLQUFLLE9BQU8sRUFBRztNQUNuRFosTUFBTSxDQUFFLE9BQU9NLFdBQVcsQ0FBQ2MsSUFBSSxLQUFLLFFBQVEsRUFBRyxHQUFFLElBQUksQ0FBQ1IsSUFBSywyQkFBMkIsQ0FBQztNQUV2RixJQUFJLENBQUNRLElBQUksR0FBR2QsV0FBVyxDQUFDYyxJQUFJO0lBQzlCOztJQUVBO0lBQ0EsSUFBSSxDQUFDQyxNQUFNLEdBQUcsSUFBSTtJQUVsQixJQUFLLElBQUksQ0FBQ1QsSUFBSSxLQUFLLE9BQU8sRUFBRztNQUMzQlosTUFBTSxDQUFFUyxLQUFLLENBQUNDLE9BQU8sQ0FBRUosV0FBVyxDQUFDZSxNQUFPLENBQUMsRUFBRSxrQ0FBbUMsQ0FBQztNQUVqRixJQUFJLENBQUNBLE1BQU0sR0FBR2YsV0FBVyxDQUFDZSxNQUFNO0lBQ2xDOztJQUVBO0lBQ0EsSUFBSSxDQUFDQyxHQUFHLEdBQUcsSUFBSTtJQUVmLElBQUssSUFBSSxDQUFDVixJQUFJLEtBQUssVUFBVSxJQUFJLElBQUksQ0FBQ0EsSUFBSSxLQUFLLFlBQVksSUFBSSxJQUFJLENBQUNBLElBQUksS0FBSyxlQUFlLElBQUksSUFBSSxDQUFDQSxJQUFJLEtBQUssY0FBYyxFQUFHO01BQzdIWixNQUFNLENBQUUsT0FBT00sV0FBVyxDQUFDZ0IsR0FBRyxLQUFLLFFBQVEsRUFBRyxHQUFFLElBQUksQ0FBQ1YsSUFBSywwQkFBMEIsQ0FBQztNQUVyRixJQUFJLENBQUNVLEdBQUcsR0FBR2hCLFdBQVcsQ0FBQ2dCLEdBQUc7SUFDNUI7O0lBRUE7SUFDQSxJQUFJLENBQUNDLGVBQWUsR0FBRyxJQUFJO0lBRTNCLElBQUtqQixXQUFXLENBQUNpQixlQUFlLEVBQUc7TUFDakN2QixNQUFNLENBQUUsT0FBT00sV0FBVyxDQUFDaUIsZUFBZSxLQUFLLFFBQVEsRUFBRSxnREFBaUQsQ0FBQztNQUMzRyxJQUFJLENBQUNBLGVBQWUsR0FBR2pCLFdBQVcsQ0FBQ2lCLGVBQWU7SUFDcEQ7O0lBRUE7SUFDQSxJQUFJLENBQUNDLG1CQUFtQixHQUFHLElBQUk7SUFFL0IsSUFBS2xCLFdBQVcsQ0FBQ2tCLG1CQUFtQixFQUFHO01BQ3JDeEIsTUFBTSxDQUFFLE9BQU9NLFdBQVcsQ0FBQ2tCLG1CQUFtQixLQUFLLFFBQVEsRUFBRSxvREFBcUQsQ0FBQztNQUNuSCxJQUFJLENBQUNBLG1CQUFtQixHQUFHbEIsV0FBVyxDQUFDa0IsbUJBQW1CO0lBQzVEOztJQUVBO0lBQ0EsSUFBSSxDQUFDQyxHQUFHLEdBQUcsS0FBSztJQUVoQixJQUFLbkIsV0FBVyxDQUFDbUIsR0FBRyxFQUFHO01BQ3JCLElBQUksQ0FBQ0EsR0FBRyxHQUFHLElBQUk7SUFDakI7O0lBRUE7SUFDQSxJQUFJLENBQUNDLGlCQUFpQixHQUFHLEVBQUU7SUFFM0IsSUFBS3BCLFdBQVcsQ0FBQ29CLGlCQUFpQixFQUFHO01BQ25DMUIsTUFBTSxDQUFFUyxLQUFLLENBQUNDLE9BQU8sQ0FBRUosV0FBVyxDQUFDb0IsaUJBQWtCLENBQUMsRUFBRSxzQ0FBdUMsQ0FBQztNQUVoRyxJQUFJLENBQUNBLGlCQUFpQixHQUFHcEIsV0FBVyxDQUFDb0IsaUJBQWlCO0lBQ3hEOztJQUVBO0lBQ0EsSUFBSSxDQUFDQyxRQUFRLEdBQUcsS0FBSzs7SUFFckI7SUFDQSxJQUFJLENBQUNDLE9BQU8sR0FBRyxLQUFLOztJQUVwQjtJQUNBLElBQUksQ0FBQ0MsS0FBSyxHQUFHLENBQUM7RUFDaEI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxZQUFZQSxDQUFFQyxNQUFNLEVBQUVDLFlBQVksRUFBRUMsT0FBTyxFQUFHO0lBQzVDLElBQUksQ0FBQ2hCLE9BQU8sQ0FBQ2lCLElBQUksQ0FBRSxJQUFJcEMsVUFBVSxDQUFFLElBQUksRUFBRWlDLE1BQU0sRUFBRUMsWUFBWSxFQUFFQyxPQUFRLENBQUUsQ0FBQztFQUM1RTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsa0JBQWtCQSxDQUFBLEVBQUc7SUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQ1IsUUFBUSxLQUFNLElBQUksQ0FBQ2YsSUFBSSxLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUNBLElBQUksS0FBSyxpQkFBaUIsSUFBSSxJQUFJLENBQUNBLElBQUksS0FBSyxPQUFPLENBQUU7RUFDL0c7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRXdCLGtCQUFrQkEsQ0FBRUMsT0FBTyxFQUFHO0lBQzVCLElBQUssSUFBSSxDQUFDekIsSUFBSSxLQUFLLFVBQVUsSUFBSSxJQUFJLENBQUNBLElBQUksS0FBSyxZQUFZLElBQUksSUFBSSxDQUFDQSxJQUFJLEtBQUssZUFBZSxJQUFJLElBQUksQ0FBQ0EsSUFBSSxLQUFLLGNBQWMsRUFBRztNQUM3SCxPQUFPLEtBQUs7SUFDZDtJQUVBLElBQUt5QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUNaLEdBQUcsRUFBRztNQUMxQixPQUFPLEtBQUs7SUFDZDtJQUVBLElBQUssSUFBSSxDQUFDQyxpQkFBaUIsRUFBRztNQUM1QixLQUFNLE1BQU1OLElBQUksSUFBSSxJQUFJLENBQUNNLGlCQUFpQixFQUFHO1FBQzNDLE1BQU1ZLFNBQVMsR0FBR3JDLENBQUMsQ0FBQ3NDLElBQUksQ0FBRSxJQUFJLENBQUNsQyxRQUFRLENBQUNtQyxLQUFLLEVBQUU3QixJQUFJLElBQUlBLElBQUksQ0FBQ0MsSUFBSSxLQUFLLE9BQU8sSUFBSUQsSUFBSSxDQUFDUyxJQUFJLEtBQUtBLElBQUssQ0FBQztRQUVwRyxJQUFLLENBQUNrQixTQUFTLElBQUksQ0FBQ0EsU0FBUyxDQUFDVixPQUFPLEVBQUc7VUFDdEMsT0FBTyxLQUFLO1FBQ2Q7TUFDRjtJQUNGO0lBRUEsT0FBTyxJQUFJO0VBQ2I7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VhLG1CQUFtQkEsQ0FBQSxFQUFHO0lBQ3BCekMsTUFBTSxDQUFFLElBQUksQ0FBQ1ksSUFBSSxLQUFLLFVBQVUsSUFBSSxJQUFJLENBQUNBLElBQUksS0FBSyxZQUFZLElBQUksSUFBSSxDQUFDQSxJQUFJLEtBQUssZUFBZSxJQUFJLElBQUksQ0FBQ0EsSUFBSSxLQUFLLGNBQWMsRUFBRSw0QkFBNkIsQ0FBQztJQUUvSixNQUFNOEIsT0FBTyxHQUFHLElBQUksQ0FBQ3JDLFFBQVEsQ0FBQ3NDLFVBQVUsR0FBRyxPQUFPLEdBQUksc0JBQXFCLElBQUksQ0FBQ3RDLFFBQVEsQ0FBQ3VDLFNBQVUsRUFBQztJQUNwRyxJQUFJdEIsR0FBRztJQUVQLElBQUssSUFBSSxDQUFDVixJQUFJLEtBQUssVUFBVSxFQUFHO01BQzlCVSxHQUFHLEdBQUkscUJBQW9CdUIsa0JBQWtCLENBQUcsR0FBRUgsT0FBUSxJQUFHLElBQUksQ0FBQ3BCLEdBQUksRUFBRSxDQUFFLEVBQUM7TUFFM0UsSUFBSyxJQUFJLENBQUNDLGVBQWUsRUFBRztRQUMxQkQsR0FBRyxJQUFLLHVCQUFzQnVCLGtCQUFrQixDQUFFLElBQUksQ0FBQ3RCLGVBQWdCLENBQUUsRUFBQztNQUM1RTtJQUNGLENBQUMsTUFDSSxJQUFLLElBQUksQ0FBQ1gsSUFBSSxLQUFLLFlBQVksRUFBRztNQUNyQ1UsR0FBRyxHQUFJLHVCQUFzQnVCLGtCQUFrQixDQUFHLEdBQUVILE9BQVEsSUFBRyxJQUFJLENBQUNwQixHQUFJLEVBQUUsQ0FBRSxFQUFDO0lBQy9FLENBQUMsTUFDSSxJQUFLLElBQUksQ0FBQ1YsSUFBSSxLQUFLLGVBQWUsRUFBRztNQUN4Q1UsR0FBRyxHQUFJLDBCQUF5QnVCLGtCQUFrQixDQUFHLEdBQUVILE9BQVEsSUFBRyxJQUFJLENBQUNwQixHQUFJLEVBQUUsQ0FBRSxFQUFDO0lBQ2xGLENBQUMsTUFDSSxJQUFLLElBQUksQ0FBQ1YsSUFBSSxLQUFLLGNBQWMsRUFBRztNQUN2Q1UsR0FBRyxHQUFJLHlCQUF3QnVCLGtCQUFrQixDQUFHLEdBQUVILE9BQVEsSUFBRyxJQUFJLENBQUNwQixHQUFJLEVBQUUsQ0FBRSxFQUFDO0lBQ2pGO0lBQ0EsSUFBSyxJQUFJLENBQUNFLG1CQUFtQixFQUFHO01BQzlCRixHQUFHLEdBQUksR0FBRUEsR0FBSSxJQUFHLElBQUksQ0FBQ0UsbUJBQW9CLEVBQUM7SUFDNUM7SUFFQSxPQUFPO01BQ0xzQixZQUFZLEVBQUUsSUFBSSxDQUFDekMsUUFBUSxDQUFDMEMsSUFBSTtNQUNoQ3BDLElBQUksRUFBRSxJQUFJLENBQUNHLEtBQUs7TUFDaEJRLEdBQUcsRUFBRUEsR0FBRztNQUNSc0IsU0FBUyxFQUFFSSxJQUFJLENBQUNDLEdBQUcsQ0FBQztJQUN0QixDQUFDO0VBQ0g7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPakMsaUJBQWlCQSxDQUFFRixLQUFLLEVBQUc7SUFDaEMsT0FBT0EsS0FBSyxDQUFDb0MsSUFBSSxDQUFFLEdBQUksQ0FBQztFQUMxQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsU0FBU0EsQ0FBQSxFQUFHO0lBQ1YsT0FBTztNQUNMN0MsV0FBVyxFQUFFLElBQUksQ0FBQ0EsV0FBVztNQUM3QlcsT0FBTyxFQUFFLElBQUksQ0FBQ0EsT0FBTyxDQUFDbUMsR0FBRyxDQUFFQyxVQUFVLElBQUlBLFVBQVUsQ0FBQ0YsU0FBUyxDQUFDLENBQUUsQ0FBQztNQUNqRXhCLFFBQVEsRUFBRSxJQUFJLENBQUNBLFFBQVE7TUFDdkJDLE9BQU8sRUFBRSxJQUFJLENBQUNBLE9BQU87TUFDckJDLEtBQUssRUFBRSxJQUFJLENBQUNBLEtBQUs7TUFDakJ0QixtQkFBbUIsRUFBRSxJQUFJLENBQUNBLG1CQUFtQjtNQUM3Q0MsMkJBQTJCLEVBQUUsSUFBSSxDQUFDQTtJQUNwQyxDQUFDO0VBQ0g7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU84QyxXQUFXQSxDQUFFakQsUUFBUSxFQUFFa0QsYUFBYSxFQUFHO0lBQzVDLE1BQU01QyxJQUFJLEdBQUcsSUFBSVIsSUFBSSxDQUFFRSxRQUFRLEVBQUVrRCxhQUFhLENBQUNqRCxXQUFXLEVBQUVpRCxhQUFhLENBQUNoRCxtQkFBbUIsRUFBRWdELGFBQWEsQ0FBQy9DLDJCQUE0QixDQUFDO0lBRTFJRyxJQUFJLENBQUNnQixRQUFRLEdBQUc0QixhQUFhLENBQUM1QixRQUFRO0lBQ3RDaEIsSUFBSSxDQUFDaUIsT0FBTyxHQUFHMkIsYUFBYSxDQUFDM0IsT0FBTztJQUNwQ2pCLElBQUksQ0FBQ2tCLEtBQUssR0FBRzBCLGFBQWEsQ0FBQzFCLEtBQUs7SUFFaENsQixJQUFJLENBQUNNLE9BQU8sR0FBR3NDLGFBQWEsQ0FBQ3RDLE9BQU8sQ0FBQ21DLEdBQUcsQ0FBRUksbUJBQW1CLElBQUkxRCxVQUFVLENBQUN3RCxXQUFXLENBQUUzQyxJQUFJLEVBQUU2QyxtQkFBb0IsQ0FBRSxDQUFDO0lBRXRILE9BQU83QyxJQUFJO0VBQ2I7QUFDRjtBQUVBOEMsTUFBTSxDQUFDQyxPQUFPLEdBQUd2RCxJQUFJIn0=