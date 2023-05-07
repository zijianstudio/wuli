// Copyright 2019-2021, University of Colorado Boulder

/**
 * CenterOfMass is the model representation for the center of mass (COM) of a system of Balls. Each BallSystem has one
 * and only one CenterOfMass instance. CenterOfMasses are created at the start of the sim and are never disposed,
 * so no dispose method is necessary.
 *
 * Primary responsibilities are:
 *  1. Track the position of the center of mass in meters.
 *  2. Track the velocity of the center of mass, in m/s.
 *  3. Track the speed of the center of mass, in m/s.
 *  4. Create the trailing 'Path' behind the CenterOfMass.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import Ball from './Ball.js';
import CollisionLabPath from './CollisionLabPath.js';
const scratchVector = new Vector2(0, 0);
class CenterOfMass {
  /**
   * @param {Balls[]} prepopulatedBalls - an array of All possible balls in the system.
   * @param {ObservableArrayDef.<Ball>} balls - the balls in the system. Must belong in prepopulatedBalls.
   * @param {Property.<boolean>} centerOfMassVisibleProperty - indicates if the center of mass is currently visible.
   *                                                           Needed since the CenterOfMass's trailing 'Path' is empty
   *                                                           if this is false and can only be updated if this is true.
   * @param {Property.<boolean>} pathsVisibleProperty - indicates if the 'Path' checkbox is checked.
   */
  constructor(prepopulatedBalls, balls, centerOfMassVisibleProperty, pathsVisibleProperty) {
    assert && AssertUtils.assertArrayOf(prepopulatedBalls, Ball);
    assert && assert(Array.isArray(balls)) && AssertUtils.assertArrayOf(balls, Ball);
    assert && AssertUtils.assertPropertyOf(centerOfMassVisibleProperty, 'boolean');
    assert && AssertUtils.assertPropertyOf(pathsVisibleProperty, 'boolean');

    //----------------------------------------------------------------------------------------

    // @private {ObservableArrayDef.<Ball>} - reference to the balls that were passed in.
    this.balls = balls;

    // Gather the massProperty, positionProperty, and velocityProperty of ALL possible balls into their respective
    // arrays. We use these as dependencies for the Properties below. This does not hinder the performance of the
    // simulation since Balls NOT in the system are not stepped and their Properties don't change.
    const ballMassProperties = prepopulatedBalls.map(ball => ball.massProperty);
    const ballPositionProperties = prepopulatedBalls.map(ball => ball.positionProperty);
    const ballVelocityProperties = prepopulatedBalls.map(ball => ball.velocityProperty);

    // @public {Property.<Vector2>} - Property of the position of the COM, in meter coordinates.
    //
    // For the dependencies, we use:
    //  - position Properties of the prepopulatedBalls. Only the balls in the BallSystem are used in the calculation.
    //  - mass Properties of the prepopulatedBalls. Only the balls in the BallSystem are used in the calculation.
    //  - balls.lengthProperty - since removing or adding a Ball changes the position of the COM.
    //
    // This DerivedProperty is never disposed and persists for the lifetime of the sim.
    this.positionProperty = new DerivedProperty([...ballMassProperties, ...ballPositionProperties, balls.lengthProperty], () => this.computePosition(), {
      valueType: Vector2
    });

    // @public {Property.<Vector2>} - Property of the velocity of the COM, in meters per second.
    //
    // For the dependencies, we use:
    //  - velocity Properties of the prepopulatedBalls. Only the balls in the BallSystem are used in the calculation.
    //  - mass Properties of the prepopulatedBalls. Only the balls in the BallSystem are used in the calculation.
    //  - balls.lengthProperty - since removing or adding a Ball changes the velocity of the COM.
    //
    // This DerivedProperty is never disposed and persists for the lifetime of the sim.
    this.velocityProperty = new DerivedProperty([...ballMassProperties, ...ballVelocityProperties, balls.lengthProperty], () => this.computeVelocity(), {
      valueType: Vector2
    });

    // @public {Property.<number>} speedProperty - Property of the speed of the Ball, in m/s.
    this.speedProperty = new DerivedProperty([this.velocityProperty], velocity => velocity.magnitude);

    //----------------------------------------------------------------------------------------

    // Get the Property that indicates if the CenterOfMass's Path is visible, which occurs when both the CenterOfMass
    // and Paths are visible. DerivedProperty is never disposed since CenterOfMasses are never disposed.
    const centerOfMassPathVisibleProperty = new DerivedProperty([pathsVisibleProperty, centerOfMassVisibleProperty], (centerOfMassVisible, pathVisible) => centerOfMassVisible && pathVisible, {
      valueType: 'boolean'
    });

    // @public (read-only) {CollisionLabPath} - the trailing 'Path' behind the CenterOfMass.
    this.path = new CollisionLabPath(this.positionProperty, centerOfMassPathVisibleProperty);
  }

  /**
   * Resets the CenterOfMass.
   * @public
   *
   * Called when the reset-all button is pressed.
   */
  reset() {
    this.path.clear();
  }

  /*----------------------------------------------------------------------------*
   * Private Methods.
   *----------------------------------------------------------------------------*/

  /**
   * Computes the total mass of the Balls in the system.
   * @private
   *
   * @returns {number} - in kg.
   */
  computeTotalBallSystemMass() {
    return _.sumBy(this.balls, ball => ball.massProperty.value);
  }

  /**
   * Computes the position of the center of mass. Normally called when the position of one of the Balls in the system
   * is changing or when Balls are added/removed from the system.
   * @public
   *
   * @returns {Vector2} - in meter coordinates.
   */
  computePosition() {
    // Determine the total first moment (mass * position) of the system.
    const totalFirstMoment = Vector2.ZERO.copy();
    this.balls.forEach(ball => {
      totalFirstMoment.add(scratchVector.set(ball.positionProperty.value).multiply(ball.massProperty.value));
    });

    // The position of the center of mass is the total first moment divided by the total mass.
    // See https://en.wikipedia.org/wiki/Center_of_mass#A_system_of_particles for background on this formula.
    return totalFirstMoment.dividedScalar(this.computeTotalBallSystemMass());
  }

  /**
   * Computes the velocity of the center of mass. Called when the momentum of one of the Balls in the system
   * is changing or when Balls are added/removed from the system.
   * @public
   *
   * @returns {Vector2} - in meters per second.
   */
  computeVelocity() {
    // Determine the total momentum of the system.
    const totalMomentum = Vector2.ZERO.copy();
    this.balls.forEach(ball => {
      totalMomentum.add(ball.momentumProperty.value);
    });

    // The velocity of the center of mass is the total momentum divided by the total mass.
    return totalMomentum.dividedScalar(this.computeTotalBallSystemMass());
  }
}
collisionLab.register('CenterOfMass', CenterOfMass);
export default CenterOfMass;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJWZWN0b3IyIiwiQXNzZXJ0VXRpbHMiLCJjb2xsaXNpb25MYWIiLCJCYWxsIiwiQ29sbGlzaW9uTGFiUGF0aCIsInNjcmF0Y2hWZWN0b3IiLCJDZW50ZXJPZk1hc3MiLCJjb25zdHJ1Y3RvciIsInByZXBvcHVsYXRlZEJhbGxzIiwiYmFsbHMiLCJjZW50ZXJPZk1hc3NWaXNpYmxlUHJvcGVydHkiLCJwYXRoc1Zpc2libGVQcm9wZXJ0eSIsImFzc2VydCIsImFzc2VydEFycmF5T2YiLCJBcnJheSIsImlzQXJyYXkiLCJhc3NlcnRQcm9wZXJ0eU9mIiwiYmFsbE1hc3NQcm9wZXJ0aWVzIiwibWFwIiwiYmFsbCIsIm1hc3NQcm9wZXJ0eSIsImJhbGxQb3NpdGlvblByb3BlcnRpZXMiLCJwb3NpdGlvblByb3BlcnR5IiwiYmFsbFZlbG9jaXR5UHJvcGVydGllcyIsInZlbG9jaXR5UHJvcGVydHkiLCJsZW5ndGhQcm9wZXJ0eSIsImNvbXB1dGVQb3NpdGlvbiIsInZhbHVlVHlwZSIsImNvbXB1dGVWZWxvY2l0eSIsInNwZWVkUHJvcGVydHkiLCJ2ZWxvY2l0eSIsIm1hZ25pdHVkZSIsImNlbnRlck9mTWFzc1BhdGhWaXNpYmxlUHJvcGVydHkiLCJjZW50ZXJPZk1hc3NWaXNpYmxlIiwicGF0aFZpc2libGUiLCJwYXRoIiwicmVzZXQiLCJjbGVhciIsImNvbXB1dGVUb3RhbEJhbGxTeXN0ZW1NYXNzIiwiXyIsInN1bUJ5IiwidmFsdWUiLCJ0b3RhbEZpcnN0TW9tZW50IiwiWkVSTyIsImNvcHkiLCJmb3JFYWNoIiwiYWRkIiwic2V0IiwibXVsdGlwbHkiLCJkaXZpZGVkU2NhbGFyIiwidG90YWxNb21lbnR1bSIsIm1vbWVudHVtUHJvcGVydHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNlbnRlck9mTWFzcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDZW50ZXJPZk1hc3MgaXMgdGhlIG1vZGVsIHJlcHJlc2VudGF0aW9uIGZvciB0aGUgY2VudGVyIG9mIG1hc3MgKENPTSkgb2YgYSBzeXN0ZW0gb2YgQmFsbHMuIEVhY2ggQmFsbFN5c3RlbSBoYXMgb25lXHJcbiAqIGFuZCBvbmx5IG9uZSBDZW50ZXJPZk1hc3MgaW5zdGFuY2UuIENlbnRlck9mTWFzc2VzIGFyZSBjcmVhdGVkIGF0IHRoZSBzdGFydCBvZiB0aGUgc2ltIGFuZCBhcmUgbmV2ZXIgZGlzcG9zZWQsXHJcbiAqIHNvIG5vIGRpc3Bvc2UgbWV0aG9kIGlzIG5lY2Vzc2FyeS5cclxuICpcclxuICogUHJpbWFyeSByZXNwb25zaWJpbGl0aWVzIGFyZTpcclxuICogIDEuIFRyYWNrIHRoZSBwb3NpdGlvbiBvZiB0aGUgY2VudGVyIG9mIG1hc3MgaW4gbWV0ZXJzLlxyXG4gKiAgMi4gVHJhY2sgdGhlIHZlbG9jaXR5IG9mIHRoZSBjZW50ZXIgb2YgbWFzcywgaW4gbS9zLlxyXG4gKiAgMy4gVHJhY2sgdGhlIHNwZWVkIG9mIHRoZSBjZW50ZXIgb2YgbWFzcywgaW4gbS9zLlxyXG4gKiAgNC4gQ3JlYXRlIHRoZSB0cmFpbGluZyAnUGF0aCcgYmVoaW5kIHRoZSBDZW50ZXJPZk1hc3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgQXNzZXJ0VXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9Bc3NlcnRVdGlscy5qcyc7XHJcbmltcG9ydCBjb2xsaXNpb25MYWIgZnJvbSAnLi4vLi4vY29sbGlzaW9uTGFiLmpzJztcclxuaW1wb3J0IEJhbGwgZnJvbSAnLi9CYWxsLmpzJztcclxuaW1wb3J0IENvbGxpc2lvbkxhYlBhdGggZnJvbSAnLi9Db2xsaXNpb25MYWJQYXRoLmpzJztcclxuXHJcbmNvbnN0IHNjcmF0Y2hWZWN0b3IgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG5cclxuY2xhc3MgQ2VudGVyT2ZNYXNzIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtCYWxsc1tdfSBwcmVwb3B1bGF0ZWRCYWxscyAtIGFuIGFycmF5IG9mIEFsbCBwb3NzaWJsZSBiYWxscyBpbiB0aGUgc3lzdGVtLlxyXG4gICAqIEBwYXJhbSB7T2JzZXJ2YWJsZUFycmF5RGVmLjxCYWxsPn0gYmFsbHMgLSB0aGUgYmFsbHMgaW4gdGhlIHN5c3RlbS4gTXVzdCBiZWxvbmcgaW4gcHJlcG9wdWxhdGVkQmFsbHMuXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGNlbnRlck9mTWFzc1Zpc2libGVQcm9wZXJ0eSAtIGluZGljYXRlcyBpZiB0aGUgY2VudGVyIG9mIG1hc3MgaXMgY3VycmVudGx5IHZpc2libGUuXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5lZWRlZCBzaW5jZSB0aGUgQ2VudGVyT2ZNYXNzJ3MgdHJhaWxpbmcgJ1BhdGgnIGlzIGVtcHR5XHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHRoaXMgaXMgZmFsc2UgYW5kIGNhbiBvbmx5IGJlIHVwZGF0ZWQgaWYgdGhpcyBpcyB0cnVlLlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBwYXRoc1Zpc2libGVQcm9wZXJ0eSAtIGluZGljYXRlcyBpZiB0aGUgJ1BhdGgnIGNoZWNrYm94IGlzIGNoZWNrZWQuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHByZXBvcHVsYXRlZEJhbGxzLCBiYWxscywgY2VudGVyT2ZNYXNzVmlzaWJsZVByb3BlcnR5LCBwYXRoc1Zpc2libGVQcm9wZXJ0eSApIHtcclxuICAgIGFzc2VydCAmJiBBc3NlcnRVdGlscy5hc3NlcnRBcnJheU9mKCBwcmVwb3B1bGF0ZWRCYWxscywgQmFsbCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggYmFsbHMgKSApICYmIEFzc2VydFV0aWxzLmFzc2VydEFycmF5T2YoIGJhbGxzLCBCYWxsICk7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UHJvcGVydHlPZiggY2VudGVyT2ZNYXNzVmlzaWJsZVByb3BlcnR5LCAnYm9vbGVhbicgKTtcclxuICAgIGFzc2VydCAmJiBBc3NlcnRVdGlscy5hc3NlcnRQcm9wZXJ0eU9mKCBwYXRoc1Zpc2libGVQcm9wZXJ0eSwgJ2Jvb2xlYW4nICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gQHByaXZhdGUge09ic2VydmFibGVBcnJheURlZi48QmFsbD59IC0gcmVmZXJlbmNlIHRvIHRoZSBiYWxscyB0aGF0IHdlcmUgcGFzc2VkIGluLlxyXG4gICAgdGhpcy5iYWxscyA9IGJhbGxzO1xyXG5cclxuICAgIC8vIEdhdGhlciB0aGUgbWFzc1Byb3BlcnR5LCBwb3NpdGlvblByb3BlcnR5LCBhbmQgdmVsb2NpdHlQcm9wZXJ0eSBvZiBBTEwgcG9zc2libGUgYmFsbHMgaW50byB0aGVpciByZXNwZWN0aXZlXHJcbiAgICAvLyBhcnJheXMuIFdlIHVzZSB0aGVzZSBhcyBkZXBlbmRlbmNpZXMgZm9yIHRoZSBQcm9wZXJ0aWVzIGJlbG93LiBUaGlzIGRvZXMgbm90IGhpbmRlciB0aGUgcGVyZm9ybWFuY2Ugb2YgdGhlXHJcbiAgICAvLyBzaW11bGF0aW9uIHNpbmNlIEJhbGxzIE5PVCBpbiB0aGUgc3lzdGVtIGFyZSBub3Qgc3RlcHBlZCBhbmQgdGhlaXIgUHJvcGVydGllcyBkb24ndCBjaGFuZ2UuXHJcbiAgICBjb25zdCBiYWxsTWFzc1Byb3BlcnRpZXMgPSBwcmVwb3B1bGF0ZWRCYWxscy5tYXAoIGJhbGwgPT4gYmFsbC5tYXNzUHJvcGVydHkgKTtcclxuICAgIGNvbnN0IGJhbGxQb3NpdGlvblByb3BlcnRpZXMgPSBwcmVwb3B1bGF0ZWRCYWxscy5tYXAoIGJhbGwgPT4gYmFsbC5wb3NpdGlvblByb3BlcnR5ICk7XHJcbiAgICBjb25zdCBiYWxsVmVsb2NpdHlQcm9wZXJ0aWVzID0gcHJlcG9wdWxhdGVkQmFsbHMubWFwKCBiYWxsID0+IGJhbGwudmVsb2NpdHlQcm9wZXJ0eSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxWZWN0b3IyPn0gLSBQcm9wZXJ0eSBvZiB0aGUgcG9zaXRpb24gb2YgdGhlIENPTSwgaW4gbWV0ZXIgY29vcmRpbmF0ZXMuXHJcbiAgICAvL1xyXG4gICAgLy8gRm9yIHRoZSBkZXBlbmRlbmNpZXMsIHdlIHVzZTpcclxuICAgIC8vICAtIHBvc2l0aW9uIFByb3BlcnRpZXMgb2YgdGhlIHByZXBvcHVsYXRlZEJhbGxzLiBPbmx5IHRoZSBiYWxscyBpbiB0aGUgQmFsbFN5c3RlbSBhcmUgdXNlZCBpbiB0aGUgY2FsY3VsYXRpb24uXHJcbiAgICAvLyAgLSBtYXNzIFByb3BlcnRpZXMgb2YgdGhlIHByZXBvcHVsYXRlZEJhbGxzLiBPbmx5IHRoZSBiYWxscyBpbiB0aGUgQmFsbFN5c3RlbSBhcmUgdXNlZCBpbiB0aGUgY2FsY3VsYXRpb24uXHJcbiAgICAvLyAgLSBiYWxscy5sZW5ndGhQcm9wZXJ0eSAtIHNpbmNlIHJlbW92aW5nIG9yIGFkZGluZyBhIEJhbGwgY2hhbmdlcyB0aGUgcG9zaXRpb24gb2YgdGhlIENPTS5cclxuICAgIC8vXHJcbiAgICAvLyBUaGlzIERlcml2ZWRQcm9wZXJ0eSBpcyBuZXZlciBkaXNwb3NlZCBhbmQgcGVyc2lzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltLlxyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyAuLi5iYWxsTWFzc1Byb3BlcnRpZXMsIC4uLmJhbGxQb3NpdGlvblByb3BlcnRpZXMsIGJhbGxzLmxlbmd0aFByb3BlcnR5IF0sXHJcbiAgICAgICgpID0+IHRoaXMuY29tcHV0ZVBvc2l0aW9uKCksIHtcclxuICAgICAgICB2YWx1ZVR5cGU6IFZlY3RvcjJcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxWZWN0b3IyPn0gLSBQcm9wZXJ0eSBvZiB0aGUgdmVsb2NpdHkgb2YgdGhlIENPTSwgaW4gbWV0ZXJzIHBlciBzZWNvbmQuXHJcbiAgICAvL1xyXG4gICAgLy8gRm9yIHRoZSBkZXBlbmRlbmNpZXMsIHdlIHVzZTpcclxuICAgIC8vICAtIHZlbG9jaXR5IFByb3BlcnRpZXMgb2YgdGhlIHByZXBvcHVsYXRlZEJhbGxzLiBPbmx5IHRoZSBiYWxscyBpbiB0aGUgQmFsbFN5c3RlbSBhcmUgdXNlZCBpbiB0aGUgY2FsY3VsYXRpb24uXHJcbiAgICAvLyAgLSBtYXNzIFByb3BlcnRpZXMgb2YgdGhlIHByZXBvcHVsYXRlZEJhbGxzLiBPbmx5IHRoZSBiYWxscyBpbiB0aGUgQmFsbFN5c3RlbSBhcmUgdXNlZCBpbiB0aGUgY2FsY3VsYXRpb24uXHJcbiAgICAvLyAgLSBiYWxscy5sZW5ndGhQcm9wZXJ0eSAtIHNpbmNlIHJlbW92aW5nIG9yIGFkZGluZyBhIEJhbGwgY2hhbmdlcyB0aGUgdmVsb2NpdHkgb2YgdGhlIENPTS5cclxuICAgIC8vXHJcbiAgICAvLyBUaGlzIERlcml2ZWRQcm9wZXJ0eSBpcyBuZXZlciBkaXNwb3NlZCBhbmQgcGVyc2lzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltLlxyXG4gICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyAuLi5iYWxsTWFzc1Byb3BlcnRpZXMsIC4uLmJhbGxWZWxvY2l0eVByb3BlcnRpZXMsIGJhbGxzLmxlbmd0aFByb3BlcnR5IF0sXHJcbiAgICAgICgpID0+IHRoaXMuY29tcHV0ZVZlbG9jaXR5KCksIHtcclxuICAgICAgICB2YWx1ZVR5cGU6IFZlY3RvcjJcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSBzcGVlZFByb3BlcnR5IC0gUHJvcGVydHkgb2YgdGhlIHNwZWVkIG9mIHRoZSBCYWxsLCBpbiBtL3MuXHJcbiAgICB0aGlzLnNwZWVkUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMudmVsb2NpdHlQcm9wZXJ0eSBdLCB2ZWxvY2l0eSA9PiB2ZWxvY2l0eS5tYWduaXR1ZGUgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBHZXQgdGhlIFByb3BlcnR5IHRoYXQgaW5kaWNhdGVzIGlmIHRoZSBDZW50ZXJPZk1hc3MncyBQYXRoIGlzIHZpc2libGUsIHdoaWNoIG9jY3VycyB3aGVuIGJvdGggdGhlIENlbnRlck9mTWFzc1xyXG4gICAgLy8gYW5kIFBhdGhzIGFyZSB2aXNpYmxlLiBEZXJpdmVkUHJvcGVydHkgaXMgbmV2ZXIgZGlzcG9zZWQgc2luY2UgQ2VudGVyT2ZNYXNzZXMgYXJlIG5ldmVyIGRpc3Bvc2VkLlxyXG4gICAgY29uc3QgY2VudGVyT2ZNYXNzUGF0aFZpc2libGVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgcGF0aHNWaXNpYmxlUHJvcGVydHksIGNlbnRlck9mTWFzc1Zpc2libGVQcm9wZXJ0eSBdLFxyXG4gICAgICAoIGNlbnRlck9mTWFzc1Zpc2libGUsIHBhdGhWaXNpYmxlICkgPT4gY2VudGVyT2ZNYXNzVmlzaWJsZSAmJiBwYXRoVmlzaWJsZSwge1xyXG4gICAgICAgIHZhbHVlVHlwZTogJ2Jvb2xlYW4nXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtDb2xsaXNpb25MYWJQYXRofSAtIHRoZSB0cmFpbGluZyAnUGF0aCcgYmVoaW5kIHRoZSBDZW50ZXJPZk1hc3MuXHJcbiAgICB0aGlzLnBhdGggPSBuZXcgQ29sbGlzaW9uTGFiUGF0aCggdGhpcy5wb3NpdGlvblByb3BlcnR5LCBjZW50ZXJPZk1hc3NQYXRoVmlzaWJsZVByb3BlcnR5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIENlbnRlck9mTWFzcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgcmVzZXQtYWxsIGJ1dHRvbiBpcyBwcmVzc2VkLlxyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5wYXRoLmNsZWFyKCk7XHJcbiAgfVxyXG5cclxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogUHJpdmF0ZSBNZXRob2RzLlxyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gIC8qKlxyXG4gICAqIENvbXB1dGVzIHRoZSB0b3RhbCBtYXNzIG9mIHRoZSBCYWxscyBpbiB0aGUgc3lzdGVtLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIGluIGtnLlxyXG4gICAqL1xyXG4gIGNvbXB1dGVUb3RhbEJhbGxTeXN0ZW1NYXNzKCkge1xyXG4gICAgcmV0dXJuIF8uc3VtQnkoIHRoaXMuYmFsbHMsIGJhbGwgPT4gYmFsbC5tYXNzUHJvcGVydHkudmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbXB1dGVzIHRoZSBwb3NpdGlvbiBvZiB0aGUgY2VudGVyIG9mIG1hc3MuIE5vcm1hbGx5IGNhbGxlZCB3aGVuIHRoZSBwb3NpdGlvbiBvZiBvbmUgb2YgdGhlIEJhbGxzIGluIHRoZSBzeXN0ZW1cclxuICAgKiBpcyBjaGFuZ2luZyBvciB3aGVuIEJhbGxzIGFyZSBhZGRlZC9yZW1vdmVkIGZyb20gdGhlIHN5c3RlbS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn0gLSBpbiBtZXRlciBjb29yZGluYXRlcy5cclxuICAgKi9cclxuICBjb21wdXRlUG9zaXRpb24oKSB7XHJcblxyXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSB0b3RhbCBmaXJzdCBtb21lbnQgKG1hc3MgKiBwb3NpdGlvbikgb2YgdGhlIHN5c3RlbS5cclxuICAgIGNvbnN0IHRvdGFsRmlyc3RNb21lbnQgPSBWZWN0b3IyLlpFUk8uY29weSgpO1xyXG4gICAgdGhpcy5iYWxscy5mb3JFYWNoKCBiYWxsID0+IHtcclxuICAgICAgdG90YWxGaXJzdE1vbWVudC5hZGQoIHNjcmF0Y2hWZWN0b3Iuc2V0KCBiYWxsLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKS5tdWx0aXBseSggYmFsbC5tYXNzUHJvcGVydHkudmFsdWUgKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRoZSBwb3NpdGlvbiBvZiB0aGUgY2VudGVyIG9mIG1hc3MgaXMgdGhlIHRvdGFsIGZpcnN0IG1vbWVudCBkaXZpZGVkIGJ5IHRoZSB0b3RhbCBtYXNzLlxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NlbnRlcl9vZl9tYXNzI0Ffc3lzdGVtX29mX3BhcnRpY2xlcyBmb3IgYmFja2dyb3VuZCBvbiB0aGlzIGZvcm11bGEuXHJcbiAgICByZXR1cm4gdG90YWxGaXJzdE1vbWVudC5kaXZpZGVkU2NhbGFyKCB0aGlzLmNvbXB1dGVUb3RhbEJhbGxTeXN0ZW1NYXNzKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbXB1dGVzIHRoZSB2ZWxvY2l0eSBvZiB0aGUgY2VudGVyIG9mIG1hc3MuIENhbGxlZCB3aGVuIHRoZSBtb21lbnR1bSBvZiBvbmUgb2YgdGhlIEJhbGxzIGluIHRoZSBzeXN0ZW1cclxuICAgKiBpcyBjaGFuZ2luZyBvciB3aGVuIEJhbGxzIGFyZSBhZGRlZC9yZW1vdmVkIGZyb20gdGhlIHN5c3RlbS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn0gLSBpbiBtZXRlcnMgcGVyIHNlY29uZC5cclxuICAgKi9cclxuICBjb21wdXRlVmVsb2NpdHkoKSB7XHJcblxyXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSB0b3RhbCBtb21lbnR1bSBvZiB0aGUgc3lzdGVtLlxyXG4gICAgY29uc3QgdG90YWxNb21lbnR1bSA9IFZlY3RvcjIuWkVSTy5jb3B5KCk7XHJcbiAgICB0aGlzLmJhbGxzLmZvckVhY2goIGJhbGwgPT4ge1xyXG4gICAgICB0b3RhbE1vbWVudHVtLmFkZCggYmFsbC5tb21lbnR1bVByb3BlcnR5LnZhbHVlICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVGhlIHZlbG9jaXR5IG9mIHRoZSBjZW50ZXIgb2YgbWFzcyBpcyB0aGUgdG90YWwgbW9tZW50dW0gZGl2aWRlZCBieSB0aGUgdG90YWwgbWFzcy5cclxuICAgIHJldHVybiB0b3RhbE1vbWVudHVtLmRpdmlkZWRTY2FsYXIoIHRoaXMuY29tcHV0ZVRvdGFsQmFsbFN5c3RlbU1hc3MoKSApO1xyXG4gIH1cclxufVxyXG5cclxuY29sbGlzaW9uTGFiLnJlZ2lzdGVyKCAnQ2VudGVyT2ZNYXNzJywgQ2VudGVyT2ZNYXNzICk7XHJcbmV4cG9ydCBkZWZhdWx0IENlbnRlck9mTWFzczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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