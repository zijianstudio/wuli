// Copyright 2020-2022, University of Colorado Boulder

/**
 * BallSystem is the model for an isolated system of different Ball objects. It is the complete collection of Balls,
 * both inside and outside the PlayArea.
 *
 * BallSystem is responsible for:
 *   - Keeping track of the system of Balls and the number of Balls in the system.
 *   - Creating a reference to all possible Balls in prepopulatedBalls. The same Ball instances are used with the same
 *     number of Balls, so Balls are created here at the start of the sim.
 *   - CenterOfMass model instantiation for the system of Balls.
 *   - Keeping track of the total kinetic energy of the system.
 *   - Tracking the visibility of trailing 'Paths' in a Property.
 *   - Tracking if there are any Balls that are being controlled by the user.
 *   - Tracking if the Balls in the system are inside of the PlayArea.
 *
 * BallSystems are created at the start of the sim and are never disposed, so no dispose method is necessary and links
 * are left as-is.
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import pairs from '../../../../phet-core/js/pairs.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CollisionLabUtils from '../CollisionLabUtils.js';
import Ball from './Ball.js';
import BallState from './BallState.js';
import BallUtils from './BallUtils.js';
import CenterOfMass from './CenterOfMass.js';
import PlayArea from './PlayArea.js';
class BallSystem {
  /**
   * @param {BallState[]} initialBallStates - the initial BallStates of ALL possible Balls in the system.
   * @param {PlayArea} playArea
   * @param {Object} [options]
   */
  constructor(initialBallStates, playArea, options) {
    assert && AssertUtils.assertArrayOf(initialBallStates, BallState);
    assert && assert(playArea instanceof PlayArea, `invalid playArea: ${playArea}`);
    options = merge({
      // {RangeWithValue} - the range of the number of Balls in the system.
      numberOfBallsRange: new RangeWithValue(1, 4, 2),
      // {boolean} - indicates if the trailing 'Paths' are visible initially.
      pathsVisibleInitially: false
    }, options);
    assert && assert(options.numberOfBallsRange.max === initialBallStates.length);

    // @private {PlayArea}
    this.playArea = playArea;

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Range} - reference to the numeric Range of the number of balls in the system.
    this.numberOfBallsRange = options.numberOfBallsRange;

    // @public {Property.<boolean>} - indicates if Ball sizes (radii) are constant (ie. independent of mass). This Property
    //                             is manipulated externally in the view.
    this.ballsConstantSizeProperty = new BooleanProperty(false);

    // @public {Property.<boolean>} - indicates if the Ball and center of mass trailing 'paths' are visible. This is in the
    //                             model since paths only show the path of the moving object after the visibility
    //                             checkbox is checked and are empty when false.
    this.pathsVisibleProperty = new BooleanProperty(options.pathsVisibleInitially);

    // @public {Property.<boolean>} - indicates if the center of mass is visible. This is in the model since the
    //                             CenterOfMass's trailing 'Path' is empty if this is false and PathDataPoints for
    //                             the CenterOfMass are only recorded if this is true and paths are visible.
    this.centerOfMassVisibleProperty = new BooleanProperty(false);

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Balls[]} - an array of all possible balls. Balls are created at the start of the Simulation
    //                                 and are never disposed. However, these Balls are NOT necessarily the Balls
    //                                 currently in the system. This is just used so that the same Ball instances are
    //                                 used with the same number of balls.
    this.prepopulatedBalls = initialBallStates.map((ballState, index) => new Ball(ballState, playArea, this.ballsConstantSizeProperty, this.pathsVisibleProperty, index + 1));

    //----------------------------------------------------------------------------------------

    // @public {Property.<number>} - Property of the number of Balls in the system. This Property is manipulated
    //                            externally in the view.
    this.numberOfBallsProperty = new NumberProperty(options.numberOfBallsRange.defaultValue, {
      numberType: 'Integer',
      range: options.numberOfBallsRange
    });

    // @public (read-only) {ObservableArrayDef.<Ball>} - an array of the balls currently within the system. Balls **must** be
    //                                          from prepopulatedBalls. Its length should match the
    //                                          numberOfBallsProperty's value.
    this.balls = createObservableArray({
      valueType: Ball
    });

    // Observe when the number of Balls is manipulated by the user and, if so, add or remove the correct number of Balls
    // to match the numberOfBallsProperty's value. The same Balls are in the system with the same number of Balls value.
    // Link is never disposed as BallSystems are never disposed.
    this.numberOfBallsProperty.link(this.updateBalls.bind(this));
    this.numberOfBallsProperty.lazyLink((newQuantity, oldQuantity) => {
      if (newQuantity > oldQuantity) {
        this.balls.slice(oldQuantity).forEach(ball => this.bumpBallAwayFromOthers(ball));
        this.tryToSaveBallStates();
      }
    });

    //----------------------------------------------------------------------------------------

    // @public (read-only) {CenterOfMass} - the center of mass of the system of Balls.
    this.centerOfMass = new CenterOfMass(this.prepopulatedBalls, this.balls, this.centerOfMassVisibleProperty, this.pathsVisibleProperty);

    // @public {Property.<number>} - the total kinetic energy of the system of balls.
    //
    // For the dependencies, we use:
    //  - mass and velocity Properties of the all Balls. Only the balls in the system are used for the calculation.
    //  - balls.lengthProperty, since removing or adding a Ball changes the total kinetic energy of the system.
    //
    // This DerivedProperty is never disposed and lasts for the lifetime of the sim.
    this.totalKineticEnergyProperty = new DerivedProperty([this.balls.lengthProperty, ...this.prepopulatedBalls.map(ball => ball.massProperty), ...this.prepopulatedBalls.map(ball => ball.velocityProperty)], () => BallUtils.getTotalKineticEnergy(this.balls), {
      valueType: 'number',
      isValidValue: value => value >= 0
    });

    // @public {Property.<boolean>} - indicates if there are any Balls that are being controlled. Uses the
    //                                       userControlledProperty of all possible Balls as dependencies but only the
    //                                       Balls in the system are considered in the derivation function.
    this.ballSystemUserControlledProperty = new DerivedProperty(this.prepopulatedBalls.map(ball => ball.userControlledProperty), () => this.balls.some(ball => ball.userControlledProperty.value), {
      valueType: 'boolean'
    });

    // @public {Property.<boolean>} - indicates if all of the Balls in the system are NOT inside of the PlayArea.
    //                                       Uses the insidePlayAreaProperty of all possible Balls but only the Balls in
    //                                       the system are considered in the derivation function.
    this.ballsNotInsidePlayAreaProperty = new DerivedProperty([this.balls.lengthProperty, ...this.prepopulatedBalls.map(ball => ball.insidePlayAreaProperty)], length => this.balls.every(ball => !ball.insidePlayAreaProperty.value), {
      valueType: 'boolean'
    });

    //----------------------------------------------------------------------------------------

    // Observe when Balls are removed from the system and clear their trailing Paths. Listener lasts for the life-time
    // of the simulation since BallSystems are never disposed.
    this.balls.elementRemovedEmitter.addListener(ball => {
      ball.path.clear();
      this.tryToSaveBallStates();
    });

    // Observe when Balls are added to the system and save the states of all balls in the system. Listener lasts for the
    // life-time of the simulation since BallSystems are never disposed.
    this.balls.elementAddedEmitter.addListener(ball => {
      this.balls.every(ball => ball.insidePlayAreaProperty.value) && this.balls.forEach(ball => ball.saveState());
      this.tryToSaveBallStates();
    });

    // Observe when the user is done controlling any of the Balls to:
    //   1. Save the states of all Balls if every ball is inside the PlayArea's bounds.
    //   2. Clear the trailing Paths of all Balls and the Path of the CenterOfMass.
    //   3. Reset the rotation of Balls relative to their centers.
    //
    // Link lasts for the life-time of the sim as BallSystems are never disposed.
    this.ballSystemUserControlledProperty.lazyLink(this.tryToSaveBallStates.bind(this));
    playArea.elasticityPercentProperty.lazyLink(this.tryToSaveBallStates.bind(this));
    this.ballsConstantSizeProperty.lazyLink(() => {
      this.balls.forEach(ball => this.bumpBallAwayFromOthers(ball));
      this.tryToSaveBallStates();
    });
  }

  /**
   * Resets the BallSystem.
   * @public
   *
   * Called when the reset-all button is pressed.
   */
  reset() {
    this.ballsConstantSizeProperty.reset();
    this.centerOfMassVisibleProperty.reset();
    this.pathsVisibleProperty.reset();
    this.numberOfBallsProperty.reset();
    this.prepopulatedBalls.forEach(ball => {
      ball.reset();
    }); // Reset All Possible Balls.
    this.centerOfMass.reset();
  }

  /**
   * Restarts the BallSystem.
   * @public
   *
   * See https://github.com/phetsims/collision-lab/issues/76 for context on the differences between reset and restart.
   */
  restart() {
    this.balls.forEach(ball => {
      ball.restart();
    });

    // Reset the center-of-mass.
    this.centerOfMass.reset();
  }

  /**
   * Moves every Ball currently in the system by one time-step, assuming that the Ball is in uniform-motion.
   * @public
   *
   * @param {number} dt - time in seconds
   * @param {number} elapsedTime - the total elapsed elapsedTime of the simulation, in seconds.
   */
  stepUniformMotion(dt, elapsedTime) {
    assert && assert(typeof dt === 'number', `invalid dt: ${dt}`);
    assert && assert(typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}`);
    for (let i = 0; i < this.balls.length; i++) {
      this.balls[i].stepUniformMotion(dt);
    }

    // Update the trailing 'Paths' of all Balls in the system and the CenterOfMass.
    this.updatePaths(elapsedTime);
  }

  /**
   * Attempts to save ball states
   * @private
   */
  tryToSaveBallStates() {
    if (!this.ballSystemUserControlledProperty.value && this.balls.every(ball => ball.insidePlayAreaProperty.value)) {
      this.balls.forEach(ball => {
        // Save the state of each Ball.
        ball.insidePlayAreaProperty.value && ball.saveState();
        ball.path.clear();
        ball.rotationProperty.reset();
      });
      this.centerOfMass.path.clear();
    }
  }

  /**
   * Updates the trailing 'Paths' of all Balls in the system and the trailing 'Path' of the CenterOfMass.
   * @public
   *
   * @param {number} elapsedTime - the total elapsed elapsedTime of the simulation, in seconds.
   */
  updatePaths(elapsedTime) {
    assert && assert(typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}`);
    for (let i = 0; i < this.balls.length; i++) {
      this.balls[i].path.updatePath(elapsedTime);
    }
    this.centerOfMass.path.updatePath(elapsedTime);
  }

  /**
   * @public
   *
   * @param {Ball} ball
   */
  bumpBallIntoPlayArea(ball) {
    // Don't bump balls into the play area if there is no reflecting border, see
    // https://github.com/phetsims/collision-lab/issues/206
    if (this.playArea.reflectingBorderProperty.value) {
      ball.positionProperty.value = ball.playArea.bounds.eroded(ball.radiusProperty.value).closestPointTo(ball.positionProperty.value);
    }
    this.tryToSaveBallStates();
  }

  /**
   * Bumps a ball way from the other balls/borders in the system that it is currently overlapping with. The 'bumped'
   * ball will be placed to a position adjacent to the other Balls. This method does nothing if the Ball isn't
   * overlapping with anything. See https://github.com/phetsims/collision-lab/issues/100 and
   * https://github.com/phetsims/collision-lab/issues/167.
   *
   * This is called when the user is finished controlling the radius or the position of the Ball, either through the
   * Keypad or by dragging the Ball, that now overlaps with another Ball. It was decided that it was most natural and
   * smooth to 'bump' Balls away after the user interaction, instead of continually invoking this method as the user
   * is dragging the ball. Only the ball that the user was controlling will get 'Bumped' away, and won't affect the
   * position of the other Balls.
   *
   * Rather than observing when specific user-controlled properties are set to false to invoke this method, it is
   * instead invoked in the view. We do this because, currently, the model pauses the sim when the user is controlling
   * a Ball and plays the sim again when the user is finished. This is achieved through axon Properties. However, Balls
   * should be 'bumped' away **before** playing the model, which can be guaranteed by bumping first then setting the
   * specific user-controlled Properties to false without depending on the order of listeners.
   *
   * @public
   * @param {Ball} ball - the Ball that was just user-controlled and should be 'bumped' away.
   */
  bumpBallAwayFromOthers(ball) {
    assert && assert(ball instanceof Ball && this.balls.includes(ball), `invalid ball: ${ball}`);
    this.bumpBallIntoPlayArea(ball);

    // Flag that points to the closest Ball that overlaps with the passed-in Ball. Will be undefined if no other balls
    // are overlapping with the passed-in Ball.
    let overlappingBall = BallUtils.getClosestOverlappingBall(ball, this.balls);

    // Array of the overlappingBalls that we have 'bumped' away from. This is used to break infinite loops.
    const bumpedAwayFromBalls = [];
    let count = 0;

    // We use a while loop to fully ensure that the Ball isn't overlapping with any other Balls in scenarios where Balls
    // are placed in the middle of a cluster, and 'bumping' a Ball may lead to it overlapping with another Ball.
    while (overlappingBall) {
      // Get the DirectionVector, which is the unit vector from the center of the overlappingBall that points in the
      // direction of the passed-in Ball. Account for a scenario when Balls are placed exactly concentrically on-top of
      // each other.
      const directionVector = !ball.positionProperty.value.equals(overlappingBall.positionProperty.value) ? ball.positionProperty.value.minus(overlappingBall.positionProperty.value).normalize() : Vector2.X_UNIT.copy();

      // Round the direction vector to match the displayed value on drag-release. See
      // https://github.com/phetsims/collision-lab/issues/136.
      CollisionLabUtils.roundUpVectorToNearest(directionVector, 10 ** -CollisionLabConstants.DISPLAY_DECIMAL_PLACES);

      // If we have already bumped away from the overlappingBall, reverse the directionVector.
      bumpedAwayFromBalls.includes(overlappingBall) && directionVector.multiply(-1);

      // If trying each side of the ball doesn't work (because they might be both overlapping with a border), try
      // a random direction.
      if (bumpedAwayFromBalls.length > 5) {
        if (ball.positionProperty.value.y === 0) {
          directionVector.setXY(dotRandom.nextBoolean() ? 1 : -1, 0);
        } else {
          directionVector.rotate(2 * Math.PI * dotRandom.nextDouble());
        }
      }

      // Move the Ball next to the overlappingBall, using the directionVector.
      BallUtils.moveBallNextToBall(ball, overlappingBall, directionVector);
      this.bumpBallIntoPlayArea(ball);

      // Recompute the overlappingBall for the next iteration.
      bumpedAwayFromBalls.push(overlappingBall);
      overlappingBall = BallUtils.getClosestOverlappingBall(ball, this.balls);
      if (overlappingBall && ++count > 10) {
        this.repelBalls();
        overlappingBall = false;
      }
    }

    // Sanity check that the Ball is now not overlapping with any other Balls.
    assert && assert(!BallUtils.getClosestOverlappingBall(ball, this.balls));
    this.tryToSaveBallStates();
  }

  /**
   * Causes all balls to repel from each other, while staying inside the boundaries.
   * @private
   */
  repelBalls() {
    let hadOverlap = true;
    const ballPairs = pairs(this.balls);
    while (hadOverlap) {
      hadOverlap = false;
      ballPairs.forEach(pair => {
        if (BallUtils.areBallsOverlapping(pair[0], pair[1])) {
          hadOverlap = true;
          const directionVector = !pair[0].positionProperty.value.equals(pair[1].positionProperty.value) ? pair[0].positionProperty.value.minus(pair[1].positionProperty.value).normalize() : Vector2.X_UNIT.copy();
          let pair0Position = pair[0].positionProperty.value.plus(
          // Slow bump away
          directionVector.timesScalar(0.05));
          let pair1Position = pair[1].positionProperty.value.plus(
          // Slow bump away
          directionVector.timesScalar(-0.05));

          // Don't bump balls into the play area if there is no reflecting border, see
          // https://github.com/phetsims/collision-lab/issues/206
          if (this.playArea.reflectingBorderProperty.value) {
            pair0Position = pair[0].playArea.bounds.eroded(pair[0].radiusProperty.value).closestPointTo(pair0Position);
            pair1Position = pair[1].playArea.bounds.eroded(pair[1].radiusProperty.value).closestPointTo(pair1Position);
          }
          pair[0].positionProperty.value = pair0Position;
          pair[1].positionProperty.value = pair1Position;
        }
      });
    }
  }

  /**
   * Updates the Balls in the BallSystem to match the numberOfBallsProperty's value. If the Balls are out of sync, this
   * method will add or remove (but not dispose) the correct number of Balls from the system.
   * @private
   *
   * Called when the user changes the number of balls in the system.
   */
  updateBalls() {
    // If the number of balls is greater than the Balls currently in the system, Balls need to be added to the system.
    if (this.numberOfBallsProperty.value > this.balls.length) {
      // Add the correct number of Balls, referencing an index of the prepopulatedBalls so that the same Balls are
      // added with the same numberOfBallsProperty value.
      for (let i = this.balls.length; i < this.numberOfBallsProperty.value; i++) {
        this.balls.push(this.prepopulatedBalls[i]);
      }
    } else {
      // Otherwise, the number of balls in the system is greater than numberOfBallsProperty value, meaning Balls need
      // to be removed. Remove the correct number of Balls from the end of the system.
      while (this.balls.length !== this.numberOfBallsProperty.value) {
        this.balls.pop();
      }
    }

    // Verify that Balls are in ascending order by their indices, if assertions are enabled.
    assert && assert(CollisionLabUtils.isSorted(this.balls, ball => ball.index));
  }
}
collisionLab.register('BallSystem', BallSystem);
export default BallSystem;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIlJhbmdlV2l0aFZhbHVlIiwiVmVjdG9yMiIsIm1lcmdlIiwicGFpcnMiLCJBc3NlcnRVdGlscyIsImNvbGxpc2lvbkxhYiIsIkNvbGxpc2lvbkxhYkNvbnN0YW50cyIsIkNvbGxpc2lvbkxhYlV0aWxzIiwiQmFsbCIsIkJhbGxTdGF0ZSIsIkJhbGxVdGlscyIsIkNlbnRlck9mTWFzcyIsIlBsYXlBcmVhIiwiQmFsbFN5c3RlbSIsImNvbnN0cnVjdG9yIiwiaW5pdGlhbEJhbGxTdGF0ZXMiLCJwbGF5QXJlYSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJhc3NlcnRBcnJheU9mIiwibnVtYmVyT2ZCYWxsc1JhbmdlIiwicGF0aHNWaXNpYmxlSW5pdGlhbGx5IiwibWF4IiwibGVuZ3RoIiwiYmFsbHNDb25zdGFudFNpemVQcm9wZXJ0eSIsInBhdGhzVmlzaWJsZVByb3BlcnR5IiwiY2VudGVyT2ZNYXNzVmlzaWJsZVByb3BlcnR5IiwicHJlcG9wdWxhdGVkQmFsbHMiLCJtYXAiLCJiYWxsU3RhdGUiLCJpbmRleCIsIm51bWJlck9mQmFsbHNQcm9wZXJ0eSIsImRlZmF1bHRWYWx1ZSIsIm51bWJlclR5cGUiLCJyYW5nZSIsImJhbGxzIiwidmFsdWVUeXBlIiwibGluayIsInVwZGF0ZUJhbGxzIiwiYmluZCIsImxhenlMaW5rIiwibmV3UXVhbnRpdHkiLCJvbGRRdWFudGl0eSIsInNsaWNlIiwiZm9yRWFjaCIsImJhbGwiLCJidW1wQmFsbEF3YXlGcm9tT3RoZXJzIiwidHJ5VG9TYXZlQmFsbFN0YXRlcyIsImNlbnRlck9mTWFzcyIsInRvdGFsS2luZXRpY0VuZXJneVByb3BlcnR5IiwibGVuZ3RoUHJvcGVydHkiLCJtYXNzUHJvcGVydHkiLCJ2ZWxvY2l0eVByb3BlcnR5IiwiZ2V0VG90YWxLaW5ldGljRW5lcmd5IiwiaXNWYWxpZFZhbHVlIiwidmFsdWUiLCJiYWxsU3lzdGVtVXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJzb21lIiwiYmFsbHNOb3RJbnNpZGVQbGF5QXJlYVByb3BlcnR5IiwiaW5zaWRlUGxheUFyZWFQcm9wZXJ0eSIsImV2ZXJ5IiwiZWxlbWVudFJlbW92ZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJwYXRoIiwiY2xlYXIiLCJlbGVtZW50QWRkZWRFbWl0dGVyIiwic2F2ZVN0YXRlIiwiZWxhc3RpY2l0eVBlcmNlbnRQcm9wZXJ0eSIsInJlc2V0IiwicmVzdGFydCIsInN0ZXBVbmlmb3JtTW90aW9uIiwiZHQiLCJlbGFwc2VkVGltZSIsImkiLCJ1cGRhdGVQYXRocyIsInJvdGF0aW9uUHJvcGVydHkiLCJ1cGRhdGVQYXRoIiwiYnVtcEJhbGxJbnRvUGxheUFyZWEiLCJyZWZsZWN0aW5nQm9yZGVyUHJvcGVydHkiLCJwb3NpdGlvblByb3BlcnR5IiwiYm91bmRzIiwiZXJvZGVkIiwicmFkaXVzUHJvcGVydHkiLCJjbG9zZXN0UG9pbnRUbyIsImluY2x1ZGVzIiwib3ZlcmxhcHBpbmdCYWxsIiwiZ2V0Q2xvc2VzdE92ZXJsYXBwaW5nQmFsbCIsImJ1bXBlZEF3YXlGcm9tQmFsbHMiLCJjb3VudCIsImRpcmVjdGlvblZlY3RvciIsImVxdWFscyIsIm1pbnVzIiwibm9ybWFsaXplIiwiWF9VTklUIiwiY29weSIsInJvdW5kVXBWZWN0b3JUb05lYXJlc3QiLCJESVNQTEFZX0RFQ0lNQUxfUExBQ0VTIiwibXVsdGlwbHkiLCJ5Iiwic2V0WFkiLCJuZXh0Qm9vbGVhbiIsInJvdGF0ZSIsIk1hdGgiLCJQSSIsIm5leHREb3VibGUiLCJtb3ZlQmFsbE5leHRUb0JhbGwiLCJwdXNoIiwicmVwZWxCYWxscyIsImhhZE92ZXJsYXAiLCJiYWxsUGFpcnMiLCJwYWlyIiwiYXJlQmFsbHNPdmVybGFwcGluZyIsInBhaXIwUG9zaXRpb24iLCJwbHVzIiwidGltZXNTY2FsYXIiLCJwYWlyMVBvc2l0aW9uIiwicG9wIiwiaXNTb3J0ZWQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJhbGxTeXN0ZW0uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQmFsbFN5c3RlbSBpcyB0aGUgbW9kZWwgZm9yIGFuIGlzb2xhdGVkIHN5c3RlbSBvZiBkaWZmZXJlbnQgQmFsbCBvYmplY3RzLiBJdCBpcyB0aGUgY29tcGxldGUgY29sbGVjdGlvbiBvZiBCYWxscyxcclxuICogYm90aCBpbnNpZGUgYW5kIG91dHNpZGUgdGhlIFBsYXlBcmVhLlxyXG4gKlxyXG4gKiBCYWxsU3lzdGVtIGlzIHJlc3BvbnNpYmxlIGZvcjpcclxuICogICAtIEtlZXBpbmcgdHJhY2sgb2YgdGhlIHN5c3RlbSBvZiBCYWxscyBhbmQgdGhlIG51bWJlciBvZiBCYWxscyBpbiB0aGUgc3lzdGVtLlxyXG4gKiAgIC0gQ3JlYXRpbmcgYSByZWZlcmVuY2UgdG8gYWxsIHBvc3NpYmxlIEJhbGxzIGluIHByZXBvcHVsYXRlZEJhbGxzLiBUaGUgc2FtZSBCYWxsIGluc3RhbmNlcyBhcmUgdXNlZCB3aXRoIHRoZSBzYW1lXHJcbiAqICAgICBudW1iZXIgb2YgQmFsbHMsIHNvIEJhbGxzIGFyZSBjcmVhdGVkIGhlcmUgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzaW0uXHJcbiAqICAgLSBDZW50ZXJPZk1hc3MgbW9kZWwgaW5zdGFudGlhdGlvbiBmb3IgdGhlIHN5c3RlbSBvZiBCYWxscy5cclxuICogICAtIEtlZXBpbmcgdHJhY2sgb2YgdGhlIHRvdGFsIGtpbmV0aWMgZW5lcmd5IG9mIHRoZSBzeXN0ZW0uXHJcbiAqICAgLSBUcmFja2luZyB0aGUgdmlzaWJpbGl0eSBvZiB0cmFpbGluZyAnUGF0aHMnIGluIGEgUHJvcGVydHkuXHJcbiAqICAgLSBUcmFja2luZyBpZiB0aGVyZSBhcmUgYW55IEJhbGxzIHRoYXQgYXJlIGJlaW5nIGNvbnRyb2xsZWQgYnkgdGhlIHVzZXIuXHJcbiAqICAgLSBUcmFja2luZyBpZiB0aGUgQmFsbHMgaW4gdGhlIHN5c3RlbSBhcmUgaW5zaWRlIG9mIHRoZSBQbGF5QXJlYS5cclxuICpcclxuICogQmFsbFN5c3RlbXMgYXJlIGNyZWF0ZWQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzaW0gYW5kIGFyZSBuZXZlciBkaXNwb3NlZCwgc28gbm8gZGlzcG9zZSBtZXRob2QgaXMgbmVjZXNzYXJ5IGFuZCBsaW5rc1xyXG4gKiBhcmUgbGVmdCBhcy1pcy5cclxuICpcclxuICogQGF1dGhvciBCcmFuZG9uIExpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgUmFuZ2VXaXRoVmFsdWUgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlV2l0aFZhbHVlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHBhaXJzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9wYWlycy5qcyc7XHJcbmltcG9ydCBBc3NlcnRVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL0Fzc2VydFV0aWxzLmpzJztcclxuaW1wb3J0IGNvbGxpc2lvbkxhYiBmcm9tICcuLi8uLi9jb2xsaXNpb25MYWIuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGFiQ29uc3RhbnRzIGZyb20gJy4uL0NvbGxpc2lvbkxhYkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJVdGlscyBmcm9tICcuLi9Db2xsaXNpb25MYWJVdGlscy5qcyc7XHJcbmltcG9ydCBCYWxsIGZyb20gJy4vQmFsbC5qcyc7XHJcbmltcG9ydCBCYWxsU3RhdGUgZnJvbSAnLi9CYWxsU3RhdGUuanMnO1xyXG5pbXBvcnQgQmFsbFV0aWxzIGZyb20gJy4vQmFsbFV0aWxzLmpzJztcclxuaW1wb3J0IENlbnRlck9mTWFzcyBmcm9tICcuL0NlbnRlck9mTWFzcy5qcyc7XHJcbmltcG9ydCBQbGF5QXJlYSBmcm9tICcuL1BsYXlBcmVhLmpzJztcclxuXHJcbmNsYXNzIEJhbGxTeXN0ZW0ge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0JhbGxTdGF0ZVtdfSBpbml0aWFsQmFsbFN0YXRlcyAtIHRoZSBpbml0aWFsIEJhbGxTdGF0ZXMgb2YgQUxMIHBvc3NpYmxlIEJhbGxzIGluIHRoZSBzeXN0ZW0uXHJcbiAgICogQHBhcmFtIHtQbGF5QXJlYX0gcGxheUFyZWFcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGluaXRpYWxCYWxsU3RhdGVzLCBwbGF5QXJlYSwgb3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBBc3NlcnRVdGlscy5hc3NlcnRBcnJheU9mKCBpbml0aWFsQmFsbFN0YXRlcywgQmFsbFN0YXRlICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwbGF5QXJlYSBpbnN0YW5jZW9mIFBsYXlBcmVhLCBgaW52YWxpZCBwbGF5QXJlYTogJHtwbGF5QXJlYX1gICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyB7UmFuZ2VXaXRoVmFsdWV9IC0gdGhlIHJhbmdlIG9mIHRoZSBudW1iZXIgb2YgQmFsbHMgaW4gdGhlIHN5c3RlbS5cclxuICAgICAgbnVtYmVyT2ZCYWxsc1JhbmdlOiBuZXcgUmFuZ2VXaXRoVmFsdWUoIDEsIDQsIDIgKSxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIGluZGljYXRlcyBpZiB0aGUgdHJhaWxpbmcgJ1BhdGhzJyBhcmUgdmlzaWJsZSBpbml0aWFsbHkuXHJcbiAgICAgIHBhdGhzVmlzaWJsZUluaXRpYWxseTogZmFsc2VcclxuXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5udW1iZXJPZkJhbGxzUmFuZ2UubWF4ID09PSBpbml0aWFsQmFsbFN0YXRlcy5sZW5ndGggKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7UGxheUFyZWF9XHJcbiAgICB0aGlzLnBsYXlBcmVhID0gcGxheUFyZWE7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7UmFuZ2V9IC0gcmVmZXJlbmNlIHRvIHRoZSBudW1lcmljIFJhbmdlIG9mIHRoZSBudW1iZXIgb2YgYmFsbHMgaW4gdGhlIHN5c3RlbS5cclxuICAgIHRoaXMubnVtYmVyT2ZCYWxsc1JhbmdlID0gb3B0aW9ucy5udW1iZXJPZkJhbGxzUmFuZ2U7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSAtIGluZGljYXRlcyBpZiBCYWxsIHNpemVzIChyYWRpaSkgYXJlIGNvbnN0YW50IChpZS4gaW5kZXBlbmRlbnQgb2YgbWFzcykuIFRoaXMgUHJvcGVydHlcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpcyBtYW5pcHVsYXRlZCBleHRlcm5hbGx5IGluIHRoZSB2aWV3LlxyXG4gICAgdGhpcy5iYWxsc0NvbnN0YW50U2l6ZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IC0gaW5kaWNhdGVzIGlmIHRoZSBCYWxsIGFuZCBjZW50ZXIgb2YgbWFzcyB0cmFpbGluZyAncGF0aHMnIGFyZSB2aXNpYmxlLiBUaGlzIGlzIGluIHRoZVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsIHNpbmNlIHBhdGhzIG9ubHkgc2hvdyB0aGUgcGF0aCBvZiB0aGUgbW92aW5nIG9iamVjdCBhZnRlciB0aGUgdmlzaWJpbGl0eVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrYm94IGlzIGNoZWNrZWQgYW5kIGFyZSBlbXB0eSB3aGVuIGZhbHNlLlxyXG4gICAgdGhpcy5wYXRoc1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIG9wdGlvbnMucGF0aHNWaXNpYmxlSW5pdGlhbGx5ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSAtIGluZGljYXRlcyBpZiB0aGUgY2VudGVyIG9mIG1hc3MgaXMgdmlzaWJsZS4gVGhpcyBpcyBpbiB0aGUgbW9kZWwgc2luY2UgdGhlXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2VudGVyT2ZNYXNzJ3MgdHJhaWxpbmcgJ1BhdGgnIGlzIGVtcHR5IGlmIHRoaXMgaXMgZmFsc2UgYW5kIFBhdGhEYXRhUG9pbnRzIGZvclxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBDZW50ZXJPZk1hc3MgYXJlIG9ubHkgcmVjb3JkZWQgaWYgdGhpcyBpcyB0cnVlIGFuZCBwYXRocyBhcmUgdmlzaWJsZS5cclxuICAgIHRoaXMuY2VudGVyT2ZNYXNzVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtCYWxsc1tdfSAtIGFuIGFycmF5IG9mIGFsbCBwb3NzaWJsZSBiYWxscy4gQmFsbHMgYXJlIGNyZWF0ZWQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBTaW11bGF0aW9uXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZCBhcmUgbmV2ZXIgZGlzcG9zZWQuIEhvd2V2ZXIsIHRoZXNlIEJhbGxzIGFyZSBOT1QgbmVjZXNzYXJpbHkgdGhlIEJhbGxzXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRseSBpbiB0aGUgc3lzdGVtLiBUaGlzIGlzIGp1c3QgdXNlZCBzbyB0aGF0IHRoZSBzYW1lIEJhbGwgaW5zdGFuY2VzIGFyZVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VkIHdpdGggdGhlIHNhbWUgbnVtYmVyIG9mIGJhbGxzLlxyXG4gICAgdGhpcy5wcmVwb3B1bGF0ZWRCYWxscyA9IGluaXRpYWxCYWxsU3RhdGVzLm1hcCggKCBiYWxsU3RhdGUsIGluZGV4ICkgPT4gbmV3IEJhbGwoXHJcbiAgICAgIGJhbGxTdGF0ZSxcclxuICAgICAgcGxheUFyZWEsXHJcbiAgICAgIHRoaXMuYmFsbHNDb25zdGFudFNpemVQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5wYXRoc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgaW5kZXggKyAxXHJcbiAgICApICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IC0gUHJvcGVydHkgb2YgdGhlIG51bWJlciBvZiBCYWxscyBpbiB0aGUgc3lzdGVtLiBUaGlzIFByb3BlcnR5IGlzIG1hbmlwdWxhdGVkXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlcm5hbGx5IGluIHRoZSB2aWV3LlxyXG4gICAgdGhpcy5udW1iZXJPZkJhbGxzUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIG9wdGlvbnMubnVtYmVyT2ZCYWxsc1JhbmdlLmRlZmF1bHRWYWx1ZSwge1xyXG4gICAgICBudW1iZXJUeXBlOiAnSW50ZWdlcicsXHJcbiAgICAgIHJhbmdlOiBvcHRpb25zLm51bWJlck9mQmFsbHNSYW5nZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge09ic2VydmFibGVBcnJheURlZi48QmFsbD59IC0gYW4gYXJyYXkgb2YgdGhlIGJhbGxzIGN1cnJlbnRseSB3aXRoaW4gdGhlIHN5c3RlbS4gQmFsbHMgKiptdXN0KiogYmVcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSBwcmVwb3B1bGF0ZWRCYWxscy4gSXRzIGxlbmd0aCBzaG91bGQgbWF0Y2ggdGhlXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWJlck9mQmFsbHNQcm9wZXJ0eSdzIHZhbHVlLlxyXG4gICAgdGhpcy5iYWxscyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSggeyB2YWx1ZVR5cGU6IEJhbGwgfSApO1xyXG5cclxuICAgIC8vIE9ic2VydmUgd2hlbiB0aGUgbnVtYmVyIG9mIEJhbGxzIGlzIG1hbmlwdWxhdGVkIGJ5IHRoZSB1c2VyIGFuZCwgaWYgc28sIGFkZCBvciByZW1vdmUgdGhlIGNvcnJlY3QgbnVtYmVyIG9mIEJhbGxzXHJcbiAgICAvLyB0byBtYXRjaCB0aGUgbnVtYmVyT2ZCYWxsc1Byb3BlcnR5J3MgdmFsdWUuIFRoZSBzYW1lIEJhbGxzIGFyZSBpbiB0aGUgc3lzdGVtIHdpdGggdGhlIHNhbWUgbnVtYmVyIG9mIEJhbGxzIHZhbHVlLlxyXG4gICAgLy8gTGluayBpcyBuZXZlciBkaXNwb3NlZCBhcyBCYWxsU3lzdGVtcyBhcmUgbmV2ZXIgZGlzcG9zZWQuXHJcbiAgICB0aGlzLm51bWJlck9mQmFsbHNQcm9wZXJ0eS5saW5rKCB0aGlzLnVwZGF0ZUJhbGxzLmJpbmQoIHRoaXMgKSApO1xyXG5cclxuICAgIHRoaXMubnVtYmVyT2ZCYWxsc1Byb3BlcnR5LmxhenlMaW5rKCAoIG5ld1F1YW50aXR5LCBvbGRRdWFudGl0eSApID0+IHtcclxuICAgICAgaWYgKCBuZXdRdWFudGl0eSA+IG9sZFF1YW50aXR5ICkge1xyXG4gICAgICAgIHRoaXMuYmFsbHMuc2xpY2UoIG9sZFF1YW50aXR5ICkuZm9yRWFjaCggYmFsbCA9PiB0aGlzLmJ1bXBCYWxsQXdheUZyb21PdGhlcnMoIGJhbGwgKSApO1xyXG4gICAgICAgIHRoaXMudHJ5VG9TYXZlQmFsbFN0YXRlcygpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7Q2VudGVyT2ZNYXNzfSAtIHRoZSBjZW50ZXIgb2YgbWFzcyBvZiB0aGUgc3lzdGVtIG9mIEJhbGxzLlxyXG4gICAgdGhpcy5jZW50ZXJPZk1hc3MgPSBuZXcgQ2VudGVyT2ZNYXNzKFxyXG4gICAgICB0aGlzLnByZXBvcHVsYXRlZEJhbGxzLFxyXG4gICAgICB0aGlzLmJhbGxzLFxyXG4gICAgICB0aGlzLmNlbnRlck9mTWFzc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5wYXRoc1Zpc2libGVQcm9wZXJ0eVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn0gLSB0aGUgdG90YWwga2luZXRpYyBlbmVyZ3kgb2YgdGhlIHN5c3RlbSBvZiBiYWxscy5cclxuICAgIC8vXHJcbiAgICAvLyBGb3IgdGhlIGRlcGVuZGVuY2llcywgd2UgdXNlOlxyXG4gICAgLy8gIC0gbWFzcyBhbmQgdmVsb2NpdHkgUHJvcGVydGllcyBvZiB0aGUgYWxsIEJhbGxzLiBPbmx5IHRoZSBiYWxscyBpbiB0aGUgc3lzdGVtIGFyZSB1c2VkIGZvciB0aGUgY2FsY3VsYXRpb24uXHJcbiAgICAvLyAgLSBiYWxscy5sZW5ndGhQcm9wZXJ0eSwgc2luY2UgcmVtb3Zpbmcgb3IgYWRkaW5nIGEgQmFsbCBjaGFuZ2VzIHRoZSB0b3RhbCBraW5ldGljIGVuZXJneSBvZiB0aGUgc3lzdGVtLlxyXG4gICAgLy9cclxuICAgIC8vIFRoaXMgRGVyaXZlZFByb3BlcnR5IGlzIG5ldmVyIGRpc3Bvc2VkIGFuZCBsYXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0uXHJcbiAgICB0aGlzLnRvdGFsS2luZXRpY0VuZXJneVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLmJhbGxzLmxlbmd0aFByb3BlcnR5LFxyXG4gICAgICAuLi50aGlzLnByZXBvcHVsYXRlZEJhbGxzLm1hcCggYmFsbCA9PiBiYWxsLm1hc3NQcm9wZXJ0eSApLFxyXG4gICAgICAuLi50aGlzLnByZXBvcHVsYXRlZEJhbGxzLm1hcCggYmFsbCA9PiBiYWxsLnZlbG9jaXR5UHJvcGVydHkgKVxyXG4gICAgXSwgKCkgPT4gQmFsbFV0aWxzLmdldFRvdGFsS2luZXRpY0VuZXJneSggdGhpcy5iYWxscyApLCB7XHJcbiAgICAgIHZhbHVlVHlwZTogJ251bWJlcicsXHJcbiAgICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gdmFsdWUgPj0gMFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gLSBpbmRpY2F0ZXMgaWYgdGhlcmUgYXJlIGFueSBCYWxscyB0aGF0IGFyZSBiZWluZyBjb250cm9sbGVkLiBVc2VzIHRoZVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyQ29udHJvbGxlZFByb3BlcnR5IG9mIGFsbCBwb3NzaWJsZSBCYWxscyBhcyBkZXBlbmRlbmNpZXMgYnV0IG9ubHkgdGhlXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJhbGxzIGluIHRoZSBzeXN0ZW0gYXJlIGNvbnNpZGVyZWQgaW4gdGhlIGRlcml2YXRpb24gZnVuY3Rpb24uXHJcbiAgICB0aGlzLmJhbGxTeXN0ZW1Vc2VyQ29udHJvbGxlZFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgdGhpcy5wcmVwb3B1bGF0ZWRCYWxscy5tYXAoIGJhbGwgPT4gYmFsbC51c2VyQ29udHJvbGxlZFByb3BlcnR5ICksXHJcbiAgICAgICgpID0+IHRoaXMuYmFsbHMuc29tZSggYmFsbCA9PiBiYWxsLnVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgKSwge1xyXG4gICAgICAgIHZhbHVlVHlwZTogJ2Jvb2xlYW4nXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IC0gaW5kaWNhdGVzIGlmIGFsbCBvZiB0aGUgQmFsbHMgaW4gdGhlIHN5c3RlbSBhcmUgTk9UIGluc2lkZSBvZiB0aGUgUGxheUFyZWEuXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVzZXMgdGhlIGluc2lkZVBsYXlBcmVhUHJvcGVydHkgb2YgYWxsIHBvc3NpYmxlIEJhbGxzIGJ1dCBvbmx5IHRoZSBCYWxscyBpblxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgc3lzdGVtIGFyZSBjb25zaWRlcmVkIGluIHRoZSBkZXJpdmF0aW9uIGZ1bmN0aW9uLlxyXG4gICAgdGhpcy5iYWxsc05vdEluc2lkZVBsYXlBcmVhUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHRoaXMuYmFsbHMubGVuZ3RoUHJvcGVydHksIC4uLnRoaXMucHJlcG9wdWxhdGVkQmFsbHMubWFwKCBiYWxsID0+IGJhbGwuaW5zaWRlUGxheUFyZWFQcm9wZXJ0eSApIF0sXHJcbiAgICAgIGxlbmd0aCA9PiB0aGlzLmJhbGxzLmV2ZXJ5KCBiYWxsID0+ICFiYWxsLmluc2lkZVBsYXlBcmVhUHJvcGVydHkudmFsdWUgKSwge1xyXG4gICAgICAgIHZhbHVlVHlwZTogJ2Jvb2xlYW4nXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBPYnNlcnZlIHdoZW4gQmFsbHMgYXJlIHJlbW92ZWQgZnJvbSB0aGUgc3lzdGVtIGFuZCBjbGVhciB0aGVpciB0cmFpbGluZyBQYXRocy4gTGlzdGVuZXIgbGFzdHMgZm9yIHRoZSBsaWZlLXRpbWVcclxuICAgIC8vIG9mIHRoZSBzaW11bGF0aW9uIHNpbmNlIEJhbGxTeXN0ZW1zIGFyZSBuZXZlciBkaXNwb3NlZC5cclxuICAgIHRoaXMuYmFsbHMuZWxlbWVudFJlbW92ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBiYWxsID0+IHtcclxuICAgICAgYmFsbC5wYXRoLmNsZWFyKCk7XHJcbiAgICAgIHRoaXMudHJ5VG9TYXZlQmFsbFN0YXRlcygpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIE9ic2VydmUgd2hlbiBCYWxscyBhcmUgYWRkZWQgdG8gdGhlIHN5c3RlbSBhbmQgc2F2ZSB0aGUgc3RhdGVzIG9mIGFsbCBiYWxscyBpbiB0aGUgc3lzdGVtLiBMaXN0ZW5lciBsYXN0cyBmb3IgdGhlXHJcbiAgICAvLyBsaWZlLXRpbWUgb2YgdGhlIHNpbXVsYXRpb24gc2luY2UgQmFsbFN5c3RlbXMgYXJlIG5ldmVyIGRpc3Bvc2VkLlxyXG4gICAgdGhpcy5iYWxscy5lbGVtZW50QWRkZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBiYWxsID0+IHtcclxuICAgICAgdGhpcy5iYWxscy5ldmVyeSggYmFsbCA9PiBiYWxsLmluc2lkZVBsYXlBcmVhUHJvcGVydHkudmFsdWUgKSAmJiB0aGlzLmJhbGxzLmZvckVhY2goIGJhbGwgPT4gYmFsbC5zYXZlU3RhdGUoKSApO1xyXG4gICAgICB0aGlzLnRyeVRvU2F2ZUJhbGxTdGF0ZXMoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBPYnNlcnZlIHdoZW4gdGhlIHVzZXIgaXMgZG9uZSBjb250cm9sbGluZyBhbnkgb2YgdGhlIEJhbGxzIHRvOlxyXG4gICAgLy8gICAxLiBTYXZlIHRoZSBzdGF0ZXMgb2YgYWxsIEJhbGxzIGlmIGV2ZXJ5IGJhbGwgaXMgaW5zaWRlIHRoZSBQbGF5QXJlYSdzIGJvdW5kcy5cclxuICAgIC8vICAgMi4gQ2xlYXIgdGhlIHRyYWlsaW5nIFBhdGhzIG9mIGFsbCBCYWxscyBhbmQgdGhlIFBhdGggb2YgdGhlIENlbnRlck9mTWFzcy5cclxuICAgIC8vICAgMy4gUmVzZXQgdGhlIHJvdGF0aW9uIG9mIEJhbGxzIHJlbGF0aXZlIHRvIHRoZWlyIGNlbnRlcnMuXHJcbiAgICAvL1xyXG4gICAgLy8gTGluayBsYXN0cyBmb3IgdGhlIGxpZmUtdGltZSBvZiB0aGUgc2ltIGFzIEJhbGxTeXN0ZW1zIGFyZSBuZXZlciBkaXNwb3NlZC5cclxuICAgIHRoaXMuYmFsbFN5c3RlbVVzZXJDb250cm9sbGVkUHJvcGVydHkubGF6eUxpbmsoIHRoaXMudHJ5VG9TYXZlQmFsbFN0YXRlcy5iaW5kKCB0aGlzICkgKTtcclxuICAgIHBsYXlBcmVhLmVsYXN0aWNpdHlQZXJjZW50UHJvcGVydHkubGF6eUxpbmsoIHRoaXMudHJ5VG9TYXZlQmFsbFN0YXRlcy5iaW5kKCB0aGlzICkgKTtcclxuXHJcbiAgICB0aGlzLmJhbGxzQ29uc3RhbnRTaXplUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgICAgdGhpcy5iYWxscy5mb3JFYWNoKCBiYWxsID0+IHRoaXMuYnVtcEJhbGxBd2F5RnJvbU90aGVycyggYmFsbCApICk7XHJcbiAgICAgIHRoaXMudHJ5VG9TYXZlQmFsbFN0YXRlcygpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSBCYWxsU3lzdGVtLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIENhbGxlZCB3aGVuIHRoZSByZXNldC1hbGwgYnV0dG9uIGlzIHByZXNzZWQuXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLmJhbGxzQ29uc3RhbnRTaXplUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuY2VudGVyT2ZNYXNzVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnBhdGhzVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLm51bWJlck9mQmFsbHNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wcmVwb3B1bGF0ZWRCYWxscy5mb3JFYWNoKCBiYWxsID0+IHsgYmFsbC5yZXNldCgpOyB9ICk7IC8vIFJlc2V0IEFsbCBQb3NzaWJsZSBCYWxscy5cclxuICAgIHRoaXMuY2VudGVyT2ZNYXNzLnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXN0YXJ0cyB0aGUgQmFsbFN5c3RlbS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NvbGxpc2lvbi1sYWIvaXNzdWVzLzc2IGZvciBjb250ZXh0IG9uIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIHJlc2V0IGFuZCByZXN0YXJ0LlxyXG4gICAqL1xyXG4gIHJlc3RhcnQoKSB7XHJcbiAgICB0aGlzLmJhbGxzLmZvckVhY2goIGJhbGwgPT4ge1xyXG4gICAgICBiYWxsLnJlc3RhcnQoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBSZXNldCB0aGUgY2VudGVyLW9mLW1hc3MuXHJcbiAgICB0aGlzLmNlbnRlck9mTWFzcy5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZXMgZXZlcnkgQmFsbCBjdXJyZW50bHkgaW4gdGhlIHN5c3RlbSBieSBvbmUgdGltZS1zdGVwLCBhc3N1bWluZyB0aGF0IHRoZSBCYWxsIGlzIGluIHVuaWZvcm0tbW90aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIHRpbWUgaW4gc2Vjb25kc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBlbGFwc2VkVGltZSAtIHRoZSB0b3RhbCBlbGFwc2VkIGVsYXBzZWRUaW1lIG9mIHRoZSBzaW11bGF0aW9uLCBpbiBzZWNvbmRzLlxyXG4gICAqL1xyXG4gIHN0ZXBVbmlmb3JtTW90aW9uKCBkdCwgZWxhcHNlZFRpbWUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgZHQgPT09ICdudW1iZXInLCBgaW52YWxpZCBkdDogJHtkdH1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgZWxhcHNlZFRpbWUgPT09ICdudW1iZXInICYmIGVsYXBzZWRUaW1lID49IDAsIGBpbnZhbGlkIGVsYXBzZWRUaW1lOiAke2VsYXBzZWRUaW1lfWAgKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmJhbGxzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICB0aGlzLmJhbGxzWyBpIF0uc3RlcFVuaWZvcm1Nb3Rpb24oIGR0ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSB0cmFpbGluZyAnUGF0aHMnIG9mIGFsbCBCYWxscyBpbiB0aGUgc3lzdGVtIGFuZCB0aGUgQ2VudGVyT2ZNYXNzLlxyXG4gICAgdGhpcy51cGRhdGVQYXRocyggZWxhcHNlZFRpbWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGVtcHRzIHRvIHNhdmUgYmFsbCBzdGF0ZXNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHRyeVRvU2F2ZUJhbGxTdGF0ZXMoKSB7XHJcbiAgICBpZiAoICF0aGlzLmJhbGxTeXN0ZW1Vc2VyQ29udHJvbGxlZFByb3BlcnR5LnZhbHVlICYmIHRoaXMuYmFsbHMuZXZlcnkoIGJhbGwgPT4gYmFsbC5pbnNpZGVQbGF5QXJlYVByb3BlcnR5LnZhbHVlICkgKSB7XHJcbiAgICAgIHRoaXMuYmFsbHMuZm9yRWFjaCggYmFsbCA9PiB7XHJcblxyXG4gICAgICAgIC8vIFNhdmUgdGhlIHN0YXRlIG9mIGVhY2ggQmFsbC5cclxuICAgICAgICBiYWxsLmluc2lkZVBsYXlBcmVhUHJvcGVydHkudmFsdWUgJiYgYmFsbC5zYXZlU3RhdGUoKTtcclxuICAgICAgICBiYWxsLnBhdGguY2xlYXIoKTtcclxuICAgICAgICBiYWxsLnJvdGF0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmNlbnRlck9mTWFzcy5wYXRoLmNsZWFyKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSB0cmFpbGluZyAnUGF0aHMnIG9mIGFsbCBCYWxscyBpbiB0aGUgc3lzdGVtIGFuZCB0aGUgdHJhaWxpbmcgJ1BhdGgnIG9mIHRoZSBDZW50ZXJPZk1hc3MuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVsYXBzZWRUaW1lIC0gdGhlIHRvdGFsIGVsYXBzZWQgZWxhcHNlZFRpbWUgb2YgdGhlIHNpbXVsYXRpb24sIGluIHNlY29uZHMuXHJcbiAgICovXHJcbiAgdXBkYXRlUGF0aHMoIGVsYXBzZWRUaW1lICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGVsYXBzZWRUaW1lID09PSAnbnVtYmVyJyAmJiBlbGFwc2VkVGltZSA+PSAwLCBgaW52YWxpZCBlbGFwc2VkVGltZTogJHtlbGFwc2VkVGltZX1gICk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5iYWxscy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdGhpcy5iYWxsc1sgaSBdLnBhdGgudXBkYXRlUGF0aCggZWxhcHNlZFRpbWUgKTtcclxuICAgIH1cclxuICAgIHRoaXMuY2VudGVyT2ZNYXNzLnBhdGgudXBkYXRlUGF0aCggZWxhcHNlZFRpbWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QmFsbH0gYmFsbFxyXG4gICAqL1xyXG4gIGJ1bXBCYWxsSW50b1BsYXlBcmVhKCBiYWxsICkge1xyXG4gICAgLy8gRG9uJ3QgYnVtcCBiYWxscyBpbnRvIHRoZSBwbGF5IGFyZWEgaWYgdGhlcmUgaXMgbm8gcmVmbGVjdGluZyBib3JkZXIsIHNlZVxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NvbGxpc2lvbi1sYWIvaXNzdWVzLzIwNlxyXG4gICAgaWYgKCB0aGlzLnBsYXlBcmVhLnJlZmxlY3RpbmdCb3JkZXJQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgYmFsbC5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gYmFsbC5wbGF5QXJlYS5ib3VuZHMuZXJvZGVkKCBiYWxsLnJhZGl1c1Byb3BlcnR5LnZhbHVlICkuY2xvc2VzdFBvaW50VG8oIGJhbGwucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudHJ5VG9TYXZlQmFsbFN0YXRlcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQnVtcHMgYSBiYWxsIHdheSBmcm9tIHRoZSBvdGhlciBiYWxscy9ib3JkZXJzIGluIHRoZSBzeXN0ZW0gdGhhdCBpdCBpcyBjdXJyZW50bHkgb3ZlcmxhcHBpbmcgd2l0aC4gVGhlICdidW1wZWQnXHJcbiAgICogYmFsbCB3aWxsIGJlIHBsYWNlZCB0byBhIHBvc2l0aW9uIGFkamFjZW50IHRvIHRoZSBvdGhlciBCYWxscy4gVGhpcyBtZXRob2QgZG9lcyBub3RoaW5nIGlmIHRoZSBCYWxsIGlzbid0XHJcbiAgICogb3ZlcmxhcHBpbmcgd2l0aCBhbnl0aGluZy4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jb2xsaXNpb24tbGFiL2lzc3Vlcy8xMDAgYW5kXHJcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NvbGxpc2lvbi1sYWIvaXNzdWVzLzE2Ny5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgY2FsbGVkIHdoZW4gdGhlIHVzZXIgaXMgZmluaXNoZWQgY29udHJvbGxpbmcgdGhlIHJhZGl1cyBvciB0aGUgcG9zaXRpb24gb2YgdGhlIEJhbGwsIGVpdGhlciB0aHJvdWdoIHRoZVxyXG4gICAqIEtleXBhZCBvciBieSBkcmFnZ2luZyB0aGUgQmFsbCwgdGhhdCBub3cgb3ZlcmxhcHMgd2l0aCBhbm90aGVyIEJhbGwuIEl0IHdhcyBkZWNpZGVkIHRoYXQgaXQgd2FzIG1vc3QgbmF0dXJhbCBhbmRcclxuICAgKiBzbW9vdGggdG8gJ2J1bXAnIEJhbGxzIGF3YXkgYWZ0ZXIgdGhlIHVzZXIgaW50ZXJhY3Rpb24sIGluc3RlYWQgb2YgY29udGludWFsbHkgaW52b2tpbmcgdGhpcyBtZXRob2QgYXMgdGhlIHVzZXJcclxuICAgKiBpcyBkcmFnZ2luZyB0aGUgYmFsbC4gT25seSB0aGUgYmFsbCB0aGF0IHRoZSB1c2VyIHdhcyBjb250cm9sbGluZyB3aWxsIGdldCAnQnVtcGVkJyBhd2F5LCBhbmQgd29uJ3QgYWZmZWN0IHRoZVxyXG4gICAqIHBvc2l0aW9uIG9mIHRoZSBvdGhlciBCYWxscy5cclxuICAgKlxyXG4gICAqIFJhdGhlciB0aGFuIG9ic2VydmluZyB3aGVuIHNwZWNpZmljIHVzZXItY29udHJvbGxlZCBwcm9wZXJ0aWVzIGFyZSBzZXQgdG8gZmFsc2UgdG8gaW52b2tlIHRoaXMgbWV0aG9kLCBpdCBpc1xyXG4gICAqIGluc3RlYWQgaW52b2tlZCBpbiB0aGUgdmlldy4gV2UgZG8gdGhpcyBiZWNhdXNlLCBjdXJyZW50bHksIHRoZSBtb2RlbCBwYXVzZXMgdGhlIHNpbSB3aGVuIHRoZSB1c2VyIGlzIGNvbnRyb2xsaW5nXHJcbiAgICogYSBCYWxsIGFuZCBwbGF5cyB0aGUgc2ltIGFnYWluIHdoZW4gdGhlIHVzZXIgaXMgZmluaXNoZWQuIFRoaXMgaXMgYWNoaWV2ZWQgdGhyb3VnaCBheG9uIFByb3BlcnRpZXMuIEhvd2V2ZXIsIEJhbGxzXHJcbiAgICogc2hvdWxkIGJlICdidW1wZWQnIGF3YXkgKipiZWZvcmUqKiBwbGF5aW5nIHRoZSBtb2RlbCwgd2hpY2ggY2FuIGJlIGd1YXJhbnRlZWQgYnkgYnVtcGluZyBmaXJzdCB0aGVuIHNldHRpbmcgdGhlXHJcbiAgICogc3BlY2lmaWMgdXNlci1jb250cm9sbGVkIFByb3BlcnRpZXMgdG8gZmFsc2Ugd2l0aG91dCBkZXBlbmRpbmcgb24gdGhlIG9yZGVyIG9mIGxpc3RlbmVycy5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge0JhbGx9IGJhbGwgLSB0aGUgQmFsbCB0aGF0IHdhcyBqdXN0IHVzZXItY29udHJvbGxlZCBhbmQgc2hvdWxkIGJlICdidW1wZWQnIGF3YXkuXHJcbiAgICovXHJcbiAgYnVtcEJhbGxBd2F5RnJvbU90aGVycyggYmFsbCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJhbGwgaW5zdGFuY2VvZiBCYWxsICYmIHRoaXMuYmFsbHMuaW5jbHVkZXMoIGJhbGwgKSwgYGludmFsaWQgYmFsbDogJHtiYWxsfWAgKTtcclxuXHJcbiAgICB0aGlzLmJ1bXBCYWxsSW50b1BsYXlBcmVhKCBiYWxsICk7XHJcblxyXG4gICAgLy8gRmxhZyB0aGF0IHBvaW50cyB0byB0aGUgY2xvc2VzdCBCYWxsIHRoYXQgb3ZlcmxhcHMgd2l0aCB0aGUgcGFzc2VkLWluIEJhbGwuIFdpbGwgYmUgdW5kZWZpbmVkIGlmIG5vIG90aGVyIGJhbGxzXHJcbiAgICAvLyBhcmUgb3ZlcmxhcHBpbmcgd2l0aCB0aGUgcGFzc2VkLWluIEJhbGwuXHJcbiAgICBsZXQgb3ZlcmxhcHBpbmdCYWxsID0gQmFsbFV0aWxzLmdldENsb3Nlc3RPdmVybGFwcGluZ0JhbGwoIGJhbGwsIHRoaXMuYmFsbHMgKTtcclxuXHJcbiAgICAvLyBBcnJheSBvZiB0aGUgb3ZlcmxhcHBpbmdCYWxscyB0aGF0IHdlIGhhdmUgJ2J1bXBlZCcgYXdheSBmcm9tLiBUaGlzIGlzIHVzZWQgdG8gYnJlYWsgaW5maW5pdGUgbG9vcHMuXHJcbiAgICBjb25zdCBidW1wZWRBd2F5RnJvbUJhbGxzID0gW107XHJcblxyXG4gICAgbGV0IGNvdW50ID0gMDtcclxuXHJcbiAgICAvLyBXZSB1c2UgYSB3aGlsZSBsb29wIHRvIGZ1bGx5IGVuc3VyZSB0aGF0IHRoZSBCYWxsIGlzbid0IG92ZXJsYXBwaW5nIHdpdGggYW55IG90aGVyIEJhbGxzIGluIHNjZW5hcmlvcyB3aGVyZSBCYWxsc1xyXG4gICAgLy8gYXJlIHBsYWNlZCBpbiB0aGUgbWlkZGxlIG9mIGEgY2x1c3RlciwgYW5kICdidW1waW5nJyBhIEJhbGwgbWF5IGxlYWQgdG8gaXQgb3ZlcmxhcHBpbmcgd2l0aCBhbm90aGVyIEJhbGwuXHJcbiAgICB3aGlsZSAoIG92ZXJsYXBwaW5nQmFsbCApIHtcclxuXHJcbiAgICAgIC8vIEdldCB0aGUgRGlyZWN0aW9uVmVjdG9yLCB3aGljaCBpcyB0aGUgdW5pdCB2ZWN0b3IgZnJvbSB0aGUgY2VudGVyIG9mIHRoZSBvdmVybGFwcGluZ0JhbGwgdGhhdCBwb2ludHMgaW4gdGhlXHJcbiAgICAgIC8vIGRpcmVjdGlvbiBvZiB0aGUgcGFzc2VkLWluIEJhbGwuIEFjY291bnQgZm9yIGEgc2NlbmFyaW8gd2hlbiBCYWxscyBhcmUgcGxhY2VkIGV4YWN0bHkgY29uY2VudHJpY2FsbHkgb24tdG9wIG9mXHJcbiAgICAgIC8vIGVhY2ggb3RoZXIuXHJcbiAgICAgIGNvbnN0IGRpcmVjdGlvblZlY3RvciA9ICFiYWxsLnBvc2l0aW9uUHJvcGVydHkudmFsdWUuZXF1YWxzKCBvdmVybGFwcGluZ0JhbGwucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFsbC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLm1pbnVzKCBvdmVybGFwcGluZ0JhbGwucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApLm5vcm1hbGl6ZSgpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVmVjdG9yMi5YX1VOSVQuY29weSgpO1xyXG5cclxuICAgICAgLy8gUm91bmQgdGhlIGRpcmVjdGlvbiB2ZWN0b3IgdG8gbWF0Y2ggdGhlIGRpc3BsYXllZCB2YWx1ZSBvbiBkcmFnLXJlbGVhc2UuIFNlZVxyXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY29sbGlzaW9uLWxhYi9pc3N1ZXMvMTM2LlxyXG4gICAgICBDb2xsaXNpb25MYWJVdGlscy5yb3VuZFVwVmVjdG9yVG9OZWFyZXN0KCBkaXJlY3Rpb25WZWN0b3IsIDEwICoqIC1Db2xsaXNpb25MYWJDb25zdGFudHMuRElTUExBWV9ERUNJTUFMX1BMQUNFUyApO1xyXG5cclxuICAgICAgLy8gSWYgd2UgaGF2ZSBhbHJlYWR5IGJ1bXBlZCBhd2F5IGZyb20gdGhlIG92ZXJsYXBwaW5nQmFsbCwgcmV2ZXJzZSB0aGUgZGlyZWN0aW9uVmVjdG9yLlxyXG4gICAgICBidW1wZWRBd2F5RnJvbUJhbGxzLmluY2x1ZGVzKCBvdmVybGFwcGluZ0JhbGwgKSAmJiBkaXJlY3Rpb25WZWN0b3IubXVsdGlwbHkoIC0xICk7XHJcblxyXG4gICAgICAvLyBJZiB0cnlpbmcgZWFjaCBzaWRlIG9mIHRoZSBiYWxsIGRvZXNuJ3Qgd29yayAoYmVjYXVzZSB0aGV5IG1pZ2h0IGJlIGJvdGggb3ZlcmxhcHBpbmcgd2l0aCBhIGJvcmRlciksIHRyeVxyXG4gICAgICAvLyBhIHJhbmRvbSBkaXJlY3Rpb24uXHJcbiAgICAgIGlmICggYnVtcGVkQXdheUZyb21CYWxscy5sZW5ndGggPiA1ICkge1xyXG4gICAgICAgIGlmICggYmFsbC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgPT09IDAgKSB7XHJcbiAgICAgICAgICBkaXJlY3Rpb25WZWN0b3Iuc2V0WFkoIGRvdFJhbmRvbS5uZXh0Qm9vbGVhbigpID8gMSA6IC0xLCAwICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgZGlyZWN0aW9uVmVjdG9yLnJvdGF0ZSggMiAqIE1hdGguUEkgKiBkb3RSYW5kb20ubmV4dERvdWJsZSgpICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBNb3ZlIHRoZSBCYWxsIG5leHQgdG8gdGhlIG92ZXJsYXBwaW5nQmFsbCwgdXNpbmcgdGhlIGRpcmVjdGlvblZlY3Rvci5cclxuICAgICAgQmFsbFV0aWxzLm1vdmVCYWxsTmV4dFRvQmFsbCggYmFsbCwgb3ZlcmxhcHBpbmdCYWxsLCBkaXJlY3Rpb25WZWN0b3IgKTtcclxuXHJcbiAgICAgIHRoaXMuYnVtcEJhbGxJbnRvUGxheUFyZWEoIGJhbGwgKTtcclxuXHJcbiAgICAgIC8vIFJlY29tcHV0ZSB0aGUgb3ZlcmxhcHBpbmdCYWxsIGZvciB0aGUgbmV4dCBpdGVyYXRpb24uXHJcbiAgICAgIGJ1bXBlZEF3YXlGcm9tQmFsbHMucHVzaCggb3ZlcmxhcHBpbmdCYWxsICk7XHJcbiAgICAgIG92ZXJsYXBwaW5nQmFsbCA9IEJhbGxVdGlscy5nZXRDbG9zZXN0T3ZlcmxhcHBpbmdCYWxsKCBiYWxsLCB0aGlzLmJhbGxzICk7XHJcblxyXG4gICAgICBpZiAoIG92ZXJsYXBwaW5nQmFsbCAmJiArK2NvdW50ID4gMTAgKSB7XHJcbiAgICAgICAgdGhpcy5yZXBlbEJhbGxzKCk7XHJcbiAgICAgICAgb3ZlcmxhcHBpbmdCYWxsID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBTYW5pdHkgY2hlY2sgdGhhdCB0aGUgQmFsbCBpcyBub3cgbm90IG92ZXJsYXBwaW5nIHdpdGggYW55IG90aGVyIEJhbGxzLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIUJhbGxVdGlscy5nZXRDbG9zZXN0T3ZlcmxhcHBpbmdCYWxsKCBiYWxsLCB0aGlzLmJhbGxzICkgKTtcclxuXHJcbiAgICB0aGlzLnRyeVRvU2F2ZUJhbGxTdGF0ZXMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhdXNlcyBhbGwgYmFsbHMgdG8gcmVwZWwgZnJvbSBlYWNoIG90aGVyLCB3aGlsZSBzdGF5aW5nIGluc2lkZSB0aGUgYm91bmRhcmllcy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHJlcGVsQmFsbHMoKSB7XHJcbiAgICBsZXQgaGFkT3ZlcmxhcCA9IHRydWU7XHJcblxyXG4gICAgY29uc3QgYmFsbFBhaXJzID0gcGFpcnMoIHRoaXMuYmFsbHMgKTtcclxuXHJcbiAgICB3aGlsZSAoIGhhZE92ZXJsYXAgKSB7XHJcbiAgICAgIGhhZE92ZXJsYXAgPSBmYWxzZTtcclxuXHJcbiAgICAgIGJhbGxQYWlycy5mb3JFYWNoKCBwYWlyID0+IHtcclxuICAgICAgICBpZiAoIEJhbGxVdGlscy5hcmVCYWxsc092ZXJsYXBwaW5nKCBwYWlyWyAwIF0sIHBhaXJbIDEgXSApICkge1xyXG4gICAgICAgICAgaGFkT3ZlcmxhcCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgY29uc3QgZGlyZWN0aW9uVmVjdG9yID0gIXBhaXJbIDAgXS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLmVxdWFscyggcGFpclsgMSBdLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWlyWyAwIF0ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5taW51cyggcGFpclsgMSBdLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKS5ub3JtYWxpemUoKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWZWN0b3IyLlhfVU5JVC5jb3B5KCk7XHJcblxyXG4gICAgICAgICAgbGV0IHBhaXIwUG9zaXRpb24gPSBwYWlyWyAwIF0ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKFxyXG4gICAgICAgICAgICAvLyBTbG93IGJ1bXAgYXdheVxyXG4gICAgICAgICAgICBkaXJlY3Rpb25WZWN0b3IudGltZXNTY2FsYXIoIDAuMDUgKVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGxldCBwYWlyMVBvc2l0aW9uID0gcGFpclsgMSBdLnBvc2l0aW9uUHJvcGVydHkudmFsdWUucGx1cyhcclxuICAgICAgICAgICAgLy8gU2xvdyBidW1wIGF3YXlcclxuICAgICAgICAgICAgZGlyZWN0aW9uVmVjdG9yLnRpbWVzU2NhbGFyKCAtMC4wNSApXHJcbiAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgIC8vIERvbid0IGJ1bXAgYmFsbHMgaW50byB0aGUgcGxheSBhcmVhIGlmIHRoZXJlIGlzIG5vIHJlZmxlY3RpbmcgYm9yZGVyLCBzZWVcclxuICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jb2xsaXNpb24tbGFiL2lzc3Vlcy8yMDZcclxuICAgICAgICAgIGlmICggdGhpcy5wbGF5QXJlYS5yZWZsZWN0aW5nQm9yZGVyUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICAgIHBhaXIwUG9zaXRpb24gPSBwYWlyWyAwIF0ucGxheUFyZWEuYm91bmRzLmVyb2RlZCggcGFpclsgMCBdLnJhZGl1c1Byb3BlcnR5LnZhbHVlICkuY2xvc2VzdFBvaW50VG8oIHBhaXIwUG9zaXRpb24gKTtcclxuICAgICAgICAgICAgcGFpcjFQb3NpdGlvbiA9IHBhaXJbIDEgXS5wbGF5QXJlYS5ib3VuZHMuZXJvZGVkKCBwYWlyWyAxIF0ucmFkaXVzUHJvcGVydHkudmFsdWUgKS5jbG9zZXN0UG9pbnRUbyggcGFpcjFQb3NpdGlvbiApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHBhaXJbIDAgXS5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gcGFpcjBQb3NpdGlvbjtcclxuICAgICAgICAgIHBhaXJbIDEgXS5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gcGFpcjFQb3NpdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIEJhbGxzIGluIHRoZSBCYWxsU3lzdGVtIHRvIG1hdGNoIHRoZSBudW1iZXJPZkJhbGxzUHJvcGVydHkncyB2YWx1ZS4gSWYgdGhlIEJhbGxzIGFyZSBvdXQgb2Ygc3luYywgdGhpc1xyXG4gICAqIG1ldGhvZCB3aWxsIGFkZCBvciByZW1vdmUgKGJ1dCBub3QgZGlzcG9zZSkgdGhlIGNvcnJlY3QgbnVtYmVyIG9mIEJhbGxzIGZyb20gdGhlIHN5c3RlbS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHVzZXIgY2hhbmdlcyB0aGUgbnVtYmVyIG9mIGJhbGxzIGluIHRoZSBzeXN0ZW0uXHJcbiAgICovXHJcbiAgdXBkYXRlQmFsbHMoKSB7XHJcblxyXG4gICAgLy8gSWYgdGhlIG51bWJlciBvZiBiYWxscyBpcyBncmVhdGVyIHRoYW4gdGhlIEJhbGxzIGN1cnJlbnRseSBpbiB0aGUgc3lzdGVtLCBCYWxscyBuZWVkIHRvIGJlIGFkZGVkIHRvIHRoZSBzeXN0ZW0uXHJcbiAgICBpZiAoIHRoaXMubnVtYmVyT2ZCYWxsc1Byb3BlcnR5LnZhbHVlID4gdGhpcy5iYWxscy5sZW5ndGggKSB7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIGNvcnJlY3QgbnVtYmVyIG9mIEJhbGxzLCByZWZlcmVuY2luZyBhbiBpbmRleCBvZiB0aGUgcHJlcG9wdWxhdGVkQmFsbHMgc28gdGhhdCB0aGUgc2FtZSBCYWxscyBhcmVcclxuICAgICAgLy8gYWRkZWQgd2l0aCB0aGUgc2FtZSBudW1iZXJPZkJhbGxzUHJvcGVydHkgdmFsdWUuXHJcbiAgICAgIGZvciAoIGxldCBpID0gdGhpcy5iYWxscy5sZW5ndGg7IGkgPCB0aGlzLm51bWJlck9mQmFsbHNQcm9wZXJ0eS52YWx1ZTsgaSsrICkge1xyXG4gICAgICAgIHRoaXMuYmFsbHMucHVzaCggdGhpcy5wcmVwb3B1bGF0ZWRCYWxsc1sgaSBdICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gT3RoZXJ3aXNlLCB0aGUgbnVtYmVyIG9mIGJhbGxzIGluIHRoZSBzeXN0ZW0gaXMgZ3JlYXRlciB0aGFuIG51bWJlck9mQmFsbHNQcm9wZXJ0eSB2YWx1ZSwgbWVhbmluZyBCYWxscyBuZWVkXHJcbiAgICAgIC8vIHRvIGJlIHJlbW92ZWQuIFJlbW92ZSB0aGUgY29ycmVjdCBudW1iZXIgb2YgQmFsbHMgZnJvbSB0aGUgZW5kIG9mIHRoZSBzeXN0ZW0uXHJcbiAgICAgIHdoaWxlICggdGhpcy5iYWxscy5sZW5ndGggIT09IHRoaXMubnVtYmVyT2ZCYWxsc1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIHRoaXMuYmFsbHMucG9wKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgdGhhdCBCYWxscyBhcmUgaW4gYXNjZW5kaW5nIG9yZGVyIGJ5IHRoZWlyIGluZGljZXMsIGlmIGFzc2VydGlvbnMgYXJlIGVuYWJsZWQuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBDb2xsaXNpb25MYWJVdGlscy5pc1NvcnRlZCggdGhpcy5iYWxscywgYmFsbCA9PiBiYWxsLmluZGV4ICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbGxpc2lvbkxhYi5yZWdpc3RlciggJ0JhbGxTeXN0ZW0nLCBCYWxsU3lzdGVtICk7XHJcbmV4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