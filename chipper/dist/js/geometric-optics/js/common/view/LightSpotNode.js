// Copyright 2021-2022, University of Colorado Boulder

/**
 * LightSpotNode is a light spot that is projected onto the projection screen.
 * It is responsible for creating the light spot's shape, and clipping it to the projection screen.
 *
 * @author Martin Veillette
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Utils from '../../../../dot/js/Utils.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import GOColors from '../../common/GOColors.js';
import geometricOptics from '../../geometricOptics.js';
import GOConstants from '../GOConstants.js';
import GOQueryParameters from '../GOQueryParameters.js';
import { Shape } from '../../../../kite/js/imports.js';
import Multilink from '../../../../axon/js/Multilink.js';
export default class LightSpotNode extends Node {
  constructor(lightSpot, projectionScreen, modelViewTransform, providedOptions) {
    super(providedOptions);

    // Fill color of the spot
    const fillPath = new Path(null, {
      fill: GOColors.lightSpotFillProperty
    });

    // Dashed outline of the spot, so it's easier to see when intensity is low.
    // See https://github.com/phetsims/geometric-optics/issues/240
    const strokePath = new Path(null, {
      stroke: GOColors.lightSpotStrokeProperty,
      lineWidth: 0.75,
      lineDash: [4, 4]
    });
    const fillAndStrokeNode = new Node({
      children: [fillPath, strokePath]
    });
    this.addChild(fillAndStrokeNode);

    // Complete, un-clipped path, for debugging.
    let debugStrokePath = null;
    if (GOQueryParameters.debugLightSpots) {
      debugStrokePath = new Path(null, {
        stroke: 'red'
      });
      this.addChild(debugStrokePath);
    }
    Multilink.multilink([lightSpot.positionProperty, lightSpot.diameterProperty], (position, diameter) => {
      // An ellipse with aspect ratio of 1:2, to give pseudo-3D perspective.
      const radiusX = diameter / 4;
      const radiusY = diameter / 2;
      const modelShape = Shape.ellipse(position.x, position.y, radiusX, radiusY, 2 * Math.PI);
      const viewShape = modelViewTransform.modelToViewShape(modelShape);
      fillPath.shape = viewShape;
      strokePath.shape = viewShape;
      debugStrokePath && (debugStrokePath.shape = viewShape);
    });
    lightSpot.intensityProperty.link(intensity => {
      // Opacity is equivalent to opacity.
      assert && assert(GOConstants.OPACITY_RANGE.equals(GOConstants.INTENSITY_RANGE));
      const opacity = intensity;

      // Intensity of light is the opacity of the spot color.
      fillPath.opacity = opacity;

      // Dashed outline is visible only for lower intensities [0,0.25], and becomes more visible as intensity decreases.
      // See https://github.com/phetsims/geometric-optics/issues/240
      strokePath.opacity = Utils.clamp(Utils.linear(0, 0.25, 1, 0, opacity), 0, 1);
    });

    // Clip the light spot to the projection screen.
    projectionScreen.positionProperty.link(projectionScreenPosition => {
      const projectionScreenShape = projectionScreen.getScreenShapeTranslated();
      fillAndStrokeNode.clipArea = modelViewTransform.modelToViewShape(projectionScreenShape);
    });
    this.addLinkedElement(lightSpot, {
      tandem: providedOptions.tandem.createTandem(lightSpot.tandem.name)
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
geometricOptics.register('LightSpotNode', LightSpotNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIk5vZGUiLCJQYXRoIiwiR09Db2xvcnMiLCJnZW9tZXRyaWNPcHRpY3MiLCJHT0NvbnN0YW50cyIsIkdPUXVlcnlQYXJhbWV0ZXJzIiwiU2hhcGUiLCJNdWx0aWxpbmsiLCJMaWdodFNwb3ROb2RlIiwiY29uc3RydWN0b3IiLCJsaWdodFNwb3QiLCJwcm9qZWN0aW9uU2NyZWVuIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwicHJvdmlkZWRPcHRpb25zIiwiZmlsbFBhdGgiLCJmaWxsIiwibGlnaHRTcG90RmlsbFByb3BlcnR5Iiwic3Ryb2tlUGF0aCIsInN0cm9rZSIsImxpZ2h0U3BvdFN0cm9rZVByb3BlcnR5IiwibGluZVdpZHRoIiwibGluZURhc2giLCJmaWxsQW5kU3Ryb2tlTm9kZSIsImNoaWxkcmVuIiwiYWRkQ2hpbGQiLCJkZWJ1Z1N0cm9rZVBhdGgiLCJkZWJ1Z0xpZ2h0U3BvdHMiLCJtdWx0aWxpbmsiLCJwb3NpdGlvblByb3BlcnR5IiwiZGlhbWV0ZXJQcm9wZXJ0eSIsInBvc2l0aW9uIiwiZGlhbWV0ZXIiLCJyYWRpdXNYIiwicmFkaXVzWSIsIm1vZGVsU2hhcGUiLCJlbGxpcHNlIiwieCIsInkiLCJNYXRoIiwiUEkiLCJ2aWV3U2hhcGUiLCJtb2RlbFRvVmlld1NoYXBlIiwic2hhcGUiLCJpbnRlbnNpdHlQcm9wZXJ0eSIsImxpbmsiLCJpbnRlbnNpdHkiLCJhc3NlcnQiLCJPUEFDSVRZX1JBTkdFIiwiZXF1YWxzIiwiSU5URU5TSVRZX1JBTkdFIiwib3BhY2l0eSIsImNsYW1wIiwibGluZWFyIiwicHJvamVjdGlvblNjcmVlblBvc2l0aW9uIiwicHJvamVjdGlvblNjcmVlblNoYXBlIiwiZ2V0U2NyZWVuU2hhcGVUcmFuc2xhdGVkIiwiY2xpcEFyZWEiLCJhZGRMaW5rZWRFbGVtZW50IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwibmFtZSIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxpZ2h0U3BvdE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTGlnaHRTcG90Tm9kZSBpcyBhIGxpZ2h0IHNwb3QgdGhhdCBpcyBwcm9qZWN0ZWQgb250byB0aGUgcHJvamVjdGlvbiBzY3JlZW4uXHJcbiAqIEl0IGlzIHJlc3BvbnNpYmxlIGZvciBjcmVhdGluZyB0aGUgbGlnaHQgc3BvdCdzIHNoYXBlLCBhbmQgY2xpcHBpbmcgaXQgdG8gdGhlIHByb2plY3Rpb24gc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBOb2RlT3B0aW9ucywgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBHT0NvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vR09Db2xvcnMuanMnO1xyXG5pbXBvcnQgZ2VvbWV0cmljT3B0aWNzIGZyb20gJy4uLy4uL2dlb21ldHJpY09wdGljcy5qcyc7XHJcbmltcG9ydCBMaWdodFNwb3QgZnJvbSAnLi4vbW9kZWwvTGlnaHRTcG90LmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IEdPQ29uc3RhbnRzIGZyb20gJy4uL0dPQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFByb2plY3Rpb25TY3JlZW4gZnJvbSAnLi4vbW9kZWwvUHJvamVjdGlvblNjcmVlbi5qcyc7XHJcbmltcG9ydCBHT1F1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9HT1F1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcblxyXG50eXBlIExpZ2h0U3BvdE5vZGVPcHRpb25zID0gUGlja1JlcXVpcmVkPE5vZGVPcHRpb25zLCAndmlzaWJsZVByb3BlcnR5JyB8ICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpZ2h0U3BvdE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsaWdodFNwb3Q6IExpZ2h0U3BvdCxcclxuICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Rpb25TY3JlZW46IFByb2plY3Rpb25TY3JlZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IExpZ2h0U3BvdE5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBGaWxsIGNvbG9yIG9mIHRoZSBzcG90XHJcbiAgICBjb25zdCBmaWxsUGF0aCA9IG5ldyBQYXRoKCBudWxsLCB7XHJcbiAgICAgIGZpbGw6IEdPQ29sb3JzLmxpZ2h0U3BvdEZpbGxQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIERhc2hlZCBvdXRsaW5lIG9mIHRoZSBzcG90LCBzbyBpdCdzIGVhc2llciB0byBzZWUgd2hlbiBpbnRlbnNpdHkgaXMgbG93LlxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9nZW9tZXRyaWMtb3B0aWNzL2lzc3Vlcy8yNDBcclxuICAgIGNvbnN0IHN0cm9rZVBhdGggPSBuZXcgUGF0aCggbnVsbCwge1xyXG4gICAgICBzdHJva2U6IEdPQ29sb3JzLmxpZ2h0U3BvdFN0cm9rZVByb3BlcnR5LFxyXG4gICAgICBsaW5lV2lkdGg6IDAuNzUsXHJcbiAgICAgIGxpbmVEYXNoOiBbIDQsIDQgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGZpbGxBbmRTdHJva2VOb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgZmlsbFBhdGgsIHN0cm9rZVBhdGggXVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZmlsbEFuZFN0cm9rZU5vZGUgKTtcclxuXHJcbiAgICAvLyBDb21wbGV0ZSwgdW4tY2xpcHBlZCBwYXRoLCBmb3IgZGVidWdnaW5nLlxyXG4gICAgbGV0IGRlYnVnU3Ryb2tlUGF0aDogUGF0aCB8IG51bGwgPSBudWxsO1xyXG4gICAgaWYgKCBHT1F1ZXJ5UGFyYW1ldGVycy5kZWJ1Z0xpZ2h0U3BvdHMgKSB7XHJcbiAgICAgIGRlYnVnU3Ryb2tlUGF0aCA9IG5ldyBQYXRoKCBudWxsLCB7XHJcbiAgICAgICAgc3Ryb2tlOiAncmVkJ1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIGRlYnVnU3Ryb2tlUGF0aCApO1xyXG4gICAgfVxyXG5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgbGlnaHRTcG90LnBvc2l0aW9uUHJvcGVydHksIGxpZ2h0U3BvdC5kaWFtZXRlclByb3BlcnR5IF0sXHJcbiAgICAgICggcG9zaXRpb24sIGRpYW1ldGVyICkgPT4ge1xyXG5cclxuICAgICAgICAvLyBBbiBlbGxpcHNlIHdpdGggYXNwZWN0IHJhdGlvIG9mIDE6MiwgdG8gZ2l2ZSBwc2V1ZG8tM0QgcGVyc3BlY3RpdmUuXHJcbiAgICAgICAgY29uc3QgcmFkaXVzWCA9IGRpYW1ldGVyIC8gNDtcclxuICAgICAgICBjb25zdCByYWRpdXNZID0gZGlhbWV0ZXIgLyAyO1xyXG4gICAgICAgIGNvbnN0IG1vZGVsU2hhcGUgPSBTaGFwZS5lbGxpcHNlKCBwb3NpdGlvbi54LCBwb3NpdGlvbi55LCByYWRpdXNYLCByYWRpdXNZLCAyICogTWF0aC5QSSApO1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3U2hhcGUgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdTaGFwZSggbW9kZWxTaGFwZSApO1xyXG4gICAgICAgIGZpbGxQYXRoLnNoYXBlID0gdmlld1NoYXBlO1xyXG4gICAgICAgIHN0cm9rZVBhdGguc2hhcGUgPSB2aWV3U2hhcGU7XHJcbiAgICAgICAgZGVidWdTdHJva2VQYXRoICYmICggZGVidWdTdHJva2VQYXRoLnNoYXBlID0gdmlld1NoYXBlICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICBsaWdodFNwb3QuaW50ZW5zaXR5UHJvcGVydHkubGluayggaW50ZW5zaXR5ID0+IHtcclxuXHJcbiAgICAgIC8vIE9wYWNpdHkgaXMgZXF1aXZhbGVudCB0byBvcGFjaXR5LlxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBHT0NvbnN0YW50cy5PUEFDSVRZX1JBTkdFLmVxdWFscyggR09Db25zdGFudHMuSU5URU5TSVRZX1JBTkdFICkgKTtcclxuICAgICAgY29uc3Qgb3BhY2l0eSA9IGludGVuc2l0eTtcclxuXHJcbiAgICAgIC8vIEludGVuc2l0eSBvZiBsaWdodCBpcyB0aGUgb3BhY2l0eSBvZiB0aGUgc3BvdCBjb2xvci5cclxuICAgICAgZmlsbFBhdGgub3BhY2l0eSA9IG9wYWNpdHk7XHJcblxyXG4gICAgICAvLyBEYXNoZWQgb3V0bGluZSBpcyB2aXNpYmxlIG9ubHkgZm9yIGxvd2VyIGludGVuc2l0aWVzIFswLDAuMjVdLCBhbmQgYmVjb21lcyBtb3JlIHZpc2libGUgYXMgaW50ZW5zaXR5IGRlY3JlYXNlcy5cclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9nZW9tZXRyaWMtb3B0aWNzL2lzc3Vlcy8yNDBcclxuICAgICAgc3Ryb2tlUGF0aC5vcGFjaXR5ID0gVXRpbHMuY2xhbXAoIFV0aWxzLmxpbmVhciggMCwgMC4yNSwgMSwgMCwgb3BhY2l0eSApLCAwLCAxICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ2xpcCB0aGUgbGlnaHQgc3BvdCB0byB0aGUgcHJvamVjdGlvbiBzY3JlZW4uXHJcbiAgICBwcm9qZWN0aW9uU2NyZWVuLnBvc2l0aW9uUHJvcGVydHkubGluayggcHJvamVjdGlvblNjcmVlblBvc2l0aW9uID0+IHtcclxuICAgICAgY29uc3QgcHJvamVjdGlvblNjcmVlblNoYXBlID0gcHJvamVjdGlvblNjcmVlbi5nZXRTY3JlZW5TaGFwZVRyYW5zbGF0ZWQoKTtcclxuICAgICAgZmlsbEFuZFN0cm9rZU5vZGUuY2xpcEFyZWEgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdTaGFwZSggcHJvamVjdGlvblNjcmVlblNoYXBlICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBsaWdodFNwb3QsIHtcclxuICAgICAgdGFuZGVtOiBwcm92aWRlZE9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggbGlnaHRTcG90LnRhbmRlbS5uYW1lIClcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5nZW9tZXRyaWNPcHRpY3MucmVnaXN0ZXIoICdMaWdodFNwb3ROb2RlJywgTGlnaHRTcG90Tm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7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