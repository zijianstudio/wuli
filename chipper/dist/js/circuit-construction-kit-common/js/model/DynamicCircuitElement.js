// Copyright 2019-2022, University of Colorado Boulder

/**
 * Circuit element with time-dependent dynamics, such as an inductor or capacitor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElement from './FixedCircuitElement.js';
// This class should not be instantiated directly, instead subclasses should provide implementations for getCircuitProperties
// and the subclasses should be used instead.
export default class DynamicCircuitElement extends FixedCircuitElement {
  // value of the voltage drop set and read by the modified nodal analysis.  This is in addition to the typical voltage calculation which is based on vertices.

  // value of the current set and read by the modified nodal analysis.  This is an instantaneous value based on the
  // throughput computation at the final timestep, as opposed to the currentProperty.value which takes a time average
  // across the values, so we can show transient spikes, see https://phet.unfuddle.com/a#/projects/9404/tickets/by_number/2270?cycle=true
  // For listening only
  constructor(startVertex, endVertex, length, tandem, providedOptions) {
    super(startVertex, endVertex, length, tandem, providedOptions);
    this.mnaVoltageDrop = 0;
    this.mnaCurrent = 0;
    this.clearEmitter = new Emitter();
    this.isClearableProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('isClearableProperty'),
      phetioDocumentation: 'Determines whether the button to clear the component can be shown'
    });
  }

  /**
   * Reset the dynamic variable for the modified nodal analysis solver. This has the effect of clearing the
   * electric field (capacitor) or clearing the magnetic field (inductor)
   */
  clear() {
    assert && assert(this.isClearableProperty.value, 'isClearable must be true when clear() is called');
    this.mnaVoltageDrop = 0;
    this.mnaCurrent = 0;
    this.clearEmitter.emit();
  }
  dispose() {
    this.clearEmitter.dispose();
    this.isClearableProperty.dispose();
    super.dispose();
  }
}
circuitConstructionKitCommon.register('DynamicCircuitElement', DynamicCircuitElement);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiIsIkZpeGVkQ2lyY3VpdEVsZW1lbnQiLCJEeW5hbWljQ2lyY3VpdEVsZW1lbnQiLCJjb25zdHJ1Y3RvciIsInN0YXJ0VmVydGV4IiwiZW5kVmVydGV4IiwibGVuZ3RoIiwidGFuZGVtIiwicHJvdmlkZWRPcHRpb25zIiwibW5hVm9sdGFnZURyb3AiLCJtbmFDdXJyZW50IiwiY2xlYXJFbWl0dGVyIiwiaXNDbGVhcmFibGVQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJjbGVhciIsImFzc2VydCIsInZhbHVlIiwiZW1pdCIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkR5bmFtaWNDaXJjdWl0RWxlbWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDaXJjdWl0IGVsZW1lbnQgd2l0aCB0aW1lLWRlcGVuZGVudCBkeW5hbWljcywgc3VjaCBhcyBhbiBpbmR1Y3RvciBvciBjYXBhY2l0b3IuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBURW1pdHRlciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RFbWl0dGVyLmpzJztcclxuaW1wb3J0IHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiBmcm9tICcuLi9jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLmpzJztcclxuaW1wb3J0IEZpeGVkQ2lyY3VpdEVsZW1lbnQsIHsgRml4ZWRDaXJjdWl0RWxlbWVudE9wdGlvbnMgfSBmcm9tICcuL0ZpeGVkQ2lyY3VpdEVsZW1lbnQuanMnO1xyXG5pbXBvcnQgVmVydGV4IGZyb20gJy4vVmVydGV4LmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5leHBvcnQgdHlwZSBEeW5hbWljQ2lyY3VpdEVsZW1lbnRPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBGaXhlZENpcmN1aXRFbGVtZW50T3B0aW9ucztcclxuXHJcbi8vIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSBpbnN0YW50aWF0ZWQgZGlyZWN0bHksIGluc3RlYWQgc3ViY2xhc3NlcyBzaG91bGQgcHJvdmlkZSBpbXBsZW1lbnRhdGlvbnMgZm9yIGdldENpcmN1aXRQcm9wZXJ0aWVzXHJcbi8vIGFuZCB0aGUgc3ViY2xhc3NlcyBzaG91bGQgYmUgdXNlZCBpbnN0ZWFkLlxyXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBEeW5hbWljQ2lyY3VpdEVsZW1lbnQgZXh0ZW5kcyBGaXhlZENpcmN1aXRFbGVtZW50IHtcclxuXHJcbiAgLy8gdmFsdWUgb2YgdGhlIHZvbHRhZ2UgZHJvcCBzZXQgYW5kIHJlYWQgYnkgdGhlIG1vZGlmaWVkIG5vZGFsIGFuYWx5c2lzLiAgVGhpcyBpcyBpbiBhZGRpdGlvbiB0byB0aGUgdHlwaWNhbCB2b2x0YWdlIGNhbGN1bGF0aW9uIHdoaWNoIGlzIGJhc2VkIG9uIHZlcnRpY2VzLlxyXG4gIHB1YmxpYyBtbmFWb2x0YWdlRHJvcDogbnVtYmVyO1xyXG5cclxuICAvLyB2YWx1ZSBvZiB0aGUgY3VycmVudCBzZXQgYW5kIHJlYWQgYnkgdGhlIG1vZGlmaWVkIG5vZGFsIGFuYWx5c2lzLiAgVGhpcyBpcyBhbiBpbnN0YW50YW5lb3VzIHZhbHVlIGJhc2VkIG9uIHRoZVxyXG4gIC8vIHRocm91Z2hwdXQgY29tcHV0YXRpb24gYXQgdGhlIGZpbmFsIHRpbWVzdGVwLCBhcyBvcHBvc2VkIHRvIHRoZSBjdXJyZW50UHJvcGVydHkudmFsdWUgd2hpY2ggdGFrZXMgYSB0aW1lIGF2ZXJhZ2VcclxuICAvLyBhY3Jvc3MgdGhlIHZhbHVlcywgc28gd2UgY2FuIHNob3cgdHJhbnNpZW50IHNwaWtlcywgc2VlIGh0dHBzOi8vcGhldC51bmZ1ZGRsZS5jb20vYSMvcHJvamVjdHMvOTQwNC90aWNrZXRzL2J5X251bWJlci8yMjcwP2N5Y2xlPXRydWVcclxuICBwdWJsaWMgbW5hQ3VycmVudDogbnVtYmVyO1xyXG5cclxuICAvLyBGb3IgbGlzdGVuaW5nIG9ubHlcclxuICBwdWJsaWMgcmVhZG9ubHkgY2xlYXJFbWl0dGVyOiBURW1pdHRlcjtcclxuICBwdWJsaWMgaXNDbGVhcmFibGVQcm9wZXJ0eTogQm9vbGVhblByb3BlcnR5O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHN0YXJ0VmVydGV4OiBWZXJ0ZXgsIGVuZFZlcnRleDogVmVydGV4LCBsZW5ndGg6IG51bWJlciwgdGFuZGVtOiBUYW5kZW0sIHByb3ZpZGVkT3B0aW9ucz86IER5bmFtaWNDaXJjdWl0RWxlbWVudE9wdGlvbnMgKSB7XHJcbiAgICBzdXBlciggc3RhcnRWZXJ0ZXgsIGVuZFZlcnRleCwgbGVuZ3RoLCB0YW5kZW0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG4gICAgdGhpcy5tbmFWb2x0YWdlRHJvcCA9IDA7XHJcbiAgICB0aGlzLm1uYUN1cnJlbnQgPSAwO1xyXG4gICAgdGhpcy5jbGVhckVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIHRoaXMuaXNDbGVhcmFibGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaXNDbGVhcmFibGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0RldGVybWluZXMgd2hldGhlciB0aGUgYnV0dG9uIHRvIGNsZWFyIHRoZSBjb21wb25lbnQgY2FuIGJlIHNob3duJ1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgdGhlIGR5bmFtaWMgdmFyaWFibGUgZm9yIHRoZSBtb2RpZmllZCBub2RhbCBhbmFseXNpcyBzb2x2ZXIuIFRoaXMgaGFzIHRoZSBlZmZlY3Qgb2YgY2xlYXJpbmcgdGhlXHJcbiAgICogZWxlY3RyaWMgZmllbGQgKGNhcGFjaXRvcikgb3IgY2xlYXJpbmcgdGhlIG1hZ25ldGljIGZpZWxkIChpbmR1Y3RvcilcclxuICAgKi9cclxuICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzQ2xlYXJhYmxlUHJvcGVydHkudmFsdWUsICdpc0NsZWFyYWJsZSBtdXN0IGJlIHRydWUgd2hlbiBjbGVhcigpIGlzIGNhbGxlZCcgKTtcclxuICAgIHRoaXMubW5hVm9sdGFnZURyb3AgPSAwO1xyXG4gICAgdGhpcy5tbmFDdXJyZW50ID0gMDtcclxuICAgIHRoaXMuY2xlYXJFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6dm9pZCB7XHJcbiAgICB0aGlzLmNsZWFyRW1pdHRlci5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmlzQ2xlYXJhYmxlUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5yZWdpc3RlciggJ0R5bmFtaWNDaXJjdWl0RWxlbWVudCcsIER5bmFtaWNDaXJjdWl0RWxlbWVudCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0scUNBQXFDO0FBQ2pFLE9BQU9DLE9BQU8sTUFBTSw2QkFBNkI7QUFJakQsT0FBT0MsNEJBQTRCLE1BQU0sb0NBQW9DO0FBQzdFLE9BQU9DLG1CQUFtQixNQUFzQywwQkFBMEI7QUFNMUY7QUFDQTtBQUNBLGVBQWUsTUFBZUMscUJBQXFCLFNBQVNELG1CQUFtQixDQUFDO0VBRTlFOztFQUdBO0VBQ0E7RUFDQTtFQUdBO0VBSU9FLFdBQVdBLENBQUVDLFdBQW1CLEVBQUVDLFNBQWlCLEVBQUVDLE1BQWMsRUFBRUMsTUFBYyxFQUFFQyxlQUE4QyxFQUFHO0lBQzNJLEtBQUssQ0FBRUosV0FBVyxFQUFFQyxTQUFTLEVBQUVDLE1BQU0sRUFBRUMsTUFBTSxFQUFFQyxlQUFnQixDQUFDO0lBQ2hFLElBQUksQ0FBQ0MsY0FBYyxHQUFHLENBQUM7SUFDdkIsSUFBSSxDQUFDQyxVQUFVLEdBQUcsQ0FBQztJQUNuQixJQUFJLENBQUNDLFlBQVksR0FBRyxJQUFJWixPQUFPLENBQUMsQ0FBQztJQUVqQyxJQUFJLENBQUNhLG1CQUFtQixHQUFHLElBQUlkLGVBQWUsQ0FBRSxJQUFJLEVBQUU7TUFDcERTLE1BQU0sRUFBRUEsTUFBTSxDQUFDTSxZQUFZLENBQUUscUJBQXNCLENBQUM7TUFDcERDLG1CQUFtQixFQUFFO0lBQ3ZCLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ1NDLEtBQUtBLENBQUEsRUFBUztJQUNuQkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsSUFBSSxDQUFDSixtQkFBbUIsQ0FBQ0ssS0FBSyxFQUFFLGlEQUFrRCxDQUFDO0lBQ3JHLElBQUksQ0FBQ1IsY0FBYyxHQUFHLENBQUM7SUFDdkIsSUFBSSxDQUFDQyxVQUFVLEdBQUcsQ0FBQztJQUNuQixJQUFJLENBQUNDLFlBQVksQ0FBQ08sSUFBSSxDQUFDLENBQUM7RUFDMUI7RUFFZ0JDLE9BQU9BLENBQUEsRUFBUTtJQUM3QixJQUFJLENBQUNSLFlBQVksQ0FBQ1EsT0FBTyxDQUFDLENBQUM7SUFDM0IsSUFBSSxDQUFDUCxtQkFBbUIsQ0FBQ08sT0FBTyxDQUFDLENBQUM7SUFDbEMsS0FBSyxDQUFDQSxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUFuQiw0QkFBNEIsQ0FBQ29CLFFBQVEsQ0FBRSx1QkFBdUIsRUFBRWxCLHFCQUFzQixDQUFDIn0=