// Copyright 2014-2020, University of Colorado Boulder

/**
 * Constants used throughout the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import faradaysLaw from '../faradaysLaw.js';

// constants
const BULB_POSITION = new Vector2( 190, 200 );

const FaradaysLawConstants = {
  LAYOUT_BOUNDS: new Bounds2( 0, 0, 834, 504 ),
  BULB_POSITION: BULB_POSITION,
  VOLTMETER_POSITION: BULB_POSITION.minusXY( 0, 120 ),
  MAGNET_HEIGHT: 30,
  MAGNET_WIDTH: 140,
  TOP_COIL_POSITION: new Vector2( 422, 110 ),
  BOTTOM_COIL_POSITION: new Vector2( 448, 310 )
};

faradaysLaw.register( 'FaradaysLawConstants', FaradaysLawConstants );
export default FaradaysLawConstants;