// Copyright 2014-2022, University of Colorado Boulder

/**
 * Period trace node in 'Pendulum Lab' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color, Node, Path } from '../../../../scenery/js/imports.js';
import pendulumLab from '../../pendulumLab.js';

// constants
const DEFAULT_TRACE_STEP = 10; // in pixels - JO: No it's not pixels. At all...

class PeriodTraceNode extends Node {
  /**
   * @param {Pendulum} pendulum
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor(pendulum, modelViewTransform, options) {
    super(merge({
      pickable: false,
      rotation: Math.PI / 2,
      preventFit: true,
      translation: modelViewTransform.modelToViewPosition(Vector2.ZERO)
    }, options));
    let isCompleted = false; // flag to control completing of trace view

    const baseColor = new Color(pendulum.color);

    // @private {Pendulum}
    this.pendulum = pendulum;

    // @private {Property.<Color>}
    this.traceColorProperty = new Property(baseColor);

    // @private {number} - The opacity of the trace (not using Node opacity for performance reasons)
    this.colorAlpha = 1;

    // @private {number|null} - If a number, the speed at which things fade out.
    this.fadeOutSpeed = null;

    // create trace path path
    const pathNode = new Path(null, {
      stroke: this.traceColorProperty,
      lineWidth: 2
    });
    this.addChild(pathNode);

    // reset the path
    const resetPath = () => {
      pathNode.setShape(null);
      isCompleted = false;
      this.colorAlpha = 1;
      this.traceColorProperty.value = baseColor;
      this.fadeOutSpeed = null;
    };

    // draw the path based on the state of the pendulum
    const updateShape = () => {
      const periodTrace = pendulum.periodTrace;
      const numberOfPoints = periodTrace.numberOfPointsProperty.value;
      if (numberOfPoints > 0) {
        // 0 means we just started the trace
        const shape = new Shape(); // create the new shape

        // trace length is how far away from the pivot the trace will show up.
        const traceLength = modelViewTransform.modelToViewDeltaX(pendulum.lengthProperty.value * 3.2 / 4 - 0.1 / 2);

        // traceStep is how the distance between two line of the trace
        let traceStep = DEFAULT_TRACE_STEP;
        if (traceStep * 4 > traceLength) {
          traceStep = traceLength / 4;
        }

        // draw first arc
        if (numberOfPoints > 1) {
          shape.arc(0, 0, traceLength, 0, -periodTrace.firstAngle, !periodTrace.counterClockwise);
          shape.lineTo((traceLength - traceStep) * Math.cos(-periodTrace.firstAngle), (traceLength - traceStep) * Math.sin(-periodTrace.firstAngle));

          // draw second arc
          if (numberOfPoints > 2) {
            shape.arc(0, 0, traceLength - traceStep, -periodTrace.firstAngle, -periodTrace.secondAngle, periodTrace.counterClockwise);
            shape.lineTo((traceLength - 2 * traceStep) * Math.cos(-periodTrace.secondAngle), (traceLength - 2 * traceStep) * Math.sin(-periodTrace.secondAngle));

            // draw third arc
            if (numberOfPoints > 3) {
              shape.arc(0, 0, traceLength - 2 * traceStep, -periodTrace.secondAngle, 0, !periodTrace.counterClockwise);
              isCompleted = true;
              this.fadeOutSpeed = 1 / (3 * pendulum.getApproximatePeriod() / 2);
            } else {
              shape.arc(0, 0, traceLength - 2 * traceStep, -periodTrace.secondAngle, -pendulum.angleProperty.value, !periodTrace.counterClockwise);
            }
          } else {
            shape.arc(0, 0, traceLength - traceStep, -periodTrace.firstAngle, -pendulum.angleProperty.value, periodTrace.counterClockwise);
          }
        } else {
          shape.arc(0, 0, traceLength, 0, -pendulum.angleProperty.value, !periodTrace.counterClockwise);
        }
        pathNode.setShape(shape);
      }
    };

    // update path shape
    pendulum.angleProperty.link(() => {
      if (pathNode.visible && !isCompleted) {
        updateShape();
      }
    });

    // update visibility of path node
    pendulum.periodTrace.isVisibleProperty.linkAttribute(pathNode, 'visible');

    // clear trace if path points were removed
    pendulum.periodTrace.numberOfPointsProperty.lazyLink((numberNew, numberPrev) => {
      if (numberNew < numberPrev) {
        resetPath();
      }
    });
  }

  /**
   * Steps the view.
   * @public
   *
   * @param {number} dt
   */
  step(dt) {
    if (this.fadeOutSpeed) {
      this.colorAlpha = Math.max(0, this.colorAlpha - this.fadeOutSpeed * dt);
      this.traceColorProperty.value = this.traceColorProperty.value.withAlpha(this.colorAlpha);
      if (this.colorAlpha === 0) {
        this.pendulum.periodTrace.onFaded();
        this.fadeOutSpeed = null;
      }
    }
  }
}
pendulumLab.register('PeriodTraceNode', PeriodTraceNode);
export default PeriodTraceNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJTaGFwZSIsIm1lcmdlIiwiQ29sb3IiLCJOb2RlIiwiUGF0aCIsInBlbmR1bHVtTGFiIiwiREVGQVVMVF9UUkFDRV9TVEVQIiwiUGVyaW9kVHJhY2VOb2RlIiwiY29uc3RydWN0b3IiLCJwZW5kdWx1bSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsIm9wdGlvbnMiLCJwaWNrYWJsZSIsInJvdGF0aW9uIiwiTWF0aCIsIlBJIiwicHJldmVudEZpdCIsInRyYW5zbGF0aW9uIiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsIlpFUk8iLCJpc0NvbXBsZXRlZCIsImJhc2VDb2xvciIsImNvbG9yIiwidHJhY2VDb2xvclByb3BlcnR5IiwiY29sb3JBbHBoYSIsImZhZGVPdXRTcGVlZCIsInBhdGhOb2RlIiwic3Ryb2tlIiwibGluZVdpZHRoIiwiYWRkQ2hpbGQiLCJyZXNldFBhdGgiLCJzZXRTaGFwZSIsInZhbHVlIiwidXBkYXRlU2hhcGUiLCJwZXJpb2RUcmFjZSIsIm51bWJlck9mUG9pbnRzIiwibnVtYmVyT2ZQb2ludHNQcm9wZXJ0eSIsInNoYXBlIiwidHJhY2VMZW5ndGgiLCJtb2RlbFRvVmlld0RlbHRhWCIsImxlbmd0aFByb3BlcnR5IiwidHJhY2VTdGVwIiwiYXJjIiwiZmlyc3RBbmdsZSIsImNvdW50ZXJDbG9ja3dpc2UiLCJsaW5lVG8iLCJjb3MiLCJzaW4iLCJzZWNvbmRBbmdsZSIsImdldEFwcHJveGltYXRlUGVyaW9kIiwiYW5nbGVQcm9wZXJ0eSIsImxpbmsiLCJ2aXNpYmxlIiwiaXNWaXNpYmxlUHJvcGVydHkiLCJsaW5rQXR0cmlidXRlIiwibGF6eUxpbmsiLCJudW1iZXJOZXciLCJudW1iZXJQcmV2Iiwic3RlcCIsImR0IiwibWF4Iiwid2l0aEFscGhhIiwib25GYWRlZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGVyaW9kVHJhY2VOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBlcmlvZCB0cmFjZSBub2RlIGluICdQZW5kdWx1bSBMYWInIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNbGVhcm5lcilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIE5vZGUsIFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgcGVuZHVsdW1MYWIgZnJvbSAnLi4vLi4vcGVuZHVsdW1MYWIuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IERFRkFVTFRfVFJBQ0VfU1RFUCA9IDEwOyAvLyBpbiBwaXhlbHMgLSBKTzogTm8gaXQncyBub3QgcGl4ZWxzLiBBdCBhbGwuLi5cclxuXHJcbmNsYXNzIFBlcmlvZFRyYWNlTm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UGVuZHVsdW19IHBlbmR1bHVtXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHBlbmR1bHVtLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoIG1lcmdlKCB7XHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgcm90YXRpb246IE1hdGguUEkgLyAyLFxyXG4gICAgICBwcmV2ZW50Rml0OiB0cnVlLFxyXG4gICAgICB0cmFuc2xhdGlvbjogbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIFZlY3RvcjIuWkVSTyApXHJcbiAgICB9LCBvcHRpb25zICkgKTtcclxuXHJcbiAgICBsZXQgaXNDb21wbGV0ZWQgPSBmYWxzZTsgLy8gZmxhZyB0byBjb250cm9sIGNvbXBsZXRpbmcgb2YgdHJhY2Ugdmlld1xyXG5cclxuICAgIGNvbnN0IGJhc2VDb2xvciA9IG5ldyBDb2xvciggcGVuZHVsdW0uY29sb3IgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7UGVuZHVsdW19XHJcbiAgICB0aGlzLnBlbmR1bHVtID0gcGVuZHVsdW07XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1Byb3BlcnR5LjxDb2xvcj59XHJcbiAgICB0aGlzLnRyYWNlQ29sb3JQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggYmFzZUNvbG9yICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBUaGUgb3BhY2l0eSBvZiB0aGUgdHJhY2UgKG5vdCB1c2luZyBOb2RlIG9wYWNpdHkgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMpXHJcbiAgICB0aGlzLmNvbG9yQWxwaGEgPSAxO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ8bnVsbH0gLSBJZiBhIG51bWJlciwgdGhlIHNwZWVkIGF0IHdoaWNoIHRoaW5ncyBmYWRlIG91dC5cclxuICAgIHRoaXMuZmFkZU91dFNwZWVkID0gbnVsbDtcclxuXHJcbiAgICAvLyBjcmVhdGUgdHJhY2UgcGF0aCBwYXRoXHJcbiAgICBjb25zdCBwYXRoTm9kZSA9IG5ldyBQYXRoKCBudWxsLCB7XHJcbiAgICAgIHN0cm9rZTogdGhpcy50cmFjZUNvbG9yUHJvcGVydHksXHJcbiAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcGF0aE5vZGUgKTtcclxuXHJcbiAgICAvLyByZXNldCB0aGUgcGF0aFxyXG4gICAgY29uc3QgcmVzZXRQYXRoID0gKCkgPT4ge1xyXG4gICAgICBwYXRoTm9kZS5zZXRTaGFwZSggbnVsbCApO1xyXG4gICAgICBpc0NvbXBsZXRlZCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmNvbG9yQWxwaGEgPSAxO1xyXG4gICAgICB0aGlzLnRyYWNlQ29sb3JQcm9wZXJ0eS52YWx1ZSA9IGJhc2VDb2xvcjtcclxuICAgICAgdGhpcy5mYWRlT3V0U3BlZWQgPSBudWxsO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBkcmF3IHRoZSBwYXRoIGJhc2VkIG9uIHRoZSBzdGF0ZSBvZiB0aGUgcGVuZHVsdW1cclxuICAgIGNvbnN0IHVwZGF0ZVNoYXBlID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBwZXJpb2RUcmFjZSA9IHBlbmR1bHVtLnBlcmlvZFRyYWNlO1xyXG4gICAgICBjb25zdCBudW1iZXJPZlBvaW50cyA9IHBlcmlvZFRyYWNlLm51bWJlck9mUG9pbnRzUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgICBpZiAoIG51bWJlck9mUG9pbnRzID4gMCApIHsgLy8gMCBtZWFucyB3ZSBqdXN0IHN0YXJ0ZWQgdGhlIHRyYWNlXHJcbiAgICAgICAgY29uc3Qgc2hhcGUgPSBuZXcgU2hhcGUoKTsgLy8gY3JlYXRlIHRoZSBuZXcgc2hhcGVcclxuXHJcbiAgICAgICAgLy8gdHJhY2UgbGVuZ3RoIGlzIGhvdyBmYXIgYXdheSBmcm9tIHRoZSBwaXZvdCB0aGUgdHJhY2Ugd2lsbCBzaG93IHVwLlxyXG4gICAgICAgIGNvbnN0IHRyYWNlTGVuZ3RoID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBwZW5kdWx1bS5sZW5ndGhQcm9wZXJ0eS52YWx1ZSAqIDMuMiAvIDQgLSAwLjEgLyAyICk7XHJcblxyXG4gICAgICAgIC8vIHRyYWNlU3RlcCBpcyBob3cgdGhlIGRpc3RhbmNlIGJldHdlZW4gdHdvIGxpbmUgb2YgdGhlIHRyYWNlXHJcbiAgICAgICAgbGV0IHRyYWNlU3RlcCA9IERFRkFVTFRfVFJBQ0VfU1RFUDtcclxuICAgICAgICBpZiAoIHRyYWNlU3RlcCAqIDQgPiB0cmFjZUxlbmd0aCApIHtcclxuICAgICAgICAgIHRyYWNlU3RlcCA9IHRyYWNlTGVuZ3RoIC8gNDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGRyYXcgZmlyc3QgYXJjXHJcbiAgICAgICAgaWYgKCBudW1iZXJPZlBvaW50cyA+IDEgKSB7XHJcbiAgICAgICAgICBzaGFwZS5hcmMoIDAsIDAsIHRyYWNlTGVuZ3RoLCAwLCAtcGVyaW9kVHJhY2UuZmlyc3RBbmdsZSwgIXBlcmlvZFRyYWNlLmNvdW50ZXJDbG9ja3dpc2UgKTtcclxuICAgICAgICAgIHNoYXBlLmxpbmVUbyggKCB0cmFjZUxlbmd0aCAtIHRyYWNlU3RlcCApICogTWF0aC5jb3MoIC1wZXJpb2RUcmFjZS5maXJzdEFuZ2xlICksICggdHJhY2VMZW5ndGggLSB0cmFjZVN0ZXAgKSAqIE1hdGguc2luKCAtcGVyaW9kVHJhY2UuZmlyc3RBbmdsZSApICk7XHJcblxyXG4gICAgICAgICAgLy8gZHJhdyBzZWNvbmQgYXJjXHJcbiAgICAgICAgICBpZiAoIG51bWJlck9mUG9pbnRzID4gMiApIHtcclxuICAgICAgICAgICAgc2hhcGUuYXJjKCAwLCAwLCB0cmFjZUxlbmd0aCAtIHRyYWNlU3RlcCwgLXBlcmlvZFRyYWNlLmZpcnN0QW5nbGUsIC1wZXJpb2RUcmFjZS5zZWNvbmRBbmdsZSwgcGVyaW9kVHJhY2UuY291bnRlckNsb2Nrd2lzZSApO1xyXG4gICAgICAgICAgICBzaGFwZS5saW5lVG8oICggdHJhY2VMZW5ndGggLSAyICogdHJhY2VTdGVwICkgKiBNYXRoLmNvcyggLXBlcmlvZFRyYWNlLnNlY29uZEFuZ2xlICksICggdHJhY2VMZW5ndGggLSAyICogdHJhY2VTdGVwICkgKiBNYXRoLnNpbiggLXBlcmlvZFRyYWNlLnNlY29uZEFuZ2xlICkgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGRyYXcgdGhpcmQgYXJjXHJcbiAgICAgICAgICAgIGlmICggbnVtYmVyT2ZQb2ludHMgPiAzICkge1xyXG4gICAgICAgICAgICAgIHNoYXBlLmFyYyggMCwgMCwgdHJhY2VMZW5ndGggLSAyICogdHJhY2VTdGVwLCAtcGVyaW9kVHJhY2Uuc2Vjb25kQW5nbGUsIDAsICFwZXJpb2RUcmFjZS5jb3VudGVyQ2xvY2t3aXNlICk7XHJcbiAgICAgICAgICAgICAgaXNDb21wbGV0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgIHRoaXMuZmFkZU91dFNwZWVkID0gMSAvICggMyAqIHBlbmR1bHVtLmdldEFwcHJveGltYXRlUGVyaW9kKCkgLyAyICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgc2hhcGUuYXJjKCAwLCAwLCB0cmFjZUxlbmd0aCAtIDIgKiB0cmFjZVN0ZXAsIC1wZXJpb2RUcmFjZS5zZWNvbmRBbmdsZSwgLXBlbmR1bHVtLmFuZ2xlUHJvcGVydHkudmFsdWUsICFwZXJpb2RUcmFjZS5jb3VudGVyQ2xvY2t3aXNlICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzaGFwZS5hcmMoIDAsIDAsIHRyYWNlTGVuZ3RoIC0gdHJhY2VTdGVwLCAtcGVyaW9kVHJhY2UuZmlyc3RBbmdsZSwgLXBlbmR1bHVtLmFuZ2xlUHJvcGVydHkudmFsdWUsIHBlcmlvZFRyYWNlLmNvdW50ZXJDbG9ja3dpc2UgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBzaGFwZS5hcmMoIDAsIDAsIHRyYWNlTGVuZ3RoLCAwLCAtcGVuZHVsdW0uYW5nbGVQcm9wZXJ0eS52YWx1ZSwgIXBlcmlvZFRyYWNlLmNvdW50ZXJDbG9ja3dpc2UgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcGF0aE5vZGUuc2V0U2hhcGUoIHNoYXBlICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gdXBkYXRlIHBhdGggc2hhcGVcclxuICAgIHBlbmR1bHVtLmFuZ2xlUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICBpZiAoIHBhdGhOb2RlLnZpc2libGUgJiYgIWlzQ29tcGxldGVkICkge1xyXG4gICAgICAgIHVwZGF0ZVNoYXBlKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdmlzaWJpbGl0eSBvZiBwYXRoIG5vZGVcclxuICAgIHBlbmR1bHVtLnBlcmlvZFRyYWNlLmlzVmlzaWJsZVByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIHBhdGhOb2RlLCAndmlzaWJsZScgKTtcclxuXHJcbiAgICAvLyBjbGVhciB0cmFjZSBpZiBwYXRoIHBvaW50cyB3ZXJlIHJlbW92ZWRcclxuICAgIHBlbmR1bHVtLnBlcmlvZFRyYWNlLm51bWJlck9mUG9pbnRzUHJvcGVydHkubGF6eUxpbmsoICggbnVtYmVyTmV3LCBudW1iZXJQcmV2ICkgPT4ge1xyXG4gICAgICBpZiAoIG51bWJlck5ldyA8IG51bWJlclByZXYgKSB7XHJcbiAgICAgICAgcmVzZXRQYXRoKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIHRoZSB2aWV3LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgaWYgKCB0aGlzLmZhZGVPdXRTcGVlZCApIHtcclxuICAgICAgdGhpcy5jb2xvckFscGhhID0gTWF0aC5tYXgoIDAsIHRoaXMuY29sb3JBbHBoYSAtIHRoaXMuZmFkZU91dFNwZWVkICogZHQgKTtcclxuICAgICAgdGhpcy50cmFjZUNvbG9yUHJvcGVydHkudmFsdWUgPSB0aGlzLnRyYWNlQ29sb3JQcm9wZXJ0eS52YWx1ZS53aXRoQWxwaGEoIHRoaXMuY29sb3JBbHBoYSApO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLmNvbG9yQWxwaGEgPT09IDAgKSB7XHJcbiAgICAgICAgdGhpcy5wZW5kdWx1bS5wZXJpb2RUcmFjZS5vbkZhZGVkKCk7XHJcbiAgICAgICAgdGhpcy5mYWRlT3V0U3BlZWQgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5wZW5kdWx1bUxhYi5yZWdpc3RlciggJ1BlcmlvZFRyYWNlTm9kZScsIFBlcmlvZFRyYWNlTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGVyaW9kVHJhY2VOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3JFLE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7O0FBRTlDO0FBQ0EsTUFBTUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDLENBQUM7O0FBRS9CLE1BQU1DLGVBQWUsU0FBU0osSUFBSSxDQUFDO0VBQ2pDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUssV0FBV0EsQ0FBRUMsUUFBUSxFQUFFQyxrQkFBa0IsRUFBRUMsT0FBTyxFQUFHO0lBRW5ELEtBQUssQ0FBRVYsS0FBSyxDQUFFO01BQ1pXLFFBQVEsRUFBRSxLQUFLO01BQ2ZDLFFBQVEsRUFBRUMsSUFBSSxDQUFDQyxFQUFFLEdBQUcsQ0FBQztNQUNyQkMsVUFBVSxFQUFFLElBQUk7TUFDaEJDLFdBQVcsRUFBRVAsa0JBQWtCLENBQUNRLG1CQUFtQixDQUFFbkIsT0FBTyxDQUFDb0IsSUFBSztJQUNwRSxDQUFDLEVBQUVSLE9BQVEsQ0FBRSxDQUFDO0lBRWQsSUFBSVMsV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDOztJQUV6QixNQUFNQyxTQUFTLEdBQUcsSUFBSW5CLEtBQUssQ0FBRU8sUUFBUSxDQUFDYSxLQUFNLENBQUM7O0lBRTdDO0lBQ0EsSUFBSSxDQUFDYixRQUFRLEdBQUdBLFFBQVE7O0lBRXhCO0lBQ0EsSUFBSSxDQUFDYyxrQkFBa0IsR0FBRyxJQUFJekIsUUFBUSxDQUFFdUIsU0FBVSxDQUFDOztJQUVuRDtJQUNBLElBQUksQ0FBQ0csVUFBVSxHQUFHLENBQUM7O0lBRW5CO0lBQ0EsSUFBSSxDQUFDQyxZQUFZLEdBQUcsSUFBSTs7SUFFeEI7SUFDQSxNQUFNQyxRQUFRLEdBQUcsSUFBSXRCLElBQUksQ0FBRSxJQUFJLEVBQUU7TUFDL0J1QixNQUFNLEVBQUUsSUFBSSxDQUFDSixrQkFBa0I7TUFDL0JLLFNBQVMsRUFBRTtJQUNiLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ0MsUUFBUSxDQUFFSCxRQUFTLENBQUM7O0lBRXpCO0lBQ0EsTUFBTUksU0FBUyxHQUFHQSxDQUFBLEtBQU07TUFDdEJKLFFBQVEsQ0FBQ0ssUUFBUSxDQUFFLElBQUssQ0FBQztNQUN6QlgsV0FBVyxHQUFHLEtBQUs7TUFDbkIsSUFBSSxDQUFDSSxVQUFVLEdBQUcsQ0FBQztNQUNuQixJQUFJLENBQUNELGtCQUFrQixDQUFDUyxLQUFLLEdBQUdYLFNBQVM7TUFDekMsSUFBSSxDQUFDSSxZQUFZLEdBQUcsSUFBSTtJQUMxQixDQUFDOztJQUVEO0lBQ0EsTUFBTVEsV0FBVyxHQUFHQSxDQUFBLEtBQU07TUFDeEIsTUFBTUMsV0FBVyxHQUFHekIsUUFBUSxDQUFDeUIsV0FBVztNQUN4QyxNQUFNQyxjQUFjLEdBQUdELFdBQVcsQ0FBQ0Usc0JBQXNCLENBQUNKLEtBQUs7TUFFL0QsSUFBS0csY0FBYyxHQUFHLENBQUMsRUFBRztRQUFFO1FBQzFCLE1BQU1FLEtBQUssR0FBRyxJQUFJckMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOztRQUUzQjtRQUNBLE1BQU1zQyxXQUFXLEdBQUc1QixrQkFBa0IsQ0FBQzZCLGlCQUFpQixDQUFFOUIsUUFBUSxDQUFDK0IsY0FBYyxDQUFDUixLQUFLLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBRSxDQUFDOztRQUU3RztRQUNBLElBQUlTLFNBQVMsR0FBR25DLGtCQUFrQjtRQUNsQyxJQUFLbUMsU0FBUyxHQUFHLENBQUMsR0FBR0gsV0FBVyxFQUFHO1VBQ2pDRyxTQUFTLEdBQUdILFdBQVcsR0FBRyxDQUFDO1FBQzdCOztRQUVBO1FBQ0EsSUFBS0gsY0FBYyxHQUFHLENBQUMsRUFBRztVQUN4QkUsS0FBSyxDQUFDSyxHQUFHLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRUosV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDSixXQUFXLENBQUNTLFVBQVUsRUFBRSxDQUFDVCxXQUFXLENBQUNVLGdCQUFpQixDQUFDO1VBQ3pGUCxLQUFLLENBQUNRLE1BQU0sQ0FBRSxDQUFFUCxXQUFXLEdBQUdHLFNBQVMsSUFBSzNCLElBQUksQ0FBQ2dDLEdBQUcsQ0FBRSxDQUFDWixXQUFXLENBQUNTLFVBQVcsQ0FBQyxFQUFFLENBQUVMLFdBQVcsR0FBR0csU0FBUyxJQUFLM0IsSUFBSSxDQUFDaUMsR0FBRyxDQUFFLENBQUNiLFdBQVcsQ0FBQ1MsVUFBVyxDQUFFLENBQUM7O1VBRXBKO1VBQ0EsSUFBS1IsY0FBYyxHQUFHLENBQUMsRUFBRztZQUN4QkUsS0FBSyxDQUFDSyxHQUFHLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRUosV0FBVyxHQUFHRyxTQUFTLEVBQUUsQ0FBQ1AsV0FBVyxDQUFDUyxVQUFVLEVBQUUsQ0FBQ1QsV0FBVyxDQUFDYyxXQUFXLEVBQUVkLFdBQVcsQ0FBQ1UsZ0JBQWlCLENBQUM7WUFDM0hQLEtBQUssQ0FBQ1EsTUFBTSxDQUFFLENBQUVQLFdBQVcsR0FBRyxDQUFDLEdBQUdHLFNBQVMsSUFBSzNCLElBQUksQ0FBQ2dDLEdBQUcsQ0FBRSxDQUFDWixXQUFXLENBQUNjLFdBQVksQ0FBQyxFQUFFLENBQUVWLFdBQVcsR0FBRyxDQUFDLEdBQUdHLFNBQVMsSUFBSzNCLElBQUksQ0FBQ2lDLEdBQUcsQ0FBRSxDQUFDYixXQUFXLENBQUNjLFdBQVksQ0FBRSxDQUFDOztZQUU5SjtZQUNBLElBQUtiLGNBQWMsR0FBRyxDQUFDLEVBQUc7Y0FDeEJFLEtBQUssQ0FBQ0ssR0FBRyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVKLFdBQVcsR0FBRyxDQUFDLEdBQUdHLFNBQVMsRUFBRSxDQUFDUCxXQUFXLENBQUNjLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQ2QsV0FBVyxDQUFDVSxnQkFBaUIsQ0FBQztjQUMxR3hCLFdBQVcsR0FBRyxJQUFJO2NBQ2xCLElBQUksQ0FBQ0ssWUFBWSxHQUFHLENBQUMsSUFBSyxDQUFDLEdBQUdoQixRQUFRLENBQUN3QyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFFO1lBQ3JFLENBQUMsTUFDSTtjQUNIWixLQUFLLENBQUNLLEdBQUcsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFSixXQUFXLEdBQUcsQ0FBQyxHQUFHRyxTQUFTLEVBQUUsQ0FBQ1AsV0FBVyxDQUFDYyxXQUFXLEVBQUUsQ0FBQ3ZDLFFBQVEsQ0FBQ3lDLGFBQWEsQ0FBQ2xCLEtBQUssRUFBRSxDQUFDRSxXQUFXLENBQUNVLGdCQUFpQixDQUFDO1lBQ3hJO1VBQ0YsQ0FBQyxNQUNJO1lBQ0hQLEtBQUssQ0FBQ0ssR0FBRyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVKLFdBQVcsR0FBR0csU0FBUyxFQUFFLENBQUNQLFdBQVcsQ0FBQ1MsVUFBVSxFQUFFLENBQUNsQyxRQUFRLENBQUN5QyxhQUFhLENBQUNsQixLQUFLLEVBQUVFLFdBQVcsQ0FBQ1UsZ0JBQWlCLENBQUM7VUFDbEk7UUFDRixDQUFDLE1BQ0k7VUFDSFAsS0FBSyxDQUFDSyxHQUFHLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRUosV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDN0IsUUFBUSxDQUFDeUMsYUFBYSxDQUFDbEIsS0FBSyxFQUFFLENBQUNFLFdBQVcsQ0FBQ1UsZ0JBQWlCLENBQUM7UUFDakc7UUFDQWxCLFFBQVEsQ0FBQ0ssUUFBUSxDQUFFTSxLQUFNLENBQUM7TUFDNUI7SUFDRixDQUFDOztJQUVEO0lBQ0E1QixRQUFRLENBQUN5QyxhQUFhLENBQUNDLElBQUksQ0FBRSxNQUFNO01BQ2pDLElBQUt6QixRQUFRLENBQUMwQixPQUFPLElBQUksQ0FBQ2hDLFdBQVcsRUFBRztRQUN0Q2EsV0FBVyxDQUFDLENBQUM7TUFDZjtJQUNGLENBQUUsQ0FBQzs7SUFFSDtJQUNBeEIsUUFBUSxDQUFDeUIsV0FBVyxDQUFDbUIsaUJBQWlCLENBQUNDLGFBQWEsQ0FBRTVCLFFBQVEsRUFBRSxTQUFVLENBQUM7O0lBRTNFO0lBQ0FqQixRQUFRLENBQUN5QixXQUFXLENBQUNFLHNCQUFzQixDQUFDbUIsUUFBUSxDQUFFLENBQUVDLFNBQVMsRUFBRUMsVUFBVSxLQUFNO01BQ2pGLElBQUtELFNBQVMsR0FBR0MsVUFBVSxFQUFHO1FBQzVCM0IsU0FBUyxDQUFDLENBQUM7TUFDYjtJQUNGLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFNEIsSUFBSUEsQ0FBRUMsRUFBRSxFQUFHO0lBQ1QsSUFBSyxJQUFJLENBQUNsQyxZQUFZLEVBQUc7TUFDdkIsSUFBSSxDQUFDRCxVQUFVLEdBQUdWLElBQUksQ0FBQzhDLEdBQUcsQ0FBRSxDQUFDLEVBQUUsSUFBSSxDQUFDcEMsVUFBVSxHQUFHLElBQUksQ0FBQ0MsWUFBWSxHQUFHa0MsRUFBRyxDQUFDO01BQ3pFLElBQUksQ0FBQ3BDLGtCQUFrQixDQUFDUyxLQUFLLEdBQUcsSUFBSSxDQUFDVCxrQkFBa0IsQ0FBQ1MsS0FBSyxDQUFDNkIsU0FBUyxDQUFFLElBQUksQ0FBQ3JDLFVBQVcsQ0FBQztNQUUxRixJQUFLLElBQUksQ0FBQ0EsVUFBVSxLQUFLLENBQUMsRUFBRztRQUMzQixJQUFJLENBQUNmLFFBQVEsQ0FBQ3lCLFdBQVcsQ0FBQzRCLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQ3JDLFlBQVksR0FBRyxJQUFJO01BQzFCO0lBQ0Y7RUFDRjtBQUNGO0FBRUFwQixXQUFXLENBQUMwRCxRQUFRLENBQUUsaUJBQWlCLEVBQUV4RCxlQUFnQixDQUFDO0FBRTFELGVBQWVBLGVBQWUifQ==