// Copyright 2014-2022, University of Colorado Boulder
/**
 * Chart for depicting the membrane potential.  This is a Node, and as such is intended for use primarily in the play
 * area.
 *
 * Originally, this chart was designed to scroll once there was enough data the fill the chart half way, but this
 * turned out to be too CPU intensive, so it was changed to draw one line of data across the screen and then stop. The
 * user can clear the chart and trigger another action potential to start recording data again.
 *
 * This chart can also be used to control the record-and-playback state of the model.  This is done so that the window
 * of recorded data in the model matches that shown in the chart, allowing the user to set the model state to any time
 * shown in the chart.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Bounds2 from '../../../../../dot/js/Bounds2.js';
import LinearFunction from '../../../../../dot/js/LinearFunction.js';
import Utils from '../../../../../dot/js/Utils.js';
import DynamicSeries from '../../../../../griddle/js/DynamicSeries.js';
import { Shape } from '../../../../../kite/js/imports.js';
import ModelViewTransform2 from '../../../../../phetcommon/js/view/ModelViewTransform2.js';
import CloseButton from '../../../../../scenery-phet/js/buttons/CloseButton.js';
import PhetColorScheme from '../../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { HBox, Node, Path, Text } from '../../../../../scenery/js/imports.js';
import TextPushButton from '../../../../../sun/js/buttons/TextPushButton.js';
import Panel from '../../../../../sun/js/Panel.js';
import neuron from '../../../neuron.js';
import NeuronStrings from '../../../NeuronStrings.js';
import NeuronConstants from '../../common/NeuronConstants.js';
import ChartCursor from './ChartCursor.js';
import DataLineCanvasNode from './DataLineCanvasNode.js';
const chartClearString = NeuronStrings.chartClear;
const chartTitleString = NeuronStrings.chartTitle;
const chartXAxisLabelString = NeuronStrings.chartXAxisLabel;
const chartYAxisLabelString = NeuronStrings.chartYAxisLabel;

// constants
const GRID_TICK_TEXT_FONT = new PhetFont(8);
const TIME_SPAN = 25; // In seconds.
const MAX_PANEL_WIDTH = 554;
const MIN_DISTANCE_SQUARED_BETWEEN_POINTS = 0.01;

// This value sets the frequency of chart updates, which helps to reduce the processor consumption.
const UPDATE_PERIOD = NeuronConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT; // in seconds of sim time (not wall time)

class MembranePotentialChart extends Node {
  /**
   * @param {Dimension2} chartDimension
   * @param {NeuronClockModelAdapter} neuronClockModelAdapter
   */
  constructor(chartDimension, neuronClockModelAdapter) {
    super();

    // @private
    this.chartDimension = chartDimension;
    this.clock = neuronClockModelAdapter;
    this.neuronModel = neuronClockModelAdapter.model;
    this.updateCountdownTimer = 0; // init to zero so that an update occurs right away
    this.timeIndexOfFirstDataPt = 0;
    this.playingWhenDragStarted = true;
    this.dataSeries = new DynamicSeries({
      color: PhetColorScheme.RED_COLORBLIND
    });
    this.domain = [0, TIME_SPAN];
    this.range = [-100, 100];
    this.mostRecentXValue = 0;
    this.mostRecentYValue = 0;

    // Create the root node for the plot.
    const plotNode = new Node();
    const numVerticalGridLines = 25;
    const numHorizontalGridLines = 8;

    // create a function to generate horizontal labels (The LinearFunction returns a map function which can be used
    // to get the appropriate label value based on the index of each vertical line).
    const domainMap = new LinearFunction(0, numVerticalGridLines, this.domain[0], this.domain[1]);

    // To create Vertical Labels
    // Example:- for the value of 3 it returns a value of -50 and for 5 it returns 0 (because range is -100 to 100)
    const rangeMap = new LinearFunction(0, numHorizontalGridLines, this.range[1], this.range[0]);
    const gridShape = new Shape();

    // vertical grid lines
    for (let i = 0; i < numVerticalGridLines + 1; i++) {
      gridShape.moveTo(i * chartDimension.width / numVerticalGridLines, 0);
      gridShape.lineTo(i * chartDimension.width / numVerticalGridLines, chartDimension.height);
      plotNode.addChild(new Text(domainMap.evaluate(i), {
        font: GRID_TICK_TEXT_FONT,
        //Text controls need to aligned to each grid line based on the line's orientation.
        centerX: i * chartDimension.width / numVerticalGridLines,
        top: chartDimension.height + 6
      }));
    }

    // horizontal grid lines
    for (let i = 0; i < numHorizontalGridLines + 1; i++) {
      gridShape.moveTo(0, i * chartDimension.height / numHorizontalGridLines);
      gridShape.lineTo(chartDimension.width, i * chartDimension.height / numHorizontalGridLines);
      plotNode.addChild(new Text(rangeMap.evaluate(i), {
        font: GRID_TICK_TEXT_FONT,
        centerY: i * chartDimension.height / numHorizontalGridLines,
        right: -6
      }));
    }
    plotNode.addChild(new Path(gridShape, {
      stroke: 'gray',
      lineWidth: 0.6,
      boundsMethod: 'none'
    }));
    neuronClockModelAdapter.registerStepCallback(this.step.bind(this));
    neuronClockModelAdapter.registerResetCallback(() => {
      this.updateOnSimulationReset();
    });
    this.neuronModel.stimulusPulseInitiatedProperty.link(stimulusPulseInitiated => {
      if (stimulusPulseInitiated && !this.neuronModel.isPotentialChartVisible()) {
        // If the chart is not visible, we clear any previous recording.
        this.clearChart();
      }
      if (stimulusPulseInitiated && !this.chartIsFull) {
        // initiate recording
        this.neuronModel.startRecording();
      }
    });

    // title
    const chartTitleNode = new Text(chartTitleString, {
      font: new PhetFont({
        size: 16,
        weight: 'bold'
      }),
      maxWidth: chartDimension.width * 0.5,
      // multiplier empirically determined through testing with long strings
      top: 0
    });

    // clear button
    const clearChartButton = new TextPushButton(chartClearString, {
      font: new PhetFont({
        size: 12
      }),
      maxWidth: 100,
      // empirically determined
      listener: () => {
        if (this.neuronModel.isActionPotentialInProgress()) {
          this.neuronModel.setModeRecord();
        } else {
          this.neuronModel.setModeLive();
        }
        this.clearChart();
      }
    });

    // close button
    const closeButton = new CloseButton({
      iconLength: 12,
      listener: () => {
        this.neuronModel.potentialChartVisibleProperty.set(false);
      }
    });

    // Scale to fit the Title Node within Chart's bounds.
    const maxTitleWidth = chartDimension.width * 0.67;
    const titleNodeScaleFactor = Math.min(1, maxTitleWidth / chartTitleNode.width);
    chartTitleNode.scale(titleNodeScaleFactor);
    const axisLabelFont = {
      font: new PhetFont({
        size: 12
      })
    };
    const chartXAxisLabelNode = new Text(chartXAxisLabelString, axisLabelFont);
    const chartYAxisLabelNode = new Text(chartYAxisLabelString, axisLabelFont);
    chartYAxisLabelNode.rotation = -Math.PI / 2;

    // Scale to fit the Y axis within Chart's bounds
    const yAxisMaxHeight = chartDimension.height;
    const yAxisLabelScaleFactor = Math.min(1, yAxisMaxHeight / (0.8 * chartYAxisLabelNode.height));
    chartYAxisLabelNode.scale(yAxisLabelScaleFactor);

    // use domain(0,25) and range(-100,100) as Model View Map
    this.chartMvt = ModelViewTransform2.createRectangleInvertedYMapping(new Bounds2(this.domain[0], this.range[0], this.domain[1], this.range[1]), new Bounds2(0, 0, chartDimension.width, chartDimension.height), 1, 1);

    // create and add the node that will represent the data line on the chart
    this.dataLineNode = new DataLineCanvasNode(chartDimension.width, chartDimension.height, this.dataSeries, this.chartMvt);
    plotNode.addChild(this.dataLineNode);

    // add the cursor that shows the time value of the neuron state
    this.chartCursor = new ChartCursor(this);
    plotNode.addChild(this.chartCursor);
    neuronClockModelAdapter.playingProperty.link(() => {
      this.updateCursorState();
    });
    this.neuronModel.timeProperty.link(this.updateChartCursor.bind(this));
    this.neuronModel.modeProperty.link(mode => {
      if (mode) {
        this.updateChartCursor.bind(this);
      }
    });
    const xMargin = 12;
    const xSpace = 4;
    // align exactly with clipped area's edges
    const contentWidth = chartYAxisLabelNode.width + plotNode.width + 2 * xMargin + xSpace;
    const adjustMargin = (MAX_PANEL_WIDTH - contentWidth) / 2;

    // Put the chart, title, and controls in a node together and lay them out.
    const plotAndYLabel = new HBox({
      children: [chartYAxisLabelNode, plotNode],
      spacing: xSpace,
      top: Math.max(chartTitleNode.height, clearChartButton.height, closeButton.height),
      resize: false
    });
    const panelContents = new Node();
    chartTitleNode.centerX = plotAndYLabel.width / 2;
    panelContents.addChild(chartTitleNode);
    panelContents.addChild(plotAndYLabel);
    closeButton.right = plotAndYLabel.width;
    panelContents.addChild(closeButton);
    clearChartButton.right = closeButton.left - 10;
    panelContents.addChild(clearChartButton);
    chartXAxisLabelNode.centerX = plotAndYLabel.width / 2;
    chartXAxisLabelNode.top = plotAndYLabel.bottom;
    panelContents.addChild(chartXAxisLabelNode);

    // put everything in a panel
    this.addChild(new Panel(panelContents, {
      fill: 'white',
      xMargin: xMargin + adjustMargin,
      yMargin: 6,
      lineWidth: 1,
      cornerRadius: 2,
      resize: false
    }));
    this.neuronModel.potentialChartVisibleProperty.link(chartVisible => {
      this.visible = chartVisible;
    });
  }

  /**
   * Add a data point to the graph.
   * @param {number} time - time in milliseconds
   * @param {number} voltage - voltage in volts
   * @public
   */
  addDataPoint(time, voltage) {
    let firstDataPoint = false;
    if (this.dataSeries.getLength() === 0) {
      // This is the first data point added since the last time the chart was cleared or since it was created. Record
      // the time index for future reference.
      this.timeIndexOfFirstDataPt = time;
      firstDataPoint = true;
    }

    // compute the x and y values that will be added to the data set if the necessary conditions are met
    const xValue = time - this.timeIndexOfFirstDataPt;
    const yValue = voltage * 1000; // this chart uses millivolts internally

    // Calculate the distance from the most recently added point so that we can add as few points as possible and
    // still get a reasonable looking graph.  This is done as an optimization.
    let distanceFromLastPointSquared = Number.POSITIVE_INFINITY;
    if (!firstDataPoint) {
      distanceFromLastPointSquared = Math.pow(xValue - this.mostRecentXValue, 2) + Math.pow(yValue - this.mostRecentYValue, 2);
    }

    // Add the data point if it is in range, if it is sufficiently far from the previous data point, and if the chart
    // isn't full.
    assert && assert(time - this.timeIndexOfFirstDataPt >= 0);
    if (time - this.timeIndexOfFirstDataPt <= TIME_SPAN && distanceFromLastPointSquared > MIN_DISTANCE_SQUARED_BETWEEN_POINTS) {
      this.dataSeries.addXYDataPoint(xValue, yValue);
      this.mostRecentXValue = xValue;
      this.mostRecentYValue = yValue;
      this.chartIsFull = false;
    } else if (time - this.timeIndexOfFirstDataPt > TIME_SPAN && !this.chartIsFull) {
      // This is the first data point to be received that is outside of the chart's X range.  Add it anyway so that
      // there is no gap in the data shown at the end of the chart.
      this.dataSeries.addXYDataPoint(TIME_SPAN, yValue);
      this.chartIsFull = true;
    }
  }

  /**
   * Get the last time value in the data series.  This is assumed to be the
   * highest time value, since data points are expected to be added in order
   * of increasing time.  If no data is present, 0 is returned.
   * @public
   */
  getLastTimeValue() {
    let timeOfLastDataPoint = 0;
    if (this.dataSeries.hasData()) {
      timeOfLastDataPoint = this.dataSeries.getDataPoint(this.dataSeries.getLength() - 1).x;
    }
    return timeOfLastDataPoint;
  }

  /**
   * Update the chart based on the current time and the model that is being monitored.
   * @param {number} simulationTimeChange - in seconds
   * @public
   */
  step(simulationTimeChange) {
    if (this.neuronModel.isRecord()) {
      if (!this.chartIsFull && simulationTimeChange > 0) {
        this.updateCountdownTimer -= simulationTimeChange;
        const timeInMilliseconds = this.neuronModel.getTime() * 1000;
        if (this.updateCountdownTimer <= 0) {
          this.addDataPoint(timeInMilliseconds, this.neuronModel.getMembranePotential(), true);
          this.updateCountdownTimer = UPDATE_PERIOD;
        } else {
          this.addDataPoint(timeInMilliseconds, this.neuronModel.getMembranePotential(), false);
        }
      }
      if (this.chartIsFull && this.neuronModel.isRecord()) {
        // The chart is full, so it is time to stop recording.
        this.neuronModel.setModeLive();
      }
    }
  }

  // @public
  clearChart() {
    this.dataSeries.clear();
    this.chartIsFull = false;
    this.neuronModel.clearHistory();
    this.updateChartCursorVisibility();
  }

  // @private
  updateChartCursorVisibility() {
    // Deciding whether or not the chart cursor should be visible is a little tricky, so I've tried to make the logic
    // very explicit for easier maintenance.  Basically, any time we are in playback mode and we are somewhere on the
    // chart, or when stepping and recording, the cursor should be seen.
    const timeOnChart = (this.neuronModel.getTime() - this.neuronModel.getMinRecordedTime()) * 1000;
    const isCurrentTimeOnChart = timeOnChart >= 0 && timeOnChart <= TIME_SPAN;
    const chartCursorVisible = isCurrentTimeOnChart && this.dataSeries.hasData();
    this.chartCursor.setVisible(chartCursorVisible);
  }

  // @private - update the position of the chart cursor
  updateChartCursor() {
    this.updateChartCursorVisibility();
    if (this.chartCursor.isVisible()) {
      this.updateChartCursorPos();
    }
  }

  // @private
  updateChartCursorPos() {
    const recordingStartTime = this.neuronModel.getMinRecordedTime();
    const recordingCurrentTime = this.neuronModel.getTime();
    this.moveChartCursorToTime((recordingCurrentTime - recordingStartTime) * 1000);
  }

  // @private
  moveChartCursorToTime(time) {
    this.chartCursor.x = Utils.clamp(this.chartMvt.transformX(time), 0, this.chartDimension.width);
    this.chartCursor.y = this.chartMvt.transformY(this.range[1]);
  }

  // @private
  updateOnSimulationReset() {
    this.neuronModel.setModeLive();
    this.clearChart();
    this.updateChartCursorVisibility();
  }

  // @private
  updateCursorState() {
    this.updateChartCursorPos();
    this.updateChartCursorVisibility();
  }

  /**
   * Used to control the play/pause state of clock, since grabbing the cursor causes the clock to pause.
   * @param {boolean} playing
   * @public
   */
  setPlaying(playing) {
    this.clock.playingProperty.set(playing);
  }
}
neuron.register('MembranePotentialChart', MembranePotentialChart);
export default MembranePotentialChart;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiTGluZWFyRnVuY3Rpb24iLCJVdGlscyIsIkR5bmFtaWNTZXJpZXMiLCJTaGFwZSIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJDbG9zZUJ1dHRvbiIsIlBoZXRDb2xvclNjaGVtZSIsIlBoZXRGb250IiwiSEJveCIsIk5vZGUiLCJQYXRoIiwiVGV4dCIsIlRleHRQdXNoQnV0dG9uIiwiUGFuZWwiLCJuZXVyb24iLCJOZXVyb25TdHJpbmdzIiwiTmV1cm9uQ29uc3RhbnRzIiwiQ2hhcnRDdXJzb3IiLCJEYXRhTGluZUNhbnZhc05vZGUiLCJjaGFydENsZWFyU3RyaW5nIiwiY2hhcnRDbGVhciIsImNoYXJ0VGl0bGVTdHJpbmciLCJjaGFydFRpdGxlIiwiY2hhcnRYQXhpc0xhYmVsU3RyaW5nIiwiY2hhcnRYQXhpc0xhYmVsIiwiY2hhcnRZQXhpc0xhYmVsU3RyaW5nIiwiY2hhcnRZQXhpc0xhYmVsIiwiR1JJRF9USUNLX1RFWFRfRk9OVCIsIlRJTUVfU1BBTiIsIk1BWF9QQU5FTF9XSURUSCIsIk1JTl9ESVNUQU5DRV9TUVVBUkVEX0JFVFdFRU5fUE9JTlRTIiwiVVBEQVRFX1BFUklPRCIsIkRFRkFVTFRfQUNUSU9OX1BPVEVOVElBTF9DTE9DS19EVCIsIk1lbWJyYW5lUG90ZW50aWFsQ2hhcnQiLCJjb25zdHJ1Y3RvciIsImNoYXJ0RGltZW5zaW9uIiwibmV1cm9uQ2xvY2tNb2RlbEFkYXB0ZXIiLCJjbG9jayIsIm5ldXJvbk1vZGVsIiwibW9kZWwiLCJ1cGRhdGVDb3VudGRvd25UaW1lciIsInRpbWVJbmRleE9mRmlyc3REYXRhUHQiLCJwbGF5aW5nV2hlbkRyYWdTdGFydGVkIiwiZGF0YVNlcmllcyIsImNvbG9yIiwiUkVEX0NPTE9SQkxJTkQiLCJkb21haW4iLCJyYW5nZSIsIm1vc3RSZWNlbnRYVmFsdWUiLCJtb3N0UmVjZW50WVZhbHVlIiwicGxvdE5vZGUiLCJudW1WZXJ0aWNhbEdyaWRMaW5lcyIsIm51bUhvcml6b250YWxHcmlkTGluZXMiLCJkb21haW5NYXAiLCJyYW5nZU1hcCIsImdyaWRTaGFwZSIsImkiLCJtb3ZlVG8iLCJ3aWR0aCIsImxpbmVUbyIsImhlaWdodCIsImFkZENoaWxkIiwiZXZhbHVhdGUiLCJmb250IiwiY2VudGVyWCIsInRvcCIsImNlbnRlclkiLCJyaWdodCIsInN0cm9rZSIsImxpbmVXaWR0aCIsImJvdW5kc01ldGhvZCIsInJlZ2lzdGVyU3RlcENhbGxiYWNrIiwic3RlcCIsImJpbmQiLCJyZWdpc3RlclJlc2V0Q2FsbGJhY2siLCJ1cGRhdGVPblNpbXVsYXRpb25SZXNldCIsInN0aW11bHVzUHVsc2VJbml0aWF0ZWRQcm9wZXJ0eSIsImxpbmsiLCJzdGltdWx1c1B1bHNlSW5pdGlhdGVkIiwiaXNQb3RlbnRpYWxDaGFydFZpc2libGUiLCJjbGVhckNoYXJ0IiwiY2hhcnRJc0Z1bGwiLCJzdGFydFJlY29yZGluZyIsImNoYXJ0VGl0bGVOb2RlIiwic2l6ZSIsIndlaWdodCIsIm1heFdpZHRoIiwiY2xlYXJDaGFydEJ1dHRvbiIsImxpc3RlbmVyIiwiaXNBY3Rpb25Qb3RlbnRpYWxJblByb2dyZXNzIiwic2V0TW9kZVJlY29yZCIsInNldE1vZGVMaXZlIiwiY2xvc2VCdXR0b24iLCJpY29uTGVuZ3RoIiwicG90ZW50aWFsQ2hhcnRWaXNpYmxlUHJvcGVydHkiLCJzZXQiLCJtYXhUaXRsZVdpZHRoIiwidGl0bGVOb2RlU2NhbGVGYWN0b3IiLCJNYXRoIiwibWluIiwic2NhbGUiLCJheGlzTGFiZWxGb250IiwiY2hhcnRYQXhpc0xhYmVsTm9kZSIsImNoYXJ0WUF4aXNMYWJlbE5vZGUiLCJyb3RhdGlvbiIsIlBJIiwieUF4aXNNYXhIZWlnaHQiLCJ5QXhpc0xhYmVsU2NhbGVGYWN0b3IiLCJjaGFydE12dCIsImNyZWF0ZVJlY3RhbmdsZUludmVydGVkWU1hcHBpbmciLCJkYXRhTGluZU5vZGUiLCJjaGFydEN1cnNvciIsInBsYXlpbmdQcm9wZXJ0eSIsInVwZGF0ZUN1cnNvclN0YXRlIiwidGltZVByb3BlcnR5IiwidXBkYXRlQ2hhcnRDdXJzb3IiLCJtb2RlUHJvcGVydHkiLCJtb2RlIiwieE1hcmdpbiIsInhTcGFjZSIsImNvbnRlbnRXaWR0aCIsImFkanVzdE1hcmdpbiIsInBsb3RBbmRZTGFiZWwiLCJjaGlsZHJlbiIsInNwYWNpbmciLCJtYXgiLCJyZXNpemUiLCJwYW5lbENvbnRlbnRzIiwibGVmdCIsImJvdHRvbSIsImZpbGwiLCJ5TWFyZ2luIiwiY29ybmVyUmFkaXVzIiwiY2hhcnRWaXNpYmxlIiwidmlzaWJsZSIsImFkZERhdGFQb2ludCIsInRpbWUiLCJ2b2x0YWdlIiwiZmlyc3REYXRhUG9pbnQiLCJnZXRMZW5ndGgiLCJ4VmFsdWUiLCJ5VmFsdWUiLCJkaXN0YW5jZUZyb21MYXN0UG9pbnRTcXVhcmVkIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJwb3ciLCJhc3NlcnQiLCJhZGRYWURhdGFQb2ludCIsImdldExhc3RUaW1lVmFsdWUiLCJ0aW1lT2ZMYXN0RGF0YVBvaW50IiwiaGFzRGF0YSIsImdldERhdGFQb2ludCIsIngiLCJzaW11bGF0aW9uVGltZUNoYW5nZSIsImlzUmVjb3JkIiwidGltZUluTWlsbGlzZWNvbmRzIiwiZ2V0VGltZSIsImdldE1lbWJyYW5lUG90ZW50aWFsIiwiY2xlYXIiLCJjbGVhckhpc3RvcnkiLCJ1cGRhdGVDaGFydEN1cnNvclZpc2liaWxpdHkiLCJ0aW1lT25DaGFydCIsImdldE1pblJlY29yZGVkVGltZSIsImlzQ3VycmVudFRpbWVPbkNoYXJ0IiwiY2hhcnRDdXJzb3JWaXNpYmxlIiwic2V0VmlzaWJsZSIsImlzVmlzaWJsZSIsInVwZGF0ZUNoYXJ0Q3Vyc29yUG9zIiwicmVjb3JkaW5nU3RhcnRUaW1lIiwicmVjb3JkaW5nQ3VycmVudFRpbWUiLCJtb3ZlQ2hhcnRDdXJzb3JUb1RpbWUiLCJjbGFtcCIsInRyYW5zZm9ybVgiLCJ5IiwidHJhbnNmb3JtWSIsInNldFBsYXlpbmciLCJwbGF5aW5nIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNZW1icmFuZVBvdGVudGlhbENoYXJ0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vKipcclxuICogQ2hhcnQgZm9yIGRlcGljdGluZyB0aGUgbWVtYnJhbmUgcG90ZW50aWFsLiAgVGhpcyBpcyBhIE5vZGUsIGFuZCBhcyBzdWNoIGlzIGludGVuZGVkIGZvciB1c2UgcHJpbWFyaWx5IGluIHRoZSBwbGF5XHJcbiAqIGFyZWEuXHJcbiAqXHJcbiAqIE9yaWdpbmFsbHksIHRoaXMgY2hhcnQgd2FzIGRlc2lnbmVkIHRvIHNjcm9sbCBvbmNlIHRoZXJlIHdhcyBlbm91Z2ggZGF0YSB0aGUgZmlsbCB0aGUgY2hhcnQgaGFsZiB3YXksIGJ1dCB0aGlzXHJcbiAqIHR1cm5lZCBvdXQgdG8gYmUgdG9vIENQVSBpbnRlbnNpdmUsIHNvIGl0IHdhcyBjaGFuZ2VkIHRvIGRyYXcgb25lIGxpbmUgb2YgZGF0YSBhY3Jvc3MgdGhlIHNjcmVlbiBhbmQgdGhlbiBzdG9wLiBUaGVcclxuICogdXNlciBjYW4gY2xlYXIgdGhlIGNoYXJ0IGFuZCB0cmlnZ2VyIGFub3RoZXIgYWN0aW9uIHBvdGVudGlhbCB0byBzdGFydCByZWNvcmRpbmcgZGF0YSBhZ2Fpbi5cclxuICpcclxuICogVGhpcyBjaGFydCBjYW4gYWxzbyBiZSB1c2VkIHRvIGNvbnRyb2wgdGhlIHJlY29yZC1hbmQtcGxheWJhY2sgc3RhdGUgb2YgdGhlIG1vZGVsLiAgVGhpcyBpcyBkb25lIHNvIHRoYXQgdGhlIHdpbmRvd1xyXG4gKiBvZiByZWNvcmRlZCBkYXRhIGluIHRoZSBtb2RlbCBtYXRjaGVzIHRoYXQgc2hvd24gaW4gdGhlIGNoYXJ0LCBhbGxvd2luZyB0aGUgdXNlciB0byBzZXQgdGhlIG1vZGVsIHN0YXRlIHRvIGFueSB0aW1lXHJcbiAqIHNob3duIGluIHRoZSBjaGFydC5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmIChmb3IgR2hlbnQgVW5pdmVyc2l0eSlcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBMaW5lYXJGdW5jdGlvbiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvTGluZWFyRnVuY3Rpb24uanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IER5bmFtaWNTZXJpZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZ3JpZGRsZS9qcy9EeW5hbWljU2VyaWVzLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBDbG9zZUJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9DbG9zZUJ1dHRvbi5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBOb2RlLCBQYXRoLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRleHRQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1RleHRQdXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBuZXVyb24gZnJvbSAnLi4vLi4vLi4vbmV1cm9uLmpzJztcclxuaW1wb3J0IE5ldXJvblN0cmluZ3MgZnJvbSAnLi4vLi4vLi4vTmV1cm9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBOZXVyb25Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL05ldXJvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBDaGFydEN1cnNvciBmcm9tICcuL0NoYXJ0Q3Vyc29yLmpzJztcclxuaW1wb3J0IERhdGFMaW5lQ2FudmFzTm9kZSBmcm9tICcuL0RhdGFMaW5lQ2FudmFzTm9kZS5qcyc7XHJcblxyXG5jb25zdCBjaGFydENsZWFyU3RyaW5nID0gTmV1cm9uU3RyaW5ncy5jaGFydENsZWFyO1xyXG5jb25zdCBjaGFydFRpdGxlU3RyaW5nID0gTmV1cm9uU3RyaW5ncy5jaGFydFRpdGxlO1xyXG5jb25zdCBjaGFydFhBeGlzTGFiZWxTdHJpbmcgPSBOZXVyb25TdHJpbmdzLmNoYXJ0WEF4aXNMYWJlbDtcclxuY29uc3QgY2hhcnRZQXhpc0xhYmVsU3RyaW5nID0gTmV1cm9uU3RyaW5ncy5jaGFydFlBeGlzTGFiZWw7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgR1JJRF9USUNLX1RFWFRfRk9OVCA9IG5ldyBQaGV0Rm9udCggOCApO1xyXG5jb25zdCBUSU1FX1NQQU4gPSAyNTsgLy8gSW4gc2Vjb25kcy5cclxuY29uc3QgTUFYX1BBTkVMX1dJRFRIID0gNTU0O1xyXG5jb25zdCBNSU5fRElTVEFOQ0VfU1FVQVJFRF9CRVRXRUVOX1BPSU5UUyA9IDAuMDE7XHJcblxyXG4vLyBUaGlzIHZhbHVlIHNldHMgdGhlIGZyZXF1ZW5jeSBvZiBjaGFydCB1cGRhdGVzLCB3aGljaCBoZWxwcyB0byByZWR1Y2UgdGhlIHByb2Nlc3NvciBjb25zdW1wdGlvbi5cclxuY29uc3QgVVBEQVRFX1BFUklPRCA9IE5ldXJvbkNvbnN0YW50cy5ERUZBVUxUX0FDVElPTl9QT1RFTlRJQUxfQ0xPQ0tfRFQ7IC8vIGluIHNlY29uZHMgb2Ygc2ltIHRpbWUgKG5vdCB3YWxsIHRpbWUpXHJcblxyXG5jbGFzcyBNZW1icmFuZVBvdGVudGlhbENoYXJ0IGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RGltZW5zaW9uMn0gY2hhcnREaW1lbnNpb25cclxuICAgKiBAcGFyYW0ge05ldXJvbkNsb2NrTW9kZWxBZGFwdGVyfSBuZXVyb25DbG9ja01vZGVsQWRhcHRlclxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjaGFydERpbWVuc2lvbiwgbmV1cm9uQ2xvY2tNb2RlbEFkYXB0ZXIgKSB7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5jaGFydERpbWVuc2lvbiA9IGNoYXJ0RGltZW5zaW9uO1xyXG4gICAgdGhpcy5jbG9jayA9IG5ldXJvbkNsb2NrTW9kZWxBZGFwdGVyO1xyXG4gICAgdGhpcy5uZXVyb25Nb2RlbCA9IG5ldXJvbkNsb2NrTW9kZWxBZGFwdGVyLm1vZGVsO1xyXG4gICAgdGhpcy51cGRhdGVDb3VudGRvd25UaW1lciA9IDA7IC8vIGluaXQgdG8gemVybyBzbyB0aGF0IGFuIHVwZGF0ZSBvY2N1cnMgcmlnaHQgYXdheVxyXG4gICAgdGhpcy50aW1lSW5kZXhPZkZpcnN0RGF0YVB0ID0gMDtcclxuICAgIHRoaXMucGxheWluZ1doZW5EcmFnU3RhcnRlZCA9IHRydWU7XHJcbiAgICB0aGlzLmRhdGFTZXJpZXMgPSBuZXcgRHluYW1pY1Nlcmllcygge1xyXG4gICAgICBjb2xvcjogUGhldENvbG9yU2NoZW1lLlJFRF9DT0xPUkJMSU5EXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmRvbWFpbiA9IFsgMCwgVElNRV9TUEFOIF07XHJcbiAgICB0aGlzLnJhbmdlID0gWyAtMTAwLCAxMDAgXTtcclxuICAgIHRoaXMubW9zdFJlY2VudFhWYWx1ZSA9IDA7XHJcbiAgICB0aGlzLm1vc3RSZWNlbnRZVmFsdWUgPSAwO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgcm9vdCBub2RlIGZvciB0aGUgcGxvdC5cclxuICAgIGNvbnN0IHBsb3ROb2RlID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICBjb25zdCBudW1WZXJ0aWNhbEdyaWRMaW5lcyA9IDI1O1xyXG4gICAgY29uc3QgbnVtSG9yaXpvbnRhbEdyaWRMaW5lcyA9IDg7XHJcblxyXG4gICAgLy8gY3JlYXRlIGEgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgaG9yaXpvbnRhbCBsYWJlbHMgKFRoZSBMaW5lYXJGdW5jdGlvbiByZXR1cm5zIGEgbWFwIGZ1bmN0aW9uIHdoaWNoIGNhbiBiZSB1c2VkXHJcbiAgICAvLyB0byBnZXQgdGhlIGFwcHJvcHJpYXRlIGxhYmVsIHZhbHVlIGJhc2VkIG9uIHRoZSBpbmRleCBvZiBlYWNoIHZlcnRpY2FsIGxpbmUpLlxyXG4gICAgY29uc3QgZG9tYWluTWFwID0gbmV3IExpbmVhckZ1bmN0aW9uKCAwLCBudW1WZXJ0aWNhbEdyaWRMaW5lcywgdGhpcy5kb21haW5bIDAgXSwgdGhpcy5kb21haW5bIDEgXSApO1xyXG5cclxuICAgIC8vIFRvIGNyZWF0ZSBWZXJ0aWNhbCBMYWJlbHNcclxuICAgIC8vIEV4YW1wbGU6LSBmb3IgdGhlIHZhbHVlIG9mIDMgaXQgcmV0dXJucyBhIHZhbHVlIG9mIC01MCBhbmQgZm9yIDUgaXQgcmV0dXJucyAwIChiZWNhdXNlIHJhbmdlIGlzIC0xMDAgdG8gMTAwKVxyXG4gICAgY29uc3QgcmFuZ2VNYXAgPSBuZXcgTGluZWFyRnVuY3Rpb24oIDAsIG51bUhvcml6b250YWxHcmlkTGluZXMsIHRoaXMucmFuZ2VbIDEgXSwgdGhpcy5yYW5nZVsgMCBdICk7XHJcblxyXG4gICAgY29uc3QgZ3JpZFNoYXBlID0gbmV3IFNoYXBlKCk7XHJcblxyXG4gICAgLy8gdmVydGljYWwgZ3JpZCBsaW5lc1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtVmVydGljYWxHcmlkTGluZXMgKyAxOyBpKysgKSB7XHJcbiAgICAgIGdyaWRTaGFwZS5tb3ZlVG8oIGkgKiBjaGFydERpbWVuc2lvbi53aWR0aCAvIG51bVZlcnRpY2FsR3JpZExpbmVzLCAwICk7XHJcbiAgICAgIGdyaWRTaGFwZS5saW5lVG8oIGkgKiBjaGFydERpbWVuc2lvbi53aWR0aCAvIG51bVZlcnRpY2FsR3JpZExpbmVzLCBjaGFydERpbWVuc2lvbi5oZWlnaHQgKTtcclxuICAgICAgcGxvdE5vZGUuYWRkQ2hpbGQoIG5ldyBUZXh0KCBkb21haW5NYXAuZXZhbHVhdGUoIGkgKSwge1xyXG4gICAgICAgIGZvbnQ6IEdSSURfVElDS19URVhUX0ZPTlQsXHJcbiAgICAgICAgLy9UZXh0IGNvbnRyb2xzIG5lZWQgdG8gYWxpZ25lZCB0byBlYWNoIGdyaWQgbGluZSBiYXNlZCBvbiB0aGUgbGluZSdzIG9yaWVudGF0aW9uLlxyXG4gICAgICAgIGNlbnRlclg6IGkgKiBjaGFydERpbWVuc2lvbi53aWR0aCAvIG51bVZlcnRpY2FsR3JpZExpbmVzLFxyXG4gICAgICAgIHRvcDogY2hhcnREaW1lbnNpb24uaGVpZ2h0ICsgNlxyXG4gICAgICB9ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBob3Jpem9udGFsIGdyaWQgbGluZXNcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bUhvcml6b250YWxHcmlkTGluZXMgKyAxOyBpKysgKSB7XHJcbiAgICAgIGdyaWRTaGFwZS5tb3ZlVG8oIDAsIGkgKiBjaGFydERpbWVuc2lvbi5oZWlnaHQgLyBudW1Ib3Jpem9udGFsR3JpZExpbmVzICk7XHJcbiAgICAgIGdyaWRTaGFwZS5saW5lVG8oIGNoYXJ0RGltZW5zaW9uLndpZHRoLCBpICogY2hhcnREaW1lbnNpb24uaGVpZ2h0IC8gbnVtSG9yaXpvbnRhbEdyaWRMaW5lcyApO1xyXG4gICAgICBwbG90Tm9kZS5hZGRDaGlsZCggbmV3IFRleHQoIHJhbmdlTWFwLmV2YWx1YXRlKCBpICksIHtcclxuICAgICAgICBmb250OiBHUklEX1RJQ0tfVEVYVF9GT05ULFxyXG4gICAgICAgIGNlbnRlclk6IGkgKiBjaGFydERpbWVuc2lvbi5oZWlnaHQgLyBudW1Ib3Jpem9udGFsR3JpZExpbmVzLFxyXG4gICAgICAgIHJpZ2h0OiAtNlxyXG4gICAgICB9ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBwbG90Tm9kZS5hZGRDaGlsZCggbmV3IFBhdGgoIGdyaWRTaGFwZSwgeyBzdHJva2U6ICdncmF5JywgbGluZVdpZHRoOiAwLjYsIGJvdW5kc01ldGhvZDogJ25vbmUnIH0gKSApO1xyXG5cclxuICAgIG5ldXJvbkNsb2NrTW9kZWxBZGFwdGVyLnJlZ2lzdGVyU3RlcENhbGxiYWNrKCB0aGlzLnN0ZXAuYmluZCggdGhpcyApICk7XHJcblxyXG4gICAgbmV1cm9uQ2xvY2tNb2RlbEFkYXB0ZXIucmVnaXN0ZXJSZXNldENhbGxiYWNrKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMudXBkYXRlT25TaW11bGF0aW9uUmVzZXQoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm5ldXJvbk1vZGVsLnN0aW11bHVzUHVsc2VJbml0aWF0ZWRQcm9wZXJ0eS5saW5rKCBzdGltdWx1c1B1bHNlSW5pdGlhdGVkID0+IHtcclxuICAgICAgaWYgKCBzdGltdWx1c1B1bHNlSW5pdGlhdGVkICYmICF0aGlzLm5ldXJvbk1vZGVsLmlzUG90ZW50aWFsQ2hhcnRWaXNpYmxlKCkgKSB7XHJcbiAgICAgICAgLy8gSWYgdGhlIGNoYXJ0IGlzIG5vdCB2aXNpYmxlLCB3ZSBjbGVhciBhbnkgcHJldmlvdXMgcmVjb3JkaW5nLlxyXG4gICAgICAgIHRoaXMuY2xlYXJDaGFydCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggc3RpbXVsdXNQdWxzZUluaXRpYXRlZCAmJiAhdGhpcy5jaGFydElzRnVsbCApIHtcclxuICAgICAgICAvLyBpbml0aWF0ZSByZWNvcmRpbmdcclxuICAgICAgICB0aGlzLm5ldXJvbk1vZGVsLnN0YXJ0UmVjb3JkaW5nKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB0aXRsZVxyXG4gICAgY29uc3QgY2hhcnRUaXRsZU5vZGUgPSBuZXcgVGV4dCggY2hhcnRUaXRsZVN0cmluZywge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTYsIHdlaWdodDogJ2JvbGQnIH0gKSxcclxuICAgICAgbWF4V2lkdGg6IGNoYXJ0RGltZW5zaW9uLndpZHRoICogMC41LCAvLyBtdWx0aXBsaWVyIGVtcGlyaWNhbGx5IGRldGVybWluZWQgdGhyb3VnaCB0ZXN0aW5nIHdpdGggbG9uZyBzdHJpbmdzXHJcbiAgICAgIHRvcDogMFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNsZWFyIGJ1dHRvblxyXG4gICAgY29uc3QgY2xlYXJDaGFydEJ1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggY2hhcnRDbGVhclN0cmluZywge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTIgfSApLFxyXG4gICAgICBtYXhXaWR0aDogMTAwLCAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCB0aGlzLm5ldXJvbk1vZGVsLmlzQWN0aW9uUG90ZW50aWFsSW5Qcm9ncmVzcygpICkge1xyXG4gICAgICAgICAgdGhpcy5uZXVyb25Nb2RlbC5zZXRNb2RlUmVjb3JkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5uZXVyb25Nb2RlbC5zZXRNb2RlTGl2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNsZWFyQ2hhcnQoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNsb3NlIGJ1dHRvblxyXG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBuZXcgQ2xvc2VCdXR0b24oIHtcclxuICAgICAgaWNvbkxlbmd0aDogMTIsXHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5uZXVyb25Nb2RlbC5wb3RlbnRpYWxDaGFydFZpc2libGVQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTY2FsZSB0byBmaXQgdGhlIFRpdGxlIE5vZGUgd2l0aGluIENoYXJ0J3MgYm91bmRzLlxyXG4gICAgY29uc3QgbWF4VGl0bGVXaWR0aCA9IGNoYXJ0RGltZW5zaW9uLndpZHRoICogMC42NztcclxuICAgIGNvbnN0IHRpdGxlTm9kZVNjYWxlRmFjdG9yID0gTWF0aC5taW4oIDEsIG1heFRpdGxlV2lkdGggLyBjaGFydFRpdGxlTm9kZS53aWR0aCApO1xyXG4gICAgY2hhcnRUaXRsZU5vZGUuc2NhbGUoIHRpdGxlTm9kZVNjYWxlRmFjdG9yICk7XHJcblxyXG4gICAgY29uc3QgYXhpc0xhYmVsRm9udCA9IHsgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDEyIH0gKSB9O1xyXG4gICAgY29uc3QgY2hhcnRYQXhpc0xhYmVsTm9kZSA9IG5ldyBUZXh0KCBjaGFydFhBeGlzTGFiZWxTdHJpbmcsIGF4aXNMYWJlbEZvbnQgKTtcclxuICAgIGNvbnN0IGNoYXJ0WUF4aXNMYWJlbE5vZGUgPSBuZXcgVGV4dCggY2hhcnRZQXhpc0xhYmVsU3RyaW5nLCBheGlzTGFiZWxGb250ICk7XHJcbiAgICBjaGFydFlBeGlzTGFiZWxOb2RlLnJvdGF0aW9uID0gLU1hdGguUEkgLyAyO1xyXG5cclxuICAgIC8vIFNjYWxlIHRvIGZpdCB0aGUgWSBheGlzIHdpdGhpbiBDaGFydCdzIGJvdW5kc1xyXG4gICAgY29uc3QgeUF4aXNNYXhIZWlnaHQgPSBjaGFydERpbWVuc2lvbi5oZWlnaHQ7XHJcbiAgICBjb25zdCB5QXhpc0xhYmVsU2NhbGVGYWN0b3IgPSBNYXRoLm1pbiggMSwgeUF4aXNNYXhIZWlnaHQgLyAoIDAuOCAqIGNoYXJ0WUF4aXNMYWJlbE5vZGUuaGVpZ2h0ICkgKTtcclxuICAgIGNoYXJ0WUF4aXNMYWJlbE5vZGUuc2NhbGUoIHlBeGlzTGFiZWxTY2FsZUZhY3RvciApO1xyXG5cclxuICAgIC8vIHVzZSBkb21haW4oMCwyNSkgYW5kIHJhbmdlKC0xMDAsMTAwKSBhcyBNb2RlbCBWaWV3IE1hcFxyXG4gICAgdGhpcy5jaGFydE12dCA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlUmVjdGFuZ2xlSW52ZXJ0ZWRZTWFwcGluZyggbmV3IEJvdW5kczIoIHRoaXMuZG9tYWluWyAwIF0sIHRoaXMucmFuZ2VbIDAgXSxcclxuICAgICAgdGhpcy5kb21haW5bIDEgXSwgdGhpcy5yYW5nZVsgMSBdICksIG5ldyBCb3VuZHMyKCAwLCAwLCBjaGFydERpbWVuc2lvbi53aWR0aCwgY2hhcnREaW1lbnNpb24uaGVpZ2h0ICksIDEsIDEgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW5kIGFkZCB0aGUgbm9kZSB0aGF0IHdpbGwgcmVwcmVzZW50IHRoZSBkYXRhIGxpbmUgb24gdGhlIGNoYXJ0XHJcbiAgICB0aGlzLmRhdGFMaW5lTm9kZSA9IG5ldyBEYXRhTGluZUNhbnZhc05vZGUoIGNoYXJ0RGltZW5zaW9uLndpZHRoLCBjaGFydERpbWVuc2lvbi5oZWlnaHQsIHRoaXMuZGF0YVNlcmllcywgdGhpcy5jaGFydE12dCApO1xyXG4gICAgcGxvdE5vZGUuYWRkQ2hpbGQoIHRoaXMuZGF0YUxpbmVOb2RlICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBjdXJzb3IgdGhhdCBzaG93cyB0aGUgdGltZSB2YWx1ZSBvZiB0aGUgbmV1cm9uIHN0YXRlXHJcbiAgICB0aGlzLmNoYXJ0Q3Vyc29yID0gbmV3IENoYXJ0Q3Vyc29yKCB0aGlzICk7XHJcbiAgICBwbG90Tm9kZS5hZGRDaGlsZCggdGhpcy5jaGFydEN1cnNvciApO1xyXG5cclxuICAgIG5ldXJvbkNsb2NrTW9kZWxBZGFwdGVyLnBsYXlpbmdQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMudXBkYXRlQ3Vyc29yU3RhdGUoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm5ldXJvbk1vZGVsLnRpbWVQcm9wZXJ0eS5saW5rKCB0aGlzLnVwZGF0ZUNoYXJ0Q3Vyc29yLmJpbmQoIHRoaXMgKSApO1xyXG4gICAgdGhpcy5uZXVyb25Nb2RlbC5tb2RlUHJvcGVydHkubGluayggbW9kZSA9PiB7XHJcbiAgICAgIGlmICggbW9kZSApIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZUNoYXJ0Q3Vyc29yLmJpbmQoIHRoaXMgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHhNYXJnaW4gPSAxMjtcclxuICAgIGNvbnN0IHhTcGFjZSA9IDQ7XHJcbiAgICAvLyBhbGlnbiBleGFjdGx5IHdpdGggY2xpcHBlZCBhcmVhJ3MgZWRnZXNcclxuICAgIGNvbnN0IGNvbnRlbnRXaWR0aCA9IGNoYXJ0WUF4aXNMYWJlbE5vZGUud2lkdGggKyBwbG90Tm9kZS53aWR0aCArICggMiAqIHhNYXJnaW4gKSArIHhTcGFjZTtcclxuICAgIGNvbnN0IGFkanVzdE1hcmdpbiA9ICggTUFYX1BBTkVMX1dJRFRIIC0gY29udGVudFdpZHRoICkgLyAyO1xyXG5cclxuICAgIC8vIFB1dCB0aGUgY2hhcnQsIHRpdGxlLCBhbmQgY29udHJvbHMgaW4gYSBub2RlIHRvZ2V0aGVyIGFuZCBsYXkgdGhlbSBvdXQuXHJcbiAgICBjb25zdCBwbG90QW5kWUxhYmVsID0gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgY2hhcnRZQXhpc0xhYmVsTm9kZSwgcGxvdE5vZGUgXSxcclxuICAgICAgc3BhY2luZzogeFNwYWNlLFxyXG4gICAgICB0b3A6IE1hdGgubWF4KCBjaGFydFRpdGxlTm9kZS5oZWlnaHQsIGNsZWFyQ2hhcnRCdXR0b24uaGVpZ2h0LCBjbG9zZUJ1dHRvbi5oZWlnaHQgKSxcclxuICAgICAgcmVzaXplOiBmYWxzZVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgcGFuZWxDb250ZW50cyA9IG5ldyBOb2RlKCk7XHJcbiAgICBjaGFydFRpdGxlTm9kZS5jZW50ZXJYID0gcGxvdEFuZFlMYWJlbC53aWR0aCAvIDI7XHJcbiAgICBwYW5lbENvbnRlbnRzLmFkZENoaWxkKCBjaGFydFRpdGxlTm9kZSApO1xyXG4gICAgcGFuZWxDb250ZW50cy5hZGRDaGlsZCggcGxvdEFuZFlMYWJlbCApO1xyXG4gICAgY2xvc2VCdXR0b24ucmlnaHQgPSBwbG90QW5kWUxhYmVsLndpZHRoO1xyXG4gICAgcGFuZWxDb250ZW50cy5hZGRDaGlsZCggY2xvc2VCdXR0b24gKTtcclxuICAgIGNsZWFyQ2hhcnRCdXR0b24ucmlnaHQgPSBjbG9zZUJ1dHRvbi5sZWZ0IC0gMTA7XHJcbiAgICBwYW5lbENvbnRlbnRzLmFkZENoaWxkKCBjbGVhckNoYXJ0QnV0dG9uICk7XHJcbiAgICBjaGFydFhBeGlzTGFiZWxOb2RlLmNlbnRlclggPSBwbG90QW5kWUxhYmVsLndpZHRoIC8gMjtcclxuICAgIGNoYXJ0WEF4aXNMYWJlbE5vZGUudG9wID0gcGxvdEFuZFlMYWJlbC5ib3R0b207XHJcbiAgICBwYW5lbENvbnRlbnRzLmFkZENoaWxkKCBjaGFydFhBeGlzTGFiZWxOb2RlICk7XHJcblxyXG4gICAgLy8gcHV0IGV2ZXJ5dGhpbmcgaW4gYSBwYW5lbFxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFBhbmVsKCBwYW5lbENvbnRlbnRzLCB7XHJcbiAgICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgICB4TWFyZ2luOiB4TWFyZ2luICsgYWRqdXN0TWFyZ2luLFxyXG4gICAgICAgIHlNYXJnaW46IDYsXHJcbiAgICAgICAgbGluZVdpZHRoOiAxLFxyXG4gICAgICAgIGNvcm5lclJhZGl1czogMixcclxuICAgICAgICByZXNpemU6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgICkgKTtcclxuXHJcbiAgICB0aGlzLm5ldXJvbk1vZGVsLnBvdGVudGlhbENoYXJ0VmlzaWJsZVByb3BlcnR5LmxpbmsoIGNoYXJ0VmlzaWJsZSA9PiB7XHJcbiAgICAgIHRoaXMudmlzaWJsZSA9IGNoYXJ0VmlzaWJsZTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhIGRhdGEgcG9pbnQgdG8gdGhlIGdyYXBoLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lIC0gdGltZSBpbiBtaWxsaXNlY29uZHNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdm9sdGFnZSAtIHZvbHRhZ2UgaW4gdm9sdHNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYWRkRGF0YVBvaW50KCB0aW1lLCB2b2x0YWdlICkge1xyXG4gICAgbGV0IGZpcnN0RGF0YVBvaW50ID0gZmFsc2U7XHJcbiAgICBpZiAoIHRoaXMuZGF0YVNlcmllcy5nZXRMZW5ndGgoKSA9PT0gMCApIHtcclxuICAgICAgLy8gVGhpcyBpcyB0aGUgZmlyc3QgZGF0YSBwb2ludCBhZGRlZCBzaW5jZSB0aGUgbGFzdCB0aW1lIHRoZSBjaGFydCB3YXMgY2xlYXJlZCBvciBzaW5jZSBpdCB3YXMgY3JlYXRlZC4gUmVjb3JkXHJcbiAgICAgIC8vIHRoZSB0aW1lIGluZGV4IGZvciBmdXR1cmUgcmVmZXJlbmNlLlxyXG4gICAgICB0aGlzLnRpbWVJbmRleE9mRmlyc3REYXRhUHQgPSB0aW1lO1xyXG4gICAgICBmaXJzdERhdGFQb2ludCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY29tcHV0ZSB0aGUgeCBhbmQgeSB2YWx1ZXMgdGhhdCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBkYXRhIHNldCBpZiB0aGUgbmVjZXNzYXJ5IGNvbmRpdGlvbnMgYXJlIG1ldFxyXG4gICAgY29uc3QgeFZhbHVlID0gdGltZSAtIHRoaXMudGltZUluZGV4T2ZGaXJzdERhdGFQdDtcclxuICAgIGNvbnN0IHlWYWx1ZSA9IHZvbHRhZ2UgKiAxMDAwOyAvLyB0aGlzIGNoYXJ0IHVzZXMgbWlsbGl2b2x0cyBpbnRlcm5hbGx5XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBkaXN0YW5jZSBmcm9tIHRoZSBtb3N0IHJlY2VudGx5IGFkZGVkIHBvaW50IHNvIHRoYXQgd2UgY2FuIGFkZCBhcyBmZXcgcG9pbnRzIGFzIHBvc3NpYmxlIGFuZFxyXG4gICAgLy8gc3RpbGwgZ2V0IGEgcmVhc29uYWJsZSBsb29raW5nIGdyYXBoLiAgVGhpcyBpcyBkb25lIGFzIGFuIG9wdGltaXphdGlvbi5cclxuICAgIGxldCBkaXN0YW5jZUZyb21MYXN0UG9pbnRTcXVhcmVkID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgaWYgKCAhZmlyc3REYXRhUG9pbnQgKSB7XHJcbiAgICAgIGRpc3RhbmNlRnJvbUxhc3RQb2ludFNxdWFyZWQgPSBNYXRoLnBvdyggeFZhbHVlIC0gdGhpcy5tb3N0UmVjZW50WFZhbHVlLCAyICkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5wb3coIHlWYWx1ZSAtIHRoaXMubW9zdFJlY2VudFlWYWx1ZSwgMiApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCB0aGUgZGF0YSBwb2ludCBpZiBpdCBpcyBpbiByYW5nZSwgaWYgaXQgaXMgc3VmZmljaWVudGx5IGZhciBmcm9tIHRoZSBwcmV2aW91cyBkYXRhIHBvaW50LCBhbmQgaWYgdGhlIGNoYXJ0XHJcbiAgICAvLyBpc24ndCBmdWxsLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGltZSAtIHRoaXMudGltZUluZGV4T2ZGaXJzdERhdGFQdCA+PSAwICk7XHJcbiAgICBpZiAoIHRpbWUgLSB0aGlzLnRpbWVJbmRleE9mRmlyc3REYXRhUHQgPD0gVElNRV9TUEFOICYmIGRpc3RhbmNlRnJvbUxhc3RQb2ludFNxdWFyZWQgPiBNSU5fRElTVEFOQ0VfU1FVQVJFRF9CRVRXRUVOX1BPSU5UUyApIHtcclxuICAgICAgdGhpcy5kYXRhU2VyaWVzLmFkZFhZRGF0YVBvaW50KCB4VmFsdWUsIHlWYWx1ZSApO1xyXG4gICAgICB0aGlzLm1vc3RSZWNlbnRYVmFsdWUgPSB4VmFsdWU7XHJcbiAgICAgIHRoaXMubW9zdFJlY2VudFlWYWx1ZSA9IHlWYWx1ZTtcclxuICAgICAgdGhpcy5jaGFydElzRnVsbCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRpbWUgLSB0aGlzLnRpbWVJbmRleE9mRmlyc3REYXRhUHQgPiBUSU1FX1NQQU4gJiYgIXRoaXMuY2hhcnRJc0Z1bGwgKSB7XHJcblxyXG4gICAgICAvLyBUaGlzIGlzIHRoZSBmaXJzdCBkYXRhIHBvaW50IHRvIGJlIHJlY2VpdmVkIHRoYXQgaXMgb3V0c2lkZSBvZiB0aGUgY2hhcnQncyBYIHJhbmdlLiAgQWRkIGl0IGFueXdheSBzbyB0aGF0XHJcbiAgICAgIC8vIHRoZXJlIGlzIG5vIGdhcCBpbiB0aGUgZGF0YSBzaG93biBhdCB0aGUgZW5kIG9mIHRoZSBjaGFydC5cclxuICAgICAgdGhpcy5kYXRhU2VyaWVzLmFkZFhZRGF0YVBvaW50KCBUSU1FX1NQQU4sIHlWYWx1ZSApO1xyXG4gICAgICB0aGlzLmNoYXJ0SXNGdWxsID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgbGFzdCB0aW1lIHZhbHVlIGluIHRoZSBkYXRhIHNlcmllcy4gIFRoaXMgaXMgYXNzdW1lZCB0byBiZSB0aGVcclxuICAgKiBoaWdoZXN0IHRpbWUgdmFsdWUsIHNpbmNlIGRhdGEgcG9pbnRzIGFyZSBleHBlY3RlZCB0byBiZSBhZGRlZCBpbiBvcmRlclxyXG4gICAqIG9mIGluY3JlYXNpbmcgdGltZS4gIElmIG5vIGRhdGEgaXMgcHJlc2VudCwgMCBpcyByZXR1cm5lZC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TGFzdFRpbWVWYWx1ZSgpIHtcclxuICAgIGxldCB0aW1lT2ZMYXN0RGF0YVBvaW50ID0gMDtcclxuICAgIGlmICggdGhpcy5kYXRhU2VyaWVzLmhhc0RhdGEoKSApIHtcclxuICAgICAgdGltZU9mTGFzdERhdGFQb2ludCA9IHRoaXMuZGF0YVNlcmllcy5nZXREYXRhUG9pbnQoIHRoaXMuZGF0YVNlcmllcy5nZXRMZW5ndGgoKSAtIDEgKS54O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRpbWVPZkxhc3REYXRhUG9pbnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIGNoYXJ0IGJhc2VkIG9uIHRoZSBjdXJyZW50IHRpbWUgYW5kIHRoZSBtb2RlbCB0aGF0IGlzIGJlaW5nIG1vbml0b3JlZC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gc2ltdWxhdGlvblRpbWVDaGFuZ2UgLSBpbiBzZWNvbmRzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIHNpbXVsYXRpb25UaW1lQ2hhbmdlICkge1xyXG4gICAgaWYgKCB0aGlzLm5ldXJvbk1vZGVsLmlzUmVjb3JkKCkgKSB7XHJcbiAgICAgIGlmICggIXRoaXMuY2hhcnRJc0Z1bGwgJiYgc2ltdWxhdGlvblRpbWVDaGFuZ2UgPiAwICkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlQ291bnRkb3duVGltZXIgLT0gc2ltdWxhdGlvblRpbWVDaGFuZ2U7XHJcblxyXG4gICAgICAgIGNvbnN0IHRpbWVJbk1pbGxpc2Vjb25kcyA9IHRoaXMubmV1cm9uTW9kZWwuZ2V0VGltZSgpICogMTAwMDtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLnVwZGF0ZUNvdW50ZG93blRpbWVyIDw9IDAgKSB7XHJcbiAgICAgICAgICB0aGlzLmFkZERhdGFQb2ludCggdGltZUluTWlsbGlzZWNvbmRzLCB0aGlzLm5ldXJvbk1vZGVsLmdldE1lbWJyYW5lUG90ZW50aWFsKCksIHRydWUgKTtcclxuICAgICAgICAgIHRoaXMudXBkYXRlQ291bnRkb3duVGltZXIgPSBVUERBVEVfUEVSSU9EO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuYWRkRGF0YVBvaW50KCB0aW1lSW5NaWxsaXNlY29uZHMsIHRoaXMubmV1cm9uTW9kZWwuZ2V0TWVtYnJhbmVQb3RlbnRpYWwoKSwgZmFsc2UgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggdGhpcy5jaGFydElzRnVsbCAmJiB0aGlzLm5ldXJvbk1vZGVsLmlzUmVjb3JkKCkgKSB7XHJcbiAgICAgICAgLy8gVGhlIGNoYXJ0IGlzIGZ1bGwsIHNvIGl0IGlzIHRpbWUgdG8gc3RvcCByZWNvcmRpbmcuXHJcbiAgICAgICAgdGhpcy5uZXVyb25Nb2RlbC5zZXRNb2RlTGl2ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgY2xlYXJDaGFydCgpIHtcclxuICAgIHRoaXMuZGF0YVNlcmllcy5jbGVhcigpO1xyXG4gICAgdGhpcy5jaGFydElzRnVsbCA9IGZhbHNlO1xyXG4gICAgdGhpcy5uZXVyb25Nb2RlbC5jbGVhckhpc3RvcnkoKTtcclxuICAgIHRoaXMudXBkYXRlQ2hhcnRDdXJzb3JWaXNpYmlsaXR5KCk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZVxyXG4gIHVwZGF0ZUNoYXJ0Q3Vyc29yVmlzaWJpbGl0eSgpIHtcclxuXHJcbiAgICAvLyBEZWNpZGluZyB3aGV0aGVyIG9yIG5vdCB0aGUgY2hhcnQgY3Vyc29yIHNob3VsZCBiZSB2aXNpYmxlIGlzIGEgbGl0dGxlIHRyaWNreSwgc28gSSd2ZSB0cmllZCB0byBtYWtlIHRoZSBsb2dpY1xyXG4gICAgLy8gdmVyeSBleHBsaWNpdCBmb3IgZWFzaWVyIG1haW50ZW5hbmNlLiAgQmFzaWNhbGx5LCBhbnkgdGltZSB3ZSBhcmUgaW4gcGxheWJhY2sgbW9kZSBhbmQgd2UgYXJlIHNvbWV3aGVyZSBvbiB0aGVcclxuICAgIC8vIGNoYXJ0LCBvciB3aGVuIHN0ZXBwaW5nIGFuZCByZWNvcmRpbmcsIHRoZSBjdXJzb3Igc2hvdWxkIGJlIHNlZW4uXHJcbiAgICBjb25zdCB0aW1lT25DaGFydCA9ICggdGhpcy5uZXVyb25Nb2RlbC5nZXRUaW1lKCkgLSB0aGlzLm5ldXJvbk1vZGVsLmdldE1pblJlY29yZGVkVGltZSgpICkgKiAxMDAwO1xyXG4gICAgY29uc3QgaXNDdXJyZW50VGltZU9uQ2hhcnQgPSAoIHRpbWVPbkNoYXJ0ID49IDAgKSAmJiAoIHRpbWVPbkNoYXJ0IDw9IFRJTUVfU1BBTiApO1xyXG4gICAgY29uc3QgY2hhcnRDdXJzb3JWaXNpYmxlID0gaXNDdXJyZW50VGltZU9uQ2hhcnQgJiYgdGhpcy5kYXRhU2VyaWVzLmhhc0RhdGEoKTtcclxuICAgIHRoaXMuY2hhcnRDdXJzb3Iuc2V0VmlzaWJsZSggY2hhcnRDdXJzb3JWaXNpYmxlICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZSAtIHVwZGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIGNoYXJ0IGN1cnNvclxyXG4gIHVwZGF0ZUNoYXJ0Q3Vyc29yKCkge1xyXG4gICAgdGhpcy51cGRhdGVDaGFydEN1cnNvclZpc2liaWxpdHkoKTtcclxuICAgIGlmICggdGhpcy5jaGFydEN1cnNvci5pc1Zpc2libGUoKSApIHtcclxuICAgICAgdGhpcy51cGRhdGVDaGFydEN1cnNvclBvcygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICB1cGRhdGVDaGFydEN1cnNvclBvcygpIHtcclxuICAgIGNvbnN0IHJlY29yZGluZ1N0YXJ0VGltZSA9IHRoaXMubmV1cm9uTW9kZWwuZ2V0TWluUmVjb3JkZWRUaW1lKCk7XHJcbiAgICBjb25zdCByZWNvcmRpbmdDdXJyZW50VGltZSA9IHRoaXMubmV1cm9uTW9kZWwuZ2V0VGltZSgpO1xyXG4gICAgdGhpcy5tb3ZlQ2hhcnRDdXJzb3JUb1RpbWUoICggcmVjb3JkaW5nQ3VycmVudFRpbWUgLSByZWNvcmRpbmdTdGFydFRpbWUgKSAqIDEwMDAgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlXHJcbiAgbW92ZUNoYXJ0Q3Vyc29yVG9UaW1lKCB0aW1lICkge1xyXG4gICAgdGhpcy5jaGFydEN1cnNvci54ID0gVXRpbHMuY2xhbXAoIHRoaXMuY2hhcnRNdnQudHJhbnNmb3JtWCggdGltZSApLCAwLCB0aGlzLmNoYXJ0RGltZW5zaW9uLndpZHRoICk7XHJcbiAgICB0aGlzLmNoYXJ0Q3Vyc29yLnkgPSB0aGlzLmNoYXJ0TXZ0LnRyYW5zZm9ybVkoIHRoaXMucmFuZ2VbIDEgXSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICB1cGRhdGVPblNpbXVsYXRpb25SZXNldCgpIHtcclxuICAgIHRoaXMubmV1cm9uTW9kZWwuc2V0TW9kZUxpdmUoKTtcclxuICAgIHRoaXMuY2xlYXJDaGFydCgpO1xyXG4gICAgdGhpcy51cGRhdGVDaGFydEN1cnNvclZpc2liaWxpdHkoKTtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlXHJcbiAgdXBkYXRlQ3Vyc29yU3RhdGUoKSB7XHJcbiAgICB0aGlzLnVwZGF0ZUNoYXJ0Q3Vyc29yUG9zKCk7XHJcbiAgICB0aGlzLnVwZGF0ZUNoYXJ0Q3Vyc29yVmlzaWJpbGl0eSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXNlZCB0byBjb250cm9sIHRoZSBwbGF5L3BhdXNlIHN0YXRlIG9mIGNsb2NrLCBzaW5jZSBncmFiYmluZyB0aGUgY3Vyc29yIGNhdXNlcyB0aGUgY2xvY2sgdG8gcGF1c2UuXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBwbGF5aW5nXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFBsYXlpbmcoIHBsYXlpbmcgKSB7XHJcbiAgICB0aGlzLmNsb2NrLnBsYXlpbmdQcm9wZXJ0eS5zZXQoIHBsYXlpbmcgKTtcclxuICB9XHJcbn1cclxuXHJcbm5ldXJvbi5yZWdpc3RlciggJ01lbWJyYW5lUG90ZW50aWFsQ2hhcnQnLCBNZW1icmFuZVBvdGVudGlhbENoYXJ0ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNZW1icmFuZVBvdGVudGlhbENoYXJ0OyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxN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