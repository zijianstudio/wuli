// Copyright 2021-2022, University of Colorado Boulder
import DynamicCoreModel from './DynamicCoreModel.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
export default class LTAInductor extends DynamicCoreModel {
  constructor(id, node0, node1, voltage, current, inductance) {
    super(id, node0, node1, voltage, current);
    assert && assert(!isNaN(inductance), 'inductance cannot be NaN');
    this.inductance = inductance;

    // Synthetic node to read the voltage different across the inductor part (since it is modeled in series with a resistor)
    this.inductorVoltageNode1 = null;
  }
}
circuitConstructionKitCommon.register('LTAInductor', LTAInductor);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEeW5hbWljQ29yZU1vZGVsIiwiY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiIsIkxUQUluZHVjdG9yIiwiY29uc3RydWN0b3IiLCJpZCIsIm5vZGUwIiwibm9kZTEiLCJ2b2x0YWdlIiwiY3VycmVudCIsImluZHVjdGFuY2UiLCJhc3NlcnQiLCJpc05hTiIsImluZHVjdG9yVm9sdGFnZU5vZGUxIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMVEFJbmR1Y3Rvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuaW1wb3J0IER5bmFtaWNDb3JlTW9kZWwgZnJvbSAnLi9EeW5hbWljQ29yZU1vZGVsLmpzJztcclxuaW1wb3J0IGNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24gZnJvbSAnLi4vLi4vY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMVEFJbmR1Y3RvciBleHRlbmRzIER5bmFtaWNDb3JlTW9kZWwge1xyXG4gIHB1YmxpYyByZWFkb25seSBpbmR1Y3RhbmNlOiBudW1iZXI7XHJcbiAgcHVibGljIGluZHVjdG9yVm9sdGFnZU5vZGUxOiBzdHJpbmcgfCBudWxsO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGlkOiBudW1iZXIsIG5vZGUwOiBzdHJpbmcsIG5vZGUxOiBzdHJpbmcsIHZvbHRhZ2U6IG51bWJlciwgY3VycmVudDogbnVtYmVyLCBpbmR1Y3RhbmNlOiBudW1iZXIgKSB7XHJcbiAgICBzdXBlciggaWQsIG5vZGUwLCBub2RlMSwgdm9sdGFnZSwgY3VycmVudCApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFpc05hTiggaW5kdWN0YW5jZSApLCAnaW5kdWN0YW5jZSBjYW5ub3QgYmUgTmFOJyApO1xyXG4gICAgdGhpcy5pbmR1Y3RhbmNlID0gaW5kdWN0YW5jZTtcclxuXHJcbiAgICAvLyBTeW50aGV0aWMgbm9kZSB0byByZWFkIHRoZSB2b2x0YWdlIGRpZmZlcmVudCBhY3Jvc3MgdGhlIGluZHVjdG9yIHBhcnQgKHNpbmNlIGl0IGlzIG1vZGVsZWQgaW4gc2VyaWVzIHdpdGggYSByZXNpc3RvcilcclxuICAgIHRoaXMuaW5kdWN0b3JWb2x0YWdlTm9kZTEgPSBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5yZWdpc3RlciggJ0xUQUluZHVjdG9yJywgTFRBSW5kdWN0b3IgKTsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0EsT0FBT0EsZ0JBQWdCLE1BQU0sdUJBQXVCO0FBQ3BELE9BQU9DLDRCQUE0QixNQUFNLHVDQUF1QztBQUVoRixlQUFlLE1BQU1DLFdBQVcsU0FBU0YsZ0JBQWdCLENBQUM7RUFJakRHLFdBQVdBLENBQUVDLEVBQVUsRUFBRUMsS0FBYSxFQUFFQyxLQUFhLEVBQUVDLE9BQWUsRUFBRUMsT0FBZSxFQUFFQyxVQUFrQixFQUFHO0lBQ25ILEtBQUssQ0FBRUwsRUFBRSxFQUFFQyxLQUFLLEVBQUVDLEtBQUssRUFBRUMsT0FBTyxFQUFFQyxPQUFRLENBQUM7SUFFM0NFLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUNDLEtBQUssQ0FBRUYsVUFBVyxDQUFDLEVBQUUsMEJBQTJCLENBQUM7SUFDcEUsSUFBSSxDQUFDQSxVQUFVLEdBQUdBLFVBQVU7O0lBRTVCO0lBQ0EsSUFBSSxDQUFDRyxvQkFBb0IsR0FBRyxJQUFJO0VBQ2xDO0FBQ0Y7QUFFQVgsNEJBQTRCLENBQUNZLFFBQVEsQ0FBRSxhQUFhLEVBQUVYLFdBQVksQ0FBQyJ9