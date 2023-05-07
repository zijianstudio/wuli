// Copyright 2019-2022, University of Colorado Boulder

/**
 * IntervalLinesNode renders the horizontal lines that appear at equally-spaced intervals based on a histogram's
 * y-axis scale.  These lines are intended to cue the student about the relative scale of the y-axis.  More lines
 * means a larger value for 'Number of Particles'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Path } from '../../../../scenery/js/imports.js';
import GasPropertiesConstants from '../../common/GasPropertiesConstants.js';
import gasProperties from '../../gasProperties.js';
export default class IntervalLinesNode extends Path {
  constructor(chartSize) {
    super(new Shape(), {
      stroke: 'white',
      opacity: 0.5,
      lineWidth: 0.5
    });
    this.chartSize = chartSize;
    this.shapeBounds = new Bounds2(0, 0, chartSize.width, chartSize.height);
    this.previousMaxY = null;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }

  /**
   * Updates the lines to match the current y scale.
   */
  update(maxY) {
    if (this.previousMaxY === null || this.previousMaxY !== maxY) {
      const shape = new Shape();
      const numberOfLines = Math.floor(maxY / GasPropertiesConstants.HISTOGRAM_LINE_SPACING);
      const ySpacing = GasPropertiesConstants.HISTOGRAM_LINE_SPACING / maxY * this.chartSize.height;
      for (let i = 1; i <= numberOfLines; i++) {
        const y = this.chartSize.height - i * ySpacing;
        shape.moveTo(0, y).lineTo(this.chartSize.width, y);
      }
      this.shape = shape;
      this.previousMaxY = maxY;
    }
  }

  /**
   * Always use the full chart bounds, as a performance optimization.
   * See https://github.com/phetsims/gas-properties/issues/146
   */
  computeShapeBounds() {
    return this.shapeBounds;
  }
}
gasProperties.register('IntervalLinesNode', IntervalLinesNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiU2hhcGUiLCJQYXRoIiwiR2FzUHJvcGVydGllc0NvbnN0YW50cyIsImdhc1Byb3BlcnRpZXMiLCJJbnRlcnZhbExpbmVzTm9kZSIsImNvbnN0cnVjdG9yIiwiY2hhcnRTaXplIiwic3Ryb2tlIiwib3BhY2l0eSIsImxpbmVXaWR0aCIsInNoYXBlQm91bmRzIiwid2lkdGgiLCJoZWlnaHQiLCJwcmV2aW91c01heFkiLCJkaXNwb3NlIiwiYXNzZXJ0IiwidXBkYXRlIiwibWF4WSIsInNoYXBlIiwibnVtYmVyT2ZMaW5lcyIsIk1hdGgiLCJmbG9vciIsIkhJU1RPR1JBTV9MSU5FX1NQQUNJTkciLCJ5U3BhY2luZyIsImkiLCJ5IiwibW92ZVRvIiwibGluZVRvIiwiY29tcHV0ZVNoYXBlQm91bmRzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbnRlcnZhbExpbmVzTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBJbnRlcnZhbExpbmVzTm9kZSByZW5kZXJzIHRoZSBob3Jpem9udGFsIGxpbmVzIHRoYXQgYXBwZWFyIGF0IGVxdWFsbHktc3BhY2VkIGludGVydmFscyBiYXNlZCBvbiBhIGhpc3RvZ3JhbSdzXHJcbiAqIHktYXhpcyBzY2FsZS4gIFRoZXNlIGxpbmVzIGFyZSBpbnRlbmRlZCB0byBjdWUgdGhlIHN0dWRlbnQgYWJvdXQgdGhlIHJlbGF0aXZlIHNjYWxlIG9mIHRoZSB5LWF4aXMuICBNb3JlIGxpbmVzXHJcbiAqIG1lYW5zIGEgbGFyZ2VyIHZhbHVlIGZvciAnTnVtYmVyIG9mIFBhcnRpY2xlcycuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHsgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBHYXNQcm9wZXJ0aWVzQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9HYXNQcm9wZXJ0aWVzQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IGdhc1Byb3BlcnRpZXMgZnJvbSAnLi4vLi4vZ2FzUHJvcGVydGllcy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlcnZhbExpbmVzTm9kZSBleHRlbmRzIFBhdGgge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGNoYXJ0U2l6ZTogRGltZW5zaW9uMjtcclxuICBwcml2YXRlIHJlYWRvbmx5IHNoYXBlQm91bmRzOiBCb3VuZHMyO1xyXG4gIHByaXZhdGUgcHJldmlvdXNNYXhZOiBudW1iZXIgfCBudWxsO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNoYXJ0U2l6ZTogRGltZW5zaW9uMiApIHtcclxuXHJcbiAgICBzdXBlciggbmV3IFNoYXBlKCksIHtcclxuICAgICAgc3Ryb2tlOiAnd2hpdGUnLFxyXG4gICAgICBvcGFjaXR5OiAwLjUsXHJcbiAgICAgIGxpbmVXaWR0aDogMC41XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5jaGFydFNpemUgPSBjaGFydFNpemU7XHJcbiAgICB0aGlzLnNoYXBlQm91bmRzID0gbmV3IEJvdW5kczIoIDAsIDAsIGNoYXJ0U2l6ZS53aWR0aCwgY2hhcnRTaXplLmhlaWdodCApO1xyXG4gICAgdGhpcy5wcmV2aW91c01heFkgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIGxpbmVzIHRvIG1hdGNoIHRoZSBjdXJyZW50IHkgc2NhbGUuXHJcbiAgICovXHJcbiAgcHVibGljIHVwZGF0ZSggbWF4WTogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLnByZXZpb3VzTWF4WSA9PT0gbnVsbCB8fCB0aGlzLnByZXZpb3VzTWF4WSAhPT0gbWF4WSApIHtcclxuXHJcbiAgICAgIGNvbnN0IHNoYXBlID0gbmV3IFNoYXBlKCk7XHJcblxyXG4gICAgICBjb25zdCBudW1iZXJPZkxpbmVzID0gTWF0aC5mbG9vciggbWF4WSAvIEdhc1Byb3BlcnRpZXNDb25zdGFudHMuSElTVE9HUkFNX0xJTkVfU1BBQ0lORyApO1xyXG4gICAgICBjb25zdCB5U3BhY2luZyA9ICggR2FzUHJvcGVydGllc0NvbnN0YW50cy5ISVNUT0dSQU1fTElORV9TUEFDSU5HIC8gbWF4WSApICogdGhpcy5jaGFydFNpemUuaGVpZ2h0O1xyXG5cclxuICAgICAgZm9yICggbGV0IGkgPSAxOyBpIDw9IG51bWJlck9mTGluZXM7IGkrKyApIHtcclxuICAgICAgICBjb25zdCB5ID0gdGhpcy5jaGFydFNpemUuaGVpZ2h0IC0gKCBpICogeVNwYWNpbmcgKTtcclxuICAgICAgICBzaGFwZS5tb3ZlVG8oIDAsIHkgKS5saW5lVG8oIHRoaXMuY2hhcnRTaXplLndpZHRoLCB5ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcclxuXHJcbiAgICAgIHRoaXMucHJldmlvdXNNYXhZID0gbWF4WTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFsd2F5cyB1c2UgdGhlIGZ1bGwgY2hhcnQgYm91bmRzLCBhcyBhIHBlcmZvcm1hbmNlIG9wdGltaXphdGlvbi5cclxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dhcy1wcm9wZXJ0aWVzL2lzc3Vlcy8xNDZcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgY29tcHV0ZVNoYXBlQm91bmRzKCk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMuc2hhcGVCb3VuZHM7XHJcbiAgfVxyXG59XHJcblxyXG5nYXNQcm9wZXJ0aWVzLnJlZ2lzdGVyKCAnSW50ZXJ2YWxMaW5lc05vZGUnLCBJbnRlcnZhbExpbmVzTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUVuRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELFNBQVNDLElBQUksUUFBUSxtQ0FBbUM7QUFDeEQsT0FBT0Msc0JBQXNCLE1BQU0sd0NBQXdDO0FBQzNFLE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFFbEQsZUFBZSxNQUFNQyxpQkFBaUIsU0FBU0gsSUFBSSxDQUFDO0VBTTNDSSxXQUFXQSxDQUFFQyxTQUFxQixFQUFHO0lBRTFDLEtBQUssQ0FBRSxJQUFJTixLQUFLLENBQUMsQ0FBQyxFQUFFO01BQ2xCTyxNQUFNLEVBQUUsT0FBTztNQUNmQyxPQUFPLEVBQUUsR0FBRztNQUNaQyxTQUFTLEVBQUU7SUFDYixDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNILFNBQVMsR0FBR0EsU0FBUztJQUMxQixJQUFJLENBQUNJLFdBQVcsR0FBRyxJQUFJWCxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRU8sU0FBUyxDQUFDSyxLQUFLLEVBQUVMLFNBQVMsQ0FBQ00sTUFBTyxDQUFDO0lBQ3pFLElBQUksQ0FBQ0MsWUFBWSxHQUFHLElBQUk7RUFDMUI7RUFFZ0JDLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7O0VBRUE7QUFDRjtBQUNBO0VBQ1NFLE1BQU1BLENBQUVDLElBQVksRUFBUztJQUNsQyxJQUFLLElBQUksQ0FBQ0osWUFBWSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUNBLFlBQVksS0FBS0ksSUFBSSxFQUFHO01BRTlELE1BQU1DLEtBQUssR0FBRyxJQUFJbEIsS0FBSyxDQUFDLENBQUM7TUFFekIsTUFBTW1CLGFBQWEsR0FBR0MsSUFBSSxDQUFDQyxLQUFLLENBQUVKLElBQUksR0FBR2Ysc0JBQXNCLENBQUNvQixzQkFBdUIsQ0FBQztNQUN4RixNQUFNQyxRQUFRLEdBQUtyQixzQkFBc0IsQ0FBQ29CLHNCQUFzQixHQUFHTCxJQUFJLEdBQUssSUFBSSxDQUFDWCxTQUFTLENBQUNNLE1BQU07TUFFakcsS0FBTSxJQUFJWSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLElBQUlMLGFBQWEsRUFBRUssQ0FBQyxFQUFFLEVBQUc7UUFDekMsTUFBTUMsQ0FBQyxHQUFHLElBQUksQ0FBQ25CLFNBQVMsQ0FBQ00sTUFBTSxHQUFLWSxDQUFDLEdBQUdELFFBQVU7UUFDbERMLEtBQUssQ0FBQ1EsTUFBTSxDQUFFLENBQUMsRUFBRUQsQ0FBRSxDQUFDLENBQUNFLE1BQU0sQ0FBRSxJQUFJLENBQUNyQixTQUFTLENBQUNLLEtBQUssRUFBRWMsQ0FBRSxDQUFDO01BQ3hEO01BRUEsSUFBSSxDQUFDUCxLQUFLLEdBQUdBLEtBQUs7TUFFbEIsSUFBSSxDQUFDTCxZQUFZLEdBQUdJLElBQUk7SUFDMUI7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNrQlcsa0JBQWtCQSxDQUFBLEVBQVk7SUFDNUMsT0FBTyxJQUFJLENBQUNsQixXQUFXO0VBQ3pCO0FBQ0Y7QUFFQVAsYUFBYSxDQUFDMEIsUUFBUSxDQUFFLG1CQUFtQixFQUFFekIsaUJBQWtCLENBQUMifQ==