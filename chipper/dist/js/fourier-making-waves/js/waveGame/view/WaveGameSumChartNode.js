// Copyright 2021-2023, University of Colorado Boulder

/**
 * WaveGameSumChartNode is the view for the 'Sum' chart in the 'Wave Game' screen. Rendering of the sum for the
 * challenge answer is delegated to SumChartNode, which is capable of rendering the sum for one Fourier series.
 * This class is responsible for rendering the sum for the challenge guess, the amplitudes entered by the user.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import CanvasLinePlot from '../../../../bamboo/js/CanvasLinePlot.js';
import merge from '../../../../phet-core/js/merge.js';
import FMWColors from '../../common/FMWColors.js';
import SumChartNode from '../../common/view/SumChartNode.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import WaveGameSumChart from '../model/WaveGameSumChart.js';
export default class WaveGameSumChartNode extends SumChartNode {
  /**
   * @param {WaveGameSumChart} sumChart
   * @param {Object} [options]
   */
  constructor(sumChart, options) {
    assert && assert(sumChart instanceof WaveGameSumChart);
    options = merge({
      // SumChartNode options
      sumPlotStrokeProperty: FMWColors.answerSumPlotStrokeProperty,
      sumPlotLineWidth: 3
    }, options);
    super(sumChart, options);

    // Plot that shows the sum for the answer
    const guessPlot = new CanvasLinePlot(this.chartTransform, [], {
      stroke: FMWColors.guessSumPlotStrokeProperty.value,
      // Slight narrower lineWidth than the answer, so that we can see the answer behind the guess when there's
      // and exact match. But now so much narrower that it looks like the guess is a match when it's just "close".
      // See https://github.com/phetsims/fourier-making-waves/issues/97
      lineWidth: options.sumPlotLineWidth - 1
    });

    // CanvasLinePlot does not allow stroke to be a Property, so we have to manage changes ourselves.
    FMWColors.guessSumPlotStrokeProperty.lazyLink(stroke => {
      guessPlot.setStroke(stroke);
      this.chartCanvasNode.update();
    });
    this.chartCanvasNode.setPainters([this.sumPlot, guessPlot]);

    // Keep the guess plot synchronized with the model.
    sumChart.guessDataSetProperty.link(dataSet => {
      guessPlot.setDataSet(dataSet);
      this.chartCanvasNode.update();
    });

    // Hide the guess plot when the sum is zero (all amplitudes are zero)
    sumChart.guessSeries.amplitudesProperty.link(amplitudes => {
      guessPlot.visible = _.some(amplitudes, amplitude => amplitude !== 0);
    });
  }
}
fourierMakingWaves.register('WaveGameSumChartNode', WaveGameSumChartNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDYW52YXNMaW5lUGxvdCIsIm1lcmdlIiwiRk1XQ29sb3JzIiwiU3VtQ2hhcnROb2RlIiwiZm91cmllck1ha2luZ1dhdmVzIiwiV2F2ZUdhbWVTdW1DaGFydCIsIldhdmVHYW1lU3VtQ2hhcnROb2RlIiwiY29uc3RydWN0b3IiLCJzdW1DaGFydCIsIm9wdGlvbnMiLCJhc3NlcnQiLCJzdW1QbG90U3Ryb2tlUHJvcGVydHkiLCJhbnN3ZXJTdW1QbG90U3Ryb2tlUHJvcGVydHkiLCJzdW1QbG90TGluZVdpZHRoIiwiZ3Vlc3NQbG90IiwiY2hhcnRUcmFuc2Zvcm0iLCJzdHJva2UiLCJndWVzc1N1bVBsb3RTdHJva2VQcm9wZXJ0eSIsInZhbHVlIiwibGluZVdpZHRoIiwibGF6eUxpbmsiLCJzZXRTdHJva2UiLCJjaGFydENhbnZhc05vZGUiLCJ1cGRhdGUiLCJzZXRQYWludGVycyIsInN1bVBsb3QiLCJndWVzc0RhdGFTZXRQcm9wZXJ0eSIsImxpbmsiLCJkYXRhU2V0Iiwic2V0RGF0YVNldCIsImd1ZXNzU2VyaWVzIiwiYW1wbGl0dWRlc1Byb3BlcnR5IiwiYW1wbGl0dWRlcyIsInZpc2libGUiLCJfIiwic29tZSIsImFtcGxpdHVkZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2F2ZUdhbWVTdW1DaGFydE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogV2F2ZUdhbWVTdW1DaGFydE5vZGUgaXMgdGhlIHZpZXcgZm9yIHRoZSAnU3VtJyBjaGFydCBpbiB0aGUgJ1dhdmUgR2FtZScgc2NyZWVuLiBSZW5kZXJpbmcgb2YgdGhlIHN1bSBmb3IgdGhlXHJcbiAqIGNoYWxsZW5nZSBhbnN3ZXIgaXMgZGVsZWdhdGVkIHRvIFN1bUNoYXJ0Tm9kZSwgd2hpY2ggaXMgY2FwYWJsZSBvZiByZW5kZXJpbmcgdGhlIHN1bSBmb3Igb25lIEZvdXJpZXIgc2VyaWVzLlxyXG4gKiBUaGlzIGNsYXNzIGlzIHJlc3BvbnNpYmxlIGZvciByZW5kZXJpbmcgdGhlIHN1bSBmb3IgdGhlIGNoYWxsZW5nZSBndWVzcywgdGhlIGFtcGxpdHVkZXMgZW50ZXJlZCBieSB0aGUgdXNlci5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQ2FudmFzTGluZVBsb3QgZnJvbSAnLi4vLi4vLi4vLi4vYmFtYm9vL2pzL0NhbnZhc0xpbmVQbG90LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBGTVdDb2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL0ZNV0NvbG9ycy5qcyc7XHJcbmltcG9ydCBTdW1DaGFydE5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU3VtQ2hhcnROb2RlLmpzJztcclxuaW1wb3J0IGZvdXJpZXJNYWtpbmdXYXZlcyBmcm9tICcuLi8uLi9mb3VyaWVyTWFraW5nV2F2ZXMuanMnO1xyXG5pbXBvcnQgV2F2ZUdhbWVTdW1DaGFydCBmcm9tICcuLi9tb2RlbC9XYXZlR2FtZVN1bUNoYXJ0LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdhdmVHYW1lU3VtQ2hhcnROb2RlIGV4dGVuZHMgU3VtQ2hhcnROb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtXYXZlR2FtZVN1bUNoYXJ0fSBzdW1DaGFydFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc3VtQ2hhcnQsIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzdW1DaGFydCBpbnN0YW5jZW9mIFdhdmVHYW1lU3VtQ2hhcnQgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIFN1bUNoYXJ0Tm9kZSBvcHRpb25zXHJcbiAgICAgIHN1bVBsb3RTdHJva2VQcm9wZXJ0eTogRk1XQ29sb3JzLmFuc3dlclN1bVBsb3RTdHJva2VQcm9wZXJ0eSxcclxuICAgICAgc3VtUGxvdExpbmVXaWR0aDogM1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBzdW1DaGFydCwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFBsb3QgdGhhdCBzaG93cyB0aGUgc3VtIGZvciB0aGUgYW5zd2VyXHJcbiAgICBjb25zdCBndWVzc1Bsb3QgPSBuZXcgQ2FudmFzTGluZVBsb3QoIHRoaXMuY2hhcnRUcmFuc2Zvcm0sIFtdLCB7XHJcbiAgICAgIHN0cm9rZTogRk1XQ29sb3JzLmd1ZXNzU3VtUGxvdFN0cm9rZVByb3BlcnR5LnZhbHVlLFxyXG5cclxuICAgICAgLy8gU2xpZ2h0IG5hcnJvd2VyIGxpbmVXaWR0aCB0aGFuIHRoZSBhbnN3ZXIsIHNvIHRoYXQgd2UgY2FuIHNlZSB0aGUgYW5zd2VyIGJlaGluZCB0aGUgZ3Vlc3Mgd2hlbiB0aGVyZSdzXHJcbiAgICAgIC8vIGFuZCBleGFjdCBtYXRjaC4gQnV0IG5vdyBzbyBtdWNoIG5hcnJvd2VyIHRoYXQgaXQgbG9va3MgbGlrZSB0aGUgZ3Vlc3MgaXMgYSBtYXRjaCB3aGVuIGl0J3MganVzdCBcImNsb3NlXCIuXHJcbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZm91cmllci1tYWtpbmctd2F2ZXMvaXNzdWVzLzk3XHJcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5zdW1QbG90TGluZVdpZHRoIC0gMVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENhbnZhc0xpbmVQbG90IGRvZXMgbm90IGFsbG93IHN0cm9rZSB0byBiZSBhIFByb3BlcnR5LCBzbyB3ZSBoYXZlIHRvIG1hbmFnZSBjaGFuZ2VzIG91cnNlbHZlcy5cclxuICAgIEZNV0NvbG9ycy5ndWVzc1N1bVBsb3RTdHJva2VQcm9wZXJ0eS5sYXp5TGluayggc3Ryb2tlID0+IHtcclxuICAgICAgZ3Vlc3NQbG90LnNldFN0cm9rZSggc3Ryb2tlICk7XHJcbiAgICAgIHRoaXMuY2hhcnRDYW52YXNOb2RlLnVwZGF0ZSgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY2hhcnRDYW52YXNOb2RlLnNldFBhaW50ZXJzKCBbIHRoaXMuc3VtUGxvdCwgZ3Vlc3NQbG90IF0gKTtcclxuXHJcbiAgICAvLyBLZWVwIHRoZSBndWVzcyBwbG90IHN5bmNocm9uaXplZCB3aXRoIHRoZSBtb2RlbC5cclxuICAgIHN1bUNoYXJ0Lmd1ZXNzRGF0YVNldFByb3BlcnR5LmxpbmsoIGRhdGFTZXQgPT4ge1xyXG4gICAgICBndWVzc1Bsb3Quc2V0RGF0YVNldCggZGF0YVNldCApO1xyXG4gICAgICB0aGlzLmNoYXJ0Q2FudmFzTm9kZS51cGRhdGUoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBIaWRlIHRoZSBndWVzcyBwbG90IHdoZW4gdGhlIHN1bSBpcyB6ZXJvIChhbGwgYW1wbGl0dWRlcyBhcmUgemVybylcclxuICAgIHN1bUNoYXJ0Lmd1ZXNzU2VyaWVzLmFtcGxpdHVkZXNQcm9wZXJ0eS5saW5rKCBhbXBsaXR1ZGVzID0+IHtcclxuICAgICAgZ3Vlc3NQbG90LnZpc2libGUgPSBfLnNvbWUoIGFtcGxpdHVkZXMsIGFtcGxpdHVkZSA9PiBhbXBsaXR1ZGUgIT09IDAgKTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmZvdXJpZXJNYWtpbmdXYXZlcy5yZWdpc3RlciggJ1dhdmVHYW1lU3VtQ2hhcnROb2RlJywgV2F2ZUdhbWVTdW1DaGFydE5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSx5Q0FBeUM7QUFDcEUsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxTQUFTLE1BQU0sMkJBQTJCO0FBQ2pELE9BQU9DLFlBQVksTUFBTSxtQ0FBbUM7QUFDNUQsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLGdCQUFnQixNQUFNLDhCQUE4QjtBQUUzRCxlQUFlLE1BQU1DLG9CQUFvQixTQUFTSCxZQUFZLENBQUM7RUFFN0Q7QUFDRjtBQUNBO0FBQ0E7RUFDRUksV0FBV0EsQ0FBRUMsUUFBUSxFQUFFQyxPQUFPLEVBQUc7SUFDL0JDLE1BQU0sSUFBSUEsTUFBTSxDQUFFRixRQUFRLFlBQVlILGdCQUFpQixDQUFDO0lBRXhESSxPQUFPLEdBQUdSLEtBQUssQ0FBRTtNQUVmO01BQ0FVLHFCQUFxQixFQUFFVCxTQUFTLENBQUNVLDJCQUEyQjtNQUM1REMsZ0JBQWdCLEVBQUU7SUFDcEIsQ0FBQyxFQUFFSixPQUFRLENBQUM7SUFFWixLQUFLLENBQUVELFFBQVEsRUFBRUMsT0FBUSxDQUFDOztJQUUxQjtJQUNBLE1BQU1LLFNBQVMsR0FBRyxJQUFJZCxjQUFjLENBQUUsSUFBSSxDQUFDZSxjQUFjLEVBQUUsRUFBRSxFQUFFO01BQzdEQyxNQUFNLEVBQUVkLFNBQVMsQ0FBQ2UsMEJBQTBCLENBQUNDLEtBQUs7TUFFbEQ7TUFDQTtNQUNBO01BQ0FDLFNBQVMsRUFBRVYsT0FBTyxDQUFDSSxnQkFBZ0IsR0FBRztJQUN4QyxDQUFFLENBQUM7O0lBRUg7SUFDQVgsU0FBUyxDQUFDZSwwQkFBMEIsQ0FBQ0csUUFBUSxDQUFFSixNQUFNLElBQUk7TUFDdkRGLFNBQVMsQ0FBQ08sU0FBUyxDQUFFTCxNQUFPLENBQUM7TUFDN0IsSUFBSSxDQUFDTSxlQUFlLENBQUNDLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0QsZUFBZSxDQUFDRSxXQUFXLENBQUUsQ0FBRSxJQUFJLENBQUNDLE9BQU8sRUFBRVgsU0FBUyxDQUFHLENBQUM7O0lBRS9EO0lBQ0FOLFFBQVEsQ0FBQ2tCLG9CQUFvQixDQUFDQyxJQUFJLENBQUVDLE9BQU8sSUFBSTtNQUM3Q2QsU0FBUyxDQUFDZSxVQUFVLENBQUVELE9BQVEsQ0FBQztNQUMvQixJQUFJLENBQUNOLGVBQWUsQ0FBQ0MsTUFBTSxDQUFDLENBQUM7SUFDL0IsQ0FBRSxDQUFDOztJQUVIO0lBQ0FmLFFBQVEsQ0FBQ3NCLFdBQVcsQ0FBQ0Msa0JBQWtCLENBQUNKLElBQUksQ0FBRUssVUFBVSxJQUFJO01BQzFEbEIsU0FBUyxDQUFDbUIsT0FBTyxHQUFHQyxDQUFDLENBQUNDLElBQUksQ0FBRUgsVUFBVSxFQUFFSSxTQUFTLElBQUlBLFNBQVMsS0FBSyxDQUFFLENBQUM7SUFDeEUsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBaEMsa0JBQWtCLENBQUNpQyxRQUFRLENBQUUsc0JBQXNCLEVBQUUvQixvQkFBcUIsQ0FBQyJ9