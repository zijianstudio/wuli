// Copyright 2015-2023, University of Colorado Boulder

/**
 * Model container for 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingConstants from '../CurveFittingConstants.js';
import createPoints from './createPoints.js';
import Curve from './Curve.js';
import FitType from './FitType.js';
class CurveFittingModel {
  constructor() {
    // @public {Property.<number>} order of the polynomial that describes the curve, valid values are 1, 2, 3
    this.orderProperty = new NumberProperty(1, {
      validValues: [1, 2, 3],
      hasListenerOrderDependencies: true // TODO: https://github.com/phetsims/curve-fitting/issues/169
    });

    // @public {Property.<FitType>}, the method of fitting the curve to data points
    this.fitProperty = new EnumerationDeprecatedProperty(FitType, FitType.BEST);

    // @public {Property.<number>[]}, user input values for coefficients of the polynomial, starting from lowest
    // order x^0 to x^3
    const makeNumberPropertyFromRange = range => new NumberProperty(range.defaultValue, {
      range: range
    });
    this.sliderPropertyArray = [makeNumberPropertyFromRange(CurveFittingConstants.CONSTANT_RANGE), makeNumberPropertyFromRange(CurveFittingConstants.LINEAR_RANGE), makeNumberPropertyFromRange(CurveFittingConstants.QUADRATIC_RANGE), makeNumberPropertyFromRange(CurveFittingConstants.CUBIC_RANGE)];

    // @public {Points} - Points for plotting curve. This includes points that are outside the bounds of the graph,
    // so be careful to call getRelevantPoints when using points in calculations. Order of the points doesn't matter.
    this.points = createPoints();

    // @public {Curve} - the model of the curve
    this.curve = new Curve(this.points, this.sliderPropertyArray, this.orderProperty, this.fitProperty);

    // @private {function}
    this.updateCurveFit = () => {
      this.curve.updateFit();
    };

    // validate Property values and update curve fit; unlink unnecessary present for the lifetime of the sim
    this.orderProperty.link(() => {
      this.updateCurveFit();
    });

    // unlink unnecessary, present for the lifetime of the sim
    this.fitProperty.link(this.updateCurveFit);

    // a change of any of the value sliders force an update of the curve model
    // unlinks unnecessary: present for lifetime of the sim
    this.sliderPropertyArray.forEach(sliderProperty => {
      sliderProperty.link(this.updateCurveFit);
    });

    // Add internal listeners for adding and removing points
    this.points.addItemAddedListener(point => {
      this.addPoint(point);
    });
    this.points.addItemRemovedListener(point => {
      this.removePoint(point);
    });
  }

  /**
   * Resets the model
   * @public
   */
  reset() {
    this.sliderPropertyArray.forEach(sliderProperty => {
      sliderProperty.reset();
    });
    this.orderProperty.reset();
    this.fitProperty.reset();
    this.points.reset();
    this.curve.reset();
  }

  /**
   * Adds a point
   *
   * @param {Point} point
   * @private
   */
  addPoint(point) {
    // These are unlinked in removePoint
    point.positionProperty.link(this.updateCurveFit);
    point.isInsideGraphProperty.link(this.updateCurveFit);
    point.deltaProperty.link(this.updateCurveFit);
    const removePointListener = () => {
      if (this.points.includes(point)) {
        this.points.remove(point);
      }
      point.returnToOriginEmitter.removeListener(removePointListener);
    };

    // remove points when they have returned to the bucket
    // listener removes itself when called
    point.returnToOriginEmitter.addListener(removePointListener);
  }

  /**
   * Removes a point
   *
   * @param {Point} point
   * @private
   */
  removePoint(point) {
    // These were linked in addPoint
    point.positionProperty.unlink(this.updateCurveFit);
    point.isInsideGraphProperty.unlink(this.updateCurveFit);
    point.deltaProperty.unlink(this.updateCurveFit);
    this.updateCurveFit();
  }
}
curveFitting.register('CurveFittingModel', CurveFittingModel);
export default CurveFittingModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSIsIk51bWJlclByb3BlcnR5IiwiY3VydmVGaXR0aW5nIiwiQ3VydmVGaXR0aW5nQ29uc3RhbnRzIiwiY3JlYXRlUG9pbnRzIiwiQ3VydmUiLCJGaXRUeXBlIiwiQ3VydmVGaXR0aW5nTW9kZWwiLCJjb25zdHJ1Y3RvciIsIm9yZGVyUHJvcGVydHkiLCJ2YWxpZFZhbHVlcyIsImhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXMiLCJmaXRQcm9wZXJ0eSIsIkJFU1QiLCJtYWtlTnVtYmVyUHJvcGVydHlGcm9tUmFuZ2UiLCJyYW5nZSIsImRlZmF1bHRWYWx1ZSIsInNsaWRlclByb3BlcnR5QXJyYXkiLCJDT05TVEFOVF9SQU5HRSIsIkxJTkVBUl9SQU5HRSIsIlFVQURSQVRJQ19SQU5HRSIsIkNVQklDX1JBTkdFIiwicG9pbnRzIiwiY3VydmUiLCJ1cGRhdGVDdXJ2ZUZpdCIsInVwZGF0ZUZpdCIsImxpbmsiLCJmb3JFYWNoIiwic2xpZGVyUHJvcGVydHkiLCJhZGRJdGVtQWRkZWRMaXN0ZW5lciIsInBvaW50IiwiYWRkUG9pbnQiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwicmVtb3ZlUG9pbnQiLCJyZXNldCIsInBvc2l0aW9uUHJvcGVydHkiLCJpc0luc2lkZUdyYXBoUHJvcGVydHkiLCJkZWx0YVByb3BlcnR5IiwicmVtb3ZlUG9pbnRMaXN0ZW5lciIsImluY2x1ZGVzIiwicmVtb3ZlIiwicmV0dXJuVG9PcmlnaW5FbWl0dGVyIiwicmVtb3ZlTGlzdGVuZXIiLCJhZGRMaXN0ZW5lciIsInVubGluayIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ3VydmVGaXR0aW5nTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgY29udGFpbmVyIGZvciAnQ3VydmUgRml0dGluZycgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1sZWFybmVyKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgY3VydmVGaXR0aW5nIGZyb20gJy4uLy4uL2N1cnZlRml0dGluZy5qcyc7XHJcbmltcG9ydCBDdXJ2ZUZpdHRpbmdDb25zdGFudHMgZnJvbSAnLi4vQ3VydmVGaXR0aW5nQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IGNyZWF0ZVBvaW50cyBmcm9tICcuL2NyZWF0ZVBvaW50cy5qcyc7XHJcbmltcG9ydCBDdXJ2ZSBmcm9tICcuL0N1cnZlLmpzJztcclxuaW1wb3J0IEZpdFR5cGUgZnJvbSAnLi9GaXRUeXBlLmpzJztcclxuXHJcbmNsYXNzIEN1cnZlRml0dGluZ01vZGVsIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IG9yZGVyIG9mIHRoZSBwb2x5bm9taWFsIHRoYXQgZGVzY3JpYmVzIHRoZSBjdXJ2ZSwgdmFsaWQgdmFsdWVzIGFyZSAxLCAyLCAzXHJcbiAgICB0aGlzLm9yZGVyUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDEsIHtcclxuICAgICAgdmFsaWRWYWx1ZXM6IFsgMSwgMiwgMyBdLFxyXG4gICAgICBoYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzOiB0cnVlIC8vIFRPRE86IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jdXJ2ZS1maXR0aW5nL2lzc3Vlcy8xNjlcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Rml0VHlwZT59LCB0aGUgbWV0aG9kIG9mIGZpdHRpbmcgdGhlIGN1cnZlIHRvIGRhdGEgcG9pbnRzXHJcbiAgICB0aGlzLmZpdFByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5KCBGaXRUeXBlLCBGaXRUeXBlLkJFU1QgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPltdfSwgdXNlciBpbnB1dCB2YWx1ZXMgZm9yIGNvZWZmaWNpZW50cyBvZiB0aGUgcG9seW5vbWlhbCwgc3RhcnRpbmcgZnJvbSBsb3dlc3RcclxuICAgIC8vIG9yZGVyIHheMCB0byB4XjNcclxuICAgIGNvbnN0IG1ha2VOdW1iZXJQcm9wZXJ0eUZyb21SYW5nZSA9IHJhbmdlID0+IG5ldyBOdW1iZXJQcm9wZXJ0eSggcmFuZ2UuZGVmYXVsdFZhbHVlLCB7IHJhbmdlOiByYW5nZSB9ICk7XHJcbiAgICB0aGlzLnNsaWRlclByb3BlcnR5QXJyYXkgPSBbXHJcbiAgICAgIG1ha2VOdW1iZXJQcm9wZXJ0eUZyb21SYW5nZSggQ3VydmVGaXR0aW5nQ29uc3RhbnRzLkNPTlNUQU5UX1JBTkdFICksXHJcbiAgICAgIG1ha2VOdW1iZXJQcm9wZXJ0eUZyb21SYW5nZSggQ3VydmVGaXR0aW5nQ29uc3RhbnRzLkxJTkVBUl9SQU5HRSApLFxyXG4gICAgICBtYWtlTnVtYmVyUHJvcGVydHlGcm9tUmFuZ2UoIEN1cnZlRml0dGluZ0NvbnN0YW50cy5RVUFEUkFUSUNfUkFOR0UgKSxcclxuICAgICAgbWFrZU51bWJlclByb3BlcnR5RnJvbVJhbmdlKCBDdXJ2ZUZpdHRpbmdDb25zdGFudHMuQ1VCSUNfUkFOR0UgKVxyXG4gICAgXTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQb2ludHN9IC0gUG9pbnRzIGZvciBwbG90dGluZyBjdXJ2ZS4gVGhpcyBpbmNsdWRlcyBwb2ludHMgdGhhdCBhcmUgb3V0c2lkZSB0aGUgYm91bmRzIG9mIHRoZSBncmFwaCxcclxuICAgIC8vIHNvIGJlIGNhcmVmdWwgdG8gY2FsbCBnZXRSZWxldmFudFBvaW50cyB3aGVuIHVzaW5nIHBvaW50cyBpbiBjYWxjdWxhdGlvbnMuIE9yZGVyIG9mIHRoZSBwb2ludHMgZG9lc24ndCBtYXR0ZXIuXHJcbiAgICB0aGlzLnBvaW50cyA9IGNyZWF0ZVBvaW50cygpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0N1cnZlfSAtIHRoZSBtb2RlbCBvZiB0aGUgY3VydmVcclxuICAgIHRoaXMuY3VydmUgPSBuZXcgQ3VydmUoIHRoaXMucG9pbnRzLCB0aGlzLnNsaWRlclByb3BlcnR5QXJyYXksIHRoaXMub3JkZXJQcm9wZXJ0eSwgdGhpcy5maXRQcm9wZXJ0eSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cclxuICAgIHRoaXMudXBkYXRlQ3VydmVGaXQgPSAoKSA9PiB7IHRoaXMuY3VydmUudXBkYXRlRml0KCk7IH07XHJcblxyXG4gICAgLy8gdmFsaWRhdGUgUHJvcGVydHkgdmFsdWVzIGFuZCB1cGRhdGUgY3VydmUgZml0OyB1bmxpbmsgdW5uZWNlc3NhcnkgcHJlc2VudCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW1cclxuICAgIHRoaXMub3JkZXJQcm9wZXJ0eS5saW5rKCAoKSA9PiB7IHRoaXMudXBkYXRlQ3VydmVGaXQoKTsgfSApO1xyXG5cclxuICAgIC8vIHVubGluayB1bm5lY2Vzc2FyeSwgcHJlc2VudCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW1cclxuICAgIHRoaXMuZml0UHJvcGVydHkubGluayggdGhpcy51cGRhdGVDdXJ2ZUZpdCApO1xyXG5cclxuICAgIC8vIGEgY2hhbmdlIG9mIGFueSBvZiB0aGUgdmFsdWUgc2xpZGVycyBmb3JjZSBhbiB1cGRhdGUgb2YgdGhlIGN1cnZlIG1vZGVsXHJcbiAgICAvLyB1bmxpbmtzIHVubmVjZXNzYXJ5OiBwcmVzZW50IGZvciBsaWZldGltZSBvZiB0aGUgc2ltXHJcbiAgICB0aGlzLnNsaWRlclByb3BlcnR5QXJyYXkuZm9yRWFjaCggc2xpZGVyUHJvcGVydHkgPT4ge1xyXG4gICAgICBzbGlkZXJQcm9wZXJ0eS5saW5rKCB0aGlzLnVwZGF0ZUN1cnZlRml0ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQWRkIGludGVybmFsIGxpc3RlbmVycyBmb3IgYWRkaW5nIGFuZCByZW1vdmluZyBwb2ludHNcclxuICAgIHRoaXMucG9pbnRzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCBwb2ludCA9PiB7IHRoaXMuYWRkUG9pbnQoIHBvaW50ICk7IH0gKTtcclxuICAgIHRoaXMucG9pbnRzLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIHBvaW50ID0+IHsgdGhpcy5yZW1vdmVQb2ludCggcG9pbnQgKTsgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSBtb2RlbFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuc2xpZGVyUHJvcGVydHlBcnJheS5mb3JFYWNoKCBzbGlkZXJQcm9wZXJ0eSA9PiB7IHNsaWRlclByb3BlcnR5LnJlc2V0KCk7IH0gKTtcclxuICAgIHRoaXMub3JkZXJQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5maXRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wb2ludHMucmVzZXQoKTtcclxuICAgIHRoaXMuY3VydmUucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBwb2ludFxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQb2ludH0gcG9pbnRcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGFkZFBvaW50KCBwb2ludCApIHtcclxuXHJcbiAgICAvLyBUaGVzZSBhcmUgdW5saW5rZWQgaW4gcmVtb3ZlUG9pbnRcclxuICAgIHBvaW50LnBvc2l0aW9uUHJvcGVydHkubGluayggdGhpcy51cGRhdGVDdXJ2ZUZpdCApO1xyXG4gICAgcG9pbnQuaXNJbnNpZGVHcmFwaFByb3BlcnR5LmxpbmsoIHRoaXMudXBkYXRlQ3VydmVGaXQgKTtcclxuICAgIHBvaW50LmRlbHRhUHJvcGVydHkubGluayggdGhpcy51cGRhdGVDdXJ2ZUZpdCApO1xyXG5cclxuICAgIGNvbnN0IHJlbW92ZVBvaW50TGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICAgIGlmICggdGhpcy5wb2ludHMuaW5jbHVkZXMoIHBvaW50ICkgKSB7XHJcbiAgICAgICAgdGhpcy5wb2ludHMucmVtb3ZlKCBwb2ludCApO1xyXG4gICAgICB9XHJcbiAgICAgIHBvaW50LnJldHVyblRvT3JpZ2luRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggcmVtb3ZlUG9pbnRMaXN0ZW5lciApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyByZW1vdmUgcG9pbnRzIHdoZW4gdGhleSBoYXZlIHJldHVybmVkIHRvIHRoZSBidWNrZXRcclxuICAgIC8vIGxpc3RlbmVyIHJlbW92ZXMgaXRzZWxmIHdoZW4gY2FsbGVkXHJcbiAgICBwb2ludC5yZXR1cm5Ub09yaWdpbkVtaXR0ZXIuYWRkTGlzdGVuZXIoIHJlbW92ZVBvaW50TGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBwb2ludFxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQb2ludH0gcG9pbnRcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHJlbW92ZVBvaW50KCBwb2ludCApIHtcclxuXHJcbiAgICAvLyBUaGVzZSB3ZXJlIGxpbmtlZCBpbiBhZGRQb2ludFxyXG4gICAgcG9pbnQucG9zaXRpb25Qcm9wZXJ0eS51bmxpbmsoIHRoaXMudXBkYXRlQ3VydmVGaXQgKTtcclxuICAgIHBvaW50LmlzSW5zaWRlR3JhcGhQcm9wZXJ0eS51bmxpbmsoIHRoaXMudXBkYXRlQ3VydmVGaXQgKTtcclxuICAgIHBvaW50LmRlbHRhUHJvcGVydHkudW5saW5rKCB0aGlzLnVwZGF0ZUN1cnZlRml0ICk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVDdXJ2ZUZpdCgpO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbmN1cnZlRml0dGluZy5yZWdpc3RlciggJ0N1cnZlRml0dGluZ01vZGVsJywgQ3VydmVGaXR0aW5nTW9kZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgQ3VydmVGaXR0aW5nTW9kZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLDZCQUE2QixNQUFNLHNEQUFzRDtBQUNoRyxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MscUJBQXFCLE1BQU0sNkJBQTZCO0FBQy9ELE9BQU9DLFlBQVksTUFBTSxtQkFBbUI7QUFDNUMsT0FBT0MsS0FBSyxNQUFNLFlBQVk7QUFDOUIsT0FBT0MsT0FBTyxNQUFNLGNBQWM7QUFFbEMsTUFBTUMsaUJBQWlCLENBQUM7RUFFdEJDLFdBQVdBLENBQUEsRUFBRztJQUVaO0lBQ0EsSUFBSSxDQUFDQyxhQUFhLEdBQUcsSUFBSVIsY0FBYyxDQUFFLENBQUMsRUFBRTtNQUMxQ1MsV0FBVyxFQUFFLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUU7TUFDeEJDLDRCQUE0QixFQUFFLElBQUksQ0FBQztJQUNyQyxDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNDLFdBQVcsR0FBRyxJQUFJWiw2QkFBNkIsQ0FBRU0sT0FBTyxFQUFFQSxPQUFPLENBQUNPLElBQUssQ0FBQzs7SUFFN0U7SUFDQTtJQUNBLE1BQU1DLDJCQUEyQixHQUFHQyxLQUFLLElBQUksSUFBSWQsY0FBYyxDQUFFYyxLQUFLLENBQUNDLFlBQVksRUFBRTtNQUFFRCxLQUFLLEVBQUVBO0lBQU0sQ0FBRSxDQUFDO0lBQ3ZHLElBQUksQ0FBQ0UsbUJBQW1CLEdBQUcsQ0FDekJILDJCQUEyQixDQUFFWCxxQkFBcUIsQ0FBQ2UsY0FBZSxDQUFDLEVBQ25FSiwyQkFBMkIsQ0FBRVgscUJBQXFCLENBQUNnQixZQUFhLENBQUMsRUFDakVMLDJCQUEyQixDQUFFWCxx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