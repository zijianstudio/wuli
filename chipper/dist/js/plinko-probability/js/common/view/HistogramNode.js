// Copyright 2014-2023, University of Colorado Boulder

/**
 * Base type for histogram, displays a 2D grid and axes.
 *
 * @author Martin Veillette (Berea College)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Line, Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import plinkoProbability from '../../plinkoProbability.js';
import PlinkoProbabilityStrings from '../../PlinkoProbabilityStrings.js';
import PlinkoProbabilityConstants from '../PlinkoProbabilityConstants.js';

//----------------------------------------------------------------------------------------
// constants
//----------------------------------------------------------------------------------------

const MAX_NUMBER_BINS = PlinkoProbabilityConstants.ROWS_RANGE.max + 1; /// there is one more bin than rows;

// background of histogram
const GRID_BACKGROUND_FILL = 'white';
const GRID_BACKGROUND_LINE_WIDTH = 0.5;
const GRID_BACKGROUND_STROKE = 'gray';

// banner on top of histogram
const BANNER_HEIGHT = 20;
const BANNER_BACKGROUND_COLOR = new Color(46, 49, 146);

// X and Y labels of the histogram
const Y_AXIS_LABEL_FONT = new PhetFont({
  size: 20,
  weight: 'bolder'
});
const X_AXIS_LABEL_FONT = new PhetFont({
  size: 16,
  weight: 'bold'
});
const X_AXIS_LABEL_COLOR = 'black'; // space between end of axis and label
const Y_AXIS_LABEL_COLOR = 'black'; // space between end of axis and label

// fonts
const LARGE_FONT = new PhetFont({
  size: 16
});
const NORMAL_FONT = new PhetFont(14);
const SMALL_FONT = new PhetFont({
  size: 12
});
const TINY_FONT = new PhetFont({
  size: 10
});
const TINY_TINY_FONT = new PhetFont({
  size: 8
});

// ticks
const MAJOR_TICK_COLOR = 'black';
const MAJOR_TICK_FONT = new PhetFont({
  size: 16
});
const binString = PlinkoProbabilityStrings.bin;
const countString = PlinkoProbabilityStrings.count;
const fractionString = PlinkoProbabilityStrings.fraction;

// triangle (for average indicators)
const TRIANGLE_HEIGHT = 20;
const TRIANGLE_WIDTH = 20;

// model histogram bounds
const HISTOGRAM_BOUNDS = PlinkoProbabilityConstants.HISTOGRAM_BOUNDS;
class HistogramNode extends Node {
  /**
   * Constructor for Histogram Node
   * @param {Property.<string>} histogramModeProperty - see PlinkoProbabilityCommonView
   * @param {PlinkoProbabilityCommonModel} model
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<boolean>} isTheoreticalHistogramVisibleProperty
   */
  constructor(histogramModeProperty, model, modelViewTransform, isTheoreticalHistogramVisibleProperty) {
    super({
      children: [new BackgroundNode(modelViewTransform), new XAxisNode(model.histogram, model.numberOfRowsProperty, modelViewTransform), new YAxisNode(model.histogram, histogramModeProperty, modelViewTransform), new XBannerNode(model.histogram, model.numberOfRowsProperty, histogramModeProperty, modelViewTransform), new HistogramBarNode(model.histogram, model, modelViewTransform, isTheoreticalHistogramVisibleProperty)]
    });
  }
}
plinkoProbability.register('HistogramNode', HistogramNode);

//----------------------------------------------------------------------------------------
// x-axis (horizontal)
//----------------------------------------------------------------------------------------

class XAxisNode extends Node {
  /**
   * Scenery Node that create the labels at the tick marks and the X axis label.
   *
   * @param {Histogram} histogram
   * @param {Property.<number>} numberOfRowsProperty
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(histogram, numberOfRowsProperty, modelViewTransform) {
    super();

    // position of the axis
    const axisCenterX = modelViewTransform.modelToViewX(histogram.getCenterX());
    const axisBottom = modelViewTransform.modelToViewY(histogram.getMinY());

    // create layer to store tick labels
    const tickLabelsLayer = new Node();
    this.addChild(tickLabelsLayer);
    const tickLabels = [];

    // top position for tick labels
    const topTickTextPosition = axisBottom + 5;

    // create and add ALL the tick labels (including some that may not be visible at present time)
    for (let binIndex = 0; binIndex < MAX_NUMBER_BINS; binIndex++) {
      tickLabels[binIndex] = new Text(binIndex, {
        font: MAJOR_TICK_FONT,
        fill: MAJOR_TICK_COLOR,
        top: topTickTextPosition
      });
    }
    tickLabelsLayer.setChildren(tickLabels);

    // bottom position of the tick labels
    const bottomTickTextPosition = tickLabels[0].bottom;

    //  create and add the main label for the x axis
    const xLabelNode = new Text(binString, {
      font: X_AXIS_LABEL_FONT,
      fill: X_AXIS_LABEL_COLOR,
      centerX: axisCenterX,
      top: bottomTickTextPosition + 5
    });
    this.addChild(xLabelNode);

    // no need to unlink present for the lifetime of the sim
    // update the visibility of the tick labels and their x positions
    numberOfRowsProperty.link(numberOfRows => {
      const numberOfBins = numberOfRows + 1;
      for (let binIndex = 0; binIndex < MAX_NUMBER_BINS; binIndex++) {
        // update the visibility of all the labels
        tickLabels[binIndex].visible = binIndex < numberOfBins;
        // center the visible labels
        if (tickLabels[binIndex].visible) {
          tickLabels[binIndex].centerX = modelViewTransform.modelToViewX(histogram.getBinCenterX(binIndex, numberOfBins));
        }
      }
    });
  }
}
plinkoProbability.register('XAxisNode', XAxisNode);

//----------------------------------------------------------------------------------------
//  y-axis (vertical)
//----------------------------------------------------------------------------------------

class YAxisNode extends Node {
  /**
   * Scenery Node that create a Y axis label
   *
   * @param {Histogram} histogram
   * @param {Property.<string>} histogramModeProperty
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(histogram, histogramModeProperty, modelViewTransform) {
    super();
    const axisLeft = modelViewTransform.modelToViewX(histogram.getMinX());

    //Sets max width of y-axis label to histogram height.
    const histogramHeight = Math.abs(modelViewTransform.modelToViewDeltaY(HISTOGRAM_BOUNDS.height));
    const histogramCenterY = modelViewTransform.modelToViewY(HISTOGRAM_BOUNDS.centerY);

    // create and add the Y axis label
    const yLabelNode = new Text('', {
      font: Y_AXIS_LABEL_FONT,
      fill: Y_AXIS_LABEL_COLOR,
      centerY: histogramCenterY,
      left: axisLeft - 30,
      // empirically determined
      rotation: -Math.PI / 2,
      // remember down is positive in the view
      maxWidth: histogramHeight // number for y-label max height
    });

    this.addChild(yLabelNode);

    // no need to unlink present for the lifetime of the sim
    histogramModeProperty.link(histogramMode => {
      switch (histogramMode) {
        case 'fraction':
          yLabelNode.string = fractionString;
          break;
        case 'counter':
          yLabelNode.string = countString;
          break;
        case 'cylinder':
          // do nothing
          break;
        default:
          throw new Error(`invalid histogramMode: ${histogramMode}`);
      }
      yLabelNode.centerY = histogramCenterY; // center y-label text based on content
    });
  }
}

plinkoProbability.register('YAxisNode', YAxisNode);

//----------------------------------------------------------------------------------------
// 2D Background
//----------------------------------------------------------------------------------------

class BackgroundNode extends Rectangle {
  /**
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(modelViewTransform) {
    super(modelViewTransform.modelToViewBounds(PlinkoProbabilityConstants.HISTOGRAM_BOUNDS), {
      fill: GRID_BACKGROUND_FILL,
      lineWidth: GRID_BACKGROUND_LINE_WIDTH,
      stroke: GRID_BACKGROUND_STROKE
    });
  }
}
plinkoProbability.register('BackgroundNode', BackgroundNode);

//----------------------------------------------------------------------------------------
//  X Banner
//----------------------------------------------------------------------------------------

class XBannerNode extends Node {
  /**
   * @param {Histogram} histogram
   * @param {Property.<number>} numberOfRowsProperty
   * @param {Property.<string>} histogramModeProperty
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(histogram, numberOfRowsProperty, histogramModeProperty, modelViewTransform) {
    super();
    const minX = modelViewTransform.modelToViewX(HISTOGRAM_BOUNDS.minX);
    const minY = modelViewTransform.modelToViewY(HISTOGRAM_BOUNDS.maxY);
    const maxX = modelViewTransform.modelToViewX(HISTOGRAM_BOUNDS.maxX);
    const maxY = modelViewTransform.modelToViewY(HISTOGRAM_BOUNDS.maxY) + BANNER_HEIGHT;
    const bannerWidth = maxX - minX;
    const bannerBackgroundNode = new Rectangle(minX, minY, bannerWidth, BANNER_HEIGHT, {
      fill: BANNER_BACKGROUND_COLOR,
      lineWidth: GRID_BACKGROUND_LINE_WIDTH,
      stroke: GRID_BACKGROUND_STROKE
    });
    this.addChild(bannerBackgroundNode);
    const linesLayerNode = new Node();
    const labelsLayerNode = new Node();
    this.addChild(linesLayerNode);
    this.addChild(labelsLayerNode);
    const labelsTextArray = [];
    const verticalLinesArray = [];

    // create and add an array of bin value (set initially to zero) and vertical line separator
    for (let binIndex = 0; binIndex < MAX_NUMBER_BINS; binIndex++) {
      labelsTextArray[binIndex] = new Text(0, {
        fill: 'white',
        centerY: (maxY + minY) / 2,
        font: NORMAL_FONT
      });
      verticalLinesArray[binIndex] = new Line(minX, minY, minX, maxY, {
        stroke: 'white',
        lineWidth: 1
      });
    }
    linesLayerNode.setChildren(verticalLinesArray);
    labelsLayerNode.setChildren(labelsTextArray);

    /**
     * Function that update the position (and visibility) of the vertical lines in the banner at top of the histogram,
     * @param {number} numberOfRows
     */
    function updateBanner(numberOfRows) {
      const numberOfBins = numberOfRows + 1;
      // start on bin 1 rather than zero since the left side of the '0th' bin is the y-axis
      for (let binIndex = 1; binIndex < numberOfBins; binIndex++) {
        const x = modelViewTransform.modelToViewX(histogram.getBinLeft(binIndex, numberOfBins));
        verticalLinesArray[binIndex].setLine(x, minY, x, maxY);
      }
      for (let binIndex = 0; binIndex < MAX_NUMBER_BINS; binIndex++) {
        // update the visibility of vertical line separator
        verticalLinesArray[binIndex].visible = binIndex < numberOfBins;
      }
    }

