// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model of a balloon, which can have charge, position and velocity.
 *
 * @author Vasily Shakhov (Mlearner)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg(PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import balloonsAndStaticElectricity from '../../balloonsAndStaticElectricity.js';
import BASEConstants from '../BASEConstants.js';
import BalloonDirectionEnum from './BalloonDirectionEnum.js';
import PlayAreaMap from './PlayAreaMap.js';
import PointChargeModel from './PointChargeModel.js';

// constants, most if not all of which were empirically determined to elicit the desired appearance and behavior
const VELOCITY_ARRAY_LENGTH = 5;
const BALLOON_WIDTH = 134;
const BALLOON_HEIGHT = 222;

// threshold for diagonal movement is +/- 15 degrees from diagonals
const DIAGONAL_MOVEMENT_THRESHOLD = 15 * Math.PI / 180;

// map that determines if the balloon is moving up, down, horizontally or along a diagonal between two points
const DIRECTION_MAP = {
  UP: new Range(-3 * Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD, -Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD),
  DOWN: new Range(Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD, 3 * Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD),
  RIGHT: new Range(-Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD, Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD),
  // atan2 wraps around PI, so we will use absolute value in checks
  LEFT: new Range(3 * Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD, Math.PI),
  UP_LEFT: new Range(-3 * Math.PI - DIAGONAL_MOVEMENT_THRESHOLD, -3 * Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD),
  DOWN_LEFT: new Range(3 * Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD, 3 * Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD),
  UP_RIGHT: new Range(-Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD, -Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD),
  DOWN_RIGHT: new Range(Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD, Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD)
};
const DIRECTION_MAP_KEYS = Object.keys(DIRECTION_MAP);

// collection of charge positions on the balloon, relative to the top left corners
// charges will appear in these positions as the balloon collects electrons
const POSITIONS = [[14, 70], [18, 60], [14, 90], [24, 130], [22, 120], [14, 79], [25, 140], [18, 108], [19, 50], [44, 150], [16, 100], [20, 80], [50, 160], [34, 140], [50, 20], [30, 30], [22, 72], [24, 105], [20, 110], [40, 150], [26, 110], [30, 115], [24, 87], [24, 60], [24, 40], [38, 24], [30, 80], [30, 50], [34, 82], [32, 130], [30, 108], [30, 50], [40, 94], [30, 100], [35, 90], [24, 95], [34, 100], [35, 40], [30, 60], [32, 72], [30, 105], [34, 140], [30, 120], [30, 130], [30, 85], [34, 77], [35, 90], [40, 85], [34, 90], [35, 50], [46, 34], [32, 72], [30, 105], [34, 140], [34, 120], [30, 60], [30, 85], [34, 77]];

// determine average Y position for the charges in the balloon, used to calculate the average vertical position of
// the visual charge center
let positionYSum = 0;
for (let i = 0; i < POSITIONS.length; i++) {
  positionYSum += POSITIONS[i][1]; // y coordinate is second value
}

const AVERAGE_CHARGE_Y = positionYSum / POSITIONS.length;
class BalloonModel {
  /**
   * Constructor
   * @param {number} x - initial x position
   * @param {number} y - initial y position
   * @param {BASEModel} balloonsAndStaticElectricityModel - ensure balloon is in valid position in model coordinates
   * @param {boolean} defaultVisibility - is the balloon visible by default?
   * @param {Tandem} tandem
   */
  constructor(x, y, balloonsAndStaticElectricityModel, defaultVisibility, tandem) {
    //------------------------------------------------
    // Properties

    // @public {number} - charge on the balloon, range goes from negative values to 0.
    this.chargeProperty = new NumberProperty(0, {
      numberType: 'Integer',
      range: new Range(-POSITIONS.length, 0),
      tandem: tandem.createTandem('chargeProperty'),
      phetioReadOnly: true
    });

    // @public {Vector2} - The velocity of the balloon when moving freely, i.e. NOT when it is being dragged.
    this.velocityProperty = new Vector2Property(Vector2.ZERO, {
      tandem: tandem.createTandem('velocityProperty'),
      valueComparisonStrategy: 'equalsFunction'
    });

    // @public {boolean}
    this.isVisibleProperty = new BooleanProperty(defaultVisibility, {
      tandem: tandem.createTandem('isVisibleProperty')
    });

    // @public {boolean}
    this.isDraggedProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('isDraggedProperty')
    });

    // @public {boolean} - whether or not this balloon is being dragged with a mouse or touch pointer, in which case
    // we want to reduce the frequency of alerts and avoid describing very small position changes.
    this.draggingWithPointer = false;

    // @public {Vector2} - position of the upper left corner of the rectangle that encloses the balloon
    this.positionProperty = new Vector2Property(new Vector2(x, y), {
      tandem: tandem.createTandem('positionProperty'),
      valueComparisonStrategy: 'equalsFunction'
    });

    // @public {Vector2} - velocity of the balloon while dragging
    this.dragVelocityProperty = new Vector2Property(new Vector2(0, 0), {
      tandem: tandem.createTandem('dragVelocityProperty'),
      valueComparisonStrategy: 'equalsFunction'
    });

    // @public {boolean} - whether or not the balloon is on the sweater
    this.onSweaterProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('onSweaterProperty')
    });

    // @public {boolean} - whether or not the balloon is touching the wall
    this.touchingWallProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('touchingWallProperty')
    });

    // @private string - the current column of the play area the balloon is in
    this.playAreaColumnProperty = new Property(null);

    // @private string - the current row of the play area that the balloon is in
    this.playAreaRowProperty = new Property(null);

    // @private {string|null} - if the balloon is in a landmark position, this Property will be a key of PlayAreaMap.LANDMARK_RANGES
    this.playAreaLandmarkProperty = new Property(null);

    // @public {string|null} - the direction of movement, can be one of BalloonDirectionEnum
    this.directionProperty = new Property(null, {
      tandem: tandem.createTandem('directionProperty'),
      phetioValueType: NullableIO(StringIO)
    });

    // @public {boolean} - whether or not the balloon is currently inducing a charge in the wall
    this.inducingChargeProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('inducingChargeProperty')
    });

    //------------------------------------------------

    // @private - array of instantaneous velocity of balloon last 5 ticks
    // then we calculate average velocity and compares it with threshold velocity to check if we catch minus charge from sweater
    this.xVelocityArray = [0, 0, 0, 0, 0];
    this.xVelocityArray.counter = 0;

    // @private {boolean} - whether or not the balloon is currently 'jumping', moving through a position in the play
    // area without dragging or an applied force
    this.jumping = false;

    // @public {boolean} - flag that indicates whether the balloon has successfully been picked up since the last
    // reset of the model
    this.successfulPickUp = false;

    // @public (read-only) dimensions of the balloon
    this.width = BALLOON_WIDTH;
    this.height = BALLOON_HEIGHT;

    // @public {MovablePointChargeModel} - the closest minus charge to the balloon which is in the wall
    this.closestChargeInWall = null;

    // @public {number} - in ms, the amount of time that has passed since balloon has been released
    this.timeSinceRelease = 0;

    // @public (read-only) - the old position of the balloon, used throughout the model and view to calculate
    // changes in position
    this.oldPosition = this.positionProperty.get().copy();

    // @private - positions of neutral atoms on balloon, don't change during simulation
    this.positionsOfStartCharges = [[44, 50], [88, 50], [44, 140], [88, 140]];

    // @public - will emit an event when the balloon is reset
    this.resetEmitter = new Emitter();

    // @public {Array.<PointChargeModel>}
    this.plusCharges = [];
    this.minusCharges = [];

    // @private {BASEModel}
    this.balloonsAndStaticElectricityModel = balloonsAndStaticElectricityModel;

    // neutral pair of charges
    this.positionsOfStartCharges.forEach(entry => {
      const plusCharge = new PointChargeModel(entry[0], entry[1], Tandem.OPT_OUT, false);
      this.plusCharges.push(plusCharge);

      // minus charges at same position of positive charge, shifted down and to the right by charge radius
      const minusCharge = new PointChargeModel(entry[0] + PointChargeModel.RADIUS, entry[1] + PointChargeModel.RADIUS, Tandem.OPT_OUT, false);
      this.minusCharges.push(minusCharge);
    });

    // charges that we can get from sweater, only negative charges
    POSITIONS.forEach(entry => {
      const minusCharge = new PointChargeModel(entry[0], entry[1], Tandem.OPT_OUT, false);
      this.minusCharges.push(minusCharge);
    });

    // @public (read-only) model bounds, updated when position changes
    this.bounds = new Bounds2(this.positionProperty.get().x, this.positionProperty.get().y, this.positionProperty.get().x + this.width, this.positionProperty.get().y + this.height);

    // When the position changes, update the bounds of balloon, direction of movement, and whether or not the the
    // balloon is touching an object.  No need to dispose as balloons exist for life of sim.
    this.positionProperty.link((position, oldPosition) => {
      this.bounds.setMinMax(position.x, position.y, position.x + this.width, position.y + this.height);
      if (oldPosition) {
        // the direction from the old position to the newPosition
        this.directionProperty.set(BalloonModel.getDirection(position, oldPosition));

        // update whether or not the balloon is on the sweater
        if (this.onSweater() !== this.onSweaterProperty.get()) {
          this.onSweaterProperty.set(this.onSweater());
        }

        // Update whether or not we are touching the wall.
        if (this.touchingWall() !== this.touchingWallProperty.get()) {
          this.touchingWallProperty.set(this.touchingWall());
        }
      }
    });
    this.isDraggedProperty.lazyLink(isDragged => {
      // When the user starts dragging a balloon, set its non-dragging velocity to zero.
      if (isDragged) {
        this.velocityProperty.set(Vector2.ZERO);
      }

      // When the balloon is released, reset the timer that indicates when it was released.
      if (!isDragged) {
        this.timeSinceRelease = 0;
      }
    });
    this.reset();
  }

  /**
   * Return true if the balloon is near the wall without touching it, and the wall is visible.
   * @public
   * @returns {boolean}
   */
  nearWall() {
    return PlayAreaMap.LANDMARK_RANGES.AT_NEAR_WALL.contains(this.getCenter().x);
  }

  /**
   * Determine if the balloon is on the sweater.  The balloon is considered to be rubbing on the sweater
   * if its center is in the charged area.
   * @public
   * @returns {boolean}
   */
  onSweater() {
    const sweaterBounds = this.balloonsAndStaticElectricityModel.sweater.bounds;
    return sweaterBounds.intersectsBounds(this.bounds);
  }

  /**
   * Returns whether or not the center of the balloon is within the charged area of the sweater.
   * @public
   * @returns {boolean}
   */
  centerInSweaterChargedArea() {
    return this.balloonsAndStaticElectricityModel.sweater.chargedArea.containsPoint(this.getCenter());
  }

  /**
   * If the balloon is near the sweater, return true.  Considered near the sweater when the center of the balloon
   * is within the LANDMARK_RANGES.AT_NEAR_SWEATER range of the PlayAreaMap.
   * @returns {boolean}
   * @public
   */
  nearSweater() {
    return PlayAreaMap.LANDMARK_RANGES.AT_NEAR_SWEATER.contains(this.getCenter().x);
  }

  /**
   * Return true if the balloon is near the right edge of the play area without touching it
   * @public
   *
   * @returns {boolean}
   */
  nearRightEdge() {
    return PlayAreaMap.LANDMARK_RANGES.AT_NEAR_RIGHT_EDGE.contains(this.getCenterX());
  }

  /**
   * Returns whether or not the right edge of the balloon is at the wall position, regardless of
   * balloon or wall visibility.  Useful for checking whether the balloon is at the wall position
   * when the wall is removed.
   * @public
   *
   * @returns {boolean}
   */
  rightAtWallPosition() {
    return this.getCenterX() === PlayAreaMap.X_POSITIONS.AT_WALL;
  }

  /**
   * Returns whether or not this balloon is at the right edge of the play area.
   * @public
   *
   * @returns {boolean}
   */
  atRightEdge() {
    return this.getCenterX() === PlayAreaMap.X_BOUNDARY_POSITIONS.AT_WALL;
  }

  /**
   * Returns whether or not this balloon is at the left edge of the play area.
   * @public
   *
   * @returns {string}
   */
  atLeftEdge() {
    return this.getCenterX() === PlayAreaMap.X_BOUNDARY_POSITIONS.AT_LEFT_EDGE;
  }

  /**
   * Returns whether or not this balloon is in the center of the play area horizontally. Does not consider vertical
   * position.
   * @public
   *
   * @returns {boolean}
   */
  inCenterPlayArea() {
    return PlayAreaMap.COLUMN_RANGES.CENTER_PLAY_AREA.contains(this.getCenterX());
  }

  /**
   * Returns whether or not the balloon is very close to an object in the play area. Will return true if the center
   * is withing one of the "very close" ranges in the play area.
   * @public
   *
   * @returns {string}
   */
  veryCloseToObject() {
    const centerX = this.getCenterX();
    return PlayAreaMap.LANDMARK_RANGES.AT_VERY_CLOSE_TO_SWEATER.contains(centerX) || PlayAreaMap.LANDMARK_RANGES.AT_VERY_CLOSE_TO_WALL.contains(centerX) || PlayAreaMap.LANDMARK_RANGES.AT_VERY_CLOSE_TO_RIGHT_EDGE.contains(centerX);
  }

  /**
   * Returns true if the balloon is touching the wall.
   * @public
   *
   * @returns {boolean}
   */
  touchingWall() {
    const atWall = this.getCenterX() === PlayAreaMap.X_POSITIONS.AT_WALL;
    const wallVisible = this.balloonsAndStaticElectricityModel.wall.isVisibleProperty.get();
    return atWall && wallVisible;
  }

  /**
   * Returns true if the balloon is moving horizontally, left or right.
   * @public
   *
   * @returns {string} - "LEFT"|"RIGHT"
   */
  movingHorizontally() {
    const direction = this.directionProperty.get();
    return direction === BalloonDirectionEnum.LEFT || direction === BalloonDirectionEnum.RIGHT;
  }

  /**
   * Returns true if the balloon is movingv vertically, up or down
   * @public
   * @returns {string} - "UP"|"DOWN"
   */
  movingVertically() {
    const direction = this.directionProperty.get();
    return direction === BalloonDirectionEnum.UP || direction === BalloonDirectionEnum.DOWN;
  }

  /**
   * Returns true if the balloon is moving horizontally, left or right.
   * @public
   * @returns {string} - "UP_LEFT"|"UP_RIGHT"|"DOWN_LEFT"|"DOWN_RIGHT"
   */
  movingDiagonally() {
    const direction = this.directionProperty.get();
    return direction === BalloonDirectionEnum.UP_LEFT || direction === BalloonDirectionEnum.UP_RIGHT || direction === BalloonDirectionEnum.DOWN_LEFT || direction === BalloonDirectionEnum.DOWN_RIGHT;
  }

  /**
   * Get whether or not the balloon is s moving to the right.
   * @public
   *
   * @returns {boolean}
   */
  movingRight() {
    const direction = this.directionProperty.get();
    return direction === BalloonDirectionEnum.RIGHT || direction === BalloonDirectionEnum.UP_RIGHT || direction === BalloonDirectionEnum.DOWN_RIGHT;
  }

  /**
   * Get whether or not the balloon is moving to the left.
   * @public
   *
   * @returns {boolean}
   */
  movingLeft() {
    const direction = this.directionProperty.get();
    return direction === BalloonDirectionEnum.LEFT || direction === BalloonDirectionEnum.UP_LEFT || direction === BalloonDirectionEnum.DOWN_LEFT;
  }

  /**
   * Returns a proportion of this balloon's movement through a region in the play area, dependent
   * on the direction of movement.  Returns a number out of 1 (full range of the region).  If moving
   * horizontally, progress will be proportion of width.  If moving vertically, progress will be
   * a proportion of the height.
   * @public
   *
   * @returns {number}
   */
  getProgressThroughRegion() {
    let range;
    let difference;
    if (this.movingHorizontally() || this.movingDiagonally()) {
      range = PlayAreaMap.COLUMN_RANGES[this.playAreaColumnProperty.get()];
      difference = this.getCenter().x - range.min;
    } else if (this.movingVertically()) {
      range = PlayAreaMap.ROW_RANGES[this.playAreaRowProperty.get()];
      difference = this.getCenter().y - range.min;
    }

    // determine how far we are through the region
    let progress = difference / range.getLength();

    // progress is the difference of the calculated proportion if moving to the left or up
    const direction = this.directionProperty.get();
    if (direction === BalloonDirectionEnum.LEFT || direction === BalloonDirectionEnum.UP) {
      progress = 1 - progress;
    }
    assert && assert(typeof progress === 'number' && progress >= 0, 'no progress through play area region was determined.');
    return progress;
  }

  /**
   * Set the center position of the balloon. Sets the position Property but with an offset to account
   * for the balloon dimensions.
   * @public
   *
   * @param {Vector2} center
   */
  setCenter(center) {
    this.positionProperty.set(new Vector2(center.x - this.width / 2, center.y - this.height / 2));
  }

  /**
   * Get the center position of the balloon.
   * @public
   * @returns {Vector2}
   */
  getCenter() {
    return new Vector2(this.positionProperty.get().x + this.width / 2, this.positionProperty.get().y + this.height / 2);
  }

  /**
   * Get the vertical center of the balloon model.
   * @public
   *
   * @returns {number}
   */
  getCenterY() {
    return this.positionProperty.get().y + this.height / 2;
  }

  /**
   * Get the horizontal center position of the balloon.
   * @public
   * @returns {number}
   */
  getCenterX() {
    return this.positionProperty.get().x + this.width / 2;
  }

  /**
   * Get the right edge of the balloon.
   * @public
   *
   * @returns {number}
   */
  getRight() {
    return this.positionProperty.get().x + this.width;
  }

  /**
   * Get the model position of the left edge of the balloon.
   * @public
   *
   * @returns {number}
   */
  getLeft() {
    return this.positionProperty.get().x;
  }

  /**
   * Balloon charges aren't evenly distributed throughout the balloon, they conform to the upper left edge of the
   * balloon image, placed by visual inspection.  This returns a Vector2 pointing to what is approximately the center
   * of the balloon charges.  In x, this remains the center of the model bounds.  In y, this is the top of the
   * balloon plus the average y position of the charges.
   *
   * @public
   * @returns {Vector2}
   */
  getChargeCenter() {
    const centerX = this.getCenter().x;
    const centerY = this.positionProperty.get().y + AVERAGE_CHARGE_Y;
    return new Vector2(centerX, centerY);
  }

  /**
   * Get the position of the left touch point of the balloon against the sweater. If the balloon center is to the
   * right of the sweater edge, use  the left edge of the balloon. Otherwise, use the balloon center.
   * @public
   *
   * @returns {Vector2}
   */
  getSweaterTouchingCenter() {
    const sweater = this.balloonsAndStaticElectricityModel.sweater;
    const sweaterRight = sweater.x + sweater.width;
    let centerX;
    if (this.getCenter().x > sweaterRight) {
      centerX = this.positionProperty.get().x;
    } else {
      centerX = this.getCenter().x;
    }
    return new Vector2(centerX, this.getCenterY());
  }

  /**
   * Returns whether or not this balloon has any charge. Just a helper function for convenience and readability.
   * @public
   * @returns {boolean}
   */
  isCharged() {
    // value will be negative (electrons)
    return this.chargeProperty.get() < 0;
  }

  /**
   * Returns true if this balloon is both inducing charge and visible. Helper function for readability.
   * @public
   * @returns {boolean}
   */
  inducingChargeAndVisible() {
    return this.isVisibleProperty.get() && this.inducingChargeProperty.get();
  }

  /**
   * Whether this balloon is inducing charge in the wall. For the balloon to be inducing charge in the wall, this
   * balloon must be visible, the wall must be visible, and the force between wall and balloon must be large enough.
   * @public
   *
   * @returns {boolean}
   */
  inducingCharge(wallVisible) {
    // if there is no charge close to the balloon, immediately return false
    if (!this.closestChargeInWall) {
      return false;
    }

    // otherwise, wall and balloon must be visible, and force must be large enough
    const balloonForce = BalloonModel.getForceToClosestWallCharge(this);
    const forceLargeEnough = this.balloonsAndStaticElectricityModel.wall.forceIndicatesInducedCharge(balloonForce);
    return wallVisible && this.isVisibleProperty.get() && forceLargeEnough;
  }

  /**
   * Reset balloons to initial position and uncharged state. By default, this will also reset visibility.
   * @public
   *
   * @param {boolean} notResetVisibility - if true, visibility will NOT be reset
   */
  reset(notResetVisibility) {
    this.xVelocityArray = [0, 0, 0, 0, 0];
    this.xVelocityArray.counter = 0;
    assert && assert(this.xVelocityArray.length = VELOCITY_ARRAY_LENGTH, 'velocity array incorrectly initialized');
    this.yVelocityArray = [0, 0, 0, 0, 0];
    this.yVelocityArray.counter = 0;
    assert && assert(this.yVelocityArray.length = VELOCITY_ARRAY_LENGTH, 'velocity array incorrectly initialized');
    this.chargeProperty.reset();
    this.velocityProperty.reset();
    this.positionProperty.reset();
    this.directionProperty.reset();
    if (!notResetVisibility) {
      this.isVisibleProperty.reset();
    }
    this.isDraggedProperty.reset();
    this.successfulPickUp = false;

    // broadcast a message when we are reset
    this.resetEmitter.emit();
  }

  /**
   * Steps the BalloonModel.
   * @public
   *
   * @param {BASEModel} model
   * @param {number} dtSeconds elapsed time in seconds
   */
  step(model, dtSeconds) {
    // seconds to milliseconds - really, the model is fairly 'unitless' but multiplying the
    // time step by 1000 makes the sim look and feel like the Java version
    let dt = dtSeconds * 1000;

    // limit large values of dt - they probably mean that the sim just regained focus
    if (dt > 500) {
      dt = 1 / 60 * 1000; // nominal time stamp at 60 fps
    }

    if (this.isDraggedProperty.get()) {
      // drag the balloon, which may cause it to pick up charges
      this.dragBalloon(model, dt);
    } else {
      this.applyForce(dt);

      // increment the time since release
      this.timeSinceRelease += dt;
    }
    this.oldPosition = this.positionProperty.get().copy();
  }

  /**
   * When balloon is dragged, check to see if we catch a minus charge.  Returns a boolean
   * that indicates whether or not a charge was picked up.
   * @public
   *
   * @param  {BASEModel} model
   * @param  {number} dt
   * @returns {boolean} chargeFound
   */
  dragBalloon(model, dt) {
    // Prevent a fuzzer error that tries to drag the balloon before step is called.
    if (!this.oldPosition) {
      return false;
    }
    const vx = (this.positionProperty.get().x - this.oldPosition.x) / dt;
    const vy = (this.positionProperty.get().y - this.oldPosition.y) / dt;

    // calculate average velocity
    this.xVelocityArray[this.xVelocityArray.counter++] = vx * vx;
    this.xVelocityArray.counter %= VELOCITY_ARRAY_LENGTH;
    this.yVelocityArray[this.yVelocityArray.counter++] = vy * vy;
    this.yVelocityArray.counter %= VELOCITY_ARRAY_LENGTH;
    let averageX = 0;
    let averageY = 0;
    for (let i = 0; i < VELOCITY_ARRAY_LENGTH; i++) {
      averageX += this.xVelocityArray[i];
      averageY += this.yVelocityArray[i];
    }
    averageX /= VELOCITY_ARRAY_LENGTH;
    averageY /= VELOCITY_ARRAY_LENGTH;

    // if average speed larger than threshold speed we try to move minus charges from sweater to balloon
    const speed = Math.sqrt(averageX * averageX + averageY * averageY);
    this.dragVelocityProperty.set(new Vector2(vx, vy));
    let chargeFound = false;
    if (speed > 0) {
      chargeFound = model.sweater.checkAndTransferCharges(this);
    }
    return chargeFound;
  }

  /**
   * Get the force between this balloon and the sweater.
   * @public
   *
   * @param  {SweaterModel} sweaterModel
   * @returns {Vector2}
   */
  getSweaterForce(sweaterModel) {
    return BalloonModel.getForce(sweaterModel.center, this.getCenter(), -BalloonModel.FORCE_CONSTANT * sweaterModel.chargeProperty.get() * this.chargeProperty.get());
  }

  /**
   * Returns whether or not the balloon is touching the boundary of the play area, including the bottom, left
   * and top edges, or the right edge or wall depending on wall visibility.
   * @public
   *
   * @returns {string}
   */
  isTouchingBoundary() {
    return this.isTouchingRightBoundary() || this.isTouchingLeftBoundary() || this.isTouchingBottomBoundary() || this.isTouchingTopBoundary();
  }

  /**
   * Returns whether or not the balloon is touching the right boundary of the play area.  If the wall
   * is visible, this will be the position where the balloon is touching the wall, otherwise it will
   * be the position where the balloon is touching the right edge of the play area.
   * @public
   *
   * @returns {boolean}
   */
  isTouchingRightBoundary() {
    const balloonX = this.getCenter().x;
    if (this.balloonsAndStaticElectricityModel.wall.isVisibleProperty.get()) {
      return PlayAreaMap.X_POSITIONS.AT_WALL === balloonX;
    } else {
      return PlayAreaMap.X_BOUNDARY_POSITIONS.AT_RIGHT_EDGE === balloonX;
    }
  }

  /**
   * Returns whether or not the balloon is touching the right most edge of the play area (should be impossible
   * if the wall is invisible)
   * @public
   *
   * @returns {boolean}
   */
  isTouchingRightEdge() {
    const balloonX = this.getCenterX();
    return PlayAreaMap.X_BOUNDARY_POSITIONS.AT_RIGHT_EDGE === balloonX;
  }

  /**
   * Returns whether or not the balloon is touching the bottom boundary of the play area.
   * @public
   *
   * @returns {boolean}
   */
  isTouchingBottomBoundary() {
    return PlayAreaMap.Y_BOUNDARY_POSITIONS.AT_BOTTOM === this.getCenterY();
  }

  /**
   * @public
   * @returns {boolean}
   */
  isTouchingLeftBoundary() {
    return PlayAreaMap.X_BOUNDARY_POSITIONS.AT_LEFT_EDGE === this.getCenterX();
  }

  /**
   * Returns whether or not the balloon is touching the top boundary of the play area.
   * @public
   *
   * @returns {boolean}
   */
  isTouchingTopBoundary() {
    return PlayAreaMap.Y_BOUNDARY_POSITIONS.AT_TOP === this.getCenterY();
  }

  /**
   * Apply a force on this balloon, and move it to new coordinates.  Also updates the velocity.
   * @private
   *
   * @param  {number} dt - in seconds
   */
  applyForce(dt) {
    // only move if this balloon is not over the sweater
    const model = this.balloonsAndStaticElectricityModel;
    if (!this.centerInSweaterChargedArea()) {
      const rightBound = model.playAreaBounds.maxX;
      const force = this.getTotalForce();
      const newVelocity = this.velocityProperty.get().plus(force.timesScalar(dt));
      const newPosition = this.positionProperty.get().plus(this.velocityProperty.get().timesScalar(dt));
      if (newPosition.x + this.width >= rightBound) {
        // trying to go beyond right bound
        newPosition.x = rightBound - this.width;
        if (newVelocity.x > 0) {
          newVelocity.x = 0;

          // If this balloon is pushing up against the wall and it is being stopped from moving in the X direction as a
          // result, stop it from moving in the Y direction too.  This is realistic, since there would likely be a fair
          // amount of friction at the balloon/wall interface, and helps to prevent some odd behaviors, see
          // https://github.com/phetsims/balloons-and-static-electricity/issues/544.
          if (this.touchingWallProperty.value) {
            newVelocity.y = 0;
          }
        }
      }
      if (newPosition.y + this.height >= model.playAreaBounds.maxY) {
        // trying to go beyond bottom bound
        newPosition.y = model.playAreaBounds.maxY - this.height;
        newVelocity.y = newVelocity.y > 0 ? 0 : newVelocity.y;
      }
      if (newPosition.x <= model.playAreaBounds.minX) {
        // trying to go  beyond left bound
        newPosition.x = model.playAreaBounds.minX;
        newVelocity.x = newVelocity.x < 0 ? 0 : newVelocity.x;
      }
      if (newPosition.y <= model.playAreaBounds.minY) {
        newPosition.y = model.playAreaBounds.minY;
        newVelocity.y = newVelocity.y < 0 ? 0 : newVelocity.y;
      }

      // update position before velocity so that listeners associated with velocity can reference the correct
      // position on updated velocity
      this.positionProperty.set(newPosition);
      this.velocityProperty.set(newVelocity);
    } else {
      this.velocityProperty.set(Vector2.ZERO);
    }
  }

  /**
   * Get the total force on this balloon.  The balloon will feel forces from all objects in the play area, including
   * the sweater, the wall, and the other balloon if it is visible.
   * @private
   * @returns {Vector2}
   */
  getTotalForce() {
    const model = this.balloonsAndStaticElectricityModel;
    if (model.wall.isVisibleProperty.get()) {
      const distFromWall = model.wall.x - this.positionProperty.get().x;

      // if the balloon has enough charge and is close enough to the wall, the wall attracts it more than the sweater
      if (this.chargeProperty.get() < -5) {
        const relDist = distFromWall - this.width;
        const fright = 0.003;
        if (relDist <= 40 + this.chargeProperty.get() / 8) {
          return new Vector2(-fright * this.chargeProperty.get() / 20.0, 0);
        }
      }
    }
    const force = this.getSweaterForce(model.sweater);
    const other = this.getOtherBalloonForce();
    const sumOfForces = force.plus(other);

    // Don't allow the force to be too high or the balloon can jump across the screen in 1 step, see #67
    const mag = sumOfForces.magnitude;
    const max = 1E-2;
    if (mag > max) {
      sumOfForces.normalize();
      sumOfForces.multiplyScalar(max);
    }
    return sumOfForces;
  }

  /**
   * Get the force on this balloon model from another balloon model. If the other balloon is being dragged, or is
   * invisible, zero is returned. See getForce() for the actual force calculation
   * @public
   *
   * @returns {Vector2}
   */
  getOtherBalloonForce() {
    if (this.isDraggedProperty.get() || !this.isVisibleProperty.get() || !this.other.isVisibleProperty.get()) {
      return new Vector2(0, 0);
    }
    const kqq = BalloonModel.FORCE_CONSTANT * this.chargeProperty.get() * this.other.chargeProperty.get();
    return BalloonModel.getForce(this.getCenter(), this.other.getCenter(), kqq);
  }

  /**
   * Calculate the force between to charged objects using Coulomb's law.  This allows the client to provide a
   * different value for the exponent used on the radius, which can be used to tweak the visual performance of the
   * simulation.
   *
   * @public
   * @static
   *
   * @param  {Vector2} p1 - position of the first object
   * @param  {Vector2} p2 - position of the second object
   * @param  {number} kqq - some constant times the two charges
   * @param  {number} [power] - optional, default of 2, but 1 is added so the acceleration is exaggerated
   * @returns {Vector2}
   */
  static getForce(p1, p2, kqq, power) {
    // power defaults to 2
    power = power || 2;

    // calculate a vector from one point to the other
    const difference = p1.minus(p2);
    const r = difference.magnitude;

    // if the points are right on top of one another, return an attraction value of zero
    if (r === 0) {
      return new Vector2(0, 0);
    }

    // make this a unit vector
    difference.setMagnitude(1);

    // scale by the force value
    return difference.timesScalar(kqq / Math.pow(r, power));
  }

  /**
   * Get the force on a balloon from the closest charge to the balloon in the wall.
   * @public
   *
   * @param {BalloonModel} balloon
   * @returns {Vector2}
   */
  static getForceToClosestWallCharge(balloon) {
    return BalloonModel.getForce(balloon.closestChargeInWall.positionProperty.get(), balloon.getCenter(), BASEConstants.COULOMBS_LAW_CONSTANT * balloon.chargeProperty.get() * PointChargeModel.CHARGE, 2.35);
  }

  /**
   * Get the direction of movement that would take you from point A to point B, returning one of BalloonDirectionEnum,
   * LEFT, RIGHT,  UP, DOWN,  UP_LEFT, UP_RIGHT, DOWN_LEFT, DOWN_RIGHT. Uses Math.atan2, so the angle is mapped from
   * 0 to +/- Math.PI.
   * @public
   *
   * @param  {Vector2} pointA
   * @param  {Vector2} pointB
   * @returns {string} - one of BalloonDirectionEnum
   * @static
   */
  static getDirection(pointA, pointB) {
    let direction;
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const angle = Math.atan2(dy, dx);

    // atan2 wraps around Math.PI, so special check for moving left from absolute value
    if (DIRECTION_MAP.LEFT.contains(Math.abs(angle))) {
      direction = BalloonDirectionEnum.LEFT;
    }

    // otherwise, angle will be in one of the ranges in DIRECTION_MAP
    for (let i = 0; i < DIRECTION_MAP_KEYS.length; i++) {
      const entry = DIRECTION_MAP[DIRECTION_MAP_KEYS[i]];
      if (entry.contains(angle)) {
        direction = BalloonDirectionEnum[DIRECTION_MAP_KEYS[i]];
        break;
      }
    }
    return direction;
  }
}

