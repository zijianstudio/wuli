// Copyright 2022, University of Colorado Boulder

/**
 * FramedSceneNode is the view of the 'Framed' scene, which has a framed object and image.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Martin Veillette
 */

import geometricOptics from '../../geometricOptics.js';
import FramedImageNode from './FramedImageNode.js';
import FramedObjectNode from './FramedObjectNode.js';
import SecondPointNode from './SecondPointNode.js';
import GOColors from '../GOColors.js';
import RealLightRaysNode from './RealLightRaysNode.js';
import RealLightRaysForegroundNode from './RealLightRaysForegroundNode.js';
import OpticalAxisForegroundNode from './OpticalAxisForegroundNode.js';
import VirtualLightRaysNode from './VirtualLightRaysNode.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import GOSceneNode from './GOSceneNode.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import ToolJumpPoint from '../model/tools/ToolJumpPoint.js';
export default class FramedSceneNode extends GOSceneNode {
  // See GOSceneNode

  // Visibility of things that have labels, intended to be used to control the visibility of associated labels.

  // Resets things that are specific to this class.

  /**
   * @param scene - model element
   * @param visibleProperties
   * @param modelViewTransform
   * @param modelVisibleBoundsProperty - ScreenView's visibleBounds in the model coordinate frame, with the zoom transform applied
   * @param sceneBoundsProperty - bounds for the scene, in model coordinates
   * @param raysTypeProperty - representation used for rays
   * @param lightPropagationEnabledProperty - is light propagation enabled?
   * @param providedOptions
   */
  constructor(scene, visibleProperties, modelViewTransform, modelVisibleBoundsProperty, sceneBoundsProperty, raysTypeProperty, lightPropagationEnabledProperty, providedOptions) {
    super(scene, visibleProperties, modelViewTransform, modelVisibleBoundsProperty, sceneBoundsProperty, raysTypeProperty, providedOptions);
    this.scene = scene;
    const framedObjectWasDraggedProperty = new BooleanProperty(false, {
      tandem: providedOptions.tandem.createTandem('framedObjectWasDraggedProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'Was the framed object dragged?'
    });

    // Framed object
    const framedObjectNode = new FramedObjectNode(scene.framedObject, sceneBoundsProperty, scene.optic.positionProperty, modelViewTransform, providedOptions.objectDragModeProperty, framedObjectWasDraggedProperty, {
      tandem: providedOptions.tandem.createTandem('framedObjectNode')
    });
    this.opticalObjectsLayer.addChild(framedObjectNode);
    const secondPointWasDraggedProperty = new BooleanProperty(false, {
      tandem: providedOptions.tandem.createTandem('secondPointWasDraggedProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'Was the second point on the framed object dragged?'
    });

    // Second point-of-interest on the framed object
    const secondPointNode = new SecondPointNode(scene.secondPoint, modelViewTransform, secondPointWasDraggedProperty, {
      visibleProperty: visibleProperties.secondPointVisibleProperty,
      tandem: providedOptions.tandem.createTandem('secondPointNode'),
      phetioDocumentation: 'second point-of-interest on the framed object'
    });
    this.opticalObjectsLayer.addChild(secondPointNode);

    // Both points of interest are on the same Object, so we only render one Image. If we rendered 2 Images,
    // their opacities would combine.
    const framedImageNode = new FramedImageNode(scene.framedImage1, scene.optic, visibleProperties.virtualImageVisibleProperty, lightPropagationEnabledProperty, framedObjectNode.visibleProperty, modelViewTransform, {
      tandem: providedOptions.tandem.createTandem('framedImageNode')
    });
    this.opticalImagesLayer.addChild(framedImageNode);

    // The parts of the optical axis that appear to be in front of framed objects and images.
    const opticalAxisForegroundNode = new OpticalAxisForegroundNode(scene.optic.positionProperty, modelVisibleBoundsProperty, modelViewTransform, scene.framedObject.positionProperty, framedObjectNode, scene.framedImage1.positionProperty, framedImageNode, scene.lightRays1.raysProcessedEmitter, {
      visibleProperty: visibleProperties.opticalAxisVisibleProperty
    });
    this.opticalAxisForegroundLayer.addChild(opticalAxisForegroundNode);

    // Real light rays associated with the first point-of-interest (the framed object's position).
    // There are foreground and background components to these rays, to handle occlusion of the rays by the
    // 3D perspective of the framed object and image.
    const realLightRays1Options = {
      stroke: GOColors.rays1StrokeProperty,
      visibleProperty: lightPropagationEnabledProperty
    };
    const realLightRays1Node = new RealLightRaysNode(scene.lightRays1, modelViewTransform, realLightRays1Options);
    this.raysBackgroundLayer.addChild(realLightRays1Node);
    const realLightRays1ForegroundNode = new RealLightRaysForegroundNode(scene.lightRays1, modelViewTransform, modelVisibleBoundsProperty, scene.optic.positionProperty, scene.framedImage1.positionProperty, scene.framedImage1.opticalImageTypeProperty, realLightRays1Options);
    this.raysForegroundLayer.addChild(realLightRays1ForegroundNode);

    // Virtual light rays associated with the first point-of-interest (the framed object's position).
    const virtualLightRays1Node = new VirtualLightRaysNode(scene.lightRays1, modelViewTransform, {
      stroke: GOColors.rays1StrokeProperty,
      visibleProperty: DerivedProperty.and([lightPropagationEnabledProperty, visibleProperties.virtualImageVisibleProperty])
    });
    this.raysForegroundLayer.addChild(virtualLightRays1Node);

    // Real light rays associated with the second point-of-interest (also on the framed object).
    // There are foreground and background components to these rays, to handle occlusion of the rays by the
    // 3D perspective of the framed object and image.
    const realLightRays2Options = {
      stroke: GOColors.rays2StrokeProperty,
      visibleProperty: DerivedProperty.and([lightPropagationEnabledProperty, visibleProperties.secondPointVisibleProperty])
    };
    const realLightRays2Node = new RealLightRaysNode(scene.lightRays2, modelViewTransform, realLightRays2Options);
    this.raysBackgroundLayer.addChild(realLightRays2Node);
    const realLightRays2ForegroundNode = new RealLightRaysForegroundNode(scene.lightRays2, modelViewTransform, modelVisibleBoundsProperty, scene.optic.positionProperty, scene.framedImage2.positionProperty, scene.framedImage2.opticalImageTypeProperty, realLightRays2Options);
    this.raysForegroundLayer.addChild(realLightRays2ForegroundNode);

    // Virtual light rays associated with the second point-of-interest (also on the framed object).
    const virtualLightRays2Node = new VirtualLightRaysNode(scene.lightRays2, modelViewTransform, {
      stroke: GOColors.rays2StrokeProperty,
      visibleProperty: DerivedProperty.and([lightPropagationEnabledProperty, visibleProperties.virtualImageVisibleProperty, visibleProperties.secondPointVisibleProperty])
    });
    this.raysForegroundLayer.addChild(virtualLightRays2Node);

    // Add things that are interactive in this scene to the focus traversal order.
    this.pdomOrder = [framedObjectNode, secondPointNode];

    // 'J' hotkey will cycle tools through these points, dynamically looking at left-to-right x coordinate.
    this.toolJumpPoints = [
    // from base class
    ...this.opticJumpPoints,
    // optical objects
    new ToolJumpPoint(scene.framedObject.positionProperty, framedObjectNode.visibleProperty), new ToolJumpPoint(scene.secondPoint.positionProperty, secondPointNode.visibleProperty),
    // optical images
    new ToolJumpPoint(scene.framedImage1.positionProperty, framedImageNode.visibleProperty), new ToolJumpPoint(scene.framedImage2.positionProperty, DerivedProperty.and([framedImageNode.visibleProperty, secondPointNode.visibleProperty]))];

    // Visibility for associates labels
    this.framedObjectNodeVisibleProperty = framedObjectNode.visibleProperty;
    this.framedImageNodeVisibleProperty = framedImageNode.visibleProperty;
    this.resetFrameObjectSceneNode = () => {
      framedObjectWasDraggedProperty.reset();
      secondPointWasDraggedProperty.reset();
    };
  }
  reset() {
    this.resetFrameObjectSceneNode();
  }
}
geometricOptics.register('FramedSceneNode', FramedSceneNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZW9tZXRyaWNPcHRpY3MiLCJGcmFtZWRJbWFnZU5vZGUiLCJGcmFtZWRPYmplY3ROb2RlIiwiU2Vjb25kUG9pbnROb2RlIiwiR09Db2xvcnMiLCJSZWFsTGlnaHRSYXlzTm9kZSIsIlJlYWxMaWdodFJheXNGb3JlZ3JvdW5kTm9kZSIsIk9wdGljYWxBeGlzRm9yZWdyb3VuZE5vZGUiLCJWaXJ0dWFsTGlnaHRSYXlzTm9kZSIsIkRlcml2ZWRQcm9wZXJ0eSIsIkdPU2NlbmVOb2RlIiwiQm9vbGVhblByb3BlcnR5IiwiVG9vbEp1bXBQb2ludCIsIkZyYW1lZFNjZW5lTm9kZSIsImNvbnN0cnVjdG9yIiwic2NlbmUiLCJ2aXNpYmxlUHJvcGVydGllcyIsIm1vZGVsVmlld1RyYW5zZm9ybSIsIm1vZGVsVmlzaWJsZUJvdW5kc1Byb3BlcnR5Iiwic2NlbmVCb3VuZHNQcm9wZXJ0eSIsInJheXNUeXBlUHJvcGVydHkiLCJsaWdodFByb3BhZ2F0aW9uRW5hYmxlZFByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwiZnJhbWVkT2JqZWN0V2FzRHJhZ2dlZFByb3BlcnR5IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiZnJhbWVkT2JqZWN0Tm9kZSIsImZyYW1lZE9iamVjdCIsIm9wdGljIiwicG9zaXRpb25Qcm9wZXJ0eSIsIm9iamVjdERyYWdNb2RlUHJvcGVydHkiLCJvcHRpY2FsT2JqZWN0c0xheWVyIiwiYWRkQ2hpbGQiLCJzZWNvbmRQb2ludFdhc0RyYWdnZWRQcm9wZXJ0eSIsInNlY29uZFBvaW50Tm9kZSIsInNlY29uZFBvaW50IiwidmlzaWJsZVByb3BlcnR5Iiwic2Vjb25kUG9pbnRWaXNpYmxlUHJvcGVydHkiLCJmcmFtZWRJbWFnZU5vZGUiLCJmcmFtZWRJbWFnZTEiLCJ2aXJ0dWFsSW1hZ2VWaXNpYmxlUHJvcGVydHkiLCJvcHRpY2FsSW1hZ2VzTGF5ZXIiLCJvcHRpY2FsQXhpc0ZvcmVncm91bmROb2RlIiwibGlnaHRSYXlzMSIsInJheXNQcm9jZXNzZWRFbWl0dGVyIiwib3B0aWNhbEF4aXNWaXNpYmxlUHJvcGVydHkiLCJvcHRpY2FsQXhpc0ZvcmVncm91bmRMYXllciIsInJlYWxMaWdodFJheXMxT3B0aW9ucyIsInN0cm9rZSIsInJheXMxU3Ryb2tlUHJvcGVydHkiLCJyZWFsTGlnaHRSYXlzMU5vZGUiLCJyYXlzQmFja2dyb3VuZExheWVyIiwicmVhbExpZ2h0UmF5czFGb3JlZ3JvdW5kTm9kZSIsIm9wdGljYWxJbWFnZVR5cGVQcm9wZXJ0eSIsInJheXNGb3JlZ3JvdW5kTGF5ZXIiLCJ2aXJ0dWFsTGlnaHRSYXlzMU5vZGUiLCJhbmQiLCJyZWFsTGlnaHRSYXlzMk9wdGlvbnMiLCJyYXlzMlN0cm9rZVByb3BlcnR5IiwicmVhbExpZ2h0UmF5czJOb2RlIiwibGlnaHRSYXlzMiIsInJlYWxMaWdodFJheXMyRm9yZWdyb3VuZE5vZGUiLCJmcmFtZWRJbWFnZTIiLCJ2aXJ0dWFsTGlnaHRSYXlzMk5vZGUiLCJwZG9tT3JkZXIiLCJ0b29sSnVtcFBvaW50cyIsIm9wdGljSnVtcFBvaW50cyIsImZyYW1lZE9iamVjdE5vZGVWaXNpYmxlUHJvcGVydHkiLCJmcmFtZWRJbWFnZU5vZGVWaXNpYmxlUHJvcGVydHkiLCJyZXNldEZyYW1lT2JqZWN0U2NlbmVOb2RlIiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkZyYW1lZFNjZW5lTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRnJhbWVkU2NlbmVOb2RlIGlzIHRoZSB2aWV3IG9mIHRoZSAnRnJhbWVkJyBzY2VuZSwgd2hpY2ggaGFzIGEgZnJhbWVkIG9iamVjdCBhbmQgaW1hZ2UuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqIEBhdXRob3IgTWFydGluIFZlaWxsZXR0ZVxyXG4gKi9cclxuXHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IGdlb21ldHJpY09wdGljcyBmcm9tICcuLi8uLi9nZW9tZXRyaWNPcHRpY3MuanMnO1xyXG5pbXBvcnQgRnJhbWVkU2NlbmUgZnJvbSAnLi4vbW9kZWwvRnJhbWVkU2NlbmUuanMnO1xyXG5pbXBvcnQgRnJhbWVkSW1hZ2VOb2RlIGZyb20gJy4vRnJhbWVkSW1hZ2VOb2RlLmpzJztcclxuaW1wb3J0IFZpc2libGVQcm9wZXJ0aWVzIGZyb20gJy4vVmlzaWJsZVByb3BlcnRpZXMuanMnO1xyXG5pbXBvcnQgRnJhbWVkT2JqZWN0Tm9kZSBmcm9tICcuL0ZyYW1lZE9iamVjdE5vZGUuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFNlY29uZFBvaW50Tm9kZSBmcm9tICcuL1NlY29uZFBvaW50Tm9kZS5qcyc7XHJcbmltcG9ydCB7IFJheXNUeXBlIH0gZnJvbSAnLi4vbW9kZWwvUmF5c1R5cGUuanMnO1xyXG5pbXBvcnQgR09Db2xvcnMgZnJvbSAnLi4vR09Db2xvcnMuanMnO1xyXG5pbXBvcnQgUmVhbExpZ2h0UmF5c05vZGUgZnJvbSAnLi9SZWFsTGlnaHRSYXlzTm9kZS5qcyc7XHJcbmltcG9ydCBSZWFsTGlnaHRSYXlzRm9yZWdyb3VuZE5vZGUgZnJvbSAnLi9SZWFsTGlnaHRSYXlzRm9yZWdyb3VuZE5vZGUuanMnO1xyXG5pbXBvcnQgT3B0aWNhbEF4aXNGb3JlZ3JvdW5kTm9kZSBmcm9tICcuL09wdGljYWxBeGlzRm9yZWdyb3VuZE5vZGUuanMnO1xyXG5pbXBvcnQgVmlydHVhbExpZ2h0UmF5c05vZGUgZnJvbSAnLi9WaXJ0dWFsTGlnaHRSYXlzTm9kZS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgR09TY2VuZU5vZGUsIHsgR09TY2VuZU5vZGVPcHRpb25zIH0gZnJvbSAnLi9HT1NjZW5lTm9kZS5qcyc7XHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVG9vbEp1bXBQb2ludCBmcm9tICcuLi9tb2RlbC90b29scy9Ub29sSnVtcFBvaW50LmpzJztcclxuaW1wb3J0IHsgT2JqZWN0RHJhZ01vZGUgfSBmcm9tICcuL09iamVjdERyYWdNb2RlLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgb2JqZWN0RHJhZ01vZGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8T2JqZWN0RHJhZ01vZGU+O1xyXG59O1xyXG5cclxudHlwZSBGcmFtZWRPYmplY3RTY2VuZU5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBHT1NjZW5lTm9kZU9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGcmFtZWRTY2VuZU5vZGUgZXh0ZW5kcyBHT1NjZW5lTm9kZSB7XHJcblxyXG4gIC8vIFNlZSBHT1NjZW5lTm9kZVxyXG4gIHB1YmxpYyByZWFkb25seSB0b29sSnVtcFBvaW50czogVG9vbEp1bXBQb2ludFtdO1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgc2NlbmU6IEZyYW1lZFNjZW5lO1xyXG5cclxuICAvLyBWaXNpYmlsaXR5IG9mIHRoaW5ncyB0aGF0IGhhdmUgbGFiZWxzLCBpbnRlbmRlZCB0byBiZSB1c2VkIHRvIGNvbnRyb2wgdGhlIHZpc2liaWxpdHkgb2YgYXNzb2NpYXRlZCBsYWJlbHMuXHJcbiAgcHVibGljIHJlYWRvbmx5IGZyYW1lZE9iamVjdE5vZGVWaXNpYmxlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyByZWFkb25seSBmcmFtZWRJbWFnZU5vZGVWaXNpYmxlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICAvLyBSZXNldHMgdGhpbmdzIHRoYXQgYXJlIHNwZWNpZmljIHRvIHRoaXMgY2xhc3MuXHJcbiAgcHJpdmF0ZSByZWFkb25seSByZXNldEZyYW1lT2JqZWN0U2NlbmVOb2RlOiAoKSA9PiB2b2lkO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gc2NlbmUgLSBtb2RlbCBlbGVtZW50XHJcbiAgICogQHBhcmFtIHZpc2libGVQcm9wZXJ0aWVzXHJcbiAgICogQHBhcmFtIG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSBtb2RlbFZpc2libGVCb3VuZHNQcm9wZXJ0eSAtIFNjcmVlblZpZXcncyB2aXNpYmxlQm91bmRzIGluIHRoZSBtb2RlbCBjb29yZGluYXRlIGZyYW1lLCB3aXRoIHRoZSB6b29tIHRyYW5zZm9ybSBhcHBsaWVkXHJcbiAgICogQHBhcmFtIHNjZW5lQm91bmRzUHJvcGVydHkgLSBib3VuZHMgZm9yIHRoZSBzY2VuZSwgaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgKiBAcGFyYW0gcmF5c1R5cGVQcm9wZXJ0eSAtIHJlcHJlc2VudGF0aW9uIHVzZWQgZm9yIHJheXNcclxuICAgKiBAcGFyYW0gbGlnaHRQcm9wYWdhdGlvbkVuYWJsZWRQcm9wZXJ0eSAtIGlzIGxpZ2h0IHByb3BhZ2F0aW9uIGVuYWJsZWQ/XHJcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2NlbmU6IEZyYW1lZFNjZW5lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZVByb3BlcnRpZXM6IFZpc2libGVQcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgbW9kZWxWaXNpYmxlQm91bmRzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PEJvdW5kczI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgc2NlbmVCb3VuZHNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Qm91bmRzMj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICByYXlzVHlwZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxSYXlzVHlwZT4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBsaWdodFByb3BhZ2F0aW9uRW5hYmxlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9uczogRnJhbWVkT2JqZWN0U2NlbmVOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBzdXBlciggc2NlbmUsIHZpc2libGVQcm9wZXJ0aWVzLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG1vZGVsVmlzaWJsZUJvdW5kc1Byb3BlcnR5LCBzY2VuZUJvdW5kc1Byb3BlcnR5LCByYXlzVHlwZVByb3BlcnR5LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcblxyXG4gICAgY29uc3QgZnJhbWVkT2JqZWN0V2FzRHJhZ2dlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBwcm92aWRlZE9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZyYW1lZE9iamVjdFdhc0RyYWdnZWRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdXYXMgdGhlIGZyYW1lZCBvYmplY3QgZHJhZ2dlZD8nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRnJhbWVkIG9iamVjdFxyXG4gICAgY29uc3QgZnJhbWVkT2JqZWN0Tm9kZSA9IG5ldyBGcmFtZWRPYmplY3ROb2RlKCBzY2VuZS5mcmFtZWRPYmplY3QsIHNjZW5lQm91bmRzUHJvcGVydHksIHNjZW5lLm9wdGljLnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybSwgcHJvdmlkZWRPcHRpb25zLm9iamVjdERyYWdNb2RlUHJvcGVydHksIGZyYW1lZE9iamVjdFdhc0RyYWdnZWRQcm9wZXJ0eSwge1xyXG4gICAgICAgIHRhbmRlbTogcHJvdmlkZWRPcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdmcmFtZWRPYmplY3ROb2RlJyApXHJcbiAgICAgIH0gKTtcclxuICAgIHRoaXMub3B0aWNhbE9iamVjdHNMYXllci5hZGRDaGlsZCggZnJhbWVkT2JqZWN0Tm9kZSApO1xyXG5cclxuICAgIGNvbnN0IHNlY29uZFBvaW50V2FzRHJhZ2dlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBwcm92aWRlZE9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NlY29uZFBvaW50V2FzRHJhZ2dlZFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1dhcyB0aGUgc2Vjb25kIHBvaW50IG9uIHRoZSBmcmFtZWQgb2JqZWN0IGRyYWdnZWQ/J1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFNlY29uZCBwb2ludC1vZi1pbnRlcmVzdCBvbiB0aGUgZnJhbWVkIG9iamVjdFxyXG4gICAgY29uc3Qgc2Vjb25kUG9pbnROb2RlID0gbmV3IFNlY29uZFBvaW50Tm9kZSggc2NlbmUuc2Vjb25kUG9pbnQsIG1vZGVsVmlld1RyYW5zZm9ybSwgc2Vjb25kUG9pbnRXYXNEcmFnZ2VkUHJvcGVydHksIHtcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiB2aXNpYmxlUHJvcGVydGllcy5zZWNvbmRQb2ludFZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtOiBwcm92aWRlZE9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NlY29uZFBvaW50Tm9kZScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3NlY29uZCBwb2ludC1vZi1pbnRlcmVzdCBvbiB0aGUgZnJhbWVkIG9iamVjdCdcclxuICAgIH0gKTtcclxuICAgIHRoaXMub3B0aWNhbE9iamVjdHNMYXllci5hZGRDaGlsZCggc2Vjb25kUG9pbnROb2RlICk7XHJcblxyXG4gICAgLy8gQm90aCBwb2ludHMgb2YgaW50ZXJlc3QgYXJlIG9uIHRoZSBzYW1lIE9iamVjdCwgc28gd2Ugb25seSByZW5kZXIgb25lIEltYWdlLiBJZiB3ZSByZW5kZXJlZCAyIEltYWdlcyxcclxuICAgIC8vIHRoZWlyIG9wYWNpdGllcyB3b3VsZCBjb21iaW5lLlxyXG4gICAgY29uc3QgZnJhbWVkSW1hZ2VOb2RlID0gbmV3IEZyYW1lZEltYWdlTm9kZSggc2NlbmUuZnJhbWVkSW1hZ2UxLCBzY2VuZS5vcHRpYyxcclxuICAgICAgdmlzaWJsZVByb3BlcnRpZXMudmlydHVhbEltYWdlVmlzaWJsZVByb3BlcnR5LCBsaWdodFByb3BhZ2F0aW9uRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgICBmcmFtZWRPYmplY3ROb2RlLnZpc2libGVQcm9wZXJ0eSwgbW9kZWxWaWV3VHJhbnNmb3JtLCB7XHJcbiAgICAgICAgdGFuZGVtOiBwcm92aWRlZE9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZyYW1lZEltYWdlTm9kZScgKVxyXG4gICAgICB9ICk7XHJcbiAgICB0aGlzLm9wdGljYWxJbWFnZXNMYXllci5hZGRDaGlsZCggZnJhbWVkSW1hZ2VOb2RlICk7XHJcblxyXG4gICAgLy8gVGhlIHBhcnRzIG9mIHRoZSBvcHRpY2FsIGF4aXMgdGhhdCBhcHBlYXIgdG8gYmUgaW4gZnJvbnQgb2YgZnJhbWVkIG9iamVjdHMgYW5kIGltYWdlcy5cclxuICAgIGNvbnN0IG9wdGljYWxBeGlzRm9yZWdyb3VuZE5vZGUgPSBuZXcgT3B0aWNhbEF4aXNGb3JlZ3JvdW5kTm9kZShcclxuICAgICAgc2NlbmUub3B0aWMucG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgbW9kZWxWaXNpYmxlQm91bmRzUHJvcGVydHksXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgc2NlbmUuZnJhbWVkT2JqZWN0LnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIGZyYW1lZE9iamVjdE5vZGUsXHJcbiAgICAgIHNjZW5lLmZyYW1lZEltYWdlMS5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBmcmFtZWRJbWFnZU5vZGUsXHJcbiAgICAgIHNjZW5lLmxpZ2h0UmF5czEucmF5c1Byb2Nlc3NlZEVtaXR0ZXIsIHtcclxuICAgICAgICB2aXNpYmxlUHJvcGVydHk6IHZpc2libGVQcm9wZXJ0aWVzLm9wdGljYWxBeGlzVmlzaWJsZVByb3BlcnR5XHJcbiAgICAgIH0gKTtcclxuICAgIHRoaXMub3B0aWNhbEF4aXNGb3JlZ3JvdW5kTGF5ZXIuYWRkQ2hpbGQoIG9wdGljYWxBeGlzRm9yZWdyb3VuZE5vZGUgKTtcclxuXHJcbiAgICAvLyBSZWFsIGxpZ2h0IHJheXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBmaXJzdCBwb2ludC1vZi1pbnRlcmVzdCAodGhlIGZyYW1lZCBvYmplY3QncyBwb3NpdGlvbikuXHJcbiAgICAvLyBUaGVyZSBhcmUgZm9yZWdyb3VuZCBhbmQgYmFja2dyb3VuZCBjb21wb25lbnRzIHRvIHRoZXNlIHJheXMsIHRvIGhhbmRsZSBvY2NsdXNpb24gb2YgdGhlIHJheXMgYnkgdGhlXHJcbiAgICAvLyAzRCBwZXJzcGVjdGl2ZSBvZiB0aGUgZnJhbWVkIG9iamVjdCBhbmQgaW1hZ2UuXHJcbiAgICBjb25zdCByZWFsTGlnaHRSYXlzMU9wdGlvbnMgPSB7XHJcbiAgICAgIHN0cm9rZTogR09Db2xvcnMucmF5czFTdHJva2VQcm9wZXJ0eSxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBsaWdodFByb3BhZ2F0aW9uRW5hYmxlZFByb3BlcnR5XHJcbiAgICB9O1xyXG4gICAgY29uc3QgcmVhbExpZ2h0UmF5czFOb2RlID0gbmV3IFJlYWxMaWdodFJheXNOb2RlKCBzY2VuZS5saWdodFJheXMxLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHJlYWxMaWdodFJheXMxT3B0aW9ucyApO1xyXG4gICAgdGhpcy5yYXlzQmFja2dyb3VuZExheWVyLmFkZENoaWxkKCByZWFsTGlnaHRSYXlzMU5vZGUgKTtcclxuICAgIGNvbnN0IHJlYWxMaWdodFJheXMxRm9yZWdyb3VuZE5vZGUgPSBuZXcgUmVhbExpZ2h0UmF5c0ZvcmVncm91bmROb2RlKCBzY2VuZS5saWdodFJheXMxLCBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIG1vZGVsVmlzaWJsZUJvdW5kc1Byb3BlcnR5LCBzY2VuZS5vcHRpYy5wb3NpdGlvblByb3BlcnR5LCBzY2VuZS5mcmFtZWRJbWFnZTEucG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgc2NlbmUuZnJhbWVkSW1hZ2UxLm9wdGljYWxJbWFnZVR5cGVQcm9wZXJ0eSwgcmVhbExpZ2h0UmF5czFPcHRpb25zICk7XHJcbiAgICB0aGlzLnJheXNGb3JlZ3JvdW5kTGF5ZXIuYWRkQ2hpbGQoIHJlYWxMaWdodFJheXMxRm9yZWdyb3VuZE5vZGUgKTtcclxuXHJcbiAgICAvLyBWaXJ0dWFsIGxpZ2h0IHJheXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBmaXJzdCBwb2ludC1vZi1pbnRlcmVzdCAodGhlIGZyYW1lZCBvYmplY3QncyBwb3NpdGlvbikuXHJcbiAgICBjb25zdCB2aXJ0dWFsTGlnaHRSYXlzMU5vZGUgPSBuZXcgVmlydHVhbExpZ2h0UmF5c05vZGUoIHNjZW5lLmxpZ2h0UmF5czEsIG1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG4gICAgICBzdHJva2U6IEdPQ29sb3JzLnJheXMxU3Ryb2tlUHJvcGVydHksXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogRGVyaXZlZFByb3BlcnR5LmFuZCggWyBsaWdodFByb3BhZ2F0aW9uRW5hYmxlZFByb3BlcnR5LCB2aXNpYmxlUHJvcGVydGllcy52aXJ0dWFsSW1hZ2VWaXNpYmxlUHJvcGVydHkgXSApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnJheXNGb3JlZ3JvdW5kTGF5ZXIuYWRkQ2hpbGQoIHZpcnR1YWxMaWdodFJheXMxTm9kZSApO1xyXG5cclxuICAgIC8vIFJlYWwgbGlnaHQgcmF5cyBhc3NvY2lhdGVkIHdpdGggdGhlIHNlY29uZCBwb2ludC1vZi1pbnRlcmVzdCAoYWxzbyBvbiB0aGUgZnJhbWVkIG9iamVjdCkuXHJcbiAgICAvLyBUaGVyZSBhcmUgZm9yZWdyb3VuZCBhbmQgYmFja2dyb3VuZCBjb21wb25lbnRzIHRvIHRoZXNlIHJheXMsIHRvIGhhbmRsZSBvY2NsdXNpb24gb2YgdGhlIHJheXMgYnkgdGhlXHJcbiAgICAvLyAzRCBwZXJzcGVjdGl2ZSBvZiB0aGUgZnJhbWVkIG9iamVjdCBhbmQgaW1hZ2UuXHJcbiAgICBjb25zdCByZWFsTGlnaHRSYXlzMk9wdGlvbnMgPSB7XHJcbiAgICAgIHN0cm9rZTogR09Db2xvcnMucmF5czJTdHJva2VQcm9wZXJ0eSxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBEZXJpdmVkUHJvcGVydHkuYW5kKCBbIGxpZ2h0UHJvcGFnYXRpb25FbmFibGVkUHJvcGVydHksIHZpc2libGVQcm9wZXJ0aWVzLnNlY29uZFBvaW50VmlzaWJsZVByb3BlcnR5IF0gKVxyXG4gICAgfTtcclxuICAgIGNvbnN0IHJlYWxMaWdodFJheXMyTm9kZSA9IG5ldyBSZWFsTGlnaHRSYXlzTm9kZSggc2NlbmUubGlnaHRSYXlzMiwgbW9kZWxWaWV3VHJhbnNmb3JtLCByZWFsTGlnaHRSYXlzMk9wdGlvbnMgKTtcclxuICAgIHRoaXMucmF5c0JhY2tncm91bmRMYXllci5hZGRDaGlsZCggcmVhbExpZ2h0UmF5czJOb2RlICk7XHJcbiAgICBjb25zdCByZWFsTGlnaHRSYXlzMkZvcmVncm91bmROb2RlID0gbmV3IFJlYWxMaWdodFJheXNGb3JlZ3JvdW5kTm9kZSggc2NlbmUubGlnaHRSYXlzMiwgbW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICBtb2RlbFZpc2libGVCb3VuZHNQcm9wZXJ0eSwgc2NlbmUub3B0aWMucG9zaXRpb25Qcm9wZXJ0eSwgc2NlbmUuZnJhbWVkSW1hZ2UyLnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIHNjZW5lLmZyYW1lZEltYWdlMi5vcHRpY2FsSW1hZ2VUeXBlUHJvcGVydHksIHJlYWxMaWdodFJheXMyT3B0aW9ucyApO1xyXG4gICAgdGhpcy5yYXlzRm9yZWdyb3VuZExheWVyLmFkZENoaWxkKCByZWFsTGlnaHRSYXlzMkZvcmVncm91bmROb2RlICk7XHJcblxyXG4gICAgLy8gVmlydHVhbCBsaWdodCByYXlzIGFzc29jaWF0ZWQgd2l0aCB0aGUgc2Vjb25kIHBvaW50LW9mLWludGVyZXN0IChhbHNvIG9uIHRoZSBmcmFtZWQgb2JqZWN0KS5cclxuICAgIGNvbnN0IHZpcnR1YWxMaWdodFJheXMyTm9kZSA9IG5ldyBWaXJ0dWFsTGlnaHRSYXlzTm9kZSggc2NlbmUubGlnaHRSYXlzMiwgbW9kZWxWaWV3VHJhbnNmb3JtLCB7XHJcbiAgICAgIHN0cm9rZTogR09Db2xvcnMucmF5czJTdHJva2VQcm9wZXJ0eSxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBEZXJpdmVkUHJvcGVydHkuYW5kKCBbXHJcbiAgICAgICAgbGlnaHRQcm9wYWdhdGlvbkVuYWJsZWRQcm9wZXJ0eSxcclxuICAgICAgICB2aXNpYmxlUHJvcGVydGllcy52aXJ0dWFsSW1hZ2VWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgICAgdmlzaWJsZVByb3BlcnRpZXMuc2Vjb25kUG9pbnRWaXNpYmxlUHJvcGVydHlcclxuICAgICAgXSApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnJheXNGb3JlZ3JvdW5kTGF5ZXIuYWRkQ2hpbGQoIHZpcnR1YWxMaWdodFJheXMyTm9kZSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGluZ3MgdGhhdCBhcmUgaW50ZXJhY3RpdmUgaW4gdGhpcyBzY2VuZSB0byB0aGUgZm9jdXMgdHJhdmVyc2FsIG9yZGVyLlxyXG4gICAgdGhpcy5wZG9tT3JkZXIgPSBbXHJcbiAgICAgIGZyYW1lZE9iamVjdE5vZGUsXHJcbiAgICAgIHNlY29uZFBvaW50Tm9kZVxyXG4gICAgXTtcclxuXHJcbiAgICAvLyAnSicgaG90a2V5IHdpbGwgY3ljbGUgdG9vbHMgdGhyb3VnaCB0aGVzZSBwb2ludHMsIGR5bmFtaWNhbGx5IGxvb2tpbmcgYXQgbGVmdC10by1yaWdodCB4IGNvb3JkaW5hdGUuXHJcbiAgICB0aGlzLnRvb2xKdW1wUG9pbnRzID0gW1xyXG5cclxuICAgICAgLy8gZnJvbSBiYXNlIGNsYXNzXHJcbiAgICAgIC4uLnRoaXMub3B0aWNKdW1wUG9pbnRzLFxyXG5cclxuICAgICAgLy8gb3B0aWNhbCBvYmplY3RzXHJcbiAgICAgIG5ldyBUb29sSnVtcFBvaW50KCBzY2VuZS5mcmFtZWRPYmplY3QucG9zaXRpb25Qcm9wZXJ0eSwgZnJhbWVkT2JqZWN0Tm9kZS52aXNpYmxlUHJvcGVydHkgKSxcclxuICAgICAgbmV3IFRvb2xKdW1wUG9pbnQoIHNjZW5lLnNlY29uZFBvaW50LnBvc2l0aW9uUHJvcGVydHksIHNlY29uZFBvaW50Tm9kZS52aXNpYmxlUHJvcGVydHkgKSxcclxuXHJcbiAgICAgIC8vIG9wdGljYWwgaW1hZ2VzXHJcbiAgICAgIG5ldyBUb29sSnVtcFBvaW50KCBzY2VuZS5mcmFtZWRJbWFnZTEucG9zaXRpb25Qcm9wZXJ0eSwgZnJhbWVkSW1hZ2VOb2RlLnZpc2libGVQcm9wZXJ0eSApLFxyXG4gICAgICBuZXcgVG9vbEp1bXBQb2ludCggc2NlbmUuZnJhbWVkSW1hZ2UyLnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgICAgRGVyaXZlZFByb3BlcnR5LmFuZCggWyBmcmFtZWRJbWFnZU5vZGUudmlzaWJsZVByb3BlcnR5LCBzZWNvbmRQb2ludE5vZGUudmlzaWJsZVByb3BlcnR5IF0gKSApXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIFZpc2liaWxpdHkgZm9yIGFzc29jaWF0ZXMgbGFiZWxzXHJcbiAgICB0aGlzLmZyYW1lZE9iamVjdE5vZGVWaXNpYmxlUHJvcGVydHkgPSBmcmFtZWRPYmplY3ROb2RlLnZpc2libGVQcm9wZXJ0eTtcclxuICAgIHRoaXMuZnJhbWVkSW1hZ2VOb2RlVmlzaWJsZVByb3BlcnR5ID0gZnJhbWVkSW1hZ2VOb2RlLnZpc2libGVQcm9wZXJ0eTtcclxuXHJcbiAgICB0aGlzLnJlc2V0RnJhbWVPYmplY3RTY2VuZU5vZGUgPSAoKSA9PiB7XHJcbiAgICAgIGZyYW1lZE9iamVjdFdhc0RyYWdnZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICBzZWNvbmRQb2ludFdhc0RyYWdnZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMucmVzZXRGcmFtZU9iamVjdFNjZW5lTm9kZSgpO1xyXG4gIH1cclxufVxyXG5cclxuZ2VvbWV0cmljT3B0aWNzLnJlZ2lzdGVyKCAnRnJhbWVkU2NlbmVOb2RlJywgRnJhbWVkU2NlbmVOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsZUFBZSxNQUFNLDBCQUEwQjtBQUV0RCxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBRWxELE9BQU9DLGdCQUFnQixNQUFNLHVCQUF1QjtBQUdwRCxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBRWxELE9BQU9DLFFBQVEsTUFBTSxnQkFBZ0I7QUFDckMsT0FBT0MsaUJBQWlCLE1BQU0sd0JBQXdCO0FBQ3RELE9BQU9DLDJCQUEyQixNQUFNLGtDQUFrQztBQUMxRSxPQUFPQyx5QkFBeUIsTUFBTSxnQ0FBZ0M7QUFDdEUsT0FBT0Ms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