// Copyright 2020, University of Colorado Boulder

/**
 * A multipurpose data structure that immutably contains information about the mass, position, and velocity of a Ball.
 * Doesn't hold onto any listeners or Properties, so no dispose method is needed.
 *
 * ## Usages of BallState:
 *
 *   - BallStates are generally used to hold information about the starting values of a Ball. They are used in the
 *     'Inelastic' screen to describe several pre-defined states of Balls in different presets.
 *
 *   - Used internally in Balls to save and update their 'state' for when the restart button is pressed.
 *     Restarting is different from resetting:
 *       Reset All:
 *         - Like a traditional sim, this resets all model Properties back to the values that they were initialized to.
 *
 *       Restart:
 *         - Pauses the sim.
 *         - Sets the elapsed time to 0.
 *         - Sets the Balls' position, mass, and velocity to their most recent saved BallState. Their restart BallState
 *           is saved when the user finishes controlling one of the Balls. However, if any of the balls are outside
 *           the PlayArea's bounds, the states are not saved. See https://github.com/phetsims/collision-lab/issues/163.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
class BallState {
  /**
   * @param {Vector2} position - position of the center of the ball, in meters.
   * @param {Vector2} velocity - velocity of the ball, in m/s.
   * @param {number} mass - mass of the ball, in kg.
   */
  constructor(position, velocity, mass) {
    assert && assert(position instanceof Vector2, `invalid position: ${position}`);
    assert && assert(velocity instanceof Vector2, `invalid velocity: ${velocity}`);
    assert && assert(typeof mass === 'number' && mass > 0, `invalid mass: ${mass}`);

    // @public (read-only) {Vector2} - reference to the passed-in position.
    this.position = position;

    // @public (read-only) {Vector2} - reference to the passed-in velocity.
    this.velocity = velocity;

    // @public (read-only) {number} - reference to the passed-in mass.
    this.mass = mass;
  }

  /**
   * Returns a boolean that indicates if this BallState is equal to given BallState.
   * @public
   *
   * @param {BallState} ballState
   * @returns {boolean}
   */
  equals(ballState) {
    return this.position.equals(ballState.position) && this.velocity.equals(ballState.velocity) && this.mass === ballState.mass;
  }

  /**
   * Debugging string for the BallState.
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `BallState[ position: ${this.position}, velocity: ${this.velocity}, mass: ${this.mass} ]`;
  }
}
collisionLab.register('BallState', BallState);
export default BallState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiY29sbGlzaW9uTGFiIiwiQmFsbFN0YXRlIiwiY29uc3RydWN0b3IiLCJwb3NpdGlvbiIsInZlbG9jaXR5IiwibWFzcyIsImFzc2VydCIsImVxdWFscyIsImJhbGxTdGF0ZSIsInRvU3RyaW5nIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYWxsU3RhdGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgbXVsdGlwdXJwb3NlIGRhdGEgc3RydWN0dXJlIHRoYXQgaW1tdXRhYmx5IGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IHRoZSBtYXNzLCBwb3NpdGlvbiwgYW5kIHZlbG9jaXR5IG9mIGEgQmFsbC5cclxuICogRG9lc24ndCBob2xkIG9udG8gYW55IGxpc3RlbmVycyBvciBQcm9wZXJ0aWVzLCBzbyBubyBkaXNwb3NlIG1ldGhvZCBpcyBuZWVkZWQuXHJcbiAqXHJcbiAqICMjIFVzYWdlcyBvZiBCYWxsU3RhdGU6XHJcbiAqXHJcbiAqICAgLSBCYWxsU3RhdGVzIGFyZSBnZW5lcmFsbHkgdXNlZCB0byBob2xkIGluZm9ybWF0aW9uIGFib3V0IHRoZSBzdGFydGluZyB2YWx1ZXMgb2YgYSBCYWxsLiBUaGV5IGFyZSB1c2VkIGluIHRoZVxyXG4gKiAgICAgJ0luZWxhc3RpYycgc2NyZWVuIHRvIGRlc2NyaWJlIHNldmVyYWwgcHJlLWRlZmluZWQgc3RhdGVzIG9mIEJhbGxzIGluIGRpZmZlcmVudCBwcmVzZXRzLlxyXG4gKlxyXG4gKiAgIC0gVXNlZCBpbnRlcm5hbGx5IGluIEJhbGxzIHRvIHNhdmUgYW5kIHVwZGF0ZSB0aGVpciAnc3RhdGUnIGZvciB3aGVuIHRoZSByZXN0YXJ0IGJ1dHRvbiBpcyBwcmVzc2VkLlxyXG4gKiAgICAgUmVzdGFydGluZyBpcyBkaWZmZXJlbnQgZnJvbSByZXNldHRpbmc6XHJcbiAqICAgICAgIFJlc2V0IEFsbDpcclxuICogICAgICAgICAtIExpa2UgYSB0cmFkaXRpb25hbCBzaW0sIHRoaXMgcmVzZXRzIGFsbCBtb2RlbCBQcm9wZXJ0aWVzIGJhY2sgdG8gdGhlIHZhbHVlcyB0aGF0IHRoZXkgd2VyZSBpbml0aWFsaXplZCB0by5cclxuICpcclxuICogICAgICAgUmVzdGFydDpcclxuICogICAgICAgICAtIFBhdXNlcyB0aGUgc2ltLlxyXG4gKiAgICAgICAgIC0gU2V0cyB0aGUgZWxhcHNlZCB0aW1lIHRvIDAuXHJcbiAqICAgICAgICAgLSBTZXRzIHRoZSBCYWxscycgcG9zaXRpb24sIG1hc3MsIGFuZCB2ZWxvY2l0eSB0byB0aGVpciBtb3N0IHJlY2VudCBzYXZlZCBCYWxsU3RhdGUuIFRoZWlyIHJlc3RhcnQgQmFsbFN0YXRlXHJcbiAqICAgICAgICAgICBpcyBzYXZlZCB3aGVuIHRoZSB1c2VyIGZpbmlzaGVzIGNvbnRyb2xsaW5nIG9uZSBvZiB0aGUgQmFsbHMuIEhvd2V2ZXIsIGlmIGFueSBvZiB0aGUgYmFsbHMgYXJlIG91dHNpZGVcclxuICogICAgICAgICAgIHRoZSBQbGF5QXJlYSdzIGJvdW5kcywgdGhlIHN0YXRlcyBhcmUgbm90IHNhdmVkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NvbGxpc2lvbi1sYWIvaXNzdWVzLzE2My5cclxuICpcclxuICogQGF1dGhvciBCcmFuZG9uIExpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgY29sbGlzaW9uTGFiIGZyb20gJy4uLy4uL2NvbGxpc2lvbkxhYi5qcyc7XHJcblxyXG5jbGFzcyBCYWxsU3RhdGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uIC0gcG9zaXRpb24gb2YgdGhlIGNlbnRlciBvZiB0aGUgYmFsbCwgaW4gbWV0ZXJzLlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gdmVsb2NpdHkgLSB2ZWxvY2l0eSBvZiB0aGUgYmFsbCwgaW4gbS9zLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYXNzIC0gbWFzcyBvZiB0aGUgYmFsbCwgaW4ga2cuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHBvc2l0aW9uLCB2ZWxvY2l0eSwgbWFzcyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBvc2l0aW9uIGluc3RhbmNlb2YgVmVjdG9yMiwgYGludmFsaWQgcG9zaXRpb246ICR7cG9zaXRpb259YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmVsb2NpdHkgaW5zdGFuY2VvZiBWZWN0b3IyLCBgaW52YWxpZCB2ZWxvY2l0eTogJHt2ZWxvY2l0eX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbWFzcyA9PT0gJ251bWJlcicgJiYgbWFzcyA+IDAsIGBpbnZhbGlkIG1hc3M6ICR7bWFzc31gICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7VmVjdG9yMn0gLSByZWZlcmVuY2UgdG8gdGhlIHBhc3NlZC1pbiBwb3NpdGlvbi5cclxuICAgIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtWZWN0b3IyfSAtIHJlZmVyZW5jZSB0byB0aGUgcGFzc2VkLWluIHZlbG9jaXR5LlxyXG4gICAgdGhpcy52ZWxvY2l0eSA9IHZlbG9jaXR5O1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge251bWJlcn0gLSByZWZlcmVuY2UgdG8gdGhlIHBhc3NlZC1pbiBtYXNzLlxyXG4gICAgdGhpcy5tYXNzID0gbWFzcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBib29sZWFuIHRoYXQgaW5kaWNhdGVzIGlmIHRoaXMgQmFsbFN0YXRlIGlzIGVxdWFsIHRvIGdpdmVuIEJhbGxTdGF0ZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JhbGxTdGF0ZX0gYmFsbFN0YXRlXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgZXF1YWxzKCBiYWxsU3RhdGUgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi5lcXVhbHMoIGJhbGxTdGF0ZS5wb3NpdGlvbiApICYmXHJcbiAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5lcXVhbHMoIGJhbGxTdGF0ZS52ZWxvY2l0eSApICYmXHJcbiAgICAgICAgICAgdGhpcy5tYXNzID09PSBiYWxsU3RhdGUubWFzcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERlYnVnZ2luZyBzdHJpbmcgZm9yIHRoZSBCYWxsU3RhdGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICB0b1N0cmluZygpIHtcclxuICAgIHJldHVybiBgQmFsbFN0YXRlWyBwb3NpdGlvbjogJHt0aGlzLnBvc2l0aW9ufSwgdmVsb2NpdHk6ICR7dGhpcy52ZWxvY2l0eX0sIG1hc3M6ICR7dGhpcy5tYXNzfSBdYDtcclxuICB9XHJcbn1cclxuXHJcbmNvbGxpc2lvbkxhYi5yZWdpc3RlciggJ0JhbGxTdGF0ZScsIEJhbGxTdGF0ZSApO1xyXG5leHBvcnQgZGVmYXVsdCBCYWxsU3RhdGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsWUFBWSxNQUFNLHVCQUF1QjtBQUVoRCxNQUFNQyxTQUFTLENBQUM7RUFFZDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLFFBQVEsRUFBRUMsUUFBUSxFQUFFQyxJQUFJLEVBQUc7SUFDdENDLE1BQU0sSUFBSUEsTUFBTSxDQUFFSCxRQUFRLFlBQVlKLE9BQU8sRUFBRyxxQkFBb0JJLFFBQVMsRUFBRSxDQUFDO0lBQ2hGRyxNQUFNLElBQUlBLE1BQU0sQ0FBRUYsUUFBUSxZQUFZTCxPQUFPLEVBQUcscUJBQW9CSyxRQUFTLEVBQUUsQ0FBQztJQUNoRkUsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT0QsSUFBSSxLQUFLLFFBQVEsSUFBSUEsSUFBSSxHQUFHLENBQUMsRUFBRyxpQkFBZ0JBLElBQUssRUFBRSxDQUFDOztJQUVqRjtJQUNBLElBQUksQ0FBQ0YsUUFBUSxHQUFHQSxRQUFROztJQUV4QjtJQUNBLElBQUksQ0FBQ0MsUUFBUSxHQUFHQSxRQUFROztJQUV4QjtJQUNBLElBQUksQ0FBQ0MsSUFBSSxHQUFHQSxJQUFJO0VBQ2xCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLE1BQU1BLENBQUVDLFNBQVMsRUFBRztJQUNsQixPQUFPLElBQUksQ0FBQ0wsUUFBUSxDQUFDSSxNQUFNLENBQUVDLFNBQVMsQ0FBQ0wsUUFBUyxDQUFDLElBQzFDLElBQUksQ0FBQ0MsUUFBUSxDQUFDRyxNQUFNLENBQUVDLFNBQVMsQ0FBQ0osUUFBUyxDQUFDLElBQzFDLElBQUksQ0FBQ0MsSUFBSSxLQUFLRyxTQUFTLENBQUNILElBQUk7RUFDckM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VJLFFBQVFBLENBQUEsRUFBRztJQUNULE9BQVEsd0JBQXVCLElBQUksQ0FBQ04sUUFBUyxlQUFjLElBQUksQ0FBQ0MsUUFBUyxXQUFVLElBQUksQ0FBQ0MsSUFBSyxJQUFHO0VBQ2xHO0FBQ0Y7QUFFQUwsWUFBWSxDQUFDVSxRQUFRLENBQUUsV0FBVyxFQUFFVCxTQUFVLENBQUM7QUFDL0MsZUFBZUEsU0FBUyJ9