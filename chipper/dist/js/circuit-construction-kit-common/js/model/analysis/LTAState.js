// Copyright 2021-2022, University of Colorado Boulder

import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
export default class LTAState {
  constructor(ltaCircuit, ltaSolution) {
    this.ltaCircuit = ltaCircuit;
    this.ltaSolution = ltaSolution;
    this.solution = null;
  }
  update(dt) {
    this.solution = this.ltaCircuit.solvePropagate(dt);
    const newCircuit = this.ltaCircuit.updateCircuit(this.solution);
    return new LTAState(newCircuit, this.solution);
  }

  /**
   * Returns an array of characteristic measurements from the solution, in order to determine whether more subdivisions
   * are needed in the timestep.
   */
  getCharacteristicArray() {
    // The solution has been applied to the this.dynamicCircuit, so we can read values from it
    const currents = [];
    for (let i = 0; i < this.ltaCircuit.ltaCapacitors.length; i++) {
      currents.push(this.ltaCircuit.ltaCapacitors[i].current);
    }
    for (let i = 0; i < this.ltaCircuit.ltaInductors.length; i++) {
      currents.push(this.ltaCircuit.ltaInductors[i].current);
    }
    return currents;
  }
}
circuitConstructionKitCommon.register('LTAState', LTAState);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIiwiTFRBU3RhdGUiLCJjb25zdHJ1Y3RvciIsImx0YUNpcmN1aXQiLCJsdGFTb2x1dGlvbiIsInNvbHV0aW9uIiwidXBkYXRlIiwiZHQiLCJzb2x2ZVByb3BhZ2F0ZSIsIm5ld0NpcmN1aXQiLCJ1cGRhdGVDaXJjdWl0IiwiZ2V0Q2hhcmFjdGVyaXN0aWNBcnJheSIsImN1cnJlbnRzIiwiaSIsImx0YUNhcGFjaXRvcnMiLCJsZW5ndGgiLCJwdXNoIiwiY3VycmVudCIsImx0YUluZHVjdG9ycyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTFRBU3RhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5pbXBvcnQgY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiBmcm9tICcuLi8uLi9jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLmpzJztcclxuaW1wb3J0IExUQUNpcmN1aXQgZnJvbSAnLi9MVEFDaXJjdWl0LmpzJztcclxuaW1wb3J0IExUQVNvbHV0aW9uIGZyb20gJy4vTFRBU29sdXRpb24uanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTFRBU3RhdGUge1xyXG4gIHB1YmxpYyByZWFkb25seSBsdGFDaXJjdWl0OiBMVEFDaXJjdWl0O1xyXG4gIHB1YmxpYyByZWFkb25seSBsdGFTb2x1dGlvbjogTFRBU29sdXRpb24gfCBudWxsO1xyXG4gIHByaXZhdGUgc29sdXRpb246IExUQVNvbHV0aW9uIHwgbnVsbDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsdGFDaXJjdWl0OiBMVEFDaXJjdWl0LCBsdGFTb2x1dGlvbjogTFRBU29sdXRpb24gfCBudWxsICkge1xyXG4gICAgdGhpcy5sdGFDaXJjdWl0ID0gbHRhQ2lyY3VpdDtcclxuICAgIHRoaXMubHRhU29sdXRpb24gPSBsdGFTb2x1dGlvbjtcclxuICAgIHRoaXMuc29sdXRpb24gPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHVwZGF0ZSggZHQ6IG51bWJlciApOiBMVEFTdGF0ZSB7XHJcbiAgICB0aGlzLnNvbHV0aW9uID0gdGhpcy5sdGFDaXJjdWl0LnNvbHZlUHJvcGFnYXRlKCBkdCApO1xyXG4gICAgY29uc3QgbmV3Q2lyY3VpdCA9IHRoaXMubHRhQ2lyY3VpdC51cGRhdGVDaXJjdWl0KCB0aGlzLnNvbHV0aW9uICk7XHJcbiAgICByZXR1cm4gbmV3IExUQVN0YXRlKCBuZXdDaXJjdWl0LCB0aGlzLnNvbHV0aW9uICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGNoYXJhY3RlcmlzdGljIG1lYXN1cmVtZW50cyBmcm9tIHRoZSBzb2x1dGlvbiwgaW4gb3JkZXIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgbW9yZSBzdWJkaXZpc2lvbnNcclxuICAgKiBhcmUgbmVlZGVkIGluIHRoZSB0aW1lc3RlcC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q2hhcmFjdGVyaXN0aWNBcnJheSgpOiBudW1iZXJbXSB7XHJcblxyXG4gICAgLy8gVGhlIHNvbHV0aW9uIGhhcyBiZWVuIGFwcGxpZWQgdG8gdGhlIHRoaXMuZHluYW1pY0NpcmN1aXQsIHNvIHdlIGNhbiByZWFkIHZhbHVlcyBmcm9tIGl0XHJcbiAgICBjb25zdCBjdXJyZW50cyA9IFtdO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5sdGFDaXJjdWl0Lmx0YUNhcGFjaXRvcnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGN1cnJlbnRzLnB1c2goIHRoaXMubHRhQ2lyY3VpdC5sdGFDYXBhY2l0b3JzWyBpIF0uY3VycmVudCApO1xyXG4gICAgfVxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5sdGFDaXJjdWl0Lmx0YUluZHVjdG9ycy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY3VycmVudHMucHVzaCggdGhpcy5sdGFDaXJjdWl0Lmx0YUluZHVjdG9yc1sgaSBdLmN1cnJlbnQgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBjdXJyZW50cztcclxuICB9XHJcbn1cclxuY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5yZWdpc3RlciggJ0xUQVN0YXRlJywgTFRBU3RhdGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLE9BQU9BLDRCQUE0QixNQUFNLHVDQUF1QztBQUloRixlQUFlLE1BQU1DLFFBQVEsQ0FBQztFQUtyQkMsV0FBV0EsQ0FBRUMsVUFBc0IsRUFBRUMsV0FBK0IsRUFBRztJQUM1RSxJQUFJLENBQUNELFVBQVUsR0FBR0EsVUFBVTtJQUM1QixJQUFJLENBQUNDLFdBQVcsR0FBR0EsV0FBVztJQUM5QixJQUFJLENBQUNDLFFBQVEsR0FBRyxJQUFJO0VBQ3RCO0VBRU9DLE1BQU1BLENBQUVDLEVBQVUsRUFBYTtJQUNwQyxJQUFJLENBQUNGLFFBQVEsR0FBRyxJQUFJLENBQUNGLFVBQVUsQ0FBQ0ssY0FBYyxDQUFFRCxFQUFHLENBQUM7SUFDcEQsTUFBTUUsVUFBVSxHQUFHLElBQUksQ0FBQ04sVUFBVSxDQUFDTyxhQUFhLENBQUUsSUFBSSxDQUFDTCxRQUFTLENBQUM7SUFDakUsT0FBTyxJQUFJSixRQUFRLENBQUVRLFVBQVUsRUFBRSxJQUFJLENBQUNKLFFBQVMsQ0FBQztFQUNsRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNTTSxzQkFBc0JBLENBQUEsRUFBYTtJQUV4QztJQUNBLE1BQU1DLFFBQVEsR0FBRyxFQUFFO0lBQ25CLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ1YsVUFBVSxDQUFDVyxhQUFhLENBQUNDLE1BQU0sRUFBRUYsQ0FBQyxFQUFFLEVBQUc7TUFDL0RELFFBQVEsQ0FBQ0ksSUFBSSxDQUFFLElBQUksQ0FBQ2IsVUFBVSxDQUFDVyxhQUFhLENBQUVELENBQUMsQ0FBRSxDQUFDSSxPQUFRLENBQUM7SUFDN0Q7SUFDQSxLQUFNLElBQUlKLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNWLFVBQVUsQ0FBQ2UsWUFBWSxDQUFDSCxNQUFNLEVBQUVGLENBQUMsRUFBRSxFQUFHO01BQzlERCxRQUFRLENBQUNJLElBQUksQ0FBRSxJQUFJLENBQUNiLFVBQVUsQ0FBQ2UsWUFBWSxDQUFFTCxDQUFDLENBQUUsQ0FBQ0ksT0FBUSxDQUFDO0lBQzVEO0lBQ0EsT0FBT0wsUUFBUTtFQUNqQjtBQUNGO0FBQ0FaLDRCQUE0QixDQUFDbUIsUUFBUSxDQUFFLFVBQVUsRUFBRWxCLFFBQVMsQ0FBQyJ9