// Copyright 2023, University of Colorado Boulder

/**
 * Properties related to visibility of UI components in this simulation.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import quadrilateral from '../../quadrilateral.js';
import QuadrilateralQueryParameters from '../QuadrilateralQueryParameters.js';
export default class QuadrilateralVisibilityModel {
  // Whether markers are visible in this sim - including ticks along the sides, interior, and exerior angle indicators.

  // Whether labels on each vertex are visible.

  // Whether the grid is visible.

  // Whether the diagonal guides are visible.

  // Whether the shape name is displayed to the user.

  // If true, a panel displaying model values will be added to the view. Only for debugging.

  constructor(tandem) {
    this.gridVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('gridVisibleProperty')
    });
    this.vertexLabelsVisibleProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('vertexLabelsVisibleProperty')
    });
    this.diagonalGuidesVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('diagonalGuidesVisibleProperty')
    });
    this.markersVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('markersVisibleProperty')
    });
    this.shapeNameVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('shapeNameVisibleProperty')
    });
    this.showDebugValuesProperty = new BooleanProperty(QuadrilateralQueryParameters.showModelValues);
  }
  reset() {
    this.gridVisibleProperty.reset();
    this.vertexLabelsVisibleProperty.reset();
    this.diagonalGuidesVisibleProperty.reset();
    this.markersVisibleProperty.reset();
    this.shapeNameVisibleProperty.reset();
    this.showDebugValuesProperty.reset();
  }
}
quadrilateral.register('QuadrilateralVisibilityModel', QuadrilateralVisibilityModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJxdWFkcmlsYXRlcmFsIiwiUXVhZHJpbGF0ZXJhbFF1ZXJ5UGFyYW1ldGVycyIsIlF1YWRyaWxhdGVyYWxWaXNpYmlsaXR5TW9kZWwiLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsImdyaWRWaXNpYmxlUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJ2ZXJ0ZXhMYWJlbHNWaXNpYmxlUHJvcGVydHkiLCJkaWFnb25hbEd1aWRlc1Zpc2libGVQcm9wZXJ0eSIsIm1hcmtlcnNWaXNpYmxlUHJvcGVydHkiLCJzaGFwZU5hbWVWaXNpYmxlUHJvcGVydHkiLCJzaG93RGVidWdWYWx1ZXNQcm9wZXJ0eSIsInNob3dNb2RlbFZhbHVlcyIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJRdWFkcmlsYXRlcmFsVmlzaWJpbGl0eU1vZGVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQcm9wZXJ0aWVzIHJlbGF0ZWQgdG8gdmlzaWJpbGl0eSBvZiBVSSBjb21wb25lbnRzIGluIHRoaXMgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBxdWFkcmlsYXRlcmFsIGZyb20gJy4uLy4uL3F1YWRyaWxhdGVyYWwuanMnO1xyXG5pbXBvcnQgUXVhZHJpbGF0ZXJhbFF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9RdWFkcmlsYXRlcmFsUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFF1YWRyaWxhdGVyYWxWaXNpYmlsaXR5TW9kZWwge1xyXG5cclxuICAvLyBXaGV0aGVyIG1hcmtlcnMgYXJlIHZpc2libGUgaW4gdGhpcyBzaW0gLSBpbmNsdWRpbmcgdGlja3MgYWxvbmcgdGhlIHNpZGVzLCBpbnRlcmlvciwgYW5kIGV4ZXJpb3IgYW5nbGUgaW5kaWNhdG9ycy5cclxuICBwdWJsaWMgcmVhZG9ubHkgbWFya2Vyc1Zpc2libGVQcm9wZXJ0eTogQm9vbGVhblByb3BlcnR5O1xyXG5cclxuICAvLyBXaGV0aGVyIGxhYmVscyBvbiBlYWNoIHZlcnRleCBhcmUgdmlzaWJsZS5cclxuICBwdWJsaWMgcmVhZG9ubHkgdmVydGV4TGFiZWxzVmlzaWJsZVByb3BlcnR5OiBCb29sZWFuUHJvcGVydHk7XHJcblxyXG4gIC8vIFdoZXRoZXIgdGhlIGdyaWQgaXMgdmlzaWJsZS5cclxuICBwdWJsaWMgcmVhZG9ubHkgZ3JpZFZpc2libGVQcm9wZXJ0eTogQm9vbGVhblByb3BlcnR5O1xyXG5cclxuICAvLyBXaGV0aGVyIHRoZSBkaWFnb25hbCBndWlkZXMgYXJlIHZpc2libGUuXHJcbiAgcHVibGljIHJlYWRvbmx5IGRpYWdvbmFsR3VpZGVzVmlzaWJsZVByb3BlcnR5OiBCb29sZWFuUHJvcGVydHk7XHJcblxyXG4gIC8vIFdoZXRoZXIgdGhlIHNoYXBlIG5hbWUgaXMgZGlzcGxheWVkIHRvIHRoZSB1c2VyLlxyXG4gIHB1YmxpYyByZWFkb25seSBzaGFwZU5hbWVWaXNpYmxlUHJvcGVydHk6IEJvb2xlYW5Qcm9wZXJ0eTtcclxuXHJcbiAgLy8gSWYgdHJ1ZSwgYSBwYW5lbCBkaXNwbGF5aW5nIG1vZGVsIHZhbHVlcyB3aWxsIGJlIGFkZGVkIHRvIHRoZSB2aWV3LiBPbmx5IGZvciBkZWJ1Z2dpbmcuXHJcbiAgcHVibGljIHJlYWRvbmx5IHNob3dEZWJ1Z1ZhbHVlc1Byb3BlcnR5OiBCb29sZWFuUHJvcGVydHk7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgdGhpcy5ncmlkVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZ3JpZFZpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudmVydGV4TGFiZWxzVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2ZXJ0ZXhMYWJlbHNWaXNpYmxlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmRpYWdvbmFsR3VpZGVzVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGlhZ29uYWxHdWlkZXNWaXNpYmxlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm1hcmtlcnNWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtYXJrZXJzVmlzaWJsZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zaGFwZU5hbWVWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaGFwZU5hbWVWaXNpYmxlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNob3dEZWJ1Z1ZhbHVlc1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggUXVhZHJpbGF0ZXJhbFF1ZXJ5UGFyYW1ldGVycy5zaG93TW9kZWxWYWx1ZXMgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuZ3JpZFZpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy52ZXJ0ZXhMYWJlbHNWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZGlhZ29uYWxHdWlkZXNWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubWFya2Vyc1Zpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zaGFwZU5hbWVWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc2hvd0RlYnVnVmFsdWVzUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbnF1YWRyaWxhdGVyYWwucmVnaXN0ZXIoICdRdWFkcmlsYXRlcmFsVmlzaWJpbGl0eU1vZGVsJywgUXVhZHJpbGF0ZXJhbFZpc2liaWxpdHlNb2RlbCApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUVwRSxPQUFPQyxhQUFhLE1BQU0sd0JBQXdCO0FBQ2xELE9BQU9DLDRCQUE0QixNQUFNLG9DQUFvQztBQUU3RSxlQUFlLE1BQU1DLDRCQUE0QixDQUFDO0VBRWhEOztFQUdBOztFQUdBOztFQUdBOztFQUdBOztFQUdBOztFQUdPQyxXQUFXQSxDQUFFQyxNQUFjLEVBQUc7SUFFbkMsSUFBSSxDQUFDQyxtQkFBbUIsR0FBRyxJQUFJTixlQUFlLENBQUUsS0FBSyxFQUFFO01BQ3JESyxNQUFNLEVBQUVBLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLHFCQUFzQjtJQUNyRCxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNDLDJCQUEyQixHQUFHLElBQUlSLGVBQWUsQ0FBRSxJQUFJLEVBQUU7TUFDNURLLE1BQU0sRUFBRUEsTUFBTSxDQUFDRSxZQUFZLENBQUUsNkJBQThCO0lBQzdELENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0UsNkJBQTZCLEdBQUcsSUFBSVQsZUFBZSxDQUFFLEtBQUssRUFBRTtNQUMvREssTUFBTSxFQUFFQSxNQUFNLENBQUNFLFlBQVksQ0FBRSwrQkFBZ0M7SUFDL0QsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDRyxzQkFBc0IsR0FBRyxJQUFJVixlQUFlLENBQUUsS0FBSyxFQUFFO01BQ3hESyxNQUFNLEVBQUVBLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLHdCQUF5QjtJQUN4RCxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNJLHdCQUF3QixHQUFHLElBQUlYLGVBQWUsQ0FBRSxLQUFLLEVBQUU7TUFDMURLLE1BQU0sRUFBRUEsTUFBTSxDQUFDRSxZQUFZLENBQUUsMEJBQTJCO0lBQzFELENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0ssdUJBQXVCLEdBQUcsSUFBSVosZUFBZSxDQUFFRSw0QkFBNEIsQ0FBQ1csZUFBZ0IsQ0FBQztFQUNwRztFQUVPQyxLQUFLQSxDQUFBLEVBQVM7SUFDbkIsSUFBSSxDQUFDUixtQkFBbUIsQ0FBQ1EsS0FBSyxDQUFDLENBQUM7SUFDaEMsSUFBSSxDQUFDTiwyQkFBMkIsQ0FBQ00sS0FBSyxDQUFDLENBQUM7SUFDeEMsSUFBSSxDQUFDTCw2QkFBNkIsQ0FBQ0ssS0FBSyxDQUFDLENBQUM7SUFDMUMsSUFBSSxDQUFDSixzQkFBc0IsQ0FBQ0ksS0FBSyxDQUFDLENBQUM7SUFDbkMsSUFBSSxDQUFDSCx3QkFBd0IsQ0FBQ0csS0FBSyxDQUFDLENBQUM7SUFDckMsSUFBSSxDQUFDRix1QkFBdUIsQ0FBQ0UsS0FBSyxDQUFDLENBQUM7RUFDdEM7QUFDRjtBQUVBYixhQUFhLENBQUNjLFFBQVEsQ0FBRSw4QkFBOEIsRUFBRVosNEJBQTZCLENBQUMifQ==