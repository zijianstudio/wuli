// Copyright 2013-2023, University of Colorado Boulder

/**
 * Constants that are specific to the 'Line Game' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import GLConstants from '../common/GLConstants.js';
import graphingLines from '../graphingLines.js';

const LineGameConstants = {

  ORIGIN_OFFSET: new Vector2( 790, 300 ), // graph (0,0) will be positioned at these view coordinates

  // fonts
  TITLE_FONT: new PhetFont( { size: 40, weight: 'bold' } ),
  BUTTON_FONT: new PhetFont( { size: 30, weight: 'bold' } ),
  INTERACTIVE_EQUATION_FONT_SIZE: 28,
  STATIC_EQUATION_FONT_SIZE: 28,
  POINTS_AWARDED_FONT: new PhetFont( { size: 36, weight: 'bold' } ),

  // colors
  TITLE_COLOR: 'black',
  ANSWER_COLOR: 'rgb( 0, 180, 0 )', // color of the correct answer
  GUESS_COLOR: 'black', // color of the user's guess
  POINTS_AWARDED_COLOR: 'black',
  BUTTON_COLOR: 'yellow',

  // sizes
  GRAPH_WIDTH: 500, // graph width in view coordinates
  FACE_DIAMETER: 120,
  MANIPULATOR_RADIUS: GLConstants.MANIPULATOR_RADIUS, // radius of the manipulators, in model units
  POINT_RADIUS: 0.25, // radius of plotted points, in model units
  POINT_TOOL_SCALE: 0.95
};

graphingLines.register( 'LineGameConstants', LineGameConstants );

export default LineGameConstants;