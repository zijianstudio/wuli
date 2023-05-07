// Copyright 2019-2022, University of Colorado Boulder

/**
 * SoluteDescriber is responsible for generating descriptions about the Solution.soluteProperty.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Taylor Want (PhET Interactive Simulations)
 */

import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import StringCasingPair from '../../../../../scenery-phet/js/accessibility/StringCasingPair.js';
import molarity from '../../../molarity.js';
import MolarityStrings from '../../../MolarityStrings.js';
import Water from '../../model/Water.js';
import MolaritySymbols from '../../MolaritySymbols.js';
const beakerChemicalFormulaPatternString = MolarityStrings.a11y.beaker.chemicalFormulaPattern;
const noSoluteAlertQuantitativeString = MolarityStrings.a11y.noSoluteAlertQuantitative;
const noSoluteAlertQualitativeString = MolarityStrings.a11y.noSoluteAlertQualitative;
const quantitativeConcentrationStatePatternString = MolarityStrings.a11y.quantitative.concentrationStatePattern;
const soluteChangedQuantitativeConcentrationPatternString = MolarityStrings.a11y.soluteChangedQuantitativeConcentrationPattern;
const soluteChangedQualitativeConcentrationPatternString = MolarityStrings.a11y.soluteChangedQualitativeConcentrationPattern;
const soluteChangedSaturatedAlertPatternString = MolarityStrings.a11y.soluteChangedSaturatedAlertPattern;
const soluteChangedUnsaturatedAlertPatternString = MolarityStrings.a11y.soluteChangedUnsaturatedAlertPattern;
class SoluteDescriber {
  /**
   * @param {MacroSolution} solution
   * @param {ConcentrationDescriber} concentrationDescriber
   * @param {PrecipitateAmountDescriber} precipitateAmountDescriber
   */
  constructor(solution, concentrationDescriber, precipitateAmountDescriber) {
    // @private
    this.solution = solution;
    this.concentrationDescriber = concentrationDescriber;
    this.precipitateAmountDescriber = precipitateAmountDescriber;
  }

  /**
   * Gets the name of the current solute selected.
   * @public
   * @param [isCapitalized] {boolean}
   * @returns {string}
   */
  getCurrentSoluteName(isCapitalized = false) {
    const currentSolute = this.solution.soluteProperty.value;
    return isCapitalized ? currentSolute.name : currentSolute.lowercaseName;
  }

  /**
   * Gets the chemical formula of the currently selected solute.
   * @public
   * @returns {string} - e.g. 'chemical formula of potassium permanganate is KMnO4.'
   */
  getBeakerChemicalFormulaString() {
    assert && assert(this.solution.soluteProperty.value.formula !== MolaritySymbols.DRINK_MIX, 'attempted to generate chemical formula string for drink mix, which has no chemical formula');
    return StringUtils.fillIn(beakerChemicalFormulaPatternString, {
      chemicalFormula: this.solution.soluteProperty.value.formula,
      solute: this.getCurrentSoluteName()
    });
  }

  /**
   * Gets the color of the solution.
   * @param [isCapitalized] {boolean}
   * @public
   * @returns {string}
   */
  getCurrentColor(isCapitalized = false) {
    let currentSoluteColorPair = this.solution.soluteProperty.value.colorStringPair;
    assert && assert(currentSoluteColorPair instanceof StringCasingPair);
    if (!this.solution.hasSolute()) {
      currentSoluteColorPair = Water.colorStringPair;
    }
    return isCapitalized ? currentSoluteColorPair.capitalized : currentSoluteColorPair.lowercase;
  }

