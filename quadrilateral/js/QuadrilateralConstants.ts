// Copyright 2021-2023, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Bounds2 from '../../dot/js/Bounds2.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import quadrilateral from './quadrilateral.js';

const SCREEN_TEXT_FONT = new PhetFont( { size: 18 } );
const VERTEX_WIDTH = 0.1;

const BOUNDS_WIDTH = 3 + VERTEX_WIDTH;
const BOUNDS_HEIGHT = 2 + VERTEX_WIDTH;


const QuadrilateralConstants = {

  //----------------------------------------------------------------------------------------------------------
  // MODEL CONSTANTS
  //----------------------------------------------------------------------------------------------------------

  // Width of a square vertex in model coordinates.
  VERTEX_WIDTH: VERTEX_WIDTH,

  // Amount of spacing in model coordinates between major grid lines in the visual grid.
  GRID_SPACING: 0.25,

  // Dimensions of model bounds - base size extended by VERTEX_WIDTH so that the edge of a Vertex can get flush
  // against the model bounds as the vertex center snaps to grid lines.
  BOUNDS_WIDTH: BOUNDS_WIDTH,
  BOUNDS_HEIGHT: BOUNDS_HEIGHT,

  // The bounds of the simulation in model coordinates. Origin (0,0) is at the center. The shape and
  // vertices can be positioned within these bounds.
  MODEL_BOUNDS: new Bounds2(
    -BOUNDS_WIDTH / 2,
    -BOUNDS_HEIGHT / 2,
    BOUNDS_WIDTH / 2,
    BOUNDS_HEIGHT / 2
  ),

  // ONLY FOR ?reducedStepSize.
  MAJOR_REDUCED_SIZE_VERTEX_INTERVAL: 0.0625,
  MINOR_REDUCED_SIZE_VERTEX_INTERVAL: 0.015625,

  //----------------------------------------------------------------------------------------------------------
  // VIEW CONSTANTS
  //----------------------------------------------------------------------------------------------------------
  SCREEN_VIEW_X_MARGIN: 25,
  SCREEN_VIEW_Y_MARGIN: 15,

  // spacing between different groups of components in the ScreenView
  VIEW_GROUP_SPACING: 45,

  // additional spacing in the ScreenView between components (generally in the same group)
  VIEW_SPACING: 15,

  // corner radius used in many rectangles in this sim
  CORNER_RADIUS: 5,

  // dilation frequently used for interactive components in this sim
  POINTER_AREA_DILATION: 5,

  // spacing between grouped controls
  CONTROLS_SPACING: 15,

  // horizontal spacing between a UI component and its label (such as between a checkbox and its label or a button
  // and its label)
  CONTROL_LABEL_SPACING: 10,

  // Font for text that appears on screen
  SCREEN_TEXT_FONT: SCREEN_TEXT_FONT,
  SCREEN_TEXT_OPTIONS: {
    font: SCREEN_TEXT_FONT
  },

  // Text options for titles for panels and dialogs.
  PANEL_TITLE_TEXT_OPTIONS: {
    font: new PhetFont( { size: 18, weight: 'bold' } )
  },

  // Text options for the "Shape Name" display.
  SHAPE_NAME_TEXT_OPTIONS: {
    font: new PhetFont( { size: 22 } ),
    maxWidth: 250
  }
};

quadrilateral.register( 'QuadrilateralConstants', QuadrilateralConstants );
export default QuadrilateralConstants;