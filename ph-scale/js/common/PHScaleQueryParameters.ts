// Copyright 2016-2022, University of Colorado Boulder

/**
 * Query parameters used in sim-specific code.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import phScale from '../phScale.js';

const PHScaleQueryParameters = QueryStringMachine.getAll( {

  // Whether to automatically fill the beaker each time the solute changes.
  autofill: {
    type: 'boolean',
    defaultValue: true,
    public: true
  },

  // Shows the ratio (red/blue particle counts) in the bottom of the beaker for the 'ratio' view.
  // For internal use only.
  showRatio: {
    type: 'flag'
  }
} );

phScale.register( 'PHScaleQueryParameters', PHScaleQueryParameters );

// Log query parameters
logGlobal( 'phet.chipper.queryParameters' );
logGlobal( 'phet.preloads.phetio.queryParameters' );
logGlobal( 'phet.phScale.PHScaleQueryParameters' );

export default PHScaleQueryParameters;