// Copyright 2018-2020, University of Colorado Boulder

/**
 * Constants for the fractions sims
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import fractionsCommon from '../fractionsCommon.js';

// constants
const WHOLE_FRACTIONAL_SIZE_RATIO = 2;
const SHAPE_RADIUS = 50;

const FractionsCommonConstants = {
  // {number}
  PANEL_MARGIN: 10,

  // {number} - margins used for the matching screens
  MATCHING_MARGIN: 15,

  // {number} - Line width for the outside border
  MATCHING_BORDER: 2.1,

  // {number} - The diameter of circle shapes, and the width of vertical-bar shapes.
  SHAPE_SIZE: SHAPE_RADIUS * 2,

  // {number} - The height of the vertical-bar representation shape (smaller, so that it is rectangular)
  SHAPE_VERTICAL_BAR_HEIGHT: Math.PI * SHAPE_RADIUS / 2,

  // {number} - The amount of space between shape containers
  SHAPE_CONTAINER_PADDING: 8,

  // {Font}
  NUMBER_FRACTIONAL_FONT: new PhetFont( { size: 60, weight: 'bold' } ),
  NUMBER_WHOLE_FONT: new PhetFont( { size: 60 * WHOLE_FRACTIONAL_SIZE_RATIO, weight: 'bold' } ),

  // {number} - The size of the "whole" number text compared to the numerator or denominator text
  WHOLE_FRACTIONAL_SIZE_RATIO: WHOLE_FRACTIONAL_SIZE_RATIO,

  NUMBER_CORNER_RADIUS: 5,
  ROUND_BUTTON_RADIUS: 15,
  ROUND_BUTTON_MARGIN: 5.4,
  MAX_SHAPE_CONTAINERS: 4,

  // {number} - The relative scales of shape/number pieces in panels for the "building" style
  SHAPE_BUILD_SCALE: 0.6,
  NUMBER_BUILD_SCALE: 0.8,

  // {number} - The relative scales of shape/number groups in the collection areas / targets.
  SHAPE_COLLECTION_SCALE: 0.6,
  NUMBER_COLLECTION_SCALE: 0.7,

  // {number} - Common values for building piece views
  INTRO_DROP_SHADOW_OFFSET: 5,
  INTRO_CONTAINER_LINE_WIDTH: 2,
  INTRO_CONTAINER_SPACING: 10,

  // {number} - We have a number of things that rely on a certain fixed number of levels for the game
  NUM_LEVELS: 10
};

fractionsCommon.register( 'FractionsCommonConstants', FractionsCommonConstants );

export default FractionsCommonConstants;