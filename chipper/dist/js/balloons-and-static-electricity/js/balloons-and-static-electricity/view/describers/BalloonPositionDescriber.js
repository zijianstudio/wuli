// Copyright 2016-2021, University of Colorado Boulder

/**
 * Manages all descriptions related to the balloon's position. This file is quite large, but further separation felt
 * forced so I decided to keep all in this file. Used by BalloonDescriber, which manages descriptions from the other
 * describers.
 *
 * @author Jesse Greenberg
 */

import Range from '../../../../../dot/js/Range.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import balloonsAndStaticElectricity from '../../../balloonsAndStaticElectricity.js';
import BASEA11yStrings from '../../BASEA11yStrings.js';
import BalloonDirectionEnum from '../../model/BalloonDirectionEnum.js';
import PlayAreaMap from '../../model/PlayAreaMap.js';
import BASEDescriber from './BASEDescriber.js';
import WallDescriber from './WallDescriber.js';
const atWallString = BASEA11yStrings.atWall.value;
const balloonStickingToString = BASEA11yStrings.balloonStickingTo.value;
const balloonOnString = BASEA11yStrings.balloonOn.value;
const balloonAtString = BASEA11yStrings.balloonAt.value;
const balloonPositionAttractiveStatePatternString = BASEA11yStrings.balloonPositionAttractiveStatePattern.value;
const initialMovementPatternString = BASEA11yStrings.initialMovementPattern.value;
const continuousMovementWithLabelPatternString = BASEA11yStrings.continuousMovementWithLabelPattern.value;
const twoBalloonInitialMovementPatternString = BASEA11yStrings.twoBalloonInitialMovementPattern.value;
const twoBalloonNoChangeAndPositionPatternString = BASEA11yStrings.twoBalloonNoChangeAndPositionPattern.value;
const twoBalloonNowDirectionPatternString = BASEA11yStrings.twoBalloonNowDirectionPattern.value;
const extremelySlowlyString = BASEA11yStrings.extremelySlowly.value;
const verySlowlyString = BASEA11yStrings.verySlowly.value;
const slowlyString = BASEA11yStrings.slowly.value;
const quicklyString = BASEA11yStrings.quickly.value;
const veryQuicklyString = BASEA11yStrings.veryQuickly.value;
const upDraggingString = BASEA11yStrings.upDragging.value;
const leftDraggingString = BASEA11yStrings.leftDragging.value;
const downDraggingString = BASEA11yStrings.downDragging.value;
const rightDraggingString = BASEA11yStrings.rightDragging.value;
const upAndToTheRightDraggingString = BASEA11yStrings.upAndToTheRightDragging.value;
const upAndToTheLeftDraggingString = BASEA11yStrings.upAndToTheLeftDragging.value;
const downAndToTheRightDraggingString = BASEA11yStrings.downAndToTheRightDragging.value;
const downAndToTheLeftDraggingString = BASEA11yStrings.downAndToTheLeftDragging.value;
const upString = BASEA11yStrings.up.value;
const leftString = BASEA11yStrings.left.value;
const downString = BASEA11yStrings.down.value;
const rightString = BASEA11yStrings.right.value;
const upAndToTheRightString = BASEA11yStrings.upAndToTheRight.value;
const upAndToTheLeftString = BASEA11yStrings.upAndToTheLeft.value;
const downAndToTheRightString = BASEA11yStrings.downAndToTheRight.value;
const downAndToTheLeftString = BASEA11yStrings.downAndToTheLeft.value;
const atLeftEdgeString = BASEA11yStrings.atLeftEdge.value;
const atTopString = BASEA11yStrings.atTop.value;
const atBottomString = BASEA11yStrings.atBottom.value;
const atRightEdgeString = BASEA11yStrings.atRightEdge.value;
const onSweaterString = BASEA11yStrings.onSweater.value;
const offSweaterString = BASEA11yStrings.offSweater.value;
const balloonNewRegionPatternString = BASEA11yStrings.balloonNewRegionPattern.value;
const closerToObjectPatternString = BASEA11yStrings.closerToObjectPattern.value;
const sweaterString = BASEA11yStrings.sweater.value;
const wallString = BASEA11yStrings.wall.value;
const centerOfPlayAreaString = BASEA11yStrings.centerOfPlayArea.value;
const rightEdgeOfPlayAreaString = BASEA11yStrings.rightEdgeOfPlayArea.value;
const topEdgeOfPlayAreaString = BASEA11yStrings.topEdgeOfPlayArea.value;
const bottomEdgeOfPlayAreaString = BASEA11yStrings.bottomEdgeOfPlayArea.value;
const noChangeAndPositionPatternString = BASEA11yStrings.noChangeAndPositionPattern.value;
const nearSweaterString = BASEA11yStrings.nearSweater.value;
const balloonNearString = BASEA11yStrings.balloonNear.value;
const positionAndInducedChargePatternString = BASEA11yStrings.positionAndInducedChargePattern.value;
const singleStatementPatternString = BASEA11yStrings.singleStatementPattern.value;
const keyboardInteractionCueString = BASEA11yStrings.keyboardInteractionCue.value;
const touchInteractionCueString = BASEA11yStrings.touchInteractionCue.value;
const balloonLabelWithAttractiveStatePatternString = BASEA11yStrings.balloonLabelWithAttractiveStatePattern.value;
const balloonVeryCloseToString = BASEA11yStrings.balloonVeryCloseTo.value;
const continuousMovementPatternString = BASEA11yStrings.continuousMovementPattern.value;
const continuousMovementWithLandmarkPatternString = BASEA11yStrings.continuousMovementWithLandmarkPattern.value;
const nowDirectionPatternString = BASEA11yStrings.nowDirectionPattern.value;
const balloonPositionNoChangePatternString = BASEA11yStrings.balloonPositionNoChangePattern.value;
const noChangeWithInducedChargePatternString = BASEA11yStrings.noChangeWithInducedChargePattern.value;
const balloonPositionNearOtherPatternString = BASEA11yStrings.balloonPositionNearOtherPattern.value;
const grabbedNonePatternString = BASEA11yStrings.grabbedNonePattern.value;
const grabbedChargePatternString = BASEA11yStrings.grabbedChargePattern.value;
const grabbedWithOtherChargePatternString = BASEA11yStrings.grabbedWithOtherChargePattern.value;
const grabbedWithHelpPatternString = BASEA11yStrings.grabbedWithHelpPattern.value;

// constants
// maps balloon direction to a description string while the balloon is being dragged
const BALLOON_DIRECTION_DRAGGING_MAP = {
  UP: upDraggingString,
  DOWN: downDraggingString,
  LEFT: leftDraggingString,
  RIGHT: rightDraggingString,
  UP_RIGHT: upAndToTheRightDraggingString,
  UP_LEFT: upAndToTheLeftDraggingString,
  DOWN_RIGHT: downAndToTheRightDraggingString,
  DOWN_LEFT: downAndToTheLeftDraggingString
};

// maps balloon direction to a description string for while the balloon is released
const BALLOON_DIRECTION_RELEASE_MAP = {
  UP: upString,
  DOWN: downString,
  LEFT: leftString,
  RIGHT: rightString,
  UP_RIGHT: upAndToTheRightString,
  UP_LEFT: upAndToTheLeftString,
  DOWN_RIGHT: downAndToTheRightString,
  DOWN_LEFT: downAndToTheLeftString
};

// maximum velocity of a balloon immediately after release in this simulation, determined by observation
const MAXIMUM_VELOCITY_ON_RELEASE = 0.4;

// speed of the balloon to be considered moving slowly, determined empirically so that descriptions sound nice
const SLOW_BALLOON_SPEED = 0.09;

// maps magnitude of velocity to the description
const BALLOON_VELOCITY_MAP = {
  EXTREMELY_SLOWLY_RANGE: {
    range: new Range(0, MAXIMUM_VELOCITY_ON_RELEASE / 200),
    description: extremelySlowlyString
  },
  VERY_SLOWLY_RANGE: {
    range: new Range(MAXIMUM_VELOCITY_ON_RELEASE / 200, MAXIMUM_VELOCITY_ON_RELEASE / 100),
    description: verySlowlyString
  },
  SLOWLY_RANGE: {
    range: new Range(MAXIMUM_VELOCITY_ON_RELEASE / 100, MAXIMUM_VELOCITY_ON_RELEASE / 50),
    description: slowlyString
  },
  QUICKLY_RANGE: {
    range: new Range(MAXIMUM_VELOCITY_ON_RELEASE / 50, MAXIMUM_VELOCITY_ON_RELEASE / 4),
    description: quicklyString
  },
  VERY_QUICKLY_RANGE: {
    range: new Range(MAXIMUM_VELOCITY_ON_RELEASE / 4, Number.MAX_VALUE),
    description: veryQuicklyString
  }
};
class BalloonPositionDescriber {
  /**
   * @param {BalloonDescriber} balloonDescriber - manages all balloon descriptions
   * @param {BASEModel} model
   * @param {BalloonModel} balloonModel
   * @param {string} accessibleName - accessible name for this balloon being described
   * @param {string} otherAccessibleName - reference to the other balloon being described
   */
  constructor(balloonDescriber, model, balloonModel, accessibleName, otherAccessibleName) {
    // @private - for use in instance functions
    this.model = model;
    this.wall = model.wall;
    this.balloonModel = balloonModel;
    this.balloonDescriber = balloonDescriber;
    this.accessibleName = accessibleName;
    this.otherAccessibleName = otherAccessibleName;
  }

  /**
   * Get a description that describes the attractive state or proximity of the balloon, such as
   * "On...", "sticking to...", "Near..." and so on.
   * @private
   *
   * @returns {string}
   */
  getAttractiveStateOrProximityDescription() {
    let string = '';
    if (this.balloonModel.onSweater()) {
      if (!this.balloonModel.isDraggedProperty.get() && Math.abs(this.balloonModel.chargeProperty.get()) > 0) {
        // has charged and not dragging, balloon is sticking to the object
        string = balloonStickingToString;
      } else {
        string = balloonOnString;
      }
    } else {
      string = this.getPreposition();
    }
    return string;
  }

  /**
   * Get the 'near' or 'on' or 'At' description for the balloon, depending on where the balloon is.
   * This is used as part of the balloon position description, and changes depending on interaction
   * or position of balloon.
   *
   * NOTE: This function is undoubtedly horrible for i18n.
   * @private
   *
   * @returns {string}
   */
  getPreposition() {
    let string = '';
    const wallVisible = this.wall.isVisibleProperty.get();
    if (this.balloonModel.nearWall() && wallVisible) {
      if (wallVisible) {
        string = balloonNearString;
      } else {
        string = balloonOnString;
      }
    } else if (this.balloonModel.nearSweater()) {
      string = balloonNearString;
    } else if (this.balloonModel.nearRightEdge()) {
      string = balloonNearString;
    } else if (this.balloonModel.veryCloseToObject()) {
      string = balloonVeryCloseToString;
    } else if (this.balloonModel.touchingWall() || this.balloonModel.inCenterPlayArea() || this.balloonModel.atLeftEdge()) {
      string = balloonAtString;
    } else {
      string = balloonOnString;
    }
    return string;
  }

  /**
   * Returns a string that combines the balloon's attractive state and position descriptions. Something
   * like "On center of play area" or "Sticking to wall". This fragment is used in a number of different
   * contexts, so it doesn't include punctuation at the end.
   * @public
   *
   * @returns {string}
   */
  getAttractiveStateAndPositionDescription() {
    const positionDescriptionString = this.getBalloonPositionDescription();
    const attractiveStateDescriptionString = this.getAttractiveStateOrProximityDescription();
    const attractiveStateAndPositionString = StringUtils.fillIn(balloonPositionAttractiveStatePatternString, {
      attractiveState: attractiveStateDescriptionString,
      position: positionDescriptionString
    });
    return attractiveStateAndPositionString;
  }

  /**
   * Get a description about how the balloon is sticking to an object with a label. This will form a full sentence.
   * Returns something like:
   * Yellow balloon, sticking to right arm of sweater.
   * @public
   *
   * @returns {string}
   */
  getAttractiveStateAndPositionDescriptionWithLabel() {
    // to lower case since it is used elsewhere in the string
    const position = this.getAttractiveStateAndPositionDescription().toLowerCase();
    const alert = StringUtils.fillIn(balloonLabelWithAttractiveStatePatternString, {
      balloonLabel: this.accessibleName,
      attractiveStateAndPosition: position
    });
    return StringUtils.fillIn(singleStatementPatternString, {
      statement: alert
    });
  }

  /**
   * Get a description of the balloon being "on" an item in the play area. Instead of getting
   * the attractive state of the balloon (like 'touching' or 'sticking' or 'near'), simply say
   * 'on' wherever the balloon is.
   * @public
   *
   * @returns {string}
   */
  getOnPositionDescription() {
    const positionDescription = this.getBalloonPositionDescription();
    return StringUtils.fillIn(balloonPositionAttractiveStatePatternString, {
      attractiveState: this.getPreposition(),
      position: positionDescription
    });
  }

  /**
   * Return a phrase describing the position of the balloon in the play area.  This is usually described relative
   * to the center of the balloon, unless the balloon is touching an object, in which case it will be relative to the
   * point where the objects are touching.  If the balloons are both visible and next to each other, a phrase like
   * "next to {{balloon label}}" is added. Will return someting like
   *
   * "center of play area" or
   * "upper wall", or
   * "wall, next to Green Balloon", or
   * "right arm of sweater, next to Yellow Balloon"
   * @public
   *
   * @returns {string}
   */
  getBalloonPositionDescription() {
    let description = this.getPositionDescriptionWithoutOverlap();

    // include information about how balloons are adjacent if necessary
    if (this.model.getBalloonsAdjacent()) {
      description = StringUtils.fillIn(balloonPositionNearOtherPatternString, {
        position: description,
        otherBalloon: this.otherAccessibleName
      });
    }
    return description;
  }

  /**
   * Get the description for the position of the balloon, without the extra phrase "next to {{other}} balloon" in
   * the case that the two balloons are adjacent/overlap. Will return something like
   * "center of play area" or
   * "upper wall" or
   *
   * any of the other position descriptions for the PlayAreaMap.
   *
   * @private
   *
   * @returns {string}
   */
  getPositionDescriptionWithoutOverlap() {
    const describedBalloonPosition = this.getDescribedPoint();
    const wallVisible = this.wall.isVisibleProperty.get();
    return BASEDescriber.getPositionDescription(describedBalloonPosition, wallVisible);
  }

  /**
   * Get the point on the balloon that should be described. Generally, this is the balloon center.  If the balloon
   * is touching the sweater or the wall, the point of touching should be described.  If near the wall, the described
   * point is the edge of the wall to accomplish a description like "Yellow balloon, Near upper wall".
   *
   * @private
   *
   * @returns {Vector2}
   */
  getDescribedPoint() {
    let describedBalloonPosition;
    if (this.balloonModel.onSweater()) {
      describedBalloonPosition = this.balloonModel.getSweaterTouchingCenter();
    } else {
      describedBalloonPosition = this.balloonModel.getCenter();
    }
    return describedBalloonPosition;
  }

  /**
   * Get a short description of the balloon's position at a boundary when there is an attempted drag beyond
   * the boundary.  Will return something like "At bottom" or "At top".
   *
   * @public
   *
   * @returns {string}
   */
  getTouchingBoundaryDescription(attemptedDirection) {
    assert && assert(this.balloonModel.isTouchingBoundary(), 'balloon is not touching a boundary');
    let boundaryString;
    if (this.balloonModel.isTouchingBottomBoundary() && attemptedDirection === BalloonDirectionEnum.DOWN) {
      boundaryString = atBottomString;
    } else if (this.balloonModel.isTouchingLeftBoundary() && attemptedDirection === BalloonDirectionEnum.LEFT) {
      boundaryString = atLeftEdgeString;
    } else if (this.balloonModel.touchingWall() && attemptedDirection === BalloonDirectionEnum.RIGHT) {
      boundaryString = atWallString;
    } else if (this.balloonModel.isTouchingRightEdge() && attemptedDirection === BalloonDirectionEnum.RIGHT) {
      boundaryString = atRightEdgeString;
    } else if (this.balloonModel.isTouchingTopBoundary() && attemptedDirection === BalloonDirectionEnum.UP) {
      boundaryString = atTopString;
    }
    assert && assert(boundaryString, 'No boundary string found for balloon.');
    return boundaryString;
  }

  /**
   * Get an alert that notifies balloon has entered or left the sweater. If balloon is adjacent to other balloon,
   * this information is included in the alert. Will return something like
   * "On Sweater."
   * "On sweater, next to green balloon"
   * "Off sweater"
   *
   * @public
   *
   * @param {boolean} onSweater
   * @returns {string}
   */
  getOnSweaterString(onSweater) {
    let description;
    if (onSweater) {
      description = onSweaterString;
      if (this.model.getBalloonsAdjacent()) {
        description = StringUtils.fillIn(balloonPositionNearOtherPatternString, {
          position: description,
          otherBalloon: this.otherAccessibleName
        });
      } else {
        // add punctuation
        description = StringUtils.fillIn(singleStatementPatternString, {
          statement: description
        });
      }
    } else {
      description = offSweaterString;
    }
    return description;
  }

  /**
   * Get a description of the balloon's dragging movement when it enters a landmark. Dependent on balloon velocity,
   * drag velocity, and movement direction. Depending on these variables, we might not announce this alert, so
   * this function can return null.
   * @public
   *
   * @returns {string|null}
   */
  getLandmarkDragDescription() {
    const playAreaLandmark = this.balloonModel.playAreaLandmarkProperty.get();
    const dragSpeed = this.balloonModel.dragVelocityProperty.get().magnitude;
    let alert = this.getAttractiveStateAndPositionDescription();

    // wrap as a single statement with punctuation
    alert = StringUtils.fillIn(singleStatementPatternString, {
      statement: alert
    });

    // cases where we do not want to announce the alert
    if (this.balloonModel.movingRight() && playAreaLandmark === 'AT_NEAR_SWEATER') {
      // if moving to the right and we enter the 'near sweater' landmark, ignore
      alert = null;
    } else if (playAreaLandmark === 'AT_VERY_CLOSE_TO_WALL' || playAreaLandmark === 'AT_VERY_CLOSE_TO_RIGHT_EDGE') {
      // only announce that we are very close to the wall when moving slowly and when the wall is visible
      if (dragSpeed > SLOW_BALLOON_SPEED) {
        alert = null;
      }
    }
    return alert;
  }

  /**
   * Get an alert that describes progress of balloon movement through a single cell in the play area. This information
   * will only be provided to a keyboard user.
   *
   * Will  be something like:
   * "At center of play area." or
   * "Closer to sweater."
   *
   * @public
   *
   * @returns {string}
   */
  getKeyboardMovementAlert() {
    let alert;

    // percent of progress through the region
    const progressThroughCell = this.balloonModel.getProgressThroughRegion();
    const dragVelocity = this.balloonModel.dragVelocityProperty.get().magnitude;
    const movingDiagonally = this.balloonModel.movingDiagonally();
    if (dragVelocity > SLOW_BALLOON_SPEED && progressThroughCell >= 0.66 && !movingDiagonally) {
      // if drag velocity fast and progress through the cell is greater than 60%, announce progress towards destination
      alert = this.getPlayAreaDragProgressDescription();
    } else if (dragVelocity < SLOW_BALLOON_SPEED && progressThroughCell >= 0.5 && !movingDiagonally) {
      // when drag velocity slow and progress through cell greater than 0.5, announce progress towards destination
      alert = this.getPlayAreaDragProgressDescription();
    } else {
      // just announce the current position in the play area
      alert = this.getAttractiveStateAndPositionDescription();
      alert = StringUtils.fillIn(singleStatementPatternString, {
        statement: alert
      });
    }
    return alert;
  }