// @static - value for Coulomb's constant used in the calculations but NOT THE ACTUAL VALUE.  It has been tweaked in
// order to get the visual behavior that we need in the sim.
BalloonModel.FORCE_CONSTANT = 0.05;
BalloonModel.BALLOON_WIDTH = BALLOON_WIDTH;
balloonsAndStaticElectricity.register('BalloonModel', BalloonModel);
export default BalloonModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJSYW5nZSIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJUYW5kZW0iLCJOdWxsYWJsZUlPIiwiU3RyaW5nSU8iLCJiYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5IiwiQkFTRUNvbnN0YW50cyIsIkJhbGxvb25EaXJlY3Rpb25FbnVtIiwiUGxheUFyZWFNYXAiLCJQb2ludENoYXJnZU1vZGVsIiwiVkVMT0NJVFlfQVJSQVlfTEVOR1RIIiwiQkFMTE9PTl9XSURUSCIsIkJBTExPT05fSEVJR0hUIiwiRElBR09OQUxfTU9WRU1FTlRfVEhSRVNIT0xEIiwiTWF0aCIsIlBJIiwiRElSRUNUSU9OX01BUCIsIlVQIiwiRE9XTiIsIlJJR0hUIiwiTEVGVCIsIlVQX0xFRlQiLCJET1dOX0xFRlQiLCJVUF9SSUdIVCIsIkRPV05fUklHSFQiLCJESVJFQ1RJT05fTUFQX0tFWVMiLCJPYmplY3QiLCJrZXlzIiwiUE9TSVRJT05TIiwicG9zaXRpb25ZU3VtIiwiaSIsImxlbmd0aCIsIkFWRVJBR0VfQ0hBUkdFX1kiLCJCYWxsb29uTW9kZWwiLCJjb25zdHJ1Y3RvciIsIngiLCJ5IiwiYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eU1vZGVsIiwiZGVmYXVsdFZpc2liaWxpdHkiLCJ0YW5kZW0iLCJjaGFyZ2VQcm9wZXJ0eSIsIm51bWJlclR5cGUiLCJyYW5nZSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1JlYWRPbmx5IiwidmVsb2NpdHlQcm9wZXJ0eSIsIlpFUk8iLCJ2YWx1ZUNvbXBhcmlzb25TdHJhdGVneSIsImlzVmlzaWJsZVByb3BlcnR5IiwiaXNEcmFnZ2VkUHJvcGVydHkiLCJkcmFnZ2luZ1dpdGhQb2ludGVyIiwicG9zaXRpb25Qcm9wZXJ0eSIsImRyYWdWZWxvY2l0eVByb3BlcnR5Iiwib25Td2VhdGVyUHJvcGVydHkiLCJ0b3VjaGluZ1dhbGxQcm9wZXJ0eSIsInBsYXlBcmVhQ29sdW1uUHJvcGVydHkiLCJwbGF5QXJlYVJvd1Byb3BlcnR5IiwicGxheUFyZWFMYW5kbWFya1Byb3BlcnR5IiwiZGlyZWN0aW9uUHJvcGVydHkiLCJwaGV0aW9WYWx1ZVR5cGUiLCJpbmR1Y2luZ0NoYXJnZVByb3BlcnR5IiwieFZlbG9jaXR5QXJyYXkiLCJjb3VudGVyIiwianVtcGluZyIsInN1Y2Nlc3NmdWxQaWNrVXAiLCJ3aWR0aCIsImhlaWdodCIsImNsb3Nlc3RDaGFyZ2VJbldhbGwiLCJ0aW1lU2luY2VSZWxlYXNlIiwib2xkUG9zaXRpb24iLCJnZXQiLCJjb3B5IiwicG9zaXRpb25zT2ZTdGFydENoYXJnZXMiLCJyZXNldEVtaXR0ZXIiLCJwbHVzQ2hhcmdlcyIsIm1pbnVzQ2hhcmdlcyIsImZvckVhY2giLCJlbnRyeSIsInBsdXNDaGFyZ2UiLCJPUFRfT1VUIiwicHVzaCIsIm1pbnVzQ2hhcmdlIiwiUkFESVVTIiwiYm91bmRzIiwibGluayIsInBvc2l0aW9uIiwic2V0TWluTWF4Iiwic2V0IiwiZ2V0RGlyZWN0aW9uIiwib25Td2VhdGVyIiwidG91Y2hpbmdXYWxsIiwibGF6eUxpbmsiLCJpc0RyYWdnZWQiLCJyZXNldCIsIm5lYXJXYWxsIiwiTEFORE1BUktfUkFOR0VTIiwiQVRfTkVBUl9XQUxMIiwiY29udGFpbnMiLCJnZXRDZW50ZXIiLCJzd2VhdGVyQm91bmRzIiwic3dlYXRlciIsImludGVyc2VjdHNCb3VuZHMiLCJjZW50ZXJJblN3ZWF0ZXJDaGFyZ2VkQXJlYSIsImNoYXJnZWRBcmVhIiwiY29udGFpbnNQb2ludCIsIm5lYXJTd2VhdGVyIiwiQVRfTkVBUl9TV0VBVEVSIiwibmVhclJpZ2h0RWRnZSIsIkFUX05FQVJfUklHSFRfRURHRSIsImdldENlbnRlclgiLCJyaWdodEF0V2FsbFBvc2l0aW9uIiwiWF9QT1NJVElPTlMiLCJBVF9XQUxMIiwiYXRSaWdodEVkZ2UiLCJYX0JPVU5EQVJZX1BPU0lUSU9OUyIsImF0TGVmdEVkZ2UiLCJBVF9MRUZUX0VER0UiLCJpbkNlbnRlclBsYXlBcmVhIiwiQ09MVU1OX1JBTkdFUyIsIkNFTlRFUl9QTEFZX0FSRUEiLCJ2ZXJ5Q2xvc2VUb09iamVjdCIsImNlbnRlclgiLCJBVF9WRVJZX0NMT1NFX1RPX1NXRUFURVIiLCJBVF9WRVJZX0NMT1NFX1RPX1dBTEwiLCJBVF9WRVJZX0NMT1NFX1RPX1JJR0hUX0VER0UiLCJhdFdhbGwiLCJ3YWxsVmlzaWJsZSIsIndhbGwiLCJtb3ZpbmdIb3Jpem9udGFsbHkiLCJkaXJlY3Rpb24iLCJtb3ZpbmdWZXJ0aWNhbGx5IiwibW92aW5nRGlhZ29uYWxseSIsIm1vdmluZ1JpZ2h0IiwibW92aW5nTGVmdCIsImdldFByb2dyZXNzVGhyb3VnaFJlZ2lvbiIsImRpZmZlcmVuY2UiLCJtaW4iLCJST1dfUkFOR0VTIiwicHJvZ3Jlc3MiLCJnZXRMZW5ndGgiLCJhc3NlcnQiLCJzZXRDZW50ZXIiLCJjZW50ZXIiLCJnZXRDZW50ZXJZIiwiZ2V0UmlnaHQiLCJnZXRMZWZ0IiwiZ2V0Q2hhcmdlQ2VudGVyIiwiY2VudGVyWSIsImdldFN3ZWF0ZXJUb3VjaGluZ0NlbnRlciIsInN3ZWF0ZXJSaWdodCIsImlzQ2hhcmdlZCIsImluZHVjaW5nQ2hhcmdlQW5kVmlzaWJsZSIsImluZHVjaW5nQ2hhcmdlIiwiYmFsbG9vbkZvcmNlIiwiZ2V0Rm9yY2VUb0Nsb3Nlc3RXYWxsQ2hhcmdlIiwiZm9yY2VMYXJnZUVub3VnaCIsImZvcmNlSW5kaWNhdGVzSW5kdWNlZENoYXJnZSIsIm5vdFJlc2V0VmlzaWJpbGl0eSIsInlWZWxvY2l0eUFycmF5IiwiZW1pdCIsInN0ZXAiLCJtb2RlbCIsImR0U2Vjb25kcyIsImR0IiwiZHJhZ0JhbGxvb24iLCJhcHBseUZvcmNlIiwidngiLCJ2eSIsImF2ZXJhZ2VYIiwiYXZlcmFnZVkiLCJzcGVlZCIsInNxcnQiLCJjaGFyZ2VGb3VuZCIsImNoZWNrQW5kVHJhbnNmZXJDaGFyZ2VzIiwiZ2V0U3dlYXRlckZvcmNlIiwic3dlYXRlck1vZGVsIiwiZ2V0Rm9yY2UiLCJGT1JDRV9DT05TVEFOVCIsImlzVG91Y2hpbmdCb3VuZGFyeSIsImlzVG91Y2hpbmdSaWdodEJvdW5kYXJ5IiwiaXNUb3VjaGluZ0xlZnRCb3VuZGFyeSIsImlzVG91Y2hpbmdCb3R0b21Cb3VuZGFyeSIsImlzVG91Y2hpbmdUb3BCb3VuZGFyeSIsImJhbGxvb25YIiwiQVRfUklHSFRfRURHRSIsImlzVG91Y2hpbmdSaWdodEVkZ2UiLCJZX0JPVU5EQVJZX1BPU0lUSU9OUyIsIkFUX0JPVFRPTSIsIkFUX1RPUCIsInJpZ2h0Qm91bmQiLCJwbGF5QXJlYUJvdW5kcyIsIm1heFgiLCJmb3JjZSIsImdldFRvdGFsRm9yY2UiLCJuZXdWZWxvY2l0eSIsInBsdXMiLCJ0aW1lc1NjYWxhciIsIm5ld1Bvc2l0aW9uIiwidmFsdWUiLCJtYXhZIiwibWluWCIsIm1pblkiLCJkaXN0RnJvbVdhbGwiLCJyZWxEaXN0IiwiZnJpZ2h0Iiwib3RoZXIiLCJnZXRPdGhlckJhbGxvb25Gb3JjZSIsInN1bU9mRm9yY2VzIiwibWFnIiwibWFnbml0dWRlIiwibWF4Iiwibm9ybWFsaXplIiwibXVsdGlwbHlTY2FsYXIiLCJrcXEiLCJwMSIsInAyIiwicG93ZXIiLCJtaW51cyIsInIiLCJzZXRNYWduaXR1ZGUiLCJwb3ciLCJiYWxsb29uIiwiQ09VTE9NQlNfTEFXX0NPTlNUQU5UIiwiQ0hBUkdFIiwicG9pbnRBIiwicG9pbnRCIiwiZHgiLCJkeSIsImFuZ2xlIiwiYXRhbjIiLCJhYnMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJhbGxvb25Nb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBvZiBhIGJhbGxvb24sIHdoaWNoIGNhbiBoYXZlIGNoYXJnZSwgcG9zaXRpb24gYW5kIHZlbG9jaXR5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIFZhc2lseSBTaGFraG92IChNbGVhcm5lcilcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IE51bGxhYmxlSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bGxhYmxlSU8uanMnO1xyXG5pbXBvcnQgU3RyaW5nSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0cmluZ0lPLmpzJztcclxuaW1wb3J0IGJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkgZnJvbSAnLi4vLi4vYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eS5qcyc7XHJcbmltcG9ydCBCQVNFQ29uc3RhbnRzIGZyb20gJy4uL0JBU0VDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQmFsbG9vbkRpcmVjdGlvbkVudW0gZnJvbSAnLi9CYWxsb29uRGlyZWN0aW9uRW51bS5qcyc7XHJcbmltcG9ydCBQbGF5QXJlYU1hcCBmcm9tICcuL1BsYXlBcmVhTWFwLmpzJztcclxuaW1wb3J0IFBvaW50Q2hhcmdlTW9kZWwgZnJvbSAnLi9Qb2ludENoYXJnZU1vZGVsLmpzJztcclxuXHJcbi8vIGNvbnN0YW50cywgbW9zdCBpZiBub3QgYWxsIG9mIHdoaWNoIHdlcmUgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byBlbGljaXQgdGhlIGRlc2lyZWQgYXBwZWFyYW5jZSBhbmQgYmVoYXZpb3JcclxuY29uc3QgVkVMT0NJVFlfQVJSQVlfTEVOR1RIID0gNTtcclxuY29uc3QgQkFMTE9PTl9XSURUSCA9IDEzNDtcclxuY29uc3QgQkFMTE9PTl9IRUlHSFQgPSAyMjI7XHJcblxyXG4vLyB0aHJlc2hvbGQgZm9yIGRpYWdvbmFsIG1vdmVtZW50IGlzICsvLSAxNSBkZWdyZWVzIGZyb20gZGlhZ29uYWxzXHJcbmNvbnN0IERJQUdPTkFMX01PVkVNRU5UX1RIUkVTSE9MRCA9IDE1ICogTWF0aC5QSSAvIDE4MDtcclxuXHJcbi8vIG1hcCB0aGF0IGRldGVybWluZXMgaWYgdGhlIGJhbGxvb24gaXMgbW92aW5nIHVwLCBkb3duLCBob3Jpem9udGFsbHkgb3IgYWxvbmcgYSBkaWFnb25hbCBiZXR3ZWVuIHR3byBwb2ludHNcclxuY29uc3QgRElSRUNUSU9OX01BUCA9IHtcclxuICBVUDogbmV3IFJhbmdlKCAtMyAqIE1hdGguUEkgLyA0ICsgRElBR09OQUxfTU9WRU1FTlRfVEhSRVNIT0xELCAtTWF0aC5QSSAvIDQgLSBESUFHT05BTF9NT1ZFTUVOVF9USFJFU0hPTEQgKSxcclxuICBET1dOOiBuZXcgUmFuZ2UoIE1hdGguUEkgLyA0ICsgRElBR09OQUxfTU9WRU1FTlRfVEhSRVNIT0xELCAzICogTWF0aC5QSSAvIDQgLSBESUFHT05BTF9NT1ZFTUVOVF9USFJFU0hPTEQgKSxcclxuICBSSUdIVDogbmV3IFJhbmdlKCAtTWF0aC5QSSAvIDQgKyBESUFHT05BTF9NT1ZFTUVOVF9USFJFU0hPTEQsIE1hdGguUEkgLyA0IC0gRElBR09OQUxfTU9WRU1FTlRfVEhSRVNIT0xEICksXHJcblxyXG4gIC8vIGF0YW4yIHdyYXBzIGFyb3VuZCBQSSwgc28gd2Ugd2lsbCB1c2UgYWJzb2x1dGUgdmFsdWUgaW4gY2hlY2tzXHJcbiAgTEVGVDogbmV3IFJhbmdlKCAzICogTWF0aC5QSSAvIDQgKyBESUFHT05BTF9NT1ZFTUVOVF9USFJFU0hPTEQsIE1hdGguUEkgKSxcclxuXHJcbiAgVVBfTEVGVDogbmV3IFJhbmdlKCAtMyAqIE1hdGguUEkgLSBESUFHT05BTF9NT1ZFTUVOVF9USFJFU0hPTEQsIC0zICogTWF0aC5QSSAvIDQgKyBESUFHT05BTF9NT1ZFTUVOVF9USFJFU0hPTEQgKSxcclxuICBET1dOX0xFRlQ6IG5ldyBSYW5nZSggMyAqIE1hdGguUEkgLyA0IC0gRElBR09OQUxfTU9WRU1FTlRfVEhSRVNIT0xELCAzICogTWF0aC5QSSAvIDQgKyBESUFHT05BTF9NT1ZFTUVOVF9USFJFU0hPTEQgKSxcclxuICBVUF9SSUdIVDogbmV3IFJhbmdlKCAtTWF0aC5QSSAvIDQgLSBESUFHT05BTF9NT1ZFTUVOVF9USFJFU0hPTEQsIC1NYXRoLlBJIC8gNCArIERJQUdPTkFMX01PVkVNRU5UX1RIUkVTSE9MRCApLFxyXG4gIERPV05fUklHSFQ6IG5ldyBSYW5nZSggTWF0aC5QSSAvIDQgLSBESUFHT05BTF9NT1ZFTUVOVF9USFJFU0hPTEQsIE1hdGguUEkgLyA0ICsgRElBR09OQUxfTU9WRU1FTlRfVEhSRVNIT0xEIClcclxufTtcclxuY29uc3QgRElSRUNUSU9OX01BUF9LRVlTID0gT2JqZWN0LmtleXMoIERJUkVDVElPTl9NQVAgKTtcclxuXHJcbi8vIGNvbGxlY3Rpb24gb2YgY2hhcmdlIHBvc2l0aW9ucyBvbiB0aGUgYmFsbG9vbiwgcmVsYXRpdmUgdG8gdGhlIHRvcCBsZWZ0IGNvcm5lcnNcclxuLy8gY2hhcmdlcyB3aWxsIGFwcGVhciBpbiB0aGVzZSBwb3NpdGlvbnMgYXMgdGhlIGJhbGxvb24gY29sbGVjdHMgZWxlY3Ryb25zXHJcbmNvbnN0IFBPU0lUSU9OUyA9IFtcclxuICBbIDE0LCA3MCBdLFxyXG4gIFsgMTgsIDYwIF0sXHJcbiAgWyAxNCwgOTAgXSxcclxuICBbIDI0LCAxMzAgXSxcclxuICBbIDIyLCAxMjAgXSxcclxuICBbIDE0LCA3OSBdLFxyXG4gIFsgMjUsIDE0MCBdLFxyXG4gIFsgMTgsIDEwOCBdLFxyXG4gIFsgMTksIDUwIF0sXHJcbiAgWyA0NCwgMTUwIF0sXHJcbiAgWyAxNiwgMTAwIF0sXHJcbiAgWyAyMCwgODAgXSxcclxuICBbIDUwLCAxNjAgXSxcclxuICBbIDM0LCAxNDAgXSxcclxuICBbIDUwLCAyMCBdLFxyXG4gIFsgMzAsIDMwIF0sXHJcbiAgWyAyMiwgNzIgXSxcclxuICBbIDI0LCAxMDUgXSxcclxuICBbIDIwLCAxMTAgXSxcclxuICBbIDQwLCAxNTAgXSxcclxuICBbIDI2LCAxMTAgXSxcclxuICBbIDMwLCAxMTUgXSxcclxuICBbIDI0LCA4NyBdLFxyXG4gIFsgMjQsIDYwIF0sXHJcbiAgWyAyNCwgNDAgXSxcclxuICBbIDM4LCAyNCBdLFxyXG4gIFsgMzAsIDgwIF0sXHJcbiAgWyAzMCwgNTAgXSxcclxuICBbIDM0LCA4MiBdLFxyXG4gIFsgMzIsIDEzMCBdLFxyXG4gIFsgMzAsIDEwOCBdLFxyXG4gIFsgMzAsIDUwIF0sXHJcbiAgWyA0MCwgOTQgXSxcclxuICBbIDMwLCAxMDAgXSxcclxuICBbIDM1LCA5MCBdLFxyXG4gIFsgMjQsIDk1IF0sXHJcbiAgWyAzNCwgMTAwIF0sXHJcbiAgWyAzNSwgNDAgXSxcclxuICBbIDMwLCA2MCBdLFxyXG4gIFsgMzIsIDcyIF0sXHJcbiAgWyAzMCwgMTA1IF0sXHJcbiAgWyAzNCwgMTQwIF0sXHJcbiAgWyAzMCwgMTIwIF0sXHJcbiAgWyAzMCwgMTMwIF0sXHJcbiAgWyAzMCwgODUgXSxcclxuICBbIDM0LCA3NyBdLFxyXG4gIFsgMzUsIDkwIF0sXHJcbiAgWyA0MCwgODUgXSxcclxuICBbIDM0LCA5MCBdLFxyXG4gIFsgMzUsIDUwIF0sXHJcbiAgWyA0NiwgMzQgXSxcclxuICBbIDMyLCA3MiBdLFxyXG4gIFsgMzAsIDEwNSBdLFxyXG4gIFsgMzQsIDE0MCBdLFxyXG4gIFsgMzQsIDEyMCBdLFxyXG4gIFsgMzAsIDYwIF0sXHJcbiAgWyAzMCwgODUgXSxcclxuICBbIDM0LCA3NyBdXHJcbl07XHJcblxyXG4vLyBkZXRlcm1pbmUgYXZlcmFnZSBZIHBvc2l0aW9uIGZvciB0aGUgY2hhcmdlcyBpbiB0aGUgYmFsbG9vbiwgdXNlZCB0byBjYWxjdWxhdGUgdGhlIGF2ZXJhZ2UgdmVydGljYWwgcG9zaXRpb24gb2ZcclxuLy8gdGhlIHZpc3VhbCBjaGFyZ2UgY2VudGVyXHJcbmxldCBwb3NpdGlvbllTdW0gPSAwO1xyXG5mb3IgKCBsZXQgaSA9IDA7IGkgPCBQT1NJVElPTlMubGVuZ3RoOyBpKysgKSB7XHJcbiAgcG9zaXRpb25ZU3VtICs9IFBPU0lUSU9OU1sgaSBdWyAxIF07IC8vIHkgY29vcmRpbmF0ZSBpcyBzZWNvbmQgdmFsdWVcclxufVxyXG5jb25zdCBBVkVSQUdFX0NIQVJHRV9ZID0gKCBwb3NpdGlvbllTdW0gLyBQT1NJVElPTlMubGVuZ3RoICk7XHJcblxyXG5jbGFzcyBCYWxsb29uTW9kZWwge1xyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBpbml0aWFsIHggcG9zaXRpb25cclxuICAgKiBAcGFyYW0ge251bWJlcn0geSAtIGluaXRpYWwgeSBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7QkFTRU1vZGVsfSBiYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5TW9kZWwgLSBlbnN1cmUgYmFsbG9vbiBpcyBpbiB2YWxpZCBwb3NpdGlvbiBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZGVmYXVsdFZpc2liaWxpdHkgLSBpcyB0aGUgYmFsbG9vbiB2aXNpYmxlIGJ5IGRlZmF1bHQ/XHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB4LCB5LCBiYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5TW9kZWwsIGRlZmF1bHRWaXNpYmlsaXR5LCB0YW5kZW0gKSB7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIFByb3BlcnRpZXNcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gY2hhcmdlIG9uIHRoZSBiYWxsb29uLCByYW5nZSBnb2VzIGZyb20gbmVnYXRpdmUgdmFsdWVzIHRvIDAuXHJcbiAgICB0aGlzLmNoYXJnZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIG51bWJlclR5cGU6ICdJbnRlZ2VyJyxcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggLVBPU0lUSU9OUy5sZW5ndGgsIDAgKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2hhcmdlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7VmVjdG9yMn0gLSBUaGUgdmVsb2NpdHkgb2YgdGhlIGJhbGxvb24gd2hlbiBtb3ZpbmcgZnJlZWx5LCBpLmUuIE5PVCB3aGVuIGl0IGlzIGJlaW5nIGRyYWdnZWQuXHJcbiAgICB0aGlzLnZlbG9jaXR5UHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBWZWN0b3IyLlpFUk8sIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmVsb2NpdHlQcm9wZXJ0eScgKSxcclxuICAgICAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdlcXVhbHNGdW5jdGlvbidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufVxyXG4gICAgdGhpcy5pc1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGRlZmF1bHRWaXNpYmlsaXR5LCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2lzVmlzaWJsZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn1cclxuICAgIHRoaXMuaXNEcmFnZ2VkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdpc0RyYWdnZWRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gd2hldGhlciBvciBub3QgdGhpcyBiYWxsb29uIGlzIGJlaW5nIGRyYWdnZWQgd2l0aCBhIG1vdXNlIG9yIHRvdWNoIHBvaW50ZXIsIGluIHdoaWNoIGNhc2VcclxuICAgIC8vIHdlIHdhbnQgdG8gcmVkdWNlIHRoZSBmcmVxdWVuY3kgb2YgYWxlcnRzIGFuZCBhdm9pZCBkZXNjcmliaW5nIHZlcnkgc21hbGwgcG9zaXRpb24gY2hhbmdlcy5cclxuICAgIHRoaXMuZHJhZ2dpbmdXaXRoUG9pbnRlciA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1ZlY3RvcjJ9IC0gcG9zaXRpb24gb2YgdGhlIHVwcGVyIGxlZnQgY29ybmVyIG9mIHRoZSByZWN0YW5nbGUgdGhhdCBlbmNsb3NlcyB0aGUgYmFsbG9vblxyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIHgsIHkgKSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwb3NpdGlvblByb3BlcnR5JyApLFxyXG4gICAgICB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogJ2VxdWFsc0Z1bmN0aW9uJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1ZlY3RvcjJ9IC0gdmVsb2NpdHkgb2YgdGhlIGJhbGxvb24gd2hpbGUgZHJhZ2dpbmdcclxuICAgIHRoaXMuZHJhZ1ZlbG9jaXR5UHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggMCwgMCApLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWdWZWxvY2l0eVByb3BlcnR5JyApLFxyXG4gICAgICB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogJ2VxdWFsc0Z1bmN0aW9uJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gd2hldGhlciBvciBub3QgdGhlIGJhbGxvb24gaXMgb24gdGhlIHN3ZWF0ZXJcclxuICAgIHRoaXMub25Td2VhdGVyUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdvblN3ZWF0ZXJQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gd2hldGhlciBvciBub3QgdGhlIGJhbGxvb24gaXMgdG91Y2hpbmcgdGhlIHdhbGxcclxuICAgIHRoaXMudG91Y2hpbmdXYWxsUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0b3VjaGluZ1dhbGxQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHN0cmluZyAtIHRoZSBjdXJyZW50IGNvbHVtbiBvZiB0aGUgcGxheSBhcmVhIHRoZSBiYWxsb29uIGlzIGluXHJcbiAgICB0aGlzLnBsYXlBcmVhQ29sdW1uUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSBzdHJpbmcgLSB0aGUgY3VycmVudCByb3cgb2YgdGhlIHBsYXkgYXJlYSB0aGF0IHRoZSBiYWxsb29uIGlzIGluXHJcbiAgICB0aGlzLnBsYXlBcmVhUm93UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7c3RyaW5nfG51bGx9IC0gaWYgdGhlIGJhbGxvb24gaXMgaW4gYSBsYW5kbWFyayBwb3NpdGlvbiwgdGhpcyBQcm9wZXJ0eSB3aWxsIGJlIGEga2V5IG9mIFBsYXlBcmVhTWFwLkxBTkRNQVJLX1JBTkdFU1xyXG4gICAgdGhpcy5wbGF5QXJlYUxhbmRtYXJrUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtzdHJpbmd8bnVsbH0gLSB0aGUgZGlyZWN0aW9uIG9mIG1vdmVtZW50LCBjYW4gYmUgb25lIG9mIEJhbGxvb25EaXJlY3Rpb25FbnVtXHJcbiAgICB0aGlzLmRpcmVjdGlvblByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBudWxsLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RpcmVjdGlvblByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bGxhYmxlSU8oIFN0cmluZ0lPIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufSAtIHdoZXRoZXIgb3Igbm90IHRoZSBiYWxsb29uIGlzIGN1cnJlbnRseSBpbmR1Y2luZyBhIGNoYXJnZSBpbiB0aGUgd2FsbFxyXG4gICAgdGhpcy5pbmR1Y2luZ0NoYXJnZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaW5kdWNpbmdDaGFyZ2VQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBhcnJheSBvZiBpbnN0YW50YW5lb3VzIHZlbG9jaXR5IG9mIGJhbGxvb24gbGFzdCA1IHRpY2tzXHJcbiAgICAvLyB0aGVuIHdlIGNhbGN1bGF0ZSBhdmVyYWdlIHZlbG9jaXR5IGFuZCBjb21wYXJlcyBpdCB3aXRoIHRocmVzaG9sZCB2ZWxvY2l0eSB0byBjaGVjayBpZiB3ZSBjYXRjaCBtaW51cyBjaGFyZ2UgZnJvbSBzd2VhdGVyXHJcbiAgICB0aGlzLnhWZWxvY2l0eUFycmF5ID0gWyAwLCAwLCAwLCAwLCAwIF07XHJcbiAgICB0aGlzLnhWZWxvY2l0eUFycmF5LmNvdW50ZXIgPSAwO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIHdoZXRoZXIgb3Igbm90IHRoZSBiYWxsb29uIGlzIGN1cnJlbnRseSAnanVtcGluZycsIG1vdmluZyB0aHJvdWdoIGEgcG9zaXRpb24gaW4gdGhlIHBsYXlcclxuICAgIC8vIGFyZWEgd2l0aG91dCBkcmFnZ2luZyBvciBhbiBhcHBsaWVkIGZvcmNlXHJcbiAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufSAtIGZsYWcgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciB0aGUgYmFsbG9vbiBoYXMgc3VjY2Vzc2Z1bGx5IGJlZW4gcGlja2VkIHVwIHNpbmNlIHRoZSBsYXN0XHJcbiAgICAvLyByZXNldCBvZiB0aGUgbW9kZWxcclxuICAgIHRoaXMuc3VjY2Vzc2Z1bFBpY2tVcCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgZGltZW5zaW9ucyBvZiB0aGUgYmFsbG9vblxyXG4gICAgdGhpcy53aWR0aCA9IEJBTExPT05fV0lEVEg7XHJcbiAgICB0aGlzLmhlaWdodCA9IEJBTExPT05fSEVJR0hUO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge01vdmFibGVQb2ludENoYXJnZU1vZGVsfSAtIHRoZSBjbG9zZXN0IG1pbnVzIGNoYXJnZSB0byB0aGUgYmFsbG9vbiB3aGljaCBpcyBpbiB0aGUgd2FsbFxyXG4gICAgdGhpcy5jbG9zZXN0Q2hhcmdlSW5XYWxsID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gaW4gbXMsIHRoZSBhbW91bnQgb2YgdGltZSB0aGF0IGhhcyBwYXNzZWQgc2luY2UgYmFsbG9vbiBoYXMgYmVlbiByZWxlYXNlZFxyXG4gICAgdGhpcy50aW1lU2luY2VSZWxlYXNlID0gMDtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gdGhlIG9sZCBwb3NpdGlvbiBvZiB0aGUgYmFsbG9vbiwgdXNlZCB0aHJvdWdob3V0IHRoZSBtb2RlbCBhbmQgdmlldyB0byBjYWxjdWxhdGVcclxuICAgIC8vIGNoYW5nZXMgaW4gcG9zaXRpb25cclxuICAgIHRoaXMub2xkUG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuY29weSgpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gcG9zaXRpb25zIG9mIG5ldXRyYWwgYXRvbXMgb24gYmFsbG9vbiwgZG9uJ3QgY2hhbmdlIGR1cmluZyBzaW11bGF0aW9uXHJcbiAgICB0aGlzLnBvc2l0aW9uc09mU3RhcnRDaGFyZ2VzID0gW1xyXG4gICAgICBbIDQ0LCA1MCBdLFxyXG4gICAgICBbIDg4LCA1MCBdLFxyXG4gICAgICBbIDQ0LCAxNDAgXSxcclxuICAgICAgWyA4OCwgMTQwIF1cclxuICAgIF07XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIHdpbGwgZW1pdCBhbiBldmVudCB3aGVuIHRoZSBiYWxsb29uIGlzIHJlc2V0XHJcbiAgICB0aGlzLnJlc2V0RW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPFBvaW50Q2hhcmdlTW9kZWw+fVxyXG4gICAgdGhpcy5wbHVzQ2hhcmdlcyA9IFtdO1xyXG4gICAgdGhpcy5taW51c0NoYXJnZXMgPSBbXTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QkFTRU1vZGVsfVxyXG4gICAgdGhpcy5iYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5TW9kZWwgPSBiYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5TW9kZWw7XHJcblxyXG4gICAgLy8gbmV1dHJhbCBwYWlyIG9mIGNoYXJnZXNcclxuICAgIHRoaXMucG9zaXRpb25zT2ZTdGFydENoYXJnZXMuZm9yRWFjaCggZW50cnkgPT4ge1xyXG4gICAgICBjb25zdCBwbHVzQ2hhcmdlID0gbmV3IFBvaW50Q2hhcmdlTW9kZWwoIGVudHJ5WyAwIF0sIGVudHJ5WyAxIF0sIFRhbmRlbS5PUFRfT1VULCBmYWxzZSApO1xyXG4gICAgICB0aGlzLnBsdXNDaGFyZ2VzLnB1c2goIHBsdXNDaGFyZ2UgKTtcclxuXHJcbiAgICAgIC8vIG1pbnVzIGNoYXJnZXMgYXQgc2FtZSBwb3NpdGlvbiBvZiBwb3NpdGl2ZSBjaGFyZ2UsIHNoaWZ0ZWQgZG93biBhbmQgdG8gdGhlIHJpZ2h0IGJ5IGNoYXJnZSByYWRpdXNcclxuICAgICAgY29uc3QgbWludXNDaGFyZ2UgPSBuZXcgUG9pbnRDaGFyZ2VNb2RlbChcclxuICAgICAgICBlbnRyeVsgMCBdICsgUG9pbnRDaGFyZ2VNb2RlbC5SQURJVVMsXHJcbiAgICAgICAgZW50cnlbIDEgXSArIFBvaW50Q2hhcmdlTW9kZWwuUkFESVVTLFxyXG4gICAgICAgIFRhbmRlbS5PUFRfT1VULFxyXG4gICAgICAgIGZhbHNlXHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMubWludXNDaGFyZ2VzLnB1c2goIG1pbnVzQ2hhcmdlICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY2hhcmdlcyB0aGF0IHdlIGNhbiBnZXQgZnJvbSBzd2VhdGVyLCBvbmx5IG5lZ2F0aXZlIGNoYXJnZXNcclxuICAgIFBPU0lUSU9OUy5mb3JFYWNoKCBlbnRyeSA9PiB7XHJcbiAgICAgIGNvbnN0IG1pbnVzQ2hhcmdlID0gbmV3IFBvaW50Q2hhcmdlTW9kZWwoIGVudHJ5WyAwIF0sIGVudHJ5WyAxIF0sIFRhbmRlbS5PUFRfT1VULCBmYWxzZSApO1xyXG4gICAgICB0aGlzLm1pbnVzQ2hhcmdlcy5wdXNoKCBtaW51c0NoYXJnZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgbW9kZWwgYm91bmRzLCB1cGRhdGVkIHdoZW4gcG9zaXRpb24gY2hhbmdlc1xyXG4gICAgdGhpcy5ib3VuZHMgPSBuZXcgQm91bmRzMihcclxuICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLngsXHJcbiAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55LFxyXG4gICAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueCArIHRoaXMud2lkdGgsXHJcbiAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55ICsgdGhpcy5oZWlnaHRcclxuICAgICk7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgcG9zaXRpb24gY2hhbmdlcywgdXBkYXRlIHRoZSBib3VuZHMgb2YgYmFsbG9vbiwgZGlyZWN0aW9uIG9mIG1vdmVtZW50LCBhbmQgd2hldGhlciBvciBub3QgdGhlIHRoZVxyXG4gICAgLy8gYmFsbG9vbiBpcyB0b3VjaGluZyBhbiBvYmplY3QuICBObyBuZWVkIHRvIGRpc3Bvc2UgYXMgYmFsbG9vbnMgZXhpc3QgZm9yIGxpZmUgb2Ygc2ltLlxyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LmxpbmsoICggcG9zaXRpb24sIG9sZFBvc2l0aW9uICkgPT4ge1xyXG4gICAgICB0aGlzLmJvdW5kcy5zZXRNaW5NYXgoIHBvc2l0aW9uLngsIHBvc2l0aW9uLnksIHBvc2l0aW9uLnggKyB0aGlzLndpZHRoLCBwb3NpdGlvbi55ICsgdGhpcy5oZWlnaHQgKTtcclxuXHJcbiAgICAgIGlmICggb2xkUG9zaXRpb24gKSB7XHJcblxyXG4gICAgICAgIC8vIHRoZSBkaXJlY3Rpb24gZnJvbSB0aGUgb2xkIHBvc2l0aW9uIHRvIHRoZSBuZXdQb3NpdGlvblxyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uUHJvcGVydHkuc2V0KCBCYWxsb29uTW9kZWwuZ2V0RGlyZWN0aW9uKCBwb3NpdGlvbiwgb2xkUG9zaXRpb24gKSApO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgd2hldGhlciBvciBub3QgdGhlIGJhbGxvb24gaXMgb24gdGhlIHN3ZWF0ZXJcclxuICAgICAgICBpZiAoIHRoaXMub25Td2VhdGVyKCkgIT09IHRoaXMub25Td2VhdGVyUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgICAgICB0aGlzLm9uU3dlYXRlclByb3BlcnR5LnNldCggdGhpcy5vblN3ZWF0ZXIoKSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHdoZXRoZXIgb3Igbm90IHdlIGFyZSB0b3VjaGluZyB0aGUgd2FsbC5cclxuICAgICAgICBpZiAoIHRoaXMudG91Y2hpbmdXYWxsKCkgIT09IHRoaXMudG91Y2hpbmdXYWxsUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgICAgICB0aGlzLnRvdWNoaW5nV2FsbFByb3BlcnR5LnNldCggdGhpcy50b3VjaGluZ1dhbGwoKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuaXNEcmFnZ2VkUHJvcGVydHkubGF6eUxpbmsoIGlzRHJhZ2dlZCA9PiB7XHJcblxyXG4gICAgICAvLyBXaGVuIHRoZSB1c2VyIHN0YXJ0cyBkcmFnZ2luZyBhIGJhbGxvb24sIHNldCBpdHMgbm9uLWRyYWdnaW5nIHZlbG9jaXR5IHRvIHplcm8uXHJcbiAgICAgIGlmICggaXNEcmFnZ2VkICkge1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHlQcm9wZXJ0eS5zZXQoIFZlY3RvcjIuWkVSTyApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBXaGVuIHRoZSBiYWxsb29uIGlzIHJlbGVhc2VkLCByZXNldCB0aGUgdGltZXIgdGhhdCBpbmRpY2F0ZXMgd2hlbiBpdCB3YXMgcmVsZWFzZWQuXHJcbiAgICAgIGlmICggIWlzRHJhZ2dlZCApIHtcclxuICAgICAgICB0aGlzLnRpbWVTaW5jZVJlbGVhc2UgPSAwO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIGJhbGxvb24gaXMgbmVhciB0aGUgd2FsbCB3aXRob3V0IHRvdWNoaW5nIGl0LCBhbmQgdGhlIHdhbGwgaXMgdmlzaWJsZS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgbmVhcldhbGwoKSB7XHJcbiAgICByZXR1cm4gUGxheUFyZWFNYXAuTEFORE1BUktfUkFOR0VTLkFUX05FQVJfV0FMTC5jb250YWlucyggdGhpcy5nZXRDZW50ZXIoKS54ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmUgaWYgdGhlIGJhbGxvb24gaXMgb24gdGhlIHN3ZWF0ZXIuICBUaGUgYmFsbG9vbiBpcyBjb25zaWRlcmVkIHRvIGJlIHJ1YmJpbmcgb24gdGhlIHN3ZWF0ZXJcclxuICAgKiBpZiBpdHMgY2VudGVyIGlzIGluIHRoZSBjaGFyZ2VkIGFyZWEuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIG9uU3dlYXRlcigpIHtcclxuICAgIGNvbnN0IHN3ZWF0ZXJCb3VuZHMgPSB0aGlzLmJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHlNb2RlbC5zd2VhdGVyLmJvdW5kcztcclxuICAgIHJldHVybiBzd2VhdGVyQm91bmRzLmludGVyc2VjdHNCb3VuZHMoIHRoaXMuYm91bmRzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBjZW50ZXIgb2YgdGhlIGJhbGxvb24gaXMgd2l0aGluIHRoZSBjaGFyZ2VkIGFyZWEgb2YgdGhlIHN3ZWF0ZXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGNlbnRlckluU3dlYXRlckNoYXJnZWRBcmVhKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eU1vZGVsLnN3ZWF0ZXIuY2hhcmdlZEFyZWEuY29udGFpbnNQb2ludCggdGhpcy5nZXRDZW50ZXIoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSWYgdGhlIGJhbGxvb24gaXMgbmVhciB0aGUgc3dlYXRlciwgcmV0dXJuIHRydWUuICBDb25zaWRlcmVkIG5lYXIgdGhlIHN3ZWF0ZXIgd2hlbiB0aGUgY2VudGVyIG9mIHRoZSBiYWxsb29uXHJcbiAgICogaXMgd2l0aGluIHRoZSBMQU5ETUFSS19SQU5HRVMuQVRfTkVBUl9TV0VBVEVSIHJhbmdlIG9mIHRoZSBQbGF5QXJlYU1hcC5cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbmVhclN3ZWF0ZXIoKSB7XHJcbiAgICByZXR1cm4gUGxheUFyZWFNYXAuTEFORE1BUktfUkFOR0VTLkFUX05FQVJfU1dFQVRFUi5jb250YWlucyggdGhpcy5nZXRDZW50ZXIoKS54ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgYmFsbG9vbiBpcyBuZWFyIHRoZSByaWdodCBlZGdlIG9mIHRoZSBwbGF5IGFyZWEgd2l0aG91dCB0b3VjaGluZyBpdFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIG5lYXJSaWdodEVkZ2UoKSB7XHJcbiAgICByZXR1cm4gUGxheUFyZWFNYXAuTEFORE1BUktfUkFOR0VTLkFUX05FQVJfUklHSFRfRURHRS5jb250YWlucyggdGhpcy5nZXRDZW50ZXJYKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIGJhbGxvb24gaXMgYXQgdGhlIHdhbGwgcG9zaXRpb24sIHJlZ2FyZGxlc3Mgb2ZcclxuICAgKiBiYWxsb29uIG9yIHdhbGwgdmlzaWJpbGl0eS4gIFVzZWZ1bCBmb3IgY2hlY2tpbmcgd2hldGhlciB0aGUgYmFsbG9vbiBpcyBhdCB0aGUgd2FsbCBwb3NpdGlvblxyXG4gICAqIHdoZW4gdGhlIHdhbGwgaXMgcmVtb3ZlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICByaWdodEF0V2FsbFBvc2l0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2VudGVyWCgpID09PSBQbGF5QXJlYU1hcC5YX1BPU0lUSU9OUy5BVF9XQUxMO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGlzIGJhbGxvb24gaXMgYXQgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIHBsYXkgYXJlYS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBhdFJpZ2h0RWRnZSgpIHtcclxuICAgIHJldHVybiB0aGlzLmdldENlbnRlclgoKSA9PT0gUGxheUFyZWFNYXAuWF9CT1VOREFSWV9QT1NJVElPTlMuQVRfV0FMTDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhpcyBiYWxsb29uIGlzIGF0IHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIHBsYXkgYXJlYS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGF0TGVmdEVkZ2UoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRDZW50ZXJYKCkgPT09IFBsYXlBcmVhTWFwLlhfQk9VTkRBUllfUE9TSVRJT05TLkFUX0xFRlRfRURHRTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhpcyBiYWxsb29uIGlzIGluIHRoZSBjZW50ZXIgb2YgdGhlIHBsYXkgYXJlYSBob3Jpem9udGFsbHkuIERvZXMgbm90IGNvbnNpZGVyIHZlcnRpY2FsXHJcbiAgICogcG9zaXRpb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaW5DZW50ZXJQbGF5QXJlYSgpIHtcclxuICAgIHJldHVybiBQbGF5QXJlYU1hcC5DT0xVTU5fUkFOR0VTLkNFTlRFUl9QTEFZX0FSRUEuY29udGFpbnMoIHRoaXMuZ2V0Q2VudGVyWCgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBiYWxsb29uIGlzIHZlcnkgY2xvc2UgdG8gYW4gb2JqZWN0IGluIHRoZSBwbGF5IGFyZWEuIFdpbGwgcmV0dXJuIHRydWUgaWYgdGhlIGNlbnRlclxyXG4gICAqIGlzIHdpdGhpbmcgb25lIG9mIHRoZSBcInZlcnkgY2xvc2VcIiByYW5nZXMgaW4gdGhlIHBsYXkgYXJlYS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHZlcnlDbG9zZVRvT2JqZWN0KCkge1xyXG4gICAgY29uc3QgY2VudGVyWCA9IHRoaXMuZ2V0Q2VudGVyWCgpO1xyXG4gICAgcmV0dXJuIFBsYXlBcmVhTWFwLkxBTkRNQVJLX1JBTkdFUy5BVF9WRVJZX0NMT1NFX1RPX1NXRUFURVIuY29udGFpbnMoIGNlbnRlclggKSB8fFxyXG4gICAgICAgICAgIFBsYXlBcmVhTWFwLkxBTkRNQVJLX1JBTkdFUy5BVF9WRVJZX0NMT1NFX1RPX1dBTEwuY29udGFpbnMoIGNlbnRlclggKSB8fFxyXG4gICAgICAgICAgIFBsYXlBcmVhTWFwLkxBTkRNQVJLX1JBTkdFUy5BVF9WRVJZX0NMT1NFX1RPX1JJR0hUX0VER0UuY29udGFpbnMoIGNlbnRlclggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgYmFsbG9vbiBpcyB0b3VjaGluZyB0aGUgd2FsbC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICB0b3VjaGluZ1dhbGwoKSB7XHJcbiAgICBjb25zdCBhdFdhbGwgPSB0aGlzLmdldENlbnRlclgoKSA9PT0gUGxheUFyZWFNYXAuWF9QT1NJVElPTlMuQVRfV0FMTDtcclxuICAgIGNvbnN0IHdhbGxWaXNpYmxlID0gdGhpcy5iYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5TW9kZWwud2FsbC5pc1Zpc2libGVQcm9wZXJ0eS5nZXQoKTtcclxuICAgIHJldHVybiAoIGF0V2FsbCAmJiB3YWxsVmlzaWJsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBiYWxsb29uIGlzIG1vdmluZyBob3Jpem9udGFsbHksIGxlZnQgb3IgcmlnaHQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ30gLSBcIkxFRlRcInxcIlJJR0hUXCJcclxuICAgKi9cclxuICBtb3ZpbmdIb3Jpem9udGFsbHkoKSB7XHJcbiAgICBjb25zdCBkaXJlY3Rpb24gPSB0aGlzLmRpcmVjdGlvblByb3BlcnR5LmdldCgpO1xyXG4gICAgcmV0dXJuIGRpcmVjdGlvbiA9PT0gQmFsbG9vbkRpcmVjdGlvbkVudW0uTEVGVCB8fCBkaXJlY3Rpb24gPT09IEJhbGxvb25EaXJlY3Rpb25FbnVtLlJJR0hUO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBiYWxsb29uIGlzIG1vdmluZ3YgdmVydGljYWxseSwgdXAgb3IgZG93blxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIFwiVVBcInxcIkRPV05cIlxyXG4gICAqL1xyXG4gIG1vdmluZ1ZlcnRpY2FsbHkoKSB7XHJcbiAgICBjb25zdCBkaXJlY3Rpb24gPSB0aGlzLmRpcmVjdGlvblByb3BlcnR5LmdldCgpO1xyXG4gICAgcmV0dXJuIGRpcmVjdGlvbiA9PT0gQmFsbG9vbkRpcmVjdGlvbkVudW0uVVAgfHwgZGlyZWN0aW9uID09PSBCYWxsb29uRGlyZWN0aW9uRW51bS5ET1dOO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBiYWxsb29uIGlzIG1vdmluZyBob3Jpem9udGFsbHksIGxlZnQgb3IgcmlnaHQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gXCJVUF9MRUZUXCJ8XCJVUF9SSUdIVFwifFwiRE9XTl9MRUZUXCJ8XCJET1dOX1JJR0hUXCJcclxuICAgKi9cclxuICBtb3ZpbmdEaWFnb25hbGx5KCkge1xyXG4gICAgY29uc3QgZGlyZWN0aW9uID0gdGhpcy5kaXJlY3Rpb25Qcm9wZXJ0eS5nZXQoKTtcclxuICAgIHJldHVybiBkaXJlY3Rpb24gPT09IEJhbGxvb25EaXJlY3Rpb25FbnVtLlVQX0xFRlQgfHxcclxuICAgICAgICAgICBkaXJlY3Rpb24gPT09IEJhbGxvb25EaXJlY3Rpb25FbnVtLlVQX1JJR0hUIHx8XHJcbiAgICAgICAgICAgZGlyZWN0aW9uID09PSBCYWxsb29uRGlyZWN0aW9uRW51bS5ET1dOX0xFRlQgfHxcclxuICAgICAgICAgICBkaXJlY3Rpb24gPT09IEJhbGxvb25EaXJlY3Rpb25FbnVtLkRPV05fUklHSFQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgd2hldGhlciBvciBub3QgdGhlIGJhbGxvb24gaXMgcyBtb3ZpbmcgdG8gdGhlIHJpZ2h0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIG1vdmluZ1JpZ2h0KCkge1xyXG4gICAgY29uc3QgZGlyZWN0aW9uID0gdGhpcy5kaXJlY3Rpb25Qcm9wZXJ0eS5nZXQoKTtcclxuICAgIHJldHVybiBkaXJlY3Rpb24gPT09IEJhbGxvb25EaXJlY3Rpb25FbnVtLlJJR0hUIHx8XHJcbiAgICAgICAgICAgZGlyZWN0aW9uID09PSBCYWxsb29uRGlyZWN0aW9uRW51bS5VUF9SSUdIVCB8fFxyXG4gICAgICAgICAgIGRpcmVjdGlvbiA9PT0gQmFsbG9vbkRpcmVjdGlvbkVudW0uRE9XTl9SSUdIVDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB3aGV0aGVyIG9yIG5vdCB0aGUgYmFsbG9vbiBpcyBtb3ZpbmcgdG8gdGhlIGxlZnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgbW92aW5nTGVmdCgpIHtcclxuICAgIGNvbnN0IGRpcmVjdGlvbiA9IHRoaXMuZGlyZWN0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICByZXR1cm4gZGlyZWN0aW9uID09PSBCYWxsb29uRGlyZWN0aW9uRW51bS5MRUZUIHx8XHJcbiAgICAgICAgICAgZGlyZWN0aW9uID09PSBCYWxsb29uRGlyZWN0aW9uRW51bS5VUF9MRUZUIHx8XHJcbiAgICAgICAgICAgZGlyZWN0aW9uID09PSBCYWxsb29uRGlyZWN0aW9uRW51bS5ET1dOX0xFRlQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgcHJvcG9ydGlvbiBvZiB0aGlzIGJhbGxvb24ncyBtb3ZlbWVudCB0aHJvdWdoIGEgcmVnaW9uIGluIHRoZSBwbGF5IGFyZWEsIGRlcGVuZGVudFxyXG4gICAqIG9uIHRoZSBkaXJlY3Rpb24gb2YgbW92ZW1lbnQuICBSZXR1cm5zIGEgbnVtYmVyIG91dCBvZiAxIChmdWxsIHJhbmdlIG9mIHRoZSByZWdpb24pLiAgSWYgbW92aW5nXHJcbiAgICogaG9yaXpvbnRhbGx5LCBwcm9ncmVzcyB3aWxsIGJlIHByb3BvcnRpb24gb2Ygd2lkdGguICBJZiBtb3ZpbmcgdmVydGljYWxseSwgcHJvZ3Jlc3Mgd2lsbCBiZVxyXG4gICAqIGEgcHJvcG9ydGlvbiBvZiB0aGUgaGVpZ2h0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0UHJvZ3Jlc3NUaHJvdWdoUmVnaW9uKCkge1xyXG5cclxuICAgIGxldCByYW5nZTtcclxuICAgIGxldCBkaWZmZXJlbmNlO1xyXG4gICAgaWYgKCB0aGlzLm1vdmluZ0hvcml6b250YWxseSgpIHx8IHRoaXMubW92aW5nRGlhZ29uYWxseSgpICkge1xyXG4gICAgICByYW5nZSA9IFBsYXlBcmVhTWFwLkNPTFVNTl9SQU5HRVNbIHRoaXMucGxheUFyZWFDb2x1bW5Qcm9wZXJ0eS5nZXQoKSBdO1xyXG4gICAgICBkaWZmZXJlbmNlID0gdGhpcy5nZXRDZW50ZXIoKS54IC0gcmFuZ2UubWluO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMubW92aW5nVmVydGljYWxseSgpICkge1xyXG4gICAgICByYW5nZSA9IFBsYXlBcmVhTWFwLlJPV19SQU5HRVNbIHRoaXMucGxheUFyZWFSb3dQcm9wZXJ0eS5nZXQoKSBdO1xyXG4gICAgICBkaWZmZXJlbmNlID0gdGhpcy5nZXRDZW50ZXIoKS55IC0gcmFuZ2UubWluO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGRldGVybWluZSBob3cgZmFyIHdlIGFyZSB0aHJvdWdoIHRoZSByZWdpb25cclxuICAgIGxldCBwcm9ncmVzcyA9IGRpZmZlcmVuY2UgLyByYW5nZS5nZXRMZW5ndGgoKTtcclxuXHJcbiAgICAvLyBwcm9ncmVzcyBpcyB0aGUgZGlmZmVyZW5jZSBvZiB0aGUgY2FsY3VsYXRlZCBwcm9wb3J0aW9uIGlmIG1vdmluZyB0byB0aGUgbGVmdCBvciB1cFxyXG4gICAgY29uc3QgZGlyZWN0aW9uID0gdGhpcy5kaXJlY3Rpb25Qcm9wZXJ0eS5nZXQoKTtcclxuICAgIGlmICggZGlyZWN0aW9uID09PSBCYWxsb29uRGlyZWN0aW9uRW51bS5MRUZUIHx8IGRpcmVjdGlvbiA9PT0gQmFsbG9vbkRpcmVjdGlvbkVudW0uVVAgKSB7XHJcbiAgICAgIHByb2dyZXNzID0gMSAtIHByb2dyZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBwcm9ncmVzcyA9PT0gJ251bWJlcicgJiYgcHJvZ3Jlc3MgPj0gMCwgJ25vIHByb2dyZXNzIHRocm91Z2ggcGxheSBhcmVhIHJlZ2lvbiB3YXMgZGV0ZXJtaW5lZC4nICk7XHJcbiAgICByZXR1cm4gcHJvZ3Jlc3M7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGNlbnRlciBwb3NpdGlvbiBvZiB0aGUgYmFsbG9vbi4gU2V0cyB0aGUgcG9zaXRpb24gUHJvcGVydHkgYnV0IHdpdGggYW4gb2Zmc2V0IHRvIGFjY291bnRcclxuICAgKiBmb3IgdGhlIGJhbGxvb24gZGltZW5zaW9ucy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGNlbnRlclxyXG4gICAqL1xyXG4gIHNldENlbnRlciggY2VudGVyICkge1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoXHJcbiAgICAgIGNlbnRlci54IC0gdGhpcy53aWR0aCAvIDIsXHJcbiAgICAgIGNlbnRlci55IC0gdGhpcy5oZWlnaHQgLyAyXHJcbiAgICApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGNlbnRlciBwb3NpdGlvbiBvZiB0aGUgYmFsbG9vbi5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICovXHJcbiAgZ2V0Q2VudGVyKCkge1xyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueCArIHRoaXMud2lkdGggLyAyLCB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueSArIHRoaXMuaGVpZ2h0IC8gMiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSB2ZXJ0aWNhbCBjZW50ZXIgb2YgdGhlIGJhbGxvb24gbW9kZWwuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRDZW50ZXJZKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55ICsgdGhpcy5oZWlnaHQgLyAyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBob3Jpem9udGFsIGNlbnRlciBwb3NpdGlvbiBvZiB0aGUgYmFsbG9vbi5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRDZW50ZXJYKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54ICsgdGhpcy53aWR0aCAvIDI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIGJhbGxvb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRSaWdodCgpIHtcclxuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueCArIHRoaXMud2lkdGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIG1vZGVsIHBvc2l0aW9uIG9mIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIGJhbGxvb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRMZWZ0KCkge1xyXG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQmFsbG9vbiBjaGFyZ2VzIGFyZW4ndCBldmVubHkgZGlzdHJpYnV0ZWQgdGhyb3VnaG91dCB0aGUgYmFsbG9vbiwgdGhleSBjb25mb3JtIHRvIHRoZSB1cHBlciBsZWZ0IGVkZ2Ugb2YgdGhlXHJcbiAgICogYmFsbG9vbiBpbWFnZSwgcGxhY2VkIGJ5IHZpc3VhbCBpbnNwZWN0aW9uLiAgVGhpcyByZXR1cm5zIGEgVmVjdG9yMiBwb2ludGluZyB0byB3aGF0IGlzIGFwcHJveGltYXRlbHkgdGhlIGNlbnRlclxyXG4gICAqIG9mIHRoZSBiYWxsb29uIGNoYXJnZXMuICBJbiB4LCB0aGlzIHJlbWFpbnMgdGhlIGNlbnRlciBvZiB0aGUgbW9kZWwgYm91bmRzLiAgSW4geSwgdGhpcyBpcyB0aGUgdG9wIG9mIHRoZVxyXG4gICAqIGJhbGxvb24gcGx1cyB0aGUgYXZlcmFnZSB5IHBvc2l0aW9uIG9mIHRoZSBjaGFyZ2VzLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIGdldENoYXJnZUNlbnRlcigpIHtcclxuICAgIGNvbnN0IGNlbnRlclggPSB0aGlzLmdldENlbnRlcigpLng7XHJcbiAgICBjb25zdCBjZW50ZXJZID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLnkgKyBBVkVSQUdFX0NIQVJHRV9ZO1xyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCBjZW50ZXJYLCBjZW50ZXJZICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBsZWZ0IHRvdWNoIHBvaW50IG9mIHRoZSBiYWxsb29uIGFnYWluc3QgdGhlIHN3ZWF0ZXIuIElmIHRoZSBiYWxsb29uIGNlbnRlciBpcyB0byB0aGVcclxuICAgKiByaWdodCBvZiB0aGUgc3dlYXRlciBlZGdlLCB1c2UgIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIGJhbGxvb24uIE90aGVyd2lzZSwgdXNlIHRoZSBiYWxsb29uIGNlbnRlci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKi9cclxuICBnZXRTd2VhdGVyVG91Y2hpbmdDZW50ZXIoKSB7XHJcbiAgICBjb25zdCBzd2VhdGVyID0gdGhpcy5iYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5TW9kZWwuc3dlYXRlcjtcclxuICAgIGNvbnN0IHN3ZWF0ZXJSaWdodCA9IHN3ZWF0ZXIueCArIHN3ZWF0ZXIud2lkdGg7XHJcblxyXG4gICAgbGV0IGNlbnRlclg7XHJcbiAgICBpZiAoIHRoaXMuZ2V0Q2VudGVyKCkueCA+IHN3ZWF0ZXJSaWdodCApIHtcclxuICAgICAgY2VudGVyWCA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNlbnRlclggPSB0aGlzLmdldENlbnRlcigpLng7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCBjZW50ZXJYLCB0aGlzLmdldENlbnRlclkoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGlzIGJhbGxvb24gaGFzIGFueSBjaGFyZ2UuIEp1c3QgYSBoZWxwZXIgZnVuY3Rpb24gZm9yIGNvbnZlbmllbmNlIGFuZCByZWFkYWJpbGl0eS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNDaGFyZ2VkKCkge1xyXG5cclxuICAgIC8vIHZhbHVlIHdpbGwgYmUgbmVnYXRpdmUgKGVsZWN0cm9ucylcclxuICAgIHJldHVybiB0aGlzLmNoYXJnZVByb3BlcnR5LmdldCgpIDwgMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGJhbGxvb24gaXMgYm90aCBpbmR1Y2luZyBjaGFyZ2UgYW5kIHZpc2libGUuIEhlbHBlciBmdW5jdGlvbiBmb3IgcmVhZGFiaWxpdHkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGluZHVjaW5nQ2hhcmdlQW5kVmlzaWJsZSgpIHtcclxuICAgIHJldHVybiB0aGlzLmlzVmlzaWJsZVByb3BlcnR5LmdldCgpICYmIHRoaXMuaW5kdWNpbmdDaGFyZ2VQcm9wZXJ0eS5nZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgdGhpcyBiYWxsb29uIGlzIGluZHVjaW5nIGNoYXJnZSBpbiB0aGUgd2FsbC4gRm9yIHRoZSBiYWxsb29uIHRvIGJlIGluZHVjaW5nIGNoYXJnZSBpbiB0aGUgd2FsbCwgdGhpc1xyXG4gICAqIGJhbGxvb24gbXVzdCBiZSB2aXNpYmxlLCB0aGUgd2FsbCBtdXN0IGJlIHZpc2libGUsIGFuZCB0aGUgZm9yY2UgYmV0d2VlbiB3YWxsIGFuZCBiYWxsb29uIG11c3QgYmUgbGFyZ2UgZW5vdWdoLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGluZHVjaW5nQ2hhcmdlKCB3YWxsVmlzaWJsZSApIHtcclxuXHJcbiAgICAvLyBpZiB0aGVyZSBpcyBubyBjaGFyZ2UgY2xvc2UgdG8gdGhlIGJhbGxvb24sIGltbWVkaWF0ZWx5IHJldHVybiBmYWxzZVxyXG4gICAgaWYgKCAhdGhpcy5jbG9zZXN0Q2hhcmdlSW5XYWxsICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gb3RoZXJ3aXNlLCB3YWxsIGFuZCBiYWxsb29uIG11c3QgYmUgdmlzaWJsZSwgYW5kIGZvcmNlIG11c3QgYmUgbGFyZ2UgZW5vdWdoXHJcbiAgICBjb25zdCBiYWxsb29uRm9yY2UgPSBCYWxsb29uTW9kZWwuZ2V0Rm9yY2VUb0Nsb3Nlc3RXYWxsQ2hhcmdlKCB0aGlzICk7XHJcbiAgICBjb25zdCBmb3JjZUxhcmdlRW5vdWdoID0gdGhpcy5iYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5TW9kZWwud2FsbC5mb3JjZUluZGljYXRlc0luZHVjZWRDaGFyZ2UoIGJhbGxvb25Gb3JjZSApO1xyXG4gICAgcmV0dXJuIHdhbGxWaXNpYmxlICYmIHRoaXMuaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCkgJiYgZm9yY2VMYXJnZUVub3VnaDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IGJhbGxvb25zIHRvIGluaXRpYWwgcG9zaXRpb24gYW5kIHVuY2hhcmdlZCBzdGF0ZS4gQnkgZGVmYXVsdCwgdGhpcyB3aWxsIGFsc28gcmVzZXQgdmlzaWJpbGl0eS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG5vdFJlc2V0VmlzaWJpbGl0eSAtIGlmIHRydWUsIHZpc2liaWxpdHkgd2lsbCBOT1QgYmUgcmVzZXRcclxuICAgKi9cclxuICByZXNldCggbm90UmVzZXRWaXNpYmlsaXR5ICkge1xyXG4gICAgdGhpcy54VmVsb2NpdHlBcnJheSA9IFsgMCwgMCwgMCwgMCwgMCBdO1xyXG4gICAgdGhpcy54VmVsb2NpdHlBcnJheS5jb3VudGVyID0gMDtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMueFZlbG9jaXR5QXJyYXkubGVuZ3RoID0gVkVMT0NJVFlfQVJSQVlfTEVOR1RILCAndmVsb2NpdHkgYXJyYXkgaW5jb3JyZWN0bHkgaW5pdGlhbGl6ZWQnICk7XHJcblxyXG4gICAgdGhpcy55VmVsb2NpdHlBcnJheSA9IFsgMCwgMCwgMCwgMCwgMCBdO1xyXG4gICAgdGhpcy55VmVsb2NpdHlBcnJheS5jb3VudGVyID0gMDtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMueVZlbG9jaXR5QXJyYXkubGVuZ3RoID0gVkVMT0NJVFlfQVJSQVlfTEVOR1RILCAndmVsb2NpdHkgYXJyYXkgaW5jb3JyZWN0bHkgaW5pdGlhbGl6ZWQnICk7XHJcblxyXG4gICAgdGhpcy5jaGFyZ2VQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZGlyZWN0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIGlmICggIW5vdFJlc2V0VmlzaWJpbGl0eSApIHtcclxuICAgICAgdGhpcy5pc1Zpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5pc0RyYWdnZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIHRoaXMuc3VjY2Vzc2Z1bFBpY2tVcCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIGJyb2FkY2FzdCBhIG1lc3NhZ2Ugd2hlbiB3ZSBhcmUgcmVzZXRcclxuICAgIHRoaXMucmVzZXRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIHRoZSBCYWxsb29uTW9kZWwuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCQVNFTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0U2Vjb25kcyBlbGFwc2VkIHRpbWUgaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHN0ZXAoIG1vZGVsLCBkdFNlY29uZHMgKSB7XHJcblxyXG4gICAgLy8gc2Vjb25kcyB0byBtaWxsaXNlY29uZHMgLSByZWFsbHksIHRoZSBtb2RlbCBpcyBmYWlybHkgJ3VuaXRsZXNzJyBidXQgbXVsdGlwbHlpbmcgdGhlXHJcbiAgICAvLyB0aW1lIHN0ZXAgYnkgMTAwMCBtYWtlcyB0aGUgc2ltIGxvb2sgYW5kIGZlZWwgbGlrZSB0aGUgSmF2YSB2ZXJzaW9uXHJcbiAgICBsZXQgZHQgPSBkdFNlY29uZHMgKiAxMDAwO1xyXG5cclxuICAgIC8vIGxpbWl0IGxhcmdlIHZhbHVlcyBvZiBkdCAtIHRoZXkgcHJvYmFibHkgbWVhbiB0aGF0IHRoZSBzaW0ganVzdCByZWdhaW5lZCBmb2N1c1xyXG4gICAgaWYgKCBkdCA+IDUwMCApIHtcclxuICAgICAgZHQgPSAxIC8gNjAgKiAxMDAwOyAvLyBub21pbmFsIHRpbWUgc3RhbXAgYXQgNjAgZnBzXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLmlzRHJhZ2dlZFByb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgLy8gZHJhZyB0aGUgYmFsbG9vbiwgd2hpY2ggbWF5IGNhdXNlIGl0IHRvIHBpY2sgdXAgY2hhcmdlc1xyXG4gICAgICB0aGlzLmRyYWdCYWxsb29uKCBtb2RlbCwgZHQgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLmFwcGx5Rm9yY2UoIGR0ICk7XHJcblxyXG4gICAgICAvLyBpbmNyZW1lbnQgdGhlIHRpbWUgc2luY2UgcmVsZWFzZVxyXG4gICAgICB0aGlzLnRpbWVTaW5jZVJlbGVhc2UgKz0gZHQ7XHJcbiAgICB9XHJcbiAgICB0aGlzLm9sZFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLmNvcHkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZW4gYmFsbG9vbiBpcyBkcmFnZ2VkLCBjaGVjayB0byBzZWUgaWYgd2UgY2F0Y2ggYSBtaW51cyBjaGFyZ2UuICBSZXR1cm5zIGEgYm9vbGVhblxyXG4gICAqIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgb3Igbm90IGEgY2hhcmdlIHdhcyBwaWNrZWQgdXAuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtICB7QkFTRU1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSAge251bWJlcn0gZHRcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gY2hhcmdlRm91bmRcclxuICAgKi9cclxuICBkcmFnQmFsbG9vbiggbW9kZWwsIGR0ICkge1xyXG5cclxuICAgIC8vIFByZXZlbnQgYSBmdXp6ZXIgZXJyb3IgdGhhdCB0cmllcyB0byBkcmFnIHRoZSBiYWxsb29uIGJlZm9yZSBzdGVwIGlzIGNhbGxlZC5cclxuICAgIGlmICggIXRoaXMub2xkUG9zaXRpb24gKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGNvbnN0IHZ4ID0gKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueCAtIHRoaXMub2xkUG9zaXRpb24ueCApIC8gZHQ7XHJcbiAgICBjb25zdCB2eSA9ICggdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLnkgLSB0aGlzLm9sZFBvc2l0aW9uLnkgKSAvIGR0O1xyXG5cclxuICAgIC8vIGNhbGN1bGF0ZSBhdmVyYWdlIHZlbG9jaXR5XHJcbiAgICB0aGlzLnhWZWxvY2l0eUFycmF5WyB0aGlzLnhWZWxvY2l0eUFycmF5LmNvdW50ZXIrKyBdID0gdnggKiB2eDtcclxuICAgIHRoaXMueFZlbG9jaXR5QXJyYXkuY291bnRlciAlPSBWRUxPQ0lUWV9BUlJBWV9MRU5HVEg7XHJcbiAgICB0aGlzLnlWZWxvY2l0eUFycmF5WyB0aGlzLnlWZWxvY2l0eUFycmF5LmNvdW50ZXIrKyBdID0gdnkgKiB2eTtcclxuICAgIHRoaXMueVZlbG9jaXR5QXJyYXkuY291bnRlciAlPSBWRUxPQ0lUWV9BUlJBWV9MRU5HVEg7XHJcblxyXG4gICAgbGV0IGF2ZXJhZ2VYID0gMDtcclxuICAgIGxldCBhdmVyYWdlWSA9IDA7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBWRUxPQ0lUWV9BUlJBWV9MRU5HVEg7IGkrKyApIHtcclxuICAgICAgYXZlcmFnZVggKz0gdGhpcy54VmVsb2NpdHlBcnJheVsgaSBdO1xyXG4gICAgICBhdmVyYWdlWSArPSB0aGlzLnlWZWxvY2l0eUFycmF5WyBpIF07XHJcbiAgICB9XHJcbiAgICBhdmVyYWdlWCAvPSBWRUxPQ0lUWV9BUlJBWV9MRU5HVEg7XHJcbiAgICBhdmVyYWdlWSAvPSBWRUxPQ0lUWV9BUlJBWV9MRU5HVEg7XHJcblxyXG4gICAgLy8gaWYgYXZlcmFnZSBzcGVlZCBsYXJnZXIgdGhhbiB0aHJlc2hvbGQgc3BlZWQgd2UgdHJ5IHRvIG1vdmUgbWludXMgY2hhcmdlcyBmcm9tIHN3ZWF0ZXIgdG8gYmFsbG9vblxyXG4gICAgY29uc3Qgc3BlZWQgPSBNYXRoLnNxcnQoIGF2ZXJhZ2VYICogYXZlcmFnZVggKyBhdmVyYWdlWSAqIGF2ZXJhZ2VZICk7XHJcblxyXG4gICAgdGhpcy5kcmFnVmVsb2NpdHlQcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCB2eCwgdnkgKSApO1xyXG5cclxuICAgIGxldCBjaGFyZ2VGb3VuZCA9IGZhbHNlO1xyXG4gICAgaWYgKCBzcGVlZCA+IDAgKSB7XHJcbiAgICAgIGNoYXJnZUZvdW5kID0gbW9kZWwuc3dlYXRlci5jaGVja0FuZFRyYW5zZmVyQ2hhcmdlcyggdGhpcyApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjaGFyZ2VGb3VuZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgZm9yY2UgYmV0d2VlbiB0aGlzIGJhbGxvb24gYW5kIHRoZSBzd2VhdGVyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSAge1N3ZWF0ZXJNb2RlbH0gc3dlYXRlck1vZGVsXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICovXHJcbiAgZ2V0U3dlYXRlckZvcmNlKCBzd2VhdGVyTW9kZWwgKSB7XHJcbiAgICByZXR1cm4gQmFsbG9vbk1vZGVsLmdldEZvcmNlKFxyXG4gICAgICBzd2VhdGVyTW9kZWwuY2VudGVyLFxyXG4gICAgICB0aGlzLmdldENlbnRlcigpLFxyXG4gICAgICAtQmFsbG9vbk1vZGVsLkZPUkNFX0NPTlNUQU5UICogc3dlYXRlck1vZGVsLmNoYXJnZVByb3BlcnR5LmdldCgpICogdGhpcy5jaGFyZ2VQcm9wZXJ0eS5nZXQoKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGJhbGxvb24gaXMgdG91Y2hpbmcgdGhlIGJvdW5kYXJ5IG9mIHRoZSBwbGF5IGFyZWEsIGluY2x1ZGluZyB0aGUgYm90dG9tLCBsZWZ0XHJcbiAgICogYW5kIHRvcCBlZGdlcywgb3IgdGhlIHJpZ2h0IGVkZ2Ugb3Igd2FsbCBkZXBlbmRpbmcgb24gd2FsbCB2aXNpYmlsaXR5LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgaXNUb3VjaGluZ0JvdW5kYXJ5KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNUb3VjaGluZ1JpZ2h0Qm91bmRhcnkoKSB8fCB0aGlzLmlzVG91Y2hpbmdMZWZ0Qm91bmRhcnkoKSB8fFxyXG4gICAgICAgICAgIHRoaXMuaXNUb3VjaGluZ0JvdHRvbUJvdW5kYXJ5KCkgfHwgdGhpcy5pc1RvdWNoaW5nVG9wQm91bmRhcnkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGJhbGxvb24gaXMgdG91Y2hpbmcgdGhlIHJpZ2h0IGJvdW5kYXJ5IG9mIHRoZSBwbGF5IGFyZWEuICBJZiB0aGUgd2FsbFxyXG4gICAqIGlzIHZpc2libGUsIHRoaXMgd2lsbCBiZSB0aGUgcG9zaXRpb24gd2hlcmUgdGhlIGJhbGxvb24gaXMgdG91Y2hpbmcgdGhlIHdhbGwsIG90aGVyd2lzZSBpdCB3aWxsXHJcbiAgICogYmUgdGhlIHBvc2l0aW9uIHdoZXJlIHRoZSBiYWxsb29uIGlzIHRvdWNoaW5nIHRoZSByaWdodCBlZGdlIG9mIHRoZSBwbGF5IGFyZWEuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNUb3VjaGluZ1JpZ2h0Qm91bmRhcnkoKSB7XHJcbiAgICBjb25zdCBiYWxsb29uWCA9IHRoaXMuZ2V0Q2VudGVyKCkueDtcclxuICAgIGlmICggdGhpcy5iYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5TW9kZWwud2FsbC5pc1Zpc2libGVQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgcmV0dXJuIFBsYXlBcmVhTWFwLlhfUE9TSVRJT05TLkFUX1dBTEwgPT09IGJhbGxvb25YO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBQbGF5QXJlYU1hcC5YX0JPVU5EQVJZX1BPU0lUSU9OUy5BVF9SSUdIVF9FREdFID09PSBiYWxsb29uWDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGJhbGxvb24gaXMgdG91Y2hpbmcgdGhlIHJpZ2h0IG1vc3QgZWRnZSBvZiB0aGUgcGxheSBhcmVhIChzaG91bGQgYmUgaW1wb3NzaWJsZVxyXG4gICAqIGlmIHRoZSB3YWxsIGlzIGludmlzaWJsZSlcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc1RvdWNoaW5nUmlnaHRFZGdlKCkge1xyXG4gICAgY29uc3QgYmFsbG9vblggPSB0aGlzLmdldENlbnRlclgoKTtcclxuICAgIHJldHVybiBQbGF5QXJlYU1hcC5YX0JPVU5EQVJZX1BPU0lUSU9OUy5BVF9SSUdIVF9FREdFID09PSBiYWxsb29uWDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGJhbGxvb24gaXMgdG91Y2hpbmcgdGhlIGJvdHRvbSBib3VuZGFyeSBvZiB0aGUgcGxheSBhcmVhLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzVG91Y2hpbmdCb3R0b21Cb3VuZGFyeSgpIHtcclxuICAgIHJldHVybiBQbGF5QXJlYU1hcC5ZX0JPVU5EQVJZX1BPU0lUSU9OUy5BVF9CT1RUT00gPT09IHRoaXMuZ2V0Q2VudGVyWSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzVG91Y2hpbmdMZWZ0Qm91bmRhcnkoKSB7XHJcbiAgICByZXR1cm4gUGxheUFyZWFNYXAuWF9CT1VOREFSWV9QT1NJVElPTlMuQVRfTEVGVF9FREdFID09PSB0aGlzLmdldENlbnRlclgoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGJhbGxvb24gaXMgdG91Y2hpbmcgdGhlIHRvcCBib3VuZGFyeSBvZiB0aGUgcGxheSBhcmVhLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzVG91Y2hpbmdUb3BCb3VuZGFyeSgpIHtcclxuICAgIHJldHVybiBQbGF5QXJlYU1hcC5ZX0JPVU5EQVJZX1BPU0lUSU9OUy5BVF9UT1AgPT09IHRoaXMuZ2V0Q2VudGVyWSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXBwbHkgYSBmb3JjZSBvbiB0aGlzIGJhbGxvb24sIGFuZCBtb3ZlIGl0IHRvIG5ldyBjb29yZGluYXRlcy4gIEFsc28gdXBkYXRlcyB0aGUgdmVsb2NpdHkuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSAge251bWJlcn0gZHQgLSBpbiBzZWNvbmRzXHJcbiAgICovXHJcbiAgYXBwbHlGb3JjZSggZHQgKSB7XHJcblxyXG4gICAgLy8gb25seSBtb3ZlIGlmIHRoaXMgYmFsbG9vbiBpcyBub3Qgb3ZlciB0aGUgc3dlYXRlclxyXG4gICAgY29uc3QgbW9kZWwgPSB0aGlzLmJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHlNb2RlbDtcclxuICAgIGlmICggIXRoaXMuY2VudGVySW5Td2VhdGVyQ2hhcmdlZEFyZWEoKSApIHtcclxuXHJcbiAgICAgIGNvbnN0IHJpZ2h0Qm91bmQgPSBtb2RlbC5wbGF5QXJlYUJvdW5kcy5tYXhYO1xyXG4gICAgICBjb25zdCBmb3JjZSA9IHRoaXMuZ2V0VG90YWxGb3JjZSgpO1xyXG4gICAgICBjb25zdCBuZXdWZWxvY2l0eSA9IHRoaXMudmVsb2NpdHlQcm9wZXJ0eS5nZXQoKS5wbHVzKCBmb3JjZS50aW1lc1NjYWxhciggZHQgKSApO1xyXG4gICAgICBjb25zdCBuZXdQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5wbHVzKCB0aGlzLnZlbG9jaXR5UHJvcGVydHkuZ2V0KCkudGltZXNTY2FsYXIoIGR0ICkgKTtcclxuXHJcbiAgICAgIGlmICggbmV3UG9zaXRpb24ueCArIHRoaXMud2lkdGggPj0gcmlnaHRCb3VuZCApIHtcclxuXHJcbiAgICAgICAgLy8gdHJ5aW5nIHRvIGdvIGJleW9uZCByaWdodCBib3VuZFxyXG4gICAgICAgIG5ld1Bvc2l0aW9uLnggPSByaWdodEJvdW5kIC0gdGhpcy53aWR0aDtcclxuXHJcbiAgICAgICAgaWYgKCBuZXdWZWxvY2l0eS54ID4gMCApIHtcclxuICAgICAgICAgIG5ld1ZlbG9jaXR5LnggPSAwO1xyXG5cclxuICAgICAgICAgIC8vIElmIHRoaXMgYmFsbG9vbiBpcyBwdXNoaW5nIHVwIGFnYWluc3QgdGhlIHdhbGwgYW5kIGl0IGlzIGJlaW5nIHN0b3BwZWQgZnJvbSBtb3ZpbmcgaW4gdGhlIFggZGlyZWN0aW9uIGFzIGFcclxuICAgICAgICAgIC8vIHJlc3VsdCwgc3RvcCBpdCBmcm9tIG1vdmluZyBpbiB0aGUgWSBkaXJlY3Rpb24gdG9vLiAgVGhpcyBpcyByZWFsaXN0aWMsIHNpbmNlIHRoZXJlIHdvdWxkIGxpa2VseSBiZSBhIGZhaXJcclxuICAgICAgICAgIC8vIGFtb3VudCBvZiBmcmljdGlvbiBhdCB0aGUgYmFsbG9vbi93YWxsIGludGVyZmFjZSwgYW5kIGhlbHBzIHRvIHByZXZlbnQgc29tZSBvZGQgYmVoYXZpb3JzLCBzZWVcclxuICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iYWxsb29ucy1hbmQtc3RhdGljLWVsZWN0cmljaXR5L2lzc3Vlcy81NDQuXHJcbiAgICAgICAgICBpZiAoIHRoaXMudG91Y2hpbmdXYWxsUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICAgIG5ld1ZlbG9jaXR5LnkgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoIG5ld1Bvc2l0aW9uLnkgKyB0aGlzLmhlaWdodCA+PSBtb2RlbC5wbGF5QXJlYUJvdW5kcy5tYXhZICkge1xyXG5cclxuICAgICAgICAvLyB0cnlpbmcgdG8gZ28gYmV5b25kIGJvdHRvbSBib3VuZFxyXG4gICAgICAgIG5ld1Bvc2l0aW9uLnkgPSBtb2RlbC5wbGF5QXJlYUJvdW5kcy5tYXhZIC0gdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgbmV3VmVsb2NpdHkueSA9IG5ld1ZlbG9jaXR5LnkgPiAwID8gMCA6IG5ld1ZlbG9jaXR5Lnk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBuZXdQb3NpdGlvbi54IDw9IG1vZGVsLnBsYXlBcmVhQm91bmRzLm1pblggKSB7XHJcblxyXG4gICAgICAgIC8vIHRyeWluZyB0byBnbyAgYmV5b25kIGxlZnQgYm91bmRcclxuICAgICAgICBuZXdQb3NpdGlvbi54ID0gbW9kZWwucGxheUFyZWFCb3VuZHMubWluWDtcclxuICAgICAgICBuZXdWZWxvY2l0eS54ID0gbmV3VmVsb2NpdHkueCA8IDAgPyAwIDogbmV3VmVsb2NpdHkueDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIG5ld1Bvc2l0aW9uLnkgPD0gbW9kZWwucGxheUFyZWFCb3VuZHMubWluWSApIHtcclxuICAgICAgICBuZXdQb3NpdGlvbi55ID0gbW9kZWwucGxheUFyZWFCb3VuZHMubWluWTtcclxuICAgICAgICBuZXdWZWxvY2l0eS55ID0gbmV3VmVsb2NpdHkueSA8IDAgPyAwIDogbmV3VmVsb2NpdHkueTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdXBkYXRlIHBvc2l0aW9uIGJlZm9yZSB2ZWxvY2l0eSBzbyB0aGF0IGxpc3RlbmVycyBhc3NvY2lhdGVkIHdpdGggdmVsb2NpdHkgY2FuIHJlZmVyZW5jZSB0aGUgY29ycmVjdFxyXG4gICAgICAvLyBwb3NpdGlvbiBvbiB1cGRhdGVkIHZlbG9jaXR5XHJcbiAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG5ld1Bvc2l0aW9uICk7XHJcbiAgICAgIHRoaXMudmVsb2NpdHlQcm9wZXJ0eS5zZXQoIG5ld1ZlbG9jaXR5ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5LnNldCggVmVjdG9yMi5aRVJPICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHRvdGFsIGZvcmNlIG9uIHRoaXMgYmFsbG9vbi4gIFRoZSBiYWxsb29uIHdpbGwgZmVlbCBmb3JjZXMgZnJvbSBhbGwgb2JqZWN0cyBpbiB0aGUgcGxheSBhcmVhLCBpbmNsdWRpbmdcclxuICAgKiB0aGUgc3dlYXRlciwgdGhlIHdhbGwsIGFuZCB0aGUgb3RoZXIgYmFsbG9vbiBpZiBpdCBpcyB2aXNpYmxlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICovXHJcbiAgZ2V0VG90YWxGb3JjZSgpIHtcclxuICAgIGNvbnN0IG1vZGVsID0gdGhpcy5iYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5TW9kZWw7XHJcbiAgICBpZiAoIG1vZGVsLndhbGwuaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIGNvbnN0IGRpc3RGcm9tV2FsbCA9IG1vZGVsLndhbGwueCAtIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54O1xyXG5cclxuICAgICAgLy8gaWYgdGhlIGJhbGxvb24gaGFzIGVub3VnaCBjaGFyZ2UgYW5kIGlzIGNsb3NlIGVub3VnaCB0byB0aGUgd2FsbCwgdGhlIHdhbGwgYXR0cmFjdHMgaXQgbW9yZSB0aGFuIHRoZSBzd2VhdGVyXHJcbiAgICAgIGlmICggdGhpcy5jaGFyZ2VQcm9wZXJ0eS5nZXQoKSA8IC01ICkge1xyXG4gICAgICAgIGNvbnN0IHJlbERpc3QgPSBkaXN0RnJvbVdhbGwgLSB0aGlzLndpZHRoO1xyXG4gICAgICAgIGNvbnN0IGZyaWdodCA9IDAuMDAzO1xyXG4gICAgICAgIGlmICggcmVsRGlzdCA8PSA0MCArIHRoaXMuY2hhcmdlUHJvcGVydHkuZ2V0KCkgLyA4ICkge1xyXG4gICAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IyKCAtZnJpZ2h0ICogdGhpcy5jaGFyZ2VQcm9wZXJ0eS5nZXQoKSAvIDIwLjAsIDAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBmb3JjZSA9IHRoaXMuZ2V0U3dlYXRlckZvcmNlKCBtb2RlbC5zd2VhdGVyICk7XHJcbiAgICBjb25zdCBvdGhlciA9IHRoaXMuZ2V0T3RoZXJCYWxsb29uRm9yY2UoKTtcclxuICAgIGNvbnN0IHN1bU9mRm9yY2VzID0gZm9yY2UucGx1cyggb3RoZXIgKTtcclxuXHJcbiAgICAvLyBEb24ndCBhbGxvdyB0aGUgZm9yY2UgdG8gYmUgdG9vIGhpZ2ggb3IgdGhlIGJhbGxvb24gY2FuIGp1bXAgYWNyb3NzIHRoZSBzY3JlZW4gaW4gMSBzdGVwLCBzZWUgIzY3XHJcbiAgICBjb25zdCBtYWcgPSBzdW1PZkZvcmNlcy5tYWduaXR1ZGU7XHJcbiAgICBjb25zdCBtYXggPSAxRS0yO1xyXG4gICAgaWYgKCBtYWcgPiBtYXggKSB7XHJcbiAgICAgIHN1bU9mRm9yY2VzLm5vcm1hbGl6ZSgpO1xyXG4gICAgICBzdW1PZkZvcmNlcy5tdWx0aXBseVNjYWxhciggbWF4ICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3VtT2ZGb3JjZXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGZvcmNlIG9uIHRoaXMgYmFsbG9vbiBtb2RlbCBmcm9tIGFub3RoZXIgYmFsbG9vbiBtb2RlbC4gSWYgdGhlIG90aGVyIGJhbGxvb24gaXMgYmVpbmcgZHJhZ2dlZCwgb3IgaXNcclxuICAgKiBpbnZpc2libGUsIHplcm8gaXMgcmV0dXJuZWQuIFNlZSBnZXRGb3JjZSgpIGZvciB0aGUgYWN0dWFsIGZvcmNlIGNhbGN1bGF0aW9uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICovXHJcbiAgZ2V0T3RoZXJCYWxsb29uRm9yY2UoKSB7XHJcbiAgICBpZiAoIHRoaXMuaXNEcmFnZ2VkUHJvcGVydHkuZ2V0KCkgfHwgIXRoaXMuaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCkgfHwgIXRoaXMub3RoZXIuaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIHJldHVybiBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgfVxyXG4gICAgY29uc3Qga3FxID0gQmFsbG9vbk1vZGVsLkZPUkNFX0NPTlNUQU5UICogdGhpcy5jaGFyZ2VQcm9wZXJ0eS5nZXQoKSAqIHRoaXMub3RoZXIuY2hhcmdlUHJvcGVydHkuZ2V0KCk7XHJcbiAgICByZXR1cm4gQmFsbG9vbk1vZGVsLmdldEZvcmNlKCB0aGlzLmdldENlbnRlcigpLCB0aGlzLm90aGVyLmdldENlbnRlcigpLCBrcXEgKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBDYWxjdWxhdGUgdGhlIGZvcmNlIGJldHdlZW4gdG8gY2hhcmdlZCBvYmplY3RzIHVzaW5nIENvdWxvbWIncyBsYXcuICBUaGlzIGFsbG93cyB0aGUgY2xpZW50IHRvIHByb3ZpZGUgYVxyXG4gICAqIGRpZmZlcmVudCB2YWx1ZSBmb3IgdGhlIGV4cG9uZW50IHVzZWQgb24gdGhlIHJhZGl1cywgd2hpY2ggY2FuIGJlIHVzZWQgdG8gdHdlYWsgdGhlIHZpc3VhbCBwZXJmb3JtYW5jZSBvZiB0aGVcclxuICAgKiBzaW11bGF0aW9uLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBzdGF0aWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSAge1ZlY3RvcjJ9IHAxIC0gcG9zaXRpb24gb2YgdGhlIGZpcnN0IG9iamVjdFxyXG4gICAqIEBwYXJhbSAge1ZlY3RvcjJ9IHAyIC0gcG9zaXRpb24gb2YgdGhlIHNlY29uZCBvYmplY3RcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGtxcSAtIHNvbWUgY29uc3RhbnQgdGltZXMgdGhlIHR3byBjaGFyZ2VzXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBbcG93ZXJdIC0gb3B0aW9uYWwsIGRlZmF1bHQgb2YgMiwgYnV0IDEgaXMgYWRkZWQgc28gdGhlIGFjY2VsZXJhdGlvbiBpcyBleGFnZ2VyYXRlZFxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRGb3JjZSggcDEsIHAyLCBrcXEsIHBvd2VyICkge1xyXG5cclxuICAgIC8vIHBvd2VyIGRlZmF1bHRzIHRvIDJcclxuICAgIHBvd2VyID0gcG93ZXIgfHwgMjtcclxuXHJcbiAgICAvLyBjYWxjdWxhdGUgYSB2ZWN0b3IgZnJvbSBvbmUgcG9pbnQgdG8gdGhlIG90aGVyXHJcbiAgICBjb25zdCBkaWZmZXJlbmNlID0gcDEubWludXMoIHAyICk7XHJcbiAgICBjb25zdCByID0gZGlmZmVyZW5jZS5tYWduaXR1ZGU7XHJcblxyXG4gICAgLy8gaWYgdGhlIHBvaW50cyBhcmUgcmlnaHQgb24gdG9wIG9mIG9uZSBhbm90aGVyLCByZXR1cm4gYW4gYXR0cmFjdGlvbiB2YWx1ZSBvZiB6ZXJvXHJcbiAgICBpZiAoIHIgPT09IDAgKSB7XHJcbiAgICAgIHJldHVybiBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1ha2UgdGhpcyBhIHVuaXQgdmVjdG9yXHJcbiAgICBkaWZmZXJlbmNlLnNldE1hZ25pdHVkZSggMSApO1xyXG5cclxuICAgIC8vIHNjYWxlIGJ5IHRoZSBmb3JjZSB2YWx1ZVxyXG4gICAgcmV0dXJuIGRpZmZlcmVuY2UudGltZXNTY2FsYXIoIGtxcSAvICggTWF0aC5wb3coIHIsIHBvd2VyICkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBmb3JjZSBvbiBhIGJhbGxvb24gZnJvbSB0aGUgY2xvc2VzdCBjaGFyZ2UgdG8gdGhlIGJhbGxvb24gaW4gdGhlIHdhbGwuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCYWxsb29uTW9kZWx9IGJhbGxvb25cclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKi9cclxuICBzdGF0aWMgZ2V0Rm9yY2VUb0Nsb3Nlc3RXYWxsQ2hhcmdlKCBiYWxsb29uICkge1xyXG4gICAgcmV0dXJuIEJhbGxvb25Nb2RlbC5nZXRGb3JjZShcclxuICAgICAgYmFsbG9vbi5jbG9zZXN0Q2hhcmdlSW5XYWxsLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgIGJhbGxvb24uZ2V0Q2VudGVyKCksXHJcbiAgICAgIEJBU0VDb25zdGFudHMuQ09VTE9NQlNfTEFXX0NPTlNUQU5UICogYmFsbG9vbi5jaGFyZ2VQcm9wZXJ0eS5nZXQoKSAqIFBvaW50Q2hhcmdlTW9kZWwuQ0hBUkdFLFxyXG4gICAgICAyLjM1XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBkaXJlY3Rpb24gb2YgbW92ZW1lbnQgdGhhdCB3b3VsZCB0YWtlIHlvdSBmcm9tIHBvaW50IEEgdG8gcG9pbnQgQiwgcmV0dXJuaW5nIG9uZSBvZiBCYWxsb29uRGlyZWN0aW9uRW51bSxcclxuICAgKiBMRUZULCBSSUdIVCwgIFVQLCBET1dOLCAgVVBfTEVGVCwgVVBfUklHSFQsIERPV05fTEVGVCwgRE9XTl9SSUdIVC4gVXNlcyBNYXRoLmF0YW4yLCBzbyB0aGUgYW5nbGUgaXMgbWFwcGVkIGZyb21cclxuICAgKiAwIHRvICsvLSBNYXRoLlBJLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSAge1ZlY3RvcjJ9IHBvaW50QVxyXG4gICAqIEBwYXJhbSAge1ZlY3RvcjJ9IHBvaW50QlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gb25lIG9mIEJhbGxvb25EaXJlY3Rpb25FbnVtXHJcbiAgICogQHN0YXRpY1xyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXREaXJlY3Rpb24oIHBvaW50QSwgcG9pbnRCICkge1xyXG4gICAgbGV0IGRpcmVjdGlvbjtcclxuXHJcbiAgICBjb25zdCBkeCA9IHBvaW50QS54IC0gcG9pbnRCLng7XHJcbiAgICBjb25zdCBkeSA9IHBvaW50QS55IC0gcG9pbnRCLnk7XHJcbiAgICBjb25zdCBhbmdsZSA9IE1hdGguYXRhbjIoIGR5LCBkeCApO1xyXG5cclxuICAgIC8vIGF0YW4yIHdyYXBzIGFyb3VuZCBNYXRoLlBJLCBzbyBzcGVjaWFsIGNoZWNrIGZvciBtb3ZpbmcgbGVmdCBmcm9tIGFic29sdXRlIHZhbHVlXHJcbiAgICBpZiAoIERJUkVDVElPTl9NQVAuTEVGVC5jb250YWlucyggTWF0aC5hYnMoIGFuZ2xlICkgKSApIHtcclxuICAgICAgZGlyZWN0aW9uID0gQmFsbG9vbkRpcmVjdGlvbkVudW0uTEVGVDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBvdGhlcndpc2UsIGFuZ2xlIHdpbGwgYmUgaW4gb25lIG9mIHRoZSByYW5nZXMgaW4gRElSRUNUSU9OX01BUFxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgRElSRUNUSU9OX01BUF9LRVlTLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBlbnRyeSA9IERJUkVDVElPTl9NQVBbIERJUkVDVElPTl9NQVBfS0VZU1sgaSBdIF07XHJcbiAgICAgIGlmICggZW50cnkuY29udGFpbnMoIGFuZ2xlICkgKSB7XHJcbiAgICAgICAgZGlyZWN0aW9uID0gQmFsbG9vbkRpcmVjdGlvbkVudW1bIERJUkVDVElPTl9NQVBfS0VZU1sgaSBdIF07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGlyZWN0aW9uO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQHN0YXRpYyAtIHZhbHVlIGZvciBDb3Vsb21iJ3MgY29uc3RhbnQgdXNlZCBpbiB0aGUgY2FsY3VsYXRpb25zIGJ1dCBOT1QgVEhFIEFDVFVBTCBWQUxVRS4gIEl0IGhhcyBiZWVuIHR3ZWFrZWQgaW5cclxuLy8gb3JkZXIgdG8gZ2V0IHRoZSB2aXN1YWwgYmVoYXZpb3IgdGhhdCB3ZSBuZWVkIGluIHRoZSBzaW0uXHJcbkJhbGxvb25Nb2RlbC5GT1JDRV9DT05TVEFOVCA9IDAuMDU7XHJcbkJhbGxvb25Nb2RlbC5CQUxMT09OX1dJRFRIID0gQkFMTE9PTl9XSURUSDtcclxuXHJcbmJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkucmVnaXN0ZXIoICdCYWxsb29uTW9kZWwnLCBCYWxsb29uTW9kZWwgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJhbGxvb25Nb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsT0FBTyxNQUFNLGdDQUFnQztBQUNwRCxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLFVBQVUsTUFBTSwyQ0FBMkM7QUFDbEUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyw0QkFBNEIsTUFBTSx1Q0FBdUM7QUFDaEYsT0FBT0MsYUFBYSxNQUFNLHFCQUFxQjtBQUMvQyxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFDNUQsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjtBQUMxQyxPQUFPQyxnQkFBZ0IsTUFBTSx1QkFBdUI7O0FBRXBEO0FBQ0EsTUFBTUMscUJBQXFCLEdBQUcs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QUNWLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBRSxFQUNYLENBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBRSxFQUNYLENBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBRSxFQUNYLENBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBRSxFQUNYLENBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBRSxFQUNYLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBRSxFQUNYLENBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBRSxFQUNYLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBRSxFQUNYLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBRSxFQUNYLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBRSxFQUNYLENBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBRSxFQUNYLENBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBRSxFQUNYLENBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBRSxFQUNYLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNWLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxF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