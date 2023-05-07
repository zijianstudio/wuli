// Copyright 2021, University of Colorado Boulder

/**
 * Query parameters supported by the normal-modes simulation.
 * Running with ?log will print these query parameters and their values to the console at startup.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import normalModes from '../normalModes.js';

const NormalModesQueryParameters = QueryStringMachine.getAll( {

  //----------------------------------------------------------------------------------------------------------------
  // Public-facing query parameters
  //----------------------------------------------------------------------------------------------------------------

  //----------------------------------------------------------------------------------------------------------------
  // Internal query parameters
  //----------------------------------------------------------------------------------------------------------------

  // Adjusts the height of the dragBounds for masses in the 'One Dimension' screen.
  // See https://github.com/phetsims/normal-modes/issues/68
  dragBoundsHeight1D: {
    type: 'number',
    defaultValue: 100,
    isValidValue: value => ( value > 0 )
  },

  // Draws the drag bounds for masses in the 'One Dimension' screen as a red rectangle.
  showDragBounds1D: {
    type: 'flag'
  }
} );

normalModes.register( 'NormalModesQueryParameters', NormalModesQueryParameters );

// Log query parameters
logGlobal( 'phet.chipper.queryParameters' );
logGlobal( 'phet.preloads.phetio.queryParameters' );
logGlobal( 'phet.normalModes.NormalModesQueryParameters' );

export default NormalModesQueryParameters;