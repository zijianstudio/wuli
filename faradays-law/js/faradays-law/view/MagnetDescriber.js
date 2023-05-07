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
const theFourLoopCoilString = StringUtils.fillIn( theCoilPatternString, { coil: fourLoopCoilString } );
const theTwoLoopCoilString = StringUtils.fillIn( theCoilPatternString, { coil: twoLoopCoilString } );
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
const REGION_DESCRIPTIONS = [ topLeftString, topCenterString, topRightString,
  middleLeftString, centerString, middleRightString,
  bottomLeftString, bottomCenterString, bottomRightString ];

// can create a linear function to map distances to integers 0 - 2
const PROXIMITY_STRINGS = [ inString, veryCloseToString, closeToString, farFromString ];
// const proximityMapFunction = new LinearFunction( 95, 260, 0, 2, true ); // determined empirically from sim testing

const FIELD_STRENGTHS = [ minimalString, veryWeakString, weakString, strongString, veryStrongString ];
const DIRECTIONS = { LEFT: leftString, RIGHT: rightString };

class MagnetDescriber {

  constructor( model, regionManager ) {
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

    if ( this.regionManager.magnetStoppedByKeyboard ) {
      slidingAndPositionPhrase = slidingStoppedString;
    }

    if ( !this.regionManager.magnetInOrVeryCloseToCoil ) {
      if ( slidingAndPositionPhrase ) {
        // phrase exists, magnet stopped by keyboard
        const pattern = {
          slidingStopped: slidingStoppedString,
          magnetPosition: this.magnetPositionAlertText
        };
        slidingAndPositionPhrase = StringUtils.fillIn( slidingStoppedPositionPatternString, pattern );
      }
      else {
        slidingAndPositionPhrase = this.magnetPositionAlertText;
      }
    }

    if ( this._model.topCoilVisibleProperty.get() ) {
      // both coils visible
      twoCoilFieldLines = this.twoCoilProximityString;
    }

    if ( this._magnet.fieldLinesVisibleProperty.get() ) {
      if ( twoCoilFieldLines ) {
        const pattern = {
          twoCoil: twoCoilFieldLines,
          fieldLines: fieldLinesDescriptionUpdatedString
        };
        twoCoilFieldLines = StringUtils.fillIn( twoCoilFieldLinesPatternString, pattern );
      }
      else {
        twoCoilFieldLines = fieldLinesDescriptionUpdatedString;
      }
    }

    if ( slidingAndPositionPhrase && twoCoilFieldLines ) {
      alertText = StringUtils.fillIn(
        slidingStoppedPositionFourCoilTwoCoilFieldLinesPatternString,
        {
          slidingAndPositionPhrase: slidingAndPositionPhrase,
          twoCoilFieldLines: twoCoilFieldLines,
          fourCoil: this.fourCoilProximityString
        }
      );
    }
    else if ( slidingAndPositionPhrase ) {
      alertText = StringUtils.fillIn(
        slidingAndPositionFourCoilPatternString,
        {
          slidingAndPositionPhrase: slidingAndPositionPhrase,
          fourCoil: this.fourCoilProximityString
        }
      );
    }
    else if ( twoCoilFieldLines ) {
      alertText = StringUtils.fillIn(
        fourCoilTwoCoilFieldLinesPatternString,
        {
          fourCoil: this.fourCoilProximityString,
          twoCoilFieldLines: twoCoilFieldLines
        }
      );
    }

    return alertText;
  }

  /**
   * @public
   * @param {OrientationEnum} orientation
   * @returns {string}
   */
  getFlipMagnetAlertText( orientation ) {
    let northSide = leftString;
    let southSide = rightString;
    const alertPattern = flippingMagnetPatternString;

    if ( orientation === OrientationEnum.SN ) {
      northSide = rightString;
      southSide = leftString;
    }

    let alert = StringUtils.fillIn( alertPattern, { northSide: northSide, southSide: southSide } );

    if ( this._model.magnet.fieldLinesVisibleProperty.get() ) {
      alert += ` ${fieldLinesDescriptionUpdatedString}`;
    }

    return alert;
  }

  /**
   * @public
   * @returns {string}
   */
  get strengthThroughFourCoilText() {
    const strength = FIELD_STRENGTHS[ this.regionManager.getBottomCoilFieldStrengthRegion() ];
    return StringUtils.fillIn( fieldStrengthPassingCoilPatternString, {
      strength: strength,
      coil: theFourLoopCoilString
    } );
  }

