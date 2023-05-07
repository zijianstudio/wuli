// Copyright 2019-2023, University of Colorado Boulder

/**
 * A specific place a piece can be "stored" (either a target, a scale, or a source spot near the bottom).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import fractionsCommon from '../../fractionsCommon.js';

class MatchSpot {
  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      scale: 1,
      isTarget: false,
      isScale: false
    }, options );

    // @public - To be updated by the view when its position changes (usually just initially)
    this.positionProperty = new Vector2Property( Vector2.ZERO, {
      valueComparisonStrategy: 'equalsFunction'
    } );

    // @public {number} - How piece nodes should be scaled when placed in this spot
    this.scale = options.scale;

    // @public {boolean}
    this.isTarget = options.isTarget;
    this.isScale = options.isScale;

    // @public {Property.<MatchingPiece|null>}
    this.pieceProperty = new Property( null );

    // If we move, our piece should move (if we have one)
    this.positionProperty.lazyLink( position => {
      if ( this.pieceProperty.value && !options.isScale ) {
        this.pieceProperty.value.positionProperty.value = position;
      }
    } );
  }

  /**
   * Attaches the given piece to this spot.
   * @public
   *
   * @param {MatchPiece} piece
   */
  attachPiece( piece ) {
    this.pieceProperty.value = piece;
    piece.spotProperty.value = this;
  }

  /**
   * Detaches the given piece from this spot.
   * @public
   *
   * @param {MatchPiece} piece
   */
  detachPiece( piece ) {
    this.pieceProperty.value = null;
    piece.spotProperty.value = null;
  }
}

fractionsCommon.register( 'MatchSpot', MatchSpot );
export default MatchSpot;
