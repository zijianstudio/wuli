// Copyright 2018-2020, University of Colorado Boulder

/**
 * View for a NumberStack.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import fractionsCommon from '../../fractionsCommon.js';
import NumberPiece from '../model/NumberPiece.js';
import NumberStack from '../model/NumberStack.js';
import NumberPieceNode from './NumberPieceNode.js';
import StackNode from './StackNode.js';

class NumberStackNode extends StackNode {
  /**
   * @param {NumberStack} numberStack
   * @param {Object} [options]
   */
  constructor( numberStack, options ) {
    assert && assert( numberStack instanceof NumberStack );

    super( numberStack );

    // @public {NumberStack}
    this.numberStack = numberStack;

    // @private {Array.<NumberPieceNode>}
    this.numberPieceNodes = [];

    // @private {function}
    this.numberPieceAddedListener = this.addNumberPiece.bind( this );
    this.numberPieceRemovedListener = this.removeNumberPiece.bind( this );

    this.stack.numberPieces.addItemAddedListener( this.numberPieceAddedListener );
    this.stack.numberPieces.addItemRemovedListener( this.numberPieceRemovedListener );
    this.stack.numberPieces.forEach( this.numberPieceAddedListener );

    // Inform about our available layout bounds
    const bounds = Bounds2.NOTHING.copy();
    const numberPiece = new NumberPiece( this.numberStack.number );
    const numberPieceNode = new NumberPieceNode( numberPiece );
    for ( let i = 0; i < this.numberStack.layoutQuantity; i++ ) {
      numberPieceNode.translation = NumberStack.getOffset( i );
      bounds.includeBounds( numberPieceNode.bounds );
    }
    numberPieceNode.dispose();
    this.layoutBounds = bounds;

    this.mutate( options );
  }

  /**
   * Adds a NumberPiece's view
   * @private
   *
   * @param {NumberPiece} numberPiece
   */
  addNumberPiece( numberPiece ) {
    assert && assert( numberPiece.number === this.numberStack.number );

    const index = this.numberPieceNodes.length;
    const numberPieceNode = new NumberPieceNode( numberPiece, {
      translation: NumberStack.getOffset( index )
    } );
    this.numberPieceNodes.push( numberPieceNode );
    this.addChild( numberPieceNode );
  }

  /**
   * Removes a NumberPiece's view
   * @private
   *
   * @param {NumberPiece} numberPiece
   */
  removeNumberPiece( numberPiece ) {
    const numberPieceNode = _.find( this.numberPieceNodes, numberPieceNode => {
      return numberPieceNode.numberPiece === numberPiece;
    } );
    assert && assert( numberPieceNode );

    arrayRemove( this.numberPieceNodes, numberPieceNode );
    this.removeChild( numberPieceNode );
    numberPieceNode.dispose();
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.numberPieceNodes.forEach( numberPieceNode => numberPieceNode.dispose() );
    this.stack.numberPieces.removeItemAddedListener( this.numberPieceAddedListener );
    this.stack.numberPieces.removeItemRemovedListener( this.numberPieceRemovedListener );

    super.dispose();
  }
}

fractionsCommon.register( 'NumberStackNode', NumberStackNode );
export default NumberStackNode;