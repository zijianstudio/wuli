// Copyright 2022, University of Colorado Boulder

/**
 * Mass shape for the Buoyancy Shapes screen. In the common model because some phet-io hackery is needed.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
export class MassShape extends EnumerationValue {
  static BLOCK = new MassShape();
  static ELLIPSOID = new MassShape();
  static VERTICAL_CYLINDER = new MassShape();
  static HORIZONTAL_CYLINDER = new MassShape();
  static CONE = new MassShape();
  static INVERTED_CONE = new MassShape();
  static enumeration = new Enumeration(MassShape, {
    phetioDocumentation: 'Shape of the mass'
  });
}
densityBuoyancyCommon.register('MassShape', MassShape);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJkZW5zaXR5QnVveWFuY3lDb21tb24iLCJNYXNzU2hhcGUiLCJCTE9DSyIsIkVMTElQU09JRCIsIlZFUlRJQ0FMX0NZTElOREVSIiwiSE9SSVpPTlRBTF9DWUxJTkRFUiIsIkNPTkUiLCJJTlZFUlRFRF9DT05FIiwiZW51bWVyYXRpb24iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNYXNzU2hhcGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1hc3Mgc2hhcGUgZm9yIHRoZSBCdW95YW5jeSBTaGFwZXMgc2NyZWVuLiBJbiB0aGUgY29tbW9uIG1vZGVsIGJlY2F1c2Ugc29tZSBwaGV0LWlvIGhhY2tlcnkgaXMgbmVlZGVkLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcclxuaW1wb3J0IGRlbnNpdHlCdW95YW5jeUNvbW1vbiBmcm9tICcuLi8uLi9kZW5zaXR5QnVveWFuY3lDb21tb24uanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE1hc3NTaGFwZSBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWUge1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQkxPQ0sgPSBuZXcgTWFzc1NoYXBlKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBFTExJUFNPSUQgPSBuZXcgTWFzc1NoYXBlKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBWRVJUSUNBTF9DWUxJTkRFUiA9IG5ldyBNYXNzU2hhcGUoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEhPUklaT05UQUxfQ1lMSU5ERVIgPSBuZXcgTWFzc1NoYXBlKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBDT05FID0gbmV3IE1hc3NTaGFwZSgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSU5WRVJURURfQ09ORSA9IG5ldyBNYXNzU2hhcGUoKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBlbnVtZXJhdGlvbiA9IG5ldyBFbnVtZXJhdGlvbiggTWFzc1NoYXBlLCB7XHJcbiAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnU2hhcGUgb2YgdGhlIG1hc3MnXHJcbiAgfSApO1xyXG59XHJcblxyXG5kZW5zaXR5QnVveWFuY3lDb21tb24ucmVnaXN0ZXIoICdNYXNzU2hhcGUnLCBNYXNzU2hhcGUgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsZ0JBQWdCLE1BQU0sOENBQThDO0FBQzNFLE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUVsRSxPQUFPLE1BQU1DLFNBQVMsU0FBU0YsZ0JBQWdCLENBQUM7RUFDOUMsT0FBdUJHLEtBQUssR0FBRyxJQUFJRCxTQUFTLENBQUMsQ0FBQztFQUM5QyxPQUF1QkUsU0FBUyxHQUFHLElBQUlGLFNBQVMsQ0FBQyxDQUFDO0VBQ2xELE9BQXVCRyxpQkFBaUIsR0FBRyxJQUFJSCxTQUFTLENBQUMsQ0FBQztFQUMxRCxPQUF1QkksbUJBQW1CLEdBQUcsSUFBSUosU0FBUyxDQUFDLENBQUM7RUFDNUQsT0FBdUJLLElBQUksR0FBRyxJQUFJTCxTQUFTLENBQUMsQ0FBQztFQUM3QyxPQUF1Qk0sYUFBYSxHQUFHLElBQUlOLFNBQVMsQ0FBQyxDQUFDO0VBRXRELE9BQXVCTyxXQUFXLEdBQUcsSUFBSVYsV0FBVyxDQUFFRyxTQUFTLEVBQUU7SUFDL0RRLG1CQUFtQixFQUFFO0VBQ3ZCLENBQUUsQ0FBQztBQUNMO0FBRUFULHFCQUFxQixDQUFDVSxRQUFRLENBQUUsV0FBVyxFQUFFVCxTQUFVLENBQUMifQ==