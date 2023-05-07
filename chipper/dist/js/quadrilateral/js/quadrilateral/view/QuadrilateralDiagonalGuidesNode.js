// Copyright 2022-2023, University of Colorado Boulder

/**
 * Draws a diagonal line across the opposite pairs of vertex corners. Line extends across the model bounds.
 * Visibility is controlled by a checkbox in the screen.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../quadrilateral.js';
import { Line, Node } from '../../../../scenery/js/imports.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Ray2 from '../../../../dot/js/Ray2.js';
import { Shape } from '../../../../kite/js/imports.js';
import QuadrilateralColors from '../../QuadrilateralColors.js';
import QuadrilateralUtils from '../model/QuadrilateralUtils.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';

// constants
const LINE_NODE_OPTIONS = {
  lineWidth: 4,
  lineDash: [10, 3],
  stroke: QuadrilateralColors.diagonalGuidesStrokeColorProperty
};
export default class QuadrilateralDiagonalGuidesNode extends Node {
  constructor(quadrilateralShapeModel, visibleProperty, modelViewTransform) {
    super({
      visibleProperty: visibleProperty
    });
    const lineNode1 = new Line(LINE_NODE_OPTIONS);
    this.addChild(lineNode1);
    const lineNode2 = new Line(LINE_NODE_OPTIONS);
    this.addChild(lineNode2);
    Multilink.multilink([quadrilateralShapeModel.vertexA.positionProperty, quadrilateralShapeModel.vertexC.positionProperty], (vertexAPosition, vertexCPosition) => {
      QuadrilateralDiagonalGuidesNode.drawDiagonal(vertexAPosition, vertexCPosition, QuadrilateralConstants.MODEL_BOUNDS, modelViewTransform, lineNode1);
    });
    Multilink.multilink([quadrilateralShapeModel.vertexB.positionProperty, quadrilateralShapeModel.vertexD.positionProperty], (vertexBPosition, vertexDPosition) => {
      QuadrilateralDiagonalGuidesNode.drawDiagonal(vertexBPosition, vertexDPosition, QuadrilateralConstants.MODEL_BOUNDS, modelViewTransform, lineNode2);
    });
  }

  /**
   * Draws a line between the provided vertex positions. The line spans across the positions until it intersects
   * with model bounds. This could have been done with a clip area but I worry about clip area performance.
   */
  static drawDiagonal(vertex1Position, vertex2Position, bounds, modelViewTransform, lineNode) {
    const boundsShape = Shape.bounds(bounds);
    const p1 = QuadrilateralDiagonalGuidesNode.getBestIntersectionPoint(vertex1Position, vertex2Position, bounds, boundsShape);
    const p2 = QuadrilateralDiagonalGuidesNode.getBestIntersectionPoint(vertex2Position, vertex1Position, bounds, boundsShape);
    const p1View = modelViewTransform.modelToViewPosition(p1);
    const p2View = modelViewTransform.modelToViewPosition(p2);
    lineNode.setPoint1(p1View);
    lineNode.setPoint2(p2View);
  }

  /**
   * Creates a ray from vertex1Position to vertex2Position and returns the intersection point of that ray and the
   * provided bounds. This will be one of the end points for the Line created by this Node. This functions works around
   * a Kite limitation that an intersection is undefined if the Ray intersects exactly with a start/end point of a
   * shape segment.
   */
  static getBestIntersectionPoint(vertex1Position, vertex2Position, bounds, boundsShape) {
    const rayDirection = vertex2Position.minus(vertex1Position).normalized();
    const ray = new Ray2(vertex1Position, rayDirection);

    // First, look for an intersection against one of the corners of the bounds. If there is one, default
    // Kite shape intersection will return 0 intersections (because it is undefined) or 2 intersections (because it is
    // close enough to both intersecting segments at the corner point).
    let point = QuadrilateralUtils.getBoundsCornerPositionAlongRay(ray, bounds);
    if (!point) {
      // There was not an intersection with a corner, we should be safe to use Kite for shape intersection
      const intersections = boundsShape.intersection(ray);
      assert && assert(intersections.length === 1, 'There should one (and only one) intersection');
      point = intersections[0].point;
    }
    assert && assert(point, 'Could not find an intersection point for the ray within the bounds.');
    return point;
  }
}
quadrilateral.register('QuadrilateralDiagonalGuidesNode', QuadrilateralDiagonalGuidesNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJxdWFkcmlsYXRlcmFsIiwiTGluZSIsIk5vZGUiLCJNdWx0aWxpbmsiLCJSYXkyIiwiU2hhcGUiLCJRdWFkcmlsYXRlcmFsQ29sb3JzIiwiUXVhZHJpbGF0ZXJhbFV0aWxzIiwiUXVhZHJpbGF0ZXJhbENvbnN0YW50cyIsIkxJTkVfTk9ERV9PUFRJT05TIiwibGluZVdpZHRoIiwibGluZURhc2giLCJzdHJva2UiLCJkaWFnb25hbEd1aWRlc1N0cm9rZUNvbG9yUHJvcGVydHkiLCJRdWFkcmlsYXRlcmFsRGlhZ29uYWxHdWlkZXNOb2RlIiwiY29uc3RydWN0b3IiLCJxdWFkcmlsYXRlcmFsU2hhcGVNb2RlbCIsInZpc2libGVQcm9wZXJ0eSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImxpbmVOb2RlMSIsImFkZENoaWxkIiwibGluZU5vZGUyIiwibXVsdGlsaW5rIiwidmVydGV4QSIsInBvc2l0aW9uUHJvcGVydHkiLCJ2ZXJ0ZXhDIiwidmVydGV4QVBvc2l0aW9uIiwidmVydGV4Q1Bvc2l0aW9uIiwiZHJhd0RpYWdvbmFsIiwiTU9ERUxfQk9VTkRTIiwidmVydGV4QiIsInZlcnRleEQiLCJ2ZXJ0ZXhCUG9zaXRpb24iLCJ2ZXJ0ZXhEUG9zaXRpb24iLCJ2ZXJ0ZXgxUG9zaXRpb24iLCJ2ZXJ0ZXgyUG9zaXRpb24iLCJib3VuZHMiLCJsaW5lTm9kZSIsImJvdW5kc1NoYXBlIiwicDEiLCJnZXRCZXN0SW50ZXJzZWN0aW9uUG9pbnQiLCJwMiIsInAxVmlldyIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJwMlZpZXciLCJzZXRQb2ludDEiLCJzZXRQb2ludDIiLCJyYXlEaXJlY3Rpb24iLCJtaW51cyIsIm5vcm1hbGl6ZWQiLCJyYXkiLCJwb2ludCIsImdldEJvdW5kc0Nvcm5lclBvc2l0aW9uQWxvbmdSYXkiLCJpbnRlcnNlY3Rpb25zIiwiaW50ZXJzZWN0aW9uIiwiYXNzZXJ0IiwibGVuZ3RoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJRdWFkcmlsYXRlcmFsRGlhZ29uYWxHdWlkZXNOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERyYXdzIGEgZGlhZ29uYWwgbGluZSBhY3Jvc3MgdGhlIG9wcG9zaXRlIHBhaXJzIG9mIHZlcnRleCBjb3JuZXJzLiBMaW5lIGV4dGVuZHMgYWNyb3NzIHRoZSBtb2RlbCBib3VuZHMuXHJcbiAqIFZpc2liaWxpdHkgaXMgY29udHJvbGxlZCBieSBhIGNoZWNrYm94IGluIHRoZSBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBxdWFkcmlsYXRlcmFsIGZyb20gJy4uLy4uL3F1YWRyaWxhdGVyYWwuanMnO1xyXG5pbXBvcnQgeyBMaW5lLCBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFF1YWRyaWxhdGVyYWxTaGFwZU1vZGVsIGZyb20gJy4uL21vZGVsL1F1YWRyaWxhdGVyYWxTaGFwZU1vZGVsLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBSYXkyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYXkyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUXVhZHJpbGF0ZXJhbENvbG9ycyBmcm9tICcuLi8uLi9RdWFkcmlsYXRlcmFsQ29sb3JzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgUXVhZHJpbGF0ZXJhbFV0aWxzIGZyb20gJy4uL21vZGVsL1F1YWRyaWxhdGVyYWxVdGlscy5qcyc7XHJcbmltcG9ydCBRdWFkcmlsYXRlcmFsQ29uc3RhbnRzIGZyb20gJy4uLy4uL1F1YWRyaWxhdGVyYWxDb25zdGFudHMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IExJTkVfTk9ERV9PUFRJT05TID0ge1xyXG4gIGxpbmVXaWR0aDogNCxcclxuICBsaW5lRGFzaDogWyAxMCwgMyBdLFxyXG4gIHN0cm9rZTogUXVhZHJpbGF0ZXJhbENvbG9ycy5kaWFnb25hbEd1aWRlc1N0cm9rZUNvbG9yUHJvcGVydHlcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFF1YWRyaWxhdGVyYWxEaWFnb25hbEd1aWRlc05vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHF1YWRyaWxhdGVyYWxTaGFwZU1vZGVsOiBRdWFkcmlsYXRlcmFsU2hhcGVNb2RlbCwgdmlzaWJsZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiwgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yICkge1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogdmlzaWJsZVByb3BlcnR5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbGluZU5vZGUxID0gbmV3IExpbmUoIExJTkVfTk9ERV9PUFRJT05TICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBsaW5lTm9kZTEgKTtcclxuXHJcbiAgICBjb25zdCBsaW5lTm9kZTIgPSBuZXcgTGluZSggTElORV9OT0RFX09QVElPTlMgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGxpbmVOb2RlMiApO1xyXG5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoXHJcbiAgICAgIFsgcXVhZHJpbGF0ZXJhbFNoYXBlTW9kZWwudmVydGV4QS5wb3NpdGlvblByb3BlcnR5LCBxdWFkcmlsYXRlcmFsU2hhcGVNb2RlbC52ZXJ0ZXhDLnBvc2l0aW9uUHJvcGVydHkgXSxcclxuICAgICAgKCB2ZXJ0ZXhBUG9zaXRpb24sIHZlcnRleENQb3NpdGlvbiApID0+IHtcclxuICAgICAgICBRdWFkcmlsYXRlcmFsRGlhZ29uYWxHdWlkZXNOb2RlLmRyYXdEaWFnb25hbCggdmVydGV4QVBvc2l0aW9uLCB2ZXJ0ZXhDUG9zaXRpb24sIFF1YWRyaWxhdGVyYWxDb25zdGFudHMuTU9ERUxfQk9VTkRTLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIGxpbmVOb2RlMSApO1xyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoXHJcbiAgICAgIFsgcXVhZHJpbGF0ZXJhbFNoYXBlTW9kZWwudmVydGV4Qi5wb3NpdGlvblByb3BlcnR5LCBxdWFkcmlsYXRlcmFsU2hhcGVNb2RlbC52ZXJ0ZXhELnBvc2l0aW9uUHJvcGVydHkgXSxcclxuICAgICAgKCB2ZXJ0ZXhCUG9zaXRpb24sIHZlcnRleERQb3NpdGlvbiApID0+IHtcclxuICAgICAgICBRdWFkcmlsYXRlcmFsRGlhZ29uYWxHdWlkZXNOb2RlLmRyYXdEaWFnb25hbCggdmVydGV4QlBvc2l0aW9uLCB2ZXJ0ZXhEUG9zaXRpb24sIFF1YWRyaWxhdGVyYWxDb25zdGFudHMuTU9ERUxfQk9VTkRTLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIGxpbmVOb2RlMiApO1xyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRHJhd3MgYSBsaW5lIGJldHdlZW4gdGhlIHByb3ZpZGVkIHZlcnRleCBwb3NpdGlvbnMuIFRoZSBsaW5lIHNwYW5zIGFjcm9zcyB0aGUgcG9zaXRpb25zIHVudGlsIGl0IGludGVyc2VjdHNcclxuICAgKiB3aXRoIG1vZGVsIGJvdW5kcy4gVGhpcyBjb3VsZCBoYXZlIGJlZW4gZG9uZSB3aXRoIGEgY2xpcCBhcmVhIGJ1dCBJIHdvcnJ5IGFib3V0IGNsaXAgYXJlYSBwZXJmb3JtYW5jZS5cclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyBkcmF3RGlhZ29uYWwoIHZlcnRleDFQb3NpdGlvbjogVmVjdG9yMiwgdmVydGV4MlBvc2l0aW9uOiBWZWN0b3IyLCBib3VuZHM6IEJvdW5kczIsIG1vZGVsVmlld1RyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMiwgbGluZU5vZGU6IExpbmUgKTogdm9pZCB7XHJcblxyXG4gICAgY29uc3QgYm91bmRzU2hhcGUgPSBTaGFwZS5ib3VuZHMoIGJvdW5kcyApO1xyXG4gICAgY29uc3QgcDEgPSBRdWFkcmlsYXRlcmFsRGlhZ29uYWxHdWlkZXNOb2RlLmdldEJlc3RJbnRlcnNlY3Rpb25Qb2ludCggdmVydGV4MVBvc2l0aW9uLCB2ZXJ0ZXgyUG9zaXRpb24sIGJvdW5kcywgYm91bmRzU2hhcGUgKTtcclxuICAgIGNvbnN0IHAyID0gUXVhZHJpbGF0ZXJhbERpYWdvbmFsR3VpZGVzTm9kZS5nZXRCZXN0SW50ZXJzZWN0aW9uUG9pbnQoIHZlcnRleDJQb3NpdGlvbiwgdmVydGV4MVBvc2l0aW9uLCBib3VuZHMsIGJvdW5kc1NoYXBlICk7XHJcblxyXG4gICAgY29uc3QgcDFWaWV3ID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHAxICk7XHJcbiAgICBjb25zdCBwMlZpZXcgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggcDIgKTtcclxuXHJcbiAgICBsaW5lTm9kZS5zZXRQb2ludDEoIHAxVmlldyApO1xyXG4gICAgbGluZU5vZGUuc2V0UG9pbnQyKCBwMlZpZXcgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSByYXkgZnJvbSB2ZXJ0ZXgxUG9zaXRpb24gdG8gdmVydGV4MlBvc2l0aW9uIGFuZCByZXR1cm5zIHRoZSBpbnRlcnNlY3Rpb24gcG9pbnQgb2YgdGhhdCByYXkgYW5kIHRoZVxyXG4gICAqIHByb3ZpZGVkIGJvdW5kcy4gVGhpcyB3aWxsIGJlIG9uZSBvZiB0aGUgZW5kIHBvaW50cyBmb3IgdGhlIExpbmUgY3JlYXRlZCBieSB0aGlzIE5vZGUuIFRoaXMgZnVuY3Rpb25zIHdvcmtzIGFyb3VuZFxyXG4gICAqIGEgS2l0ZSBsaW1pdGF0aW9uIHRoYXQgYW4gaW50ZXJzZWN0aW9uIGlzIHVuZGVmaW5lZCBpZiB0aGUgUmF5IGludGVyc2VjdHMgZXhhY3RseSB3aXRoIGEgc3RhcnQvZW5kIHBvaW50IG9mIGFcclxuICAgKiBzaGFwZSBzZWdtZW50LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RhdGljIGdldEJlc3RJbnRlcnNlY3Rpb25Qb2ludCggdmVydGV4MVBvc2l0aW9uOiBWZWN0b3IyLCB2ZXJ0ZXgyUG9zaXRpb246IFZlY3RvcjIsIGJvdW5kczogQm91bmRzMiwgYm91bmRzU2hhcGU6IFNoYXBlICk6IFZlY3RvcjIge1xyXG4gICAgY29uc3QgcmF5RGlyZWN0aW9uID0gdmVydGV4MlBvc2l0aW9uLm1pbnVzKCB2ZXJ0ZXgxUG9zaXRpb24gKS5ub3JtYWxpemVkKCk7XHJcbiAgICBjb25zdCByYXkgPSBuZXcgUmF5MiggdmVydGV4MVBvc2l0aW9uLCByYXlEaXJlY3Rpb24gKTtcclxuXHJcbiAgICAvLyBGaXJzdCwgbG9vayBmb3IgYW4gaW50ZXJzZWN0aW9uIGFnYWluc3Qgb25lIG9mIHRoZSBjb3JuZXJzIG9mIHRoZSBib3VuZHMuIElmIHRoZXJlIGlzIG9uZSwgZGVmYXVsdFxyXG4gICAgLy8gS2l0ZSBzaGFwZSBpbnRlcnNlY3Rpb24gd2lsbCByZXR1cm4gMCBpbnRlcnNlY3Rpb25zIChiZWNhdXNlIGl0IGlzIHVuZGVmaW5lZCkgb3IgMiBpbnRlcnNlY3Rpb25zIChiZWNhdXNlIGl0IGlzXHJcbiAgICAvLyBjbG9zZSBlbm91Z2ggdG8gYm90aCBpbnRlcnNlY3Rpbmcgc2VnbWVudHMgYXQgdGhlIGNvcm5lciBwb2ludCkuXHJcbiAgICBsZXQgcG9pbnQgPSBRdWFkcmlsYXRlcmFsVXRpbHMuZ2V0Qm91bmRzQ29ybmVyUG9zaXRpb25BbG9uZ1JheSggcmF5LCBib3VuZHMgKSE7XHJcbiAgICBpZiAoICFwb2ludCApIHtcclxuXHJcbiAgICAgIC8vIFRoZXJlIHdhcyBub3QgYW4gaW50ZXJzZWN0aW9uIHdpdGggYSBjb3JuZXIsIHdlIHNob3VsZCBiZSBzYWZlIHRvIHVzZSBLaXRlIGZvciBzaGFwZSBpbnRlcnNlY3Rpb25cclxuICAgICAgY29uc3QgaW50ZXJzZWN0aW9ucyA9IGJvdW5kc1NoYXBlLmludGVyc2VjdGlvbiggcmF5ICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGludGVyc2VjdGlvbnMubGVuZ3RoID09PSAxLCAnVGhlcmUgc2hvdWxkIG9uZSAoYW5kIG9ubHkgb25lKSBpbnRlcnNlY3Rpb24nICk7XHJcbiAgICAgIHBvaW50ID0gaW50ZXJzZWN0aW9uc1sgMCBdLnBvaW50O1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBvaW50LCAnQ291bGQgbm90IGZpbmQgYW4gaW50ZXJzZWN0aW9uIHBvaW50IGZvciB0aGUgcmF5IHdpdGhpbiB0aGUgYm91bmRzLicgKTtcclxuICAgIHJldHVybiBwb2ludDtcclxuICB9XHJcbn1cclxuXHJcbnF1YWRyaWxhdGVyYWwucmVnaXN0ZXIoICdRdWFkcmlsYXRlcmFsRGlhZ29uYWxHdWlkZXNOb2RlJywgUXVhZHJpbGF0ZXJhbERpYWdvbmFsR3VpZGVzTm9kZSApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxhQUFhLE1BQU0sd0JBQXdCO0FBQ2xELFNBQVND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