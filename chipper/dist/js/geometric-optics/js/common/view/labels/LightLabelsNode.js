// Copyright 2021-2023, University of Colorado Boulder

/**
 * LightLabelsNode labels things in the 'Light' scene.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import geometricOptics from '../../../geometricOptics.js';
import GeometricOpticsStrings from '../../../GeometricOpticsStrings.js';
import LabelNode from './LabelNode.js';
import GOLabelsNode from './GOLabelsNode.js';
import OpticalObjectLabelNode from './OpticalObjectLabelNode.js';
export default class LightLabelsNode extends GOLabelsNode {
  /**
   * @param sceneNode - the scene whose lights were are labeling
   * @param zoomTransformProperty - model-view transform that the user controls by zooming in/out
   * @param modelVisibleBoundsProperty - ScreenView's visibleBounds in the model coordinate frame, with the zoom transform applied
   * @param providedOptions
   */
  constructor(sceneNode, zoomTransformProperty, modelVisibleBoundsProperty, providedOptions) {
    super(sceneNode, zoomTransformProperty, modelVisibleBoundsProperty, providedOptions);
    const scene = sceneNode.scene;

    // Object labels ------------------------------------------------------------------------------------

    const object1Label = new LightObjectLabelNode(scene.lightObject1, zoomTransformProperty, {
      // Use numbering in the full version of the sim, or in the Basics version if Object 2 is visible.
      isNumberedProperty: new DerivedProperty([sceneNode.lightObject2NodeVisibleProperty], lightObject2NodeVisible => !providedOptions.isBasicsVersion || lightObject2NodeVisible),
      visibleProperty: sceneNode.lightObject1NodeVisibleProperty,
      tandem: providedOptions.tandem.createTandem('object1Label')
    });
    this.addChild(object1Label);
    const object2Label = new LightObjectLabelNode(scene.lightObject2, zoomTransformProperty, {
      visibleProperty: sceneNode.lightObject2NodeVisibleProperty,
      tandem: providedOptions.tandem.createTandem('object2Label')
    });
    this.addChild(object2Label);

    // Screen label ------------------------------------------------------------------------------------

    const screenLabelPositionProperty = new DerivedProperty([scene.projectionScreen.positionProperty], position => new Vector2(position.x - 25, position.y - 65) // empirically, model coordinates
    );

    const screenLabel = new LabelNode(GeometricOpticsStrings.label.projectionScreenStringProperty, screenLabelPositionProperty, zoomTransformProperty, {
      visibleProperty: sceneNode.projectionScreenNodeVisibleProperty,
      tandem: providedOptions.tandem.createTandem('screenLabel')
    });
    this.addChild(screenLabel);
  }
}
// Label for a light object.
class LightObjectLabelNode extends OpticalObjectLabelNode {
  constructor(lightObject, zoomTransformProperty, providedOptions) {
    // Position the label below the light, slightly to the left of center (determined empirically)
    const labelPositionProperty = new DerivedProperty([lightObject.boundsProperty], bounds => new Vector2(bounds.centerX - 15, bounds.top));
    super(lightObject.opticalObjectNumber, labelPositionProperty, zoomTransformProperty, providedOptions);
  }
}
geometricOptics.register('LightLabelsNode', LightLabelsNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJWZWN0b3IyIiwiZ2VvbWV0cmljT3B0aWNzIiwiR2VvbWV0cmljT3B0aWNzU3RyaW5ncyIsIkxhYmVsTm9kZSIsIkdPTGFiZWxzTm9kZSIsIk9wdGljYWxPYmplY3RMYWJlbE5vZGUiLCJMaWdodExhYmVsc05vZGUiLCJjb25zdHJ1Y3RvciIsInNjZW5lTm9kZSIsInpvb21UcmFuc2Zvcm1Qcm9wZXJ0eSIsIm1vZGVsVmlzaWJsZUJvdW5kc1Byb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwic2NlbmUiLCJvYmplY3QxTGFiZWwiLCJMaWdodE9iamVjdExhYmVsTm9kZSIsImxpZ2h0T2JqZWN0MSIsImlzTnVtYmVyZWRQcm9wZXJ0eSIsImxpZ2h0T2JqZWN0Mk5vZGVWaXNpYmxlUHJvcGVydHkiLCJsaWdodE9iamVjdDJOb2RlVmlzaWJsZSIsImlzQmFzaWNzVmVyc2lvbiIsInZpc2libGVQcm9wZXJ0eSIsImxpZ2h0T2JqZWN0MU5vZGVWaXNpYmxlUHJvcGVydHkiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJhZGRDaGlsZCIsIm9iamVjdDJMYWJlbCIsImxpZ2h0T2JqZWN0MiIsInNjcmVlbkxhYmVsUG9zaXRpb25Qcm9wZXJ0eSIsInByb2plY3Rpb25TY3JlZW4iLCJwb3NpdGlvblByb3BlcnR5IiwicG9zaXRpb24iLCJ4IiwieSIsInNjcmVlbkxhYmVsIiwibGFiZWwiLCJwcm9qZWN0aW9uU2NyZWVuU3RyaW5nUHJvcGVydHkiLCJwcm9qZWN0aW9uU2NyZWVuTm9kZVZpc2libGVQcm9wZXJ0eSIsImxpZ2h0T2JqZWN0IiwibGFiZWxQb3NpdGlvblByb3BlcnR5IiwiYm91bmRzUHJvcGVydHkiLCJib3VuZHMiLCJjZW50ZXJYIiwidG9wIiwib3B0aWNhbE9iamVjdE51bWJlciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGlnaHRMYWJlbHNOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIExpZ2h0TGFiZWxzTm9kZSBsYWJlbHMgdGhpbmdzIGluIHRoZSAnTGlnaHQnIHNjZW5lLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBnZW9tZXRyaWNPcHRpY3MgZnJvbSAnLi4vLi4vLi4vZ2VvbWV0cmljT3B0aWNzLmpzJztcclxuaW1wb3J0IEdlb21ldHJpY09wdGljc1N0cmluZ3MgZnJvbSAnLi4vLi4vLi4vR2VvbWV0cmljT3B0aWNzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBMYWJlbE5vZGUgZnJvbSAnLi9MYWJlbE5vZGUuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgR09MYWJlbHNOb2RlLCB7IEdPU2NlbmVMYWJlbHNOb2RlT3B0aW9ucyB9IGZyb20gJy4vR09MYWJlbHNOb2RlLmpzJztcclxuaW1wb3J0IExpZ2h0T2JqZWN0IGZyb20gJy4uLy4uL21vZGVsL0xpZ2h0T2JqZWN0LmpzJztcclxuaW1wb3J0IE9wdGljYWxPYmplY3RMYWJlbE5vZGUsIHsgT3B0aWNhbE9iamVjdExhYmVsTm9kZU9wdGlvbnMgfSBmcm9tICcuL09wdGljYWxPYmplY3RMYWJlbE5vZGUuanMnO1xyXG5pbXBvcnQgTGlnaHRTY2VuZU5vZGUgZnJvbSAnLi4vTGlnaHRTY2VuZU5vZGUuanMnO1xyXG5pbXBvcnQgeyBHT1NpbU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9HT1NpbS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gUGlja1JlcXVpcmVkPEdPU2ltT3B0aW9ucywgJ2lzQmFzaWNzVmVyc2lvbic+O1xyXG5cclxudHlwZSBMaWdodE9iamVjdFNjZW5lTGFiZWxzTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIEdPU2NlbmVMYWJlbHNOb2RlT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpZ2h0TGFiZWxzTm9kZSBleHRlbmRzIEdPTGFiZWxzTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBzY2VuZU5vZGUgLSB0aGUgc2NlbmUgd2hvc2UgbGlnaHRzIHdlcmUgYXJlIGxhYmVsaW5nXHJcbiAgICogQHBhcmFtIHpvb21UcmFuc2Zvcm1Qcm9wZXJ0eSAtIG1vZGVsLXZpZXcgdHJhbnNmb3JtIHRoYXQgdGhlIHVzZXIgY29udHJvbHMgYnkgem9vbWluZyBpbi9vdXRcclxuICAgKiBAcGFyYW0gbW9kZWxWaXNpYmxlQm91bmRzUHJvcGVydHkgLSBTY3JlZW5WaWV3J3MgdmlzaWJsZUJvdW5kcyBpbiB0aGUgbW9kZWwgY29vcmRpbmF0ZSBmcmFtZSwgd2l0aCB0aGUgem9vbSB0cmFuc2Zvcm0gYXBwbGllZFxyXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNjZW5lTm9kZTogTGlnaHRTY2VuZU5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICB6b29tVHJhbnNmb3JtUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PE1vZGVsVmlld1RyYW5zZm9ybTI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgbW9kZWxWaXNpYmxlQm91bmRzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PEJvdW5kczI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zOiBMaWdodE9iamVjdFNjZW5lTGFiZWxzTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoIHNjZW5lTm9kZSwgem9vbVRyYW5zZm9ybVByb3BlcnR5LCBtb2RlbFZpc2libGVCb3VuZHNQcm9wZXJ0eSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3Qgc2NlbmUgPSBzY2VuZU5vZGUuc2NlbmU7XHJcblxyXG4gICAgLy8gT2JqZWN0IGxhYmVscyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjb25zdCBvYmplY3QxTGFiZWwgPSBuZXcgTGlnaHRPYmplY3RMYWJlbE5vZGUoIHNjZW5lLmxpZ2h0T2JqZWN0MSwgem9vbVRyYW5zZm9ybVByb3BlcnR5LCB7XHJcblxyXG4gICAgICAvLyBVc2UgbnVtYmVyaW5nIGluIHRoZSBmdWxsIHZlcnNpb24gb2YgdGhlIHNpbSwgb3IgaW4gdGhlIEJhc2ljcyB2ZXJzaW9uIGlmIE9iamVjdCAyIGlzIHZpc2libGUuXHJcbiAgICAgIGlzTnVtYmVyZWRQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBzY2VuZU5vZGUubGlnaHRPYmplY3QyTm9kZVZpc2libGVQcm9wZXJ0eSBdLFxyXG4gICAgICAgIGxpZ2h0T2JqZWN0Mk5vZGVWaXNpYmxlID0+ICggIXByb3ZpZGVkT3B0aW9ucy5pc0Jhc2ljc1ZlcnNpb24gfHwgbGlnaHRPYmplY3QyTm9kZVZpc2libGUgKVxyXG4gICAgICApLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHNjZW5lTm9kZS5saWdodE9iamVjdDFOb2RlVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICB0YW5kZW06IHByb3ZpZGVkT3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnb2JqZWN0MUxhYmVsJyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBvYmplY3QxTGFiZWwgKTtcclxuXHJcbiAgICBjb25zdCBvYmplY3QyTGFiZWwgPSBuZXcgTGlnaHRPYmplY3RMYWJlbE5vZGUoIHNjZW5lLmxpZ2h0T2JqZWN0Miwgem9vbVRyYW5zZm9ybVByb3BlcnR5LCB7XHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogc2NlbmVOb2RlLmxpZ2h0T2JqZWN0Mk5vZGVWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogcHJvdmlkZWRPcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdvYmplY3QyTGFiZWwnIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG9iamVjdDJMYWJlbCApO1xyXG5cclxuICAgIC8vIFNjcmVlbiBsYWJlbCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjb25zdCBzY3JlZW5MYWJlbFBvc2l0aW9uUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHNjZW5lLnByb2plY3Rpb25TY3JlZW4ucG9zaXRpb25Qcm9wZXJ0eSBdLFxyXG4gICAgICBwb3NpdGlvbiA9PiBuZXcgVmVjdG9yMiggcG9zaXRpb24ueCAtIDI1LCBwb3NpdGlvbi55IC0gNjUgKSAvLyBlbXBpcmljYWxseSwgbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgICk7XHJcblxyXG4gICAgY29uc3Qgc2NyZWVuTGFiZWwgPSBuZXcgTGFiZWxOb2RlKCBHZW9tZXRyaWNPcHRpY3NTdHJpbmdzLmxhYmVsLnByb2plY3Rpb25TY3JlZW5TdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgc2NyZWVuTGFiZWxQb3NpdGlvblByb3BlcnR5LCB6b29tVHJhbnNmb3JtUHJvcGVydHksIHtcclxuICAgICAgICB2aXNpYmxlUHJvcGVydHk6IHNjZW5lTm9kZS5wcm9qZWN0aW9uU2NyZWVuTm9kZVZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgICB0YW5kZW06IHByb3ZpZGVkT3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2NyZWVuTGFiZWwnIClcclxuICAgICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggc2NyZWVuTGFiZWwgKTtcclxuICB9XHJcbn1cclxuXHJcbnR5cGUgTGlnaHRPYmplY3RMYWJlbE5vZGVPcHRpb25zID0gT3B0aWNhbE9iamVjdExhYmVsTm9kZU9wdGlvbnM7XHJcblxyXG4vLyBMYWJlbCBmb3IgYSBsaWdodCBvYmplY3QuXHJcbmNsYXNzIExpZ2h0T2JqZWN0TGFiZWxOb2RlIGV4dGVuZHMgT3B0aWNhbE9iamVjdExhYmVsTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGlnaHRPYmplY3Q6IExpZ2h0T2JqZWN0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgem9vbVRyYW5zZm9ybVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxNb2RlbFZpZXdUcmFuc2Zvcm0yPixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9uczogTGlnaHRPYmplY3RMYWJlbE5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIC8vIFBvc2l0aW9uIHRoZSBsYWJlbCBiZWxvdyB0aGUgbGlnaHQsIHNsaWdodGx5IHRvIHRoZSBsZWZ0IG9mIGNlbnRlciAoZGV0ZXJtaW5lZCBlbXBpcmljYWxseSlcclxuICAgIGNvbnN0IGxhYmVsUG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgbGlnaHRPYmplY3QuYm91bmRzUHJvcGVydHkgXSxcclxuICAgICAgYm91bmRzID0+IG5ldyBWZWN0b3IyKCBib3VuZHMuY2VudGVyWCAtIDE1LCBib3VuZHMudG9wIClcclxuICAgICk7XHJcblxyXG4gICAgc3VwZXIoIGxpZ2h0T2JqZWN0Lm9wdGljYWxPYmplY3ROdW1iZXIsIGxhYmVsUG9zaXRpb25Qcm9wZXJ0eSwgem9vbVRyYW5zZm9ybVByb3BlcnR5LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmdlb21ldHJpY09wdGljcy5yZWdpc3RlciggJ0xpZ2h0TGFiZWxzTm9kZScsIExpZ2h0TGFiZWxzTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sMkNBQTJDO0FBQ3ZFLE9BQU9DLE9BQU8sTUFBTSxrQ0FBa0M7QUFDdEQsT0FBT0MsZUFBZSxNQUFNLDZCQUE2QjtBQUN6RCxPQUFPQyxzQkFBc0IsTUFBTSxvQ0FBb0M7QUFDdkUsT0FBT0MsU0FBUyxNQUFNLGdCQUFnQjtBQUl0QyxPQUFPQyxZQUFZLE1BQW9DLG1CQUFtQjtBQUUxRSxPQUFPQyxzQkFBc0IsTUFBeUMsNkJBQTZCO0FBU25HLGVBQWUsTUFBTUMsZUFBZSxTQUFTRixZQUFZLENBQUM7RUFFeEQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NHLFdBQVdBLENBQUVDLFNBQXlCLEVBQ3pCQyxxQkFBNkQsRUFDN0RDLDBCQUFzRCxFQUN0REMsZUFBa0QsRUFBRztJQUV2RSxLQUFLLENBQUVILFNBQVMsRUFBRUMscUJBQXFCLEVBQUVDLDBCQUEwQixFQUFFQyxlQUFnQixDQUFDO0lBRXRGLE1BQU1DLEtBQUssR0FBR0osU0FBUyxDQUFDSSxLQUFLOztJQUU3Qjs7SUFFQSxNQUFNQyxZQUFZLEdBQUcsSUFBSUMsb0JBQW9CLENBQUVGLEtBQUssQ0FBQ0csWUFBWSxFQUFFTixxQkFBcUIsRUFBRTtNQUV4RjtNQUNBTyxrQkFBa0IsRUFBRSxJQUFJakIsZUFBZSxDQUFFLENBQUVTLFNBQVMsQ0FBQ1MsK0JBQStCLENBQUUsRUFDcEZDLHVCQUF1QixJQUFNLENBQUNQLGVBQWUsQ0FBQ1EsZUFBZSxJQUFJRCx1QkFDbkUsQ0FBQztNQUNERSxlQUFlLEVBQUVaLFNBQVMsQ0FBQ2EsK0JBQStCO01BQzFEQyxNQUFNLEVBQUVYLGVBQWUsQ0FBQ1csTUFBTSxDQUFDQyxZQUFZLENBQUUsY0FBZTtJQUM5RCxDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNDLFFBQVEsQ0FBRVgsWUFBYSxDQUFDO0lBRTdCLE1BQU1ZLFlBQVksR0FBRyxJQUFJWCxvQkFBb0IsQ0FBRUYsS0FBSyxDQUFDYyxZQUFZLEVBQUVqQixxQkFBcUIsRUFBRTtNQUN4RlcsZUFBZSxFQUFFWixTQUFTLENBQUNTLCtCQUErQjtNQUMxREssTUFBTSxFQUFFWCxlQUFlLENBQUNXLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLGNBQWU7SUFDOUQsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDQyxRQUFRLENBQUVDLFlBQWEsQ0FBQzs7SUFFN0I7O0lBRUEsTUFBTUUsMkJBQTJCLEdBQUcsSUFBSTVCLGVBQWUsQ0FDckQsQ0FBRWEsS0FBSyxDQUFDZ0IsZ0JBQWdCLENBQUNDLGdCQUFnQixDQUFFLEVBQzNDQyxRQUFRLElBQUksSUFBSTlCLE9BQU8sQ0FBRThCLFFBQVEsQ0FBQ0MsQ0FBQyxHQUFHLEVBQUUsRUFBRUQsUUFBUSxDQUFDRSxDQUFDLEdBQUcsRUFBRyxDQUFDLENBQUM7SUFDOUQsQ0FBQzs7SUFFRCxNQUFNQyxXQUFXLEdBQUcsSUFBSTlCLFNBQVMsQ0FBRUQsc0JBQXNCLENBQUNnQyxLQUFLLENBQUNDLDhCQUE4QixFQUM1RlIsMkJBQTJCLEVBQUVsQixxQkFBcUIsRUFBRTtNQUNsRFcsZUFBZSxFQUFFWixTQUFTLENBQUM0QixtQ0FBbUM7TUFDOURkLE1BQU0sRUFBRVgsZUFBZSxDQUFDVyxNQUFNLENBQUNDLFlBQVksQ0FBRSxhQUFjO0lBQzdELENBQUUsQ0FBQztJQUNMLElBQUksQ0FBQ0MsUUFBUSxDQUFFUyxXQUFZLENBQUM7RUFDOUI7QUFDRjtBQUlBO0FBQ0EsTUFBTW5CLG9CQUFvQixTQUFTVCxzQkFBc0IsQ0FBQztFQUVqREUsV0FBV0EsQ0FBRThCLFdBQXdCLEVBQ3hCNUIscUJBQTZELEVBQzdERSxlQUE0QyxFQUFHO0lBRWpFO0lBQ0EsTUFBTTJCLHFCQUFxQixHQUFHLElBQUl2QyxlQUFlLENBQUUsQ0FBRXNDLFdBQVcsQ0FBQ0UsY0FBYyxDQUFFLEVBQy9FQyxNQUFNLElBQUksSUFBSXhDLE9BQU8sQ0FBRXdDLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLEVBQUUsRUFBRUQsTUFBTSxDQUFDRSxHQUFJLENBQ3pELENBQUM7SUFFRCxLQUFLLENBQUVMLFdBQVcsQ0FBQ00sbUJBQW1CLEVBQUVMLHFCQUFxQixFQUFFN0IscUJBQXFCLEVBQUVFLGVBQWdCLENBQUM7RUFDekc7QUFDRjtBQUVBVixlQUFlLENBQUMyQyxRQUFRLENBQUUsaUJBQWlCLEVBQUV0QyxlQUFnQixDQUFDIn0=