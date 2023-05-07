// Copyright 2014-2023, University of Colorado Boulder

/**
 * Colors used throughout this simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Color } from '../../../scenery/js/imports.js';
import reactantsProductsAndLeftovers from '../reactantsProductsAndLeftovers.js';

const DARK_BLUE = new Color( 51, 118, 196 );

const RPALColors = {
  SCREEN_BACKGROUND: 'rgb( 218, 236, 255 )',
  STATUS_BAR_FILL: DARK_BLUE,
  BRACKET_NODE_STROKE: DARK_BLUE,
  BOX_STROKE: DARK_BLUE.withAlpha( 0.3 ),
  BOX_FILL: 'white'
};

reactantsProductsAndLeftovers.register( 'RPALColors', RPALColors );
export default RPALColors;