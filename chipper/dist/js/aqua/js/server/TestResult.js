// Copyright 2020-2021, University of Colorado Boulder

/**
 * Holds data related to a specific test result
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const assert = require('assert');
class TestResult {
  /**
   * @param {Test} test
   * @param {boolean} passed
   * @param {number} [milliseconds]
   * @param {string|null} [message]
   */
  constructor(test, passed, milliseconds = 0, message = null) {
    assert(typeof passed === 'boolean', 'passed should be a boolean');

    // @public {Test}
    this.test = test;

    // @public {boolean}
    this.passed = passed;

    // @public {number}
    this.milliseconds = milliseconds;

    // @public {string|null}
    this.message = message || null;
  }

  /**
   * Creates a pojo-style object for saving/restoring
   * @public
   *
   * @returns {Object}
   */
  serialize() {
    return {
      passed: this.passed,
      message: this.message,
      milliseconds: this.milliseconds
    };
  }

  /**
   * Creates the in-memory representation from the serialized form
   * @public
   *
   * @param {Test} test
   * @param {Object} serialization
   * @returns {TestResult}
   */
  static deserialize(test, serialization) {
    return new TestResult(test, serialization.passed, serialization.milliseconds, serialization.message);
  }
}
module.exports = TestResult;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3NlcnQiLCJyZXF1aXJlIiwiVGVzdFJlc3VsdCIsImNvbnN0cnVjdG9yIiwidGVzdCIsInBhc3NlZCIsIm1pbGxpc2Vjb25kcyIsIm1lc3NhZ2UiLCJzZXJpYWxpemUiLCJkZXNlcmlhbGl6ZSIsInNlcmlhbGl6YXRpb24iLCJtb2R1bGUiLCJleHBvcnRzIl0sInNvdXJjZXMiOlsiVGVzdFJlc3VsdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBIb2xkcyBkYXRhIHJlbGF0ZWQgdG8gYSBzcGVjaWZpYyB0ZXN0IHJlc3VsdFxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuXHJcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XHJcblxyXG5jbGFzcyBUZXN0UmVzdWx0IHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1Rlc3R9IHRlc3RcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHBhc3NlZFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbbWlsbGlzZWNvbmRzXVxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfG51bGx9IFttZXNzYWdlXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0ZXN0LCBwYXNzZWQsIG1pbGxpc2Vjb25kcyA9IDAsIG1lc3NhZ2UgPSBudWxsICkge1xyXG4gICAgYXNzZXJ0KCB0eXBlb2YgcGFzc2VkID09PSAnYm9vbGVhbicsICdwYXNzZWQgc2hvdWxkIGJlIGEgYm9vbGVhbicgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtUZXN0fVxyXG4gICAgdGhpcy50ZXN0ID0gdGVzdDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufVxyXG4gICAgdGhpcy5wYXNzZWQgPSBwYXNzZWQ7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy5taWxsaXNlY29uZHMgPSBtaWxsaXNlY29uZHM7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7c3RyaW5nfG51bGx9XHJcbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlIHx8IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgcG9qby1zdHlsZSBvYmplY3QgZm9yIHNhdmluZy9yZXN0b3JpbmdcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxyXG4gICAqL1xyXG4gIHNlcmlhbGl6ZSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHBhc3NlZDogdGhpcy5wYXNzZWQsXHJcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcclxuICAgICAgbWlsbGlzZWNvbmRzOiB0aGlzLm1pbGxpc2Vjb25kc1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIGluLW1lbW9yeSByZXByZXNlbnRhdGlvbiBmcm9tIHRoZSBzZXJpYWxpemVkIGZvcm1cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1Rlc3R9IHRlc3RcclxuICAgKiBAcGFyYW0ge09iamVjdH0gc2VyaWFsaXphdGlvblxyXG4gICAqIEByZXR1cm5zIHtUZXN0UmVzdWx0fVxyXG4gICAqL1xyXG4gIHN0YXRpYyBkZXNlcmlhbGl6ZSggdGVzdCwgc2VyaWFsaXphdGlvbiApIHtcclxuICAgIHJldHVybiBuZXcgVGVzdFJlc3VsdCggdGVzdCwgc2VyaWFsaXphdGlvbi5wYXNzZWQsIHNlcmlhbGl6YXRpb24ubWlsbGlzZWNvbmRzLCBzZXJpYWxpemF0aW9uLm1lc3NhZ2UgKTtcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGVzdFJlc3VsdDtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE1BQU1BLE1BQU0sR0FBR0MsT0FBTyxDQUFFLFFBQVMsQ0FBQztBQUVsQyxNQUFNQyxVQUFVLENBQUM7RUFDZjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsSUFBSSxFQUFFQyxNQUFNLEVBQUVDLFlBQVksR0FBRyxDQUFDLEVBQUVDLE9BQU8sR0FBRyxJQUFJLEVBQUc7SUFDNURQLE1BQU0sQ0FBRSxPQUFPSyxNQUFNLEtBQUssU0FBUyxFQUFFLDRCQUE2QixDQUFDOztJQUVuRTtJQUNBLElBQUksQ0FBQ0QsSUFBSSxHQUFHQSxJQUFJOztJQUVoQjtJQUNBLElBQUksQ0FBQ0MsTUFBTSxHQUFHQSxNQUFNOztJQUVwQjtJQUNBLElBQUksQ0FBQ0MsWUFBWSxHQUFHQSxZQUFZOztJQUVoQztJQUNBLElBQUksQ0FBQ0MsT0FBTyxHQUFHQSxPQUFPLElBQUksSUFBSTtFQUNoQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsU0FBU0EsQ0FBQSxFQUFHO0lBQ1YsT0FBTztNQUNMSCxNQUFNLEVBQUUsSUFBSSxDQUFDQSxNQUFNO01BQ25CRSxPQUFPLEVBQUUsSUFBSSxDQUFDQSxPQUFPO01BQ3JCRCxZQUFZLEVBQUUsSUFBSSxDQUFDQTtJQUNyQixDQUFDO0VBQ0g7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU9HLFdBQVdBLENBQUVMLElBQUksRUFBRU0sYUFBYSxFQUFHO0lBQ3hDLE9BQU8sSUFBSVIsVUFBVSxDQUFFRSxJQUFJLEVBQUVNLGFBQWEsQ0FBQ0wsTUFBTSxFQUFFSyxhQUFhLENBQUNKLFlBQVksRUFBRUksYUFBYSxDQUFDSCxPQUFRLENBQUM7RUFDeEc7QUFDRjtBQUVBSSxNQUFNLENBQUNDLE9BQU8sR0FBR1YsVUFBVSJ9