// Copyright 2021-2022, University of Colorado Boulder
import DynamicCoreModel from './DynamicCoreModel.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
export default class LTACapacitor extends DynamicCoreModel {
  constructor(id, node0, node1, voltage, current, capacitance) {
    super(id, node0, node1, voltage, current);
    this.capacitance = capacitance;

    // Synthetic node to read the voltage different across the capacitor part (since it is modeled in series with a resistor)
    this.capacitorVoltageNode1 = null;
  }
}
circuitConstructionKitCommon.register('LTACapacitor', LTACapacitor);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEeW5hbWljQ29yZU1vZGVsIiwiY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiIsIkxUQUNhcGFjaXRvciIsImNvbnN0cnVjdG9yIiwiaWQiLCJub2RlMCIsIm5vZGUxIiwidm9sdGFnZSIsImN1cnJlbnQiLCJjYXBhY2l0YW5jZSIsImNhcGFjaXRvclZvbHRhZ2VOb2RlMSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTFRBQ2FwYWNpdG9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5pbXBvcnQgRHluYW1pY0NvcmVNb2RlbCBmcm9tICcuL0R5bmFtaWNDb3JlTW9kZWwuanMnO1xyXG5cclxuaW1wb3J0IGNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24gZnJvbSAnLi4vLi4vY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMVEFDYXBhY2l0b3IgZXh0ZW5kcyBEeW5hbWljQ29yZU1vZGVsIHtcclxuICBwdWJsaWMgY2FwYWNpdG9yVm9sdGFnZU5vZGUxOiBzdHJpbmcgfCBudWxsO1xyXG4gIHB1YmxpYyBjYXBhY2l0YW5jZTogbnVtYmVyO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGlkOiBudW1iZXIsIG5vZGUwOiBzdHJpbmcsIG5vZGUxOiBzdHJpbmcsIHZvbHRhZ2U6IG51bWJlciwgY3VycmVudDogbnVtYmVyLCBjYXBhY2l0YW5jZTogbnVtYmVyICkge1xyXG4gICAgc3VwZXIoIGlkLCBub2RlMCwgbm9kZTEsIHZvbHRhZ2UsIGN1cnJlbnQgKTtcclxuICAgIHRoaXMuY2FwYWNpdGFuY2UgPSBjYXBhY2l0YW5jZTtcclxuXHJcbiAgICAvLyBTeW50aGV0aWMgbm9kZSB0byByZWFkIHRoZSB2b2x0YWdlIGRpZmZlcmVudCBhY3Jvc3MgdGhlIGNhcGFjaXRvciBwYXJ0IChzaW5jZSBpdCBpcyBtb2RlbGVkIGluIHNlcmllcyB3aXRoIGEgcmVzaXN0b3IpXHJcbiAgICB0aGlzLmNhcGFjaXRvclZvbHRhZ2VOb2RlMSA9IG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG5jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLnJlZ2lzdGVyKCAnTFRBQ2FwYWNpdG9yJywgTFRBQ2FwYWNpdG9yICk7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLGdCQUFnQixNQUFNLHVCQUF1QjtBQUVwRCxPQUFPQyw0QkFBNEIsTUFBTSx1Q0FBdUM7QUFFaEYsZUFBZSxNQUFNQyxZQUFZLFNBQVNGLGdCQUFnQixDQUFDO0VBSWxERyxXQUFXQSxDQUFFQyxFQUFVLEVBQUVDLEtBQWEsRUFBRUMsS0FBYSxFQUFFQyxPQUFlLEVBQUVDLE9BQWUsRUFBRUMsV0FBbUIsRUFBRztJQUNwSCxLQUFLLENBQUVMLEVBQUUsRUFBRUMsS0FBSyxFQUFFQyxLQUFLLEVBQUVDLE9BQU8sRUFBRUMsT0FBUSxDQUFDO0lBQzNDLElBQUksQ0FBQ0MsV0FBVyxHQUFHQSxXQUFXOztJQUU5QjtJQUNBLElBQUksQ0FBQ0MscUJBQXFCLEdBQUcsSUFBSTtFQUNuQztBQUNGO0FBRUFULDRCQUE0QixDQUFDVSxRQUFRLENBQUUsY0FBYyxFQUFFVCxZQUFhLENBQUMifQ==