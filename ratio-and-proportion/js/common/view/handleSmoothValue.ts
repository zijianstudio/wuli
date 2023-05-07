// Copyright 2022, University of Colorado Boulder

/**
 * Convenience function to update a historical list of values with a new value, and then determine the smoothed value
 * given the updated list.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ratioAndProportion from '../../ratioAndProportion.js';

/**
 * Smooth a value given historical data and a new value. Also ensures that the history doesn't get too long.
 */
export default function handleSmoothValue<T>( newValue: T, historyArray: T[], maxSizeOfArray: number, smoothValues: ( historyArray: T[] ) => T ): T {

  historyArray.push( newValue );
  while ( historyArray.length > maxSizeOfArray ) {
    historyArray.shift();
  }

  return smoothValues( historyArray );
}

ratioAndProportion.register( 'handleSmoothValue', handleSmoothValue );
