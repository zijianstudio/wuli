// Copyright 2016-2021, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
// sim modules
import unitRates from '../unitRates.js';

const URQueryParameters = QueryStringMachine.getAll( {

  // Enables random selection of scenes and questions in Shopping and Shopping Lab screens
  // For internal use only.
  randomEnabled: {
    type: 'boolean',
    defaultValue: true
  },

  // Controls the animation speed of car races.
  // 1 second of sim type is equivalent to this many hours of race time.
  // Larger values make car animation run faster.
  // For internal use only.
  raceTimeScale: {
    type: 'number',
    defaultValue: 8, // hours
    isValidValue: value => ( value > 0 )
  },

  // Shows cells on the scale and shelf, indicating where bags and items may reside.
  // For internal use only.
  showCells: { type: 'flag' }
} );

unitRates.register( 'URQueryParameters', URQueryParameters );

// Log query parameters
logGlobal( 'phet.chipper.queryParameters' );
logGlobal( 'phet.preloads.phetio.queryParameters' );
logGlobal( 'phet.unitRates.URQueryParameters' );

export default URQueryParameters;