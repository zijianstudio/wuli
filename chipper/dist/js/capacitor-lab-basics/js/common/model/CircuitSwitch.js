// Copyright 2015-2022, University of Colorado Boulder

/**
 * The circuit switch has a hinge point and an end point that can switch to new
 * connection points.  It is assumed that the circuit switch is connected to
 * a capacitor in this simulation.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { Shape } from '../../../../kite/js/imports.js';
import CapacitorConstants from '../../../../scenery-phet/js/capacitor/CapacitorConstants.js';
import capacitorLabBasics from '../../capacitorLabBasics.js';
import CLBConstants from '../CLBConstants.js';
import CircuitPosition from './CircuitPosition.js';
import CircuitState from './CircuitState.js';
import Connection from './Connection.js';
import Wire from './wire/Wire.js';
import WireSegment from './wire/WireSegment.js';

// constants
const SWITCH_ANGLE = Math.PI / 4; // angle from the vertical of each connection point

class CircuitSwitch {
  /**
   * @param {string} positionLabel - 'top' or 'bottom'
   * @param {CircuitConfig} config
   * @param {Property.<CircuitState>} circuitConnectionProperty
   * @param {Tandem} tandem
   */
  constructor(positionLabel, config, circuitConnectionProperty, tandem) {
    // Validate positionLabel string
    assert && assert(positionLabel === 'top' || positionLabel === 'bottom', `Unsupported positionLabel: ${positionLabel}`);

    // @public {Vector3}
    this.hingePoint = this.getSwitchHingePoint(positionLabel, config);

    // @private {YawPitchModelViewTransform3}
    this.modelViewTransform = config.modelViewTransform;

    // @public {Property.<CircuitState>}
    this.circuitConnectionProperty = circuitConnectionProperty;

    // @private {Array.<Connection>}
    this.connections = this.getSwitchConnections(positionLabel, this.hingePoint.toVector2(), config.circuitConnections);

    // @public {Property.<number>} - Angle of the switch
    this.angleProperty = new NumberProperty(positionLabel === 'top' ? -Math.PI * 3 / 4 : Math.PI * 3 / 4, {
      tandem: tandem.createTandem('angleProperty'),
      units: 'radians',
      range: config.lightBulb ? new Range(positionLabel === 'top' ? -Math.PI * 3 / 4 : Math.PI / 4, positionLabel === 'top' ? -Math.PI / 4 : Math.PI * 3 / 4) : new Range(positionLabel === 'top' ? -Math.PI * 3 / 4 : Math.PI / 2, positionLabel === 'top' ? -Math.PI / 2 : Math.PI * 3 / 4)
    });

    // Assign string identifying connection point
    const connectionName = positionLabel === 'top' ? CircuitPosition.CIRCUIT_SWITCH_TOP : CircuitPosition.CIRCUIT_SWITCH_BOTTOM;

    // @public {WireSegment} Add the switch wire that spans two connection points. Default connection is to the battery.
    this.switchSegment = new WireSegment(this.hingePoint, this.getConnection(circuitConnectionProperty.value).position);
    this.switchSegment.hingePoint = this.hingePoint;

    // @public {Wire} - Wire between the hinge point and end point
    this.switchWire = new Wire(config.modelViewTransform, [this.switchSegment], connectionName);
    this.angleProperty.link(angle => {
      const hingePoint = this.switchSegment.hingePoint;

      // Shorten the switch wire (requested in #140)
      this.switchSegment.endPointProperty.value = hingePoint.plus(Vector2.createPolar(0.9 * CLBConstants.SWITCH_WIRE_LENGTH, angle).toVector3());
    });

    // set active connection whenever circuit connection type changes.
    circuitConnectionProperty.link(circuitConnection => {
      // If the switch is being dragged, it is in transit and there is no active connection.
      if (circuitConnection === CircuitState.SWITCH_IN_TRANSIT) {
        return;
      }
      const wireDelta = this.getConnection(circuitConnection).position.minus(this.switchSegment.hingePoint);
      this.angleProperty.value = wireDelta.toVector2().angle;
    });
  }

  /**
   * Get (x,y,z) position of switch pivot point
   * @private
   *
   * @param {string} positionLabel - 'top' or 'bottom'
   * @param {CircuitConfig} config - Class containing circuit geometry and properties
   *
   * @returns {Vector3}
   */
  getSwitchHingePoint(positionLabel, config) {
    // Validate positionLabel string
    assert && assert(positionLabel === 'top' || positionLabel === 'bottom', `Unsupported positionLabel: ${positionLabel}`);

    // create the circuit switches that connect the capacitor to the circuit
    const x = CLBConstants.BATTERY_POSITION.x + config.capacitorXSpacing;
    const z = CLBConstants.BATTERY_POSITION.z;
    const yOffset = CapacitorConstants.PLATE_SEPARATION_RANGE.max + CLBConstants.SWITCH_Y_SPACING;
    let y = CLBConstants.BATTERY_POSITION.y;
    if (positionLabel === 'top') {
      y -= yOffset;
    } else if (positionLabel === 'bottom') {
      y += yOffset;
    }
    return new Vector3(x, y, z);
  }

  /**
   * Get an array of objects containing positions (as Vector3) and connection types (as strings)
   * of the switch connection points
   * @private
   *
   * @param  {string} positionLabel - 'top' or 'bottom'
   * @param  {Vector2} hingeXY - Position of switch hinge
   * @param  {Array.<CircuitState>} circuitStates
   * @returns {Array.<Connection>}
   */
  getSwitchConnections(positionLabel, hingeXY, circuitStates) {
    // Projection of switch wire vector to its components (angle is from a vertical wire)
    const length = CLBConstants.SWITCH_WIRE_LENGTH;
    const dx = length * Math.sin(SWITCH_ANGLE);
    const dy = length * Math.cos(SWITCH_ANGLE);

    // Top point of hinge from pivot point
    const topOffset = new Vector2(0, length);

    // Compute 2D switch contact points

    let topPoint;
    let leftPoint;
    let rightPoint;
    if (positionLabel === 'top') {
      topPoint = hingeXY.minus(topOffset);
      leftPoint = hingeXY.minusXY(dx, dy);
      rightPoint = hingeXY.minusXY(-dx, dy);
    } else {
      topPoint = hingeXY.plus(topOffset);
      leftPoint = hingeXY.plusXY(-dx, dy);
      rightPoint = hingeXY.plusXY(dx, dy);
    }
    const connections = [];
    circuitStates.forEach(circuitState => {
      if (circuitState === CircuitState.OPEN_CIRCUIT) {
        connections.push(new Connection(topPoint.toVector3(), circuitState));
      } else if (circuitState === CircuitState.BATTERY_CONNECTED) {
        connections.push(new Connection(leftPoint.toVector3(), circuitState));
      } else if (circuitState === CircuitState.LIGHT_BULB_CONNECTED) {
        connections.push(new Connection(rightPoint.toVector3(), circuitState));
      } else {
        assert && assert(false, 'attempting to create switch conection which is not supported');
      }
    });
    return connections;
  }

  /**
   * Get the desired connection from the connection type.
   * @public
   *
   * @param {CircuitState} connectionType
   * @returns {Connection}
   */
  getConnection(connectionType) {
    const returnConnection = _.find(this.connections, connection => connection.type === connectionType);
    assert && assert(returnConnection, `No connection type for this circuit named ${connectionType}`);
    return returnConnection;
  }

  /**
   * Convenience method for getting the connection positions. Similar to getConnection above, but directly returns
   * the position.
   * @public
   *
   * @param {CircuitState} connectionType - BATTERY_CONNECTED || OPEN_CIRCUIT || LIGHT_BULB_CONNECTED
   * @returns {Vector3}
   */
  getConnectionPoint(connectionType) {
    assert && assert(connectionType !== CircuitState.SWITCH_IN_TRANSIT, 'Cannot call getConnectionPoint while SWITCH_IN_TRANSIT');
    return this.getConnection(connectionType).position;
  }

  /**
   * Get the position of the endpoint for the circuit switch segment.
   * @public
   *
   * @returns {Vector3}
   */
  getSwitchEndPoint() {
    const endPoint = this.switchSegment.endPointProperty.value;
    assert && assert(endPoint instanceof Vector3);
    return endPoint;
  }

  /**
   * Get the limiting angle of the circuit switch to the right.
   * The limiting angle is dependent on wheter a light bulb is connected to the circuit.
   * @public
   *
   * @returns {number}
   */
  getRightLimitAngle() {
    // Get the right-most connection.
    // Would prefer to use _.maxBy, but not available in lodash 2.4.1
    const rightMost = _.last(_.sortBy(this.connections, [connection => connection.position.x]));
    return rightMost.position.minus(this.hingePoint).toVector2().angle;
  }

  /**
   * Get the limiting angle of the circuit switch to the left.
   * @public
   *
   * @returns {number}
   */
  getLeftLimitAngle() {
    // Get the left-most connection.
    // Would prefer to use _.minBy, but not available in lodash 2.4.1
    const leftMost = _.first(_.sortBy(this.connections, [connection => connection.position.x]));
    return leftMost.position.minus(this.hingePoint).toVector2().angle;
  }

  /**
   * Returns whether or not the probe is connected
   * @param {Shape}probe
   * @public
   *
   * @returns {boolean}
   */
  contacts(probe) {
    const connection = this.circuitConnectionProperty.value;

    // No connection point if it isn't connected
    if (connection === CircuitState.SWITCH_IN_TRANSIT || connection === CircuitState.OPEN_CIRCUIT) {
      return false;
    }
    const endPoint = this.switchSegment.endPointProperty.value;
    const hingePoint = this.switchSegment.hingePoint;
    const delta = endPoint.minus(hingePoint).setMagnitude(CLBConstants.SWITCH_WIRE_LENGTH);
    const point = this.modelViewTransform.modelToViewPosition(hingePoint.plus(delta));
    const circle = Shape.circle(point.x, point.y, CLBConstants.CONNECTION_POINT_RADIUS);
    return probe.bounds.intersectsBounds(circle.bounds) && probe.shapeIntersection(circle).getNonoverlappingArea() > 0;
  }

  /**
   * Factory method for a top CircuitSwitch
   * @public
   *
   * @param {CircuitConfig} config
   * @param {Property.<CircuitState>} circuitConnectionProperty
   * @param {Tandem} tandem
   * @returns {CircuitSwitch}
   */
  static TOP(config, circuitConnectionProperty, tandem) {
    return new CircuitSwitch('top', config, circuitConnectionProperty, tandem);
  }

  /**
   * Factory method for a bottom CircuitSwitch
   * @public
   *
   * @param {CircuitConfig} config
   * @param {Property.<CircuitState>} circuitConnectionProperty
   * @param {Tandem} tandem
   * @returns {CircuitSwitch}
   */
  static BOTTOM(config, circuitConnectionProperty, tandem) {
    return new CircuitSwitch('bottom', config, circuitConnectionProperty, tandem);
  }
}
capacitorLabBasics.register('CircuitSwitch', CircuitSwitch);
export default CircuitSwitch;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiVmVjdG9yMiIsIlZlY3RvcjMiLCJTaGFwZSIsIkNhcGFjaXRvckNvbnN0YW50cyIsImNhcGFjaXRvckxhYkJhc2ljcyIsIkNMQkNvbnN0YW50cyIsIkNpcmN1aXRQb3NpdGlvbiIsIkNpcmN1aXRTdGF0ZSIsIkNvbm5lY3Rpb24iLCJXaXJlIiwiV2lyZVNlZ21lbnQiLCJTV0lUQ0hfQU5HTEUiLCJNYXRoIiwiUEkiLCJDaXJjdWl0U3dpdGNoIiwiY29uc3RydWN0b3IiLCJwb3NpdGlvbkxhYmVsIiwiY29uZmlnIiwiY2lyY3VpdENvbm5lY3Rpb25Qcm9wZXJ0eSIsInRhbmRlbSIsImFzc2VydCIsImhpbmdlUG9pbnQiLCJnZXRTd2l0Y2hIaW5nZVBvaW50IiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiY29ubmVjdGlvbnMiLCJnZXRTd2l0Y2hDb25uZWN0aW9ucyIsInRvVmVjdG9yMiIsImNpcmN1aXRDb25uZWN0aW9ucyIsImFuZ2xlUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJ1bml0cyIsInJhbmdlIiwibGlnaHRCdWxiIiwiY29ubmVjdGlvbk5hbWUiLCJDSVJDVUlUX1NXSVRDSF9UT1AiLCJDSVJDVUlUX1NXSVRDSF9CT1RUT00iLCJzd2l0Y2hTZWdtZW50IiwiZ2V0Q29ubmVjdGlvbiIsInZhbHVlIiwicG9zaXRpb24iLCJzd2l0Y2hXaXJlIiwibGluayIsImFuZ2xlIiwiZW5kUG9pbnRQcm9wZXJ0eSIsInBsdXMiLCJjcmVhdGVQb2xhciIsIlNXSVRDSF9XSVJFX0xFTkdUSCIsInRvVmVjdG9yMyIsImNpcmN1aXRDb25uZWN0aW9uIiwiU1dJVENIX0lOX1RSQU5TSVQiLCJ3aXJlRGVsdGEiLCJtaW51cyIsIngiLCJCQVRURVJZX1BPU0lUSU9OIiwiY2FwYWNpdG9yWFNwYWNpbmciLCJ6IiwieU9mZnNldCIsIlBMQVRFX1NFUEFSQVRJT05fUkFOR0UiLCJtYXgiLCJTV0lUQ0hfWV9TUEFDSU5HIiwieSIsImhpbmdlWFkiLCJjaXJjdWl0U3RhdGVzIiwibGVuZ3RoIiwiZHgiLCJzaW4iLCJkeSIsImNvcyIsInRvcE9mZnNldCIsInRvcFBvaW50IiwibGVmdFBvaW50IiwicmlnaHRQb2ludCIsIm1pbnVzWFkiLCJwbHVzWFkiLCJmb3JFYWNoIiwiY2lyY3VpdFN0YXRlIiwiT1BFTl9DSVJDVUlUIiwicHVzaCIsIkJBVFRFUllfQ09OTkVDVEVEIiwiTElHSFRfQlVMQl9DT05ORUNURUQiLCJjb25uZWN0aW9uVHlwZSIsInJldHVybkNvbm5lY3Rpb24iLCJfIiwiZmluZCIsImNvbm5lY3Rpb24iLCJ0eXBlIiwiZ2V0Q29ubmVjdGlvblBvaW50IiwiZ2V0U3dpdGNoRW5kUG9pbnQiLCJlbmRQb2ludCIsImdldFJpZ2h0TGltaXRBbmdsZSIsInJpZ2h0TW9zdCIsImxhc3QiLCJzb3J0QnkiLCJnZXRMZWZ0TGltaXRBbmdsZSIsImxlZnRNb3N0IiwiZmlyc3QiLCJjb250YWN0cyIsInByb2JlIiwiZGVsdGEiLCJzZXRNYWduaXR1ZGUiLCJwb2ludCIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJjaXJjbGUiLCJDT05ORUNUSU9OX1BPSU5UX1JBRElVUyIsImJvdW5kcyIsImludGVyc2VjdHNCb3VuZHMiLCJzaGFwZUludGVyc2VjdGlvbiIsImdldE5vbm92ZXJsYXBwaW5nQXJlYSIsIlRPUCIsIkJPVFRPTSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2lyY3VpdFN3aXRjaC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgY2lyY3VpdCBzd2l0Y2ggaGFzIGEgaGluZ2UgcG9pbnQgYW5kIGFuIGVuZCBwb2ludCB0aGF0IGNhbiBzd2l0Y2ggdG8gbmV3XHJcbiAqIGNvbm5lY3Rpb24gcG9pbnRzLiAgSXQgaXMgYXNzdW1lZCB0aGF0IHRoZSBjaXJjdWl0IHN3aXRjaCBpcyBjb25uZWN0ZWQgdG9cclxuICogYSBjYXBhY2l0b3IgaW4gdGhpcyBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBBbmRyZXcgQWRhcmUgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMy5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IENhcGFjaXRvckNvbnN0YW50cyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvY2FwYWNpdG9yL0NhcGFjaXRvckNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBjYXBhY2l0b3JMYWJCYXNpY3MgZnJvbSAnLi4vLi4vY2FwYWNpdG9yTGFiQmFzaWNzLmpzJztcclxuaW1wb3J0IENMQkNvbnN0YW50cyBmcm9tICcuLi9DTEJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdFBvc2l0aW9uIGZyb20gJy4vQ2lyY3VpdFBvc2l0aW9uLmpzJztcclxuaW1wb3J0IENpcmN1aXRTdGF0ZSBmcm9tICcuL0NpcmN1aXRTdGF0ZS5qcyc7XHJcbmltcG9ydCBDb25uZWN0aW9uIGZyb20gJy4vQ29ubmVjdGlvbi5qcyc7XHJcbmltcG9ydCBXaXJlIGZyb20gJy4vd2lyZS9XaXJlLmpzJztcclxuaW1wb3J0IFdpcmVTZWdtZW50IGZyb20gJy4vd2lyZS9XaXJlU2VnbWVudC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgU1dJVENIX0FOR0xFID0gTWF0aC5QSSAvIDQ7IC8vIGFuZ2xlIGZyb20gdGhlIHZlcnRpY2FsIG9mIGVhY2ggY29ubmVjdGlvbiBwb2ludFxyXG5cclxuY2xhc3MgQ2lyY3VpdFN3aXRjaCB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBvc2l0aW9uTGFiZWwgLSAndG9wJyBvciAnYm90dG9tJ1xyXG4gICAqIEBwYXJhbSB7Q2lyY3VpdENvbmZpZ30gY29uZmlnXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Q2lyY3VpdFN0YXRlPn0gY2lyY3VpdENvbm5lY3Rpb25Qcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcG9zaXRpb25MYWJlbCwgY29uZmlnLCBjaXJjdWl0Q29ubmVjdGlvblByb3BlcnR5LCB0YW5kZW0gKSB7XHJcblxyXG4gICAgLy8gVmFsaWRhdGUgcG9zaXRpb25MYWJlbCBzdHJpbmdcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBvc2l0aW9uTGFiZWwgPT09ICd0b3AnIHx8IHBvc2l0aW9uTGFiZWwgPT09ICdib3R0b20nLFxyXG4gICAgICBgVW5zdXBwb3J0ZWQgcG9zaXRpb25MYWJlbDogJHtwb3NpdGlvbkxhYmVsfWAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtWZWN0b3IzfVxyXG4gICAgdGhpcy5oaW5nZVBvaW50ID0gdGhpcy5nZXRTd2l0Y2hIaW5nZVBvaW50KCBwb3NpdGlvbkxhYmVsLCBjb25maWcgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7WWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zfVxyXG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gPSBjb25maWcubW9kZWxWaWV3VHJhbnNmb3JtO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxDaXJjdWl0U3RhdGU+fVxyXG4gICAgdGhpcy5jaXJjdWl0Q29ubmVjdGlvblByb3BlcnR5ID0gY2lyY3VpdENvbm5lY3Rpb25Qcm9wZXJ0eTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPENvbm5lY3Rpb24+fVxyXG4gICAgdGhpcy5jb25uZWN0aW9ucyA9IHRoaXMuZ2V0U3dpdGNoQ29ubmVjdGlvbnMoIHBvc2l0aW9uTGFiZWwsIHRoaXMuaGluZ2VQb2ludC50b1ZlY3RvcjIoKSwgY29uZmlnLmNpcmN1aXRDb25uZWN0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSAtIEFuZ2xlIG9mIHRoZSBzd2l0Y2hcclxuICAgIHRoaXMuYW5nbGVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggcG9zaXRpb25MYWJlbCA9PT0gJ3RvcCcgPyAtTWF0aC5QSSAqIDMgLyA0IDogTWF0aC5QSSAqIDMgLyA0LCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FuZ2xlUHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAncmFkaWFucycsXHJcbiAgICAgIHJhbmdlOiBjb25maWcubGlnaHRCdWxiID8gbmV3IFJhbmdlKFxyXG4gICAgICAgIHBvc2l0aW9uTGFiZWwgPT09ICd0b3AnID8gLU1hdGguUEkgKiAzIC8gNCA6IE1hdGguUEkgLyA0LFxyXG4gICAgICAgIHBvc2l0aW9uTGFiZWwgPT09ICd0b3AnID8gLU1hdGguUEkgLyA0IDogTWF0aC5QSSAqIDMgLyA0XHJcbiAgICAgICkgOiBuZXcgUmFuZ2UoXHJcbiAgICAgICAgcG9zaXRpb25MYWJlbCA9PT0gJ3RvcCcgPyAtTWF0aC5QSSAqIDMgLyA0IDogTWF0aC5QSSAvIDIsXHJcbiAgICAgICAgcG9zaXRpb25MYWJlbCA9PT0gJ3RvcCcgPyAtTWF0aC5QSSAvIDIgOiBNYXRoLlBJICogMyAvIDRcclxuICAgICAgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFzc2lnbiBzdHJpbmcgaWRlbnRpZnlpbmcgY29ubmVjdGlvbiBwb2ludFxyXG4gICAgY29uc3QgY29ubmVjdGlvbk5hbWUgPSAoIHBvc2l0aW9uTGFiZWwgPT09ICd0b3AnICkgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBDaXJjdWl0UG9zaXRpb24uQ0lSQ1VJVF9TV0lUQ0hfVE9QIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2lyY3VpdFBvc2l0aW9uLkNJUkNVSVRfU1dJVENIX0JPVFRPTTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtXaXJlU2VnbWVudH0gQWRkIHRoZSBzd2l0Y2ggd2lyZSB0aGF0IHNwYW5zIHR3byBjb25uZWN0aW9uIHBvaW50cy4gRGVmYXVsdCBjb25uZWN0aW9uIGlzIHRvIHRoZSBiYXR0ZXJ5LlxyXG4gICAgdGhpcy5zd2l0Y2hTZWdtZW50ID0gbmV3IFdpcmVTZWdtZW50KFxyXG4gICAgICB0aGlzLmhpbmdlUG9pbnQsXHJcbiAgICAgIHRoaXMuZ2V0Q29ubmVjdGlvbiggY2lyY3VpdENvbm5lY3Rpb25Qcm9wZXJ0eS52YWx1ZSApLnBvc2l0aW9uXHJcbiAgICApO1xyXG4gICAgdGhpcy5zd2l0Y2hTZWdtZW50LmhpbmdlUG9pbnQgPSB0aGlzLmhpbmdlUG9pbnQ7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7V2lyZX0gLSBXaXJlIGJldHdlZW4gdGhlIGhpbmdlIHBvaW50IGFuZCBlbmQgcG9pbnRcclxuICAgIHRoaXMuc3dpdGNoV2lyZSA9IG5ldyBXaXJlKCBjb25maWcubW9kZWxWaWV3VHJhbnNmb3JtLCBbIHRoaXMuc3dpdGNoU2VnbWVudCBdLCBjb25uZWN0aW9uTmFtZSApO1xyXG5cclxuICAgIHRoaXMuYW5nbGVQcm9wZXJ0eS5saW5rKCBhbmdsZSA9PiB7XHJcbiAgICAgIGNvbnN0IGhpbmdlUG9pbnQgPSB0aGlzLnN3aXRjaFNlZ21lbnQuaGluZ2VQb2ludDtcclxuXHJcbiAgICAgIC8vIFNob3J0ZW4gdGhlIHN3aXRjaCB3aXJlIChyZXF1ZXN0ZWQgaW4gIzE0MClcclxuICAgICAgdGhpcy5zd2l0Y2hTZWdtZW50LmVuZFBvaW50UHJvcGVydHkudmFsdWUgPSBoaW5nZVBvaW50LnBsdXMoIFZlY3RvcjIuY3JlYXRlUG9sYXIoIDAuOSAqIENMQkNvbnN0YW50cy5TV0lUQ0hfV0lSRV9MRU5HVEgsIGFuZ2xlICkudG9WZWN0b3IzKCkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBzZXQgYWN0aXZlIGNvbm5lY3Rpb24gd2hlbmV2ZXIgY2lyY3VpdCBjb25uZWN0aW9uIHR5cGUgY2hhbmdlcy5cclxuICAgIGNpcmN1aXRDb25uZWN0aW9uUHJvcGVydHkubGluayggY2lyY3VpdENvbm5lY3Rpb24gPT4ge1xyXG5cclxuICAgICAgLy8gSWYgdGhlIHN3aXRjaCBpcyBiZWluZyBkcmFnZ2VkLCBpdCBpcyBpbiB0cmFuc2l0IGFuZCB0aGVyZSBpcyBubyBhY3RpdmUgY29ubmVjdGlvbi5cclxuICAgICAgaWYgKCBjaXJjdWl0Q29ubmVjdGlvbiA9PT0gQ2lyY3VpdFN0YXRlLlNXSVRDSF9JTl9UUkFOU0lUICkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qgd2lyZURlbHRhID0gdGhpcy5nZXRDb25uZWN0aW9uKCBjaXJjdWl0Q29ubmVjdGlvbiApLnBvc2l0aW9uLm1pbnVzKCB0aGlzLnN3aXRjaFNlZ21lbnQuaGluZ2VQb2ludCApO1xyXG4gICAgICB0aGlzLmFuZ2xlUHJvcGVydHkudmFsdWUgPSB3aXJlRGVsdGEudG9WZWN0b3IyKCkuYW5nbGU7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0ICh4LHkseikgcG9zaXRpb24gb2Ygc3dpdGNoIHBpdm90IHBvaW50XHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwb3NpdGlvbkxhYmVsIC0gJ3RvcCcgb3IgJ2JvdHRvbSdcclxuICAgKiBAcGFyYW0ge0NpcmN1aXRDb25maWd9IGNvbmZpZyAtIENsYXNzIGNvbnRhaW5pbmcgY2lyY3VpdCBnZW9tZXRyeSBhbmQgcHJvcGVydGllc1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjN9XHJcbiAgICovXHJcbiAgZ2V0U3dpdGNoSGluZ2VQb2ludCggcG9zaXRpb25MYWJlbCwgY29uZmlnICkge1xyXG5cclxuICAgIC8vIFZhbGlkYXRlIHBvc2l0aW9uTGFiZWwgc3RyaW5nXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb3NpdGlvbkxhYmVsID09PSAndG9wJyB8fCBwb3NpdGlvbkxhYmVsID09PSAnYm90dG9tJyxcclxuICAgICAgYFVuc3VwcG9ydGVkIHBvc2l0aW9uTGFiZWw6ICR7cG9zaXRpb25MYWJlbH1gICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBjaXJjdWl0IHN3aXRjaGVzIHRoYXQgY29ubmVjdCB0aGUgY2FwYWNpdG9yIHRvIHRoZSBjaXJjdWl0XHJcbiAgICBjb25zdCB4ID0gQ0xCQ29uc3RhbnRzLkJBVFRFUllfUE9TSVRJT04ueCArIGNvbmZpZy5jYXBhY2l0b3JYU3BhY2luZztcclxuICAgIGNvbnN0IHogPSBDTEJDb25zdGFudHMuQkFUVEVSWV9QT1NJVElPTi56O1xyXG5cclxuICAgIGNvbnN0IHlPZmZzZXQgPSBDYXBhY2l0b3JDb25zdGFudHMuUExBVEVfU0VQQVJBVElPTl9SQU5HRS5tYXggKyBDTEJDb25zdGFudHMuU1dJVENIX1lfU1BBQ0lORztcclxuICAgIGxldCB5ID0gQ0xCQ29uc3RhbnRzLkJBVFRFUllfUE9TSVRJT04ueTtcclxuXHJcbiAgICBpZiAoIHBvc2l0aW9uTGFiZWwgPT09ICd0b3AnICkge1xyXG4gICAgICB5IC09IHlPZmZzZXQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggcG9zaXRpb25MYWJlbCA9PT0gJ2JvdHRvbScgKSB7XHJcbiAgICAgIHkgKz0geU9mZnNldDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIHgsIHksIHogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhbiBhcnJheSBvZiBvYmplY3RzIGNvbnRhaW5pbmcgcG9zaXRpb25zIChhcyBWZWN0b3IzKSBhbmQgY29ubmVjdGlvbiB0eXBlcyAoYXMgc3RyaW5ncylcclxuICAgKiBvZiB0aGUgc3dpdGNoIGNvbm5lY3Rpb24gcG9pbnRzXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSAge3N0cmluZ30gcG9zaXRpb25MYWJlbCAtICd0b3AnIG9yICdib3R0b20nXHJcbiAgICogQHBhcmFtICB7VmVjdG9yMn0gaGluZ2VYWSAtIFBvc2l0aW9uIG9mIHN3aXRjaCBoaW5nZVxyXG4gICAqIEBwYXJhbSAge0FycmF5LjxDaXJjdWl0U3RhdGU+fSBjaXJjdWl0U3RhdGVzXHJcbiAgICogQHJldHVybnMge0FycmF5LjxDb25uZWN0aW9uPn1cclxuICAgKi9cclxuICBnZXRTd2l0Y2hDb25uZWN0aW9ucyggcG9zaXRpb25MYWJlbCwgaGluZ2VYWSwgY2lyY3VpdFN0YXRlcyApIHtcclxuICAgIC8vIFByb2plY3Rpb24gb2Ygc3dpdGNoIHdpcmUgdmVjdG9yIHRvIGl0cyBjb21wb25lbnRzIChhbmdsZSBpcyBmcm9tIGEgdmVydGljYWwgd2lyZSlcclxuICAgIGNvbnN0IGxlbmd0aCA9IENMQkNvbnN0YW50cy5TV0lUQ0hfV0lSRV9MRU5HVEg7XHJcbiAgICBjb25zdCBkeCA9IGxlbmd0aCAqIE1hdGguc2luKCBTV0lUQ0hfQU5HTEUgKTtcclxuICAgIGNvbnN0IGR5ID0gbGVuZ3RoICogTWF0aC5jb3MoIFNXSVRDSF9BTkdMRSApO1xyXG5cclxuICAgIC8vIFRvcCBwb2ludCBvZiBoaW5nZSBmcm9tIHBpdm90IHBvaW50XHJcbiAgICBjb25zdCB0b3BPZmZzZXQgPSBuZXcgVmVjdG9yMiggMCwgbGVuZ3RoICk7XHJcblxyXG4gICAgLy8gQ29tcHV0ZSAyRCBzd2l0Y2ggY29udGFjdCBwb2ludHNcclxuXHJcbiAgICBsZXQgdG9wUG9pbnQ7XHJcbiAgICBsZXQgbGVmdFBvaW50O1xyXG4gICAgbGV0IHJpZ2h0UG9pbnQ7XHJcblxyXG4gICAgaWYgKCBwb3NpdGlvbkxhYmVsID09PSAndG9wJyApIHtcclxuICAgICAgdG9wUG9pbnQgPSBoaW5nZVhZLm1pbnVzKCB0b3BPZmZzZXQgKTtcclxuICAgICAgbGVmdFBvaW50ID0gaGluZ2VYWS5taW51c1hZKCBkeCwgZHkgKTtcclxuICAgICAgcmlnaHRQb2ludCA9IGhpbmdlWFkubWludXNYWSggLWR4LCBkeSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRvcFBvaW50ID0gaGluZ2VYWS5wbHVzKCB0b3BPZmZzZXQgKTtcclxuICAgICAgbGVmdFBvaW50ID0gaGluZ2VYWS5wbHVzWFkoIC1keCwgZHkgKTtcclxuICAgICAgcmlnaHRQb2ludCA9IGhpbmdlWFkucGx1c1hZKCBkeCwgZHkgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb25uZWN0aW9ucyA9IFtdO1xyXG4gICAgY2lyY3VpdFN0YXRlcy5mb3JFYWNoKCBjaXJjdWl0U3RhdGUgPT4ge1xyXG4gICAgICBpZiAoIGNpcmN1aXRTdGF0ZSA9PT0gQ2lyY3VpdFN0YXRlLk9QRU5fQ0lSQ1VJVCApIHtcclxuICAgICAgICBjb25uZWN0aW9ucy5wdXNoKCBuZXcgQ29ubmVjdGlvbiggdG9wUG9pbnQudG9WZWN0b3IzKCksIGNpcmN1aXRTdGF0ZSApICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGNpcmN1aXRTdGF0ZSA9PT0gQ2lyY3VpdFN0YXRlLkJBVFRFUllfQ09OTkVDVEVEICkge1xyXG4gICAgICAgIGNvbm5lY3Rpb25zLnB1c2goIG5ldyBDb25uZWN0aW9uKCBsZWZ0UG9pbnQudG9WZWN0b3IzKCksIGNpcmN1aXRTdGF0ZSApICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGNpcmN1aXRTdGF0ZSA9PT0gQ2lyY3VpdFN0YXRlLkxJR0hUX0JVTEJfQ09OTkVDVEVEICkge1xyXG4gICAgICAgIGNvbm5lY3Rpb25zLnB1c2goIG5ldyBDb25uZWN0aW9uKCByaWdodFBvaW50LnRvVmVjdG9yMygpLCBjaXJjdWl0U3RhdGUgKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnYXR0ZW1wdGluZyB0byBjcmVhdGUgc3dpdGNoIGNvbmVjdGlvbiB3aGljaCBpcyBub3Qgc3VwcG9ydGVkJyApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIGNvbm5lY3Rpb25zO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBkZXNpcmVkIGNvbm5lY3Rpb24gZnJvbSB0aGUgY29ubmVjdGlvbiB0eXBlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Q2lyY3VpdFN0YXRlfSBjb25uZWN0aW9uVHlwZVxyXG4gICAqIEByZXR1cm5zIHtDb25uZWN0aW9ufVxyXG4gICAqL1xyXG4gIGdldENvbm5lY3Rpb24oIGNvbm5lY3Rpb25UeXBlICkge1xyXG5cclxuICAgIGNvbnN0IHJldHVybkNvbm5lY3Rpb24gPSBfLmZpbmQoIHRoaXMuY29ubmVjdGlvbnMsIGNvbm5lY3Rpb24gPT4gY29ubmVjdGlvbi50eXBlID09PSBjb25uZWN0aW9uVHlwZSApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJldHVybkNvbm5lY3Rpb24sIGBObyBjb25uZWN0aW9uIHR5cGUgZm9yIHRoaXMgY2lyY3VpdCBuYW1lZCAke2Nvbm5lY3Rpb25UeXBlfWAgKTtcclxuXHJcbiAgICByZXR1cm4gcmV0dXJuQ29ubmVjdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlbmllbmNlIG1ldGhvZCBmb3IgZ2V0dGluZyB0aGUgY29ubmVjdGlvbiBwb3NpdGlvbnMuIFNpbWlsYXIgdG8gZ2V0Q29ubmVjdGlvbiBhYm92ZSwgYnV0IGRpcmVjdGx5IHJldHVybnNcclxuICAgKiB0aGUgcG9zaXRpb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtDaXJjdWl0U3RhdGV9IGNvbm5lY3Rpb25UeXBlIC0gQkFUVEVSWV9DT05ORUNURUQgfHwgT1BFTl9DSVJDVUlUIHx8IExJR0hUX0JVTEJfQ09OTkVDVEVEXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjN9XHJcbiAgICovXHJcbiAgZ2V0Q29ubmVjdGlvblBvaW50KCBjb25uZWN0aW9uVHlwZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbm5lY3Rpb25UeXBlICE9PSBDaXJjdWl0U3RhdGUuU1dJVENIX0lOX1RSQU5TSVQsXHJcbiAgICAgICdDYW5ub3QgY2FsbCBnZXRDb25uZWN0aW9uUG9pbnQgd2hpbGUgU1dJVENIX0lOX1RSQU5TSVQnICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q29ubmVjdGlvbiggY29ubmVjdGlvblR5cGUgKS5wb3NpdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgcG9zaXRpb24gb2YgdGhlIGVuZHBvaW50IGZvciB0aGUgY2lyY3VpdCBzd2l0Y2ggc2VnbWVudC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yM31cclxuICAgKi9cclxuICBnZXRTd2l0Y2hFbmRQb2ludCgpIHtcclxuXHJcbiAgICBjb25zdCBlbmRQb2ludCA9IHRoaXMuc3dpdGNoU2VnbWVudC5lbmRQb2ludFByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVuZFBvaW50IGluc3RhbmNlb2YgVmVjdG9yMyApO1xyXG5cclxuICAgIHJldHVybiBlbmRQb2ludDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgbGltaXRpbmcgYW5nbGUgb2YgdGhlIGNpcmN1aXQgc3dpdGNoIHRvIHRoZSByaWdodC5cclxuICAgKiBUaGUgbGltaXRpbmcgYW5nbGUgaXMgZGVwZW5kZW50IG9uIHdoZXRlciBhIGxpZ2h0IGJ1bGIgaXMgY29ubmVjdGVkIHRvIHRoZSBjaXJjdWl0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0UmlnaHRMaW1pdEFuZ2xlKCkge1xyXG5cclxuICAgIC8vIEdldCB0aGUgcmlnaHQtbW9zdCBjb25uZWN0aW9uLlxyXG4gICAgLy8gV291bGQgcHJlZmVyIHRvIHVzZSBfLm1heEJ5LCBidXQgbm90IGF2YWlsYWJsZSBpbiBsb2Rhc2ggMi40LjFcclxuICAgIGNvbnN0IHJpZ2h0TW9zdCA9IF8ubGFzdCggXy5zb3J0QnkoIHRoaXMuY29ubmVjdGlvbnMsIFsgY29ubmVjdGlvbiA9PiBjb25uZWN0aW9uLnBvc2l0aW9uLnggXSApICk7XHJcblxyXG4gICAgcmV0dXJuIHJpZ2h0TW9zdC5wb3NpdGlvbi5taW51cyggdGhpcy5oaW5nZVBvaW50ICkudG9WZWN0b3IyKCkuYW5nbGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGxpbWl0aW5nIGFuZ2xlIG9mIHRoZSBjaXJjdWl0IHN3aXRjaCB0byB0aGUgbGVmdC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldExlZnRMaW1pdEFuZ2xlKCkge1xyXG5cclxuICAgIC8vIEdldCB0aGUgbGVmdC1tb3N0IGNvbm5lY3Rpb24uXHJcbiAgICAvLyBXb3VsZCBwcmVmZXIgdG8gdXNlIF8ubWluQnksIGJ1dCBub3QgYXZhaWxhYmxlIGluIGxvZGFzaCAyLjQuMVxyXG4gICAgY29uc3QgbGVmdE1vc3QgPSBfLmZpcnN0KCBfLnNvcnRCeSggdGhpcy5jb25uZWN0aW9ucywgWyBjb25uZWN0aW9uID0+IGNvbm5lY3Rpb24ucG9zaXRpb24ueCBdICkgKTtcclxuXHJcbiAgICByZXR1cm4gbGVmdE1vc3QucG9zaXRpb24ubWludXMoIHRoaXMuaGluZ2VQb2ludCApLnRvVmVjdG9yMigpLmFuZ2xlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgcHJvYmUgaXMgY29ubmVjdGVkXHJcbiAgICogQHBhcmFtIHtTaGFwZX1wcm9iZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGNvbnRhY3RzKCBwcm9iZSApIHtcclxuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSB0aGlzLmNpcmN1aXRDb25uZWN0aW9uUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgLy8gTm8gY29ubmVjdGlvbiBwb2ludCBpZiBpdCBpc24ndCBjb25uZWN0ZWRcclxuICAgIGlmICggY29ubmVjdGlvbiA9PT0gQ2lyY3VpdFN0YXRlLlNXSVRDSF9JTl9UUkFOU0lUIHx8IGNvbm5lY3Rpb24gPT09IENpcmN1aXRTdGF0ZS5PUEVOX0NJUkNVSVQgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBlbmRQb2ludCA9IHRoaXMuc3dpdGNoU2VnbWVudC5lbmRQb2ludFByb3BlcnR5LnZhbHVlO1xyXG4gICAgY29uc3QgaGluZ2VQb2ludCA9IHRoaXMuc3dpdGNoU2VnbWVudC5oaW5nZVBvaW50O1xyXG4gICAgY29uc3QgZGVsdGEgPSBlbmRQb2ludC5taW51cyggaGluZ2VQb2ludCApLnNldE1hZ25pdHVkZSggQ0xCQ29uc3RhbnRzLlNXSVRDSF9XSVJFX0xFTkdUSCApO1xyXG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBoaW5nZVBvaW50LnBsdXMoIGRlbHRhICkgKTtcclxuICAgIGNvbnN0IGNpcmNsZSA9IFNoYXBlLmNpcmNsZSggcG9pbnQueCwgcG9pbnQueSwgQ0xCQ29uc3RhbnRzLkNPTk5FQ1RJT05fUE9JTlRfUkFESVVTICk7XHJcblxyXG4gICAgcmV0dXJuIHByb2JlLmJvdW5kcy5pbnRlcnNlY3RzQm91bmRzKCBjaXJjbGUuYm91bmRzICkgJiZcclxuICAgICAgICAgICBwcm9iZS5zaGFwZUludGVyc2VjdGlvbiggY2lyY2xlICkuZ2V0Tm9ub3ZlcmxhcHBpbmdBcmVhKCkgPiAwO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIEZhY3RvcnkgbWV0aG9kIGZvciBhIHRvcCBDaXJjdWl0U3dpdGNoXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtDaXJjdWl0Q29uZmlnfSBjb25maWdcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxDaXJjdWl0U3RhdGU+fSBjaXJjdWl0Q29ubmVjdGlvblByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEByZXR1cm5zIHtDaXJjdWl0U3dpdGNofVxyXG4gICAqL1xyXG4gIHN0YXRpYyBUT1AoIGNvbmZpZywgY2lyY3VpdENvbm5lY3Rpb25Qcm9wZXJ0eSwgdGFuZGVtICkge1xyXG4gICAgcmV0dXJuIG5ldyBDaXJjdWl0U3dpdGNoKCAndG9wJywgY29uZmlnLCBjaXJjdWl0Q29ubmVjdGlvblByb3BlcnR5LCB0YW5kZW0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZhY3RvcnkgbWV0aG9kIGZvciBhIGJvdHRvbSBDaXJjdWl0U3dpdGNoXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtDaXJjdWl0Q29uZmlnfSBjb25maWdcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxDaXJjdWl0U3RhdGU+fSBjaXJjdWl0Q29ubmVjdGlvblByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEByZXR1cm5zIHtDaXJjdWl0U3dpdGNofVxyXG4gICAqL1xyXG4gIHN0YXRpYyBCT1RUT00oIGNvbmZpZywgY2lyY3VpdENvbm5lY3Rpb25Qcm9wZXJ0eSwgdGFuZGVtICkge1xyXG4gICAgcmV0dXJuIG5ldyBDaXJjdWl0U3dpdGNoKCAnYm90dG9tJywgY29uZmlnLCBjaXJjdWl0Q29ubmVjdGlvblByb3BlcnR5LCB0YW5kZW0gKTtcclxuICB9XHJcbn1cclxuXHJcbmNhcGFjaXRvckxhYkJhc2ljcy5yZWdpc3RlciggJ0NpcmN1aXRTd2l0Y2gnLCBDaXJjdWl0U3dpdGNoICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDaXJjdWl0U3dpdGNoO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLGtCQUFrQixNQUFNLDZEQUE2RDtBQUM1RixPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MsWUFBWSxNQUFNLG9CQUFvQjtBQUM3QyxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBQ2xELE9BQU9DLFlBQVksTUFBTSxtQkFBbUI7QUFDNUMsT0FBT0MsVUFBVSxNQUFNLGlCQUFpQjtBQUN4QyxPQUFPQyxJQUFJLE1BQU0sZ0JBQWdCO0FBQ2pDLE9BQU9DLFdBQVcsTUFBTSx1QkFBdUI7O0FBRS9DO0FBQ0EsTUFBTUMsWUFBWSxHQUFHQyxJQUFJLENBQUNDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFbEMsTUFBTUMsYUFBYSxDQUFDO0VBQ2xCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxhQUFhLEVBQUVDLE1BQU0sRUFBRUMseUJBQXlCLEVBQUVDLE1BQU0sRUFBRztJQUV0RTtJQUNBQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUosYUFBYSxLQUFLLEtBQUssSUFBSUEsYUFBYSxLQUFLLFFBQVEsRUFDcEUsOEJBQTZCQSxhQUFjLEVBQUUs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