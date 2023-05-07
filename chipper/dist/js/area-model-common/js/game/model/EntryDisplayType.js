// Copyright 2018-2021, University of Colorado Boulder

/**
 * Enumeration for the different ways an editable entry can be handled.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import areaModelCommon from '../../areaModelCommon.js';
const EntryDisplayType = {
  EDITABLE: 'EDITABLE',
  READOUT: 'READOUT',
  HIDDEN: 'HIDDEN'
};
areaModelCommon.register('EntryDisplayType', EntryDisplayType);

// @public {Array.<EntryDisplayType>} - All values the enumeration can take.
EntryDisplayType.VALUES = [EntryDisplayType.EDITABLE,
// editable, and shows the edited value
EntryDisplayType.READOUT,
// just the value shown, does not look editable
EntryDisplayType.HIDDEN // nothing shown
];

// verify that enumeration is immutable, without the runtime penalty in production code
if (assert) {
  Object.freeze(EntryDisplayType);
}
export default EntryDisplayType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhcmVhTW9kZWxDb21tb24iLCJFbnRyeURpc3BsYXlUeXBlIiwiRURJVEFCTEUiLCJSRUFET1VUIiwiSElEREVOIiwicmVnaXN0ZXIiLCJWQUxVRVMiLCJhc3NlcnQiLCJPYmplY3QiLCJmcmVlemUiXSwic291cmNlcyI6WyJFbnRyeURpc3BsYXlUeXBlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEVudW1lcmF0aW9uIGZvciB0aGUgZGlmZmVyZW50IHdheXMgYW4gZWRpdGFibGUgZW50cnkgY2FuIGJlIGhhbmRsZWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgYXJlYU1vZGVsQ29tbW9uIGZyb20gJy4uLy4uL2FyZWFNb2RlbENvbW1vbi5qcyc7XHJcblxyXG5jb25zdCBFbnRyeURpc3BsYXlUeXBlID0ge1xyXG4gIEVESVRBQkxFOiAnRURJVEFCTEUnLFxyXG4gIFJFQURPVVQ6ICdSRUFET1VUJyxcclxuICBISURERU46ICdISURERU4nXHJcbn07XHJcblxyXG5hcmVhTW9kZWxDb21tb24ucmVnaXN0ZXIoICdFbnRyeURpc3BsYXlUeXBlJywgRW50cnlEaXNwbGF5VHlwZSApO1xyXG5cclxuLy8gQHB1YmxpYyB7QXJyYXkuPEVudHJ5RGlzcGxheVR5cGU+fSAtIEFsbCB2YWx1ZXMgdGhlIGVudW1lcmF0aW9uIGNhbiB0YWtlLlxyXG5FbnRyeURpc3BsYXlUeXBlLlZBTFVFUyA9IFtcclxuICBFbnRyeURpc3BsYXlUeXBlLkVESVRBQkxFLCAvLyBlZGl0YWJsZSwgYW5kIHNob3dzIHRoZSBlZGl0ZWQgdmFsdWVcclxuICBFbnRyeURpc3BsYXlUeXBlLlJFQURPVVQsIC8vIGp1c3QgdGhlIHZhbHVlIHNob3duLCBkb2VzIG5vdCBsb29rIGVkaXRhYmxlXHJcbiAgRW50cnlEaXNwbGF5VHlwZS5ISURERU4gLy8gbm90aGluZyBzaG93blxyXG5dO1xyXG5cclxuLy8gdmVyaWZ5IHRoYXQgZW51bWVyYXRpb24gaXMgaW1tdXRhYmxlLCB3aXRob3V0IHRoZSBydW50aW1lIHBlbmFsdHkgaW4gcHJvZHVjdGlvbiBjb2RlXHJcbmlmICggYXNzZXJ0ICkgeyBPYmplY3QuZnJlZXplKCBFbnRyeURpc3BsYXlUeXBlICk7IH1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEVudHJ5RGlzcGxheVR5cGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSwwQkFBMEI7QUFFdEQsTUFBTUMsZ0JBQWdCLEdBQUc7RUFDdkJDLFFBQVEsRUFBRSxVQUFVO0VBQ3BCQyxPQUFPLEVBQUUsU0FBUztFQUNsQkMsTUFBTSxFQUFFO0FBQ1YsQ0FBQztBQUVESixlQUFlLENBQUNLLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRUosZ0JBQWlCLENBQUM7O0FBRWhFO0FBQ0FBLGdCQUFnQixDQUFDSyxNQUFNLEdBQUcsQ0FDeEJMLGdCQUFnQixDQUFDQyxRQUFRO0FBQUU7QUFDM0JELGdCQUFnQixDQUFDRSxPQUFPO0FBQUU7QUFDMUJGLGdCQUFnQixDQUFDRyxNQUFNLENBQUM7QUFBQSxDQUN6Qjs7QUFFRDtBQUNBLElBQUtHLE1BQU0sRUFBRztFQUFFQyxNQUFNLENBQUNDLE1BQU0sQ0FBRVIsZ0JBQWlCLENBQUM7QUFBRTtBQUVuRCxlQUFlQSxnQkFBZ0IifQ==