  /**
   * Describes the new solute and any change in saturation when a user changes the solute in the combo box.
   * @param {Property.<boolean>} useQuantitativeDescriptionsProperty
   * @public
   * @returns {string}
   */
  getSoluteChangedAlertString(useQuantitativeDescriptionsProperty) {
    if (!this.solution.hasSolute()) {
      return useQuantitativeDescriptionsProperty.value ? noSoluteAlertQuantitativeString : noSoluteAlertQualitativeString;
    }
    let concentrationClause;
    let soluteChangedString;
    if (this.solution.isSaturated()) {
      soluteChangedString = soluteChangedSaturatedAlertPatternString;
      concentrationClause = useQuantitativeDescriptionsProperty.value ? StringUtils.fillIn(soluteChangedQuantitativeConcentrationPatternString, {
        concentration: this.concentrationDescriber.getCurrentConcentrationClause()

        // this qualitative description is to support the no trailing/leading space assertion, but could be simplifilied if that ever changes
      }) : soluteChangedQualitativeConcentrationPatternString;
    } else {
      soluteChangedString = soluteChangedUnsaturatedAlertPatternString;
      concentrationClause = useQuantitativeDescriptionsProperty.value ? StringUtils.fillIn(quantitativeConcentrationStatePatternString, {
        concentration: this.concentrationDescriber.getCurrentConcentrationClause()
      }) : this.concentrationDescriber.getCurrentConcentrationClause(true);
    }
    return StringUtils.fillIn(soluteChangedString, {
      color: this.getCurrentColor(true),
      solids: this.precipitateAmountDescriber.getCurrentPrecipitateAmountDescription(),
      concentrationClause: concentrationClause
    });
  }
}
molarity.register('SoluteDescriber', SoluteDescriber);
export default SoluteDescriber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdVdGlscyIsIlN0cmluZ0Nhc2luZ1BhaXIiLCJtb2xhcml0eSIsIk1vbGFyaXR5U3RyaW5ncyIsIldhdGVyIiwiTW9sYXJpdHlTeW1ib2xzIiwiYmVha2VyQ2hlbWljYWxGb3JtdWxhUGF0dGVyblN0cmluZyIsImExMXkiLCJiZWFrZXIiLCJjaGVtaWNhbEZvcm11bGFQYXR0ZXJuIiwibm9Tb2x1dGVBbGVydFF1YW50aXRhdGl2ZVN0cmluZyIsIm5vU29sdXRlQWxlcnRRdWFudGl0YXRpdmUiLCJub1NvbHV0ZUFsZXJ0UXVhbGl0YXRpdmVTdHJpbmciLCJub1NvbHV0ZUFsZXJ0UXVhbGl0YXRpdmUiLCJxdWFudGl0YXRpdmVDb25jZW50cmF0aW9uU3RhdGVQYXR0ZXJuU3RyaW5nIiwicXVhbnRpdGF0aXZlIiwiY29uY2VudHJhdGlvblN0YXRlUGF0dGVybiIsInNvbHV0ZUNoYW5nZWRRdWFudGl0YXRpdmVDb25jZW50cmF0aW9uUGF0dGVyblN0cmluZyIsInNvbHV0ZUNoYW5nZWRRdWFudGl0YXRpdmVDb25jZW50cmF0aW9uUGF0dGVybiIsInNvbHV0ZUNoYW5nZWRRdWFsaXRhdGl2ZUNvbmNlbnRyYXRpb25QYXR0ZXJuU3RyaW5nIiwic29sdXRlQ2hhbmdlZFF1YWxpdGF0aXZlQ29uY2VudHJhdGlvblBhdHRlcm4iLCJzb2x1dGVDaGFuZ2VkU2F0dXJhdGVkQWxlcnRQYXR0ZXJuU3RyaW5nIiwic29sdXRlQ2hhbmdlZFNhdHVyYXRlZEFsZXJ0UGF0dGVybiIsInNvbHV0ZUNoYW5nZWRVbnNhdHVyYXRlZEFsZXJ0UGF0dGVyblN0cmluZyIsInNvbHV0ZUNoYW5nZWRVbnNhdHVyYXRlZEFsZXJ0UGF0dGVybiIsIlNvbHV0ZURlc2NyaWJlciIsImNvbnN0cnVjdG9yIiwic29sdXRpb24iLCJjb25jZW50cmF0aW9uRGVzY3JpYmVyIiwicHJlY2lwaXRhdGVBbW91bnREZXNjcmliZXIiLCJnZXRDdXJyZW50U29sdXRlTmFtZSIsImlzQ2FwaXRhbGl6ZWQiLCJjdXJyZW50U29sdXRlIiwic29sdXRlUHJvcGVydHkiLCJ2YWx1ZSIsIm5hbWUiLCJsb3dlcmNhc2VOYW1lIiwiZ2V0QmVha2VyQ2hlbWljYWxGb3JtdWxhU3RyaW5nIiwiYXNzZXJ0IiwiZm9ybXVsYSIsIkRSSU5LX01JWCIsImZpbGxJbiIsImNoZW1pY2FsRm9ybXVsYSIsInNvbHV0ZSIsImdldEN1cnJlbnRDb2xvciIsImN1cnJlbnRTb2x1dGVDb2xvclBhaXIiLCJjb2xvclN0cmluZ1BhaXIiLCJoYXNTb2x1dGUiLCJjYXBpdGFsaXplZCIsImxvd2VyY2FzZSIsImdldFNvbHV0ZUNoYW5nZWRBbGVydFN0cmluZyIsInVzZVF1YW50aXRhdGl2ZURlc2NyaXB0aW9uc1Byb3BlcnR5IiwiY29uY2VudHJhdGlvbkNsYXVzZSIsInNvbHV0ZUNoYW5nZWRTdHJpbmciLCJpc1NhdHVyYXRlZCIsImNvbmNlbnRyYXRpb24iLCJnZXRDdXJyZW50Q29uY2VudHJhdGlvbkNsYXVzZSIsImNvbG9yIiwic29saWRzIiwiZ2V0Q3VycmVudFByZWNpcGl0YXRlQW1vdW50RGVzY3JpcHRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNvbHV0ZURlc2NyaWJlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTb2x1dGVEZXNjcmliZXIgaXMgcmVzcG9uc2libGUgZm9yIGdlbmVyYXRpbmcgZGVzY3JpcHRpb25zIGFib3V0IHRoZSBTb2x1dGlvbi5zb2x1dGVQcm9wZXJ0eS5cclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFRheWxvciBXYW50IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgU3RyaW5nQ2FzaW5nUGFpciBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYWNjZXNzaWJpbGl0eS9TdHJpbmdDYXNpbmdQYWlyLmpzJztcclxuaW1wb3J0IG1vbGFyaXR5IGZyb20gJy4uLy4uLy4uL21vbGFyaXR5LmpzJztcclxuaW1wb3J0IE1vbGFyaXR5U3RyaW5ncyBmcm9tICcuLi8uLi8uLi9Nb2xhcml0eVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgV2F0ZXIgZnJvbSAnLi4vLi4vbW9kZWwvV2F0ZXIuanMnO1xyXG5pbXBvcnQgTW9sYXJpdHlTeW1ib2xzIGZyb20gJy4uLy4uL01vbGFyaXR5U3ltYm9scy5qcyc7XHJcblxyXG5jb25zdCBiZWFrZXJDaGVtaWNhbEZvcm11bGFQYXR0ZXJuU3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmExMXkuYmVha2VyLmNoZW1pY2FsRm9ybXVsYVBhdHRlcm47XHJcbmNvbnN0IG5vU29sdXRlQWxlcnRRdWFudGl0YXRpdmVTdHJpbmcgPSBNb2xhcml0eVN0cmluZ3MuYTExeS5ub1NvbHV0ZUFsZXJ0UXVhbnRpdGF0aXZlO1xyXG5jb25zdCBub1NvbHV0ZUFsZXJ0UXVhbGl0YXRpdmVTdHJpbmcgPSBNb2xhcml0eVN0cmluZ3MuYTExeS5ub1NvbHV0ZUFsZXJ0UXVhbGl0YXRpdmU7XHJcbmNvbnN0IHF1YW50aXRhdGl2ZUNvbmNlbnRyYXRpb25TdGF0ZVBhdHRlcm5TdHJpbmcgPSBNb2xhcml0eVN0cmluZ3MuYTExeS5xdWFudGl0YXRpdmUuY29uY2VudHJhdGlvblN0YXRlUGF0dGVybjtcclxuY29uc3Qgc29sdXRlQ2hhbmdlZFF1YW50aXRhdGl2ZUNvbmNlbnRyYXRpb25QYXR0ZXJuU3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmExMXkuc29sdXRlQ2hhbmdlZFF1YW50aXRhdGl2ZUNvbmNlbnRyYXRpb25QYXR0ZXJuO1xyXG5jb25zdCBzb2x1dGVDaGFuZ2VkUXVhbGl0YXRpdmVDb25jZW50cmF0aW9uUGF0dGVyblN0cmluZyA9IE1vbGFyaXR5U3RyaW5ncy5hMTF5LnNvbHV0ZUNoYW5nZWRRdWFsaXRhdGl2ZUNvbmNlbnRyYXRpb25QYXR0ZXJuO1xyXG5jb25zdCBzb2x1dGVDaGFuZ2VkU2F0dXJhdGVkQWxlcnRQYXR0ZXJuU3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmExMXkuc29sdXRlQ2hhbmdlZFNhdHVyYXRlZEFsZXJ0UGF0dGVybjtcclxuY29uc3Qgc29sdXRlQ2hhbmdlZFVuc2F0dXJhdGVkQWxlcnRQYXR0ZXJuU3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmExMXkuc29sdXRlQ2hhbmdlZFVuc2F0dXJhdGVkQWxlcnRQYXR0ZXJuO1xyXG5cclxuY2xhc3MgU29sdXRlRGVzY3JpYmVyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNYWNyb1NvbHV0aW9ufSBzb2x1dGlvblxyXG4gICAqIEBwYXJhbSB7Q29uY2VudHJhdGlvbkRlc2NyaWJlcn0gY29uY2VudHJhdGlvbkRlc2NyaWJlclxyXG4gICAqIEBwYXJhbSB7UHJlY2lwaXRhdGVBbW91bnREZXNjcmliZXJ9IHByZWNpcGl0YXRlQW1vdW50RGVzY3JpYmVyXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHNvbHV0aW9uLCBjb25jZW50cmF0aW9uRGVzY3JpYmVyLCBwcmVjaXBpdGF0ZUFtb3VudERlc2NyaWJlciApIHtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5zb2x1dGlvbiA9IHNvbHV0aW9uO1xyXG4gICAgdGhpcy5jb25jZW50cmF0aW9uRGVzY3JpYmVyID0gY29uY2VudHJhdGlvbkRlc2NyaWJlcjtcclxuICAgIHRoaXMucHJlY2lwaXRhdGVBbW91bnREZXNjcmliZXIgPSBwcmVjaXBpdGF0ZUFtb3VudERlc2NyaWJlcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG5hbWUgb2YgdGhlIGN1cnJlbnQgc29sdXRlIHNlbGVjdGVkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0gW2lzQ2FwaXRhbGl6ZWRdIHtib29sZWFufVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0Q3VycmVudFNvbHV0ZU5hbWUoIGlzQ2FwaXRhbGl6ZWQgPSBmYWxzZSApIHtcclxuICAgIGNvbnN0IGN1cnJlbnRTb2x1dGUgPSB0aGlzLnNvbHV0aW9uLnNvbHV0ZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgcmV0dXJuIGlzQ2FwaXRhbGl6ZWQgPyBjdXJyZW50U29sdXRlLm5hbWUgOiBjdXJyZW50U29sdXRlLmxvd2VyY2FzZU5hbWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBjaGVtaWNhbCBmb3JtdWxhIG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgc29sdXRlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIGUuZy4gJ2NoZW1pY2FsIGZvcm11bGEgb2YgcG90YXNzaXVtIHBlcm1hbmdhbmF0ZSBpcyBLTW5PNC4nXHJcbiAgICovXHJcbiAgZ2V0QmVha2VyQ2hlbWljYWxGb3JtdWxhU3RyaW5nKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zb2x1dGlvbi5zb2x1dGVQcm9wZXJ0eS52YWx1ZS5mb3JtdWxhICE9PSBNb2xhcml0eVN5bWJvbHMuRFJJTktfTUlYLFxyXG4gICAgICAnYXR0ZW1wdGVkIHRvIGdlbmVyYXRlIGNoZW1pY2FsIGZvcm11bGEgc3RyaW5nIGZvciBkcmluayBtaXgsIHdoaWNoIGhhcyBubyBjaGVtaWNhbCBmb3JtdWxhJyApO1xyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggYmVha2VyQ2hlbWljYWxGb3JtdWxhUGF0dGVyblN0cmluZywge1xyXG4gICAgICBjaGVtaWNhbEZvcm11bGE6IHRoaXMuc29sdXRpb24uc29sdXRlUHJvcGVydHkudmFsdWUuZm9ybXVsYSxcclxuICAgICAgc29sdXRlOiB0aGlzLmdldEN1cnJlbnRTb2x1dGVOYW1lKClcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGNvbG9yIG9mIHRoZSBzb2x1dGlvbi5cclxuICAgKiBAcGFyYW0gW2lzQ2FwaXRhbGl6ZWRdIHtib29sZWFufVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldEN1cnJlbnRDb2xvciggaXNDYXBpdGFsaXplZCA9IGZhbHNlICkge1xyXG4gICAgbGV0IGN1cnJlbnRTb2x1dGVDb2xvclBhaXIgPSB0aGlzLnNvbHV0aW9uLnNvbHV0ZVByb3BlcnR5LnZhbHVlLmNvbG9yU3RyaW5nUGFpcjtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGN1cnJlbnRTb2x1dGVDb2xvclBhaXIgaW5zdGFuY2VvZiBTdHJpbmdDYXNpbmdQYWlyICk7XHJcbiAgICBpZiAoICF0aGlzLnNvbHV0aW9uLmhhc1NvbHV0ZSgpICkge1xyXG4gICAgICBjdXJyZW50U29sdXRlQ29sb3JQYWlyID0gV2F0ZXIuY29sb3JTdHJpbmdQYWlyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGlzQ2FwaXRhbGl6ZWQgPyBjdXJyZW50U29sdXRlQ29sb3JQYWlyLmNhcGl0YWxpemVkIDogY3VycmVudFNvbHV0ZUNvbG9yUGFpci5sb3dlcmNhc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXNjcmliZXMgdGhlIG5ldyBzb2x1dGUgYW5kIGFueSBjaGFuZ2UgaW4gc2F0dXJhdGlvbiB3aGVuIGEgdXNlciBjaGFuZ2VzIHRoZSBzb2x1dGUgaW4gdGhlIGNvbWJvIGJveC5cclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gdXNlUXVhbnRpdGF0aXZlRGVzY3JpcHRpb25zUHJvcGVydHlcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRTb2x1dGVDaGFuZ2VkQWxlcnRTdHJpbmcoIHVzZVF1YW50aXRhdGl2ZURlc2NyaXB0aW9uc1Byb3BlcnR5ICkge1xyXG5cclxuICAgIGlmICggIXRoaXMuc29sdXRpb24uaGFzU29sdXRlKCkgKSB7XHJcbiAgICAgIHJldHVybiB1c2VRdWFudGl0YXRpdmVEZXNjcmlwdGlvbnNQcm9wZXJ0eS52YWx1ZSA/IG5vU29sdXRlQWxlcnRRdWFudGl0YXRpdmVTdHJpbmcgOiBub1NvbHV0ZUFsZXJ0UXVhbGl0YXRpdmVTdHJpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGNvbmNlbnRyYXRpb25DbGF1c2U7XHJcbiAgICBsZXQgc29sdXRlQ2hhbmdlZFN0cmluZztcclxuICAgIGlmICggdGhpcy5zb2x1dGlvbi5pc1NhdHVyYXRlZCgpICkge1xyXG4gICAgICBzb2x1dGVDaGFuZ2VkU3RyaW5nID0gc29sdXRlQ2hhbmdlZFNhdHVyYXRlZEFsZXJ0UGF0dGVyblN0cmluZztcclxuICAgICAgY29uY2VudHJhdGlvbkNsYXVzZSA9IHVzZVF1YW50aXRhdGl2ZURlc2NyaXB0aW9uc1Byb3BlcnR5LnZhbHVlID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0cmluZ1V0aWxzLmZpbGxJbiggc29sdXRlQ2hhbmdlZFF1YW50aXRhdGl2ZUNvbmNlbnRyYXRpb25QYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmNlbnRyYXRpb246IHRoaXMuY29uY2VudHJhdGlvbkRlc2NyaWJlci5nZXRDdXJyZW50Q29uY2VudHJhdGlvbkNsYXVzZSgpXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIHF1YWxpdGF0aXZlIGRlc2NyaXB0aW9uIGlzIHRvIHN1cHBvcnQgdGhlIG5vIHRyYWlsaW5nL2xlYWRpbmcgc3BhY2UgYXNzZXJ0aW9uLCBidXQgY291bGQgYmUgc2ltcGxpZmlsaWVkIGlmIHRoYXQgZXZlciBjaGFuZ2VzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICkgOiBzb2x1dGVDaGFuZ2VkUXVhbGl0YXRpdmVDb25jZW50cmF0aW9uUGF0dGVyblN0cmluZztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBzb2x1dGVDaGFuZ2VkU3RyaW5nID0gc29sdXRlQ2hhbmdlZFVuc2F0dXJhdGVkQWxlcnRQYXR0ZXJuU3RyaW5nO1xyXG4gICAgICBjb25jZW50cmF0aW9uQ2xhdXNlID0gdXNlUXVhbnRpdGF0aXZlRGVzY3JpcHRpb25zUHJvcGVydHkudmFsdWUgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RyaW5nVXRpbHMuZmlsbEluKCBxdWFudGl0YXRpdmVDb25jZW50cmF0aW9uU3RhdGVQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmNlbnRyYXRpb246IHRoaXMuY29uY2VudHJhdGlvbkRlc2NyaWJlci5nZXRDdXJyZW50Q29uY2VudHJhdGlvbkNsYXVzZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25jZW50cmF0aW9uRGVzY3JpYmVyLmdldEN1cnJlbnRDb25jZW50cmF0aW9uQ2xhdXNlKCB0cnVlICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggc29sdXRlQ2hhbmdlZFN0cmluZywge1xyXG4gICAgICBjb2xvcjogdGhpcy5nZXRDdXJyZW50Q29sb3IoIHRydWUgKSxcclxuICAgICAgc29saWRzOiB0aGlzLnByZWNpcGl0YXRlQW1vdW50RGVzY3JpYmVyLmdldEN1cnJlbnRQcmVjaXBpdGF0ZUFtb3VudERlc2NyaXB0aW9uKCksXHJcbiAgICAgIGNvbmNlbnRyYXRpb25DbGF1c2U6IGNvbmNlbnRyYXRpb25DbGF1c2VcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbm1vbGFyaXR5LnJlZ2lzdGVyKCAnU29sdXRlRGVzY3JpYmVyJywg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