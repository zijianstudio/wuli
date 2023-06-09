// Copyright 2015-2022, University of Colorado Boulder

/**
 * This CanvasNode renders the light rays for the non-white rays.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import { CanvasNode } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
import LightRay from '../model/LightRay.js';

// constants
const lineDash = [];
class SingleColorLightCanvasNode extends CanvasNode {
  /**
   * @param modelViewTransform - converts between model and view co-ordinates
   * @param stageWidth - width of the dev area
   * @param stageHeight - height of the dev area
   * @param rays -
   */
  constructor(modelViewTransform, stageWidth, stageHeight, rays) {
    super({
      canvasBounds: new Bounds2(0, 0, stageWidth, stageHeight)
    });
    this.modelViewTransform = modelViewTransform;
    this.rays = rays;
    this.invalidatePaint();
    this.strokeWidth = this.modelViewTransform.modelToViewDeltaX(LightRay.RAY_WIDTH);
  }

  /**
   * Paints the particles on the canvas node.
   */
  paintCanvas(context) {
    context.save();
    context.lineWidth = this.strokeWidth;

    // Sometimes dashes from other canvases leak over here, so we must clear the dash
    // until this leak is fixed. See #258
    context.setLineDash(lineDash);
    context.lineCap = 'round';
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];

      // iPad3 shows a opacity=0 ray as opacity=1 for unknown reasons, so we simply omit those rays
      if (ray.powerFraction > 1E-6) {
        context.beginPath();
        context.strokeStyle = `rgba(${ray.color.getRed()},${ray.color.getGreen()},${ray.color.getBlue()},${Math.sqrt(ray.powerFraction)})`;
        context.moveTo(this.modelViewTransform.modelToViewX(ray.tail.x), this.modelViewTransform.modelToViewY(ray.tail.y));
        context.lineTo(this.modelViewTransform.modelToViewX(ray.tip.x), this.modelViewTransform.modelToViewY(ray.tip.y));
        context.stroke();
      }
    }
    context.restore();

    // This debug code shows the bounds
    // context.lineWidth = 10;
    // context.strokeStyle = 'blue';
    // context.strokeRect(
    //  this.canvasBounds.minX, this.canvasBounds.minY,
    //  this.canvasBounds.width, this.canvasBounds.height
    // );
  }

  step() {
    this.invalidatePaint();
  }
}
bendingLight.register('SingleColorLightCanvasNode', SingleColorLightCanvasNode);
export default SingleColorLightCanvasNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiQ2FudmFzTm9kZSIsImJlbmRpbmdMaWdodCIsIkxpZ2h0UmF5IiwibGluZURhc2giLCJTaW5nbGVDb2xvckxpZ2h0Q2FudmFzTm9kZSIsImNvbnN0cnVjdG9yIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwic3RhZ2VXaWR0aCIsInN0YWdlSGVpZ2h0IiwicmF5cyIsImNhbnZhc0JvdW5kcyIsImludmFsaWRhdGVQYWludCIsInN0cm9rZVdpZHRoIiwibW9kZWxUb1ZpZXdEZWx0YVgiLCJSQVlfV0lEVEgiLCJwYWludENhbnZhcyIsImNvbnRleHQiLCJzYXZlIiwibGluZVdpZHRoIiwic2V0TGluZURhc2giLCJsaW5lQ2FwIiwiaSIsImxlbmd0aCIsInJheSIsInBvd2VyRnJhY3Rpb24iLCJiZWdpblBhdGgiLCJzdHJva2VTdHlsZSIsImNvbG9yIiwiZ2V0UmVkIiwiZ2V0R3JlZW4iLCJnZXRCbHVlIiwiTWF0aCIsInNxcnQiLCJtb3ZlVG8iLCJtb2RlbFRvVmlld1giLCJ0YWlsIiwieCIsIm1vZGVsVG9WaWV3WSIsInkiLCJsaW5lVG8iLCJ0aXAiLCJzdHJva2UiLCJyZXN0b3JlIiwic3RlcCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2luZ2xlQ29sb3JMaWdodENhbnZhc05vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhpcyBDYW52YXNOb2RlIHJlbmRlcnMgdGhlIGxpZ2h0IHJheXMgZm9yIHRoZSBub24td2hpdGUgcmF5cy5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IHsgQ2FudmFzTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBiZW5kaW5nTGlnaHQgZnJvbSAnLi4vLi4vYmVuZGluZ0xpZ2h0LmpzJztcclxuaW1wb3J0IExpZ2h0UmF5IGZyb20gJy4uL21vZGVsL0xpZ2h0UmF5LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBsaW5lRGFzaDogbnVtYmVyW10gPSBbXTtcclxuXHJcbmNsYXNzIFNpbmdsZUNvbG9yTGlnaHRDYW52YXNOb2RlIGV4dGVuZHMgQ2FudmFzTm9kZSB7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTI7XHJcbiAgcHJpdmF0ZSByZWFkb25seSByYXlzOiBMaWdodFJheVtdO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc3Ryb2tlV2lkdGg6IG51bWJlcjtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIG1vZGVsVmlld1RyYW5zZm9ybSAtIGNvbnZlcnRzIGJldHdlZW4gbW9kZWwgYW5kIHZpZXcgY28tb3JkaW5hdGVzXHJcbiAgICogQHBhcmFtIHN0YWdlV2lkdGggLSB3aWR0aCBvZiB0aGUgZGV2IGFyZWFcclxuICAgKiBAcGFyYW0gc3RhZ2VIZWlnaHQgLSBoZWlnaHQgb2YgdGhlIGRldiBhcmVhXHJcbiAgICogQHBhcmFtIHJheXMgLVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLCBzdGFnZVdpZHRoOiBudW1iZXIsIHN0YWdlSGVpZ2h0OiBudW1iZXIsIHJheXM6IExpZ2h0UmF5W10gKSB7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgY2FudmFzQm91bmRzOiBuZXcgQm91bmRzMiggMCwgMCwgc3RhZ2VXaWR0aCwgc3RhZ2VIZWlnaHQgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gPSBtb2RlbFZpZXdUcmFuc2Zvcm07XHJcblxyXG4gICAgdGhpcy5yYXlzID0gcmF5cztcclxuICAgIHRoaXMuaW52YWxpZGF0ZVBhaW50KCk7XHJcblxyXG4gICAgdGhpcy5zdHJva2VXaWR0aCA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBMaWdodFJheS5SQVlfV0lEVEggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBhaW50cyB0aGUgcGFydGljbGVzIG9uIHRoZSBjYW52YXMgbm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgcGFpbnRDYW52YXMoIGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCApOiB2b2lkIHtcclxuXHJcbiAgICBjb250ZXh0LnNhdmUoKTtcclxuICAgIGNvbnRleHQubGluZVdpZHRoID0gdGhpcy5zdHJva2VXaWR0aDtcclxuXHJcbiAgICAvLyBTb21ldGltZXMgZGFzaGVzIGZyb20gb3RoZXIgY2FudmFzZXMgbGVhayBvdmVyIGhlcmUsIHNvIHdlIG11c3QgY2xlYXIgdGhlIGRhc2hcclxuICAgIC8vIHVudGlsIHRoaXMgbGVhayBpcyBmaXhlZC4gU2VlICMyNThcclxuICAgIGNvbnRleHQuc2V0TGluZURhc2goIGxpbmVEYXNoICk7XHJcbiAgICBjb250ZXh0LmxpbmVDYXAgPSAncm91bmQnO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMucmF5cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgcmF5ID0gdGhpcy5yYXlzWyBpIF07XHJcblxyXG4gICAgICAvLyBpUGFkMyBzaG93cyBhIG9wYWNpdHk9MCByYXkgYXMgb3BhY2l0eT0xIGZvciB1bmtub3duIHJlYXNvbnMsIHNvIHdlIHNpbXBseSBvbWl0IHRob3NlIHJheXNcclxuICAgICAgaWYgKCByYXkucG93ZXJGcmFjdGlvbiA+IDFFLTYgKSB7XHJcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuXHJcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IGByZ2JhKCR7XHJcbiAgICAgICAgICByYXkuY29sb3IuZ2V0UmVkKCl9LCR7XHJcbiAgICAgICAgICByYXkuY29sb3IuZ2V0R3JlZW4oKX0sJHtcclxuICAgICAgICAgIHJheS5jb2xvci5nZXRCbHVlKCl9LCR7XHJcbiAgICAgICAgICBNYXRoLnNxcnQoIHJheS5wb3dlckZyYWN0aW9uIClcclxuICAgICAgICB9KWA7XHJcblxyXG4gICAgICAgIGNvbnRleHQubW92ZVRvKFxyXG4gICAgICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCByYXkudGFpbC54ICksXHJcbiAgICAgICAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIHJheS50YWlsLnkgKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnRleHQubGluZVRvKFxyXG4gICAgICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCByYXkudGlwLnggKSxcclxuICAgICAgICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggcmF5LnRpcC55IClcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGNvbnRleHQucmVzdG9yZSgpO1xyXG5cclxuICAgIC8vIFRoaXMgZGVidWcgY29kZSBzaG93cyB0aGUgYm91bmRzXHJcbiAgICAvLyBjb250ZXh0LmxpbmVXaWR0aCA9IDEwO1xyXG4gICAgLy8gY29udGV4dC5zdHJva2VTdHlsZSA9ICdibHVlJztcclxuICAgIC8vIGNvbnRleHQuc3Ryb2tlUmVjdChcclxuICAgIC8vICB0aGlzLmNhbnZhc0JvdW5kcy5taW5YLCB0aGlzLmNhbnZhc0JvdW5kcy5taW5ZLFxyXG4gICAgLy8gIHRoaXMuY2FudmFzQm91bmRzLndpZHRoLCB0aGlzLmNhbnZhc0JvdW5kcy5oZWlnaHRcclxuICAgIC8vICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RlcCgpOiB2b2lkIHtcclxuICAgIHRoaXMuaW52YWxpZGF0ZVBhaW50KCk7XHJcbiAgfVxyXG59XHJcblxyXG5iZW5kaW5nTGlnaHQucmVnaXN0ZXIoICdTaW5nbGVDb2xvckxpZ2h0Q2FudmFzTm9kZScsIFNpbmdsZUNvbG9yTGlnaHRDYW52YXNOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTaW5nbGVDb2xvckxpZ2h0Q2FudmFzTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUVuRCxTQUFTQyxVQUFVLFFBQVEsbUNBQW1DO0FBQzlELE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MsUUFBUSxNQUFNLHNCQUFzQjs7QUFFM0M7QUFDQSxNQUFNQyxRQUFrQixHQUFHLEVBQUU7QUFFN0IsTUFBTUMsMEJBQTBCLFNBQVNKLFVBQVUsQ0FBQztFQUtsRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU0ssV0FBV0EsQ0FBRUMsa0JBQXVDLEVBQUVDLFVBQWtCLEVBQUVDLFdBQW1CLEVBQUVDLElBQWdCLEVBQUc7SUFFdkgsS0FBSyxDQUFFO01BQ0xDLFlBQVksRUFBRSxJQUFJWCxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRVEsVUFBVSxFQUFFQyxXQUFZO0lBQzNELENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ0Ysa0JBQWtCLEdBQUdBLGtCQUFrQjtJQUU1QyxJQUFJLENBQUNHLElBQUksR0FBR0EsSUFBSTtJQUNoQixJQUFJLENBQUNFLGVBQWUsQ0FBQyxDQUFDO0lBRXRCLElBQUksQ0FBQ0MsV0FBVyxHQUFHLElBQUksQ0FBQ04sa0JBQWtCLENBQUNPLGlCQUFpQixDQUFFWCxRQUFRLENBQUNZLFNBQVUsQ0FBQztFQUNwRjs7RUFFQTtBQUNGO0FBQ0E7RUFDU0MsV0FBV0EsQ0FBRUMsT0FBaUMsRUFBUztJQUU1REEsT0FBTyxDQUFDQyxJQUFJLENBQUMsQ0FBQztJQUNkRCxPQUFPLENBQUNFLFNBQVMsR0FBRyxJQUFJLENBQUNOLFdBQVc7O0lBRXBDO0lBQ0E7SUFDQUksT0FBTyxDQUFDRyxXQUFXLENBQUVoQixRQUFTLENBQUM7SUFDL0JhLE9BQU8sQ0FBQ0ksT0FBTyxHQUFHLE9BQU87SUFFekIsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDWixJQUFJLENBQUNhLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUc7TUFDM0MsTUFBTUUsR0FBRyxHQUFHLElBQUksQ0FBQ2QsSUFBSSxDQUFFWSxDQUFDLENBQUU7O01BRTFCO01BQ0EsSUFBS0UsR0FBRyxDQUFDQyxhQUFhLEdBQUcsSUFBSSxFQUFHO1FBQzlCUixPQUFPLENBQUNTLFNBQVMsQ0FBQyxDQUFDO1FBRW5CVCxPQUFPLENBQUNVLFdBQVcsR0FBSSxRQUNyQkgsR0FBRyxDQUFDSSxLQUFLLENBQUNDLE1BQU0sQ0FBQyxDQUFFLElBQ25CTCxHQUFHLENBQUNJLEtBQUssQ0FBQ0UsUUFBUSxDQUFDLENBQUUsSUFDckJOLEdBQUcsQ0FBQ0ksS0FBSyxDQUFDRyxPQUFPLENBQUMsQ0FBRSxJQUNwQkMsSUFBSSxDQUFDQyxJQUFJLENBQUVULEdBQUcsQ0FBQ0MsYUFBYyxDQUM5QixHQUFFO1FBRUhSLE9BQU8sQ0FBQ2lCLE1BQU0sQ0FDWixJQUFJLENBQUMzQixrQkFBa0IsQ0FBQzRCLFlBQVksQ0FBRVgsR0FBRyxDQUFDWSxJQUFJLENBQUNDLENBQUUsQ0FBQyxFQUNsRCxJQUFJLENBQUM5QixrQkFBa0IsQ0FBQytCLFlBQVksQ0FBRWQsR0FBRyxDQUFDWSxJQUFJLENBQUNHLENBQUUsQ0FDbkQsQ0FBQztRQUVEdEIsT0FBTyxDQUFDdUIsTUFBTSxDQUNaLElBQUksQ0FBQ2pDLGtCQUFrQixDQUFDNEIsWUFBWSxDQUFFWCxHQUFHLENBQUNpQixHQUFHLENBQUNKLENBQUUsQ0FBQyxFQUNqRCxJQUFJLENBQUM5QixrQkFBa0IsQ0FBQytCLFlBQVksQ0FBRWQsR0FBRyxDQUFDaUIsR0FBRyxDQUFDRixDQUFFLENBQ2xELENBQUM7UUFDRHRCLE9BQU8sQ0FBQ3lCLE1BQU0sQ0FBQyxDQUFDO01BQ2xCO0lBQ0Y7SUFDQXpCLE9BQU8sQ0FBQzBCLE9BQU8sQ0FBQyxDQUFDOztJQUVqQjtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtFQUNGOztFQUVPQyxJQUFJQSxDQUFBLEVBQVM7SUFDbEIsSUFBSSxDQUFDaEMsZUFBZSxDQUFDLENBQUM7RUFDeEI7QUFDRjtBQUVBVixZQUFZLENBQUMyQyxRQUFRLENBQUUsNEJBQTRCLEVBQUV4QywwQkFBMkIsQ0FBQztBQUVqRixlQUFlQSwwQkFBMEIifQ==