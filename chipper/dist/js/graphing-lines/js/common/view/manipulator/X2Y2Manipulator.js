// Copyright 2013-2023, University of Colorado Boulder

/**
 * Manipulator for changing a line's (x2,y2) point.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Utils from '../../../../../dot/js/Utils.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import { DragListener } from '../../../../../scenery/js/imports.js';
import graphingLines from '../../../graphingLines.js';
import GLColors from '../../GLColors.js';
import Line from '../../model/Line.js';
import Manipulator from './Manipulator.js';
export default class X2Y2Manipulator extends Manipulator {
  constructor(radius, lineProperty, x2RangeProperty, y2RangeProperty, modelViewTransform) {
    super(radius, GLColors.POINT_X2_Y2, {
      haloAlpha: GLColors.HALO_ALPHA.x2y2
    });

    // move the manipulator to match the line's (x2,y2) point
    const lineObserver = line => {
      this.translation = modelViewTransform.modelToViewPosition(new Vector2(line.x2, line.y2));
    };
    lineProperty.link(lineObserver); // unlink in dispose

    this.addInputListener(new X2Y2DragListener(this, lineProperty, x2RangeProperty, y2RangeProperty, modelViewTransform));
    this.disposeX2Y2Manipulator = () => {
      lineProperty.unlink(lineObserver);
    };
  }
  dispose() {
    this.disposeX2Y2Manipulator();
    super.dispose();
  }
}

/**
 * Drag listener for (x2,y2) manipulator.
 */
