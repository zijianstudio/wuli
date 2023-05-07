// Copyright 2019-2022, University of Colorado Boulder

/**
 * Node that holds the PDOM content for the screen summary in Molarity.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Taylor Want (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Node } from '../../../../scenery/js/imports.js';
import molarity from '../../molarity.js';
import MolarityStrings from '../../MolarityStrings.js';
const ofString = MolarityStrings.a11y.of;
const notSaturatedString = MolarityStrings.a11y.notSaturated;
const screenSummaryQualitativeConcentrationPatternString = MolarityStrings.a11y.screenSummary.qualitativeConcentrationPattern;
const screenSummaryQuantitativeConcentrationPatternString = MolarityStrings.a11y.screenSummary.quantitativeConcentrationPattern;
const saturatedString = MolarityStrings.a11y.saturated;
const screenSummaryPlayAreaPatternString = MolarityStrings.a11y.screenSummary.playAreaPattern;
const screenSummaryControlAreaPatternString = MolarityStrings.a11y.screenSummary.controlAreaPattern;
const screenSummarySimInteractionHintString = MolarityStrings.a11y.screenSummary.simInteractionHint;
const screenSummaryCurrentStateOfSimNoSolutePatternString = MolarityStrings.a11y.screenSummary.currentStateOfSimNoSolutePattern;
const screenSummaryCurrentStateOfSimPatternString = MolarityStrings.a11y.screenSummary.currentStateOfSimPattern;
class MolarityScreenSummaryNode extends Node {
  /**
   * @param {MolarityModel} model
   * @param {Property.<boolean>} useQuantitativeDescriptionsProperty - tracks whether the values are visible
   * @param {ConcentrationDescriber} concentrationDescriber
   * @param {SoluteAmountDescriber} soluteAmountDescriber
   * @param {SoluteDescriber} soluteDescriber
   * @param {VolumeDescriber} volumeDescriber
   */
  constructor(model, useQuantitativeDescriptionsProperty, concentrationDescriber, soluteAmountDescriber, soluteDescriber, volumeDescriber) {
    super();

    // @private
    this.solution = model.solution;
    this.useQuantitativeDescriptionsProperty = useQuantitativeDescriptionsProperty;
    this.concentrationDescriber = concentrationDescriber;
    this.soluteAmountDescriber = soluteAmountDescriber;
    this.soluteDescriber = soluteDescriber;
    this.volumeDescriber = volumeDescriber;

    // First paragraph of the screen summary -- static regardless of state of sim, describes the play area
    this.addChild(new Node({
      tagName: 'p',
      innerContent: StringUtils.fillIn(screenSummaryPlayAreaPatternString, {
        numberOfSolutes: model.solutes.length
      })
    }));

    // Second paragraph of the screen summary -- static regardless of state of sim, describes the control area
    this.addChild(new Node({
      tagName: 'p',
      innerContent: screenSummaryControlAreaPatternString
    }));

    // Third paragraph of the screen summary -- dynamic depending on the state of the sim so keep a reference to it.
    const stateOfSimNode = new Node({
      tagName: 'p'
    });
    this.addChild(stateOfSimNode);

    // Fourth paragraph of the screen summary -- static regardless of state of sim, gives the interaction hint
    this.addChild(new Node({
      tagName: 'p',
      innerContent: screenSummarySimInteractionHintString
    }));

    // Updates the third paragraph of the screen summary when sim Properties change.
    Multilink.multilink([this.solution.soluteProperty, this.solution.volumeProperty, this.solution.soluteAmountProperty, this.solution.concentrationProperty, useQuantitativeDescriptionsProperty], () => {
      stateOfSimNode.innerContent = this.getStateOfSimDescription();
    });
  }

  /**
   * @private
   * @returns {string} - the screen summary paragraph, which differs based on whether quantitative or qualitative
   * descriptions are show, and whether or not there is some solute in the beaker.
   */
  getStateOfSimDescription() {
    let stateString = screenSummaryCurrentStateOfSimPatternString;

    // concentrationString will form the base of the concentrationPattern substring (filled in below)
    const concentrationString = this.useQuantitativeDescriptionsProperty.value ? screenSummaryQuantitativeConcentrationPatternString : screenSummaryQualitativeConcentrationPatternString;
    const concentrationPattern = StringUtils.fillIn(concentrationString, {
      concentration: this.concentrationDescriber.getCurrentConcentrationClause(),
      isSaturated: this.solution.isSaturated() ? saturatedString : notSaturatedString
    });

    // If there is no solute in the beaker, the PDOM descriptions change.
    if (!this.solution.hasSolute()) {
      stateString = screenSummaryCurrentStateOfSimNoSolutePatternString;
    }
    return StringUtils.fillIn(stateString, {
      volume: this.volumeDescriber.getCurrentVolume(true),
      color: this.soluteDescriber.getCurrentColor(),
      solute: this.soluteDescriber.getCurrentSoluteName(),
      soluteAmount: this.soluteAmountDescriber.getCurrentSoluteAmount(),
      of: this.useQuantitativeDescriptionsProperty.value ? ofString : '',
      concentrationClause: concentrationPattern,
      saturatedConcentration: this.solution.isSaturated() ? saturatedString : ''
    });
  }
}
molarity.register('MolarityScreenSummaryNode', MolarityScreenSummaryNode);
export default MolarityScreenSummaryNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJTdHJpbmdVdGlscyIsIk5vZGUiLCJtb2xhcml0eSIsIk1vbGFyaXR5U3RyaW5ncyIsIm9mU3RyaW5nIiwiYTExeSIsIm9mIiwibm90U2F0dXJhdGVkU3RyaW5nIiwibm90U2F0dXJhdGVkIiwic2NyZWVuU3VtbWFyeVF1YWxpdGF0aXZlQ29uY2VudHJhdGlvblBhdHRlcm5TdHJpbmciLCJzY3JlZW5TdW1tYXJ5IiwicXVhbGl0YXRpdmVDb25jZW50cmF0aW9uUGF0dGVybiIsInNjcmVlblN1bW1hcnlRdWFudGl0YXRpdmVDb25jZW50cmF0aW9uUGF0dGVyblN0cmluZyIsInF1YW50aXRhdGl2ZUNvbmNlbnRyYXRpb25QYXR0ZXJuIiwic2F0dXJhdGVkU3RyaW5nIiwic2F0dXJhdGVkIiwic2NyZWVuU3VtbWFyeVBsYXlBcmVhUGF0dGVyblN0cmluZyIsInBsYXlBcmVhUGF0dGVybiIsInNjcmVlblN1bW1hcnlDb250cm9sQXJlYVBhdHRlcm5TdHJpbmciLCJjb250cm9sQXJlYVBhdHRlcm4iLCJzY3JlZW5TdW1tYXJ5U2ltSW50ZXJhY3Rpb25IaW50U3RyaW5nIiwic2ltSW50ZXJhY3Rpb25IaW50Iiwic2NyZWVuU3VtbWFyeUN1cnJlbnRTdGF0ZU9mU2ltTm9Tb2x1dGVQYXR0ZXJuU3RyaW5nIiwiY3VycmVudFN0YXRlT2ZTaW1Ob1NvbHV0ZVBhdHRlcm4iLCJzY3JlZW5TdW1tYXJ5Q3VycmVudFN0YXRlT2ZTaW1QYXR0ZXJuU3RyaW5nIiwiY3VycmVudFN0YXRlT2ZTaW1QYXR0ZXJuIiwiTW9sYXJpdHlTY3JlZW5TdW1tYXJ5Tm9kZSIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ1c2VRdWFudGl0YXRpdmVEZXNjcmlwdGlvbnNQcm9wZXJ0eSIsImNvbmNlbnRyYXRpb25EZXNjcmliZXIiLCJzb2x1dGVBbW91bnREZXNjcmliZXIiLCJzb2x1dGVEZXNjcmliZXIiLCJ2b2x1bWVEZXNjcmliZXIiLCJzb2x1dGlvbiIsImFkZENoaWxkIiwidGFnTmFtZSIsImlubmVyQ29udGVudCIsImZpbGxJbiIsIm51bWJlck9mU29sdXRlcyIsInNvbHV0ZXMiLCJsZW5ndGgiLCJzdGF0ZU9mU2ltTm9kZSIsIm11bHRpbGluayIsInNvbHV0ZVByb3BlcnR5Iiwidm9sdW1lUHJvcGVydHkiLCJzb2x1dGVBbW91bnRQcm9wZXJ0eSIsImNvbmNlbnRyYXRpb25Qcm9wZXJ0eSIsImdldFN0YXRlT2ZTaW1EZXNjcmlwdGlvbiIsInN0YXRlU3RyaW5nIiwiY29uY2VudHJhdGlvblN0cmluZyIsInZhbHVlIiwiY29uY2VudHJhdGlvblBhdHRlcm4iLCJjb25jZW50cmF0aW9uIiwiZ2V0Q3VycmVudENvbmNlbnRyYXRpb25DbGF1c2UiLCJpc1NhdHVyYXRlZCIsImhhc1NvbHV0ZSIsInZvbHVtZSIsImdldEN1cnJlbnRWb2x1bWUiLCJjb2xvciIsImdldEN1cnJlbnRDb2xvciIsInNvbHV0ZSIsImdldEN1cnJlbnRTb2x1dGVOYW1lIiwic29sdXRlQW1vdW50IiwiZ2V0Q3VycmVudFNvbHV0ZUFtb3VudCIsImNvbmNlbnRyYXRpb25DbGF1c2UiLCJzYXR1cmF0ZWRDb25jZW50cmF0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNb2xhcml0eVNjcmVlblN1bW1hcnlOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE5vZGUgdGhhdCBob2xkcyB0aGUgUERPTSBjb250ZW50IGZvciB0aGUgc2NyZWVuIHN1bW1hcnkgaW4gTW9sYXJpdHkuXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBUYXlsb3IgV2FudCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbW9sYXJpdHkgZnJvbSAnLi4vLi4vbW9sYXJpdHkuanMnO1xyXG5pbXBvcnQgTW9sYXJpdHlTdHJpbmdzIGZyb20gJy4uLy4uL01vbGFyaXR5U3RyaW5ncy5qcyc7XHJcblxyXG5jb25zdCBvZlN0cmluZyA9IE1vbGFyaXR5U3RyaW5ncy5hMTF5Lm9mO1xyXG5jb25zdCBub3RTYXR1cmF0ZWRTdHJpbmcgPSBNb2xhcml0eVN0cmluZ3MuYTExeS5ub3RTYXR1cmF0ZWQ7XHJcbmNvbnN0IHNjcmVlblN1bW1hcnlRdWFsaXRhdGl2ZUNvbmNlbnRyYXRpb25QYXR0ZXJuU3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmExMXkuc2NyZWVuU3VtbWFyeS5xdWFsaXRhdGl2ZUNvbmNlbnRyYXRpb25QYXR0ZXJuO1xyXG5jb25zdCBzY3JlZW5TdW1tYXJ5UXVhbnRpdGF0aXZlQ29uY2VudHJhdGlvblBhdHRlcm5TdHJpbmcgPSBNb2xhcml0eVN0cmluZ3MuYTExeS5zY3JlZW5TdW1tYXJ5LnF1YW50aXRhdGl2ZUNvbmNlbnRyYXRpb25QYXR0ZXJuO1xyXG5jb25zdCBzYXR1cmF0ZWRTdHJpbmcgPSBNb2xhcml0eVN0cmluZ3MuYTExeS5zYXR1cmF0ZWQ7XHJcbmNvbnN0IHNjcmVlblN1bW1hcnlQbGF5QXJlYVBhdHRlcm5TdHJpbmcgPSBNb2xhcml0eVN0cmluZ3MuYTExeS5zY3JlZW5TdW1tYXJ5LnBsYXlBcmVhUGF0dGVybjtcclxuY29uc3Qgc2NyZWVuU3VtbWFyeUNvbnRyb2xBcmVhUGF0dGVyblN0cmluZyA9IE1vbGFyaXR5U3RyaW5ncy5hMTF5LnNjcmVlblN1bW1hcnkuY29udHJvbEFyZWFQYXR0ZXJuO1xyXG5jb25zdCBzY3JlZW5TdW1tYXJ5U2ltSW50ZXJhY3Rpb25IaW50U3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmExMXkuc2NyZWVuU3VtbWFyeS5zaW1JbnRlcmFjdGlvbkhpbnQ7XHJcbmNvbnN0IHNjcmVlblN1bW1hcnlDdXJyZW50U3RhdGVPZlNpbU5vU29sdXRlUGF0dGVyblN0cmluZyA9IE1vbGFyaXR5U3RyaW5ncy5hMTF5LnNjcmVlblN1bW1hcnkuY3VycmVudFN0YXRlT2ZTaW1Ob1NvbHV0ZVBhdHRlcm47XHJcbmNvbnN0IHNjcmVlblN1bW1hcnlDdXJyZW50U3RhdGVPZlNpbVBhdHRlcm5TdHJpbmcgPSBNb2xhcml0eVN0cmluZ3MuYTExeS5zY3JlZW5TdW1tYXJ5LmN1cnJlbnRTdGF0ZU9mU2ltUGF0dGVybjtcclxuXHJcbmNsYXNzIE1vbGFyaXR5U2NyZWVuU3VtbWFyeU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNb2xhcml0eU1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSB1c2VRdWFudGl0YXRpdmVEZXNjcmlwdGlvbnNQcm9wZXJ0eSAtIHRyYWNrcyB3aGV0aGVyIHRoZSB2YWx1ZXMgYXJlIHZpc2libGVcclxuICAgKiBAcGFyYW0ge0NvbmNlbnRyYXRpb25EZXNjcmliZXJ9IGNvbmNlbnRyYXRpb25EZXNjcmliZXJcclxuICAgKiBAcGFyYW0ge1NvbHV0ZUFtb3VudERlc2NyaWJlcn0gc29sdXRlQW1vdW50RGVzY3JpYmVyXHJcbiAgICogQHBhcmFtIHtTb2x1dGVEZXNjcmliZXJ9IHNvbHV0ZURlc2NyaWJlclxyXG4gICAqIEBwYXJhbSB7Vm9sdW1lRGVzY3JpYmVyfSB2b2x1bWVEZXNjcmliZXJcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHVzZVF1YW50aXRhdGl2ZURlc2NyaXB0aW9uc1Byb3BlcnR5LCBjb25jZW50cmF0aW9uRGVzY3JpYmVyLCBzb2x1dGVBbW91bnREZXNjcmliZXIsXHJcbiAgICAgICAgICAgICAgIHNvbHV0ZURlc2NyaWJlciwgdm9sdW1lRGVzY3JpYmVyICkge1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuc29sdXRpb24gPSBtb2RlbC5zb2x1dGlvbjtcclxuICAgIHRoaXMudXNlUXVhbnRpdGF0aXZlRGVzY3JpcHRpb25zUHJvcGVydHkgPSB1c2VRdWFudGl0YXRpdmVEZXNjcmlwdGlvbnNQcm9wZXJ0eTtcclxuICAgIHRoaXMuY29uY2VudHJhdGlvbkRlc2NyaWJlciA9IGNvbmNlbnRyYXRpb25EZXNjcmliZXI7XHJcbiAgICB0aGlzLnNvbHV0ZUFtb3VudERlc2NyaWJlciA9IHNvbHV0ZUFtb3VudERlc2NyaWJlcjtcclxuICAgIHRoaXMuc29sdXRlRGVzY3JpYmVyID0gc29sdXRlRGVzY3JpYmVyO1xyXG4gICAgdGhpcy52b2x1bWVEZXNjcmliZXIgPSB2b2x1bWVEZXNjcmliZXI7XHJcblxyXG4gICAgLy8gRmlyc3QgcGFyYWdyYXBoIG9mIHRoZSBzY3JlZW4gc3VtbWFyeSAtLSBzdGF0aWMgcmVnYXJkbGVzcyBvZiBzdGF0ZSBvZiBzaW0sIGRlc2NyaWJlcyB0aGUgcGxheSBhcmVhXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgTm9kZSgge1xyXG4gICAgICB0YWdOYW1lOiAncCcsXHJcbiAgICAgIGlubmVyQ29udGVudDogU3RyaW5nVXRpbHMuZmlsbEluKCBzY3JlZW5TdW1tYXJ5UGxheUFyZWFQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgbnVtYmVyT2ZTb2x1dGVzOiBtb2RlbC5zb2x1dGVzLmxlbmd0aFxyXG4gICAgICB9IClcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIFNlY29uZCBwYXJhZ3JhcGggb2YgdGhlIHNjcmVlbiBzdW1tYXJ5IC0tIHN0YXRpYyByZWdhcmRsZXNzIG9mIHN0YXRlIG9mIHNpbSwgZGVzY3JpYmVzIHRoZSBjb250cm9sIGFyZWFcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBOb2RlKCB7XHJcbiAgICAgIHRhZ05hbWU6ICdwJyxcclxuICAgICAgaW5uZXJDb250ZW50OiBzY3JlZW5TdW1tYXJ5Q29udHJvbEFyZWFQYXR0ZXJuU3RyaW5nXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBUaGlyZCBwYXJhZ3JhcGggb2YgdGhlIHNjcmVlbiBzdW1tYXJ5IC0tIGR5bmFtaWMgZGVwZW5kaW5nIG9uIHRoZSBzdGF0ZSBvZiB0aGUgc2ltIHNvIGtlZXAgYSByZWZlcmVuY2UgdG8gaXQuXHJcbiAgICBjb25zdCBzdGF0ZU9mU2ltTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIHRhZ05hbWU6ICdwJ1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggc3RhdGVPZlNpbU5vZGUgKTtcclxuXHJcbiAgICAvLyBGb3VydGggcGFyYWdyYXBoIG9mIHRoZSBzY3JlZW4gc3VtbWFyeSAtLSBzdGF0aWMgcmVnYXJkbGVzcyBvZiBzdGF0ZSBvZiBzaW0sIGdpdmVzIHRoZSBpbnRlcmFjdGlvbiBoaW50XHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgTm9kZSgge1xyXG4gICAgICB0YWdOYW1lOiAncCcsXHJcbiAgICAgIGlubmVyQ29udGVudDogc2NyZWVuU3VtbWFyeVNpbUludGVyYWN0aW9uSGludFN0cmluZ1xyXG4gICAgfSApICk7XHJcblxyXG4gICAgLy8gVXBkYXRlcyB0aGUgdGhpcmQgcGFyYWdyYXBoIG9mIHRoZSBzY3JlZW4gc3VtbWFyeSB3aGVuIHNpbSBQcm9wZXJ0aWVzIGNoYW5nZS5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFtcclxuICAgICAgdGhpcy5zb2x1dGlvbi5zb2x1dGVQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5zb2x1dGlvbi52b2x1bWVQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5zb2x1dGlvbi5zb2x1dGVBbW91bnRQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5zb2x1dGlvbi5jb25jZW50cmF0aW9uUHJvcGVydHksXHJcbiAgICAgIHVzZVF1YW50aXRhdGl2ZURlc2NyaXB0aW9uc1Byb3BlcnR5XHJcbiAgICBdLCAoKSA9PiB7XHJcbiAgICAgIHN0YXRlT2ZTaW1Ob2RlLmlubmVyQ29udGVudCA9IHRoaXMuZ2V0U3RhdGVPZlNpbURlc2NyaXB0aW9uKCk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gdGhlIHNjcmVlbiBzdW1tYXJ5IHBhcmFncmFwaCwgd2hpY2ggZGlmZmVycyBiYXNlZCBvbiB3aGV0aGVyIHF1YW50aXRhdGl2ZSBvciBxdWFsaXRhdGl2ZVxyXG4gICAqIGRlc2NyaXB0aW9ucyBhcmUgc2hvdywgYW5kIHdoZXRoZXIgb3Igbm90IHRoZXJlIGlzIHNvbWUgc29sdXRlIGluIHRoZSBiZWFrZXIuXHJcbiAgICovXHJcbiAgZ2V0U3RhdGVPZlNpbURlc2NyaXB0aW9uKCkge1xyXG4gICAgbGV0IHN0YXRlU3RyaW5nID0gc2NyZWVuU3VtbWFyeUN1cnJlbnRTdGF0ZU9mU2ltUGF0dGVyblN0cmluZztcclxuXHJcbiAgICAvLyBjb25jZW50cmF0aW9uU3RyaW5nIHdpbGwgZm9ybSB0aGUgYmFzZSBvZiB0aGUgY29uY2VudHJhdGlvblBhdHRlcm4gc3Vic3RyaW5nIChmaWxsZWQgaW4gYmVsb3cpXHJcbiAgICBjb25zdCBjb25jZW50cmF0aW9uU3RyaW5nID0gdGhpcy51c2VRdWFudGl0YXRpdmVEZXNjcmlwdGlvbnNQcm9wZXJ0eS52YWx1ZSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyZWVuU3VtbWFyeVF1YW50aXRhdGl2ZUNvbmNlbnRyYXRpb25QYXR0ZXJuU3RyaW5nIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JlZW5TdW1tYXJ5UXVhbGl0YXRpdmVDb25jZW50cmF0aW9uUGF0dGVyblN0cmluZztcclxuICAgIGNvbnN0IGNvbmNlbnRyYXRpb25QYXR0ZXJuID0gU3RyaW5nVXRpbHMuZmlsbEluKCBjb25jZW50cmF0aW9uU3RyaW5nLCB7XHJcbiAgICAgIGNvbmNlbnRyYXRpb246IHRoaXMuY29uY2VudHJhdGlvbkRlc2NyaWJlci5nZXRDdXJyZW50Q29uY2VudHJhdGlvbkNsYXVzZSgpLFxyXG4gICAgICBpc1NhdHVyYXRlZDogdGhpcy5zb2x1dGlvbi5pc1NhdHVyYXRlZCgpID8gc2F0dXJhdGVkU3RyaW5nIDogbm90U2F0dXJhdGVkU3RyaW5nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gc29sdXRlIGluIHRoZSBiZWFrZXIsIHRoZSBQRE9NIGRlc2NyaXB0aW9ucyBjaGFuZ2UuXHJcbiAgICBpZiAoICF0aGlzLnNvbHV0aW9uLmhhc1NvbHV0ZSgpICkge1xyXG4gICAgICBzdGF0ZVN0cmluZyA9IHNjcmVlblN1bW1hcnlDdXJyZW50U3RhdGVPZlNpbU5vU29sdXRlUGF0dGVyblN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBzdGF0ZVN0cmluZywge1xyXG4gICAgICB2b2x1bWU6IHRoaXMudm9sdW1lRGVzY3JpYmVyLmdldEN1cnJlbnRWb2x1bWUoIHRydWUgKSxcclxuICAgICAgY29sb3I6IHRoaXMuc29sdXRlRGVzY3JpYmVyLmdldEN1cnJlbnRDb2xvcigpLFxyXG4gICAgICBzb2x1dGU6IHRoaXMuc29sdXRlRGVzY3JpYmVyLmdldEN1cnJlbnRTb2x1dGVOYW1lKCksXHJcbiAgICAgIHNvbHV0ZUFtb3VudDogdGhpcy5zb2x1dGVBbW91bnREZXNjcmliZXIuZ2V0Q3VycmVudFNvbHV0ZUFtb3VudCgpLFxyXG4gICAgICBvZjogdGhpcy51c2VRdWFudGl0YXRpdmVEZXNjcmlwdGlvbnNQcm9wZXJ0eS52YWx1ZSA/IG9mU3RyaW5nIDogJycsXHJcbiAgICAgIGNvbmNlbnRyYXRpb25DbGF1c2U6IGNvbmNlbnRyYXRpb25QYXR0ZXJuLFxyXG4gICAgICBzYXR1cmF0ZWRDb25jZW50cmF0aW9uOiB0aGlzLnNvbHV0aW9uLmlzU2F0dXJhdGVkKCkgPyBzYXR1cmF0ZWRTdHJpbmcgOiAnJ1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxubW9sYXJpdHkucmVnaXN0ZXIoICdNb2xhcml0eVNjcmVlblN1bW1hcnlOb2RlJywgTW9sYXJpdHlTY3JlZW5TdW1tYXJ5Tm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBNb2xhcml0eVNjcmVlblN1bW1hcnlOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsU0FBU0MsSUFBSSxRQUFRLG1DQUFtQztBQUN4RCxPQUFPQyxRQUFRLE1BQU0sbUJBQW1CO0FBQ3hDLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFFdEQsTUFBTUMsUUFBUSxHQUFHRCxlQUFlLENBQUNFLElBQUksQ0FBQ0MsRUFBRTtBQUN4QyxNQUFNQyxrQkFBa0IsR0FBR0osZUFBZSxDQUFDRSxJQUFJLENBQUNHLFlBQVk7QUFDNUQsTUFBTUMsa0RBQWtELEdBQUdOLGVBQWUsQ0FBQ0UsSUFBSSxDQUFDSyxhQUFhLENBQUNDLCtCQUErQjtBQUM3SCxNQUFNQyxtREFBbUQsR0FBR1QsZUFBZSxDQUFDRSxJQUFJLENBQUNLLGFBQWEsQ0FBQ0csZ0NBQWdDO0FBQy9ILE1BQU1DLGVBQWUsR0FBR1gsZUFBZSxDQUFDRSxJQUFJLENBQUNVLFNBQVM7QUFDdEQsTUFBTUMsa0NBQWtDLEdBQUdiLGVBQWUsQ0FBQ0UsSUFBSSxDQUFDSyxhQUFhLENBQUNPLGVBQWU7QUFDN0YsTUFBTUMscUNBQXFDLEdBQUdmLGVBQWUsQ0FBQ0UsSUFBSSxDQUFDSyxhQUFhLENBQUNTLGtCQUFrQjtBQUNuRyxNQUFNQyxxQ0FBcUMsR0FBR2pCLGVBQWUsQ0FBQ0UsSUFBSSxDQUFDSyxhQUFhLENBQUNXLGtCQUFrQjtBQUNu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