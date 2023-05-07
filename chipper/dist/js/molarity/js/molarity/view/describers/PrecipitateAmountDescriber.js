// Copyright 2019-2022, University of Colorado Boulder

/**
 * PrecipitateAmountDescriber is responsible for formulating strings about Solution.precipitateAmountProperty. This
 * includes descriptions set in the PDOM, as well as context responses set through UtteranceQueue. Note that while
 * these descriptions relate to the precipitateAmountProperty from the model, the precipitates are referred to as
 * "solids" in the descriptions. Therefore, while most of the methods still refer to precipitate amount, the strings
 * and string names often refer to "solids" instead.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Taylor Want (PhET Interactive Simulations)
 */

import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import molarity from '../../../molarity.js';
import MolarityStrings from '../../../MolarityStrings.js';
import Solution from '../../model/Solution.js';
import MolarityConstants from '../../MolarityConstants.js';
const atMaxConcentrationPatternString = MolarityStrings.a11y.atMaxConcentrationPattern;
const beakerSaturationPatternString = MolarityStrings.a11y.beaker.saturationPattern;
const saturationLostNoSoluteAlertString = MolarityStrings.a11y.saturationLostNoSoluteAlert;
const saturationLostQualitativeAlertPatternString = MolarityStrings.a11y.saturationLostQualitativeAlertPattern;
const saturationLostQuantitativeAlertPatternString = MolarityStrings.a11y.saturationLostQuantitativeAlertPattern;
const saturationReachedAlertPatternString = MolarityStrings.a11y.saturationReachedAlertPattern;
const stillSaturatedAlertPatternString = MolarityStrings.a11y.stillSaturatedAlertPattern;
const withSolidsAlertPatternString = MolarityStrings.a11y.withSolidsAlertPattern;
const solidsChangePatternString = MolarityStrings.a11y.solidsChangePattern;

// PrecipitateParticles Amount capitalized region strings
const precipitateAmountRegionsCapitalizedALotOfString = MolarityStrings.a11y.precipitateAmountRegions.capitalized.aLotOf;
const precipitateAmountRegionsCapitalizedABunchOfString = MolarityStrings.a11y.precipitateAmountRegions.capitalized.aBunchOf;
const precipitateAmountRegionsCapitalizedSomeString = MolarityStrings.a11y.precipitateAmountRegions.capitalized.some;
const precipitateAmountRegionsCapitalizedACoupleOfString = MolarityStrings.a11y.precipitateAmountRegions.capitalized.aCoupleOf;
const precipitateAmountRegionsCapitalizedAFewString = MolarityStrings.a11y.precipitateAmountRegions.capitalized.aFew;

// PrecipitateParticles Amount lowercase region strings
const precipitateAmountRegionsLowercaseALotOfString = MolarityStrings.a11y.precipitateAmountRegions.lowercase.aLotOf;
const precipitateAmountRegionsLowercaseABunchOfString = MolarityStrings.a11y.precipitateAmountRegions.lowercase.aBunchOf;
const precipitateAmountRegionsLowercaseSomeString = MolarityStrings.a11y.precipitateAmountRegions.lowercase.some;
const precipitateAmountRegionsLowercaseACoupleOfString = MolarityStrings.a11y.precipitateAmountRegions.lowercase.aCoupleOf;
const precipitateAmountRegionsLowercaseAFewString = MolarityStrings.a11y.precipitateAmountRegions.lowercase.aFew;

// Change strings
const lessCapitalizedString = MolarityStrings.a11y.less.capitalized;
const moreCapitalizedString = MolarityStrings.a11y.more.capitalized;
const lessLowercaseString = MolarityStrings.a11y.less.lowercase;
const moreLowercaseString = MolarityStrings.a11y.more.lowercase;

// constants
const PRECIPITATE_AMOUNT_STRINGS_CAPITALIZED = [precipitateAmountRegionsCapitalizedACoupleOfString, precipitateAmountRegionsCapitalizedAFewString, precipitateAmountRegionsCapitalizedSomeString, precipitateAmountRegionsCapitalizedABunchOfString, precipitateAmountRegionsCapitalizedALotOfString];
const PRECIPITATE_AMOUNT_STRINGS_LOWERCASE = [precipitateAmountRegionsLowercaseACoupleOfString, precipitateAmountRegionsLowercaseAFewString, precipitateAmountRegionsLowercaseSomeString, precipitateAmountRegionsLowercaseABunchOfString, precipitateAmountRegionsLowercaseALotOfString];
class PrecipitateAmountDescriber {
  /**
   * @param {Solution} solution - from MolarityModel
   * @param {ConcentrationDescriber} concentrationDescriber
   * @param {Property.<boolean>} useQuantitativeDescriptionsProperty
   */
  constructor(solution, concentrationDescriber, useQuantitativeDescriptionsProperty) {
    // @private
    this.solution = solution;
    this.concentrationDescriber = concentrationDescriber;
    this.precipitateAmountProperty = solution.precipitateAmountProperty;
    this.useQuantitativeDescriptionsProperty = useQuantitativeDescriptionsProperty;

    // @private {number|null} - tracks the index of the last descriptive region for precipitateAmount from
    // PRECIPITATE_AMOUNT_STRINGS arrays
    let lastPrecipitateAmountIndex = this.getCurrentPrecipitateAmountIndex();

    // @private {boolean|null} - should only be updated and accessed when the precipitateAmountProperty changes, so
    // while it will be null at some points, it will only be accessed when it holds boolean values (True if precipitateAmount
    // has increased, False if it has decreased)
    this.precipitateAmountIncreased = null;

    // @private {boolean|null} - tracks whether the descriptive regions for the precipitateAmountProperty has changed
    // (since region changes trigger the different descriptive text in the aria-live alerts).
    this.precipiateAmountRegionChanged = null;

    // update fields (documented above) when precipitateAmountProperty changes
    this.precipitateAmountProperty.lazyLink((newValue, oldValue) => {
      const newPrecipitateAmountIndex = this.getCurrentPrecipitateAmountIndex();
      this.precipitateAmountIncreased = newValue > oldValue;
      this.precipiateAmountRegionChanged = newPrecipitateAmountIndex !== lastPrecipitateAmountIndex;
      lastPrecipitateAmountIndex = newPrecipitateAmountIndex;
    });
  }

  /**
   * Calculates the index of the current precipitateAmount region using the precipitateAmountProperty and the saturated
   * concentration level of the currently selected solute
   * @private
   * @returns {Number} - index of the current precipitateAmount description region
   * */
  getCurrentPrecipitateAmountIndex() {
    return precipitateAmountToIndex(this.precipitateAmountProperty.value, this.concentrationDescriber.getCurrentSaturatedConcentration());
  }

  /**
   * Gets the qualitative description of the amount of precipitate in the beaker.
   * @public
   * @param [isCapitalized] {boolean}
   * @returns {string} - example: "a bunch"
   */
  getCurrentPrecipitateAmountDescription(isCapitalized = false) {
    const precipitateAmountIndex = this.getCurrentPrecipitateAmountIndex();
    return isCapitalized ? PRECIPITATE_AMOUNT_STRINGS_CAPITALIZED[precipitateAmountIndex] : PRECIPITATE_AMOUNT_STRINGS_LOWERCASE[precipitateAmountIndex];
  }

  /**
   * Creates a string that describes the precipitate amount in the beaker
   * @public
   * @returns {string} - e.g. "is saturated with a bunch of solids"
   */
  getBeakerSaturationString() {
    return StringUtils.fillIn(beakerSaturationPatternString, {
      solids: this.getCurrentPrecipitateAmountDescription()
    });
  }

  /**
   * Fills in information about the state of the solution (its saturation and the amount of precipitate) if region has changed
   * and the solution is saturated.
   * @public
   * @returns {string} - example: "still saturated with a bunch of solids"
   */
  getStillSaturatedClause() {
    const maxConcentrationString = StringUtils.fillIn(atMaxConcentrationPatternString, {
      concentration: this.concentrationDescriber.getCurrentConcentrationClause(true)
    });
    let withSolidsString = '';

    // the amount of precipitate is only given if the region has changed.
    if (this.precipiateAmountRegionChanged) {
      withSolidsString = StringUtils.fillIn(withSolidsAlertPatternString, {
        solidAmount: this.getCurrentPrecipitateAmountDescription()
      });
    }
    return StringUtils.fillIn(stillSaturatedAlertPatternString, {
      withSolids: withSolidsString,
      maxConcentration: maxConcentrationString
    });
  }

