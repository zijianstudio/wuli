// Copyright 2016-2023, University of Colorado Boulder

/***
 * KeypadPanel is a panel that contains a value display, keypad, and Enter button.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import Keypad from '../../../../scenery-phet/js/keypad/Keypad.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Panel from '../../../../sun/js/Panel.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import URColors from '../URColors.js';

export default class KeypadPanel extends Panel {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {

      // KeypadPanel options
      valueBoxWidth: 85, // {number} width of the value field, height determined by valueFont
      valueYMargin: 3, // {number} vertical margin inside the value box
      valueFont: new PhetFont( 16 ),
      valueString: '', // {string} initial value shown in the keypad
      decimalPointKey: true, // {boolean} does the keypad have a decimal point key?
      maxDigits: 4, // {number} maximum number of digits that can be entered on the keypad
      maxDecimals: 2, // {number} maximum number of decimal places that can be entered on the keypad

      // Panel options
      fill: 'rgb( 230, 230, 230 )', // {Color|string} the keypad's background color
      backgroundPickable: true, // {boolean} so that clicking in the keypad's background doesn't close the keypad
      xMargin: 10,
      yMargin: 10,

      // RectangularPushButton options
      enterButtonListener: null  // {function} called when the Enter button is pressed

    }, options );

    const keypad = new Keypad( Keypad.PositiveDecimalLayout, {
      accumulatorOptions: {
        maxDigits: options.maxDigits,
        maxDigitsRightOfMantissa: options.maxDecimals
      },
      minButtonWidth: 35,
      minButtonHeight: 35,
      buttonFont: new PhetFont( 20 )
    } );

    const valueNode = new Text( '', {
      font: options.valueFont
    } );

    const valueBackgroundNode = new Rectangle( 0, 0, options.valueBoxWidth, valueNode.height + ( 2 * options.valueYMargin ), {
      cornerRadius: 3,
      fill: 'white',
      stroke: 'black'
    } );

    const valueParent = new Node( {
      children: [ valueBackgroundNode, valueNode ]
    } );

    // Show the value entered on the keypad. No unlink is required.
    keypad.stringProperty.link( string => {
      valueNode.string = string;
    } );

    // Keep the value centered in the background. No unlink is required.
    valueNode.boundsProperty.link( () => {
      valueNode.center = valueBackgroundNode.center;
    } );

    const enterButton = new RectangularPushButton( {
      listener: options.enterButtonListener,
      baseColor: URColors.enterButton,
      content: new Text( UnitRatesStrings.enterStringProperty, {
        font: new PhetFont( 16 ),
        fill: 'black',
        maxWidth: keypad.width // i18n
      } )
    } );

    const contentNode = new VBox( {
      spacing: 10,
      align: 'center',
      children: [ valueParent, keypad, enterButton ]
    } );

    super( contentNode, options );

    // @public
    this.valueStringProperty = keypad.stringProperty;

    // @private
    this.disposeKeypadPanel = () => {
      keypad.dispose(); // workaround for memory leak https://github.com/phetsims/unit-rates/issues/207
      enterButton.dispose(); // workaround for memory leak https://github.com/phetsims/unit-rates/issues/207
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeKeypadPanel();
    super.dispose();
  }
}

unitRates.register( 'KeypadPanel', KeypadPanel );