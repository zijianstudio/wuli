// Copyright 2019-2023, University of Colorado Boulder

/**
 * Responsible for logic associated with the formation of audio description strings related to the mass of the
 * ISLCObjects.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Michael Barlow (PhET Interactive Simulations)
 */

import InverseSquareLawCommonStrings from '../../../../inverse-square-law-common/js/InverseSquareLawCommonStrings.js';
import ISLCDescriber from '../../../../inverse-square-law-common/js/view/describers/ISLCDescriber.js';
import ISLCObjectEnum from '../../../../inverse-square-law-common/js/model/ISLCObjectEnum.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import gravityForceLab from '../../gravityForceLab.js';
import GravityForceLabStrings from '../../GravityForceLabStrings.js';

// constants
const mass1AbbreviatedString = GravityForceLabStrings.mass1Abbreviated;
const mass2AbbreviatedString = GravityForceLabStrings.mass2Abbreviated;
const valuePatternString = InverseSquareLawCommonStrings.a11y.valuePattern;
const massValuesAndComparisonSummaryPatternString = GravityForceLabStrings.a11y.screenSummary.massValuesAndComparisonSummaryPattern;
const massAndUnitPatternString = GravityForceLabStrings.a11y.qualitative.massAndUnitPattern;
const objectsRelativeSizePatternString = GravityForceLabStrings.a11y.qualitative.objectsRelativeSizePattern;
const massMaxMinBorderTextWithForceString = GravityForceLabStrings.a11y.controls.massMaxMinBorderTextWithForce;
const massMaxMinBorderTextWithoutForceString = GravityForceLabStrings.a11y.controls.massMaxMinBorderTextWithoutForce;

// size
const tinyString = InverseSquareLawCommonStrings.a11y.qualitative.tiny;
const verySmallString = InverseSquareLawCommonStrings.a11y.qualitative.verySmall;
const smallString = InverseSquareLawCommonStrings.a11y.qualitative.small;
const mediumSizeString = InverseSquareLawCommonStrings.a11y.qualitative.mediumSize;
const largeString = InverseSquareLawCommonStrings.a11y.qualitative.large;
const veryLargeString = InverseSquareLawCommonStrings.a11y.qualitative.veryLarge;
const hugeString = InverseSquareLawCommonStrings.a11y.qualitative.huge;

// relative size
const muchMuchSmallerThanString = GravityForceLabStrings.a11y.relativeMassSize.muchMuchSmallerThan;
const halfTheSizeOfString = GravityForceLabStrings.a11y.relativeMassSize.halfTheSizeOf;
const muchSmallerThanString = GravityForceLabStrings.a11y.relativeMassSize.muchSmallerThan;
const smallerButComparableToString = GravityForceLabStrings.a11y.relativeMassSize.smallerButComparableTo;
const comparableToString = GravityForceLabStrings.a11y.relativeMassSize.sameSizeAs;
const largerButComparableToString = GravityForceLabStrings.a11y.relativeMassSize.largerButComparableTo;
const muchLargerThanString = GravityForceLabStrings.a11y.relativeMassSize.muchLargerThan;
const twiceTheSizeOfString = GravityForceLabStrings.a11y.relativeMassSize.twiceTheSizeOf;
const muchMuchLargerThanString = GravityForceLabStrings.a11y.relativeMassSize.muchMuchLargerThan;

// relative size capitalized
const muchMuchSmallerThanCapitalizedString = GravityForceLabStrings.a11y.relativeMassSizeCapitalized.muchMuchSmallerThan;
const halfTheSizeOfCapitalizedString = GravityForceLabStrings.a11y.relativeMassSizeCapitalized.halfTheSizeOf;
const muchSmallerThanCapitalizedString = GravityForceLabStrings.a11y.relativeMassSizeCapitalized.muchSmallerThan;
const smallerButComparableToCapitalizedString = GravityForceLabStrings.a11y.relativeMassSizeCapitalized.smallerButComparableTo;
const comparableToCapitalizedString = GravityForceLabStrings.a11y.relativeMassSizeCapitalized.sameSizeAs;
const largerButComparableToCapitalizedString = GravityForceLabStrings.a11y.relativeMassSizeCapitalized.largerButComparableTo;
const muchLargerThanCapitalizedString = GravityForceLabStrings.a11y.relativeMassSizeCapitalized.muchLargerThan;
const twiceTheSizeOfCapitalizedString = GravityForceLabStrings.a11y.relativeMassSizeCapitalized.twiceTheSizeOf;
const muchMuchLargerThanCapitalizedString = GravityForceLabStrings.a11y.relativeMassSizeCapitalized.muchMuchLargerThan;

// relative density
const notDenseComparedToString = GravityForceLabStrings.a11y.relativeMassDensity.notDenseComparedTo;
const halfAsDenseAsString = GravityForceLabStrings.a11y.relativeMassDensity.halfAsDenseAs;
const muchLessDenseThanString = GravityForceLabStrings.a11y.relativeMassDensity.muchLessDenseThan;
const lessDenseButComparableToString = GravityForceLabStrings.a11y.relativeMassDensity.lessDenseButComparableTo;
const asDenseAsString = GravityForceLabStrings.a11y.relativeMassDensity.asDenseAs;
const denseButComparableToString = GravityForceLabStrings.a11y.relativeMassDensity.denseButComparableTo;
const muchDenseThanString = GravityForceLabStrings.a11y.relativeMassDensity.muchDenseThan;
const twiceAsDenseAsString = GravityForceLabStrings.a11y.relativeMassDensity.twiceAsDenseAs;
const extremelyDenseComparedToString = GravityForceLabStrings.a11y.relativeMassDensity.extremelyDenseComparedTo;

// relative density capitalized
const notDenseComparedToCapitalizedString = GravityForceLabStrings.a11y.relativeMassDensityCapitalized.notDenseComparedTo;
const halfAsDenseAsCapitalizedString = GravityForceLabStrings.a11y.relativeMassDensityCapitalized.halfAsDenseAs;
const muchLessDenseThanCapitalizedString = GravityForceLabStrings.a11y.relativeMassDensityCapitalized.muchLessDenseThan;
const lessDenseButComparableToCapitalizedString = GravityForceLabStrings.a11y.relativeMassDensityCapitalized.lessDenseButComparableTo;
const asDenseAsCapitalizedString = GravityForceLabStrings.a11y.relativeMassDensityCapitalized.asDenseAs;
const denseButComparableToCapitalizedString = GravityForceLabStrings.a11y.relativeMassDensityCapitalized.denseButComparableTo;
const muchDenseThanCapitalizedString = GravityForceLabStrings.a11y.relativeMassDensityCapitalized.muchDenseThan;
const twiceAsDenseAsCapitalizedString = GravityForceLabStrings.a11y.relativeMassDensityCapitalized.twiceAsDenseAs;
const extremelyDenseComparedToCapitalizedString = GravityForceLabStrings.a11y.relativeMassDensityCapitalized.extremelyDenseComparedTo;
const massChangeClausePatternString = GravityForceLabStrings.a11y.qualitative.massChangeClausePattern;
const massChangesAndMovesClausePatternString = GravityForceLabStrings.a11y.qualitative.massChangesAndMovesClausePattern;
const massChangesMovesOtherClausePatternString = GravityForceLabStrings.a11y.qualitative.massChangesMovesOtherClausePattern;
const massGetsBiggerString = GravityForceLabStrings.a11y.propertyChange.massGetsBigger;
const massGetsSmallerString = GravityForceLabStrings.a11y.propertyChange.massGetsSmaller;
const densityIncreasesString = GravityForceLabStrings.a11y.propertyChange.densityIncreases;
const densityDecreasesString = GravityForceLabStrings.a11y.propertyChange.densityDecreases;
const leftString = InverseSquareLawCommonStrings.a11y.qualitative.left;
const rightString = InverseSquareLawCommonStrings.a11y.qualitative.right;
const SIZE_STRINGS = [tinyString, verySmallString, smallString, mediumSizeString, largeString, veryLargeString, hugeString];
const RELATIVE_SIZE_STRINGS = [muchMuchSmallerThanString, halfTheSizeOfString, muchSmallerThanString, smallerButComparableToString, comparableToString, largerButComparableToString, muchLargerThanString, twiceTheSizeOfString, muchMuchLargerThanString];
const RELATIVE_DENSITY_STRINGS = [notDenseComparedToString, halfAsDenseAsString, muchLessDenseThanString, lessDenseButComparableToString, asDenseAsString, denseButComparableToString, muchDenseThanString, twiceAsDenseAsString, extremelyDenseComparedToString];
const RELATIVE_SIZE_CAPITALIZED_STRINGS = [muchMuchSmallerThanCapitalizedString, halfTheSizeOfCapitalizedString, muchSmallerThanCapitalizedString, smallerButComparableToCapitalizedString, comparableToCapitalizedString, largerButComparableToCapitalizedString, muchLargerThanCapitalizedString, twiceTheSizeOfCapitalizedString, muchMuchLargerThanCapitalizedString];
const RELATIVE_DENSITY_CAPITALIZED_STRINGS = [notDenseComparedToCapitalizedString, halfAsDenseAsCapitalizedString, muchLessDenseThanCapitalizedString, lessDenseButComparableToCapitalizedString, asDenseAsCapitalizedString, denseButComparableToCapitalizedString, muchDenseThanCapitalizedString, twiceAsDenseAsCapitalizedString, extremelyDenseComparedToCapitalizedString];
assert && assert(RELATIVE_DENSITY_STRINGS.length === RELATIVE_SIZE_STRINGS.length, 'same number of strings expected');
const {
  OBJECT_ONE
} = ISLCObjectEnum;
class MassDescriber extends ISLCDescriber {
  /**
   * @param {GravityForceLabModel} model
   * @param {ForceDescriber} forceDescriber
   * @param {Object} [options]
   */
  constructor(model, forceDescriber, options) {
    options = merge({
      object1Label: mass1AbbreviatedString,
      object2Label: mass2AbbreviatedString,
      // number -> number
      convertMassValue: mass => mass,
      // number -> string
      formatMassValue: mass => StringUtils.fillIn(valuePatternString, {
        value: mass
      })
    }, options);
    super(model, options.object1Label, options.object2Label);

    // @private
    this.forceDescriber = forceDescriber;
    this.mass1Growing = false;
    this.mass2Growing = false;
    this.convertMassValue = options.convertMassValue;
    this.formatMassValue = options.formatMassValue;
    this.constantRadiusProperty = model.constantRadiusProperty;
    this.showForceValuesProperty = model.showForceValuesProperty;
    model.object1.valueProperty.link((newMass, oldMass) => {
      this.mass1Growing = newMass - oldMass > 0;
    });
    model.object2.valueProperty.link((newMass, oldMass) => {
      this.mass2Growing = newMass - oldMass > 0;
    });
  }

