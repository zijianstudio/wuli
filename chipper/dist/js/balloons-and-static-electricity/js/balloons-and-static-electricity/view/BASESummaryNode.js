// Copyright 2016-2022, University of Colorado Boulder

/**
 * screen summary for this sim.  The screen summary is composed of a dynamic list of descriptions
 * for parts of the play area and control panel.  This content will only ever be seen by a screen reader.
 * By breaking up the summary into a list of items, the user can find specific information about the
 * scene very quickly.
 *
 * @author Jesse Greenberg
 */

import Multilink from '../../../../axon/js/Multilink.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Node } from '../../../../scenery/js/imports.js';
import balloonsAndStaticElectricity from '../../balloonsAndStaticElectricity.js';
import BASEA11yStrings from '../BASEA11yStrings.js';
import BASEDescriber from './describers/BASEDescriber.js';
import SweaterDescriber from './describers/SweaterDescriber.js';
import WallDescriber from './describers/WallDescriber.js';
const grabBalloonToPlayString = BASEA11yStrings.grabBalloonToPlay.value;
const andARemovableWallString = BASEA11yStrings.andARemovableWall.value;
const aSweaterString = BASEA11yStrings.aSweater.value;
const andASweaterString = BASEA11yStrings.andASweater.value;
const roomObjectsPatternString = BASEA11yStrings.roomObjectsPattern.value;
const aYellowBalloonString = BASEA11yStrings.aYellowBalloon.value;
const aGreenBalloonString = BASEA11yStrings.aGreenBalloon.value;
const summaryBalloonChargePatternString = BASEA11yStrings.summaryBalloonChargePattern.value;
const summaryEachBalloonChargePatternString = BASEA11yStrings.summaryEachBalloonChargePattern.value;
const zeroString = BASEA11yStrings.zero.value;
const summaryObjectsHaveChargePatternString = BASEA11yStrings.summaryObjectsHaveChargePattern.value;
const summarySweaterAndWallString = BASEA11yStrings.summarySweaterAndWall.value;
const summarySweaterWallPatternString = BASEA11yStrings.summarySweaterWallPattern.value;
const summarySecondBalloonInducingChargePatternString = BASEA11yStrings.summarySecondBalloonInducingChargePattern.value;
const summaryBothBalloonsPatternString = BASEA11yStrings.summaryBothBalloonsPattern.value;
const summaryObjectEachHasPatternString = BASEA11yStrings.summaryObjectEachHasPattern.value;
const summaryObjectEachPatternString = BASEA11yStrings.summaryObjectEachPattern.value;
const singleStatementPatternString = BASEA11yStrings.singleStatementPattern.value;
const summaryYellowGreenSweaterWallPatternString = BASEA11yStrings.summaryYellowGreenSweaterWallPattern.value;
const summaryYellowGreenSweaterPatternString = BASEA11yStrings.summaryYellowGreenSweaterPattern.value;
const summaryYellowSweaterWallPatternString = BASEA11yStrings.summaryYellowSweaterWallPattern.value;
const summaryYellowSweaterPatternString = BASEA11yStrings.summaryYellowSweaterPattern.value;
const initialObjectPositionsString = BASEA11yStrings.initialObjectPositions.value;
const simOpeningString = BASEA11yStrings.simOpening.value;
class BASESummaryNode extends Node {
  /**
   * @param {BASEModel} model
   * @param yellowBalloonNode
   * @param greenBalloonNode
   * @param wallNode
   * @param {Tandem} tandem
   */
  constructor(model, yellowBalloonNode, greenBalloonNode, wallNode, tandem) {
    super({
      tandem: tandem
    });

    // pull out model elements for readability
    this.yellowBalloon = model.yellowBalloon;
    this.greenBalloon = model.greenBalloon;
    this.yellowBalloonDescriber = yellowBalloonNode.describer;
    this.greenBalloonDescriber = greenBalloonNode.describer;

    // @private
    this.model = model;
    this.wall = model.wall;

    // opening paragraph for the simulation
    const openingSummaryNode = new Node({
      tagName: 'p',
      innerContent: simOpeningString
    });
    this.addChild(openingSummaryNode);

    // list of dynamic description content that will update with the state of the simulation
    const listNode = new Node({
      tagName: 'ul'
    });
    const roomObjectsNode = new Node({
      tagName: 'li'
    });
    const objectPositionsNode = new Node({
      tagName: 'li',
      innerContent: initialObjectPositionsString
    });
    const balloonChargeNode = new Node({
      tagName: 'li'
    });
    const sweaterWallChargeNode = new Node({
      tagName: 'li'
    });
    const inducedChargeNode = new Node({
      tagName: 'li'
    });

    // structure the accessible content
    this.addChild(listNode);
    listNode.addChild(roomObjectsNode);
    listNode.addChild(objectPositionsNode);
    listNode.addChild(balloonChargeNode);
    listNode.addChild(sweaterWallChargeNode);
    listNode.addChild(inducedChargeNode);
    this.addChild(new Node({
      tagName: 'p',
      innerContent: grabBalloonToPlayString
    }));

    // update the description that covers the visible objects in the play area
    Multilink.multilink([this.greenBalloon.isVisibleProperty, this.wall.isVisibleProperty], (balloonVisible, wallVisible) => {
      roomObjectsNode.innerContent = BASESummaryNode.getVisibleObjectsDescription(balloonVisible, wallVisible);
    });
    const chargeProperties = [this.yellowBalloon.chargeProperty, this.greenBalloon.chargeProperty, this.greenBalloon.isVisibleProperty, model.showChargesProperty, model.wall.isVisibleProperty, model.sweater.chargeProperty];
    Multilink.multilink(chargeProperties, (yellowBalloonCharge, greenBalloonCharge, greenBalloonVisible, showCharges, wallVisible, sweaterCharge) => {
      const chargesVisible = showCharges !== 'none';
      balloonChargeNode.pdomVisible = chargesVisible;
      sweaterWallChargeNode.pdomVisible = chargesVisible;

      // update labels if charges are shown
      if (chargesVisible) {
        balloonChargeNode.innerContent = this.getBalloonChargeDescription();
        sweaterWallChargeNode.innerContent = this.getSweaterAndWallChargeDescription();
      }
    });
    const inducedChargeProperties = [this.yellowBalloon.positionProperty, this.greenBalloon.positionProperty, this.greenBalloon.isVisibleProperty, model.showChargesProperty, model.wall.isVisibleProperty];
    Multilink.multilink(inducedChargeProperties, (yellowPosition, greenPosition, greenVisible, showCharges, wallVisible) => {
      // the induced charge item is only available if one balloon is visible, inducing charge, and showCharges setting is set to 'all'
      const inducingCharge = this.yellowBalloon.inducingChargeAndVisible() || this.greenBalloon.inducingChargeAndVisible();
      const showInducingItem = inducingCharge && wallVisible && showCharges === 'all';
      inducedChargeNode.pdomVisible = showInducingItem;
      if (showInducingItem) {
        inducedChargeNode.innerContent = this.getInducedChargeDescription();
      }
    });

    // If all of the simulation objects are at their initial state, include the position summary phrase that lets the
    // user know where objects are, see https://github.com/phetsims/balloons-and-static-electricity/issues/393
    Multilink.multilink([this.yellowBalloon.positionProperty, this.greenBalloon.positionProperty, this.greenBalloon.isVisibleProperty, model.wall.isVisibleProperty], (yellowPosition, greenPosition, greenVisible, wallVisible) => {
      const initialValues = this.yellowBalloon.positionProperty.initialValue === yellowPosition && this.greenBalloon.positionProperty.initialValue === greenPosition && this.greenBalloon.isVisibleProperty.initialValue === greenVisible && model.wall.isVisibleProperty.initialValue === wallVisible;
      objectPositionsNode.pdomVisible = initialValues;
    });
  }

  /**
   * Get a description of the sweater and wall charge. Does not include induced charge. If the sweater has neutral
   * charge then the two objects can be described in a single statement for readability. Will return something like
   * "Sweater and wall have zero net charge, many pairs of negative and positive charges" or
   * "Sweater and wall have zero net charge, showing no charges" or
   * "Sweater has positive net charge, a few more positive charges than negative charges. Wall has zero net charge,
   *   many pairs of negative and positive charges." or
   * "Sweater has positive net charge, showing several positive charges. Wall has zero  net charge, showing several
   *   positive charges."
   *
   * @private
   *
   * @returns {string}
   */
  getSweaterAndWallChargeDescription() {
    let description;
    const chargesShown = this.model.showChargesProperty.get();
    const wallVisible = this.model.wall.isVisibleProperty.get();
    const numberOfWallCharges = this.model.wall.numX * this.model.wall.numY;
    const wallChargeString = BASEDescriber.getNeutralChargesShownDescription(chargesShown, numberOfWallCharges);

    // if sweater has neutral charge, describe the sweater and wall together
    if (this.model.sweater.chargeProperty.get() === 0 && wallVisible) {
      const chargedObjectsString = StringUtils.fillIn(summaryObjectsHaveChargePatternString, {
        objects: summarySweaterAndWallString,
        charge: zeroString
      });
      const patternString = chargesShown === 'all' ? summaryObjectEachHasPatternString : summaryObjectEachPatternString;

      // both have same described charge, can be described with wallChargeString
      description = StringUtils.fillIn(patternString, {
        object: chargedObjectsString,
        charge: wallChargeString
      });
    } else {
      const sweaterSummaryString = SweaterDescriber.getSummaryChargeDescription(chargesShown, this.model.sweater.chargeProperty.get());

      // if the wall is visible, it also gets its own description
      if (wallVisible) {
        const wallSummaryString = WallDescriber.getSummaryChargeDescription(chargesShown, numberOfWallCharges);
        description = StringUtils.fillIn(summarySweaterWallPatternString, {
          sweater: sweaterSummaryString,
          wall: wallSummaryString
        });
      } else {
        description = sweaterSummaryString;
      }
    }
    return description;
  }

