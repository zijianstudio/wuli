// Copyright 2018-2021, University of Colorado Boulder

/**
 * View for a ShapeGroupStack.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import EnumerationMap from '../../../../phet-core/js/EnumerationMap.js';
import { Node } from '../../../../scenery/js/imports.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import fractionsCommon from '../../fractionsCommon.js';
import BuildingRepresentation from '../model/BuildingRepresentation.js';
import ShapeGroupStack from '../model/ShapeGroupStack.js';
import ShapeGroupNode from './ShapeGroupNode.js';
import StackNode from './StackNode.js';

// constants
const iconMap = {};
[ false, true ].forEach( hasExpansionButtons => {
  iconMap[ hasExpansionButtons ] = new EnumerationMap( BuildingRepresentation, representation => ShapeGroupNode.createIcon( representation, hasExpansionButtons ) );
} );

class ShapeGroupStackNode extends StackNode {
  /**
   * @param {ShapeStackGroup} shapeGroupStack
   * @param {Object} [options]
   */
  constructor( shapeGroupStack, options ) {
    super( shapeGroupStack );

    // @private {BuildingRepresentation}
    this.representation = shapeGroupStack.representation;

    // @private {Node}
    this.icon = iconMap[ shapeGroupStack.hasExpansionButtons ].get( shapeGroupStack.representation );

    // @private {function}
    this.shapeGroupAddedListener = this.addShapeGroup.bind( this );
    this.shapeGroupRemovedListener = this.removeShapeGroup.bind( this );

    this.stack.shapeGroups.addItemAddedListener( this.shapeGroupAddedListener );
    this.stack.shapeGroups.addItemRemovedListener( this.shapeGroupRemovedListener );
    this.stack.shapeGroups.forEach( this.shapeGroupAddedListener );

    // Inform about our available layout bounds
    const bounds = Bounds2.NOTHING.copy();
    const iconBounds = this.icon.bounds;
    for ( let i = 0; i < this.stack.layoutQuantity; i++ ) {
      const offset = ShapeGroupStack.getOffset( this.representation, i );
      bounds.includeBounds( iconBounds.shiftedXY( offset.x, offset.y ) );
    }
    this.layoutBounds = bounds;

    this.mutate( options );
  }

  /**
   * Adds a ShapePiece's view
   * @private
   *
   * @param {ShapePiece} shapeGroup
   */
  addShapeGroup( shapeGroup ) {
    const numOffsets = FractionsCommonConstants.SHAPE_BUILD_SCALE * this.children.length;

    this.addChild( new Node( {
      children: [ this.icon ],
      translation: ShapeGroupStack.getOffset( this.representation, numOffsets )
    } ) );
  }

  /**
   * Removes a ShapePiece's view
   * @private
   *
   * @param {ShapePiece} shapeGroup
   */
  removeShapeGroup( shapeGroup ) {
    const child = this.children[ this.children.length - 1 ];
    this.removeChild( child );

    // Since we add in the icon, we need to dispose the child to release the reference to the icon.
    child.dispose();
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    // Dispose all of the child nodes, so that they won't have the icon as a child anymore (which would leak memory).
    this.children.forEach( child => child.dispose() );

    this.stack.shapeGroups.removeItemAddedListener( this.shapeGroupAddedListener );
    this.stack.shapeGroups.removeItemRemovedListener( this.shapeGroupRemovedListener );

    super.dispose();
  }
}

fractionsCommon.register( 'ShapeGroupStackNode', ShapeGroupStackNode );
export default ShapeGroupStackNode;