// Copyright 2014-2020, University of Colorado Boulder

/**
 * Constants that are used in the Least Squares Regression simulation.
 *
 * @author Martin Veillette (Berea College)
 */

import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import leastSquaresRegression from '../leastSquaresRegression.js';

const LeastSquaresRegressionConstants = {

  // speed for dataPoints to reach the bucket when animated
  ANIMATION_SPEED: 0.001, //  in model units per millisecond;

  // Background color for sim and graph
  BACKGROUND_COLOR: 'rgb( 236, 255, 245 )',
  GRAPH_BACKGROUND_COLOR: 'rgb( 255, 255, 255 )',

  // LineWidth of 'Best Fit Line' and 'MyLine'
  LINE_WIDTH: 2,
  // LineWidth for the Residual line of 'Best Fit Line' and 'MyLine'
  RESIDUAL_LINE_WIDTH: 2,

  // 'MyLine' color
  MY_LINE_COLOR: {
    BASE_COLOR: 'rgb( 0, 0, 255)',
    RESIDUAL_COLOR: 'rgb( 110, 92, 231 )',
    SQUARED_RESIDUAL_COLOR: 'rgba( 154, 150, 255, 0.4 )',
    SUM_OF_SQUARES_COLOR: 'rgb( 154, 150, 255 )'
  },

  // 'Best Fit Line' Color
  BEST_FIT_LINE_COLOR: {
    BASE_COLOR: 'rgb( 255, 0, 0 )',
    RESIDUAL_COLOR: 'rgb( 178, 21, 27 )',
    SQUARED_RESIDUAL_COLOR: 'rgba( 255, 52, 59, 0.4 )',
    SUM_OF_SQUARES_COLOR: 'rgb( 255, 52, 59 )'
  },

  // Movable data points (and points in bucket)
  DYNAMIC_DATA_POINT_RADIUS: 7,
  DYNAMIC_DATA_POINT_FILL: 'orange',
  DYNAMIC_DATA_POINT_STROKE: 'black',
  DYNAMIC_DATA_POINT_LINE_WIDTH: 1,

  // Static data points
  STATIC_DATA_POINT_RADIUS: 5,
  STATIC_DATA_POINT_FILL: 'orange',
  STATIC_DATA_POINT_STROKE: 'white',
  STATIC_DATA_POINT_LINE_WIDTH: 1,

  // Gridlines and grid icon
  MAJOR_GRID_STROKE_COLOR: 'rgb( 128, 128, 128 )',
  MINOR_GRID_STROKE_COLOR: 'rgb( 218, 218, 218)',

  // Font sizes and weight
  TEXT_FONT: new PhetFont( { size: 16 } ), // default font for text
  TEXT_BOLD_FONT: new PhetFont( { size: 16, weight: 'bold' } ), // default font for bold font
  PEARSON_COEFFICIENT_TEXT_FONT: new PhetFont( { size: 22, weight: 'bold' } ),
  CHECKBOX_TEXT_FONT: new PhetFont( { size: 14 } ),
  MAJOR_TICK_FONT: new PhetFont( { size: 14 } ),
  SUM_RESIDUALS_FONT: new PhetFont( { size: 14 } ),

  REFERENCE_FONT: new PhetFont( { size: 16 } ),
  SOURCE_FONT: new PhetFont( { size: 14 } ),

  // Panels
  CONTROL_PANEL_CORNER_RADIUS: 10,
  SMALL_PANEL_CORNER_RADIUS: 5,
  CONTROL_PANEL_BACKGROUND_COLOR: 'rgb( 255, 245, 238 )', // seashell
  SMALL_PANEL_STROKE: 'rgb(204,204,204)', // gray

  // Combo box
  ITEM_HIGHLIGHT_FILL: 'rgb( 236, 255, 245 )'

};

leastSquaresRegression.register( 'LeastSquaresRegressionConstants', LeastSquaresRegressionConstants );

export default LeastSquaresRegressionConstants;