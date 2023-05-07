// Copyright 2018-2022, University of Colorado Boulder

/**
 * Appears above the lattice and shows the scale, like this:
 * |<------>| 500 nm
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Line, Node } from '../../../../scenery/js/imports.js';
import waveInterference from '../../waveInterference.js';
import WaveInterferenceConstants from '../WaveInterferenceConstants.js';
import WaveInterferenceText from './WaveInterferenceText.js';
class LengthScaleIndicatorNode extends Node {
  /**
   * @param width - width of the indicator
   * @param string - text to display to the right of the indicator
   * @param [options]
   */
  constructor(width, string, options) {
    const text = new WaveInterferenceText(string, {
      font: WaveInterferenceConstants.TIME_AND_LENGTH_SCALE_INDICATOR_FONT
    });
    const createBar = centerX => new Line(0, 0, 0, text.height, {
      stroke: 'black',
      centerX: centerX
    });
    const leftBar = createBar(-width / 2);
    const rightBar = createBar(width / 2);
    const arrowNode = new ArrowNode(leftBar.right + 1, leftBar.centerY, rightBar.left - 1, rightBar.centerY, {
      doubleHead: true,
      headHeight: 5,
      headWidth: 5,
      tailWidth: 2
    });
    text.leftCenter = rightBar.rightCenter.plusXY(5, 0);
    super(merge({
      children: [arrowNode, leftBar, rightBar, text]
    }, options));
  }
}
waveInterference.register('LengthScaleIndicatorNode', LengthScaleIndicatorNode);
export default LengthScaleIndicatorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkFycm93Tm9kZSIsIkxpbmUiLCJOb2RlIiwid2F2ZUludGVyZmVyZW5jZSIsIldhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMiLCJXYXZlSW50ZXJmZXJlbmNlVGV4dCIsIkxlbmd0aFNjYWxlSW5kaWNhdG9yTm9kZSIsImNvbnN0cnVjdG9yIiwid2lkdGgiLCJzdHJpbmciLCJvcHRpb25zIiwidGV4dCIsImZvbnQiLCJUSU1FX0FORF9MRU5HVEhfU0NBTEVfSU5ESUNBVE9SX0ZPTlQiLCJjcmVhdGVCYXIiLCJjZW50ZXJYIiwiaGVpZ2h0Iiwic3Ryb2tlIiwibGVmdEJhciIsInJpZ2h0QmFyIiwiYXJyb3dOb2RlIiwicmlnaHQiLCJjZW50ZXJZIiwibGVmdCIsImRvdWJsZUhlYWQiLCJoZWFkSGVpZ2h0IiwiaGVhZFdpZHRoIiwidGFpbFdpZHRoIiwibGVmdENlbnRlciIsInJpZ2h0Q2VudGVyIiwicGx1c1hZIiwiY2hpbGRyZW4iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxlbmd0aFNjYWxlSW5kaWNhdG9yTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBcHBlYXJzIGFib3ZlIHRoZSBsYXR0aWNlIGFuZCBzaG93cyB0aGUgc2NhbGUsIGxpa2UgdGhpczpcclxuICogfDwtLS0tLS0+fCA1MDAgbm1cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEFycm93Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvQXJyb3dOb2RlLmpzJztcclxuaW1wb3J0IHsgTGluZSwgTm9kZSwgTm9kZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgd2F2ZUludGVyZmVyZW5jZSBmcm9tICcuLi8uLi93YXZlSW50ZXJmZXJlbmNlLmpzJztcclxuaW1wb3J0IFdhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMgZnJvbSAnLi4vV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBXYXZlSW50ZXJmZXJlbmNlVGV4dCBmcm9tICcuL1dhdmVJbnRlcmZlcmVuY2VUZXh0LmpzJztcclxuXHJcbmNsYXNzIExlbmd0aFNjYWxlSW5kaWNhdG9yTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gd2lkdGggLSB3aWR0aCBvZiB0aGUgaW5kaWNhdG9yXHJcbiAgICogQHBhcmFtIHN0cmluZyAtIHRleHQgdG8gZGlzcGxheSB0byB0aGUgcmlnaHQgb2YgdGhlIGluZGljYXRvclxyXG4gICAqIEBwYXJhbSBbb3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHdpZHRoOiBudW1iZXIsIHN0cmluZzogc3RyaW5nLCBvcHRpb25zPzogTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3QgdGV4dCA9IG5ldyBXYXZlSW50ZXJmZXJlbmNlVGV4dCggc3RyaW5nLCB7XHJcbiAgICAgIGZvbnQ6IFdhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMuVElNRV9BTkRfTEVOR1RIX1NDQUxFX0lORElDQVRPUl9GT05UXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY3JlYXRlQmFyID0gKCBjZW50ZXJYOiBudW1iZXIgKSA9PiBuZXcgTGluZSggMCwgMCwgMCwgdGV4dC5oZWlnaHQsIHsgc3Ryb2tlOiAnYmxhY2snLCBjZW50ZXJYOiBjZW50ZXJYIH0gKTtcclxuICAgIGNvbnN0IGxlZnRCYXIgPSBjcmVhdGVCYXIoIC13aWR0aCAvIDIgKTtcclxuICAgIGNvbnN0IHJpZ2h0QmFyID0gY3JlYXRlQmFyKCB3aWR0aCAvIDIgKTtcclxuICAgIGNvbnN0IGFycm93Tm9kZSA9IG5ldyBBcnJvd05vZGUoIGxlZnRCYXIucmlnaHQgKyAxLCBsZWZ0QmFyLmNlbnRlclksIHJpZ2h0QmFyLmxlZnQgLSAxLCByaWdodEJhci5jZW50ZXJZLCB7XHJcbiAgICAgIGRvdWJsZUhlYWQ6IHRydWUsXHJcbiAgICAgIGhlYWRIZWlnaHQ6IDUsXHJcbiAgICAgIGhlYWRXaWR0aDogNSxcclxuICAgICAgdGFpbFdpZHRoOiAyXHJcbiAgICB9ICk7XHJcbiAgICB0ZXh0LmxlZnRDZW50ZXIgPSByaWdodEJhci5yaWdodENlbnRlci5wbHVzWFkoIDUsIDAgKTtcclxuXHJcbiAgICBzdXBlciggbWVyZ2UoIHtcclxuICAgICAgY2hpbGRyZW46IFsgYXJyb3dOb2RlLCBsZWZ0QmFyLCByaWdodEJhciwgdGV4dCBdXHJcbiAgICB9LCBvcHRpb25zICkgKTtcclxuICB9XHJcbn1cclxuXHJcbndhdmVJbnRlcmZlcmVuY2UucmVnaXN0ZXIoICdMZW5ndGhTY2FsZUluZGljYXRvck5vZGUnLCBMZW5ndGhTY2FsZUluZGljYXRvck5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgTGVuZ3RoU2NhbGVJbmRpY2F0b3JOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQUNoRSxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBcUIsbUNBQW1DO0FBQzNFLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyx5QkFBeUIsTUFBTSxpQ0FBaUM7QUFDdkUsT0FBT0Msb0JBQW9CLE1BQU0sMkJBQTJCO0FBRTVELE1BQU1DLHdCQUF3QixTQUFTSixJQUFJLENBQUM7RUFFMUM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNTSyxXQUFXQSxDQUFFQyxLQUFhLEVBQUVDLE1BQWMsRUFBRUMsT0FBcUIsRUFBRztJQUV6RSxNQUFNQyxJQUFJLEdBQUcsSUFBSU4sb0JBQW9CLENBQUVJLE1BQU0sRUFBRTtNQUM3Q0csSUFBSSxFQUFFUix5QkFBeUIsQ0FBQ1M7SUFDbEMsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsU0FBUyxHQUFLQyxPQUFlLElBQU0sSUFBSWQsSUFBSSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFVSxJQUFJLENBQUNLLE1BQU0sRUFBRTtNQUFFQyxNQUFNLEVBQUUsT0FBTztNQUFFRixPQUFPLEVBQUVBO0lBQVEsQ0FBRSxDQUFDO0lBQ2hILE1BQU1HLE9BQU8sR0FBR0osU0FBUyxDQUFFLENBQUNOLEtBQUssR0FBRyxDQUFFLENBQUM7SUFDdkMsTUFBTVcsUUFBUSxHQUFHTCxTQUFTLENBQUVOLEtBQUssR0FBRyxDQUFFLENBQUM7SUFDdkMsTUFBTVksU0FBUyxHQUFHLElBQUlwQixTQUFTLENBQUVrQixPQUFPLENBQUNHLEtBQUssR0FBRyxDQUFDLEVBQUVILE9BQU8sQ0FBQ0ksT0FBTyxFQUFFSCxRQUFRLENBQUNJLElBQUksR0FBRyxDQUFDLEVBQUVKLFFBQVEsQ0FBQ0csT0FBTyxFQUFFO01BQ3hHRSxVQUFVLEVBQUUsSUFBSTtNQUNoQkMsVUFBVSxFQUFFLENBQUM7TUFDYkMsU0FBUyxFQUFFLENBQUM7TUFDWkMsU0FBUyxFQUFFO0lBQ2IsQ0FBRSxDQUFDO0lBQ0hoQixJQUFJLENBQUNpQixVQUFVLEdBQUdULFFBQVEsQ0FBQ1UsV0FBVyxDQUFDQyxNQUFNLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztJQUVyRCxLQUFLLENBQUUvQixLQUFLLENBQUU7TUFDWmdDLFFBQVEsRUFBRSxDQUFFWCxTQUFTLEVBQUVGLE9BQU8sRUFBRUMsUUFBUSxFQUFFUixJQUFJO0lBQ2hELENBQUMsRUFBRUQsT0FBUSxDQUFFLENBQUM7RUFDaEI7QUFDRjtBQUVBUCxnQkFBZ0IsQ0FBQzZCLFFBQVEsQ0FBRSwwQkFBMEIsRUFBRTFCLHdCQUF5QixDQUFDO0FBQ2pGLGVBQWVBLHdCQUF3QiJ9