// Copyright 2022, University of Colorado Boulder

/**
 * To test connecting to a bluetooth device using web bluetooth. Note this uses Promises (as the
 * bluetooth API works with promises) which is very unusual for simulation code.
 *
 * Prototype code for upcoming student studies, see https://github.com/phetsims/ratio-and-proportion/issues/473
 */

import ratioAndProportion from '../../ratioAndProportion.js';
import TextPushButton, { TextPushButtonOptions } from '../../../../sun/js/buttons/TextPushButton.js';
import Utils from '../../../../dot/js/Utils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Property from '../../../../axon/js/Property.js';
import RAPRatioTuple from '../model/RAPRatioTuple.js';
import RatioTerm from '../model/RatioTerm.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import StationaryValueTracker from './StationaryValueTracker.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import RAPQueryParameters from '../RAPQueryParameters.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';

const FONT = new PhetFont( { size: 16, weight: 'bold' } );

// in ms
const TIME_INTERACTED_WITH_MEMORY = 2000;

// Likely can be improved, but we don't have this in the main browser typing.
type BluetoothConfig = {
  filters: { name: string }[];
  optionalServices?: number[];
};

class RatioAndProportionBluetoothButton extends TextPushButton {

  public isBeingInteractedWithProperty = new BooleanProperty( false );
  private lastTimeInteractedWith = 0;
  private stationaryTracker = new StationaryValueTracker( {
    historyLength: RAPQueryParameters.bluetoothHistoryLength,
    stationaryThreshold: RAPQueryParameters.bluetoothStationaryThreshold
  } );

  public isStationaryProperty = this.stationaryTracker.isStationaryProperty; // pull it out for the public API

  public constructor( tupleProperty: Property<RAPRatioTuple>, ratioTerm: RatioTerm, providedOptions?: TextPushButtonOptions ) {

    // When next here, we can handle when device does not support bluetooth with bluetooth.getAvailability. https://github.com/phetsims/ratio-and-proportion/issues/473
    // When next here, we can handle when browser does not support bluetooth, presumablue !navigator.bluetooth https://github.com/phetsims/ratio-and-proportion/issues/473

    // Name provided by the bluetooth device creator
    const deviceName = ratioTerm === RatioTerm.ANTECEDENT ? 'nrf52L' : 'nrf52R';

    // button label
    const labelStringProperty = new PatternStringProperty( new Property( 'BLE {{side}} device' ), {
      side: ratioTerm === RatioTerm.ANTECEDENT ? 'left' : 'right'
    } );

    // decides which hand to control in the sim
    const term = ratioTerm === RatioTerm.ANTECEDENT ? 'withAntecedent' : 'withConsequent';

    const options = optionize<TextPushButtonOptions, EmptySelfOptions, TextPushButtonOptions>()( {
      textNodeOptions: { font: FONT },
      listener: async () => {
        await this.requestDevice( { filters: [ { name: deviceName } ], optionalServices: [ 0xae6f ] }, tupleProperty, term );
      }
    }, providedOptions );
    super( labelStringProperty, options );
  }

  private async requestDevice( bluetoothConfig: BluetoothConfig, tupleProperty: Property<RAPRatioTuple>, term: 'withConsequent' | 'withAntecedent' ): Promise<void> {
    let device: null | IntentionalAny; // should be type BluetoothDevice, but it is too experimental for native types

    // @ts-expect-error - navigator.bluetooth is experimental and does not exist in the typing
    if ( navigator.bluetooth ) {

      // @ts-expect-error - navigator.bluetooth is experimental and does not exist in the typing
      device = await navigator.bluetooth.requestDevice( bluetoothConfig ).catch( err => {
        device = null;
      } );

      if ( device ) {
        console.log( device.name );
        console.log( device.id );

        // attempt to connect to the GATT Server.
        const gattServer = await device.gatt.connect().catch( ( err: DOMException ) => { console.error( err ); } );
        const primaryService = await gattServer.getPrimaryService( 0xae6f ).catch( ( err: DOMException ) => { console.error( err ); } );
        const characteristic = await primaryService.getCharacteristic( 0x2947 ).catch( ( err: DOMException ) => { console.error( err ); } );
        const notifySuccess = await characteristic.startNotifications().catch( ( err: DOMException ) => { console.error( err ); } );
        notifySuccess.addEventListener( 'characteristicvaluechanged', ( event: Event ) => {
          this.isBeingInteractedWithProperty.value = true;
          this.lastTimeInteractedWith = Date.now();

          const newValue = RatioAndProportionBluetoothButton.handleCharacteristicValueChanged( event );

          // Keep track of values to see if the current position over time is considered "stationary"
          this.stationaryTracker.update( newValue );

          tupleProperty.value = tupleProperty.value[ term ]( newValue );
        } );

        // At this time we can assume that connections are successful
        console.log( 'connection successful' );
      }
    }
  }

  public step(): void {
    if ( Date.now() - this.lastTimeInteractedWith > TIME_INTERACTED_WITH_MEMORY ) {
      this.isBeingInteractedWithProperty.value = false;
    }
  }

  /**
   * Respond to a characteristicvaluechanged event.
   * The return value must be between 0 and 1.
   */
  private static handleCharacteristicValueChanged( event: Event ): number {
    if ( event.target ) {

      // @ts-expect-error, event.target is a BluetoothRemoteGATTCharacteristic, but this is too experimental to be the typescript lib.
      const value = event.target.value as DataView;

      console.log( value.getFloat32( 0, true ) );

      const floatValue = value.getFloat32( 0, true );

      // rounding to 4 decimal places.
      return Utils.toFixedNumber( Utils.clamp( floatValue / 100, 0, 1 ), 4 );
    }

    return 0;
  }
}

ratioAndProportion.register( 'RatioAndProportionBluetoothButton', RatioAndProportionBluetoothButton );
export default RatioAndProportionBluetoothButton;
