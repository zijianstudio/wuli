// Copyright 2019-2023, University of Colorado Boulder

/**
 * PolarBaseVector is the subclass of BaseVector used with CoordinateSnapModes.POLAR.
 * It creates NumberProperties for the angle and magnitude that are controlled by NumberPickers, and
 * adjusts its x and y components based on the values of those Properties.
 *
 * @author Brandon Li
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import vectorAddition from '../../vectorAddition.js';
import BaseVector from './BaseVector.js';
import CoordinateSnapModes from './CoordinateSnapModes.js';
export default class PolarBaseVector extends BaseVector {
  /**
   * @param {Vector2} initialTailPosition - starting tail position of the Base Vector
   * @param {Vector2} initialComponents - starting components of the Base Vector
   * @param {EquationsGraph} graph - the graph the Base Vector belongs to
   * @param {EquationsVectorSet} vectorSet - the set that the Base Vector belongs to
   * @param {string|null} symbol - the symbol for the Base Vector (i.e. 'a', 'b', 'c', ...)
   */
  constructor(initialTailPosition, initialComponents, graph, vectorSet, symbol) {
    assert && assert(graph.coordinateSnapMode === CoordinateSnapModes.POLAR, `invalid coordinateSnapMode: ${graph.coordinateSnapMode}`);
    super(initialTailPosition, initialComponents, graph, vectorSet, symbol);

    // @public (read-only) Property to set the magnitude
    this.magnitudeProperty = new NumberProperty(this.magnitude);

    // @public (read-only) Property to set the angle
    this.angleDegreesProperty = new NumberProperty(Utils.toDegrees(this.angle));

    // Observe when the angle or magnitude changes, and update the components to match.
    // unmultilink is unnecessary, exists for the lifetime of the sim.
    Multilink.multilink([this.magnitudeProperty, this.angleDegreesProperty], (magnitude, angleDegrees) => {
      this.vectorComponents = Vector2.createPolar(magnitude, Utils.toRadians(angleDegrees));
    });
  }

  /**
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.magnitudeProperty.reset();
    this.angleDegreesProperty.reset();
  }
}
vectorAddition.register('PolarBaseVector', PolarBaseVector);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlV0aWxzIiwiVmVjdG9yMiIsInZlY3RvckFkZGl0aW9uIiwiQmFzZVZlY3RvciIsIkNvb3JkaW5hdGVTbmFwTW9kZXMiLCJQb2xhckJhc2VWZWN0b3IiLCJjb25zdHJ1Y3RvciIsImluaXRpYWxUYWlsUG9zaXRpb24iLCJpbml0aWFsQ29tcG9uZW50cyIsImdyYXBoIiwidmVjdG9yU2V0Iiwic3ltYm9sIiwiYXNzZXJ0IiwiY29vcmRpbmF0ZVNuYXBNb2RlIiwiUE9MQVIiLCJtYWduaXR1ZGVQcm9wZXJ0eSIsIm1hZ25pdHVkZSIsImFuZ2xlRGVncmVlc1Byb3BlcnR5IiwidG9EZWdyZWVzIiwiYW5nbGUiLCJtdWx0aWxpbmsiLCJhbmdsZURlZ3JlZXMiLCJ2ZWN0b3JDb21wb25lbnRzIiwiY3JlYXRlUG9sYXIiLCJ0b1JhZGlhbnMiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUG9sYXJCYXNlVmVjdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBvbGFyQmFzZVZlY3RvciBpcyB0aGUgc3ViY2xhc3Mgb2YgQmFzZVZlY3RvciB1c2VkIHdpdGggQ29vcmRpbmF0ZVNuYXBNb2Rlcy5QT0xBUi5cclxuICogSXQgY3JlYXRlcyBOdW1iZXJQcm9wZXJ0aWVzIGZvciB0aGUgYW5nbGUgYW5kIG1hZ25pdHVkZSB0aGF0IGFyZSBjb250cm9sbGVkIGJ5IE51bWJlclBpY2tlcnMsIGFuZFxyXG4gKiBhZGp1c3RzIGl0cyB4IGFuZCB5IGNvbXBvbmVudHMgYmFzZWQgb24gdGhlIHZhbHVlcyBvZiB0aG9zZSBQcm9wZXJ0aWVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEJyYW5kb24gTGlcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgdmVjdG9yQWRkaXRpb24gZnJvbSAnLi4vLi4vdmVjdG9yQWRkaXRpb24uanMnO1xyXG5pbXBvcnQgQmFzZVZlY3RvciBmcm9tICcuL0Jhc2VWZWN0b3IuanMnO1xyXG5pbXBvcnQgQ29vcmRpbmF0ZVNuYXBNb2RlcyBmcm9tICcuL0Nvb3JkaW5hdGVTbmFwTW9kZXMuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9sYXJCYXNlVmVjdG9yIGV4dGVuZHMgQmFzZVZlY3RvciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gaW5pdGlhbFRhaWxQb3NpdGlvbiAtIHN0YXJ0aW5nIHRhaWwgcG9zaXRpb24gb2YgdGhlIEJhc2UgVmVjdG9yXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBpbml0aWFsQ29tcG9uZW50cyAtIHN0YXJ0aW5nIGNvbXBvbmVudHMgb2YgdGhlIEJhc2UgVmVjdG9yXHJcbiAgICogQHBhcmFtIHtFcXVhdGlvbnNHcmFwaH0gZ3JhcGggLSB0aGUgZ3JhcGggdGhlIEJhc2UgVmVjdG9yIGJlbG9uZ3MgdG9cclxuICAgKiBAcGFyYW0ge0VxdWF0aW9uc1ZlY3RvclNldH0gdmVjdG9yU2V0IC0gdGhlIHNldCB0aGF0IHRoZSBCYXNlIFZlY3RvciBiZWxvbmdzIHRvXHJcbiAgICogQHBhcmFtIHtzdHJpbmd8bnVsbH0gc3ltYm9sIC0gdGhlIHN5bWJvbCBmb3IgdGhlIEJhc2UgVmVjdG9yIChpLmUuICdhJywgJ2InLCAnYycsIC4uLilcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaW5pdGlhbFRhaWxQb3NpdGlvbiwgaW5pdGlhbENvbXBvbmVudHMsIGdyYXBoLCB2ZWN0b3JTZXQsIHN5bWJvbCApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBncmFwaC5jb29yZGluYXRlU25hcE1vZGUgPT09IENvb3JkaW5hdGVTbmFwTW9kZXMuUE9MQVIsIGBpbnZhbGlkIGNvb3JkaW5hdGVTbmFwTW9kZTogJHtncmFwaC5jb29yZGluYXRlU25hcE1vZGV9YCApO1xyXG5cclxuICAgIHN1cGVyKCBpbml0aWFsVGFpbFBvc2l0aW9uLCBpbml0aWFsQ29tcG9uZW50cywgZ3JhcGgsIHZlY3RvclNldCwgc3ltYm9sICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSBQcm9wZXJ0eSB0byBzZXQgdGhlIG1hZ25pdHVkZVxyXG4gICAgdGhpcy5tYWduaXR1ZGVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggdGhpcy5tYWduaXR1ZGUgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIFByb3BlcnR5IHRvIHNldCB0aGUgYW5nbGVcclxuICAgIHRoaXMuYW5nbGVEZWdyZWVzUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIFV0aWxzLnRvRGVncmVlcyggdGhpcy5hbmdsZSApICk7XHJcblxyXG4gICAgLy8gT2JzZXJ2ZSB3aGVuIHRoZSBhbmdsZSBvciBtYWduaXR1ZGUgY2hhbmdlcywgYW5kIHVwZGF0ZSB0aGUgY29tcG9uZW50cyB0byBtYXRjaC5cclxuICAgIC8vIHVubXVsdGlsaW5rIGlzIHVubmVjZXNzYXJ5LCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltLlxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgWyB0aGlzLm1hZ25pdHVkZVByb3BlcnR5LCB0aGlzLmFuZ2xlRGVncmVlc1Byb3BlcnR5IF0sXHJcbiAgICAgICggbWFnbml0dWRlLCBhbmdsZURlZ3JlZXMgKSA9PiB7XHJcbiAgICAgICAgdGhpcy52ZWN0b3JDb21wb25lbnRzID0gVmVjdG9yMi5jcmVhdGVQb2xhciggbWFnbml0dWRlLCBVdGlscy50b1JhZGlhbnMoIGFuZ2xlRGVncmVlcyApICk7XHJcbiAgICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcbiAgICB0aGlzLm1hZ25pdHVkZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmFuZ2xlRGVncmVlc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG52ZWN0b3JBZGRpdGlvbi5yZWdpc3RlciggJ1BvbGFyQmFzZVZlY3RvcicsIFBvbGFyQmFzZVZlY3RvciApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0MsVUFBVSxNQUFNLGlCQUFpQjtBQUN4QyxPQUFPQyxtQkFBbUIsTUFBTSwwQkFBMEI7QUFFMUQsZUFBZSxNQUFNQyxlQUFlLFNBQVNGLFVBQVUsQ0FBQztFQUV0RDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxtQkFBbUIsRUFBRUMsaUJBQWlCLEVBQUVDLEtBQUssRUFBRUMsU0FBUyxFQUFFQyxNQUFNLEVBQUc7SUFFOUVDLE1BQU0sSUFBSUEsTUFBTSxDQUFFSCxLQUFLLENBQUNJLGtCQUFrQixLQUFLVCxtQkFBbUIsQ0FBQ1UsS0FBSyxFQUFHLCtCQUE4QkwsS0FBSyxDQUFDSSxrQkFBbUIsRUFBRSxDQUFDO0lBRXJJLEtBQUssQ0FBRU4sbUJBQW1CLEVBQUVDLGlCQUFpQixFQUFFQyxLQUFLLEVBQUVDLFNBQVMsRUFBRUMsTUFBTyxDQUFDOztJQUV6RTtJQUNBLElBQUksQ0FBQ0ksaUJBQWlCLEdBQUcsSUFBSWhCLGNBQWMsQ0FBRSxJQUFJLENBQUNpQixTQUFVLENBQUM7O0lBRTdEO0lBQ0EsSUFBSSxDQUFDQyxvQkFBb0IsR0FBRyxJQUFJbEIsY0FBYyxDQUFFQyxLQUFLLENBQUNrQixTQUFTLENBQUUsSUFBSSxDQUFDQyxLQUFNLENBQUUsQ0FBQzs7SUFFL0U7SUFDQTtJQUNBckIsU0FBUyxDQUFDc0IsU0FBUyxDQUNqQixDQUFFLElBQUksQ0FBQ0wsaUJBQWlCLEVBQUUsSUFBSSxDQUFDRSxvQkFBb0IsQ0FBRSxFQUNyRCxDQUFFRCxTQUFTLEVBQUVLLFlBQVksS0FBTTtNQUM3QixJQUFJLENBQUNDLGdCQUFnQixHQUFHckIsT0FBTyxDQUFDc0IsV0FBVyxDQUFFUCxTQUFTLEVBQUVoQixLQUFLLENBQUN3QixTQUFTLENBQUVILFlBQWEsQ0FBRSxDQUFDO0lBQzNGLENBQUUsQ0FBQztFQUNQOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VJLEtBQUtBLENBQUEsRUFBRztJQUNOLEtBQUssQ0FBQ0EsS0FBSyxDQUFDLENBQUM7SUFDYixJQUFJLENBQUNWLGlCQUFpQixDQUFDVSxLQUFLLENBQUMsQ0FBQztJQUM5QixJQUFJLENBQUNSLG9CQUFvQixDQUFDUSxLQUFLLENBQUMsQ0FBQztFQUNuQztBQUNGO0FBRUF2QixjQUFjLENBQUN3QixRQUFRLENBQUUsaUJBQWlCLEVBQUVyQixlQUFnQixDQUFDIn0=