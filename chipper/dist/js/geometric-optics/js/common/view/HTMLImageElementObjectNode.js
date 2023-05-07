// Copyright 2021-2022, University of Colorado Boulder

/**
 * HTMLImageElementObjectNode is the view of an object that uses an HTMLImageElement for its visual representation.
 * Framed objects and light objects are subclasses of this object type.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Martin Veillette
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { DragListener, FocusHighlightFromNode, Image, KeyboardDragListener, Node } from '../../../../scenery/js/imports.js';
import geometricOptics from '../../geometricOptics.js';
import GOConstants from '../GOConstants.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import stepTimer from '../../../../axon/js/stepTimer.js';
import OpticalObjectNode from './OpticalObjectNode.js';
import Multilink from '../../../../axon/js/Multilink.js';
export default class HTMLImageElementObjectNode extends OpticalObjectNode {
  /**
   * @param htmlImageElementObject - model element
   * @param sceneBoundsProperty - bounds for the scene, in model coordinates
   * @param opticPositionProperty - position of the optic
   * @param modelViewTransform
   * @param objectDragModeProperty - constrains how the optical object can be dragged
   * @param wasDraggedProperty - was this optical object dragged?
   * @param providedOptions
   */
  constructor(htmlImageElementObject, sceneBoundsProperty, opticPositionProperty, modelViewTransform, objectDragModeProperty, wasDraggedProperty, providedOptions) {
    super(htmlImageElementObject, objectDragModeProperty, wasDraggedProperty, providedOptions);
    const imageNode = new Image(htmlImageElementObject.htmlImageElementProperty.value);

    // Wrap imageNode in a Node. We need to scale imageNode, but do not want its focus highlight to scale.
    const wrappedImageNode = new Node({
      children: [imageNode]
    });
    this.addChild(wrappedImageNode);
    this.setFocusHighlight(new FocusHighlightFromNode(wrappedImageNode));
    const updateScale = () => {
      const sceneBounds = htmlImageElementObject.boundsProperty.value;
      const viewBounds = modelViewTransform.modelToViewBounds(sceneBounds);
      const scaleX = viewBounds.width / imageNode.width || GOConstants.MIN_SCALE; // prevent zero scale
      const scaleY = viewBounds.height / imageNode.height || GOConstants.MIN_SCALE; // prevent zero scale
      imageNode.scale(scaleX, scaleY);
    };

    // Change the PNG image.
    htmlImageElementObject.htmlImageElementProperty.link(htmlImageElement => {
      imageNode.image = htmlImageElement;
      updateScale();
    });

    // Translate and scale
    htmlImageElementObject.boundsProperty.link(bounds => {
      this.translation = modelViewTransform.modelToViewBounds(bounds).leftTop;
      updateScale();
    });

    // Drag bounds, in model coordinates. Keep the full object within the model bounds and to the left of the optic.
    // Use Math.floor herein to avoid floating-point rounding errors that result in unwanted changes and additional
    // reentrant Properties, see https://github.com/phetsims/geometric-optics/issues/317.
    const dragBoundsProperty = new DerivedProperty([htmlImageElementObject.boundsProperty, sceneBoundsProperty, objectDragModeProperty], (htmlImageElementObjectBounds, sceneBounds, objectDragMode) => {
      const htmlImageElementObjectPosition = htmlImageElementObject.positionProperty.value;
      const minX = Math.floor(sceneBounds.minX + (htmlImageElementObjectPosition.x - htmlImageElementObjectBounds.minX));
      const maxX = Math.floor(opticPositionProperty.value.x - GOConstants.MIN_DISTANCE_FROM_OBJECT_TO_OPTIC);
      let minY;
      let maxY;
      if (objectDragMode === 'freeDragging') {
        // free dragging
        minY = Math.floor(sceneBounds.minY + (htmlImageElementObjectPosition.y - htmlImageElementObjectBounds.minY));
        maxY = Math.floor(sceneBounds.maxY - (htmlImageElementObjectBounds.maxY - htmlImageElementObjectPosition.y));
      } else {
        // horizontal dragging, locked to the object's current y position
        minY = htmlImageElementObjectPosition.y;
        maxY = minY;
      }
      return new Bounds2(minX, minY, maxX, maxY);
    });

    // Keep the object inside the drag bounds. This is done in the next animation frame to prevent problems with
    // reentrant Properties, as in https://github.com/phetsims/geometric-optics/issues/325.  dragBoundsProperty is
    // derived from htmlImageElementObject.boundsProperty, and will change htmlImageElementObject.boundsProperty by
    // setting htmlImageElementObject.positionProperty.
    dragBoundsProperty.link(dragBounds => {
      const closestPoint = dragBounds.closestPointTo(htmlImageElementObject.positionProperty.value);
      if (!closestPoint.equals(htmlImageElementObject.positionProperty.value)) {
        stepTimer.setTimeout(() => {
          htmlImageElementObject.positionProperty.value = closestPoint;
        }, 0);
      }
    });
    const dragListener = new DragListener({
      positionProperty: htmlImageElementObject.positionProperty,
      dragBoundsProperty: dragBoundsProperty,
      transform: modelViewTransform,
      useParentOffset: true,
      drag: () => this.drag(),
      tandem: providedOptions.tandem.createTandem('dragListener')
    });
    this.addInputListener(dragListener);
    const keyboardDragListener = new KeyboardDragListener(combineOptions({}, GOConstants.KEYBOARD_DRAG_LISTENER_OPTIONS, {
      positionProperty: htmlImageElementObject.positionProperty,
      dragBoundsProperty: dragBoundsProperty,
      transform: modelViewTransform,
      drag: () => this.drag(),
      tandem: providedOptions.tandem.createTandem('keyboardDragListener')
    }));
    this.addInputListener(keyboardDragListener);

    // Keep cueing arrows next to the framed object.
    Multilink.multilink([wrappedImageNode.boundsProperty, this.cueingArrowsNode.boundsProperty], (wrappedImageNodeBounds, cueingArrowsNodeBounds) => {
      this.cueingArrowsNode.right = wrappedImageNode.left - 5;
      this.cueingArrowsNode.centerY = wrappedImageNode.centerY;
    });
  }
}
geometricOptics.register('HTMLImageElementObjectNode', HTMLImageElementObjectNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJCb3VuZHMyIiwiRHJhZ0xpc3RlbmVyIiwiRm9jdXNIaWdobGlnaHRGcm9tTm9kZSIsIkltYWdlIiwiS2V5Ym9hcmREcmFnTGlzdGVuZXIiLCJOb2RlIiwiZ2VvbWV0cmljT3B0aWNzIiwiR09Db25zdGFudHMiLCJjb21iaW5lT3B0aW9ucyIsInN0ZXBUaW1lciIsIk9wdGljYWxPYmplY3ROb2RlIiwiTXVsdGlsaW5rIiwiSFRNTEltYWdlRWxlbWVudE9iamVjdE5vZGUiLCJjb25zdHJ1Y3RvciIsImh0bWxJbWFnZUVsZW1lbnRPYmplY3QiLCJzY2VuZUJvdW5kc1Byb3BlcnR5Iiwib3B0aWNQb3NpdGlvblByb3BlcnR5IiwibW9kZWxWaWV3VHJhbnNmb3JtIiwib2JqZWN0RHJhZ01vZGVQcm9wZXJ0eSIsIndhc0RyYWdnZWRQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsImltYWdlTm9kZSIsImh0bWxJbWFnZUVsZW1lbnRQcm9wZXJ0eSIsInZhbHVlIiwid3JhcHBlZEltYWdlTm9kZSIsImNoaWxkcmVuIiwiYWRkQ2hpbGQiLCJzZXRGb2N1c0hpZ2hsaWdodCIsInVwZGF0ZVNjYWxlIiwic2NlbmVCb3VuZHMiLCJib3VuZHNQcm9wZXJ0eSIsInZpZXdCb3VuZHMiLCJtb2RlbFRvVmlld0JvdW5kcyIsInNjYWxlWCIsIndpZHRoIiwiTUlOX1NDQUxFIiwic2NhbGVZIiwiaGVpZ2h0Iiwic2NhbGUiLCJsaW5rIiwiaHRtbEltYWdlRWxlbWVudCIsImltYWdlIiwiYm91bmRzIiwidHJhbnNsYXRpb24iLCJsZWZ0VG9wIiwiZHJhZ0JvdW5kc1Byb3BlcnR5IiwiaHRtbEltYWdlRWxlbWVudE9iamVjdEJvdW5kcyIsIm9iamVjdERyYWdNb2RlIiwiaHRtbEltYWdlRWxlbWVudE9iamVjdFBvc2l0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsIm1pblgiLCJNYXRoIiwiZmxvb3IiLCJ4IiwibWF4WCIsIk1JTl9ESVNUQU5DRV9GUk9NX09CSkVDVF9UT19PUFRJQyIsIm1pblkiLCJtYXhZIiwieSIsImRyYWdCb3VuZHMiLCJjbG9zZXN0UG9pbnQiLCJjbG9zZXN0UG9pbnRUbyIsImVxdWFscyIsInNldFRpbWVvdXQiLCJkcmFnTGlzdGVuZXIiLCJ0cmFuc2Zvcm0iLCJ1c2VQYXJlbnRPZmZzZXQiLCJkcmFnIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiYWRkSW5wdXRMaXN0ZW5lciIsImtleWJvYXJkRHJhZ0xpc3RlbmVyIiwiS0VZQk9BUkRfRFJBR19MSVNURU5FUl9PUFRJT05TIiwibXVsdGlsaW5rIiwiY3VlaW5nQXJyb3dzTm9kZSIsIndyYXBwZWRJbWFnZU5vZGVCb3VuZHMiLCJjdWVpbmdBcnJvd3NOb2RlQm91bmRzIiwicmlnaHQiLCJsZWZ0IiwiY2VudGVyWSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSFRNTEltYWdlRWxlbWVudE9iamVjdE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSFRNTEltYWdlRWxlbWVudE9iamVjdE5vZGUgaXMgdGhlIHZpZXcgb2YgYW4gb2JqZWN0IHRoYXQgdXNlcyBhbiBIVE1MSW1hZ2VFbGVtZW50IGZvciBpdHMgdmlzdWFsIHJlcHJlc2VudGF0aW9uLlxyXG4gKiBGcmFtZWQgb2JqZWN0cyBhbmQgbGlnaHQgb2JqZWN0cyBhcmUgc3ViY2xhc3NlcyBvZiB0aGlzIG9iamVjdCB0eXBlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCB7IERyYWdMaXN0ZW5lciwgRm9jdXNIaWdobGlnaHRGcm9tTm9kZSwgSW1hZ2UsIEtleWJvYXJkRHJhZ0xpc3RlbmVyLCBLZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMsIE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZ2VvbWV0cmljT3B0aWNzIGZyb20gJy4uLy4uL2dlb21ldHJpY09wdGljcy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgR09Db25zdGFudHMgZnJvbSAnLi4vR09Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgSFRNTEltYWdlRWxlbWVudE9iamVjdCBmcm9tICcuLi9tb2RlbC9IVE1MSW1hZ2VFbGVtZW50T2JqZWN0LmpzJztcclxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xyXG5pbXBvcnQgeyBPYmplY3REcmFnTW9kZSB9IGZyb20gJy4vT2JqZWN0RHJhZ01vZGUuanMnO1xyXG5pbXBvcnQgT3B0aWNhbE9iamVjdE5vZGUsIHsgT3B0aWNhbE9iamVjdE5vZGVPcHRpb25zIH0gZnJvbSAnLi9PcHRpY2FsT2JqZWN0Tm9kZS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5cclxuZXhwb3J0IHR5cGUgSFRNTEltYWdlRWxlbWVudE9iamVjdE5vZGVPcHRpb25zID0gT3B0aWNhbE9iamVjdE5vZGVPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSFRNTEltYWdlRWxlbWVudE9iamVjdE5vZGUgZXh0ZW5kcyBPcHRpY2FsT2JqZWN0Tm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBodG1sSW1hZ2VFbGVtZW50T2JqZWN0IC0gbW9kZWwgZWxlbWVudFxyXG4gICAqIEBwYXJhbSBzY2VuZUJvdW5kc1Byb3BlcnR5IC0gYm91bmRzIGZvciB0aGUgc2NlbmUsIGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcbiAgICogQHBhcmFtIG9wdGljUG9zaXRpb25Qcm9wZXJ0eSAtIHBvc2l0aW9uIG9mIHRoZSBvcHRpY1xyXG4gICAqIEBwYXJhbSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0gb2JqZWN0RHJhZ01vZGVQcm9wZXJ0eSAtIGNvbnN0cmFpbnMgaG93IHRoZSBvcHRpY2FsIG9iamVjdCBjYW4gYmUgZHJhZ2dlZFxyXG4gICAqIEBwYXJhbSB3YXNEcmFnZ2VkUHJvcGVydHkgLSB3YXMgdGhpcyBvcHRpY2FsIG9iamVjdCBkcmFnZ2VkP1xyXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGh0bWxJbWFnZUVsZW1lbnRPYmplY3Q6IEhUTUxJbWFnZUVsZW1lbnRPYmplY3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICBzY2VuZUJvdW5kc1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxCb3VuZHMyPixcclxuICAgICAgICAgICAgICAgICAgICAgIG9wdGljUG9zaXRpb25Qcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8VmVjdG9yMj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBvYmplY3REcmFnTW9kZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxPYmplY3REcmFnTW9kZT4sXHJcbiAgICAgICAgICAgICAgICAgICAgICB3YXNEcmFnZ2VkUHJvcGVydHk6IFRQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9uczogSFRNTEltYWdlRWxlbWVudE9iamVjdE5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCBodG1sSW1hZ2VFbGVtZW50T2JqZWN0LCBvYmplY3REcmFnTW9kZVByb3BlcnR5LCB3YXNEcmFnZ2VkUHJvcGVydHksIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IGltYWdlTm9kZSA9IG5ldyBJbWFnZSggaHRtbEltYWdlRWxlbWVudE9iamVjdC5odG1sSW1hZ2VFbGVtZW50UHJvcGVydHkudmFsdWUgKTtcclxuXHJcbiAgICAvLyBXcmFwIGltYWdlTm9kZSBpbiBhIE5vZGUuIFdlIG5lZWQgdG8gc2NhbGUgaW1hZ2VOb2RlLCBidXQgZG8gbm90IHdhbnQgaXRzIGZvY3VzIGhpZ2hsaWdodCB0byBzY2FsZS5cclxuICAgIGNvbnN0IHdyYXBwZWRJbWFnZU5vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyBpbWFnZU5vZGUgXVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggd3JhcHBlZEltYWdlTm9kZSApO1xyXG4gICAgdGhpcy5zZXRGb2N1c0hpZ2hsaWdodCggbmV3IEZvY3VzSGlnaGxpZ2h0RnJvbU5vZGUoIHdyYXBwZWRJbWFnZU5vZGUgKSApO1xyXG5cclxuICAgIGNvbnN0IHVwZGF0ZVNjYWxlID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBzY2VuZUJvdW5kcyA9IGh0bWxJbWFnZUVsZW1lbnRPYmplY3QuYm91bmRzUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIGNvbnN0IHZpZXdCb3VuZHMgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdCb3VuZHMoIHNjZW5lQm91bmRzICk7XHJcbiAgICAgIGNvbnN0IHNjYWxlWCA9ICggdmlld0JvdW5kcy53aWR0aCAvIGltYWdlTm9kZS53aWR0aCApIHx8IEdPQ29uc3RhbnRzLk1JTl9TQ0FMRTsgLy8gcHJldmVudCB6ZXJvIHNjYWxlXHJcbiAgICAgIGNvbnN0IHNjYWxlWSA9ICggdmlld0JvdW5kcy5oZWlnaHQgLyBpbWFnZU5vZGUuaGVpZ2h0ICkgfHwgR09Db25zdGFudHMuTUlOX1NDQUxFOyAvLyBwcmV2ZW50IHplcm8gc2NhbGVcclxuICAgICAgaW1hZ2VOb2RlLnNjYWxlKCBzY2FsZVgsIHNjYWxlWSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBDaGFuZ2UgdGhlIFBORyBpbWFnZS5cclxuICAgIGh0bWxJbWFnZUVsZW1lbnRPYmplY3QuaHRtbEltYWdlRWxlbWVudFByb3BlcnR5LmxpbmsoIGh0bWxJbWFnZUVsZW1lbnQgPT4ge1xyXG4gICAgICBpbWFnZU5vZGUuaW1hZ2UgPSBodG1sSW1hZ2VFbGVtZW50O1xyXG4gICAgICB1cGRhdGVTY2FsZSgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRyYW5zbGF0ZSBhbmQgc2NhbGVcclxuICAgIGh0bWxJbWFnZUVsZW1lbnRPYmplY3QuYm91bmRzUHJvcGVydHkubGluayggYm91bmRzID0+IHtcclxuICAgICAgdGhpcy50cmFuc2xhdGlvbiA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0JvdW5kcyggYm91bmRzICkubGVmdFRvcDtcclxuICAgICAgdXBkYXRlU2NhbGUoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBEcmFnIGJvdW5kcywgaW4gbW9kZWwgY29vcmRpbmF0ZXMuIEtlZXAgdGhlIGZ1bGwgb2JqZWN0IHdpdGhpbiB0aGUgbW9kZWwgYm91bmRzIGFuZCB0byB0aGUgbGVmdCBvZiB0aGUgb3B0aWMuXHJcbiAgICAvLyBVc2UgTWF0aC5mbG9vciBoZXJlaW4gdG8gYXZvaWQgZmxvYXRpbmctcG9pbnQgcm91bmRpbmcgZXJyb3JzIHRoYXQgcmVzdWx0IGluIHVud2FudGVkIGNoYW5nZXMgYW5kIGFkZGl0aW9uYWxcclxuICAgIC8vIHJlZW50cmFudCBQcm9wZXJ0aWVzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dlb21ldHJpYy1vcHRpY3MvaXNzdWVzLzMxNy5cclxuICAgIGNvbnN0IGRyYWdCb3VuZHNQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgaHRtbEltYWdlRWxlbWVudE9iamVjdC5ib3VuZHNQcm9wZXJ0eSwgc2NlbmVCb3VuZHNQcm9wZXJ0eSwgb2JqZWN0RHJhZ01vZGVQcm9wZXJ0eSBdLFxyXG4gICAgICAoIGh0bWxJbWFnZUVsZW1lbnRPYmplY3RCb3VuZHMsIHNjZW5lQm91bmRzLCBvYmplY3REcmFnTW9kZSApID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgaHRtbEltYWdlRWxlbWVudE9iamVjdFBvc2l0aW9uID0gaHRtbEltYWdlRWxlbWVudE9iamVjdC5wb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgIGNvbnN0IG1pblggPSBNYXRoLmZsb29yKCBzY2VuZUJvdW5kcy5taW5YICsgKCBodG1sSW1hZ2VFbGVtZW50T2JqZWN0UG9zaXRpb24ueCAtIGh0bWxJbWFnZUVsZW1lbnRPYmplY3RCb3VuZHMubWluWCApICk7XHJcbiAgICAgICAgY29uc3QgbWF4WCA9IE1hdGguZmxvb3IoIG9wdGljUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54IC0gR09Db25zdGFudHMuTUlOX0RJU1RBTkNFX0ZST01fT0JKRUNUX1RPX09QVElDICk7XHJcbiAgICAgICAgbGV0IG1pblk6IG51bWJlcjtcclxuICAgICAgICBsZXQgbWF4WTogbnVtYmVyO1xyXG5cclxuICAgICAgICBpZiAoIG9iamVjdERyYWdNb2RlID09PSAnZnJlZURyYWdnaW5nJyApIHtcclxuXHJcbiAgICAgICAgICAvLyBmcmVlIGRyYWdnaW5nXHJcbiAgICAgICAgICBtaW5ZID0gTWF0aC5mbG9vciggc2NlbmVCb3VuZHMubWluWSArICggaHRtbEltYWdlRWxlbWVudE9iamVjdFBvc2l0aW9uLnkgLSBodG1sSW1hZ2VFbGVtZW50T2JqZWN0Qm91bmRzLm1pblkgKSApO1xyXG4gICAgICAgICAgbWF4WSA9IE1hdGguZmxvb3IoIHNjZW5lQm91bmRzLm1heFkgLSAoIGh0bWxJbWFnZUVsZW1lbnRPYmplY3RCb3VuZHMubWF4WSAtIGh0bWxJbWFnZUVsZW1lbnRPYmplY3RQb3NpdGlvbi55ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gaG9yaXpvbnRhbCBkcmFnZ2luZywgbG9ja2VkIHRvIHRoZSBvYmplY3QncyBjdXJyZW50IHkgcG9zaXRpb25cclxuICAgICAgICAgIG1pblkgPSBodG1sSW1hZ2VFbGVtZW50T2JqZWN0UG9zaXRpb24ueTtcclxuICAgICAgICAgIG1heFkgPSBtaW5ZO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IEJvdW5kczIoIG1pblgsIG1pblksIG1heFgsIG1heFkgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIEtlZXAgdGhlIG9iamVjdCBpbnNpZGUgdGhlIGRyYWcgYm91bmRzLiBUaGlzIGlzIGRvbmUgaW4gdGhlIG5leHQgYW5pbWF0aW9uIGZyYW1lIHRvIHByZXZlbnQgcHJvYmxlbXMgd2l0aFxyXG4gICAgLy8gcmVlbnRyYW50IFByb3BlcnRpZXMsIGFzIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9nZW9tZXRyaWMtb3B0aWNzL2lzc3Vlcy8zMjUuICBkcmFnQm91bmRzUHJvcGVydHkgaXNcclxuICAgIC8vIGRlcml2ZWQgZnJvbSBodG1sSW1hZ2VFbGVtZW50T2JqZWN0LmJvdW5kc1Byb3BlcnR5LCBhbmQgd2lsbCBjaGFuZ2UgaHRtbEltYWdlRWxlbWVudE9iamVjdC5ib3VuZHNQcm9wZXJ0eSBieVxyXG4gICAgLy8gc2V0dGluZyBodG1sSW1hZ2VFbGVtZW50T2JqZWN0LnBvc2l0aW9uUHJvcGVydHkuXHJcbiAgICBkcmFnQm91bmRzUHJvcGVydHkubGluayggZHJhZ0JvdW5kcyA9PiB7XHJcbiAgICAgIGNvbnN0IGNsb3Nlc3RQb2ludCA9IGRyYWdCb3VuZHMuY2xvc2VzdFBvaW50VG8oIGh0bWxJbWFnZUVsZW1lbnRPYmplY3QucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICBpZiAoICFjbG9zZXN0UG9pbnQuZXF1YWxzKCBodG1sSW1hZ2VFbGVtZW50T2JqZWN0LnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKSApIHtcclxuICAgICAgICBzdGVwVGltZXIuc2V0VGltZW91dCggKCkgPT4ge1xyXG4gICAgICAgICAgaHRtbEltYWdlRWxlbWVudE9iamVjdC5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gY2xvc2VzdFBvaW50O1xyXG4gICAgICAgIH0sIDAgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGRyYWdMaXN0ZW5lciA9IG5ldyBEcmFnTGlzdGVuZXIoIHtcclxuICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogaHRtbEltYWdlRWxlbWVudE9iamVjdC5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHk6IGRyYWdCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgdHJhbnNmb3JtOiBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIHVzZVBhcmVudE9mZnNldDogdHJ1ZSxcclxuICAgICAgZHJhZzogKCkgPT4gdGhpcy5kcmFnKCksXHJcbiAgICAgIHRhbmRlbTogcHJvdmlkZWRPcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkcmFnTGlzdGVuZXInIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggZHJhZ0xpc3RlbmVyICk7XHJcblxyXG4gICAgY29uc3Qga2V5Ym9hcmREcmFnTGlzdGVuZXIgPSBuZXcgS2V5Ym9hcmREcmFnTGlzdGVuZXIoXHJcbiAgICAgIGNvbWJpbmVPcHRpb25zPEtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9ucz4oIHt9LCBHT0NvbnN0YW50cy5LRVlCT0FSRF9EUkFHX0xJU1RFTkVSX09QVElPTlMsIHtcclxuICAgICAgICBwb3NpdGlvblByb3BlcnR5OiBodG1sSW1hZ2VFbGVtZW50T2JqZWN0LnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiBkcmFnQm91bmRzUHJvcGVydHksXHJcbiAgICAgICAgdHJhbnNmb3JtOiBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgICAgZHJhZzogKCkgPT4gdGhpcy5kcmFnKCksXHJcbiAgICAgICAgdGFuZGVtOiBwcm92aWRlZE9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2tleWJvYXJkRHJhZ0xpc3RlbmVyJyApXHJcbiAgICAgIH0gKSApO1xyXG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCBrZXlib2FyZERyYWdMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIEtlZXAgY3VlaW5nIGFycm93cyBuZXh0IHRvIHRoZSBmcmFtZWQgb2JqZWN0LlxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyB3cmFwcGVkSW1hZ2VOb2RlLmJvdW5kc1Byb3BlcnR5LCB0aGlzLmN1ZWluZ0Fycm93c05vZGUuYm91bmRzUHJvcGVydHkgXSxcclxuICAgICAgKCB3cmFwcGVkSW1hZ2VOb2RlQm91bmRzOiBCb3VuZHMyLCBjdWVpbmdBcnJvd3NOb2RlQm91bmRzOiBCb3VuZHMyICkgPT4ge1xyXG4gICAgICAgIHRoaXMuY3VlaW5nQXJyb3dzTm9kZS5yaWdodCA9IHdyYXBwZWRJbWFnZU5vZGUubGVmdCAtIDU7XHJcbiAgICAgICAgdGhpcy5jdWVpbmdBcnJvd3NOb2RlLmNlbnRlclkgPSB3cmFwcGVkSW1hZ2VOb2RlLmNlbnRlclk7XHJcbiAgICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmdlb21ldHJpY09wdGljcy5yZWdpc3RlciggJ0hUTUxJbWFnZUVsZW1lbnRPYmplY3ROb2RlJywgSFRNTEltYWdlRWxlbWVudE9iamVjdE5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUVuRCxTQUFTQyxZQUFZLEVBQUVDLHNCQUFzQixFQUFFQyxLQUFLLEVBQUVDLG9CQUFvQixFQUErQkMsSUFBSSxRQUFRLG1DQUFtQztBQUN4SixPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBR3RELE9BQU9DLFdBQVcsTUFBTSxtQkFBbUI7QUFDM0MsU0FBU0MsY0FBYyxRQUFRLHVDQUF1QztBQUd0RSxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBRXhELE9BQU9DLGlCQUFpQixNQUFvQyx3QkFBd0I7QUFDcEYsT0FBT0MsU0FBUyxNQUFNLGtDQUFrQztBQUl4RCxlQUFlLE1BQU1DLDBCQUEwQixTQUFTRixpQkFBaUIsQ0FBQztFQUV4RTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU0csV0FBV0EsQ0FBRUMsc0JBQThDLEVBQzlDQyxtQkFBK0MsRUFDL0NDLHFCQUFpRCxFQUNqREMsa0JBQXVDLEVBQ3ZDQyxzQkFBeUQsRUFDekRDLGtCQUFzQyxFQUN0Q0MsZUFBa0QsRUFBRztJQUV2RSxLQUFLLENBQUVOLHNCQUFzQixFQUFFSSxzQkFBc0IsRUFBRUMsa0JBQWtCLEVBQUVDLGVBQWdCLENBQUM7SUFFNUYsTUFBTUMsU0FBUyxHQUFHLElBQUlsQixLQUFLLENBQUVXLHNCQUFzQixDQUFDUSx3QkFBd0IsQ0FBQ0MsS0FBTSxDQUFDOztJQUVwRjtJQUNBLE1BQU1DLGdCQUFnQixH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