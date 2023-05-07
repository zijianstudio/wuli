// Copyright 2019-2022, University of Colorado Boulder

/**
 * A canvas node that draws the measurable path of the skater. This needed to be done with
 * Canvas for better performance on tablets.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { CanvasNode } from '../../../../scenery/js/imports.js';
import EnergySkateParkColorScheme from '../../common/view/EnergySkateParkColorScheme.js';
import energySkatePark from '../../energySkatePark.js';

// constants
const SAMPLE_RADIUS = 3.5;
class SamplesCanvasNode extends CanvasNode {
  /**
   * @param {MeasureModel} model
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(model, modelViewTransform) {
    super();

    // @private
    this.model = model;
    this.modelViewTransform = modelViewTransform;
    this.model.availableModelBoundsProperty.link(modelBounds => {
      // Dilate bounds by the radius of the sample circles so that they don't get clipped when the skater
      // is resting on the ground. Circles will be half under-ground in this case.
      this.canvasBounds = this.modelViewTransform.modelToViewBounds(modelBounds).dilateY(SAMPLE_RADIUS);

      // repaint in case we are paused
      this.invalidatePaint();
    });
  }

  /**
   * Paints the canvas node.
   * @public
   * @override
   *
   * @param {CanvasRenderingContext2D} context
   */
  paintCanvas(context) {
    for (let i = 0; i < this.model.dataSamples.length; i++) {
      const sample = this.model.dataSamples.get(i);
      const viewPosition = this.modelViewTransform.modelToViewPosition(sample.position);
      context.beginPath();
      context.arc(viewPosition.x, viewPosition.y, SAMPLE_RADIUS, 0, 2 * Math.PI);
      const alpha = sample.opacityProperty.get();
      context.fillStyle = EnergySkateParkColorScheme.pathFill.withAlpha(alpha).toCSS();
      context.strokeStyle = EnergySkateParkColorScheme.pathStroke.withAlpha(alpha).toCSS();
      context.fill();
      context.stroke();
    }
  }

  /**
   * Repaint in the animation frame if playing.
   * @public
   *
   * @param {number} dt - in seconds
   */
  step(dt) {
    this.invalidatePaint();
  }
}
energySkatePark.register('SamplesCanvasNode', SamplesCanvasNode);
export default SamplesCanvasNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDYW52YXNOb2RlIiwiRW5lcmd5U2thdGVQYXJrQ29sb3JTY2hlbWUiLCJlbmVyZ3lTa2F0ZVBhcmsiLCJTQU1QTEVfUkFESVVTIiwiU2FtcGxlc0NhbnZhc05vZGUiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiYXZhaWxhYmxlTW9kZWxCb3VuZHNQcm9wZXJ0eSIsImxpbmsiLCJtb2RlbEJvdW5kcyIsImNhbnZhc0JvdW5kcyIsIm1vZGVsVG9WaWV3Qm91bmRzIiwiZGlsYXRlWSIsImludmFsaWRhdGVQYWludCIsInBhaW50Q2FudmFzIiwiY29udGV4dCIsImkiLCJkYXRhU2FtcGxlcyIsImxlbmd0aCIsInNhbXBsZSIsImdldCIsInZpZXdQb3NpdGlvbiIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJwb3NpdGlvbiIsImJlZ2luUGF0aCIsImFyYyIsIngiLCJ5IiwiTWF0aCIsIlBJIiwiYWxwaGEiLCJvcGFjaXR5UHJvcGVydHkiLCJmaWxsU3R5bGUiLCJwYXRoRmlsbCIsIndpdGhBbHBoYSIsInRvQ1NTIiwic3Ryb2tlU3R5bGUiLCJwYXRoU3Ryb2tlIiwiZmlsbCIsInN0cm9rZSIsInN0ZXAiLCJkdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2FtcGxlc0NhbnZhc05vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBjYW52YXMgbm9kZSB0aGF0IGRyYXdzIHRoZSBtZWFzdXJhYmxlIHBhdGggb2YgdGhlIHNrYXRlci4gVGhpcyBuZWVkZWQgdG8gYmUgZG9uZSB3aXRoXHJcbiAqIENhbnZhcyBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlIG9uIHRhYmxldHMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IENhbnZhc05vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgRW5lcmd5U2thdGVQYXJrQ29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRW5lcmd5U2thdGVQYXJrQ29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgZW5lcmd5U2thdGVQYXJrIGZyb20gJy4uLy4uL2VuZXJneVNrYXRlUGFyay5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgU0FNUExFX1JBRElVUyA9IDMuNTtcclxuXHJcbmNsYXNzIFNhbXBsZXNDYW52YXNOb2RlIGV4dGVuZHMgQ2FudmFzTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TWVhc3VyZU1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCBtb2RlbFZpZXdUcmFuc2Zvcm0gKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IG1vZGVsVmlld1RyYW5zZm9ybTtcclxuXHJcbiAgICB0aGlzLm1vZGVsLmF2YWlsYWJsZU1vZGVsQm91bmRzUHJvcGVydHkubGluayggbW9kZWxCb3VuZHMgPT4ge1xyXG5cclxuICAgICAgLy8gRGlsYXRlIGJvdW5kcyBieSB0aGUgcmFkaXVzIG9mIHRoZSBzYW1wbGUgY2lyY2xlcyBzbyB0aGF0IHRoZXkgZG9uJ3QgZ2V0IGNsaXBwZWQgd2hlbiB0aGUgc2thdGVyXHJcbiAgICAgIC8vIGlzIHJlc3Rpbmcgb24gdGhlIGdyb3VuZC4gQ2lyY2xlcyB3aWxsIGJlIGhhbGYgdW5kZXItZ3JvdW5kIGluIHRoaXMgY2FzZS5cclxuICAgICAgdGhpcy5jYW52YXNCb3VuZHMgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0JvdW5kcyggbW9kZWxCb3VuZHMgKS5kaWxhdGVZKCBTQU1QTEVfUkFESVVTICk7XHJcblxyXG4gICAgICAvLyByZXBhaW50IGluIGNhc2Ugd2UgYXJlIHBhdXNlZFxyXG4gICAgICB0aGlzLmludmFsaWRhdGVQYWludCgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGFpbnRzIHRoZSBjYW52YXMgbm9kZS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY29udGV4dFxyXG4gICAqL1xyXG4gIHBhaW50Q2FudmFzKCBjb250ZXh0ICkge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5tb2RlbC5kYXRhU2FtcGxlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3Qgc2FtcGxlID0gdGhpcy5tb2RlbC5kYXRhU2FtcGxlcy5nZXQoIGkgKTtcclxuICAgICAgY29uc3Qgdmlld1Bvc2l0aW9uID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggc2FtcGxlLnBvc2l0aW9uICk7XHJcblxyXG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICBjb250ZXh0LmFyYyggdmlld1Bvc2l0aW9uLngsIHZpZXdQb3NpdGlvbi55LCBTQU1QTEVfUkFESVVTLCAwLCAyICogTWF0aC5QSSApO1xyXG5cclxuICAgICAgY29uc3QgYWxwaGEgPSBzYW1wbGUub3BhY2l0eVByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBFbmVyZ3lTa2F0ZVBhcmtDb2xvclNjaGVtZS5wYXRoRmlsbC53aXRoQWxwaGEoIGFscGhhICkudG9DU1MoKTtcclxuICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IEVuZXJneVNrYXRlUGFya0NvbG9yU2NoZW1lLnBhdGhTdHJva2Uud2l0aEFscGhhKCBhbHBoYSApLnRvQ1NTKCk7XHJcblxyXG4gICAgICBjb250ZXh0LmZpbGwoKTtcclxuICAgICAgY29udGV4dC5zdHJva2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlcGFpbnQgaW4gdGhlIGFuaW1hdGlvbiBmcmFtZSBpZiBwbGF5aW5nLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIGluIHNlY29uZHNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIHRoaXMuaW52YWxpZGF0ZVBhaW50KCk7XHJcbiAgfVxyXG59XHJcblxyXG5lbmVyZ3lTa2F0ZVBhcmsucmVnaXN0ZXIoICdTYW1wbGVzQ2FudmFzTm9kZScsIFNhbXBsZXNDYW52YXNOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IFNhbXBsZXNDYW52YXNOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLFVBQVUsUUFBUSxtQ0FBbUM7QUFDOUQsT0FBT0MsMEJBQTBCLE1BQU0saURBQWlEO0FBQ3hGLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7O0FBRXREO0FBQ0EsTUFBTUMsYUFBYSxHQUFHLEdBQUc7QUFFekIsTUFBTUMsaUJBQWlCLFNBQVNKLFVBQVUsQ0FBQztFQUV6QztBQUNGO0FBQ0E7QUFDQTtFQUNFSyxXQUFXQSxDQUFFQyxLQUFLLEVBQUVDLGtCQUFrQixFQUFHO0lBQ3ZDLEtBQUssQ0FBQyxDQUFDOztJQUVQO0lBQ0EsSUFBSSxDQUFDRCxLQUFLLEdBQUdBLEtBQUs7SUFDbEIsSUFBSSxDQUFDQyxrQkFBa0IsR0FBR0Esa0JBQWtCO0lBRTVDLElBQUksQ0FBQ0QsS0FBSyxDQUFDRSw0QkFBNEIsQ0FBQ0MsSUFBSSxDQUFFQyxXQUFXLElBQUk7TUFFM0Q7TUFDQTtNQUNBLElBQUksQ0FBQ0MsWUFBWSxHQUFHLElBQUksQ0FBQ0osa0JBQWtCLENBQUNLLGlCQUFpQixDQUFFRixXQUFZLENBQUMsQ0FBQ0csT0FBTyxDQUFFVixhQUFjLENBQUM7O01BRXJHO01BQ0EsSUFBSSxDQUFDVyxlQUFlLENBQUMsQ0FBQztJQUN4QixDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxPQUFPLEVBQUc7SUFDckIsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDWCxLQUFLLENBQUNZLFdBQVcsQ0FBQ0MsTUFBTSxFQUFFRixDQUFDLEVBQUUsRUFBRztNQUN4RCxNQUFNRyxNQUFNLEdBQUcsSUFBSSxDQUFDZCxLQUFLLENBQUNZLFdBQVcsQ0FBQ0csR0FBRyxDQUFFSixDQUFFLENBQUM7TUFDOUMsTUFBTUssWUFBWSxHQUFHLElBQUksQ0FBQ2Ysa0JBQWtCLENBQUNnQixtQkFBbUIsQ0FBRUgsTUFBTSxDQUFDSSxRQUFTLENBQUM7TUFFbkZSLE9BQU8sQ0FBQ1MsU0FBUyxDQUFDLENBQUM7TUFDbkJULE9BQU8sQ0FBQ1UsR0FBRyxDQUFFSixZQUFZLENBQUNLLENBQUMsRUFBRUwsWUFBWSxDQUFDTSxDQUFDLEVBQUV6QixhQUFhLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRzBCLElBQUksQ0FBQ0MsRUFBRyxDQUFDO01BRTVFLE1BQU1DLEtBQUssR0FBR1gsTUFBTSxDQUFDWSxlQUFlLENBQUNYLEdBQUcsQ0FBQyxDQUFDO01BRTFDTCxPQUFPLENBQUNpQixTQUFTLEdBQUdoQywwQkFBMEIsQ0FBQ2lDLFFBQVEsQ0FBQ0MsU0FBUyxDQUFFSixLQUFNLENBQUMsQ0FBQ0ssS0FBSyxDQUFDLENBQUM7TUFDbEZwQixPQUFPLENBQUNxQixXQUFXLEdBQUdwQywwQkFBMEIsQ0FBQ3FDLFVBQVUsQ0FBQ0gsU0FBUyxDQUFFSixLQUFNLENBQUMsQ0FBQ0ssS0FBSyxDQUFDLENBQUM7TUFFdEZwQixPQUFPLENBQUN1QixJQUFJLENBQUMsQ0FBQztNQUNkdkIsT0FBTyxDQUFDd0IsTUFBTSxDQUFDLENBQUM7SUFDbEI7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsSUFBSUEsQ0FBRUMsRUFBRSxFQUFHO0lBQ1QsSUFBSSxDQUFDNUIsZUFBZSxDQUFDLENBQUM7RUFDeEI7QUFDRjtBQUVBWixlQUFlLENBQUN5QyxRQUFRLENBQUUsbUJBQW1CLEVBQUV2QyxpQkFBa0IsQ0FBQztBQUNsRSxlQUFlQSxpQkFBaUIifQ==