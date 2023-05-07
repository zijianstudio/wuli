// Copyright 2018-2020, University of Colorado Boulder

/**
 * A stack of ShapeGroups of a particular representation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import fractionsCommon from '../../fractionsCommon.js';
import BuildingRepresentation from './BuildingRepresentation.js';
import BuildingType from './BuildingType.js';
import Stack from './Stack.js';

class ShapeGroupStack extends Stack {
  /**
   * @param {number} layoutQuantity
   * @param {BuildingRepresentation} representation
   * @param {boolean} hasExpansionButtons
   * @param {boolean} [isMutable]
   */
  constructor( layoutQuantity, representation, hasExpansionButtons, isMutable = true ) {
    super( BuildingType.SHAPE, layoutQuantity, isMutable );

    // @public {BuildingRepresentation}
    this.representation = representation;

    // @public {ObservableArrayDef.<ShapeGroup>} - NOTE: These should only ever be popped/pushed.
    this.shapeGroups = this.array;

    // @public {boolean} - Whether the icons will have the + button to add another container.
    this.hasExpansionButtons = hasExpansionButtons;
  }

  /**
   * Returns the desired visual offset of an item in the stack from the base.
   * @public
   *
   * @param {BuildingRepresentation} representation
   * @param {number} index
   * @returns {Vector2}
   */
  static getOffset( representation, index ) {
    assert && assert( _.includes( BuildingRepresentation.VALUES, representation ) );
    assert && assert( typeof index === 'number' );

    return BuildingRepresentation.getOffset( representation, index );
  }
}

fractionsCommon.register( 'ShapeGroupStack', ShapeGroupStack );
export default ShapeGroupStack;