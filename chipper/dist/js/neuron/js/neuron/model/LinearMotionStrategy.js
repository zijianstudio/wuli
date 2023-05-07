// Copyright 2014-2020, University of Colorado Boulder
/**
 * A simple motion strategy for moving in a straight line.  This was created primarily for testing and, if it is no
 * longer used, can be removed.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import MotionStrategy from './MotionStrategy.js';
class LinearMotionStrategy extends MotionStrategy {
  /**
   * @param {Vector2} velocity
   */
  constructor(velocity) {
    super();
    this.velocity = velocity; // @private, in nanometers per second of simulation time
  }

  // @public
  move(movableModelElement, fadableModelElement, dt) {
    const currentPositionRefX = movableModelElement.getPositionX();
    const currentPositionRefY = movableModelElement.getPositionY();
    movableModelElement.setPosition(currentPositionRefX + this.velocity.x * dt, currentPositionRefY + this.velocity.y * dt);
  }
}
neuron.register('LinearMotionStrategy', LinearMotionStrategy);
export default LinearMotionStrategy;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJuZXVyb24iLCJNb3Rpb25TdHJhdGVneSIsIkxpbmVhck1vdGlvblN0cmF0ZWd5IiwiY29uc3RydWN0b3IiLCJ2ZWxvY2l0eSIsIm1vdmUiLCJtb3ZhYmxlTW9kZWxFbGVtZW50IiwiZmFkYWJsZU1vZGVsRWxlbWVudCIsImR0IiwiY3VycmVudFBvc2l0aW9uUmVmWCIsImdldFBvc2l0aW9uWCIsImN1cnJlbnRQb3NpdGlvblJlZlkiLCJnZXRQb3NpdGlvblkiLCJzZXRQb3NpdGlvbiIsIngiLCJ5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMaW5lYXJNb3Rpb25TdHJhdGVneS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuLyoqXHJcbiAqIEEgc2ltcGxlIG1vdGlvbiBzdHJhdGVneSBmb3IgbW92aW5nIGluIGEgc3RyYWlnaHQgbGluZS4gIFRoaXMgd2FzIGNyZWF0ZWQgcHJpbWFyaWx5IGZvciB0ZXN0aW5nIGFuZCwgaWYgaXQgaXMgbm9cclxuICogbG9uZ2VyIHVzZWQsIGNhbiBiZSByZW1vdmVkLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgU2hhcmZ1ZGVlbiBBc2hyYWYgKGZvciBHaGVudCBVbml2ZXJzaXR5KVxyXG4gKi9cclxuXHJcbmltcG9ydCBuZXVyb24gZnJvbSAnLi4vLi4vbmV1cm9uLmpzJztcclxuaW1wb3J0IE1vdGlvblN0cmF0ZWd5IGZyb20gJy4vTW90aW9uU3RyYXRlZ3kuanMnO1xyXG5cclxuY2xhc3MgTGluZWFyTW90aW9uU3RyYXRlZ3kgZXh0ZW5kcyBNb3Rpb25TdHJhdGVneSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gdmVsb2NpdHlcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdmVsb2NpdHkgKSB7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IHZlbG9jaXR5OyAvLyBAcHJpdmF0ZSwgaW4gbmFub21ldGVycyBwZXIgc2Vjb25kIG9mIHNpbXVsYXRpb24gdGltZVxyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIG1vdmUoIG1vdmFibGVNb2RlbEVsZW1lbnQsIGZhZGFibGVNb2RlbEVsZW1lbnQsIGR0ICkge1xyXG4gICAgY29uc3QgY3VycmVudFBvc2l0aW9uUmVmWCA9IG1vdmFibGVNb2RlbEVsZW1lbnQuZ2V0UG9zaXRpb25YKCk7XHJcbiAgICBjb25zdCBjdXJyZW50UG9zaXRpb25SZWZZID0gbW92YWJsZU1vZGVsRWxlbWVudC5nZXRQb3NpdGlvblkoKTtcclxuICAgIG1vdmFibGVNb2RlbEVsZW1lbnQuc2V0UG9zaXRpb24oIGN1cnJlbnRQb3NpdGlvblJlZlggKyB0aGlzLnZlbG9jaXR5LnggKiBkdCxcclxuICAgICAgY3VycmVudFBvc2l0aW9uUmVmWSArIHRoaXMudmVsb2NpdHkueSAqIGR0ICk7XHJcbiAgfVxyXG59XHJcblxyXG5uZXVyb24ucmVnaXN0ZXIoICdMaW5lYXJNb3Rpb25TdHJhdGVneScsIExpbmVhck1vdGlvblN0cmF0ZWd5ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBMaW5lYXJNb3Rpb25TdHJhdGVneTsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLGlCQUFpQjtBQUNwQyxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBRWhELE1BQU1DLG9CQUFvQixTQUFTRCxjQUFjLENBQUM7RUFFaEQ7QUFDRjtBQUNBO0VBQ0VFLFdBQVdBLENBQUVDLFFBQVEsRUFBRztJQUN0QixLQUFLLENBQUMsQ0FBQztJQUNQLElBQUksQ0FBQ0EsUUFBUSxHQUFHQSxRQUFRLENBQUMsQ0FBQztFQUM1Qjs7RUFFQTtFQUNBQyxJQUFJQSxDQUFFQyxtQkFBbUIsRUFBRUMsbUJBQW1CLEVBQUVDLEVBQUUsRUFBRztJQUNuRCxNQUFNQyxtQkFBbUIsR0FBR0gsbUJBQW1CLENBQUNJLFlBQVksQ0FBQyxDQUFDO0lBQzlELE1BQU1DLG1CQUFtQixHQUFHTCxtQkFBbUIsQ0FBQ00sWUFBWSxDQUFDLENBQUM7SUFDOUROLG1CQUFtQixDQUFDTyxXQUFXLENBQUVKLG1CQUFtQixHQUFHLElBQUksQ0FBQ0wsUUFBUSxDQUFDVSxDQUFDLEdBQUdOLEVBQUUsRUFDekVHLG1CQUFtQixHQUFHLElBQUksQ0FBQ1AsUUFBUSxDQUFDVyxDQUFDLEdBQUdQLEVBQUcsQ0FBQztFQUNoRDtBQUNGO0FBRUFSLE1BQU0sQ0FBQ2dCLFFBQVEsQ0FBRSxzQkFBc0IsRUFBRWQsb0JBQXFCLENBQUM7QUFFL0QsZUFBZUEsb0JBQW9CIn0=