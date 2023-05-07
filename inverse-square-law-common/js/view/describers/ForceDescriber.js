// Copyright 2018-2022, University of Colorado Boulder

/**
 * Responsible for logic associated with the formation of audio description strings related to the model
 * force and interactions associated with the changes in force.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Michael Barlow (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ScientificNotationNode from '../../../../scenery-phet/js/ScientificNotationNode.js';
import inverseSquareLawCommon from '../../inverseSquareLawCommon.js';
import InverseSquareLawCommonStrings from '../../InverseSquareLawCommonStrings.js';
import ForceValuesDisplayEnum from '../../model/ForceValuesDisplayEnum.js';
import ISLCDescriber from './ISLCDescriber.js';

const unitsNewtonsString = InverseSquareLawCommonStrings.units.newtons;
const forceVectorArrowsString = InverseSquareLawCommonStrings.a11y.screenSummary.forceVectorArrows;
const summaryVectorSizePatternString = InverseSquareLawCommonStrings.a11y.screenSummary.summaryVectorSizePattern;
const summaryVectorSizeValueUnitsPatternString = InverseSquareLawCommonStrings.a11y.screenSummary.summaryVectorSizeValueUnitsPattern;
const forceVectorMagnitudeUnitsPatternString = InverseSquareLawCommonStrings.a11y.sphere.forceVectorMagnitudeUnitsPattern;
const forceAndVectorPatternString = InverseSquareLawCommonStrings.a11y.sphere.forceAndVectorPattern;
const forceVectorSizePatternString = InverseSquareLawCommonStrings.a11y.sphere.forceVectorSizePattern;
const robotPullSummaryPatternString = InverseSquareLawCommonStrings.a11y.screenSummary.robotPullSummaryPattern;
const robotPushSummaryPatternString = InverseSquareLawCommonStrings.a11y.screenSummary.robotPushSummaryPattern;
const vectorsString = InverseSquareLawCommonStrings.a11y.alerts.vectors;
const vectorsSizeClausePatternString = InverseSquareLawCommonStrings.a11y.alerts.vectorsSizeClausePattern;
const forcesValueUnitsClausePatternString = InverseSquareLawCommonStrings.a11y.alerts.forcesValueUnitsClausePattern;
const forceMagnitudeString = InverseSquareLawCommonStrings.a11y.sphere.forceMagnitude;
const forceVectorCapitalizedString = InverseSquareLawCommonStrings.a11y.sphere.forceVectorCapitalized;
const forceVectorsSizePatternString = InverseSquareLawCommonStrings.a11y.sphere.forceVectorsSizePattern;

const valuesInUnitsPatternString = InverseSquareLawCommonStrings.a11y.valuesInUnitsPattern;
const forcesInScientificNotationString = InverseSquareLawCommonStrings.a11y.forcesInScientificNotation;

const vectorChangePatternString = InverseSquareLawCommonStrings.a11y.alerts.vectorChangePattern;
const vectorsCapitalizedString = InverseSquareLawCommonStrings.a11y.alerts.vectorsCapitalized;
const vectorChangeForcesNowValuePatternString = InverseSquareLawCommonStrings.a11y.alerts.vectorChangeForcesNowValuePattern;
const vectorChangeSentencePatternString = InverseSquareLawCommonStrings.a11y.alerts.vectorChangeSentencePattern;
const vectorChangeClausePatternString = InverseSquareLawCommonStrings.a11y.alerts.vectorChangeClausePattern;
const vectorChangeForcesNowClausePatternString = InverseSquareLawCommonStrings.a11y.alerts.vectorChangeForcesNowClausePattern;
const vectorForceClausePatternString = InverseSquareLawCommonStrings.a11y.vectorForceClausePattern;
const regionForceClausePatternString = InverseSquareLawCommonStrings.a11y.regionForceClausePattern;

const tinyString = InverseSquareLawCommonStrings.a11y.qualitative.tiny;
const verySmallString = InverseSquareLawCommonStrings.a11y.qualitative.verySmall;
const smallString = InverseSquareLawCommonStrings.a11y.qualitative.small;
const mediumSizeString = InverseSquareLawCommonStrings.a11y.qualitative.mediumSize;
const largeString = InverseSquareLawCommonStrings.a11y.qualitative.large;
const veryLargeString = InverseSquareLawCommonStrings.a11y.qualitative.veryLarge;
const hugeString = InverseSquareLawCommonStrings.a11y.qualitative.huge;

const getBiggerString = InverseSquareLawCommonStrings.a11y.qualitative.getBigger;
const getSmallerString = InverseSquareLawCommonStrings.a11y.qualitative.getSmaller;

const veryHardString = InverseSquareLawCommonStrings.a11y.pullerEffort.veryHard;
const hardString = InverseSquareLawCommonStrings.a11y.pullerEffort.hard;
const moderatelyString = InverseSquareLawCommonStrings.a11y.pullerEffort.moderately;
const gentlyString = InverseSquareLawCommonStrings.a11y.pullerEffort.gently;
const lighlyString = InverseSquareLawCommonStrings.a11y.pullerEffort.lightly;
const aLittleString = InverseSquareLawCommonStrings.a11y.pullerEffort.aLittle;
const aTinyBitString = InverseSquareLawCommonStrings.a11y.pullerEffort.aTinyBit;

const forceEqualsPatternString = InverseSquareLawCommonStrings.a11y.voicing.levels.forceEqualsPattern;
const forceArrowSizePatternString = InverseSquareLawCommonStrings.a11y.voicing.levels.forceArrowSizePattern;
const forceOnObjectsPatternString = InverseSquareLawCommonStrings.a11y.voicing.levels.forceOnObjectsPattern;

const SIZE_STRINGS = [
  tinyString,
  verySmallString,
  smallString,
  mediumSizeString,
  largeString,
  veryLargeString,
  hugeString
];
const PULL_EFFORT_STINGS = [
  aTinyBitString,
  aLittleString,
  lighlyString,
  gentlyString,
  moderatelyString,
  hardString,
  veryHardString
];
const CHANGE_DIRECTIONS = [ getSmallerString, null, getBiggerString ];

// scientific notation
const scientificNotationPatternString = InverseSquareLawCommonStrings.a11y.scientificNotationPattern;
const negativeValuePatternString = InverseSquareLawCommonStrings.a11y.negativeValuePattern;
const valuePatternString = InverseSquareLawCommonStrings.a11y.valuePattern;

class ForceDescriber extends ISLCDescriber {

  /**
   * @param {ISLCModel} model - supports subtypes with forceValuesDisplayProperty gracefully
   * @param {string} object1Label
   * @param {string} object2Label
   * @param {PositionDescriber} positionDescriber
   * @param {Object} [options]
   */
  constructor( model, object1Label, object2Label, positionDescriber, options ) {
    super( model, object1Label, object2Label );

    options = merge( {
      units: unitsNewtonsString,

      // in some scenarios, the force units change. convertForce allows subtypes to define conversion behavior
      // integrates with forceValueToString for necessary conversions (e.g. 300000000 -> 3)
      // always takes place before forceValueToString
      convertForce: _.identity,

      // for adding natural language to the force (e.g. '3 billion' instead of 3000000000)
      forceValueToString: value => StringUtils.fillIn( valuePatternString, { value: value } ),

      // {string} - all options below used for simplification in GFLB
      forceVectorsCapitalizedString: forceVectorArrowsString,

      // In GFL, we like "vector" but in GFLB prefer "arrow", see usages below as well as GFLBForceDescriber
      forceVectorsString: vectorsString,
      vectorsString: vectorsString,
      vectorsCapitalizedString: vectorsCapitalizedString,
      forceVectorCapitalizedString: forceVectorCapitalizedString,
      forceMagnitudeString: forceMagnitudeString
    }, options );

    // @private
    this.positionDescriber = positionDescriber;
    this.forceProperty = model.forceProperty;
    this.showForceValuesProperty = model.showForceValuesProperty;
    this.units = options.units;
    this.forceValueToString = options.forceValueToString;
    this.convertForce = options.convertForce;

    // @private
    this.vectorChangeDirection = 0; // {number} - // 1 -> growing, 0 -> no change, -1 -> shrinking
    this.forceVectorsString = options.forceVectorsString; // {string}
    this.vectorsCapitalizedString = options.vectorsCapitalizedString; // {string}
    this.forceVectorCapitalizedString = options.forceVectorCapitalizedString; // {string}

    // @protected
    this.forceValuesDisplayProperty = model.forceValuesDisplayProperty || null;

    // @private - these string patterns can vary based on options
    this.summaryVectorSizePatternString = StringUtils.fillIn( summaryVectorSizePatternString, {
      forceVectorArrows: options.forceVectorsCapitalizedString
    } );
    this.summaryVectorSizeValueUnitsPatternString = StringUtils.fillIn( summaryVectorSizeValueUnitsPatternString, {
      forceVectorArrows: options.forceVectorsCapitalizedString
    } );
    this.vectorsSizeClausePatternString = StringUtils.fillIn( vectorsSizeClausePatternString, {
      vectors: options.forceVectorsString
    } );
    this.vectorChangeClausePatternString = StringUtils.fillIn( vectorChangeClausePatternString, {
      vectors: options.forceVectorsString
    } );
    this.vectorChangeCapitalizedClausePatternString = StringUtils.fillIn( vectorChangeClausePatternString, {
      vectors: options.forceVectorsCapitalizedString
    } );
    this.vectorChangeForcesNowClausePatternString = StringUtils.fillIn( vectorChangeForcesNowClausePatternString, {
      vectors: options.forceVectorsString
    } );
    this.vectorChangeCapitalizedForcesNowClausePatternString = StringUtils.fillIn( vectorChangeForcesNowClausePatternString, {
      vectors: options.forceVectorsCapitalizedString
    } );
    this.forceVectorMagnitudeUnitsPatternString = StringUtils.fillIn( forceVectorMagnitudeUnitsPatternString, {
      forceMagnitude: options.forceMagnitudeString
    } );

    model.forceProperty.link( ( force, oldForce ) => {
      const forceDelta = force - oldForce;
      if ( forceDelta !== 0 ) {
        this.vectorChangeDirection = forceDelta / Math.abs( forceDelta ); // +1 or -1
      }
      else {
        this.vectorChangeDirection = 0;
      }
    } );
  }

  /**
   * @private
   * @returns {string}
   */
  getFormattedForce() {
    return this.forceValueToString( this.convertForce( this.forceProperty.get() ) );
  }

  /**
   * @public
   * @returns {string}
   */
  getForceVectorsSummaryText() {
    const fillObject = {};
    let pattern = this.summaryVectorSizePatternString;

    fillObject.size = this.getVectorSize();

    if ( this.showForceValuesProperty.get() ) {
      pattern = this.summaryVectorSizeValueUnitsPatternString;
      fillObject.forceValue = this.getFormattedForce();
      fillObject.units = this.units;
    }

    return StringUtils.fillIn( pattern, fillObject );
  }

  /**
   * @param {string} thisObjectLabel
   * @param {string} otherObjectLabel
   * @returns {string}
   * @public
   */
  getForceVectorMagnitudeText( thisObjectLabel, otherObjectLabel ) {
    return StringUtils.fillIn( this.forceVectorMagnitudeUnitsPatternString, {
      forceValue: this.getFormattedForce(),
      units: this.units,
      thisObjectLabel: thisObjectLabel,
      otherObjectLabel: otherObjectLabel
    } );
  }

  /**
   * Get a description for the force arrow Reading Block, describing the arrow and relative force size.
   * Returns something like
   * "Force on mass 1 by mass2 equals 33.4 newtons, force arrows tiny."
   * @public
   *
   * @param {string} thisObjectLabel
   * @param {string} otherObjectLabel
   * @returns {string}
   */
  getForceVectorsReadingBlockNameResponse( thisObjectLabel, otherObjectLabel ) {
    let response = null;

    if ( this.showForceValuesProperty.value ) {
      response = StringUtils.fillIn( forceEqualsPatternString, {
        object1: thisObjectLabel,
        object2: otherObjectLabel,
        value: this.getFormattedForce()
      } );
    }
    else {
      response = StringUtils.fillIn( forceOnObjectsPatternString, {
        object1: thisObjectLabel,
        object2: otherObjectLabel
      } );
    }

    return StringUtils.fillIn( forceArrowSizePatternString, {
      response: response,
      size: this.getVectorSize()
    } );
  }

  /**
   * Get the size of the vectors clause. Returns something like
   * "Force arrow is tiny"
   *
   * @public
   * @returns {string}
   */
  getForceVectorsSize() {
    return StringUtils.fillIn( forceVectorsSizePatternString, {
      size: this.getVectorSize(),
      forceVectors: this.forceVectorsString
    } );
  }

  /**
   * @param {string} thisObjectLabel
   * @param {string} otherObjectLabel
   * @returns {string}
   * @public
   */
  getForceBetweenAndVectorText( thisObjectLabel, otherObjectLabel ) {
    return StringUtils.fillIn( forceAndVectorPatternString, {
      thisObjectLabel: thisObjectLabel,
      otherObjectLabel: otherObjectLabel,
      forceVectorSize: StringUtils.fillIn( forceVectorSizePatternString, {
        size: this.getVectorSize(),
        forceVector: this.forceVectorCapitalizedString
      } )
    } );
  }

  /**
   * @public
   * @returns {string}
   */
  getRobotEffortSummaryText() {
    const pattern = this.forceProperty.get() < 0 ?
                    robotPushSummaryPatternString :
                    robotPullSummaryPatternString;
    const effort = this.getRobotEffort();
    return StringUtils.fillIn( pattern, { effort: effort } );
  }

  /**
   * Retrieves the string to be rendered in an aria-live region when the Scientific Notation checkbox is altered.
   * One of the following:
   *    'Values in {{this.units}}.'
   *    'Values in newtons with scientific notation.'
   *
   * @returns {string}
   * @public
   */
  getScientificNotationAlertText() {
    assert && assert( this.forceValuesDisplayProperty, 'forceValuesDisplayProperty expected for this alert' );
    if ( this.forceValuesDisplayProperty.value === ForceValuesDisplayEnum.SCIENTIFIC ) {
      return forcesInScientificNotationString;
    }
    return this.getValuesInUnitsText();
  }

  /**
   * Returns the filled-in string 'Values in {{units}}'.
   *
   * @returns {string}
   * @public
   */
  getValuesInUnitsText() {
    return StringUtils.fillIn( valuesInUnitsPatternString, { units: this.units } );
  }

  /**
   * Get text when an object has changed position, and the force value has as a result.
   * @param {ISLCObject} object - the object that changed position
   * @param {boolean} alwaysIncludeProgressClause
   * @returns {string}
   * @public
   */
  getVectorChangeText( object, alwaysIncludeProgressClause ) {
    const changeDirection = this.getChangeDirection();
    const positionOrLandmark = this.positionDescriber.getPositionProgressOrLandmarkClause( object, alwaysIncludeProgressClause );

    // Fill in the base clause of the vector changing.
    const vectorChangeClause = StringUtils.fillIn( vectorChangePatternString, {

      // if no position progress, then capitalize the next piece
      vectors: positionOrLandmark ? this.forceVectorsString : this.vectorsCapitalizedString,
      positionProgressOrLandmarkClause: positionOrLandmark ? positionOrLandmark : '',
      changeDirection: changeDirection
    } );

    // Add info like "forces now" only if force values checkbox is enabled
    if ( this.showForceValuesProperty.get() ) {
      const forceValue = this.getFormattedForce();
      const units = this.units;
      return StringUtils.fillIn( vectorChangeForcesNowValuePatternString, {
        vectorChangeClause: vectorChangeClause,
        forceValue: forceValue,
        units: units
      } );
    }
    else {

      // Make the vectorChangeClause into a sentence.
      return StringUtils.fillIn( vectorChangeSentencePatternString, {
        vectorChange: vectorChangeClause
      } );
    }
  }

  /**
   * Returns the filled-in string 'vectors {{changeDirection}}, forces now {{forceValue}} {{units}}' for use in larger
   * pattern strings.
   *
   * @param {boolean} forceBiggerOverride - manually specify that we want to "forces bigger" alert, see
   *                                        GravityForceLabAlertManager.alertMassValueChanged()
   * @param {boolean} capitalize - capitalize the clause
   * @returns {string}
   * @public
   */
  getVectorChangeClause( forceBiggerOverride, capitalize ) {
    const directionChange = this.getChangeDirection( forceBiggerOverride );

    if ( !this.showForceValuesProperty.value ) {
      return StringUtils.fillIn( capitalize ?
                                 this.vectorChangeCapitalizedClausePatternString :
                                 this.vectorChangeClausePatternString, {
        changeDirection: directionChange
      } );
    }
    return StringUtils.fillIn( capitalize ?
                               this.vectorChangeCapitalizedForcesNowClausePatternString :
                               this.vectorChangeForcesNowClausePatternString, {
      changeDirection: directionChange,
      forceValue: this.getFormattedForce(),
      units: this.units
    } );
  }

  /**
   * Returns the qualitiative amount of pull/push the robots are currently exerting. This uses the same range as
   * the force vector (or "arrow" in GFLB) size regions.
   *
   * @returns {string}
   * @private
   */
  getRobotEffort() {
    return PULL_EFFORT_STINGS[ this.getForceVectorIndex( this.forceProperty.get(), PULL_EFFORT_STINGS.length ) ];
  }

  /**
   * Returns the qualitative size of force vectors.
   *
   * @returns {string}
   * @private
   */
  getVectorSize() {
    return SIZE_STRINGS[ this.getForceVectorIndex( this.forceProperty.get(), SIZE_STRINGS.length ) ];
  }

  /**
   * Returns the appropriate changed direction for the vectors ('get bigger/smaller'), if no change, null is returned.
   *
   * @param {boolean} forceBiggerOverride - when true, just return the "get bigger" string.
   * @returns {string}
   * @private
   */
  getChangeDirection( forceBiggerOverride ) {
    const index = forceBiggerOverride ? 2 : this.vectorChangeDirection + 1;
    assert && assert( CHANGE_DIRECTIONS[ index ] !== null, 'Alert should not be called if no change in direction' );
    return CHANGE_DIRECTIONS[ index ];
  }

  /**
   * Alert text for when ISLCObject position does not change even though there was a drag.
   * @param {ISLCObject} object - the ISLCObject that was interacted with but didn't change position
   * @public
   * @returns {string}
   */
  getPositionUnchangedAlertText( object ) {

    // if not showing force values, this is the force clause
    let forceClause = StringUtils.fillIn( this.vectorsSizeClausePatternString, { size: this.getVectorSize() } );

    if ( this.showForceValuesProperty.get() ) {
      const forceValuesClause = StringUtils.fillIn( forcesValueUnitsClausePatternString, {
        forceValue: this.getFormattedForce(),
        units: this.units
      } );
      forceClause = StringUtils.fillIn( vectorForceClausePatternString, {
        vectorClause: forceClause, // in GFLB this has nothing to do with "vectors" but instead "force arrows"
        forceValuesClause: forceValuesClause
      } );
    }

    return StringUtils.fillIn( regionForceClausePatternString, {
      otherObjectLabel: this.getOtherObjectLabelFromEnum( object.enum ),
      relativeDistance: this.positionDescriber.getCapitalizedQualitativeRelativeDistanceRegion(),
      forceClause: forceClause
    } );
  }

  /**
   *
   * @param {number} forceValue
   * @param {number} mantissaDecimalPlaces
   * @returns {number}
   * @public
   */
  static getForceInScientificNotation( forceValue, mantissaDecimalPlaces ) {
    return getScientificNotationTextFromPattern( forceValue, mantissaDecimalPlaces, scientificNotationPatternString );
  }

  /**
   * Returns the mapped index based on the given force value. Force values in ISLC sims range from piconewtons to
   * newtons, so it's necessary for sim-specific subtypes to specify this logic.
   *
   * @abstract
   * @param  {number} force
   * @param {number} numberOfRegions - for crosscheck
   * @returns {number} - integer index to get value from SIZE_STRINGS
   * @protected
   */
  getForceVectorIndex( force, numberOfRegions ) {
    throw new Error( 'getForceVectorIndex MUST be implemented in subtypes.' );
  }

}

/**
 * Convert a number into scientific notation. The pattern expects a {{mantissa}} and {{exponent}} variables
 * @param {number} forceValue
 * @param {number} mantissaDecimalPlaces
 * @param {string} pattern
 * @returns {string}
 */
const getScientificNotationTextFromPattern = ( forceValue, mantissaDecimalPlaces, pattern ) => {
  const { mantissa, exponent } = ScientificNotationNode.toScientificNotation( forceValue, { mantissaDecimalPlaces: mantissaDecimalPlaces } );
  const mantissaPattern = mantissa < 0 ? negativeValuePatternString : valuePatternString; // negative values are possible in Coulomb's Law
  const mantissaString = StringUtils.fillIn( mantissaPattern, { value: Math.abs( mantissa ) } );
  const exponentPattern = exponent < 0 ? negativeValuePatternString : valuePatternString;
  const exponentString = StringUtils.fillIn( exponentPattern, { value: Math.abs( exponent ) } );
  return StringUtils.fillIn( pattern, { mantissa: mantissaString, exponent: exponentString } );
};

inverseSquareLawCommon.register( 'ForceDescriber', ForceDescriber );
export default ForceDescriber;