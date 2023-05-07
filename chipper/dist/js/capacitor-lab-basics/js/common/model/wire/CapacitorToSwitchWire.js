// Copyright 2015-2021, University of Colorado Boulder

/**
 * Creates a wire that connects a capacitor to a circuit switch.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import capacitorLabBasics from '../../../capacitorLabBasics.js';
import CircuitPosition from '../CircuitPosition.js';
import Wire from './Wire.js';
import WireSegment from './WireSegment.js';
class CapacitorToSwitchWire extends Wire {
  /**
   * @param {CircuitPosition} connectionPoint
   * @param {CircuitConfig} config
   * @param {Capacitor} capacitor
   * @param {CircuitSwitch} circuitSwitch
   */
  constructor(connectionPoint, config, capacitor, circuitSwitch) {
    // add the vertical segment.
    const switchConnectionPoint = circuitSwitch.hingePoint;
    let segment;
    if (connectionPoint === CircuitPosition.CAPACITOR_TOP) {
      segment = WireSegment.createComponentTopWireSegment(capacitor, switchConnectionPoint);
    } else {
      segment = WireSegment.createComponentBottomWireSegment(capacitor, switchConnectionPoint);
    }
    super(config.modelViewTransform, [segment], connectionPoint);
  }

  /**
   * Factory method for top CapacitorToSwitchWire instance
   * @public
   *
   * @param {CircuitConfig} config
   * @param {Capacitor} capacitor
   * @param {CircuitSwitch} circuitSwitch
   * @returns {CapacitorToSwitchWire}
   */
  static createCapacitorToSwitchWireTop(config, capacitor, circuitSwitch) {
    return new CapacitorToSwitchWire(CircuitPosition.CAPACITOR_TOP, config, capacitor, circuitSwitch);
  }

  /**
   * Factory method for bottom CapacitorToSwitchWire instance
   * @public
   *
   * @param {CircuitConfig} config
   * @param {Capacitor} capacitor
   * @param {CircuitSwitch} circuitSwitch
   * @returns {CapacitorToSwitchWire}
   */
  static createCapacitorToSwitchWireBottom(config, capacitor, circuitSwitch) {
    return new CapacitorToSwitchWire(CircuitPosition.CAPACITOR_BOTTOM, config, capacitor, circuitSwitch);
  }
}
capacitorLabBasics.register('CapacitorToSwitchWire', CapacitorToSwitchWire);
export default CapacitorToSwitchWire;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjYXBhY2l0b3JMYWJCYXNpY3MiLCJDaXJjdWl0UG9zaXRpb24iLCJXaXJlIiwiV2lyZVNlZ21lbnQiLCJDYXBhY2l0b3JUb1N3aXRjaFdpcmUiLCJjb25zdHJ1Y3RvciIsImNvbm5lY3Rpb25Qb2ludCIsImNvbmZpZyIsImNhcGFjaXRvciIsImNpcmN1aXRTd2l0Y2giLCJzd2l0Y2hDb25uZWN0aW9uUG9pbnQiLCJoaW5nZVBvaW50Iiwic2VnbWVudCIsIkNBUEFDSVRPUl9UT1AiLCJjcmVhdGVDb21wb25lbnRUb3BXaXJlU2VnbWVudCIsImNyZWF0ZUNvbXBvbmVudEJvdHRvbVdpcmVTZWdtZW50IiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiY3JlYXRlQ2FwYWNpdG9yVG9Td2l0Y2hXaXJlVG9wIiwiY3JlYXRlQ2FwYWNpdG9yVG9Td2l0Y2hXaXJlQm90dG9tIiwiQ0FQQUNJVE9SX0JPVFRPTSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2FwYWNpdG9yVG9Td2l0Y2hXaXJlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSB3aXJlIHRoYXQgY29ubmVjdHMgYSBjYXBhY2l0b3IgdG8gYSBjaXJjdWl0IHN3aXRjaC5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgQW5kcmV3IEFkYXJlIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBjYXBhY2l0b3JMYWJCYXNpY3MgZnJvbSAnLi4vLi4vLi4vY2FwYWNpdG9yTGFiQmFzaWNzLmpzJztcclxuaW1wb3J0IENpcmN1aXRQb3NpdGlvbiBmcm9tICcuLi9DaXJjdWl0UG9zaXRpb24uanMnO1xyXG5pbXBvcnQgV2lyZSBmcm9tICcuL1dpcmUuanMnO1xyXG5pbXBvcnQgV2lyZVNlZ21lbnQgZnJvbSAnLi9XaXJlU2VnbWVudC5qcyc7XHJcblxyXG5jbGFzcyBDYXBhY2l0b3JUb1N3aXRjaFdpcmUgZXh0ZW5kcyBXaXJlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge0NpcmN1aXRQb3NpdGlvbn0gY29ubmVjdGlvblBvaW50XHJcbiAgICogQHBhcmFtIHtDaXJjdWl0Q29uZmlnfSBjb25maWdcclxuICAgKiBAcGFyYW0ge0NhcGFjaXRvcn0gY2FwYWNpdG9yXHJcbiAgICogQHBhcmFtIHtDaXJjdWl0U3dpdGNofSBjaXJjdWl0U3dpdGNoXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNvbm5lY3Rpb25Qb2ludCwgY29uZmlnLCBjYXBhY2l0b3IsIGNpcmN1aXRTd2l0Y2ggKSB7XHJcblxyXG4gICAgLy8gYWRkIHRoZSB2ZXJ0aWNhbCBzZWdtZW50LlxyXG4gICAgY29uc3Qgc3dpdGNoQ29ubmVjdGlvblBvaW50ID0gY2lyY3VpdFN3aXRjaC5oaW5nZVBvaW50O1xyXG4gICAgbGV0IHNlZ21lbnQ7XHJcbiAgICBpZiAoIGNvbm5lY3Rpb25Qb2ludCA9PT0gQ2lyY3VpdFBvc2l0aW9uLkNBUEFDSVRPUl9UT1AgKSB7XHJcbiAgICAgIHNlZ21lbnQgPSBXaXJlU2VnbWVudC5jcmVhdGVDb21wb25lbnRUb3BXaXJlU2VnbWVudChcclxuICAgICAgICBjYXBhY2l0b3IsXHJcbiAgICAgICAgc3dpdGNoQ29ubmVjdGlvblBvaW50XHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgc2VnbWVudCA9IFdpcmVTZWdtZW50LmNyZWF0ZUNvbXBvbmVudEJvdHRvbVdpcmVTZWdtZW50KFxyXG4gICAgICAgIGNhcGFjaXRvcixcclxuICAgICAgICBzd2l0Y2hDb25uZWN0aW9uUG9pbnRcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBzdXBlciggY29uZmlnLm1vZGVsVmlld1RyYW5zZm9ybSwgWyBzZWdtZW50IF0sIGNvbm5lY3Rpb25Qb2ludCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmFjdG9yeSBtZXRob2QgZm9yIHRvcCBDYXBhY2l0b3JUb1N3aXRjaFdpcmUgaW5zdGFuY2VcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NpcmN1aXRDb25maWd9IGNvbmZpZ1xyXG4gICAqIEBwYXJhbSB7Q2FwYWNpdG9yfSBjYXBhY2l0b3JcclxuICAgKiBAcGFyYW0ge0NpcmN1aXRTd2l0Y2h9IGNpcmN1aXRTd2l0Y2hcclxuICAgKiBAcmV0dXJucyB7Q2FwYWNpdG9yVG9Td2l0Y2hXaXJlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjcmVhdGVDYXBhY2l0b3JUb1N3aXRjaFdpcmVUb3AoIGNvbmZpZywgY2FwYWNpdG9yLCBjaXJjdWl0U3dpdGNoICkge1xyXG4gICAgcmV0dXJuIG5ldyBDYXBhY2l0b3JUb1N3aXRjaFdpcmUoIENpcmN1aXRQb3NpdGlvbi5DQVBBQ0lUT1JfVE9QLCBjb25maWcsIGNhcGFjaXRvciwgY2lyY3VpdFN3aXRjaCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmFjdG9yeSBtZXRob2QgZm9yIGJvdHRvbSBDYXBhY2l0b3JUb1N3aXRjaFdpcmUgaW5zdGFuY2VcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NpcmN1aXRDb25maWd9IGNvbmZpZ1xyXG4gICAqIEBwYXJhbSB7Q2FwYWNpdG9yfSBjYXBhY2l0b3JcclxuICAgKiBAcGFyYW0ge0NpcmN1aXRTd2l0Y2h9IGNpcmN1aXRTd2l0Y2hcclxuICAgKiBAcmV0dXJucyB7Q2FwYWNpdG9yVG9Td2l0Y2hXaXJlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjcmVhdGVDYXBhY2l0b3JUb1N3aXRjaFdpcmVCb3R0b20oIGNvbmZpZywgY2FwYWNpdG9yLCBjaXJjdWl0U3dpdGNoICkge1xyXG4gICAgcmV0dXJuIG5ldyBDYXBhY2l0b3JUb1N3aXRjaFdpcmUoIENpcmN1aXRQb3NpdGlvbi5DQVBBQ0lUT1JfQk9UVE9NLCBjb25maWcsIGNhcGFjaXRvciwgY2lyY3VpdFN3aXRjaCApO1xyXG4gIH1cclxufVxyXG5cclxuY2FwYWNpdG9yTGFiQmFzaWNzLnJlZ2lzdGVyKCAnQ2FwYWNpdG9yVG9Td2l0Y2hXaXJlJywgQ2FwYWNpdG9yVG9Td2l0Y2hXaXJlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDYXBhY2l0b3JUb1N3aXRjaFdpcmU7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGtCQUFrQixNQUFNLGdDQUFnQztBQUMvRCxPQUFPQyxlQUFlLE1BQU0sdUJBQXVCO0FBQ25ELE9BQU9DLElBQUksTUFBTSxXQUFXO0FBQzVCLE9BQU9DLFdBQVcsTUFBTSxrQkFBa0I7QUFFMUMsTUFBTUMscUJBQXFCLFNBQVNGLElBQUksQ0FBQztFQUN2QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUcsV0FBV0EsQ0FBRUMsZUFBZSxFQUFFQyxNQUFNLEVBQUVDLFNBQVMsRUFBRUMsYUFBYSxFQUFHO0lBRS9EO0lBQ0EsTUFBTUMscUJBQXFCLEdBQUdELGFBQWEsQ0FBQ0UsVUFBVTtJQUN0RCxJQUFJQyxPQUFPO0lBQ1gsSUFBS04sZUFBZSxLQUFLTCxlQUFlLENBQUNZLGFBQWEsRUFBRztNQUN2REQsT0FBTyxHQUFHVCxXQUFXLENBQUNXLDZCQUE2QixDQUNqRE4sU0FBUyxFQUNURSxxQkFDRixDQUFDO0lBQ0gsQ0FBQyxNQUNJO01BQ0hFLE9BQU8sR0FBR1QsV0FBVyxDQUFDWSxnQ0FBZ0MsQ0FDcERQLFNBQVMsRUFDVEUscUJBQ0YsQ0FBQztJQUNIO0lBRUEsS0FBSyxDQUFFSCxNQUFNLENBQUNTLGtCQUFrQixFQUFFLENBQUVKLE9BQU8sQ0FBRSxFQUFFTixlQUFnQixDQUFDO0VBQ2xFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU9XLDhCQUE4QkEsQ0FBRVYsTUFBTSxFQUFFQyxTQUFTLEVBQUVDLGFBQWEsRUFBRztJQUN4RSxPQUFPLElBQUlMLHFCQUFxQixDQUFFSCxlQUFlLENBQUNZLGFBQWEsRUFBRU4sTUFBTSxFQUFFQyxTQUFTLEVBQUVDLGFBQWMsQ0FBQztFQUNyRzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPUyxpQ0FBaUNBLENBQUVYLE1BQU0sRUFBRUMsU0FBUyxFQUFFQyxhQUFhLEVBQUc7SUFDM0UsT0FBTyxJQUFJTCxxQkFBcUIsQ0FBRUgsZUFBZSxDQUFDa0IsZ0JBQWdCLEVBQUVaLE1BQU0sRUFBRUMsU0FBUyxFQUFFQyxhQUFjLENBQUM7RUFDeEc7QUFDRjtBQUVBVCxrQkFBa0IsQ0FBQ29CLFFBQVEsQ0FBRSx1QkFBdUIsRUFBRWhCLHFCQUFzQixDQUFDO0FBRTdFLGVBQWVBLHFCQUFxQiJ9