// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model of a simple 2D graph.  Used in the icon as well as the sim screens.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import graphingLines from '../../graphingLines.js';
export default class Graph {
  // lines that the graph is currently displaying

  constructor(xRange, yRange) {
    this.xRange = xRange;
    this.yRange = yRange;
    this.lines = createObservableArray();
  }
  getWidth() {
    return this.xRange.getLength();
  }
  getHeight() {
    return this.yRange.getLength();
  }

  /**
   * Does the graph contain the specified point?
   */
  contains(point) {
    return this.xRange.contains(point.x) && this.yRange.contains(point.y);
  }

  /**
   * Constrains a point to the x,y range of the graph.
   */
  constrain(point) {
    const x = this.xRange.constrainValue(point.x);
    const y = this.yRange.constrainValue(point.y);
    if (point.x === x && point.y === y) {
      return point;
    } else {
      return new Vector2(x, y);
    }
  }
}
graphingLines.register('Graph', Graph);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJWZWN0b3IyIiwiZ3JhcGhpbmdMaW5lcyIsIkdyYXBoIiwiY29uc3RydWN0b3IiLCJ4UmFuZ2UiLCJ5UmFuZ2UiLCJsaW5lcyIsImdldFdpZHRoIiwiZ2V0TGVuZ3RoIiwiZ2V0SGVpZ2h0IiwiY29udGFpbnMiLCJwb2ludCIsIngiLCJ5IiwiY29uc3RyYWluIiwiY29uc3RyYWluVmFsdWUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdyYXBoLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIG9mIGEgc2ltcGxlIDJEIGdyYXBoLiAgVXNlZCBpbiB0aGUgaWNvbiBhcyB3ZWxsIGFzIHRoZSBzaW0gc2NyZWVucy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5LCB7IE9ic2VydmFibGVBcnJheSB9IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IGdyYXBoaW5nTGluZXMgZnJvbSAnLi4vLi4vZ3JhcGhpbmdMaW5lcy5qcyc7XHJcbmltcG9ydCBMaW5lIGZyb20gJy4vTGluZS5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmFwaCB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSB4UmFuZ2U6IFJhbmdlO1xyXG4gIHB1YmxpYyByZWFkb25seSB5UmFuZ2U6IFJhbmdlO1xyXG4gIHB1YmxpYyByZWFkb25seSBsaW5lczogT2JzZXJ2YWJsZUFycmF5PExpbmU+OyAvLyBsaW5lcyB0aGF0IHRoZSBncmFwaCBpcyBjdXJyZW50bHkgZGlzcGxheWluZ1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHhSYW5nZTogUmFuZ2UsIHlSYW5nZTogUmFuZ2UgKSB7XHJcbiAgICB0aGlzLnhSYW5nZSA9IHhSYW5nZTtcclxuICAgIHRoaXMueVJhbmdlID0geVJhbmdlO1xyXG4gICAgdGhpcy5saW5lcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFdpZHRoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLnhSYW5nZS5nZXRMZW5ndGgoKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0SGVpZ2h0KCk6IG51bWJlciB7IHJldHVybiB0aGlzLnlSYW5nZS5nZXRMZW5ndGgoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBEb2VzIHRoZSBncmFwaCBjb250YWluIHRoZSBzcGVjaWZpZWQgcG9pbnQ/XHJcbiAgICovXHJcbiAgcHVibGljIGNvbnRhaW5zKCBwb2ludDogVmVjdG9yMiApOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLnhSYW5nZS5jb250YWlucyggcG9pbnQueCApICYmIHRoaXMueVJhbmdlLmNvbnRhaW5zKCBwb2ludC55ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJhaW5zIGEgcG9pbnQgdG8gdGhlIHgseSByYW5nZSBvZiB0aGUgZ3JhcGguXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cmFpbiggcG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XHJcbiAgICBjb25zdCB4ID0gdGhpcy54UmFuZ2UuY29uc3RyYWluVmFsdWUoIHBvaW50LnggKTtcclxuICAgIGNvbnN0IHkgPSB0aGlzLnlSYW5nZS5jb25zdHJhaW5WYWx1ZSggcG9pbnQueSApO1xyXG4gICAgaWYgKCBwb2ludC54ID09PSB4ICYmIHBvaW50LnkgPT09IHkgKSB7XHJcbiAgICAgIHJldHVybiBwb2ludDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gbmV3IFZlY3RvcjIoIHgsIHkgKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmdyYXBoaW5nTGluZXMucmVnaXN0ZXIoICdHcmFwaCcsIEdyYXBoICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHFCQUFxQixNQUEyQiw4Q0FBOEM7QUFFckcsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxhQUFhLE1BQU0sd0JBQXdCO0FBR2xELGVBQWUsTUFBTUMsS0FBSyxDQUFDO0VBSXFCOztFQUV2Q0MsV0FBV0EsQ0FBRUMsTUFBYSxFQUFFQyxNQUFhLEVBQUc7SUFDakQsSUFBSSxDQUFDRCxNQUFNLEdBQUdBLE1BQU07SUFDcEIsSUFBSSxDQUFDQyxNQUFNLEdBQUdBLE1BQU07SUFDcEIsSUFBSSxDQUFDQyxLQUFLLEdBQUdQLHFCQUFxQixDQUFDLENBQUM7RUFDdEM7RUFFT1EsUUFBUUEsQ0FBQSxFQUFXO0lBQUUsT0FBTyxJQUFJLENBQUNILE1BQU0sQ0FBQ0ksU0FBUyxDQUFDLENBQUM7RUFBRTtFQUVyREMsU0FBU0EsQ0FBQSxFQUFXO0lBQUUsT0FBTyxJQUFJLENBQUNKLE1BQU0sQ0FBQ0csU0FBUyxDQUFDLENBQUM7RUFBRTs7RUFFN0Q7QUFDRjtBQUNBO0VBQ1NFLFFBQVFBLENBQUVDLEtBQWMsRUFBWTtJQUN6QyxPQUFPLElBQUksQ0FBQ1AsTUFBTSxDQUFDTSxRQUFRLENBQUVDLEtBQUssQ0FBQ0MsQ0FBRSxDQUFDLElBQUksSUFBSSxDQUFDUCxNQUFNLENBQUNLLFFBQVEsQ0FBRUMsS0FBSyxDQUFDRSxDQUFFLENBQUM7RUFDM0U7O0VBRUE7QUFDRjtBQUNBO0VBQ1NDLFNBQVNBLENBQUVILEtBQWMsRUFBWTtJQUMxQyxNQUFNQyxDQUFDLEdBQUcsSUFBSSxDQUFDUixNQUFNLENBQUNXLGNBQWMsQ0FBRUosS0FBSyxDQUFDQyxDQUFFLENBQUM7SUFDL0MsTUFBTUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1IsTUFBTSxDQUFDVSxjQUFjLENBQUVKLEtBQUssQ0FBQ0UsQ0FBRSxDQUFDO0lBQy9DLElBQUtGLEtBQUssQ0FBQ0MsQ0FBQyxLQUFLQSxDQUFDLElBQUlELEtBQUssQ0FBQ0UsQ0FBQyxLQUFLQSxDQUFDLEVBQUc7TUFDcEMsT0FBT0YsS0FBSztJQUNkLENBQUMsTUFDSTtNQUNILE9BQU8sSUFBSVgsT0FBTyxDQUFFWSxDQUFDLEVBQUVDLENBQUUsQ0FBQztJQUM1QjtFQUNGO0FBQ0Y7QUFFQVosYUFBYSxDQUFDZSxRQUFRLENBQUUsT0FBTyxFQUFFZCxLQUFNLENBQUMifQ==