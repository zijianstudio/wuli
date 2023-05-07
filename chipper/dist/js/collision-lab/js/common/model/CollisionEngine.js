// Copyright 2019-2022, University of Colorado Boulder

/**
 * CollisionEngine handles all collision detection and responses of Ball collisions. It is the physics engine that is
 * used for all screens of the 'Collision Lab' simulation.
 *
 * ## Collision detection:
 *
 *   - CollisionEngine deals with 2 types of collisions: ball-ball and ball-border collisions. Both of these collisions
 *     are detected *before* the collision occurs to avoid tunneling scenarios where Balls would pass through each
 *     other with high velocities and/or time-steps. The algorithm for detecting ball-ball collisions is described fully
 *     in https://github.com/phetsims/collision-lab/blob/master/doc/algorithms/ball-to-ball-collision-detection.md
 *
 *   - On each time-step, every ball-ball and ball-border combination is encapsulated in a Collision data structure
 *     instance, along with if and when the respective bodies will collide. These Collision instances are saved to
 *     optimize the number of redundant collision-detection checks. On successive time-steps, Collision instances
 *     are only created for ball-ball and ball-border combinations that haven't already been created. Collision
 *     instances are removed when a collision is handled or some other state in the simulation changes.
 *
 * ## Collision response:
 *
 *   - Collision response determines what effect a collision has on a Ball's motion. The algorithms for Ball collisions
 *     were adapted but significantly improved from the flash implementation of Collision Lab. They follow the standard
 *     rigid-body collision model as described in
 *     http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf
 *
 *   - On each time-step, after Collisions have been created for every ball-ball and ball-border combination, we check
 *     if any of our 'saved' collisions that have associated collision times are in between the previous and current
 *     step, meaning a collision will occur in this time-step. To fully ensure that collisions are simulated
 *     correctly — even with extremely high time-steps — only the earliest collision is handled and progressed. All
 *     Collision instances that store the involved Ball(s) are removed. This detection-response loop is then repeated
 *     until there are no collisions detected within the time-step.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabUtils from '../CollisionLabUtils.js';
import Ball from './Ball.js';
import BallSystem from './BallSystem.js';
import Collision from './Collision.js';
import PlayArea from './PlayArea.js';
class CollisionEngine {
  /**
   * @param {PlayArea} playArea
   * @param {BallSystem} ballSystem
   */
  constructor(playArea, ballSystem) {
    assert && assert(playArea instanceof PlayArea, `invalid playArea: ${playArea}`);
    assert && assert(ballSystem instanceof BallSystem, `invalid ballSystem: ${ballSystem}`);

    // @protected {Array.<Collision>} - collection of Ball collisions that may or may not occur. Some Collisions instances
    //                              will not have an associated "time" which indicates that a Collision will not occur.
    //                              See the comment at the top for a high level overview of how this set is used.
    this.collisions = [];
    this.nextCollisions = []; // Minimizing GC by using a persistent array
    this.collisionsToDispose = [];

    // @private {Property.<number>} - the 'direction' of the progression of the current time-step of the sim, where:
    //                               1 means the sim is being progressed forwards in the current time-step, (dt > 0).
    //                              -1 means the sim is being progressed backwards in the current time-step, (dt < 0)
    this.timeStepDirectionProperty = new NumberProperty(1, {
      numberType: 'Integer'
    });

    // @protected - reference to the passed-in parameters.
    this.playArea = playArea;
    this.ballSystem = ballSystem;

    // @private {Vector2} - mutable Vector2 instances, reused in critical code to reduce memory allocations.
    this.deltaR = new Vector2(0, 0);
    this.deltaV = new Vector2(0, 0);

    // Observe when some 'state' in the simulation that invalidates our Collision instances changes. This occurs when a
    // Ball is user-controlled, when the number of Balls in the system changes, when the 'Constant' size checkbox is
    // toggled, or when the 'direction' of time progression changes. In all of these scenarios, existing Collisions may
    // be incorrect and collisions should be re-detected. Multilink persists for the lifetime of the simulation.
    Multilink.lazyMultilink([ballSystem.ballSystemUserControlledProperty, ballSystem.numberOfBallsProperty, ballSystem.ballsConstantSizeProperty, this.timeStepDirectionProperty], this.reset.bind(this));

    // Observe when the PlayArea's reflectingBorderProperty changes, meaning existing Collisions that involve the
    // PlayArea may be incorrect and collisions should be re-detected. Link persists for the lifetime of the simulation.
    playArea.reflectingBorderProperty.lazyLink(() => this.invalidateCollisions(playArea));
  }

  /**
   * Resets the CollisionEngine. This removes all 'saved' Collision instances.
   * @public
   *
   * Called when the reset/restart button is pressed or when some 'state' of the simulation changes.
   */
  reset() {
    while (this.collisions.length) {
      this.collisionsToDispose.push(this.collisions.pop());
    }
  }

  /**
   * Steps the CollisionEngine, which initializes both collision detection and responses for a given time-step. See
   * the comment at the top of this file for a high-level overview of the collision detection-response loop.
   * @public
   *
   * @param {number} dt - time-delta of this step, in seconds.
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   * @param {number} [maxIterations] - max number of iterations in the detection-response loop. Once this number is
   *                                   reached, collision-response is considered to be finished for the step.
   */
  step(dt, elapsedTime, maxIterations = 2000) {
    assert && assert(typeof dt === 'number', `invalid dt: ${dt}`);
    assert && assert(typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`step dt:${dt}, elapsedTime:${elapsedTime}, maxIterations:${maxIterations}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.push();
    let iterations = 0;
    while (iterations++ < maxIterations) {
      sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`iteration ${iterations} dt:${dt}, elapsedTime:${elapsedTime}`);
      sceneryLog && sceneryLog.Sim && sceneryLog.push();
      sceneryLog && sceneryLog.Sim && this.ballSystem.balls.forEach(ball => {
        sceneryLog.Sim(`#${ball.index} velocity:${ball.velocityProperty.value.toString()}`);
      });

      // First detect all potential collisions that have not already been detected.
      this.timeStepDirectionProperty.value = Math.sign(dt);
      this.detectAllCollisions(elapsedTime);
      if (sceneryLog && sceneryLog.Sim) {
        this.collisions.forEach(collision => {
          sceneryLog.Sim(`${collision.inRange(elapsedTime, elapsedTime + dt) ? '[in-step] ' : ''}${collision.time} ${collision}`);
        });
      }

      // Get all Collisions that have a collision 'time' in this time-step. Rolled back to simple logic for performance
      // and memory characteristics
      // If there are collisions within the given time-step, only handle and progress the 'earliest' collision.
      // Find and reference the next Collision that will occur of the collisions that will occur in this step.
      this.nextCollisions.length = 0;
      let bestPotentialCollisionTime = elapsedTime + dt * (1 + 1e-7);
      for (let i = this.collisions.length - 1; i >= 0; i--) {
        const collision = this.collisions[i];
        if (collision.inRange(elapsedTime, bestPotentialCollisionTime)) {
          if (collision.time !== bestPotentialCollisionTime) {
            bestPotentialCollisionTime = collision.time;
            this.nextCollisions.length = 0;
          }
          this.nextCollisions.push(collision);
        }
      }
      if (!this.nextCollisions.length) {
        sceneryLog && sceneryLog.Sim && sceneryLog.Sim('no collisions in step');

        // If there are no collisions within this step, the Balls are in uniform motion for the entirety of this step.
        // The recursive process is stopped and the Balls are stepped uniformly to the end of the time-step.
        this.progressBalls(dt, elapsedTime);
        sceneryLog && sceneryLog.Sim && sceneryLog.pop();
        break;
      } else {
        // Reference when the collision will occur (in terms of both elapsedTime and a time-delta, respectively).
        const collisionTime = Math.max(0, bestPotentialCollisionTime);
        const timeUntilCollision = collisionTime - elapsedTime;
        sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`collision in step in ${timeUntilCollision}`);

        // Progress forwards to the exact point of contact of the collision.
        this.progressBalls(timeUntilCollision, elapsedTime);

        // Handle the response for the Collision depending on the type of collision.
        for (let i = this.nextCollisions.length - 1; i >= 0; i--) {
          this.handleCollision(this.nextCollisions[i], dt);
        }

        // Continue on to the next iteration
        dt -= timeUntilCollision;
        elapsedTime = collisionTime;
      }
      while (this.collisionsToDispose.length) {
        this.collisionsToDispose.pop().dispose();
      }
      sceneryLog && sceneryLog.Sim && sceneryLog.pop();
    }
    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }

  /**
   * Whether there already exists a collision between the two bodies.
   * @public
   *
   * @param {Object} body1
   * @param {Object} body2
   * @returns {boolean}
   */
  hasCollisionBetween(body1, body2) {
    for (let i = this.collisions.length - 1; i >= 0; i--) {
      if (this.collisions[i].includesBodies(body1, body2)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Progresses the Balls forwards by the given time-delta, assuming there are no collisions.
   * @protected - can be overridden in subclasses.
   *
   * @param {number} dt - time-delta, in seconds.
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  progressBalls(dt, elapsedTime) {
    assert && assert(typeof dt === 'number', `invalid dt: ${dt}`);
    assert && assert(typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim('CollisionEngine.progressBalls');
    sceneryLog && sceneryLog.Sim && sceneryLog.push();

    // CollisionEngine only deals with uniformly moving Balls, but sub-types might not (for the 'Inelastic' screen).
    this.ballSystem.stepUniformMotion(dt, elapsedTime + dt);
    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }

  /**
   * Detects all ball-ball and ball-border collisions that have not already been detected.
   * @protected - can be overridden in subclasses.
   *
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  detectAllCollisions(elapsedTime) {
    assert && assert(typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}`);

    // CollisionEngine only deals with detecting 2 types of collisions, but sub-types might not ('Inelastic' screen).
    this.detectBallToBallCollisions(elapsedTime);
    this.detectBallToBorderCollisions(elapsedTime);
  }

  /**
   * Handles all Collisions by calling a response algorithm, dispatched by the type of bodies involved in the Collision.
   * @protected - can be overridden in subclasses.
   *
   * @param {Collision} collision - the Collision instance.
   * @param {number} dt
   */
  handleCollision(collision, dt) {
    assert && assert(collision instanceof Collision, `invalid collision: ${collision}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim('CollisionEngine.handleCollision');
    sceneryLog && sceneryLog.Sim && sceneryLog.push();

    // CollisionEngine only deals with detecting 2 types of collisions, but sub-types might not ('Inelastic' screen).
    collision.includes(this.playArea) ? this.handleBallToBorderCollision(collision.body2 === this.playArea ? collision.body1 : collision.body2, dt) : this.handleBallToBallCollision(collision.body1, collision.body2, dt);
    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }

  /**
   * Remove all collisions that involves the passed-in body.
   * @protected
   *
   * @param {Object} body
   */
  invalidateCollisions(body) {
    assert && assert(body instanceof Object, `invalid body: ${body}`);
    for (let i = this.collisions.length - 1; i >= 0; i--) {
      const collision = this.collisions[i];
      if (collision.includes(body)) {
        this.collisions.splice(i, 1);
        this.collisionsToDispose.push(collision);
      }
    }
  }

  /*----------------------------------------------------------------------------*
   * Ball To Ball Collisions
   *----------------------------------------------------------------------------*/

  /**
   * Detects all ball-to-ball collisions of the BallSystem that haven't already occurred. Ball-to-ball collisions are
   * detected before the collision occurs to avoid tunneling scenarios. For newly detected collisions, necessary
   * information is encapsulated in a Collision instance.
   * @private
   *
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  detectBallToBallCollisions(elapsedTime) {
    assert && assert(typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim('detectBallToBallCollisions');
    sceneryLog && sceneryLog.Sim && sceneryLog.push();

    // Loop through each unique possible pair of Balls.
    for (let i = 1; i < this.ballSystem.balls.length; i++) {
      const ball1 = this.ballSystem.balls[i];
      for (let j = 0; j < i; j++) {
        const ball2 = this.ballSystem.balls[j];
        assert && assert(ball1 !== ball2, 'ball cannot collide with itself');

        // Only detect new ball-ball collisions if it hasn't already been detected.
        if (this.hasCollisionBetween(ball1, ball2)) {
          continue;
        }

        // Reference the multiplier of the velocity of the Ball. When the sim is being reversed, Balls are essentially
        // moving in the opposite direction of its velocity vector. For calculating if Balls will collide, reverse the
        // velocity of the ball for convenience and reverse the collisionTime back at the end.
        const velocityMultiplier = this.timeStepDirectionProperty.value;

        /*----------------------------------------------------------------------------*
         * This calculation for detecting if the balls will collide comes from the
         * known fact that when the Balls are exactly colliding, their distance is
         * exactly equal to the sum of their radii.
         *
         * Documenting the derivation was beyond the scope of code comments. Please reference
         * https://github.com/phetsims/collision-lab/blob/master/doc/algorithms/ball-to-ball-collision-detection.md
         *----------------------------------------------------------------------------*/

        this.deltaR.set(ball2.positionProperty.value).subtract(ball1.positionProperty.value);
        this.deltaV.set(ball2.velocityProperty.value).subtract(ball1.velocityProperty.value).multiply(velocityMultiplier);
        const sumOfRadiiSquared = (ball1.radiusProperty.value + ball2.radiusProperty.value) ** 2;
        const relativeDotProduct = this.deltaV.dot(this.deltaR);
        const isEffectivelyParallel = Math.abs(relativeDotProduct) < 1e-11;

        // Solve for the possible roots of the quadratic outlined in the document above.
        const possibleRoots = Utils.solveQuadraticRootsReal(this.deltaV.magnitudeSquared, relativeDotProduct * 2, CollisionLabUtils.clampDown(this.deltaR.magnitudeSquared - sumOfRadiiSquared));

        // The minimum root of the quadratic is when the Balls will first collide.
        const root = possibleRoots ? Math.min(...possibleRoots) : null;

        // If the quadratic root is finite and the collisionTime is positive, the collision is detected and should be
        // registered.
        const collisionTime = Number.isFinite(root) && root >= 0 && !isEffectivelyParallel ? elapsedTime + root * velocityMultiplier : null;
        const collision = Collision.createFromPool(ball1, ball2, collisionTime);
        sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`adding collision ${collision} root:${root} ${this.deltaV.dot(this.deltaR)}`);

        // Register the collision and encapsulate information in a Collision instance.
        this.collisions.push(collision);
      }
    }
    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }

  /**
   * Responds to and handles a single ball-to-ball collision by updating the velocity of both Balls depending on their
   * orientation and elasticity. The collision algorithm follows the standard rigid-body collision model as described in
   * http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
   *
   * Our version deals with normalized dot product projections to switch coordinate frames. Please reference
   * https://en.wikipedia.org/wiki/Dot_product.
   *
   * @protected - can be overridden in subclasses.
   *
   * @param {Ball} ball1 - the first Ball involved in the collision.
   * @param {Ball} ball2 - the second Ball involved in the collision.
   * @param {number} dt
   */
  handleBallToBallCollision(ball1, ball2, dt) {
    assert && assert(ball1 instanceof Ball, `invalid ball1: ${ball1}`);
    assert && assert(ball2 instanceof Ball, `invalid ball1: ${ball1}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`CollisionEngine.handleBallToBallCollision #${ball1.index} #${ball2.index}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.push();

    // Convenience references to known ball values.
    const m1 = ball1.massProperty.value;
    const m2 = ball2.massProperty.value;
    let elasticity = this.playArea.getElasticity();
    assert && assert(dt >= 0 || elasticity > 0, 'We cannot step backwards with zero elasticity');
    if (dt < 0) {
      elasticity = 1 / elasticity;
    }
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`ball1 v: ${ball1.velocityProperty.value}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`ball2 v: ${ball2.velocityProperty.value}`);

    // Set the Normal and Tangential vector, called the 'line of impact' and 'plane of contact' respectively.
    const normal = ball2.positionProperty.value.minus(ball1.positionProperty.value).normalize();
    const tangent = new Vector2(-normal.y, normal.x);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`normal ${normal}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`tangent ${tangent}`);

    // Reference the 'normal' and 'tangential' components of the Ball velocities. This is a switch in coordinate frames.
    const v1n = ball1.velocityProperty.value.dot(normal);
    const v2n = ball2.velocityProperty.value.dot(normal);
    const v1t = ball1.velocityProperty.value.dot(tangent);
    const v2t = ball2.velocityProperty.value.dot(tangent);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`m1 ${m1}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`m2 ${m2}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`v1n ${v1n}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`v1t ${v1t}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`v2n ${v2n}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`v2t ${v2t}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`elasticity ${elasticity}`);

    // Compute the 'normal' components of velocities after collision (P for prime = after).
    let v1nP = ((m1 - m2 * elasticity) * v1n + m2 * (1 + elasticity) * v2n) / (m1 + m2);
    let v2nP = ((m2 - m1 * elasticity) * v2n + m1 * (1 + elasticity) * v1n) / (m1 + m2);

    // Remove negligible normal velocities to prevent oscillations,
    // see https://github.com/phetsims/collision-lab/issues/171
    if (Math.abs(v1nP) < 1e-8) {
      v1nP = 0;
    }
    if (Math.abs(v2nP) < 1e-8) {
      v2nP = 0;
    }
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`v1nP ${v1nP}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`v2nP ${v2nP}`);

    // Change coordinate frames back into the standard x-y coordinate frame.
    const v1xP = tangent.dotXY(v1t, v1nP);
    const v2xP = tangent.dotXY(v2t, v2nP);
    const v1yP = normal.dotXY(v1t, v1nP);
    const v2yP = normal.dotXY(v2t, v2nP);
    ball1.velocityProperty.value = normal.setXY(v1xP, v1yP);
    ball2.velocityProperty.value = tangent.setXY(v2xP, v2yP);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`ball1 v: ${ball1.velocityProperty.value}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`ball2 v: ${ball2.velocityProperty.value}`);

    // Remove all collisions that involves either of the Balls.
    this.invalidateCollisions(ball1);
    this.invalidateCollisions(ball2);
    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }

  /*----------------------------------------------------------------------------*
   * Ball To Border Collisions
   *----------------------------------------------------------------------------*/

  /**
   * Detects all ball-to-border collisions of the BallSystem that haven't already occurred. Although tunneling doesn't
   * occur with ball-to-border collisions, collisions are still detected before they occur to mirror the approach for
   * ball-to-ball collisions. For newly detected collisions, information is encapsulated in a Collision instance.
   * NOTE: no-op when the PlayArea's border doesn't reflect.
   * @private
   *
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  detectBallToBorderCollisions(elapsedTime) {
    assert && assert(typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim('detectBallToBorderCollisions');
    sceneryLog && sceneryLog.Sim && sceneryLog.push();
    if (this.playArea.reflectingBorderProperty.value) {
      for (let i = this.ballSystem.balls.length - 1; i >= 0; i--) {
        const ball = this.ballSystem.balls[i];

        // Only detect new ball-border collisions if it hasn't already been detected.
        if (!this.hasCollisionBetween(ball, this.playArea)) {
          // Calculate when the Ball will collide with the border.
          const collisionTime = this.getBorderCollisionTime(ball.positionProperty.value, ball.velocityProperty.value, ball.radiusProperty.value, elapsedTime);
          const collision = Collision.createFromPool(ball, this.playArea, collisionTime);
          sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`adding collision ${collision}`);

          // Register the collision and encapsulate information in a Collision instance.
          this.collisions.push(collision);
        }
      }
    }
    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }

  /**
   * Calculates when some Ball will collide with the PlayArea's border. Instead of passing in a Ball instance, key
   * attributes of the Ball are passed-in. This API is required for sub-classes (see InelasticCollisionEngine).
   * @protected
   *
   * @param {Vector2} position - the position of the Ball.
   * @param {Vector2} velocity - the velocity of the Ball.
   * @param {number} radius - the radius of the Ball.
   * @param {number} elapsedTime - elapsedTime, based on where the Ball is positioned when this method is called.
   */
  getBorderCollisionTime(position, velocity, radius, elapsedTime) {
    assert && assert(position instanceof Vector2, `invalid position: ${position}`);
    assert && assert(velocity instanceof Vector2, `invalid velocity: ${velocity}`);
    assert && assert(typeof radius === 'number', `invalid radius: ${radius}`);
    assert && assert(typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}`);

    // Reference the multiplier of the velocity of the Ball. When the sim is being reversed (dt < 0), Balls are
    // essentially moving in the opposite direction of its velocity vector. For calculating if Balls will collide,
    // reverse the velocity of the ball for convenience and reverse the collisionTime back at the end.
    const velocityMultipier = this.timeStepDirectionProperty.value;

    // Reference quantities of the Ball.
    const left = position.x - radius;
    const right = position.x + radius;
    const top = position.y + radius;
    const bottom = position.y - radius;
    const xVelocity = velocity.x * velocityMultipier;
    const yVelocity = velocity.y * velocityMultipier;

    // Calculate the time the Ball would collide with each respective border, ignoring all other walls for now.
    const leftCollisionTime = CollisionLabUtils.clampDown(this.playArea.left - left) / xVelocity;
    const rightCollisionTime = CollisionLabUtils.clampDown(this.playArea.right - right) / xVelocity;
    const bottomCollisionTime = CollisionLabUtils.clampDown(this.playArea.bottom - bottom) / yVelocity;
    const topCollisionTime = CollisionLabUtils.clampDown(this.playArea.top - top) / yVelocity;

    // Calculate the time the Ball would collide with a horizontal/vertical border.
    const horizontalCollisionTime = Math.max(leftCollisionTime, rightCollisionTime);
    const verticalCollisionTime = Math.max(bottomCollisionTime, topCollisionTime);
    const possibleCollisionTimes = [horizontalCollisionTime, verticalCollisionTime].filter(Number.isFinite);

    // Solve for the timeUntilCollision, which is the first border (minimum in time) the Ball would collide with.
    const timeUntilCollision = Math.min(...possibleCollisionTimes) * velocityMultipier;
    return possibleCollisionTimes.length ? elapsedTime + timeUntilCollision : null;
  }

  /**
   * Responds to and handles a single ball-to-border collision by updating the velocity of the Balls depending on its
   * orientation relative to the border. The collision algorithm follows the standard rigid-body collision model
   * described in
   * http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
   *
   * @protected - can be overridden in subclasses.
   *
   * @param {Ball} ball - the Ball involved in the collision.
   * @param {number} dt
   */
  handleBallToBorderCollision(ball, dt) {
    assert && assert(ball instanceof Ball, `invalid ball: ${ball}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`CollisionEngine.handleBallToBorderCollision #${ball.index}`);
    sceneryLog && sceneryLog.Sim && sceneryLog.push();

    // Reference the multiplier of the velocity of the Ball. When the sim is being reversed (dt < 0), Balls are
    // essentially moving in the opposite direction of its velocity vector. This is used to determine the direction
    // that the Ball is moving towards; even if a Ball is touching a side(s) of the border, it's velocity doesn't change
    // unless it is moving towards that respective side.
    const velocityMultiplier = this.timeStepDirectionProperty.value;
    let elasticity = this.playArea.getElasticity();
    assert && assert(dt >= 0 || elasticity > 0, 'We cannot step backwards with zero elasticity');
    if (dt < 0) {
      elasticity = 1 / elasticity;
    }

    // Update the velocity after the collision.
    if (this.playArea.isBallTouchingLeft(ball) && ball.velocityProperty.value.x * velocityMultiplier < 0 || this.playArea.isBallTouchingRight(ball) && ball.velocityProperty.value.x * velocityMultiplier > 0) {
      sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`#${ball.index} border X bounce`);

      // Left and Right ball-to-border collisions incur a flip in horizontal velocity, scaled by the elasticity.
      ball.setXVelocity(-ball.velocityProperty.value.x * elasticity);
    }
    if (this.playArea.isBallTouchingBottom(ball) && ball.velocityProperty.value.y * velocityMultiplier < 0 || this.playArea.isBallTouchingTop(ball) && ball.velocityProperty.value.y * velocityMultiplier > 0) {
      sceneryLog && sceneryLog.Sim && sceneryLog.Sim(`#${ball.index} border Y bounce`);

      // Top and Bottom ball-to-border collisions incur a flip in vertical velocity, scaled by the elasticity.
      ball.setYVelocity(-ball.velocityProperty.value.y * elasticity);
    }

    // Remove all collisions that involves the involved Ball.
    this.invalidateCollisions(ball);
    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }
}
collisionLab.register('CollisionEngine', CollisionEngine);
export default CollisionEngine;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlV0aWxzIiwiVmVjdG9yMiIsImNvbGxpc2lvbkxhYiIsIkNvbGxpc2lvbkxhYlV0aWxzIiwiQmFsbCIsIkJhbGxTeXN0ZW0iLCJDb2xsaXNpb24iLCJQbGF5QXJlYSIsIkNvbGxpc2lvbkVuZ2luZSIsImNvbnN0cnVjdG9yIiwicGxheUFyZWEiLCJiYWxsU3lzdGVtIiwiYXNzZXJ0IiwiY29sbGlzaW9ucyIsIm5leHRDb2xsaXNpb25zIiwiY29sbGlzaW9uc1RvRGlzcG9zZSIsInRpbWVTdGVwRGlyZWN0aW9uUHJvcGVydHkiLCJudW1iZXJUeXBlIiwiZGVsdGFSIiwiZGVsdGFWIiwibGF6eU11bHRpbGluayIsImJhbGxTeXN0ZW1Vc2VyQ29udHJvbGxlZFByb3BlcnR5IiwibnVtYmVyT2ZCYWxsc1Byb3BlcnR5IiwiYmFsbHNDb25zdGFudFNpemVQcm9wZXJ0eSIsInJlc2V0IiwiYmluZCIsInJlZmxlY3RpbmdCb3JkZXJQcm9wZXJ0eSIsImxhenlMaW5rIiwiaW52YWxpZGF0ZUNvbGxpc2lvbnMiLCJsZW5ndGgiLCJwdXNoIiwicG9wIiwic3RlcCIsImR0IiwiZWxhcHNlZFRpbWUiLCJtYXhJdGVyYXRpb25zIiwic2NlbmVyeUxvZyIsIlNpbSIsIml0ZXJhdGlvbnMiLCJiYWxscyIsImZvckVhY2giLCJiYWxsIiwiaW5kZXgiLCJ2ZWxvY2l0eVByb3BlcnR5IiwidmFsdWUiLCJ0b1N0cmluZyIsIk1hdGgiLCJzaWduIiwiZGV0ZWN0QWxsQ29sbGlzaW9ucyIsImNvbGxpc2lvbiIsImluUmFuZ2UiLCJ0aW1lIiwiYmVzdFBvdGVudGlhbENvbGxpc2lvblRpbWUiLCJpIiwicHJvZ3Jlc3NCYWxscyIsImNvbGxpc2lvblRpbWUiLCJtYXgiLCJ0aW1lVW50aWxDb2xsaXNpb24iLCJoYW5kbGVDb2xsaXNpb24iLCJkaXNwb3NlIiwiaGFzQ29sbGlzaW9uQmV0d2VlbiIsImJvZHkxIiwiYm9keTIiLCJpbmNsdWRlc0JvZGllcyIsInN0ZXBVbmlmb3JtTW90aW9uIiwiZGV0ZWN0QmFsbFRvQmFsbENvbGxpc2lvbnMiLCJkZXRlY3RCYWxsVG9Cb3JkZXJDb2xsaXNpb25zIiwiaW5jbHVkZXMiLCJoYW5kbGVCYWxsVG9Cb3JkZXJDb2xsaXNpb24iLCJoYW5kbGVCYWxsVG9CYWxsQ29sbGlzaW9uIiwiYm9keSIsIk9iamVjdCIsInNwbGljZSIsImJhbGwxIiwiaiIsImJhbGwyIiwidmVsb2NpdHlNdWx0aXBsaWVyIiwic2V0IiwicG9zaXRpb25Qcm9wZXJ0eSIsInN1YnRyYWN0IiwibXVsdGlwbHkiLCJzdW1PZlJhZGlpU3F1YXJlZCIsInJhZGl1c1Byb3BlcnR5IiwicmVsYXRpdmVEb3RQcm9kdWN0IiwiZG90IiwiaXNFZmZlY3RpdmVseVBhcmFsbGVsIiwiYWJzIiwicG9zc2libGVSb290cyIsInNvbHZlUXVhZHJhdGljUm9vdHNSZWFsIiwibWFnbml0dWRlU3F1YXJlZCIsImNsYW1wRG93biIsInJvb3QiLCJtaW4iLCJOdW1iZXIiLCJpc0Zpbml0ZSIsImNyZWF0ZUZyb21Qb29sIiwibTEiLCJtYXNzUHJvcGVydHkiLCJtMiIsImVsYXN0aWNpdHkiLCJnZXRFbGFzdGljaXR5Iiwibm9ybWFsIiwibWludXMiLCJub3JtYWxpemUiLCJ0YW5nZW50IiwieSIsIngiLCJ2MW4iLCJ2Mm4iLCJ2MXQiLCJ2MnQiLCJ2MW5QIiwidjJuUCIsInYxeFAiLCJkb3RYWSIsInYyeFAiLCJ2MXlQIiwidjJ5UCIsInNldFhZIiwiZ2V0Qm9yZGVyQ29sbGlzaW9uVGltZSIsInBvc2l0aW9uIiwidmVsb2NpdHkiLCJyYWRpdXMiLCJ2ZWxvY2l0eU11bHRpcGllciIsImxlZnQiLCJyaWdodCIsInRvcCIsImJvdHRvbSIsInhWZWxvY2l0eSIsInlWZWxvY2l0eSIsImxlZnRDb2xsaXNpb25UaW1lIiwicmlnaHRDb2xsaXNpb25UaW1lIiwiYm90dG9tQ29sbGlzaW9uVGltZSIsInRvcENvbGxpc2lvblRpbWUiLCJob3Jpem9udGFsQ29sbGlzaW9uVGltZSIsInZlcnRpY2FsQ29sbGlzaW9uVGltZSIsInBvc3NpYmxlQ29sbGlzaW9uVGltZXMiLCJmaWx0ZXIiLCJpc0JhbGxUb3VjaGluZ0xlZnQiLCJpc0JhbGxUb3VjaGluZ1JpZ2h0Iiwic2V0WFZlbG9jaXR5IiwiaXNCYWxsVG91Y2hpbmdCb3R0b20iLCJpc0JhbGxUb3VjaGluZ1RvcCIsInNldFlWZWxvY2l0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ29sbGlzaW9uRW5naW5lLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbGxpc2lvbkVuZ2luZSBoYW5kbGVzIGFsbCBjb2xsaXNpb24gZGV0ZWN0aW9uIGFuZCByZXNwb25zZXMgb2YgQmFsbCBjb2xsaXNpb25zLiBJdCBpcyB0aGUgcGh5c2ljcyBlbmdpbmUgdGhhdCBpc1xyXG4gKiB1c2VkIGZvciBhbGwgc2NyZWVucyBvZiB0aGUgJ0NvbGxpc2lvbiBMYWInIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqICMjIENvbGxpc2lvbiBkZXRlY3Rpb246XHJcbiAqXHJcbiAqICAgLSBDb2xsaXNpb25FbmdpbmUgZGVhbHMgd2l0aCAyIHR5cGVzIG9mIGNvbGxpc2lvbnM6IGJhbGwtYmFsbCBhbmQgYmFsbC1ib3JkZXIgY29sbGlzaW9ucy4gQm90aCBvZiB0aGVzZSBjb2xsaXNpb25zXHJcbiAqICAgICBhcmUgZGV0ZWN0ZWQgKmJlZm9yZSogdGhlIGNvbGxpc2lvbiBvY2N1cnMgdG8gYXZvaWQgdHVubmVsaW5nIHNjZW5hcmlvcyB3aGVyZSBCYWxscyB3b3VsZCBwYXNzIHRocm91Z2ggZWFjaFxyXG4gKiAgICAgb3RoZXIgd2l0aCBoaWdoIHZlbG9jaXRpZXMgYW5kL29yIHRpbWUtc3RlcHMuIFRoZSBhbGdvcml0aG0gZm9yIGRldGVjdGluZyBiYWxsLWJhbGwgY29sbGlzaW9ucyBpcyBkZXNjcmliZWQgZnVsbHlcclxuICogICAgIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jb2xsaXNpb24tbGFiL2Jsb2IvbWFzdGVyL2RvYy9hbGdvcml0aG1zL2JhbGwtdG8tYmFsbC1jb2xsaXNpb24tZGV0ZWN0aW9uLm1kXHJcbiAqXHJcbiAqICAgLSBPbiBlYWNoIHRpbWUtc3RlcCwgZXZlcnkgYmFsbC1iYWxsIGFuZCBiYWxsLWJvcmRlciBjb21iaW5hdGlvbiBpcyBlbmNhcHN1bGF0ZWQgaW4gYSBDb2xsaXNpb24gZGF0YSBzdHJ1Y3R1cmVcclxuICogICAgIGluc3RhbmNlLCBhbG9uZyB3aXRoIGlmIGFuZCB3aGVuIHRoZSByZXNwZWN0aXZlIGJvZGllcyB3aWxsIGNvbGxpZGUuIFRoZXNlIENvbGxpc2lvbiBpbnN0YW5jZXMgYXJlIHNhdmVkIHRvXHJcbiAqICAgICBvcHRpbWl6ZSB0aGUgbnVtYmVyIG9mIHJlZHVuZGFudCBjb2xsaXNpb24tZGV0ZWN0aW9uIGNoZWNrcy4gT24gc3VjY2Vzc2l2ZSB0aW1lLXN0ZXBzLCBDb2xsaXNpb24gaW5zdGFuY2VzXHJcbiAqICAgICBhcmUgb25seSBjcmVhdGVkIGZvciBiYWxsLWJhbGwgYW5kIGJhbGwtYm9yZGVyIGNvbWJpbmF0aW9ucyB0aGF0IGhhdmVuJ3QgYWxyZWFkeSBiZWVuIGNyZWF0ZWQuIENvbGxpc2lvblxyXG4gKiAgICAgaW5zdGFuY2VzIGFyZSByZW1vdmVkIHdoZW4gYSBjb2xsaXNpb24gaXMgaGFuZGxlZCBvciBzb21lIG90aGVyIHN0YXRlIGluIHRoZSBzaW11bGF0aW9uIGNoYW5nZXMuXHJcbiAqXHJcbiAqICMjIENvbGxpc2lvbiByZXNwb25zZTpcclxuICpcclxuICogICAtIENvbGxpc2lvbiByZXNwb25zZSBkZXRlcm1pbmVzIHdoYXQgZWZmZWN0IGEgY29sbGlzaW9uIGhhcyBvbiBhIEJhbGwncyBtb3Rpb24uIFRoZSBhbGdvcml0aG1zIGZvciBCYWxsIGNvbGxpc2lvbnNcclxuICogICAgIHdlcmUgYWRhcHRlZCBidXQgc2lnbmlmaWNhbnRseSBpbXByb3ZlZCBmcm9tIHRoZSBmbGFzaCBpbXBsZW1lbnRhdGlvbiBvZiBDb2xsaXNpb24gTGFiLiBUaGV5IGZvbGxvdyB0aGUgc3RhbmRhcmRcclxuICogICAgIHJpZ2lkLWJvZHkgY29sbGlzaW9uIG1vZGVsIGFzIGRlc2NyaWJlZCBpblxyXG4gKiAgICAgaHR0cDovL3dlYi5tc3QuZWR1L35yZWZsb3JpL2JlMTUwL0R5biUyMExlY3R1cmUlMjBWaWRlb3MvSW1wYWN0JTIwUGFydGljbGVzJTIwMS9JbXBhY3QlMjBQYXJ0aWNsZXMlMjAxLnBkZlxyXG4gKlxyXG4gKiAgIC0gT24gZWFjaCB0aW1lLXN0ZXAsIGFmdGVyIENvbGxpc2lvbnMgaGF2ZSBiZWVuIGNyZWF0ZWQgZm9yIGV2ZXJ5IGJhbGwtYmFsbCBhbmQgYmFsbC1ib3JkZXIgY29tYmluYXRpb24sIHdlIGNoZWNrXHJcbiAqICAgICBpZiBhbnkgb2Ygb3VyICdzYXZlZCcgY29sbGlzaW9ucyB0aGF0IGhhdmUgYXNzb2NpYXRlZCBjb2xsaXNpb24gdGltZXMgYXJlIGluIGJldHdlZW4gdGhlIHByZXZpb3VzIGFuZCBjdXJyZW50XHJcbiAqICAgICBzdGVwLCBtZWFuaW5nIGEgY29sbGlzaW9uIHdpbGwgb2NjdXIgaW4gdGhpcyB0aW1lLXN0ZXAuIFRvIGZ1bGx5IGVuc3VyZSB0aGF0IGNvbGxpc2lvbnMgYXJlIHNpbXVsYXRlZFxyXG4gKiAgICAgY29ycmVjdGx5IOKAlCBldmVuIHdpdGggZXh0cmVtZWx5IGhpZ2ggdGltZS1zdGVwcyDigJQgb25seSB0aGUgZWFybGllc3QgY29sbGlzaW9uIGlzIGhhbmRsZWQgYW5kIHByb2dyZXNzZWQuIEFsbFxyXG4gKiAgICAgQ29sbGlzaW9uIGluc3RhbmNlcyB0aGF0IHN0b3JlIHRoZSBpbnZvbHZlZCBCYWxsKHMpIGFyZSByZW1vdmVkLiBUaGlzIGRldGVjdGlvbi1yZXNwb25zZSBsb29wIGlzIHRoZW4gcmVwZWF0ZWRcclxuICogICAgIHVudGlsIHRoZXJlIGFyZSBubyBjb2xsaXNpb25zIGRldGVjdGVkIHdpdGhpbiB0aGUgdGltZS1zdGVwLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEJyYW5kb24gTGlcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlXHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IGNvbGxpc2lvbkxhYiBmcm9tICcuLi8uLi9jb2xsaXNpb25MYWIuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGFiVXRpbHMgZnJvbSAnLi4vQ29sbGlzaW9uTGFiVXRpbHMuanMnO1xyXG5pbXBvcnQgQmFsbCBmcm9tICcuL0JhbGwuanMnO1xyXG5pbXBvcnQgQmFsbFN5c3RlbSBmcm9tICcuL0JhbGxTeXN0ZW0uanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uIGZyb20gJy4vQ29sbGlzaW9uLmpzJztcclxuaW1wb3J0IFBsYXlBcmVhIGZyb20gJy4vUGxheUFyZWEuanMnO1xyXG5cclxuY2xhc3MgQ29sbGlzaW9uRW5naW5lIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQbGF5QXJlYX0gcGxheUFyZWFcclxuICAgKiBAcGFyYW0ge0JhbGxTeXN0ZW19IGJhbGxTeXN0ZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcGxheUFyZWEsIGJhbGxTeXN0ZW0gKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwbGF5QXJlYSBpbnN0YW5jZW9mIFBsYXlBcmVhLCBgaW52YWxpZCBwbGF5QXJlYTogJHtwbGF5QXJlYX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBiYWxsU3lzdGVtIGluc3RhbmNlb2YgQmFsbFN5c3RlbSwgYGludmFsaWQgYmFsbFN5c3RlbTogJHtiYWxsU3lzdGVtfWAgKTtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkIHtBcnJheS48Q29sbGlzaW9uPn0gLSBjb2xsZWN0aW9uIG9mIEJhbGwgY29sbGlzaW9ucyB0aGF0IG1heSBvciBtYXkgbm90IG9jY3VyLiBTb21lIENvbGxpc2lvbnMgaW5zdGFuY2VzXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbGwgbm90IGhhdmUgYW4gYXNzb2NpYXRlZCBcInRpbWVcIiB3aGljaCBpbmRpY2F0ZXMgdGhhdCBhIENvbGxpc2lvbiB3aWxsIG5vdCBvY2N1ci5cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VlIHRoZSBjb21tZW50IGF0IHRoZSB0b3AgZm9yIGEgaGlnaCBsZXZlbCBvdmVydmlldyBvZiBob3cgdGhpcyBzZXQgaXMgdXNlZC5cclxuICAgIHRoaXMuY29sbGlzaW9ucyA9IFtdO1xyXG4gICAgdGhpcy5uZXh0Q29sbGlzaW9ucyA9IFtdOyAvLyBNaW5pbWl6aW5nIEdDIGJ5IHVzaW5nIGEgcGVyc2lzdGVudCBhcnJheVxyXG4gICAgdGhpcy5jb2xsaXNpb25zVG9EaXNwb3NlID0gW107XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1Byb3BlcnR5LjxudW1iZXI+fSAtIHRoZSAnZGlyZWN0aW9uJyBvZiB0aGUgcHJvZ3Jlc3Npb24gb2YgdGhlIGN1cnJlbnQgdGltZS1zdGVwIG9mIHRoZSBzaW0sIHdoZXJlOlxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMSBtZWFucyB0aGUgc2ltIGlzIGJlaW5nIHByb2dyZXNzZWQgZm9yd2FyZHMgaW4gdGhlIGN1cnJlbnQgdGltZS1zdGVwLCAoZHQgPiAwKS5cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLTEgbWVhbnMgdGhlIHNpbSBpcyBiZWluZyBwcm9ncmVzc2VkIGJhY2t3YXJkcyBpbiB0aGUgY3VycmVudCB0aW1lLXN0ZXAsIChkdCA8IDApXHJcbiAgICB0aGlzLnRpbWVTdGVwRGlyZWN0aW9uUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDEsIHsgbnVtYmVyVHlwZTogJ0ludGVnZXInIH0gKTtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkIC0gcmVmZXJlbmNlIHRvIHRoZSBwYXNzZWQtaW4gcGFyYW1ldGVycy5cclxuICAgIHRoaXMucGxheUFyZWEgPSBwbGF5QXJlYTtcclxuICAgIHRoaXMuYmFsbFN5c3RlbSA9IGJhbGxTeXN0ZW07XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1ZlY3RvcjJ9IC0gbXV0YWJsZSBWZWN0b3IyIGluc3RhbmNlcywgcmV1c2VkIGluIGNyaXRpY2FsIGNvZGUgdG8gcmVkdWNlIG1lbW9yeSBhbGxvY2F0aW9ucy5cclxuICAgIHRoaXMuZGVsdGFSID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIHRoaXMuZGVsdGFWID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuXHJcbiAgICAvLyBPYnNlcnZlIHdoZW4gc29tZSAnc3RhdGUnIGluIHRoZSBzaW11bGF0aW9uIHRoYXQgaW52YWxpZGF0ZXMgb3VyIENvbGxpc2lvbiBpbnN0YW5jZXMgY2hhbmdlcy4gVGhpcyBvY2N1cnMgd2hlbiBhXHJcbiAgICAvLyBCYWxsIGlzIHVzZXItY29udHJvbGxlZCwgd2hlbiB0aGUgbnVtYmVyIG9mIEJhbGxzIGluIHRoZSBzeXN0ZW0gY2hhbmdlcywgd2hlbiB0aGUgJ0NvbnN0YW50JyBzaXplIGNoZWNrYm94IGlzXHJcbiAgICAvLyB0b2dnbGVkLCBvciB3aGVuIHRoZSAnZGlyZWN0aW9uJyBvZiB0aW1lIHByb2dyZXNzaW9uIGNoYW5nZXMuIEluIGFsbCBvZiB0aGVzZSBzY2VuYXJpb3MsIGV4aXN0aW5nIENvbGxpc2lvbnMgbWF5XHJcbiAgICAvLyBiZSBpbmNvcnJlY3QgYW5kIGNvbGxpc2lvbnMgc2hvdWxkIGJlIHJlLWRldGVjdGVkLiBNdWx0aWxpbmsgcGVyc2lzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltdWxhdGlvbi5cclxuICAgIE11bHRpbGluay5sYXp5TXVsdGlsaW5rKCBbXHJcbiAgICAgIGJhbGxTeXN0ZW0uYmFsbFN5c3RlbVVzZXJDb250cm9sbGVkUHJvcGVydHksXHJcbiAgICAgIGJhbGxTeXN0ZW0ubnVtYmVyT2ZCYWxsc1Byb3BlcnR5LFxyXG4gICAgICBiYWxsU3lzdGVtLmJhbGxzQ29uc3RhbnRTaXplUHJvcGVydHksXHJcbiAgICAgIHRoaXMudGltZVN0ZXBEaXJlY3Rpb25Qcm9wZXJ0eVxyXG4gICAgXSwgdGhpcy5yZXNldC5iaW5kKCB0aGlzICkgKTtcclxuXHJcbiAgICAvLyBPYnNlcnZlIHdoZW4gdGhlIFBsYXlBcmVhJ3MgcmVmbGVjdGluZ0JvcmRlclByb3BlcnR5IGNoYW5nZXMsIG1lYW5pbmcgZXhpc3RpbmcgQ29sbGlzaW9ucyB0aGF0IGludm9sdmUgdGhlXHJcbiAgICAvLyBQbGF5QXJlYSBtYXkgYmUgaW5jb3JyZWN0IGFuZCBjb2xsaXNpb25zIHNob3VsZCBiZSByZS1kZXRlY3RlZC4gTGluayBwZXJzaXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW11bGF0aW9uLlxyXG4gICAgcGxheUFyZWEucmVmbGVjdGluZ0JvcmRlclByb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB0aGlzLmludmFsaWRhdGVDb2xsaXNpb25zKCBwbGF5QXJlYSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIENvbGxpc2lvbkVuZ2luZS4gVGhpcyByZW1vdmVzIGFsbCAnc2F2ZWQnIENvbGxpc2lvbiBpbnN0YW5jZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHJlc2V0L3Jlc3RhcnQgYnV0dG9uIGlzIHByZXNzZWQgb3Igd2hlbiBzb21lICdzdGF0ZScgb2YgdGhlIHNpbXVsYXRpb24gY2hhbmdlcy5cclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHdoaWxlICggdGhpcy5jb2xsaXNpb25zLmxlbmd0aCApIHtcclxuICAgICAgdGhpcy5jb2xsaXNpb25zVG9EaXNwb3NlLnB1c2goIHRoaXMuY29sbGlzaW9ucy5wb3AoKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcHMgdGhlIENvbGxpc2lvbkVuZ2luZSwgd2hpY2ggaW5pdGlhbGl6ZXMgYm90aCBjb2xsaXNpb24gZGV0ZWN0aW9uIGFuZCByZXNwb25zZXMgZm9yIGEgZ2l2ZW4gdGltZS1zdGVwLiBTZWVcclxuICAgKiB0aGUgY29tbWVudCBhdCB0aGUgdG9wIG9mIHRoaXMgZmlsZSBmb3IgYSBoaWdoLWxldmVsIG92ZXJ2aWV3IG9mIHRoZSBjb2xsaXNpb24gZGV0ZWN0aW9uLXJlc3BvbnNlIGxvb3AuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gdGltZS1kZWx0YSBvZiB0aGlzIHN0ZXAsIGluIHNlY29uZHMuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVsYXBzZWRUaW1lIC0gZWxhcHNlZFRpbWUsIGJhc2VkIG9uIHdoZXJlIHRoZSBCYWxscyBhcmUgcG9zaXRpb25lZCB3aGVuIHRoaXMgbWV0aG9kIGlzIGNhbGxlZC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gW21heEl0ZXJhdGlvbnNdIC0gbWF4IG51bWJlciBvZiBpdGVyYXRpb25zIGluIHRoZSBkZXRlY3Rpb24tcmVzcG9uc2UgbG9vcC4gT25jZSB0aGlzIG51bWJlciBpc1xyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFjaGVkLCBjb2xsaXNpb24tcmVzcG9uc2UgaXMgY29uc2lkZXJlZCB0byBiZSBmaW5pc2hlZCBmb3IgdGhlIHN0ZXAuXHJcbiAgICovXHJcbiAgc3RlcCggZHQsIGVsYXBzZWRUaW1lLCBtYXhJdGVyYXRpb25zID0gMjAwMCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBkdCA9PT0gJ251bWJlcicsIGBpbnZhbGlkIGR0OiAke2R0fWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBlbGFwc2VkVGltZSA9PT0gJ251bWJlcicgJiYgZWxhcHNlZFRpbWUgPj0gMCwgYGludmFsaWQgZWxhcHNlZFRpbWU6ICR7ZWxhcHNlZFRpbWV9YCApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5TaW0oIGBzdGVwIGR0OiR7ZHR9LCBlbGFwc2VkVGltZToke2VsYXBzZWRUaW1lfSwgbWF4SXRlcmF0aW9uczoke21heEl0ZXJhdGlvbnN9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBsZXQgaXRlcmF0aW9ucyA9IDA7XHJcbiAgICB3aGlsZSAoIGl0ZXJhdGlvbnMrKyA8IG1heEl0ZXJhdGlvbnMgKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5TaW0oIGBpdGVyYXRpb24gJHtpdGVyYXRpb25zfSBkdDoke2R0fSwgZWxhcHNlZFRpbWU6JHtlbGFwc2VkVGltZX1gICk7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHRoaXMuYmFsbFN5c3RlbS5iYWxscy5mb3JFYWNoKCBiYWxsID0+IHtcclxuICAgICAgICBzY2VuZXJ5TG9nLlNpbSggYCMke2JhbGwuaW5kZXh9IHZlbG9jaXR5OiR7YmFsbC52ZWxvY2l0eVByb3BlcnR5LnZhbHVlLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBGaXJzdCBkZXRlY3QgYWxsIHBvdGVudGlhbCBjb2xsaXNpb25zIHRoYXQgaGF2ZSBub3QgYWxyZWFkeSBiZWVuIGRldGVjdGVkLlxyXG4gICAgICB0aGlzLnRpbWVTdGVwRGlyZWN0aW9uUHJvcGVydHkudmFsdWUgPSBNYXRoLnNpZ24oIGR0ICk7XHJcbiAgICAgIHRoaXMuZGV0ZWN0QWxsQ29sbGlzaW9ucyggZWxhcHNlZFRpbWUgKTtcclxuXHJcbiAgICAgIGlmICggc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSApIHtcclxuICAgICAgICB0aGlzLmNvbGxpc2lvbnMuZm9yRWFjaCggY29sbGlzaW9uID0+IHtcclxuICAgICAgICAgIHNjZW5lcnlMb2cuU2ltKCBgJHtjb2xsaXNpb24uaW5SYW5nZSggZWxhcHNlZFRpbWUsIGVsYXBzZWRUaW1lICsgZHQgKSA/ICdbaW4tc3RlcF0gJyA6ICcnfSR7Y29sbGlzaW9uLnRpbWV9ICR7Y29sbGlzaW9ufWAgKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEdldCBhbGwgQ29sbGlzaW9ucyB0aGF0IGhhdmUgYSBjb2xsaXNpb24gJ3RpbWUnIGluIHRoaXMgdGltZS1zdGVwLiBSb2xsZWQgYmFjayB0byBzaW1wbGUgbG9naWMgZm9yIHBlcmZvcm1hbmNlXHJcbiAgICAgIC8vIGFuZCBtZW1vcnkgY2hhcmFjdGVyaXN0aWNzXHJcbiAgICAgIC8vIElmIHRoZXJlIGFyZSBjb2xsaXNpb25zIHdpdGhpbiB0aGUgZ2l2ZW4gdGltZS1zdGVwLCBvbmx5IGhhbmRsZSBhbmQgcHJvZ3Jlc3MgdGhlICdlYXJsaWVzdCcgY29sbGlzaW9uLlxyXG4gICAgICAvLyBGaW5kIGFuZCByZWZlcmVuY2UgdGhlIG5leHQgQ29sbGlzaW9uIHRoYXQgd2lsbCBvY2N1ciBvZiB0aGUgY29sbGlzaW9ucyB0aGF0IHdpbGwgb2NjdXIgaW4gdGhpcyBzdGVwLlxyXG4gICAgICB0aGlzLm5leHRDb2xsaXNpb25zLmxlbmd0aCA9IDA7XHJcbiAgICAgIGxldCBiZXN0UG90ZW50aWFsQ29sbGlzaW9uVGltZSA9IGVsYXBzZWRUaW1lICsgZHQgKiAoIDEgKyAxZS03ICk7XHJcbiAgICAgIGZvciAoIGxldCBpID0gdGhpcy5jb2xsaXNpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgICAgIGNvbnN0IGNvbGxpc2lvbiA9IHRoaXMuY29sbGlzaW9uc1sgaSBdO1xyXG4gICAgICAgIGlmICggY29sbGlzaW9uLmluUmFuZ2UoIGVsYXBzZWRUaW1lLCBiZXN0UG90ZW50aWFsQ29sbGlzaW9uVGltZSApICkge1xyXG4gICAgICAgICAgaWYgKCBjb2xsaXNpb24udGltZSAhPT0gYmVzdFBvdGVudGlhbENvbGxpc2lvblRpbWUgKSB7XHJcbiAgICAgICAgICAgIGJlc3RQb3RlbnRpYWxDb2xsaXNpb25UaW1lID0gY29sbGlzaW9uLnRpbWU7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dENvbGxpc2lvbnMubGVuZ3RoID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMubmV4dENvbGxpc2lvbnMucHVzaCggY29sbGlzaW9uICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoICF0aGlzLm5leHRDb2xsaXNpb25zLmxlbmd0aCApIHtcclxuXHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLlNpbSggJ25vIGNvbGxpc2lvbnMgaW4gc3RlcCcgKTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIGNvbGxpc2lvbnMgd2l0aGluIHRoaXMgc3RlcCwgdGhlIEJhbGxzIGFyZSBpbiB1bmlmb3JtIG1vdGlvbiBmb3IgdGhlIGVudGlyZXR5IG9mIHRoaXMgc3RlcC5cclxuICAgICAgICAvLyBUaGUgcmVjdXJzaXZlIHByb2Nlc3MgaXMgc3RvcHBlZCBhbmQgdGhlIEJhbGxzIGFyZSBzdGVwcGVkIHVuaWZvcm1seSB0byB0aGUgZW5kIG9mIHRoZSB0aW1lLXN0ZXAuXHJcbiAgICAgICAgdGhpcy5wcm9ncmVzc0JhbGxzKCBkdCwgZWxhcHNlZFRpbWUgKTtcclxuXHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIFJlZmVyZW5jZSB3aGVuIHRoZSBjb2xsaXNpb24gd2lsbCBvY2N1ciAoaW4gdGVybXMgb2YgYm90aCBlbGFwc2VkVGltZSBhbmQgYSB0aW1lLWRlbHRhLCByZXNwZWN0aXZlbHkpLlxyXG4gICAgICAgIGNvbnN0IGNvbGxpc2lvblRpbWUgPSBNYXRoLm1heCggMCwgYmVzdFBvdGVudGlhbENvbGxpc2lvblRpbWUgKTtcclxuICAgICAgICBjb25zdCB0aW1lVW50aWxDb2xsaXNpb24gPSBjb2xsaXNpb25UaW1lIC0gZWxhcHNlZFRpbWU7XHJcblxyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5TaW0oIGBjb2xsaXNpb24gaW4gc3RlcCBpbiAke3RpbWVVbnRpbENvbGxpc2lvbn1gICk7XHJcblxyXG4gICAgICAgIC8vIFByb2dyZXNzIGZvcndhcmRzIHRvIHRoZSBleGFjdCBwb2ludCBvZiBjb250YWN0IG9mIHRoZSBjb2xsaXNpb24uXHJcbiAgICAgICAgdGhpcy5wcm9ncmVzc0JhbGxzKCB0aW1lVW50aWxDb2xsaXNpb24sIGVsYXBzZWRUaW1lICk7XHJcblxyXG4gICAgICAgIC8vIEhhbmRsZSB0aGUgcmVzcG9uc2UgZm9yIHRoZSBDb2xsaXNpb24gZGVwZW5kaW5nIG9uIHRoZSB0eXBlIG9mIGNvbGxpc2lvbi5cclxuICAgICAgICBmb3IgKCBsZXQgaSA9IHRoaXMubmV4dENvbGxpc2lvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgICAgICB0aGlzLmhhbmRsZUNvbGxpc2lvbiggdGhpcy5uZXh0Q29sbGlzaW9uc1sgaSBdLCBkdCApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ29udGludWUgb24gdG8gdGhlIG5leHQgaXRlcmF0aW9uXHJcbiAgICAgICAgZHQgLT0gdGltZVVudGlsQ29sbGlzaW9uO1xyXG4gICAgICAgIGVsYXBzZWRUaW1lID0gY29sbGlzaW9uVGltZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgd2hpbGUgKCB0aGlzLmNvbGxpc2lvbnNUb0Rpc3Bvc2UubGVuZ3RoICkge1xyXG4gICAgICAgIHRoaXMuY29sbGlzaW9uc1RvRGlzcG9zZS5wb3AoKS5kaXNwb3NlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoZXJlIGFscmVhZHkgZXhpc3RzIGEgY29sbGlzaW9uIGJldHdlZW4gdGhlIHR3byBib2RpZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGJvZHkxXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGJvZHkyXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaGFzQ29sbGlzaW9uQmV0d2VlbiggYm9keTEsIGJvZHkyICkge1xyXG4gICAgZm9yICggbGV0IGkgPSB0aGlzLmNvbGxpc2lvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgIGlmICggdGhpcy5jb2xsaXNpb25zWyBpIF0uaW5jbHVkZXNCb2RpZXMoIGJvZHkxLCBib2R5MiApICkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQcm9ncmVzc2VzIHRoZSBCYWxscyBmb3J3YXJkcyBieSB0aGUgZ2l2ZW4gdGltZS1kZWx0YSwgYXNzdW1pbmcgdGhlcmUgYXJlIG5vIGNvbGxpc2lvbnMuXHJcbiAgICogQHByb3RlY3RlZCAtIGNhbiBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSB0aW1lLWRlbHRhLCBpbiBzZWNvbmRzLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBlbGFwc2VkVGltZSAtIGVsYXBzZWRUaW1lLCBiYXNlZCBvbiB3aGVyZSB0aGUgQmFsbHMgYXJlIHBvc2l0aW9uZWQgd2hlbiB0aGlzIG1ldGhvZCBpcyBjYWxsZWQuXHJcbiAgICovXHJcbiAgcHJvZ3Jlc3NCYWxscyggZHQsIGVsYXBzZWRUaW1lICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGR0ID09PSAnbnVtYmVyJywgYGludmFsaWQgZHQ6ICR7ZHR9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGVsYXBzZWRUaW1lID09PSAnbnVtYmVyJyAmJiBlbGFwc2VkVGltZSA+PSAwLCBgaW52YWxpZCBlbGFwc2VkVGltZTogJHtlbGFwc2VkVGltZX1gICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLlNpbSggJ0NvbGxpc2lvbkVuZ2luZS5wcm9ncmVzc0JhbGxzJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBDb2xsaXNpb25FbmdpbmUgb25seSBkZWFscyB3aXRoIHVuaWZvcm1seSBtb3ZpbmcgQmFsbHMsIGJ1dCBzdWItdHlwZXMgbWlnaHQgbm90IChmb3IgdGhlICdJbmVsYXN0aWMnIHNjcmVlbikuXHJcbiAgICB0aGlzLmJhbGxTeXN0ZW0uc3RlcFVuaWZvcm1Nb3Rpb24oIGR0LCBlbGFwc2VkVGltZSArIGR0ICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZWN0cyBhbGwgYmFsbC1iYWxsIGFuZCBiYWxsLWJvcmRlciBjb2xsaXNpb25zIHRoYXQgaGF2ZSBub3QgYWxyZWFkeSBiZWVuIGRldGVjdGVkLlxyXG4gICAqIEBwcm90ZWN0ZWQgLSBjYW4gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVsYXBzZWRUaW1lIC0gZWxhcHNlZFRpbWUsIGJhc2VkIG9uIHdoZXJlIHRoZSBCYWxscyBhcmUgcG9zaXRpb25lZCB3aGVuIHRoaXMgbWV0aG9kIGlzIGNhbGxlZC5cclxuICAgKi9cclxuICBkZXRlY3RBbGxDb2xsaXNpb25zKCBlbGFwc2VkVGltZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBlbGFwc2VkVGltZSA9PT0gJ251bWJlcicgJiYgZWxhcHNlZFRpbWUgPj0gMCwgYGludmFsaWQgZWxhcHNlZFRpbWU6ICR7ZWxhcHNlZFRpbWV9YCApO1xyXG5cclxuICAgIC8vIENvbGxpc2lvbkVuZ2luZSBvbmx5IGRlYWxzIHdpdGggZGV0ZWN0aW5nIDIgdHlwZXMgb2YgY29sbGlzaW9ucywgYnV0IHN1Yi10eXBlcyBtaWdodCBub3QgKCdJbmVsYXN0aWMnIHNjcmVlbikuXHJcbiAgICB0aGlzLmRldGVjdEJhbGxUb0JhbGxDb2xsaXNpb25zKCBlbGFwc2VkVGltZSApO1xyXG4gICAgdGhpcy5kZXRlY3RCYWxsVG9Cb3JkZXJDb2xsaXNpb25zKCBlbGFwc2VkVGltZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlcyBhbGwgQ29sbGlzaW9ucyBieSBjYWxsaW5nIGEgcmVzcG9uc2UgYWxnb3JpdGhtLCBkaXNwYXRjaGVkIGJ5IHRoZSB0eXBlIG9mIGJvZGllcyBpbnZvbHZlZCBpbiB0aGUgQ29sbGlzaW9uLlxyXG4gICAqIEBwcm90ZWN0ZWQgLSBjYW4gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtDb2xsaXNpb259IGNvbGxpc2lvbiAtIHRoZSBDb2xsaXNpb24gaW5zdGFuY2UuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICovXHJcbiAgaGFuZGxlQ29sbGlzaW9uKCBjb2xsaXNpb24sIGR0ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29sbGlzaW9uIGluc3RhbmNlb2YgQ29sbGlzaW9uLCBgaW52YWxpZCBjb2xsaXNpb246ICR7Y29sbGlzaW9ufWAgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHNjZW5lcnlMb2cuU2ltKCAnQ29sbGlzaW9uRW5naW5lLmhhbmRsZUNvbGxpc2lvbicgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gQ29sbGlzaW9uRW5naW5lIG9ubHkgZGVhbHMgd2l0aCBkZXRlY3RpbmcgMiB0eXBlcyBvZiBjb2xsaXNpb25zLCBidXQgc3ViLXR5cGVzIG1pZ2h0IG5vdCAoJ0luZWxhc3RpYycgc2NyZWVuKS5cclxuICAgIGNvbGxpc2lvbi5pbmNsdWRlcyggdGhpcy5wbGF5QXJlYSApID9cclxuICAgIHRoaXMuaGFuZGxlQmFsbFRvQm9yZGVyQ29sbGlzaW9uKCBjb2xsaXNpb24uYm9keTIgPT09IHRoaXMucGxheUFyZWEgPyBjb2xsaXNpb24uYm9keTEgOiBjb2xsaXNpb24uYm9keTIsIGR0ICkgOlxyXG4gICAgdGhpcy5oYW5kbGVCYWxsVG9CYWxsQ29sbGlzaW9uKCBjb2xsaXNpb24uYm9keTEsIGNvbGxpc2lvbi5ib2R5MiwgZHQgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYWxsIGNvbGxpc2lvbnMgdGhhdCBpbnZvbHZlcyB0aGUgcGFzc2VkLWluIGJvZHkuXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGJvZHlcclxuICAgKi9cclxuICBpbnZhbGlkYXRlQ29sbGlzaW9ucyggYm9keSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJvZHkgaW5zdGFuY2VvZiBPYmplY3QsIGBpbnZhbGlkIGJvZHk6ICR7Ym9keX1gICk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSB0aGlzLmNvbGxpc2lvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgIGNvbnN0IGNvbGxpc2lvbiA9IHRoaXMuY29sbGlzaW9uc1sgaSBdO1xyXG5cclxuICAgICAgaWYgKCBjb2xsaXNpb24uaW5jbHVkZXMoIGJvZHkgKSApIHtcclxuICAgICAgICB0aGlzLmNvbGxpc2lvbnMuc3BsaWNlKCBpLCAxICk7XHJcbiAgICAgICAgdGhpcy5jb2xsaXNpb25zVG9EaXNwb3NlLnB1c2goIGNvbGxpc2lvbiApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogQmFsbCBUbyBCYWxsIENvbGxpc2lvbnNcclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBEZXRlY3RzIGFsbCBiYWxsLXRvLWJhbGwgY29sbGlzaW9ucyBvZiB0aGUgQmFsbFN5c3RlbSB0aGF0IGhhdmVuJ3QgYWxyZWFkeSBvY2N1cnJlZC4gQmFsbC10by1iYWxsIGNvbGxpc2lvbnMgYXJlXHJcbiAgICogZGV0ZWN0ZWQgYmVmb3JlIHRoZSBjb2xsaXNpb24gb2NjdXJzIHRvIGF2b2lkIHR1bm5lbGluZyBzY2VuYXJpb3MuIEZvciBuZXdseSBkZXRlY3RlZCBjb2xsaXNpb25zLCBuZWNlc3NhcnlcclxuICAgKiBpbmZvcm1hdGlvbiBpcyBlbmNhcHN1bGF0ZWQgaW4gYSBDb2xsaXNpb24gaW5zdGFuY2UuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBlbGFwc2VkVGltZSAtIGVsYXBzZWRUaW1lLCBiYXNlZCBvbiB3aGVyZSB0aGUgQmFsbHMgYXJlIHBvc2l0aW9uZWQgd2hlbiB0aGlzIG1ldGhvZCBpcyBjYWxsZWQuXHJcbiAgICovXHJcbiAgZGV0ZWN0QmFsbFRvQmFsbENvbGxpc2lvbnMoIGVsYXBzZWRUaW1lICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGVsYXBzZWRUaW1lID09PSAnbnVtYmVyJyAmJiBlbGFwc2VkVGltZSA+PSAwLCBgaW52YWxpZCBlbGFwc2VkVGltZTogJHtlbGFwc2VkVGltZX1gICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLlNpbSggJ2RldGVjdEJhbGxUb0JhbGxDb2xsaXNpb25zJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBMb29wIHRocm91Z2ggZWFjaCB1bmlxdWUgcG9zc2libGUgcGFpciBvZiBCYWxscy5cclxuICAgIGZvciAoIGxldCBpID0gMTsgaSA8IHRoaXMuYmFsbFN5c3RlbS5iYWxscy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgYmFsbDEgPSB0aGlzLmJhbGxTeXN0ZW0uYmFsbHNbIGkgXTtcclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgaTsgaisrICkge1xyXG4gICAgICAgIGNvbnN0IGJhbGwyID0gdGhpcy5iYWxsU3lzdGVtLmJhbGxzWyBqIF07XHJcblxyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGJhbGwxICE9PSBiYWxsMiwgJ2JhbGwgY2Fubm90IGNvbGxpZGUgd2l0aCBpdHNlbGYnICk7XHJcblxyXG4gICAgICAgIC8vIE9ubHkgZGV0ZWN0IG5ldyBiYWxsLWJhbGwgY29sbGlzaW9ucyBpZiBpdCBoYXNuJ3QgYWxyZWFkeSBiZWVuIGRldGVjdGVkLlxyXG4gICAgICAgIGlmICggdGhpcy5oYXNDb2xsaXNpb25CZXR3ZWVuKCBiYWxsMSwgYmFsbDIgKSApIHtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVmZXJlbmNlIHRoZSBtdWx0aXBsaWVyIG9mIHRoZSB2ZWxvY2l0eSBvZiB0aGUgQmFsbC4gV2hlbiB0aGUgc2ltIGlzIGJlaW5nIHJldmVyc2VkLCBCYWxscyBhcmUgZXNzZW50aWFsbHlcclxuICAgICAgICAvLyBtb3ZpbmcgaW4gdGhlIG9wcG9zaXRlIGRpcmVjdGlvbiBvZiBpdHMgdmVsb2NpdHkgdmVjdG9yLiBGb3IgY2FsY3VsYXRpbmcgaWYgQmFsbHMgd2lsbCBjb2xsaWRlLCByZXZlcnNlIHRoZVxyXG4gICAgICAgIC8vIHZlbG9jaXR5IG9mIHRoZSBiYWxsIGZvciBjb252ZW5pZW5jZSBhbmQgcmV2ZXJzZSB0aGUgY29sbGlzaW9uVGltZSBiYWNrIGF0IHRoZSBlbmQuXHJcbiAgICAgICAgY29uc3QgdmVsb2NpdHlNdWx0aXBsaWVyID0gdGhpcy50aW1lU3RlcERpcmVjdGlvblByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICAgICAgICogVGhpcyBjYWxjdWxhdGlvbiBmb3IgZGV0ZWN0aW5nIGlmIHRoZSBiYWxscyB3aWxsIGNvbGxpZGUgY29tZXMgZnJvbSB0aGVcclxuICAgICAgICAgKiBrbm93biBmYWN0IHRoYXQgd2hlbiB0aGUgQmFsbHMgYXJlIGV4YWN0bHkgY29sbGlkaW5nLCB0aGVpciBkaXN0YW5jZSBpc1xyXG4gICAgICAgICAqIGV4YWN0bHkgZXF1YWwgdG8gdGhlIHN1bSBvZiB0aGVpciByYWRpaS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIERvY3VtZW50aW5nIHRoZSBkZXJpdmF0aW9uIHdhcyBiZXlvbmQgdGhlIHNjb3BlIG9mIGNvZGUgY29tbWVudHMuIFBsZWFzZSByZWZlcmVuY2VcclxuICAgICAgICAgKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY29sbGlzaW9uLWxhYi9ibG9iL21hc3Rlci9kb2MvYWxnb3JpdGhtcy9iYWxsLXRvLWJhbGwtY29sbGlzaW9uLWRldGVjdGlvbi5tZFxyXG4gICAgICAgICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gICAgICAgIHRoaXMuZGVsdGFSLnNldCggYmFsbDIucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApLnN1YnRyYWN0KCBiYWxsMS5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgICAgdGhpcy5kZWx0YVYuc2V0KCBiYWxsMi52ZWxvY2l0eVByb3BlcnR5LnZhbHVlICkuc3VidHJhY3QoIGJhbGwxLnZlbG9jaXR5UHJvcGVydHkudmFsdWUgKS5tdWx0aXBseSggdmVsb2NpdHlNdWx0aXBsaWVyICk7XHJcbiAgICAgICAgY29uc3Qgc3VtT2ZSYWRpaVNxdWFyZWQgPSAoIGJhbGwxLnJhZGl1c1Byb3BlcnR5LnZhbHVlICsgYmFsbDIucmFkaXVzUHJvcGVydHkudmFsdWUgKSAqKiAyO1xyXG5cclxuICAgICAgICBjb25zdCByZWxhdGl2ZURvdFByb2R1Y3QgPSB0aGlzLmRlbHRhVi5kb3QoIHRoaXMuZGVsdGFSICk7XHJcblxyXG4gICAgICAgIGNvbnN0IGlzRWZmZWN0aXZlbHlQYXJhbGxlbCA9IE1hdGguYWJzKCByZWxhdGl2ZURvdFByb2R1Y3QgKSA8IDFlLTExO1xyXG5cclxuICAgICAgICAvLyBTb2x2ZSBmb3IgdGhlIHBvc3NpYmxlIHJvb3RzIG9mIHRoZSBxdWFkcmF0aWMgb3V0bGluZWQgaW4gdGhlIGRvY3VtZW50IGFib3ZlLlxyXG4gICAgICAgIGNvbnN0IHBvc3NpYmxlUm9vdHMgPSBVdGlscy5zb2x2ZVF1YWRyYXRpY1Jvb3RzUmVhbChcclxuICAgICAgICAgIHRoaXMuZGVsdGFWLm1hZ25pdHVkZVNxdWFyZWQsXHJcbiAgICAgICAgICByZWxhdGl2ZURvdFByb2R1Y3QgKiAyLFxyXG4gICAgICAgICAgQ29sbGlzaW9uTGFiVXRpbHMuY2xhbXBEb3duKCB0aGlzLmRlbHRhUi5tYWduaXR1ZGVTcXVhcmVkIC0gc3VtT2ZSYWRpaVNxdWFyZWQgKSApO1xyXG5cclxuICAgICAgICAvLyBUaGUgbWluaW11bSByb290IG9mIHRoZSBxdWFkcmF0aWMgaXMgd2hlbiB0aGUgQmFsbHMgd2lsbCBmaXJzdCBjb2xsaWRlLlxyXG4gICAgICAgIGNvbnN0IHJvb3QgPSBwb3NzaWJsZVJvb3RzID8gTWF0aC5taW4oIC4uLnBvc3NpYmxlUm9vdHMgKSA6IG51bGw7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBxdWFkcmF0aWMgcm9vdCBpcyBmaW5pdGUgYW5kIHRoZSBjb2xsaXNpb25UaW1lIGlzIHBvc2l0aXZlLCB0aGUgY29sbGlzaW9uIGlzIGRldGVjdGVkIGFuZCBzaG91bGQgYmVcclxuICAgICAgICAvLyByZWdpc3RlcmVkLlxyXG4gICAgICAgIGNvbnN0IGNvbGxpc2lvblRpbWUgPSAoIE51bWJlci5pc0Zpbml0ZSggcm9vdCApICYmIHJvb3QgPj0gMCAmJiAhaXNFZmZlY3RpdmVseVBhcmFsbGVsICkgPyBlbGFwc2VkVGltZSArIHJvb3QgKiB2ZWxvY2l0eU11bHRpcGxpZXIgOiBudWxsO1xyXG5cclxuICAgICAgICBjb25zdCBjb2xsaXNpb24gPSBDb2xsaXNpb24uY3JlYXRlRnJvbVBvb2woIGJhbGwxLCBiYWxsMiwgY29sbGlzaW9uVGltZSApO1xyXG5cclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHNjZW5lcnlMb2cuU2ltKCBgYWRkaW5nIGNvbGxpc2lvbiAke2NvbGxpc2lvbn0gcm9vdDoke3Jvb3R9ICR7dGhpcy5kZWx0YVYuZG90KCB0aGlzLmRlbHRhUiApfWAgKTtcclxuXHJcbiAgICAgICAgLy8gUmVnaXN0ZXIgdGhlIGNvbGxpc2lvbiBhbmQgZW5jYXBzdWxhdGUgaW5mb3JtYXRpb24gaW4gYSBDb2xsaXNpb24gaW5zdGFuY2UuXHJcbiAgICAgICAgdGhpcy5jb2xsaXNpb25zLnB1c2goIGNvbGxpc2lvbiApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzcG9uZHMgdG8gYW5kIGhhbmRsZXMgYSBzaW5nbGUgYmFsbC10by1iYWxsIGNvbGxpc2lvbiBieSB1cGRhdGluZyB0aGUgdmVsb2NpdHkgb2YgYm90aCBCYWxscyBkZXBlbmRpbmcgb24gdGhlaXJcclxuICAgKiBvcmllbnRhdGlvbiBhbmQgZWxhc3RpY2l0eS4gVGhlIGNvbGxpc2lvbiBhbGdvcml0aG0gZm9sbG93cyB0aGUgc3RhbmRhcmQgcmlnaWQtYm9keSBjb2xsaXNpb24gbW9kZWwgYXMgZGVzY3JpYmVkIGluXHJcbiAgICogaHR0cDovL3dlYi5tc3QuZWR1L35yZWZsb3JpL2JlMTUwL0R5biUyMExlY3R1cmUlMjBWaWRlb3MvSW1wYWN0JTIwUGFydGljbGVzJTIwMS9JbXBhY3QlMjBQYXJ0aWNsZXMlMjAxLnBkZi5cclxuICAgKlxyXG4gICAqIE91ciB2ZXJzaW9uIGRlYWxzIHdpdGggbm9ybWFsaXplZCBkb3QgcHJvZHVjdCBwcm9qZWN0aW9ucyB0byBzd2l0Y2ggY29vcmRpbmF0ZSBmcmFtZXMuIFBsZWFzZSByZWZlcmVuY2VcclxuICAgKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Eb3RfcHJvZHVjdC5cclxuICAgKlxyXG4gICAqIEBwcm90ZWN0ZWQgLSBjYW4gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCYWxsfSBiYWxsMSAtIHRoZSBmaXJzdCBCYWxsIGludm9sdmVkIGluIHRoZSBjb2xsaXNpb24uXHJcbiAgICogQHBhcmFtIHtCYWxsfSBiYWxsMiAtIHRoZSBzZWNvbmQgQmFsbCBpbnZvbHZlZCBpbiB0aGUgY29sbGlzaW9uLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqL1xyXG4gIGhhbmRsZUJhbGxUb0JhbGxDb2xsaXNpb24oIGJhbGwxLCBiYWxsMiwgZHQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBiYWxsMSBpbnN0YW5jZW9mIEJhbGwsIGBpbnZhbGlkIGJhbGwxOiAke2JhbGwxfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJhbGwyIGluc3RhbmNlb2YgQmFsbCwgYGludmFsaWQgYmFsbDE6ICR7YmFsbDF9YCApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5TaW0oIGBDb2xsaXNpb25FbmdpbmUuaGFuZGxlQmFsbFRvQmFsbENvbGxpc2lvbiAjJHtiYWxsMS5pbmRleH0gIyR7YmFsbDIuaW5kZXh9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBDb252ZW5pZW5jZSByZWZlcmVuY2VzIHRvIGtub3duIGJhbGwgdmFsdWVzLlxyXG4gICAgY29uc3QgbTEgPSBiYWxsMS5tYXNzUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBtMiA9IGJhbGwyLm1hc3NQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGxldCBlbGFzdGljaXR5ID0gdGhpcy5wbGF5QXJlYS5nZXRFbGFzdGljaXR5KCk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZHQgPj0gMCB8fCBlbGFzdGljaXR5ID4gMCwgJ1dlIGNhbm5vdCBzdGVwIGJhY2t3YXJkcyB3aXRoIHplcm8gZWxhc3RpY2l0eScgKTtcclxuXHJcbiAgICBpZiAoIGR0IDwgMCApIHtcclxuICAgICAgZWxhc3RpY2l0eSA9IDEgLyBlbGFzdGljaXR5O1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5TaW0oIGBiYWxsMSB2OiAke2JhbGwxLnZlbG9jaXR5UHJvcGVydHkudmFsdWV9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLlNpbSggYGJhbGwyIHY6ICR7YmFsbDIudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZX1gICk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBOb3JtYWwgYW5kIFRhbmdlbnRpYWwgdmVjdG9yLCBjYWxsZWQgdGhlICdsaW5lIG9mIGltcGFjdCcgYW5kICdwbGFuZSBvZiBjb250YWN0JyByZXNwZWN0aXZlbHkuXHJcbiAgICBjb25zdCBub3JtYWwgPSBiYWxsMi5wb3NpdGlvblByb3BlcnR5LnZhbHVlLm1pbnVzKCBiYWxsMS5wb3NpdGlvblByb3BlcnR5LnZhbHVlICkubm9ybWFsaXplKCk7XHJcbiAgICBjb25zdCB0YW5nZW50ID0gbmV3IFZlY3RvcjIoIC1ub3JtYWwueSwgbm9ybWFsLnggKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHNjZW5lcnlMb2cuU2ltKCBgbm9ybWFsICR7bm9ybWFsfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5TaW0oIGB0YW5nZW50ICR7dGFuZ2VudH1gICk7XHJcblxyXG4gICAgLy8gUmVmZXJlbmNlIHRoZSAnbm9ybWFsJyBhbmQgJ3RhbmdlbnRpYWwnIGNvbXBvbmVudHMgb2YgdGhlIEJhbGwgdmVsb2NpdGllcy4gVGhpcyBpcyBhIHN3aXRjaCBpbiBjb29yZGluYXRlIGZyYW1lcy5cclxuICAgIGNvbnN0IHYxbiA9IGJhbGwxLnZlbG9jaXR5UHJvcGVydHkudmFsdWUuZG90KCBub3JtYWwgKTtcclxuICAgIGNvbnN0IHYybiA9IGJhbGwyLnZlbG9jaXR5UHJvcGVydHkudmFsdWUuZG90KCBub3JtYWwgKTtcclxuICAgIGNvbnN0IHYxdCA9IGJhbGwxLnZlbG9jaXR5UHJvcGVydHkudmFsdWUuZG90KCB0YW5nZW50ICk7XHJcbiAgICBjb25zdCB2MnQgPSBiYWxsMi52ZWxvY2l0eVByb3BlcnR5LnZhbHVlLmRvdCggdGFuZ2VudCApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5TaW0oIGBtMSAke20xfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5TaW0oIGBtMiAke20yfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5TaW0oIGB2MW4gJHt2MW59YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLlNpbSggYHYxdCAke3YxdH1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHNjZW5lcnlMb2cuU2ltKCBgdjJuICR7djJufWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5TaW0oIGB2MnQgJHt2MnR9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLlNpbSggYGVsYXN0aWNpdHkgJHtlbGFzdGljaXR5fWAgKTtcclxuXHJcbiAgICAvLyBDb21wdXRlIHRoZSAnbm9ybWFsJyBjb21wb25lbnRzIG9mIHZlbG9jaXRpZXMgYWZ0ZXIgY29sbGlzaW9uIChQIGZvciBwcmltZSA9IGFmdGVyKS5cclxuICAgIGxldCB2MW5QID0gKCAoIG0xIC0gbTIgKiBlbGFzdGljaXR5ICkgKiB2MW4gKyBtMiAqICggMSArIGVsYXN0aWNpdHkgKSAqIHYybiApIC8gKCBtMSArIG0yICk7XHJcbiAgICBsZXQgdjJuUCA9ICggKCBtMiAtIG0xICogZWxhc3RpY2l0eSApICogdjJuICsgbTEgKiAoIDEgKyBlbGFzdGljaXR5ICkgKiB2MW4gKSAvICggbTEgKyBtMiApO1xyXG5cclxuICAgIC8vIFJlbW92ZSBuZWdsaWdpYmxlIG5vcm1hbCB2ZWxvY2l0aWVzIHRvIHByZXZlbnQgb3NjaWxsYXRpb25zLFxyXG4gICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jb2xsaXNpb24tbGFiL2lzc3Vlcy8xNzFcclxuICAgIGlmICggTWF0aC5hYnMoIHYxblAgKSA8IDFlLTggKSB7IHYxblAgPSAwOyB9XHJcbiAgICBpZiAoIE1hdGguYWJzKCB2Mm5QICkgPCAxZS04ICkgeyB2Mm5QID0gMDsgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5TaW0oIGB2MW5QICR7djFuUH1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHNjZW5lcnlMb2cuU2ltKCBgdjJuUCAke3YyblB9YCApO1xyXG5cclxuICAgIC8vIENoYW5nZSBjb29yZGluYXRlIGZyYW1lcyBiYWNrIGludG8gdGhlIHN0YW5kYXJkIHgteSBjb29yZGluYXRlIGZyYW1lLlxyXG4gICAgY29uc3QgdjF4UCA9IHRhbmdlbnQuZG90WFkoIHYxdCwgdjFuUCApO1xyXG4gICAgY29uc3QgdjJ4UCA9IHRhbmdlbnQuZG90WFkoIHYydCwgdjJuUCApO1xyXG4gICAgY29uc3QgdjF5UCA9IG5vcm1hbC5kb3RYWSggdjF0LCB2MW5QICk7XHJcbiAgICBjb25zdCB2MnlQID0gbm9ybWFsLmRvdFhZKCB2MnQsIHYyblAgKTtcclxuICAgIGJhbGwxLnZlbG9jaXR5UHJvcGVydHkudmFsdWUgPSBub3JtYWwuc2V0WFkoIHYxeFAsIHYxeVAgKTtcclxuICAgIGJhbGwyLnZlbG9jaXR5UHJvcGVydHkudmFsdWUgPSB0YW5nZW50LnNldFhZKCB2MnhQLCB2MnlQICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLlNpbSggYGJhbGwxIHY6ICR7YmFsbDEudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZX1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHNjZW5lcnlMb2cuU2ltKCBgYmFsbDIgdjogJHtiYWxsMi52ZWxvY2l0eVByb3BlcnR5LnZhbHVlfWAgKTtcclxuXHJcbiAgICAvLyBSZW1vdmUgYWxsIGNvbGxpc2lvbnMgdGhhdCBpbnZvbHZlcyBlaXRoZXIgb2YgdGhlIEJhbGxzLlxyXG4gICAgdGhpcy5pbnZhbGlkYXRlQ29sbGlzaW9ucyggYmFsbDEgKTtcclxuICAgIHRoaXMuaW52YWxpZGF0ZUNvbGxpc2lvbnMoIGJhbGwyICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIEJhbGwgVG8gQm9yZGVyIENvbGxpc2lvbnNcclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBEZXRlY3RzIGFsbCBiYWxsLXRvLWJvcmRlciBjb2xsaXNpb25zIG9mIHRoZSBCYWxsU3lzdGVtIHRoYXQgaGF2ZW4ndCBhbHJlYWR5IG9jY3VycmVkLiBBbHRob3VnaCB0dW5uZWxpbmcgZG9lc24ndFxyXG4gICAqIG9jY3VyIHdpdGggYmFsbC10by1ib3JkZXIgY29sbGlzaW9ucywgY29sbGlzaW9ucyBhcmUgc3RpbGwgZGV0ZWN0ZWQgYmVmb3JlIHRoZXkgb2NjdXIgdG8gbWlycm9yIHRoZSBhcHByb2FjaCBmb3JcclxuICAgKiBiYWxsLXRvLWJhbGwgY29sbGlzaW9ucy4gRm9yIG5ld2x5IGRldGVjdGVkIGNvbGxpc2lvbnMsIGluZm9ybWF0aW9uIGlzIGVuY2Fwc3VsYXRlZCBpbiBhIENvbGxpc2lvbiBpbnN0YW5jZS5cclxuICAgKiBOT1RFOiBuby1vcCB3aGVuIHRoZSBQbGF5QXJlYSdzIGJvcmRlciBkb2Vzbid0IHJlZmxlY3QuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBlbGFwc2VkVGltZSAtIGVsYXBzZWRUaW1lLCBiYXNlZCBvbiB3aGVyZSB0aGUgQmFsbHMgYXJlIHBvc2l0aW9uZWQgd2hlbiB0aGlzIG1ldGhvZCBpcyBjYWxsZWQuXHJcbiAgICovXHJcbiAgZGV0ZWN0QmFsbFRvQm9yZGVyQ29sbGlzaW9ucyggZWxhcHNlZFRpbWUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgZWxhcHNlZFRpbWUgPT09ICdudW1iZXInICYmIGVsYXBzZWRUaW1lID49IDAsIGBpbnZhbGlkIGVsYXBzZWRUaW1lOiAke2VsYXBzZWRUaW1lfWAgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHNjZW5lcnlMb2cuU2ltKCAnZGV0ZWN0QmFsbFRvQm9yZGVyQ29sbGlzaW9ucycgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgaWYgKCB0aGlzLnBsYXlBcmVhLnJlZmxlY3RpbmdCb3JkZXJQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgZm9yICggbGV0IGkgPSB0aGlzLmJhbGxTeXN0ZW0uYmFsbHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgICAgY29uc3QgYmFsbCA9IHRoaXMuYmFsbFN5c3RlbS5iYWxsc1sgaSBdO1xyXG5cclxuICAgICAgICAvLyBPbmx5IGRldGVjdCBuZXcgYmFsbC1ib3JkZXIgY29sbGlzaW9ucyBpZiBpdCBoYXNuJ3QgYWxyZWFkeSBiZWVuIGRldGVjdGVkLlxyXG4gICAgICAgIGlmICggIXRoaXMuaGFzQ29sbGlzaW9uQmV0d2VlbiggYmFsbCwgdGhpcy5wbGF5QXJlYSApICkge1xyXG5cclxuICAgICAgICAgIC8vIENhbGN1bGF0ZSB3aGVuIHRoZSBCYWxsIHdpbGwgY29sbGlkZSB3aXRoIHRoZSBib3JkZXIuXHJcbiAgICAgICAgICBjb25zdCBjb2xsaXNpb25UaW1lID0gdGhpcy5nZXRCb3JkZXJDb2xsaXNpb25UaW1lKCBiYWxsLnBvc2l0aW9uUHJvcGVydHkudmFsdWUsIGJhbGwudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSwgYmFsbC5yYWRpdXNQcm9wZXJ0eS52YWx1ZSwgZWxhcHNlZFRpbWUgKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBjb2xsaXNpb24gPSBDb2xsaXNpb24uY3JlYXRlRnJvbVBvb2woIGJhbGwsIHRoaXMucGxheUFyZWEsIGNvbGxpc2lvblRpbWUgKTtcclxuXHJcbiAgICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHNjZW5lcnlMb2cuU2ltKCBgYWRkaW5nIGNvbGxpc2lvbiAke2NvbGxpc2lvbn1gICk7XHJcblxyXG4gICAgICAgICAgLy8gUmVnaXN0ZXIgdGhlIGNvbGxpc2lvbiBhbmQgZW5jYXBzdWxhdGUgaW5mb3JtYXRpb24gaW4gYSBDb2xsaXNpb24gaW5zdGFuY2UuXHJcbiAgICAgICAgICB0aGlzLmNvbGxpc2lvbnMucHVzaCggY29sbGlzaW9uICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsY3VsYXRlcyB3aGVuIHNvbWUgQmFsbCB3aWxsIGNvbGxpZGUgd2l0aCB0aGUgUGxheUFyZWEncyBib3JkZXIuIEluc3RlYWQgb2YgcGFzc2luZyBpbiBhIEJhbGwgaW5zdGFuY2UsIGtleVxyXG4gICAqIGF0dHJpYnV0ZXMgb2YgdGhlIEJhbGwgYXJlIHBhc3NlZC1pbi4gVGhpcyBBUEkgaXMgcmVxdWlyZWQgZm9yIHN1Yi1jbGFzc2VzIChzZWUgSW5lbGFzdGljQ29sbGlzaW9uRW5naW5lKS5cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uIC0gdGhlIHBvc2l0aW9uIG9mIHRoZSBCYWxsLlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gdmVsb2NpdHkgLSB0aGUgdmVsb2NpdHkgb2YgdGhlIEJhbGwuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyAtIHRoZSByYWRpdXMgb2YgdGhlIEJhbGwuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVsYXBzZWRUaW1lIC0gZWxhcHNlZFRpbWUsIGJhc2VkIG9uIHdoZXJlIHRoZSBCYWxsIGlzIHBvc2l0aW9uZWQgd2hlbiB0aGlzIG1ldGhvZCBpcyBjYWxsZWQuXHJcbiAgICovXHJcbiAgZ2V0Qm9yZGVyQ29sbGlzaW9uVGltZSggcG9zaXRpb24sIHZlbG9jaXR5LCByYWRpdXMsIGVsYXBzZWRUaW1lICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcG9zaXRpb24gaW5zdGFuY2VvZiBWZWN0b3IyLCBgaW52YWxpZCBwb3NpdGlvbjogJHtwb3NpdGlvbn1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZWxvY2l0eSBpbnN0YW5jZW9mIFZlY3RvcjIsIGBpbnZhbGlkIHZlbG9jaXR5OiAke3ZlbG9jaXR5fWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiByYWRpdXMgPT09ICdudW1iZXInLCBgaW52YWxpZCByYWRpdXM6ICR7cmFkaXVzfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBlbGFwc2VkVGltZSA9PT0gJ251bWJlcicgJiYgZWxhcHNlZFRpbWUgPj0gMCwgYGludmFsaWQgZWxhcHNlZFRpbWU6ICR7ZWxhcHNlZFRpbWV9YCApO1xyXG5cclxuICAgIC8vIFJlZmVyZW5jZSB0aGUgbXVsdGlwbGllciBvZiB0aGUgdmVsb2NpdHkgb2YgdGhlIEJhbGwuIFdoZW4gdGhlIHNpbSBpcyBiZWluZyByZXZlcnNlZCAoZHQgPCAwKSwgQmFsbHMgYXJlXHJcbiAgICAvLyBlc3NlbnRpYWxseSBtb3ZpbmcgaW4gdGhlIG9wcG9zaXRlIGRpcmVjdGlvbiBvZiBpdHMgdmVsb2NpdHkgdmVjdG9yLiBGb3IgY2FsY3VsYXRpbmcgaWYgQmFsbHMgd2lsbCBjb2xsaWRlLFxyXG4gICAgLy8gcmV2ZXJzZSB0aGUgdmVsb2NpdHkgb2YgdGhlIGJhbGwgZm9yIGNvbnZlbmllbmNlIGFuZCByZXZlcnNlIHRoZSBjb2xsaXNpb25UaW1lIGJhY2sgYXQgdGhlIGVuZC5cclxuICAgIGNvbnN0IHZlbG9jaXR5TXVsdGlwaWVyID0gdGhpcy50aW1lU3RlcERpcmVjdGlvblByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIC8vIFJlZmVyZW5jZSBxdWFudGl0aWVzIG9mIHRoZSBCYWxsLlxyXG4gICAgY29uc3QgbGVmdCA9IHBvc2l0aW9uLnggLSByYWRpdXM7XHJcbiAgICBjb25zdCByaWdodCA9IHBvc2l0aW9uLnggKyByYWRpdXM7XHJcbiAgICBjb25zdCB0b3AgPSBwb3NpdGlvbi55ICsgcmFkaXVzO1xyXG4gICAgY29uc3QgYm90dG9tID0gcG9zaXRpb24ueSAtIHJhZGl1cztcclxuICAgIGNvbnN0IHhWZWxvY2l0eSA9IHZlbG9jaXR5LnggKiB2ZWxvY2l0eU11bHRpcGllcjtcclxuICAgIGNvbnN0IHlWZWxvY2l0eSA9IHZlbG9jaXR5LnkgKiB2ZWxvY2l0eU11bHRpcGllcjtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgdGhlIHRpbWUgdGhlIEJhbGwgd291bGQgY29sbGlkZSB3aXRoIGVhY2ggcmVzcGVjdGl2ZSBib3JkZXIsIGlnbm9yaW5nIGFsbCBvdGhlciB3YWxscyBmb3Igbm93LlxyXG4gICAgY29uc3QgbGVmdENvbGxpc2lvblRpbWUgPSBDb2xsaXNpb25MYWJVdGlscy5jbGFtcERvd24oIHRoaXMucGxheUFyZWEubGVmdCAtIGxlZnQgKSAvIHhWZWxvY2l0eTtcclxuICAgIGNvbnN0IHJpZ2h0Q29sbGlzaW9uVGltZSA9IENvbGxpc2lvbkxhYlV0aWxzLmNsYW1wRG93biggdGhpcy5wbGF5QXJlYS5yaWdodCAtIHJpZ2h0ICkgLyB4VmVsb2NpdHk7XHJcbiAgICBjb25zdCBib3R0b21Db2xsaXNpb25UaW1lID0gQ29sbGlzaW9uTGFiVXRpbHMuY2xhbXBEb3duKCB0aGlzLnBsYXlBcmVhLmJvdHRvbSAtIGJvdHRvbSApIC8geVZlbG9jaXR5O1xyXG4gICAgY29uc3QgdG9wQ29sbGlzaW9uVGltZSA9IENvbGxpc2lvbkxhYlV0aWxzLmNsYW1wRG93biggdGhpcy5wbGF5QXJlYS50b3AgLSB0b3AgKSAvIHlWZWxvY2l0eTtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgdGhlIHRpbWUgdGhlIEJhbGwgd291bGQgY29sbGlkZSB3aXRoIGEgaG9yaXpvbnRhbC92ZXJ0aWNhbCBib3JkZXIuXHJcbiAgICBjb25zdCBob3Jpem9udGFsQ29sbGlzaW9uVGltZSA9IE1hdGgubWF4KCBsZWZ0Q29sbGlzaW9uVGltZSwgcmlnaHRDb2xsaXNpb25UaW1lICk7XHJcbiAgICBjb25zdCB2ZXJ0aWNhbENvbGxpc2lvblRpbWUgPSBNYXRoLm1heCggYm90dG9tQ29sbGlzaW9uVGltZSwgdG9wQ29sbGlzaW9uVGltZSApO1xyXG4gICAgY29uc3QgcG9zc2libGVDb2xsaXNpb25UaW1lcyA9IFsgaG9yaXpvbnRhbENvbGxpc2lvblRpbWUsIHZlcnRpY2FsQ29sbGlzaW9uVGltZSBdLmZpbHRlciggTnVtYmVyLmlzRmluaXRlICk7XHJcblxyXG4gICAgLy8gU29sdmUgZm9yIHRoZSB0aW1lVW50aWxDb2xsaXNpb24sIHdoaWNoIGlzIHRoZSBmaXJzdCBib3JkZXIgKG1pbmltdW0gaW4gdGltZSkgdGhlIEJhbGwgd291bGQgY29sbGlkZSB3aXRoLlxyXG4gICAgY29uc3QgdGltZVVudGlsQ29sbGlzaW9uID0gTWF0aC5taW4oIC4uLnBvc3NpYmxlQ29sbGlzaW9uVGltZXMgKSAqIHZlbG9jaXR5TXVsdGlwaWVyO1xyXG5cclxuICAgIHJldHVybiBwb3NzaWJsZUNvbGxpc2lvblRpbWVzLmxlbmd0aCA/IGVsYXBzZWRUaW1lICsgdGltZVVudGlsQ29sbGlzaW9uIDogbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3BvbmRzIHRvIGFuZCBoYW5kbGVzIGEgc2luZ2xlIGJhbGwtdG8tYm9yZGVyIGNvbGxpc2lvbiBieSB1cGRhdGluZyB0aGUgdmVsb2NpdHkgb2YgdGhlIEJhbGxzIGRlcGVuZGluZyBvbiBpdHNcclxuICAgKiBvcmllbnRhdGlvbiByZWxhdGl2ZSB0byB0aGUgYm9yZGVyLiBUaGUgY29sbGlzaW9uIGFsZ29yaXRobSBmb2xsb3dzIHRoZSBzdGFuZGFyZCByaWdpZC1ib2R5IGNvbGxpc2lvbiBtb2RlbFxyXG4gICAqIGRlc2NyaWJlZCBpblxyXG4gICAqIGh0dHA6Ly93ZWIubXN0LmVkdS9+cmVmbG9yaS9iZTE1MC9EeW4lMjBMZWN0dXJlJTIwVmlkZW9zL0ltcGFjdCUyMFBhcnRpY2xlcyUyMDEvSW1wYWN0JTIwUGFydGljbGVzJTIwMS5wZGYuXHJcbiAgICpcclxuICAgKiBAcHJvdGVjdGVkIC0gY2FuIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QmFsbH0gYmFsbCAtIHRoZSBCYWxsIGludm9sdmVkIGluIHRoZSBjb2xsaXNpb24uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICovXHJcbiAgaGFuZGxlQmFsbFRvQm9yZGVyQ29sbGlzaW9uKCBiYWxsLCBkdCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJhbGwgaW5zdGFuY2VvZiBCYWxsLCBgaW52YWxpZCBiYWxsOiAke2JhbGx9YCApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5TaW0oIGBDb2xsaXNpb25FbmdpbmUuaGFuZGxlQmFsbFRvQm9yZGVyQ29sbGlzaW9uICMke2JhbGwuaW5kZXh9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNpbSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBSZWZlcmVuY2UgdGhlIG11bHRpcGxpZXIgb2YgdGhlIHZlbG9jaXR5IG9mIHRoZSBCYWxsLiBXaGVuIHRoZSBzaW0gaXMgYmVpbmcgcmV2ZXJzZWQgKGR0IDwgMCksIEJhbGxzIGFyZVxyXG4gICAgLy8gZXNzZW50aWFsbHkgbW92aW5nIGluIHRoZSBvcHBvc2l0ZSBkaXJlY3Rpb24gb2YgaXRzIHZlbG9jaXR5IHZlY3Rvci4gVGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgZGlyZWN0aW9uXHJcbiAgICAvLyB0aGF0IHRoZSBCYWxsIGlzIG1vdmluZyB0b3dhcmRzOyBldmVuIGlmIGEgQmFsbCBpcyB0b3VjaGluZyBhIHNpZGUocykgb2YgdGhlIGJvcmRlciwgaXQncyB2ZWxvY2l0eSBkb2Vzbid0IGNoYW5nZVxyXG4gICAgLy8gdW5sZXNzIGl0IGlzIG1vdmluZyB0b3dhcmRzIHRoYXQgcmVzcGVjdGl2ZSBzaWRlLlxyXG4gICAgY29uc3QgdmVsb2NpdHlNdWx0aXBsaWVyID0gdGhpcy50aW1lU3RlcERpcmVjdGlvblByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIGxldCBlbGFzdGljaXR5ID0gdGhpcy5wbGF5QXJlYS5nZXRFbGFzdGljaXR5KCk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZHQgPj0gMCB8fCBlbGFzdGljaXR5ID4gMCwgJ1dlIGNhbm5vdCBzdGVwIGJhY2t3YXJkcyB3aXRoIHplcm8gZWxhc3RpY2l0eScgKTtcclxuXHJcbiAgICBpZiAoIGR0IDwgMCApIHtcclxuICAgICAgZWxhc3RpY2l0eSA9IDEgLyBlbGFzdGljaXR5O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgdmVsb2NpdHkgYWZ0ZXIgdGhlIGNvbGxpc2lvbi5cclxuICAgIGlmICggKCB0aGlzLnBsYXlBcmVhLmlzQmFsbFRvdWNoaW5nTGVmdCggYmFsbCApICYmIGJhbGwudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZS54ICogdmVsb2NpdHlNdWx0aXBsaWVyIDwgMCApIHx8XHJcbiAgICAgICAgICggdGhpcy5wbGF5QXJlYS5pc0JhbGxUb3VjaGluZ1JpZ2h0KCBiYWxsICkgJiYgYmFsbC52ZWxvY2l0eVByb3BlcnR5LnZhbHVlLnggKiB2ZWxvY2l0eU11bHRpcGxpZXIgPiAwICkgKSB7XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU2ltICYmIHNjZW5lcnlMb2cuU2ltKCBgIyR7YmFsbC5pbmRleH0gYm9yZGVyIFggYm91bmNlYCApO1xyXG5cclxuICAgICAgLy8gTGVmdCBhbmQgUmlnaHQgYmFsbC10by1ib3JkZXIgY29sbGlzaW9ucyBpbmN1ciBhIGZsaXAgaW4gaG9yaXpvbnRhbCB2ZWxvY2l0eSwgc2NhbGVkIGJ5IHRoZSBlbGFzdGljaXR5LlxyXG4gICAgICBiYWxsLnNldFhWZWxvY2l0eSggLWJhbGwudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZS54ICogZWxhc3RpY2l0eSApO1xyXG4gICAgfVxyXG4gICAgaWYgKCAoIHRoaXMucGxheUFyZWEuaXNCYWxsVG91Y2hpbmdCb3R0b20oIGJhbGwgKSAmJiBiYWxsLnZlbG9jaXR5UHJvcGVydHkudmFsdWUueSAqIHZlbG9jaXR5TXVsdGlwbGllciA8IDAgKSB8fFxyXG4gICAgICAgICAoIHRoaXMucGxheUFyZWEuaXNCYWxsVG91Y2hpbmdUb3AoIGJhbGwgKSAmJiBiYWxsLnZlbG9jaXR5UHJvcGVydHkudmFsdWUueSAqIHZlbG9jaXR5TXVsdGlwbGllciA+IDAgKSApIHtcclxuXHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5TaW0oIGAjJHtiYWxsLmluZGV4fSBib3JkZXIgWSBib3VuY2VgICk7XHJcblxyXG4gICAgICAvLyBUb3AgYW5kIEJvdHRvbSBiYWxsLXRvLWJvcmRlciBjb2xsaXNpb25zIGluY3VyIGEgZmxpcCBpbiB2ZXJ0aWNhbCB2ZWxvY2l0eSwgc2NhbGVkIGJ5IHRoZSBlbGFzdGljaXR5LlxyXG4gICAgICBiYWxsLnNldFlWZWxvY2l0eSggLWJhbGwudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZS55ICogZWxhc3RpY2l0eSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbW92ZSBhbGwgY29sbGlzaW9ucyB0aGF0IGludm9sdmVzIHRoZSBpbnZvbHZlZCBCYWxsLlxyXG4gICAgdGhpcy5pbnZhbGlkYXRlQ29sbGlzaW9ucyggYmFsbCApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TaW0gJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbGxpc2lvbkxhYi5yZWdpc3RlciggJ0NvbGxpc2lvbkVuZ2luZScsIENvbGxpc2lvbkVuZ2luZSApO1xyXG5leHBvcnQgZGVmYXVsdCBDb2xsaXNpb25FbmdpbmU7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7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