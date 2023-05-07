// Copyright 2017-2023, University of Colorado Boulder

/**
 * ValuePool takes sets of values, separates them into "required" and "optional" sets,
 * and provides an API for randomly selecting values from either set.
 * Used in the game to create sets of slopes, y-intercepts and points for challenges.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import graphingLines from '../../graphingLines.js';

export default class ValuePool<T> {

  private readonly requiredValues: T[];
  private readonly optionalValues: T[];

  /**
   * @param arrays - the sets of values
   */
  public constructor( arrays: T[][] ) {

    // 1 value from each array is "required"
    this.requiredValues = [];
    arrays.forEach( array => {
      this.requiredValues.push( ValuePool.choose( array ) );
    } );

    // the remaining values are optional
    this.optionalValues = arrays.flat();
  }

  /**
   * Randomly selects a required value, and removes it from the set of required values.
   */
  public chooseRequired(): T {
    assert && assert( this.requiredValues.length > 0, 'required values is empty' );
    return ValuePool.choose( this.requiredValues );
  }

  /**
   * Randomly selects an optional value, and removes it from the set of optional values.
   */
  public chooseOptional(): T {
    assert && assert( this.optionalValues.length > 0, 'optional values is empty' );
    return ValuePool.choose( this.optionalValues );
  }

  /**
   * Is the required pool empty?
   */
  public isEmpty(): boolean {
    return ( this.requiredValues.length === 0 );
  }

  /**
   * Randomly chooses an item from an array, and removes the item from the array.
   */
  public static choose<T>( array: T[] ): T {
    assert && assert( array && array.length > 0, 'array is empty' );
    const index = dotRandom.nextIntBetween( 0, array.length - 1 );
    assert && assert( index !== -1 );
    const item = array[ index ];
    array.splice( index, 1 );
    return item;
  }

  /**
   * Converts an integer range to an ordered array of integer values that are in that range.
   */
  public static rangeToArray( range: Range, excludeZero = false ): number[] {

    assert && assert( Number.isInteger( range.min ) && Number.isInteger( range.max ) );

    const array = [];
    for ( let i = range.min; i <= range.max; i++ ) {
      if ( !excludeZero || i !== 0 ) {
        array.push( i );
      }
    }
    return array;
  }
}

graphingLines.register( 'ValuePool', ValuePool );