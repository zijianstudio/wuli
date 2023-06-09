// Copyright 2015-2022, University of Colorado Boulder

/**
 * Draws horizontal and vertical grid lines in the chart node.
 * These grid lines are drawn using canvas instead of using Path/Shape/Line in which stroke is applied in every
 * frame which leads to performance issues.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import { CanvasNode } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
class GridCanvasNode extends CanvasNode {
  /**
   * @param gridLines - contains details of each grid line
   * @param modelViewTransformProperty - Transform between model and view coordinates
   * @param strokeDash
   * @param [providedOptions] - options that can be passed on to the underlying node
   */
  constructor(gridLines, modelViewTransformProperty, strokeDash, providedOptions) {
    super(providedOptions);
    this.gridLines = gridLines;
    this.modelViewTransformProperty = modelViewTransformProperty;
    this.strokeDash = strokeDash;
  }

  /**
   * Paints the grid lines on the canvas node.
   */
  paintCanvas(context) {
    context.save();
    for (let i = 0; i < this.gridLines.length; i++) {
      context.beginPath();
      const gridLine = this.gridLines[i];
      const modelViewTransform = this.modelViewTransformProperty.get();
      context.moveTo(modelViewTransform.modelToViewX(gridLine.x1), modelViewTransform.modelToViewY(gridLine.y1));
      context.lineTo(modelViewTransform.modelToViewX(gridLine.x2), modelViewTransform.modelToViewY(gridLine.y2));
      context.strokeStyle = 'lightGray';
      context.lineWidth = 2;
      context.setLineDash(this.strokeDash);
      // Have to model the phase to make it look like the grid line is moving
      context.lineDashOffset = gridLine.lineDashOffset;
      context.stroke();
      context.closePath();
    }
    context.restore();
  }

  /**
   */
  step() {
    this.invalidatePaint();
  }
}
bendingLight.register('GridCanvasNode', GridCanvasNode);
export default GridCanvasNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDYW52YXNOb2RlIiwiYmVuZGluZ0xpZ2h0IiwiR3JpZENhbnZhc05vZGUiLCJjb25zdHJ1Y3RvciIsImdyaWRMaW5lcyIsIm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5Iiwic3Ryb2tlRGFzaCIsInByb3ZpZGVkT3B0aW9ucyIsInBhaW50Q2FudmFzIiwiY29udGV4dCIsInNhdmUiLCJpIiwibGVuZ3RoIiwiYmVnaW5QYXRoIiwiZ3JpZExpbmUiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJnZXQiLCJtb3ZlVG8iLCJtb2RlbFRvVmlld1giLCJ4MSIsIm1vZGVsVG9WaWV3WSIsInkxIiwibGluZVRvIiwieDIiLCJ5MiIsInN0cm9rZVN0eWxlIiwibGluZVdpZHRoIiwic2V0TGluZURhc2giLCJsaW5lRGFzaE9mZnNldCIsInN0cm9rZSIsImNsb3NlUGF0aCIsInJlc3RvcmUiLCJzdGVwIiwiaW52YWxpZGF0ZVBhaW50IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHcmlkQ2FudmFzTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEcmF3cyBob3Jpem9udGFsIGFuZCB2ZXJ0aWNhbCBncmlkIGxpbmVzIGluIHRoZSBjaGFydCBub2RlLlxyXG4gKiBUaGVzZSBncmlkIGxpbmVzIGFyZSBkcmF3biB1c2luZyBjYW52YXMgaW5zdGVhZCBvZiB1c2luZyBQYXRoL1NoYXBlL0xpbmUgaW4gd2hpY2ggc3Ryb2tlIGlzIGFwcGxpZWQgaW4gZXZlcnlcclxuICogZnJhbWUgd2hpY2ggbGVhZHMgdG8gcGVyZm9ybWFuY2UgaXNzdWVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENoYW5kcmFzaGVrYXIgQmVtYWdvbmkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IENhbnZhc05vZGUsIE5vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGJlbmRpbmdMaWdodCBmcm9tICcuLi8uLi9iZW5kaW5nTGlnaHQuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCB7IE9ic2VydmFibGVBcnJheSB9IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuXHJcbmNsYXNzIEdyaWRDYW52YXNOb2RlIGV4dGVuZHMgQ2FudmFzTm9kZSB7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eTogUHJvcGVydHk8TW9kZWxWaWV3VHJhbnNmb3JtMj47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBzdHJva2VEYXNoOiBudW1iZXJbXTtcclxuICBwcml2YXRlIHJlYWRvbmx5IGdyaWRMaW5lczogT2JzZXJ2YWJsZUFycmF5PHsgeDE6IG51bWJlcjsgeTE6IG51bWJlcjsgeDI6IG51bWJlcjsgeTI6IG51bWJlcjsgbGluZURhc2hPZmZzZXQ6IG51bWJlciB9PjtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGdyaWRMaW5lcyAtIGNvbnRhaW5zIGRldGFpbHMgb2YgZWFjaCBncmlkIGxpbmVcclxuICAgKiBAcGFyYW0gbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkgLSBUcmFuc2Zvcm0gYmV0d2VlbiBtb2RlbCBhbmQgdmlldyBjb29yZGluYXRlc1xyXG4gICAqIEBwYXJhbSBzdHJva2VEYXNoXHJcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdIC0gb3B0aW9ucyB0aGF0IGNhbiBiZSBwYXNzZWQgb24gdG8gdGhlIHVuZGVybHlpbmcgbm9kZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZ3JpZExpbmVzOiBPYnNlcnZhYmxlQXJyYXk8eyB4MTogbnVtYmVyOyB5MTogbnVtYmVyOyB4MjogbnVtYmVyOyB5MjogbnVtYmVyOyBsaW5lRGFzaE9mZnNldDogbnVtYmVyIH0+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHk6IFByb3BlcnR5PE1vZGVsVmlld1RyYW5zZm9ybTI+LCBzdHJva2VEYXNoOiBudW1iZXJbXSwgcHJvdmlkZWRPcHRpb25zPzogTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoIHByb3ZpZGVkT3B0aW9ucyApO1xyXG4gICAgdGhpcy5ncmlkTGluZXMgPSBncmlkTGluZXM7XHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5ID0gbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHk7XHJcbiAgICB0aGlzLnN0cm9rZURhc2ggPSBzdHJva2VEYXNoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGFpbnRzIHRoZSBncmlkIGxpbmVzIG9uIHRoZSBjYW52YXMgbm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgcGFpbnRDYW52YXMoIGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCApOiB2b2lkIHtcclxuXHJcbiAgICBjb250ZXh0LnNhdmUoKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuZ3JpZExpbmVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICBjb25zdCBncmlkTGluZSA9IHRoaXMuZ3JpZExpbmVzWyBpIF07XHJcbiAgICAgIGNvbnN0IG1vZGVsVmlld1RyYW5zZm9ybSA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIGNvbnRleHQubW92ZVRvKFxyXG4gICAgICAgIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIGdyaWRMaW5lLngxICksXHJcbiAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggZ3JpZExpbmUueTEgKSApO1xyXG4gICAgICBjb250ZXh0LmxpbmVUbyhcclxuICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBncmlkTGluZS54MiApLFxyXG4gICAgICAgIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIGdyaWRMaW5lLnkyICkgKTtcclxuICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICdsaWdodEdyYXknO1xyXG4gICAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDI7XHJcbiAgICAgIGNvbnRleHQuc2V0TGluZURhc2goIHRoaXMuc3Ryb2tlRGFzaCApO1xyXG4gICAgICAvLyBIYXZlIHRvIG1vZGVsIHRoZSBwaGFzZSB0byBtYWtlIGl0IGxvb2sgbGlrZSB0aGUgZ3JpZCBsaW5lIGlzIG1vdmluZ1xyXG4gICAgICBjb250ZXh0LmxpbmVEYXNoT2Zmc2V0ID0gZ3JpZExpbmUubGluZURhc2hPZmZzZXQ7XHJcbiAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XHJcbiAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XHJcbiAgICB9XHJcbiAgICBjb250ZXh0LnJlc3RvcmUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGVwKCk6IHZvaWQge1xyXG4gICAgdGhpcy5pbnZhbGlkYXRlUGFpbnQoKTtcclxuICB9XHJcbn1cclxuXHJcbmJlbmRpbmdMaWdodC5yZWdpc3RlciggJ0dyaWRDYW52YXNOb2RlJywgR3JpZENhbnZhc05vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdyaWRDYW52YXNOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxTQUFTQSxVQUFVLFFBQXFCLG1DQUFtQztBQUMzRSxPQUFPQyxZQUFZLE1BQU0sdUJBQXVCO0FBSWhELE1BQU1DLGNBQWMsU0FBU0YsVUFBVSxDQUFDO0VBS3RDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTRyxXQUFXQSxDQUFFQyxTQUFzRyxFQUN0R0MsMEJBQXlELEVBQUVDLFVBQW9CLEVBQUVDLGVBQTZCLEVBQUc7SUFFbkksS0FBSyxDQUFFQSxlQUFnQixDQUFDO0lBQ3hCLElBQUksQ0FBQ0gsU0FBUyxHQUFHQSxTQUFTO0lBQzFCLElBQUksQ0FBQ0MsMEJBQTBCLEdBQUdBLDBCQUEwQjtJQUM1RCxJQUFJLENBQUNDLFVBQVUsR0FBR0EsVUFBVTtFQUM5Qjs7RUFFQTtBQUNGO0FBQ0E7RUFDU0UsV0FBV0EsQ0FBRUMsT0FBaUMsRUFBUztJQUU1REEsT0FBTyxDQUFDQyxJQUFJLENBQUMsQ0FBQztJQUNkLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ1AsU0FBUyxDQUFDUSxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFHO01BQ2hERixPQUFPLENBQUNJLFNBQVMsQ0FBQyxDQUFDO01BQ25CLE1BQU1DLFFBQVEsR0FBRyxJQUFJLENBQUNWLFNBQVMsQ0FBRU8sQ0FBQyxDQUFFO01BQ3BDLE1BQU1JLGtCQUFrQixHQUFHLElBQUksQ0FBQ1YsMEJBQTBCLENBQUNXLEdBQUcsQ0FBQyxDQUFDO01BQ2hFUCxPQUFPLENBQUNRLE1BQU0sQ0FDWkYsa0JBQWtCLENBQUNHLFlBQVksQ0FBRUosUUFBUSxDQUFDSyxFQUFHLENBQUMsRUFDOUNKLGtCQUFrQixDQUFDSyxZQUFZLENBQUVOLFFBQVEsQ0FBQ08sRUFBRyxDQUFFLENBQUM7TUFDbERaLE9BQU8sQ0FBQ2EsTUFBTSxDQUNaUCxrQkFBa0IsQ0FBQ0csWUFBWSxDQUFFSixRQUFRLENBQUNTLEVBQUcsQ0FBQyxFQUM5Q1Isa0JBQWtCLENBQUNLLFlBQVksQ0FBRU4sUUFBUSxDQUFDVSxFQUFHLENBQUUsQ0FBQztNQUNsRGYsT0FBTyxDQUFDZ0IsV0FBVyxHQUFHLFdBQVc7TUFDakNoQixPQUFPLENBQUNpQixTQUFTLEdBQUcsQ0FBQztNQUNyQmpCLE9BQU8sQ0FBQ2tCLFdBQVcsQ0FBRSxJQUFJLENBQUNyQixVQUFXLENBQUM7TUFDdEM7TUFDQUcsT0FBTyxDQUFDbUIsY0FBYyxHQUFHZCxRQUFRLENBQUNjLGNBQWM7TUFDaERuQixPQUFPLENBQUNvQixNQUFNLENBQUMsQ0FBQztNQUNoQnBCLE9BQU8sQ0FBQ3FCLFNBQVMsQ0FBQyxDQUFDO0lBQ3JCO0lBQ0FyQixPQUFPLENBQUNzQixPQUFPLENBQUMsQ0FBQztFQUNuQjs7RUFFQTtBQUNGO0VBQ1NDLElBQUlBLENBQUEsRUFBUztJQUNsQixJQUFJLENBQUNDLGVBQWUsQ0FBQyxDQUFDO0VBQ3hCO0FBQ0Y7QUFFQWhDLFlBQVksQ0FBQ2lDLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRWhDLGNBQWUsQ0FBQztBQUV6RCxlQUFlQSxjQUFjIn0=