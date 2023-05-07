// Copyright 2018-2022, University of Colorado Boulder

/**
 * Base type for displaying a piece.
 *
 * NOTE: The graphics of a piece are set up so that its logical "center" (that it may rotate around or corresponds to
 * its best "drag" position) will be at its origin.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import required from '../../../../phet-core/js/required.js';
import { DragListener, Node } from '../../../../scenery/js/imports.js';
import Easing from '../../../../twixt/js/Easing.js';
import fractionsCommon from '../../fractionsCommon.js';

class PieceNode extends Node {
  /**
   * @param {Piece} piece
   * @param {function} finishedAnimatingCallback - Called as function( {Piece} ) with the piece to finish animating.
   * @param {function} droppedCallback - Called as function( {Piece} )
   * @param {Object} config
   */
  constructor( piece, finishedAnimatingCallback, droppedCallback, config ) {
    config = merge( {
      // {Node}
      graphic: required( config.graphic )
    }, config );

    super( {
      children: [ config.graphic ]
    } );

    // @public {Piece} - Accessed from elsewhere
    this.piece = piece;

    // @protected {Node}
    this.graphic = config.graphic;

    // @private {function}
    this.finishedAnimatingCallback = finishedAnimatingCallback;

    // @public
    this.originProperty = new Vector2Property( Vector2.ZERO );
    this.destinationProperty = new Vector2Property( Vector2.ZERO );

    // @public <boolean>
    this.isUserControlled = false;

    // @protected {number} - Animation progress, from 0 to 1.
    this.ratio = 0;

    // Does not need to be unlinked, since we own the Property.
    this.originProperty.lazyLink( origin => {
      this.ratio = 0;
      piece.positionProperty.value = origin;
      this.setMidpoint( origin );

      // circle specific
      if ( this.graphic.getCircleRotation ) {
        // @protected {number}
        this.originRotation = this.graphic.getCircleRotation();
      }
    } );
    this.destinationProperty.lazyLink( () => {
      this.ratio = 0;
    } );

    // @private {function}
    this.positionListener = position => this.setMidpoint( position );
    this.piece.positionProperty.link( this.positionListener );

    // @public {DragListener}
    this.dragListener = new DragListener( {
      targetNode: this,
      positionProperty: piece.positionProperty,
      end: () => droppedCallback( piece )
    } );
  }

  /**
   * Returns the midpoint of the piece (in the parent's coordinate bounds).
   * @public
   *
   * @returns {Vector2}
   */
  getMidpoint() {
    return this.localToParentPoint( Vector2.ZERO );
  }

  /**
   * Translates the piece by moving its midpoint.
   * @protected
   *
   * @param {Vector2} midpoint
   */
  setMidpoint( midpoint ) {
    this.translation = this.translation.plus( midpoint.minus( this.getMidpoint() ) );
  }

  /**
   * Handles operations in step() before midpoint is set.
   * @protected
   */
  beforeMidpointSet() {
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    if ( this.isUserControlled ) {
      return;
    }

    // Smaller animations are somewhat faster
    const distance = Math.sqrt( this.originProperty.value.distance( this.destinationProperty.value ) );
    this.ratio = distance === 0 ? 1 : Math.min( 1, this.ratio + dt * 60 / distance );
    if ( this.ratio === 1 ) {
      this.finishedAnimatingCallback( this );
    }
    else {
      this.beforeMidpointSet();

      const easedRatio = Easing.QUADRATIC_IN_OUT.value( this.ratio );
      this.setMidpoint( this.originProperty.value.blend( this.destinationProperty.value, easedRatio ) );
    }
  }

  /**
   * Orients the piece to match the closest cell.
   * @public
   *
   * @param {Cell} closestCell
   * @param {number} dt
   */
  orient( closestCell, dt ) {
    // extra behavior added in subclasses
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.piece.positionProperty.unlink( this.positionListener );
    this.interruptSubtreeInput();
    this.dragListener.dispose();

    super.dispose();
  }
}

fractionsCommon.register( 'PieceNode', PieceNode );
export default PieceNode;
