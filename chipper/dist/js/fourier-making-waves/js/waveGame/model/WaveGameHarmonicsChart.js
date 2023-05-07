// Copyright 2021-2023, University of Colorado Boulder

/**
 * WaveGameHarmonicsChart is the model for the 'Harmonics' chart in the 'Wave Game' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import HarmonicsChart from '../../common/model/HarmonicsChart.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
export default class WaveGameHarmonicsChart extends HarmonicsChart {
  constructor(guessSeries, emphasizedHarmonics, domain, seriesType, t, xAxisDescription, yAxisDescription, tandem) {
    super(guessSeries, emphasizedHarmonics,
    // These aspects are constant in the Wave Game screen, but the superclass supports dynamic Properties.
    // We use validValues to constrain these Properties to a single value, effectively making them constants.
    new EnumerationProperty(domain, {
      validValues: [domain]
    }), new EnumerationProperty(seriesType, {
      validValues: [seriesType]
    }), new NumberProperty(t, {
      validValues: [t]
    }), new Property(xAxisDescription, {
      validValues: [xAxisDescription]
    }), tandem);
  }
}
fourierMakingWaves.register('WaveGameHarmonicsChart', WaveGameHarmonicsChart);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblByb3BlcnR5IiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkhhcm1vbmljc0NoYXJ0IiwiZm91cmllck1ha2luZ1dhdmVzIiwiV2F2ZUdhbWVIYXJtb25pY3NDaGFydCIsImNvbnN0cnVjdG9yIiwiZ3Vlc3NTZXJpZXMiLCJlbXBoYXNpemVkSGFybW9uaWNzIiwiZG9tYWluIiwic2VyaWVzVHlwZSIsInQiLCJ4QXhpc0Rlc2NyaXB0aW9uIiwieUF4aXNEZXNjcmlwdGlvbiIsInRhbmRlbSIsInZhbGlkVmFsdWVzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJXYXZlR2FtZUhhcm1vbmljc0NoYXJ0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFdhdmVHYW1lSGFybW9uaWNzQ2hhcnQgaXMgdGhlIG1vZGVsIGZvciB0aGUgJ0hhcm1vbmljcycgY2hhcnQgaW4gdGhlICdXYXZlIEdhbWUnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEF4aXNEZXNjcmlwdGlvbiBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQXhpc0Rlc2NyaXB0aW9uLmpzJztcclxuaW1wb3J0IEhhcm1vbmljc0NoYXJ0IGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9IYXJtb25pY3NDaGFydC5qcyc7XHJcbmltcG9ydCBmb3VyaWVyTWFraW5nV2F2ZXMgZnJvbSAnLi4vLi4vZm91cmllck1ha2luZ1dhdmVzLmpzJztcclxuaW1wb3J0IEZvdXJpZXJTZXJpZXMgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0ZvdXJpZXJTZXJpZXMuanMnO1xyXG5pbXBvcnQgRW1waGFzaXplZEhhcm1vbmljcyBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRW1waGFzaXplZEhhcm1vbmljcy5qcyc7XHJcbmltcG9ydCBTZXJpZXNUeXBlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9TZXJpZXNUeXBlLmpzJztcclxuaW1wb3J0IERvbWFpbiBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRG9tYWluLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdhdmVHYW1lSGFybW9uaWNzQ2hhcnQgZXh0ZW5kcyBIYXJtb25pY3NDaGFydCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZ3Vlc3NTZXJpZXM6IEZvdXJpZXJTZXJpZXMsIGVtcGhhc2l6ZWRIYXJtb25pY3M6IEVtcGhhc2l6ZWRIYXJtb25pY3MsIGRvbWFpbjogRG9tYWluLFxyXG4gICAgICAgICAgICAgICAgICAgICAgc2VyaWVzVHlwZTogU2VyaWVzVHlwZSwgdDogbnVtYmVyLCB4QXhpc0Rlc2NyaXB0aW9uOiBBeGlzRGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICB5QXhpc0Rlc2NyaXB0aW9uOiBBeGlzRGVzY3JpcHRpb24sIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIHN1cGVyKFxyXG4gICAgICBndWVzc1NlcmllcyxcclxuICAgICAgZW1waGFzaXplZEhhcm1vbmljcyxcclxuXHJcbiAgICAgIC8vIFRoZXNlIGFzcGVjdHMgYXJlIGNvbnN0YW50IGluIHRoZSBXYXZlIEdhbWUgc2NyZWVuLCBidXQgdGhlIHN1cGVyY2xhc3Mgc3VwcG9ydHMgZHluYW1pYyBQcm9wZXJ0aWVzLlxyXG4gICAgICAvLyBXZSB1c2UgdmFsaWRWYWx1ZXMgdG8gY29uc3RyYWluIHRoZXNlIFByb3BlcnRpZXMgdG8gYSBzaW5nbGUgdmFsdWUsIGVmZmVjdGl2ZWx5IG1ha2luZyB0aGVtIGNvbnN0YW50cy5cclxuICAgICAgbmV3IEVudW1lcmF0aW9uUHJvcGVydHkoIGRvbWFpbiwgeyB2YWxpZFZhbHVlczogWyBkb21haW4gXSB9ICksXHJcbiAgICAgIG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBzZXJpZXNUeXBlLCB7IHZhbGlkVmFsdWVzOiBbIHNlcmllc1R5cGUgXSB9ICksXHJcbiAgICAgIG5ldyBOdW1iZXJQcm9wZXJ0eSggdCwgeyB2YWxpZFZhbHVlczogWyB0IF0gfSApLFxyXG4gICAgICBuZXcgUHJvcGVydHkoIHhBeGlzRGVzY3JpcHRpb24sIHsgdmFsaWRWYWx1ZXM6IFsgeEF4aXNEZXNjcmlwdGlvbiBdIH0gKSxcclxuICAgICAgdGFuZGVtXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuZm91cmllck1ha2luZ1dhdmVzLnJlZ2lzdGVyKCAnV2F2ZUdhbWVIYXJtb25pY3NDaGFydCcsIFdhdmVHYW1lSGFybW9uaWNzQ2hhcnQgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsbUJBQW1CLE1BQU0sNENBQTRDO0FBQzVFLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUd0RCxPQUFPQyxjQUFjLE1BQU0sc0NBQXNDO0FBQ2pFLE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQU01RCxlQUFlLE1BQU1DLHNCQUFzQixTQUFTRixjQUFjLENBQUM7RUFFMURHLFdBQVdBLENBQUVDLFdBQTBCLEVBQUVDLG1CQUF3QyxFQUFFQyxNQUFjLEVBQ3BGQyxVQUFzQixFQUFFQyxDQUFTLEVBQUVDLGdCQUFpQyxFQUNwRUMsZ0JBQWlDLEVBQUVDLE1BQWMsRUFBRztJQUV0RSxLQUFLLENBQ0hQLFdBQVcsRUFDWEMsbUJBQW1CO0lBRW5CO0lBQ0E7SUFDQSxJQUFJUixtQkFBbUIsQ0FBRVMsTUFBTSxFQUFFO01BQUVNLFdBQVcsRUFBRSxDQUFFTixNQUFNO0lBQUcsQ0FBRSxDQUFDLEVBQzlELElBQUlULG1CQUFtQixDQUFFVSxVQUFVLEVBQUU7TUFBRUssV0FBVyxFQUFFLENBQUVMLFVBQVU7SUFBRyxDQUFFLENBQUMsRUFDdEUsSUFBSVQsY0FBYyxDQUFFVSxDQUFDLEVBQUU7TUFBRUksV0FBVyxFQUFFLENBQUVKLENBQUM7SUFBRyxDQUFFLENBQUMsRUFDL0MsSUFBSVQsUUFBUSxDQUFFVSxnQkFBZ0IsRUFBRTtNQUFFRyxXQUFXLEVBQUUsQ0FBRUgsZ0JBQWdCO0lBQUcsQ0FBRSxDQUFDLEVBQ3ZFRSxNQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFWLGtCQUFrQixDQUFDWSxRQUFRLENBQUUsd0JBQXdCLEVBQUVYLHNCQUF1QixDQUFDIn0=