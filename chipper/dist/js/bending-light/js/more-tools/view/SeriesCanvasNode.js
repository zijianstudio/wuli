// Copyright 2015-2022, University of Colorado Boulder

/**
 * Node for drawing the series of points.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import { CanvasNode } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
class SeriesCanvasNode extends CanvasNode {
  /**
   * @param seriesProperty - contains data points of series
   * @param modelViewTransformProperty - Transform between model and view coordinate
   *                                                                      frames
   * @param color - color of the series
   * @param [providedOptions] - options that can be passed on to the underlying node
   */
  constructor(seriesProperty, modelViewTransformProperty, color, providedOptions) {
    super(providedOptions);
    this.seriesProperty = seriesProperty;
    this.modelViewTransformProperty = modelViewTransformProperty;
    this.color = color;
  }

  /**
   * Paints the series points on the canvas node.
   */
  paintCanvas(context) {
    let moved = false;
    context.beginPath();
    for (let i = 0; i < this.seriesProperty.get().length; i++) {
      const dataPoint = this.seriesProperty.get()[i];

      // check for the data point and if exist draw series
      if (dataPoint) {
        const x = this.modelViewTransformProperty.get().modelToViewX(dataPoint.time);
        const y = this.modelViewTransformProperty.get().modelToViewY(dataPoint.value);
        if (!moved) {
          context.moveTo(x, y);
          moved = true;
        } else {
          context.lineTo(x, y);
        }
      }
    }
    context.strokeStyle = this.color;
    context.lineWidth = 2;
    context.setLineDash([]);
    context.lineDashOffset = 0;
    context.stroke();
    context.closePath();
  }

  /**
   */
  step() {
    this.invalidatePaint();
  }
}
bendingLight.register('SeriesCanvasNode', SeriesCanvasNode);
export default SeriesCanvasNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDYW52YXNOb2RlIiwiYmVuZGluZ0xpZ2h0IiwiU2VyaWVzQ2FudmFzTm9kZSIsImNvbnN0cnVjdG9yIiwic2VyaWVzUHJvcGVydHkiLCJtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSIsImNvbG9yIiwicHJvdmlkZWRPcHRpb25zIiwicGFpbnRDYW52YXMiLCJjb250ZXh0IiwibW92ZWQiLCJiZWdpblBhdGgiLCJpIiwiZ2V0IiwibGVuZ3RoIiwiZGF0YVBvaW50IiwieCIsIm1vZGVsVG9WaWV3WCIsInRpbWUiLCJ5IiwibW9kZWxUb1ZpZXdZIiwidmFsdWUiLCJtb3ZlVG8iLCJsaW5lVG8iLCJzdHJva2VTdHlsZSIsImxpbmVXaWR0aCIsInNldExpbmVEYXNoIiwibGluZURhc2hPZmZzZXQiLCJzdHJva2UiLCJjbG9zZVBhdGgiLCJzdGVwIiwiaW52YWxpZGF0ZVBhaW50IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTZXJpZXNDYW52YXNOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE5vZGUgZm9yIGRyYXdpbmcgdGhlIHNlcmllcyBvZiBwb2ludHMuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgQ2hhbmRyYXNoZWthciBCZW1hZ29uaSAoQWN0dWFsIENvbmNlcHRzKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IHsgQ2FudmFzTm9kZSwgTm9kZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgYmVuZGluZ0xpZ2h0IGZyb20gJy4uLy4uL2JlbmRpbmdMaWdodC5qcyc7XHJcbmltcG9ydCBEYXRhUG9pbnQgZnJvbSAnLi4vbW9kZWwvRGF0YVBvaW50LmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5cclxuY2xhc3MgU2VyaWVzQ2FudmFzTm9kZSBleHRlbmRzIENhbnZhc05vZGUge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc2VyaWVzUHJvcGVydHk6IFByb3BlcnR5PERhdGFQb2ludFtdPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IG1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5OiBQcm9wZXJ0eTxNb2RlbFZpZXdUcmFuc2Zvcm0yPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGNvbG9yOiBzdHJpbmc7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBzZXJpZXNQcm9wZXJ0eSAtIGNvbnRhaW5zIGRhdGEgcG9pbnRzIG9mIHNlcmllc1xyXG4gICAqIEBwYXJhbSBtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSAtIFRyYW5zZm9ybSBiZXR3ZWVuIG1vZGVsIGFuZCB2aWV3IGNvb3JkaW5hdGVcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFtZXNcclxuICAgKiBAcGFyYW0gY29sb3IgLSBjb2xvciBvZiB0aGUgc2VyaWVzXHJcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdIC0gb3B0aW9ucyB0aGF0IGNhbiBiZSBwYXNzZWQgb24gdG8gdGhlIHVuZGVybHlpbmcgbm9kZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2VyaWVzUHJvcGVydHk6IFByb3BlcnR5PERhdGFQb2ludFtdPiwgbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHk6IFByb3BlcnR5PE1vZGVsVmlld1RyYW5zZm9ybTI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHN0cmluZywgcHJvdmlkZWRPcHRpb25zPzogTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoIHByb3ZpZGVkT3B0aW9ucyApO1xyXG4gICAgdGhpcy5zZXJpZXNQcm9wZXJ0eSA9IHNlcmllc1Byb3BlcnR5O1xyXG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSA9IG1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5O1xyXG4gICAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGFpbnRzIHRoZSBzZXJpZXMgcG9pbnRzIG9uIHRoZSBjYW52YXMgbm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgcGFpbnRDYW52YXMoIGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCApOiB2b2lkIHtcclxuICAgIGxldCBtb3ZlZCA9IGZhbHNlO1xyXG5cclxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnNlcmllc1Byb3BlcnR5LmdldCgpLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBkYXRhUG9pbnQgPSB0aGlzLnNlcmllc1Byb3BlcnR5LmdldCgpWyBpIF07XHJcblxyXG4gICAgICAvLyBjaGVjayBmb3IgdGhlIGRhdGEgcG9pbnQgYW5kIGlmIGV4aXN0IGRyYXcgc2VyaWVzXHJcbiAgICAgIGlmICggZGF0YVBvaW50ICkge1xyXG4gICAgICAgIGNvbnN0IHggPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LmdldCgpLm1vZGVsVG9WaWV3WCggZGF0YVBvaW50LnRpbWUgKTtcclxuICAgICAgICBjb25zdCB5ID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS5nZXQoKS5tb2RlbFRvVmlld1koIGRhdGFQb2ludC52YWx1ZSApO1xyXG4gICAgICAgIGlmICggIW1vdmVkICkge1xyXG4gICAgICAgICAgY29udGV4dC5tb3ZlVG8oIHgsIHkgKTtcclxuICAgICAgICAgIG1vdmVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBjb250ZXh0LmxpbmVUbyggeCwgeSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9IHRoaXMuY29sb3I7XHJcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDI7XHJcbiAgICBjb250ZXh0LnNldExpbmVEYXNoKCBbXSApO1xyXG4gICAgY29udGV4dC5saW5lRGFzaE9mZnNldCA9IDA7XHJcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xyXG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGVwKCk6IHZvaWQge1xyXG4gICAgdGhpcy5pbnZhbGlkYXRlUGFpbnQoKTtcclxuICB9XHJcbn1cclxuXHJcbmJlbmRpbmdMaWdodC5yZWdpc3RlciggJ1Nlcmllc0NhbnZhc05vZGUnLCBTZXJpZXNDYW52YXNOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTZXJpZXNDYW52YXNOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLFNBQVNBLFVBQVUsUUFBcUIsbUNBQW1DO0FBQzNFLE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFJaEQsTUFBTUMsZ0JBQWdCLFNBQVNGLFVBQVUsQ0FBQztFQUt4QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTRyxXQUFXQSxDQUFFQyxjQUFxQyxFQUFFQywwQkFBeUQsRUFDaEdDLEtBQWEsRUFBRUMsZUFBNkIsRUFBRztJQUVqRSxLQUFLLENBQUVBLGVBQWdCLENBQUM7SUFDeEIsSUFBSSxDQUFDSCxjQUFjLEdBQUdBLGNBQWM7SUFDcEMsSUFBSSxDQUFDQywwQkFBMEIsR0FBR0EsMEJBQTBCO0lBQzVELElBQUksQ0FBQ0MsS0FBSyxHQUFHQSxLQUFLO0VBQ3BCOztFQUVBO0FBQ0Y7QUFDQTtFQUNTRSxXQUFXQSxDQUFFQyxPQUFpQyxFQUFTO0lBQzVELElBQUlDLEtBQUssR0FBRyxLQUFLO0lBRWpCRCxPQUFPLENBQUNFLFNBQVMsQ0FBQyxDQUFDO0lBQ25CLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ1IsY0FBYyxDQUFDUyxHQUFHLENBQUMsQ0FBQyxDQUFDQyxNQUFNLEVBQUVGLENBQUMsRUFBRSxFQUFHO01BQzNELE1BQU1HLFNBQVMsR0FBRyxJQUFJLENBQUNYLGNBQWMsQ0FBQ1MsR0FBRyxDQUFDLENBQUMsQ0FBRUQsQ0FBQyxDQUFFOztNQUVoRDtNQUNBLElBQUtHLFNBQVMsRUFBRztRQUNmLE1BQU1DLENBQUMsR0FBRyxJQUFJLENBQUNYLDBCQUEwQixDQUFDUSxHQUFHLENBQUMsQ0FBQyxDQUFDSSxZQUFZLENBQUVGLFNBQVMsQ0FBQ0csSUFBSyxDQUFDO1FBQzlFLE1BQU1DLENBQUMsR0FBRyxJQUFJLENBQUNkLDBCQUEwQixDQUFDUSxHQUFHLENBQUMsQ0FBQyxDQUFDTyxZQUFZLENBQUVMLFNBQVMsQ0FBQ00sS0FBTSxDQUFDO1FBQy9FLElBQUssQ0FBQ1gsS0FBSyxFQUFHO1VBQ1pELE9BQU8sQ0FBQ2EsTUFBTSxDQUFFTixDQUFDLEVBQUVHLENBQUUsQ0FBQztVQUN0QlQsS0FBSyxHQUFHLElBQUk7UUFDZCxDQUFDLE1BQ0k7VUFDSEQsT0FBTyxDQUFDYyxNQUFNLENBQUVQLENBQUMsRUFBRUcsQ0FBRSxDQUFDO1FBQ3hCO01BQ0Y7SUFDRjtJQUNBVixPQUFPLENBQUNlLFdBQVcsR0FBRyxJQUFJLENBQUNsQixLQUFLO0lBQ2hDRyxPQUFPLENBQUNnQixTQUFTLEdBQUcsQ0FBQztJQUNyQmhCLE9BQU8sQ0FBQ2lCLFdBQVcsQ0FBRSxFQUFHLENBQUM7SUFDekJqQixPQUFPLENBQUNrQixjQUFjLEdBQUcsQ0FBQztJQUMxQmxCLE9BQU8sQ0FBQ21CLE1BQU0sQ0FBQyxDQUFDO0lBQ2hCbkIsT0FBTyxDQUFDb0IsU0FBUyxDQUFDLENBQUM7RUFDckI7O0VBRUE7QUFDRjtFQUNTQyxJQUFJQSxDQUFBLEVBQVM7SUFDbEIsSUFBSSxDQUFDQyxlQUFlLENBQUMsQ0FBQztFQUN4QjtBQUNGO0FBRUE5QixZQUFZLENBQUMrQixRQUFRLENBQUUsa0JBQWtCLEVBQUU5QixnQkFBaUIsQ0FBQztBQUU3RCxlQUFlQSxnQkFBZ0IifQ==