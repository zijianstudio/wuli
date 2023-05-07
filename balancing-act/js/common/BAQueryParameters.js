// Copyright 2020-2021, University of Colorado Boulder

/**
 * Query parameters for Balancing Act
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import balancingAct from '../balancingAct.js';

const BAQueryParameters = QueryStringMachine.getAll( {

  // whether the Stanford University customizations are enabled
  stanford: { type: 'flag' }
} );

balancingAct.register( 'BAQueryParameters', BAQueryParameters );
export default BAQueryParameters;