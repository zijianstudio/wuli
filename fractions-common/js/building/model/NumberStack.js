// Copyright 2018-2020, University of Colorado Boulder

/**
 * A stack that holds NumberPieces.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import fractionsCommon from '../../fractionsCommon.js';
import BuildingType from './BuildingType.js';
import Stack from './Stack.js';

class NumberStack extends Stack {
  /**
   * @param {number} number
   * @param {number} layoutQuantity
   * @param {boolean} [isMutable]
   */
  constructor( number, layoutQuantity, isMutable = true ) {
    super( BuildingType.NUMBER, layoutQuantity, isMutable );

    // @public {number}
    this.number = number;

    // @public {ObservableArrayDef.<NumberPiece>} - NOTE: These should only ever be popped/pushed.
    this.numberPieces = this.array;
  }

  /**
   * Returns the desired visual offset of an item in the stack from the base.
   * @public
   *
   * @param {number} index
   * @returns {Vector2}
   */
  static getOffset( index ) {
    return new Vector2( 4 * index, 4 * index );
  }
}

fractionsCommon.register( 'NumberStack', NumberStack );
export default NumberStack;