// Copyright 2020-2023, University of Colorado Boulder

/**
 * WaveGameModel is the top-level model for the 'Wave Game' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.
 */

import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import FMWConstants from '../../common/FMWConstants.js';
import FMWQueryParameters from '../../common/FMWQueryParameters.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import FourierMakingWavesStrings from '../../FourierMakingWavesStrings.js';
import WaveGameLevel from './WaveGameLevel.js';
export default class WaveGameModel {
  // reaching this number of points results in a reward

  // game levels, ordered by increasing level number

  // the selected game level. null means 'no selection' and causes the view to return to the level-selection UI.

  constructor(tandem) {
    this.rewardScore = FMWQueryParameters.rewardScore;

    // There's some duplication of level number constants here. But the specification for levels changed SO many times,
    // that this brute force initialization ended up being easier to change and maintain.  So I'm willing to make a
    // trade-off here, sacrificing some duplication for a more straightforward implementation.
    this.levels = [
    // Level 1
    new WaveGameLevel(1, {
      defaultNumberOfAmplitudeControls: 2,
      statusBarMessageProperty: FourierMakingWavesStrings.matchUsing1HarmonicStringProperty,
      infoDialogDescriptionProperty: FourierMakingWavesStrings.info1HarmonicStringProperty,
      tandem: tandem.createTandem('level1')
    }),
    // Level 2
    new WaveGameLevel(2, {
      defaultNumberOfAmplitudeControls: 3,
      tandem: tandem.createTandem('level2')
    }),
    // Level 3
    new WaveGameLevel(3, {
      defaultNumberOfAmplitudeControls: 5,
      tandem: tandem.createTandem('level3')
    }),
    // Level 4
    new WaveGameLevel(4, {
      defaultNumberOfAmplitudeControls: 6,
      tandem: tandem.createTandem('level4')
    }),
    // Level 5
    new WaveGameLevel(5, {
      getNumberOfNonZeroHarmonics: () => dotRandom.nextIntBetween(5, FMWConstants.MAX_HARMONICS),
      defaultNumberOfAmplitudeControls: FMWConstants.MAX_HARMONICS,
      statusBarMessageProperty: new PatternStringProperty(FourierMakingWavesStrings.matchUsingNOrMoreHarmonicsStringProperty, {
        levelNumber: 5,
        numberOfHarmonics: 5
      }),
      infoDialogDescriptionProperty: new PatternStringProperty(FourierMakingWavesStrings.infoNOrMoreHarmonicsStringProperty, {
        levelNumber: 5,
        numberOfHarmonics: 5
      }),
      tandem: tandem.createTandem('level5')
    })];
    assert && assert(this.levels.length === FMWConstants.NUMBER_OF_GAME_LEVELS);
    this.levelProperty = new Property(null, {
      validValues: [null, ...this.levels],
      phetioValueType: NullableIO(WaveGameLevel.WaveGameLevelIO),
      tandem: tandem.createTandem('levelProperty'),
      phetioDocumentation: 'The level currently selected in the Wave Game, null if no level is selected.'
    });
  }
  reset() {
    this.levels.forEach(level => level.reset());
    this.levelProperty.reset();
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
}
fourierMakingWaves.register('WaveGameModel', WaveGameModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIk51bGxhYmxlSU8iLCJGTVdDb25zdGFudHMiLCJGTVdRdWVyeVBhcmFtZXRlcnMiLCJmb3VyaWVyTWFraW5nV2F2ZXMiLCJGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzIiwiV2F2ZUdhbWVMZXZlbCIsIldhdmVHYW1lTW9kZWwiLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsInJld2FyZFNjb3JlIiwibGV2ZWxzIiwiZGVmYXVsdE51bWJlck9mQW1wbGl0dWRlQ29udHJvbHMiLCJzdGF0dXNCYXJNZXNzYWdlUHJvcGVydHkiLCJtYXRjaFVzaW5nMUhhcm1vbmljU3RyaW5nUHJvcGVydHkiLCJpbmZvRGlhbG9nRGVzY3JpcHRpb25Qcm9wZXJ0eSIsImluZm8xSGFybW9uaWNTdHJpbmdQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsImdldE51bWJlck9mTm9uWmVyb0hhcm1vbmljcyIsIm5leHRJbnRCZXR3ZWVuIiwiTUFYX0hBUk1PTklDUyIsIm1hdGNoVXNpbmdOT3JNb3JlSGFybW9uaWNzU3RyaW5nUHJvcGVydHkiLCJsZXZlbE51bWJlciIsIm51bWJlck9mSGFybW9uaWNzIiwiaW5mb05Pck1vcmVIYXJtb25pY3NTdHJpbmdQcm9wZXJ0eSIsImFzc2VydCIsImxlbmd0aCIsIk5VTUJFUl9PRl9HQU1FX0xFVkVMUyIsImxldmVsUHJvcGVydHkiLCJ2YWxpZFZhbHVlcyIsInBoZXRpb1ZhbHVlVHlwZSIsIldhdmVHYW1lTGV2ZWxJTyIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJyZXNldCIsImZvckVhY2giLCJsZXZlbCIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIldhdmVHYW1lTW9kZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogV2F2ZUdhbWVNb2RlbCBpcyB0aGUgdG9wLWxldmVsIG1vZGVsIGZvciB0aGUgJ1dhdmUgR2FtZScgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuXHJcbiAqL1xyXG5cclxuaW1wb3J0IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1BhdHRlcm5TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFRNb2RlbCBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9UTW9kZWwuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgTnVsbGFibGVJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVsbGFibGVJTy5qcyc7XHJcbmltcG9ydCBGTVdDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0ZNV0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBGTVdRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vLi4vY29tbW9uL0ZNV1F1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBmb3VyaWVyTWFraW5nV2F2ZXMgZnJvbSAnLi4vLi4vZm91cmllck1ha2luZ1dhdmVzLmpzJztcclxuaW1wb3J0IEZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MgZnJvbSAnLi4vLi4vRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBXYXZlR2FtZUxldmVsIGZyb20gJy4vV2F2ZUdhbWVMZXZlbC5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXYXZlR2FtZU1vZGVsIGltcGxlbWVudHMgVE1vZGVsIHtcclxuXHJcbiAgLy8gcmVhY2hpbmcgdGhpcyBudW1iZXIgb2YgcG9pbnRzIHJlc3VsdHMgaW4gYSByZXdhcmRcclxuICBwdWJsaWMgcmVhZG9ubHkgcmV3YXJkU2NvcmU6IG51bWJlcjtcclxuXHJcbiAgLy8gZ2FtZSBsZXZlbHMsIG9yZGVyZWQgYnkgaW5jcmVhc2luZyBsZXZlbCBudW1iZXJcclxuICBwdWJsaWMgcmVhZG9ubHkgbGV2ZWxzOiBXYXZlR2FtZUxldmVsW107XHJcblxyXG4gIC8vIHRoZSBzZWxlY3RlZCBnYW1lIGxldmVsLiBudWxsIG1lYW5zICdubyBzZWxlY3Rpb24nIGFuZCBjYXVzZXMgdGhlIHZpZXcgdG8gcmV0dXJuIHRvIHRoZSBsZXZlbC1zZWxlY3Rpb24gVUkuXHJcbiAgcHVibGljIHJlYWRvbmx5IGxldmVsUHJvcGVydHk6IFByb3BlcnR5PFdhdmVHYW1lTGV2ZWwgfCBudWxsPjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICB0aGlzLnJld2FyZFNjb3JlID0gRk1XUXVlcnlQYXJhbWV0ZXJzLnJld2FyZFNjb3JlO1xyXG5cclxuICAgIC8vIFRoZXJlJ3Mgc29tZSBkdXBsaWNhdGlvbiBvZiBsZXZlbCBudW1iZXIgY29uc3RhbnRzIGhlcmUuIEJ1dCB0aGUgc3BlY2lmaWNhdGlvbiBmb3IgbGV2ZWxzIGNoYW5nZWQgU08gbWFueSB0aW1lcyxcclxuICAgIC8vIHRoYXQgdGhpcyBicnV0ZSBmb3JjZSBpbml0aWFsaXphdGlvbiBlbmRlZCB1cCBiZWluZyBlYXNpZXIgdG8gY2hhbmdlIGFuZCBtYWludGFpbi4gIFNvIEknbSB3aWxsaW5nIHRvIG1ha2UgYVxyXG4gICAgLy8gdHJhZGUtb2ZmIGhlcmUsIHNhY3JpZmljaW5nIHNvbWUgZHVwbGljYXRpb24gZm9yIGEgbW9yZSBzdHJhaWdodGZvcndhcmQgaW1wbGVtZW50YXRpb24uXHJcbiAgICB0aGlzLmxldmVscyA9IFtcclxuXHJcbiAgICAgIC8vIExldmVsIDFcclxuICAgICAgbmV3IFdhdmVHYW1lTGV2ZWwoIDEsIHtcclxuICAgICAgICBkZWZhdWx0TnVtYmVyT2ZBbXBsaXR1ZGVDb250cm9sczogMixcclxuICAgICAgICBzdGF0dXNCYXJNZXNzYWdlUHJvcGVydHk6IEZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MubWF0Y2hVc2luZzFIYXJtb25pY1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgIGluZm9EaWFsb2dEZXNjcmlwdGlvblByb3BlcnR5OiBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLmluZm8xSGFybW9uaWNTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsZXZlbDEnIClcclxuICAgICAgfSApLFxyXG5cclxuICAgICAgLy8gTGV2ZWwgMlxyXG4gICAgICBuZXcgV2F2ZUdhbWVMZXZlbCggMiwge1xyXG4gICAgICAgIGRlZmF1bHROdW1iZXJPZkFtcGxpdHVkZUNvbnRyb2xzOiAzLFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xldmVsMicgKVxyXG4gICAgICB9ICksXHJcblxyXG4gICAgICAvLyBMZXZlbCAzXHJcbiAgICAgIG5ldyBXYXZlR2FtZUxldmVsKCAzLCB7XHJcbiAgICAgICAgZGVmYXVsdE51bWJlck9mQW1wbGl0dWRlQ29udHJvbHM6IDUsXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGV2ZWwzJyApXHJcbiAgICAgIH0gKSxcclxuXHJcbiAgICAgIC8vIExldmVsIDRcclxuICAgICAgbmV3IFdhdmVHYW1lTGV2ZWwoIDQsIHtcclxuICAgICAgICBkZWZhdWx0TnVtYmVyT2ZBbXBsaXR1ZGVDb250cm9sczogNixcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsZXZlbDQnIClcclxuICAgICAgfSApLFxyXG5cclxuICAgICAgLy8gTGV2ZWwgNVxyXG4gICAgICBuZXcgV2F2ZUdhbWVMZXZlbCggNSwge1xyXG4gICAgICAgIGdldE51bWJlck9mTm9uWmVyb0hhcm1vbmljczogKCkgPT4gZG90UmFuZG9tLm5leHRJbnRCZXR3ZWVuKCA1LCBGTVdDb25zdGFudHMuTUFYX0hBUk1PTklDUyApLFxyXG4gICAgICAgIGRlZmF1bHROdW1iZXJPZkFtcGxpdHVkZUNvbnRyb2xzOiBGTVdDb25zdGFudHMuTUFYX0hBUk1PTklDUyxcclxuICAgICAgICBzdGF0dXNCYXJNZXNzYWdlUHJvcGVydHk6IG5ldyBQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIEZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MubWF0Y2hVc2luZ05Pck1vcmVIYXJtb25pY3NTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgbGV2ZWxOdW1iZXI6IDUsXHJcbiAgICAgICAgICBudW1iZXJPZkhhcm1vbmljczogNVxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICBpbmZvRGlhbG9nRGVzY3JpcHRpb25Qcm9wZXJ0eTogbmV3IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5pbmZvTk9yTW9yZUhhcm1vbmljc1N0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgICAgICBsZXZlbE51bWJlcjogNSxcclxuICAgICAgICAgIG51bWJlck9mSGFybW9uaWNzOiA1XHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xldmVsNScgKVxyXG4gICAgICB9IClcclxuICAgIF07XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmxldmVscy5sZW5ndGggPT09IEZNV0NvbnN0YW50cy5OVU1CRVJfT0ZfR0FNRV9MRVZFTFMgKTtcclxuXHJcbiAgICB0aGlzLmxldmVsUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwsIHtcclxuICAgICAgdmFsaWRWYWx1ZXM6IFsgbnVsbCwgLi4udGhpcy5sZXZlbHMgXSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdWxsYWJsZUlPKCBXYXZlR2FtZUxldmVsLldhdmVHYW1lTGV2ZWxJTyApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsZXZlbFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIGxldmVsIGN1cnJlbnRseSBzZWxlY3RlZCBpbiB0aGUgV2F2ZSBHYW1lLCBudWxsIGlmIG5vIGxldmVsIGlzIHNlbGVjdGVkLidcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMubGV2ZWxzLmZvckVhY2goIGxldmVsID0+IGxldmVsLnJlc2V0KCkgKTtcclxuICAgIHRoaXMubGV2ZWxQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICB9XHJcbn1cclxuXHJcbmZvdXJpZXJNYWtpbmdXYXZlcy5yZWdpc3RlciggJ1dhdmVHYW1lTW9kZWwnLCBXYXZlR2FtZU1vZGVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHFCQUFxQixNQUFNLDhDQUE4QztBQUNoRixPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFHdkQsT0FBT0MsVUFBVSxNQUFNLDJDQUEyQztBQUNsRSxPQUFPQyxZQUFZLE1BQU0sOEJBQThCO0FBQ3ZELE9BQU9DLGtCQUFrQixNQUFNLG9DQUFvQztBQUNuRSxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MseUJBQXlCLE1BQU0sb0NBQW9DO0FBQzFFLE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFFOUMsZUFBZSxNQUFN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