// Copyright 2018-2021, University of Colorado Boulder

/**
 * Enumeration for the type of entries in the game that may be editable, calculated dynamically, or given.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import areaModelCommon from '../../areaModelCommon.js';
import EntryDisplayType from './EntryDisplayType.js';
const EntryType = {
  EDITABLE: 'EDITABLE',
  DYNAMIC: 'DYNAMIC',
  GIVEN: 'GIVEN'
};
areaModelCommon.register('EntryType', EntryType);

// @public {Array.<EntryType>} - All values the enumeration can take.
EntryType.VALUES = [EntryType.EDITABLE,
// the user inputs this value
EntryType.DYNAMIC,
// this value can change (be computed) based on the user's input
EntryType.GIVEN // this value is fixed for a given challenge
];

const gameToDisplayMap = {};
gameToDisplayMap[EntryType.EDITABLE] = EntryDisplayType.EDITABLE;
gameToDisplayMap[EntryType.DYNAMIC] = EntryDisplayType.READOUT;
gameToDisplayMap[EntryType.GIVEN] = EntryDisplayType.READOUT;

/**
 * Returns the preferred display type for a given game value.
 * @public
 *
 * @param {EntryType} type
 * @returns {boolean}
 */
EntryType.toDisplayType = function (type) {
  assert && assert(_.includes(EntryType.VALUES, type));
  return gameToDisplayMap[type];
};

