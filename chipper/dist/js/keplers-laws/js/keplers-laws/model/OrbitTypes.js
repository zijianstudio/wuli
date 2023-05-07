// Copyright 2023, University of Colorado Boulder
/**
 * EnumerationValue to keep track of the Law that's currently selected
 *
 * @author Agustín Vallejo
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import keplersLaws from '../../keplersLaws.js';
export default class OrbitTypes extends EnumerationValue {
  static STABLE_ORBIT = new OrbitTypes();
  static ESCAPE_ORBIT = new OrbitTypes();
  static CRASH_ORBIT = new OrbitTypes();
  static TOO_BIG = new OrbitTypes();
  static enumeration = new Enumeration(OrbitTypes, {
    phetioDocumentation: 'The reason this orbit is unstable'
  });
}
keplersLaws.register('OrbitTypes', OrbitTypes);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJrZXBsZXJzTGF3cyIsIk9yYml0VHlwZXMiLCJTVEFCTEVfT1JCSVQiLCJFU0NBUEVfT1JCSVQiLCJDUkFTSF9PUkJJVCIsIlRPT19CSUciLCJlbnVtZXJhdGlvbiIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk9yYml0VHlwZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vKipcclxuICogRW51bWVyYXRpb25WYWx1ZSB0byBrZWVwIHRyYWNrIG9mIHRoZSBMYXcgdGhhdCdzIGN1cnJlbnRseSBzZWxlY3RlZFxyXG4gKlxyXG4gKiBAYXV0aG9yIEFndXN0w61uIFZhbGxlam9cclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uVmFsdWUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uVmFsdWUuanMnO1xyXG5pbXBvcnQga2VwbGVyc0xhd3MgZnJvbSAnLi4vLi4va2VwbGVyc0xhd3MuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3JiaXRUeXBlcyBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWUge1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU1RBQkxFX09SQklUID0gbmV3IE9yYml0VHlwZXMoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEVTQ0FQRV9PUkJJVCA9IG5ldyBPcmJpdFR5cGVzKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBDUkFTSF9PUkJJVCA9IG5ldyBPcmJpdFR5cGVzKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBUT09fQklHID0gbmV3IE9yYml0VHlwZXMoKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBlbnVtZXJhdGlvbiA9IG5ldyBFbnVtZXJhdGlvbiggT3JiaXRUeXBlcywge1xyXG4gICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoZSByZWFzb24gdGhpcyBvcmJpdCBpcyB1bnN0YWJsZSdcclxuICB9ICk7XHJcbn1cclxuXHJcbmtlcGxlcnNMYXdzLnJlZ2lzdGVyKCAnT3JiaXRUeXBlcycsIE9yYml0VHlwZXMgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxnQkFBZ0IsTUFBTSw4Q0FBOEM7QUFDM0UsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUU5QyxlQUFlLE1BQU1DLFVBQVUsU0FBU0YsZ0JBQWdCLENBQUM7RUFDdkQsT0FBdUJHLFlBQVksR0FBRyxJQUFJRCxVQUFVLENBQUMsQ0FBQztFQUN0RCxPQUF1QkUsWUFBWSxHQUFHLElBQUlGLFVBQVUsQ0FBQyxDQUFDO0VBQ3RELE9BQXVCRyxXQUFXLEdBQUcsSUFBSUgsVUFBVSxDQUFDLENBQUM7RUFDckQsT0FBdUJJLE9BQU8sR0FBRyxJQUFJSixVQUFVLENBQUMsQ0FBQztFQUVqRCxPQUF1QkssV0FBVyxHQUFHLElBQUlSLFdBQVcsQ0FBRUcsVUFBVSxFQUFFO0lBQ2hFTSxtQkFBbUIsRUFBRTtFQUN2QixDQUFFLENBQUM7QUFDTDtBQUVBUCxXQUFXLENBQUNRLFFBQVEsQ0FBRSxZQUFZLEVBQUVQLFVBQVcsQ0FBQyJ9