  /**
   * Get a description which describes the charge of balloons in the simulation. Dependent on charge values, charge
   * visibility, and balloon visibility. Will return something like
   *
   * "Yellow balloon has negative net charge, a few more negative charges than positive charges." or
   * “Yellow balloon has negative net charge, several more negative charges than positive charges. Green balloon has negative net charge, a few more negative charges than positive charges. Yellow balloon has negative net charge, showing several negative charges. Green balloon has negative net charge, showing a few negative charges.”
   *
   * @private
   *
   * @returns {string}
   */
  getBalloonChargeDescription() {
    let description;
    const yellowChargeRange = BASEDescriber.getDescribedChargeRange(this.yellowBalloon.chargeProperty.get());
    const greenChargeRange = BASEDescriber.getDescribedChargeRange(this.greenBalloon.chargeProperty.get());
    const yellowRelativeCharge = this.yellowBalloonDescriber.chargeDescriber.getSummaryRelativeChargeDescription();
    const yellowNetCharge = this.yellowBalloonDescriber.chargeDescriber.getNetChargeDescriptionWithLabel();
    if (!this.greenBalloon.isVisibleProperty.get()) {
      description = StringUtils.fillIn(summaryBalloonChargePatternString, {
        balloonCharge: yellowNetCharge,
        showingCharge: yellowRelativeCharge
      });
    } else if (this.greenBalloon.isVisibleProperty.get() && yellowChargeRange.equals(greenChargeRange)) {
      // both balloons visible have the same charge, describe charge together
      const eachNetCharge = BASEDescriber.getNetChargeDescriptionWithLabel(this.yellowBalloon.chargeProperty.get());
      description = StringUtils.fillIn(summaryBalloonChargePatternString, {
        balloonCharge: eachNetCharge,
        showingCharge: yellowRelativeCharge
      });
    } else {
      // both balloons visible with different amounts of relative charge
      const greenRelativeCharge = this.greenBalloonDescriber.chargeDescriber.getSummaryRelativeChargeDescription();
      const greenNetCharge = this.greenBalloonDescriber.chargeDescriber.getNetChargeDescriptionWithLabel();
      const yellowBalloonDescription = StringUtils.fillIn(summaryBalloonChargePatternString, {
        balloonCharge: yellowNetCharge,
        showingCharge: yellowRelativeCharge
      });
      const greenBalloonDescription = StringUtils.fillIn(summaryBalloonChargePatternString, {
        balloonCharge: greenNetCharge,
        showingCharge: greenRelativeCharge
      });
      description = StringUtils.fillIn(summaryEachBalloonChargePatternString, {
        yellowBalloon: yellowBalloonDescription,
        greenBalloon: greenBalloonDescription
      });
    }
    return description;
  }

  /**
   * Get the description for induced charge of a balloon/balloons on the wall. Will return something like
   *
   * "Negative charges in wall move away from Yellow Balloon a lot. Positive charges do not move." or
   * "Negative charges in wall move away from balloons quite a lot. Positive charges do not move." or
   * "Negative charges in wall move away from Green Balloon a little bit. Positive charges do not move."
   *
   * @private
   *
   * @returns {string}
   */
  getInducedChargeDescription() {
    let description;
    const yellowBalloon = this.yellowBalloon;
    const yellowBalloonDescriber = this.yellowBalloonDescriber;
    const yellowBalloonLabel = yellowBalloonDescriber.accessibleName;
    const greenBalloon = this.greenBalloon;
    const greenBalloonDescriber = this.greenBalloonDescriber;
    const greenBalloonLabel = greenBalloonDescriber.accessibleName;
    const greenInducingChargeAndVisilbe = greenBalloon.inducingChargeAndVisible();
    const yellowInducingChargeAndVisible = yellowBalloon.inducingChargeAndVisible();
    assert && assert(greenInducingChargeAndVisilbe || yellowInducingChargeAndVisible);
    const wallVisible = this.model.wall.isVisibleProperty.get();
    if (greenInducingChargeAndVisilbe && yellowInducingChargeAndVisible) {
      if (this.model.balloonsAdjacentProperty.get()) {
        description = WallDescriber.getCombinedInducedChargeDescription(yellowBalloon, wallVisible, {
          includeWallPosition: false
        });

        // add punctuation, a period at  the end of the phrase
        description = StringUtils.fillIn(singleStatementPatternString, {
          statement: description
        });
      } else {
        // full description for yellow balloon
        const yellowBalloonDescription = WallDescriber.getInducedChargeDescription(yellowBalloon, yellowBalloonLabel, wallVisible, {
          includeWallPosition: false,
          includePositiveChargeInfo: false
        });

        // short summary for green balloon
        const inducedChargeAmount = WallDescriber.getInducedChargeAmountDescription(greenBalloon);
        const greenBalloonDescription = StringUtils.fillIn(summarySecondBalloonInducingChargePatternString, {
          amount: inducedChargeAmount
        });
        description = StringUtils.fillIn(summaryBothBalloonsPatternString, {
          yellowBalloon: yellowBalloonDescription,
          greenBalloon: greenBalloonDescription
        });
      }
    } else {
      if (greenInducingChargeAndVisilbe) {
        description = WallDescriber.getInducedChargeDescription(greenBalloon, greenBalloonLabel, wallVisible, {
          includeWallPosition: false
        });
      } else if (yellowInducingChargeAndVisible) {
        description = WallDescriber.getInducedChargeDescription(yellowBalloon, yellowBalloonLabel, wallVisible, {
          includeWallPosition: false
        });
      }

      // add necessary punctuation
      description = StringUtils.fillIn(singleStatementPatternString, {
        statement: description
      });
    }
    return description;
  }

