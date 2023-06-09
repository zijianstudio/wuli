// Copyright 2022, University of Colorado Boulder

/**
 * Counting object types for counting-common.
 *
 * @author Chris Klusendorf
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import countingCommon from '../../countingCommon.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
class CountingObjectType extends EnumerationValue {
  static DOG = new CountingObjectType();
  static APPLE = new CountingObjectType();
  static BUTTERFLY = new CountingObjectType();
  static BALL = new CountingObjectType();
  static PAPER_NUMBER = new CountingObjectType();
  static enumeration = new Enumeration(CountingObjectType);
}
countingCommon.register('CountingObjectType', CountingObjectType);
export default CountingObjectType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsImNvdW50aW5nQ29tbW9uIiwiRW51bWVyYXRpb25WYWx1ZSIsIkNvdW50aW5nT2JqZWN0VHlwZSIsIkRPRyIsIkFQUExFIiwiQlVUVEVSRkxZIiwiQkFMTCIsIlBBUEVSX05VTUJFUiIsImVudW1lcmF0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb3VudGluZ09iamVjdFR5cGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvdW50aW5nIG9iamVjdCB0eXBlcyBmb3IgY291bnRpbmctY29tbW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmZcclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcclxuaW1wb3J0IGNvdW50aW5nQ29tbW9uIGZyb20gJy4uLy4uL2NvdW50aW5nQ29tbW9uLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uVmFsdWUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uVmFsdWUuanMnO1xyXG5cclxuY2xhc3MgQ291bnRpbmdPYmplY3RUeXBlIGV4dGVuZHMgRW51bWVyYXRpb25WYWx1ZSB7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBET0cgPSBuZXcgQ291bnRpbmdPYmplY3RUeXBlKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBBUFBMRSA9IG5ldyBDb3VudGluZ09iamVjdFR5cGUoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEJVVFRFUkZMWSA9IG5ldyBDb3VudGluZ09iamVjdFR5cGUoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEJBTEwgPSBuZXcgQ291bnRpbmdPYmplY3RUeXBlKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBQQVBFUl9OVU1CRVIgPSBuZXcgQ291bnRpbmdPYmplY3RUeXBlKCk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIENvdW50aW5nT2JqZWN0VHlwZSApO1xyXG59XHJcblxyXG5jb3VudGluZ0NvbW1vbi5yZWdpc3RlciggJ0NvdW50aW5nT2JqZWN0VHlwZScsIENvdW50aW5nT2JqZWN0VHlwZSApO1xyXG5leHBvcnQgZGVmYXVsdCBDb3VudGluZ09iamVjdFR5cGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUNwRCxPQUFPQyxnQkFBZ0IsTUFBTSw4Q0FBOEM7QUFFM0UsTUFBTUMsa0JBQWtCLFNBQVNELGdCQUFnQixDQUFDO0VBQ2hELE9BQXVCRSxHQUFHLEdBQUcsSUFBSUQsa0JBQWtCLENBQUMsQ0FBQztFQUNyRCxPQUF1QkUsS0FBSyxHQUFHLElBQUlGLGtCQUFrQixDQUFDLENBQUM7RUFDdkQsT0FBdUJHLFNBQVMsR0FBRyxJQUFJSCxrQkFBa0IsQ0FBQyxDQUFDO0VBQzNELE9BQXVCSSxJQUFJLEdBQUcsSUFBSUosa0JBQWtCLENBQUMsQ0FBQztFQUN0RCxPQUF1QkssWUFBWSxHQUFHLElBQUlMLGtCQUFrQixDQUFDLENBQUM7RUFFOUQsT0FBdUJNLFdBQVcsR0FBRyxJQUFJVCxXQUFXLENBQUVHLGtCQUFtQixDQUFDO0FBQzVFO0FBRUFGLGNBQWMsQ0FBQ1MsUUFBUSxDQUFFLG9CQUFvQixFQUFFUCxrQkFBbUIsQ0FBQztBQUNuRSxlQUFlQSxrQkFBa0IifQ==