    /**
     * Function that update the value of the text in the banner to reflect the actual value in the bin.,
     * @param {number} numberOfRows
     * @param {string} histogramMode
     */
    function updateTextBanner(numberOfRows, histogramMode) {
      const numberOfBins = numberOfRows + 1;
      let getHistogramBin;
      let font;
      let maxBinCount;
      switch (histogramMode) {
        case 'fraction':
          getHistogramBin = histogram.getFractionalBinCount.bind(histogram);

          // font is dependent on the number of bins
          if (numberOfBins > 23) {
            font = TINY_TINY_FONT;
          } else if (numberOfBins > 20) {
            font = TINY_FONT;
          } else if (numberOfBins > 16) {
            font = SMALL_FONT;
          } else if (numberOfBins > 9) {
            font = NORMAL_FONT;
          } else {
            font = LARGE_FONT;
          }
          break;
        case 'counter':
          getHistogramBin = histogram.getBinCount.bind(histogram);

          // font is dependent on the highest binValue
          maxBinCount = histogram.getMaximumBinCount();
          if (maxBinCount > 999 && numberOfBins > 23) {
            font = TINY_TINY_FONT;
          } else if (maxBinCount > 999 && numberOfBins > 20) {
            font = TINY_FONT;
          } else if (maxBinCount > 999 && numberOfBins > 16) {
            font = SMALL_FONT;
          } else if (maxBinCount > 99 && numberOfBins > 23) {
            font = TINY_FONT;
          } else if (maxBinCount > 99 && numberOfBins > 20) {
            font = SMALL_FONT;
          } else if (maxBinCount > 99 && numberOfBins > 15) {
            font = NORMAL_FONT;
          } else if (maxBinCount > 9 && numberOfBins > 23) {
            font = SMALL_FONT;
          } else if (maxBinCount > 9 && numberOfBins > 18) {
            font = NORMAL_FONT;
          } else {
            font = LARGE_FONT;
          }
          break;
        case 'cylinder':
          return;
        // if we are on a cylinder there is no text to update

        default:
          throw new Error(`invalid histogramMode: ${histogramMode}`);
      }

      // we loop over all the bins
      for (let binIndex = 0; binIndex < MAX_NUMBER_BINS; binIndex++) {
        if (binIndex < numberOfBins) {
          labelsTextArray[binIndex].visible = true;
          const binCenterX = modelViewTransform.modelToViewX(histogram.getBinCenterX(binIndex, numberOfBins));
          let binValue = getHistogramBin(binIndex); // a number

          if (histogramMode === 'fraction') {
            // set the appropriate number of decimal places if in fraction mode,
            // if the number of bins is large, the width of the bin does not allow as many decimal places
            binValue = numberOfBins > 16 ? Utils.toFixed(binValue, 2) : Utils.toFixed(binValue, 3);
          }

          // update position, fontsize and text of the bins
          labelsTextArray[binIndex].string = binValue;
          labelsTextArray[binIndex].setFont(font);
          labelsTextArray[binIndex].centerX = binCenterX;
        } else {
          // if binIndex>= numberOfbins, the bins are not visible. We choose not to update the text.
          labelsTextArray[binIndex].visible = false;
        }
      }
    }

    // update the banner when a ball has been added to the histogram
    // no need to remove listener, present for the lifetime of the sim
    histogram.histogramUpdatedEmitter.addListener(() => {
      updateTextBanner(numberOfRowsProperty.get(), histogramModeProperty.get());
    });

    // no need to unlink, present for the lifetime of the sim
    Multilink.multilink([numberOfRowsProperty, histogramModeProperty], (numberOfRows, histogramMode) => {
      updateBanner(numberOfRows); // update the placement of the vertical line separators
      updateTextBanner(numberOfRows, histogramMode); // update the text content of each bins
    });

    updateTextBanner(numberOfRowsProperty.get(), histogramModeProperty.get());
  }
}
plinkoProbability.register('XBannerNode', XBannerNode);

//----------------------------------------------------------------------------------------
//  Histogram Bars
//----------------------------------------------------------------------------------------

