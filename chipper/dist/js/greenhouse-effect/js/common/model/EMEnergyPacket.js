// Copyright 2021-2022, University of Colorado Boulder

/**
 * EMEnergyPacket models a packet or bundle of electromagnetic energy.  It's kind of like a really big photon.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import EnumerationIO from '../../../../tandem/js/types/EnumerationIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectConstants from '../GreenhouseEffectConstants.js';
import EnergyDirection from './EnergyDirection.js';
class EMEnergyPacket {
  // wavelength of the energy in this packet, in meters

  // energy in this packet, in joules

  // altitude in meters

  // direction in which this energy is moving

  /**
   * @param wavelength - in meters
   * @param energy - in joules
   * @param initialAltitude - in meters
   * @param direction
   */
  constructor(wavelength, energy, initialAltitude, direction) {
    this.wavelength = wavelength;
    this.energy = energy;
    this.altitude = initialAltitude;
    this.previousAltitude = initialAltitude;
    this.direction = direction;
  }

  /**
   * convenience method for determining whether the EM energy contained in this packet is in the visible light range
   */
  get isVisible() {
    return this.wavelength === GreenhouseEffectConstants.VISIBLE_WAVELENGTH;
  }

  /**
   * convenience method for determining whether the EM energy contained in this packet is in the infrared light range
   */
  get isInfrared() {
    return this.wavelength === GreenhouseEffectConstants.INFRARED_WAVELENGTH;
  }

  /**
   * @param dt - delta time, in seconds
   */
  step(dt) {
    this.previousAltitude = this.altitude;
    if (this.direction === EnergyDirection.UP) {
      this.altitude += dt * GreenhouseEffectConstants.SPEED_OF_LIGHT;
    } else {
      this.altitude -= dt * GreenhouseEffectConstants.SPEED_OF_LIGHT;
    }
  }

  /**
   * Serializes this EMEnergyPacket instance.
   */
  toStateObject() {
    return {
      wavelength: this.wavelength,
      energy: this.energy,
      altitude: this.altitude,
      previousAltitude: this.previousAltitude,
      direction: EnumerationIO(EnergyDirection).toStateObject(this.direction)
    };
  }

  /**
   * EMEnergyPacketIO handles PhET-iO serialization of EMEnergyPacket. Because serialization involves accessing private
   * members, it delegates to EMEnergyPacket. The methods that EMEnergyPacketIO overrides are typical of 'Dynamic element
   * serialization', as described in the Serialization section of
   * https://github.com/phetsims/phet-io/blob/master/doc/phet-io-instrumentation-technical-guide.md#serialization
   */
  static EMEnergyPacketIO = new IOType('EMEnergyPacketIO', {
    valueType: EMEnergyPacket,
    stateSchema: {
      wavelength: NumberIO,
      energy: NumberIO,
      altitude: NumberIO,
      previousAltitude: NumberIO,
      direction: EnumerationIO(EnergyDirection)
    },
    fromStateObject: stateObject => {
      const emEnergyPacket = new EMEnergyPacket(stateObject.wavelength, stateObject.energy, stateObject.altitude, EnumerationIO(EnergyDirection).fromStateObject(stateObject.direction));
      emEnergyPacket.previousAltitude = stateObject.previousAltitude;
      return emEnergyPacket;
    },
    toStateObject: coreObject => coreObject.toStateObject()
  });
}
greenhouseEffect.register('EMEnergyPacket', EMEnergyPacket);
export default EMEnergyPacket;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbklPIiwiSU9UeXBlIiwiTnVtYmVySU8iLCJncmVlbmhvdXNlRWZmZWN0IiwiR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cyIsIkVuZXJneURpcmVjdGlvbiIsIkVNRW5lcmd5UGFja2V0IiwiY29uc3RydWN0b3IiLCJ3YXZlbGVuZ3RoIiwiZW5lcmd5IiwiaW5pdGlhbEFsdGl0dWRlIiwiZGlyZWN0aW9uIiwiYWx0aXR1ZGUiLCJwcmV2aW91c0FsdGl0dWRlIiwiaXNWaXNpYmxlIiwiVklTSUJMRV9XQVZFTEVOR1RIIiwiaXNJbmZyYXJlZCIsIklORlJBUkVEX1dBVkVMRU5HVEgiLCJzdGVwIiwiZHQiLCJVUCIsIlNQRUVEX09GX0xJR0hUIiwidG9TdGF0ZU9iamVjdCIsIkVNRW5lcmd5UGFja2V0SU8iLCJ2YWx1ZVR5cGUiLCJzdGF0ZVNjaGVtYSIsImZyb21TdGF0ZU9iamVjdCIsInN0YXRlT2JqZWN0IiwiZW1FbmVyZ3lQYWNrZXQiLCJjb3JlT2JqZWN0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFTUVuZXJneVBhY2tldC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBFTUVuZXJneVBhY2tldCBtb2RlbHMgYSBwYWNrZXQgb3IgYnVuZGxlIG9mIGVsZWN0cm9tYWduZXRpYyBlbmVyZ3kuICBJdCdzIGtpbmQgb2YgbGlrZSBhIHJlYWxseSBiaWcgcGhvdG9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvbklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9FbnVtZXJhdGlvbklPLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0IGZyb20gJy4uLy4uL2dyZWVuaG91c2VFZmZlY3QuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cyBmcm9tICcuLi9HcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEVuZXJneURpcmVjdGlvbiBmcm9tICcuL0VuZXJneURpcmVjdGlvbi5qcyc7XHJcblxyXG5jbGFzcyBFTUVuZXJneVBhY2tldCB7XHJcblxyXG4gIC8vIHdhdmVsZW5ndGggb2YgdGhlIGVuZXJneSBpbiB0aGlzIHBhY2tldCwgaW4gbWV0ZXJzXHJcbiAgcHVibGljIHJlYWRvbmx5IHdhdmVsZW5ndGg6IG51bWJlcjtcclxuXHJcbiAgLy8gZW5lcmd5IGluIHRoaXMgcGFja2V0LCBpbiBqb3VsZXNcclxuICBwdWJsaWMgZW5lcmd5OiBudW1iZXI7XHJcblxyXG4gIC8vIGFsdGl0dWRlIGluIG1ldGVyc1xyXG4gIHB1YmxpYyBhbHRpdHVkZTogbnVtYmVyO1xyXG4gIHB1YmxpYyBwcmV2aW91c0FsdGl0dWRlOiBudW1iZXI7XHJcblxyXG4gIC8vIGRpcmVjdGlvbiBpbiB3aGljaCB0aGlzIGVuZXJneSBpcyBtb3ZpbmdcclxuICBwdWJsaWMgZGlyZWN0aW9uOiBFbmVyZ3lEaXJlY3Rpb247XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB3YXZlbGVuZ3RoIC0gaW4gbWV0ZXJzXHJcbiAgICogQHBhcmFtIGVuZXJneSAtIGluIGpvdWxlc1xyXG4gICAqIEBwYXJhbSBpbml0aWFsQWx0aXR1ZGUgLSBpbiBtZXRlcnNcclxuICAgKiBAcGFyYW0gZGlyZWN0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB3YXZlbGVuZ3RoOiBudW1iZXIsIGVuZXJneTogbnVtYmVyLCBpbml0aWFsQWx0aXR1ZGU6IG51bWJlciwgZGlyZWN0aW9uOiBFbmVyZ3lEaXJlY3Rpb24gKSB7XHJcbiAgICB0aGlzLndhdmVsZW5ndGggPSB3YXZlbGVuZ3RoO1xyXG4gICAgdGhpcy5lbmVyZ3kgPSBlbmVyZ3k7XHJcbiAgICB0aGlzLmFsdGl0dWRlID0gaW5pdGlhbEFsdGl0dWRlO1xyXG4gICAgdGhpcy5wcmV2aW91c0FsdGl0dWRlID0gaW5pdGlhbEFsdGl0dWRlO1xyXG4gICAgdGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGRldGVybWluaW5nIHdoZXRoZXIgdGhlIEVNIGVuZXJneSBjb250YWluZWQgaW4gdGhpcyBwYWNrZXQgaXMgaW4gdGhlIHZpc2libGUgbGlnaHQgcmFuZ2VcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGlzVmlzaWJsZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLndhdmVsZW5ndGggPT09IEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMuVklTSUJMRV9XQVZFTEVOR1RIO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogY29udmVuaWVuY2UgbWV0aG9kIGZvciBkZXRlcm1pbmluZyB3aGV0aGVyIHRoZSBFTSBlbmVyZ3kgY29udGFpbmVkIGluIHRoaXMgcGFja2V0IGlzIGluIHRoZSBpbmZyYXJlZCBsaWdodCByYW5nZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgaXNJbmZyYXJlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLndhdmVsZW5ndGggPT09IEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMuSU5GUkFSRURfV0FWRUxFTkdUSDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBkdCAtIGRlbHRhIHRpbWUsIGluIHNlY29uZHNcclxuICAgKi9cclxuICBwdWJsaWMgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIHRoaXMucHJldmlvdXNBbHRpdHVkZSA9IHRoaXMuYWx0aXR1ZGU7XHJcblxyXG4gICAgaWYgKCB0aGlzLmRpcmVjdGlvbiA9PT0gRW5lcmd5RGlyZWN0aW9uLlVQICkge1xyXG4gICAgICB0aGlzLmFsdGl0dWRlICs9IGR0ICogR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5TUEVFRF9PRl9MSUdIVDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLmFsdGl0dWRlIC09IGR0ICogR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5TUEVFRF9PRl9MSUdIVDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlcmlhbGl6ZXMgdGhpcyBFTUVuZXJneVBhY2tldCBpbnN0YW5jZS5cclxuICAgKi9cclxuICBwdWJsaWMgdG9TdGF0ZU9iamVjdCgpOiBFTUVuZXJneVBhY2tldFN0YXRlT2JqZWN0IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHdhdmVsZW5ndGg6IHRoaXMud2F2ZWxlbmd0aCxcclxuICAgICAgZW5lcmd5OiB0aGlzLmVuZXJneSxcclxuICAgICAgYWx0aXR1ZGU6IHRoaXMuYWx0aXR1ZGUsXHJcbiAgICAgIHByZXZpb3VzQWx0aXR1ZGU6IHRoaXMucHJldmlvdXNBbHRpdHVkZSxcclxuICAgICAgZGlyZWN0aW9uOiBFbnVtZXJhdGlvbklPKCBFbmVyZ3lEaXJlY3Rpb24gKS50b1N0YXRlT2JqZWN0KCB0aGlzLmRpcmVjdGlvbiApXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRU1FbmVyZ3lQYWNrZXRJTyBoYW5kbGVzIFBoRVQtaU8gc2VyaWFsaXphdGlvbiBvZiBFTUVuZXJneVBhY2tldC4gQmVjYXVzZSBzZXJpYWxpemF0aW9uIGludm9sdmVzIGFjY2Vzc2luZyBwcml2YXRlXHJcbiAgICogbWVtYmVycywgaXQgZGVsZWdhdGVzIHRvIEVNRW5lcmd5UGFja2V0LiBUaGUgbWV0aG9kcyB0aGF0IEVNRW5lcmd5UGFja2V0SU8gb3ZlcnJpZGVzIGFyZSB0eXBpY2FsIG9mICdEeW5hbWljIGVsZW1lbnRcclxuICAgKiBzZXJpYWxpemF0aW9uJywgYXMgZGVzY3JpYmVkIGluIHRoZSBTZXJpYWxpemF0aW9uIHNlY3Rpb24gb2ZcclxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9ibG9iL21hc3Rlci9kb2MvcGhldC1pby1pbnN0cnVtZW50YXRpb24tdGVjaG5pY2FsLWd1aWRlLm1kI3NlcmlhbGl6YXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEVNRW5lcmd5UGFja2V0SU8gPSBuZXcgSU9UeXBlPEVNRW5lcmd5UGFja2V0LCBFTUVuZXJneVBhY2tldFN0YXRlT2JqZWN0PiggJ0VNRW5lcmd5UGFja2V0SU8nLCB7XHJcbiAgICB2YWx1ZVR5cGU6IEVNRW5lcmd5UGFja2V0LFxyXG4gICAgc3RhdGVTY2hlbWE6IHtcclxuICAgICAgd2F2ZWxlbmd0aDogTnVtYmVySU8sXHJcbiAgICAgIGVuZXJneTogTnVtYmVySU8sXHJcbiAgICAgIGFsdGl0dWRlOiBOdW1iZXJJTyxcclxuICAgICAgcHJldmlvdXNBbHRpdHVkZTogTnVtYmVySU8sXHJcbiAgICAgIGRpcmVjdGlvbjogRW51bWVyYXRpb25JTyggRW5lcmd5RGlyZWN0aW9uIClcclxuICAgIH0sXHJcbiAgICBmcm9tU3RhdGVPYmplY3Q6ICggc3RhdGVPYmplY3Q6IEVNRW5lcmd5UGFja2V0U3RhdGVPYmplY3QgKSA9PiB7XHJcbiAgICAgIGNvbnN0IGVtRW5lcmd5UGFja2V0ID0gbmV3IEVNRW5lcmd5UGFja2V0KFxyXG4gICAgICAgIHN0YXRlT2JqZWN0LndhdmVsZW5ndGgsXHJcbiAgICAgICAgc3RhdGVPYmplY3QuZW5lcmd5LFxyXG4gICAgICAgIHN0YXRlT2JqZWN0LmFsdGl0dWRlLFxyXG4gICAgICAgIEVudW1lcmF0aW9uSU8oIEVuZXJneURpcmVjdGlvbiApLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QuZGlyZWN0aW9uIClcclxuICAgICAgKTtcclxuICAgICAgZW1FbmVyZ3lQYWNrZXQucHJldmlvdXNBbHRpdHVkZSA9IHN0YXRlT2JqZWN0LnByZXZpb3VzQWx0aXR1ZGU7XHJcbiAgICAgIHJldHVybiBlbUVuZXJneVBhY2tldDtcclxuICAgIH0sXHJcbiAgICB0b1N0YXRlT2JqZWN0OiAoIGNvcmVPYmplY3Q6IEVNRW5lcmd5UGFja2V0ICkgPT4gY29yZU9iamVjdC50b1N0YXRlT2JqZWN0KClcclxuICB9ICk7XHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIEVNRW5lcmd5UGFja2V0U3RhdGVPYmplY3QgPSB7XHJcbiAgd2F2ZWxlbmd0aDogbnVtYmVyO1xyXG4gIGVuZXJneTogbnVtYmVyO1xyXG4gIGFsdGl0dWRlOiBudW1iZXI7XHJcbiAgcHJldmlvdXNBbHRpdHVkZTogbnVtYmVyO1xyXG4gIGRpcmVjdGlvbjogRW5lcmd5RGlyZWN0aW9uO1xyXG59O1xyXG5cclxuZ3JlZW5ob3VzZUVmZmVjdC5yZWdpc3RlciggJ0VNRW5lcmd5UGFja2V0JywgRU1FbmVyZ3lQYWNrZXQgKTtcclxuZXhwb3J0IGRlZmF1bHQgRU1FbmVyZ3lQYWNrZXQ7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxhQUFhLE1BQU0sOENBQThDO0FBQ3hFLE9BQU9DLE1BQU0sTUFBTSx1Q0FBdUM7QUFDMUQsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MseUJBQXlCLE1BQU0saUNBQWlDO0FBQ3ZFLE9BQU9DLGVBQWUsTUFBTSxzQkFBc0I7QUFFbEQsTUFBTUMsY0FBYyxDQUFDO0VBRW5COztFQUdBOztFQUdBOztFQUlBOztFQUdBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTQyxXQUFXQSxDQUFFQyxVQUFrQixFQUFFQyxNQUFjLEVBQUVDLGVBQXVCLEVBQUVDLFNBQTBCLEVBQUc7SUFD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