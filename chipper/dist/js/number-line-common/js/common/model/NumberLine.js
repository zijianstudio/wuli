// Copyright 2020-2021, University of Colorado Boulder

/**
 * NumberLine is a simple model of a number line.  It tracks points that are on the line, and those points can be added
 * and removed.  Since the line is one-dimensional, the points have only a single value.  This model is a somewhat
 * "pure" representation of a number line in the sense that it is not projected into space, nor is it limited in its
 * span.  Other subclasses add that functionality.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import numberLineCommon from '../../numberLineCommon.js';
import NumberLinePoint from './NumberLinePoint.js';
class NumberLine {
  /**
   * {Object} [options]
   * @public
   */
  constructor(options) {
    options = merge({
      // {{initialValue:number, color:Color}[]} - array of point specifications that describe what points should exist
      // on the number line when constructed and after a reset
      initialPointSpecs: [],
      // {function(number):number} - constraint for values that points can take on, integer values by default
      constrainPointValue: proposedValue => Utils.roundSymmetric(proposedValue),
      preventOverlap: true
    }, options);

    // @private {Object{ initialValue, color}[]} - array of point specifications that describe what points should
    // exist on the number line when constructed and after a reset
    this.initialPointSpecs = options.initialPointSpecs;

    // @private {function(number):number}
    this.constrainPointValue = options.constrainPointValue;

    // @public (read-only) {ObservableArrayDef.<NumberLinePoint>} - array of points on this number line
    this.residentPoints = createObservableArray();

    // Hook up a listener to make sure that the points don't land on top of one another.
    this.residentPoints.addItemAddedListener(addedPoint => {
      // listener to make sure point lands in a good point when released
      const pointIsDraggingListener = dragging => {
        // Do nothing if dragging, or if this is the only point at this position, or if overlap is allowed.
        if (dragging || !options.preventOverlap || this.getPointsAt(addedPoint.valueProperty.value).length <= 1) {
          return;
        }

        // There is already a point at this position, so we have to choose another.
        let beginningValue = addedPoint.mostRecentlyProposedValue;
        if (beginningValue === null) {
          beginningValue = addedPoint.valueProperty.value;
        }
        addedPoint.valueProperty.value = this.getNearestUnoccupiedValue(beginningValue);
      };
      addedPoint.isDraggingProperty.link(pointIsDraggingListener);

      // Remove the listener when the point is removed from the number line.
      const pointRemovalListener = removedPoint => {
        if (removedPoint === addedPoint) {
          removedPoint.isDraggingProperty.unlink(pointIsDraggingListener);
          this.residentPoints.removeItemRemovedListener(pointRemovalListener);
        }
      };
      this.residentPoints.addItemRemovedListener(pointRemovalListener);
    });

    // Add the initial points.
    this.addInitialPoints();
  }

  /**
   * Add the initial set of points to the number line, used during construction and reset/
   * @private
   */
  addInitialPoints() {
    this.initialPointSpecs.forEach(pointSpec => {
      assert && assert(!this.hasPointAt(pointSpec.initialValue), 'a point already exists at the specified location');
      this.addPoint(new NumberLinePoint(this, {
        initialValue: pointSpec.initialValue,
        initialColor: pointSpec.color
      }));
    });
  }

  /**
   * Add a point to the number line.
   * @param {NumberLinePoint} numberLinePoint
   * @public
   */
  addPoint(numberLinePoint) {
    this.residentPoints.add(numberLinePoint);
  }

  /**
   * Remove a point from the number line.
   * @param {NumberLinePoint} numberLinePoint
   * @public
   */
  removePoint(numberLinePoint) {
    this.residentPoints.remove(numberLinePoint);
  }

  /**
   * Check whether a specific instance of a number line point is on this number line.
   * @param {NumberLinePoint} numberLinePoint
   * @returns {boolean}
   * @public
   */
  hasPoint(numberLinePoint) {
    return this.residentPoints.includes(numberLinePoint);
  }

  /**
   * Remove all points from the number line.
   * @public
   */
  removeAllPoints() {
    this.residentPoints.clear();
  }

  /**
   * Given a floating point number, return the closest integer value that is allowed on the number line.
   * @param {number} proposedValue
   * @returns {number}
   * @public
   */
  getConstrainedValue(proposedValue) {
    return this.constrainPointValue(proposedValue);
  }

  /**
   * Returns true if any of the resident points on the number line are at the provided value.
   * @param {number} value
   * @returns {boolean}
   * @public
   */
  hasPointAt(value) {
    return this.residentPoints.some(point => point.valueProperty.value === value);
  }

  /**
   * Get a list of all points at the provided value.
   * @param {number} value
   * @returns {NumberLinePoint[]}
   * @private
   */
  getPointsAt(value) {
    return this.residentPoints.filter(point => point.valueProperty.value === value);
  }

  /**
   * Get the closest valid value that isn't already occupied by a point.
   * @param {number} value
   * @public
   */
  getNearestUnoccupiedValue(value) {
    const roundedValue = Utils.roundSymmetric(value);
    let currentDistance = 0;
    const getValidValuesAtDistance = distance => {
      return [roundedValue - distance, roundedValue + distance].filter(newValue => !this.hasPointAt(newValue) && this.displayedRangeProperty.value.contains(newValue));
    };
    let validValues = getValidValuesAtDistance(currentDistance);
    while (validValues.length === 0) {
      currentDistance++;
      validValues = getValidValuesAtDistance(currentDistance);
    }
    return _.sortBy(validValues, [validValue => Math.abs(validValue - value)])[0];
  }

  /**
   * Reset to initial state.
   * @public
   */
  reset() {
    this.removeAllPoints();
    this.addInitialPoints();
  }
}
numberLineCommon.register('NumberLine', NumberLine);
export default NumberLine;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJVdGlscyIsIm1lcmdlIiwibnVtYmVyTGluZUNvbW1vbiIsIk51bWJlckxpbmVQb2ludCIsIk51bWJlckxpbmUiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJpbml0aWFsUG9pbnRTcGVjcyIsImNvbnN0cmFpblBvaW50VmFsdWUiLCJwcm9wb3NlZFZhbHVlIiwicm91bmRTeW1tZXRyaWMiLCJwcmV2ZW50T3ZlcmxhcCIsInJlc2lkZW50UG9pbnRzIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJhZGRlZFBvaW50IiwicG9pbnRJc0RyYWdnaW5nTGlzdGVuZXIiLCJkcmFnZ2luZyIsImdldFBvaW50c0F0IiwidmFsdWVQcm9wZXJ0eSIsInZhbHVlIiwibGVuZ3RoIiwiYmVnaW5uaW5nVmFsdWUiLCJtb3N0UmVjZW50bHlQcm9wb3NlZFZhbHVlIiwiZ2V0TmVhcmVzdFVub2NjdXBpZWRWYWx1ZSIsImlzRHJhZ2dpbmdQcm9wZXJ0eSIsImxpbmsiLCJwb2ludFJlbW92YWxMaXN0ZW5lciIsInJlbW92ZWRQb2ludCIsInVubGluayIsInJlbW92ZUl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwiYWRkSW5pdGlhbFBvaW50cyIsImZvckVhY2giLCJwb2ludFNwZWMiLCJhc3NlcnQiLCJoYXNQb2ludEF0IiwiaW5pdGlhbFZhbHVlIiwiYWRkUG9pbnQiLCJpbml0aWFsQ29sb3IiLCJjb2xvciIsIm51bWJlckxpbmVQb2ludCIsImFkZCIsInJlbW92ZVBvaW50IiwicmVtb3ZlIiwiaGFzUG9pbnQiLCJpbmNsdWRlcyIsInJlbW92ZUFsbFBvaW50cyIsImNsZWFyIiwiZ2V0Q29uc3RyYWluZWRWYWx1ZSIsInNvbWUiLCJwb2ludCIsImZpbHRlciIsInJvdW5kZWRWYWx1ZSIsImN1cnJlbnREaXN0YW5jZSIsImdldFZhbGlkVmFsdWVzQXREaXN0YW5jZSIsImRpc3RhbmNlIiwibmV3VmFsdWUiLCJkaXNwbGF5ZWRSYW5nZVByb3BlcnR5IiwiY29udGFpbnMiLCJ2YWxpZFZhbHVlcyIsIl8iLCJzb3J0QnkiLCJ2YWxpZFZhbHVlIiwiTWF0aCIsImFicyIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOdW1iZXJMaW5lLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE51bWJlckxpbmUgaXMgYSBzaW1wbGUgbW9kZWwgb2YgYSBudW1iZXIgbGluZS4gIEl0IHRyYWNrcyBwb2ludHMgdGhhdCBhcmUgb24gdGhlIGxpbmUsIGFuZCB0aG9zZSBwb2ludHMgY2FuIGJlIGFkZGVkXHJcbiAqIGFuZCByZW1vdmVkLiAgU2luY2UgdGhlIGxpbmUgaXMgb25lLWRpbWVuc2lvbmFsLCB0aGUgcG9pbnRzIGhhdmUgb25seSBhIHNpbmdsZSB2YWx1ZS4gIFRoaXMgbW9kZWwgaXMgYSBzb21ld2hhdFxyXG4gKiBcInB1cmVcIiByZXByZXNlbnRhdGlvbiBvZiBhIG51bWJlciBsaW5lIGluIHRoZSBzZW5zZSB0aGF0IGl0IGlzIG5vdCBwcm9qZWN0ZWQgaW50byBzcGFjZSwgbm9yIGlzIGl0IGxpbWl0ZWQgaW4gaXRzXHJcbiAqIHNwYW4uICBPdGhlciBzdWJjbGFzc2VzIGFkZCB0aGF0IGZ1bmN0aW9uYWxpdHkuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgbnVtYmVyTGluZUNvbW1vbiBmcm9tICcuLi8uLi9udW1iZXJMaW5lQ29tbW9uLmpzJztcclxuaW1wb3J0IE51bWJlckxpbmVQb2ludCBmcm9tICcuL051bWJlckxpbmVQb2ludC5qcyc7XHJcblxyXG5jbGFzcyBOdW1iZXJMaW5lIHtcclxuXHJcbiAgLyoqXHJcbiAgICoge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8ge3tpbml0aWFsVmFsdWU6bnVtYmVyLCBjb2xvcjpDb2xvcn1bXX0gLSBhcnJheSBvZiBwb2ludCBzcGVjaWZpY2F0aW9ucyB0aGF0IGRlc2NyaWJlIHdoYXQgcG9pbnRzIHNob3VsZCBleGlzdFxyXG4gICAgICAvLyBvbiB0aGUgbnVtYmVyIGxpbmUgd2hlbiBjb25zdHJ1Y3RlZCBhbmQgYWZ0ZXIgYSByZXNldFxyXG4gICAgICBpbml0aWFsUG9pbnRTcGVjczogW10sXHJcblxyXG4gICAgICAvLyB7ZnVuY3Rpb24obnVtYmVyKTpudW1iZXJ9IC0gY29uc3RyYWludCBmb3IgdmFsdWVzIHRoYXQgcG9pbnRzIGNhbiB0YWtlIG9uLCBpbnRlZ2VyIHZhbHVlcyBieSBkZWZhdWx0XHJcbiAgICAgIGNvbnN0cmFpblBvaW50VmFsdWU6IHByb3Bvc2VkVmFsdWUgPT4gVXRpbHMucm91bmRTeW1tZXRyaWMoIHByb3Bvc2VkVmFsdWUgKSxcclxuXHJcbiAgICAgIHByZXZlbnRPdmVybGFwOiB0cnVlXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge09iamVjdHsgaW5pdGlhbFZhbHVlLCBjb2xvcn1bXX0gLSBhcnJheSBvZiBwb2ludCBzcGVjaWZpY2F0aW9ucyB0aGF0IGRlc2NyaWJlIHdoYXQgcG9pbnRzIHNob3VsZFxyXG4gICAgLy8gZXhpc3Qgb24gdGhlIG51bWJlciBsaW5lIHdoZW4gY29uc3RydWN0ZWQgYW5kIGFmdGVyIGEgcmVzZXRcclxuICAgIHRoaXMuaW5pdGlhbFBvaW50U3BlY3MgPSBvcHRpb25zLmluaXRpYWxQb2ludFNwZWNzO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbihudW1iZXIpOm51bWJlcn1cclxuICAgIHRoaXMuY29uc3RyYWluUG9pbnRWYWx1ZSA9IG9wdGlvbnMuY29uc3RyYWluUG9pbnRWYWx1ZTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtPYnNlcnZhYmxlQXJyYXlEZWYuPE51bWJlckxpbmVQb2ludD59IC0gYXJyYXkgb2YgcG9pbnRzIG9uIHRoaXMgbnVtYmVyIGxpbmVcclxuICAgIHRoaXMucmVzaWRlbnRQb2ludHMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcclxuXHJcbiAgICAvLyBIb29rIHVwIGEgbGlzdGVuZXIgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHBvaW50cyBkb24ndCBsYW5kIG9uIHRvcCBvZiBvbmUgYW5vdGhlci5cclxuICAgIHRoaXMucmVzaWRlbnRQb2ludHMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIGFkZGVkUG9pbnQgPT4ge1xyXG5cclxuICAgICAgLy8gbGlzdGVuZXIgdG8gbWFrZSBzdXJlIHBvaW50IGxhbmRzIGluIGEgZ29vZCBwb2ludCB3aGVuIHJlbGVhc2VkXHJcbiAgICAgIGNvbnN0IHBvaW50SXNEcmFnZ2luZ0xpc3RlbmVyID0gZHJhZ2dpbmcgPT4ge1xyXG5cclxuICAgICAgICAvLyBEbyBub3RoaW5nIGlmIGRyYWdnaW5nLCBvciBpZiB0aGlzIGlzIHRoZSBvbmx5IHBvaW50IGF0IHRoaXMgcG9zaXRpb24sIG9yIGlmIG92ZXJsYXAgaXMgYWxsb3dlZC5cclxuICAgICAgICBpZiAoIGRyYWdnaW5nIHx8ICFvcHRpb25zLnByZXZlbnRPdmVybGFwIHx8IHRoaXMuZ2V0UG9pbnRzQXQoIGFkZGVkUG9pbnQudmFsdWVQcm9wZXJ0eS52YWx1ZSApLmxlbmd0aCA8PSAxICkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVGhlcmUgaXMgYWxyZWFkeSBhIHBvaW50IGF0IHRoaXMgcG9zaXRpb24sIHNvIHdlIGhhdmUgdG8gY2hvb3NlIGFub3RoZXIuXHJcbiAgICAgICAgbGV0IGJlZ2lubmluZ1ZhbHVlID0gYWRkZWRQb2ludC5tb3N0UmVjZW50bHlQcm9wb3NlZFZhbHVlO1xyXG4gICAgICAgIGlmICggYmVnaW5uaW5nVmFsdWUgPT09IG51bGwgKSB7XHJcbiAgICAgICAgICBiZWdpbm5pbmdWYWx1ZSA9IGFkZGVkUG9pbnQudmFsdWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYWRkZWRQb2ludC52YWx1ZVByb3BlcnR5LnZhbHVlID0gdGhpcy5nZXROZWFyZXN0VW5vY2N1cGllZFZhbHVlKCBiZWdpbm5pbmdWYWx1ZSApO1xyXG4gICAgICB9O1xyXG4gICAgICBhZGRlZFBvaW50LmlzRHJhZ2dpbmdQcm9wZXJ0eS5saW5rKCBwb2ludElzRHJhZ2dpbmdMaXN0ZW5lciApO1xyXG5cclxuICAgICAgLy8gUmVtb3ZlIHRoZSBsaXN0ZW5lciB3aGVuIHRoZSBwb2ludCBpcyByZW1vdmVkIGZyb20gdGhlIG51bWJlciBsaW5lLlxyXG4gICAgICBjb25zdCBwb2ludFJlbW92YWxMaXN0ZW5lciA9IHJlbW92ZWRQb2ludCA9PiB7XHJcbiAgICAgICAgaWYgKCByZW1vdmVkUG9pbnQgPT09IGFkZGVkUG9pbnQgKSB7XHJcbiAgICAgICAgICByZW1vdmVkUG9pbnQuaXNEcmFnZ2luZ1Byb3BlcnR5LnVubGluayggcG9pbnRJc0RyYWdnaW5nTGlzdGVuZXIgKTtcclxuICAgICAgICAgIHRoaXMucmVzaWRlbnRQb2ludHMucmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciggcG9pbnRSZW1vdmFsTGlzdGVuZXIgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIHRoaXMucmVzaWRlbnRQb2ludHMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggcG9pbnRSZW1vdmFsTGlzdGVuZXIgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGluaXRpYWwgcG9pbnRzLlxyXG4gICAgdGhpcy5hZGRJbml0aWFsUG9pbnRzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgdGhlIGluaXRpYWwgc2V0IG9mIHBvaW50cyB0byB0aGUgbnVtYmVyIGxpbmUsIHVzZWQgZHVyaW5nIGNvbnN0cnVjdGlvbiBhbmQgcmVzZXQvXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBhZGRJbml0aWFsUG9pbnRzKCkge1xyXG4gICAgdGhpcy5pbml0aWFsUG9pbnRTcGVjcy5mb3JFYWNoKCBwb2ludFNwZWMgPT4ge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5oYXNQb2ludEF0KCBwb2ludFNwZWMuaW5pdGlhbFZhbHVlICksICdhIHBvaW50IGFscmVhZHkgZXhpc3RzIGF0IHRoZSBzcGVjaWZpZWQgbG9jYXRpb24nICk7XHJcbiAgICAgIHRoaXMuYWRkUG9pbnQoIG5ldyBOdW1iZXJMaW5lUG9pbnQoIHRoaXMsIHtcclxuICAgICAgICBpbml0aWFsVmFsdWU6IHBvaW50U3BlYy5pbml0aWFsVmFsdWUsXHJcbiAgICAgICAgaW5pdGlhbENvbG9yOiBwb2ludFNwZWMuY29sb3JcclxuICAgICAgfSApICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSBwb2ludCB0byB0aGUgbnVtYmVyIGxpbmUuXHJcbiAgICogQHBhcmFtIHtOdW1iZXJMaW5lUG9pbnR9IG51bWJlckxpbmVQb2ludFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhZGRQb2ludCggbnVtYmVyTGluZVBvaW50ICkge1xyXG4gICAgdGhpcy5yZXNpZGVudFBvaW50cy5hZGQoIG51bWJlckxpbmVQb2ludCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGEgcG9pbnQgZnJvbSB0aGUgbnVtYmVyIGxpbmUuXHJcbiAgICogQHBhcmFtIHtOdW1iZXJMaW5lUG9pbnR9IG51bWJlckxpbmVQb2ludFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZW1vdmVQb2ludCggbnVtYmVyTGluZVBvaW50ICkge1xyXG4gICAgdGhpcy5yZXNpZGVudFBvaW50cy5yZW1vdmUoIG51bWJlckxpbmVQb2ludCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgd2hldGhlciBhIHNwZWNpZmljIGluc3RhbmNlIG9mIGEgbnVtYmVyIGxpbmUgcG9pbnQgaXMgb24gdGhpcyBudW1iZXIgbGluZS5cclxuICAgKiBAcGFyYW0ge051bWJlckxpbmVQb2ludH0gbnVtYmVyTGluZVBvaW50XHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGhhc1BvaW50KCBudW1iZXJMaW5lUG9pbnQgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5yZXNpZGVudFBvaW50cy5pbmNsdWRlcyggbnVtYmVyTGluZVBvaW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYWxsIHBvaW50cyBmcm9tIHRoZSBudW1iZXIgbGluZS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVtb3ZlQWxsUG9pbnRzKCkge1xyXG4gICAgdGhpcy5yZXNpZGVudFBvaW50cy5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2l2ZW4gYSBmbG9hdGluZyBwb2ludCBudW1iZXIsIHJldHVybiB0aGUgY2xvc2VzdCBpbnRlZ2VyIHZhbHVlIHRoYXQgaXMgYWxsb3dlZCBvbiB0aGUgbnVtYmVyIGxpbmUuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHByb3Bvc2VkVmFsdWVcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRDb25zdHJhaW5lZFZhbHVlKCBwcm9wb3NlZFZhbHVlICkge1xyXG4gICAgcmV0dXJuIHRoaXMuY29uc3RyYWluUG9pbnRWYWx1ZSggcHJvcG9zZWRWYWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIGFueSBvZiB0aGUgcmVzaWRlbnQgcG9pbnRzIG9uIHRoZSBudW1iZXIgbGluZSBhcmUgYXQgdGhlIHByb3ZpZGVkIHZhbHVlLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBoYXNQb2ludEF0KCB2YWx1ZSApIHtcclxuICAgIHJldHVybiB0aGlzLnJlc2lkZW50UG9pbnRzLnNvbWUoIHBvaW50ID0+IHBvaW50LnZhbHVlUHJvcGVydHkudmFsdWUgPT09IHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBsaXN0IG9mIGFsbCBwb2ludHMgYXQgdGhlIHByb3ZpZGVkIHZhbHVlLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxyXG4gICAqIEByZXR1cm5zIHtOdW1iZXJMaW5lUG9pbnRbXX1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldFBvaW50c0F0KCB2YWx1ZSApIHtcclxuICAgIHJldHVybiB0aGlzLnJlc2lkZW50UG9pbnRzLmZpbHRlciggcG9pbnQgPT4gcG9pbnQudmFsdWVQcm9wZXJ0eS52YWx1ZSA9PT0gdmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgY2xvc2VzdCB2YWxpZCB2YWx1ZSB0aGF0IGlzbid0IGFscmVhZHkgb2NjdXBpZWQgYnkgYSBwb2ludC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TmVhcmVzdFVub2NjdXBpZWRWYWx1ZSggdmFsdWUgKSB7XHJcbiAgICBjb25zdCByb3VuZGVkVmFsdWUgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggdmFsdWUgKTtcclxuICAgIGxldCBjdXJyZW50RGlzdGFuY2UgPSAwO1xyXG4gICAgY29uc3QgZ2V0VmFsaWRWYWx1ZXNBdERpc3RhbmNlID0gZGlzdGFuY2UgPT4ge1xyXG4gICAgICByZXR1cm4gWyByb3VuZGVkVmFsdWUgLSBkaXN0YW5jZSwgcm91bmRlZFZhbHVlICsgZGlzdGFuY2UgXVxyXG4gICAgICAgIC5maWx0ZXIoIG5ld1ZhbHVlID0+ICF0aGlzLmhhc1BvaW50QXQoIG5ld1ZhbHVlICkgJiYgdGhpcy5kaXNwbGF5ZWRSYW5nZVByb3BlcnR5LnZhbHVlLmNvbnRhaW5zKCBuZXdWYWx1ZSApICk7XHJcbiAgICB9O1xyXG4gICAgbGV0IHZhbGlkVmFsdWVzID0gZ2V0VmFsaWRWYWx1ZXNBdERpc3RhbmNlKCBjdXJyZW50RGlzdGFuY2UgKTtcclxuICAgIHdoaWxlICggdmFsaWRWYWx1ZXMubGVuZ3RoID09PSAwICkge1xyXG4gICAgICBjdXJyZW50RGlzdGFuY2UrKztcclxuICAgICAgdmFsaWRWYWx1ZXMgPSBnZXRWYWxpZFZhbHVlc0F0RGlzdGFuY2UoIGN1cnJlbnREaXN0YW5jZSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIF8uc29ydEJ5KCB2YWxpZFZhbHVlcywgWyB2YWxpZFZhbHVlID0+IE1hdGguYWJzKCB2YWxpZFZhbHVlIC0gdmFsdWUgKSBdIClbIDAgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IHRvIGluaXRpYWwgc3RhdGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5yZW1vdmVBbGxQb2ludHMoKTtcclxuICAgIHRoaXMuYWRkSW5pdGlhbFBvaW50cygpO1xyXG4gIH1cclxufVxyXG5cclxubnVtYmVyTGluZUNvbW1vbi5yZWdpc3RlciggJ051bWJlckxpbmUnLCBOdW1iZXJMaW5lICk7XHJcbmV4cG9ydCBkZWZhdWx0IE51bWJlckxpbmU7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHFCQUFxQixNQUFNLDhDQUE4QztBQUNoRixPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLGVBQWUsTUFBTSxzQkFBc0I7QUFFbEQsTUFBTUMsVUFBVSxDQUFDO0VBRWY7QUFDRjtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsT0FBTyxFQUFHO0lBRXJCQSxPQUFPLEdBQUdMLEtBQUssQ0FBRTtNQUVmO01BQ0E7TUFDQU0saUJBQWlCLEVBQUUsRUFBRTtNQUVyQjtNQUNBQyxtQkFBbUIsRUFBRUMsYUFBYSxJQUFJVCxLQUFLLENBQUNVLGNBQWMsQ0FBRUQsYUFBYyxDQUFDO01BRTNFRSxjQUFjLEVBQUU7SUFDbEIsQ0FBQyxFQUFFTCxPQUFRLENBQUM7O0lBRVo7SUFDQTtJQUNBLElBQUksQ0FBQ0MsaUJBQWlCLEdBQUdELE9BQU8sQ0FBQ0MsaUJBQWlCOztJQUVsRDtJQUNBLElBQUksQ0FBQ0MsbUJBQW1CLEdBQUdGLE9BQU8sQ0FBQ0UsbUJBQW1COztJQUV0RDtJQUNBLElBQUksQ0FBQ0ksY0FBYyxHQUFHYixxQkFBcUIsQ0FBQyxDQUFDOztJQUU3QztJQUNBLElBQUksQ0FBQ2EsY0FBYyxDQUFDQyxvQkFBb0IsQ0FBRUMsVUFBVSxJQUFJO01BRXREO01BQ0EsTUFBTUMsdUJBQXVCLEdBQUdDLFFBQVEsSUFBSTtRQUUxQztRQUNBLElBQUtBLFFBQVEsSUFBSSxDQUFDVixPQUFPLENBQUNLLGNBQWMsSUFBSSxJQUFJLENBQUNNLFdBQVcsQ0FBRUgsVUFBVSxDQUFDSSxhQUFhLENBQUNDLEtBQU0sQ0FBQyxDQUFD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