  /**
   * @public
   * @returns {string}
   */
  get strengthThroughTwoCoilText() {
    const strength = FIELD_STRENGTHS[ this.regionManager.getTopCoilFieldStrengthRegion() ];
    return StringUtils.fillIn( fieldStrengthPassingCoilPatternString, {
      strength: strength,
      coil: theTwoLoopCoilString
    } );
  }

  /**
   * @public
   * @returns {string}
   */
  get strengthThroughBothCoilsText() {
    const strength = FIELD_STRENGTHS[ this.regionManager.getTopCoilFieldStrengthRegion() ];
    return StringUtils.fillIn( fieldStrengthPassingBothCoilsPatternString, { strength: strength } );
  }

  /**
   * @public
   * @returns {string}
   */
  get magnetPositionAlertText() {
    return StringUtils.fillIn( magnetPositionAlertPatternString, { position: this.positionString } );
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
    return StringUtils.fillIn( pattern, { position: this.positionString } );
  }

  /**
   * @public
   * @returns {string}
   */
  get fieldLinesDescription() {
    const northSide = this._magnet.orientationProperty.get() === OrientationEnum.NS ? leftString : rightString;
    const southSide = this._magnet.orientationProperty.get() === OrientationEnum.SN ? leftString : rightString;
    return StringUtils.fillIn( fieldLinesDescriptionPatternString, { northSide: northSide, southSide: southSide } );
  }

  /**
   * @public
   * @returns {string}
   */
  get fourLoopOnlyFieldStrength() {
    const valueString = FIELD_STRENGTHS[ this.regionManager.getFieldStrengthAtCoilRegion( this._bottomCoil ) ];
    return StringUtils.fillIn( fourLoopOnlyFieldStrengthPatternString, { fieldStrength: valueString } );
  }

  /**
   * @public
   * @returns {string}
   */
  get fourLoopFieldStrength() {
    return this.getFieldStrengthAtCoil( this._bottomCoil );
  }

  /**
   * @public
   * @returns {string}
   */
  get twoLoopFieldStrength() {
    return this.getFieldStrengthAtCoil( this._topCoil );
  }

  /**
   * @public
   * @param {CoilTypeEnum} coil
   * @returns {string}
   */
  getFieldStrengthAtCoil( coil ) {
    const fieldStrengthString = FIELD_STRENGTHS[ this.regionManager.getFieldStrengthAtCoilRegion( coil ) ];
    const coilString = coil === this._topCoil ? theTwoLoopCoilString : theFourLoopCoilString;
    return StringUtils.fillIn(
      fieldStrengthPatternString,
      {
        fieldStrength: fieldStrengthString,
        coil: coilString
      } );
  }

  /**
   * @public
   * @returns {string}
   */
  get fourCoilOnlyPolarityDescription() {
    const pattern = '{{first}}, {{second}}';
    return StringUtils.fillIn( pattern, { first: this.northPoleSideString, second: this.southPoleSideString } );
  }

  /**
   * @public
   * @returns {string}
   */
  get northPoleSideString() {
    return this.getPoleSideString( northString, OrientationEnum.NS );
  }

  /**
   * @public
   * @returns {string}
   */
  get southPoleSideString() {
    return this.getPoleSideString( southString, OrientationEnum.SN );
  }

  /**
   * @public
   * @param {string} pole
   * @param {OrientationEnum} orientation
   * @returns {string}
   */
  getPoleSideString( pole, orientation ) {
    const side = this._magnet.orientationProperty.get() === orientation ? leftString : rightString;
    return StringUtils.fillIn( poleOnThePatternString, { pole: pole, side: side } );
  }

  /**
   * @public
   * @returns {string}
   */
  get fourLoopOnlyMagnetPosition() {
    const touchingCoil = this.regionManager.getTouchingCoil();
    const magnetPosition = StringUtils.fillIn( barMagnetPositionPatternString, { areaPosition: this.positionOfPlayAreaString } );
    const coilProximity = this.fourCoilProximityString;

    if ( this.regionManager.magnetInCoil ) {
      return coilProximity;
    }

    if ( touchingCoil >= 0 && !this.regionManager.magnetInCoil ) {
      return StringUtils.fillIn( touchingSideOfCoilPatternString, touchingCoil );
    }
    return StringUtils.fillIn( magnetPositionProximityPatternString, {
      magnetPosition: magnetPosition,
      coilProximity: coilProximity
    } );
  }

