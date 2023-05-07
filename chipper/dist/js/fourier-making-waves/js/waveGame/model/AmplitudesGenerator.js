// Copyright 2021-2023, University of Colorado Boulder

/**
 * AmplitudesGenerator is responsible for generating a random set of amplitudes for a Fourier series.
 * It is used in the Wave Game to create answers for challenges.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize from '../../../../phet-core/js/optionize.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import FMWConstants from '../../common/FMWConstants.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
export default class AmplitudesGenerator {
  // See SelfOptions

  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      numberOfHarmonics: FMWConstants.MAX_HARMONICS,
      maxAmplitude: FMWConstants.MAX_AMPLITUDE,
      getNumberOfNonZeroHarmonics: () => 1
    }, providedOptions);
    this.numberOfHarmonics = options.numberOfHarmonics;
    this.maxAmplitude = options.maxAmplitude;
    this.getNumberOfNonZeroHarmonics = options.getNumberOfNonZeroHarmonics;
  }

  /**
   * Creates a set of amplitudes for the harmonics in a Fourier series.
   * Attempts to prevent consecutive sets of amplitudes from being similar.
   * @param [previousAmplitudes] - optional previous amplitudes
   */
  createAmplitudes(previousAmplitudes) {
    assert && assert(!previousAmplitudes || previousAmplitudes.length === this.numberOfHarmonics);
    let amplitudes;
    const numberOfNonZeroHarmonics = this.getNumberOfNonZeroHarmonics();
    let attempts = 0;
    const maxAttempts = 10;

    // Generate a set of random amplitudes. If optional previousAmplitudes was provided, continue to iterate until
    // the amplitudes are not "similar" to the previous amplitudes, or until we reach a maximum number of attempts.
    // The no-unmodified-loop-condition lint rule is disabled here because it apparently doesn't understand the
    // approach of using a constant to ensure that a do-while loop executes exactly once. In this case, it complains
    // because previousAmplitudes is not modified in the loop.
    // See https://github.com/phetsims/fourier-making-waves/issues/96.
    do {
      amplitudes = generateRandomAmplitudes(this.numberOfHarmonics, numberOfNonZeroHarmonics, this.maxAmplitude);
      attempts++;
      // eslint-disable-next-line no-unmodified-loop-condition
    } while (previousAmplitudes && attempts < maxAttempts && isSimilar(amplitudes, previousAmplitudes));

    // If we reached the max number of attempts, log a warning and continue with a 'similar' set of amplitudes.
    // In practice, this should occur rarely, if ever.  If it occurs too frequently, increase maxAttempts.
    if (attempts === maxAttempts) {
      phet.log && phet.log(`WARNING: Similar amplitudes were generated ${attempts} times in a row.`);
    }
    assert && AssertUtils.assertArrayOf(amplitudes, 'number');
    assert && assert(amplitudes.length === this.numberOfHarmonics);
    return amplitudes;
  }
}

/**
 * Determines whether 2 sets of amplitudes are similar. This is used to prevent consecutive challenges from being
 * similar during game play. The definition of 'similar' was a moving target during development, so consult
 * the implementation of this method for the ground truth.
 */
function isSimilar(amplitudes1, amplitudes2) {
  assert && assert(amplitudes1.length === amplitudes2.length);

  // Similar series have answers with identical amplitude values.
  return _.isEqual(amplitudes1, amplitudes2);
}

/**
 * Generates a set of random amplitudes.
 * @param numberOfAmplitudes - total number of amplitudes
 * @param numberOfNonZeroHarmonics - number of non-zero amplitudes
 * @param maxAmplitude - maximum amplitude of a harmonic
 */
