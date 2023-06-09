// Copyright 2021-2022, University of Colorado Boulder

/**
 * FramedLabelsNode labels things in the 'Framed' scene, which has a framed object and image.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import geometricOptics from '../../../geometricOptics.js';
import GOLabelsNode from './GOLabelsNode.js';
import OpticalObjectLabelNode from './OpticalObjectLabelNode.js';
import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import OpticalImageLabelNode from './OpticalImageLabelNode.js';
export default class FramedLabelsNode extends GOLabelsNode {
  /**
   * @param sceneNode - the scene whose optical objects we are labeling
   * @param zoomTransformProperty - model-view transform that the user controls by zooming in/out
   * @param modelVisibleBoundsProperty - ScreenView's visibleBounds in the model coordinate frame, with the zoom transform applied
   * @param providedOptions
   */
  constructor(sceneNode, zoomTransformProperty, modelVisibleBoundsProperty, providedOptions) {
    super(sceneNode, zoomTransformProperty, modelVisibleBoundsProperty, providedOptions);
    const scene = sceneNode.scene;
    const isNumberedProperty = new BooleanProperty(false, {
      validValues: [false]
    });

    // Object label ------------------------------------------------------------------------------------

    const objectLabelPositionProperty = new DerivedProperty([scene.framedObject.boundsProperty], bounds => bounds.centerTop);
    const objectLabel = new OpticalObjectLabelNode(scene.framedObject.opticalObjectNumber, objectLabelPositionProperty, zoomTransformProperty, {
      isNumberedProperty: isNumberedProperty,
      visibleProperty: sceneNode.framedObjectNodeVisibleProperty,
      tandem: providedOptions.tandem.createTandem('objectLabel')
    });
    this.addChild(objectLabel);

    // Image label ------------------------------------------------------------------------------------

    const imageLabelPositionProperty = new DerivedProperty([scene.framedImage1.boundsProperty], bounds => bounds.centerTop);
    const imageLabel = new OpticalImageLabelNode(scene.framedImage1, imageLabelPositionProperty, zoomTransformProperty, {
      isNumberedProperty: isNumberedProperty,
      visibleProperty: sceneNode.framedImageNodeVisibleProperty,
      tandem: providedOptions.tandem.createTandem('imageLabel')
    });
    this.addChild(imageLabel);
  }
}
geometricOptics.register('FramedLabelsNode', FramedLabelsNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJnZW9tZXRyaWNPcHRpY3MiLCJHT0xhYmVsc05vZGUiLCJPcHRpY2FsT2JqZWN0TGFiZWxOb2RlIiwiQm9vbGVhblByb3BlcnR5IiwiT3B0aWNhbEltYWdlTGFiZWxOb2RlIiwiRnJhbWVkTGFiZWxzTm9kZSIsImNvbnN0cnVjdG9yIiwic2NlbmVOb2RlIiwiem9vbVRyYW5zZm9ybVByb3BlcnR5IiwibW9kZWxWaXNpYmxlQm91bmRzUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJzY2VuZSIsImlzTnVtYmVyZWRQcm9wZXJ0eSIsInZhbGlkVmFsdWVzIiwib2JqZWN0TGFiZWxQb3NpdGlvblByb3BlcnR5IiwiZnJhbWVkT2JqZWN0IiwiYm91bmRzUHJvcGVydHkiLCJib3VuZHMiLCJjZW50ZXJUb3AiLCJvYmplY3RMYWJlbCIsIm9wdGljYWxPYmplY3ROdW1iZXIiLCJ2aXNpYmxlUHJvcGVydHkiLCJmcmFtZWRPYmplY3ROb2RlVmlzaWJsZVByb3BlcnR5IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiYWRkQ2hpbGQiLCJpbWFnZUxhYmVsUG9zaXRpb25Qcm9wZXJ0eSIsImZyYW1lZEltYWdlMSIsImltYWdlTGFiZWwiLCJmcmFtZWRJbWFnZU5vZGVWaXNpYmxlUHJvcGVydHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkZyYW1lZExhYmVsc05vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRnJhbWVkTGFiZWxzTm9kZSBsYWJlbHMgdGhpbmdzIGluIHRoZSAnRnJhbWVkJyBzY2VuZSwgd2hpY2ggaGFzIGEgZnJhbWVkIG9iamVjdCBhbmQgaW1hZ2UuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBnZW9tZXRyaWNPcHRpY3MgZnJvbSAnLi4vLi4vLi4vZ2VvbWV0cmljT3B0aWNzLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IEdPTGFiZWxzTm9kZSwgeyBHT1NjZW5lTGFiZWxzTm9kZU9wdGlvbnMgfSBmcm9tICcuL0dPTGFiZWxzTm9kZS5qcyc7XHJcbmltcG9ydCBPcHRpY2FsT2JqZWN0TGFiZWxOb2RlIGZyb20gJy4vT3B0aWNhbE9iamVjdExhYmVsTm9kZS5qcyc7XHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgT3B0aWNhbEltYWdlTGFiZWxOb2RlIGZyb20gJy4vT3B0aWNhbEltYWdlTGFiZWxOb2RlLmpzJztcclxuaW1wb3J0IEZyYW1lZFNjZW5lTm9kZSBmcm9tICcuLi9GcmFtZWRTY2VuZU5vZGUuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRnJhbWVkTGFiZWxzTm9kZSBleHRlbmRzIEdPTGFiZWxzTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBzY2VuZU5vZGUgLSB0aGUgc2NlbmUgd2hvc2Ugb3B0aWNhbCBvYmplY3RzIHdlIGFyZSBsYWJlbGluZ1xyXG4gICAqIEBwYXJhbSB6b29tVHJhbnNmb3JtUHJvcGVydHkgLSBtb2RlbC12aWV3IHRyYW5zZm9ybSB0aGF0IHRoZSB1c2VyIGNvbnRyb2xzIGJ5IHpvb21pbmcgaW4vb3V0XHJcbiAgICogQHBhcmFtIG1vZGVsVmlzaWJsZUJvdW5kc1Byb3BlcnR5IC0gU2NyZWVuVmlldydzIHZpc2libGVCb3VuZHMgaW4gdGhlIG1vZGVsIGNvb3JkaW5hdGUgZnJhbWUsIHdpdGggdGhlIHpvb20gdHJhbnNmb3JtIGFwcGxpZWRcclxuICAgKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzY2VuZU5vZGU6IEZyYW1lZFNjZW5lTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgIHpvb21UcmFuc2Zvcm1Qcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8TW9kZWxWaWV3VHJhbnNmb3JtMj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBtb2RlbFZpc2libGVCb3VuZHNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Qm91bmRzMj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IEdPU2NlbmVMYWJlbHNOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBzdXBlciggc2NlbmVOb2RlLCB6b29tVHJhbnNmb3JtUHJvcGVydHksIG1vZGVsVmlzaWJsZUJvdW5kc1Byb3BlcnR5LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBzY2VuZSA9IHNjZW5lTm9kZS5zY2VuZTtcclxuXHJcbiAgICBjb25zdCBpc051bWJlcmVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB2YWxpZFZhbHVlczogWyBmYWxzZSBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gT2JqZWN0IGxhYmVsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNvbnN0IG9iamVjdExhYmVsUG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgc2NlbmUuZnJhbWVkT2JqZWN0LmJvdW5kc1Byb3BlcnR5IF0sXHJcbiAgICAgIGJvdW5kcyA9PiBib3VuZHMuY2VudGVyVG9wXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IG9iamVjdExhYmVsID0gbmV3IE9wdGljYWxPYmplY3RMYWJlbE5vZGUoIHNjZW5lLmZyYW1lZE9iamVjdC5vcHRpY2FsT2JqZWN0TnVtYmVyLFxyXG4gICAgICBvYmplY3RMYWJlbFBvc2l0aW9uUHJvcGVydHksIHpvb21UcmFuc2Zvcm1Qcm9wZXJ0eSwge1xyXG4gICAgICAgIGlzTnVtYmVyZWRQcm9wZXJ0eTogaXNOdW1iZXJlZFByb3BlcnR5LFxyXG4gICAgICAgIHZpc2libGVQcm9wZXJ0eTogc2NlbmVOb2RlLmZyYW1lZE9iamVjdE5vZGVWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgICAgdGFuZGVtOiBwcm92aWRlZE9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ29iamVjdExhYmVsJyApXHJcbiAgICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG9iamVjdExhYmVsICk7XHJcblxyXG4gICAgLy8gSW1hZ2UgbGFiZWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY29uc3QgaW1hZ2VMYWJlbFBvc2l0aW9uUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHNjZW5lLmZyYW1lZEltYWdlMS5ib3VuZHNQcm9wZXJ0eSBdLFxyXG4gICAgICBib3VuZHMgPT4gYm91bmRzLmNlbnRlclRvcFxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBpbWFnZUxhYmVsID0gbmV3IE9wdGljYWxJbWFnZUxhYmVsTm9kZSggc2NlbmUuZnJhbWVkSW1hZ2UxLCBpbWFnZUxhYmVsUG9zaXRpb25Qcm9wZXJ0eSwgem9vbVRyYW5zZm9ybVByb3BlcnR5LCB7XHJcbiAgICAgIGlzTnVtYmVyZWRQcm9wZXJ0eTogaXNOdW1iZXJlZFByb3BlcnR5LFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHNjZW5lTm9kZS5mcmFtZWRJbWFnZU5vZGVWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogcHJvdmlkZWRPcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbWFnZUxhYmVsJyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBpbWFnZUxhYmVsICk7XHJcbiAgfVxyXG59XHJcblxyXG5nZW9tZXRyaWNPcHRpY3MucmVnaXN0ZXIoICdGcmFtZWRMYWJlbHNOb2RlJywgRnJhbWVkTGFiZWxzTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sMkNBQTJDO0FBQ3ZFLE9BQU9DLGVBQWUsTUFBTSw2QkFBNkI7QUFJekQsT0FBT0MsWUFBWSxNQUFvQyxtQkFBbUI7QUFDMUUsT0FBT0Msc0JBQXNCLE1BQU0sNkJBQTZCO0FBQ2hFLE9BQU9DLGVBQWUsTUFBTSwyQ0FBMkM7QUFDdkUsT0FBT0MscUJBQXFCLE1BQU0sNEJBQTRCO0FBRzlELGVBQWUsTUFBTUMsZ0JBQWdCLFNBQVNKLFlBQVksQ0FBQztFQUV6RDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU0ssV0FBV0EsQ0FBRUMsU0FBMEIsRUFDMUJDLHFCQUE2RCxFQUM3REMsMEJBQXNELEVBQ3REQyxlQUF5QyxFQUFHO0lBRTlELEtBQUssQ0FBRUgsU0FBUyxFQUFFQyxxQkFBcUIsRUFBRUMsMEJBQTBCLEVBQUVDLGVBQWdCLENBQUM7SUFFdEYsTUFBTUMsS0FBSyxHQUFHSixTQUFTLENBQUNJLEtBQUs7SUFFN0IsTUFBTUMsa0JBQWtCLEdBQUcsSUFBSVQsZUFBZSxDQUFFLEtBQUssRUFBRTtNQUNyRFUsV0FBVyxFQUFFLENBQUUsS0FBSztJQUN0QixDQUFFLENBQUM7O0lBRUg7O0lBRUEsTUFBTUMsMkJBQTJCLEdBQUcsSUFBSWYsZUFBZSxDQUNyRCxDQUFFWSxLQUFLLENBQUNJLFlBQVksQ0FBQ0MsY0FBYyxDQUFFLEVBQ3JDQyxNQUFNLElBQUlBLE1BQU0sQ0FBQ0MsU0FDbkIsQ0FBQztJQUVELE1BQU1DLFdBQVcsR0FBRyxJQUFJakIsc0JBQXNCLENBQUVTLEtBQUssQ0FBQ0ksWUFBWSxDQUFDSyxtQkFBbUIsRUFDcEZOLDJCQUEyQixFQUFFTixxQkFBcUIsRUFBRTtNQUNsREksa0JBQWtCLEVBQUVBLGtCQUFrQjtNQUN0Q1MsZUFBZSxFQUFFZCxTQUFTLENBQUNlLCtCQUErQjtNQUMxREMsTUFBTSxFQUFFYixlQUFlLENBQUNhLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLGFBQWM7SUFDN0QsQ0FBRSxDQUFDO0lBQ0wsSUFBSSxDQUFDQyxRQUFRLENBQUVOLFdBQVksQ0FBQzs7SUFFNUI7O0lBRUEsTUFBTU8sMEJBQTBCLEdBQUcsSUFBSTNCLGVBQWUsQ0FDcEQsQ0FBRVksS0FBSyxDQUFDZ0IsWUFBWSxDQUFDWCxjQUFjLENBQUUsRUFDckNDLE1BQU0sSUFBSUEsTUFBTSxDQUFDQyxTQUNuQixDQUFDO0lBRUQsTUFBTVUsVUFBVSxHQUFHLElBQUl4QixxQkFBcUIsQ0FBRU8sS0FBSyxDQUFDZ0IsWUFBWSxFQUFFRCwwQkFBMEIsRUFBRWxCLHFCQUFxQixFQUFFO01BQ25ISSxrQkFBa0IsRUFBRUEsa0JBQWtCO01BQ3RDUyxlQUFlLEVBQUVkLFNBQVMsQ0FBQ3NCLDhCQUE4QjtNQUN6RE4sTUFBTSxFQUFFYixlQUFlLENBQUNhLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLFlBQWE7SUFDNUQsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDQyxRQUFRLENBQUVHLFVBQVcsQ0FBQztFQUM3QjtBQUNGO0FBRUE1QixlQUFlLENBQUM4QixRQUFRLENBQUUsa0JBQWtCLEVBQUV6QixnQkFBaUIsQ0FBQyJ9