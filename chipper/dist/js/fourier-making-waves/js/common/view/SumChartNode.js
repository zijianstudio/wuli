// Copyright 2020-2023, University of Colorado Boulder

/**
 * SumChartNode is the view base class for the 'Sum' chart in the 'Discrete' and 'Wave Game' screens.
 * It creates and manages the plot for the sum of harmonics in a Fourier series.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import CanvasLinePlot from '../../../../bamboo/js/CanvasLinePlot.js';
import ChartCanvasNode from '../../../../bamboo/js/ChartCanvasNode.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import FMWColors from '../FMWColors.js';
import SumChart from '../model/SumChart.js';
import DomainChartNode from './DomainChartNode.js';
export default class SumChartNode extends DomainChartNode {
  /**
   * @param {SumChart} sumChart
   * @param {Object} [options]
   */
  constructor(sumChart, options) {
    assert && assert(sumChart instanceof SumChart);

    // Fields of interest in sumChart, to improve readability
    const amplitudesProperty = sumChart.fourierSeries.amplitudesProperty;
    const sumDataSetProperty = sumChart.sumDataSetProperty;
    const yAxisRangeProperty = sumChart.yAxisRangeProperty;
    const yAxisDescriptionProperty = sumChart.yAxisDescriptionProperty;
    options = merge({
      // This would be a logical place to use nested sumPlotOptions. But CanvasLinePlot does not support Property for
      // stroke, so the only thing nestable is lineWidth.  That doesn't seem like a big win, so I chose to use flat
      // options.
      sumPlotStrokeProperty: FMWColors.sumPlotStrokeProperty,
      sumPlotLineWidth: 1,
      // FMWChartNode options
      chartTransformOptions: {
        // modelXRange is handled by superclass DomainChartNode
        modelYRange: yAxisDescriptionProperty.value.range
      }
    }, options);
    super(sumChart, options);

    // Plot that shows the sum
    const sumPlot = new CanvasLinePlot(this.chartTransform, sumDataSetProperty.value, {
      stroke: options.sumPlotStrokeProperty.value,
      lineWidth: options.sumPlotLineWidth
    });

    // Draw the sum plot using Canvas, clipped to chartRectangle.
    const chartCanvasNode = new ChartCanvasNode(this.chartTransform, [sumPlot], {
      clipArea: Shape.bounds(this.chartRectangle.bounds)
    });
    this.addChild(chartCanvasNode);

    // CanvasLinePlot does not allow stroke to be a Property, so we have to manage changes ourselves.
    options.sumPlotStrokeProperty.lazyLink(stroke => {
      sumPlot.setStroke(stroke);
      chartCanvasNode.update();
    });

    // Display the data set.
    sumDataSetProperty.lazyLink(dataSet => {
      sumPlot.setDataSet(dataSet);
      chartCanvasNode.update();
    });

    // Hide the plot when the sum is zero (all amplitudes are zero)
    amplitudesProperty.link(amplitudes => {
      sumPlot.visible = _.some(amplitudes, amplitude => amplitude !== 0);
    });

    // Update the y-axis range.
    yAxisRangeProperty.link(range => this.chartTransform.setModelYRange(range));

    // Update the y-axis decorations.
    yAxisDescriptionProperty.link(yAxisDescription => {
      // NOTE: this.chartTransform.setModelYRange is handled via yAxisRangeProperty listener, above.
      this.yGridLines.setSpacing(yAxisDescription.gridLineSpacing);
      this.yTickMarks.setSpacing(yAxisDescription.tickMarkSpacing);
      this.yTickLabels.setSpacing(yAxisDescription.tickLabelSpacing);
    });

    // @protected
    this.chartCanvasNode = chartCanvasNode; // {ChartCanvasNode}
    this.sumPlot = sumPlot; // {CanvasLinePlot}
  }
}

