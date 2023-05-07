// Copyright 2018-2022, University of Colorado Boulder

/**
 *
 * Handles the logic of mapping the position of a Node (via its bounds) to a specified region in the sim. This map is
 * divided into 9 evenly divided regions.
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawStrings from '../../FaradaysLawStrings.js';
import OrientationEnum from '../model/OrientationEnum.js';
import CoilTypeEnum from './CoilTypeEnum.js';

// strings
const topLeftString = FaradaysLawStrings.a11y.topLeft;
const topCenterString = FaradaysLawStrings.a11y.topCenter;
const topRightString = FaradaysLawStrings.a11y.topRight;
const middleLeftString = FaradaysLawStrings.a11y.middleLeft;
const centerString = FaradaysLawStrings.a11y.center;
const middleRightString = FaradaysLawStrings.a11y.middleRight;
const bottomLeftString = FaradaysLawStrings.a11y.bottomLeft;
const bottomCenterString = FaradaysLawStrings.a11y.bottomCenter;
const bottomRightString = FaradaysLawStrings.a11y.bottomRight;
const edgeString = FaradaysLawStrings.a11y.edge;
const twoWordsPatternString = FaradaysLawStrings.a11y.twoWordsPattern;
const barMagnetPositionPatternString = FaradaysLawStrings.a11y.barMagnetPositionPattern;
const positionOfPlayAreaPatternString = FaradaysLawStrings.a11y.positionOfPlayAreaPattern;
const barMagnetHelpTextString = FaradaysLawStrings.a11y.barMagnetHelpText;
const inString = FaradaysLawStrings.a11y.in;
const veryCloseToString = FaradaysLawStrings.a11y.veryCloseTo;
const closeToString = FaradaysLawStrings.a11y.closeTo;
const farFromString = FaradaysLawStrings.a11y.farFrom;
const touchingSideOfCoilPatternString = FaradaysLawStrings.a11y.touchingSideOfCoilPattern;
const magnetPositionProximityPatternString = FaradaysLawStrings.a11y.magnetPositionProximityPattern;

// magnet alert patterns
const slidingAndPositionFourCoilPatternString = FaradaysLawStrings.a11y.slidingAndPositionFourCoilPattern;
const slidingStoppedPositionPatternString = FaradaysLawStrings.a11y.slidingStoppedPositionPattern;
const fourCoilTwoCoilFieldLinesPatternString = FaradaysLawStrings.a11y.fourCoilTwoCoilFieldLinesPattern;
const twoCoilFieldLinesPatternString = FaradaysLawStrings.a11y.twoCoilFieldLinesPattern;
const slidingStoppedPositionFourCoilTwoCoilFieldLinesPatternString = FaradaysLawStrings.a11y.slidingStoppedPositionFourCoilTwoCoilFieldLinesPattern;
const poleOnThePatternString = FaradaysLawStrings.a11y.poleOnThePattern;
const northString = FaradaysLawStrings.a11y.north;
const southString = FaradaysLawStrings.a11y.south;
const leftString = FaradaysLawStrings.a11y.left;
const rightString = FaradaysLawStrings.a11y.right;
const minimalString = FaradaysLawStrings.a11y.minimal;
const veryWeakString = FaradaysLawStrings.a11y.veryWeak;
const weakString = FaradaysLawStrings.a11y.weak;
const strongString = FaradaysLawStrings.a11y.strong;
const veryStrongString = FaradaysLawStrings.a11y.veryStrong;
const fieldLinesDescriptionPatternString = FaradaysLawStrings.a11y.fieldLinesDescriptionPattern;
const fourLoopOnlyFieldStrengthPatternString = FaradaysLawStrings.a11y.fourLoopOnlyFieldStrengthPattern;
const fieldStrengthPatternString = FaradaysLawStrings.a11y.fieldStrengthPattern;
const fourLoopCoilString = FaradaysLawStrings.a11y.fourLoopCoil;
const twoLoopCoilString = FaradaysLawStrings.a11y.twoLoopCoil;
const theCoilPatternString = FaradaysLawStrings.a11y.theCoilPattern;
const theFourLoopCoilString = StringUtils.fillIn(theCoilPatternString, {
  coil: fourLoopCoilString
});
const theTwoLoopCoilString = StringUtils.fillIn(theCoilPatternString, {
  coil: twoLoopCoilString
});
const circuitNowHasPatternString = FaradaysLawStrings.a11y.circuitNowHasPattern;
const oneCoilString = FaradaysLawStrings.a11y.oneCoil;
const twoCoilsString = FaradaysLawStrings.a11y.twoCoils;
const magnetPositionAlertPatternString = FaradaysLawStrings.a11y.magnetPositionAlertPattern;
const magnetPositionExtraAlertPatternString = FaradaysLawStrings.a11y.magnetPositionExtraAlertPattern;
const slidingStoppedString = FaradaysLawStrings.a11y.slidingStopped;
const magnetSlidingAlertPatternString = FaradaysLawStrings.a11y.magnetSlidingAlertPattern;
const connectedString = FaradaysLawStrings.a11y.connected;
const removedString = FaradaysLawStrings.a11y.removed;
const voltmeterAlertPatternString = FaradaysLawStrings.a11y.voltmeterAlertPattern;
const fieldStrengthPassingCoilPatternString = FaradaysLawStrings.a11y.fieldStrengthPassingCoilPattern;
const fieldStrengthPassingBothCoilsPatternString = FaradaysLawStrings.a11y.fieldStrengthPassingBothCoilsPattern;
const fieldLinesVisibilityPatternString = FaradaysLawStrings.a11y.fieldLinesVisibilityPattern;
const hiddenString = FaradaysLawStrings.a11y.hidden;
const visibleString = FaradaysLawStrings.a11y.visible;
const fieldLinesDescriptionUpdatedString = FaradaysLawStrings.a11y.fieldLinesDescriptionUpdated;
const flippingMagnetPatternString = FaradaysLawStrings.a11y.flippingMagnetPattern;
const proximityToFourCoilPatternString = FaradaysLawStrings.a11y.proximityToFourCoilPattern;
const proximityToTwoCoilPatternString = FaradaysLawStrings.a11y.proximityToTwoCoilPattern;
const singleCoilDescriptionString = FaradaysLawStrings.a11y.singleCoilDescription;
const doubleCoilDescriptionString = FaradaysLawStrings.a11y.doubleCoilDescription;
const circuitFourCoilOnlyString = FaradaysLawStrings.a11y.circuitFourCoilOnly;
const circuitFourCoilAndVoltmeterString = FaradaysLawStrings.a11y.circuitFourCoilAndVoltmeter;
const circuitDescriptionPatternString = FaradaysLawStrings.a11y.circuitDescriptionPattern;

// constants
const REGION_DESCRIPTIONS = [topLeftString, topCenterString, topRightString, middleLeftString, centerString, middleRightString, bottomLeftString, bottomCenterString, bottomRightString];

// can create a linear function to map distances to integers 0 - 2
const PROXIMITY_STRINGS = [inString, veryCloseToString, closeToString, farFromString];
// const proximityMapFunction = new LinearFunction( 95, 260, 0, 2, true ); // determined empirically from sim testing

const FIELD_STRENGTHS = [minimalString, veryWeakString, weakString, strongString, veryStrongString];
const DIRECTIONS = {
  LEFT: leftString,
  RIGHT: rightString
};
class MagnetDescriber {
  constructor(model, regionManager) {
    // @private
    this._model = model;
    this._bounds = model.bounds;
    this._magnet = model.magnet;
    this._topCoil = model.topCoil;
    this._bottomCoil = model.bottomCoil;

    // @public
    this.regionManager = regionManager;
  }

  /**
   * @public
   * @returns {string}
   */
  magnetMovedAlertText() {
    let slidingAndPositionPhrase = null;
    let alertText = this.fourCoilProximityString;
    let twoCoilFieldLines = null;
    if (this.regionManager.magnetStoppedByKeyboard) {
      slidingAndPositionPhrase = slidingStoppedString;
    }
    if (!this.regionManager.magnetInOrVeryCloseToCoil) {
      if (slidingAndPositionPhrase) {
        // phrase exists, magnet stopped by keyboard
        const pattern = {
          slidingStopped: slidingStoppedString,
          magnetPosition: this.magnetPositionAlertText
        };
        slidingAndPositionPhrase = StringUtils.fillIn(slidingStoppedPositionPatternString, pattern);
      } else {
        slidingAndPositionPhrase = this.magnetPositionAlertText;
      }
    }
    if (this._model.topCoilVisibleProperty.get()) {
      // both coils visible
      twoCoilFieldLines = this.twoCoilProximityString;
    }
    if (this._magnet.fieldLinesVisibleProperty.get()) {
      if (twoCoilFieldLines) {
        const pattern = {
          twoCoil: twoCoilFieldLines,
          fieldLines: fieldLinesDescriptionUpdatedString
        };
        twoCoilFieldLines = StringUtils.fillIn(twoCoilFieldLinesPatternString, pattern);
      } else {
        twoCoilFieldLines = fieldLinesDescriptionUpdatedString;
      }
    }
    if (slidingAndPositionPhrase && twoCoilFieldLines) {
      alertText = StringUtils.fillIn(slidingStoppedPositionFourCoilTwoCoilFieldLinesPatternString, {
        slidingAndPositionPhrase: slidingAndPositionPhrase,
        twoCoilFieldLines: twoCoilFieldLines,
        fourCoil: this.fourCoilProximityString
      });
    } else if (slidingAndPositionPhrase) {
      alertText = StringUtils.fillIn(slidingAndPositionFourCoilPatternString, {
        slidingAndPositionPhrase: slidingAndPositionPhrase,
        fourCoil: this.fourCoilProximityString
      });
    } else if (twoCoilFieldLines) {
      alertText = StringUtils.fillIn(fourCoilTwoCoilFieldLinesPatternString, {
        fourCoil: this.fourCoilProximityString,
        twoCoilFieldLines: twoCoilFieldLines
      });
    }
    return alertText;
  }

  /**
   * @public
   * @param {OrientationEnum} orientation
   * @returns {string}
   */
  getFlipMagnetAlertText(orientation) {
    let northSide = leftString;
    let southSide = rightString;
    const alertPattern = flippingMagnetPatternString;
    if (orientation === OrientationEnum.SN) {
      northSide = rightString;
      southSide = leftString;
    }
    let alert = StringUtils.fillIn(alertPattern, {
      northSide: northSide,
      southSide: southSide
    });
    if (this._model.magnet.fieldLinesVisibleProperty.get()) {
      alert += ` ${fieldLinesDescriptionUpdatedString}`;
    }
    return alert;
  }

  /**
   * @public
   * @returns {string}
   */
  get strengthThroughFourCoilText() {
    const strength = FIELD_STRENGTHS[this.regionManager.getBottomCoilFieldStrengthRegion()];
    return StringUtils.fillIn(fieldStrengthPassingCoilPatternString, {
      strength: strength,
      coil: theFourLoopCoilString
    });
  }

  /**
   * @public
   * @returns {string}
   */
  get strengthThroughTwoCoilText() {
    const strength = FIELD_STRENGTHS[this.regionManager.getTopCoilFieldStrengthRegion()];
    return StringUtils.fillIn(fieldStrengthPassingCoilPatternString, {
      strength: strength,
      coil: theTwoLoopCoilString
    });
  }

  /**
   * @public
   * @returns {string}
   */
  get strengthThroughBothCoilsText() {
    const strength = FIELD_STRENGTHS[this.regionManager.getTopCoilFieldStrengthRegion()];
    return StringUtils.fillIn(fieldStrengthPassingBothCoilsPatternString, {
      strength: strength
    });
  }

  /**
   * @public
   * @returns {string}
   */
  get magnetPositionAlertText() {
    return StringUtils.fillIn(magnetPositionAlertPatternString, {
      position: this.positionString
    });
  }

  // get magnetFocusAlertText() {
  //   var position = this.positionString;
  //   var pattern = this.regionManager.showExtraMoveText ? magnetPositionAlertPatternString : magnetPositionExtraAlertPatternString;
  //   return StringUtils.fillIn( pattern, { position: position } );
  // }

  /**
   * @public
   * @returns {string}
   */
  get magnetFocusAlertText() {
    const pattern = this.regionManager.showExtraMoveText ? magnetPositionExtraAlertPatternString : magnetPositionAlertPatternString;
    return StringUtils.fillIn(pattern, {
      position: this.positionString
    });
  }

  /**
   * @public
   * @returns {string}
   */
  get fieldLinesDescription() {
    const northSide = this._magnet.orientationProperty.get() === OrientationEnum.NS ? leftString : rightString;
    const southSide = this._magnet.orientationProperty.get() === OrientationEnum.SN ? leftString : rightString;
    return StringUtils.fillIn(fieldLinesDescriptionPatternString, {
      northSide: northSide,
      southSide: southSide
    });
  }

  /**
   * @public
   * @returns {string}
   */
  get fourLoopOnlyFieldStrength() {
    const valueString = FIELD_STRENGTHS[this.regionManager.getFieldStrengthAtCoilRegion(this._bottomCoil)];
    return StringUtils.fillIn(fourLoopOnlyFieldStrengthPatternString, {
      fieldStrength: valueString
    });
  }

  /**
   * @public
   * @returns {string}
   */
  get fourLoopFieldStrength() {
    return this.getFieldStrengthAtCoil(this._bottomCoil);
  }

  /**
   * @public
   * @returns {string}
   */
  get twoLoopFieldStrength() {
    return this.getFieldStrengthAtCoil(this._topCoil);
  }

  /**
   * @public
   * @param {CoilTypeEnum} coil
   * @returns {string}
   */
  getFieldStrengthAtCoil(coil) {
    const fieldStrengthString = FIELD_STRENGTHS[this.regionManager.getFieldStrengthAtCoilRegion(coil)];
    const coilString = coil === this._topCoil ? theTwoLoopCoilString : theFourLoopCoilString;
    return StringUtils.fillIn(fieldStrengthPatternString, {
      fieldStrength: fieldStrengthString,
      coil: coilString
    });
  }

  /**
   * @public
   * @returns {string}
   */
  get fourCoilOnlyPolarityDescription() {
    const pattern = '{{first}}, {{second}}';
    return StringUtils.fillIn(pattern, {
      first: this.northPoleSideString,
      second: this.southPoleSideString
    });
  }

  /**
   * @public
   * @returns {string}
   */
  get northPoleSideString() {
    return this.getPoleSideString(northString, OrientationEnum.NS);
  }

  /**
   * @public
   * @returns {string}
   */
  get southPoleSideString() {
    return this.getPoleSideString(southString, OrientationEnum.SN);
  }

  /**
   * @public
   * @param {string} pole
   * @param {OrientationEnum} orientation
   * @returns {string}
   */
  getPoleSideString(pole, orientation) {
    const side = this._magnet.orientationProperty.get() === orientation ? leftString : rightString;
    return StringUtils.fillIn(poleOnThePatternString, {
      pole: pole,
      side: side
    });
  }

  /**
   * @public
   * @returns {string}
   */
  get fourLoopOnlyMagnetPosition() {
    const touchingCoil = this.regionManager.getTouchingCoil();
    const magnetPosition = StringUtils.fillIn(barMagnetPositionPatternString, {
      areaPosition: this.positionOfPlayAreaString
    });
    const coilProximity = this.fourCoilProximityString;
    if (this.regionManager.magnetInCoil) {
      return coilProximity;
    }
    if (touchingCoil >= 0 && !this.regionManager.magnetInCoil) {
      return StringUtils.fillIn(touchingSideOfCoilPatternString, touchingCoil);
    }
    return StringUtils.fillIn(magnetPositionProximityPatternString, {
      magnetPosition: magnetPosition,
      coilProximity: coilProximity
    });
  }

  /**
   * @public
   * @returns {string}
   */
  get positionOfPlayAreaString() {
    return StringUtils.fillIn(positionOfPlayAreaPatternString, {
      position: this.positionString
    });
  }

  /**
   * @public
   */
  get barMagnetHelpText() {
    return barMagnetHelpTextString;
  }

  // handles getting the current position description (e.g. top-left edge, bottom-center, center, etc...)
  get positionString() {
    let description = REGION_DESCRIPTIONS[this.regionManager.positionRegion];
    if (this.regionManager.magnetAtEdge) {
      description = StringUtils.fillIn(twoWordsPatternString, {
        first: description,
        second: edgeString
      });
    }
    return description;
  }

  /**
   * @public
   * @returns {string}
   */
  get fourCoilProximityString() {
    // if ( this.regionManager.magnetInCoil ) {
    //   return th
    // }
    const proximity = PROXIMITY_STRINGS[this.regionManager.magnetToBottomCoilProximity];
    return this.getCoilProximityString(proximity, CoilTypeEnum.FOUR_COIL);
  }

  /**
   * @public
   * @returns {string}
   */
  get twoCoilProximityString() {
    const proximity = PROXIMITY_STRINGS[this.regionManager.magnetToTopCoilProximity];
    return this.getCoilProximityString(proximity, CoilTypeEnum.TWO_COIL);
  }

  /**
   * @public
   * @param {string} proximity
   * @param {CoilTypeEnum} coil
   * @returns {string}
   */
  getCoilProximityString(proximity, coil) {
    const pattern = coil === CoilTypeEnum.FOUR_COIL ? proximityToFourCoilPatternString : proximityToTwoCoilPatternString;
    const {
      adjacentCoil,
      magnetInCoil
    } = this.regionManager;
    let coilDirection = '.';
    if (adjacentCoil === coil && !magnetInCoil) {
      coilDirection = this.regionManager.magnetScreenSide === 'left' ? ' to the right.' : ' to the left.';
    }
    return StringUtils.fillIn(pattern, {
      proximity: proximity ? proximity : ''
    }) + coilDirection;
  }

  /**
   * @public
   * @param {number} speedValue
   * @param {string} directionValue
   * @returns {string}
   */
  static getMagnetSlidingAlertText(speedValue, directionValue) {
    const direction = DIRECTIONS[directionValue];
    return StringUtils.fillIn(magnetSlidingAlertPatternString, {
      direction: direction
    });
  }

  /**
   * @public
   * @param {boolean} showLines
   * @returns {string}
   */
  static getFieldLinesVisibilityAlertText(showLines) {
    const visibility = showLines ? visibleString : hiddenString;
    let alert = StringUtils.fillIn(fieldLinesVisibilityPatternString, {
      visibility: visibility
    });
    if (showLines) {
      alert += ` ${fieldLinesDescriptionUpdatedString}`;
    }
    return alert;
  }

  /*******************************************
   * CIRCUIT DESCRIPTION AND ALERT FUNCTIONS *
   *******************************************/

  /**
   * @public
   * @param {boolean} showVoltmeter
   * @returns {string}
   */
  static getVoltmeterAttachmentAlertText(showVoltmeter) {
    const attachmentState = showVoltmeter ? connectedString : removedString;
    return StringUtils.fillIn(voltmeterAlertPatternString, {
      attachmentState: attachmentState
    });
  }

  /**
   * @public
   * @param {boolean} showTopCoil
   * @returns {string}
   */
  static getCoilConnectionAlertText(showTopCoil) {
    const coil = showTopCoil ? twoCoilsString : oneCoilString;
    return StringUtils.fillIn(circuitNowHasPatternString, {
      coil: coil
    });
  }

  /**
   * @public
   * @param {boolean} showTopCoil
   * @returns {string}
   */
  static getCoilDescription(showTopCoil) {
    return showTopCoil ? doubleCoilDescriptionString : singleCoilDescriptionString;
  }

  /**
   * @public
   * @param {boolean} showVoltmeter
   * @returns {string}
   */
  static getFourCoilOnlyDescription(showVoltmeter) {
    const circuitContents = showVoltmeter ? circuitFourCoilAndVoltmeterString : circuitFourCoilOnlyString;
    const coilDescription = singleCoilDescriptionString;
    return StringUtils.fillIn(circuitDescriptionPatternString, {
      circuitContents: circuitContents,
      coilDescription: coilDescription
    });
  }
}
faradaysLaw.register('MagnetDescriber', MagnetDescriber);
export default MagnetDescriber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdVdGlscyIsImZhcmFkYXlzTGF3IiwiRmFyYWRheXNMYXdTdHJpbmdzIiwiT3JpZW50YXRpb25FbnVtIiwiQ29pbFR5cGVFbnVtIiwidG9wTGVmdFN0cmluZyIsImExMXkiLCJ0b3BMZWZ0IiwidG9wQ2VudGVyU3RyaW5nIiwidG9wQ2VudGVyIiwidG9wUmlnaHRTdHJpbmciLCJ0b3BSaWdodCIsIm1pZGRsZUxlZnRTdHJpbmciLCJtaWRkbGVMZWZ0IiwiY2VudGVyU3RyaW5nIiwiY2VudGVyIiwibWlkZGxlUmlnaHRTdHJpbmciLCJtaWRkbGVSaWdodCIsImJvdHRvbUxlZnRTdHJpbmciLCJib3R0b21MZWZ0IiwiYm90dG9tQ2VudGVyU3RyaW5nIiwiYm90dG9tQ2VudGVyIiwiYm90dG9tUmlnaHRTdHJpbmciLCJib3R0b21SaWdodCIsImVkZ2VTdHJpbmciLCJlZGdlIiwidHdvV29yZHNQYXR0ZXJuU3RyaW5nIiwidHdvV29yZHNQYXR0ZXJuIiwiYmFyTWFnbmV0UG9zaXRpb25QYXR0ZXJuU3RyaW5nIiwiYmFyTWFnbmV0UG9zaXRpb25QYXR0ZXJuIiwicG9zaXRpb25PZlBsYXlBcmVhUGF0dGVyblN0cmluZyIsInBvc2l0aW9uT2ZQbGF5QXJlYVBhdHRlcm4iLCJiYXJNYWduZXRIZWxwVGV4dFN0cmluZyIsImJhck1hZ25ldEhlbHBUZXh0IiwiaW5TdHJpbmciLCJpbiIsInZlcnlDbG9zZVRvU3RyaW5nIiwidmVyeUNsb3NlVG8iLCJjbG9zZVRvU3RyaW5nIiwiY2xvc2VUbyIsImZhckZyb21TdHJpbmciLCJmYXJGcm9tIiwidG91Y2hpbmdTaWRlT2ZDb2lsUGF0dGVyblN0cmluZyIsInRvdWNoaW5nU2lkZU9mQ29pbFBhdHRlcm4iLCJtYWduZXRQb3NpdGlvblByb3hpbWl0eVBhdHRlcm5TdHJpbmciLCJtYWduZXRQb3NpdGlvblByb3hpbWl0eVBhdHRlcm4iLCJzbGlkaW5nQW5kUG9zaXRpb25Gb3VyQ29pbFBhdHRlcm5TdHJpbmciLCJzbGlkaW5nQW5kUG9zaXRpb25Gb3VyQ29pbFBhdHRlcm4iLCJzbGlkaW5nU3RvcHBlZFBvc2l0aW9uUGF0dGVyblN0cmluZyIsInNsaWRpbmdTdG9wcGVkUG9zaXRpb25QYXR0ZXJuIiwiZm91ckNvaWxUd29Db2lsRmllbGRMaW5lc1BhdHRlcm5TdHJpbmciLCJmb3VyQ29pbFR3b0NvaWxGaWVsZExpbmVzUGF0dGVybiIsInR3b0NvaWxGaWVsZExpbmVzUGF0dGVyblN0cmluZyIsInR3b0NvaWxGaWVsZExpbmVzUGF0dGVybiIsInNsaWRpbmdTdG9wcGVkUG9zaXRpb25Gb3VyQ29pbFR3b0NvaWxGaWVsZExpbmVzUGF0dGVyblN0cmluZyIsInNsaWRpbmdTdG9wcGVkUG9zaXRpb25Gb3VyQ29pbFR3b0NvaWxGaWVsZExpbmVzUGF0dGVybiIsInBvbGVPblRoZVBhdHRlcm5TdHJpbmciLCJwb2xlT25UaGVQYXR0ZXJuIiwibm9ydGhTdHJpbmciLCJub3J0aCIsInNvdXRoU3RyaW5nIiwic291dGgiLCJsZWZ0U3RyaW5nIiwibGVmdCIsInJpZ2h0U3RyaW5nIiwicmlnaHQiLCJtaW5pbWFsU3RyaW5nIiwibWluaW1hbCIsInZlcnlXZWFrU3RyaW5nIiwidmVyeVdlYWsiLCJ3ZWFrU3RyaW5nIiwid2VhayIsInN0cm9uZ1N0cmluZyIsInN0cm9uZyIsInZlcnlTdHJvbmdTdHJpbmciLCJ2ZXJ5U3Ryb25nIiwiZmllbGRMaW5lc0Rlc2NyaXB0aW9uUGF0dGVyblN0cmluZyIsImZpZWxkTGluZXNEZXNjcmlwdGlvblBhdHRlcm4iLCJmb3VyTG9vcE9ubHlGaWVsZFN0cmVuZ3RoUGF0dGVyblN0cmluZyIsImZvdXJMb29wT25seUZpZWxkU3RyZW5ndGhQYXR0ZXJuIiwiZmllbGRTdHJlbmd0aFBhdHRlcm5TdHJpbmciLCJmaWVsZFN0cmVuZ3RoUGF0dGVybiIsImZvdXJMb29wQ29pbFN0cmluZyIsImZvdXJMb29wQ29pbCIsInR3b0xvb3BDb2lsU3RyaW5nIiwidHdvTG9vcENvaWwiLCJ0aGVDb2lsUGF0dGVyblN0cmluZyIsInRoZUNvaWxQYXR0ZXJuIiwidGhlRm91ckxvb3BDb2lsU3RyaW5nIiwiZmlsbEluIiwiY29pbCIsInRoZVR3b0xvb3BDb2lsU3RyaW5nIiwiY2lyY3VpdE5vd0hhc1BhdHRlcm5TdHJpbmciLCJjaXJjdWl0Tm93SGFzUGF0dGVybiIsIm9uZUNvaWxTdHJpbmciLCJvbmVDb2lsIiwidHdvQ29pbHNTdHJpbmciLCJ0d29Db2lscyIsIm1hZ25ldFBvc2l0aW9uQWxlcnRQYXR0ZXJuU3RyaW5nIiwibWFnbmV0UG9zaXRpb25BbGVydFBhdHRlcm4iLCJtYWduZXRQb3NpdGlvbkV4dHJhQWxlcnRQYXR0ZXJuU3RyaW5nIiwibWFnbmV0UG9zaXRpb25FeHRyYUFsZXJ0UGF0dGVybiIsInNsaWRpbmdTdG9wcGVkU3RyaW5nIiwic2xpZGluZ1N0b3BwZWQiLCJtYWduZXRTbGlkaW5nQWxlcnRQYXR0ZXJuU3RyaW5nIiwibWFnbmV0U2xpZGluZ0FsZXJ0UGF0dGVybiIsImNvbm5lY3RlZFN0cmluZyIsImNvbm5lY3RlZCIsInJlbW92ZWRTdHJpbmciLCJyZW1vdmVkIiwidm9sdG1ldGVyQWxlcnRQYXR0ZXJuU3RyaW5nIiwidm9sdG1ldGVyQWxlcnRQYXR0ZXJuIiwiZmllbGRTdHJlbmd0aFBhc3NpbmdDb2lsUGF0dGVyblN0cmluZyIsImZpZWxkU3RyZW5ndGhQYXNzaW5nQ29pbFBhdHRlcm4iLCJmaWVsZFN0cmVuZ3RoUGFzc2luZ0JvdGhDb2lsc1BhdHRlcm5TdHJpbmciLCJmaWVsZFN0cmVuZ3RoUGFzc2luZ0JvdGhDb2lsc1BhdHRlcm4iLCJmaWVsZExpbmVzVmlzaWJpbGl0eVBhdHRlcm5TdHJpbmciLCJmaWVsZExpbmVzVmlzaWJpbGl0eVBhdHRlcm4iLCJoaWRkZW5TdHJpbmciLCJoaWRkZW4iLCJ2aXNpYmxlU3RyaW5nIiwidmlzaWJsZSIsImZpZWxkTGluZXNEZXNjcmlwdGlvblVwZGF0ZWRTdHJpbmciLCJmaWVsZExpbmVzRGVzY3JpcHRpb25VcGRhdGVkIiwiZmxpcHBpbmdNYWduZXRQYXR0ZXJuU3RyaW5nIiwiZmxpcHBpbmdNYWduZXRQYXR0ZXJuIiwicHJveGltaXR5VG9Gb3VyQ29pbFBhdHRlcm5TdHJpbmciLCJwcm94aW1pdHlUb0ZvdXJDb2lsUGF0dGVybiIsInByb3hpbWl0eVRvVHdvQ29pbFBhdHRlcm5TdHJpbmciLCJwcm94aW1pdHlUb1R3b0NvaWxQYXR0ZXJuIiwic2luZ2xlQ29pbERlc2NyaXB0aW9uU3RyaW5nIiwic2luZ2xlQ29pbERlc2NyaXB0aW9uIiwiZG91YmxlQ29pbERlc2NyaXB0aW9uU3RyaW5nIiwiZG91YmxlQ29pbERlc2NyaXB0aW9uIiwiY2lyY3VpdEZvdXJDb2lsT25seVN0cmluZyIsImNpcmN1aXRGb3VyQ29pbE9ubHkiLCJjaXJjdWl0Rm91ckNvaWxBbmRWb2x0bWV0ZXJTdHJpbmciLCJjaXJjdWl0Rm91ckNvaWxBbmRWb2x0bWV0ZXIiLCJjaXJjdWl0RGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nIiwiY2lyY3VpdERlc2NyaXB0aW9uUGF0dGVybiIsIlJFR0lPTl9ERVNDUklQVElPTlMiLCJQUk9YSU1JVFlfU1RSSU5HUyIsIkZJRUxEX1NUUkVOR1RIUyIsIkRJUkVDVElPTlMiLCJMRUZUIiwiUklHSFQiLCJNYWduZXREZXNjcmliZXIiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwicmVnaW9uTWFuYWdlciIsIl9tb2RlbCIsIl9ib3VuZHMiLCJib3VuZHMiLCJfbWFnbmV0IiwibWFnbmV0IiwiX3RvcENvaWwiLCJ0b3BDb2lsIiwiX2JvdHRvbUNvaWwiLCJib3R0b21Db2lsIiwibWFnbmV0TW92ZWRBbGVydFRleHQiLCJzbGlkaW5nQW5kUG9zaXRpb25QaHJhc2UiLCJhbGVydFRleHQiLCJmb3VyQ29pbFByb3hpbWl0eVN0cmluZyIsInR3b0NvaWxGaWVsZExpbmVzIiwibWFnbmV0U3RvcHBlZEJ5S2V5Ym9hcmQiLCJtYWduZXRJbk9yVmVyeUNsb3NlVG9Db2lsIiwicGF0dGVybiIsIm1hZ25ldFBvc2l0aW9uIiwibWFnbmV0UG9zaXRpb25BbGVydFRleHQiLCJ0b3BDb2lsVmlzaWJsZVByb3BlcnR5IiwiZ2V0IiwidHdvQ29pbFByb3hpbWl0eVN0cmluZyIsImZpZWxkTGluZXNWaXNpYmxlUHJvcGVydHkiLCJ0d29Db2lsIiwiZmllbGRMaW5lcyIsImZvdXJDb2lsIiwiZ2V0RmxpcE1hZ25ldEFsZXJ0VGV4dCIsIm9yaWVudGF0aW9uIiwibm9ydGhTaWRlIiwic291dGhTaWRlIiwiYWxlcnRQYXR0ZXJuIiwiU04iLCJhbGVydCIsInN0cmVuZ3RoVGhyb3VnaEZvdXJDb2lsVGV4dCIsInN0cmVuZ3RoIiwiZ2V0Qm90dG9tQ29pbEZpZWxkU3RyZW5ndGhSZWdpb24iLCJzdHJlbmd0aFRocm91Z2hUd29Db2lsVGV4dCIsImdldFRvcENvaWxGaWVsZFN0cmVuZ3RoUmVnaW9uIiwic3RyZW5ndGhUaHJvdWdoQm90aENvaWxzVGV4dCIsInBvc2l0aW9uIiwicG9zaXRpb25TdHJpbmciLCJtYWduZXRGb2N1c0FsZXJ0VGV4dCIsInNob3dFeHRyYU1vdmVUZXh0IiwiZmllbGRMaW5lc0Rlc2NyaXB0aW9uIiwib3JpZW50YXRpb25Qcm9wZXJ0eSIsIk5TIiwiZm91ckxvb3BPbmx5RmllbGRTdHJlbmd0aCIsInZhbHVlU3RyaW5nIiwiZ2V0RmllbGRTdHJlbmd0aEF0Q29pbFJlZ2lvbiIsImZpZWxkU3RyZW5ndGgiLCJmb3VyTG9vcEZpZWxkU3RyZW5ndGgiLCJnZXRGaWVsZFN0cmVuZ3RoQXRDb2lsIiwidHdvTG9vcEZpZWxkU3RyZW5ndGgiLCJmaWVsZFN0cmVuZ3RoU3RyaW5nIiwiY29pbFN0cmluZyIsImZvdXJDb2lsT25seVBvbGFyaXR5RGVzY3JpcHRpb24iLCJmaXJzdCIsIm5vcnRoUG9sZVNpZGVTdHJpbmciLCJzZWNvbmQiLCJzb3V0aFBvbGVTaWRlU3RyaW5nIiwiZ2V0UG9sZVNpZGVTdHJpbmciLCJwb2xlIiwic2lkZSIsImZvdXJMb29wT25seU1hZ25ldFBvc2l0aW9uIiwidG91Y2hpbmdDb2lsIiwiZ2V0VG91Y2hpbmdDb2lsIiwiYXJlYVBvc2l0aW9uIiwicG9zaXRpb25PZlBsYXlBcmVhU3RyaW5nIiwiY29pbFByb3hpbWl0eSIsIm1hZ25ldEluQ29pbCIsImRlc2NyaXB0aW9uIiwicG9zaXRpb25SZWdpb24iLCJtYWduZXRBdEVkZ2UiLCJwcm94aW1pdHkiLCJtYWduZXRUb0JvdHRvbUNvaWxQcm94aW1pdHkiLCJnZXRDb2lsUHJveGltaXR5U3RyaW5nIiwiRk9VUl9DT0lMIiwibWFnbmV0VG9Ub3BDb2lsUHJveGltaXR5IiwiVFdPX0NPSUwiLCJhZGphY2VudENvaWwiLCJjb2lsRGlyZWN0aW9uIiwibWFnbmV0U2NyZWVuU2lkZSIsImdldE1hZ25ldFNsaWRpbmdBbGVydFRleHQiLCJzcGVlZFZhbHVlIiwiZGlyZWN0aW9uVmFsdWUiLCJkaXJlY3Rpb24iLCJnZXRGaWVsZExpbmVzVmlzaWJpbGl0eUFsZXJ0VGV4dCIsInNob3dMaW5lcyIsInZpc2liaWxpdHkiLCJnZXRWb2x0bWV0ZXJBdHRhY2htZW50QWxlcnRUZXh0Iiwic2hvd1ZvbHRtZXRlciIsImF0dGFjaG1lbnRTdGF0ZSIsImdldENvaWxDb25uZWN0aW9uQWxlcnRUZXh0Iiwic2hvd1RvcENvaWwiLCJnZXRDb2lsRGVzY3JpcHRpb24iLCJnZXRGb3VyQ29pbE9ubHlEZXNjcmlwdGlvbiIsImNpcmN1aXRDb250ZW50cyIsImNvaWxEZXNjcmlwdGlvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTWFnbmV0RGVzY3JpYmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqXHJcbiAqIEhhbmRsZXMgdGhlIGxvZ2ljIG9mIG1hcHBpbmcgdGhlIHBvc2l0aW9uIG9mIGEgTm9kZSAodmlhIGl0cyBib3VuZHMpIHRvIGEgc3BlY2lmaWVkIHJlZ2lvbiBpbiB0aGUgc2ltLiBUaGlzIG1hcCBpc1xyXG4gKiBkaXZpZGVkIGludG8gOSBldmVubHkgZGl2aWRlZCByZWdpb25zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgQmFybG93IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgZmFyYWRheXNMYXcgZnJvbSAnLi4vLi4vZmFyYWRheXNMYXcuanMnO1xyXG5pbXBvcnQgRmFyYWRheXNMYXdTdHJpbmdzIGZyb20gJy4uLy4uL0ZhcmFkYXlzTGF3U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBPcmllbnRhdGlvbkVudW0gZnJvbSAnLi4vbW9kZWwvT3JpZW50YXRpb25FbnVtLmpzJztcclxuaW1wb3J0IENvaWxUeXBlRW51bSBmcm9tICcuL0NvaWxUeXBlRW51bS5qcyc7XHJcblxyXG4vLyBzdHJpbmdzXHJcbmNvbnN0IHRvcExlZnRTdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS50b3BMZWZ0O1xyXG5jb25zdCB0b3BDZW50ZXJTdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS50b3BDZW50ZXI7XHJcbmNvbnN0IHRvcFJpZ2h0U3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkudG9wUmlnaHQ7XHJcbmNvbnN0IG1pZGRsZUxlZnRTdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5taWRkbGVMZWZ0O1xyXG5jb25zdCBjZW50ZXJTdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5jZW50ZXI7XHJcbmNvbnN0IG1pZGRsZVJpZ2h0U3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkubWlkZGxlUmlnaHQ7XHJcbmNvbnN0IGJvdHRvbUxlZnRTdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5ib3R0b21MZWZ0O1xyXG5jb25zdCBib3R0b21DZW50ZXJTdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5ib3R0b21DZW50ZXI7XHJcbmNvbnN0IGJvdHRvbVJpZ2h0U3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkuYm90dG9tUmlnaHQ7XHJcbmNvbnN0IGVkZ2VTdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5lZGdlO1xyXG5jb25zdCB0d29Xb3Jkc1BhdHRlcm5TdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS50d29Xb3Jkc1BhdHRlcm47XHJcblxyXG5jb25zdCBiYXJNYWduZXRQb3NpdGlvblBhdHRlcm5TdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5iYXJNYWduZXRQb3NpdGlvblBhdHRlcm47XHJcbmNvbnN0IHBvc2l0aW9uT2ZQbGF5QXJlYVBhdHRlcm5TdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5wb3NpdGlvbk9mUGxheUFyZWFQYXR0ZXJuO1xyXG5jb25zdCBiYXJNYWduZXRIZWxwVGV4dFN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LmJhck1hZ25ldEhlbHBUZXh0O1xyXG5jb25zdCBpblN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LmluO1xyXG5jb25zdCB2ZXJ5Q2xvc2VUb1N0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LnZlcnlDbG9zZVRvO1xyXG5jb25zdCBjbG9zZVRvU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkuY2xvc2VUbztcclxuY29uc3QgZmFyRnJvbVN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LmZhckZyb207XHJcbmNvbnN0IHRvdWNoaW5nU2lkZU9mQ29pbFBhdHRlcm5TdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS50b3VjaGluZ1NpZGVPZkNvaWxQYXR0ZXJuO1xyXG5jb25zdCBtYWduZXRQb3NpdGlvblByb3hpbWl0eVBhdHRlcm5TdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5tYWduZXRQb3NpdGlvblByb3hpbWl0eVBhdHRlcm47XHJcblxyXG4vLyBtYWduZXQgYWxlcnQgcGF0dGVybnNcclxuY29uc3Qgc2xpZGluZ0FuZFBvc2l0aW9uRm91ckNvaWxQYXR0ZXJuU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkuc2xpZGluZ0FuZFBvc2l0aW9uRm91ckNvaWxQYXR0ZXJuO1xyXG5jb25zdCBzbGlkaW5nU3RvcHBlZFBvc2l0aW9uUGF0dGVyblN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LnNsaWRpbmdTdG9wcGVkUG9zaXRpb25QYXR0ZXJuO1xyXG5jb25zdCBmb3VyQ29pbFR3b0NvaWxGaWVsZExpbmVzUGF0dGVyblN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LmZvdXJDb2lsVHdvQ29pbEZpZWxkTGluZXNQYXR0ZXJuO1xyXG5jb25zdCB0d29Db2lsRmllbGRMaW5lc1BhdHRlcm5TdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS50d29Db2lsRmllbGRMaW5lc1BhdHRlcm47XHJcbmNvbnN0IHNsaWRpbmdTdG9wcGVkUG9zaXRpb25Gb3VyQ29pbFR3b0NvaWxGaWVsZExpbmVzUGF0dGVyblN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LnNsaWRpbmdTdG9wcGVkUG9zaXRpb25Gb3VyQ29pbFR3b0NvaWxGaWVsZExpbmVzUGF0dGVybjtcclxuXHJcbmNvbnN0IHBvbGVPblRoZVBhdHRlcm5TdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5wb2xlT25UaGVQYXR0ZXJuO1xyXG5jb25zdCBub3J0aFN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5Lm5vcnRoO1xyXG5jb25zdCBzb3V0aFN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LnNvdXRoO1xyXG5cclxuY29uc3QgbGVmdFN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LmxlZnQ7XHJcbmNvbnN0IHJpZ2h0U3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkucmlnaHQ7XHJcblxyXG5jb25zdCBtaW5pbWFsU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkubWluaW1hbDtcclxuY29uc3QgdmVyeVdlYWtTdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS52ZXJ5V2VhaztcclxuY29uc3Qgd2Vha1N0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LndlYWs7XHJcbmNvbnN0IHN0cm9uZ1N0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LnN0cm9uZztcclxuY29uc3QgdmVyeVN0cm9uZ1N0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LnZlcnlTdHJvbmc7XHJcblxyXG5jb25zdCBmaWVsZExpbmVzRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkuZmllbGRMaW5lc0Rlc2NyaXB0aW9uUGF0dGVybjtcclxuY29uc3QgZm91ckxvb3BPbmx5RmllbGRTdHJlbmd0aFBhdHRlcm5TdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5mb3VyTG9vcE9ubHlGaWVsZFN0cmVuZ3RoUGF0dGVybjtcclxuY29uc3QgZmllbGRTdHJlbmd0aFBhdHRlcm5TdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5maWVsZFN0cmVuZ3RoUGF0dGVybjtcclxuXHJcbmNvbnN0IGZvdXJMb29wQ29pbFN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LmZvdXJMb29wQ29pbDtcclxuY29uc3QgdHdvTG9vcENvaWxTdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS50d29Mb29wQ29pbDtcclxuY29uc3QgdGhlQ29pbFBhdHRlcm5TdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS50aGVDb2lsUGF0dGVybjtcclxuY29uc3QgdGhlRm91ckxvb3BDb2lsU3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCB0aGVDb2lsUGF0dGVyblN0cmluZywgeyBjb2lsOiBmb3VyTG9vcENvaWxTdHJpbmcgfSApO1xyXG5jb25zdCB0aGVUd29Mb29wQ29pbFN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggdGhlQ29pbFBhdHRlcm5TdHJpbmcsIHsgY29pbDogdHdvTG9vcENvaWxTdHJpbmcgfSApO1xyXG5jb25zdCBjaXJjdWl0Tm93SGFzUGF0dGVyblN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LmNpcmN1aXROb3dIYXNQYXR0ZXJuO1xyXG5jb25zdCBvbmVDb2lsU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkub25lQ29pbDtcclxuY29uc3QgdHdvQ29pbHNTdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS50d29Db2lscztcclxuXHJcbmNvbnN0IG1hZ25ldFBvc2l0aW9uQWxlcnRQYXR0ZXJuU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkubWFnbmV0UG9zaXRpb25BbGVydFBhdHRlcm47XHJcbmNvbnN0IG1hZ25ldFBvc2l0aW9uRXh0cmFBbGVydFBhdHRlcm5TdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5tYWduZXRQb3NpdGlvbkV4dHJhQWxlcnRQYXR0ZXJuO1xyXG5cclxuY29uc3Qgc2xpZGluZ1N0b3BwZWRTdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5zbGlkaW5nU3RvcHBlZDtcclxuY29uc3QgbWFnbmV0U2xpZGluZ0FsZXJ0UGF0dGVyblN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5Lm1hZ25ldFNsaWRpbmdBbGVydFBhdHRlcm47XHJcblxyXG5jb25zdCBjb25uZWN0ZWRTdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5jb25uZWN0ZWQ7XHJcbmNvbnN0IHJlbW92ZWRTdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5yZW1vdmVkO1xyXG5jb25zdCB2b2x0bWV0ZXJBbGVydFBhdHRlcm5TdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS52b2x0bWV0ZXJBbGVydFBhdHRlcm47XHJcbmNvbnN0IGZpZWxkU3RyZW5ndGhQYXNzaW5nQ29pbFBhdHRlcm5TdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5maWVsZFN0cmVuZ3RoUGFzc2luZ0NvaWxQYXR0ZXJuO1xyXG5jb25zdCBmaWVsZFN0cmVuZ3RoUGFzc2luZ0JvdGhDb2lsc1BhdHRlcm5TdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5maWVsZFN0cmVuZ3RoUGFzc2luZ0JvdGhDb2lsc1BhdHRlcm47XHJcbmNvbnN0IGZpZWxkTGluZXNWaXNpYmlsaXR5UGF0dGVyblN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LmZpZWxkTGluZXNWaXNpYmlsaXR5UGF0dGVybjtcclxuY29uc3QgaGlkZGVuU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkuaGlkZGVuO1xyXG5jb25zdCB2aXNpYmxlU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkudmlzaWJsZTtcclxuY29uc3QgZmllbGRMaW5lc0Rlc2NyaXB0aW9uVXBkYXRlZFN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LmZpZWxkTGluZXNEZXNjcmlwdGlvblVwZGF0ZWQ7XHJcblxyXG5jb25zdCBmbGlwcGluZ01hZ25ldFBhdHRlcm5TdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5mbGlwcGluZ01hZ25ldFBhdHRlcm47XHJcblxyXG5jb25zdCBwcm94aW1pdHlUb0ZvdXJDb2lsUGF0dGVyblN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LnByb3hpbWl0eVRvRm91ckNvaWxQYXR0ZXJuO1xyXG5jb25zdCBwcm94aW1pdHlUb1R3b0NvaWxQYXR0ZXJuU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkucHJveGltaXR5VG9Ud29Db2lsUGF0dGVybjtcclxuXHJcbmNvbnN0IHNpbmdsZUNvaWxEZXNjcmlwdGlvblN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LnNpbmdsZUNvaWxEZXNjcmlwdGlvbjtcclxuY29uc3QgZG91YmxlQ29pbERlc2NyaXB0aW9uU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkuZG91YmxlQ29pbERlc2NyaXB0aW9uO1xyXG5jb25zdCBjaXJjdWl0Rm91ckNvaWxPbmx5U3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkuY2lyY3VpdEZvdXJDb2lsT25seTtcclxuY29uc3QgY2lyY3VpdEZvdXJDb2lsQW5kVm9sdG1ldGVyU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkuY2lyY3VpdEZvdXJDb2lsQW5kVm9sdG1ldGVyO1xyXG5jb25zdCBjaXJjdWl0RGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkuY2lyY3VpdERlc2NyaXB0aW9uUGF0dGVybjtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBSRUdJT05fREVTQ1JJUFRJT05TID0gWyB0b3BMZWZ0U3RyaW5nLCB0b3BDZW50ZXJTdHJpbmcsIHRvcFJpZ2h0U3RyaW5nLFxyXG4gIG1pZGRsZUxlZnRTdHJpbmcsIGNlbnRlclN0cmluZywgbWlkZGxlUmlnaHRTdHJpbmcsXHJcbiAgYm90dG9tTGVmdFN0cmluZywgYm90dG9tQ2VudGVyU3RyaW5nLCBib3R0b21SaWdodFN0cmluZyBdO1xyXG5cclxuLy8gY2FuIGNyZWF0ZSBhIGxpbmVhciBmdW5jdGlvbiB0byBtYXAgZGlzdGFuY2VzIHRvIGludGVnZXJzIDAgLSAyXHJcbmNvbnN0IFBST1hJTUlUWV9TVFJJTkdTID0gWyBpblN0cmluZywgdmVyeUNsb3NlVG9TdHJpbmcsIGNsb3NlVG9TdHJpbmcsIGZhckZyb21TdHJpbmcgXTtcclxuLy8gY29uc3QgcHJveGltaXR5TWFwRnVuY3Rpb24gPSBuZXcgTGluZWFyRnVuY3Rpb24oIDk1LCAyNjAsIDAsIDIsIHRydWUgKTsgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseSBmcm9tIHNpbSB0ZXN0aW5nXHJcblxyXG5jb25zdCBGSUVMRF9TVFJFTkdUSFMgPSBbIG1pbmltYWxTdHJpbmcsIHZlcnlXZWFrU3RyaW5nLCB3ZWFrU3RyaW5nLCBzdHJvbmdTdHJpbmcsIHZlcnlTdHJvbmdTdHJpbmcgXTtcclxuY29uc3QgRElSRUNUSU9OUyA9IHsgTEVGVDogbGVmdFN0cmluZywgUklHSFQ6IHJpZ2h0U3RyaW5nIH07XHJcblxyXG5jbGFzcyBNYWduZXREZXNjcmliZXIge1xyXG5cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHJlZ2lvbk1hbmFnZXIgKSB7XHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5fbW9kZWwgPSBtb2RlbDtcclxuICAgIHRoaXMuX2JvdW5kcyA9IG1vZGVsLmJvdW5kcztcclxuICAgIHRoaXMuX21hZ25ldCA9IG1vZGVsLm1hZ25ldDtcclxuICAgIHRoaXMuX3RvcENvaWwgPSBtb2RlbC50b3BDb2lsO1xyXG4gICAgdGhpcy5fYm90dG9tQ29pbCA9IG1vZGVsLmJvdHRvbUNvaWw7XHJcblxyXG4gICAgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5yZWdpb25NYW5hZ2VyID0gcmVnaW9uTWFuYWdlcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIG1hZ25ldE1vdmVkQWxlcnRUZXh0KCkge1xyXG4gICAgbGV0IHNsaWRpbmdBbmRQb3NpdGlvblBocmFzZSA9IG51bGw7XHJcbiAgICBsZXQgYWxlcnRUZXh0ID0gdGhpcy5mb3VyQ29pbFByb3hpbWl0eVN0cmluZztcclxuICAgIGxldCB0d29Db2lsRmllbGRMaW5lcyA9IG51bGw7XHJcblxyXG4gICAgaWYgKCB0aGlzLnJlZ2lvbk1hbmFnZXIubWFnbmV0U3RvcHBlZEJ5S2V5Ym9hcmQgKSB7XHJcbiAgICAgIHNsaWRpbmdBbmRQb3NpdGlvblBocmFzZSA9IHNsaWRpbmdTdG9wcGVkU3RyaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggIXRoaXMucmVnaW9uTWFuYWdlci5tYWduZXRJbk9yVmVyeUNsb3NlVG9Db2lsICkge1xyXG4gICAgICBpZiAoIHNsaWRpbmdBbmRQb3NpdGlvblBocmFzZSApIHtcclxuICAgICAgICAvLyBwaHJhc2UgZXhpc3RzLCBtYWduZXQgc3RvcHBlZCBieSBrZXlib2FyZFxyXG4gICAgICAgIGNvbnN0IHBhdHRlcm4gPSB7XHJcbiAgICAgICAgICBzbGlkaW5nU3RvcHBlZDogc2xpZGluZ1N0b3BwZWRTdHJpbmcsXHJcbiAgICAgICAgICBtYWduZXRQb3NpdGlvbjogdGhpcy5tYWduZXRQb3NpdGlvbkFsZXJ0VGV4dFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgc2xpZGluZ0FuZFBvc2l0aW9uUGhyYXNlID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzbGlkaW5nU3RvcHBlZFBvc2l0aW9uUGF0dGVyblN0cmluZywgcGF0dGVybiApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHNsaWRpbmdBbmRQb3NpdGlvblBocmFzZSA9IHRoaXMubWFnbmV0UG9zaXRpb25BbGVydFRleHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMuX21vZGVsLnRvcENvaWxWaXNpYmxlUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIC8vIGJvdGggY29pbHMgdmlzaWJsZVxyXG4gICAgICB0d29Db2lsRmllbGRMaW5lcyA9IHRoaXMudHdvQ29pbFByb3hpbWl0eVN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMuX21hZ25ldC5maWVsZExpbmVzVmlzaWJsZVByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICBpZiAoIHR3b0NvaWxGaWVsZExpbmVzICkge1xyXG4gICAgICAgIGNvbnN0IHBhdHRlcm4gPSB7XHJcbiAgICAgICAgICB0d29Db2lsOiB0d29Db2lsRmllbGRMaW5lcyxcclxuICAgICAgICAgIGZpZWxkTGluZXM6IGZpZWxkTGluZXNEZXNjcmlwdGlvblVwZGF0ZWRTdHJpbmdcclxuICAgICAgICB9O1xyXG4gICAgICAgIHR3b0NvaWxGaWVsZExpbmVzID0gU3RyaW5nVXRpbHMuZmlsbEluKCB0d29Db2lsRmllbGRMaW5lc1BhdHRlcm5TdHJpbmcsIHBhdHRlcm4gKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0d29Db2lsRmllbGRMaW5lcyA9IGZpZWxkTGluZXNEZXNjcmlwdGlvblVwZGF0ZWRTdHJpbmc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHNsaWRpbmdBbmRQb3NpdGlvblBocmFzZSAmJiB0d29Db2lsRmllbGRMaW5lcyApIHtcclxuICAgICAgYWxlcnRUZXh0ID0gU3RyaW5nVXRpbHMuZmlsbEluKFxyXG4gICAgICAgIHNsaWRpbmdTdG9wcGVkUG9zaXRpb25Gb3VyQ29pbFR3b0NvaWxGaWVsZExpbmVzUGF0dGVyblN0cmluZyxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzbGlkaW5nQW5kUG9zaXRpb25QaHJhc2U6IHNsaWRpbmdBbmRQb3NpdGlvblBocmFzZSxcclxuICAgICAgICAgIHR3b0NvaWxGaWVsZExpbmVzOiB0d29Db2lsRmllbGRMaW5lcyxcclxuICAgICAgICAgIGZvdXJDb2lsOiB0aGlzLmZvdXJDb2lsUHJveGltaXR5U3RyaW5nXHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHNsaWRpbmdBbmRQb3NpdGlvblBocmFzZSApIHtcclxuICAgICAgYWxlcnRUZXh0ID0gU3RyaW5nVXRpbHMuZmlsbEluKFxyXG4gICAgICAgIHNsaWRpbmdBbmRQb3NpdGlvbkZvdXJDb2lsUGF0dGVyblN0cmluZyxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzbGlkaW5nQW5kUG9zaXRpb25QaHJhc2U6IHNsaWRpbmdBbmRQb3NpdGlvblBocmFzZSxcclxuICAgICAgICAgIGZvdXJDb2lsOiB0aGlzLmZvdXJDb2lsUHJveGltaXR5U3RyaW5nXHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHR3b0NvaWxGaWVsZExpbmVzICkge1xyXG4gICAgICBhbGVydFRleHQgPSBTdHJpbmdVdGlscy5maWxsSW4oXHJcbiAgICAgICAgZm91ckNvaWxUd29Db2lsRmllbGRMaW5lc1BhdHRlcm5TdHJpbmcsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZm91ckNvaWw6IHRoaXMuZm91ckNvaWxQcm94aW1pdHlTdHJpbmcsXHJcbiAgICAgICAgICB0d29Db2lsRmllbGRMaW5lczogdHdvQ29pbEZpZWxkTGluZXNcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFsZXJ0VGV4dDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge09yaWVudGF0aW9uRW51bX0gb3JpZW50YXRpb25cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldEZsaXBNYWduZXRBbGVydFRleHQoIG9yaWVudGF0aW9uICkge1xyXG4gICAgbGV0IG5vcnRoU2lkZSA9IGxlZnRTdHJpbmc7XHJcbiAgICBsZXQgc291dGhTaWRlID0gcmlnaHRTdHJpbmc7XHJcbiAgICBjb25zdCBhbGVydFBhdHRlcm4gPSBmbGlwcGluZ01hZ25ldFBhdHRlcm5TdHJpbmc7XHJcblxyXG4gICAgaWYgKCBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb25FbnVtLlNOICkge1xyXG4gICAgICBub3J0aFNpZGUgPSByaWdodFN0cmluZztcclxuICAgICAgc291dGhTaWRlID0gbGVmdFN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBsZXQgYWxlcnQgPSBTdHJpbmdVdGlscy5maWxsSW4oIGFsZXJ0UGF0dGVybiwgeyBub3J0aFNpZGU6IG5vcnRoU2lkZSwgc291dGhTaWRlOiBzb3V0aFNpZGUgfSApO1xyXG5cclxuICAgIGlmICggdGhpcy5fbW9kZWwubWFnbmV0LmZpZWxkTGluZXNWaXNpYmxlUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIGFsZXJ0ICs9IGAgJHtmaWVsZExpbmVzRGVzY3JpcHRpb25VcGRhdGVkU3RyaW5nfWA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFsZXJ0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0IHN0cmVuZ3RoVGhyb3VnaEZvdXJDb2lsVGV4dCgpIHtcclxuICAgIGNvbnN0IHN0cmVuZ3RoID0gRklFTERfU1RSRU5HVEhTWyB0aGlzLnJlZ2lvbk1hbmFnZXIuZ2V0Qm90dG9tQ29pbEZpZWxkU3RyZW5ndGhSZWdpb24oKSBdO1xyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggZmllbGRTdHJlbmd0aFBhc3NpbmdDb2lsUGF0dGVyblN0cmluZywge1xyXG4gICAgICBzdHJlbmd0aDogc3RyZW5ndGgsXHJcbiAgICAgIGNvaWw6IHRoZUZvdXJMb29wQ29pbFN0cmluZ1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0IHN0cmVuZ3RoVGhyb3VnaFR3b0NvaWxUZXh0KCkge1xyXG4gICAgY29uc3Qgc3RyZW5ndGggPSBGSUVMRF9TVFJFTkdUSFNbIHRoaXMucmVnaW9uTWFuYWdlci5nZXRUb3BDb2lsRmllbGRTdHJlbmd0aFJlZ2lvbigpIF07XHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBmaWVsZFN0cmVuZ3RoUGFzc2luZ0NvaWxQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIHN0cmVuZ3RoOiBzdHJlbmd0aCxcclxuICAgICAgY29pbDogdGhlVHdvTG9vcENvaWxTdHJpbmdcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldCBzdHJlbmd0aFRocm91Z2hCb3RoQ29pbHNUZXh0KCkge1xyXG4gICAgY29uc3Qgc3RyZW5ndGggPSBGSUVMRF9TVFJFTkdUSFNbIHRoaXMucmVnaW9uTWFuYWdlci5nZXRUb3BDb2lsRmllbGRTdHJlbmd0aFJlZ2lvbigpIF07XHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBmaWVsZFN0cmVuZ3RoUGFzc2luZ0JvdGhDb2lsc1BhdHRlcm5TdHJpbmcsIHsgc3RyZW5ndGg6IHN0cmVuZ3RoIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldCBtYWduZXRQb3NpdGlvbkFsZXJ0VGV4dCgpIHtcclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIG1hZ25ldFBvc2l0aW9uQWxlcnRQYXR0ZXJuU3RyaW5nLCB7IHBvc2l0aW9uOiB0aGlzLnBvc2l0aW9uU3RyaW5nIH0gKTtcclxuICB9XHJcblxyXG4gIC8vIGdldCBtYWduZXRGb2N1c0FsZXJ0VGV4dCgpIHtcclxuICAvLyAgIHZhciBwb3NpdGlvbiA9IHRoaXMucG9zaXRpb25TdHJpbmc7XHJcbiAgLy8gICB2YXIgcGF0dGVybiA9IHRoaXMucmVnaW9uTWFuYWdlci5zaG93RXh0cmFNb3ZlVGV4dCA/IG1hZ25ldFBvc2l0aW9uQWxlcnRQYXR0ZXJuU3RyaW5nIDogbWFnbmV0UG9zaXRpb25FeHRyYUFsZXJ0UGF0dGVyblN0cmluZztcclxuICAvLyAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHBhdHRlcm4sIHsgcG9zaXRpb246IHBvc2l0aW9uIH0gKTtcclxuICAvLyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldCBtYWduZXRGb2N1c0FsZXJ0VGV4dCgpIHtcclxuICAgIGNvbnN0IHBhdHRlcm4gPSB0aGlzLnJlZ2lvbk1hbmFnZXIuc2hvd0V4dHJhTW92ZVRleHQgPyBtYWduZXRQb3NpdGlvbkV4dHJhQWxlcnRQYXR0ZXJuU3RyaW5nIDogbWFnbmV0UG9zaXRpb25BbGVydFBhdHRlcm5TdHJpbmc7XHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBwYXR0ZXJuLCB7IHBvc2l0aW9uOiB0aGlzLnBvc2l0aW9uU3RyaW5nIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldCBmaWVsZExpbmVzRGVzY3JpcHRpb24oKSB7XHJcbiAgICBjb25zdCBub3J0aFNpZGUgPSB0aGlzLl9tYWduZXQub3JpZW50YXRpb25Qcm9wZXJ0eS5nZXQoKSA9PT0gT3JpZW50YXRpb25FbnVtLk5TID8gbGVmdFN0cmluZyA6IHJpZ2h0U3RyaW5nO1xyXG4gICAgY29uc3Qgc291dGhTaWRlID0gdGhpcy5fbWFnbmV0Lm9yaWVudGF0aW9uUHJvcGVydHkuZ2V0KCkgPT09IE9yaWVudGF0aW9uRW51bS5TTiA/IGxlZnRTdHJpbmcgOiByaWdodFN0cmluZztcclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIGZpZWxkTGluZXNEZXNjcmlwdGlvblBhdHRlcm5TdHJpbmcsIHsgbm9ydGhTaWRlOiBub3J0aFNpZGUsIHNvdXRoU2lkZTogc291dGhTaWRlIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldCBmb3VyTG9vcE9ubHlGaWVsZFN0cmVuZ3RoKCkge1xyXG4gICAgY29uc3QgdmFsdWVTdHJpbmcgPSBGSUVMRF9TVFJFTkdUSFNbIHRoaXMucmVnaW9uTWFuYWdlci5nZXRGaWVsZFN0cmVuZ3RoQXRDb2lsUmVnaW9uKCB0aGlzLl9ib3R0b21Db2lsICkgXTtcclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIGZvdXJMb29wT25seUZpZWxkU3RyZW5ndGhQYXR0ZXJuU3RyaW5nLCB7IGZpZWxkU3RyZW5ndGg6IHZhbHVlU3RyaW5nIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldCBmb3VyTG9vcEZpZWxkU3RyZW5ndGgoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRGaWVsZFN0cmVuZ3RoQXRDb2lsKCB0aGlzLl9ib3R0b21Db2lsICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXQgdHdvTG9vcEZpZWxkU3RyZW5ndGgoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRGaWVsZFN0cmVuZ3RoQXRDb2lsKCB0aGlzLl90b3BDb2lsICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtDb2lsVHlwZUVudW19IGNvaWxcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldEZpZWxkU3RyZW5ndGhBdENvaWwoIGNvaWwgKSB7XHJcbiAgICBjb25zdCBmaWVsZFN0cmVuZ3RoU3RyaW5nID0gRklFTERfU1RSRU5HVEhTWyB0aGlzLnJlZ2lvbk1hbmFnZXIuZ2V0RmllbGRTdHJlbmd0aEF0Q29pbFJlZ2lvbiggY29pbCApIF07XHJcbiAgICBjb25zdCBjb2lsU3RyaW5nID0gY29pbCA9PT0gdGhpcy5fdG9wQ29pbCA/IHRoZVR3b0xvb3BDb2lsU3RyaW5nIDogdGhlRm91ckxvb3BDb2lsU3RyaW5nO1xyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbihcclxuICAgICAgZmllbGRTdHJlbmd0aFBhdHRlcm5TdHJpbmcsXHJcbiAgICAgIHtcclxuICAgICAgICBmaWVsZFN0cmVuZ3RoOiBmaWVsZFN0cmVuZ3RoU3RyaW5nLFxyXG4gICAgICAgIGNvaWw6IGNvaWxTdHJpbmdcclxuICAgICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0IGZvdXJDb2lsT25seVBvbGFyaXR5RGVzY3JpcHRpb24oKSB7XHJcbiAgICBjb25zdCBwYXR0ZXJuID0gJ3t7Zmlyc3R9fSwge3tzZWNvbmR9fSc7XHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBwYXR0ZXJuLCB7IGZpcnN0OiB0aGlzLm5vcnRoUG9sZVNpZGVTdHJpbmcsIHNlY29uZDogdGhpcy5zb3V0aFBvbGVTaWRlU3RyaW5nIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldCBub3J0aFBvbGVTaWRlU3RyaW5nKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0UG9sZVNpZGVTdHJpbmcoIG5vcnRoU3RyaW5nLCBPcmllbnRhdGlvbkVudW0uTlMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldCBzb3V0aFBvbGVTaWRlU3RyaW5nKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0UG9sZVNpZGVTdHJpbmcoIHNvdXRoU3RyaW5nLCBPcmllbnRhdGlvbkVudW0uU04gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcG9sZVxyXG4gICAqIEBwYXJhbSB7T3JpZW50YXRpb25FbnVtfSBvcmllbnRhdGlvblxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0UG9sZVNpZGVTdHJpbmcoIHBvbGUsIG9yaWVudGF0aW9uICkge1xyXG4gICAgY29uc3Qgc2lkZSA9IHRoaXMuX21hZ25ldC5vcmllbnRhdGlvblByb3BlcnR5LmdldCgpID09PSBvcmllbnRhdGlvbiA/IGxlZnRTdHJpbmcgOiByaWdodFN0cmluZztcclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHBvbGVPblRoZVBhdHRlcm5TdHJpbmcsIHsgcG9sZTogcG9sZSwgc2lkZTogc2lkZSB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXQgZm91ckxvb3BPbmx5TWFnbmV0UG9zaXRpb24oKSB7XHJcbiAgICBjb25zdCB0b3VjaGluZ0NvaWwgPSB0aGlzLnJlZ2lvbk1hbmFnZXIuZ2V0VG91Y2hpbmdDb2lsKCk7XHJcbiAgICBjb25zdCBtYWduZXRQb3NpdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggYmFyTWFnbmV0UG9zaXRpb25QYXR0ZXJuU3RyaW5nLCB7IGFyZWFQb3NpdGlvbjogdGhpcy5wb3NpdGlvbk9mUGxheUFyZWFTdHJpbmcgfSApO1xyXG4gICAgY29uc3QgY29pbFByb3hpbWl0eSA9IHRoaXMuZm91ckNvaWxQcm94aW1pdHlTdHJpbmc7XHJcblxyXG4gICAgaWYgKCB0aGlzLnJlZ2lvbk1hbmFnZXIubWFnbmV0SW5Db2lsICkge1xyXG4gICAgICByZXR1cm4gY29pbFByb3hpbWl0eTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRvdWNoaW5nQ29pbCA+PSAwICYmICF0aGlzLnJlZ2lvbk1hbmFnZXIubWFnbmV0SW5Db2lsICkge1xyXG4gICAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCB0b3VjaGluZ1NpZGVPZkNvaWxQYXR0ZXJuU3RyaW5nLCB0b3VjaGluZ0NvaWwgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIG1hZ25ldFBvc2l0aW9uUHJveGltaXR5UGF0dGVyblN0cmluZywge1xyXG4gICAgICBtYWduZXRQb3NpdGlvbjogbWFnbmV0UG9zaXRpb24sXHJcbiAgICAgIGNvaWxQcm94aW1pdHk6IGNvaWxQcm94aW1pdHlcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldCBwb3NpdGlvbk9mUGxheUFyZWFTdHJpbmcoKSB7XHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBwb3NpdGlvbk9mUGxheUFyZWFQYXR0ZXJuU3RyaW5nLCB7IHBvc2l0aW9uOiB0aGlzLnBvc2l0aW9uU3RyaW5nIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXQgYmFyTWFnbmV0SGVscFRleHQoKSB7XHJcbiAgICByZXR1cm4gYmFyTWFnbmV0SGVscFRleHRTdHJpbmc7XHJcbiAgfVxyXG5cclxuICAvLyBoYW5kbGVzIGdldHRpbmcgdGhlIGN1cnJlbnQgcG9zaXRpb24gZGVzY3JpcHRpb24gKGUuZy4gdG9wLWxlZnQgZWRnZSwgYm90dG9tLWNlbnRlciwgY2VudGVyLCBldGMuLi4pXHJcbiAgZ2V0IHBvc2l0aW9uU3RyaW5nKCkge1xyXG4gICAgbGV0IGRlc2NyaXB0aW9uID0gUkVHSU9OX0RFU0NSSVBUSU9OU1sgdGhpcy5yZWdpb25NYW5hZ2VyLnBvc2l0aW9uUmVnaW9uIF07XHJcbiAgICBpZiAoIHRoaXMucmVnaW9uTWFuYWdlci5tYWduZXRBdEVkZ2UgKSB7XHJcbiAgICAgIGRlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCB0d29Xb3Jkc1BhdHRlcm5TdHJpbmcsIHsgZmlyc3Q6IGRlc2NyaXB0aW9uLCBzZWNvbmQ6IGVkZ2VTdHJpbmcgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZXNjcmlwdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldCBmb3VyQ29pbFByb3hpbWl0eVN0cmluZygpIHtcclxuXHJcbiAgICAvLyBpZiAoIHRoaXMucmVnaW9uTWFuYWdlci5tYWduZXRJbkNvaWwgKSB7XHJcbiAgICAvLyAgIHJldHVybiB0aFxyXG4gICAgLy8gfVxyXG4gICAgY29uc3QgcHJveGltaXR5ID0gUFJPWElNSVRZX1NUUklOR1NbIHRoaXMucmVnaW9uTWFuYWdlci5tYWduZXRUb0JvdHRvbUNvaWxQcm94aW1pdHkgXTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5nZXRDb2lsUHJveGltaXR5U3RyaW5nKCBwcm94aW1pdHksIENvaWxUeXBlRW51bS5GT1VSX0NPSUwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldCB0d29Db2lsUHJveGltaXR5U3RyaW5nKCkge1xyXG4gICAgY29uc3QgcHJveGltaXR5ID0gUFJPWElNSVRZX1NUUklOR1NbIHRoaXMucmVnaW9uTWFuYWdlci5tYWduZXRUb1RvcENvaWxQcm94aW1pdHkgXTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5nZXRDb2lsUHJveGltaXR5U3RyaW5nKCBwcm94aW1pdHksIENvaWxUeXBlRW51bS5UV09fQ09JTCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcm94aW1pdHlcclxuICAgKiBAcGFyYW0ge0NvaWxUeXBlRW51bX0gY29pbFxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0Q29pbFByb3hpbWl0eVN0cmluZyggcHJveGltaXR5LCBjb2lsICkge1xyXG4gICAgY29uc3QgcGF0dGVybiA9IGNvaWwgPT09IENvaWxUeXBlRW51bS5GT1VSX0NPSUwgPyBwcm94aW1pdHlUb0ZvdXJDb2lsUGF0dGVyblN0cmluZyA6IHByb3hpbWl0eVRvVHdvQ29pbFBhdHRlcm5TdHJpbmc7XHJcbiAgICBjb25zdCB7IGFkamFjZW50Q29pbCwgbWFnbmV0SW5Db2lsIH0gPSB0aGlzLnJlZ2lvbk1hbmFnZXI7XHJcbiAgICBsZXQgY29pbERpcmVjdGlvbiA9ICcuJztcclxuICAgIGlmICggYWRqYWNlbnRDb2lsID09PSBjb2lsICYmICFtYWduZXRJbkNvaWwgKSB7XHJcbiAgICAgIGNvaWxEaXJlY3Rpb24gPSB0aGlzLnJlZ2lvbk1hbmFnZXIubWFnbmV0U2NyZWVuU2lkZSA9PT0gJ2xlZnQnID8gJyB0byB0aGUgcmlnaHQuJyA6ICcgdG8gdGhlIGxlZnQuJztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBwYXR0ZXJuLCB7IHByb3hpbWl0eTogcHJveGltaXR5ID8gcHJveGltaXR5IDogJycgfSApICsgY29pbERpcmVjdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc3BlZWRWYWx1ZVxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3Rpb25WYWx1ZVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldE1hZ25ldFNsaWRpbmdBbGVydFRleHQoIHNwZWVkVmFsdWUsIGRpcmVjdGlvblZhbHVlICkge1xyXG4gICAgY29uc3QgZGlyZWN0aW9uID0gRElSRUNUSU9OU1sgZGlyZWN0aW9uVmFsdWUgXTtcclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIG1hZ25ldFNsaWRpbmdBbGVydFBhdHRlcm5TdHJpbmcsIHsgZGlyZWN0aW9uOiBkaXJlY3Rpb24gfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2hvd0xpbmVzXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBzdGF0aWMgZ2V0RmllbGRMaW5lc1Zpc2liaWxpdHlBbGVydFRleHQoIHNob3dMaW5lcyApIHtcclxuICAgIGNvbnN0IHZpc2liaWxpdHkgPSBzaG93TGluZXMgPyB2aXNpYmxlU3RyaW5nIDogaGlkZGVuU3RyaW5nO1xyXG4gICAgbGV0IGFsZXJ0ID0gU3RyaW5nVXRpbHMuZmlsbEluKCBmaWVsZExpbmVzVmlzaWJpbGl0eVBhdHRlcm5TdHJpbmcsIHsgdmlzaWJpbGl0eTogdmlzaWJpbGl0eSB9ICk7XHJcblxyXG4gICAgaWYgKCBzaG93TGluZXMgKSB7XHJcbiAgICAgIGFsZXJ0ICs9IGAgJHtmaWVsZExpbmVzRGVzY3JpcHRpb25VcGRhdGVkU3RyaW5nfWA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFsZXJ0O1xyXG4gIH1cclxuXHJcbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgKiBDSVJDVUlUIERFU0NSSVBUSU9OIEFORCBBTEVSVCBGVU5DVElPTlMgKlxyXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBzaG93Vm9sdG1ldGVyXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBzdGF0aWMgZ2V0Vm9sdG1ldGVyQXR0YWNobWVudEFsZXJ0VGV4dCggc2hvd1ZvbHRtZXRlciApIHtcclxuICAgIGNvbnN0IGF0dGFjaG1lbnRTdGF0ZSA9IHNob3dWb2x0bWV0ZXIgPyBjb25uZWN0ZWRTdHJpbmcgOiByZW1vdmVkU3RyaW5nO1xyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggdm9sdG1ldGVyQWxlcnRQYXR0ZXJuU3RyaW5nLCB7IGF0dGFjaG1lbnRTdGF0ZTogYXR0YWNobWVudFN0YXRlIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNob3dUb3BDb2lsXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBzdGF0aWMgZ2V0Q29pbENvbm5lY3Rpb25BbGVydFRleHQoIHNob3dUb3BDb2lsICkge1xyXG4gICAgY29uc3QgY29pbCA9IHNob3dUb3BDb2lsID8gdHdvQ29pbHNTdHJpbmcgOiBvbmVDb2lsU3RyaW5nO1xyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggY2lyY3VpdE5vd0hhc1BhdHRlcm5TdHJpbmcsIHsgY29pbDogY29pbCB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBzaG93VG9wQ29pbFxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldENvaWxEZXNjcmlwdGlvbiggc2hvd1RvcENvaWwgKSB7XHJcbiAgICByZXR1cm4gc2hvd1RvcENvaWwgPyBkb3VibGVDb2lsRGVzY3JpcHRpb25TdHJpbmcgOiBzaW5nbGVDb2lsRGVzY3JpcHRpb25TdHJpbmc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBzaG93Vm9sdG1ldGVyXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBzdGF0aWMgZ2V0Rm91ckNvaWxPbmx5RGVzY3JpcHRpb24oIHNob3dWb2x0bWV0ZXIgKSB7XHJcbiAgICBjb25zdCBjaXJjdWl0Q29udGVudHMgPSBzaG93Vm9sdG1ldGVyID8gY2lyY3VpdEZvdXJDb2lsQW5kVm9sdG1ldGVyU3RyaW5nIDogY2lyY3VpdEZvdXJDb2lsT25seVN0cmluZztcclxuICAgIGNvbnN0IGNvaWxEZXNjcmlwdGlvbiA9IHNpbmdsZUNvaWxEZXNjcmlwdGlvblN0cmluZztcclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIGNpcmN1aXREZXNjcmlwdGlvblBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgY2lyY3VpdENvbnRlbnRzOiBjaXJjdWl0Q29udGVudHMsXHJcbiAgICAgIGNvaWxEZXNjcmlwdGlvbjogY29pbERlc2NyaXB0aW9uXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5mYXJhZGF5c0xhdy5yZWdpc3RlciggJ01hZ25ldERlc2NyaWJlcicsIE1hZ25ldERlc2NyaWJlciApO1xyXG5leHBvcnQgZGVmYXVsdCBNYWduZXREZXNjcmliZXI7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyxlQUFlLE1BQU0sNkJBQTZCO0FBQ3pELE9BQU9DLFlBQVksTUFBTSxtQkFBbUI7O0FBRTVDO0FBQ0EsTUFBTUMsYUFBYSxHQUFHSCxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDQyxPQUFPO0FBQ3JELE1BQU1DLGVBQWUsR0FBR04sa0JBQWtCLENBQUNJLElBQUksQ0FBQ0csU0FBUztBQUN6RCxNQUFNQyxjQUFjLEdBQUdSLGtCQUFrQixDQUFDSSxJQUFJLENBQUNLLFFBQVE7QUFDdkQsTUFBTUMsZ0JBQWdCLEdBQUdWLGtCQUFrQixDQUFDSSxJQUFJLENBQUNPLFVBQVU7QUFDM0QsTUFBTUMsWUFBWSxHQUFHWixrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDUyxNQUFNO0FBQ25ELE1BQU1DLGlCQUFpQixHQUFHZCxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDVyxXQUFXO0FBQzdELE1BQU1DLGdCQUFnQixHQUFHaEIsa0JBQWtCLENBQUNJLElBQUksQ0FBQ2EsVUFBVTtBQUMzRCxNQUFNQyxrQkFBa0IsR0FBR2xCLGtCQUFrQixDQUFDSSxJQUFJLENBQUNlLFlBQVk7QUFDL0QsTUFBTUMsaUJBQWlCLEdBQUdwQixrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDaUIsV0FBVztBQUM3RCxNQUFNQyxVQUFVLEdBQUd0QixrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDbUIsSUFBSTtBQUMvQyxNQUFNQyxxQkFBcUIsR0FBR3hCLGtCQUFrQixDQUFDSSxJQUFJLENBQUNxQixlQUFlO0FBRXJFLE1BQU1DLDhCQUE4QixHQUFHMUIsa0JBQWtCLENBQUNJLElBQUksQ0FBQ3VCLHdCQUF3QjtBQUN2RixNQUFNQywrQkFBK0IsR0FBRzVCLGtCQUFrQixDQUFDSSxJQUFJLENBQUN5Qix5QkFBeUI7QUFDekYsTUFBTUMsdUJBQXVCLEdBQUc5QixrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDMkIsaUJBQWlCO0FBQ3pFLE1BQU1DLFFBQVEsR0FBR2hDLGtCQUFrQixDQUFDSSxJQUFJLENBQUM2QixFQUFFO0FBQzNDLE1BQU1DLGlCQUFpQixHQUFHbEMsa0JBQWtCLENBQUNJLElBQUksQ0FBQytCLFdBQVc7QUFDN0QsTUFBTUMsYUFBYSxHQUFHcEMsa0JBQWtCLENBQUNJLElBQUksQ0FBQ2lDLE9BQU87QUFDckQsTUFBTUMsYUFBYSxHQUFHdEMsa0JBQWtCLENBQUNJLElBQUksQ0FBQ21DLE9BQU87QUFDckQsTUFBTUMsK0JBQStCLEdBQUd4QyxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDcUMseUJBQXlCO0FBQ3pGLE1BQU1DLG9DQUFvQyxHQUFHMUMsa0JBQWtCLENBQUNJLElBQUksQ0FBQ3VDLDhCQUE4Qjs7QUFFbkc7QUFDQSxNQUFNQyx1Q0FBdUMsR0FBRzVDLGtCQUFrQixDQUFDSSxJQUFJLENBQUN5QyxpQ0FBaUM7QUFDekcsTUFBTUMsbUNBQW1DLEdBQUc5QyxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDMkMsNkJBQTZCO0FBQ2pHLE1BQU1DLHNDQUFzQyxHQUFHaEQsa0JBQWtCLENBQUNJLElBQUksQ0FBQzZDLGdDQUFnQztBQUN2RyxNQUFNQyw4QkFBOEIsR0FBR2xELGtCQUFrQixDQUFDSSxJQUFJLENBQUMrQyx3QkFBd0I7QUFDdkYsTUFBTUMsNERBQTRELEdBQUdwRCxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDaUQsc0RBQXNEO0FBRW5KLE1BQU1DLHNCQUFzQixHQUFHdEQsa0JBQWtCLENBQUNJLElBQUksQ0FBQ21ELGdCQUFnQjtBQUN2RSxNQUFNQyxXQUFXLEdBQUd4RCxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDcUQsS0FBSztBQUNqRCxNQUFNQyxXQUFXLEdBQUcxRCxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDdUQsS0FBSztBQUVqRCxNQUFNQyxVQUFVLEdBQUc1RCxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDeUQsSUFBSTtBQUMvQyxNQUFNQyxXQUFXLEdBQUc5RCxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDMkQsS0FBSztBQUVqRCxNQUFNQyxhQUFhLEdBQUdoRSxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDNkQsT0FBTztBQUNyRCxNQUFNQyxjQUFjLEdBQUdsRSxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDK0QsUUFBUTtBQUN2RCxNQUFNQyxVQUFVLEdBQUdwRSxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDaUUsSUFBSTtBQUMvQyxNQUFNQyxZQUFZLEdBQUd0RSxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDbUUsTUFBTTtBQUNuRCxNQUFNQyxnQkFBZ0IsR0FBR3hFLGtCQUFrQixDQUFDSSxJQUFJLENBQUNxRSxVQUFVO0FBRTNELE1BQU1DLGtDQUFrQyxHQUFHMUUsa0JBQWtCLENBQUNJLElBQUksQ0FBQ3VFLDRCQUE0QjtBQUMvRixNQUFNQyxzQ0FBc0MsR0FBRzVFLGtCQUFrQixDQUFDSSxJQUFJLENBQUN5RSxnQ0FBZ0M7QUFDdkcsTUFBTUMsMEJBQTBCLEdBQUc5RSxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDMkUsb0JBQW9CO0FBRS9FLE1BQU1DLGtCQUFrQixHQUFHaEYsa0JBQWtCLENBQUNJLElBQUksQ0FBQzZFLFlBQVk7QUFDL0QsTUFBTUMsaUJBQWlCLEdBQUdsRixrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDK0UsV0FBVztBQUM3RCxNQUFNQyxvQkFBb0IsR0FBR3BGLGtCQUFrQixDQUFDSSxJQUFJLENBQUNpRixjQUFjO0FBQ25FLE1BQU1DLHFCQUFxQixHQUFHeEYsV0FBVyxDQUFDeUYsTUFBTSxDQUFFSCxvQkFBb0IsRUFBRTtFQUFFSSxJQUFJLEVBQUVSO0FBQW1CLENBQUUsQ0FBQztBQUN0RyxNQUFNUyxvQkFBb0IsR0FBRzNGLFdBQVcsQ0FBQ3lGLE1BQU0sQ0FBRUgsb0JBQW9CLEVBQUU7RUFBRUksSUFBSSxFQUFFTjtBQUFrQixDQUFFLENBQUM7QUFDcEcsTUFBTVEsMEJBQTBCLEdBQUcxRixrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDdUYsb0JBQW9CO0FBQy9FLE1BQU1DLGFBQWEsR0FBRzVGLGtCQUFrQixDQUFDSSxJQUFJLENBQUN5RixPQUFPO0FBQ3JELE1BQU1DLGNBQWMsR0FBRzlGLGtCQUFrQixDQUFDSSxJQUFJLENBQUMyRixRQUFRO0FBRXZELE1BQU1DLGdDQUFnQyxHQUFHaEcsa0JBQWtCLENBQUNJLElBQUksQ0FBQzZGLDBCQUEwQjtBQUMzRixNQUFNQyxxQ0FBcUMsR0FBR2xHLGtCQUFrQixDQUFDSSxJQUFJLENBQUMrRiwrQkFBK0I7QUFFckcsTUFBTUMsb0JBQW9CLEdBQUdwRyxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDaUcsY0FBYztBQUNuRSxNQUFNQywrQkFBK0IsR0FBR3RHLGtCQUFrQixDQUFDSSxJQUFJLENBQUNtRyx5QkFBeUI7QUFFekYsTUFBTUMsZUFBZSxHQUFHeEcsa0JBQWtCLENBQUNJLElBQUksQ0FBQ3FHLFNBQVM7QUFDekQsTUFBTUMsYUFBYSxHQUFHMUcsa0JBQWtCLENBQUNJLElBQUksQ0FBQ3VHLE9BQU87QUFDckQsTUFBTUMsMkJBQTJCLEdBQUc1RyxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDeUcscUJBQXFCO0FBQ2pGLE1BQU1DLHFDQUFxQyxHQUFHOUcsa0JBQWtCLENBQUNJLElBQUksQ0FBQzJHLCtCQUErQjtBQUNyRyxNQUFNQywwQ0FBMEMsR0FBR2hILGtCQUFrQixDQUFDSSxJQUFJLENBQUM2RyxvQ0FBb0M7QUFDL0csTUFBTUMsaUNBQWlDLEdBQUdsSCxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDK0csMkJBQTJCO0FBQzdGLE1BQU1DLFlBQVksR0FBR3BILGtCQUFrQixDQUFDSSxJQUFJLENBQUNpSCxNQUFNO0FBQ25ELE1BQU1DLGFBQWEsR0FBR3RILGtCQUFrQixDQUFDSSxJQUFJLENBQUNtSCxPQUFPO0FBQ3JELE1BQU1DLGtDQUFrQyxHQUFHeEgsa0JBQWtCLENBQUNJLElBQUksQ0FBQ3FILDRCQUE0QjtBQUUvRixNQUFNQywyQkFBMkIsR0FBRzFILGtCQUFrQixDQUFDSSxJQUFJLENBQUN1SCxxQkFBcUI7QUFFakYsTUFBTUMsZ0NBQWdDLEdBQUc1SCxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDeUgsMEJBQTBCO0FBQzNGLE1BQU1DLCtCQUErQixHQUFHOUgsa0JBQWtCLENBQUNJLElBQUksQ0FBQzJILHlCQUF5QjtBQUV6RixNQUFNQywyQkFBMkIsR0FBR2hJLGtCQUFrQixDQUFDSSxJQUFJLENBQUM2SCxxQkFBcUI7QUFDakYsTUFBTUMsMkJBQTJCLEdBQUdsSSxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDK0gscUJBQXFCO0FBQ2pGLE1BQU1DLHlCQUF5QixHQUFHcEksa0JBQWtCLENBQUNJLElBQUksQ0FBQ2lJLG1CQUFtQjtBQUM3RSxNQUFNQyxpQ0FBaUMsR0FBR3RJLGtCQUFrQixDQUFDSSxJQUFJLENBQUNtSSwyQkFBMkI7QUFDN0YsTUFBTUMsK0JBQStCLEdBQUd4SSxrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDcUkseUJBQXlCOztBQUV6RjtBQUNBLE1BQU1DLG1CQUFtQixHQUFHLENBQUV2SSxhQUFhLEVBQUVHLGVBQWUsRUFBRUUsY0FBYyxFQUMxRUUsZ0JBQWdCLEVBQUVFLFlBQVksRUFBRUUsaUJBQWlCLEVBQ2pERSxnQkFBZ0IsRUFBRUUsa0JBQWtCLEVBQUVFLGlCQUFpQixDQUFFOztBQUUzRDtBQUNBLE1BQU11SCxpQkFBaUIsR0FBRyxDQUFFM0csUUFBUSxFQUFFRSxpQkFBaUIsRUFBRUUsYUFBYSxFQUFFRSxhQUFhLENBQUU7QUFDdkY7O0FBRUEsTUFBTXNHLGVBQWUsR0FBRyxDQUFFNUUsYUFBYSxFQUFFRSxjQUFjLEVBQUVFLFVBQVUsRUFBRUUsWUFBWSxFQUFFRSxnQkFBZ0IsQ0FBRTtBQUNyRyxNQUFNcUUsVUFBVSxHQUFHO0VBQUVDLElBQUksRUFBRWxGLFVBQVU7RUFBRW1GLEtBQUssRUFBRWpGO0FBQVksQ0FBQztBQUUzRCxNQUFNa0YsZUFBZSxDQUFDO0VBRXBCQyxXQUFXQSxDQUFFQyxLQUFLLEVBQUVDLGFBQWEsRUFBRztJQUNsQztJQUNBLElBQUksQ0FBQ0MsTUFBTSxHQUFHRixLQUFLO0lBQ25CLElBQUksQ0FBQ0csT0FBTyxHQUFHSCxLQUFLLENBQUNJLE1BQU07SUFDM0IsSUFBSSxDQUFDQyxPQUFPLEdBQUdMLEtBQUssQ0FBQ00sTUFBTTtJQUMzQixJQUFJLENBQUNDLFFBQVEsR0FBR1AsS0FBSyxDQUFDUSxPQUFPO0lBQzdCLElBQUksQ0FBQ0MsV0FBVyxHQUFHVCxLQUFLLENBQUNVLFVBQVU7O0lBRW5DO0lBQ0EsSUFBSSxDQUFDVCxhQUFhLEdBQUdBLGFBQWE7RUFDcEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRVUsb0JBQW9CQSxDQUFBLEVBQUc7SUFDckIsSUFBSUMsd0JBQXdCLEdBQUcsSUFBSTtJQUNuQyxJQUFJQyxTQUFTLEdBQUcsSUFBSSxDQUFDQyx1QkFBdUI7SUFDNUMsSUFBSUMsaUJBQWlCLEdBQUcsSUFBSTtJQUU1QixJQUFLLElBQUksQ0FBQ2QsYUFBYSxDQUFDZSx1QkFBdUIsRUFBRztNQUNoREosd0JBQXdCLEdBQUcxRCxvQkFBb0I7SUFDakQ7SUFFQSxJQUFLLENBQUMsSUFBSSxDQUFDK0MsYUFBYSxDQUFDZ0IseUJBQXlCLEVBQUc7TUFDbkQsSUFBS0wsd0JBQXdCLEVBQUc7UUFDOUI7UUFDQSxNQUFNTSxPQUFPLEdBQUc7VUFDZC9ELGNBQWMsRUFBRUQsb0JBQW9CO1VBQ3BDaUUsY0FBYyxFQUFFLElBQUksQ0FBQ0M7UUFDdkIsQ0FBQztRQUNEUix3QkFBd0IsR0FBR2hLLFdBQVcsQ0FBQ3lGLE1BQU0sQ0FBRXpDLG1DQUFtQyxFQUFFc0gsT0FBUSxDQUFDO01BQy9GLENBQUMsTUFDSTtRQUNITix3QkFBd0IsR0FBRyxJQUFJLENBQUNRLHVCQUF1QjtNQUN6RDtJQUNGO0lBRUEsSUFBSyxJQUFJLENBQUNsQixNQUFNLENBQUNtQixzQkFBc0IsQ0FBQ0MsR0FBRyxDQUFDLENBQUMsRUFBRztNQUM5QztNQUNBUCxpQkFBaUIsR0FBRyxJQUFJLENBQUNRLHNCQUFzQjtJQUNqRDtJQUVBLElBQUssSUFBSSxDQUFDbEIsT0FBTyxDQUFDbUIseUJBQXlCLENBQUNGLEdBQUcsQ0FBQyxDQUFDLEVBQUc7TUFDbEQsSUFBS1AsaUJBQWlCLEVBQUc7UUFDdkIsTUFBTUcsT0FBTyxHQUFHO1VBQ2RPLE9BQU8sRUFBRVYsaUJBQWlCO1VBQzFCVyxVQUFVLEVBQUVwRDtRQUNkLENBQUM7UUFDRHlDLGlCQUFpQixHQUFHbkssV0FBVyxDQUFDeUYsTUFBTSxDQUFFckMsOEJBQThCLEVBQUVrSCxPQUFRLENBQUM7TUFDbkYsQ0FBQyxNQUNJO1FBQ0hILGlCQUFpQixHQUFHekMsa0NBQWtDO01BQ3hEO0lBQ0Y7SUFFQSxJQUFLc0Msd0JBQXdCLElBQUlHLGlCQUFpQixFQUFHO01BQ25ERixTQUFTLEdBQUdqSyxXQUFXLENBQUN5RixNQUFNLENBQzVCbkMsNERBQTRELEVBQzVEO1FBQ0UwRyx3QkFBd0IsRUFBRUEsd0JBQXdCO1FBQ2xERyxpQkFBaUIsRUFBRUEsaUJBQWlCO1FBQ3BDWSxRQUFRLEVBQUUsSUFBSSxDQUFDYjtNQUNqQixDQUNGLENBQUM7SUFDSCxDQUFDLE1BQ0ksSUFBS0Ysd0JBQXdCLEVBQUc7TUFDbkNDLFNBQVMsR0FBR2pLLFdBQVcsQ0FBQ3lGLE1BQU0sQ0FDNUIzQyx1Q0FBdUMsRUFDdkM7UUFDRWtILHdCQUF3QixFQUFFQSx3QkFBd0I7UUFDbERlLFFBQVEsRUFBRSxJQUFJLENBQUNiO01BQ2pCLENBQ0YsQ0FBQztJQUNILENBQUMsTUFDSSxJQUFLQyxpQkFBaUIsRUFBRztNQUM1QkYsU0FBUyxHQUFHakssV0FBVyxDQUFDeUYsTUFBTSxDQUM1QnZDLHNDQUFzQyxFQUN0QztRQUNFNkgsUUFBUSxFQUFFLElBQUksQ0FBQ2IsdUJBQXVCO1FBQ3RDQyxpQkFBaUIsRUFBRUE7TUFDckIsQ0FDRixDQUFDO0lBQ0g7SUFFQSxPQUFPRixTQUFTO0VBQ2xCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRWUsc0JBQXNCQSxDQUFFQyxXQUFXLEVBQUc7SUFDcEMsSUFBSUMsU0FBUyxHQUFHcEgsVUFBVTtJQUMxQixJQUFJcUgsU0FBUyxHQUFHbkgsV0FBVztJQUMzQixNQUFNb0gsWUFBWSxHQUFHeEQsMkJBQTJCO0lBRWhELElBQUtxRCxXQUFXLEtBQUs5SyxlQUFlLENBQUNrTCxFQUFFLEVBQUc7TUFDeENILFNBQVMsR0FBR2xILFdBQVc7TUFDdkJtSCxTQUFTLEdBQUdySCxVQUFVO0lBQ3hCO0lBRUEsSUFBSXdILEtBQUssR0FBR3RMLFdBQVcsQ0FBQ3lGLE1BQU0sQ0FBRTJGLFlBQVksRUFBRTtNQUFFRixTQUFTLEVBQUVBLFNBQVM7TUFBRUMsU0FBUyxFQUFFQTtJQUFVLENBQUUsQ0FBQztJQUU5RixJQUFLLElBQUksQ0FBQzdCLE1BQU0sQ0FBQ0ksTUFBTSxDQUFDa0IseUJBQXlCLENBQUNGLEdBQUcsQ0FBQyxDQUFDLEVBQUc7TUFDeERZLEtBQUssSUFBSyxJQUFHNUQsa0NBQW1DLEVBQUM7SUFDbkQ7SUFFQSxPQUFPNEQsS0FBSztFQUNkOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0UsSUFBSUMsMkJBQTJCQSxDQUFBLEVBQUc7SUFDaEMsTUFBTUMsUUFBUSxHQUFHMUMsZUFBZSxDQUFFLElBQUksQ0FBQ08sYUFBYSxDQUFDb0MsZ0NBQWdDLENBQUMsQ0FBQyxDQUFFO0lBQ3pGLE9BQU96TCxXQUFXLENBQUN5RixNQUFNLENBQUV1QixxQ0FBcUMsRUFBRTtNQUNoRXdFLFFBQVEsRUFBRUEsUUFBUTtNQUNsQjlGLElBQUksRUFBRUY7SUFDUixDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFLElBQUlrRywwQkFBMEJBLENBQUEsRUFBRztJQUMvQixNQUFNRixRQUFRLEdBQUcxQyxlQUFlLENBQUUsSUFBSSxDQUFDTyxhQUFhLENBQUNzQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUU7SUFDdEYsT0FBTzNMLFdBQVcsQ0FBQ3lGLE1BQU0sQ0FBRXVCLHFDQUFxQyxFQUFFO01BQ2hFd0UsUUFBUSxFQUFFQSxRQUFRO01BQ2xCOUYsSUFBSSxFQUFFQztJQUNSLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0UsSUFBSWlHLDRCQUE0QkEsQ0FBQSxFQUFHO0lBQ2pDLE1BQU1KLFFBQVEsR0FBRzFDLGVBQWUsQ0FBRSxJQUFJLENBQUNPLGFBQWEsQ0FBQ3NDLDZCQUE2QixDQUFDLENBQUMsQ0FBRTtJQUN0RixPQUFPM0wsV0FBVyxDQUFDeUYsTUFBTSxDQUFFeUIsMENBQTBDLEVBQUU7TUFBRXNFLFFBQVEsRUFBRUE7SUFBUyxDQUFFLENBQUM7RUFDakc7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRSxJQUFJaEIsdUJBQXVCQSxDQUFBLEVBQUc7SUFDNUIsT0FBT3hLLFdBQVcsQ0FBQ3lGLE1BQU0sQ0FBRVMsZ0NBQWdDLEVBQUU7TUFBRTJGLFFBQVEsRUFBRSxJQUFJLENBQUNDO0lBQWUsQ0FBRSxDQUFDO0VBQ2xHOztFQUVBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRSxJQUFJQyxvQkFBb0JBLENBQUEsRUFBRztJQUN6QixNQUFNekIsT0FBTyxHQUFHLElBQUksQ0FBQ2pCLGFBQWEsQ0FBQzJDLGlCQUFpQixHQUFHNUYscUNBQXFDLEdBQUdGLGdDQUFnQztJQUMvSCxPQUFPbEcsV0FBVyxDQUFDeUYsTUFBTSxDQUFFNkUsT0FBTyxFQUFFO01BQUV1QixRQUFRLEVBQUUsSUFBSSxDQUFDQztJQUFlLENBQUUsQ0FBQztFQUN6RTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFLElBQUlHLHFCQUFxQkEsQ0FBQSxFQUFHO0lBQzFCLE1BQU1mLFNBQVMsR0FBRyxJQUFJLENBQUN6QixPQUFPLENBQUN5QyxtQkFBbUIsQ0FBQ3hCLEdBQUcsQ0FBQyxDQUFDLEtBQUt2SyxlQUFlLENBQUNnTSxFQUFFLEdBQUdySSxVQUFVLEdBQUdFLFdBQVc7SUFDMUcsTUFBTW1ILFNBQVMsR0FBRyxJQUFJLENBQUMxQixPQUFPLENBQUN5QyxtQkFBbUIsQ0FBQ3hCLEdBQUcsQ0FBQyxDQUFDLEtBQUt2SyxlQUFlLENBQUNrTCxFQUFFLEdBQUd2SCxVQUFVLEdBQUdFLFdBQVc7SUFDMUcsT0FBT2hFLFdBQVcsQ0FBQ3lGLE1BQU0sQ0FBRWIsa0NBQWtDLEVBQUU7TUFBRXNHLFNBQVMsRUFBRUEsU0FBUztNQUFFQyxTQUFTLEVBQUVBO0lBQVUsQ0FBRSxDQUFDO0VBQ2pIOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0UsSUFBSWlCLHlCQUF5QkEsQ0FBQSxFQUFHO0lBQzlCLE1BQU1DLFdBQVcsR0FBR3ZELGVBQWUsQ0FBRSxJQUFJLENBQUNPLGFBQWEsQ0FBQ2lELDRCQUE0QixDQUFFLElBQUksQ0FBQ3pDLFdBQVksQ0FBQyxDQUFFO0lBQzFHLE9BQU83SixXQUFXLENBQUN5RixNQUFNLENBQUVYLHNDQUFzQyxFQUFFO01BQUV5SCxhQUFhLEVBQUVGO0lBQVksQ0FBRSxDQUFDO0VBQ3JHOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0UsSUFBSUcscUJBQXFCQSxDQUFBLEVBQUc7SUFDMUIsT0FBTyxJQUFJLENBQUNDLHNCQUFzQixDQUFFLElBQUksQ0FBQzVDLFdBQVksQ0FBQztFQUN4RDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFLElBQUk2QyxvQkFBb0JBLENBQUEsRUFBRztJQUN6QixPQUFPLElBQUksQ0FBQ0Qsc0JBQXNCLENBQUUsSUFBSSxDQUFDOUMsUUFBUyxDQUFDO0VBQ3JEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRThDLHNCQUFzQkEsQ0FBRS9HLElBQUksRUFBRztJQUM3QixNQUFNaUgsbUJBQW1CLEdBQUc3RCxlQUFlLENBQUUsSUFBSSxDQUFDTyxhQUFhLENBQUNpRCw0QkFBNEIsQ0FBRTVHLElBQUssQ0FBQyxDQUFFO0lBQ3RHLE1BQU1rSCxVQUFVLEdBQUdsSCxJQUFJLEtBQUssSUFBSSxDQUFDaUUsUUFBUSxHQUFHaEUsb0JBQW9CLEdBQUdILHFCQUFxQjtJQUN4RixPQUFPeEYsV0FBVyxDQUFDeUYsTUFBTSxDQUN2QlQsMEJBQTBCLEVBQzFCO01BQ0V1SCxhQUFhLEVBQUVJLG1CQUFtQjtNQUNsQ2pILElBQUksRUFBRWtIO0lBQ1IsQ0FBRSxDQUFDO0VBQ1A7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRSxJQUFJQywrQkFBK0JBLENBQUEsRUFBRztJQUNwQyxNQUFNdkMsT0FBTyxHQUFHLHVCQUF1QjtJQUN2QyxPQUFPdEssV0FBVyxDQUFDeUYsTUFBTSxDQUFFNkUsT0FBTyxFQUFFO01BQUV3QyxLQUFLLEVBQUUsSUFBSSxDQUFDQyxtQkFBbUI7TUFBRUMsTUFBTSxFQUFFLElBQUksQ0FBQ0M7SUFBb0IsQ0FBRSxDQUFDO0VBQzdHOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0UsSUFBSUYsbUJBQW1CQSxDQUFBLEVBQUc7SUFDeEIsT0FBTyxJQUFJLENBQUNHLGlCQUFpQixDQUFFeEosV0FBVyxFQUFFdkQsZUFBZSxDQUFDZ00sRUFBRyxDQUFDO0VBQ2xFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0UsSUFBSWMsbUJBQW1CQSxDQUFBLEVBQUc7SUFDeEIsT0FBTyxJQUFJLENBQUNDLGlCQUFpQixDQUFFdEosV0FBVyxFQUFFekQsZUFBZSxDQUFDa0wsRUFBRyxDQUFDO0VBQ2xFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFNkIsaUJBQWlCQSxDQUFFQyxJQUFJLEVBQUVsQyxXQUFXLEVBQUc7SUFDckMsTUFBTW1DLElBQUksR0FBRyxJQUFJLENBQUMzRCxPQUFPLENBQUN5QyxtQkFBbUIsQ0FBQ3hCLEdBQUcsQ0FBQyxDQUFDLEtBQUtPLFdBQVcsR0FBR25ILFVBQVUsR0FBR0UsV0FBVztJQUM5RixPQUFPaEUsV0FBVyxDQUFDeUYsTUFBTSxDQUFFakMsc0JBQXNCLEVBQUU7TUFBRTJKLElBQUksRUFBRUEsSUFBSTtNQUFFQyxJQUFJLEVBQUVBO0lBQUssQ0FBRSxDQUFDO0VBQ2pGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0UsSUFBSUMsMEJBQTBCQSxDQUFBLEVBQUc7SUFDL0IsTUFBTUMsWUFBWSxHQUFHLElBQUksQ0FBQ2pFLGFBQWEsQ0FBQ2tFLGVBQWUsQ0FBQyxDQUFDO0lBQ3pELE1BQU1oRCxjQUFjLEdBQUd2SyxXQUFXLENBQUN5RixNQUFNLENBQUU3RCw4QkFBOEIsRUFBRTtNQUFFNEwsWUFBWSxFQUFFLElBQUksQ0FBQ0M7SUFBeUIsQ0FBRSxDQUFDO0lBQzVILE1BQU1DLGFBQWEsR0FBRyxJQUFJLENBQUN4RCx1QkFBdUI7SUFFbEQsSUFBSyxJQUFJLENBQUNiLGFBQWEsQ0FBQ3NFLFlBQVksRUFBRztNQUNyQyxPQUFPRCxhQUFhO0lBQ3RCO0lBRUEsSUFBS0osWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQ2pFLGFBQWEsQ0FBQ3NFLFlBQVksRUFBRztNQUMzRCxPQUFPM04sV0FBVyxDQUFDeUYsTUFBTSxDQUFFL0MsK0JBQStCLEVBQUU0SyxZQUFhLENBQUM7SUFDNUU7SUFDQSxPQUFPdE4sV0FBVyxDQUFDeUYsTUFBTSxDQUFFN0Msb0NBQW9DLEVBQUU7TUFDL0QySCxjQUFjLEVBQUVBLGNBQWM7TUFDOUJtRCxhQUFhLEVBQUVBO0lBQ2pCLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0UsSUFBSUQsd0JBQXdCQSxDQUFBLEVBQUc7SUFDN0IsT0FBT3pOLFdBQVcsQ0FBQ3lGLE1BQU0sQ0FBRTNELCtCQUErQixFQUFFO01BQUUrSixRQUFRLEVBQUUsSUFBSSxDQUFDQztJQUFlLENBQUUsQ0FBQztFQUNqRzs7RUFFQTtBQUNGO0FBQ0E7RUFDRSxJQUFJN0osaUJBQWlCQSxDQUFBLEVBQUc7SUFDdEIsT0FBT0QsdUJBQXVCO0VBQ2hDOztFQUVBO0VBQ0EsSUFBSThKLGNBQWNBLENBQUEsRUFBRztJQUNuQixJQUFJOEIsV0FBVyxHQUFHaEYsbUJBQW1CLENBQUUsSUFBSSxDQUFDUyxhQUFhLENBQUN3RSxjQUFjLENBQUU7SUFDMUUsSUFBSyxJQUFJLENBQUN4RSxhQUFhLENBQUN5RSxZQUFZLEVBQUc7TUFDckNGLFdBQVcsR0FBRzVOLFdBQVcsQ0FBQ3lGLE1BQU0sQ0FBRS9ELHFCQUFxQixFQUFFO1FBQUVvTCxLQUFLLEVBQUVjLFdBQVc7UUFBRVosTUFBTSxFQUFFeEw7TUFBVyxDQUFFLENBQUM7SUFDdkc7SUFFQSxPQUFPb00sV0FBVztFQUNwQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFLElBQUkxRCx1QkFBdUJBLENBQUEsRUFBRztJQUU1QjtJQUNBO0lBQ0E7SUFDQSxNQUFNNkQsU0FBUyxHQUFHbEYsaUJBQWlCLENBQUUsSUFBSSxDQUFDUSxhQUFhLENBQUMyRSwyQkFBMkIsQ0FBRTtJQUVyRixPQUFPLElBQUksQ0FBQ0Msc0JBQXNCLENBQUVGLFNBQVMsRUFBRTNOLFlBQVksQ0FBQzhOLFNBQVUsQ0FBQztFQUN6RTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFLElBQUl2RCxzQkFBc0JBLENBQUEsRUFBRztJQUMzQixNQUFNb0QsU0FBUyxHQUFHbEYsaUJBQWlCLENBQUUsSUFBSSxDQUFDUSxhQUFhLENBQUM4RSx3QkFBd0IsQ0FBRTtJQUVsRixPQUFPLElBQUksQ0FBQ0Ysc0JBQXNCLENBQUVGLFNBQVMsRUFBRTNOLFlBQVksQ0FBQ2dPLFFBQVMsQ0FBQztFQUN4RTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUgsc0JBQXNCQSxDQUFFRixTQUFTLEVBQUVySSxJQUFJLEVBQUc7SUFDeEMsTUFBTTRFLE9BQU8sR0FBRzVFLElBQUksS0FBS3RGLFlBQVksQ0FBQzhOLFNBQVMsR0FBR3BHLGdDQUFnQyxHQUFHRSwrQkFBK0I7SUFDcEgsTUFBTTtNQUFFcUcsWUFBWTtNQUFFVjtJQUFhLENBQUMsR0FBRyxJQUFJLENBQUN0RSxhQUFhO0lBQ3pELElBQUlpRixhQUFhLEdBQUcsR0FBRztJQUN2QixJQUFLRCxZQUFZLEtBQUszSSxJQUFJLElBQUksQ0FBQ2lJLFlBQVksRUFBRztNQUM1Q1csYUFBYSxHQUFHLElBQUksQ0FBQ2pGLGFBQWEsQ0FBQ2tGLGdCQUFnQixLQUFLLE1BQU0sR0FBRyxnQkFBZ0IsR0FBRyxlQUFlO0lBQ3JHO0lBRUEsT0FBT3ZPLFdBQVcsQ0FBQ3lGLE1BQU0sQ0FBRTZFLE9BQU8sRUFBRTtNQUFFeUQsU0FBUyxFQUFFQSxTQUFTLEdBQUdBLFNBQVMsR0FBRztJQUFHLENBQUUsQ0FBQyxHQUFHTyxhQUFhO0VBQ2pHOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU9FLHlCQUF5QkEsQ0FBRUMsVUFBVSxFQUFFQyxjQUFjLEVBQUc7SUFDN0QsTUFBTUMsU0FBUyxHQUFHNUYsVUFBVSxDQUFFMkYsY0FBYyxDQUFFO0lBQzlDLE9BQU8xTyxXQUFXLENBQUN5RixNQUFNLENBQUVlLCtCQUErQixFQUFFO01BQUVtSSxTQUFTLEVBQUVBO0lBQVUsQ0FBRSxDQUFDO0VBQ3hGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPQyxnQ0FBZ0NBLENBQUVDLFNBQVMsRUFBRztJQUNuRCxNQUFNQyxVQUFVLEdBQUdELFNBQVMsR0FBR3JILGFBQWEsR0FBR0YsWUFBWTtJQUMzRCxJQUFJZ0UsS0FBSyxHQUFHdEwsV0FBVyxDQUFDeUYsTUFBTSxDQUFFMkIsaUNBQWlDLEVBQUU7TUFBRTBILFVBQVUsRUFBRUE7SUFBVyxDQUFFLENBQUM7SUFFL0YsSUFBS0QsU0FBUyxFQUFHO01BQ2Z2RCxLQUFLLElBQUssSUFBRzVELGtDQUFtQyxFQUFDO0lBQ25EO0lBRUEsT0FBTzRELEtBQUs7RUFDZDs7RUFFQTtBQUNGO0FBQ0E7O0VBRUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU95RCwrQkFBK0JBLENBQUVDLGFBQWEsRUFBRztJQUN0RCxNQUFNQyxlQUFlLEdBQUdELGFBQWEsR0FBR3RJLGVBQWUsR0FBR0UsYUFBYTtJQUN2RSxPQUFPNUcsV0FBVyxDQUFDeUYsTUFBTSxDQUFFcUIsMkJBQTJCLEVBQUU7TUFBRW1JLGVBQWUsRUFBRUE7SUFBZ0IsQ0FBRSxDQUFDO0VBQ2hHOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPQywwQkFBMEJBLENBQUVDLFdBQVcsRUFBRztJQUMvQyxNQUFNekosSUFBSSxHQUFHeUosV0FBVyxHQUFHbkosY0FBYyxHQUFHRixhQUFhO0lBQ3pELE9BQU85RixXQUFXLENBQUN5RixNQUFNLENBQUVHLDBCQUEwQixFQUFFO01BQUVGLElBQUksRUFBRUE7SUFBSyxDQUFFLENBQUM7RUFDekU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU8wSixrQkFBa0JBLENBQUVELFdBQVcsRUFBRztJQUN2QyxPQUFPQSxXQUFXLEdBQUcvRywyQkFBMkIsR0FBR0YsMkJBQTJCO0VBQ2hGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPbUgsMEJBQTBCQSxDQUFFTCxhQUFhLEVBQUc7SUFDakQsTUFBTU0sZUFBZSxHQUFHTixhQUFhLEdBQUd4RyxpQ0FBaUMsR0FBR0YseUJBQXlCO0lBQ3JHLE1BQU1pSCxlQUFlLEdBQUdySCwyQkFBMkI7SUFDbkQsT0FBT2xJLFdBQVcsQ0FBQ3lGLE1BQU0sQ0FBRWlELCtCQUErQixFQUFFO01BQzFENEcsZUFBZSxFQUFFQSxlQUFlO01BQ2hDQyxlQUFlLEVBQUVBO0lBQ25CLENBQUUsQ0FBQztFQUNMO0FBQ0Y7QUFFQXRQLFdBQVcsQ0FBQ3VQLFFBQVEsQ0FBRSxpQkFBaUIsRUFBRXRHLGVBQWdCLENBQUM7QUFDMUQsZUFBZUEsZUFBZSJ9