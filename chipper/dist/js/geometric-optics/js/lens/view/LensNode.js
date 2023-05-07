// Copyright 2021-2022, University of Colorado Boulder

/**
 * LensNode displays a lens.
 *
 * @author Martin Veillette
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Line, Node, Path } from '../../../../scenery/js/imports.js';
import geometricOptics from '../../geometricOptics.js';
import GOColors from '../../common/GOColors.js';
import LensShapes from '../model/LensShapes.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import GOQueryParameters from '../../common/GOQueryParameters.js';
import OriginNode from '../../common/view/OriginNode.js';
import optionize from '../../../../phet-core/js/optionize.js';
// constants
const FILL_PROPERTY = GOColors.lensFillProperty;
const STROKE_PROPERTY = GOColors.lensStrokeProperty;
const LINE_WIDTH = 2;
const ICON_RADIUS_OF_CURVATURE_MAGNITUDE = 20;
const ICON_DIAMETER = 30;
export default class LensNode extends Node {
  constructor(lens, modelViewTransform, providedOptions) {
    const options = optionize()({
      // NodeOptions
      phetioVisiblePropertyInstrumented: false
    }, providedOptions);
    super(options);
    const fillNode = new Path(null, {
      fill: FILL_PROPERTY
    });

    // Separate Node for stroke, because we'll be changing fillNode opacity to match IOR.
    const strokeNode = new Path(null, {
      stroke: STROKE_PROPERTY,
      lineWidth: LINE_WIDTH
    });

    // Vertical axis for the lens, see https://github.com/phetsims/geometric-optics/issues/190
    const verticalCenterLine = new Line(0, 0, 0, 1, {
      stroke: GOColors.verticalAxisStrokeProperty,
      lineWidth: 2
    });
    const children = [fillNode, verticalCenterLine, strokeNode];

    // Red dot at the origin
    if (GOQueryParameters.debugOrigins) {
      children.push(new OriginNode());
    }
    this.children = children;

    // Shapes are described in model coordinates. Scale them to view coordinates.
    // Translation is handled by lens.positionProperty listener.
    const scaleVector = modelViewTransform.getMatrix().getScaleVector();
    const scalingMatrix = Matrix3.scaling(scaleVector.x, scaleVector.y);
    lens.shapesProperty.link(shapes => {
      const shape = shapes.lensShape.transformed(scalingMatrix);
      fillNode.shape = shape;
      strokeNode.shape = shape;
    });
    lens.positionProperty.link(position => {
      this.translation = modelViewTransform.modelToViewPosition(position);
    });
    lens.diameterProperty.link(diameter => {
      const radiusView = modelViewTransform.modelToViewDeltaY(diameter / 2);
      verticalCenterLine.setLine(0, -radiusView, 0, radiusView);
    });
    lens.opacityProperty.linkAttribute(fillNode, 'opacity');
    this.addLinkedElement(lens, {
      tandem: options.tandem.createTandem(lens.tandem.name)
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }

  /**
   * Creates an icon for a lens.
   */
  static createIconNode(opticSurfaceType) {
    assert && assert(opticSurfaceType !== 'flat', 'flat lens is not supported');
    const radiusOfCurvature = opticSurfaceType === 'convex' ? ICON_RADIUS_OF_CURVATURE_MAGNITUDE : -ICON_RADIUS_OF_CURVATURE_MAGNITUDE;
    const lensShapes = new LensShapes(radiusOfCurvature, ICON_DIAMETER, {
      isHollywooded: false
    });
    const fillNode = new Path(lensShapes.lensShape, {
      fill: GOColors.lensFillProperty
    });
    const strokeNode = new Path(lensShapes.lensShape, {
      stroke: GOColors.lensStrokeProperty
    });
    return new Node({
      children: [fillNode, strokeNode]
    });
  }
}
geometricOptics.register('LensNode', LensNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaW5lIiwiTm9kZSIsIlBhdGgiLCJnZW9tZXRyaWNPcHRpY3MiLCJHT0NvbG9ycyIsIkxlbnNTaGFwZXMiLCJNYXRyaXgzIiwiR09RdWVyeVBhcmFtZXRlcnMiLCJPcmlnaW5Ob2RlIiwib3B0aW9uaXplIiwiRklMTF9QUk9QRVJUWSIsImxlbnNGaWxsUHJvcGVydHkiLCJTVFJPS0VfUFJPUEVSVFkiLCJsZW5zU3Ryb2tlUHJvcGVydHkiLCJMSU5FX1dJRFRIIiwiSUNPTl9SQURJVVNfT0ZfQ1VSVkFUVVJFX01BR05JVFVERSIsIklDT05fRElBTUVURVIiLCJMZW5zTm9kZSIsImNvbnN0cnVjdG9yIiwibGVucyIsIm1vZGVsVmlld1RyYW5zZm9ybSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJmaWxsTm9kZSIsImZpbGwiLCJzdHJva2VOb2RlIiwic3Ryb2tlIiwibGluZVdpZHRoIiwidmVydGljYWxDZW50ZXJMaW5lIiwidmVydGljYWxBeGlzU3Ryb2tlUHJvcGVydHkiLCJjaGlsZHJlbiIsImRlYnVnT3JpZ2lucyIsInB1c2giLCJzY2FsZVZlY3RvciIsImdldE1hdHJpeCIsImdldFNjYWxlVmVjdG9yIiwic2NhbGluZ01hdHJpeCIsInNjYWxpbmciLCJ4IiwieSIsInNoYXBlc1Byb3BlcnR5IiwibGluayIsInNoYXBlcyIsInNoYXBlIiwibGVuc1NoYXBlIiwidHJhbnNmb3JtZWQiLCJwb3NpdGlvblByb3BlcnR5IiwicG9zaXRpb24iLCJ0cmFuc2xhdGlvbiIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJkaWFtZXRlclByb3BlcnR5IiwiZGlhbWV0ZXIiLCJyYWRpdXNWaWV3IiwibW9kZWxUb1ZpZXdEZWx0YVkiLCJzZXRMaW5lIiwib3BhY2l0eVByb3BlcnR5IiwibGlua0F0dHJpYnV0ZSIsImFkZExpbmtlZEVsZW1lbnQiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJuYW1lIiwiZGlzcG9zZSIsImFzc2VydCIsImNyZWF0ZUljb25Ob2RlIiwib3B0aWNTdXJmYWNlVHlwZSIsInJhZGl1c09mQ3VydmF0dXJlIiwibGVuc1NoYXBlcyIsImlzSG9sbHl3b29kZWQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxlbnNOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIExlbnNOb2RlIGRpc3BsYXlzIGEgbGVucy5cclxuICpcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgeyBMaW5lLCBOb2RlLCBOb2RlT3B0aW9ucywgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBnZW9tZXRyaWNPcHRpY3MgZnJvbSAnLi4vLi4vZ2VvbWV0cmljT3B0aWNzLmpzJztcclxuaW1wb3J0IEdPQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9HT0NvbG9ycy5qcyc7XHJcbmltcG9ydCBMZW5zIGZyb20gJy4uL21vZGVsL0xlbnMuanMnO1xyXG5pbXBvcnQgeyBPcHRpY1N1cmZhY2VUeXBlIH0gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL09wdGljU3VyZmFjZVR5cGUuanMnO1xyXG5pbXBvcnQgTGVuc1NoYXBlcyBmcm9tICcuLi9tb2RlbC9MZW5zU2hhcGVzLmpzJztcclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgR09RdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vLi4vY29tbW9uL0dPUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IE9yaWdpbk5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvT3JpZ2luTm9kZS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEZJTExfUFJPUEVSVFkgPSBHT0NvbG9ycy5sZW5zRmlsbFByb3BlcnR5O1xyXG5jb25zdCBTVFJPS0VfUFJPUEVSVFkgPSBHT0NvbG9ycy5sZW5zU3Ryb2tlUHJvcGVydHk7XHJcbmNvbnN0IExJTkVfV0lEVEggPSAyO1xyXG5jb25zdCBJQ09OX1JBRElVU19PRl9DVVJWQVRVUkVfTUFHTklUVURFID0gMjA7XHJcbmNvbnN0IElDT05fRElBTUVURVIgPSAzMDtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBMZW5zTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxOb2RlT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGVuc05vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsZW5zOiBMZW5zLCBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIsIHByb3ZpZGVkT3B0aW9uczogTGVuc05vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TGVuc05vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIE5vZGVPcHRpb25zXHJcbiAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2VcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgZmlsbE5vZGUgPSBuZXcgUGF0aCggbnVsbCwge1xyXG4gICAgICBmaWxsOiBGSUxMX1BST1BFUlRZXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU2VwYXJhdGUgTm9kZSBmb3Igc3Ryb2tlLCBiZWNhdXNlIHdlJ2xsIGJlIGNoYW5naW5nIGZpbGxOb2RlIG9wYWNpdHkgdG8gbWF0Y2ggSU9SLlxyXG4gICAgY29uc3Qgc3Ryb2tlTm9kZSA9IG5ldyBQYXRoKCBudWxsLCB7XHJcbiAgICAgIHN0cm9rZTogU1RST0tFX1BST1BFUlRZLFxyXG4gICAgICBsaW5lV2lkdGg6IExJTkVfV0lEVEhcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBWZXJ0aWNhbCBheGlzIGZvciB0aGUgbGVucywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9nZW9tZXRyaWMtb3B0aWNzL2lzc3Vlcy8xOTBcclxuICAgIGNvbnN0IHZlcnRpY2FsQ2VudGVyTGluZSA9IG5ldyBMaW5lKCAwLCAwLCAwLCAxLCB7XHJcbiAgICAgIHN0cm9rZTogR09Db2xvcnMudmVydGljYWxBeGlzU3Ryb2tlUHJvcGVydHksXHJcbiAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGNoaWxkcmVuOiBOb2RlW10gPSBbIGZpbGxOb2RlLCB2ZXJ0aWNhbENlbnRlckxpbmUsIHN0cm9rZU5vZGUgXTtcclxuXHJcbiAgICAvLyBSZWQgZG90IGF0IHRoZSBvcmlnaW5cclxuICAgIGlmICggR09RdWVyeVBhcmFtZXRlcnMuZGVidWdPcmlnaW5zICkge1xyXG4gICAgICBjaGlsZHJlbi5wdXNoKCBuZXcgT3JpZ2luTm9kZSgpICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xyXG5cclxuICAgIC8vIFNoYXBlcyBhcmUgZGVzY3JpYmVkIGluIG1vZGVsIGNvb3JkaW5hdGVzLiBTY2FsZSB0aGVtIHRvIHZpZXcgY29vcmRpbmF0ZXMuXHJcbiAgICAvLyBUcmFuc2xhdGlvbiBpcyBoYW5kbGVkIGJ5IGxlbnMucG9zaXRpb25Qcm9wZXJ0eSBsaXN0ZW5lci5cclxuICAgIGNvbnN0IHNjYWxlVmVjdG9yID0gbW9kZWxWaWV3VHJhbnNmb3JtLmdldE1hdHJpeCgpLmdldFNjYWxlVmVjdG9yKCk7XHJcbiAgICBjb25zdCBzY2FsaW5nTWF0cml4ID0gTWF0cml4My5zY2FsaW5nKCBzY2FsZVZlY3Rvci54LCBzY2FsZVZlY3Rvci55ICk7XHJcbiAgICBsZW5zLnNoYXBlc1Byb3BlcnR5LmxpbmsoIHNoYXBlcyA9PiB7XHJcbiAgICAgIGNvbnN0IHNoYXBlID0gc2hhcGVzLmxlbnNTaGFwZS50cmFuc2Zvcm1lZCggc2NhbGluZ01hdHJpeCApO1xyXG4gICAgICBmaWxsTm9kZS5zaGFwZSA9IHNoYXBlO1xyXG4gICAgICBzdHJva2VOb2RlLnNoYXBlID0gc2hhcGU7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgbGVucy5wb3NpdGlvblByb3BlcnR5LmxpbmsoIHBvc2l0aW9uID0+IHtcclxuICAgICAgdGhpcy50cmFuc2xhdGlvbiA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBwb3NpdGlvbiApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGxlbnMuZGlhbWV0ZXJQcm9wZXJ0eS5saW5rKCBkaWFtZXRlciA9PiB7XHJcbiAgICAgIGNvbnN0IHJhZGl1c1ZpZXcgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVkoIGRpYW1ldGVyIC8gMiApO1xyXG4gICAgICB2ZXJ0aWNhbENlbnRlckxpbmUuc2V0TGluZSggMCwgLXJhZGl1c1ZpZXcsIDAsIHJhZGl1c1ZpZXcgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBsZW5zLm9wYWNpdHlQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCBmaWxsTm9kZSwgJ29wYWNpdHknICk7XHJcblxyXG4gICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBsZW5zLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCBsZW5zLnRhbmRlbS5uYW1lIClcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGFuIGljb24gZm9yIGEgbGVucy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUljb25Ob2RlKCBvcHRpY1N1cmZhY2VUeXBlOiBPcHRpY1N1cmZhY2VUeXBlICk6IE5vZGUge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aWNTdXJmYWNlVHlwZSAhPT0gJ2ZsYXQnLCAnZmxhdCBsZW5zIGlzIG5vdCBzdXBwb3J0ZWQnICk7XHJcblxyXG4gICAgY29uc3QgcmFkaXVzT2ZDdXJ2YXR1cmUgPSAoIG9wdGljU3VyZmFjZVR5cGUgPT09ICdjb252ZXgnICkgPyBJQ09OX1JBRElVU19PRl9DVVJWQVRVUkVfTUFHTklUVURFIDogLUlDT05fUkFESVVTX09GX0NVUlZBVFVSRV9NQUdOSVRVREU7XHJcblxyXG4gICAgY29uc3QgbGVuc1NoYXBlcyA9IG5ldyBMZW5zU2hhcGVzKCByYWRpdXNPZkN1cnZhdHVyZSwgSUNPTl9ESUFNRVRFUiwge1xyXG4gICAgICBpc0hvbGx5d29vZGVkOiBmYWxzZVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGZpbGxOb2RlID0gbmV3IFBhdGgoIGxlbnNTaGFwZXMubGVuc1NoYXBlLCB7XHJcbiAgICAgIGZpbGw6IEdPQ29sb3JzLmxlbnNGaWxsUHJvcGVydHlcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBzdHJva2VOb2RlID0gbmV3IFBhdGgoIGxlbnNTaGFwZXMubGVuc1NoYXBlLCB7XHJcbiAgICAgIHN0cm9rZTogR09Db2xvcnMubGVuc1N0cm9rZVByb3BlcnR5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIGZpbGxOb2RlLCBzdHJva2VOb2RlIF1cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmdlb21ldHJpY09wdGljcy5yZWdpc3RlciggJ0xlbnNOb2RlJywgTGVuc05vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxTQUFTQSxJQUFJLEVBQUVDLElBQUksRUFBZUMsSUFBSSxRQUFRLG1DQUFtQztBQUNqRixPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLFFBQVEsTUFBTSwwQkFBMEI7QUFHL0MsT0FBT0MsVUFBVSxNQUFNLHdCQUF3QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGlCQUFpQixNQUFNLG1DQUFtQztBQUNqRSxPQUFPQyxVQUFVLE1BQU0saUNBQWlDO0FBQ3hELE9BQU9DLFNBQVMsTUFBNEIsdUNBQXVDO0FBR25GO0FBQ0EsTUFBTUMsYUFBYSxHQUFHTixRQUFRLENBQUNPLGdCQUFnQjtBQUMvQyxNQUFNQyxlQUFlLEdBQUdSLFFBQVEsQ0FBQ1Msa0JBQWtCO0FBQ25ELE1BQU1DLFVBQVUsR0FBRyxDQUFDO0FBQ3BCLE1BQU1DLGtDQUFrQyxHQUFHLEVBQUU7QUFDN0MsTUFBTUMsYUFBYSxHQUFHLEVBQUU7QUFNeEIsZUFBZSxNQUFNQyxRQUFRLFNBQVNoQixJQUFJLENBQUM7RUFFbENpQixXQUFXQSxDQUFFQyxJQUFVLEVBQUVDLGtCQUF1QyxFQUFF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