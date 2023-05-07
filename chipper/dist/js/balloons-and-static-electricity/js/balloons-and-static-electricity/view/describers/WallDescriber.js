// Copyright 2017-2021, University of Colorado Boulder

/**
 * A view type that observes the WallModel and builds descriptions which can be read by assistive technology.
 * @author Jesse Greenberg
 */

import Range from '../../../../../dot/js/Range.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import merge from '../../../../../phet-core/js/merge.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import balloonsAndStaticElectricity from '../../../balloonsAndStaticElectricity.js';
import BASEA11yStrings from '../../BASEA11yStrings.js';
import PlayAreaMap from '../../model/PlayAreaMap.js';
import BASEDescriber from './BASEDescriber.js';

// strings
const wallDescriptionPatternString = BASEA11yStrings.wallDescriptionPattern.value;
const wallPositionString = BASEA11yStrings.wallPosition.value;
const wallNoNetChargeString = BASEA11yStrings.wallNoNetCharge.value;
const aLittleBitString = BASEA11yStrings.aLittleBit.value;
const aLotString = BASEA11yStrings.aLot.value;
const quiteALotString = BASEA11yStrings.quiteALot.value;
const inducedChargePatternString = BASEA11yStrings.inducedChargePattern.value;
const greenBalloonLabelString = BASEA11yStrings.greenBalloonLabel.value;
const yellowBalloonLabelString = BASEA11yStrings.yellowBalloonLabel.value;
const wallTwoBalloonInducedChargePatternString = BASEA11yStrings.wallTwoBalloonInducedChargePattern.value;
const wallChargeWithoutInducedPatternString = BASEA11yStrings.wallChargeWithoutInducedPattern.value;
const wallChargeWithInducedPatternString = BASEA11yStrings.wallChargeWithInducedPattern.value;
const showingNoChargesString = BASEA11yStrings.showingNoCharges.value;
const manyChargePairsString = BASEA11yStrings.manyChargePairs.value;
const singleStatementPatternString = BASEA11yStrings.singleStatementPattern.value;
const wallNoChangeInChargesPatternString = BASEA11yStrings.wallNoChangeInChargesPattern.value;
const inducedChargeNoAmountPatternString = BASEA11yStrings.inducedChargeNoAmountPattern.value;
const wallChargePatternStringWithLabel = BASEA11yStrings.wallChargePatternStringWithLabel.value;
const summaryObjectHasChargePatternString = BASEA11yStrings.summaryObjectHasChargePattern.value;
const summaryObjectChargePatternString = BASEA11yStrings.summaryObjectChargePattern.value;
const wallLabelString = BASEA11yStrings.wallLabel.value;
const zeroString = BASEA11yStrings.zero.value;
const bothBalloonsString = BASEA11yStrings.bothBalloons.value;
const wallInducedChargeSummaryPatternString = BASEA11yStrings.wallInducedChargeSummaryPattern.value;
const positiveChargesDoNotMoveString = BASEA11yStrings.positiveChargesDoNotMove.value;

// constants
const INDUCED_CHARGE_DESCRIPTION_MAP = {
  A_LITTLE_BIT: {
    range: new Range(0, 20),
    description: aLittleBitString
  },
  A_LOT: {
    range: new Range(20, 35),
    description: aLotString
  },
  QUITE_A_LOT: {
    range: new Range(35, Number.MAX_VALUE),
    description: quiteALotString
  }
};
class WallDescriber {
  /**
   * @param {BASEmodel} model
   */
  constructor(model) {
    // @private {WallModel}
    this.wallModel = model.wall;

    // @private {BalloonModel}
    this.yellowBalloon = model.greenBalloon;

    // @private {BalloonModel}
    this.greenBalloon = model.greenBalloon;

    // @private showChargesProperty
    this.showChargesProperty = model.showChargesProperty;
  }

  /**
   * Get the full description for the wall including its position, net charge, and induced charge.  This is used
   * as the general description for the wall which an AT user can read at any time with the virtual cursor.
   * The content is dependent on the view representation of charges (model.showchargesProperty).
   *
   * @public
   * @param  {BalloonModel} yellowBalloon
   * @param  {BalloonModel} greenBalloon
   * @returns {string}
   */
  getWallDescription(yellowBalloon, greenBalloon, balloonsAdjacent) {
    let description;

    // if no charges are shown, the position is the only part of the description
    if (this.showChargesProperty.get() === 'none') {
      description = StringUtils.fillIn(singleStatementPatternString, {
        statement: wallPositionString
      });
    } else {
      const chargeDescription = WallDescriber.getWallChargeDescription(yellowBalloon, greenBalloon, balloonsAdjacent, this.wallModel.isVisibleProperty.get(), this.showChargesProperty.get());

      // assemble the whole description
      description = StringUtils.fillIn(wallDescriptionPatternString, {
        position: wallPositionString,
        charge: chargeDescription
      });
    }
    return description;
  }

  /**
   * Get the described charge in the wall, dependent on charge visibility, whether or not there is induced charge,
   * and which balloons are visible. This portion of the description does not include any wall position information.
   * @public
   *
   * @returns {string}
   */
  static getWallChargeDescription(yellowBalloon, greenBalloon, balloonsAdjacent, wallVisible, chargesShown) {
    let inducedChargeString;
    let yellowBalloonInducedChargeString;
    let greenBalloonInducedChargeString;
    const yellowInducingAndvisible = yellowBalloon.inducingChargeAndVisible();
    const greenInducingAndVisible = greenBalloon.inducingChargeAndVisible();

    // if all charges are shown, and a balloon is inducing charge, generate the description for induced charge which
    // can change depending on whether balloons are adjacent or whether both balloons are inducing at the same time
    if (wallVisible && chargesShown === 'all') {
      if (yellowInducingAndvisible) {
        yellowBalloonInducedChargeString = WallDescriber.getInducedChargeDescription(yellowBalloon, yellowBalloonLabelString, wallVisible, {
          includePositiveChargeInfo: false
        });
        inducedChargeString = yellowBalloonInducedChargeString;
      }
      if (greenInducingAndVisible) {
        greenBalloonInducedChargeString = WallDescriber.getInducedChargeDescription(greenBalloon, greenBalloonLabelString, wallVisible, {
          includePositiveChargeInfo: false
        });
      }

      // if both are adjacent and visible, we can combine the induced charge description into a single
      // statement to reduce verbosity
      if (yellowInducingAndvisible && greenInducingAndVisible) {
        if (balloonsAdjacent) {
          inducedChargeString = WallDescriber.getCombinedInducedChargeDescription(yellowBalloon, wallVisible, {
            includePositiveChargeInfo: false
          });
        } else {
          inducedChargeString = StringUtils.fillIn(wallTwoBalloonInducedChargePatternString, {
            yellowBalloon: yellowBalloonInducedChargeString,
            greenBalloon: greenBalloonInducedChargeString
          });
        }
      } else if (yellowInducingAndvisible || greenInducingAndVisible) {
        if (yellowInducingAndvisible) {
          inducedChargeString = yellowBalloonInducedChargeString;
        } else if (greenInducingAndVisible) {
          inducedChargeString = greenBalloonInducedChargeString;
        }

        // wrap with punctuation
        inducedChargeString = StringUtils.fillIn(singleStatementPatternString, {
          statement: inducedChargeString
        });
      }
    }

    // get the description for what charges are currently shown
    const shownChargesString = chargesShown === 'diff' ? showingNoChargesString : manyChargePairsString;

    // if there is an induced charge, include it in the full charge description
    let wallChargeString;
    if ((yellowBalloon.inducingChargeProperty.get() || greenInducingAndVisible) && chargesShown === 'all' && wallVisible) {
      inducedChargeString = StringUtils.fillIn(wallInducedChargeSummaryPatternString, {
        inducedCharge: inducedChargeString,
        positiveCharges: positiveChargesDoNotMoveString
      });
      wallChargeString = StringUtils.fillIn(wallChargeWithInducedPatternString, {
        netCharge: wallNoNetChargeString,
        shownCharges: shownChargesString,
        inducedCharge: inducedChargeString
      });
    } else {
      wallChargeString = StringUtils.fillIn(wallChargeWithoutInducedPatternString, {
        netCharge: wallNoNetChargeString,
        shownCharges: shownChargesString
      });
    }
    const descriptionString = wallChargeString;
    return descriptionString;
  }

