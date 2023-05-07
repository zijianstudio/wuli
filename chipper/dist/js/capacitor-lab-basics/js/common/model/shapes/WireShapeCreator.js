// Copyright 2015-2022, University of Colorado Boulder

/**
 * Creates the 2D shape for a wire. Shapes are in the global view coordinate frame.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import { LineStyles, Shape } from '../../../../../kite/js/imports.js';
import capacitorLabBasics from '../../../capacitorLabBasics.js';
class WireShapeCreator {
  /**
   * @param {Wire} wire
   * @param {YawPitchModelViewTransform3} modelViewTransform
   */
  constructor(wire, modelViewTransform) {
    // @private {Wire}
    this.wire = wire;

    // @private {YawPitchModelViewTransform3}
    this.modelViewTransform = modelViewTransform;
  }

  /**
   * Create a wire shape.  Shape is generated from the stroked shape of the line segments which are added together
   * tip-to-tail.  This assumes that segments are added pieced together in the correct order.
   * @public
   *
   * @returns {Shape}
   */
  createWireShape() {
    // stroke styles for the wire shapes.
    const strokeStyles = new LineStyles({
      lineWidth: 7,
      lineCap: 'round',
      lineJoin: 'round'
    });
    const shapes = this.wire.segments.map(segment => {
      const shape = Shape.lineSegment(segment.startPointProperty.value.toVector2(), segment.endPointProperty.value.toVector2());
      return this.modelViewTransform.modelToViewShape(shape).getStrokedShape(strokeStyles);
    });
    return Shape.union(shapes);
  }
}
capacitorLabBasics.register('WireShapeCreator', WireShapeCreator);
export default WireShapeCreator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaW5lU3R5bGVzIiwiU2hhcGUiLCJjYXBhY2l0b3JMYWJCYXNpY3MiLCJXaXJlU2hhcGVDcmVhdG9yIiwiY29uc3RydWN0b3IiLCJ3aXJlIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiY3JlYXRlV2lyZVNoYXBlIiwic3Ryb2tlU3R5bGVzIiwibGluZVdpZHRoIiwibGluZUNhcCIsImxpbmVKb2luIiwic2hhcGVzIiwic2VnbWVudHMiLCJtYXAiLCJzZWdtZW50Iiwic2hhcGUiLCJsaW5lU2VnbWVudCIsInN0YXJ0UG9pbnRQcm9wZXJ0eSIsInZhbHVlIiwidG9WZWN0b3IyIiwiZW5kUG9pbnRQcm9wZXJ0eSIsIm1vZGVsVG9WaWV3U2hhcGUiLCJnZXRTdHJva2VkU2hhcGUiLCJ1bmlvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2lyZVNoYXBlQ3JlYXRvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIHRoZSAyRCBzaGFwZSBmb3IgYSB3aXJlLiBTaGFwZXMgYXJlIGluIHRoZSBnbG9iYWwgdmlldyBjb29yZGluYXRlIGZyYW1lLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBBbmRyZXcgQWRhcmUgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgTGluZVN0eWxlcywgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY2FwYWNpdG9yTGFiQmFzaWNzIGZyb20gJy4uLy4uLy4uL2NhcGFjaXRvckxhYkJhc2ljcy5qcyc7XHJcblxyXG5jbGFzcyBXaXJlU2hhcGVDcmVhdG9yIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1dpcmV9IHdpcmVcclxuICAgKiBAcGFyYW0ge1lhd1BpdGNoTW9kZWxWaWV3VHJhbnNmb3JtM30gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHdpcmUsIG1vZGVsVmlld1RyYW5zZm9ybSApIHtcclxuICAgIC8vIEBwcml2YXRlIHtXaXJlfVxyXG4gICAgdGhpcy53aXJlID0gd2lyZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7WWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zfVxyXG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gPSBtb2RlbFZpZXdUcmFuc2Zvcm07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSB3aXJlIHNoYXBlLiAgU2hhcGUgaXMgZ2VuZXJhdGVkIGZyb20gdGhlIHN0cm9rZWQgc2hhcGUgb2YgdGhlIGxpbmUgc2VnbWVudHMgd2hpY2ggYXJlIGFkZGVkIHRvZ2V0aGVyXHJcbiAgICogdGlwLXRvLXRhaWwuICBUaGlzIGFzc3VtZXMgdGhhdCBzZWdtZW50cyBhcmUgYWRkZWQgcGllY2VkIHRvZ2V0aGVyIGluIHRoZSBjb3JyZWN0IG9yZGVyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBjcmVhdGVXaXJlU2hhcGUoKSB7XHJcbiAgICAvLyBzdHJva2Ugc3R5bGVzIGZvciB0aGUgd2lyZSBzaGFwZXMuXHJcbiAgICBjb25zdCBzdHJva2VTdHlsZXMgPSBuZXcgTGluZVN0eWxlcygge1xyXG4gICAgICBsaW5lV2lkdGg6IDcsXHJcbiAgICAgIGxpbmVDYXA6ICdyb3VuZCcsXHJcbiAgICAgIGxpbmVKb2luOiAncm91bmQnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc2hhcGVzID0gdGhpcy53aXJlLnNlZ21lbnRzLm1hcCggc2VnbWVudCA9PiB7XHJcbiAgICAgIGNvbnN0IHNoYXBlID0gU2hhcGUubGluZVNlZ21lbnQoIHNlZ21lbnQuc3RhcnRQb2ludFByb3BlcnR5LnZhbHVlLnRvVmVjdG9yMigpLCBzZWdtZW50LmVuZFBvaW50UHJvcGVydHkudmFsdWUudG9WZWN0b3IyKCkgKTtcclxuICAgICAgcmV0dXJuIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3U2hhcGUoIHNoYXBlICkuZ2V0U3Ryb2tlZFNoYXBlKCBzdHJva2VTdHlsZXMgKTtcclxuICAgIH0gKTtcclxuICAgIHJldHVybiBTaGFwZS51bmlvbiggc2hhcGVzICk7XHJcbiAgfVxyXG59XHJcblxyXG5jYXBhY2l0b3JMYWJCYXNpY3MucmVnaXN0ZXIoICdXaXJlU2hhcGVDcmVhdG9yJywgV2lyZVNoYXBlQ3JlYXRvciApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgV2lyZVNoYXBlQ3JlYXRvcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLFVBQVUsRUFBRUMsS0FBSyxRQUFRLG1DQUFtQztBQUNyRSxPQUFPQyxrQkFBa0IsTUFBTSxnQ0FBZ0M7QUFFL0QsTUFBTUMsZ0JBQWdCLENBQUM7RUFDckI7QUFDRjtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsSUFBSSxFQUFFQyxrQkFBa0IsRUFBRztJQUN0QztJQUNBLElBQUksQ0FBQ0QsSUFBSSxHQUFHQSxJQUFJOztJQUVoQjtJQUNBLElBQUksQ0FBQ0Msa0JBQWtCLEdBQUdBLGtCQUFrQjtFQUM5Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxlQUFlQSxDQUFBLEVBQUc7SUFDaEI7SUFDQSxNQUFNQyxZQUFZLEdBQUcsSUFBSVIsVUFBVSxDQUFFO01BQ25DUyxTQUFTLEVBQUUsQ0FBQztNQUNaQyxPQUFPLEVBQUUsT0FBTztNQUNoQkMsUUFBUSxFQUFFO0lBQ1osQ0FBRSxDQUFDO0lBRUgsTUFBTUMsTUFBTSxHQUFHLElBQUksQ0FBQ1AsSUFBSSxDQUFDUSxRQUFRLENBQUNDLEdBQUcsQ0FBRUMsT0FBTyxJQUFJO01BQ2hELE1BQU1DLEtBQUssR0FBR2YsS0FBSyxDQUFDZ0IsV0FBVyxDQUFFRixPQUFPLENBQUNHLGtCQUFrQixDQUFDQyxLQUFLLENBQUNDLFNBQVMsQ0FBQyxDQUFDLEVBQUVMLE9BQU8sQ0FBQ00sZ0JBQWdCLENBQUNGLEtBQUssQ0FBQ0MsU0FBUyxDQUFDLENBQUUsQ0FBQztNQUMzSCxPQUFPLElBQUksQ0FBQ2Qsa0JBQWtCLENBQUNnQixnQkFBZ0IsQ0FBRU4sS0FBTSxDQUFDLENBQUNPLGVBQWUsQ0FBRWYsWUFBYSxDQUFDO0lBQzFGLENBQUUsQ0FBQztJQUNILE9BQU9QLEtBQUssQ0FBQ3VCLEtBQUssQ0FBRVosTUFBTyxDQUFDO0VBQzlCO0FBQ0Y7QUFFQVYsa0JBQWtCLENBQUN1QixRQUFRLENBQUUsa0JBQWtCLEVBQUV0QixnQkFBaUIsQ0FBQztBQUVuRSxlQUFlQSxnQkFBZ0IifQ==