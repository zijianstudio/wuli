// Copyright 2016-2023, University of Colorado Boulder

/**
 * KeypadLayer handles creation and management of a modal keypad.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import { Plane, PressListener } from '../../../../scenery/js/imports.js';
import unitRates from '../../unitRates.js';
import KeypadPanel from './KeypadPanel.js';

export default class KeypadLayer extends Plane {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      fill: 'rgba( 0, 0, 0, 0.2 )',
      visible: false
    }, options );

    super( options );

    // clicking outside the keypad cancels the edit
    this.addInputListener( new PressListener( {
      attach: false,
      press: event => {
        if ( this.visible && event.trail.lastNode() === this ) {
          this.cancelEdit();
        }
      }
    } ) );

    // @private these will be set when the client calls beginEdit
    this.valueProperty = null;
    this.keypad = null;
    this.zeroIsValid = true;
    this.onEndEdit = null; // {function} called by endEdit
  }

  /**
   * Begins an edit, by opening a modal keypad.
   * @param {Property.<number>} valueProperty - the Property to be set by the keypad
   * @param {Object} [options]
   * @public
   */
  beginEdit( valueProperty, options ) {

    // Ignore attempts to open another keypad. This can happen in unlikely multi-touch scenarios.
    // See https://github.com/phetsims/unit-rates/issues/181
    if ( this.keypad ) {
      unitRates.log && unitRates.log( 'ignoring attempt to open another keypad' );
      return;
    }

    options = merge( {
      onBeginEdit: null, // {function} called by beginEdit
      onEndEdit: null, // {function} called by endEdit
      setKeypadPosition: null, // {function:KeypadPanel} called by beginEdit to set the keypad position
      maxDigits: 4, // {number} maximum number of digits that can be entered on the keypad
      maxDecimals: 2, // {number} maximum number of decimal places that can be entered on the keypad
      zeroIsValid: true // {boolean} is zero a valid value?
    }, options );

    this.valueProperty = valueProperty; // remove this reference in endEdit
    this.onEndEdit = options.onEndEdit;
    this.zeroIsValid = options.zeroIsValid;

    // create a keypad
    this.keypad = new KeypadPanel( {
      maxDigits: options.maxDigits,
      maxDecimals: options.maxDecimals,
      enterButtonListener: this.commitEdit.bind( this )
    } );

    // display the keypad
    this.addChild( this.keypad );
    this.visible = true;

    // position the keypad
    options.setKeypadPosition && options.setKeypadPosition( this.keypad );

    // execute client-specific hook
    options.onBeginEdit && options.onBeginEdit();
  }

  // @private ends an edit
  endEdit() {

    // hide the keypad
    this.visible = false;
    this.removeChild( this.keypad );
    this.keypad.dispose();
    this.keypad = null;

    // execute client-specific hook
    this.onEndEdit && this.onEndEdit();

    // remove reference to valueProperty that was passed to beginEdit
    this.valueProperty = null;
  }

  // @private commits an edit
  commitEdit() {

    // get the value from the keypad
    const value = Number( this.keypad.valueStringProperty.value );

    // if the keypad contains a valid value ...
    if ( isValidValue( value, this.zeroIsValid ) ) {
      this.valueProperty.value = value;
      this.endEdit();
    }
    else {
      this.cancelEdit(); // not entering a value in the keypad is effectively a cancel
    }
  }

  // @private cancels an edit
  cancelEdit() {
    this.endEdit();
  }
}

/**
 * Determines if the value from the keypad is a valid entry.
 * @param {number} value
 * @param {boolean} zeroIsValid - is zero a valid value?
 * @returns {boolean}
 */
function isValidValue( value, zeroIsValid ) {
  return !isNaN( value ) && !( value === 0 && !zeroIsValid );
}

unitRates.register( 'KeypadLayer', KeypadLayer );