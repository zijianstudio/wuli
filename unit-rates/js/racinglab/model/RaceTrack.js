// Copyright 2017-2023, University of Colorado Boulder

/**
 * Model of a race track in the 'Racing Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import unitRates from '../../unitRates.js';

export default class RaceTrack {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      length: 200, // {number} initial distance between start and finish line, in miles
      maxLength: 200, // {number} maximum distance between start and finish line, in miles
      markerSpacing: 50  // {number} track markers are spaced at this interval, in miles
    }, options );

    // @public (read-only)
    this.maxLength = options.maxLength;
    this.markerSpacing = options.markerSpacing;

    // @public
    this.lengthProperty = new NumberProperty( options.length );

    // validate length, unlink not needed
    this.lengthProperty.link( length => {
      assert && assert( length >= 0 && length <= options.maxLength, `invalid length: ${length}` );
    } );
  }

  // @public
  reset() {
    this.lengthProperty.reset();
  }
}

unitRates.register( 'RaceTrack', RaceTrack );