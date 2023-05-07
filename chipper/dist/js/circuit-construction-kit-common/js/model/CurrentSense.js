// Copyright 2021-2022, University of Colorado Boulder

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

/**
 * Enumeration for how to render the current: electrons or conventional (arrows).
 * Because of how this file is used in the model and query parameter file, it must be declared separately
 * to avoid circular module loading errors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
export default class CurrentSense extends EnumerationValue {
  static FORWARD = new CurrentSense();
  static BACKWARD = new CurrentSense();
  static UNSPECIFIED = new CurrentSense();
  static enumeration = new Enumeration(CurrentSense);
}
circuitConstructionKitCommon.register('CurrentSense', CurrentSense);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIiwiQ3VycmVudFNlbnNlIiwiRk9SV0FSRCIsIkJBQ0tXQVJEIiwiVU5TUEVDSUZJRUQiLCJlbnVtZXJhdGlvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ3VycmVudFNlbnNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcclxuaW1wb3J0IGNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24gZnJvbSAnLi4vY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5qcyc7XHJcblxyXG4vKipcclxuICogRW51bWVyYXRpb24gZm9yIGhvdyB0byByZW5kZXIgdGhlIGN1cnJlbnQ6IGVsZWN0cm9ucyBvciBjb252ZW50aW9uYWwgKGFycm93cykuXHJcbiAqIEJlY2F1c2Ugb2YgaG93IHRoaXMgZmlsZSBpcyB1c2VkIGluIHRoZSBtb2RlbCBhbmQgcXVlcnkgcGFyYW1ldGVyIGZpbGUsIGl0IG11c3QgYmUgZGVjbGFyZWQgc2VwYXJhdGVseVxyXG4gKiB0byBhdm9pZCBjaXJjdWxhciBtb2R1bGUgbG9hZGluZyBlcnJvcnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDdXJyZW50U2Vuc2UgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlIHtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEZPUldBUkQgPSBuZXcgQ3VycmVudFNlbnNlKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBCQUNLV0FSRCA9IG5ldyBDdXJyZW50U2Vuc2UoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFVOU1BFQ0lGSUVEID0gbmV3IEN1cnJlbnRTZW5zZSgpO1xyXG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IGVudW1lcmF0aW9uID0gbmV3IEVudW1lcmF0aW9uKCBDdXJyZW50U2Vuc2UgKTtcclxufVxyXG5cclxuY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5yZWdpc3RlciggJ0N1cnJlbnRTZW5zZScsIEN1cnJlbnRTZW5zZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLHNDQUFzQztBQUM5RCxPQUFPQyxnQkFBZ0IsTUFBTSwyQ0FBMkM7QUFDeEUsT0FBT0MsNEJBQTRCLE1BQU0sb0NBQW9DOztBQUU3RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsTUFBTUMsWUFBWSxTQUFTRixnQkFBZ0IsQ0FBQztFQUN6RCxPQUF1QkcsT0FBTyxHQUFHLElBQUlELFlBQVksQ0FBQyxDQUFDO0VBQ25ELE9BQXVCRSxRQUFRLEdBQUcsSUFBSUYsWUFBWSxDQUFDLENBQUM7RUFDcEQsT0FBdUJHLFdBQVcsR0FBRyxJQUFJSCxZQUFZLENBQUMsQ0FBQztFQUN2RCxPQUF3QkksV0FBVyxHQUFHLElBQUlQLFdBQVcsQ0FBRUcsWUFBYSxDQUFDO0FBQ3ZFO0FBRUFELDRCQUE0QixDQUFDTSxRQUFRLENBQUUsY0FBYyxFQUFFTCxZQUFhLENBQUMifQ==