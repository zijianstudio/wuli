// Copyright 2021-2023, University of Colorado Boulder

/**
 * WavePacketComponentsChartNode is the view for the 'Fourier Components' chart in the 'Wave Packet' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import CanvasLinePlot from '../../../../bamboo/js/CanvasLinePlot.js';
import ChartCanvasNode from '../../../../bamboo/js/ChartCanvasNode.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Text } from '../../../../scenery/js/imports.js';
import FMWColors from '../../common/FMWColors.js';
import DomainChartNode from '../../common/view/DomainChartNode.js';
import TickLabelUtils from '../../common/view/TickLabelUtils.js';
import ZoomLevelProperty from '../../common/view/ZoomLevelProperty.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import FourierMakingWavesStrings from '../../FourierMakingWavesStrings.js';
import WavePacketComponentsChart from '../model/WavePacketComponentsChart.js';

// constants
const X_TICK_LABEL_DECIMALS = 1;
const Y_TICK_LABEL_DECIMALS = 2;
const GRAY_RANGE = FMWColors.FOURIER_COMPONENT_GRAY_RANGE;
export default class WavePacketComponentsChartNode extends DomainChartNode {
  /**
   * @param {WavePacketComponentsChart} componentsChart
   * @param {Object} [options]
   */
  constructor(componentsChart, options) {
    assert && assert(componentsChart instanceof WavePacketComponentsChart);
    assert && assert(options && options.tandem);

    // Fields of interest in componentsChart, to improve readability
    const xAxisDescriptionProperty = componentsChart.xAxisDescriptionProperty;
    const componentDataSetsProperty = componentsChart.componentDataSetsProperty;
    options = merge({
      xZoomLevelProperty: new ZoomLevelProperty(xAxisDescriptionProperty, options.tandem.createTandem('xZoomLevelProperty')),
      xTickLabelSetOptions: {
        createLabel: value => TickLabelUtils.createNumericTickLabel(value, X_TICK_LABEL_DECIMALS)
      },
      yTickLabelSetOptions: {
        createLabel: value => TickLabelUtils.createNumericTickLabel(value, Y_TICK_LABEL_DECIMALS)
      }
    }, options);
    super(componentsChart, options);

    // Render the plots using Canvas.
    // Remember! When any of the associated plots is updated, you must call update().
    const chartCanvasNode = new ChartCanvasNode(this.chartTransform, []);
    this.addChild(chartCanvasNode);

    // Message shown when we have an infinite number of components.
    const messageNode = new BackgroundNode(new Text(FourierMakingWavesStrings.infiniteComponentsCannotBePlottedStringProperty, {
      font: new PhetFont(18),
      maxWidth: 0.75 * this.chartRectangle.width
    }), {
      xMargin: 12,
      yMargin: 6
    });
    this.addChild(messageNode);
    messageNode.boundsProperty.link(bounds => {
      messageNode.enter = this.chartRectangle.center;
    });
    componentDataSetsProperty.link(componentDataSets => {
      // When we have infinite components, componentDataSets cannot be populated and will be [].
      const hasInfiniteComponents = componentDataSets.length === 0;

      // Show the '...cannot be plotted' message.
      messageNode.visible = hasInfiniteComponents;

      // Hide all component plots.
      chartCanvasNode.visible = !hasInfiniteComponents;

      // Hide some chart elements.
      this.yGridLines.visible = !hasInfiniteComponents;
      this.yTickMarks.visible = !hasInfiniteComponents;
      this.yTickLabels.visible = !hasInfiniteComponents;

      // Update the plot for each component.
      if (hasInfiniteComponents) {

        // Do nothing. While we could set the data set to [] for every CanvasLinePlot, that would be a performance hit.
        // Instead, chartCanvasNode.visible is set to false (see above) when we have infinite components.
      } else {
        const plots = chartCanvasNode.painters;
        const numberOfPlots = plots.length;

        // The peak amplitude, for scaling the y axis.
        let peakAmplitude = 0;
        const numberOfComponents = componentDataSets.length;
        for (let i = 0; i < numberOfComponents; i++) {
          const dataSet = componentDataSets[i];
          assert && assert(dataSet.length > 0);

          // Inspect this component for peak amplitude.
          peakAmplitude = Math.max(peakAmplitude, _.maxBy(dataSet, point => point.y).y);

          // Gray to be used to stroke this component
          const rgb = GRAY_RANGE.constrainValue(GRAY_RANGE.min + GRAY_RANGE.getLength() * i / numberOfComponents);
          const stroke = Color.grayColor(rgb);
          if (i < numberOfPlots) {
            // Reuse an existing plot.
            const plot = plots[i];
            assert && assert(plot instanceof CanvasLinePlot);
            plot.setDataSet(dataSet);
            plot.setStroke(stroke);
          } else {
            // Create a new plot.
            const plot = new CanvasLinePlot(this.chartTransform, dataSet, {
              stroke: stroke
            });
            chartCanvasNode.painters.push(plot);
          }
        }

        // Any unused plots get an empty data set, so that they draw nothing.
        if (numberOfComponents < numberOfPlots) {
          for (let i = numberOfComponents; i < numberOfPlots; i++) {
            const plot = plots[i];
            if (plot.dataSet.length > 0) {
              plot.setDataSet([]);
            }
          }
        }

        // Reverse the order of plots, so that lower-order components (darker gray) are rendered last,
        // and therefore appear on top. If we don't do this, then the higher-order components (lighter gray)
        // will wash out the chart, reducing the contrast.
        chartCanvasNode.painters.reverse();

        // Scale the y axis, with a little padding above/below the peak.
        const maxY = 1.1 * peakAmplitude;
        this.chartTransform.setModelYRange(new Range(-maxY, maxY));
        this.yGridLines.setSpacing(peakAmplitude);
        this.yTickMarks.setSpacing(peakAmplitude);
        this.yTickLabels.setSpacing(peakAmplitude);

        // Clip to the range [-peakAmplitude,peakAmplitude], to trim rendering anomalies that occur when zoomed out.
        // See https://github.com/phetsims/fourier-making-waves/issues/121
        chartCanvasNode.clipArea = this.computeClipAreaForAmplitudeRange(-peakAmplitude, peakAmplitude);

        // Redraw the plots.
        chartCanvasNode.update();
      }
    });
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
fourierMakingWaves.register('WavePacketComponentsChartNode', WavePacketComponentsChartNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDYW52YXNMaW5lUGxvdCIsIkNoYXJ0Q2FudmFzTm9kZSIsIlJhbmdlIiwibWVyZ2UiLCJCYWNrZ3JvdW5kTm9kZSIsIlBoZXRGb250IiwiQ29sb3IiLCJUZXh0IiwiRk1XQ29sb3JzIiwiRG9tYWluQ2hhcnROb2RlIiwiVGlja0xhYmVsVXRpbHMiLCJab29tTGV2ZWxQcm9wZXJ0eSIsImZvdXJpZXJNYWtpbmdXYXZlcyIsIkZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MiLCJXYXZlUGFja2V0Q29tcG9uZW50c0NoYXJ0IiwiWF9USUNLX0xBQkVMX0RFQ0lNQUxTIiwiWV9USUNLX0xBQkVMX0RFQ0lNQUxTIiwiR1JBWV9SQU5HRSIsIkZPVVJJRVJfQ09NUE9ORU5UX0dSQVlfUkFOR0UiLCJXYXZlUGFja2V0Q29tcG9uZW50c0NoYXJ0Tm9kZSIsImNvbnN0cnVjdG9yIiwiY29tcG9uZW50c0NoYXJ0Iiwib3B0aW9ucyIsImFzc2VydCIsInRhbmRlbSIsInhBeGlzRGVzY3JpcHRpb25Qcm9wZXJ0eSIsImNvbXBvbmVudERhdGFTZXRzUHJvcGVydHkiLCJ4Wm9vbUxldmVsUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJ4VGlja0xhYmVsU2V0T3B0aW9ucyIsImNyZWF0ZUxhYmVsIiwidmFsdWUiLCJjcmVhdGVOdW1lcmljVGlja0xhYmVsIiwieVRpY2tMYWJlbFNldE9wdGlvbnMiLCJjaGFydENhbnZhc05vZGUiLCJjaGFydFRyYW5zZm9ybSIsImFkZENoaWxkIiwibWVzc2FnZU5vZGUiLCJpbmZpbml0ZUNvbXBvbmVudHNDYW5ub3RCZVBsb3R0ZWRTdHJpbmdQcm9wZXJ0eSIsImZvbnQiLCJtYXhXaWR0aCIsImNoYXJ0UmVjdGFuZ2xlIiwid2lkdGgiLCJ4TWFyZ2luIiwieU1hcmdpbiIsImJvdW5kc1Byb3BlcnR5IiwibGluayIsImJvdW5kcyIsImVudGVyIiwiY2VudGVyIiwiY29tcG9uZW50RGF0YVNldHMiLCJoYXNJbmZpbml0ZUNvbXBvbmVudHMiLCJsZW5ndGgiLCJ2aXNpYmxlIiwieUdyaWRMaW5lcyIsInlUaWNrTWFya3MiLCJ5VGlja0xhYmVscyIsInBsb3RzIiwicGFpbnRlcnMiLCJudW1iZXJPZlBsb3RzIiwicGVha0FtcGxpdHVkZSIsIm51bWJlck9mQ29tcG9uZW50cyIsImkiLCJkYXRhU2V0IiwiTWF0aCIsIm1heCIsIl8iLCJtYXhCeSIsInBvaW50IiwieSIsInJnYiIsImNvbnN0cmFpblZhbHVlIiwibWluIiwiZ2V0TGVuZ3RoIiwic3Ryb2tlIiwiZ3JheUNvbG9yIiwicGxvdCIsInNldERhdGFTZXQiLCJzZXRTdHJva2UiLCJwdXNoIiwicmV2ZXJzZSIsIm1heFkiLCJzZXRNb2RlbFlSYW5nZSIsInNldFNwYWNpbmciLCJjbGlwQXJlYSIsImNvbXB1dGVDbGlwQXJlYUZvckFtcGxpdHVkZVJhbmdlIiwidXBkYXRlIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2F2ZVBhY2tldENvbXBvbmVudHNDaGFydE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogV2F2ZVBhY2tldENvbXBvbmVudHNDaGFydE5vZGUgaXMgdGhlIHZpZXcgZm9yIHRoZSAnRm91cmllciBDb21wb25lbnRzJyBjaGFydCBpbiB0aGUgJ1dhdmUgUGFja2V0JyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IENhbnZhc0xpbmVQbG90IGZyb20gJy4uLy4uLy4uLy4uL2JhbWJvby9qcy9DYW52YXNMaW5lUGxvdC5qcyc7XHJcbmltcG9ydCBDaGFydENhbnZhc05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vYmFtYm9vL2pzL0NoYXJ0Q2FudmFzTm9kZS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEJhY2tncm91bmROb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9CYWNrZ3JvdW5kTm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBGTVdDb2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL0ZNV0NvbG9ycy5qcyc7XHJcbmltcG9ydCBEb21haW5DaGFydE5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRG9tYWluQ2hhcnROb2RlLmpzJztcclxuaW1wb3J0IFRpY2tMYWJlbFV0aWxzIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1RpY2tMYWJlbFV0aWxzLmpzJztcclxuaW1wb3J0IFpvb21MZXZlbFByb3BlcnR5IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1pvb21MZXZlbFByb3BlcnR5LmpzJztcclxuaW1wb3J0IGZvdXJpZXJNYWtpbmdXYXZlcyBmcm9tICcuLi8uLi9mb3VyaWVyTWFraW5nV2F2ZXMuanMnO1xyXG5pbXBvcnQgRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncyBmcm9tICcuLi8uLi9Gb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IFdhdmVQYWNrZXRDb21wb25lbnRzQ2hhcnQgZnJvbSAnLi4vbW9kZWwvV2F2ZVBhY2tldENvbXBvbmVudHNDaGFydC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgWF9USUNLX0xBQkVMX0RFQ0lNQUxTID0gMTtcclxuY29uc3QgWV9USUNLX0xBQkVMX0RFQ0lNQUxTID0gMjtcclxuY29uc3QgR1JBWV9SQU5HRSA9IEZNV0NvbG9ycy5GT1VSSUVSX0NPTVBPTkVOVF9HUkFZX1JBTkdFO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2F2ZVBhY2tldENvbXBvbmVudHNDaGFydE5vZGUgZXh0ZW5kcyBEb21haW5DaGFydE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1dhdmVQYWNrZXRDb21wb25lbnRzQ2hhcnR9IGNvbXBvbmVudHNDaGFydFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY29tcG9uZW50c0NoYXJ0LCBvcHRpb25zICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbXBvbmVudHNDaGFydCBpbnN0YW5jZW9mIFdhdmVQYWNrZXRDb21wb25lbnRzQ2hhcnQgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMgJiYgb3B0aW9ucy50YW5kZW0gKTtcclxuXHJcbiAgICAvLyBGaWVsZHMgb2YgaW50ZXJlc3QgaW4gY29tcG9uZW50c0NoYXJ0LCB0byBpbXByb3ZlIHJlYWRhYmlsaXR5XHJcbiAgICBjb25zdCB4QXhpc0Rlc2NyaXB0aW9uUHJvcGVydHkgPSBjb21wb25lbnRzQ2hhcnQueEF4aXNEZXNjcmlwdGlvblByb3BlcnR5O1xyXG4gICAgY29uc3QgY29tcG9uZW50RGF0YVNldHNQcm9wZXJ0eSA9IGNvbXBvbmVudHNDaGFydC5jb21wb25lbnREYXRhU2V0c1Byb3BlcnR5O1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICB4Wm9vbUxldmVsUHJvcGVydHk6IG5ldyBab29tTGV2ZWxQcm9wZXJ0eSggeEF4aXNEZXNjcmlwdGlvblByb3BlcnR5LCBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd4Wm9vbUxldmVsUHJvcGVydHknICkgKSxcclxuICAgICAgeFRpY2tMYWJlbFNldE9wdGlvbnM6IHtcclxuICAgICAgICBjcmVhdGVMYWJlbDogdmFsdWUgPT4gVGlja0xhYmVsVXRpbHMuY3JlYXRlTnVtZXJpY1RpY2tMYWJlbCggdmFsdWUsIFhfVElDS19MQUJFTF9ERUNJTUFMUyApXHJcbiAgICAgIH0sXHJcbiAgICAgIHlUaWNrTGFiZWxTZXRPcHRpb25zOiB7XHJcbiAgICAgICAgY3JlYXRlTGFiZWw6IHZhbHVlID0+IFRpY2tMYWJlbFV0aWxzLmNyZWF0ZU51bWVyaWNUaWNrTGFiZWwoIHZhbHVlLCBZX1RJQ0tfTEFCRUxfREVDSU1BTFMgKVxyXG4gICAgICB9XHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIGNvbXBvbmVudHNDaGFydCwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFJlbmRlciB0aGUgcGxvdHMgdXNpbmcgQ2FudmFzLlxyXG4gICAgLy8gUmVtZW1iZXIhIFdoZW4gYW55IG9mIHRoZSBhc3NvY2lhdGVkIHBsb3RzIGlzIHVwZGF0ZWQsIHlvdSBtdXN0IGNhbGwgdXBkYXRlKCkuXHJcbiAgICBjb25zdCBjaGFydENhbnZhc05vZGUgPSBuZXcgQ2hhcnRDYW52YXNOb2RlKCB0aGlzLmNoYXJ0VHJhbnNmb3JtLCBbXSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggY2hhcnRDYW52YXNOb2RlICk7XHJcblxyXG4gICAgLy8gTWVzc2FnZSBzaG93biB3aGVuIHdlIGhhdmUgYW4gaW5maW5pdGUgbnVtYmVyIG9mIGNvbXBvbmVudHMuXHJcbiAgICBjb25zdCBtZXNzYWdlTm9kZSA9IG5ldyBCYWNrZ3JvdW5kTm9kZShcclxuICAgICAgbmV3IFRleHQoIEZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MuaW5maW5pdGVDb21wb25lbnRzQ2Fubm90QmVQbG90dGVkU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE4ICksXHJcbiAgICAgICAgbWF4V2lkdGg6IDAuNzUgKiB0aGlzLmNoYXJ0UmVjdGFuZ2xlLndpZHRoXHJcbiAgICAgIH0gKSwge1xyXG4gICAgICAgIHhNYXJnaW46IDEyLFxyXG4gICAgICAgIHlNYXJnaW46IDZcclxuICAgICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbWVzc2FnZU5vZGUgKTtcclxuICAgIG1lc3NhZ2VOb2RlLmJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XHJcbiAgICAgIG1lc3NhZ2VOb2RlLmVudGVyID0gdGhpcy5jaGFydFJlY3RhbmdsZS5jZW50ZXI7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29tcG9uZW50RGF0YVNldHNQcm9wZXJ0eS5saW5rKCBjb21wb25lbnREYXRhU2V0cyA9PiB7XHJcblxyXG4gICAgICAvLyBXaGVuIHdlIGhhdmUgaW5maW5pdGUgY29tcG9uZW50cywgY29tcG9uZW50RGF0YVNldHMgY2Fubm90IGJlIHBvcHVsYXRlZCBhbmQgd2lsbCBiZSBbXS5cclxuICAgICAgY29uc3QgaGFzSW5maW5pdGVDb21wb25lbnRzID0gKCBjb21wb25lbnREYXRhU2V0cy5sZW5ndGggPT09IDAgKTtcclxuXHJcbiAgICAgIC8vIFNob3cgdGhlICcuLi5jYW5ub3QgYmUgcGxvdHRlZCcgbWVzc2FnZS5cclxuICAgICAgbWVzc2FnZU5vZGUudmlzaWJsZSA9IGhhc0luZmluaXRlQ29tcG9uZW50cztcclxuXHJcbiAgICAgIC8vIEhpZGUgYWxsIGNvbXBvbmVudCBwbG90cy5cclxuICAgICAgY2hhcnRDYW52YXNOb2RlLnZpc2libGUgPSAhaGFzSW5maW5pdGVDb21wb25lbnRzO1xyXG5cclxuICAgICAgLy8gSGlkZSBzb21lIGNoYXJ0IGVsZW1lbnRzLlxyXG4gICAgICB0aGlzLnlHcmlkTGluZXMudmlzaWJsZSA9ICFoYXNJbmZpbml0ZUNvbXBvbmVudHM7XHJcbiAgICAgIHRoaXMueVRpY2tNYXJrcy52aXNpYmxlID0gIWhhc0luZmluaXRlQ29tcG9uZW50cztcclxuICAgICAgdGhpcy55VGlja0xhYmVscy52aXNpYmxlID0gIWhhc0luZmluaXRlQ29tcG9uZW50cztcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0aGUgcGxvdCBmb3IgZWFjaCBjb21wb25lbnQuXHJcbiAgICAgIGlmICggaGFzSW5maW5pdGVDb21wb25lbnRzICkge1xyXG5cclxuICAgICAgICAvLyBEbyBub3RoaW5nLiBXaGlsZSB3ZSBjb3VsZCBzZXQgdGhlIGRhdGEgc2V0IHRvIFtdIGZvciBldmVyeSBDYW52YXNMaW5lUGxvdCwgdGhhdCB3b3VsZCBiZSBhIHBlcmZvcm1hbmNlIGhpdC5cclxuICAgICAgICAvLyBJbnN0ZWFkLCBjaGFydENhbnZhc05vZGUudmlzaWJsZSBpcyBzZXQgdG8gZmFsc2UgKHNlZSBhYm92ZSkgd2hlbiB3ZSBoYXZlIGluZmluaXRlIGNvbXBvbmVudHMuXHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY29uc3QgcGxvdHMgPSBjaGFydENhbnZhc05vZGUucGFpbnRlcnM7XHJcbiAgICAgICAgY29uc3QgbnVtYmVyT2ZQbG90cyA9IHBsb3RzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLy8gVGhlIHBlYWsgYW1wbGl0dWRlLCBmb3Igc2NhbGluZyB0aGUgeSBheGlzLlxyXG4gICAgICAgIGxldCBwZWFrQW1wbGl0dWRlID0gMDtcclxuXHJcbiAgICAgICAgY29uc3QgbnVtYmVyT2ZDb21wb25lbnRzID0gY29tcG9uZW50RGF0YVNldHMubGVuZ3RoO1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlck9mQ29tcG9uZW50czsgaSsrICkge1xyXG5cclxuICAgICAgICAgIGNvbnN0IGRhdGFTZXQgPSBjb21wb25lbnREYXRhU2V0c1sgaSBdO1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZGF0YVNldC5sZW5ndGggPiAwICk7XHJcblxyXG4gICAgICAgICAgLy8gSW5zcGVjdCB0aGlzIGNvbXBvbmVudCBmb3IgcGVhayBhbXBsaXR1ZGUuXHJcbiAgICAgICAgICBwZWFrQW1wbGl0dWRlID0gTWF0aC5tYXgoIHBlYWtBbXBsaXR1ZGUsIF8ubWF4QnkoIGRhdGFTZXQsIHBvaW50ID0+IHBvaW50LnkgKS55ICk7XHJcblxyXG4gICAgICAgICAgLy8gR3JheSB0byBiZSB1c2VkIHRvIHN0cm9rZSB0aGlzIGNvbXBvbmVudFxyXG4gICAgICAgICAgY29uc3QgcmdiID0gR1JBWV9SQU5HRS5jb25zdHJhaW5WYWx1ZSggR1JBWV9SQU5HRS5taW4gKyBHUkFZX1JBTkdFLmdldExlbmd0aCgpICogaSAvIG51bWJlck9mQ29tcG9uZW50cyApO1xyXG4gICAgICAgICAgY29uc3Qgc3Ryb2tlID0gQ29sb3IuZ3JheUNvbG9yKCByZ2IgKTtcclxuXHJcbiAgICAgICAgICBpZiAoIGkgPCBudW1iZXJPZlBsb3RzICkge1xyXG5cclxuICAgICAgICAgICAgLy8gUmV1c2UgYW4gZXhpc3RpbmcgcGxvdC5cclxuICAgICAgICAgICAgY29uc3QgcGxvdCA9IHBsb3RzWyBpIF07XHJcbiAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHBsb3QgaW5zdGFuY2VvZiBDYW52YXNMaW5lUGxvdCApO1xyXG4gICAgICAgICAgICBwbG90LnNldERhdGFTZXQoIGRhdGFTZXQgKTtcclxuICAgICAgICAgICAgcGxvdC5zZXRTdHJva2UoIHN0cm9rZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBDcmVhdGUgYSBuZXcgcGxvdC5cclxuICAgICAgICAgICAgY29uc3QgcGxvdCA9IG5ldyBDYW52YXNMaW5lUGxvdCggdGhpcy5jaGFydFRyYW5zZm9ybSwgZGF0YVNldCwge1xyXG4gICAgICAgICAgICAgIHN0cm9rZTogc3Ryb2tlXHJcbiAgICAgICAgICAgIH0gKTtcclxuICAgICAgICAgICAgY2hhcnRDYW52YXNOb2RlLnBhaW50ZXJzLnB1c2goIHBsb3QgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFueSB1bnVzZWQgcGxvdHMgZ2V0IGFuIGVtcHR5IGRhdGEgc2V0LCBzbyB0aGF0IHRoZXkgZHJhdyBub3RoaW5nLlxyXG4gICAgICAgIGlmICggbnVtYmVyT2ZDb21wb25lbnRzIDwgbnVtYmVyT2ZQbG90cyApIHtcclxuICAgICAgICAgIGZvciAoIGxldCBpID0gbnVtYmVyT2ZDb21wb25lbnRzOyBpIDwgbnVtYmVyT2ZQbG90czsgaSsrICkge1xyXG4gICAgICAgICAgICBjb25zdCBwbG90ID0gcGxvdHNbIGkgXTtcclxuICAgICAgICAgICAgaWYgKCBwbG90LmRhdGFTZXQubGVuZ3RoID4gMCApIHtcclxuICAgICAgICAgICAgICBwbG90LnNldERhdGFTZXQoIFtdICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJldmVyc2UgdGhlIG9yZGVyIG9mIHBsb3RzLCBzbyB0aGF0IGxvd2VyLW9yZGVyIGNvbXBvbmVudHMgKGRhcmtlciBncmF5KSBhcmUgcmVuZGVyZWQgbGFzdCxcclxuICAgICAgICAvLyBhbmQgdGhlcmVmb3JlIGFwcGVhciBvbiB0b3AuIElmIHdlIGRvbid0IGRvIHRoaXMsIHRoZW4gdGhlIGhpZ2hlci1vcmRlciBjb21wb25lbnRzIChsaWdodGVyIGdyYXkpXHJcbiAgICAgICAgLy8gd2lsbCB3YXNoIG91dCB0aGUgY2hhcnQsIHJlZHVjaW5nIHRoZSBjb250cmFzdC5cclxuICAgICAgICBjaGFydENhbnZhc05vZGUucGFpbnRlcnMucmV2ZXJzZSgpO1xyXG5cclxuICAgICAgICAvLyBTY2FsZSB0aGUgeSBheGlzLCB3aXRoIGEgbGl0dGxlIHBhZGRpbmcgYWJvdmUvYmVsb3cgdGhlIHBlYWsuXHJcbiAgICAgICAgY29uc3QgbWF4WSA9IDEuMSAqIHBlYWtBbXBsaXR1ZGU7XHJcbiAgICAgICAgdGhpcy5jaGFydFRyYW5zZm9ybS5zZXRNb2RlbFlSYW5nZSggbmV3IFJhbmdlKCAtbWF4WSwgbWF4WSApICk7XHJcbiAgICAgICAgdGhpcy55R3JpZExpbmVzLnNldFNwYWNpbmcoIHBlYWtBbXBsaXR1ZGUgKTtcclxuICAgICAgICB0aGlzLnlUaWNrTWFya3Muc2V0U3BhY2luZyggcGVha0FtcGxpdHVkZSApO1xyXG4gICAgICAgIHRoaXMueVRpY2tMYWJlbHMuc2V0U3BhY2luZyggcGVha0FtcGxpdHVkZSApO1xyXG5cclxuICAgICAgICAvLyBDbGlwIHRvIHRoZSByYW5nZSBbLXBlYWtBbXBsaXR1ZGUscGVha0FtcGxpdHVkZV0sIHRvIHRyaW0gcmVuZGVyaW5nIGFub21hbGllcyB0aGF0IG9jY3VyIHdoZW4gem9vbWVkIG91dC5cclxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZvdXJpZXItbWFraW5nLXdhdmVzL2lzc3Vlcy8xMjFcclxuICAgICAgICBjaGFydENhbnZhc05vZGUuY2xpcEFyZWEgPSB0aGlzLmNvbXB1dGVDbGlwQXJlYUZvckFtcGxpdHVkZVJhbmdlKCAtcGVha0FtcGxpdHVkZSwgcGVha0FtcGxpdHVkZSApO1xyXG5cclxuICAgICAgICAvLyBSZWRyYXcgdGhlIHBsb3RzLlxyXG4gICAgICAgIGNoYXJ0Q2FudmFzTm9kZS51cGRhdGUoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmZvdXJpZXJNYWtpbmdXYXZlcy5yZWdpc3RlciggJ1dhdmVQYWNrZXRDb21wb25lbnRzQ2hhcnROb2RlJywgV2F2ZVBhY2tldENvbXBvbmVudHNDaGFydE5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLHlDQUF5QztBQUNwRSxPQUFP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