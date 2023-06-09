// Copyright 2018-2022, University of Colorado Boulder

/**
 * Scene for the beaker representation
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../../phet-core/js/merge.js';
import FractionsCommonColors from '../../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../../fractionsCommon.js';
import CellSceneNode from '../CellSceneNode.js';
import BeakerContainerNode from './BeakerContainerNode.js';
import BeakerPieceNode from './BeakerPieceNode.js';
import FractionsCommonBeakerNode from './FractionsCommonBeakerNode.js';
class BeakerSceneNode extends CellSceneNode {
  /**
   * @param {ContainerSetScreenView} model
   * @param {Object} [options]
   */
  constructor(model, options) {
    super(model, merge({
      createContainerNode(container, options) {
        return new BeakerContainerNode(container, options);
      },
      createPieceNode(piece, finishedAnimatingCallback, droppedCallback) {
        return new BeakerPieceNode(piece, finishedAnimatingCallback, droppedCallback);
      },
      createCellNode(denominator, index, options) {
        return new FractionsCommonBeakerNode(1, denominator, options);
      }
    }, options));
  }

  /**
   * Returns the icon node to be used for this representation.
   * @public
   *
   * @param {boolean} [useEqualityLabColor]
   * @returns {Node}
   */
  static getIcon(useEqualityLabColor) {
    return new FractionsCommonBeakerNode(1, 1, {
      beakerWidth: 30,
      beakerHeight: 55,
      yRadiusOfEnds: 4.5,
      solutionFill: useEqualityLabColor ? FractionsCommonColors.equalityLabWaterProperty : FractionsCommonColors.waterProperty
    });
  }
}
fractionsCommon.register('BeakerSceneNode', BeakerSceneNode);
export default BeakerSceneNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkZyYWN0aW9uc0NvbW1vbkNvbG9ycyIsImZyYWN0aW9uc0NvbW1vbiIsIkNlbGxTY2VuZU5vZGUiLCJCZWFrZXJDb250YWluZXJOb2RlIiwiQmVha2VyUGllY2VOb2RlIiwiRnJhY3Rpb25zQ29tbW9uQmVha2VyTm9kZSIsIkJlYWtlclNjZW5lTm9kZSIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJvcHRpb25zIiwiY3JlYXRlQ29udGFpbmVyTm9kZSIsImNvbnRhaW5lciIsImNyZWF0ZVBpZWNlTm9kZSIsInBpZWNlIiwiZmluaXNoZWRBbmltYXRpbmdDYWxsYmFjayIsImRyb3BwZWRDYWxsYmFjayIsImNyZWF0ZUNlbGxOb2RlIiwiZGVub21pbmF0b3IiLCJpbmRleCIsImdldEljb24iLCJ1c2VFcXVhbGl0eUxhYkNvbG9yIiwiYmVha2VyV2lkdGgiLCJiZWFrZXJIZWlnaHQiLCJ5UmFkaXVzT2ZFbmRzIiwic29sdXRpb25GaWxsIiwiZXF1YWxpdHlMYWJXYXRlclByb3BlcnR5Iiwid2F0ZXJQcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmVha2VyU2NlbmVOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNjZW5lIGZvciB0aGUgYmVha2VyIHJlcHJlc2VudGF0aW9uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vbkNvbG9ycyBmcm9tICcuLi8uLi8uLi9jb21tb24vdmlldy9GcmFjdGlvbnNDb21tb25Db2xvcnMuanMnO1xyXG5pbXBvcnQgZnJhY3Rpb25zQ29tbW9uIGZyb20gJy4uLy4uLy4uL2ZyYWN0aW9uc0NvbW1vbi5qcyc7XHJcbmltcG9ydCBDZWxsU2NlbmVOb2RlIGZyb20gJy4uL0NlbGxTY2VuZU5vZGUuanMnO1xyXG5pbXBvcnQgQmVha2VyQ29udGFpbmVyTm9kZSBmcm9tICcuL0JlYWtlckNvbnRhaW5lck5vZGUuanMnO1xyXG5pbXBvcnQgQmVha2VyUGllY2VOb2RlIGZyb20gJy4vQmVha2VyUGllY2VOb2RlLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vbkJlYWtlck5vZGUgZnJvbSAnLi9GcmFjdGlvbnNDb21tb25CZWFrZXJOb2RlLmpzJztcclxuXHJcbmNsYXNzIEJlYWtlclNjZW5lTm9kZSBleHRlbmRzIENlbGxTY2VuZU5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Q29udGFpbmVyU2V0U2NyZWVuVmlld30gbW9kZWxcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCBvcHRpb25zICkge1xyXG4gICAgc3VwZXIoIG1vZGVsLCBtZXJnZSgge1xyXG4gICAgICBjcmVhdGVDb250YWluZXJOb2RlKCBjb250YWluZXIsIG9wdGlvbnMgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFrZXJDb250YWluZXJOb2RlKCBjb250YWluZXIsIG9wdGlvbnMgKTtcclxuICAgICAgfSxcclxuICAgICAgY3JlYXRlUGllY2VOb2RlKCBwaWVjZSwgZmluaXNoZWRBbmltYXRpbmdDYWxsYmFjaywgZHJvcHBlZENhbGxiYWNrICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgQmVha2VyUGllY2VOb2RlKCBwaWVjZSwgZmluaXNoZWRBbmltYXRpbmdDYWxsYmFjaywgZHJvcHBlZENhbGxiYWNrICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGNyZWF0ZUNlbGxOb2RlKCBkZW5vbWluYXRvciwgaW5kZXgsIG9wdGlvbnMgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbnNDb21tb25CZWFrZXJOb2RlKCAxLCBkZW5vbWluYXRvciwgb3B0aW9ucyApO1xyXG4gICAgICB9XHJcbiAgICB9LCBvcHRpb25zICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGljb24gbm9kZSB0byBiZSB1c2VkIGZvciB0aGlzIHJlcHJlc2VudGF0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3VzZUVxdWFsaXR5TGFiQ29sb3JdXHJcbiAgICogQHJldHVybnMge05vZGV9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldEljb24oIHVzZUVxdWFsaXR5TGFiQ29sb3IgKSB7XHJcbiAgICByZXR1cm4gbmV3IEZyYWN0aW9uc0NvbW1vbkJlYWtlck5vZGUoIDEsIDEsIHtcclxuICAgICAgYmVha2VyV2lkdGg6IDMwLFxyXG4gICAgICBiZWFrZXJIZWlnaHQ6IDU1LFxyXG4gICAgICB5UmFkaXVzT2ZFbmRzOiA0LjUsXHJcbiAgICAgIHNvbHV0aW9uRmlsbDogdXNlRXF1YWxpdHlMYWJDb2xvciA/IEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5lcXVhbGl0eUxhYldhdGVyUHJvcGVydHkgOiBGcmFjdGlvbnNDb21tb25Db2xvcnMud2F0ZXJQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZnJhY3Rpb25zQ29tbW9uLnJlZ2lzdGVyKCAnQmVha2VyU2NlbmVOb2RlJywgQmVha2VyU2NlbmVOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEJlYWtlclNjZW5lTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLHNDQUFzQztBQUN4RCxPQUFPQyxxQkFBcUIsTUFBTSwrQ0FBK0M7QUFDakYsT0FBT0MsZUFBZSxNQUFNLDZCQUE2QjtBQUN6RCxPQUFPQyxhQUFhLE1BQU0scUJBQXFCO0FBQy9DLE9BQU9DLG1CQUFtQixNQUFNLDBCQUEwQjtBQUMxRCxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBQ2xELE9BQU9DLHlCQUF5QixNQUFNLGdDQUFnQztBQUV0RSxNQUFNQyxlQUFlLFNBQVNKLGFBQWEsQ0FBQztFQUMxQztBQUNGO0FBQ0E7QUFDQTtFQUNFSyxXQUFXQSxDQUFFQyxLQUFLLEVBQUVDLE9BQU8sRUFBRztJQUM1QixLQUFLLENBQUVELEtBQUssRUFBRVQsS0FBSyxDQUFFO01BQ25CVyxtQkFBbUJBLENBQUVDLFNBQVMsRUFBRUYsT0FBTyxFQUFHO1FBQ3hDLE9BQU8sSUFBSU4sbUJBQW1CLENBQUVRLFNBQVMsRUFBRUYsT0FBUSxDQUFDO01BQ3RELENBQUM7TUFDREcsZUFBZUEsQ0FBRUMsS0FBSyxFQUFFQyx5QkFBeUIsRUFBRUMsZUFBZSxFQUFHO1FBQ25FLE9BQU8sSUFBSVgsZUFBZSxDQUFFUyxLQUFLLEVBQUVDLHlCQUF5QixFQUFFQyxlQUFnQixDQUFDO01BQ2pGLENBQUM7TUFDREMsY0FBY0EsQ0FBRUMsV0FBVyxFQUFFQyxLQUFLLEVBQUVULE9BQU8sRUFBRztRQUM1QyxPQUFPLElBQUlKLHlCQUF5QixDQUFFLENBQUMsRUFBRVksV0FBVyxFQUFFUixPQUFRLENBQUM7TUFDakU7SUFDRixDQUFDLEVBQUVBLE9BQVEsQ0FBRSxDQUFDO0VBQ2hCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsT0FBT1UsT0FBT0EsQ0FBRUMsbUJBQW1CLEVBQUc7SUFDcEMsT0FBTyxJQUFJZix5QkFBeUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO01BQzFDZ0IsV0FBVyxFQUFFLEVBQUU7TUFDZkMsWUFBWSxFQUFFLEVBQUU7TUFDaEJDLGFBQWEsRUFBRSxHQUFHO01BQ2xCQyxZQUFZLEVBQUVKLG1CQUFtQixHQUFHcEIscUJBQXFCLENBQUN5Qix3QkFBd0IsR0FBR3pCLHFCQUFxQixDQUFDMEI7SUFDN0csQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBekIsZUFBZSxDQUFDMEIsUUFBUSxDQUFFLGlCQUFpQixFQUFFckIsZUFBZ0IsQ0FBQztBQUM5RCxlQUFlQSxlQUFlIn0=