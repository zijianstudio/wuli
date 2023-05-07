// Copyright 2021-2023, University of Colorado Boulder

/**
 * GroundWaveSource acts as a source of the modeled electromagnetic (EM) waves produced by the ground when it gets hot.
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize from '../../../../phet-core/js/optionize.js';
import GreenhouseEffectConstants from '../../common/GreenhouseEffectConstants.js';
import GroundLayer from '../../common/model/GroundLayer.js';
import LayersModel from '../../common/model/LayersModel.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import EMWaveSource from './EMWaveSource.js';
import WaveSourceSpec from './WaveSourceSpec.js';

// constants
const MINIMUM_WAVE_INTENSITY = 0.01;
const MIN_WAVE_PRODUCTION_TEMPERATURE = GroundLayer.MINIMUM_EARTH_AT_NIGHT_TEMPERATURE; // min temperature at which the ground will produce IR waves
const MAX_EXPECTED_TEMPERATURE = 295; // the max temperature that the model is expected to reach, in Kelvin

class GroundWaveSource extends EMWaveSource {
  constructor(wavesInModel, waveStartAltitude, waveEndAltitude, groundTemperatureProperty, providedOptions) {
    // derived Property that maps temperature to the intensity of the IR waves
    const waveIntensityProperty = new DerivedProperty([groundTemperatureProperty], temperature => Utils.clamp(
    // min intensity at the lowest temperature, max at highest
    (temperature - MIN_WAVE_PRODUCTION_TEMPERATURE) / (MAX_EXPECTED_TEMPERATURE - MIN_WAVE_PRODUCTION_TEMPERATURE), MINIMUM_WAVE_INTENSITY, 1));
    const options = optionize()({
      waveIntensityProperty: waveIntensityProperty
    }, providedOptions);

    // derived Property that controls when IR waves can be produced
    const produceIRWavesProperty = new DerivedProperty([groundTemperatureProperty], temperature => temperature > MIN_WAVE_PRODUCTION_TEMPERATURE + 1 // just higher than the minimum
    );

    super(wavesInModel, produceIRWavesProperty, GreenhouseEffectConstants.INFRARED_WAVELENGTH, waveStartAltitude, waveEndAltitude, [
    // leftmost wave
    new WaveSourceSpec(-LayersModel.SUNLIGHT_SPAN.width * 0.3, GreenhouseEffectConstants.STRAIGHT_UP_NORMALIZED_VECTOR.rotated(Math.PI * 0.08)),
    // center-ish wave
    new WaveSourceSpec(-LayersModel.SUNLIGHT_SPAN.width * 0.1, GreenhouseEffectConstants.STRAIGHT_UP_NORMALIZED_VECTOR.rotated(-Math.PI * 0.1)),
    // rightmost wave
    new WaveSourceSpec(LayersModel.SUNLIGHT_SPAN.width * 0.47, GreenhouseEffectConstants.STRAIGHT_UP_NORMALIZED_VECTOR.rotated(Math.PI * 0.075))], options);
  }
}
greenhouseEffect.register('GroundWaveSource', GroundWaveSource);
export default GroundWaveSource;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJVdGlscyIsIm9wdGlvbml6ZSIsIkdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMiLCJHcm91bmRMYXllciIsIkxheWVyc01vZGVsIiwiZ3JlZW5ob3VzZUVmZmVjdCIsIkVNV2F2ZVNvdXJjZSIsIldhdmVTb3VyY2VTcGVjIiwiTUlOSU1VTV9XQVZFX0lOVEVOU0lUWSIsIk1JTl9XQVZFX1BST0RVQ1RJT05fVEVNUEVSQVRVUkUiLCJNSU5JTVVNX0VBUlRIX0FUX05JR0hUX1RFTVBFUkFUVVJFIiwiTUFYX0VYUEVDVEVEX1RFTVBFUkFUVVJFIiwiR3JvdW5kV2F2ZVNvdXJjZSIsImNvbnN0cnVjdG9yIiwid2F2ZXNJbk1vZGVsIiwid2F2ZVN0YXJ0QWx0aXR1ZGUiLCJ3YXZlRW5kQWx0aXR1ZGUiLCJncm91bmRUZW1wZXJhdHVyZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwid2F2ZUludGVuc2l0eVByb3BlcnR5IiwidGVtcGVyYXR1cmUiLCJjbGFtcCIsIm9wdGlvbnMiLCJwcm9kdWNlSVJXYXZlc1Byb3BlcnR5IiwiSU5GUkFSRURfV0FWRUxFTkdUSCIsIlNVTkxJR0hUX1NQQU4iLCJ3aWR0aCIsIlNUUkFJR0hUX1VQX05PUk1BTElaRURfVkVDVE9SIiwicm90YXRlZCIsIk1hdGgiLCJQSSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR3JvdW5kV2F2ZVNvdXJjZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBHcm91bmRXYXZlU291cmNlIGFjdHMgYXMgYSBzb3VyY2Ugb2YgdGhlIG1vZGVsZWQgZWxlY3Ryb21hZ25ldGljIChFTSkgd2F2ZXMgcHJvZHVjZWQgYnkgdGhlIGdyb3VuZCB3aGVuIGl0IGdldHMgaG90LlxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaGV0aW9Hcm91cCBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvR3JvdXAuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBHcm91bmRMYXllciBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvR3JvdW5kTGF5ZXIuanMnO1xyXG5pbXBvcnQgTGF5ZXJzTW9kZWwgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0xheWVyc01vZGVsLmpzJztcclxuaW1wb3J0IGdyZWVuaG91c2VFZmZlY3QgZnJvbSAnLi4vLi4vZ3JlZW5ob3VzZUVmZmVjdC5qcyc7XHJcbmltcG9ydCBXYXZlLCB7IFdhdmVDcmVhdG9yQXJndW1lbnRzIH0gZnJvbSAnLi4vLi4vd2F2ZXMvbW9kZWwvV2F2ZS5qcyc7XHJcbmltcG9ydCBFTVdhdmVTb3VyY2UsIHsgRU1XYXZlU291cmNlT3B0aW9ucyB9IGZyb20gJy4vRU1XYXZlU291cmNlLmpzJztcclxuaW1wb3J0IFdhdmVTb3VyY2VTcGVjIGZyb20gJy4vV2F2ZVNvdXJjZVNwZWMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE1JTklNVU1fV0FWRV9JTlRFTlNJVFkgPSAwLjAxO1xyXG5jb25zdCBNSU5fV0FWRV9QUk9EVUNUSU9OX1RFTVBFUkFUVVJFID0gR3JvdW5kTGF5ZXIuTUlOSU1VTV9FQVJUSF9BVF9OSUdIVF9URU1QRVJBVFVSRTsgLy8gbWluIHRlbXBlcmF0dXJlIGF0IHdoaWNoIHRoZSBncm91bmQgd2lsbCBwcm9kdWNlIElSIHdhdmVzXHJcbmNvbnN0IE1BWF9FWFBFQ1RFRF9URU1QRVJBVFVSRSA9IDI5NTsgLy8gdGhlIG1heCB0ZW1wZXJhdHVyZSB0aGF0IHRoZSBtb2RlbCBpcyBleHBlY3RlZCB0byByZWFjaCwgaW4gS2VsdmluXHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuZXhwb3J0IHR5cGUgR3JvdW5kV2F2ZVNvdXJjZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIEVNV2F2ZVNvdXJjZU9wdGlvbnM7XHJcblxyXG5jbGFzcyBHcm91bmRXYXZlU291cmNlIGV4dGVuZHMgRU1XYXZlU291cmNlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB3YXZlc0luTW9kZWw6IFBoZXRpb0dyb3VwPFdhdmUsIFdhdmVDcmVhdG9yQXJndW1lbnRzPixcclxuICAgICAgICAgICAgICAgICAgICAgIHdhdmVTdGFydEFsdGl0dWRlOiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICB3YXZlRW5kQWx0aXR1ZGU6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgIGdyb3VuZFRlbXBlcmF0dXJlUHJvcGVydHk6IFRQcm9wZXJ0eTxudW1iZXI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zPzogR3JvdW5kV2F2ZVNvdXJjZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gZGVyaXZlZCBQcm9wZXJ0eSB0aGF0IG1hcHMgdGVtcGVyYXR1cmUgdG8gdGhlIGludGVuc2l0eSBvZiB0aGUgSVIgd2F2ZXNcclxuICAgIGNvbnN0IHdhdmVJbnRlbnNpdHlQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgZ3JvdW5kVGVtcGVyYXR1cmVQcm9wZXJ0eSBdLFxyXG4gICAgICB0ZW1wZXJhdHVyZSA9PiBVdGlscy5jbGFtcChcclxuICAgICAgICAvLyBtaW4gaW50ZW5zaXR5IGF0IHRoZSBsb3dlc3QgdGVtcGVyYXR1cmUsIG1heCBhdCBoaWdoZXN0XHJcbiAgICAgICAgKCB0ZW1wZXJhdHVyZSAtIE1JTl9XQVZFX1BST0RVQ1RJT05fVEVNUEVSQVRVUkUgKSAvICggTUFYX0VYUEVDVEVEX1RFTVBFUkFUVVJFIC0gTUlOX1dBVkVfUFJPRFVDVElPTl9URU1QRVJBVFVSRSApLFxyXG4gICAgICAgIE1JTklNVU1fV0FWRV9JTlRFTlNJVFksXHJcbiAgICAgICAgMVxyXG4gICAgICApXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8R3JvdW5kV2F2ZVNvdXJjZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBFTVdhdmVTb3VyY2VPcHRpb25zPigpKCB7XHJcbiAgICAgIHdhdmVJbnRlbnNpdHlQcm9wZXJ0eTogd2F2ZUludGVuc2l0eVByb3BlcnR5XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBkZXJpdmVkIFByb3BlcnR5IHRoYXQgY29udHJvbHMgd2hlbiBJUiB3YXZlcyBjYW4gYmUgcHJvZHVjZWRcclxuICAgIGNvbnN0IHByb2R1Y2VJUldhdmVzUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIGdyb3VuZFRlbXBlcmF0dXJlUHJvcGVydHkgXSxcclxuICAgICAgdGVtcGVyYXR1cmUgPT4gdGVtcGVyYXR1cmUgPiBNSU5fV0FWRV9QUk9EVUNUSU9OX1RFTVBFUkFUVVJFICsgMSAvLyBqdXN0IGhpZ2hlciB0aGFuIHRoZSBtaW5pbXVtXHJcbiAgICApO1xyXG5cclxuICAgIHN1cGVyKFxyXG4gICAgICB3YXZlc0luTW9kZWwsXHJcbiAgICAgIHByb2R1Y2VJUldhdmVzUHJvcGVydHkgYXMgVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgIEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMuSU5GUkFSRURfV0FWRUxFTkdUSCxcclxuICAgICAgd2F2ZVN0YXJ0QWx0aXR1ZGUsXHJcbiAgICAgIHdhdmVFbmRBbHRpdHVkZSxcclxuICAgICAgW1xyXG5cclxuICAgICAgICAvLyBsZWZ0bW9zdCB3YXZlXHJcbiAgICAgICAgbmV3IFdhdmVTb3VyY2VTcGVjKFxyXG4gICAgICAgICAgLUxheWVyc01vZGVsLlNVTkxJR0hUX1NQQU4ud2lkdGggKiAwLjMsXHJcbiAgICAgICAgICBHcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzLlNUUkFJR0hUX1VQX05PUk1BTElaRURfVkVDVE9SLnJvdGF0ZWQoIE1hdGguUEkgKiAwLjA4IClcclxuICAgICAgICApLFxyXG5cclxuICAgICAgICAvLyBjZW50ZXItaXNoIHdhdmVcclxuICAgICAgICBuZXcgV2F2ZVNvdXJjZVNwZWMoXHJcbiAgICAgICAgICAtTGF5ZXJzTW9kZWwuU1VOTElHSFRfU1BBTi53aWR0aCAqIDAuMSxcclxuICAgICAgICAgIEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMuU1RSQUlHSFRfVVBfTk9STUFMSVpFRF9WRUNUT1Iucm90YXRlZCggLU1hdGguUEkgKiAwLjEgKVxyXG4gICAgICAgICksXHJcblxyXG4gICAgICAgIC8vIHJpZ2h0bW9zdCB3YXZlXHJcbiAgICAgICAgbmV3IFdhdmVTb3VyY2VTcGVjKFxyXG4gICAgICAgICAgTGF5ZXJzTW9kZWwuU1VOTElHSFRfU1BBTi53aWR0aCAqIDAuNDcsXHJcbiAgICAgICAgICBHcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzLlNUUkFJR0hUX1VQX05PUk1BTElaRURfVkVDVE9SLnJvdGF0ZWQoIE1hdGguUEkgKiAwLjA3NSApXHJcbiAgICAgICAgKVxyXG4gICAgICBdLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuZ3JlZW5ob3VzZUVmZmVjdC5yZWdpc3RlciggJ0dyb3VuZFdhdmVTb3VyY2UnLCBHcm91bmRXYXZlU291cmNlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEdyb3VuZFdhdmVTb3VyY2U7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUdwRSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLFNBQVMsTUFBNEIsdUNBQXVDO0FBRW5GLE9BQU9DLHlCQUF5QixNQUFNLDJDQUEyQztBQUNqRixPQUFPQyxXQUFXLE1BQU0sbUNBQW1DO0FBQzNELE9BQU9DLFdBQVcsTUFBTSxtQ0FBbUM7QUFDM0QsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBRXhELE9BQU9DLFlBQVksTUFBK0IsbUJBQW1CO0FBQ3JFLE9BQU9DLGNBQWMsTUFBTSxxQkFBcUI7O0FBRWhEO0FBQ0EsTUFBTUMsc0JBQXNCLEdBQUcsSUFBSTtBQUNuQyxNQUFNQywrQkFBK0IsR0FBR04sV0FBVyxDQUFDTyxrQ0FBa0MsQ0FBQyxDQUFDO0FBQ3hGLE1BQU1DLHdCQUF3QixHQUFHLEdBQUcsQ0FBQyxDQUFDOztBQUt0QyxNQUFNQyxnQkFBZ0IsU0FBU04sWUFBWSxDQUFDO0VBRW5DTyxXQUFXQSxDQUFFQyxZQUFxRCxFQUNyREMsaUJBQXlCLEVBQ3pCQyxlQUF1QixFQUN2QkMseUJBQTRDLEVBQzVDQyxlQUF5QyxFQUFHO0lBRTlEO0lBQ0EsTUFBTUMscUJBQXFCLEdBQUcsSUFBSXBCLGVBQWUsQ0FDL0MsQ0FBRWtCLHlCQUF5QixDQUFFLEVBQzdCRyxXQUFXLElBQUlwQixLQUFLLENBQUNxQixLQUFLO0lBQ3hCO0lBQ0EsQ0FBRUQsV0FBVyxHQUFHWCwrQkFBK0IsS0FBT0Usd0JBQXdCLEdBQUdGLCtCQUErQixDQUFFLEVBQ2xIRCxzQkFBc0IsRUFDdEIsQ0FDRixDQUNGLENBQUM7SUFFRCxNQUFNYyxPQUFPLEdBQUdyQixTQUFTLENBQTRELENBQUMsQ0FBRTtNQUN0RmtCLHFCQUFxQixFQUFFQTtJQUN6QixDQUFDLEVBQUVELGVBQWdCLENBQUM7O0lBRXBCO0lBQ0EsTUFBTUssc0JBQXNCLEdBQUcsSUFBSXhCLGVBQWUsQ0FDaEQsQ0FBRWtCLHlCQUF5QixDQUFFLEVBQzdCRyxXQUFXLElBQUlBLFdBQVcsR0FBR1gsK0JBQStCLEdBQUcsQ0FBQyxDQUFDO0lBQ25FLENBQUM7O0lBRUQsS0FBSyxDQUNISyxZQUFZLEVBQ1pTLHNCQUFzQixFQUN0QnJCLHlCQUF5QixDQUFDc0IsbUJBQW1CLEVBQzdDVCxpQkFBaUIsRUFDakJDLGVBQWUsRUFDZjtJQUVFO0lBQ0EsSUFBSVQsY0FBYyxDQUNoQixDQUFDSCxXQUFXLENBQUNxQixhQUFhLENBQUNDLEtBQUssR0FBRyxHQUFHLEVBQ3RDeEIseUJBQXlCLENBQUN5Qiw2QkFBNkIsQ0FBQ0MsT0FBTyxDQUFFQyxJQUFJLENBQUNDLEVBQUUsR0FBRyxJQUFLLENBQ2xGLENBQUM7SUFFRDtJQUNBLElBQUl2QixjQUFjLENBQ2hCLENBQUNILFdBQVcsQ0FBQ3FCLGFBQWEsQ0FBQ0MsS0FBSyxHQUFHLEdBQUcsRUFDdEN4Qix5QkFBeUIsQ0FBQ3lCLDZCQUE2QixDQUFDQyxPQUFPLENBQUUsQ0FBQ0MsSUFBSSxDQUFDQyxFQUFFLEdBQUcsR0FBSSxDQUNsRixDQUFDO0lBRUQ7SUFDQSxJQUFJdkIsY0FBYyxDQUNoQkgsV0FBVyxDQUFDcUIsYUFBYSxDQUFDQyxLQUFLLEdBQUcsSUFBSSxFQUN0Q3hCLHlCQUF5QixDQUFDeUIsNkJBQTZCLENBQUNDLE9BQU8sQ0FBRUMsSUFBSSxDQUFDQyxFQUFFLEdBQUcsS0FBTSxDQUNuRixDQUFDLENBQ0YsRUFDRFIsT0FDRixDQUFDO0VBQ0g7QUFDRjtBQUVBakIsZ0JBQWdCLENBQUMwQixRQUFRLENBQUUsa0JBQWtCLEVBQUVuQixnQkFBaUIsQ0FBQztBQUNqRSxlQUFlQSxnQkFBZ0IifQ==