// Copyright 2021-2022, University of Colorado Boulder

/**
 * Gets the QueryStringMachine schema for the gameLevels query parameter.
 * Note that game levels are numbered starting from 1.
 *
 * History:
 * - The `gameLevels` query parameter was first proposed and discussed in https://github.com/phetsims/vegas/issues/86.
 * - The design of the gameLevels query parameter was solidified, and it was first implemented in Equality Explorer,
 *   see https://github.com/phetsims/equality-explorer/issues/165.
 * - When gameLevels was needed in Fourier, the schema was then copied from Fourier to Equality Explorer,
 *   see https://github.com/phetsims/fourier-making-waves/issues/145.
 * - During code review of Number Play in https://github.com/phetsims/number-play/issues/92, yet-another implementation
 *   was discovered. That motivated factoring out this function, to prevent further duplication and inconsistency.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import vegas from './vegas.js';

function getGameLevelsSchema( numberOfLevels: number ) { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types, explicit-method-return-type

  assert && assert( Number.isInteger( numberOfLevels ) && numberOfLevels > 0,
    `numberOfLevels must be a positive integer: ${numberOfLevels}` );

  return {
    public: true,
    type: 'array',

    // each level number in the array
    elementSchema: {
      type: 'number',
      isValidValue: ( value: number ) => ( Number.isInteger( value ) && value > 0 && value <= numberOfLevels )
    },

    // [ 1, 2,...,numberOfLevels]
    defaultValue: Array.from( { length: numberOfLevels }, ( _, i ) => i + 1 ),

    // validation for the array as a whole
    isValidValue: ( array: number[] ) => {
      return ( array === null ) || (
        // at least 1 level must be visible
        array.length > 0 &&
        // unique level numbers
        array.length === _.uniq( array ).length &&
        // sorted by ascending level number
        _.every( array, ( value, index, array ) => ( index === 0 || array[ index - 1 ] <= value ) )
      );
    }
  } as const;
}

vegas.register( 'getGameLevelsSchema', getGameLevelsSchema );
export default getGameLevelsSchema;