class X2Y2DragListener extends DragListener {
  constructor(targetNode, lineProperty, x2RangeProperty, y2RangeProperty, modelViewTransform) {
    let startOffset; // where the drag started, relative to (x2,y2), in parent view coordinates

    super({
      allowTouchSnag: true,
      // note where the drag started
      start: event => {
        const line = lineProperty.value;
        const position = modelViewTransform.modelToViewXY(line.x2, line.y2);
        startOffset = targetNode.globalToParentPoint(event.pointer.point).minus(position);
      },
      drag: event => {
        const line = lineProperty.value;
        const parentPoint = targetNode.globalToParentPoint(event.pointer.point).minus(startOffset);
        const position = modelViewTransform.viewToModelPosition(parentPoint);

        // constrain to range, snap to grid
        const x2 = Utils.roundSymmetric(Utils.clamp(position.x, x2RangeProperty.value.min, x2RangeProperty.value.max));
        const y2 = Utils.roundSymmetric(Utils.clamp(position.y, y2RangeProperty.value.min, y2RangeProperty.value.max));
        if (x2 !== line.x1 || y2 !== line.y1) {
          // Don't allow points to be the same, this would result in slope=0/0 (undefined line.)
          // Keep (x1,y1) constant, change (x2,y2) and slope.
          lineProperty.value = new Line(line.x1, line.y1, x2, y2, line.color);
        }
      }
    });
  }
}
graphingLines.register('X2Y2Manipulator', X2Y2Manipulator);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlZlY3RvcjIiLCJEcmFnTGlzdGVuZXIiLCJncmFwaGluZ0xpbmVzIiwiR0xDb2xvcnMiLCJMaW5lIiwiTWFuaXB1bGF0b3IiLCJYMlkyTWFuaXB1bGF0b3IiLCJjb25zdHJ1Y3RvciIsInJhZGl1cyIsImxpbmVQcm9wZXJ0eSIsIngyUmFuZ2VQcm9wZXJ0eSIsInkyUmFuZ2VQcm9wZXJ0eSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsIlBPSU5UX1gyX1kyIiwiaGFsb0FscGhhIiwiSEFMT19BTFBIQSIsIngyeTIiLCJsaW5lT2JzZXJ2ZXIiLCJsaW5lIiwidHJhbnNsYXRpb24iLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwieDIiLCJ5MiIsImxpbmsiLCJhZGRJbnB1dExpc3RlbmVyIiwiWDJZMkRyYWdMaXN0ZW5lciIsImRpc3Bvc2VYMlkyTWFuaXB1bGF0b3IiLCJ1bmxpbmsiLCJkaXNwb3NlIiwidGFyZ2V0Tm9kZSIsInN0YXJ0T2Zmc2V0IiwiYWxsb3dUb3VjaFNuYWciLCJzdGFydCIsImV2ZW50IiwidmFsdWUiLCJwb3NpdGlvbiIsIm1vZGVsVG9WaWV3WFkiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwicG9pbnRlciIsInBvaW50IiwibWludXMiLCJkcmFnIiwicGFyZW50UG9pbnQiLCJ2aWV3VG9Nb2RlbFBvc2l0aW9uIiwicm91bmRTeW1tZXRyaWMiLCJjbGFtcCIsIngiLCJtaW4iLCJtYXgiLCJ5IiwieDEiLCJ5MSIsImNvbG9yIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJYMlkyTWFuaXB1bGF0b3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFuaXB1bGF0b3IgZm9yIGNoYW5naW5nIGEgbGluZSdzICh4Mix5MikgcG9pbnQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCB7IERyYWdMaXN0ZW5lciwgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBncmFwaGluZ0xpbmVzIGZyb20gJy4uLy4uLy4uL2dyYXBoaW5nTGluZXMuanMnO1xyXG5pbXBvcnQgR0xDb2xvcnMgZnJvbSAnLi4vLi4vR0xDb2xvcnMuanMnO1xyXG5pbXBvcnQgTGluZSBmcm9tICcuLi8uLi9tb2RlbC9MaW5lLmpzJztcclxuaW1wb3J0IE1hbmlwdWxhdG9yIGZyb20gJy4vTWFuaXB1bGF0b3IuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWDJZMk1hbmlwdWxhdG9yIGV4dGVuZHMgTWFuaXB1bGF0b3Ige1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VYMlkyTWFuaXB1bGF0b3I6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcmFkaXVzOiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBsaW5lUHJvcGVydHk6IFByb3BlcnR5PExpbmU+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgeDJSYW5nZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxSYW5nZT4sXHJcbiAgICAgICAgICAgICAgICAgICAgICB5MlJhbmdlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFJhbmdlPixcclxuICAgICAgICAgICAgICAgICAgICAgIG1vZGVsVmlld1RyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMiApIHtcclxuXHJcbiAgICBzdXBlciggcmFkaXVzLCBHTENvbG9ycy5QT0lOVF9YMl9ZMiwgeyBoYWxvQWxwaGE6IEdMQ29sb3JzLkhBTE9fQUxQSEEueDJ5MiB9ICk7XHJcblxyXG4gICAgLy8gbW92ZSB0aGUgbWFuaXB1bGF0b3IgdG8gbWF0Y2ggdGhlIGxpbmUncyAoeDIseTIpIHBvaW50XHJcbiAgICBjb25zdCBsaW5lT2JzZXJ2ZXIgPSAoIGxpbmU6IExpbmUgKSA9PiB7XHJcbiAgICAgIHRoaXMudHJhbnNsYXRpb24gPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggbmV3IFZlY3RvcjIoIGxpbmUueDIsIGxpbmUueTIgKSApO1xyXG4gICAgfTtcclxuICAgIGxpbmVQcm9wZXJ0eS5saW5rKCBsaW5lT2JzZXJ2ZXIgKTsgLy8gdW5saW5rIGluIGRpc3Bvc2VcclxuXHJcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIG5ldyBYMlkyRHJhZ0xpc3RlbmVyKCB0aGlzLCBsaW5lUHJvcGVydHksIHgyUmFuZ2VQcm9wZXJ0eSwgeTJSYW5nZVByb3BlcnR5LCBtb2RlbFZpZXdUcmFuc2Zvcm0gKSApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZVgyWTJNYW5pcHVsYXRvciA9ICgpID0+IHtcclxuICAgICAgbGluZVByb3BlcnR5LnVubGluayggbGluZU9ic2VydmVyICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VYMlkyTWFuaXB1bGF0b3IoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEcmFnIGxpc3RlbmVyIGZvciAoeDIseTIpIG1hbmlwdWxhdG9yLlxyXG4gKi9cclxuY2xhc3MgWDJZMkRyYWdMaXN0ZW5lciBleHRlbmRzIERyYWdMaXN0ZW5lciB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGFyZ2V0Tm9kZTogTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgIGxpbmVQcm9wZXJ0eTogUHJvcGVydHk8TGluZT4sXHJcbiAgICAgICAgICAgICAgICAgICAgICB4MlJhbmdlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFJhbmdlPixcclxuICAgICAgICAgICAgICAgICAgICAgIHkyUmFuZ2VQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8UmFuZ2U+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yICkge1xyXG5cclxuICAgIGxldCBzdGFydE9mZnNldDogVmVjdG9yMjsgLy8gd2hlcmUgdGhlIGRyYWcgc3RhcnRlZCwgcmVsYXRpdmUgdG8gKHgyLHkyKSwgaW4gcGFyZW50IHZpZXcgY29vcmRpbmF0ZXNcclxuXHJcbiAgICBzdXBlcigge1xyXG5cclxuICAgICAgYWxsb3dUb3VjaFNuYWc6IHRydWUsXHJcblxyXG4gICAgICAvLyBub3RlIHdoZXJlIHRoZSBkcmFnIHN0YXJ0ZWRcclxuICAgICAgc3RhcnQ6IGV2ZW50ID0+IHtcclxuICAgICAgICBjb25zdCBsaW5lID0gbGluZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WFkoIGxpbmUueDIsIGxpbmUueTIgKTtcclxuICAgICAgICBzdGFydE9mZnNldCA9IHRhcmdldE5vZGUuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApLm1pbnVzKCBwb3NpdGlvbiApO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgZHJhZzogZXZlbnQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBsaW5lID0gbGluZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgIGNvbnN0IHBhcmVudFBvaW50ID0gdGFyZ2V0Tm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkubWludXMoIHN0YXJ0T2Zmc2V0ICk7XHJcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxQb3NpdGlvbiggcGFyZW50UG9pbnQgKTtcclxuXHJcbiAgICAgICAgLy8gY29uc3RyYWluIHRvIHJhbmdlLCBzbmFwIHRvIGdyaWRcclxuICAgICAgICBjb25zdCB4MiA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBVdGlscy5jbGFtcCggcG9zaXRpb24ueCwgeDJSYW5nZVByb3BlcnR5LnZhbHVlLm1pbiwgeDJSYW5nZVByb3BlcnR5LnZhbHVlLm1heCApICk7XHJcbiAgICAgICAgY29uc3QgeTIgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggVXRpbHMuY2xhbXAoIHBvc2l0aW9uLnksIHkyUmFuZ2VQcm9wZXJ0eS52YWx1ZS5taW4sIHkyUmFuZ2VQcm9wZXJ0eS52YWx1ZS5tYXggKSApO1xyXG5cclxuICAgICAgICBpZiAoIHgyICE9PSBsaW5lLngxIHx8IHkyICE9PSBsaW5lLnkxICkge1xyXG4gICAgICAgICAgLy8gRG9uJ3QgYWxsb3cgcG9pbnRzIHRvIGJlIHRoZSBzYW1lLCB0aGlzIHdvdWxkIHJlc3VsdCBpbiBzbG9wZT0wLzAgKHVuZGVmaW5lZCBsaW5lLilcclxuICAgICAgICAgIC8vIEtlZXAgKHgxLHkxKSBjb25zdGFudCwgY2hhbmdlICh4Mix5MikgYW5kIHNsb3BlLlxyXG4gICAgICAgICAgbGluZVByb3BlcnR5LnZhbHVlID0gbmV3IExpbmUoIGxpbmUueDEsIGxpbmUueTEsIHgyLCB5MiwgbGluZS5jb2xvciApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZ3JhcGhpbmdMaW5lcy5yZWdpc3RlciggJ1gyWTJNYW5pcHVsYXRvcicsIFgyWTJNYW5pcHVsYXRvciApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFLQSxPQUFPQSxLQUFLLE1BQU0sZ0NBQWdDO0FBQ2xELE9BQU9DLE9BQU8sTUFBTSxrQ0FBa0M7QUFFdEQsU0FBU0MsWUFBWSxRQUFjLHNDQUFzQztBQUN6RSxPQUFPQyxhQUFhLE1BQU0sMkJBQTJCO0FBQ3JELE9BQU9DLFFBQVEsTUFBTSxtQkFBbUI7QUFDeEMsT0FBT0MsSUFBSSxNQUFNLHFCQUFxQjtBQUN0QyxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBRTFDLGVBQWUsTUFBTUMsZUFBZSxTQUFTRCxXQUFXLENBQUM7RUFJaERFLFdBQVdBLENBQUVDLE1BQWMsRUFDZEMsWUFBNEIsRUFDNUJDLGVBQXlDLEVBQ3pDQyxlQUF5QyxFQUN6Q0Msa0JBQXVDLEVBQUc7SUFFNUQsS0FBSyxDQUFFSixNQUFNLEVBQUVMLFFBQVEsQ0FBQ1UsV0FBVyxFQUFFO01BQUVDLFNBQVMsRUFBRVgsUUFBUSxDQUFDWSxVQUFVLENBQUNDO0lBQUssQ0FBRSxDQUFDOztJQUU5RTtJQUNBLE1BQU1DLFlBQVksR0FBS0MsSUFBVSxJQUFNO01BQ3JDLElBQUksQ0FBQ0MsV0FBVyxHQUFHUCxrQkFBa0IsQ0FBQ1EsbUJBQW1CLENBQUUsSUFBSXBCLE9BQU8sQ0FBRWtCLElBQUksQ0FBQ0csRUFBRSxFQUFFSCxJQUFJLENBQUNJLEVBQUcsQ0FBRSxDQUFDO0lBQzlGLENBQUM7SUFDRGIsWUFBWSxDQUFDYyxJQUFJLENBQUVOLFlBQWEsQ0FBQyxDQUFDLENBQUM7O0lBRW5DLElBQUksQ0FBQ08sZ0JBQWdCLENBQUUsSUFBSUMsZ0JBQWdCLENBQUUsSUFB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