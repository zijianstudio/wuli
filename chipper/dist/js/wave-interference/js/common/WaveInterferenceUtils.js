// Copyright 2018-2022, University of Colorado Boulder

/**
 * Utilities for Wave Interference
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Utils from '../../../dot/js/Utils.js';
import { Shape } from '../../../kite/js/imports.js';
import waveInterference from '../waveInterference.js';
import WaveInterferenceConstants from './WaveInterferenceConstants.js';

// constants
const CELL_WIDTH = WaveInterferenceConstants.CELL_WIDTH;
const POINT_SOURCE = WaveInterferenceConstants.POINT_SOURCE_HORIZONTAL_COORDINATE - WaveInterferenceConstants.LATTICE_PADDING;
class WaveInterferenceUtils {
  /**
   * Gets a Shape representing the top of the water in water side view from left to right, also used for the chart.
   * @param array - reused to avoid allocations
   * @param lattice
   * @param waveAreaBounds
   * @param dx
   * @param dy
   */
  static getWaterSideShape(array, lattice, waveAreaBounds, dx, dy) {
    lattice.getCenterLineValues(array);
    const shape = new Shape();
    for (let i = 0; i < array.length; i++) {
      const value = i === POINT_SOURCE ? (array[i] + 3 * array[i - 1] + 3 * array[i + 1]) / 7 : array[i];

      // Map the center of the cell to the same point on the graph,
      // see https://github.com/phetsims/wave-interference/issues/143
      const x = Utils.linear(-0.5, array.length - 1 + 0.5, waveAreaBounds.left, waveAreaBounds.right, i) + dx;
      const y = WaveInterferenceUtils.getWaterSideY(waveAreaBounds, value) + dy;
      shape.lineTo(x, y);
    }
    return shape;
  }

  /**
   * Finds the y-value at a specific point on the side wave.  This is used to see if a water drop has entered the
   * water in the side view.
   * @param waveAreaBounds
   * @param waveValue
   */
  static getWaterSideY(waveAreaBounds, waveValue) {
    // Typical values for the propagating wave can be between -5 and 5 (though values can exceed this range very close
    // to the oscillating cell.  We choose to map a value of 0 to the center of the wave area, and the max (5) to the
    // desired distance amplitude.  A wave value of 0 appears in the center of the wave area. A value of 5 appears 47
    // screen view coordinates above the center line.  This was tuned to prevent the water from going higher than the
    // faucet.
    return Utils.linear(0, 5, waveAreaBounds.centerY, waveAreaBounds.centerY - 47, waveValue);
  }

  /**
   * Gets the bounds to use for a canvas, in view coordinates
   */
  static getCanvasBounds(lattice) {
    return new Bounds2(0, 0, (lattice.width - lattice.dampX * 2) * CELL_WIDTH, (lattice.height - lattice.dampY * 2) * CELL_WIDTH);
  }

  /**
   * Convert a value to femto.
   */
  static toFemto(value) {
    return value * WaveInterferenceConstants.FEMTO;
  }

  /**
   * Convert a value from femto.
   */
  static fromFemto(value) {
    return value / WaveInterferenceConstants.FEMTO;
  }

  /**
   * At the default size, the text should "nestle" into the slider.  But when the text is too small, it must be spaced
   * further away.  See https://github.com/phetsims/wave-interference/issues/194
   */
  static getSliderTitleSpacing(titleNode) {
    const tallTextHeight = 17;
    const shortTextHeight = 4;
    const tallTextSpacing = -2;
    const shortTextSpacing = 5;
    return Utils.linear(tallTextHeight, shortTextHeight, tallTextSpacing, shortTextSpacing, titleNode.height);
  }
}
waveInterference.register('WaveInterferenceUtils', WaveInterferenceUtils);
export default WaveInterferenceUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVXRpbHMiLCJTaGFwZSIsIndhdmVJbnRlcmZlcmVuY2UiLCJXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzIiwiQ0VMTF9XSURUSCIsIlBPSU5UX1NPVVJDRSIsIlBPSU5UX1NPVVJDRV9IT1JJWk9OVEFMX0NPT1JESU5BVEUiLCJMQVRUSUNFX1BBRERJTkciLCJXYXZlSW50ZXJmZXJlbmNlVXRpbHMiLCJnZXRXYXRlclNpZGVTaGFwZSIsImFycmF5IiwibGF0dGljZSIsIndhdmVBcmVhQm91bmRzIiwiZHgiLCJkeSIsImdldENlbnRlckxpbmVWYWx1ZXMiLCJzaGFwZSIsImkiLCJsZW5ndGgiLCJ2YWx1ZSIsIngiLCJsaW5lYXIiLCJsZWZ0IiwicmlnaHQiLCJ5IiwiZ2V0V2F0ZXJTaWRlWSIsImxpbmVUbyIsIndhdmVWYWx1ZSIsImNlbnRlclkiLCJnZXRDYW52YXNCb3VuZHMiLCJ3aWR0aCIsImRhbXBYIiwiaGVpZ2h0IiwiZGFtcFkiLCJ0b0ZlbXRvIiwiRkVNVE8iLCJmcm9tRmVtdG8iLCJnZXRTbGlkZXJUaXRsZVNwYWNpbmciLCJ0aXRsZU5vZGUiLCJ0YWxsVGV4dEhlaWdodCIsInNob3J0VGV4dEhlaWdodCIsInRhbGxUZXh0U3BhY2luZyIsInNob3J0VGV4dFNwYWNpbmciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIldhdmVJbnRlcmZlcmVuY2VVdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBVdGlsaXRpZXMgZm9yIFdhdmUgSW50ZXJmZXJlbmNlXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHdhdmVJbnRlcmZlcmVuY2UgZnJvbSAnLi4vd2F2ZUludGVyZmVyZW5jZS5qcyc7XHJcbmltcG9ydCBMYXR0aWNlIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9MYXR0aWNlLmpzJztcclxuaW1wb3J0IFdhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMgZnJvbSAnLi9XYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBDRUxMX1dJRFRIID0gV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5DRUxMX1dJRFRIO1xyXG5jb25zdCBQT0lOVF9TT1VSQ0UgPSBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLlBPSU5UX1NPVVJDRV9IT1JJWk9OVEFMX0NPT1JESU5BVEUgLVxyXG4gICAgICAgICAgICAgICAgICAgICBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLkxBVFRJQ0VfUEFERElORztcclxuXHJcbmNsYXNzIFdhdmVJbnRlcmZlcmVuY2VVdGlscyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgYSBTaGFwZSByZXByZXNlbnRpbmcgdGhlIHRvcCBvZiB0aGUgd2F0ZXIgaW4gd2F0ZXIgc2lkZSB2aWV3IGZyb20gbGVmdCB0byByaWdodCwgYWxzbyB1c2VkIGZvciB0aGUgY2hhcnQuXHJcbiAgICogQHBhcmFtIGFycmF5IC0gcmV1c2VkIHRvIGF2b2lkIGFsbG9jYXRpb25zXHJcbiAgICogQHBhcmFtIGxhdHRpY2VcclxuICAgKiBAcGFyYW0gd2F2ZUFyZWFCb3VuZHNcclxuICAgKiBAcGFyYW0gZHhcclxuICAgKiBAcGFyYW0gZHlcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGdldFdhdGVyU2lkZVNoYXBlKCBhcnJheTogbnVtYmVyW10sIGxhdHRpY2U6IExhdHRpY2UsIHdhdmVBcmVhQm91bmRzOiBCb3VuZHMyLCBkeDogbnVtYmVyLCBkeTogbnVtYmVyICk6IFNoYXBlIHtcclxuICAgIGxhdHRpY2UuZ2V0Q2VudGVyTGluZVZhbHVlcyggYXJyYXkgKTtcclxuICAgIGNvbnN0IHNoYXBlID0gbmV3IFNoYXBlKCk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHZhbHVlID0gKCBpID09PSBQT0lOVF9TT1VSQ0UgKSA/ICggYXJyYXlbIGkgXSArIDMgKiBhcnJheVsgaSAtIDEgXSArIDMgKiBhcnJheVsgaSArIDEgXSApIC8gNyA6XHJcbiAgICAgICAgICAgICAgICAgICAgYXJyYXlbIGkgXTtcclxuXHJcbiAgICAgIC8vIE1hcCB0aGUgY2VudGVyIG9mIHRoZSBjZWxsIHRvIHRoZSBzYW1lIHBvaW50IG9uIHRoZSBncmFwaCxcclxuICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy93YXZlLWludGVyZmVyZW5jZS9pc3N1ZXMvMTQzXHJcbiAgICAgIGNvbnN0IHggPSBVdGlscy5saW5lYXIoIC0wLjUsIGFycmF5Lmxlbmd0aCAtIDEgKyAwLjUsIHdhdmVBcmVhQm91bmRzLmxlZnQsIHdhdmVBcmVhQm91bmRzLnJpZ2h0LCBpICkgKyBkeDtcclxuICAgICAgY29uc3QgeSA9IFdhdmVJbnRlcmZlcmVuY2VVdGlscy5nZXRXYXRlclNpZGVZKCB3YXZlQXJlYUJvdW5kcywgdmFsdWUgKSArIGR5O1xyXG4gICAgICBzaGFwZS5saW5lVG8oIHgsIHkgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBzaGFwZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmRzIHRoZSB5LXZhbHVlIGF0IGEgc3BlY2lmaWMgcG9pbnQgb24gdGhlIHNpZGUgd2F2ZS4gIFRoaXMgaXMgdXNlZCB0byBzZWUgaWYgYSB3YXRlciBkcm9wIGhhcyBlbnRlcmVkIHRoZVxyXG4gICAqIHdhdGVyIGluIHRoZSBzaWRlIHZpZXcuXHJcbiAgICogQHBhcmFtIHdhdmVBcmVhQm91bmRzXHJcbiAgICogQHBhcmFtIHdhdmVWYWx1ZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgZ2V0V2F0ZXJTaWRlWSggd2F2ZUFyZWFCb3VuZHM6IEJvdW5kczIsIHdhdmVWYWx1ZTogbnVtYmVyICk6IG51bWJlciB7XHJcblxyXG4gICAgLy8gVHlwaWNhbCB2YWx1ZXMgZm9yIHRoZSBwcm9wYWdhdGluZyB3YXZlIGNhbiBiZSBiZXR3ZWVuIC01IGFuZCA1ICh0aG91Z2ggdmFsdWVzIGNhbiBleGNlZWQgdGhpcyByYW5nZSB2ZXJ5IGNsb3NlXHJcbiAgICAvLyB0byB0aGUgb3NjaWxsYXRpbmcgY2VsbC4gIFdlIGNob29zZSB0byBtYXAgYSB2YWx1ZSBvZiAwIHRvIHRoZSBjZW50ZXIgb2YgdGhlIHdhdmUgYXJlYSwgYW5kIHRoZSBtYXggKDUpIHRvIHRoZVxyXG4gICAgLy8gZGVzaXJlZCBkaXN0YW5jZSBhbXBsaXR1ZGUuICBBIHdhdmUgdmFsdWUgb2YgMCBhcHBlYXJzIGluIHRoZSBjZW50ZXIgb2YgdGhlIHdhdmUgYXJlYS4gQSB2YWx1ZSBvZiA1IGFwcGVhcnMgNDdcclxuICAgIC8vIHNjcmVlbiB2aWV3IGNvb3JkaW5hdGVzIGFib3ZlIHRoZSBjZW50ZXIgbGluZS4gIFRoaXMgd2FzIHR1bmVkIHRvIHByZXZlbnQgdGhlIHdhdGVyIGZyb20gZ29pbmcgaGlnaGVyIHRoYW4gdGhlXHJcbiAgICAvLyBmYXVjZXQuXHJcbiAgICByZXR1cm4gVXRpbHMubGluZWFyKCAwLCA1LCB3YXZlQXJlYUJvdW5kcy5jZW50ZXJZLCB3YXZlQXJlYUJvdW5kcy5jZW50ZXJZIC0gNDcsIHdhdmVWYWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgYm91bmRzIHRvIHVzZSBmb3IgYSBjYW52YXMsIGluIHZpZXcgY29vcmRpbmF0ZXNcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGdldENhbnZhc0JvdW5kcyggbGF0dGljZTogTGF0dGljZSApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiBuZXcgQm91bmRzMihcclxuICAgICAgMCwgMCxcclxuICAgICAgKCBsYXR0aWNlLndpZHRoIC0gbGF0dGljZS5kYW1wWCAqIDIgKSAqIENFTExfV0lEVEgsICggbGF0dGljZS5oZWlnaHQgLSBsYXR0aWNlLmRhbXBZICogMiApICogQ0VMTF9XSURUSFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnQgYSB2YWx1ZSB0byBmZW10by5cclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyB0b0ZlbXRvKCB2YWx1ZTogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdmFsdWUgKiBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLkZFTVRPO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCBhIHZhbHVlIGZyb20gZmVtdG8uXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBmcm9tRmVtdG8oIHZhbHVlOiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB2YWx1ZSAvIFdhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMuRkVNVE87XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBdCB0aGUgZGVmYXVsdCBzaXplLCB0aGUgdGV4dCBzaG91bGQgXCJuZXN0bGVcIiBpbnRvIHRoZSBzbGlkZXIuICBCdXQgd2hlbiB0aGUgdGV4dCBpcyB0b28gc21hbGwsIGl0IG11c3QgYmUgc3BhY2VkXHJcbiAgICogZnVydGhlciBhd2F5LiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy93YXZlLWludGVyZmVyZW5jZS9pc3N1ZXMvMTk0XHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBnZXRTbGlkZXJUaXRsZVNwYWNpbmcoIHRpdGxlTm9kZTogTm9kZSApOiBudW1iZXIge1xyXG5cclxuICAgIGNvbnN0IHRhbGxUZXh0SGVpZ2h0ID0gMTc7XHJcbiAgICBjb25zdCBzaG9ydFRleHRIZWlnaHQgPSA0O1xyXG5cclxuICAgIGNvbnN0IHRhbGxUZXh0U3BhY2luZyA9IC0yO1xyXG4gICAgY29uc3Qgc2hvcnRUZXh0U3BhY2luZyA9IDU7XHJcblxyXG4gICAgcmV0dXJuIFV0aWxzLmxpbmVhciggdGFsbFRleHRIZWlnaHQsIHNob3J0VGV4dEhlaWdodCwgdGFsbFRleHRTcGFjaW5nLCBzaG9ydFRleHRTcGFjaW5nLCB0aXRsZU5vZGUuaGVpZ2h0ICk7XHJcbiAgfVxyXG59XHJcblxyXG53YXZlSW50ZXJmZXJlbmNlLnJlZ2lzdGVyKCAnV2F2ZUludGVyZmVyZW5jZVV0aWxzJywgV2F2ZUludGVyZmVyZW5jZVV0aWxzICk7XHJcbmV4cG9ydCBkZWZhdWx0IFdhdmVJbnRlcmZlcmVuY2VVdGlsczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxLQUFLLE1BQU0sMEJBQTBCO0FBQzVDLFNBQVNDLEtBQUssUUFBUSw2QkFBNkI7QUFFbkQsT0FBT0MsZ0JBQWdCLE1BQU0sd0JBQXdCO0FBRXJELE9BQU9DLHlCQUF5QixNQUFNLGdDQUFnQzs7QUFFdEU7QUFDQSxNQUFNQyxVQUFVLEdBQUdELHlCQUF5QixDQUFDQyxVQUFVO0FBQ3ZELE1BQU1DLFlBQVksR0FBR0YseUJBQXlCLENBQUNHLGtDQUFrQyxHQUM1REgseUJBQXlCLENBQUNJLGVBQWU7QUFFOUQsTUFBTUMscUJBQXFCLENBQUM7RUFFMUI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQWNDLGlCQUFpQkEsQ0FBRUMsS0FBZSxFQUFFQyxPQUFnQixFQUFFQyxjQUF1QixFQUFFQyxFQUFVLEVBQUVDLEVBQVUsRUFBVTtJQUMzSEgsT0FBTyxDQUFD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