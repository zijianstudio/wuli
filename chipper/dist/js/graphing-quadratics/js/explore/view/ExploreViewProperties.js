// Copyright 2018-2023, University of Colorado Boulder

/**
 * View-specific Properties and properties for the 'Explore' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import GQViewProperties from '../../common/view/GQViewProperties.js';
import graphingQuadratics from '../../graphingQuadratics.js';
export default class ExploreViewProperties extends GQViewProperties {
  // See phetioDocumentation below

  constructor(tandem) {
    super({
      tandem: tandem
    });
    this.quadraticTermsAccordionBoxExpandedProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('quadraticTermsAccordionBoxExpandedProperty'),
      phetioDocumentation: 'whether the Quadratic Terms accordion box is expanded'
    });
    this.quadraticTermVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('quadraticTermVisibleProperty'),
      phetioDocumentation: 'whether the quadratic term (y = ax^2) is visible'
    });
    this.linearTermVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('linearTermVisibleProperty'),
      phetioDocumentation: 'whether the linear term (y = bx) is visible'
    });
    this.constantTermVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('constantTermVisibleProperty'),
      phetioDocumentation: 'whether the constant term (y = c) is visible'
    });
  }
  reset() {
    this.quadraticTermsAccordionBoxExpandedProperty.reset();
    this.quadraticTermVisibleProperty.reset();
    this.linearTermVisibleProperty.reset();
    this.constantTermVisibleProperty.reset();
    super.reset();
  }
}
graphingQuadratics.register('ExploreViewProperties', ExploreViewProperties);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJHUVZpZXdQcm9wZXJ0aWVzIiwiZ3JhcGhpbmdRdWFkcmF0aWNzIiwiRXhwbG9yZVZpZXdQcm9wZXJ0aWVzIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJxdWFkcmF0aWNUZXJtc0FjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwicXVhZHJhdGljVGVybVZpc2libGVQcm9wZXJ0eSIsImxpbmVhclRlcm1WaXNpYmxlUHJvcGVydHkiLCJjb25zdGFudFRlcm1WaXNpYmxlUHJvcGVydHkiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRXhwbG9yZVZpZXdQcm9wZXJ0aWVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZpZXctc3BlY2lmaWMgUHJvcGVydGllcyBhbmQgcHJvcGVydGllcyBmb3IgdGhlICdFeHBsb3JlJyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEdRVmlld1Byb3BlcnRpZXMgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvR1FWaWV3UHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCBncmFwaGluZ1F1YWRyYXRpY3MgZnJvbSAnLi4vLi4vZ3JhcGhpbmdRdWFkcmF0aWNzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4cGxvcmVWaWV3UHJvcGVydGllcyBleHRlbmRzIEdRVmlld1Byb3BlcnRpZXMge1xyXG5cclxuICAvLyBTZWUgcGhldGlvRG9jdW1lbnRhdGlvbiBiZWxvd1xyXG4gIHB1YmxpYyByZWFkb25seSBxdWFkcmF0aWNUZXJtc0FjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyByZWFkb25seSBxdWFkcmF0aWNUZXJtVmlzaWJsZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgbGluZWFyVGVybVZpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgcHVibGljIHJlYWRvbmx5IGNvbnN0YW50VGVybVZpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnF1YWRyYXRpY1Rlcm1zQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3F1YWRyYXRpY1Rlcm1zQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3doZXRoZXIgdGhlIFF1YWRyYXRpYyBUZXJtcyBhY2NvcmRpb24gYm94IGlzIGV4cGFuZGVkJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMucXVhZHJhdGljVGVybVZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3F1YWRyYXRpY1Rlcm1WaXNpYmxlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd3aGV0aGVyIHRoZSBxdWFkcmF0aWMgdGVybSAoeSA9IGF4XjIpIGlzIHZpc2libGUnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5saW5lYXJUZXJtVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGluZWFyVGVybVZpc2libGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3doZXRoZXIgdGhlIGxpbmVhciB0ZXJtICh5ID0gYngpIGlzIHZpc2libGUnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5jb25zdGFudFRlcm1WaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb25zdGFudFRlcm1WaXNpYmxlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd3aGV0aGVyIHRoZSBjb25zdGFudCB0ZXJtICh5ID0gYykgaXMgdmlzaWJsZSdcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMucXVhZHJhdGljVGVybXNBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnF1YWRyYXRpY1Rlcm1WaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubGluZWFyVGVybVZpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5jb25zdGFudFRlcm1WaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmFwaGluZ1F1YWRyYXRpY3MucmVnaXN0ZXIoICdFeHBsb3JlVmlld1Byb3BlcnRpZXMnLCBFeHBsb3JlVmlld1Byb3BlcnRpZXMgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUdwRSxPQUFPQyxnQkFBZ0IsTUFBTSx1Q0FBdUM7QUFDcEUsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBRTVELGVBQWUsTUFBTUMscUJBQXFCLFNBQVNGLGdCQUFnQixDQUFDO0VBRWxFOztFQU1PRyxXQUFXQSxDQUFFQyxNQUFjLEVBQUc7SUFFbkMsS0FBSyxDQUFFO01BQ0xBLE1BQU0sRUFBRUE7SUFDVixDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNDLDBDQUEwQyxHQUFHLElBQUlOLGVBQWUsQ0FBRSxLQUFLLEVBQUU7TUFDNUVLLE1BQU0sRUFBRUEsTUFBTSxDQUFDRSxZQUFZLENBQUUsNENBQTZDLENBQUM7TUFDM0VDLG1CQUFtQixFQUFFO0lBQ3ZCLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0MsNEJBQTRCLEdBQUcsSUFBSVQsZUFBZSxDQUFFLEtBQUssRUFBRTtNQUM5REssTUFBTSxFQUFFQSxNQUFNLENBQUNFLFlBQVksQ0FBRSw4QkFBK0IsQ0FBQztNQUM3REMsbUJBQW1CLEVBQUU7SUFDdkIsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDRSx5QkFBeUIsR0FBRyxJQUFJVixlQUFlLENBQUUsS0FBSyxFQUFFO01BQzNESyxNQUFNLEVBQUVBLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLDJCQUE0QixDQUFDO01BQzFEQyxtQkFBbUIsRUFBRTtJQUN2QixDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNHLDJCQUEyQixHQUFHLElBQUlYLGVBQWUsQ0FBRSxLQUFLLEVBQUU7TUFDN0RLLE1BQU0sRUFBRUEsTUFBTSxDQUFDRSxZQUFZLENBQUUsNkJBQThCLENBQUM7TUFDNURDLG1CQUFtQixFQUFFO0lBQ3ZCLENBQUUsQ0FBQztFQUNMO0VBRWdCSSxLQUFLQSxDQUFBLEVBQVM7SUFDNUIsSUFBSSxDQUFDTiwwQ0FBMEMsQ0FBQ00sS0FBSyxDQUFDLENBQUM7SUFDdkQsSUFBSSxDQUFDSCw0QkFBNEIsQ0FBQ0csS0FBSyxDQUFDLENBQUM7SUFDekMsSUFBSSxDQUFDRix5QkFBeUIsQ0FBQ0UsS0FBSyxDQUFDLENBQUM7SUFDdEMsSUFBSSxDQUFDRCwyQkFBMkIsQ0FBQ0MsS0FBSyxDQUFDLENBQUM7SUFDeEMsS0FBSyxDQUFDQSxLQUFLLENBQUMsQ0FBQztFQUNmO0FBQ0Y7QUFFQVYsa0JBQWtCLENBQUNXLFFBQVEsQ0FBRSx1QkFBdUIsRUFBRVYscUJBQXNCLENBQUMifQ==