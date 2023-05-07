// Copyright 2017-2023, University of Colorado Boulder

/**
 * Keypad to edit generic terms.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Key from '../../../../scenery-phet/js/keypad/Key.js';
import KeyID from '../../../../scenery-phet/js/keypad/KeyID.js';
import Keypad from '../../../../scenery-phet/js/keypad/Keypad.js';
import { Node, Rectangle, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Panel from '../../../../sun/js/Panel.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonStrings from '../../AreaModelCommonStrings.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import Term from '../../common/model/Term.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';
import TermAccumulator from './TermAccumulator.js';

const enterString = AreaModelCommonStrings.enter;

// layout constants
const positiveKeys = [
  [ Keypad.KEY_7, Keypad.KEY_8, Keypad.KEY_9 ],
  [ Keypad.KEY_4, Keypad.KEY_5, Keypad.KEY_6 ],
  [ Keypad.KEY_1, Keypad.KEY_2, Keypad.KEY_3 ]
];
const zeroAndBackspace = [
  Keypad.KEY_0, Keypad.KEY_BACKSPACE
];
const noExponentLayout = positiveKeys.concat( [
  [ Keypad.PLUS_MINUS ].concat( zeroAndBackspace )
] );
const noNegativeLayout = positiveKeys.concat( [
  [ null ].concat( zeroAndBackspace )
] );
const exponentLayout = noExponentLayout.concat( [
  [
    null,
    new Key( new RichText( `${AreaModelCommonConstants.X_VARIABLE_RICH_STRING}<sup>2</sup>`, { font: AreaModelCommonConstants.KEYPAD_FONT } ), KeyID.X_SQUARED ),
    new Key( new RichText( AreaModelCommonConstants.X_VARIABLE_RICH_STRING, { font: AreaModelCommonConstants.KEYPAD_FONT } ), KeyID.X )
  ]
] );

class TermKeypadPanel extends Panel {
  /**
   * @param {Property.<number>} digitCountProperty
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   * @param {boolean} allowNegative
   * @param {function} enterCallback - function( {Term|null} ) - The entered term, or null if there is no valid term entered.
   * @param {Object} [nodeOptions]
   */
  constructor( digitCountProperty, allowExponents, allowNegative, enterCallback, nodeOptions ) {
    assert && assert( allowNegative || !allowExponents, 'We have no non-negative exponent keyboard layout' );

    // Handles logic for key-presses and conversion to strings/Terms.
    const termAccumulator = new TermAccumulator( digitCountProperty );

    const keypad = new Keypad( allowExponents ? exponentLayout : ( allowNegative ? noExponentLayout : noNegativeLayout ), {
      accumulator: termAccumulator
    } );

    const readoutBackground = new Rectangle( {
      fill: AreaModelCommonColors.keypadReadoutBackgroundProperty,
      stroke: AreaModelCommonColors.keypadReadoutBorderProperty,
      cornerRadius: AreaModelCommonConstants.PANEL_CORNER_RADIUS
    } );

    const readoutTextOptions = {
      font: AreaModelCommonConstants.KEYPAD_READOUT_FONT
    };

    const readoutText = new RichText( '', readoutTextOptions );

    function updateText( string ) {
      // Trick to be able to position an empty string
      readoutText.visible = string.length > 0;
      if ( readoutText.visible ) {
        readoutText.string = string;
        readoutText.centerX = readoutBackground.centerX;
      }
    }

    // Update the text when the accumulator's string output changes
    termAccumulator.richStringProperty.link( updateText );

    // When the active partition changes, resize the background to fit to the largest size.
    digitCountProperty.link( digitCount => {
      // Temporarily use a different string
      readoutText.string = Term.getLargestGenericString( allowExponents, digitCount );

      // Update the background
      readoutBackground.setRectBounds( readoutText.bounds.dilatedXY( 10, 1 ) );

      // Reposition our text
      readoutText.center = readoutBackground.center;

      // Reset the text value back to what it should be.
      updateText( termAccumulator.richStringProperty.value );
    } );

    super( new VBox( {
      children: [
        new Node( {
          // We position the text over the background manually
          children: [
            readoutBackground,
            readoutText
          ]
        } ),
        keypad,
        new RectangularPushButton( {
          content: new Text( enterString, {
            font: AreaModelCommonConstants.KEYPAD_FONT,
            maxWidth: 100
          } ),
          touchAreaXDilation: 5,
          touchAreaYDilation: 5,
          xMargin: 15,
          yMargin: 5,
          listener: () => {
            enterCallback( termAccumulator.termProperty.value );
          },
          baseColor: AreaModelCommonColors.keypadEnterBackgroundProperty
        } )
      ],
      spacing: 10
    } ), {
      cornerRadius: AreaModelCommonConstants.PANEL_CORNER_RADIUS,
      xMargin: 15,
      yMargin: 15,
      fill: AreaModelCommonColors.keypadPanelBackgroundProperty,
      stroke: AreaModelCommonColors.keypadPanelBorderProperty
    } );

    this.mutate( nodeOptions );

    // @private
    this.keypad = keypad;
  }

  /**
   * Clears the keypad's content.
   * @public
   */
  clear() {
    this.keypad.clear();
  }
}

areaModelCommon.register( 'TermKeypadPanel', TermKeypadPanel );
export default TermKeypadPanel;