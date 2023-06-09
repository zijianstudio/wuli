// Copyright 2022, University of Colorado Boulder

/**
 * Demo for CapacitorNode
 *
 * @author Sam Reid
 */

import CapacitorConstants from '../../capacitor/CapacitorConstants.js';
import YawPitchModelViewTransform3 from '../../capacitor/YawPitchModelViewTransform3.js';
import CapacitorNode from '../../capacitor/CapacitorNode.js';
import NumberControl from '../../NumberControl.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import Range from '../../../../dot/js/Range.js';
import Property from '../../../../axon/js/Property.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import { VBox } from '../../../../scenery/js/imports.js';
export default function demoCapacitorNode(layoutBounds) {
  const plateBounds = new Bounds3(0, 0, 0, 0.01414213562373095, CapacitorConstants.PLATE_HEIGHT, 0.01414213562373095);

  // An object literal is fine in a demo like this, but we probably wouldn't do this in production code.
  const circuit = {
    maxPlateCharge: 2.6562e-12,
    capacitor: {
      plateSizeProperty: new Property(plateBounds),
      plateSeparationProperty: new NumberProperty(0.006),
      plateVoltageProperty: new NumberProperty(1.5),
      plateChargeProperty: new NumberProperty(4.426999999999999e-13 / 10 * 4),
      getEffectiveEField() {
        return 0;
      }
    }
  };
  const modelViewTransform = new YawPitchModelViewTransform3();
  const plateChargeVisibleProperty = new BooleanProperty(true);
  const electricFieldVisibleProperty = new BooleanProperty(true);
  const capacitorNode = new CapacitorNode(circuit, modelViewTransform, plateChargeVisibleProperty, electricFieldVisibleProperty, {
    tandem: Tandem.OPTIONAL
  });
  const controls = new VBox({
    children: [new NumberControl('separation', circuit.capacitor.plateSeparationProperty, new Range(0, 0.01), {
      delta: 0.0001,
      numberDisplayOptions: {
        decimalPlaces: 5
      }
    }), new NumberControl('charge', circuit.capacitor.plateChargeProperty, new Range(-4.426999999999999e-13 * 1.5, 4.426999999999999e-13 * 1.5), {
      delta: 4.426999999999999e-13 / 30,
      numberDisplayOptions: {
        decimalPlaces: 20
      }
    })]
  });
  return new VBox({
    spacing: 20,
    resize: false,
    children: [capacitorNode, controls],
    center: layoutBounds.center
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDYXBhY2l0b3JDb25zdGFudHMiLCJZYXdQaXRjaE1vZGVsVmlld1RyYW5zZm9ybTMiLCJDYXBhY2l0b3JOb2RlIiwiTnVtYmVyQ29udHJvbCIsIkJvdW5kczMiLCJSYW5nZSIsIlByb3BlcnR5IiwiTnVtYmVyUHJvcGVydHkiLCJCb29sZWFuUHJvcGVydHkiLCJUYW5kZW0iLCJWQm94IiwiZGVtb0NhcGFjaXRvck5vZGUiLCJsYXlvdXRCb3VuZHMiLCJwbGF0ZUJvdW5kcyIsIlBMQVRFX0hFSUdIVCIsImNpcmN1aXQiLCJtYXhQbGF0ZUNoYXJnZSIsImNhcGFjaXRvciIsInBsYXRlU2l6ZVByb3BlcnR5IiwicGxhdGVTZXBhcmF0aW9uUHJvcGVydHkiLCJwbGF0ZVZvbHRhZ2VQcm9wZXJ0eSIsInBsYXRlQ2hhcmdlUHJvcGVydHkiLCJnZXRFZmZlY3RpdmVFRmllbGQiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJwbGF0ZUNoYXJnZVZpc2libGVQcm9wZXJ0eSIsImVsZWN0cmljRmllbGRWaXNpYmxlUHJvcGVydHkiLCJjYXBhY2l0b3JOb2RlIiwidGFuZGVtIiwiT1BUSU9OQUwiLCJjb250cm9scyIsImNoaWxkcmVuIiwiZGVsdGEiLCJudW1iZXJEaXNwbGF5T3B0aW9ucyIsImRlY2ltYWxQbGFjZXMiLCJzcGFjaW5nIiwicmVzaXplIiwiY2VudGVyIl0sInNvdXJjZXMiOlsiZGVtb0NhcGFjaXRvck5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERlbW8gZm9yIENhcGFjaXRvck5vZGVcclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZFxyXG4gKi9cclxuXHJcbmltcG9ydCBDYXBhY2l0b3JDb25zdGFudHMgZnJvbSAnLi4vLi4vY2FwYWNpdG9yL0NhcGFjaXRvckNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBZYXdQaXRjaE1vZGVsVmlld1RyYW5zZm9ybTMgZnJvbSAnLi4vLi4vY2FwYWNpdG9yL1lhd1BpdGNoTW9kZWxWaWV3VHJhbnNmb3JtMy5qcyc7XHJcbmltcG9ydCBDYXBhY2l0b3JOb2RlIGZyb20gJy4uLy4uL2NhcGFjaXRvci9DYXBhY2l0b3JOb2RlLmpzJztcclxuaW1wb3J0IE51bWJlckNvbnRyb2wgZnJvbSAnLi4vLi4vTnVtYmVyQ29udHJvbC5qcyc7XHJcbmltcG9ydCBCb3VuZHMzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMzLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9DYXBhY2l0b3JOb2RlKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XHJcblxyXG4gIGNvbnN0IHBsYXRlQm91bmRzID0gbmV3IEJvdW5kczMoIDAsIDAsIDAsIDAuMDE0MTQyMTM1NjIzNzMwOTUsIENhcGFjaXRvckNvbnN0YW50cy5QTEFURV9IRUlHSFQsIDAuMDE0MTQyMTM1NjIzNzMwOTUgKTtcclxuXHJcbiAgLy8gQW4gb2JqZWN0IGxpdGVyYWwgaXMgZmluZSBpbiBhIGRlbW8gbGlrZSB0aGlzLCBidXQgd2UgcHJvYmFibHkgd291bGRuJ3QgZG8gdGhpcyBpbiBwcm9kdWN0aW9uIGNvZGUuXHJcbiAgY29uc3QgY2lyY3VpdCA9IHtcclxuICAgIG1heFBsYXRlQ2hhcmdlOiAyLjY1NjJlLTEyLFxyXG4gICAgY2FwYWNpdG9yOiB7XHJcbiAgICAgIHBsYXRlU2l6ZVByb3BlcnR5OiBuZXcgUHJvcGVydHkoIHBsYXRlQm91bmRzICksXHJcbiAgICAgIHBsYXRlU2VwYXJhdGlvblByb3BlcnR5OiBuZXcgTnVtYmVyUHJvcGVydHkoIDAuMDA2ICksXHJcbiAgICAgIHBsYXRlVm9sdGFnZVByb3BlcnR5OiBuZXcgTnVtYmVyUHJvcGVydHkoIDEuNSApLFxyXG4gICAgICBwbGF0ZUNoYXJnZVByb3BlcnR5OiBuZXcgTnVtYmVyUHJvcGVydHkoIDQuNDI2OTk5OTk5OTk5OTk5ZS0xMyAvIDEwICogNCApLFxyXG4gICAgICBnZXRFZmZlY3RpdmVFRmllbGQoKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG4gIGNvbnN0IG1vZGVsVmlld1RyYW5zZm9ybSA9IG5ldyBZYXdQaXRjaE1vZGVsVmlld1RyYW5zZm9ybTMoKTtcclxuICBjb25zdCBwbGF0ZUNoYXJnZVZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuICBjb25zdCBlbGVjdHJpY0ZpZWxkVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApO1xyXG5cclxuICBjb25zdCBjYXBhY2l0b3JOb2RlID0gbmV3IENhcGFjaXRvck5vZGUoIGNpcmN1aXQsIG1vZGVsVmlld1RyYW5zZm9ybSwgcGxhdGVDaGFyZ2VWaXNpYmxlUHJvcGVydHksIGVsZWN0cmljRmllbGRWaXNpYmxlUHJvcGVydHksIHtcclxuICAgIHRhbmRlbTogVGFuZGVtLk9QVElPTkFMXHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBjb250cm9scyA9IG5ldyBWQm94KCB7XHJcbiAgICBjaGlsZHJlbjogW1xyXG4gICAgICBuZXcgTnVtYmVyQ29udHJvbCggJ3NlcGFyYXRpb24nLCBjaXJjdWl0LmNhcGFjaXRvci5wbGF0ZVNlcGFyYXRpb25Qcm9wZXJ0eSwgbmV3IFJhbmdlKCAwLCAwLjAxICksIHtcclxuICAgICAgICBkZWx0YTogMC4wMDAxLFxyXG4gICAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgICBkZWNpbWFsUGxhY2VzOiA1XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICksXHJcbiAgICAgIG5ldyBOdW1iZXJDb250cm9sKCAnY2hhcmdlJywgY2lyY3VpdC5jYXBhY2l0b3IucGxhdGVDaGFyZ2VQcm9wZXJ0eSwgbmV3IFJhbmdlKCAtKCA0LjQyNjk5OTk5OTk5OTk5OWUtMTMgKSAqIDEuNSwgKCA0LjQyNjk5OTk5OTk5OTk5OWUtMTMgKSAqIDEuNSApLCB7XHJcbiAgICAgICAgZGVsdGE6IDQuNDI2OTk5OTk5OTk5OTk5ZS0xMyAvIDMwLFxyXG4gICAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgICBkZWNpbWFsUGxhY2VzOiAyMFxyXG4gICAgICAgIH1cclxuICAgICAgfSApXHJcbiAgICBdXHJcbiAgfSApO1xyXG5cclxuICByZXR1cm4gbmV3IFZCb3goIHtcclxuICAgIHNwYWNpbmc6IDIwLFxyXG4gICAgcmVzaXplOiBmYWxzZSxcclxuICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgIGNhcGFjaXRvck5vZGUsXHJcbiAgICAgIGNvbnRyb2xzXHJcbiAgICBdLFxyXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXHJcbiAgfSApO1xyXG59Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGtCQUFrQixNQUFNLHVDQUF1QztBQUN0RSxPQUFPQywyQkFBMkIsTUFBTSxn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