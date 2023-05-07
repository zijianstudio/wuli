// Copyright 2018-2021, University of Colorado Boulder

/**
 * View for a ShapeContainer.
 *
 * Its layout should be based around this node being centered (locally) around the proper origin
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import { Node } from '../../../../scenery/js/imports.js';
import fractionsCommon from '../../fractionsCommon.js';
import ShapeContainer from '../model/ShapeContainer.js';
import ShapeLayerNode from './ShapeLayerNode.js';
import ShapePieceNode from './ShapePieceNode.js';

class ShapeContainerNode extends Node {
  /**
   * @param {ShapeContainer} shapeContainer
   * @param {Object} [options]
   */
  constructor( shapeContainer, options ) {
    assert && assert( shapeContainer instanceof ShapeContainer );

    super( {
      translation: shapeContainer.offset
    } );

    // @public {ShapeContainer}
    this.shapeContainer = shapeContainer;

    // @private {Array.<ShapePieceNode>}
    this.shapePieceNodes = [];

    // @private {ShapeLayerNode}
    this.shapeLayerNode = new ShapeLayerNode( shapeContainer.representation, shapeContainer.partitionDenominatorProperty );
    this.addChild( this.shapeLayerNode );

    // @private {Node}
    this.shapePieceLayer = this.shapeLayerNode.shapePieceLayer;

    // @private {function}
    this.shapePieceAddedListener = this.addShapePiece.bind( this );
    this.shapePieceRemovedListener = this.removeShapePiece.bind( this );

    this.shapeContainer.shapePieces.addItemAddedListener( this.shapePieceAddedListener );
    this.shapeContainer.shapePieces.addItemRemovedListener( this.shapePieceRemovedListener );
    this.shapeContainer.shapePieces.forEach( this.shapePieceAddedListener );

    this.mutate( options );
  }

  /**
   * Adds a ShapePiece's view
   * @private
   *
   * @param {ShapePiece} shapePiece
   */
  addShapePiece( shapePiece ) {
    assert && assert( shapePiece.representation === this.shapeContainer.representation );

    const shapePieceNode = new ShapePieceNode( shapePiece );

    const ratio = this.shapeContainer.getShapeRatio( shapePiece );
    shapePieceNode.matrix = ShapeContainer.getShapeMatrix( ratio, shapePiece.fraction, shapePiece.representation );

    this.shapePieceNodes.push( shapePieceNode );
    this.shapePieceLayer.addChild( shapePieceNode );
  }

  /**
   * Removes a ShapePiece's view
   * @private
   *
   * @param {ShapePiece} shapePiece
   */
  removeShapePiece( shapePiece ) {
    const shapePieceNode = _.find( this.shapePieceNodes, shapePieceNode => {
      return shapePieceNode.shapePiece === shapePiece;
    } );
    assert && assert( shapePieceNode );

    arrayRemove( this.shapePieceNodes, shapePieceNode );
    this.shapePieceLayer.removeChild( shapePieceNode );
    shapePieceNode.dispose();
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.shapePieceNodes.forEach( shapePieceNode => shapePieceNode.dispose() );
    this.shapeContainer.shapePieces.removeItemAddedListener( this.shapePieceAddedListener );
    this.shapeContainer.shapePieces.removeItemRemovedListener( this.shapePieceRemovedListener );
    this.shapeLayerNode.dispose();

    super.dispose();
  }
}

fractionsCommon.register( 'ShapeContainerNode', ShapeContainerNode );
export default ShapeContainerNode;