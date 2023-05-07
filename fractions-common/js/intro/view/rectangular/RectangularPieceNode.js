// Copyright 2018-2020, University of Colorado Boulder

/**
 * The rectangular variant of a piece node.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../../phet-core/js/merge.js';
import fractionsCommon from '../../../fractionsCommon.js';
import PieceNode from '../PieceNode.js';
import RectangularNode from './RectangularNode.js';

class RectangularPieceNode extends PieceNode {
  /**
   * @param {Piece} piece
   * @param {function} finishedAnimatingCallback - Called as function( {Piece} ) with the piece to finish animating.
   * @param {function} droppedCallback - Called as function( {Piece} )
   * @param {Object} [options]
   */
  constructor( piece, finishedAnimatingCallback, droppedCallback, options ) {
    super( piece, finishedAnimatingCallback, droppedCallback, {
      graphic: new RectangularNode( piece.denominator, merge( {
        dropShadow: true
      }, options ) )
    } );

    this.mutate( options );
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.interruptSubtreeInput();

    super.dispose();
  }
}

fractionsCommon.register( 'RectangularPieceNode', RectangularPieceNode );
export default RectangularPieceNode;