class HistogramBarNode extends Node {
  /**
   * @param {Histogram} histogram
   * @param {PlinkoProbabilityCommonModel} model
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<boolean>} isTheoreticalHistogramVisibleProperty
   */
  constructor(histogram, model, modelViewTransform, isTheoreticalHistogramVisibleProperty) {
    super();

    // get the coordinate of the histogram bar nodes
    // the HISTOGRAM_BOUNDS include the banner on top (
    // but not the Y and X labels are outside of HISTOGRAM_BOUNDS
    const minX = modelViewTransform.modelToViewX(HISTOGRAM_BOUNDS.minX);
    const minY = modelViewTransform.modelToViewY(HISTOGRAM_BOUNDS.maxY);
    const maxX = modelViewTransform.modelToViewX(HISTOGRAM_BOUNDS.maxX);
    const maxY = modelViewTransform.modelToViewY(HISTOGRAM_BOUNDS.minY);

    // convenience variables
    const bannerWidth = maxX - minX; // in view coordinates
    const maxBarHeight = maxY - minY - BANNER_HEIGHT - 3; // in view coordinates, (-5) allows for small white space above bar so bar doesn't touch banner
    assert && assert(maxBarHeight > 0, 'the Height of the bar must be larger than zero');

    // create and add (on a separate layer) the two histograms
    const sampleHistogramNode = new Node();
    const theoreticalHistogramNode = new Node();
    this.addChild(sampleHistogramNode);
    this.addChild(theoreticalHistogramNode);

    // the rectangles that make up each histogram are stored in an array
    const sampleHistogramRectanglesArray = [];
    const theoreticalHistogramRectanglesArray = [];

    // create and add the two arrays of rectangles
    // initialize the height, fill and strokes of the rectangle, set visibility to false
    for (let i = 0; i < MAX_NUMBER_BINS; i++) {
      // creates rectangles with a nominal height of 1, so that scenery doesn't throw a fit
      const nominalSampleHistogramRectangle = new Rectangle(0, 0, bannerWidth, 1, {
        fill: PlinkoProbabilityConstants.HISTOGRAM_BAR_COLOR_FILL,
        stroke: PlinkoProbabilityConstants.HISTOGRAM_BAR_COLOR_STROKE,
        lineWidth: 2,
        visible: false
      });
      // create nominal rectangles
      // height of rectangles will be updated through an update function
      const nominalTheoreticalHistogramRectangle = new Rectangle(0, 0, bannerWidth, 1, {
        stroke: PlinkoProbabilityConstants.BINOMIAL_DISTRIBUTION_BAR_COLOR_STROKE,
        lineWidth: 2,
        visible: false
      });
      sampleHistogramRectanglesArray.push(nominalSampleHistogramRectangle);
      theoreticalHistogramRectanglesArray.push(nominalTheoreticalHistogramRectangle);
    }
    sampleHistogramNode.setChildren(sampleHistogramRectanglesArray);
    theoreticalHistogramNode.setChildren(theoreticalHistogramRectanglesArray);

    // create triangle shape for the indicator of sample average and theoretical average
    const triangleShape = new Shape().moveTo(0, maxY).lineToRelative(-TRIANGLE_WIDTH / 2, TRIANGLE_HEIGHT).lineToRelative(TRIANGLE_WIDTH, 0).close();

    // create and add triangle indicators for the sample and theoretical averages
    const sampleAverageTrianglePath = new Path(triangleShape, {
      fill: PlinkoProbabilityConstants.HISTOGRAM_BAR_COLOR_FILL,
      stroke: PlinkoProbabilityConstants.HISTOGRAM_BAR_COLOR_STROKE,
      lineWidth: 2
    });
    const theoreticalAverageTrianglePath = new Path(triangleShape, {
      stroke: PlinkoProbabilityConstants.BINOMIAL_DISTRIBUTION_BAR_COLOR_STROKE,
      fill: 'rgba(0,0,0,0)',
      // transparent
      lineWidth: 2
    });
    this.addChild(sampleAverageTrianglePath);
    this.addChild(theoreticalAverageTrianglePath);

    // position the sample average triangle and set its visibility
    updateSampleAverageTriangle();

    // no need to unlink , present for the lifetime of the sim
    Multilink.multilink([model.numberOfRowsProperty, model.probabilityProperty, isTheoreticalHistogramVisibleProperty], (numberOfRows, probability, isTheoreticalHistogramVisible) => {
      // update the sample histogram
      updateHistogram(sampleHistogramRectanglesArray, model.histogram.getNormalizedSampleDistribution());
      // set the appropriate visibility to the theoretical histogram and path
      theoreticalHistogramNode.visible = isTheoreticalHistogramVisible;
      theoreticalAverageTrianglePath.visible = isTheoreticalHistogramVisible;
      // only update the theoretical average, if isTheoreticalHistogramVisible is set to visible
      if (isTheoreticalHistogramVisible) {
        updateHistogram(theoreticalHistogramRectanglesArray, model.getNormalizedBinomialDistribution());
        updateTheoreticalAverageTriangle();
      }
    });

    // update the histogram when a model ball has exited the galton board
    model.histogram.histogramUpdatedEmitter.addListener(() => {
      // update the height of bins of histogram
      updateHeightOfHistogram(sampleHistogramRectanglesArray, model.histogram.getNormalizedSampleDistribution());
      // update the position of the indicator for sample average
      updateSampleAverageTriangle();
    });

    /**
     * Set the position of the triangle Path based on the average value
     *
     * @param {Path} path
     * @param {number} average
     */
    function updateTrianglePosition(path, average) {
      const numberOfBins = model.numberOfRowsProperty.get() + 1;
      path.centerX = modelViewTransform.modelToViewX(histogram.getValuePosition(average, numberOfBins));
    }

    /**
     * Update the position of the theoretical average indicator (a triangle) based on
     * the theoretical average value
     */
    function updateTheoreticalAverageTriangle() {
      const average = model.getTheoreticalAverage(model.numberOfRowsProperty.get(), model.probabilityProperty.get());
      theoreticalAverageTrianglePath.visible = isTheoreticalHistogramVisibleProperty.get();
      updateTrianglePosition(theoreticalAverageTrianglePath, average);
    }

    /**
     *  Update the position of the average sample indicator (a triangle) based
     *  on the sample average of the histogram bins
     */
    function updateSampleAverageTriangle() {
      const average = model.histogram.average;
      // set to invisible if none of the balls have landed
      sampleAverageTrianglePath.visible = model.histogram.landedBallsNumber > 0;
      // update the position of the triangle for the sample distribution;
      updateTrianglePosition(sampleAverageTrianglePath, average);
    }

    /**
     * Function that solely update the Height of the bars of the histogram
     *  (and not their visibility)
     * @param {Array.<Rectangle>} rectanglesArray
     * @param {Array.<number>} binValues
     */
    function updateHeightOfHistogram(rectanglesArray, binValues) {
      let i;
      const numberOfBins = model.numberOfRowsProperty.get() + 1;
      for (i = 0; i < numberOfBins; i++) {
        const barHeight = maxBarHeight * binValues[i];
        rectanglesArray[i].visible = barHeight > 0; // zero-height bars are invisible, see #87
        rectanglesArray[i].setRectHeightFromBottom(barHeight);
      }
    }

    /**
     * @param {Array.<Rectangle>} rectanglesArray
     * @param {Array.<number>} binValues
     */
    function updateHistogram(rectanglesArray, binValues) {
      let i;
      const numberOfBins = model.numberOfRowsProperty.get() + 1;
      const xSpacing = bannerWidth / numberOfBins;
      // update ALL rectangles
      for (i = 0; i < MAX_NUMBER_BINS; i++) {
        if (i < numberOfBins) {
          const barHeight = maxBarHeight * binValues[i];

          // zero-height bars are invisible, see #87
          rectanglesArray[i].visible = barHeight > 0;
          rectanglesArray[i].setRect(minX + i * xSpacing, maxY - maxBarHeight * binValues[i], xSpacing, barHeight);
        } else {
          // the rectangles with an index larger than the current number of bins are set to invisible.
          // no need to update the height of the invisible rectangles.
          rectanglesArray[i].visible = false;
        }
      }
    }
  }
}
plinkoProbability.register('HistogramBarNode', HistogramBarNode);
export default HistogramNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJVdGlscyIsIlNoYXBlIiwiUGhldEZvbnQiLCJDb2xvciIsIkxpbmUiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlRleHQiLCJwbGlua29Qcm9iYWJpbGl0eSIsIlBsaW5rb1Byb2JhYmlsaXR5U3RyaW5ncyIsIlBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzIiwiTUFYX05VTUJFUl9CSU5TIiwiUk9XU19SQU5HRSIsIm1heCIsIkdSSURfQkFDS0dST1VORF9GSUxMIiwiR1JJRF9CQUNLR1JPVU5EX0xJTkVfV0lEVEgiLCJHUklEX0JBQ0tHUk9VTkRfU1RST0tFIiwiQkFOTkVSX0hFSUdIVCIsIkJBTk5FUl9CQUNLR1JPVU5EX0NPTE9SIiwiWV9BWElTX0xBQkVMX0ZPTlQiLCJzaXplIiwid2VpZ2h0IiwiWF9BWElTX0xBQkVMX0ZPTlQiLCJYX0FYSVNfTEFCRUxfQ09MT1IiLCJZX0FYSVNfTEFCRUxfQ09MT1IiLCJMQVJHRV9GT05UIiwiTk9STUFMX0ZPTlQiLCJTTUFMTF9GT05UIiwiVElOWV9GT05UIiwiVElOWV9USU5ZX0ZPTlQiLCJNQUpPUl9USUNLX0NPTE9SIiwiTUFKT1JfVElDS19GT05UIiwiYmluU3RyaW5nIiwiYmluIiwiY291bnRTdHJpbmciLCJjb3VudCIsImZyYWN0aW9uU3RyaW5nIiwiZnJhY3Rpb24iLCJUUklBTkdMRV9IRUlHSFQiLCJUUklBTkdMRV9XSURUSCIsIkhJU1RPR1JBTV9CT1VORFMiLCJIaXN0b2dyYW1Ob2RlIiwiY29uc3RydWN0b3IiLCJoaXN0b2dyYW1Nb2RlUHJvcGVydHkiLCJtb2RlbCIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImlzVGhlb3JldGljYWxIaXN0b2dyYW1WaXNpYmxlUHJvcGVydHkiLCJjaGlsZHJlbiIsIkJhY2tncm91bmROb2RlIiwiWEF4aXNOb2RlIiwiaGlzdG9ncmFtIiwibnVtYmVyT2ZSb3dzUHJvcGVydHkiLCJZQXhpc05vZGUiLCJYQmFubmVyTm9kZSIsIkhpc3RvZ3JhbUJhck5vZGUiLCJyZWdpc3RlciIsImF4aXNDZW50ZXJYIiwibW9kZWxUb1ZpZXdYIiwiZ2V0Q2VudGVyWCIsImF4aXNCb3R0b20iLCJtb2RlbFRvVmlld1kiLCJnZXRNaW5ZIiwidGlja0xhYmVsc0xheWVyIiwiYWRkQ2hpbGQiLCJ0aWNrTGFiZWxzIiwidG9wVGlja1RleHRQb3NpdGlvbiIsImJpbkluZGV4IiwiZm9udCIsImZpbGwiLCJ0b3AiLCJzZXRDaGlsZHJlbiIsImJvdHRvbVRpY2tUZXh0UG9zaXRpb24iLCJib3R0b20iLCJ4TGFiZWxOb2RlIiwiY2VudGVyWCIsImxpbmsiLCJudW1iZXJPZlJvd3MiLCJudW1iZXJPZkJpbnMiLCJ2aXNpYmxlIiwiZ2V0QmluQ2VudGVyWCIsImF4aXNMZWZ0IiwiZ2V0TWluWCIsImhpc3RvZ3JhbUhlaWdodCIsIk1hdGgiLCJhYnMiLCJtb2RlbFRvVmlld0RlbHRhWSIsImhlaWdodCIsImhpc3RvZ3JhbUNlbnRlclkiLCJjZW50ZXJZIiwieUxhYmVsTm9kZSIsImxlZnQiLCJyb3RhdGlvbiIsIlBJIiwibWF4V2lkdGgiLCJoaXN0b2dyYW1Nb2RlIiwic3RyaW5nIiwiRXJyb3IiLCJtb2RlbFRvVmlld0JvdW5kcyIsImxpbmVXaWR0aCIsInN0cm9rZSIsIm1pblgiLCJtaW5ZIiwibWF4WSIsIm1heFgiLCJiYW5uZXJXaWR0aCIsImJhbm5lckJhY2tncm91bmROb2RlIiwibGluZXNMYXllck5vZGUiLCJsYWJlbHNMYXllck5vZGUiLCJsYWJlbHNUZXh0QXJyYXkiLCJ2ZXJ0aWNhbExpbmVzQXJyYXkiLCJ1cGRhdGVCYW5uZXIiLCJ4IiwiZ2V0QmluTGVmdCIsInNldExpbmUiLCJ1cGRhdGVUZXh0QmFubmVyIiwiZ2V0SGlzdG9ncmFtQmluIiwibWF4QmluQ291bnQiLCJnZXRGcmFjdGlvbmFsQmluQ291bnQiLCJiaW5kIiwiZ2V0QmluQ291bnQiLCJnZXRNYXhpbXVtQmluQ291bnQiLCJiaW5DZW50ZXJYIiwiYmluVmFsdWUiLCJ0b0ZpeGVkIiwic2V0Rm9udCIsImhpc3RvZ3JhbVVwZGF0ZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJnZXQiLCJtdWx0aWxpbmsiLCJtYXhCYXJIZWlnaHQiLCJhc3NlcnQiLCJzYW1wbGVIaXN0b2dyYW1Ob2RlIiwidGhlb3JldGljYWxIaXN0b2dyYW1Ob2RlIiwic2FtcGxlSGlzdG9ncmFtUmVjdGFuZ2xlc0FycmF5IiwidGhlb3JldGljYWxIaXN0b2dyYW1SZWN0YW5nbGVzQXJyYXkiLCJpIiwibm9taW5hbFNhbXBsZUhpc3RvZ3JhbVJlY3RhbmdsZSIsIkhJU1RPR1JBTV9CQVJfQ09MT1JfRklMTCIsIkhJU1RPR1JBTV9CQVJfQ09MT1JfU1RST0tFIiwibm9taW5hbFRoZW9yZXRpY2FsSGlzdG9ncmFtUmVjdGFuZ2xlIiwiQklOT01JQUxfRElTVFJJQlVUSU9OX0JBUl9DT0xPUl9TVFJPS0UiLCJwdXNoIiwidHJpYW5nbGVTaGFwZSIsIm1vdmVUbyIsImxpbmVUb1JlbGF0aXZlIiwiY2xvc2UiLCJzYW1wbGVBdmVyYWdlVHJpYW5nbGVQYXRoIiwidGhlb3JldGljYWxBdmVyYWdlVHJpYW5nbGVQYXRoIiwidXBkYXRlU2FtcGxlQXZlcmFnZVRyaWFuZ2xlIiwicHJvYmFiaWxpdHlQcm9wZXJ0eSIsInByb2JhYmlsaXR5IiwiaXNUaGVvcmV0aWNhbEhpc3RvZ3JhbVZpc2libGUiLCJ1cGRhdGVIaXN0b2dyYW0iLCJnZXROb3JtYWxpemVkU2FtcGxlRGlzdHJpYnV0aW9uIiwiZ2V0Tm9ybWFsaXplZEJpbm9taWFsRGlzdHJpYnV0aW9uIiwidXBkYXRlVGhlb3JldGljYWxBdmVyYWdlVHJpYW5nbGUiLCJ1cGRhdGVIZWlnaHRPZkhpc3RvZ3JhbSIsInVwZGF0ZVRyaWFuZ2xlUG9zaXRpb24iLCJwYXRoIiwiYXZlcmFnZSIsImdldFZhbHVlUG9zaXRpb24iLCJnZXRUaGVvcmV0aWNhbEF2ZXJhZ2UiLCJsYW5kZWRCYWxsc051bWJlciIsInJlY3RhbmdsZXNBcnJheSIsImJpblZhbHVlcyIsImJhckhlaWdodCIsInNldFJlY3RIZWlnaHRGcm9tQm90dG9tIiwieFNwYWNpbmciLCJzZXRSZWN0Il0sInNvdXJjZXMiOlsiSGlzdG9ncmFtTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYXNlIHR5cGUgZm9yIGhpc3RvZ3JhbSwgZGlzcGxheXMgYSAyRCBncmlkIGFuZCBheGVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGUgKEJlcmVhIENvbGxlZ2UpXHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgTGluZSwgTm9kZSwgUGF0aCwgUmVjdGFuZ2xlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHBsaW5rb1Byb2JhYmlsaXR5IGZyb20gJy4uLy4uL3BsaW5rb1Byb2JhYmlsaXR5LmpzJztcclxuaW1wb3J0IFBsaW5rb1Byb2JhYmlsaXR5U3RyaW5ncyBmcm9tICcuLi8uLi9QbGlua29Qcm9iYWJpbGl0eVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMgZnJvbSAnLi4vUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuanMnO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIGNvbnN0YW50c1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmNvbnN0IE1BWF9OVU1CRVJfQklOUyA9IFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzLlJPV1NfUkFOR0UubWF4ICsgMTsgLy8vIHRoZXJlIGlzIG9uZSBtb3JlIGJpbiB0aGFuIHJvd3M7XHJcblxyXG4vLyBiYWNrZ3JvdW5kIG9mIGhpc3RvZ3JhbVxyXG5jb25zdCBHUklEX0JBQ0tHUk9VTkRfRklMTCA9ICd3aGl0ZSc7XHJcbmNvbnN0IEdSSURfQkFDS0dST1VORF9MSU5FX1dJRFRIID0gMC41O1xyXG5jb25zdCBHUklEX0JBQ0tHUk9VTkRfU1RST0tFID0gJ2dyYXknO1xyXG5cclxuLy8gYmFubmVyIG9uIHRvcCBvZiBoaXN0b2dyYW1cclxuY29uc3QgQkFOTkVSX0hFSUdIVCA9IDIwO1xyXG5jb25zdCBCQU5ORVJfQkFDS0dST1VORF9DT0xPUiA9IG5ldyBDb2xvciggNDYsIDQ5LCAxNDYgKTtcclxuXHJcbi8vIFggYW5kIFkgbGFiZWxzIG9mIHRoZSBoaXN0b2dyYW1cclxuY29uc3QgWV9BWElTX0xBQkVMX0ZPTlQgPSBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMjAsIHdlaWdodDogJ2JvbGRlcicgfSApO1xyXG5jb25zdCBYX0FYSVNfTEFCRUxfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxNiwgd2VpZ2h0OiAnYm9sZCcgfSApO1xyXG5jb25zdCBYX0FYSVNfTEFCRUxfQ09MT1IgPSAnYmxhY2snOyAvLyBzcGFjZSBiZXR3ZWVuIGVuZCBvZiBheGlzIGFuZCBsYWJlbFxyXG5jb25zdCBZX0FYSVNfTEFCRUxfQ09MT1IgPSAnYmxhY2snOyAvLyBzcGFjZSBiZXR3ZWVuIGVuZCBvZiBheGlzIGFuZCBsYWJlbFxyXG5cclxuLy8gZm9udHNcclxuY29uc3QgTEFSR0VfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxNiB9ICk7XHJcbmNvbnN0IE5PUk1BTF9GT05UID0gbmV3IFBoZXRGb250KCAxNCApO1xyXG5jb25zdCBTTUFMTF9GT05UID0gbmV3IFBoZXRGb250KCB7IHNpemU6IDEyIH0gKTtcclxuY29uc3QgVElOWV9GT05UID0gbmV3IFBoZXRGb250KCB7IHNpemU6IDEwIH0gKTtcclxuY29uc3QgVElOWV9USU5ZX0ZPTlQgPSBuZXcgUGhldEZvbnQoIHsgc2l6ZTogOCB9ICk7XHJcblxyXG4vLyB0aWNrc1xyXG5jb25zdCBNQUpPUl9USUNLX0NPTE9SID0gJ2JsYWNrJztcclxuY29uc3QgTUFKT1JfVElDS19GT05UID0gbmV3IFBoZXRGb250KCB7IHNpemU6IDE2IH0gKTtcclxuXHJcbmNvbnN0IGJpblN0cmluZyA9IFBsaW5rb1Byb2JhYmlsaXR5U3RyaW5ncy5iaW47XHJcbmNvbnN0IGNvdW50U3RyaW5nID0gUGxpbmtvUHJvYmFiaWxpdHlTdHJpbmdzLmNvdW50O1xyXG5jb25zdCBmcmFjdGlvblN0cmluZyA9IFBsaW5rb1Byb2JhYmlsaXR5U3RyaW5ncy5mcmFjdGlvbjtcclxuXHJcbi8vIHRyaWFuZ2xlIChmb3IgYXZlcmFnZSBpbmRpY2F0b3JzKVxyXG5jb25zdCBUUklBTkdMRV9IRUlHSFQgPSAyMDtcclxuY29uc3QgVFJJQU5HTEVfV0lEVEggPSAyMDtcclxuXHJcbi8vIG1vZGVsIGhpc3RvZ3JhbSBib3VuZHNcclxuY29uc3QgSElTVE9HUkFNX0JPVU5EUyA9IFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzLkhJU1RPR1JBTV9CT1VORFM7XHJcblxyXG5jbGFzcyBIaXN0b2dyYW1Ob2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0b3IgZm9yIEhpc3RvZ3JhbSBOb2RlXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48c3RyaW5nPn0gaGlzdG9ncmFtTW9kZVByb3BlcnR5IC0gc2VlIFBsaW5rb1Byb2JhYmlsaXR5Q29tbW9uVmlld1xyXG4gICAqIEBwYXJhbSB7UGxpbmtvUHJvYmFiaWxpdHlDb21tb25Nb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBpc1RoZW9yZXRpY2FsSGlzdG9ncmFtVmlzaWJsZVByb3BlcnR5XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGhpc3RvZ3JhbU1vZGVQcm9wZXJ0eSwgbW9kZWwsIG1vZGVsVmlld1RyYW5zZm9ybSwgaXNUaGVvcmV0aWNhbEhpc3RvZ3JhbVZpc2libGVQcm9wZXJ0eSApIHtcclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IEJhY2tncm91bmROb2RlKCBtb2RlbFZpZXdUcmFuc2Zvcm0gKSxcclxuICAgICAgICBuZXcgWEF4aXNOb2RlKCBtb2RlbC5oaXN0b2dyYW0sIG1vZGVsLm51bWJlck9mUm93c1Byb3BlcnR5LCBtb2RlbFZpZXdUcmFuc2Zvcm0gKSxcclxuICAgICAgICBuZXcgWUF4aXNOb2RlKCBtb2RlbC5oaXN0b2dyYW0sIGhpc3RvZ3JhbU1vZGVQcm9wZXJ0eSwgbW9kZWxWaWV3VHJhbnNmb3JtICksXHJcbiAgICAgICAgbmV3IFhCYW5uZXJOb2RlKCBtb2RlbC5oaXN0b2dyYW0sIG1vZGVsLm51bWJlck9mUm93c1Byb3BlcnR5LCBoaXN0b2dyYW1Nb2RlUHJvcGVydHksIG1vZGVsVmlld1RyYW5zZm9ybSApLFxyXG4gICAgICAgIG5ldyBIaXN0b2dyYW1CYXJOb2RlKCBtb2RlbC5oaXN0b2dyYW0sIG1vZGVsLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIGlzVGhlb3JldGljYWxIaXN0b2dyYW1WaXNpYmxlUHJvcGVydHkgKVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5wbGlua29Qcm9iYWJpbGl0eS5yZWdpc3RlciggJ0hpc3RvZ3JhbU5vZGUnLCBIaXN0b2dyYW1Ob2RlICk7XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8geC1heGlzIChob3Jpem9udGFsKVxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmNsYXNzIFhBeGlzTm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIFNjZW5lcnkgTm9kZSB0aGF0IGNyZWF0ZSB0aGUgbGFiZWxzIGF0IHRoZSB0aWNrIG1hcmtzIGFuZCB0aGUgWCBheGlzIGxhYmVsLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtIaXN0b2dyYW19IGhpc3RvZ3JhbVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IG51bWJlck9mUm93c1Byb3BlcnR5XHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaGlzdG9ncmFtLCBudW1iZXJPZlJvd3NQcm9wZXJ0eSwgbW9kZWxWaWV3VHJhbnNmb3JtICkge1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gcG9zaXRpb24gb2YgdGhlIGF4aXNcclxuICAgIGNvbnN0IGF4aXNDZW50ZXJYID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggaGlzdG9ncmFtLmdldENlbnRlclgoKSApO1xyXG4gICAgY29uc3QgYXhpc0JvdHRvbSA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIGhpc3RvZ3JhbS5nZXRNaW5ZKCkgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgbGF5ZXIgdG8gc3RvcmUgdGljayBsYWJlbHNcclxuICAgIGNvbnN0IHRpY2tMYWJlbHNMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aWNrTGFiZWxzTGF5ZXIgKTtcclxuICAgIGNvbnN0IHRpY2tMYWJlbHMgPSBbXTtcclxuXHJcbiAgICAvLyB0b3AgcG9zaXRpb24gZm9yIHRpY2sgbGFiZWxzXHJcbiAgICBjb25zdCB0b3BUaWNrVGV4dFBvc2l0aW9uID0gYXhpc0JvdHRvbSArIDU7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuZCBhZGQgQUxMIHRoZSB0aWNrIGxhYmVscyAoaW5jbHVkaW5nIHNvbWUgdGhhdCBtYXkgbm90IGJlIHZpc2libGUgYXQgcHJlc2VudCB0aW1lKVxyXG4gICAgZm9yICggbGV0IGJpbkluZGV4ID0gMDsgYmluSW5kZXggPCBNQVhfTlVNQkVSX0JJTlM7IGJpbkluZGV4KysgKSB7XHJcbiAgICAgIHRpY2tMYWJlbHNbIGJpbkluZGV4IF0gPSBuZXcgVGV4dCggYmluSW5kZXgsIHtcclxuICAgICAgICBmb250OiBNQUpPUl9USUNLX0ZPTlQsXHJcbiAgICAgICAgZmlsbDogTUFKT1JfVElDS19DT0xPUixcclxuICAgICAgICB0b3A6IHRvcFRpY2tUZXh0UG9zaXRpb25cclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgdGlja0xhYmVsc0xheWVyLnNldENoaWxkcmVuKCB0aWNrTGFiZWxzICk7XHJcblxyXG4gICAgLy8gYm90dG9tIHBvc2l0aW9uIG9mIHRoZSB0aWNrIGxhYmVsc1xyXG4gICAgY29uc3QgYm90dG9tVGlja1RleHRQb3NpdGlvbiA9IHRpY2tMYWJlbHNbIDAgXS5ib3R0b207XHJcblxyXG4gICAgLy8gIGNyZWF0ZSBhbmQgYWRkIHRoZSBtYWluIGxhYmVsIGZvciB0aGUgeCBheGlzXHJcbiAgICBjb25zdCB4TGFiZWxOb2RlID0gbmV3IFRleHQoIGJpblN0cmluZywge1xyXG4gICAgICBmb250OiBYX0FYSVNfTEFCRUxfRk9OVCxcclxuICAgICAgZmlsbDogWF9BWElTX0xBQkVMX0NPTE9SLFxyXG4gICAgICBjZW50ZXJYOiBheGlzQ2VudGVyWCxcclxuICAgICAgdG9wOiBib3R0b21UaWNrVGV4dFBvc2l0aW9uICsgNVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggeExhYmVsTm9kZSApO1xyXG5cclxuICAgIC8vIG5vIG5lZWQgdG8gdW5saW5rIHByZXNlbnQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltXHJcbiAgICAvLyB1cGRhdGUgdGhlIHZpc2liaWxpdHkgb2YgdGhlIHRpY2sgbGFiZWxzIGFuZCB0aGVpciB4IHBvc2l0aW9uc1xyXG4gICAgbnVtYmVyT2ZSb3dzUHJvcGVydHkubGluayggbnVtYmVyT2ZSb3dzID0+IHtcclxuICAgICAgY29uc3QgbnVtYmVyT2ZCaW5zID0gbnVtYmVyT2ZSb3dzICsgMTtcclxuICAgICAgZm9yICggbGV0IGJpbkluZGV4ID0gMDsgYmluSW5kZXggPCBNQVhfTlVNQkVSX0JJTlM7IGJpbkluZGV4KysgKSB7XHJcbiAgICAgICAgLy8gdXBkYXRlIHRoZSB2aXNpYmlsaXR5IG9mIGFsbCB0aGUgbGFiZWxzXHJcbiAgICAgICAgdGlja0xhYmVsc1sgYmluSW5kZXggXS52aXNpYmxlID0gKCBiaW5JbmRleCA8IG51bWJlck9mQmlucyApO1xyXG4gICAgICAgIC8vIGNlbnRlciB0aGUgdmlzaWJsZSBsYWJlbHNcclxuICAgICAgICBpZiAoIHRpY2tMYWJlbHNbIGJpbkluZGV4IF0udmlzaWJsZSApIHtcclxuICAgICAgICAgIHRpY2tMYWJlbHNbIGJpbkluZGV4IF0uY2VudGVyWCA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIGhpc3RvZ3JhbS5nZXRCaW5DZW50ZXJYKCBiaW5JbmRleCwgbnVtYmVyT2ZCaW5zICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbnBsaW5rb1Byb2JhYmlsaXR5LnJlZ2lzdGVyKCAnWEF4aXNOb2RlJywgWEF4aXNOb2RlICk7XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gIHktYXhpcyAodmVydGljYWwpXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuY2xhc3MgWUF4aXNOb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogU2NlbmVyeSBOb2RlIHRoYXQgY3JlYXRlIGEgWSBheGlzIGxhYmVsXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0hpc3RvZ3JhbX0gaGlzdG9ncmFtXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48c3RyaW5nPn0gaGlzdG9ncmFtTW9kZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaGlzdG9ncmFtLCBoaXN0b2dyYW1Nb2RlUHJvcGVydHksIG1vZGVsVmlld1RyYW5zZm9ybSApIHtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIGNvbnN0IGF4aXNMZWZ0ID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggaGlzdG9ncmFtLmdldE1pblgoKSApO1xyXG5cclxuICAgIC8vU2V0cyBtYXggd2lkdGggb2YgeS1heGlzIGxhYmVsIHRvIGhpc3RvZ3JhbSBoZWlnaHQuXHJcbiAgICBjb25zdCBoaXN0b2dyYW1IZWlnaHQgPSBNYXRoLmFicyggbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFZKCBISVNUT0dSQU1fQk9VTkRTLmhlaWdodCApICk7XHJcbiAgICBjb25zdCBoaXN0b2dyYW1DZW50ZXJZID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggSElTVE9HUkFNX0JPVU5EUy5jZW50ZXJZICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuZCBhZGQgdGhlIFkgYXhpcyBsYWJlbFxyXG4gICAgY29uc3QgeUxhYmVsTm9kZSA9IG5ldyBUZXh0KCAnJywge1xyXG4gICAgICBmb250OiBZX0FYSVNfTEFCRUxfRk9OVCxcclxuICAgICAgZmlsbDogWV9BWElTX0xBQkVMX0NPTE9SLFxyXG4gICAgICBjZW50ZXJZOiBoaXN0b2dyYW1DZW50ZXJZLFxyXG4gICAgICBsZWZ0OiBheGlzTGVmdCAtIDMwLCAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICAgIHJvdGF0aW9uOiAtTWF0aC5QSSAvIDIsICAgLy8gcmVtZW1iZXIgZG93biBpcyBwb3NpdGl2ZSBpbiB0aGUgdmlld1xyXG4gICAgICBtYXhXaWR0aDogaGlzdG9ncmFtSGVpZ2h0IC8vIG51bWJlciBmb3IgeS1sYWJlbCBtYXggaGVpZ2h0XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB5TGFiZWxOb2RlICk7XHJcblxyXG4gICAgLy8gbm8gbmVlZCB0byB1bmxpbmsgcHJlc2VudCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW1cclxuICAgIGhpc3RvZ3JhbU1vZGVQcm9wZXJ0eS5saW5rKCBoaXN0b2dyYW1Nb2RlID0+IHtcclxuICAgICAgc3dpdGNoKCBoaXN0b2dyYW1Nb2RlICkge1xyXG4gICAgICAgIGNhc2UgJ2ZyYWN0aW9uJzpcclxuICAgICAgICAgIHlMYWJlbE5vZGUuc3RyaW5nID0gZnJhY3Rpb25TdHJpbmc7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdjb3VudGVyJzpcclxuICAgICAgICAgIHlMYWJlbE5vZGUuc3RyaW5nID0gY291bnRTdHJpbmc7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdjeWxpbmRlcic6XHJcbiAgICAgICAgICAvLyBkbyBub3RoaW5nXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgaW52YWxpZCBoaXN0b2dyYW1Nb2RlOiAke2hpc3RvZ3JhbU1vZGV9YCApO1xyXG4gICAgICB9XHJcbiAgICAgIHlMYWJlbE5vZGUuY2VudGVyWSA9IGhpc3RvZ3JhbUNlbnRlclk7IC8vIGNlbnRlciB5LWxhYmVsIHRleHQgYmFzZWQgb24gY29udGVudFxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxucGxpbmtvUHJvYmFiaWxpdHkucmVnaXN0ZXIoICdZQXhpc05vZGUnLCBZQXhpc05vZGUgKTtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyAyRCBCYWNrZ3JvdW5kXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuY2xhc3MgQmFja2dyb3VuZE5vZGUgZXh0ZW5kcyBSZWN0YW5nbGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsVmlld1RyYW5zZm9ybSApIHtcclxuICAgIHN1cGVyKCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdCb3VuZHMoIFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzLkhJU1RPR1JBTV9CT1VORFMgKSwge1xyXG4gICAgICBmaWxsOiBHUklEX0JBQ0tHUk9VTkRfRklMTCxcclxuICAgICAgbGluZVdpZHRoOiBHUklEX0JBQ0tHUk9VTkRfTElORV9XSURUSCxcclxuICAgICAgc3Ryb2tlOiBHUklEX0JBQ0tHUk9VTkRfU1RST0tFXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5wbGlua29Qcm9iYWJpbGl0eS5yZWdpc3RlciggJ0JhY2tncm91bmROb2RlJywgQmFja2dyb3VuZE5vZGUgKTtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyAgWCBCYW5uZXJcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5jbGFzcyBYQmFubmVyTm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7SGlzdG9ncmFtfSBoaXN0b2dyYW1cclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXI+fSBudW1iZXJPZlJvd3NQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPHN0cmluZz59IGhpc3RvZ3JhbU1vZGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGhpc3RvZ3JhbSwgbnVtYmVyT2ZSb3dzUHJvcGVydHksIGhpc3RvZ3JhbU1vZGVQcm9wZXJ0eSwgbW9kZWxWaWV3VHJhbnNmb3JtICkge1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgY29uc3QgbWluWCA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIEhJU1RPR1JBTV9CT1VORFMubWluWCApO1xyXG4gICAgY29uc3QgbWluWSA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIEhJU1RPR1JBTV9CT1VORFMubWF4WSApO1xyXG4gICAgY29uc3QgbWF4WCA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIEhJU1RPR1JBTV9CT1VORFMubWF4WCApO1xyXG4gICAgY29uc3QgbWF4WSA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIEhJU1RPR1JBTV9CT1VORFMubWF4WSApICsgQkFOTkVSX0hFSUdIVDtcclxuXHJcbiAgICBjb25zdCBiYW5uZXJXaWR0aCA9IG1heFggLSBtaW5YO1xyXG5cclxuICAgIGNvbnN0IGJhbm5lckJhY2tncm91bmROb2RlID0gbmV3IFJlY3RhbmdsZSggbWluWCwgbWluWSwgYmFubmVyV2lkdGgsIEJBTk5FUl9IRUlHSFQsIHtcclxuICAgICAgZmlsbDogQkFOTkVSX0JBQ0tHUk9VTkRfQ09MT1IsXHJcbiAgICAgIGxpbmVXaWR0aDogR1JJRF9CQUNLR1JPVU5EX0xJTkVfV0lEVEgsXHJcbiAgICAgIHN0cm9rZTogR1JJRF9CQUNLR1JPVU5EX1NUUk9LRVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYmFubmVyQmFja2dyb3VuZE5vZGUgKTtcclxuXHJcbiAgICBjb25zdCBsaW5lc0xheWVyTm9kZSA9IG5ldyBOb2RlKCk7XHJcbiAgICBjb25zdCBsYWJlbHNMYXllck5vZGUgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbGluZXNMYXllck5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGxhYmVsc0xheWVyTm9kZSApO1xyXG5cclxuICAgIGNvbnN0IGxhYmVsc1RleHRBcnJheSA9IFtdO1xyXG4gICAgY29uc3QgdmVydGljYWxMaW5lc0FycmF5ID0gW107XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuZCBhZGQgYW4gYXJyYXkgb2YgYmluIHZhbHVlIChzZXQgaW5pdGlhbGx5IHRvIHplcm8pIGFuZCB2ZXJ0aWNhbCBsaW5lIHNlcGFyYXRvclxyXG4gICAgZm9yICggbGV0IGJpbkluZGV4ID0gMDsgYmluSW5kZXggPCBNQVhfTlVNQkVSX0JJTlM7IGJpbkluZGV4KysgKSB7XHJcbiAgICAgIGxhYmVsc1RleHRBcnJheVsgYmluSW5kZXggXSA9IG5ldyBUZXh0KCAwLCB7IGZpbGw6ICd3aGl0ZScsIGNlbnRlclk6ICggbWF4WSArIG1pblkgKSAvIDIsIGZvbnQ6IE5PUk1BTF9GT05UIH0gKTtcclxuICAgICAgdmVydGljYWxMaW5lc0FycmF5WyBiaW5JbmRleCBdID0gbmV3IExpbmUoIG1pblgsIG1pblksIG1pblgsIG1heFksIHsgc3Ryb2tlOiAnd2hpdGUnLCBsaW5lV2lkdGg6IDEgfSApO1xyXG4gICAgfVxyXG4gICAgbGluZXNMYXllck5vZGUuc2V0Q2hpbGRyZW4oIHZlcnRpY2FsTGluZXNBcnJheSApO1xyXG4gICAgbGFiZWxzTGF5ZXJOb2RlLnNldENoaWxkcmVuKCBsYWJlbHNUZXh0QXJyYXkgKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEZ1bmN0aW9uIHRoYXQgdXBkYXRlIHRoZSBwb3NpdGlvbiAoYW5kIHZpc2liaWxpdHkpIG9mIHRoZSB2ZXJ0aWNhbCBsaW5lcyBpbiB0aGUgYmFubmVyIGF0IHRvcCBvZiB0aGUgaGlzdG9ncmFtLFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG51bWJlck9mUm93c1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVCYW5uZXIoIG51bWJlck9mUm93cyApIHtcclxuICAgICAgY29uc3QgbnVtYmVyT2ZCaW5zID0gbnVtYmVyT2ZSb3dzICsgMTtcclxuICAgICAgLy8gc3RhcnQgb24gYmluIDEgcmF0aGVyIHRoYW4gemVybyBzaW5jZSB0aGUgbGVmdCBzaWRlIG9mIHRoZSAnMHRoJyBiaW4gaXMgdGhlIHktYXhpc1xyXG4gICAgICBmb3IgKCBsZXQgYmluSW5kZXggPSAxOyBiaW5JbmRleCA8IG51bWJlck9mQmluczsgYmluSW5kZXgrKyApIHtcclxuICAgICAgICBjb25zdCB4ID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggaGlzdG9ncmFtLmdldEJpbkxlZnQoIGJpbkluZGV4LCBudW1iZXJPZkJpbnMgKSApO1xyXG4gICAgICAgIHZlcnRpY2FsTGluZXNBcnJheVsgYmluSW5kZXggXS5zZXRMaW5lKFxyXG4gICAgICAgICAgeCxcclxuICAgICAgICAgIG1pblksXHJcbiAgICAgICAgICB4LFxyXG4gICAgICAgICAgbWF4WSApO1xyXG4gICAgICB9XHJcbiAgICAgIGZvciAoIGxldCBiaW5JbmRleCA9IDA7IGJpbkluZGV4IDwgTUFYX05VTUJFUl9CSU5TOyBiaW5JbmRleCsrICkge1xyXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdmlzaWJpbGl0eSBvZiB2ZXJ0aWNhbCBsaW5lIHNlcGFyYXRvclxyXG4gICAgICAgIHZlcnRpY2FsTGluZXNBcnJheVsgYmluSW5kZXggXS52aXNpYmxlID0gKCBiaW5JbmRleCA8IG51bWJlck9mQmlucyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGdW5jdGlvbiB0aGF0IHVwZGF0ZSB0aGUgdmFsdWUgb2YgdGhlIHRleHQgaW4gdGhlIGJhbm5lciB0byByZWZsZWN0IHRoZSBhY3R1YWwgdmFsdWUgaW4gdGhlIGJpbi4sXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbnVtYmVyT2ZSb3dzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaGlzdG9ncmFtTW9kZVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVUZXh0QmFubmVyKCBudW1iZXJPZlJvd3MsIGhpc3RvZ3JhbU1vZGUgKSB7XHJcblxyXG4gICAgICBjb25zdCBudW1iZXJPZkJpbnMgPSBudW1iZXJPZlJvd3MgKyAxO1xyXG5cclxuICAgICAgbGV0IGdldEhpc3RvZ3JhbUJpbjtcclxuICAgICAgbGV0IGZvbnQ7XHJcbiAgICAgIGxldCBtYXhCaW5Db3VudDtcclxuXHJcbiAgICAgIHN3aXRjaCggaGlzdG9ncmFtTW9kZSApIHtcclxuICAgICAgICBjYXNlICdmcmFjdGlvbic6XHJcbiAgICAgICAgICBnZXRIaXN0b2dyYW1CaW4gPSBoaXN0b2dyYW0uZ2V0RnJhY3Rpb25hbEJpbkNvdW50LmJpbmQoIGhpc3RvZ3JhbSApO1xyXG5cclxuICAgICAgICAgIC8vIGZvbnQgaXMgZGVwZW5kZW50IG9uIHRoZSBudW1iZXIgb2YgYmluc1xyXG4gICAgICAgICAgaWYgKCBudW1iZXJPZkJpbnMgPiAyMyApIHtmb250ID0gVElOWV9USU5ZX0ZPTlQ7fVxyXG4gICAgICAgICAgZWxzZSBpZiAoIG51bWJlck9mQmlucyA+IDIwICkge2ZvbnQgPSBUSU5ZX0ZPTlQ7fVxyXG4gICAgICAgICAgZWxzZSBpZiAoIG51bWJlck9mQmlucyA+IDE2ICkge2ZvbnQgPSBTTUFMTF9GT05UO31cclxuICAgICAgICAgIGVsc2UgaWYgKCBudW1iZXJPZkJpbnMgPiA5ICkge2ZvbnQgPSBOT1JNQUxfRk9OVDt9XHJcbiAgICAgICAgICBlbHNlIHtmb250ID0gTEFSR0VfRk9OVDt9XHJcblxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnY291bnRlcic6XHJcbiAgICAgICAgICBnZXRIaXN0b2dyYW1CaW4gPSBoaXN0b2dyYW0uZ2V0QmluQ291bnQuYmluZCggaGlzdG9ncmFtICk7XHJcblxyXG4gICAgICAgICAgLy8gZm9udCBpcyBkZXBlbmRlbnQgb24gdGhlIGhpZ2hlc3QgYmluVmFsdWVcclxuICAgICAgICAgIG1heEJpbkNvdW50ID0gaGlzdG9ncmFtLmdldE1heGltdW1CaW5Db3VudCgpO1xyXG4gICAgICAgICAgaWYgKCBtYXhCaW5Db3VudCA+IDk5OSAmJiBudW1iZXJPZkJpbnMgPiAyMyApIHtmb250ID0gVElOWV9USU5ZX0ZPTlQ7fVxyXG4gICAgICAgICAgZWxzZSBpZiAoIG1heEJpbkNvdW50ID4gOTk5ICYmIG51bWJlck9mQmlucyA+IDIwICkge2ZvbnQgPSBUSU5ZX0ZPTlQ7fVxyXG4gICAgICAgICAgZWxzZSBpZiAoIG1heEJpbkNvdW50ID4gOTk5ICYmIG51bWJlck9mQmlucyA+IDE2ICkge2ZvbnQgPSBTTUFMTF9GT05UO31cclxuICAgICAgICAgIGVsc2UgaWYgKCBtYXhCaW5Db3VudCA+IDk5ICYmIG51bWJlck9mQmlucyA+IDIzICkge2ZvbnQgPSBUSU5ZX0ZPTlQ7fVxyXG4gICAgICAgICAgZWxzZSBpZiAoIG1heEJpbkNvdW50ID4gOTkgJiYgbnVtYmVyT2ZCaW5zID4gMjAgKSB7Zm9udCA9IFNNQUxMX0ZPTlQ7fVxyXG4gICAgICAgICAgZWxzZSBpZiAoIG1heEJpbkNvdW50ID4gOTkgJiYgbnVtYmVyT2ZCaW5zID4gMTUgKSB7Zm9udCA9IE5PUk1BTF9GT05UO31cclxuICAgICAgICAgIGVsc2UgaWYgKCBtYXhCaW5Db3VudCA+IDkgJiYgbnVtYmVyT2ZCaW5zID4gMjMgKSB7Zm9udCA9IFNNQUxMX0ZPTlQ7fVxyXG4gICAgICAgICAgZWxzZSBpZiAoIG1heEJpbkNvdW50ID4gOSAmJiBudW1iZXJPZkJpbnMgPiAxOCApIHtmb250ID0gTk9STUFMX0ZPTlQ7fVxyXG4gICAgICAgICAgZWxzZSB7Zm9udCA9IExBUkdFX0ZPTlQ7fVxyXG5cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2N5bGluZGVyJzpcclxuICAgICAgICAgIHJldHVybjsgLy8gaWYgd2UgYXJlIG9uIGEgY3lsaW5kZXIgdGhlcmUgaXMgbm8gdGV4dCB0byB1cGRhdGVcclxuXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggYGludmFsaWQgaGlzdG9ncmFtTW9kZTogJHtoaXN0b2dyYW1Nb2RlfWAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gd2UgbG9vcCBvdmVyIGFsbCB0aGUgYmluc1xyXG4gICAgICBmb3IgKCBsZXQgYmluSW5kZXggPSAwOyBiaW5JbmRleCA8IE1BWF9OVU1CRVJfQklOUzsgYmluSW5kZXgrKyApIHtcclxuXHJcbiAgICAgICAgaWYgKCBiaW5JbmRleCA8IG51bWJlck9mQmlucyApIHtcclxuICAgICAgICAgIGxhYmVsc1RleHRBcnJheVsgYmluSW5kZXggXS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIGNvbnN0IGJpbkNlbnRlclggPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBoaXN0b2dyYW0uZ2V0QmluQ2VudGVyWCggYmluSW5kZXgsIG51bWJlck9mQmlucyApICk7XHJcbiAgICAgICAgICBsZXQgYmluVmFsdWUgPSBnZXRIaXN0b2dyYW1CaW4oIGJpbkluZGV4ICk7IC8vIGEgbnVtYmVyXHJcblxyXG4gICAgICAgICAgaWYgKCBoaXN0b2dyYW1Nb2RlID09PSAnZnJhY3Rpb24nICkge1xyXG4gICAgICAgICAgICAvLyBzZXQgdGhlIGFwcHJvcHJpYXRlIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBpZiBpbiBmcmFjdGlvbiBtb2RlLFxyXG4gICAgICAgICAgICAvLyBpZiB0aGUgbnVtYmVyIG9mIGJpbnMgaXMgbGFyZ2UsIHRoZSB3aWR0aCBvZiB0aGUgYmluIGRvZXMgbm90IGFsbG93IGFzIG1hbnkgZGVjaW1hbCBwbGFjZXNcclxuICAgICAgICAgICAgYmluVmFsdWUgPSAoIG51bWJlck9mQmlucyA+IDE2ICkgPyBVdGlscy50b0ZpeGVkKCBiaW5WYWx1ZSwgMiApIDogVXRpbHMudG9GaXhlZCggYmluVmFsdWUsIDMgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyB1cGRhdGUgcG9zaXRpb24sIGZvbnRzaXplIGFuZCB0ZXh0IG9mIHRoZSBiaW5zXHJcbiAgICAgICAgICBsYWJlbHNUZXh0QXJyYXlbIGJpbkluZGV4IF0uc3RyaW5nID0gYmluVmFsdWU7XHJcbiAgICAgICAgICBsYWJlbHNUZXh0QXJyYXlbIGJpbkluZGV4IF0uc2V0Rm9udCggZm9udCApO1xyXG4gICAgICAgICAgbGFiZWxzVGV4dEFycmF5WyBiaW5JbmRleCBdLmNlbnRlclggPSBiaW5DZW50ZXJYO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIGlmIGJpbkluZGV4Pj0gbnVtYmVyT2ZiaW5zLCB0aGUgYmlucyBhcmUgbm90IHZpc2libGUuIFdlIGNob29zZSBub3QgdG8gdXBkYXRlIHRoZSB0ZXh0LlxyXG4gICAgICAgICAgbGFiZWxzVGV4dEFycmF5WyBiaW5JbmRleCBdLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIGJhbm5lciB3aGVuIGEgYmFsbCBoYXMgYmVlbiBhZGRlZCB0byB0aGUgaGlzdG9ncmFtXHJcbiAgICAvLyBubyBuZWVkIHRvIHJlbW92ZSBsaXN0ZW5lciwgcHJlc2VudCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW1cclxuICAgIGhpc3RvZ3JhbS5oaXN0b2dyYW1VcGRhdGVkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICB1cGRhdGVUZXh0QmFubmVyKCBudW1iZXJPZlJvd3NQcm9wZXJ0eS5nZXQoKSwgaGlzdG9ncmFtTW9kZVByb3BlcnR5LmdldCgpICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gbm8gbmVlZCB0byB1bmxpbmssIHByZXNlbnQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIG51bWJlck9mUm93c1Byb3BlcnR5LCBoaXN0b2dyYW1Nb2RlUHJvcGVydHkgXSwgKCBudW1iZXJPZlJvd3MsIGhpc3RvZ3JhbU1vZGUgKSA9PiB7XHJcbiAgICAgIHVwZGF0ZUJhbm5lciggbnVtYmVyT2ZSb3dzICk7IC8vIHVwZGF0ZSB0aGUgcGxhY2VtZW50IG9mIHRoZSB2ZXJ0aWNhbCBsaW5lIHNlcGFyYXRvcnNcclxuICAgICAgdXBkYXRlVGV4dEJhbm5lciggbnVtYmVyT2ZSb3dzLCBoaXN0b2dyYW1Nb2RlICk7IC8vIHVwZGF0ZSB0aGUgdGV4dCBjb250ZW50IG9mIGVhY2ggYmluc1xyXG4gICAgfSApO1xyXG5cclxuICAgIHVwZGF0ZVRleHRCYW5uZXIoIG51bWJlck9mUm93c1Byb3BlcnR5LmdldCgpLCBoaXN0b2dyYW1Nb2RlUHJvcGVydHkuZ2V0KCkgKTtcclxuICB9XHJcbn1cclxuXHJcbnBsaW5rb1Byb2JhYmlsaXR5LnJlZ2lzdGVyKCAnWEJhbm5lck5vZGUnLCBYQmFubmVyTm9kZSApO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vICBIaXN0b2dyYW0gQmFyc1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmNsYXNzIEhpc3RvZ3JhbUJhck5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge0hpc3RvZ3JhbX0gaGlzdG9ncmFtXHJcbiAgICogQHBhcmFtIHtQbGlua29Qcm9iYWJpbGl0eUNvbW1vbk1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGlzVGhlb3JldGljYWxIaXN0b2dyYW1WaXNpYmxlUHJvcGVydHlcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaGlzdG9ncmFtLCBtb2RlbCwgbW9kZWxWaWV3VHJhbnNmb3JtLCBpc1RoZW9yZXRpY2FsSGlzdG9ncmFtVmlzaWJsZVByb3BlcnR5ICkge1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gZ2V0IHRoZSBjb29yZGluYXRlIG9mIHRoZSBoaXN0b2dyYW0gYmFyIG5vZGVzXHJcbiAgICAvLyB0aGUgSElTVE9HUkFNX0JPVU5EUyBpbmNsdWRlIHRoZSBiYW5uZXIgb24gdG9wIChcclxuICAgIC8vIGJ1dCBub3QgdGhlIFkgYW5kIFggbGFiZWxzIGFyZSBvdXRzaWRlIG9mIEhJU1RPR1JBTV9CT1VORFNcclxuICAgIGNvbnN0IG1pblggPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBISVNUT0dSQU1fQk9VTkRTLm1pblggKTtcclxuICAgIGNvbnN0IG1pblkgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBISVNUT0dSQU1fQk9VTkRTLm1heFkgKTtcclxuICAgIGNvbnN0IG1heFggPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBISVNUT0dSQU1fQk9VTkRTLm1heFggKTtcclxuICAgIGNvbnN0IG1heFkgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBISVNUT0dSQU1fQk9VTkRTLm1pblkgKTtcclxuXHJcbiAgICAvLyBjb252ZW5pZW5jZSB2YXJpYWJsZXNcclxuICAgIGNvbnN0IGJhbm5lcldpZHRoID0gbWF4WCAtIG1pblg7IC8vIGluIHZpZXcgY29vcmRpbmF0ZXNcclxuICAgIGNvbnN0IG1heEJhckhlaWdodCA9IG1heFkgLSBtaW5ZIC0gQkFOTkVSX0hFSUdIVCAtIDM7IC8vIGluIHZpZXcgY29vcmRpbmF0ZXMsICgtNSkgYWxsb3dzIGZvciBzbWFsbCB3aGl0ZSBzcGFjZSBhYm92ZSBiYXIgc28gYmFyIGRvZXNuJ3QgdG91Y2ggYmFubmVyXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXhCYXJIZWlnaHQgPiAwLCAndGhlIEhlaWdodCBvZiB0aGUgYmFyIG11c3QgYmUgbGFyZ2VyIHRoYW4gemVybycgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW5kIGFkZCAob24gYSBzZXBhcmF0ZSBsYXllcikgdGhlIHR3byBoaXN0b2dyYW1zXHJcbiAgICBjb25zdCBzYW1wbGVIaXN0b2dyYW1Ob2RlID0gbmV3IE5vZGUoKTtcclxuICAgIGNvbnN0IHRoZW9yZXRpY2FsSGlzdG9ncmFtTm9kZSA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzYW1wbGVIaXN0b2dyYW1Ob2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGVvcmV0aWNhbEhpc3RvZ3JhbU5vZGUgKTtcclxuXHJcbiAgICAvLyB0aGUgcmVjdGFuZ2xlcyB0aGF0IG1ha2UgdXAgZWFjaCBoaXN0b2dyYW0gYXJlIHN0b3JlZCBpbiBhbiBhcnJheVxyXG4gICAgY29uc3Qgc2FtcGxlSGlzdG9ncmFtUmVjdGFuZ2xlc0FycmF5ID0gW107XHJcbiAgICBjb25zdCB0aGVvcmV0aWNhbEhpc3RvZ3JhbVJlY3RhbmdsZXNBcnJheSA9IFtdO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbmQgYWRkIHRoZSB0d28gYXJyYXlzIG9mIHJlY3RhbmdsZXNcclxuICAgIC8vIGluaXRpYWxpemUgdGhlIGhlaWdodCwgZmlsbCBhbmQgc3Ryb2tlcyBvZiB0aGUgcmVjdGFuZ2xlLCBzZXQgdmlzaWJpbGl0eSB0byBmYWxzZVxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgTUFYX05VTUJFUl9CSU5TOyBpKysgKSB7XHJcbiAgICAgIC8vIGNyZWF0ZXMgcmVjdGFuZ2xlcyB3aXRoIGEgbm9taW5hbCBoZWlnaHQgb2YgMSwgc28gdGhhdCBzY2VuZXJ5IGRvZXNuJ3QgdGhyb3cgYSBmaXRcclxuICAgICAgY29uc3Qgbm9taW5hbFNhbXBsZUhpc3RvZ3JhbVJlY3RhbmdsZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIGJhbm5lcldpZHRoLCAxLCB7XHJcbiAgICAgICAgZmlsbDogUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuSElTVE9HUkFNX0JBUl9DT0xPUl9GSUxMLFxyXG4gICAgICAgIHN0cm9rZTogUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuSElTVE9HUkFNX0JBUl9DT0xPUl9TVFJPS0UsXHJcbiAgICAgICAgbGluZVdpZHRoOiAyLFxyXG4gICAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICAgIH0gKTtcclxuICAgICAgLy8gY3JlYXRlIG5vbWluYWwgcmVjdGFuZ2xlc1xyXG4gICAgICAvLyBoZWlnaHQgb2YgcmVjdGFuZ2xlcyB3aWxsIGJlIHVwZGF0ZWQgdGhyb3VnaCBhbiB1cGRhdGUgZnVuY3Rpb25cclxuICAgICAgY29uc3Qgbm9taW5hbFRoZW9yZXRpY2FsSGlzdG9ncmFtUmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgYmFubmVyV2lkdGgsIDEsIHtcclxuICAgICAgICBzdHJva2U6IFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzLkJJTk9NSUFMX0RJU1RSSUJVVElPTl9CQVJfQ09MT1JfU1RST0tFLFxyXG4gICAgICAgIGxpbmVXaWR0aDogMixcclxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHNhbXBsZUhpc3RvZ3JhbVJlY3RhbmdsZXNBcnJheS5wdXNoKCBub21pbmFsU2FtcGxlSGlzdG9ncmFtUmVjdGFuZ2xlICk7XHJcbiAgICAgIHRoZW9yZXRpY2FsSGlzdG9ncmFtUmVjdGFuZ2xlc0FycmF5LnB1c2goIG5vbWluYWxUaGVvcmV0aWNhbEhpc3RvZ3JhbVJlY3RhbmdsZSApO1xyXG4gICAgfVxyXG4gICAgc2FtcGxlSGlzdG9ncmFtTm9kZS5zZXRDaGlsZHJlbiggc2FtcGxlSGlzdG9ncmFtUmVjdGFuZ2xlc0FycmF5ICk7XHJcbiAgICB0aGVvcmV0aWNhbEhpc3RvZ3JhbU5vZGUuc2V0Q2hpbGRyZW4oIHRoZW9yZXRpY2FsSGlzdG9ncmFtUmVjdGFuZ2xlc0FycmF5ICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRyaWFuZ2xlIHNoYXBlIGZvciB0aGUgaW5kaWNhdG9yIG9mIHNhbXBsZSBhdmVyYWdlIGFuZCB0aGVvcmV0aWNhbCBhdmVyYWdlXHJcbiAgICBjb25zdCB0cmlhbmdsZVNoYXBlID0gbmV3IFNoYXBlKCkubW92ZVRvKCAwLCBtYXhZIClcclxuICAgICAgLmxpbmVUb1JlbGF0aXZlKCAtVFJJQU5HTEVfV0lEVEggLyAyLCBUUklBTkdMRV9IRUlHSFQgKVxyXG4gICAgICAubGluZVRvUmVsYXRpdmUoIFRSSUFOR0xFX1dJRFRILCAwIClcclxuICAgICAgLmNsb3NlKCk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuZCBhZGQgdHJpYW5nbGUgaW5kaWNhdG9ycyBmb3IgdGhlIHNhbXBsZSBhbmQgdGhlb3JldGljYWwgYXZlcmFnZXNcclxuICAgIGNvbnN0IHNhbXBsZUF2ZXJhZ2VUcmlhbmdsZVBhdGggPSBuZXcgUGF0aCggdHJpYW5nbGVTaGFwZSwge1xyXG4gICAgICBmaWxsOiBQbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cy5ISVNUT0dSQU1fQkFSX0NPTE9SX0ZJTEwsXHJcbiAgICAgIHN0cm9rZTogUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuSElTVE9HUkFNX0JBUl9DT0xPUl9TVFJPS0UsXHJcbiAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgdGhlb3JldGljYWxBdmVyYWdlVHJpYW5nbGVQYXRoID0gbmV3IFBhdGgoIHRyaWFuZ2xlU2hhcGUsIHtcclxuICAgICAgc3Ryb2tlOiBQbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cy5CSU5PTUlBTF9ESVNUUklCVVRJT05fQkFSX0NPTE9SX1NUUk9LRSxcclxuICAgICAgZmlsbDogJ3JnYmEoMCwwLDAsMCknLCAvLyB0cmFuc3BhcmVudFxyXG4gICAgICBsaW5lV2lkdGg6IDJcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNhbXBsZUF2ZXJhZ2VUcmlhbmdsZVBhdGggKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoZW9yZXRpY2FsQXZlcmFnZVRyaWFuZ2xlUGF0aCApO1xyXG5cclxuICAgIC8vIHBvc2l0aW9uIHRoZSBzYW1wbGUgYXZlcmFnZSB0cmlhbmdsZSBhbmQgc2V0IGl0cyB2aXNpYmlsaXR5XHJcbiAgICB1cGRhdGVTYW1wbGVBdmVyYWdlVHJpYW5nbGUoKTtcclxuXHJcbiAgICAvLyBubyBuZWVkIHRvIHVubGluayAsIHByZXNlbnQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIG1vZGVsLm51bWJlck9mUm93c1Byb3BlcnR5LCBtb2RlbC5wcm9iYWJpbGl0eVByb3BlcnR5LCBpc1RoZW9yZXRpY2FsSGlzdG9ncmFtVmlzaWJsZVByb3BlcnR5IF0sXHJcbiAgICAgICggbnVtYmVyT2ZSb3dzLCBwcm9iYWJpbGl0eSwgaXNUaGVvcmV0aWNhbEhpc3RvZ3JhbVZpc2libGUgKSA9PiB7XHJcbiAgICAgICAgLy8gdXBkYXRlIHRoZSBzYW1wbGUgaGlzdG9ncmFtXHJcbiAgICAgICAgdXBkYXRlSGlzdG9ncmFtKCBzYW1wbGVIaXN0b2dyYW1SZWN0YW5nbGVzQXJyYXksIG1vZGVsLmhpc3RvZ3JhbS5nZXROb3JtYWxpemVkU2FtcGxlRGlzdHJpYnV0aW9uKCkgKTtcclxuICAgICAgICAvLyBzZXQgdGhlIGFwcHJvcHJpYXRlIHZpc2liaWxpdHkgdG8gdGhlIHRoZW9yZXRpY2FsIGhpc3RvZ3JhbSBhbmQgcGF0aFxyXG4gICAgICAgIHRoZW9yZXRpY2FsSGlzdG9ncmFtTm9kZS52aXNpYmxlID0gaXNUaGVvcmV0aWNhbEhpc3RvZ3JhbVZpc2libGU7XHJcbiAgICAgICAgdGhlb3JldGljYWxBdmVyYWdlVHJpYW5nbGVQYXRoLnZpc2libGUgPSBpc1RoZW9yZXRpY2FsSGlzdG9ncmFtVmlzaWJsZTtcclxuICAgICAgICAvLyBvbmx5IHVwZGF0ZSB0aGUgdGhlb3JldGljYWwgYXZlcmFnZSwgaWYgaXNUaGVvcmV0aWNhbEhpc3RvZ3JhbVZpc2libGUgaXMgc2V0IHRvIHZpc2libGVcclxuICAgICAgICBpZiAoIGlzVGhlb3JldGljYWxIaXN0b2dyYW1WaXNpYmxlICkge1xyXG4gICAgICAgICAgdXBkYXRlSGlzdG9ncmFtKCB0aGVvcmV0aWNhbEhpc3RvZ3JhbVJlY3RhbmdsZXNBcnJheSwgbW9kZWwuZ2V0Tm9ybWFsaXplZEJpbm9taWFsRGlzdHJpYnV0aW9uKCkgKTtcclxuICAgICAgICAgIHVwZGF0ZVRoZW9yZXRpY2FsQXZlcmFnZVRyaWFuZ2xlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBoaXN0b2dyYW0gd2hlbiBhIG1vZGVsIGJhbGwgaGFzIGV4aXRlZCB0aGUgZ2FsdG9uIGJvYXJkXHJcbiAgICBtb2RlbC5oaXN0b2dyYW0uaGlzdG9ncmFtVXBkYXRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgLy8gdXBkYXRlIHRoZSBoZWlnaHQgb2YgYmlucyBvZiBoaXN0b2dyYW1cclxuICAgICAgdXBkYXRlSGVpZ2h0T2ZIaXN0b2dyYW0oIHNhbXBsZUhpc3RvZ3JhbVJlY3RhbmdsZXNBcnJheSwgbW9kZWwuaGlzdG9ncmFtLmdldE5vcm1hbGl6ZWRTYW1wbGVEaXN0cmlidXRpb24oKSApO1xyXG4gICAgICAvLyB1cGRhdGUgdGhlIHBvc2l0aW9uIG9mIHRoZSBpbmRpY2F0b3IgZm9yIHNhbXBsZSBhdmVyYWdlXHJcbiAgICAgIHVwZGF0ZVNhbXBsZUF2ZXJhZ2VUcmlhbmdsZSgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgdHJpYW5nbGUgUGF0aCBiYXNlZCBvbiB0aGUgYXZlcmFnZSB2YWx1ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7UGF0aH0gcGF0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGF2ZXJhZ2VcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdXBkYXRlVHJpYW5nbGVQb3NpdGlvbiggcGF0aCwgYXZlcmFnZSApIHtcclxuICAgICAgY29uc3QgbnVtYmVyT2ZCaW5zID0gbW9kZWwubnVtYmVyT2ZSb3dzUHJvcGVydHkuZ2V0KCkgKyAxO1xyXG4gICAgICBwYXRoLmNlbnRlclggPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBoaXN0b2dyYW0uZ2V0VmFsdWVQb3NpdGlvbiggYXZlcmFnZSwgbnVtYmVyT2ZCaW5zICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIHRoZW9yZXRpY2FsIGF2ZXJhZ2UgaW5kaWNhdG9yIChhIHRyaWFuZ2xlKSBiYXNlZCBvblxyXG4gICAgICogdGhlIHRoZW9yZXRpY2FsIGF2ZXJhZ2UgdmFsdWVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdXBkYXRlVGhlb3JldGljYWxBdmVyYWdlVHJpYW5nbGUoKSB7XHJcbiAgICAgIGNvbnN0IGF2ZXJhZ2UgPSBtb2RlbC5nZXRUaGVvcmV0aWNhbEF2ZXJhZ2UoIG1vZGVsLm51bWJlck9mUm93c1Byb3BlcnR5LmdldCgpLCBtb2RlbC5wcm9iYWJpbGl0eVByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgIHRoZW9yZXRpY2FsQXZlcmFnZVRyaWFuZ2xlUGF0aC52aXNpYmxlID0gaXNUaGVvcmV0aWNhbEhpc3RvZ3JhbVZpc2libGVQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgdXBkYXRlVHJpYW5nbGVQb3NpdGlvbiggdGhlb3JldGljYWxBdmVyYWdlVHJpYW5nbGVQYXRoLCBhdmVyYWdlICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAgVXBkYXRlIHRoZSBwb3NpdGlvbiBvZiB0aGUgYXZlcmFnZSBzYW1wbGUgaW5kaWNhdG9yIChhIHRyaWFuZ2xlKSBiYXNlZFxyXG4gICAgICogIG9uIHRoZSBzYW1wbGUgYXZlcmFnZSBvZiB0aGUgaGlzdG9ncmFtIGJpbnNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdXBkYXRlU2FtcGxlQXZlcmFnZVRyaWFuZ2xlKCkge1xyXG4gICAgICBjb25zdCBhdmVyYWdlID0gbW9kZWwuaGlzdG9ncmFtLmF2ZXJhZ2U7XHJcbiAgICAgIC8vIHNldCB0byBpbnZpc2libGUgaWYgbm9uZSBvZiB0aGUgYmFsbHMgaGF2ZSBsYW5kZWRcclxuICAgICAgc2FtcGxlQXZlcmFnZVRyaWFuZ2xlUGF0aC52aXNpYmxlID0gKCBtb2RlbC5oaXN0b2dyYW0ubGFuZGVkQmFsbHNOdW1iZXIgPiAwICk7XHJcbiAgICAgIC8vIHVwZGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIHRyaWFuZ2xlIGZvciB0aGUgc2FtcGxlIGRpc3RyaWJ1dGlvbjtcclxuICAgICAgdXBkYXRlVHJpYW5nbGVQb3NpdGlvbiggc2FtcGxlQXZlcmFnZVRyaWFuZ2xlUGF0aCwgYXZlcmFnZSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRnVuY3Rpb24gdGhhdCBzb2xlbHkgdXBkYXRlIHRoZSBIZWlnaHQgb2YgdGhlIGJhcnMgb2YgdGhlIGhpc3RvZ3JhbVxyXG4gICAgICogIChhbmQgbm90IHRoZWlyIHZpc2liaWxpdHkpXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5LjxSZWN0YW5nbGU+fSByZWN0YW5nbGVzQXJyYXlcclxuICAgICAqIEBwYXJhbSB7QXJyYXkuPG51bWJlcj59IGJpblZhbHVlc1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVIZWlnaHRPZkhpc3RvZ3JhbSggcmVjdGFuZ2xlc0FycmF5LCBiaW5WYWx1ZXMgKSB7XHJcbiAgICAgIGxldCBpO1xyXG4gICAgICBjb25zdCBudW1iZXJPZkJpbnMgPSBtb2RlbC5udW1iZXJPZlJvd3NQcm9wZXJ0eS5nZXQoKSArIDE7XHJcbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgbnVtYmVyT2ZCaW5zOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgYmFySGVpZ2h0ID0gbWF4QmFySGVpZ2h0ICogYmluVmFsdWVzWyBpIF07XHJcbiAgICAgICAgcmVjdGFuZ2xlc0FycmF5WyBpIF0udmlzaWJsZSA9ICggYmFySGVpZ2h0ID4gMCApOyAvLyB6ZXJvLWhlaWdodCBiYXJzIGFyZSBpbnZpc2libGUsIHNlZSAjODdcclxuICAgICAgICByZWN0YW5nbGVzQXJyYXlbIGkgXS5zZXRSZWN0SGVpZ2h0RnJvbUJvdHRvbSggYmFySGVpZ2h0ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7QXJyYXkuPFJlY3RhbmdsZT59IHJlY3RhbmdsZXNBcnJheVxyXG4gICAgICogQHBhcmFtIHtBcnJheS48bnVtYmVyPn0gYmluVmFsdWVzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHVwZGF0ZUhpc3RvZ3JhbSggcmVjdGFuZ2xlc0FycmF5LCBiaW5WYWx1ZXMgKSB7XHJcbiAgICAgIGxldCBpO1xyXG4gICAgICBjb25zdCBudW1iZXJPZkJpbnMgPSBtb2RlbC5udW1iZXJPZlJvd3NQcm9wZXJ0eS5nZXQoKSArIDE7XHJcbiAgICAgIGNvbnN0IHhTcGFjaW5nID0gYmFubmVyV2lkdGggLyBudW1iZXJPZkJpbnM7XHJcbiAgICAgIC8vIHVwZGF0ZSBBTEwgcmVjdGFuZ2xlc1xyXG4gICAgICBmb3IgKCBpID0gMDsgaSA8IE1BWF9OVU1CRVJfQklOUzsgaSsrICkge1xyXG4gICAgICAgIGlmICggaSA8IG51bWJlck9mQmlucyApIHtcclxuXHJcbiAgICAgICAgICBjb25zdCBiYXJIZWlnaHQgPSBtYXhCYXJIZWlnaHQgKiBiaW5WYWx1ZXNbIGkgXTtcclxuXHJcbiAgICAgICAgICAvLyB6ZXJvLWhlaWdodCBiYXJzIGFyZSBpbnZpc2libGUsIHNlZSAjODdcclxuICAgICAgICAgIHJlY3RhbmdsZXNBcnJheVsgaSBdLnZpc2libGUgPSAoIGJhckhlaWdodCA+IDAgKTtcclxuXHJcbiAgICAgICAgICByZWN0YW5nbGVzQXJyYXlbIGkgXS5zZXRSZWN0KFxyXG4gICAgICAgICAgICBtaW5YICsgKCBpICkgKiB4U3BhY2luZyxcclxuICAgICAgICAgICAgbWF4WSAtIG1heEJhckhlaWdodCAqIGJpblZhbHVlc1sgaSBdLFxyXG4gICAgICAgICAgICB4U3BhY2luZyxcclxuICAgICAgICAgICAgYmFySGVpZ2h0XHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIHRoZSByZWN0YW5nbGVzIHdpdGggYW4gaW5kZXggbGFyZ2VyIHRoYW4gdGhlIGN1cnJlbnQgbnVtYmVyIG9mIGJpbnMgYXJlIHNldCB0byBpbnZpc2libGUuXHJcbiAgICAgICAgICAvLyBubyBuZWVkIHRvIHVwZGF0ZSB0aGUgaGVpZ2h0IG9mIHRoZSBpbnZpc2libGUgcmVjdGFuZ2xlcy5cclxuICAgICAgICAgIHJlY3RhbmdsZXNBcnJheVsgaSBdLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbnBsaW5rb1Byb2JhYmlsaXR5LnJlZ2lzdGVyKCAnSGlzdG9ncmFtQmFyTm9kZScsIEhpc3RvZ3JhbUJhck5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEhpc3RvZ3JhbU5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDNUYsT0FBT0MsaUJBQWlCLE1BQU0sNEJBQTRCO0FBQzFELE9BQU9DLHdCQUF3QixNQUFNLG1DQUFtQztBQUN4RSxPQUFPQywwQkFBMEIsTUFBTSxrQ0FBa0M7O0FBRXpFO0FBQ0E7QUFDQTs7QUFFQSxNQUFNQyxlQUFlLEdBQUdELDBCQUEwQixDQUFDRSxVQUFVLENBQUNDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFdkU7QUFDQSxNQUFNQyxvQkFBb0IsR0FBRyxPQUFPO0FBQ3BDLE1BQU1DLDBCQUEwQixHQUFHLEdBQUc7QUFDdEMsTUFBTUMsc0JBQXNCLEdBQUcsTUFBTTs7QUFFckM7QUFDQSxNQUFNQyxhQUFhLEdBQUcsRUFBRTtBQUN4QixNQUFNQyx1QkFBdUIsR0FBRyxJQUFJaEIsS0FBSyxDQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBSSxDQUFDOztBQUV4RDtBQUNBLE1BQU1pQixpQkFBaUIsR0FBRyxJQUFJ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