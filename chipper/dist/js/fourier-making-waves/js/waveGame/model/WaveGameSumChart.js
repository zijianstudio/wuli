// Copyright 2021-2023, University of Colorado Boulder

/**
 * WaveGameSumChart is the model for the 'Sum' chart in the 'Wave Game' screen. Computing the sum for the
 * challenge answer is delegated to SumChartNode, which is capable of summing one Fourier series.
 * This class is responsible for summing the challenge guess, the amplitudes entered by the user.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import SumChart from '../../common/model/SumChart.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
export default class WaveGameSumChart extends SumChart {
  // Data set that displays the waveform for the user's guess. Points are ordered by increasing x value.

  constructor(answerSeries, guessSeries, domain, seriesType, t, xAxisDescription, tandem) {
    super(
    // Superclass will render the sum for the challenge answer.
    answerSeries,
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
    this.guessSeries = guessSeries;

    // {Property.<Vector2[]>}
    const createGuessDataSet = () => guessSeries.createSumDataSet(xAxisDescription, domain, seriesType, t);
    this.guessDataSetProperty = new Property(createGuessDataSet(), {
      isValidValue: array => Array.isArray(array) && _.every(array, element => element instanceof Vector2)
    });

    // When the guess amplitudes change, update the corresponding data set for the sum.
    guessSeries.amplitudesProperty.lazyLink(() => {
      this.guessDataSetProperty.value = createGuessDataSet();
    });
  }
}
fourierMakingWaves.register('WaveGameSumChart', WaveGameSumChart);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblByb3BlcnR5IiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJTdW1DaGFydCIsImZvdXJpZXJNYWtpbmdXYXZlcyIsIldhdmVHYW1lU3VtQ2hhcnQiLCJjb25zdHJ1Y3RvciIsImFuc3dlclNlcmllcyIsImd1ZXNzU2VyaWVzIiwiZG9tYWluIiwic2VyaWVzVHlwZSIsInQiLCJ4QXhpc0Rlc2NyaXB0aW9uIiwidGFuZGVtIiwidmFsaWRWYWx1ZXMiLCJjcmVhdGVHdWVzc0RhdGFTZXQiLCJjcmVhdGVTdW1EYXRhU2V0IiwiZ3Vlc3NEYXRhU2V0UHJvcGVydHkiLCJpc1ZhbGlkVmFsdWUiLCJhcnJheSIsIkFycmF5IiwiaXNBcnJheSIsIl8iLCJldmVyeSIsImVsZW1lbnQiLCJhbXBsaXR1ZGVzUHJvcGVydHkiLCJsYXp5TGluayIsInZhbHVlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJXYXZlR2FtZVN1bUNoYXJ0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFdhdmVHYW1lU3VtQ2hhcnQgaXMgdGhlIG1vZGVsIGZvciB0aGUgJ1N1bScgY2hhcnQgaW4gdGhlICdXYXZlIEdhbWUnIHNjcmVlbi4gQ29tcHV0aW5nIHRoZSBzdW0gZm9yIHRoZVxyXG4gKiBjaGFsbGVuZ2UgYW5zd2VyIGlzIGRlbGVnYXRlZCB0byBTdW1DaGFydE5vZGUsIHdoaWNoIGlzIGNhcGFibGUgb2Ygc3VtbWluZyBvbmUgRm91cmllciBzZXJpZXMuXHJcbiAqIFRoaXMgY2xhc3MgaXMgcmVzcG9uc2libGUgZm9yIHN1bW1pbmcgdGhlIGNoYWxsZW5nZSBndWVzcywgdGhlIGFtcGxpdHVkZXMgZW50ZXJlZCBieSB0aGUgdXNlci5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQXhpc0Rlc2NyaXB0aW9uIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9BeGlzRGVzY3JpcHRpb24uanMnO1xyXG5pbXBvcnQgU3VtQ2hhcnQgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1N1bUNoYXJ0LmpzJztcclxuaW1wb3J0IGZvdXJpZXJNYWtpbmdXYXZlcyBmcm9tICcuLi8uLi9mb3VyaWVyTWFraW5nV2F2ZXMuanMnO1xyXG5pbXBvcnQgRG9tYWluIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Eb21haW4uanMnO1xyXG5pbXBvcnQgU2VyaWVzVHlwZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvU2VyaWVzVHlwZS5qcyc7XHJcbmltcG9ydCBGb3VyaWVyU2VyaWVzIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Gb3VyaWVyU2VyaWVzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdhdmVHYW1lU3VtQ2hhcnQgZXh0ZW5kcyBTdW1DaGFydCB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBndWVzc1NlcmllczogRm91cmllclNlcmllcztcclxuXHJcbiAgLy8gRGF0YSBzZXQgdGhhdCBkaXNwbGF5cyB0aGUgd2F2ZWZvcm0gZm9yIHRoZSB1c2VyJ3MgZ3Vlc3MuIFBvaW50cyBhcmUgb3JkZXJlZCBieSBpbmNyZWFzaW5nIHggdmFsdWUuXHJcbiAgcHVibGljIHJlYWRvbmx5IGd1ZXNzRGF0YVNldFByb3BlcnR5OiBQcm9wZXJ0eTxWZWN0b3IyW10+O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGFuc3dlclNlcmllczogRm91cmllclNlcmllcywgZ3Vlc3NTZXJpZXM6IEZvdXJpZXJTZXJpZXMsIGRvbWFpbjogRG9tYWluLCBzZXJpZXNUeXBlOiBTZXJpZXNUeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgdDogbnVtYmVyLCB4QXhpc0Rlc2NyaXB0aW9uOiBBeGlzRGVzY3JpcHRpb24sIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIHN1cGVyKFxyXG4gICAgICAvLyBTdXBlcmNsYXNzIHdpbGwgcmVuZGVyIHRoZSBzdW0gZm9yIHRoZSBjaGFsbGVuZ2UgYW5zd2VyLlxyXG4gICAgICBhbnN3ZXJTZXJpZXMsXHJcblxyXG4gICAgICAvLyBUaGVzZSBhc3BlY3RzIGFyZSBjb25zdGFudCBpbiB0aGUgV2F2ZSBHYW1lIHNjcmVlbiwgYnV0IHRoZSBzdXBlcmNsYXNzIHN1cHBvcnRzIGR5bmFtaWMgUHJvcGVydGllcy5cclxuICAgICAgLy8gV2UgdXNlIHZhbGlkVmFsdWVzIHRvIGNvbnN0cmFpbiB0aGVzZSBQcm9wZXJ0aWVzIHRvIGEgc2luZ2xlIHZhbHVlLCBlZmZlY3RpdmVseSBtYWtpbmcgdGhlbSBjb25zdGFudHMuXHJcbiAgICAgIG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBkb21haW4sIHsgdmFsaWRWYWx1ZXM6IFsgZG9tYWluIF0gfSApLFxyXG4gICAgICBuZXcgRW51bWVyYXRpb25Qcm9wZXJ0eSggc2VyaWVzVHlwZSwgeyB2YWxpZFZhbHVlczogWyBzZXJpZXNUeXBlIF0gfSApLFxyXG4gICAgICBuZXcgTnVtYmVyUHJvcGVydHkoIHQsIHsgdmFsaWRWYWx1ZXM6IFsgdCBdIH0gKSxcclxuICAgICAgbmV3IFByb3BlcnR5KCB4QXhpc0Rlc2NyaXB0aW9uLCB7IHZhbGlkVmFsdWVzOiBbIHhBeGlzRGVzY3JpcHRpb24gXSB9ICksXHJcbiAgICAgIHRhbmRlbVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmd1ZXNzU2VyaWVzID0gZ3Vlc3NTZXJpZXM7XHJcblxyXG4gICAgLy8ge1Byb3BlcnR5LjxWZWN0b3IyW10+fVxyXG4gICAgY29uc3QgY3JlYXRlR3Vlc3NEYXRhU2V0ID0gKCkgPT4gZ3Vlc3NTZXJpZXMuY3JlYXRlU3VtRGF0YVNldCggeEF4aXNEZXNjcmlwdGlvbiwgZG9tYWluLCBzZXJpZXNUeXBlLCB0ICk7XHJcblxyXG4gICAgdGhpcy5ndWVzc0RhdGFTZXRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggY3JlYXRlR3Vlc3NEYXRhU2V0KCksIHtcclxuICAgICAgaXNWYWxpZFZhbHVlOiBhcnJheSA9PiBBcnJheS5pc0FycmF5KCBhcnJheSApICYmIF8uZXZlcnkoIGFycmF5LCBlbGVtZW50ID0+IGVsZW1lbnQgaW5zdGFuY2VvZiBWZWN0b3IyIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSBndWVzcyBhbXBsaXR1ZGVzIGNoYW5nZSwgdXBkYXRlIHRoZSBjb3JyZXNwb25kaW5nIGRhdGEgc2V0IGZvciB0aGUgc3VtLlxyXG4gICAgZ3Vlc3NTZXJpZXMuYW1wbGl0dWRlc1Byb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuZ3Vlc3NEYXRhU2V0UHJvcGVydHkudmFsdWUgPSBjcmVhdGVHdWVzc0RhdGFTZXQoKTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmZvdXJpZXJNYWtpbmdXYXZlcy5yZWdpc3RlciggJ1dhdmVHYW1lU3VtQ2hhcnQnLCBXYXZlR2FtZVN1bUNoYXJ0ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxtQkFBbUIsTUFBTSw0Q0FBNEM7QUFDNUUsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFHbkQsT0FBT0MsUUFBUSxNQUFNLGdDQUFnQztBQUNyRCxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFLNUQsZUFBZSxNQUFNQyxnQkFBZ0IsU0FBU0YsUUFBUSxDQUFDO0VBSXJEOztFQUdPRyxXQUFXQSxDQUFFQyxZQUEyQixFQUFFQyxXQUEwQixFQUFFQyxNQUFjLEVBQUVDLFVBQXNCLEVBQy9GQyxDQUFTLEVBQUVDLGdCQUFpQyxFQUFFQyxNQUFjLEVBQUc7SUFFakYsS0FBSztJQUNIO0lBQ0FOLFlBQVk7SUFFWjtJQUNBO0lBQ0EsSUFBSVIsbUJBQW1CLENBQUVVLE1BQU0sRUFBRTtNQUFFSyxXQUFXLEVBQUUsQ0FBRUwsTUFBTTtJQUFHLENBQUUsQ0FBQyxFQUM5RCxJQUFJVixtQkFBbUIsQ0FBRVcsVUFBVSxFQUFFO01BQUVJLFdBQVcsRUFBRSxDQUFFSixVQUFVO0lBQUcsQ0FBRSxDQUFDLEVBQ3RFLElBQUlWLGNBQWMsQ0FBRVcsQ0FBQyxFQUFFO01BQUVHLFdBQVcsRUFBRSxDQUFFSCxDQUFDO0lBQUcsQ0FBRSxDQUFDLEVBQy9DLElBQUlWLFFBQVEsQ0FBRVcsZ0JBQWdCLEVBQUU7TUFBRUUsV0FBVyxFQUFFLENBQUVGLGdCQUFnQjtJQUFHLENBQUUsQ0FBQyxFQUN2RUMsTUFDRixDQUFDO0lBRUQsSUFBSSxDQUFDTCxXQUFXLEdBQUdBLFdBQVc7O0lBRTlCO0lBQ0EsTUFBTU8sa0JBQWtCLEdBQUdBLENBQUEsS0FBTVAsV0FBVyxDQUFDUSxnQkFBZ0IsQ0FBRUosZ0JBQWdCLEVBQUVILE1BQU0sRUFBRUMsVUFBVSxFQUFFQyxDQUFFLENBQUM7SUFFeEcsSUFBSSxDQUFDTSxvQkFBb0IsR0FBRyxJQUFJaEIsUUFBUSxDQUFFYyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUU7TUFDOURHLFlBQVksRUFBRUMsS0FBSyxJQUFJQyxLQUFLLENBQUNDLE9BQU8sQ0FBRUYsS0FBTSxDQUFDLElBQUlHLENBQUMsQ0FBQ0MsS0FBSyxDQUFFSixLQUFLLEVBQUVLLE9BQU8sSUFBSUEsT0FBTyxZQUFZdEIsT0FBUTtJQUN6RyxDQUFFLENBQUM7O0lBRUg7SUFDQU0sV0FBVyxDQUFDaUIsa0JBQWtCLENBQUNDLFFBQVEsQ0FBRSxNQUFNO01BQzdDLElBQUksQ0FBQ1Qsb0JBQW9CLENBQUNVLEtBQUssR0FBR1osa0JBQWtCLENBQUMsQ0FBQztJQUN4RCxDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUFYLGtCQUFrQixDQUFDd0IsUUFBUSxDQUFFLGtCQUFrQixFQUFFdkIsZ0JBQWlCLENBQUMifQ==