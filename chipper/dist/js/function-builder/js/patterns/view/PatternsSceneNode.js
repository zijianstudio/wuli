// Copyright 2015-2023, University of Colorado Boulder

/**
 * Displays a scene in the 'Patterns' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ImageCard from '../../common/model/cards/ImageCard.js';
import ImageCardNode from '../../common/view/cards/ImageCardNode.js';
import CardContainer from '../../common/view/containers/CardContainer.js';
import ImageFunctionNode from '../../common/view/functions/ImageFunctionNode.js';
import SceneNode from '../../common/view/SceneNode.js';
import functionBuilder from '../../functionBuilder.js';
export default class PatternsSceneNode extends SceneNode {
  /**
   * @param {PatternsScene} scene - model for this scene
   * @param {Bounds2} layoutBounds - layoutBounds of the parent ScreenView
   * @param {Object} [options]
   */
  constructor(scene, layoutBounds, options) {
    options = options || {};
    options.seeInsideIconType = 'image'; // see FBIconFactory.createSeeInsideIcon

    super(scene, layoutBounds, ImageFunctionNode, options);
  }

  /**
   * Creates the card containers that go in the input and output carousels.
   *
   * @param {Scene} scene
   * @param {Object} [containerOptions] - see CardContainer options
   * @returns {CarouselItem[]}
   * @protected
   * @override
   */
  createCardCarouselItems(scene, containerOptions) {
    const containers = [];
    scene.cardContent.forEach(cardImage => {
      containers.push({
        createNode: tandem => new CardContainer(ImageCard, ImageCardNode, cardImage, containerOptions)
      });
    });
    return containers;
  }
}
functionBuilder.register('PatternsSceneNode', PatternsSceneNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbWFnZUNhcmQiLCJJbWFnZUNhcmROb2RlIiwiQ2FyZENvbnRhaW5lciIsIkltYWdlRnVuY3Rpb25Ob2RlIiwiU2NlbmVOb2RlIiwiZnVuY3Rpb25CdWlsZGVyIiwiUGF0dGVybnNTY2VuZU5vZGUiLCJjb25zdHJ1Y3RvciIsInNjZW5lIiwibGF5b3V0Qm91bmRzIiwib3B0aW9ucyIsInNlZUluc2lkZUljb25UeXBlIiwiY3JlYXRlQ2FyZENhcm91c2VsSXRlbXMiLCJjb250YWluZXJPcHRpb25zIiwiY29udGFpbmVycyIsImNhcmRDb250ZW50IiwiZm9yRWFjaCIsImNhcmRJbWFnZSIsInB1c2giLCJjcmVhdGVOb2RlIiwidGFuZGVtIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQYXR0ZXJuc1NjZW5lTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEaXNwbGF5cyBhIHNjZW5lIGluIHRoZSAnUGF0dGVybnMnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgSW1hZ2VDYXJkIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9jYXJkcy9JbWFnZUNhcmQuanMnO1xyXG5pbXBvcnQgSW1hZ2VDYXJkTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9jYXJkcy9JbWFnZUNhcmROb2RlLmpzJztcclxuaW1wb3J0IENhcmRDb250YWluZXIgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvY29udGFpbmVycy9DYXJkQ29udGFpbmVyLmpzJztcclxuaW1wb3J0IEltYWdlRnVuY3Rpb25Ob2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L2Z1bmN0aW9ucy9JbWFnZUZ1bmN0aW9uTm9kZS5qcyc7XHJcbmltcG9ydCBTY2VuZU5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU2NlbmVOb2RlLmpzJztcclxuaW1wb3J0IGZ1bmN0aW9uQnVpbGRlciBmcm9tICcuLi8uLi9mdW5jdGlvbkJ1aWxkZXIuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGF0dGVybnNTY2VuZU5vZGUgZXh0ZW5kcyBTY2VuZU5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1BhdHRlcm5zU2NlbmV9IHNjZW5lIC0gbW9kZWwgZm9yIHRoaXMgc2NlbmVcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGxheW91dEJvdW5kcyAtIGxheW91dEJvdW5kcyBvZiB0aGUgcGFyZW50IFNjcmVlblZpZXdcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHNjZW5lLCBsYXlvdXRCb3VuZHMsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcbiAgICBvcHRpb25zLnNlZUluc2lkZUljb25UeXBlID0gJ2ltYWdlJzsgLy8gc2VlIEZCSWNvbkZhY3RvcnkuY3JlYXRlU2VlSW5zaWRlSWNvblxyXG5cclxuICAgIHN1cGVyKCBzY2VuZSwgbGF5b3V0Qm91bmRzLCBJbWFnZUZ1bmN0aW9uTm9kZSwgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgY2FyZCBjb250YWluZXJzIHRoYXQgZ28gaW4gdGhlIGlucHV0IGFuZCBvdXRwdXQgY2Fyb3VzZWxzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTY2VuZX0gc2NlbmVcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW2NvbnRhaW5lck9wdGlvbnNdIC0gc2VlIENhcmRDb250YWluZXIgb3B0aW9uc1xyXG4gICAqIEByZXR1cm5zIHtDYXJvdXNlbEl0ZW1bXX1cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgY3JlYXRlQ2FyZENhcm91c2VsSXRlbXMoIHNjZW5lLCBjb250YWluZXJPcHRpb25zICkge1xyXG4gICAgY29uc3QgY29udGFpbmVycyA9IFtdO1xyXG4gICAgc2NlbmUuY2FyZENvbnRlbnQuZm9yRWFjaCggY2FyZEltYWdlID0+IHtcclxuICAgICAgY29udGFpbmVycy5wdXNoKCB7IGNyZWF0ZU5vZGU6IHRhbmRlbSA9PiBuZXcgQ2FyZENvbnRhaW5lciggSW1hZ2VDYXJkLCBJbWFnZUNhcmROb2RlLCBjYXJkSW1hZ2UsIGNvbnRhaW5lck9wdGlvbnMgKSB9ICk7XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gY29udGFpbmVycztcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uQnVpbGRlci5yZWdpc3RlciggJ1BhdHRlcm5zU2NlbmVOb2RlJywgUGF0dGVybnNTY2VuZU5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLHVDQUF1QztBQUM3RCxPQUFPQyxhQUFhLE1BQU0sMENBQTBDO0FBQ3BFLE9BQU9DLGFBQWEsTUFBTSwrQ0FBK0M7QUFDekUsT0FBT0MsaUJBQWlCLE1BQU0sa0RBQWtEO0FBQ2hGLE9BQU9DLFNBQVMsTUFBTSxnQ0FBZ0M7QUFDdEQsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUV0RCxlQUFlLE1BQU1DLGlCQUFpQixTQUFTRixTQUFTLENBQUM7RUFFdkQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxLQUFLLEVBQUVDLFlBQVksRUFBRUMsT0FBTyxFQUFHO0lBRTFDQSxPQUFPLEdBQUdBLE9BQU8sSUFBSSxDQUFDLENBQUM7SUFDdkJBLE9BQU8sQ0FBQ0MsaUJBQWlCLEdBQUcsT0FBTyxDQUFDLENBQUM7O0lBRXJDLEtBQUssQ0FBRUgsS0FBSyxFQUFFQyxZQUFZLEVBQUVOLGlCQUFpQixFQUFFTyxPQUFRLENBQUM7RUFDMUQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLHVCQUF1QkEsQ0FBRUosS0FBSyxFQUFFSyxnQkFBZ0IsRUFBRztJQUNqRCxNQUFNQyxVQUFVLEdBQUcsRUFBRTtJQUNyQk4sS0FBSyxDQUFDTyxXQUFXLENBQUNDLE9BQU8sQ0FBRUMsU0FBUyxJQUFJO01BQ3RDSCxVQUFVLENBQUNJLElBQUksQ0FBRTtRQUFFQyxVQUFVLEVBQUVDLE1BQU0sSUFBSSxJQUFJbEIsYUFBYSxDQUFFRixTQUFTLEVBQUVDLGFBQWEsRUFBRWdCLFNBQVMsRUFBRUosZ0JBQWlCO01BQUUsQ0FBRSxDQUFDO0lBQ3pILENBQUUsQ0FBQztJQUNILE9BQU9DLFVBQVU7RUFDbkI7QUFDRjtBQUVBVCxlQUFlLENBQUNnQixRQUFRLENBQUUsbUJBQW1CLEVBQUVmLGlCQUFrQixDQUFDIn0=