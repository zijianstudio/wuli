// Copyright 2020-2023, University of Colorado Boulder

/**
 * ExpandedFormDialog is a modal dialog that displays the expanded sum of a Fourier series.
 * This dialog is designed so that 1 instance can be used, and the expand form that is displayed
 * will remain synchronized to the model.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { HBox, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import Dialog from '../../../../sun/js/Dialog.js';
import FMWConstants from '../../common/FMWConstants.js';
import EquationMarkup from '../../common/view/EquationMarkup.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import FourierMakingWavesStrings from '../../FourierMakingWavesStrings.js';
import DiscreteFourierSeries from '../model/DiscreteFourierSeries.js';
import DiscreteSumEquationNode from './DiscreteSumEquationNode.js';

// Maximum number of terms per line in the expanded form
const TERMS_PER_LINE = 3;
const MAX_WIDTH = 800; // determined empirically

export default class ExpandedFormDialog extends Dialog {
  /**
   * @param {DiscreteFourierSeries} fourierSeries
   * @param {EnumerationProperty.<Domain>} domainProperty
   * @param {EnumerationProperty.<SeriesType>} seriesTypeProperty
   * @param {EnumerationProperty.<EquationForm>} equationFormProperty
   * @param {Object} [options]
   */
  constructor(fourierSeries, domainProperty, seriesTypeProperty, equationFormProperty, options) {
    assert && assert(fourierSeries instanceof DiscreteFourierSeries);
    assert && assert(domainProperty instanceof EnumerationProperty);
    assert && assert(seriesTypeProperty instanceof EnumerationProperty);
    assert && assert(equationFormProperty instanceof EnumerationProperty);
    options = merge({
      // Dialog options
      xSpacing: 30,
      // phet-io
      phetioReadOnly: true
    }, options);
    assert && assert(!options.title, 'ExpandedFormDialog sets children');
    options.title = new Text(FourierMakingWavesStrings.expandedFormStringProperty, {
      font: FMWConstants.DIALOG_TITLE_FONT,
      maxWidth: MAX_WIDTH
    });
    const sumEquationNode = new DiscreteSumEquationNode(fourierSeries.numberOfHarmonicsProperty, domainProperty, seriesTypeProperty, equationFormProperty, {
      font: FMWConstants.EQUATION_FONT
    });

    // F(...) =
    // There's a bit of CSS cleverness here that's worth explaining. Without resorting to using multiple Nodes here
    // and in DiscreteSumEquationNode, we don't want to see the 'F(..)' portion of this markup. But we need it to be present
    // in order for the '=' to align with 'F(...) =' that's at the beginning of sumEquationNode. So we're hiding the
    // 'F(...)' bit using 'color: transparent'.
    const functionEqualToNode = new RichText('', {
      font: FMWConstants.EQUATION_FONT
    });
    domainProperty.link(domain => {
      functionEqualToNode.string = `<span style='color: transparent'>${EquationMarkup.getFunctionOfMarkup(domain)}</span> ${MathSymbols.EQUAL_TO}`;
    });
    const expandedSumNode = new RichText('', {
      font: FMWConstants.EQUATION_FONT,
      leading: 11
    });
    Multilink.multilink([fourierSeries.numberOfHarmonicsProperty, fourierSeries.amplitudesProperty, domainProperty, seriesTypeProperty, equationFormProperty], (numberOfHarmonics, amplitudes, domain, seriesType, equationForm) => {
      let expandedSumMarkup = '';
      for (let order = 1; order <= numberOfHarmonics; order++) {
        // Limit number of decimal places, and drop trailing zeros.
        // See https://github.com/phetsims/fourier-making-waves/issues/20
        const amplitude = Utils.toFixedNumber(amplitudes[order - 1], FMWConstants.DISCRETE_AMPLITUDE_DECIMAL_PLACES);
        expandedSumMarkup += EquationMarkup.getSpecificFormMarkup(domain, seriesType, equationForm, order, amplitude);
        if (order < numberOfHarmonics) {
          expandedSumMarkup += ` ${MathSymbols.PLUS} `;
        }
        if (order % TERMS_PER_LINE === 0) {
          expandedSumMarkup += '<br>';
        }
      }
      expandedSumNode.string = expandedSumMarkup;
    });
    const expandedSumHBox = new HBox({
      spacing: 4,
      align: 'origin',
      children: [functionEqualToNode, expandedSumNode]
    });
    const content = new VBox({
      spacing: 8,
      align: 'left',
      children: [sumEquationNode, expandedSumHBox],
      maxWidth: MAX_WIDTH
    });
    super(content, options);
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
fourierMakingWaves.register('ExpandedFormDialog', ExpandedFormDialog);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblByb3BlcnR5IiwiTXVsdGlsaW5rIiwiVXRpbHMiLCJtZXJnZSIsIk1hdGhTeW1ib2xzIiwiSEJveCIsIlJpY2hUZXh0IiwiVGV4dCIsIlZCb3giLCJEaWFsb2ciLCJGTVdDb25zdGFudHMiLCJFcXVhdGlvbk1hcmt1cCIsImZvdXJpZXJNYWtpbmdXYXZlcyIsIkZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MiLCJEaXNjcmV0ZUZvdXJpZXJTZXJpZXMiLCJEaXNjcmV0ZVN1bUVxdWF0aW9uTm9kZSIsIlRFUk1TX1BFUl9MSU5FIiwiTUFYX1dJRFRIIiwiRXhwYW5kZWRGb3JtRGlhbG9nIiwiY29uc3RydWN0b3IiLCJmb3VyaWVyU2VyaWVzIiwiZG9tYWluUHJvcGVydHkiLCJzZXJpZXNUeXBlUHJvcGVydHkiLCJlcXVhdGlvbkZvcm1Qcm9wZXJ0eSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJ4U3BhY2luZyIsInBoZXRpb1JlYWRPbmx5IiwidGl0bGUiLCJleHBhbmRlZEZvcm1TdHJpbmdQcm9wZXJ0eSIsImZvbnQiLCJESUFMT0dfVElUTEVfRk9OVCIsIm1heFdpZHRoIiwic3VtRXF1YXRpb25Ob2RlIiwibnVtYmVyT2ZIYXJtb25pY3NQcm9wZXJ0eSIsIkVRVUFUSU9OX0ZPTlQiLCJmdW5jdGlvbkVxdWFsVG9Ob2RlIiwibGluayIsImRvbWFpbiIsInN0cmluZyIsImdldEZ1bmN0aW9uT2ZNYXJrdXAiLCJFUVVBTF9UTyIsImV4cGFuZGVkU3VtTm9kZSIsImxlYWRpbmciLCJtdWx0aWxpbmsiLCJhbXBsaXR1ZGVzUHJvcGVydHkiLCJudW1iZXJPZkhhcm1vbmljcyIsImFtcGxpdHVkZXMiLCJzZXJpZXNUeXBlIiwiZXF1YXRpb25Gb3JtIiwiZXhwYW5kZWRTdW1NYXJrdXAiLCJvcmRlciIsImFtcGxpdHVkZSIsInRvRml4ZWROdW1iZXIiLCJESVNDUkVURV9BTVBMSVRVREVfREVDSU1BTF9QTEFDRVMiLCJnZXRTcGVjaWZpY0Zvcm1NYXJrdXAiLCJQTFVTIiwiZXhwYW5kZWRTdW1IQm94Iiwic3BhY2luZyIsImFsaWduIiwiY2hpbGRyZW4iLCJjb250ZW50IiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRXhwYW5kZWRGb3JtRGlhbG9nLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEV4cGFuZGVkRm9ybURpYWxvZyBpcyBhIG1vZGFsIGRpYWxvZyB0aGF0IGRpc3BsYXlzIHRoZSBleHBhbmRlZCBzdW0gb2YgYSBGb3VyaWVyIHNlcmllcy5cclxuICogVGhpcyBkaWFsb2cgaXMgZGVzaWduZWQgc28gdGhhdCAxIGluc3RhbmNlIGNhbiBiZSB1c2VkLCBhbmQgdGhlIGV4cGFuZCBmb3JtIHRoYXQgaXMgZGlzcGxheWVkXHJcbiAqIHdpbGwgcmVtYWluIHN5bmNocm9uaXplZCB0byB0aGUgbW9kZWwuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IE1hdGhTeW1ib2xzIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYXRoU3ltYm9scy5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIFJpY2hUZXh0LCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IERpYWxvZyBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvRGlhbG9nLmpzJztcclxuaW1wb3J0IEZNV0NvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRk1XQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEVxdWF0aW9uTWFya3VwIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0VxdWF0aW9uTWFya3VwLmpzJztcclxuaW1wb3J0IGZvdXJpZXJNYWtpbmdXYXZlcyBmcm9tICcuLi8uLi9mb3VyaWVyTWFraW5nV2F2ZXMuanMnO1xyXG5pbXBvcnQgRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncyBmcm9tICcuLi8uLi9Gb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IERpc2NyZXRlRm91cmllclNlcmllcyBmcm9tICcuLi9tb2RlbC9EaXNjcmV0ZUZvdXJpZXJTZXJpZXMuanMnO1xyXG5pbXBvcnQgRGlzY3JldGVTdW1FcXVhdGlvbk5vZGUgZnJvbSAnLi9EaXNjcmV0ZVN1bUVxdWF0aW9uTm9kZS5qcyc7XHJcblxyXG4vLyBNYXhpbXVtIG51bWJlciBvZiB0ZXJtcyBwZXIgbGluZSBpbiB0aGUgZXhwYW5kZWQgZm9ybVxyXG5jb25zdCBURVJNU19QRVJfTElORSA9IDM7XHJcbmNvbnN0IE1BWF9XSURUSCA9IDgwMDsgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhwYW5kZWRGb3JtRGlhbG9nIGV4dGVuZHMgRGlhbG9nIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtEaXNjcmV0ZUZvdXJpZXJTZXJpZXN9IGZvdXJpZXJTZXJpZXNcclxuICAgKiBAcGFyYW0ge0VudW1lcmF0aW9uUHJvcGVydHkuPERvbWFpbj59IGRvbWFpblByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtFbnVtZXJhdGlvblByb3BlcnR5LjxTZXJpZXNUeXBlPn0gc2VyaWVzVHlwZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtFbnVtZXJhdGlvblByb3BlcnR5LjxFcXVhdGlvbkZvcm0+fSBlcXVhdGlvbkZvcm1Qcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZm91cmllclNlcmllcywgZG9tYWluUHJvcGVydHksIHNlcmllc1R5cGVQcm9wZXJ0eSwgZXF1YXRpb25Gb3JtUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZm91cmllclNlcmllcyBpbnN0YW5jZW9mIERpc2NyZXRlRm91cmllclNlcmllcyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZG9tYWluUHJvcGVydHkgaW5zdGFuY2VvZiBFbnVtZXJhdGlvblByb3BlcnR5ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZXJpZXNUeXBlUHJvcGVydHkgaW5zdGFuY2VvZiBFbnVtZXJhdGlvblByb3BlcnR5ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlcXVhdGlvbkZvcm1Qcm9wZXJ0eSBpbnN0YW5jZW9mIEVudW1lcmF0aW9uUHJvcGVydHkgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIERpYWxvZyBvcHRpb25zXHJcbiAgICAgIHhTcGFjaW5nOiAzMCxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWVcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy50aXRsZSwgJ0V4cGFuZGVkRm9ybURpYWxvZyBzZXRzIGNoaWxkcmVuJyApO1xyXG4gICAgb3B0aW9ucy50aXRsZSA9IG5ldyBUZXh0KCBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLmV4cGFuZGVkRm9ybVN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IEZNV0NvbnN0YW50cy5ESUFMT0dfVElUTEVfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IE1BWF9XSURUSFxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHN1bUVxdWF0aW9uTm9kZSA9IG5ldyBEaXNjcmV0ZVN1bUVxdWF0aW9uTm9kZSggZm91cmllclNlcmllcy5udW1iZXJPZkhhcm1vbmljc1Byb3BlcnR5LCBkb21haW5Qcm9wZXJ0eSxcclxuICAgICAgc2VyaWVzVHlwZVByb3BlcnR5LCBlcXVhdGlvbkZvcm1Qcm9wZXJ0eSwge1xyXG4gICAgICAgIGZvbnQ6IEZNV0NvbnN0YW50cy5FUVVBVElPTl9GT05UXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBGKC4uLikgPVxyXG4gICAgLy8gVGhlcmUncyBhIGJpdCBvZiBDU1MgY2xldmVybmVzcyBoZXJlIHRoYXQncyB3b3J0aCBleHBsYWluaW5nLiBXaXRob3V0IHJlc29ydGluZyB0byB1c2luZyBtdWx0aXBsZSBOb2RlcyBoZXJlXHJcbiAgICAvLyBhbmQgaW4gRGlzY3JldGVTdW1FcXVhdGlvbk5vZGUsIHdlIGRvbid0IHdhbnQgdG8gc2VlIHRoZSAnRiguLiknIHBvcnRpb24gb2YgdGhpcyBtYXJrdXAuIEJ1dCB3ZSBuZWVkIGl0IHRvIGJlIHByZXNlbnRcclxuICAgIC8vIGluIG9yZGVyIGZvciB0aGUgJz0nIHRvIGFsaWduIHdpdGggJ0YoLi4uKSA9JyB0aGF0J3MgYXQgdGhlIGJlZ2lubmluZyBvZiBzdW1FcXVhdGlvbk5vZGUuIFNvIHdlJ3JlIGhpZGluZyB0aGVcclxuICAgIC8vICdGKC4uLiknIGJpdCB1c2luZyAnY29sb3I6IHRyYW5zcGFyZW50Jy5cclxuICAgIGNvbnN0IGZ1bmN0aW9uRXF1YWxUb05vZGUgPSBuZXcgUmljaFRleHQoICcnLCB7XHJcbiAgICAgIGZvbnQ6IEZNV0NvbnN0YW50cy5FUVVBVElPTl9GT05UXHJcbiAgICB9ICk7XHJcbiAgICBkb21haW5Qcm9wZXJ0eS5saW5rKCBkb21haW4gPT4ge1xyXG4gICAgICBmdW5jdGlvbkVxdWFsVG9Ob2RlLnN0cmluZyA9IGA8c3BhbiBzdHlsZT0nY29sb3I6IHRyYW5zcGFyZW50Jz4ke0VxdWF0aW9uTWFya3VwLmdldEZ1bmN0aW9uT2ZNYXJrdXAoIGRvbWFpbiApfTwvc3Bhbj4gJHtNYXRoU3ltYm9scy5FUVVBTF9UT31gO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGV4cGFuZGVkU3VtTm9kZSA9IG5ldyBSaWNoVGV4dCggJycsIHtcclxuICAgICAgZm9udDogRk1XQ29uc3RhbnRzLkVRVUFUSU9OX0ZPTlQsXHJcbiAgICAgIGxlYWRpbmc6IDExXHJcbiAgICB9ICk7XHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICBbIGZvdXJpZXJTZXJpZXMubnVtYmVyT2ZIYXJtb25pY3NQcm9wZXJ0eSwgZm91cmllclNlcmllcy5hbXBsaXR1ZGVzUHJvcGVydHksIGRvbWFpblByb3BlcnR5LCBzZXJpZXNUeXBlUHJvcGVydHksIGVxdWF0aW9uRm9ybVByb3BlcnR5IF0sXHJcbiAgICAgICggbnVtYmVyT2ZIYXJtb25pY3MsIGFtcGxpdHVkZXMsIGRvbWFpbiwgc2VyaWVzVHlwZSwgZXF1YXRpb25Gb3JtICkgPT4ge1xyXG4gICAgICAgIGxldCBleHBhbmRlZFN1bU1hcmt1cCA9ICcnO1xyXG4gICAgICAgIGZvciAoIGxldCBvcmRlciA9IDE7IG9yZGVyIDw9IG51bWJlck9mSGFybW9uaWNzOyBvcmRlcisrICkge1xyXG5cclxuICAgICAgICAgIC8vIExpbWl0IG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcywgYW5kIGRyb3AgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZvdXJpZXItbWFraW5nLXdhdmVzL2lzc3Vlcy8yMFxyXG4gICAgICAgICAgY29uc3QgYW1wbGl0dWRlID0gVXRpbHMudG9GaXhlZE51bWJlciggYW1wbGl0dWRlc1sgb3JkZXIgLSAxIF0sIEZNV0NvbnN0YW50cy5ESVNDUkVURV9BTVBMSVRVREVfREVDSU1BTF9QTEFDRVMgKTtcclxuXHJcbiAgICAgICAgICBleHBhbmRlZFN1bU1hcmt1cCArPSBFcXVhdGlvbk1hcmt1cC5nZXRTcGVjaWZpY0Zvcm1NYXJrdXAoIGRvbWFpbiwgc2VyaWVzVHlwZSwgZXF1YXRpb25Gb3JtLCBvcmRlciwgYW1wbGl0dWRlICk7XHJcbiAgICAgICAgICBpZiAoIG9yZGVyIDwgbnVtYmVyT2ZIYXJtb25pY3MgKSB7XHJcbiAgICAgICAgICAgIGV4cGFuZGVkU3VtTWFya3VwICs9IGAgJHtNYXRoU3ltYm9scy5QTFVTfSBgO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKCBvcmRlciAlIFRFUk1TX1BFUl9MSU5FID09PSAwICkge1xyXG4gICAgICAgICAgICBleHBhbmRlZFN1bU1hcmt1cCArPSAnPGJyPic7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGV4cGFuZGVkU3VtTm9kZS5zdHJpbmcgPSBleHBhbmRlZFN1bU1hcmt1cDtcclxuICAgICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGV4cGFuZGVkU3VtSEJveCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDQsXHJcbiAgICAgIGFsaWduOiAnb3JpZ2luJyxcclxuICAgICAgY2hpbGRyZW46IFsgZnVuY3Rpb25FcXVhbFRvTm9kZSwgZXhwYW5kZWRTdW1Ob2RlIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IFZCb3goIHtcclxuICAgICAgc3BhY2luZzogOCxcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgY2hpbGRyZW46IFsgc3VtRXF1YXRpb25Ob2RlLCBleHBhbmRlZFN1bUhCb3ggXSxcclxuICAgICAgbWF4V2lkdGg6IE1BWF9XSURUSFxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBjb250ZW50LCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuZm91cmllck1ha2luZ1dhdmVzLnJlZ2lzdGVyKCAnRXhwYW5kZWRGb3JtRGlhbG9nJywgRXhwYW5kZWRGb3JtRGlhbG9nICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxtQkFBbUIsTUFBTSw0Q0FBNEM7QUFDNUUsT0FBT0MsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxTQUFTQyxJQUFJLEVBQUVDLFFBQVEsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzlFLE9BQU9DLE1BQU0sTUFBTSw4QkFBOEI7QUFDakQsT0FBT0MsWUFBWSxNQUFNLDhCQUE4QjtBQUN2RCxPQUFPQyxjQUFjLE1BQU0scUNBQXFDO0FBQ2hFLE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyx5QkFBeUIsTUFBTSxvQ0FBb0M7QUFDMUUsT0FBT0MscUJBQXFCLE1BQU0sbUNBQW1DO0FBQ3JFLE9BQU9DLHVCQUF1QixNQUFNLDhCQUE4Qjs7QUFFbEU7QUFDQSxNQUFNQyxjQUFjLEdBQUcsQ0FBQztBQUN4QixNQUFNQyxTQUFTLEdBQUcsR0FBRyxDQUFDLENBQUM7O0FBRXZCLGVBQWUsTUFBTUMsa0JBQWtCLFNBQVNULE1BQU0sQ0FBQztFQUVyRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFVSxXQUFXQSxDQUFFQyxhQUFhLEVBQUVDLGNBQWMsRUFBRUMs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