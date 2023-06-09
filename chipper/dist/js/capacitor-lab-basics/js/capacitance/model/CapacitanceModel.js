// Copyright 2015-2022, University of Colorado Boulder

/**
 * Capacitance model for Capacitor Lab: Basics.  This model has a battery connected in parallel to a capacitor, and
 * allows the user to modify capacitor plate geometry to illustrate relationships with capacitance.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import capacitorLabBasics from '../../capacitorLabBasics.js';
import CircuitConfig from '../../common/model/CircuitConfig.js';
import CircuitState from '../../common/model/CircuitState.js';
import CLBModel from '../../common/model/CLBModel.js';
import BarMeter from '../../common/model/meter/BarMeter.js';
import CapacitanceCircuit from './CapacitanceCircuit.js';
class CapacitanceModel extends CLBModel {
  /**
   * @param {Property.<boolean>} switchUsedProperty - whether switch has been changed by user. Affects both screens.
   * @param {YawPitchModelViewTransform3} modelViewTransform
   * @param {Tandem} tandem
   */
  constructor(switchUsedProperty, modelViewTransform, tandem) {
    const circuitConfig = CircuitConfig.create({
      circuitConnections: [CircuitState.BATTERY_CONNECTED, CircuitState.OPEN_CIRCUIT]
    });
    const circuit = new CapacitanceCircuit(circuitConfig, tandem.createTandem('circuit'));
    super(circuit, switchUsedProperty, modelViewTransform, tandem);

    // @public {CapacitanceCircuit}
    this.circuit = circuit;

    // @public {BarMeter}
    this.capacitanceMeter = new BarMeter(this.capacitanceMeterVisibleProperty, this.circuit.capacitor.capacitanceProperty);

    // @public {BarMeter}
    this.plateChargeMeter = new BarMeter(this.topPlateChargeMeterVisibleProperty, this.circuit.capacitor.plateChargeProperty);

    // @public {BarMeter}
    this.storedEnergyMeter = new BarMeter(this.storedEnergyMeterVisibleProperty, this.circuit.capacitor.storedEnergyProperty);
  }

  /**
   * Reset function for this model.
   * @public
   * @override
   */
  reset() {
    this.capacitanceMeter.reset();
    this.plateChargeMeter.reset();
    this.storedEnergyMeter.reset();
    this.voltmeter.reset();
    this.circuit.reset();
    super.reset();
  }
}
capacitorLabBasics.register('CapacitanceModel', CapacitanceModel);
export default CapacitanceModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjYXBhY2l0b3JMYWJCYXNpY3MiLCJDaXJjdWl0Q29uZmlnIiwiQ2lyY3VpdFN0YXRlIiwiQ0xCTW9kZWwiLCJCYXJNZXRlciIsIkNhcGFjaXRhbmNlQ2lyY3VpdCIsIkNhcGFjaXRhbmNlTW9kZWwiLCJjb25zdHJ1Y3RvciIsInN3aXRjaFVzZWRQcm9wZXJ0eSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsInRhbmRlbSIsImNpcmN1aXRDb25maWciLCJjcmVhdGUiLCJjaXJjdWl0Q29ubmVjdGlvbnMiLCJCQVRURVJZX0NPTk5FQ1RFRCIsIk9QRU5fQ0lSQ1VJVCIsImNpcmN1aXQiLCJjcmVhdGVUYW5kZW0iLCJjYXBhY2l0YW5jZU1ldGVyIiwiY2FwYWNpdGFuY2VNZXRlclZpc2libGVQcm9wZXJ0eSIsImNhcGFjaXRvciIsImNhcGFjaXRhbmNlUHJvcGVydHkiLCJwbGF0ZUNoYXJnZU1ldGVyIiwidG9wUGxhdGVDaGFyZ2VNZXRlclZpc2libGVQcm9wZXJ0eSIsInBsYXRlQ2hhcmdlUHJvcGVydHkiLCJzdG9yZWRFbmVyZ3lNZXRlciIsInN0b3JlZEVuZXJneU1ldGVyVmlzaWJsZVByb3BlcnR5Iiwic3RvcmVkRW5lcmd5UHJvcGVydHkiLCJyZXNldCIsInZvbHRtZXRlciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2FwYWNpdGFuY2VNb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDYXBhY2l0YW5jZSBtb2RlbCBmb3IgQ2FwYWNpdG9yIExhYjogQmFzaWNzLiAgVGhpcyBtb2RlbCBoYXMgYSBiYXR0ZXJ5IGNvbm5lY3RlZCBpbiBwYXJhbGxlbCB0byBhIGNhcGFjaXRvciwgYW5kXHJcbiAqIGFsbG93cyB0aGUgdXNlciB0byBtb2RpZnkgY2FwYWNpdG9yIHBsYXRlIGdlb21ldHJ5IHRvIGlsbHVzdHJhdGUgcmVsYXRpb25zaGlwcyB3aXRoIGNhcGFjaXRhbmNlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBBbmRyZXcgQWRhcmUgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IGNhcGFjaXRvckxhYkJhc2ljcyBmcm9tICcuLi8uLi9jYXBhY2l0b3JMYWJCYXNpY3MuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdENvbmZpZyBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQ2lyY3VpdENvbmZpZy5qcyc7XHJcbmltcG9ydCBDaXJjdWl0U3RhdGUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0NpcmN1aXRTdGF0ZS5qcyc7XHJcbmltcG9ydCBDTEJNb2RlbCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQ0xCTW9kZWwuanMnO1xyXG5pbXBvcnQgQmFyTWV0ZXIgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL21ldGVyL0Jhck1ldGVyLmpzJztcclxuaW1wb3J0IENhcGFjaXRhbmNlQ2lyY3VpdCBmcm9tICcuL0NhcGFjaXRhbmNlQ2lyY3VpdC5qcyc7XHJcblxyXG5jbGFzcyBDYXBhY2l0YW5jZU1vZGVsIGV4dGVuZHMgQ0xCTW9kZWwge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBzd2l0Y2hVc2VkUHJvcGVydHkgLSB3aGV0aGVyIHN3aXRjaCBoYXMgYmVlbiBjaGFuZ2VkIGJ5IHVzZXIuIEFmZmVjdHMgYm90aCBzY3JlZW5zLlxyXG4gICAqIEBwYXJhbSB7WWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHN3aXRjaFVzZWRQcm9wZXJ0eSwgbW9kZWxWaWV3VHJhbnNmb3JtLCB0YW5kZW0gKSB7XHJcblxyXG4gICAgY29uc3QgY2lyY3VpdENvbmZpZyA9IENpcmN1aXRDb25maWcuY3JlYXRlKCB7XHJcbiAgICAgIGNpcmN1aXRDb25uZWN0aW9uczogWyBDaXJjdWl0U3RhdGUuQkFUVEVSWV9DT05ORUNURUQsIENpcmN1aXRTdGF0ZS5PUEVOX0NJUkNVSVQgXVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgY2lyY3VpdCA9IG5ldyBDYXBhY2l0YW5jZUNpcmN1aXQoIGNpcmN1aXRDb25maWcsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjaXJjdWl0JyApICk7XHJcblxyXG4gICAgc3VwZXIoIGNpcmN1aXQsIHN3aXRjaFVzZWRQcm9wZXJ0eSwgbW9kZWxWaWV3VHJhbnNmb3JtLCB0YW5kZW0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtDYXBhY2l0YW5jZUNpcmN1aXR9XHJcbiAgICB0aGlzLmNpcmN1aXQgPSBjaXJjdWl0O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0Jhck1ldGVyfVxyXG4gICAgdGhpcy5jYXBhY2l0YW5jZU1ldGVyID0gbmV3IEJhck1ldGVyKCB0aGlzLmNhcGFjaXRhbmNlTWV0ZXJWaXNpYmxlUHJvcGVydHksIHRoaXMuY2lyY3VpdC5jYXBhY2l0b3IuY2FwYWNpdGFuY2VQcm9wZXJ0eSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0Jhck1ldGVyfVxyXG4gICAgdGhpcy5wbGF0ZUNoYXJnZU1ldGVyID0gbmV3IEJhck1ldGVyKCB0aGlzLnRvcFBsYXRlQ2hhcmdlTWV0ZXJWaXNpYmxlUHJvcGVydHksIHRoaXMuY2lyY3VpdC5jYXBhY2l0b3IucGxhdGVDaGFyZ2VQcm9wZXJ0eSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0Jhck1ldGVyfVxyXG4gICAgdGhpcy5zdG9yZWRFbmVyZ3lNZXRlciA9IG5ldyBCYXJNZXRlciggdGhpcy5zdG9yZWRFbmVyZ3lNZXRlclZpc2libGVQcm9wZXJ0eSwgdGhpcy5jaXJjdWl0LmNhcGFjaXRvci5zdG9yZWRFbmVyZ3lQcm9wZXJ0eSApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IGZ1bmN0aW9uIGZvciB0aGlzIG1vZGVsLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuY2FwYWNpdGFuY2VNZXRlci5yZXNldCgpO1xyXG4gICAgdGhpcy5wbGF0ZUNoYXJnZU1ldGVyLnJlc2V0KCk7XHJcbiAgICB0aGlzLnN0b3JlZEVuZXJneU1ldGVyLnJlc2V0KCk7XHJcbiAgICB0aGlzLnZvbHRtZXRlci5yZXNldCgpO1xyXG4gICAgdGhpcy5jaXJjdWl0LnJlc2V0KCk7XHJcbiAgICBzdXBlci5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuY2FwYWNpdG9yTGFiQmFzaWNzLnJlZ2lzdGVyKCAnQ2FwYWNpdGFuY2VNb2RlbCcsIENhcGFjaXRhbmNlTW9kZWwgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENhcGFjaXRhbmNlTW9kZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyxhQUFhLE1BQU0scUNBQXFDO0FBQy9ELE9BQU9DLFlBQVksTUFBTSxvQ0FBb0M7QUFDN0QsT0FBT0MsUUFBUSxNQUFNLGdDQUFnQztBQUNyRCxPQUFPQyxRQUFRLE1BQU0sc0NBQXNDO0FBQzNELE9BQU9DLGtCQUFrQixNQUFNLHlCQUF5QjtBQUV4RCxNQUFNQyxnQkFBZ0IsU0FBU0gsUUFBUSxDQUFDO0VBQ3RDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUksV0FBV0EsQ0FBRUMsa0JBQWtCLEVBQUVDLGtCQUFrQixFQUFFQyxNQUFNLEVBQUc7SUFFNUQsTUFBTUMsYUFBYSxHQUFHVixhQUFhLENBQUNXLE1BQU0sQ0FBRTtNQUMxQ0Msa0JBQWtCLEVBQUUsQ0FBRVgsWUFBWSxDQUFDWSxpQkFBaUIsRUFBRVosWUFBWSxDQUFDYSxZQUFZO0lBQ2pGLENBQUUsQ0FBQztJQUNILE1BQU1DLE9BQU8sR0FBRyxJQUFJWCxrQkFBa0IsQ0FBRU0sYUFBYSxFQUFFRCxNQUFNLENBQUNPLFlBQVksQ0FBRSxTQUFVLENBQUUsQ0FBQztJQUV6RixLQUFLLENBQUVELE9BQU8sRUFBRVIsa0JBQWtCLEVBQUVDLGtCQUFrQixFQUFFQyxNQUFPLENBQUM7O0lBRWhFO0lBQ0EsSUFBSSxDQUFDTSxPQUFPLEdBQUdBLE9BQU87O0lBRXRCO0lBQ0EsSUFBSSxDQUFDRSxnQkFBZ0IsR0FBRyxJQUFJZCxRQUFRLENBQUUsSUFBSSxDQUFDZSwrQkFBK0IsRUFBRSxJQUFJLENBQUNILE9BQU8sQ0FBQ0ksU0FBUyxDQUFDQyxtQkFBb0IsQ0FBQzs7SUFFeEg7SUFDQSxJQUFJLENBQUNDLGdCQUFnQixHQUFHLElBQUlsQixRQUFRLENBQUUsSUFBSSxDQUFDbUIsa0NBQWtDLEVBQUUsSUFBSSxDQUFDUCxPQUFPLENBQUNJLFNBQVMsQ0FBQ0ksbUJBQW9CLENBQUM7O0lBRTNIO0lBQ0EsSUFBSSxDQUFDQyxpQkFBaUIsR0FBRyxJQUFJckIsUUFBUSxDQUFFLElBQUksQ0FBQ3NCLGdDQUFnQyxFQUFFLElBQUksQ0FBQ1YsT0FBTyxDQUFDSSxTQUFTLENBQUNPLG9CQUFxQixDQUFDO0VBQzdIOztFQUdBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsS0FBS0EsQ0FBQSxFQUFHO0lBQ04sSUFBSSxDQUFDVixnQkFBZ0IsQ0FBQ1UsS0FBSyxDQUFDLENBQUM7SUFDN0IsSUFBSSxDQUFDTixnQkFBZ0IsQ0FBQ00sS0FBSyxDQUFDLENBQUM7SUFDN0IsSUFBSSxDQUFDSCxpQkFBaUIsQ0FBQ0csS0FBSyxDQUFDLENBQUM7SUFDOUIsSUFBSSxDQUFDQyxTQUFTLENBQUNELEtBQUssQ0FBQyxDQUFDO0lBQ3RCLElBQUksQ0FBQ1osT0FBTyxDQUFDWSxLQUFLLENBQUMsQ0FBQztJQUNwQixLQUFLLENBQUNBLEtBQUssQ0FBQyxDQUFDO0VBQ2Y7QUFDRjtBQUVBNUIsa0JBQWtCLENBQUM4QixRQUFRLENBQUUsa0JBQWtCLEVBQUV4QixnQkFBaUIsQ0FBQztBQUVuRSxlQUFlQSxnQkFBZ0IifQ==