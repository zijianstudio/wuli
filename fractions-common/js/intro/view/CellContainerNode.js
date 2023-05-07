// Copyright 2018-2021, University of Colorado Boulder

/**
 * Supertype for container nodes that show and track individual cell nodes (i.e. NOT the beaker container).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { DragListener } from '../../../../scenery/js/imports.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import CellEntry from './CellEntry.js';
import ContainerNode from './ContainerNode.js';

class CellContainerNode extends ContainerNode {
  /**
   * @param {Container} container
   * @param {Object} [options]
   */
  constructor( container, options ) {
    super( container, options );

    // @protected {Array.<CellEntry>}
    this.cellEntries = [];

    // @private {function}
    this.rebuildListener = this.rebuild.bind( this );
    this.container.cells.lengthProperty.lazyLink( this.rebuildListener );

    // @private {Property.<Color>}
    this.strokeProperty = new DerivedProperty( [
      container.filledCellCountProperty,
      FractionsCommonColors.introContainerActiveBorderProperty,
      FractionsCommonColors.introContainerInactiveBorderProperty
    ], ( count, activeColor, inactiveColor ) => {
      return count > 0 ? activeColor : inactiveColor;
    } );
  }

  /**
   * Rebuilds the full container (required when the number of cells changes).
   * @protected
   */
  rebuild() {
    this.removeCellNodes();

    // Subtypes will override the main content
  }

  /**
   * Return the midpoint offset of this node.
   * @public
   * @override
   *
   * @param {number} index
   * @returns {Vector2}
   */
  getMidpointByIndex( index ) {
    const cellEntry = this.cellEntries[ index ];
    if ( cellEntry ) {
      return cellEntry.node.translation;
    }
    else {
      return Vector2.ZERO;
    }
  }

  /**
   * Adds in a cell node, setting up listeners
   * @protected
   *
   * @param {Cell} cell
   * @param {Node} node
   */
  addCellNode( cell, node ) {
    this.cellEntries.push( new CellEntry( cell, node ) );
    this.addChild( node );

    node.cursor = 'pointer';
    node.addInputListener( DragListener.createForwardingListener( event => this.cellDownCallback( cell, event ) ) );
  }

  /**
   * Removes all of the cell nodes, and detaches their listeners.
   * @private
   */
  removeCellNodes() {
    while ( this.cellEntries.length ) {
      const cellEntry = this.cellEntries.pop();
      this.removeChild( cellEntry.node );
      cellEntry.dispose();
    }
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.removeCellNodes();
    this.container.cells.lengthProperty.unlink( this.rebuildListener );
    this.strokeProperty.dispose();

    super.dispose();
  }
}

fractionsCommon.register( 'CellContainerNode', CellContainerNode );
export default CellContainerNode;