// Copyright 2013-2021, University of Colorado Boulder

/**
 * Class that depicts a vector that has an origin as well as x and y components,
 * and that monitors the vector and updates the representation when changes
 * occur.
 *
 * NOTE: This only works with downward pointing vectors, which is what was
 * needed for Balancing Act.  This would need to be generalized to support
 * vectors pointing in other directions.
 *
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Node } from '../../../../scenery/js/imports.js';
import balancingAct from '../../balancingAct.js';
class PositionedVectorNode extends Node {
  /**
   * @param positionedVectorProperty
   * @param visibilityProperty
   * @param scalingFactor
   * @param modelViewTransform
   * @param {Object} [options]
   */
  constructor(positionedVectorProperty, scalingFactor, visibilityProperty, modelViewTransform, options) {
    super();
    options = merge({
      fill: 'white',
      stroke: 'black',
      lineWidth: 1,
      headHeight: 8,
      headWidth: 12,
      tailWidth: 5
    }, options);

    // Create the vector node and add it as a child.
    const length = positionedVectorProperty.value.vector.magnitude * scalingFactor;
    this.addChild(new ArrowNode(0, 0, 0, length, options));
    positionedVectorProperty.link(positionedVector => {
      this.centerX = modelViewTransform.modelToViewX(positionedVector.origin.x);
      this.top = modelViewTransform.modelToViewY(positionedVector.origin.y);
    });
    visibilityProperty.link(visible => {
      this.visible = visible;
    });
  }
}
balancingAct.register('PositionedVectorNode', PositionedVectorNode);
export default PositionedVectorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkFycm93Tm9kZSIsIk5vZGUiLCJiYWxhbmNpbmdBY3QiLCJQb3NpdGlvbmVkVmVjdG9yTm9kZSIsImNvbnN0cnVjdG9yIiwicG9zaXRpb25lZFZlY3RvclByb3BlcnR5Iiwic2NhbGluZ0ZhY3RvciIsInZpc2liaWxpdHlQcm9wZXJ0eSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsIm9wdGlvbnMiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwiaGVhZEhlaWdodCIsImhlYWRXaWR0aCIsInRhaWxXaWR0aCIsImxlbmd0aCIsInZhbHVlIiwidmVjdG9yIiwibWFnbml0dWRlIiwiYWRkQ2hpbGQiLCJsaW5rIiwicG9zaXRpb25lZFZlY3RvciIsImNlbnRlclgiLCJtb2RlbFRvVmlld1giLCJvcmlnaW4iLCJ4IiwidG9wIiwibW9kZWxUb1ZpZXdZIiwieSIsInZpc2libGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBvc2l0aW9uZWRWZWN0b3JOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENsYXNzIHRoYXQgZGVwaWN0cyBhIHZlY3RvciB0aGF0IGhhcyBhbiBvcmlnaW4gYXMgd2VsbCBhcyB4IGFuZCB5IGNvbXBvbmVudHMsXHJcbiAqIGFuZCB0aGF0IG1vbml0b3JzIHRoZSB2ZWN0b3IgYW5kIHVwZGF0ZXMgdGhlIHJlcHJlc2VudGF0aW9uIHdoZW4gY2hhbmdlc1xyXG4gKiBvY2N1ci5cclxuICpcclxuICogTk9URTogVGhpcyBvbmx5IHdvcmtzIHdpdGggZG93bndhcmQgcG9pbnRpbmcgdmVjdG9ycywgd2hpY2ggaXMgd2hhdCB3YXNcclxuICogbmVlZGVkIGZvciBCYWxhbmNpbmcgQWN0LiAgVGhpcyB3b3VsZCBuZWVkIHRvIGJlIGdlbmVyYWxpemVkIHRvIHN1cHBvcnRcclxuICogdmVjdG9ycyBwb2ludGluZyBpbiBvdGhlciBkaXJlY3Rpb25zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgYmFsYW5jaW5nQWN0IGZyb20gJy4uLy4uL2JhbGFuY2luZ0FjdC5qcyc7XHJcblxyXG5jbGFzcyBQb3NpdGlvbmVkVmVjdG9yTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gcG9zaXRpb25lZFZlY3RvclByb3BlcnR5XHJcbiAgICogQHBhcmFtIHZpc2liaWxpdHlQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSBzY2FsaW5nRmFjdG9yXHJcbiAgICogQHBhcmFtIG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcG9zaXRpb25lZFZlY3RvclByb3BlcnR5LCBzY2FsaW5nRmFjdG9yLCB2aXNpYmlsaXR5UHJvcGVydHksIG1vZGVsVmlld1RyYW5zZm9ybSwgb3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKFxyXG4gICAgICB7XHJcbiAgICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgICAgbGluZVdpZHRoOiAxLFxyXG4gICAgICAgIGhlYWRIZWlnaHQ6IDgsXHJcbiAgICAgICAgaGVhZFdpZHRoOiAxMixcclxuICAgICAgICB0YWlsV2lkdGg6IDVcclxuICAgICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgdmVjdG9yIG5vZGUgYW5kIGFkZCBpdCBhcyBhIGNoaWxkLlxyXG4gICAgY29uc3QgbGVuZ3RoID0gcG9zaXRpb25lZFZlY3RvclByb3BlcnR5LnZhbHVlLnZlY3Rvci5tYWduaXR1ZGUgKiBzY2FsaW5nRmFjdG9yO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IEFycm93Tm9kZSggMCwgMCwgMCwgbGVuZ3RoLCBvcHRpb25zICkgKTtcclxuXHJcbiAgICBwb3NpdGlvbmVkVmVjdG9yUHJvcGVydHkubGluayggcG9zaXRpb25lZFZlY3RvciA9PiB7XHJcbiAgICAgIHRoaXMuY2VudGVyWCA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIHBvc2l0aW9uZWRWZWN0b3Iub3JpZ2luLnggKTtcclxuICAgICAgdGhpcy50b3AgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBwb3NpdGlvbmVkVmVjdG9yLm9yaWdpbi55ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdmlzaWJpbGl0eVByb3BlcnR5LmxpbmsoIHZpc2libGUgPT4ge1xyXG4gICAgICB0aGlzLnZpc2libGUgPSB2aXNpYmxlO1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuYmFsYW5jaW5nQWN0LnJlZ2lzdGVyKCAnUG9zaXRpb25lZFZlY3Rvck5vZGUnLCBQb3NpdGlvbmVkVmVjdG9yTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUG9zaXRpb25lZFZlY3Rvck5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQUNoRSxTQUFTQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFFaEQsTUFBTUMsb0JBQW9CLFNBQVNGLElBQUksQ0FBQztFQUV0QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyx3QkFBd0IsRUFBRUMsYUFBYSxFQUFFQyxrQkFBa0IsRUFBRUMsa0JBQWtCLEVBQUVDLE9BQU8sRUFBRztJQUN0RyxLQUFLLENBQUMsQ0FBQztJQUVQQSxPQUFPLEdBQUdWLEtBQUssQ0FDYjtNQUNFVyxJQUFJLEVBQUUsT0FBTztNQUNiQyxNQUFNLEVBQUUsT0FBTztNQUNmQyxTQUFTLEVBQUUsQ0FBQztNQUNaQyxVQUFVLEVBQUUsQ0FBQztNQUNiQyxTQUFTLEVBQUUsRUFBRTtNQUNiQyxTQUFTLEVBQUU7SUFDYixDQUFDLEVBQUVOLE9BQVEsQ0FBQzs7SUFFZDtJQUNBLE1BQU1PLE1BQU0sR0FBR1gsd0JBQXdCLENBQUNZLEtBQUssQ0FBQ0MsTUFBTSxDQUFDQyxTQUFTLEdBQUdiLGFBQWE7SUFDOUUsSUFBSSxDQUFDYyxRQUFRLENBQUUsSUFBSXBCLFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRWdCLE1BQU0sRUFBRVAsT0FBUSxDQUFFLENBQUM7SUFFMURKLHdCQUF3QixDQUFDZ0IsSUFBSSxDQUFFQyxnQkFBZ0IsSUFBSTtNQUNqRCxJQUFJLENBQUNDLE9BQU8sR0FBR2Ysa0JBQWtCLENBQUNnQixZQUFZLENBQUVGLGdCQUFnQixDQUFDRyxNQUFNLENBQUNDLENBQUUsQ0FBQztNQUMzRSxJQUFJLENBQUNDLEdBQUcsR0FBR25CLGtCQUFrQixDQUFDb0IsWUFBWSxDQUFFTixnQkFBZ0IsQ0FBQ0csTUFBTSxDQUFDSSxDQUFFLENBQUM7SUFDekUsQ0FBRSxDQUFDO0lBRUh0QixrQkFBa0IsQ0FBQ2MsSUFBSSxDQUFFUyxPQUFPLElBQUk7TUFDbEMsSUFBSSxDQUFDQSxPQUFPLEdBQUdBLE9BQU87SUFDeEIsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBNUIsWUFBWSxDQUFDNkIsUUFBUSxDQUFFLHNCQUFzQixFQUFFNUIsb0JBQXFCLENBQUM7QUFFckUsZUFBZUEsb0JBQW9CIn0=