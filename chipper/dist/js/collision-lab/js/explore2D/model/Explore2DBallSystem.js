// Copyright 2020, University of Colorado Boulder

/**
 * Explore2DBallSystem is a BallSystem sub-type for the 'Explore 2D' screen.
 *
 * Although it adds no additional functionality to the super-class, it is added for symmetry within the screen-specific
 * model-view type hierarchy. It also verifies a correct configuration of initialBallStates for 2D and gives the
 * initial BallStates for the Explore 2D screen.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import BallState from '../../common/model/BallState.js';
import BallSystem from '../../common/model/BallSystem.js';
import Explore2DPlayArea from './Explore2DPlayArea.js';
class Explore2DBallSystem extends BallSystem {
  /**
   * @param {Explore2DPlayArea} playArea
   * @param {Object} [options]
   */
  constructor(playArea, options) {
    assert && assert(playArea instanceof Explore2DPlayArea, `invalid playArea: ${playArea}`);
    super(Explore2DBallSystem.INITIAL_BALL_STATES, playArea, options);

    //----------------------------------------------------------------------------------------

    // Verify a correct configuration of Balls that conforms to the invariants for 2D screens, but bury behind assert
    // so it doesn't impact production performance.
    if (assert) {
      // Verify that the correct number of BallStates were provided.
      assert(Explore2DBallSystem.INITIAL_BALL_STATES.length === this.numberOfBallsRange.max);

      // Verify that the position of BallStates were inside the PlayArea's bounds.
      assert(Explore2DBallSystem.INITIAL_BALL_STATES.every(ballState => playArea.bounds.containsPoint(ballState.position)));
    }
  }
}

