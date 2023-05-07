// Copyright 2014-2023, University of Colorado Boulder

/**
 * Constants that are global to this sim.
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Range from '../../../dot/js/Range.js';
import { NumberDisplayOptions } from '../../../scenery-phet/js/NumberDisplay.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { AccordionBoxOptions } from '../../../sun/js/AccordionBox.js';
import { NumberPickerOptions } from '../../../sun/js/NumberPicker.js';
import { PanelOptions } from '../../../sun/js/Panel.js';
import graphingQuadratics from '../graphingQuadratics.js';
import GQColors from './GQColors.js';

const PANEL_CORNER_RADIUS = 5; // corner radius for all panel-like containers

const ACCORDION_BOX_OPTIONS: AccordionBoxOptions = {
  resize: false,
  fill: GQColors.CONTROL_PANEL_BACKGROUND,
  cornerRadius: PANEL_CORNER_RADIUS,
  titleYMargin: 10,
  buttonXMargin: 10,
  buttonYMargin: 10,
  contentXMargin: 20,
  contentYMargin: 15,
  expandCollapseButtonOptions: {
    sideLength: 25
  }
};

const PANEL_OPTIONS: PanelOptions = {
  fill: GQColors.CONTROL_PANEL_BACKGROUND,
  cornerRadius: PANEL_CORNER_RADIUS,
  xMargin: 20,
  yMargin: 15
};

const NUMBER_DISPLAY_OPTIONS: NumberDisplayOptions = {
  textOptions: {
    font: new PhetFont( { size: 26, weight: 'bold' } )
  },
  backgroundFill: null,
  backgroundStroke: null,
  backgroundLineWidth: 0,
  xMargin: 0,
  yMargin: 0
};

const NUMBER_PICKER_OPTIONS: NumberPickerOptions = {
  font: new PhetFont( 26 ),
  xMargin: 5,
  touchAreaXDilation: 30
};

const GQConstants = {

  // Custom layout bounds because this sim is part of the Graphing Lines family, which was ported to Java.
  // We used Java's layoutBounds in order to avoid changing sizes, fonts, etc. during the port.
  // The bounds with was modified to match the default HTML5 layoutBounds aspect ratio.
  // See https://github.com/phetsims/graphing-quadratics/issues/121
  SCREEN_VIEW_LAYOUT_BOUNDS: new Bounds2( 0, 0, 1160, 700 ),
  SCREEN_VIEW_X_MARGIN: 50,
  SCREEN_VIEW_Y_MARGIN: 16,

  // range of the graph's axes
  X_AXIS_RANGE: new Range( -10, 10 ),
  Y_AXIS_RANGE: new Range( -10, 10 ),

  // options for various UI components
  ACCORDION_BOX_OPTIONS: ACCORDION_BOX_OPTIONS,
  PANEL_OPTIONS: PANEL_OPTIONS,
  NUMBER_DISPLAY_OPTIONS: NUMBER_DISPLAY_OPTIONS,
  NUMBER_PICKER_OPTIONS: NUMBER_PICKER_OPTIONS,

  // vertical space between checkboxes
  CHECKBOXES_Y_SPACING: 15,

  // radii
  MANIPULATOR_RADIUS: 0.425,  // radius of manipulators, in model coordinates
  POINT_RADIUS: 0.25, // radius of non-interactive points, in model coordinates

  // fonts
  TITLE_FONT: new PhetFont( 20 ),
  SLIDER_LABEL_FONT: new PhetFont( { size: 26, weight: 'bold' } ),
  SLIDER_TICK_LABEL_FONT: new PhetFont( 16 ),
  CHECKBOX_LABEL_FONT: new PhetFont( 20 ),
  GRAPHED_EQUATION_FONT: new PhetFont( 18 ),
  INTERACTIVE_EQUATION_FONT: new PhetFont( 26 ),
  INTERACTIVE_EQUATION_FRACTION_FONT: new PhetFont( 22 ),
  COORDINATES_FONT: new PhetFont( { size: 16, weight: 'bold' } ),
  NO_REAL_ROOTS_FONT: new PhetFont( { size: 18, weight: 'bold' } ),

  // line widths
  INTERACTIVE_QUADRATIC_LINE_WIDTH: 4,
  SAVED_QUADRATIC_LINE_WIDTH: 3,
  QUADRATIC_TERMS_LINE_WIDTH: 2, // y = ax^2, y = bx, y = c
  AXIS_OF_SYMMETRY_LINE_WIDTH: 3,
  DIRECTRIX_LINE_WIDTH: 3,
  POINT_ON_PARABOLA_LINE_WIDTH: 3, // lines that connect point to focus and directrix

  // line dashes
  AXIS_OF_SYMMETRY_LINE_DASH: [ 5, 5 ],
  DIRECTRIX_LINE_DASH: [ 5, 5 ],
  POINT_ON_PARABOLA_LINE_DASH: [ 5, 5 ], // lines that connect point to focus and directrix

  // decimal places
  AXIS_OF_SYMMETRY_DECIMALS: 2,
  DIRECTRIX_DECIMALS: 2,
  FOCUS_DECIMALS: 2,
  POINT_ON_PARABOLA_DECIMALS: 2,
  POINT_TOOL_DECIMALS: 2,
  ROOTS_DECIMALS: 2,
  VERTEX_DECIMALS: 2,
  EXPLORE_DECIMALS_A: 2,
  EXPLORE_DECIMALS_B: 1,
  EXPLORE_DECIMALS_C: 1,
  FOCUS_AND_DIRECTRIX_DECIMALS_A: 3,
  FOCUS_AND_DIRECTRIX_DECIMALS_P: 1,
  FOCUS_AND_DIRECTRIX_DECIMALS_H: 1,
  FOCUS_AND_DIRECTRIX_DECIMALS_K: 1,

  // slider intervals
  EXPLORE_INTERVAL_A: 0.01,
  EXPLORE_SNAP_TO_ZERO_EPSILON_A: 0.03,
  EXPLORE_INTERVAL_B: 0.1,
  EXPLORE_INTERVAL_C: 0.1,
  FOCUS_AND_DIRECTRIX_INTERVAL_P: 0.1,
  FOCUS_AND_DIRECTRIX_INTERVAL_H: 0.1,
  FOCUS_AND_DIRECTRIX_INTERVAL_K: 0.1,

  // margins between equations and edges of graph
  // Caution! Changing these may cause an equation to go off the graph. Test thoroughly!
  EQUATION_X_MARGIN: 1.5, // distance between equation and left/right edges of graph, in model coordinate frame
  EQUATION_Y_MARGIN: 0.5, // distance between equation and top/bottom edges of graph, in model coordinate frame

  // space between equation and the curve that it labels, in view coordinate frame
  EQUATION_CURVE_SPACING: 5,

  // spacing around operators in interactive equations, in view coordinate frame
  EQUATION_OPERATOR_SPACING: 8,

  // spacing within terms in interactive equations, in view coordinate frame
  EQUATION_TERM_SPACING: 6,

  // PhET-iO documentation patterns
  VALUE_DOC: 'value of \'{{symbol}}\' in the interactive equation',
  PICKER_DOC: 'picker for \'{{symbol}}\' value',
  SLIDER_DOC: 'slider for \'{{symbol}}\' value'
};

graphingQuadratics.register( 'GQConstants', GQConstants );
export default GQConstants;