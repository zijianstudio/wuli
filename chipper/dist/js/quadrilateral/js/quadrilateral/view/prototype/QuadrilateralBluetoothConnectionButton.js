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
import QuadrilateralColors from '../../../QuadrilateralColors.js';
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
  filters: [{
    services: [PRIMARY_SERVICE_ID]
  }, {
    name: 'Arduino'
  }]
};
export default class QuadrilateralBluetoothConnectionButton extends TextPushButton {
  // Amount of time passed in ms since updating the simulation from bluetooth input. We wait at least every
  // QuadrilateralTangibleOptionsModel.bluetoothUpdateIntervalProperty.value in an attempt to filter out noise.
  timeSinceUpdatingSim = 0;
  allDataCollectedEmitter = new Emitter();
  // The values that we will receive from the device and forward to the simulation. These 5 values are sufficient to
  // recreate the geometry of the quadrilateral.
  topLength = 0;
  rightLength = 0;
  leftLength = 0;
  leftTopAngle = 0;
  rightTopAngle = 0;
  constructor(tangibleConnectionModel, tangibleController) {
    super('Pair BLE Device', {
      textNodeOptions: QuadrilateralConstants.SCREEN_TEXT_OPTIONS,
      baseColor: QuadrilateralColors.screenViewButtonColorProperty
    });
    this.tangibleConnectionModel = tangibleConnectionModel;
    this.addListener(this.requestQuadDevice.bind(this));
    this.allDataCollectedEmitter.addListener(() => {
      if (this.tangibleConnectionModel.isCalibratingProperty.value) {
        this.tangibleConnectionModel.setPhysicalModelBounds(this.topLength, this.rightLength, 0, this.leftLength);
      } else if (tangibleConnectionModel.physicalModelBoundsProperty.value) {
        // updateInterval is an attempt to filter out noise
        const updateInterval = tangibleConnectionModel.tangibleOptionsModel.bluetoothUpdateIntervalProperty.value;
        if (this.timeSinceUpdatingSim > updateInterval) {
          tangibleController.setPositionsFromLengthAndAngleData(this.topLength, this.rightLength, this.leftLength, Utils.toRadians(this.leftTopAngle), Utils.toRadians(this.rightTopAngle));

          // wait for the update interval before setting positions to the sim again
          this.timeSinceUpdatingSim = 0;
        }
      }
    });
    stepTimer.addListener(dt => {
      this.timeSinceUpdatingSim += dt;
    });

    // Browser throws an error during fuzz tests that requires bluetooth connection to happen from user input.
    this.enabled = !phet.chipper.isFuzzEnabled();
  }

