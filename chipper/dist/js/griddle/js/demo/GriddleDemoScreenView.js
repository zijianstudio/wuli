// Copyright 2018-2022, University of Colorado Boulder

/**
 * Demonstration of griddle components.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'component' query parameter to set the initial selection of the combo box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 *
 * @deprecated - please use bamboo
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import Multilink from '../../../axon/js/Multilink.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import Vector2 from '../../../dot/js/Vector2.js';
import deprecationWarning from '../../../phet-core/js/deprecationWarning.js';
import merge from '../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import sceneryPhetQueryParameters from '../../../scenery-phet/js/sceneryPhetQueryParameters.js';
import { HBox, Node, Text, VBox } from '../../../scenery/js/imports.js';
import ABSwitch from '../../../sun/js/ABSwitch.js';
import BooleanRectangularStickyToggleButton from '../../../sun/js/buttons/BooleanRectangularStickyToggleButton.js';
import BooleanRectangularToggleButton from '../../../sun/js/buttons/BooleanRectangularToggleButton.js';
import DemosScreenView from '../../../sun/js/demo/DemosScreenView.js';
import NumberSpinner from '../../../sun/js/NumberSpinner.js';
import Panel from '../../../sun/js/Panel.js';
import VSlider from '../../../sun/js/VSlider.js';
import BarChartNode from '../BarChartNode.js';
import DynamicSeries from '../DynamicSeries.js';
import DynamicSeriesNode from '../DynamicSeriesNode.js';
import griddle from '../griddle.js';
import GridNode from '../GridNode.js';
import SeismographNode from '../SeismographNode.js';
import XYChartNode from '../XYChartNode.js';
import XYCursorChartNode from '../XYCursorChartNode.js';

// constants - this is a hack to enable components to animate from the animation loop
const emitter = new Emitter({
  parameters: [{
    valueType: 'number'
  }]
});
class GriddleDemoScreenView extends DemosScreenView {
  constructor() {
    assert && deprecationWarning('please use bamboo');
    super([
    /**
     * To add a demo, add an object literal here. Each object has these properties:
     *
     * {string} label - label in the combo box
     * {function(Bounds2): Node} createNode - creates the scene graph for the demo
     */
    {
      label: 'BarChart',
      createNode: demoBarChart
    }, {
      label: 'GridNode',
      createNode: demoGridNode
    }, {
      label: 'XYChartNode',
      createNode: demoScrollingChartNode
    }, {
      label: 'SeismographNode',
      createNode: demoSeismographNode
    }, {
      label: 'XYCursorChartNode',
      createNode: demoXYCursorPlot
    }], {
      selectedDemoLabel: sceneryPhetQueryParameters.component
    });
  }

  /**
   * Move the model forward in time.
   * @param {number} dt - elapsed time in seconds
   * @public
   */
  step(dt) {
    emitter.emit(dt);
  }
}

// Creates a demo for the BarChartNode
const demoBarChart = function (layoutBounds) {
  const model = {
    aProperty: new Property(0),
    bProperty: new Property(0),
    cProperty: new Property(0)
  };
  const aEntry = {
    property: model.aProperty,
    color: 'red'
  };
  const bEntry = {
    property: model.bProperty,
    color: 'green'
  };
  const cEntry = {
    property: model.cProperty,
    color: 'blue'
  };
  const barChartNode = new BarChartNode([{
    entries: [aEntry],
    label: new Node()
  }, {
    entries: [bEntry],
    label: new Node()
  }, {
    entries: [cEntry],
    label: new Node()
  }, {
    entries: [cEntry, bEntry, aEntry],
    label: new Node()
  }], new Property(new Range(-100, 200)), {
    barOptions: {
      totalRange: new Range(-100, 200)
    }
  });
  const listener = function (dt) {
    barChartNode.update();
  };
  emitter.addListener(listener);
  const sliderRange = new Range(-200, 300);
  const sliderOptions = {
    trackSize: new Dimension2(5, 200)
  };
  const hBox = new HBox({
    align: 'top',
    spacing: 60,
    center: layoutBounds.center,
    children: [new Node({
      children: [barChartNode]
    }), new HBox({
      spacing: 25,
      children: [new VSlider(model.aProperty, sliderRange, merge({}, sliderOptions, {
        trackFillEnabled: aEntry.color
      })), new VSlider(model.bProperty, sliderRange, merge({}, sliderOptions, {
        trackFillEnabled: bEntry.color
      })), new VSlider(model.cProperty, sliderRange, merge({}, sliderOptions, {
        trackFillEnabled: cEntry.color
      }))]
    })]
  });

  // Swap out the dispose function for one that also removes the Emitter listener
  const hboxDispose = hBox.dispose.bind(hBox);
  hBox.dispose = function () {
    emitter.removeListener(listener);
    hboxDispose();
  };
  return hBox;
};

// Creates a demo for GridNode
const demoGridNode = layoutBounds => {
  const gridWidth = 400;
  const gridHeight = 400;
  const minorSpacingRange = new Range(1, 2);
  const majorSpacingRange = new Range(4, 10);
  const defaultMinorSpacing = minorSpacingRange.min;
  const defaultMajorSpacing = majorSpacingRange.min;
  const modelViewTransformProperty = new Property(ModelViewTransform2.createRectangleMapping(new Bounds2(0, 0, 10, 10), new Bounds2(0, 0, gridWidth, gridHeight)));
  const gridNode = new GridNode(gridWidth, gridHeight, {
    majorHorizontalLineSpacing: defaultMajorSpacing,
    majorVerticalLineSpacing: defaultMajorSpacing,
    minorHorizontalLineSpacing: defaultMinorSpacing,
    minorVerticalLineSpacing: defaultMinorSpacing,
    modelViewTransformProperty: modelViewTransformProperty,
    minorLineOptions: {
      lineDash: [5, 5]
    }
  });

  // creates a NumberSpinner with a text label that controls grid spacing
  const createLabelledSpinner = (labelString, numberProperty, enabledProperty, valueDelta) => {
    const label = new Text(labelString, {
      font: new PhetFont(15)
    });
    const spinner = new NumberSpinner(numberProperty, new Property(numberProperty.range), {
      deltaValue: valueDelta,
      enabledProperty: enabledProperty,
      numberDisplayOptions: {
        align: 'center',
        xMargin: 5,
        yMargin: 3,
        textOptions: {
          font: new PhetFont(28)
        }
      }
    });
    return new HBox({
      children: [label, spinner],
      spacing: 5
    });
  };

  // creates a BooleanRectangularToggleButton that toggles visibility of grid lines
  const createToggleLinesButton = (visibleProperty, visibleText, hiddenText) => {
    return new BooleanRectangularToggleButton(visibleProperty, new Text(visibleText), new Text(hiddenText));
  };

  // Properties for controls to change the GridNode
  const verticalLinesVisibleProperty = new BooleanProperty(true);
  const horizontalLinesVisibleProperty = new BooleanProperty(true);
  const scrollingProperty = new BooleanProperty(false);
  const minorHorizontalLineSpacingProperty = new NumberProperty(defaultMinorSpacing, {
    range: minorSpacingRange
  });
  const minorVerticalLineSpacingProperty = new NumberProperty(defaultMinorSpacing, {
    range: minorSpacingRange
  });
  const majorHorizontalLineSpacingProperty = new NumberProperty(defaultMajorSpacing, {
    range: majorSpacingRange
  });
  const majorVerticalLineSpacingProperty = new NumberProperty(defaultMajorSpacing, {
    range: majorSpacingRange
  });

  // controls to change the GridNode
  const minorHorizontalLineSpinner = createLabelledSpinner('Minor Horizontal Spacing', minorHorizontalLineSpacingProperty, horizontalLinesVisibleProperty, 1);
  const minorVerticalLineSpinner = createLabelledSpinner('Minor Vertical Spacing', minorVerticalLineSpacingProperty, verticalLinesVisibleProperty, 1);
  const majorHorizontalLineSpinner = createLabelledSpinner('Major Horizontal Spacing', majorHorizontalLineSpacingProperty, horizontalLinesVisibleProperty, 2);
  const majorVerticalLineSpinner = createLabelledSpinner('Major Vertical Spacing', majorVerticalLineSpacingProperty, verticalLinesVisibleProperty, 2);
  const hideHorizontalLinesButton = createToggleLinesButton(horizontalLinesVisibleProperty, 'Hide Horizontal', 'Show Horizontal');
  const hideVerticalLinesButton = createToggleLinesButton(verticalLinesVisibleProperty, 'Hide Vertical', 'Show Horizontal');
  const hideButtonsHBox = new HBox({
    children: [hideHorizontalLinesButton, hideVerticalLinesButton],
    spacing: 10
  });
  const scrollButton = new BooleanRectangularStickyToggleButton(scrollingProperty, {
    content: new Text('Scroll')
  });
  const controls = new VBox({
    children: [minorHorizontalLineSpinner, minorVerticalLineSpinner, majorHorizontalLineSpinner, majorVerticalLineSpinner, hideButtonsHBox, scrollButton],
    spacing: 15,
    align: 'right'
  });
  const node = new HBox({
    children: [controls, gridNode],
    spacing: 15,
    center: layoutBounds.center,
    resize: false
  });
  Multilink.multilink([verticalLinesVisibleProperty, horizontalLinesVisibleProperty], (verticalVisible, horizontalVisible) => {
    const majorVerticalLineSpacing = verticalVisible ? majorVerticalLineSpacingProperty.get() : null;
    const minorVerticalLineSpacing = verticalVisible ? minorVerticalLineSpacingProperty.get() : null;
    const majorHorizontalLineSpacing = horizontalVisible ? majorHorizontalLineSpacingProperty.get() : null;
    const minorHorizontalLineSpacing = horizontalVisible ? minorHorizontalLineSpacingProperty.get() : null;
    gridNode.setLineSpacings({
      majorVerticalLineSpacing: majorVerticalLineSpacing,
      majorHorizontalLineSpacing: majorHorizontalLineSpacing,
      minorVerticalLineSpacing: minorVerticalLineSpacing,
      minorHorizontalLineSpacing: minorHorizontalLineSpacing
    });

    // disable the other button, cant have both sets hidden at once
    hideHorizontalLinesButton.enabled = verticalVisible;
    hideVerticalLinesButton.enabled = horizontalVisible;
  });
  Multilink.multilink([majorVerticalLineSpacingProperty, majorHorizontalLineSpacingProperty, minorHorizontalLineSpacingProperty, minorVerticalLineSpacingProperty], (majorVerticalLineSpacing, majorHorizontalLineSpacing, minorVerticalLineSpacing, minorHorizontalLineSpacing) => {
    gridNode.setLineSpacings({
      majorVerticalLineSpacing: majorVerticalLineSpacing,
      majorHorizontalLineSpacing: majorHorizontalLineSpacing,
      minorVerticalLineSpacing: minorVerticalLineSpacing,
      minorHorizontalLineSpacing: minorHorizontalLineSpacing
    });
  });
  let offset = 0;
  emitter.addListener(dt => {
    if (scrollingProperty.get()) {
      offset -= dt;
      const offsetVector = new Vector2(offset, offset);
      modelViewTransformProperty.set(ModelViewTransform2.createRectangleMapping(new Bounds2(offsetVector.x, offsetVector.y, 10 + offsetVector.x, 10 + offsetVector.y), new Bounds2(0, 0, gridWidth, gridHeight)));
    }
  });
  return node;
};

/**
 * Creates an example XYChartNode
 * @param layoutBounds
 */
const demoScrollingChartNode = function (layoutBounds) {
  const timeProperty = new Property(0);
  const series1 = new DynamicSeries({
    color: 'blue',
    lineWidth: 3,
    radius: 7
  });
  const series2 = new DynamicSeries({
    color: 'orange',
    lineWidth: 3,
    radius: 7
  });
  const horizontalRange = new Range(0, 10);
  const verticalRange = new Range(-5, 5);
  const maxTime = horizontalRange.max;
  const chartWidth = 500;
  const chartHeight = 500;
  const styleProperty = new Property(DynamicSeriesNode.PlotStyle.LINE);
  const labelFont = new PhetFont({
    size: 25
  });
  const styleSwitch = new ABSwitch(styleProperty, DynamicSeriesNode.PlotStyle.LINE, new Text('Line', {
    font: labelFont
  }), DynamicSeriesNode.PlotStyle.SCATTER, new Text('Scatter', {
    font: labelFont
  }));
  const modelViewTransformProperty = new Property(ModelViewTransform2.createRectangleInvertedYMapping(new Bounds2(horizontalRange.min, verticalRange.min, horizontalRange.max, verticalRange.max), new Bounds2(0, 0, chartWidth, chartHeight)));
  const listener = dt => {
    // Increment the model time
    timeProperty.value += dt;

    // time has gone beyond the initial max time, so update the transform to pan data so that the new points
    // are in view
    if (timeProperty.get() > maxTime) {
      const minY = verticalRange.min + timeProperty.value - maxTime;
      const maxY = verticalRange.max + timeProperty.value - maxTime;
      modelViewTransformProperty.set(ModelViewTransform2.createRectangleInvertedYMapping(new Bounds2(timeProperty.get() - maxTime, minY, timeProperty.get(), maxY), new Bounds2(0, 0, chartWidth, chartHeight)));
    }

    // if drawing a scatter plot, just draw a new dot every half second
    if (styleProperty.get() === DynamicSeriesNode.PlotStyle.SCATTER && series1.hasData()) {
      const timeDifference = timeProperty.get() - series1.getDataPoint(series1.getLength() - 1).x;
      if (timeDifference < 0.5) {
        return;
      }
    }

    // Sample new data
    series1.addXYDataPoint(timeProperty.value, timeProperty.value + Math.sin(timeProperty.value) + verticalRange.min);
    series2.addXYDataPoint(timeProperty.value, timeProperty.value + Math.sin(timeProperty.value + 1) + verticalRange.min);

    // Data that does not fall within the displayed window should be removed.
    while (series1.getDataPoint(0).x < timeProperty.value - maxTime) {
      series1.shiftData();
      series2.shiftData();
    }
  };
  emitter.addListener(listener);
  const scrollingChartNode = new XYChartNode({
    width: chartWidth,
    height: chartHeight,
    verticalAxisLabelNode: new Text('Height (m)', {
      fill: 'white',
      rotation: 3 * Math.PI / 2
    }),
    horizontalAxisLabelNode: new Text('time (s)', {
      fill: 'white'
    }),
    modelViewTransformProperty: modelViewTransformProperty
  });
  scrollingChartNode.addDynamicSeriesArray([series1, series2]);
  styleProperty.link(style => {
    scrollingChartNode.setPlotStyle(style);
    series1.clear();
    series2.clear();
  });
  const panel = new Panel(scrollingChartNode, {
    fill: 'gray',
    resize: false
  });

  // Swap out the dispose function for one that also removes the Emitter listener
  const panelDispose = panel.dispose.bind(panel);
  panel.dispose = () => {
    emitter.removeListener(listener);
    panelDispose();
  };
  return new VBox({
    children: [panel, styleSwitch],
    spacing: 15,
    center: layoutBounds.center.plusXY(25, 0)
  });
};
const demoSeismographNode = layoutBounds => {
  const timeProperty = new Property(0);
  const series1 = new DynamicSeries({
    color: 'blue'
  });
  const maxTime = 4;
  const listener = dt => {
    // Increment the model time
    timeProperty.value += dt;

    // Sample new data
    series1.addXYDataPoint(timeProperty.value, Math.sin(timeProperty.value));

    // Data that does not fall within the displayed window should be removed.
    while (series1.getDataPoint(0).x < timeProperty.value - maxTime) {
      series1.shiftData();
    }
  };
  emitter.addListener(listener);
  const seismographNode = new SeismographNode(timeProperty, [series1], new Text('1 s', {
    fill: 'white'
  }), {
    width: 200,
    height: 150,
    verticalGridLabelNumberOfDecimalPlaces: 1,
    horizontalGridLabelNumberOfDecimalPlaces: 1,
    verticalAxisLabelNode: new Text('Height (m)', {
      rotation: 3 * Math.PI / 2,
      fill: 'white'
    }),
    horizontalAxisLabelNode: new Text('time (s)', {
      fill: 'white'
    }),
    verticalRanges: [new Range(-1, 1)]
  });
  const panel = new Panel(seismographNode, {
    fill: 'gray',
    center: layoutBounds.center
  });

  // Swap out the dispose function for one that also removes the Emitter listener
  const panelDispose = panel.dispose.bind(panel);
  panel.dispose = () => {
    emitter.removeListener(listener);
    panelDispose();
  };
  return panel;
};