  /**
   * Get a description of the wall charge that includes the label. Something like
   * "Wall has no net charge, showing..."
   * @public
   *
   * @param {BalloonModel} yellowBalloon
   * @param {BalloonModel} greenBalloon
   * @param {boolean} wallVisible
   * @param {string} chargesShown
   *
   * @returns {string}
   */
  static getWallChargeDescriptionWithLabel(yellowBalloon, greenBalloon, balloonsAdjacent, wallVisible, chargesShown) {
    let description = WallDescriber.getWallChargeDescription(yellowBalloon, greenBalloon, balloonsAdjacent, wallVisible, chargesShown);
    description = description.toLowerCase();
    return StringUtils.fillIn(wallChargePatternStringWithLabel, {
      wallCharge: description
    });
  }

  /**
   * Get the induced charge amount description for the balloon, describing whether the charges are
   * "a little bit" displaced and so on.
   * @public
   *
   * @param  {BalloonModel} balloon
   * @returns {string}
   */
  static getInducedChargeAmountDescription(balloon) {
    let amountDescription;
    const descriptionKeys = Object.keys(INDUCED_CHARGE_DESCRIPTION_MAP);
    for (let j = 0; j < descriptionKeys.length; j++) {
      const value = INDUCED_CHARGE_DESCRIPTION_MAP[descriptionKeys[j]];
      if (value.range.contains(balloon.closestChargeInWall.getDisplacement())) {
        amountDescription = value.description;
      }
    }
    return amountDescription;
  }

  /**
   * Get the description for induced charge when there is no induced charge. Something like
   * "In wall, no change in charges."
   * @public
   *
   * @param {string} positionString
   * @returns {string}
   */
  static getNoChangeInChargesDescription(positionString) {
    return StringUtils.fillIn(wallNoChangeInChargesPatternString, {
      position: positionString
    });
  }

  /**
   * Get the induced charge description without the amount of induced charge. Will return something like
   * "Negative charges in wall move away from yellow balloon."
   * @public
   *
   * @param {BalloonModel} balloon
   * @param {string} balloonLabel
   * @param {boolean} wallVisible
   * @returns {string}
   */
  static getInducedChargeDescriptionWithNoAmount(balloon, balloonLabel, wallVisible) {
    let descriptionString;
    const chargePositionString = WallDescriber.getInducedChargePositionDescription(balloon, wallVisible, true);
    if (balloon.inducingChargeProperty.get()) {
      descriptionString = StringUtils.fillIn(inducedChargeNoAmountPatternString, {
        wallPosition: chargePositionString,
        balloon: balloonLabel
      });
    } else {
      descriptionString = WallDescriber.getNoChangeInChargesDescription(chargePositionString);
    }
    return descriptionString;
  }

  /**
   * Get an induced charge amount description for a balloon, based on the positions of charges in the wall.  We find the
   * closest charge to the balloon, and determine how far it has been displaced from its initial position. Will
   * return something like:
   *
   * "Negative charges in wall move away from yellow balloon a little bit." or
   * "Negative charges in wall move away from yellow balloon a little bit. Positive charges do not move."
   *
   * @static
   * @public
   *
   * @param {BalloonModel} balloon
   * @param {string} balloonLabel
   * @param {boolean} wallVisible
   * @param {object} [options]
   * @returns {string}
   */
  static getInducedChargeDescription(balloon, balloonLabel, wallVisible, options) {
    options = merge({
      includeWallPosition: true,
      // include position in the wall?
      includePositiveChargeInfo: true // include information about positive charges how positive charges do not move?
    }, options);
    let descriptionString;
    const chargePositionString = WallDescriber.getInducedChargePositionDescription(balloon, wallVisible, options.includeWallPosition);
    if (balloon.inducingChargeProperty.get()) {
      const inducedChargeAmount = WallDescriber.getInducedChargeAmountDescription(balloon);
      descriptionString = StringUtils.fillIn(inducedChargePatternString, {
        wallPosition: chargePositionString,
        balloon: balloonLabel,
        inductionAmount: inducedChargeAmount
      });
    } else {
      descriptionString = WallDescriber.getNoChangeInChargesDescription(chargePositionString);
    }

    // if all charges are shown, include information about how positive charges do not move
    if (options.includePositiveChargeInfo && balloon.inducingChargeProperty.get()) {
      // wrap induced charge with punctuation
      descriptionString = StringUtils.fillIn(singleStatementPatternString, {
        statement: descriptionString
      });
      descriptionString = StringUtils.fillIn(wallInducedChargeSummaryPatternString, {
        inducedCharge: descriptionString,
        positiveCharges: positiveChargesDoNotMoveString
      });
    }
    return descriptionString;
  }

  /**
   * Get a description of both balloons. Will return something like
   *
   * "Negative charges in wall move away from balloons quite a lot. Positive charges do not move." or
   * "Negative charges in lower wall move away from balloons quite a lot. Positive charges do not move."
   * @public
   *
   * @returns {string}
   */
  static getCombinedInducedChargeDescription(balloon, wallVisible, options) {
    options = merge({
      includeWallPosition: true,
      includePositiveChargeInfo: true
    }, options);
    let descriptionString;
    const chargePositionString = WallDescriber.getInducedChargePositionDescription(balloon, wallVisible, options.includeWallPosition);
    const inducedChargeAmount = WallDescriber.getInducedChargeAmountDescription(balloon);
    descriptionString = StringUtils.fillIn(inducedChargePatternString, {
      wallPosition: chargePositionString,
      balloon: bothBalloonsString,
      inductionAmount: inducedChargeAmount
    });

    // wrap induced charge fragment with punctuation
    descriptionString = StringUtils.fillIn(singleStatementPatternString, {
      statement: descriptionString
    });
    if (balloon.inducingChargeProperty.get() && options.includePositiveChargeInfo) {
      descriptionString = StringUtils.fillIn(wallInducedChargeSummaryPatternString, {
        inducedCharge: descriptionString,
        positiveCharges: positiveChargesDoNotMoveString
      });
    }
    return descriptionString;
  }

  /**
   * Gets a description of where the induced charge is located in the wall. With includeWallPosition boolean, it
   * is possible to exclude vertical position of description and just use "Wall" generally. Will return one of
   *
   * "wall"
   * "upper wall"
   * "lower wall"
   *
   * @param {[type]} balloon [description]
   * @param wallVisible
   * @param {[type]} includeWallPosition [description]
   * @public
   *
   * @returns {[type]} [description]
   */
  static getInducedChargePositionDescription(balloon, wallVisible, includeWallPosition) {
    const chargePositionX = PlayAreaMap.X_POSITIONS.AT_WALL;
    const chargePositionY = includeWallPosition ? balloon.getCenterY() : PlayAreaMap.ROW_RANGES.CENTER_PLAY_AREA.getCenter();
    const chargePosition = new Vector2(chargePositionX, chargePositionY);
    return BASEDescriber.getPositionDescription(chargePosition, wallVisible);
  }

