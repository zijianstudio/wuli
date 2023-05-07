// Copyright 2014-2023, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import reactantsProductsAndLeftovers from '../reactantsProductsAndLeftovers.js';

const RPALQueryParameters = QueryStringMachine.getAll( {

  // Plays all reactions for each level of the game.
  // For internal use only.
  playAll: { type: 'flag' },

  // Show the game reward regardless of score.
  // For internal use only.
  showReward: { type: 'flag' }
} );

reactantsProductsAndLeftovers.register( 'RPALQueryParameters', RPALQueryParameters );

// Log query parameters
logGlobal( 'phet.chipper.queryParameters' );
logGlobal( 'phet.preloads.phetio.queryParameters' );
logGlobal( 'phet.reactantsProductsAndLeftovers.RPALQueryParameters' );

export default RPALQueryParameters;