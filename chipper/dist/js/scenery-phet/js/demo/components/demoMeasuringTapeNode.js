// Copyright 2022, University of Colorado Boulder

/**
 * Demo for MeasuringTapeNode
 */

import Property from '../../../../axon/js/Property.js';
import MeasuringTapeNode from '../../MeasuringTapeNode.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
export default function demoMeasuringTapeNode(layoutBounds) {
  const measuringTapeUnitsProperty = new Property({
    name: 'meters',
    multiplier: 1
  });
  return new MeasuringTapeNode(measuringTapeUnitsProperty, {
    textColor: 'black',
    textBackgroundColor: 'rgba( 255, 0, 0, 0.1 )',
    // translucent red
    textBackgroundXMargin: 10,
    textBackgroundYMargin: 3,
    textBackgroundCornerRadius: 5,
    dragBounds: layoutBounds,
    basePositionProperty: new Vector2Property(new Vector2(layoutBounds.centerX, layoutBounds.centerY)),
    tipPositionProperty: new Vector2Property(new Vector2(layoutBounds.centerX + 100, layoutBounds.centerY))
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIk1lYXN1cmluZ1RhcGVOb2RlIiwiVmVjdG9yMlByb3BlcnR5IiwiVmVjdG9yMiIsImRlbW9NZWFzdXJpbmdUYXBlTm9kZSIsImxheW91dEJvdW5kcyIsIm1lYXN1cmluZ1RhcGVVbml0c1Byb3BlcnR5IiwibmFtZSIsIm11bHRpcGxpZXIiLCJ0ZXh0Q29sb3IiLCJ0ZXh0QmFja2dyb3VuZENvbG9yIiwidGV4dEJhY2tncm91bmRYTWFyZ2luIiwidGV4dEJhY2tncm91bmRZTWFyZ2luIiwidGV4dEJhY2tncm91bmRDb3JuZXJSYWRpdXMiLCJkcmFnQm91bmRzIiwiYmFzZVBvc2l0aW9uUHJvcGVydHkiLCJjZW50ZXJYIiwiY2VudGVyWSIsInRpcFBvc2l0aW9uUHJvcGVydHkiXSwic291cmNlcyI6WyJkZW1vTWVhc3VyaW5nVGFwZU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERlbW8gZm9yIE1lYXN1cmluZ1RhcGVOb2RlXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTWVhc3VyaW5nVGFwZU5vZGUgZnJvbSAnLi4vLi4vTWVhc3VyaW5nVGFwZU5vZGUuanMnO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZW1vTWVhc3VyaW5nVGFwZU5vZGUoIGxheW91dEJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcclxuXHJcbiAgY29uc3QgbWVhc3VyaW5nVGFwZVVuaXRzUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHsgbmFtZTogJ21ldGVycycsIG11bHRpcGxpZXI6IDEgfSApO1xyXG5cclxuICByZXR1cm4gbmV3IE1lYXN1cmluZ1RhcGVOb2RlKCBtZWFzdXJpbmdUYXBlVW5pdHNQcm9wZXJ0eSwge1xyXG4gICAgdGV4dENvbG9yOiAnYmxhY2snLFxyXG4gICAgdGV4dEJhY2tncm91bmRDb2xvcjogJ3JnYmEoIDI1NSwgMCwgMCwgMC4xICknLCAvLyB0cmFuc2x1Y2VudCByZWRcclxuICAgIHRleHRCYWNrZ3JvdW5kWE1hcmdpbjogMTAsXHJcbiAgICB0ZXh0QmFja2dyb3VuZFlNYXJnaW46IDMsXHJcbiAgICB0ZXh0QmFja2dyb3VuZENvcm5lclJhZGl1czogNSxcclxuICAgIGRyYWdCb3VuZHM6IGxheW91dEJvdW5kcyxcclxuICAgIGJhc2VQb3NpdGlvblByb3BlcnR5OiBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggbGF5b3V0Qm91bmRzLmNlbnRlclgsIGxheW91dEJvdW5kcy5jZW50ZXJZICkgKSxcclxuICAgIHRpcFBvc2l0aW9uUHJvcGVydHk6IG5ldyBWZWN0b3IyUHJvcGVydHkoIG5ldyBWZWN0b3IyKCBsYXlvdXRCb3VuZHMuY2VudGVyWCArIDEwMCwgbGF5b3V0Qm91bmRzLmNlbnRlclkgKSApXHJcbiAgfSApO1xyXG59Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxpQkFBaUIsTUFBTSw0QkFBNEI7QUFHMUQsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBRW5ELGVBQWUsU0FBU0MscUJBQXFCQSxDQUFFQyxZQUFxQixFQUFTO0VBRTNFLE1BQU1DLDBCQUEwQixHQUFHLElBQUlOLFFBQVEsQ0FBRTtJQUFFTyxJQUFJLEVBQUUsUUFBUTtJQUFFQyxVQUFVLEVBQUU7RUFBRSxDQUFFLENBQUM7RUFFcEYsT0FBTyxJQUFJUCxpQkFBaUIsQ0FBRUssMEJBQTBCLEVBQUU7SUFDeERHLFNBQVMsRUFBRSxPQUFPO0lBQ2xCQyxtQkFBbUIsRUFBRSx3QkFBd0I7SUFBRTtJQUMvQ0MscUJBQXFCLEVBQUUsRUFBRTtJQUN6QkMscUJBQXFCLEVBQUUsQ0FBQztJQUN4QkMsMEJBQTBCLEVBQUUsQ0FBQztJQUM3QkMsVUFBVSxFQUFFVCxZQUFZO0lBQ3hCVSxvQkFBb0IsRUFBRSxJQUFJYixlQUFlLENBQUUsSUFBSUMsT0FBTyxDQUFFRSxZQUFZLENBQUNXLE9BQU8sRUFBRVgsWUFBWSxDQUFDWSxPQUFRLENBQUUsQ0FBQztJQUN0R0MsbUJBQW1CLEVBQUUsSUFBSWhCLGVBQWUsQ0FBRSxJQUFJQyxPQUFPLENBQUVFLFlBQVksQ0FBQ1csT0FBTyxHQUFHLEdBQUcsRUFBRVgsWUFBWSxDQUFDWSxPQUFRLENBQUU7RUFDNUcsQ0FBRSxDQUFDO0FBQ0wifQ==