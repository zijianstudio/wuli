// Copyright 2015-2022, University of Colorado Boulder

/**
 * View for the charged particle
 *
 * @author Martin Veillette (Berea College)
 */

import { Shape } from '../../../../kite/js/imports.js';
import { Circle, Node, Path, RadialGradient } from '../../../../scenery/js/imports.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';

// constants
const CIRCLE_RADIUS = ChargesAndFieldsConstants.CHARGE_RADIUS; // radius of a charged particle

class ChargedParticleRepresentationNode extends Node {
  /**
   * Constructor for the scenery node of the charge
   *
   * @param {number} charge
   * @param {Object} [options] - Passed to Node
   */
  constructor(charge, options) {
    super(options);
    assert && assert(charge === 1 || charge === -1, 'Charges should be +1 or -1');

    // Create and add the circle that represents the charge particle
    const circle = new Circle(CIRCLE_RADIUS);
    this.addChild(circle);
    if (charge === 1) {
      circle.fill = new RadialGradient(0, 0, CIRCLE_RADIUS * 0.2, 0, 0, CIRCLE_RADIUS * 1).addColorStop(0, 'rgb(255,43,79)') // mostly red
      .addColorStop(0.5, 'rgb(245, 60, 44 )').addColorStop(1, 'rgb(232,9,0)');
    } else {
      // then it must be a negative charge
      circle.fill = new RadialGradient(0, 0, CIRCLE_RADIUS * 0.2, 0, 0, CIRCLE_RADIUS * 1).addColorStop(0, 'rgb(79,207,255)') // mostly blue
      .addColorStop(0.5, 'rgb(44, 190, 245)').addColorStop(1, 'rgb(0,169,232)');
    }

    // Create and add a plus or minus sign on the center of the circle based on the charge of the particle
    const ratio = 0.6; // relative size of the sign shape relative to the radius of the Circle
    const pathOptions = {
      centerX: 0,
      centerY: 0,
      lineWidth: CIRCLE_RADIUS * 0.3,
      stroke: 'white',
      pickable: false
    };
    if (charge === 1) {
      // plus Shape representing a positive charge
      const plusShape = new Shape().moveTo(-CIRCLE_RADIUS * ratio, 0).lineTo(CIRCLE_RADIUS * ratio, 0).moveTo(0, -CIRCLE_RADIUS * ratio).lineTo(0, CIRCLE_RADIUS * ratio);
      this.addChild(new Path(plusShape, pathOptions));
    } else {
      // minus Shape representing a negative charge
      const minusShape = new Shape().moveTo(-CIRCLE_RADIUS * ratio, 0).lineTo(CIRCLE_RADIUS * ratio, 0);
      this.addChild(new Path(minusShape, pathOptions));
    }
  }
}
chargesAndFields.register('ChargedParticleRepresentationNode', ChargedParticleRepresentationNode);
export default ChargedParticleRepresentationNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIkNpcmNsZSIsIk5vZGUiLCJQYXRoIiwiUmFkaWFsR3JhZGllbnQiLCJjaGFyZ2VzQW5kRmllbGRzIiwiQ2hhcmdlc0FuZEZpZWxkc0NvbnN0YW50cyIsIkNJUkNMRV9SQURJVVMiLCJDSEFSR0VfUkFESVVTIiwiQ2hhcmdlZFBhcnRpY2xlUmVwcmVzZW50YXRpb25Ob2RlIiwiY29uc3RydWN0b3IiLCJjaGFyZ2UiLCJvcHRpb25zIiwiYXNzZXJ0IiwiY2lyY2xlIiwiYWRkQ2hpbGQiLCJmaWxsIiwiYWRkQ29sb3JTdG9wIiwicmF0aW8iLCJwYXRoT3B0aW9ucyIsImNlbnRlclgiLCJjZW50ZXJZIiwibGluZVdpZHRoIiwic3Ryb2tlIiwicGlja2FibGUiLCJwbHVzU2hhcGUiLCJtb3ZlVG8iLCJsaW5lVG8iLCJtaW51c1NoYXBlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDaGFyZ2VkUGFydGljbGVSZXByZXNlbnRhdGlvbk5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyBmb3IgdGhlIGNoYXJnZWQgcGFydGljbGVcclxuICpcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlIChCZXJlYSBDb2xsZWdlKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBOb2RlLCBQYXRoLCBSYWRpYWxHcmFkaWVudCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBjaGFyZ2VzQW5kRmllbGRzIGZyb20gJy4uLy4uL2NoYXJnZXNBbmRGaWVsZHMuanMnO1xyXG5pbXBvcnQgQ2hhcmdlc0FuZEZpZWxkc0NvbnN0YW50cyBmcm9tICcuLi9DaGFyZ2VzQW5kRmllbGRzQ29uc3RhbnRzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBDSVJDTEVfUkFESVVTID0gQ2hhcmdlc0FuZEZpZWxkc0NvbnN0YW50cy5DSEFSR0VfUkFESVVTOyAvLyByYWRpdXMgb2YgYSBjaGFyZ2VkIHBhcnRpY2xlXHJcblxyXG5jbGFzcyBDaGFyZ2VkUGFydGljbGVSZXByZXNlbnRhdGlvbk5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0b3IgZm9yIHRoZSBzY2VuZXJ5IG5vZGUgb2YgdGhlIGNoYXJnZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNoYXJnZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBQYXNzZWQgdG8gTm9kZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjaGFyZ2UsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjaGFyZ2UgPT09IDEgfHwgY2hhcmdlID09PSAtMSwgJ0NoYXJnZXMgc2hvdWxkIGJlICsxIG9yIC0xJyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSBjaXJjbGUgdGhhdCByZXByZXNlbnRzIHRoZSBjaGFyZ2UgcGFydGljbGVcclxuICAgIGNvbnN0IGNpcmNsZSA9IG5ldyBDaXJjbGUoIENJUkNMRV9SQURJVVMgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNpcmNsZSApO1xyXG5cclxuICAgIGlmICggY2hhcmdlID09PSAxICkge1xyXG4gICAgICBjaXJjbGUuZmlsbCA9IG5ldyBSYWRpYWxHcmFkaWVudCggMCwgMCwgQ0lSQ0xFX1JBRElVUyAqIDAuMiwgMCwgMCwgQ0lSQ0xFX1JBRElVUyAqIDEgKVxyXG4gICAgICAgIC5hZGRDb2xvclN0b3AoIDAsICdyZ2IoMjU1LDQzLDc5KScgKSAvLyBtb3N0bHkgcmVkXHJcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMC41LCAncmdiKDI0NSwgNjAsIDQ0ICknIClcclxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAxLCAncmdiKDIzMiw5LDApJyApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIHRoZW4gaXQgbXVzdCBiZSBhIG5lZ2F0aXZlIGNoYXJnZVxyXG4gICAgICBjaXJjbGUuZmlsbCA9IG5ldyBSYWRpYWxHcmFkaWVudCggMCwgMCwgQ0lSQ0xFX1JBRElVUyAqIDAuMiwgMCwgMCwgQ0lSQ0xFX1JBRElVUyAqIDEgKVxyXG4gICAgICAgIC5hZGRDb2xvclN0b3AoIDAsICdyZ2IoNzksMjA3LDI1NSknICkgLy8gbW9zdGx5IGJsdWVcclxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjUsICdyZ2IoNDQsIDE5MCwgMjQ1KScgKVxyXG4gICAgICAgIC5hZGRDb2xvclN0b3AoIDEsICdyZ2IoMCwxNjksMjMyKScgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgYW5kIGFkZCBhIHBsdXMgb3IgbWludXMgc2lnbiBvbiB0aGUgY2VudGVyIG9mIHRoZSBjaXJjbGUgYmFzZWQgb24gdGhlIGNoYXJnZSBvZiB0aGUgcGFydGljbGVcclxuICAgIGNvbnN0IHJhdGlvID0gMC42OyAvLyByZWxhdGl2ZSBzaXplIG9mIHRoZSBzaWduIHNoYXBlIHJlbGF0aXZlIHRvIHRoZSByYWRpdXMgb2YgdGhlIENpcmNsZVxyXG4gICAgY29uc3QgcGF0aE9wdGlvbnMgPSB7IGNlbnRlclg6IDAsIGNlbnRlclk6IDAsIGxpbmVXaWR0aDogQ0lSQ0xFX1JBRElVUyAqIDAuMywgc3Ryb2tlOiAnd2hpdGUnLCBwaWNrYWJsZTogZmFsc2UgfTtcclxuICAgIGlmICggY2hhcmdlID09PSAxICkge1xyXG4gICAgICAvLyBwbHVzIFNoYXBlIHJlcHJlc2VudGluZyBhIHBvc2l0aXZlIGNoYXJnZVxyXG4gICAgICBjb25zdCBwbHVzU2hhcGUgPSBuZXcgU2hhcGUoKS5tb3ZlVG8oIC1DSVJDTEVfUkFESVVTICogcmF0aW8sIDAgKVxyXG4gICAgICAgIC5saW5lVG8oIENJUkNMRV9SQURJVVMgKiByYXRpbywgMCApXHJcbiAgICAgICAgLm1vdmVUbyggMCwgLUNJUkNMRV9SQURJVVMgKiByYXRpbyApXHJcbiAgICAgICAgLmxpbmVUbyggMCwgQ0lSQ0xFX1JBRElVUyAqIHJhdGlvICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBQYXRoKCBwbHVzU2hhcGUsIHBhdGhPcHRpb25zICkgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBtaW51cyBTaGFwZSByZXByZXNlbnRpbmcgYSBuZWdhdGl2ZSBjaGFyZ2VcclxuICAgICAgY29uc3QgbWludXNTaGFwZSA9IG5ldyBTaGFwZSgpLm1vdmVUbyggLUNJUkNMRV9SQURJVVMgKiByYXRpbywgMCApXHJcbiAgICAgICAgLmxpbmVUbyggQ0lSQ0xFX1JBRElVUyAqIHJhdGlvLCAwICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBQYXRoKCBtaW51c1NoYXBlLCBwYXRoT3B0aW9ucyApICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5jaGFyZ2VzQW5kRmllbGRzLnJlZ2lzdGVyKCAnQ2hhcmdlZFBhcnRpY2xlUmVwcmVzZW50YXRpb25Ob2RlJywgQ2hhcmdlZFBhcnRpY2xlUmVwcmVzZW50YXRpb25Ob2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IENoYXJnZWRQYXJ0aWNsZVJlcHJlc2VudGF0aW9uTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxTQUFTQyxNQUFNLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxjQUFjLFFBQVEsbUNBQW1DO0FBQ3RGLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyx5QkFBeUIsTUFBTSxpQ0FBaUM7O0FBRXZFO0FBQ0EsTUFBTUMsYUFBYSxHQUFHRCx5QkFBeUIsQ0FBQ0UsYUFBYSxDQUFDLENBQUM7O0FBRS9ELE1BQU1DLGlDQUFpQyxTQUFTUCxJQUFJLENBQUM7RUFFbkQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VRLFdBQVdBLENBQUVDLE1BQU0sRUFBRUMsT0FBTyxFQUFHO0lBRTdCLEtBQUssQ0FBRUEsT0FBUSxDQUFDO0lBRWhCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUYsTUFBTSxLQUFLLENBQUMsSUFBSUEsTUFBTSxLQUFLLENBQUMsQ0FBQyxFQUFFLDRCQUE2QixDQUFDOztJQUUvRTtJQUNBLE1BQU1HLE1BQU0sR0FBRyxJQUFJYixNQUFNLENBQUVNLGFBQWMsQ0FBQztJQUMxQyxJQUFJLENBQUNRLFFBQVEsQ0FBRUQsTUFBTyxDQUFDO0lBRXZCLElBQUtILE1BQU0sS0FBSyxDQUFDLEVBQUc7TUFDbEJHLE1BQU0sQ0FBQ0UsSUFBSSxHQUFHLElBQUlaLGNBQWMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFRyxhQUFhLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVBLGFBQWEsR0FBRyxDQUFFLENBQUMsQ0FDbkZVLFlBQVksQ0FBRSxDQUFDLEVBQUUsZ0JBQWlCLENBQUMsQ0FBQztNQUFBLENBQ3BDQSxZQUFZLENBQUUsR0FBRyxFQUFFLG1CQUFvQixDQUFDLENBQ3hDQSxZQUFZLENBQUUsQ0FBQyxFQUFFLGNBQWUsQ0FBQztJQUN0QyxDQUFDLE1BQ0k7TUFDSDtNQUNBSCxNQUFNLENBQUNFLElBQUksR0FBRyxJQUFJWixjQUFjLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRUcsYUFBYSxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFQSxhQUFhLEdBQUcsQ0FBRSxDQUFDLENBQ25GVSxZQUFZLENBQUUsQ0FBQyxFQUFFLGlCQUFrQixDQUFDLENBQUM7TUFBQSxDQUNyQ0EsWUFBWSxDQUFFLEdBQUcsRUFBRSxtQkFBb0IsQ0FBQyxDQUN4Q0EsWUFBWSxDQUFFLENBQUMsRUFBRSxnQkFBaUIsQ0FBQztJQUN4Qzs7SUFFQTtJQUNBLE1BQU1DLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNuQixNQUFNQyxXQUFXLEdBQUc7TUFBRUMsT0FBTyxFQUFFLENBQUM7TUFBRUMsT0FBTyxFQUFFLENBQUM7TUFBRUMsU0FBUyxFQUFFZixhQUFhLEdBQUcsR0FBRztNQUFFZ0IsTUFBTSxFQUFFLE9BQU87TUFBRUMsUUFBUSxFQUFFO0lBQU0sQ0FBQztJQUNoSCxJQUFLYixNQUFNLEtBQUssQ0FBQyxFQUFHO01BQ2xCO01BQ0EsTUFBTWMsU0FBUyxHQUFHLElBQUl6QixLQUFLLENBQUMsQ0FBQyxDQUFDMEIsTUFBTSxDQUFFLENBQUNuQixhQUFhLEdBQUdXLEtBQUssRUFBRSxDQUFFLENBQUMsQ0FDOURTLE1BQU0sQ0FBRXBCLGFBQWEsR0FBR1csS0FBSyxFQUFFLENBQUUsQ0FBQyxDQUNsQ1EsTUFBTSxDQUFFLENBQUMsRUFBRSxDQUFDbkIsYUFBYSxHQUFHVyxLQUFNLENBQUMsQ0FDbkNTLE1BQU0sQ0FBRSxDQUFDLEVBQUVwQixhQUFhLEdBQUdXLEtBQU0sQ0FBQztNQUNyQyxJQUFJLENBQUNILFFBQVEsQ0FBRSxJQUFJWixJQUFJLENBQUVzQixTQUFTLEVBQUVOLFdBQVksQ0FBRSxDQUFDO0lBQ3JELENBQUMsTUFDSTtNQUNIO01BQ0EsTUFBTVMsVUFBVSxHQUFHLElBQUk1QixLQUFLLENBQUMsQ0FBQyxDQUFDMEIsTUFBTSxDQUFFLENBQUNuQixhQUFhLEdBQUdXLEtBQUssRUFBRSxDQUFFLENBQUMsQ0FDL0RTLE1BQU0sQ0FBRXBCLGFBQWEsR0FBR1csS0FBSyxFQUFFLENBQUUsQ0FBQztNQUNyQyxJQUFJLENBQUNILFFBQVEsQ0FBRSxJQUFJWixJQUFJLENBQUV5QixVQUFVLEVBQUVULFdBQVksQ0FBRSxDQUFDO0lBQ3REO0VBQ0Y7QUFDRjtBQUVBZCxnQkFBZ0IsQ0FBQ3dCLFFBQVEsQ0FBRSxtQ0FBbUMsRUFBRXBCLGlDQUFrQyxDQUFDO0FBQ25HLGVBQWVBLGlDQUFpQyJ9