// Copyright 2014-2023, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import graphingLines from '../graphingLines.js';

const GLQueryParameters = QueryStringMachine.getAll( {

  // Shows the game reward regardless of score.
  // For internal use only.
  showReward: { type: 'flag' },

  // Whether to shuffle challenges in the game, set to false if you want to compare challenges to the design doc.
  // For internal use only.
  shuffle: {
    type: 'boolean',
    defaultValue: true
  },

  // Verifies the creation of challenges via stress testing, use this with assertions enabled (?ea).
  // For internal use only.
  verifyChallenges: { type: 'flag' }
} );

graphingLines.register( 'GLQueryParameters', GLQueryParameters );

// Log query parameters
logGlobal( 'phet.chipper.queryParameters' );
logGlobal( 'phet.preloads.phetio.queryParameters' );
logGlobal( 'phet.graphingLines.GLQueryParameters' );

export default GLQueryParameters;