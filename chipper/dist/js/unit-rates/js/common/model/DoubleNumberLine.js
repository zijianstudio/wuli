// Copyright 2016-2023, University of Colorado Boulder

/**
 * Model for the double number line.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import unitRates from '../../unitRates.js';

// constants
const FIXED_AXIS_VALUES = ['numerator', 'denominator'];
const SHARED_OPTIONS = {
  axisLabel: '',
  // {string} label for the axis
  maxDecimals: 1,
  // {number} maximum number of decimal places
  trimZeros: false // {boolean} whether to trim trailing zeros from decimal places
};

export default class DoubleNumberLine {
  /**
   * @param {Property.<number>} unitRateProperty
   * @param {Object} [options]
   */
  constructor(unitRateProperty, options) {
    options = merge({
      fixedAxis: 'denominator',
      // {string} which of the axes has a fixed (immutable) range
      fixedAxisRange: new Range(0, 10),
      // {Range} range of the fixed axis
      numeratorOptions: null,
      // {*} options specific to the rate's numerator, see below
      denominatorOptions: null,
      // {*} options specific to the rate's denominator, see below

      // {function(number,number):boolean} determines whether a marker is major
      isMajorMarker: (numerator, denominator) => true
    }, options);
    assert && assert(_.includes(FIXED_AXIS_VALUES, options.fixedAxis), `invalid fixedAxis: ${options.fixedAxis}`);

    // @public (read-only) options for the numerator (top) number line
    this.numeratorOptions = merge({}, SHARED_OPTIONS, options.numeratorOptions);

    // @public (read-only) options for the denominator (bottom) number line
    this.denominatorOptions = merge({}, SHARED_OPTIONS, options.denominatorOptions);

    // @public (read-only) {Property.<number>}
    this.unitRateProperty = unitRateProperty;

    // @public (read-only) {Marker[]} markers must be added/removed via addMarker/removeMarker
    this.markers = createObservableArray();

    // @public (read-only) {function(number,number):boolean}
    this.isMajorMarker = options.isMajorMarker;

    // @public (read-only) which of the axes has a fixed range, see FIXED_AXIS_VALUES
    this.fixedAxis = options.fixedAxis;

    // @private defined below
    this.numeratorRangeProperty = null;
    this.denominatorRangeProperty = null;
    if (options.fixedAxis === 'numerator') {
      // numerator range is immutable
      this.numeratorRangeProperty = new Property(options.fixedAxisRange);
      this.numeratorRangeProperty.lazyLink(range => {
        // unlink not needed, exists for sim lifetime
        throw new Error('numeratorRangeProperty should not change');
      });

      // denominator range is mutable, dispose not needed, exists for sim lifetime
      this.denominatorRangeProperty = new DerivedProperty([this.numeratorRangeProperty, unitRateProperty], (numeratorRange, unitRate) => {
        return new Range(numeratorRange.min / unitRate, numeratorRange.max / unitRate);
      });

      // when the denominator range changes, adjust the denominator of all markers,
      // unlink not needed, exists for sim lifetime
      this.denominatorRangeProperty.link(denominatorRange => {
        this.markers.forEach(marker => {
          marker.denominatorProperty.value = marker.numeratorProperty.value / unitRateProperty.value;
        });
      });
    } else {
      // denominator range is immutable
      this.denominatorRangeProperty = new Property(options.fixedAxisRange);
      this.denominatorRangeProperty.lazyLink(range => {
        // unlink not needed, exists for sim lifetime
        throw new Error('denominatorRangeProperty should not change');
      });

      // numerator range is mutable, dispose not needed, exists for sim lifetime
      this.numeratorRangeProperty = new DerivedProperty([this.denominatorRangeProperty, unitRateProperty], (denominatorRange, unitRate) => {
        return new Range(denominatorRange.min * unitRate, denominatorRange.max * unitRate);
      });

      // when the numerator range changes, adjust the numerator of all markers
      // unlink not needed, exists for sim lifetime
      this.numeratorRangeProperty.link(numeratorRange => {
        this.markers.forEach(marker => {
          marker.numeratorProperty.value = marker.denominatorProperty.value * unitRateProperty.value;
        });
      });
    }

    // @public {Property.<number|null>} marker that can be removed by pressing the undo button.
    // A single level of undo is supported.
    this.undoMarkerProperty = new Property(null);
  }

  // @public
  reset() {
    this.markers.reset();
    this.undoMarkerProperty.reset();
  }

  /**
   * Maps a rate's numerator from model to view coordinate frame.
   * @param {number} numerator - numerator in model coordinate frame
   * @param {number} viewMax - numerator's maximum in view coordinate frame
   * @returns {number}
   * @public
   */
  modelToViewNumerator(numerator, viewMax) {
    return Utils.linear(this.numeratorRangeProperty.value.min, this.numeratorRangeProperty.value.max, 0, viewMax, numerator);
  }

  /**
   * Maps a rate's denominator from model to view coordinate frame.
   * @param {number} denominator - denominator in model coordinate frame
   * @param {number} viewMax - denominator's maximum in view coordinate frame
   * @returns {number}
   * @public
   */
  modelToViewDenominator(denominator, viewMax) {
    return Utils.linear(this.denominatorRangeProperty.value.min, this.denominatorRangeProperty.value.max, 0, viewMax, denominator);
  }

  /**
   * Gets the maximum value that fits on the numerator (top) axis.
   * @returns {number}
   * @public
   */
  getMaxNumerator() {
    return this.numeratorRangeProperty.value.max;
  }

  /**
   * Gets the maximum value that fits on the denominator (bottom) axis.
   * @returns {number}
   * @public
   */
  getMaxDenominator() {
    return this.denominatorRangeProperty.value.max;
  }

  /**
   * This is a request to add a marker, subject to rules about uniqueness and marker precedence.
   * The rules are complicated to describe, so please consult the implementation.
   * Calling this function may result in a lower precedence marker being deleted as a side effect.
   * @param {Marker} marker
   * @returns {boolean} true if the marker was added, false if the request was ignored
   * @public
   */
  addMarker(marker) {
    assert && assert(!this.markers.includes(marker), `attempt to add marker again: ${marker}`);
    let wasAdded = false; //{boolean} state to determine whether the marker was added or not

    // look for a marker that conflicts with this one (has same numerator or denominator)
    const conflictingMarker = this.getConflictingMarker(marker);
    if (!conflictingMarker) {
      // if there is no marker that conflicts with this one, then simply add the marker
      this.markers.add(marker);
      wasAdded = true;
    } else if (conflictingMarker.precedenceOf(marker) >= 0) {
      // Replace with higher or same precedence marker.
      // Need to replace same precedence marker so that undo marker is properly set.
      this.removeMarker(conflictingMarker);
      if (this.undoMarkerProperty.value === conflictingMarker) {
        this.undoMarkerProperty.value = null;
      }
      this.markers.add(marker);
      wasAdded = true;
    } else {
      // ignore lower precedence marker
      unitRates.log && unitRates.log(`ignoring lower precedence marker: ${marker.toString()}`);
    }
    return wasAdded;
  }

  /**
   * Removes a marker.
   * @param {Marker} marker
   * @private
   */
  removeMarker(marker) {
    assert && assert(this.markers.includes(marker), `attempt to remove an unknown marker: ${marker}`);
    this.markers.remove(marker);
  }

  /**
   * Gets a marker that conflicts with the specified marker.
   * Two markers conflict if they have the same numerator or denominator, which is possible due to rounding errors.
   * @param {Marker} marker
   * @returns {Marker|null} null if there is no conflicting
   * @private
   */
  getConflictingMarker(marker) {
    let conflictingMarker = null;
    for (let i = 0; i < this.markers.length && !conflictingMarker; i++) {
      if (marker.conflictsWith(this.markers[i])) {
        conflictingMarker = this.markers[i];
      }
    }
    return conflictingMarker;
  }

  /**
   * Does this marker fall within the range of the axes?
   * @param {Marker} marker
   * @returns {boolean}
   * @public
   */
  markerIsInRange(marker) {
    return this.numeratorRangeProperty.value.contains(marker.numeratorProperty.value) && this.denominatorRangeProperty.value.contains(marker.denominatorProperty.value);
  }

  /**
   * Undoes (removes) the undo marker. If there is no undo marker, this is a no-op.
   * @public
   */
  undo() {
    const undoMarker = this.undoMarkerProperty.value;
    if (undoMarker) {
      assert && assert(this.markers.includes(undoMarker), `unexpected undoMarker: ${undoMarker}`);
      this.undoMarkerProperty.value = null;
      this.removeMarker(undoMarker);
    }
  }

  /**
   * Erases all markers that are erasable.
   * @public
   */
  erase() {
    this.undoMarkerProperty.reset();

    // remove all markers that are erasable
    this.markers.forEach(marker => {
      if (marker.erasable) {
        this.removeMarker(marker);
      }
    });
  }
}
unitRates.register('DoubleNumberLine', DoubleNumberLine);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlJhbmdlIiwiVXRpbHMiLCJtZXJnZSIsInVuaXRSYXRlcyIsIkZJWEVEX0FYSVNfVkFMVUVTIiwiU0hBUkVEX09QVElPTlMiLCJheGlzTGFiZWwiLCJtYXhEZWNpbWFscyIsInRyaW1aZXJvcyIsIkRvdWJsZU51bWJlckxpbmUiLCJjb25zdHJ1Y3RvciIsInVuaXRSYXRlUHJvcGVydHkiLCJvcHRpb25zIiwiZml4ZWRBeGlzIiwiZml4ZWRBeGlzUmFuZ2UiLCJudW1lcmF0b3JPcHRpb25zIiwiZGVub21pbmF0b3JPcHRpb25zIiwiaXNNYWpvck1hcmtlciIsIm51bWVyYXRvciIsImRlbm9taW5hdG9yIiwiYXNzZXJ0IiwiXyIsImluY2x1ZGVzIiwibWFya2VycyIsIm51bWVyYXRvclJhbmdlUHJvcGVydHkiLCJkZW5vbWluYXRvclJhbmdlUHJvcGVydHkiLCJsYXp5TGluayIsInJhbmdlIiwiRXJyb3IiLCJudW1lcmF0b3JSYW5nZSIsInVuaXRSYXRlIiwibWluIiwibWF4IiwibGluayIsImRlbm9taW5hdG9yUmFuZ2UiLCJmb3JFYWNoIiwibWFya2VyIiwiZGVub21pbmF0b3JQcm9wZXJ0eSIsInZhbHVlIiwibnVtZXJhdG9yUHJvcGVydHkiLCJ1bmRvTWFya2VyUHJvcGVydHkiLCJyZXNldCIsIm1vZGVsVG9WaWV3TnVtZXJhdG9yIiwidmlld01heCIsImxpbmVhciIsIm1vZGVsVG9WaWV3RGVub21pbmF0b3IiLCJnZXRNYXhOdW1lcmF0b3IiLCJnZXRNYXhEZW5vbWluYXRvciIsImFkZE1hcmtlciIsIndhc0FkZGVkIiwiY29uZmxpY3RpbmdNYXJrZXIiLCJnZXRDb25mbGljdGluZ01hcmtlciIsImFkZCIsInByZWNlZGVuY2VPZiIsInJlbW92ZU1hcmtlciIsImxvZyIsInRvU3RyaW5nIiwicmVtb3ZlIiwiaSIsImxlbmd0aCIsImNvbmZsaWN0c1dpdGgiLCJtYXJrZXJJc0luUmFuZ2UiLCJjb250YWlucyIsInVuZG8iLCJ1bmRvTWFya2VyIiwiZXJhc2UiLCJlcmFzYWJsZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRG91YmxlTnVtYmVyTGluZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3IgdGhlIGRvdWJsZSBudW1iZXIgbGluZS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHVuaXRSYXRlcyBmcm9tICcuLi8uLi91bml0UmF0ZXMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEZJWEVEX0FYSVNfVkFMVUVTID0gWyAnbnVtZXJhdG9yJywgJ2Rlbm9taW5hdG9yJyBdO1xyXG5jb25zdCBTSEFSRURfT1BUSU9OUyA9IHtcclxuICBheGlzTGFiZWw6ICcnLCAvLyB7c3RyaW5nfSBsYWJlbCBmb3IgdGhlIGF4aXNcclxuICBtYXhEZWNpbWFsczogMSwgLy8ge251bWJlcn0gbWF4aW11bSBudW1iZXIgb2YgZGVjaW1hbCBwbGFjZXNcclxuICB0cmltWmVyb3M6IGZhbHNlIC8vIHtib29sZWFufSB3aGV0aGVyIHRvIHRyaW0gdHJhaWxpbmcgemVyb3MgZnJvbSBkZWNpbWFsIHBsYWNlc1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRG91YmxlTnVtYmVyTGluZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IHVuaXRSYXRlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHVuaXRSYXRlUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGZpeGVkQXhpczogJ2Rlbm9taW5hdG9yJywgLy8ge3N0cmluZ30gd2hpY2ggb2YgdGhlIGF4ZXMgaGFzIGEgZml4ZWQgKGltbXV0YWJsZSkgcmFuZ2VcclxuICAgICAgZml4ZWRBeGlzUmFuZ2U6IG5ldyBSYW5nZSggMCwgMTAgKSwgLy8ge1JhbmdlfSByYW5nZSBvZiB0aGUgZml4ZWQgYXhpc1xyXG4gICAgICBudW1lcmF0b3JPcHRpb25zOiBudWxsLCAvLyB7Kn0gb3B0aW9ucyBzcGVjaWZpYyB0byB0aGUgcmF0ZSdzIG51bWVyYXRvciwgc2VlIGJlbG93XHJcbiAgICAgIGRlbm9taW5hdG9yT3B0aW9uczogbnVsbCwgLy8geyp9IG9wdGlvbnMgc3BlY2lmaWMgdG8gdGhlIHJhdGUncyBkZW5vbWluYXRvciwgc2VlIGJlbG93XHJcblxyXG4gICAgICAvLyB7ZnVuY3Rpb24obnVtYmVyLG51bWJlcik6Ym9vbGVhbn0gZGV0ZXJtaW5lcyB3aGV0aGVyIGEgbWFya2VyIGlzIG1ham9yXHJcbiAgICAgIGlzTWFqb3JNYXJrZXI6ICggbnVtZXJhdG9yLCBkZW5vbWluYXRvciApID0+IHRydWVcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCBGSVhFRF9BWElTX1ZBTFVFUywgb3B0aW9ucy5maXhlZEF4aXMgKSxcclxuICAgICAgYGludmFsaWQgZml4ZWRBeGlzOiAke29wdGlvbnMuZml4ZWRBeGlzfWAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIG9wdGlvbnMgZm9yIHRoZSBudW1lcmF0b3IgKHRvcCkgbnVtYmVyIGxpbmVcclxuICAgIHRoaXMubnVtZXJhdG9yT3B0aW9ucyA9IG1lcmdlKCB7fSwgU0hBUkVEX09QVElPTlMsIG9wdGlvbnMubnVtZXJhdG9yT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgb3B0aW9ucyBmb3IgdGhlIGRlbm9taW5hdG9yIChib3R0b20pIG51bWJlciBsaW5lXHJcbiAgICB0aGlzLmRlbm9taW5hdG9yT3B0aW9ucyA9IG1lcmdlKCB7fSwgU0hBUkVEX09QVElPTlMsIG9wdGlvbnMuZGVub21pbmF0b3JPcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7UHJvcGVydHkuPG51bWJlcj59XHJcbiAgICB0aGlzLnVuaXRSYXRlUHJvcGVydHkgPSB1bml0UmF0ZVByb3BlcnR5O1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge01hcmtlcltdfSBtYXJrZXJzIG11c3QgYmUgYWRkZWQvcmVtb3ZlZCB2aWEgYWRkTWFya2VyL3JlbW92ZU1hcmtlclxyXG4gICAgdGhpcy5tYXJrZXJzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7ZnVuY3Rpb24obnVtYmVyLG51bWJlcik6Ym9vbGVhbn1cclxuICAgIHRoaXMuaXNNYWpvck1hcmtlciA9IG9wdGlvbnMuaXNNYWpvck1hcmtlcjtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHdoaWNoIG9mIHRoZSBheGVzIGhhcyBhIGZpeGVkIHJhbmdlLCBzZWUgRklYRURfQVhJU19WQUxVRVNcclxuICAgIHRoaXMuZml4ZWRBeGlzID0gb3B0aW9ucy5maXhlZEF4aXM7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgZGVmaW5lZCBiZWxvd1xyXG4gICAgdGhpcy5udW1lcmF0b3JSYW5nZVByb3BlcnR5ID0gbnVsbDtcclxuICAgIHRoaXMuZGVub21pbmF0b3JSYW5nZVByb3BlcnR5ID0gbnVsbDtcclxuXHJcbiAgICBpZiAoIG9wdGlvbnMuZml4ZWRBeGlzID09PSAnbnVtZXJhdG9yJyApIHtcclxuXHJcbiAgICAgIC8vIG51bWVyYXRvciByYW5nZSBpcyBpbW11dGFibGVcclxuICAgICAgdGhpcy5udW1lcmF0b3JSYW5nZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBvcHRpb25zLmZpeGVkQXhpc1JhbmdlICk7XHJcbiAgICAgIHRoaXMubnVtZXJhdG9yUmFuZ2VQcm9wZXJ0eS5sYXp5TGluayggcmFuZ2UgPT4geyAgLy8gdW5saW5rIG5vdCBuZWVkZWQsIGV4aXN0cyBmb3Igc2ltIGxpZmV0aW1lXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnbnVtZXJhdG9yUmFuZ2VQcm9wZXJ0eSBzaG91bGQgbm90IGNoYW5nZScgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gZGVub21pbmF0b3IgcmFuZ2UgaXMgbXV0YWJsZSwgZGlzcG9zZSBub3QgbmVlZGVkLCBleGlzdHMgZm9yIHNpbSBsaWZldGltZVxyXG4gICAgICB0aGlzLmRlbm9taW5hdG9yUmFuZ2VQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5udW1lcmF0b3JSYW5nZVByb3BlcnR5LCB1bml0UmF0ZVByb3BlcnR5IF0sXHJcbiAgICAgICAgKCBudW1lcmF0b3JSYW5nZSwgdW5pdFJhdGUgKSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gbmV3IFJhbmdlKCBudW1lcmF0b3JSYW5nZS5taW4gLyB1bml0UmF0ZSwgbnVtZXJhdG9yUmFuZ2UubWF4IC8gdW5pdFJhdGUgKTtcclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAvLyB3aGVuIHRoZSBkZW5vbWluYXRvciByYW5nZSBjaGFuZ2VzLCBhZGp1c3QgdGhlIGRlbm9taW5hdG9yIG9mIGFsbCBtYXJrZXJzLFxyXG4gICAgICAvLyB1bmxpbmsgbm90IG5lZWRlZCwgZXhpc3RzIGZvciBzaW0gbGlmZXRpbWVcclxuICAgICAgdGhpcy5kZW5vbWluYXRvclJhbmdlUHJvcGVydHkubGluayggZGVub21pbmF0b3JSYW5nZSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJzLmZvckVhY2goIG1hcmtlciA9PiB7XHJcbiAgICAgICAgICBtYXJrZXIuZGVub21pbmF0b3JQcm9wZXJ0eS52YWx1ZSA9IG1hcmtlci5udW1lcmF0b3JQcm9wZXJ0eS52YWx1ZSAvIHVuaXRSYXRlUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIGRlbm9taW5hdG9yIHJhbmdlIGlzIGltbXV0YWJsZVxyXG4gICAgICB0aGlzLmRlbm9taW5hdG9yUmFuZ2VQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggb3B0aW9ucy5maXhlZEF4aXNSYW5nZSApO1xyXG4gICAgICB0aGlzLmRlbm9taW5hdG9yUmFuZ2VQcm9wZXJ0eS5sYXp5TGluayggcmFuZ2UgPT4geyAvLyB1bmxpbmsgbm90IG5lZWRlZCwgZXhpc3RzIGZvciBzaW0gbGlmZXRpbWVcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdkZW5vbWluYXRvclJhbmdlUHJvcGVydHkgc2hvdWxkIG5vdCBjaGFuZ2UnICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIG51bWVyYXRvciByYW5nZSBpcyBtdXRhYmxlLCBkaXNwb3NlIG5vdCBuZWVkZWQsIGV4aXN0cyBmb3Igc2ltIGxpZmV0aW1lXHJcbiAgICAgIHRoaXMubnVtZXJhdG9yUmFuZ2VQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5kZW5vbWluYXRvclJhbmdlUHJvcGVydHksIHVuaXRSYXRlUHJvcGVydHkgXSxcclxuICAgICAgICAoIGRlbm9taW5hdG9yUmFuZ2UsIHVuaXRSYXRlICkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIG5ldyBSYW5nZSggZGVub21pbmF0b3JSYW5nZS5taW4gKiB1bml0UmF0ZSwgZGVub21pbmF0b3JSYW5nZS5tYXggKiB1bml0UmF0ZSApO1xyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIHdoZW4gdGhlIG51bWVyYXRvciByYW5nZSBjaGFuZ2VzLCBhZGp1c3QgdGhlIG51bWVyYXRvciBvZiBhbGwgbWFya2Vyc1xyXG4gICAgICAvLyB1bmxpbmsgbm90IG5lZWRlZCwgZXhpc3RzIGZvciBzaW0gbGlmZXRpbWVcclxuICAgICAgdGhpcy5udW1lcmF0b3JSYW5nZVByb3BlcnR5LmxpbmsoIG51bWVyYXRvclJhbmdlID0+IHtcclxuICAgICAgICB0aGlzLm1hcmtlcnMuZm9yRWFjaCggbWFya2VyID0+IHtcclxuICAgICAgICAgIG1hcmtlci5udW1lcmF0b3JQcm9wZXJ0eS52YWx1ZSA9IG1hcmtlci5kZW5vbWluYXRvclByb3BlcnR5LnZhbHVlICogdW5pdFJhdGVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyfG51bGw+fSBtYXJrZXIgdGhhdCBjYW4gYmUgcmVtb3ZlZCBieSBwcmVzc2luZyB0aGUgdW5kbyBidXR0b24uXHJcbiAgICAvLyBBIHNpbmdsZSBsZXZlbCBvZiB1bmRvIGlzIHN1cHBvcnRlZC5cclxuICAgIHRoaXMudW5kb01hcmtlclByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBudWxsICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLm1hcmtlcnMucmVzZXQoKTtcclxuICAgIHRoaXMudW5kb01hcmtlclByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXBzIGEgcmF0ZSdzIG51bWVyYXRvciBmcm9tIG1vZGVsIHRvIHZpZXcgY29vcmRpbmF0ZSBmcmFtZS5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtZXJhdG9yIC0gbnVtZXJhdG9yIGluIG1vZGVsIGNvb3JkaW5hdGUgZnJhbWVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmlld01heCAtIG51bWVyYXRvcidzIG1heGltdW0gaW4gdmlldyBjb29yZGluYXRlIGZyYW1lXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbW9kZWxUb1ZpZXdOdW1lcmF0b3IoIG51bWVyYXRvciwgdmlld01heCApIHtcclxuICAgIHJldHVybiBVdGlscy5saW5lYXIoXHJcbiAgICAgIHRoaXMubnVtZXJhdG9yUmFuZ2VQcm9wZXJ0eS52YWx1ZS5taW4sIHRoaXMubnVtZXJhdG9yUmFuZ2VQcm9wZXJ0eS52YWx1ZS5tYXgsXHJcbiAgICAgIDAsIHZpZXdNYXgsXHJcbiAgICAgIG51bWVyYXRvciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFwcyBhIHJhdGUncyBkZW5vbWluYXRvciBmcm9tIG1vZGVsIHRvIHZpZXcgY29vcmRpbmF0ZSBmcmFtZS5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVub21pbmF0b3IgLSBkZW5vbWluYXRvciBpbiBtb2RlbCBjb29yZGluYXRlIGZyYW1lXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZpZXdNYXggLSBkZW5vbWluYXRvcidzIG1heGltdW0gaW4gdmlldyBjb29yZGluYXRlIGZyYW1lXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbW9kZWxUb1ZpZXdEZW5vbWluYXRvciggZGVub21pbmF0b3IsIHZpZXdNYXggKSB7XHJcbiAgICByZXR1cm4gVXRpbHMubGluZWFyKFxyXG4gICAgICB0aGlzLmRlbm9taW5hdG9yUmFuZ2VQcm9wZXJ0eS52YWx1ZS5taW4sIHRoaXMuZGVub21pbmF0b3JSYW5nZVByb3BlcnR5LnZhbHVlLm1heCxcclxuICAgICAgMCwgdmlld01heCxcclxuICAgICAgZGVub21pbmF0b3IgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG1heGltdW0gdmFsdWUgdGhhdCBmaXRzIG9uIHRoZSBudW1lcmF0b3IgKHRvcCkgYXhpcy5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRNYXhOdW1lcmF0b3IoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5udW1lcmF0b3JSYW5nZVByb3BlcnR5LnZhbHVlLm1heDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG1heGltdW0gdmFsdWUgdGhhdCBmaXRzIG9uIHRoZSBkZW5vbWluYXRvciAoYm90dG9tKSBheGlzLlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE1heERlbm9taW5hdG9yKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZGVub21pbmF0b3JSYW5nZVByb3BlcnR5LnZhbHVlLm1heDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoaXMgaXMgYSByZXF1ZXN0IHRvIGFkZCBhIG1hcmtlciwgc3ViamVjdCB0byBydWxlcyBhYm91dCB1bmlxdWVuZXNzIGFuZCBtYXJrZXIgcHJlY2VkZW5jZS5cclxuICAgKiBUaGUgcnVsZXMgYXJlIGNvbXBsaWNhdGVkIHRvIGRlc2NyaWJlLCBzbyBwbGVhc2UgY29uc3VsdCB0aGUgaW1wbGVtZW50YXRpb24uXHJcbiAgICogQ2FsbGluZyB0aGlzIGZ1bmN0aW9uIG1heSByZXN1bHQgaW4gYSBsb3dlciBwcmVjZWRlbmNlIG1hcmtlciBiZWluZyBkZWxldGVkIGFzIGEgc2lkZSBlZmZlY3QuXHJcbiAgICogQHBhcmFtIHtNYXJrZXJ9IG1hcmtlclxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSBtYXJrZXIgd2FzIGFkZGVkLCBmYWxzZSBpZiB0aGUgcmVxdWVzdCB3YXMgaWdub3JlZFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhZGRNYXJrZXIoIG1hcmtlciApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5tYXJrZXJzLmluY2x1ZGVzKCBtYXJrZXIgKSwgYGF0dGVtcHQgdG8gYWRkIG1hcmtlciBhZ2FpbjogJHttYXJrZXJ9YCApO1xyXG5cclxuICAgIGxldCB3YXNBZGRlZCA9IGZhbHNlOyAvL3tib29sZWFufSBzdGF0ZSB0byBkZXRlcm1pbmUgd2hldGhlciB0aGUgbWFya2VyIHdhcyBhZGRlZCBvciBub3RcclxuXHJcbiAgICAvLyBsb29rIGZvciBhIG1hcmtlciB0aGF0IGNvbmZsaWN0cyB3aXRoIHRoaXMgb25lIChoYXMgc2FtZSBudW1lcmF0b3Igb3IgZGVub21pbmF0b3IpXHJcbiAgICBjb25zdCBjb25mbGljdGluZ01hcmtlciA9IHRoaXMuZ2V0Q29uZmxpY3RpbmdNYXJrZXIoIG1hcmtlciApO1xyXG5cclxuICAgIGlmICggIWNvbmZsaWN0aW5nTWFya2VyICkge1xyXG5cclxuICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gbWFya2VyIHRoYXQgY29uZmxpY3RzIHdpdGggdGhpcyBvbmUsIHRoZW4gc2ltcGx5IGFkZCB0aGUgbWFya2VyXHJcbiAgICAgIHRoaXMubWFya2Vycy5hZGQoIG1hcmtlciApO1xyXG4gICAgICB3YXNBZGRlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggY29uZmxpY3RpbmdNYXJrZXIucHJlY2VkZW5jZU9mKCBtYXJrZXIgKSA+PSAwICkge1xyXG5cclxuICAgICAgLy8gUmVwbGFjZSB3aXRoIGhpZ2hlciBvciBzYW1lIHByZWNlZGVuY2UgbWFya2VyLlxyXG4gICAgICAvLyBOZWVkIHRvIHJlcGxhY2Ugc2FtZSBwcmVjZWRlbmNlIG1hcmtlciBzbyB0aGF0IHVuZG8gbWFya2VyIGlzIHByb3Blcmx5IHNldC5cclxuICAgICAgdGhpcy5yZW1vdmVNYXJrZXIoIGNvbmZsaWN0aW5nTWFya2VyICk7XHJcbiAgICAgIGlmICggdGhpcy51bmRvTWFya2VyUHJvcGVydHkudmFsdWUgPT09IGNvbmZsaWN0aW5nTWFya2VyICkge1xyXG4gICAgICAgIHRoaXMudW5kb01hcmtlclByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1hcmtlcnMuYWRkKCBtYXJrZXIgKTtcclxuICAgICAgd2FzQWRkZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBpZ25vcmUgbG93ZXIgcHJlY2VkZW5jZSBtYXJrZXJcclxuICAgICAgdW5pdFJhdGVzLmxvZyAmJiB1bml0UmF0ZXMubG9nKCBgaWdub3JpbmcgbG93ZXIgcHJlY2VkZW5jZSBtYXJrZXI6ICR7bWFya2VyLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB3YXNBZGRlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBtYXJrZXIuXHJcbiAgICogQHBhcmFtIHtNYXJrZXJ9IG1hcmtlclxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcmVtb3ZlTWFya2VyKCBtYXJrZXIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm1hcmtlcnMuaW5jbHVkZXMoIG1hcmtlciApLCBgYXR0ZW1wdCB0byByZW1vdmUgYW4gdW5rbm93biBtYXJrZXI6ICR7bWFya2VyfWAgKTtcclxuICAgIHRoaXMubWFya2Vycy5yZW1vdmUoIG1hcmtlciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBhIG1hcmtlciB0aGF0IGNvbmZsaWN0cyB3aXRoIHRoZSBzcGVjaWZpZWQgbWFya2VyLlxyXG4gICAqIFR3byBtYXJrZXJzIGNvbmZsaWN0IGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSBudW1lcmF0b3Igb3IgZGVub21pbmF0b3IsIHdoaWNoIGlzIHBvc3NpYmxlIGR1ZSB0byByb3VuZGluZyBlcnJvcnMuXHJcbiAgICogQHBhcmFtIHtNYXJrZXJ9IG1hcmtlclxyXG4gICAqIEByZXR1cm5zIHtNYXJrZXJ8bnVsbH0gbnVsbCBpZiB0aGVyZSBpcyBubyBjb25mbGljdGluZ1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0Q29uZmxpY3RpbmdNYXJrZXIoIG1hcmtlciApIHtcclxuICAgIGxldCBjb25mbGljdGluZ01hcmtlciA9IG51bGw7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoICYmICFjb25mbGljdGluZ01hcmtlcjsgaSsrICkge1xyXG4gICAgICBpZiAoIG1hcmtlci5jb25mbGljdHNXaXRoKCB0aGlzLm1hcmtlcnNbIGkgXSApICkge1xyXG4gICAgICAgIGNvbmZsaWN0aW5nTWFya2VyID0gdGhpcy5tYXJrZXJzWyBpIF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBjb25mbGljdGluZ01hcmtlcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERvZXMgdGhpcyBtYXJrZXIgZmFsbCB3aXRoaW4gdGhlIHJhbmdlIG9mIHRoZSBheGVzP1xyXG4gICAqIEBwYXJhbSB7TWFya2VyfSBtYXJrZXJcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbWFya2VySXNJblJhbmdlKCBtYXJrZXIgKSB7XHJcbiAgICByZXR1cm4gKCB0aGlzLm51bWVyYXRvclJhbmdlUHJvcGVydHkudmFsdWUuY29udGFpbnMoIG1hcmtlci5udW1lcmF0b3JQcm9wZXJ0eS52YWx1ZSApICYmXHJcbiAgICAgICAgICAgICB0aGlzLmRlbm9taW5hdG9yUmFuZ2VQcm9wZXJ0eS52YWx1ZS5jb250YWlucyggbWFya2VyLmRlbm9taW5hdG9yUHJvcGVydHkudmFsdWUgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVW5kb2VzIChyZW1vdmVzKSB0aGUgdW5kbyBtYXJrZXIuIElmIHRoZXJlIGlzIG5vIHVuZG8gbWFya2VyLCB0aGlzIGlzIGEgbm8tb3AuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHVuZG8oKSB7XHJcbiAgICBjb25zdCB1bmRvTWFya2VyID0gdGhpcy51bmRvTWFya2VyUHJvcGVydHkudmFsdWU7XHJcbiAgICBpZiAoIHVuZG9NYXJrZXIgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubWFya2Vycy5pbmNsdWRlcyggdW5kb01hcmtlciApLCBgdW5leHBlY3RlZCB1bmRvTWFya2VyOiAke3VuZG9NYXJrZXJ9YCApO1xyXG4gICAgICB0aGlzLnVuZG9NYXJrZXJQcm9wZXJ0eS52YWx1ZSA9IG51bGw7XHJcbiAgICAgIHRoaXMucmVtb3ZlTWFya2VyKCB1bmRvTWFya2VyICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFcmFzZXMgYWxsIG1hcmtlcnMgdGhhdCBhcmUgZXJhc2FibGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGVyYXNlKCkge1xyXG5cclxuICAgIHRoaXMudW5kb01hcmtlclByb3BlcnR5LnJlc2V0KCk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGFsbCBtYXJrZXJzIHRoYXQgYXJlIGVyYXNhYmxlXHJcbiAgICB0aGlzLm1hcmtlcnMuZm9yRWFjaCggbWFya2VyID0+IHtcclxuICAgICAgaWYgKCBtYXJrZXIuZXJhc2FibGUgKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVNYXJrZXIoIG1hcmtlciApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG51bml0UmF0ZXMucmVnaXN0ZXIoICdEb3VibGVOdW1iZXJMaW5lJywgRG91YmxlTnVtYmVy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