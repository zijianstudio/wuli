// Copyright 2018-2020, University of Colorado Boulder

/**
 * Provides a wrapper for handling animation logic for an assorted number of different properties.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import Easing from '../../../../twixt/js/Easing.js';
import fractionsCommon from '../../fractionsCommon.js';

class Animator {
  /**
   * @param {Object} config
   */
  constructor( config ) {
    config = merge( {

      // {Property.<Vector2>}
      positionProperty: null,

      // {Property.<boolean>}
      isAnimatingProperty: null,

      // {Property.<number>|null}
      rotationProperty: null,
      scaleProperty: null,
      shadowProperty: null
    }, config );

    assert && assert( config.positionProperty instanceof Property );
    assert && assert( config.isAnimatingProperty instanceof Property );

    // @private {Property.<Vector2>} - The position of the element
    this.positionProperty = config.positionProperty;

    // @private {Property.<number>|null} - The rotation of the element (will interpolate to closest rotation)
    this.rotationProperty = config.rotationProperty;

    // @private {Property.<number>|null} - The scale of the element
    this.scaleProperty = config.scaleProperty;

    // @private {Property.<number>|null} - The shadow "offset" ratio, from 0 (shadow directly under) to 1 (shadow
    // at full offset)
    this.shadowProperty = config.shadowProperty;

    // @private {Property.<boolean>} - Whether the element is being animated
    this.isAnimatingProperty = config.isAnimatingProperty;

    // @private {Property.<Vector2>|null} - If non-null, changes to this Property will end the animation
    this.animationInvalidationProperty = null;

    // @private {function}
    this.endAnimationListener = this.endAnimation.bind( this );

    // @private {number} - Ratio of the animation, from 0 (the start) to 1 (the end)
    this.ratio = 0;

    // @private {number}
    this.animationSpeed = 0;

    // @private {Vector2|null}
    this.originPosition = null;
    this.destinationPosition = null;

    // @private {number|null}
    this.originRotation = null;
    this.destinationRotation = null;

    // @private {number|null}
    this.originScale = null;
    this.destinationScale = null;

    // @private {number|null}
    this.originShadow = null;
    this.destinationShadow = null;

    // @private {function|null}
    this.endAnimationCallback = null;

    // @private {Easing|null}
    this.easing = null;
  }

  /**
   * Animates to the defined set of values.
   * @public
   *
   * @param {Object} config
   */
  animateTo( config ) {
    config = merge( {

      // {Vector2}
      position: null,

      // {number|null}
      rotation: null,
      scale: null,
      shadow: null,

      // {Property.<*>|null}
      animationInvalidationProperty: null,

      // {Easing}
      easing: Easing.QUADRATIC_IN,

      // {number}
      velocity: 40,

      // {function|null} - Called with no arguments
      endAnimationCallback: null
    }, config );

    if ( this.isAnimatingProperty.value ) {
      this.endAnimation();
    }

    this.isAnimatingProperty.value = true;
    this.ratio = 0;

    if ( this.positionProperty ) {
      this.originPosition = this.positionProperty.value;
      this.destinationPosition = config.position;
    }

    if ( this.rotationProperty ) {
      this.originRotation = this.rotationProperty.value;
      this.destinationRotation = config.rotation;
    }

    if ( this.scaleProperty ) {
      this.originScale = this.scaleProperty.value;
      this.destinationScale = config.scale;
    }

    if ( this.shadowProperty ) {
      this.originShadow = this.shadowProperty.value;
      this.destinationShadow = config.shadow;
    }

    this.animationInvalidationProperty = config.animationInvalidationProperty;
    this.animationInvalidationProperty && this.animationInvalidationProperty.lazyLink( this.endAnimationListener );

    this.animationSpeed = config.velocity / Math.sqrt( config.position.distance( this.positionProperty.value ) );
    this.endAnimationCallback = config.endAnimationCallback;
    this.easing = config.easing;
  }

  /**
   * Ends the animation.
   * @public
   */
  endAnimation() {
    if ( this.isAnimatingProperty.value ) {
      if ( this.positionProperty ) {
        this.positionProperty.value = this.destinationPosition;
      }
      if ( this.rotationProperty ) {
        this.rotationProperty.value = this.destinationRotation;
      }
      if ( this.scaleProperty ) {
        this.scaleProperty.value = this.destinationScale;
      }
      if ( this.shadowProperty ) {
        this.shadowProperty.value = this.destinationShadow;
      }
      this.isAnimatingProperty.value = false;
      this.animationInvalidationProperty && this.animationInvalidationProperty.unlink( this.endAnimationListener );
      this.endAnimationCallback && this.endAnimationCallback();
    }
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    if ( this.isAnimatingProperty.value ) {
      this.ratio = Math.min( 1, this.ratio + dt * this.animationSpeed );
      if ( this.ratio === 1 ) {
        this.endAnimation();
      }
      else {
        const easedRatio = this.easing.value( this.ratio );
        if ( this.positionProperty ) {
          this.positionProperty.value = this.originPosition.blend( this.destinationPosition, easedRatio );
        }
        if ( this.rotationProperty ) {
          this.rotationProperty.value = Animator.clerp( this.originRotation, this.destinationRotation, easedRatio );
        }
        if ( this.scaleProperty ) {
          this.scaleProperty.value = this.originScale * ( 1 - easedRatio ) + this.destinationScale * easedRatio;
        }
        if ( this.shadowProperty ) {
          this.shadowProperty.value = this.originShadow * ( 1 - easedRatio ) + this.destinationShadow * easedRatio;
        }
      }
    }
  }

  /**
   * Returns the equivalent endAngle closest to the startAngle (mod 2pi).
   * @public
   *
   * @param {number} startAngle
   * @param {number} endAngle
   * @returns {number}
   */
  static modifiedEndAngle( startAngle, endAngle ) {
    let modifiedEndAngle = Utils.moduloBetweenDown( endAngle, startAngle, startAngle + 2 * Math.PI );
    if ( modifiedEndAngle > startAngle + Math.PI ) {
      modifiedEndAngle -= 2 * Math.PI;
    }
    return modifiedEndAngle;
  }

  /**
   * Circular linear interpolation (like slerp, but on a plane).
   * @public
   *
   * NOTE: my Google search for "slerp on a plane" didn't come up with anything useful besides neck pillows, so this
   * is just called clerp. :P
   *
   * @param {number} startAngle
   * @param {number} endAngle
   * @param {number} ratio
   * @returns {number}
   */
  static clerp( startAngle, endAngle, ratio ) {
    return startAngle * ( 1 - ratio ) + Animator.modifiedEndAngle( startAngle, endAngle ) * ratio;
  }
}

fractionsCommon.register( 'Animator', Animator );
export default Animator;