// Copyright 2018-2022, University of Colorado Boulder

/**
 * Factors out common way of rendering text within the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { Text } from '../../../../scenery/js/imports.js';
import waveInterference from '../../waveInterference.js';
import WaveInterferenceConstants from '../WaveInterferenceConstants.js';
class WaveInterferenceText extends Text {
  constructor(string, options) {
    super(string, merge({
      font: WaveInterferenceConstants.DEFAULT_FONT,
      maxWidth: WaveInterferenceConstants.MAX_WIDTH
    }, options));
  }
}
waveInterference.register('WaveInterferenceText', WaveInterferenceText);
export default WaveInterferenceText;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlRleHQiLCJ3YXZlSW50ZXJmZXJlbmNlIiwiV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cyIsIldhdmVJbnRlcmZlcmVuY2VUZXh0IiwiY29uc3RydWN0b3IiLCJzdHJpbmciLCJvcHRpb25zIiwiZm9udCIsIkRFRkFVTFRfRk9OVCIsIm1heFdpZHRoIiwiTUFYX1dJRFRIIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJXYXZlSW50ZXJmZXJlbmNlVGV4dC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBGYWN0b3JzIG91dCBjb21tb24gd2F5IG9mIHJlbmRlcmluZyB0ZXh0IHdpdGhpbiB0aGUgc2ltLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBUZXh0LCBUZXh0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB3YXZlSW50ZXJmZXJlbmNlIGZyb20gJy4uLy4uL3dhdmVJbnRlcmZlcmVuY2UuanMnO1xyXG5pbXBvcnQgV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cyBmcm9tICcuLi9XYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLmpzJztcclxuXHJcbmNsYXNzIFdhdmVJbnRlcmZlcmVuY2VUZXh0IGV4dGVuZHMgVGV4dCB7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzdHJpbmc6IHN0cmluZyB8IG51bWJlciwgb3B0aW9ucz86IFRleHRPcHRpb25zICkge1xyXG4gICAgc3VwZXIoIHN0cmluZywgbWVyZ2UoIHtcclxuICAgICAgZm9udDogV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5ERUZBVUxUX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLk1BWF9XSURUSFxyXG4gICAgfSwgb3B0aW9ucyApICk7XHJcbiAgfVxyXG59XHJcblxyXG53YXZlSW50ZXJmZXJlbmNlLnJlZ2lzdGVyKCAnV2F2ZUludGVyZmVyZW5jZVRleHQnLCBXYXZlSW50ZXJmZXJlbmNlVGV4dCApO1xyXG5leHBvcnQgZGVmYXVsdCBXYXZlSW50ZXJmZXJlbmNlVGV4dDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxJQUFJLFFBQXFCLG1DQUFtQztBQUNyRSxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MseUJBQXlCLE1BQU0saUNBQWlDO0FBRXZFLE1BQU1DLG9CQUFvQixTQUFTSCxJQUFJLENBQUM7RUFDL0JJLFdBQVdBLENBQUVDLE1BQXVCLEVBQUVDLE9BQXFCLEVBQUc7SUFDbkUsS0FBSyxDQUFFRCxNQUFNLEVBQUVOLEtBQUssQ0FBRTtNQUNwQlEsSUFBSSxFQUFFTCx5QkFBeUIsQ0FBQ00sWUFBWTtNQUM1Q0MsUUFBUSxFQUFFUCx5QkFBeUIsQ0FBQ1E7SUFDdEMsQ0FBQyxFQUFFSixPQUFRLENBQUUsQ0FBQztFQUNoQjtBQUNGO0FBRUFMLGdCQUFnQixDQUFDVSxRQUFRLENBQUUsc0JBQXNCLEVBQUVSLG9CQUFxQixDQUFDO0FBQ3pFLGVBQWVBLG9CQUFvQiJ9