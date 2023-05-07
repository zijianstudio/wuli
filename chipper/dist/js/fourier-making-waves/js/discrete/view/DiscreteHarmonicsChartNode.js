// Copyright 2021-2023, University of Colorado Boulder

/**
 * DiscreteHarmonicsChartNode displays the 'Harmonics' chart in the 'Discrete' screen. It extends HarmonicsChartNode
 * by handling the view responsibilities for things that were added to DiscreteHarmonicsChart.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import merge from '../../../../phet-core/js/merge.js';
import HarmonicsChartNode from '../../common/view/HarmonicsChartNode.js';
import TickLabelUtils from '../../common/view/TickLabelUtils.js';
import ZoomLevelProperty from '../../common/view/ZoomLevelProperty.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import DiscreteHarmonicsChart from '../model/DiscreteHarmonicsChart.js';

// constants
const X_TICK_LABEL_DECIMALS = 2;
const Y_TICK_LABEL_DECIMALS = 1;
export default class DiscreteHarmonicsChartNode extends HarmonicsChartNode {
  /**
   * @param {DiscreteHarmonicsChart} harmonicsChart
   * @param {Object} [options]
   */
  constructor(harmonicsChart, options) {
    assert && assert(harmonicsChart instanceof DiscreteHarmonicsChart);
    assert && assert(options && options.tandem);
    options = merge({
      // DomainChartNode options
      xZoomLevelProperty: new ZoomLevelProperty(harmonicsChart.xAxisDescriptionProperty, options.tandem.createTandem('xZoomLevelProperty')),
      xTickLabelSetOptions: {
        createLabel: value => TickLabelUtils.createTickLabelForDomain(value, X_TICK_LABEL_DECIMALS, harmonicsChart.xAxisTickLabelFormatProperty.value, harmonicsChart.domainProperty.value, harmonicsChart.fourierSeries.L, harmonicsChart.fourierSeries.T)
      },
      yTickLabelSetOptions: {
        createLabel: value => TickLabelUtils.createNumericTickLabel(value, Y_TICK_LABEL_DECIMALS)
      }
    }, options);
    super(harmonicsChart, options);

    // Interrupt interaction when visibility changes.
    this.visibleProperty.link(() => this.interruptSubtreeInput());

    // x-axis tick labels are specific to Domain and format (numeric vs symbolic).
    // This causes options.xTickLabelSetOptions.createLabels to be called.
    Multilink.multilink([harmonicsChart.domainProperty, harmonicsChart.xAxisTickLabelFormatProperty], () => this.xTickLabels.invalidateTickLabelSet());
  }
}
fourierMakingWaves.register('DiscreteHarmonicsChartNode', DiscreteHarmonicsChartNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJtZXJnZSIsIkhhcm1vbmljc0NoYXJ0Tm9kZSIsIlRpY2tMYWJlbFV0aWxzIiwiWm9vbUxldmVsUHJvcGVydHkiLCJmb3VyaWVyTWFraW5nV2F2ZXMiLCJEaXNjcmV0ZUhhcm1vbmljc0NoYXJ0IiwiWF9USUNLX0xBQkVMX0RFQ0lNQUxTIiwiWV9USUNLX0xBQkVMX0RFQ0lNQUxTIiwiRGlzY3JldGVIYXJtb25pY3NDaGFydE5vZGUiLCJjb25zdHJ1Y3RvciIsImhhcm1vbmljc0NoYXJ0Iiwib3B0aW9ucyIsImFzc2VydCIsInRhbmRlbSIsInhab29tTGV2ZWxQcm9wZXJ0eSIsInhBeGlzRGVzY3JpcHRpb25Qcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsInhUaWNrTGFiZWxTZXRPcHRpb25zIiwiY3JlYXRlTGFiZWwiLCJ2YWx1ZSIsImNyZWF0ZVRpY2tMYWJlbEZvckRvbWFpbiIsInhBeGlzVGlja0xhYmVsRm9ybWF0UHJvcGVydHkiLCJkb21haW5Qcm9wZXJ0eSIsImZvdXJpZXJTZXJpZXMiLCJMIiwiVCIsInlUaWNrTGFiZWxTZXRPcHRpb25zIiwiY3JlYXRlTnVtZXJpY1RpY2tMYWJlbCIsInZpc2libGVQcm9wZXJ0eSIsImxpbmsiLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJtdWx0aWxpbmsiLCJ4VGlja0xhYmVscyIsImludmFsaWRhdGVUaWNrTGFiZWxTZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkRpc2NyZXRlSGFybW9uaWNzQ2hhcnROb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERpc2NyZXRlSGFybW9uaWNzQ2hhcnROb2RlIGRpc3BsYXlzIHRoZSAnSGFybW9uaWNzJyBjaGFydCBpbiB0aGUgJ0Rpc2NyZXRlJyBzY3JlZW4uIEl0IGV4dGVuZHMgSGFybW9uaWNzQ2hhcnROb2RlXHJcbiAqIGJ5IGhhbmRsaW5nIHRoZSB2aWV3IHJlc3BvbnNpYmlsaXRpZXMgZm9yIHRoaW5ncyB0aGF0IHdlcmUgYWRkZWQgdG8gRGlzY3JldGVIYXJtb25pY3NDaGFydC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBIYXJtb25pY3NDaGFydE5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvSGFybW9uaWNzQ2hhcnROb2RlLmpzJztcclxuaW1wb3J0IFRpY2tMYWJlbFV0aWxzIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1RpY2tMYWJlbFV0aWxzLmpzJztcclxuaW1wb3J0IFpvb21MZXZlbFByb3BlcnR5IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1pvb21MZXZlbFByb3BlcnR5LmpzJztcclxuaW1wb3J0IGZvdXJpZXJNYWtpbmdXYXZlcyBmcm9tICcuLi8uLi9mb3VyaWVyTWFraW5nV2F2ZXMuanMnO1xyXG5pbXBvcnQgRGlzY3JldGVIYXJtb25pY3NDaGFydCBmcm9tICcuLi9tb2RlbC9EaXNjcmV0ZUhhcm1vbmljc0NoYXJ0LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBYX1RJQ0tfTEFCRUxfREVDSU1BTFMgPSAyO1xyXG5jb25zdCBZX1RJQ0tfTEFCRUxfREVDSU1BTFMgPSAxO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlzY3JldGVIYXJtb25pY3NDaGFydE5vZGUgZXh0ZW5kcyBIYXJtb25pY3NDaGFydE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0Rpc2NyZXRlSGFybW9uaWNzQ2hhcnR9IGhhcm1vbmljc0NoYXJ0XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBoYXJtb25pY3NDaGFydCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBoYXJtb25pY3NDaGFydCBpbnN0YW5jZW9mIERpc2NyZXRlSGFybW9uaWNzQ2hhcnQgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMgJiYgb3B0aW9ucy50YW5kZW0gKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIERvbWFpbkNoYXJ0Tm9kZSBvcHRpb25zXHJcbiAgICAgIHhab29tTGV2ZWxQcm9wZXJ0eTogbmV3IFpvb21MZXZlbFByb3BlcnR5KCBoYXJtb25pY3NDaGFydC54QXhpc0Rlc2NyaXB0aW9uUHJvcGVydHksIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3hab29tTGV2ZWxQcm9wZXJ0eScgKSApLFxyXG4gICAgICB4VGlja0xhYmVsU2V0T3B0aW9uczoge1xyXG4gICAgICAgIGNyZWF0ZUxhYmVsOiB2YWx1ZSA9PlxyXG4gICAgICAgICAgVGlja0xhYmVsVXRpbHMuY3JlYXRlVGlja0xhYmVsRm9yRG9tYWluKCB2YWx1ZSwgWF9USUNLX0xBQkVMX0RFQ0lNQUxTLCBoYXJtb25pY3NDaGFydC54QXhpc1RpY2tMYWJlbEZvcm1hdFByb3BlcnR5LnZhbHVlLFxyXG4gICAgICAgICAgICBoYXJtb25pY3NDaGFydC5kb21haW5Qcm9wZXJ0eS52YWx1ZSwgaGFybW9uaWNzQ2hhcnQuZm91cmllclNlcmllcy5MLCBoYXJtb25pY3NDaGFydC5mb3VyaWVyU2VyaWVzLlQgKVxyXG4gICAgICB9LFxyXG4gICAgICB5VGlja0xhYmVsU2V0T3B0aW9uczoge1xyXG4gICAgICAgIGNyZWF0ZUxhYmVsOiB2YWx1ZSA9PiBUaWNrTGFiZWxVdGlscy5jcmVhdGVOdW1lcmljVGlja0xhYmVsKCB2YWx1ZSwgWV9USUNLX0xBQkVMX0RFQ0lNQUxTIClcclxuICAgICAgfVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBoYXJtb25pY3NDaGFydCwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEludGVycnVwdCBpbnRlcmFjdGlvbiB3aGVuIHZpc2liaWxpdHkgY2hhbmdlcy5cclxuICAgIHRoaXMudmlzaWJsZVByb3BlcnR5LmxpbmsoICgpID0+IHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCkgKTtcclxuXHJcbiAgICAvLyB4LWF4aXMgdGljayBsYWJlbHMgYXJlIHNwZWNpZmljIHRvIERvbWFpbiBhbmQgZm9ybWF0IChudW1lcmljIHZzIHN5bWJvbGljKS5cclxuICAgIC8vIFRoaXMgY2F1c2VzIG9wdGlvbnMueFRpY2tMYWJlbFNldE9wdGlvbnMuY3JlYXRlTGFiZWxzIHRvIGJlIGNhbGxlZC5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgaGFybW9uaWNzQ2hhcnQuZG9tYWluUHJvcGVydHksIGhhcm1vbmljc0NoYXJ0LnhBeGlzVGlja0xhYmVsRm9ybWF0UHJvcGVydHkgXSxcclxuICAgICAgKCkgPT4gdGhpcy54VGlja0xhYmVscy5pbnZhbGlkYXRlVGlja0xhYmVsU2V0KClcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5mb3VyaWVyTWFraW5nV2F2ZXMucmVnaXN0ZXIoICdEaXNjcmV0ZUhhcm1vbmljc0NoYXJ0Tm9kZScsIERpc2NyZXRlSGFybW9uaWNzQ2hhcnROb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLGtCQUFrQixNQUFNLHlDQUF5QztBQUN4RSxPQUFPQyxjQUFjLE1BQU0scUNBQXFDO0FBQ2hFLE9BQU9DLGlCQUFpQixNQUFNLHdDQUF3QztBQUN0RSxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0Msc0JBQXNCLE1BQU0sb0NBQW9DOztBQUV2RTtBQUNBLE1BQU1DLHFCQUFxQixHQUFHLENBQUM7QUFDL0IsTUFBTUMscUJBQXFCLEdBQUcsQ0FBQztBQUUvQixlQUFlLE1BQU1DLDBCQUEwQixTQUFTUCxrQkFBa0IsQ0FBQztFQUV6RTtBQUNGO0FBQ0E7QUFDQTtFQUNFUSxXQUFXQSxDQUFFQyxjQUFjLEVBQUVDLE9BQU8sRUFBRztJQUVyQ0MsTUFBTSxJQUFJQSxNQUFNLENBQUVGLGNBQWMsWUFBWUwsc0JBQXVCLENBQUM7SUFDcEVPLE1BQU0sSUFBSUEsTUFBTSxDQUFFRCxPQUFPLElBQUlBLE9BQU8sQ0FBQ0UsTUFBTyxDQUFDO0lBRTdDRixPQUFPLEdBQUdYLEtBQUssQ0FBRTtNQUVmO01BQ0FjLGtCQUFrQixFQUFFLElBQUlYLGlCQUFpQixDQUFFTyxjQUFjLENBQUNLLHdCQUF3QixFQUFFSixPQUFPLENBQUNFLE1BQU0sQ0FBQ0csWUFBWSxDQUFFLG9CQUFxQixDQUFFLENBQUM7TUFDeklDLG9CQUFvQixFQUFFO1FBQ3BCQyxXQUFXLEVBQUVDLEtBQUssSUFDaEJqQixjQUFjLENBQUNrQix3QkFBd0IsQ0FBRUQsS0FBSyxFQUFFYixxQkFBcUIsRUFBRUksY0FBYyxDQUFDVyw0QkFBNEIsQ0FBQ0YsS0FBSyxFQUN0SFQsY0FBYyxDQUFDWSxjQUFjLENBQUNILEtBQUssRUFBRVQsY0FBYyxDQUFDYSxhQUFhLENBQUNDLENBQUMsRUFBRWQsY0FBYyxDQUFDYSxhQUFhLENBQUNFLENBQUU7TUFDMUcsQ0FBQztNQUNEQyxvQkFBb0IsRUFBRTtRQUNwQlIsV0FBVyxFQUFFQyxLQUFLLElBQUlqQixjQUFjLENBQUN5QixzQkFBc0IsQ0FBRVIsS0FBSyxFQUFFWixxQkFBc0I7TUFDNUY7SUFDRixDQUFDLEVBQUVJLE9BQVEsQ0FBQztJQUVaLEtBQUssQ0FBRUQsY0FBYyxFQUFFQyxPQUFRLENBQUM7O0lBRWhDO0lBQ0EsSUFBSSxDQUFDaUIsZUFBZSxDQUFDQyxJQUFJLENBQUUsTUFBTSxJQUFJLENBQUNDLHFCQUFxQixDQUFDLENBQUUsQ0FBQzs7SUFFL0Q7SUFDQTtJQUNBL0IsU0FBUyxDQUFDZ0MsU0FBUyxDQUFFLENBQUVyQixjQUFjLENBQUNZLGNBQWMsRUFBRVosY0FBYyxDQUFDVyw0QkFBNEIsQ0FBRSxFQUNqRyxNQUFNLElBQUksQ0FBQ1csV0FBVyxDQUFDQyxzQkFBc0IsQ0FBQyxDQUNoRCxDQUFDO0VBQ0g7QUFDRjtBQUVBN0Isa0JBQWtCLENBQUM4QixRQUFRLENBQUUsNEJBQTRCLEVBQUUxQiwwQkFBMkIsQ0FBQyJ9