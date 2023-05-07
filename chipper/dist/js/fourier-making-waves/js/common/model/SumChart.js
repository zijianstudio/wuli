// Copyright 2021-2023, University of Colorado Boulder

/**
 * SumChart is the model base class for the 'Sum' chart in the 'Discrete' and 'Wave Game' screens.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Range from '../../../../dot/js/Range.js';
import DiscreteAxisDescriptions from '../../discrete/model/DiscreteAxisDescriptions.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import AxisDescription from './AxisDescription.js';
import DomainChart from './DomainChart.js';
export default class SumChart extends DomainChart {
  // The data set for the sum. Points are ordered by increasing x value.

  // range of the y-axis, fitted to the sum's peak amplitude

  // y-axis description that is the best-fit for yAxisRangeProperty

  constructor(fourierSeries, domainProperty, seriesTypeProperty, tProperty, xAxisDescriptionProperty, tandem) {
    super(domainProperty, xAxisDescriptionProperty, fourierSeries.L, fourierSeries.T, tandem);
    this.fourierSeries = fourierSeries;
    this.sumDataSetProperty = new DerivedProperty([fourierSeries.amplitudesProperty, xAxisDescriptionProperty, domainProperty, seriesTypeProperty, tProperty], (amplitudes, xAxisDescription, domain, seriesType, t) => fourierSeries.createSumDataSet(xAxisDescription, domain, seriesType, t));
    this.yAxisRangeProperty = new DerivedProperty([this.sumDataSetProperty], sumDataSet => {
      const peakPoint = _.maxBy(sumDataSet, point => point.y);
      assert && assert(peakPoint);
      const peakAmplitude = peakPoint.y;

      // no smaller than the max amplitude of one harmonic, with a bit of padding added at top and bottom
      const maxY = Math.max(fourierSeries.amplitudeRange.max, peakAmplitude * 1.05);
      return new Range(-maxY, maxY);
    });
    this.yAxisDescriptionProperty = new DerivedProperty([this.yAxisRangeProperty], yAxisRange => AxisDescription.getBestFit(yAxisRange, DiscreteAxisDescriptions.Y_AXIS_DESCRIPTIONS), {
      validValues: DiscreteAxisDescriptions.Y_AXIS_DESCRIPTIONS
    });
  }
}
fourierMakingWaves.register('SumChart', SumChart);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJSYW5nZSIsIkRpc2NyZXRlQXhpc0Rlc2NyaXB0aW9ucyIsImZvdXJpZXJNYWtpbmdXYXZlcyIsIkF4aXNEZXNjcmlwdGlvbiIsIkRvbWFpbkNoYXJ0IiwiU3VtQ2hhcnQiLCJjb25zdHJ1Y3RvciIsImZvdXJpZXJTZXJpZXMiLCJkb21haW5Qcm9wZXJ0eSIsInNlcmllc1R5cGVQcm9wZXJ0eSIsInRQcm9wZXJ0eSIsInhBeGlzRGVzY3JpcHRpb25Qcm9wZXJ0eSIsInRhbmRlbSIsIkwiLCJUIiwic3VtRGF0YVNldFByb3BlcnR5IiwiYW1wbGl0dWRlc1Byb3BlcnR5IiwiYW1wbGl0dWRlcyIsInhBeGlzRGVzY3JpcHRpb24iLCJkb21haW4iLCJzZXJpZXNUeXBlIiwidCIsImNyZWF0ZVN1bURhdGFTZXQiLCJ5QXhpc1JhbmdlUHJvcGVydHkiLCJzdW1EYXRhU2V0IiwicGVha1BvaW50IiwiXyIsIm1heEJ5IiwicG9pbnQiLCJ5IiwiYXNzZXJ0IiwicGVha0FtcGxpdHVkZSIsIm1heFkiLCJNYXRoIiwibWF4IiwiYW1wbGl0dWRlUmFuZ2UiLCJ5QXhpc0Rlc2NyaXB0aW9uUHJvcGVydHkiLCJ5QXhpc1JhbmdlIiwiZ2V0QmVzdEZpdCIsIllfQVhJU19ERVNDUklQVElPTlMiLCJ2YWxpZFZhbHVlcyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3VtQ2hhcnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU3VtQ2hhcnQgaXMgdGhlIG1vZGVsIGJhc2UgY2xhc3MgZm9yIHRoZSAnU3VtJyBjaGFydCBpbiB0aGUgJ0Rpc2NyZXRlJyBhbmQgJ1dhdmUgR2FtZScgc2NyZWVucy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBEaXNjcmV0ZUF4aXNEZXNjcmlwdGlvbnMgZnJvbSAnLi4vLi4vZGlzY3JldGUvbW9kZWwvRGlzY3JldGVBeGlzRGVzY3JpcHRpb25zLmpzJztcclxuaW1wb3J0IGZvdXJpZXJNYWtpbmdXYXZlcyBmcm9tICcuLi8uLi9mb3VyaWVyTWFraW5nV2F2ZXMuanMnO1xyXG5pbXBvcnQgQXhpc0Rlc2NyaXB0aW9uIGZyb20gJy4vQXhpc0Rlc2NyaXB0aW9uLmpzJztcclxuaW1wb3J0IERvbWFpbkNoYXJ0IGZyb20gJy4vRG9tYWluQ2hhcnQuanMnO1xyXG5pbXBvcnQgRm91cmllclNlcmllcyBmcm9tICcuL0ZvdXJpZXJTZXJpZXMuanMnO1xyXG5pbXBvcnQgRG9tYWluIGZyb20gJy4vRG9tYWluLmpzJztcclxuaW1wb3J0IFNlcmllc1R5cGUgZnJvbSAnLi9TZXJpZXNUeXBlLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN1bUNoYXJ0IGV4dGVuZHMgRG9tYWluQ2hhcnQge1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgZm91cmllclNlcmllczogRm91cmllclNlcmllcztcclxuXHJcbiAgLy8gVGhlIGRhdGEgc2V0IGZvciB0aGUgc3VtLiBQb2ludHMgYXJlIG9yZGVyZWQgYnkgaW5jcmVhc2luZyB4IHZhbHVlLlxyXG4gIHB1YmxpYyByZWFkb25seSBzdW1EYXRhU2V0UHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFZlY3RvcjJbXT47XHJcblxyXG4gIC8vIHJhbmdlIG9mIHRoZSB5LWF4aXMsIGZpdHRlZCB0byB0aGUgc3VtJ3MgcGVhayBhbXBsaXR1ZGVcclxuICBwdWJsaWMgcmVhZG9ubHkgeUF4aXNSYW5nZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxSYW5nZT47XHJcblxyXG4gIC8vIHktYXhpcyBkZXNjcmlwdGlvbiB0aGF0IGlzIHRoZSBiZXN0LWZpdCBmb3IgeUF4aXNSYW5nZVByb3BlcnR5XHJcbiAgcHVibGljIHJlYWRvbmx5IHlBeGlzRGVzY3JpcHRpb25Qcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8QXhpc0Rlc2NyaXB0aW9uPjtcclxuXHJcbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCBmb3VyaWVyU2VyaWVzOiBGb3VyaWVyU2VyaWVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluUHJvcGVydHk6IEVudW1lcmF0aW9uUHJvcGVydHk8RG9tYWluPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHNlcmllc1R5cGVQcm9wZXJ0eTogRW51bWVyYXRpb25Qcm9wZXJ0eTxTZXJpZXNUeXBlPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHhBeGlzRGVzY3JpcHRpb25Qcm9wZXJ0eTogUHJvcGVydHk8QXhpc0Rlc2NyaXB0aW9uPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIHN1cGVyKCBkb21haW5Qcm9wZXJ0eSwgeEF4aXNEZXNjcmlwdGlvblByb3BlcnR5LCBmb3VyaWVyU2VyaWVzLkwsIGZvdXJpZXJTZXJpZXMuVCwgdGFuZGVtICk7XHJcblxyXG4gICAgdGhpcy5mb3VyaWVyU2VyaWVzID0gZm91cmllclNlcmllcztcclxuXHJcbiAgICB0aGlzLnN1bURhdGFTZXRQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgZm91cmllclNlcmllcy5hbXBsaXR1ZGVzUHJvcGVydHksIHhBeGlzRGVzY3JpcHRpb25Qcm9wZXJ0eSwgZG9tYWluUHJvcGVydHksIHNlcmllc1R5cGVQcm9wZXJ0eSwgdFByb3BlcnR5IF0sXHJcbiAgICAgICggYW1wbGl0dWRlcywgeEF4aXNEZXNjcmlwdGlvbiwgZG9tYWluLCBzZXJpZXNUeXBlLCB0ICkgPT5cclxuICAgICAgICBmb3VyaWVyU2VyaWVzLmNyZWF0ZVN1bURhdGFTZXQoIHhBeGlzRGVzY3JpcHRpb24sIGRvbWFpbiwgc2VyaWVzVHlwZSwgdCApXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMueUF4aXNSYW5nZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB0aGlzLnN1bURhdGFTZXRQcm9wZXJ0eSBdLFxyXG4gICAgICBzdW1EYXRhU2V0ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgcGVha1BvaW50ID0gXy5tYXhCeSggc3VtRGF0YVNldCwgcG9pbnQgPT4gcG9pbnQueSApO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHBlYWtQb2ludCApO1xyXG4gICAgICAgIGNvbnN0IHBlYWtBbXBsaXR1ZGUgPSBwZWFrUG9pbnQhLnk7XHJcblxyXG4gICAgICAgIC8vIG5vIHNtYWxsZXIgdGhhbiB0aGUgbWF4IGFtcGxpdHVkZSBvZiBvbmUgaGFybW9uaWMsIHdpdGggYSBiaXQgb2YgcGFkZGluZyBhZGRlZCBhdCB0b3AgYW5kIGJvdHRvbVxyXG4gICAgICAgIGNvbnN0IG1heFkgPSBNYXRoLm1heCggZm91cmllclNlcmllcy5hbXBsaXR1ZGVSYW5nZS5tYXgsIHBlYWtBbXBsaXR1ZGUgKiAxLjA1ICk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBSYW5nZSggLW1heFksIG1heFkgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgIHRoaXMueUF4aXNEZXNjcmlwdGlvblByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB0aGlzLnlBeGlzUmFuZ2VQcm9wZXJ0eSBdLFxyXG4gICAgICB5QXhpc1JhbmdlID0+IEF4aXNEZXNjcmlwdGlvbi5nZXRCZXN0Rml0KCB5QXhpc1JhbmdlLCBEaXNjcmV0ZUF4aXNEZXNjcmlwdGlvbnMuWV9BWElTX0RFU0NSSVBUSU9OUyApLCB7XHJcbiAgICAgICAgdmFsaWRWYWx1ZXM6IERpc2NyZXRlQXhpc0Rlc2NyaXB0aW9ucy5ZX0FYSVNfREVTQ1JJUFRJT05TXHJcbiAgICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmZvdXJpZXJNYWtpbmdXYXZlcy5yZWdpc3RlciggJ1N1bUNoYXJ0JywgU3VtQ2hhcnQgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUlwRSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBRy9DLE9BQU9DLHdCQUF3QixNQUFNLGtEQUFrRDtBQUN2RixPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MsZUFBZSxNQUFNLHNCQUFzQjtBQUNsRCxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBSzFDLGVBQWUsTUFBTUMsUUFBUSxTQUFTRCxXQUFXLENBQUM7RUFJaEQ7O0VBR0E7O0VBR0E7O0VBR1VFLFdBQVdBLENBQUVDLGFBQTRCLEVBQzVCQyxjQUEyQyxFQUMzQ0Msa0JBQW1ELEVBQ25EQyxTQUFvQyxFQUNwQ0Msd0JBQW1ELEVBQ25EQyxNQUFjLEVBQUc7SUFFdEMsS0FBSyxDQUFFSixjQUFjLEVBQUVHLHdCQUF3QixFQUFFSixhQUFhLENBQUNNLENBQUMsRUFBRU4sYUFBYSxDQUFDTyxDQUFDLEVBQUVGLE1BQU8sQ0FBQztJQUUzRixJQUFJLENBQUNMLGFBQWEsR0FBR0EsYUFBYTtJQUVsQyxJQUFJLENBQUNRLGtCQUFrQixHQUFHLElBQUloQixlQUFlLENBQzNDLENBQUVRLGFBQWEsQ0FBQ1Msa0JBQWtCLEVBQUVMLHdCQUF3QixFQUFFSCxjQUFjLEVBQUVDLGtCQUFrQixFQUFFQyxTQUFTLENBQUUsRUFDN0csQ0FBRU8sVUFBVSxFQUFFQyxnQkFBZ0IsRUFBRUMsTUFBTSxFQUFFQyxVQUFVLEVBQUVDLENBQUMsS0FDbkRkLGFBQWEsQ0FBQ2UsZ0JBQWdCLENBQUVKLGdCQUFnQixFQUFFQyxNQUFNLEVBQUVDLFVBQVUsRUFBRUMsQ0FBRSxDQUM1RSxDQUFDO0lBRUQsSUFBSSxDQUFDRSxrQkFBa0IsR0FBRyxJQUFJeEIsZUFBZSxDQUMzQyxDQUFFLElBQUksQ0FBQ2dCLGtCQUFrQixDQUFFLEVBQzNCUyxVQUFVLElBQUk7TUFFWixNQUFNQyxTQUFTLEdBQUdDLENBQUMsQ0FBQ0MsS0FBSyxDQUFFSCxVQUFVLEVBQUVJLEtBQUssSUFBSUEsS0FBSyxDQUFDQyxDQUFFLENBQUM7TUFDekRDLE1BQU0sSUFBSUEsTUFBTSxDQUFFTCxTQUFVLENBQUM7TUFDN0IsTUFBTU0sYUFBYSxHQUFHTixTQUFTLENBQUVJLENBQUM7O01BRWxDO01BQ0EsTUFBTUcsSUFBSSxHQUFHQyxJQUFJLENBQUNDLEdBQUcsQ0FBRTNCLGFBQWEsQ0FBQzRCLGNBQWMsQ0FBQ0QsR0FBRyxFQUFFSCxhQUFhLEdBQUcsSUFBSyxDQUFDO01BQy9FLE9BQU8sSUFBSS9CLEtBQUssQ0FBRSxDQUFDZ0MsSUFBSSxFQUFFQSxJQUFLLENBQUM7SUFDakMsQ0FBRSxDQUFDO0lBRUwsSUFBSSxDQUFDSSx3QkFBd0IsR0FBRyxJQUFJckMsZUFBZSxDQUNqRCxDQUFFLElBQUksQ0FBQ3dCLGtCQUFrQixDQUFFLEVBQzNCYyxVQUFVLElBQUlsQyxlQUFlLENBQUNtQyxVQUFVLENBQUVELFVBQVUsRUFBRXBDLHdCQUF3QixDQUFDc0MsbUJBQW9CLENBQUMsRUFBRTtNQUNwR0MsV0FBVyxFQUFFdkMsd0JBQXdCLENBQUNzQztJQUN4QyxDQUFFLENBQUM7RUFDUDtBQUNGO0FBRUFyQyxrQkFBa0IsQ0FBQ3VDLFFBQVEsQ0FBRSxVQUFVLEVBQUVwQyxRQUFTLENBQUMifQ==