/**
 * Creates an example XYCursorChartNode
 * @param layoutBounds
 * @returns {XYCursorChartNode}
 */
const demoXYCursorPlot = layoutBounds => {
  const chartWidth = 800;
  const chartHeight = 200;
  const maxTime = 10;
  const chartRange = new Range(-1, 1);
  const timeProperty = new NumberProperty(0);
  const modelViewTransformProperty = new Property(ModelViewTransform2.createRectangleInvertedYMapping(new Bounds2(0, chartRange.min, maxTime, chartRange.max), new Bounds2(0, 0, chartWidth, chartHeight)));
  const dataSeries = new DynamicSeries();

  // while dragging,
  let dragging = false;
  const chartNode = new XYCursorChartNode({
    width: chartWidth,
    height: chartHeight,
    modelViewTransformProperty: modelViewTransformProperty,
    maxX: maxTime,
    showAxis: false,
    minY: chartRange.min,
    maxY: chartRange.max,
    lineDash: [4, 4],
    verticalAxisLabelNode: new Text('Value', {
      rotation: 3 * Math.PI / 2,
      fill: 'white'
    }),
    horizontalAxisLabelNode: new Text('Time (s)', {
      fill: 'white'
    }),
    cursorOptions: {
      startDrag: () => {
        dragging = true;
      },
      endDrag: () => {
        dragging = false;
      }
    }
  });
  chartNode.addDynamicSeries(dataSeries);
  const chartPanel = new Panel(chartNode, {
    fill: 'grey',
    center: layoutBounds.center,
    resize: false
  });
  const listener = dt => {
    // no recording if we are dragging the cursor
    if (!dragging) {
      // Increment the model time
      timeProperty.set(timeProperty.get() + dt);

      // Sample new data
      dataSeries.addXYDataPoint(timeProperty.get(), Math.sin(timeProperty.get()));

      // time has gone beyond the initial max time, so update the transform to pan data so that the new points
      // are in view
      if (timeProperty.get() > maxTime) {
        modelViewTransformProperty.set(ModelViewTransform2.createRectangleInvertedYMapping(new Bounds2(timeProperty.get() - maxTime, chartRange.min, timeProperty.get(), chartRange.max), new Bounds2(0, 0, chartWidth, chartHeight)));
      }

      // Data that does not fall within the displayed window should be removed.
      while (dataSeries.getDataPoint(0).x < timeProperty.value - maxTime) {
        dataSeries.shiftData();
      }
      chartNode.setCursorValue(timeProperty.get());
    }
  };
  emitter.addListener(listener);
  return chartPanel;
};
griddle.register('GriddleDemoScreenView', GriddleDemoScreenView);
export default GriddleDemoScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiTXVsdGlsaW5rIiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJEaW1lbnNpb24yIiwiUmFuZ2UiLCJWZWN0b3IyIiwiZGVwcmVjYXRpb25XYXJuaW5nIiwibWVyZ2UiLCJNb2RlbFZpZXdUcmFuc2Zvcm0yIiwiUGhldEZvbnQiLCJzY2VuZXJ5UGhldFF1ZXJ5UGFyYW1ldGVycyIsIkhCb3giLCJOb2RlIiwiVGV4dCIsIlZCb3giLCJBQlN3aXRjaCIsIkJvb2xlYW5SZWN0YW5ndWxhclN0aWNreVRvZ2dsZUJ1dHRvbiIsIkJvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbiIsIkRlbW9zU2NyZWVuVmlldyIsIk51bWJlclNwaW5uZXIiLCJQYW5lbCIsIlZTbGlkZXIiLCJCYXJDaGFydE5vZGUiLCJEeW5hbWljU2VyaWVzIiwiRHluYW1pY1Nlcmllc05vZGUiLCJncmlkZGxlIiwiR3JpZE5vZGUiLCJTZWlzbW9ncmFwaE5vZGUiLCJYWUNoYXJ0Tm9kZSIsIlhZQ3Vyc29yQ2hhcnROb2RlIiwiZW1pdHRlciIsInBhcmFtZXRlcnMiLCJ2YWx1ZVR5cGUiLCJHcmlkZGxlRGVtb1NjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsImFzc2VydCIsImxhYmVsIiwiY3JlYXRlTm9kZSIsImRlbW9CYXJDaGFydCIsImRlbW9HcmlkTm9kZSIsImRlbW9TY3JvbGxpbmdDaGFydE5vZGUiLCJkZW1vU2Vpc21vZ3JhcGhOb2RlIiwiZGVtb1hZQ3Vyc29yUGxvdCIsInNlbGVjdGVkRGVtb0xhYmVsIiwiY29tcG9uZW50Iiwic3RlcCIsImR0IiwiZW1pdCIsImxheW91dEJvdW5kcyIsIm1vZGVsIiwiYVByb3BlcnR5IiwiYlByb3BlcnR5IiwiY1Byb3BlcnR5IiwiYUVudHJ5IiwicHJvcGVydHkiLCJjb2xvciIsImJFbnRyeSIsImNFbnRyeSIsImJhckNoYXJ0Tm9kZSIsImVudHJpZXMiLCJiYXJPcHRpb25zIiwidG90YWxSYW5nZSIsImxpc3RlbmVyIiwidXBkYXRlIiwiYWRkTGlzdGVuZXIiLCJzbGlkZXJSYW5nZSIsInNsaWRlck9wdGlvbnMiLCJ0cmFja1NpemUiLCJoQm94IiwiYWxpZ24iLCJzcGFjaW5nIiwiY2VudGVyIiwiY2hpbGRyZW4iLCJ0cmFja0ZpbGxFbmFibGVkIiwiaGJveERpc3Bvc2UiLCJkaXNwb3NlIiwiYmluZCIsInJlbW92ZUxpc3RlbmVyIiwiZ3JpZFdpZHRoIiwiZ3JpZEhlaWdodCIsIm1pbm9yU3BhY2luZ1JhbmdlIiwibWFqb3JTcGFjaW5nUmFuZ2UiLCJkZWZhdWx0TWlub3JTcGFjaW5nIiwibWluIiwiZGVmYXVsdE1ham9yU3BhY2luZyIsIm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5IiwiY3JlYXRlUmVjdGFuZ2xlTWFwcGluZyIsImdyaWROb2RlIiwibWFqb3JIb3Jpem9udGFsTGluZVNwYWNpbmciLCJtYWpvclZlcnRpY2FsTGluZVNwYWNpbmciLCJtaW5vckhvcml6b250YWxMaW5lU3BhY2luZyIsIm1pbm9yVmVydGljYWxMaW5lU3BhY2luZyIsIm1pbm9yTGluZU9wdGlvbnMiLCJsaW5lRGFzaCIsImNyZWF0ZUxhYmVsbGVkU3Bpbm5lciIsImxhYmVsU3RyaW5nIiwibnVtYmVyUHJvcGVydHkiLCJlbmFibGVkUHJvcGVydHkiLCJ2YWx1ZURlbHRhIiwiZm9udCIsInNwaW5uZXIiLCJyYW5nZSIsImRlbHRhVmFsdWUiLCJudW1iZXJEaXNwbGF5T3B0aW9ucyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwidGV4dE9wdGlvbnMiLCJjcmVhdGVUb2dnbGVMaW5lc0J1dHRvbiIsInZpc2libGVQcm9wZXJ0eSIsInZpc2libGVUZXh0IiwiaGlkZGVuVGV4dCIsInZlcnRpY2FsTGluZXNWaXNpYmxlUHJvcGVydHkiLCJob3Jpem9udGFsTGluZXNWaXNpYmxlUHJvcGVydHkiLCJzY3JvbGxpbmdQcm9wZXJ0eSIsIm1pbm9ySG9yaXpvbnRhbExpbmVTcGFjaW5nUHJvcGVydHkiLCJtaW5vclZlcnRpY2FsTGluZVNwYWNpbmdQcm9wZXJ0eSIsIm1ham9ySG9yaXpvbnRhbExpbmVTcGFjaW5nUHJvcGVydHkiLCJtYWpvclZlcnRpY2FsTGluZVNwYWNpbmdQcm9wZXJ0eSIsIm1pbm9ySG9yaXpvbnRhbExpbmVTcGlubmVyIiwibWlub3JWZXJ0aWNhbExpbmVTcGlubmVyIiwibWFqb3JIb3Jpem9udGFsTGluZVNwaW5uZXIiLCJtYWpvclZlcnRpY2FsTGluZVNwaW5uZXIiLCJoaWRlSG9yaXpvbnRhbExpbmVzQnV0dG9uIiwiaGlkZVZlcnRpY2FsTGluZXNCdXR0b24iLCJoaWRlQnV0dG9uc0hCb3giLCJzY3JvbGxCdXR0b24iLCJjb250ZW50IiwiY29udHJvbHMiLCJub2RlIiwicmVzaXplIiwibXVsdGlsaW5rIiwidmVydGljYWxWaXNpYmxlIiwiaG9yaXpvbnRhbFZpc2libGUiLCJnZXQiLCJzZXRMaW5lU3BhY2luZ3MiLCJlbmFibGVkIiwib2Zmc2V0Iiwib2Zmc2V0VmVjdG9yIiwic2V0IiwieCIsInkiLCJ0aW1lUHJvcGVydHkiLCJzZXJpZXMxIiwibGluZVdpZHRoIiwicmFkaXVzIiwic2VyaWVzMiIsImhvcml6b250YWxSYW5nZSIsInZlcnRpY2FsUmFuZ2UiLCJtYXhUaW1lIiwibWF4IiwiY2hhcnRXaWR0aCIsImNoYXJ0SGVpZ2h0Iiwic3R5bGVQcm9wZXJ0eSIsIlBsb3RTdHlsZSIsIkxJTkUiLCJsYWJlbEZvbnQiLCJzaXplIiwic3R5bGVTd2l0Y2giLCJTQ0FUVEVSIiwiY3JlYXRlUmVjdGFuZ2xlSW52ZXJ0ZWRZTWFwcGluZyIsInZhbHVlIiwibWluWSIsIm1heFkiLCJoYXNEYXRhIiwidGltZURpZmZlcmVuY2UiLCJnZXREYXRhUG9pbnQiLCJnZXRMZW5ndGgiLCJhZGRYWURhdGFQb2ludCIsIk1hdGgiLCJzaW4iLCJzaGlmdERhdGEiLCJzY3JvbGxpbmdDaGFydE5vZGUiLCJ3aWR0aCIsImhlaWdodCIsInZlcnRpY2FsQXhpc0xhYmVsTm9kZSIsImZpbGwiLCJyb3RhdGlvbiIsIlBJIiwiaG9yaXpvbnRhbEF4aXNMYWJlbE5vZGUiLCJhZGREeW5hbWljU2VyaWVzQXJyYXkiLCJsaW5rIiwic3R5bGUiLCJzZXRQbG90U3R5bGUiLCJjbGVhciIsInBhbmVsIiwicGFuZWxEaXNwb3NlIiwicGx1c1hZIiwic2Vpc21vZ3JhcGhOb2RlIiwidmVydGljYWxHcmlkTGFiZWxOdW1iZXJPZkRlY2ltYWxQbGFjZXMiLCJob3Jpem9udGFsR3JpZExhYmVsTnVtYmVyT2ZEZWNpbWFsUGxhY2VzIiwidmVydGljYWxSYW5nZXMiLCJjaGFydFJhbmdlIiwiZGF0YVNlcmllcyIsImRyYWdnaW5nIiwiY2hhcnROb2RlIiwibWF4WCIsInNob3dBeGlzIiwiY3Vyc29yT3B0aW9ucyIsInN0YXJ0RHJhZyIsImVuZERyYWciLCJhZGREeW5hbWljU2VyaWVzIiwiY2hhcnRQYW5lbCIsInNldEN1cnNvclZhbHVlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHcmlkZGxlRGVtb1NjcmVlblZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGVtb25zdHJhdGlvbiBvZiBncmlkZGxlIGNvbXBvbmVudHMuXHJcbiAqIERlbW9zIGFyZSBzZWxlY3RlZCBmcm9tIGEgY29tYm8gYm94LCBhbmQgYXJlIGluc3RhbnRpYXRlZCBvbiBkZW1hbmQuXHJcbiAqIFVzZSB0aGUgJ2NvbXBvbmVudCcgcXVlcnkgcGFyYW1ldGVyIHRvIHNldCB0aGUgaW5pdGlhbCBzZWxlY3Rpb24gb2YgdGhlIGNvbWJvIGJveC5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICpcclxuICogQGRlcHJlY2F0ZWQgLSBwbGVhc2UgdXNlIGJhbWJvb1xyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgZGVwcmVjYXRpb25XYXJuaW5nIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9kZXByZWNhdGlvbldhcm5pbmcuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHNjZW5lcnlQaGV0UXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9zY2VuZXJ5UGhldFF1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIE5vZGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQUJTd2l0Y2ggZnJvbSAnLi4vLi4vLi4vc3VuL2pzL0FCU3dpdGNoLmpzJztcclxuaW1wb3J0IEJvb2xlYW5SZWN0YW5ndWxhclN0aWNreVRvZ2dsZUJ1dHRvbiBmcm9tICcuLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9Cb29sZWFuUmVjdGFuZ3VsYXJTdGlja3lUb2dnbGVCdXR0b24uanMnO1xyXG5pbXBvcnQgQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uIGZyb20gJy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL0Jvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbi5qcyc7XHJcbmltcG9ydCBEZW1vc1NjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vc3VuL2pzL2RlbW8vRGVtb3NTY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IE51bWJlclNwaW5uZXIgZnJvbSAnLi4vLi4vLi4vc3VuL2pzL051bWJlclNwaW5uZXIuanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IFZTbGlkZXIgZnJvbSAnLi4vLi4vLi4vc3VuL2pzL1ZTbGlkZXIuanMnO1xyXG5pbXBvcnQgQmFyQ2hhcnROb2RlIGZyb20gJy4uL0JhckNoYXJ0Tm9kZS5qcyc7XHJcbmltcG9ydCBEeW5hbWljU2VyaWVzIGZyb20gJy4uL0R5bmFtaWNTZXJpZXMuanMnO1xyXG5pbXBvcnQgRHluYW1pY1Nlcmllc05vZGUgZnJvbSAnLi4vRHluYW1pY1Nlcmllc05vZGUuanMnO1xyXG5pbXBvcnQgZ3JpZGRsZSBmcm9tICcuLi9ncmlkZGxlLmpzJztcclxuaW1wb3J0IEdyaWROb2RlIGZyb20gJy4uL0dyaWROb2RlLmpzJztcclxuaW1wb3J0IFNlaXNtb2dyYXBoTm9kZSBmcm9tICcuLi9TZWlzbW9ncmFwaE5vZGUuanMnO1xyXG5pbXBvcnQgWFlDaGFydE5vZGUgZnJvbSAnLi4vWFlDaGFydE5vZGUuanMnO1xyXG5pbXBvcnQgWFlDdXJzb3JDaGFydE5vZGUgZnJvbSAnLi4vWFlDdXJzb3JDaGFydE5vZGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzIC0gdGhpcyBpcyBhIGhhY2sgdG8gZW5hYmxlIGNvbXBvbmVudHMgdG8gYW5pbWF0ZSBmcm9tIHRoZSBhbmltYXRpb24gbG9vcFxyXG5jb25zdCBlbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHsgcGFyYW1ldGVyczogWyB7IHZhbHVlVHlwZTogJ251bWJlcicgfSBdIH0gKTtcclxuXHJcbmNsYXNzIEdyaWRkbGVEZW1vU2NyZWVuVmlldyBleHRlbmRzIERlbW9zU2NyZWVuVmlldyB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBhc3NlcnQgJiYgZGVwcmVjYXRpb25XYXJuaW5nKCAncGxlYXNlIHVzZSBiYW1ib28nICk7XHJcblxyXG4gICAgc3VwZXIoIFtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBUbyBhZGQgYSBkZW1vLCBhZGQgYW4gb2JqZWN0IGxpdGVyYWwgaGVyZS4gRWFjaCBvYmplY3QgaGFzIHRoZXNlIHByb3BlcnRpZXM6XHJcbiAgICAgICAqXHJcbiAgICAgICAqIHtzdHJpbmd9IGxhYmVsIC0gbGFiZWwgaW4gdGhlIGNvbWJvIGJveFxyXG4gICAgICAgKiB7ZnVuY3Rpb24oQm91bmRzMik6IE5vZGV9IGNyZWF0ZU5vZGUgLSBjcmVhdGVzIHRoZSBzY2VuZSBncmFwaCBmb3IgdGhlIGRlbW9cclxuICAgICAgICovXHJcbiAgICAgIHsgbGFiZWw6ICdCYXJDaGFydCcsIGNyZWF0ZU5vZGU6IGRlbW9CYXJDaGFydCB9LFxyXG4gICAgICB7IGxhYmVsOiAnR3JpZE5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vR3JpZE5vZGUgfSxcclxuICAgICAgeyBsYWJlbDogJ1hZQ2hhcnROb2RlJywgY3JlYXRlTm9kZTogZGVtb1Njcm9sbGluZ0NoYXJ0Tm9kZSB9LFxyXG4gICAgICB7IGxhYmVsOiAnU2Vpc21vZ3JhcGhOb2RlJywgY3JlYXRlTm9kZTogZGVtb1NlaXNtb2dyYXBoTm9kZSB9LFxyXG4gICAgICB7IGxhYmVsOiAnWFlDdXJzb3JDaGFydE5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vWFlDdXJzb3JQbG90IH1cclxuICAgIF0sIHtcclxuICAgICAgc2VsZWN0ZWREZW1vTGFiZWw6IHNjZW5lcnlQaGV0UXVlcnlQYXJhbWV0ZXJzLmNvbXBvbmVudFxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZSB0aGUgbW9kZWwgZm9yd2FyZCBpbiB0aW1lLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIGVsYXBzZWQgdGltZSBpbiBzZWNvbmRzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgZW1pdHRlci5lbWl0KCBkdCApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQ3JlYXRlcyBhIGRlbW8gZm9yIHRoZSBCYXJDaGFydE5vZGVcclxuY29uc3QgZGVtb0JhckNoYXJ0ID0gZnVuY3Rpb24oIGxheW91dEJvdW5kcyApIHtcclxuICBjb25zdCBtb2RlbCA9IHtcclxuICAgIGFQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCAwICksXHJcbiAgICBiUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggMCApLFxyXG4gICAgY1Byb3BlcnR5OiBuZXcgUHJvcGVydHkoIDAgKVxyXG4gIH07XHJcbiAgY29uc3QgYUVudHJ5ID0ge1xyXG4gICAgcHJvcGVydHk6IG1vZGVsLmFQcm9wZXJ0eSxcclxuICAgIGNvbG9yOiAncmVkJ1xyXG4gIH07XHJcbiAgY29uc3QgYkVudHJ5ID0ge1xyXG4gICAgcHJvcGVydHk6IG1vZGVsLmJQcm9wZXJ0eSxcclxuICAgIGNvbG9yOiAnZ3JlZW4nXHJcbiAgfTtcclxuICBjb25zdCBjRW50cnkgPSB7XHJcbiAgICBwcm9wZXJ0eTogbW9kZWwuY1Byb3BlcnR5LFxyXG4gICAgY29sb3I6ICdibHVlJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGJhckNoYXJ0Tm9kZSA9IG5ldyBCYXJDaGFydE5vZGUoIFtcclxuICAgIHsgZW50cmllczogWyBhRW50cnkgXSwgbGFiZWw6IG5ldyBOb2RlKCkgfSxcclxuICAgIHsgZW50cmllczogWyBiRW50cnkgXSwgbGFiZWw6IG5ldyBOb2RlKCkgfSxcclxuICAgIHsgZW50cmllczogWyBjRW50cnkgXSwgbGFiZWw6IG5ldyBOb2RlKCkgfSxcclxuICAgIHsgZW50cmllczogWyBjRW50cnksIGJFbnRyeSwgYUVudHJ5IF0sIGxhYmVsOiBuZXcgTm9kZSgpIH1cclxuICBdLCBuZXcgUHJvcGVydHkoIG5ldyBSYW5nZSggLTEwMCwgMjAwICkgKSwge1xyXG4gICAgYmFyT3B0aW9uczoge1xyXG4gICAgICB0b3RhbFJhbmdlOiBuZXcgUmFuZ2UoIC0xMDAsIDIwMCApXHJcbiAgICB9XHJcbiAgfSApO1xyXG4gIGNvbnN0IGxpc3RlbmVyID0gZnVuY3Rpb24oIGR0ICkge1xyXG4gICAgYmFyQ2hhcnROb2RlLnVwZGF0ZSgpO1xyXG4gIH07XHJcbiAgZW1pdHRlci5hZGRMaXN0ZW5lciggbGlzdGVuZXIgKTtcclxuICBjb25zdCBzbGlkZXJSYW5nZSA9IG5ldyBSYW5nZSggLTIwMCwgMzAwICk7XHJcbiAgY29uc3Qgc2xpZGVyT3B0aW9ucyA9IHtcclxuICAgIHRyYWNrU2l6ZTogbmV3IERpbWVuc2lvbjIoIDUsIDIwMCApXHJcbiAgfTtcclxuICBjb25zdCBoQm94ID0gbmV3IEhCb3goIHtcclxuICAgIGFsaWduOiAndG9wJyxcclxuICAgIHNwYWNpbmc6IDYwLFxyXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyLFxyXG4gICAgY2hpbGRyZW46IFtcclxuICAgICAgbmV3IE5vZGUoIHtcclxuICAgICAgICBjaGlsZHJlbjogWyBiYXJDaGFydE5vZGUgXVxyXG4gICAgICB9ICksXHJcbiAgICAgIG5ldyBIQm94KCB7XHJcbiAgICAgICAgc3BhY2luZzogMjUsXHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgIG5ldyBWU2xpZGVyKCBtb2RlbC5hUHJvcGVydHksIHNsaWRlclJhbmdlLCBtZXJnZSgge30sIHNsaWRlck9wdGlvbnMsIHsgdHJhY2tGaWxsRW5hYmxlZDogYUVudHJ5LmNvbG9yIH0gKSApLFxyXG4gICAgICAgICAgbmV3IFZTbGlkZXIoIG1vZGVsLmJQcm9wZXJ0eSwgc2xpZGVyUmFuZ2UsIG1lcmdlKCB7fSwgc2xpZGVyT3B0aW9ucywgeyB0cmFja0ZpbGxFbmFibGVkOiBiRW50cnkuY29sb3IgfSApICksXHJcbiAgICAgICAgICBuZXcgVlNsaWRlciggbW9kZWwuY1Byb3BlcnR5LCBzbGlkZXJSYW5nZSwgbWVyZ2UoIHt9LCBzbGlkZXJPcHRpb25zLCB7IHRyYWNrRmlsbEVuYWJsZWQ6IGNFbnRyeS5jb2xvciB9ICkgKVxyXG4gICAgICAgIF1cclxuICAgICAgfSApXHJcbiAgICBdXHJcbiAgfSApO1xyXG5cclxuICAvLyBTd2FwIG91dCB0aGUgZGlzcG9zZSBmdW5jdGlvbiBmb3Igb25lIHRoYXQgYWxzbyByZW1vdmVzIHRoZSBFbWl0dGVyIGxpc3RlbmVyXHJcbiAgY29uc3QgaGJveERpc3Bvc2UgPSBoQm94LmRpc3Bvc2UuYmluZCggaEJveCApO1xyXG4gIGhCb3guZGlzcG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZW1pdHRlci5yZW1vdmVMaXN0ZW5lciggbGlzdGVuZXIgKTtcclxuICAgIGhib3hEaXNwb3NlKCk7XHJcbiAgfTtcclxuICByZXR1cm4gaEJveDtcclxufTtcclxuXHJcbi8vIENyZWF0ZXMgYSBkZW1vIGZvciBHcmlkTm9kZVxyXG5jb25zdCBkZW1vR3JpZE5vZGUgPSBsYXlvdXRCb3VuZHMgPT4ge1xyXG4gIGNvbnN0IGdyaWRXaWR0aCA9IDQwMDtcclxuICBjb25zdCBncmlkSGVpZ2h0ID0gNDAwO1xyXG4gIGNvbnN0IG1pbm9yU3BhY2luZ1JhbmdlID0gbmV3IFJhbmdlKCAxLCAyICk7XHJcbiAgY29uc3QgbWFqb3JTcGFjaW5nUmFuZ2UgPSBuZXcgUmFuZ2UoIDQsIDEwICk7XHJcbiAgY29uc3QgZGVmYXVsdE1pbm9yU3BhY2luZyA9IG1pbm9yU3BhY2luZ1JhbmdlLm1pbjtcclxuICBjb25zdCBkZWZhdWx0TWFqb3JTcGFjaW5nID0gbWFqb3JTcGFjaW5nUmFuZ2UubWluO1xyXG4gIGNvbnN0IG1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZVJlY3RhbmdsZU1hcHBpbmcoXHJcbiAgICBuZXcgQm91bmRzMiggMCwgMCwgMTAsIDEwICksXHJcbiAgICBuZXcgQm91bmRzMiggMCwgMCwgZ3JpZFdpZHRoLCBncmlkSGVpZ2h0IClcclxuICApICk7XHJcblxyXG4gIGNvbnN0IGdyaWROb2RlID0gbmV3IEdyaWROb2RlKCBncmlkV2lkdGgsIGdyaWRIZWlnaHQsIHtcclxuICAgIG1ham9ySG9yaXpvbnRhbExpbmVTcGFjaW5nOiBkZWZhdWx0TWFqb3JTcGFjaW5nLFxyXG4gICAgbWFqb3JWZXJ0aWNhbExpbmVTcGFjaW5nOiBkZWZhdWx0TWFqb3JTcGFjaW5nLFxyXG4gICAgbWlub3JIb3Jpem9udGFsTGluZVNwYWNpbmc6IGRlZmF1bHRNaW5vclNwYWNpbmcsXHJcbiAgICBtaW5vclZlcnRpY2FsTGluZVNwYWNpbmc6IGRlZmF1bHRNaW5vclNwYWNpbmcsXHJcbiAgICBtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eTogbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHksXHJcbiAgICBtaW5vckxpbmVPcHRpb25zOiB7XHJcbiAgICAgIGxpbmVEYXNoOiBbIDUsIDUgXVxyXG4gICAgfVxyXG4gIH0gKTtcclxuXHJcbiAgLy8gY3JlYXRlcyBhIE51bWJlclNwaW5uZXIgd2l0aCBhIHRleHQgbGFiZWwgdGhhdCBjb250cm9scyBncmlkIHNwYWNpbmdcclxuICBjb25zdCBjcmVhdGVMYWJlbGxlZFNwaW5uZXIgPSAoIGxhYmVsU3RyaW5nLCBudW1iZXJQcm9wZXJ0eSwgZW5hYmxlZFByb3BlcnR5LCB2YWx1ZURlbHRhICkgPT4ge1xyXG4gICAgY29uc3QgbGFiZWwgPSBuZXcgVGV4dCggbGFiZWxTdHJpbmcsIHsgZm9udDogbmV3IFBoZXRGb250KCAxNSApIH0gKTtcclxuICAgIGNvbnN0IHNwaW5uZXIgPSBuZXcgTnVtYmVyU3Bpbm5lciggbnVtYmVyUHJvcGVydHksIG5ldyBQcm9wZXJ0eSggbnVtYmVyUHJvcGVydHkucmFuZ2UgKSwge1xyXG4gICAgICBkZWx0YVZhbHVlOiB2YWx1ZURlbHRhLFxyXG4gICAgICBlbmFibGVkUHJvcGVydHk6IGVuYWJsZWRQcm9wZXJ0eSxcclxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgeE1hcmdpbjogNSxcclxuICAgICAgICB5TWFyZ2luOiAzLFxyXG4gICAgICAgIHRleHRPcHRpb25zOiB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMjggKSB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHJldHVybiBuZXcgSEJveCgge1xyXG4gICAgICBjaGlsZHJlbjogWyBsYWJlbCwgc3Bpbm5lciBdLFxyXG4gICAgICBzcGFjaW5nOiA1XHJcbiAgICB9ICk7XHJcbiAgfTtcclxuXHJcbiAgLy8gY3JlYXRlcyBhIEJvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbiB0aGF0IHRvZ2dsZXMgdmlzaWJpbGl0eSBvZiBncmlkIGxpbmVzXHJcbiAgY29uc3QgY3JlYXRlVG9nZ2xlTGluZXNCdXR0b24gPSAoIHZpc2libGVQcm9wZXJ0eSwgdmlzaWJsZVRleHQsIGhpZGRlblRleHQgKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IEJvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbiggdmlzaWJsZVByb3BlcnR5LCBuZXcgVGV4dCggdmlzaWJsZVRleHQgKSwgbmV3IFRleHQoIGhpZGRlblRleHQgKSApO1xyXG4gIH07XHJcblxyXG4gIC8vIFByb3BlcnRpZXMgZm9yIGNvbnRyb2xzIHRvIGNoYW5nZSB0aGUgR3JpZE5vZGVcclxuICBjb25zdCB2ZXJ0aWNhbExpbmVzVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApO1xyXG4gIGNvbnN0IGhvcml6b250YWxMaW5lc1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuICBjb25zdCBzY3JvbGxpbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gIGNvbnN0IG1pbm9ySG9yaXpvbnRhbExpbmVTcGFjaW5nUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIGRlZmF1bHRNaW5vclNwYWNpbmcsIHsgcmFuZ2U6IG1pbm9yU3BhY2luZ1JhbmdlIH0gKTtcclxuICBjb25zdCBtaW5vclZlcnRpY2FsTGluZVNwYWNpbmdQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggZGVmYXVsdE1pbm9yU3BhY2luZywgeyByYW5nZTogbWlub3JTcGFjaW5nUmFuZ2UgfSApO1xyXG4gIGNvbnN0IG1ham9ySG9yaXpvbnRhbExpbmVTcGFjaW5nUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIGRlZmF1bHRNYWpvclNwYWNpbmcsIHsgcmFuZ2U6IG1ham9yU3BhY2luZ1JhbmdlIH0gKTtcclxuICBjb25zdCBtYWpvclZlcnRpY2FsTGluZVNwYWNpbmdQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggZGVmYXVsdE1ham9yU3BhY2luZywgeyByYW5nZTogbWFqb3JTcGFjaW5nUmFuZ2UgfSApO1xyXG5cclxuICAvLyBjb250cm9scyB0byBjaGFuZ2UgdGhlIEdyaWROb2RlXHJcbiAgY29uc3QgbWlub3JIb3Jpem9udGFsTGluZVNwaW5uZXIgPSBjcmVhdGVMYWJlbGxlZFNwaW5uZXIoICdNaW5vciBIb3Jpem9udGFsIFNwYWNpbmcnLCBtaW5vckhvcml6b250YWxMaW5lU3BhY2luZ1Byb3BlcnR5LCBob3Jpem9udGFsTGluZXNWaXNpYmxlUHJvcGVydHksIDEgKTtcclxuICBjb25zdCBtaW5vclZlcnRpY2FsTGluZVNwaW5uZXIgPSBjcmVhdGVMYWJlbGxlZFNwaW5uZXIoICdNaW5vciBWZXJ0aWNhbCBTcGFjaW5nJywgbWlub3JWZXJ0aWNhbExpbmVTcGFjaW5nUHJvcGVydHksIHZlcnRpY2FsTGluZXNWaXNpYmxlUHJvcGVydHksIDEgKTtcclxuICBjb25zdCBtYWpvckhvcml6b250YWxMaW5lU3Bpbm5lciA9IGNyZWF0ZUxhYmVsbGVkU3Bpbm5lciggJ01ham9yIEhvcml6b250YWwgU3BhY2luZycsIG1ham9ySG9yaXpvbnRhbExpbmVTcGFjaW5nUHJvcGVydHksIGhvcml6b250YWxMaW5lc1Zpc2libGVQcm9wZXJ0eSwgMiApO1xyXG4gIGNvbnN0IG1ham9yVmVydGljYWxMaW5lU3Bpbm5lciA9IGNyZWF0ZUxhYmVsbGVkU3Bpbm5lciggJ01ham9yIFZlcnRpY2FsIFNwYWNpbmcnLCBtYWpvclZlcnRpY2FsTGluZVNwYWNpbmdQcm9wZXJ0eSwgdmVydGljYWxMaW5lc1Zpc2libGVQcm9wZXJ0eSwgMiApO1xyXG5cclxuICBjb25zdCBoaWRlSG9yaXpvbnRhbExpbmVzQnV0dG9uID0gY3JlYXRlVG9nZ2xlTGluZXNCdXR0b24oIGhvcml6b250YWxMaW5lc1Zpc2libGVQcm9wZXJ0eSwgJ0hpZGUgSG9yaXpvbnRhbCcsICdTaG93IEhvcml6b250YWwnICk7XHJcbiAgY29uc3QgaGlkZVZlcnRpY2FsTGluZXNCdXR0b24gPSBjcmVhdGVUb2dnbGVMaW5lc0J1dHRvbiggdmVydGljYWxMaW5lc1Zpc2libGVQcm9wZXJ0eSwgJ0hpZGUgVmVydGljYWwnLCAnU2hvdyBIb3Jpem9udGFsJyApO1xyXG5cclxuICBjb25zdCBoaWRlQnV0dG9uc0hCb3ggPSBuZXcgSEJveCgge1xyXG4gICAgY2hpbGRyZW46IFsgaGlkZUhvcml6b250YWxMaW5lc0J1dHRvbiwgaGlkZVZlcnRpY2FsTGluZXNCdXR0b24gXSxcclxuICAgIHNwYWNpbmc6IDEwXHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBzY3JvbGxCdXR0b24gPSBuZXcgQm9vbGVhblJlY3Rhbmd1bGFyU3RpY2t5VG9nZ2xlQnV0dG9uKCBzY3JvbGxpbmdQcm9wZXJ0eSwge1xyXG4gICAgY29udGVudDogbmV3IFRleHQoICdTY3JvbGwnIClcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IGNvbnRyb2xzID0gbmV3IFZCb3goIHtcclxuICAgIGNoaWxkcmVuOiBbIG1pbm9ySG9yaXpvbnRhbExpbmVTcGlubmVyLCBtaW5vclZlcnRpY2FsTGluZVNwaW5uZXIsIG1ham9ySG9yaXpvbnRhbExpbmVTcGlubmVyLCBtYWpvclZlcnRpY2FsTGluZVNwaW5uZXIsIGhpZGVCdXR0b25zSEJveCwgc2Nyb2xsQnV0dG9uIF0sXHJcbiAgICBzcGFjaW5nOiAxNSxcclxuICAgIGFsaWduOiAncmlnaHQnXHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBub2RlID0gbmV3IEhCb3goIHtcclxuICAgIGNoaWxkcmVuOiBbIGNvbnRyb2xzLCBncmlkTm9kZSBdLFxyXG4gICAgc3BhY2luZzogMTUsXHJcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXIsXHJcbiAgICByZXNpemU6IGZhbHNlXHJcbiAgfSApO1xyXG5cclxuICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHZlcnRpY2FsTGluZXNWaXNpYmxlUHJvcGVydHksIGhvcml6b250YWxMaW5lc1Zpc2libGVQcm9wZXJ0eSBdLCAoIHZlcnRpY2FsVmlzaWJsZSwgaG9yaXpvbnRhbFZpc2libGUgKSA9PiB7XHJcbiAgICBjb25zdCBtYWpvclZlcnRpY2FsTGluZVNwYWNpbmcgPSB2ZXJ0aWNhbFZpc2libGUgPyBtYWpvclZlcnRpY2FsTGluZVNwYWNpbmdQcm9wZXJ0eS5nZXQoKSA6IG51bGw7XHJcbiAgICBjb25zdCBtaW5vclZlcnRpY2FsTGluZVNwYWNpbmcgPSB2ZXJ0aWNhbFZpc2libGUgPyBtaW5vclZlcnRpY2FsTGluZVNwYWNpbmdQcm9wZXJ0eS5nZXQoKSA6IG51bGw7XHJcbiAgICBjb25zdCBtYWpvckhvcml6b250YWxMaW5lU3BhY2luZyA9IGhvcml6b250YWxWaXNpYmxlID8gbWFqb3JIb3Jpem9udGFsTGluZVNwYWNpbmdQcm9wZXJ0eS5nZXQoKSA6IG51bGw7XHJcbiAgICBjb25zdCBtaW5vckhvcml6b250YWxMaW5lU3BhY2luZyA9IGhvcml6b250YWxWaXNpYmxlID8gbWlub3JIb3Jpem9udGFsTGluZVNwYWNpbmdQcm9wZXJ0eS5nZXQoKSA6IG51bGw7XHJcblxyXG4gICAgZ3JpZE5vZGUuc2V0TGluZVNwYWNpbmdzKCB7XHJcbiAgICAgIG1ham9yVmVydGljYWxMaW5lU3BhY2luZzogbWFqb3JWZXJ0aWNhbExpbmVTcGFjaW5nLFxyXG4gICAgICBtYWpvckhvcml6b250YWxMaW5lU3BhY2luZzogbWFqb3JIb3Jpem9udGFsTGluZVNwYWNpbmcsXHJcbiAgICAgIG1pbm9yVmVydGljYWxMaW5lU3BhY2luZzogbWlub3JWZXJ0aWNhbExpbmVTcGFjaW5nLFxyXG4gICAgICBtaW5vckhvcml6b250YWxMaW5lU3BhY2luZzogbWlub3JIb3Jpem9udGFsTGluZVNwYWNpbmdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBkaXNhYmxlIHRoZSBvdGhlciBidXR0b24sIGNhbnQgaGF2ZSBib3RoIHNldHMgaGlkZGVuIGF0IG9uY2VcclxuICAgIGhpZGVIb3Jpem9udGFsTGluZXNCdXR0b24uZW5hYmxlZCA9IHZlcnRpY2FsVmlzaWJsZTtcclxuICAgIGhpZGVWZXJ0aWNhbExpbmVzQnV0dG9uLmVuYWJsZWQgPSBob3Jpem9udGFsVmlzaWJsZTtcclxuICB9ICk7XHJcblxyXG4gIE11bHRpbGluay5tdWx0aWxpbmsoIFsgbWFqb3JWZXJ0aWNhbExpbmVTcGFjaW5nUHJvcGVydHksIG1ham9ySG9yaXpvbnRhbExpbmVTcGFjaW5nUHJvcGVydHksIG1pbm9ySG9yaXpvbnRhbExpbmVTcGFjaW5nUHJvcGVydHksIG1pbm9yVmVydGljYWxMaW5lU3BhY2luZ1Byb3BlcnR5IF0sXHJcbiAgICAoIG1ham9yVmVydGljYWxMaW5lU3BhY2luZywgbWFqb3JIb3Jpem9udGFsTGluZVNwYWNpbmcsIG1pbm9yVmVydGljYWxMaW5lU3BhY2luZywgbWlub3JIb3Jpem9udGFsTGluZVNwYWNpbmcgKSA9PiB7XHJcbiAgICAgIGdyaWROb2RlLnNldExpbmVTcGFjaW5ncygge1xyXG4gICAgICAgIG1ham9yVmVydGljYWxMaW5lU3BhY2luZzogbWFqb3JWZXJ0aWNhbExpbmVTcGFjaW5nLFxyXG4gICAgICAgIG1ham9ySG9yaXpvbnRhbExpbmVTcGFjaW5nOiBtYWpvckhvcml6b250YWxMaW5lU3BhY2luZyxcclxuICAgICAgICBtaW5vclZlcnRpY2FsTGluZVNwYWNpbmc6IG1pbm9yVmVydGljYWxMaW5lU3BhY2luZyxcclxuICAgICAgICBtaW5vckhvcml6b250YWxMaW5lU3BhY2luZzogbWlub3JIb3Jpem9udGFsTGluZVNwYWNpbmdcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICk7XHJcblxyXG4gIGxldCBvZmZzZXQgPSAwO1xyXG4gIGVtaXR0ZXIuYWRkTGlzdGVuZXIoIGR0ID0+IHtcclxuICAgIGlmICggc2Nyb2xsaW5nUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIG9mZnNldCAtPSBkdDtcclxuICAgICAgY29uc3Qgb2Zmc2V0VmVjdG9yID0gbmV3IFZlY3RvcjIoIG9mZnNldCwgb2Zmc2V0ICk7XHJcblxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS5zZXQoIE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlUmVjdGFuZ2xlTWFwcGluZyhcclxuICAgICAgICBuZXcgQm91bmRzMiggb2Zmc2V0VmVjdG9yLngsIG9mZnNldFZlY3Rvci55LCAxMCArIG9mZnNldFZlY3Rvci54LCAxMCArIG9mZnNldFZlY3Rvci55ICksXHJcbiAgICAgICAgbmV3IEJvdW5kczIoIDAsIDAsIGdyaWRXaWR0aCwgZ3JpZEhlaWdodCApXHJcbiAgICAgICkgKTtcclxuICAgIH1cclxuICB9ICk7XHJcblxyXG4gIHJldHVybiBub2RlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYW4gZXhhbXBsZSBYWUNoYXJ0Tm9kZVxyXG4gKiBAcGFyYW0gbGF5b3V0Qm91bmRzXHJcbiAqL1xyXG5jb25zdCBkZW1vU2Nyb2xsaW5nQ2hhcnROb2RlID0gZnVuY3Rpb24oIGxheW91dEJvdW5kcyApIHtcclxuICBjb25zdCB0aW1lUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAgKTtcclxuICBjb25zdCBzZXJpZXMxID0gbmV3IER5bmFtaWNTZXJpZXMoIHsgY29sb3I6ICdibHVlJywgbGluZVdpZHRoOiAzLCByYWRpdXM6IDcgfSApO1xyXG4gIGNvbnN0IHNlcmllczIgPSBuZXcgRHluYW1pY1NlcmllcyggeyBjb2xvcjogJ29yYW5nZScsIGxpbmVXaWR0aDogMywgcmFkaXVzOiA3IH0gKTtcclxuICBjb25zdCBob3Jpem9udGFsUmFuZ2UgPSBuZXcgUmFuZ2UoIDAsIDEwICk7XHJcbiAgY29uc3QgdmVydGljYWxSYW5nZSA9IG5ldyBSYW5nZSggLTUsIDUgKTtcclxuICBjb25zdCBtYXhUaW1lID0gaG9yaXpvbnRhbFJhbmdlLm1heDtcclxuICBjb25zdCBjaGFydFdpZHRoID0gNTAwO1xyXG4gIGNvbnN0IGNoYXJ0SGVpZ2h0ID0gNTAwO1xyXG5cclxuICBjb25zdCBzdHlsZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBEeW5hbWljU2VyaWVzTm9kZS5QbG90U3R5bGUuTElORSApO1xyXG5cclxuICBjb25zdCBsYWJlbEZvbnQgPSBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMjUgfSApO1xyXG4gIGNvbnN0IHN0eWxlU3dpdGNoID0gbmV3IEFCU3dpdGNoKFxyXG4gICAgc3R5bGVQcm9wZXJ0eSxcclxuICAgIER5bmFtaWNTZXJpZXNOb2RlLlBsb3RTdHlsZS5MSU5FLFxyXG4gICAgbmV3IFRleHQoICdMaW5lJywgeyBmb250OiBsYWJlbEZvbnQgfSApLFxyXG4gICAgRHluYW1pY1Nlcmllc05vZGUuUGxvdFN0eWxlLlNDQVRURVIsXHJcbiAgICBuZXcgVGV4dCggJ1NjYXR0ZXInLCB7IGZvbnQ6IGxhYmVsRm9udCB9IClcclxuICApO1xyXG5cclxuICBjb25zdCBtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVSZWN0YW5nbGVJbnZlcnRlZFlNYXBwaW5nKFxyXG4gICAgbmV3IEJvdW5kczIoIGhvcml6b250YWxSYW5nZS5taW4sIHZlcnRpY2FsUmFuZ2UubWluLCBob3Jpem9udGFsUmFuZ2UubWF4LCB2ZXJ0aWNhbFJhbmdlLm1heCApLFxyXG4gICAgbmV3IEJvdW5kczIoIDAsIDAsIGNoYXJ0V2lkdGgsIGNoYXJ0SGVpZ2h0IClcclxuICApICk7XHJcblxyXG4gIGNvbnN0IGxpc3RlbmVyID0gZHQgPT4ge1xyXG5cclxuICAgIC8vIEluY3JlbWVudCB0aGUgbW9kZWwgdGltZVxyXG4gICAgdGltZVByb3BlcnR5LnZhbHVlICs9IGR0O1xyXG5cclxuICAgIC8vIHRpbWUgaGFzIGdvbmUgYmV5b25kIHRoZSBpbml0aWFsIG1heCB0aW1lLCBzbyB1cGRhdGUgdGhlIHRyYW5zZm9ybSB0byBwYW4gZGF0YSBzbyB0aGF0IHRoZSBuZXcgcG9pbnRzXHJcbiAgICAvLyBhcmUgaW4gdmlld1xyXG4gICAgaWYgKCB0aW1lUHJvcGVydHkuZ2V0KCkgPiBtYXhUaW1lICkge1xyXG5cclxuICAgICAgY29uc3QgbWluWSA9IHZlcnRpY2FsUmFuZ2UubWluICsgdGltZVByb3BlcnR5LnZhbHVlIC0gbWF4VGltZTtcclxuICAgICAgY29uc3QgbWF4WSA9IHZlcnRpY2FsUmFuZ2UubWF4ICsgdGltZVByb3BlcnR5LnZhbHVlIC0gbWF4VGltZTtcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkuc2V0KCBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZVJlY3RhbmdsZUludmVydGVkWU1hcHBpbmcoXHJcbiAgICAgICAgbmV3IEJvdW5kczIoIHRpbWVQcm9wZXJ0eS5nZXQoKSAtIG1heFRpbWUsIG1pblksIHRpbWVQcm9wZXJ0eS5nZXQoKSwgbWF4WSApLFxyXG4gICAgICAgIG5ldyBCb3VuZHMyKCAwLCAwLCBjaGFydFdpZHRoLCBjaGFydEhlaWdodCApXHJcbiAgICAgICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBkcmF3aW5nIGEgc2NhdHRlciBwbG90LCBqdXN0IGRyYXcgYSBuZXcgZG90IGV2ZXJ5IGhhbGYgc2Vjb25kXHJcbiAgICBpZiAoIHN0eWxlUHJvcGVydHkuZ2V0KCkgPT09IER5bmFtaWNTZXJpZXNOb2RlLlBsb3RTdHlsZS5TQ0FUVEVSICYmIHNlcmllczEuaGFzRGF0YSgpICkge1xyXG4gICAgICBjb25zdCB0aW1lRGlmZmVyZW5jZSA9IHRpbWVQcm9wZXJ0eS5nZXQoKSAtIHNlcmllczEuZ2V0RGF0YVBvaW50KCBzZXJpZXMxLmdldExlbmd0aCgpIC0gMSApLng7XHJcbiAgICAgIGlmICggdGltZURpZmZlcmVuY2UgPCAwLjUgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2FtcGxlIG5ldyBkYXRhXHJcbiAgICBzZXJpZXMxLmFkZFhZRGF0YVBvaW50KCB0aW1lUHJvcGVydHkudmFsdWUsIHRpbWVQcm9wZXJ0eS52YWx1ZSArIE1hdGguc2luKCB0aW1lUHJvcGVydHkudmFsdWUgKSArIHZlcnRpY2FsUmFuZ2UubWluICk7XHJcbiAgICBzZXJpZXMyLmFkZFhZRGF0YVBvaW50KCB0aW1lUHJvcGVydHkudmFsdWUsIHRpbWVQcm9wZXJ0eS52YWx1ZSArIE1hdGguc2luKCB0aW1lUHJvcGVydHkudmFsdWUgKyAxICkgKyB2ZXJ0aWNhbFJhbmdlLm1pbiApO1xyXG5cclxuICAgIC8vIERhdGEgdGhhdCBkb2VzIG5vdCBmYWxsIHdpdGhpbiB0aGUgZGlzcGxheWVkIHdpbmRvdyBzaG91bGQgYmUgcmVtb3ZlZC5cclxuICAgIHdoaWxlICggc2VyaWVzMS5nZXREYXRhUG9pbnQoIDAgKS54IDwgdGltZVByb3BlcnR5LnZhbHVlIC0gbWF4VGltZSApIHtcclxuICAgICAgc2VyaWVzMS5zaGlmdERhdGEoKTtcclxuICAgICAgc2VyaWVzMi5zaGlmdERhdGEoKTtcclxuICAgIH1cclxuICB9O1xyXG4gIGVtaXR0ZXIuYWRkTGlzdGVuZXIoIGxpc3RlbmVyICk7XHJcbiAgY29uc3Qgc2Nyb2xsaW5nQ2hhcnROb2RlID0gbmV3IFhZQ2hhcnROb2RlKCB7XHJcbiAgICB3aWR0aDogY2hhcnRXaWR0aCxcclxuICAgIGhlaWdodDogY2hhcnRIZWlnaHQsXHJcbiAgICB2ZXJ0aWNhbEF4aXNMYWJlbE5vZGU6IG5ldyBUZXh0KCAnSGVpZ2h0IChtKScsIHsgZmlsbDogJ3doaXRlJywgcm90YXRpb246IDMgKiBNYXRoLlBJIC8gMiB9ICksXHJcbiAgICBob3Jpem9udGFsQXhpc0xhYmVsTm9kZTogbmV3IFRleHQoICd0aW1lIChzKScsIHsgZmlsbDogJ3doaXRlJyB9ICksXHJcbiAgICBtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eTogbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHlcclxuICB9ICk7XHJcbiAgc2Nyb2xsaW5nQ2hhcnROb2RlLmFkZER5bmFtaWNTZXJpZXNBcnJheSggWyBzZXJpZXMxLCBzZXJpZXMyIF0gKTtcclxuXHJcbiAgc3R5bGVQcm9wZXJ0eS5saW5rKCBzdHlsZSA9PiB7XHJcbiAgICBzY3JvbGxpbmdDaGFydE5vZGUuc2V0UGxvdFN0eWxlKCBzdHlsZSApO1xyXG4gICAgc2VyaWVzMS5jbGVhcigpO1xyXG4gICAgc2VyaWVzMi5jbGVhcigpO1xyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgcGFuZWwgPSBuZXcgUGFuZWwoIHNjcm9sbGluZ0NoYXJ0Tm9kZSwge1xyXG4gICAgZmlsbDogJ2dyYXknLFxyXG4gICAgcmVzaXplOiBmYWxzZVxyXG4gIH0gKTtcclxuXHJcbiAgLy8gU3dhcCBvdXQgdGhlIGRpc3Bvc2UgZnVuY3Rpb24gZm9yIG9uZSB0aGF0IGFsc28gcmVtb3ZlcyB0aGUgRW1pdHRlciBsaXN0ZW5lclxyXG4gIGNvbnN0IHBhbmVsRGlzcG9zZSA9IHBhbmVsLmRpc3Bvc2UuYmluZCggcGFuZWwgKTtcclxuICBwYW5lbC5kaXNwb3NlID0gKCkgPT4ge1xyXG4gICAgZW1pdHRlci5yZW1vdmVMaXN0ZW5lciggbGlzdGVuZXIgKTtcclxuICAgIHBhbmVsRGlzcG9zZSgpO1xyXG4gIH07XHJcblxyXG4gIHJldHVybiBuZXcgVkJveCgge1xyXG4gICAgY2hpbGRyZW46IFsgcGFuZWwsIHN0eWxlU3dpdGNoIF0sXHJcbiAgICBzcGFjaW5nOiAxNSxcclxuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlci5wbHVzWFkoIDI1LCAwIClcclxuICB9ICk7XHJcbn07XHJcblxyXG5jb25zdCBkZW1vU2Vpc21vZ3JhcGhOb2RlID0gbGF5b3V0Qm91bmRzID0+IHtcclxuICBjb25zdCB0aW1lUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAgKTtcclxuICBjb25zdCBzZXJpZXMxID0gbmV3IER5bmFtaWNTZXJpZXMoIHsgY29sb3I6ICdibHVlJyB9ICk7XHJcbiAgY29uc3QgbWF4VGltZSA9IDQ7XHJcbiAgY29uc3QgbGlzdGVuZXIgPSBkdCA9PiB7XHJcblxyXG4gICAgLy8gSW5jcmVtZW50IHRoZSBtb2RlbCB0aW1lXHJcbiAgICB0aW1lUHJvcGVydHkudmFsdWUgKz0gZHQ7XHJcblxyXG4gICAgLy8gU2FtcGxlIG5ldyBkYXRhXHJcbiAgICBzZXJpZXMxLmFkZFhZRGF0YVBvaW50KCB0aW1lUHJvcGVydHkudmFsdWUsIE1hdGguc2luKCB0aW1lUHJvcGVydHkudmFsdWUgKSApO1xyXG5cclxuICAgIC8vIERhdGEgdGhhdCBkb2VzIG5vdCBmYWxsIHdpdGhpbiB0aGUgZGlzcGxheWVkIHdpbmRvdyBzaG91bGQgYmUgcmVtb3ZlZC5cclxuICAgIHdoaWxlICggc2VyaWVzMS5nZXREYXRhUG9pbnQoIDAgKS54IDwgdGltZVByb3BlcnR5LnZhbHVlIC0gbWF4VGltZSApIHtcclxuICAgICAgc2VyaWVzMS5zaGlmdERhdGEoKTtcclxuICAgIH1cclxuICB9O1xyXG4gIGVtaXR0ZXIuYWRkTGlzdGVuZXIoIGxpc3RlbmVyICk7XHJcbiAgY29uc3Qgc2Vpc21vZ3JhcGhOb2RlID0gbmV3IFNlaXNtb2dyYXBoTm9kZSggdGltZVByb3BlcnR5LCBbIHNlcmllczEgXSwgbmV3IFRleHQoICcxIHMnLCB7IGZpbGw6ICd3aGl0ZScgfSApLCB7XHJcbiAgICB3aWR0aDogMjAwLFxyXG4gICAgaGVpZ2h0OiAxNTAsXHJcbiAgICB2ZXJ0aWNhbEdyaWRMYWJlbE51bWJlck9mRGVjaW1hbFBsYWNlczogMSxcclxuICAgIGhvcml6b250YWxHcmlkTGFiZWxOdW1iZXJPZkRlY2ltYWxQbGFjZXM6IDEsXHJcbiAgICB2ZXJ0aWNhbEF4aXNMYWJlbE5vZGU6IG5ldyBUZXh0KCAnSGVpZ2h0IChtKScsIHtcclxuICAgICAgcm90YXRpb246IDMgKiBNYXRoLlBJIC8gMixcclxuICAgICAgZmlsbDogJ3doaXRlJ1xyXG4gICAgfSApLFxyXG4gICAgaG9yaXpvbnRhbEF4aXNMYWJlbE5vZGU6IG5ldyBUZXh0KCAndGltZSAocyknLCB7IGZpbGw6ICd3aGl0ZScgfSApLFxyXG4gICAgdmVydGljYWxSYW5nZXM6IFsgbmV3IFJhbmdlKCAtMSwgMSApIF1cclxuICB9ICk7XHJcbiAgY29uc3QgcGFuZWwgPSBuZXcgUGFuZWwoIHNlaXNtb2dyYXBoTm9kZSwge1xyXG4gICAgZmlsbDogJ2dyYXknLFxyXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXHJcbiAgfSApO1xyXG5cclxuICAvLyBTd2FwIG91dCB0aGUgZGlzcG9zZSBmdW5jdGlvbiBmb3Igb25lIHRoYXQgYWxzbyByZW1vdmVzIHRoZSBFbWl0dGVyIGxpc3RlbmVyXHJcbiAgY29uc3QgcGFuZWxEaXNwb3NlID0gcGFuZWwuZGlzcG9zZS5iaW5kKCBwYW5lbCApO1xyXG4gIHBhbmVsLmRpc3Bvc2UgPSAoKSA9PiB7XHJcbiAgICBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBsaXN0ZW5lciApO1xyXG4gICAgcGFuZWxEaXNwb3NlKCk7XHJcbiAgfTtcclxuICByZXR1cm4gcGFuZWw7XHJcbn07XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhbiBleGFtcGxlIFhZQ3Vyc29yQ2hhcnROb2RlXHJcbiAqIEBwYXJhbSBsYXlvdXRCb3VuZHNcclxuICogQHJldHVybnMge1hZQ3Vyc29yQ2hhcnROb2RlfVxyXG4gKi9cclxuY29uc3QgZGVtb1hZQ3Vyc29yUGxvdCA9IGxheW91dEJvdW5kcyA9PiB7XHJcbiAgY29uc3QgY2hhcnRXaWR0aCA9IDgwMDtcclxuICBjb25zdCBjaGFydEhlaWdodCA9IDIwMDtcclxuICBjb25zdCBtYXhUaW1lID0gMTA7XHJcbiAgY29uc3QgY2hhcnRSYW5nZSA9IG5ldyBSYW5nZSggLTEsIDEgKTtcclxuXHJcbiAgY29uc3QgdGltZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcblxyXG4gIGNvbnN0IG1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZVJlY3RhbmdsZUludmVydGVkWU1hcHBpbmcoXHJcbiAgICBuZXcgQm91bmRzMiggMCwgY2hhcnRSYW5nZS5taW4sIG1heFRpbWUsIGNoYXJ0UmFuZ2UubWF4ICksXHJcbiAgICBuZXcgQm91bmRzMiggMCwgMCwgY2hhcnRXaWR0aCwgY2hhcnRIZWlnaHQgKVxyXG4gICkgKTtcclxuXHJcbiAgY29uc3QgZGF0YVNlcmllcyA9IG5ldyBEeW5hbWljU2VyaWVzKCk7XHJcblxyXG4gIC8vIHdoaWxlIGRyYWdnaW5nLFxyXG4gIGxldCBkcmFnZ2luZyA9IGZhbHNlO1xyXG5cclxuICBjb25zdCBjaGFydE5vZGUgPSBuZXcgWFlDdXJzb3JDaGFydE5vZGUoIHtcclxuICAgIHdpZHRoOiBjaGFydFdpZHRoLFxyXG4gICAgaGVpZ2h0OiBjaGFydEhlaWdodCxcclxuICAgIG1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5OiBtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSxcclxuICAgIG1heFg6IG1heFRpbWUsXHJcbiAgICBzaG93QXhpczogZmFsc2UsXHJcbiAgICBtaW5ZOiBjaGFydFJhbmdlLm1pbixcclxuICAgIG1heFk6IGNoYXJ0UmFuZ2UubWF4LFxyXG4gICAgbGluZURhc2g6IFsgNCwgNCBdLFxyXG5cclxuICAgIHZlcnRpY2FsQXhpc0xhYmVsTm9kZTogbmV3IFRleHQoICdWYWx1ZScsIHsgcm90YXRpb246IDMgKiBNYXRoLlBJIC8gMiwgZmlsbDogJ3doaXRlJyB9ICksXHJcbiAgICBob3Jpem9udGFsQXhpc0xhYmVsTm9kZTogbmV3IFRleHQoICdUaW1lIChzKScsIHsgZmlsbDogJ3doaXRlJyB9ICksXHJcblxyXG4gICAgY3Vyc29yT3B0aW9uczoge1xyXG4gICAgICBzdGFydERyYWc6ICgpID0+IHtcclxuICAgICAgICBkcmFnZ2luZyA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICAgIGVuZERyYWc6ICgpID0+IHtcclxuICAgICAgICBkcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSApO1xyXG4gIGNoYXJ0Tm9kZS5hZGREeW5hbWljU2VyaWVzKCBkYXRhU2VyaWVzICk7XHJcblxyXG4gIGNvbnN0IGNoYXJ0UGFuZWwgPSBuZXcgUGFuZWwoIGNoYXJ0Tm9kZSwge1xyXG4gICAgZmlsbDogJ2dyZXknLFxyXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyLFxyXG4gICAgcmVzaXplOiBmYWxzZVxyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgbGlzdGVuZXIgPSBkdCA9PiB7XHJcblxyXG4gICAgLy8gbm8gcmVjb3JkaW5nIGlmIHdlIGFyZSBkcmFnZ2luZyB0aGUgY3Vyc29yXHJcbiAgICBpZiAoICFkcmFnZ2luZyApIHtcclxuXHJcbiAgICAgIC8vIEluY3JlbWVudCB0aGUgbW9kZWwgdGltZVxyXG4gICAgICB0aW1lUHJvcGVydHkuc2V0KCB0aW1lUHJvcGVydHkuZ2V0KCkgKyBkdCApO1xyXG5cclxuICAgICAgLy8gU2FtcGxlIG5ldyBkYXRhXHJcbiAgICAgIGRhdGFTZXJpZXMuYWRkWFlEYXRhUG9pbnQoIHRpbWVQcm9wZXJ0eS5nZXQoKSwgTWF0aC5zaW4oIHRpbWVQcm9wZXJ0eS5nZXQoKSApICk7XHJcblxyXG4gICAgICAvLyB0aW1lIGhhcyBnb25lIGJleW9uZCB0aGUgaW5pdGlhbCBtYXggdGltZSwgc28gdXBkYXRlIHRoZSB0cmFuc2Zvcm0gdG8gcGFuIGRhdGEgc28gdGhhdCB0aGUgbmV3IHBvaW50c1xyXG4gICAgICAvLyBhcmUgaW4gdmlld1xyXG4gICAgICBpZiAoIHRpbWVQcm9wZXJ0eS5nZXQoKSA+IG1heFRpbWUgKSB7XHJcbiAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkuc2V0KCBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZVJlY3RhbmdsZUludmVydGVkWU1hcHBpbmcoXHJcbiAgICAgICAgICBuZXcgQm91bmRzMiggdGltZVByb3BlcnR5LmdldCgpIC0gbWF4VGltZSwgY2hhcnRSYW5nZS5taW4sIHRpbWVQcm9wZXJ0eS5nZXQoKSwgY2hhcnRSYW5nZS5tYXggKSxcclxuICAgICAgICAgIG5ldyBCb3VuZHMyKCAwLCAwLCBjaGFydFdpZHRoLCBjaGFydEhlaWdodCApXHJcbiAgICAgICAgKSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBEYXRhIHRoYXQgZG9lcyBub3QgZmFsbCB3aXRoaW4gdGhlIGRpc3BsYXllZCB3aW5kb3cgc2hvdWxkIGJlIHJlbW92ZWQuXHJcbiAgICAgIHdoaWxlICggZGF0YVNlcmllcy5nZXREYXRhUG9pbnQoIDAgKS54IDwgdGltZVByb3BlcnR5LnZhbHVlIC0gbWF4VGltZSApIHtcclxuICAgICAgICBkYXRhU2VyaWVzLnNoaWZ0RGF0YSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjaGFydE5vZGUuc2V0Q3Vyc29yVmFsdWUoIHRpbWVQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgZW1pdHRlci5hZGRMaXN0ZW5lciggbGlzdGVuZXIgKTtcclxuXHJcbiAgcmV0dXJuIGNoYXJ0UGFuZWw7XHJcbn07XHJcblxyXG5ncmlkZGxlLnJlZ2lzdGVyKCAnR3JpZGRsZURlbW9TY3JlZW5WaWV3JywgR3JpZGRsZURlbW9TY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IEdyaWRkbGVEZW1vU2NyZWVuVmlldzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSxxQ0FBcUM7QUFDakUsT0FBT0MsT0FBTyxNQUFNLDZCQUE2QjtBQUNqRCxPQUFPQyxTQUFTLE1BQU0sK0JBQStCO0FBQ3JELE9BQU9DLGNBQWMsTUFBTSxvQ0FBb0M7QUFDL0QsT0FBT0MsUUFBUSxNQUFNLDhCQUE4QjtBQUNuRCxPQUFPQyxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLFVBQVUsTUFBTSwrQkFBK0I7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLDBCQUEwQjtBQUM1QyxPQUFPQyxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLGtCQUFrQixNQUFNLDZDQUE2QztBQUM1RSxPQUFPQyxLQUFLLE1BQU0sZ0NBQWdDO0FBQ2xELE9BQU9DLG1CQUFtQixNQUFNLG9EQUFvRDtBQUNwRixPQUFPQyxRQUFRLE1BQU0sc0NBQXNDO0FBQzNELE9BQU9DLDBCQUEwQixNQUFNLHdEQUF3RDtBQUMvRixTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsZ0NBQWdDO0FBQ3ZFLE9BQU9DLFFBQVEsTUFBTSw2QkFBNkI7QUFDbEQsT0FBT0Msb0NBQW9DLE1BQU0saUVBQWlFO0FBQ2xILE9BQU9DLDhCQUE4QixNQUFNLDJEQUEyRDtBQUN0RyxPQUFPQyxlQUFlLE1BQU0seUNBQXlDO0FBQ3JFLE9BQU9DLGFBQWEsTUFBTSxrQ0FBa0M7QUFDNUQsT0FBT0MsS0FBSyxNQUFNLDBCQUEwQjtBQUM1QyxPQUFPQyxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLFlBQVksTUFBTSxvQkFBb0I7QUFDN0MsT0FBT0MsYUFBYSxNQUFNLHFCQUFxQjtBQUMvQyxPQUFPQyxpQkFBaUIsTUFBTSx5QkFBeUI7QUFDdkQsT0FBT0MsT0FBTyxNQUFNLGVBQWU7QUFDbkMsT0FBT0MsUUFBUSxNQUFNLGdCQUFnQjtBQUNyQyxPQUFPQyxlQUFlLE1BQU0sdUJBQXVCO0FBQ25ELE9BQU9DLFdBQVcsTUFBTSxtQkFBbUI7QUFDM0MsT0FBT0MsaUJBQWlCLE1BQU0seUJBQXlCOztBQUV2RDtBQUNBLE1BQU1DLE9BQU8sR0FBRyxJQUFJaEMsT0FBTyxDQUFFO0VBQUVpQyxVQUFVLEVBQUUsQ0FBRTtJQUFFQyxTQUFTLEVBQUU7RUFBUyxDQUFDO0FBQUcsQ0FBRSxDQUFDO0FBRTFFLE1BQU1DLHFCQUFxQixTQUFTZixlQUFlLENBQUM7RUFDbERnQixXQUFXQSxDQUFBLEVBQUc7SUFDWkMsTUFBTSxJQUFJN0Isa0JBQWtCLENBQUUsbUJBQW9CLENBQUM7SUFFbkQsS0FBSyxDQUFFO0lBRUw7QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ007TUFBRThCLEtBQUssRUFBRSxVQUFVO01BQUVDLFVBQVUsRUFBRUM7SUFBYSxDQUFDLEVBQy9DO01BQUVGLEtBQUssRUFBRSxVQUFVO01BQUVDLFVBQVUsRUFBRUU7SUFBYSxDQUFDLEVBQy9DO01BQUVILEtBQUssRUFBRSxhQUFhO01BQUVDLFVBQVUsRUFBRUc7SUFBdUIsQ0FBQyxFQUM1RDtNQUFFSixLQUFLLEVBQUUsaUJBQWlCO01BQUVDLFVBQVUsRUFBRUk7SUFBb0IsQ0FBQyxFQUM3RDtNQUFFTCxLQUFLLEVBQUUsbUJBQW1CO01BQUVDLFVBQVUsRUFBRUs7SUFBaUIsQ0FBQyxDQUM3RCxFQUFFO01BQ0RDLGlCQUFpQixFQUFFakMsMEJBQTBCLENBQUNrQztJQUNoRCxDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLElBQUlBLENBQUVDLEVBQUUsRUFBRztJQUNUaEIsT0FBTyxDQUFDaUIsSUFBSSxDQUFFRCxFQUFHLENBQUM7RUFDcEI7QUFDRjs7QUFFQTtBQUNBLE1BQU1SLFlBQVksR0FBRyxTQUFBQSxDQUFVVSxZQUFZLEVBQUc7RUFDNUMsTUFBTUMsS0FBSyxHQUFHO0lBQ1pDLFNBQVMsRUFBRSxJQUFJakQsUUFBUSxDQUFFLENBQUUsQ0FBQztJQUM1QmtELFNBQVMsRUFBRSxJQUFJbEQsUUFBUSxDQUFFLENBQUUsQ0FBQztJQUM1Qm1ELFNBQVMsRUFBRSxJQUFJbkQsUUFBUSxDQUFFLENBQUU7RUFDN0IsQ0FBQztFQUNELE1BQU1vRCxNQUFNLEdBQUc7SUFDYkMsUUFBUSxFQUFFTCxLQUFLLENBQUNDLFNBQVM7SUFDekJLLEtBQUssRUFBRTtFQUNULENBQUM7RUFDRCxNQUFNQyxNQUFNLEdBQUc7SUFDYkYsUUFBUSxFQUFFTCxLQUFLLENBQUNFLFNBQVM7SUFDekJJLEtBQUssRUFBRTtFQUNULENBQUM7RUFDRCxNQUFNRSxNQUFNLEdBQUc7SUFDYkgsUUFBUSxFQUFFTCxLQUFLLENBQUNHLFNBQVM7SUFDekJHLEtBQUssRUFBRTtFQUNULENBQUM7RUFFRCxNQUFNRyxZQUFZLEdBQUcsSUFBSXBDLFlBQVksQ0FBRSxDQUNyQztJQUFFcUMsT0FBTyxFQUFFLENBQUVOLE1BQU0sQ0FBRTtJQUFFakIsS0FBSyxFQUFFLElBQUl4QixJQUFJLENBQUM7RUFBRSxDQUFDLEVBQzFDO0lBQUUrQyxPQUFPLEVBQUUsQ0FBRUgsTUFBTSxDQUFFO0lBQUVwQixLQUFLLEVBQUUsSUFBSXhCLElBQUksQ0FBQztFQUFFLENBQUMsRUFDMUM7SUFBRStDLE9BQU8sRUFBRSxDQUFFRixNQUFNLENBQUU7SUFBRXJCLEtBQUssRUFBRSxJQUFJeEIsSUFBSSxDQUFDO0VBQUUsQ0FBQyxFQUMxQztJQUFFK0MsT0FBTyxFQUFFLENBQUVGLE1BQU0sRUFBRUQsTUFBTSxFQUFFSCxNQUFNLENBQUU7SUFBRWpCLEtBQUssRUFBRSxJQUFJeEIsSUFBSSxDQUFDO0VBQUUsQ0FBQyxDQUMzRCxFQUFFLElBQUlYLFFBQVEsQ0FBRSxJQUFJRyxLQUFLLENBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBSSxDQUFFLENBQUMsRUFBRTtJQUN6Q3dELFVBQVUsRUFBRTtNQUNWQyxVQUFVLEVBQUUsSUFBSXpELEtBQUssQ0FBRSxDQUFDLEdBQUcsRUFBRSxHQUFJO0lBQ25DO0VBQ0YsQ0FBRSxDQUFDO0VBQ0gsTUFBTTBELFFBQVEsR0FBRyxTQUFBQSxDQUFVaEIsRUFBRSxFQUFHO0lBQzlCWSxZQUFZLENBQUNLLE1BQU0sQ0FBQyxDQUFDO0VBQ3ZCLENBQUM7RUFDRGpDLE9BQU8sQ0FBQ2tDLFdBQVcsQ0FBRUYsUUFBUyxDQUFDO0VBQy9CLE1BQU1HLFdBQVcsR0FBRyxJQUFJN0QsS0FBSyxDQUFFLENBQUMsR0FBRyxFQUFFLEdBQUksQ0FBQztFQUMxQyxNQUFNOEQsYUFBYSxHQUFHO0lBQ3BCQyxTQUFTLEVBQUUsSUFBSWhFLFVBQVUsQ0FBRSxDQUFDLEVBQUUsR0FBSTtFQUNwQyxDQUFDO0VBQ0QsTUFBTWlFLElBQUksR0FBRyxJQUFJekQsSUFBSSxDQUFFO0lBQ3JCMEQsS0FBSyxFQUFFLEtBQUs7SUFDWkMsT0FBTyxFQUFFLEVBQUU7SUFDWEMsTUFBTSxFQUFFdkIsWUFBWSxDQUFDdUIsTUFBTTtJQUMzQkMsUUFBUSxFQUFFLENBQ1IsSUFBSTVELElBQUksQ0FBRTtNQUNSNEQsUUFBUSxFQUFFLENBQUVkLFlBQVk7SUFDMUIsQ0FBRSxDQUFDLEVBQ0gsSUFBSS9DLElBQUksQ0FBRTtNQUNSMkQsT0FBTyxFQUFFLEVBQUU7TUFDWEUsUUFBUSxFQUFFLENBQ1IsSUFBSW5ELE9BQU8sQ0FBRTRCLEtBQUssQ0FBQ0MsU0FBUyxFQUFFZSxXQUFXLEVBQUUxRCxLQUFLLENBQUUsQ0FBQyxDQUFDLEVBQUUyRCxhQUFhLEVBQUU7UUFBRU8sZ0JBQWdCLEVBQUVwQixNQUFNLENBQUNFO01BQU0sQ0FBRSxDQUFFLENBQUMsRUFDM0csSUFBSWxDLE9BQU8sQ0FBRTRCLEtBQUssQ0FBQ0UsU0FBUyxFQUFFYyxXQUFXLEVBQUUxRCxLQUFLLENBQUUsQ0FBQyxDQUFDLEVBQUUyRCxhQUFhLEVBQUU7UUFBRU8sZ0JBQWdCLEVBQUVqQixNQUFNLENBQUNEO01BQU0sQ0FBRSxDQUFFLENBQUMsRUFDM0csSUFBSWxDLE9BQU8sQ0FBRTRCLEtBQUssQ0FBQ0csU0FBUyxFQUFFYSxXQUFXLEVBQUUxRCxLQUFLLENBQUUsQ0FBQyxDQUFDLEVBQUUyRCxhQUFhLEVBQUU7UUFBRU8sZ0JBQWdCLEVBQUVoQixNQUFNLENBQUNGO01BQU0sQ0FBRSxDQUFFLENBQUM7SUFFL0csQ0FBRSxDQUFDO0VBRVAsQ0FBRSxDQUFDOztFQUVIO0VBQ0EsTUFBTW1CLFdBQVcsR0FBR04sSUFBSSxDQUFDTyxPQUFPLENBQUNDLElBQUksQ0FBRVIsSUFBSyxDQUFDO0VBQzdDQSxJQUFJLENBQUNPLE9BQU8sR0FBRyxZQUFXO0lBQ3hCN0MsT0FBTyxDQUFDK0MsY0FBYyxDQUFFZixRQUFTLENBQUM7SUFDbENZLFdBQVcsQ0FBQyxDQUFDO0VBQ2YsQ0FBQztFQUNELE9BQU9OLElBQUk7QUFDYixDQUFDOztBQUVEO0FBQ0EsTUFBTTdCLFlBQVksR0FBR1MsWUFBWSxJQUFJO0VBQ25DLE1BQU04QixTQUFTLEdBQUcsR0FBRztFQUNyQixNQUFNQyxVQUFVLEdBQUcsR0FBRztFQUN0QixNQUFNQyxpQkFBaUIsR0FBRyxJQUFJNUUsS0FBSyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7RUFDM0MsTUFBTTZFLGlCQUFpQixHQUFHLElBQUk3RSxLQUFLLENBQUUsQ0FBQyxFQUFFLEVBQUcsQ0FBQztFQUM1QyxNQUFNOEUsbUJBQW1CLEdBQUdGLGlCQUFpQixDQUFDRyxHQUFHO0VBQ2pELE1BQU1DLG1CQUFtQixHQUFHSCxpQkFBaUIsQ0FBQ0UsR0FBRztFQUNqRCxNQUFNRSwwQkFBMEIsR0FBRyxJQUFJcEYsUUFBUSxDQUFFTyxtQkFBbUIsQ0FBQzhFLHNCQUFzQixDQUN6RixJQUFJcEYsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQyxFQUMzQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTRFLFNBQVMsRUFBRUMsVUFBVyxDQUMzQyxDQUFFLENBQUM7RUFFSCxNQUFNUSxRQUFRLEdBQUcsSUFBSTdELFFBQVEsQ0FBRW9ELFNBQVMsRUFBRUMsVUFBVSxFQUFFO0lBQ3BEUywwQkFBMEIsRUFBRUosbUJBQW1CO0lBQy9DSyx3QkFBd0IsRUFBRUwsbUJBQW1CO0lBQzdDTSwwQkFBMEIsRUFBRVIsbUJBQW1CO0lBQy9DUyx3QkFBd0IsRUFBRVQsbUJBQW1CO0lBQzdDRywwQkFBMEIsRUFBRUEsMEJBQTBCO0lBQ3RETyxnQkFBZ0IsRUFBRTtNQUNoQkMsUUFBUSxFQUFFLENBQUUsQ0FBQyxFQUFFLENBQUM7SUFDbEI7RUFDRixDQUFFLENBQUM7O0VBRUg7RUFDQSxNQUFNQyxxQkFBcUIsR0FBR0EsQ0FBRUMsV0FBVyxFQUFFQyxjQUFjLEVBQUVDLGVBQWUsRUFBRUMsVUFBVSxLQUFNO0lBQzVGLE1BQU05RCxLQUFLLEdBQUcsSUFBSXZCLElBQUksQ0FBRWtGLFdBQVcsRUFBRTtNQUFFSSxJQUFJLEVBQUUsSUFBSTFGLFFBQVEsQ0FBRSxFQUFHO0lBQUUsQ0FBRSxDQUFDO0lBQ25FLE1BQU0yRixPQUFPLEdBQUcsSUFBSWpGLGFBQWEsQ0FBRTZFLGNBQWMsRUFBRSxJQUFJL0YsUUFBUSxDQUFFK0YsY0FBYyxDQUFDSyxLQUFNLENBQUMsRUFBRTtNQUN2RkMsVUFBVSxFQUFFSixVQUFVO01BQ3RCRCxlQUFlLEVBQUVBLGVBQWU7TUFDaENNLG9CQUFvQixFQUFFO1FBQ3BCbEMsS0FBSyxFQUFFLFFBQVE7UUFDZm1DLE9BQU8sRUFBRSxDQUFDO1FBQ1ZDLE9BQU8sRUFBRSxDQUFDO1FBQ1ZDLFdBQVcsRUFBRTtVQUFFUCxJQUFJLEVBQUUsSUFBSTFGLFFBQVEsQ0FBRSxFQUFHO1FBQUU7TUFDMUM7SUFDRixDQUFFLENBQUM7SUFDSCxPQUFPLElBQUlFLElBQUksQ0FBRTtNQUNmNkQsUUFBUSxFQUFFLENBQUVwQyxLQUFLLEVBQUVnRSxPQUFPLENBQUU7TUFDNUI5QixPQUFPLEVBQUU7SUFDWCxDQUFFLENBQUM7RUFDTCxDQUFDOztFQUVEO0VBQ0EsTUFBTXFDLHVCQUF1QixHQUFHQSxDQUFFQyxlQUFlLEVBQUVDLFdBQVcsRUFBRUMsVUFBVSxLQUFNO0lBQzlFLE9BQU8sSUFBSTdGLDhCQUE4QixDQUFFMkYsZUFBZSxFQUFFLElBQUkvRixJQUFJLENBQUVnRyxXQUFZLENBQUMsRUFBRSxJQUFJaEcsSUFBSSxDQUFFaUcsVUFBVyxDQUFFLENBQUM7RUFDL0csQ0FBQzs7RUFFRDtFQUNBLE1BQU1DLDRCQUE0QixHQUFHLElBQUlsSCxlQUFlLENBQUUsSUFBSyxDQUFDO0VBQ2hFLE1BQU1tSCw4QkFBOEIsR0FBRyxJQUFJbkgsZUFBZSxDQUFFLElBQUssQ0FBQztFQUNsRSxNQUFNb0gsaUJBQWlCLEdBQUcsSUFBSXBILGVBQWUsQ0FBRSxLQUFNLENBQUM7RUFFdEQsTUFBTXFILGtDQUFrQyxHQUFHLElBQUlsSCxjQUFjLENBQUVrRixtQkFBbUIsRUFBRTtJQUFFbUIsS0FBSyxFQUFFckI7RUFBa0IsQ0FBRSxDQUFDO0VBQ2xILE1BQU1tQyxnQ0FBZ0MsR0FBRyxJQUFJbkgsY0FBYyxDQUFFa0YsbUJBQW1CLEVBQUU7SUFBRW1CLEtBQUssRUFBRXJCO0VBQWtCLENBQUUsQ0FBQztFQUNoSCxNQUFNb0Msa0NBQWtDLEdBQUcsSUFBSXBILGNBQWMsQ0FBRW9GLG1CQUFtQixFQUFFO0lBQUVpQixLQUFLLEVBQUVwQjtFQUFrQixDQUFFLENBQUM7RUFDbEgsTUFBTW9DLGdDQUFnQyxHQUFHLElBQUlySCxjQUFjLENBQUVvRixtQkFBbUIsRUFBRTtJQUFFaUIsS0FBSyxFQUFFcEI7RUFBa0IsQ0FBRSxDQUFDOztFQUVoSDtFQUNBLE1BQU1xQywwQkFBMEIsR0FBR3hCLHFCQUFxQixDQUFFLDBCQUEwQixFQUFFb0Isa0NBQWtDLEVBQUVGLDhCQUE4QixFQUFFLENBQUUsQ0FBQztFQUM3SixNQUFNTyx3QkFBd0IsR0FBR3pCLHFCQUFxQixDQUFFLHdCQUF3QixFQUFFcUIsZ0NBQWdDLEVBQUVKLDRCQUE0QixFQUFFLENBQUUsQ0FBQztFQUNySixNQUFNUywwQkFBMEIsR0FBRzFCLHFCQUFxQixDQUFFLDBCQUEwQixFQUFFc0Isa0NBQWtDLEVBQUVKLDhCQUE4QixFQUFFLENBQUUsQ0FBQztFQUM3SixNQUFNUyx3QkFBd0IsR0FBRzNCLHFCQUFxQixDQUFFLHdCQUF3QixFQUFFdUIsZ0NBQWdDLEVBQUVOLDRCQUE0QixFQUFFLENBQUUsQ0FBQztFQUVySixNQUFNVyx5QkFBeUIsR0FBR2YsdUJBQXVCLENBQUVLLDhCQUE4QixFQUFFLGlCQUFpQixFQUFFLGlCQUFrQixDQUFDO0VBQ2pJLE1BQU1XLHVCQUF1QixHQUFHaEIsdUJBQXVCLENBQUVJLDRCQUE0QixFQUFFLGVBQWUsRUFBRSxpQkFBa0IsQ0FBQztFQUUzSCxNQUFNYSxlQUFlLEdBQUcsSUFBSWpILElBQUksQ0FBRTtJQUNoQzZELFFBQVEsRUFBRSxDQUFFa0QseUJBQXlCLEVBQUVDLHVCQUF1QixDQUFFO0lBQ2hFckQsT0FBTyxFQUFFO0VBQ1gsQ0FBRSxDQUFDO0VBRUgsTUFBTXVELFlBQVksR0FBRyxJQUFJN0csb0NBQW9DLENBQUVpRyxpQkFBaUIsRUFBRTtJQUNoRmEsT0FBTyxFQUFFLElBQUlqSCxJQUFJLENBQUUsUUFBUztFQUM5QixDQUFFLENBQUM7RUFFSCxNQUFNa0gsUUFBUSxHQUFHLElBQUlqSCxJQUFJLENBQUU7SUFDekIwRCxRQUFRLEVBQUUsQ0FBRThDLDBCQUEwQixFQUFFQyx3QkFBd0IsRUFBRUMsMEJBQTBCLEVBQUVDLHdCQUF3QixFQUFFRyxlQUFlLEVBQUVDLFlBQVksQ0FBRTtJQUN2SnZELE9BQU8sRUFBRSxFQUFFO0lBQ1hELEtBQUssRUFBRTtFQUNULENBQUUsQ0FBQztFQUVILE1BQU0yRCxJQUFJLEdBQUcsSUFBSXJILElBQUksQ0FBRTtJQUNyQjZELFFBQVEsRUFBRSxDQUFFdUQsUUFBUSxFQUFFeEMsUUFBUSxDQUFFO0lBQ2hDakIsT0FBTyxFQUFFLEVBQUU7SUFDWEMsTUFBTSxFQUFFdkIsWUFBWSxDQUFDdUIsTUFBTTtJQUMzQjBELE1BQU0sRUFBRTtFQUNWLENBQUUsQ0FBQztFQUVIbEksU0FBUyxDQUFDbUksU0FBUyxDQUFFLENBQUVuQiw0QkFBNEIsRUFBRUMsOEJBQThCLENBQUUsRUFBRSxDQUFFbUIsZUFBZSxFQUFFQyxpQkFBaUIsS0FBTTtJQUMvSCxNQUFNM0Msd0JBQXdCLEdBQUcwQyxlQUFlLEdBQUdkLGdDQUFnQyxDQUFDZ0IsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJO0lBQ2hHLE1BQU0xQyx3QkFBd0IsR0FBR3dDLGVBQWUsR0FBR2hCLGdDQUFnQyxDQUFDa0IsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJO0lBQ2hHLE1BQU03QywwQkFBMEIsR0FBRzRDLGlCQUFpQixHQUFHaEIsa0NBQWtDLENBQUNpQixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUk7SUFDdEcsTUFBTTNDLDBCQUEwQixHQUFHMEMsaUJBQWlCLEdBQUdsQixrQ0FBa0MsQ0FBQ21CLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSTtJQUV0RzlDLFFBQVEsQ0FBQytDLGVBQWUsQ0FBRTtNQUN4QjdDLHdCQUF3QixFQUFFQSx3QkFBd0I7TUFDbERELDBCQUEwQixFQUFFQSwwQkFBMEI7TUFDdERHLHdCQUF3QixFQUFFQSx3QkFBd0I7TUFDbERELDBCQUEwQixFQUFFQTtJQUM5QixDQUFFLENBQUM7O0lBRUg7SUFDQWdDLHlCQUF5QixDQUFDYSxPQUFPLEdBQUdKLGVBQWU7SUFDbkRSLHVCQUF1QixDQUFDWSxPQUFPLEdBQUdILGlCQUFpQjtFQUNyRCxDQUFFLENBQUM7RUFFSHJJLFNBQVMsQ0FBQ21JLFNBQVMsQ0FBRSxDQUFFYixnQ0FBZ0MsRUFBRUQsa0NBQWtDLEVBQUVGLGtDQUFrQyxFQUFFQyxnQ0FBZ0MsQ0FBRSxFQUNqSyxDQUFFMUIsd0JBQXdCLEVBQUVELDBCQUEwQixFQUFFRyx3QkFBd0IsRUFBRUQsMEJBQTBCLEtBQU07SUFDaEhILFFBQVEsQ0FBQytDLGVBQWUsQ0FBRTtNQUN4QjdDLHdCQUF3QixFQUFFQSx3QkFBd0I7TUFDbERELDBCQUEwQixFQUFFQSwwQkFBMEI7TUFDdERHLHdCQUF3QixFQUFFQSx3QkFBd0I7TUFDbERELDBCQUEwQixFQUFFQTtJQUM5QixDQUFFLENBQUM7RUFDTCxDQUNGLENBQUM7RUFFRCxJQUFJOEMsTUFBTSxHQUFHLENBQUM7RUFDZDFHLE9BQU8sQ0FBQ2tDLFdBQVcsQ0FBRWxCLEVBQUUsSUFBSTtJQUN6QixJQUFLbUUsaUJBQWlCLENBQUNvQixHQUFHLENBQUMsQ0FBQyxFQUFHO01BQzdCRyxNQUFNLElBQUkxRixFQUFFO01BQ1osTUFBTTJGLFlBQVksR0FBRyxJQUFJcEksT0FBTyxDQUFFbUksTUFBTSxFQUFFQSxNQUFPLENBQUM7TUFFbERuRCwwQkFBMEIsQ0FBQ3FELEdBQUcsQ0FBRWxJLG1CQUFtQixDQUFDOEUsc0JBQXNCLENBQ3hFLElBQUlwRixPQUFPLENBQUV1SSxZQUFZLENBQUNFLENBQUMsRUFBRUYsWUFBWSxDQUFDRyxDQUFDLEVBQUUsRUFBRSxHQUFHSCxZQUFZLENBQUNFLENBQUMsRUFBRSxFQUFFLEdBQUdGLFlBQVksQ0FBQ0csQ0FBRSxDQUFDLEVBQ3ZGLElBQUkxSSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTRFLFNBQVMsRUFBRUMsVUFBVyxDQUMzQyxDQUFFLENBQUM7SUFDTDtFQUNGLENBQUUsQ0FBQztFQUVILE9BQU9pRCxJQUFJO0FBQ2IsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU14RixzQkFBc0IsR0FBRyxTQUFBQSxDQUFVUSxZQUFZLEVBQUc7RUFDdEQsTUFBTTZGLFlBQVksR0FBRyxJQUFJNUksUUFBUSxDQUFFLENBQUUsQ0FBQztFQUN0QyxNQUFNNkksT0FBTyxHQUFHLElBQUl2SCxhQUFhLENBQUU7SUFBRWdDLEtBQUssRUFBRSxNQUFNO0lBQUV3RixTQUFTLEVBQUUsQ0FBQztJQUFFQyxNQUFNLEVBQUU7RUFBRSxDQUFFLENBQUM7RUFDL0UsTUFBTUMsT0FBTyxHQUFHLElBQUkxSCxhQUFhLENBQUU7SUFBRWdDLEtBQUssRUFBRSxRQUFRO0lBQUV3RixTQUFTLEVBQUUsQ0FBQztJQUFFQyxNQUFNLEVBQUU7RUFBRSxDQUFFLENBQUM7RUFDakYsTUFBTUUsZUFBZSxHQUFHLElBQUk5SSxLQUFLLENBQUUsQ0FBQyxFQUFFLEVBQUcsQ0FBQztFQUMxQyxNQUFNK0ksYUFBYSxHQUFHLElBQUkvSSxLQUFLLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBRSxDQUFDO0VBQ3hDLE1BQU1nSixPQUFPLEdBQUdGLGVBQWUsQ0FBQ0csR0FBRztFQUNuQyxNQUFNQyxVQUFVLEdBQUcsR0FBRztFQUN0QixNQUFNQyxXQUFXLEdBQUcsR0FBRztFQUV2QixNQUFNQyxhQUFhLEdBQUcsSUFBSXZKLFFBQVEsQ0FBRXVCLGlCQUFpQixDQUFDaUksU0FBUyxDQUFDQyxJQUFLLENBQUM7RUFFdEUsTUFBTUMsU0FBUyxHQUFHLElBQUlsSixRQUFRLENBQUU7SUFBRW1KLElBQUksRUFBRTtFQUFHLENBQUUsQ0FBQztFQUM5QyxNQUFNQyxXQUFXLEdBQUcsSUFBSTlJLFFBQVEsQ0FDOUJ5SSxhQUFhLEVBQ2JoSSxpQkFBaUIsQ0FBQ2lJLFNBQVMsQ0FBQ0MsSUFBSSxFQUNoQyxJQUFJN0ksSUFBSSxDQUFFLE1BQU0sRUFBRTtJQUFFc0YsSUFBSSxFQUFFd0Q7RUFBVSxDQUFFLENBQUMsRUFDdkNuSSxpQkFBaUIsQ0FBQ2lJLFNBQVMsQ0FBQ0ssT0FBTyxFQUNuQyxJQUFJakosSUFBSSxDQUFFLFNBQVMsRUFBRTtJQUFFc0YsSUFBSSxFQUFFd0Q7RUFBVSxDQUFFLENBQzNDLENBQUM7RUFFRCxNQUFNdEUsMEJBQTBCLEdBQUcsSUFBSXBGLFFBQVEsQ0FBRU8sbUJBQW1CLENBQUN1SiwrQkFBK0IsQ0FDbEcsSUFBSTdKLE9BQU8sQ0FBRWdKLGVBQWUsQ0FBQy9ELEdBQUcsRUFBRWdFLGFBQWEsQ0FBQ2hFLEdBQUcsRUFBRStELGVBQWUsQ0FBQ0csR0FBRyxFQUFFRixhQUFhLENBQUNFLEdBQUksQ0FBQyxFQUM3RixJQUFJbkosT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVvSixVQUFVLEVBQUVDLFdBQVksQ0FDN0MsQ0FBRSxDQUFDO0VBRUgsTUFBTXpGLFFBQVEsR0FBR2hCLEVBQUUsSUFBSTtJQUVyQjtJQUNBK0YsWUFBWSxDQUFDbUIsS0FBSyxJQUFJbEgsRUFBRTs7SUFFeEI7SUFDQTtJQUNBLElBQUsrRixZQUFZLENBQUNSLEdBQUcsQ0FBQyxDQUFDLEdBQUdlLE9BQU8sRUFBRztNQUVsQyxNQUFNYSxJQUFJLEdBQUdkLGFBQWEsQ0FBQ2hFLEdBQUcsR0FBRzBELFlBQVksQ0FBQ21CLEtBQUssR0FBR1osT0FBTztNQUM3RCxNQUFNYyxJQUFJLEdBQUdmLGFBQWEsQ0FBQ0UsR0FBRyxHQUFHUixZQUFZLENBQUNtQixLQUFLLEdBQUdaLE9BQU87TUFDN0QvRCwwQkFBMEIsQ0FBQ3FELEdBQUcsQ0FBRWxJLG1CQUFtQixDQUFDdUosK0JBQStCLENBQ2pGLElBQUk3SixPQUFPLENBQUUySSxZQUFZLENBQUNSLEdBQUcsQ0FBQyxDQUFDLEdBQUdlLE9BQU8sRUFBRWEsSUFBSSxFQUFFcEIsWUFBWSxDQUFDUixHQUFHLENBQUMsQ0FBQyxFQUFFNkIsSUFBSyxDQUFDLEVBQzNFLElBQUloSyxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRW9KLFVBQVUsRUFBRUMsV0FBWSxDQUM3QyxDQUFFLENBQUM7SUFDTDs7SUFFQTtJQUNBLElBQUtDLGFBQWEsQ0FBQ25CLEdBQUcsQ0FBQyxDQUFDLEtBQUs3RyxpQkFBaUIsQ0FBQ2lJLFNBQVMsQ0FBQ0ssT0FBTyxJQUFJaEIsT0FBTyxDQUFDcUIsT0FBTyxDQUFDLENBQUMsRUFBRztNQUN0RixNQUFNQyxjQUFjLEdBQUd2QixZQUFZLENBQUNSLEdBQUcsQ0FBQyxDQUFDLEdBQUdTLE9BQU8sQ0FBQ3VCLFlBQVksQ0FBRXZCLE9BQU8sQ0FBQ3dCLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBRSxDQUFDLENBQUMzQixDQUFDO01BQzdGLElBQUt5QixjQUFjLEdBQUcsR0FBRyxFQUFHO1FBQzFCO01BQ0Y7SUFDRjs7SUFFQTtJQUNBdEIsT0FBTyxDQUFDeUIsY0FBYyxDQUFFMUIsWUFBWSxDQUFDbUIsS0FBSyxFQUFFbkIsWUFBWSxDQUFDbUIsS0FBSyxHQUFHUSxJQUFJLENBQUNDLEdBQUcsQ0FBRTVCLFlBQVksQ0FBQ21CLEtBQU0sQ0FBQyxHQUFHYixhQUFhLENBQUNoRSxHQUFJLENBQUM7SUFDckg4RCxPQUFPLENBQUNzQixjQUFjLENBQUUxQixZQUFZLENBQUNtQixLQUFLLEVBQUVuQixZQUFZLENBQUNtQixLQUFLLEdBQUdRLElBQUksQ0FBQ0MsR0FBRyxDQUFFNUIsWUFBWSxDQUFDbUIsS0FBSyxHQUFHLENBQUUsQ0FBQyxHQUFHYixhQUFhLENBQUNoRSxHQUFJLENBQUM7O0lBRXpIO0lBQ0EsT0FBUTJELE9BQU8sQ0FBQ3VCLFlBQVksQ0FBRSxDQUFFLENBQUMsQ0FBQzFCLENBQUMsR0FBR0UsWUFBWSxDQUFDbUIsS0FBSyxHQUFHWixPQUFPLEVBQUc7TUFDbkVOLE9BQU8sQ0FBQzRCLFNBQVMsQ0FBQyxDQUFDO01BQ25CekIsT0FBTyxDQUFDeUIsU0FBUyxDQUFDLENBQUM7SUFDckI7RUFDRixDQUFDO0VBQ0Q1SSxPQUFPLENBQUNrQyxXQUFXLENBQUVGLFFBQVMsQ0FBQztFQUMvQixNQUFNNkcsa0JBQWtCLEdBQUcsSUFBSS9JLFdBQVcsQ0FBRTtJQUMxQ2dKLEtBQUssRUFBRXRCLFVBQVU7SUFDakJ1QixNQUFNLEVBQUV0QixXQUFXO0lBQ25CdUIscUJBQXFCLEVBQUUsSUFBSWpLLElBQUksQ0FBRSxZQUFZLEVBQUU7TUFBRWtLLElBQUksRUFBRSxPQUFPO01BQUVDLFFBQVEsRUFBRSxDQUFDLEdBQUdSLElBQUksQ0FBQ1MsRUFBRSxHQUFHO0lBQUUsQ0FBRSxDQUFDO0lBQzdGQyx1QkFBdUIsRUFBRSxJQUFJckssSUFBSSxDQUFFLFVBQVUsRUFBRTtNQUFFa0ssSUFBSSxFQUFFO0lBQVEsQ0FBRSxDQUFDO0lBQ2xFMUYsMEJBQTBCLEVBQUVBO0VBQzlCLENBQUUsQ0FBQztFQUNIc0Ysa0JBQWtCLENBQUNRLHFCQUFxQixDQUFFLENBQUVyQyxPQUFPLEVBQUVHLE9BQU8sQ0FBRyxDQUFDO0VBRWhFTyxhQUFhLENBQUM0QixJQUFJLENBQUVDLEtBQUssSUFBSTtJQUMzQlYsa0JBQWtCLENBQUNXLFlBQVksQ0FBRUQsS0FBTSxDQUFDO0lBQ3hDdkMsT0FBTyxDQUFDeUMsS0FBSyxDQUFDLENBQUM7SUFDZnRDLE9BQU8sQ0FBQ3NDLEtBQUssQ0FBQyxDQUFDO0VBQ2pCLENBQUUsQ0FBQztFQUVILE1BQU1DLEtBQUssR0FBRyxJQUFJcEssS0FBSyxDQUFFdUosa0JBQWtCLEVBQUU7SUFDM0NJLElBQUksRUFBRSxNQUFNO0lBQ1o5QyxNQUFNLEVBQUU7RUFDVixDQUFFLENBQUM7O0VBRUg7RUFDQSxNQUFNd0QsWUFBWSxHQUFHRCxLQUFLLENBQUM3RyxPQUFPLENBQUNDLElBQUksQ0FBRTRHLEtBQU0sQ0FBQztFQUNoREEsS0FBSyxDQUFDN0csT0FBTyxHQUFHLE1BQU07SUFDcEI3QyxPQUFPLENBQUMrQyxjQUFjLENBQUVmLFFBQVMsQ0FBQztJQUNsQzJILFlBQVksQ0FBQyxDQUFDO0VBQ2hCLENBQUM7RUFFRCxPQUFPLElBQUkzSyxJQUFJLENBQUU7SUFDZjBELFFBQVEsRUFBRSxDQUFFZ0gsS0FBSyxFQUFFM0IsV0FBVyxDQUFFO0lBQ2hDdkYsT0FBTyxFQUFFLEVBQUU7SUFDWEMsTUFBTSxFQUFFdkIsWUFBWSxDQUFDdUIsTUFBTSxDQUFDbUgsTUFBTSxDQUFFLEVBQUUsRUFBRSxDQUFFO0VBQzVDLENBQUUsQ0FBQztBQUNMLENBQUM7QUFFRCxNQUFNakosbUJBQW1CLEdBQUdPLFlBQVksSUFBSTtFQUMxQyxNQUFNNkYsWUFBWSxHQUFHLElBQUk1SSxRQUFRLENBQUUsQ0FBRSxDQUFDO0VBQ3RDLE1BQU02SSxPQUFPLEdBQUcsSUFBSXZILGFBQWEsQ0FBRTtJQUFFZ0MsS0FBSyxFQUFFO0VBQU8sQ0FBRSxDQUFDO0VBQ3RELE1BQU02RixPQUFPLEdBQUcsQ0FBQztFQUNqQixNQUFNdEYsUUFBUSxHQUFHaEIsRUFBRSxJQUFJO0lBRXJCO0lBQ0ErRixZQUFZLENBQUNtQixLQUFLLElBQUlsSCxFQUFFOztJQUV4QjtJQUNBZ0csT0FBTyxDQUFDeUIsY0FBYyxDQUFFMUIsWUFBWSxDQUFDbUIsS0FBSyxFQUFFUSxJQUFJLENBQUNDLEdBQUcsQ0FBRTVCLFlBQVksQ0FBQ21CLEtBQU0sQ0FBRSxDQUFDOztJQUU1RTtJQUNBLE9BQVFsQixPQUFPLENBQUN1QixZQUFZLENBQUUsQ0FBRSxDQUFDLENBQUMxQixDQUFDLEdBQUdFLFlBQVksQ0FBQ21CLEtBQUssR0FBR1osT0FBTyxFQUFHO01BQ25FTixPQUFPLENBQUM0QixTQUFTLENBQUMsQ0FBQztJQUNyQjtFQUNGLENBQUM7RUFDRDVJLE9BQU8sQ0FBQ2tDLFdBQVcsQ0FBRUYsUUFBUyxDQUFDO0VBQy9CLE1BQU02SCxlQUFlLEdBQUcsSUFBSWhLLGVBQWUsQ0FBRWtILFlBQVksRUFBRSxDQUFFQyxPQUFPLENBQUUsRUFBRSxJQUFJakksSUFBSSxDQUFFLEtBQUssRUFBRTtJQUFFa0ssSUFBSSxFQUFFO0VBQVEsQ0FBRSxDQUFDLEVBQUU7SUFDNUdILEtBQUssRUFBRSxHQUFHO0lBQ1ZDLE1BQU0sRUFBRSxHQUFHO0lBQ1hlLHNDQUFzQyxFQUFFLENBQUM7SUFDekNDLHdDQUF3QyxFQUFFLENBQUM7SUFDM0NmLHFCQUFxQixFQUFFLElBQUlqSyxJQUFJLENBQUUsWUFBWSxFQUFFO01BQzdDbUssUUFBUSxFQUFFLENBQUMsR0FBR1IsSUFBSSxDQUFDUyxFQUFFLEdBQUcsQ0FBQztNQUN6QkYsSUFBSSxFQUFFO0lBQ1IsQ0FBRSxDQUFDO0lBQ0hHLHVCQUF1QixFQUFFLElBQUlySyxJQUFJLENBQUUsVUFBVSxFQUFFO01BQUVrSyxJQUFJLEVBQUU7SUFBUSxDQUFFLENBQUM7SUFDbEVlLGNBQWMsRUFBRSxDQUFFLElBQUkxTCxLQUFLLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBRSxDQUFDO0VBQ3RDLENBQUUsQ0FBQztFQUNILE1BQU1vTCxLQUFLLEdBQUcsSUFBSXBLLEtBQUssQ0FBRXVLLGVBQWUsRUFBRTtJQUN4Q1osSUFBSSxFQUFFLE1BQU07SUFDWnhHLE1BQU0sRUFBRXZCLFlBQVksQ0FBQ3VCO0VBQ3ZCLENBQUUsQ0FBQzs7RUFFSDtFQUNBLE1BQU1rSCxZQUFZLEdBQUdELEtBQUssQ0FBQzdHLE9BQU8sQ0FBQ0MsSUFBSSxDQUFFNEcsS0FBTSxDQUFDO0VBQ2hEQSxLQUFLLENBQUM3RyxPQUFPLEdBQUcsTUFBTTtJQUNwQjdDLE9BQU8sQ0FBQytDLGNBQWMsQ0FBRWYsUUFBUyxDQUFDO0lBQ2xDMkgsWUFBWSxDQUFDLENBQUM7RUFDaEIsQ0FBQztFQUNELE9BQU9ELEtBQUs7QUFDZCxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNOUksZ0JBQWdCLEdBQUdNLFlBQVksSUFBSTtFQUN2QyxNQUFNc0csVUFBVSxHQUFHLEdBQUc7RUFDdEIsTUFBTUMsV0FBVyxHQUFHLEdBQUc7RUFDdkIsTUFBTUgsT0FBTyxHQUFHLEVBQUU7RUFDbEIsTUFBTTJDLFVBQVUsR0FBRyxJQUFJM0wsS0FBSyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUUsQ0FBQztFQUVyQyxNQUFNeUksWUFBWSxHQUFHLElBQUk3SSxjQUFjLENBQUUsQ0FBRSxDQUFDO0VBRTVDLE1BQU1xRiwwQkFBMEIsR0FBRyxJQUFJcEYsUUFBUSxDQUFFTyxtQkFBbUIsQ0FBQ3VKLCtCQUErQixDQUNsRyxJQUFJN0osT0FBTyxDQUFFLENBQUMsRUFBRTZMLFVBQVUsQ0FBQzVHLEdBQUcsRUFBRWlFLE9BQU8sRUFBRTJDLFVBQVUsQ0FBQzFDLEdBQUksQ0FBQyxFQUN6RCxJQUFJbkosT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVvSixVQUFVLEVBQUVDLFdBQVksQ0FDN0MsQ0FBRSxDQUFDO0VBRUgsTUFBTXlDLFVBQVUsR0FBRyxJQUFJekssYUFBYSxDQUFDLENBQUM7O0VBRXRDO0VBQ0EsSUFBSTBLLFFBQVEsR0FBRyxLQUFLO0VBRXBCLE1BQU1DLFNBQVMsR0FBRyxJQUFJckssaUJBQWlCLENBQUU7SUFDdkMrSSxLQUFLLEVBQUV0QixVQUFVO0lBQ2pCdUIsTUFBTSxFQUFFdEIsV0FBVztJQUNuQmxFLDBCQUEwQixFQUFFQSwwQkFBMEI7SUFDdEQ4RyxJQUFJLEVBQUUvQyxPQUFPO0lBQ2JnRCxRQUFRLEVBQUUsS0FBSztJQUNmbkMsSUFBSSxFQUFFOEIsVUFBVSxDQUFDNUcsR0FBRztJQUNwQitFLElBQUksRUFBRTZCLFVBQVUsQ0FBQzFDLEdBQUc7SUFDcEJ4RCxRQUFRLEVBQUUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFO0lBRWxCaUYscUJBQXFCLEVBQUUsSUFBSWpLLElBQUksQ0FBRSxPQUFPLEVBQUU7TUFBRW1LLFFBQVEsRUFBRSxDQUFDLEdBQUdSLElBQUksQ0FBQ1MsRUFBRSxHQUFHLENBQUM7TUFBRUYsSUFBSSxFQUFFO0lBQVEsQ0FBRSxDQUFDO0lBQ3hGRyx1QkFBdUIsRUFBRSxJQUFJckssSUFBSSxDQUFFLFVBQVUsRUFBRTtNQUFFa0ssSUFBSSxFQUFFO0lBQVEsQ0FBRSxDQUFDO0lBRWxFc0IsYUFBYSxFQUFFO01BQ2JDLFNBQVMsRUFBRUEsQ0FBQSxLQUFNO1FBQ2ZMLFFBQVEsR0FBRyxJQUFJO01BQ2pCLENBQUM7TUFDRE0sT0FBTyxFQUFFQSxDQUFBLEtBQU07UUFDYk4sUUFBUSxHQUFHLEtBQUs7TUFDbEI7SUFDRjtFQUNGLENBQUUsQ0FBQztFQUNIQyxTQUFTLENBQUNNLGdCQUFnQixDQUFFUixVQUFXLENBQUM7RUFFeEMsTUFBTVMsVUFBVSxHQUFHLElBQUlyTCxLQUFLLENBQUU4SyxTQUFTLEVBQUU7SUFDdkNuQixJQUFJLEVBQUUsTUFBTTtJQUNaeEcsTUFBTSxFQUFFdkIsWUFBWSxDQUFDdUIsTUFBTTtJQUMzQjBELE1BQU0sRUFBRTtFQUNWLENBQUUsQ0FBQztFQUVILE1BQU1uRSxRQUFRLEdBQUdoQixFQUFFLElBQUk7SUFFckI7SUFDQSxJQUFLLENBQUNtSixRQUFRLEVBQUc7TUFFZjtNQUNBcEQsWUFBWSxDQUFDSCxHQUFHLENBQUVHLFlBQVksQ0FBQ1IsR0FBRyxDQUFDLENBQUMsR0FBR3ZGLEVBQUcsQ0FBQzs7TUFFM0M7TUFDQWtKLFVBQVUsQ0FBQ3pCLGNBQWMsQ0FBRTFCLFlBQVksQ0FBQ1IsR0FBRyxDQUFDLENBQUMsRUFBRW1DLElBQUksQ0FBQ0MsR0FBRyxDQUFFNUIsWUFBWSxDQUFDUixHQUFHLENBQUMsQ0FBRSxDQUFFLENBQUM7O01BRS9FO01BQ0E7TUFDQSxJQUFLUSxZQUFZLENBQUNSLEdBQUcsQ0FBQyxDQUFDLEdBQUdlLE9BQU8sRUFBRztRQUNsQy9ELDBCQUEwQixDQUFDcUQsR0FBRyxDQUFFbEksbUJBQW1CLENBQUN1SiwrQkFBK0IsQ0FDakYsSUFBSTdKLE9BQU8sQ0FBRTJJLFlBQVksQ0FBQ1IsR0FBRyxDQUFDLENBQUMsR0FBR2UsT0FBTyxFQUFFMkMsVUFBVSxDQUFDNUcsR0FBRyxFQUFFMEQsWUFBWSxDQUFDUixHQUFHLENBQUMsQ0FBQyxFQUFFMEQsVUFBVSxDQUFDMUMsR0FBSSxDQUFDLEVBQy9GLElBQUluSixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRW9KLFVBQVUsRUFBRUMsV0FBWSxDQUM3QyxDQUFFLENBQUM7TUFDTDs7TUFFQTtNQUNBLE9BQVF5QyxVQUFVLENBQUMzQixZQUFZLENBQUUsQ0FBRSxDQUFDLENBQUMxQixDQUFDLEdBQUdFLFlBQVksQ0FBQ21CLEtBQUssR0FBR1osT0FBTyxFQUFHO1FBQ3RFNEMsVUFBVSxDQUFDdEIsU0FBUyxDQUFDLENBQUM7TUFDeEI7TUFFQXdCLFNBQVMsQ0FBQ1EsY0FBYyxDQUFFN0QsWUFBWSxDQUFDUixHQUFHLENBQUMsQ0FBRSxDQUFDO0lBQ2hEO0VBQ0YsQ0FBQztFQUNEdkcsT0FBTyxDQUFDa0MsV0FBVyxDQUFFRixRQUFTLENBQUM7RUFFL0IsT0FBTzJJLFVBQVU7QUFDbkIsQ0FBQztBQUVEaEwsT0FBTyxDQUFDa0wsUUFBUSxDQUFFLHVCQUF1QixFQUFFMUsscUJBQXNCLENBQUM7QUFDbEUsZUFBZUEscUJBQXFCIn0=