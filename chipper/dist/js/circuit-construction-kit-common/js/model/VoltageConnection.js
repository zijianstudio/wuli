// Copyright 2019-2023, University of Colorado Boulder

/**
 * Indicates a vertex and a voltage measurement at the given vertex.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import IOType from '../../../tandem/js/types/IOType.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../tandem/js/types/ReferenceIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
export default class VoltageConnection {
  constructor(vertex, circuitElement, voltage = vertex.voltageProperty.value) {
    this.vertex = vertex;
    this.voltage = voltage;
    this.circuitElement = circuitElement;
  }
  static VoltageConnectionIO = new IOType('VoltageConnectionIO', {
    valueType: VoltageConnection,
    documentation: 'In order to describe how a Voltmeter probe is connected to a circuit. It indicates the measured Vertex ' + 'or Circuit Element, and the voltage at that point. For non-ideal wires, the ' + 'voltage indicates the partial voltage dropped up to that point on the wire, like a potentiometer.',
    toStateObject: voltageConnection => ({
      connection: ReferenceIO(IOType.ObjectIO).toStateObject(voltageConnection.circuitElement || voltageConnection.vertex),
      voltage: voltageConnection.voltage
    }),
    fromStateObject: stateObject => {
      // Like in DerivedProperty, this is a no-op because the value is not used to restore the state
      // Will be recomputed after the model is restored. This code relies on the assumption that the VoltageConnectionIO
      // is contained in a NullableIO()
      return null;
    },
    stateSchema: {
      connection: ReferenceIO(IOType.ObjectIO),
      voltage: NumberIO
    }
  });
}
circuitConstructionKitCommon.register('VoltageConnection', VoltageConnection);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJT1R5cGUiLCJOdW1iZXJJTyIsIlJlZmVyZW5jZUlPIiwiY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiIsIlZvbHRhZ2VDb25uZWN0aW9uIiwiY29uc3RydWN0b3IiLCJ2ZXJ0ZXgiLCJjaXJjdWl0RWxlbWVudCIsInZvbHRhZ2UiLCJ2b2x0YWdlUHJvcGVydHkiLCJ2YWx1ZSIsIlZvbHRhZ2VDb25uZWN0aW9uSU8iLCJ2YWx1ZVR5cGUiLCJkb2N1bWVudGF0aW9uIiwidG9TdGF0ZU9iamVjdCIsInZvbHRhZ2VDb25uZWN0aW9uIiwiY29ubmVjdGlvbiIsIk9iamVjdElPIiwiZnJvbVN0YXRlT2JqZWN0Iiwic3RhdGVPYmplY3QiLCJzdGF0ZVNjaGVtYSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVm9sdGFnZUNvbm5lY3Rpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSW5kaWNhdGVzIGEgdmVydGV4IGFuZCBhIHZvbHRhZ2UgbWVhc3VyZW1lbnQgYXQgdGhlIGdpdmVuIHZlcnRleC5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuaW1wb3J0IFJlZmVyZW5jZUlPIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9SZWZlcmVuY2VJTy5qcyc7XHJcbmltcG9ydCBjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIGZyb20gJy4uL2NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24uanMnO1xyXG5pbXBvcnQgVmVydGV4IGZyb20gJy4vVmVydGV4LmpzJztcclxuaW1wb3J0IENpcmN1aXRFbGVtZW50IGZyb20gJy4vQ2lyY3VpdEVsZW1lbnQuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVm9sdGFnZUNvbm5lY3Rpb24ge1xyXG4gIHB1YmxpYyByZWFkb25seSB2ZXJ0ZXg6IFZlcnRleDtcclxuICBwdWJsaWMgcmVhZG9ubHkgdm9sdGFnZTogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBjaXJjdWl0RWxlbWVudDogQ2lyY3VpdEVsZW1lbnQgfCBudWxsO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHZlcnRleDogVmVydGV4LCBjaXJjdWl0RWxlbWVudDogQ2lyY3VpdEVsZW1lbnQgfCBudWxsLCB2b2x0YWdlOiBudW1iZXIgPSB2ZXJ0ZXgudm9sdGFnZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgdGhpcy52ZXJ0ZXggPSB2ZXJ0ZXg7XHJcbiAgICB0aGlzLnZvbHRhZ2UgPSB2b2x0YWdlO1xyXG4gICAgdGhpcy5jaXJjdWl0RWxlbWVudCA9IGNpcmN1aXRFbGVtZW50O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBWb2x0YWdlQ29ubmVjdGlvbklPID0gbmV3IElPVHlwZSggJ1ZvbHRhZ2VDb25uZWN0aW9uSU8nLCB7XHJcbiAgICB2YWx1ZVR5cGU6IFZvbHRhZ2VDb25uZWN0aW9uLFxyXG4gICAgZG9jdW1lbnRhdGlvbjogJ0luIG9yZGVyIHRvIGRlc2NyaWJlIGhvdyBhIFZvbHRtZXRlciBwcm9iZSBpcyBjb25uZWN0ZWQgdG8gYSBjaXJjdWl0LiBJdCBpbmRpY2F0ZXMgdGhlIG1lYXN1cmVkIFZlcnRleCAnICtcclxuICAgICAgICAgICAgICAgICAgICdvciBDaXJjdWl0IEVsZW1lbnQsIGFuZCB0aGUgdm9sdGFnZSBhdCB0aGF0IHBvaW50LiBGb3Igbm9uLWlkZWFsIHdpcmVzLCB0aGUgJyArXHJcbiAgICAgICAgICAgICAgICAgICAndm9sdGFnZSBpbmRpY2F0ZXMgdGhlIHBhcnRpYWwgdm9sdGFnZSBkcm9wcGVkIHVwIHRvIHRoYXQgcG9pbnQgb24gdGhlIHdpcmUsIGxpa2UgYSBwb3RlbnRpb21ldGVyLicsXHJcbiAgICB0b1N0YXRlT2JqZWN0OiB2b2x0YWdlQ29ubmVjdGlvbiA9PiAoIHtcclxuICAgICAgY29ubmVjdGlvbjogUmVmZXJlbmNlSU8oIElPVHlwZS5PYmplY3RJTyApLnRvU3RhdGVPYmplY3QoIHZvbHRhZ2VDb25uZWN0aW9uLmNpcmN1aXRFbGVtZW50IHx8IHZvbHRhZ2VDb25uZWN0aW9uLnZlcnRleCApLFxyXG4gICAgICB2b2x0YWdlOiB2b2x0YWdlQ29ubmVjdGlvbi52b2x0YWdlXHJcbiAgICB9ICksXHJcbiAgICBmcm9tU3RhdGVPYmplY3Q6IHN0YXRlT2JqZWN0ID0+IHtcclxuXHJcbiAgICAgIC8vIExpa2UgaW4gRGVyaXZlZFByb3BlcnR5LCB0aGlzIGlzIGEgbm8tb3AgYmVjYXVzZSB0aGUgdmFsdWUgaXMgbm90IHVzZWQgdG8gcmVzdG9yZSB0aGUgc3RhdGVcclxuICAgICAgLy8gV2lsbCBiZSByZWNvbXB1dGVkIGFmdGVyIHRoZSBtb2RlbCBpcyByZXN0b3JlZC4gVGhpcyBjb2RlIHJlbGllcyBvbiB0aGUgYXNzdW1wdGlvbiB0aGF0IHRoZSBWb2x0YWdlQ29ubmVjdGlvbklPXHJcbiAgICAgIC8vIGlzIGNvbnRhaW5lZCBpbiBhIE51bGxhYmxlSU8oKVxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0sXHJcbiAgICBzdGF0ZVNjaGVtYToge1xyXG4gICAgICBjb25uZWN0aW9uOiBSZWZlcmVuY2VJTyggSU9UeXBlLk9iamVjdElPICksXHJcbiAgICAgIHZvbHRhZ2U6IE51bWJlcklPXHJcbiAgICB9XHJcbiAgfSApO1xyXG59XHJcblxyXG5jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLnJlZ2lzdGVyKCAnVm9sdGFnZUNvbm5lY3Rpb24nLCBWb2x0YWdlQ29ubmVjdGlvbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0sb0NBQW9DO0FBQ3ZELE9BQU9DLFFBQVEsTUFBTSxzQ0FBc0M7QUFDM0QsT0FBT0MsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyw0QkFBNEIsTUFBTSxvQ0FBb0M7QUFJN0UsZUFBZSxNQUFNQyxpQkFBaUIsQ0FBQztFQUs5QkMsV0FBV0EsQ0FBRUMsTUFBYyxFQUFFQyxjQUFxQyxFQUFFQyxPQUFlLEdBQUdGLE1BQU0sQ0FBQ0csZUFBZSxDQUFDQyxLQUFLLEVBQUc7SUFDMUgsSUFBSSxDQUFDSixNQUFNLEdBQUdBLE1BQU07SUFDcEIsSUFBSSxDQUFDRSxPQUFPLEdBQUdBLE9BQU87SUFDdEIsSUFBSSxDQUFDRCxjQUFjLEdBQUdBLGNBQWM7RUFDdEM7RUFFQSxPQUFjSSxtQkFBbUIsR0FBRyxJQUFJWCxNQUFNLENBQUUscUJBQXFCLEVBQUU7SUFDckVZLFNBQVMsRUFBRVIsaUJBQWlCO0lBQzVCUyxhQUFhLEVBQUUseUdBQXlHLEdBQ3pHLDhFQUE4RSxHQUM5RSxtR0FBbUc7SUFDbEhDLGFBQWEsRUFBRUMsaUJBQWlCLEtBQU07TUFDcENDLFVBQVUsRUFBRWQsV0FBVyxDQUFFRixNQUFNLENBQUNpQixRQUFTLENBQUMsQ0FBQ0gsYUFBYSxDQUFFQyxpQkFBaUIsQ0FBQ1IsY0FBYyxJQUFJUSxpQkFBaUIsQ0FBQ1QsTUFBTyxDQUFDO01BQ3hIRSxPQUFPLEVBQUVPLGlCQUFpQixDQUFDUDtJQUM3QixDQUFDLENBQUU7SUFDSFUsZUFBZSxFQUFFQyxXQUFXLElBQUk7TUFFOUI7TUFDQTtNQUNBO01BQ0EsT0FBTyxJQUFJO0lBQ2IsQ0FBQztJQUNEQyxXQUFXLEVBQUU7TUFDWEosVUFBVSxFQUFFZCxXQUFXLENBQUVGLE1BQU0sQ0FBQ2lCLFFBQVMsQ0FBQztNQUMxQ1QsT0FBTyxFQUFFUDtJQUNYO0VBQ0YsQ0FBRSxDQUFDO0FBQ0w7QUFFQUUsNEJBQTRCLENBQUNrQixRQUFRLENBQUUsbUJBQW1CLEVBQUVqQixpQkFBa0IsQ0FBQyJ9