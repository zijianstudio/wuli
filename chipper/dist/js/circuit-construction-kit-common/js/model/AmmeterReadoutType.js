// Copyright 2021-2022, University of Colorado Boulder

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

/**
 * How the ammeter readout is displayed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
export default class AmmeterReadoutType extends EnumerationValue {
  static MAGNITUDE = new AmmeterReadoutType();
  static SIGNED = new AmmeterReadoutType();
  static enumeration = new Enumeration(AmmeterReadoutType);
}
circuitConstructionKitCommon.register('AmmeterReadoutType', AmmeterReadoutType);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIiwiQW1tZXRlclJlYWRvdXRUeXBlIiwiTUFHTklUVURFIiwiU0lHTkVEIiwiZW51bWVyYXRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFtbWV0ZXJSZWFkb3V0VHlwZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvbiBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb24uanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25WYWx1ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25WYWx1ZS5qcyc7XHJcbmltcG9ydCBjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIGZyb20gJy4uL2NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24uanMnO1xyXG5cclxuLyoqXHJcbiAqIEhvdyB0aGUgYW1tZXRlciByZWFkb3V0IGlzIGRpc3BsYXllZC5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFtbWV0ZXJSZWFkb3V0VHlwZSBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWUge1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTUFHTklUVURFID0gbmV3IEFtbWV0ZXJSZWFkb3V0VHlwZSgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU0lHTkVEID0gbmV3IEFtbWV0ZXJSZWFkb3V0VHlwZSgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIEFtbWV0ZXJSZWFkb3V0VHlwZSApO1xyXG59XHJcblxyXG5jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLnJlZ2lzdGVyKCAnQW1tZXRlclJlYWRvdXRUeXBlJywgQW1tZXRlclJlYWRvdXRUeXBlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0sc0NBQXNDO0FBQzlELE9BQU9DLGdCQUFnQixNQUFNLDJDQUEyQztBQUN4RSxPQUFPQyw0QkFBNEIsTUFBTSxvQ0FBb0M7O0FBRTdFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE1BQU1DLGtCQUFrQixTQUFTRixnQkFBZ0IsQ0FBQztFQUMvRCxPQUF1QkcsU0FBUyxHQUFHLElBQUlELGtCQUFrQixDQUFDLENBQUM7RUFDM0QsT0FBdUJFLE1BQU0sR0FBRyxJQUFJRixrQkFBa0IsQ0FBQyxDQUFDO0VBQ3hELE9BQXVCRyxXQUFXLEdBQUcsSUFBSU4sV0FBVyxDQUFFRyxrQkFBbUIsQ0FBQztBQUM1RTtBQUVBRCw0QkFBNEIsQ0FBQ0ssUUFBUSxDQUFFLG9CQUFvQixFQUFFSixrQkFBbUIsQ0FBQyJ9