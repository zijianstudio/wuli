// Copyright 2019-2022, University of Colorado Boulder

/**
 * BallVectorNode is the root class (to be subclassed) view representation of a single Ball's vector, used for the
 * Ball's velocity and momentum vectors. They appear in all screens of the 'Collision Lab' simulation and are positioned
 * on top of Balls.
 *
 * Responsible for:
 *  - Translating this Node to the center of the Ball. The origin of this Node is the tail of the vector.
 *  - Updating the tip of the Vector based on a ballValueProperty.
 *
 * For the 'Collision Lab' sim, Balls are instantiated at the start of the sim are never disposed, even if they aren't
 * in the system. Thus, BallVectorNode subtypes persist for the lifetime of the simulation and links are left as-is.
 * See BallNode.js for more background.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Node } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
class BallVectorNode extends Node {
  /**
   * @param {Property.<Vector2>} ballPositionProperty - the position of the Ball, in meters.
   * @param {ReadOnlyProperty.<Vector2>} ballValueProperty - either the momentum or velocity Ball-value Property. Regardless,
   *                                                 its value represents the components of the BallVectorNode.
   * @param {Property.<boolean>} visibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor(ballPositionProperty, ballValueProperty, visibleProperty, modelViewTransform, options) {
    assert && AssertUtils.assertPropertyOf(ballPositionProperty, Vector2);
    assert && AssertUtils.assertAbstractPropertyOf(ballValueProperty, Vector2);
    assert && AssertUtils.assertPropertyOf(visibleProperty, 'boolean');
    assert && assert(modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}`);
    options = merge({
      // {Object} - passed to the ArrowNode instance.
      arrowOptions: merge({}, CollisionLabConstants.ARROW_OPTIONS)
    }, options);
    super(options);

    //----------------------------------------------------------------------------------------

    // Create the ArrowNode that represents the Vector. Initialized at 0 for now. To be updated below.
    const arrowNode = new ArrowNode(0, 0, 0, 0, options.arrowOptions);

    // Observe when the Ball's position change and update the translation of this Node. The origin of this Node
    // is the tail of the vector. Link is never unlinked since BallVectorNodes are never disposed.
    ballPositionProperty.link(ballPosition => {
      this.translation = modelViewTransform.modelToViewPosition(ballPosition);
    });

    // Observe when the ballValueProperty changes and update the tip position of this Node. Link is never unlinked since
    // BallVectorNodes are never disposed.
    ballValueProperty.link(ballValue => {
      // Get the position of the tip in view coordinates. This is relative to our origin, which is the tail of the
      // Vector.
      const tipViewPosition = modelViewTransform.modelToViewDelta(ballValue);

      // Only display the Vector if it has a magnitude that isn't effectively 0.
      if (tipViewPosition.magnitude > CollisionLabConstants.ZERO_THRESHOLD) {
        arrowNode.setTip(tipViewPosition.x, tipViewPosition.y);
      } else {
        arrowNode.setTip(0, 0);
      }
    });

    //----------------------------------------------------------------------------------------

    // Observe when the visibleProperty change and update the visibility of this Node. Link is never unlinked since
    // BallVectorNodes are never disposed.
    visibleProperty.linkAttribute(this, 'visible');

    // Finally, add the arrow as a child of this Node.
    this.addChild(arrowNode);
  }
}
collisionLab.register('BallVectorNode', BallVectorNode);
export default BallVectorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwibWVyZ2UiLCJBc3NlcnRVdGlscyIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJBcnJvd05vZGUiLCJOb2RlIiwiY29sbGlzaW9uTGFiIiwiQ29sbGlzaW9uTGFiQ29uc3RhbnRzIiwiQmFsbFZlY3Rvck5vZGUiLCJjb25zdHJ1Y3RvciIsImJhbGxQb3NpdGlvblByb3BlcnR5IiwiYmFsbFZhbHVlUHJvcGVydHkiLCJ2aXNpYmxlUHJvcGVydHkiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJvcHRpb25zIiwiYXNzZXJ0IiwiYXNzZXJ0UHJvcGVydHlPZiIsImFzc2VydEFic3RyYWN0UHJvcGVydHlPZiIsImFycm93T3B0aW9ucyIsIkFSUk9XX09QVElPTlMiLCJhcnJvd05vZGUiLCJsaW5rIiwiYmFsbFBvc2l0aW9uIiwidHJhbnNsYXRpb24iLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwiYmFsbFZhbHVlIiwidGlwVmlld1Bvc2l0aW9uIiwibW9kZWxUb1ZpZXdEZWx0YSIsIm1hZ25pdHVkZSIsIlpFUk9fVEhSRVNIT0xEIiwic2V0VGlwIiwieCIsInkiLCJsaW5rQXR0cmlidXRlIiwiYWRkQ2hpbGQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJhbGxWZWN0b3JOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhbGxWZWN0b3JOb2RlIGlzIHRoZSByb290IGNsYXNzICh0byBiZSBzdWJjbGFzc2VkKSB2aWV3IHJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIEJhbGwncyB2ZWN0b3IsIHVzZWQgZm9yIHRoZVxyXG4gKiBCYWxsJ3MgdmVsb2NpdHkgYW5kIG1vbWVudHVtIHZlY3RvcnMuIFRoZXkgYXBwZWFyIGluIGFsbCBzY3JlZW5zIG9mIHRoZSAnQ29sbGlzaW9uIExhYicgc2ltdWxhdGlvbiBhbmQgYXJlIHBvc2l0aW9uZWRcclxuICogb24gdG9wIG9mIEJhbGxzLlxyXG4gKlxyXG4gKiBSZXNwb25zaWJsZSBmb3I6XHJcbiAqICAtIFRyYW5zbGF0aW5nIHRoaXMgTm9kZSB0byB0aGUgY2VudGVyIG9mIHRoZSBCYWxsLiBUaGUgb3JpZ2luIG9mIHRoaXMgTm9kZSBpcyB0aGUgdGFpbCBvZiB0aGUgdmVjdG9yLlxyXG4gKiAgLSBVcGRhdGluZyB0aGUgdGlwIG9mIHRoZSBWZWN0b3IgYmFzZWQgb24gYSBiYWxsVmFsdWVQcm9wZXJ0eS5cclxuICpcclxuICogRm9yIHRoZSAnQ29sbGlzaW9uIExhYicgc2ltLCBCYWxscyBhcmUgaW5zdGFudGlhdGVkIGF0IHRoZSBzdGFydCBvZiB0aGUgc2ltIGFyZSBuZXZlciBkaXNwb3NlZCwgZXZlbiBpZiB0aGV5IGFyZW4ndFxyXG4gKiBpbiB0aGUgc3lzdGVtLiBUaHVzLCBCYWxsVmVjdG9yTm9kZSBzdWJ0eXBlcyBwZXJzaXN0IGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbXVsYXRpb24gYW5kIGxpbmtzIGFyZSBsZWZ0IGFzLWlzLlxyXG4gKiBTZWUgQmFsbE5vZGUuanMgZm9yIG1vcmUgYmFja2dyb3VuZC5cclxuICpcclxuICogQGF1dGhvciBCcmFuZG9uIExpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEFzc2VydFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvQXNzZXJ0VXRpbHMuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY29sbGlzaW9uTGFiIGZyb20gJy4uLy4uL2NvbGxpc2lvbkxhYi5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJDb25zdGFudHMgZnJvbSAnLi4vQ29sbGlzaW9uTGFiQ29uc3RhbnRzLmpzJztcclxuXHJcbmNsYXNzIEJhbGxWZWN0b3JOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPFZlY3RvcjI+fSBiYWxsUG9zaXRpb25Qcm9wZXJ0eSAtIHRoZSBwb3NpdGlvbiBvZiB0aGUgQmFsbCwgaW4gbWV0ZXJzLlxyXG4gICAqIEBwYXJhbSB7UmVhZE9ubHlQcm9wZXJ0eS48VmVjdG9yMj59IGJhbGxWYWx1ZVByb3BlcnR5IC0gZWl0aGVyIHRoZSBtb21lbnR1bSBvciB2ZWxvY2l0eSBCYWxsLXZhbHVlIFByb3BlcnR5LiBSZWdhcmRsZXNzLFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0cyB2YWx1ZSByZXByZXNlbnRzIHRoZSBjb21wb25lbnRzIG9mIHRoZSBCYWxsVmVjdG9yTm9kZS5cclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gdmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGJhbGxQb3NpdGlvblByb3BlcnR5LCBiYWxsVmFsdWVQcm9wZXJ0eSwgdmlzaWJsZVByb3BlcnR5LCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UHJvcGVydHlPZiggYmFsbFBvc2l0aW9uUHJvcGVydHksIFZlY3RvcjIgKTtcclxuICAgIGFzc2VydCAmJiBBc3NlcnRVdGlscy5hc3NlcnRBYnN0cmFjdFByb3BlcnR5T2YoIGJhbGxWYWx1ZVByb3BlcnR5LCBWZWN0b3IyICk7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UHJvcGVydHlPZiggdmlzaWJsZVByb3BlcnR5LCAnYm9vbGVhbicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1vZGVsVmlld1RyYW5zZm9ybSBpbnN0YW5jZW9mIE1vZGVsVmlld1RyYW5zZm9ybTIsIGBpbnZhbGlkIG1vZGVsVmlld1RyYW5zZm9ybTogJHttb2RlbFZpZXdUcmFuc2Zvcm19YCApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8ge09iamVjdH0gLSBwYXNzZWQgdG8gdGhlIEFycm93Tm9kZSBpbnN0YW5jZS5cclxuICAgICAgYXJyb3dPcHRpb25zOiBtZXJnZSgge30sIENvbGxpc2lvbkxhYkNvbnN0YW50cy5BUlJPV19PUFRJT05TIClcclxuXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIEFycm93Tm9kZSB0aGF0IHJlcHJlc2VudHMgdGhlIFZlY3Rvci4gSW5pdGlhbGl6ZWQgYXQgMCBmb3Igbm93LiBUbyBiZSB1cGRhdGVkIGJlbG93LlxyXG4gICAgY29uc3QgYXJyb3dOb2RlID0gbmV3IEFycm93Tm9kZSggMCwgMCwgMCwgMCwgb3B0aW9ucy5hcnJvd09wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBPYnNlcnZlIHdoZW4gdGhlIEJhbGwncyBwb3NpdGlvbiBjaGFuZ2UgYW5kIHVwZGF0ZSB0aGUgdHJhbnNsYXRpb24gb2YgdGhpcyBOb2RlLiBUaGUgb3JpZ2luIG9mIHRoaXMgTm9kZVxyXG4gICAgLy8gaXMgdGhlIHRhaWwgb2YgdGhlIHZlY3Rvci4gTGluayBpcyBuZXZlciB1bmxpbmtlZCBzaW5jZSBCYWxsVmVjdG9yTm9kZXMgYXJlIG5ldmVyIGRpc3Bvc2VkLlxyXG4gICAgYmFsbFBvc2l0aW9uUHJvcGVydHkubGluayggYmFsbFBvc2l0aW9uID0+IHtcclxuICAgICAgdGhpcy50cmFuc2xhdGlvbiA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBiYWxsUG9zaXRpb24gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBPYnNlcnZlIHdoZW4gdGhlIGJhbGxWYWx1ZVByb3BlcnR5IGNoYW5nZXMgYW5kIHVwZGF0ZSB0aGUgdGlwIHBvc2l0aW9uIG9mIHRoaXMgTm9kZS4gTGluayBpcyBuZXZlciB1bmxpbmtlZCBzaW5jZVxyXG4gICAgLy8gQmFsbFZlY3Rvck5vZGVzIGFyZSBuZXZlciBkaXNwb3NlZC5cclxuICAgIGJhbGxWYWx1ZVByb3BlcnR5LmxpbmsoIGJhbGxWYWx1ZSA9PiB7XHJcblxyXG4gICAgICAvLyBHZXQgdGhlIHBvc2l0aW9uIG9mIHRoZSB0aXAgaW4gdmlldyBjb29yZGluYXRlcy4gVGhpcyBpcyByZWxhdGl2ZSB0byBvdXIgb3JpZ2luLCB3aGljaCBpcyB0aGUgdGFpbCBvZiB0aGVcclxuICAgICAgLy8gVmVjdG9yLlxyXG4gICAgICBjb25zdCB0aXBWaWV3UG9zaXRpb24gPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YSggYmFsbFZhbHVlICk7XHJcblxyXG4gICAgICAvLyBPbmx5IGRpc3BsYXkgdGhlIFZlY3RvciBpZiBpdCBoYXMgYSBtYWduaXR1ZGUgdGhhdCBpc24ndCBlZmZlY3RpdmVseSAwLlxyXG4gICAgICBpZiAoIHRpcFZpZXdQb3NpdGlvbi5tYWduaXR1ZGUgPiBDb2xsaXNpb25MYWJDb25zdGFudHMuWkVST19USFJFU0hPTEQgKSB7XHJcbiAgICAgICAgYXJyb3dOb2RlLnNldFRpcCggdGlwVmlld1Bvc2l0aW9uLngsIHRpcFZpZXdQb3NpdGlvbi55ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgYXJyb3dOb2RlLnNldFRpcCggMCwgMCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gT2JzZXJ2ZSB3aGVuIHRoZSB2aXNpYmxlUHJvcGVydHkgY2hhbmdlIGFuZCB1cGRhdGUgdGhlIHZpc2liaWxpdHkgb2YgdGhpcyBOb2RlLiBMaW5rIGlzIG5ldmVyIHVubGlua2VkIHNpbmNlXHJcbiAgICAvLyBCYWxsVmVjdG9yTm9kZXMgYXJlIG5ldmVyIGRpc3Bvc2VkLlxyXG4gICAgdmlzaWJsZVByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIHRoaXMsICd2aXNpYmxlJyApO1xyXG5cclxuICAgIC8vIEZpbmFsbHksIGFkZCB0aGUgYXJyb3cgYXMgYSBjaGlsZCBvZiB0aGlzIE5vZGUuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBhcnJvd05vZGUgKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbGxpc2lvbkxhYi5yZWdpc3RlciggJ0JhbGxWZWN0b3JOb2RlJywgQmFsbFZlY3Rvck5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgQmFsbFZlY3Rvck5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwwQ0FBMEM7QUFDbEUsT0FBT0MsbUJBQW1CLE1BQU0sdURBQXVEO0FBQ3ZGLE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsU0FBU0MsSUFBSSxRQUFRLG1DQUFtQztBQUN4RCxPQUFPQyxZQUFZLE1BQU0sdUJBQXVCO0FBQ2hELE9BQU9DLHFCQUFxQixNQUFNLDZCQUE2QjtBQUUvRCxNQUFNQyxjQUFjLFNBQVNILElBQUksQ0FBQztFQUVoQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VJLFdBQVdBLENBQUVDLG9CQUFvQixFQUFFQyxpQkFBaUIsRUFBRUMsZUFBZSxFQUFFQyxrQkFBa0IsRUFBRUMsT0FBTyxFQUFHO0lBQ25HQyxNQUFNLElBQUliLFdBQVcsQ0FBQ2MsZ0JBQWdCLENBQUVOLG9CQUFvQixFQUFFVixPQUFRLENBQUM7SUFDdkVlLE1BQU0sSUFBSWIsV0FBVyxDQUFDZSx3QkFBd0IsQ0FBRU4saUJBQWlCLEVBQUVYLE9BQVEsQ0FBQztJQUM1RWUsTUFBTSxJQUFJYixXQUFXLENBQUNjLGdCQUFnQixDQUFFSixlQUFlLEVBQUUsU0FBVSxDQUFDO0lBQ3BFRyxNQUFNLElBQUlBLE1BQU0sQ0FBRUYsa0JBQWtCLFlBQVlWLG1CQUFtQixFQUFHLCtCQUE4QlUsa0JBQW1CLEVBQUUsQ0FBQztJQUUxSEMsT0FBTyxHQUFHYixLQUFLLENBQUU7TUFFZjtNQUNBaUIsWUFBWSxFQUFFakIsS0FBSyxDQUFFLENBQUMsQ0FBQyxFQUFFTSxxQkFBcUIsQ0FBQ1ksYUFBYztJQUUvRCxDQUFDLEVBQUVMLE9BQVEsQ0FBQztJQUVaLEtBQUssQ0FBRUEsT0FBUSxDQUFDOztJQUVoQjs7SUFFQTtJQUNBLE1BQU1NLFNBQVMsR0FBRyxJQUFJaEIsU0FBUyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRVUsT0FBTyxDQUFDSSxZQUFhLENBQUM7O0lBRW5FO0lBQ0E7SUFDQVIsb0JBQW9CLENBQUNXLElBQUksQ0FBRUMsWUFBWSxJQUFJO01BQ3pDLElBQUksQ0FBQ0MsV0FBVyxHQUFHVixrQkFBa0IsQ0FBQ1csbUJBQW1CLENBQUVGLFlBQWEsQ0FBQztJQUMzRSxDQUFFLENBQUM7O0lBRUg7SUFDQTtJQUNBWCxpQkFBaUIsQ0FBQ1UsSUFBSSxDQUFFSSxTQUFTLElBQUk7TUFFbkM7TUFDQTtNQUNBLE1BQU1DLGVBQWUsR0FBR2Isa0JBQWtCLENBQUNjLGdCQUFnQixDQUFFRixTQUFVLENBQUM7O01BRXhFO01BQ0EsSUFBS0MsZUFBZSxDQUFDRSxTQUFTLEdBQUdyQixxQkFBcUIsQ0FBQ3NCLGNBQWMsRUFBRztRQUN0RVQsU0FBUyxDQUFDVSxNQUFNLENBQUVKLGVBQWUsQ0FBQ0ssQ0FBQyxFQUFFTCxlQUFlLENBQUNNLENBQUUsQ0FBQztNQUMxRCxDQUFDLE1BQ0k7UUFDSFosU0FBUyxDQUFDVSxNQUFNLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztNQUMxQjtJQUNGLENBQUUsQ0FBQzs7SUFFSDs7SUFFQTtJQUNBO0lBQ0FsQixlQUFlLENBQUNxQixhQUFhLENBQUUsSUFBSSxFQUFFLFNBQVUsQ0FBQzs7SUFFaEQ7SUFDQSxJQUFJLENBQUNDLFFBQVEsQ0FBRWQsU0FBVSxDQUFDO0VBQzVCO0FBQ0Y7QUFFQWQsWUFBWSxDQUFDNkIsUUFBUSxDQUFFLGdCQUFnQixFQUFFM0IsY0FBZSxDQUFDO0FBQ3pELGVBQWVBLGNBQWMifQ==