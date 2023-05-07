// Copyright 2018-2022, University of Colorado Boulder
// @ts-nocheck
/**
 * Model for the Slits screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Scene from '../../common/model/Scene.js';
import WaveInterferenceConstants from '../../common/WaveInterferenceConstants.js';
import waveInterference from '../../waveInterference.js';
import WavesModel from '../../waves/model/WavesModel.js';
class SlitsModel extends WavesModel {
  constructor() {
    super({
      initialAmplitude: WaveInterferenceConstants.AMPLITUDE_RANGE.max,
      waveSpatialType: Scene.WaveSpatialType.PLANE,
      // SoundParticles are not displayed on the Slits screen,
      // see https://github.com/phetsims/wave-interference/issues/109
      showSoundParticles: false
    });
  }

  /**
   * There are no water drops in this scene, and hence the slider controls the frequency directly.
   */
  getWaterFrequencySliderProperty() {
    return this.waterScene.frequencyProperty;
  }
}
waveInterference.register('SlitsModel', SlitsModel);
export default SlitsModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY2VuZSIsIldhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMiLCJ3YXZlSW50ZXJmZXJlbmNlIiwiV2F2ZXNNb2RlbCIsIlNsaXRzTW9kZWwiLCJjb25zdHJ1Y3RvciIsImluaXRpYWxBbXBsaXR1ZGUiLCJBTVBMSVRVREVfUkFOR0UiLCJtYXgiLCJ3YXZlU3BhdGlhbFR5cGUiLCJXYXZlU3BhdGlhbFR5cGUiLCJQTEFORSIsInNob3dTb3VuZFBhcnRpY2xlcyIsImdldFdhdGVyRnJlcXVlbmN5U2xpZGVyUHJvcGVydHkiLCJ3YXRlclNjZW5lIiwiZnJlcXVlbmN5UHJvcGVydHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNsaXRzTW9kZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcbi8vIEB0cy1ub2NoZWNrXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3IgdGhlIFNsaXRzIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1NjZW5lLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCB3YXZlSW50ZXJmZXJlbmNlIGZyb20gJy4uLy4uL3dhdmVJbnRlcmZlcmVuY2UuanMnO1xyXG5pbXBvcnQgV2F2ZXNNb2RlbCBmcm9tICcuLi8uLi93YXZlcy9tb2RlbC9XYXZlc01vZGVsLmpzJztcclxuXHJcbmNsYXNzIFNsaXRzTW9kZWwgZXh0ZW5kcyBXYXZlc01vZGVsIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoIHtcclxuXHJcbiAgICAgIGluaXRpYWxBbXBsaXR1ZGU6IFdhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMuQU1QTElUVURFX1JBTkdFLm1heCxcclxuICAgICAgd2F2ZVNwYXRpYWxUeXBlOiBTY2VuZS5XYXZlU3BhdGlhbFR5cGUuUExBTkUsXHJcblxyXG4gICAgICAvLyBTb3VuZFBhcnRpY2xlcyBhcmUgbm90IGRpc3BsYXllZCBvbiB0aGUgU2xpdHMgc2NyZWVuLFxyXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3dhdmUtaW50ZXJmZXJlbmNlL2lzc3Vlcy8xMDlcclxuICAgICAgc2hvd1NvdW5kUGFydGljbGVzOiBmYWxzZVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlcmUgYXJlIG5vIHdhdGVyIGRyb3BzIGluIHRoaXMgc2NlbmUsIGFuZCBoZW5jZSB0aGUgc2xpZGVyIGNvbnRyb2xzIHRoZSBmcmVxdWVuY3kgZGlyZWN0bHkuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGdldFdhdGVyRnJlcXVlbmN5U2xpZGVyUHJvcGVydHkoKTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPiB7XHJcbiAgICByZXR1cm4gdGhpcy53YXRlclNjZW5lLmZyZXF1ZW5jeVByb3BlcnR5O1xyXG4gIH1cclxufVxyXG5cclxud2F2ZUludGVyZmVyZW5jZS5yZWdpc3RlciggJ1NsaXRzTW9kZWwnLCBTbGl0c01vZGVsICk7XHJcbmV4cG9ydCBkZWZhdWx0IFNsaXRzTW9kZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sNkJBQTZCO0FBRS9DLE9BQU9DLHlCQUF5QixNQUFNLDJDQUEyQztBQUNqRixPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUV4RCxNQUFNQyxVQUFVLFNBQVNELFVBQVUsQ0FBQztFQUUzQkUsV0FBV0EsQ0FBQSxFQUFHO0lBQ25CLEtBQUssQ0FBRTtNQUVMQyxnQkFBZ0IsRUFBRUwseUJBQXlCLENBQUNNLGVBQWUsQ0FBQ0MsR0FBRztNQUMvREMsZUFBZSxFQUFFVCxLQUFLLENBQUNVLGVBQWUsQ0FBQ0MsS0FBSztNQUU1QztNQUNBO01BQ0FDLGtCQUFrQixFQUFFO0lBQ3RCLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtFQUNrQkMsK0JBQStCQSxDQUFBLEVBQThCO0lBQzNFLE9BQU8sSUFBSSxDQUFDQyxVQUFVLENBQUNDLGlCQUFpQjtFQUMxQztBQUNGO0FBRUFiLGdCQUFnQixDQUFDYyxRQUFRLENBQUUsWUFBWSxFQUFFWixVQUFXLENBQUM7QUFDckQsZUFBZUEsVUFBVSJ9