// Copyright 2021-2022, University of Colorado Boulder

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import bendingLight from '../../bendingLight.js';

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
class LightType extends EnumerationValue {
  static WHITE = new LightType();
  static SINGLE_COLOR = new LightType();
  static SINGLE_COLOR_5X = new LightType();
  static enumeration = new Enumeration(LightType);
}
bendingLight.register('LightType', LightType);
export default LightType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJiZW5kaW5nTGlnaHQiLCJMaWdodFR5cGUiLCJXSElURSIsIlNJTkdMRV9DT0xPUiIsIlNJTkdMRV9DT0xPUl81WCIsImVudW1lcmF0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMaWdodFR5cGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uVmFsdWUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uVmFsdWUuanMnO1xyXG5pbXBvcnQgYmVuZGluZ0xpZ2h0IGZyb20gJy4uLy4uL2JlbmRpbmdMaWdodC5qcyc7XHJcblxyXG4vKipcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcbmNsYXNzIExpZ2h0VHlwZSBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWUge1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgV0hJVEUgPSBuZXcgTGlnaHRUeXBlKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTSU5HTEVfQ09MT1IgPSBuZXcgTGlnaHRUeXBlKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTSU5HTEVfQ09MT1JfNVggPSBuZXcgTGlnaHRUeXBlKCk7XHJcbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIExpZ2h0VHlwZSApO1xyXG59XHJcblxyXG5iZW5kaW5nTGlnaHQucmVnaXN0ZXIoICdMaWdodFR5cGUnLCBMaWdodFR5cGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgTGlnaHRUeXBlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxnQkFBZ0IsTUFBTSw4Q0FBOEM7QUFDM0UsT0FBT0MsWUFBWSxNQUFNLHVCQUF1Qjs7QUFFaEQ7QUFDQTtBQUNBO0FBQ0EsTUFBTUMsU0FBUyxTQUFTRixnQkFBZ0IsQ0FBQztFQUN2QyxPQUF1QkcsS0FBSyxHQUFHLElBQUlELFNBQVMsQ0FBQyxDQUFDO0VBQzlDLE9BQXVCRSxZQUFZLEdBQUcsSUFBSUYsU0FBUyxDQUFDLENBQUM7RUFDckQsT0FBdUJHLGVBQWUsR0FBRyxJQUFJSCxTQUFTLENBQUMsQ0FBQztFQUN4RCxPQUF3QkksV0FBVyxHQUFHLElBQUlQLFdBQVcsQ0FBRUcsU0FBVSxDQUFDO0FBQ3BFO0FBRUFELFlBQVksQ0FBQ00sUUFBUSxDQUFFLFdBQVcsRUFBRUwsU0FBVSxDQUFDO0FBQy9DLGVBQWVBLFNBQVMifQ==