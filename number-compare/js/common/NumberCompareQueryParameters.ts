// Copyright 2023, University of Colorado Boulder

import numberCompare from '../numberCompare.js';
import NumberCompareConstants from './NumberCompareConstants.js';

/**
 * NumberCompareQueryParameters defines query parameters that are specific to this simulation.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

const NumberCompareQueryParameters = QueryStringMachine.getAll( {

  // the highest number that the 'Compare' screen can count to. Must be an integer between 1 and 20.
  compareMax: {
    public: true,
    type: 'number',
    defaultValue: NumberCompareConstants.COMPARE_MAX_DEFAULT,
    isValidValue: ( number: number ) => Number.isInteger( number ) &&
                                        number > 0 &&
                                        number <= NumberCompareConstants.COMPARE_MAX_DEFAULT
  }
} );

numberCompare.register( 'NumberCompareQueryParameters', NumberCompareQueryParameters );
export default NumberCompareQueryParameters;