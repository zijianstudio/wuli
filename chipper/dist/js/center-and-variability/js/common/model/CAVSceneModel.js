// Copyright 2022-2023, University of Colorado Boulder

/**
 * Base class for the model in every screen.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import centerAndVariability from '../../centerAndVariability.js';
import SoccerBall from './SoccerBall.js';
import CAVObjectType from './CAVObjectType.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Range from '../../../../dot/js/Range.js';
import Property from '../../../../axon/js/Property.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import SoccerPlayer from './SoccerPlayer.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import CAVConstants from '../CAVConstants.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import Pose from './Pose.js';
import { AnimationMode } from './AnimationMode.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';

// constants
const TIME_BETWEEN_RAPID_KICKS = 0.5; // in seconds

export default class CAVSceneModel {
  // The number of active soccer balls (includes soccer balls created but not yet kicked)

  maxSoccerBalls = CAVConstants.NUMBER_OF_OBJECTS;

  // Indicates the max and min values in the data set, or null if there are no values in the data set

  isVisibleProperty = new BooleanProperty(true);

  // Signify whenever any object's value or position changes
  objectChangedEmitter = new Emitter({
    parameters: [{
      valueType: SoccerBall
    }]
  });
  resetEmitter = new Emitter();

  // Starting at 0, iterate through the index of the kickers. This updates the SoccerPlayer.isActiveProperty to show the current kicker

  constructor(initialDistribution, options) {
    const updateDataMeasures = () => this.updateDataMeasures();
    this.soccerBallCountProperty = new NumberProperty(0, {
      range: new Range(0, this.maxSoccerBalls)
    });
    this.soccerBalls = _.range(0, this.maxSoccerBalls).map(index => {
      const position = new Vector2(0, CAVObjectType.SOCCER_BALL.radius);
      const soccerBall = new SoccerBall({
        isFirstObject: index === 0,
        tandem: options.tandem.createTandem(`soccerBall${index}`),
        position: position
      });

      // When the soccer ball drag position changes, constrain it to the physical range and move it to the top, if necessary
      soccerBall.dragPositionProperty.lazyLink(dragPosition => {
        soccerBall.valueProperty.value = Utils.roundSymmetric(CAVConstants.PHYSICAL_RANGE.constrainValue(dragPosition.x));
        this.moveToTop(soccerBall);
      });
      soccerBall.valueProperty.link(value => {
        if (value !== null) {
          if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
            this.animateSoccerBallStack(soccerBall, value);

            // If the soccer player that kicked that ball was still in line when the ball lands, they can leave the line now.
            if (soccerBall.soccerPlayer === this.getFrontSoccerPlayer()) {
              this.advanceLine();
            }
            this.objectValueBecameNonNullEmitter.emit(soccerBall);
          }
        }
      });

      // Signal to listeners that a value changed
      soccerBall.valueProperty.link(() => this.objectChangedEmitter.emit(soccerBall));
      soccerBall.positionProperty.link(() => this.objectChangedEmitter.emit(soccerBall));
      return soccerBall;
    });
    this.soccerBalls.forEach(soccerBall => {
      soccerBall.isActiveProperty.link(isActive => {
        this.soccerBallCountProperty.value = this.getActiveSoccerBalls().length;
      });
    });
    this.medianValueProperty = new Property(null, {
      tandem: options.tandem.createTandem('medianValueProperty'),
      phetioValueType: NullableIO(NumberIO),
      phetioReadOnly: true
    });
    this.meanValueProperty = new Property(null, {
      tandem: options.tandem.createTandem('meanValueProperty'),
      phetioValueType: NullableIO(NumberIO),
      phetioReadOnly: true
    });
    this.dataRangeProperty = new Property(null);
    this.numberOfDataPointsProperty = new NumberProperty(0);
    this.timeProperty = new NumberProperty(0, {
      tandem: options.tandem.createTandem('timeProperty')
    });
    this.objectValueBecameNonNullEmitter = new Emitter({
      parameters: [{
        valueType: SoccerBall
      }]
    });
    this.numberOfScheduledSoccerBallsToKickProperty = new NumberProperty(0, {
      tandem: options.tandem.createTandem('numberOfScheduledSoccerBallsToKickProperty')
    });
    this.timeWhenLastBallWasKickedProperty = new NumberProperty(0, {
      tandem: options.tandem.createTandem('timeWhenLastBallWasKickedProperty')
    });
    this.soccerPlayers = _.range(0, this.maxSoccerBalls).map(placeInLine => new SoccerPlayer(placeInLine));

    // Create an initial ball to show on startup
    this.getNextBallFromPool();
    this.numberOfUnkickedBallsProperty = DerivedProperty.deriveAny([this.numberOfScheduledSoccerBallsToKickProperty, ...this.soccerBalls.map(soccerBall => soccerBall.valueProperty), ...this.soccerBalls.map(soccerBall => soccerBall.animationModeProperty)], () => {
      const kickedSoccerBalls = this.getActiveSoccerBalls().filter(soccerBall => soccerBall.valueProperty.value !== null || soccerBall.animationModeProperty.value === AnimationMode.FLYING || soccerBall.animationModeProperty.value === AnimationMode.STACKING);
      const value = this.maxSoccerBalls - kickedSoccerBalls.length - this.numberOfScheduledSoccerBallsToKickProperty.value;
      return value;
    });
    this.hasKickableSoccerBallsProperty = new DerivedProperty([this.numberOfUnkickedBallsProperty], numberOfUnkickedBalls => numberOfUnkickedBalls > 0);
    this.distributionProperty = new Property(initialDistribution, {
      tandem: options.tandem.createTandem('distributionProperty'),
      phetioValueType: ArrayIO(NumberIO),
      phetioDocumentation: 'The distribution of probabilities of where the balls will land is represented as an un-normalized array of non-negative, floating-point numbers, one value for each location in the physical range',
      isValidValue: array => array.length === CAVConstants.PHYSICAL_RANGE.getLength() + 1 &&
      // inclusive of endpoints
      _.every(array, element => element >= 0)
    });
    this.activeKickerIndexProperty = new NumberProperty(0, {
      tandem: options.tandem.createTandem('activeKickerIndexProperty')
    });
    this.activeKickerIndexProperty.link(activeKickerIndex => {
      this.soccerPlayers.forEach((soccerPlayer, index) => {
        soccerPlayer.isActiveProperty.value = index === activeKickerIndex;
      });
    });
    this.soccerBalls.forEach(soccerBall => {
      soccerBall.valueProperty.link(updateDataMeasures);
      soccerBall.positionProperty.link(updateDataMeasures);
    });
  }
  updateDataMeasures() {
    const sortedObjects = this.getSortedLandedObjects();
    const medianObjects = CAVSceneModel.getMedianObjectsFromSortedArray(sortedObjects);
    this.soccerBalls.forEach(object => {
      object.isMedianObjectProperty.value = medianObjects.includes(object);
    });
    if (sortedObjects.length > 0) {
      // take the average to account for cases where there is more than one object contributing to the median
      this.medianValueProperty.value = _.mean(medianObjects.map(soccerBall => soccerBall.valueProperty.value));
      this.meanValueProperty.value = _.mean(sortedObjects.map(soccerBall => soccerBall.valueProperty.value));
      const min = sortedObjects[0].valueProperty.value;
      const max = sortedObjects[sortedObjects.length - 1].valueProperty.value;
      this.dataRangeProperty.value = new Range(min, max);
      assert && assert(!isNaN(this.medianValueProperty.value));
    } else {
      this.medianValueProperty.value = null;
      this.meanValueProperty.value = null;
      this.dataRangeProperty.value = null;
    }
    this.numberOfDataPointsProperty.value = sortedObjects.length;
  }

  /**
   * Returns all other objects at the target position of the provided object.
   */
  getOtherObjectsAtTarget(soccerBall) {
    return this.soccerBalls.filter(o => {
      return o.valueProperty.value === soccerBall.valueProperty.value && soccerBall !== o;
    });
  }

  /**
   * Set the position of the parameter object to be on top of the other objects at that target position.
   */
  moveToTop(soccerBall) {
    const objectsAtTarget = this.getOtherObjectsAtTarget(soccerBall);

    // Sort from bottom to top, so they can be re-stacked. The specified object will appear at the top.
    const sortedOthers = _.sortBy(objectsAtTarget, object => object.positionProperty.value.y);
    const sorted = [...sortedOthers, soccerBall];

    // collapse the rest of the stack. NOTE: This assumes the radii are the same.
    let position = CAVObjectType.SOCCER_BALL.radius;
    sorted.forEach(object => {
      object.positionProperty.value = new Vector2(soccerBall.valueProperty.value, position);
      position += CAVObjectType.SOCCER_BALL.radius * 2;
    });
  }

  /**
   * Clears out the data
   */
  clearData() {
    this.numberOfScheduledSoccerBallsToKickProperty.reset();
    this.timeProperty.reset();
    this.timeWhenLastBallWasKickedProperty.reset();
    this.soccerPlayers.forEach(soccerPlayer => soccerPlayer.reset());
    this.soccerBalls.forEach(soccerBall => soccerBall.reset());
    this.getNextBallFromPool();
    this.activeKickerIndexProperty.reset();
  }

  /**
   * Resets the model.
   */
  reset() {
    // TODO: This should only be in MedianSceneModel and MeanAndMedianSceneModel, see https://github.com/phetsims/center-and-variability/issues/153
    this.distributionProperty.value = CAVSceneModel.chooseDistribution();
    this.clearData();
    this.resetEmitter.emit();
  }
  getSortedLandedObjects() {
    return _.sortBy(this.getActiveSoccerBalls().filter(soccerBall => soccerBall.valueProperty.value !== null),
    // The numerical value takes predence for sorting
    soccerBall => soccerBall.valueProperty.value,
    // Then consider the height within the stack
    soccerBall => soccerBall.positionProperty.value.y);
  }
  getFrontSoccerPlayer() {
    return this.soccerPlayers[this.activeKickerIndexProperty.value];
  }

  /**
   * Steps the model.
   *
   * @param dt - time step, in seconds
   */
  step(dt) {
    this.timeProperty.value += dt;
    this.getActiveSoccerBalls().forEach(soccerBall => soccerBall.step(dt));
    const frontPlayer = this.getFrontSoccerPlayer();
    if (frontPlayer) {
      if (this.numberOfScheduledSoccerBallsToKickProperty.value > 0 && this.timeProperty.value >= this.timeWhenLastBallWasKickedProperty.value + TIME_BETWEEN_RAPID_KICKS) {
        this.advanceLine();
        if (frontPlayer.poseProperty.value === Pose.STANDING) {
          frontPlayer.poseProperty.value = Pose.POISED_TO_KICK;
          frontPlayer.timestampWhenPoisedBegan = this.timeProperty.value;
        }
      }

      // How long has the front player been poised?
      if (frontPlayer.poseProperty.value === Pose.POISED_TO_KICK) {
        assert && assert(typeof frontPlayer.timestampWhenPoisedBegan === 'number', 'timestampWhenPoisedBegan should be a number');
        const elapsedTime = this.timeProperty.value - frontPlayer.timestampWhenPoisedBegan;
        if (elapsedTime > 0.075) {
          const soccerBall = this.soccerBalls.find(soccerBall => soccerBall.valueProperty.value === null && soccerBall.isActiveProperty.value && soccerBall.animationModeProperty.value === AnimationMode.NONE);

          // In fuzzing, sometimes there are no soccer balls available
          if (soccerBall) {
            this.kickBall(frontPlayer, soccerBall);
            this.numberOfScheduledSoccerBallsToKickProperty.value--;
          }
        }
      }
    }
  }

  // Returns a list of the median objects within a sorted array, based on the objects' 'value' property
  static getMedianObjectsFromSortedArray(sortedObjects) {
    // Odd number of values, take the central value
    if (sortedObjects.length % 2 === 1) {
      const midIndex = (sortedObjects.length - 1) / 2;
      return [sortedObjects[midIndex]];
    } else if (sortedObjects.length % 2 === 0 && sortedObjects.length >= 2) {
      // Even number of values, average the two middle-most values
      const mid1Index = (sortedObjects.length - 2) / 2;
      const mid2Index = (sortedObjects.length - 0) / 2;
      return [sortedObjects[mid1Index], sortedObjects[mid2Index]];
    } else {
      return [];
    }
  }

  // When a ball lands, or when the next player is supposed to kick (before the ball lands), move the line forward
  // and queue up the next ball as well
  advanceLine() {
    // Allow kicking another ball while one is already in the air.
    // if the previous ball was still in the air, we need to move the line forward so the next player can kick
    const kickers = this.soccerPlayers.filter(soccerPlayer => soccerPlayer.isActiveProperty.value && soccerPlayer.poseProperty.value === Pose.KICKING);
    if (kickers.length > 0) {
      let nextIndex = this.activeKickerIndexProperty.value + 1;
      if (nextIndex > this.maxSoccerBalls) {
        nextIndex = 0;
      }
      this.activeKickerIndexProperty.value = nextIndex;
      this.getNextBallFromPool();
    }
  }
  static chooseDistribution() {
    return dotRandom.nextBoolean() ? CAVConstants.LEFT_SKEWED_DATA : CAVConstants.RIGHT_SKEWED_DATA;
  }
  getActiveSoccerBalls() {
    return this.soccerBalls.filter(soccerBall => soccerBall.isActiveProperty.value);
  }

  /**
   * When a ball lands on the ground, animate all other balls that were at this location above the landed ball.
   */
  animateSoccerBallStack(soccerBall, value) {
    const otherObjectsInStack = this.getActiveSoccerBalls().filter(x => x.valueProperty.value === value && x !== soccerBall);
    const sortedOthers = _.sortBy(otherObjectsInStack, object => object.positionProperty.value.y);
    sortedOthers.forEach((soccerBall, index) => {
      const diameter = CAVObjectType.SOCCER_BALL.radius * 2;
      const targetPositionY = (index + 1) * diameter + CAVObjectType.SOCCER_BALL.radius;
      if (soccerBall.animation) {
        soccerBall.animation.stop();
      }
      soccerBall.animation = new Animation({
        duration: 0.15,
        targets: [{
          property: soccerBall.positionProperty,
          to: new Vector2(soccerBall.positionProperty.value.x, targetPositionY),
          easing: Easing.QUADRATIC_IN_OUT
        }]
      });
      soccerBall.animation.endedEmitter.addListener(() => {
        soccerBall.animation = null;
      });
      soccerBall.animation.start();
    });
  }

  /**
   * Adds the provided number of balls to the scheduled balls to kick
   */
  scheduleKicks(numberOfBallsToKick) {
    this.numberOfScheduledSoccerBallsToKickProperty.value += Math.min(numberOfBallsToKick, this.numberOfUnkickedBallsProperty.value);
  }

  /**
   * Select a target location for the nextBallToKick, set its velocity and mark it for animation.
   */
  kickBall(soccerPlayer, soccerBall) {
    soccerPlayer.poseProperty.value = Pose.KICKING;
    const weights = this.distributionProperty.value;
    assert && assert(weights.length === CAVConstants.PHYSICAL_RANGE.getLength() + 1, 'weight array should match the model range');
    const x1 = dotRandom.sampleProbabilities(weights) + 1;

    // Range equation is R=v0^2 sin(2 theta0) / g, see https://openstax.org/books/university-physics-volume-1/pages/4-3-projectile-motion
    // Equation 4.26
    const degreesToRadians = degrees => degrees * Math.PI * 2 / 360;
    const angle = dotRandom.nextDoubleBetween(degreesToRadians(25), degreesToRadians(70));
    const v0 = Math.sqrt(Math.abs(x1 * Math.abs(CAVConstants.GRAVITY) / Math.sin(2 * angle)));
    const velocity = Vector2.createPolar(v0, angle);
    soccerBall.velocityProperty.value = velocity;
    soccerBall.targetXProperty.value = x1;
    soccerBall.animationModeProperty.value = AnimationMode.FLYING;
    this.timeWhenLastBallWasKickedProperty.value = this.timeProperty.value;
    soccerBall.soccerPlayer = soccerPlayer;
  }
  getNextBallFromPool() {
    const nextBallFromPool = this.soccerBalls.find(ball => !ball.isActiveProperty.value) || null;
    if (nextBallFromPool) {
      nextBallFromPool.isActiveProperty.value = true;
    }
    return nextBallFromPool;
  }
}
centerAndVariability.register('CAVSceneModel', CAVSceneModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjZW50ZXJBbmRWYXJpYWJpbGl0eSIsIlNvY2NlckJhbGwiLCJDQVZPYmplY3RUeXBlIiwiVmVjdG9yMiIsIlJhbmdlIiwiUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlV0aWxzIiwiRGVyaXZlZFByb3BlcnR5IiwiRW1pdHRlciIsIk51bGxhYmxlSU8iLCJOdW1iZXJJTyIsIlNvY2NlclBsYXllciIsIkFycmF5SU8iLCJkb3RSYW5kb20iLCJDQVZDb25zdGFudHMiLCJBbmltYXRpb24iLCJFYXNpbmciLCJQb3NlIiwiQW5pbWF0aW9uTW9kZSIsIkJvb2xlYW5Qcm9wZXJ0eSIsIlRJTUVfQkVUV0VFTl9SQVBJRF9LSUNLUyIsIkNBVlNjZW5lTW9kZWwiLCJtYXhTb2NjZXJCYWxscyIsIk5VTUJFUl9PRl9PQkpFQ1RTIiwiaXNWaXNpYmxlUHJvcGVydHkiLCJvYmplY3RDaGFuZ2VkRW1pdHRlciIsInBhcmFtZXRlcnMiLCJ2YWx1ZVR5cGUiLCJyZXNldEVtaXR0ZXIiLCJjb25zdHJ1Y3RvciIsImluaXRpYWxEaXN0cmlidXRpb24iLCJvcHRpb25zIiwidXBkYXRlRGF0YU1lYXN1cmVzIiwic29jY2VyQmFsbENvdW50UHJvcGVydHkiLCJyYW5nZSIsInNvY2NlckJhbGxzIiwiXyIsIm1hcCIsImluZGV4IiwicG9zaXRpb24iLCJTT0NDRVJfQkFMTCIsInJhZGl1cyIsInNvY2NlckJhbGwiLCJpc0ZpcnN0T2JqZWN0IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiZHJhZ1Bvc2l0aW9uUHJvcGVydHkiLCJsYXp5TGluayIsImRyYWdQb3NpdGlvbiIsInZhbHVlUHJvcGVydHkiLCJ2YWx1ZSIsInJvdW5kU3ltbWV0cmljIiwiUEhZU0lDQUxfUkFOR0UiLCJjb25zdHJhaW5WYWx1ZSIsIngiLCJtb3ZlVG9Ub3AiLCJsaW5rIiwicGhldCIsImpvaXN0Iiwic2ltIiwiaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSIsImFuaW1hdGVTb2NjZXJCYWxsU3RhY2siLCJzb2NjZXJQbGF5ZXIiLCJnZXRGcm9udFNvY2NlclBsYXllciIsImFkdmFuY2VMaW5lIiwib2JqZWN0VmFsdWVCZWNhbWVOb25OdWxsRW1pdHRlciIsImVtaXQiLCJwb3NpdGlvblByb3BlcnR5IiwiZm9yRWFjaCIsImlzQWN0aXZlUHJvcGVydHkiLCJpc0FjdGl2ZSIsImdldEFjdGl2ZVNvY2NlckJhbGxzIiwibGVuZ3RoIiwibWVkaWFuVmFsdWVQcm9wZXJ0eSIsInBoZXRpb1ZhbHVlVHlwZSIsInBoZXRpb1JlYWRPbmx5IiwibWVhblZhbHVlUHJvcGVydHkiLCJkYXRhUmFuZ2VQcm9wZXJ0eSIsIm51bWJlck9mRGF0YVBvaW50c1Byb3BlcnR5IiwidGltZVByb3BlcnR5IiwibnVtYmVyT2ZTY2hlZHVsZWRTb2NjZXJCYWxsc1RvS2lja1Byb3BlcnR5IiwidGltZVdoZW5MYXN0QmFsbFdhc0tpY2tlZFByb3BlcnR5Iiwic29jY2VyUGxheWVycyIsInBsYWNlSW5MaW5lIiwiZ2V0TmV4dEJhbGxGcm9tUG9vbCIsIm51bWJlck9mVW5raWNrZWRCYWxsc1Byb3BlcnR5IiwiZGVyaXZlQW55IiwiYW5pbWF0aW9uTW9kZVByb3BlcnR5Iiwia2lja2VkU29jY2VyQmFsbHMiLCJmaWx0ZXIiLCJGTFlJTkciLCJTVEFDS0lORyIsImhhc0tpY2thYmxlU29jY2VyQmFsbHNQcm9wZXJ0eSIsIm51bWJlck9mVW5raWNrZWRCYWxscyIsImRpc3RyaWJ1dGlvblByb3BlcnR5IiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImlzVmFsaWRWYWx1ZSIsImFycmF5IiwiZ2V0TGVuZ3RoIiwiZXZlcnkiLCJlbGVtZW50IiwiYWN0aXZlS2lja2VySW5kZXhQcm9wZXJ0eSIsImFjdGl2ZUtpY2tlckluZGV4Iiwic29ydGVkT2JqZWN0cyIsImdldFNvcnRlZExhbmRlZE9iamVjdHMiLCJtZWRpYW5PYmplY3RzIiwiZ2V0TWVkaWFuT2JqZWN0c0Zyb21Tb3J0ZWRBcnJheSIsIm9iamVjdCIsImlzTWVkaWFuT2JqZWN0UHJvcGVydHkiLCJpbmNsdWRlcyIsIm1lYW4iLCJtaW4iLCJtYXgiLCJhc3NlcnQiLCJpc05hTiIsImdldE90aGVyT2JqZWN0c0F0VGFyZ2V0IiwibyIsIm9iamVjdHNBdFRhcmdldCIsInNvcnRlZE90aGVycyIsInNvcnRCeSIsInkiLCJzb3J0ZWQiLCJjbGVhckRhdGEiLCJyZXNldCIsImNob29zZURpc3RyaWJ1dGlvbiIsInN0ZXAiLCJkdCIsImZyb250UGxheWVyIiwicG9zZVByb3BlcnR5IiwiU1RBTkRJTkciLCJQT0lTRURfVE9fS0lDSyIsInRpbWVzdGFtcFdoZW5Qb2lzZWRCZWdhbiIsImVsYXBzZWRUaW1lIiwiZmluZCIsIk5PTkUiLCJraWNrQmFsbCIsIm1pZEluZGV4IiwibWlkMUluZGV4IiwibWlkMkluZGV4Iiwia2lja2VycyIsIktJQ0tJTkciLCJuZXh0SW5kZXgiLCJuZXh0Qm9vbGVhbiIsIkxFRlRfU0tFV0VEX0RBVEEiLCJSSUdIVF9TS0VXRURfREFUQSIsIm90aGVyT2JqZWN0c0luU3RhY2siLCJkaWFtZXRlciIsInRhcmdldFBvc2l0aW9uWSIsImFuaW1hdGlvbiIsInN0b3AiLCJkdXJhdGlvbiIsInRhcmdldHMiLCJwcm9wZXJ0eSIsInRvIiwiZWFzaW5nIiwiUVVBRFJBVElDX0lOX09VVCIsImVuZGVkRW1pdHRlciIsImFkZExpc3RlbmVyIiwic3RhcnQiLCJzY2hlZHVsZUtpY2tzIiwibnVtYmVyT2ZCYWxsc1RvS2ljayIsIk1hdGgiLCJ3ZWlnaHRzIiwieDEiLCJzYW1wbGVQcm9iYWJpbGl0aWVzIiwiZGVncmVlc1RvUmFkaWFucyIsImRlZ3JlZXMiLCJQSSIsImFuZ2xlIiwibmV4dERvdWJsZUJldHdlZW4iLCJ2MCIsInNxcnQiLCJhYnMiLCJHUkFWSVRZIiwic2luIiwidmVsb2NpdHkiLCJjcmVhdGVQb2xhciIsInZlbG9jaXR5UHJvcGVydHkiLCJ0YXJnZXRYUHJvcGVydHkiLCJuZXh0QmFsbEZyb21Qb29sIiwiYmFsbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ0FWU2NlbmVNb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYXNlIGNsYXNzIGZvciB0aGUgbW9kZWwgaW4gZXZlcnkgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IGNlbnRlckFuZFZhcmlhYmlsaXR5IGZyb20gJy4uLy4uL2NlbnRlckFuZFZhcmlhYmlsaXR5LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IFNvY2NlckJhbGwgZnJvbSAnLi9Tb2NjZXJCYWxsLmpzJztcclxuaW1wb3J0IENBVk9iamVjdFR5cGUgZnJvbSAnLi9DQVZPYmplY3RUeXBlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IE51bGxhYmxlSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bGxhYmxlSU8uanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XHJcbmltcG9ydCBUTW9kZWwgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvVE1vZGVsLmpzJztcclxuaW1wb3J0IFNvY2NlclBsYXllciBmcm9tICcuL1NvY2NlclBsYXllci5qcyc7XHJcbmltcG9ydCBBcnJheUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9BcnJheUlPLmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IENBVkNvbnN0YW50cyBmcm9tICcuLi9DQVZDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQW5pbWF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0FuaW1hdGlvbi5qcyc7XHJcbmltcG9ydCBFYXNpbmcgZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvRWFzaW5nLmpzJztcclxuaW1wb3J0IFBvc2UgZnJvbSAnLi9Qb3NlLmpzJztcclxuaW1wb3J0IHsgQW5pbWF0aW9uTW9kZSB9IGZyb20gJy4vQW5pbWF0aW9uTW9kZS5qcyc7XHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRJTUVfQkVUV0VFTl9SQVBJRF9LSUNLUyA9IDAuNTsgLy8gaW4gc2Vjb25kc1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ0FWU2NlbmVNb2RlbCBpbXBsZW1lbnRzIFRNb2RlbCB7XHJcbiAgcHVibGljIHJlYWRvbmx5IHNvY2NlckJhbGxzOiBTb2NjZXJCYWxsW107XHJcblxyXG4gIC8vIFRoZSBudW1iZXIgb2YgYWN0aXZlIHNvY2NlciBiYWxscyAoaW5jbHVkZXMgc29jY2VyIGJhbGxzIGNyZWF0ZWQgYnV0IG5vdCB5ZXQga2lja2VkKVxyXG4gIHB1YmxpYyByZWFkb25seSBzb2NjZXJCYWxsQ291bnRQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBtYXhTb2NjZXJCYWxscyA9IENBVkNvbnN0YW50cy5OVU1CRVJfT0ZfT0JKRUNUUztcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IG1lZGlhblZhbHVlUHJvcGVydHk6IFByb3BlcnR5PG51bWJlciB8IG51bGw+O1xyXG4gIHB1YmxpYyByZWFkb25seSBtZWFuVmFsdWVQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyIHwgbnVsbD47XHJcblxyXG4gIC8vIEluZGljYXRlcyB0aGUgbWF4IGFuZCBtaW4gdmFsdWVzIGluIHRoZSBkYXRhIHNldCwgb3IgbnVsbCBpZiB0aGVyZSBhcmUgbm8gdmFsdWVzIGluIHRoZSBkYXRhIHNldFxyXG4gIHB1YmxpYyByZWFkb25seSBkYXRhUmFuZ2VQcm9wZXJ0eTogUHJvcGVydHk8UmFuZ2UgfCBudWxsPjtcclxuXHJcbiAgcHVibGljIGlzVmlzaWJsZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuXHJcbiAgLy8gU2lnbmlmeSB3aGVuZXZlciBhbnkgb2JqZWN0J3MgdmFsdWUgb3IgcG9zaXRpb24gY2hhbmdlc1xyXG4gIHB1YmxpYyByZWFkb25seSBvYmplY3RDaGFuZ2VkRW1pdHRlcjogVEVtaXR0ZXI8WyBTb2NjZXJCYWxsIF0+ID0gbmV3IEVtaXR0ZXI8WyBTb2NjZXJCYWxsIF0+KCB7XHJcbiAgICBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiBTb2NjZXJCYWxsIH0gXVxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IHRpbWVQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBvYmplY3RWYWx1ZUJlY2FtZU5vbk51bGxFbWl0dGVyOiBURW1pdHRlcjxbIFNvY2NlckJhbGwgXT47XHJcbiAgcHVibGljIHJlYWRvbmx5IHJlc2V0RW1pdHRlcjogVEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gIHB1YmxpYyByZWFkb25seSBudW1iZXJPZkRhdGFQb2ludHNQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBzb2NjZXJQbGF5ZXJzOiBTb2NjZXJQbGF5ZXJbXTtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBudW1iZXJPZlNjaGVkdWxlZFNvY2NlckJhbGxzVG9LaWNrUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG4gIHB1YmxpYyByZWFkb25seSBudW1iZXJPZlVua2lja2VkQmFsbHNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgaGFzS2lja2FibGVTb2NjZXJCYWxsc1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IHRpbWVXaGVuTGFzdEJhbGxXYXNLaWNrZWRQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRpc3RyaWJ1dGlvblByb3BlcnR5OiBQcm9wZXJ0eTxSZWFkb25seUFycmF5PG51bWJlcj4+O1xyXG5cclxuICAvLyBTdGFydGluZyBhdCAwLCBpdGVyYXRlIHRocm91Z2ggdGhlIGluZGV4IG9mIHRoZSBraWNrZXJzLiBUaGlzIHVwZGF0ZXMgdGhlIFNvY2NlclBsYXllci5pc0FjdGl2ZVByb3BlcnR5IHRvIHNob3cgdGhlIGN1cnJlbnQga2lja2VyXHJcbiAgcHJpdmF0ZSByZWFkb25seSBhY3RpdmVLaWNrZXJJbmRleFByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBpbml0aWFsRGlzdHJpYnV0aW9uOiBSZWFkb25seUFycmF5PG51bWJlcj4sIG9wdGlvbnM6IHsgdGFuZGVtOiBUYW5kZW0gfSApIHtcclxuXHJcbiAgICBjb25zdCB1cGRhdGVEYXRhTWVhc3VyZXMgPSAoKSA9PiB0aGlzLnVwZGF0ZURhdGFNZWFzdXJlcygpO1xyXG5cclxuICAgIHRoaXMuc29jY2VyQmFsbENvdW50UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgdGhpcy5tYXhTb2NjZXJCYWxscyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zb2NjZXJCYWxscyA9IF8ucmFuZ2UoIDAsIHRoaXMubWF4U29jY2VyQmFsbHMgKS5tYXAoIGluZGV4ID0+IHtcclxuXHJcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIDAsIENBVk9iamVjdFR5cGUuU09DQ0VSX0JBTEwucmFkaXVzICk7XHJcblxyXG4gICAgICBjb25zdCBzb2NjZXJCYWxsID0gbmV3IFNvY2NlckJhbGwoIHtcclxuICAgICAgICBpc0ZpcnN0T2JqZWN0OiBpbmRleCA9PT0gMCxcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggYHNvY2NlckJhbGwke2luZGV4fWAgKSxcclxuICAgICAgICBwb3NpdGlvbjogcG9zaXRpb25cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gV2hlbiB0aGUgc29jY2VyIGJhbGwgZHJhZyBwb3NpdGlvbiBjaGFuZ2VzLCBjb25zdHJhaW4gaXQgdG8gdGhlIHBoeXNpY2FsIHJhbmdlIGFuZCBtb3ZlIGl0IHRvIHRoZSB0b3AsIGlmIG5lY2Vzc2FyeVxyXG4gICAgICBzb2NjZXJCYWxsLmRyYWdQb3NpdGlvblByb3BlcnR5LmxhenlMaW5rKCAoIGRyYWdQb3NpdGlvbjogVmVjdG9yMiApID0+IHtcclxuICAgICAgICBzb2NjZXJCYWxsLnZhbHVlUHJvcGVydHkudmFsdWUgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggQ0FWQ29uc3RhbnRzLlBIWVNJQ0FMX1JBTkdFLmNvbnN0cmFpblZhbHVlKCBkcmFnUG9zaXRpb24ueCApICk7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG9Ub3AoIHNvY2NlckJhbGwgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgc29jY2VyQmFsbC52YWx1ZVByb3BlcnR5LmxpbmsoICggdmFsdWU6IG51bWJlciB8IG51bGwgKSA9PiB7XHJcbiAgICAgICAgaWYgKCB2YWx1ZSAhPT0gbnVsbCApIHtcclxuICAgICAgICAgIGlmICggIXBoZXQuam9pc3Quc2ltLmlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGVTb2NjZXJCYWxsU3RhY2soIHNvY2NlckJhbGwsIHZhbHVlICk7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiB0aGUgc29jY2VyIHBsYXllciB0aGF0IGtpY2tlZCB0aGF0IGJhbGwgd2FzIHN0aWxsIGluIGxpbmUgd2hlbiB0aGUgYmFsbCBsYW5kcywgdGhleSBjYW4gbGVhdmUgdGhlIGxpbmUgbm93LlxyXG4gICAgICAgICAgICBpZiAoIHNvY2NlckJhbGwuc29jY2VyUGxheWVyID09PSB0aGlzLmdldEZyb250U29jY2VyUGxheWVyKCkgKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5hZHZhbmNlTGluZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm9iamVjdFZhbHVlQmVjYW1lTm9uTnVsbEVtaXR0ZXIuZW1pdCggc29jY2VyQmFsbCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gU2lnbmFsIHRvIGxpc3RlbmVycyB0aGF0IGEgdmFsdWUgY2hhbmdlZFxyXG4gICAgICBzb2NjZXJCYWxsLnZhbHVlUHJvcGVydHkubGluayggKCkgPT4gdGhpcy5vYmplY3RDaGFuZ2VkRW1pdHRlci5lbWl0KCBzb2NjZXJCYWxsICkgKTtcclxuICAgICAgc29jY2VyQmFsbC5wb3NpdGlvblByb3BlcnR5LmxpbmsoICgpID0+IHRoaXMub2JqZWN0Q2hhbmdlZEVtaXR0ZXIuZW1pdCggc29jY2VyQmFsbCApICk7XHJcblxyXG4gICAgICByZXR1cm4gc29jY2VyQmFsbDtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNvY2NlckJhbGxzLmZvckVhY2goIHNvY2NlckJhbGwgPT4ge1xyXG4gICAgICBzb2NjZXJCYWxsLmlzQWN0aXZlUHJvcGVydHkubGluayggaXNBY3RpdmUgPT4ge1xyXG4gICAgICAgIHRoaXMuc29jY2VyQmFsbENvdW50UHJvcGVydHkudmFsdWUgPSB0aGlzLmdldEFjdGl2ZVNvY2NlckJhbGxzKCkubGVuZ3RoO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5tZWRpYW5WYWx1ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5PG51bWJlciB8IG51bGw+KCBudWxsLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWVkaWFuVmFsdWVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdWxsYWJsZUlPKCBOdW1iZXJJTyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5tZWFuVmFsdWVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eTxudW1iZXIgfCBudWxsPiggbnVsbCwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21lYW5WYWx1ZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bGxhYmxlSU8oIE51bWJlcklPICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmRhdGFSYW5nZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5PFJhbmdlIHwgbnVsbD4oIG51bGwgKTtcclxuXHJcbiAgICB0aGlzLm51bWJlck9mRGF0YVBvaW50c1Byb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcblxyXG4gICAgdGhpcy50aW1lUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aW1lUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm9iamVjdFZhbHVlQmVjYW1lTm9uTnVsbEVtaXR0ZXIgPSBuZXcgRW1pdHRlcjxbIFNvY2NlckJhbGwgXT4oIHtcclxuICAgICAgcGFyYW1ldGVyczogWyB7IHZhbHVlVHlwZTogU29jY2VyQmFsbCB9IF1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm51bWJlck9mU2NoZWR1bGVkU29jY2VyQmFsbHNUb0tpY2tQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ251bWJlck9mU2NoZWR1bGVkU29jY2VyQmFsbHNUb0tpY2tQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy50aW1lV2hlbkxhc3RCYWxsV2FzS2lja2VkUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aW1lV2hlbkxhc3RCYWxsV2FzS2lja2VkUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNvY2NlclBsYXllcnMgPSBfLnJhbmdlKCAwLCB0aGlzLm1heFNvY2NlckJhbGxzICkubWFwKCBwbGFjZUluTGluZSA9PiBuZXcgU29jY2VyUGxheWVyKCBwbGFjZUluTGluZSApICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGFuIGluaXRpYWwgYmFsbCB0byBzaG93IG9uIHN0YXJ0dXBcclxuICAgIHRoaXMuZ2V0TmV4dEJhbGxGcm9tUG9vbCgpO1xyXG5cclxuICAgIHRoaXMubnVtYmVyT2ZVbmtpY2tlZEJhbGxzUHJvcGVydHkgPSBEZXJpdmVkUHJvcGVydHkuZGVyaXZlQW55KCBbXHJcbiAgICAgIHRoaXMubnVtYmVyT2ZTY2hlZHVsZWRTb2NjZXJCYWxsc1RvS2lja1Byb3BlcnR5LFxyXG4gICAgICAuLi50aGlzLnNvY2NlckJhbGxzLm1hcCggc29jY2VyQmFsbCA9PiBzb2NjZXJCYWxsLnZhbHVlUHJvcGVydHkgKSxcclxuICAgICAgLi4udGhpcy5zb2NjZXJCYWxscy5tYXAoIHNvY2NlckJhbGwgPT4gc29jY2VyQmFsbC5hbmltYXRpb25Nb2RlUHJvcGVydHkgKSBdLCAoKSA9PiB7XHJcblxyXG4gICAgICBjb25zdCBraWNrZWRTb2NjZXJCYWxscyA9IHRoaXMuZ2V0QWN0aXZlU29jY2VyQmFsbHMoKS5maWx0ZXIoXHJcbiAgICAgICAgc29jY2VyQmFsbCA9PiBzb2NjZXJCYWxsLnZhbHVlUHJvcGVydHkudmFsdWUgIT09IG51bGwgfHxcclxuICAgICAgICAgICAgICAgICAgICAgIHNvY2NlckJhbGwuYW5pbWF0aW9uTW9kZVByb3BlcnR5LnZhbHVlID09PSBBbmltYXRpb25Nb2RlLkZMWUlORyB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgc29jY2VyQmFsbC5hbmltYXRpb25Nb2RlUHJvcGVydHkudmFsdWUgPT09IEFuaW1hdGlvbk1vZGUuU1RBQ0tJTkdcclxuICAgICAgKTtcclxuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLm1heFNvY2NlckJhbGxzIC0ga2lja2VkU29jY2VyQmFsbHMubGVuZ3RoIC0gdGhpcy5udW1iZXJPZlNjaGVkdWxlZFNvY2NlckJhbGxzVG9LaWNrUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5oYXNLaWNrYWJsZVNvY2NlckJhbGxzUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMubnVtYmVyT2ZVbmtpY2tlZEJhbGxzUHJvcGVydHkgXSxcclxuICAgICAgbnVtYmVyT2ZVbmtpY2tlZEJhbGxzID0+IG51bWJlck9mVW5raWNrZWRCYWxscyA+IDAgKTtcclxuXHJcbiAgICB0aGlzLmRpc3RyaWJ1dGlvblByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBpbml0aWFsRGlzdHJpYnV0aW9uLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGlzdHJpYnV0aW9uUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogQXJyYXlJTyggTnVtYmVySU8gKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoZSBkaXN0cmlidXRpb24gb2YgcHJvYmFiaWxpdGllcyBvZiB3aGVyZSB0aGUgYmFsbHMgd2lsbCBsYW5kIGlzIHJlcHJlc2VudGVkIGFzIGFuIHVuLW5vcm1hbGl6ZWQgYXJyYXkgb2Ygbm9uLW5lZ2F0aXZlLCBmbG9hdGluZy1wb2ludCBudW1iZXJzLCBvbmUgdmFsdWUgZm9yIGVhY2ggbG9jYXRpb24gaW4gdGhlIHBoeXNpY2FsIHJhbmdlJyxcclxuICAgICAgaXNWYWxpZFZhbHVlOiAoIGFycmF5OiByZWFkb25seSBudW1iZXJbXSApID0+IGFycmF5Lmxlbmd0aCA9PT0gQ0FWQ29uc3RhbnRzLlBIWVNJQ0FMX1JBTkdFLmdldExlbmd0aCgpICsgMSAmJiAvLyBpbmNsdXNpdmUgb2YgZW5kcG9pbnRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmV2ZXJ5KCBhcnJheSwgZWxlbWVudCA9PiBlbGVtZW50ID49IDAgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWN0aXZlS2lja2VySW5kZXhQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FjdGl2ZUtpY2tlckluZGV4UHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFjdGl2ZUtpY2tlckluZGV4UHJvcGVydHkubGluayggYWN0aXZlS2lja2VySW5kZXggPT4ge1xyXG4gICAgICB0aGlzLnNvY2NlclBsYXllcnMuZm9yRWFjaCggKCBzb2NjZXJQbGF5ZXIsIGluZGV4ICkgPT4ge1xyXG4gICAgICAgIHNvY2NlclBsYXllci5pc0FjdGl2ZVByb3BlcnR5LnZhbHVlID0gaW5kZXggPT09IGFjdGl2ZUtpY2tlckluZGV4O1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zb2NjZXJCYWxscy5mb3JFYWNoKCBzb2NjZXJCYWxsID0+IHtcclxuICAgICAgc29jY2VyQmFsbC52YWx1ZVByb3BlcnR5LmxpbmsoIHVwZGF0ZURhdGFNZWFzdXJlcyApO1xyXG4gICAgICBzb2NjZXJCYWxsLnBvc2l0aW9uUHJvcGVydHkubGluayggdXBkYXRlRGF0YU1lYXN1cmVzICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgdXBkYXRlRGF0YU1lYXN1cmVzKCk6IHZvaWQge1xyXG4gICAgY29uc3Qgc29ydGVkT2JqZWN0cyA9IHRoaXMuZ2V0U29ydGVkTGFuZGVkT2JqZWN0cygpO1xyXG4gICAgY29uc3QgbWVkaWFuT2JqZWN0cyA9IENBVlNjZW5lTW9kZWwuZ2V0TWVkaWFuT2JqZWN0c0Zyb21Tb3J0ZWRBcnJheSggc29ydGVkT2JqZWN0cyApO1xyXG5cclxuICAgIHRoaXMuc29jY2VyQmFsbHMuZm9yRWFjaCggb2JqZWN0ID0+IHtcclxuICAgICAgb2JqZWN0LmlzTWVkaWFuT2JqZWN0UHJvcGVydHkudmFsdWUgPSBtZWRpYW5PYmplY3RzLmluY2x1ZGVzKCBvYmplY3QgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBpZiAoIHNvcnRlZE9iamVjdHMubGVuZ3RoID4gMCApIHtcclxuXHJcbiAgICAgIC8vIHRha2UgdGhlIGF2ZXJhZ2UgdG8gYWNjb3VudCBmb3IgY2FzZXMgd2hlcmUgdGhlcmUgaXMgbW9yZSB0aGFuIG9uZSBvYmplY3QgY29udHJpYnV0aW5nIHRvIHRoZSBtZWRpYW5cclxuICAgICAgdGhpcy5tZWRpYW5WYWx1ZVByb3BlcnR5LnZhbHVlID0gXy5tZWFuKCBtZWRpYW5PYmplY3RzLm1hcCggc29jY2VyQmFsbCA9PiBzb2NjZXJCYWxsLnZhbHVlUHJvcGVydHkudmFsdWUgKSApO1xyXG5cclxuICAgICAgdGhpcy5tZWFuVmFsdWVQcm9wZXJ0eS52YWx1ZSA9IF8ubWVhbiggc29ydGVkT2JqZWN0cy5tYXAoIHNvY2NlckJhbGwgPT4gc29jY2VyQmFsbC52YWx1ZVByb3BlcnR5LnZhbHVlICkgKTtcclxuXHJcbiAgICAgIGNvbnN0IG1pbiA9IHNvcnRlZE9iamVjdHNbIDAgXS52YWx1ZVByb3BlcnR5LnZhbHVlITtcclxuICAgICAgY29uc3QgbWF4ID0gc29ydGVkT2JqZWN0c1sgc29ydGVkT2JqZWN0cy5sZW5ndGggLSAxIF0udmFsdWVQcm9wZXJ0eS52YWx1ZSE7XHJcbiAgICAgIHRoaXMuZGF0YVJhbmdlUHJvcGVydHkudmFsdWUgPSBuZXcgUmFuZ2UoIG1pbiwgbWF4ICk7XHJcblxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhaXNOYU4oIHRoaXMubWVkaWFuVmFsdWVQcm9wZXJ0eS52YWx1ZSApICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5tZWRpYW5WYWx1ZVByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICAgICAgdGhpcy5tZWFuVmFsdWVQcm9wZXJ0eS52YWx1ZSA9IG51bGw7XHJcbiAgICAgIHRoaXMuZGF0YVJhbmdlUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubnVtYmVyT2ZEYXRhUG9pbnRzUHJvcGVydHkudmFsdWUgPSBzb3J0ZWRPYmplY3RzLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYWxsIG90aGVyIG9iamVjdHMgYXQgdGhlIHRhcmdldCBwb3NpdGlvbiBvZiB0aGUgcHJvdmlkZWQgb2JqZWN0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRPdGhlck9iamVjdHNBdFRhcmdldCggc29jY2VyQmFsbDogU29jY2VyQmFsbCApOiBTb2NjZXJCYWxsW10ge1xyXG4gICAgcmV0dXJuIHRoaXMuc29jY2VyQmFsbHMuZmlsdGVyKCAoIG86IFNvY2NlckJhbGwgKSA9PiB7XHJcbiAgICAgIHJldHVybiBvLnZhbHVlUHJvcGVydHkudmFsdWUgPT09IHNvY2NlckJhbGwudmFsdWVQcm9wZXJ0eS52YWx1ZSAmJiBzb2NjZXJCYWxsICE9PSBvO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgcGFyYW1ldGVyIG9iamVjdCB0byBiZSBvbiB0b3Agb2YgdGhlIG90aGVyIG9iamVjdHMgYXQgdGhhdCB0YXJnZXQgcG9zaXRpb24uXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIG1vdmVUb1RvcCggc29jY2VyQmFsbDogU29jY2VyQmFsbCApOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBvYmplY3RzQXRUYXJnZXQgPSB0aGlzLmdldE90aGVyT2JqZWN0c0F0VGFyZ2V0KCBzb2NjZXJCYWxsICk7XHJcblxyXG4gICAgLy8gU29ydCBmcm9tIGJvdHRvbSB0byB0b3AsIHNvIHRoZXkgY2FuIGJlIHJlLXN0YWNrZWQuIFRoZSBzcGVjaWZpZWQgb2JqZWN0IHdpbGwgYXBwZWFyIGF0IHRoZSB0b3AuXHJcbiAgICBjb25zdCBzb3J0ZWRPdGhlcnMgPSBfLnNvcnRCeSggb2JqZWN0c0F0VGFyZ2V0LCBvYmplY3QgPT4gb2JqZWN0LnBvc2l0aW9uUHJvcGVydHkudmFsdWUueSApO1xyXG4gICAgY29uc3Qgc29ydGVkID0gWyAuLi5zb3J0ZWRPdGhlcnMsIHNvY2NlckJhbGwgXTtcclxuXHJcbiAgICAvLyBjb2xsYXBzZSB0aGUgcmVzdCBvZiB0aGUgc3RhY2suIE5PVEU6IFRoaXMgYXNzdW1lcyB0aGUgcmFkaWkgYXJlIHRoZSBzYW1lLlxyXG4gICAgbGV0IHBvc2l0aW9uID0gQ0FWT2JqZWN0VHlwZS5TT0NDRVJfQkFMTC5yYWRpdXM7XHJcbiAgICBzb3J0ZWQuZm9yRWFjaCggb2JqZWN0ID0+IHtcclxuICAgICAgb2JqZWN0LnBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBuZXcgVmVjdG9yMiggc29jY2VyQmFsbC52YWx1ZVByb3BlcnR5LnZhbHVlISwgcG9zaXRpb24gKTtcclxuICAgICAgcG9zaXRpb24gKz0gQ0FWT2JqZWN0VHlwZS5TT0NDRVJfQkFMTC5yYWRpdXMgKiAyO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXJzIG91dCB0aGUgZGF0YVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjbGVhckRhdGEoKTogdm9pZCB7XHJcbiAgICB0aGlzLm51bWJlck9mU2NoZWR1bGVkU29jY2VyQmFsbHNUb0tpY2tQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy50aW1lUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudGltZVdoZW5MYXN0QmFsbFdhc0tpY2tlZFByb3BlcnR5LnJlc2V0KCk7XHJcblxyXG4gICAgdGhpcy5zb2NjZXJQbGF5ZXJzLmZvckVhY2goIHNvY2NlclBsYXllciA9PiBzb2NjZXJQbGF5ZXIucmVzZXQoKSApO1xyXG4gICAgdGhpcy5zb2NjZXJCYWxscy5mb3JFYWNoKCBzb2NjZXJCYWxsID0+IHNvY2NlckJhbGwucmVzZXQoKSApO1xyXG4gICAgdGhpcy5nZXROZXh0QmFsbEZyb21Qb29sKCk7XHJcblxyXG4gICAgdGhpcy5hY3RpdmVLaWNrZXJJbmRleFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIG1vZGVsLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBUT0RPOiBUaGlzIHNob3VsZCBvbmx5IGJlIGluIE1lZGlhblNjZW5lTW9kZWwgYW5kIE1lYW5BbmRNZWRpYW5TY2VuZU1vZGVsLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NlbnRlci1hbmQtdmFyaWFiaWxpdHkvaXNzdWVzLzE1M1xyXG4gICAgdGhpcy5kaXN0cmlidXRpb25Qcm9wZXJ0eS52YWx1ZSA9IENBVlNjZW5lTW9kZWwuY2hvb3NlRGlzdHJpYnV0aW9uKCk7XHJcblxyXG4gICAgdGhpcy5jbGVhckRhdGEoKTtcclxuXHJcbiAgICB0aGlzLnJlc2V0RW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U29ydGVkTGFuZGVkT2JqZWN0cygpOiBTb2NjZXJCYWxsW10ge1xyXG4gICAgcmV0dXJuIF8uc29ydEJ5KCB0aGlzLmdldEFjdGl2ZVNvY2NlckJhbGxzKCkuZmlsdGVyKCBzb2NjZXJCYWxsID0+IHNvY2NlckJhbGwudmFsdWVQcm9wZXJ0eS52YWx1ZSAhPT0gbnVsbCApLFxyXG5cclxuICAgICAgLy8gVGhlIG51bWVyaWNhbCB2YWx1ZSB0YWtlcyBwcmVkZW5jZSBmb3Igc29ydGluZ1xyXG4gICAgICBzb2NjZXJCYWxsID0+IHNvY2NlckJhbGwudmFsdWVQcm9wZXJ0eS52YWx1ZSxcclxuXHJcbiAgICAgIC8vIFRoZW4gY29uc2lkZXIgdGhlIGhlaWdodCB3aXRoaW4gdGhlIHN0YWNrXHJcbiAgICAgIHNvY2NlckJhbGwgPT4gc29jY2VyQmFsbC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0RnJvbnRTb2NjZXJQbGF5ZXIoKTogU29jY2VyUGxheWVyIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5zb2NjZXJQbGF5ZXJzWyB0aGlzLmFjdGl2ZUtpY2tlckluZGV4UHJvcGVydHkudmFsdWUgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIHRoZSBtb2RlbC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkdCAtIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgdGhpcy50aW1lUHJvcGVydHkudmFsdWUgKz0gZHQ7XHJcbiAgICB0aGlzLmdldEFjdGl2ZVNvY2NlckJhbGxzKCkuZm9yRWFjaCggc29jY2VyQmFsbCA9PiBzb2NjZXJCYWxsLnN0ZXAoIGR0ICkgKTtcclxuXHJcbiAgICBjb25zdCBmcm9udFBsYXllciA9IHRoaXMuZ2V0RnJvbnRTb2NjZXJQbGF5ZXIoKTtcclxuXHJcbiAgICBpZiAoIGZyb250UGxheWVyICkge1xyXG5cclxuICAgICAgaWYgKCB0aGlzLm51bWJlck9mU2NoZWR1bGVkU29jY2VyQmFsbHNUb0tpY2tQcm9wZXJ0eS52YWx1ZSA+IDAgJiZcclxuICAgICAgICAgICB0aGlzLnRpbWVQcm9wZXJ0eS52YWx1ZSA+PSB0aGlzLnRpbWVXaGVuTGFzdEJhbGxXYXNLaWNrZWRQcm9wZXJ0eS52YWx1ZSArIFRJTUVfQkVUV0VFTl9SQVBJRF9LSUNLUyApIHtcclxuXHJcbiAgICAgICAgdGhpcy5hZHZhbmNlTGluZSgpO1xyXG5cclxuICAgICAgICBpZiAoIGZyb250UGxheWVyLnBvc2VQcm9wZXJ0eS52YWx1ZSA9PT0gUG9zZS5TVEFORElORyApIHtcclxuICAgICAgICAgIGZyb250UGxheWVyLnBvc2VQcm9wZXJ0eS52YWx1ZSA9IFBvc2UuUE9JU0VEX1RPX0tJQ0s7XHJcbiAgICAgICAgICBmcm9udFBsYXllci50aW1lc3RhbXBXaGVuUG9pc2VkQmVnYW4gPSB0aGlzLnRpbWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEhvdyBsb25nIGhhcyB0aGUgZnJvbnQgcGxheWVyIGJlZW4gcG9pc2VkP1xyXG4gICAgICBpZiAoIGZyb250UGxheWVyLnBvc2VQcm9wZXJ0eS52YWx1ZSA9PT0gUG9zZS5QT0lTRURfVE9fS0lDSyApIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgZnJvbnRQbGF5ZXIudGltZXN0YW1wV2hlblBvaXNlZEJlZ2FuID09PSAnbnVtYmVyJywgJ3RpbWVzdGFtcFdoZW5Qb2lzZWRCZWdhbiBzaG91bGQgYmUgYSBudW1iZXInICk7XHJcbiAgICAgICAgY29uc3QgZWxhcHNlZFRpbWUgPSB0aGlzLnRpbWVQcm9wZXJ0eS52YWx1ZSAtIGZyb250UGxheWVyLnRpbWVzdGFtcFdoZW5Qb2lzZWRCZWdhbiE7XHJcbiAgICAgICAgaWYgKCBlbGFwc2VkVGltZSA+IDAuMDc1ICkge1xyXG5cclxuICAgICAgICAgIGNvbnN0IHNvY2NlckJhbGwgPSB0aGlzLnNvY2NlckJhbGxzLmZpbmQoIHNvY2NlckJhbGwgPT5cclxuICAgICAgICAgICAgc29jY2VyQmFsbC52YWx1ZVByb3BlcnR5LnZhbHVlID09PSBudWxsICYmXHJcbiAgICAgICAgICAgIHNvY2NlckJhbGwuaXNBY3RpdmVQcm9wZXJ0eS52YWx1ZSAmJlxyXG4gICAgICAgICAgICBzb2NjZXJCYWxsLmFuaW1hdGlvbk1vZGVQcm9wZXJ0eS52YWx1ZSA9PT0gQW5pbWF0aW9uTW9kZS5OT05FXHJcbiAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgIC8vIEluIGZ1enppbmcsIHNvbWV0aW1lcyB0aGVyZSBhcmUgbm8gc29jY2VyIGJhbGxzIGF2YWlsYWJsZVxyXG4gICAgICAgICAgaWYgKCBzb2NjZXJCYWxsICkge1xyXG4gICAgICAgICAgICB0aGlzLmtpY2tCYWxsKCBmcm9udFBsYXllciwgc29jY2VyQmFsbCApO1xyXG4gICAgICAgICAgICB0aGlzLm51bWJlck9mU2NoZWR1bGVkU29jY2VyQmFsbHNUb0tpY2tQcm9wZXJ0eS52YWx1ZS0tO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gUmV0dXJucyBhIGxpc3Qgb2YgdGhlIG1lZGlhbiBvYmplY3RzIHdpdGhpbiBhIHNvcnRlZCBhcnJheSwgYmFzZWQgb24gdGhlIG9iamVjdHMnICd2YWx1ZScgcHJvcGVydHlcclxuICBwcm90ZWN0ZWQgc3RhdGljIGdldE1lZGlhbk9iamVjdHNGcm9tU29ydGVkQXJyYXkoIHNvcnRlZE9iamVjdHM6IFNvY2NlckJhbGxbXSApOiBTb2NjZXJCYWxsW10ge1xyXG5cclxuICAgIC8vIE9kZCBudW1iZXIgb2YgdmFsdWVzLCB0YWtlIHRoZSBjZW50cmFsIHZhbHVlXHJcbiAgICBpZiAoIHNvcnRlZE9iamVjdHMubGVuZ3RoICUgMiA9PT0gMSApIHtcclxuICAgICAgY29uc3QgbWlkSW5kZXggPSAoIHNvcnRlZE9iamVjdHMubGVuZ3RoIC0gMSApIC8gMjtcclxuICAgICAgcmV0dXJuIFsgc29ydGVkT2JqZWN0c1sgbWlkSW5kZXggXSBdO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHNvcnRlZE9iamVjdHMubGVuZ3RoICUgMiA9PT0gMCAmJiBzb3J0ZWRPYmplY3RzLmxlbmd0aCA+PSAyICkge1xyXG5cclxuICAgICAgLy8gRXZlbiBudW1iZXIgb2YgdmFsdWVzLCBhdmVyYWdlIHRoZSB0d28gbWlkZGxlLW1vc3QgdmFsdWVzXHJcbiAgICAgIGNvbnN0IG1pZDFJbmRleCA9ICggc29ydGVkT2JqZWN0cy5sZW5ndGggLSAyICkgLyAyO1xyXG4gICAgICBjb25zdCBtaWQySW5kZXggPSAoIHNvcnRlZE9iamVjdHMubGVuZ3RoIC0gMCApIC8gMjtcclxuICAgICAgcmV0dXJuIFsgc29ydGVkT2JqZWN0c1sgbWlkMUluZGV4IF0sIHNvcnRlZE9iamVjdHNbIG1pZDJJbmRleCBdIF07XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gV2hlbiBhIGJhbGwgbGFuZHMsIG9yIHdoZW4gdGhlIG5leHQgcGxheWVyIGlzIHN1cHBvc2VkIHRvIGtpY2sgKGJlZm9yZSB0aGUgYmFsbCBsYW5kcyksIG1vdmUgdGhlIGxpbmUgZm9yd2FyZFxyXG4gIC8vIGFuZCBxdWV1ZSB1cCB0aGUgbmV4dCBiYWxsIGFzIHdlbGxcclxuICBwcml2YXRlIGFkdmFuY2VMaW5lKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIEFsbG93IGtpY2tpbmcgYW5vdGhlciBiYWxsIHdoaWxlIG9uZSBpcyBhbHJlYWR5IGluIHRoZSBhaXIuXHJcbiAgICAvLyBpZiB0aGUgcHJldmlvdXMgYmFsbCB3YXMgc3RpbGwgaW4gdGhlIGFpciwgd2UgbmVlZCB0byBtb3ZlIHRoZSBsaW5lIGZvcndhcmQgc28gdGhlIG5leHQgcGxheWVyIGNhbiBraWNrXHJcbiAgICBjb25zdCBraWNrZXJzID0gdGhpcy5zb2NjZXJQbGF5ZXJzLmZpbHRlciggc29jY2VyUGxheWVyID0+IHNvY2NlclBsYXllci5pc0FjdGl2ZVByb3BlcnR5LnZhbHVlICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvY2NlclBsYXllci5wb3NlUHJvcGVydHkudmFsdWUgPT09IFBvc2UuS0lDS0lORyApO1xyXG4gICAgaWYgKCBraWNrZXJzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgIGxldCBuZXh0SW5kZXggPSB0aGlzLmFjdGl2ZUtpY2tlckluZGV4UHJvcGVydHkudmFsdWUgKyAxO1xyXG4gICAgICBpZiAoIG5leHRJbmRleCA+IHRoaXMubWF4U29jY2VyQmFsbHMgKSB7XHJcbiAgICAgICAgbmV4dEluZGV4ID0gMDtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmFjdGl2ZUtpY2tlckluZGV4UHJvcGVydHkudmFsdWUgPSBuZXh0SW5kZXg7XHJcbiAgICAgIHRoaXMuZ2V0TmV4dEJhbGxGcm9tUG9vbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBjaG9vc2VEaXN0cmlidXRpb24oKTogUmVhZG9ubHlBcnJheTxudW1iZXI+IHtcclxuICAgIHJldHVybiBkb3RSYW5kb20ubmV4dEJvb2xlYW4oKSA/IENBVkNvbnN0YW50cy5MRUZUX1NLRVdFRF9EQVRBIDogQ0FWQ29uc3RhbnRzLlJJR0hUX1NLRVdFRF9EQVRBO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEFjdGl2ZVNvY2NlckJhbGxzKCk6IFNvY2NlckJhbGxbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5zb2NjZXJCYWxscy5maWx0ZXIoIHNvY2NlckJhbGwgPT4gc29jY2VyQmFsbC5pc0FjdGl2ZVByb3BlcnR5LnZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGVuIGEgYmFsbCBsYW5kcyBvbiB0aGUgZ3JvdW5kLCBhbmltYXRlIGFsbCBvdGhlciBiYWxscyB0aGF0IHdlcmUgYXQgdGhpcyBsb2NhdGlvbiBhYm92ZSB0aGUgbGFuZGVkIGJhbGwuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhbmltYXRlU29jY2VyQmFsbFN0YWNrKCBzb2NjZXJCYWxsOiBTb2NjZXJCYWxsLCB2YWx1ZTogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgY29uc3Qgb3RoZXJPYmplY3RzSW5TdGFjayA9IHRoaXMuZ2V0QWN0aXZlU29jY2VyQmFsbHMoKS5maWx0ZXIoIHggPT4geC52YWx1ZVByb3BlcnR5LnZhbHVlID09PSB2YWx1ZSAmJiB4ICE9PSBzb2NjZXJCYWxsICk7XHJcbiAgICBjb25zdCBzb3J0ZWRPdGhlcnMgPSBfLnNvcnRCeSggb3RoZXJPYmplY3RzSW5TdGFjaywgb2JqZWN0ID0+IG9iamVjdC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgKTtcclxuXHJcbiAgICBzb3J0ZWRPdGhlcnMuZm9yRWFjaCggKCBzb2NjZXJCYWxsLCBpbmRleCApID0+IHtcclxuXHJcbiAgICAgIGNvbnN0IGRpYW1ldGVyID0gQ0FWT2JqZWN0VHlwZS5TT0NDRVJfQkFMTC5yYWRpdXMgKiAyO1xyXG4gICAgICBjb25zdCB0YXJnZXRQb3NpdGlvblkgPSAoIGluZGV4ICsgMSApICogZGlhbWV0ZXIgKyBDQVZPYmplY3RUeXBlLlNPQ0NFUl9CQUxMLnJhZGl1cztcclxuXHJcbiAgICAgIGlmICggc29jY2VyQmFsbC5hbmltYXRpb24gKSB7XHJcbiAgICAgICAgc29jY2VyQmFsbC5hbmltYXRpb24uc3RvcCgpO1xyXG4gICAgICB9XHJcbiAgICAgIHNvY2NlckJhbGwuYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAgICAgIGR1cmF0aW9uOiAwLjE1LFxyXG4gICAgICAgIHRhcmdldHM6IFsge1xyXG4gICAgICAgICAgcHJvcGVydHk6IHNvY2NlckJhbGwucG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgICAgIHRvOiBuZXcgVmVjdG9yMiggc29jY2VyQmFsbC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLngsIHRhcmdldFBvc2l0aW9uWSApLFxyXG4gICAgICAgICAgZWFzaW5nOiBFYXNpbmcuUVVBRFJBVElDX0lOX09VVFxyXG4gICAgICAgIH0gXVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBzb2NjZXJCYWxsLmFuaW1hdGlvbi5lbmRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgICBzb2NjZXJCYWxsLmFuaW1hdGlvbiA9IG51bGw7XHJcbiAgICAgIH0gKTtcclxuICAgICAgc29jY2VyQmFsbC5hbmltYXRpb24uc3RhcnQoKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgdGhlIHByb3ZpZGVkIG51bWJlciBvZiBiYWxscyB0byB0aGUgc2NoZWR1bGVkIGJhbGxzIHRvIGtpY2tcclxuICAgKi9cclxuICBwdWJsaWMgc2NoZWR1bGVLaWNrcyggbnVtYmVyT2ZCYWxsc1RvS2ljazogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgdGhpcy5udW1iZXJPZlNjaGVkdWxlZFNvY2NlckJhbGxzVG9LaWNrUHJvcGVydHkudmFsdWUgKz0gTWF0aC5taW4oIG51bWJlck9mQmFsbHNUb0tpY2ssIHRoaXMubnVtYmVyT2ZVbmtpY2tlZEJhbGxzUHJvcGVydHkudmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlbGVjdCBhIHRhcmdldCBsb2NhdGlvbiBmb3IgdGhlIG5leHRCYWxsVG9LaWNrLCBzZXQgaXRzIHZlbG9jaXR5IGFuZCBtYXJrIGl0IGZvciBhbmltYXRpb24uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBraWNrQmFsbCggc29jY2VyUGxheWVyOiBTb2NjZXJQbGF5ZXIsIHNvY2NlckJhbGw6IFNvY2NlckJhbGwgKTogdm9pZCB7XHJcbiAgICBzb2NjZXJQbGF5ZXIucG9zZVByb3BlcnR5LnZhbHVlID0gUG9zZS5LSUNLSU5HO1xyXG5cclxuICAgIGNvbnN0IHdlaWdodHMgPSB0aGlzLmRpc3RyaWJ1dGlvblByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdlaWdodHMubGVuZ3RoID09PSBDQVZDb25zdGFudHMuUEhZU0lDQUxfUkFOR0UuZ2V0TGVuZ3RoKCkgKyAxLCAnd2VpZ2h0IGFycmF5IHNob3VsZCBtYXRjaCB0aGUgbW9kZWwgcmFuZ2UnICk7XHJcbiAgICBjb25zdCB4MSA9IGRvdFJhbmRvbS5zYW1wbGVQcm9iYWJpbGl0aWVzKCB3ZWlnaHRzICkgKyAxO1xyXG5cclxuICAgIC8vIFJhbmdlIGVxdWF0aW9uIGlzIFI9djBeMiBzaW4oMiB0aGV0YTApIC8gZywgc2VlIGh0dHBzOi8vb3BlbnN0YXgub3JnL2Jvb2tzL3VuaXZlcnNpdHktcGh5c2ljcy12b2x1bWUtMS9wYWdlcy80LTMtcHJvamVjdGlsZS1tb3Rpb25cclxuICAgIC8vIEVxdWF0aW9uIDQuMjZcclxuICAgIGNvbnN0IGRlZ3JlZXNUb1JhZGlhbnMgPSAoIGRlZ3JlZXM6IG51bWJlciApID0+IGRlZ3JlZXMgKiBNYXRoLlBJICogMiAvIDM2MDtcclxuICAgIGNvbnN0IGFuZ2xlID0gZG90UmFuZG9tLm5leHREb3VibGVCZXR3ZWVuKCBkZWdyZWVzVG9SYWRpYW5zKCAyNSApLCBkZWdyZWVzVG9SYWRpYW5zKCA3MCApICk7XHJcbiAgICBjb25zdCB2MCA9IE1hdGguc3FydCggTWF0aC5hYnMoIHgxICogTWF0aC5hYnMoIENBVkNvbnN0YW50cy5HUkFWSVRZICkgLyBNYXRoLnNpbiggMiAqIGFuZ2xlICkgKSApO1xyXG5cclxuICAgIGNvbnN0IHZlbG9jaXR5ID0gVmVjdG9yMi5jcmVhdGVQb2xhciggdjAsIGFuZ2xlICk7XHJcbiAgICBzb2NjZXJCYWxsLnZlbG9jaXR5UHJvcGVydHkudmFsdWUgPSB2ZWxvY2l0eTtcclxuXHJcbiAgICBzb2NjZXJCYWxsLnRhcmdldFhQcm9wZXJ0eS52YWx1ZSA9IHgxO1xyXG5cclxuICAgIHNvY2NlckJhbGwuYW5pbWF0aW9uTW9kZVByb3BlcnR5LnZhbHVlID0gQW5pbWF0aW9uTW9kZS5GTFlJTkc7XHJcbiAgICB0aGlzLnRpbWVXaGVuTGFzdEJhbGxXYXNLaWNrZWRQcm9wZXJ0eS52YWx1ZSA9IHRoaXMudGltZVByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIHNvY2NlckJhbGwuc29jY2VyUGxheWVyID0gc29jY2VyUGxheWVyO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXROZXh0QmFsbEZyb21Qb29sKCk6IFNvY2NlckJhbGwgfCBudWxsIHtcclxuICAgIGNvbnN0IG5leHRCYWxsRnJvbVBvb2wgPSB0aGlzLnNvY2NlckJhbGxzLmZpbmQoIGJhbGwgPT4gIWJhbGwuaXNBY3RpdmVQcm9wZXJ0eS52YWx1ZSApIHx8IG51bGw7XHJcbiAgICBpZiAoIG5leHRCYWxsRnJvbVBvb2wgKSB7XHJcbiAgICAgIG5leHRCYWxsRnJvbVBvb2wuaXNBY3RpdmVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV4dEJhbGxGcm9tUG9vbDtcclxuICB9XHJcbn1cclxuXHJcbmNlbnRlckFuZFZhcmlhYmlsaXR5LnJlZ2lzdGVyKCAnQ0FWU2NlbmVNb2RlbCcsIENBVlNjZW5lTW9kZWwgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxvQkFBb0IsTUFBTSwrQkFBK0I7QUFFaEUsT0FBT0MsVUFBVSxNQUFNLGlCQUFpQjtBQUN4QyxPQUFPQyxhQUFhLE1BQU0sb0JBQW9CO0FBQzlDLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0MsVUFBVSxNQUFNLDJDQUEyQztBQUNsRSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBSTlELE9BQU9DLFlBQVksTUFBTSxtQkFBbUI7QUFDNUMsT0FBT0MsT0FBTyxNQUFNLHdDQUF3QztBQUM1RCxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLFlBQVksTUFBTSxvQkFBb0I7QUFDN0MsT0FBT0MsU0FBUyxNQUFNLG1DQUFtQztBQUN6RCxPQUFPQyxNQUFNLE1BQU0sZ0NBQWdDO0FBQ25ELE9BQU9DLElBQUksTUFBTSxXQUFXO0FBQzVCLFNBQVNDLGFBQWEsUUFBUSxvQkFBb0I7QUFDbEQsT0FBT0MsZUFBZSxNQUFNLHdDQUF3Qzs7QUFFcEU7QUFDQSxNQUFNQyx3QkFBd0IsR0FBRyxHQUFHLENBQUMsQ0FBQzs7QUFFdEMsZUFBZSxNQUFNQyxhQUFhLENBQW1CO0VBR25EOztFQUdnQkMsY0FBYyxHQUFHUixZQUFZLENBQUNTLGlCQUFpQjs7RUFLL0Q7O0VBR09DLGlCQUFp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