// Copyright 2015-2022, University of Colorado Boulder

/**
 * Play button for starting an action
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Martin Veillette (Berea College)
 */

import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Path } from '../../../../scenery/js/imports.js';
import RoundPushButton from '../../../../sun/js/buttons/RoundPushButton.js';
import plinkoProbability from '../../plinkoProbability.js';
import PlinkoProbabilityConstants from '../PlinkoProbabilityConstants.js';
class PlayButton extends RoundPushButton {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      radius: PlinkoProbabilityConstants.PLAY_PAUSE_BUTTON_RADIUS,
      xMargin: 15,
      yMargin: 15,
      baseColor: 'rgb( 0, 224, 121 )',
      // light green
      iconColor: 'black',
      buttonAppearanceStrategy: PlinkoProbabilityConstants.PLAY_PAUSE_BUTTON_APPEARANCE_STRATEGY
    }, options);

    // triangle is sized relative to the radius
    const triangleHeight = options.radius;
    const triangleWidth = options.radius * 0.8;
    const triangleShape = new Shape().moveTo(0, triangleHeight / 2).lineTo(triangleWidth, 0).lineTo(0, -triangleHeight / 2).close();
    const triangleNode = new Path(triangleShape, {
      fill: options.iconColor
    });

    // move to right slightly, since we don't want it exactly centered
    options.xContentOffset = 0.1 * triangleNode.width;
    assert && assert(!options.content, 'PlayButton sets content');
    options.content = triangleNode;
    super(options);
  }
}
plinkoProbability.register('PlayButton', PlayButton);
export default PlayButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIm1lcmdlIiwiUGF0aCIsIlJvdW5kUHVzaEJ1dHRvbiIsInBsaW5rb1Byb2JhYmlsaXR5IiwiUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMiLCJQbGF5QnV0dG9uIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwicmFkaXVzIiwiUExBWV9QQVVTRV9CVVRUT05fUkFESVVTIiwieE1hcmdpbiIsInlNYXJnaW4iLCJiYXNlQ29sb3IiLCJpY29uQ29sb3IiLCJidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3kiLCJQTEFZX1BBVVNFX0JVVFRPTl9BUFBFQVJBTkNFX1NUUkFURUdZIiwidHJpYW5nbGVIZWlnaHQiLCJ0cmlhbmdsZVdpZHRoIiwidHJpYW5nbGVTaGFwZSIsIm1vdmVUbyIsImxpbmVUbyIsImNsb3NlIiwidHJpYW5nbGVOb2RlIiwiZmlsbCIsInhDb250ZW50T2Zmc2V0Iiwid2lkdGgiLCJhc3NlcnQiLCJjb250ZW50IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQbGF5QnV0dG9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBsYXkgYnV0dG9uIGZvciBzdGFydGluZyBhbiBhY3Rpb25cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlIChCZXJlYSBDb2xsZWdlKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUm91bmRQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JvdW5kUHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBwbGlua29Qcm9iYWJpbGl0eSBmcm9tICcuLi8uLi9wbGlua29Qcm9iYWJpbGl0eS5qcyc7XHJcbmltcG9ydCBQbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cyBmcm9tICcuLi9QbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cy5qcyc7XHJcblxyXG5jbGFzcyBQbGF5QnV0dG9uIGV4dGVuZHMgUm91bmRQdXNoQnV0dG9uIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICByYWRpdXM6IFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzLlBMQVlfUEFVU0VfQlVUVE9OX1JBRElVUyxcclxuICAgICAgeE1hcmdpbjogMTUsXHJcbiAgICAgIHlNYXJnaW46IDE1LFxyXG4gICAgICBiYXNlQ29sb3I6ICdyZ2IoIDAsIDIyNCwgMTIxICknLCAvLyBsaWdodCBncmVlblxyXG4gICAgICBpY29uQ29sb3I6ICdibGFjaycsXHJcbiAgICAgIGJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneTogUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuUExBWV9QQVVTRV9CVVRUT05fQVBQRUFSQU5DRV9TVFJBVEVHWVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHRyaWFuZ2xlIGlzIHNpemVkIHJlbGF0aXZlIHRvIHRoZSByYWRpdXNcclxuICAgIGNvbnN0IHRyaWFuZ2xlSGVpZ2h0ID0gb3B0aW9ucy5yYWRpdXM7XHJcbiAgICBjb25zdCB0cmlhbmdsZVdpZHRoID0gb3B0aW9ucy5yYWRpdXMgKiAwLjg7XHJcblxyXG4gICAgY29uc3QgdHJpYW5nbGVTaGFwZSA9IG5ldyBTaGFwZSgpXHJcbiAgICAgIC5tb3ZlVG8oIDAsIHRyaWFuZ2xlSGVpZ2h0IC8gMiApXHJcbiAgICAgIC5saW5lVG8oIHRyaWFuZ2xlV2lkdGgsIDAgKVxyXG4gICAgICAubGluZVRvKCAwLCAtdHJpYW5nbGVIZWlnaHQgLyAyIClcclxuICAgICAgLmNsb3NlKCk7XHJcblxyXG4gICAgY29uc3QgdHJpYW5nbGVOb2RlID0gbmV3IFBhdGgoIHRyaWFuZ2xlU2hhcGUsIHtcclxuICAgICAgZmlsbDogb3B0aW9ucy5pY29uQ29sb3JcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBtb3ZlIHRvIHJpZ2h0IHNsaWdodGx5LCBzaW5jZSB3ZSBkb24ndCB3YW50IGl0IGV4YWN0bHkgY2VudGVyZWRcclxuICAgIG9wdGlvbnMueENvbnRlbnRPZmZzZXQgPSAwLjEgKiB0cmlhbmdsZU5vZGUud2lkdGg7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuY29udGVudCwgJ1BsYXlCdXR0b24gc2V0cyBjb250ZW50JyApO1xyXG4gICAgb3B0aW9ucy5jb250ZW50ID0gdHJpYW5nbGVOb2RlO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5wbGlua29Qcm9iYWJpbGl0eS5yZWdpc3RlciggJ1BsYXlCdXR0b24nLCBQbGF5QnV0dG9uICk7XHJcbmV4cG9ydCBkZWZhdWx0IFBsYXlCdXR0b247Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLElBQUksUUFBUSxtQ0FBbUM7QUFDeEQsT0FBT0MsZUFBZSxNQUFNLCtDQUErQztBQUMzRSxPQUFPQyxpQkFBaUIsTUFBTSw0QkFBNEI7QUFDMUQsT0FBT0MsMEJBQTBCLE1BQU0sa0NBQWtDO0FBRXpFLE1BQU1DLFVBQVUsU0FBU0gsZUFBZSxDQUFDO0VBRXZDO0FBQ0Y7QUFDQTtFQUNFSSxXQUFXQSxDQUFFQyxPQUFPLEVBQUc7SUFFckJBLE9BQU8sR0FBR1AsS0FBSyxDQUFFO01BQ2ZRLE1BQU0sRUFBRUosMEJBQTBCLENBQUNLLHdCQUF3QjtNQUMzREMsT0FBTyxFQUFFLEVBQUU7TUFDWEMsT0FBTyxFQUFFLEVBQUU7TUFDWEMsU0FBUyxFQUFFLG9CQUFvQjtNQUFFO01BQ2pDQyxTQUFTLEVBQUUsT0FBTztNQUNsQkMsd0JBQXdCLEVBQUVWLDBCQUEwQixDQUFDVztJQUN2RCxDQUFDLEVBQUVSLE9BQVEsQ0FBQzs7SUFFWjtJQUNBLE1BQU1TLGNBQWMsR0FBR1QsT0FBTyxDQUFDQyxNQUFNO0lBQ3JDLE1BQU1TLGFBQWEsR0FBR1YsT0FBTyxDQUFDQyxNQUFNLEdBQUcsR0FBRztJQUUxQyxNQUFNVSxhQUFhLEdBQUcsSUFBSW5CLEtBQUssQ0FBQyxDQUFDLENBQzlCb0IsTUFBTSxDQUFFLENBQUMsRUFBRUgsY0FBYyxHQUFHLENBQUUsQ0FBQyxDQUMvQkksTUFBTSxDQUFFSCxhQUFhLEVBQUUsQ0FBRSxDQUFDLENBQzFCRyxNQUFNLENBQUUsQ0FBQyxFQUFFLENBQUNKLGNBQWMsR0FBRyxDQUFFLENBQUMsQ0FDaENLLEtBQUssQ0FBQyxDQUFDO0lBRVYsTUFBTUMsWUFBWSxHQUFHLElBQUlyQixJQUFJLENBQUVpQixhQUFhLEVBQUU7TUFDNUNLLElBQUksRUFBRWhCLE9BQU8sQ0FBQ007SUFDaEIsQ0FBRSxDQUFDOztJQUVIO0lBQ0FOLE9BQU8sQ0FBQ2lCLGNBQWMsR0FBRyxHQUFHLEdBQUdGLFlBQVksQ0FBQ0csS0FBSztJQUVqREMsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQ25CLE9BQU8sQ0FBQ29CLE9BQU8sRUFBRSx5QkFBMEIsQ0FBQztJQUMvRHBCLE9BQU8sQ0FBQ29CLE9BQU8sR0FBR0wsWUFBWTtJQUU5QixLQUFLLENBQUVmLE9BQVEsQ0FBQztFQUNsQjtBQUNGO0FBRUFKLGlCQUFpQixDQUFDeUIsUUFBUSxDQUFFLFlBQVksRUFBRXZCLFVBQVcsQ0FBQztBQUN0RCxlQUFlQSxVQUFVIn0=