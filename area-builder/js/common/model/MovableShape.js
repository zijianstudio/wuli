// Copyright 2014-2023, University of Colorado Boulder

/**
 * Type that defines a shape that can be moved by the user and placed on the shape placement boards.
 *
 * @author John Blanco
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Color } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../AreaBuilderSharedConstants.js';

// constants
const FADE_RATE = 2; // proportion per second

class MovableShape {

  /**
   * @param {Shape} shape
   * @param {Color || string} color
   * @param {Vector2} initialPosition
   */
  constructor( shape, color, initialPosition ) {

    // Property that indicates where in model space the upper left corner of this shape is.  In general, this should
    // not be set directly outside of this type, and should only be manipulated through the methods defined below.
    this.positionProperty = new Property( initialPosition );

    // Flag that tracks whether the user is dragging this shape around.  Should be set externally ; generally by the a
    // view node.
    this.userControlledProperty = new Property( false );

    // Flag that indicates whether this element is animating from one position to another ; should not be set externally.
    this.animatingProperty = new Property( false, {
      reentrant: true,
      hasListenerOrderDependencies: true // TODO: https://github.com/phetsims/area-builder/issues/124
    } );

    // Value that indicates how faded out this shape is.  This is used as part of a feature where shapes can fade
    // out.  Once fade has started ; it doesn't stop until it is fully faded ; i.e. the value is 1.  This should not be
    // set externally.
    this.fadeProportionProperty = new Property( 0, { hasListenerOrderDependencies: true } ); // TODO: https://github.com/phetsims/area-builder/issues/124

    // A flag that indicates whether this individual shape should become invisible when it is done animating.  This
    // is generally used in cases where it becomes part of a larger composite shape that is depicted instead.
    this.invisibleWhenStillProperty = new Property( true );

    // Destination is used for animation, and should be set through accessor methods only.
    this.destination = initialPosition.copy(); // @private

    // Emit an event whenever this shape returns to its original position.
    this.returnedToOriginEmitter = new Emitter();
    this.positionProperty.lazyLink( position => {
      if ( position.equals( initialPosition ) ) {
        this.returnedToOriginEmitter.emit();
      }
    } );

    // Non-dynamic attributes
    this.shape = shape; // @public, read only
    this.color = Color.toColor( color ); // @public

    // Internal vars
    this.fading = false; // @private
  }

  /**
   * @param {number} dt
   * @public
   */
  step( dt ) {
    if ( !this.userControlledProperty.get() ) {

      // Perform any animation.
      const currentPosition = this.positionProperty.get();
      const distanceToDestination = currentPosition.distance( this.destination );
      if ( distanceToDestination > dt * AreaBuilderSharedConstants.ANIMATION_SPEED ) {

        // Move a step toward the destination.
        const stepAngle = Math.atan2( this.destination.y - currentPosition.y, this.destination.x - currentPosition.x );
        const stepVector = Vector2.createPolar( AreaBuilderSharedConstants.ANIMATION_SPEED * dt, stepAngle );
        this.positionProperty.set( currentPosition.plus( stepVector ) );
      }
      else if ( this.animatingProperty.get() ) {

        // Less than one time step away, so just go to the destination.
        this.positionProperty.set( this.destination );
        this.animatingProperty.set( false );
      }

      // Perform any fading.
      if ( this.fading ) {
        this.fadeProportionProperty.set( Math.min( 1, this.fadeProportionProperty.get() + ( dt * FADE_RATE ) ) );
        if ( this.fadeProportionProperty.get() >= 1 ) {
          this.fading = false;
        }
      }
    }
  }

  /**
   * Set the destination for this shape.
   * @param {Vector2} destination
   * @param {boolean} animate
   * @public
   */
  setDestination( destination, animate ) {
    this.destination = destination;
    if ( animate ) {
      this.animatingProperty.set( true );
    }
    else {
      this.animatingProperty.set( false );
      this.positionProperty.set( this.destination );
    }
  }

  /**
   * Return the shape to the place where it was originally created.
   * @param {boolean} animate
   * @public
   */
  returnToOrigin( animate ) {
    this.setDestination( this.positionProperty.initialValue, animate );
  }

  /**
   * @public
   */
  fadeAway() {
    this.fading = true;
    this.fadeProportionProperty.set( 0.0001 ); // this is done to make sure the shape is made unpickable as soon as fading starts
  }

  /**
   * Returns a set of squares that are of the specified size and are positioned correctly such that they collectively
   * make up the same shape as this rectangle.  The specified length must be an integer value of the length and
   * width or things will get weird.
   *
   * NOTE: This only works properly for rectangular shapes!
   *
   * @param squareLength
   * @public
   */
  decomposeIntoSquares( squareLength ) {
    assert && assert( this.shape.bounds.width % squareLength === 0 && this.shape.bounds.height % squareLength === 0,
      'Error: A dimension of this movable shape is not an integer multiple of the provided dimension' );
    const shapes = [];
    const unitSquareShape = Shape.rect( 0, 0, squareLength, squareLength );
    for ( let column = 0; column < this.shape.bounds.width; column += squareLength ) {
      for ( let row = 0; row < this.shape.bounds.height; row += squareLength ) {
        const constituentShape = new MovableShape( unitSquareShape, this.color, this.positionProperty.initialValue );
        constituentShape.setDestination( this.positionProperty.get().plusXY( column, row ), false );
        constituentShape.invisibleWhenStillProperty.set( this.invisibleWhenStillProperty.get() );
        shapes.push( constituentShape );
      }
    }
    return shapes;
  }
}

areaBuilder.register( 'MovableShape', MovableShape );
export default MovableShape;