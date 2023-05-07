// Copyright 2022, University of Colorado Boulder

/**
 * BANTimescalePoints identifies meaningful sets of points on a timescale with seconds as the unit of time.
 *
 * @author Luisa Vargas
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
const SECONDS_IN_A_YEAR = 365 * 24 * 60 * 60; // 365 days x 24 hrs/day x 60 min/hr x 60 sec/min
const TIME_FOR_LIGHT_TO_CROSS_AN_ATOM = Math.pow(10, -19);
class BANTimescalePoints extends EnumerationValue {
  static TIME_FOR_LIGHT_TO_CROSS_A_NUCLEUS = new BANTimescalePoints(BuildANucleusStrings.A + BuildANucleusStrings.timeForLightToCrossANucleus, Math.pow(10, -23));
  static TIME_FOR_LIGHT_TO_CROSS_AN_ATOM = new BANTimescalePoints(BuildANucleusStrings.B + BuildANucleusStrings.timeForLightToCrossAnAtom, TIME_FOR_LIGHT_TO_CROSS_AN_ATOM);
  static TIME_FOR_LIGHT_TO_CROSS_ONE_THOUSAND_ATOMS = new BANTimescalePoints(BuildANucleusStrings.C + BuildANucleusStrings.timeForLightToCrossOneThousandAtoms, TIME_FOR_LIGHT_TO_CROSS_AN_ATOM * 1000);
  static TIME_FOR_SOUND_TO_TRAVEL_ONE_MILLIMETER = new BANTimescalePoints(BuildANucleusStrings.D + BuildANucleusStrings.timeForSoundToTravelOneMillimeter, 2e-6);
  static A_BLINK_OF_AN_EYE = new BANTimescalePoints(BuildANucleusStrings.E + BuildANucleusStrings.aBlinkOfAnEye, 1 / 3);
  static ONE_MINUTE = new BANTimescalePoints(BuildANucleusStrings.F + BuildANucleusStrings.oneMinute, 60);
  static ONE_YEAR = new BANTimescalePoints(BuildANucleusStrings.G + BuildANucleusStrings.oneYear, SECONDS_IN_A_YEAR);
  static AVERAGE_HUMAN_LIFESPAN = new BANTimescalePoints(BuildANucleusStrings.H + BuildANucleusStrings.averageHumanLifespan, 72.6 * SECONDS_IN_A_YEAR);
  static AGE_OF_THE_UNIVERSE = new BANTimescalePoints(BuildANucleusStrings.I + BuildANucleusStrings.ageOfTheUniverse, 13.77e9 * SECONDS_IN_A_YEAR);
  static LIFETIME_OF_LONGEST_LIVED_STARS = new BANTimescalePoints(BuildANucleusStrings.J + BuildANucleusStrings.lifetimeOfLongestLivedStars, 450e18);
  static enumeration = new Enumeration(BANTimescalePoints);
  constructor(timescaleItem, numberOfSeconds) {
    super();
    this.timescaleItem = timescaleItem;
    this.numberOfSeconds = numberOfSeconds;
  }
}
buildANucleus.register('BANTimescalePoints', BANTimescalePoints);
export default BANTimescalePoints;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblZhbHVlIiwiRW51bWVyYXRpb24iLCJidWlsZEFOdWNsZXVzIiwiQnVpbGRBTnVjbGV1c1N0cmluZ3MiLCJTRUNPTkRTX0lOX0FfWUVBUiIsIlRJTUVfRk9SX0xJR0hUX1RPX0NST1NTX0FOX0FUT00iLCJNYXRoIiwicG93IiwiQkFOVGltZXNjYWxlUG9pbnRzIiwiVElNRV9GT1JfTElHSFRfVE9fQ1JPU1NfQV9OVUNMRVVTIiwiQSIsInRpbWVGb3JMaWdodFRvQ3Jvc3NBTnVjbGV1cyIsIkIiLCJ0aW1lRm9yTGlnaHRUb0Nyb3NzQW5BdG9tIiwiVElNRV9GT1JfTElHSFRfVE9fQ1JPU1NfT05FX1RIT1VTQU5EX0FUT01TIiwiQyIsInRpbWVGb3JMaWdodFRvQ3Jvc3NPbmVUaG91c2FuZEF0b21zIiwiVElNRV9GT1JfU09VTkRfVE9fVFJBVkVMX09ORV9NSUxMSU1FVEVSIiwiRCIsInRpbWVGb3JTb3VuZFRvVHJhdmVsT25lTWlsbGltZXRlciIsIkFfQkxJTktfT0ZfQU5fRVlFIiwiRSIsImFCbGlua09mQW5FeWUiLCJPTkVfTUlOVVRFIiwiRiIsIm9uZU1pbnV0ZSIsIk9ORV9ZRUFSIiwiRyIsIm9uZVllYXIiLCJBVkVSQUdFX0hVTUFOX0xJRkVTUEFOIiwiSCIsImF2ZXJhZ2VIdW1hbkxpZmVzcGFuIiwiQUdFX09GX1RIRV9VTklWRVJTRSIsIkkiLCJhZ2VPZlRoZVVuaXZlcnNlIiwiTElGRVRJTUVfT0ZfTE9OR0VTVF9MSVZFRF9TVEFSUyIsIkoiLCJsaWZldGltZU9mTG9uZ2VzdExpdmVkU3RhcnMiLCJlbnVtZXJhdGlvbiIsImNvbnN0cnVjdG9yIiwidGltZXNjYWxlSXRlbSIsIm51bWJlck9mU2Vjb25kcyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQkFOVGltZXNjYWxlUG9pbnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCQU5UaW1lc2NhbGVQb2ludHMgaWRlbnRpZmllcyBtZWFuaW5nZnVsIHNldHMgb2YgcG9pbnRzIG9uIGEgdGltZXNjYWxlIHdpdGggc2Vjb25kcyBhcyB0aGUgdW5pdCBvZiB0aW1lLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEx1aXNhIFZhcmdhc1xyXG4gKi9cclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBidWlsZEFOdWNsZXVzIGZyb20gJy4uLy4uL2J1aWxkQU51Y2xldXMuanMnO1xyXG5pbXBvcnQgQnVpbGRBTnVjbGV1c1N0cmluZ3MgZnJvbSAnLi4vLi4vQnVpbGRBTnVjbGV1c1N0cmluZ3MuanMnO1xyXG5cclxuY29uc3QgU0VDT05EU19JTl9BX1lFQVIgPSAzNjUgKiAyNCAqIDYwICogNjA7IC8vIDM2NSBkYXlzIHggMjQgaHJzL2RheSB4IDYwIG1pbi9ociB4IDYwIHNlYy9taW5cclxuY29uc3QgVElNRV9GT1JfTElHSFRfVE9fQ1JPU1NfQU5fQVRPTSA9IE1hdGgucG93KCAxMCwgLTE5ICk7XHJcblxyXG5jbGFzcyBCQU5UaW1lc2NhbGVQb2ludHMgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlIHtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBUSU1FX0ZPUl9MSUdIVF9UT19DUk9TU19BX05VQ0xFVVMgPSBuZXcgQkFOVGltZXNjYWxlUG9pbnRzKFxyXG4gICAgQnVpbGRBTnVjbGV1c1N0cmluZ3MuQSArIEJ1aWxkQU51Y2xldXNTdHJpbmdzLnRpbWVGb3JMaWdodFRvQ3Jvc3NBTnVjbGV1cywgTWF0aC5wb3coIDEwLCAtMjMgKSApO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFRJTUVfRk9SX0xJR0hUX1RPX0NST1NTX0FOX0FUT00gPSBuZXcgQkFOVGltZXNjYWxlUG9pbnRzKFxyXG4gICAgQnVpbGRBTnVjbGV1c1N0cmluZ3MuQiArIEJ1aWxkQU51Y2xldXNTdHJpbmdzLnRpbWVGb3JMaWdodFRvQ3Jvc3NBbkF0b20sIFRJTUVfRk9SX0xJR0hUX1RPX0NST1NTX0FOX0FUT00gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBUSU1FX0ZPUl9MSUdIVF9UT19DUk9TU19PTkVfVEhPVVNBTkRfQVRPTVMgPSBuZXcgQkFOVGltZXNjYWxlUG9pbnRzKFxyXG4gICAgQnVpbGRBTnVjbGV1c1N0cmluZ3MuQyArIEJ1aWxkQU51Y2xldXNTdHJpbmdzLnRpbWVGb3JMaWdodFRvQ3Jvc3NPbmVUaG91c2FuZEF0b21zLFxyXG4gICAgVElNRV9GT1JfTElHSFRfVE9fQ1JPU1NfQU5fQVRPTSAqIDEwMDAgKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBUSU1FX0ZPUl9TT1VORF9UT19UUkFWRUxfT05FX01JTExJTUVURVIgPSBuZXcgQkFOVGltZXNjYWxlUG9pbnRzKFxyXG4gICAgQnVpbGRBTnVjbGV1c1N0cmluZ3MuRCArIEJ1aWxkQU51Y2xldXNTdHJpbmdzLnRpbWVGb3JTb3VuZFRvVHJhdmVsT25lTWlsbGltZXRlciwgMmUtNiApO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEFfQkxJTktfT0ZfQU5fRVlFID0gbmV3IEJBTlRpbWVzY2FsZVBvaW50cyhcclxuICAgIEJ1aWxkQU51Y2xldXNTdHJpbmdzLkUgKyBCdWlsZEFOdWNsZXVzU3RyaW5ncy5hQmxpbmtPZkFuRXllLCAxIC8gMyApO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE9ORV9NSU5VVEUgPSBuZXcgQkFOVGltZXNjYWxlUG9pbnRzKFxyXG4gICAgQnVpbGRBTnVjbGV1c1N0cmluZ3MuRiArIEJ1aWxkQU51Y2xldXNTdHJpbmdzLm9uZU1pbnV0ZSwgNjAgKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBPTkVfWUVBUiA9IG5ldyBCQU5UaW1lc2NhbGVQb2ludHMoXHJcbiAgICBCdWlsZEFOdWNsZXVzU3RyaW5ncy5HICsgQnVpbGRBTnVjbGV1c1N0cmluZ3Mub25lWWVhciwgU0VDT05EU19JTl9BX1lFQVIgKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBBVkVSQUdFX0hVTUFOX0xJRkVTUEFOID0gbmV3IEJBTlRpbWVzY2FsZVBvaW50cyhcclxuICAgIEJ1aWxkQU51Y2xldXNTdHJpbmdzLkggKyBCdWlsZEFOdWNsZXVzU3RyaW5ncy5hdmVyYWdlSHVtYW5MaWZlc3BhbiwgNzIuNiAqIFNFQ09ORFNfSU5fQV9ZRUFSICk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQUdFX09GX1RIRV9VTklWRVJTRSA9IG5ldyBCQU5UaW1lc2NhbGVQb2ludHMoXHJcbiAgICBCdWlsZEFOdWNsZXVzU3RyaW5ncy5JICsgQnVpbGRBTnVjbGV1c1N0cmluZ3MuYWdlT2ZUaGVVbml2ZXJzZSwgMTMuNzdlOSAqIFNFQ09ORFNfSU5fQV9ZRUFSICk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTElGRVRJTUVfT0ZfTE9OR0VTVF9MSVZFRF9TVEFSUyA9IG5ldyBCQU5UaW1lc2NhbGVQb2ludHMoXHJcbiAgICBCdWlsZEFOdWNsZXVzU3RyaW5ncy5KICsgQnVpbGRBTnVjbGV1c1N0cmluZ3MubGlmZXRpbWVPZkxvbmdlc3RMaXZlZFN0YXJzLCA0NTBlMTggKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBlbnVtZXJhdGlvbiA9IG5ldyBFbnVtZXJhdGlvbiggQkFOVGltZXNjYWxlUG9pbnRzICk7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSB0aW1lc2NhbGVJdGVtOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IG51bWJlck9mU2Vjb25kczogbnVtYmVyO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRpbWVzY2FsZUl0ZW06IHN0cmluZywgbnVtYmVyT2ZTZWNvbmRzOiBudW1iZXIgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIHRoaXMudGltZXNjYWxlSXRlbSA9IHRpbWVzY2FsZUl0ZW07XHJcbiAgICB0aGlzLm51bWJlck9mU2Vjb25kcyA9IG51bWJlck9mU2Vjb25kcztcclxuICB9XHJcbn1cclxuXHJcbmJ1aWxkQU51Y2xldXMucmVnaXN0ZXIoICdCQU5UaW1lc2NhbGVQb2ludHMnLCBCQU5UaW1lc2NhbGVQb2ludHMgKTtcclxuZXhwb3J0IGRlZmF1bHQgQkFOVGltZXNjYWxlUG9pbnRzO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZ0JBQWdCLE1BQU0sOENBQThDO0FBQzNFLE9BQU9DLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFFaEUsTUFBTUMsaUJBQWlCLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDOUMsTUFBTUMsK0JBQStCLEdBQUdDLElBQUksQ0FBQ0MsR0FBRyxDQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUcsQ0FBQztBQUUzRCxNQUFNQyxrQkFBa0IsU0FBU1IsZ0JBQWdCLENBQUM7RUFFaEQsT0FBdUJTLGlDQUFpQyxHQUFHLElBQUlELGtCQUFrQixDQUMvRUwsb0JBQW9CLENBQUNPLENBQUMsR0FBR1Asb0JBQW9CLENBQUNRLDJCQUEyQixFQUFFTCxJQUFJLENBQUNDLEdBQUcsQ0FBRSxFQUFFLEVBQUUsQ0FBQyxFQUFHLENBQUUsQ0FBQztFQUVsRyxPQUF1QkYsK0JBQStCLEdBQUcsSUFBSUcsa0JBQWtCLENBQzdFTCxvQkFBb0IsQ0FBQ1MsQ0FBQyxHQUFHVCxvQkFBb0IsQ0FBQ1UseUJBQXlCLEVBQUVSLCtCQUFnQyxDQUFDO0VBRTVHLE9BQXVCUywwQ0FBMEMsR0FBRyxJQUFJTixrQkFBa0IsQ0FDeEZMLG9CQUFvQixDQUFDWSxDQUFDLEdBQUdaLG9CQUFvQixDQUFDYSxtQ0FBbUMsRUFDakZYLCtCQUErQixHQUFHLElBQUssQ0FBQztFQUUxQyxPQUF1QlksdUNBQXVDLEdBQUcsSUFBSVQsa0JBQWtCLENBQ3JGTCxvQkFBb0IsQ0FBQ2UsQ0FBQyxHQUFHZixvQkFBb0IsQ0FBQ2dCLGlDQUFpQyxFQUFFLElBQUssQ0FBQztFQUV6RixPQUF1QkMsaUJBQWlCLEdBQUcsSUFBSVosa0JBQWtCLENBQy9ETCxvQkFBb0IsQ0FBQ2tCLENBQUMsR0FBR2xCLG9CQUFvQixDQUFDbUIsYUFBYSxFQUFFLENBQUMsR0FBRyxDQUFFLENBQUM7RUFFdEUsT0FBdUJDLFVBQVUsR0FBRyxJQUFJZixrQkFBa0IsQ0FDeERMLG9CQUFvQixDQUFDcUIsQ0FBQyxHQUFHckIsb0JBQW9CLENBQUNzQixTQUFTLEVBQUUsRUFBRyxDQUFDO0VBRS9ELE9BQXVCQyxRQUFRLEdBQUcsSUFBSWxCLGtCQUFrQixDQUN0REwsb0JBQW9CLENBQUN3QixDQUFDLEdBQUd4QixvQkFBb0IsQ0FBQ3lCLE9BQU8sRUFBRXhCLGlCQUFrQixDQUFDO0VBRTVFLE9BQXVCeUIsc0JBQXNCLEdBQUcsSUFBSXJCLGtCQUFrQixDQUNwRUwsb0JBQW9CLENBQUMyQixDQUFDLEdBQUczQixvQkFBb0IsQ0FBQzRCLG9CQUFvQixFQUFFLElBQUksR0FBRzNCLGlCQUFrQixDQUFDO0VBRWhHLE9BQXVCNEIsbUJBQW1CLEdBQUcsSUFBSXhCLGtCQUFrQixDQUNqRUwsb0JBQW9CLENBQUM4QixDQUFDLEdBQUc5QixvQkFBb0IsQ0FBQytCLGdCQUFnQixFQUFFLE9BQU8sR0FBRzlCLGlCQUFrQixDQUFDO0VBRS9GLE9BQXVCK0IsK0JBQStCLEdBQUcsSUFBSTNCLGtCQUFrQixDQUM3RUwsb0JBQW9CLENBQUNpQyxDQUFDLEdBQUdqQyxvQkFBb0IsQ0FBQ2tDLDJCQUEyQixFQUFFLE1BQU8sQ0FBQztFQUVyRixPQUF1QkMsV0FBVyxHQUFHLElBQUlyQyxXQUFXLENBQUVPLGtCQUFtQixDQUFDO0VBS25FK0IsV0FBV0EsQ0FBRUMsYUFBcUIsRUFBRUMsZUFBdUIsRUFBRztJQUNuRSxLQUFLLENBQUMsQ0FBQztJQUVQLElBQUksQ0FBQ0QsYUFBYSxHQUFHQSxhQUFhO0lBQ2xDLElBQUksQ0FBQ0MsZUFBZSxHQUFHQSxlQUFlO0VBQ3hDO0FBQ0Y7QUFFQXZDLGFBQWEsQ0FBQ3dDLFFBQVEsQ0FBRSxvQkFBb0IsRUFBRWxDLGtCQUFtQixDQUFDO0FBQ2xFLGVBQWVBLGtCQUFrQiJ9