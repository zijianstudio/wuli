// Copyright 2017-2023, University of Colorado Boulder

/**
 * A model element that is movable.
 * It has a current position and a desired destination.
 * When the user drags the model element, it moves immediately to the desired destination.
 * When the destination is set programmatically, it animates to the desired destination.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import unitRates from '../../unitRates.js';

export default class URMovable {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      position: new Vector2( 0, 0 ), // {Vector2} initial position
      dragging: false, // {boolean} is this instance being dragged by the user?
      animationSpeed: 100 // {number} distance/second when animating
    }, options );

    // @public (read-only) DO NOT set this directly! Use moveTo or animateTo.
    this.positionProperty = new Vector2Property( options.position );

    // @public drag handlers must manage this flag during a drag sequence
    this.dragging = options.dragging;

    // @private
    this.animationSpeed = options.animationSpeed;

    // @private {Vector2} destination to animate to, set using animateTo
    this.destination = options.position.copy();

    // @private {function|null} called when animation step occurs, set using animateTo. Don't do anything expensive here!
    this.animationStepCallback = null;

    // @private {function|null} called when animation to destination completes, set using animateTo
    this.animationCompletedCallback = null;
  }

  // @public
  reset() {

    // call moveTo instead of positionProperty.set, so that any animation in progress is cancelled
    this.moveTo( this.positionProperty.initialValue );
  }

  /**
   * Moves immediately to the specified position, without animation.
   * @param {Vector2} position
   * @public
   */
  moveTo( position ) {

    // cancel any pending callbacks
    this.animationStepCallback = null;
    this.animationCompletedCallback = null;

    // move immediately to the position
    this.destination = position;
    this.positionProperty.set( position );
  }

  /**
   * Animates to the specified position.
   * Provides optional callback that occur on animation step and completion.
   * @param {Vector2} destination
   * @param {Object} [options]
   * @public
   */
  animateTo( destination, options ) {

    options = merge( {
      animationStepCallback: null, // {function} called when animation step occurs
      animationCompletedCallback: null // {function} called when animation has completed
    }, options );

    this.destination = destination;
    this.animationStepCallback = options.animationStepCallback;
    this.animationCompletedCallback = options.animationCompletedCallback;
  }

  /**
   * Animates position, when not being dragged by the user.
   * @param {number} dt - time since the previous step, in seconds
   * @public
   */
  step( dt ) {
    const doStep = !this.dragging && ( !this.positionProperty.get().equals( this.destination ) || this.animationCompletedCallback );
    if ( doStep ) {

      // optional callback
      this.animationStepCallback && this.animationStepCallback();

      // distance from destination
      const totalDistance = this.positionProperty.get().distance( this.destination );

      // distance to move on this step
      const stepDistance = this.animationSpeed * dt;

      if ( totalDistance <= stepDistance ) {

        // move directly to the destination
        this.positionProperty.set( this.destination );

        // callback, which may set a new callback
        const saveAnimationCompletedCallback = this.animationCompletedCallback;
        this.animationCompletedCallback && this.animationCompletedCallback();
        if ( saveAnimationCompletedCallback === this.animationCompletedCallback ) {
          this.animationCompletedCallback = null;
        }
      }
      else {

        // move one step towards the destination
        const stepAngle = Math.atan2(
          this.destination.y - this.positionProperty.get().y,
          this.destination.x - this.positionProperty.get().x );
        const stepVector = Vector2.createPolar( stepDistance, stepAngle );
        this.positionProperty.set( this.positionProperty.get().plus( stepVector ) );
      }
    }
  }
}

unitRates.register( 'URMovable', URMovable );