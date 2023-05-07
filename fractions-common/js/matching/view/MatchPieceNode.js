// Copyright 2019-2022, University of Colorado Boulder

/**
 * View for a MatchPiece (either a shape or fractional representation)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import MixedFractionNode from '../../../../scenery-phet/js/MixedFractionNode.js';
import { DragListener, HBox, Node } from '../../../../scenery/js/imports.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import fractionsCommon from '../../fractionsCommon.js';
import FilledPartitionNode from '../../game/view/FilledPartitionNode.js';

class MatchPieceNode extends Node {
  /**
   * @param {MatchPiece} piece
   */
  constructor( piece ) {
    super( {
      cursor: 'pointer'
    } );

    // @private {MatchPiece}
    this.piece = piece;

    if ( piece.filledPartitions ) {
      this.addChild( new HBox( {
        spacing: 7,
        children: piece.filledPartitions.map( filledPartition => new FilledPartitionNode( filledPartition, {
          borderLineWidth: FractionsCommonConstants.MATCHING_BORDER
        } ) ),
        center: Vector2.ZERO,
        scale: piece.hasGreaterThanOne ? 0.68 : 1
      } ) );
    }
    else {
      const isInteger = piece.fraction.isInteger();
      const numberOptions = ( piece.hasMixedNumbers && Fraction.ONE.isLessThan( piece.fraction ) ) ? {
        whole: Math.floor( piece.fraction.value ),
        numerator: isInteger ? null : ( piece.fraction.numerator % piece.fraction.denominator ),
        denominator: isInteger ? null : piece.fraction.denominator
      } : {
        numerator: piece.fraction.numerator,
        denominator: piece.fraction.denominator
      };
      this.addChild( new MixedFractionNode( merge( numberOptions, {
        center: Vector2.ZERO,
        scale: 1.3
      } ) ) );
    }

    // @private {function}
    this.positionListener = position => {
      this.translation = position;
    };
    this.scaleListener = scale => {
      this.setScaleMagnitude( scale );
    };

    this.piece.positionProperty.link( this.positionListener );
    this.piece.scaleProperty.link( this.scaleListener );

    // @private {function}
    this.spotListener = spot => {
      if ( spot && spot.isTarget ) {
        this.pickable = false;
      }
    };

    this.piece.spotProperty.link( this.spotListener );

    this.mouseArea = this.touchArea = new Bounds2(
      -MatchPieceNode.DIMENSION.width / 2,
      -MatchPieceNode.DIMENSION.height / 2,
      MatchPieceNode.DIMENSION.width / 2,
      MatchPieceNode.DIMENSION.height / 2
    );

    // @private {DragListener}
    this.dragListener = new DragListener( {
      targetNode: this,
      positionProperty: piece.positionProperty,
      start: () => {
        this.moveToFront();
        piece.grab();
      },
      end: () => piece.drop()
    } );
    this.addInputListener( this.dragListener );

    // Notify the model about the view's bounds, so that the model can correctly position animations
    this.piece.localBounds = this.localBounds;
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.piece.positionProperty.unlink( this.positionListener );
    this.piece.scaleProperty.unlink( this.scaleListener );
    this.piece.spotProperty.unlink( this.spotListener );

    this.dragListener.dispose();

    super.dispose();
  }
}

// @public {Dimension2}
MatchPieceNode.DIMENSION = new Dimension2( 150, 120 );

fractionsCommon.register( 'MatchPieceNode', MatchPieceNode );
export default MatchPieceNode;