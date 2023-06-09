// Copyright 2022, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Enumeration from '../../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../../phet-core/js/EnumerationValue.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
class DistanceResponseType extends EnumerationValue {
  // Distance Progress is generally the "closer to" and "farther from" description.
  static DISTANCE_PROGRESS = new DistanceResponseType();

  // Distance Region is generally the qualitative region of how far one hand is to the other.
  static DISTANCE_REGION = new DistanceResponseType();

  // Combo is an algorithm to use either depending on the state of the describer.
  static COMBO = new DistanceResponseType();
  static enumeration = new Enumeration(DistanceResponseType);
}
ratioAndProportion.register('DistanceResponseType', DistanceResponseType);
export default DistanceResponseType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJyYXRpb0FuZFByb3BvcnRpb24iLCJEaXN0YW5jZVJlc3BvbnNlVHlwZSIsIkRJU1RBTkNFX1BST0dSRVNTIiwiRElTVEFOQ0VfUkVHSU9OIiwiQ09NQk8iLCJlbnVtZXJhdGlvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRGlzdGFuY2VSZXNwb25zZVR5cGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcclxuaW1wb3J0IHJhdGlvQW5kUHJvcG9ydGlvbiBmcm9tICcuLi8uLi8uLi9yYXRpb0FuZFByb3BvcnRpb24uanMnO1xyXG5cclxuY2xhc3MgRGlzdGFuY2VSZXNwb25zZVR5cGUgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlIHtcclxuXHJcbiAgLy8gRGlzdGFuY2UgUHJvZ3Jlc3MgaXMgZ2VuZXJhbGx5IHRoZSBcImNsb3NlciB0b1wiIGFuZCBcImZhcnRoZXIgZnJvbVwiIGRlc2NyaXB0aW9uLlxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgRElTVEFOQ0VfUFJPR1JFU1MgPSBuZXcgRGlzdGFuY2VSZXNwb25zZVR5cGUoKTtcclxuXHJcbiAgLy8gRGlzdGFuY2UgUmVnaW9uIGlzIGdlbmVyYWxseSB0aGUgcXVhbGl0YXRpdmUgcmVnaW9uIG9mIGhvdyBmYXIgb25lIGhhbmQgaXMgdG8gdGhlIG90aGVyLlxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgRElTVEFOQ0VfUkVHSU9OID0gbmV3IERpc3RhbmNlUmVzcG9uc2VUeXBlKCk7XHJcblxyXG4gIC8vIENvbWJvIGlzIGFuIGFsZ29yaXRobSB0byB1c2UgZWl0aGVyIGRlcGVuZGluZyBvbiB0aGUgc3RhdGUgb2YgdGhlIGRlc2NyaWJlci5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IENPTUJPID0gbmV3IERpc3RhbmNlUmVzcG9uc2VUeXBlKCk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIERpc3RhbmNlUmVzcG9uc2VUeXBlICk7XHJcbn1cclxuXHJcbnJhdGlvQW5kUHJvcG9ydGlvbi5yZWdpc3RlciggJ0Rpc3RhbmNlUmVzcG9uc2VUeXBlJywgRGlzdGFuY2VSZXNwb25zZVR5cGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgRGlzdGFuY2VSZXNwb25zZVR5cGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxPQUFPQyxnQkFBZ0IsTUFBTSxpREFBaUQ7QUFDOUUsT0FBT0Msa0JBQWtCLE1BQU0sZ0NBQWdDO0FBRS9ELE1BQU1DLG9CQUFvQixTQUFTRixnQkFBZ0IsQ0FBQztFQUVsRDtFQUNBLE9BQXVCRyxpQkFBaUIsR0FBRyxJQUFJRCxvQkFBb0IsQ0FBQyxDQUFDOztFQUVyRTtFQUNBLE9BQXVCRSxlQUFlLEdBQUcsSUFBSUYsb0JBQW9CLENBQUMsQ0FBQzs7RUFFbkU7RUFDQSxPQUF1QkcsS0FBSyxHQUFHLElBQUlILG9CQUFvQixDQUFDLENBQUM7RUFFekQsT0FBdUJJLFdBQVcsR0FBRyxJQUFJUCxXQUFXLENBQUVHLG9CQUFxQixDQUFDO0FBQzlFO0FBRUFELGtCQUFrQixDQUFDTSxRQUFRLENBQUUsc0JBQXNCLEVBQUVMLG9CQUFxQixDQUFDO0FBQzNFLGVBQWVBLG9CQUFvQiJ9