// verify that enumeration is immutable, without the runtime penalty in production code
if (assert) {
  Object.freeze(EntryType);
}
export default EntryType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhcmVhTW9kZWxDb21tb24iLCJFbnRyeURpc3BsYXlUeXBlIiwiRW50cnlUeXBlIiwiRURJVEFCTEUiLCJEWU5BTUlDIiwiR0lWRU4iLCJyZWdpc3RlciIsIlZBTFVFUyIsImdhbWVUb0Rpc3BsYXlNYXAiLCJSRUFET1VUIiwidG9EaXNwbGF5VHlwZSIsInR5cGUiLCJhc3NlcnQiLCJfIiwiaW5jbHVkZXMiLCJPYmplY3QiLCJmcmVlemUiXSwic291cmNlcyI6WyJFbnRyeVR5cGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRW51bWVyYXRpb24gZm9yIHRoZSB0eXBlIG9mIGVudHJpZXMgaW4gdGhlIGdhbWUgdGhhdCBtYXkgYmUgZWRpdGFibGUsIGNhbGN1bGF0ZWQgZHluYW1pY2FsbHksIG9yIGdpdmVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGFyZWFNb2RlbENvbW1vbiBmcm9tICcuLi8uLi9hcmVhTW9kZWxDb21tb24uanMnO1xyXG5pbXBvcnQgRW50cnlEaXNwbGF5VHlwZSBmcm9tICcuL0VudHJ5RGlzcGxheVR5cGUuanMnO1xyXG5cclxuY29uc3QgRW50cnlUeXBlID0ge1xyXG4gIEVESVRBQkxFOiAnRURJVEFCTEUnLFxyXG4gIERZTkFNSUM6ICdEWU5BTUlDJyxcclxuICBHSVZFTjogJ0dJVkVOJ1xyXG59O1xyXG5cclxuYXJlYU1vZGVsQ29tbW9uLnJlZ2lzdGVyKCAnRW50cnlUeXBlJywgRW50cnlUeXBlICk7XHJcblxyXG4vLyBAcHVibGljIHtBcnJheS48RW50cnlUeXBlPn0gLSBBbGwgdmFsdWVzIHRoZSBlbnVtZXJhdGlvbiBjYW4gdGFrZS5cclxuRW50cnlUeXBlLlZBTFVFUyA9IFtcclxuICBFbnRyeVR5cGUuRURJVEFCTEUsIC8vIHRoZSB1c2VyIGlucHV0cyB0aGlzIHZhbHVlXHJcbiAgRW50cnlUeXBlLkRZTkFNSUMsIC8vIHRoaXMgdmFsdWUgY2FuIGNoYW5nZSAoYmUgY29tcHV0ZWQpIGJhc2VkIG9uIHRoZSB1c2VyJ3MgaW5wdXRcclxuICBFbnRyeVR5cGUuR0lWRU4gLy8gdGhpcyB2YWx1ZSBpcyBmaXhlZCBmb3IgYSBnaXZlbiBjaGFsbGVuZ2VcclxuXTtcclxuXHJcbmNvbnN0IGdhbWVUb0Rpc3BsYXlNYXAgPSB7fTtcclxuZ2FtZVRvRGlzcGxheU1hcFsgRW50cnlUeXBlLkVESVRBQkxFIF0gPSBFbnRyeURpc3BsYXlUeXBlLkVESVRBQkxFO1xyXG5nYW1lVG9EaXNwbGF5TWFwWyBFbnRyeVR5cGUuRFlOQU1JQyBdID0gRW50cnlEaXNwbGF5VHlwZS5SRUFET1VUO1xyXG5nYW1lVG9EaXNwbGF5TWFwWyBFbnRyeVR5cGUuR0lWRU4gXSA9IEVudHJ5RGlzcGxheVR5cGUuUkVBRE9VVDtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBwcmVmZXJyZWQgZGlzcGxheSB0eXBlIGZvciBhIGdpdmVuIGdhbWUgdmFsdWUuXHJcbiAqIEBwdWJsaWNcclxuICpcclxuICogQHBhcmFtIHtFbnRyeVR5cGV9IHR5cGVcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5FbnRyeVR5cGUudG9EaXNwbGF5VHlwZSA9IGZ1bmN0aW9uKCB0eXBlICkge1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIEVudHJ5VHlwZS5WQUxVRVMsIHR5cGUgKSApO1xyXG5cclxuICByZXR1cm4gZ2FtZVRvRGlzcGxheU1hcFsgdHlwZSBdO1xyXG59O1xyXG5cclxuLy8gdmVyaWZ5IHRoYXQgZW51bWVyYXRpb24gaXMgaW1tdXRhYmxlLCB3aXRob3V0IHRoZSBydW50aW1lIHBlbmFsdHkgaW4gcHJvZHVjdGlvbiBjb2RlXHJcbmlmICggYXNzZXJ0ICkgeyBPYmplY3QuZnJlZXplKCBFbnRyeVR5cGUgKTsgfVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRW50cnlUeXBlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLGdCQUFnQixNQUFNLHVCQUF1QjtBQUVwRCxNQUFNQyxTQUFTLEdBQUc7RUFDaEJDLFFBQVEsRUFBRSxVQUFVO0VBQ3BCQyxPQUFPLEVBQUUsU0FBUztFQUNsQkMsS0FBSyxFQUFFO0FBQ1QsQ0FBQztBQUVETCxlQUFlLENBQUNNLFFBQVEsQ0FBRSxXQUFXLEVBQUVKLFNBQVUsQ0FBQzs7QUFFbEQ7QUFDQUEsU0FBUyxDQUFDSyxNQUFNLEdBQUcsQ0FDakJMLFNBQVMsQ0FBQ0MsUUFBUTtBQUFFO0FBQ3BCRCxTQUFTLENBQUNFLE9BQU87QUFBRTtBQUNuQkYsU0FBUyxDQUFDRyxLQUFLLENBQUM7QUFBQSxDQUNqQjs7QUFFRCxNQUFNRyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7QUFDM0JBLGdCQUFnQixDQUFFTixTQUFTLENBQUNDLFFBQVEsQ0FBRSxHQUFHRixnQkFBZ0IsQ0FBQ0UsUUFBUTtBQUNsRUssZ0JBQWdCLENBQUVOLFNBQVMsQ0FBQ0UsT0FBTyxDQUFFLEdBQUdILGdCQUFnQixDQUFDUSxPQUFPO0FBQ2hFRCxnQkFBZ0IsQ0FBRU4sU0FBUyxDQUFDRyxLQUFLLENBQUUsR0FBR0osZ0JBQWdCLENBQUNRLE9BQU87O0FBRTlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FQLFNBQVMsQ0FBQ1EsYUFBYSxHQUFHLFVBQVVDLElBQUksRUFBRztFQUN6Q0MsTUFBTSxJQUFJQSxNQUFNLENBQUVDLENBQUMsQ0FBQ0MsUUFBUSxDQUFFWixTQUFTLENBQUNLLE1BQU0sRUFBRUksSUFBSyxDQUFFLENBQUM7RUFFeEQsT0FBT0gsZ0JBQWdCLENBQUVHLElBQUksQ0FBRTtBQUNqQyxDQUFDOztBQUVEO0FBQ0EsSUFBS0MsTUFBTSxFQUFHO0VBQUVHLE1BQU0sQ0FBQ0MsTUFBTSxDQUFFZCxTQUFVLENBQUM7QUFBRTtBQUU1QyxlQUFlQSxTQUFTIn0=