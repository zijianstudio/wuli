// Copyright 2022-2023, University of Colorado Boulder

/**
 * To test connecting to a bluetooth device using web bluetooth. This code was written in collaboration with Scott
 * Lambert from SLU, who built the tangible hardware and bluetooth device.
 *
 * NOTE: this uses Promises (as the bluetooth API works with promises) which is very unusual for simulation code.
 *
 * NOTE: IntentionalAny is used a lot in this file - the Web Bluetooth API is not available yet in native types. Since
 * this is prototype code, it isn't worth further investigation.
 *
 * For more information about Web Bluetooth API, please see
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */
import quadrilateral from '../../../quadrilateral.js';
import TextPushButton from '../../../../../sun/js/buttons/TextPushButton.js';
import QuadrilateralConstants from '../../../QuadrilateralConstants.js';
import Utils from '../../../../../dot/js/Utils.js';
import Emitter from '../../../../../axon/js/Emitter.js';
import stepTimer from '../../../../../axon/js/stepTimer.js';
import IntentionalAny from '../../../../../phet-core/js/types/IntentionalAny.js';
import QuadrilateralColors from '../../../QuadrilateralColors.js';
import TangibleConnectionModel from '../../model/prototype/TangibleConnectionModel.js';
import QuadrilateralTangibleController from './QuadrilateralTangibleController.js';

// IDs to the BLE service and specific characteristics (channels providing values from sensors) of the device - these
// were provided by Scott Lambert at SLU who built the tangible device.
const PRIMARY_SERVICE_ID = '19b10010-e8f2-537e-4f6c-d104768a1214';
const TOP_LENGTH_CHARACTERISTIC_ID = '19b10010-e8f2-537e-4f6c-d104768a1214'; // Why is it the same as service ID?
const RIGHT_LENGTH_CHARACTERISTIC_ID = '19b10010-e8f2-537e-4f6c-d104768a1215';
const LEFT_LENGTH_CHARACTERSTIC_ID = '19b10010-e8f2-537e-4f6c-d104768a1216';
const LEFT_TOP_ANGLE_CHARACTERISTIC_ID = '19b10010-e8f2-537e-4f6c-d104768a1217';
const RIGHT_TOP_ANGLE_CHARACTERISTIC_ID = '19b10010-e8f2-537e-4f6c-d104768a1218';

// The bluetooth options for the requestDevice call. There must be at least one entry in filters for the browser
// to make a request!
const REQUEST_DEVICE_OPTIONS = {
  filters: [
    { services: [ PRIMARY_SERVICE_ID ] },
    { name: 'Arduino' }
  ]
};

export default class QuadrilateralBluetoothConnectionButton extends TextPushButton {

  // Amount of time passed in ms since updating the simulation from bluetooth input. We wait at least every
  // QuadrilateralTangibleOptionsModel.bluetoothUpdateIntervalProperty.value in an attempt to filter out noise.
  private timeSinceUpdatingSim = 0;

  public readonly allDataCollectedEmitter = new Emitter();

  private readonly tangibleConnectionModel: TangibleConnectionModel;

  // The values that we will receive from the device and forward to the simulation. These 5 values are sufficient to
  // recreate the geometry of the quadrilateral.
  private topLength = 0;
  private rightLength = 0;
  private leftLength = 0;
  private leftTopAngle = 0;
  private rightTopAngle = 0;

  public constructor( tangibleConnectionModel: TangibleConnectionModel, tangibleController: QuadrilateralTangibleController ) {

    super( 'Pair BLE Device', {
      textNodeOptions: QuadrilateralConstants.SCREEN_TEXT_OPTIONS,
      baseColor: QuadrilateralColors.screenViewButtonColorProperty
    } );

    this.tangibleConnectionModel = tangibleConnectionModel;

    this.addListener( this.requestQuadDevice.bind( this ) );

    this.allDataCollectedEmitter.addListener( () => {
      if ( this.tangibleConnectionModel.isCalibratingProperty.value ) {
        this.tangibleConnectionModel.setPhysicalModelBounds( this.topLength, this.rightLength, 0, this.leftLength );
      }
      else if ( tangibleConnectionModel.physicalModelBoundsProperty.value ) {

        // updateInterval is an attempt to filter out noise
        const updateInterval = tangibleConnectionModel.tangibleOptionsModel.bluetoothUpdateIntervalProperty.value;
        if ( this.timeSinceUpdatingSim > updateInterval ) {
          tangibleController.setPositionsFromLengthAndAngleData(
            this.topLength,
            this.rightLength,
            this.leftLength,

            Utils.toRadians( this.leftTopAngle ),
            Utils.toRadians( this.rightTopAngle )
          );

          // wait for the update interval before setting positions to the sim again
          this.timeSinceUpdatingSim = 0;
        }
      }
    } );

    stepTimer.addListener( dt => {
      this.timeSinceUpdatingSim += dt;
    } );

    // Browser throws an error during fuzz tests that requires bluetooth connection to happen from user input.
    this.enabled = !phet.chipper.isFuzzEnabled();
  }

