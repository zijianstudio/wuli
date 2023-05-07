// Copyright 2018-2021, University of Colorado Boulder

/**
 * MagnetAutoSlideKeyboardListener is a keyboard listener that implement the "auto-slide" behavior, which is where the
 * user can press keys that will cause the magnet to translate horizontally until it hits an obstacle or the sim bounds.
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import stepTimer from '../../../../axon/js/stepTimer.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import { KeyboardUtils } from '../../../../scenery/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawConstants from '../FaradaysLawConstants.js';
import MagnetDirectionEnum from '../model/MagnetDirectionEnum.js';
import FaradaysLawAlertManager from './FaradaysLawAlertManager.js';

// constants
const { LEFT, RIGHT } = MagnetDirectionEnum;
const HALF_MAGNET_WIDTH = FaradaysLawConstants.MAGNET_WIDTH / 2;
const HALF_MAGNET_HEIGHT = FaradaysLawConstants.MAGNET_HEIGHT / 2;

// event.code for the digit keys used
const KEY_CODE_DIGIT_1 = KeyboardUtils.KEY_1;
const KEY_CODE_DIGIT_2 = KeyboardUtils.KEY_2;
const KEY_CODE_DIGIT_3 = KeyboardUtils.KEY_3;

// list of key modifiers to check for and make sure are not pressed when handling these keys
const KEY_MODIFIER_LIST = [ 'Control', 'Alt' ];

class MagnetAutoSlideKeyboardListener {

  constructor( model, options ) {
    options = merge( {

      // speeds, all in model coordinates per second
      slowSpeed: 90, // empirically determined such that the voltmeter doesn't peg when going through bigger coil
      mediumSpeed: 300,
      fastSpeed: 500,

      onKeyDown: _.noop,
      onKeyUp: _.noop
    }, options );

    const { mediumSpeed, slowSpeed, fastSpeed } = options;

    // {Map.<string, number>} - map of the auto-slide keys to a speed for each
    const keyToSpeedMap = new Map( [
      [ KEY_CODE_DIGIT_1, slowSpeed ],
      [ KEY_CODE_DIGIT_2, mediumSpeed ],
      [ KEY_CODE_DIGIT_3, fastSpeed ]
    ] );

    // Track the up/down state for each of the auto-slide keys.
    this.autoSlideKeyIsDownMap = new Map();
    for ( const key of keyToSpeedMap.keys() ) {
      this.autoSlideKeyIsDownMap.set( key, false );
    }

    // @public (read-only) - true when the magnet is being animated (moved) by this object
    this.isAnimatingProperty = new BooleanProperty( false );

    // @public (read-only) - the position where the magnet will head towards if and when this listener is fired
    this.slideTargetPositionProperty = new Vector2Property( Vector2.ZERO );

    // @private - speed at which translation of the magnet should occur
    this.translationSpeed = 0;

    // @private
    this.model = model;
    this._constrainedDragBounds = FaradaysLawConstants.LAYOUT_BOUNDS.erodedXY( HALF_MAGNET_WIDTH, HALF_MAGNET_HEIGHT );

    // closure to update the slide target position based on the current position and animation state
    const updateSlideTarget = () => {

      let preferredDirection;
      if ( this.isAnimatingProperty.value ) {

        // There is an animation in progress, so we want to reverse the direction.
        preferredDirection = model.magnet.positionProperty.value.x < this.slideTargetPositionProperty.value.x ?
                             LEFT :
                             RIGHT;
      }
      else {

        // The magnet is not currently sliding, so start it moving.  It will move towards the coils if there is room to
        // do so, otherwise it will move away from them.
        preferredDirection = model.magnet.positionProperty.value.x < FaradaysLawConstants.TOP_COIL_POSITION.x ?
                             RIGHT :
                             LEFT;
      }

      // convenience values
      const magnetXPosition = model.magnet.positionProperty.value.x;
      const maxXPosition = this._constrainedDragBounds.maxX;
      const minXPosition = this._constrainedDragBounds.minX;

      // Start with a translation that would take the magnet all the way to the right or left model bounds.
      let proposedTranslation = new Vector2(
        preferredDirection === RIGHT ? maxXPosition - magnetXPosition : minXPosition - magnetXPosition,
        0
      );

      // Check whether the proposed translation is viable and, if not, determine what is.
      let allowableTranslation = model.checkProposedMagnetMotion( proposedTranslation );

      // If the allowable translation works out to be zero, it means that the magnet is up against an obstacle, so go
      // the other direction.
      if ( allowableTranslation.magnitude === 0 ) {
        preferredDirection = preferredDirection === RIGHT ? LEFT : RIGHT;
        proposedTranslation = new Vector2(
          preferredDirection === RIGHT ? maxXPosition - magnetXPosition : minXPosition - magnetXPosition,
          0
        );
        allowableTranslation = model.checkProposedMagnetMotion( proposedTranslation );
      }

      // Set the new target position.
      this.slideTargetPositionProperty.set( model.magnet.positionProperty.value.plus( allowableTranslation ) );
    };

    // To avoid odd behavior, stop any in-progress animations if the number of coils change.
    model.topCoilVisibleProperty.link( () => {
      if ( this.isAnimatingProperty.value ) {
        this.isAnimatingProperty.set( false );
        this.slideTargetPositionProperty.set( model.magnet.positionProperty.value );
      }
    } );

    // key down handler
    this.keydown = event => {

      // check if the key is "modified"
      let keyModified = false;
      KEY_MODIFIER_LIST.forEach( modifierArg => {
        keyModified = keyModified || event.domEvent.getModifierState( modifierArg );
      } );

      const key = KeyboardUtils.getEventCode( event.domEvent );

      if ( keyToSpeedMap.has( key ) && !keyModified ) {

        // Skip the changes if this key is already down.
        if ( !this.autoSlideKeyIsDownMap.get( key ) ) {

          // Mark this key as being down.
          this.autoSlideKeyIsDownMap.set( key, true );

          // Update the slide target.
          updateSlideTarget();

          // Initiate the animation.
          this.isAnimatingProperty.set( true );

          // Update the speed at which the magnet will move.
          this.translationSpeed = keyToSpeedMap.get( key );
        }
      }
      else if ( this.isAnimatingProperty.value ) {

        // Any key press that is not one of the auto-slide keys should stop the animation.
        this.isAnimatingProperty.set( false );
      }

      // Invoke the client-provided handler (this does nothing if the client didn't provide one).
      options.onKeyDown( event );
    };

    // function for mapping speed linearly, which is then used to map it to text for a11y
    const speedToText = new LinearFunction( 0, fastSpeed, 0, 200, true );

    // key up handler
    this.keyup = event => {

      const releasedKey = event.domEvent.code;

      if ( keyToSpeedMap.has( releasedKey ) ) {
        this.autoSlideKeyIsDownMap.set( releasedKey, false );

        const speedToTextValue = Utils.roundSymmetric( speedToText.evaluate( this.translationSpeed ) );
        const direction = this.model.magnet.positionProperty.value.x < this.slideTargetPositionProperty.value.x ?
                          RIGHT :
                          LEFT;
        FaradaysLawAlertManager.magnetSlidingAlert( speedToTextValue, direction );
      }

      // Invoke the client-provided handler (this does nothing if the client didn't provide one).
      options.onKeyUp( event );
    };

    // Handler for the case where the magnet is released from a11y focus.  If a key is down when the magnet is released,
    // subsequent key up messages won't be received, so we need to clear any keys that are down, see
    // https://github.com/phetsims/faradays-law/issues/214.
    this.released = () => {

      // Mark all keys as up.
      this.autoSlideKeyIsDownMap.forEach( ( value, key ) => {
        this.autoSlideKeyIsDownMap.set( key, false );
      } );

      // Make sure animation is off.
      this.isAnimatingProperty.set( false );
    };

    // Stop the animation if the user starts dragging the magnet.
    model.magnet.isDraggingProperty.link( isDragging => {
      if ( isDragging ) {
        this.isAnimatingProperty.set( false );
      }
    } );

    // step the drag listener, must be removed in dispose
    const stepListener = this.step.bind( this );
    stepTimer.addListener( stepListener );

    // @private - called in dispose
    this._disposeKeyboardDragListener = () => {
      stepTimer.removeListener( stepListener );
    };
  }

  /**
   * @public
   * @param {number} dt - in seconds
   */
  step( dt ) {

    // Determine whether any of the auto-slide keys are currently pressed.
    let autoSlideKeyPressed = false;
    for ( const isKeyDown of this.autoSlideKeyIsDownMap.values() ) {
      if ( isKeyDown ) {
        autoSlideKeyPressed = true;
      }
    }

    // If an animation is in progress and none of the auto-slide keys are pressed, move the magnet towards the target.
    if ( this.isAnimatingProperty.value && !autoSlideKeyPressed ) {
      const magnetPosition = this.model.magnet.positionProperty.value;
      if ( !magnetPosition.equals( this.slideTargetPositionProperty.value ) ) {

        const deltaXToTarget = this.slideTargetPositionProperty.value.x - magnetPosition.x;
        let unconstrainedNewPosition;
        if ( Math.abs( deltaXToTarget ) <= dt * this.translationSpeed ) {

          // The magnet is almost to the target position, so just move it there.
          unconstrainedNewPosition = this.slideTargetPositionProperty.value;
        }
        else {
          const distanceSign = deltaXToTarget < 0 ? -1 : 1;
          const deltaVector = new Vector2( distanceSign * this.translationSpeed * dt, 0 );
          unconstrainedNewPosition = magnetPosition.plus( deltaVector );
        }

        // Make sure the new position doesn't put the magnet outside of the drag bounds.
        const constrainedNewPosition = this._constrainedDragBounds.closestPointTo( unconstrainedNewPosition );

        // Move the magnet.
        this.model.moveMagnetToPosition( constrainedNewPosition );
      }

      // If the magnet is now at the destination, clear the animation flag.
      if ( magnetPosition.equals( this.slideTargetPositionProperty.value ) ) {
        this.isAnimatingProperty.set( false );
      }
    }
  }

  /**
   * @public
   */
  dispose() {
    this._disposeKeyboardDragListener();
  }
}

faradaysLaw.register( 'MagnetAutoSlideKeyboardListener', MagnetAutoSlideKeyboardListener );
export default MagnetAutoSlideKeyboardListener;