  /**
   * Generally announced right after the balloon as been released, this is read as an alert. Dependent on whether
   * both balloons are visible. If they are, the label of the released balloon is read prior to the rest of the
   * alert. Will generate something like
   *
   * "Moves extremely slowly left." or
   * "Yellow balloon, moves slowly left."
   *
   * @public
   *
   * @param {Vector2} position - the current position of the balloon
   * @param {Vector2} oldPosition - the previous position of the balloon
   * @returns {string}
   */
  getInitialReleaseDescription(position, oldPosition) {
    // the balloon is moving with some initial velocity, describe that
    const velocityString = this.getVelocityString();
    const directionString = this.getReleaseDirectionDescription(this.balloonModel.directionProperty.get());
    let description;
    if (this.model.bothBalloonsVisible()) {
      description = StringUtils.fillIn(twoBalloonInitialMovementPatternString, {
        balloon: this.accessibleName,
        velocity: velocityString,
        direction: directionString
      });
    } else {
      description = StringUtils.fillIn(initialMovementPatternString, {
        velocity: velocityString,
        direction: directionString
      });
    }
    return description;
  }

  /**
   * Get a description of continuous movement of the balloon after it has been released and is
   * still moving through the play area. Label will be added for clarity if both balloons are visible.
   * Will return something like
   * "Moving Left." or
   * "Moving Left. Near wall."
   *
   * @public
   *
   * @returns {string}
   */
  getContinuousReleaseDescription() {
    let description;
    const directionString = this.getReleaseDirectionDescription(this.balloonModel.directionProperty.get());

    // describes movement and direction, including label if both balloons are visible
    if (this.balloonModel.other.isVisibleProperty.get()) {
      description = StringUtils.fillIn(continuousMovementWithLabelPatternString, {
        balloonLabel: this.accessibleName,
        direction: directionString
      });
    } else {
      description = StringUtils.fillIn(continuousMovementPatternString, {
        direction: directionString
      });
    }

    // if we are in a landmark, it will be added to the continuous movement description
    if (this.balloonModel.playAreaLandmarkProperty.get()) {
      description = StringUtils.fillIn(continuousMovementWithLandmarkPatternString, {
        movementDirection: description,
        landmark: this.getOnPositionDescription()
      });
    }
    return description;
  }

  /**
   * Produces an alert when there is no change in position.  Indicates that there is no change
   * and also reminds user where the balloon currently is. If balloon is touching wall and all charges
   * are visible, we include information about the induced charge in the wall. Will return something like
   * "No change in position. Yellow balloon, on left side of Play Area." or
   * "No change in position. Yellow Balloon, at wall. Negative charges in wall move away from yellow balloon a lot."
   *
   * @public
   *
   * @returns {string}
   */
  getNoChangeReleaseDescription() {
    let description;
    const attractiveStateAndPositionDescription = this.getAttractiveStateAndPositionDescriptionWithLabel();
    if (this.model.bothBalloonsVisible()) {
      description = StringUtils.fillIn(twoBalloonNoChangeAndPositionPatternString, {
        balloon: this.accessibleName,
        position: attractiveStateAndPositionDescription
      });
    } else {
      description = StringUtils.fillIn(noChangeAndPositionPatternString, {
        position: attractiveStateAndPositionDescription
      });
    }

    // if balloon touching wall and inducing charge, include induced charge information
    if (this.balloonModel.touchingWall() && this.model.showChargesProperty.get() === 'all') {
      const wallVisible = this.model.wall.isVisibleProperty.get();
      const thisInducingAndVisible = this.balloonModel.inducingChargeAndVisible();
      const otherInducingAndVisible = this.balloonModel.other.inducingChargeAndVisible();
      let inducedChargeString;
      if (thisInducingAndVisible && otherInducingAndVisible && this.model.getBalloonsAdjacent()) {
        // if both inducing charge, combine induced charge description with "both balloons"
        inducedChargeString = WallDescriber.getCombinedInducedChargeDescription(this.balloonModel, wallVisible);
      } else {
        inducedChargeString = WallDescriber.getInducedChargeDescription(this.balloonModel, this.accessibleName, wallVisible);
      }
      inducedChargeString = StringUtils.fillIn(singleStatementPatternString, {
        statement: inducedChargeString
      });
      description = StringUtils.fillIn(noChangeWithInducedChargePatternString, {
        noChange: description,
        inducedCharge: inducedChargeString
      });
    }
    return description;
  }

  /**
   * Get a description of velocity for this balloon, one of "very slowly", "slowly", "quickly", "very quickly"
   *
   * @private
   * @returns {string}
   */
  getVelocityString() {
    let velocityString;
    const balloonVelocity = this.balloonModel.velocityProperty.get();
    const keys = Object.keys(BALLOON_VELOCITY_MAP);
    for (let i = 0; i < keys.length; i++) {
      const entry = BALLOON_VELOCITY_MAP[keys[i]];
      if (entry.range.contains(balloonVelocity.magnitude)) {
        velocityString = entry.description;
        break;
      }
    }
    assert && assert(velocityString, 'no velocity description found');
    return velocityString;
  }

  /**
   * Get a movement description from the movement direction tracked in the model.  The direction
   * is one of BalloonDirectionEnum.
   *
   * @private
   *
   * @param {string} direction - one of BalloonDirectionEnum
   * @returns {string}
   */
  getDraggingDirectionDescription(direction) {
    const movementString = BALLOON_DIRECTION_DRAGGING_MAP[direction];
    assert && assert(movementString, `no direction description found for balloon moving direction ${direction}`);
    return movementString;
  }

  /**
   * Get a description of the balloon movement direction when the balloon is not currently
   * being dragged.
   *
   * @public
   *
   * @param  {string} direction - one of BalloonDirectionEnum
   */
  getReleaseDirectionDescription(direction) {
    const movementString = BALLOON_DIRECTION_RELEASE_MAP[direction];
    assert && assert(movementString, `no direction description found for balloon moving direction ${direction}`);
    return movementString;
  }

  /**
   * Get the dragging description while the balloon is moving through the play area being dragged and enters
   * a new region in the play area.
   *
   * @public
   *
   * @returns {string}
   */
  getPlayAreaDragNewRegionDescription() {
    const nearOrAt = this.getPreposition();
    const balloonCenter = this.balloonModel.getCenter();
    const wallVisible = this.model.wall.isVisibleProperty.get();
    const positionString = BASEDescriber.getPositionDescription(balloonCenter, wallVisible);
    return StringUtils.fillIn(balloonNewRegionPatternString, {
      nearOrAt: nearOrAt,
      position: positionString
    });
  }

  /**
   * Get a progress string toward the sweater, wall, top edge, bottom edge, or center of play area.
   *
   * @private
   *
   * @returns {string}
   */
  getPlayAreaDragProgressDescription() {
    let nearestObjectString;
    const centerPlayAreaX = PlayAreaMap.X_POSITIONS.AT_CENTER_PLAY_AREA;
    const centerPlayAreaY = PlayAreaMap.Y_POSITIONS.AT_CENTER_PLAY_AREA;
    const balloonCenterX = this.balloonModel.getCenterX();
    const balloonCenterY = this.balloonModel.getCenterY();
    const balloonDirection = this.balloonModel.directionProperty.get();
    if (balloonDirection === BalloonDirectionEnum.LEFT) {
      // if right of center, describe closer to center, otherwise closer to sweater
      nearestObjectString = balloonCenterX > centerPlayAreaX ? centerOfPlayAreaString : sweaterString;
    } else if (balloonDirection === BalloonDirectionEnum.RIGHT) {
      if (balloonCenterX < centerPlayAreaX) {
        // if left of center, describe that we are closer to the center
        nearestObjectString = centerOfPlayAreaString;
      } else {
        // otherwise describe closer to wall or righe edge depending on wall visibility
        nearestObjectString = this.model.wall.isVisibleProperty.get() ? wallString : rightEdgeOfPlayAreaString;
      }
    } else if (balloonDirection === BalloonDirectionEnum.UP) {
      // below center describe closer to center, otherwise closer to top of play area
      nearestObjectString = balloonCenterY > centerPlayAreaY ? centerOfPlayAreaString : topEdgeOfPlayAreaString;
    } else if (balloonDirection === BalloonDirectionEnum.DOWN) {
      // above center describe closer to center, otherwise closer to bottom edge of play area
      nearestObjectString = balloonCenterY < centerPlayAreaY ? centerOfPlayAreaString : bottomEdgeOfPlayAreaString;
    }
    assert && assert(nearestObjectString, `no nearest object found for movement direction: ${balloonDirection}`);
    const alert = StringUtils.fillIn(closerToObjectPatternString, {
      object: nearestObjectString
    });
    return StringUtils.fillIn(singleStatementPatternString, {
      statement: alert
    });
  }

  /**
   * Get a description about the change in direction. If the balloon is grabbed, only the direction will be in the
   * description. Otherwise, it will be an update to direction, so add "Now". Will return something like
   *
   * "Left." or
   * "Now Left."
   *
   * @public
   *
   * @returns {string}
   */
  getDirectionChangedDescription() {
    let description;
    const direction = this.balloonModel.directionProperty.get();
    if (this.balloonModel.isDraggedProperty.get()) {
      // when dragged, just the direction
      description = this.getDraggingDirectionDescription(direction);
    } else {
      // when not dragged, add 'Now' to direction
      const directionString = this.getReleaseDirectionDescription(direction);
      if (this.model.bothBalloonsVisible()) {
        description = StringUtils.fillIn(twoBalloonNowDirectionPatternString, {
          balloon: this.accessibleName,
          direction: directionString
        });
      } else {
        description = StringUtils.fillIn(nowDirectionPatternString, {
          direction: directionString
        });
      }
    }
    return description;
  }

  /**
   * Get a description of the balloon when its independent movement stops. If charges are shown and the balloon is
   * inducing charge, will include induced charge information.
   * Will return something like
   *
   * "Green balloon, at upper wall. In upper wall, no change in charges." or
   * "Green balloon, at wall. Negative charges in wall move away from yellow balloon a little bit."
   *
   * @public
   *
   * @returns {string}
   */
  getMovementStopsDescription() {
    let descriptionString;

    // the position string is used for all charge views, used as a single sentence
    const positionString = this.getAttractiveStateAndPositionDescriptionWithLabel();
    const shownCharges = this.model.showChargesProperty.get();
    if (shownCharges === 'all' && this.wall.isVisibleProperty.get()) {
      // don't include information about adjacency to other balloon in this position  description
      const chargePositionString = this.getPositionDescriptionWithoutOverlap();
      let chargeString;
      if (this.balloonModel.inducingChargeProperty.get()) {
        chargeString = WallDescriber.getInducedChargeDescription(this.balloonModel, this.accessibleName, this.wall.isVisibleProperty.get());
      } else {
        chargeString = WallDescriber.getNoChangeInChargesDescription(chargePositionString);
      }
      descriptionString = StringUtils.fillIn(balloonPositionNoChangePatternString, {
        position: positionString,
        inducedCharge: chargeString
      });
    } else {
      descriptionString = positionString;
    }
    return descriptionString;
  }

  /**
   * Returns true if the balloon is moving slow enough to warrant continuous movement descriptions, but fast enough
   * for the movement to be observable. This is to prevent this alert from firing indefinitely if the balloon has
   * some arbitrary velocity.
   *
   * @public
   *
   * @returns {boolean}
   */
  balloonMovingAtContinuousDescriptionVelocity() {
    const velocityMagnitude = this.balloonModel.velocityProperty.get().magnitude;
    return velocityMagnitude < BALLOON_VELOCITY_MAP.QUICKLY_RANGE.range.max && velocityMagnitude > 0.0005; // value chosen empirically, see #413
  }

  /**
   * Get an alert that indicates that the balloon has been grabbed for dragging. Will compose
   * a description containing charge information, position information, and help for how
   * to interact with balloon. Amount of charge information will depend on charge visibility
   * setting. If the balloon is inducing charge, information about induced charge will be included.
   * If the balloon is on the sweater, will include information about the charges on the sweater. After the
   * balloon has been picked up once, we don't need to describe help information until reset.
   *
   * @public
   *
   * @returns {string}
   */
  getGrabbedAlert() {
    let description;

    // charges visible in the view
    const chargesShown = this.model.showChargesProperty.get();

    // attractive state and position is described for every charge view, it is a single sentence in this use case
    let stateAndPosition = this.getOnPositionDescription();
    stateAndPosition = StringUtils.fillIn(singleStatementPatternString, {
      statement: stateAndPosition
    });

    // get a description of the relative charge of the grabbed balloon, and possibly the other relative charge
    // of the other balloon if visible
    if (chargesShown !== 'none') {
      let chargeDescription;
      if (this.model.getBalloonsAdjacent()) {
        chargeDescription = this.balloonDescriber.chargeDescriber.getCombinedRelativeChargeDescription();
      } else {
        chargeDescription = this.balloonDescriber.chargeDescriber.getHasRelativeChargeDescription();
      }
      chargeDescription = StringUtils.fillIn(singleStatementPatternString, {
        statement: chargeDescription
      });

      // if the balloon is inducing charge, or touching the sweater or wall we include a description for this
      const inducingChargeOrTouchingWall = this.balloonModel.inducingChargeProperty.get() || this.balloonModel.touchingWall();
      const onSweater = this.balloonModel.onSweater();
      if (inducingChargeOrTouchingWall || onSweater && chargesShown !== 'none') {
        const otherObjectCharge = this.balloonDescriber.chargeDescriber.getOtherObjectChargeDescription();
        chargeDescription = StringUtils.fillIn(grabbedWithOtherChargePatternString, {
          balloonCharge: chargeDescription,
          otherObjectCharge: otherObjectCharge
        });
      }
      description = StringUtils.fillIn(grabbedChargePatternString, {
        position: stateAndPosition,
        charge: chargeDescription
      });
    } else {
      // no charges shown, just include information about position
      description = StringUtils.fillIn(grabbedNonePatternString, {
        position: stateAndPosition
      });
    }

    // if this is the first time picking up the balloon, include help content
    if (!this.balloonModel.successfulPickUp) {
      description = StringUtils.fillIn(grabbedWithHelpPatternString, {
        grabbedAlert: description,
        help: phet.joist.sim.supportsGestureDescription ? touchInteractionCueString : keyboardInteractionCueString
      });
    }
    this.balloonModel.successfulPickUp = true;
    return description;
  }