  /**
   * @public
   * @returns {string}
   */
  get positionOfPlayAreaString() {
    return StringUtils.fillIn( positionOfPlayAreaPatternString, { position: this.positionString } );
  }

  /**
   * @public
   */
  get barMagnetHelpText() {
    return barMagnetHelpTextString;
  }

  // handles getting the current position description (e.g. top-left edge, bottom-center, center, etc...)
  get positionString() {
    let description = REGION_DESCRIPTIONS[ this.regionManager.positionRegion ];
    if ( this.regionManager.magnetAtEdge ) {
      description = StringUtils.fillIn( twoWordsPatternString, { first: description, second: edgeString } );
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
    const proximity = PROXIMITY_STRINGS[ this.regionManager.magnetToBottomCoilProximity ];

    return this.getCoilProximityString( proximity, CoilTypeEnum.FOUR_COIL );
  }

  /**
   * @public
   * @returns {string}
   */
  get twoCoilProximityString() {
    const proximity = PROXIMITY_STRINGS[ this.regionManager.magnetToTopCoilProximity ];

    return this.getCoilProximityString( proximity, CoilTypeEnum.TWO_COIL );
  }

  /**
   * @public
   * @param {string} proximity
   * @param {CoilTypeEnum} coil
   * @returns {string}
   */
  getCoilProximityString( proximity, coil ) {
    const pattern = coil === CoilTypeEnum.FOUR_COIL ? proximityToFourCoilPatternString : proximityToTwoCoilPatternString;
    const { adjacentCoil, magnetInCoil } = this.regionManager;
    let coilDirection = '.';
    if ( adjacentCoil === coil && !magnetInCoil ) {
      coilDirection = this.regionManager.magnetScreenSide === 'left' ? ' to the right.' : ' to the left.';
    }

    return StringUtils.fillIn( pattern, { proximity: proximity ? proximity : '' } ) + coilDirection;
  }

  /**
   * @public
   * @param {number} speedValue
   * @param {string} directionValue
   * @returns {string}
   */
  static getMagnetSlidingAlertText( speedValue, directionValue ) {
    const direction = DIRECTIONS[ directionValue ];
    return StringUtils.fillIn( magnetSlidingAlertPatternString, { direction: direction } );
  }

  /**
   * @public
   * @param {boolean} showLines
   * @returns {string}
   */
  static getFieldLinesVisibilityAlertText( showLines ) {
    const visibility = showLines ? visibleString : hiddenString;
    let alert = StringUtils.fillIn( fieldLinesVisibilityPatternString, { visibility: visibility } );

    if ( showLines ) {
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
  static getVoltmeterAttachmentAlertText( showVoltmeter ) {
    const attachmentState = showVoltmeter ? connectedString : removedString;
    return StringUtils.fillIn( voltmeterAlertPatternString, { attachmentState: attachmentState } );
  }

  /**
   * @public
   * @param {boolean} showTopCoil
   * @returns {string}
   */
  static getCoilConnectionAlertText( showTopCoil ) {
    const coil = showTopCoil ? twoCoilsString : oneCoilString;
    return StringUtils.fillIn( circuitNowHasPatternString, { coil: coil } );
  }

  /**
   * @public
   * @param {boolean} showTopCoil
   * @returns {string}
   */
  static getCoilDescription( showTopCoil ) {
    return showTopCoil ? doubleCoilDescriptionString : singleCoilDescriptionString;
  }

  /**
   * @public
   * @param {boolean} showVoltmeter
   * @returns {string}
   */
  static getFourCoilOnlyDescription( showVoltmeter ) {
    const circuitContents = showVoltmeter ? circuitFourCoilAndVoltmeterString : circuitFourCoilOnlyString;
    const coilDescription = singleCoilDescriptionString;
    return StringUtils.fillIn( circuitDescriptionPatternString, {
      circuitContents: circuitContents,
      coilDescription: coilDescription
    } );
  }
}

faradaysLaw.register( 'MagnetDescriber', MagnetDescriber );
export default MagnetDescriber;
