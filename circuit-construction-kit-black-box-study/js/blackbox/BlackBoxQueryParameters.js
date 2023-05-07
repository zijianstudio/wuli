// Copyright 2017-2021, University of Colorado Boulder

/**
 * Query parameters used in sim-specific code.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitBlackBoxStudy from '../circuitConstructionKitBlackBoxStudy.js';

const BlackBoxQueryParameters = QueryStringMachine.getAll( {

  // Determines whether the black box reveal buttons will be shown.
  showRevealButton: { type: 'boolean', defaultValue: true }
} );

circuitConstructionKitBlackBoxStudy.register( 'BlackBoxQueryParameters', BlackBoxQueryParameters );

export default BlackBoxQueryParameters;