  /**
   * summary bullet for mass comparison in the screen summary
   * @returns {string}
   * @public
   */
  getMassValuesSummaryText() {
    const relativeSize = this.getRelativeSizeOrDensity(OBJECT_ONE);
    return StringUtils.fillIn(massValuesAndComparisonSummaryPatternString, {
      mass1Label: this.object1Label,
      mass2Label: this.object2Label,
      m1Mass: this.getFormattedMass(this.object1.valueProperty.get()),
      m2Mass: this.getFormattedMass(this.object2.valueProperty.get()),
      comparativeValue: relativeSize
    });
  }

  /**
   * Helper function, hard coded from the first object's perspective
   * @returns {string}
   * @public
   */
  getM1RelativeSize() {
    const relativeSize = this.getRelativeSizeOrDensity(OBJECT_ONE);
    const firstObjectLabel = this.getObjectLabelFromEnum(OBJECT_ONE);
    const secondObjectLabel = this.getOtherObjectLabelFromEnum(OBJECT_ONE);
    return StringUtils.fillIn(objectsRelativeSizePatternString, {
      firstObjectLabel: firstObjectLabel,
      relativeSize: relativeSize,
      secondObjectLabel: secondObjectLabel
    });
  }

  /**
   * See options.formatMassValue
   * @param {number} mass
   * @returns {string}
   * @public
   */
  getFormattedMass(mass) {
    return this.formatMassValue(this.convertMassValue(mass));
  }

  /**
   * @param {number} massValue
   * @returns {string}
   * @public
   */
  getMassSize(massValue) {
    const massIndex = getMassSizeIndex(massValue, SIZE_STRINGS.length);
    assert && assert(Number.isInteger(massIndex) && massIndex < SIZE_STRINGS.length, 'wrong index for size strings');
    return SIZE_STRINGS[massIndex];
  }

  /**
   * @param {ISLCObjectEnum} objectEnum
   * @returns {string}
   * @public
   */
  getMassAndUnit(objectEnum) {
    const thisObjectMass = this.getObjectFromEnum(objectEnum).valueProperty.get();
    const massValue = this.getFormattedMass(thisObjectMass);
    return StringUtils.fillIn(massAndUnitPatternString, {
      massValue: massValue
    });
  }

  /**
   * Returns the string 'As mass gets bigger/smaller' for use in larger string patterns.
   * If the radii are set to constant size, then use "density increasing/decreasing" terminology instead
   *
   * @param  {ISLCObjectEnum} thisObjectEnum
   * @returns {string}
   * @public
   */
  getMassOrDensityChangeClause(thisObjectEnum) {
    const changeDirectionPhrase = this.getMassOrDensityChangeDirectionPhrase(thisObjectEnum);
    return StringUtils.fillIn(massChangeClausePatternString, {
      changeDirectionPhrase: changeDirectionPhrase
    });
  }

  /**
   * Returns the string 'As mass gets bigger/smaller and moves left/right' for use in larger string patterns.
   * If the radii are set to constant size, then use "density increasing/decreasing" terminology instead
   *
   * @param  {ISLCObjectEnum} thisObjectEnum
   * @returns {string}
   * @public
   */
  getMassChangesAndMovesClause(thisObjectEnum) {
    const changeDirectionPhrase = this.getMassOrDensityChangeDirectionPhrase(thisObjectEnum);
    const leftOrRight = this.getPushDirectionText(thisObjectEnum);
    return StringUtils.fillIn(massChangesAndMovesClausePatternString, {
      changeDirectionPhrase: changeDirectionPhrase,
      leftOrRight: leftOrRight
    });
  }

  /**
   * Returns the string 'As mass gets bigger/smaller and moves {{otherObjectLabel}} left/right' for use in larger string patterns.
   * If the radii are set to constant size, then use "density increasing/decreasing" terminology instead
   *
   * @param  {ISLCObjectEnum} thisObjectEnum
   * @returns {string}
   * @public
   */
  getMassChangesAndMovesOtherClause(thisObjectEnum) {
    const changeDirectionPhrase = this.getMassOrDensityChangeDirectionPhrase(thisObjectEnum);
    const otherObjectLabel = this.getOtherObjectLabelFromEnum(thisObjectEnum);
    const leftOrRight = this.getPushDirectionText(ISLCObjectEnum.getOtherObjectEnum(thisObjectEnum));
    return StringUtils.fillIn(massChangesMovesOtherClausePatternString, {
      changeDirectionPhrase: changeDirectionPhrase,
      otherObjectLabel: otherObjectLabel,
      leftOrRight: leftOrRight
    });
  }

  /**
   * Returns 'mass gets bigger/smaller' based on the most recent change to the passed-in mass.
   * If the radii are set to constant size, then use "density increasing/decreasing" terminology instead
   *
   * @param  {ISLCObjectEnum} objectEnum
   * @returns {string}
   * @private
   */
  getMassOrDensityChangeDirectionPhrase(objectEnum) {
    const isGrowing = ISLCObjectEnum.isObject1(objectEnum) ? this.mass1Growing : this.mass2Growing;
    let directionPhrase = isGrowing ? massGetsBiggerString : massGetsSmallerString;

    // specific density related verbage
    if (this.constantRadiusProperty.get()) {
      directionPhrase = isGrowing ? densityIncreasesString : densityDecreasesString;
    }
    return directionPhrase;
  }

  /**
   * @param {ISLCObjectEnum} thisObjectEnum
   * @param {boolean} capitalized
   * @returns {string}
   * @public
   */
  getRelativeSizeOrDensity(thisObjectEnum, capitalized = false) {
    const thisObject = this.getObjectFromEnum(thisObjectEnum);
    const otherObject = this.getOtherObjectFromEnum(thisObjectEnum);
    const ratio = thisObject.valueProperty.value / otherObject.valueProperty.value;
    const index = getRelativeSizeOrDensityIndex(ratio);

    // use size or density depending on if constant checkbox is checked.
    return this.constantRadiusProperty.get() ? getRelativeDensityFromIndex(index, capitalized) : getRelativeSizeFromIndex(index, capitalized);
  }

  /**
   * Get a description of the mass relative to the other mass, when a mass value is at its min or max
   * value. Certain information is excluded if that content is invisible:
   * Will return something like:
   *
   * "Half the size of mass 1, force arrows tiny, force arrows 8.3 newtons." OR
   * "Much much larger than mass 1, force arrows very small."
   *
   * @public
   *
   * @param {ISLCObjectEnum} thisObjectEnum
   * @returns {string}
   */
  getMassMaxMinText(thisObjectEnum) {
    let descriptionString = '';
    const relativeSizeString = this.getRelativeSizeOrDensity(thisObjectEnum, true);
    const otherObjectLabelString = this.getOtherObjectLabelFromEnum(thisObjectEnum);
    const forceVectorSizeString = this.forceDescriber.getForceVectorsSize();
    if (this.showForceValuesProperty.value) {
      descriptionString = StringUtils.fillIn(massMaxMinBorderTextWithForceString, {
        relativeSize: relativeSizeString,
        otherObjectLabel: otherObjectLabelString,
        forceVectorSize: forceVectorSizeString,
        force: this.forceDescriber.getFormattedForce(),
        unit: this.forceDescriber.units
      });
    } else {
      descriptionString = StringUtils.fillIn(massMaxMinBorderTextWithoutForceString, {
        relativeSize: relativeSizeString,
        otherObjectLabel: otherObjectLabelString,
        forceVectorSize: forceVectorSizeString
      });
    }
    return descriptionString;
  }

  /**
   * Each object can only be pushed in one direction. Returns 'left' or 'right' based on the object passed in.
   * @public
   *
   * @param  {ISLCObjectEnum} objectEnum
   * @returns {string}
   */
  getPushDirectionText(objectEnum) {
    return ISLCObjectEnum.isObject1(objectEnum) ? leftString : rightString;
  }
}

/**
 * @param {number} index - should be an index
 * @param {boolean} capitalized - if the phrase should be capitalized
 * @returns {string}
 */
const getRelativeSizeFromIndex = (index, capitalized) => {
  const array = capitalized ? RELATIVE_SIZE_CAPITALIZED_STRINGS : RELATIVE_SIZE_STRINGS;
  assert && assert(Number.isInteger(index) && index < array.length);
  return array[index];
};

/**
 * @param {number} index - should be an index
 * @param {boolean} capitalized - if the phrase should be capitalized
 * @returns {string}
 */
const getRelativeDensityFromIndex = (index, capitalized) => {
  const array = capitalized ? RELATIVE_DENSITY_CAPITALIZED_STRINGS : RELATIVE_DENSITY_STRINGS;
  assert && assert(Number.isInteger(index) && index < array.length);
  return array[index];
};

/**
 * Returns the mapped integer corresponding to the appropriate qualitative size/density comparison between masses.
 * There are the same number of size strings as density strings
 * These empirically determined values were designed, see https://docs.google.com/document/d/1-37qAgde2XrlXBQae2SgjartM35_EnzDD9pdtd3nXAM/edit#heading=h.nhqxjbby3dgu
 *
 * @param  {number} ratio
 * @returns {number} - an integer
 */
const getRelativeSizeOrDensityIndex = ratio => {
  assert && assert(ratio > 0, 'ratio less than or equal to zero?');
  if (ratio < 0.5) {
    return 0;
  }
  if (ratio === 0.5) {
    return 1;
  }
  if (ratio < 0.75) {
    return 2;
  }
  if (ratio < 1) {
    return 3;
  }
  if (ratio === 1) {
    return 4;
  }
  if (ratio < 1.5) {
    return 5;
  }
  if (ratio < 2) {
    return 6;
  }
  if (ratio === 2) {
    return 7;
  }
  if (ratio > 2) {
    return 8;
  }
  throw new Error(`unrecognized ratio: ${ratio}`);
};

/**
 * These empirically determined values were designed, see https://docs.google.com/document/d/1-37qAgde2XrlXBQae2SgjartM35_EnzDD9pdtd3nXAM/edit#heading=h.nhqxjbby3dgu
 * @param {number} mass - given the mass of the object.
 * @param {number} numberOfRegions - for cross checking
 * @returns {number} - integer array index
 */
