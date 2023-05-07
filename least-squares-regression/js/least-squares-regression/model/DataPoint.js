// Copyright 2014-2021, University of Colorado Boulder

/**
 * Type that defines a data point.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';

class DataPoint {
  /**
   * @param {Vector2} initialPosition
   */
  constructor( initialPosition ) {

    // @public - indicates where in model space the center of this data point is.
    this.positionProperty = new Vector2Property( initialPosition );

    // @public {Property.<boolean>}
    // Flag that tracks whether the user is dragging this data point around. Should be set externally, generally by a
    // view node.
    this.userControlledProperty = new BooleanProperty( false );

    // @public read-only {Property.<boolean>}
    // Flag that indicates whether this element is animating from one position to the bucket.
    this.animatingProperty = new BooleanProperty( false );

    // @public
    this.returnedToOriginEmitter = new Emitter();
  }

  /**
   *  resets all the properties of DataPoint
   *  @public
   */
  reset() {
    this.positionProperty.reset();
    this.userControlledProperty.reset();
    this.animatingProperty.reset();
  }

  /**
   * Function that animates dataPoint back to the bucket.
   * @public
   */
  animate() {
    this.animatingProperty.set( true );

    const position = {
      x: this.positionProperty.value.x,
      y: this.positionProperty.value.y
    };

    // distance from the dataPoint current position to its initial position (in the bucket)
    const distance = this.positionProperty.initialValue.distance( this.positionProperty.value );

    if ( distance > 0 ) {
      const animationTween = new TWEEN.Tween( position ).to( {
        x: this.positionProperty.initialValue.x,
        y: this.positionProperty.initialValue.y
      }, distance / LeastSquaresRegressionConstants.ANIMATION_SPEED ).easing( TWEEN.Easing.Cubic.In ).onUpdate( () => {
        this.positionProperty.set( new Vector2( position.x, position.y ) );
      } ).onComplete( () => {
        this.animatingProperty.set( false );
        this.returnedToOriginEmitter.emit();
      } );

      animationTween.start( phet.joist.elapsedTime );
    }
    else {
      // returned dataPoint to bucket when the distance is zero
      // no need for animation
      // see https://github.com/phetsims/least-squares-regression/issues/69
      this.animatingProperty.set( false );
      this.returnedToOriginEmitter.emit();
    }
  }
}

leastSquaresRegression.register( 'DataPoint', DataPoint );

export default DataPoint;