fourierMakingWaves.register('SumChartNode', SumChartNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDYW52YXNMaW5lUGxvdCIsIkNoYXJ0Q2FudmFzTm9kZSIsIlNoYXBlIiwibWVyZ2UiLCJmb3VyaWVyTWFraW5nV2F2ZXMiLCJGTVdDb2xvcnMiLCJTdW1DaGFydCIsIkRvbWFpbkNoYXJ0Tm9kZSIsIlN1bUNoYXJ0Tm9kZSIsImNvbnN0cnVjdG9yIiwic3VtQ2hhcnQiLCJvcHRpb25zIiwiYXNzZXJ0IiwiYW1wbGl0dWRlc1Byb3BlcnR5IiwiZm91cmllclNlcmllcyIsInN1bURhdGFTZXRQcm9wZXJ0eSIsInlBeGlzUmFuZ2VQcm9wZXJ0eSIsInlBeGlzRGVzY3JpcHRpb25Qcm9wZXJ0eSIsInN1bVBsb3RTdHJva2VQcm9wZXJ0eSIsInN1bVBsb3RMaW5lV2lkdGgiLCJjaGFydFRyYW5zZm9ybU9wdGlvbnMiLCJtb2RlbFlSYW5nZSIsInZhbHVlIiwicmFuZ2UiLCJzdW1QbG90IiwiY2hhcnRUcmFuc2Zvcm0iLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJjaGFydENhbnZhc05vZGUiLCJjbGlwQXJlYSIsImJvdW5kcyIsImNoYXJ0UmVjdGFuZ2xlIiwiYWRkQ2hpbGQiLCJsYXp5TGluayIsInNldFN0cm9rZSIsInVwZGF0ZSIsImRhdGFTZXQiLCJzZXREYXRhU2V0IiwibGluayIsImFtcGxpdHVkZXMiLCJ2aXNpYmxlIiwiXyIsInNvbWUiLCJhbXBsaXR1ZGUiLCJzZXRNb2RlbFlSYW5nZSIsInlBeGlzRGVzY3JpcHRpb24iLCJ5R3JpZExpbmVzIiwic2V0U3BhY2luZyIsImdyaWRMaW5lU3BhY2luZyIsInlUaWNrTWFya3MiLCJ0aWNrTWFya1NwYWNpbmciLCJ5VGlja0xhYmVscyIsInRpY2tMYWJlbFNwYWNpbmciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN1bUNoYXJ0Tm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTdW1DaGFydE5vZGUgaXMgdGhlIHZpZXcgYmFzZSBjbGFzcyBmb3IgdGhlICdTdW0nIGNoYXJ0IGluIHRoZSAnRGlzY3JldGUnIGFuZCAnV2F2ZSBHYW1lJyBzY3JlZW5zLlxyXG4gKiBJdCBjcmVhdGVzIGFuZCBtYW5hZ2VzIHRoZSBwbG90IGZvciB0aGUgc3VtIG9mIGhhcm1vbmljcyBpbiBhIEZvdXJpZXIgc2VyaWVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBDYW52YXNMaW5lUGxvdCBmcm9tICcuLi8uLi8uLi8uLi9iYW1ib28vanMvQ2FudmFzTGluZVBsb3QuanMnO1xyXG5pbXBvcnQgQ2hhcnRDYW52YXNOb2RlIGZyb20gJy4uLy4uLy4uLy4uL2JhbWJvby9qcy9DaGFydENhbnZhc05vZGUuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgZm91cmllck1ha2luZ1dhdmVzIGZyb20gJy4uLy4uL2ZvdXJpZXJNYWtpbmdXYXZlcy5qcyc7XHJcbmltcG9ydCBGTVdDb2xvcnMgZnJvbSAnLi4vRk1XQ29sb3JzLmpzJztcclxuaW1wb3J0IFN1bUNoYXJ0IGZyb20gJy4uL21vZGVsL1N1bUNoYXJ0LmpzJztcclxuaW1wb3J0IERvbWFpbkNoYXJ0Tm9kZSBmcm9tICcuL0RvbWFpbkNoYXJ0Tm9kZS5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdW1DaGFydE5vZGUgZXh0ZW5kcyBEb21haW5DaGFydE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1N1bUNoYXJ0fSBzdW1DaGFydFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc3VtQ2hhcnQsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3VtQ2hhcnQgaW5zdGFuY2VvZiBTdW1DaGFydCApO1xyXG5cclxuICAgIC8vIEZpZWxkcyBvZiBpbnRlcmVzdCBpbiBzdW1DaGFydCwgdG8gaW1wcm92ZSByZWFkYWJpbGl0eVxyXG4gICAgY29uc3QgYW1wbGl0dWRlc1Byb3BlcnR5ID0gc3VtQ2hhcnQuZm91cmllclNlcmllcy5hbXBsaXR1ZGVzUHJvcGVydHk7XHJcbiAgICBjb25zdCBzdW1EYXRhU2V0UHJvcGVydHkgPSBzdW1DaGFydC5zdW1EYXRhU2V0UHJvcGVydHk7XHJcbiAgICBjb25zdCB5QXhpc1JhbmdlUHJvcGVydHkgPSBzdW1DaGFydC55QXhpc1JhbmdlUHJvcGVydHk7XHJcbiAgICBjb25zdCB5QXhpc0Rlc2NyaXB0aW9uUHJvcGVydHkgPSBzdW1DaGFydC55QXhpc0Rlc2NyaXB0aW9uUHJvcGVydHk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBUaGlzIHdvdWxkIGJlIGEgbG9naWNhbCBwbGFjZSB0byB1c2UgbmVzdGVkIHN1bVBsb3RPcHRpb25zLiBCdXQgQ2FudmFzTGluZVBsb3QgZG9lcyBub3Qgc3VwcG9ydCBQcm9wZXJ0eSBmb3JcclxuICAgICAgLy8gc3Ryb2tlLCBzbyB0aGUgb25seSB0aGluZyBuZXN0YWJsZSBpcyBsaW5lV2lkdGguICBUaGF0IGRvZXNuJ3Qgc2VlbSBsaWtlIGEgYmlnIHdpbiwgc28gSSBjaG9zZSB0byB1c2UgZmxhdFxyXG4gICAgICAvLyBvcHRpb25zLlxyXG4gICAgICBzdW1QbG90U3Ryb2tlUHJvcGVydHk6IEZNV0NvbG9ycy5zdW1QbG90U3Ryb2tlUHJvcGVydHksXHJcbiAgICAgIHN1bVBsb3RMaW5lV2lkdGg6IDEsXHJcblxyXG4gICAgICAvLyBGTVdDaGFydE5vZGUgb3B0aW9uc1xyXG4gICAgICBjaGFydFRyYW5zZm9ybU9wdGlvbnM6IHtcclxuICAgICAgICAvLyBtb2RlbFhSYW5nZSBpcyBoYW5kbGVkIGJ5IHN1cGVyY2xhc3MgRG9tYWluQ2hhcnROb2RlXHJcbiAgICAgICAgbW9kZWxZUmFuZ2U6IHlBeGlzRGVzY3JpcHRpb25Qcm9wZXJ0eS52YWx1ZS5yYW5nZVxyXG4gICAgICB9XHJcblxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBzdW1DaGFydCwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFBsb3QgdGhhdCBzaG93cyB0aGUgc3VtXHJcbiAgICBjb25zdCBzdW1QbG90ID0gbmV3IENhbnZhc0xpbmVQbG90KCB0aGlzLmNoYXJ0VHJhbnNmb3JtLCBzdW1EYXRhU2V0UHJvcGVydHkudmFsdWUsIHtcclxuICAgICAgc3Ryb2tlOiBvcHRpb25zLnN1bVBsb3RTdHJva2VQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLnN1bVBsb3RMaW5lV2lkdGhcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBEcmF3IHRoZSBzdW0gcGxvdCB1c2luZyBDYW52YXMsIGNsaXBwZWQgdG8gY2hhcnRSZWN0YW5nbGUuXHJcbiAgICBjb25zdCBjaGFydENhbnZhc05vZGUgPSBuZXcgQ2hhcnRDYW52YXNOb2RlKCB0aGlzLmNoYXJ0VHJhbnNmb3JtLCBbIHN1bVBsb3QgXSwge1xyXG4gICAgICBjbGlwQXJlYTogU2hhcGUuYm91bmRzKCB0aGlzLmNoYXJ0UmVjdGFuZ2xlLmJvdW5kcyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBjaGFydENhbnZhc05vZGUgKTtcclxuXHJcbiAgICAvLyBDYW52YXNMaW5lUGxvdCBkb2VzIG5vdCBhbGxvdyBzdHJva2UgdG8gYmUgYSBQcm9wZXJ0eSwgc28gd2UgaGF2ZSB0byBtYW5hZ2UgY2hhbmdlcyBvdXJzZWx2ZXMuXHJcbiAgICBvcHRpb25zLnN1bVBsb3RTdHJva2VQcm9wZXJ0eS5sYXp5TGluayggc3Ryb2tlID0+IHtcclxuICAgICAgc3VtUGxvdC5zZXRTdHJva2UoIHN0cm9rZSApO1xyXG4gICAgICBjaGFydENhbnZhc05vZGUudXBkYXRlKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRGlzcGxheSB0aGUgZGF0YSBzZXQuXHJcbiAgICBzdW1EYXRhU2V0UHJvcGVydHkubGF6eUxpbmsoIGRhdGFTZXQgPT4ge1xyXG4gICAgICBzdW1QbG90LnNldERhdGFTZXQoIGRhdGFTZXQgKTtcclxuICAgICAgY2hhcnRDYW52YXNOb2RlLnVwZGF0ZSgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEhpZGUgdGhlIHBsb3Qgd2hlbiB0aGUgc3VtIGlzIHplcm8gKGFsbCBhbXBsaXR1ZGVzIGFyZSB6ZXJvKVxyXG4gICAgYW1wbGl0dWRlc1Byb3BlcnR5LmxpbmsoIGFtcGxpdHVkZXMgPT4ge1xyXG4gICAgICBzdW1QbG90LnZpc2libGUgPSBfLnNvbWUoIGFtcGxpdHVkZXMsIGFtcGxpdHVkZSA9PiBhbXBsaXR1ZGUgIT09IDAgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHktYXhpcyByYW5nZS5cclxuICAgIHlBeGlzUmFuZ2VQcm9wZXJ0eS5saW5rKCByYW5nZSA9PiB0aGlzLmNoYXJ0VHJhbnNmb3JtLnNldE1vZGVsWVJhbmdlKCByYW5nZSApICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSB5LWF4aXMgZGVjb3JhdGlvbnMuXHJcbiAgICB5QXhpc0Rlc2NyaXB0aW9uUHJvcGVydHkubGluayggeUF4aXNEZXNjcmlwdGlvbiA9PiB7XHJcbiAgICAgIC8vIE5PVEU6IHRoaXMuY2hhcnRUcmFuc2Zvcm0uc2V0TW9kZWxZUmFuZ2UgaXMgaGFuZGxlZCB2aWEgeUF4aXNSYW5nZVByb3BlcnR5IGxpc3RlbmVyLCBhYm92ZS5cclxuICAgICAgdGhpcy55R3JpZExpbmVzLnNldFNwYWNpbmcoIHlBeGlzRGVzY3JpcHRpb24uZ3JpZExpbmVTcGFjaW5nICk7XHJcbiAgICAgIHRoaXMueVRpY2tNYXJrcy5zZXRTcGFjaW5nKCB5QXhpc0Rlc2NyaXB0aW9uLnRpY2tNYXJrU3BhY2luZyApO1xyXG4gICAgICB0aGlzLnlUaWNrTGFiZWxzLnNldFNwYWNpbmcoIHlBeGlzRGVzY3JpcHRpb24udGlja0xhYmVsU3BhY2luZyApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWRcclxuICAgIHRoaXMuY2hhcnRDYW52YXNOb2RlID0gY2hhcnRDYW52YXNOb2RlOyAvLyB7Q2hhcnRDYW52YXNOb2RlfVxyXG4gICAgdGhpcy5zdW1QbG90ID0gc3VtUGxvdDsgLy8ge0NhbnZhc0xpbmVQbG90fVxyXG4gIH1cclxufVxyXG5cclxuZm91cmllck1ha2luZ1dhdmVzLnJlZ2lzdGVyKCAnU3VtQ2hhcnROb2RlJywgU3VtQ2hhcnROb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLHlDQUF5QztBQUNwRSxPQUFPQyxlQUFlLE1BQU0sMENBQTBDO0FBQ3RFLFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MsU0FBUyxNQUFNLGlCQUFpQjtBQUN2QyxPQUFPQyxRQUFRLE1BQU0sc0JBQXNCO0FBQzNDLE9BQU9DLGVBQWUsTUFBTSxzQkFBc0I7QUFFbEQsZUFBZSxNQUFNQyxZQUFZLFNBQVNELGVBQWUsQ0FBQztFQUV4RDtBQUNGO0FBQ0E7QUFDQTtFQUNFRSxXQUFXQSxDQUFFQyxRQUFRLEVBQUVDLE9BQU8sRUFBRztJQUUvQkMsTUFBTSxJQUFJQSxNQUFNLENBQUVGLFFBQVEsWUFBWUosUUFBUyxDQUFDOztJQUVoRDtJQUNBLE1BQU1PLGtCQUFrQixHQUFHSCxRQUFRLENBQUNJLGFBQWEsQ0FBQ0Qsa0JBQWtCO0lBQ3BFLE1BQU1FLGtCQUFrQixHQUFHTCxRQUFRLENBQUNLLGtCQUFrQjtJQUN0RCxNQUFNQyxrQkFBa0IsR0FBR04sUUFB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