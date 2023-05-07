// Copyright 2018-2022, University of Colorado Boulder

/**
 * View for a ShapePiece.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Circle, DragListener, Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import BuildingRepresentation from '../model/BuildingRepresentation.js';
import ShapePiece from '../model/ShapePiece.js';

// constants
const CIRCLE_RADIUS = FractionsCommonConstants.SHAPE_SIZE / 2;
const BAR_WIDTH = FractionsCommonConstants.SHAPE_SIZE;
const BAR_HEIGHT = FractionsCommonConstants.SHAPE_VERTICAL_BAR_HEIGHT;
const SHADOW_VECTOR = new Vector2( 4, 4 );

class ShapePieceNode extends Node {
  /**
   * @param {ShapePiece} shapePiece
   * @param {Object} [options]
   */
  constructor( shapePiece, options ) {
    assert && assert( shapePiece instanceof ShapePiece );

    options = merge( {
      // {function|null} - Called when it is dropped, with a single argument of whether it was from a touch.
      dropListener: null,

      // {boolean} - For pieces placed in stacks/containers, we don't care about the positionProperty. In addition,
      // pieces in stacks/containers ALSO care about not showing up when the piece is user-controlled or animating.
      positioned: false,

      // {ModelViewTransform2|null} - If positioned, a model-view-transform should be provided.
      modelViewTransform: null
    }, options );

    super();

    // @public {ShapePiece}
    this.shapePiece = shapePiece;

    // @private {boolean}
    this.positioned = options.positioned;

    // @private {ModelViewTransform2|null}
    this.modelViewTransform = options.modelViewTransform;

    assert && assert( !this.positioned || this.modelViewTransform, 'Positioned ShapePieceNodes need a MVT' );

    const fractionValue = shapePiece.fraction.value;
    assert && assert( fractionValue <= 1 );

    // @private {Node|null}
    this.viewNode = null;
    this.shadowNode = null;

    const nodeOptions = {
      fill: shapePiece.color,
      stroke: FractionsCommonColors.shapePieceStrokeProperty
    };
    const shadowOptions = {
      fill: FractionsCommonColors.shapeShadowProperty
    };
    if ( shapePiece.representation === BuildingRepresentation.PIE ) {
      if ( fractionValue === 1 ) {
        this.viewNode = new Circle( CIRCLE_RADIUS, nodeOptions );
        this.shadowNode = new Circle( CIRCLE_RADIUS, shadowOptions );
      }
      else {
        const translation = ShapePiece.getSweptCentroid( shapePiece.fraction ).negated();
        const sliceShape = new Shape().moveTo( translation.x, translation.y )
          .lineTo( CIRCLE_RADIUS + translation.x, translation.y )
          .arc( translation.x, translation.y, CIRCLE_RADIUS, 0, -fractionValue * 2 * Math.PI, true )
          .close();
        this.viewNode = new Path( sliceShape, nodeOptions );
        this.shadowNode = new Path( sliceShape, shadowOptions );
      }
    }
    else if ( shapePiece.representation === BuildingRepresentation.BAR ) {
      const width = fractionValue * BAR_WIDTH;
      this.viewNode = new Rectangle( -width / 2, -BAR_HEIGHT / 2, width, BAR_HEIGHT, nodeOptions );
      this.shadowNode = new Rectangle( -width / 2, -BAR_HEIGHT / 2, width, BAR_HEIGHT, shadowOptions );
    }
    else {
      throw new Error( `Unsupported representation for ShapePieceNode: ${shapePiece.representation}` );
    }
    if ( this.positioned ) {
      // @private {Node}
      this.shadowContainer = new Node();
      this.shadowContainer.addChild( this.shadowNode );
      this.addChild( this.shadowContainer );
    }
    this.addChild( this.viewNode );

    // @private {function}
    this.positionListener = this.updatePosition.bind( this );
    this.scaleListener = this.updateScale.bind( this );
    this.rotationListener = this.updateRotation.bind( this );
    this.animatingListener = this.updateAnimating.bind( this );
    this.shadowListener = this.updateShadow.bind( this );
    if ( this.positioned ) {
      this.shapePiece.positionProperty.link( this.positionListener );
      this.shapePiece.scaleProperty.link( this.scaleListener );
      this.shapePiece.rotationProperty.link( this.rotationListener );
      this.shapePiece.isAnimatingProperty.link( this.animatingListener );
      this.shapePiece.shadowProperty.link( this.shadowListener );
    }

    // @private {function}
    this.visibilityListener = Multilink.multilink( [
      shapePiece.isUserControlledProperty,
      shapePiece.isAnimatingProperty
    ], ( isUserControlled, isAnimating ) => {
      if ( !this.positioned ) {
        this.visible = !isUserControlled && !isAnimating;
      }
    } );

    let wasTouch = false;

    // @public {DragListener}
    this.dragListener = new DragListener( {
      targetNode: this,
      transform: options.modelViewTransform,
      positionProperty: shapePiece.positionProperty,
      start: event => {
        wasTouch = event.pointer.isTouchLike();
      },
      end: () => {
        options.dropListener && options.dropListener( wasTouch );
      }
    } );

    // No need to unlink, as we own the given Property (same lifetime, and we own the listener)
    this.dragListener.isUserControlledProperty.link( controlled => {
      shapePiece.isUserControlledProperty.value = controlled;
    } );

    this.mutate( options );
  }

  /**
   * Updates the position of this node to correspond to the model position.
   * @public
   */
  updatePosition() {
    this.translation = this.modelViewTransform.modelToViewPosition( this.shapePiece.positionProperty.value );
  }

  /**
   * Updates the rotation of this node to correspond to the model rotation.
   * @public
   */
  updateRotation() {
    this.viewNode.rotation = this.shapePiece.rotationProperty.value;
    if ( this.positioned ) {
      this.shadowNode.rotation = this.shapePiece.rotationProperty.value;
    }
  }

  /**
   * Updates the scale of this node to correspond to the model scale.
   * @public
   */
  updateScale() {
    this.setScaleMagnitude( this.shapePiece.scaleProperty.value );
  }

  /**
   * Updates whether the shadow is visible or not
   * @public
   */
  updateShadow() {
    this.shadowContainer.translation = SHADOW_VECTOR.timesScalar( this.shapePiece.shadowProperty.value );
  }

  /**
   * Handles animation changes.
   * @public
   */
  updateAnimating() {
    if ( this.shapePiece.isAnimatingProperty.value ) {
      this.moveToBack();
      this.pickable = false;
    }
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    // Required disposal, since we are passing the isUserControlledProperty
    this.dragListener.dispose();
    this.visibilityListener.dispose();

    if ( this.positioned ) {
      this.shapePiece.positionProperty.unlink( this.positionListener );
      this.shapePiece.scaleProperty.unlink( this.scaleListener );
      this.shapePiece.rotationProperty.unlink( this.rotationListener );
      this.shapePiece.isAnimatingProperty.unlink( this.animatingListener );
      this.shapePiece.shadowProperty.unlink( this.shadowListener );
    }

    super.dispose();
  }
}

fractionsCommon.register( 'ShapePieceNode', ShapePieceNode );
export default ShapePieceNode;