function generateRandomAmplitudes(numberOfAmplitudes, numberOfNonZeroHarmonics, maxAmplitude) {
  assert && assert(Number.isInteger(numberOfAmplitudes) && numberOfAmplitudes > 0);
  assert && assert(Number.isInteger(numberOfNonZeroHarmonics) && numberOfNonZeroHarmonics > 0);
  assert && assert(numberOfAmplitudes >= numberOfNonZeroHarmonics, 'requested too many numberOfNonZeroHarmonics');
  assert && assert(maxAmplitude > 0);

  // Indices for the amplitudes. We'll choose randomly from this set.
  const amplitudesIndices = [];
  for (let i = 0; i < numberOfAmplitudes; i++) {
    amplitudesIndices.push(i);
  }

  // All amplitudes default to zero.
  const amplitudes = Array(numberOfAmplitudes).fill(0);

  // Choose non-zero amplitudes and randomly generate their values.
  for (let i = 0; i < numberOfNonZeroHarmonics; i++) {
    // Randomly choose which amplitude to set.
    const index = dotRandom.nextIntBetween(0, amplitudesIndices.length - 1); // [min,max)
    const amplitudesIndex = amplitudesIndices[index];
    amplitudesIndices.splice(index, 1);

    // Randomly choose a non-zero amplitude value, rounded to the same interval used for the amplitude sliders.
    let amplitude = dotRandom.nextDoubleBetween(-maxAmplitude, 0);
    if (amplitude !== -maxAmplitude) {
      amplitude = Utils.roundToInterval(amplitude, FMWConstants.WAVE_GAME_AMPLITUDE_STEP);
    }
    if (amplitude === 0) {
      amplitude = -FMWConstants.WAVE_GAME_AMPLITUDE_STEP;
    }
    amplitude *= dotRandom.nextBoolean() ? 1 : -1;
    assert && assert(amplitude >= -maxAmplitude && amplitude <= maxAmplitude && amplitude !== 0, `unexpected amplitude: ${amplitude}`);
    amplitudes[amplitudesIndex] = amplitude;
  }
  assert && assert(amplitudes.length === numberOfAmplitudes, `expected ${numberOfAmplitudes} amplitudes`);
  return amplitudes;
}
fourierMakingWaves.register('AmplitudesGenerator', AmplitudesGenerator);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJVdGlscyIsIm9wdGlvbml6ZSIsIkFzc2VydFV0aWxzIiwiRk1XQ29uc3RhbnRzIiwiZm91cmllck1ha2luZ1dhdmVzIiwiQW1wbGl0dWRlc0dlbmVyYXRvciIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIm51bWJlck9mSGFybW9uaWNzIiwiTUFYX0hBUk1PTklDUyIsIm1heEFtcGxpdHVkZSIsIk1BWF9BTVBMSVRVREUiLCJnZXROdW1iZXJPZk5vblplcm9IYXJtb25pY3MiLCJjcmVhdGVBbXBsaXR1ZGVzIiwicHJldmlvdXNBbXBsaXR1ZGVzIiwiYXNzZXJ0IiwibGVuZ3RoIiwiYW1wbGl0dWRlcyIsIm51bWJlck9mTm9uWmVyb0hhcm1vbmljcyIsImF0dGVtcHRzIiwibWF4QXR0ZW1wdHMiLCJnZW5lcmF0ZVJhbmRvbUFtcGxpdHVkZXMiLCJpc1NpbWlsYXIiLCJwaGV0IiwibG9nIiwiYXNzZXJ0QXJyYXlPZiIsImFtcGxpdHVkZXMxIiwiYW1wbGl0dWRlczIiLCJfIiwiaXNFcXVhbCIsIm51bWJlck9mQW1wbGl0dWRlcyIsIk51bWJlciIsImlzSW50ZWdlciIsImFtcGxpdHVkZXNJbmRpY2VzIiwiaSIsInB1c2giLCJBcnJheSIsImZpbGwiLCJpbmRleCIsIm5leHRJbnRCZXR3ZWVuIiwiYW1wbGl0dWRlc0luZGV4Iiwic3BsaWNlIiwiYW1wbGl0dWRlIiwibmV4dERvdWJsZUJldHdlZW4iLCJyb3VuZFRvSW50ZXJ2YWwiLCJXQVZFX0dBTUVfQU1QTElUVURFX1NURVAiLCJuZXh0Qm9vbGVhbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQW1wbGl0dWRlc0dlbmVyYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBbXBsaXR1ZGVzR2VuZXJhdG9yIGlzIHJlc3BvbnNpYmxlIGZvciBnZW5lcmF0aW5nIGEgcmFuZG9tIHNldCBvZiBhbXBsaXR1ZGVzIGZvciBhIEZvdXJpZXIgc2VyaWVzLlxyXG4gKiBJdCBpcyB1c2VkIGluIHRoZSBXYXZlIEdhbWUgdG8gY3JlYXRlIGFuc3dlcnMgZm9yIGNoYWxsZW5nZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBBc3NlcnRVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL0Fzc2VydFV0aWxzLmpzJztcclxuaW1wb3J0IEZNV0NvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRk1XQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IGZvdXJpZXJNYWtpbmdXYXZlcyBmcm9tICcuLi8uLi9mb3VyaWVyTWFraW5nV2F2ZXMuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBudW1iZXJPZkhhcm1vbmljcz86IG51bWJlcjtcclxuICBtYXhBbXBsaXR1ZGU/OiBudW1iZXI7XHJcblxyXG4gIC8vIGdldHMgdGhlIG51bWJlciBvZiBub24temVybyBoYXJtb25pY3MgaW4gdGhlIHdhdmVmb3JtXHJcbiAgZ2V0TnVtYmVyT2ZOb25aZXJvSGFybW9uaWNzPzogKCkgPT4gbnVtYmVyO1xyXG59O1xyXG5cclxudHlwZSBBbXBsaXR1ZGVzR2VuZXJhdG9yT3B0aW9ucyA9IFNlbGZPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW1wbGl0dWRlc0dlbmVyYXRvciB7XHJcblxyXG4gIC8vIFNlZSBTZWxmT3B0aW9uc1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbnVtYmVyT2ZIYXJtb25pY3M6IG51bWJlcjtcclxuICBwcml2YXRlIHJlYWRvbmx5IG1heEFtcGxpdHVkZTogbnVtYmVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZ2V0TnVtYmVyT2ZOb25aZXJvSGFybW9uaWNzOiAoKSA9PiBudW1iZXI7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogQW1wbGl0dWRlc0dlbmVyYXRvck9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxBbXBsaXR1ZGVzR2VuZXJhdG9yT3B0aW9ucywgU2VsZk9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIG51bWJlck9mSGFybW9uaWNzOiBGTVdDb25zdGFudHMuTUFYX0hBUk1PTklDUyxcclxuICAgICAgbWF4QW1wbGl0dWRlOiBGTVdDb25zdGFudHMuTUFYX0FNUExJVFVERSxcclxuICAgICAgZ2V0TnVtYmVyT2ZOb25aZXJvSGFybW9uaWNzOiAoKSA9PiAxXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLm51bWJlck9mSGFybW9uaWNzID0gb3B0aW9ucy5udW1iZXJPZkhhcm1vbmljcztcclxuICAgIHRoaXMubWF4QW1wbGl0dWRlID0gb3B0aW9ucy5tYXhBbXBsaXR1ZGU7XHJcbiAgICB0aGlzLmdldE51bWJlck9mTm9uWmVyb0hhcm1vbmljcyA9IG9wdGlvbnMuZ2V0TnVtYmVyT2ZOb25aZXJvSGFybW9uaWNzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHNldCBvZiBhbXBsaXR1ZGVzIGZvciB0aGUgaGFybW9uaWNzIGluIGEgRm91cmllciBzZXJpZXMuXHJcbiAgICogQXR0ZW1wdHMgdG8gcHJldmVudCBjb25zZWN1dGl2ZSBzZXRzIG9mIGFtcGxpdHVkZXMgZnJvbSBiZWluZyBzaW1pbGFyLlxyXG4gICAqIEBwYXJhbSBbcHJldmlvdXNBbXBsaXR1ZGVzXSAtIG9wdGlvbmFsIHByZXZpb3VzIGFtcGxpdHVkZXNcclxuICAgKi9cclxuICBwdWJsaWMgY3JlYXRlQW1wbGl0dWRlcyggcHJldmlvdXNBbXBsaXR1ZGVzPzogbnVtYmVyW10gKTogbnVtYmVyW10ge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXByZXZpb3VzQW1wbGl0dWRlcyB8fCBwcmV2aW91c0FtcGxpdHVkZXMubGVuZ3RoID09PSB0aGlzLm51bWJlck9mSGFybW9uaWNzICk7XHJcblxyXG4gICAgbGV0IGFtcGxpdHVkZXM7XHJcbiAgICBjb25zdCBudW1iZXJPZk5vblplcm9IYXJtb25pY3MgPSB0aGlzLmdldE51bWJlck9mTm9uWmVyb0hhcm1vbmljcygpO1xyXG4gICAgbGV0IGF0dGVtcHRzID0gMDtcclxuICAgIGNvbnN0IG1heEF0dGVtcHRzID0gMTA7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUgYSBzZXQgb2YgcmFuZG9tIGFtcGxpdHVkZXMuIElmIG9wdGlvbmFsIHByZXZpb3VzQW1wbGl0dWRlcyB3YXMgcHJvdmlkZWQsIGNvbnRpbnVlIHRvIGl0ZXJhdGUgdW50aWxcclxuICAgIC8vIHRoZSBhbXBsaXR1ZGVzIGFyZSBub3QgXCJzaW1pbGFyXCIgdG8gdGhlIHByZXZpb3VzIGFtcGxpdHVkZXMsIG9yIHVudGlsIHdlIHJlYWNoIGEgbWF4aW11bSBudW1iZXIgb2YgYXR0ZW1wdHMuXHJcbiAgICAvLyBUaGUgbm8tdW5tb2RpZmllZC1sb29wLWNvbmRpdGlvbiBsaW50IHJ1bGUgaXMgZGlzYWJsZWQgaGVyZSBiZWNhdXNlIGl0IGFwcGFyZW50bHkgZG9lc24ndCB1bmRlcnN0YW5kIHRoZVxyXG4gICAgLy8gYXBwcm9hY2ggb2YgdXNpbmcgYSBjb25zdGFudCB0byBlbnN1cmUgdGhhdCBhIGRvLXdoaWxlIGxvb3AgZXhlY3V0ZXMgZXhhY3RseSBvbmNlLiBJbiB0aGlzIGNhc2UsIGl0IGNvbXBsYWluc1xyXG4gICAgLy8gYmVjYXVzZSBwcmV2aW91c0FtcGxpdHVkZXMgaXMgbm90IG1vZGlmaWVkIGluIHRoZSBsb29wLlxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mb3VyaWVyLW1ha2luZy13YXZlcy9pc3N1ZXMvOTYuXHJcbiAgICBkbyB7XHJcbiAgICAgIGFtcGxpdHVkZXMgPSBnZW5lcmF0ZVJhbmRvbUFtcGxpdHVkZXMoIHRoaXMubnVtYmVyT2ZIYXJtb25pY3MsIG51bWJlck9mTm9uWmVyb0hhcm1vbmljcywgdGhpcy5tYXhBbXBsaXR1ZGUgKTtcclxuICAgICAgYXR0ZW1wdHMrKztcclxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVubW9kaWZpZWQtbG9vcC1jb25kaXRpb25cclxuICAgIH0gd2hpbGUgKCBwcmV2aW91c0FtcGxpdHVkZXMgJiYgKCBhdHRlbXB0cyA8IG1heEF0dGVtcHRzICkgJiYgaXNTaW1pbGFyKCBhbXBsaXR1ZGVzLCBwcmV2aW91c0FtcGxpdHVkZXMgKSApO1xyXG5cclxuICAgIC8vIElmIHdlIHJlYWNoZWQgdGhlIG1heCBudW1iZXIgb2YgYXR0ZW1wdHMsIGxvZyBhIHdhcm5pbmcgYW5kIGNvbnRpbnVlIHdpdGggYSAnc2ltaWxhcicgc2V0IG9mIGFtcGxpdHVkZXMuXHJcbiAgICAvLyBJbiBwcmFjdGljZSwgdGhpcyBzaG91bGQgb2NjdXIgcmFyZWx5LCBpZiBldmVyLiAgSWYgaXQgb2NjdXJzIHRvbyBmcmVxdWVudGx5LCBpbmNyZWFzZSBtYXhBdHRlbXB0cy5cclxuICAgIGlmICggYXR0ZW1wdHMgPT09IG1heEF0dGVtcHRzICkge1xyXG4gICAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggYFdBUk5JTkc6IFNpbWlsYXIgYW1wbGl0dWRlcyB3ZXJlIGdlbmVyYXRlZCAke2F0dGVtcHRzfSB0aW1lcyBpbiBhIHJvdy5gICk7XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydEFycmF5T2YoIGFtcGxpdHVkZXMsICdudW1iZXInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhbXBsaXR1ZGVzLmxlbmd0aCA9PT0gdGhpcy5udW1iZXJPZkhhcm1vbmljcyApO1xyXG4gICAgcmV0dXJuIGFtcGxpdHVkZXM7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIDIgc2V0cyBvZiBhbXBsaXR1ZGVzIGFyZSBzaW1pbGFyLiBUaGlzIGlzIHVzZWQgdG8gcHJldmVudCBjb25zZWN1dGl2ZSBjaGFsbGVuZ2VzIGZyb20gYmVpbmdcclxuICogc2ltaWxhciBkdXJpbmcgZ2FtZSBwbGF5LiBUaGUgZGVmaW5pdGlvbiBvZiAnc2ltaWxhcicgd2FzIGEgbW92aW5nIHRhcmdldCBkdXJpbmcgZGV2ZWxvcG1lbnQsIHNvIGNvbnN1bHRcclxuICogdGhlIGltcGxlbWVudGF0aW9uIG9mIHRoaXMgbWV0aG9kIGZvciB0aGUgZ3JvdW5kIHRydXRoLlxyXG4gKi9cclxuZnVuY3Rpb24gaXNTaW1pbGFyKCBhbXBsaXR1ZGVzMTogbnVtYmVyW10sIGFtcGxpdHVkZXMyOiBudW1iZXJbXSApOiBib29sZWFuIHtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBhbXBsaXR1ZGVzMS5sZW5ndGggPT09IGFtcGxpdHVkZXMyLmxlbmd0aCApO1xyXG5cclxuICAvLyBTaW1pbGFyIHNlcmllcyBoYXZlIGFuc3dlcnMgd2l0aCBpZGVudGljYWwgYW1wbGl0dWRlIHZhbHVlcy5cclxuICByZXR1cm4gXy5pc0VxdWFsKCBhbXBsaXR1ZGVzMSwgYW1wbGl0dWRlczIgKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIHNldCBvZiByYW5kb20gYW1wbGl0dWRlcy5cclxuICogQHBhcmFtIG51bWJlck9mQW1wbGl0dWRlcyAtIHRvdGFsIG51bWJlciBvZiBhbXBsaXR1ZGVzXHJcbiAqIEBwYXJhbSBudW1iZXJPZk5vblplcm9IYXJtb25pY3MgLSBudW1iZXIgb2Ygbm9uLXplcm8gYW1wbGl0dWRlc1xyXG4gKiBAcGFyYW0gbWF4QW1wbGl0dWRlIC0gbWF4aW11bSBhbXBsaXR1ZGUgb2YgYSBoYXJtb25pY1xyXG4gKi9cclxuZnVuY3Rpb24gZ2VuZXJhdGVSYW5kb21BbXBsaXR1ZGVzKCBudW1iZXJPZkFtcGxpdHVkZXM6IG51bWJlciwgbnVtYmVyT2ZOb25aZXJvSGFybW9uaWNzOiBudW1iZXIsIG1heEFtcGxpdHVkZTogbnVtYmVyICk6IG51bWJlcltdIHtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBudW1iZXJPZkFtcGxpdHVkZXMgKSAmJiBudW1iZXJPZkFtcGxpdHVkZXMgPiAwICk7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbnVtYmVyT2ZOb25aZXJvSGFybW9uaWNzICkgJiYgbnVtYmVyT2ZOb25aZXJvSGFybW9uaWNzID4gMCApO1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIG51bWJlck9mQW1wbGl0dWRlcyA+PSBudW1iZXJPZk5vblplcm9IYXJtb25pY3MsICdyZXF1ZXN0ZWQgdG9vIG1hbnkgbnVtYmVyT2ZOb25aZXJvSGFybW9uaWNzJyApO1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIG1heEFtcGxpdHVkZSA+IDAgKTtcclxuXHJcbiAgLy8gSW5kaWNlcyBmb3IgdGhlIGFtcGxpdHVkZXMuIFdlJ2xsIGNob29zZSByYW5kb21seSBmcm9tIHRoaXMgc2V0LlxyXG4gIGNvbnN0IGFtcGxpdHVkZXNJbmRpY2VzID0gW107XHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZBbXBsaXR1ZGVzOyBpKysgKSB7XHJcbiAgICBhbXBsaXR1ZGVzSW5kaWNlcy5wdXNoKCBpICk7XHJcbiAgfVxyXG5cclxuICAvLyBBbGwgYW1wbGl0dWRlcyBkZWZhdWx0IHRvIHplcm8uXHJcbiAgY29uc3QgYW1wbGl0dWRlcyA9IEFycmF5KCBudW1iZXJPZkFtcGxpdHVkZXMgKS5maWxsKCAwICk7XHJcblxyXG4gIC8vIENob29zZSBub24temVybyBhbXBsaXR1ZGVzIGFuZCByYW5kb21seSBnZW5lcmF0ZSB0aGVpciB2YWx1ZXMuXHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZOb25aZXJvSGFybW9uaWNzOyBpKysgKSB7XHJcblxyXG4gICAgLy8gUmFuZG9tbHkgY2hvb3NlIHdoaWNoIGFtcGxpdHVkZSB0byBzZXQuXHJcbiAgICBjb25zdCBpbmRleCA9IGRvdFJhbmRvbS5uZXh0SW50QmV0d2VlbiggMCwgYW1wbGl0dWRlc0luZGljZXMubGVuZ3RoIC0gMSApOyAvLyBbbWluLG1heClcclxuICAgIGNvbnN0IGFtcGxpdHVkZXNJbmRleCA9IGFtcGxpdHVkZXNJbmRpY2VzWyBpbmRleCBdO1xyXG4gICAgYW1wbGl0dWRlc0luZGljZXMuc3BsaWNlKCBpbmRleCwgMSApO1xyXG5cclxuICAgIC8vIFJhbmRvbWx5IGNob29zZSBhIG5vbi16ZXJvIGFtcGxpdHVkZSB2YWx1ZSwgcm91bmRlZCB0byB0aGUgc2FtZSBpbnRlcnZhbCB1c2VkIGZvciB0aGUgYW1wbGl0dWRlIHNsaWRlcnMuXHJcbiAgICBsZXQgYW1wbGl0dWRlID0gZG90UmFuZG9tLm5leHREb3VibGVCZXR3ZWVuKCAtbWF4QW1wbGl0dWRlLCAwICk7XHJcbiAgICBpZiAoIGFtcGxpdHVkZSAhPT0gLW1heEFtcGxpdHVkZSApIHtcclxuICAgICAgYW1wbGl0dWRlID0gVXRpbHMucm91bmRUb0ludGVydmFsKCBhbXBsaXR1ZGUsIEZNV0NvbnN0YW50cy5XQVZFX0dBTUVfQU1QTElUVURFX1NURVAgKTtcclxuICAgIH1cclxuICAgIGlmICggYW1wbGl0dWRlID09PSAwICkge1xyXG4gICAgICBhbXBsaXR1ZGUgPSAtRk1XQ29uc3RhbnRzLldBVkVfR0FNRV9BTVBMSVRVREVfU1RFUDtcclxuICAgIH1cclxuICAgIGFtcGxpdHVkZSAqPSBkb3RSYW5kb20ubmV4dEJvb2xlYW4oKSA/IDEgOiAtMTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFtcGxpdHVkZSA+PSAtbWF4QW1wbGl0dWRlICYmIGFtcGxpdHVkZSA8PSBtYXhBbXBsaXR1ZGUgJiYgYW1wbGl0dWRlICE9PSAwLFxyXG4gICAgICBgdW5leHBlY3RlZCBhbXBsaXR1ZGU6ICR7YW1wbGl0dWRlfWAgKTtcclxuICAgIGFtcGxpdHVkZXNbIGFtcGxpdHVkZXNJbmRleCBdID0gYW1wbGl0dWRlO1xyXG4gIH1cclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBhbXBsaXR1ZGVzLmxlbmd0aCA9PT0gbnVtYmVyT2ZBbXBsaXR1ZGVzLCBgZXhwZWN0ZWQgJHtudW1iZXJPZkFtcGxpdHVkZXN9IGFtcGxpdHVkZXNgICk7XHJcblxyXG4gIHJldHVybiBhbXBsaXR1ZGVzO1xyXG59XHJcblxyXG5mb3VyaWVyTWFraW5nV2F2ZXMucmVnaXN0ZXIoICdBbXBsaXR1ZGVzR2VuZXJhdG9yJywgQW1wbGl0dWRlc0dlbmVyYXRvciApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxTQUFTLE1BQU0sdUNBQXVDO0FBQzdELE9BQU9DLFdBQVcsTUFBTSwwQ0FBMEM7QUFDbEUsT0FBT0MsWUFBWSxNQUFNLDhCQUE4QjtBQUN2RCxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFZNUQsZUFBZSxNQUFNQyxtQkFBbUIsQ0FBQztFQUV2Qzs7RUFLT0MsV0FBV0EsQ0FBRUMsZUFBNEMsRUFBRztJQUVqRSxNQUFNQyxPQUFPLEdBQUdQLFNBQVMsQ0FBMEMsQ0FBQyxDQUFFO01BRXBFO01BQ0FRLGlCQUFpQixFQUFFTixZQUFZLENBQUNPLGFBQWE7TUFDN0NDLFlBQVksRUFBRVIsWUFBWSxDQUFDUyxhQUFhO01BQ3hDQywyQkFBMkIsRUFBRUEsQ0FBQSxLQUFNO0lBQ3JDLENBQUMsRUFBRU4sZUFBZ0IsQ0FBQztJQUVwQixJQUFJLENBQUNFLGlCQUFpQixHQUFHRCxPQUFPLENBQUNDLGlCQUFpQjtJQUNsRCxJQUFJLENBQUNFLFlBQVksR0FBR0gsT0FBTyxDQUFDRyxZQUFZO0lBQ3hDLElBQUksQ0FBQ0UsMkJBQTJCLEdBQUdMLE9BQU8sQ0FBQ0ssMkJBQTJCO0VBQ3hFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDU0MsZ0JBQWdCQSxDQUFFQyxrQkFBNkIsRUFBYTtJQUNqRUMsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQ0Qsa0JBQWtCLElBQUlBLGtCQUFrQixDQUFDRSxNQUFNLEtBQUssSUFBSSxDQUFDUixpQkFBa0IsQ0FBQztJQUUvRixJQUFJUyxVQUFVO0lBQ2QsTUFBTUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDTiwyQkFBMkIsQ0FBQyxDQUFDO0lBQ25FLElBQUlPLFFBQVEsR0FBRyxDQUFDO0lBQ2hCLE1BQU1DLFdBQVcsR0FBRyxFQUFFOztJQUV0QjtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxHQUFHO01BQ0RILFVBQVUsR0FBR0ksd0JBQXdCLENBQUUsSUFBSSxDQUFDYixpQkFBaUIsRUFBRVUsd0JBQXdCLEVBQUUsSUFBSSxDQUFDUixZQUFhLENBQUM7TUFDNUdTLFFBQVEsRUFBRTtNQUNWO0lBQ0YsQ0FBQyxRQUFTTCxrQkFBa0IsSUFBTUssUUFBUSxHQUFHQyxXQUFhLElBQUlFLFNBQVMsQ0FBRUwsVUFBVSxFQUFFSCxrQkFBbUIsQ0FBQzs7SUFFekc7SUFDQTtJQUNBLElBQUtLLFFBQVEsS0FBS0MsV0FBVyxFQUFHO01BQzlCRyxJQUFJLENBQUNDLEdBQUcsSUFBSUQsSUFBSSxDQUFDQyxHQUFHLENBQUcsOENBQTZDTCxRQUFTLGtCQUFrQixDQUFDO0lBQ2xHO0lBRUFKLE1BQU0sSUFBSWQsV0FBVyxDQUFDd0IsYUFBYSxDQUFFUixVQUFVLEVBQUUsUUFBUyxDQUFDO0lBQzNERixNQUFNLElBQUlBLE1BQU0sQ0FBRUUsVUFBVSxDQUFDRCxNQUFNLEtBQUssSUFBSSxDQUFDUixpQkFBa0IsQ0FBQztJQUNoRSxPQUFPUyxVQUFVO0VBQ25CO0FBQ0Y7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNLLFNBQVNBLENBQUVJLFdBQXFCLEVBQUVDLFdBQXFCLEVBQVk7RUFDMUVaLE1BQU0sSUFBSUEsTUFBTSxDQUFFVyxXQUFXLENBQUNWLE1BQU0sS0FBS1csV0FBVyxDQUFDWCxNQUFPLENBQUM7O0VBRTdEO0VBQ0EsT0FBT1ksQ0FBQyxDQUFDQyxPQUFPLENBQUVILFdBQVcsRUFBRUMsV0FBWSxDQUFDO0FBQzlDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNOLHdCQUF3QkEsQ0FBRVMsa0JBQTBCLEVBQUVaLHdCQUFnQyxFQUFFUixZQUFvQixFQUFhO0VBQ2hJSyxNQUFNLElBQUlBLE1BQU0sQ0FBRWdCLE1BQU0sQ0FBQ0MsU0FBUyxDQUFFRixrQkFBbUIsQ0FBQyxJQUFJQSxrQkFBa0IsR0FBRyxDQUFFLENBQUM7RUFDcEZmLE1BQU0sSUFBSUEsTUFBTSxDQUFFZ0IsTUFBTSxDQUFDQyxTQUFTLENBQUVkLHdCQUF5QixDQUFDLElBQUlBLHdCQUF3QixHQUFHLENBQUUsQ0FBQztFQUNoR0gsTUFBTSxJQUFJQSxNQUFNLENBQUVlLGtCQUFrQixJQUFJWix3QkFBd0IsRUFBRSw2Q0FBOEMsQ0FBQztFQUNqSEgsTUFBTSxJQUFJQSxNQUFNLENBQUVMLFlBQVksR0FBRyxDQUFFLENBQUM7O0VBRXBDO0VBQ0EsTUFBTXVCLGlCQUFpQixHQUFHLEVBQUU7RUFDNUIsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdKLGtCQUFrQixFQUFFSSxDQUFDLEVBQUUsRUFBRztJQUM3Q0QsaUJBQWlCLENBQUNFLElBQUksQ0FBRUQsQ0FBRSxDQUFDO0VBQzdCOztFQUVBO0VBQ0EsTUFBTWpCLFVBQVUsR0FBR21CLEtBQUssQ0FBRU4sa0JBQW1CLENBQUMsQ0FBQ08sSUFBSSxDQUFFLENBQUUsQ0FBQzs7RUFFeEQ7RUFDQSxLQUFNLElBQUlILENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2hCLHdCQUF3QixFQUFFZ0IsQ0FBQyxFQUFFLEVBQUc7SUFFbkQ7SUFDQSxNQUFNSSxLQUFLLEdBQUd4QyxTQUFTLENBQUN5QyxjQUFjLENBQUUsQ0FBQyxFQUFFTixpQkFBaUIsQ0FBQ2pCLE1BQU0sR0FBRyxDQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNFLE1BQU13QixlQUFlLEdBQUdQLGlCQUFpQixDQUFFSyxLQUFLLENBQUU7SUFDbERMLGlCQUFpQixDQUFDUSxNQUFNLENBQUVILEtBQUssRUFBRSxDQUFFLENBQUM7O0lBRXBDO0lBQ0EsSUFBSUksU0FBUyxHQUFHNUMsU0FBUyxDQUFDNkMsaUJBQWlCLENBQUUsQ0FBQ2pDLFlBQVksRUFBRSxDQUFFLENBQUM7SUFDL0QsSUFBS2dDLFNBQVMsS0FBSyxDQUFDaEMsWUFBWSxFQUFHO01BQ2pDZ0MsU0FBUyxHQUFHM0MsS0FBSyxDQUFDNkMsZUFBZSxDQUFFRixTQUFTLEVBQUV4QyxZQUFZLENBQUMyQyx3QkFBeUIsQ0FBQztJQUN2RjtJQUNBLElBQUtILFNBQVMsS0FBSyxDQUFDLEVBQUc7TUFDckJBLFNBQVMsR0FBRyxDQUFDeEMsWUFBWSxDQUFDMkMsd0JBQXdCO0lBQ3BEO0lBQ0FILFNBQVMsSUFBSTVDLFNBQVMsQ0FBQ2dELFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3Qy9CLE1BQU0sSUFBSUEsTUFBTSxDQUFFMkIsU0FBUyxJQUFJLENBQUNoQyxZQUFZLElBQUlnQyxTQUFTLElBQUloQyxZQUFZLElBQUlnQyxTQUFTLEtBQUssQ0FBQyxFQUN6Rix5QkFBd0JBLFNBQVUsRUFBRSxDQUFDO0lBQ3hDekIsVUFBVSxDQUFFdUIsZUFBZSxDQUFFLEdBQUdFLFNBQVM7RUFDM0M7RUFDQTNCLE1BQU0sSUFBSUEsTUFBTSxDQUFFRSxVQUFVLENBQUNELE1BQU0sS0FBS2Msa0JBQWtCLEVBQUcsWUFBV0Esa0JBQW1CLGFBQWEsQ0FBQztFQUV6RyxPQUFPYixVQUFVO0FBQ25CO0FBRUFkLGtCQUFrQixDQUFDNEMsUUFBUSxDQUFFLHFCQUFxQixFQUFFM0MsbUJBQW9CLENBQUMifQ==