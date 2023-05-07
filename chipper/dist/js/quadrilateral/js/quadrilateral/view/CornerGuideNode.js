// Copyright 2022-2023, University of Colorado Boulder

/**
 * A Node that surrounds a QuadrilateralVertex to represent the current angle. The shape looks like a partial annulus that extends
 * between the sides that define the angles at a vertex. The annulus is broken into alternating light and dark
 * wedges so that it is easy to see relative angle sizes by counting the number of wedges at each guide.
 *
 * The annulus always starts at the same side so that as the QuadrilateralNode rotates, the guides always look the same.
 *
 * It also includes dashed lines that cross through the vertex to give a visualization of the external angle that is
 * outside the quadrilateral shape. Requested in https://github.com/phetsims/quadrilateral/issues/73.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../quadrilateral.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import Utils from '../../../../dot/js/Utils.js';
import { Line, Shape } from '../../../../kite/js/imports.js';
import QuadrilateralColors from '../../QuadrilateralColors.js';
import Multilink from '../../../../axon/js/Multilink.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';

// constants
// The size of each wedge of the angle guide, in radians
const WEDGE_SIZE_DEGREES = 30;
const WEDGE_SIZE_RADIANS = Utils.toRadians(WEDGE_SIZE_DEGREES);

// in model coordinates, width of the arc (outer radius - inner radius of the annulus)
const WEDGE_RADIAL_LENGTH = 0.05;

// The radii of the annulus
const INNER_RADIUS = QuadrilateralConstants.VERTEX_WIDTH / 2;
const OUTER_RADIUS = QuadrilateralConstants.VERTEX_WIDTH / 2 + WEDGE_RADIAL_LENGTH;
const EXTERNAL_ANGLE_GUIDE_LENGTH = WEDGE_RADIAL_LENGTH * 8;
export default class CornerGuideNode extends Node {
  static WEDGE_SIZE_RADIANS = WEDGE_SIZE_RADIANS;

  /**
   * @param vertex1 - The vertex whose angle we are going to represent
   * @param vertex2 - "anchoring" vertex, corner guide will be drawn relative to a line between vertex1 and vertex2
   * @param visibleProperty
   * @param shapeModel
   * @param modelViewTransform
   */
  constructor(vertex1, vertex2, visibleProperty, shapeModel, modelViewTransform) {
    super({
      // This node is only visible when "Corner Guides" are enabled by the user
      visibleProperty: visibleProperty
    });

    // The guide looks like alternating dark and light wedges along the annulus, we accomplish this with two paths
    const darkAnglePath = new Path(null, {
      fill: QuadrilateralColors.cornerGuideDarkColorProperty,
      stroke: QuadrilateralColors.markersStrokeColorProperty
    });
    const lightAnglePath = new Path(null, {
      fill: QuadrilateralColors.cornerGuideLightColorProperty,
      stroke: QuadrilateralColors.markersStrokeColorProperty
    });
    const crosshairPath = new Path(null, {
      stroke: QuadrilateralColors.markersStrokeColorProperty,
      lineDash: [3, 3]
    });
    Multilink.multilink([vertex1.angleProperty, vertex1.positionProperty], (angle, position) => {
      assert && assert(angle !== null, 'angleProperty needs to be defined to add listeners in CornerGuideNode');
      assert && assert(angle > 0, 'CornerGuideNodes cannot support angles at or less than zero');
      const vertexCenter = vertex1.positionProperty.value;
      const definedAngle = angle;

      // Line helps us find where we should start drawing the shape, the annulus is "anchored" to one side so that
      // it will look the same regardless of quadrilateral rotation.
      const line = new Line(vertex1.positionProperty.value, vertex2.positionProperty.value);

      // start of the shape, the edge of the vertex along the line parametrically
      const startT = Math.min(INNER_RADIUS / line.getArcLength(), 1);
      let firstInnerPoint = line.positionAt(startT);

      // next point of the shape, edge of the vertex plus the size of the annulus parametrically along the line
      const endT = Math.min(OUTER_RADIUS / line.getArcLength(), 1);
      let firstOuterPoint = line.positionAt(endT);
      const lightShape = new Shape();
      const darkShape = new Shape();
      const numberOfWedges = Math.floor(definedAngle / WEDGE_SIZE_RADIANS);
      for (let i = 0; i < numberOfWedges; i++) {
        const nextShape = i % 2 === 0 ? lightShape : darkShape;
        const nextInnerPoint = firstInnerPoint.rotatedAboutPoint(vertexCenter, -WEDGE_SIZE_RADIANS);
        const nextOuterPoint = firstOuterPoint.rotatedAboutPoint(vertexCenter, -WEDGE_SIZE_RADIANS);
        CornerGuideNode.drawAngleSegment(nextShape, firstInnerPoint, firstOuterPoint, nextInnerPoint, nextOuterPoint);
        firstInnerPoint = nextInnerPoint;
        firstOuterPoint = nextOuterPoint;
      }

      // now draw the remainder - check to make sure that it is large enough to display because ellipticalArcTo doesn't
      // work with angles that are close to zero.
      const remainingAngle = definedAngle - numberOfWedges * WEDGE_SIZE_RADIANS;
      if (remainingAngle > 0.0005) {
        // wedges alternate from light to dark, so we can count on the remaining wedge being the alternating color
        const remainderShape = numberOfWedges % 2 === 0 ? lightShape : darkShape;
        const nextInnerPoint = firstInnerPoint.rotatedAboutPoint(vertexCenter, -remainingAngle);
        const nextOuterPoint = firstOuterPoint.rotatedAboutPoint(vertexCenter, -remainingAngle);
        CornerGuideNode.drawAngleSegment(remainderShape, firstInnerPoint, firstOuterPoint, nextInnerPoint, nextOuterPoint);
      }
      darkAnglePath.shape = modelViewTransform.modelToViewShape(lightShape);
      lightAnglePath.shape = modelViewTransform.modelToViewShape(darkShape);

      // now draw the line so that we can update the angle
      // start of the first guiding line, along the line between vertices parametrically
      const innerT = Math.min(EXTERNAL_ANGLE_GUIDE_LENGTH / 3 / line.getArcLength(), 1);
      const firstCrosshairPoint = CornerGuideNode.customPositionAt(line, innerT);
      const secondCrosshairPoint = CornerGuideNode.customPositionAt(line, -innerT);

      // for the points on the second crosshair line rotate by the angle around the center of the vertex
      const thirdCrosshairPoint = firstCrosshairPoint.rotatedAboutPoint(vertexCenter, 2 * Math.PI - definedAngle);
      const fourthCrosshairPoint = secondCrosshairPoint.rotatedAboutPoint(vertexCenter, 2 * Math.PI - definedAngle);
      const crosshairShape = new Shape();
      crosshairShape.moveToPoint(firstCrosshairPoint);
      crosshairShape.lineToPoint(secondCrosshairPoint);
      crosshairShape.moveToPoint(thirdCrosshairPoint);
      crosshairShape.lineToPoint(fourthCrosshairPoint);
      crosshairPath.shape = modelViewTransform.modelToViewShape(crosshairShape);
    });
    const arcNode = new Node({
      children: [darkAnglePath, lightAnglePath]
    });
    this.children = [arcNode, crosshairPath];

    // When at a right angle, display the RightAngleIndicator, otherwise the arcs representing angles are shown.
    vertex1.angleProperty.link(angle => {
      arcNode.visible = !shapeModel.isRightAngle(angle);
    });
  }

  /**
   * Returns the parametric position along a line at the position t. Modified from Line.positionAt to support
   * positions outside the range [0, 1] which is necessary for drawing code in this component.
   */
  static customPositionAt(line, t) {
    return line.start.plus(line.end.minus(line.start).times(t));
  }

  /**
   * Draw a single angle segment of the annulus. The provided shape will be mutated by this function.
   */
  static drawAngleSegment(shape, firstInnerPoint, firstOuterPoint, secondInnerPoint, secondOuterPoint) {
    shape.moveToPoint(firstInnerPoint);
    shape.lineToPoint(firstOuterPoint);
    shape.ellipticalArcTo(OUTER_RADIUS, OUTER_RADIUS, 0, false, false, secondOuterPoint.x, secondOuterPoint.y);
    shape.lineToPoint(secondInnerPoint);
    shape.ellipticalArcTo(INNER_RADIUS, INNER_RADIUS, 0, false, false, firstInnerPoint.x, firstInnerPoint.y);
    shape.close();
  }
}
quadrilateral.register('CornerGuideNode', CornerGuideNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJxdWFkcmlsYXRlcmFsIiwiTm9kZSIsIlBhdGgiLCJVdGlscyIsIkxpbmUiLCJTaGFwZSIsIlF1YWRyaWxhdGVyYWxDb2xvcnMiLCJNdWx0aWxpbmsiLCJRdWFkcmlsYXRlcmFsQ29uc3RhbnRzIiwiV0VER0VfU0laRV9ERUdSRUVTIiwiV0VER0VfU0laRV9SQURJQU5TIiwidG9SYWRpYW5zIiwiV0VER0VfUkFESUFMX0xFTkdUSCIsIklOTkVSX1JBRElVUyIsIlZFUlRFWF9XSURUSCIsIk9VVEVSX1JBRElVUyIsIkVYVEVSTkFMX0FOR0xFX0dVSURFX0xFTkdUSCIsIkNvcm5lckd1aWRlTm9kZSIsImNvbnN0cnVjdG9yIiwidmVydGV4MSIsInZlcnRleDIiLCJ2aXNpYmxlUHJvcGVydHkiLCJzaGFwZU1vZGVsIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiZGFya0FuZ2xlUGF0aCIsImZpbGwiLCJjb3JuZXJHdWlkZURhcmtDb2xvclByb3BlcnR5Iiwic3Ryb2tlIiwibWFya2Vyc1N0cm9rZUNvbG9yUHJvcGVydHkiLCJsaWdodEFuZ2xlUGF0aCIsImNvcm5lckd1aWRlTGlnaHRDb2xvclByb3BlcnR5IiwiY3Jvc3NoYWlyUGF0aCIsImxpbmVEYXNoIiwibXVsdGlsaW5rIiwiYW5nbGVQcm9wZXJ0eSIsInBvc2l0aW9uUHJvcGVydHkiLCJhbmdsZSIsInBvc2l0aW9uIiwiYXNzZXJ0IiwidmVydGV4Q2VudGVyIiwidmFsdWUiLCJkZWZpbmVkQW5nbGUiLCJsaW5lIiwic3RhcnRUIiwiTWF0aCIsIm1pbiIsImdldEFyY0xlbmd0aCIsImZpcnN0SW5uZXJQb2ludCIsInBvc2l0aW9uQXQiLCJlbmRUIiwiZmlyc3RPdXRlclBvaW50IiwibGlnaHRTaGFwZSIsImRhcmtTaGFwZSIsIm51bWJlck9mV2VkZ2VzIiwiZmxvb3IiLCJpIiwibmV4dFNoYXBlIiwibmV4dElubmVyUG9pbnQiLCJyb3RhdGVkQWJvdXRQb2ludCIsIm5leHRPdXRlclBvaW50IiwiZHJhd0FuZ2xlU2VnbWVudCIsInJlbWFpbmluZ0FuZ2xlIiwicmVtYWluZGVyU2hhcGUiLCJzaGFwZSIsIm1vZGVsVG9WaWV3U2hhcGUiLCJpbm5lclQiLCJmaXJzdENyb3NzaGFpclBvaW50IiwiY3VzdG9tUG9zaXRpb25BdCIsInNlY29uZENyb3NzaGFpclBvaW50IiwidGhpcmRDcm9zc2hhaXJQb2ludCIsIlBJIiwiZm91cnRoQ3Jvc3NoYWlyUG9pbnQiLCJjcm9zc2hhaXJTaGFwZSIsIm1vdmVUb1BvaW50IiwibGluZVRvUG9pbnQiLCJhcmNOb2RlIiwiY2hpbGRyZW4iLCJsaW5rIiwidmlzaWJsZSIsImlzUmlnaHRBbmdsZSIsInQiLCJzdGFydCIsInBsdXMiLCJlbmQiLCJtaW51cyIsInRpbWVzIiwic2Vjb25kSW5uZXJQb2ludCIsInNlY29uZE91dGVyUG9pbnQiLCJlbGxpcHRpY2FsQXJjVG8iLCJ4IiwieSIsImNsb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb3JuZXJHdWlkZU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBOb2RlIHRoYXQgc3Vycm91bmRzIGEgUXVhZHJpbGF0ZXJhbFZlcnRleCB0byByZXByZXNlbnQgdGhlIGN1cnJlbnQgYW5nbGUuIFRoZSBzaGFwZSBsb29rcyBsaWtlIGEgcGFydGlhbCBhbm51bHVzIHRoYXQgZXh0ZW5kc1xyXG4gKiBiZXR3ZWVuIHRoZSBzaWRlcyB0aGF0IGRlZmluZSB0aGUgYW5nbGVzIGF0IGEgdmVydGV4LiBUaGUgYW5udWx1cyBpcyBicm9rZW4gaW50byBhbHRlcm5hdGluZyBsaWdodCBhbmQgZGFya1xyXG4gKiB3ZWRnZXMgc28gdGhhdCBpdCBpcyBlYXN5IHRvIHNlZSByZWxhdGl2ZSBhbmdsZSBzaXplcyBieSBjb3VudGluZyB0aGUgbnVtYmVyIG9mIHdlZGdlcyBhdCBlYWNoIGd1aWRlLlxyXG4gKlxyXG4gKiBUaGUgYW5udWx1cyBhbHdheXMgc3RhcnRzIGF0IHRoZSBzYW1lIHNpZGUgc28gdGhhdCBhcyB0aGUgUXVhZHJpbGF0ZXJhbE5vZGUgcm90YXRlcywgdGhlIGd1aWRlcyBhbHdheXMgbG9vayB0aGUgc2FtZS5cclxuICpcclxuICogSXQgYWxzbyBpbmNsdWRlcyBkYXNoZWQgbGluZXMgdGhhdCBjcm9zcyB0aHJvdWdoIHRoZSB2ZXJ0ZXggdG8gZ2l2ZSBhIHZpc3VhbGl6YXRpb24gb2YgdGhlIGV4dGVybmFsIGFuZ2xlIHRoYXQgaXNcclxuICogb3V0c2lkZSB0aGUgcXVhZHJpbGF0ZXJhbCBzaGFwZS4gUmVxdWVzdGVkIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWFkcmlsYXRlcmFsL2lzc3Vlcy83My5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHF1YWRyaWxhdGVyYWwgZnJvbSAnLi4vLi4vcXVhZHJpbGF0ZXJhbC5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUXVhZHJpbGF0ZXJhbFZlcnRleCBmcm9tICcuLi9tb2RlbC9RdWFkcmlsYXRlcmFsVmVydGV4LmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCB7IExpbmUsIFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBRdWFkcmlsYXRlcmFsQ29sb3JzIGZyb20gJy4uLy4uL1F1YWRyaWxhdGVyYWxDb2xvcnMuanMnO1xyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFF1YWRyaWxhdGVyYWxTaGFwZU1vZGVsIGZyb20gJy4uL21vZGVsL1F1YWRyaWxhdGVyYWxTaGFwZU1vZGVsLmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBRdWFkcmlsYXRlcmFsQ29uc3RhbnRzIGZyb20gJy4uLy4uL1F1YWRyaWxhdGVyYWxDb25zdGFudHMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbi8vIFRoZSBzaXplIG9mIGVhY2ggd2VkZ2Ugb2YgdGhlIGFuZ2xlIGd1aWRlLCBpbiByYWRpYW5zXHJcbmNvbnN0IFdFREdFX1NJWkVfREVHUkVFUyA9IDMwO1xyXG5jb25zdCBXRURHRV9TSVpFX1JBRElBTlMgPSBVdGlscy50b1JhZGlhbnMoIFdFREdFX1NJWkVfREVHUkVFUyApO1xyXG5cclxuLy8gaW4gbW9kZWwgY29vcmRpbmF0ZXMsIHdpZHRoIG9mIHRoZSBhcmMgKG91dGVyIHJhZGl1cyAtIGlubmVyIHJhZGl1cyBvZiB0aGUgYW5udWx1cylcclxuY29uc3QgV0VER0VfUkFESUFMX0xFTkdUSCA9IDAuMDU7XHJcblxyXG4vLyBUaGUgcmFkaWkgb2YgdGhlIGFubnVsdXNcclxuY29uc3QgSU5ORVJfUkFESVVTID0gUXVhZHJpbGF0ZXJhbENvbnN0YW50cy5WRVJURVhfV0lEVEggLyAyO1xyXG5jb25zdCBPVVRFUl9SQURJVVMgPSBRdWFkcmlsYXRlcmFsQ29uc3RhbnRzLlZFUlRFWF9XSURUSCAvIDIgKyBXRURHRV9SQURJQUxfTEVOR1RIO1xyXG5cclxuY29uc3QgRVhURVJOQUxfQU5HTEVfR1VJREVfTEVOR1RIID0gV0VER0VfUkFESUFMX0xFTkdUSCAqIDg7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb3JuZXJHdWlkZU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFdFREdFX1NJWkVfUkFESUFOUyA9IFdFREdFX1NJWkVfUkFESUFOUztcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHZlcnRleDEgLSBUaGUgdmVydGV4IHdob3NlIGFuZ2xlIHdlIGFyZSBnb2luZyB0byByZXByZXNlbnRcclxuICAgKiBAcGFyYW0gdmVydGV4MiAtIFwiYW5jaG9yaW5nXCIgdmVydGV4LCBjb3JuZXIgZ3VpZGUgd2lsbCBiZSBkcmF3biByZWxhdGl2ZSB0byBhIGxpbmUgYmV0d2VlbiB2ZXJ0ZXgxIGFuZCB2ZXJ0ZXgyXHJcbiAgICogQHBhcmFtIHZpc2libGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSBzaGFwZU1vZGVsXHJcbiAgICogQHBhcmFtIG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdmVydGV4MTogUXVhZHJpbGF0ZXJhbFZlcnRleCwgdmVydGV4MjogUXVhZHJpbGF0ZXJhbFZlcnRleCwgdmlzaWJsZVByb3BlcnR5OiBCb29sZWFuUHJvcGVydHksIHNoYXBlTW9kZWw6IFF1YWRyaWxhdGVyYWxTaGFwZU1vZGVsLCBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIgKSB7XHJcbiAgICBzdXBlcigge1xyXG5cclxuICAgICAgLy8gVGhpcyBub2RlIGlzIG9ubHkgdmlzaWJsZSB3aGVuIFwiQ29ybmVyIEd1aWRlc1wiIGFyZSBlbmFibGVkIGJ5IHRoZSB1c2VyXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogdmlzaWJsZVByb3BlcnR5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVGhlIGd1aWRlIGxvb2tzIGxpa2UgYWx0ZXJuYXRpbmcgZGFyayBhbmQgbGlnaHQgd2VkZ2VzIGFsb25nIHRoZSBhbm51bHVzLCB3ZSBhY2NvbXBsaXNoIHRoaXMgd2l0aCB0d28gcGF0aHNcclxuICAgIGNvbnN0IGRhcmtBbmdsZVBhdGggPSBuZXcgUGF0aCggbnVsbCwge1xyXG4gICAgICBmaWxsOiBRdWFkcmlsYXRlcmFsQ29sb3JzLmNvcm5lckd1aWRlRGFya0NvbG9yUHJvcGVydHksXHJcbiAgICAgIHN0cm9rZTogUXVhZHJpbGF0ZXJhbENvbG9ycy5tYXJrZXJzU3Ryb2tlQ29sb3JQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgbGlnaHRBbmdsZVBhdGggPSBuZXcgUGF0aCggbnVsbCwge1xyXG4gICAgICBmaWxsOiBRdWFkcmlsYXRlcmFsQ29sb3JzLmNvcm5lckd1aWRlTGlnaHRDb2xvclByb3BlcnR5LFxyXG4gICAgICBzdHJva2U6IFF1YWRyaWxhdGVyYWxDb2xvcnMubWFya2Vyc1N0cm9rZUNvbG9yUHJvcGVydHlcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjcm9zc2hhaXJQYXRoID0gbmV3IFBhdGgoIG51bGwsIHtcclxuICAgICAgc3Ryb2tlOiBRdWFkcmlsYXRlcmFsQ29sb3JzLm1hcmtlcnNTdHJva2VDb2xvclByb3BlcnR5LFxyXG4gICAgICBsaW5lRGFzaDogWyAzLCAzIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHZlcnRleDEuYW5nbGVQcm9wZXJ0eSwgdmVydGV4MS5wb3NpdGlvblByb3BlcnR5IF0sICggYW5nbGUsIHBvc2l0aW9uICkgPT4ge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhbmdsZSAhPT0gbnVsbCwgJ2FuZ2xlUHJvcGVydHkgbmVlZHMgdG8gYmUgZGVmaW5lZCB0byBhZGQgbGlzdGVuZXJzIGluIENvcm5lckd1aWRlTm9kZScgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYW5nbGUhID4gMCwgJ0Nvcm5lckd1aWRlTm9kZXMgY2Fubm90IHN1cHBvcnQgYW5nbGVzIGF0IG9yIGxlc3MgdGhhbiB6ZXJvJyApO1xyXG4gICAgICBjb25zdCB2ZXJ0ZXhDZW50ZXIgPSB2ZXJ0ZXgxLnBvc2l0aW9uUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgICBjb25zdCBkZWZpbmVkQW5nbGUgPSBhbmdsZSE7XHJcblxyXG4gICAgICAvLyBMaW5lIGhlbHBzIHVzIGZpbmQgd2hlcmUgd2Ugc2hvdWxkIHN0YXJ0IGRyYXdpbmcgdGhlIHNoYXBlLCB0aGUgYW5udWx1cyBpcyBcImFuY2hvcmVkXCIgdG8gb25lIHNpZGUgc28gdGhhdFxyXG4gICAgICAvLyBpdCB3aWxsIGxvb2sgdGhlIHNhbWUgcmVnYXJkbGVzcyBvZiBxdWFkcmlsYXRlcmFsIHJvdGF0aW9uLlxyXG4gICAgICBjb25zdCBsaW5lID0gbmV3IExpbmUoIHZlcnRleDEucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSwgdmVydGV4Mi5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgICAvLyBzdGFydCBvZiB0aGUgc2hhcGUsIHRoZSBlZGdlIG9mIHRoZSB2ZXJ0ZXggYWxvbmcgdGhlIGxpbmUgcGFyYW1ldHJpY2FsbHlcclxuICAgICAgY29uc3Qgc3RhcnRUID0gTWF0aC5taW4oICggSU5ORVJfUkFESVVTICkgLyBsaW5lLmdldEFyY0xlbmd0aCgpLCAxICk7XHJcbiAgICAgIGxldCBmaXJzdElubmVyUG9pbnQgPSBsaW5lLnBvc2l0aW9uQXQoIHN0YXJ0VCApO1xyXG5cclxuICAgICAgLy8gbmV4dCBwb2ludCBvZiB0aGUgc2hhcGUsIGVkZ2Ugb2YgdGhlIHZlcnRleCBwbHVzIHRoZSBzaXplIG9mIHRoZSBhbm51bHVzIHBhcmFtZXRyaWNhbGx5IGFsb25nIHRoZSBsaW5lXHJcbiAgICAgIGNvbnN0IGVuZFQgPSBNYXRoLm1pbiggKCBPVVRFUl9SQURJVVMgKSAvIGxpbmUuZ2V0QXJjTGVuZ3RoKCksIDEgKTtcclxuICAgICAgbGV0IGZpcnN0T3V0ZXJQb2ludCA9IGxpbmUucG9zaXRpb25BdCggZW5kVCApO1xyXG5cclxuICAgICAgY29uc3QgbGlnaHRTaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG4gICAgICBjb25zdCBkYXJrU2hhcGUgPSBuZXcgU2hhcGUoKTtcclxuXHJcbiAgICAgIGNvbnN0IG51bWJlck9mV2VkZ2VzID0gTWF0aC5mbG9vciggZGVmaW5lZEFuZ2xlIC8gV0VER0VfU0laRV9SQURJQU5TICk7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlck9mV2VkZ2VzOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgbmV4dFNoYXBlID0gaSAlIDIgPT09IDAgPyBsaWdodFNoYXBlIDogZGFya1NoYXBlO1xyXG5cclxuICAgICAgICBjb25zdCBuZXh0SW5uZXJQb2ludCA9IGZpcnN0SW5uZXJQb2ludC5yb3RhdGVkQWJvdXRQb2ludCggdmVydGV4Q2VudGVyLCAtV0VER0VfU0laRV9SQURJQU5TICk7XHJcbiAgICAgICAgY29uc3QgbmV4dE91dGVyUG9pbnQgPSBmaXJzdE91dGVyUG9pbnQucm90YXRlZEFib3V0UG9pbnQoIHZlcnRleENlbnRlciwgLVdFREdFX1NJWkVfUkFESUFOUyApO1xyXG5cclxuICAgICAgICBDb3JuZXJHdWlkZU5vZGUuZHJhd0FuZ2xlU2VnbWVudCggbmV4dFNoYXBlLCBmaXJzdElubmVyUG9pbnQsIGZpcnN0T3V0ZXJQb2ludCwgbmV4dElubmVyUG9pbnQsIG5leHRPdXRlclBvaW50ICk7XHJcblxyXG4gICAgICAgIGZpcnN0SW5uZXJQb2ludCA9IG5leHRJbm5lclBvaW50O1xyXG4gICAgICAgIGZpcnN0T3V0ZXJQb2ludCA9IG5leHRPdXRlclBvaW50O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBub3cgZHJhdyB0aGUgcmVtYWluZGVyIC0gY2hlY2sgdG8gbWFrZSBzdXJlIHRoYXQgaXQgaXMgbGFyZ2UgZW5vdWdoIHRvIGRpc3BsYXkgYmVjYXVzZSBlbGxpcHRpY2FsQXJjVG8gZG9lc24ndFxyXG4gICAgICAvLyB3b3JrIHdpdGggYW5nbGVzIHRoYXQgYXJlIGNsb3NlIHRvIHplcm8uXHJcbiAgICAgIGNvbnN0IHJlbWFpbmluZ0FuZ2xlID0gKCBkZWZpbmVkQW5nbGUgLSAoIG51bWJlck9mV2VkZ2VzICogV0VER0VfU0laRV9SQURJQU5TICkgKTtcclxuICAgICAgaWYgKCByZW1haW5pbmdBbmdsZSA+IDAuMDAwNSApIHtcclxuXHJcbiAgICAgICAgLy8gd2VkZ2VzIGFsdGVybmF0ZSBmcm9tIGxpZ2h0IHRvIGRhcmssIHNvIHdlIGNhbiBjb3VudCBvbiB0aGUgcmVtYWluaW5nIHdlZGdlIGJlaW5nIHRoZSBhbHRlcm5hdGluZyBjb2xvclxyXG4gICAgICAgIGNvbnN0IHJlbWFpbmRlclNoYXBlID0gbnVtYmVyT2ZXZWRnZXMgJSAyID09PSAwID8gbGlnaHRTaGFwZSA6IGRhcmtTaGFwZTtcclxuXHJcbiAgICAgICAgY29uc3QgbmV4dElubmVyUG9pbnQgPSBmaXJzdElubmVyUG9pbnQucm90YXRlZEFib3V0UG9pbnQoIHZlcnRleENlbnRlciwgLXJlbWFpbmluZ0FuZ2xlICk7XHJcbiAgICAgICAgY29uc3QgbmV4dE91dGVyUG9pbnQgPSBmaXJzdE91dGVyUG9pbnQucm90YXRlZEFib3V0UG9pbnQoIHZlcnRleENlbnRlciwgLXJlbWFpbmluZ0FuZ2xlICk7XHJcblxyXG4gICAgICAgIENvcm5lckd1aWRlTm9kZS5kcmF3QW5nbGVTZWdtZW50KCByZW1haW5kZXJTaGFwZSwgZmlyc3RJbm5lclBvaW50LCBmaXJzdE91dGVyUG9pbnQsIG5leHRJbm5lclBvaW50LCBuZXh0T3V0ZXJQb2ludCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBkYXJrQW5nbGVQYXRoLnNoYXBlID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3U2hhcGUoIGxpZ2h0U2hhcGUgKTtcclxuICAgICAgbGlnaHRBbmdsZVBhdGguc2hhcGUgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdTaGFwZSggZGFya1NoYXBlICk7XHJcblxyXG4gICAgICAvLyBub3cgZHJhdyB0aGUgbGluZSBzbyB0aGF0IHdlIGNhbiB1cGRhdGUgdGhlIGFuZ2xlXHJcbiAgICAgIC8vIHN0YXJ0IG9mIHRoZSBmaXJzdCBndWlkaW5nIGxpbmUsIGFsb25nIHRoZSBsaW5lIGJldHdlZW4gdmVydGljZXMgcGFyYW1ldHJpY2FsbHlcclxuICAgICAgY29uc3QgaW5uZXJUID0gTWF0aC5taW4oICggRVhURVJOQUxfQU5HTEVfR1VJREVfTEVOR1RIIC8gMyApIC8gbGluZS5nZXRBcmNMZW5ndGgoKSwgMSApO1xyXG4gICAgICBjb25zdCBmaXJzdENyb3NzaGFpclBvaW50ID0gQ29ybmVyR3VpZGVOb2RlLmN1c3RvbVBvc2l0aW9uQXQoIGxpbmUsIGlubmVyVCApO1xyXG4gICAgICBjb25zdCBzZWNvbmRDcm9zc2hhaXJQb2ludCA9IENvcm5lckd1aWRlTm9kZS5jdXN0b21Qb3NpdGlvbkF0KCBsaW5lLCAtaW5uZXJUICk7XHJcblxyXG4gICAgICAvLyBmb3IgdGhlIHBvaW50cyBvbiB0aGUgc2Vjb25kIGNyb3NzaGFpciBsaW5lIHJvdGF0ZSBieSB0aGUgYW5nbGUgYXJvdW5kIHRoZSBjZW50ZXIgb2YgdGhlIHZlcnRleFxyXG4gICAgICBjb25zdCB0aGlyZENyb3NzaGFpclBvaW50ID0gZmlyc3RDcm9zc2hhaXJQb2ludC5yb3RhdGVkQWJvdXRQb2ludCggdmVydGV4Q2VudGVyLCAyICogTWF0aC5QSSAtIGRlZmluZWRBbmdsZSApO1xyXG4gICAgICBjb25zdCBmb3VydGhDcm9zc2hhaXJQb2ludCA9IHNlY29uZENyb3NzaGFpclBvaW50LnJvdGF0ZWRBYm91dFBvaW50KCB2ZXJ0ZXhDZW50ZXIsIDIgKiBNYXRoLlBJIC0gZGVmaW5lZEFuZ2xlICk7XHJcblxyXG4gICAgICBjb25zdCBjcm9zc2hhaXJTaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG4gICAgICBjcm9zc2hhaXJTaGFwZS5tb3ZlVG9Qb2ludCggZmlyc3RDcm9zc2hhaXJQb2ludCApO1xyXG4gICAgICBjcm9zc2hhaXJTaGFwZS5saW5lVG9Qb2ludCggc2Vjb25kQ3Jvc3NoYWlyUG9pbnQgKTtcclxuICAgICAgY3Jvc3NoYWlyU2hhcGUubW92ZVRvUG9pbnQoIHRoaXJkQ3Jvc3NoYWlyUG9pbnQgKTtcclxuICAgICAgY3Jvc3NoYWlyU2hhcGUubGluZVRvUG9pbnQoIGZvdXJ0aENyb3NzaGFpclBvaW50ICk7XHJcblxyXG4gICAgICBjcm9zc2hhaXJQYXRoLnNoYXBlID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3U2hhcGUoIGNyb3NzaGFpclNoYXBlICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYXJjTm9kZSA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGRhcmtBbmdsZVBhdGgsIGxpZ2h0QW5nbGVQYXRoIF0gfSApO1xyXG4gICAgdGhpcy5jaGlsZHJlbiA9IFsgYXJjTm9kZSwgY3Jvc3NoYWlyUGF0aCBdO1xyXG5cclxuICAgIC8vIFdoZW4gYXQgYSByaWdodCBhbmdsZSwgZGlzcGxheSB0aGUgUmlnaHRBbmdsZUluZGljYXRvciwgb3RoZXJ3aXNlIHRoZSBhcmNzIHJlcHJlc2VudGluZyBhbmdsZXMgYXJlIHNob3duLlxyXG4gICAgdmVydGV4MS5hbmdsZVByb3BlcnR5LmxpbmsoIGFuZ2xlID0+IHtcclxuICAgICAgYXJjTm9kZS52aXNpYmxlID0gIXNoYXBlTW9kZWwuaXNSaWdodEFuZ2xlKCBhbmdsZSEgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHBhcmFtZXRyaWMgcG9zaXRpb24gYWxvbmcgYSBsaW5lIGF0IHRoZSBwb3NpdGlvbiB0LiBNb2RpZmllZCBmcm9tIExpbmUucG9zaXRpb25BdCB0byBzdXBwb3J0XHJcbiAgICogcG9zaXRpb25zIG91dHNpZGUgdGhlIHJhbmdlIFswLCAxXSB3aGljaCBpcyBuZWNlc3NhcnkgZm9yIGRyYXdpbmcgY29kZSBpbiB0aGlzIGNvbXBvbmVudC5cclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyBjdXN0b21Qb3NpdGlvbkF0KCBsaW5lOiBMaW5lLCB0OiBudW1iZXIgKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gbGluZS5zdGFydC5wbHVzKCBsaW5lLmVuZC5taW51cyggbGluZS5zdGFydCApLnRpbWVzKCB0ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERyYXcgYSBzaW5nbGUgYW5nbGUgc2VnbWVudCBvZiB0aGUgYW5udWx1cy4gVGhlIHByb3ZpZGVkIHNoYXBlIHdpbGwgYmUgbXV0YXRlZCBieSB0aGlzIGZ1bmN0aW9uLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RhdGljIGRyYXdBbmdsZVNlZ21lbnQoIHNoYXBlOiBTaGFwZSwgZmlyc3RJbm5lclBvaW50OiBWZWN0b3IyLCBmaXJzdE91dGVyUG9pbnQ6IFZlY3RvcjIsIHNlY29uZElubmVyUG9pbnQ6IFZlY3RvcjIsIHNlY29uZE91dGVyUG9pbnQ6IFZlY3RvcjIgKTogdm9pZCB7XHJcbiAgICBzaGFwZS5tb3ZlVG9Qb2ludCggZmlyc3RJbm5lclBvaW50ICk7XHJcbiAgICBzaGFwZS5saW5lVG9Qb2ludCggZmlyc3RPdXRlclBvaW50ICk7XHJcbiAgICBzaGFwZS5lbGxpcHRpY2FsQXJjVG8oIE9VVEVSX1JBRElVUywgT1VURVJfUkFESVVTLCAwLCBmYWxzZSwgZmFsc2UsIHNlY29uZE91dGVyUG9pbnQueCwgc2Vjb25kT3V0ZXJQb2ludC55ICk7XHJcbiAgICBzaGFwZS5saW5lVG9Qb2ludCggc2Vjb25kSW5uZXJQb2ludCApO1xyXG4gICAgc2hhcGUuZWxsaXB0aWNhbEFyY1RvKCBJTk5FUl9SQURJVVMsIElOTkVSX1JBRElVUywgMCwgZmFsc2UsIGZhbHNlLCBmaXJzdElubmVyUG9pbnQueCwgZmlyc3RJbm5lclBvaW50LnkgKTtcclxuICAgIHNoYXBlLmNsb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5xdWFkcmlsYXRlcmFsLnJlZ2lzdGVyKCAnQ29ybmVyR3VpZGVOb2RlJywgQ29ybmVyR3VpZGVOb2RlICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtB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