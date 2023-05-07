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
const SIZE_STRINGS = [tinyString, verySmallString, smallString, mediumSizeString, largeString, veryLargeString, hugeString];
const PULL_EFFORT_STINGS = [aTinyBitString, aLittleString, lighlyString, gentlyString, moderatelyString, hardString, veryHardString];
const CHANGE_DIRECTIONS = [getSmallerString, null, getBiggerString];

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
  constructor(model, object1Label, object2Label, positionDescriber, options) {
    super(model, object1Label, object2Label);
    options = merge({
      units: unitsNewtonsString,
      // in some scenarios, the force units change. convertForce allows subtypes to define conversion behavior
      // integrates with forceValueToString for necessary conversions (e.g. 300000000 -> 3)
      // always takes place before forceValueToString
      convertForce: _.identity,
      // for adding natural language to the force (e.g. '3 billion' instead of 3000000000)
      forceValueToString: value => StringUtils.fillIn(valuePatternString, {
        value: value
      }),
      // {string} - all options below used for simplification in GFLB
      forceVectorsCapitalizedString: forceVectorArrowsString,
      // In GFL, we like "vector" but in GFLB prefer "arrow", see usages below as well as GFLBForceDescriber
      forceVectorsString: vectorsString,
      vectorsString: vectorsString,
      vectorsCapitalizedString: vectorsCapitalizedString,
      forceVectorCapitalizedString: forceVectorCapitalizedString,
      forceMagnitudeString: forceMagnitudeString
    }, options);

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
    this.summaryVectorSizePatternString = StringUtils.fillIn(summaryVectorSizePatternString, {
      forceVectorArrows: options.forceVectorsCapitalizedString
    });
    this.summaryVectorSizeValueUnitsPatternString = StringUtils.fillIn(summaryVectorSizeValueUnitsPatternString, {
      forceVectorArrows: options.forceVectorsCapitalizedString
    });
    this.vectorsSizeClausePatternString = StringUtils.fillIn(vectorsSizeClausePatternString, {
      vectors: options.forceVectorsString
    });
    this.vectorChangeClausePatternString = StringUtils.fillIn(vectorChangeClausePatternString, {
      vectors: options.forceVectorsString
    });
    this.vectorChangeCapitalizedClausePatternString = StringUtils.fillIn(vectorChangeClausePatternString, {
      vectors: options.forceVectorsCapitalizedString
    });
    this.vectorChangeForcesNowClausePatternString = StringUtils.fillIn(vectorChangeForcesNowClausePatternString, {
      vectors: options.forceVectorsString
    });
    this.vectorChangeCapitalizedForcesNowClausePatternString = StringUtils.fillIn(vectorChangeForcesNowClausePatternString, {
      vectors: options.forceVectorsCapitalizedString
    });
    this.forceVectorMagnitudeUnitsPatternString = StringUtils.fillIn(forceVectorMagnitudeUnitsPatternString, {
      forceMagnitude: options.forceMagnitudeString
    });
    model.forceProperty.link((force, oldForce) => {
      const forceDelta = force - oldForce;
      if (forceDelta !== 0) {
        this.vectorChangeDirection = forceDelta / Math.abs(forceDelta); // +1 or -1
      } else {
        this.vectorChangeDirection = 0;
      }
    });
  }

  /**
   * @private
   * @returns {string}
   */
  getFormattedForce() {
    return this.forceValueToString(this.convertForce(this.forceProperty.get()));
  }

  /**
   * @public
   * @returns {string}
   */
  getForceVectorsSummaryText() {
    const fillObject = {};
    let pattern = this.summaryVectorSizePatternString;
    fillObject.size = this.getVectorSize();
    if (this.showForceValuesProperty.get()) {
      pattern = this.summaryVectorSizeValueUnitsPatternString;
      fillObject.forceValue = this.getFormattedForce();
      fillObject.units = this.units;
    }
    return StringUtils.fillIn(pattern, fillObject);
  }

  /**
   * @param {string} thisObjectLabel
   * @param {string} otherObjectLabel
   * @returns {string}
   * @public
   */
  getForceVectorMagnitudeText(thisObjectLabel, otherObjectLabel) {
    return StringUtils.fillIn(this.forceVectorMagnitudeUnitsPatternString, {
      forceValue: this.getFormattedForce(),
      units: this.units,
      thisObjectLabel: thisObjectLabel,
      otherObjectLabel: otherObjectLabel
    });
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
  getForceVectorsReadingBlockNameResponse(thisObjectLabel, otherObjectLabel) {
    let response = null;
    if (this.showForceValuesProperty.value) {
      response = StringUtils.fillIn(forceEqualsPatternString, {
        object1: thisObjectLabel,
        object2: otherObjectLabel,
        value: this.getFormattedForce()
      });
    } else {
      response = StringUtils.fillIn(forceOnObjectsPatternString, {
        object1: thisObjectLabel,
        object2: otherObjectLabel
      });
    }
    return StringUtils.fillIn(forceArrowSizePatternString, {
      response: response,
      size: this.getVectorSize()
    });
  }

  /**
   * Get the size of the vectors clause. Returns something like
   * "Force arrow is tiny"
   *
   * @public
   * @returns {string}
   */
  getForceVectorsSize() {
    return StringUtils.fillIn(forceVectorsSizePatternString, {
      size: this.getVectorSize(),
      forceVectors: this.forceVectorsString
    });
  }

  /**
   * @param {string} thisObjectLabel
   * @param {string} otherObjectLabel
   * @returns {string}
   * @public
   */
  getForceBetweenAndVectorText(thisObjectLabel, otherObjectLabel) {
    return StringUtils.fillIn(forceAndVectorPatternString, {
      thisObjectLabel: thisObjectLabel,
      otherObjectLabel: otherObjectLabel,
      forceVectorSize: StringUtils.fillIn(forceVectorSizePatternString, {
        size: this.getVectorSize(),
        forceVector: this.forceVectorCapitalizedString
      })
    });
  }

  /**
   * @public
   * @returns {string}
   */
  getRobotEffortSummaryText() {
    const pattern = this.forceProperty.get() < 0 ? robotPushSummaryPatternString : robotPullSummaryPatternString;
    const effort = this.getRobotEffort();
    return StringUtils.fillIn(pattern, {
      effort: effort
    });
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
    assert && assert(this.forceValuesDisplayProperty, 'forceValuesDisplayProperty expected for this alert');
    if (this.forceValuesDisplayProperty.value === ForceValuesDisplayEnum.SCIENTIFIC) {
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
    return StringUtils.fillIn(valuesInUnitsPatternString, {
      units: this.units
    });
  }

  /**
   * Get text when an object has changed position, and the force value has as a result.
   * @param {ISLCObject} object - the object that changed position
   * @param {boolean} alwaysIncludeProgressClause
   * @returns {string}
   * @public
   */
  getVectorChangeText(object, alwaysIncludeProgressClause) {
    const changeDirection = this.getChangeDirection();
    const positionOrLandmark = this.positionDescriber.getPositionProgressOrLandmarkClause(object, alwaysIncludeProgressClause);

    // Fill in the base clause of the vector changing.
    const vectorChangeClause = StringUtils.fillIn(vectorChangePatternString, {
      // if no position progress, then capitalize the next piece
      vectors: positionOrLandmark ? this.forceVectorsString : this.vectorsCapitalizedString,
      positionProgressOrLandmarkClause: positionOrLandmark ? positionOrLandmark : '',
      changeDirection: changeDirection
    });

    // Add info like "forces now" only if force values checkbox is enabled
    if (this.showForceValuesProperty.get()) {
      const forceValue = this.getFormattedForce();
      const units = this.units;
      return StringUtils.fillIn(vectorChangeForcesNowValuePatternString, {
        vectorChangeClause: vectorChangeClause,
        forceValue: forceValue,
        units: units
      });
    } else {
      // Make the vectorChangeClause into a sentence.
      return StringUtils.fillIn(vectorChangeSentencePatternString, {
        vectorChange: vectorChangeClause
      });
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
  getVectorChangeClause(forceBiggerOverride, capitalize) {
    const directionChange = this.getChangeDirection(forceBiggerOverride);
    if (!this.showForceValuesProperty.value) {
      return StringUtils.fillIn(capitalize ? this.vectorChangeCapitalizedClausePatternString : this.vectorChangeClausePatternString, {
        changeDirection: directionChange
      });
    }
    return StringUtils.fillIn(capitalize ? this.vectorChangeCapitalizedForcesNowClausePatternString : this.vectorChangeForcesNowClausePatternString, {
      changeDirection: directionChange,
      forceValue: this.getFormattedForce(),
      units: this.units
    });
  }

  /**
   * Returns the qualitiative amount of pull/push the robots are currently exerting. This uses the same range as
   * the force vector (or "arrow" in GFLB) size regions.
   *
   * @returns {string}
   * @private
   */
  getRobotEffort() {
    return PULL_EFFORT_STINGS[this.getForceVectorIndex(this.forceProperty.get(), PULL_EFFORT_STINGS.length)];
  }

  /**
   * Returns the qualitative size of force vectors.
   *
   * @returns {string}
   * @private
   */
  getVectorSize() {
    return SIZE_STRINGS[this.getForceVectorIndex(this.forceProperty.get(), SIZE_STRINGS.length)];
  }

  /**
   * Returns the appropriate changed direction for the vectors ('get bigger/smaller'), if no change, null is returned.
   *
   * @param {boolean} forceBiggerOverride - when true, just return the "get bigger" string.
   * @returns {string}
   * @private
   */
  getChangeDirection(forceBiggerOverride) {
    const index = forceBiggerOverride ? 2 : this.vectorChangeDirection + 1;
    assert && assert(CHANGE_DIRECTIONS[index] !== null, 'Alert should not be called if no change in direction');
    return CHANGE_DIRECTIONS[index];
  }

  /**
   * Alert text for when ISLCObject position does not change even though there was a drag.
   * @param {ISLCObject} object - the ISLCObject that was interacted with but didn't change position
   * @public
   * @returns {string}
   */
  getPositionUnchangedAlertText(object) {
    // if not showing force values, this is the force clause
    let forceClause = StringUtils.fillIn(this.vectorsSizeClausePatternString, {
      size: this.getVectorSize()
    });
    if (this.showForceValuesProperty.get()) {
      const forceValuesClause = StringUtils.fillIn(forcesValueUnitsClausePatternString, {
        forceValue: this.getFormattedForce(),
        units: this.units
      });
      forceClause = StringUtils.fillIn(vectorForceClausePatternString, {
        vectorClause: forceClause,
        // in GFLB this has nothing to do with "vectors" but instead "force arrows"
        forceValuesClause: forceValuesClause
      });
    }
    return StringUtils.fillIn(regionForceClausePatternString, {
      otherObjectLabel: this.getOtherObjectLabelFromEnum(object.enum),
      relativeDistance: this.positionDescriber.getCapitalizedQualitativeRelativeDistanceRegion(),
      forceClause: forceClause
    });
  }

  /**
   *
   * @param {number} forceValue
   * @param {number} mantissaDecimalPlaces
   * @returns {number}
   * @public
   */
  static getForceInScientificNotation(forceValue, mantissaDecimalPlaces) {
    return getScientificNotationTextFromPattern(forceValue, mantissaDecimalPlaces, scientificNotationPatternString);
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
  getForceVectorIndex(force, numberOfRegions) {
    throw new Error('getForceVectorIndex MUST be implemented in subtypes.');
  }
}

/**
 * Convert a number into scientific notation. The pattern expects a {{mantissa}} and {{exponent}} variables
 * @param {number} forceValue
 * @param {number} mantissaDecimalPlaces
 * @param {string} pattern
 * @returns {string}
 */
const getScientificNotationTextFromPattern = (forceValue, mantissaDecimalPlaces, pattern) => {
  const {
    mantissa,
    exponent
  } = ScientificNotationNode.toScientificNotation(forceValue, {
    mantissaDecimalPlaces: mantissaDecimalPlaces
  });
  const mantissaPattern = mantissa < 0 ? negativeValuePatternString : valuePatternString; // negative values are possible in Coulomb's Law
  const mantissaString = StringUtils.fillIn(mantissaPattern, {
    value: Math.abs(mantissa)
  });
  const exponentPattern = exponent < 0 ? negativeValuePatternString : valuePatternString;
  const exponentString = StringUtils.fillIn(exponentPattern, {
    value: Math.abs(exponent)
  });
  return StringUtils.fillIn(pattern, {
    mantissa: mantissaString,
    exponent: exponentString
  });
};
inverseSquareLawCommon.register('ForceDescriber', ForceDescriber);
export default ForceDescriber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlN0cmluZ1V0aWxzIiwiU2NpZW50aWZpY05vdGF0aW9uTm9kZSIsImludmVyc2VTcXVhcmVMYXdDb21tb24iLCJJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncyIsIkZvcmNlVmFsdWVzRGlzcGxheUVudW0iLCJJU0xDRGVzY3JpYmVyIiwidW5pdHNOZXd0b25zU3RyaW5nIiwidW5pdHMiLCJuZXd0b25zIiwiZm9yY2VWZWN0b3JBcnJvd3NTdHJpbmciLCJhMTF5Iiwic2NyZWVuU3VtbWFyeSIsImZvcmNlVmVjdG9yQXJyb3dzIiwic3VtbWFyeVZlY3RvclNpemVQYXR0ZXJuU3RyaW5nIiwic3VtbWFyeVZlY3RvclNpemVQYXR0ZXJuIiwic3VtbWFyeVZlY3RvclNpemVWYWx1ZVVuaXRzUGF0dGVyblN0cmluZyIsInN1bW1hcnlWZWN0b3JTaXplVmFsdWVVbml0c1BhdHRlcm4iLCJmb3JjZVZlY3Rvck1hZ25pdHVkZVVuaXRzUGF0dGVyblN0cmluZyIsInNwaGVyZSIsImZvcmNlVmVjdG9yTWFnbml0dWRlVW5pdHNQYXR0ZXJuIiwiZm9yY2VBbmRWZWN0b3JQYXR0ZXJuU3RyaW5nIiwiZm9yY2VBbmRWZWN0b3JQYXR0ZXJuIiwiZm9yY2VWZWN0b3JTaXplUGF0dGVyblN0cmluZyIsImZvcmNlVmVjdG9yU2l6ZVBhdHRlcm4iLCJyb2JvdFB1bGxTdW1tYXJ5UGF0dGVyblN0cmluZyIsInJvYm90UHVsbFN1bW1hcnlQYXR0ZXJuIiwicm9ib3RQdXNoU3VtbWFyeVBhdHRlcm5TdHJpbmciLCJyb2JvdFB1c2hTdW1tYXJ5UGF0dGVybiIsInZlY3RvcnNTdHJpbmciLCJhbGVydHMiLCJ2ZWN0b3JzIiwidmVjdG9yc1NpemVDbGF1c2VQYXR0ZXJuU3RyaW5nIiwidmVjdG9yc1NpemVDbGF1c2VQYXR0ZXJuIiwiZm9yY2VzVmFsdWVVbml0c0NsYXVzZVBhdHRlcm5TdHJpbmciLCJmb3JjZXNWYWx1ZVVuaXRzQ2xhdXNlUGF0dGVybiIsImZvcmNlTWFnbml0dWRlU3RyaW5nIiwiZm9yY2VNYWduaXR1ZGUiLCJmb3JjZVZlY3RvckNhcGl0YWxpemVkU3RyaW5nIiwiZm9yY2VWZWN0b3JDYXBpdGFsaXplZCIsImZvcmNlVmVjdG9yc1NpemVQYXR0ZXJuU3RyaW5nIiwiZm9yY2VWZWN0b3JzU2l6ZVBhdHRlcm4iLCJ2YWx1ZXNJblVuaXRzUGF0dGVyblN0cmluZyIsInZhbHVlc0luVW5pdHNQYXR0ZXJuIiwiZm9yY2VzSW5TY2llbnRpZmljTm90YXRpb25TdHJpbmciLCJmb3JjZXNJblNjaWVudGlmaWNOb3RhdGlvbiIsInZlY3RvckNoYW5nZVBhdHRlcm5TdHJpbmciLCJ2ZWN0b3JDaGFuZ2VQYXR0ZXJuIiwidmVjdG9yc0NhcGl0YWxpemVkU3RyaW5nIiwidmVjdG9yc0NhcGl0YWxpemVkIiwidmVjdG9yQ2hhbmdlRm9yY2VzTm93VmFsdWVQYXR0ZXJuU3RyaW5nIiwidmVjdG9yQ2hhbmdlRm9yY2VzTm93VmFsdWVQYXR0ZXJuIiwidmVjdG9yQ2hhbmdlU2VudGVuY2VQYXR0ZXJuU3RyaW5nIiwidmVjdG9yQ2hhbmdlU2VudGVuY2VQYXR0ZXJuIiwidmVjdG9yQ2hhbmdlQ2xhdXNlUGF0dGVyblN0cmluZyIsInZlY3RvckNoYW5nZUNsYXVzZVBhdHRlcm4iLCJ2ZWN0b3JDaGFuZ2VGb3JjZXNOb3dDbGF1c2VQYXR0ZXJuU3RyaW5nIiwidmVjdG9yQ2hhbmdlRm9yY2VzTm93Q2xhdXNlUGF0dGVybiIsInZlY3RvckZvcmNlQ2xhdXNlUGF0dGVyblN0cmluZyIsInZlY3RvckZvcmNlQ2xhdXNlUGF0dGVybiIsInJlZ2lvbkZvcmNlQ2xhdXNlUGF0dGVyblN0cmluZyIsInJlZ2lvbkZvcmNlQ2xhdXNlUGF0dGVybiIsInRpbnlTdHJpbmciLCJxdWFsaXRhdGl2ZSIsInRpbnkiLCJ2ZXJ5U21hbGxTdHJpbmciLCJ2ZXJ5U21hbGwiLCJzbWFsbFN0cmluZyIsInNtYWxsIiwibWVkaXVtU2l6ZVN0cmluZyIsIm1lZGl1bVNpemUiLCJsYXJnZVN0cmluZyIsImxhcmdlIiwidmVyeUxhcmdlU3RyaW5nIiwidmVyeUxhcmdlIiwiaHVnZVN0cmluZyIsImh1Z2UiLCJnZXRCaWdnZXJTdHJpbmciLCJnZXRCaWdnZXIiLCJnZXRTbWFsbGVyU3RyaW5nIiwiZ2V0U21hbGxlciIsInZlcnlIYXJkU3RyaW5nIiwicHVsbGVyRWZmb3J0IiwidmVyeUhhcmQiLCJoYXJkU3RyaW5nIiwiaGFyZCIsIm1vZGVyYXRlbHlTdHJpbmciLCJtb2RlcmF0ZWx5IiwiZ2VudGx5U3RyaW5nIiwiZ2VudGx5IiwibGlnaGx5U3RyaW5nIiwibGlnaHRseSIsImFMaXR0bGVTdHJpbmciLCJhTGl0dGxlIiwiYVRpbnlCaXRTdHJpbmciLCJhVGlueUJpdCIsImZvcmNlRXF1YWxzUGF0dGVyblN0cmluZyIsInZvaWNpbmciLCJsZXZlbHMiLCJmb3JjZUVxdWFsc1BhdHRlcm4iLCJmb3JjZUFycm93U2l6ZVBhdHRlcm5TdHJpbmciLCJmb3JjZUFycm93U2l6ZVBhdHRlcm4iLCJmb3JjZU9uT2JqZWN0c1BhdHRlcm5TdHJpbmciLCJmb3JjZU9uT2JqZWN0c1BhdHRlcm4iLCJTSVpFX1NUUklOR1MiLCJQVUxMX0VGRk9SVF9TVElOR1MiLCJDSEFOR0VfRElSRUNUSU9OUyIsInNjaWVudGlmaWNOb3RhdGlvblBhdHRlcm5TdHJpbmciLCJzY2llbnRpZmljTm90YXRpb25QYXR0ZXJuIiwibmVnYXRpdmVWYWx1ZVBhdHRlcm5TdHJpbmciLCJuZWdhdGl2ZVZhbHVlUGF0dGVybiIsInZhbHVlUGF0dGVyblN0cmluZyIsInZhbHVlUGF0dGVybiIsIkZvcmNlRGVzY3JpYmVyIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsIm9iamVjdDFMYWJlbCIsIm9iamVjdDJMYWJlbCIsInBvc2l0aW9uRGVzY3JpYmVyIiwib3B0aW9ucyIsImNvbnZlcnRGb3JjZSIsIl8iLCJpZGVudGl0eSIsImZvcmNlVmFsdWVUb1N0cmluZyIsInZhbHVlIiwiZmlsbEluIiwiZm9yY2VWZWN0b3JzQ2FwaXRhbGl6ZWRTdHJpbmciLCJmb3JjZVZlY3RvcnNTdHJpbmciLCJmb3JjZVByb3BlcnR5Iiwic2hvd0ZvcmNlVmFsdWVzUHJvcGVydHkiLCJ2ZWN0b3JDaGFuZ2VEaXJlY3Rpb24iLCJmb3JjZVZhbHVlc0Rpc3BsYXlQcm9wZXJ0eSIsInZlY3RvckNoYW5nZUNhcGl0YWxpemVkQ2xhdXNlUGF0dGVyblN0cmluZyIsInZlY3RvckNoYW5nZUNhcGl0YWxpemVkRm9yY2VzTm93Q2xhdXNlUGF0dGVyblN0cmluZyIsImxpbmsiLCJmb3JjZSIsIm9sZEZvcmNlIiwiZm9yY2VEZWx0YSIsIk1hdGgiLCJhYnMiLCJnZXRGb3JtYXR0ZWRGb3JjZSIsImdldCIsImdldEZvcmNlVmVjdG9yc1N1bW1hcnlUZXh0IiwiZmlsbE9iamVjdCIsInBhdHRlcm4iLCJzaXplIiwiZ2V0VmVjdG9yU2l6ZSIsImZvcmNlVmFsdWUiLCJnZXRGb3JjZVZlY3Rvck1hZ25pdHVkZVRleHQiLCJ0aGlzT2JqZWN0TGFiZWwiLCJvdGhlck9iamVjdExhYmVsIiwiZ2V0Rm9yY2VWZWN0b3JzUmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlIiwicmVzcG9uc2UiLCJvYmplY3QxIiwib2JqZWN0MiIsImdldEZvcmNlVmVjdG9yc1NpemUiLCJmb3JjZVZlY3RvcnMiLCJnZXRGb3JjZUJldHdlZW5BbmRWZWN0b3JUZXh0IiwiZm9yY2VWZWN0b3JTaXplIiwiZm9yY2VWZWN0b3IiLCJnZXRSb2JvdEVmZm9ydFN1bW1hcnlUZXh0IiwiZWZmb3J0IiwiZ2V0Um9ib3RFZmZvcnQiLCJnZXRTY2llbnRpZmljTm90YXRpb25BbGVydFRleHQiLCJhc3NlcnQiLCJTQ0lFTlRJRklDIiwiZ2V0VmFsdWVzSW5Vbml0c1RleHQiLCJnZXRWZWN0b3JDaGFuZ2VUZXh0Iiwib2JqZWN0IiwiYWx3YXlzSW5jbHVkZVByb2dyZXNzQ2xhdXNlIiwiY2hhbmdlRGlyZWN0aW9uIiwiZ2V0Q2hhbmdlRGlyZWN0aW9uIiwicG9zaXRpb25PckxhbmRtYXJrIiwiZ2V0UG9zaXRpb25Qcm9ncmVzc09yTGFuZG1hcmtDbGF1c2UiLCJ2ZWN0b3JDaGFuZ2VDbGF1c2UiLCJwb3NpdGlvblByb2dyZXNzT3JMYW5kbWFya0NsYXVzZSIsInZlY3RvckNoYW5nZSIsImdldFZlY3RvckNoYW5nZUNsYXVzZSIsImZvcmNlQmlnZ2VyT3ZlcnJpZGUiLCJjYXBpdGFsaXplIiwiZGlyZWN0aW9uQ2hhbmdlIiwiZ2V0Rm9yY2VWZWN0b3JJbmRleCIsImxlbmd0aCIsImluZGV4IiwiZ2V0UG9zaXRpb25VbmNoYW5nZWRBbGVydFRleHQiLCJmb3JjZUNsYXVzZSIsImZvcmNlVmFsdWVzQ2xhdXNlIiwidmVjdG9yQ2xhdXNlIiwiZ2V0T3RoZXJPYmplY3RMYWJlbEZyb21FbnVtIiwiZW51bSIsInJlbGF0aXZlRGlzdGFuY2UiLCJnZXRDYXBpdGFsaXplZFF1YWxpdGF0aXZlUmVsYXRpdmVEaXN0YW5jZVJlZ2lvbiIsImdldEZvcmNlSW5TY2llbnRpZmljTm90YXRpb24iLCJtYW50aXNzYURlY2ltYWxQbGFjZXMiLCJnZXRTY2llbnRpZmljTm90YXRpb25UZXh0RnJvbVBhdHRlcm4iLCJudW1iZXJPZlJlZ2lvbnMiLCJFcnJvciIsIm1hbnRpc3NhIiwiZXhwb25lbnQiLCJ0b1NjaWVudGlmaWNOb3RhdGlvbiIsIm1hbnRpc3NhUGF0dGVybiIsIm1hbnRpc3NhU3RyaW5nIiwiZXhwb25lbnRQYXR0ZXJuIiwiZXhwb25lbnRTdHJpbmciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkZvcmNlRGVzY3JpYmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlc3BvbnNpYmxlIGZvciBsb2dpYyBhc3NvY2lhdGVkIHdpdGggdGhlIGZvcm1hdGlvbiBvZiBhdWRpbyBkZXNjcmlwdGlvbiBzdHJpbmdzIHJlbGF0ZWQgdG8gdGhlIG1vZGVsXHJcbiAqIGZvcmNlIGFuZCBpbnRlcmFjdGlvbnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjaGFuZ2VzIGluIGZvcmNlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgTWljaGFlbCBCYXJsb3cgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgU2NpZW50aWZpY05vdGF0aW9uTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU2NpZW50aWZpY05vdGF0aW9uTm9kZS5qcyc7XHJcbmltcG9ydCBpbnZlcnNlU3F1YXJlTGF3Q29tbW9uIGZyb20gJy4uLy4uL2ludmVyc2VTcXVhcmVMYXdDb21tb24uanMnO1xyXG5pbXBvcnQgSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MgZnJvbSAnLi4vLi4vSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgRm9yY2VWYWx1ZXNEaXNwbGF5RW51bSBmcm9tICcuLi8uLi9tb2RlbC9Gb3JjZVZhbHVlc0Rpc3BsYXlFbnVtLmpzJztcclxuaW1wb3J0IElTTENEZXNjcmliZXIgZnJvbSAnLi9JU0xDRGVzY3JpYmVyLmpzJztcclxuXHJcbmNvbnN0IHVuaXRzTmV3dG9uc1N0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLnVuaXRzLm5ld3RvbnM7XHJcbmNvbnN0IGZvcmNlVmVjdG9yQXJyb3dzU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5zY3JlZW5TdW1tYXJ5LmZvcmNlVmVjdG9yQXJyb3dzO1xyXG5jb25zdCBzdW1tYXJ5VmVjdG9yU2l6ZVBhdHRlcm5TdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnNjcmVlblN1bW1hcnkuc3VtbWFyeVZlY3RvclNpemVQYXR0ZXJuO1xyXG5jb25zdCBzdW1tYXJ5VmVjdG9yU2l6ZVZhbHVlVW5pdHNQYXR0ZXJuU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5zY3JlZW5TdW1tYXJ5LnN1bW1hcnlWZWN0b3JTaXplVmFsdWVVbml0c1BhdHRlcm47XHJcbmNvbnN0IGZvcmNlVmVjdG9yTWFnbml0dWRlVW5pdHNQYXR0ZXJuU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5zcGhlcmUuZm9yY2VWZWN0b3JNYWduaXR1ZGVVbml0c1BhdHRlcm47XHJcbmNvbnN0IGZvcmNlQW5kVmVjdG9yUGF0dGVyblN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkuc3BoZXJlLmZvcmNlQW5kVmVjdG9yUGF0dGVybjtcclxuY29uc3QgZm9yY2VWZWN0b3JTaXplUGF0dGVyblN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkuc3BoZXJlLmZvcmNlVmVjdG9yU2l6ZVBhdHRlcm47XHJcbmNvbnN0IHJvYm90UHVsbFN1bW1hcnlQYXR0ZXJuU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5zY3JlZW5TdW1tYXJ5LnJvYm90UHVsbFN1bW1hcnlQYXR0ZXJuO1xyXG5jb25zdCByb2JvdFB1c2hTdW1tYXJ5UGF0dGVyblN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkuc2NyZWVuU3VtbWFyeS5yb2JvdFB1c2hTdW1tYXJ5UGF0dGVybjtcclxuY29uc3QgdmVjdG9yc1N0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkuYWxlcnRzLnZlY3RvcnM7XHJcbmNvbnN0IHZlY3RvcnNTaXplQ2xhdXNlUGF0dGVyblN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkuYWxlcnRzLnZlY3RvcnNTaXplQ2xhdXNlUGF0dGVybjtcclxuY29uc3QgZm9yY2VzVmFsdWVVbml0c0NsYXVzZVBhdHRlcm5TdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LmFsZXJ0cy5mb3JjZXNWYWx1ZVVuaXRzQ2xhdXNlUGF0dGVybjtcclxuY29uc3QgZm9yY2VNYWduaXR1ZGVTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnNwaGVyZS5mb3JjZU1hZ25pdHVkZTtcclxuY29uc3QgZm9yY2VWZWN0b3JDYXBpdGFsaXplZFN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkuc3BoZXJlLmZvcmNlVmVjdG9yQ2FwaXRhbGl6ZWQ7XHJcbmNvbnN0IGZvcmNlVmVjdG9yc1NpemVQYXR0ZXJuU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5zcGhlcmUuZm9yY2VWZWN0b3JzU2l6ZVBhdHRlcm47XHJcblxyXG5jb25zdCB2YWx1ZXNJblVuaXRzUGF0dGVyblN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkudmFsdWVzSW5Vbml0c1BhdHRlcm47XHJcbmNvbnN0IGZvcmNlc0luU2NpZW50aWZpY05vdGF0aW9uU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5mb3JjZXNJblNjaWVudGlmaWNOb3RhdGlvbjtcclxuXHJcbmNvbnN0IHZlY3RvckNoYW5nZVBhdHRlcm5TdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LmFsZXJ0cy52ZWN0b3JDaGFuZ2VQYXR0ZXJuO1xyXG5jb25zdCB2ZWN0b3JzQ2FwaXRhbGl6ZWRTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LmFsZXJ0cy52ZWN0b3JzQ2FwaXRhbGl6ZWQ7XHJcbmNvbnN0IHZlY3RvckNoYW5nZUZvcmNlc05vd1ZhbHVlUGF0dGVyblN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkuYWxlcnRzLnZlY3RvckNoYW5nZUZvcmNlc05vd1ZhbHVlUGF0dGVybjtcclxuY29uc3QgdmVjdG9yQ2hhbmdlU2VudGVuY2VQYXR0ZXJuU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5hbGVydHMudmVjdG9yQ2hhbmdlU2VudGVuY2VQYXR0ZXJuO1xyXG5jb25zdCB2ZWN0b3JDaGFuZ2VDbGF1c2VQYXR0ZXJuU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5hbGVydHMudmVjdG9yQ2hhbmdlQ2xhdXNlUGF0dGVybjtcclxuY29uc3QgdmVjdG9yQ2hhbmdlRm9yY2VzTm93Q2xhdXNlUGF0dGVyblN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkuYWxlcnRzLnZlY3RvckNoYW5nZUZvcmNlc05vd0NsYXVzZVBhdHRlcm47XHJcbmNvbnN0IHZlY3RvckZvcmNlQ2xhdXNlUGF0dGVyblN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkudmVjdG9yRm9yY2VDbGF1c2VQYXR0ZXJuO1xyXG5jb25zdCByZWdpb25Gb3JjZUNsYXVzZVBhdHRlcm5TdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnJlZ2lvbkZvcmNlQ2xhdXNlUGF0dGVybjtcclxuXHJcbmNvbnN0IHRpbnlTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnF1YWxpdGF0aXZlLnRpbnk7XHJcbmNvbnN0IHZlcnlTbWFsbFN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkucXVhbGl0YXRpdmUudmVyeVNtYWxsO1xyXG5jb25zdCBzbWFsbFN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkucXVhbGl0YXRpdmUuc21hbGw7XHJcbmNvbnN0IG1lZGl1bVNpemVTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnF1YWxpdGF0aXZlLm1lZGl1bVNpemU7XHJcbmNvbnN0IGxhcmdlU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5xdWFsaXRhdGl2ZS5sYXJnZTtcclxuY29uc3QgdmVyeUxhcmdlU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5xdWFsaXRhdGl2ZS52ZXJ5TGFyZ2U7XHJcbmNvbnN0IGh1Z2VTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnF1YWxpdGF0aXZlLmh1Z2U7XHJcblxyXG5jb25zdCBnZXRCaWdnZXJTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnF1YWxpdGF0aXZlLmdldEJpZ2dlcjtcclxuY29uc3QgZ2V0U21hbGxlclN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkucXVhbGl0YXRpdmUuZ2V0U21hbGxlcjtcclxuXHJcbmNvbnN0IHZlcnlIYXJkU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5wdWxsZXJFZmZvcnQudmVyeUhhcmQ7XHJcbmNvbnN0IGhhcmRTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnB1bGxlckVmZm9ydC5oYXJkO1xyXG5jb25zdCBtb2RlcmF0ZWx5U3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5wdWxsZXJFZmZvcnQubW9kZXJhdGVseTtcclxuY29uc3QgZ2VudGx5U3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5wdWxsZXJFZmZvcnQuZ2VudGx5O1xyXG5jb25zdCBsaWdobHlTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnB1bGxlckVmZm9ydC5saWdodGx5O1xyXG5jb25zdCBhTGl0dGxlU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5wdWxsZXJFZmZvcnQuYUxpdHRsZTtcclxuY29uc3QgYVRpbnlCaXRTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnB1bGxlckVmZm9ydC5hVGlueUJpdDtcclxuXHJcbmNvbnN0IGZvcmNlRXF1YWxzUGF0dGVyblN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkudm9pY2luZy5sZXZlbHMuZm9yY2VFcXVhbHNQYXR0ZXJuO1xyXG5jb25zdCBmb3JjZUFycm93U2l6ZVBhdHRlcm5TdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnZvaWNpbmcubGV2ZWxzLmZvcmNlQXJyb3dTaXplUGF0dGVybjtcclxuY29uc3QgZm9yY2VPbk9iamVjdHNQYXR0ZXJuU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS52b2ljaW5nLmxldmVscy5mb3JjZU9uT2JqZWN0c1BhdHRlcm47XHJcblxyXG5jb25zdCBTSVpFX1NUUklOR1MgPSBbXHJcbiAgdGlueVN0cmluZyxcclxuICB2ZXJ5U21hbGxTdHJpbmcsXHJcbiAgc21hbGxTdHJpbmcsXHJcbiAgbWVkaXVtU2l6ZVN0cmluZyxcclxuICBsYXJnZVN0cmluZyxcclxuICB2ZXJ5TGFyZ2VTdHJpbmcsXHJcbiAgaHVnZVN0cmluZ1xyXG5dO1xyXG5jb25zdCBQVUxMX0VGRk9SVF9TVElOR1MgPSBbXHJcbiAgYVRpbnlCaXRTdHJpbmcsXHJcbiAgYUxpdHRsZVN0cmluZyxcclxuICBsaWdobHlTdHJpbmcsXHJcbiAgZ2VudGx5U3RyaW5nLFxyXG4gIG1vZGVyYXRlbHlTdHJpbmcsXHJcbiAgaGFyZFN0cmluZyxcclxuICB2ZXJ5SGFyZFN0cmluZ1xyXG5dO1xyXG5jb25zdCBDSEFOR0VfRElSRUNUSU9OUyA9IFsgZ2V0U21hbGxlclN0cmluZywgbnVsbCwgZ2V0QmlnZ2VyU3RyaW5nIF07XHJcblxyXG4vLyBzY2llbnRpZmljIG5vdGF0aW9uXHJcbmNvbnN0IHNjaWVudGlmaWNOb3RhdGlvblBhdHRlcm5TdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnNjaWVudGlmaWNOb3RhdGlvblBhdHRlcm47XHJcbmNvbnN0IG5lZ2F0aXZlVmFsdWVQYXR0ZXJuU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5uZWdhdGl2ZVZhbHVlUGF0dGVybjtcclxuY29uc3QgdmFsdWVQYXR0ZXJuU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS52YWx1ZVBhdHRlcm47XHJcblxyXG5jbGFzcyBGb3JjZURlc2NyaWJlciBleHRlbmRzIElTTENEZXNjcmliZXIge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0lTTENNb2RlbH0gbW9kZWwgLSBzdXBwb3J0cyBzdWJ0eXBlcyB3aXRoIGZvcmNlVmFsdWVzRGlzcGxheVByb3BlcnR5IGdyYWNlZnVsbHlcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gb2JqZWN0MUxhYmVsXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9iamVjdDJMYWJlbFxyXG4gICAqIEBwYXJhbSB7UG9zaXRpb25EZXNjcmliZXJ9IHBvc2l0aW9uRGVzY3JpYmVyXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgb2JqZWN0MUxhYmVsLCBvYmplY3QyTGFiZWwsIHBvc2l0aW9uRGVzY3JpYmVyLCBvcHRpb25zICkge1xyXG4gICAgc3VwZXIoIG1vZGVsLCBvYmplY3QxTGFiZWwsIG9iamVjdDJMYWJlbCApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICB1bml0czogdW5pdHNOZXd0b25zU3RyaW5nLFxyXG5cclxuICAgICAgLy8gaW4gc29tZSBzY2VuYXJpb3MsIHRoZSBmb3JjZSB1bml0cyBjaGFuZ2UuIGNvbnZlcnRGb3JjZSBhbGxvd3Mgc3VidHlwZXMgdG8gZGVmaW5lIGNvbnZlcnNpb24gYmVoYXZpb3JcclxuICAgICAgLy8gaW50ZWdyYXRlcyB3aXRoIGZvcmNlVmFsdWVUb1N0cmluZyBmb3IgbmVjZXNzYXJ5IGNvbnZlcnNpb25zIChlLmcuIDMwMDAwMDAwMCAtPiAzKVxyXG4gICAgICAvLyBhbHdheXMgdGFrZXMgcGxhY2UgYmVmb3JlIGZvcmNlVmFsdWVUb1N0cmluZ1xyXG4gICAgICBjb252ZXJ0Rm9yY2U6IF8uaWRlbnRpdHksXHJcblxyXG4gICAgICAvLyBmb3IgYWRkaW5nIG5hdHVyYWwgbGFuZ3VhZ2UgdG8gdGhlIGZvcmNlIChlLmcuICczIGJpbGxpb24nIGluc3RlYWQgb2YgMzAwMDAwMDAwMClcclxuICAgICAgZm9yY2VWYWx1ZVRvU3RyaW5nOiB2YWx1ZSA9PiBTdHJpbmdVdGlscy5maWxsSW4oIHZhbHVlUGF0dGVyblN0cmluZywgeyB2YWx1ZTogdmFsdWUgfSApLFxyXG5cclxuICAgICAgLy8ge3N0cmluZ30gLSBhbGwgb3B0aW9ucyBiZWxvdyB1c2VkIGZvciBzaW1wbGlmaWNhdGlvbiBpbiBHRkxCXHJcbiAgICAgIGZvcmNlVmVjdG9yc0NhcGl0YWxpemVkU3RyaW5nOiBmb3JjZVZlY3RvckFycm93c1N0cmluZyxcclxuXHJcbiAgICAgIC8vIEluIEdGTCwgd2UgbGlrZSBcInZlY3RvclwiIGJ1dCBpbiBHRkxCIHByZWZlciBcImFycm93XCIsIHNlZSB1c2FnZXMgYmVsb3cgYXMgd2VsbCBhcyBHRkxCRm9yY2VEZXNjcmliZXJcclxuICAgICAgZm9yY2VWZWN0b3JzU3RyaW5nOiB2ZWN0b3JzU3RyaW5nLFxyXG4gICAgICB2ZWN0b3JzU3RyaW5nOiB2ZWN0b3JzU3RyaW5nLFxyXG4gICAgICB2ZWN0b3JzQ2FwaXRhbGl6ZWRTdHJpbmc6IHZlY3RvcnNDYXBpdGFsaXplZFN0cmluZyxcclxuICAgICAgZm9yY2VWZWN0b3JDYXBpdGFsaXplZFN0cmluZzogZm9yY2VWZWN0b3JDYXBpdGFsaXplZFN0cmluZyxcclxuICAgICAgZm9yY2VNYWduaXR1ZGVTdHJpbmc6IGZvcmNlTWFnbml0dWRlU3RyaW5nXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMucG9zaXRpb25EZXNjcmliZXIgPSBwb3NpdGlvbkRlc2NyaWJlcjtcclxuICAgIHRoaXMuZm9yY2VQcm9wZXJ0eSA9IG1vZGVsLmZvcmNlUHJvcGVydHk7XHJcbiAgICB0aGlzLnNob3dGb3JjZVZhbHVlc1Byb3BlcnR5ID0gbW9kZWwuc2hvd0ZvcmNlVmFsdWVzUHJvcGVydHk7XHJcbiAgICB0aGlzLnVuaXRzID0gb3B0aW9ucy51bml0cztcclxuICAgIHRoaXMuZm9yY2VWYWx1ZVRvU3RyaW5nID0gb3B0aW9ucy5mb3JjZVZhbHVlVG9TdHJpbmc7XHJcbiAgICB0aGlzLmNvbnZlcnRGb3JjZSA9IG9wdGlvbnMuY29udmVydEZvcmNlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnZlY3RvckNoYW5nZURpcmVjdGlvbiA9IDA7IC8vIHtudW1iZXJ9IC0gLy8gMSAtPiBncm93aW5nLCAwIC0+IG5vIGNoYW5nZSwgLTEgLT4gc2hyaW5raW5nXHJcbiAgICB0aGlzLmZvcmNlVmVjdG9yc1N0cmluZyA9IG9wdGlvbnMuZm9yY2VWZWN0b3JzU3RyaW5nOyAvLyB7c3RyaW5nfVxyXG4gICAgdGhpcy52ZWN0b3JzQ2FwaXRhbGl6ZWRTdHJpbmcgPSBvcHRpb25zLnZlY3RvcnNDYXBpdGFsaXplZFN0cmluZzsgLy8ge3N0cmluZ31cclxuICAgIHRoaXMuZm9yY2VWZWN0b3JDYXBpdGFsaXplZFN0cmluZyA9IG9wdGlvbnMuZm9yY2VWZWN0b3JDYXBpdGFsaXplZFN0cmluZzsgLy8ge3N0cmluZ31cclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkXHJcbiAgICB0aGlzLmZvcmNlVmFsdWVzRGlzcGxheVByb3BlcnR5ID0gbW9kZWwuZm9yY2VWYWx1ZXNEaXNwbGF5UHJvcGVydHkgfHwgbnVsbDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHRoZXNlIHN0cmluZyBwYXR0ZXJucyBjYW4gdmFyeSBiYXNlZCBvbiBvcHRpb25zXHJcbiAgICB0aGlzLnN1bW1hcnlWZWN0b3JTaXplUGF0dGVyblN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc3VtbWFyeVZlY3RvclNpemVQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIGZvcmNlVmVjdG9yQXJyb3dzOiBvcHRpb25zLmZvcmNlVmVjdG9yc0NhcGl0YWxpemVkU3RyaW5nXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnN1bW1hcnlWZWN0b3JTaXplVmFsdWVVbml0c1BhdHRlcm5TdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIHN1bW1hcnlWZWN0b3JTaXplVmFsdWVVbml0c1BhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgZm9yY2VWZWN0b3JBcnJvd3M6IG9wdGlvbnMuZm9yY2VWZWN0b3JzQ2FwaXRhbGl6ZWRTdHJpbmdcclxuICAgIH0gKTtcclxuICAgIHRoaXMudmVjdG9yc1NpemVDbGF1c2VQYXR0ZXJuU3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCB2ZWN0b3JzU2l6ZUNsYXVzZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgdmVjdG9yczogb3B0aW9ucy5mb3JjZVZlY3RvcnNTdHJpbmdcclxuICAgIH0gKTtcclxuICAgIHRoaXMudmVjdG9yQ2hhbmdlQ2xhdXNlUGF0dGVyblN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggdmVjdG9yQ2hhbmdlQ2xhdXNlUGF0dGVyblN0cmluZywge1xyXG4gICAgICB2ZWN0b3JzOiBvcHRpb25zLmZvcmNlVmVjdG9yc1N0cmluZ1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy52ZWN0b3JDaGFuZ2VDYXBpdGFsaXplZENsYXVzZVBhdHRlcm5TdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIHZlY3RvckNoYW5nZUNsYXVzZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgdmVjdG9yczogb3B0aW9ucy5mb3JjZVZlY3RvcnNDYXBpdGFsaXplZFN0cmluZ1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy52ZWN0b3JDaGFuZ2VGb3JjZXNOb3dDbGF1c2VQYXR0ZXJuU3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCB2ZWN0b3JDaGFuZ2VGb3JjZXNOb3dDbGF1c2VQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIHZlY3RvcnM6IG9wdGlvbnMuZm9yY2VWZWN0b3JzU3RyaW5nXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnZlY3RvckNoYW5nZUNhcGl0YWxpemVkRm9yY2VzTm93Q2xhdXNlUGF0dGVyblN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggdmVjdG9yQ2hhbmdlRm9yY2VzTm93Q2xhdXNlUGF0dGVyblN0cmluZywge1xyXG4gICAgICB2ZWN0b3JzOiBvcHRpb25zLmZvcmNlVmVjdG9yc0NhcGl0YWxpemVkU3RyaW5nXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmZvcmNlVmVjdG9yTWFnbml0dWRlVW5pdHNQYXR0ZXJuU3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCBmb3JjZVZlY3Rvck1hZ25pdHVkZVVuaXRzUGF0dGVyblN0cmluZywge1xyXG4gICAgICBmb3JjZU1hZ25pdHVkZTogb3B0aW9ucy5mb3JjZU1hZ25pdHVkZVN0cmluZ1xyXG4gICAgfSApO1xyXG5cclxuICAgIG1vZGVsLmZvcmNlUHJvcGVydHkubGluayggKCBmb3JjZSwgb2xkRm9yY2UgKSA9PiB7XHJcbiAgICAgIGNvbnN0IGZvcmNlRGVsdGEgPSBmb3JjZSAtIG9sZEZvcmNlO1xyXG4gICAgICBpZiAoIGZvcmNlRGVsdGEgIT09IDAgKSB7XHJcbiAgICAgICAgdGhpcy52ZWN0b3JDaGFuZ2VEaXJlY3Rpb24gPSBmb3JjZURlbHRhIC8gTWF0aC5hYnMoIGZvcmNlRGVsdGEgKTsgLy8gKzEgb3IgLTFcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLnZlY3RvckNoYW5nZURpcmVjdGlvbiA9IDA7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRGb3JtYXR0ZWRGb3JjZSgpIHtcclxuICAgIHJldHVybiB0aGlzLmZvcmNlVmFsdWVUb1N0cmluZyggdGhpcy5jb252ZXJ0Rm9yY2UoIHRoaXMuZm9yY2VQcm9wZXJ0eS5nZXQoKSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRGb3JjZVZlY3RvcnNTdW1tYXJ5VGV4dCgpIHtcclxuICAgIGNvbnN0IGZpbGxPYmplY3QgPSB7fTtcclxuICAgIGxldCBwYXR0ZXJuID0gdGhpcy5zdW1tYXJ5VmVjdG9yU2l6ZVBhdHRlcm5TdHJpbmc7XHJcblxyXG4gICAgZmlsbE9iamVjdC5zaXplID0gdGhpcy5nZXRWZWN0b3JTaXplKCk7XHJcblxyXG4gICAgaWYgKCB0aGlzLnNob3dGb3JjZVZhbHVlc1Byb3BlcnR5LmdldCgpICkge1xyXG4gICAgICBwYXR0ZXJuID0gdGhpcy5zdW1tYXJ5VmVjdG9yU2l6ZVZhbHVlVW5pdHNQYXR0ZXJuU3RyaW5nO1xyXG4gICAgICBmaWxsT2JqZWN0LmZvcmNlVmFsdWUgPSB0aGlzLmdldEZvcm1hdHRlZEZvcmNlKCk7XHJcbiAgICAgIGZpbGxPYmplY3QudW5pdHMgPSB0aGlzLnVuaXRzO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHBhdHRlcm4sIGZpbGxPYmplY3QgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0aGlzT2JqZWN0TGFiZWxcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gb3RoZXJPYmplY3RMYWJlbFxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldEZvcmNlVmVjdG9yTWFnbml0dWRlVGV4dCggdGhpc09iamVjdExhYmVsLCBvdGhlck9iamVjdExhYmVsICkge1xyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggdGhpcy5mb3JjZVZlY3Rvck1hZ25pdHVkZVVuaXRzUGF0dGVyblN0cmluZywge1xyXG4gICAgICBmb3JjZVZhbHVlOiB0aGlzLmdldEZvcm1hdHRlZEZvcmNlKCksXHJcbiAgICAgIHVuaXRzOiB0aGlzLnVuaXRzLFxyXG4gICAgICB0aGlzT2JqZWN0TGFiZWw6IHRoaXNPYmplY3RMYWJlbCxcclxuICAgICAgb3RoZXJPYmplY3RMYWJlbDogb3RoZXJPYmplY3RMYWJlbFxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgZGVzY3JpcHRpb24gZm9yIHRoZSBmb3JjZSBhcnJvdyBSZWFkaW5nIEJsb2NrLCBkZXNjcmliaW5nIHRoZSBhcnJvdyBhbmQgcmVsYXRpdmUgZm9yY2Ugc2l6ZS5cclxuICAgKiBSZXR1cm5zIHNvbWV0aGluZyBsaWtlXHJcbiAgICogXCJGb3JjZSBvbiBtYXNzIDEgYnkgbWFzczIgZXF1YWxzIDMzLjQgbmV3dG9ucywgZm9yY2UgYXJyb3dzIHRpbnkuXCJcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGhpc09iamVjdExhYmVsXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG90aGVyT2JqZWN0TGFiZWxcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldEZvcmNlVmVjdG9yc1JlYWRpbmdCbG9ja05hbWVSZXNwb25zZSggdGhpc09iamVjdExhYmVsLCBvdGhlck9iamVjdExhYmVsICkge1xyXG4gICAgbGV0IHJlc3BvbnNlID0gbnVsbDtcclxuXHJcbiAgICBpZiAoIHRoaXMuc2hvd0ZvcmNlVmFsdWVzUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHJlc3BvbnNlID0gU3RyaW5nVXRpbHMuZmlsbEluKCBmb3JjZUVxdWFsc1BhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBvYmplY3QxOiB0aGlzT2JqZWN0TGFiZWwsXHJcbiAgICAgICAgb2JqZWN0Mjogb3RoZXJPYmplY3RMYWJlbCxcclxuICAgICAgICB2YWx1ZTogdGhpcy5nZXRGb3JtYXR0ZWRGb3JjZSgpXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXNwb25zZSA9IFN0cmluZ1V0aWxzLmZpbGxJbiggZm9yY2VPbk9iamVjdHNQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgb2JqZWN0MTogdGhpc09iamVjdExhYmVsLFxyXG4gICAgICAgIG9iamVjdDI6IG90aGVyT2JqZWN0TGFiZWxcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIGZvcmNlQXJyb3dTaXplUGF0dGVyblN0cmluZywge1xyXG4gICAgICByZXNwb25zZTogcmVzcG9uc2UsXHJcbiAgICAgIHNpemU6IHRoaXMuZ2V0VmVjdG9yU2l6ZSgpXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHNpemUgb2YgdGhlIHZlY3RvcnMgY2xhdXNlLiBSZXR1cm5zIHNvbWV0aGluZyBsaWtlXHJcbiAgICogXCJGb3JjZSBhcnJvdyBpcyB0aW55XCJcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldEZvcmNlVmVjdG9yc1NpemUoKSB7XHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBmb3JjZVZlY3RvcnNTaXplUGF0dGVyblN0cmluZywge1xyXG4gICAgICBzaXplOiB0aGlzLmdldFZlY3RvclNpemUoKSxcclxuICAgICAgZm9yY2VWZWN0b3JzOiB0aGlzLmZvcmNlVmVjdG9yc1N0cmluZ1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRoaXNPYmplY3RMYWJlbFxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvdGhlck9iamVjdExhYmVsXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0Rm9yY2VCZXR3ZWVuQW5kVmVjdG9yVGV4dCggdGhpc09iamVjdExhYmVsLCBvdGhlck9iamVjdExhYmVsICkge1xyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggZm9yY2VBbmRWZWN0b3JQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIHRoaXNPYmplY3RMYWJlbDogdGhpc09iamVjdExhYmVsLFxyXG4gICAgICBvdGhlck9iamVjdExhYmVsOiBvdGhlck9iamVjdExhYmVsLFxyXG4gICAgICBmb3JjZVZlY3RvclNpemU6IFN0cmluZ1V0aWxzLmZpbGxJbiggZm9yY2VWZWN0b3JTaXplUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIHNpemU6IHRoaXMuZ2V0VmVjdG9yU2l6ZSgpLFxyXG4gICAgICAgIGZvcmNlVmVjdG9yOiB0aGlzLmZvcmNlVmVjdG9yQ2FwaXRhbGl6ZWRTdHJpbmdcclxuICAgICAgfSApXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRSb2JvdEVmZm9ydFN1bW1hcnlUZXh0KCkge1xyXG4gICAgY29uc3QgcGF0dGVybiA9IHRoaXMuZm9yY2VQcm9wZXJ0eS5nZXQoKSA8IDAgP1xyXG4gICAgICAgICAgICAgICAgICAgIHJvYm90UHVzaFN1bW1hcnlQYXR0ZXJuU3RyaW5nIDpcclxuICAgICAgICAgICAgICAgICAgICByb2JvdFB1bGxTdW1tYXJ5UGF0dGVyblN0cmluZztcclxuICAgIGNvbnN0IGVmZm9ydCA9IHRoaXMuZ2V0Um9ib3RFZmZvcnQoKTtcclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHBhdHRlcm4sIHsgZWZmb3J0OiBlZmZvcnQgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0cmlldmVzIHRoZSBzdHJpbmcgdG8gYmUgcmVuZGVyZWQgaW4gYW4gYXJpYS1saXZlIHJlZ2lvbiB3aGVuIHRoZSBTY2llbnRpZmljIE5vdGF0aW9uIGNoZWNrYm94IGlzIGFsdGVyZWQuXHJcbiAgICogT25lIG9mIHRoZSBmb2xsb3dpbmc6XHJcbiAgICogICAgJ1ZhbHVlcyBpbiB7e3RoaXMudW5pdHN9fS4nXHJcbiAgICogICAgJ1ZhbHVlcyBpbiBuZXd0b25zIHdpdGggc2NpZW50aWZpYyBub3RhdGlvbi4nXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRTY2llbnRpZmljTm90YXRpb25BbGVydFRleHQoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmZvcmNlVmFsdWVzRGlzcGxheVByb3BlcnR5LCAnZm9yY2VWYWx1ZXNEaXNwbGF5UHJvcGVydHkgZXhwZWN0ZWQgZm9yIHRoaXMgYWxlcnQnICk7XHJcbiAgICBpZiAoIHRoaXMuZm9yY2VWYWx1ZXNEaXNwbGF5UHJvcGVydHkudmFsdWUgPT09IEZvcmNlVmFsdWVzRGlzcGxheUVudW0uU0NJRU5USUZJQyApIHtcclxuICAgICAgcmV0dXJuIGZvcmNlc0luU2NpZW50aWZpY05vdGF0aW9uU3RyaW5nO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VmFsdWVzSW5Vbml0c1RleHQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGZpbGxlZC1pbiBzdHJpbmcgJ1ZhbHVlcyBpbiB7e3VuaXRzfX0nLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0VmFsdWVzSW5Vbml0c1RleHQoKSB7XHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCB2YWx1ZXNJblVuaXRzUGF0dGVyblN0cmluZywgeyB1bml0czogdGhpcy51bml0cyB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGV4dCB3aGVuIGFuIG9iamVjdCBoYXMgY2hhbmdlZCBwb3NpdGlvbiwgYW5kIHRoZSBmb3JjZSB2YWx1ZSBoYXMgYXMgYSByZXN1bHQuXHJcbiAgICogQHBhcmFtIHtJU0xDT2JqZWN0fSBvYmplY3QgLSB0aGUgb2JqZWN0IHRoYXQgY2hhbmdlZCBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYWx3YXlzSW5jbHVkZVByb2dyZXNzQ2xhdXNlXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0VmVjdG9yQ2hhbmdlVGV4dCggb2JqZWN0LCBhbHdheXNJbmNsdWRlUHJvZ3Jlc3NDbGF1c2UgKSB7XHJcbiAgICBjb25zdCBjaGFuZ2VEaXJlY3Rpb24gPSB0aGlzLmdldENoYW5nZURpcmVjdGlvbigpO1xyXG4gICAgY29uc3QgcG9zaXRpb25PckxhbmRtYXJrID0gdGhpcy5wb3NpdGlvbkRlc2NyaWJlci5nZXRQb3NpdGlvblByb2dyZXNzT3JMYW5kbWFya0NsYXVzZSggb2JqZWN0LCBhbHdheXNJbmNsdWRlUHJvZ3Jlc3NDbGF1c2UgKTtcclxuXHJcbiAgICAvLyBGaWxsIGluIHRoZSBiYXNlIGNsYXVzZSBvZiB0aGUgdmVjdG9yIGNoYW5naW5nLlxyXG4gICAgY29uc3QgdmVjdG9yQ2hhbmdlQ2xhdXNlID0gU3RyaW5nVXRpbHMuZmlsbEluKCB2ZWN0b3JDaGFuZ2VQYXR0ZXJuU3RyaW5nLCB7XHJcblxyXG4gICAgICAvLyBpZiBubyBwb3NpdGlvbiBwcm9ncmVzcywgdGhlbiBjYXBpdGFsaXplIHRoZSBuZXh0IHBpZWNlXHJcbiAgICAgIHZlY3RvcnM6IHBvc2l0aW9uT3JMYW5kbWFyayA/IHRoaXMuZm9yY2VWZWN0b3JzU3RyaW5nIDogdGhpcy52ZWN0b3JzQ2FwaXRhbGl6ZWRTdHJpbmcsXHJcbiAgICAgIHBvc2l0aW9uUHJvZ3Jlc3NPckxhbmRtYXJrQ2xhdXNlOiBwb3NpdGlvbk9yTGFuZG1hcmsgPyBwb3NpdGlvbk9yTGFuZG1hcmsgOiAnJyxcclxuICAgICAgY2hhbmdlRGlyZWN0aW9uOiBjaGFuZ2VEaXJlY3Rpb25cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgaW5mbyBsaWtlIFwiZm9yY2VzIG5vd1wiIG9ubHkgaWYgZm9yY2UgdmFsdWVzIGNoZWNrYm94IGlzIGVuYWJsZWRcclxuICAgIGlmICggdGhpcy5zaG93Rm9yY2VWYWx1ZXNQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgY29uc3QgZm9yY2VWYWx1ZSA9IHRoaXMuZ2V0Rm9ybWF0dGVkRm9yY2UoKTtcclxuICAgICAgY29uc3QgdW5pdHMgPSB0aGlzLnVuaXRzO1xyXG4gICAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCB2ZWN0b3JDaGFuZ2VGb3JjZXNOb3dWYWx1ZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICB2ZWN0b3JDaGFuZ2VDbGF1c2U6IHZlY3RvckNoYW5nZUNsYXVzZSxcclxuICAgICAgICBmb3JjZVZhbHVlOiBmb3JjZVZhbHVlLFxyXG4gICAgICAgIHVuaXRzOiB1bml0c1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIE1ha2UgdGhlIHZlY3RvckNoYW5nZUNsYXVzZSBpbnRvIGEgc2VudGVuY2UuXHJcbiAgICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHZlY3RvckNoYW5nZVNlbnRlbmNlUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIHZlY3RvckNoYW5nZTogdmVjdG9yQ2hhbmdlQ2xhdXNlXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGZpbGxlZC1pbiBzdHJpbmcgJ3ZlY3RvcnMge3tjaGFuZ2VEaXJlY3Rpb259fSwgZm9yY2VzIG5vdyB7e2ZvcmNlVmFsdWV9fSB7e3VuaXRzfX0nIGZvciB1c2UgaW4gbGFyZ2VyXHJcbiAgICogcGF0dGVybiBzdHJpbmdzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBmb3JjZUJpZ2dlck92ZXJyaWRlIC0gbWFudWFsbHkgc3BlY2lmeSB0aGF0IHdlIHdhbnQgdG8gXCJmb3JjZXMgYmlnZ2VyXCIgYWxlcnQsIHNlZVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdyYXZpdHlGb3JjZUxhYkFsZXJ0TWFuYWdlci5hbGVydE1hc3NWYWx1ZUNoYW5nZWQoKVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gY2FwaXRhbGl6ZSAtIGNhcGl0YWxpemUgdGhlIGNsYXVzZVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFZlY3RvckNoYW5nZUNsYXVzZSggZm9yY2VCaWdnZXJPdmVycmlkZSwgY2FwaXRhbGl6ZSApIHtcclxuICAgIGNvbnN0IGRpcmVjdGlvbkNoYW5nZSA9IHRoaXMuZ2V0Q2hhbmdlRGlyZWN0aW9uKCBmb3JjZUJpZ2dlck92ZXJyaWRlICk7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5zaG93Rm9yY2VWYWx1ZXNQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggY2FwaXRhbGl6ZSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmVjdG9yQ2hhbmdlQ2FwaXRhbGl6ZWRDbGF1c2VQYXR0ZXJuU3RyaW5nIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52ZWN0b3JDaGFuZ2VDbGF1c2VQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgY2hhbmdlRGlyZWN0aW9uOiBkaXJlY3Rpb25DaGFuZ2VcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggY2FwaXRhbGl6ZSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZlY3RvckNoYW5nZUNhcGl0YWxpemVkRm9yY2VzTm93Q2xhdXNlUGF0dGVyblN0cmluZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZlY3RvckNoYW5nZUZvcmNlc05vd0NsYXVzZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgY2hhbmdlRGlyZWN0aW9uOiBkaXJlY3Rpb25DaGFuZ2UsXHJcbiAgICAgIGZvcmNlVmFsdWU6IHRoaXMuZ2V0Rm9ybWF0dGVkRm9yY2UoKSxcclxuICAgICAgdW5pdHM6IHRoaXMudW5pdHNcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHF1YWxpdGlhdGl2ZSBhbW91bnQgb2YgcHVsbC9wdXNoIHRoZSByb2JvdHMgYXJlIGN1cnJlbnRseSBleGVydGluZy4gVGhpcyB1c2VzIHRoZSBzYW1lIHJhbmdlIGFzXHJcbiAgICogdGhlIGZvcmNlIHZlY3RvciAob3IgXCJhcnJvd1wiIGluIEdGTEIpIHNpemUgcmVnaW9ucy5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXRSb2JvdEVmZm9ydCgpIHtcclxuICAgIHJldHVybiBQVUxMX0VGRk9SVF9TVElOR1NbIHRoaXMuZ2V0Rm9yY2VWZWN0b3JJbmRleCggdGhpcy5mb3JjZVByb3BlcnR5LmdldCgpLCBQVUxMX0VGRk9SVF9TVElOR1MubGVuZ3RoICkgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHF1YWxpdGF0aXZlIHNpemUgb2YgZm9yY2UgdmVjdG9ycy5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXRWZWN0b3JTaXplKCkge1xyXG4gICAgcmV0dXJuIFNJWkVfU1RSSU5HU1sgdGhpcy5nZXRGb3JjZVZlY3RvckluZGV4KCB0aGlzLmZvcmNlUHJvcGVydHkuZ2V0KCksIFNJWkVfU1RSSU5HUy5sZW5ndGggKSBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgYXBwcm9wcmlhdGUgY2hhbmdlZCBkaXJlY3Rpb24gZm9yIHRoZSB2ZWN0b3JzICgnZ2V0IGJpZ2dlci9zbWFsbGVyJyksIGlmIG5vIGNoYW5nZSwgbnVsbCBpcyByZXR1cm5lZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yY2VCaWdnZXJPdmVycmlkZSAtIHdoZW4gdHJ1ZSwganVzdCByZXR1cm4gdGhlIFwiZ2V0IGJpZ2dlclwiIHN0cmluZy5cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0Q2hhbmdlRGlyZWN0aW9uKCBmb3JjZUJpZ2dlck92ZXJyaWRlICkge1xyXG4gICAgY29uc3QgaW5kZXggPSBmb3JjZUJpZ2dlck92ZXJyaWRlID8gMiA6IHRoaXMudmVjdG9yQ2hhbmdlRGlyZWN0aW9uICsgMTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIENIQU5HRV9ESVJFQ1RJT05TWyBpbmRleCBdICE9PSBudWxsLCAnQWxlcnQgc2hvdWxkIG5vdCBiZSBjYWxsZWQgaWYgbm8gY2hhbmdlIGluIGRpcmVjdGlvbicgKTtcclxuICAgIHJldHVybiBDSEFOR0VfRElSRUNUSU9OU1sgaW5kZXggXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFsZXJ0IHRleHQgZm9yIHdoZW4gSVNMQ09iamVjdCBwb3NpdGlvbiBkb2VzIG5vdCBjaGFuZ2UgZXZlbiB0aG91Z2ggdGhlcmUgd2FzIGEgZHJhZy5cclxuICAgKiBAcGFyYW0ge0lTTENPYmplY3R9IG9iamVjdCAtIHRoZSBJU0xDT2JqZWN0IHRoYXQgd2FzIGludGVyYWN0ZWQgd2l0aCBidXQgZGlkbid0IGNoYW5nZSBwb3NpdGlvblxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldFBvc2l0aW9uVW5jaGFuZ2VkQWxlcnRUZXh0KCBvYmplY3QgKSB7XHJcblxyXG4gICAgLy8gaWYgbm90IHNob3dpbmcgZm9yY2UgdmFsdWVzLCB0aGlzIGlzIHRoZSBmb3JjZSBjbGF1c2VcclxuICAgIGxldCBmb3JjZUNsYXVzZSA9IFN0cmluZ1V0aWxzLmZpbGxJbiggdGhpcy52ZWN0b3JzU2l6ZUNsYXVzZVBhdHRlcm5TdHJpbmcsIHsgc2l6ZTogdGhpcy5nZXRWZWN0b3JTaXplKCkgfSApO1xyXG5cclxuICAgIGlmICggdGhpcy5zaG93Rm9yY2VWYWx1ZXNQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgY29uc3QgZm9yY2VWYWx1ZXNDbGF1c2UgPSBTdHJpbmdVdGlscy5maWxsSW4oIGZvcmNlc1ZhbHVlVW5pdHNDbGF1c2VQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgZm9yY2VWYWx1ZTogdGhpcy5nZXRGb3JtYXR0ZWRGb3JjZSgpLFxyXG4gICAgICAgIHVuaXRzOiB0aGlzLnVuaXRzXHJcbiAgICAgIH0gKTtcclxuICAgICAgZm9yY2VDbGF1c2UgPSBTdHJpbmdVdGlscy5maWxsSW4oIHZlY3RvckZvcmNlQ2xhdXNlUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIHZlY3RvckNsYXVzZTogZm9yY2VDbGF1c2UsIC8vIGluIEdGTEIgdGhpcyBoYXMgbm90aGluZyB0byBkbyB3aXRoIFwidmVjdG9yc1wiIGJ1dCBpbnN0ZWFkIFwiZm9yY2UgYXJyb3dzXCJcclxuICAgICAgICBmb3JjZVZhbHVlc0NsYXVzZTogZm9yY2VWYWx1ZXNDbGF1c2VcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHJlZ2lvbkZvcmNlQ2xhdXNlUGF0dGVyblN0cmluZywge1xyXG4gICAgICBvdGhlck9iamVjdExhYmVsOiB0aGlzLmdldE90aGVyT2JqZWN0TGFiZWxGcm9tRW51bSggb2JqZWN0LmVudW0gKSxcclxuICAgICAgcmVsYXRpdmVEaXN0YW5jZTogdGhpcy5wb3NpdGlvbkRlc2NyaWJlci5nZXRDYXBpdGFsaXplZFF1YWxpdGF0aXZlUmVsYXRpdmVEaXN0YW5jZVJlZ2lvbigpLFxyXG4gICAgICBmb3JjZUNsYXVzZTogZm9yY2VDbGF1c2VcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGZvcmNlVmFsdWVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWFudGlzc2FEZWNpbWFsUGxhY2VzXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RhdGljIGdldEZvcmNlSW5TY2llbnRpZmljTm90YXRpb24oIGZvcmNlVmFsdWUsIG1hbnRpc3NhRGVjaW1hbFBsYWNlcyApIHtcclxuICAgIHJldHVybiBnZXRTY2llbnRpZmljTm90YXRpb25UZXh0RnJvbVBhdHRlcm4oIGZvcmNlVmFsdWUsIG1hbnRpc3NhRGVjaW1hbFBsYWNlcywgc2NpZW50aWZpY05vdGF0aW9uUGF0dGVyblN0cmluZyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbWFwcGVkIGluZGV4IGJhc2VkIG9uIHRoZSBnaXZlbiBmb3JjZSB2YWx1ZS4gRm9yY2UgdmFsdWVzIGluIElTTEMgc2ltcyByYW5nZSBmcm9tIHBpY29uZXd0b25zIHRvXHJcbiAgICogbmV3dG9ucywgc28gaXQncyBuZWNlc3NhcnkgZm9yIHNpbS1zcGVjaWZpYyBzdWJ0eXBlcyB0byBzcGVjaWZ5IHRoaXMgbG9naWMuXHJcbiAgICpcclxuICAgKiBAYWJzdHJhY3RcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGZvcmNlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bWJlck9mUmVnaW9ucyAtIGZvciBjcm9zc2NoZWNrXHJcbiAgICogQHJldHVybnMge251bWJlcn0gLSBpbnRlZ2VyIGluZGV4IHRvIGdldCB2YWx1ZSBmcm9tIFNJWkVfU1RSSU5HU1xyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKi9cclxuICBnZXRGb3JjZVZlY3RvckluZGV4KCBmb3JjZSwgbnVtYmVyT2ZSZWdpb25zICkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnZ2V0Rm9yY2VWZWN0b3JJbmRleCBNVVNUIGJlIGltcGxlbWVudGVkIGluIHN1YnR5cGVzLicgKTtcclxuICB9XHJcblxyXG59XHJcblxyXG4vKipcclxuICogQ29udmVydCBhIG51bWJlciBpbnRvIHNjaWVudGlmaWMgbm90YXRpb24uIFRoZSBwYXR0ZXJuIGV4cGVjdHMgYSB7e21hbnRpc3NhfX0gYW5kIHt7ZXhwb25lbnR9fSB2YXJpYWJsZXNcclxuICogQHBhcmFtIHtudW1iZXJ9IGZvcmNlVmFsdWVcclxuICogQHBhcmFtIHtudW1iZXJ9IG1hbnRpc3NhRGVjaW1hbFBsYWNlc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0dGVyblxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gKi9cclxuY29uc3QgZ2V0U2NpZW50aWZpY05vdGF0aW9uVGV4dEZyb21QYXR0ZXJuID0gKCBmb3JjZVZhbHVlLCBtYW50aXNzYURlY2ltYWxQbGFjZXMsIHBhdHRlcm4gKSA9PiB7XHJcbiAgY29uc3QgeyBtYW50aXNzYSwgZXhwb25lbnQgfSA9IFNjaWVudGlmaWNOb3RhdGlvbk5vZGUudG9TY2llbnRpZmljTm90YXRpb24oIGZvcmNlVmFsdWUsIHsgbWFudGlzc2FEZWNpbWFsUGxhY2VzOiBtYW50aXNzYURlY2ltYWxQbGFjZXMgfSApO1xyXG4gIGNvbnN0IG1hbnRpc3NhUGF0dGVybiA9IG1hbnRpc3NhIDwgMCA/IG5lZ2F0aXZlVmFsdWVQYXR0ZXJuU3RyaW5nIDogdmFsdWVQYXR0ZXJuU3RyaW5nOyAvLyBuZWdhdGl2ZSB2YWx1ZXMgYXJlIHBvc3NpYmxlIGluIENvdWxvbWIncyBMYXdcclxuICBjb25zdCBtYW50aXNzYVN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggbWFudGlzc2FQYXR0ZXJuLCB7IHZhbHVlOiBNYXRoLmFicyggbWFudGlzc2EgKSB9ICk7XHJcbiAgY29uc3QgZXhwb25lbnRQYXR0ZXJuID0gZXhwb25lbnQgPCAwID8gbmVnYXRpdmVWYWx1ZVBhdHRlcm5TdHJpbmcgOiB2YWx1ZVBhdHRlcm5TdHJpbmc7XHJcbiAgY29uc3QgZXhwb25lbnRTdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIGV4cG9uZW50UGF0dGVybiwgeyB2YWx1ZTogTWF0aC5hYnMoIGV4cG9uZW50ICkgfSApO1xyXG4gIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHBhdHRlcm4sIHsgbWFudGlzc2E6IG1hbnRpc3NhU3RyaW5nLCBleHBvbmVudDogZXhwb25lbnRTdHJpbmcgfSApO1xyXG59O1xyXG5cclxuaW52ZXJzZVNxdWFyZUxhd0NvbW1vbi5yZWdpc3RlciggJ0ZvcmNlRGVzY3JpYmVyJywgRm9yY2VEZXNjcmliZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgRm9yY2VEZXNjcmliZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0Msc0JBQXNCLE1BQU0sdURBQXVEO0FBQzFGLE9BQU9DLHNCQUFzQixNQUFNLGlDQUFpQztBQUNwRSxPQUFPQyw2QkFBNkIsTUFBTSx3Q0FBd0M7QUFDbEYsT0FBT0Msc0JBQXNCLE1BQU0sdUNBQXVDO0FBQzFFLE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFFOUMsTUFBTUMsa0JBQWtCLEdBQUdILDZCQUE2QixDQUFDSSxLQUFLLENBQUNDLE9BQU87QUFDdEUsTUFBTUMsdUJBQXVC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