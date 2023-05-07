// Copyright 2014-2022, University of Colorado Boulder

/**
 * Constants that are shared between the various portions of the Area Builder simulation.
 *
 * @author John Blanco
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import areaBuilder from '../areaBuilder.js';
import AreaBuilderStrings from '../AreaBuilderStrings.js';

const invalidValueString = AreaBuilderStrings.invalidValue;

const AreaBuilderSharedConstants = {

  // layout bounds used throughout the simulation for laying out the screens
  LAYOUT_BOUNDS: new Bounds2( 0, 0, 768, 464 ),

  // colors used for the various shapes
  GREENISH_COLOR: '#33E16E',
  DARK_GREEN_COLOR: '#1A7137',
  PURPLISH_COLOR: '#9D87C9',
  DARK_PURPLE_COLOR: '#634F8C',
  ORANGISH_COLOR: '#FFA64D',
  ORANGE_BROWN_COLOR: '#A95327',
  PALE_BLUE_COLOR: '#5DB9E7',
  DARK_BLUE_COLOR: '#277DA9',
  PINKISH_COLOR: '#E88DC9',
  PURPLE_PINK_COLOR: '#AA548D',
  PERIMETER_DARKEN_FACTOR: 0.6, // The amount that the perimeter colors are darkened from the main shape color

  // velocity at which animated elements move
  ANIMATION_SPEED: 200, // In screen coordinates per second

  // various other constants
  BACKGROUND_COLOR: 'rgb( 225, 255, 255 )',
  CONTROL_PANEL_BACKGROUND_COLOR: 'rgb( 254, 241, 233 )',
  RESET_BUTTON_RADIUS: 22,
  CONTROLS_INSET: 15,

  UNIT_SQUARE_LENGTH: 32, // In screen coordinates, used in several places

  // string used to indicate an invalid value for area and perimeter
  INVALID_VALUE: invalidValueString
};

areaBuilder.register( 'AreaBuilderSharedConstants', AreaBuilderSharedConstants );
export default AreaBuilderSharedConstants;