// Copyright 2021-2023, University of Colorado Boulder

/**
 * SubitizeObjectType identifies the countingObject type in the 'Subitize' game in Number Play.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Luisa Vargas
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import numberPlay from '../../numberPlay.js';
import CountingObjectType from '../../../../counting-common/js/common/model/CountingObjectType.js';
class SubitizeObjectType extends CountingObjectType {
  static CIRCLE = new SubitizeObjectType();
  static enumeration = new Enumeration(SubitizeObjectType, {
    instanceType: CountingObjectType
  });
}
numberPlay.register('SubitizeObjectType', SubitizeObjectType);
export default SubitizeObjectType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIm51bWJlclBsYXkiLCJDb3VudGluZ09iamVjdFR5cGUiLCJTdWJpdGl6ZU9iamVjdFR5cGUiLCJDSVJDTEUiLCJlbnVtZXJhdGlvbiIsImluc3RhbmNlVHlwZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3ViaXRpemVPYmplY3RUeXBlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFN1Yml0aXplT2JqZWN0VHlwZSBpZGVudGlmaWVzIHRoZSBjb3VudGluZ09iamVjdCB0eXBlIGluIHRoZSAnU3ViaXRpemUnIGdhbWUgaW4gTnVtYmVyIFBsYXkuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBMdWlzYSBWYXJnYXNcclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcclxuaW1wb3J0IG51bWJlclBsYXkgZnJvbSAnLi4vLi4vbnVtYmVyUGxheS5qcyc7XHJcbmltcG9ydCBDb3VudGluZ09iamVjdFR5cGUgZnJvbSAnLi4vLi4vLi4vLi4vY291bnRpbmctY29tbW9uL2pzL2NvbW1vbi9tb2RlbC9Db3VudGluZ09iamVjdFR5cGUuanMnO1xyXG5cclxuY2xhc3MgU3ViaXRpemVPYmplY3RUeXBlIGV4dGVuZHMgQ291bnRpbmdPYmplY3RUeXBlIHtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IENJUkNMRSA9IG5ldyBTdWJpdGl6ZU9iamVjdFR5cGUoKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyBvdmVycmlkZSByZWFkb25seSBlbnVtZXJhdGlvbiA9IG5ldyBFbnVtZXJhdGlvbiggU3ViaXRpemVPYmplY3RUeXBlLCB7XHJcbiAgICBpbnN0YW5jZVR5cGU6IENvdW50aW5nT2JqZWN0VHlwZVxyXG4gIH0gKTtcclxufVxyXG5cclxubnVtYmVyUGxheS5yZWdpc3RlciggJ1N1Yml0aXplT2JqZWN0VHlwZScsIFN1Yml0aXplT2JqZWN0VHlwZSApO1xyXG5leHBvcnQgZGVmYXVsdCBTdWJpdGl6ZU9iamVjdFR5cGU7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsVUFBVSxNQUFNLHFCQUFxQjtBQUM1QyxPQUFPQyxrQkFBa0IsTUFBTSxtRUFBbUU7QUFFbEcsTUFBTUMsa0JBQWtCLFNBQVNELGtCQUFrQixDQUFDO0VBQ2xELE9BQXVCRSxNQUFNLEdBQUcsSUFBSUQsa0JBQWtCLENBQUMsQ0FBQztFQUV4RCxPQUFnQ0UsV0FBVyxHQUFHLElBQUlMLFdBQVcsQ0FBRUcsa0JBQWtCLEVBQUU7SUFDakZHLFlBQVksRUFBRUo7RUFDaEIsQ0FBRSxDQUFDO0FBQ0w7QUFFQUQsVUFBVSxDQUFDTSxRQUFRLENBQUUsb0JBQW9CLEVBQUVKLGtCQUFtQixDQUFDO0FBQy9ELGVBQWVBLGtCQUFrQiJ9