  /**
   * Creates a substring to describe the change in the amount of precipitate
   * @param [isCapitalized] {boolean}
   * @public
   * @returns {string} - example: "more solids"
   */
  getPrecipitateAmountChangeString(isCapitalized = false) {
    assert && assert(this.solution.isSaturated(), 'precipitateAmountProperty should be greater than 0');
    let moreLessString = isCapitalized ? lessCapitalizedString : lessLowercaseString;
    if (this.precipitateAmountIncreased) {
      moreLessString = isCapitalized ? moreCapitalizedString : moreLowercaseString;
    }
    return StringUtils.fillIn(solidsChangePatternString, {
      moreLess: moreLessString
    });
  }

  /**
   * Creates the string to be read out when the solution is either newly saturated or newly unsaturated.
   * @public
   * @returns {string}
   * */
  getSaturationChangedString() {
    assert && assert(this.concentrationDescriber.saturationValueChanged, 'saturation state has not changed');
    const saturationLostAlertString = this.useQuantitativeDescriptionsProperty.value ? saturationLostQuantitativeAlertPatternString : saturationLostQualitativeAlertPatternString;

    // alerts are different based on whether the solution is newly saturated or newly unsaturated.
    if (this.solution.isSaturated()) {
      // newly saturated alert
      return StringUtils.fillIn(saturationReachedAlertPatternString, {
        solids: this.getCurrentPrecipitateAmountDescription(),
        concentration: this.concentrationDescriber.getCurrentConcentrationClause(true)
      });
    } else {
      // newly unsaturated alerts -- there is a special case where the solution goes from saturated to zero solute, which
      // is handled with the condition !this.solution.hasSolute().
      if (!this.solution.hasSolute()) {
        // Because monitoring a concentrationDescriber.saturationValueChanged is updated by links to concentrationProperty
        // and precipitateAmountProperty,if there is no solute in the beaker, concentrationDescriber.saturationValueChanged
        // will not be updated, and must therefore be manually updated.
        this.concentrationDescriber.saturationValueChanged = false;
        return saturationLostNoSoluteAlertString;
      } else {
        return StringUtils.fillIn(saturationLostAlertString, {
          concentration: this.concentrationDescriber.getCurrentConcentrationClause(true)
        });
      }
    }
  }
}

/**
 * Calculates which item to use from the precipitate amount regions string arrays.
 * @param {number} currentPrecipitateAmount - in moles, see Solution.js
 * @param {number} saturatedConcentrationForSolute -  the saturation point for a specific solute
 * @returns {number} - index to pull from precipitate amount regions string arrays
 */
