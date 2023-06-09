// Copyright 2022, University of Colorado Boulder

/**
 * XNode is a specialized view for displaying a 'x'. It is used throughout the sim to indicate the center of mass
 * of a system of Balls. Generalized to appear as a icon as well.
 *
 * XNode's rendering strategy is to sub-type PlusNode and rotate the Node 45 degrees.
 *
 * @author Brandon Li
 * @author Alex Schor
 */

import sceneryPhet from './sceneryPhet.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import PlusNode from './PlusNode.js';
import optionize from '../../phet-core/js/optionize.js';
export default class XNode extends PlusNode {
  constructor(providedOptions) {
    const options = optionize()({
      // XNodeOptions
      legThickness: 6,
      length: 22,
      // PlusNodeOptions
      lineWidth: 1.5
    }, providedOptions);
    options.size = new Dimension2(options.length, options.legThickness);
    options.rotation = Math.PI / 4;
    super(options);
  }
}
sceneryPhet.register('XNode', XNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzY2VuZXJ5UGhldCIsIkRpbWVuc2lvbjIiLCJQbHVzTm9kZSIsIm9wdGlvbml6ZSIsIlhOb2RlIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwibGVnVGhpY2tuZXNzIiwibGVuZ3RoIiwibGluZVdpZHRoIiwic2l6ZSIsInJvdGF0aW9uIiwiTWF0aCIsIlBJIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJYTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogWE5vZGUgaXMgYSBzcGVjaWFsaXplZCB2aWV3IGZvciBkaXNwbGF5aW5nIGEgJ3gnLiBJdCBpcyB1c2VkIHRocm91Z2hvdXQgdGhlIHNpbSB0byBpbmRpY2F0ZSB0aGUgY2VudGVyIG9mIG1hc3NcclxuICogb2YgYSBzeXN0ZW0gb2YgQmFsbHMuIEdlbmVyYWxpemVkIHRvIGFwcGVhciBhcyBhIGljb24gYXMgd2VsbC5cclxuICpcclxuICogWE5vZGUncyByZW5kZXJpbmcgc3RyYXRlZ3kgaXMgdG8gc3ViLXR5cGUgUGx1c05vZGUgYW5kIHJvdGF0ZSB0aGUgTm9kZSA0NSBkZWdyZWVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEJyYW5kb24gTGlcclxuICogQGF1dGhvciBBbGV4IFNjaG9yXHJcbiAqL1xyXG5cclxuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBQbHVzTm9kZSwgeyBQbHVzTm9kZU9wdGlvbnMgfSBmcm9tICcuL1BsdXNOb2RlLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuXHJcbiAgLy8gdGhpY2tuZXNzIG9mIHRoZSBsZWdzIG9mIHRoZSAneCdcclxuICBsZWdUaGlja25lc3M/OiBudW1iZXI7XHJcblxyXG4gIC8vIHRoZSBsZW5ndGggb2YgdGhlIGRpYWdvbmFsIG9mIHRoZSAneCcuXHJcbiAgbGVuZ3RoPzogbnVtYmVyO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgWE5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFBsdXNOb2RlT3B0aW9ucywgJ3NpemUnIHwgJ3JvdGF0aW9uJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBYTm9kZSBleHRlbmRzIFBsdXNOb2RlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBYTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxYTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBQbHVzTm9kZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFhOb2RlT3B0aW9uc1xyXG4gICAgICBsZWdUaGlja25lc3M6IDYsXHJcbiAgICAgIGxlbmd0aDogMjIsXHJcblxyXG4gICAgICAvLyBQbHVzTm9kZU9wdGlvbnNcclxuICAgICAgbGluZVdpZHRoOiAxLjVcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIG9wdGlvbnMuc2l6ZSA9IG5ldyBEaW1lbnNpb24yKCBvcHRpb25zLmxlbmd0aCwgb3B0aW9ucy5sZWdUaGlja25lc3MgKTtcclxuICAgIG9wdGlvbnMucm90YXRpb24gPSBNYXRoLlBJIC8gNDtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ1hOb2RlJywgWE5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0sa0JBQWtCO0FBQzFDLE9BQU9DLFVBQVUsTUFBTSw0QkFBNEI7QUFDbkQsT0FBT0MsUUFBUSxNQUEyQixlQUFlO0FBQ3pELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFjdkQsZUFBZSxNQUFNQyxLQUFLLFNBQVNGLFFBQVEsQ0FBQztFQUVuQ0csV0FBV0EsQ0FBRUMsZUFBOEIsRUFBRztJQUVuRCxNQUFNQyxPQUFPLEdBQUdKLFNBQVMsQ0FBNkMsQ0FBQyxDQUFFO01BRXZFO01BQ0FLLFlBQVksRUFBRSxDQUFDO01BQ2ZDLE1BQU0sRUFBRSxFQUFFO01BRVY7TUFDQUMsU0FBUyxFQUFFO0lBQ2IsQ0FBQyxFQUFFSixlQUFnQixDQUFDO0lBRXBCQyxPQUFPLENBQUNJLElBQUksR0FBRyxJQUFJVixVQUFVLENBQUVNLE9BQU8sQ0FBQ0UsTUFBTSxFQUFFRixPQUFPLENBQUNDLFlBQWEsQ0FBQztJQUNyRUQsT0FBTyxDQUFDSyxRQUFRLEdBQUdDLElBQUksQ0FBQ0MsRUFBRSxHQUFHLENBQUM7SUFFOUIsS0FBSyxDQUFFUCxPQUFRLENBQUM7RUFDbEI7QUFDRjtBQUNBUCxXQUFXLENBQUNlLFFBQVEsQ0FBRSxPQUFPLEVBQUVYLEtBQU0sQ0FBQyJ9