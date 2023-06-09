// Copyright 2021-2023, University of Colorado Boulder

/**
 * An enumeration for the kinds of named quadrilaterals that can be detected based on the shape's geometric properties.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import quadrilateral from '../../quadrilateral.js';
export default class NamedQuadrilateral extends EnumerationValue {
  static SQUARE = new NamedQuadrilateral();
  static RECTANGLE = new NamedQuadrilateral();
  static RHOMBUS = new NamedQuadrilateral();
  static KITE = new NamedQuadrilateral();
  static ISOSCELES_TRAPEZOID = new NamedQuadrilateral();
  static TRAPEZOID = new NamedQuadrilateral();
  static CONCAVE_QUADRILATERAL = new NamedQuadrilateral();
  static CONVEX_QUADRILATERAL = new NamedQuadrilateral();
  static TRIANGLE = new NamedQuadrilateral();
  static PARALLELOGRAM = new NamedQuadrilateral();
  static DART = new NamedQuadrilateral();

  // Gets a list of keys, values and mapping between them.  For use in EnumerationProperty and PhET-iO
  static enumeration = new Enumeration(NamedQuadrilateral, {
    phetioDocumentation: 'Possible named shapes for the quadrilateral.'
  });
}
quadrilateral.register('NamedQuadrilateral', NamedQuadrilateral);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJxdWFkcmlsYXRlcmFsIiwiTmFtZWRRdWFkcmlsYXRlcmFsIiwiU1FVQVJFIiwiUkVDVEFOR0xFIiwiUkhPTUJVUyIsIktJVEUiLCJJU09TQ0VMRVNfVFJBUEVaT0lEIiwiVFJBUEVaT0lEIiwiQ09OQ0FWRV9RVUFEUklMQVRFUkFMIiwiQ09OVkVYX1FVQURSSUxBVEVSQUwiLCJUUklBTkdMRSIsIlBBUkFMTEVMT0dSQU0iLCJEQVJUIiwiZW51bWVyYXRpb24iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOYW1lZFF1YWRyaWxhdGVyYWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQW4gZW51bWVyYXRpb24gZm9yIHRoZSBraW5kcyBvZiBuYW1lZCBxdWFkcmlsYXRlcmFscyB0aGF0IGNhbiBiZSBkZXRlY3RlZCBiYXNlZCBvbiB0aGUgc2hhcGUncyBnZW9tZXRyaWMgcHJvcGVydGllcy5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcclxuaW1wb3J0IHF1YWRyaWxhdGVyYWwgZnJvbSAnLi4vLi4vcXVhZHJpbGF0ZXJhbC5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOYW1lZFF1YWRyaWxhdGVyYWwgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlIHtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFNRVUFSRSA9IG5ldyBOYW1lZFF1YWRyaWxhdGVyYWwoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFJFQ1RBTkdMRSA9IG5ldyBOYW1lZFF1YWRyaWxhdGVyYWwoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFJIT01CVVMgPSBuZXcgTmFtZWRRdWFkcmlsYXRlcmFsKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBLSVRFID0gbmV3IE5hbWVkUXVhZHJpbGF0ZXJhbCgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSVNPU0NFTEVTX1RSQVBFWk9JRCA9IG5ldyBOYW1lZFF1YWRyaWxhdGVyYWwoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFRSQVBFWk9JRCA9IG5ldyBOYW1lZFF1YWRyaWxhdGVyYWwoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IENPTkNBVkVfUVVBRFJJTEFURVJBTCA9IG5ldyBOYW1lZFF1YWRyaWxhdGVyYWwoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IENPTlZFWF9RVUFEUklMQVRFUkFMID0gbmV3IE5hbWVkUXVhZHJpbGF0ZXJhbCgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVFJJQU5HTEUgPSBuZXcgTmFtZWRRdWFkcmlsYXRlcmFsKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBQQVJBTExFTE9HUkFNID0gbmV3IE5hbWVkUXVhZHJpbGF0ZXJhbCgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgREFSVCA9IG5ldyBOYW1lZFF1YWRyaWxhdGVyYWwoKTtcclxuXHJcbiAgLy8gR2V0cyBhIGxpc3Qgb2Yga2V5cywgdmFsdWVzIGFuZCBtYXBwaW5nIGJldHdlZW4gdGhlbS4gIEZvciB1c2UgaW4gRW51bWVyYXRpb25Qcm9wZXJ0eSBhbmQgUGhFVC1pT1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIE5hbWVkUXVhZHJpbGF0ZXJhbCwge1xyXG4gICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1Bvc3NpYmxlIG5hbWVkIHNoYXBlcyBmb3IgdGhlIHF1YWRyaWxhdGVyYWwuJ1xyXG4gIH0gKTtcclxufVxyXG5cclxucXVhZHJpbGF0ZXJhbC5yZWdpc3RlciggJ05hbWVkUXVhZHJpbGF0ZXJhbCcsIE5hbWVkUXVhZHJpbGF0ZXJhbCApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxnQkFBZ0IsTUFBTSw4Q0FBOEM7QUFDM0UsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUVsRCxlQUFlLE1BQU1DLGtCQUFrQixTQUFTRixnQkFBZ0IsQ0FBQztFQUMvRCxPQUF1QkcsTUFBTSxHQUFHLElBQUlELGtCQUFrQixDQUFDLENBQUM7RUFDeEQsT0FBdUJFLFNBQVMsR0FBRyxJQUFJRixrQkFBa0IsQ0FBQyxDQUFDO0VBQzNELE9BQXVCRyxPQUFPLEdBQUcsSUFBSUgsa0JBQWtCLENBQUMsQ0FBQztFQUN6RCxPQUF1QkksSUFBSSxHQUFHLElBQUlKLGtCQUFrQixDQUFDLENBQUM7RUFDdEQsT0FBdUJLLG1CQUFtQixHQUFHLElBQUlMLGtCQUFrQixDQUFDLENBQUM7RUFDckUsT0FBdUJNLFNBQVMsR0FBRyxJQUFJTixrQkFBa0IsQ0FBQyxDQUFDO0VBQzNELE9BQXVCTyxxQkFBcUIsR0FBRyxJQUFJUCxrQkFBa0IsQ0FBQyxDQUFDO0VBQ3ZFLE9BQXVCUSxvQkFBb0IsR0FBRyxJQUFJUixrQkFBa0IsQ0FBQyxDQUFDO0VBQ3RFLE9BQXVCUyxRQUFRLEdBQUcsSUFBSVQsa0JBQWtCLENBQUMsQ0FBQztFQUMxRCxPQUF1QlUsYUFBYSxHQUFHLElBQUlWLGtCQUFrQixDQUFDLENBQUM7RUFDL0QsT0FBdUJXLElBQUksR0FBRyxJQUFJWCxrQkFBa0IsQ0FBQyxDQUFDOztFQUV0RDtFQUNBLE9BQXVCWSxXQUFXLEdBQUcsSUFBSWYsV0FBVyxDQUFFRyxrQkFBa0IsRUFBRTtJQUN4RWEsbUJBQW1CLEVBQUU7RUFDdkIsQ0FBRSxDQUFDO0FBQ0w7QUFFQWQsYUFBYSxDQUFDZSxRQUFRLENBQUUsb0JBQW9CLEVBQUVkLGtCQUFtQixDQUFDIn0=