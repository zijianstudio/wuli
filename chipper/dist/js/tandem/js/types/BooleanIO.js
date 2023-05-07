// Copyright 2018-2022, University of Colorado Boulder

/**
 * IO Type for JS's built-in boolean type.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import tandemNamespace from '../tandemNamespace.js';
import IOType from './IOType.js';
import StateSchema from './StateSchema.js';
import ValueIO from './ValueIO.js';
const BooleanIO = new IOType('BooleanIO', {
  supertype: ValueIO,
  valueType: 'boolean',
  documentation: 'IO Type for Javascript\'s boolean primitive type',
  stateSchema: StateSchema.asValue('boolean', {
    valueType: 'boolean'
  }),
  toStateObject: _.identity
});
tandemNamespace.register('BooleanIO', BooleanIO);
export default BooleanIO;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0YW5kZW1OYW1lc3BhY2UiLCJJT1R5cGUiLCJTdGF0ZVNjaGVtYSIsIlZhbHVlSU8iLCJCb29sZWFuSU8iLCJzdXBlcnR5cGUiLCJ2YWx1ZVR5cGUiLCJkb2N1bWVudGF0aW9uIiwic3RhdGVTY2hlbWEiLCJhc1ZhbHVlIiwidG9TdGF0ZU9iamVjdCIsIl8iLCJpZGVudGl0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQm9vbGVhbklPLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIElPIFR5cGUgZm9yIEpTJ3MgYnVpbHQtaW4gYm9vbGVhbiB0eXBlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEFuZHJldyBBZGFyZSAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgdGFuZGVtTmFtZXNwYWNlIGZyb20gJy4uL3RhbmRlbU5hbWVzcGFjZS5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi9JT1R5cGUuanMnO1xyXG5pbXBvcnQgU3RhdGVTY2hlbWEgZnJvbSAnLi9TdGF0ZVNjaGVtYS5qcyc7XHJcbmltcG9ydCBWYWx1ZUlPIGZyb20gJy4vVmFsdWVJTy5qcyc7XHJcblxyXG5jb25zdCBCb29sZWFuSU8gPSBuZXcgSU9UeXBlPGJvb2xlYW4sIGJvb2xlYW4+KCAnQm9vbGVhbklPJywge1xyXG4gIHN1cGVydHlwZTogVmFsdWVJTyxcclxuICB2YWx1ZVR5cGU6ICdib29sZWFuJyxcclxuICBkb2N1bWVudGF0aW9uOiAnSU8gVHlwZSBmb3IgSmF2YXNjcmlwdFxcJ3MgYm9vbGVhbiBwcmltaXRpdmUgdHlwZScsXHJcbiAgc3RhdGVTY2hlbWE6IFN0YXRlU2NoZW1hLmFzVmFsdWU8Ym9vbGVhbiwgYm9vbGVhbj4oICdib29sZWFuJywgeyB2YWx1ZVR5cGU6ICdib29sZWFuJyB9ICksXHJcbiAgdG9TdGF0ZU9iamVjdDogXy5pZGVudGl0eVxyXG59ICk7XHJcblxyXG50YW5kZW1OYW1lc3BhY2UucmVnaXN0ZXIoICdCb29sZWFuSU8nLCBCb29sZWFuSU8gKTtcclxuZXhwb3J0IGRlZmF1bHQgQm9vbGVhbklPOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx1QkFBdUI7QUFDbkQsT0FBT0MsTUFBTSxNQUFNLGFBQWE7QUFDaEMsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjtBQUMxQyxPQUFPQyxPQUFPLE1BQU0sY0FBYztBQUVsQyxNQUFNQyxTQUFTLEdBQUcsSUFBSUgsTUFBTSxDQUFvQixXQUFXLEVBQUU7RUFDM0RJLFNBQVMsRUFBRUYsT0FBTztFQUNsQkcsU0FBUyxFQUFFLFNBQVM7RUFDcEJDLGFBQWEsRUFBRSxrREFBa0Q7RUFDakVDLFdBQVcsRUFBRU4sV0FBVyxDQUFDTyxPQUFPLENBQW9CLFNBQVMsRUFBRTtJQUFFSCxTQUFTLEVBQUU7RUFBVSxDQUFFLENBQUM7RUFDekZJLGFBQWEsRUFBRUMsQ0FBQyxDQUFDQztBQUNuQixDQUFFLENBQUM7QUFFSFosZUFBZSxDQUFDYSxRQUFRLENBQUUsV0FBVyxFQUFFVCxTQUFVLENBQUM7QUFDbEQsZUFBZUEsU0FBUyJ9