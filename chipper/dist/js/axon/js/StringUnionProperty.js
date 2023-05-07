// Copyright 2022, University of Colorado Boulder

/**
 * In TypeScript, it is common to use a string literal union as an enumeration.  This type automatically specifies
 * validValues and the phetioType for convenience.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from './Property.js';
import StringUnionIO from '../../tandem/js/types/StringUnionIO.js';
import optionize from '../../phet-core/js/optionize.js';
import axon from './axon.js';
export default class StringUnionProperty extends Property {
  constructor(value, providedOptions) {
    const options = optionize()({
      phetioValueType: StringUnionIO(providedOptions.validValues)
    }, providedOptions);
    super(value, options);
  }
}
axon.register('StringUnionProperty', StringUnionProperty);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlN0cmluZ1VuaW9uSU8iLCJvcHRpb25pemUiLCJheG9uIiwiU3RyaW5nVW5pb25Qcm9wZXJ0eSIsImNvbnN0cnVjdG9yIiwidmFsdWUiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicGhldGlvVmFsdWVUeXBlIiwidmFsaWRWYWx1ZXMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN0cmluZ1VuaW9uUHJvcGVydHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEluIFR5cGVTY3JpcHQsIGl0IGlzIGNvbW1vbiB0byB1c2UgYSBzdHJpbmcgbGl0ZXJhbCB1bmlvbiBhcyBhbiBlbnVtZXJhdGlvbi4gIFRoaXMgdHlwZSBhdXRvbWF0aWNhbGx5IHNwZWNpZmllc1xyXG4gKiB2YWxpZFZhbHVlcyBhbmQgdGhlIHBoZXRpb1R5cGUgZm9yIGNvbnZlbmllbmNlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSwgeyBQcm9wZXJ0eU9wdGlvbnMgfSBmcm9tICcuL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFN0cmluZ1VuaW9uSU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0cmluZ1VuaW9uSU8uanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgYXhvbiBmcm9tICcuL2F4b24uanMnO1xyXG5cclxudHlwZSBTdHJpbmdFbnVtZXJhdGlvblByb3BlcnR5T3B0aW9uczxUPiA9IFN0cmljdE9taXQ8UHJvcGVydHlPcHRpb25zPFQ+LCAncGhldGlvVmFsdWVUeXBlJz4gJlxyXG4gIFBpY2tSZXF1aXJlZDxQcm9wZXJ0eU9wdGlvbnM8VD4sICd2YWxpZFZhbHVlcyc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RyaW5nVW5pb25Qcm9wZXJ0eTxUIGV4dGVuZHMgc3RyaW5nPiBleHRlbmRzIFByb3BlcnR5PFQ+IHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHZhbHVlOiBULCBwcm92aWRlZE9wdGlvbnM6IFN0cmluZ0VudW1lcmF0aW9uUHJvcGVydHlPcHRpb25zPFQ+ICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U3RyaW5nRW51bWVyYXRpb25Qcm9wZXJ0eU9wdGlvbnM8VD4sIEVtcHR5U2VsZk9wdGlvbnMsIFByb3BlcnR5T3B0aW9uczxUPj4oKSgge1xyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IFN0cmluZ1VuaW9uSU8oIHByb3ZpZGVkT3B0aW9ucy52YWxpZFZhbHVlcyApXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggdmFsdWUsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmF4b24ucmVnaXN0ZXIoICdTdHJpbmdVbmlvblByb3BlcnR5JywgU3RyaW5nVW5pb25Qcm9wZXJ0eSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBMkIsZUFBZTtBQUN6RCxPQUFPQyxhQUFhLE1BQU0sd0NBQXdDO0FBQ2xFLE9BQU9DLFNBQVMsTUFBNEIsaUNBQWlDO0FBRzdFLE9BQU9DLElBQUksTUFBTSxXQUFXO0FBSzVCLGVBQWUsTUFBTUMsbUJBQW1CLFNBQTJCSixRQUFRLENBQUk7RUFDdEVLLFdBQVdBLENBQUVDLEtBQVEsRUFBRUMsZUFBb0QsRUFBRztJQUVuRixNQUFNQyxPQUFPLEdBQUdOLFNBQVMsQ0FBNEUsQ0FBQyxDQUFFO01BQ3RHTyxlQUFlLEVBQUVSLGFBQWEsQ0FBRU0sZUFBZSxDQUFDRyxXQUFZO0lBQzlELENBQUMsRUFBRUgsZUFBZ0IsQ0FBQztJQUVwQixLQUFLLENBQUVELEtBQUssRUFBRUUsT0FBUSxDQUFDO0VBQ3pCO0FBQ0Y7QUFFQUwsSUFBSSxDQUFDUSxRQUFRLENBQUUscUJBQXFCLEVBQUVQLG1CQUFvQixDQUFDIn0=