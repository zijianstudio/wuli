// Copyright 2015-2023, University of Colorado Boulder

/**
 * Random number generator with an optional seed.  It uses seedrandom.js, a monkey patch for Math, see
 * https://github.com/davidbau/seedrandom.
 *
 * If you are developing a PhET Simulation, you should probably use the global `DOT/dotRandom` because it
 * provides built-in support for phet-io seeding and a check that it isn't used before the seed has been set.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Aaron Davis (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Mohamed Safi
 */

import merge from '../../phet-core/js/merge.js';
import Bounds2 from './Bounds2.js';
import dot from './dot.js';
import Range from './Range.js';
import Utils from './Utils.js';
import Vector2 from './Vector2.js';
class Random {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      // {number|null} seed for the random number generator.  When seed is null, Math.random() is used.
      seed: null
    }, options);

    // @private {number|null} initialized via setSeed below
    this.seed = null;

    // If seed is provided, create a local random number generator without altering Math.random.
    // Math.seedrandom is provided by seedrandom.js, see https://github.com/davidbau/seedrandom.
    // @private {function:number|null} initialized via setSeed below
    this.seedrandom = null;
    this.setSeed(options.seed);

    // @public (read-only) - the number of times `nextDouble` is called
    this.numberOfCalls = 0;
    Random.allRandomInstances.add(this);
  }

  /**
   * Clears out this instance from all of the Random instances.
   * @public
   */
  dispose() {
    Random.allRandomInstances.delete(this);
  }

  /**
   * Gets the seed.
   * @public
   * @returns {number|null}
   */
  getSeed() {
    return this.seed;
  }

  /**
   * Returns the next pseudo-random boolean
   * @public
   * @returns {boolean}
   */
  nextBoolean() {
    return this.nextDouble() >= 0.5;
  }

  /**
   * Returns the next pseudo random number from this random number generator sequence.
   * The random number is an integer ranging from 0 to n-1.
   * @public
   * @param {number} n
   * @returns {number} - an integer
   */
  nextInt(n) {
    const value = this.nextDouble() * n;
    return Math.floor(value);
  }

  /**
   * Randomly select a random integer between min and max (inclusive).
   * @public
   * @param {number} min - must be an integer
   * @param {number} max - must be an integer
   * @returns {number} an integer between min and max, inclusive
   */
  nextIntBetween(min, max) {
    assert && assert(arguments.length === 2, 'nextIntBetween must have exactly 2 arguments');
    assert && assert(Number.isInteger(min), `min must be an integer: ${min}`);
    assert && assert(Number.isInteger(max), `max must be an integer: ${max}`);
    const range = max - min;
    return this.nextInt(range + 1) + min;
  }

  /**
   * Randomly select one element from the given array.
   * @public
   * @param {T[]} array - the array from which one element will be selected, must have at least one element
   * @returns {T} - the selected element from the array
   * @template T
   */
  sample(array) {
    assert && assert(array.length > 0, 'Array should have at least 1 item.');
    const index = this.nextIntBetween(0, array.length - 1);
    return array[index];
  }

  /**
   * Creates an array of shuffled values, using a version of the Fisher-Yates shuffle.  Adapted from lodash-2.4.1 by
   * Sam Reid on Aug 16, 2016, See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
   * @public
   * @param {Array} array - the array which will be shuffled
   * @returns {Array} a new array with all the same elements in the passed-in array, in randomized order.
   */
  shuffle(array) {
    assert && assert(array, 'Array should exist');
    let index = -1;
    const result = new Array(array.length);
    _.forEach(array, value => {
      const rand = this.nextIntBetween(0, ++index);
      result[index] = result[rand];
      result[rand] = value;
    });
    return result;
  }

  /**
   * Returns the next pseudo random number from this random number generator sequence in the range [0, 1)
   * The distribution of the random numbers is uniformly distributed across the interval
   * @public
   * @returns {number} - the random number
   */
  nextDouble() {
    this.numberOfCalls++;
    return this.seedrandom();
  }

  /**
   * Randomly selects a double in the range [min,max).
   * @public
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  nextDoubleBetween(min, max) {
    assert && assert(min < max, 'min must be < max');
    const value = min + this.nextDouble() * (max - min);
    assert && assert(value >= min && value < max, `value out of range: ${value}`);
    return value;
  }

  /**
   * Returns the next gaussian-distributed random number from this random number generator sequence.
   * The distribution of the random numbers is gaussian, with a mean = 0 and standard deviation = 1
   * @public
   * @returns {number}
   */
  nextGaussian() {
    return Utils.boxMullerTransform(0, 1, this);
  }

  /**
   * Gets the next random double in a Range.
   * For min < max, the return value is [min,max), between min (inclusive) and max (exclusive).
   * For min === max, the return value is min.
   * @public
   * @param {Range} range
   * @returns {number}
   */
  nextDoubleInRange(range) {
    assert && assert(range instanceof Range, 'invalid range');
    if (range.min < range.max) {
      return this.nextDoubleBetween(range.min, range.max);
    } else {
      // because random.nextDoubleBetween requires min < max
      return range.min;
    }
  }

  /**
   * Gets a random point within the provided Bounds2, [min,max)
   * @param {Bounds2} bounds
   * @returns {Vector2}
   * @public
   */
  nextPointInBounds(bounds) {
    assert && assert(bounds instanceof Bounds2, 'invalid Bounds2');
    return new Vector2(this.nextDoubleBetween(bounds.minX, bounds.maxX), this.nextDoubleBetween(bounds.minY, bounds.maxY));
  }

  /**
   * @public
   * @param {number|null} seed - if null, Math.random will be used to create the seed.
   */
  setSeed(seed) {
    assert && assert(seed === null || typeof seed === 'number');
    if (typeof seed === 'number') {
      assert && assert(Math.seedrandom, 'cannot set seed with 3rd party library "Math.seedrandom".');
    } else {
      seed = Math.random(); // eslint-disable-line bad-sim-text
    }

    this.seed = seed;

    // If seed is provided, create a local random number generator without altering Math.random.
    // Math.seedrandom is provided by seedrandom.js, see https://github.com/davidbau/seedrandom.
    // @private {function:number|null}
    this.seedrandom = Math.seedrandom ? new Math.seedrandom(`${seed}`) : () => Math.random(); // eslint-disable-line bad-sim-text
  }

  /**
   * Choose a numeric index from the array of weights.  The array of weights does not need to be normalized.
   * See https://stackoverflow.com/questions/8877249/generate-random-integers-with-probabilities
   * See also ContinuousServer.weightedSampleTest which uses the same algorithm
   * @param {ReadonlyArray<number>} weights
   * @returns {number}
   * @public
   */
  sampleProbabilities(weights) {
    const totalWeight = _.sum(weights);
    const cutoffWeight = totalWeight * this.nextDouble();
    let cumulativeWeight = 0;
    for (let i = 0; i < weights.length; i++) {
      cumulativeWeight += weights[i];
      if (cumulativeWeight >= cutoffWeight) {
        return i;
      }
    }

    // The fallback is the last test
    assert && assert(!weights[weights.length - 1] === 0, 'if last weight is zero, should have selected something beforehand');
    return weights.length - 1;
  }
}
Random.allRandomInstances = new Set();
Random.isNormalized = array => {
  assert && assert(_.sum(array) === 1);
};
dot.register('Random', Random);
export default Random;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkJvdW5kczIiLCJkb3QiLCJSYW5nZSIsIlV0aWxzIiwiVmVjdG9yMiIsIlJhbmRvbSIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsInNlZWQiLCJzZWVkcmFuZG9tIiwic2V0U2VlZCIsIm51bWJlck9mQ2FsbHMiLCJhbGxSYW5kb21JbnN0YW5jZXMiLCJhZGQiLCJkaXNwb3NlIiwiZGVsZXRlIiwiZ2V0U2VlZCIsIm5leHRCb29sZWFuIiwibmV4dERvdWJsZSIsIm5leHRJbnQiLCJuIiwidmFsdWUiLCJNYXRoIiwiZmxvb3IiLCJuZXh0SW50QmV0d2VlbiIsIm1pbiIsIm1heCIsImFzc2VydCIsImFyZ3VtZW50cyIsImxlbmd0aCIsIk51bWJlciIsImlzSW50ZWdlciIsInJhbmdlIiwic2FtcGxlIiwiYXJyYXkiLCJpbmRleCIsInNodWZmbGUiLCJyZXN1bHQiLCJBcnJheSIsIl8iLCJmb3JFYWNoIiwicmFuZCIsIm5leHREb3VibGVCZXR3ZWVuIiwibmV4dEdhdXNzaWFuIiwiYm94TXVsbGVyVHJhbnNmb3JtIiwibmV4dERvdWJsZUluUmFuZ2UiLCJuZXh0UG9pbnRJbkJvdW5kcyIsImJvdW5kcyIsIm1pblgiLCJtYXhYIiwibWluWSIsIm1heFkiLCJyYW5kb20iLCJzYW1wbGVQcm9iYWJpbGl0aWVzIiwid2VpZ2h0cyIsInRvdGFsV2VpZ2h0Iiwic3VtIiwiY3V0b2ZmV2VpZ2h0IiwiY3VtdWxhdGl2ZVdlaWdodCIsImkiLCJTZXQiLCJpc05vcm1hbGl6ZWQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJhbmRvbS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSYW5kb20gbnVtYmVyIGdlbmVyYXRvciB3aXRoIGFuIG9wdGlvbmFsIHNlZWQuICBJdCB1c2VzIHNlZWRyYW5kb20uanMsIGEgbW9ua2V5IHBhdGNoIGZvciBNYXRoLCBzZWVcclxuICogaHR0cHM6Ly9naXRodWIuY29tL2RhdmlkYmF1L3NlZWRyYW5kb20uXHJcbiAqXHJcbiAqIElmIHlvdSBhcmUgZGV2ZWxvcGluZyBhIFBoRVQgU2ltdWxhdGlvbiwgeW91IHNob3VsZCBwcm9iYWJseSB1c2UgdGhlIGdsb2JhbCBgRE9UL2RvdFJhbmRvbWAgYmVjYXVzZSBpdFxyXG4gKiBwcm92aWRlcyBidWlsdC1pbiBzdXBwb3J0IGZvciBwaGV0LWlvIHNlZWRpbmcgYW5kIGEgY2hlY2sgdGhhdCBpdCBpc24ndCB1c2VkIGJlZm9yZSB0aGUgc2VlZCBoYXMgYmVlbiBzZXQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgQWFyb24gRGF2aXMgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgTW9oYW1lZCBTYWZpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4vQm91bmRzMi5qcyc7XHJcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi9WZWN0b3IyLmpzJztcclxuXHJcbmNsYXNzIFJhbmRvbSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ8bnVsbH0gc2VlZCBmb3IgdGhlIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yLiAgV2hlbiBzZWVkIGlzIG51bGwsIE1hdGgucmFuZG9tKCkgaXMgdXNlZC5cclxuICAgICAgc2VlZDogbnVsbFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ8bnVsbH0gaW5pdGlhbGl6ZWQgdmlhIHNldFNlZWQgYmVsb3dcclxuICAgIHRoaXMuc2VlZCA9IG51bGw7XHJcblxyXG4gICAgLy8gSWYgc2VlZCBpcyBwcm92aWRlZCwgY3JlYXRlIGEgbG9jYWwgcmFuZG9tIG51bWJlciBnZW5lcmF0b3Igd2l0aG91dCBhbHRlcmluZyBNYXRoLnJhbmRvbS5cclxuICAgIC8vIE1hdGguc2VlZHJhbmRvbSBpcyBwcm92aWRlZCBieSBzZWVkcmFuZG9tLmpzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2RhdmlkYmF1L3NlZWRyYW5kb20uXHJcbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb246bnVtYmVyfG51bGx9IGluaXRpYWxpemVkIHZpYSBzZXRTZWVkIGJlbG93XHJcbiAgICB0aGlzLnNlZWRyYW5kb20gPSBudWxsO1xyXG4gICAgdGhpcy5zZXRTZWVkKCBvcHRpb25zLnNlZWQgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gdGhlIG51bWJlciBvZiB0aW1lcyBgbmV4dERvdWJsZWAgaXMgY2FsbGVkXHJcbiAgICB0aGlzLm51bWJlck9mQ2FsbHMgPSAwO1xyXG5cclxuICAgIFJhbmRvbS5hbGxSYW5kb21JbnN0YW5jZXMuYWRkKCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhcnMgb3V0IHRoaXMgaW5zdGFuY2UgZnJvbSBhbGwgb2YgdGhlIFJhbmRvbSBpbnN0YW5jZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICBSYW5kb20uYWxsUmFuZG9tSW5zdGFuY2VzLmRlbGV0ZSggdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgc2VlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge251bWJlcnxudWxsfVxyXG4gICAqL1xyXG4gIGdldFNlZWQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZWVkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbmV4dCBwc2V1ZG8tcmFuZG9tIGJvb2xlYW5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgbmV4dEJvb2xlYW4oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5uZXh0RG91YmxlKCkgPj0gMC41O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbmV4dCBwc2V1ZG8gcmFuZG9tIG51bWJlciBmcm9tIHRoaXMgcmFuZG9tIG51bWJlciBnZW5lcmF0b3Igc2VxdWVuY2UuXHJcbiAgICogVGhlIHJhbmRvbSBudW1iZXIgaXMgYW4gaW50ZWdlciByYW5naW5nIGZyb20gMCB0byBuLTEuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuXHJcbiAgICogQHJldHVybnMge251bWJlcn0gLSBhbiBpbnRlZ2VyXHJcbiAgICovXHJcbiAgbmV4dEludCggbiApIHtcclxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5uZXh0RG91YmxlKCkgKiBuO1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSYW5kb21seSBzZWxlY3QgYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IChpbmNsdXNpdmUpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWluIC0gbXVzdCBiZSBhbiBpbnRlZ2VyXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heCAtIG11c3QgYmUgYW4gaW50ZWdlclxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IGFuIGludGVnZXIgYmV0d2VlbiBtaW4gYW5kIG1heCwgaW5jbHVzaXZlXHJcbiAgICovXHJcbiAgbmV4dEludEJldHdlZW4oIG1pbiwgbWF4ICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFyZ3VtZW50cy5sZW5ndGggPT09IDIsICduZXh0SW50QmV0d2VlbiBtdXN0IGhhdmUgZXhhY3RseSAyIGFyZ3VtZW50cycgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIG1pbiApLCBgbWluIG11c3QgYmUgYW4gaW50ZWdlcjogJHttaW59YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbWF4ICksIGBtYXggbXVzdCBiZSBhbiBpbnRlZ2VyOiAke21heH1gICk7XHJcblxyXG4gICAgY29uc3QgcmFuZ2UgPSBtYXggLSBtaW47XHJcbiAgICByZXR1cm4gdGhpcy5uZXh0SW50KCByYW5nZSArIDEgKSArIG1pbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJhbmRvbWx5IHNlbGVjdCBvbmUgZWxlbWVudCBmcm9tIHRoZSBnaXZlbiBhcnJheS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtUW119IGFycmF5IC0gdGhlIGFycmF5IGZyb20gd2hpY2ggb25lIGVsZW1lbnQgd2lsbCBiZSBzZWxlY3RlZCwgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBlbGVtZW50XHJcbiAgICogQHJldHVybnMge1R9IC0gdGhlIHNlbGVjdGVkIGVsZW1lbnQgZnJvbSB0aGUgYXJyYXlcclxuICAgKiBAdGVtcGxhdGUgVFxyXG4gICAqL1xyXG4gIHNhbXBsZSggYXJyYXkgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhcnJheS5sZW5ndGggPiAwLCAnQXJyYXkgc2hvdWxkIGhhdmUgYXQgbGVhc3QgMSBpdGVtLicgKTtcclxuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5uZXh0SW50QmV0d2VlbiggMCwgYXJyYXkubGVuZ3RoIC0gMSApO1xyXG4gICAgcmV0dXJuIGFycmF5WyBpbmRleCBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbiBhcnJheSBvZiBzaHVmZmxlZCB2YWx1ZXMsIHVzaW5nIGEgdmVyc2lvbiBvZiB0aGUgRmlzaGVyLVlhdGVzIHNodWZmbGUuICBBZGFwdGVkIGZyb20gbG9kYXNoLTIuNC4xIGJ5XHJcbiAgICogU2FtIFJlaWQgb24gQXVnIDE2LCAyMDE2LCBTZWUgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GaXNoZXItWWF0ZXNfc2h1ZmZsZS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgLSB0aGUgYXJyYXkgd2hpY2ggd2lsbCBiZSBzaHVmZmxlZFxyXG4gICAqIEByZXR1cm5zIHtBcnJheX0gYSBuZXcgYXJyYXkgd2l0aCBhbGwgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHBhc3NlZC1pbiBhcnJheSwgaW4gcmFuZG9taXplZCBvcmRlci5cclxuICAgKi9cclxuICBzaHVmZmxlKCBhcnJheSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFycmF5LCAnQXJyYXkgc2hvdWxkIGV4aXN0JyApO1xyXG4gICAgbGV0IGluZGV4ID0gLTE7XHJcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgQXJyYXkoIGFycmF5Lmxlbmd0aCApO1xyXG5cclxuICAgIF8uZm9yRWFjaCggYXJyYXksIHZhbHVlID0+IHtcclxuICAgICAgY29uc3QgcmFuZCA9IHRoaXMubmV4dEludEJldHdlZW4oIDAsICsraW5kZXggKTtcclxuICAgICAgcmVzdWx0WyBpbmRleCBdID0gcmVzdWx0WyByYW5kIF07XHJcbiAgICAgIHJlc3VsdFsgcmFuZCBdID0gdmFsdWU7XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbmV4dCBwc2V1ZG8gcmFuZG9tIG51bWJlciBmcm9tIHRoaXMgcmFuZG9tIG51bWJlciBnZW5lcmF0b3Igc2VxdWVuY2UgaW4gdGhlIHJhbmdlIFswLCAxKVxyXG4gICAqIFRoZSBkaXN0cmlidXRpb24gb2YgdGhlIHJhbmRvbSBudW1iZXJzIGlzIHVuaWZvcm1seSBkaXN0cmlidXRlZCBhY3Jvc3MgdGhlIGludGVydmFsXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gdGhlIHJhbmRvbSBudW1iZXJcclxuICAgKi9cclxuICBuZXh0RG91YmxlKCkge1xyXG4gICAgdGhpcy5udW1iZXJPZkNhbGxzKys7XHJcbiAgICByZXR1cm4gdGhpcy5zZWVkcmFuZG9tKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSYW5kb21seSBzZWxlY3RzIGEgZG91YmxlIGluIHRoZSByYW5nZSBbbWluLG1heCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaW5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBuZXh0RG91YmxlQmV0d2VlbiggbWluLCBtYXggKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtaW4gPCBtYXgsICdtaW4gbXVzdCBiZSA8IG1heCcgKTtcclxuICAgIGNvbnN0IHZhbHVlID0gbWluICsgdGhpcy5uZXh0RG91YmxlKCkgKiAoIG1heCAtIG1pbiApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmFsdWUgPj0gbWluICYmIHZhbHVlIDwgbWF4LCBgdmFsdWUgb3V0IG9mIHJhbmdlOiAke3ZhbHVlfWAgKTtcclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG5leHQgZ2F1c3NpYW4tZGlzdHJpYnV0ZWQgcmFuZG9tIG51bWJlciBmcm9tIHRoaXMgcmFuZG9tIG51bWJlciBnZW5lcmF0b3Igc2VxdWVuY2UuXHJcbiAgICogVGhlIGRpc3RyaWJ1dGlvbiBvZiB0aGUgcmFuZG9tIG51bWJlcnMgaXMgZ2F1c3NpYW4sIHdpdGggYSBtZWFuID0gMCBhbmQgc3RhbmRhcmQgZGV2aWF0aW9uID0gMVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIG5leHRHYXVzc2lhbigpIHtcclxuICAgIHJldHVybiBVdGlscy5ib3hNdWxsZXJUcmFuc2Zvcm0oIDAsIDEsIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG5leHQgcmFuZG9tIGRvdWJsZSBpbiBhIFJhbmdlLlxyXG4gICAqIEZvciBtaW4gPCBtYXgsIHRoZSByZXR1cm4gdmFsdWUgaXMgW21pbixtYXgpLCBiZXR3ZWVuIG1pbiAoaW5jbHVzaXZlKSBhbmQgbWF4IChleGNsdXNpdmUpLlxyXG4gICAqIEZvciBtaW4gPT09IG1heCwgdGhlIHJldHVybiB2YWx1ZSBpcyBtaW4uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBuZXh0RG91YmxlSW5SYW5nZSggcmFuZ2UgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByYW5nZSBpbnN0YW5jZW9mIFJhbmdlLCAnaW52YWxpZCByYW5nZScgKTtcclxuICAgIGlmICggcmFuZ2UubWluIDwgcmFuZ2UubWF4ICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5uZXh0RG91YmxlQmV0d2VlbiggcmFuZ2UubWluLCByYW5nZS5tYXggKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBiZWNhdXNlIHJhbmRvbS5uZXh0RG91YmxlQmV0d2VlbiByZXF1aXJlcyBtaW4gPCBtYXhcclxuICAgICAgcmV0dXJuIHJhbmdlLm1pbjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgYSByYW5kb20gcG9pbnQgd2l0aGluIHRoZSBwcm92aWRlZCBCb3VuZHMyLCBbbWluLG1heClcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGJvdW5kc1xyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBuZXh0UG9pbnRJbkJvdW5kcyggYm91bmRzICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYm91bmRzIGluc3RhbmNlb2YgQm91bmRzMiwgJ2ludmFsaWQgQm91bmRzMicgKTtcclxuICAgIHJldHVybiBuZXcgVmVjdG9yMihcclxuICAgICAgdGhpcy5uZXh0RG91YmxlQmV0d2VlbiggYm91bmRzLm1pblgsIGJvdW5kcy5tYXhYICksXHJcbiAgICAgIHRoaXMubmV4dERvdWJsZUJldHdlZW4oIGJvdW5kcy5taW5ZLCBib3VuZHMubWF4WSApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfG51bGx9IHNlZWQgLSBpZiBudWxsLCBNYXRoLnJhbmRvbSB3aWxsIGJlIHVzZWQgdG8gY3JlYXRlIHRoZSBzZWVkLlxyXG4gICAqL1xyXG4gIHNldFNlZWQoIHNlZWQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZWVkID09PSBudWxsIHx8IHR5cGVvZiBzZWVkID09PSAnbnVtYmVyJyApO1xyXG5cclxuICAgIGlmICggdHlwZW9mIHNlZWQgPT09ICdudW1iZXInICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBNYXRoLnNlZWRyYW5kb20sICdjYW5ub3Qgc2V0IHNlZWQgd2l0aCAzcmQgcGFydHkgbGlicmFyeSBcIk1hdGguc2VlZHJhbmRvbVwiLicgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBzZWVkID0gTWF0aC5yYW5kb20oKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWQtc2ltLXRleHRcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNlZWQgPSBzZWVkO1xyXG5cclxuICAgIC8vIElmIHNlZWQgaXMgcHJvdmlkZWQsIGNyZWF0ZSBhIGxvY2FsIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yIHdpdGhvdXQgYWx0ZXJpbmcgTWF0aC5yYW5kb20uXHJcbiAgICAvLyBNYXRoLnNlZWRyYW5kb20gaXMgcHJvdmlkZWQgYnkgc2VlZHJhbmRvbS5qcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZpZGJhdS9zZWVkcmFuZG9tLlxyXG4gICAgLy8gQHByaXZhdGUge2Z1bmN0aW9uOm51bWJlcnxudWxsfVxyXG4gICAgdGhpcy5zZWVkcmFuZG9tID0gTWF0aC5zZWVkcmFuZG9tID8gbmV3IE1hdGguc2VlZHJhbmRvbSggYCR7c2VlZH1gICkgOiAoKSA9PiBNYXRoLnJhbmRvbSgpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhZC1zaW0tdGV4dFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hvb3NlIGEgbnVtZXJpYyBpbmRleCBmcm9tIHRoZSBhcnJheSBvZiB3ZWlnaHRzLiAgVGhlIGFycmF5IG9mIHdlaWdodHMgZG9lcyBub3QgbmVlZCB0byBiZSBub3JtYWxpemVkLlxyXG4gICAqIFNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84ODc3MjQ5L2dlbmVyYXRlLXJhbmRvbS1pbnRlZ2Vycy13aXRoLXByb2JhYmlsaXRpZXNcclxuICAgKiBTZWUgYWxzbyBDb250aW51b3VzU2VydmVyLndlaWdodGVkU2FtcGxlVGVzdCB3aGljaCB1c2VzIHRoZSBzYW1lIGFsZ29yaXRobVxyXG4gICAqIEBwYXJhbSB7UmVhZG9ubHlBcnJheTxudW1iZXI+fSB3ZWlnaHRzXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2FtcGxlUHJvYmFiaWxpdGllcyggd2VpZ2h0cyApIHtcclxuICAgIGNvbnN0IHRvdGFsV2VpZ2h0ID0gXy5zdW0oIHdlaWdodHMgKTtcclxuXHJcbiAgICBjb25zdCBjdXRvZmZXZWlnaHQgPSB0b3RhbFdlaWdodCAqIHRoaXMubmV4dERvdWJsZSgpO1xyXG4gICAgbGV0IGN1bXVsYXRpdmVXZWlnaHQgPSAwO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHdlaWdodHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGN1bXVsYXRpdmVXZWlnaHQgKz0gd2VpZ2h0c1sgaSBdO1xyXG4gICAgICBpZiAoIGN1bXVsYXRpdmVXZWlnaHQgPj0gY3V0b2ZmV2VpZ2h0ICkge1xyXG4gICAgICAgIHJldHVybiBpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhlIGZhbGxiYWNrIGlzIHRoZSBsYXN0IHRlc3RcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF3ZWlnaHRzWyB3ZWlnaHRzLmxlbmd0aCAtIDEgXSA9PT0gMCwgJ2lmIGxhc3Qgd2VpZ2h0IGlzIHplcm8sIHNob3VsZCBoYXZlIHNlbGVjdGVkIHNvbWV0aGluZyBiZWZvcmVoYW5kJyApO1xyXG4gICAgcmV0dXJuIHdlaWdodHMubGVuZ3RoIC0gMTtcclxuICB9XHJcbn1cclxuXHJcblJhbmRvbS5hbGxSYW5kb21JbnN0YW5jZXMgPSBuZXcgU2V0KCk7XHJcblJhbmRvbS5pc05vcm1hbGl6ZWQgPSBhcnJheSA9PiB7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggXy5zdW0oIGFycmF5ICkgPT09IDEgKTtcclxufTtcclxuXHJcbmRvdC5yZWdpc3RlciggJ1JhbmRvbScsIFJhbmRvbSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUmFuZG9tOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLGNBQWM7QUFDbEMsT0FBT0MsR0FBRyxNQUFNLFVBQVU7QUFDMUIsT0FBT0MsS0FBSyxNQUFNLFlBQVk7QUFDOUIsT0FBT0MsS0FBSyxNQUFNLFlBQVk7QUFD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