// Copyright 2019-2022, University of Colorado Boulder

/**
 * AccountBalanceControllerNode is a Scenery node that is used to add and remove money from a property that represents
 * a bank account balance.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Image, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import RoundPushButton from '../../../../sun/js/buttons/RoundPushButton.js';
import coinInHand_png from '../../../images/coinInHand_png.js';
import coinInSlot_png from '../../../images/coinInSlot_png.js';
import numberLineIntegers from '../../numberLineIntegers.js';
import NumberLineIntegersStrings from '../../NumberLineIntegersStrings.js';

// constants
const MARGIN = 10;
const BUTTON_OPTIONS = {
  xMargin: MARGIN,
  yMargin: MARGIN,
  fireOnHold: true,
  fireOnHoldDelay: 400,
  fireOnHoldInterval: 30
};
const CURRENCY_SYMBOL_FONT = new PhetFont( 12 );
const CURRENCY_SYMBOL_MAX_WIDTH = 10;
const BUTTON_ICON_WIDTH = 38;

const currencyUnitsString = NumberLineIntegersStrings.currencyUnits;


class AccountBalanceControllerNode extends VBox {

  /**
   * @param {NumberProperty} balanceProperty
   * @param {Emitter} balanceChangedByButtonEmitter
   * @param {Range} range
   * @param {number} changeAmount
   * @param {Object} [options]
   * @public
   */
  constructor( balanceProperty, balanceChangedByButtonEmitter, range, changeAmount, options ) {

    options = merge( {}, { buttonBaseColor: Color.blue }, options );

    // Closure for making changes to the balance.
    const changeBalance = balanceChangeAmount => {
      if ( ( balanceChangeAmount > 0 && balanceProperty.value < range.max ) ||
           ( balanceChangeAmount < 0 && balanceProperty.value > range.min ) ) {
        balanceProperty.value += balanceChangeAmount;
        balanceChangedByButtonEmitter.emit( balanceChangeAmount );
      }
    };

    // Create the icons that will be used in the buttons.  Sizes and positions were empirically determined.
    const depositIcon = new Node( {
      children: [
        new Image( coinInSlot_png, { maxWidth: BUTTON_ICON_WIDTH, centerY: -10 } ),
        new Text( currencyUnitsString, {
          center: new Vector2( 21, -9 ),
          font: CURRENCY_SYMBOL_FONT,
          maxWidth: CURRENCY_SYMBOL_MAX_WIDTH
        } )
      ]
    } );
    const withdrawIcon = new Node( {
      children: [
        new Image( coinInHand_png, { maxWidth: BUTTON_ICON_WIDTH } ),
        new Text( currencyUnitsString, {
          center: new Vector2( 22, 9 ),
          font: CURRENCY_SYMBOL_FONT,
          maxWidth: CURRENCY_SYMBOL_MAX_WIDTH
        } )
      ]
    } );

    // Create the buttons that the user can use to add and remove money.
    const upButton = new RoundPushButton( merge( {
      content: depositIcon,
      baseColor: options.buttonBaseColor,
      listener: () => { changeBalance( changeAmount ); }
    }, BUTTON_OPTIONS ) );
    const downButton = new RoundPushButton( merge( {
      content: withdrawIcon,
      baseColor: options.buttonBaseColor,
      listener: () => { changeBalance( -changeAmount ); }
    }, BUTTON_OPTIONS ) );

    // Control the enabled states of the buttons.
    balanceProperty.link( balance => {
      upButton.enabled = balance < range.max;
      downButton.enabled = balance > range.min;
    } );

    options = merge( {
      children: [
        upButton,
        downButton
      ],
      spacing: 15
    }, options );

    super( options );

    // @public (read-only) - emitter that fires when either button is released
    this.buttonReleasedEmitter = new Emitter();

    // Monitor the downProperty for each button, locking out the other button and performing emits when released.
    upButton.buttonModel.downProperty.lazyLink( down => {
      if ( down ) {

        // To prevent multi-touch issues, don't let the other button be pushed while this one is down.
        downButton.pickable = false;
      }
      else {

        // The button has been released, trigger the emitter.
        this.buttonReleasedEmitter.emit();

        // Restore pickability of peer button.
        downButton.pickable = true;
      }
    } );
    downButton.buttonModel.downProperty.lazyLink( down => {
      if ( down ) {

        // To prevent multi-touch issues, don't let the other button be pushed while this one is down.
        upButton.pickable = false;
      }
      else {

        // The button has been released, trigger the emitter.
        this.buttonReleasedEmitter.emit();

        // Restore pickability of peer button.
        upButton.pickable = true;
      }
    } );
  }
}

numberLineIntegers.register( 'AccountBalanceControllerNode', AccountBalanceControllerNode );
export default AccountBalanceControllerNode;