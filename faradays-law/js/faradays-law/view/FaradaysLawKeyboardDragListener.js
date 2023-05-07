// Copyright 2018-2022, University of Colorado Boulder

/**
 * Type to handle all standard keyboard input. The only exception is the grab-drag interaction.
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import { KeyboardDragListener } from '../../../../scenery/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';

class FaradaysLawKeyboardDragListener extends KeyboardDragListener {

  /**
   * @param {FaradaysLawModel} model
   * @param {MagnetRegionManager} regionManager
   * @param {FaradaysLawAlertManager} alertManager
   * @param {Object} [options]
   */
  constructor( model, regionManager, alertManager, options ) {

    const drag = vectorDelta => {
      model.magnetArrowsVisibleProperty.set( false );

      // Attempt to move the magnet based on the drag action.  The model will prevent the magnet from going anywhere
      // that it shouldn't.
      const proposedPosition = model.magnet.positionProperty.get().plus( vectorDelta );
      model.moveMagnetToPosition( proposedPosition );
    };

    const end = () => {
      alertManager.movementEndAlert();
    };

    options = merge( {
      drag: drag,
      end: end,
      dragBoundsProperty: new Property( model.bounds )
    }, options );

    super( options );

    this.regionManager = regionManager;
    this.alertManager = alertManager;
  }

  /**
   * @public
   */
  initializeAccessibleInputListener() {
    return {
      keyup: onKeyUp.bind( this ),
      focus: onFocus.bind( this )
    };
  }
}

function onKeyUp( event ) {
  const { magnetIsAnimating, magnetStoppedByKeyboard } = this.regionManager;

  if ( !magnetIsAnimating && magnetStoppedByKeyboard ) {
    this.alertManager.movementEndAlert();
    this.regionManager.resetKeyboardStop();
  }
}

function onFocus() {

  // set flag to override the next keyup alert
  this.alertManager.magnetFocusAlert();
  this.regionManager.resetKeyboardStop();
}

faradaysLaw.register( 'FaradaysLawKeyboardDragListener', FaradaysLawKeyboardDragListener );
export default FaradaysLawKeyboardDragListener;