  /**
   * Uses web bluetooth API to connect to a particular device with matching service ID, and watches for changing
   * characteristics.
   */
  private async requestQuadDevice(): Promise<IntentionalAny> {

    // should be type BluetoothDevice, but it is too experimental for native types. There is no need to re-implement
    // typing of the bluetooth web API for this prototype code.
    let device: null | IntentionalAny;

    // @ts-expect-error - navigator.bluetooth is experimental and does not exist in the typing
    const bluetooth = navigator.bluetooth;

    if ( bluetooth ) {
      device = await bluetooth.requestDevice( REQUEST_DEVICE_OPTIONS ).catch( ( err: ErrorEvent ) => {
        device = null;
      } );
      if ( device ) {

        const gattServer = await device.gatt.connect().catch( ( err: DOMException ) => { console.error( err ); } );
        const primaryService = await gattServer.getPrimaryService( PRIMARY_SERVICE_ID ).catch( ( err: DOMException ) => { console.error( err ); } );

        const topLengthNotifier = await this.getCharacteristicNotifier( primaryService, TOP_LENGTH_CHARACTERISTIC_ID );
        topLengthNotifier.addEventListener( 'characteristicvaluechanged', ( event: Event ) => {
          this.topLength = this.getCharacteristicValue( event );
        } );

        const rightLengthNotifier = await this.getCharacteristicNotifier( primaryService, RIGHT_LENGTH_CHARACTERISTIC_ID );
        rightLengthNotifier.addEventListener( 'characteristicvaluechanged', ( event: Event ) => {
          this.rightLength = this.getCharacteristicValue( event );
        } );

        const leftLengthNotifier = await this.getCharacteristicNotifier( primaryService, LEFT_LENGTH_CHARACTERSTIC_ID );
        leftLengthNotifier.addEventListener( 'characteristicvaluechanged', ( event: Event ) => {
          this.leftLength = this.getCharacteristicValue( event );
        } );

        const leftTopAngleNotifier = await this.getCharacteristicNotifier( primaryService, LEFT_TOP_ANGLE_CHARACTERISTIC_ID );
        leftTopAngleNotifier.addEventListener( 'characteristicvaluechanged', ( event: Event ) => {
          this.leftTopAngle = this.getCharacteristicValue( event );
        } );

        const rightTopAngleNotifier = await this.getCharacteristicNotifier( primaryService, RIGHT_TOP_ANGLE_CHARACTERISTIC_ID );
        rightTopAngleNotifier.addEventListener( 'characteristicvaluechanged', ( event: Event ) => {
          this.rightTopAngle = this.getCharacteristicValue( event );

          // We should receive characteristic value updates in order as they change. If we receive this event,
          // we are done receiving values - notify it is time to update the sim.
          this.allDataCollectedEmitter.emit();
        } );

        this.tangibleConnectionModel.connectedToDeviceProperty.value = true;
      }
      else {

        // failure to connect to device
        this.tangibleConnectionModel.connectedToDeviceProperty.value = false;
      }
    }
  }

  /**
   * Returns a Promise to the BluetoothRemoteGATTCharacteristic instance to listen for changing values from the device.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTCharacteristic/startNotifications for
   * more information.
   */
  private async getCharacteristicNotifier( service: IntentionalAny, characteristicID: string ): Promise<IntentionalAny> {
    const characteristic = await service.getCharacteristic( characteristicID ).catch( ( err: DOMException ) => { console.error( err ); } );
    return characteristic.startNotifications().catch( ( err: DOMException ) => { console.error( err ); } );
  }

  /**
   * From a characteristicvaluechanged event, return the associated value.
   */
  private getCharacteristicValue( event: Event ): number {
    let value = 0;
    if ( event.target ) {

      // @ts-expect-error - Reasonable for this "experimental" web tech. event.target.value is defined for the
      // `characteristicvaluechanged` event of the Web Bluetooth API but lib.dom.d.ts doesn't have it yet. I believe
      // the type of target is https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTCharacteristic, but
      // haven't tested in a while.
      value = event.target.value.getFloat32( 0, true );
    }
    return value;
  }
}

quadrilateral.register( 'QuadrilateralBluetoothConnectionButton', QuadrilateralBluetoothConnectionButton );
