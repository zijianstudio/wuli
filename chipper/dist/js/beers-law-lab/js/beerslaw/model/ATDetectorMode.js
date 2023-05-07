// Copyright 2021-2022, University of Colorado Boulder

/**
 * ATDetectorMode is an enumeration of the modes for the AT detector.
 * NOTE: When converting to TypeScript, this was not converted to a string union because we do not want to change
 * the PhET-iO API. String-union values use camelCase, while EnumerationValue uses UPPER_CASE.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import beersLawLab from '../../beersLawLab.js';
export default class ATDetectorMode extends EnumerationValue {
  static TRANSMITTANCE = new ATDetectorMode();
  static ABSORBANCE = new ATDetectorMode();
  static enumeration = new Enumeration(ATDetectorMode);
}
beersLawLab.register('ATDetectorMode', ATDetectorMode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJiZWVyc0xhd0xhYiIsIkFURGV0ZWN0b3JNb2RlIiwiVFJBTlNNSVRUQU5DRSIsIkFCU09SQkFOQ0UiLCJlbnVtZXJhdGlvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQVREZXRlY3Rvck1vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQVREZXRlY3Rvck1vZGUgaXMgYW4gZW51bWVyYXRpb24gb2YgdGhlIG1vZGVzIGZvciB0aGUgQVQgZGV0ZWN0b3IuXHJcbiAqIE5PVEU6IFdoZW4gY29udmVydGluZyB0byBUeXBlU2NyaXB0LCB0aGlzIHdhcyBub3QgY29udmVydGVkIHRvIGEgc3RyaW5nIHVuaW9uIGJlY2F1c2Ugd2UgZG8gbm90IHdhbnQgdG8gY2hhbmdlXHJcbiAqIHRoZSBQaEVULWlPIEFQSS4gU3RyaW5nLXVuaW9uIHZhbHVlcyB1c2UgY2FtZWxDYXNlLCB3aGlsZSBFbnVtZXJhdGlvblZhbHVlIHVzZXMgVVBQRVJfQ0FTRS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uVmFsdWUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uVmFsdWUuanMnO1xyXG5pbXBvcnQgYmVlcnNMYXdMYWIgZnJvbSAnLi4vLi4vYmVlcnNMYXdMYWIuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQVREZXRlY3Rvck1vZGUgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlIHtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFRSQU5TTUlUVEFOQ0UgPSBuZXcgQVREZXRlY3Rvck1vZGUoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEFCU09SQkFOQ0UgPSBuZXcgQVREZXRlY3Rvck1vZGUoKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBlbnVtZXJhdGlvbiA9IG5ldyBFbnVtZXJhdGlvbiggQVREZXRlY3Rvck1vZGUgKTtcclxufVxyXG5cclxuYmVlcnNMYXdMYWIucmVnaXN0ZXIoICdBVERldGVjdG9yTW9kZScsIEFURGV0ZWN0b3JNb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0seUNBQXlDO0FBQ2pFLE9BQU9DLGdCQUFnQixNQUFNLDhDQUE4QztBQUMzRSxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBRTlDLGVBQWUsTUFBTUMsY0FBYyxTQUFTRixnQkFBZ0IsQ0FBQztFQUMzRCxPQUF1QkcsYUFBYSxHQUFHLElBQUlELGNBQWMsQ0FBQyxDQUFDO0VBQzNELE9BQXVCRSxVQUFVLEdBQUcsSUFBSUYsY0FBYyxDQUFDLENBQUM7RUFFeEQsT0FBdUJHLFdBQVcsR0FBRyxJQUFJTixXQUFXLENBQUVHLGNBQWUsQ0FBQztBQUN4RTtBQUVBRCxXQUFXLENBQUNLLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRUosY0FBZSxDQUFDIn0=