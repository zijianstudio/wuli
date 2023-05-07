// Copyright 2019-2022, University of Colorado Boulder

/**
 * BarPlotNode plots histogram data in the familiar 'bars' style.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Path } from '../../../../scenery/js/imports.js';
import gasProperties from '../../gasProperties.js';
export default class BarPlotNode extends Path {
  /**
   * @param chartSize - dimensions of the chart
   * @param yScaleProperty - scale of the y-axis
   * @param color - color of the bars
   */
  constructor(chartSize, yScaleProperty, color) {
    super(new Shape(), {
      fill: color,
      stroke: color // to hide seams
    });

    this.chartSize = chartSize;
    this.yScaleProperty = yScaleProperty;
    this.shapeBounds = new Bounds2(0, 0, chartSize.width, chartSize.height);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }

  /**
   * Draws the data as a single shape consisting of a set of bars.
   * @param binCounts - the count for each bin
   */
  plot(binCounts) {
    assert && assert(binCounts.length > 0, `invalid binCounts: ${binCounts}`);
    const numberOfBins = binCounts.length;
    const barWidth = this.chartSize.width / numberOfBins;
    const shape = new Shape();
    for (let i = 0; i < numberOfBins; i++) {
      const binCount = binCounts[i];
      assert && assert(binCount <= this.yScaleProperty.value, `binCount ${binCount} should be <= yScale ${this.yScaleProperty.value}`);
      if (binCount > 0) {
        // Compute the bar height
        const barHeight = binCount / this.yScaleProperty.value * this.chartSize.height;

        // Add the bar
        shape.rect(i * barWidth, this.chartSize.height - barHeight, barWidth, barHeight);
      }
    }
    this.shape = shape;
  }

  /**
   * Always use the full chart bounds, as a performance optimization.
   * See https://github.com/phetsims/gas-properties/issues/146
   */
  computeShapeBounds() {
    return this.shapeBounds;
  }
}
gasProperties.register('BarPlotNode', BarPlotNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiU2hhcGUiLCJQYXRoIiwiZ2FzUHJvcGVydGllcyIsIkJhclBsb3ROb2RlIiwiY29uc3RydWN0b3IiLCJjaGFydFNpemUiLCJ5U2NhbGVQcm9wZXJ0eSIsImNvbG9yIiwiZmlsbCIsInN0cm9rZSIsInNoYXBlQm91bmRzIiwid2lkdGgiLCJoZWlnaHQiLCJkaXNwb3NlIiwiYXNzZXJ0IiwicGxvdCIsImJpbkNvdW50cyIsImxlbmd0aCIsIm51bWJlck9mQmlucyIsImJhcldpZHRoIiwic2hhcGUiLCJpIiwiYmluQ291bnQiLCJ2YWx1ZSIsImJhckhlaWdodCIsInJlY3QiLCJjb21wdXRlU2hhcGVCb3VuZHMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJhclBsb3ROb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhclBsb3ROb2RlIHBsb3RzIGhpc3RvZ3JhbSBkYXRhIGluIHRoZSBmYW1pbGlhciAnYmFycycgc3R5bGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBQYXRoLCBUQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZ2FzUHJvcGVydGllcyBmcm9tICcuLi8uLi9nYXNQcm9wZXJ0aWVzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhclBsb3ROb2RlIGV4dGVuZHMgUGF0aCB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgY2hhcnRTaXplOiBEaW1lbnNpb24yO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgeVNjYWxlUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBzaGFwZUJvdW5kczogQm91bmRzMjtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGNoYXJ0U2l6ZSAtIGRpbWVuc2lvbnMgb2YgdGhlIGNoYXJ0XHJcbiAgICogQHBhcmFtIHlTY2FsZVByb3BlcnR5IC0gc2NhbGUgb2YgdGhlIHktYXhpc1xyXG4gICAqIEBwYXJhbSBjb2xvciAtIGNvbG9yIG9mIHRoZSBiYXJzXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjaGFydFNpemU6IERpbWVuc2lvbjIsIHlTY2FsZVByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+LCBjb2xvcjogVENvbG9yICkge1xyXG5cclxuICAgIHN1cGVyKCBuZXcgU2hhcGUoKSwge1xyXG4gICAgICBmaWxsOiBjb2xvcixcclxuICAgICAgc3Ryb2tlOiBjb2xvciAvLyB0byBoaWRlIHNlYW1zXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5jaGFydFNpemUgPSBjaGFydFNpemU7XHJcbiAgICB0aGlzLnlTY2FsZVByb3BlcnR5ID0geVNjYWxlUHJvcGVydHk7XHJcbiAgICB0aGlzLnNoYXBlQm91bmRzID0gbmV3IEJvdW5kczIoIDAsIDAsIGNoYXJ0U2l6ZS53aWR0aCwgY2hhcnRTaXplLmhlaWdodCApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERyYXdzIHRoZSBkYXRhIGFzIGEgc2luZ2xlIHNoYXBlIGNvbnNpc3Rpbmcgb2YgYSBzZXQgb2YgYmFycy5cclxuICAgKiBAcGFyYW0gYmluQ291bnRzIC0gdGhlIGNvdW50IGZvciBlYWNoIGJpblxyXG4gICAqL1xyXG4gIHB1YmxpYyBwbG90KCBiaW5Db3VudHM6IG51bWJlcltdICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmluQ291bnRzLmxlbmd0aCA+IDAsIGBpbnZhbGlkIGJpbkNvdW50czogJHtiaW5Db3VudHN9YCApO1xyXG5cclxuICAgIGNvbnN0IG51bWJlck9mQmlucyA9IGJpbkNvdW50cy5sZW5ndGg7XHJcbiAgICBjb25zdCBiYXJXaWR0aCA9IHRoaXMuY2hhcnRTaXplLndpZHRoIC8gbnVtYmVyT2ZCaW5zO1xyXG5cclxuICAgIGNvbnN0IHNoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1iZXJPZkJpbnM7IGkrKyApIHtcclxuXHJcbiAgICAgIGNvbnN0IGJpbkNvdW50ID0gYmluQ291bnRzWyBpIF07XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGJpbkNvdW50IDw9IHRoaXMueVNjYWxlUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgYGJpbkNvdW50ICR7YmluQ291bnR9IHNob3VsZCBiZSA8PSB5U2NhbGUgJHt0aGlzLnlTY2FsZVByb3BlcnR5LnZhbHVlfWAgKTtcclxuXHJcbiAgICAgIGlmICggYmluQ291bnQgPiAwICkge1xyXG5cclxuICAgICAgICAvLyBDb21wdXRlIHRoZSBiYXIgaGVpZ2h0XHJcbiAgICAgICAgY29uc3QgYmFySGVpZ2h0ID0gKCBiaW5Db3VudCAvIHRoaXMueVNjYWxlUHJvcGVydHkudmFsdWUgKSAqIHRoaXMuY2hhcnRTaXplLmhlaWdodDtcclxuXHJcbiAgICAgICAgLy8gQWRkIHRoZSBiYXJcclxuICAgICAgICBzaGFwZS5yZWN0KCBpICogYmFyV2lkdGgsIHRoaXMuY2hhcnRTaXplLmhlaWdodCAtIGJhckhlaWdodCwgYmFyV2lkdGgsIGJhckhlaWdodCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnNoYXBlID0gc2hhcGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBbHdheXMgdXNlIHRoZSBmdWxsIGNoYXJ0IGJvdW5kcywgYXMgYSBwZXJmb3JtYW5jZSBvcHRpbWl6YXRpb24uXHJcbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9nYXMtcHJvcGVydGllcy9pc3N1ZXMvMTQ2XHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGNvbXB1dGVTaGFwZUJvdW5kcygpOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLnNoYXBlQm91bmRzO1xyXG4gIH1cclxufVxyXG5cclxuZ2FzUHJvcGVydGllcy5yZWdpc3RlciggJ0JhclBsb3ROb2RlJywgQmFyUGxvdE5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUVuRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELFNBQVNDLElBQUksUUFBZ0IsbUNBQW1DO0FBQ2hFLE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFFbEQsZUFBZSxNQUFNQyxXQUFXLFNBQVNGLElBQUksQ0FBQztFQU01QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ1NHLFdBQVdBLENBQUVDLFNBQXFCLEVBQUVDLGNBQWdDLEVBQUVDLEtBQWEsRUFBRztJQUUzRixLQUFLLENBQUUsSUFBSVAsS0FBSyxDQUFDLENBQUMsRUFBRTtNQUNsQlEsSUFBSSxFQUFFRCxLQUFLO01BQ1hFLE1BQU0sRUFBRUYsS0FBSyxDQUFDO0lBQ2hCLENBQUUsQ0FBQzs7SUFFSCxJQUFJLENBQUNGLFNBQVMsR0FBR0EsU0FBUztJQUMxQixJQUFJLENBQUNDLGNBQWMsR0FBR0EsY0FBYztJQUNwQyxJQUFJLENBQUNJLFdBQVcsR0FBRyxJQUFJWCxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRU0sU0FBUyxDQUFDTSxLQUFLLEVBQUVOLFNBQVMsQ0FBQ08sTUFBTyxDQUFDO0VBQzNFO0VBRWdCQyxPQUFPQSxDQUFBLEVBQVM7SUFDOUJDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLEtBQUssRUFBRSw4REFBK0QsQ0FBQztJQUN6RixLQUFLLENBQUNELE9BQU8sQ0FBQyxDQUFDO0VBQ2pCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ1NFLElBQUlBLENBQUVDLFNBQW1CLEVBQVM7SUFDdkNGLE1BQU0sSUFBSUEsTUFBTSxDQUFFRSxTQUFTLENBQUNDLE1BQU0sR0FBRyxDQUFDLEVBQUcsc0JBQXFCRCxTQUFVLEVBQUUsQ0FBQztJQUUzRSxNQUFNRSxZQUFZLEdBQUdGLFNBQVMsQ0FBQ0MsTUFBTTtJQUNyQyxNQUFNRSxRQUFRLEdBQUcsSUFBSSxDQUFDZCxTQUFTLENBQUNNLEtBQUssR0FBR08sWUFBWTtJQUVwRCxNQUFNRSxLQUFLLEdBQUcsSUFBSXBCLEtBQUssQ0FBQyxDQUFDO0lBQ3pCLEtBQU0sSUFBSXFCLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0gsWUFBWSxFQUFFRyxDQUFDLEVBQUUsRUFBRztNQUV2QyxNQUFNQyxRQUFRLEdBQUdOLFNBQVMsQ0FBRUssQ0FBQyxDQUFFO01BQy9CUCxNQUFNLElBQUlBLE1BQU0sQ0FBRVEsUUFBUSxJQUFJLElBQUksQ0FBQ2hCLGNBQWMsQ0FBQ2lCLEtBQUssRUFDcEQsWUFBV0QsUUFBUyx3QkFBdUIsSUFBSSxDQUFDaEIsY0FBYyxDQUFDaUIsS0FBTSxFQUFFLENBQUM7TUFFM0UsSUFBS0QsUUFBUSxHQUFHLENBQUMsRUFBRztRQUVsQjtRQUNBLE1BQU1FLFNBQVMsR0FBS0YsUUFBUSxHQUFHLElBQUksQ0FBQ2hCLGNBQWMsQ0FBQ2lCLEtBQUssR0FBSyxJQUFJLENBQUNsQixTQUFTLENBQUNPLE1BQU07O1FBRWxGO1FBQ0FRLEtBQUssQ0FBQ0ssSUFBSSxDQUFFSixDQUFDLEdBQUdGLFFBQVEsRUFBRSxJQUFJLENBQUNkLFNBQVMsQ0FBQ08sTUFBTSxHQUFHWSxTQUFTLEVBQUVMLFFBQVEsRUFBRUssU0FBVSxDQUFDO01BQ3BGO0lBQ0Y7SUFDQSxJQUFJLENBQUNKLEtBQUssR0FBR0EsS0FBSztFQUNwQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNrQk0sa0JBQWtCQSxDQUFBLEVBQVk7SUFDNUMsT0FBTyxJQUFJLENBQUNoQixXQUFXO0VBQ3pCO0FBQ0Y7QUFFQVIsYUFBYSxDQUFDeUIsUUFBUSxDQUFFLGFBQWEsRUFBRXhCLFdBQVksQ0FBQyJ9