  /**
   * Get a summary of charges in the wall, for the screen summary. The wall is always neutral, so only depends
   * on which charges are visible and number of pairs in the wall.
   * @public
   *
   * @param {string} chargesShown - one of 'none'|'all'|'diff'
   * @param numberOfCharges
   * @returns {string}
   */
  static getSummaryChargeDescription(chargesShown, numberOfCharges) {
    const chargeString = BASEDescriber.getNeutralChargesShownDescription(chargesShown, numberOfCharges);
    const wallObjectString = StringUtils.fillIn(summaryObjectHasChargePatternString, {
      object: wallLabelString,
      charge: zeroString
    });
    return StringUtils.fillIn(summaryObjectChargePatternString, {
      object: wallObjectString,
      charge: chargeString
    });
  }
}
balloonsAndStaticElectricity.register('WallDescriber', WallDescriber);
export default WallDescriber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIlZlY3RvcjIiLCJtZXJnZSIsIlN0cmluZ1V0aWxzIiwiYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eSIsIkJBU0VBMTF5U3RyaW5ncyIsIlBsYXlBcmVhTWFwIiwiQkFTRURlc2NyaWJlciIsIndhbGxEZXNjcmlwdGlvblBhdHRlcm5TdHJpbmciLCJ3YWxsRGVzY3JpcHRpb25QYXR0ZXJuIiwidmFsdWUiLCJ3YWxsUG9zaXRpb25TdHJpbmciLCJ3YWxsUG9zaXRpb24iLCJ3YWxsTm9OZXRDaGFyZ2VTdHJpbmciLCJ3YWxsTm9OZXRDaGFyZ2UiLCJhTGl0dGxlQml0U3RyaW5nIiwiYUxpdHRsZUJpdCIsImFMb3RTdHJpbmciLCJhTG90IiwicXVpdGVBTG90U3RyaW5nIiwicXVpdGVBTG90IiwiaW5kdWNlZENoYXJnZVBhdHRlcm5TdHJpbmciLCJpbmR1Y2VkQ2hhcmdlUGF0dGVybiIsImdyZWVuQmFsbG9vbkxhYmVsU3RyaW5nIiwiZ3JlZW5CYWxsb29uTGFiZWwiLCJ5ZWxsb3dCYWxsb29uTGFiZWxTdHJpbmciLCJ5ZWxsb3dCYWxsb29uTGFiZWwiLCJ3YWxsVHdvQmFsbG9vbkluZHVjZWRDaGFyZ2VQYXR0ZXJuU3RyaW5nIiwid2FsbFR3b0JhbGxvb25JbmR1Y2VkQ2hhcmdlUGF0dGVybiIsIndhbGxDaGFyZ2VXaXRob3V0SW5kdWNlZFBhdHRlcm5TdHJpbmciLCJ3YWxsQ2hhcmdlV2l0aG91dEluZHVjZWRQYXR0ZXJuIiwid2FsbENoYXJnZVdpdGhJbmR1Y2VkUGF0dGVyblN0cmluZyIsIndhbGxDaGFyZ2VXaXRoSW5kdWNlZFBhdHRlcm4iLCJzaG93aW5nTm9DaGFyZ2VzU3RyaW5nIiwic2hvd2luZ05vQ2hhcmdlcyIsIm1hbnlDaGFyZ2VQYWlyc1N0cmluZyIsIm1hbnlDaGFyZ2VQYWlycyIsInNpbmdsZVN0YXRlbWVudFBhdHRlcm5TdHJpbmciLCJzaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuIiwid2FsbE5vQ2hhbmdlSW5DaGFyZ2VzUGF0dGVyblN0cmluZyIsIndhbGxOb0NoYW5nZUluQ2hhcmdlc1BhdHRlcm4iLCJpbmR1Y2VkQ2hhcmdlTm9BbW91bnRQYXR0ZXJuU3RyaW5nIiwiaW5kdWNlZENoYXJnZU5vQW1vdW50UGF0dGVybiIsIndhbGxDaGFyZ2VQYXR0ZXJuU3RyaW5nV2l0aExhYmVsIiwic3VtbWFyeU9iamVjdEhhc0NoYXJnZVBhdHRlcm5TdHJpbmciLCJzdW1tYXJ5T2JqZWN0SGFzQ2hhcmdlUGF0dGVybiIsInN1bW1hcnlPYmplY3RDaGFyZ2VQYXR0ZXJuU3RyaW5nIiwic3VtbWFyeU9iamVjdENoYXJnZVBhdHRlcm4iLCJ3YWxsTGFiZWxTdHJpbmciLCJ3YWxsTGFiZWwiLCJ6ZXJvU3RyaW5nIiwiemVybyIsImJvdGhCYWxsb29uc1N0cmluZyIsImJvdGhCYWxsb29ucyIsIndhbGxJbmR1Y2VkQ2hhcmdlU3VtbWFyeVBhdHRlcm5TdHJpbmciLCJ3YWxsSW5kdWNlZENoYXJnZVN1bW1hcnlQYXR0ZXJuIiwicG9zaXRpdmVDaGFyZ2VzRG9Ob3RNb3ZlU3RyaW5nIiwicG9zaXRpdmVDaGFyZ2VzRG9Ob3RNb3ZlIiwiSU5EVUNFRF9DSEFSR0VfREVTQ1JJUFRJT05fTUFQIiwiQV9MSVRUTEVfQklUIiwicmFuZ2UiLCJkZXNjcmlwdGlvbiIsIkFfTE9UIiwiUVVJVEVfQV9MT1QiLCJOdW1iZXIiLCJNQVhfVkFMVUUiLCJXYWxsRGVzY3JpYmVyIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsIndhbGxNb2RlbCIsIndhbGwiLCJ5ZWxsb3dCYWxsb29uIiwiZ3JlZW5CYWxsb29uIiwic2hvd0NoYXJnZXNQcm9wZXJ0eSIsImdldFdhbGxEZXNjcmlwdGlvbiIsImJhbGxvb25zQWRqYWNlbnQiLCJnZXQiLCJmaWxsSW4iLCJzdGF0ZW1lbnQiLCJjaGFyZ2VEZXNjcmlwdGlvbiIsImdldFdhbGxDaGFyZ2VEZXNjcmlwdGlvbiIsImlzVmlzaWJsZVByb3BlcnR5IiwicG9zaXRpb24iLCJjaGFyZ2UiLCJ3YWxsVmlzaWJsZSIsImNoYXJnZXNTaG93biIsImluZHVjZWRDaGFyZ2VTdHJpbmciLCJ5ZWxsb3dCYWxsb29uSW5kdWNlZENoYXJnZVN0cmluZyIsImdyZWVuQmFsbG9vbkluZHVjZWRDaGFyZ2VTdHJpbmciLCJ5ZWxsb3dJbmR1Y2luZ0FuZHZpc2libGUiLCJpbmR1Y2luZ0NoYXJnZUFuZFZpc2libGUiLCJncmVlbkluZHVjaW5nQW5kVmlzaWJsZSIsImdldEluZHVjZWRDaGFyZ2VEZXNjcmlwdGlvbiIsImluY2x1ZGVQb3NpdGl2ZUNoYXJnZUluZm8iLCJnZXRDb21iaW5lZEluZHVjZWRDaGFyZ2VEZXNjcmlwdGlvbiIsInNob3duQ2hhcmdlc1N0cmluZyIsIndhbGxDaGFyZ2VTdHJpbmciLCJpbmR1Y2luZ0NoYXJnZVByb3BlcnR5IiwiaW5kdWNlZENoYXJnZSIsInBvc2l0aXZlQ2hhcmdlcyIsIm5ldENoYXJnZSIsInNob3duQ2hhcmdlcyIsImRlc2NyaXB0aW9uU3RyaW5nIiwiZ2V0V2FsbENoYXJnZURlc2NyaXB0aW9uV2l0aExhYmVsIiwidG9Mb3dlckNhc2UiLCJ3YWxsQ2hhcmdlIiwiZ2V0SW5kdWNlZENoYXJnZUFtb3VudERlc2NyaXB0aW9uIiwiYmFsbG9vbiIsImFtb3VudERlc2NyaXB0aW9uIiwiZGVzY3JpcHRpb25LZXlzIiwiT2JqZWN0Iiwia2V5cyIsImoiLCJsZW5ndGgiLCJjb250YWlucyIsImNsb3Nlc3RDaGFyZ2VJbldhbGwiLCJnZXREaXNwbGFjZW1lbnQiLCJnZXROb0NoYW5nZUluQ2hhcmdlc0Rlc2NyaXB0aW9uIiwicG9zaXRpb25TdHJpbmciLCJnZXRJbmR1Y2VkQ2hhcmdlRGVzY3JpcHRpb25XaXRoTm9BbW91bnQiLCJiYWxsb29uTGFiZWwiLCJjaGFyZ2VQb3NpdGlvblN0cmluZyIsImdldEluZHVjZWRDaGFyZ2VQb3NpdGlvbkRlc2NyaXB0aW9uIiwib3B0aW9ucyIsImluY2x1ZGVXYWxsUG9zaXRpb24iLCJpbmR1Y2VkQ2hhcmdlQW1vdW50IiwiaW5kdWN0aW9uQW1vdW50IiwiY2hhcmdlUG9zaXRpb25YIiwiWF9QT1NJVElPTlMiLCJBVF9XQUxMIiwiY2hhcmdlUG9zaXRpb25ZIiwiZ2V0Q2VudGVyWSIsIlJPV19SQU5HRVMiLCJDRU5URVJfUExBWV9BUkVBIiwiZ2V0Q2VudGVyIiwiY2hhcmdlUG9zaXRpb24iLCJnZXRQb3NpdGlvbkRlc2NyaXB0aW9uIiwiZ2V0U3VtbWFyeUNoYXJnZURlc2NyaXB0aW9uIiwibnVtYmVyT2ZDaGFyZ2VzIiwiY2hhcmdlU3RyaW5nIiwiZ2V0TmV1dHJhbENoYXJnZXNTaG93bkRlc2NyaXB0aW9uIiwid2FsbE9iamVjdFN0cmluZyIsIm9iamVjdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2FsbERlc2NyaWJlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIHZpZXcgdHlwZSB0aGF0IG9ic2VydmVzIHRoZSBXYWxsTW9kZWwgYW5kIGJ1aWxkcyBkZXNjcmlwdGlvbnMgd2hpY2ggY2FuIGJlIHJlYWQgYnkgYXNzaXN0aXZlIHRlY2hub2xvZ3kuXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eSBmcm9tICcuLi8uLi8uLi9iYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5LmpzJztcclxuaW1wb3J0IEJBU0VBMTF5U3RyaW5ncyBmcm9tICcuLi8uLi9CQVNFQTExeVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgUGxheUFyZWFNYXAgZnJvbSAnLi4vLi4vbW9kZWwvUGxheUFyZWFNYXAuanMnO1xyXG5pbXBvcnQgQkFTRURlc2NyaWJlciBmcm9tICcuL0JBU0VEZXNjcmliZXIuanMnO1xyXG5cclxuLy8gc3RyaW5nc1xyXG5jb25zdCB3YWxsRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLndhbGxEZXNjcmlwdGlvblBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IHdhbGxQb3NpdGlvblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy53YWxsUG9zaXRpb24udmFsdWU7XHJcbmNvbnN0IHdhbGxOb05ldENoYXJnZVN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy53YWxsTm9OZXRDaGFyZ2UudmFsdWU7XHJcbmNvbnN0IGFMaXR0bGVCaXRTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYUxpdHRsZUJpdC52YWx1ZTtcclxuY29uc3QgYUxvdFN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5hTG90LnZhbHVlO1xyXG5jb25zdCBxdWl0ZUFMb3RTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MucXVpdGVBTG90LnZhbHVlO1xyXG5jb25zdCBpbmR1Y2VkQ2hhcmdlUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5pbmR1Y2VkQ2hhcmdlUGF0dGVybi52YWx1ZTtcclxuY29uc3QgZ3JlZW5CYWxsb29uTGFiZWxTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuZ3JlZW5CYWxsb29uTGFiZWwudmFsdWU7XHJcbmNvbnN0IHllbGxvd0JhbGxvb25MYWJlbFN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy55ZWxsb3dCYWxsb29uTGFiZWwudmFsdWU7XHJcbmNvbnN0IHdhbGxUd29CYWxsb29uSW5kdWNlZENoYXJnZVBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Mud2FsbFR3b0JhbGxvb25JbmR1Y2VkQ2hhcmdlUGF0dGVybi52YWx1ZTtcclxuY29uc3Qgd2FsbENoYXJnZVdpdGhvdXRJbmR1Y2VkUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy53YWxsQ2hhcmdlV2l0aG91dEluZHVjZWRQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCB3YWxsQ2hhcmdlV2l0aEluZHVjZWRQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLndhbGxDaGFyZ2VXaXRoSW5kdWNlZFBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IHNob3dpbmdOb0NoYXJnZXNTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Muc2hvd2luZ05vQ2hhcmdlcy52YWx1ZTtcclxuY29uc3QgbWFueUNoYXJnZVBhaXJzU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLm1hbnlDaGFyZ2VQYWlycy52YWx1ZTtcclxuY29uc3Qgc2luZ2xlU3RhdGVtZW50UGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5zaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCB3YWxsTm9DaGFuZ2VJbkNoYXJnZXNQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLndhbGxOb0NoYW5nZUluQ2hhcmdlc1BhdHRlcm4udmFsdWU7XHJcbmNvbnN0IGluZHVjZWRDaGFyZ2VOb0Ftb3VudFBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuaW5kdWNlZENoYXJnZU5vQW1vdW50UGF0dGVybi52YWx1ZTtcclxuY29uc3Qgd2FsbENoYXJnZVBhdHRlcm5TdHJpbmdXaXRoTGFiZWwgPSBCQVNFQTExeVN0cmluZ3Mud2FsbENoYXJnZVBhdHRlcm5TdHJpbmdXaXRoTGFiZWwudmFsdWU7XHJcbmNvbnN0IHN1bW1hcnlPYmplY3RIYXNDaGFyZ2VQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnN1bW1hcnlPYmplY3RIYXNDaGFyZ2VQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBzdW1tYXJ5T2JqZWN0Q2hhcmdlUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5zdW1tYXJ5T2JqZWN0Q2hhcmdlUGF0dGVybi52YWx1ZTtcclxuY29uc3Qgd2FsbExhYmVsU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLndhbGxMYWJlbC52YWx1ZTtcclxuY29uc3QgemVyb1N0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy56ZXJvLnZhbHVlO1xyXG5jb25zdCBib3RoQmFsbG9vbnNTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYm90aEJhbGxvb25zLnZhbHVlO1xyXG5jb25zdCB3YWxsSW5kdWNlZENoYXJnZVN1bW1hcnlQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLndhbGxJbmR1Y2VkQ2hhcmdlU3VtbWFyeVBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IHBvc2l0aXZlQ2hhcmdlc0RvTm90TW92ZVN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5wb3NpdGl2ZUNoYXJnZXNEb05vdE1vdmUudmFsdWU7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgSU5EVUNFRF9DSEFSR0VfREVTQ1JJUFRJT05fTUFQID0ge1xyXG4gIEFfTElUVExFX0JJVDoge1xyXG4gICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMjAgKSxcclxuICAgIGRlc2NyaXB0aW9uOiBhTGl0dGxlQml0U3RyaW5nXHJcbiAgfSxcclxuICBBX0xPVDoge1xyXG4gICAgcmFuZ2U6IG5ldyBSYW5nZSggMjAsIDM1ICksXHJcbiAgICBkZXNjcmlwdGlvbjogYUxvdFN0cmluZ1xyXG4gIH0sXHJcbiAgUVVJVEVfQV9MT1Q6IHtcclxuICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDM1LCBOdW1iZXIuTUFYX1ZBTFVFICksXHJcbiAgICBkZXNjcmlwdGlvbjogcXVpdGVBTG90U3RyaW5nXHJcbiAgfVxyXG59O1xyXG5cclxuY2xhc3MgV2FsbERlc2NyaWJlciB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtCQVNFbW9kZWx9IG1vZGVsXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsICkge1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtXYWxsTW9kZWx9XHJcbiAgICB0aGlzLndhbGxNb2RlbCA9IG1vZGVsLndhbGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0JhbGxvb25Nb2RlbH1cclxuICAgIHRoaXMueWVsbG93QmFsbG9vbiA9IG1vZGVsLmdyZWVuQmFsbG9vbjtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QmFsbG9vbk1vZGVsfVxyXG4gICAgdGhpcy5ncmVlbkJhbGxvb24gPSBtb2RlbC5ncmVlbkJhbGxvb247XHJcblxyXG4gICAgLy8gQHByaXZhdGUgc2hvd0NoYXJnZXNQcm9wZXJ0eVxyXG4gICAgdGhpcy5zaG93Q2hhcmdlc1Byb3BlcnR5ID0gbW9kZWwuc2hvd0NoYXJnZXNQcm9wZXJ0eTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGZ1bGwgZGVzY3JpcHRpb24gZm9yIHRoZSB3YWxsIGluY2x1ZGluZyBpdHMgcG9zaXRpb24sIG5ldCBjaGFyZ2UsIGFuZCBpbmR1Y2VkIGNoYXJnZS4gIFRoaXMgaXMgdXNlZFxyXG4gICAqIGFzIHRoZSBnZW5lcmFsIGRlc2NyaXB0aW9uIGZvciB0aGUgd2FsbCB3aGljaCBhbiBBVCB1c2VyIGNhbiByZWFkIGF0IGFueSB0aW1lIHdpdGggdGhlIHZpcnR1YWwgY3Vyc29yLlxyXG4gICAqIFRoZSBjb250ZW50IGlzIGRlcGVuZGVudCBvbiB0aGUgdmlldyByZXByZXNlbnRhdGlvbiBvZiBjaGFyZ2VzIChtb2RlbC5zaG93Y2hhcmdlc1Byb3BlcnR5KS5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0gIHtCYWxsb29uTW9kZWx9IHllbGxvd0JhbGxvb25cclxuICAgKiBAcGFyYW0gIHtCYWxsb29uTW9kZWx9IGdyZWVuQmFsbG9vblxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0V2FsbERlc2NyaXB0aW9uKCB5ZWxsb3dCYWxsb29uLCBncmVlbkJhbGxvb24sIGJhbGxvb25zQWRqYWNlbnQgKSB7XHJcbiAgICBsZXQgZGVzY3JpcHRpb247XHJcblxyXG4gICAgLy8gaWYgbm8gY2hhcmdlcyBhcmUgc2hvd24sIHRoZSBwb3NpdGlvbiBpcyB0aGUgb25seSBwYXJ0IG9mIHRoZSBkZXNjcmlwdGlvblxyXG4gICAgaWYgKCB0aGlzLnNob3dDaGFyZ2VzUHJvcGVydHkuZ2V0KCkgPT09ICdub25lJyApIHtcclxuICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIHNpbmdsZVN0YXRlbWVudFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBzdGF0ZW1lbnQ6IHdhbGxQb3NpdGlvblN0cmluZ1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgY2hhcmdlRGVzY3JpcHRpb24gPSBXYWxsRGVzY3JpYmVyLmdldFdhbGxDaGFyZ2VEZXNjcmlwdGlvbiggeWVsbG93QmFsbG9vbiwgZ3JlZW5CYWxsb29uLCBiYWxsb29uc0FkamFjZW50LCB0aGlzLndhbGxNb2RlbC5pc1Zpc2libGVQcm9wZXJ0eS5nZXQoKSwgdGhpcy5zaG93Q2hhcmdlc1Byb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgICAvLyBhc3NlbWJsZSB0aGUgd2hvbGUgZGVzY3JpcHRpb25cclxuICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIHdhbGxEZXNjcmlwdGlvblBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBwb3NpdGlvbjogd2FsbFBvc2l0aW9uU3RyaW5nLFxyXG4gICAgICAgIGNoYXJnZTogY2hhcmdlRGVzY3JpcHRpb25cclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZXNjcmlwdGlvbjtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGRlc2NyaWJlZCBjaGFyZ2UgaW4gdGhlIHdhbGwsIGRlcGVuZGVudCBvbiBjaGFyZ2UgdmlzaWJpbGl0eSwgd2hldGhlciBvciBub3QgdGhlcmUgaXMgaW5kdWNlZCBjaGFyZ2UsXHJcbiAgICogYW5kIHdoaWNoIGJhbGxvb25zIGFyZSB2aXNpYmxlLiBUaGlzIHBvcnRpb24gb2YgdGhlIGRlc2NyaXB0aW9uIGRvZXMgbm90IGluY2x1ZGUgYW55IHdhbGwgcG9zaXRpb24gaW5mb3JtYXRpb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBzdGF0aWMgZ2V0V2FsbENoYXJnZURlc2NyaXB0aW9uKCB5ZWxsb3dCYWxsb29uLCBncmVlbkJhbGxvb24sIGJhbGxvb25zQWRqYWNlbnQsIHdhbGxWaXNpYmxlLCBjaGFyZ2VzU2hvd24gKSB7XHJcblxyXG4gICAgbGV0IGluZHVjZWRDaGFyZ2VTdHJpbmc7XHJcbiAgICBsZXQgeWVsbG93QmFsbG9vbkluZHVjZWRDaGFyZ2VTdHJpbmc7XHJcbiAgICBsZXQgZ3JlZW5CYWxsb29uSW5kdWNlZENoYXJnZVN0cmluZztcclxuXHJcbiAgICBjb25zdCB5ZWxsb3dJbmR1Y2luZ0FuZHZpc2libGUgPSB5ZWxsb3dCYWxsb29uLmluZHVjaW5nQ2hhcmdlQW5kVmlzaWJsZSgpO1xyXG4gICAgY29uc3QgZ3JlZW5JbmR1Y2luZ0FuZFZpc2libGUgPSBncmVlbkJhbGxvb24uaW5kdWNpbmdDaGFyZ2VBbmRWaXNpYmxlKCk7XHJcblxyXG4gICAgLy8gaWYgYWxsIGNoYXJnZXMgYXJlIHNob3duLCBhbmQgYSBiYWxsb29uIGlzIGluZHVjaW5nIGNoYXJnZSwgZ2VuZXJhdGUgdGhlIGRlc2NyaXB0aW9uIGZvciBpbmR1Y2VkIGNoYXJnZSB3aGljaFxyXG4gICAgLy8gY2FuIGNoYW5nZSBkZXBlbmRpbmcgb24gd2hldGhlciBiYWxsb29ucyBhcmUgYWRqYWNlbnQgb3Igd2hldGhlciBib3RoIGJhbGxvb25zIGFyZSBpbmR1Y2luZyBhdCB0aGUgc2FtZSB0aW1lXHJcbiAgICBpZiAoIHdhbGxWaXNpYmxlICYmIGNoYXJnZXNTaG93biA9PT0gJ2FsbCcgKSB7XHJcbiAgICAgIGlmICggeWVsbG93SW5kdWNpbmdBbmR2aXNpYmxlICkge1xyXG4gICAgICAgIHllbGxvd0JhbGxvb25JbmR1Y2VkQ2hhcmdlU3RyaW5nID0gV2FsbERlc2NyaWJlci5nZXRJbmR1Y2VkQ2hhcmdlRGVzY3JpcHRpb24oIHllbGxvd0JhbGxvb24sIHllbGxvd0JhbGxvb25MYWJlbFN0cmluZywgd2FsbFZpc2libGUsIHtcclxuICAgICAgICAgIGluY2x1ZGVQb3NpdGl2ZUNoYXJnZUluZm86IGZhbHNlXHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIGluZHVjZWRDaGFyZ2VTdHJpbmcgPSB5ZWxsb3dCYWxsb29uSW5kdWNlZENoYXJnZVN0cmluZztcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGdyZWVuSW5kdWNpbmdBbmRWaXNpYmxlICkge1xyXG4gICAgICAgIGdyZWVuQmFsbG9vbkluZHVjZWRDaGFyZ2VTdHJpbmcgPSBXYWxsRGVzY3JpYmVyLmdldEluZHVjZWRDaGFyZ2VEZXNjcmlwdGlvbiggZ3JlZW5CYWxsb29uLCBncmVlbkJhbGxvb25MYWJlbFN0cmluZywgd2FsbFZpc2libGUsIHtcclxuICAgICAgICAgIGluY2x1ZGVQb3NpdGl2ZUNoYXJnZUluZm86IGZhbHNlXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBpZiBib3RoIGFyZSBhZGphY2VudCBhbmQgdmlzaWJsZSwgd2UgY2FuIGNvbWJpbmUgdGhlIGluZHVjZWQgY2hhcmdlIGRlc2NyaXB0aW9uIGludG8gYSBzaW5nbGVcclxuICAgICAgLy8gc3RhdGVtZW50IHRvIHJlZHVjZSB2ZXJib3NpdHlcclxuICAgICAgaWYgKCB5ZWxsb3dJbmR1Y2luZ0FuZHZpc2libGUgJiYgZ3JlZW5JbmR1Y2luZ0FuZFZpc2libGUgKSB7XHJcbiAgICAgICAgaWYgKCBiYWxsb29uc0FkamFjZW50ICkge1xyXG4gICAgICAgICAgaW5kdWNlZENoYXJnZVN0cmluZyA9IFdhbGxEZXNjcmliZXIuZ2V0Q29tYmluZWRJbmR1Y2VkQ2hhcmdlRGVzY3JpcHRpb24oIHllbGxvd0JhbGxvb24sIHdhbGxWaXNpYmxlLCB7XHJcbiAgICAgICAgICAgIGluY2x1ZGVQb3NpdGl2ZUNoYXJnZUluZm86IGZhbHNlXHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgaW5kdWNlZENoYXJnZVN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggd2FsbFR3b0JhbGxvb25JbmR1Y2VkQ2hhcmdlUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgICAgICB5ZWxsb3dCYWxsb29uOiB5ZWxsb3dCYWxsb29uSW5kdWNlZENoYXJnZVN0cmluZyxcclxuICAgICAgICAgICAgZ3JlZW5CYWxsb29uOiBncmVlbkJhbGxvb25JbmR1Y2VkQ2hhcmdlU3RyaW5nXHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB5ZWxsb3dJbmR1Y2luZ0FuZHZpc2libGUgfHwgZ3JlZW5JbmR1Y2luZ0FuZFZpc2libGUgKSB7XHJcbiAgICAgICAgaWYgKCB5ZWxsb3dJbmR1Y2luZ0FuZHZpc2libGUgKSB7XHJcbiAgICAgICAgICBpbmR1Y2VkQ2hhcmdlU3RyaW5nID0geWVsbG93QmFsbG9vbkluZHVjZWRDaGFyZ2VTdHJpbmc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBncmVlbkluZHVjaW5nQW5kVmlzaWJsZSApIHtcclxuICAgICAgICAgIGluZHVjZWRDaGFyZ2VTdHJpbmcgPSBncmVlbkJhbGxvb25JbmR1Y2VkQ2hhcmdlU3RyaW5nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gd3JhcCB3aXRoIHB1bmN0dWF0aW9uXHJcbiAgICAgICAgaW5kdWNlZENoYXJnZVN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc2luZ2xlU3RhdGVtZW50UGF0dGVyblN0cmluZywge1xyXG4gICAgICAgICAgc3RhdGVtZW50OiBpbmR1Y2VkQ2hhcmdlU3RyaW5nXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZ2V0IHRoZSBkZXNjcmlwdGlvbiBmb3Igd2hhdCBjaGFyZ2VzIGFyZSBjdXJyZW50bHkgc2hvd25cclxuICAgIGNvbnN0IHNob3duQ2hhcmdlc1N0cmluZyA9ICggY2hhcmdlc1Nob3duID09PSAnZGlmZicgKSA/IHNob3dpbmdOb0NoYXJnZXNTdHJpbmcgOiBtYW55Q2hhcmdlUGFpcnNTdHJpbmc7XHJcblxyXG4gICAgLy8gaWYgdGhlcmUgaXMgYW4gaW5kdWNlZCBjaGFyZ2UsIGluY2x1ZGUgaXQgaW4gdGhlIGZ1bGwgY2hhcmdlIGRlc2NyaXB0aW9uXHJcbiAgICBsZXQgd2FsbENoYXJnZVN0cmluZztcclxuICAgIGlmICggKCB5ZWxsb3dCYWxsb29uLmluZHVjaW5nQ2hhcmdlUHJvcGVydHkuZ2V0KCkgfHwgZ3JlZW5JbmR1Y2luZ0FuZFZpc2libGUgKSAmJiBjaGFyZ2VzU2hvd24gPT09ICdhbGwnICYmIHdhbGxWaXNpYmxlICkge1xyXG4gICAgICBpbmR1Y2VkQ2hhcmdlU3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCB3YWxsSW5kdWNlZENoYXJnZVN1bW1hcnlQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgaW5kdWNlZENoYXJnZTogaW5kdWNlZENoYXJnZVN0cmluZyxcclxuICAgICAgICBwb3NpdGl2ZUNoYXJnZXM6IHBvc2l0aXZlQ2hhcmdlc0RvTm90TW92ZVN0cmluZ1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICB3YWxsQ2hhcmdlU3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCB3YWxsQ2hhcmdlV2l0aEluZHVjZWRQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgbmV0Q2hhcmdlOiB3YWxsTm9OZXRDaGFyZ2VTdHJpbmcsXHJcbiAgICAgICAgc2hvd25DaGFyZ2VzOiBzaG93bkNoYXJnZXNTdHJpbmcsXHJcbiAgICAgICAgaW5kdWNlZENoYXJnZTogaW5kdWNlZENoYXJnZVN0cmluZ1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgd2FsbENoYXJnZVN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggd2FsbENoYXJnZVdpdGhvdXRJbmR1Y2VkUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIG5ldENoYXJnZTogd2FsbE5vTmV0Q2hhcmdlU3RyaW5nLFxyXG4gICAgICAgIHNob3duQ2hhcmdlczogc2hvd25DaGFyZ2VzU3RyaW5nXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkZXNjcmlwdGlvblN0cmluZyA9IHdhbGxDaGFyZ2VTdHJpbmc7XHJcbiAgICByZXR1cm4gZGVzY3JpcHRpb25TdHJpbmc7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgZGVzY3JpcHRpb24gb2YgdGhlIHdhbGwgY2hhcmdlIHRoYXQgaW5jbHVkZXMgdGhlIGxhYmVsLiBTb21ldGhpbmcgbGlrZVxyXG4gICAqIFwiV2FsbCBoYXMgbm8gbmV0IGNoYXJnZSwgc2hvd2luZy4uLlwiXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCYWxsb29uTW9kZWx9IHllbGxvd0JhbGxvb25cclxuICAgKiBAcGFyYW0ge0JhbGxvb25Nb2RlbH0gZ3JlZW5CYWxsb29uXHJcbiAgICogQHBhcmFtIHtib29sZWFufSB3YWxsVmlzaWJsZVxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFyZ2VzU2hvd25cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldFdhbGxDaGFyZ2VEZXNjcmlwdGlvbldpdGhMYWJlbCggeWVsbG93QmFsbG9vbiwgZ3JlZW5CYWxsb29uLCBiYWxsb29uc0FkamFjZW50LCB3YWxsVmlzaWJsZSwgY2hhcmdlc1Nob3duICkge1xyXG4gICAgbGV0IGRlc2NyaXB0aW9uID0gV2FsbERlc2NyaWJlci5nZXRXYWxsQ2hhcmdlRGVzY3JpcHRpb24oIHllbGxvd0JhbGxvb24sIGdyZWVuQmFsbG9vbiwgYmFsbG9vbnNBZGphY2VudCwgd2FsbFZpc2libGUsIGNoYXJnZXNTaG93biApO1xyXG4gICAgZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbi50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHdhbGxDaGFyZ2VQYXR0ZXJuU3RyaW5nV2l0aExhYmVsLCB7XHJcbiAgICAgIHdhbGxDaGFyZ2U6IGRlc2NyaXB0aW9uXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGluZHVjZWQgY2hhcmdlIGFtb3VudCBkZXNjcmlwdGlvbiBmb3IgdGhlIGJhbGxvb24sIGRlc2NyaWJpbmcgd2hldGhlciB0aGUgY2hhcmdlcyBhcmVcclxuICAgKiBcImEgbGl0dGxlIGJpdFwiIGRpc3BsYWNlZCBhbmQgc28gb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtICB7QmFsbG9vbk1vZGVsfSBiYWxsb29uXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBzdGF0aWMgZ2V0SW5kdWNlZENoYXJnZUFtb3VudERlc2NyaXB0aW9uKCBiYWxsb29uICkge1xyXG5cclxuICAgIGxldCBhbW91bnREZXNjcmlwdGlvbjtcclxuICAgIGNvbnN0IGRlc2NyaXB0aW9uS2V5cyA9IE9iamVjdC5rZXlzKCBJTkRVQ0VEX0NIQVJHRV9ERVNDUklQVElPTl9NQVAgKTtcclxuICAgIGZvciAoIGxldCBqID0gMDsgaiA8IGRlc2NyaXB0aW9uS2V5cy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgY29uc3QgdmFsdWUgPSBJTkRVQ0VEX0NIQVJHRV9ERVNDUklQVElPTl9NQVBbIGRlc2NyaXB0aW9uS2V5c1sgaiBdIF07XHJcbiAgICAgIGlmICggdmFsdWUucmFuZ2UuY29udGFpbnMoIGJhbGxvb24uY2xvc2VzdENoYXJnZUluV2FsbC5nZXREaXNwbGFjZW1lbnQoKSApICkge1xyXG4gICAgICAgIGFtb3VudERlc2NyaXB0aW9uID0gdmFsdWUuZGVzY3JpcHRpb247XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhbW91bnREZXNjcmlwdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgZGVzY3JpcHRpb24gZm9yIGluZHVjZWQgY2hhcmdlIHdoZW4gdGhlcmUgaXMgbm8gaW5kdWNlZCBjaGFyZ2UuIFNvbWV0aGluZyBsaWtlXHJcbiAgICogXCJJbiB3YWxsLCBubyBjaGFuZ2UgaW4gY2hhcmdlcy5cIlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwb3NpdGlvblN0cmluZ1xyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldE5vQ2hhbmdlSW5DaGFyZ2VzRGVzY3JpcHRpb24oIHBvc2l0aW9uU3RyaW5nICkge1xyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggd2FsbE5vQ2hhbmdlSW5DaGFyZ2VzUGF0dGVyblN0cmluZywge1xyXG4gICAgICBwb3NpdGlvbjogcG9zaXRpb25TdHJpbmdcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgaW5kdWNlZCBjaGFyZ2UgZGVzY3JpcHRpb24gd2l0aG91dCB0aGUgYW1vdW50IG9mIGluZHVjZWQgY2hhcmdlLiBXaWxsIHJldHVybiBzb21ldGhpbmcgbGlrZVxyXG4gICAqIFwiTmVnYXRpdmUgY2hhcmdlcyBpbiB3YWxsIG1vdmUgYXdheSBmcm9tIHllbGxvdyBiYWxsb29uLlwiXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCYWxsb29uTW9kZWx9IGJhbGxvb25cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gYmFsbG9vbkxhYmVsXHJcbiAgICogQHBhcmFtIHtib29sZWFufSB3YWxsVmlzaWJsZVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldEluZHVjZWRDaGFyZ2VEZXNjcmlwdGlvbldpdGhOb0Ftb3VudCggYmFsbG9vbiwgYmFsbG9vbkxhYmVsLCB3YWxsVmlzaWJsZSApIHtcclxuICAgIGxldCBkZXNjcmlwdGlvblN0cmluZztcclxuXHJcbiAgICBjb25zdCBjaGFyZ2VQb3NpdGlvblN0cmluZyA9IFdhbGxEZXNjcmliZXIuZ2V0SW5kdWNlZENoYXJnZVBvc2l0aW9uRGVzY3JpcHRpb24oIGJhbGxvb24sIHdhbGxWaXNpYmxlLCB0cnVlICk7XHJcbiAgICBpZiAoIGJhbGxvb24uaW5kdWNpbmdDaGFyZ2VQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgZGVzY3JpcHRpb25TdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIGluZHVjZWRDaGFyZ2VOb0Ftb3VudFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICB3YWxsUG9zaXRpb246IGNoYXJnZVBvc2l0aW9uU3RyaW5nLFxyXG4gICAgICAgIGJhbGxvb246IGJhbGxvb25MYWJlbFxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgZGVzY3JpcHRpb25TdHJpbmcgPSBXYWxsRGVzY3JpYmVyLmdldE5vQ2hhbmdlSW5DaGFyZ2VzRGVzY3JpcHRpb24oIGNoYXJnZVBvc2l0aW9uU3RyaW5nICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRlc2NyaXB0aW9uU3RyaW5nO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGFuIGluZHVjZWQgY2hhcmdlIGFtb3VudCBkZXNjcmlwdGlvbiBmb3IgYSBiYWxsb29uLCBiYXNlZCBvbiB0aGUgcG9zaXRpb25zIG9mIGNoYXJnZXMgaW4gdGhlIHdhbGwuICBXZSBmaW5kIHRoZVxyXG4gICAqIGNsb3Nlc3QgY2hhcmdlIHRvIHRoZSBiYWxsb29uLCBhbmQgZGV0ZXJtaW5lIGhvdyBmYXIgaXQgaGFzIGJlZW4gZGlzcGxhY2VkIGZyb20gaXRzIGluaXRpYWwgcG9zaXRpb24uIFdpbGxcclxuICAgKiByZXR1cm4gc29tZXRoaW5nIGxpa2U6XHJcbiAgICpcclxuICAgKiBcIk5lZ2F0aXZlIGNoYXJnZXMgaW4gd2FsbCBtb3ZlIGF3YXkgZnJvbSB5ZWxsb3cgYmFsbG9vbiBhIGxpdHRsZSBiaXQuXCIgb3JcclxuICAgKiBcIk5lZ2F0aXZlIGNoYXJnZXMgaW4gd2FsbCBtb3ZlIGF3YXkgZnJvbSB5ZWxsb3cgYmFsbG9vbiBhIGxpdHRsZSBiaXQuIFBvc2l0aXZlIGNoYXJnZXMgZG8gbm90IG1vdmUuXCJcclxuICAgKlxyXG4gICAqIEBzdGF0aWNcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JhbGxvb25Nb2RlbH0gYmFsbG9vblxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBiYWxsb29uTGFiZWxcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHdhbGxWaXNpYmxlXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldEluZHVjZWRDaGFyZ2VEZXNjcmlwdGlvbiggYmFsbG9vbiwgYmFsbG9vbkxhYmVsLCB3YWxsVmlzaWJsZSwgb3B0aW9ucyApIHtcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBpbmNsdWRlV2FsbFBvc2l0aW9uOiB0cnVlLCAvLyBpbmNsdWRlIHBvc2l0aW9uIGluIHRoZSB3YWxsP1xyXG4gICAgICBpbmNsdWRlUG9zaXRpdmVDaGFyZ2VJbmZvOiB0cnVlIC8vIGluY2x1ZGUgaW5mb3JtYXRpb24gYWJvdXQgcG9zaXRpdmUgY2hhcmdlcyBob3cgcG9zaXRpdmUgY2hhcmdlcyBkbyBub3QgbW92ZT9cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBsZXQgZGVzY3JpcHRpb25TdHJpbmc7XHJcbiAgICBjb25zdCBjaGFyZ2VQb3NpdGlvblN0cmluZyA9IFdhbGxEZXNjcmliZXIuZ2V0SW5kdWNlZENoYXJnZVBvc2l0aW9uRGVzY3JpcHRpb24oIGJhbGxvb24sIHdhbGxWaXNpYmxlLCBvcHRpb25zLmluY2x1ZGVXYWxsUG9zaXRpb24gKTtcclxuXHJcbiAgICBpZiAoIGJhbGxvb24uaW5kdWNpbmdDaGFyZ2VQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgY29uc3QgaW5kdWNlZENoYXJnZUFtb3VudCA9IFdhbGxEZXNjcmliZXIuZ2V0SW5kdWNlZENoYXJnZUFtb3VudERlc2NyaXB0aW9uKCBiYWxsb29uICk7XHJcblxyXG4gICAgICBkZXNjcmlwdGlvblN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggaW5kdWNlZENoYXJnZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICB3YWxsUG9zaXRpb246IGNoYXJnZVBvc2l0aW9uU3RyaW5nLFxyXG4gICAgICAgIGJhbGxvb246IGJhbGxvb25MYWJlbCxcclxuICAgICAgICBpbmR1Y3Rpb25BbW91bnQ6IGluZHVjZWRDaGFyZ2VBbW91bnRcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGRlc2NyaXB0aW9uU3RyaW5nID0gV2FsbERlc2NyaWJlci5nZXROb0NoYW5nZUluQ2hhcmdlc0Rlc2NyaXB0aW9uKCBjaGFyZ2VQb3NpdGlvblN0cmluZyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGFsbCBjaGFyZ2VzIGFyZSBzaG93biwgaW5jbHVkZSBpbmZvcm1hdGlvbiBhYm91dCBob3cgcG9zaXRpdmUgY2hhcmdlcyBkbyBub3QgbW92ZVxyXG4gICAgaWYgKCBvcHRpb25zLmluY2x1ZGVQb3NpdGl2ZUNoYXJnZUluZm8gJiYgYmFsbG9vbi5pbmR1Y2luZ0NoYXJnZVByb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgLy8gd3JhcCBpbmR1Y2VkIGNoYXJnZSB3aXRoIHB1bmN0dWF0aW9uXHJcbiAgICAgIGRlc2NyaXB0aW9uU3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgc3RhdGVtZW50OiBkZXNjcmlwdGlvblN0cmluZ1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBkZXNjcmlwdGlvblN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggd2FsbEluZHVjZWRDaGFyZ2VTdW1tYXJ5UGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIGluZHVjZWRDaGFyZ2U6IGRlc2NyaXB0aW9uU3RyaW5nLFxyXG4gICAgICAgIHBvc2l0aXZlQ2hhcmdlczogcG9zaXRpdmVDaGFyZ2VzRG9Ob3RNb3ZlU3RyaW5nXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVzY3JpcHRpb25TdHJpbmc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBkZXNjcmlwdGlvbiBvZiBib3RoIGJhbGxvb25zLiBXaWxsIHJldHVybiBzb21ldGhpbmcgbGlrZVxyXG4gICAqXHJcbiAgICogXCJOZWdhdGl2ZSBjaGFyZ2VzIGluIHdhbGwgbW92ZSBhd2F5IGZyb20gYmFsbG9vbnMgcXVpdGUgYSBsb3QuIFBvc2l0aXZlIGNoYXJnZXMgZG8gbm90IG1vdmUuXCIgb3JcclxuICAgKiBcIk5lZ2F0aXZlIGNoYXJnZXMgaW4gbG93ZXIgd2FsbCBtb3ZlIGF3YXkgZnJvbSBiYWxsb29ucyBxdWl0ZSBhIGxvdC4gUG9zaXRpdmUgY2hhcmdlcyBkbyBub3QgbW92ZS5cIlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldENvbWJpbmVkSW5kdWNlZENoYXJnZURlc2NyaXB0aW9uKCBiYWxsb29uLCB3YWxsVmlzaWJsZSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgaW5jbHVkZVdhbGxQb3NpdGlvbjogdHJ1ZSxcclxuICAgICAgaW5jbHVkZVBvc2l0aXZlQ2hhcmdlSW5mbzogdHJ1ZVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG4gICAgbGV0IGRlc2NyaXB0aW9uU3RyaW5nO1xyXG4gICAgY29uc3QgY2hhcmdlUG9zaXRpb25TdHJpbmcgPSBXYWxsRGVzY3JpYmVyLmdldEluZHVjZWRDaGFyZ2VQb3NpdGlvbkRlc2NyaXB0aW9uKCBiYWxsb29uLCB3YWxsVmlzaWJsZSwgb3B0aW9ucy5pbmNsdWRlV2FsbFBvc2l0aW9uICk7XHJcblxyXG4gICAgY29uc3QgaW5kdWNlZENoYXJnZUFtb3VudCA9IFdhbGxEZXNjcmliZXIuZ2V0SW5kdWNlZENoYXJnZUFtb3VudERlc2NyaXB0aW9uKCBiYWxsb29uICk7XHJcblxyXG4gICAgZGVzY3JpcHRpb25TdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIGluZHVjZWRDaGFyZ2VQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIHdhbGxQb3NpdGlvbjogY2hhcmdlUG9zaXRpb25TdHJpbmcsXHJcbiAgICAgIGJhbGxvb246IGJvdGhCYWxsb29uc1N0cmluZyxcclxuICAgICAgaW5kdWN0aW9uQW1vdW50OiBpbmR1Y2VkQ2hhcmdlQW1vdW50XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gd3JhcCBpbmR1Y2VkIGNoYXJnZSBmcmFnbWVudCB3aXRoIHB1bmN0dWF0aW9uXHJcbiAgICBkZXNjcmlwdGlvblN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc2luZ2xlU3RhdGVtZW50UGF0dGVyblN0cmluZywge1xyXG4gICAgICBzdGF0ZW1lbnQ6IGRlc2NyaXB0aW9uU3RyaW5nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgaWYgKCBiYWxsb29uLmluZHVjaW5nQ2hhcmdlUHJvcGVydHkuZ2V0KCkgJiYgb3B0aW9ucy5pbmNsdWRlUG9zaXRpdmVDaGFyZ2VJbmZvICkge1xyXG4gICAgICBkZXNjcmlwdGlvblN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggd2FsbEluZHVjZWRDaGFyZ2VTdW1tYXJ5UGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIGluZHVjZWRDaGFyZ2U6IGRlc2NyaXB0aW9uU3RyaW5nLFxyXG4gICAgICAgIHBvc2l0aXZlQ2hhcmdlczogcG9zaXRpdmVDaGFyZ2VzRG9Ob3RNb3ZlU3RyaW5nXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVzY3JpcHRpb25TdHJpbmc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIGEgZGVzY3JpcHRpb24gb2Ygd2hlcmUgdGhlIGluZHVjZWQgY2hhcmdlIGlzIGxvY2F0ZWQgaW4gdGhlIHdhbGwuIFdpdGggaW5jbHVkZVdhbGxQb3NpdGlvbiBib29sZWFuLCBpdFxyXG4gICAqIGlzIHBvc3NpYmxlIHRvIGV4Y2x1ZGUgdmVydGljYWwgcG9zaXRpb24gb2YgZGVzY3JpcHRpb24gYW5kIGp1c3QgdXNlIFwiV2FsbFwiIGdlbmVyYWxseS4gV2lsbCByZXR1cm4gb25lIG9mXHJcbiAgICpcclxuICAgKiBcIndhbGxcIlxyXG4gICAqIFwidXBwZXIgd2FsbFwiXHJcbiAgICogXCJsb3dlciB3YWxsXCJcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7W3R5cGVdfSBiYWxsb29uIFtkZXNjcmlwdGlvbl1cclxuICAgKiBAcGFyYW0gd2FsbFZpc2libGVcclxuICAgKiBAcGFyYW0ge1t0eXBlXX0gaW5jbHVkZVdhbGxQb3NpdGlvbiBbZGVzY3JpcHRpb25dXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRJbmR1Y2VkQ2hhcmdlUG9zaXRpb25EZXNjcmlwdGlvbiggYmFsbG9vbiwgd2FsbFZpc2libGUsIGluY2x1ZGVXYWxsUG9zaXRpb24gKSB7XHJcbiAgICBjb25zdCBjaGFyZ2VQb3NpdGlvblggPSBQbGF5QXJlYU1hcC5YX1BPU0lUSU9OUy5BVF9XQUxMO1xyXG4gICAgY29uc3QgY2hhcmdlUG9zaXRpb25ZID0gaW5jbHVkZVdhbGxQb3NpdGlvbiA/IGJhbGxvb24uZ2V0Q2VudGVyWSgpIDogUGxheUFyZWFNYXAuUk9XX1JBTkdFUy5DRU5URVJfUExBWV9BUkVBLmdldENlbnRlcigpO1xyXG4gICAgY29uc3QgY2hhcmdlUG9zaXRpb24gPSBuZXcgVmVjdG9yMiggY2hhcmdlUG9zaXRpb25YLCBjaGFyZ2VQb3NpdGlvblkgKTtcclxuICAgIHJldHVybiBCQVNFRGVzY3JpYmVyLmdldFBvc2l0aW9uRGVzY3JpcHRpb24oIGNoYXJnZVBvc2l0aW9uLCB3YWxsVmlzaWJsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgc3VtbWFyeSBvZiBjaGFyZ2VzIGluIHRoZSB3YWxsLCBmb3IgdGhlIHNjcmVlbiBzdW1tYXJ5LiBUaGUgd2FsbCBpcyBhbHdheXMgbmV1dHJhbCwgc28gb25seSBkZXBlbmRzXHJcbiAgICogb24gd2hpY2ggY2hhcmdlcyBhcmUgdmlzaWJsZSBhbmQgbnVtYmVyIG9mIHBhaXJzIGluIHRoZSB3YWxsLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjaGFyZ2VzU2hvd24gLSBvbmUgb2YgJ25vbmUnfCdhbGwnfCdkaWZmJ1xyXG4gICAqIEBwYXJhbSBudW1iZXJPZkNoYXJnZXNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRTdW1tYXJ5Q2hhcmdlRGVzY3JpcHRpb24oIGNoYXJnZXNTaG93biwgbnVtYmVyT2ZDaGFyZ2VzICkge1xyXG4gICAgY29uc3QgY2hhcmdlU3RyaW5nID0gQkFTRURlc2NyaWJlci5nZXROZXV0cmFsQ2hhcmdlc1Nob3duRGVzY3JpcHRpb24oIGNoYXJnZXNTaG93biwgbnVtYmVyT2ZDaGFyZ2VzICk7XHJcblxyXG4gICAgY29uc3Qgd2FsbE9iamVjdFN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc3VtbWFyeU9iamVjdEhhc0NoYXJnZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgb2JqZWN0OiB3YWxsTGFiZWxTdHJpbmcsXHJcbiAgICAgIGNoYXJnZTogemVyb1N0cmluZ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHN1bW1hcnlPYmplY3RDaGFyZ2VQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIG9iamVjdDogd2FsbE9iamVjdFN0cmluZyxcclxuICAgICAgY2hhcmdlOiBjaGFyZ2VTdHJpbmdcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkucmVnaXN0ZXIoICdXYWxsRGVzY3JpYmVyJywgV2FsbERlc2NyaWJlciApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgV2FsbERlc2NyaWJlcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsT0FBT0MsT0FBTyxNQUFNLGtDQUFrQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sc0NBQXNDO0FBQ3hELE9BQU9DLFdBQVcsTUFBTSxrREFBa0Q7QUFDMUUsT0FBT0MsNEJBQTRCLE1BQU0sMENBQTBDO0FBQ25GLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0MsV0FBVyxNQUFNLDRCQUE0QjtBQUNwRCxPQUFPQyxhQUFhLE1BQU0sb0JBQW9COztBQUU5QztBQUNBLE1BQU1DLDRCQUE0QixHQUFHSCxlQUFlLENBQUNJLHNCQUFzQixDQUFDQyxLQUFLO0FBQ2pGLE1BQU1DLGtCQUFrQixHQUFHTixlQUFlLENBQUNPLFlBQVksQ0FBQ0YsS0FBSztBQUM3RCxNQUFNRyxxQkFBcUIsR0FBR1IsZUFBZSxDQUFDUyxlQUFlLENBQUNKLEtBQUs7QUFDbkUsTUFBTUssZ0JBQWdCLEdBQUdWLGVBQWUsQ0FBQ1csVUFBVSxDQUFDTixLQUFLO0FBQ3pELE1BQU1PLFVBQVUsR0FBR1osZUFBZSxDQUFDYSxJQUFJLENBQUNSLEtB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