// Copyright 2021-2023, University of Colorado Boulder

/**
 * Subitizer generates the arranged and random points that make up a shape. It is also responsible for the sequence of
 * showing and hiding a shape during a challenge.
 *
 * A shape is a set of points which can be predetermined (hard coded points), random (randomly generated points), or
 * arranged (a grid-like arrangement generated with some randomness).
 *
 * An object is the representation that is rendered at each point of a shape. An object can take many forms, see
 * SubitizeObjectType for available types.
 *
 * @author Luisa Vargas
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import NumberPlayConstants from '../../common/NumberPlayConstants.js';
import numberPlay from '../../numberPlay.js';
import SubitizeObjectType from './SubitizeObjectType.js';
import numberPlayPreferences from '../../common/model/numberPlayPreferences.js';

// types

// constants
// angles
const DEGREES_0 = 0;
const DEGREES_45 = Math.PI * 0.25;
const DEGREES_90 = Math.PI * 0.5;
const DEGREES_135 = Math.PI * 0.75;
const DEGREES_180 = Math.PI;
const DEGREES_270 = Math.PI * (3 / 2);

// convenience function for easier reading
const v2 = (x, y) => new Vector2(x, y);

// define predetermined shapes, which are all assumed to be centered around (0, 0)
const PREDETERMINED_SHAPES = {
  1: [{
    points: [v2(0, 0)],
    // centered dot
    rotations: [DEGREES_0]
  }],
  2: [{
    points: [v2(-0.5, 0), v2(0.5, 0)],
    // row
    rotations: [DEGREES_0, DEGREES_45, DEGREES_90, DEGREES_135]
  }],
  3: [{
    points: [v2(-1, 0), v2(0, 0), v2(1, 0)],
    // row
    rotations: [DEGREES_0, DEGREES_90]
  }, {
    points: [v2(-1, -1), v2(0, 0), v2(1, 1)],
    // diagonal row
    rotations: [DEGREES_0, DEGREES_90]
  }, {
    points: [v2(-1, 1), v2(0, -1), v2(1, 1)],
    // triangle pointing up
    rotations: [DEGREES_0, DEGREES_90, DEGREES_180, DEGREES_270]
  }],
  4: [{
    points: [v2(-1.5, 0), v2(-0.5, 0), v2(0.5, 0), v2(1.5, 0)],
    // row
    rotations: [DEGREES_0]
  }, {
    points: [v2(-0.7, -0.7), v2(0.7, -0.7), v2(-0.7, 0.7), v2(0.7, 0.7)],
    // square
    rotations: [DEGREES_0, DEGREES_45]
  }],
  5: [{
    points: [v2(-2, 0), v2(-1, 0), v2(0, 0), v2(1, 0), v2(2, 0)],
    // row
    rotations: [DEGREES_0]
  }, {
    points: [v2(-1, -1), v2(1, -1), v2(0, 0), v2(-1, 1), v2(1, 1)],
    // 5 in a "die" formation
    rotations: [DEGREES_0]
  }, {
    points: [v2(-0.5, -1), v2(-0.5, 0), v2(-0.5, 1), v2(0.5, -0.5), v2(0.5, 0.5)],
    // 2 columns, 3:2 "zipper" formation
    rotations: [DEGREES_0, DEGREES_90, DEGREES_180, DEGREES_270]
  }, {
    points: [v2(-0.5, -1), v2(-0.5, 0), v2(-0.5, 1), v2(0.5, -1), v2(0.5, 0)],
    // 2 columns, 3:2 top-aligned
    rotations: [DEGREES_0, DEGREES_90, DEGREES_180, DEGREES_270]
  }, {
    points: [v2(-0.5, -1), v2(-0.5, 0), v2(-0.5, 1), v2(0.5, 0), v2(0.5, 1)],
    // 2 columns, 3:2 bottom-aligned
    rotations: [DEGREES_0, DEGREES_90, DEGREES_180, DEGREES_270]
  }]
};
const PROBABILITY_OF_PREDETERMINED_SHAPE = 0.6; // specified by designer

// how many decimals to round to when correcting buggy JS floats
const DECIMALS = 4;

// width of each object, in model units
const OBJECT_SIZE = 0.7;

// padding around an object, in model units. This is the closest distance that two objects can be together,
// measured from edge to edge (not center to center).
const OBJECT_PADDING = 0.2;

// the area in which the points of a shape can be created. This does not take into account the size of an object 
// rendered at each point, because a point is the center of its corresponding object.
const SHAPE_BOUNDS = new Bounds2(-2, -1, 2, 1);

// the area for the whole subitizer, including padding between the exterior and where the objects are allowed to be.
// this is used to render the subitizer node in the view.
const SUBITIZER_BOUNDS = SHAPE_BOUNDS.dilated(OBJECT_SIZE / 2 + OBJECT_PADDING);

// for calculating arranged shapes. all dependant on SHAPE_BOUNDS, but clearer to state explicitly than derive
const MIN_NUMBER_OF_COLUMNS = 2;
const MAX_NUMBER_OF_COLUMNS = 5;
const MIN_NUMBER_OF_ROWS = 2;
const MAX_NUMBER_OF_ROWS = 3;

// list of valid object types. SubitizeObjectType extends from a another enumeration, so a subset must be selected to
// get the desired values.
const SUBITIZER_OBJECT_TYPES = [SubitizeObjectType.DOG, SubitizeObjectType.APPLE, SubitizeObjectType.BUTTERFLY, SubitizeObjectType.BALL, SubitizeObjectType.CIRCLE];
class Subitizer {
  // whether the current shape is visible

  // the points of the current shape

  // if true, make random or predetermined shapes. if false, only make arranged shapes.

  // the amount of time that the sim clock has run since the shape was made visible, in seconds

  // the width and height of every object

  // Indicates when input is enabled to answer the current challenge. True when the current challenge is not solved.
  // False when the current challenge is solved. Manipulated only in the view.
  // the object type of the current shape
  // whether the delay has been started. a delay happens at the beginning of a new challenge, before revealing the
  // shape for that challenge.
  // the amount of time that the sim clock has run since the delay was started, in seconds
  // whether the loading bar is animating. This can also be used to stop an existing animation.
  static SUBITIZER_BOUNDS = SUBITIZER_BOUNDS;

  // whether the play button is visible

  constructor(challengeNumberProperty, isChallengeSolvedProperty, numberOfAnswerButtonPressesProperty, randomOrPredetermined) {
    this.challengeNumberProperty = challengeNumberProperty;
    this.isChallengeSolvedProperty = isChallengeSolvedProperty;
    this.isPlayButtonVisibleProperty = new BooleanProperty(true);
    this.isLoadingBarAnimatingProperty = new BooleanProperty(false);
    this.isShapeVisibleProperty = new BooleanProperty(false);
    this.pointsProperty = new Property([Vector2.ZERO], {
      valueType: Array,
      isValidValue: value => Array.isArray(value) && value.every(element => element instanceof Vector2)
    });
    this.randomOrPredetermined = randomOrPredetermined;
    this.isDelayStarted = false;
    this.timeSinceDelayStarted = 0;
    this.timeSinceShapeVisible = 0;
    this.objectSize = OBJECT_SIZE;
    this.isInputEnabledProperty = new BooleanProperty(false);
    this.objectTypeProperty = new EnumerationProperty(SubitizeObjectType.DOG, {
      enumeration: SubitizeObjectType.enumeration,
      validValues: SUBITIZER_OBJECT_TYPES
    });
    Subitizer.assertValidPredeterminedShapes();

    // initialize first set of points
    this.setNewPoints();
  }

  /**
   * @param dt - in seconds
   */
  step(dt) {
    if (this.isDelayStarted) {
      this.timeSinceDelayStarted += dt;

      // hide the loading bar after briefly showing it in a filled state
      if (this.timeSinceDelayStarted > 0.2 && this.isLoadingBarAnimatingProperty.value) {
        this.isLoadingBarAnimatingProperty.value = false;
      }
      // show the shape and enable answer inputs after a delay
      else if (this.timeSinceDelayStarted > NumberPlayConstants.SHAPE_DELAY_TIME) {
        this.isInputEnabledProperty.value = true;
        this.isShapeVisibleProperty.value = true;
        this.resetDelay();
      }
    }

    // hide the shape after it's been visible for long enough 
    if (this.isShapeVisibleProperty.value && this.isInputEnabledProperty.value) {
      this.timeSinceShapeVisible += dt;
      if (this.timeSinceShapeVisible > numberPlayPreferences.subitizeTimeShownProperty.value) {
        this.resetShapeVisible();
      }
    }
  }
  newChallenge() {
    // set values for the step function to handle sequence of showing and hiding game parts for a new challenge
    this.isDelayStarted = true;
    this.isInputEnabledProperty.value = false;
    this.resetShapeVisible();

    // set countingObject type and shape
    this.setRandomCountingObjectType();
    this.setNewPoints();

    // skip the challenge started sequence in the step function
    if (phet.chipper.queryParameters.showAnswers) {
      this.isLoadingBarAnimatingProperty.value = false;
      this.isDelayStarted = false;
    }
  }

  /**
   * Resets the start sequence. Because the start sequence proceeds normally if a user chooses to leave a challenge
   * after kicking off the start sequence (by clicking play), we need to reset all aspects of the start sequence
   * (including all parts that happen during the step function).
   */
  resetStartSequence() {
    this.isLoadingBarAnimatingProperty.reset();
    this.resetDelay();
    this.resetShapeVisible();
    this.isPlayButtonVisibleProperty.reset();
    this.isInputEnabledProperty.reset();
  }

  /**
   * Resets the time counter for how much time has passed since the delay started.
   */
  resetDelay() {
    this.timeSinceDelayStarted = 0;
    this.isDelayStarted = false;
  }

  /**
   * Hides the shape and resets the time counter for how long the shape has been visible.
   */
  resetShapeVisible() {
    this.isShapeVisibleProperty.value = false;
    this.timeSinceShapeVisible = 0;
  }

  /**
   * Sets this.pointsProperty with new points for the current challenge number
   */
  setNewPoints() {
    const challengeNumber = this.challengeNumberProperty.value;
    let points;
    if (this.randomOrPredetermined && dotRandom.nextDouble() <= PROBABILITY_OF_PREDETERMINED_SHAPE) {
      points = Subitizer.getPredeterminedShapePoints(challengeNumber);
    } else if (this.randomOrPredetermined) {
      points = Subitizer.getRandomShapePoints(challengeNumber);
    } else {
      points = Subitizer.getArrangedShapePoints(challengeNumber);
    }
    assert && assert(points.length === challengeNumber, 'incorrect number of points for challengeNumber ' + `${challengeNumber}: ${points.length}`);

    // two of the same shapes in a row are not allowed
    if (!_.isEqual(this.pointsProperty.value, points)) {
      this.pointsProperty.value = points;
    } else {
      this.setNewPoints();
    }
  }

  /**
   * Sets this.objectTypeProperty with a new object type for the current challenge.
   */
  setRandomCountingObjectType() {
    this.objectTypeProperty.value = dotRandom.sample(SUBITIZER_OBJECT_TYPES);
  }

  /**
   * Randomly picks out a predetermined shape with N points and applies a random available rotation, where
   * N = the provided challengeNumber.
   */
  static getPredeterminedShapePoints(challengeNumber) {
    assert && assert(PREDETERMINED_SHAPES && PREDETERMINED_SHAPES[challengeNumber], `There exists no predetermined shape for challenge number ${challengeNumber}. ` + `Predetermined shapes: ${Object.keys(PREDETERMINED_SHAPES).toString()}`);
    const shapeIndex = dotRandom.nextInt(PREDETERMINED_SHAPES[challengeNumber].length);
    const shape = PREDETERMINED_SHAPES[challengeNumber][shapeIndex];
    const rotationIndex = dotRandom.nextInt(shape.rotations.length);
    return Subitizer.rotatePoints(shape.points, shape.rotations[rotationIndex]);
  }

  /**
   * Randomly generates N points inside the available bounds, where N = the provided challengeNumber.
   */
  static getRandomShapePoints(challengeNumber) {
    const points = [];
    while (points.length < challengeNumber) {
      const randomX = dotRandom.nextDoubleBetween(SHAPE_BOUNDS.minX, SHAPE_BOUNDS.maxX);
      const randomY = dotRandom.nextDoubleBetween(SHAPE_BOUNDS.minY, SHAPE_BOUNDS.maxY);

      // add a new point if it doesn't exist yet and does not overlap with the existing points
      const objectsOverlap = Subitizer.objectsOverlap(points, randomX, randomY);
      if (!_.find(points, object => object.x === randomX && object.y === randomY) && !objectsOverlap) {
        points.push(new Vector2(randomX, randomY));
      }
    }
    return points;
  }

  /**
   * Randomly generates an arranged shape with N points, where N = the provided challengeNumber. An arranged shape is
   * a block of points, where the remainder of points that dont fit into the block are located on the upper left, upper
   * right, lower left, or lower right of the block.
   */
  static getArrangedShapePoints(challengeNumber) {
    const numberOfRows = dotRandom.nextIntBetween(MIN_NUMBER_OF_ROWS, MAX_NUMBER_OF_ROWS);
    let minNumberOfColumns = MIN_NUMBER_OF_COLUMNS;

    // get the minimum number of columns needed to fit all the points in the arrangement given the chosen number of rows
    while (minNumberOfColumns * numberOfRows < challengeNumber) {
      minNumberOfColumns++;
    }

    // get the maximum number of columns that should be used such that every row will still have a least one point given
    // the chosen number of rows (since we generate the points from left to right, top to bottom).
    let maxNumberOfColumns = minNumberOfColumns;
    while (challengeNumber > (maxNumberOfColumns + 1) * (numberOfRows - 1) && maxNumberOfColumns < MAX_NUMBER_OF_COLUMNS) {
      maxNumberOfColumns++;
    }
    const numberOfColumns = dotRandom.nextIntBetween(minNumberOfColumns, maxNumberOfColumns);

    // calculate the center of the first point to draw in the shape (upper left corner of the shape). This assumes that
    // the center of the shape is at (0, 0).
    const getStartCoordinate = n => (n - 1) / -2;
    const startX = getStartCoordinate(numberOfColumns);
    const startY = getStartCoordinate(numberOfRows);

    // create and add all points in calculated "rectangle" (numberOfRows by numberOfColumns), which may end up being
    // more points than are needed, drawing them from left to right, top to bottom
    const points = [];
    for (let j = 0; j < numberOfRows; j++) {
      for (let i = 0; i < numberOfColumns; i++) {
        points.push(new Vector2(startX + i, startY + j));
      }
    }

    // both used for the correct number of points, where the remainder was removed from the block
    let reducedPoints;
    const reducedShiftedPoints = points;

    // randomly pick between modifying the top row or bottom row
    if (dotRandom.nextBoolean()) {
      const sliceIndex = points.length - challengeNumber;

      // remove extra points from the top row, left side
      reducedPoints = points.slice(sliceIndex);

      // remove extra points from the top row, right side
      reducedShiftedPoints.splice(numberOfColumns - sliceIndex, sliceIndex);
    } else {
      // remove extra points from the bottom row, right side
      reducedPoints = points.slice(0, challengeNumber);

      // remove extra points from the bottom row, left side
      reducedShiftedPoints.splice(points.length - numberOfColumns, points.length - challengeNumber);
    }

    // randomly pick between the two types of reduced points
    return dotRandom.nextBoolean() ? reducedPoints : reducedShiftedPoints;
  }

  /**
   * Rotates each point of the shape around the origin, which is assumed to be (0, 0).
   */
  static rotatePoints(points, rotationAngle) {
    const rotationMatrix = new Matrix3().setToRotationZ(rotationAngle);
    const rotatedPoints = [];
    points.forEach(point => rotatedPoints.push(rotationMatrix.timesVector2(point)));
    return rotatedPoints;
  }

  /**
   * Compares the bounds of a point to be added to all other existing points and returns if the point to
   * be added overlaps with any existing point.
   */
  static objectsOverlap(points, xCoordinate, yCoordinate) {
    let overlap = false;
    const objectTotalWidth = OBJECT_SIZE + OBJECT_PADDING;
    const objectTotalHalfWidth = objectTotalWidth / 2;
    if (points.length > 0) {
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const pointObjectBounds = new Bounds2(point.x - objectTotalHalfWidth, point.y - objectTotalHalfWidth, point.x + objectTotalHalfWidth, point.y + objectTotalHalfWidth);
        const otherPointObjectBounds = new Bounds2(xCoordinate - objectTotalHalfWidth, yCoordinate - objectTotalHalfWidth, xCoordinate + objectTotalHalfWidth, yCoordinate + objectTotalHalfWidth);
        overlap = pointObjectBounds.intersectsBounds(otherPointObjectBounds);
        if (overlap) {
          break;
        }
      }
    }
    return overlap;
  }

  /**
   * Asserts that every point in every predetermined shape is within the model bounds for every possible rotation of the
   * shape.
   */
  static assertValidPredeterminedShapes() {
    for (const key in PREDETERMINED_SHAPES) {
      PREDETERMINED_SHAPES[key].forEach(shape => {
        // iterate over each shape in the shape set for the given number (key)

        // check that the points of each rotation for a shape are within the model bounds
        shape.rotations.forEach(rotationAngle => {
          const rotatedPoints = Subitizer.rotatePoints(shape.points, rotationAngle);
          rotatedPoints.forEach(point => assert && assert(SHAPE_BOUNDS.containsPoint(Subitizer.fixPoint(point)), `vector point ${point.toString()} from shape ${key} is outside the object bounds when a rotation of ` + `${rotationAngle * (180 / Math.PI)} degrees is applied: ${SHAPE_BOUNDS.toString()}`));
        });
      });
    }
  }

  /**
   * Fixes points that have wrong values due to JavaScript decimal math error.
   */
  static fixPoint(point) {
    return new Vector2(Utils.toFixedNumber(point.x, DECIMALS), Utils.toFixedNumber(point.y, DECIMALS));
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
}
numberPlay.register('Subitizer', Subitizer);
export default Subitizer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbnVtZXJhdGlvblByb3BlcnR5IiwiUHJvcGVydHkiLCJCb3VuZHMyIiwiZG90UmFuZG9tIiwiTWF0cml4MyIsIlV0aWxzIiwiVmVjdG9yMiIsIk51bWJlclBsYXlDb25zdGFudHMiLCJudW1iZXJQbGF5IiwiU3ViaXRpemVPYmplY3RUeXBlIiwibnVtYmVyUGxheVByZWZlcmVuY2VzIiwiREVHUkVFU18wIiwiREVHUkVFU180NSIsIk1hdGgiLCJQSSIsIkRFR1JFRVNfOTAiLCJERUdSRUVTXzEzNSIsIkRFR1JFRVNfMTgwIiwiREVHUkVFU18yNzAiLCJ2MiIsIngiLCJ5IiwiUFJFREVURVJNSU5FRF9TSEFQRVMiLCJwb2ludHMiLCJyb3RhdGlvbnMiLCJQUk9CQUJJTElUWV9PRl9QUkVERVRFUk1JTkVEX1NIQVBFIiwiREVDSU1BTFMiLCJPQkpFQ1RfU0laRSIsIk9CSkVDVF9QQURESU5HIiwiU0hBUEVfQk9VTkRTIiwiU1VCSVRJWkVSX0JPVU5EUyIsImRpbGF0ZWQiLCJNSU5fTlVNQkVSX09GX0NPTFVNTlMiLCJNQVhfTlVNQkVSX09GX0NPTFVNTlMiLCJNSU5fTlVNQkVSX09GX1JPV1MiLCJNQVhfTlVNQkVSX09GX1JPV1MiLCJTVUJJVElaRVJfT0JKRUNUX1RZUEVTIiwiRE9HIiwiQVBQTEUiLCJCVVRURVJGTFkiLCJCQUxMIiwiQ0lSQ0xFIiwiU3ViaXRpemVyIiwiY29uc3RydWN0b3IiLCJjaGFsbGVuZ2VOdW1iZXJQcm9wZXJ0eSIsImlzQ2hhbGxlbmdlU29sdmVkUHJvcGVydHkiLCJudW1iZXJPZkFuc3dlckJ1dHRvblByZXNzZXNQcm9wZXJ0eSIsInJhbmRvbU9yUHJlZGV0ZXJtaW5lZCIsImlzUGxheUJ1dHRvblZpc2libGVQcm9wZXJ0eSIsImlzTG9hZGluZ0JhckFuaW1hdGluZ1Byb3BlcnR5IiwiaXNTaGFwZVZpc2libGVQcm9wZXJ0eSIsInBvaW50c1Byb3BlcnR5IiwiWkVSTyIsInZhbHVlVHlwZSIsIkFycmF5IiwiaXNWYWxpZFZhbHVlIiwidmFsdWUiLCJpc0FycmF5IiwiZXZlcnkiLCJlbGVtZW50IiwiaXNEZWxheVN0YXJ0ZWQiLCJ0aW1lU2luY2VEZWxheVN0YXJ0ZWQiLCJ0aW1lU2luY2VTaGFwZVZpc2libGUiLCJvYmplY3RTaXplIiwiaXNJbnB1dEVuYWJsZWRQcm9wZXJ0eSIsIm9iamVjdFR5cGVQcm9wZXJ0eSIsImVudW1lcmF0aW9uIiwidmFsaWRWYWx1ZXMiLCJhc3NlcnRWYWxpZFByZWRldGVybWluZWRTaGFwZXMiLCJzZXROZXdQb2ludHMiLCJzdGVwIiwiZHQiLCJTSEFQRV9ERUxBWV9USU1FIiwicmVzZXREZWxheSIsInN1Yml0aXplVGltZVNob3duUHJvcGVydHkiLCJyZXNldFNoYXBlVmlzaWJsZSIsIm5ld0NoYWxsZW5nZSIsInNldFJhbmRvbUNvdW50aW5nT2JqZWN0VHlwZSIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwic2hvd0Fuc3dlcnMiLCJyZXNldFN0YXJ0U2VxdWVuY2UiLCJyZXNldCIsImNoYWxsZW5nZU51bWJlciIsIm5leHREb3VibGUiLCJnZXRQcmVkZXRlcm1pbmVkU2hhcGVQb2ludHMiLCJnZXRSYW5kb21TaGFwZVBvaW50cyIsImdldEFycmFuZ2VkU2hhcGVQb2ludHMiLCJhc3NlcnQiLCJsZW5ndGgiLCJfIiwiaXNFcXVhbCIsInNhbXBsZSIsIk9iamVjdCIsImtleXMiLCJ0b1N0cmluZyIsInNoYXBlSW5kZXgiLCJuZXh0SW50Iiwic2hhcGUiLCJyb3RhdGlvbkluZGV4Iiwicm90YXRlUG9pbnRzIiwicmFuZG9tWCIsIm5leHREb3VibGVCZXR3ZWVuIiwibWluWCIsIm1heFgiLCJyYW5kb21ZIiwibWluWSIsIm1heFkiLCJvYmplY3RzT3ZlcmxhcCIsImZpbmQiLCJvYmplY3QiLCJwdXNoIiwibnVtYmVyT2ZSb3dzIiwibmV4dEludEJldHdlZW4iLCJtaW5OdW1iZXJPZkNvbHVtbnMiLCJtYXhOdW1iZXJPZkNvbHVtbnMiLCJudW1iZXJPZkNvbHVtbnMiLCJnZXRTdGFydENvb3JkaW5hdGUiLCJuIiwic3RhcnRYIiwic3RhcnRZIiwiaiIsImkiLCJyZWR1Y2VkUG9pbnRzIiwicmVkdWNlZFNoaWZ0ZWRQb2ludHMiLCJuZXh0Qm9vbGVhbiIsInNsaWNlSW5kZXgiLCJzbGljZSIsInNwbGljZSIsInJvdGF0aW9uQW5nbGUiLCJyb3RhdGlvbk1hdHJpeCIsInNldFRvUm90YXRpb25aIiwicm90YXRlZFBvaW50cyIsImZvckVhY2giLCJwb2ludCIsInRpbWVzVmVjdG9yMiIsInhDb29yZGluYXRlIiwieUNvb3JkaW5hdGUiLCJvdmVybGFwIiwib2JqZWN0VG90YWxXaWR0aCIsIm9iamVjdFRvdGFsSGFsZldpZHRoIiwicG9pbnRPYmplY3RCb3VuZHMiLCJvdGhlclBvaW50T2JqZWN0Qm91bmRzIiwiaW50ZXJzZWN0c0JvdW5kcyIsImtleSIsImNvbnRhaW5zUG9pbnQiLCJmaXhQb2ludCIsInRvRml4ZWROdW1iZXIiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTdWJpdGl6ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU3ViaXRpemVyIGdlbmVyYXRlcyB0aGUgYXJyYW5nZWQgYW5kIHJhbmRvbSBwb2ludHMgdGhhdCBtYWtlIHVwIGEgc2hhcGUuIEl0IGlzIGFsc28gcmVzcG9uc2libGUgZm9yIHRoZSBzZXF1ZW5jZSBvZlxyXG4gKiBzaG93aW5nIGFuZCBoaWRpbmcgYSBzaGFwZSBkdXJpbmcgYSBjaGFsbGVuZ2UuXHJcbiAqXHJcbiAqIEEgc2hhcGUgaXMgYSBzZXQgb2YgcG9pbnRzIHdoaWNoIGNhbiBiZSBwcmVkZXRlcm1pbmVkIChoYXJkIGNvZGVkIHBvaW50cyksIHJhbmRvbSAocmFuZG9tbHkgZ2VuZXJhdGVkIHBvaW50cyksIG9yXHJcbiAqIGFycmFuZ2VkIChhIGdyaWQtbGlrZSBhcnJhbmdlbWVudCBnZW5lcmF0ZWQgd2l0aCBzb21lIHJhbmRvbW5lc3MpLlxyXG4gKlxyXG4gKiBBbiBvYmplY3QgaXMgdGhlIHJlcHJlc2VudGF0aW9uIHRoYXQgaXMgcmVuZGVyZWQgYXQgZWFjaCBwb2ludCBvZiBhIHNoYXBlLiBBbiBvYmplY3QgY2FuIHRha2UgbWFueSBmb3Jtcywgc2VlXHJcbiAqIFN1Yml0aXplT2JqZWN0VHlwZSBmb3IgYXZhaWxhYmxlIHR5cGVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEx1aXNhIFZhcmdhc1xyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IE51bWJlclBsYXlDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL051bWJlclBsYXlDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgbnVtYmVyUGxheSBmcm9tICcuLi8uLi9udW1iZXJQbGF5LmpzJztcclxuaW1wb3J0IFN1Yml0aXplT2JqZWN0VHlwZSBmcm9tICcuL1N1Yml0aXplT2JqZWN0VHlwZS5qcyc7XHJcbmltcG9ydCBudW1iZXJQbGF5UHJlZmVyZW5jZXMgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL251bWJlclBsYXlQcmVmZXJlbmNlcy5qcyc7XHJcblxyXG4vLyB0eXBlc1xyXG50eXBlIFByZWRldGVybWluZWRTaGFwZXMgPSBSZWNvcmQ8bnVtYmVyLCB7XHJcbiAgcG9pbnRzOiBWZWN0b3IyW107XHJcbiAgcm90YXRpb25zOiBudW1iZXJbXTtcclxufVtdPjtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5cclxuLy8gYW5nbGVzXHJcbmNvbnN0IERFR1JFRVNfMCA9IDA7XHJcbmNvbnN0IERFR1JFRVNfNDUgPSBNYXRoLlBJICogMC4yNTtcclxuY29uc3QgREVHUkVFU185MCA9IE1hdGguUEkgKiAwLjU7XHJcbmNvbnN0IERFR1JFRVNfMTM1ID0gTWF0aC5QSSAqIDAuNzU7XHJcbmNvbnN0IERFR1JFRVNfMTgwID0gTWF0aC5QSTtcclxuY29uc3QgREVHUkVFU18yNzAgPSBNYXRoLlBJICogKCAzIC8gMiApO1xyXG5cclxuLy8gY29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIGVhc2llciByZWFkaW5nXHJcbmNvbnN0IHYyID0gKCB4OiBudW1iZXIsIHk6IG51bWJlciApID0+IG5ldyBWZWN0b3IyKCB4LCB5ICk7XHJcblxyXG4vLyBkZWZpbmUgcHJlZGV0ZXJtaW5lZCBzaGFwZXMsIHdoaWNoIGFyZSBhbGwgYXNzdW1lZCB0byBiZSBjZW50ZXJlZCBhcm91bmQgKDAsIDApXHJcbmNvbnN0IFBSRURFVEVSTUlORURfU0hBUEVTOiBQcmVkZXRlcm1pbmVkU2hhcGVzID0ge1xyXG4gIDE6IFsge1xyXG4gICAgcG9pbnRzOiBbIHYyKCAwLCAwICkgXSwgLy8gY2VudGVyZWQgZG90XHJcbiAgICByb3RhdGlvbnM6IFsgREVHUkVFU18wIF1cclxuICB9IF0sXHJcbiAgMjogWyB7XHJcbiAgICBwb2ludHM6IFsgdjIoIC0wLjUsIDAgKSwgdjIoIDAuNSwgMCApIF0sIC8vIHJvd1xyXG4gICAgcm90YXRpb25zOiBbIERFR1JFRVNfMCwgREVHUkVFU180NSwgREVHUkVFU185MCwgREVHUkVFU18xMzUgXVxyXG4gIH0gXSxcclxuICAzOiBbIHtcclxuICAgIHBvaW50czogWyB2MiggLTEsIDAgKSwgdjIoIDAsIDAgKSwgdjIoIDEsIDAgKSBdLCAvLyByb3dcclxuICAgIHJvdGF0aW9uczogWyBERUdSRUVTXzAsIERFR1JFRVNfOTAgXVxyXG4gIH0sIHtcclxuICAgIHBvaW50czogWyB2MiggLTEsIC0xICksIHYyKCAwLCAwICksIHYyKCAxLCAxICkgXSwgLy8gZGlhZ29uYWwgcm93XHJcbiAgICByb3RhdGlvbnM6IFsgREVHUkVFU18wLCBERUdSRUVTXzkwIF1cclxuICB9LCB7XHJcbiAgICBwb2ludHM6IFsgdjIoIC0xLCAxICksIHYyKCAwLCAtMSApLCB2MiggMSwgMSApIF0sIC8vIHRyaWFuZ2xlIHBvaW50aW5nIHVwXHJcbiAgICByb3RhdGlvbnM6IFsgREVHUkVFU18wLCBERUdSRUVTXzkwLCBERUdSRUVTXzE4MCwgREVHUkVFU18yNzAgXVxyXG4gIH0gXSxcclxuICA0OiBbIHtcclxuICAgIHBvaW50czogWyB2MiggLTEuNSwgMCApLCB2MiggLTAuNSwgMCApLCB2MiggMC41LCAwICksIHYyKCAxLjUsIDAgKSBdLCAvLyByb3dcclxuICAgIHJvdGF0aW9uczogWyBERUdSRUVTXzAgXVxyXG4gIH0sIHtcclxuICAgIHBvaW50czogWyB2MiggLTAuNywgLTAuNyApLCB2MiggMC43LCAtMC43ICksIHYyKCAtMC43LCAwLjcgKSwgdjIoIDAuNywgMC43ICkgXSwgLy8gc3F1YXJlXHJcbiAgICByb3RhdGlvbnM6IFsgREVHUkVFU18wLCBERUdSRUVTXzQ1IF1cclxuICB9IF0sXHJcbiAgNTogWyB7XHJcbiAgICBwb2ludHM6IFsgdjIoIC0yLCAwICksIHYyKCAtMSwgMCApLCB2MiggMCwgMCApLCB2MiggMSwgMCApLCB2MiggMiwgMCApIF0sIC8vIHJvd1xyXG4gICAgcm90YXRpb25zOiBbIERFR1JFRVNfMCBdXHJcbiAgfSwge1xyXG4gICAgcG9pbnRzOiBbIHYyKCAtMSwgLTEgKSwgdjIoIDEsIC0xICksIHYyKCAwLCAwICksIHYyKCAtMSwgMSApLCB2MiggMSwgMSApIF0sIC8vIDUgaW4gYSBcImRpZVwiIGZvcm1hdGlvblxyXG4gICAgcm90YXRpb25zOiBbIERFR1JFRVNfMCBdXHJcbiAgfSwge1xyXG4gICAgcG9pbnRzOiBbIHYyKCAtMC41LCAtMSApLCB2MiggLTAuNSwgMCApLCB2MiggLTAuNSwgMSApLCB2MiggMC41LCAtMC41ICksIHYyKCAwLjUsIDAuNSApIF0sIC8vIDIgY29sdW1ucywgMzoyIFwiemlwcGVyXCIgZm9ybWF0aW9uXHJcbiAgICByb3RhdGlvbnM6IFsgREVHUkVFU18wLCBERUdSRUVTXzkwLCBERUdSRUVTXzE4MCwgREVHUkVFU18yNzAgXVxyXG4gIH0sIHtcclxuICAgIHBvaW50czogWyB2MiggLTAuNSwgLTEgKSwgdjIoIC0wLjUsIDAgKSwgdjIoIC0wLjUsIDEgKSwgdjIoIDAuNSwgLTEgKSwgdjIoIDAuNSwgMCApIF0sIC8vIDIgY29sdW1ucywgMzoyIHRvcC1hbGlnbmVkXHJcbiAgICByb3RhdGlvbnM6IFsgREVHUkVFU18wLCBERUdSRUVTXzkwLCBERUdSRUVTXzE4MCwgREVHUkVFU18yNzAgXVxyXG4gIH0sIHtcclxuICAgIHBvaW50czogWyB2MiggLTAuNSwgLTEgKSwgdjIoIC0wLjUsIDAgKSwgdjIoIC0wLjUsIDEgKSwgdjIoIDAuNSwgMCApLCB2MiggMC41LCAxICkgXSwgLy8gMiBjb2x1bW5zLCAzOjIgYm90dG9tLWFsaWduZWRcclxuICAgIHJvdGF0aW9uczogWyBERUdSRUVTXzAsIERFR1JFRVNfOTAsIERFR1JFRVNfMTgwLCBERUdSRUVTXzI3MCBdXHJcbiAgfSBdXHJcbn07XHJcbmNvbnN0IFBST0JBQklMSVRZX09GX1BSRURFVEVSTUlORURfU0hBUEUgPSAwLjY7IC8vIHNwZWNpZmllZCBieSBkZXNpZ25lclxyXG5cclxuLy8gaG93IG1hbnkgZGVjaW1hbHMgdG8gcm91bmQgdG8gd2hlbiBjb3JyZWN0aW5nIGJ1Z2d5IEpTIGZsb2F0c1xyXG5jb25zdCBERUNJTUFMUyA9IDQ7XHJcblxyXG4vLyB3aWR0aCBvZiBlYWNoIG9iamVjdCwgaW4gbW9kZWwgdW5pdHNcclxuY29uc3QgT0JKRUNUX1NJWkUgPSAwLjc7XHJcblxyXG4vLyBwYWRkaW5nIGFyb3VuZCBhbiBvYmplY3QsIGluIG1vZGVsIHVuaXRzLiBUaGlzIGlzIHRoZSBjbG9zZXN0IGRpc3RhbmNlIHRoYXQgdHdvIG9iamVjdHMgY2FuIGJlIHRvZ2V0aGVyLFxyXG4vLyBtZWFzdXJlZCBmcm9tIGVkZ2UgdG8gZWRnZSAobm90IGNlbnRlciB0byBjZW50ZXIpLlxyXG5jb25zdCBPQkpFQ1RfUEFERElORyA9IDAuMjtcclxuXHJcbi8vIHRoZSBhcmVhIGluIHdoaWNoIHRoZSBwb2ludHMgb2YgYSBzaGFwZSBjYW4gYmUgY3JlYXRlZC4gVGhpcyBkb2VzIG5vdCB0YWtlIGludG8gYWNjb3VudCB0aGUgc2l6ZSBvZiBhbiBvYmplY3QgXHJcbi8vIHJlbmRlcmVkIGF0IGVhY2ggcG9pbnQsIGJlY2F1c2UgYSBwb2ludCBpcyB0aGUgY2VudGVyIG9mIGl0cyBjb3JyZXNwb25kaW5nIG9iamVjdC5cclxuY29uc3QgU0hBUEVfQk9VTkRTID0gbmV3IEJvdW5kczIoIC0yLCAtMSwgMiwgMSApO1xyXG5cclxuLy8gdGhlIGFyZWEgZm9yIHRoZSB3aG9sZSBzdWJpdGl6ZXIsIGluY2x1ZGluZyBwYWRkaW5nIGJldHdlZW4gdGhlIGV4dGVyaW9yIGFuZCB3aGVyZSB0aGUgb2JqZWN0cyBhcmUgYWxsb3dlZCB0byBiZS5cclxuLy8gdGhpcyBpcyB1c2VkIHRvIHJlbmRlciB0aGUgc3ViaXRpemVyIG5vZGUgaW4gdGhlIHZpZXcuXHJcbmNvbnN0IFNVQklUSVpFUl9CT1VORFMgPSBTSEFQRV9CT1VORFMuZGlsYXRlZCggT0JKRUNUX1NJWkUgLyAyICsgT0JKRUNUX1BBRERJTkcgKTtcclxuXHJcbi8vIGZvciBjYWxjdWxhdGluZyBhcnJhbmdlZCBzaGFwZXMuIGFsbCBkZXBlbmRhbnQgb24gU0hBUEVfQk9VTkRTLCBidXQgY2xlYXJlciB0byBzdGF0ZSBleHBsaWNpdGx5IHRoYW4gZGVyaXZlXHJcbmNvbnN0IE1JTl9OVU1CRVJfT0ZfQ09MVU1OUyA9IDI7XHJcbmNvbnN0IE1BWF9OVU1CRVJfT0ZfQ09MVU1OUyA9IDU7XHJcbmNvbnN0IE1JTl9OVU1CRVJfT0ZfUk9XUyA9IDI7XHJcbmNvbnN0IE1BWF9OVU1CRVJfT0ZfUk9XUyA9IDM7XHJcblxyXG4vLyBsaXN0IG9mIHZhbGlkIG9iamVjdCB0eXBlcy4gU3ViaXRpemVPYmplY3RUeXBlIGV4dGVuZHMgZnJvbSBhIGFub3RoZXIgZW51bWVyYXRpb24sIHNvIGEgc3Vic2V0IG11c3QgYmUgc2VsZWN0ZWQgdG9cclxuLy8gZ2V0IHRoZSBkZXNpcmVkIHZhbHVlcy5cclxuY29uc3QgU1VCSVRJWkVSX09CSkVDVF9UWVBFUyA9IFtcclxuICBTdWJpdGl6ZU9iamVjdFR5cGUuRE9HLCBTdWJpdGl6ZU9iamVjdFR5cGUuQVBQTEUsIFN1Yml0aXplT2JqZWN0VHlwZS5CVVRURVJGTFksIFN1Yml0aXplT2JqZWN0VHlwZS5CQUxMLFxyXG4gIFN1Yml0aXplT2JqZWN0VHlwZS5DSVJDTEVcclxuXTtcclxuXHJcbmNsYXNzIFN1Yml0aXplciB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgY2hhbGxlbmdlTnVtYmVyUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBpc0NoYWxsZW5nZVNvbHZlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gd2hldGhlciB0aGUgY3VycmVudCBzaGFwZSBpcyB2aXNpYmxlXHJcbiAgcHVibGljIHJlYWRvbmx5IGlzU2hhcGVWaXNpYmxlUHJvcGVydHk6IEJvb2xlYW5Qcm9wZXJ0eTtcclxuXHJcbiAgLy8gdGhlIHBvaW50cyBvZiB0aGUgY3VycmVudCBzaGFwZVxyXG4gIHB1YmxpYyByZWFkb25seSBwb2ludHNQcm9wZXJ0eTogUHJvcGVydHk8VmVjdG9yMltdPjtcclxuXHJcbiAgLy8gaWYgdHJ1ZSwgbWFrZSByYW5kb20gb3IgcHJlZGV0ZXJtaW5lZCBzaGFwZXMuIGlmIGZhbHNlLCBvbmx5IG1ha2UgYXJyYW5nZWQgc2hhcGVzLlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmFuZG9tT3JQcmVkZXRlcm1pbmVkOiBib29sZWFuO1xyXG5cclxuICAvLyB0aGUgYW1vdW50IG9mIHRpbWUgdGhhdCB0aGUgc2ltIGNsb2NrIGhhcyBydW4gc2luY2UgdGhlIHNoYXBlIHdhcyBtYWRlIHZpc2libGUsIGluIHNlY29uZHNcclxuICBwcml2YXRlIHRpbWVTaW5jZVNoYXBlVmlzaWJsZTogbnVtYmVyO1xyXG5cclxuICAvLyB0aGUgd2lkdGggYW5kIGhlaWdodCBvZiBldmVyeSBvYmplY3RcclxuICBwdWJsaWMgcmVhZG9ubHkgb2JqZWN0U2l6ZTogbnVtYmVyO1xyXG5cclxuICAvLyBJbmRpY2F0ZXMgd2hlbiBpbnB1dCBpcyBlbmFibGVkIHRvIGFuc3dlciB0aGUgY3VycmVudCBjaGFsbGVuZ2UuIFRydWUgd2hlbiB0aGUgY3VycmVudCBjaGFsbGVuZ2UgaXMgbm90IHNvbHZlZC5cclxuICAvLyBGYWxzZSB3aGVuIHRoZSBjdXJyZW50IGNoYWxsZW5nZSBpcyBzb2x2ZWQuIE1hbmlwdWxhdGVkIG9ubHkgaW4gdGhlIHZpZXcuXHJcbiAgcHVibGljIHJlYWRvbmx5IGlzSW5wdXRFbmFibGVkUHJvcGVydHk6IEJvb2xlYW5Qcm9wZXJ0eTtcclxuXHJcbiAgLy8gdGhlIG9iamVjdCB0eXBlIG9mIHRoZSBjdXJyZW50IHNoYXBlXHJcbiAgcHVibGljIHJlYWRvbmx5IG9iamVjdFR5cGVQcm9wZXJ0eTogRW51bWVyYXRpb25Qcm9wZXJ0eTxTdWJpdGl6ZU9iamVjdFR5cGU+O1xyXG5cclxuICAvLyB3aGV0aGVyIHRoZSBkZWxheSBoYXMgYmVlbiBzdGFydGVkLiBhIGRlbGF5IGhhcHBlbnMgYXQgdGhlIGJlZ2lubmluZyBvZiBhIG5ldyBjaGFsbGVuZ2UsIGJlZm9yZSByZXZlYWxpbmcgdGhlXHJcbiAgLy8gc2hhcGUgZm9yIHRoYXQgY2hhbGxlbmdlLlxyXG4gIHByaXZhdGUgaXNEZWxheVN0YXJ0ZWQ6IGJvb2xlYW47XHJcblxyXG4gIC8vIHRoZSBhbW91bnQgb2YgdGltZSB0aGF0IHRoZSBzaW0gY2xvY2sgaGFzIHJ1biBzaW5jZSB0aGUgZGVsYXkgd2FzIHN0YXJ0ZWQsIGluIHNlY29uZHNcclxuICBwcml2YXRlIHRpbWVTaW5jZURlbGF5U3RhcnRlZDogbnVtYmVyO1xyXG5cclxuICAvLyB3aGV0aGVyIHRoZSBsb2FkaW5nIGJhciBpcyBhbmltYXRpbmcuIFRoaXMgY2FuIGFsc28gYmUgdXNlZCB0byBzdG9wIGFuIGV4aXN0aW5nIGFuaW1hdGlvbi5cclxuICBwdWJsaWMgcmVhZG9ubHkgaXNMb2FkaW5nQmFyQW5pbWF0aW5nUHJvcGVydHk6IEJvb2xlYW5Qcm9wZXJ0eTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFNVQklUSVpFUl9CT1VORFMgPSBTVUJJVElaRVJfQk9VTkRTO1xyXG5cclxuICAvLyB3aGV0aGVyIHRoZSBwbGF5IGJ1dHRvbiBpcyB2aXNpYmxlXHJcbiAgcHVibGljIHJlYWRvbmx5IGlzUGxheUJ1dHRvblZpc2libGVQcm9wZXJ0eTogQm9vbGVhblByb3BlcnR5O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNoYWxsZW5nZU51bWJlclByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgaXNDaGFsbGVuZ2VTb2x2ZWRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBudW1iZXJPZkFuc3dlckJ1dHRvblByZXNzZXNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPixcclxuICAgICAgICAgICAgICAgICAgICAgIHJhbmRvbU9yUHJlZGV0ZXJtaW5lZDogYm9vbGVhblxyXG4gICkge1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VOdW1iZXJQcm9wZXJ0eSA9IGNoYWxsZW5nZU51bWJlclByb3BlcnR5O1xyXG4gICAgdGhpcy5pc0NoYWxsZW5nZVNvbHZlZFByb3BlcnR5ID0gaXNDaGFsbGVuZ2VTb2x2ZWRQcm9wZXJ0eTtcclxuXHJcbiAgICB0aGlzLmlzUGxheUJ1dHRvblZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuXHJcbiAgICB0aGlzLmlzTG9hZGluZ0JhckFuaW1hdGluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICB0aGlzLmlzU2hhcGVWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIHRoaXMucG9pbnRzUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIFsgVmVjdG9yMi5aRVJPIF0sIHtcclxuICAgICAgdmFsdWVUeXBlOiBBcnJheSxcclxuICAgICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiBBcnJheS5pc0FycmF5KCB2YWx1ZSApICYmIHZhbHVlLmV2ZXJ5KCBlbGVtZW50ID0+IGVsZW1lbnQgaW5zdGFuY2VvZiBWZWN0b3IyIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnJhbmRvbU9yUHJlZGV0ZXJtaW5lZCA9IHJhbmRvbU9yUHJlZGV0ZXJtaW5lZDtcclxuXHJcbiAgICB0aGlzLmlzRGVsYXlTdGFydGVkID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy50aW1lU2luY2VEZWxheVN0YXJ0ZWQgPSAwO1xyXG5cclxuICAgIHRoaXMudGltZVNpbmNlU2hhcGVWaXNpYmxlID0gMDtcclxuXHJcbiAgICB0aGlzLm9iamVjdFNpemUgPSBPQkpFQ1RfU0laRTtcclxuXHJcbiAgICB0aGlzLmlzSW5wdXRFbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIHRoaXMub2JqZWN0VHlwZVByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uUHJvcGVydHkoIFN1Yml0aXplT2JqZWN0VHlwZS5ET0csIHtcclxuICAgICAgZW51bWVyYXRpb246IFN1Yml0aXplT2JqZWN0VHlwZS5lbnVtZXJhdGlvbixcclxuICAgICAgdmFsaWRWYWx1ZXM6IFNVQklUSVpFUl9PQkpFQ1RfVFlQRVNcclxuICAgIH0gKTtcclxuXHJcbiAgICBTdWJpdGl6ZXIuYXNzZXJ0VmFsaWRQcmVkZXRlcm1pbmVkU2hhcGVzKCk7XHJcblxyXG4gICAgLy8gaW5pdGlhbGl6ZSBmaXJzdCBzZXQgb2YgcG9pbnRzXHJcbiAgICB0aGlzLnNldE5ld1BvaW50cygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGR0IC0gaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIGlmICggdGhpcy5pc0RlbGF5U3RhcnRlZCApIHtcclxuICAgICAgdGhpcy50aW1lU2luY2VEZWxheVN0YXJ0ZWQgKz0gZHQ7XHJcblxyXG4gICAgICAvLyBoaWRlIHRoZSBsb2FkaW5nIGJhciBhZnRlciBicmllZmx5IHNob3dpbmcgaXQgaW4gYSBmaWxsZWQgc3RhdGVcclxuICAgICAgaWYgKCB0aGlzLnRpbWVTaW5jZURlbGF5U3RhcnRlZCA+IDAuMiAmJiB0aGlzLmlzTG9hZGluZ0JhckFuaW1hdGluZ1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIHRoaXMuaXNMb2FkaW5nQmFyQW5pbWF0aW5nUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICAvLyBzaG93IHRoZSBzaGFwZSBhbmQgZW5hYmxlIGFuc3dlciBpbnB1dHMgYWZ0ZXIgYSBkZWxheVxyXG4gICAgICBlbHNlIGlmICggdGhpcy50aW1lU2luY2VEZWxheVN0YXJ0ZWQgPiBOdW1iZXJQbGF5Q29uc3RhbnRzLlNIQVBFX0RFTEFZX1RJTUUgKSB7XHJcbiAgICAgICAgdGhpcy5pc0lucHV0RW5hYmxlZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmlzU2hhcGVWaXNpYmxlUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMucmVzZXREZWxheSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaGlkZSB0aGUgc2hhcGUgYWZ0ZXIgaXQncyBiZWVuIHZpc2libGUgZm9yIGxvbmcgZW5vdWdoIFxyXG4gICAgaWYgKCB0aGlzLmlzU2hhcGVWaXNpYmxlUHJvcGVydHkudmFsdWUgJiYgdGhpcy5pc0lucHV0RW5hYmxlZFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLnRpbWVTaW5jZVNoYXBlVmlzaWJsZSArPSBkdDtcclxuXHJcbiAgICAgIGlmICggdGhpcy50aW1lU2luY2VTaGFwZVZpc2libGUgPiBudW1iZXJQbGF5UHJlZmVyZW5jZXMuc3ViaXRpemVUaW1lU2hvd25Qcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICB0aGlzLnJlc2V0U2hhcGVWaXNpYmxlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBuZXdDaGFsbGVuZ2UoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gc2V0IHZhbHVlcyBmb3IgdGhlIHN0ZXAgZnVuY3Rpb24gdG8gaGFuZGxlIHNlcXVlbmNlIG9mIHNob3dpbmcgYW5kIGhpZGluZyBnYW1lIHBhcnRzIGZvciBhIG5ldyBjaGFsbGVuZ2VcclxuICAgIHRoaXMuaXNEZWxheVN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5pc0lucHV0RW5hYmxlZFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICB0aGlzLnJlc2V0U2hhcGVWaXNpYmxlKCk7XHJcblxyXG4gICAgLy8gc2V0IGNvdW50aW5nT2JqZWN0IHR5cGUgYW5kIHNoYXBlXHJcbiAgICB0aGlzLnNldFJhbmRvbUNvdW50aW5nT2JqZWN0VHlwZSgpO1xyXG4gICAgdGhpcy5zZXROZXdQb2ludHMoKTtcclxuXHJcbiAgICAvLyBza2lwIHRoZSBjaGFsbGVuZ2Ugc3RhcnRlZCBzZXF1ZW5jZSBpbiB0aGUgc3RlcCBmdW5jdGlvblxyXG4gICAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnNob3dBbnN3ZXJzICkge1xyXG4gICAgICB0aGlzLmlzTG9hZGluZ0JhckFuaW1hdGluZ1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuaXNEZWxheVN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGUgc3RhcnQgc2VxdWVuY2UuIEJlY2F1c2UgdGhlIHN0YXJ0IHNlcXVlbmNlIHByb2NlZWRzIG5vcm1hbGx5IGlmIGEgdXNlciBjaG9vc2VzIHRvIGxlYXZlIGEgY2hhbGxlbmdlXHJcbiAgICogYWZ0ZXIga2lja2luZyBvZmYgdGhlIHN0YXJ0IHNlcXVlbmNlIChieSBjbGlja2luZyBwbGF5KSwgd2UgbmVlZCB0byByZXNldCBhbGwgYXNwZWN0cyBvZiB0aGUgc3RhcnQgc2VxdWVuY2VcclxuICAgKiAoaW5jbHVkaW5nIGFsbCBwYXJ0cyB0aGF0IGhhcHBlbiBkdXJpbmcgdGhlIHN0ZXAgZnVuY3Rpb24pLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZXNldFN0YXJ0U2VxdWVuY2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmlzTG9hZGluZ0JhckFuaW1hdGluZ1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnJlc2V0RGVsYXkoKTtcclxuICAgIHRoaXMucmVzZXRTaGFwZVZpc2libGUoKTtcclxuICAgIHRoaXMuaXNQbGF5QnV0dG9uVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmlzSW5wdXRFbmFibGVkUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGUgdGltZSBjb3VudGVyIGZvciBob3cgbXVjaCB0aW1lIGhhcyBwYXNzZWQgc2luY2UgdGhlIGRlbGF5IHN0YXJ0ZWQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSByZXNldERlbGF5KCk6IHZvaWQge1xyXG4gICAgdGhpcy50aW1lU2luY2VEZWxheVN0YXJ0ZWQgPSAwO1xyXG4gICAgdGhpcy5pc0RlbGF5U3RhcnRlZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGlkZXMgdGhlIHNoYXBlIGFuZCByZXNldHMgdGhlIHRpbWUgY291bnRlciBmb3IgaG93IGxvbmcgdGhlIHNoYXBlIGhhcyBiZWVuIHZpc2libGUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSByZXNldFNoYXBlVmlzaWJsZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuaXNTaGFwZVZpc2libGVQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgdGhpcy50aW1lU2luY2VTaGFwZVZpc2libGUgPSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGlzLnBvaW50c1Byb3BlcnR5IHdpdGggbmV3IHBvaW50cyBmb3IgdGhlIGN1cnJlbnQgY2hhbGxlbmdlIG51bWJlclxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2V0TmV3UG9pbnRzKCk6IHZvaWQge1xyXG4gICAgY29uc3QgY2hhbGxlbmdlTnVtYmVyID0gdGhpcy5jaGFsbGVuZ2VOdW1iZXJQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGxldCBwb2ludHM7XHJcblxyXG4gICAgaWYgKCB0aGlzLnJhbmRvbU9yUHJlZGV0ZXJtaW5lZCAmJiAoIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgPD0gUFJPQkFCSUxJVFlfT0ZfUFJFREVURVJNSU5FRF9TSEFQRSApICkge1xyXG4gICAgICBwb2ludHMgPSBTdWJpdGl6ZXIuZ2V0UHJlZGV0ZXJtaW5lZFNoYXBlUG9pbnRzKCBjaGFsbGVuZ2VOdW1iZXIgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLnJhbmRvbU9yUHJlZGV0ZXJtaW5lZCApIHtcclxuICAgICAgcG9pbnRzID0gU3ViaXRpemVyLmdldFJhbmRvbVNoYXBlUG9pbnRzKCBjaGFsbGVuZ2VOdW1iZXIgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBwb2ludHMgPSBTdWJpdGl6ZXIuZ2V0QXJyYW5nZWRTaGFwZVBvaW50cyggY2hhbGxlbmdlTnVtYmVyICk7XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcG9pbnRzLmxlbmd0aCA9PT0gY2hhbGxlbmdlTnVtYmVyLCAnaW5jb3JyZWN0IG51bWJlciBvZiBwb2ludHMgZm9yIGNoYWxsZW5nZU51bWJlciAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7Y2hhbGxlbmdlTnVtYmVyfTogJHtwb2ludHMubGVuZ3RofWAgKTtcclxuXHJcbiAgICAvLyB0d28gb2YgdGhlIHNhbWUgc2hhcGVzIGluIGEgcm93IGFyZSBub3QgYWxsb3dlZFxyXG4gICAgaWYgKCAhXy5pc0VxdWFsKCB0aGlzLnBvaW50c1Byb3BlcnR5LnZhbHVlLCBwb2ludHMgKSApIHtcclxuICAgICAgdGhpcy5wb2ludHNQcm9wZXJ0eS52YWx1ZSA9IHBvaW50cztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnNldE5ld1BvaW50cygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGlzLm9iamVjdFR5cGVQcm9wZXJ0eSB3aXRoIGEgbmV3IG9iamVjdCB0eXBlIGZvciB0aGUgY3VycmVudCBjaGFsbGVuZ2UuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzZXRSYW5kb21Db3VudGluZ09iamVjdFR5cGUoKTogdm9pZCB7XHJcbiAgICB0aGlzLm9iamVjdFR5cGVQcm9wZXJ0eS52YWx1ZSA9IGRvdFJhbmRvbS5zYW1wbGUoIFNVQklUSVpFUl9PQkpFQ1RfVFlQRVMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJhbmRvbWx5IHBpY2tzIG91dCBhIHByZWRldGVybWluZWQgc2hhcGUgd2l0aCBOIHBvaW50cyBhbmQgYXBwbGllcyBhIHJhbmRvbSBhdmFpbGFibGUgcm90YXRpb24sIHdoZXJlXHJcbiAgICogTiA9IHRoZSBwcm92aWRlZCBjaGFsbGVuZ2VOdW1iZXIuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0UHJlZGV0ZXJtaW5lZFNoYXBlUG9pbnRzKCBjaGFsbGVuZ2VOdW1iZXI6IG51bWJlciApOiBWZWN0b3IyW10ge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIFBSRURFVEVSTUlORURfU0hBUEVTICYmIFBSRURFVEVSTUlORURfU0hBUEVTWyBjaGFsbGVuZ2VOdW1iZXIgXSxcclxuICAgICAgYFRoZXJlIGV4aXN0cyBubyBwcmVkZXRlcm1pbmVkIHNoYXBlIGZvciBjaGFsbGVuZ2UgbnVtYmVyICR7Y2hhbGxlbmdlTnVtYmVyfS4gYCArXHJcbiAgICAgIGBQcmVkZXRlcm1pbmVkIHNoYXBlczogJHtPYmplY3Qua2V5cyggUFJFREVURVJNSU5FRF9TSEFQRVMgKS50b1N0cmluZygpfWAgKTtcclxuXHJcbiAgICBjb25zdCBzaGFwZUluZGV4ID0gZG90UmFuZG9tLm5leHRJbnQoIFBSRURFVEVSTUlORURfU0hBUEVTWyBjaGFsbGVuZ2VOdW1iZXIgXS5sZW5ndGggKTtcclxuICAgIGNvbnN0IHNoYXBlID0gUFJFREVURVJNSU5FRF9TSEFQRVNbIGNoYWxsZW5nZU51bWJlciBdWyBzaGFwZUluZGV4IF07XHJcblxyXG4gICAgY29uc3Qgcm90YXRpb25JbmRleCA9IGRvdFJhbmRvbS5uZXh0SW50KCBzaGFwZS5yb3RhdGlvbnMubGVuZ3RoICk7XHJcbiAgICByZXR1cm4gU3ViaXRpemVyLnJvdGF0ZVBvaW50cyggc2hhcGUucG9pbnRzLCBzaGFwZS5yb3RhdGlvbnNbIHJvdGF0aW9uSW5kZXggXSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmFuZG9tbHkgZ2VuZXJhdGVzIE4gcG9pbnRzIGluc2lkZSB0aGUgYXZhaWxhYmxlIGJvdW5kcywgd2hlcmUgTiA9IHRoZSBwcm92aWRlZCBjaGFsbGVuZ2VOdW1iZXIuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0UmFuZG9tU2hhcGVQb2ludHMoIGNoYWxsZW5nZU51bWJlcjogbnVtYmVyICk6IFZlY3RvcjJbXSB7XHJcbiAgICBjb25zdCBwb2ludHMgPSBbXTtcclxuXHJcbiAgICB3aGlsZSAoIHBvaW50cy5sZW5ndGggPCBjaGFsbGVuZ2VOdW1iZXIgKSB7XHJcbiAgICAgIGNvbnN0IHJhbmRvbVggPSBkb3RSYW5kb20ubmV4dERvdWJsZUJldHdlZW4oIFNIQVBFX0JPVU5EUy5taW5YLCBTSEFQRV9CT1VORFMubWF4WCApO1xyXG4gICAgICBjb25zdCByYW5kb21ZID0gZG90UmFuZG9tLm5leHREb3VibGVCZXR3ZWVuKCBTSEFQRV9CT1VORFMubWluWSwgU0hBUEVfQk9VTkRTLm1heFkgKTtcclxuXHJcbiAgICAgIC8vIGFkZCBhIG5ldyBwb2ludCBpZiBpdCBkb2Vzbid0IGV4aXN0IHlldCBhbmQgZG9lcyBub3Qgb3ZlcmxhcCB3aXRoIHRoZSBleGlzdGluZyBwb2ludHNcclxuICAgICAgY29uc3Qgb2JqZWN0c092ZXJsYXAgPSBTdWJpdGl6ZXIub2JqZWN0c092ZXJsYXAoIHBvaW50cywgcmFuZG9tWCwgcmFuZG9tWSApO1xyXG4gICAgICBpZiAoICFfLmZpbmQoIHBvaW50cywgb2JqZWN0ID0+ICggb2JqZWN0LnggPT09IHJhbmRvbVggKSAmJiAoIG9iamVjdC55ID09PSByYW5kb21ZICkgKSAmJiAhb2JqZWN0c092ZXJsYXAgKSB7XHJcbiAgICAgICAgcG9pbnRzLnB1c2goIG5ldyBWZWN0b3IyKCByYW5kb21YLCByYW5kb21ZICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwb2ludHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSYW5kb21seSBnZW5lcmF0ZXMgYW4gYXJyYW5nZWQgc2hhcGUgd2l0aCBOIHBvaW50cywgd2hlcmUgTiA9IHRoZSBwcm92aWRlZCBjaGFsbGVuZ2VOdW1iZXIuIEFuIGFycmFuZ2VkIHNoYXBlIGlzXHJcbiAgICogYSBibG9jayBvZiBwb2ludHMsIHdoZXJlIHRoZSByZW1haW5kZXIgb2YgcG9pbnRzIHRoYXQgZG9udCBmaXQgaW50byB0aGUgYmxvY2sgYXJlIGxvY2F0ZWQgb24gdGhlIHVwcGVyIGxlZnQsIHVwcGVyXHJcbiAgICogcmlnaHQsIGxvd2VyIGxlZnQsIG9yIGxvd2VyIHJpZ2h0IG9mIHRoZSBibG9jay5cclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyBnZXRBcnJhbmdlZFNoYXBlUG9pbnRzKCBjaGFsbGVuZ2VOdW1iZXI6IG51bWJlciApOiBWZWN0b3IyW10ge1xyXG4gICAgY29uc3QgbnVtYmVyT2ZSb3dzID0gZG90UmFuZG9tLm5leHRJbnRCZXR3ZWVuKCBNSU5fTlVNQkVSX09GX1JPV1MsIE1BWF9OVU1CRVJfT0ZfUk9XUyApO1xyXG4gICAgbGV0IG1pbk51bWJlck9mQ29sdW1ucyA9IE1JTl9OVU1CRVJfT0ZfQ09MVU1OUztcclxuXHJcbiAgICAvLyBnZXQgdGhlIG1pbmltdW0gbnVtYmVyIG9mIGNvbHVtbnMgbmVlZGVkIHRvIGZpdCBhbGwgdGhlIHBvaW50cyBpbiB0aGUgYXJyYW5nZW1lbnQgZ2l2ZW4gdGhlIGNob3NlbiBudW1iZXIgb2Ygcm93c1xyXG4gICAgd2hpbGUgKCBtaW5OdW1iZXJPZkNvbHVtbnMgKiBudW1iZXJPZlJvd3MgPCBjaGFsbGVuZ2VOdW1iZXIgKSB7XHJcbiAgICAgIG1pbk51bWJlck9mQ29sdW1ucysrO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGdldCB0aGUgbWF4aW11bSBudW1iZXIgb2YgY29sdW1ucyB0aGF0IHNob3VsZCBiZSB1c2VkIHN1Y2ggdGhhdCBldmVyeSByb3cgd2lsbCBzdGlsbCBoYXZlIGEgbGVhc3Qgb25lIHBvaW50IGdpdmVuXHJcbiAgICAvLyB0aGUgY2hvc2VuIG51bWJlciBvZiByb3dzIChzaW5jZSB3ZSBnZW5lcmF0ZSB0aGUgcG9pbnRzIGZyb20gbGVmdCB0byByaWdodCwgdG9wIHRvIGJvdHRvbSkuXHJcbiAgICBsZXQgbWF4TnVtYmVyT2ZDb2x1bW5zID0gbWluTnVtYmVyT2ZDb2x1bW5zO1xyXG4gICAgd2hpbGUgKCBjaGFsbGVuZ2VOdW1iZXIgPiAoIG1heE51bWJlck9mQ29sdW1ucyArIDEgKSAqICggbnVtYmVyT2ZSb3dzIC0gMSApICYmXHJcbiAgICAgICAgICAgIG1heE51bWJlck9mQ29sdW1ucyA8IE1BWF9OVU1CRVJfT0ZfQ09MVU1OUyApIHtcclxuICAgICAgbWF4TnVtYmVyT2ZDb2x1bW5zKys7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbnVtYmVyT2ZDb2x1bW5zID0gZG90UmFuZG9tLm5leHRJbnRCZXR3ZWVuKCBtaW5OdW1iZXJPZkNvbHVtbnMsIG1heE51bWJlck9mQ29sdW1ucyApO1xyXG5cclxuICAgIC8vIGNhbGN1bGF0ZSB0aGUgY2VudGVyIG9mIHRoZSBmaXJzdCBwb2ludCB0byBkcmF3IGluIHRoZSBzaGFwZSAodXBwZXIgbGVmdCBjb3JuZXIgb2YgdGhlIHNoYXBlKS4gVGhpcyBhc3N1bWVzIHRoYXRcclxuICAgIC8vIHRoZSBjZW50ZXIgb2YgdGhlIHNoYXBlIGlzIGF0ICgwLCAwKS5cclxuICAgIGNvbnN0IGdldFN0YXJ0Q29vcmRpbmF0ZSA9ICggbjogbnVtYmVyICkgPT4gKCBuIC0gMSApIC8gLTI7XHJcbiAgICBjb25zdCBzdGFydFggPSBnZXRTdGFydENvb3JkaW5hdGUoIG51bWJlck9mQ29sdW1ucyApO1xyXG4gICAgY29uc3Qgc3RhcnRZID0gZ2V0U3RhcnRDb29yZGluYXRlKCBudW1iZXJPZlJvd3MgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW5kIGFkZCBhbGwgcG9pbnRzIGluIGNhbGN1bGF0ZWQgXCJyZWN0YW5nbGVcIiAobnVtYmVyT2ZSb3dzIGJ5IG51bWJlck9mQ29sdW1ucyksIHdoaWNoIG1heSBlbmQgdXAgYmVpbmdcclxuICAgIC8vIG1vcmUgcG9pbnRzIHRoYW4gYXJlIG5lZWRlZCwgZHJhd2luZyB0aGVtIGZyb20gbGVmdCB0byByaWdodCwgdG9wIHRvIGJvdHRvbVxyXG4gICAgY29uc3QgcG9pbnRzID0gW107XHJcbiAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBudW1iZXJPZlJvd3M7IGorKyApIHtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZDb2x1bW5zOyBpKysgKSB7XHJcbiAgICAgICAgcG9pbnRzLnB1c2goIG5ldyBWZWN0b3IyKCBzdGFydFggKyBpLCBzdGFydFkgKyBqICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGJvdGggdXNlZCBmb3IgdGhlIGNvcnJlY3QgbnVtYmVyIG9mIHBvaW50cywgd2hlcmUgdGhlIHJlbWFpbmRlciB3YXMgcmVtb3ZlZCBmcm9tIHRoZSBibG9ja1xyXG4gICAgbGV0IHJlZHVjZWRQb2ludHM7XHJcbiAgICBjb25zdCByZWR1Y2VkU2hpZnRlZFBvaW50cyA9IHBvaW50cztcclxuXHJcbiAgICAvLyByYW5kb21seSBwaWNrIGJldHdlZW4gbW9kaWZ5aW5nIHRoZSB0b3Agcm93IG9yIGJvdHRvbSByb3dcclxuICAgIGlmICggZG90UmFuZG9tLm5leHRCb29sZWFuKCkgKSB7XHJcbiAgICAgIGNvbnN0IHNsaWNlSW5kZXggPSBwb2ludHMubGVuZ3RoIC0gY2hhbGxlbmdlTnVtYmVyO1xyXG5cclxuICAgICAgLy8gcmVtb3ZlIGV4dHJhIHBvaW50cyBmcm9tIHRoZSB0b3Agcm93LCBsZWZ0IHNpZGVcclxuICAgICAgcmVkdWNlZFBvaW50cyA9IHBvaW50cy5zbGljZSggc2xpY2VJbmRleCApO1xyXG5cclxuICAgICAgLy8gcmVtb3ZlIGV4dHJhIHBvaW50cyBmcm9tIHRoZSB0b3Agcm93LCByaWdodCBzaWRlXHJcbiAgICAgIHJlZHVjZWRTaGlmdGVkUG9pbnRzLnNwbGljZSggbnVtYmVyT2ZDb2x1bW5zIC0gc2xpY2VJbmRleCwgc2xpY2VJbmRleCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyByZW1vdmUgZXh0cmEgcG9pbnRzIGZyb20gdGhlIGJvdHRvbSByb3csIHJpZ2h0IHNpZGVcclxuICAgICAgcmVkdWNlZFBvaW50cyA9IHBvaW50cy5zbGljZSggMCwgY2hhbGxlbmdlTnVtYmVyICk7XHJcblxyXG4gICAgICAvLyByZW1vdmUgZXh0cmEgcG9pbnRzIGZyb20gdGhlIGJvdHRvbSByb3csIGxlZnQgc2lkZVxyXG4gICAgICByZWR1Y2VkU2hpZnRlZFBvaW50cy5zcGxpY2UoIHBvaW50cy5sZW5ndGggLSBudW1iZXJPZkNvbHVtbnMsIHBvaW50cy5sZW5ndGggLSBjaGFsbGVuZ2VOdW1iZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyByYW5kb21seSBwaWNrIGJldHdlZW4gdGhlIHR3byB0eXBlcyBvZiByZWR1Y2VkIHBvaW50c1xyXG4gICAgcmV0dXJuIGRvdFJhbmRvbS5uZXh0Qm9vbGVhbigpID8gcmVkdWNlZFBvaW50cyA6IHJlZHVjZWRTaGlmdGVkUG9pbnRzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUm90YXRlcyBlYWNoIHBvaW50IG9mIHRoZSBzaGFwZSBhcm91bmQgdGhlIG9yaWdpbiwgd2hpY2ggaXMgYXNzdW1lZCB0byBiZSAoMCwgMCkuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgcm90YXRlUG9pbnRzKCBwb2ludHM6IFZlY3RvcjJbXSwgcm90YXRpb25BbmdsZTogbnVtYmVyICk6IFZlY3RvcjJbXSB7XHJcbiAgICBjb25zdCByb3RhdGlvbk1hdHJpeCA9IG5ldyBNYXRyaXgzKCkuc2V0VG9Sb3RhdGlvblooIHJvdGF0aW9uQW5nbGUgKTtcclxuXHJcbiAgICBjb25zdCByb3RhdGVkUG9pbnRzOiBWZWN0b3IyW10gPSBbXTtcclxuICAgIHBvaW50cy5mb3JFYWNoKCBwb2ludCA9PiByb3RhdGVkUG9pbnRzLnB1c2goIHJvdGF0aW9uTWF0cml4LnRpbWVzVmVjdG9yMiggcG9pbnQgKSApICk7XHJcblxyXG4gICAgcmV0dXJuIHJvdGF0ZWRQb2ludHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wYXJlcyB0aGUgYm91bmRzIG9mIGEgcG9pbnQgdG8gYmUgYWRkZWQgdG8gYWxsIG90aGVyIGV4aXN0aW5nIHBvaW50cyBhbmQgcmV0dXJucyBpZiB0aGUgcG9pbnQgdG9cclxuICAgKiBiZSBhZGRlZCBvdmVybGFwcyB3aXRoIGFueSBleGlzdGluZyBwb2ludC5cclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyBvYmplY3RzT3ZlcmxhcCggcG9pbnRzOiBWZWN0b3IyW10sIHhDb29yZGluYXRlOiBudW1iZXIsIHlDb29yZGluYXRlOiBudW1iZXIgKTogYm9vbGVhbiB7XHJcbiAgICBsZXQgb3ZlcmxhcCA9IGZhbHNlO1xyXG4gICAgY29uc3Qgb2JqZWN0VG90YWxXaWR0aCA9IE9CSkVDVF9TSVpFICsgT0JKRUNUX1BBRERJTkc7XHJcbiAgICBjb25zdCBvYmplY3RUb3RhbEhhbGZXaWR0aCA9IG9iamVjdFRvdGFsV2lkdGggLyAyO1xyXG4gICAgaWYgKCBwb2ludHMubGVuZ3RoID4gMCApIHtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IHBvaW50ID0gcG9pbnRzWyBpIF07XHJcbiAgICAgICAgY29uc3QgcG9pbnRPYmplY3RCb3VuZHMgPSBuZXcgQm91bmRzMihcclxuICAgICAgICAgIHBvaW50LnggLSBvYmplY3RUb3RhbEhhbGZXaWR0aCxcclxuICAgICAgICAgIHBvaW50LnkgLSBvYmplY3RUb3RhbEhhbGZXaWR0aCxcclxuICAgICAgICAgIHBvaW50LnggKyBvYmplY3RUb3RhbEhhbGZXaWR0aCxcclxuICAgICAgICAgIHBvaW50LnkgKyBvYmplY3RUb3RhbEhhbGZXaWR0aFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3Qgb3RoZXJQb2ludE9iamVjdEJvdW5kcyA9IG5ldyBCb3VuZHMyKFxyXG4gICAgICAgICAgeENvb3JkaW5hdGUgLSBvYmplY3RUb3RhbEhhbGZXaWR0aCxcclxuICAgICAgICAgIHlDb29yZGluYXRlIC0gb2JqZWN0VG90YWxIYWxmV2lkdGgsXHJcbiAgICAgICAgICB4Q29vcmRpbmF0ZSArIG9iamVjdFRvdGFsSGFsZldpZHRoLFxyXG4gICAgICAgICAgeUNvb3JkaW5hdGUgKyBvYmplY3RUb3RhbEhhbGZXaWR0aFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgb3ZlcmxhcCA9IHBvaW50T2JqZWN0Qm91bmRzLmludGVyc2VjdHNCb3VuZHMoIG90aGVyUG9pbnRPYmplY3RCb3VuZHMgKTtcclxuICAgICAgICBpZiAoIG92ZXJsYXAgKSB7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBvdmVybGFwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXNzZXJ0cyB0aGF0IGV2ZXJ5IHBvaW50IGluIGV2ZXJ5IHByZWRldGVybWluZWQgc2hhcGUgaXMgd2l0aGluIHRoZSBtb2RlbCBib3VuZHMgZm9yIGV2ZXJ5IHBvc3NpYmxlIHJvdGF0aW9uIG9mIHRoZVxyXG4gICAqIHNoYXBlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RhdGljIGFzc2VydFZhbGlkUHJlZGV0ZXJtaW5lZFNoYXBlcygpOiB2b2lkIHtcclxuICAgIGZvciAoIGNvbnN0IGtleSBpbiBQUkVERVRFUk1JTkVEX1NIQVBFUyApIHtcclxuICAgICAgUFJFREVURVJNSU5FRF9TSEFQRVNbIGtleSBdLmZvckVhY2goIHNoYXBlID0+IHsgLy8gaXRlcmF0ZSBvdmVyIGVhY2ggc2hhcGUgaW4gdGhlIHNoYXBlIHNldCBmb3IgdGhlIGdpdmVuIG51bWJlciAoa2V5KVxyXG5cclxuICAgICAgICAvLyBjaGVjayB0aGF0IHRoZSBwb2ludHMgb2YgZWFjaCByb3RhdGlvbiBmb3IgYSBzaGFwZSBhcmUgd2l0aGluIHRoZSBtb2RlbCBib3VuZHNcclxuICAgICAgICBzaGFwZS5yb3RhdGlvbnMuZm9yRWFjaCggcm90YXRpb25BbmdsZSA9PiB7XHJcbiAgICAgICAgICBjb25zdCByb3RhdGVkUG9pbnRzID0gU3ViaXRpemVyLnJvdGF0ZVBvaW50cyggc2hhcGUucG9pbnRzLCByb3RhdGlvbkFuZ2xlICk7XHJcbiAgICAgICAgICByb3RhdGVkUG9pbnRzLmZvckVhY2goIHBvaW50ID0+IGFzc2VydCAmJiBhc3NlcnQoIFNIQVBFX0JPVU5EUy5jb250YWluc1BvaW50KCBTdWJpdGl6ZXIuZml4UG9pbnQoIHBvaW50ICkgKSxcclxuICAgICAgICAgICAgYHZlY3RvciBwb2ludCAke3BvaW50LnRvU3RyaW5nKCl9IGZyb20gc2hhcGUgJHtrZXl9IGlzIG91dHNpZGUgdGhlIG9iamVjdCBib3VuZHMgd2hlbiBhIHJvdGF0aW9uIG9mIGAgK1xyXG4gICAgICAgICAgICBgJHtyb3RhdGlvbkFuZ2xlICogKCAxODAgLyBNYXRoLlBJICl9IGRlZ3JlZXMgaXMgYXBwbGllZDogJHtTSEFQRV9CT1VORFMudG9TdHJpbmcoKX1gICkgKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpeGVzIHBvaW50cyB0aGF0IGhhdmUgd3JvbmcgdmFsdWVzIGR1ZSB0byBKYXZhU2NyaXB0IGRlY2ltYWwgbWF0aCBlcnJvci5cclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyBmaXhQb2ludCggcG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIFV0aWxzLnRvRml4ZWROdW1iZXIoIHBvaW50LngsIERFQ0lNQUxTICksIFV0aWxzLnRvRml4ZWROdW1iZXIoIHBvaW50LnksIERFQ0lNQUxTICkgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgfVxyXG59XHJcblxyXG5udW1iZXJQbGF5LnJlZ2lzdGVyKCAnU3ViaXRpemVyJywgU3ViaXRpemVyICk7XHJcbmV4cG9ydCBkZWZhdWx0IFN1Yml0aXplcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsbUJBQW1CLE1BQU0sNENBQTRDO0FBRTVFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLG1CQUFtQixNQUFNLHFDQUFxQztBQUNyRSxPQUFPQyxVQUFVLE1BQU0scUJBQXFCO0FBQzVDLE9BQU9DLGtCQUFrQixNQUFNLHlCQUF5QjtBQUN4RCxPQUFPQyxxQkFBcUIsTUFBTSw2Q0FBNkM7O0FBRS9FOztBQU1BO0FBRUE7QUFDQSxNQUFNQyxTQUFTLEdBQUcsQ0FBQztBQUNuQixNQUFNQyxVQUFVLEdBQUdDLElBQUksQ0FBQ0MsRUFB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RSxDQUFFO0lBQ0hXLE1BQU0sRUFBRSxDQUFFSixFQUFFLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQUVBLEVBQUUsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFFLENBQUMsRUFBRUEsRUFBRSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFBRUEsRUFBRSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFBRUEsRUFBRSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsQ0FBRTtJQUFFO0lBQzFFSyxTQUFTLEVBQUUsQ0FBRWIsU0FBUztFQUN4QixDQUFDLEVBQUU7SUFDRFksTUFBTSxFQUFFLENBQUVKLEVBQUUsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQyxFQUFFQSxFQUFFLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDLEVBQUVBLEVBQUUsQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQUVBLEVBQUUsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFFLENBQUMsRUFBRUEsRUFBRSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsQ0FBRTtJQUFFO0lBQzVFSyxTQUFTLEVBQUUsQ0FBRWIsU0FBUztFQUN4QixDQUFDLEVBQUU7SUFDRFksTUFBTSxFQUFFLENBQUVKLEVBQUUsQ0FBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUUsQ0FBQyxFQUFFQSxFQUFFLENBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBRSxDQUFDLEVBQUVBLEVBQUUsQ0FBRSxDQUFDLEdBQUcsRUFBRSxDQUFFLENBQUMsRUFBRUEsRUFBRSxDQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUksQ0FBQyxFQUFFQSxFQUFFLENBQUUsR0FBRyxFQUFFLEdBQUksQ0FBQyxDQUFFO0lBQUU7SUFDM0ZLLFNBQVMsRUFBRSxDQUFFYixTQUFTLEVBQUVJLFVBQVUsRUFBRUUsV0FBVyxFQUFFQyxXQUFXO0VBQzlELENBQUMsRUFBRTtJQUNESyxNQUFNLEVBQUUsQ0FBRUosRUFBRSxDQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FB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