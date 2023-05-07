// Copyright 2021-2022, University of Colorado Boulder

/**
 * Logic for determining whether numbers can be added together, and how numbers should be split apart.
 *
 * @author Sharfudeen Ashraf
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import countingCommon from '../../countingCommon.js';
import CountingCommonUtils from '../CountingCommonUtils.js';

class ArithmeticRules {
  /**
   * Whether the two numbers can be added together.
   */
  public static canAddNumbers( a: number, b: number ): boolean {

    // Don't allow carrying "past" the 10s, 100s or 1000s place.
    return ( a % 1000 ) + ( b % 1000 ) <= 1000 &&
           ( a % 100 ) + ( b % 100 ) <= 100 &&
           ( a % 10 ) + ( b % 10 ) <= 10 &&
           ( a <= 10 || b <= 10 || a + b >= 100 || a % 10 === 0 || b % 10 === 0 || ( a + b ) % 10 !== 0 );
  }

  /**
   * Determines how much of a number can be pulled off at a specific place in the number.
   *
   * e.g.:
   * - If our number is 102, and our pulledPlace is 0 (mouse at the 2), it will pull 2 off.
   * - If our number is 102, and our pulledPlace is 2 (mouse at the 1), it will pull 100 off.
   *
   * @param numberValue - Numeric value that could potentially be pulled apart.
   * @param pulledPlace - Index in number where the user dragged. 0 is the 1s place, 1 is the 10s place, 2
   *                 is the 100s place, and 3 is the 1000s place.
   * @returns - How much to remove from numberValue (0 indicates can't be pulled off)
   */
  public static pullApartNumbers( numberValue: number, pulledPlace: number ): number {
    if ( numberValue <= 1 ) {
      return 0;
    }

    // Find the minimum place (0: singles, 1: doubles, etc.) where we can pull off from
    let minimumPlace = 0;
    for ( let i = 1; i < 3; i++ ) {
      const power = Math.pow( 10, i );
      if ( numberValue % power === 0 && numberValue > power ) {
        minimumPlace = i;
      }
    }

    // How many places are on the number?
    const maximumPlace = CountingCommonUtils.digitsInNumber( numberValue ) - 1;

    // Grab the place we'll try to remove from.
    const place = Math.max( minimumPlace, pulledPlace );

    let amountToRemove;
    if ( place === maximumPlace ) {
      amountToRemove = Math.pow( 10, place );
    }
    else {
      amountToRemove = numberValue % Math.pow( 10, place + 1 );
    }
    if ( amountToRemove === 0 ) {
      amountToRemove = Math.pow( 10, place );
    }
    if ( amountToRemove === numberValue ) {
      amountToRemove = Math.pow( 10, place - 1 );
    }

    return amountToRemove;
  }
}

countingCommon.register( 'ArithmeticRules', ArithmeticRules );

export default ArithmeticRules;