  /**
   * Uses web bluetooth API to connect to a particular device with matching service ID, and watches for changing
   * characteristics.
   */
  async requestQuadDevice() {
    // should be type BluetoothDevice, but it is too experimental for native types. There is no need to re-implement
    // typing of the bluetooth web API for this prototype code.
    let device;

    // @ts-expect-error - navigator.bluetooth is experimental and does not exist in the typing
    const bluetooth = navigator.bluetooth;
    if (bluetooth) {
      device = await bluetooth.requestDevice(REQUEST_DEVICE_OPTIONS).catch(err => {
        device = null;
      });
      if (device) {
        const gattServer = await device.gatt.connect().catch(err => {
          console.error(err);
        });
        const primaryService = await gattServer.getPrimaryService(PRIMARY_SERVICE_ID).catch(err => {
          console.error(err);
        });
        const topLengthNotifier = await this.getCharacteristicNotifier(primaryService, TOP_LENGTH_CHARACTERISTIC_ID);
        topLengthNotifier.addEventListener('characteristicvaluechanged', event => {
          this.topLength = this.getCharacteristicValue(event);
        });
        const rightLengthNotifier = await this.getCharacteristicNotifier(primaryService, RIGHT_LENGTH_CHARACTERISTIC_ID);
        rightLengthNotifier.addEventListener('characteristicvaluechanged', event => {
          this.rightLength = this.getCharacteristicValue(event);
        });
        const leftLengthNotifier = await this.getCharacteristicNotifier(primaryService, LEFT_LENGTH_CHARACTERSTIC_ID);
        leftLengthNotifier.addEventListener('characteristicvaluechanged', event => {
          this.leftLength = this.getCharacteristicValue(event);
        });
        const leftTopAngleNotifier = await this.getCharacteristicNotifier(primaryService, LEFT_TOP_ANGLE_CHARACTERISTIC_ID);
        leftTopAngleNotifier.addEventListener('characteristicvaluechanged', event => {
          this.leftTopAngle = this.getCharacteristicValue(event);
        });
        const rightTopAngleNotifier = await this.getCharacteristicNotifier(primaryService, RIGHT_TOP_ANGLE_CHARACTERISTIC_ID);
        rightTopAngleNotifier.addEventListener('characteristicvaluechanged', event => {
          this.rightTopAngle = this.getCharacteristicValue(event);

          // We should receive characteristic value updates in order as they change. If we receive this event,
          // we are done receiving values - notify it is time to update the sim.
          this.allDataCollectedEmitter.emit();
        });
        this.tangibleConnectionModel.connectedToDeviceProperty.value = true;
      } else {
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
  async getCharacteristicNotifier(service, characteristicID) {
    const characteristic = await service.getCharacteristic(characteristicID).catch(err => {
      console.error(err);
    });
    return characteristic.startNotifications().catch(err => {
      console.error(err);
    });
  }

  /**
   * From a characteristicvaluechanged event, return the associated value.
   */
  getCharacteristicValue(event) {
    let value = 0;
    if (event.target) {
      // @ts-expect-error - Reasonable for this "experimental" web tech. event.target.value is defined for the
      // `characteristicvaluechanged` event of the Web Bluetooth API but lib.dom.d.ts doesn't have it yet. I believe
      // the type of target is https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTCharacteristic, but
      // haven't tested in a while.
      value = event.target.value.getFloat32(0, true);
    }
    return value;
  }
}
quadrilateral.register('QuadrilateralBluetoothConnectionButton', QuadrilateralBluetoothConnectionButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJxdWFkcmlsYXRlcmFsIiwiVGV4dFB1c2hCdXR0b24iLCJRdWFkcmlsYXRlcmFsQ29uc3RhbnRzIiwiVXRpbHMiLCJFbWl0dGVyIiwic3RlcFRpbWVyIiwiUXVhZHJpbGF0ZXJhbENvbG9ycyIsIlBSSU1BUllfU0VSVklDRV9JRCIsIlRPUF9MRU5HVEhfQ0hBUkFDVEVSSVNUSUNfSUQiLCJSSUdIVF9MRU5HVEhfQ0hBUkFDVEVSSVNUSUNfSUQiLCJMRUZUX0xFTkdUSF9DSEFSQUNURVJTVElDX0lEIiwiTEVGVF9UT1BfQU5HTEVfQ0hBUkFDVEVSSVNUSUNfSUQiLCJSSUdIVF9UT1BfQU5HTEVfQ0hBUkFDVEVSSVNUSUNfSUQiLCJSRVFVRVNUX0RFVklDRV9PUFRJT05TIiwiZmlsdGVycyIsInNlcnZpY2VzIiwibmFtZSIsIlF1YWRyaWxhdGVyYWxCbHVldG9vdGhDb25uZWN0aW9uQnV0dG9uIiwidGltZVNpbmNlVXBkYXRpbmdTaW0iLCJhbGxEYXRhQ29sbGVjdGVkRW1pdHRlciIsInRvcExlbmd0aCIsInJpZ2h0TGVuZ3RoIiwibGVmdExlbmd0aCIsImxlZnRUb3BBbmdsZSIsInJpZ2h0VG9wQW5nbGUiLCJjb25zdHJ1Y3RvciIsInRhbmdpYmxlQ29ubmVjdGlvbk1vZGVsIiwidGFuZ2libGVDb250cm9sbGVyIiwidGV4dE5vZGVPcHRpb25zIiwiU0NSRUVOX1RFWFRfT1BUSU9OUyIsImJhc2VDb2xvciIsInNjcmVlblZpZXdCdXR0b25Db2xvclByb3BlcnR5IiwiYWRkTGlzdGVuZXIiLCJyZXF1ZXN0UXVhZERldmljZSIsImJpbmQiLCJpc0NhbGlicmF0aW5nUHJvcGVydHkiLCJ2YWx1ZSIsInNldFBoeXNpY2FsTW9kZWxCb3VuZHMiLCJwaHlzaWNhbE1vZGVsQm91bmRzUHJvcGVydHkiLCJ1cGRhdGVJbnRlcnZhbCIsInRhbmdpYmxlT3B0aW9uc01vZGVsIiwiYmx1ZXRvb3RoVXBkYXRlSW50ZXJ2YWxQcm9wZXJ0eSIsInNldFBvc2l0aW9uc0Zyb21MZW5ndGhBbmRBbmdsZURhdGEiLCJ0b1JhZGlhbnMiLCJkdCIsImVuYWJsZWQiLCJwaGV0IiwiY2hpcHBlciIsImlzRnV6ekVuYWJsZWQiLCJkZXZpY2UiLCJibHVldG9vdGgiLCJuYXZpZ2F0b3IiLCJyZXF1ZXN0RGV2aWNlIiwiY2F0Y2giLCJlcnIiLCJnYXR0U2VydmVyIiwiZ2F0dCIsImNvbm5lY3QiLCJjb25zb2xlIiwiZXJyb3IiLCJwcmltYXJ5U2VydmljZSIsImdldFByaW1hcnlTZXJ2aWNlIiwidG9wTGVuZ3RoTm90aWZpZXIiLCJnZXRDaGFyYWN0ZXJpc3RpY05vdGlmaWVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwiZ2V0Q2hhcmFjdGVyaXN0aWNWYWx1ZSIsInJpZ2h0TGVuZ3RoTm90aWZpZXIiLCJsZWZ0TGVuZ3RoTm90aWZpZXIiLCJsZWZ0VG9wQW5nbGVOb3RpZmllciIsInJpZ2h0VG9wQW5nbGVOb3RpZmllciIsImVtaXQiLCJjb25uZWN0ZWRUb0RldmljZVByb3BlcnR5Iiwic2VydmljZSIsImNoYXJhY3RlcmlzdGljSUQiLCJjaGFyYWN0ZXJpc3RpYyIsImdldENoYXJhY3RlcmlzdGljIiwic3RhcnROb3RpZmljYXRpb25zIiwidGFyZ2V0IiwiZ2V0RmxvYXQzMiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUXVhZHJpbGF0ZXJhbEJsdWV0b290aENvbm5lY3Rpb25CdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVG8gdGVzdCBjb25uZWN0aW5nIHRvIGEgYmx1ZXRvb3RoIGRldmljZSB1c2luZyB3ZWIgYmx1ZXRvb3RoLiBUaGlzIGNvZGUgd2FzIHdyaXR0ZW4gaW4gY29sbGFib3JhdGlvbiB3aXRoIFNjb3R0XHJcbiAqIExhbWJlcnQgZnJvbSBTTFUsIHdobyBidWlsdCB0aGUgdGFuZ2libGUgaGFyZHdhcmUgYW5kIGJsdWV0b290aCBkZXZpY2UuXHJcbiAqXHJcbiAqIE5PVEU6IHRoaXMgdXNlcyBQcm9taXNlcyAoYXMgdGhlIGJsdWV0b290aCBBUEkgd29ya3Mgd2l0aCBwcm9taXNlcykgd2hpY2ggaXMgdmVyeSB1bnVzdWFsIGZvciBzaW11bGF0aW9uIGNvZGUuXHJcbiAqXHJcbiAqIE5PVEU6IEludGVudGlvbmFsQW55IGlzIHVzZWQgYSBsb3QgaW4gdGhpcyBmaWxlIC0gdGhlIFdlYiBCbHVldG9vdGggQVBJIGlzIG5vdCBhdmFpbGFibGUgeWV0IGluIG5hdGl2ZSB0eXBlcy4gU2luY2VcclxuICogdGhpcyBpcyBwcm90b3R5cGUgY29kZSwgaXQgaXNuJ3Qgd29ydGggZnVydGhlciBpbnZlc3RpZ2F0aW9uLlxyXG4gKlxyXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCBXZWIgQmx1ZXRvb3RoIEFQSSwgcGxlYXNlIHNlZVxyXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2ViX0JsdWV0b290aF9BUEkuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuaW1wb3J0IHF1YWRyaWxhdGVyYWwgZnJvbSAnLi4vLi4vLi4vcXVhZHJpbGF0ZXJhbC5qcyc7XHJcbmltcG9ydCBUZXh0UHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9UZXh0UHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBRdWFkcmlsYXRlcmFsQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uL1F1YWRyaWxhdGVyYWxDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XHJcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xyXG5pbXBvcnQgUXVhZHJpbGF0ZXJhbENvbG9ycyBmcm9tICcuLi8uLi8uLi9RdWFkcmlsYXRlcmFsQ29sb3JzLmpzJztcclxuaW1wb3J0IFRhbmdpYmxlQ29ubmVjdGlvbk1vZGVsIGZyb20gJy4uLy4uL21vZGVsL3Byb3RvdHlwZS9UYW5naWJsZUNvbm5lY3Rpb25Nb2RlbC5qcyc7XHJcbmltcG9ydCBRdWFkcmlsYXRlcmFsVGFuZ2libGVDb250cm9sbGVyIGZyb20gJy4vUXVhZHJpbGF0ZXJhbFRhbmdpYmxlQ29udHJvbGxlci5qcyc7XHJcblxyXG4vLyBJRHMgdG8gdGhlIEJMRSBzZXJ2aWNlIGFuZCBzcGVjaWZpYyBjaGFyYWN0ZXJpc3RpY3MgKGNoYW5uZWxzIHByb3ZpZGluZyB2YWx1ZXMgZnJvbSBzZW5zb3JzKSBvZiB0aGUgZGV2aWNlIC0gdGhlc2VcclxuLy8gd2VyZSBwcm92aWRlZCBieSBTY290dCBMYW1iZXJ0IGF0IFNMVSB3aG8gYnVpbHQgdGhlIHRhbmdpYmxlIGRldmljZS5cclxuY29uc3QgUFJJTUFSWV9TRVJWSUNFX0lEID0gJzE5YjEwMDEwLWU4ZjItNTM3ZS00ZjZjLWQxMDQ3NjhhMTIxNCc7XHJcbmNvbnN0IFRPUF9MRU5HVEhfQ0hBUkFDVEVSSVNUSUNfSUQgPSAnMTliMTAwMTAtZThmMi01MzdlLTRmNmMtZDEwNDc2OGExMjE0JzsgLy8gV2h5IGlzIGl0IHRoZSBzYW1lIGFzIHNlcnZpY2UgSUQ/XHJcbmNvbnN0IFJJR0hUX0xFTkdUSF9DSEFSQUNURVJJU1RJQ19JRCA9ICcxOWIxMDAxMC1lOGYyLTUzN2UtNGY2Yy1kMTA0NzY4YTEyMTUnO1xyXG5jb25zdCBMRUZUX0xFTkdUSF9DSEFSQUNURVJTVElDX0lEID0gJzE5YjEwMDEwLWU4ZjItNTM3ZS00ZjZjLWQxMDQ3NjhhMTIxNic7XHJcbmNvbnN0IExFRlRfVE9QX0FOR0xFX0NIQVJBQ1RFUklTVElDX0lEID0gJzE5YjEwMDEwLWU4ZjItNTM3ZS00ZjZjLWQxMDQ3NjhhMTIxNyc7XHJcbmNvbnN0IFJJR0hUX1RPUF9BTkdMRV9DSEFSQUNURVJJU1RJQ19JRCA9ICcxOWIxMDAxMC1lOGYyLTUzN2UtNGY2Yy1kMTA0NzY4YTEyMTgnO1xyXG5cclxuLy8gVGhlIGJsdWV0b290aCBvcHRpb25zIGZvciB0aGUgcmVxdWVzdERldmljZSBjYWxsLiBUaGVyZSBtdXN0IGJlIGF0IGxlYXN0IG9uZSBlbnRyeSBpbiBmaWx0ZXJzIGZvciB0aGUgYnJvd3NlclxyXG4vLyB0byBtYWtlIGEgcmVxdWVzdCFcclxuY29uc3QgUkVRVUVTVF9ERVZJQ0VfT1BUSU9OUyA9IHtcclxuICBmaWx0ZXJzOiBbXHJcbiAgICB7IHNlcnZpY2VzOiBbIFBSSU1BUllfU0VSVklDRV9JRCBdIH0sXHJcbiAgICB7IG5hbWU6ICdBcmR1aW5vJyB9XHJcbiAgXVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUXVhZHJpbGF0ZXJhbEJsdWV0b290aENvbm5lY3Rpb25CdXR0b24gZXh0ZW5kcyBUZXh0UHVzaEJ1dHRvbiB7XHJcblxyXG4gIC8vIEFtb3VudCBvZiB0aW1lIHBhc3NlZCBpbiBtcyBzaW5jZSB1cGRhdGluZyB0aGUgc2ltdWxhdGlvbiBmcm9tIGJsdWV0b290aCBpbnB1dC4gV2Ugd2FpdCBhdCBsZWFzdCBldmVyeVxyXG4gIC8vIFF1YWRyaWxhdGVyYWxUYW5naWJsZU9wdGlvbnNNb2RlbC5ibHVldG9vdGhVcGRhdGVJbnRlcnZhbFByb3BlcnR5LnZhbHVlIGluIGFuIGF0dGVtcHQgdG8gZmlsdGVyIG91dCBub2lzZS5cclxuICBwcml2YXRlIHRpbWVTaW5jZVVwZGF0aW5nU2ltID0gMDtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IGFsbERhdGFDb2xsZWN0ZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSB0YW5naWJsZUNvbm5lY3Rpb25Nb2RlbDogVGFuZ2libGVDb25uZWN0aW9uTW9kZWw7XHJcblxyXG4gIC8vIFRoZSB2YWx1ZXMgdGhhdCB3ZSB3aWxsIHJlY2VpdmUgZnJvbSB0aGUgZGV2aWNlIGFuZCBmb3J3YXJkIHRvIHRoZSBzaW11bGF0aW9uLiBUaGVzZSA1IHZhbHVlcyBhcmUgc3VmZmljaWVudCB0b1xyXG4gIC8vIHJlY3JlYXRlIHRoZSBnZW9tZXRyeSBvZiB0aGUgcXVhZHJpbGF0ZXJhbC5cclxuICBwcml2YXRlIHRvcExlbmd0aCA9IDA7XHJcbiAgcHJpdmF0ZSByaWdodExlbmd0aCA9IDA7XHJcbiAgcHJpdmF0ZSBsZWZ0TGVuZ3RoID0gMDtcclxuICBwcml2YXRlIGxlZnRUb3BBbmdsZSA9IDA7XHJcbiAgcHJpdmF0ZSByaWdodFRvcEFuZ2xlID0gMDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0YW5naWJsZUNvbm5lY3Rpb25Nb2RlbDogVGFuZ2libGVDb25uZWN0aW9uTW9kZWwsIHRhbmdpYmxlQ29udHJvbGxlcjogUXVhZHJpbGF0ZXJhbFRhbmdpYmxlQ29udHJvbGxlciApIHtcclxuXHJcbiAgICBzdXBlciggJ1BhaXIgQkxFIERldmljZScsIHtcclxuICAgICAgdGV4dE5vZGVPcHRpb25zOiBRdWFkcmlsYXRlcmFsQ29uc3RhbnRzLlNDUkVFTl9URVhUX09QVElPTlMsXHJcbiAgICAgIGJhc2VDb2xvcjogUXVhZHJpbGF0ZXJhbENvbG9ycy5zY3JlZW5WaWV3QnV0dG9uQ29sb3JQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudGFuZ2libGVDb25uZWN0aW9uTW9kZWwgPSB0YW5naWJsZUNvbm5lY3Rpb25Nb2RlbDtcclxuXHJcbiAgICB0aGlzLmFkZExpc3RlbmVyKCB0aGlzLnJlcXVlc3RRdWFkRGV2aWNlLmJpbmQoIHRoaXMgKSApO1xyXG5cclxuICAgIHRoaXMuYWxsRGF0YUNvbGxlY3RlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgaWYgKCB0aGlzLnRhbmdpYmxlQ29ubmVjdGlvbk1vZGVsLmlzQ2FsaWJyYXRpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICB0aGlzLnRhbmdpYmxlQ29ubmVjdGlvbk1vZGVsLnNldFBoeXNpY2FsTW9kZWxCb3VuZHMoIHRoaXMudG9wTGVuZ3RoLCB0aGlzLnJpZ2h0TGVuZ3RoLCAwLCB0aGlzLmxlZnRMZW5ndGggKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggdGFuZ2libGVDb25uZWN0aW9uTW9kZWwucGh5c2ljYWxNb2RlbEJvdW5kc1Byb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgICAvLyB1cGRhdGVJbnRlcnZhbCBpcyBhbiBhdHRlbXB0IHRvIGZpbHRlciBvdXQgbm9pc2VcclxuICAgICAgICBjb25zdCB1cGRhdGVJbnRlcnZhbCA9IHRhbmdpYmxlQ29ubmVjdGlvbk1vZGVsLnRhbmdpYmxlT3B0aW9uc01vZGVsLmJsdWV0b290aFVwZGF0ZUludGVydmFsUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgaWYgKCB0aGlzLnRpbWVTaW5jZVVwZGF0aW5nU2ltID4gdXBkYXRlSW50ZXJ2YWwgKSB7XHJcbiAgICAgICAgICB0YW5naWJsZUNvbnRyb2xsZXIuc2V0UG9zaXRpb25zRnJvbUxlbmd0aEFuZEFuZ2xlRGF0YShcclxuICAgICAgICAgICAgdGhpcy50b3BMZW5ndGgsXHJcbiAgICAgICAgICAgIHRoaXMucmlnaHRMZW5ndGgsXHJcbiAgICAgICAgICAgIHRoaXMubGVmdExlbmd0aCxcclxuXHJcbiAgICAgICAgICAgIFV0aWxzLnRvUmFkaWFucyggdGhpcy5sZWZ0VG9wQW5nbGUgKSxcclxuICAgICAgICAgICAgVXRpbHMudG9SYWRpYW5zKCB0aGlzLnJpZ2h0VG9wQW5nbGUgKVxyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAvLyB3YWl0IGZvciB0aGUgdXBkYXRlIGludGVydmFsIGJlZm9yZSBzZXR0aW5nIHBvc2l0aW9ucyB0byB0aGUgc2ltIGFnYWluXHJcbiAgICAgICAgICB0aGlzLnRpbWVTaW5jZVVwZGF0aW5nU2ltID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBzdGVwVGltZXIuYWRkTGlzdGVuZXIoIGR0ID0+IHtcclxuICAgICAgdGhpcy50aW1lU2luY2VVcGRhdGluZ1NpbSArPSBkdDtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBCcm93c2VyIHRocm93cyBhbiBlcnJvciBkdXJpbmcgZnV6eiB0ZXN0cyB0aGF0IHJlcXVpcmVzIGJsdWV0b290aCBjb25uZWN0aW9uIHRvIGhhcHBlbiBmcm9tIHVzZXIgaW5wdXQuXHJcbiAgICB0aGlzLmVuYWJsZWQgPSAhcGhldC5jaGlwcGVyLmlzRnV6ekVuYWJsZWQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVzZXMgd2ViIGJsdWV0b290aCBBUEkgdG8gY29ubmVjdCB0byBhIHBhcnRpY3VsYXIgZGV2aWNlIHdpdGggbWF0Y2hpbmcgc2VydmljZSBJRCwgYW5kIHdhdGNoZXMgZm9yIGNoYW5naW5nXHJcbiAgICogY2hhcmFjdGVyaXN0aWNzLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcmVxdWVzdFF1YWREZXZpY2UoKTogUHJvbWlzZTxJbnRlbnRpb25hbEFueT4ge1xyXG5cclxuICAgIC8vIHNob3VsZCBiZSB0eXBlIEJsdWV0b290aERldmljZSwgYnV0IGl0IGlzIHRvbyBleHBlcmltZW50YWwgZm9yIG5hdGl2ZSB0eXBlcy4gVGhlcmUgaXMgbm8gbmVlZCB0byByZS1pbXBsZW1lbnRcclxuICAgIC8vIHR5cGluZyBvZiB0aGUgYmx1ZXRvb3RoIHdlYiBBUEkgZm9yIHRoaXMgcHJvdG90eXBlIGNvZGUuXHJcbiAgICBsZXQgZGV2aWNlOiBudWxsIHwgSW50ZW50aW9uYWxBbnk7XHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5hdmlnYXRvci5ibHVldG9vdGggaXMgZXhwZXJpbWVudGFsIGFuZCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgdHlwaW5nXHJcbiAgICBjb25zdCBibHVldG9vdGggPSBuYXZpZ2F0b3IuYmx1ZXRvb3RoO1xyXG5cclxuICAgIGlmICggYmx1ZXRvb3RoICkge1xyXG4gICAgICBkZXZpY2UgPSBhd2FpdCBibHVldG9vdGgucmVxdWVzdERldmljZSggUkVRVUVTVF9ERVZJQ0VfT1BUSU9OUyApLmNhdGNoKCAoIGVycjogRXJyb3JFdmVudCApID0+IHtcclxuICAgICAgICBkZXZpY2UgPSBudWxsO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGlmICggZGV2aWNlICkge1xyXG5cclxuICAgICAgICBjb25zdCBnYXR0U2VydmVyID0gYXdhaXQgZGV2aWNlLmdhdHQuY29ubmVjdCgpLmNhdGNoKCAoIGVycjogRE9NRXhjZXB0aW9uICkgPT4geyBjb25zb2xlLmVycm9yKCBlcnIgKTsgfSApO1xyXG4gICAgICAgIGNvbnN0IHByaW1hcnlTZXJ2aWNlID0gYXdhaXQgZ2F0dFNlcnZlci5nZXRQcmltYXJ5U2VydmljZSggUFJJTUFSWV9TRVJWSUNFX0lEICkuY2F0Y2goICggZXJyOiBET01FeGNlcHRpb24gKSA9PiB7IGNvbnNvbGUuZXJyb3IoIGVyciApOyB9ICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHRvcExlbmd0aE5vdGlmaWVyID0gYXdhaXQgdGhpcy5nZXRDaGFyYWN0ZXJpc3RpY05vdGlmaWVyKCBwcmltYXJ5U2VydmljZSwgVE9QX0xFTkdUSF9DSEFSQUNURVJJU1RJQ19JRCApO1xyXG4gICAgICAgIHRvcExlbmd0aE5vdGlmaWVyLmFkZEV2ZW50TGlzdGVuZXIoICdjaGFyYWN0ZXJpc3RpY3ZhbHVlY2hhbmdlZCcsICggZXZlbnQ6IEV2ZW50ICkgPT4ge1xyXG4gICAgICAgICAgdGhpcy50b3BMZW5ndGggPSB0aGlzLmdldENoYXJhY3RlcmlzdGljVmFsdWUoIGV2ZW50ICk7XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICBjb25zdCByaWdodExlbmd0aE5vdGlmaWVyID0gYXdhaXQgdGhpcy5nZXRDaGFyYWN0ZXJpc3RpY05vdGlmaWVyKCBwcmltYXJ5U2VydmljZSwgUklHSFRfTEVOR1RIX0NIQVJBQ1RFUklTVElDX0lEICk7XHJcbiAgICAgICAgcmlnaHRMZW5ndGhOb3RpZmllci5hZGRFdmVudExpc3RlbmVyKCAnY2hhcmFjdGVyaXN0aWN2YWx1ZWNoYW5nZWQnLCAoIGV2ZW50OiBFdmVudCApID0+IHtcclxuICAgICAgICAgIHRoaXMucmlnaHRMZW5ndGggPSB0aGlzLmdldENoYXJhY3RlcmlzdGljVmFsdWUoIGV2ZW50ICk7XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICBjb25zdCBsZWZ0TGVuZ3RoTm90aWZpZXIgPSBhd2FpdCB0aGlzLmdldENoYXJhY3RlcmlzdGljTm90aWZpZXIoIHByaW1hcnlTZXJ2aWNlLCBMRUZUX0xFTkdUSF9DSEFSQUNURVJTVElDX0lEICk7XHJcbiAgICAgICAgbGVmdExlbmd0aE5vdGlmaWVyLmFkZEV2ZW50TGlzdGVuZXIoICdjaGFyYWN0ZXJpc3RpY3ZhbHVlY2hhbmdlZCcsICggZXZlbnQ6IEV2ZW50ICkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5sZWZ0TGVuZ3RoID0gdGhpcy5nZXRDaGFyYWN0ZXJpc3RpY1ZhbHVlKCBldmVudCApO1xyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgY29uc3QgbGVmdFRvcEFuZ2xlTm90aWZpZXIgPSBhd2FpdCB0aGlzLmdldENoYXJhY3RlcmlzdGljTm90aWZpZXIoIHByaW1hcnlTZXJ2aWNlLCBMRUZUX1RPUF9BTkdMRV9DSEFSQUNURVJJU1RJQ19JRCApO1xyXG4gICAgICAgIGxlZnRUb3BBbmdsZU5vdGlmaWVyLmFkZEV2ZW50TGlzdGVuZXIoICdjaGFyYWN0ZXJpc3RpY3ZhbHVlY2hhbmdlZCcsICggZXZlbnQ6IEV2ZW50ICkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5sZWZ0VG9wQW5nbGUgPSB0aGlzLmdldENoYXJhY3RlcmlzdGljVmFsdWUoIGV2ZW50ICk7XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICBjb25zdCByaWdodFRvcEFuZ2xlTm90aWZpZXIgPSBhd2FpdCB0aGlzLmdldENoYXJhY3RlcmlzdGljTm90aWZpZXIoIHByaW1hcnlTZXJ2aWNlLCBSSUdIVF9UT1BfQU5HTEVfQ0hBUkFDVEVSSVNUSUNfSUQgKTtcclxuICAgICAgICByaWdodFRvcEFuZ2xlTm90aWZpZXIuYWRkRXZlbnRMaXN0ZW5lciggJ2NoYXJhY3RlcmlzdGljdmFsdWVjaGFuZ2VkJywgKCBldmVudDogRXZlbnQgKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnJpZ2h0VG9wQW5nbGUgPSB0aGlzLmdldENoYXJhY3RlcmlzdGljVmFsdWUoIGV2ZW50ICk7XHJcblxyXG4gICAgICAgICAgLy8gV2Ugc2hvdWxkIHJlY2VpdmUgY2hhcmFjdGVyaXN0aWMgdmFsdWUgdXBkYXRlcyBpbiBvcmRlciBhcyB0aGV5IGNoYW5nZS4gSWYgd2UgcmVjZWl2ZSB0aGlzIGV2ZW50LFxyXG4gICAgICAgICAgLy8gd2UgYXJlIGRvbmUgcmVjZWl2aW5nIHZhbHVlcyAtIG5vdGlmeSBpdCBpcyB0aW1lIHRvIHVwZGF0ZSB0aGUgc2ltLlxyXG4gICAgICAgICAgdGhpcy5hbGxEYXRhQ29sbGVjdGVkRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICB0aGlzLnRhbmdpYmxlQ29ubmVjdGlvbk1vZGVsLmNvbm5lY3RlZFRvRGV2aWNlUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBmYWlsdXJlIHRvIGNvbm5lY3QgdG8gZGV2aWNlXHJcbiAgICAgICAgdGhpcy50YW5naWJsZUNvbm5lY3Rpb25Nb2RlbC5jb25uZWN0ZWRUb0RldmljZVByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBQcm9taXNlIHRvIHRoZSBCbHVldG9vdGhSZW1vdGVHQVRUQ2hhcmFjdGVyaXN0aWMgaW5zdGFuY2UgdG8gbGlzdGVuIGZvciBjaGFuZ2luZyB2YWx1ZXMgZnJvbSB0aGUgZGV2aWNlLlxyXG4gICAqXHJcbiAgICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9CbHVldG9vdGhSZW1vdGVHQVRUQ2hhcmFjdGVyaXN0aWMvc3RhcnROb3RpZmljYXRpb25zIGZvclxyXG4gICAqIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhc3luYyBnZXRDaGFyYWN0ZXJpc3RpY05vdGlmaWVyKCBzZXJ2aWNlOiBJbnRlbnRpb25hbEFueSwgY2hhcmFjdGVyaXN0aWNJRDogc3RyaW5nICk6IFByb21pc2U8SW50ZW50aW9uYWxBbnk+IHtcclxuICAgIGNvbnN0IGNoYXJhY3RlcmlzdGljID0gYXdhaXQgc2VydmljZS5nZXRDaGFyYWN0ZXJpc3RpYyggY2hhcmFjdGVyaXN0aWNJRCApLmNhdGNoKCAoIGVycjogRE9NRXhjZXB0aW9uICkgPT4geyBjb25zb2xlLmVycm9yKCBlcnIgKTsgfSApO1xyXG4gICAgcmV0dXJuIGNoYXJhY3RlcmlzdGljLnN0YXJ0Tm90aWZpY2F0aW9ucygpLmNhdGNoKCAoIGVycjogRE9NRXhjZXB0aW9uICkgPT4geyBjb25zb2xlLmVycm9yKCBlcnIgKTsgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnJvbSBhIGNoYXJhY3RlcmlzdGljdmFsdWVjaGFuZ2VkIGV2ZW50LCByZXR1cm4gdGhlIGFzc29jaWF0ZWQgdmFsdWUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRDaGFyYWN0ZXJpc3RpY1ZhbHVlKCBldmVudDogRXZlbnQgKTogbnVtYmVyIHtcclxuICAgIGxldCB2YWx1ZSA9IDA7XHJcbiAgICBpZiAoIGV2ZW50LnRhcmdldCApIHtcclxuXHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBSZWFzb25hYmxlIGZvciB0aGlzIFwiZXhwZXJpbWVudGFsXCIgd2ViIHRlY2guIGV2ZW50LnRhcmdldC52YWx1ZSBpcyBkZWZpbmVkIGZvciB0aGVcclxuICAgICAgLy8gYGNoYXJhY3RlcmlzdGljdmFsdWVjaGFuZ2VkYCBldmVudCBvZiB0aGUgV2ViIEJsdWV0b290aCBBUEkgYnV0IGxpYi5kb20uZC50cyBkb2Vzbid0IGhhdmUgaXQgeWV0LiBJIGJlbGlldmVcclxuICAgICAgLy8gdGhlIHR5cGUgb2YgdGFyZ2V0IGlzIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9CbHVldG9vdGhSZW1vdGVHQVRUQ2hhcmFjdGVyaXN0aWMsIGJ1dFxyXG4gICAgICAvLyBoYXZlbid0IHRlc3RlZCBpbiBhIHdoaWxlLlxyXG4gICAgICB2YWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZS5nZXRGbG9hdDMyKCAwLCB0cnVlICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbiAgfVxyXG59XHJcblxyXG5xdWFkcmlsYXRlcmFsLnJlZ2lzdGVyKCAnUXVhZHJpbGF0ZXJhbEJsdWV0b290aENvbm5lY3Rpb25CdXR0b24nLCBRdWFkcmlsYXRlcmFsQmx1ZXRvb3RoQ29ubmVjdGlvbkJ1dHRvbiApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPQSxhQUFhLE1BQU0sMkJBQTJCO0FBQ3JELE9BQU9DLGNBQWMsTUFBTSxpREFBaUQ7QUFDNUUsT0FBT0Msc0JBQXNCLE1BQU0sb0NBQW9DO0FBQ3ZFLE9BQU9DLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsT0FBT0MsT0FBTyxNQUFNLG1DQUFtQztBQUN2RCxPQUFPQyxTQUFTLE1BQU0scUNBQXFDO0FBRTNELE9BQU9DLG1CQUFtQixNQUFNLGlDQUFpQztB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