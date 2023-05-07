// Copyright 2020-2021, University of Colorado Boulder

/**
 * CollisionLabUtils is a collection of general utility functions used in this sim.
 *
 * @author Brandon Li
 */

import stepTimer from '../../../axon/js/stepTimer.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import collisionLab from '../collisionLab.js';
import CollisionLabConstants from './CollisionLabConstants.js';
const CollisionLabUtils = {
  /**
   * Iterates through an array in pairs, passing the current value and the previous value to an iterator function.
   * For instance, forEachAdjacentPair( [ 1, 2, 3, 4 ], f ) would invoke f( 2, 1 ), f( 3, 2 ), and f( 4, 3 ).
   * @public
   *
   * @param {*[]} collection
   * @param {function(value:*,previousValue:*)} iterator
   */
  forEachAdjacentPair(collection, iterator) {
    assert && assert(Array.isArray(collection), `invalid collection: ${collection}`);
    assert && assert(typeof iterator === 'function', `invalid iterator: ${iterator}`);
    for (let i = 1; i < collection.length; i++) {
      const value = collection[i];
      const previousValue = collection[i - 1];
      iterator(value, previousValue);
    }
  },
  /**
   * Iterates through an array (or an ObservableArrayDef) for all possible pairs, without duplicating calls. For instance,
   * forEachPossiblePair( [ 1, 2, 3 ], f ) would invoke f( 1 , 2 ), f( 1, 3 ), and f( 2, 3 ), in that order.
   * @public
   *
   * @param {*[]} collection
   * @param {function(value1:*,value2:*)} iterator
   */
  forEachPossiblePair(collection, iterator) {
    assert && assert(Array.isArray(collection), `invalid collection: ${collection}`);
    assert && assert(typeof iterator === 'function', `invalid iterator: ${iterator}`);
    for (let i = 0; i < collection.length - 1; i++) {
      const value1 = collection[i];
      for (let j = i + 1; j < collection.length; j++) {
        const value2 = collection[j];
        assert && assert(value1 !== value2);
        iterator(value1, value2);
      }
    }
  },
  /**
   * Similar to Bounds2.prototype.roundIn(), but instead of rounding in to the nearest whole number, it rounds inwards
   * to the nearest of any multiple.
   *
   * For instance, roundBoundsInToNearest( new Bounds2( -0.28, -0.25, 0.28, 0.25 ), 0.1 )
   * would return Bounds2( -0.2, -0.2, 0.2, 0.2 ).
   * @public
   *
   * @param {Bounds2} bounds - will be mutated!
   * @param {number} multiple - the nearest multiple to round the Bounds in to.
   * @returns {Bounds2}
   */
  roundBoundsInToNearest(bounds, multiple) {
    assert && assert(bounds instanceof Bounds2, `invalid bounds: ${bounds}`);
    assert && assert(typeof multiple === 'number', `invalid multiple: ${multiple}`);
    return bounds.setMinMax(Math.ceil(bounds.minX / multiple) * multiple, Math.ceil(bounds.minY / multiple) * multiple, Math.floor(bounds.maxX / multiple) * multiple, Math.floor(bounds.maxY / multiple) * multiple);
  },
  /**
   * Rounds the magnitude of a Vector2 instance upwards to the nearest of any multiple. For instance,
   * roundUpVectorToNearest( new Vector2( 0.98, 0 ), 0.1 ) would return Vector2( 1, 0 ).
   * @public
   *
   * @param {Vector2} vector - will be mutated!
   * @param {number} multiple - the nearest multiple to round the Bounds in to.
   * @returns {Vector2}
   */
  roundUpVectorToNearest(vector, multiple) {
    assert && assert(vector instanceof Vector2, `invalid vector: ${vector}`);
    assert && assert(typeof multiple === 'number', `invalid multiple: ${multiple}`);
    vector.setPolar(Math.ceil(vector.magnitude / multiple) * multiple, vector.angle);
    if (Utils.equalsEpsilon(vector.y, 0, CollisionLabConstants.ZERO_THRESHOLD)) {
      vector.y = 0;
    }
    return vector;
  },
  /**
   * Rounds the values of a Vector2 instance to the nearest of any multiple. For instance,
   * roundVectorToNearest( new Vector2( 0.28, 0.24 ), 0.1 ) would return Vector2( 0.3, 0.2 ).
   * @public
   *
   * @param {Vector2} vector
   * @param {number} multiple - the nearest multiple to round the Bounds in to.
   * @returns {Vector2}
   */
  roundVectorToNearest(vector, multiple) {
    assert && assert(vector instanceof Vector2, `invalid vector: ${vector}`);
    assert && assert(typeof multiple === 'number', `invalid multiple: ${multiple}`);
    return vector.dividedScalar(multiple).roundSymmetric().multiply(multiple);
  },
  /**
   * Determines whether an array (or an ObservableArrayDef) is strictly sorted in ascending order (non-inclusive) by a criterion
   * function that numerically ranks each element of the array. Each element is passed into the criterion function.
   * @public
   *
   * @param {number[]} array
   * @param {function(value:*):number} criterion
   * @returns {boolean}
   */
  isSorted(array, criterion) {
    assert && assert(Array.isArray(array), `invalid array: ${array}`);
    assert && assert(typeof criterion === 'function', `invalid criterion: ${criterion}`);

    // Flag that indicates if the array is sorted.
    let isSorted = true;
    CollisionLabUtils.forEachAdjacentPair(array.map(criterion), (value, previousValue) => {
      if (isSorted) {
        isSorted = value > previousValue;
      }
    });
    return isSorted;
  },
  /**
   * Gets the extrema of an collection of values that are ranked by some criterion function. 'Extrema' are determined by
   * a comparator function.
   * @public
   *
   * @param {Iterable.<*>} iterable - collection of values.
   * @param {function(value:*):number} criterion - function that numerically ranks each value of the iterable.
   * @param {function(base:number, value:number):number} comparator - Returns -1 if base is more 'extreme' than value,
   *                                                                  0 if base is equally as 'extreme' as value, and
   *                                                                  1 if value is more 'extreme' than value.
   * @returns {*[]} - an array of the extrema extracted from the iterable.
   */
  getExtremaOf(iterable, criterion, comparator) {
    assert && assert(typeof iterable[Symbol.iterator] === 'function', `invalid iterable: ${iterable}`);
    assert && assert(typeof criterion === 'function', `invalid criterion: ${criterion}`);
    assert && assert(typeof comparator === 'function', `invalid comparator: ${comparator}`);
    const iterator = iterable[Symbol.iterator]();
    let extrema = [iterator.next().value];
    for (const item of iterator) {
      const comparison = comparator(criterion(extrema[0]), criterion(item));
      if (comparison === -1) {
        extrema = [item];
      } else if (comparison === 0) {
        extrema.push(item);
      }
    }
    return extrema;
  },
  /**
   * Gets the minimum value(s) of a collection of values that are ranked by some criterion function. For instance,
   * getMinValuesOf( [ 1, 1, 2, 3, 4, 1 ], _.identity ) returns Set( [ 1, 1, 1 ] ).
   * @public
   *
   * @param {Iterable.<*>} iterable - collection of values
   * @param {function(value:*):number} criterion
   * @returns {*[]} - an array of the minimum value(s).
   */
  getMinValuesOf(iterable, criterion) {
    assert && assert(typeof iterable[Symbol.iterator] === 'function', `invalid iterable: ${iterable}`);
    assert && assert(typeof criterion === 'function', `invalid criterion: ${criterion}`);
    return CollisionLabUtils.getExtremaOf(iterable, criterion, (base, value) => Math.sign(value - base));
  },
  /**
   * Gets the maximum value(s) of a collection of values that are ranked by some criterion function. For instance,
   * getMaxValuesOf( [ 1, 2, 3, 3, 4, 4 ], _.identity ) returns Set( [ 4, 4 ] ).
   * @public
   *
   * @param {Iterable.<*>} iterable - collection of values
   * @param {function(value:*):number} criterion
   * @returns {*[]} - an array of the maximum value(s).
   */
  getMaxValuesOf(iterable, criterion) {
    assert && assert(typeof iterable[Symbol.iterator] === 'function', `invalid iterable: ${iterable}`);
    assert && assert(typeof criterion === 'function', `invalid criterion: ${criterion}`);
    return CollisionLabUtils.getExtremaOf(iterable, criterion, (base, value) => Math.sign(base - value));
  },
  /**
   * Checks if a predicate returns truthy for any element of a collection. Like _.some but works for any iterable.
   * Iteration is stopped once predicate returns truthy.
   * @public
   *
   * @param {Iterable.<*>} iterable - collection of values.
   * @param {function(value:*):boolean} predicate
   * @returns {boolean}
   */
  any(iterable, predicate) {
    assert && assert(typeof iterable[Symbol.iterator] === 'function', `invalid iterable: ${iterable}`);
    assert && assert(typeof predicate === 'function', `invalid predicate: ${predicate}`);
    for (const value of iterable) {
      if (predicate(value)) {
        return true;
      }
    }
    return false;
  },
  /**
   * Iterates over a collection, returning an array of all the elements that a predicate function returns truthy for.
   * Like _.filter but works for any iterable.
   * @public
   *
   * @param {Iterable.<*>} iterable - collection of values.
   * @param {function(value:*):boolean} predicate
   * @returns {*[]}
   */
  filter(iterable, predicate) {
    assert && assert(typeof iterable[Symbol.iterator] === 'function', `invalid iterable: ${iterable}`);
    assert && assert(typeof predicate === 'function', `invalid predicate: ${predicate}`);
    const result = [];
    for (const value of iterable) {
      if (predicate(value)) {
        result.push(value);
      }
    }
    return result;
  },
  /**
   * Finds the root of some function, f, in some interval [min, max], using the bisection method. If maxIterations is
   * reached, the midpoint is returned. See https://en.wikipedia.org/wiki/Bisection_method. This method differs in that
   * the function provided isn't the polynomial itself, but rather indicates if some input is an over or under estimate.
   * @public
   *
   * @param {function(value:*):number} f - Returns -1 if the value input is an underestimate,
   *                                                0 if the value input is considered 'close enough'
   *                                                1 if the value input is an overestimate.
   * @param {number} min - min value of the interval to check.
   * @param {number} max - max value of the interval to check.
   * @param {number} [maxIterations] - the midpoint is returned after this many iterations.
   * @returns {number}
   */
  bisection(f, min, max, maxIterations = 100) {
    assert && assert(typeof f === 'function', `invalid f: ${f}`);
    assert && assert(typeof min === 'number', `invalid min: ${min}`);
    assert && assert(typeof max === 'number', `invalid max: ${max}`);
    assert && assert(typeof maxIterations === 'number', `invalid maxIterations: ${maxIterations}`);
    for (let i = 0; i < maxIterations; i++) {
      // Get the new midpoint of the interval.
      const midpoint = (min + max) / 2;

      // Get the result of f at the midpoint.
      const result = f(midpoint);
      if (result === 1) {
        max = midpoint;
      } else if (result === 0) {
        return midpoint;
      } else {
        min = midpoint;
      }
    }

    // At this point, maxIterations was reached, so return the midpoint.
    return (min + max) / 2;
  },
  /**
   * Returns the original value if is larger than the passed-in threshold. If it is less than the threshold (in absolute
   * value), than original value is rounded down to 0.
   * @public
   *
   * @param {number} value
   * @param {number} threshold
   * @returns {Promise}
   */
  clampDown(value, threshold = CollisionLabConstants.ZERO_THRESHOLD) {
    assert && assert(typeof value === 'number', `invalid value: ${value}`);
    assert && assert(typeof threshold === 'number', `invalid threshold: ${threshold}`);
    return Math.abs(value) < threshold ? 0 : value;
  },
  /**
   * A javascript version of the sleep function. This is **ONLY to be used for debugging**, and assertions must be
   * enabled for use. This was mostly used to debug CollisionEngine with large time steps. In this case, it should be
   * used in-conjunction with the step button to allow the javascript event loop to return before the next step.
   * @public
   *
   * @param {number} time - in seconds.
   * @returns {Promise}
   */
  sleep(time) {
    if (assert) {
      return new Promise(resolve => stepTimer.setTimeout(resolve, time * 1000));
    } else {
      throw new Error('CollisionLabUtils.sleep must be used with assertions on');
    }
  }
};
collisionLab.register('CollisionLabUtils', CollisionLabUtils);
export default CollisionLabUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzdGVwVGltZXIiLCJCb3VuZHMyIiwiVXRpbHMiLCJWZWN0b3IyIiwiY29sbGlzaW9uTGFiIiwiQ29sbGlzaW9uTGFiQ29uc3RhbnRzIiwiQ29sbGlzaW9uTGFiVXRpbHMiLCJmb3JFYWNoQWRqYWNlbnRQYWlyIiwiY29sbGVjdGlvbiIsIml0ZXJhdG9yIiwiYXNzZXJ0IiwiQXJyYXkiLCJpc0FycmF5IiwiaSIsImxlbmd0aCIsInZhbHVlIiwicHJldmlvdXNWYWx1ZSIsImZvckVhY2hQb3NzaWJsZVBhaXIiLCJ2YWx1ZTEiLCJqIiwidmFsdWUyIiwicm91bmRCb3VuZHNJblRvTmVhcmVzdCIsImJvdW5kcyIsIm11bHRpcGxlIiwic2V0TWluTWF4IiwiTWF0aCIsImNlaWwiLCJtaW5YIiwibWluWSIsImZsb29yIiwibWF4WCIsIm1heFkiLCJyb3VuZFVwVmVjdG9yVG9OZWFyZXN0IiwidmVjdG9yIiwic2V0UG9sYXIiLCJtYWduaXR1ZGUiLCJhbmdsZSIsImVxdWFsc0Vwc2lsb24iLCJ5IiwiWkVST19USFJFU0hPTEQiLCJyb3VuZFZlY3RvclRvTmVhcmVzdCIsImRpdmlkZWRTY2FsYXIiLCJyb3VuZFN5bW1ldHJpYyIsIm11bHRpcGx5IiwiaXNTb3J0ZWQiLCJhcnJheSIsImNyaXRlcmlvbiIsIm1hcCIsImdldEV4dHJlbWFPZiIsIml0ZXJhYmxlIiwiY29tcGFyYXRvciIsIlN5bWJvbCIsImV4dHJlbWEiLCJuZXh0IiwiaXRlbSIsImNvbXBhcmlzb24iLCJwdXNoIiwiZ2V0TWluVmFsdWVzT2YiLCJiYXNlIiwic2lnbiIsImdldE1heFZhbHVlc09mIiwiYW55IiwicHJlZGljYXRlIiwiZmlsdGVyIiwicmVzdWx0IiwiYmlzZWN0aW9uIiwiZiIsIm1pbiIsIm1heCIsIm1heEl0ZXJhdGlvbnMiLCJtaWRwb2ludCIsImNsYW1wRG93biIsInRocmVzaG9sZCIsImFicyIsInNsZWVwIiwidGltZSIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsIkVycm9yIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb2xsaXNpb25MYWJVdGlscy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb2xsaXNpb25MYWJVdGlscyBpcyBhIGNvbGxlY3Rpb24gb2YgZ2VuZXJhbCB1dGlsaXR5IGZ1bmN0aW9ucyB1c2VkIGluIHRoaXMgc2ltLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEJyYW5kb24gTGlcclxuICovXHJcblxyXG5pbXBvcnQgc3RlcFRpbWVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvc3RlcFRpbWVyLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgY29sbGlzaW9uTGFiIGZyb20gJy4uL2NvbGxpc2lvbkxhYi5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJDb25zdGFudHMgZnJvbSAnLi9Db2xsaXNpb25MYWJDb25zdGFudHMuanMnO1xyXG5cclxuY29uc3QgQ29sbGlzaW9uTGFiVXRpbHMgPSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEl0ZXJhdGVzIHRocm91Z2ggYW4gYXJyYXkgaW4gcGFpcnMsIHBhc3NpbmcgdGhlIGN1cnJlbnQgdmFsdWUgYW5kIHRoZSBwcmV2aW91cyB2YWx1ZSB0byBhbiBpdGVyYXRvciBmdW5jdGlvbi5cclxuICAgKiBGb3IgaW5zdGFuY2UsIGZvckVhY2hBZGphY2VudFBhaXIoIFsgMSwgMiwgMywgNCBdLCBmICkgd291bGQgaW52b2tlIGYoIDIsIDEgKSwgZiggMywgMiApLCBhbmQgZiggNCwgMyApLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7KltdfSBjb2xsZWN0aW9uXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbih2YWx1ZToqLHByZXZpb3VzVmFsdWU6Kil9IGl0ZXJhdG9yXHJcbiAgICovXHJcbiAgZm9yRWFjaEFkamFjZW50UGFpciggY29sbGVjdGlvbiwgaXRlcmF0b3IgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBjb2xsZWN0aW9uICksIGBpbnZhbGlkIGNvbGxlY3Rpb246ICR7Y29sbGVjdGlvbn1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgaXRlcmF0b3IgPT09ICdmdW5jdGlvbicsIGBpbnZhbGlkIGl0ZXJhdG9yOiAke2l0ZXJhdG9yfWAgKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBjb2xsZWN0aW9uLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCB2YWx1ZSA9IGNvbGxlY3Rpb25bIGkgXTtcclxuICAgICAgY29uc3QgcHJldmlvdXNWYWx1ZSA9IGNvbGxlY3Rpb25bIGkgLSAxIF07XHJcblxyXG4gICAgICBpdGVyYXRvciggdmFsdWUsIHByZXZpb3VzVmFsdWUgKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBJdGVyYXRlcyB0aHJvdWdoIGFuIGFycmF5IChvciBhbiBPYnNlcnZhYmxlQXJyYXlEZWYpIGZvciBhbGwgcG9zc2libGUgcGFpcnMsIHdpdGhvdXQgZHVwbGljYXRpbmcgY2FsbHMuIEZvciBpbnN0YW5jZSxcclxuICAgKiBmb3JFYWNoUG9zc2libGVQYWlyKCBbIDEsIDIsIDMgXSwgZiApIHdvdWxkIGludm9rZSBmKCAxICwgMiApLCBmKCAxLCAzICksIGFuZCBmKCAyLCAzICksIGluIHRoYXQgb3JkZXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHsqW119IGNvbGxlY3Rpb25cclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKHZhbHVlMToqLHZhbHVlMjoqKX0gaXRlcmF0b3JcclxuICAgKi9cclxuICBmb3JFYWNoUG9zc2libGVQYWlyKCBjb2xsZWN0aW9uLCBpdGVyYXRvciApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGNvbGxlY3Rpb24gKSwgYGludmFsaWQgY29sbGVjdGlvbjogJHtjb2xsZWN0aW9ufWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBpdGVyYXRvciA9PT0gJ2Z1bmN0aW9uJywgYGludmFsaWQgaXRlcmF0b3I6ICR7aXRlcmF0b3J9YCApO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNvbGxlY3Rpb24ubGVuZ3RoIC0gMTsgaSsrICkge1xyXG4gICAgICBjb25zdCB2YWx1ZTEgPSBjb2xsZWN0aW9uWyBpIF07XHJcblxyXG4gICAgICBmb3IgKCBsZXQgaiA9IGkgKyAxOyBqIDwgY29sbGVjdGlvbi5sZW5ndGg7IGorKyApIHtcclxuXHJcbiAgICAgICAgY29uc3QgdmFsdWUyID0gY29sbGVjdGlvblsgaiBdO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhbHVlMSAhPT0gdmFsdWUyICk7XHJcblxyXG4gICAgICAgIGl0ZXJhdG9yKCB2YWx1ZTEsIHZhbHVlMiApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogU2ltaWxhciB0byBCb3VuZHMyLnByb3RvdHlwZS5yb3VuZEluKCksIGJ1dCBpbnN0ZWFkIG9mIHJvdW5kaW5nIGluIHRvIHRoZSBuZWFyZXN0IHdob2xlIG51bWJlciwgaXQgcm91bmRzIGlud2FyZHNcclxuICAgKiB0byB0aGUgbmVhcmVzdCBvZiBhbnkgbXVsdGlwbGUuXHJcbiAgICpcclxuICAgKiBGb3IgaW5zdGFuY2UsIHJvdW5kQm91bmRzSW5Ub05lYXJlc3QoIG5ldyBCb3VuZHMyKCAtMC4yOCwgLTAuMjUsIDAuMjgsIDAuMjUgKSwgMC4xIClcclxuICAgKiB3b3VsZCByZXR1cm4gQm91bmRzMiggLTAuMiwgLTAuMiwgMC4yLCAwLjIgKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGJvdW5kcyAtIHdpbGwgYmUgbXV0YXRlZCFcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbXVsdGlwbGUgLSB0aGUgbmVhcmVzdCBtdWx0aXBsZSB0byByb3VuZCB0aGUgQm91bmRzIGluIHRvLlxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMyfVxyXG4gICAqL1xyXG4gIHJvdW5kQm91bmRzSW5Ub05lYXJlc3QoIGJvdW5kcywgbXVsdGlwbGUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBib3VuZHMgaW5zdGFuY2VvZiBCb3VuZHMyLCBgaW52YWxpZCBib3VuZHM6ICR7Ym91bmRzfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBtdWx0aXBsZSA9PT0gJ251bWJlcicsIGBpbnZhbGlkIG11bHRpcGxlOiAke211bHRpcGxlfWAgKTtcclxuXHJcbiAgICByZXR1cm4gYm91bmRzLnNldE1pbk1heChcclxuICAgICAgTWF0aC5jZWlsKCBib3VuZHMubWluWCAvIG11bHRpcGxlICkgKiBtdWx0aXBsZSxcclxuICAgICAgTWF0aC5jZWlsKCBib3VuZHMubWluWSAvIG11bHRpcGxlICkgKiBtdWx0aXBsZSxcclxuICAgICAgTWF0aC5mbG9vciggYm91bmRzLm1heFggLyBtdWx0aXBsZSApICogbXVsdGlwbGUsXHJcbiAgICAgIE1hdGguZmxvb3IoIGJvdW5kcy5tYXhZIC8gbXVsdGlwbGUgKSAqIG11bHRpcGxlXHJcbiAgICApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJvdW5kcyB0aGUgbWFnbml0dWRlIG9mIGEgVmVjdG9yMiBpbnN0YW5jZSB1cHdhcmRzIHRvIHRoZSBuZWFyZXN0IG9mIGFueSBtdWx0aXBsZS4gRm9yIGluc3RhbmNlLFxyXG4gICAqIHJvdW5kVXBWZWN0b3JUb05lYXJlc3QoIG5ldyBWZWN0b3IyKCAwLjk4LCAwICksIDAuMSApIHdvdWxkIHJldHVybiBWZWN0b3IyKCAxLCAwICkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSB2ZWN0b3IgLSB3aWxsIGJlIG11dGF0ZWQhXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG11bHRpcGxlIC0gdGhlIG5lYXJlc3QgbXVsdGlwbGUgdG8gcm91bmQgdGhlIEJvdW5kcyBpbiB0by5cclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKi9cclxuICByb3VuZFVwVmVjdG9yVG9OZWFyZXN0KCB2ZWN0b3IsIG11bHRpcGxlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmVjdG9yIGluc3RhbmNlb2YgVmVjdG9yMiwgYGludmFsaWQgdmVjdG9yOiAke3ZlY3Rvcn1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbXVsdGlwbGUgPT09ICdudW1iZXInLCBgaW52YWxpZCBtdWx0aXBsZTogJHttdWx0aXBsZX1gICk7XHJcblxyXG4gICAgdmVjdG9yLnNldFBvbGFyKCBNYXRoLmNlaWwoIHZlY3Rvci5tYWduaXR1ZGUgLyBtdWx0aXBsZSApICogbXVsdGlwbGUsIHZlY3Rvci5hbmdsZSApO1xyXG5cclxuICAgIGlmICggVXRpbHMuZXF1YWxzRXBzaWxvbiggdmVjdG9yLnksIDAsIENvbGxpc2lvbkxhYkNvbnN0YW50cy5aRVJPX1RIUkVTSE9MRCApICkgeyB2ZWN0b3IueSA9IDA7IH1cclxuICAgIHJldHVybiB2ZWN0b3I7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUm91bmRzIHRoZSB2YWx1ZXMgb2YgYSBWZWN0b3IyIGluc3RhbmNlIHRvIHRoZSBuZWFyZXN0IG9mIGFueSBtdWx0aXBsZS4gRm9yIGluc3RhbmNlLFxyXG4gICAqIHJvdW5kVmVjdG9yVG9OZWFyZXN0KCBuZXcgVmVjdG9yMiggMC4yOCwgMC4yNCApLCAwLjEgKSB3b3VsZCByZXR1cm4gVmVjdG9yMiggMC4zLCAwLjIgKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHZlY3RvclxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtdWx0aXBsZSAtIHRoZSBuZWFyZXN0IG11bHRpcGxlIHRvIHJvdW5kIHRoZSBCb3VuZHMgaW4gdG8uXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICovXHJcbiAgcm91bmRWZWN0b3JUb05lYXJlc3QoIHZlY3RvciwgbXVsdGlwbGUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZWN0b3IgaW5zdGFuY2VvZiBWZWN0b3IyLCBgaW52YWxpZCB2ZWN0b3I6ICR7dmVjdG9yfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBtdWx0aXBsZSA9PT0gJ251bWJlcicsIGBpbnZhbGlkIG11bHRpcGxlOiAke211bHRpcGxlfWAgKTtcclxuXHJcbiAgICByZXR1cm4gdmVjdG9yLmRpdmlkZWRTY2FsYXIoIG11bHRpcGxlICkucm91bmRTeW1tZXRyaWMoKS5tdWx0aXBseSggbXVsdGlwbGUgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYW4gYXJyYXkgKG9yIGFuIE9ic2VydmFibGVBcnJheURlZikgaXMgc3RyaWN0bHkgc29ydGVkIGluIGFzY2VuZGluZyBvcmRlciAobm9uLWluY2x1c2l2ZSkgYnkgYSBjcml0ZXJpb25cclxuICAgKiBmdW5jdGlvbiB0aGF0IG51bWVyaWNhbGx5IHJhbmtzIGVhY2ggZWxlbWVudCBvZiB0aGUgYXJyYXkuIEVhY2ggZWxlbWVudCBpcyBwYXNzZWQgaW50byB0aGUgY3JpdGVyaW9uIGZ1bmN0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyW119IGFycmF5XHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbih2YWx1ZToqKTpudW1iZXJ9IGNyaXRlcmlvblxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzU29ydGVkKCBhcnJheSwgY3JpdGVyaW9uICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggYXJyYXkgKSwgYGludmFsaWQgYXJyYXk6ICR7YXJyYXl9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNyaXRlcmlvbiA9PT0gJ2Z1bmN0aW9uJywgYGludmFsaWQgY3JpdGVyaW9uOiAke2NyaXRlcmlvbn1gICk7XHJcblxyXG4gICAgLy8gRmxhZyB0aGF0IGluZGljYXRlcyBpZiB0aGUgYXJyYXkgaXMgc29ydGVkLlxyXG4gICAgbGV0IGlzU29ydGVkID0gdHJ1ZTtcclxuXHJcbiAgICBDb2xsaXNpb25MYWJVdGlscy5mb3JFYWNoQWRqYWNlbnRQYWlyKCBhcnJheS5tYXAoIGNyaXRlcmlvbiApLCAoIHZhbHVlLCBwcmV2aW91c1ZhbHVlICkgPT4ge1xyXG4gICAgICBpZiAoIGlzU29ydGVkICkge1xyXG4gICAgICAgIGlzU29ydGVkID0gKCB2YWx1ZSA+IHByZXZpb3VzVmFsdWUgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIGlzU29ydGVkO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGV4dHJlbWEgb2YgYW4gY29sbGVjdGlvbiBvZiB2YWx1ZXMgdGhhdCBhcmUgcmFua2VkIGJ5IHNvbWUgY3JpdGVyaW9uIGZ1bmN0aW9uLiAnRXh0cmVtYScgYXJlIGRldGVybWluZWQgYnlcclxuICAgKiBhIGNvbXBhcmF0b3IgZnVuY3Rpb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtJdGVyYWJsZS48Kj59IGl0ZXJhYmxlIC0gY29sbGVjdGlvbiBvZiB2YWx1ZXMuXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbih2YWx1ZToqKTpudW1iZXJ9IGNyaXRlcmlvbiAtIGZ1bmN0aW9uIHRoYXQgbnVtZXJpY2FsbHkgcmFua3MgZWFjaCB2YWx1ZSBvZiB0aGUgaXRlcmFibGUuXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbihiYXNlOm51bWJlciwgdmFsdWU6bnVtYmVyKTpudW1iZXJ9IGNvbXBhcmF0b3IgLSBSZXR1cm5zIC0xIGlmIGJhc2UgaXMgbW9yZSAnZXh0cmVtZScgdGhhbiB2YWx1ZSxcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAgaWYgYmFzZSBpcyBlcXVhbGx5IGFzICdleHRyZW1lJyBhcyB2YWx1ZSwgYW5kXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAxIGlmIHZhbHVlIGlzIG1vcmUgJ2V4dHJlbWUnIHRoYW4gdmFsdWUuXHJcbiAgICogQHJldHVybnMgeypbXX0gLSBhbiBhcnJheSBvZiB0aGUgZXh0cmVtYSBleHRyYWN0ZWQgZnJvbSB0aGUgaXRlcmFibGUuXHJcbiAgICovXHJcbiAgZ2V0RXh0cmVtYU9mKCBpdGVyYWJsZSwgY3JpdGVyaW9uLCBjb21wYXJhdG9yICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGl0ZXJhYmxlWyBTeW1ib2wuaXRlcmF0b3IgXSA9PT0gJ2Z1bmN0aW9uJywgYGludmFsaWQgaXRlcmFibGU6ICR7aXRlcmFibGV9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNyaXRlcmlvbiA9PT0gJ2Z1bmN0aW9uJywgYGludmFsaWQgY3JpdGVyaW9uOiAke2NyaXRlcmlvbn1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgY29tcGFyYXRvciA9PT0gJ2Z1bmN0aW9uJywgYGludmFsaWQgY29tcGFyYXRvcjogJHtjb21wYXJhdG9yfWAgKTtcclxuICAgIGNvbnN0IGl0ZXJhdG9yID0gaXRlcmFibGVbIFN5bWJvbC5pdGVyYXRvciBdKCk7XHJcblxyXG4gICAgbGV0IGV4dHJlbWEgPSBbIGl0ZXJhdG9yLm5leHQoKS52YWx1ZSBdO1xyXG5cclxuICAgIGZvciAoIGNvbnN0IGl0ZW0gb2YgaXRlcmF0b3IgKSB7XHJcbiAgICAgIGNvbnN0IGNvbXBhcmlzb24gPSBjb21wYXJhdG9yKCBjcml0ZXJpb24oIGV4dHJlbWFbIDAgXSApLCBjcml0ZXJpb24oIGl0ZW0gKSApO1xyXG4gICAgICBpZiAoIGNvbXBhcmlzb24gPT09IC0xICkge1xyXG4gICAgICAgIGV4dHJlbWEgPSBbIGl0ZW0gXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggY29tcGFyaXNvbiA9PT0gMCApIHtcclxuICAgICAgICBleHRyZW1hLnB1c2goIGl0ZW0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBleHRyZW1hO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG1pbmltdW0gdmFsdWUocykgb2YgYSBjb2xsZWN0aW9uIG9mIHZhbHVlcyB0aGF0IGFyZSByYW5rZWQgYnkgc29tZSBjcml0ZXJpb24gZnVuY3Rpb24uIEZvciBpbnN0YW5jZSxcclxuICAgKiBnZXRNaW5WYWx1ZXNPZiggWyAxLCAxLCAyLCAzLCA0LCAxIF0sIF8uaWRlbnRpdHkgKSByZXR1cm5zIFNldCggWyAxLCAxLCAxIF0gKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0l0ZXJhYmxlLjwqPn0gaXRlcmFibGUgLSBjb2xsZWN0aW9uIG9mIHZhbHVlc1xyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24odmFsdWU6Kik6bnVtYmVyfSBjcml0ZXJpb25cclxuICAgKiBAcmV0dXJucyB7KltdfSAtIGFuIGFycmF5IG9mIHRoZSBtaW5pbXVtIHZhbHVlKHMpLlxyXG4gICAqL1xyXG4gIGdldE1pblZhbHVlc09mKCBpdGVyYWJsZSwgY3JpdGVyaW9uICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGl0ZXJhYmxlWyBTeW1ib2wuaXRlcmF0b3IgXSA9PT0gJ2Z1bmN0aW9uJywgYGludmFsaWQgaXRlcmFibGU6ICR7aXRlcmFibGV9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNyaXRlcmlvbiA9PT0gJ2Z1bmN0aW9uJywgYGludmFsaWQgY3JpdGVyaW9uOiAke2NyaXRlcmlvbn1gICk7XHJcblxyXG4gICAgcmV0dXJuIENvbGxpc2lvbkxhYlV0aWxzLmdldEV4dHJlbWFPZiggaXRlcmFibGUsIGNyaXRlcmlvbiwgKCBiYXNlLCB2YWx1ZSApID0+IE1hdGguc2lnbiggdmFsdWUgLSBiYXNlICkgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBtYXhpbXVtIHZhbHVlKHMpIG9mIGEgY29sbGVjdGlvbiBvZiB2YWx1ZXMgdGhhdCBhcmUgcmFua2VkIGJ5IHNvbWUgY3JpdGVyaW9uIGZ1bmN0aW9uLiBGb3IgaW5zdGFuY2UsXHJcbiAgICogZ2V0TWF4VmFsdWVzT2YoIFsgMSwgMiwgMywgMywgNCwgNCBdLCBfLmlkZW50aXR5ICkgcmV0dXJucyBTZXQoIFsgNCwgNCBdICkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtJdGVyYWJsZS48Kj59IGl0ZXJhYmxlIC0gY29sbGVjdGlvbiBvZiB2YWx1ZXNcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKHZhbHVlOiopOm51bWJlcn0gY3JpdGVyaW9uXHJcbiAgICogQHJldHVybnMgeypbXX0gLSBhbiBhcnJheSBvZiB0aGUgbWF4aW11bSB2YWx1ZShzKS5cclxuICAgKi9cclxuICBnZXRNYXhWYWx1ZXNPZiggaXRlcmFibGUsIGNyaXRlcmlvbiApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBpdGVyYWJsZVsgU3ltYm9sLml0ZXJhdG9yIF0gPT09ICdmdW5jdGlvbicsIGBpbnZhbGlkIGl0ZXJhYmxlOiAke2l0ZXJhYmxlfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBjcml0ZXJpb24gPT09ICdmdW5jdGlvbicsIGBpbnZhbGlkIGNyaXRlcmlvbjogJHtjcml0ZXJpb259YCApO1xyXG5cclxuICAgIHJldHVybiBDb2xsaXNpb25MYWJVdGlscy5nZXRFeHRyZW1hT2YoIGl0ZXJhYmxlLCBjcml0ZXJpb24sICggYmFzZSwgdmFsdWUgKSA9PiBNYXRoLnNpZ24oIGJhc2UgLSB2YWx1ZSApICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIGlmIGEgcHJlZGljYXRlIHJldHVybnMgdHJ1dGh5IGZvciBhbnkgZWxlbWVudCBvZiBhIGNvbGxlY3Rpb24uIExpa2UgXy5zb21lIGJ1dCB3b3JrcyBmb3IgYW55IGl0ZXJhYmxlLlxyXG4gICAqIEl0ZXJhdGlvbiBpcyBzdG9wcGVkIG9uY2UgcHJlZGljYXRlIHJldHVybnMgdHJ1dGh5LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7SXRlcmFibGUuPCo+fSBpdGVyYWJsZSAtIGNvbGxlY3Rpb24gb2YgdmFsdWVzLlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24odmFsdWU6Kik6Ym9vbGVhbn0gcHJlZGljYXRlXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgYW55KCBpdGVyYWJsZSwgcHJlZGljYXRlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGl0ZXJhYmxlWyBTeW1ib2wuaXRlcmF0b3IgXSA9PT0gJ2Z1bmN0aW9uJywgYGludmFsaWQgaXRlcmFibGU6ICR7aXRlcmFibGV9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHByZWRpY2F0ZSA9PT0gJ2Z1bmN0aW9uJywgYGludmFsaWQgcHJlZGljYXRlOiAke3ByZWRpY2F0ZX1gICk7XHJcblxyXG4gICAgZm9yICggY29uc3QgdmFsdWUgb2YgaXRlcmFibGUgKSB7XHJcbiAgICAgIGlmICggcHJlZGljYXRlKCB2YWx1ZSApICkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogSXRlcmF0ZXMgb3ZlciBhIGNvbGxlY3Rpb24sIHJldHVybmluZyBhbiBhcnJheSBvZiBhbGwgdGhlIGVsZW1lbnRzIHRoYXQgYSBwcmVkaWNhdGUgZnVuY3Rpb24gcmV0dXJucyB0cnV0aHkgZm9yLlxyXG4gICAqIExpa2UgXy5maWx0ZXIgYnV0IHdvcmtzIGZvciBhbnkgaXRlcmFibGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtJdGVyYWJsZS48Kj59IGl0ZXJhYmxlIC0gY29sbGVjdGlvbiBvZiB2YWx1ZXMuXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbih2YWx1ZToqKTpib29sZWFufSBwcmVkaWNhdGVcclxuICAgKiBAcmV0dXJucyB7KltdfVxyXG4gICAqL1xyXG4gIGZpbHRlciggaXRlcmFibGUsIHByZWRpY2F0ZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBpdGVyYWJsZVsgU3ltYm9sLml0ZXJhdG9yIF0gPT09ICdmdW5jdGlvbicsIGBpbnZhbGlkIGl0ZXJhYmxlOiAke2l0ZXJhYmxlfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBwcmVkaWNhdGUgPT09ICdmdW5jdGlvbicsIGBpbnZhbGlkIHByZWRpY2F0ZTogJHtwcmVkaWNhdGV9YCApO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gW107XHJcblxyXG4gICAgZm9yICggY29uc3QgdmFsdWUgb2YgaXRlcmFibGUgKSB7XHJcbiAgICAgIGlmICggcHJlZGljYXRlKCB2YWx1ZSApICkge1xyXG4gICAgICAgIHJlc3VsdC5wdXNoKCB2YWx1ZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmRzIHRoZSByb290IG9mIHNvbWUgZnVuY3Rpb24sIGYsIGluIHNvbWUgaW50ZXJ2YWwgW21pbiwgbWF4XSwgdXNpbmcgdGhlIGJpc2VjdGlvbiBtZXRob2QuIElmIG1heEl0ZXJhdGlvbnMgaXNcclxuICAgKiByZWFjaGVkLCB0aGUgbWlkcG9pbnQgaXMgcmV0dXJuZWQuIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CaXNlY3Rpb25fbWV0aG9kLiBUaGlzIG1ldGhvZCBkaWZmZXJzIGluIHRoYXRcclxuICAgKiB0aGUgZnVuY3Rpb24gcHJvdmlkZWQgaXNuJ3QgdGhlIHBvbHlub21pYWwgaXRzZWxmLCBidXQgcmF0aGVyIGluZGljYXRlcyBpZiBzb21lIGlucHV0IGlzIGFuIG92ZXIgb3IgdW5kZXIgZXN0aW1hdGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbih2YWx1ZToqKTpudW1iZXJ9IGYgLSBSZXR1cm5zIC0xIGlmIHRoZSB2YWx1ZSBpbnB1dCBpcyBhbiB1bmRlcmVzdGltYXRlLFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMCBpZiB0aGUgdmFsdWUgaW5wdXQgaXMgY29uc2lkZXJlZCAnY2xvc2UgZW5vdWdoJ1xyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMSBpZiB0aGUgdmFsdWUgaW5wdXQgaXMgYW4gb3ZlcmVzdGltYXRlLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gLSBtaW4gdmFsdWUgb2YgdGhlIGludGVydmFsIHRvIGNoZWNrLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggLSBtYXggdmFsdWUgb2YgdGhlIGludGVydmFsIHRvIGNoZWNrLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbbWF4SXRlcmF0aW9uc10gLSB0aGUgbWlkcG9pbnQgaXMgcmV0dXJuZWQgYWZ0ZXIgdGhpcyBtYW55IGl0ZXJhdGlvbnMuXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBiaXNlY3Rpb24oIGYsIG1pbiwgbWF4LCBtYXhJdGVyYXRpb25zID0gMTAwICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGYgPT09ICdmdW5jdGlvbicsIGBpbnZhbGlkIGY6ICR7Zn1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbWluID09PSAnbnVtYmVyJywgYGludmFsaWQgbWluOiAke21pbn1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbWF4ID09PSAnbnVtYmVyJywgYGludmFsaWQgbWF4OiAke21heH1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbWF4SXRlcmF0aW9ucyA9PT0gJ251bWJlcicsIGBpbnZhbGlkIG1heEl0ZXJhdGlvbnM6ICR7bWF4SXRlcmF0aW9uc31gICk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbWF4SXRlcmF0aW9uczsgaSsrICkge1xyXG5cclxuICAgICAgLy8gR2V0IHRoZSBuZXcgbWlkcG9pbnQgb2YgdGhlIGludGVydmFsLlxyXG4gICAgICBjb25zdCBtaWRwb2ludCA9ICggbWluICsgbWF4ICkgLyAyO1xyXG5cclxuICAgICAgLy8gR2V0IHRoZSByZXN1bHQgb2YgZiBhdCB0aGUgbWlkcG9pbnQuXHJcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGYoIG1pZHBvaW50ICk7XHJcblxyXG4gICAgICBpZiAoIHJlc3VsdCA9PT0gMSApIHtcclxuICAgICAgICBtYXggPSBtaWRwb2ludDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggcmVzdWx0ID09PSAwICkge1xyXG4gICAgICAgIHJldHVybiBtaWRwb2ludDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBtaW4gPSBtaWRwb2ludDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEF0IHRoaXMgcG9pbnQsIG1heEl0ZXJhdGlvbnMgd2FzIHJlYWNoZWQsIHNvIHJldHVybiB0aGUgbWlkcG9pbnQuXHJcbiAgICByZXR1cm4gKCBtaW4gKyBtYXggKSAvIDI7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgb3JpZ2luYWwgdmFsdWUgaWYgaXMgbGFyZ2VyIHRoYW4gdGhlIHBhc3NlZC1pbiB0aHJlc2hvbGQuIElmIGl0IGlzIGxlc3MgdGhhbiB0aGUgdGhyZXNob2xkIChpbiBhYnNvbHV0ZVxyXG4gICAqIHZhbHVlKSwgdGhhbiBvcmlnaW5hbCB2YWx1ZSBpcyByb3VuZGVkIGRvd24gdG8gMC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdGhyZXNob2xkXHJcbiAgICogQHJldHVybnMge1Byb21pc2V9XHJcbiAgICovXHJcbiAgY2xhbXBEb3duKCB2YWx1ZSwgdGhyZXNob2xkID0gQ29sbGlzaW9uTGFiQ29uc3RhbnRzLlpFUk9fVEhSRVNIT0xEICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgYGludmFsaWQgdmFsdWU6ICR7dmFsdWV9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRocmVzaG9sZCA9PT0gJ251bWJlcicsIGBpbnZhbGlkIHRocmVzaG9sZDogJHt0aHJlc2hvbGR9YCApO1xyXG5cclxuICAgIHJldHVybiBNYXRoLmFicyggdmFsdWUgKSA8IHRocmVzaG9sZCA/IDAgOiB2YWx1ZTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBBIGphdmFzY3JpcHQgdmVyc2lvbiBvZiB0aGUgc2xlZXAgZnVuY3Rpb24uIFRoaXMgaXMgKipPTkxZIHRvIGJlIHVzZWQgZm9yIGRlYnVnZ2luZyoqLCBhbmQgYXNzZXJ0aW9ucyBtdXN0IGJlXHJcbiAgICogZW5hYmxlZCBmb3IgdXNlLiBUaGlzIHdhcyBtb3N0bHkgdXNlZCB0byBkZWJ1ZyBDb2xsaXNpb25FbmdpbmUgd2l0aCBsYXJnZSB0aW1lIHN0ZXBzLiBJbiB0aGlzIGNhc2UsIGl0IHNob3VsZCBiZVxyXG4gICAqIHVzZWQgaW4tY29uanVuY3Rpb24gd2l0aCB0aGUgc3RlcCBidXR0b24gdG8gYWxsb3cgdGhlIGphdmFzY3JpcHQgZXZlbnQgbG9vcCB0byByZXR1cm4gYmVmb3JlIHRoZSBuZXh0IHN0ZXAuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWUgLSBpbiBzZWNvbmRzLlxyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfVxyXG4gICAqL1xyXG4gIHNsZWVwKCB0aW1lICkge1xyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiBzdGVwVGltZXIuc2V0VGltZW91dCggcmVzb2x2ZSwgdGltZSAqIDEwMDAgKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ0NvbGxpc2lvbkxhYlV0aWxzLnNsZWVwIG11c3QgYmUgdXNlZCB3aXRoIGFzc2VydGlvbnMgb24nICk7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuY29sbGlzaW9uTGFiLnJlZ2lzdGVyKCAnQ29sbGlzaW9uTGFiVXRpbHMnLCBDb2xsaXNpb25MYWJVdGlscyApO1xyXG5leHBvcnQgZGVmYXVsdCBDb2xsaXNpb25MYWJVdGlsczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLCtCQUErQjtBQUNyRCxPQUFPQyxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxZQUFZLE1BQU0sb0JBQW9CO0FBQzdDLE9BQU9DLHFCQUFxQixNQUFNLDRCQUE0QjtBQUU5RCxNQUFNQyxpQkFBaUIsR0FBRztFQUV4QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLG1CQUFtQkEsQ0FBRUMsVUFBVSxFQUFFQyxRQUFRLEVBQUc7SUFDMUNDLE1BQU0sSUFBSUEsTUFBTSxDQUFFQyxLQUFLLENBQUNDLE9BQU8sQ0FBRUosVUFBVyxDQUFDLEVBQUcsdUJBQXNCQSxVQUFXLEVBQUUsQ0FBQztJQUNwRkUsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT0QsUUFBUSxLQUFLLFVBQVUsRUFBRyxxQkFBb0JBLFFBQVMsRUFBRSxDQUFDO0lBRW5GLEtBQU0sSUFBSUksQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHTCxVQUFVLENBQUNNLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUc7TUFDNUMsTUFBTUUsS0FBSyxHQUFHUCxVQUFVLENBQUVLLENBQUMsQ0FBRTtNQUM3QixNQUFNRyxhQUFhLEdBQUdSLFVBQVUsQ0FBRUssQ0FBQyxHQUFHLENBQUMsQ0FBRTtNQUV6Q0osUUFBUSxDQUFFTSxLQUFLLEVBQUVDLGFBQWMsQ0FBQztJQUNsQztFQUNGLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLG1CQUFtQkEsQ0FBRVQsVUFBVSxFQUFFQyxRQUFRLEVBQUc7SUFDMUNDLE1BQU0sSUFBSUEsTUFBTSxDQUFFQyxLQUFLLENBQUNDLE9BQU8sQ0FBRUosVUFBVyxDQUFDLEVBQUcsdUJBQXNCQSxVQUFXLEVBQUUsQ0FBQztJQUNwRkUsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT0QsUUFBUSxLQUFLLFVBQVUsRUFBRyxxQkFBb0JBLFFBQVMsRUFBRSxDQUFDO0lBRW5GLEtBQU0sSUFBSUksQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHTCxVQUFVLENBQUNNLE1BQU0sR0FBRyxDQUFDLEVBQUVELENBQUMsRUFBRSxFQUFHO01BQ2hELE1BQU1LLE1BQU0sR0FBR1YsVUFBVSxDQUFFSyxDQUFDLENBQUU7TUFFOUIsS0FBTSxJQUFJTSxDQUFDLEdBQUdOLENBQUMsR0FBRyxDQUFDLEVBQUVNLENBQUMsR0FBR1gsVUFBVSxDQUFDTSxNQUFNLEVBQUVLLENBQUMsRUFBRSxFQUFHO1FBRWhELE1BQU1DLE1BQU0sR0FBR1osVUFBVSxDQUFFVyxDQUFDLENBQUU7UUFDOUJULE1BQU0sSUFBSUEsTUFBTSxDQUFFUSxNQUFNLEtBQUtFLE1BQU8sQ0FBQztRQUVyQ1gsUUFBUSxDQUFFUyxNQUFNLEVBQUVFLE1BQU8sQ0FBQztNQUM1QjtJQUNGO0VBQ0YsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxzQkFBc0JBLENBQUVDLE1BQU0sRUFBRUMsUUFBUSxFQUFHO0lBQ3pDYixNQUFNLElBQUlBLE1BQU0sQ0FBRVksTUFBTSxZQUFZckIsT0FBTyxFQUFHLG1CQUFrQnFCLE1BQU8sRUFBRSxDQUFDO0lBQzFFWixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPYSxRQUFRLEtBQUssUUFBUSxFQUFHLHFCQUFvQkEsUUFBUyxFQUFFLENBQUM7SUFFakYsT0FBT0QsTUFBTSxDQUFDRSxTQUFTLENBQ3JCQyxJQUFJLENBQUNDLElBQUksQ0FBRUosTUFBTSxDQUFDSyxJQUFJLEdBQUdKLFFBQVMsQ0FBQyxHQUFHQSxRQUFRLEVBQzlDRSxJQUFJLENBQUNDLElBQUksQ0FBRUosTUFBTSxDQUFDTSxJQUFJLEdBQUdMLFFBQVMsQ0FBQyxHQUFHQSxRQUFRLEVBQzlDRSxJQUFJLENBQUNJLEtBQUssQ0FBRVAsTUFBTSxDQUFDUSxJQUFJLEdBQUdQLFFBQVMsQ0FBQyxHQUFHQSxRQUFRLEVBQy9DRSxJQUFJLENBQUNJLEtBQUssQ0FBRVAsTUFBTSxDQUFDUyxJQUFJLEdBQUdSLFFBQVMsQ0FBQyxHQUFHQSxRQUN6QyxDQUFDO0VBQ0gsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFUyxzQkFBc0JBLENBQUVDLE1BQU0sRUFBRVYsUUFBUSxFQUFHO0lBQ3pDYixNQUFNLElBQUlBLE1BQU0sQ0FBRXVCLE1BQU0sWUFBWTlCLE9BQU8sRUFBRyxtQkFBa0I4QixNQUFPLEVBQUUsQ0FBQztJQUMxRXZCLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU9hLFFBQVEsS0FBSyxRQUFRLEVBQUcscUJBQW9CQSxRQUFTLEVBQUUsQ0FBQztJQUVqRlUsTUFBTSxDQUFDQyxRQUFRLENBQUVULElBQUksQ0FBQ0MsSUFBSSxDQUFFTyxNQUFNLENBQUNFLFNBQVMsR0FBR1osUUFBUyxDQUFDLEdBQUdBLFFBQVEsRUFBRVUsTUFBTSxDQUFDRyxLQUFNLENBQUM7SUFFcEYsSUFBS2xDLEtBQUssQ0FBQ21DLGFBQWEsQ0FBRUosTUFBTSxDQUFDSyxDQUFDLEVBQUUsQ0FBQyxFQUFFakMscUJBQXFCLENBQUNrQyxjQUFlLENBQUMsRUFBRztNQUFFTixNQUFNLENBQUNLLENBQUMsR0FBRyxDQUFDO0lBQUU7SUFDaEcsT0FBT0wsTUFBTTtFQUNmLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU8sb0JBQW9CQSxDQUFFUCxNQUFNLEVBQUVWLFFBQVEsRUFBRztJQUN2Q2IsTUFBTSxJQUFJQSxNQUFNLENBQUV1QixNQUFNLFlBQVk5QixPQUFPLEVBQUcsbUJBQWtCOEIsTUFBTyxFQUFFLENBQUM7SUFDMUV2QixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPYSxRQUFRLEtBQUssUUFBUSxFQUFHLHFCQUFvQkEsUUFBUyxFQUFFLENBQUM7SUFFakYsT0FBT1UsTUFBTSxDQUFDUSxhQUFhLENBQUVsQixRQUFTLENBQUMsQ0FBQ21CLGNBQWMsQ0FBQyxDQUFDLENBQUNDLFFBQVEsQ0FBRXBCLFFBQVMsQ0FBQztFQUMvRSxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VxQixRQUFRQSxDQUFFQyxLQUFLLEVBQUVDLFNBQVMsRUFBRztJQUMzQnBDLE1BQU0sSUFBSUEsTUFBTSxDQUFFQyxLQUFLLENBQUNDLE9BQU8sQ0FBRWlDLEtBQU0sQ0FBQyxFQUFHLGtCQUFpQkEsS0FBTSxFQUFFLENBQUM7SUFDckVuQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPb0MsU0FBUyxLQUFLLFVBQVUsRUFBRyxzQkFBcUJBLFNBQVUsRUFBRSxDQUFDOztJQUV0RjtJQUNBLElBQUlGLFFBQVEsR0FBRyxJQUFJO0lBRW5CdEMsaUJBQWlCLENBQUNDLG1CQUFtQixDQUFFc0MsS0FBSyxDQUFDRSxHQUFHLENBQUVELFNBQVUsQ0FBQyxFQUFFLENBQUUvQixLQUFLLEVBQUVDLGFBQWEsS0FBTTtNQUN6RixJQUFLNEIsUUFBUSxFQUFHO1FBQ2RBLFFBQVEsR0FBSzdCLEtBQUssR0FBR0MsYUFBZTtNQUN0QztJQUNGLENBQUUsQ0FBQztJQUNILE9BQU80QixRQUFRO0VBQ2pCLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUksWUFBWUEsQ0FBRUMsUUFBUSxFQUFFSCxTQUFTLEVBQUVJLFVBQVUsRUFBRztJQUM5Q3hDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU91QyxRQUFRLENBQUVFLE1BQU0sQ0FBQzFDLFFBQVEsQ0FBRSxLQUFLLFVBQVUsRUFBRyxxQkFBb0J3QyxRQUFTLEVBQUUsQ0FBQztJQUN0R3ZDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU9vQyxTQUFTLEtBQUssVUFBVSxFQUFHLHNCQUFxQkEsU0FBVSxFQUFFLENBQUM7SUFDdEZwQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPd0MsVUFBVSxLQUFLLFVBQVUsRUFBRyx1QkFBc0JBLFVBQVcsRUFBRSxDQUFDO0lBQ3pGLE1BQU16QyxRQUFRLEdBQUd3QyxRQUFRLENBQUVFLE1BQU0sQ0FBQzFDLFFBQVEsQ0FBRSxDQUFDLENBQUM7SUFFOUMsSUFBSTJDLE9BQU8sR0FBRyxDQUFFM0MsUUFBUSxDQUFDNEMsSUFBSSxDQUFDLENBQUMsQ0FBQ3RDLEtBQUssQ0FBRTtJQUV2QyxLQUFNLE1BQU11QyxJQUFJLElBQUk3QyxRQUFRLEVBQUc7TUFDN0IsTUFBTThDLFVBQVUsR0FBR0wsVUFBVSxDQUFFSixTQUFTLENBQUVNLE9BQU8sQ0FBRSxDQUFDLENBQUcsQ0FBQyxFQUFFTixTQUFTLENBQUVRLElBQUssQ0FBRSxDQUFDO01BQzdFLElBQUtDLFVBQVUsS0FBSyxDQUFDLENBQUMsRUFBRztRQUN2QkgsT0FBTyxHQUFHLENBQUVFLElBQUksQ0FBRTtNQUNwQixDQUFDLE1BQ0ksSUFBS0MsVUFBVSxLQUFLLENBQUMsRUFBRztRQUMzQkgsT0FBTyxDQUFDSSxJQUFJLENBQUVGLElBQUssQ0FBQztNQUN0QjtJQUNGO0lBRUEsT0FBT0YsT0FBTztFQUNoQixDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VLLGNBQWNBLENBQUVSLFFBQVEsRUFBRUgsU0FBUyxFQUFHO0lBQ3BDcEMsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT3VDLFFBQVEsQ0FBRUUsTUFBTSxDQUFDMUMsUUFBUSxDQUFFLEtBQUssVUFBVSxFQUFHLHFCQUFvQndDLFFBQVMsRUFBRSxDQUFDO0lBQ3RHdkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT29DLFNBQVMsS0FBSyxVQUFVLEVBQUcsc0JBQXFCQSxTQUFVLEVBQUUsQ0FBQztJQUV0RixPQUFPeEMsaUJBQWlCLENBQUMwQyxZQUFZLENBQUVDLFFBQVEsRUFBRUgsU0FBUyxFQUFFLENBQUVZLElBQUksRUFBRTNDLEtBQUssS0FBTVUsSUFBSSxDQUFDa0MsSUFBSSxDQUFFNUMsS0FBSyxHQUFHMkMsSUFBSyxDQUFFLENBQUM7RUFDNUcsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxjQUFjQSxDQUFFWCxRQUFRLEVBQUVILFNBQVMsRUFBRztJQUNwQ3BDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU91QyxRQUFRLENBQUVFLE1BQU0sQ0FBQzFDLFFBQVEsQ0FBRSxLQUFLLFVBQVUsRUFBRyxxQkFBb0J3QyxRQUFTLEVBQUUsQ0FBQztJQUN0R3ZDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU9vQyxTQUFTLEtBQUssVUFBVSxFQUFHLHNCQUFxQkEsU0FBVSxFQUFFLENBQUM7SUFFdEYsT0FBT3hDLGlCQUFpQixDQUFDMEMsWUFBWSxDQUFFQyxRQUFRLEVBQUVILFNBQVMsRUFBRSxDQUFFWSxJQUFJLEVBQUUzQyxLQUFLLEtBQU1VLElBQUksQ0FBQ2tDLElBQUksQ0FBRUQsSUFBSSxHQUFHM0MsS0FBTSxDQUFFLENBQUM7RUFDNUcsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFOEMsR0FBR0EsQ0FBRVosUUFBUSxFQUFFYSxTQUFTLEVBQUc7SUFDekJwRCxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPdUMsUUFBUSxDQUFFRSxNQUFNLENBQUMxQyxRQUFRLENBQUUsS0FBSyxVQUFVLEVBQUcscUJBQW9Cd0MsUUFBUyxFQUFFLENBQUM7SUFDdEd2QyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPb0QsU0FBUyxLQUFLLFVBQVUsRUFBRyxzQkFBcUJBLFNBQVUsRUFBRSxDQUFDO0lBRXRGLEtBQU0sTUFBTS9DLEtBQUssSUFBSWtDLFFBQVEsRUFBRztNQUM5QixJQUFLYSxTQUFTLENBQUUvQyxLQUFNLENBQUMsRUFBRztRQUN4QixPQUFPLElBQUk7TUFDYjtJQUNGO0lBQ0EsT0FBTyxLQUFLO0VBQ2QsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFZ0QsTUFBTUEsQ0FBRWQsUUFBUSxFQUFFYSxTQUFTLEVBQUc7SUFDNUJwRCxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPdUMsUUFBUSxDQUFFRSxNQUFNLENBQUMxQyxRQUFRLENBQUUsS0FBSyxVQUFVLEVBQUcscUJBQW9Cd0MsUUFBUyxFQUFFLENBQUM7SUFDdEd2QyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPb0QsU0FBUyxLQUFLLFVBQVUsRUFBRyxzQkFBcUJBLFNBQVUsRUFBRSxDQUFDO0lBQ3RGLE1BQU1FLE1BQU0sR0FBRyxFQUFFO0lBRWpCLEtBQU0sTUFBTWpELEtBQUssSUFBSWtDLFFBQVEsRUFBRztNQUM5QixJQUFLYSxTQUFTLENBQUUvQyxLQUFNLENBQUMsRUFBRztRQUN4QmlELE1BQU0sQ0FBQ1IsSUFBSSxDQUFFekMsS0FBTSxDQUFDO01BQ3RCO0lBQ0Y7SUFDQSxPQUFPaUQsTUFBTTtFQUNmLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFNBQVNBLENBQUVDLENBQUMsRUFBRUMsR0FBRyxFQUFFQyxHQUFHLEVBQUVDLGFBQWEsR0FBRyxHQUFHLEVBQUc7SUFDNUMzRCxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPd0QsQ0FBQyxLQUFLLFVBQVUsRUFBRyxjQUFhQSxDQUFFLEVBQUUsQ0FBQztJQUM5RHhELE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU95RCxHQUFHLEtBQUssUUFBUSxFQUFHLGdCQUFlQSxHQUFJLEVBQUUsQ0FBQztJQUNsRXpELE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU8wRCxHQUFHLEtBQUssUUFBUSxFQUFHLGdCQUFlQSxHQUFJLEVBQUUsQ0FBQztJQUNsRTFELE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU8yRCxhQUFhLEtBQUssUUFBUSxFQUFHLDBCQUF5QkEsYUFBYyxFQUFFLENBQUM7SUFFaEcsS0FBTSxJQUFJeEQsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHd0QsYUFBYSxFQUFFeEQsQ0FBQyxFQUFFLEVBQUc7TUFFeEM7TUFDQSxNQUFNeUQsUUFBUSxHQUFHLENBQUVILEdBQUcsR0FBR0MsR0FBRyxJQUFLLENBQUM7O01BRWxDO01BQ0EsTUFBTUosTUFBTSxHQUFHRSxDQUFDLENBQUVJLFFBQVMsQ0FBQztNQUU1QixJQUFLTixNQUFNLEtBQUssQ0FBQyxFQUFHO1FBQ2xCSSxHQUFHLEdBQUdFLFFBQVE7TUFDaEIsQ0FBQyxNQUNJLElBQUtOLE1BQU0sS0FBSyxDQUFDLEVBQUc7UUFDdkIsT0FBT00sUUFBUTtNQUNqQixDQUFDLE1BQ0k7UUFDSEgsR0FBRyxHQUFHRyxRQUFRO01BQ2hCO0lBQ0Y7O0lBRUE7SUFDQSxPQUFPLENBQUVILEdBQUcsR0FBR0MsR0FBRyxJQUFLLENBQUM7RUFDMUIsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxTQUFTQSxDQUFFeEQsS0FBSyxFQUFFeUQsU0FBUyxHQUFHbkUscUJBQXFCLENBQUNrQyxjQUFjLEVBQUc7SUFDbkU3QixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPSyxLQUFLLEtBQUssUUFBUSxFQUFHLGtCQUFpQkEsS0FBTSxFQUFFLENBQUM7SUFDeEVMLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU84RCxTQUFTLEtBQUssUUFBUSxFQUFHLHNCQUFxQkEsU0FBVSxFQUFFLENBQUM7SUFFcEYsT0FBTy9DLElBQUksQ0FBQ2dELEdBQUcsQ0FBRTFELEtBQU0sQ0FBQyxHQUFHeUQsU0FBUyxHQUFHLENBQUMsR0FBR3pELEtBQUs7RUFDbEQsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFMkQsS0FBS0EsQ0FBRUMsSUFBSSxFQUFHO0lBQ1osSUFBS2pFLE1BQU0sRUFBRztNQUNaLE9BQU8sSUFBSWtFLE9BQU8sQ0FBRUMsT0FBTyxJQUFJN0UsU0FBUyxDQUFDOEUsVUFBVSxDQUFFRCxPQUFPLEVBQUVGLElBQUksR0FBRyxJQUFLLENBQUUsQ0FBQztJQUMvRSxDQUFDLE1BQ0k7TUFDSCxNQUFNLElBQUlJLEtBQUssQ0FBRSx5REFBMEQsQ0FBQztJQUM5RTtFQUNGO0FBQ0YsQ0FBQztBQUVEM0UsWUFBWSxDQUFDNEUsUUFBUSxDQUFFLG1CQUFtQixFQUFFMUUsaUJBQWtCLENBQUM7QUFDL0QsZUFBZUEsaUJBQWlCIn0=