const getMassSizeIndex = (mass, numberOfRegions) => {
  assert && assert(typeof mass === 'number');
  assert && assert(numberOfRegions === 7, 'If numberOfRegions changes, this function should too.');
  if (mass < 26) {
    return 0;
  }
  if (mass < 101) {
    return 1;
  }
  if (mass < 401) {
    return 2;
  }
  if (mass < 601) {
    return 3;
  }
  if (mass < 801) {
    return 4;
  }
  if (mass < 901) {
    return 5;
  }
  if (mass <= 1000) {
    return 6;
  }
  throw new Error('Invalid mass value.');
};
gravityForceLab.register('MassDescriber', MassDescriber);
export default MassDescriber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncyIsIklTTENEZXNjcmliZXIiLCJJU0xDT2JqZWN0RW51bSIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJncmF2aXR5Rm9yY2VMYWIiLCJHcmF2aXR5Rm9yY2VMYWJTdHJpbmdzIiwibWFzczFBYmJyZXZpYXRlZFN0cmluZyIsIm1hc3MxQWJicmV2aWF0ZWQiLCJtYXNzMkFiYnJldmlhdGVkU3RyaW5nIiwibWFzczJBYmJyZXZpYXRlZCIsInZhbHVlUGF0dGVyblN0cmluZyIsImExMXkiLCJ2YWx1ZVBhdHRlcm4iLCJtYXNzVmFsdWVzQW5kQ29tcGFyaXNvblN1bW1hcnlQYXR0ZXJuU3RyaW5nIiwic2NyZWVuU3VtbWFyeSIsIm1hc3NWYWx1ZXNBbmRDb21wYXJpc29uU3VtbWFyeVBhdHRlcm4iLCJtYXNzQW5kVW5pdFBhdHRlcm5TdHJpbmciLCJxdWFsaXRhdGl2ZSIsIm1hc3NBbmRVbml0UGF0dGVybiIsIm9iamVjdHNSZWxhdGl2ZVNpemVQYXR0ZXJuU3RyaW5nIiwib2JqZWN0c1JlbGF0aXZlU2l6ZVBhdHRlcm4iLCJtYXNzTWF4TWluQm9yZGVyVGV4dFdpdGhGb3JjZVN0cmluZyIsImNvbnRyb2xzIiwibWFzc01heE1pbkJvcmRlclRleHRXaXRoRm9yY2UiLCJtYXNzTWF4TWluQm9yZGVyVGV4dFdpdGhvdXRGb3JjZVN0cmluZyIsIm1hc3NNYXhNaW5Cb3JkZXJUZXh0V2l0aG91dEZvcmNlIiwidGlueVN0cmluZyIsInRpbnkiLCJ2ZXJ5U21hbGxTdHJpbmciLCJ2ZXJ5U21hbGwiLCJzbWFsbFN0cmluZyIsInNtYWxsIiwibWVkaXVtU2l6ZVN0cmluZyIsIm1lZGl1bVNpemUiLCJsYXJnZVN0cmluZyIsImxhcmdlIiwidmVyeUxhcmdlU3RyaW5nIiwidmVyeUxhcmdlIiwiaHVnZVN0cmluZyIsImh1Z2UiLCJtdWNoTXVjaFNtYWxsZXJUaGFuU3RyaW5nIiwicmVsYXRpdmVNYXNzU2l6ZSIsIm11Y2hNdWNoU21hbGxlclRoYW4iLCJoYWxmVGhlU2l6ZU9mU3RyaW5nIiwiaGFsZlRoZVNpemVPZiIsIm11Y2hTbWFsbGVyVGhhblN0cmluZyIsIm11Y2hTbWFsbGVyVGhhbiIsInNtYWxsZXJCdXRDb21wYXJhYmxlVG9TdHJpbmciLCJzbWFsbGVyQnV0Q29tcGFyYWJsZVRvIiwiY29tcGFyYWJsZVRvU3RyaW5nIiwic2FtZVNpemVBcyIsImxhcmdlckJ1dENvbXBhcmFibGVUb1N0cmluZyIsImxhcmdlckJ1dENvbXBhcmFibGVUbyIsIm11Y2hMYXJnZXJUaGFuU3RyaW5nIiwibXVjaExhcmdlclRoYW4iLCJ0d2ljZVRoZVNpemVPZlN0cmluZyIsInR3aWNlVGhlU2l6ZU9mIiwibXVjaE11Y2hMYXJnZXJUaGFuU3RyaW5nIiwibXVjaE11Y2hMYXJnZXJUaGFuIiwibXVjaE11Y2hTbWFsbGVyVGhhbkNhcGl0YWxpemVkU3RyaW5nIiwicmVsYXRpdmVNYXNzU2l6ZUNhcGl0YWxpemVkIiwiaGFsZlRoZVNpemVPZkNhcGl0YWxpemVkU3RyaW5nIiwibXVjaFNtYWxsZXJUaGFuQ2FwaXRhbGl6ZWRTdHJpbmciLCJzbWFsbGVyQnV0Q29tcGFyYWJsZVRvQ2FwaXRhbGl6ZWRTdHJpbmciLCJjb21wYXJhYmxlVG9DYXBpdGFsaXplZFN0cmluZyIsImxhcmdlckJ1dENvbXBhcmFibGVUb0NhcGl0YWxpemVkU3RyaW5nIiwibXVjaExhcmdlclRoYW5DYXBpdGFsaXplZFN0cmluZyIsInR3aWNlVGhlU2l6ZU9mQ2FwaXRhbGl6ZWRTdHJpbmciLCJtdWNoTXVjaExhcmdlclRoYW5DYXBpdGFsaXplZFN0cmluZyIsIm5vdERlbnNlQ29tcGFyZWRUb1N0cmluZyIsInJlbGF0aXZlTWFzc0RlbnNpdHkiLCJub3REZW5zZUNvbXBhcmVkVG8iLCJoYWxmQXNEZW5zZUFzU3RyaW5nIiwiaGFsZkFzRGVuc2VBcyIsIm11Y2hMZXNzRGVuc2VUaGFuU3RyaW5nIiwibXVjaExlc3NEZW5zZVRoYW4iLCJsZXNzRGVuc2VCdXRDb21wYXJhYmxlVG9TdHJpbmciLCJsZXNzRGVuc2VCdXRDb21wYXJhYmxlVG8iLCJhc0RlbnNlQXNTdHJpbmciLCJhc0RlbnNlQXMiLCJkZW5zZUJ1dENvbXBhcmFibGVUb1N0cmluZyIsImRlbnNlQnV0Q29tcGFyYWJsZVRvIiwibXVjaERlbnNlVGhhblN0cmluZyIsIm11Y2hEZW5zZVRoYW4iLCJ0d2ljZUFzRGVuc2VBc1N0cmluZyIsInR3aWNlQXNEZW5zZUFzIiwiZXh0cmVtZWx5RGVuc2VDb21wYXJlZFRvU3RyaW5nIiwiZXh0cmVtZWx5RGVuc2VDb21wYXJlZFRvIiwibm90RGVuc2VDb21wYXJlZFRvQ2FwaXRhbGl6ZWRTdHJpbmciLCJyZWxhdGl2ZU1hc3NEZW5zaXR5Q2FwaXRhbGl6ZWQiLCJoYWxmQXNEZW5zZUFzQ2FwaXRhbGl6ZWRTdHJpbmciLCJtdWNoTGVzc0RlbnNlVGhhbkNhcGl0YWxpemVkU3RyaW5nIiwibGVzc0RlbnNlQnV0Q29tcGFyYWJsZVRvQ2FwaXRhbGl6ZWRTdHJpbmciLCJhc0RlbnNlQXNDYXBpdGFsaXplZFN0cmluZyIsImRlbnNlQnV0Q29tcGFyYWJsZVRvQ2FwaXRhbGl6ZWRTdHJpbmciLCJtdWNoRGVuc2VUaGFuQ2FwaXRhbGl6ZWRTdHJpbmciLCJ0d2ljZUFzRGVuc2VBc0NhcGl0YWxpemVkU3RyaW5nIiwiZXh0cmVtZWx5RGVuc2VDb21wYXJlZFRvQ2FwaXRhbGl6ZWRTdHJpbmciLCJtYXNzQ2hhbmdlQ2xhdXNlUGF0dGVyblN0cmluZyIsIm1hc3NDaGFuZ2VDbGF1c2VQYXR0ZXJuIiwibWFzc0NoYW5nZXNBbmRNb3Zlc0NsYXVzZVBhdHRlcm5TdHJpbmciLCJtYXNzQ2hhbmdlc0FuZE1vdmVzQ2xhdXNlUGF0dGVybiIsIm1hc3NDaGFuZ2VzTW92ZXNPdGhlckNsYXVzZVBhdHRlcm5TdHJpbmciLCJtYXNzQ2hhbmdlc01vdmVzT3RoZXJDbGF1c2VQYXR0ZXJuIiwibWFzc0dldHNCaWdnZXJTdHJpbmciLCJwcm9wZXJ0eUNoYW5nZSIsIm1hc3NHZXRzQmlnZ2VyIiwibWFzc0dldHNTbWFsbGVyU3RyaW5nIiwibWFzc0dldHNTbWFsbGVyIiwiZGVuc2l0eUluY3JlYXNlc1N0cmluZyIsImRlbnNpdHlJbmNyZWFzZXMiLCJkZW5zaXR5RGVjcmVhc2VzU3RyaW5nIiwiZGVuc2l0eURlY3JlYXNlcyIsImxlZnRTdHJpbmciLCJsZWZ0IiwicmlnaHRTdHJpbmciLCJyaWdodCIsIlNJWkVfU1RSSU5HUyIsIlJFTEFUSVZFX1NJWkVfU1RSSU5HUyIsIlJFTEFUSVZFX0RFTlNJVFlfU1RSSU5HUyIsIlJFTEFUSVZFX1NJWkVfQ0FQSVRBTElaRURfU1RSSU5HUyIsIlJFTEFUSVZFX0RFTlNJVFlfQ0FQSVRBTElaRURfU1RSSU5HUyIsImFzc2VydCIsImxlbmd0aCIsIk9CSkVDVF9PTkUiLCJNYXNzRGVzY3JpYmVyIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsImZvcmNlRGVzY3JpYmVyIiwib3B0aW9ucyIsIm9iamVjdDFMYWJlbCIsIm9iamVjdDJMYWJlbCIsImNvbnZlcnRNYXNzVmFsdWUiLCJtYXNzIiwiZm9ybWF0TWFzc1ZhbHVlIiwiZmlsbEluIiwidmFsdWUiLCJtYXNzMUdyb3dpbmciLCJtYXNzMkdyb3dpbmciLCJjb25zdGFudFJhZGl1c1Byb3BlcnR5Iiwic2hvd0ZvcmNlVmFsdWVzUHJvcGVydHkiLCJvYmplY3QxIiwidmFsdWVQcm9wZXJ0eSIsImxpbmsiLCJuZXdNYXNzIiwib2xkTWFzcyIsIm9iamVjdDIiLCJnZXRNYXNzVmFsdWVzU3VtbWFyeVRleHQiLCJyZWxhdGl2ZVNpemUiLCJnZXRSZWxhdGl2ZVNpemVPckRlbnNpdHkiLCJtYXNzMUxhYmVsIiwibWFzczJMYWJlbCIsIm0xTWFzcyIsImdldEZvcm1hdHRlZE1hc3MiLCJnZXQiLCJtMk1hc3MiLCJjb21wYXJhdGl2ZVZhbHVlIiwiZ2V0TTFSZWxhdGl2ZVNpemUiLCJmaXJzdE9iamVjdExhYmVsIiwiZ2V0T2JqZWN0TGFiZWxGcm9tRW51bSIsInNlY29uZE9iamVjdExhYmVsIiwiZ2V0T3RoZXJPYmplY3RMYWJlbEZyb21FbnVtIiwiZ2V0TWFzc1NpemUiLCJtYXNzVmFsdWUiLCJtYXNzSW5kZXgiLCJnZXRNYXNzU2l6ZUluZGV4IiwiTnVtYmVyIiwiaXNJbnRlZ2VyIiwiZ2V0TWFzc0FuZFVuaXQiLCJvYmplY3RFbnVtIiwidGhpc09iamVjdE1hc3MiLCJnZXRPYmplY3RGcm9tRW51bSIsImdldE1hc3NPckRlbnNpdHlDaGFuZ2VDbGF1c2UiLCJ0aGlzT2JqZWN0RW51bSIsImNoYW5nZURpcmVjdGlvblBocmFzZSIsImdldE1hc3NPckRlbnNpdHlDaGFuZ2VEaXJlY3Rpb25QaHJhc2UiLCJnZXRNYXNzQ2hhbmdlc0FuZE1vdmVzQ2xhdXNlIiwibGVmdE9yUmlnaHQiLCJnZXRQdXNoRGlyZWN0aW9uVGV4dCIsImdldE1hc3NDaGFuZ2VzQW5kTW92ZXNPdGhlckNsYXVzZSIsIm90aGVyT2JqZWN0TGFiZWwiLCJnZXRPdGhlck9iamVjdEVudW0iLCJpc0dyb3dpbmciLCJpc09iamVjdDEiLCJkaXJlY3Rpb25QaHJhc2UiLCJjYXBpdGFsaXplZCIsInRoaXNPYmplY3QiLCJvdGhlck9iamVjdCIsImdldE90aGVyT2JqZWN0RnJvbUVudW0iLCJyYXRpbyIsImluZGV4IiwiZ2V0UmVsYXRpdmVTaXplT3JEZW5zaXR5SW5kZXgiLCJnZXRSZWxhdGl2ZURlbnNpdHlGcm9tSW5kZXgiLCJnZXRSZWxhdGl2ZVNpemVGcm9tSW5kZXgiLCJnZXRNYXNzTWF4TWluVGV4dCIsImRlc2NyaXB0aW9uU3RyaW5nIiwicmVsYXRpdmVTaXplU3RyaW5nIiwib3RoZXJPYmplY3RMYWJlbFN0cmluZyIsImZvcmNlVmVjdG9yU2l6ZVN0cmluZyIsImdldEZvcmNlVmVjdG9yc1NpemUiLCJmb3JjZVZlY3RvclNpemUiLCJmb3JjZSIsImdldEZvcm1hdHRlZEZvcmNlIiwidW5pdCIsInVuaXRzIiwiYXJyYXkiLCJFcnJvciIsIm51bWJlck9mUmVnaW9ucyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTWFzc0Rlc2NyaWJlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSZXNwb25zaWJsZSBmb3IgbG9naWMgYXNzb2NpYXRlZCB3aXRoIHRoZSBmb3JtYXRpb24gb2YgYXVkaW8gZGVzY3JpcHRpb24gc3RyaW5ncyByZWxhdGVkIHRvIHRoZSBtYXNzIG9mIHRoZVxyXG4gKiBJU0xDT2JqZWN0cy5cclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgQmFybG93IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncyBmcm9tICcuLi8uLi8uLi8uLi9pbnZlcnNlLXNxdWFyZS1sYXctY29tbW9uL2pzL0ludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IElTTENEZXNjcmliZXIgZnJvbSAnLi4vLi4vLi4vLi4vaW52ZXJzZS1zcXVhcmUtbGF3LWNvbW1vbi9qcy92aWV3L2Rlc2NyaWJlcnMvSVNMQ0Rlc2NyaWJlci5qcyc7XHJcbmltcG9ydCBJU0xDT2JqZWN0RW51bSBmcm9tICcuLi8uLi8uLi8uLi9pbnZlcnNlLXNxdWFyZS1sYXctY29tbW9uL2pzL21vZGVsL0lTTENPYmplY3RFbnVtLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgZ3Jhdml0eUZvcmNlTGFiIGZyb20gJy4uLy4uL2dyYXZpdHlGb3JjZUxhYi5qcyc7XHJcbmltcG9ydCBHcmF2aXR5Rm9yY2VMYWJTdHJpbmdzIGZyb20gJy4uLy4uL0dyYXZpdHlGb3JjZUxhYlN0cmluZ3MuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IG1hc3MxQWJicmV2aWF0ZWRTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJTdHJpbmdzLm1hc3MxQWJicmV2aWF0ZWQ7XHJcbmNvbnN0IG1hc3MyQWJicmV2aWF0ZWRTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJTdHJpbmdzLm1hc3MyQWJicmV2aWF0ZWQ7XHJcblxyXG5jb25zdCB2YWx1ZVBhdHRlcm5TdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnZhbHVlUGF0dGVybjtcclxuY29uc3QgbWFzc1ZhbHVlc0FuZENvbXBhcmlzb25TdW1tYXJ5UGF0dGVyblN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5zY3JlZW5TdW1tYXJ5Lm1hc3NWYWx1ZXNBbmRDb21wYXJpc29uU3VtbWFyeVBhdHRlcm47XHJcbmNvbnN0IG1hc3NBbmRVbml0UGF0dGVyblN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5xdWFsaXRhdGl2ZS5tYXNzQW5kVW5pdFBhdHRlcm47XHJcbmNvbnN0IG9iamVjdHNSZWxhdGl2ZVNpemVQYXR0ZXJuU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnF1YWxpdGF0aXZlLm9iamVjdHNSZWxhdGl2ZVNpemVQYXR0ZXJuO1xyXG5jb25zdCBtYXNzTWF4TWluQm9yZGVyVGV4dFdpdGhGb3JjZVN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5jb250cm9scy5tYXNzTWF4TWluQm9yZGVyVGV4dFdpdGhGb3JjZTtcclxuY29uc3QgbWFzc01heE1pbkJvcmRlclRleHRXaXRob3V0Rm9yY2VTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJTdHJpbmdzLmExMXkuY29udHJvbHMubWFzc01heE1pbkJvcmRlclRleHRXaXRob3V0Rm9yY2U7XHJcblxyXG4vLyBzaXplXHJcbmNvbnN0IHRpbnlTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnF1YWxpdGF0aXZlLnRpbnk7XHJcbmNvbnN0IHZlcnlTbWFsbFN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkucXVhbGl0YXRpdmUudmVyeVNtYWxsO1xyXG5jb25zdCBzbWFsbFN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkucXVhbGl0YXRpdmUuc21hbGw7XHJcbmNvbnN0IG1lZGl1bVNpemVTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnF1YWxpdGF0aXZlLm1lZGl1bVNpemU7XHJcbmNvbnN0IGxhcmdlU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5xdWFsaXRhdGl2ZS5sYXJnZTtcclxuY29uc3QgdmVyeUxhcmdlU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5xdWFsaXRhdGl2ZS52ZXJ5TGFyZ2U7XHJcbmNvbnN0IGh1Z2VTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnF1YWxpdGF0aXZlLmh1Z2U7XHJcblxyXG4vLyByZWxhdGl2ZSBzaXplXHJcbmNvbnN0IG11Y2hNdWNoU21hbGxlclRoYW5TdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJTdHJpbmdzLmExMXkucmVsYXRpdmVNYXNzU2l6ZS5tdWNoTXVjaFNtYWxsZXJUaGFuO1xyXG5jb25zdCBoYWxmVGhlU2l6ZU9mU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnJlbGF0aXZlTWFzc1NpemUuaGFsZlRoZVNpemVPZjtcclxuY29uc3QgbXVjaFNtYWxsZXJUaGFuU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnJlbGF0aXZlTWFzc1NpemUubXVjaFNtYWxsZXJUaGFuO1xyXG5jb25zdCBzbWFsbGVyQnV0Q29tcGFyYWJsZVRvU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnJlbGF0aXZlTWFzc1NpemUuc21hbGxlckJ1dENvbXBhcmFibGVUbztcclxuY29uc3QgY29tcGFyYWJsZVRvU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnJlbGF0aXZlTWFzc1NpemUuc2FtZVNpemVBcztcclxuY29uc3QgbGFyZ2VyQnV0Q29tcGFyYWJsZVRvU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnJlbGF0aXZlTWFzc1NpemUubGFyZ2VyQnV0Q29tcGFyYWJsZVRvO1xyXG5jb25zdCBtdWNoTGFyZ2VyVGhhblN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5yZWxhdGl2ZU1hc3NTaXplLm11Y2hMYXJnZXJUaGFuO1xyXG5jb25zdCB0d2ljZVRoZVNpemVPZlN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5yZWxhdGl2ZU1hc3NTaXplLnR3aWNlVGhlU2l6ZU9mO1xyXG5jb25zdCBtdWNoTXVjaExhcmdlclRoYW5TdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJTdHJpbmdzLmExMXkucmVsYXRpdmVNYXNzU2l6ZS5tdWNoTXVjaExhcmdlclRoYW47XHJcblxyXG4vLyByZWxhdGl2ZSBzaXplIGNhcGl0YWxpemVkXHJcbmNvbnN0IG11Y2hNdWNoU21hbGxlclRoYW5DYXBpdGFsaXplZFN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5yZWxhdGl2ZU1hc3NTaXplQ2FwaXRhbGl6ZWQubXVjaE11Y2hTbWFsbGVyVGhhbjtcclxuY29uc3QgaGFsZlRoZVNpemVPZkNhcGl0YWxpemVkU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnJlbGF0aXZlTWFzc1NpemVDYXBpdGFsaXplZC5oYWxmVGhlU2l6ZU9mO1xyXG5jb25zdCBtdWNoU21hbGxlclRoYW5DYXBpdGFsaXplZFN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5yZWxhdGl2ZU1hc3NTaXplQ2FwaXRhbGl6ZWQubXVjaFNtYWxsZXJUaGFuO1xyXG5jb25zdCBzbWFsbGVyQnV0Q29tcGFyYWJsZVRvQ2FwaXRhbGl6ZWRTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJTdHJpbmdzLmExMXkucmVsYXRpdmVNYXNzU2l6ZUNhcGl0YWxpemVkLnNtYWxsZXJCdXRDb21wYXJhYmxlVG87XHJcbmNvbnN0IGNvbXBhcmFibGVUb0NhcGl0YWxpemVkU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnJlbGF0aXZlTWFzc1NpemVDYXBpdGFsaXplZC5zYW1lU2l6ZUFzO1xyXG5jb25zdCBsYXJnZXJCdXRDb21wYXJhYmxlVG9DYXBpdGFsaXplZFN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5yZWxhdGl2ZU1hc3NTaXplQ2FwaXRhbGl6ZWQubGFyZ2VyQnV0Q29tcGFyYWJsZVRvO1xyXG5jb25zdCBtdWNoTGFyZ2VyVGhhbkNhcGl0YWxpemVkU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnJlbGF0aXZlTWFzc1NpemVDYXBpdGFsaXplZC5tdWNoTGFyZ2VyVGhhbjtcclxuY29uc3QgdHdpY2VUaGVTaXplT2ZDYXBpdGFsaXplZFN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5yZWxhdGl2ZU1hc3NTaXplQ2FwaXRhbGl6ZWQudHdpY2VUaGVTaXplT2Y7XHJcbmNvbnN0IG11Y2hNdWNoTGFyZ2VyVGhhbkNhcGl0YWxpemVkU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnJlbGF0aXZlTWFzc1NpemVDYXBpdGFsaXplZC5tdWNoTXVjaExhcmdlclRoYW47XHJcblxyXG4vLyByZWxhdGl2ZSBkZW5zaXR5XHJcbmNvbnN0IG5vdERlbnNlQ29tcGFyZWRUb1N0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5yZWxhdGl2ZU1hc3NEZW5zaXR5Lm5vdERlbnNlQ29tcGFyZWRUbztcclxuY29uc3QgaGFsZkFzRGVuc2VBc1N0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5yZWxhdGl2ZU1hc3NEZW5zaXR5LmhhbGZBc0RlbnNlQXM7XHJcbmNvbnN0IG11Y2hMZXNzRGVuc2VUaGFuU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnJlbGF0aXZlTWFzc0RlbnNpdHkubXVjaExlc3NEZW5zZVRoYW47XHJcbmNvbnN0IGxlc3NEZW5zZUJ1dENvbXBhcmFibGVUb1N0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5yZWxhdGl2ZU1hc3NEZW5zaXR5Lmxlc3NEZW5zZUJ1dENvbXBhcmFibGVUbztcclxuY29uc3QgYXNEZW5zZUFzU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnJlbGF0aXZlTWFzc0RlbnNpdHkuYXNEZW5zZUFzO1xyXG5jb25zdCBkZW5zZUJ1dENvbXBhcmFibGVUb1N0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5yZWxhdGl2ZU1hc3NEZW5zaXR5LmRlbnNlQnV0Q29tcGFyYWJsZVRvO1xyXG5jb25zdCBtdWNoRGVuc2VUaGFuU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnJlbGF0aXZlTWFzc0RlbnNpdHkubXVjaERlbnNlVGhhbjtcclxuY29uc3QgdHdpY2VBc0RlbnNlQXNTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJTdHJpbmdzLmExMXkucmVsYXRpdmVNYXNzRGVuc2l0eS50d2ljZUFzRGVuc2VBcztcclxuY29uc3QgZXh0cmVtZWx5RGVuc2VDb21wYXJlZFRvU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnJlbGF0aXZlTWFzc0RlbnNpdHkuZXh0cmVtZWx5RGVuc2VDb21wYXJlZFRvO1xyXG5cclxuLy8gcmVsYXRpdmUgZGVuc2l0eSBjYXBpdGFsaXplZFxyXG5jb25zdCBub3REZW5zZUNvbXBhcmVkVG9DYXBpdGFsaXplZFN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5yZWxhdGl2ZU1hc3NEZW5zaXR5Q2FwaXRhbGl6ZWQubm90RGVuc2VDb21wYXJlZFRvO1xyXG5jb25zdCBoYWxmQXNEZW5zZUFzQ2FwaXRhbGl6ZWRTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJTdHJpbmdzLmExMXkucmVsYXRpdmVNYXNzRGVuc2l0eUNhcGl0YWxpemVkLmhhbGZBc0RlbnNlQXM7XHJcbmNvbnN0IG11Y2hMZXNzRGVuc2VUaGFuQ2FwaXRhbGl6ZWRTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJTdHJpbmdzLmExMXkucmVsYXRpdmVNYXNzRGVuc2l0eUNhcGl0YWxpemVkLm11Y2hMZXNzRGVuc2VUaGFuO1xyXG5jb25zdCBsZXNzRGVuc2VCdXRDb21wYXJhYmxlVG9DYXBpdGFsaXplZFN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5yZWxhdGl2ZU1hc3NEZW5zaXR5Q2FwaXRhbGl6ZWQubGVzc0RlbnNlQnV0Q29tcGFyYWJsZVRvO1xyXG5jb25zdCBhc0RlbnNlQXNDYXBpdGFsaXplZFN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5yZWxhdGl2ZU1hc3NEZW5zaXR5Q2FwaXRhbGl6ZWQuYXNEZW5zZUFzO1xyXG5jb25zdCBkZW5zZUJ1dENvbXBhcmFibGVUb0NhcGl0YWxpemVkU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnJlbGF0aXZlTWFzc0RlbnNpdHlDYXBpdGFsaXplZC5kZW5zZUJ1dENvbXBhcmFibGVUbztcclxuY29uc3QgbXVjaERlbnNlVGhhbkNhcGl0YWxpemVkU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnJlbGF0aXZlTWFzc0RlbnNpdHlDYXBpdGFsaXplZC5tdWNoRGVuc2VUaGFuO1xyXG5jb25zdCB0d2ljZUFzRGVuc2VBc0NhcGl0YWxpemVkU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnJlbGF0aXZlTWFzc0RlbnNpdHlDYXBpdGFsaXplZC50d2ljZUFzRGVuc2VBcztcclxuY29uc3QgZXh0cmVtZWx5RGVuc2VDb21wYXJlZFRvQ2FwaXRhbGl6ZWRTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJTdHJpbmdzLmExMXkucmVsYXRpdmVNYXNzRGVuc2l0eUNhcGl0YWxpemVkLmV4dHJlbWVseURlbnNlQ29tcGFyZWRUbztcclxuXHJcbmNvbnN0IG1hc3NDaGFuZ2VDbGF1c2VQYXR0ZXJuU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnF1YWxpdGF0aXZlLm1hc3NDaGFuZ2VDbGF1c2VQYXR0ZXJuO1xyXG5jb25zdCBtYXNzQ2hhbmdlc0FuZE1vdmVzQ2xhdXNlUGF0dGVyblN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5xdWFsaXRhdGl2ZS5tYXNzQ2hhbmdlc0FuZE1vdmVzQ2xhdXNlUGF0dGVybjtcclxuY29uc3QgbWFzc0NoYW5nZXNNb3Zlc090aGVyQ2xhdXNlUGF0dGVyblN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5xdWFsaXRhdGl2ZS5tYXNzQ2hhbmdlc01vdmVzT3RoZXJDbGF1c2VQYXR0ZXJuO1xyXG5jb25zdCBtYXNzR2V0c0JpZ2dlclN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5wcm9wZXJ0eUNoYW5nZS5tYXNzR2V0c0JpZ2dlcjtcclxuY29uc3QgbWFzc0dldHNTbWFsbGVyU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnByb3BlcnR5Q2hhbmdlLm1hc3NHZXRzU21hbGxlcjtcclxuY29uc3QgZGVuc2l0eUluY3JlYXNlc1N0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5wcm9wZXJ0eUNoYW5nZS5kZW5zaXR5SW5jcmVhc2VzO1xyXG5jb25zdCBkZW5zaXR5RGVjcmVhc2VzU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LnByb3BlcnR5Q2hhbmdlLmRlbnNpdHlEZWNyZWFzZXM7XHJcbmNvbnN0IGxlZnRTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnF1YWxpdGF0aXZlLmxlZnQ7XHJcbmNvbnN0IHJpZ2h0U3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5xdWFsaXRhdGl2ZS5yaWdodDtcclxuXHJcbmNvbnN0IFNJWkVfU1RSSU5HUyA9IFtcclxuICB0aW55U3RyaW5nLFxyXG4gIHZlcnlTbWFsbFN0cmluZyxcclxuICBzbWFsbFN0cmluZyxcclxuICBtZWRpdW1TaXplU3RyaW5nLFxyXG4gIGxhcmdlU3RyaW5nLFxyXG4gIHZlcnlMYXJnZVN0cmluZyxcclxuICBodWdlU3RyaW5nXHJcbl07XHJcblxyXG5jb25zdCBSRUxBVElWRV9TSVpFX1NUUklOR1MgPSBbXHJcbiAgbXVjaE11Y2hTbWFsbGVyVGhhblN0cmluZyxcclxuICBoYWxmVGhlU2l6ZU9mU3RyaW5nLFxyXG4gIG11Y2hTbWFsbGVyVGhhblN0cmluZyxcclxuICBzbWFsbGVyQnV0Q29tcGFyYWJsZVRvU3RyaW5nLFxyXG4gIGNvbXBhcmFibGVUb1N0cmluZyxcclxuICBsYXJnZXJCdXRDb21wYXJhYmxlVG9TdHJpbmcsXHJcbiAgbXVjaExhcmdlclRoYW5TdHJpbmcsXHJcbiAgdHdpY2VUaGVTaXplT2ZTdHJpbmcsXHJcbiAgbXVjaE11Y2hMYXJnZXJUaGFuU3RyaW5nXHJcbl07XHJcbmNvbnN0IFJFTEFUSVZFX0RFTlNJVFlfU1RSSU5HUyA9IFtcclxuICBub3REZW5zZUNvbXBhcmVkVG9TdHJpbmcsXHJcbiAgaGFsZkFzRGVuc2VBc1N0cmluZyxcclxuICBtdWNoTGVzc0RlbnNlVGhhblN0cmluZyxcclxuICBsZXNzRGVuc2VCdXRDb21wYXJhYmxlVG9TdHJpbmcsXHJcbiAgYXNEZW5zZUFzU3RyaW5nLFxyXG4gIGRlbnNlQnV0Q29tcGFyYWJsZVRvU3RyaW5nLFxyXG4gIG11Y2hEZW5zZVRoYW5TdHJpbmcsXHJcbiAgdHdpY2VBc0RlbnNlQXNTdHJpbmcsXHJcbiAgZXh0cmVtZWx5RGVuc2VDb21wYXJlZFRvU3RyaW5nXHJcbl07XHJcbmNvbnN0IFJFTEFUSVZFX1NJWkVfQ0FQSVRBTElaRURfU1RSSU5HUyA9IFtcclxuICBtdWNoTXVjaFNtYWxsZXJUaGFuQ2FwaXRhbGl6ZWRTdHJpbmcsXHJcbiAgaGFsZlRoZVNpemVPZkNhcGl0YWxpemVkU3RyaW5nLFxyXG4gIG11Y2hTbWFsbGVyVGhhbkNhcGl0YWxpemVkU3RyaW5nLFxyXG4gIHNtYWxsZXJCdXRDb21wYXJhYmxlVG9DYXBpdGFsaXplZFN0cmluZyxcclxuICBjb21wYXJhYmxlVG9DYXBpdGFsaXplZFN0cmluZyxcclxuICBsYXJnZXJCdXRDb21wYXJhYmxlVG9DYXBpdGFsaXplZFN0cmluZyxcclxuICBtdWNoTGFyZ2VyVGhhbkNhcGl0YWxpemVkU3RyaW5nLFxyXG4gIHR3aWNlVGhlU2l6ZU9mQ2FwaXRhbGl6ZWRTdHJpbmcsXHJcbiAgbXVjaE11Y2hMYXJnZXJUaGFuQ2FwaXRhbGl6ZWRTdHJpbmdcclxuXTtcclxuY29uc3QgUkVMQVRJVkVfREVOU0lUWV9DQVBJVEFMSVpFRF9TVFJJTkdTID0gW1xyXG4gIG5vdERlbnNlQ29tcGFyZWRUb0NhcGl0YWxpemVkU3RyaW5nLFxyXG4gIGhhbGZBc0RlbnNlQXNDYXBpdGFsaXplZFN0cmluZyxcclxuICBtdWNoTGVzc0RlbnNlVGhhbkNhcGl0YWxpemVkU3RyaW5nLFxyXG4gIGxlc3NEZW5zZUJ1dENvbXBhcmFibGVUb0NhcGl0YWxpemVkU3RyaW5nLFxyXG4gIGFzRGVuc2VBc0NhcGl0YWxpemVkU3RyaW5nLFxyXG4gIGRlbnNlQnV0Q29tcGFyYWJsZVRvQ2FwaXRhbGl6ZWRTdHJpbmcsXHJcbiAgbXVjaERlbnNlVGhhbkNhcGl0YWxpemVkU3RyaW5nLFxyXG4gIHR3aWNlQXNEZW5zZUFzQ2FwaXRhbGl6ZWRTdHJpbmcsXHJcbiAgZXh0cmVtZWx5RGVuc2VDb21wYXJlZFRvQ2FwaXRhbGl6ZWRTdHJpbmdcclxuXTtcclxuYXNzZXJ0ICYmIGFzc2VydCggUkVMQVRJVkVfREVOU0lUWV9TVFJJTkdTLmxlbmd0aCA9PT0gUkVMQVRJVkVfU0laRV9TVFJJTkdTLmxlbmd0aCwgJ3NhbWUgbnVtYmVyIG9mIHN0cmluZ3MgZXhwZWN0ZWQnICk7XHJcblxyXG5jb25zdCB7IE9CSkVDVF9PTkUgfSA9IElTTENPYmplY3RFbnVtO1xyXG5cclxuY2xhc3MgTWFzc0Rlc2NyaWJlciBleHRlbmRzIElTTENEZXNjcmliZXIge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0dyYXZpdHlGb3JjZUxhYk1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7Rm9yY2VEZXNjcmliZXJ9IGZvcmNlRGVzY3JpYmVyXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgZm9yY2VEZXNjcmliZXIsIG9wdGlvbnMgKSB7XHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgb2JqZWN0MUxhYmVsOiBtYXNzMUFiYnJldmlhdGVkU3RyaW5nLFxyXG4gICAgICBvYmplY3QyTGFiZWw6IG1hc3MyQWJicmV2aWF0ZWRTdHJpbmcsXHJcblxyXG4gICAgICAvLyBudW1iZXIgLT4gbnVtYmVyXHJcbiAgICAgIGNvbnZlcnRNYXNzVmFsdWU6IG1hc3MgPT4gbWFzcyxcclxuXHJcbiAgICAgIC8vIG51bWJlciAtPiBzdHJpbmdcclxuICAgICAgZm9ybWF0TWFzc1ZhbHVlOiBtYXNzID0+IFN0cmluZ1V0aWxzLmZpbGxJbiggdmFsdWVQYXR0ZXJuU3RyaW5nLCB7IHZhbHVlOiBtYXNzIH0gKVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBtb2RlbCwgb3B0aW9ucy5vYmplY3QxTGFiZWwsIG9wdGlvbnMub2JqZWN0MkxhYmVsICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZm9yY2VEZXNjcmliZXIgPSBmb3JjZURlc2NyaWJlcjtcclxuICAgIHRoaXMubWFzczFHcm93aW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLm1hc3MyR3Jvd2luZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5jb252ZXJ0TWFzc1ZhbHVlID0gb3B0aW9ucy5jb252ZXJ0TWFzc1ZhbHVlO1xyXG4gICAgdGhpcy5mb3JtYXRNYXNzVmFsdWUgPSBvcHRpb25zLmZvcm1hdE1hc3NWYWx1ZTtcclxuICAgIHRoaXMuY29uc3RhbnRSYWRpdXNQcm9wZXJ0eSA9IG1vZGVsLmNvbnN0YW50UmFkaXVzUHJvcGVydHk7XHJcbiAgICB0aGlzLnNob3dGb3JjZVZhbHVlc1Byb3BlcnR5ID0gbW9kZWwuc2hvd0ZvcmNlVmFsdWVzUHJvcGVydHk7XHJcblxyXG4gICAgbW9kZWwub2JqZWN0MS52YWx1ZVByb3BlcnR5LmxpbmsoICggbmV3TWFzcywgb2xkTWFzcyApID0+IHtcclxuICAgICAgdGhpcy5tYXNzMUdyb3dpbmcgPSAoIG5ld01hc3MgLSBvbGRNYXNzICkgPiAwO1xyXG4gICAgfSApO1xyXG5cclxuICAgIG1vZGVsLm9iamVjdDIudmFsdWVQcm9wZXJ0eS5saW5rKCAoIG5ld01hc3MsIG9sZE1hc3MgKSA9PiB7XHJcbiAgICAgIHRoaXMubWFzczJHcm93aW5nID0gKCBuZXdNYXNzIC0gb2xkTWFzcyApID4gMDtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHN1bW1hcnkgYnVsbGV0IGZvciBtYXNzIGNvbXBhcmlzb24gaW4gdGhlIHNjcmVlbiBzdW1tYXJ5XHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TWFzc1ZhbHVlc1N1bW1hcnlUZXh0KCkge1xyXG4gICAgY29uc3QgcmVsYXRpdmVTaXplID0gdGhpcy5nZXRSZWxhdGl2ZVNpemVPckRlbnNpdHkoIE9CSkVDVF9PTkUgKTtcclxuXHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBtYXNzVmFsdWVzQW5kQ29tcGFyaXNvblN1bW1hcnlQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIG1hc3MxTGFiZWw6IHRoaXMub2JqZWN0MUxhYmVsLFxyXG4gICAgICBtYXNzMkxhYmVsOiB0aGlzLm9iamVjdDJMYWJlbCxcclxuICAgICAgbTFNYXNzOiB0aGlzLmdldEZvcm1hdHRlZE1hc3MoIHRoaXMub2JqZWN0MS52YWx1ZVByb3BlcnR5LmdldCgpICksXHJcbiAgICAgIG0yTWFzczogdGhpcy5nZXRGb3JtYXR0ZWRNYXNzKCB0aGlzLm9iamVjdDIudmFsdWVQcm9wZXJ0eS5nZXQoKSApLFxyXG4gICAgICBjb21wYXJhdGl2ZVZhbHVlOiByZWxhdGl2ZVNpemVcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhlbHBlciBmdW5jdGlvbiwgaGFyZCBjb2RlZCBmcm9tIHRoZSBmaXJzdCBvYmplY3QncyBwZXJzcGVjdGl2ZVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE0xUmVsYXRpdmVTaXplKCkge1xyXG4gICAgY29uc3QgcmVsYXRpdmVTaXplID0gdGhpcy5nZXRSZWxhdGl2ZVNpemVPckRlbnNpdHkoIE9CSkVDVF9PTkUgKTtcclxuICAgIGNvbnN0IGZpcnN0T2JqZWN0TGFiZWwgPSB0aGlzLmdldE9iamVjdExhYmVsRnJvbUVudW0oIE9CSkVDVF9PTkUgKTtcclxuICAgIGNvbnN0IHNlY29uZE9iamVjdExhYmVsID0gdGhpcy5nZXRPdGhlck9iamVjdExhYmVsRnJvbUVudW0oIE9CSkVDVF9PTkUgKTtcclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIG9iamVjdHNSZWxhdGl2ZVNpemVQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIGZpcnN0T2JqZWN0TGFiZWw6IGZpcnN0T2JqZWN0TGFiZWwsXHJcbiAgICAgIHJlbGF0aXZlU2l6ZTogcmVsYXRpdmVTaXplLFxyXG4gICAgICBzZWNvbmRPYmplY3RMYWJlbDogc2Vjb25kT2JqZWN0TGFiZWxcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBvcHRpb25zLmZvcm1hdE1hc3NWYWx1ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYXNzXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0Rm9ybWF0dGVkTWFzcyggbWFzcyApIHtcclxuICAgIHJldHVybiB0aGlzLmZvcm1hdE1hc3NWYWx1ZSggdGhpcy5jb252ZXJ0TWFzc1ZhbHVlKCBtYXNzICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYXNzVmFsdWVcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRNYXNzU2l6ZSggbWFzc1ZhbHVlICkge1xyXG4gICAgY29uc3QgbWFzc0luZGV4ID0gZ2V0TWFzc1NpemVJbmRleCggbWFzc1ZhbHVlLCBTSVpFX1NUUklOR1MubGVuZ3RoICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBtYXNzSW5kZXggKSAmJiBtYXNzSW5kZXggPCBTSVpFX1NUUklOR1MubGVuZ3RoLCAnd3JvbmcgaW5kZXggZm9yIHNpemUgc3RyaW5ncycgKTtcclxuICAgIHJldHVybiBTSVpFX1NUUklOR1NbIG1hc3NJbmRleCBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtJU0xDT2JqZWN0RW51bX0gb2JqZWN0RW51bVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE1hc3NBbmRVbml0KCBvYmplY3RFbnVtICkge1xyXG4gICAgY29uc3QgdGhpc09iamVjdE1hc3MgPSB0aGlzLmdldE9iamVjdEZyb21FbnVtKCBvYmplY3RFbnVtICkudmFsdWVQcm9wZXJ0eS5nZXQoKTtcclxuICAgIGNvbnN0IG1hc3NWYWx1ZSA9IHRoaXMuZ2V0Rm9ybWF0dGVkTWFzcyggdGhpc09iamVjdE1hc3MgKTtcclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIG1hc3NBbmRVbml0UGF0dGVyblN0cmluZywgeyBtYXNzVmFsdWU6IG1hc3NWYWx1ZSB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBzdHJpbmcgJ0FzIG1hc3MgZ2V0cyBiaWdnZXIvc21hbGxlcicgZm9yIHVzZSBpbiBsYXJnZXIgc3RyaW5nIHBhdHRlcm5zLlxyXG4gICAqIElmIHRoZSByYWRpaSBhcmUgc2V0IHRvIGNvbnN0YW50IHNpemUsIHRoZW4gdXNlIFwiZGVuc2l0eSBpbmNyZWFzaW5nL2RlY3JlYXNpbmdcIiB0ZXJtaW5vbG9neSBpbnN0ZWFkXHJcbiAgICpcclxuICAgKiBAcGFyYW0gIHtJU0xDT2JqZWN0RW51bX0gdGhpc09iamVjdEVudW1cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRNYXNzT3JEZW5zaXR5Q2hhbmdlQ2xhdXNlKCB0aGlzT2JqZWN0RW51bSApIHtcclxuICAgIGNvbnN0IGNoYW5nZURpcmVjdGlvblBocmFzZSA9IHRoaXMuZ2V0TWFzc09yRGVuc2l0eUNoYW5nZURpcmVjdGlvblBocmFzZSggdGhpc09iamVjdEVudW0gKTtcclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIG1hc3NDaGFuZ2VDbGF1c2VQYXR0ZXJuU3RyaW5nLCB7IGNoYW5nZURpcmVjdGlvblBocmFzZTogY2hhbmdlRGlyZWN0aW9uUGhyYXNlIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHN0cmluZyAnQXMgbWFzcyBnZXRzIGJpZ2dlci9zbWFsbGVyIGFuZCBtb3ZlcyBsZWZ0L3JpZ2h0JyBmb3IgdXNlIGluIGxhcmdlciBzdHJpbmcgcGF0dGVybnMuXHJcbiAgICogSWYgdGhlIHJhZGlpIGFyZSBzZXQgdG8gY29uc3RhbnQgc2l6ZSwgdGhlbiB1c2UgXCJkZW5zaXR5IGluY3JlYXNpbmcvZGVjcmVhc2luZ1wiIHRlcm1pbm9sb2d5IGluc3RlYWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSAge0lTTENPYmplY3RFbnVtfSB0aGlzT2JqZWN0RW51bVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE1hc3NDaGFuZ2VzQW5kTW92ZXNDbGF1c2UoIHRoaXNPYmplY3RFbnVtICkge1xyXG4gICAgY29uc3QgY2hhbmdlRGlyZWN0aW9uUGhyYXNlID0gdGhpcy5nZXRNYXNzT3JEZW5zaXR5Q2hhbmdlRGlyZWN0aW9uUGhyYXNlKCB0aGlzT2JqZWN0RW51bSApO1xyXG4gICAgY29uc3QgbGVmdE9yUmlnaHQgPSB0aGlzLmdldFB1c2hEaXJlY3Rpb25UZXh0KCB0aGlzT2JqZWN0RW51bSApO1xyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggbWFzc0NoYW5nZXNBbmRNb3Zlc0NsYXVzZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgY2hhbmdlRGlyZWN0aW9uUGhyYXNlOiBjaGFuZ2VEaXJlY3Rpb25QaHJhc2UsXHJcbiAgICAgIGxlZnRPclJpZ2h0OiBsZWZ0T3JSaWdodFxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3RyaW5nICdBcyBtYXNzIGdldHMgYmlnZ2VyL3NtYWxsZXIgYW5kIG1vdmVzIHt7b3RoZXJPYmplY3RMYWJlbH19IGxlZnQvcmlnaHQnIGZvciB1c2UgaW4gbGFyZ2VyIHN0cmluZyBwYXR0ZXJucy5cclxuICAgKiBJZiB0aGUgcmFkaWkgYXJlIHNldCB0byBjb25zdGFudCBzaXplLCB0aGVuIHVzZSBcImRlbnNpdHkgaW5jcmVhc2luZy9kZWNyZWFzaW5nXCIgdGVybWlub2xvZ3kgaW5zdGVhZFxyXG4gICAqXHJcbiAgICogQHBhcmFtICB7SVNMQ09iamVjdEVudW19IHRoaXNPYmplY3RFbnVtXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TWFzc0NoYW5nZXNBbmRNb3Zlc090aGVyQ2xhdXNlKCB0aGlzT2JqZWN0RW51bSApIHtcclxuICAgIGNvbnN0IGNoYW5nZURpcmVjdGlvblBocmFzZSA9IHRoaXMuZ2V0TWFzc09yRGVuc2l0eUNoYW5nZURpcmVjdGlvblBocmFzZSggdGhpc09iamVjdEVudW0gKTtcclxuICAgIGNvbnN0IG90aGVyT2JqZWN0TGFiZWwgPSB0aGlzLmdldE90aGVyT2JqZWN0TGFiZWxGcm9tRW51bSggdGhpc09iamVjdEVudW0gKTtcclxuICAgIGNvbnN0IGxlZnRPclJpZ2h0ID0gdGhpcy5nZXRQdXNoRGlyZWN0aW9uVGV4dCggSVNMQ09iamVjdEVudW0uZ2V0T3RoZXJPYmplY3RFbnVtKCB0aGlzT2JqZWN0RW51bSApICk7XHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBtYXNzQ2hhbmdlc01vdmVzT3RoZXJDbGF1c2VQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIGNoYW5nZURpcmVjdGlvblBocmFzZTogY2hhbmdlRGlyZWN0aW9uUGhyYXNlLFxyXG4gICAgICBvdGhlck9iamVjdExhYmVsOiBvdGhlck9iamVjdExhYmVsLFxyXG4gICAgICBsZWZ0T3JSaWdodDogbGVmdE9yUmlnaHRcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgJ21hc3MgZ2V0cyBiaWdnZXIvc21hbGxlcicgYmFzZWQgb24gdGhlIG1vc3QgcmVjZW50IGNoYW5nZSB0byB0aGUgcGFzc2VkLWluIG1hc3MuXHJcbiAgICogSWYgdGhlIHJhZGlpIGFyZSBzZXQgdG8gY29uc3RhbnQgc2l6ZSwgdGhlbiB1c2UgXCJkZW5zaXR5IGluY3JlYXNpbmcvZGVjcmVhc2luZ1wiIHRlcm1pbm9sb2d5IGluc3RlYWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSAge0lTTENPYmplY3RFbnVtfSBvYmplY3RFbnVtXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldE1hc3NPckRlbnNpdHlDaGFuZ2VEaXJlY3Rpb25QaHJhc2UoIG9iamVjdEVudW0gKSB7XHJcbiAgICBjb25zdCBpc0dyb3dpbmcgPSBJU0xDT2JqZWN0RW51bS5pc09iamVjdDEoIG9iamVjdEVudW0gKSA/IHRoaXMubWFzczFHcm93aW5nIDogdGhpcy5tYXNzMkdyb3dpbmc7XHJcblxyXG4gICAgbGV0IGRpcmVjdGlvblBocmFzZSA9IGlzR3Jvd2luZyA/IG1hc3NHZXRzQmlnZ2VyU3RyaW5nIDogbWFzc0dldHNTbWFsbGVyU3RyaW5nO1xyXG5cclxuICAgIC8vIHNwZWNpZmljIGRlbnNpdHkgcmVsYXRlZCB2ZXJiYWdlXHJcbiAgICBpZiAoIHRoaXMuY29uc3RhbnRSYWRpdXNQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgZGlyZWN0aW9uUGhyYXNlID0gaXNHcm93aW5nID8gZGVuc2l0eUluY3JlYXNlc1N0cmluZyA6IGRlbnNpdHlEZWNyZWFzZXNTdHJpbmc7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGlyZWN0aW9uUGhyYXNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtJU0xDT2JqZWN0RW51bX0gdGhpc09iamVjdEVudW1cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNhcGl0YWxpemVkXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0UmVsYXRpdmVTaXplT3JEZW5zaXR5KCB0aGlzT2JqZWN0RW51bSwgY2FwaXRhbGl6ZWQgPSBmYWxzZSApIHtcclxuICAgIGNvbnN0IHRoaXNPYmplY3QgPSB0aGlzLmdldE9iamVjdEZyb21FbnVtKCB0aGlzT2JqZWN0RW51bSApO1xyXG4gICAgY29uc3Qgb3RoZXJPYmplY3QgPSB0aGlzLmdldE90aGVyT2JqZWN0RnJvbUVudW0oIHRoaXNPYmplY3RFbnVtICk7XHJcbiAgICBjb25zdCByYXRpbyA9IHRoaXNPYmplY3QudmFsdWVQcm9wZXJ0eS52YWx1ZSAvIG90aGVyT2JqZWN0LnZhbHVlUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBpbmRleCA9IGdldFJlbGF0aXZlU2l6ZU9yRGVuc2l0eUluZGV4KCByYXRpbyApO1xyXG5cclxuICAgIC8vIHVzZSBzaXplIG9yIGRlbnNpdHkgZGVwZW5kaW5nIG9uIGlmIGNvbnN0YW50IGNoZWNrYm94IGlzIGNoZWNrZWQuXHJcbiAgICByZXR1cm4gdGhpcy5jb25zdGFudFJhZGl1c1Byb3BlcnR5LmdldCgpID8gZ2V0UmVsYXRpdmVEZW5zaXR5RnJvbUluZGV4KCBpbmRleCwgY2FwaXRhbGl6ZWQgKSA6IGdldFJlbGF0aXZlU2l6ZUZyb21JbmRleCggaW5kZXgsIGNhcGl0YWxpemVkICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBkZXNjcmlwdGlvbiBvZiB0aGUgbWFzcyByZWxhdGl2ZSB0byB0aGUgb3RoZXIgbWFzcywgd2hlbiBhIG1hc3MgdmFsdWUgaXMgYXQgaXRzIG1pbiBvciBtYXhcclxuICAgKiB2YWx1ZS4gQ2VydGFpbiBpbmZvcm1hdGlvbiBpcyBleGNsdWRlZCBpZiB0aGF0IGNvbnRlbnQgaXMgaW52aXNpYmxlOlxyXG4gICAqIFdpbGwgcmV0dXJuIHNvbWV0aGluZyBsaWtlOlxyXG4gICAqXHJcbiAgICogXCJIYWxmIHRoZSBzaXplIG9mIG1hc3MgMSwgZm9yY2UgYXJyb3dzIHRpbnksIGZvcmNlIGFycm93cyA4LjMgbmV3dG9ucy5cIiBPUlxyXG4gICAqIFwiTXVjaCBtdWNoIGxhcmdlciB0aGFuIG1hc3MgMSwgZm9yY2UgYXJyb3dzIHZlcnkgc21hbGwuXCJcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7SVNMQ09iamVjdEVudW19IHRoaXNPYmplY3RFbnVtXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRNYXNzTWF4TWluVGV4dCggdGhpc09iamVjdEVudW0gKSB7XHJcbiAgICBsZXQgZGVzY3JpcHRpb25TdHJpbmcgPSAnJztcclxuXHJcbiAgICBjb25zdCByZWxhdGl2ZVNpemVTdHJpbmcgPSB0aGlzLmdldFJlbGF0aXZlU2l6ZU9yRGVuc2l0eSggdGhpc09iamVjdEVudW0sIHRydWUgKTtcclxuICAgIGNvbnN0IG90aGVyT2JqZWN0TGFiZWxTdHJpbmcgPSB0aGlzLmdldE90aGVyT2JqZWN0TGFiZWxGcm9tRW51bSggdGhpc09iamVjdEVudW0gKTtcclxuICAgIGNvbnN0IGZvcmNlVmVjdG9yU2l6ZVN0cmluZyA9IHRoaXMuZm9yY2VEZXNjcmliZXIuZ2V0Rm9yY2VWZWN0b3JzU2l6ZSgpO1xyXG5cclxuICAgIGlmICggdGhpcy5zaG93Rm9yY2VWYWx1ZXNQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgZGVzY3JpcHRpb25TdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIG1hc3NNYXhNaW5Cb3JkZXJUZXh0V2l0aEZvcmNlU3RyaW5nLCB7XHJcbiAgICAgICAgcmVsYXRpdmVTaXplOiByZWxhdGl2ZVNpemVTdHJpbmcsXHJcbiAgICAgICAgb3RoZXJPYmplY3RMYWJlbDogb3RoZXJPYmplY3RMYWJlbFN0cmluZyxcclxuICAgICAgICBmb3JjZVZlY3RvclNpemU6IGZvcmNlVmVjdG9yU2l6ZVN0cmluZyxcclxuICAgICAgICBmb3JjZTogdGhpcy5mb3JjZURlc2NyaWJlci5nZXRGb3JtYXR0ZWRGb3JjZSgpLFxyXG4gICAgICAgIHVuaXQ6IHRoaXMuZm9yY2VEZXNjcmliZXIudW5pdHNcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGRlc2NyaXB0aW9uU3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCBtYXNzTWF4TWluQm9yZGVyVGV4dFdpdGhvdXRGb3JjZVN0cmluZywge1xyXG4gICAgICAgIHJlbGF0aXZlU2l6ZTogcmVsYXRpdmVTaXplU3RyaW5nLFxyXG4gICAgICAgIG90aGVyT2JqZWN0TGFiZWw6IG90aGVyT2JqZWN0TGFiZWxTdHJpbmcsXHJcbiAgICAgICAgZm9yY2VWZWN0b3JTaXplOiBmb3JjZVZlY3RvclNpemVTdHJpbmdcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZXNjcmlwdGlvblN0cmluZztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEVhY2ggb2JqZWN0IGNhbiBvbmx5IGJlIHB1c2hlZCBpbiBvbmUgZGlyZWN0aW9uLiBSZXR1cm5zICdsZWZ0JyBvciAncmlnaHQnIGJhc2VkIG9uIHRoZSBvYmplY3QgcGFzc2VkIGluLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSAge0lTTENPYmplY3RFbnVtfSBvYmplY3RFbnVtXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRQdXNoRGlyZWN0aW9uVGV4dCggb2JqZWN0RW51bSApIHtcclxuICAgIHJldHVybiBJU0xDT2JqZWN0RW51bS5pc09iamVjdDEoIG9iamVjdEVudW0gKSA/IGxlZnRTdHJpbmcgOiByaWdodFN0cmluZztcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBzaG91bGQgYmUgYW4gaW5kZXhcclxuICogQHBhcmFtIHtib29sZWFufSBjYXBpdGFsaXplZCAtIGlmIHRoZSBwaHJhc2Ugc2hvdWxkIGJlIGNhcGl0YWxpemVkXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAqL1xyXG5jb25zdCBnZXRSZWxhdGl2ZVNpemVGcm9tSW5kZXggPSAoIGluZGV4LCBjYXBpdGFsaXplZCApID0+IHtcclxuICBjb25zdCBhcnJheSA9IGNhcGl0YWxpemVkID8gUkVMQVRJVkVfU0laRV9DQVBJVEFMSVpFRF9TVFJJTkdTIDogUkVMQVRJVkVfU0laRV9TVFJJTkdTO1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIGluZGV4ICkgJiYgaW5kZXggPCBhcnJheS5sZW5ndGggKTtcclxuICByZXR1cm4gYXJyYXlbIGluZGV4IF07XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gc2hvdWxkIGJlIGFuIGluZGV4XHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gY2FwaXRhbGl6ZWQgLSBpZiB0aGUgcGhyYXNlIHNob3VsZCBiZSBjYXBpdGFsaXplZFxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gKi9cclxuY29uc3QgZ2V0UmVsYXRpdmVEZW5zaXR5RnJvbUluZGV4ID0gKCBpbmRleCwgY2FwaXRhbGl6ZWQgKSA9PiB7XHJcbiAgY29uc3QgYXJyYXkgPSBjYXBpdGFsaXplZCA/IFJFTEFUSVZFX0RFTlNJVFlfQ0FQSVRBTElaRURfU1RSSU5HUyA6IFJFTEFUSVZFX0RFTlNJVFlfU1RSSU5HUztcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBpbmRleCApICYmIGluZGV4IDwgYXJyYXkubGVuZ3RoICk7XHJcbiAgcmV0dXJuIGFycmF5WyBpbmRleCBdO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1hcHBlZCBpbnRlZ2VyIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGFwcHJvcHJpYXRlIHF1YWxpdGF0aXZlIHNpemUvZGVuc2l0eSBjb21wYXJpc29uIGJldHdlZW4gbWFzc2VzLlxyXG4gKiBUaGVyZSBhcmUgdGhlIHNhbWUgbnVtYmVyIG9mIHNpemUgc3RyaW5ncyBhcyBkZW5zaXR5IHN0cmluZ3NcclxuICogVGhlc2UgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB2YWx1ZXMgd2VyZSBkZXNpZ25lZCwgc2VlIGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL2RvY3VtZW50L2QvMS0zN3FBZ2RlMlhybFhCUWFlMlNnamFydE0zNV9FbnpERDlwZHRkM25YQU0vZWRpdCNoZWFkaW5nPWgubmhxeGpiYnkzZGd1XHJcbiAqXHJcbiAqIEBwYXJhbSAge251bWJlcn0gcmF0aW9cclxuICogQHJldHVybnMge251bWJlcn0gLSBhbiBpbnRlZ2VyXHJcbiAqL1xyXG5jb25zdCBnZXRSZWxhdGl2ZVNpemVPckRlbnNpdHlJbmRleCA9IHJhdGlvID0+IHtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCByYXRpbyA+IDAsICdyYXRpbyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gemVybz8nICk7XHJcblxyXG4gIGlmICggcmF0aW8gPCAwLjUgKSB7XHJcbiAgICByZXR1cm4gMDtcclxuICB9XHJcbiAgaWYgKCByYXRpbyA9PT0gMC41ICkge1xyXG4gICAgcmV0dXJuIDE7XHJcbiAgfVxyXG4gIGlmICggcmF0aW8gPCAwLjc1ICkge1xyXG4gICAgcmV0dXJuIDI7XHJcbiAgfVxyXG4gIGlmICggcmF0aW8gPCAxICkge1xyXG4gICAgcmV0dXJuIDM7XHJcbiAgfVxyXG4gIGlmICggcmF0aW8gPT09IDEgKSB7XHJcbiAgICByZXR1cm4gNDtcclxuICB9XHJcbiAgaWYgKCByYXRpbyA8IDEuNSApIHtcclxuICAgIHJldHVybiA1O1xyXG4gIH1cclxuICBpZiAoIHJhdGlvIDwgMiApIHtcclxuICAgIHJldHVybiA2O1xyXG4gIH1cclxuICBpZiAoIHJhdGlvID09PSAyICkge1xyXG4gICAgcmV0dXJuIDc7XHJcbiAgfVxyXG4gIGlmICggcmF0aW8gPiAyICkge1xyXG4gICAgcmV0dXJuIDg7XHJcbiAgfVxyXG5cclxuICB0aHJvdyBuZXcgRXJyb3IoIGB1bnJlY29nbml6ZWQgcmF0aW86ICR7cmF0aW99YCApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRoZXNlIGVtcGlyaWNhbGx5IGRldGVybWluZWQgdmFsdWVzIHdlcmUgZGVzaWduZWQsIHNlZSBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9kb2N1bWVudC9kLzEtMzdxQWdkZTJYcmxYQlFhZTJTZ2phcnRNMzVfRW56REQ5cGR0ZDNuWEFNL2VkaXQjaGVhZGluZz1oLm5ocXhqYmJ5M2RndVxyXG4gKiBAcGFyYW0ge251bWJlcn0gbWFzcyAtIGdpdmVuIHRoZSBtYXNzIG9mIHRoZSBvYmplY3QuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXJPZlJlZ2lvbnMgLSBmb3IgY3Jvc3MgY2hlY2tpbmdcclxuICogQHJldHVybnMge251bWJlcn0gLSBpbnRlZ2VyIGFycmF5IGluZGV4XHJcbiAqL1xyXG5jb25zdCBnZXRNYXNzU2l6ZUluZGV4ID0gKCBtYXNzLCBudW1iZXJPZlJlZ2lvbnMgKSA9PiB7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggKCB0eXBlb2YgbWFzcyApID09PSAnbnVtYmVyJyApO1xyXG5cclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBudW1iZXJPZlJlZ2lvbnMgPT09IDcsICdJZiBudW1iZXJPZlJlZ2lvbnMgY2hhbmdlcywgdGhpcyBmdW5jdGlvbiBzaG91bGQgdG9vLicgKTtcclxuICBpZiAoIG1hc3MgPCAyNiApIHtcclxuICAgIHJldHVybiAwO1xyXG4gIH1cclxuICBpZiAoIG1hc3MgPCAxMDEgKSB7XHJcbiAgICByZXR1cm4gMTtcclxuICB9XHJcbiAgaWYgKCBtYXNzIDwgNDAxICkge1xyXG4gICAgcmV0dXJuIDI7XHJcbiAgfVxyXG4gIGlmICggbWFzcyA8IDYwMSApIHtcclxuICAgIHJldHVybiAzO1xyXG4gIH1cclxuICBpZiAoIG1hc3MgPCA4MDEgKSB7XHJcbiAgICByZXR1cm4gNDtcclxuICB9XHJcbiAgaWYgKCBtYXNzIDwgOTAxICkge1xyXG4gICAgcmV0dXJuIDU7XHJcbiAgfVxyXG4gIGlmICggbWFzcyA8PSAxMDAwICkge1xyXG4gICAgcmV0dXJuIDY7XHJcbiAgfVxyXG4gIHRocm93IG5ldyBFcnJvciggJ0ludmFsaWQgbWFzcyB2YWx1ZS4nICk7XHJcbn07XHJcblxyXG5ncmF2aXR5Rm9yY2VMYWIucmVnaXN0ZXIoICdNYXNzRGVzY3JpYmVyJywgTWFzc0Rlc2NyaWJlciApO1xyXG5leHBvcnQgZGVmYXVsdCBNYXNzRGVzY3JpYmVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FB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