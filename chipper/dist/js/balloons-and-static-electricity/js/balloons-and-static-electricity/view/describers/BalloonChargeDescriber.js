// Copyright 2018-2021, University of Colorado Boulder

/**
 * Generates descriptions about to the balloon's charge, which is dependent on which charges are visible
 * in the sim and the value of BASEModel.showChargesProperty.
 *
 * @author Jesse Greenberg
 */

import Vector2 from '../../../../../dot/js/Vector2.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import balloonsAndStaticElectricity from '../../../balloonsAndStaticElectricity.js';
import BASEA11yStrings from '../../BASEA11yStrings.js';
import BalloonModel from '../../model/BalloonModel.js';
import PlayAreaMap from '../../model/PlayAreaMap.js';
import BASEDescriber from './BASEDescriber.js';
import SweaterDescriber from './SweaterDescriber.js';
import WallDescriber from './WallDescriber.js';
const summaryBalloonNeutralChargeString = BASEA11yStrings.summaryBalloonNeutralCharge.value;
const balloonNetChargePatternString = BASEA11yStrings.balloonNetChargePattern.value;
const balloonZeroString = BASEA11yStrings.balloonZero.value;
const balloonNegativeString = BASEA11yStrings.balloonNegative.value;
const balloonRelativeChargePatternString = BASEA11yStrings.balloonRelativeChargePattern.value;
const balloonChargeDifferencesPatternString = BASEA11yStrings.balloonChargeDifferencesPattern.value;
const moreInducedChargePatternString = BASEA11yStrings.moreInducedChargePattern.value;
const lessInducedChargePatternString = BASEA11yStrings.lessInducedChargePattern.value;
const balloonRelativeChargeAllPatternString = BASEA11yStrings.balloonRelativeChargeAllPattern.value;
const combinedChargePatternString = BASEA11yStrings.combinedChargePattern.value;
const wallInducedChargeWithManyPairsPatternString = BASEA11yStrings.wallInducedChargeWithManyPairsPattern.value;
const eachBalloonString = BASEA11yStrings.eachBalloon.value;
const singleStatementPatternString = BASEA11yStrings.singleStatementPattern.value;
const wallHasManyChargesString = BASEA11yStrings.wallHasManyCharges.value;
const balloonHasRelativeChargePatternString = BASEA11yStrings.balloonHasRelativeChargePattern.value;
const showingNoChargesString = BASEA11yStrings.showingNoCharges.value;
const balloonHasNetChargePatternString = BASEA11yStrings.balloonHasNetChargePattern.value;
const balloonNetChargePatternStringWithLabel = BASEA11yStrings.balloonNetChargePatternStringWithLabel.value;
const moveAwayALittleMoreString = BASEA11yStrings.moveAwayALittleMore.value;
const beginToReturnString = BASEA11yStrings.beginToReturn.value;
const returnALittleMoreString = BASEA11yStrings.returnALittleMore.value;
const balloonHasChargePatternString = BASEA11yStrings.balloonHasChargePattern.value;
const balloonHasChargeShowingPatternString = BASEA11yStrings.balloonHasChargeShowingPattern.value;
class BalloonChargeDescriber {
  /**
   * @param {BASEModel} model
   * @param {BalloonModel} balloonModel
   * @param {string} accessibleName - the accessible name for this balloon
   * @param {string} otherAccessibleName - the accessible name for the other balloon in this sim
   */
  constructor(model, balloonModel, accessibleName, otherAccessibleName) {
    // @private
    this.model = model;
    this.balloonModel = balloonModel;
    this.wall = model.wall;
    this.accessibleName = accessibleName;
    this.otherAccessibleName = otherAccessibleName;
    this.showChargesProperty = model.showChargesProperty;

    // @private - Allows us to track the change in the balloon's induced charge, useful for describing how the charges
    // move towards or away their resting positions
    this.previousForceMagnitude = 0;

    // @private - The previous magnitude of force delta normalized, so we can track whether induced charge increases or
    // decreases between when a description of induced charge change is triggered. Useful for describing how induced
    // charge changes between consecutive balloon movements, so we can say charges "continue" to move away.
    this.previousForceMagnitudeNormalized = 0;

    // listeners, no need to unlink
    // if the balloon is no longer inducing charge, reset reference forces until balloon begins to induce charge again
    balloonModel.inducingChargeProperty.link(inducingCharge => {
      if (!inducingCharge) {
        this.resetReferenceForces();
      }
    });

    // when the balloon touches the wall, values that help describe change in charges
    balloonModel.touchingWallProperty.link(() => {
      this.resetReferenceForces();
    });

    // when the balloon is grabbed or released, reset reference forces for describing changes to induced charge
    // in the wall
    balloonModel.isDraggedProperty.link(() => {
      this.resetReferenceForces();
    });
  }

  /**
   * Get a description of the  net charge. Will return something like
   * "Has negative net charge." or
   * "Has neutral net charge."
   *
   * @public
   *
   * @returns {string}
   */
  getNetChargeDescription() {
    const chargeAmountString = this.balloonModel.chargeProperty.get() < 0 ? balloonNegativeString : balloonZeroString;
    return StringUtils.fillIn(balloonNetChargePatternString, {
      chargeAmount: chargeAmountString
    });
  }

  /**
   * Get a description of the net charge for the balloon, including the label. Will return something like
   * "Yellow balloon has negative net charge." or
   * "Green balloon has no net charge."
   *
   * @public
   *
   * @returns {string}
   */
  getNetChargeDescriptionWithLabel() {
    const chargeAmountString = this.balloonModel.chargeProperty.get() < 0 ? balloonNegativeString : balloonZeroString;
    return StringUtils.fillIn(balloonNetChargePatternStringWithLabel, {
      chargeAmount: chargeAmountString,
      balloon: this.accessibleName
    });
  }

  /**
   * Get the combined relative charge description for each balloon. Will return something like
   *
   * "Each balloon has zero net charge, showing no charges." or
   * "Green balloon has negative net charge, showing a few negative charges. Yellow balloon has zero net charge,
   *   showing no charges." or
   * "Each balloon has no more negative charges than positive charges." or
   * "Green balloon has several more negative charges than positive  charges. Yellow balloon has several more
   *   negative charges than positive charges." or
   *
   * @public
   *
   * @returns {string}
   */
  getCombinedRelativeChargeDescription() {
    assert && assert(this.balloonModel.isDraggedProperty.get(), 'alert should only be generated if balloon is grabbed');
    let description;

    // the relative charge, used in all cases
    const sameChargeRange = BASEDescriber.getBalloonsVisibleWithSameChargeRange(this.balloonModel, this.balloonModel.other);
    const chargesShown = this.showChargesProperty.get();

    // if both balloons have the same charge range, describe togethehr
    if (sameChargeRange) {
      description = BalloonChargeDescriber.getRelativeChargeDescriptionWithLabel(this.balloonModel, chargesShown, eachBalloonString);
    } else {
      const grabbedBalloonDescription = BalloonChargeDescriber.getRelativeChargeDescriptionWithLabel(this.balloonModel, chargesShown, this.accessibleName);
      if (this.model.bothBalloonsVisible()) {
        const otherBalloonDescription = BalloonChargeDescriber.getRelativeChargeDescriptionWithLabel(this.balloonModel.other, chargesShown, this.otherAccessibleName);
        description = StringUtils.fillIn(combinedChargePatternString, {
          grabbedBalloon: grabbedBalloonDescription,
          otherBalloon: otherBalloonDescription
        });
      } else {
        // just the visible balloon, this description should not include the balloon's' label
        description = StringUtils.fillIn(balloonRelativeChargeAllPatternString, {
          charge: BalloonChargeDescriber.getRelativeChargeDescription(this.balloonModel, chargesShown)
        });
      }
    }
    return description;
  }

  /**
   * Get a description of the induced charge in the wall or the charge of the sweater. To be used by the "grab" alert
   * when the balloon is picked up.
   *
   * @public
   *
   * @returns {string}
   */
  getOtherObjectChargeDescription() {
    const inducingChargeOrTouchingWall = this.balloonModel.inducingChargeProperty.get() || this.balloonModel.touchingWall();
    const onSweater = this.balloonModel.onSweater();
    assert && assert(onSweater || inducingChargeOrTouchingWall, 'only include this phrase when balloon is inducing charge or on sweater');
    let description;
    const chargesShown = this.showChargesProperty.get();

    // if balloon is inducing charge, describe that object
    if (inducingChargeOrTouchingWall) {
      const wallVisible = this.model.wall.isVisibleProperty.get();
      if (chargesShown === 'diff') {
        // if showing charge differences, no charges are shown, so include that information
        const balloonsAdjacent = this.model.getBalloonsAdjacent();
        description = WallDescriber.getWallChargeDescriptionWithLabel(this.model.yellowBalloon, this.model.greenBalloon, balloonsAdjacent, wallVisible, chargesShown);
        description = StringUtils.fillIn(singleStatementPatternString, {
          statement: description
        });
      } else {
        if (this.balloonModel.inducingChargeAndVisible() && this.balloonModel.other.inducingChargeAndVisible()) {
          // both balloons inducing charge, return combined descriptions
          description = WallDescriber.getCombinedInducedChargeDescription(this.balloonModel, wallVisible);
          description = StringUtils.fillIn(singleStatementPatternString, {
            statement: description
          });
        } else if (this.balloonModel.inducingChargeAndVisible()) {
          // only one balloon inducing charge, describe this
          description = WallDescriber.getInducedChargeDescription(this.balloonModel, this.accessibleName, wallVisible);
          description = StringUtils.fillIn(singleStatementPatternString, {
            statement: description
          });
        } else {
          // touching wall, not inducing charge, wrap with punctuation for this context
          const balloonCenter = this.balloonModel.getCenter();
          description = WallDescriber.getNoChangeInChargesDescription(BASEDescriber.getPositionDescription(balloonCenter, wallVisible));
          description = StringUtils.fillIn(singleStatementPatternString, {
            statement: description
          });
        }

        // include a statement that the wall has many pairs of positive and negative charges
        description = StringUtils.fillIn(wallInducedChargeWithManyPairsPatternString, {
          inducedCharge: description,
          chargePairs: wallHasManyChargesString
        });
      }
    } else if (onSweater) {
      description = SweaterDescriber.getRelativeChargeDescriptionWithLabel(this.model.sweater.chargeProperty.get(), chargesShown);
    }
    return description;
  }

