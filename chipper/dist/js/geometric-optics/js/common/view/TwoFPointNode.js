// Copyright 2021-2022, University of Colorado Boulder

/**
 * TwoFPointNode is the 2F point, whose distance from the optical is twice the focal length (f).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { Circle, Node } from '../../../../scenery/js/imports.js';
import geometricOptics from '../../geometricOptics.js';
import GOColors from '../GOColors.js';
export default class TwoFPointNode extends Node {
  constructor(pointProperty, modelViewTransform, provideOptions) {
    const options = optionize()({
      // NodeOptions
      children: [TwoFPointNode.createIcon()],
      phetioVisiblePropertyInstrumented: false
    }, provideOptions);
    super(options);
    pointProperty.link(twoFPoint => {
      this.center = modelViewTransform.modelToViewPosition(twoFPoint);
    });
    this.addLinkedElement(pointProperty, {
      tandem: options.tandem.createTandem(pointProperty.tandem.name)
    });
  }

  /**
   * Returns an icon for the 2F point
   */
  static createIcon(radius = 5) {
    return new Circle(radius, {
      fill: GOColors.twoFPointFillProperty,
      stroke: GOColors.twoFPointStrokeProperty
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
geometricOptics.register('TwoFPointNode', TwoFPointNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJDaXJjbGUiLCJOb2RlIiwiZ2VvbWV0cmljT3B0aWNzIiwiR09Db2xvcnMiLCJUd29GUG9pbnROb2RlIiwiY29uc3RydWN0b3IiLCJwb2ludFByb3BlcnR5IiwibW9kZWxWaWV3VHJhbnNmb3JtIiwicHJvdmlkZU9wdGlvbnMiLCJvcHRpb25zIiwiY2hpbGRyZW4iLCJjcmVhdGVJY29uIiwicGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkIiwibGluayIsInR3b0ZQb2ludCIsImNlbnRlciIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJhZGRMaW5rZWRFbGVtZW50IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwibmFtZSIsInJhZGl1cyIsImZpbGwiLCJ0d29GUG9pbnRGaWxsUHJvcGVydHkiLCJzdHJva2UiLCJ0d29GUG9pbnRTdHJva2VQcm9wZXJ0eSIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlR3b0ZQb2ludE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVHdvRlBvaW50Tm9kZSBpcyB0aGUgMkYgcG9pbnQsIHdob3NlIGRpc3RhbmNlIGZyb20gdGhlIG9wdGljYWwgaXMgdHdpY2UgdGhlIGZvY2FsIGxlbmd0aCAoZikuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgeyBDaXJjbGUsIE5vZGUsIE5vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGdlb21ldHJpY09wdGljcyBmcm9tICcuLi8uLi9nZW9tZXRyaWNPcHRpY3MuanMnO1xyXG5pbXBvcnQgR09Db2xvcnMgZnJvbSAnLi4vR09Db2xvcnMuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIFR3b0ZQb2ludE5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8Tm9kZU9wdGlvbnMsICd0YW5kZW0nIHwgJ3Zpc2libGVQcm9wZXJ0eSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHdvRlBvaW50Tm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHBvaW50UHJvcGVydHk6IFJlYWRPbmx5UHJvcGVydHk8VmVjdG9yMj4sIG1vZGVsVmlld1RyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVPcHRpb25zOiBUd29GUG9pbnROb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFR3b0ZQb2ludE5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIE5vZGVPcHRpb25zXHJcbiAgICAgIGNoaWxkcmVuOiBbIFR3b0ZQb2ludE5vZGUuY3JlYXRlSWNvbigpIF0sXHJcbiAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2VcclxuICAgIH0sIHByb3ZpZGVPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICBwb2ludFByb3BlcnR5LmxpbmsoIHR3b0ZQb2ludCA9PiB7XHJcbiAgICAgIHRoaXMuY2VudGVyID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHR3b0ZQb2ludCApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkTGlua2VkRWxlbWVudCggcG9pbnRQcm9wZXJ0eSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggcG9pbnRQcm9wZXJ0eS50YW5kZW0ubmFtZSApXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGljb24gZm9yIHRoZSAyRiBwb2ludFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlSWNvbiggcmFkaXVzID0gNSApOiBOb2RlIHtcclxuICAgIHJldHVybiBuZXcgQ2lyY2xlKCByYWRpdXMsIHtcclxuICAgICAgZmlsbDogR09Db2xvcnMudHdvRlBvaW50RmlsbFByb3BlcnR5LFxyXG4gICAgICBzdHJva2U6IEdPQ29sb3JzLnR3b0ZQb2ludFN0cm9rZVByb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuZ2VvbWV0cmljT3B0aWNzLnJlZ2lzdGVyKCAnVHdvRlBvaW50Tm9kZScsIFR3b0ZQb2ludE5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsU0FBUyxNQUE0Qix1Q0FBdUM7QUFFbkYsU0FBU0MsTUFBTSxFQUFFQyxJQUFJLFFBQXFCLG1DQUFtQztBQUM3RSxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLFFBQVEsTUFBTSxnQkFBZ0I7QUFRckMsZUFBZSxNQUFNQyxhQUFhLFNBQVNILElBQUksQ0FBQztFQUV2Q0ksV0FBV0EsQ0FBRUMsYUFBd0MsRUFBRUMsa0JBQXVDLEVBQ2pGQyxjQUFvQyxFQUFHO0lBRXpELE1BQU1DLE9BQU8sR0FBR1YsU0FBUyxDQUFpRCxDQUFDLENBQUU7TUFFM0U7TUFDQVcsUUFBUSxFQUFFLENBQUVOLGFBQWEsQ0FBQ08sVUFBVSxDQUFDLENBQUMsQ0FBRTtNQUN4Q0MsaUNBQWlDLEVBQUU7SUFDckMsQ0FBQyxFQUFFSixjQUFlLENBQUM7SUFFbkIsS0FBSyxDQUFFQyxPQUFRLENBQUM7SUFFaEJILGFBQWEsQ0FBQ08sSUFBSSxDQUFFQyxTQUFTLElBQUk7TUFDL0IsSUFBSSxDQUFDQyxNQUFNLEdBQUdSLGtCQUFrQixDQUFDUyxtQkFBbUIsQ0FBRUYsU0FBVSxDQUFDO0lBQ25FLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0csZ0JBQWdCLENBQUVYLGFBQWEsRUFBRTtNQUNwQ1ksTUFBTSxFQUFFVCxPQUFPLENBQUNTLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFYixhQUFhLENBQUNZLE1BQU0sQ0FBQ0UsSUFBSztJQUNqRSxDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7RUFDRSxPQUFjVCxVQUFVQSxDQUFFVSxNQUFNLEdBQUcsQ0FBQyxFQUFTO0lBQzNDLE9BQU8sSUFBSXJCLE1BQU0sQ0FBRXFCLE1BQU0sRUFBRTtNQUN6QkMsSUFBSSxFQUFFbkIsUUFBUSxDQUFDb0IscUJBQXFCO01BQ3BDQyxNQUFNLEVBQUVyQixRQUFRLENBQUNzQjtJQUNuQixDQUFFLENBQUM7RUFDTDtFQUVnQkMsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7SUFDekYsS0FBSyxDQUFDRCxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUF4QixlQUFlLENBQUMwQixRQUFRLENBQUUsZUFBZSxFQUFFeEIsYUFBYyxDQUFDIn0=