  /**
   * Get a description of where the balloon jumped to.  Depending on where the balloon goes, there
   * could be an indication of where the balloon is in the play area, and potentially the state of
   * the induced charge in the wall.
   *
   * @public
   * @param  {Vector2} center
   * @returns {string}
   */
  getJumpingDescription(center) {
    let description = '';

    // all jumping is in the x direction
    const centerX = center.x;

    // determine which description we should use depending on the center position of the balloon
    if (centerX === PlayAreaMap.X_POSITIONS.AT_NEAR_SWEATER) {
      description = nearSweaterString;
    } else {
      // general position description for the balloon
      const positionDescription = this.getAttractiveStateAndPositionDescription();

      // state variables used to generate description content
      const wallVisible = this.wall.isVisibleProperty.get();
      const inducingCharge = this.balloonModel.inducingChargeProperty.get();
      const showCharges = this.model.showChargesProperty.get();

      // if jumping to wall, describe as if balloon is rubbing along the wall for the first time
      if (this.balloonModel.touchingWallProperty.get() && showCharges !== 'none') {
        if (showCharges === 'all') {
          // describer pairs of charges in the wall if they are visible
          description = this.balloonDescriber.getWallRubbingDescriptionWithChargePairs();
        } else {
          description = this.balloonDescriber.getWallRubbingDescription();
        }
      } else if (wallVisible && inducingCharge && showCharges === 'all') {
        // if there is an induced charge and the charges are visible, describe induced charge summary
        const inducedChargeDescription = WallDescriber.getInducedChargeDescriptionWithNoAmount(this.balloonModel, this.accessibleName, wallVisible);
        description = StringUtils.fillIn(positionAndInducedChargePatternString, {
          position: positionDescription,
          inducedCharge: inducedChargeDescription
        });
      } else {
        // otherwise, only provide the position description
        description = StringUtils.fillIn(singleStatementPatternString, {
          statement: positionDescription
        });
      }
    }

    // after jumping, reset induced charge description flags
    this.inducedChargeDisplacementOnEnd = false;
    return description;
  }
}
balloonsAndStaticElectricity.register('BalloonPositionDescriber', BalloonPositionDescriber);
export default BalloonPositionDescriber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIlN0cmluZ1V0aWxzIiwiYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eSIsIkJBU0VBMTF5U3RyaW5ncyIsIkJhbGxvb25EaXJlY3Rpb25FbnVtIiwiUGxheUFyZWFNYXAiLCJCQVNFRGVzY3JpYmVyIiwiV2FsbERlc2NyaWJlciIsImF0V2FsbFN0cmluZyIsImF0V2FsbCIsInZhbHVlIiwiYmFsbG9vblN0aWNraW5nVG9TdHJpbmciLCJiYWxsb29uU3RpY2tpbmdUbyIsImJhbGxvb25PblN0cmluZyIsImJhbGxvb25PbiIsImJhbGxvb25BdFN0cmluZyIsImJhbGxvb25BdCIsImJhbGxvb25Qb3NpdGlvbkF0dHJhY3RpdmVTdGF0ZVBhdHRlcm5TdHJpbmciLCJiYWxsb29uUG9zaXRpb25BdHRyYWN0aXZlU3RhdGVQYXR0ZXJuIiwiaW5pdGlhbE1vdmVtZW50UGF0dGVyblN0cmluZyIsImluaXRpYWxNb3ZlbWVudFBhdHRlcm4iLCJjb250aW51b3VzTW92ZW1lbnRXaXRoTGFiZWxQYXR0ZXJuU3RyaW5nIiwiY29udGludW91c01vdmVtZW50V2l0aExhYmVsUGF0dGVybiIsInR3b0JhbGxvb25Jbml0aWFsTW92ZW1lbnRQYXR0ZXJuU3RyaW5nIiwidHdvQmFsbG9vbkluaXRpYWxNb3ZlbWVudFBhdHRlcm4iLCJ0d29CYWxsb29uTm9DaGFuZ2VBbmRQb3NpdGlvblBhdHRlcm5TdHJpbmciLCJ0d29CYWxsb29uTm9DaGFuZ2VBbmRQb3NpdGlvblBhdHRlcm4iLCJ0d29CYWxsb29uTm93RGlyZWN0aW9uUGF0dGVyblN0cmluZyIsInR3b0JhbGxvb25Ob3dEaXJlY3Rpb25QYXR0ZXJuIiwiZXh0cmVtZWx5U2xvd2x5U3RyaW5nIiwiZXh0cmVtZWx5U2xvd2x5IiwidmVyeVNsb3dseVN0cmluZyIsInZlcnlTbG93bHkiLCJzbG93bHlTdHJpbmciLCJzbG93bHkiLCJxdWlja2x5U3RyaW5nIiwicXVpY2tseSIsInZlcnlRdWlja2x5U3RyaW5nIiwidmVyeVF1aWNrbHkiLCJ1cERyYWdnaW5nU3RyaW5nIiwidXBEcmFnZ2luZyIsImxlZnREcmFnZ2luZ1N0cmluZyIsImxlZnREcmFnZ2luZyIsImRvd25EcmFnZ2luZ1N0cmluZyIsImRvd25EcmFnZ2luZyIsInJpZ2h0RHJhZ2dpbmdTdHJpbmciLCJyaWdodERyYWdnaW5nIiwidXBBbmRUb1RoZVJpZ2h0RHJhZ2dpbmdTdHJpbmciLCJ1cEFuZFRvVGhlUmlnaHREcmFnZ2luZyIsInVwQW5kVG9UaGVMZWZ0RHJhZ2dpbmdTdHJpbmciLCJ1cEFuZFRvVGhlTGVmdERyYWdnaW5nIiwiZG93bkFuZFRvVGhlUmlnaHREcmFnZ2luZ1N0cmluZyIsImRvd25BbmRUb1RoZVJpZ2h0RHJhZ2dpbmciLCJkb3duQW5kVG9UaGVMZWZ0RHJhZ2dpbmdTdHJpbmciLCJkb3duQW5kVG9UaGVMZWZ0RHJhZ2dpbmciLCJ1cFN0cmluZyIsInVwIiwibGVmdFN0cmluZyIsImxlZnQiLCJkb3duU3RyaW5nIiwiZG93biIsInJpZ2h0U3RyaW5nIiwicmlnaHQiLCJ1cEFuZFRvVGhlUmlnaHRTdHJpbmciLCJ1cEFuZFRvVGhlUmlnaHQiLCJ1cEFuZFRvVGhlTGVmdFN0cmluZyIsInVwQW5kVG9UaGVMZWZ0IiwiZG93bkFuZFRvVGhlUmlnaHRTdHJpbmciLCJkb3duQW5kVG9UaGVSaWdodCIsImRvd25BbmRUb1RoZUxlZnRTdHJpbmciLCJkb3duQW5kVG9UaGVMZWZ0IiwiYXRMZWZ0RWRnZVN0cmluZyIsImF0TGVmdEVkZ2UiLCJhdFRvcFN0cmluZyIsImF0VG9wIiwiYXRCb3R0b21TdHJpbmciLCJhdEJvdHRvbSIsImF0UmlnaHRFZGdlU3RyaW5nIiwiYXRSaWdodEVkZ2UiLCJvblN3ZWF0ZXJTdHJpbmciLCJvblN3ZWF0ZXIiLCJvZmZTd2VhdGVyU3RyaW5nIiwib2ZmU3dlYXRlciIsImJhbGxvb25OZXdSZWdpb25QYXR0ZXJuU3RyaW5nIiwiYmFsbG9vbk5ld1JlZ2lvblBhdHRlcm4iLCJjbG9zZXJUb09iamVjdFBhdHRlcm5TdHJpbmciLCJjbG9zZXJUb09iamVjdFBhdHRlcm4iLCJzd2VhdGVyU3RyaW5nIiwic3dlYXRlciIsIndhbGxTdHJpbmciLCJ3YWxsIiwiY2VudGVyT2ZQbGF5QXJlYVN0cmluZyIsImNlbnRlck9mUGxheUFyZWEiLCJyaWdodEVkZ2VPZlBsYXlBcmVhU3RyaW5nIiwicmlnaHRFZGdlT2ZQbGF5QXJlYSIsInRvcEVkZ2VPZlBsYXlBcmVhU3RyaW5nIiwidG9wRWRnZU9mUGxheUFyZWEiLCJib3R0b21FZGdlT2ZQbGF5QXJlYVN0cmluZyIsImJvdHRvbUVkZ2VPZlBsYXlBcmVhIiwibm9DaGFuZ2VBbmRQb3NpdGlvblBhdHRlcm5TdHJpbmciLCJub0NoYW5nZUFuZFBvc2l0aW9uUGF0dGVybiIsIm5lYXJTd2VhdGVyU3RyaW5nIiwibmVhclN3ZWF0ZXIiLCJiYWxsb29uTmVhclN0cmluZyIsImJhbGxvb25OZWFyIiwicG9zaXRpb25BbmRJbmR1Y2VkQ2hhcmdlUGF0dGVyblN0cmluZyIsInBvc2l0aW9uQW5kSW5kdWNlZENoYXJnZVBhdHRlcm4iLCJzaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuU3RyaW5nIiwic2luZ2xlU3RhdGVtZW50UGF0dGVybiIsImtleWJvYXJkSW50ZXJhY3Rpb25DdWVTdHJpbmciLCJrZXlib2FyZEludGVyYWN0aW9uQ3VlIiwidG91Y2hJbnRlcmFjdGlvbkN1ZVN0cmluZyIsInRvdWNoSW50ZXJhY3Rpb25DdWUiLCJiYWxsb29uTGFiZWxXaXRoQXR0cmFjdGl2ZVN0YXRlUGF0dGVyblN0cmluZyIsImJhbGxvb25MYWJlbFdpdGhBdHRyYWN0aXZlU3RhdGVQYXR0ZXJuIiwiYmFsbG9vblZlcnlDbG9zZVRvU3RyaW5nIiwiYmFsbG9vblZlcnlDbG9zZVRvIiwiY29udGludW91c01vdmVtZW50UGF0dGVyblN0cmluZyIsImNvbnRpbnVvdXNNb3ZlbWVudFBhdHRlcm4iLCJjb250aW51b3VzTW92ZW1lbnRXaXRoTGFuZG1hcmtQYXR0ZXJuU3RyaW5nIiwiY29udGludW91c01vdmVtZW50V2l0aExhbmRtYXJrUGF0dGVybiIsIm5vd0RpcmVjdGlvblBhdHRlcm5TdHJpbmciLCJub3dEaXJlY3Rpb25QYXR0ZXJuIiwiYmFsbG9vblBvc2l0aW9uTm9DaGFuZ2VQYXR0ZXJuU3RyaW5nIiwiYmFsbG9vblBvc2l0aW9uTm9DaGFuZ2VQYXR0ZXJuIiwibm9DaGFuZ2VXaXRoSW5kdWNlZENoYXJnZVBhdHRlcm5TdHJpbmciLCJub0NoYW5nZVdpdGhJbmR1Y2VkQ2hhcmdlUGF0dGVybiIsImJhbGxvb25Qb3NpdGlvbk5lYXJPdGhlclBhdHRlcm5TdHJpbmciLCJiYWxsb29uUG9zaXRpb25OZWFyT3RoZXJQYXR0ZXJuIiwiZ3JhYmJlZE5vbmVQYXR0ZXJuU3RyaW5nIiwiZ3JhYmJlZE5vbmVQYXR0ZXJuIiwiZ3JhYmJlZENoYXJnZVBhdHRlcm5TdHJpbmciLCJncmFiYmVkQ2hhcmdlUGF0dGVybiIsImdyYWJiZWRXaXRoT3RoZXJDaGFyZ2VQYXR0ZXJuU3RyaW5nIiwiZ3JhYmJlZFdpdGhPdGhlckNoYXJnZVBhdHRlcm4iLCJncmFiYmVkV2l0aEhlbHBQYXR0ZXJuU3RyaW5nIiwiZ3JhYmJlZFdpdGhIZWxwUGF0dGVybiIsIkJBTExPT05fRElSRUNUSU9OX0RSQUdHSU5HX01BUCIsIlVQIiwiRE9XTiIsIkxFRlQiLCJSSUdIVCIsIlVQX1JJR0hUIiwiVVBfTEVGVCIsIkRPV05fUklHSFQiLCJET1dOX0xFRlQiLCJCQUxMT09OX0RJUkVDVElPTl9SRUxFQVNFX01BUCIsIk1BWElNVU1fVkVMT0NJVFlfT05fUkVMRUFTRSIsIlNMT1dfQkFMTE9PTl9TUEVFRCIsIkJBTExPT05fVkVMT0NJVFlfTUFQIiwiRVhUUkVNRUxZX1NMT1dMWV9SQU5HRSIsInJhbmdlIiwiZGVzY3JpcHRpb24iLCJWRVJZX1NMT1dMWV9SQU5HRSIsIlNMT1dMWV9SQU5HRSIsIlFVSUNLTFlfUkFOR0UiLCJWRVJZX1FVSUNLTFlfUkFOR0UiLCJOdW1iZXIiLCJNQVhfVkFMVUUiLCJCYWxsb29uUG9zaXRpb25EZXNjcmliZXIiLCJjb25zdHJ1Y3RvciIsImJhbGxvb25EZXNjcmliZXIiLCJtb2RlbCIsImJhbGxvb25Nb2RlbCIsImFjY2Vzc2libGVOYW1lIiwib3RoZXJBY2Nlc3NpYmxlTmFtZSIsImdldEF0dHJhY3RpdmVTdGF0ZU9yUHJveGltaXR5RGVzY3JpcHRpb24iLCJzdHJpbmciLCJpc0RyYWdnZWRQcm9wZXJ0eSIsImdldCIsIk1hdGgiLCJhYnMiLCJjaGFyZ2VQcm9wZXJ0eSIsImdldFByZXBvc2l0aW9uIiwid2FsbFZpc2libGUiLCJpc1Zpc2libGVQcm9wZXJ0eSIsIm5lYXJXYWxsIiwibmVhclJpZ2h0RWRnZSIsInZlcnlDbG9zZVRvT2JqZWN0IiwidG91Y2hpbmdXYWxsIiwiaW5DZW50ZXJQbGF5QXJlYSIsImdldEF0dHJhY3RpdmVTdGF0ZUFuZFBvc2l0aW9uRGVzY3JpcHRpb24iLCJwb3NpdGlvbkRlc2NyaXB0aW9uU3RyaW5nIiwiZ2V0QmFsbG9vblBvc2l0aW9uRGVzY3JpcHRpb24iLCJhdHRyYWN0aXZlU3RhdGVEZXNjcmlwdGlvblN0cmluZyIsImF0dHJhY3RpdmVTdGF0ZUFuZFBvc2l0aW9uU3RyaW5nIiwiZmlsbEluIiwiYXR0cmFjdGl2ZVN0YXRlIiwicG9zaXRpb24iLCJnZXRBdHRyYWN0aXZlU3RhdGVBbmRQb3NpdGlvbkRlc2NyaXB0aW9uV2l0aExhYmVsIiwidG9Mb3dlckNhc2UiLCJhbGVydCIsImJhbGxvb25MYWJlbCIsImF0dHJhY3RpdmVTdGF0ZUFuZFBvc2l0aW9uIiwic3RhdGVtZW50IiwiZ2V0T25Qb3NpdGlvbkRlc2NyaXB0aW9uIiwicG9zaXRpb25EZXNjcmlwdGlvbiIsImdldFBvc2l0aW9uRGVzY3JpcHRpb25XaXRob3V0T3ZlcmxhcCIsImdldEJhbGxvb25zQWRqYWNlbnQiLCJvdGhlckJhbGxvb24iLCJkZXNjcmliZWRCYWxsb29uUG9zaXRpb24iLCJnZXREZXNjcmliZWRQb2ludCIsImdldFBvc2l0aW9uRGVzY3JpcHRpb24iLCJnZXRTd2VhdGVyVG91Y2hpbmdDZW50ZXIiLCJnZXRDZW50ZXIiLCJnZXRUb3VjaGluZ0JvdW5kYXJ5RGVzY3JpcHRpb24iLCJhdHRlbXB0ZWREaXJlY3Rpb24iLCJhc3NlcnQiLCJpc1RvdWNoaW5nQm91bmRhcnkiLCJib3VuZGFyeVN0cmluZyIsImlzVG91Y2hpbmdCb3R0b21Cb3VuZGFyeSIsImlzVG91Y2hpbmdMZWZ0Qm91bmRhcnkiLCJpc1RvdWNoaW5nUmlnaHRFZGdlIiwiaXNUb3VjaGluZ1RvcEJvdW5kYXJ5IiwiZ2V0T25Td2VhdGVyU3RyaW5nIiwiZ2V0TGFuZG1hcmtEcmFnRGVzY3JpcHRpb24iLCJwbGF5QXJlYUxhbmRtYXJrIiwicGxheUFyZWFMYW5kbWFya1Byb3BlcnR5IiwiZHJhZ1NwZWVkIiwiZHJhZ1ZlbG9jaXR5UHJvcGVydHkiLCJtYWduaXR1ZGUiLCJtb3ZpbmdSaWdodCIsImdldEtleWJvYXJkTW92ZW1lbnRBbGVydCIsInByb2dyZXNzVGhyb3VnaENlbGwiLCJnZXRQcm9ncmVzc1Rocm91Z2hSZWdpb24iLCJkcmFnVmVsb2NpdHkiLCJtb3ZpbmdEaWFnb25hbGx5IiwiZ2V0UGxheUFyZWFEcmFnUHJvZ3Jlc3NEZXNjcmlwdGlvbiIsImdldEluaXRpYWxSZWxlYXNlRGVzY3JpcHRpb24iLCJvbGRQb3NpdGlvbiIsInZlbG9jaXR5U3RyaW5nIiwiZ2V0VmVsb2NpdHlTdHJpbmciLCJkaXJlY3Rpb25TdHJpbmciLCJnZXRSZWxlYXNlRGlyZWN0aW9uRGVzY3JpcHRpb24iLCJkaXJlY3Rpb25Qcm9wZXJ0eSIsImJvdGhCYWxsb29uc1Zpc2libGUiLCJiYWxsb29uIiwidmVsb2NpdHkiLCJkaXJlY3Rpb24iLCJnZXRDb250aW51b3VzUmVsZWFzZURlc2NyaXB0aW9uIiwib3RoZXIiLCJtb3ZlbWVudERpcmVjdGlvbiIsImxhbmRtYXJrIiwiZ2V0Tm9DaGFuZ2VSZWxlYXNlRGVzY3JpcHRpb24iLCJhdHRyYWN0aXZlU3RhdGVBbmRQb3NpdGlvbkRlc2NyaXB0aW9uIiwic2hvd0NoYXJnZXNQcm9wZXJ0eSIsInRoaXNJbmR1Y2luZ0FuZFZpc2libGUiLCJpbmR1Y2luZ0NoYXJnZUFuZFZpc2libGUiLCJvdGhlckluZHVjaW5nQW5kVmlzaWJsZSIsImluZHVjZWRDaGFyZ2VTdHJpbmciLCJnZXRDb21iaW5lZEluZHVjZWRDaGFyZ2VEZXNjcmlwdGlvbiIsImdldEluZHVjZWRDaGFyZ2VEZXNjcmlwdGlvbiIsIm5vQ2hhbmdlIiwiaW5kdWNlZENoYXJnZSIsImJhbGxvb25WZWxvY2l0eSIsInZlbG9jaXR5UHJvcGVydHkiLCJrZXlzIiwiT2JqZWN0IiwiaSIsImxlbmd0aCIsImVudHJ5IiwiY29udGFpbnMiLCJnZXREcmFnZ2luZ0RpcmVjdGlvbkRlc2NyaXB0aW9uIiwibW92ZW1lbnRTdHJpbmciLCJnZXRQbGF5QXJlYURyYWdOZXdSZWdpb25EZXNjcmlwdGlvbiIsIm5lYXJPckF0IiwiYmFsbG9vbkNlbnRlciIsInBvc2l0aW9uU3RyaW5nIiwibmVhcmVzdE9iamVjdFN0cmluZyIsImNlbnRlclBsYXlBcmVhWCIsIlhfUE9TSVRJT05TIiwiQVRfQ0VOVEVSX1BMQVlfQVJFQSIsImNlbnRlclBsYXlBcmVhWSIsIllfUE9TSVRJT05TIiwiYmFsbG9vbkNlbnRlclgiLCJnZXRDZW50ZXJYIiwiYmFsbG9vbkNlbnRlclkiLCJnZXRDZW50ZXJZIiwiYmFsbG9vbkRpcmVjdGlvbiIsIm9iamVjdCIsImdldERpcmVjdGlvbkNoYW5nZWREZXNjcmlwdGlvbiIsImdldE1vdmVtZW50U3RvcHNEZXNjcmlwdGlvbiIsImRlc2NyaXB0aW9uU3RyaW5nIiwic2hvd25DaGFyZ2VzIiwiY2hhcmdlUG9zaXRpb25TdHJpbmciLCJjaGFyZ2VTdHJpbmciLCJpbmR1Y2luZ0NoYXJnZVByb3BlcnR5IiwiZ2V0Tm9DaGFuZ2VJbkNoYXJnZXNEZXNjcmlwdGlvbiIsImJhbGxvb25Nb3ZpbmdBdENvbnRpbnVvdXNEZXNjcmlwdGlvblZlbG9jaXR5IiwidmVsb2NpdHlNYWduaXR1ZGUiLCJtYXgiLCJnZXRHcmFiYmVkQWxlcnQiLCJjaGFyZ2VzU2hvd24iLCJzdGF0ZUFuZFBvc2l0aW9uIiwiY2hhcmdlRGVzY3JpcHRpb24iLCJjaGFyZ2VEZXNjcmliZXIiLCJnZXRDb21iaW5lZFJlbGF0aXZlQ2hhcmdlRGVzY3JpcHRpb24iLCJnZXRIYXNSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uIiwiaW5kdWNpbmdDaGFyZ2VPclRvdWNoaW5nV2FsbCIsIm90aGVyT2JqZWN0Q2hhcmdlIiwiZ2V0T3RoZXJPYmplY3RDaGFyZ2VEZXNjcmlwdGlvbiIsImJhbGxvb25DaGFyZ2UiLCJjaGFyZ2UiLCJzdWNjZXNzZnVsUGlja1VwIiwiZ3JhYmJlZEFsZXJ0IiwiaGVscCIsInBoZXQiLCJqb2lzdCIsInNpbSIsInN1cHBvcnRzR2VzdHVyZURlc2NyaXB0aW9uIiwiZ2V0SnVtcGluZ0Rlc2NyaXB0aW9uIiwiY2VudGVyIiwiY2VudGVyWCIsIngiLCJBVF9ORUFSX1NXRUFURVIiLCJpbmR1Y2luZ0NoYXJnZSIsInNob3dDaGFyZ2VzIiwidG91Y2hpbmdXYWxsUHJvcGVydHkiLCJnZXRXYWxsUnViYmluZ0Rlc2NyaXB0aW9uV2l0aENoYXJnZVBhaXJzIiwiZ2V0V2FsbFJ1YmJpbmdEZXNjcmlwdGlvbiIsImluZHVjZWRDaGFyZ2VEZXNjcmlwdGlvbiIsImdldEluZHVjZWRDaGFyZ2VEZXNjcmlwdGlvbldpdGhOb0Ftb3VudCIsImluZHVjZWRDaGFyZ2VEaXNwbGFjZW1lbnRPbkVuZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmFsbG9vblBvc2l0aW9uRGVzY3JpYmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1hbmFnZXMgYWxsIGRlc2NyaXB0aW9ucyByZWxhdGVkIHRvIHRoZSBiYWxsb29uJ3MgcG9zaXRpb24uIFRoaXMgZmlsZSBpcyBxdWl0ZSBsYXJnZSwgYnV0IGZ1cnRoZXIgc2VwYXJhdGlvbiBmZWx0XHJcbiAqIGZvcmNlZCBzbyBJIGRlY2lkZWQgdG8ga2VlcCBhbGwgaW4gdGhpcyBmaWxlLiBVc2VkIGJ5IEJhbGxvb25EZXNjcmliZXIsIHdoaWNoIG1hbmFnZXMgZGVzY3JpcHRpb25zIGZyb20gdGhlIG90aGVyXHJcbiAqIGRlc2NyaWJlcnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eSBmcm9tICcuLi8uLi8uLi9iYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5LmpzJztcclxuaW1wb3J0IEJBU0VBMTF5U3RyaW5ncyBmcm9tICcuLi8uLi9CQVNFQTExeVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQmFsbG9vbkRpcmVjdGlvbkVudW0gZnJvbSAnLi4vLi4vbW9kZWwvQmFsbG9vbkRpcmVjdGlvbkVudW0uanMnO1xyXG5pbXBvcnQgUGxheUFyZWFNYXAgZnJvbSAnLi4vLi4vbW9kZWwvUGxheUFyZWFNYXAuanMnO1xyXG5pbXBvcnQgQkFTRURlc2NyaWJlciBmcm9tICcuL0JBU0VEZXNjcmliZXIuanMnO1xyXG5pbXBvcnQgV2FsbERlc2NyaWJlciBmcm9tICcuL1dhbGxEZXNjcmliZXIuanMnO1xyXG5cclxuY29uc3QgYXRXYWxsU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmF0V2FsbC52YWx1ZTtcclxuY29uc3QgYmFsbG9vblN0aWNraW5nVG9TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYmFsbG9vblN0aWNraW5nVG8udmFsdWU7XHJcbmNvbnN0IGJhbGxvb25PblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5iYWxsb29uT24udmFsdWU7XHJcbmNvbnN0IGJhbGxvb25BdFN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5iYWxsb29uQXQudmFsdWU7XHJcbmNvbnN0IGJhbGxvb25Qb3NpdGlvbkF0dHJhY3RpdmVTdGF0ZVBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYmFsbG9vblBvc2l0aW9uQXR0cmFjdGl2ZVN0YXRlUGF0dGVybi52YWx1ZTtcclxuY29uc3QgaW5pdGlhbE1vdmVtZW50UGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5pbml0aWFsTW92ZW1lbnRQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBjb250aW51b3VzTW92ZW1lbnRXaXRoTGFiZWxQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmNvbnRpbnVvdXNNb3ZlbWVudFdpdGhMYWJlbFBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IHR3b0JhbGxvb25Jbml0aWFsTW92ZW1lbnRQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnR3b0JhbGxvb25Jbml0aWFsTW92ZW1lbnRQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCB0d29CYWxsb29uTm9DaGFuZ2VBbmRQb3NpdGlvblBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MudHdvQmFsbG9vbk5vQ2hhbmdlQW5kUG9zaXRpb25QYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCB0d29CYWxsb29uTm93RGlyZWN0aW9uUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy50d29CYWxsb29uTm93RGlyZWN0aW9uUGF0dGVybi52YWx1ZTtcclxuY29uc3QgZXh0cmVtZWx5U2xvd2x5U3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmV4dHJlbWVseVNsb3dseS52YWx1ZTtcclxuY29uc3QgdmVyeVNsb3dseVN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy52ZXJ5U2xvd2x5LnZhbHVlO1xyXG5jb25zdCBzbG93bHlTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Muc2xvd2x5LnZhbHVlO1xyXG5jb25zdCBxdWlja2x5U3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnF1aWNrbHkudmFsdWU7XHJcbmNvbnN0IHZlcnlRdWlja2x5U3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnZlcnlRdWlja2x5LnZhbHVlO1xyXG5jb25zdCB1cERyYWdnaW5nU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnVwRHJhZ2dpbmcudmFsdWU7XHJcbmNvbnN0IGxlZnREcmFnZ2luZ1N0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5sZWZ0RHJhZ2dpbmcudmFsdWU7XHJcbmNvbnN0IGRvd25EcmFnZ2luZ1N0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5kb3duRHJhZ2dpbmcudmFsdWU7XHJcbmNvbnN0IHJpZ2h0RHJhZ2dpbmdTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MucmlnaHREcmFnZ2luZy52YWx1ZTtcclxuY29uc3QgdXBBbmRUb1RoZVJpZ2h0RHJhZ2dpbmdTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MudXBBbmRUb1RoZVJpZ2h0RHJhZ2dpbmcudmFsdWU7XHJcbmNvbnN0IHVwQW5kVG9UaGVMZWZ0RHJhZ2dpbmdTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MudXBBbmRUb1RoZUxlZnREcmFnZ2luZy52YWx1ZTtcclxuY29uc3QgZG93bkFuZFRvVGhlUmlnaHREcmFnZ2luZ1N0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5kb3duQW5kVG9UaGVSaWdodERyYWdnaW5nLnZhbHVlO1xyXG5jb25zdCBkb3duQW5kVG9UaGVMZWZ0RHJhZ2dpbmdTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuZG93bkFuZFRvVGhlTGVmdERyYWdnaW5nLnZhbHVlO1xyXG5jb25zdCB1cFN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy51cC52YWx1ZTtcclxuY29uc3QgbGVmdFN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5sZWZ0LnZhbHVlO1xyXG5jb25zdCBkb3duU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmRvd24udmFsdWU7XHJcbmNvbnN0IHJpZ2h0U3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnJpZ2h0LnZhbHVlO1xyXG5jb25zdCB1cEFuZFRvVGhlUmlnaHRTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MudXBBbmRUb1RoZVJpZ2h0LnZhbHVlO1xyXG5jb25zdCB1cEFuZFRvVGhlTGVmdFN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy51cEFuZFRvVGhlTGVmdC52YWx1ZTtcclxuY29uc3QgZG93bkFuZFRvVGhlUmlnaHRTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuZG93bkFuZFRvVGhlUmlnaHQudmFsdWU7XHJcbmNvbnN0IGRvd25BbmRUb1RoZUxlZnRTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuZG93bkFuZFRvVGhlTGVmdC52YWx1ZTtcclxuY29uc3QgYXRMZWZ0RWRnZVN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5hdExlZnRFZGdlLnZhbHVlO1xyXG5jb25zdCBhdFRvcFN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5hdFRvcC52YWx1ZTtcclxuY29uc3QgYXRCb3R0b21TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYXRCb3R0b20udmFsdWU7XHJcbmNvbnN0IGF0UmlnaHRFZGdlU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmF0UmlnaHRFZGdlLnZhbHVlO1xyXG5jb25zdCBvblN3ZWF0ZXJTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Mub25Td2VhdGVyLnZhbHVlO1xyXG5jb25zdCBvZmZTd2VhdGVyU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLm9mZlN3ZWF0ZXIudmFsdWU7XHJcbmNvbnN0IGJhbGxvb25OZXdSZWdpb25QYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmJhbGxvb25OZXdSZWdpb25QYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBjbG9zZXJUb09iamVjdFBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuY2xvc2VyVG9PYmplY3RQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBzd2VhdGVyU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnN3ZWF0ZXIudmFsdWU7XHJcbmNvbnN0IHdhbGxTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Mud2FsbC52YWx1ZTtcclxuY29uc3QgY2VudGVyT2ZQbGF5QXJlYVN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5jZW50ZXJPZlBsYXlBcmVhLnZhbHVlO1xyXG5jb25zdCByaWdodEVkZ2VPZlBsYXlBcmVhU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnJpZ2h0RWRnZU9mUGxheUFyZWEudmFsdWU7XHJcbmNvbnN0IHRvcEVkZ2VPZlBsYXlBcmVhU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnRvcEVkZ2VPZlBsYXlBcmVhLnZhbHVlO1xyXG5jb25zdCBib3R0b21FZGdlT2ZQbGF5QXJlYVN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5ib3R0b21FZGdlT2ZQbGF5QXJlYS52YWx1ZTtcclxuY29uc3Qgbm9DaGFuZ2VBbmRQb3NpdGlvblBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Mubm9DaGFuZ2VBbmRQb3NpdGlvblBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IG5lYXJTd2VhdGVyU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLm5lYXJTd2VhdGVyLnZhbHVlO1xyXG5jb25zdCBiYWxsb29uTmVhclN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5iYWxsb29uTmVhci52YWx1ZTtcclxuY29uc3QgcG9zaXRpb25BbmRJbmR1Y2VkQ2hhcmdlUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5wb3NpdGlvbkFuZEluZHVjZWRDaGFyZ2VQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBzaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnNpbmdsZVN0YXRlbWVudFBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IGtleWJvYXJkSW50ZXJhY3Rpb25DdWVTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Mua2V5Ym9hcmRJbnRlcmFjdGlvbkN1ZS52YWx1ZTtcclxuY29uc3QgdG91Y2hJbnRlcmFjdGlvbkN1ZVN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy50b3VjaEludGVyYWN0aW9uQ3VlLnZhbHVlO1xyXG5jb25zdCBiYWxsb29uTGFiZWxXaXRoQXR0cmFjdGl2ZVN0YXRlUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5iYWxsb29uTGFiZWxXaXRoQXR0cmFjdGl2ZVN0YXRlUGF0dGVybi52YWx1ZTtcclxuY29uc3QgYmFsbG9vblZlcnlDbG9zZVRvU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmJhbGxvb25WZXJ5Q2xvc2VUby52YWx1ZTtcclxuY29uc3QgY29udGludW91c01vdmVtZW50UGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5jb250aW51b3VzTW92ZW1lbnRQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBjb250aW51b3VzTW92ZW1lbnRXaXRoTGFuZG1hcmtQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmNvbnRpbnVvdXNNb3ZlbWVudFdpdGhMYW5kbWFya1BhdHRlcm4udmFsdWU7XHJcbmNvbnN0IG5vd0RpcmVjdGlvblBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Mubm93RGlyZWN0aW9uUGF0dGVybi52YWx1ZTtcclxuY29uc3QgYmFsbG9vblBvc2l0aW9uTm9DaGFuZ2VQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmJhbGxvb25Qb3NpdGlvbk5vQ2hhbmdlUGF0dGVybi52YWx1ZTtcclxuY29uc3Qgbm9DaGFuZ2VXaXRoSW5kdWNlZENoYXJnZVBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Mubm9DaGFuZ2VXaXRoSW5kdWNlZENoYXJnZVBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IGJhbGxvb25Qb3NpdGlvbk5lYXJPdGhlclBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYmFsbG9vblBvc2l0aW9uTmVhck90aGVyUGF0dGVybi52YWx1ZTtcclxuY29uc3QgZ3JhYmJlZE5vbmVQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmdyYWJiZWROb25lUGF0dGVybi52YWx1ZTtcclxuY29uc3QgZ3JhYmJlZENoYXJnZVBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuZ3JhYmJlZENoYXJnZVBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IGdyYWJiZWRXaXRoT3RoZXJDaGFyZ2VQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmdyYWJiZWRXaXRoT3RoZXJDaGFyZ2VQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBncmFiYmVkV2l0aEhlbHBQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmdyYWJiZWRXaXRoSGVscFBhdHRlcm4udmFsdWU7XHJcblxyXG4vLyBjb25zdGFudHNcclxuLy8gbWFwcyBiYWxsb29uIGRpcmVjdGlvbiB0byBhIGRlc2NyaXB0aW9uIHN0cmluZyB3aGlsZSB0aGUgYmFsbG9vbiBpcyBiZWluZyBkcmFnZ2VkXHJcbmNvbnN0IEJBTExPT05fRElSRUNUSU9OX0RSQUdHSU5HX01BUCA9IHtcclxuICBVUDogdXBEcmFnZ2luZ1N0cmluZyxcclxuICBET1dOOiBkb3duRHJhZ2dpbmdTdHJpbmcsXHJcbiAgTEVGVDogbGVmdERyYWdnaW5nU3RyaW5nLFxyXG4gIFJJR0hUOiByaWdodERyYWdnaW5nU3RyaW5nLFxyXG4gIFVQX1JJR0hUOiB1cEFuZFRvVGhlUmlnaHREcmFnZ2luZ1N0cmluZyxcclxuICBVUF9MRUZUOiB1cEFuZFRvVGhlTGVmdERyYWdnaW5nU3RyaW5nLFxyXG4gIERPV05fUklHSFQ6IGRvd25BbmRUb1RoZVJpZ2h0RHJhZ2dpbmdTdHJpbmcsXHJcbiAgRE9XTl9MRUZUOiBkb3duQW5kVG9UaGVMZWZ0RHJhZ2dpbmdTdHJpbmdcclxufTtcclxuXHJcbi8vIG1hcHMgYmFsbG9vbiBkaXJlY3Rpb24gdG8gYSBkZXNjcmlwdGlvbiBzdHJpbmcgZm9yIHdoaWxlIHRoZSBiYWxsb29uIGlzIHJlbGVhc2VkXHJcbmNvbnN0IEJBTExPT05fRElSRUNUSU9OX1JFTEVBU0VfTUFQID0ge1xyXG4gIFVQOiB1cFN0cmluZyxcclxuICBET1dOOiBkb3duU3RyaW5nLFxyXG4gIExFRlQ6IGxlZnRTdHJpbmcsXHJcbiAgUklHSFQ6IHJpZ2h0U3RyaW5nLFxyXG4gIFVQX1JJR0hUOiB1cEFuZFRvVGhlUmlnaHRTdHJpbmcsXHJcbiAgVVBfTEVGVDogdXBBbmRUb1RoZUxlZnRTdHJpbmcsXHJcbiAgRE9XTl9SSUdIVDogZG93bkFuZFRvVGhlUmlnaHRTdHJpbmcsXHJcbiAgRE9XTl9MRUZUOiBkb3duQW5kVG9UaGVMZWZ0U3RyaW5nXHJcbn07XHJcblxyXG4vLyBtYXhpbXVtIHZlbG9jaXR5IG9mIGEgYmFsbG9vbiBpbW1lZGlhdGVseSBhZnRlciByZWxlYXNlIGluIHRoaXMgc2ltdWxhdGlvbiwgZGV0ZXJtaW5lZCBieSBvYnNlcnZhdGlvblxyXG5jb25zdCBNQVhJTVVNX1ZFTE9DSVRZX09OX1JFTEVBU0UgPSAwLjQ7XHJcblxyXG4vLyBzcGVlZCBvZiB0aGUgYmFsbG9vbiB0byBiZSBjb25zaWRlcmVkIG1vdmluZyBzbG93bHksIGRldGVybWluZWQgZW1waXJpY2FsbHkgc28gdGhhdCBkZXNjcmlwdGlvbnMgc291bmQgbmljZVxyXG5jb25zdCBTTE9XX0JBTExPT05fU1BFRUQgPSAwLjA5O1xyXG5cclxuLy8gbWFwcyBtYWduaXR1ZGUgb2YgdmVsb2NpdHkgdG8gdGhlIGRlc2NyaXB0aW9uXHJcbmNvbnN0IEJBTExPT05fVkVMT0NJVFlfTUFQID0ge1xyXG4gIEVYVFJFTUVMWV9TTE9XTFlfUkFOR0U6IHtcclxuICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIE1BWElNVU1fVkVMT0NJVFlfT05fUkVMRUFTRSAvIDIwMCApLFxyXG4gICAgZGVzY3JpcHRpb246IGV4dHJlbWVseVNsb3dseVN0cmluZ1xyXG4gIH0sXHJcbiAgVkVSWV9TTE9XTFlfUkFOR0U6IHtcclxuICAgIHJhbmdlOiBuZXcgUmFuZ2UoIE1BWElNVU1fVkVMT0NJVFlfT05fUkVMRUFTRSAvIDIwMCwgTUFYSU1VTV9WRUxPQ0lUWV9PTl9SRUxFQVNFIC8gMTAwICksXHJcbiAgICBkZXNjcmlwdGlvbjogdmVyeVNsb3dseVN0cmluZ1xyXG4gIH0sXHJcbiAgU0xPV0xZX1JBTkdFOiB7XHJcbiAgICByYW5nZTogbmV3IFJhbmdlKCBNQVhJTVVNX1ZFTE9DSVRZX09OX1JFTEVBU0UgLyAxMDAsIE1BWElNVU1fVkVMT0NJVFlfT05fUkVMRUFTRSAvIDUwICksXHJcbiAgICBkZXNjcmlwdGlvbjogc2xvd2x5U3RyaW5nXHJcbiAgfSxcclxuICBRVUlDS0xZX1JBTkdFOiB7XHJcbiAgICByYW5nZTogbmV3IFJhbmdlKCBNQVhJTVVNX1ZFTE9DSVRZX09OX1JFTEVBU0UgLyA1MCwgTUFYSU1VTV9WRUxPQ0lUWV9PTl9SRUxFQVNFIC8gNCApLFxyXG4gICAgZGVzY3JpcHRpb246IHF1aWNrbHlTdHJpbmdcclxuICB9LFxyXG4gIFZFUllfUVVJQ0tMWV9SQU5HRToge1xyXG4gICAgcmFuZ2U6IG5ldyBSYW5nZSggTUFYSU1VTV9WRUxPQ0lUWV9PTl9SRUxFQVNFIC8gNCwgTnVtYmVyLk1BWF9WQUxVRSApLFxyXG4gICAgZGVzY3JpcHRpb246IHZlcnlRdWlja2x5U3RyaW5nXHJcbiAgfVxyXG59O1xyXG5cclxuY2xhc3MgQmFsbG9vblBvc2l0aW9uRGVzY3JpYmVyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtCYWxsb29uRGVzY3JpYmVyfSBiYWxsb29uRGVzY3JpYmVyIC0gbWFuYWdlcyBhbGwgYmFsbG9vbiBkZXNjcmlwdGlvbnNcclxuICAgKiBAcGFyYW0ge0JBU0VNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge0JhbGxvb25Nb2RlbH0gYmFsbG9vbk1vZGVsXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFjY2Vzc2libGVOYW1lIC0gYWNjZXNzaWJsZSBuYW1lIGZvciB0aGlzIGJhbGxvb24gYmVpbmcgZGVzY3JpYmVkXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG90aGVyQWNjZXNzaWJsZU5hbWUgLSByZWZlcmVuY2UgdG8gdGhlIG90aGVyIGJhbGxvb24gYmVpbmcgZGVzY3JpYmVkXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGJhbGxvb25EZXNjcmliZXIsIG1vZGVsLCBiYWxsb29uTW9kZWwsIGFjY2Vzc2libGVOYW1lLCBvdGhlckFjY2Vzc2libGVOYW1lICkge1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gZm9yIHVzZSBpbiBpbnN0YW5jZSBmdW5jdGlvbnNcclxuICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuICAgIHRoaXMud2FsbCA9IG1vZGVsLndhbGw7XHJcbiAgICB0aGlzLmJhbGxvb25Nb2RlbCA9IGJhbGxvb25Nb2RlbDtcclxuICAgIHRoaXMuYmFsbG9vbkRlc2NyaWJlciA9IGJhbGxvb25EZXNjcmliZXI7XHJcbiAgICB0aGlzLmFjY2Vzc2libGVOYW1lID0gYWNjZXNzaWJsZU5hbWU7XHJcbiAgICB0aGlzLm90aGVyQWNjZXNzaWJsZU5hbWUgPSBvdGhlckFjY2Vzc2libGVOYW1lO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGRlc2NyaXB0aW9uIHRoYXQgZGVzY3JpYmVzIHRoZSBhdHRyYWN0aXZlIHN0YXRlIG9yIHByb3hpbWl0eSBvZiB0aGUgYmFsbG9vbiwgc3VjaCBhc1xyXG4gICAqIFwiT24uLi5cIiwgXCJzdGlja2luZyB0by4uLlwiLCBcIk5lYXIuLi5cIiBhbmQgc28gb24uXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0QXR0cmFjdGl2ZVN0YXRlT3JQcm94aW1pdHlEZXNjcmlwdGlvbigpIHtcclxuICAgIGxldCBzdHJpbmcgPSAnJztcclxuXHJcbiAgICBpZiAoIHRoaXMuYmFsbG9vbk1vZGVsLm9uU3dlYXRlcigpICkge1xyXG4gICAgICBpZiAoICF0aGlzLmJhbGxvb25Nb2RlbC5pc0RyYWdnZWRQcm9wZXJ0eS5nZXQoKSAmJiBNYXRoLmFicyggdGhpcy5iYWxsb29uTW9kZWwuY2hhcmdlUHJvcGVydHkuZ2V0KCkgKSA+IDAgKSB7XHJcblxyXG4gICAgICAgIC8vIGhhcyBjaGFyZ2VkIGFuZCBub3QgZHJhZ2dpbmcsIGJhbGxvb24gaXMgc3RpY2tpbmcgdG8gdGhlIG9iamVjdFxyXG4gICAgICAgIHN0cmluZyA9IGJhbGxvb25TdGlja2luZ1RvU3RyaW5nO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHN0cmluZyA9IGJhbGxvb25PblN0cmluZztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHN0cmluZyA9IHRoaXMuZ2V0UHJlcG9zaXRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc3RyaW5nO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSAnbmVhcicgb3IgJ29uJyBvciAnQXQnIGRlc2NyaXB0aW9uIGZvciB0aGUgYmFsbG9vbiwgZGVwZW5kaW5nIG9uIHdoZXJlIHRoZSBiYWxsb29uIGlzLlxyXG4gICAqIFRoaXMgaXMgdXNlZCBhcyBwYXJ0IG9mIHRoZSBiYWxsb29uIHBvc2l0aW9uIGRlc2NyaXB0aW9uLCBhbmQgY2hhbmdlcyBkZXBlbmRpbmcgb24gaW50ZXJhY3Rpb25cclxuICAgKiBvciBwb3NpdGlvbiBvZiBiYWxsb29uLlxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyBmdW5jdGlvbiBpcyB1bmRvdWJ0ZWRseSBob3JyaWJsZSBmb3IgaTE4bi5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRQcmVwb3NpdGlvbigpIHtcclxuICAgIGxldCBzdHJpbmcgPSAnJztcclxuXHJcbiAgICBjb25zdCB3YWxsVmlzaWJsZSA9IHRoaXMud2FsbC5pc1Zpc2libGVQcm9wZXJ0eS5nZXQoKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuYmFsbG9vbk1vZGVsLm5lYXJXYWxsKCkgJiYgd2FsbFZpc2libGUgKSB7XHJcblxyXG4gICAgICBpZiAoIHdhbGxWaXNpYmxlICkge1xyXG4gICAgICAgIHN0cmluZyA9IGJhbGxvb25OZWFyU3RyaW5nO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHN0cmluZyA9IGJhbGxvb25PblN0cmluZztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuYmFsbG9vbk1vZGVsLm5lYXJTd2VhdGVyKCkgKSB7XHJcbiAgICAgIHN0cmluZyA9IGJhbGxvb25OZWFyU3RyaW5nO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuYmFsbG9vbk1vZGVsLm5lYXJSaWdodEVkZ2UoKSApIHtcclxuICAgICAgc3RyaW5nID0gYmFsbG9vbk5lYXJTdHJpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5iYWxsb29uTW9kZWwudmVyeUNsb3NlVG9PYmplY3QoKSApIHtcclxuICAgICAgc3RyaW5nID0gYmFsbG9vblZlcnlDbG9zZVRvU3RyaW5nO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuYmFsbG9vbk1vZGVsLnRvdWNoaW5nV2FsbCgpIHx8IHRoaXMuYmFsbG9vbk1vZGVsLmluQ2VudGVyUGxheUFyZWEoKSB8fCB0aGlzLmJhbGxvb25Nb2RlbC5hdExlZnRFZGdlKCkgKSB7XHJcbiAgICAgIHN0cmluZyA9IGJhbGxvb25BdFN0cmluZztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBzdHJpbmcgPSBiYWxsb29uT25TdHJpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHN0cmluZztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzdHJpbmcgdGhhdCBjb21iaW5lcyB0aGUgYmFsbG9vbidzIGF0dHJhY3RpdmUgc3RhdGUgYW5kIHBvc2l0aW9uIGRlc2NyaXB0aW9ucy4gU29tZXRoaW5nXHJcbiAgICogbGlrZSBcIk9uIGNlbnRlciBvZiBwbGF5IGFyZWFcIiBvciBcIlN0aWNraW5nIHRvIHdhbGxcIi4gVGhpcyBmcmFnbWVudCBpcyB1c2VkIGluIGEgbnVtYmVyIG9mIGRpZmZlcmVudFxyXG4gICAqIGNvbnRleHRzLCBzbyBpdCBkb2Vzbid0IGluY2x1ZGUgcHVuY3R1YXRpb24gYXQgdGhlIGVuZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldEF0dHJhY3RpdmVTdGF0ZUFuZFBvc2l0aW9uRGVzY3JpcHRpb24oKSB7XHJcbiAgICBjb25zdCBwb3NpdGlvbkRlc2NyaXB0aW9uU3RyaW5nID0gdGhpcy5nZXRCYWxsb29uUG9zaXRpb25EZXNjcmlwdGlvbigpO1xyXG5cclxuICAgIGNvbnN0IGF0dHJhY3RpdmVTdGF0ZURlc2NyaXB0aW9uU3RyaW5nID0gdGhpcy5nZXRBdHRyYWN0aXZlU3RhdGVPclByb3hpbWl0eURlc2NyaXB0aW9uKCk7XHJcbiAgICBjb25zdCBhdHRyYWN0aXZlU3RhdGVBbmRQb3NpdGlvblN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggYmFsbG9vblBvc2l0aW9uQXR0cmFjdGl2ZVN0YXRlUGF0dGVyblN0cmluZywge1xyXG4gICAgICBhdHRyYWN0aXZlU3RhdGU6IGF0dHJhY3RpdmVTdGF0ZURlc2NyaXB0aW9uU3RyaW5nLFxyXG4gICAgICBwb3NpdGlvbjogcG9zaXRpb25EZXNjcmlwdGlvblN0cmluZ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBhdHRyYWN0aXZlU3RhdGVBbmRQb3NpdGlvblN0cmluZztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGRlc2NyaXB0aW9uIGFib3V0IGhvdyB0aGUgYmFsbG9vbiBpcyBzdGlja2luZyB0byBhbiBvYmplY3Qgd2l0aCBhIGxhYmVsLiBUaGlzIHdpbGwgZm9ybSBhIGZ1bGwgc2VudGVuY2UuXHJcbiAgICogUmV0dXJucyBzb21ldGhpbmcgbGlrZTpcclxuICAgKiBZZWxsb3cgYmFsbG9vbiwgc3RpY2tpbmcgdG8gcmlnaHQgYXJtIG9mIHN3ZWF0ZXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRBdHRyYWN0aXZlU3RhdGVBbmRQb3NpdGlvbkRlc2NyaXB0aW9uV2l0aExhYmVsKCkge1xyXG5cclxuICAgIC8vIHRvIGxvd2VyIGNhc2Ugc2luY2UgaXQgaXMgdXNlZCBlbHNld2hlcmUgaW4gdGhlIHN0cmluZ1xyXG4gICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmdldEF0dHJhY3RpdmVTdGF0ZUFuZFBvc2l0aW9uRGVzY3JpcHRpb24oKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgY29uc3QgYWxlcnQgPSBTdHJpbmdVdGlscy5maWxsSW4oIGJhbGxvb25MYWJlbFdpdGhBdHRyYWN0aXZlU3RhdGVQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIGJhbGxvb25MYWJlbDogdGhpcy5hY2Nlc3NpYmxlTmFtZSxcclxuICAgICAgYXR0cmFjdGl2ZVN0YXRlQW5kUG9zaXRpb246IHBvc2l0aW9uXHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggc2luZ2xlU3RhdGVtZW50UGF0dGVyblN0cmluZywge1xyXG4gICAgICBzdGF0ZW1lbnQ6IGFsZXJ0XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBkZXNjcmlwdGlvbiBvZiB0aGUgYmFsbG9vbiBiZWluZyBcIm9uXCIgYW4gaXRlbSBpbiB0aGUgcGxheSBhcmVhLiBJbnN0ZWFkIG9mIGdldHRpbmdcclxuICAgKiB0aGUgYXR0cmFjdGl2ZSBzdGF0ZSBvZiB0aGUgYmFsbG9vbiAobGlrZSAndG91Y2hpbmcnIG9yICdzdGlja2luZycgb3IgJ25lYXInKSwgc2ltcGx5IHNheVxyXG4gICAqICdvbicgd2hlcmV2ZXIgdGhlIGJhbGxvb24gaXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRPblBvc2l0aW9uRGVzY3JpcHRpb24oKSB7XHJcblxyXG4gICAgY29uc3QgcG9zaXRpb25EZXNjcmlwdGlvbiA9IHRoaXMuZ2V0QmFsbG9vblBvc2l0aW9uRGVzY3JpcHRpb24oKTtcclxuXHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBiYWxsb29uUG9zaXRpb25BdHRyYWN0aXZlU3RhdGVQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIGF0dHJhY3RpdmVTdGF0ZTogdGhpcy5nZXRQcmVwb3NpdGlvbigpLFxyXG4gICAgICBwb3NpdGlvbjogcG9zaXRpb25EZXNjcmlwdGlvblxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJuIGEgcGhyYXNlIGRlc2NyaWJpbmcgdGhlIHBvc2l0aW9uIG9mIHRoZSBiYWxsb29uIGluIHRoZSBwbGF5IGFyZWEuICBUaGlzIGlzIHVzdWFsbHkgZGVzY3JpYmVkIHJlbGF0aXZlXHJcbiAgICogdG8gdGhlIGNlbnRlciBvZiB0aGUgYmFsbG9vbiwgdW5sZXNzIHRoZSBiYWxsb29uIGlzIHRvdWNoaW5nIGFuIG9iamVjdCwgaW4gd2hpY2ggY2FzZSBpdCB3aWxsIGJlIHJlbGF0aXZlIHRvIHRoZVxyXG4gICAqIHBvaW50IHdoZXJlIHRoZSBvYmplY3RzIGFyZSB0b3VjaGluZy4gIElmIHRoZSBiYWxsb29ucyBhcmUgYm90aCB2aXNpYmxlIGFuZCBuZXh0IHRvIGVhY2ggb3RoZXIsIGEgcGhyYXNlIGxpa2VcclxuICAgKiBcIm5leHQgdG8ge3tiYWxsb29uIGxhYmVsfX1cIiBpcyBhZGRlZC4gV2lsbCByZXR1cm4gc29tZXRpbmcgbGlrZVxyXG4gICAqXHJcbiAgICogXCJjZW50ZXIgb2YgcGxheSBhcmVhXCIgb3JcclxuICAgKiBcInVwcGVyIHdhbGxcIiwgb3JcclxuICAgKiBcIndhbGwsIG5leHQgdG8gR3JlZW4gQmFsbG9vblwiLCBvclxyXG4gICAqIFwicmlnaHQgYXJtIG9mIHN3ZWF0ZXIsIG5leHQgdG8gWWVsbG93IEJhbGxvb25cIlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0QmFsbG9vblBvc2l0aW9uRGVzY3JpcHRpb24oKSB7XHJcbiAgICBsZXQgZGVzY3JpcHRpb24gPSB0aGlzLmdldFBvc2l0aW9uRGVzY3JpcHRpb25XaXRob3V0T3ZlcmxhcCgpO1xyXG5cclxuICAgIC8vIGluY2x1ZGUgaW5mb3JtYXRpb24gYWJvdXQgaG93IGJhbGxvb25zIGFyZSBhZGphY2VudCBpZiBuZWNlc3NhcnlcclxuICAgIGlmICggdGhpcy5tb2RlbC5nZXRCYWxsb29uc0FkamFjZW50KCkgKSB7XHJcbiAgICAgIGRlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBiYWxsb29uUG9zaXRpb25OZWFyT3RoZXJQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgcG9zaXRpb246IGRlc2NyaXB0aW9uLFxyXG4gICAgICAgIG90aGVyQmFsbG9vbjogdGhpcy5vdGhlckFjY2Vzc2libGVOYW1lXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVzY3JpcHRpb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGRlc2NyaXB0aW9uIGZvciB0aGUgcG9zaXRpb24gb2YgdGhlIGJhbGxvb24sIHdpdGhvdXQgdGhlIGV4dHJhIHBocmFzZSBcIm5leHQgdG8ge3tvdGhlcn19IGJhbGxvb25cIiBpblxyXG4gICAqIHRoZSBjYXNlIHRoYXQgdGhlIHR3byBiYWxsb29ucyBhcmUgYWRqYWNlbnQvb3ZlcmxhcC4gV2lsbCByZXR1cm4gc29tZXRoaW5nIGxpa2VcclxuICAgKiBcImNlbnRlciBvZiBwbGF5IGFyZWFcIiBvclxyXG4gICAqIFwidXBwZXIgd2FsbFwiIG9yXHJcbiAgICpcclxuICAgKiBhbnkgb2YgdGhlIG90aGVyIHBvc2l0aW9uIGRlc2NyaXB0aW9ucyBmb3IgdGhlIFBsYXlBcmVhTWFwLlxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0UG9zaXRpb25EZXNjcmlwdGlvbldpdGhvdXRPdmVybGFwKCkge1xyXG4gICAgY29uc3QgZGVzY3JpYmVkQmFsbG9vblBvc2l0aW9uID0gdGhpcy5nZXREZXNjcmliZWRQb2ludCgpO1xyXG4gICAgY29uc3Qgd2FsbFZpc2libGUgPSB0aGlzLndhbGwuaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCk7XHJcbiAgICByZXR1cm4gQkFTRURlc2NyaWJlci5nZXRQb3NpdGlvbkRlc2NyaXB0aW9uKCBkZXNjcmliZWRCYWxsb29uUG9zaXRpb24sIHdhbGxWaXNpYmxlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHBvaW50IG9uIHRoZSBiYWxsb29uIHRoYXQgc2hvdWxkIGJlIGRlc2NyaWJlZC4gR2VuZXJhbGx5LCB0aGlzIGlzIHRoZSBiYWxsb29uIGNlbnRlci4gIElmIHRoZSBiYWxsb29uXHJcbiAgICogaXMgdG91Y2hpbmcgdGhlIHN3ZWF0ZXIgb3IgdGhlIHdhbGwsIHRoZSBwb2ludCBvZiB0b3VjaGluZyBzaG91bGQgYmUgZGVzY3JpYmVkLiAgSWYgbmVhciB0aGUgd2FsbCwgdGhlIGRlc2NyaWJlZFxyXG4gICAqIHBvaW50IGlzIHRoZSBlZGdlIG9mIHRoZSB3YWxsIHRvIGFjY29tcGxpc2ggYSBkZXNjcmlwdGlvbiBsaWtlIFwiWWVsbG93IGJhbGxvb24sIE5lYXIgdXBwZXIgd2FsbFwiLlxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIGdldERlc2NyaWJlZFBvaW50KCkge1xyXG4gICAgbGV0IGRlc2NyaWJlZEJhbGxvb25Qb3NpdGlvbjtcclxuXHJcbiAgICBpZiAoIHRoaXMuYmFsbG9vbk1vZGVsLm9uU3dlYXRlcigpICkge1xyXG4gICAgICBkZXNjcmliZWRCYWxsb29uUG9zaXRpb24gPSB0aGlzLmJhbGxvb25Nb2RlbC5nZXRTd2VhdGVyVG91Y2hpbmdDZW50ZXIoKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBkZXNjcmliZWRCYWxsb29uUG9zaXRpb24gPSB0aGlzLmJhbGxvb25Nb2RlbC5nZXRDZW50ZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVzY3JpYmVkQmFsbG9vblBvc2l0aW9uO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIHNob3J0IGRlc2NyaXB0aW9uIG9mIHRoZSBiYWxsb29uJ3MgcG9zaXRpb24gYXQgYSBib3VuZGFyeSB3aGVuIHRoZXJlIGlzIGFuIGF0dGVtcHRlZCBkcmFnIGJleW9uZFxyXG4gICAqIHRoZSBib3VuZGFyeS4gIFdpbGwgcmV0dXJuIHNvbWV0aGluZyBsaWtlIFwiQXQgYm90dG9tXCIgb3IgXCJBdCB0b3BcIi5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0VG91Y2hpbmdCb3VuZGFyeURlc2NyaXB0aW9uKCBhdHRlbXB0ZWREaXJlY3Rpb24gKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmJhbGxvb25Nb2RlbC5pc1RvdWNoaW5nQm91bmRhcnkoKSwgJ2JhbGxvb24gaXMgbm90IHRvdWNoaW5nIGEgYm91bmRhcnknICk7XHJcblxyXG4gICAgbGV0IGJvdW5kYXJ5U3RyaW5nO1xyXG4gICAgaWYgKCB0aGlzLmJhbGxvb25Nb2RlbC5pc1RvdWNoaW5nQm90dG9tQm91bmRhcnkoKSAmJiBhdHRlbXB0ZWREaXJlY3Rpb24gPT09IEJhbGxvb25EaXJlY3Rpb25FbnVtLkRPV04gKSB7XHJcbiAgICAgIGJvdW5kYXJ5U3RyaW5nID0gYXRCb3R0b21TdHJpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5iYWxsb29uTW9kZWwuaXNUb3VjaGluZ0xlZnRCb3VuZGFyeSgpICYmIGF0dGVtcHRlZERpcmVjdGlvbiA9PT0gQmFsbG9vbkRpcmVjdGlvbkVudW0uTEVGVCApIHtcclxuICAgICAgYm91bmRhcnlTdHJpbmcgPSBhdExlZnRFZGdlU3RyaW5nO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuYmFsbG9vbk1vZGVsLnRvdWNoaW5nV2FsbCgpICYmIGF0dGVtcHRlZERpcmVjdGlvbiA9PT0gQmFsbG9vbkRpcmVjdGlvbkVudW0uUklHSFQgKSB7XHJcbiAgICAgIGJvdW5kYXJ5U3RyaW5nID0gYXRXYWxsU3RyaW5nO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuYmFsbG9vbk1vZGVsLmlzVG91Y2hpbmdSaWdodEVkZ2UoKSAmJiBhdHRlbXB0ZWREaXJlY3Rpb24gPT09IEJhbGxvb25EaXJlY3Rpb25FbnVtLlJJR0hUICkge1xyXG4gICAgICBib3VuZGFyeVN0cmluZyA9IGF0UmlnaHRFZGdlU3RyaW5nO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuYmFsbG9vbk1vZGVsLmlzVG91Y2hpbmdUb3BCb3VuZGFyeSgpICYmIGF0dGVtcHRlZERpcmVjdGlvbiA9PT0gQmFsbG9vbkRpcmVjdGlvbkVudW0uVVAgKSB7XHJcbiAgICAgIGJvdW5kYXJ5U3RyaW5nID0gYXRUb3BTdHJpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYm91bmRhcnlTdHJpbmcsICdObyBib3VuZGFyeSBzdHJpbmcgZm91bmQgZm9yIGJhbGxvb24uJyApO1xyXG4gICAgcmV0dXJuIGJvdW5kYXJ5U3RyaW5nO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGFuIGFsZXJ0IHRoYXQgbm90aWZpZXMgYmFsbG9vbiBoYXMgZW50ZXJlZCBvciBsZWZ0IHRoZSBzd2VhdGVyLiBJZiBiYWxsb29uIGlzIGFkamFjZW50IHRvIG90aGVyIGJhbGxvb24sXHJcbiAgICogdGhpcyBpbmZvcm1hdGlvbiBpcyBpbmNsdWRlZCBpbiB0aGUgYWxlcnQuIFdpbGwgcmV0dXJuIHNvbWV0aGluZyBsaWtlXHJcbiAgICogXCJPbiBTd2VhdGVyLlwiXHJcbiAgICogXCJPbiBzd2VhdGVyLCBuZXh0IHRvIGdyZWVuIGJhbGxvb25cIlxyXG4gICAqIFwiT2ZmIHN3ZWF0ZXJcIlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBvblN3ZWF0ZXJcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldE9uU3dlYXRlclN0cmluZyggb25Td2VhdGVyICkge1xyXG4gICAgbGV0IGRlc2NyaXB0aW9uO1xyXG5cclxuICAgIGlmICggb25Td2VhdGVyICkge1xyXG4gICAgICBkZXNjcmlwdGlvbiA9IG9uU3dlYXRlclN0cmluZztcclxuXHJcbiAgICAgIGlmICggdGhpcy5tb2RlbC5nZXRCYWxsb29uc0FkamFjZW50KCkgKSB7XHJcbiAgICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIGJhbGxvb25Qb3NpdGlvbk5lYXJPdGhlclBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICAgIHBvc2l0aW9uOiBkZXNjcmlwdGlvbixcclxuICAgICAgICAgIG90aGVyQmFsbG9vbjogdGhpcy5vdGhlckFjY2Vzc2libGVOYW1lXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBhZGQgcHVuY3R1YXRpb25cclxuICAgICAgICBkZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc2luZ2xlU3RhdGVtZW50UGF0dGVyblN0cmluZywge1xyXG4gICAgICAgICAgc3RhdGVtZW50OiBkZXNjcmlwdGlvblxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGRlc2NyaXB0aW9uID0gb2ZmU3dlYXRlclN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVzY3JpcHRpb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBkZXNjcmlwdGlvbiBvZiB0aGUgYmFsbG9vbidzIGRyYWdnaW5nIG1vdmVtZW50IHdoZW4gaXQgZW50ZXJzIGEgbGFuZG1hcmsuIERlcGVuZGVudCBvbiBiYWxsb29uIHZlbG9jaXR5LFxyXG4gICAqIGRyYWcgdmVsb2NpdHksIGFuZCBtb3ZlbWVudCBkaXJlY3Rpb24uIERlcGVuZGluZyBvbiB0aGVzZSB2YXJpYWJsZXMsIHdlIG1pZ2h0IG5vdCBhbm5vdW5jZSB0aGlzIGFsZXJ0LCBzb1xyXG4gICAqIHRoaXMgZnVuY3Rpb24gY2FuIHJldHVybiBudWxsLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd8bnVsbH1cclxuICAgKi9cclxuICBnZXRMYW5kbWFya0RyYWdEZXNjcmlwdGlvbigpIHtcclxuICAgIGNvbnN0IHBsYXlBcmVhTGFuZG1hcmsgPSB0aGlzLmJhbGxvb25Nb2RlbC5wbGF5QXJlYUxhbmRtYXJrUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCBkcmFnU3BlZWQgPSB0aGlzLmJhbGxvb25Nb2RlbC5kcmFnVmVsb2NpdHlQcm9wZXJ0eS5nZXQoKS5tYWduaXR1ZGU7XHJcbiAgICBsZXQgYWxlcnQgPSB0aGlzLmdldEF0dHJhY3RpdmVTdGF0ZUFuZFBvc2l0aW9uRGVzY3JpcHRpb24oKTtcclxuXHJcbiAgICAvLyB3cmFwIGFzIGEgc2luZ2xlIHN0YXRlbWVudCB3aXRoIHB1bmN0dWF0aW9uXHJcbiAgICBhbGVydCA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc2luZ2xlU3RhdGVtZW50UGF0dGVyblN0cmluZywgeyBzdGF0ZW1lbnQ6IGFsZXJ0IH0gKTtcclxuXHJcbiAgICAvLyBjYXNlcyB3aGVyZSB3ZSBkbyBub3Qgd2FudCB0byBhbm5vdW5jZSB0aGUgYWxlcnRcclxuICAgIGlmICggdGhpcy5iYWxsb29uTW9kZWwubW92aW5nUmlnaHQoKSAmJiBwbGF5QXJlYUxhbmRtYXJrID09PSAnQVRfTkVBUl9TV0VBVEVSJyApIHtcclxuXHJcbiAgICAgIC8vIGlmIG1vdmluZyB0byB0aGUgcmlnaHQgYW5kIHdlIGVudGVyIHRoZSAnbmVhciBzd2VhdGVyJyBsYW5kbWFyaywgaWdub3JlXHJcbiAgICAgIGFsZXJ0ID0gbnVsbDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBwbGF5QXJlYUxhbmRtYXJrID09PSAnQVRfVkVSWV9DTE9TRV9UT19XQUxMJyB8fCBwbGF5QXJlYUxhbmRtYXJrID09PSAnQVRfVkVSWV9DTE9TRV9UT19SSUdIVF9FREdFJyApIHtcclxuXHJcbiAgICAgIC8vIG9ubHkgYW5ub3VuY2UgdGhhdCB3ZSBhcmUgdmVyeSBjbG9zZSB0byB0aGUgd2FsbCB3aGVuIG1vdmluZyBzbG93bHkgYW5kIHdoZW4gdGhlIHdhbGwgaXMgdmlzaWJsZVxyXG4gICAgICBpZiAoIGRyYWdTcGVlZCA+IFNMT1dfQkFMTE9PTl9TUEVFRCApIHtcclxuICAgICAgICBhbGVydCA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYWxlcnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYW4gYWxlcnQgdGhhdCBkZXNjcmliZXMgcHJvZ3Jlc3Mgb2YgYmFsbG9vbiBtb3ZlbWVudCB0aHJvdWdoIGEgc2luZ2xlIGNlbGwgaW4gdGhlIHBsYXkgYXJlYS4gVGhpcyBpbmZvcm1hdGlvblxyXG4gICAqIHdpbGwgb25seSBiZSBwcm92aWRlZCB0byBhIGtleWJvYXJkIHVzZXIuXHJcbiAgICpcclxuICAgKiBXaWxsICBiZSBzb21ldGhpbmcgbGlrZTpcclxuICAgKiBcIkF0IGNlbnRlciBvZiBwbGF5IGFyZWEuXCIgb3JcclxuICAgKiBcIkNsb3NlciB0byBzd2VhdGVyLlwiXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldEtleWJvYXJkTW92ZW1lbnRBbGVydCgpIHtcclxuICAgIGxldCBhbGVydDtcclxuXHJcbiAgICAvLyBwZXJjZW50IG9mIHByb2dyZXNzIHRocm91Z2ggdGhlIHJlZ2lvblxyXG4gICAgY29uc3QgcHJvZ3Jlc3NUaHJvdWdoQ2VsbCA9IHRoaXMuYmFsbG9vbk1vZGVsLmdldFByb2dyZXNzVGhyb3VnaFJlZ2lvbigpO1xyXG4gICAgY29uc3QgZHJhZ1ZlbG9jaXR5ID0gdGhpcy5iYWxsb29uTW9kZWwuZHJhZ1ZlbG9jaXR5UHJvcGVydHkuZ2V0KCkubWFnbml0dWRlO1xyXG4gICAgY29uc3QgbW92aW5nRGlhZ29uYWxseSA9IHRoaXMuYmFsbG9vbk1vZGVsLm1vdmluZ0RpYWdvbmFsbHkoKTtcclxuXHJcbiAgICBpZiAoIGRyYWdWZWxvY2l0eSA+IFNMT1dfQkFMTE9PTl9TUEVFRCAmJiBwcm9ncmVzc1Rocm91Z2hDZWxsID49IDAuNjYgJiYgIW1vdmluZ0RpYWdvbmFsbHkgKSB7XHJcblxyXG4gICAgICAvLyBpZiBkcmFnIHZlbG9jaXR5IGZhc3QgYW5kIHByb2dyZXNzIHRocm91Z2ggdGhlIGNlbGwgaXMgZ3JlYXRlciB0aGFuIDYwJSwgYW5ub3VuY2UgcHJvZ3Jlc3MgdG93YXJkcyBkZXN0aW5hdGlvblxyXG4gICAgICBhbGVydCA9IHRoaXMuZ2V0UGxheUFyZWFEcmFnUHJvZ3Jlc3NEZXNjcmlwdGlvbigpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGRyYWdWZWxvY2l0eSA8IFNMT1dfQkFMTE9PTl9TUEVFRCAmJiBwcm9ncmVzc1Rocm91Z2hDZWxsID49IDAuNSAmJiAhbW92aW5nRGlhZ29uYWxseSApIHtcclxuXHJcbiAgICAgIC8vIHdoZW4gZHJhZyB2ZWxvY2l0eSBzbG93IGFuZCBwcm9ncmVzcyB0aHJvdWdoIGNlbGwgZ3JlYXRlciB0aGFuIDAuNSwgYW5ub3VuY2UgcHJvZ3Jlc3MgdG93YXJkcyBkZXN0aW5hdGlvblxyXG4gICAgICBhbGVydCA9IHRoaXMuZ2V0UGxheUFyZWFEcmFnUHJvZ3Jlc3NEZXNjcmlwdGlvbigpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBqdXN0IGFubm91bmNlIHRoZSBjdXJyZW50IHBvc2l0aW9uIGluIHRoZSBwbGF5IGFyZWFcclxuICAgICAgYWxlcnQgPSB0aGlzLmdldEF0dHJhY3RpdmVTdGF0ZUFuZFBvc2l0aW9uRGVzY3JpcHRpb24oKTtcclxuICAgICAgYWxlcnQgPSBTdHJpbmdVdGlscy5maWxsSW4oIHNpbmdsZVN0YXRlbWVudFBhdHRlcm5TdHJpbmcsIHsgc3RhdGVtZW50OiBhbGVydCB9ICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYWxlcnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZW5lcmFsbHkgYW5ub3VuY2VkIHJpZ2h0IGFmdGVyIHRoZSBiYWxsb29uIGFzIGJlZW4gcmVsZWFzZWQsIHRoaXMgaXMgcmVhZCBhcyBhbiBhbGVydC4gRGVwZW5kZW50IG9uIHdoZXRoZXJcclxuICAgKiBib3RoIGJhbGxvb25zIGFyZSB2aXNpYmxlLiBJZiB0aGV5IGFyZSwgdGhlIGxhYmVsIG9mIHRoZSByZWxlYXNlZCBiYWxsb29uIGlzIHJlYWQgcHJpb3IgdG8gdGhlIHJlc3Qgb2YgdGhlXHJcbiAgICogYWxlcnQuIFdpbGwgZ2VuZXJhdGUgc29tZXRoaW5nIGxpa2VcclxuICAgKlxyXG4gICAqIFwiTW92ZXMgZXh0cmVtZWx5IHNsb3dseSBsZWZ0LlwiIG9yXHJcbiAgICogXCJZZWxsb3cgYmFsbG9vbiwgbW92ZXMgc2xvd2x5IGxlZnQuXCJcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9zaXRpb24gLSB0aGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgYmFsbG9vblxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gb2xkUG9zaXRpb24gLSB0aGUgcHJldmlvdXMgcG9zaXRpb24gb2YgdGhlIGJhbGxvb25cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldEluaXRpYWxSZWxlYXNlRGVzY3JpcHRpb24oIHBvc2l0aW9uLCBvbGRQb3NpdGlvbiApIHtcclxuXHJcbiAgICAvLyB0aGUgYmFsbG9vbiBpcyBtb3Zpbmcgd2l0aCBzb21lIGluaXRpYWwgdmVsb2NpdHksIGRlc2NyaWJlIHRoYXRcclxuICAgIGNvbnN0IHZlbG9jaXR5U3RyaW5nID0gdGhpcy5nZXRWZWxvY2l0eVN0cmluZygpO1xyXG4gICAgY29uc3QgZGlyZWN0aW9uU3RyaW5nID0gdGhpcy5nZXRSZWxlYXNlRGlyZWN0aW9uRGVzY3JpcHRpb24oIHRoaXMuYmFsbG9vbk1vZGVsLmRpcmVjdGlvblByb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgbGV0IGRlc2NyaXB0aW9uO1xyXG4gICAgaWYgKCB0aGlzLm1vZGVsLmJvdGhCYWxsb29uc1Zpc2libGUoKSApIHtcclxuICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIHR3b0JhbGxvb25Jbml0aWFsTW92ZW1lbnRQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgYmFsbG9vbjogdGhpcy5hY2Nlc3NpYmxlTmFtZSxcclxuICAgICAgICB2ZWxvY2l0eTogdmVsb2NpdHlTdHJpbmcsXHJcbiAgICAgICAgZGlyZWN0aW9uOiBkaXJlY3Rpb25TdHJpbmdcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGRlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBpbml0aWFsTW92ZW1lbnRQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgdmVsb2NpdHk6IHZlbG9jaXR5U3RyaW5nLFxyXG4gICAgICAgIGRpcmVjdGlvbjogZGlyZWN0aW9uU3RyaW5nXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVzY3JpcHRpb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBkZXNjcmlwdGlvbiBvZiBjb250aW51b3VzIG1vdmVtZW50IG9mIHRoZSBiYWxsb29uIGFmdGVyIGl0IGhhcyBiZWVuIHJlbGVhc2VkIGFuZCBpc1xyXG4gICAqIHN0aWxsIG1vdmluZyB0aHJvdWdoIHRoZSBwbGF5IGFyZWEuIExhYmVsIHdpbGwgYmUgYWRkZWQgZm9yIGNsYXJpdHkgaWYgYm90aCBiYWxsb29ucyBhcmUgdmlzaWJsZS5cclxuICAgKiBXaWxsIHJldHVybiBzb21ldGhpbmcgbGlrZVxyXG4gICAqIFwiTW92aW5nIExlZnQuXCIgb3JcclxuICAgKiBcIk1vdmluZyBMZWZ0LiBOZWFyIHdhbGwuXCJcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0Q29udGludW91c1JlbGVhc2VEZXNjcmlwdGlvbigpIHtcclxuICAgIGxldCBkZXNjcmlwdGlvbjtcclxuICAgIGNvbnN0IGRpcmVjdGlvblN0cmluZyA9IHRoaXMuZ2V0UmVsZWFzZURpcmVjdGlvbkRlc2NyaXB0aW9uKCB0aGlzLmJhbGxvb25Nb2RlbC5kaXJlY3Rpb25Qcm9wZXJ0eS5nZXQoKSApO1xyXG5cclxuICAgIC8vIGRlc2NyaWJlcyBtb3ZlbWVudCBhbmQgZGlyZWN0aW9uLCBpbmNsdWRpbmcgbGFiZWwgaWYgYm90aCBiYWxsb29ucyBhcmUgdmlzaWJsZVxyXG4gICAgaWYgKCB0aGlzLmJhbGxvb25Nb2RlbC5vdGhlci5pc1Zpc2libGVQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIGNvbnRpbnVvdXNNb3ZlbWVudFdpdGhMYWJlbFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBiYWxsb29uTGFiZWw6IHRoaXMuYWNjZXNzaWJsZU5hbWUsXHJcbiAgICAgICAgZGlyZWN0aW9uOiBkaXJlY3Rpb25TdHJpbmdcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGRlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBjb250aW51b3VzTW92ZW1lbnRQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgZGlyZWN0aW9uOiBkaXJlY3Rpb25TdHJpbmdcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIHdlIGFyZSBpbiBhIGxhbmRtYXJrLCBpdCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBjb250aW51b3VzIG1vdmVtZW50IGRlc2NyaXB0aW9uXHJcbiAgICBpZiAoIHRoaXMuYmFsbG9vbk1vZGVsLnBsYXlBcmVhTGFuZG1hcmtQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIGNvbnRpbnVvdXNNb3ZlbWVudFdpdGhMYW5kbWFya1BhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBtb3ZlbWVudERpcmVjdGlvbjogZGVzY3JpcHRpb24sXHJcbiAgICAgICAgbGFuZG1hcms6IHRoaXMuZ2V0T25Qb3NpdGlvbkRlc2NyaXB0aW9uKClcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZXNjcmlwdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByb2R1Y2VzIGFuIGFsZXJ0IHdoZW4gdGhlcmUgaXMgbm8gY2hhbmdlIGluIHBvc2l0aW9uLiAgSW5kaWNhdGVzIHRoYXQgdGhlcmUgaXMgbm8gY2hhbmdlXHJcbiAgICogYW5kIGFsc28gcmVtaW5kcyB1c2VyIHdoZXJlIHRoZSBiYWxsb29uIGN1cnJlbnRseSBpcy4gSWYgYmFsbG9vbiBpcyB0b3VjaGluZyB3YWxsIGFuZCBhbGwgY2hhcmdlc1xyXG4gICAqIGFyZSB2aXNpYmxlLCB3ZSBpbmNsdWRlIGluZm9ybWF0aW9uIGFib3V0IHRoZSBpbmR1Y2VkIGNoYXJnZSBpbiB0aGUgd2FsbC4gV2lsbCByZXR1cm4gc29tZXRoaW5nIGxpa2VcclxuICAgKiBcIk5vIGNoYW5nZSBpbiBwb3NpdGlvbi4gWWVsbG93IGJhbGxvb24sIG9uIGxlZnQgc2lkZSBvZiBQbGF5IEFyZWEuXCIgb3JcclxuICAgKiBcIk5vIGNoYW5nZSBpbiBwb3NpdGlvbi4gWWVsbG93IEJhbGxvb24sIGF0IHdhbGwuIE5lZ2F0aXZlIGNoYXJnZXMgaW4gd2FsbCBtb3ZlIGF3YXkgZnJvbSB5ZWxsb3cgYmFsbG9vbiBhIGxvdC5cIlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXROb0NoYW5nZVJlbGVhc2VEZXNjcmlwdGlvbigpIHtcclxuICAgIGxldCBkZXNjcmlwdGlvbjtcclxuXHJcbiAgICBjb25zdCBhdHRyYWN0aXZlU3RhdGVBbmRQb3NpdGlvbkRlc2NyaXB0aW9uID0gdGhpcy5nZXRBdHRyYWN0aXZlU3RhdGVBbmRQb3NpdGlvbkRlc2NyaXB0aW9uV2l0aExhYmVsKCk7XHJcbiAgICBpZiAoIHRoaXMubW9kZWwuYm90aEJhbGxvb25zVmlzaWJsZSgpICkge1xyXG4gICAgICBkZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggdHdvQmFsbG9vbk5vQ2hhbmdlQW5kUG9zaXRpb25QYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgYmFsbG9vbjogdGhpcy5hY2Nlc3NpYmxlTmFtZSxcclxuICAgICAgICBwb3NpdGlvbjogYXR0cmFjdGl2ZVN0YXRlQW5kUG9zaXRpb25EZXNjcmlwdGlvblxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIG5vQ2hhbmdlQW5kUG9zaXRpb25QYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgcG9zaXRpb246IGF0dHJhY3RpdmVTdGF0ZUFuZFBvc2l0aW9uRGVzY3JpcHRpb25cclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGJhbGxvb24gdG91Y2hpbmcgd2FsbCBhbmQgaW5kdWNpbmcgY2hhcmdlLCBpbmNsdWRlIGluZHVjZWQgY2hhcmdlIGluZm9ybWF0aW9uXHJcbiAgICBpZiAoIHRoaXMuYmFsbG9vbk1vZGVsLnRvdWNoaW5nV2FsbCgpICYmIHRoaXMubW9kZWwuc2hvd0NoYXJnZXNQcm9wZXJ0eS5nZXQoKSA9PT0gJ2FsbCcgKSB7XHJcbiAgICAgIGNvbnN0IHdhbGxWaXNpYmxlID0gdGhpcy5tb2RlbC53YWxsLmlzVmlzaWJsZVByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgICAgY29uc3QgdGhpc0luZHVjaW5nQW5kVmlzaWJsZSA9IHRoaXMuYmFsbG9vbk1vZGVsLmluZHVjaW5nQ2hhcmdlQW5kVmlzaWJsZSgpO1xyXG4gICAgICBjb25zdCBvdGhlckluZHVjaW5nQW5kVmlzaWJsZSA9IHRoaXMuYmFsbG9vbk1vZGVsLm90aGVyLmluZHVjaW5nQ2hhcmdlQW5kVmlzaWJsZSgpO1xyXG5cclxuICAgICAgbGV0IGluZHVjZWRDaGFyZ2VTdHJpbmc7XHJcbiAgICAgIGlmICggdGhpc0luZHVjaW5nQW5kVmlzaWJsZSAmJiBvdGhlckluZHVjaW5nQW5kVmlzaWJsZSAmJiB0aGlzLm1vZGVsLmdldEJhbGxvb25zQWRqYWNlbnQoKSApIHtcclxuXHJcbiAgICAgICAgLy8gaWYgYm90aCBpbmR1Y2luZyBjaGFyZ2UsIGNvbWJpbmUgaW5kdWNlZCBjaGFyZ2UgZGVzY3JpcHRpb24gd2l0aCBcImJvdGggYmFsbG9vbnNcIlxyXG4gICAgICAgIGluZHVjZWRDaGFyZ2VTdHJpbmcgPSBXYWxsRGVzY3JpYmVyLmdldENvbWJpbmVkSW5kdWNlZENoYXJnZURlc2NyaXB0aW9uKCB0aGlzLmJhbGxvb25Nb2RlbCwgd2FsbFZpc2libGUgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBpbmR1Y2VkQ2hhcmdlU3RyaW5nID0gV2FsbERlc2NyaWJlci5nZXRJbmR1Y2VkQ2hhcmdlRGVzY3JpcHRpb24oIHRoaXMuYmFsbG9vbk1vZGVsLCB0aGlzLmFjY2Vzc2libGVOYW1lLCB3YWxsVmlzaWJsZSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpbmR1Y2VkQ2hhcmdlU3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuU3RyaW5nLCB7IHN0YXRlbWVudDogaW5kdWNlZENoYXJnZVN0cmluZyB9ICk7XHJcblxyXG4gICAgICBkZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggbm9DaGFuZ2VXaXRoSW5kdWNlZENoYXJnZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBub0NoYW5nZTogZGVzY3JpcHRpb24sXHJcbiAgICAgICAgaW5kdWNlZENoYXJnZTogaW5kdWNlZENoYXJnZVN0cmluZ1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRlc2NyaXB0aW9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgZGVzY3JpcHRpb24gb2YgdmVsb2NpdHkgZm9yIHRoaXMgYmFsbG9vbiwgb25lIG9mIFwidmVyeSBzbG93bHlcIiwgXCJzbG93bHlcIiwgXCJxdWlja2x5XCIsIFwidmVyeSBxdWlja2x5XCJcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRWZWxvY2l0eVN0cmluZygpIHtcclxuICAgIGxldCB2ZWxvY2l0eVN0cmluZztcclxuXHJcbiAgICBjb25zdCBiYWxsb29uVmVsb2NpdHkgPSB0aGlzLmJhbGxvb25Nb2RlbC52ZWxvY2l0eVByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyggQkFMTE9PTl9WRUxPQ0lUWV9NQVAgKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGVudHJ5ID0gQkFMTE9PTl9WRUxPQ0lUWV9NQVBbIGtleXNbIGkgXSBdO1xyXG4gICAgICBpZiAoIGVudHJ5LnJhbmdlLmNvbnRhaW5zKCBiYWxsb29uVmVsb2NpdHkubWFnbml0dWRlICkgKSB7XHJcbiAgICAgICAgdmVsb2NpdHlTdHJpbmcgPSBlbnRyeS5kZXNjcmlwdGlvbjtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlbG9jaXR5U3RyaW5nLCAnbm8gdmVsb2NpdHkgZGVzY3JpcHRpb24gZm91bmQnICk7XHJcblxyXG4gICAgcmV0dXJuIHZlbG9jaXR5U3RyaW5nO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgbW92ZW1lbnQgZGVzY3JpcHRpb24gZnJvbSB0aGUgbW92ZW1lbnQgZGlyZWN0aW9uIHRyYWNrZWQgaW4gdGhlIG1vZGVsLiAgVGhlIGRpcmVjdGlvblxyXG4gICAqIGlzIG9uZSBvZiBCYWxsb29uRGlyZWN0aW9uRW51bS5cclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uIC0gb25lIG9mIEJhbGxvb25EaXJlY3Rpb25FbnVtXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXREcmFnZ2luZ0RpcmVjdGlvbkRlc2NyaXB0aW9uKCBkaXJlY3Rpb24gKSB7XHJcbiAgICBjb25zdCBtb3ZlbWVudFN0cmluZyA9IEJBTExPT05fRElSRUNUSU9OX0RSQUdHSU5HX01BUFsgZGlyZWN0aW9uIF07XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbW92ZW1lbnRTdHJpbmcsIGBubyBkaXJlY3Rpb24gZGVzY3JpcHRpb24gZm91bmQgZm9yIGJhbGxvb24gbW92aW5nIGRpcmVjdGlvbiAke2RpcmVjdGlvbn1gICk7XHJcbiAgICByZXR1cm4gbW92ZW1lbnRTdHJpbmc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBkZXNjcmlwdGlvbiBvZiB0aGUgYmFsbG9vbiBtb3ZlbWVudCBkaXJlY3Rpb24gd2hlbiB0aGUgYmFsbG9vbiBpcyBub3QgY3VycmVudGx5XHJcbiAgICogYmVpbmcgZHJhZ2dlZC5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSAge3N0cmluZ30gZGlyZWN0aW9uIC0gb25lIG9mIEJhbGxvb25EaXJlY3Rpb25FbnVtXHJcbiAgICovXHJcbiAgZ2V0UmVsZWFzZURpcmVjdGlvbkRlc2NyaXB0aW9uKCBkaXJlY3Rpb24gKSB7XHJcbiAgICBjb25zdCBtb3ZlbWVudFN0cmluZyA9IEJBTExPT05fRElSRUNUSU9OX1JFTEVBU0VfTUFQWyBkaXJlY3Rpb24gXTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtb3ZlbWVudFN0cmluZywgYG5vIGRpcmVjdGlvbiBkZXNjcmlwdGlvbiBmb3VuZCBmb3IgYmFsbG9vbiBtb3ZpbmcgZGlyZWN0aW9uICR7ZGlyZWN0aW9ufWAgKTtcclxuICAgIHJldHVybiBtb3ZlbWVudFN0cmluZztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgZHJhZ2dpbmcgZGVzY3JpcHRpb24gd2hpbGUgdGhlIGJhbGxvb24gaXMgbW92aW5nIHRocm91Z2ggdGhlIHBsYXkgYXJlYSBiZWluZyBkcmFnZ2VkIGFuZCBlbnRlcnNcclxuICAgKiBhIG5ldyByZWdpb24gaW4gdGhlIHBsYXkgYXJlYS5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0UGxheUFyZWFEcmFnTmV3UmVnaW9uRGVzY3JpcHRpb24oKSB7XHJcblxyXG4gICAgY29uc3QgbmVhck9yQXQgPSB0aGlzLmdldFByZXBvc2l0aW9uKCk7XHJcbiAgICBjb25zdCBiYWxsb29uQ2VudGVyID0gdGhpcy5iYWxsb29uTW9kZWwuZ2V0Q2VudGVyKCk7XHJcblxyXG4gICAgY29uc3Qgd2FsbFZpc2libGUgPSB0aGlzLm1vZGVsLndhbGwuaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCBwb3NpdGlvblN0cmluZyA9IEJBU0VEZXNjcmliZXIuZ2V0UG9zaXRpb25EZXNjcmlwdGlvbiggYmFsbG9vbkNlbnRlciwgd2FsbFZpc2libGUgKTtcclxuXHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBiYWxsb29uTmV3UmVnaW9uUGF0dGVyblN0cmluZywge1xyXG4gICAgICBuZWFyT3JBdDogbmVhck9yQXQsXHJcbiAgICAgIHBvc2l0aW9uOiBwb3NpdGlvblN0cmluZ1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgcHJvZ3Jlc3Mgc3RyaW5nIHRvd2FyZCB0aGUgc3dlYXRlciwgd2FsbCwgdG9wIGVkZ2UsIGJvdHRvbSBlZGdlLCBvciBjZW50ZXIgb2YgcGxheSBhcmVhLlxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0UGxheUFyZWFEcmFnUHJvZ3Jlc3NEZXNjcmlwdGlvbigpIHtcclxuICAgIGxldCBuZWFyZXN0T2JqZWN0U3RyaW5nO1xyXG5cclxuICAgIGNvbnN0IGNlbnRlclBsYXlBcmVhWCA9IFBsYXlBcmVhTWFwLlhfUE9TSVRJT05TLkFUX0NFTlRFUl9QTEFZX0FSRUE7XHJcbiAgICBjb25zdCBjZW50ZXJQbGF5QXJlYVkgPSBQbGF5QXJlYU1hcC5ZX1BPU0lUSU9OUy5BVF9DRU5URVJfUExBWV9BUkVBO1xyXG4gICAgY29uc3QgYmFsbG9vbkNlbnRlclggPSB0aGlzLmJhbGxvb25Nb2RlbC5nZXRDZW50ZXJYKCk7XHJcbiAgICBjb25zdCBiYWxsb29uQ2VudGVyWSA9IHRoaXMuYmFsbG9vbk1vZGVsLmdldENlbnRlclkoKTtcclxuICAgIGNvbnN0IGJhbGxvb25EaXJlY3Rpb24gPSB0aGlzLmJhbGxvb25Nb2RlbC5kaXJlY3Rpb25Qcm9wZXJ0eS5nZXQoKTtcclxuXHJcbiAgICBpZiAoIGJhbGxvb25EaXJlY3Rpb24gPT09IEJhbGxvb25EaXJlY3Rpb25FbnVtLkxFRlQgKSB7XHJcblxyXG4gICAgICAvLyBpZiByaWdodCBvZiBjZW50ZXIsIGRlc2NyaWJlIGNsb3NlciB0byBjZW50ZXIsIG90aGVyd2lzZSBjbG9zZXIgdG8gc3dlYXRlclxyXG4gICAgICBuZWFyZXN0T2JqZWN0U3RyaW5nID0gKCBiYWxsb29uQ2VudGVyWCA+IGNlbnRlclBsYXlBcmVhWCApID8gY2VudGVyT2ZQbGF5QXJlYVN0cmluZyA6IHN3ZWF0ZXJTdHJpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggYmFsbG9vbkRpcmVjdGlvbiA9PT0gQmFsbG9vbkRpcmVjdGlvbkVudW0uUklHSFQgKSB7XHJcblxyXG4gICAgICBpZiAoIGJhbGxvb25DZW50ZXJYIDwgY2VudGVyUGxheUFyZWFYICkge1xyXG5cclxuICAgICAgICAvLyBpZiBsZWZ0IG9mIGNlbnRlciwgZGVzY3JpYmUgdGhhdCB3ZSBhcmUgY2xvc2VyIHRvIHRoZSBjZW50ZXJcclxuICAgICAgICBuZWFyZXN0T2JqZWN0U3RyaW5nID0gY2VudGVyT2ZQbGF5QXJlYVN0cmluZztcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlIGRlc2NyaWJlIGNsb3NlciB0byB3YWxsIG9yIHJpZ2hlIGVkZ2UgZGVwZW5kaW5nIG9uIHdhbGwgdmlzaWJpbGl0eVxyXG4gICAgICAgIG5lYXJlc3RPYmplY3RTdHJpbmcgPSB0aGlzLm1vZGVsLndhbGwuaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCkgPyB3YWxsU3RyaW5nIDogcmlnaHRFZGdlT2ZQbGF5QXJlYVN0cmluZztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGJhbGxvb25EaXJlY3Rpb24gPT09IEJhbGxvb25EaXJlY3Rpb25FbnVtLlVQICkge1xyXG5cclxuICAgICAgLy8gYmVsb3cgY2VudGVyIGRlc2NyaWJlIGNsb3NlciB0byBjZW50ZXIsIG90aGVyd2lzZSBjbG9zZXIgdG8gdG9wIG9mIHBsYXkgYXJlYVxyXG4gICAgICBuZWFyZXN0T2JqZWN0U3RyaW5nID0gKCBiYWxsb29uQ2VudGVyWSA+IGNlbnRlclBsYXlBcmVhWSApID8gY2VudGVyT2ZQbGF5QXJlYVN0cmluZyA6IHRvcEVkZ2VPZlBsYXlBcmVhU3RyaW5nO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGJhbGxvb25EaXJlY3Rpb24gPT09IEJhbGxvb25EaXJlY3Rpb25FbnVtLkRPV04gKSB7XHJcblxyXG4gICAgICAvLyBhYm92ZSBjZW50ZXIgZGVzY3JpYmUgY2xvc2VyIHRvIGNlbnRlciwgb3RoZXJ3aXNlIGNsb3NlciB0byBib3R0b20gZWRnZSBvZiBwbGF5IGFyZWFcclxuICAgICAgbmVhcmVzdE9iamVjdFN0cmluZyA9ICggYmFsbG9vbkNlbnRlclkgPCBjZW50ZXJQbGF5QXJlYVkgKSA/IGNlbnRlck9mUGxheUFyZWFTdHJpbmcgOiBib3R0b21FZGdlT2ZQbGF5QXJlYVN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBuZWFyZXN0T2JqZWN0U3RyaW5nLCBgbm8gbmVhcmVzdCBvYmplY3QgZm91bmQgZm9yIG1vdmVtZW50IGRpcmVjdGlvbjogJHtiYWxsb29uRGlyZWN0aW9ufWAgKTtcclxuICAgIGNvbnN0IGFsZXJ0ID0gU3RyaW5nVXRpbHMuZmlsbEluKCBjbG9zZXJUb09iamVjdFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgb2JqZWN0OiBuZWFyZXN0T2JqZWN0U3RyaW5nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggc2luZ2xlU3RhdGVtZW50UGF0dGVyblN0cmluZywge1xyXG4gICAgICBzdGF0ZW1lbnQ6IGFsZXJ0XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBkZXNjcmlwdGlvbiBhYm91dCB0aGUgY2hhbmdlIGluIGRpcmVjdGlvbi4gSWYgdGhlIGJhbGxvb24gaXMgZ3JhYmJlZCwgb25seSB0aGUgZGlyZWN0aW9uIHdpbGwgYmUgaW4gdGhlXHJcbiAgICogZGVzY3JpcHRpb24uIE90aGVyd2lzZSwgaXQgd2lsbCBiZSBhbiB1cGRhdGUgdG8gZGlyZWN0aW9uLCBzbyBhZGQgXCJOb3dcIi4gV2lsbCByZXR1cm4gc29tZXRoaW5nIGxpa2VcclxuICAgKlxyXG4gICAqIFwiTGVmdC5cIiBvclxyXG4gICAqIFwiTm93IExlZnQuXCJcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0RGlyZWN0aW9uQ2hhbmdlZERlc2NyaXB0aW9uKCkge1xyXG4gICAgbGV0IGRlc2NyaXB0aW9uO1xyXG5cclxuICAgIGNvbnN0IGRpcmVjdGlvbiA9IHRoaXMuYmFsbG9vbk1vZGVsLmRpcmVjdGlvblByb3BlcnR5LmdldCgpO1xyXG4gICAgaWYgKCB0aGlzLmJhbGxvb25Nb2RlbC5pc0RyYWdnZWRQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgIC8vIHdoZW4gZHJhZ2dlZCwganVzdCB0aGUgZGlyZWN0aW9uXHJcbiAgICAgIGRlc2NyaXB0aW9uID0gdGhpcy5nZXREcmFnZ2luZ0RpcmVjdGlvbkRlc2NyaXB0aW9uKCBkaXJlY3Rpb24gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gd2hlbiBub3QgZHJhZ2dlZCwgYWRkICdOb3cnIHRvIGRpcmVjdGlvblxyXG4gICAgICBjb25zdCBkaXJlY3Rpb25TdHJpbmcgPSB0aGlzLmdldFJlbGVhc2VEaXJlY3Rpb25EZXNjcmlwdGlvbiggZGlyZWN0aW9uICk7XHJcbiAgICAgIGlmICggdGhpcy5tb2RlbC5ib3RoQmFsbG9vbnNWaXNpYmxlKCkgKSB7XHJcbiAgICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIHR3b0JhbGxvb25Ob3dEaXJlY3Rpb25QYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgICBiYWxsb29uOiB0aGlzLmFjY2Vzc2libGVOYW1lLFxyXG4gICAgICAgICAgZGlyZWN0aW9uOiBkaXJlY3Rpb25TdHJpbmdcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIG5vd0RpcmVjdGlvblBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICAgIGRpcmVjdGlvbjogZGlyZWN0aW9uU3RyaW5nXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRlc2NyaXB0aW9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgZGVzY3JpcHRpb24gb2YgdGhlIGJhbGxvb24gd2hlbiBpdHMgaW5kZXBlbmRlbnQgbW92ZW1lbnQgc3RvcHMuIElmIGNoYXJnZXMgYXJlIHNob3duIGFuZCB0aGUgYmFsbG9vbiBpc1xyXG4gICAqIGluZHVjaW5nIGNoYXJnZSwgd2lsbCBpbmNsdWRlIGluZHVjZWQgY2hhcmdlIGluZm9ybWF0aW9uLlxyXG4gICAqIFdpbGwgcmV0dXJuIHNvbWV0aGluZyBsaWtlXHJcbiAgICpcclxuICAgKiBcIkdyZWVuIGJhbGxvb24sIGF0IHVwcGVyIHdhbGwuIEluIHVwcGVyIHdhbGwsIG5vIGNoYW5nZSBpbiBjaGFyZ2VzLlwiIG9yXHJcbiAgICogXCJHcmVlbiBiYWxsb29uLCBhdCB3YWxsLiBOZWdhdGl2ZSBjaGFyZ2VzIGluIHdhbGwgbW92ZSBhd2F5IGZyb20geWVsbG93IGJhbGxvb24gYSBsaXR0bGUgYml0LlwiXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldE1vdmVtZW50U3RvcHNEZXNjcmlwdGlvbigpIHtcclxuICAgIGxldCBkZXNjcmlwdGlvblN0cmluZztcclxuXHJcbiAgICAvLyB0aGUgcG9zaXRpb24gc3RyaW5nIGlzIHVzZWQgZm9yIGFsbCBjaGFyZ2Ugdmlld3MsIHVzZWQgYXMgYSBzaW5nbGUgc2VudGVuY2VcclxuICAgIGNvbnN0IHBvc2l0aW9uU3RyaW5nID0gdGhpcy5nZXRBdHRyYWN0aXZlU3RhdGVBbmRQb3NpdGlvbkRlc2NyaXB0aW9uV2l0aExhYmVsKCk7XHJcblxyXG4gICAgY29uc3Qgc2hvd25DaGFyZ2VzID0gdGhpcy5tb2RlbC5zaG93Q2hhcmdlc1Byb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIGlmICggc2hvd25DaGFyZ2VzID09PSAnYWxsJyAmJiB0aGlzLndhbGwuaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICAvLyBkb24ndCBpbmNsdWRlIGluZm9ybWF0aW9uIGFib3V0IGFkamFjZW5jeSB0byBvdGhlciBiYWxsb29uIGluIHRoaXMgcG9zaXRpb24gIGRlc2NyaXB0aW9uXHJcbiAgICAgIGNvbnN0IGNoYXJnZVBvc2l0aW9uU3RyaW5nID0gdGhpcy5nZXRQb3NpdGlvbkRlc2NyaXB0aW9uV2l0aG91dE92ZXJsYXAoKTtcclxuXHJcbiAgICAgIGxldCBjaGFyZ2VTdHJpbmc7XHJcbiAgICAgIGlmICggdGhpcy5iYWxsb29uTW9kZWwuaW5kdWNpbmdDaGFyZ2VQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICBjaGFyZ2VTdHJpbmcgPSBXYWxsRGVzY3JpYmVyLmdldEluZHVjZWRDaGFyZ2VEZXNjcmlwdGlvbiggdGhpcy5iYWxsb29uTW9kZWwsIHRoaXMuYWNjZXNzaWJsZU5hbWUsIHRoaXMud2FsbC5pc1Zpc2libGVQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGNoYXJnZVN0cmluZyA9IFdhbGxEZXNjcmliZXIuZ2V0Tm9DaGFuZ2VJbkNoYXJnZXNEZXNjcmlwdGlvbiggY2hhcmdlUG9zaXRpb25TdHJpbmcgKTtcclxuICAgICAgfVxyXG4gICAgICBkZXNjcmlwdGlvblN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggYmFsbG9vblBvc2l0aW9uTm9DaGFuZ2VQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgcG9zaXRpb246IHBvc2l0aW9uU3RyaW5nLFxyXG4gICAgICAgIGluZHVjZWRDaGFyZ2U6IGNoYXJnZVN0cmluZ1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgZGVzY3JpcHRpb25TdHJpbmcgPSBwb3NpdGlvblN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVzY3JpcHRpb25TdHJpbmc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGJhbGxvb24gaXMgbW92aW5nIHNsb3cgZW5vdWdoIHRvIHdhcnJhbnQgY29udGludW91cyBtb3ZlbWVudCBkZXNjcmlwdGlvbnMsIGJ1dCBmYXN0IGVub3VnaFxyXG4gICAqIGZvciB0aGUgbW92ZW1lbnQgdG8gYmUgb2JzZXJ2YWJsZS4gVGhpcyBpcyB0byBwcmV2ZW50IHRoaXMgYWxlcnQgZnJvbSBmaXJpbmcgaW5kZWZpbml0ZWx5IGlmIHRoZSBiYWxsb29uIGhhc1xyXG4gICAqIHNvbWUgYXJiaXRyYXJ5IHZlbG9jaXR5LlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgYmFsbG9vbk1vdmluZ0F0Q29udGludW91c0Rlc2NyaXB0aW9uVmVsb2NpdHkoKSB7XHJcbiAgICBjb25zdCB2ZWxvY2l0eU1hZ25pdHVkZSA9IHRoaXMuYmFsbG9vbk1vZGVsLnZlbG9jaXR5UHJvcGVydHkuZ2V0KCkubWFnbml0dWRlO1xyXG4gICAgcmV0dXJuIHZlbG9jaXR5TWFnbml0dWRlIDwgQkFMTE9PTl9WRUxPQ0lUWV9NQVAuUVVJQ0tMWV9SQU5HRS5yYW5nZS5tYXggJiZcclxuICAgICAgICAgICB2ZWxvY2l0eU1hZ25pdHVkZSA+IDAuMDAwNTsgLy8gdmFsdWUgY2hvc2VuIGVtcGlyaWNhbGx5LCBzZWUgIzQxM1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGFuIGFsZXJ0IHRoYXQgaW5kaWNhdGVzIHRoYXQgdGhlIGJhbGxvb24gaGFzIGJlZW4gZ3JhYmJlZCBmb3IgZHJhZ2dpbmcuIFdpbGwgY29tcG9zZVxyXG4gICAqIGEgZGVzY3JpcHRpb24gY29udGFpbmluZyBjaGFyZ2UgaW5mb3JtYXRpb24sIHBvc2l0aW9uIGluZm9ybWF0aW9uLCBhbmQgaGVscCBmb3IgaG93XHJcbiAgICogdG8gaW50ZXJhY3Qgd2l0aCBiYWxsb29uLiBBbW91bnQgb2YgY2hhcmdlIGluZm9ybWF0aW9uIHdpbGwgZGVwZW5kIG9uIGNoYXJnZSB2aXNpYmlsaXR5XHJcbiAgICogc2V0dGluZy4gSWYgdGhlIGJhbGxvb24gaXMgaW5kdWNpbmcgY2hhcmdlLCBpbmZvcm1hdGlvbiBhYm91dCBpbmR1Y2VkIGNoYXJnZSB3aWxsIGJlIGluY2x1ZGVkLlxyXG4gICAqIElmIHRoZSBiYWxsb29uIGlzIG9uIHRoZSBzd2VhdGVyLCB3aWxsIGluY2x1ZGUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGNoYXJnZXMgb24gdGhlIHN3ZWF0ZXIuIEFmdGVyIHRoZVxyXG4gICAqIGJhbGxvb24gaGFzIGJlZW4gcGlja2VkIHVwIG9uY2UsIHdlIGRvbid0IG5lZWQgdG8gZGVzY3JpYmUgaGVscCBpbmZvcm1hdGlvbiB1bnRpbCByZXNldC5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0R3JhYmJlZEFsZXJ0KCkge1xyXG4gICAgbGV0IGRlc2NyaXB0aW9uO1xyXG5cclxuICAgIC8vIGNoYXJnZXMgdmlzaWJsZSBpbiB0aGUgdmlld1xyXG4gICAgY29uc3QgY2hhcmdlc1Nob3duID0gdGhpcy5tb2RlbC5zaG93Q2hhcmdlc1Byb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIC8vIGF0dHJhY3RpdmUgc3RhdGUgYW5kIHBvc2l0aW9uIGlzIGRlc2NyaWJlZCBmb3IgZXZlcnkgY2hhcmdlIHZpZXcsIGl0IGlzIGEgc2luZ2xlIHNlbnRlbmNlIGluIHRoaXMgdXNlIGNhc2VcclxuICAgIGxldCBzdGF0ZUFuZFBvc2l0aW9uID0gdGhpcy5nZXRPblBvc2l0aW9uRGVzY3JpcHRpb24oKTtcclxuICAgIHN0YXRlQW5kUG9zaXRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIHNpbmdsZVN0YXRlbWVudFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgc3RhdGVtZW50OiBzdGF0ZUFuZFBvc2l0aW9uXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gZ2V0IGEgZGVzY3JpcHRpb24gb2YgdGhlIHJlbGF0aXZlIGNoYXJnZSBvZiB0aGUgZ3JhYmJlZCBiYWxsb29uLCBhbmQgcG9zc2libHkgdGhlIG90aGVyIHJlbGF0aXZlIGNoYXJnZVxyXG4gICAgLy8gb2YgdGhlIG90aGVyIGJhbGxvb24gaWYgdmlzaWJsZVxyXG4gICAgaWYgKCBjaGFyZ2VzU2hvd24gIT09ICdub25lJyApIHtcclxuICAgICAgbGV0IGNoYXJnZURlc2NyaXB0aW9uO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLm1vZGVsLmdldEJhbGxvb25zQWRqYWNlbnQoKSApIHtcclxuICAgICAgICBjaGFyZ2VEZXNjcmlwdGlvbiA9IHRoaXMuYmFsbG9vbkRlc2NyaWJlci5jaGFyZ2VEZXNjcmliZXIuZ2V0Q29tYmluZWRSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uKCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY2hhcmdlRGVzY3JpcHRpb24gPSB0aGlzLmJhbGxvb25EZXNjcmliZXIuY2hhcmdlRGVzY3JpYmVyLmdldEhhc1JlbGF0aXZlQ2hhcmdlRGVzY3JpcHRpb24oKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY2hhcmdlRGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIHNpbmdsZVN0YXRlbWVudFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBzdGF0ZW1lbnQ6IGNoYXJnZURlc2NyaXB0aW9uXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIGlmIHRoZSBiYWxsb29uIGlzIGluZHVjaW5nIGNoYXJnZSwgb3IgdG91Y2hpbmcgdGhlIHN3ZWF0ZXIgb3Igd2FsbCB3ZSBpbmNsdWRlIGEgZGVzY3JpcHRpb24gZm9yIHRoaXNcclxuICAgICAgY29uc3QgaW5kdWNpbmdDaGFyZ2VPclRvdWNoaW5nV2FsbCA9IHRoaXMuYmFsbG9vbk1vZGVsLmluZHVjaW5nQ2hhcmdlUHJvcGVydHkuZ2V0KCkgfHwgdGhpcy5iYWxsb29uTW9kZWwudG91Y2hpbmdXYWxsKCk7XHJcbiAgICAgIGNvbnN0IG9uU3dlYXRlciA9IHRoaXMuYmFsbG9vbk1vZGVsLm9uU3dlYXRlcigpO1xyXG4gICAgICBpZiAoIGluZHVjaW5nQ2hhcmdlT3JUb3VjaGluZ1dhbGwgfHwgb25Td2VhdGVyICYmICggY2hhcmdlc1Nob3duICE9PSAnbm9uZScgKSApIHtcclxuICAgICAgICBjb25zdCBvdGhlck9iamVjdENoYXJnZSA9IHRoaXMuYmFsbG9vbkRlc2NyaWJlci5jaGFyZ2VEZXNjcmliZXIuZ2V0T3RoZXJPYmplY3RDaGFyZ2VEZXNjcmlwdGlvbigpO1xyXG4gICAgICAgIGNoYXJnZURlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBncmFiYmVkV2l0aE90aGVyQ2hhcmdlUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgICAgYmFsbG9vbkNoYXJnZTogY2hhcmdlRGVzY3JpcHRpb24sXHJcbiAgICAgICAgICBvdGhlck9iamVjdENoYXJnZTogb3RoZXJPYmplY3RDaGFyZ2VcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGRlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBncmFiYmVkQ2hhcmdlUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIHBvc2l0aW9uOiBzdGF0ZUFuZFBvc2l0aW9uLFxyXG4gICAgICAgIGNoYXJnZTogY2hhcmdlRGVzY3JpcHRpb25cclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBubyBjaGFyZ2VzIHNob3duLCBqdXN0IGluY2x1ZGUgaW5mb3JtYXRpb24gYWJvdXQgcG9zaXRpb25cclxuICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIGdyYWJiZWROb25lUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIHBvc2l0aW9uOiBzdGF0ZUFuZFBvc2l0aW9uXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiB0aGlzIGlzIHRoZSBmaXJzdCB0aW1lIHBpY2tpbmcgdXAgdGhlIGJhbGxvb24sIGluY2x1ZGUgaGVscCBjb250ZW50XHJcbiAgICBpZiAoICF0aGlzLmJhbGxvb25Nb2RlbC5zdWNjZXNzZnVsUGlja1VwICkge1xyXG4gICAgICBkZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggZ3JhYmJlZFdpdGhIZWxwUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIGdyYWJiZWRBbGVydDogZGVzY3JpcHRpb24sXHJcbiAgICAgICAgaGVscDogcGhldC5qb2lzdC5zaW0uc3VwcG9ydHNHZXN0dXJlRGVzY3JpcHRpb24gPyB0b3VjaEludGVyYWN0aW9uQ3VlU3RyaW5nIDoga2V5Ym9hcmRJbnRlcmFjdGlvbkN1ZVN0cmluZ1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5iYWxsb29uTW9kZWwuc3VjY2Vzc2Z1bFBpY2tVcCA9IHRydWU7XHJcblxyXG4gICAgcmV0dXJuIGRlc2NyaXB0aW9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgZGVzY3JpcHRpb24gb2Ygd2hlcmUgdGhlIGJhbGxvb24ganVtcGVkIHRvLiAgRGVwZW5kaW5nIG9uIHdoZXJlIHRoZSBiYWxsb29uIGdvZXMsIHRoZXJlXHJcbiAgICogY291bGQgYmUgYW4gaW5kaWNhdGlvbiBvZiB3aGVyZSB0aGUgYmFsbG9vbiBpcyBpbiB0aGUgcGxheSBhcmVhLCBhbmQgcG90ZW50aWFsbHkgdGhlIHN0YXRlIG9mXHJcbiAgICogdGhlIGluZHVjZWQgY2hhcmdlIGluIHRoZSB3YWxsLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSAge1ZlY3RvcjJ9IGNlbnRlclxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0SnVtcGluZ0Rlc2NyaXB0aW9uKCBjZW50ZXIgKSB7XHJcbiAgICBsZXQgZGVzY3JpcHRpb24gPSAnJztcclxuXHJcbiAgICAvLyBhbGwganVtcGluZyBpcyBpbiB0aGUgeCBkaXJlY3Rpb25cclxuICAgIGNvbnN0IGNlbnRlclggPSBjZW50ZXIueDtcclxuXHJcbiAgICAvLyBkZXRlcm1pbmUgd2hpY2ggZGVzY3JpcHRpb24gd2Ugc2hvdWxkIHVzZSBkZXBlbmRpbmcgb24gdGhlIGNlbnRlciBwb3NpdGlvbiBvZiB0aGUgYmFsbG9vblxyXG4gICAgaWYgKCBjZW50ZXJYID09PSBQbGF5QXJlYU1hcC5YX1BPU0lUSU9OUy5BVF9ORUFSX1NXRUFURVIgKSB7XHJcbiAgICAgIGRlc2NyaXB0aW9uID0gbmVhclN3ZWF0ZXJTdHJpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIGdlbmVyYWwgcG9zaXRpb24gZGVzY3JpcHRpb24gZm9yIHRoZSBiYWxsb29uXHJcbiAgICAgIGNvbnN0IHBvc2l0aW9uRGVzY3JpcHRpb24gPSB0aGlzLmdldEF0dHJhY3RpdmVTdGF0ZUFuZFBvc2l0aW9uRGVzY3JpcHRpb24oKTtcclxuXHJcbiAgICAgIC8vIHN0YXRlIHZhcmlhYmxlcyB1c2VkIHRvIGdlbmVyYXRlIGRlc2NyaXB0aW9uIGNvbnRlbnRcclxuICAgICAgY29uc3Qgd2FsbFZpc2libGUgPSB0aGlzLndhbGwuaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIGNvbnN0IGluZHVjaW5nQ2hhcmdlID0gdGhpcy5iYWxsb29uTW9kZWwuaW5kdWNpbmdDaGFyZ2VQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgY29uc3Qgc2hvd0NoYXJnZXMgPSB0aGlzLm1vZGVsLnNob3dDaGFyZ2VzUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgICAvLyBpZiBqdW1waW5nIHRvIHdhbGwsIGRlc2NyaWJlIGFzIGlmIGJhbGxvb24gaXMgcnViYmluZyBhbG9uZyB0aGUgd2FsbCBmb3IgdGhlIGZpcnN0IHRpbWVcclxuICAgICAgaWYgKCB0aGlzLmJhbGxvb25Nb2RlbC50b3VjaGluZ1dhbGxQcm9wZXJ0eS5nZXQoKSAmJiBzaG93Q2hhcmdlcyAhPT0gJ25vbmUnICkge1xyXG4gICAgICAgIGlmICggc2hvd0NoYXJnZXMgPT09ICdhbGwnICkge1xyXG5cclxuICAgICAgICAgIC8vIGRlc2NyaWJlciBwYWlycyBvZiBjaGFyZ2VzIGluIHRoZSB3YWxsIGlmIHRoZXkgYXJlIHZpc2libGVcclxuICAgICAgICAgIGRlc2NyaXB0aW9uID0gdGhpcy5iYWxsb29uRGVzY3JpYmVyLmdldFdhbGxSdWJiaW5nRGVzY3JpcHRpb25XaXRoQ2hhcmdlUGFpcnMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBkZXNjcmlwdGlvbiA9IHRoaXMuYmFsbG9vbkRlc2NyaWJlci5nZXRXYWxsUnViYmluZ0Rlc2NyaXB0aW9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB3YWxsVmlzaWJsZSAmJiBpbmR1Y2luZ0NoYXJnZSAmJiBzaG93Q2hhcmdlcyA9PT0gJ2FsbCcgKSB7XHJcblxyXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGluZHVjZWQgY2hhcmdlIGFuZCB0aGUgY2hhcmdlcyBhcmUgdmlzaWJsZSwgZGVzY3JpYmUgaW5kdWNlZCBjaGFyZ2Ugc3VtbWFyeVxyXG4gICAgICAgIGNvbnN0IGluZHVjZWRDaGFyZ2VEZXNjcmlwdGlvbiA9IFdhbGxEZXNjcmliZXIuZ2V0SW5kdWNlZENoYXJnZURlc2NyaXB0aW9uV2l0aE5vQW1vdW50KCB0aGlzLmJhbGxvb25Nb2RlbCwgdGhpcy5hY2Nlc3NpYmxlTmFtZSwgd2FsbFZpc2libGUgKTtcclxuICAgICAgICBkZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggcG9zaXRpb25BbmRJbmR1Y2VkQ2hhcmdlUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgICAgcG9zaXRpb246IHBvc2l0aW9uRGVzY3JpcHRpb24sXHJcbiAgICAgICAgICBpbmR1Y2VkQ2hhcmdlOiBpbmR1Y2VkQ2hhcmdlRGVzY3JpcHRpb25cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIG90aGVyd2lzZSwgb25seSBwcm92aWRlIHRoZSBwb3NpdGlvbiBkZXNjcmlwdGlvblxyXG4gICAgICAgIGRlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgICBzdGF0ZW1lbnQ6IHBvc2l0aW9uRGVzY3JpcHRpb25cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBhZnRlciBqdW1waW5nLCByZXNldCBpbmR1Y2VkIGNoYXJnZSBkZXNjcmlwdGlvbiBmbGFnc1xyXG4gICAgdGhpcy5pbmR1Y2VkQ2hhcmdlRGlzcGxhY2VtZW50T25FbmQgPSBmYWxzZTtcclxuICAgIHJldHVybiBkZXNjcmlwdGlvbjtcclxuICB9XHJcbn1cclxuXHJcbmJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkucmVnaXN0ZXIoICdCYWxsb29uUG9zaXRpb25EZXNjcmliZXInLCBCYWxsb29uUG9zaXRpb25EZXNjcmliZXIgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJhbGxvb25Qb3NpdGlvbkRlc2NyaWJlcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsT0FBT0MsV0FBVyxNQUFNLGtEQUFrRDtBQUMxRSxPQUFPQyw0QkFBNEIsTUFBTSwwQ0FB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