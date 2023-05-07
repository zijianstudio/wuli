// Copyright 2020-2021, University of Colorado Boulder

/**
 * InelasticCollisionEngine is a CollisionEngine sub-type for the 'Inelastic' screen, which handles all continual
 * ball-to-ball collision responses for perfectly inelastic collisions that 'stick'.
 *
 * Perfectly inelastic collisions that 'stick' are a new feature of the HTML5 version of the simulation, where Balls
 * completely stick together and rotate around the center of mass of the Balls. When a 'sticky' collision between balls
 * occurs, InelasticCollisionEngine will dynamically create a RotatingBallCluster instance. This means that there is a
 * third type of collision that InelasticCollisionEngine deals with - cluster-to-border collisions.
 *
 * ## Rotation-Collision Response
 *
 *  - When a collision between 2 Balls is detected by CollisionEngine, and the collision is a perfectly inelastic
 *    collisions that 'sticks', the collision response is overridden. The velocity of the center-of-mass of the 2
 *    Balls is the same before and after the collision, so there is no need to compute the center-of-mass velocity.
 *    A RotatingBallCluster instance will be created. Currently, the 'Inelastic' screen only has 2 Balls, so the
 *    RotatingBallCluster represents the entire BallSystem.
 *
 *  - Using the conservation of Angular Momentum (L), the InelasticCollisionEngine derives the angular velocity (omega)
 *    of the rotation of the balls relative to the center of mass. See the following for some general background:
 *      + https://en.wikipedia.org/wiki/Angular_momentum#Discussion
 *      + https://en.wikipedia.org/wiki/Angular_momentum#Collection_of_particles
 *      + https://en.wikipedia.org/wiki/Angular_velocity
 *
 * ### Cluster-to-border Collision Detection:
 *
 *  - On the first time-step after a RotatingBallCluster instance has been created, InelasticCollisionEngine must detect
 *    when it will collide with the border (if 'Reflecting Border' is on). There is no closed-form solution to finding
 *    when the cluster will collide.
 *
 *  - The lower-bound of when the cluster will collide with the border is when the bounding circle of the cluster
 *    collides with the border. The upper-bound is when the center-of-mass collides with the border.
 *    InelasticCollisionEngine uses the bisection method to approximate when the cluster exactly collides with the
 *    border. See https://en.wikipedia.org/wiki/Bisection_method.
 *
 * @author Brandon Li
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import CollisionLabUtils from '../../common/CollisionLabUtils.js';
import Ball from '../../common/model/Ball.js';
import Collision from '../../common/model/Collision.js';
import CollisionEngine from '../../common/model/CollisionEngine.js';
import InelasticBallSystem from './InelasticBallSystem.js';
import InelasticCollisionType from './InelasticCollisionType.js';
import InelasticPlayArea from './InelasticPlayArea.js';
import RotatingBallCluster from './RotatingBallCluster.js';

// constants
const TOLERANCE = CollisionLabConstants.ZERO_THRESHOLD;
class InelasticCollisionEngine extends CollisionEngine {
  /**
   * @param {InelasticPlayArea} playArea
   * @param {InelasticBallSystem} ballSystem
   */
  constructor(playArea, ballSystem) {
    assert && assert(playArea instanceof InelasticPlayArea, `invalid playArea: ${playArea}`);
    assert && assert(ballSystem instanceof InelasticBallSystem, `invalid ballSystem: ${ballSystem}`);
    super(playArea, ballSystem);

    // @private {RotatingBallCluster|null} - the RotatingBallCluster instance if the Balls in the system are being
    //                                       rotated. Since there are only 2 Balls in the 'Inelastic' screen, there can
    //                                       only be 1 RotatingBallCluster instance.
    this.rotatingBallCluster = null;

    // Observe when the InelasticPreset is changed and reset the InelasticCollisionEngine. When the InelasticPreset is
    // changed, Balls are set to different states, meaning existing Collisions may be incorrect and collisions should be
    // re-detected. Link persists for the lifetime of the simulation.
    ballSystem.inelasticPresetProperty.lazyLink(this.reset.bind(this));
  }

  /**
   * Resets the InelasticCollisionEngine.
   * @override
   * @public
   *
   * Called when the reset/restart button is pressed or when some 'state' of the simulation changes.
   */
  reset() {
    this.rotatingBallCluster = null;
    super.reset();
  }

  /**
   * Progresses the Balls forwards by the given time-delta, assuming there are no collisions.
   * @protected
   * @override
   *
   * @param {number} dt - time-delta, in seconds.
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  progressBalls(dt, elapsedTime) {
    assert && assert(typeof dt === 'number', `invalid dt: ${dt}`);
    assert && assert(typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim('InelasticCollisionEngine.progressBalls');
    sceneryLog && sceneryLog.Sim && sceneryLog.push();

    // Step the RotatingBallCluster if it exists and update the trailing 'Paths' behind the Balls.
    if (this.rotatingBallCluster) {
      this.rotatingBallCluster.step(dt);
      this.ballSystem.updatePaths(elapsedTime + dt);
    } else {
      super.progressBalls(dt, elapsedTime);
    }
    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }

  /**
   * Detects all ball-ball, ball-border, and cluster-border collisions that have not already been detected.
   * @protected
   * @override
   *
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  detectAllCollisions(elapsedTime) {
    assert && assert(typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}`);

    // Detect cluster-border collisions if the RotatingBallCluster exists.
    if (this.rotatingBallCluster) {
      this.detectBallClusterToBorderCollision(elapsedTime);
    } else {
      super.detectAllCollisions(elapsedTime);
    }
  }

  /**
   * Handles all Collisions by calling a response algorithm, dispatched by the type of bodies involved in the Collision.
   * @protected
   * @override
   *
   * @param {Collision} collision - the Collision instance.
   * @param {number} dt
   */
  handleCollision(collision, dt) {
    assert && assert(collision instanceof Collision, `invalid collision: ${collision}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim('InelasticCollisionEngine.handleCollision');
    sceneryLog && sceneryLog.Sim && sceneryLog.push();

    // Handle cluster-border collisions if the collision involves the rotatingBallCluster.
    if (this.rotatingBallCluster && collision.includes(this.rotatingBallCluster)) {
      this.handleBallClusterToBorderCollision(collision);
    } else {
      super.handleCollision(collision, dt);
    }
    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }

  //----------------------------------------------------------------------------------------

  /**
   * Processes and responds to a collision between two balls. Overridden to respond to perfectly inelastic 'stick'
   * collisions between two Balls, in which this method will create and reference a RotatingBallCluster instance.
   * @override
   * @protected
   *
   * @param {Ball} ball1 - the first Ball involved in the collision.
   * @param {Ball} ball2 - the second Ball involved in the collision.
   * @param {number} dt
   */
  handleBallToBallCollision(ball1, ball2, dt) {
    assert && assert(ball1 instanceof Ball, `invalid ball1: ${ball1}`);
    assert && assert(ball2 instanceof Ball, `invalid ball2: ${ball2}`);
    assert && assert(this.playArea.getElasticity() === 0, 'must be perfectly inelastic for Inelastic screen');
    assert && assert(this.ballSystem.balls.length === 2, 'InelasticCollisionEngine only supports collisions of 2 Balls');
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`InelasticCollisionEngine.handleBallToBallCollision #${ball1.index} #${ball2.index}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.push();
    super.handleBallToBallCollision(ball1, ball2, dt);

    // Handle collisions that 'stick'.
    if (this.playArea.inelasticCollisionTypeProperty.value === InelasticCollisionType.STICK) {
      // Get the moment of inertia of both Balls, treated as point masses rotating around their center of mass. The
      // reason why we treat the Balls as point masses is because of the formula L = r^2 * m * omega, where r^2 * m is
      // the moment of inertia of a point-mass. See https://en.wikipedia.org/wiki/Angular_momentum#Discussion.
      const I1 = ball1.positionProperty.value.minus(this.ballSystem.centerOfMass.positionProperty.value).magnitudeSquared * ball1.massProperty.value;
      const I2 = ball2.positionProperty.value.minus(this.ballSystem.centerOfMass.positionProperty.value).magnitudeSquared * ball2.massProperty.value;

      // Update the angular velocity reference. Formula comes from
      // https://en.wikipedia.org/wiki/Angular_momentum#Collection_of_particles.
      const angularVelocity = this.ballSystem.getTotalAngularMomentum() / (I1 + I2);

      // Create and reference a RotatingBallCluster instance. Since there are only 2 Balls in the 'Inelastic' screen,
      // the RotatingBallCluster represents the entire BallSystem.
      this.rotatingBallCluster = new RotatingBallCluster(this.ballSystem.balls, angularVelocity, this.ballSystem.centerOfMass);
      sceneryLog && sceneryLog.Sim && sceneryLog.Sim('RotatingBallCluster created');
    }
    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }

  /**
   * Processes a ball-to-border collision and updates the velocity and the position of the Ball. Overridden to respond
   * to perfectly inelastic 'stick' collisions, in which the Ball's velocity is set to 0.
   * @override
   * @protected
   *
   * @param {Ball} ball - the Ball involved in the collision.
   * @param {number} dt
   */
  handleBallToBorderCollision(ball, dt) {
    assert && assert(ball instanceof Ball, `invalid ball: ${ball}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`InelasticCollisionEngine.handleBallToBorderCollision #${ball.index}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.push();
    super.handleBallToBorderCollision(ball, dt);

    // Handle collisions that 'stick'.
    if (this.playArea.inelasticCollisionTypeProperty.value === InelasticCollisionType.STICK) {
      // Set the velocity of the Ball to 0.
      ball.velocityProperty.value = Vector2.ZERO;
    }
    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }

  /*----------------------------------------------------------------------------*
   * Rotating Ball Cluster to Border Collisions
   *----------------------------------------------------------------------------*/

  /**
   * Detects the cluster-to-border collision of the rotatingBallCluster if it hasn't already been detected. Although
   * tunneling doesn't occur with cluster-to-border collisions, collisions are still detected before they occur to
   * mirror the approach in the super-class. For newly detected collisions, information is encapsulated in a Collision
   * instance. NOTE: no-op when the PlayArea's border doesn't reflect.
   * @private
   *
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  detectBallClusterToBorderCollision(elapsedTime) {
    assert && assert(typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}`);
    assert && assert(this.rotatingBallCluster, 'cannot call detectBallClusterToBorderCollision');
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim('detectBallClusterToBorderCollision');

    // No-op if the PlayArea's border doesn't reflect
    if (!this.playArea.reflectingBorderProperty.value) {
      return;
    }

    // No-op if the cluster-to-border collision has already been detected
    for (let i = 0; i < this.collisions.length; i++) {
      if (this.collisions[i].includes(this.rotatingBallCluster)) {
        return;
      }
    }

    // Handle degenerate case where the cluster is already colliding with the border.
    for (let i = 0; i < this.rotatingBallCluster.balls.length; i++) {
      const ball = this.rotatingBallCluster.balls[i];

      // If any ball is touching the side
      if (this.playArea.isBallTouchingSide(ball)) {
        const collision = Collision.createFromPool(this.rotatingBallCluster, this.playArea, elapsedTime);
        sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`adding collision ${collision}`);
        this.collisions.push(collision);
        return;
      }
    }

    // Handle degenerate case where the cluster is out-of-bounds. In the design, if an object is partially out-of-bounds
    // when the Reflecting Border is turned on, it will continue to escape.
    for (let i = 0; i < this.rotatingBallCluster.balls.length; i++) {
      const ball = this.rotatingBallCluster.balls[i];
      if (!this.playArea.fullyContainsBall(ball)) {
        return;
      }
    }

    // Get the lower-bound of when the cluster will collide with the border, which is when bounding circle of the
    // cluster collides with the border.
    const minCollisionTime = this.getBorderCollisionTime(this.ballSystem.centerOfMass.positionProperty.value, this.ballSystem.centerOfMass.velocityProperty.value, this.rotatingBallCluster.getBoundingCircleRadius(), elapsedTime);

    // Get the upper-bound of when the cluster will collide with the border, which is when the center-of-mass collides
    // with the border.
    const maxCollisionTime = this.getBorderCollisionTime(this.ballSystem.centerOfMass.positionProperty.value, this.ballSystem.centerOfMass.velocityProperty.value, 0, elapsedTime);

    // Use the bisection method to approximate when the cluster exactly collides with the border.
    const collisionTime = !Number.isFinite(minCollisionTime) || !Number.isFinite(maxCollisionTime) ? null : CollisionLabUtils.bisection(time => this.willBallClusterCollideWithBorderIn(time - elapsedTime), minCollisionTime, maxCollisionTime);

    // Register the collision and encapsulate information in a Collision instance.
    const collision = Collision.createFromPool(this.rotatingBallCluster, this.playArea, collisionTime);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`adding collision ${collision}`);
    this.collisions.push(collision);
  }

  /**
   * Indicates if the rotatingBallCluster will approximately collide with the border at some passed-in time-delta OR if
   * it is an over/under estimate. If any of the Balls in cluster are overlapping (more than some threshold), then the
   * dt is considered an overestimate. Likewise, if none of the balls are overlapping, the dt is an underestimate. If
   * any of the Balls are tangentially touching the side of the PlayArea, it is considered to be 'close enough'.
   * @private
   *
   * @param {number} dt
   * @returns {number} - Returns -1 if the passed-in time is an underestimate,
   *                              0 if the passed-in time is considered 'close enough'
   *                              1 if the passed-in time is an overestimate.
   */
  willBallClusterCollideWithBorderIn(dt) {
    assert && assert(typeof dt === 'number', `invalid dt: ${dt}`);
    assert && assert(this.rotatingBallCluster, 'cannot call willBallClusterCollideWithBorderIn');
    assert && assert(this.playArea.reflectingBorderProperty.value, 'cannot call willBallClusterCollideWithBorderIn');

    // Get the states of the Balls after the time-delta.
    const rotationStates = this.rotatingBallCluster.getSteppedRotationStates(dt);

    // Flags that track the number of Balls in the cluster that are overlapping and tangentially touching the border.
    let overlapping = 0;
    let touching = 0;
    for (let i = 0; i < this.rotatingBallCluster.balls.length; i++) {
      const ball = this.rotatingBallCluster.balls[i];
      const radius = ball.radiusProperty.value;

      // Position of the Ball after the time-delta.
      const position = rotationStates.get(ball).position;
      const left = position.x - radius;
      const right = position.x + radius;
      const top = position.y + radius;
      const bottom = position.y - radius;
      if (left < this.playArea.left || right > this.playArea.right || bottom < this.playArea.bottom || top > this.playArea.top) {
        overlapping += 1;
      } else if (Utils.equalsEpsilon(left, this.playArea.left, TOLERANCE) || Utils.equalsEpsilon(right, this.playArea.right, TOLERANCE) || Utils.equalsEpsilon(top, this.playArea.top, TOLERANCE) || Utils.equalsEpsilon(bottom, this.playArea.bottom, TOLERANCE)) {
        touching += 1;
      }
    }
    return overlapping ? 1 : touching ? 0 : -1;
  }

  /**
   * Handles a cluster-to-border collision by updating the velocity of the Balls.
   * @private
   *
   * When a rotating ball cluster collides the border, every ball in the cluster has 0 velocity.
   */
  handleBallClusterToBorderCollision() {
    assert && assert(this.rotatingBallCluster, 'cannot call handleBallToBorderCollision');
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim('InelasticCollisionEngine.handleBallClusterToBorderCollision');
    sceneryLog && sceneryLog.Sim && sceneryLog.push();

    // Set the velocity of every Ball to 0.
    this.rotatingBallCluster.balls.forEach(ball => {
      ball.velocityProperty.value = Vector2.ZERO;
    });

    // Remove all collisions that involves rotatingBallCluster.
    this.invalidateCollisions(this.rotatingBallCluster);
    this.rotatingBallCluster = null;
    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }
}
collisionLab.register('InelasticCollisionEngine', InelasticCollisionEngine);
export default InelasticCollisionEngine;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlZlY3RvcjIiLCJjb2xsaXNpb25MYWIiLCJDb2xsaXNpb25MYWJDb25zdGFudHMiLCJDb2xsaXNpb25MYWJVdGlscyIsIkJhbGwiLCJDb2xsaXNpb24iLCJDb2xsaXNpb25FbmdpbmUiLCJJbmVsYXN0aWNCYWxsU3lzdGVtIiwiSW5lbGFzdGljQ29sbGlzaW9uVHlwZSIsIkluZWxhc3RpY1BsYXlBcmVhIiwiUm90YXRpbmdCYWxsQ2x1c3RlciIsIlRPTEVSQU5DRSIsIlpFUk9fVEhSRVNIT0xEIiwiSW5lbGFzdGljQ29sbGlzaW9uRW5naW5lIiwiY29uc3RydWN0b3IiLCJwbGF5QXJlYSIsImJhbGxTeXN0ZW0iLCJhc3NlcnQiLCJyb3RhdGluZ0JhbGxDbHVzdGVyIiwiaW5lbGFzdGljUHJlc2V0UHJvcGVydHkiLCJsYXp5TGluayIsInJlc2V0IiwiYmluZCIsInByb2dyZXNzQmFsbHMiLCJkdCIsImVsYXBzZWRUaW1lIiwic2NlbmVyeUxvZyIsIlNpbSIsInB1c2giLCJzdGVwIiwidXBkYXRlUGF0aHMiLCJwb3AiLCJkZXRlY3RBbGxDb2xsaXNpb25zIiwiZGV0ZWN0QmFsbENsdXN0ZXJUb0JvcmRlckNvbGxpc2lvbiIsImhhbmRsZUNvbGxpc2lvbiIsImNvbGxpc2lvbiIsImluY2x1ZGVzIiwiaGFuZGxlQmFsbENsdXN0ZXJUb0JvcmRlckNvbGxpc2lvbiIsImhhbmRsZUJhbGxUb0JhbGxDb2xsaXNpb24iLCJiYWxsMSIsImJhbGwyIiwiZ2V0RWxhc3RpY2l0eSIsImJhbGxzIiwibGVuZ3RoIiwiaW5kZXgiLCJpbmVsYXN0aWNDb2xsaXNpb25UeXBlUHJvcGVydHkiLCJ2YWx1ZSIsIlNUSUNLIiwiSTEiLCJwb3NpdGlvblByb3BlcnR5IiwibWludXMiLCJjZW50ZXJPZk1hc3MiLCJtYWduaXR1ZGVTcXVhcmVkIiwibWFzc1Byb3BlcnR5IiwiSTIiLCJhbmd1bGFyVmVsb2NpdHkiLCJnZXRUb3RhbEFuZ3VsYXJNb21lbnR1bSIsImhhbmRsZUJhbGxUb0JvcmRlckNvbGxpc2lvbiIsImJhbGwiLCJ2ZWxvY2l0eVByb3BlcnR5IiwiWkVSTyIsInJlZmxlY3RpbmdCb3JkZXJQcm9wZXJ0eSIsImkiLCJjb2xsaXNpb25zIiwiaXNCYWxsVG91Y2hpbmdTaWRlIiwiY3JlYXRlRnJvbVBvb2wiLCJmdWxseUNvbnRhaW5zQmFsbCIsIm1pbkNvbGxpc2lvblRpbWUiLCJnZXRCb3JkZXJDb2xsaXNpb25UaW1lIiwiZ2V0Qm91bmRpbmdDaXJjbGVSYWRpdXMiLCJtYXhDb2xsaXNpb25UaW1lIiwiY29sbGlzaW9uVGltZSIsIk51bWJlciIsImlzRmluaXRlIiwiYmlzZWN0aW9uIiwidGltZSIsIndpbGxCYWxsQ2x1c3RlckNvbGxpZGVXaXRoQm9yZGVySW4iLCJyb3RhdGlvblN0YXRlcyIsImdldFN0ZXBwZWRSb3RhdGlvblN0YXRlcyIsIm92ZXJsYXBwaW5nIiwidG91Y2hpbmciLCJyYWRpdXMiLCJyYWRpdXNQcm9wZXJ0eSIsInBvc2l0aW9uIiwiZ2V0IiwibGVmdCIsIngiLCJyaWdodCIsInRvcCIsInkiLCJib3R0b20iLCJlcXVhbHNFcHNpbG9uIiwiZm9yRWFjaCIsImludmFsaWRhdGVDb2xsaXNpb25zIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbmVsYXN0aWNDb2xsaXNpb25FbmdpbmUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSW5lbGFzdGljQ29sbGlzaW9uRW5naW5lIGlzIGEgQ29sbGlzaW9uRW5naW5lIHN1Yi10eXBlIGZvciB0aGUgJ0luZWxhc3RpYycgc2NyZWVuLCB3aGljaCBoYW5kbGVzIGFsbCBjb250aW51YWxcclxuICogYmFsbC10by1iYWxsIGNvbGxpc2lvbiByZXNwb25zZXMgZm9yIHBlcmZlY3RseSBpbmVsYXN0aWMgY29sbGlzaW9ucyB0aGF0ICdzdGljaycuXHJcbiAqXHJcbiAqIFBlcmZlY3RseSBpbmVsYXN0aWMgY29sbGlzaW9ucyB0aGF0ICdzdGljaycgYXJlIGEgbmV3IGZlYXR1cmUgb2YgdGhlIEhUTUw1IHZlcnNpb24gb2YgdGhlIHNpbXVsYXRpb24sIHdoZXJlIEJhbGxzXHJcbiAqIGNvbXBsZXRlbHkgc3RpY2sgdG9nZXRoZXIgYW5kIHJvdGF0ZSBhcm91bmQgdGhlIGNlbnRlciBvZiBtYXNzIG9mIHRoZSBCYWxscy4gV2hlbiBhICdzdGlja3knIGNvbGxpc2lvbiBiZXR3ZWVuIGJhbGxzXHJcbiAqIG9jY3VycywgSW5lbGFzdGljQ29sbGlzaW9uRW5naW5lIHdpbGwgZHluYW1pY2FsbHkgY3JlYXRlIGEgUm90YXRpbmdCYWxsQ2x1c3RlciBpbnN0YW5jZS4gVGhpcyBtZWFucyB0aGF0IHRoZXJlIGlzIGFcclxuICogdGhpcmQgdHlwZSBvZiBjb2xsaXNpb24gdGhhdCBJbmVsYXN0aWNDb2xsaXNpb25FbmdpbmUgZGVhbHMgd2l0aCAtIGNsdXN0ZXItdG8tYm9yZGVyIGNvbGxpc2lvbnMuXHJcbiAqXHJcbiAqICMjIFJvdGF0aW9uLUNvbGxpc2lvbiBSZXNwb25zZVxyXG4gKlxyXG4gKiAgLSBXaGVuIGEgY29sbGlzaW9uIGJldHdlZW4gMiBCYWxscyBpcyBkZXRlY3RlZCBieSBDb2xsaXNpb25FbmdpbmUsIGFuZCB0aGUgY29sbGlzaW9uIGlzIGEgcGVyZmVjdGx5IGluZWxhc3RpY1xyXG4gKiAgICBjb2xsaXNpb25zIHRoYXQgJ3N0aWNrcycsIHRoZSBjb2xsaXNpb24gcmVzcG9uc2UgaXMgb3ZlcnJpZGRlbi4gVGhlIHZlbG9jaXR5IG9mIHRoZSBjZW50ZXItb2YtbWFzcyBvZiB0aGUgMlxyXG4gKiAgICBCYWxscyBpcyB0aGUgc2FtZSBiZWZvcmUgYW5kIGFmdGVyIHRoZSBjb2xsaXNpb24sIHNvIHRoZXJlIGlzIG5vIG5lZWQgdG8gY29tcHV0ZSB0aGUgY2VudGVyLW9mLW1hc3MgdmVsb2NpdHkuXHJcbiAqICAgIEEgUm90YXRpbmdCYWxsQ2x1c3RlciBpbnN0YW5jZSB3aWxsIGJlIGNyZWF0ZWQuIEN1cnJlbnRseSwgdGhlICdJbmVsYXN0aWMnIHNjcmVlbiBvbmx5IGhhcyAyIEJhbGxzLCBzbyB0aGVcclxuICogICAgUm90YXRpbmdCYWxsQ2x1c3RlciByZXByZXNlbnRzIHRoZSBlbnRpcmUgQmFsbFN5c3RlbS5cclxuICpcclxuICogIC0gVXNpbmcgdGhlIGNvbnNlcnZhdGlvbiBvZiBBbmd1bGFyIE1vbWVudHVtIChMKSwgdGhlIEluZWxhc3RpY0NvbGxpc2lvbkVuZ2luZSBkZXJpdmVzIHRoZSBhbmd1bGFyIHZlbG9jaXR5IChvbWVnYSlcclxuICogICAgb2YgdGhlIHJvdGF0aW9uIG9mIHRoZSBiYWxscyByZWxhdGl2ZSB0byB0aGUgY2VudGVyIG9mIG1hc3MuIFNlZSB0aGUgZm9sbG93aW5nIGZvciBzb21lIGdlbmVyYWwgYmFja2dyb3VuZDpcclxuICogICAgICArIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FuZ3VsYXJfbW9tZW50dW0jRGlzY3Vzc2lvblxyXG4gKiAgICAgICsgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQW5ndWxhcl9tb21lbnR1bSNDb2xsZWN0aW9uX29mX3BhcnRpY2xlc1xyXG4gKiAgICAgICsgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQW5ndWxhcl92ZWxvY2l0eVxyXG4gKlxyXG4gKiAjIyMgQ2x1c3Rlci10by1ib3JkZXIgQ29sbGlzaW9uIERldGVjdGlvbjpcclxuICpcclxuICogIC0gT24gdGhlIGZpcnN0IHRpbWUtc3RlcCBhZnRlciBhIFJvdGF0aW5nQmFsbENsdXN0ZXIgaW5zdGFuY2UgaGFzIGJlZW4gY3JlYXRlZCwgSW5lbGFzdGljQ29sbGlzaW9uRW5naW5lIG11c3QgZGV0ZWN0XHJcbiAqICAgIHdoZW4gaXQgd2lsbCBjb2xsaWRlIHdpdGggdGhlIGJvcmRlciAoaWYgJ1JlZmxlY3RpbmcgQm9yZGVyJyBpcyBvbikuIFRoZXJlIGlzIG5vIGNsb3NlZC1mb3JtIHNvbHV0aW9uIHRvIGZpbmRpbmdcclxuICogICAgd2hlbiB0aGUgY2x1c3RlciB3aWxsIGNvbGxpZGUuXHJcbiAqXHJcbiAqICAtIFRoZSBsb3dlci1ib3VuZCBvZiB3aGVuIHRoZSBjbHVzdGVyIHdpbGwgY29sbGlkZSB3aXRoIHRoZSBib3JkZXIgaXMgd2hlbiB0aGUgYm91bmRpbmcgY2lyY2xlIG9mIHRoZSBjbHVzdGVyXHJcbiAqICAgIGNvbGxpZGVzIHdpdGggdGhlIGJvcmRlci4gVGhlIHVwcGVyLWJvdW5kIGlzIHdoZW4gdGhlIGNlbnRlci1vZi1tYXNzIGNvbGxpZGVzIHdpdGggdGhlIGJvcmRlci5cclxuICogICAgSW5lbGFzdGljQ29sbGlzaW9uRW5naW5lIHVzZXMgdGhlIGJpc2VjdGlvbiBtZXRob2QgdG8gYXBwcm94aW1hdGUgd2hlbiB0aGUgY2x1c3RlciBleGFjdGx5IGNvbGxpZGVzIHdpdGggdGhlXHJcbiAqICAgIGJvcmRlci4gU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Jpc2VjdGlvbl9tZXRob2QuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBjb2xsaXNpb25MYWIgZnJvbSAnLi4vLi4vY29sbGlzaW9uTGFiLmpzJztcclxuaW1wb3J0IENvbGxpc2lvbkxhYkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQ29sbGlzaW9uTGFiQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IENvbGxpc2lvbkxhYlV0aWxzIGZyb20gJy4uLy4uL2NvbW1vbi9Db2xsaXNpb25MYWJVdGlscy5qcyc7XHJcbmltcG9ydCBCYWxsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9CYWxsLmpzJztcclxuaW1wb3J0IENvbGxpc2lvbiBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQ29sbGlzaW9uLmpzJztcclxuaW1wb3J0IENvbGxpc2lvbkVuZ2luZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQ29sbGlzaW9uRW5naW5lLmpzJztcclxuaW1wb3J0IEluZWxhc3RpY0JhbGxTeXN0ZW0gZnJvbSAnLi9JbmVsYXN0aWNCYWxsU3lzdGVtLmpzJztcclxuaW1wb3J0IEluZWxhc3RpY0NvbGxpc2lvblR5cGUgZnJvbSAnLi9JbmVsYXN0aWNDb2xsaXNpb25UeXBlLmpzJztcclxuaW1wb3J0IEluZWxhc3RpY1BsYXlBcmVhIGZyb20gJy4vSW5lbGFzdGljUGxheUFyZWEuanMnO1xyXG5pbXBvcnQgUm90YXRpbmdCYWxsQ2x1c3RlciBmcm9tICcuL1JvdGF0aW5nQmFsbENsdXN0ZXIuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRPTEVSQU5DRSA9IENvbGxpc2lvbkxhYkNvbnN0YW50cy5aRVJPX1RIUkVTSE9MRDtcclxuXHJcbmNsYXNzIEluZWxhc3RpY0NvbGxpc2lvbkVuZ2luZSBleHRlbmRzIENvbGxpc2lvbkVuZ2luZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7SW5lbGFzdGljUGxheUFyZWF9IHBsYXlBcmVhXHJcbiAgICogQHBhcmFtIHtJbmVsYXN0aWNCYWxsU3lzdGVtfSBiYWxsU3lzdGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHBsYXlBcmVhLCBiYWxsU3lzdGVtICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcGxheUFyZWEgaW5zdGFuY2VvZiBJbmVsYXN0aWNQbGF5QXJlYSwgYGludmFsaWQgcGxheUFyZWE6ICR7cGxheUFyZWF9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmFsbFN5c3RlbSBpbnN0YW5jZW9mIEluZWxhc3RpY0JhbGxTeXN0ZW0sIGBpbnZhbGlkIGJhbGxTeXN0ZW06ICR7YmFsbFN5c3RlbX1gICk7XHJcblxyXG4gICAgc3VwZXIoIHBsYXlBcmVhLCBiYWxsU3lzdGVtICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1JvdGF0aW5nQmFsbENsdXN0ZXJ8bnVsbH0gLSB0aGUgUm90YXRpbmdCYWxsQ2x1c3RlciBpbnN0YW5jZSBpZiB0aGUgQmFsbHMgaW4gdGhlIHN5c3RlbSBhcmUgYmVpbmdcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm90YXRlZC4gU2luY2UgdGhlcmUgYXJlIG9ubHkgMiBCYWxscyBpbiB0aGUgJ0luZWxhc3RpYycgc2NyZWVuLCB0aGVyZSBjYW5cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25seSBiZSAxIFJvdGF0aW5nQmFsbENsdXN0ZXIgaW5zdGFuY2UuXHJcbiAgICB0aGlzLnJvdGF0aW5nQmFsbENsdXN0ZXIgPSBudWxsO1xyXG5cclxuICAgIC8vIE9ic2VydmUgd2hlbiB0aGUgSW5lbGFzdGljUHJlc2V0IGlzIGNoYW5nZWQgYW5kIHJlc2V0IHRoZSBJbmVsYXN0aWNDb2xsaXNpb25FbmdpbmUuIFdoZW4gdGhlIEluZWxhc3RpY1ByZXNldCBpc1xyXG4gICAgLy8gY2hhbmdlZCwgQmFsbHMgYXJlIHNldCB0byBkaWZmZXJlbnQgc3RhdGVzLCBtZWFuaW5nIGV4aXN0aW5nIENvbGxpc2lvbnMgbWF5IGJlIGluY29ycmVjdCBhbmQgY29sbGlzaW9ucyBzaG91bGQgYmVcclxuICAgIC8vIHJlLWRldGVjdGVkLiBMaW5rIHBlcnNpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbXVsYXRpb24uXHJcbiAgICBiYWxsU3lzdGVtLmluZWxhc3RpY1ByZXNldFByb3BlcnR5LmxhenlMaW5rKCB0aGlzLnJlc2V0LmJpbmQoIHRoaXMgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSBJbmVsYXN0aWNDb2xsaXNpb25FbmdpbmUuXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHJlc2V0L3Jlc3RhcnQgYnV0dG9uIGlzIHByZXNzZWQgb3Igd2hlbiBzb21lICdzdGF0ZScgb2YgdGhlIHNpbXVsYXRpb24gY2hhbmdlcy5cclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMucm90YXRpbmdCYWxsQ2x1c3RlciA9IG51bGw7XHJcbiAgICBzdXBlci5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUHJvZ3Jlc3NlcyB0aGUgQmFsbHMgZm9yd2FyZHMgYnkgdGhlIGdpdmVuIHRpbWUtZGVsdGEsIGFzc3VtaW5nIHRoZXJlIGFyZSBubyBjb2xsaXNpb25zLlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIHRpbWUtZGVsdGEsIGluIHNlY29uZHMuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVsYXBzZWRUaW1lIC0gZWxhcHNlZFRpbWUsIGJhc2VkIG9uIHdoZXJlIHRoZSBCYWxscyBhcmUgcG9zaXRpb25lZCB3aGVuIHRoaXMgbWV0aG9kIGlzIGNhbGxlZC5cclxuICAgKi9cclxuICBwcm9ncmVzc0JhbGxzKCBkdCwgZWxhcHNlZFRpbWUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgZHQgPT09ICdudW1iZXInLCBgaW52YWxpZCBkdDogJHtkdH1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgZWxhcHNlZFRpbWUgPT09ICdudW1iZXInICYmIGVsYXBzZWRUaW1lID49IDAsIGBpbnZhbGlkIGVsYXBzZWRUaW1lOiAke2VsYXBzZWRUaW1lfWAgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHNjZW5lcnlMb2cuU2ltKCAnSW5lbGFzdGljQ29sbGlzaW9uRW5naW5lLnByb2dyZXNzQmFsbHMnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIC8vIFN0ZXAgdGhlIFJvdGF0aW5nQmFsbENsdXN0ZXIgaWYgaXQgZXhpc3RzIGFuZCB1cGRhdGUgdGhlIHRyYWlsaW5nICdQYXRocycgYmVoaW5kIHRoZSBCYWxscy5cclxuICAgIGlmICggdGhpcy5yb3RhdGluZ0JhbGxDbHVzdGVyICkge1xyXG4gICAgICB0aGlzLnJvdGF0aW5nQmFsbENsdXN0ZXIuc3RlcCggZHQgKTtcclxuICAgICAgdGhpcy5iYWxsU3lzdGVtLnVwZGF0ZVBhdGhzKCBlbGFwc2VkVGltZSArIGR0ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgc3VwZXIucHJvZ3Jlc3NCYWxscyggZHQsIGVsYXBzZWRUaW1lICk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZWN0cyBhbGwgYmFsbC1iYWxsLCBiYWxsLWJvcmRlciwgYW5kIGNsdXN0ZXItYm9yZGVyIGNvbGxpc2lvbnMgdGhhdCBoYXZlIG5vdCBhbHJlYWR5IGJlZW4gZGV0ZWN0ZWQuXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVsYXBzZWRUaW1lIC0gZWxhcHNlZFRpbWUsIGJhc2VkIG9uIHdoZXJlIHRoZSBCYWxscyBhcmUgcG9zaXRpb25lZCB3aGVuIHRoaXMgbWV0aG9kIGlzIGNhbGxlZC5cclxuICAgKi9cclxuICBkZXRlY3RBbGxDb2xsaXNpb25zKCBlbGFwc2VkVGltZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBlbGFwc2VkVGltZSA9PT0gJ251bWJlcicgJiYgZWxhcHNlZFRpbWUgPj0gMCwgYGludmFsaWQgZWxhcHNlZFRpbWU6ICR7ZWxhcHNlZFRpbWV9YCApO1xyXG5cclxuICAgIC8vIERldGVjdCBjbHVzdGVyLWJvcmRlciBjb2xsaXNpb25zIGlmIHRoZSBSb3RhdGluZ0JhbGxDbHVzdGVyIGV4aXN0cy5cclxuICAgIGlmICggdGhpcy5yb3RhdGluZ0JhbGxDbHVzdGVyICkge1xyXG4gICAgICB0aGlzLmRldGVjdEJhbGxDbHVzdGVyVG9Cb3JkZXJDb2xsaXNpb24oIGVsYXBzZWRUaW1lICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgc3VwZXIuZGV0ZWN0QWxsQ29sbGlzaW9ucyggZWxhcHNlZFRpbWUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhhbmRsZXMgYWxsIENvbGxpc2lvbnMgYnkgY2FsbGluZyBhIHJlc3BvbnNlIGFsZ29yaXRobSwgZGlzcGF0Y2hlZCBieSB0aGUgdHlwZSBvZiBib2RpZXMgaW52b2x2ZWQgaW4gdGhlIENvbGxpc2lvbi5cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NvbGxpc2lvbn0gY29sbGlzaW9uIC0gdGhlIENvbGxpc2lvbiBpbnN0YW5jZS5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKi9cclxuICBoYW5kbGVDb2xsaXNpb24oIGNvbGxpc2lvbiwgZHQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb2xsaXNpb24gaW5zdGFuY2VvZiBDb2xsaXNpb24sIGBpbnZhbGlkIGNvbGxpc2lvbjogJHtjb2xsaXNpb259YCApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5TaW0oICdJbmVsYXN0aWNDb2xsaXNpb25FbmdpbmUuaGFuZGxlQ29sbGlzaW9uJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgY2x1c3Rlci1ib3JkZXIgY29sbGlzaW9ucyBpZiB0aGUgY29sbGlzaW9uIGludm9sdmVzIHRoZSByb3RhdGluZ0JhbGxDbHVzdGVyLlxyXG4gICAgaWYgKCB0aGlzLnJvdGF0aW5nQmFsbENsdXN0ZXIgJiYgY29sbGlzaW9uLmluY2x1ZGVzKCB0aGlzLnJvdGF0aW5nQmFsbENsdXN0ZXIgKSApIHtcclxuICAgICAgdGhpcy5oYW5kbGVCYWxsQ2x1c3RlclRvQm9yZGVyQ29sbGlzaW9uKCBjb2xsaXNpb24gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBzdXBlci5oYW5kbGVDb2xsaXNpb24oIGNvbGxpc2lvbiwgZHQgKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLyoqXHJcbiAgICogUHJvY2Vzc2VzIGFuZCByZXNwb25kcyB0byBhIGNvbGxpc2lvbiBiZXR3ZWVuIHR3byBiYWxscy4gT3ZlcnJpZGRlbiB0byByZXNwb25kIHRvIHBlcmZlY3RseSBpbmVsYXN0aWMgJ3N0aWNrJ1xyXG4gICAqIGNvbGxpc2lvbnMgYmV0d2VlbiB0d28gQmFsbHMsIGluIHdoaWNoIHRoaXMgbWV0aG9kIHdpbGwgY3JlYXRlIGFuZCByZWZlcmVuY2UgYSBSb3RhdGluZ0JhbGxDbHVzdGVyIGluc3RhbmNlLlxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QmFsbH0gYmFsbDEgLSB0aGUgZmlyc3QgQmFsbCBpbnZvbHZlZCBpbiB0aGUgY29sbGlzaW9uLlxyXG4gICAqIEBwYXJhbSB7QmFsbH0gYmFsbDIgLSB0aGUgc2Vjb25kIEJhbGwgaW52b2x2ZWQgaW4gdGhlIGNvbGxpc2lvbi5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKi9cclxuICBoYW5kbGVCYWxsVG9CYWxsQ29sbGlzaW9uKCBiYWxsMSwgYmFsbDIsIGR0ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmFsbDEgaW5zdGFuY2VvZiBCYWxsLCBgaW52YWxpZCBiYWxsMTogJHtiYWxsMX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBiYWxsMiBpbnN0YW5jZW9mIEJhbGwsIGBpbnZhbGlkIGJhbGwyOiAke2JhbGwyfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucGxheUFyZWEuZ2V0RWxhc3RpY2l0eSgpID09PSAwLCAnbXVzdCBiZSBwZXJmZWN0bHkgaW5lbGFzdGljIGZvciBJbmVsYXN0aWMgc2NyZWVuJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5iYWxsU3lzdGVtLmJhbGxzLmxlbmd0aCA9PT0gMiwgJ0luZWxhc3RpY0NvbGxpc2lvbkVuZ2luZSBvbmx5IHN1cHBvcnRzIGNvbGxpc2lvbnMgb2YgMiBCYWxscycgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHNjZW5lcnlMb2cuU2ltKCBgSW5lbGFzdGljQ29sbGlzaW9uRW5naW5lLmhhbmRsZUJhbGxUb0JhbGxDb2xsaXNpb24gIyR7YmFsbDEuaW5kZXh9ICMke2JhbGwyLmluZGV4fWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgc3VwZXIuaGFuZGxlQmFsbFRvQmFsbENvbGxpc2lvbiggYmFsbDEsIGJhbGwyLCBkdCApO1xyXG5cclxuICAgIC8vIEhhbmRsZSBjb2xsaXNpb25zIHRoYXQgJ3N0aWNrJy5cclxuICAgIGlmICggdGhpcy5wbGF5QXJlYS5pbmVsYXN0aWNDb2xsaXNpb25UeXBlUHJvcGVydHkudmFsdWUgPT09IEluZWxhc3RpY0NvbGxpc2lvblR5cGUuU1RJQ0sgKSB7XHJcblxyXG4gICAgICAvLyBHZXQgdGhlIG1vbWVudCBvZiBpbmVydGlhIG9mIGJvdGggQmFsbHMsIHRyZWF0ZWQgYXMgcG9pbnQgbWFzc2VzIHJvdGF0aW5nIGFyb3VuZCB0aGVpciBjZW50ZXIgb2YgbWFzcy4gVGhlXHJcbiAgICAgIC8vIHJlYXNvbiB3aHkgd2UgdHJlYXQgdGhlIEJhbGxzIGFzIHBvaW50IG1hc3NlcyBpcyBiZWNhdXNlIG9mIHRoZSBmb3JtdWxhIEwgPSByXjIgKiBtICogb21lZ2EsIHdoZXJlIHJeMiAqIG0gaXNcclxuICAgICAgLy8gdGhlIG1vbWVudCBvZiBpbmVydGlhIG9mIGEgcG9pbnQtbWFzcy4gU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FuZ3VsYXJfbW9tZW50dW0jRGlzY3Vzc2lvbi5cclxuICAgICAgY29uc3QgSTEgPSBiYWxsMS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLm1pbnVzKCB0aGlzLmJhbGxTeXN0ZW0uY2VudGVyT2ZNYXNzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKS5tYWduaXR1ZGVTcXVhcmVkICogYmFsbDEubWFzc1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgICBjb25zdCBJMiA9IGJhbGwyLnBvc2l0aW9uUHJvcGVydHkudmFsdWUubWludXMoIHRoaXMuYmFsbFN5c3RlbS5jZW50ZXJPZk1hc3MucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApLm1hZ25pdHVkZVNxdWFyZWQgKiBiYWxsMi5tYXNzUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgICAvLyBVcGRhdGUgdGhlIGFuZ3VsYXIgdmVsb2NpdHkgcmVmZXJlbmNlLiBGb3JtdWxhIGNvbWVzIGZyb21cclxuICAgICAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQW5ndWxhcl9tb21lbnR1bSNDb2xsZWN0aW9uX29mX3BhcnRpY2xlcy5cclxuICAgICAgY29uc3QgYW5ndWxhclZlbG9jaXR5ID0gdGhpcy5iYWxsU3lzdGVtLmdldFRvdGFsQW5ndWxhck1vbWVudHVtKCkgLyAoIEkxICsgSTIgKTtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSBhbmQgcmVmZXJlbmNlIGEgUm90YXRpbmdCYWxsQ2x1c3RlciBpbnN0YW5jZS4gU2luY2UgdGhlcmUgYXJlIG9ubHkgMiBCYWxscyBpbiB0aGUgJ0luZWxhc3RpYycgc2NyZWVuLFxyXG4gICAgICAvLyB0aGUgUm90YXRpbmdCYWxsQ2x1c3RlciByZXByZXNlbnRzIHRoZSBlbnRpcmUgQmFsbFN5c3RlbS5cclxuICAgICAgdGhpcy5yb3RhdGluZ0JhbGxDbHVzdGVyID0gbmV3IFJvdGF0aW5nQmFsbENsdXN0ZXIoXHJcbiAgICAgICAgdGhpcy5iYWxsU3lzdGVtLmJhbGxzLFxyXG4gICAgICAgIGFuZ3VsYXJWZWxvY2l0eSxcclxuICAgICAgICB0aGlzLmJhbGxTeXN0ZW0uY2VudGVyT2ZNYXNzXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHNjZW5lcnlMb2cuU2ltKCAnUm90YXRpbmdCYWxsQ2x1c3RlciBjcmVhdGVkJyApO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByb2Nlc3NlcyBhIGJhbGwtdG8tYm9yZGVyIGNvbGxpc2lvbiBhbmQgdXBkYXRlcyB0aGUgdmVsb2NpdHkgYW5kIHRoZSBwb3NpdGlvbiBvZiB0aGUgQmFsbC4gT3ZlcnJpZGRlbiB0byByZXNwb25kXHJcbiAgICogdG8gcGVyZmVjdGx5IGluZWxhc3RpYyAnc3RpY2snIGNvbGxpc2lvbnMsIGluIHdoaWNoIHRoZSBCYWxsJ3MgdmVsb2NpdHkgaXMgc2V0IHRvIDAuXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCYWxsfSBiYWxsIC0gdGhlIEJhbGwgaW52b2x2ZWQgaW4gdGhlIGNvbGxpc2lvbi5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKi9cclxuICBoYW5kbGVCYWxsVG9Cb3JkZXJDb2xsaXNpb24oIGJhbGwsIGR0ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmFsbCBpbnN0YW5jZW9mIEJhbGwsIGBpbnZhbGlkIGJhbGw6ICR7YmFsbH1gICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLlNpbSggYEluZWxhc3RpY0NvbGxpc2lvbkVuZ2luZS5oYW5kbGVCYWxsVG9Cb3JkZXJDb2xsaXNpb24gIyR7YmFsbC5pbmRleH1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIHN1cGVyLmhhbmRsZUJhbGxUb0JvcmRlckNvbGxpc2lvbiggYmFsbCwgZHQgKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgY29sbGlzaW9ucyB0aGF0ICdzdGljaycuXHJcbiAgICBpZiAoIHRoaXMucGxheUFyZWEuaW5lbGFzdGljQ29sbGlzaW9uVHlwZVByb3BlcnR5LnZhbHVlID09PSBJbmVsYXN0aWNDb2xsaXNpb25UeXBlLlNUSUNLICkge1xyXG5cclxuICAgICAgLy8gU2V0IHRoZSB2ZWxvY2l0eSBvZiB0aGUgQmFsbCB0byAwLlxyXG4gICAgICBiYWxsLnZlbG9jaXR5UHJvcGVydHkudmFsdWUgPSBWZWN0b3IyLlpFUk87XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIFJvdGF0aW5nIEJhbGwgQ2x1c3RlciB0byBCb3JkZXIgQ29sbGlzaW9uc1xyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVjdHMgdGhlIGNsdXN0ZXItdG8tYm9yZGVyIGNvbGxpc2lvbiBvZiB0aGUgcm90YXRpbmdCYWxsQ2x1c3RlciBpZiBpdCBoYXNuJ3QgYWxyZWFkeSBiZWVuIGRldGVjdGVkLiBBbHRob3VnaFxyXG4gICAqIHR1bm5lbGluZyBkb2Vzbid0IG9jY3VyIHdpdGggY2x1c3Rlci10by1ib3JkZXIgY29sbGlzaW9ucywgY29sbGlzaW9ucyBhcmUgc3RpbGwgZGV0ZWN0ZWQgYmVmb3JlIHRoZXkgb2NjdXIgdG9cclxuICAgKiBtaXJyb3IgdGhlIGFwcHJvYWNoIGluIHRoZSBzdXBlci1jbGFzcy4gRm9yIG5ld2x5IGRldGVjdGVkIGNvbGxpc2lvbnMsIGluZm9ybWF0aW9uIGlzIGVuY2Fwc3VsYXRlZCBpbiBhIENvbGxpc2lvblxyXG4gICAqIGluc3RhbmNlLiBOT1RFOiBuby1vcCB3aGVuIHRoZSBQbGF5QXJlYSdzIGJvcmRlciBkb2Vzbid0IHJlZmxlY3QuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBlbGFwc2VkVGltZSAtIGVsYXBzZWRUaW1lLCBiYXNlZCBvbiB3aGVyZSB0aGUgQmFsbHMgYXJlIHBvc2l0aW9uZWQgd2hlbiB0aGlzIG1ldGhvZCBpcyBjYWxsZWQuXHJcbiAgICovXHJcbiAgZGV0ZWN0QmFsbENsdXN0ZXJUb0JvcmRlckNvbGxpc2lvbiggZWxhcHNlZFRpbWUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgZWxhcHNlZFRpbWUgPT09ICdudW1iZXInICYmIGVsYXBzZWRUaW1lID49IDAsIGBpbnZhbGlkIGVsYXBzZWRUaW1lOiAke2VsYXBzZWRUaW1lfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucm90YXRpbmdCYWxsQ2x1c3RlciwgJ2Nhbm5vdCBjYWxsIGRldGVjdEJhbGxDbHVzdGVyVG9Cb3JkZXJDb2xsaXNpb24nICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLlNpbSggJ2RldGVjdEJhbGxDbHVzdGVyVG9Cb3JkZXJDb2xsaXNpb24nICk7XHJcblxyXG4gICAgLy8gTm8tb3AgaWYgdGhlIFBsYXlBcmVhJ3MgYm9yZGVyIGRvZXNuJ3QgcmVmbGVjdFxyXG4gICAgaWYgKCAhdGhpcy5wbGF5QXJlYS5yZWZsZWN0aW5nQm9yZGVyUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBOby1vcCBpZiB0aGUgY2x1c3Rlci10by1ib3JkZXIgY29sbGlzaW9uIGhhcyBhbHJlYWR5IGJlZW4gZGV0ZWN0ZWRcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY29sbGlzaW9ucy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCB0aGlzLmNvbGxpc2lvbnNbIGkgXS5pbmNsdWRlcyggdGhpcy5yb3RhdGluZ0JhbGxDbHVzdGVyICkgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGFuZGxlIGRlZ2VuZXJhdGUgY2FzZSB3aGVyZSB0aGUgY2x1c3RlciBpcyBhbHJlYWR5IGNvbGxpZGluZyB3aXRoIHRoZSBib3JkZXIuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnJvdGF0aW5nQmFsbENsdXN0ZXIuYmFsbHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGJhbGwgPSB0aGlzLnJvdGF0aW5nQmFsbENsdXN0ZXIuYmFsbHNbIGkgXTtcclxuXHJcbiAgICAgIC8vIElmIGFueSBiYWxsIGlzIHRvdWNoaW5nIHRoZSBzaWRlXHJcbiAgICAgIGlmICggdGhpcy5wbGF5QXJlYS5pc0JhbGxUb3VjaGluZ1NpZGUoIGJhbGwgKSApIHtcclxuICAgICAgICBjb25zdCBjb2xsaXNpb24gPSBDb2xsaXNpb24uY3JlYXRlRnJvbVBvb2woIHRoaXMucm90YXRpbmdCYWxsQ2x1c3RlciwgdGhpcy5wbGF5QXJlYSwgZWxhcHNlZFRpbWUgKTtcclxuXHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLlNpbSggYGFkZGluZyBjb2xsaXNpb24gJHtjb2xsaXNpb259YCApO1xyXG5cclxuICAgICAgICB0aGlzLmNvbGxpc2lvbnMucHVzaCggY29sbGlzaW9uICk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGFuZGxlIGRlZ2VuZXJhdGUgY2FzZSB3aGVyZSB0aGUgY2x1c3RlciBpcyBvdXQtb2YtYm91bmRzLiBJbiB0aGUgZGVzaWduLCBpZiBhbiBvYmplY3QgaXMgcGFydGlhbGx5IG91dC1vZi1ib3VuZHNcclxuICAgIC8vIHdoZW4gdGhlIFJlZmxlY3RpbmcgQm9yZGVyIGlzIHR1cm5lZCBvbiwgaXQgd2lsbCBjb250aW51ZSB0byBlc2NhcGUuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnJvdGF0aW5nQmFsbENsdXN0ZXIuYmFsbHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGJhbGwgPSB0aGlzLnJvdGF0aW5nQmFsbENsdXN0ZXIuYmFsbHNbIGkgXTtcclxuXHJcbiAgICAgIGlmICggIXRoaXMucGxheUFyZWEuZnVsbHlDb250YWluc0JhbGwoIGJhbGwgKSApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgdGhlIGxvd2VyLWJvdW5kIG9mIHdoZW4gdGhlIGNsdXN0ZXIgd2lsbCBjb2xsaWRlIHdpdGggdGhlIGJvcmRlciwgd2hpY2ggaXMgd2hlbiBib3VuZGluZyBjaXJjbGUgb2YgdGhlXHJcbiAgICAvLyBjbHVzdGVyIGNvbGxpZGVzIHdpdGggdGhlIGJvcmRlci5cclxuICAgIGNvbnN0IG1pbkNvbGxpc2lvblRpbWUgPSB0aGlzLmdldEJvcmRlckNvbGxpc2lvblRpbWUoIHRoaXMuYmFsbFN5c3RlbS5jZW50ZXJPZk1hc3MucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgdGhpcy5iYWxsU3lzdGVtLmNlbnRlck9mTWFzcy52ZWxvY2l0eVByb3BlcnR5LnZhbHVlLFxyXG4gICAgICB0aGlzLnJvdGF0aW5nQmFsbENsdXN0ZXIuZ2V0Qm91bmRpbmdDaXJjbGVSYWRpdXMoKSxcclxuICAgICAgZWxhcHNlZFRpbWUgKTtcclxuXHJcbiAgICAvLyBHZXQgdGhlIHVwcGVyLWJvdW5kIG9mIHdoZW4gdGhlIGNsdXN0ZXIgd2lsbCBjb2xsaWRlIHdpdGggdGhlIGJvcmRlciwgd2hpY2ggaXMgd2hlbiB0aGUgY2VudGVyLW9mLW1hc3MgY29sbGlkZXNcclxuICAgIC8vIHdpdGggdGhlIGJvcmRlci5cclxuICAgIGNvbnN0IG1heENvbGxpc2lvblRpbWUgPSB0aGlzLmdldEJvcmRlckNvbGxpc2lvblRpbWUoIHRoaXMuYmFsbFN5c3RlbS5jZW50ZXJPZk1hc3MucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgdGhpcy5iYWxsU3lzdGVtLmNlbnRlck9mTWFzcy52ZWxvY2l0eVByb3BlcnR5LnZhbHVlLFxyXG4gICAgICAwLFxyXG4gICAgICBlbGFwc2VkVGltZSApO1xyXG5cclxuICAgIC8vIFVzZSB0aGUgYmlzZWN0aW9uIG1ldGhvZCB0byBhcHByb3hpbWF0ZSB3aGVuIHRoZSBjbHVzdGVyIGV4YWN0bHkgY29sbGlkZXMgd2l0aCB0aGUgYm9yZGVyLlxyXG4gICAgY29uc3QgY29sbGlzaW9uVGltZSA9ICggIU51bWJlci5pc0Zpbml0ZSggbWluQ29sbGlzaW9uVGltZSApIHx8ICFOdW1iZXIuaXNGaW5pdGUoIG1heENvbGxpc2lvblRpbWUgKSApID8gbnVsbCA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgQ29sbGlzaW9uTGFiVXRpbHMuYmlzZWN0aW9uKCB0aW1lID0+IHRoaXMud2lsbEJhbGxDbHVzdGVyQ29sbGlkZVdpdGhCb3JkZXJJbiggdGltZSAtIGVsYXBzZWRUaW1lICksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5Db2xsaXNpb25UaW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4Q29sbGlzaW9uVGltZSApO1xyXG5cclxuICAgIC8vIFJlZ2lzdGVyIHRoZSBjb2xsaXNpb24gYW5kIGVuY2Fwc3VsYXRlIGluZm9ybWF0aW9uIGluIGEgQ29sbGlzaW9uIGluc3RhbmNlLlxyXG4gICAgY29uc3QgY29sbGlzaW9uID0gQ29sbGlzaW9uLmNyZWF0ZUZyb21Qb29sKCB0aGlzLnJvdGF0aW5nQmFsbENsdXN0ZXIsIHRoaXMucGxheUFyZWEsIGNvbGxpc2lvblRpbWUgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5TaW0oIGBhZGRpbmcgY29sbGlzaW9uICR7Y29sbGlzaW9ufWAgKTtcclxuICAgIHRoaXMuY29sbGlzaW9ucy5wdXNoKCBjb2xsaXNpb24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluZGljYXRlcyBpZiB0aGUgcm90YXRpbmdCYWxsQ2x1c3RlciB3aWxsIGFwcHJveGltYXRlbHkgY29sbGlkZSB3aXRoIHRoZSBib3JkZXIgYXQgc29tZSBwYXNzZWQtaW4gdGltZS1kZWx0YSBPUiBpZlxyXG4gICAqIGl0IGlzIGFuIG92ZXIvdW5kZXIgZXN0aW1hdGUuIElmIGFueSBvZiB0aGUgQmFsbHMgaW4gY2x1c3RlciBhcmUgb3ZlcmxhcHBpbmcgKG1vcmUgdGhhbiBzb21lIHRocmVzaG9sZCksIHRoZW4gdGhlXHJcbiAgICogZHQgaXMgY29uc2lkZXJlZCBhbiBvdmVyZXN0aW1hdGUuIExpa2V3aXNlLCBpZiBub25lIG9mIHRoZSBiYWxscyBhcmUgb3ZlcmxhcHBpbmcsIHRoZSBkdCBpcyBhbiB1bmRlcmVzdGltYXRlLiBJZlxyXG4gICAqIGFueSBvZiB0aGUgQmFsbHMgYXJlIHRhbmdlbnRpYWxseSB0b3VjaGluZyB0aGUgc2lkZSBvZiB0aGUgUGxheUFyZWEsIGl0IGlzIGNvbnNpZGVyZWQgdG8gYmUgJ2Nsb3NlIGVub3VnaCcuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gUmV0dXJucyAtMSBpZiB0aGUgcGFzc2VkLWluIHRpbWUgaXMgYW4gdW5kZXJlc3RpbWF0ZSxcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAgaWYgdGhlIHBhc3NlZC1pbiB0aW1lIGlzIGNvbnNpZGVyZWQgJ2Nsb3NlIGVub3VnaCdcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDEgaWYgdGhlIHBhc3NlZC1pbiB0aW1lIGlzIGFuIG92ZXJlc3RpbWF0ZS5cclxuICAgKi9cclxuICB3aWxsQmFsbENsdXN0ZXJDb2xsaWRlV2l0aEJvcmRlckluKCBkdCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBkdCA9PT0gJ251bWJlcicsIGBpbnZhbGlkIGR0OiAke2R0fWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucm90YXRpbmdCYWxsQ2x1c3RlciwgJ2Nhbm5vdCBjYWxsIHdpbGxCYWxsQ2x1c3RlckNvbGxpZGVXaXRoQm9yZGVySW4nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnBsYXlBcmVhLnJlZmxlY3RpbmdCb3JkZXJQcm9wZXJ0eS52YWx1ZSwgJ2Nhbm5vdCBjYWxsIHdpbGxCYWxsQ2x1c3RlckNvbGxpZGVXaXRoQm9yZGVySW4nICk7XHJcblxyXG4gICAgLy8gR2V0IHRoZSBzdGF0ZXMgb2YgdGhlIEJhbGxzIGFmdGVyIHRoZSB0aW1lLWRlbHRhLlxyXG4gICAgY29uc3Qgcm90YXRpb25TdGF0ZXMgPSB0aGlzLnJvdGF0aW5nQmFsbENsdXN0ZXIuZ2V0U3RlcHBlZFJvdGF0aW9uU3RhdGVzKCBkdCApO1xyXG5cclxuICAgIC8vIEZsYWdzIHRoYXQgdHJhY2sgdGhlIG51bWJlciBvZiBCYWxscyBpbiB0aGUgY2x1c3RlciB0aGF0IGFyZSBvdmVybGFwcGluZyBhbmQgdGFuZ2VudGlhbGx5IHRvdWNoaW5nIHRoZSBib3JkZXIuXHJcbiAgICBsZXQgb3ZlcmxhcHBpbmcgPSAwO1xyXG4gICAgbGV0IHRvdWNoaW5nID0gMDtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnJvdGF0aW5nQmFsbENsdXN0ZXIuYmFsbHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGJhbGwgPSB0aGlzLnJvdGF0aW5nQmFsbENsdXN0ZXIuYmFsbHNbIGkgXTtcclxuXHJcbiAgICAgIGNvbnN0IHJhZGl1cyA9IGJhbGwucmFkaXVzUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgICAvLyBQb3NpdGlvbiBvZiB0aGUgQmFsbCBhZnRlciB0aGUgdGltZS1kZWx0YS5cclxuICAgICAgY29uc3QgcG9zaXRpb24gPSByb3RhdGlvblN0YXRlcy5nZXQoIGJhbGwgKS5wb3NpdGlvbjtcclxuICAgICAgY29uc3QgbGVmdCA9IHBvc2l0aW9uLnggLSByYWRpdXM7XHJcbiAgICAgIGNvbnN0IHJpZ2h0ID0gcG9zaXRpb24ueCArIHJhZGl1cztcclxuICAgICAgY29uc3QgdG9wID0gcG9zaXRpb24ueSArIHJhZGl1cztcclxuICAgICAgY29uc3QgYm90dG9tID0gcG9zaXRpb24ueSAtIHJhZGl1cztcclxuXHJcbiAgICAgIGlmICggbGVmdCA8IHRoaXMucGxheUFyZWEubGVmdCB8fFxyXG4gICAgICAgICAgIHJpZ2h0ID4gdGhpcy5wbGF5QXJlYS5yaWdodCB8fFxyXG4gICAgICAgICAgIGJvdHRvbSA8IHRoaXMucGxheUFyZWEuYm90dG9tIHx8XHJcbiAgICAgICAgICAgdG9wID4gdGhpcy5wbGF5QXJlYS50b3AgKSB7XHJcbiAgICAgICAgb3ZlcmxhcHBpbmcgKz0gMTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggVXRpbHMuZXF1YWxzRXBzaWxvbiggbGVmdCwgdGhpcy5wbGF5QXJlYS5sZWZ0LCBUT0xFUkFOQ0UgKSB8fFxyXG4gICAgICAgICAgICAgICAgVXRpbHMuZXF1YWxzRXBzaWxvbiggcmlnaHQsIHRoaXMucGxheUFyZWEucmlnaHQsIFRPTEVSQU5DRSApIHx8XHJcbiAgICAgICAgICAgICAgICBVdGlscy5lcXVhbHNFcHNpbG9uKCB0b3AsIHRoaXMucGxheUFyZWEudG9wLCBUT0xFUkFOQ0UgKSB8fFxyXG4gICAgICAgICAgICAgICAgVXRpbHMuZXF1YWxzRXBzaWxvbiggYm90dG9tLCB0aGlzLnBsYXlBcmVhLmJvdHRvbSwgVE9MRVJBTkNFICkgKSB7XHJcbiAgICAgICAgdG91Y2hpbmcgKz0gMTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvdmVybGFwcGluZyA/IDEgOiAoIHRvdWNoaW5nID8gMCA6IC0xICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIYW5kbGVzIGEgY2x1c3Rlci10by1ib3JkZXIgY29sbGlzaW9uIGJ5IHVwZGF0aW5nIHRoZSB2ZWxvY2l0eSBvZiB0aGUgQmFsbHMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIFdoZW4gYSByb3RhdGluZyBiYWxsIGNsdXN0ZXIgY29sbGlkZXMgdGhlIGJvcmRlciwgZXZlcnkgYmFsbCBpbiB0aGUgY2x1c3RlciBoYXMgMCB2ZWxvY2l0eS5cclxuICAgKi9cclxuICBoYW5kbGVCYWxsQ2x1c3RlclRvQm9yZGVyQ29sbGlzaW9uKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5yb3RhdGluZ0JhbGxDbHVzdGVyLCAnY2Fubm90IGNhbGwgaGFuZGxlQmFsbFRvQm9yZGVyQ29sbGlzaW9uJyApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5TaW0oICdJbmVsYXN0aWNDb2xsaXNpb25FbmdpbmUuaGFuZGxlQmFsbENsdXN0ZXJUb0JvcmRlckNvbGxpc2lvbicgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSB2ZWxvY2l0eSBvZiBldmVyeSBCYWxsIHRvIDAuXHJcbiAgICB0aGlzLnJvdGF0aW5nQmFsbENsdXN0ZXIuYmFsbHMuZm9yRWFjaCggYmFsbCA9PiB7XHJcbiAgICAgIGJhbGwudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSA9IFZlY3RvcjIuWkVSTztcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBSZW1vdmUgYWxsIGNvbGxpc2lvbnMgdGhhdCBpbnZvbHZlcyByb3RhdGluZ0JhbGxDbHVzdGVyLlxyXG4gICAgdGhpcy5pbnZhbGlkYXRlQ29sbGlzaW9ucyggdGhpcy5yb3RhdGluZ0JhbGxDbHVzdGVyICk7XHJcbiAgICB0aGlzLnJvdGF0aW5nQmFsbENsdXN0ZXIgPSBudWxsO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbGxpc2lvbkxhYi5yZWdpc3RlciggJ0luZWxhc3RpY0NvbGxpc2lvbkVuZ2luZScsIEluZWxhc3RpY0NvbGxpc2lvbkVuZ2luZSApO1xyXG5leHBvcnQgZGVmYXVsdCBJbmVsYXN0aWNDb2xsaXNpb25FbmdpbmU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MscUJBQXFCLE1BQU0sdUNB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