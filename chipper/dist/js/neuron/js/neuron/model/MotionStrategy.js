// Copyright 2014-2020, University of Colorado Boulder
/**
 * Base class for motion strategies that can be used to set the type of motion for elements within the model.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
class MotionStrategy {
  constructor() {}

  /**
   * Move the associated model element according to the specified amount of time and the nature of the motion
   * strategy.  The fadable interface is also passed in, since it is possible for the motion strategy to update the
   * fade strategy.
   * @param {Movable} movableModelElement
   * @param {Object} fadableModelElement
   * @param {number} dt
   * @public
   */
  move(movableModelElement, fadableModelElement, dt) {
    throw new Error('move should be implemented in descendant classes of MotionStrategy.');
  }
}
neuron.register('MotionStrategy', MotionStrategy);
export default MotionStrategy;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJuZXVyb24iLCJNb3Rpb25TdHJhdGVneSIsImNvbnN0cnVjdG9yIiwibW92ZSIsIm1vdmFibGVNb2RlbEVsZW1lbnQiLCJmYWRhYmxlTW9kZWxFbGVtZW50IiwiZHQiLCJFcnJvciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTW90aW9uU3RyYXRlZ3kuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcbi8qKlxyXG4gKiBCYXNlIGNsYXNzIGZvciBtb3Rpb24gc3RyYXRlZ2llcyB0aGF0IGNhbiBiZSB1c2VkIHRvIHNldCB0aGUgdHlwZSBvZiBtb3Rpb24gZm9yIGVsZW1lbnRzIHdpdGhpbiB0aGUgbW9kZWwuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBTaGFyZnVkZWVuIEFzaHJhZiAoZm9yIEdoZW50IFVuaXZlcnNpdHkpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG5ldXJvbiBmcm9tICcuLi8uLi9uZXVyb24uanMnO1xyXG5cclxuY2xhc3MgTW90aW9uU3RyYXRlZ3kge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHsgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlIHRoZSBhc3NvY2lhdGVkIG1vZGVsIGVsZW1lbnQgYWNjb3JkaW5nIHRvIHRoZSBzcGVjaWZpZWQgYW1vdW50IG9mIHRpbWUgYW5kIHRoZSBuYXR1cmUgb2YgdGhlIG1vdGlvblxyXG4gICAqIHN0cmF0ZWd5LiAgVGhlIGZhZGFibGUgaW50ZXJmYWNlIGlzIGFsc28gcGFzc2VkIGluLCBzaW5jZSBpdCBpcyBwb3NzaWJsZSBmb3IgdGhlIG1vdGlvbiBzdHJhdGVneSB0byB1cGRhdGUgdGhlXHJcbiAgICogZmFkZSBzdHJhdGVneS5cclxuICAgKiBAcGFyYW0ge01vdmFibGV9IG1vdmFibGVNb2RlbEVsZW1lbnRcclxuICAgKiBAcGFyYW0ge09iamVjdH0gZmFkYWJsZU1vZGVsRWxlbWVudFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBtb3ZlKCBtb3ZhYmxlTW9kZWxFbGVtZW50LCBmYWRhYmxlTW9kZWxFbGVtZW50LCBkdCApIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ21vdmUgc2hvdWxkIGJlIGltcGxlbWVudGVkIGluIGRlc2NlbmRhbnQgY2xhc3NlcyBvZiBNb3Rpb25TdHJhdGVneS4nICk7XHJcbiAgfVxyXG59XHJcblxyXG5uZXVyb24ucmVnaXN0ZXIoICdNb3Rpb25TdHJhdGVneScsIE1vdGlvblN0cmF0ZWd5ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNb3Rpb25TdHJhdGVneTsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE1BQU0sTUFBTSxpQkFBaUI7QUFFcEMsTUFBTUMsY0FBYyxDQUFDO0VBRW5CQyxXQUFXQSxDQUFBLEVBQUcsQ0FBRTs7RUFFaEI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLElBQUlBLENBQUVDLG1CQUFtQixFQUFFQyxtQkFBbUIsRUFBRUMsRUFBRSxFQUFHO0lBQ25ELE1BQU0sSUFBSUMsS0FBSyxDQUFFLHFFQUFzRSxDQUFDO0VBQzFGO0FBQ0Y7QUFFQVAsTUFBTSxDQUFDUSxRQUFRLENBQUUsZ0JBQWdCLEVBQUVQLGNBQWUsQ0FBQztBQUVuRCxlQUFlQSxjQUFjIn0=