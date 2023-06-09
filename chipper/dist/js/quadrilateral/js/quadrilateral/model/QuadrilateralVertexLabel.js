// Copyright 2023, University of Colorado Boulder

/**
 * It is useful to know the identity of a particular QuadrilateralVertex, this enumeration supports that.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import quadrilateral from '../../quadrilateral.js';
export default class QuadrilateralVertexLabel extends EnumerationValue {
  static VERTEX_A = new QuadrilateralVertexLabel();
  static VERTEX_B = new QuadrilateralVertexLabel();
  static VERTEX_C = new QuadrilateralVertexLabel();
  static VERTEX_D = new QuadrilateralVertexLabel();
  static enumeration = new Enumeration(QuadrilateralVertexLabel);
}
quadrilateral.register('QuadrilateralVertexLabel', QuadrilateralVertexLabel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJxdWFkcmlsYXRlcmFsIiwiUXVhZHJpbGF0ZXJhbFZlcnRleExhYmVsIiwiVkVSVEVYX0EiLCJWRVJURVhfQiIsIlZFUlRFWF9DIiwiVkVSVEVYX0QiLCJlbnVtZXJhdGlvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUXVhZHJpbGF0ZXJhbFZlcnRleExhYmVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBJdCBpcyB1c2VmdWwgdG8ga25vdyB0aGUgaWRlbnRpdHkgb2YgYSBwYXJ0aWN1bGFyIFF1YWRyaWxhdGVyYWxWZXJ0ZXgsIHRoaXMgZW51bWVyYXRpb24gc3VwcG9ydHMgdGhhdC5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcclxuaW1wb3J0IHF1YWRyaWxhdGVyYWwgZnJvbSAnLi4vLi4vcXVhZHJpbGF0ZXJhbC5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRdWFkcmlsYXRlcmFsVmVydGV4TGFiZWwgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlIHtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFZFUlRFWF9BID0gbmV3IFF1YWRyaWxhdGVyYWxWZXJ0ZXhMYWJlbCgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVkVSVEVYX0IgPSBuZXcgUXVhZHJpbGF0ZXJhbFZlcnRleExhYmVsKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBWRVJURVhfQyA9IG5ldyBRdWFkcmlsYXRlcmFsVmVydGV4TGFiZWwoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFZFUlRFWF9EID0gbmV3IFF1YWRyaWxhdGVyYWxWZXJ0ZXhMYWJlbCgpO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGVudW1lcmF0aW9uID0gbmV3IEVudW1lcmF0aW9uKCBRdWFkcmlsYXRlcmFsVmVydGV4TGFiZWwgKTtcclxufVxyXG5cclxucXVhZHJpbGF0ZXJhbC5yZWdpc3RlciggJ1F1YWRyaWxhdGVyYWxWZXJ0ZXhMYWJlbCcsIFF1YWRyaWxhdGVyYWxWZXJ0ZXhMYWJlbCApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxnQkFBZ0IsTUFBTSw4Q0FBOEM7QUFDM0UsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUVsRCxlQUFlLE1BQU1DLHdCQUF3QixTQUFTRixnQkFBZ0IsQ0FBQztFQUNyRSxPQUF1QkcsUUFBUSxHQUFHLElBQUlELHdCQUF3QixDQUFDLENBQUM7RUFDaEUsT0FBdUJFLFFBQVEsR0FBRyxJQUFJRix3QkFBd0IsQ0FBQyxDQUFDO0VBQ2hFLE9BQXVCRyxRQUFRLEdBQUcsSUFBSUgsd0JBQXdCLENBQUMsQ0FBQztFQUNoRSxPQUF1QkksUUFBUSxHQUFHLElBQUlKLHdCQUF3QixDQUFDLENBQUM7RUFFaEUsT0FBdUJLLFdBQVcsR0FBRyxJQUFJUixXQUFXLENBQUVHLHdCQUF5QixDQUFDO0FBQ2xGO0FBRUFELGFBQWEsQ0FBQ08sUUFBUSxDQUFFLDBCQUEwQixFQUFFTix3QkFBeUIsQ0FBQyJ9