// Copyright 2018-2020, University of Colorado Boulder

/**
 * A stack of number groups (either mixed or non-mixed)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import fractionsCommon from '../../fractionsCommon.js';
import BuildingType from './BuildingType.js';
import Stack from './Stack.js';

class NumberGroupStack extends Stack {
  /**
   * @param {number} layoutQuantity
   * @param {boolean} isMixedNumber
   * @param {boolean} [isMutable]
   */
  constructor( layoutQuantity, isMixedNumber, isMutable = true ) {
    super( BuildingType.NUMBER, layoutQuantity, isMutable );

    // @public {boolean}
    this.isMixedNumber = isMixedNumber;

    // @public {ObservableArrayDef.<NumberGroup>} - NOTE: These should only ever be popped/pushed.
    this.numberGroups = this.array;
  }
}

fractionsCommon.register( 'NumberGroupStack', NumberGroupStack );
export default NumberGroupStack;