  /**
   * Get a description of the objects that are currently visible in the sim.
   *
   * @private
   * @param  {Property.<boolean>} balloonVisible
   * @param  {Property.<boolean>} wallVisible
   * @returns {string}
   */
  static getVisibleObjectsDescription(balloonVisible, wallVisible) {
    let patternString;
    if (wallVisible) {
      patternString = balloonVisible ? summaryYellowGreenSweaterWallPatternString : summaryYellowSweaterWallPatternString;
    } else {
      patternString = balloonVisible ? summaryYellowGreenSweaterPatternString : summaryYellowSweaterPatternString;
    }
    const sweaterString = wallVisible ? aSweaterString : andASweaterString;
    const descriptionString = StringUtils.fillIn(patternString, {
      yellowBalloon: aYellowBalloonString,
      greenBalloon: aGreenBalloonString,
      sweater: sweaterString,
      wall: andARemovableWallString
    });
    return StringUtils.fillIn(roomObjectsPatternString, {
      description: descriptionString
    });
  }
}
balloonsAndStaticElectricity.register('BASESummaryNode', BASESummaryNode);
export default BASESummaryNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJTdHJpbmdVdGlscyIsIk5vZGUiLCJiYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5IiwiQkFTRUExMXlTdHJpbmdzIiwiQkFTRURlc2NyaWJlciIsIlN3ZWF0ZXJEZXNjcmliZXIiLCJXYWxsRGVzY3JpYmVyIiwiZ3JhYkJhbGxvb25Ub1BsYXlTdHJpbmciLCJncmFiQmFsbG9vblRvUGxheSIsInZhbHVlIiwiYW5kQVJlbW92YWJsZVdhbGxTdHJpbmciLCJhbmRBUmVtb3ZhYmxlV2FsbCIsImFTd2VhdGVyU3RyaW5nIiwiYVN3ZWF0ZXIiLCJhbmRBU3dlYXRlclN0cmluZyIsImFuZEFTd2VhdGVyIiwicm9vbU9iamVjdHNQYXR0ZXJuU3RyaW5nIiwicm9vbU9iamVjdHNQYXR0ZXJuIiwiYVllbGxvd0JhbGxvb25TdHJpbmciLCJhWWVsbG93QmFsbG9vbiIsImFHcmVlbkJhbGxvb25TdHJpbmciLCJhR3JlZW5CYWxsb29uIiwic3VtbWFyeUJhbGxvb25DaGFyZ2VQYXR0ZXJuU3RyaW5nIiwic3VtbWFyeUJhbGxvb25DaGFyZ2VQYXR0ZXJuIiwic3VtbWFyeUVhY2hCYWxsb29uQ2hhcmdlUGF0dGVyblN0cmluZyIsInN1bW1hcnlFYWNoQmFsbG9vbkNoYXJnZVBhdHRlcm4iLCJ6ZXJvU3RyaW5nIiwiemVybyIsInN1bW1hcnlPYmplY3RzSGF2ZUNoYXJnZVBhdHRlcm5TdHJpbmciLCJzdW1tYXJ5T2JqZWN0c0hhdmVDaGFyZ2VQYXR0ZXJuIiwic3VtbWFyeVN3ZWF0ZXJBbmRXYWxsU3RyaW5nIiwic3VtbWFyeVN3ZWF0ZXJBbmRXYWxsIiwic3VtbWFyeVN3ZWF0ZXJXYWxsUGF0dGVyblN0cmluZyIsInN1bW1hcnlTd2VhdGVyV2FsbFBhdHRlcm4iLCJzdW1tYXJ5U2Vjb25kQmFsbG9vbkluZHVjaW5nQ2hhcmdlUGF0dGVyblN0cmluZyIsInN1bW1hcnlTZWNvbmRCYWxsb29uSW5kdWNpbmdDaGFyZ2VQYXR0ZXJuIiwic3VtbWFyeUJvdGhCYWxsb29uc1BhdHRlcm5TdHJpbmciLCJzdW1tYXJ5Qm90aEJhbGxvb25zUGF0dGVybiIsInN1bW1hcnlPYmplY3RFYWNoSGFzUGF0dGVyblN0cmluZyIsInN1bW1hcnlPYmplY3RFYWNoSGFzUGF0dGVybiIsInN1bW1hcnlPYmplY3RFYWNoUGF0dGVyblN0cmluZyIsInN1bW1hcnlPYmplY3RFYWNoUGF0dGVybiIsInNpbmdsZVN0YXRlbWVudFBhdHRlcm5TdHJpbmciLCJzaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuIiwic3VtbWFyeVllbGxvd0dyZWVuU3dlYXRlcldhbGxQYXR0ZXJuU3RyaW5nIiwic3VtbWFyeVllbGxvd0dyZWVuU3dlYXRlcldhbGxQYXR0ZXJuIiwic3VtbWFyeVllbGxvd0dyZWVuU3dlYXRlclBhdHRlcm5TdHJpbmciLCJzdW1tYXJ5WWVsbG93R3JlZW5Td2VhdGVyUGF0dGVybiIsInN1bW1hcnlZZWxsb3dTd2VhdGVyV2FsbFBhdHRlcm5TdHJpbmciLCJzdW1tYXJ5WWVsbG93U3dlYXRlcldhbGxQYXR0ZXJuIiwic3VtbWFyeVllbGxvd1N3ZWF0ZXJQYXR0ZXJuU3RyaW5nIiwic3VtbWFyeVllbGxvd1N3ZWF0ZXJQYXR0ZXJuIiwiaW5pdGlhbE9iamVjdFBvc2l0aW9uc1N0cmluZyIsImluaXRpYWxPYmplY3RQb3NpdGlvbnMiLCJzaW1PcGVuaW5nU3RyaW5nIiwic2ltT3BlbmluZyIsIkJBU0VTdW1tYXJ5Tm9kZSIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ5ZWxsb3dCYWxsb29uTm9kZSIsImdyZWVuQmFsbG9vbk5vZGUiLCJ3YWxsTm9kZSIsInRhbmRlbSIsInllbGxvd0JhbGxvb24iLCJncmVlbkJhbGxvb24iLCJ5ZWxsb3dCYWxsb29uRGVzY3JpYmVyIiwiZGVzY3JpYmVyIiwiZ3JlZW5CYWxsb29uRGVzY3JpYmVyIiwid2FsbCIsIm9wZW5pbmdTdW1tYXJ5Tm9kZSIsInRhZ05hbWUiLCJpbm5lckNvbnRlbnQiLCJhZGRDaGlsZCIsImxpc3ROb2RlIiwicm9vbU9iamVjdHNOb2RlIiwib2JqZWN0UG9zaXRpb25zTm9kZSIsImJhbGxvb25DaGFyZ2VOb2RlIiwic3dlYXRlcldhbGxDaGFyZ2VOb2RlIiwiaW5kdWNlZENoYXJnZU5vZGUiLCJtdWx0aWxpbmsiLCJpc1Zpc2libGVQcm9wZXJ0eSIsImJhbGxvb25WaXNpYmxlIiwid2FsbFZpc2libGUiLCJnZXRWaXNpYmxlT2JqZWN0c0Rlc2NyaXB0aW9uIiwiY2hhcmdlUHJvcGVydGllcyIsImNoYXJnZVByb3BlcnR5Iiwic2hvd0NoYXJnZXNQcm9wZXJ0eSIsInN3ZWF0ZXIiLCJ5ZWxsb3dCYWxsb29uQ2hhcmdlIiwiZ3JlZW5CYWxsb29uQ2hhcmdlIiwiZ3JlZW5CYWxsb29uVmlzaWJsZSIsInNob3dDaGFyZ2VzIiwic3dlYXRlckNoYXJnZSIsImNoYXJnZXNWaXNpYmxlIiwicGRvbVZpc2libGUiLCJnZXRCYWxsb29uQ2hhcmdlRGVzY3JpcHRpb24iLCJnZXRTd2VhdGVyQW5kV2FsbENoYXJnZURlc2NyaXB0aW9uIiwiaW5kdWNlZENoYXJnZVByb3BlcnRpZXMiLCJwb3NpdGlvblByb3BlcnR5IiwieWVsbG93UG9zaXRpb24iLCJncmVlblBvc2l0aW9uIiwiZ3JlZW5WaXNpYmxlIiwiaW5kdWNpbmdDaGFyZ2UiLCJpbmR1Y2luZ0NoYXJnZUFuZFZpc2libGUiLCJzaG93SW5kdWNpbmdJdGVtIiwiZ2V0SW5kdWNlZENoYXJnZURlc2NyaXB0aW9uIiwiaW5pdGlhbFZhbHVlcyIsImluaXRpYWxWYWx1ZSIsImRlc2NyaXB0aW9uIiwiY2hhcmdlc1Nob3duIiwiZ2V0IiwibnVtYmVyT2ZXYWxsQ2hhcmdlcyIsIm51bVgiLCJudW1ZIiwid2FsbENoYXJnZVN0cmluZyIsImdldE5ldXRyYWxDaGFyZ2VzU2hvd25EZXNjcmlwdGlvbiIsImNoYXJnZWRPYmplY3RzU3RyaW5nIiwiZmlsbEluIiwib2JqZWN0cyIsImNoYXJnZSIsInBhdHRlcm5TdHJpbmciLCJvYmplY3QiLCJzd2VhdGVyU3VtbWFyeVN0cmluZyIsImdldFN1bW1hcnlDaGFyZ2VEZXNjcmlwdGlvbiIsIndhbGxTdW1tYXJ5U3RyaW5nIiwieWVsbG93Q2hhcmdlUmFuZ2UiLCJnZXREZXNjcmliZWRDaGFyZ2VSYW5nZSIsImdyZWVuQ2hhcmdlUmFuZ2UiLCJ5ZWxsb3dSZWxhdGl2ZUNoYXJnZSIsImNoYXJnZURlc2NyaWJlciIsImdldFN1bW1hcnlSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uIiwieWVsbG93TmV0Q2hhcmdlIiwiZ2V0TmV0Q2hhcmdlRGVzY3JpcHRpb25XaXRoTGFiZWwiLCJiYWxsb29uQ2hhcmdlIiwic2hvd2luZ0NoYXJnZSIsImVxdWFscyIsImVhY2hOZXRDaGFyZ2UiLCJncmVlblJlbGF0aXZlQ2hhcmdlIiwiZ3JlZW5OZXRDaGFyZ2UiLCJ5ZWxsb3dCYWxsb29uRGVzY3JpcHRpb24iLCJncmVlbkJhbGxvb25EZXNjcmlwdGlvbiIsInllbGxvd0JhbGxvb25MYWJlbCIsImFjY2Vzc2libGVOYW1lIiwiZ3JlZW5CYWxsb29uTGFiZWwiLCJncmVlbkluZHVjaW5nQ2hhcmdlQW5kVmlzaWxiZSIsInllbGxvd0luZHVjaW5nQ2hhcmdlQW5kVmlzaWJsZSIsImFzc2VydCIsImJhbGxvb25zQWRqYWNlbnRQcm9wZXJ0eSIsImdldENvbWJpbmVkSW5kdWNlZENoYXJnZURlc2NyaXB0aW9uIiwiaW5jbHVkZVdhbGxQb3NpdGlvbiIsInN0YXRlbWVudCIsImluY2x1ZGVQb3NpdGl2ZUNoYXJnZUluZm8iLCJpbmR1Y2VkQ2hhcmdlQW1vdW50IiwiZ2V0SW5kdWNlZENoYXJnZUFtb3VudERlc2NyaXB0aW9uIiwiYW1vdW50Iiwic3dlYXRlclN0cmluZyIsImRlc2NyaXB0aW9uU3RyaW5nIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCQVNFU3VtbWFyeU5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogc2NyZWVuIHN1bW1hcnkgZm9yIHRoaXMgc2ltLiAgVGhlIHNjcmVlbiBzdW1tYXJ5IGlzIGNvbXBvc2VkIG9mIGEgZHluYW1pYyBsaXN0IG9mIGRlc2NyaXB0aW9uc1xyXG4gKiBmb3IgcGFydHMgb2YgdGhlIHBsYXkgYXJlYSBhbmQgY29udHJvbCBwYW5lbC4gIFRoaXMgY29udGVudCB3aWxsIG9ubHkgZXZlciBiZSBzZWVuIGJ5IGEgc2NyZWVuIHJlYWRlci5cclxuICogQnkgYnJlYWtpbmcgdXAgdGhlIHN1bW1hcnkgaW50byBhIGxpc3Qgb2YgaXRlbXMsIHRoZSB1c2VyIGNhbiBmaW5kIHNwZWNpZmljIGluZm9ybWF0aW9uIGFib3V0IHRoZVxyXG4gKiBzY2VuZSB2ZXJ5IHF1aWNrbHkuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkgZnJvbSAnLi4vLi4vYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eS5qcyc7XHJcbmltcG9ydCBCQVNFQTExeVN0cmluZ3MgZnJvbSAnLi4vQkFTRUExMXlTdHJpbmdzLmpzJztcclxuaW1wb3J0IEJBU0VEZXNjcmliZXIgZnJvbSAnLi9kZXNjcmliZXJzL0JBU0VEZXNjcmliZXIuanMnO1xyXG5pbXBvcnQgU3dlYXRlckRlc2NyaWJlciBmcm9tICcuL2Rlc2NyaWJlcnMvU3dlYXRlckRlc2NyaWJlci5qcyc7XHJcbmltcG9ydCBXYWxsRGVzY3JpYmVyIGZyb20gJy4vZGVzY3JpYmVycy9XYWxsRGVzY3JpYmVyLmpzJztcclxuXHJcbmNvbnN0IGdyYWJCYWxsb29uVG9QbGF5U3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmdyYWJCYWxsb29uVG9QbGF5LnZhbHVlO1xyXG5jb25zdCBhbmRBUmVtb3ZhYmxlV2FsbFN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5hbmRBUmVtb3ZhYmxlV2FsbC52YWx1ZTtcclxuY29uc3QgYVN3ZWF0ZXJTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYVN3ZWF0ZXIudmFsdWU7XHJcbmNvbnN0IGFuZEFTd2VhdGVyU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmFuZEFTd2VhdGVyLnZhbHVlO1xyXG5jb25zdCByb29tT2JqZWN0c1BhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Mucm9vbU9iamVjdHNQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBhWWVsbG93QmFsbG9vblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5hWWVsbG93QmFsbG9vbi52YWx1ZTtcclxuY29uc3QgYUdyZWVuQmFsbG9vblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5hR3JlZW5CYWxsb29uLnZhbHVlO1xyXG5jb25zdCBzdW1tYXJ5QmFsbG9vbkNoYXJnZVBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Muc3VtbWFyeUJhbGxvb25DaGFyZ2VQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBzdW1tYXJ5RWFjaEJhbGxvb25DaGFyZ2VQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnN1bW1hcnlFYWNoQmFsbG9vbkNoYXJnZVBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IHplcm9TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuemVyby52YWx1ZTtcclxuY29uc3Qgc3VtbWFyeU9iamVjdHNIYXZlQ2hhcmdlUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5zdW1tYXJ5T2JqZWN0c0hhdmVDaGFyZ2VQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBzdW1tYXJ5U3dlYXRlckFuZFdhbGxTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Muc3VtbWFyeVN3ZWF0ZXJBbmRXYWxsLnZhbHVlO1xyXG5jb25zdCBzdW1tYXJ5U3dlYXRlcldhbGxQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnN1bW1hcnlTd2VhdGVyV2FsbFBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IHN1bW1hcnlTZWNvbmRCYWxsb29uSW5kdWNpbmdDaGFyZ2VQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnN1bW1hcnlTZWNvbmRCYWxsb29uSW5kdWNpbmdDaGFyZ2VQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBzdW1tYXJ5Qm90aEJhbGxvb25zUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5zdW1tYXJ5Qm90aEJhbGxvb25zUGF0dGVybi52YWx1ZTtcclxuY29uc3Qgc3VtbWFyeU9iamVjdEVhY2hIYXNQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnN1bW1hcnlPYmplY3RFYWNoSGFzUGF0dGVybi52YWx1ZTtcclxuY29uc3Qgc3VtbWFyeU9iamVjdEVhY2hQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnN1bW1hcnlPYmplY3RFYWNoUGF0dGVybi52YWx1ZTtcclxuY29uc3Qgc2luZ2xlU3RhdGVtZW50UGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5zaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBzdW1tYXJ5WWVsbG93R3JlZW5Td2VhdGVyV2FsbFBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Muc3VtbWFyeVllbGxvd0dyZWVuU3dlYXRlcldhbGxQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBzdW1tYXJ5WWVsbG93R3JlZW5Td2VhdGVyUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5zdW1tYXJ5WWVsbG93R3JlZW5Td2VhdGVyUGF0dGVybi52YWx1ZTtcclxuY29uc3Qgc3VtbWFyeVllbGxvd1N3ZWF0ZXJXYWxsUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5zdW1tYXJ5WWVsbG93U3dlYXRlcldhbGxQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBzdW1tYXJ5WWVsbG93U3dlYXRlclBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Muc3VtbWFyeVllbGxvd1N3ZWF0ZXJQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBpbml0aWFsT2JqZWN0UG9zaXRpb25zU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmluaXRpYWxPYmplY3RQb3NpdGlvbnMudmFsdWU7XHJcbmNvbnN0IHNpbU9wZW5pbmdTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Muc2ltT3BlbmluZy52YWx1ZTtcclxuXHJcbmNsYXNzIEJBU0VTdW1tYXJ5Tm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0JBU0VNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0geWVsbG93QmFsbG9vbk5vZGVcclxuICAgKiBAcGFyYW0gZ3JlZW5CYWxsb29uTm9kZVxyXG4gICAqIEBwYXJhbSB3YWxsTm9kZVxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHllbGxvd0JhbGxvb25Ob2RlLCBncmVlbkJhbGxvb25Ob2RlLCB3YWxsTm9kZSwgdGFuZGVtICkge1xyXG5cclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHB1bGwgb3V0IG1vZGVsIGVsZW1lbnRzIGZvciByZWFkYWJpbGl0eVxyXG4gICAgdGhpcy55ZWxsb3dCYWxsb29uID0gbW9kZWwueWVsbG93QmFsbG9vbjtcclxuICAgIHRoaXMuZ3JlZW5CYWxsb29uID0gbW9kZWwuZ3JlZW5CYWxsb29uO1xyXG5cclxuICAgIHRoaXMueWVsbG93QmFsbG9vbkRlc2NyaWJlciA9IHllbGxvd0JhbGxvb25Ob2RlLmRlc2NyaWJlcjtcclxuICAgIHRoaXMuZ3JlZW5CYWxsb29uRGVzY3JpYmVyID0gZ3JlZW5CYWxsb29uTm9kZS5kZXNjcmliZXI7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuICAgIHRoaXMud2FsbCA9IG1vZGVsLndhbGw7XHJcblxyXG4gICAgLy8gb3BlbmluZyBwYXJhZ3JhcGggZm9yIHRoZSBzaW11bGF0aW9uXHJcbiAgICBjb25zdCBvcGVuaW5nU3VtbWFyeU5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAncCcsIGlubmVyQ29udGVudDogc2ltT3BlbmluZ1N0cmluZyB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBvcGVuaW5nU3VtbWFyeU5vZGUgKTtcclxuXHJcbiAgICAvLyBsaXN0IG9mIGR5bmFtaWMgZGVzY3JpcHRpb24gY29udGVudCB0aGF0IHdpbGwgdXBkYXRlIHdpdGggdGhlIHN0YXRlIG9mIHRoZSBzaW11bGF0aW9uXHJcbiAgICBjb25zdCBsaXN0Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICd1bCcgfSApO1xyXG4gICAgY29uc3Qgcm9vbU9iamVjdHNOb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2xpJyB9ICk7XHJcbiAgICBjb25zdCBvYmplY3RQb3NpdGlvbnNOb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2xpJywgaW5uZXJDb250ZW50OiBpbml0aWFsT2JqZWN0UG9zaXRpb25zU3RyaW5nIH0gKTtcclxuICAgIGNvbnN0IGJhbGxvb25DaGFyZ2VOb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2xpJyB9ICk7XHJcbiAgICBjb25zdCBzd2VhdGVyV2FsbENoYXJnZU5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnbGknIH0gKTtcclxuICAgIGNvbnN0IGluZHVjZWRDaGFyZ2VOb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2xpJyB9ICk7XHJcblxyXG4gICAgLy8gc3RydWN0dXJlIHRoZSBhY2Nlc3NpYmxlIGNvbnRlbnRcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGxpc3ROb2RlICk7XHJcbiAgICBsaXN0Tm9kZS5hZGRDaGlsZCggcm9vbU9iamVjdHNOb2RlICk7XHJcbiAgICBsaXN0Tm9kZS5hZGRDaGlsZCggb2JqZWN0UG9zaXRpb25zTm9kZSApO1xyXG4gICAgbGlzdE5vZGUuYWRkQ2hpbGQoIGJhbGxvb25DaGFyZ2VOb2RlICk7XHJcbiAgICBsaXN0Tm9kZS5hZGRDaGlsZCggc3dlYXRlcldhbGxDaGFyZ2VOb2RlICk7XHJcbiAgICBsaXN0Tm9kZS5hZGRDaGlsZCggaW5kdWNlZENoYXJnZU5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdwJywgaW5uZXJDb250ZW50OiBncmFiQmFsbG9vblRvUGxheVN0cmluZyB9ICkgKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIGRlc2NyaXB0aW9uIHRoYXQgY292ZXJzIHRoZSB2aXNpYmxlIG9iamVjdHMgaW4gdGhlIHBsYXkgYXJlYVxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyB0aGlzLmdyZWVuQmFsbG9vbi5pc1Zpc2libGVQcm9wZXJ0eSwgdGhpcy53YWxsLmlzVmlzaWJsZVByb3BlcnR5IF0sICggYmFsbG9vblZpc2libGUsIHdhbGxWaXNpYmxlICkgPT4ge1xyXG4gICAgICByb29tT2JqZWN0c05vZGUuaW5uZXJDb250ZW50ID0gQkFTRVN1bW1hcnlOb2RlLmdldFZpc2libGVPYmplY3RzRGVzY3JpcHRpb24oIGJhbGxvb25WaXNpYmxlLCB3YWxsVmlzaWJsZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGNoYXJnZVByb3BlcnRpZXMgPSBbIHRoaXMueWVsbG93QmFsbG9vbi5jaGFyZ2VQcm9wZXJ0eSwgdGhpcy5ncmVlbkJhbGxvb24uY2hhcmdlUHJvcGVydHksIHRoaXMuZ3JlZW5CYWxsb29uLmlzVmlzaWJsZVByb3BlcnR5LCBtb2RlbC5zaG93Q2hhcmdlc1Byb3BlcnR5LCBtb2RlbC53YWxsLmlzVmlzaWJsZVByb3BlcnR5LCBtb2RlbC5zd2VhdGVyLmNoYXJnZVByb3BlcnR5IF07XHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBjaGFyZ2VQcm9wZXJ0aWVzLCAoIHllbGxvd0JhbGxvb25DaGFyZ2UsIGdyZWVuQmFsbG9vbkNoYXJnZSwgZ3JlZW5CYWxsb29uVmlzaWJsZSwgc2hvd0NoYXJnZXMsIHdhbGxWaXNpYmxlLCBzd2VhdGVyQ2hhcmdlICkgPT4ge1xyXG4gICAgICBjb25zdCBjaGFyZ2VzVmlzaWJsZSA9IHNob3dDaGFyZ2VzICE9PSAnbm9uZSc7XHJcbiAgICAgIGJhbGxvb25DaGFyZ2VOb2RlLnBkb21WaXNpYmxlID0gY2hhcmdlc1Zpc2libGU7XHJcbiAgICAgIHN3ZWF0ZXJXYWxsQ2hhcmdlTm9kZS5wZG9tVmlzaWJsZSA9IGNoYXJnZXNWaXNpYmxlO1xyXG5cclxuICAgICAgLy8gdXBkYXRlIGxhYmVscyBpZiBjaGFyZ2VzIGFyZSBzaG93blxyXG4gICAgICBpZiAoIGNoYXJnZXNWaXNpYmxlICkge1xyXG4gICAgICAgIGJhbGxvb25DaGFyZ2VOb2RlLmlubmVyQ29udGVudCA9IHRoaXMuZ2V0QmFsbG9vbkNoYXJnZURlc2NyaXB0aW9uKCk7XHJcbiAgICAgICAgc3dlYXRlcldhbGxDaGFyZ2VOb2RlLmlubmVyQ29udGVudCA9IHRoaXMuZ2V0U3dlYXRlckFuZFdhbGxDaGFyZ2VEZXNjcmlwdGlvbigpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgaW5kdWNlZENoYXJnZVByb3BlcnRpZXMgPSBbIHRoaXMueWVsbG93QmFsbG9vbi5wb3NpdGlvblByb3BlcnR5LCB0aGlzLmdyZWVuQmFsbG9vbi5wb3NpdGlvblByb3BlcnR5LCB0aGlzLmdyZWVuQmFsbG9vbi5pc1Zpc2libGVQcm9wZXJ0eSwgbW9kZWwuc2hvd0NoYXJnZXNQcm9wZXJ0eSwgbW9kZWwud2FsbC5pc1Zpc2libGVQcm9wZXJ0eSBdO1xyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggaW5kdWNlZENoYXJnZVByb3BlcnRpZXMsICggeWVsbG93UG9zaXRpb24sIGdyZWVuUG9zaXRpb24sIGdyZWVuVmlzaWJsZSwgc2hvd0NoYXJnZXMsIHdhbGxWaXNpYmxlICkgPT4ge1xyXG5cclxuICAgICAgLy8gdGhlIGluZHVjZWQgY2hhcmdlIGl0ZW0gaXMgb25seSBhdmFpbGFibGUgaWYgb25lIGJhbGxvb24gaXMgdmlzaWJsZSwgaW5kdWNpbmcgY2hhcmdlLCBhbmQgc2hvd0NoYXJnZXMgc2V0dGluZyBpcyBzZXQgdG8gJ2FsbCdcclxuICAgICAgY29uc3QgaW5kdWNpbmdDaGFyZ2UgPSB0aGlzLnllbGxvd0JhbGxvb24uaW5kdWNpbmdDaGFyZ2VBbmRWaXNpYmxlKCkgfHwgdGhpcy5ncmVlbkJhbGxvb24uaW5kdWNpbmdDaGFyZ2VBbmRWaXNpYmxlKCk7XHJcbiAgICAgIGNvbnN0IHNob3dJbmR1Y2luZ0l0ZW0gPSBpbmR1Y2luZ0NoYXJnZSAmJiB3YWxsVmlzaWJsZSAmJiBzaG93Q2hhcmdlcyA9PT0gJ2FsbCc7XHJcbiAgICAgIGluZHVjZWRDaGFyZ2VOb2RlLnBkb21WaXNpYmxlID0gc2hvd0luZHVjaW5nSXRlbTtcclxuXHJcbiAgICAgIGlmICggc2hvd0luZHVjaW5nSXRlbSApIHtcclxuICAgICAgICBpbmR1Y2VkQ2hhcmdlTm9kZS5pbm5lckNvbnRlbnQgPSB0aGlzLmdldEluZHVjZWRDaGFyZ2VEZXNjcmlwdGlvbigpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSWYgYWxsIG9mIHRoZSBzaW11bGF0aW9uIG9iamVjdHMgYXJlIGF0IHRoZWlyIGluaXRpYWwgc3RhdGUsIGluY2x1ZGUgdGhlIHBvc2l0aW9uIHN1bW1hcnkgcGhyYXNlIHRoYXQgbGV0cyB0aGVcclxuICAgIC8vIHVzZXIga25vdyB3aGVyZSBvYmplY3RzIGFyZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iYWxsb29ucy1hbmQtc3RhdGljLWVsZWN0cmljaXR5L2lzc3Vlcy8zOTNcclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoXHJcbiAgICAgIFsgdGhpcy55ZWxsb3dCYWxsb29uLnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgICAgdGhpcy5ncmVlbkJhbGxvb24ucG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgICB0aGlzLmdyZWVuQmFsbG9vbi5pc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgICBtb2RlbC53YWxsLmlzVmlzaWJsZVByb3BlcnR5XHJcbiAgICAgIF0sICggeWVsbG93UG9zaXRpb24sIGdyZWVuUG9zaXRpb24sIGdyZWVuVmlzaWJsZSwgd2FsbFZpc2libGUgKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5pdGlhbFZhbHVlcyA9IHRoaXMueWVsbG93QmFsbG9vbi5wb3NpdGlvblByb3BlcnR5LmluaXRpYWxWYWx1ZSA9PT0geWVsbG93UG9zaXRpb24gJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmVlbkJhbGxvb24ucG9zaXRpb25Qcm9wZXJ0eS5pbml0aWFsVmFsdWUgPT09IGdyZWVuUG9zaXRpb24gJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmVlbkJhbGxvb24uaXNWaXNpYmxlUHJvcGVydHkuaW5pdGlhbFZhbHVlID09PSBncmVlblZpc2libGUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWwud2FsbC5pc1Zpc2libGVQcm9wZXJ0eS5pbml0aWFsVmFsdWUgPT09IHdhbGxWaXNpYmxlO1xyXG5cclxuICAgICAgICBvYmplY3RQb3NpdGlvbnNOb2RlLnBkb21WaXNpYmxlID0gaW5pdGlhbFZhbHVlcztcclxuICAgICAgfVxyXG4gICAgKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBkZXNjcmlwdGlvbiBvZiB0aGUgc3dlYXRlciBhbmQgd2FsbCBjaGFyZ2UuIERvZXMgbm90IGluY2x1ZGUgaW5kdWNlZCBjaGFyZ2UuIElmIHRoZSBzd2VhdGVyIGhhcyBuZXV0cmFsXHJcbiAgICogY2hhcmdlIHRoZW4gdGhlIHR3byBvYmplY3RzIGNhbiBiZSBkZXNjcmliZWQgaW4gYSBzaW5nbGUgc3RhdGVtZW50IGZvciByZWFkYWJpbGl0eS4gV2lsbCByZXR1cm4gc29tZXRoaW5nIGxpa2VcclxuICAgKiBcIlN3ZWF0ZXIgYW5kIHdhbGwgaGF2ZSB6ZXJvIG5ldCBjaGFyZ2UsIG1hbnkgcGFpcnMgb2YgbmVnYXRpdmUgYW5kIHBvc2l0aXZlIGNoYXJnZXNcIiBvclxyXG4gICAqIFwiU3dlYXRlciBhbmQgd2FsbCBoYXZlIHplcm8gbmV0IGNoYXJnZSwgc2hvd2luZyBubyBjaGFyZ2VzXCIgb3JcclxuICAgKiBcIlN3ZWF0ZXIgaGFzIHBvc2l0aXZlIG5ldCBjaGFyZ2UsIGEgZmV3IG1vcmUgcG9zaXRpdmUgY2hhcmdlcyB0aGFuIG5lZ2F0aXZlIGNoYXJnZXMuIFdhbGwgaGFzIHplcm8gbmV0IGNoYXJnZSxcclxuICAgKiAgIG1hbnkgcGFpcnMgb2YgbmVnYXRpdmUgYW5kIHBvc2l0aXZlIGNoYXJnZXMuXCIgb3JcclxuICAgKiBcIlN3ZWF0ZXIgaGFzIHBvc2l0aXZlIG5ldCBjaGFyZ2UsIHNob3dpbmcgc2V2ZXJhbCBwb3NpdGl2ZSBjaGFyZ2VzLiBXYWxsIGhhcyB6ZXJvICBuZXQgY2hhcmdlLCBzaG93aW5nIHNldmVyYWxcclxuICAgKiAgIHBvc2l0aXZlIGNoYXJnZXMuXCJcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldFN3ZWF0ZXJBbmRXYWxsQ2hhcmdlRGVzY3JpcHRpb24oKSB7XHJcbiAgICBsZXQgZGVzY3JpcHRpb247XHJcblxyXG4gICAgY29uc3QgY2hhcmdlc1Nob3duID0gdGhpcy5tb2RlbC5zaG93Q2hhcmdlc1Byb3BlcnR5LmdldCgpO1xyXG4gICAgY29uc3Qgd2FsbFZpc2libGUgPSB0aGlzLm1vZGVsLndhbGwuaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCBudW1iZXJPZldhbGxDaGFyZ2VzID0gdGhpcy5tb2RlbC53YWxsLm51bVggKiB0aGlzLm1vZGVsLndhbGwubnVtWTtcclxuICAgIGNvbnN0IHdhbGxDaGFyZ2VTdHJpbmcgPSBCQVNFRGVzY3JpYmVyLmdldE5ldXRyYWxDaGFyZ2VzU2hvd25EZXNjcmlwdGlvbiggY2hhcmdlc1Nob3duLCBudW1iZXJPZldhbGxDaGFyZ2VzICk7XHJcblxyXG4gICAgLy8gaWYgc3dlYXRlciBoYXMgbmV1dHJhbCBjaGFyZ2UsIGRlc2NyaWJlIHRoZSBzd2VhdGVyIGFuZCB3YWxsIHRvZ2V0aGVyXHJcbiAgICBpZiAoIHRoaXMubW9kZWwuc3dlYXRlci5jaGFyZ2VQcm9wZXJ0eS5nZXQoKSA9PT0gMCAmJiB3YWxsVmlzaWJsZSApIHtcclxuICAgICAgY29uc3QgY2hhcmdlZE9iamVjdHNTdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIHN1bW1hcnlPYmplY3RzSGF2ZUNoYXJnZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBvYmplY3RzOiBzdW1tYXJ5U3dlYXRlckFuZFdhbGxTdHJpbmcsXHJcbiAgICAgICAgY2hhcmdlOiB6ZXJvU3RyaW5nXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGNvbnN0IHBhdHRlcm5TdHJpbmcgPSBjaGFyZ2VzU2hvd24gPT09ICdhbGwnID8gc3VtbWFyeU9iamVjdEVhY2hIYXNQYXR0ZXJuU3RyaW5nIDogc3VtbWFyeU9iamVjdEVhY2hQYXR0ZXJuU3RyaW5nO1xyXG5cclxuICAgICAgLy8gYm90aCBoYXZlIHNhbWUgZGVzY3JpYmVkIGNoYXJnZSwgY2FuIGJlIGRlc2NyaWJlZCB3aXRoIHdhbGxDaGFyZ2VTdHJpbmdcclxuICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIHBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBvYmplY3Q6IGNoYXJnZWRPYmplY3RzU3RyaW5nLFxyXG4gICAgICAgIGNoYXJnZTogd2FsbENoYXJnZVN0cmluZ1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3Qgc3dlYXRlclN1bW1hcnlTdHJpbmcgPSBTd2VhdGVyRGVzY3JpYmVyLmdldFN1bW1hcnlDaGFyZ2VEZXNjcmlwdGlvbiggY2hhcmdlc1Nob3duLCB0aGlzLm1vZGVsLnN3ZWF0ZXIuY2hhcmdlUHJvcGVydHkuZ2V0KCkgKTtcclxuXHJcbiAgICAgIC8vIGlmIHRoZSB3YWxsIGlzIHZpc2libGUsIGl0IGFsc28gZ2V0cyBpdHMgb3duIGRlc2NyaXB0aW9uXHJcbiAgICAgIGlmICggd2FsbFZpc2libGUgKSB7XHJcbiAgICAgICAgY29uc3Qgd2FsbFN1bW1hcnlTdHJpbmcgPSBXYWxsRGVzY3JpYmVyLmdldFN1bW1hcnlDaGFyZ2VEZXNjcmlwdGlvbiggY2hhcmdlc1Nob3duLCBudW1iZXJPZldhbGxDaGFyZ2VzICk7XHJcbiAgICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIHN1bW1hcnlTd2VhdGVyV2FsbFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICAgIHN3ZWF0ZXI6IHN3ZWF0ZXJTdW1tYXJ5U3RyaW5nLFxyXG4gICAgICAgICAgd2FsbDogd2FsbFN1bW1hcnlTdHJpbmdcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgZGVzY3JpcHRpb24gPSBzd2VhdGVyU3VtbWFyeVN0cmluZztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZXNjcmlwdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGRlc2NyaXB0aW9uIHdoaWNoIGRlc2NyaWJlcyB0aGUgY2hhcmdlIG9mIGJhbGxvb25zIGluIHRoZSBzaW11bGF0aW9uLiBEZXBlbmRlbnQgb24gY2hhcmdlIHZhbHVlcywgY2hhcmdlXHJcbiAgICogdmlzaWJpbGl0eSwgYW5kIGJhbGxvb24gdmlzaWJpbGl0eS4gV2lsbCByZXR1cm4gc29tZXRoaW5nIGxpa2VcclxuICAgKlxyXG4gICAqIFwiWWVsbG93IGJhbGxvb24gaGFzIG5lZ2F0aXZlIG5ldCBjaGFyZ2UsIGEgZmV3IG1vcmUgbmVnYXRpdmUgY2hhcmdlcyB0aGFuIHBvc2l0aXZlIGNoYXJnZXMuXCIgb3JcclxuICAgKiDigJxZZWxsb3cgYmFsbG9vbiBoYXMgbmVnYXRpdmUgbmV0IGNoYXJnZSwgc2V2ZXJhbCBtb3JlIG5lZ2F0aXZlIGNoYXJnZXMgdGhhbiBwb3NpdGl2ZSBjaGFyZ2VzLiBHcmVlbiBiYWxsb29uIGhhcyBuZWdhdGl2ZSBuZXQgY2hhcmdlLCBhIGZldyBtb3JlIG5lZ2F0aXZlIGNoYXJnZXMgdGhhbiBwb3NpdGl2ZSBjaGFyZ2VzLiBZZWxsb3cgYmFsbG9vbiBoYXMgbmVnYXRpdmUgbmV0IGNoYXJnZSwgc2hvd2luZyBzZXZlcmFsIG5lZ2F0aXZlIGNoYXJnZXMuIEdyZWVuIGJhbGxvb24gaGFzIG5lZ2F0aXZlIG5ldCBjaGFyZ2UsIHNob3dpbmcgYSBmZXcgbmVnYXRpdmUgY2hhcmdlcy7igJ1cclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldEJhbGxvb25DaGFyZ2VEZXNjcmlwdGlvbigpIHtcclxuICAgIGxldCBkZXNjcmlwdGlvbjtcclxuXHJcbiAgICBjb25zdCB5ZWxsb3dDaGFyZ2VSYW5nZSA9IEJBU0VEZXNjcmliZXIuZ2V0RGVzY3JpYmVkQ2hhcmdlUmFuZ2UoIHRoaXMueWVsbG93QmFsbG9vbi5jaGFyZ2VQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgY29uc3QgZ3JlZW5DaGFyZ2VSYW5nZSA9IEJBU0VEZXNjcmliZXIuZ2V0RGVzY3JpYmVkQ2hhcmdlUmFuZ2UoIHRoaXMuZ3JlZW5CYWxsb29uLmNoYXJnZVByb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgY29uc3QgeWVsbG93UmVsYXRpdmVDaGFyZ2UgPSB0aGlzLnllbGxvd0JhbGxvb25EZXNjcmliZXIuY2hhcmdlRGVzY3JpYmVyLmdldFN1bW1hcnlSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uKCk7XHJcbiAgICBjb25zdCB5ZWxsb3dOZXRDaGFyZ2UgPSB0aGlzLnllbGxvd0JhbGxvb25EZXNjcmliZXIuY2hhcmdlRGVzY3JpYmVyLmdldE5ldENoYXJnZURlc2NyaXB0aW9uV2l0aExhYmVsKCk7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5ncmVlbkJhbGxvb24uaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIGRlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzdW1tYXJ5QmFsbG9vbkNoYXJnZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBiYWxsb29uQ2hhcmdlOiB5ZWxsb3dOZXRDaGFyZ2UsXHJcbiAgICAgICAgc2hvd2luZ0NoYXJnZTogeWVsbG93UmVsYXRpdmVDaGFyZ2VcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuZ3JlZW5CYWxsb29uLmlzVmlzaWJsZVByb3BlcnR5LmdldCgpICYmIHllbGxvd0NoYXJnZVJhbmdlLmVxdWFscyggZ3JlZW5DaGFyZ2VSYW5nZSApICkge1xyXG5cclxuICAgICAgLy8gYm90aCBiYWxsb29ucyB2aXNpYmxlIGhhdmUgdGhlIHNhbWUgY2hhcmdlLCBkZXNjcmliZSBjaGFyZ2UgdG9nZXRoZXJcclxuICAgICAgY29uc3QgZWFjaE5ldENoYXJnZSA9IEJBU0VEZXNjcmliZXIuZ2V0TmV0Q2hhcmdlRGVzY3JpcHRpb25XaXRoTGFiZWwoIHRoaXMueWVsbG93QmFsbG9vbi5jaGFyZ2VQcm9wZXJ0eS5nZXQoKSApO1xyXG5cclxuICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIHN1bW1hcnlCYWxsb29uQ2hhcmdlUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIGJhbGxvb25DaGFyZ2U6IGVhY2hOZXRDaGFyZ2UsXHJcbiAgICAgICAgc2hvd2luZ0NoYXJnZTogeWVsbG93UmVsYXRpdmVDaGFyZ2VcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBib3RoIGJhbGxvb25zIHZpc2libGUgd2l0aCBkaWZmZXJlbnQgYW1vdW50cyBvZiByZWxhdGl2ZSBjaGFyZ2VcclxuICAgICAgY29uc3QgZ3JlZW5SZWxhdGl2ZUNoYXJnZSA9IHRoaXMuZ3JlZW5CYWxsb29uRGVzY3JpYmVyLmNoYXJnZURlc2NyaWJlci5nZXRTdW1tYXJ5UmVsYXRpdmVDaGFyZ2VEZXNjcmlwdGlvbigpO1xyXG4gICAgICBjb25zdCBncmVlbk5ldENoYXJnZSA9IHRoaXMuZ3JlZW5CYWxsb29uRGVzY3JpYmVyLmNoYXJnZURlc2NyaWJlci5nZXROZXRDaGFyZ2VEZXNjcmlwdGlvbldpdGhMYWJlbCgpO1xyXG5cclxuICAgICAgY29uc3QgeWVsbG93QmFsbG9vbkRlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzdW1tYXJ5QmFsbG9vbkNoYXJnZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBiYWxsb29uQ2hhcmdlOiB5ZWxsb3dOZXRDaGFyZ2UsXHJcbiAgICAgICAgc2hvd2luZ0NoYXJnZTogeWVsbG93UmVsYXRpdmVDaGFyZ2VcclxuICAgICAgfSApO1xyXG4gICAgICBjb25zdCBncmVlbkJhbGxvb25EZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc3VtbWFyeUJhbGxvb25DaGFyZ2VQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgYmFsbG9vbkNoYXJnZTogZ3JlZW5OZXRDaGFyZ2UsXHJcbiAgICAgICAgc2hvd2luZ0NoYXJnZTogZ3JlZW5SZWxhdGl2ZUNoYXJnZVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBkZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc3VtbWFyeUVhY2hCYWxsb29uQ2hhcmdlUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIHllbGxvd0JhbGxvb246IHllbGxvd0JhbGxvb25EZXNjcmlwdGlvbixcclxuICAgICAgICBncmVlbkJhbGxvb246IGdyZWVuQmFsbG9vbkRlc2NyaXB0aW9uXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVzY3JpcHRpb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGRlc2NyaXB0aW9uIGZvciBpbmR1Y2VkIGNoYXJnZSBvZiBhIGJhbGxvb24vYmFsbG9vbnMgb24gdGhlIHdhbGwuIFdpbGwgcmV0dXJuIHNvbWV0aGluZyBsaWtlXHJcbiAgICpcclxuICAgKiBcIk5lZ2F0aXZlIGNoYXJnZXMgaW4gd2FsbCBtb3ZlIGF3YXkgZnJvbSBZZWxsb3cgQmFsbG9vbiBhIGxvdC4gUG9zaXRpdmUgY2hhcmdlcyBkbyBub3QgbW92ZS5cIiBvclxyXG4gICAqIFwiTmVnYXRpdmUgY2hhcmdlcyBpbiB3YWxsIG1vdmUgYXdheSBmcm9tIGJhbGxvb25zIHF1aXRlIGEgbG90LiBQb3NpdGl2ZSBjaGFyZ2VzIGRvIG5vdCBtb3ZlLlwiIG9yXHJcbiAgICogXCJOZWdhdGl2ZSBjaGFyZ2VzIGluIHdhbGwgbW92ZSBhd2F5IGZyb20gR3JlZW4gQmFsbG9vbiBhIGxpdHRsZSBiaXQuIFBvc2l0aXZlIGNoYXJnZXMgZG8gbm90IG1vdmUuXCJcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldEluZHVjZWRDaGFyZ2VEZXNjcmlwdGlvbigpIHtcclxuICAgIGxldCBkZXNjcmlwdGlvbjtcclxuXHJcbiAgICBjb25zdCB5ZWxsb3dCYWxsb29uID0gdGhpcy55ZWxsb3dCYWxsb29uO1xyXG4gICAgY29uc3QgeWVsbG93QmFsbG9vbkRlc2NyaWJlciA9IHRoaXMueWVsbG93QmFsbG9vbkRlc2NyaWJlcjtcclxuICAgIGNvbnN0IHllbGxvd0JhbGxvb25MYWJlbCA9IHllbGxvd0JhbGxvb25EZXNjcmliZXIuYWNjZXNzaWJsZU5hbWU7XHJcblxyXG4gICAgY29uc3QgZ3JlZW5CYWxsb29uID0gdGhpcy5ncmVlbkJhbGxvb247XHJcbiAgICBjb25zdCBncmVlbkJhbGxvb25EZXNjcmliZXIgPSB0aGlzLmdyZWVuQmFsbG9vbkRlc2NyaWJlcjtcclxuICAgIGNvbnN0IGdyZWVuQmFsbG9vbkxhYmVsID0gZ3JlZW5CYWxsb29uRGVzY3JpYmVyLmFjY2Vzc2libGVOYW1lO1xyXG5cclxuICAgIGNvbnN0IGdyZWVuSW5kdWNpbmdDaGFyZ2VBbmRWaXNpbGJlID0gZ3JlZW5CYWxsb29uLmluZHVjaW5nQ2hhcmdlQW5kVmlzaWJsZSgpO1xyXG4gICAgY29uc3QgeWVsbG93SW5kdWNpbmdDaGFyZ2VBbmRWaXNpYmxlID0geWVsbG93QmFsbG9vbi5pbmR1Y2luZ0NoYXJnZUFuZFZpc2libGUoKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGdyZWVuSW5kdWNpbmdDaGFyZ2VBbmRWaXNpbGJlIHx8IHllbGxvd0luZHVjaW5nQ2hhcmdlQW5kVmlzaWJsZSApO1xyXG5cclxuICAgIGNvbnN0IHdhbGxWaXNpYmxlID0gdGhpcy5tb2RlbC53YWxsLmlzVmlzaWJsZVByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIGlmICggZ3JlZW5JbmR1Y2luZ0NoYXJnZUFuZFZpc2lsYmUgJiYgeWVsbG93SW5kdWNpbmdDaGFyZ2VBbmRWaXNpYmxlICkge1xyXG5cclxuICAgICAgaWYgKCB0aGlzLm1vZGVsLmJhbGxvb25zQWRqYWNlbnRQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICBkZXNjcmlwdGlvbiA9IFdhbGxEZXNjcmliZXIuZ2V0Q29tYmluZWRJbmR1Y2VkQ2hhcmdlRGVzY3JpcHRpb24oIHllbGxvd0JhbGxvb24sIHdhbGxWaXNpYmxlLCB7XHJcbiAgICAgICAgICBpbmNsdWRlV2FsbFBvc2l0aW9uOiBmYWxzZVxyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIHB1bmN0dWF0aW9uLCBhIHBlcmlvZCBhdCAgdGhlIGVuZCBvZiB0aGUgcGhyYXNlXHJcbiAgICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIHNpbmdsZVN0YXRlbWVudFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICAgIHN0YXRlbWVudDogZGVzY3JpcHRpb25cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIGZ1bGwgZGVzY3JpcHRpb24gZm9yIHllbGxvdyBiYWxsb29uXHJcbiAgICAgICAgY29uc3QgeWVsbG93QmFsbG9vbkRlc2NyaXB0aW9uID0gV2FsbERlc2NyaWJlci5nZXRJbmR1Y2VkQ2hhcmdlRGVzY3JpcHRpb24oIHllbGxvd0JhbGxvb24sIHllbGxvd0JhbGxvb25MYWJlbCwgd2FsbFZpc2libGUsIHtcclxuICAgICAgICAgIGluY2x1ZGVXYWxsUG9zaXRpb246IGZhbHNlLFxyXG4gICAgICAgICAgaW5jbHVkZVBvc2l0aXZlQ2hhcmdlSW5mbzogZmFsc2VcclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIC8vIHNob3J0IHN1bW1hcnkgZm9yIGdyZWVuIGJhbGxvb25cclxuICAgICAgICBjb25zdCBpbmR1Y2VkQ2hhcmdlQW1vdW50ID0gV2FsbERlc2NyaWJlci5nZXRJbmR1Y2VkQ2hhcmdlQW1vdW50RGVzY3JpcHRpb24oIGdyZWVuQmFsbG9vbiApO1xyXG4gICAgICAgIGNvbnN0IGdyZWVuQmFsbG9vbkRlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzdW1tYXJ5U2Vjb25kQmFsbG9vbkluZHVjaW5nQ2hhcmdlUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgICAgYW1vdW50OiBpbmR1Y2VkQ2hhcmdlQW1vdW50XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICBkZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc3VtbWFyeUJvdGhCYWxsb29uc1BhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICAgIHllbGxvd0JhbGxvb246IHllbGxvd0JhbGxvb25EZXNjcmlwdGlvbixcclxuICAgICAgICAgIGdyZWVuQmFsbG9vbjogZ3JlZW5CYWxsb29uRGVzY3JpcHRpb25cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBpZiAoIGdyZWVuSW5kdWNpbmdDaGFyZ2VBbmRWaXNpbGJlICkge1xyXG4gICAgICAgIGRlc2NyaXB0aW9uID0gV2FsbERlc2NyaWJlci5nZXRJbmR1Y2VkQ2hhcmdlRGVzY3JpcHRpb24oIGdyZWVuQmFsbG9vbiwgZ3JlZW5CYWxsb29uTGFiZWwsIHdhbGxWaXNpYmxlLCB7XHJcbiAgICAgICAgICBpbmNsdWRlV2FsbFBvc2l0aW9uOiBmYWxzZVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggeWVsbG93SW5kdWNpbmdDaGFyZ2VBbmRWaXNpYmxlICkge1xyXG4gICAgICAgIGRlc2NyaXB0aW9uID0gV2FsbERlc2NyaWJlci5nZXRJbmR1Y2VkQ2hhcmdlRGVzY3JpcHRpb24oIHllbGxvd0JhbGxvb24sIHllbGxvd0JhbGxvb25MYWJlbCwgd2FsbFZpc2libGUsIHtcclxuICAgICAgICAgIGluY2x1ZGVXYWxsUG9zaXRpb246IGZhbHNlXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBhZGQgbmVjZXNzYXJ5IHB1bmN0dWF0aW9uXHJcbiAgICAgIGRlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgc3RhdGVtZW50OiBkZXNjcmlwdGlvblxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRlc2NyaXB0aW9uO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGRlc2NyaXB0aW9uIG9mIHRoZSBvYmplY3RzIHRoYXQgYXJlIGN1cnJlbnRseSB2aXNpYmxlIGluIHRoZSBzaW0uXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSAge1Byb3BlcnR5Ljxib29sZWFuPn0gYmFsbG9vblZpc2libGVcclxuICAgKiBAcGFyYW0gIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHdhbGxWaXNpYmxlXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBzdGF0aWMgZ2V0VmlzaWJsZU9iamVjdHNEZXNjcmlwdGlvbiggYmFsbG9vblZpc2libGUsIHdhbGxWaXNpYmxlICkge1xyXG4gICAgbGV0IHBhdHRlcm5TdHJpbmc7XHJcbiAgICBpZiAoIHdhbGxWaXNpYmxlICkge1xyXG4gICAgICBwYXR0ZXJuU3RyaW5nID0gYmFsbG9vblZpc2libGUgPyBzdW1tYXJ5WWVsbG93R3JlZW5Td2VhdGVyV2FsbFBhdHRlcm5TdHJpbmcgOiBzdW1tYXJ5WWVsbG93U3dlYXRlcldhbGxQYXR0ZXJuU3RyaW5nO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHBhdHRlcm5TdHJpbmcgPSBiYWxsb29uVmlzaWJsZSA/IHN1bW1hcnlZZWxsb3dHcmVlblN3ZWF0ZXJQYXR0ZXJuU3RyaW5nIDogc3VtbWFyeVllbGxvd1N3ZWF0ZXJQYXR0ZXJuU3RyaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN3ZWF0ZXJTdHJpbmcgPSB3YWxsVmlzaWJsZSA/IGFTd2VhdGVyU3RyaW5nIDogYW5kQVN3ZWF0ZXJTdHJpbmc7XHJcbiAgICBjb25zdCBkZXNjcmlwdGlvblN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggcGF0dGVyblN0cmluZywge1xyXG4gICAgICB5ZWxsb3dCYWxsb29uOiBhWWVsbG93QmFsbG9vblN0cmluZyxcclxuICAgICAgZ3JlZW5CYWxsb29uOiBhR3JlZW5CYWxsb29uU3RyaW5nLFxyXG4gICAgICBzd2VhdGVyOiBzd2VhdGVyU3RyaW5nLFxyXG4gICAgICB3YWxsOiBhbmRBUmVtb3ZhYmxlV2FsbFN0cmluZ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHJvb21PYmplY3RzUGF0dGVyblN0cmluZywge1xyXG4gICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb25TdHJpbmdcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkucmVnaXN0ZXIoICdCQVNFU3VtbWFyeU5vZGUnLCBCQVNFU3VtbWFyeU5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJBU0VTdW1tYXJ5Tm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxXQUFXLE1BQU0sK0NBQStDO0FBQ3ZFLFNBQVNDLElBQUksUUFBUSxtQ0FBbUM7QUFDeEQsT0FBT0MsNEJBQTRCLE1BQU0sdUNBQXVDO0FBQ2hGLE9BQU9DLGVBQWUsTUFBTSx1QkFBdUI7QUFDbkQsT0FBT0MsYUFBYSxNQUFNLCtCQUErQjtBQUN6RCxPQUFPQyxnQkFBZ0IsTUFBTSxrQ0FBa0M7QUFDL0QsT0FBT0MsYUFBYSxNQUFNLCtCQUErQjtBQUV6RCxNQUFNQyx1QkFBdUIsR0FBR0osZUFBZSxDQUFDSyxpQkFBaUIsQ0FBQ0MsS0FBSztBQUN2RSxNQUFNQyx1QkFBdUIsR0FBR1AsZUFBZSxDQUFDUSxpQkFBaUIsQ0FBQ0YsS0FBSztBQUN2RSxNQUFNRyxjQUFjLEdBQUdULGVBQWUsQ0FBQ1UsUUFBUSxDQUFDSixLQUFLO0FBQ3JELE1BQU1LLGlCQUFpQixHQUFHWCxlQUFlLENBQUNZLFdBQVcsQ0FBQ04sS0FBSztBQUMzRCxNQUFNTyx3QkFBd0IsR0FBR2IsZUFBZSxDQUFDYyxrQkFBa0IsQ0FBQ1IsS0FBSztBQUN6RSxNQUFNUyxvQkFBb0IsR0FBR2YsZUFBZSxDQUFDZ0IsY0FBYyxDQUFDVixLQUFLO0FBQ2pFLE1BQU1XLG1CQUFtQixHQUFHakIsZUFBZSxDQUFDa0IsYUFBYSxDQUFDWixLQUFLO0FBQy9ELE1BQU1hLGlDQUFp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