  /**
   * Get a description of how induced charge changes as a charged balloon moves around a wall. Every time we
   * generate this description we store two variables for hysteresis. We track the magnitude of force so that
   * we can determine the change in force between generations of this description. We track the normalized value
   * of this force so that we can determine if the force increases or decreases multiple times in a row. This
   * function will return something like
   * "Negative charges in wall begin to move away from Yellow Balloon."
   * "Negative charges in wall move away a little more from green balloon."
   * "Negative charges in wall begin to return."
   * "Negative charges in wall return a little more."
   *
   * @public
   *
   * @returns {string}
   */
  getInducedChargeChangeDescription() {
    let descriptionString;
    const wallVisible = this.model.wall.isVisibleProperty.get();

    // the force between the balloon and the closest charge to the balloon in the wall
    const balloonForce = BalloonModel.getForceToClosestWallCharge(this.balloonModel);
    const forceMagnitude = balloonForce.magnitude;
    assert && assert(forceMagnitude !== 0, 'there should be non-zero force magnitude for induced charge');

    // change in force magnitude on charges in the wall - sign determines if balloon is inducing more or less
    // charge in the wall, but there must be some change since the last description
    const forceDelta = forceMagnitude - this.previousForceMagnitude;

    // if the sign of the change in force hasn't changed, then the balloon has continued to apply force on
    // wall charges in the same direction since the last time this change was described
    const forceDeltaNormalized = forceDelta / Math.abs(forceDelta);
    const continuedDirection = forceDeltaNormalized === this.previousForceMagnitudeNormalized;

    // describes the position of induced charge in the wall
    const balloonY = this.balloonModel.getCenterY();
    const chargePosition = new Vector2(PlayAreaMap.X_POSITIONS.AT_WALL, balloonY);
    const chargePositionString = BASEDescriber.getPositionDescription(chargePosition, wallVisible);
    let movementString;
    if (forceDelta === 0) {
      // it is possible that in a drag sequence the balloon has moved such that there
      // is no change in force or charges since they were last described
      descriptionString = WallDescriber.getNoChangeInChargesDescription(chargePositionString);
    } else if (forceDelta > 0) {
      if (continuedDirection) {
        // the charges are continuing to move away from the balloon
        descriptionString = StringUtils.fillIn(moreInducedChargePatternString, {
          position: chargePositionString,
          movement: moveAwayALittleMoreString,
          balloon: this.accessibleName
        });
      } else {
        // first time charges are moving away from balloon, just say that charges in wall move away
        descriptionString = WallDescriber.getInducedChargeDescriptionWithNoAmount(this.balloonModel, this.accessibleName, wallVisible);
      }
    } else {
      // charges are moving back to resting position
      movementString = continuedDirection ? returnALittleMoreString : beginToReturnString;
      descriptionString = StringUtils.fillIn(lessInducedChargePatternString, {
        position: chargePositionString,
        movement: movementString
      });
    }

    // hysteresis so that we can change the description if the induced charge continues to increase or decrease
    // next time
    this.previousForceMagnitudeNormalized = forceDeltaNormalized;
    this.previousForceMagnitude = balloonForce.magnitude;
    return descriptionString;
  }

  /**
   * Reset the tracked forces that determine the next description of induced charge change.
   * @public
   */
  resetReferenceForces() {
    this.previousForceMagnitude = BalloonModel.getForceToClosestWallCharge(this.balloonModel).magnitude;
    this.previousForceMagnitudeNormalized = 0;
  }

  /**
   * Return whether or not change in induced charge should be described for the balloon. If the balloon not on
   * the wall and is inducing charge while all charges are visible we will always describe change. If we described
   * that the charges moved away from the balloon, we will always describe the return of induced charges at least
   * once.
   * @public
   *
   * @returns {boolean}
   */
  describeInducedChargeChange() {
    const chargesShown = this.showChargesProperty.get();
    const wallVisible = this.wall.isVisibleProperty.get();
    const jumping = this.balloonModel.jumping;
    return !jumping && !this.balloonModel.touchingWall() && wallVisible && chargesShown === 'all' && this.balloonModel.inducingChargeProperty.get();
  }

  /**
   * A description of the balloon's relative charge but modified slightly for the context of the screen summary.
   * @public
   *
   * @returns {string}
   */
  getSummaryRelativeChargeDescription() {
    const chargesShown = this.showChargesProperty.get();
    if (this.balloonModel.chargeProperty.get() === 0 && chargesShown === 'all') {
      return summaryBalloonNeutralChargeString;
    } else {
      return BalloonChargeDescriber.getRelativeChargeDescription(this.balloonModel, chargesShown);
    }
  }

  /**
   * Get a description that indicates how much charge the balloon has, and how much charge is showing depending
   * on charge view. Will return something like
   * "Has zero net charge, showing no charges." or
   * "Has zero net charge, many pairs of positive and negative charges"
   *
   * @public
   *
   * @returns {string}
   */
  getHasRelativeChargeDescription() {
    const balloonCharge = this.balloonModel.chargeProperty.get();
    const chargesShown = this.showChargesProperty.get();
    let chargeDescription = BalloonChargeDescriber.getRelativeChargeDescription(this.balloonModel, chargesShown);
    if (chargesShown === 'all') {
      chargeDescription = StringUtils.fillIn(balloonHasChargePatternString, {
        charge: chargeDescription
      });
    } else if (chargesShown === 'diff') {
      const chargeString = balloonCharge < 0 ? balloonNegativeString : balloonZeroString;
      chargeDescription = StringUtils.fillIn(balloonHasChargeShowingPatternString, {
        charge: chargeString,
        showing: chargeDescription
      });
    }
    return chargeDescription;
  }

  /**
   * Reset flags that track state between descriptions.
   * @public
   */
  reset() {
    this.previousForceMagnitude = 0;
    this.previousForceMagnitudeNormalized = 0;
  }

  //--------------------------------------------------------------------------
  // statics
  //--------------------------------------------------------------------------

  /**
   * Get the relative charge description of a balloon, will return something like
   * "no more negative charges than positive charges" or
   * "several more negative charges than positive charges" or
   * "showing several negative charges"
   *
   * @public
   *
   * @param {BalloonModel} balloonModel
   * @param {string} showCharges - one of 'all', 'none, 'diff'
   * @returns {string}
   */
  static getRelativeChargeDescription(balloonModel, showCharges) {
    let description;
    const chargeValue = Math.abs(balloonModel.chargeProperty.get());

    // if charge view is 'diff' and there are no charges, we simply say that there are no
    // charges shown
    if (chargeValue === 0 && showCharges === 'diff') {
      description = showingNoChargesString;
    } else {
      const relativeChargesString = BASEDescriber.getRelativeChargeDescription(chargeValue);
      let stringPattern;
      if (showCharges === 'all') {
        stringPattern = balloonRelativeChargePatternString;
      } else if (showCharges === 'diff') {
        stringPattern = balloonChargeDifferencesPatternString;
      }
      assert && assert(stringPattern, `stringPattern not found for showChargesProperty value ${showCharges}`);
      description = StringUtils.fillIn(stringPattern, {
        amount: relativeChargesString
      });
    }
    return description;
  }

