// Copyright 2016-2020, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import makeATen from '../../makeATen.js';

const MakeATenQueryParameters = QueryStringMachine.getAll( {

  // Initializes the Explore screen with specific numbers, spaced horizontally,
  // e.g. ?exploreNumbers=10,51, where 0 indicates none.
  exploreNumbers: {
    type: 'array',
    elementSchema: {
      type: 'number'
    },
    defaultValue: [ 10 ]
  }
} );

makeATen.register( 'MakeATenQueryParameters', MakeATenQueryParameters );

export default MakeATenQueryParameters;