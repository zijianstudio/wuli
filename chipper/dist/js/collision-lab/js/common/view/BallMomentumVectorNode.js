// Copyright 2019-2022, University of Colorado Boulder

/**
 * BallMomentumVectorNode is a BallVectorNode subtype for a single Ball's momentum vector. They appear in all screens
 * of the 'Collision Lab' simulation when the 'Momentum' checkbox is checked.
 *
 * Currently, it adds no additional Properties to the super-class, but is provided for symmetry in the view hierarchy.
 * Like its super-class, BallMomentumVectorNode persists for the lifetime of the simulation and are never disposed.
 * See BallNode.js for more background.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import BallVectorNode from './BallVectorNode.js';

// constants
const MOMENTUM_VECTOR_HEAD_DILATION_SCALE = 1.4; // See https://github.com/phetsims/collision-lab/issues/130.
const MOMENTUM_VECTOR_TAIL_DILATION_SCALE = 1.8; // See https://github.com/phetsims/collision-lab/issues/130.

class BallMomentumVectorNode extends BallVectorNode {
  /**
   * @param {Property.<Vector2>} ballPositionProperty - the position of the Ball, in meters.
   * @param {ReadOnlyProperty.<Vector2>} momentumProperty - the momentum of the Ball, in kg*(m/s).
   * @param {Property.<boolean>} momentumVectorVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor(ballPositionProperty, momentumProperty, momentumVectorVisibleProperty, modelViewTransform, options) {
    assert && AssertUtils.assertPropertyOf(ballPositionProperty, Vector2);
    assert && AssertUtils.assertAbstractPropertyOf(momentumProperty, Vector2);
    assert && AssertUtils.assertPropertyOf(momentumVectorVisibleProperty, 'boolean');
    assert && assert(modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}`);
    options = merge({
      // super-class options
      arrowOptions: {
        fill: CollisionLabColors.MOMENTUM_VECTOR_FILL,
        stroke: CollisionLabColors.MOMENTUM_VECTOR_STROKE,
        headWidth: CollisionLabConstants.ARROW_OPTIONS.headWidth * MOMENTUM_VECTOR_HEAD_DILATION_SCALE,
        headHeight: CollisionLabConstants.ARROW_OPTIONS.headHeight * MOMENTUM_VECTOR_HEAD_DILATION_SCALE,
        tailWidth: CollisionLabConstants.ARROW_OPTIONS.tailWidth * MOMENTUM_VECTOR_TAIL_DILATION_SCALE
      }
    }, options);

    //----------------------------------------------------------------------------------------

    super(ballPositionProperty, momentumProperty, momentumVectorVisibleProperty, modelViewTransform, options);
  }
}
collisionLab.register('BallMomentumVectorNode', BallMomentumVectorNode);
export default BallMomentumVectorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwibWVyZ2UiLCJBc3NlcnRVdGlscyIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJjb2xsaXNpb25MYWIiLCJDb2xsaXNpb25MYWJDb2xvcnMiLCJDb2xsaXNpb25MYWJDb25zdGFudHMiLCJCYWxsVmVjdG9yTm9kZSIsIk1PTUVOVFVNX1ZFQ1RPUl9IRUFEX0RJTEFUSU9OX1NDQUxFIiwiTU9NRU5UVU1fVkVDVE9SX1RBSUxfRElMQVRJT05fU0NBTEUiLCJCYWxsTW9tZW50dW1WZWN0b3JOb2RlIiwiY29uc3RydWN0b3IiLCJiYWxsUG9zaXRpb25Qcm9wZXJ0eSIsIm1vbWVudHVtUHJvcGVydHkiLCJtb21lbnR1bVZlY3RvclZpc2libGVQcm9wZXJ0eSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJhc3NlcnRQcm9wZXJ0eU9mIiwiYXNzZXJ0QWJzdHJhY3RQcm9wZXJ0eU9mIiwiYXJyb3dPcHRpb25zIiwiZmlsbCIsIk1PTUVOVFVNX1ZFQ1RPUl9GSUxMIiwic3Ryb2tlIiwiTU9NRU5UVU1fVkVDVE9SX1NUUk9LRSIsImhlYWRXaWR0aCIsIkFSUk9XX09QVElPTlMiLCJoZWFkSGVpZ2h0IiwidGFpbFdpZHRoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYWxsTW9tZW50dW1WZWN0b3JOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhbGxNb21lbnR1bVZlY3Rvck5vZGUgaXMgYSBCYWxsVmVjdG9yTm9kZSBzdWJ0eXBlIGZvciBhIHNpbmdsZSBCYWxsJ3MgbW9tZW50dW0gdmVjdG9yLiBUaGV5IGFwcGVhciBpbiBhbGwgc2NyZWVuc1xyXG4gKiBvZiB0aGUgJ0NvbGxpc2lvbiBMYWInIHNpbXVsYXRpb24gd2hlbiB0aGUgJ01vbWVudHVtJyBjaGVja2JveCBpcyBjaGVja2VkLlxyXG4gKlxyXG4gKiBDdXJyZW50bHksIGl0IGFkZHMgbm8gYWRkaXRpb25hbCBQcm9wZXJ0aWVzIHRvIHRoZSBzdXBlci1jbGFzcywgYnV0IGlzIHByb3ZpZGVkIGZvciBzeW1tZXRyeSBpbiB0aGUgdmlldyBoaWVyYXJjaHkuXHJcbiAqIExpa2UgaXRzIHN1cGVyLWNsYXNzLCBCYWxsTW9tZW50dW1WZWN0b3JOb2RlIHBlcnNpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbXVsYXRpb24gYW5kIGFyZSBuZXZlciBkaXNwb3NlZC5cclxuICogU2VlIEJhbGxOb2RlLmpzIGZvciBtb3JlIGJhY2tncm91bmQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgQXNzZXJ0VXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9Bc3NlcnRVdGlscy5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IGNvbGxpc2lvbkxhYiBmcm9tICcuLi8uLi9jb2xsaXNpb25MYWIuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGFiQ29sb3JzIGZyb20gJy4uL0NvbGxpc2lvbkxhYkNvbG9ycy5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJDb25zdGFudHMgZnJvbSAnLi4vQ29sbGlzaW9uTGFiQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEJhbGxWZWN0b3JOb2RlIGZyb20gJy4vQmFsbFZlY3Rvck5vZGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE1PTUVOVFVNX1ZFQ1RPUl9IRUFEX0RJTEFUSU9OX1NDQUxFID0gMS40OyAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NvbGxpc2lvbi1sYWIvaXNzdWVzLzEzMC5cclxuY29uc3QgTU9NRU5UVU1fVkVDVE9SX1RBSUxfRElMQVRJT05fU0NBTEUgPSAxLjg7IC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY29sbGlzaW9uLWxhYi9pc3N1ZXMvMTMwLlxyXG5cclxuY2xhc3MgQmFsbE1vbWVudHVtVmVjdG9yTm9kZSBleHRlbmRzIEJhbGxWZWN0b3JOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48VmVjdG9yMj59IGJhbGxQb3NpdGlvblByb3BlcnR5IC0gdGhlIHBvc2l0aW9uIG9mIHRoZSBCYWxsLCBpbiBtZXRlcnMuXHJcbiAgICogQHBhcmFtIHtSZWFkT25seVByb3BlcnR5LjxWZWN0b3IyPn0gbW9tZW50dW1Qcm9wZXJ0eSAtIHRoZSBtb21lbnR1bSBvZiB0aGUgQmFsbCwgaW4ga2cqKG0vcykuXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IG1vbWVudHVtVmVjdG9yVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGJhbGxQb3NpdGlvblByb3BlcnR5LCBtb21lbnR1bVByb3BlcnR5LCBtb21lbnR1bVZlY3RvclZpc2libGVQcm9wZXJ0eSwgbW9kZWxWaWV3VHJhbnNmb3JtLCBvcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydFByb3BlcnR5T2YoIGJhbGxQb3NpdGlvblByb3BlcnR5LCBWZWN0b3IyICk7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0QWJzdHJhY3RQcm9wZXJ0eU9mKCBtb21lbnR1bVByb3BlcnR5LCBWZWN0b3IyICk7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UHJvcGVydHlPZiggbW9tZW50dW1WZWN0b3JWaXNpYmxlUHJvcGVydHksICdib29sZWFuJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbW9kZWxWaWV3VHJhbnNmb3JtIGluc3RhbmNlb2YgTW9kZWxWaWV3VHJhbnNmb3JtMiwgYGludmFsaWQgbW9kZWxWaWV3VHJhbnNmb3JtOiAke21vZGVsVmlld1RyYW5zZm9ybX1gICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBzdXBlci1jbGFzcyBvcHRpb25zXHJcbiAgICAgIGFycm93T3B0aW9uczoge1xyXG4gICAgICAgIGZpbGw6IENvbGxpc2lvbkxhYkNvbG9ycy5NT01FTlRVTV9WRUNUT1JfRklMTCxcclxuICAgICAgICBzdHJva2U6IENvbGxpc2lvbkxhYkNvbG9ycy5NT01FTlRVTV9WRUNUT1JfU1RST0tFLFxyXG4gICAgICAgIGhlYWRXaWR0aDogQ29sbGlzaW9uTGFiQ29uc3RhbnRzLkFSUk9XX09QVElPTlMuaGVhZFdpZHRoICogTU9NRU5UVU1fVkVDVE9SX0hFQURfRElMQVRJT05fU0NBTEUsXHJcbiAgICAgICAgaGVhZEhlaWdodDogQ29sbGlzaW9uTGFiQ29uc3RhbnRzLkFSUk9XX09QVElPTlMuaGVhZEhlaWdodCAqIE1PTUVOVFVNX1ZFQ1RPUl9IRUFEX0RJTEFUSU9OX1NDQUxFLFxyXG4gICAgICAgIHRhaWxXaWR0aDogQ29sbGlzaW9uTGFiQ29uc3RhbnRzLkFSUk9XX09QVElPTlMudGFpbFdpZHRoICogTU9NRU5UVU1fVkVDVE9SX1RBSUxfRElMQVRJT05fU0NBTEVcclxuICAgICAgfVxyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzdXBlciggYmFsbFBvc2l0aW9uUHJvcGVydHksIG1vbWVudHVtUHJvcGVydHksIG1vbWVudHVtVmVjdG9yVmlzaWJsZVByb3BlcnR5LCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbGxpc2lvbkxhYi5yZWdpc3RlciggJ0JhbGxNb21lbnR1bVZlY3Rvck5vZGUnLCBCYWxsTW9tZW50dW1WZWN0b3JOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEJhbGxNb21lbnR1bVZlY3Rvck5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxXQUFXLE1BQU0sMENBQTBDO0FBQ2xFLE9BQU9DLG1CQUFtQixNQUFNLHVEQUF1RDtBQUN2RixPQUFPQyxZQUFZLE1BQU0sdUJBQXVCO0FBQ2hELE9BQU9DLGtCQUFrQixNQUFNLDBCQUEwQjtBQUN6RCxPQUFPQyxxQkFBcUIsTUFBTSw2QkFBNkI7QUFDL0QsT0FBT0MsY0FBYyxNQUFNLHFCQUFxQjs7QUFFaEQ7QUFDQSxNQUFNQyxtQ0FBbUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNqRCxNQUFNQyxtQ0FBbUMsR0FBRyxHQUFHLENBQUMsQ0FBQzs7QUFFakQsTUFBTUMsc0JBQXNCLFNBQVNILGNBQWMsQ0FBQztFQUVsRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxXQUFXQSxDQUFFQyxvQkFBb0IsRUFBRUMsZ0JBQWdCLEVBQUVDLDZCQUE2QixFQUFFQyxrQkFBa0IsRUFBRUMsT0FBTyxFQUFHO0lBQ2hIQyxNQUFNLElBQUlmLFdBQVcsQ0FBQ2dCLGdCQUFnQixDQUFFTixvQkFBb0IsRUFBRVosT0FBUSxDQUFDO0lBQ3ZFaUIsTUFBTSxJQUFJZixXQUFXLENBQUNpQix3QkFBd0IsQ0FBRU4sZ0JBQWdCLEVBQUViLE9BQVEsQ0FBQztJQUMzRWlCLE1BQU0sSUFBSWYsV0FBVyxDQUFDZ0IsZ0JBQWdCLENBQUVKLDZCQUE2QixFQUFFLFNBQVUsQ0FBQztJQUNsRkcsTUFBTSxJQUFJQSxNQUFNLENBQUVGLGtCQUFrQixZQUFZWixtQkFBbUIsRUFBRywrQkFBOEJZLGtCQUFtQixFQUFFLENBQUM7SUFFMUhDLE9BQU8sR0FBR2YsS0FBSyxDQUFFO01BRWY7TUFDQW1CLFlBQVksRUFBRTtRQUNaQyxJQUFJLEVBQUVoQixrQkFBa0IsQ0FBQ2lCLG9CQUFvQjtRQUM3Q0MsTUFBTSxFQUFFbEIsa0JBQWtCLENBQUNtQixzQkFBc0I7UUFDakRDLFNBQVMsRUFBRW5CLHFCQUFxQixDQUFDb0IsYUFBYSxDQUFDRCxTQUFTLEdBQUdqQixtQ0FBbUM7UUFDOUZtQixVQUFVLEVBQUVyQixxQkFBcUIsQ0FBQ29CLGFBQWEsQ0FBQ0MsVUFBVSxHQUFHbkIsbUNBQW1DO1FBQ2hHb0IsU0FBUyxFQUFFdEIscUJBQXFCLENBQUNvQixhQUFhLENBQUNFLFNBQVMsR0FBR25CO01BQzdEO0lBRUYsQ0FBQyxFQUFFTyxPQUFRLENBQUM7O0lBRVo7O0lBRUEsS0FBSyxDQUFFSixvQkFBb0IsRUFBRUMsZ0JBQWdCLEVBQUVDLDZCQUE2QixFQUFFQyxrQkFBa0IsRUFBRUMsT0FBUSxDQUFDO0VBQzdHO0FBQ0Y7QUFFQVosWUFBWSxDQUFDeUIsUUFBUSxDQUFFLHdCQUF3QixFQUFFbkIsc0JBQXVCLENBQUM7QUFDekUsZUFBZUEsc0JBQXNCIn0=