  /**
   * Get the relative charge with the accessible label, something like
   * "Yellow balloon has a few more negative charges than positive charges." or
   * "Yellow balloon has negative net charge, showing several negative charges." or
   * "Yellow balloon has zero net charge, showing no charges."
   *
   * Dependent on the charge view.
   *
   * @public
   *
   * @returns {string}
   */
  static getRelativeChargeDescriptionWithLabel(balloonModel, showCharges, label) {
    let description;
    const relativeCharge = BalloonChargeDescriber.getRelativeChargeDescription(balloonModel, showCharges);
    assert && assert(showCharges !== 'none', 'relative description with label should never be read when no charges are shown');
    if (showCharges === 'all') {
      description = StringUtils.fillIn(balloonHasRelativeChargePatternString, {
        balloonLabel: label,
        relativeCharge: relativeCharge
      });
    } else if (showCharges === 'diff') {
      const balloonCharge = balloonModel.chargeProperty.get();
      const chargeString = balloonCharge < 0 ? balloonNegativeString : balloonZeroString;
      description = StringUtils.fillIn(balloonHasNetChargePatternString, {
        balloon: label,
        charge: chargeString,
        showing: relativeCharge
      });
    }
    return description;
  }
}
balloonsAndStaticElectricity.register('BalloonChargeDescriber', BalloonChargeDescriber);
export default BalloonChargeDescriber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU3RyaW5nVXRpbHMiLCJiYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5IiwiQkFTRUExMXlTdHJpbmdzIiwiQmFsbG9vbk1vZGVsIiwiUGxheUFyZWFNYXAiLCJCQVNFRGVzY3JpYmVyIiwiU3dlYXRlckRlc2NyaWJlciIsIldhbGxEZXNjcmliZXIiLCJzdW1tYXJ5QmFsbG9vbk5ldXRyYWxDaGFyZ2VTdHJpbmciLCJzdW1tYXJ5QmFsbG9vbk5ldXRyYWxDaGFyZ2UiLCJ2YWx1ZSIsImJhbGxvb25OZXRDaGFyZ2VQYXR0ZXJuU3RyaW5nIiwiYmFsbG9vbk5ldENoYXJnZVBhdHRlcm4iLCJiYWxsb29uWmVyb1N0cmluZyIsImJhbGxvb25aZXJvIiwiYmFsbG9vbk5lZ2F0aXZlU3RyaW5nIiwiYmFsbG9vbk5lZ2F0aXZlIiwiYmFsbG9vblJlbGF0aXZlQ2hhcmdlUGF0dGVyblN0cmluZyIsImJhbGxvb25SZWxhdGl2ZUNoYXJnZVBhdHRlcm4iLCJiYWxsb29uQ2hhcmdlRGlmZmVyZW5jZXNQYXR0ZXJuU3RyaW5nIiwiYmFsbG9vbkNoYXJnZURpZmZlcmVuY2VzUGF0dGVybiIsIm1vcmVJbmR1Y2VkQ2hhcmdlUGF0dGVyblN0cmluZyIsIm1vcmVJbmR1Y2VkQ2hhcmdlUGF0dGVybiIsImxlc3NJbmR1Y2VkQ2hhcmdlUGF0dGVyblN0cmluZyIsImxlc3NJbmR1Y2VkQ2hhcmdlUGF0dGVybiIsImJhbGxvb25SZWxhdGl2ZUNoYXJnZUFsbFBhdHRlcm5TdHJpbmciLCJiYWxsb29uUmVsYXRpdmVDaGFyZ2VBbGxQYXR0ZXJuIiwiY29tYmluZWRDaGFyZ2VQYXR0ZXJuU3RyaW5nIiwiY29tYmluZWRDaGFyZ2VQYXR0ZXJuIiwid2FsbEluZHVjZWRDaGFyZ2VXaXRoTWFueVBhaXJzUGF0dGVyblN0cmluZyIsIndhbGxJbmR1Y2VkQ2hhcmdlV2l0aE1hbnlQYWlyc1BhdHRlcm4iLCJlYWNoQmFsbG9vblN0cmluZyIsImVhY2hCYWxsb29uIiwic2luZ2xlU3RhdGVtZW50UGF0dGVyblN0cmluZyIsInNpbmdsZVN0YXRlbWVudFBhdHRlcm4iLCJ3YWxsSGFzTWFueUNoYXJnZXNTdHJpbmciLCJ3YWxsSGFzTWFueUNoYXJnZXMiLCJiYWxsb29uSGFzUmVsYXRpdmVDaGFyZ2VQYXR0ZXJuU3RyaW5nIiwiYmFsbG9vbkhhc1JlbGF0aXZlQ2hhcmdlUGF0dGVybiIsInNob3dpbmdOb0NoYXJnZXNTdHJpbmciLCJzaG93aW5nTm9DaGFyZ2VzIiwiYmFsbG9vbkhhc05ldENoYXJnZVBhdHRlcm5TdHJpbmciLCJiYWxsb29uSGFzTmV0Q2hhcmdlUGF0dGVybiIsImJhbGxvb25OZXRDaGFyZ2VQYXR0ZXJuU3RyaW5nV2l0aExhYmVsIiwibW92ZUF3YXlBTGl0dGxlTW9yZVN0cmluZyIsIm1vdmVBd2F5QUxpdHRsZU1vcmUiLCJiZWdpblRvUmV0dXJuU3RyaW5nIiwiYmVnaW5Ub1JldHVybiIsInJldHVybkFMaXR0bGVNb3JlU3RyaW5nIiwicmV0dXJuQUxpdHRsZU1vcmUiLCJiYWxsb29uSGFzQ2hhcmdlUGF0dGVyblN0cmluZyIsImJhbGxvb25IYXNDaGFyZ2VQYXR0ZXJuIiwiYmFsbG9vbkhhc0NoYXJnZVNob3dpbmdQYXR0ZXJuU3RyaW5nIiwiYmFsbG9vbkhhc0NoYXJnZVNob3dpbmdQYXR0ZXJuIiwiQmFsbG9vbkNoYXJnZURlc2NyaWJlciIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJiYWxsb29uTW9kZWwiLCJhY2Nlc3NpYmxlTmFtZSIsIm90aGVyQWNjZXNzaWJsZU5hbWUiLCJ3YWxsIiwic2hvd0NoYXJnZXNQcm9wZXJ0eSIsInByZXZpb3VzRm9yY2VNYWduaXR1ZGUiLCJwcmV2aW91c0ZvcmNlTWFnbml0dWRlTm9ybWFsaXplZCIsImluZHVjaW5nQ2hhcmdlUHJvcGVydHkiLCJsaW5rIiwiaW5kdWNpbmdDaGFyZ2UiLCJyZXNldFJlZmVyZW5jZUZvcmNlcyIsInRvdWNoaW5nV2FsbFByb3BlcnR5IiwiaXNEcmFnZ2VkUHJvcGVydHkiLCJnZXROZXRDaGFyZ2VEZXNjcmlwdGlvbiIsImNoYXJnZUFtb3VudFN0cmluZyIsImNoYXJnZVByb3BlcnR5IiwiZ2V0IiwiZmlsbEluIiwiY2hhcmdlQW1vdW50IiwiZ2V0TmV0Q2hhcmdlRGVzY3JpcHRpb25XaXRoTGFiZWwiLCJiYWxsb29uIiwiZ2V0Q29tYmluZWRSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uIiwiYXNzZXJ0IiwiZGVzY3JpcHRpb24iLCJzYW1lQ2hhcmdlUmFuZ2UiLCJnZXRCYWxsb29uc1Zpc2libGVXaXRoU2FtZUNoYXJnZVJhbmdlIiwib3RoZXIiLCJjaGFyZ2VzU2hvd24iLCJnZXRSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uV2l0aExhYmVsIiwiZ3JhYmJlZEJhbGxvb25EZXNjcmlwdGlvbiIsImJvdGhCYWxsb29uc1Zpc2libGUiLCJvdGhlckJhbGxvb25EZXNjcmlwdGlvbiIsImdyYWJiZWRCYWxsb29uIiwib3RoZXJCYWxsb29uIiwiY2hhcmdlIiwiZ2V0UmVsYXRpdmVDaGFyZ2VEZXNjcmlwdGlvbiIsImdldE90aGVyT2JqZWN0Q2hhcmdlRGVzY3JpcHRpb24iLCJpbmR1Y2luZ0NoYXJnZU9yVG91Y2hpbmdXYWxsIiwidG91Y2hpbmdXYWxsIiwib25Td2VhdGVyIiwid2FsbFZpc2libGUiLCJpc1Zpc2libGVQcm9wZXJ0eSIsImJhbGxvb25zQWRqYWNlbnQiLCJnZXRCYWxsb29uc0FkamFjZW50IiwiZ2V0V2FsbENoYXJnZURlc2NyaXB0aW9uV2l0aExhYmVsIiwieWVsbG93QmFsbG9vbiIsImdyZWVuQmFsbG9vbiIsInN0YXRlbWVudCIsImluZHVjaW5nQ2hhcmdlQW5kVmlzaWJsZSIsImdldENvbWJpbmVkSW5kdWNlZENoYXJnZURlc2NyaXB0aW9uIiwiZ2V0SW5kdWNlZENoYXJnZURlc2NyaXB0aW9uIiwiYmFsbG9vbkNlbnRlciIsImdldENlbnRlciIsImdldE5vQ2hhbmdlSW5DaGFyZ2VzRGVzY3JpcHRpb24iLCJnZXRQb3NpdGlvbkRlc2NyaXB0aW9uIiwiaW5kdWNlZENoYXJnZSIsImNoYXJnZVBhaXJzIiwic3dlYXRlciIsImdldEluZHVjZWRDaGFyZ2VDaGFuZ2VEZXNjcmlwdGlvbiIsImRlc2NyaXB0aW9uU3RyaW5nIiwiYmFsbG9vbkZvcmNlIiwiZ2V0Rm9yY2VUb0Nsb3Nlc3RXYWxsQ2hhcmdlIiwiZm9yY2VNYWduaXR1ZGUiLCJtYWduaXR1ZGUiLCJmb3JjZURlbHRhIiwiZm9yY2VEZWx0YU5vcm1hbGl6ZWQiLCJNYXRoIiwiYWJzIiwiY29udGludWVkRGlyZWN0aW9uIiwiYmFsbG9vblkiLCJnZXRDZW50ZXJZIiwiY2hhcmdlUG9zaXRpb24iLCJYX1BPU0lUSU9OUyIsIkFUX1dBTEwiLCJjaGFyZ2VQb3NpdGlvblN0cmluZyIsIm1vdmVtZW50U3RyaW5nIiwicG9zaXRpb24iLCJtb3ZlbWVudCIsImdldEluZHVjZWRDaGFyZ2VEZXNjcmlwdGlvbldpdGhOb0Ftb3VudCIsImRlc2NyaWJlSW5kdWNlZENoYXJnZUNoYW5nZSIsImp1bXBpbmciLCJnZXRTdW1tYXJ5UmVsYXRpdmVDaGFyZ2VEZXNjcmlwdGlvbiIsImdldEhhc1JlbGF0aXZlQ2hhcmdlRGVzY3JpcHRpb24iLCJiYWxsb29uQ2hhcmdlIiwiY2hhcmdlRGVzY3JpcHRpb24iLCJjaGFyZ2VTdHJpbmciLCJzaG93aW5nIiwicmVzZXQiLCJzaG93Q2hhcmdlcyIsImNoYXJnZVZhbHVlIiwicmVsYXRpdmVDaGFyZ2VzU3RyaW5nIiwic3RyaW5nUGF0dGVybiIsImFtb3VudCIsImxhYmVsIiwicmVsYXRpdmVDaGFyZ2UiLCJiYWxsb29uTGFiZWwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJhbGxvb25DaGFyZ2VEZXNjcmliZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIGRlc2NyaXB0aW9ucyBhYm91dCB0byB0aGUgYmFsbG9vbidzIGNoYXJnZSwgd2hpY2ggaXMgZGVwZW5kZW50IG9uIHdoaWNoIGNoYXJnZXMgYXJlIHZpc2libGVcclxuICogaW4gdGhlIHNpbSBhbmQgdGhlIHZhbHVlIG9mIEJBU0VNb2RlbC5zaG93Q2hhcmdlc1Byb3BlcnR5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBiYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5IGZyb20gJy4uLy4uLy4uL2JhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkuanMnO1xyXG5pbXBvcnQgQkFTRUExMXlTdHJpbmdzIGZyb20gJy4uLy4uL0JBU0VBMTF5U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBCYWxsb29uTW9kZWwgZnJvbSAnLi4vLi4vbW9kZWwvQmFsbG9vbk1vZGVsLmpzJztcclxuaW1wb3J0IFBsYXlBcmVhTWFwIGZyb20gJy4uLy4uL21vZGVsL1BsYXlBcmVhTWFwLmpzJztcclxuaW1wb3J0IEJBU0VEZXNjcmliZXIgZnJvbSAnLi9CQVNFRGVzY3JpYmVyLmpzJztcclxuaW1wb3J0IFN3ZWF0ZXJEZXNjcmliZXIgZnJvbSAnLi9Td2VhdGVyRGVzY3JpYmVyLmpzJztcclxuaW1wb3J0IFdhbGxEZXNjcmliZXIgZnJvbSAnLi9XYWxsRGVzY3JpYmVyLmpzJztcclxuXHJcbmNvbnN0IHN1bW1hcnlCYWxsb29uTmV1dHJhbENoYXJnZVN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5zdW1tYXJ5QmFsbG9vbk5ldXRyYWxDaGFyZ2UudmFsdWU7XHJcbmNvbnN0IGJhbGxvb25OZXRDaGFyZ2VQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmJhbGxvb25OZXRDaGFyZ2VQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBiYWxsb29uWmVyb1N0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5iYWxsb29uWmVyby52YWx1ZTtcclxuY29uc3QgYmFsbG9vbk5lZ2F0aXZlU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmJhbGxvb25OZWdhdGl2ZS52YWx1ZTtcclxuY29uc3QgYmFsbG9vblJlbGF0aXZlQ2hhcmdlUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5iYWxsb29uUmVsYXRpdmVDaGFyZ2VQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBiYWxsb29uQ2hhcmdlRGlmZmVyZW5jZXNQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmJhbGxvb25DaGFyZ2VEaWZmZXJlbmNlc1BhdHRlcm4udmFsdWU7XHJcbmNvbnN0IG1vcmVJbmR1Y2VkQ2hhcmdlUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5tb3JlSW5kdWNlZENoYXJnZVBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IGxlc3NJbmR1Y2VkQ2hhcmdlUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5sZXNzSW5kdWNlZENoYXJnZVBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IGJhbGxvb25SZWxhdGl2ZUNoYXJnZUFsbFBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYmFsbG9vblJlbGF0aXZlQ2hhcmdlQWxsUGF0dGVybi52YWx1ZTtcclxuY29uc3QgY29tYmluZWRDaGFyZ2VQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmNvbWJpbmVkQ2hhcmdlUGF0dGVybi52YWx1ZTtcclxuY29uc3Qgd2FsbEluZHVjZWRDaGFyZ2VXaXRoTWFueVBhaXJzUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy53YWxsSW5kdWNlZENoYXJnZVdpdGhNYW55UGFpcnNQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBlYWNoQmFsbG9vblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5lYWNoQmFsbG9vbi52YWx1ZTtcclxuY29uc3Qgc2luZ2xlU3RhdGVtZW50UGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5zaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCB3YWxsSGFzTWFueUNoYXJnZXNTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Mud2FsbEhhc01hbnlDaGFyZ2VzLnZhbHVlO1xyXG5jb25zdCBiYWxsb29uSGFzUmVsYXRpdmVDaGFyZ2VQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmJhbGxvb25IYXNSZWxhdGl2ZUNoYXJnZVBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IHNob3dpbmdOb0NoYXJnZXNTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Muc2hvd2luZ05vQ2hhcmdlcy52YWx1ZTtcclxuY29uc3QgYmFsbG9vbkhhc05ldENoYXJnZVBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYmFsbG9vbkhhc05ldENoYXJnZVBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IGJhbGxvb25OZXRDaGFyZ2VQYXR0ZXJuU3RyaW5nV2l0aExhYmVsID0gQkFTRUExMXlTdHJpbmdzLmJhbGxvb25OZXRDaGFyZ2VQYXR0ZXJuU3RyaW5nV2l0aExhYmVsLnZhbHVlO1xyXG5jb25zdCBtb3ZlQXdheUFMaXR0bGVNb3JlU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLm1vdmVBd2F5QUxpdHRsZU1vcmUudmFsdWU7XHJcbmNvbnN0IGJlZ2luVG9SZXR1cm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYmVnaW5Ub1JldHVybi52YWx1ZTtcclxuY29uc3QgcmV0dXJuQUxpdHRsZU1vcmVTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MucmV0dXJuQUxpdHRsZU1vcmUudmFsdWU7XHJcbmNvbnN0IGJhbGxvb25IYXNDaGFyZ2VQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmJhbGxvb25IYXNDaGFyZ2VQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBiYWxsb29uSGFzQ2hhcmdlU2hvd2luZ1BhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYmFsbG9vbkhhc0NoYXJnZVNob3dpbmdQYXR0ZXJuLnZhbHVlO1xyXG5cclxuY2xhc3MgQmFsbG9vbkNoYXJnZURlc2NyaWJlciB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtCQVNFTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtCYWxsb29uTW9kZWx9IGJhbGxvb25Nb2RlbFxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhY2Nlc3NpYmxlTmFtZSAtIHRoZSBhY2Nlc3NpYmxlIG5hbWUgZm9yIHRoaXMgYmFsbG9vblxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvdGhlckFjY2Vzc2libGVOYW1lIC0gdGhlIGFjY2Vzc2libGUgbmFtZSBmb3IgdGhlIG90aGVyIGJhbGxvb24gaW4gdGhpcyBzaW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIGJhbGxvb25Nb2RlbCwgYWNjZXNzaWJsZU5hbWUsIG90aGVyQWNjZXNzaWJsZU5hbWUgKSB7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuICAgIHRoaXMuYmFsbG9vbk1vZGVsID0gYmFsbG9vbk1vZGVsO1xyXG4gICAgdGhpcy53YWxsID0gbW9kZWwud2FsbDtcclxuICAgIHRoaXMuYWNjZXNzaWJsZU5hbWUgPSBhY2Nlc3NpYmxlTmFtZTtcclxuICAgIHRoaXMub3RoZXJBY2Nlc3NpYmxlTmFtZSA9IG90aGVyQWNjZXNzaWJsZU5hbWU7XHJcbiAgICB0aGlzLnNob3dDaGFyZ2VzUHJvcGVydHkgPSBtb2RlbC5zaG93Q2hhcmdlc1Byb3BlcnR5O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gQWxsb3dzIHVzIHRvIHRyYWNrIHRoZSBjaGFuZ2UgaW4gdGhlIGJhbGxvb24ncyBpbmR1Y2VkIGNoYXJnZSwgdXNlZnVsIGZvciBkZXNjcmliaW5nIGhvdyB0aGUgY2hhcmdlc1xyXG4gICAgLy8gbW92ZSB0b3dhcmRzIG9yIGF3YXkgdGhlaXIgcmVzdGluZyBwb3NpdGlvbnNcclxuICAgIHRoaXMucHJldmlvdXNGb3JjZU1hZ25pdHVkZSA9IDA7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBUaGUgcHJldmlvdXMgbWFnbml0dWRlIG9mIGZvcmNlIGRlbHRhIG5vcm1hbGl6ZWQsIHNvIHdlIGNhbiB0cmFjayB3aGV0aGVyIGluZHVjZWQgY2hhcmdlIGluY3JlYXNlcyBvclxyXG4gICAgLy8gZGVjcmVhc2VzIGJldHdlZW4gd2hlbiBhIGRlc2NyaXB0aW9uIG9mIGluZHVjZWQgY2hhcmdlIGNoYW5nZSBpcyB0cmlnZ2VyZWQuIFVzZWZ1bCBmb3IgZGVzY3JpYmluZyBob3cgaW5kdWNlZFxyXG4gICAgLy8gY2hhcmdlIGNoYW5nZXMgYmV0d2VlbiBjb25zZWN1dGl2ZSBiYWxsb29uIG1vdmVtZW50cywgc28gd2UgY2FuIHNheSBjaGFyZ2VzIFwiY29udGludWVcIiB0byBtb3ZlIGF3YXkuXHJcbiAgICB0aGlzLnByZXZpb3VzRm9yY2VNYWduaXR1ZGVOb3JtYWxpemVkID0gMDtcclxuXHJcbiAgICAvLyBsaXN0ZW5lcnMsIG5vIG5lZWQgdG8gdW5saW5rXHJcbiAgICAvLyBpZiB0aGUgYmFsbG9vbiBpcyBubyBsb25nZXIgaW5kdWNpbmcgY2hhcmdlLCByZXNldCByZWZlcmVuY2UgZm9yY2VzIHVudGlsIGJhbGxvb24gYmVnaW5zIHRvIGluZHVjZSBjaGFyZ2UgYWdhaW5cclxuICAgIGJhbGxvb25Nb2RlbC5pbmR1Y2luZ0NoYXJnZVByb3BlcnR5LmxpbmsoIGluZHVjaW5nQ2hhcmdlID0+IHtcclxuICAgICAgaWYgKCAhaW5kdWNpbmdDaGFyZ2UgKSB7XHJcbiAgICAgICAgdGhpcy5yZXNldFJlZmVyZW5jZUZvcmNlcygpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gd2hlbiB0aGUgYmFsbG9vbiB0b3VjaGVzIHRoZSB3YWxsLCB2YWx1ZXMgdGhhdCBoZWxwIGRlc2NyaWJlIGNoYW5nZSBpbiBjaGFyZ2VzXHJcbiAgICBiYWxsb29uTW9kZWwudG91Y2hpbmdXYWxsUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICB0aGlzLnJlc2V0UmVmZXJlbmNlRm9yY2VzKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gd2hlbiB0aGUgYmFsbG9vbiBpcyBncmFiYmVkIG9yIHJlbGVhc2VkLCByZXNldCByZWZlcmVuY2UgZm9yY2VzIGZvciBkZXNjcmliaW5nIGNoYW5nZXMgdG8gaW5kdWNlZCBjaGFyZ2VcclxuICAgIC8vIGluIHRoZSB3YWxsXHJcbiAgICBiYWxsb29uTW9kZWwuaXNEcmFnZ2VkUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICB0aGlzLnJlc2V0UmVmZXJlbmNlRm9yY2VzKCk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgZGVzY3JpcHRpb24gb2YgdGhlICBuZXQgY2hhcmdlLiBXaWxsIHJldHVybiBzb21ldGhpbmcgbGlrZVxyXG4gICAqIFwiSGFzIG5lZ2F0aXZlIG5ldCBjaGFyZ2UuXCIgb3JcclxuICAgKiBcIkhhcyBuZXV0cmFsIG5ldCBjaGFyZ2UuXCJcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0TmV0Q2hhcmdlRGVzY3JpcHRpb24oKSB7XHJcbiAgICBjb25zdCBjaGFyZ2VBbW91bnRTdHJpbmcgPSB0aGlzLmJhbGxvb25Nb2RlbC5jaGFyZ2VQcm9wZXJ0eS5nZXQoKSA8IDAgPyBiYWxsb29uTmVnYXRpdmVTdHJpbmcgOiBiYWxsb29uWmVyb1N0cmluZztcclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIGJhbGxvb25OZXRDaGFyZ2VQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIGNoYXJnZUFtb3VudDogY2hhcmdlQW1vdW50U3RyaW5nXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBkZXNjcmlwdGlvbiBvZiB0aGUgbmV0IGNoYXJnZSBmb3IgdGhlIGJhbGxvb24sIGluY2x1ZGluZyB0aGUgbGFiZWwuIFdpbGwgcmV0dXJuIHNvbWV0aGluZyBsaWtlXHJcbiAgICogXCJZZWxsb3cgYmFsbG9vbiBoYXMgbmVnYXRpdmUgbmV0IGNoYXJnZS5cIiBvclxyXG4gICAqIFwiR3JlZW4gYmFsbG9vbiBoYXMgbm8gbmV0IGNoYXJnZS5cIlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXROZXRDaGFyZ2VEZXNjcmlwdGlvbldpdGhMYWJlbCgpIHtcclxuICAgIGNvbnN0IGNoYXJnZUFtb3VudFN0cmluZyA9IHRoaXMuYmFsbG9vbk1vZGVsLmNoYXJnZVByb3BlcnR5LmdldCgpIDwgMCA/IGJhbGxvb25OZWdhdGl2ZVN0cmluZyA6IGJhbGxvb25aZXJvU3RyaW5nO1xyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggYmFsbG9vbk5ldENoYXJnZVBhdHRlcm5TdHJpbmdXaXRoTGFiZWwsIHtcclxuICAgICAgY2hhcmdlQW1vdW50OiBjaGFyZ2VBbW91bnRTdHJpbmcsXHJcbiAgICAgIGJhbGxvb246IHRoaXMuYWNjZXNzaWJsZU5hbWVcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgY29tYmluZWQgcmVsYXRpdmUgY2hhcmdlIGRlc2NyaXB0aW9uIGZvciBlYWNoIGJhbGxvb24uIFdpbGwgcmV0dXJuIHNvbWV0aGluZyBsaWtlXHJcbiAgICpcclxuICAgKiBcIkVhY2ggYmFsbG9vbiBoYXMgemVybyBuZXQgY2hhcmdlLCBzaG93aW5nIG5vIGNoYXJnZXMuXCIgb3JcclxuICAgKiBcIkdyZWVuIGJhbGxvb24gaGFzIG5lZ2F0aXZlIG5ldCBjaGFyZ2UsIHNob3dpbmcgYSBmZXcgbmVnYXRpdmUgY2hhcmdlcy4gWWVsbG93IGJhbGxvb24gaGFzIHplcm8gbmV0IGNoYXJnZSxcclxuICAgKiAgIHNob3dpbmcgbm8gY2hhcmdlcy5cIiBvclxyXG4gICAqIFwiRWFjaCBiYWxsb29uIGhhcyBubyBtb3JlIG5lZ2F0aXZlIGNoYXJnZXMgdGhhbiBwb3NpdGl2ZSBjaGFyZ2VzLlwiIG9yXHJcbiAgICogXCJHcmVlbiBiYWxsb29uIGhhcyBzZXZlcmFsIG1vcmUgbmVnYXRpdmUgY2hhcmdlcyB0aGFuIHBvc2l0aXZlICBjaGFyZ2VzLiBZZWxsb3cgYmFsbG9vbiBoYXMgc2V2ZXJhbCBtb3JlXHJcbiAgICogICBuZWdhdGl2ZSBjaGFyZ2VzIHRoYW4gcG9zaXRpdmUgY2hhcmdlcy5cIiBvclxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRDb21iaW5lZFJlbGF0aXZlQ2hhcmdlRGVzY3JpcHRpb24oKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmJhbGxvb25Nb2RlbC5pc0RyYWdnZWRQcm9wZXJ0eS5nZXQoKSwgJ2FsZXJ0IHNob3VsZCBvbmx5IGJlIGdlbmVyYXRlZCBpZiBiYWxsb29uIGlzIGdyYWJiZWQnICk7XHJcbiAgICBsZXQgZGVzY3JpcHRpb247XHJcblxyXG4gICAgLy8gdGhlIHJlbGF0aXZlIGNoYXJnZSwgdXNlZCBpbiBhbGwgY2FzZXNcclxuICAgIGNvbnN0IHNhbWVDaGFyZ2VSYW5nZSA9IEJBU0VEZXNjcmliZXIuZ2V0QmFsbG9vbnNWaXNpYmxlV2l0aFNhbWVDaGFyZ2VSYW5nZSggdGhpcy5iYWxsb29uTW9kZWwsIHRoaXMuYmFsbG9vbk1vZGVsLm90aGVyICk7XHJcblxyXG4gICAgY29uc3QgY2hhcmdlc1Nob3duID0gdGhpcy5zaG93Q2hhcmdlc1Byb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIC8vIGlmIGJvdGggYmFsbG9vbnMgaGF2ZSB0aGUgc2FtZSBjaGFyZ2UgcmFuZ2UsIGRlc2NyaWJlIHRvZ2V0aGVoclxyXG4gICAgaWYgKCBzYW1lQ2hhcmdlUmFuZ2UgKSB7XHJcbiAgICAgIGRlc2NyaXB0aW9uID0gQmFsbG9vbkNoYXJnZURlc2NyaWJlci5nZXRSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uV2l0aExhYmVsKCB0aGlzLmJhbGxvb25Nb2RlbCwgY2hhcmdlc1Nob3duLCBlYWNoQmFsbG9vblN0cmluZyApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNvbnN0IGdyYWJiZWRCYWxsb29uRGVzY3JpcHRpb24gPSBCYWxsb29uQ2hhcmdlRGVzY3JpYmVyLmdldFJlbGF0aXZlQ2hhcmdlRGVzY3JpcHRpb25XaXRoTGFiZWwoIHRoaXMuYmFsbG9vbk1vZGVsLCBjaGFyZ2VzU2hvd24sIHRoaXMuYWNjZXNzaWJsZU5hbWUgKTtcclxuXHJcbiAgICAgIGlmICggdGhpcy5tb2RlbC5ib3RoQmFsbG9vbnNWaXNpYmxlKCkgKSB7XHJcbiAgICAgICAgY29uc3Qgb3RoZXJCYWxsb29uRGVzY3JpcHRpb24gPSBCYWxsb29uQ2hhcmdlRGVzY3JpYmVyLmdldFJlbGF0aXZlQ2hhcmdlRGVzY3JpcHRpb25XaXRoTGFiZWwoIHRoaXMuYmFsbG9vbk1vZGVsLm90aGVyLCBjaGFyZ2VzU2hvd24sIHRoaXMub3RoZXJBY2Nlc3NpYmxlTmFtZSApO1xyXG5cclxuICAgICAgICBkZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggY29tYmluZWRDaGFyZ2VQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgICBncmFiYmVkQmFsbG9vbjogZ3JhYmJlZEJhbGxvb25EZXNjcmlwdGlvbixcclxuICAgICAgICAgIG90aGVyQmFsbG9vbjogb3RoZXJCYWxsb29uRGVzY3JpcHRpb25cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIGp1c3QgdGhlIHZpc2libGUgYmFsbG9vbiwgdGhpcyBkZXNjcmlwdGlvbiBzaG91bGQgbm90IGluY2x1ZGUgdGhlIGJhbGxvb24ncycgbGFiZWxcclxuICAgICAgICBkZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggYmFsbG9vblJlbGF0aXZlQ2hhcmdlQWxsUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgICAgY2hhcmdlOiBCYWxsb29uQ2hhcmdlRGVzY3JpYmVyLmdldFJlbGF0aXZlQ2hhcmdlRGVzY3JpcHRpb24oIHRoaXMuYmFsbG9vbk1vZGVsLCBjaGFyZ2VzU2hvd24gKVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZXNjcmlwdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGRlc2NyaXB0aW9uIG9mIHRoZSBpbmR1Y2VkIGNoYXJnZSBpbiB0aGUgd2FsbCBvciB0aGUgY2hhcmdlIG9mIHRoZSBzd2VhdGVyLiBUbyBiZSB1c2VkIGJ5IHRoZSBcImdyYWJcIiBhbGVydFxyXG4gICAqIHdoZW4gdGhlIGJhbGxvb24gaXMgcGlja2VkIHVwLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRPdGhlck9iamVjdENoYXJnZURlc2NyaXB0aW9uKCkge1xyXG4gICAgY29uc3QgaW5kdWNpbmdDaGFyZ2VPclRvdWNoaW5nV2FsbCA9IHRoaXMuYmFsbG9vbk1vZGVsLmluZHVjaW5nQ2hhcmdlUHJvcGVydHkuZ2V0KCkgfHwgdGhpcy5iYWxsb29uTW9kZWwudG91Y2hpbmdXYWxsKCk7XHJcbiAgICBjb25zdCBvblN3ZWF0ZXIgPSB0aGlzLmJhbGxvb25Nb2RlbC5vblN3ZWF0ZXIoKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9uU3dlYXRlciB8fCBpbmR1Y2luZ0NoYXJnZU9yVG91Y2hpbmdXYWxsLCAnb25seSBpbmNsdWRlIHRoaXMgcGhyYXNlIHdoZW4gYmFsbG9vbiBpcyBpbmR1Y2luZyBjaGFyZ2Ugb3Igb24gc3dlYXRlcicgKTtcclxuICAgIGxldCBkZXNjcmlwdGlvbjtcclxuXHJcbiAgICBjb25zdCBjaGFyZ2VzU2hvd24gPSB0aGlzLnNob3dDaGFyZ2VzUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgLy8gaWYgYmFsbG9vbiBpcyBpbmR1Y2luZyBjaGFyZ2UsIGRlc2NyaWJlIHRoYXQgb2JqZWN0XHJcbiAgICBpZiAoIGluZHVjaW5nQ2hhcmdlT3JUb3VjaGluZ1dhbGwgKSB7XHJcbiAgICAgIGNvbnN0IHdhbGxWaXNpYmxlID0gdGhpcy5tb2RlbC53YWxsLmlzVmlzaWJsZVByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgICAgaWYgKCBjaGFyZ2VzU2hvd24gPT09ICdkaWZmJyApIHtcclxuXHJcbiAgICAgICAgLy8gaWYgc2hvd2luZyBjaGFyZ2UgZGlmZmVyZW5jZXMsIG5vIGNoYXJnZXMgYXJlIHNob3duLCBzbyBpbmNsdWRlIHRoYXQgaW5mb3JtYXRpb25cclxuICAgICAgICBjb25zdCBiYWxsb29uc0FkamFjZW50ID0gdGhpcy5tb2RlbC5nZXRCYWxsb29uc0FkamFjZW50KCk7XHJcbiAgICAgICAgZGVzY3JpcHRpb24gPSBXYWxsRGVzY3JpYmVyLmdldFdhbGxDaGFyZ2VEZXNjcmlwdGlvbldpdGhMYWJlbCggdGhpcy5tb2RlbC55ZWxsb3dCYWxsb29uLCB0aGlzLm1vZGVsLmdyZWVuQmFsbG9vbiwgYmFsbG9vbnNBZGphY2VudCwgd2FsbFZpc2libGUsIGNoYXJnZXNTaG93biApO1xyXG4gICAgICAgIGRlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuU3RyaW5nLCB7IHN0YXRlbWVudDogZGVzY3JpcHRpb24gfSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICggdGhpcy5iYWxsb29uTW9kZWwuaW5kdWNpbmdDaGFyZ2VBbmRWaXNpYmxlKCkgJiYgdGhpcy5iYWxsb29uTW9kZWwub3RoZXIuaW5kdWNpbmdDaGFyZ2VBbmRWaXNpYmxlKCkgKSB7XHJcblxyXG4gICAgICAgICAgLy8gYm90aCBiYWxsb29ucyBpbmR1Y2luZyBjaGFyZ2UsIHJldHVybiBjb21iaW5lZCBkZXNjcmlwdGlvbnNcclxuICAgICAgICAgIGRlc2NyaXB0aW9uID0gV2FsbERlc2NyaWJlci5nZXRDb21iaW5lZEluZHVjZWRDaGFyZ2VEZXNjcmlwdGlvbiggdGhpcy5iYWxsb29uTW9kZWwsIHdhbGxWaXNpYmxlICk7XHJcbiAgICAgICAgICBkZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc2luZ2xlU3RhdGVtZW50UGF0dGVyblN0cmluZywgeyBzdGF0ZW1lbnQ6IGRlc2NyaXB0aW9uIH0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIHRoaXMuYmFsbG9vbk1vZGVsLmluZHVjaW5nQ2hhcmdlQW5kVmlzaWJsZSgpICkge1xyXG5cclxuICAgICAgICAgIC8vIG9ubHkgb25lIGJhbGxvb24gaW5kdWNpbmcgY2hhcmdlLCBkZXNjcmliZSB0aGlzXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbiA9IFdhbGxEZXNjcmliZXIuZ2V0SW5kdWNlZENoYXJnZURlc2NyaXB0aW9uKCB0aGlzLmJhbGxvb25Nb2RlbCwgdGhpcy5hY2Nlc3NpYmxlTmFtZSwgd2FsbFZpc2libGUgKTtcclxuICAgICAgICAgIGRlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuU3RyaW5nLCB7IHN0YXRlbWVudDogZGVzY3JpcHRpb24gfSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyB0b3VjaGluZyB3YWxsLCBub3QgaW5kdWNpbmcgY2hhcmdlLCB3cmFwIHdpdGggcHVuY3R1YXRpb24gZm9yIHRoaXMgY29udGV4dFxyXG4gICAgICAgICAgY29uc3QgYmFsbG9vbkNlbnRlciA9IHRoaXMuYmFsbG9vbk1vZGVsLmdldENlbnRlcigpO1xyXG4gICAgICAgICAgZGVzY3JpcHRpb24gPSBXYWxsRGVzY3JpYmVyLmdldE5vQ2hhbmdlSW5DaGFyZ2VzRGVzY3JpcHRpb24oIEJBU0VEZXNjcmliZXIuZ2V0UG9zaXRpb25EZXNjcmlwdGlvbiggYmFsbG9vbkNlbnRlciwgd2FsbFZpc2libGUgKSApO1xyXG4gICAgICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIHNpbmdsZVN0YXRlbWVudFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICAgICAgc3RhdGVtZW50OiBkZXNjcmlwdGlvblxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaW5jbHVkZSBhIHN0YXRlbWVudCB0aGF0IHRoZSB3YWxsIGhhcyBtYW55IHBhaXJzIG9mIHBvc2l0aXZlIGFuZCBuZWdhdGl2ZSBjaGFyZ2VzXHJcbiAgICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIHdhbGxJbmR1Y2VkQ2hhcmdlV2l0aE1hbnlQYWlyc1BhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICAgIGluZHVjZWRDaGFyZ2U6IGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgY2hhcmdlUGFpcnM6IHdhbGxIYXNNYW55Q2hhcmdlc1N0cmluZ1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIG9uU3dlYXRlciApIHtcclxuICAgICAgZGVzY3JpcHRpb24gPSBTd2VhdGVyRGVzY3JpYmVyLmdldFJlbGF0aXZlQ2hhcmdlRGVzY3JpcHRpb25XaXRoTGFiZWwoIHRoaXMubW9kZWwuc3dlYXRlci5jaGFyZ2VQcm9wZXJ0eS5nZXQoKSwgY2hhcmdlc1Nob3duICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRlc2NyaXB0aW9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgZGVzY3JpcHRpb24gb2YgaG93IGluZHVjZWQgY2hhcmdlIGNoYW5nZXMgYXMgYSBjaGFyZ2VkIGJhbGxvb24gbW92ZXMgYXJvdW5kIGEgd2FsbC4gRXZlcnkgdGltZSB3ZVxyXG4gICAqIGdlbmVyYXRlIHRoaXMgZGVzY3JpcHRpb24gd2Ugc3RvcmUgdHdvIHZhcmlhYmxlcyBmb3IgaHlzdGVyZXNpcy4gV2UgdHJhY2sgdGhlIG1hZ25pdHVkZSBvZiBmb3JjZSBzbyB0aGF0XHJcbiAgICogd2UgY2FuIGRldGVybWluZSB0aGUgY2hhbmdlIGluIGZvcmNlIGJldHdlZW4gZ2VuZXJhdGlvbnMgb2YgdGhpcyBkZXNjcmlwdGlvbi4gV2UgdHJhY2sgdGhlIG5vcm1hbGl6ZWQgdmFsdWVcclxuICAgKiBvZiB0aGlzIGZvcmNlIHNvIHRoYXQgd2UgY2FuIGRldGVybWluZSBpZiB0aGUgZm9yY2UgaW5jcmVhc2VzIG9yIGRlY3JlYXNlcyBtdWx0aXBsZSB0aW1lcyBpbiBhIHJvdy4gVGhpc1xyXG4gICAqIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIHNvbWV0aGluZyBsaWtlXHJcbiAgICogXCJOZWdhdGl2ZSBjaGFyZ2VzIGluIHdhbGwgYmVnaW4gdG8gbW92ZSBhd2F5IGZyb20gWWVsbG93IEJhbGxvb24uXCJcclxuICAgKiBcIk5lZ2F0aXZlIGNoYXJnZXMgaW4gd2FsbCBtb3ZlIGF3YXkgYSBsaXR0bGUgbW9yZSBmcm9tIGdyZWVuIGJhbGxvb24uXCJcclxuICAgKiBcIk5lZ2F0aXZlIGNoYXJnZXMgaW4gd2FsbCBiZWdpbiB0byByZXR1cm4uXCJcclxuICAgKiBcIk5lZ2F0aXZlIGNoYXJnZXMgaW4gd2FsbCByZXR1cm4gYSBsaXR0bGUgbW9yZS5cIlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRJbmR1Y2VkQ2hhcmdlQ2hhbmdlRGVzY3JpcHRpb24oKSB7XHJcbiAgICBsZXQgZGVzY3JpcHRpb25TdHJpbmc7XHJcblxyXG4gICAgY29uc3Qgd2FsbFZpc2libGUgPSB0aGlzLm1vZGVsLndhbGwuaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgLy8gdGhlIGZvcmNlIGJldHdlZW4gdGhlIGJhbGxvb24gYW5kIHRoZSBjbG9zZXN0IGNoYXJnZSB0byB0aGUgYmFsbG9vbiBpbiB0aGUgd2FsbFxyXG4gICAgY29uc3QgYmFsbG9vbkZvcmNlID0gQmFsbG9vbk1vZGVsLmdldEZvcmNlVG9DbG9zZXN0V2FsbENoYXJnZSggdGhpcy5iYWxsb29uTW9kZWwgKTtcclxuICAgIGNvbnN0IGZvcmNlTWFnbml0dWRlID0gYmFsbG9vbkZvcmNlLm1hZ25pdHVkZTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZvcmNlTWFnbml0dWRlICE9PSAwLCAndGhlcmUgc2hvdWxkIGJlIG5vbi16ZXJvIGZvcmNlIG1hZ25pdHVkZSBmb3IgaW5kdWNlZCBjaGFyZ2UnICk7XHJcblxyXG4gICAgLy8gY2hhbmdlIGluIGZvcmNlIG1hZ25pdHVkZSBvbiBjaGFyZ2VzIGluIHRoZSB3YWxsIC0gc2lnbiBkZXRlcm1pbmVzIGlmIGJhbGxvb24gaXMgaW5kdWNpbmcgbW9yZSBvciBsZXNzXHJcbiAgICAvLyBjaGFyZ2UgaW4gdGhlIHdhbGwsIGJ1dCB0aGVyZSBtdXN0IGJlIHNvbWUgY2hhbmdlIHNpbmNlIHRoZSBsYXN0IGRlc2NyaXB0aW9uXHJcbiAgICBjb25zdCBmb3JjZURlbHRhID0gZm9yY2VNYWduaXR1ZGUgLSB0aGlzLnByZXZpb3VzRm9yY2VNYWduaXR1ZGU7XHJcblxyXG4gICAgLy8gaWYgdGhlIHNpZ24gb2YgdGhlIGNoYW5nZSBpbiBmb3JjZSBoYXNuJ3QgY2hhbmdlZCwgdGhlbiB0aGUgYmFsbG9vbiBoYXMgY29udGludWVkIHRvIGFwcGx5IGZvcmNlIG9uXHJcbiAgICAvLyB3YWxsIGNoYXJnZXMgaW4gdGhlIHNhbWUgZGlyZWN0aW9uIHNpbmNlIHRoZSBsYXN0IHRpbWUgdGhpcyBjaGFuZ2Ugd2FzIGRlc2NyaWJlZFxyXG4gICAgY29uc3QgZm9yY2VEZWx0YU5vcm1hbGl6ZWQgPSBmb3JjZURlbHRhIC8gTWF0aC5hYnMoIGZvcmNlRGVsdGEgKTtcclxuICAgIGNvbnN0IGNvbnRpbnVlZERpcmVjdGlvbiA9IGZvcmNlRGVsdGFOb3JtYWxpemVkID09PSB0aGlzLnByZXZpb3VzRm9yY2VNYWduaXR1ZGVOb3JtYWxpemVkO1xyXG5cclxuICAgIC8vIGRlc2NyaWJlcyB0aGUgcG9zaXRpb24gb2YgaW5kdWNlZCBjaGFyZ2UgaW4gdGhlIHdhbGxcclxuICAgIGNvbnN0IGJhbGxvb25ZID0gdGhpcy5iYWxsb29uTW9kZWwuZ2V0Q2VudGVyWSgpO1xyXG4gICAgY29uc3QgY2hhcmdlUG9zaXRpb24gPSBuZXcgVmVjdG9yMiggUGxheUFyZWFNYXAuWF9QT1NJVElPTlMuQVRfV0FMTCwgYmFsbG9vblkgKTtcclxuICAgIGNvbnN0IGNoYXJnZVBvc2l0aW9uU3RyaW5nID0gQkFTRURlc2NyaWJlci5nZXRQb3NpdGlvbkRlc2NyaXB0aW9uKCBjaGFyZ2VQb3NpdGlvbiwgd2FsbFZpc2libGUgKTtcclxuXHJcbiAgICBsZXQgbW92ZW1lbnRTdHJpbmc7XHJcbiAgICBpZiAoIGZvcmNlRGVsdGEgPT09IDAgKSB7XHJcblxyXG4gICAgICAvLyBpdCBpcyBwb3NzaWJsZSB0aGF0IGluIGEgZHJhZyBzZXF1ZW5jZSB0aGUgYmFsbG9vbiBoYXMgbW92ZWQgc3VjaCB0aGF0IHRoZXJlXHJcbiAgICAgIC8vIGlzIG5vIGNoYW5nZSBpbiBmb3JjZSBvciBjaGFyZ2VzIHNpbmNlIHRoZXkgd2VyZSBsYXN0IGRlc2NyaWJlZFxyXG4gICAgICBkZXNjcmlwdGlvblN0cmluZyA9IFdhbGxEZXNjcmliZXIuZ2V0Tm9DaGFuZ2VJbkNoYXJnZXNEZXNjcmlwdGlvbiggY2hhcmdlUG9zaXRpb25TdHJpbmcgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBmb3JjZURlbHRhID4gMCApIHtcclxuICAgICAgaWYgKCBjb250aW51ZWREaXJlY3Rpb24gKSB7XHJcblxyXG4gICAgICAgIC8vIHRoZSBjaGFyZ2VzIGFyZSBjb250aW51aW5nIHRvIG1vdmUgYXdheSBmcm9tIHRoZSBiYWxsb29uXHJcbiAgICAgICAgZGVzY3JpcHRpb25TdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIG1vcmVJbmR1Y2VkQ2hhcmdlUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgICAgcG9zaXRpb246IGNoYXJnZVBvc2l0aW9uU3RyaW5nLFxyXG4gICAgICAgICAgbW92ZW1lbnQ6IG1vdmVBd2F5QUxpdHRsZU1vcmVTdHJpbmcsXHJcbiAgICAgICAgICBiYWxsb29uOiB0aGlzLmFjY2Vzc2libGVOYW1lXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBmaXJzdCB0aW1lIGNoYXJnZXMgYXJlIG1vdmluZyBhd2F5IGZyb20gYmFsbG9vbiwganVzdCBzYXkgdGhhdCBjaGFyZ2VzIGluIHdhbGwgbW92ZSBhd2F5XHJcbiAgICAgICAgZGVzY3JpcHRpb25TdHJpbmcgPSBXYWxsRGVzY3JpYmVyLmdldEluZHVjZWRDaGFyZ2VEZXNjcmlwdGlvbldpdGhOb0Ftb3VudCggdGhpcy5iYWxsb29uTW9kZWwsIHRoaXMuYWNjZXNzaWJsZU5hbWUsIHdhbGxWaXNpYmxlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gY2hhcmdlcyBhcmUgbW92aW5nIGJhY2sgdG8gcmVzdGluZyBwb3NpdGlvblxyXG4gICAgICBtb3ZlbWVudFN0cmluZyA9IGNvbnRpbnVlZERpcmVjdGlvbiA/IHJldHVybkFMaXR0bGVNb3JlU3RyaW5nIDogYmVnaW5Ub1JldHVyblN0cmluZztcclxuICAgICAgZGVzY3JpcHRpb25TdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIGxlc3NJbmR1Y2VkQ2hhcmdlUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIHBvc2l0aW9uOiBjaGFyZ2VQb3NpdGlvblN0cmluZyxcclxuICAgICAgICBtb3ZlbWVudDogbW92ZW1lbnRTdHJpbmdcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGh5c3RlcmVzaXMgc28gdGhhdCB3ZSBjYW4gY2hhbmdlIHRoZSBkZXNjcmlwdGlvbiBpZiB0aGUgaW5kdWNlZCBjaGFyZ2UgY29udGludWVzIHRvIGluY3JlYXNlIG9yIGRlY3JlYXNlXHJcbiAgICAvLyBuZXh0IHRpbWVcclxuICAgIHRoaXMucHJldmlvdXNGb3JjZU1hZ25pdHVkZU5vcm1hbGl6ZWQgPSBmb3JjZURlbHRhTm9ybWFsaXplZDtcclxuICAgIHRoaXMucHJldmlvdXNGb3JjZU1hZ25pdHVkZSA9IGJhbGxvb25Gb3JjZS5tYWduaXR1ZGU7XHJcblxyXG4gICAgcmV0dXJuIGRlc2NyaXB0aW9uU3RyaW5nO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgdGhlIHRyYWNrZWQgZm9yY2VzIHRoYXQgZGV0ZXJtaW5lIHRoZSBuZXh0IGRlc2NyaXB0aW9uIG9mIGluZHVjZWQgY2hhcmdlIGNoYW5nZS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXRSZWZlcmVuY2VGb3JjZXMoKSB7XHJcbiAgICB0aGlzLnByZXZpb3VzRm9yY2VNYWduaXR1ZGUgPSBCYWxsb29uTW9kZWwuZ2V0Rm9yY2VUb0Nsb3Nlc3RXYWxsQ2hhcmdlKCB0aGlzLmJhbGxvb25Nb2RlbCApLm1hZ25pdHVkZTtcclxuICAgIHRoaXMucHJldmlvdXNGb3JjZU1hZ25pdHVkZU5vcm1hbGl6ZWQgPSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJuIHdoZXRoZXIgb3Igbm90IGNoYW5nZSBpbiBpbmR1Y2VkIGNoYXJnZSBzaG91bGQgYmUgZGVzY3JpYmVkIGZvciB0aGUgYmFsbG9vbi4gSWYgdGhlIGJhbGxvb24gbm90IG9uXHJcbiAgICogdGhlIHdhbGwgYW5kIGlzIGluZHVjaW5nIGNoYXJnZSB3aGlsZSBhbGwgY2hhcmdlcyBhcmUgdmlzaWJsZSB3ZSB3aWxsIGFsd2F5cyBkZXNjcmliZSBjaGFuZ2UuIElmIHdlIGRlc2NyaWJlZFxyXG4gICAqIHRoYXQgdGhlIGNoYXJnZXMgbW92ZWQgYXdheSBmcm9tIHRoZSBiYWxsb29uLCB3ZSB3aWxsIGFsd2F5cyBkZXNjcmliZSB0aGUgcmV0dXJuIG9mIGluZHVjZWQgY2hhcmdlcyBhdCBsZWFzdFxyXG4gICAqIG9uY2UuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgZGVzY3JpYmVJbmR1Y2VkQ2hhcmdlQ2hhbmdlKCkge1xyXG4gICAgY29uc3QgY2hhcmdlc1Nob3duID0gdGhpcy5zaG93Q2hhcmdlc1Byb3BlcnR5LmdldCgpO1xyXG4gICAgY29uc3Qgd2FsbFZpc2libGUgPSB0aGlzLndhbGwuaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCBqdW1waW5nID0gdGhpcy5iYWxsb29uTW9kZWwuanVtcGluZztcclxuICAgIHJldHVybiAhanVtcGluZyAmJlxyXG4gICAgICAgICAgICF0aGlzLmJhbGxvb25Nb2RlbC50b3VjaGluZ1dhbGwoKSAmJlxyXG4gICAgICAgICAgIHdhbGxWaXNpYmxlICYmXHJcbiAgICAgICAgICAgY2hhcmdlc1Nob3duID09PSAnYWxsJyAmJlxyXG4gICAgICAgICAgICggdGhpcy5iYWxsb29uTW9kZWwuaW5kdWNpbmdDaGFyZ2VQcm9wZXJ0eS5nZXQoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBkZXNjcmlwdGlvbiBvZiB0aGUgYmFsbG9vbidzIHJlbGF0aXZlIGNoYXJnZSBidXQgbW9kaWZpZWQgc2xpZ2h0bHkgZm9yIHRoZSBjb250ZXh0IG9mIHRoZSBzY3JlZW4gc3VtbWFyeS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldFN1bW1hcnlSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uKCkge1xyXG4gICAgY29uc3QgY2hhcmdlc1Nob3duID0gdGhpcy5zaG93Q2hhcmdlc1Byb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIGlmICggdGhpcy5iYWxsb29uTW9kZWwuY2hhcmdlUHJvcGVydHkuZ2V0KCkgPT09IDAgJiYgY2hhcmdlc1Nob3duID09PSAnYWxsJyApIHtcclxuICAgICAgcmV0dXJuIHN1bW1hcnlCYWxsb29uTmV1dHJhbENoYXJnZVN0cmluZztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gQmFsbG9vbkNoYXJnZURlc2NyaWJlci5nZXRSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uKCB0aGlzLmJhbGxvb25Nb2RlbCwgY2hhcmdlc1Nob3duICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBkZXNjcmlwdGlvbiB0aGF0IGluZGljYXRlcyBob3cgbXVjaCBjaGFyZ2UgdGhlIGJhbGxvb24gaGFzLCBhbmQgaG93IG11Y2ggY2hhcmdlIGlzIHNob3dpbmcgZGVwZW5kaW5nXHJcbiAgICogb24gY2hhcmdlIHZpZXcuIFdpbGwgcmV0dXJuIHNvbWV0aGluZyBsaWtlXHJcbiAgICogXCJIYXMgemVybyBuZXQgY2hhcmdlLCBzaG93aW5nIG5vIGNoYXJnZXMuXCIgb3JcclxuICAgKiBcIkhhcyB6ZXJvIG5ldCBjaGFyZ2UsIG1hbnkgcGFpcnMgb2YgcG9zaXRpdmUgYW5kIG5lZ2F0aXZlIGNoYXJnZXNcIlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRIYXNSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uKCkge1xyXG4gICAgY29uc3QgYmFsbG9vbkNoYXJnZSA9IHRoaXMuYmFsbG9vbk1vZGVsLmNoYXJnZVByb3BlcnR5LmdldCgpO1xyXG4gICAgY29uc3QgY2hhcmdlc1Nob3duID0gdGhpcy5zaG93Q2hhcmdlc1Byb3BlcnR5LmdldCgpO1xyXG4gICAgbGV0IGNoYXJnZURlc2NyaXB0aW9uID0gQmFsbG9vbkNoYXJnZURlc2NyaWJlci5nZXRSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uKCB0aGlzLmJhbGxvb25Nb2RlbCwgY2hhcmdlc1Nob3duICk7XHJcblxyXG4gICAgaWYgKCBjaGFyZ2VzU2hvd24gPT09ICdhbGwnICkge1xyXG4gICAgICBjaGFyZ2VEZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggYmFsbG9vbkhhc0NoYXJnZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBjaGFyZ2U6IGNoYXJnZURlc2NyaXB0aW9uXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBjaGFyZ2VzU2hvd24gPT09ICdkaWZmJyApIHtcclxuICAgICAgY29uc3QgY2hhcmdlU3RyaW5nID0gKCBiYWxsb29uQ2hhcmdlIDwgMCApID8gYmFsbG9vbk5lZ2F0aXZlU3RyaW5nIDogYmFsbG9vblplcm9TdHJpbmc7XHJcbiAgICAgIGNoYXJnZURlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBiYWxsb29uSGFzQ2hhcmdlU2hvd2luZ1BhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBjaGFyZ2U6IGNoYXJnZVN0cmluZyxcclxuICAgICAgICBzaG93aW5nOiBjaGFyZ2VEZXNjcmlwdGlvblxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNoYXJnZURlc2NyaXB0aW9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgZmxhZ3MgdGhhdCB0cmFjayBzdGF0ZSBiZXR3ZWVuIGRlc2NyaXB0aW9ucy5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnByZXZpb3VzRm9yY2VNYWduaXR1ZGUgPSAwO1xyXG4gICAgdGhpcy5wcmV2aW91c0ZvcmNlTWFnbml0dWRlTm9ybWFsaXplZCA9IDA7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIHN0YXRpY3NcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgcmVsYXRpdmUgY2hhcmdlIGRlc2NyaXB0aW9uIG9mIGEgYmFsbG9vbiwgd2lsbCByZXR1cm4gc29tZXRoaW5nIGxpa2VcclxuICAgKiBcIm5vIG1vcmUgbmVnYXRpdmUgY2hhcmdlcyB0aGFuIHBvc2l0aXZlIGNoYXJnZXNcIiBvclxyXG4gICAqIFwic2V2ZXJhbCBtb3JlIG5lZ2F0aXZlIGNoYXJnZXMgdGhhbiBwb3NpdGl2ZSBjaGFyZ2VzXCIgb3JcclxuICAgKiBcInNob3dpbmcgc2V2ZXJhbCBuZWdhdGl2ZSBjaGFyZ2VzXCJcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QmFsbG9vbk1vZGVsfSBiYWxsb29uTW9kZWxcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2hvd0NoYXJnZXMgLSBvbmUgb2YgJ2FsbCcsICdub25lLCAnZGlmZidcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uKCBiYWxsb29uTW9kZWwsIHNob3dDaGFyZ2VzICkge1xyXG4gICAgbGV0IGRlc2NyaXB0aW9uO1xyXG4gICAgY29uc3QgY2hhcmdlVmFsdWUgPSBNYXRoLmFicyggYmFsbG9vbk1vZGVsLmNoYXJnZVByb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgLy8gaWYgY2hhcmdlIHZpZXcgaXMgJ2RpZmYnIGFuZCB0aGVyZSBhcmUgbm8gY2hhcmdlcywgd2Ugc2ltcGx5IHNheSB0aGF0IHRoZXJlIGFyZSBub1xyXG4gICAgLy8gY2hhcmdlcyBzaG93blxyXG4gICAgaWYgKCBjaGFyZ2VWYWx1ZSA9PT0gMCAmJiBzaG93Q2hhcmdlcyA9PT0gJ2RpZmYnICkge1xyXG4gICAgICBkZXNjcmlwdGlvbiA9IHNob3dpbmdOb0NoYXJnZXNTdHJpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgcmVsYXRpdmVDaGFyZ2VzU3RyaW5nID0gQkFTRURlc2NyaWJlci5nZXRSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uKCBjaGFyZ2VWYWx1ZSApO1xyXG4gICAgICBsZXQgc3RyaW5nUGF0dGVybjtcclxuICAgICAgaWYgKCBzaG93Q2hhcmdlcyA9PT0gJ2FsbCcgKSB7XHJcbiAgICAgICAgc3RyaW5nUGF0dGVybiA9IGJhbGxvb25SZWxhdGl2ZUNoYXJnZVBhdHRlcm5TdHJpbmc7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHNob3dDaGFyZ2VzID09PSAnZGlmZicgKSB7XHJcbiAgICAgICAgc3RyaW5nUGF0dGVybiA9IGJhbGxvb25DaGFyZ2VEaWZmZXJlbmNlc1BhdHRlcm5TdHJpbmc7XHJcbiAgICAgIH1cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc3RyaW5nUGF0dGVybiwgYHN0cmluZ1BhdHRlcm4gbm90IGZvdW5kIGZvciBzaG93Q2hhcmdlc1Byb3BlcnR5IHZhbHVlICR7c2hvd0NoYXJnZXN9YCApO1xyXG5cclxuICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIHN0cmluZ1BhdHRlcm4sIHtcclxuICAgICAgICBhbW91bnQ6IHJlbGF0aXZlQ2hhcmdlc1N0cmluZ1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRlc2NyaXB0aW9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSByZWxhdGl2ZSBjaGFyZ2Ugd2l0aCB0aGUgYWNjZXNzaWJsZSBsYWJlbCwgc29tZXRoaW5nIGxpa2VcclxuICAgKiBcIlllbGxvdyBiYWxsb29uIGhhcyBhIGZldyBtb3JlIG5lZ2F0aXZlIGNoYXJnZXMgdGhhbiBwb3NpdGl2ZSBjaGFyZ2VzLlwiIG9yXHJcbiAgICogXCJZZWxsb3cgYmFsbG9vbiBoYXMgbmVnYXRpdmUgbmV0IGNoYXJnZSwgc2hvd2luZyBzZXZlcmFsIG5lZ2F0aXZlIGNoYXJnZXMuXCIgb3JcclxuICAgKiBcIlllbGxvdyBiYWxsb29uIGhhcyB6ZXJvIG5ldCBjaGFyZ2UsIHNob3dpbmcgbm8gY2hhcmdlcy5cIlxyXG4gICAqXHJcbiAgICogRGVwZW5kZW50IG9uIHRoZSBjaGFyZ2Ugdmlldy5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldFJlbGF0aXZlQ2hhcmdlRGVzY3JpcHRpb25XaXRoTGFiZWwoIGJhbGxvb25Nb2RlbCwgc2hvd0NoYXJnZXMsIGxhYmVsICkge1xyXG4gICAgbGV0IGRlc2NyaXB0aW9uO1xyXG4gICAgY29uc3QgcmVsYXRpdmVDaGFyZ2UgPSBCYWxsb29uQ2hhcmdlRGVzY3JpYmVyLmdldFJlbGF0aXZlQ2hhcmdlRGVzY3JpcHRpb24oIGJhbGxvb25Nb2RlbCwgc2hvd0NoYXJnZXMgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNob3dDaGFyZ2VzICE9PSAnbm9uZScsICdyZWxhdGl2ZSBkZXNjcmlwdGlvbiB3aXRoIGxhYmVsIHNob3VsZCBuZXZlciBiZSByZWFkIHdoZW4gbm8gY2hhcmdlcyBhcmUgc2hvd24nICk7XHJcblxyXG4gICAgaWYgKCBzaG93Q2hhcmdlcyA9PT0gJ2FsbCcgKSB7XHJcbiAgICAgIGRlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBiYWxsb29uSGFzUmVsYXRpdmVDaGFyZ2VQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgYmFsbG9vbkxhYmVsOiBsYWJlbCxcclxuICAgICAgICByZWxhdGl2ZUNoYXJnZTogcmVsYXRpdmVDaGFyZ2VcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHNob3dDaGFyZ2VzID09PSAnZGlmZicgKSB7XHJcbiAgICAgIGNvbnN0IGJhbGxvb25DaGFyZ2UgPSBiYWxsb29uTW9kZWwuY2hhcmdlUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIGNvbnN0IGNoYXJnZVN0cmluZyA9ICggYmFsbG9vbkNoYXJnZSA8IDAgKSA/IGJhbGxvb25OZWdhdGl2ZVN0cmluZyA6IGJhbGxvb25aZXJvU3RyaW5nO1xyXG5cclxuICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIGJhbGxvb25IYXNOZXRDaGFyZ2VQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgYmFsbG9vbjogbGFiZWwsXHJcbiAgICAgICAgY2hhcmdlOiBjaGFyZ2VTdHJpbmcsXHJcbiAgICAgICAgc2hvd2luZzogcmVsYXRpdmVDaGFyZ2VcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZXNjcmlwdGlvbjtcclxuICB9XHJcbn1cclxuXHJcbmJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkucmVnaXN0ZXIoICdCYWxsb29uQ2hhcmdlRGVzY3JpYmVyJywgQmFsbG9vbkNoYXJnZURlc2NyaWJlciApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQmFsbG9vbkNoYXJnZURlc2NyaWJlcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELE9BQU9DLFdBQVcsTUFBTSxrREFBa0Q7QUFDMUUsT0FBT0MsNEJBQTRCLE1BQU0sMENBQTBDO0FBQ25GLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0MsWUFBWSxNQUFNLDZCQUE2QjtBQUN0RCxPQUFPQyxXQUFXLE1BQU0sNEJBQTRCO0FBQ3BELE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFDOUMsT0FBT0MsZ0JBQWdCLE1BQU0sdUJBQXVCO0FBQ3BELE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFFOUMsTUFBTUMsaUNBQWlDLEdBQUdOLGVBQWUsQ0FBQ08sMkJBQTJCLENBQUNDLEtBQUs7QUFDM0YsTUFBTUMsNkJBQTZCLEdBQUdULGVBQWUsQ0FBQ1UsdUJBQXVCLENBQUNGLEtBQUs7QUFD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