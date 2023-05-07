// Copyright 2018-2020, University of Colorado Boulder

/**
 * The cake variant of a piece node.
 *
 * @author Martin Veillette (Berea College)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import fractionsCommon from '../../../fractionsCommon.js';
import PieceNode from '../PieceNode.js';
import CakeNode from './CakeNode.js';

class CakePieceNode extends PieceNode {
  /**
   * @param {Piece} piece
   * @param {function} finishedAnimatingCallback - Called as function( {Piece} ) with the piece to finish animating.
   * @param {function} droppedCallback - Called as function( {Piece} )
   */
  constructor( piece, finishedAnimatingCallback, droppedCallback ) {
    super( piece, finishedAnimatingCallback, droppedCallback, {
      graphic: new CakeNode( piece.denominator, 0, { dropShadow: true } )
    } );

    // cake specific
    const originCell = piece.originCell;
    if ( originCell ) {
      this.graphic.setCakeIndex( originCell.index );
    }
    // cake specific
    const destinationCell = piece.destinationCell;
    if ( destinationCell ) {
      this.graphic.setCakeIndex( destinationCell.index );
    }
  }

  /**
   * Orients the piece to match the closest cell.
   * @public
   * @override
   *
   * @param {Cell} closestCell
   * @param {number} dt
   */
  orient( closestCell, dt ) {
    super.orient( closestCell, dt );

    const midpoint = this.getMidpoint();
    this.graphic.setCakeIndex( closestCell.index );
    this.setMidpoint( midpoint );
  }
}

fractionsCommon.register( 'CakePieceNode', CakePieceNode );
export default CakePieceNode;