const precipitateAmountToIndex = (currentPrecipitateAmount, saturatedConcentrationForSolute) => {
  // maximum precipitates possible for a given solute, which is the solute amount it takes to saturate at min volume.
  const maxPrecipitateAmount = Solution.computePrecipitateAmount(MolarityConstants.SOLUTION_VOLUME_RANGE.min, MolarityConstants.SOLUTE_AMOUNT_RANGE.max, saturatedConcentrationForSolute);
  const numberOfIncrements = PRECIPITATE_AMOUNT_STRINGS_CAPITALIZED.length;
  const scaleIncrement = maxPrecipitateAmount / numberOfIncrements;
  for (let i = 0; i < numberOfIncrements - 1; i++) {
    if (currentPrecipitateAmount <= (i + 1) * scaleIncrement) {
      return i;
    }
  }
  return PRECIPITATE_AMOUNT_STRINGS_CAPITALIZED.length - 1;
};
molarity.register('PrecipitateAmountDescriber', PrecipitateAmountDescriber);
export default PrecipitateAmountDescriber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdVdGlscyIsIm1vbGFyaXR5IiwiTW9sYXJpdHlTdHJpbmdzIiwiU29sdXRpb24iLCJNb2xhcml0eUNvbnN0YW50cyIsImF0TWF4Q29uY2VudHJhdGlvblBhdHRlcm5TdHJpbmciLCJhMTF5IiwiYXRNYXhDb25jZW50cmF0aW9uUGF0dGVybiIsImJlYWtlclNhdHVyYXRpb25QYXR0ZXJuU3RyaW5nIiwiYmVha2VyIiwic2F0dXJhdGlvblBhdHRlcm4iLCJzYXR1cmF0aW9uTG9zdE5vU29sdXRlQWxlcnRTdHJpbmciLCJzYXR1cmF0aW9uTG9zdE5vU29sdXRlQWxlcnQiLCJzYXR1cmF0aW9uTG9zdFF1YWxpdGF0aXZlQWxlcnRQYXR0ZXJuU3RyaW5nIiwic2F0dXJhdGlvbkxvc3RRdWFsaXRhdGl2ZUFsZXJ0UGF0dGVybiIsInNhdHVyYXRpb25Mb3N0UXVhbnRpdGF0aXZlQWxlcnRQYXR0ZXJuU3RyaW5nIiwic2F0dXJhdGlvbkxvc3RRdWFudGl0YXRpdmVBbGVydFBhdHRlcm4iLCJzYXR1cmF0aW9uUmVhY2hlZEFsZXJ0UGF0dGVyblN0cmluZyIsInNhdHVyYXRpb25SZWFjaGVkQWxlcnRQYXR0ZXJuIiwic3RpbGxTYXR1cmF0ZWRBbGVydFBhdHRlcm5TdHJpbmciLCJzdGlsbFNhdHVyYXRlZEFsZXJ0UGF0dGVybiIsIndpdGhTb2xpZHNBbGVydFBhdHRlcm5TdHJpbmciLCJ3aXRoU29saWRzQWxlcnRQYXR0ZXJuIiwic29saWRzQ2hhbmdlUGF0dGVyblN0cmluZyIsInNvbGlkc0NoYW5nZVBhdHRlcm4iLCJwcmVjaXBpdGF0ZUFtb3VudFJlZ2lvbnNDYXBpdGFsaXplZEFMb3RPZlN0cmluZyIsInByZWNpcGl0YXRlQW1vdW50UmVnaW9ucyIsImNhcGl0YWxpemVkIiwiYUxvdE9mIiwicHJlY2lwaXRhdGVBbW91bnRSZWdpb25zQ2FwaXRhbGl6ZWRBQnVuY2hPZlN0cmluZyIsImFCdW5jaE9mIiwicHJlY2lwaXRhdGVBbW91bnRSZWdpb25zQ2FwaXRhbGl6ZWRTb21lU3RyaW5nIiwic29tZSIsInByZWNpcGl0YXRlQW1vdW50UmVnaW9uc0NhcGl0YWxpemVkQUNvdXBsZU9mU3RyaW5nIiwiYUNvdXBsZU9mIiwicHJlY2lwaXRhdGVBbW91bnRSZWdpb25zQ2FwaXRhbGl6ZWRBRmV3U3RyaW5nIiwiYUZldyIsInByZWNpcGl0YXRlQW1vdW50UmVnaW9uc0xvd2VyY2FzZUFMb3RPZlN0cmluZyIsImxvd2VyY2FzZSIsInByZWNpcGl0YXRlQW1vdW50UmVnaW9uc0xvd2VyY2FzZUFCdW5jaE9mU3RyaW5nIiwicHJlY2lwaXRhdGVBbW91bnRSZWdpb25zTG93ZXJjYXNlU29tZVN0cmluZyIsInByZWNpcGl0YXRlQW1vdW50UmVnaW9uc0xvd2VyY2FzZUFDb3VwbGVPZlN0cmluZyIsInByZWNpcGl0YXRlQW1vdW50UmVnaW9uc0xvd2VyY2FzZUFGZXdTdHJpbmciLCJsZXNzQ2FwaXRhbGl6ZWRTdHJpbmciLCJsZXNzIiwibW9yZUNhcGl0YWxpemVkU3RyaW5nIiwibW9yZSIsImxlc3NMb3dlcmNhc2VTdHJpbmciLCJtb3JlTG93ZXJjYXNlU3RyaW5nIiwiUFJFQ0lQSVRBVEVfQU1PVU5UX1NUUklOR1NfQ0FQSVRBTElaRUQiLCJQUkVDSVBJVEFURV9BTU9VTlRfU1RSSU5HU19MT1dFUkNBU0UiLCJQcmVjaXBpdGF0ZUFtb3VudERlc2NyaWJlciIsImNvbnN0cnVjdG9yIiwic29sdXRpb24iLCJjb25jZW50cmF0aW9uRGVzY3JpYmVyIiwidXNlUXVhbnRpdGF0aXZlRGVzY3JpcHRpb25zUHJvcGVydHkiLCJwcmVjaXBpdGF0ZUFtb3VudFByb3BlcnR5IiwibGFzdFByZWNpcGl0YXRlQW1vdW50SW5kZXgiLCJnZXRDdXJyZW50UHJlY2lwaXRhdGVBbW91bnRJbmRleCIsInByZWNpcGl0YXRlQW1vdW50SW5jcmVhc2VkIiwicHJlY2lwaWF0ZUFtb3VudFJlZ2lvbkNoYW5nZWQiLCJsYXp5TGluayIsIm5ld1ZhbHVlIiwib2xkVmFsdWUiLCJuZXdQcmVjaXBpdGF0ZUFtb3VudEluZGV4IiwicHJlY2lwaXRhdGVBbW91bnRUb0luZGV4IiwidmFsdWUiLCJnZXRDdXJyZW50U2F0dXJhdGVkQ29uY2VudHJhdGlvbiIsImdldEN1cnJlbnRQcmVjaXBpdGF0ZUFtb3VudERlc2NyaXB0aW9uIiwiaXNDYXBpdGFsaXplZCIsInByZWNpcGl0YXRlQW1vdW50SW5kZXgiLCJnZXRCZWFrZXJTYXR1cmF0aW9uU3RyaW5nIiwiZmlsbEluIiwic29saWRzIiwiZ2V0U3RpbGxTYXR1cmF0ZWRDbGF1c2UiLCJtYXhDb25jZW50cmF0aW9uU3RyaW5nIiwiY29uY2VudHJhdGlvbiIsImdldEN1cnJlbnRDb25jZW50cmF0aW9uQ2xhdXNlIiwid2l0aFNvbGlkc1N0cmluZyIsInNvbGlkQW1vdW50Iiwid2l0aFNvbGlkcyIsIm1heENvbmNlbnRyYXRpb24iLCJnZXRQcmVjaXBpdGF0ZUFtb3VudENoYW5nZVN0cmluZyIsImFzc2VydCIsImlzU2F0dXJhdGVkIiwibW9yZUxlc3NTdHJpbmciLCJtb3JlTGVzcyIsImdldFNhdHVyYXRpb25DaGFuZ2VkU3RyaW5nIiwic2F0dXJhdGlvblZhbHVlQ2hhbmdlZCIsInNhdHVyYXRpb25Mb3N0QWxlcnRTdHJpbmciLCJoYXNTb2x1dGUiLCJjdXJyZW50UHJlY2lwaXRhdGVBbW91bnQiLCJzYXR1cmF0ZWRDb25jZW50cmF0aW9uRm9yU29sdXRlIiwibWF4UHJlY2lwaXRhdGVBbW91bnQiLCJjb21wdXRlUHJlY2lwaXRhdGVBbW91bnQiLCJTT0xVVElPTl9WT0xVTUVfUkFOR0UiLCJtaW4iLCJTT0xVVEVfQU1PVU5UX1JBTkdFIiwibWF4IiwibnVtYmVyT2ZJbmNyZW1lbnRzIiwibGVuZ3RoIiwic2NhbGVJbmNyZW1lbnQiLCJpIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQcmVjaXBpdGF0ZUFtb3VudERlc2NyaWJlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQcmVjaXBpdGF0ZUFtb3VudERlc2NyaWJlciBpcyByZXNwb25zaWJsZSBmb3IgZm9ybXVsYXRpbmcgc3RyaW5ncyBhYm91dCBTb2x1dGlvbi5wcmVjaXBpdGF0ZUFtb3VudFByb3BlcnR5LiBUaGlzXHJcbiAqIGluY2x1ZGVzIGRlc2NyaXB0aW9ucyBzZXQgaW4gdGhlIFBET00sIGFzIHdlbGwgYXMgY29udGV4dCByZXNwb25zZXMgc2V0IHRocm91Z2ggVXR0ZXJhbmNlUXVldWUuIE5vdGUgdGhhdCB3aGlsZVxyXG4gKiB0aGVzZSBkZXNjcmlwdGlvbnMgcmVsYXRlIHRvIHRoZSBwcmVjaXBpdGF0ZUFtb3VudFByb3BlcnR5IGZyb20gdGhlIG1vZGVsLCB0aGUgcHJlY2lwaXRhdGVzIGFyZSByZWZlcnJlZCB0byBhc1xyXG4gKiBcInNvbGlkc1wiIGluIHRoZSBkZXNjcmlwdGlvbnMuIFRoZXJlZm9yZSwgd2hpbGUgbW9zdCBvZiB0aGUgbWV0aG9kcyBzdGlsbCByZWZlciB0byBwcmVjaXBpdGF0ZSBhbW91bnQsIHRoZSBzdHJpbmdzXHJcbiAqIGFuZCBzdHJpbmcgbmFtZXMgb2Z0ZW4gcmVmZXIgdG8gXCJzb2xpZHNcIiBpbnN0ZWFkLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgVGF5bG9yIFdhbnQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBtb2xhcml0eSBmcm9tICcuLi8uLi8uLi9tb2xhcml0eS5qcyc7XHJcbmltcG9ydCBNb2xhcml0eVN0cmluZ3MgZnJvbSAnLi4vLi4vLi4vTW9sYXJpdHlTdHJpbmdzLmpzJztcclxuaW1wb3J0IFNvbHV0aW9uIGZyb20gJy4uLy4uL21vZGVsL1NvbHV0aW9uLmpzJztcclxuaW1wb3J0IE1vbGFyaXR5Q29uc3RhbnRzIGZyb20gJy4uLy4uL01vbGFyaXR5Q29uc3RhbnRzLmpzJztcclxuXHJcbmNvbnN0IGF0TWF4Q29uY2VudHJhdGlvblBhdHRlcm5TdHJpbmcgPSBNb2xhcml0eVN0cmluZ3MuYTExeS5hdE1heENvbmNlbnRyYXRpb25QYXR0ZXJuO1xyXG5jb25zdCBiZWFrZXJTYXR1cmF0aW9uUGF0dGVyblN0cmluZyA9IE1vbGFyaXR5U3RyaW5ncy5hMTF5LmJlYWtlci5zYXR1cmF0aW9uUGF0dGVybjtcclxuY29uc3Qgc2F0dXJhdGlvbkxvc3ROb1NvbHV0ZUFsZXJ0U3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmExMXkuc2F0dXJhdGlvbkxvc3ROb1NvbHV0ZUFsZXJ0O1xyXG5jb25zdCBzYXR1cmF0aW9uTG9zdFF1YWxpdGF0aXZlQWxlcnRQYXR0ZXJuU3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmExMXkuc2F0dXJhdGlvbkxvc3RRdWFsaXRhdGl2ZUFsZXJ0UGF0dGVybjtcclxuY29uc3Qgc2F0dXJhdGlvbkxvc3RRdWFudGl0YXRpdmVBbGVydFBhdHRlcm5TdHJpbmcgPSBNb2xhcml0eVN0cmluZ3MuYTExeS5zYXR1cmF0aW9uTG9zdFF1YW50aXRhdGl2ZUFsZXJ0UGF0dGVybjtcclxuY29uc3Qgc2F0dXJhdGlvblJlYWNoZWRBbGVydFBhdHRlcm5TdHJpbmcgPSBNb2xhcml0eVN0cmluZ3MuYTExeS5zYXR1cmF0aW9uUmVhY2hlZEFsZXJ0UGF0dGVybjtcclxuY29uc3Qgc3RpbGxTYXR1cmF0ZWRBbGVydFBhdHRlcm5TdHJpbmcgPSBNb2xhcml0eVN0cmluZ3MuYTExeS5zdGlsbFNhdHVyYXRlZEFsZXJ0UGF0dGVybjtcclxuY29uc3Qgd2l0aFNvbGlkc0FsZXJ0UGF0dGVyblN0cmluZyA9IE1vbGFyaXR5U3RyaW5ncy5hMTF5LndpdGhTb2xpZHNBbGVydFBhdHRlcm47XHJcbmNvbnN0IHNvbGlkc0NoYW5nZVBhdHRlcm5TdHJpbmcgPSBNb2xhcml0eVN0cmluZ3MuYTExeS5zb2xpZHNDaGFuZ2VQYXR0ZXJuO1xyXG5cclxuLy8gUHJlY2lwaXRhdGVQYXJ0aWNsZXMgQW1vdW50IGNhcGl0YWxpemVkIHJlZ2lvbiBzdHJpbmdzXHJcbmNvbnN0IHByZWNpcGl0YXRlQW1vdW50UmVnaW9uc0NhcGl0YWxpemVkQUxvdE9mU3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmExMXkucHJlY2lwaXRhdGVBbW91bnRSZWdpb25zLmNhcGl0YWxpemVkLmFMb3RPZjtcclxuY29uc3QgcHJlY2lwaXRhdGVBbW91bnRSZWdpb25zQ2FwaXRhbGl6ZWRBQnVuY2hPZlN0cmluZyA9IE1vbGFyaXR5U3RyaW5ncy5hMTF5LnByZWNpcGl0YXRlQW1vdW50UmVnaW9ucy5jYXBpdGFsaXplZC5hQnVuY2hPZjtcclxuY29uc3QgcHJlY2lwaXRhdGVBbW91bnRSZWdpb25zQ2FwaXRhbGl6ZWRTb21lU3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmExMXkucHJlY2lwaXRhdGVBbW91bnRSZWdpb25zLmNhcGl0YWxpemVkLnNvbWU7XHJcbmNvbnN0IHByZWNpcGl0YXRlQW1vdW50UmVnaW9uc0NhcGl0YWxpemVkQUNvdXBsZU9mU3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmExMXkucHJlY2lwaXRhdGVBbW91bnRSZWdpb25zLmNhcGl0YWxpemVkLmFDb3VwbGVPZjtcclxuY29uc3QgcHJlY2lwaXRhdGVBbW91bnRSZWdpb25zQ2FwaXRhbGl6ZWRBRmV3U3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmExMXkucHJlY2lwaXRhdGVBbW91bnRSZWdpb25zLmNhcGl0YWxpemVkLmFGZXc7XHJcblxyXG4vLyBQcmVjaXBpdGF0ZVBhcnRpY2xlcyBBbW91bnQgbG93ZXJjYXNlIHJlZ2lvbiBzdHJpbmdzXHJcbmNvbnN0IHByZWNpcGl0YXRlQW1vdW50UmVnaW9uc0xvd2VyY2FzZUFMb3RPZlN0cmluZyA9IE1vbGFyaXR5U3RyaW5ncy5hMTF5LnByZWNpcGl0YXRlQW1vdW50UmVnaW9ucy5sb3dlcmNhc2UuYUxvdE9mO1xyXG5jb25zdCBwcmVjaXBpdGF0ZUFtb3VudFJlZ2lvbnNMb3dlcmNhc2VBQnVuY2hPZlN0cmluZyA9IE1vbGFyaXR5U3RyaW5ncy5hMTF5LnByZWNpcGl0YXRlQW1vdW50UmVnaW9ucy5sb3dlcmNhc2UuYUJ1bmNoT2Y7XHJcbmNvbnN0IHByZWNpcGl0YXRlQW1vdW50UmVnaW9uc0xvd2VyY2FzZVNvbWVTdHJpbmcgPSBNb2xhcml0eVN0cmluZ3MuYTExeS5wcmVjaXBpdGF0ZUFtb3VudFJlZ2lvbnMubG93ZXJjYXNlLnNvbWU7XHJcbmNvbnN0IHByZWNpcGl0YXRlQW1vdW50UmVnaW9uc0xvd2VyY2FzZUFDb3VwbGVPZlN0cmluZyA9IE1vbGFyaXR5U3RyaW5ncy5hMTF5LnByZWNpcGl0YXRlQW1vdW50UmVnaW9ucy5sb3dlcmNhc2UuYUNvdXBsZU9mO1xyXG5jb25zdCBwcmVjaXBpdGF0ZUFtb3VudFJlZ2lvbnNMb3dlcmNhc2VBRmV3U3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmExMXkucHJlY2lwaXRhdGVBbW91bnRSZWdpb25zLmxvd2VyY2FzZS5hRmV3O1xyXG5cclxuLy8gQ2hhbmdlIHN0cmluZ3NcclxuY29uc3QgbGVzc0NhcGl0YWxpemVkU3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmExMXkubGVzcy5jYXBpdGFsaXplZDtcclxuY29uc3QgbW9yZUNhcGl0YWxpemVkU3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmExMXkubW9yZS5jYXBpdGFsaXplZDtcclxuY29uc3QgbGVzc0xvd2VyY2FzZVN0cmluZyA9IE1vbGFyaXR5U3RyaW5ncy5hMTF5Lmxlc3MubG93ZXJjYXNlO1xyXG5jb25zdCBtb3JlTG93ZXJjYXNlU3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmExMXkubW9yZS5sb3dlcmNhc2U7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgUFJFQ0lQSVRBVEVfQU1PVU5UX1NUUklOR1NfQ0FQSVRBTElaRUQgPSBbXHJcbiAgcHJlY2lwaXRhdGVBbW91bnRSZWdpb25zQ2FwaXRhbGl6ZWRBQ291cGxlT2ZTdHJpbmcsXHJcbiAgcHJlY2lwaXRhdGVBbW91bnRSZWdpb25zQ2FwaXRhbGl6ZWRBRmV3U3RyaW5nLFxyXG4gIHByZWNpcGl0YXRlQW1vdW50UmVnaW9uc0NhcGl0YWxpemVkU29tZVN0cmluZyxcclxuICBwcmVjaXBpdGF0ZUFtb3VudFJlZ2lvbnNDYXBpdGFsaXplZEFCdW5jaE9mU3RyaW5nLFxyXG4gIHByZWNpcGl0YXRlQW1vdW50UmVnaW9uc0NhcGl0YWxpemVkQUxvdE9mU3RyaW5nXHJcbl07XHJcbmNvbnN0IFBSRUNJUElUQVRFX0FNT1VOVF9TVFJJTkdTX0xPV0VSQ0FTRSA9IFtcclxuICBwcmVjaXBpdGF0ZUFtb3VudFJlZ2lvbnNMb3dlcmNhc2VBQ291cGxlT2ZTdHJpbmcsXHJcbiAgcHJlY2lwaXRhdGVBbW91bnRSZWdpb25zTG93ZXJjYXNlQUZld1N0cmluZyxcclxuICBwcmVjaXBpdGF0ZUFtb3VudFJlZ2lvbnNMb3dlcmNhc2VTb21lU3RyaW5nLFxyXG4gIHByZWNpcGl0YXRlQW1vdW50UmVnaW9uc0xvd2VyY2FzZUFCdW5jaE9mU3RyaW5nLFxyXG4gIHByZWNpcGl0YXRlQW1vdW50UmVnaW9uc0xvd2VyY2FzZUFMb3RPZlN0cmluZ1xyXG5dO1xyXG5cclxuY2xhc3MgUHJlY2lwaXRhdGVBbW91bnREZXNjcmliZXIge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1NvbHV0aW9ufSBzb2x1dGlvbiAtIGZyb20gTW9sYXJpdHlNb2RlbFxyXG4gICAqIEBwYXJhbSB7Q29uY2VudHJhdGlvbkRlc2NyaWJlcn0gY29uY2VudHJhdGlvbkRlc2NyaWJlclxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSB1c2VRdWFudGl0YXRpdmVEZXNjcmlwdGlvbnNQcm9wZXJ0eVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBzb2x1dGlvbiwgY29uY2VudHJhdGlvbkRlc2NyaWJlciwgdXNlUXVhbnRpdGF0aXZlRGVzY3JpcHRpb25zUHJvcGVydHkgKSB7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuc29sdXRpb24gPSBzb2x1dGlvbjtcclxuICAgIHRoaXMuY29uY2VudHJhdGlvbkRlc2NyaWJlciA9IGNvbmNlbnRyYXRpb25EZXNjcmliZXI7XHJcbiAgICB0aGlzLnByZWNpcGl0YXRlQW1vdW50UHJvcGVydHkgPSBzb2x1dGlvbi5wcmVjaXBpdGF0ZUFtb3VudFByb3BlcnR5O1xyXG4gICAgdGhpcy51c2VRdWFudGl0YXRpdmVEZXNjcmlwdGlvbnNQcm9wZXJ0eSA9IHVzZVF1YW50aXRhdGl2ZURlc2NyaXB0aW9uc1Byb3BlcnR5O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ8bnVsbH0gLSB0cmFja3MgdGhlIGluZGV4IG9mIHRoZSBsYXN0IGRlc2NyaXB0aXZlIHJlZ2lvbiBmb3IgcHJlY2lwaXRhdGVBbW91bnQgZnJvbVxyXG4gICAgLy8gUFJFQ0lQSVRBVEVfQU1PVU5UX1NUUklOR1MgYXJyYXlzXHJcbiAgICBsZXQgbGFzdFByZWNpcGl0YXRlQW1vdW50SW5kZXggPSB0aGlzLmdldEN1cnJlbnRQcmVjaXBpdGF0ZUFtb3VudEluZGV4KCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW58bnVsbH0gLSBzaG91bGQgb25seSBiZSB1cGRhdGVkIGFuZCBhY2Nlc3NlZCB3aGVuIHRoZSBwcmVjaXBpdGF0ZUFtb3VudFByb3BlcnR5IGNoYW5nZXMsIHNvXHJcbiAgICAvLyB3aGlsZSBpdCB3aWxsIGJlIG51bGwgYXQgc29tZSBwb2ludHMsIGl0IHdpbGwgb25seSBiZSBhY2Nlc3NlZCB3aGVuIGl0IGhvbGRzIGJvb2xlYW4gdmFsdWVzIChUcnVlIGlmIHByZWNpcGl0YXRlQW1vdW50XHJcbiAgICAvLyBoYXMgaW5jcmVhc2VkLCBGYWxzZSBpZiBpdCBoYXMgZGVjcmVhc2VkKVxyXG4gICAgdGhpcy5wcmVjaXBpdGF0ZUFtb3VudEluY3JlYXNlZCA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW58bnVsbH0gLSB0cmFja3Mgd2hldGhlciB0aGUgZGVzY3JpcHRpdmUgcmVnaW9ucyBmb3IgdGhlIHByZWNpcGl0YXRlQW1vdW50UHJvcGVydHkgaGFzIGNoYW5nZWRcclxuICAgIC8vIChzaW5jZSByZWdpb24gY2hhbmdlcyB0cmlnZ2VyIHRoZSBkaWZmZXJlbnQgZGVzY3JpcHRpdmUgdGV4dCBpbiB0aGUgYXJpYS1saXZlIGFsZXJ0cykuXHJcbiAgICB0aGlzLnByZWNpcGlhdGVBbW91bnRSZWdpb25DaGFuZ2VkID0gbnVsbDtcclxuXHJcbiAgICAvLyB1cGRhdGUgZmllbGRzIChkb2N1bWVudGVkIGFib3ZlKSB3aGVuIHByZWNpcGl0YXRlQW1vdW50UHJvcGVydHkgY2hhbmdlc1xyXG4gICAgdGhpcy5wcmVjaXBpdGF0ZUFtb3VudFByb3BlcnR5LmxhenlMaW5rKCAoIG5ld1ZhbHVlLCBvbGRWYWx1ZSApID0+IHtcclxuICAgICAgY29uc3QgbmV3UHJlY2lwaXRhdGVBbW91bnRJbmRleCA9IHRoaXMuZ2V0Q3VycmVudFByZWNpcGl0YXRlQW1vdW50SW5kZXgoKTtcclxuICAgICAgdGhpcy5wcmVjaXBpdGF0ZUFtb3VudEluY3JlYXNlZCA9IG5ld1ZhbHVlID4gb2xkVmFsdWU7XHJcbiAgICAgIHRoaXMucHJlY2lwaWF0ZUFtb3VudFJlZ2lvbkNoYW5nZWQgPSBuZXdQcmVjaXBpdGF0ZUFtb3VudEluZGV4ICE9PSBsYXN0UHJlY2lwaXRhdGVBbW91bnRJbmRleDtcclxuICAgICAgbGFzdFByZWNpcGl0YXRlQW1vdW50SW5kZXggPSBuZXdQcmVjaXBpdGF0ZUFtb3VudEluZGV4O1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsY3VsYXRlcyB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgcHJlY2lwaXRhdGVBbW91bnQgcmVnaW9uIHVzaW5nIHRoZSBwcmVjaXBpdGF0ZUFtb3VudFByb3BlcnR5IGFuZCB0aGUgc2F0dXJhdGVkXHJcbiAgICogY29uY2VudHJhdGlvbiBsZXZlbCBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHNvbHV0ZVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHJldHVybnMge051bWJlcn0gLSBpbmRleCBvZiB0aGUgY3VycmVudCBwcmVjaXBpdGF0ZUFtb3VudCBkZXNjcmlwdGlvbiByZWdpb25cclxuICAgKiAqL1xyXG4gIGdldEN1cnJlbnRQcmVjaXBpdGF0ZUFtb3VudEluZGV4KCkge1xyXG4gICAgcmV0dXJuIHByZWNpcGl0YXRlQW1vdW50VG9JbmRleCggdGhpcy5wcmVjaXBpdGF0ZUFtb3VudFByb3BlcnR5LnZhbHVlLCB0aGlzLmNvbmNlbnRyYXRpb25EZXNjcmliZXIuZ2V0Q3VycmVudFNhdHVyYXRlZENvbmNlbnRyYXRpb24oKSApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHF1YWxpdGF0aXZlIGRlc2NyaXB0aW9uIG9mIHRoZSBhbW91bnQgb2YgcHJlY2lwaXRhdGUgaW4gdGhlIGJlYWtlci5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIFtpc0NhcGl0YWxpemVkXSB7Ym9vbGVhbn1cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIGV4YW1wbGU6IFwiYSBidW5jaFwiXHJcbiAgICovXHJcbiAgZ2V0Q3VycmVudFByZWNpcGl0YXRlQW1vdW50RGVzY3JpcHRpb24oIGlzQ2FwaXRhbGl6ZWQgPSBmYWxzZSApIHtcclxuICAgIGNvbnN0IHByZWNpcGl0YXRlQW1vdW50SW5kZXggPSB0aGlzLmdldEN1cnJlbnRQcmVjaXBpdGF0ZUFtb3VudEluZGV4KCk7XHJcbiAgICByZXR1cm4gaXNDYXBpdGFsaXplZCA/IFBSRUNJUElUQVRFX0FNT1VOVF9TVFJJTkdTX0NBUElUQUxJWkVEWyBwcmVjaXBpdGF0ZUFtb3VudEluZGV4IF0gOlxyXG4gICAgICAgICAgIFBSRUNJUElUQVRFX0FNT1VOVF9TVFJJTkdTX0xPV0VSQ0FTRVsgcHJlY2lwaXRhdGVBbW91bnRJbmRleCBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHN0cmluZyB0aGF0IGRlc2NyaWJlcyB0aGUgcHJlY2lwaXRhdGUgYW1vdW50IGluIHRoZSBiZWFrZXJcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge3N0cmluZ30gLSBlLmcuIFwiaXMgc2F0dXJhdGVkIHdpdGggYSBidW5jaCBvZiBzb2xpZHNcIlxyXG4gICAqL1xyXG4gIGdldEJlYWtlclNhdHVyYXRpb25TdHJpbmcoKSB7XHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBiZWFrZXJTYXR1cmF0aW9uUGF0dGVyblN0cmluZywge1xyXG4gICAgICBzb2xpZHM6IHRoaXMuZ2V0Q3VycmVudFByZWNpcGl0YXRlQW1vdW50RGVzY3JpcHRpb24oKVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbGxzIGluIGluZm9ybWF0aW9uIGFib3V0IHRoZSBzdGF0ZSBvZiB0aGUgc29sdXRpb24gKGl0cyBzYXR1cmF0aW9uIGFuZCB0aGUgYW1vdW50IG9mIHByZWNpcGl0YXRlKSBpZiByZWdpb24gaGFzIGNoYW5nZWRcclxuICAgKiBhbmQgdGhlIHNvbHV0aW9uIGlzIHNhdHVyYXRlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge3N0cmluZ30gLSBleGFtcGxlOiBcInN0aWxsIHNhdHVyYXRlZCB3aXRoIGEgYnVuY2ggb2Ygc29saWRzXCJcclxuICAgKi9cclxuICBnZXRTdGlsbFNhdHVyYXRlZENsYXVzZSgpIHtcclxuICAgIGNvbnN0IG1heENvbmNlbnRyYXRpb25TdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIGF0TWF4Q29uY2VudHJhdGlvblBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgY29uY2VudHJhdGlvbjogdGhpcy5jb25jZW50cmF0aW9uRGVzY3JpYmVyLmdldEN1cnJlbnRDb25jZW50cmF0aW9uQ2xhdXNlKCB0cnVlIClcclxuICAgIH0gKTtcclxuICAgIGxldCB3aXRoU29saWRzU3RyaW5nID0gJyc7XHJcblxyXG4gICAgLy8gdGhlIGFtb3VudCBvZiBwcmVjaXBpdGF0ZSBpcyBvbmx5IGdpdmVuIGlmIHRoZSByZWdpb24gaGFzIGNoYW5nZWQuXHJcbiAgICBpZiAoIHRoaXMucHJlY2lwaWF0ZUFtb3VudFJlZ2lvbkNoYW5nZWQgKSB7XHJcbiAgICAgIHdpdGhTb2xpZHNTdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIHdpdGhTb2xpZHNBbGVydFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBzb2xpZEFtb3VudDogdGhpcy5nZXRDdXJyZW50UHJlY2lwaXRhdGVBbW91bnREZXNjcmlwdGlvbigpXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBzdGlsbFNhdHVyYXRlZEFsZXJ0UGF0dGVyblN0cmluZywge1xyXG4gICAgICB3aXRoU29saWRzOiB3aXRoU29saWRzU3RyaW5nLFxyXG4gICAgICBtYXhDb25jZW50cmF0aW9uOiBtYXhDb25jZW50cmF0aW9uU3RyaW5nXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgc3Vic3RyaW5nIHRvIGRlc2NyaWJlIHRoZSBjaGFuZ2UgaW4gdGhlIGFtb3VudCBvZiBwcmVjaXBpdGF0ZVxyXG4gICAqIEBwYXJhbSBbaXNDYXBpdGFsaXplZF0ge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gZXhhbXBsZTogXCJtb3JlIHNvbGlkc1wiXHJcbiAgICovXHJcbiAgZ2V0UHJlY2lwaXRhdGVBbW91bnRDaGFuZ2VTdHJpbmcoIGlzQ2FwaXRhbGl6ZWQgPSBmYWxzZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuc29sdXRpb24uaXNTYXR1cmF0ZWQoKSwgJ3ByZWNpcGl0YXRlQW1vdW50UHJvcGVydHkgc2hvdWxkIGJlIGdyZWF0ZXIgdGhhbiAwJyApO1xyXG4gICAgbGV0IG1vcmVMZXNzU3RyaW5nID0gaXNDYXBpdGFsaXplZCA/IGxlc3NDYXBpdGFsaXplZFN0cmluZyA6IGxlc3NMb3dlcmNhc2VTdHJpbmc7XHJcbiAgICBpZiAoIHRoaXMucHJlY2lwaXRhdGVBbW91bnRJbmNyZWFzZWQgKSB7XHJcbiAgICAgIG1vcmVMZXNzU3RyaW5nID0gaXNDYXBpdGFsaXplZCA/IG1vcmVDYXBpdGFsaXplZFN0cmluZyA6IG1vcmVMb3dlcmNhc2VTdHJpbmc7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBzb2xpZHNDaGFuZ2VQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIG1vcmVMZXNzOiBtb3JlTGVzc1N0cmluZ1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgc3RyaW5nIHRvIGJlIHJlYWQgb3V0IHdoZW4gdGhlIHNvbHV0aW9uIGlzIGVpdGhlciBuZXdseSBzYXR1cmF0ZWQgb3IgbmV3bHkgdW5zYXR1cmF0ZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICogKi9cclxuICBnZXRTYXR1cmF0aW9uQ2hhbmdlZFN0cmluZygpIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY29uY2VudHJhdGlvbkRlc2NyaWJlci5zYXR1cmF0aW9uVmFsdWVDaGFuZ2VkLCAnc2F0dXJhdGlvbiBzdGF0ZSBoYXMgbm90IGNoYW5nZWQnICk7XHJcbiAgICBjb25zdCBzYXR1cmF0aW9uTG9zdEFsZXJ0U3RyaW5nID0gdGhpcy51c2VRdWFudGl0YXRpdmVEZXNjcmlwdGlvbnNQcm9wZXJ0eS52YWx1ZSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2F0dXJhdGlvbkxvc3RRdWFudGl0YXRpdmVBbGVydFBhdHRlcm5TdHJpbmcgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNhdHVyYXRpb25Mb3N0UXVhbGl0YXRpdmVBbGVydFBhdHRlcm5TdHJpbmc7XHJcblxyXG4gICAgLy8gYWxlcnRzIGFyZSBkaWZmZXJlbnQgYmFzZWQgb24gd2hldGhlciB0aGUgc29sdXRpb24gaXMgbmV3bHkgc2F0dXJhdGVkIG9yIG5ld2x5IHVuc2F0dXJhdGVkLlxyXG4gICAgaWYgKCB0aGlzLnNvbHV0aW9uLmlzU2F0dXJhdGVkKCkgKSB7XHJcblxyXG4gICAgICAvLyBuZXdseSBzYXR1cmF0ZWQgYWxlcnRcclxuICAgICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggc2F0dXJhdGlvblJlYWNoZWRBbGVydFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBzb2xpZHM6IHRoaXMuZ2V0Q3VycmVudFByZWNpcGl0YXRlQW1vdW50RGVzY3JpcHRpb24oKSxcclxuICAgICAgICBjb25jZW50cmF0aW9uOiB0aGlzLmNvbmNlbnRyYXRpb25EZXNjcmliZXIuZ2V0Q3VycmVudENvbmNlbnRyYXRpb25DbGF1c2UoIHRydWUgKVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIG5ld2x5IHVuc2F0dXJhdGVkIGFsZXJ0cyAtLSB0aGVyZSBpcyBhIHNwZWNpYWwgY2FzZSB3aGVyZSB0aGUgc29sdXRpb24gZ29lcyBmcm9tIHNhdHVyYXRlZCB0byB6ZXJvIHNvbHV0ZSwgd2hpY2hcclxuICAgICAgLy8gaXMgaGFuZGxlZCB3aXRoIHRoZSBjb25kaXRpb24gIXRoaXMuc29sdXRpb24uaGFzU29sdXRlKCkuXHJcbiAgICAgIGlmICggIXRoaXMuc29sdXRpb24uaGFzU29sdXRlKCkgKSB7XHJcblxyXG4gICAgICAgIC8vIEJlY2F1c2UgbW9uaXRvcmluZyBhIGNvbmNlbnRyYXRpb25EZXNjcmliZXIuc2F0dXJhdGlvblZhbHVlQ2hhbmdlZCBpcyB1cGRhdGVkIGJ5IGxpbmtzIHRvIGNvbmNlbnRyYXRpb25Qcm9wZXJ0eVxyXG4gICAgICAgIC8vIGFuZCBwcmVjaXBpdGF0ZUFtb3VudFByb3BlcnR5LGlmIHRoZXJlIGlzIG5vIHNvbHV0ZSBpbiB0aGUgYmVha2VyLCBjb25jZW50cmF0aW9uRGVzY3JpYmVyLnNhdHVyYXRpb25WYWx1ZUNoYW5nZWRcclxuICAgICAgICAvLyB3aWxsIG5vdCBiZSB1cGRhdGVkLCBhbmQgbXVzdCB0aGVyZWZvcmUgYmUgbWFudWFsbHkgdXBkYXRlZC5cclxuICAgICAgICB0aGlzLmNvbmNlbnRyYXRpb25EZXNjcmliZXIuc2F0dXJhdGlvblZhbHVlQ2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBzYXR1cmF0aW9uTG9zdE5vU29sdXRlQWxlcnRTdHJpbmc7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggc2F0dXJhdGlvbkxvc3RBbGVydFN0cmluZywge1xyXG4gICAgICAgICAgY29uY2VudHJhdGlvbjogdGhpcy5jb25jZW50cmF0aW9uRGVzY3JpYmVyLmdldEN1cnJlbnRDb25jZW50cmF0aW9uQ2xhdXNlKCB0cnVlIClcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHdoaWNoIGl0ZW0gdG8gdXNlIGZyb20gdGhlIHByZWNpcGl0YXRlIGFtb3VudCByZWdpb25zIHN0cmluZyBhcnJheXMuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBjdXJyZW50UHJlY2lwaXRhdGVBbW91bnQgLSBpbiBtb2xlcywgc2VlIFNvbHV0aW9uLmpzXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBzYXR1cmF0ZWRDb25jZW50cmF0aW9uRm9yU29sdXRlIC0gIHRoZSBzYXR1cmF0aW9uIHBvaW50IGZvciBhIHNwZWNpZmljIHNvbHV0ZVxyXG4gKiBAcmV0dXJucyB7bnVtYmVyfSAtIGluZGV4IHRvIHB1bGwgZnJvbSBwcmVjaXBpdGF0ZSBhbW91bnQgcmVnaW9ucyBzdHJpbmcgYXJyYXlzXHJcbiAqL1xyXG5jb25zdCBwcmVjaXBpdGF0ZUFtb3VudFRvSW5kZXggPSAoIGN1cnJlbnRQcmVjaXBpdGF0ZUFtb3VudCwgc2F0dXJhdGVkQ29uY2VudHJhdGlvbkZvclNvbHV0ZSApID0+IHtcclxuXHJcbiAgLy8gbWF4aW11bSBwcmVjaXBpdGF0ZXMgcG9zc2libGUgZm9yIGEgZ2l2ZW4gc29sdXRlLCB3aGljaCBpcyB0aGUgc29sdXRlIGFtb3VudCBpdCB0YWtlcyB0byBzYXR1cmF0ZSBhdCBtaW4gdm9sdW1lLlxyXG4gIGNvbnN0IG1heFByZWNpcGl0YXRlQW1vdW50ID0gU29sdXRpb24uY29tcHV0ZVByZWNpcGl0YXRlQW1vdW50KCBNb2xhcml0eUNvbnN0YW50cy5TT0xVVElPTl9WT0xVTUVfUkFOR0UubWluLFxyXG4gICAgTW9sYXJpdHlDb25zdGFudHMuU09MVVRFX0FNT1VOVF9SQU5HRS5tYXgsIHNhdHVyYXRlZENvbmNlbnRyYXRpb25Gb3JTb2x1dGUgKTtcclxuXHJcbiAgY29uc3QgbnVtYmVyT2ZJbmNyZW1lbnRzID0gUFJFQ0lQSVRBVEVfQU1PVU5UX1NUUklOR1NfQ0FQSVRBTElaRUQubGVuZ3RoO1xyXG4gIGNvbnN0IHNjYWxlSW5jcmVtZW50ID0gbWF4UHJlY2lwaXRhdGVBbW91bnQgLyBudW1iZXJPZkluY3JlbWVudHM7XHJcblxyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlck9mSW5jcmVtZW50cyAtIDE7IGkrKyApIHtcclxuICAgIGlmICggY3VycmVudFByZWNpcGl0YXRlQW1vdW50IDw9ICggaSArIDEgKSAqIHNjYWxlSW5jcmVtZW50ICkge1xyXG4gICAgICByZXR1cm4gaTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIFBSRUNJUElUQVRFX0FNT1VOVF9TVFJJTkdTX0NBUElUQUxJWkVELmxlbmd0aCAtIDE7XHJcbn07XHJcblxyXG5tb2xhcml0eS5yZWdpc3RlciggJ1ByZWNpcGl0YXRlQW1vdW50RGVzY3JpYmVyJywgUHJlY2lwaXRhdGVBbW91bnREZXNjcmliZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgUHJlY2lwaXRhdGVBbW91bnREZXNjcmliZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0sa0RBQWtEO0FBQzFFLE9BQU9DLFFBQVEsTUFBTSxzQkFBc0I7QUFDM0MsT0FBT0MsZUFBZSxNQUFNLDZCQUE2QjtBQUN6RCxPQUFPQyxRQUFRLE1BQU0seUJBQXlCO0FBQzlDLE9BQU9DLGlCQUFpQixNQUFNLDRCQUE0QjtBQUUxRCxNQUFNQywrQkFBK0IsR0FBR0gsZUFBZSxDQUFDSSxJQUFJLENBQUNDLHlCQUF5QjtBQUN0RixNQUFNQyw2QkFBNkIsR0FBR04sZUFBZSxDQUFDSSxJQUFJLENBQUNHLE1BQU0sQ0FBQ0MsaUJBQWlCO0FBQ25GLE1BQU1DLGlDQUFpQyxHQUFHVCxlQUFlLENBQUNJLElBQUksQ0FBQ00sMkJBQTJCO0FBQzFGLE1BQU1DLDJDQUEyQyxHQUFHWCxlQUFlLENBQUNJLElBQUksQ0FBQ1EscUNBQXFDO0FBQzlHLE1BQU1DLDRDQUE0QyxHQUFHYixlQUFlLENBQUNJLElBQUksQ0FBQ1Usc0NBQXNDO0FBQ2hILE1BQU1DLG1DQUFtQyxHQUFHZixlQUFlLENBQUNJLElBQUksQ0FBQ1ksNkJBQTZCO0FBQzlGLE1BQU1DLGdDQUFnQyxHQUFHakIsZUFBZSxDQUFDSSxJQUFJLENBQUNjLDBCQUEwQjtBQUN4RixNQUFNQyw0QkFBNEIsR0FBR25CLGVBQWUsQ0FBQ0ksSUFBSSxDQUFDZ0Isc0JBQXNCO0FBQ2hGLE1BQU1DLHlCQUF5QixHQUFHckIsZUFBZSxDQUFDSSxJQUFJLENBQUNrQixtQkFBbUI7O0FBRTFFO0FBQ0EsTUFBTUMsK0NBQStDLEdBQUd2QixlQUFlLENBQUNJLElBQUksQ0FBQ29CLHdCQUF3QixDQUFDQyxXQUFXLENBQUNDLE1BQU07QUFDeEgsTUFBTUMsaURBQWlELEdBQUczQixlQUFlLENBQUNJLElBQUksQ0FBQ29CLHdCQUF3QixDQUFDQyxXQUFXLENBQUNHLFFBQVE7QUFDNUgsTUFBTUMsNkNBQTZDLEdBQUc3QixlQUFlLENBQUNJLElBQUksQ0FBQ29CLHdCQUF3QixDQUFDQyxXQUFXLENBQUNLLElBQUk7QUFDcEgsTUFBTUMsa0RBQWtELEdBQUcvQixlQUFlLENBQUNJLElBQUksQ0FBQ29CLHdCQUF3QixDQUFDQyxXQUFXLENBQUNPLFNBQVM7QUFDOUgsTUFBTUMsNkNBQTZDLEdBQUdqQyxlQUFlLENBQUNJLElBQUksQ0FBQ29CLHdCQUF3QixDQUFDQyxXQUFXLENBQUNTLElBQUk7O0FBRXBIO0FBQ0EsTUFBTUMsNkNBQTZDLEdBQUduQyxlQUFlLENBQUNJLElBQUksQ0FBQ29CLHdCQUF3QixDQUFDWSxTQUFTLENBQUNWLE1BQU07QUFDcEgsTUFBTVcsK0NBQStDLEdBQUdyQyxlQUFlLENBQUNJLElBQUksQ0FBQ29CLHdCQUF3QixDQUFDWSxTQUFTLENBQUNSLFFBQVE7QUFDeEgsTUFBTVUsMkNBQTJDLEdBQUd0QyxlQUFlLENBQUNJLElBQUksQ0FBQ29CLHdCQUF3QixDQUFDWSxTQUFTLENBQUNOLElBQUk7QUFDaEgsTUFBTVMsZ0RBQWdELEdBQUd2QyxlQUFlLENBQUNJLElBQUksQ0FBQ29CLHdCQUF3QixDQUFDWSxTQUFTLENBQUNKLFNBQVM7QUFDMUgsTUFBTVEsMkNBQTJDLEdBQUd4QyxlQUFlLENBQUNJLElBQUksQ0FBQ29CLHdCQUF3QixDQUFDWSxTQUFTLENBQUNGLElBQUk7O0FBRWhIO0FBQ0EsTUFBTU8scUJBQXFCLEdBQUd6QyxlQUFlLENBQUNJLElBQUksQ0FBQ3NDLElBQUksQ0FBQ2pCLFdBQVc7QUFDbkUsTUFBTWtCLHFCQUFxQixHQUFHM0MsZUFBZSxDQUFDSSxJQUFJLENBQUN3QyxJQUFJLENBQUNuQixXQUFXO0FBQ25FLE1BQU1vQixtQkFBbUIsR0FBRzdDLGVBQWUsQ0FBQ0ksSUFBSSxDQUFDc0MsSUFBSSxDQUFDTixTQUFTO0FBQy9ELE1BQU1VLG1CQUFtQixHQUFHOUMsZUFBZSxDQUFDSSxJQUFJLENBQUN3QyxJQUFJLENBQUNSLFNBQVM7O0FBRS9EO0FBQ0EsTUFBTVcsc0NBQXNDLEdBQUcsQ0FDN0NoQixrREFBa0QsRUFDbERFLDZDQUE2QyxFQUM3Q0osNkNBQTZDLEVBQzdDRixpREFBaUQsRUFDakRKLCtDQUErQyxDQUNoRDtBQUNELE1BQU15QixvQ0FBb0MsR0FBRyxDQUMzQ1QsZ0RBQWdELEVBQ2hEQywyQ0FBMkMsRUFDM0NGLDJDQUEyQyxFQUMzQ0QsK0NBQStDLEVBQy9DRiw2Q0FBNkMsQ0FDOUM7QUFFRCxNQUFNYywwQkFBMEIsQ0FBQztFQUUvQjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLFFBQVEsRUFBRUMsc0JBQXNCLEVBQUVDLG1DQUFtQyxFQUFHO0lBRW5GO0lBQ0EsSUFBSSxDQUFDRixRQUFRLEdBQUdBLFFBQVE7SUFDeEIsSUFBSSxDQUFDQyxzQkFBc0IsR0FBR0Esc0JBQXNCO0lBQ3BELElBQUksQ0FBQ0UseUJBQXlCLEdBQUdILFFBQVEsQ0FBQ0cseUJBQXlCO0lBQ25FLElBQUksQ0FBQ0QsbUNBQW1DLEdBQUdBLG1DQUFtQzs7SUFFOUU7SUFDQTtJQUNBLElBQUlFLDBCQUEwQixHQUFHLElBQUksQ0FBQ0MsZ0NBQWdDLENBQUMsQ0FBQzs7SUFFeEU7SUFDQTtJQUNBO0lBQ0EsSUFBSSxDQUFDQywwQkFBMEIsR0FBRyxJQUFJOztJQUV0QztJQUNBO0lBQ0EsSUFBSSxDQUFDQyw2QkFBNkIsR0FBRyxJQUFJOztJQUV6QztJQUNBLElBQUksQ0FBQ0oseUJBQXlCLENBQUNLLFFBQVEsQ0FBRSxDQUFFQyxRQUFRLEVBQUVDLFFBQVEsS0FBTTtNQUNqRSxNQUFNQyx5QkFBeUIsR0FBRyxJQUFJLENBQUNOLGdDQUFnQyxDQUFDLENBQUM7TUFDekUsSUFBSSxDQUFDQywwQkFBMEIsR0FBR0csUUFBUSxHQUFHQyxRQUFRO01BQ3JELElBQUksQ0FBQ0gsNkJBQTZCLEdBQUdJLHlCQUF5QixLQUFLUCwwQkFBMEI7TUFDN0ZBLDBCQUEwQixHQUFHTyx5QkFBeUI7SUFDeEQsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VOLGdDQUFnQ0EsQ0FBQSxFQUFHO0lBQ2pDLE9BQU9PLHdCQUF3QixDQUFFLElBQUksQ0FBQ1QseUJBQXlCLENBQUNVLEtBQUssRUFBRSxJQUFJLENBQUNaLHNCQUFzQixDQUFDYSxnQ0FBZ0MsQ0FBQyxDQUFFLENBQUM7RUFDekk7O0VBR0E7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLHNDQUFzQ0EsQ0FBRUMsYUFBYSxHQUFHLEtBQUssRUFBRztJQUM5RCxNQUFNQyxzQkFBc0IsR0FBRyxJQUFJLENBQUNaLGdDQUFnQyxDQUFDLENBQUM7SUFDdEUsT0FBT1csYUFBYSxHQUFHcEIsc0NBQXNDLENBQUVxQixzQkFBc0IsQ0FBRSxHQUNoRnBCLG9DQUFvQyxDQUFFb0Isc0JBQXNCLENBQUU7RUFDdkU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQyx5QkFBeUJBLENBQUEsRUFBRztJQUMxQixPQUFPdkUsV0FBVyxDQUFDd0UsTUFBTSxDQUFFaEUsNkJBQTZCLEVBQUU7TUFDeERpRSxNQUFNLEVBQUUsSUFBSSxDQUFDTCxzQ0FBc0MsQ0FBQztJQUN0RCxDQUFFLENBQUM7RUFDTDs7RUFHQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU0sdUJBQXVCQSxDQUFBLEVBQUc7SUFDeEIsTUFBTUMsc0JBQXNCLEdBQUczRSxXQUFXLENBQUN3RSxNQUFNLENBQUVuRSwrQkFBK0IsRUFBRTtNQUNsRnVFLGFBQWEsRUFBRSxJQUFJLENBQUN0QixzQkFBc0IsQ0FBQ3VCLDZCQUE2QixDQUFFLElBQUs7SUFDakYsQ0FBRSxDQUFDO0lBQ0gsSUFBSUMsZ0JBQWdCLEdBQUcsRUFBRTs7SUFFekI7SUFDQSxJQUFLLElBQUksQ0FBQ2xCLDZCQUE2QixFQUFHO01BQ3hDa0IsZ0JBQWdCLEdBQUc5RSxXQUFXLENBQUN3RSxNQUFNLENBQUVuRCw0QkFBNEIsRUFBRTtRQUNuRTBELFdBQVcsRUFBRSxJQUFJLENBQUNYLHNDQUFzQyxDQUFDO01BQzNELENBQUUsQ0FBQztJQUNMO0lBRUEsT0FBT3BFLFdBQVcsQ0FBQ3dFLE1BQU0sQ0FBRXJELGdDQUFnQyxFQUFFO01BQzNENkQsVUFBVSxFQUFFRixnQkFBZ0I7TUFDNUJHLGdCQUFnQixFQUFFTjtJQUNwQixDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU8sZ0NBQWdDQSxDQUFFYixhQUFhLEdBQUcsS0FBSyxFQUFHO0lBQ3hEYyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxJQUFJLENBQUM5QixRQUFRLENBQUMrQixXQUFXLENBQUMsQ0FBQyxFQUFFLG9EQUFxRCxDQUFDO0lBQ3JHLElBQUlDLGNBQWMsR0FBR2hCLGFBQWEsR0FBRzFCLHFCQUFxQixHQUFHSSxtQkFBbUI7SUFDaEYsSUFBSyxJQUFJLENBQUNZLDBCQUEwQixFQUFHO01BQ3JDMEIsY0FBYyxHQUFHaEIsYUFBYSxHQUFHeEIscUJBQXFCLEdBQUdHLG1CQUFtQjtJQUM5RTtJQUNBLE9BQU9oRCxXQUFXLENBQUN3RSxNQUFNLENBQUVqRCx5QkFBeUIsRUFBRTtNQUNwRCtELFFBQVEsRUFBRUQ7SUFDWixDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLDBCQUEwQkEsQ0FBQSxFQUFHO0lBQzNCSixNQUFNLElBQUlBLE1BQU0sQ0FBRSxJQUFJLENBQUM3QixzQkFBc0IsQ0FBQ2tDLHNCQUFzQixFQUFFLGtDQUFtQyxDQUFDO0lBQzFHLE1BQU1DLHlCQUF5QixHQUFHLElBQUksQ0FBQ2xDLG1DQUFtQyxDQUFDVyxLQUFLLEdBQzlDbkQsNENBQTRDLEdBQzVDRiwyQ0FBMkM7O0lBRTdFO0lBQ0EsSUFBSyxJQUFJLENBQUN3QyxRQUFRLENBQUMrQixXQUFXLENBQUMsQ0FBQyxFQUFHO01BRWpDO01BQ0EsT0FBT3BGLFdBQVcsQ0FBQ3dFLE1BQU0sQ0FBRXZELG1DQUFtQyxFQUFFO1FBQzlEd0QsTUFBTSxFQUFFLElBQUksQ0FBQ0wsc0NBQXNDLENBQUMsQ0FBQztRQUNyRFEsYUFBYSxFQUFFLElBQUksQ0FBQ3RCLHNCQUFzQixDQUFDdUIsNkJBQTZCLENBQUUsSUFBSztNQUNqRixDQUFFLENBQUM7SUFDTCxDQUFDLE1BQ0k7TUFFSDtNQUNBO01BQ0EsSUFBSyxDQUFDLElBQUksQ0FBQ3hCLFFBQVEsQ0FBQ3FDLFNBQVMsQ0FBQyxDQUFDLEVBQUc7UUFFaEM7UUFDQTtRQUNBO1FBQ0EsSUFBSSxDQUFDcEMsc0JBQXNCLENBQUNrQyxzQkFBc0IsR0FBRyxLQUFLO1FBQzFELE9BQU83RSxpQ0FBaUM7TUFDMUMsQ0FBQyxNQUNJO1FBQ0gsT0FBT1gsV0FBVyxDQUFDd0UsTUFBTSxDQUFFaUIseUJBQXlCLEVBQUU7VUFDcERiLGFBQWEsRUFBRSxJQUFJLENBQUN0QixzQkFBc0IsQ0FBQ3VCLDZCQUE2QixDQUFFLElBQUs7UUFDakYsQ0FBRSxDQUFDO01BQ0w7SUFDRjtFQUNGO0FBQ0Y7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTVosd0JBQXdCLEdBQUdBLENBQUUwQix3QkFBd0IsRUFBRUMsK0JBQStCLEtBQU07RUFFaEc7RUFDQSxNQUFNQyxvQkFBb0IsR0FBRzFGLFFBQVEsQ0FBQzJGLHdCQUF3QixDQUFFMUYsaUJBQWlCLENBQUMyRixxQkFBcUIsQ0FBQ0MsR0FBRyxFQUN6RzVGLGlCQUFpQixDQUFDNkYsbUJBQW1CLENBQUNDLEdBQUcsRUFBRU4sK0JBQWdDLENBQUM7RUFFOUUsTUFBTU8sa0JBQWtCLEdBQUdsRCxzQ0FBc0MsQ0FBQ21ELE1BQU07RUFDeEUsTUFBTUMsY0FBYyxHQUFHUixvQkFBb0IsR0FBR00sa0JBQWtCO0VBRWhFLEtBQU0sSUFBSUcsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHSCxrQkFBa0IsR0FBRyxDQUFDLEVBQUVHLENBQUMsRUFBRSxFQUFHO0lBQ2pELElBQUtYLHdCQUF3QixJQUFJLENBQUVXLENBQUMsR0FBRyxDQUFDLElBQUtELGNBQWMsRUFBRztNQUM1RCxPQUFPQyxDQUFDO0lBQ1Y7RUFDRjtFQUNBLE9BQU9yRCxzQ0FBc0MsQ0FBQ21ELE1BQU0sR0FBRyxDQUFDO0FBQzFELENBQUM7QUFFRG5HLFFBQVEsQ0FBQ3NHLFFBQVEsQ0FBRSw0QkFBNEIsRUFBRXBELDBCQUEyQixDQUFDO0FBQzdFLGVBQWVBLDBCQUEwQiJ9