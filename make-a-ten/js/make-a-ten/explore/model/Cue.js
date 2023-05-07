// Copyright 2016-2022, University of Colorado Boulder

/**
 * Common move/split cue model. The cue represents a visual indicator that sticks to a counting object, and lets the user
 * know they can do an operation. It will fade away when the operation is performed, but will return upon reset all.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Property from '../../../../../axon/js/Property.js';
import makeATen from '../../../makeATen.js';

// constants
const FADE_SPEED = 0.8;

// state enumeration for the cue
const CueState = Object.freeze( {
  UNATTACHED: 'UNATTACHED', // "not faded, but not visible"
  ATTACHED: 'ATTACHED', // "on a number, but not fading"
  FADING: 'FADING', // "on a number, but fading"
  FADED: 'FADED' // "faded, will not return until reset all"
} );

class Cue {
  constructor() {
    // @public {Property.<CountingObject|null>} - What CountingObject the cue is attached to.
    this.countingObjectProperty = new Property( null );

    // @public {BooleanProperty} - Whether the cue should be visible at all
    this.visibilityProperty = new BooleanProperty( false );

    // @public {NumberProperty} - What the visibility of the cue shoudl be.
    this.opacityProperty = new NumberProperty( 1 );

    // @private {Property.<CueState>}
    this.stateProperty = new Property( CueState.UNATTACHED );
  }

  /**
   * Step the cue (handle opacity if fading).
   * @public
   *
   * @param {number} dt - Changed model time
   */
  step( dt ) {
    if ( this.stateProperty.value === CueState.FADING ) {
      // Fade
      this.opacityProperty.value = Math.max( 0, this.opacityProperty.value - FADE_SPEED * dt );

      // If fully done, change to faded
      if ( !this.opacityProperty.value ) {
        this.changeToFaded();
      }
    }
  }

  /**
   * Attaches the cue to the number (if it hasn't faded fully).
   * @public
   *
   * @param {CountingObject} countingObject
   */
  attachToNumber( countingObject ) {
    if ( this.stateProperty.value === CueState.FADED ) { return; }

    this.stateProperty.value = ( this.stateProperty.value === CueState.FADING ) ? this.stateProperty.value : CueState.ATTACHED;
    this.countingObjectProperty.value = countingObject;
    this.visibilityProperty.value = true;
  }

  /**
   * Detach from the current counting object, without fading.
   * @public
   */
  detach() {
    if ( this.stateProperty.value === CueState.FADED ) { return; }

    if ( this.stateProperty.value === CueState.FADING ) {
      this.changeToFaded();
    }
    else {
      this.changeToUnattached();
    }
  }

  /**
   * The cue will start fading if it hasn't started (or completed) fading already.
   * @public
   */
  triggerFade() {
    if ( this.stateProperty.value === CueState.ATTACHED ) {
      this.stateProperty.value = CueState.FADING;
    }
    else if ( this.stateProperty.value === CueState.UNATTACHED ) {
      // If we're not attached, just immediately switch to fully faded.
      this.changeToFaded();
    }
  }

  /**
   * Resets the cue to the initial state.
   * @public
   */
  reset() {
    this.changeToUnattached();
  }

  /**
   * Changes to an unattached state
   * @private
   */
  changeToUnattached() {
    this.stateProperty.value = CueState.UNATTACHED;
    this.visibilityProperty.value = false;
    this.opacityProperty.value = 1;
    this.countingObjectProperty.value = null;
  }

  /**
   * Changes to a fully-faded state
   * @private
   */
  changeToFaded() {
    this.stateProperty.value = CueState.FADED;
    this.visibilityProperty.value = false;
    this.opacityProperty.value = 1;
    this.countingObjectProperty.value = null;
  }
}

makeATen.register( 'Cue', Cue );

export default Cue;