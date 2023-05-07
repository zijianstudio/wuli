// Copyright 2018-2020, University of Colorado Boulder

/**
 * Base class for different types of object stacks (usually for pieces and groups) that are placed in panels usually.
 *
 * "mutable" stacks have elements dynamically added/removed, whereas "immutable" ones are not affected by the user.
 *
 * Usually the items in a stack are shown (offset by a certain amount).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import fractionsCommon from '../../fractionsCommon.js';

class Stack {
  /**
   * @param {BuildingType} type
   * @param {number} layoutQuantity
   * @param {boolean} [isMutable]
   */
  constructor( type, layoutQuantity, isMutable = true ) {
    assert && assert( typeof layoutQuantity === 'number' && layoutQuantity >= 1 && layoutQuantity % 1 === 0 );
    assert && assert( typeof isMutable === 'boolean' );

    // @public {BuildingType}
    this.type = type;

    // @public {number}
    this.layoutQuantity = layoutQuantity;

    // @public {boolean}
    this.isMutable = isMutable;

    // @public - Position of our stack in model units (updated from the view)
    this.positionProperty = new Vector2Property( Vector2.ZERO );

    // @public {ObservableArrayDef.<*>}
    this.array = createObservableArray();
  }

  /**
   * Returns whether it is empty.
   * @public
   *
   * @returns {boolean}
   */
  isEmpty() {
    return this.array.length === 0;
  }
}

fractionsCommon.register( 'Stack', Stack );
export default Stack;