// @public (read-only) {BallState[]} - the initial BallStates of all Balls in the 'Explore 2D' screen.
Explore2DBallSystem.INITIAL_BALL_STATES = [new BallState(new Vector2(-1.0, 0.000), new Vector2(1.00, 0.300), 0.50), new BallState(new Vector2(0.00, 0.500), new Vector2(-0.5, -0.50), 1.50), new BallState(new Vector2(-1.0, -0.50), new Vector2(-0.25, -0.5), 1.00), new BallState(new Vector2(0.20, -0.65), new Vector2(1.10, 0.200), 1.00)];
collisionLab.register('Explore2DBallSystem', Explore2DBallSystem);
export default Explore2DBallSystem;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiY29sbGlzaW9uTGFiIiwiQmFsbFN0YXRlIiwiQmFsbFN5c3RlbSIsIkV4cGxvcmUyRFBsYXlBcmVhIiwiRXhwbG9yZTJEQmFsbFN5c3RlbSIsImNvbnN0cnVjdG9yIiwicGxheUFyZWEiLCJvcHRpb25zIiwiYXNzZXJ0IiwiSU5JVElBTF9CQUxMX1NUQVRFUyIsImxlbmd0aCIsIm51bWJlck9mQmFsbHNSYW5nZSIsIm1heCIsImV2ZXJ5IiwiYmFsbFN0YXRlIiwiYm91bmRzIiwiY29udGFpbnNQb2ludCIsInBvc2l0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFeHBsb3JlMkRCYWxsU3lzdGVtLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBFeHBsb3JlMkRCYWxsU3lzdGVtIGlzIGEgQmFsbFN5c3RlbSBzdWItdHlwZSBmb3IgdGhlICdFeHBsb3JlIDJEJyBzY3JlZW4uXHJcbiAqXHJcbiAqIEFsdGhvdWdoIGl0IGFkZHMgbm8gYWRkaXRpb25hbCBmdW5jdGlvbmFsaXR5IHRvIHRoZSBzdXBlci1jbGFzcywgaXQgaXMgYWRkZWQgZm9yIHN5bW1ldHJ5IHdpdGhpbiB0aGUgc2NyZWVuLXNwZWNpZmljXHJcbiAqIG1vZGVsLXZpZXcgdHlwZSBoaWVyYXJjaHkuIEl0IGFsc28gdmVyaWZpZXMgYSBjb3JyZWN0IGNvbmZpZ3VyYXRpb24gb2YgaW5pdGlhbEJhbGxTdGF0ZXMgZm9yIDJEIGFuZCBnaXZlcyB0aGVcclxuICogaW5pdGlhbCBCYWxsU3RhdGVzIGZvciB0aGUgRXhwbG9yZSAyRCBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IGNvbGxpc2lvbkxhYiBmcm9tICcuLi8uLi9jb2xsaXNpb25MYWIuanMnO1xyXG5pbXBvcnQgQmFsbFN0YXRlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9CYWxsU3RhdGUuanMnO1xyXG5pbXBvcnQgQmFsbFN5c3RlbSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQmFsbFN5c3RlbS5qcyc7XHJcbmltcG9ydCBFeHBsb3JlMkRQbGF5QXJlYSBmcm9tICcuL0V4cGxvcmUyRFBsYXlBcmVhLmpzJztcclxuXHJcbmNsYXNzIEV4cGxvcmUyREJhbGxTeXN0ZW0gZXh0ZW5kcyBCYWxsU3lzdGVtIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtFeHBsb3JlMkRQbGF5QXJlYX0gcGxheUFyZWFcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHBsYXlBcmVhLCBvcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcGxheUFyZWEgaW5zdGFuY2VvZiBFeHBsb3JlMkRQbGF5QXJlYSwgYGludmFsaWQgcGxheUFyZWE6ICR7cGxheUFyZWF9YCApO1xyXG5cclxuICAgIHN1cGVyKCBFeHBsb3JlMkRCYWxsU3lzdGVtLklOSVRJQUxfQkFMTF9TVEFURVMsIHBsYXlBcmVhLCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gVmVyaWZ5IGEgY29ycmVjdCBjb25maWd1cmF0aW9uIG9mIEJhbGxzIHRoYXQgY29uZm9ybXMgdG8gdGhlIGludmFyaWFudHMgZm9yIDJEIHNjcmVlbnMsIGJ1dCBidXJ5IGJlaGluZCBhc3NlcnRcclxuICAgIC8vIHNvIGl0IGRvZXNuJ3QgaW1wYWN0IHByb2R1Y3Rpb24gcGVyZm9ybWFuY2UuXHJcbiAgICBpZiAoIGFzc2VydCApIHtcclxuXHJcbiAgICAgIC8vIFZlcmlmeSB0aGF0IHRoZSBjb3JyZWN0IG51bWJlciBvZiBCYWxsU3RhdGVzIHdlcmUgcHJvdmlkZWQuXHJcbiAgICAgIGFzc2VydCggRXhwbG9yZTJEQmFsbFN5c3RlbS5JTklUSUFMX0JBTExfU1RBVEVTLmxlbmd0aCA9PT0gdGhpcy5udW1iZXJPZkJhbGxzUmFuZ2UubWF4ICk7XHJcblxyXG4gICAgICAvLyBWZXJpZnkgdGhhdCB0aGUgcG9zaXRpb24gb2YgQmFsbFN0YXRlcyB3ZXJlIGluc2lkZSB0aGUgUGxheUFyZWEncyBib3VuZHMuXHJcbiAgICAgIGFzc2VydCggRXhwbG9yZTJEQmFsbFN5c3RlbS5JTklUSUFMX0JBTExfU1RBVEVTLmV2ZXJ5KCBiYWxsU3RhdGUgPT4gcGxheUFyZWEuYm91bmRzLmNvbnRhaW5zUG9pbnQoIGJhbGxTdGF0ZS5wb3NpdGlvbiApICkgKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIEBwdWJsaWMgKHJlYWQtb25seSkge0JhbGxTdGF0ZVtdfSAtIHRoZSBpbml0aWFsIEJhbGxTdGF0ZXMgb2YgYWxsIEJhbGxzIGluIHRoZSAnRXhwbG9yZSAyRCcgc2NyZWVuLlxyXG5FeHBsb3JlMkRCYWxsU3lzdGVtLklOSVRJQUxfQkFMTF9TVEFURVMgPSBbXHJcbiAgbmV3IEJhbGxTdGF0ZSggbmV3IFZlY3RvcjIoIC0xLjAsIDAuMDAwICksIG5ldyBWZWN0b3IyKCAxLjAwLCAwLjMwMCApLCAwLjUwICksXHJcbiAgbmV3IEJhbGxTdGF0ZSggbmV3IFZlY3RvcjIoIDAuMDAsIDAuNTAwICksIG5ldyBWZWN0b3IyKCAtMC41LCAtMC41MCApLCAxLjUwICksXHJcbiAgbmV3IEJhbGxTdGF0ZSggbmV3IFZlY3RvcjIoIC0xLjAsIC0wLjUwICksIG5ldyBWZWN0b3IyKCAtMC4yNSwgLTAuNSApLCAxLjAwICksXHJcbiAgbmV3IEJhbGxTdGF0ZSggbmV3IFZlY3RvcjIoIDAuMjAsIC0wLjY1ICksIG5ldyBWZWN0b3IyKCAxLjEwLCAwLjIwMCApLCAxLjAwIClcclxuXTtcclxuXHJcbmNvbGxpc2lvbkxhYi5yZWdpc3RlciggJ0V4cGxvcmUyREJhbGxTeXN0ZW0nLCBFeHBsb3JlMkRCYWxsU3lzdGVtICk7XHJcbmV4cG9ydCBkZWZhdWx0IEV4cGxvcmUyREJhbGxTeXN0ZW07Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxZQUFZLE1BQU0sdUJBQXVCO0FBQ2hELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxpQkFBaUIsTUFBTSx3QkFBd0I7QUFFdEQsTUFBTUMsbUJBQW1CLFNBQVNGLFVBQVUsQ0FBQztFQUUzQztBQUNGO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxRQUFRLEVBQUVDLE9BQU8sRUFBRztJQUMvQkMsTUFBTSxJQUFJQSxNQUFNLENBQUVGLFFBQVEsWUFBWUgsaUJBQWlCLEVBQUcscUJBQW9CRyxRQUFTLEVBQUUsQ0FBQztJQUUxRixLQUFLLENBQUVGLG1CQUFtQixDQUFDSyxtQkFBbUIsRUFBRUgsUUFBUSxFQUFFQyxPQUFRLENBQUM7O0lBRW5FOztJQUVBO0lBQ0E7SUFDQSxJQUFLQyxNQUFNLEVBQUc7TUFFWjtNQUNBQSxNQUFNLENBQUVKLG1CQUFtQixDQUFDSyxtQkFBbUIsQ0FBQ0MsTUFBTSxLQUFLLElBQUksQ0FBQ0Msa0JBQWtCLENBQUNDLEdBQUksQ0FBQzs7TUFFeEY7TUFDQUosTUFBTSxDQUFFSixtQkFBbUIsQ0FBQ0ssbUJBQW1CLENBQUNJLEtBQUssQ0FBRUMsU0FBUyxJQUFJUixRQUFRLENBQUNTLE1BQU0sQ0FBQ0MsYUFBYSxDQUFFRixTQUFTLENBQUNHLFFBQVMsQ0FBRSxDQUFFLENBQUM7SUFDN0g7RUFDRjtBQUNGOztBQUVBO0FBQ0FiLG1CQUFtQixDQUFDSyxtQkFBbUIsR0FBRyxDQUN4QyxJQUFJUixTQUFTLENBQUUsSUFBSUYsT0FBTyxDQUFFLENBQUMsR0FBRyxFQUFFLEtBQU0sQ0FBQyxFQUFFLElBQUlBLE9BQU8sQ0FBRSxJQUFJLEVBQUUsS0FBTSxDQUFDLEVBQUUsSUFBSyxDQUFDLEVBQzdFLElBQUlFLFNBQVMsQ0FBRSxJQUFJRixPQUFPLENBQUUsSUFBSSxFQUFFLEtBQU0sQ0FBQyxFQUFFLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUssQ0FBQyxFQUFFLElBQUssQ0FBQyxFQUM3RSxJQUFJRSxTQUFTLENBQUUsSUFBSUYsT0FBTyxDQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSyxDQUFDLEVBQUUsSUFBSUEsT0FBTyxDQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBSSxDQUFDLEVBQUUsSUFBSyxDQUFDLEVBQzdFLElBQUlFLFNBQVMsQ0FBRSxJQUFJRixPQUFPLENBQUUsSUFBSSxFQUFFLENBQUMsSUFBSyxDQUFDLEVBQUUsSUFBSUEsT0FBTyxDQUFFLElBQUksRUFBRSxLQUFNLENBQUMsRUFBRSxJQUFLLENBQUMsQ0FDOUU7QUFFREMsWUFBWSxDQUFDa0IsUUFBUSxDQUFFLHFCQUFxQixFQUFFZCxtQkFBb0IsQ0FBQztBQUNuRSxlQUFlQSxtQkFBbUIifQ==