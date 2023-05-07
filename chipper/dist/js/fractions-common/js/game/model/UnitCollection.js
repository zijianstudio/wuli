// Copyright 2018-2020, University of Colorado Boulder

/**
 * Represents a sum of unit fractions, where the numerator (for each different denominator) is the quantity of
 * unit fractions.
 *
 * For example, if quantities = [ 1, 0, 4 ] it would be equivalent to:
 *   1/1 + 4/3
 * or as unit fractions:
 *   1/1 + 1/3 + 1/3 + 1/3 + 1/3
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import fractionsCommon from '../../fractionsCommon.js';
class UnitCollection {
  /**
   * @param {Array.<number>} quantities - quantities[ i ] represents the numerator n of ( n / ( i + 1 ) ).
   */
  constructor(quantities) {
    // @public {Array.<number>}
    this.quantities = quantities;
  }

  /**
   * Returns the total fraction value of the full collection (all fractions added together).
   * @public
   *
   * @returns {Fraction}
   */
  get totalFraction() {
    return _.reduce(this.fractions, (a, b) => a.plus(b), Fraction.ZERO).reduced();
  }

  /**
   * Returns the value represented as a list of fractions (one for each denominator)
   * @public
   *
   * @returns {Array.<Fraction>}
   */
  get fractions() {
    return this.quantities.map((quantity, index) => new Fraction(quantity, index + 1)).filter(f => f.numerator !== 0);
  }

  /**
   * Returns the collection as represented by unit fractions (1/x).
   * @public
   *
   * @returns {Array.<Fraction>}
   */
  get unitFractions() {
    return _.flatten(this.quantities.map((quantity, index) => _.times(quantity, () => new Fraction(1, index + 1))));
  }

  /**
   * Returns the total of all of the numerators.
   * @public
   *
   * @returns {number}
   */
  get totalQuantities() {
    return _.sum(this.quantities);
  }

  /**
   * Returns how many of the fractions's numerators are not divisible by the denominators (won't simplify to x/1).
   * @public
   *
   * @returns {number}
   */
  get nondivisibleCount() {
    return _.sum(this.quantities.map((quantity, index) => quantity % (index + 1) === 0 ? 0 : 1));
  }

  /**
   * Returns an array of all denominators which have a non-zero numerator.
   * @public
   *
   * @returns {Array.<number>}
   */
  get nonzeroDenominators() {
    return _.range(1, this.quantities.length + 1).filter(denominator => {
      return this.quantities[denominator - 1] > 0;
    });
  }

  /**
   * Determines how many "whole groups" are required to fit this unit collection. This is essentially the question of
   * how many pie-shaped containers do you need to fit all of the "unit fraction" pie slices in this collection.
   * This can be more than the "ceiling" of the fraction, e.g. 1/2 + 1/3 + 1/4 + 1/5 + 5/7 (~1.9976) which needs to be
   * split into 3 "whole groups" to fit the slices.
   * @public
   *
   * @param {number} [maximumCount] - The maximum number of groups that should be allowed at all. Don't consider any
   *                                  other options.
   * @param {number} [acceptableThreshold] - If provided, this will return the very first set of groups that only has
   *                                         this many groups or less (so we don't have to compute more than is
   *                                         necessary)
   * @returns {Array.<Array.<Fraction>>|null}
   */
  getCompactRequiredGroups(maximumCount = Number.POSITIVE_INFINITY, acceptableThreshold = Number.POSITIVE_INFINITY) {
    let bestGroups = null;
    let bestCount = Number.POSITIVE_INFINITY;
    const fractions = this.unitFractions;
    const groups = [];
    const sums = [];
    function recur(i) {
      // If our current groups meet our "abort threshold", bail immediately
      if (bestGroups && bestCount <= acceptableThreshold) {
        return;
      }
      if (i === fractions.length) {
        if (groups.length < bestCount) {
          bestCount = groups.length;
          bestGroups = groups.map(group => group.slice());
        }
      } else {
        const fraction = fractions[i];

        // Adding to existing groups
        for (let j = 0; j < groups.length; j++) {
          const oldSum = sums[j];
          const newSum = oldSum.plus(fraction);
          if (!Fraction.ONE.isLessThan(newSum)) {
            sums[j] = newSum;
            groups[j].push(fraction);
            recur(i + 1);
            groups[j].pop();
            sums[j] = oldSum;
          }
        }

        // Adding a new group
        if (groups.length < maximumCount) {
          groups.push([fraction]);
          sums.push(fraction);
          recur(i + 1);
          groups.pop();
          sums.pop();
        }
      }
    }
    recur(0);
    return bestGroups;
  }

  /**
   * Returns a value based on the lexicographic order of the two collections, used for sorting.
   * @public
   *
   * @param {UnitCollection} collection
   * @returns {number}
   */
  compare(collection) {
    // We'll compare all of the indices, defaulting any not defined to 0
    const maxIndex = Math.max(this.quantities.length, collection.quantities.length) - 1;
    for (let i = 0; i <= maxIndex; i++) {
      const diff = (this.quantities[i] || 0) - (collection.quantities[i] || 0);
      if (diff) {
        return diff;
      }
    }
    return 0;
  }

  /**
   * Returns whether the two collections have equal numbers of fractions.
   * @public
   *
   * @param {UnitCollection} collection
   * @returns {boolean}
   */
  equals(collection) {
    return this.compare(collection) === 0;
  }

  /**
   * Returns the result of applying the binary operation component-wise to this collection and the provided one.
   * @private
   *
   * @param {function} op - function( {number}, {number} ) => {number}
   * @param {UnitCollection} collection
   * @returns {UnitCollection}
   */
  binaryOperation(op, collection) {
    return new UnitCollection(_.range(0, Math.max(this.quantities.length, collection.quantities.length)).map(i => {
      return op(this.quantities[i] || 0, collection.quantities[i] || 0);
    }));
  }

  /**
   * Returns the result of adding the two collections.
   * @public
   *
   * @param {UnitCollection} collection
   * @returns {UnitCollection}
   */
  plus(collection) {
    return this.binaryOperation((a, b) => a + b, collection);
  }

  /**
   * Returns the result of subtracting the two collections.
   * @public
   *
   * @param {UnitCollection} collection
   * @returns {UnitCollection}
   */
  minus(collection) {
    return this.binaryOperation((a, b) => a - b, collection);
  }

  /**
   * Returns whether this collection is effectively a superset of the given collection.
   * @public
   *
   * @param {UnitCollection} collection
   * @returns {boolean}
   */
  contains(collection) {
    for (let i = 0; i < collection.quantities.length; i++) {
      const ourCoefficient = this.quantities[i];
      const theirCoefficient = collection.quantities[i];
      if (theirCoefficient && (!ourCoefficient || theirCoefficient > ourCoefficient)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns a string representation useful for debugging.
   * @public
   *
   * @returns {string}
   */
  toString() {
    return this.quantities.map((quantity, index) => quantity ? `${quantity}/${index + 1}` : '').filter(_.identity).join(' + ');
  }

  /**
   * Converts an array of fractions to the corresponding UnitCollection with the same sum.
   * @public
   *
   * @param {Array.<Fraction>} fractions
   * @returns {UnitCollection}
   */
  static fractionsToCollection(fractions) {
    const quantities = [];
    fractions.forEach(fraction => {
      while (quantities.length < fraction.denominator) {
        quantities.push(0);
      }
      quantities[fraction.denominator - 1] += fraction.numerator;
    });
    return new UnitCollection(quantities);
  }
}
fractionsCommon.register('UnitCollection', UnitCollection);
export default UnitCollection;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGcmFjdGlvbiIsImZyYWN0aW9uc0NvbW1vbiIsIlVuaXRDb2xsZWN0aW9uIiwiY29uc3RydWN0b3IiLCJxdWFudGl0aWVzIiwidG90YWxGcmFjdGlvbiIsIl8iLCJyZWR1Y2UiLCJmcmFjdGlvbnMiLCJhIiwiYiIsInBsdXMiLCJaRVJPIiwicmVkdWNlZCIsIm1hcCIsInF1YW50aXR5IiwiaW5kZXgiLCJmaWx0ZXIiLCJmIiwibnVtZXJhdG9yIiwidW5pdEZyYWN0aW9ucyIsImZsYXR0ZW4iLCJ0aW1lcyIsInRvdGFsUXVhbnRpdGllcyIsInN1bSIsIm5vbmRpdmlzaWJsZUNvdW50Iiwibm9uemVyb0Rlbm9taW5hdG9ycyIsInJhbmdlIiwibGVuZ3RoIiwiZGVub21pbmF0b3IiLCJnZXRDb21wYWN0UmVxdWlyZWRHcm91cHMiLCJtYXhpbXVtQ291bnQiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsImFjY2VwdGFibGVUaHJlc2hvbGQiLCJiZXN0R3JvdXBzIiwiYmVzdENvdW50IiwiZ3JvdXBzIiwic3VtcyIsInJlY3VyIiwiaSIsImdyb3VwIiwic2xpY2UiLCJmcmFjdGlvbiIsImoiLCJvbGRTdW0iLCJuZXdTdW0iLCJPTkUiLCJpc0xlc3NUaGFuIiwicHVzaCIsInBvcCIsImNvbXBhcmUiLCJjb2xsZWN0aW9uIiwibWF4SW5kZXgiLCJNYXRoIiwibWF4IiwiZGlmZiIsImVxdWFscyIsImJpbmFyeU9wZXJhdGlvbiIsIm9wIiwibWludXMiLCJjb250YWlucyIsIm91ckNvZWZmaWNpZW50IiwidGhlaXJDb2VmZmljaWVudCIsInRvU3RyaW5nIiwiaWRlbnRpdHkiLCJqb2luIiwiZnJhY3Rpb25zVG9Db2xsZWN0aW9uIiwiZm9yRWFjaCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVW5pdENvbGxlY3Rpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmVwcmVzZW50cyBhIHN1bSBvZiB1bml0IGZyYWN0aW9ucywgd2hlcmUgdGhlIG51bWVyYXRvciAoZm9yIGVhY2ggZGlmZmVyZW50IGRlbm9taW5hdG9yKSBpcyB0aGUgcXVhbnRpdHkgb2ZcclxuICogdW5pdCBmcmFjdGlvbnMuXHJcbiAqXHJcbiAqIEZvciBleGFtcGxlLCBpZiBxdWFudGl0aWVzID0gWyAxLCAwLCA0IF0gaXQgd291bGQgYmUgZXF1aXZhbGVudCB0bzpcclxuICogICAxLzEgKyA0LzNcclxuICogb3IgYXMgdW5pdCBmcmFjdGlvbnM6XHJcbiAqICAgMS8xICsgMS8zICsgMS8zICsgMS8zICsgMS8zXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgRnJhY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9tb2RlbC9GcmFjdGlvbi5qcyc7XHJcbmltcG9ydCBmcmFjdGlvbnNDb21tb24gZnJvbSAnLi4vLi4vZnJhY3Rpb25zQ29tbW9uLmpzJztcclxuXHJcbmNsYXNzIFVuaXRDb2xsZWN0aW9uIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fSBxdWFudGl0aWVzIC0gcXVhbnRpdGllc1sgaSBdIHJlcHJlc2VudHMgdGhlIG51bWVyYXRvciBuIG9mICggbiAvICggaSArIDEgKSApLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBxdWFudGl0aWVzICkge1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxudW1iZXI+fVxyXG4gICAgdGhpcy5xdWFudGl0aWVzID0gcXVhbnRpdGllcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHRvdGFsIGZyYWN0aW9uIHZhbHVlIG9mIHRoZSBmdWxsIGNvbGxlY3Rpb24gKGFsbCBmcmFjdGlvbnMgYWRkZWQgdG9nZXRoZXIpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtGcmFjdGlvbn1cclxuICAgKi9cclxuICBnZXQgdG90YWxGcmFjdGlvbigpIHtcclxuICAgIHJldHVybiBfLnJlZHVjZSggdGhpcy5mcmFjdGlvbnMsICggYSwgYiApID0+IGEucGx1cyggYiApLCBGcmFjdGlvbi5aRVJPICkucmVkdWNlZCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdmFsdWUgcmVwcmVzZW50ZWQgYXMgYSBsaXN0IG9mIGZyYWN0aW9ucyAob25lIGZvciBlYWNoIGRlbm9taW5hdG9yKVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48RnJhY3Rpb24+fVxyXG4gICAqL1xyXG4gIGdldCBmcmFjdGlvbnMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5xdWFudGl0aWVzLm1hcCggKCBxdWFudGl0eSwgaW5kZXggKSA9PiBuZXcgRnJhY3Rpb24oIHF1YW50aXR5LCBpbmRleCArIDEgKSApLmZpbHRlciggZiA9PiBmLm51bWVyYXRvciAhPT0gMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY29sbGVjdGlvbiBhcyByZXByZXNlbnRlZCBieSB1bml0IGZyYWN0aW9ucyAoMS94KS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPEZyYWN0aW9uPn1cclxuICAgKi9cclxuICBnZXQgdW5pdEZyYWN0aW9ucygpIHtcclxuICAgIHJldHVybiBfLmZsYXR0ZW4oIHRoaXMucXVhbnRpdGllcy5tYXAoICggcXVhbnRpdHksIGluZGV4ICkgPT4gXy50aW1lcyggcXVhbnRpdHksICgpID0+IG5ldyBGcmFjdGlvbiggMSwgaW5kZXggKyAxICkgKSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB0b3RhbCBvZiBhbGwgb2YgdGhlIG51bWVyYXRvcnMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXQgdG90YWxRdWFudGl0aWVzKCkge1xyXG4gICAgcmV0dXJuIF8uc3VtKCB0aGlzLnF1YW50aXRpZXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgaG93IG1hbnkgb2YgdGhlIGZyYWN0aW9ucydzIG51bWVyYXRvcnMgYXJlIG5vdCBkaXZpc2libGUgYnkgdGhlIGRlbm9taW5hdG9ycyAod29uJ3Qgc2ltcGxpZnkgdG8geC8xKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldCBub25kaXZpc2libGVDb3VudCgpIHtcclxuICAgIHJldHVybiBfLnN1bSggdGhpcy5xdWFudGl0aWVzLm1hcCggKCBxdWFudGl0eSwgaW5kZXggKSA9PiBxdWFudGl0eSAlICggaW5kZXggKyAxICkgPT09IDAgPyAwIDogMSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGFsbCBkZW5vbWluYXRvcnMgd2hpY2ggaGF2ZSBhIG5vbi16ZXJvIG51bWVyYXRvci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPG51bWJlcj59XHJcbiAgICovXHJcbiAgZ2V0IG5vbnplcm9EZW5vbWluYXRvcnMoKSB7XHJcbiAgICByZXR1cm4gXy5yYW5nZSggMSwgdGhpcy5xdWFudGl0aWVzLmxlbmd0aCArIDEgKS5maWx0ZXIoIGRlbm9taW5hdG9yID0+IHtcclxuICAgICAgcmV0dXJuIHRoaXMucXVhbnRpdGllc1sgZGVub21pbmF0b3IgLSAxIF0gPiAwO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyBob3cgbWFueSBcIndob2xlIGdyb3Vwc1wiIGFyZSByZXF1aXJlZCB0byBmaXQgdGhpcyB1bml0IGNvbGxlY3Rpb24uIFRoaXMgaXMgZXNzZW50aWFsbHkgdGhlIHF1ZXN0aW9uIG9mXHJcbiAgICogaG93IG1hbnkgcGllLXNoYXBlZCBjb250YWluZXJzIGRvIHlvdSBuZWVkIHRvIGZpdCBhbGwgb2YgdGhlIFwidW5pdCBmcmFjdGlvblwiIHBpZSBzbGljZXMgaW4gdGhpcyBjb2xsZWN0aW9uLlxyXG4gICAqIFRoaXMgY2FuIGJlIG1vcmUgdGhhbiB0aGUgXCJjZWlsaW5nXCIgb2YgdGhlIGZyYWN0aW9uLCBlLmcuIDEvMiArIDEvMyArIDEvNCArIDEvNSArIDUvNyAofjEuOTk3Nikgd2hpY2ggbmVlZHMgdG8gYmVcclxuICAgKiBzcGxpdCBpbnRvIDMgXCJ3aG9sZSBncm91cHNcIiB0byBmaXQgdGhlIHNsaWNlcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gW21heGltdW1Db3VudF0gLSBUaGUgbWF4aW11bSBudW1iZXIgb2YgZ3JvdXBzIHRoYXQgc2hvdWxkIGJlIGFsbG93ZWQgYXQgYWxsLiBEb24ndCBjb25zaWRlciBhbnlcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdGhlciBvcHRpb25zLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbYWNjZXB0YWJsZVRocmVzaG9sZF0gLSBJZiBwcm92aWRlZCwgdGhpcyB3aWxsIHJldHVybiB0aGUgdmVyeSBmaXJzdCBzZXQgb2YgZ3JvdXBzIHRoYXQgb25seSBoYXNcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyBtYW55IGdyb3VwcyBvciBsZXNzIChzbyB3ZSBkb24ndCBoYXZlIHRvIGNvbXB1dGUgbW9yZSB0aGFuIGlzXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5lY2Vzc2FyeSlcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPEFycmF5LjxGcmFjdGlvbj4+fG51bGx9XHJcbiAgICovXHJcbiAgZ2V0Q29tcGFjdFJlcXVpcmVkR3JvdXBzKCBtYXhpbXVtQ291bnQgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksIGFjY2VwdGFibGVUaHJlc2hvbGQgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKSB7XHJcbiAgICBsZXQgYmVzdEdyb3VwcyA9IG51bGw7XHJcbiAgICBsZXQgYmVzdENvdW50ID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG5cclxuICAgIGNvbnN0IGZyYWN0aW9ucyA9IHRoaXMudW5pdEZyYWN0aW9ucztcclxuXHJcbiAgICBjb25zdCBncm91cHMgPSBbXTtcclxuICAgIGNvbnN0IHN1bXMgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiByZWN1ciggaSApIHtcclxuICAgICAgLy8gSWYgb3VyIGN1cnJlbnQgZ3JvdXBzIG1lZXQgb3VyIFwiYWJvcnQgdGhyZXNob2xkXCIsIGJhaWwgaW1tZWRpYXRlbHlcclxuICAgICAgaWYgKCBiZXN0R3JvdXBzICYmIGJlc3RDb3VudCA8PSBhY2NlcHRhYmxlVGhyZXNob2xkICkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBpID09PSBmcmFjdGlvbnMubGVuZ3RoICkge1xyXG4gICAgICAgIGlmICggZ3JvdXBzLmxlbmd0aCA8IGJlc3RDb3VudCApIHtcclxuICAgICAgICAgIGJlc3RDb3VudCA9IGdyb3Vwcy5sZW5ndGg7XHJcbiAgICAgICAgICBiZXN0R3JvdXBzID0gZ3JvdXBzLm1hcCggZ3JvdXAgPT4gZ3JvdXAuc2xpY2UoKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBjb25zdCBmcmFjdGlvbiA9IGZyYWN0aW9uc1sgaSBdO1xyXG5cclxuICAgICAgICAvLyBBZGRpbmcgdG8gZXhpc3RpbmcgZ3JvdXBzXHJcbiAgICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgZ3JvdXBzLmxlbmd0aDsgaisrICkge1xyXG4gICAgICAgICAgY29uc3Qgb2xkU3VtID0gc3Vtc1sgaiBdO1xyXG4gICAgICAgICAgY29uc3QgbmV3U3VtID0gb2xkU3VtLnBsdXMoIGZyYWN0aW9uICk7XHJcbiAgICAgICAgICBpZiAoICFGcmFjdGlvbi5PTkUuaXNMZXNzVGhhbiggbmV3U3VtICkgKSB7XHJcbiAgICAgICAgICAgIHN1bXNbIGogXSA9IG5ld1N1bTtcclxuICAgICAgICAgICAgZ3JvdXBzWyBqIF0ucHVzaCggZnJhY3Rpb24gKTtcclxuXHJcbiAgICAgICAgICAgIHJlY3VyKCBpICsgMSApO1xyXG5cclxuICAgICAgICAgICAgZ3JvdXBzWyBqIF0ucG9wKCk7XHJcbiAgICAgICAgICAgIHN1bXNbIGogXSA9IG9sZFN1bTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFkZGluZyBhIG5ldyBncm91cFxyXG4gICAgICAgIGlmICggZ3JvdXBzLmxlbmd0aCA8IG1heGltdW1Db3VudCApIHtcclxuICAgICAgICAgIGdyb3Vwcy5wdXNoKCBbIGZyYWN0aW9uIF0gKTtcclxuICAgICAgICAgIHN1bXMucHVzaCggZnJhY3Rpb24gKTtcclxuXHJcbiAgICAgICAgICByZWN1ciggaSArIDEgKTtcclxuXHJcbiAgICAgICAgICBncm91cHMucG9wKCk7XHJcbiAgICAgICAgICBzdW1zLnBvcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlY3VyKCAwICk7XHJcblxyXG4gICAgcmV0dXJuIGJlc3RHcm91cHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgdmFsdWUgYmFzZWQgb24gdGhlIGxleGljb2dyYXBoaWMgb3JkZXIgb2YgdGhlIHR3byBjb2xsZWN0aW9ucywgdXNlZCBmb3Igc29ydGluZy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1VuaXRDb2xsZWN0aW9ufSBjb2xsZWN0aW9uXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBjb21wYXJlKCBjb2xsZWN0aW9uICkge1xyXG4gICAgLy8gV2UnbGwgY29tcGFyZSBhbGwgb2YgdGhlIGluZGljZXMsIGRlZmF1bHRpbmcgYW55IG5vdCBkZWZpbmVkIHRvIDBcclxuICAgIGNvbnN0IG1heEluZGV4ID0gTWF0aC5tYXgoIHRoaXMucXVhbnRpdGllcy5sZW5ndGgsIGNvbGxlY3Rpb24ucXVhbnRpdGllcy5sZW5ndGggKSAtIDE7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDw9IG1heEluZGV4OyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGRpZmYgPSAoIHRoaXMucXVhbnRpdGllc1sgaSBdIHx8IDAgKSAtICggY29sbGVjdGlvbi5xdWFudGl0aWVzWyBpIF0gfHwgMCApO1xyXG4gICAgICBpZiAoIGRpZmYgKSB7XHJcbiAgICAgICAgcmV0dXJuIGRpZmY7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSB0d28gY29sbGVjdGlvbnMgaGF2ZSBlcXVhbCBudW1iZXJzIG9mIGZyYWN0aW9ucy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1VuaXRDb2xsZWN0aW9ufSBjb2xsZWN0aW9uXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgZXF1YWxzKCBjb2xsZWN0aW9uICkge1xyXG4gICAgcmV0dXJuIHRoaXMuY29tcGFyZSggY29sbGVjdGlvbiApID09PSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgcmVzdWx0IG9mIGFwcGx5aW5nIHRoZSBiaW5hcnkgb3BlcmF0aW9uIGNvbXBvbmVudC13aXNlIHRvIHRoaXMgY29sbGVjdGlvbiBhbmQgdGhlIHByb3ZpZGVkIG9uZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3AgLSBmdW5jdGlvbigge251bWJlcn0sIHtudW1iZXJ9ICkgPT4ge251bWJlcn1cclxuICAgKiBAcGFyYW0ge1VuaXRDb2xsZWN0aW9ufSBjb2xsZWN0aW9uXHJcbiAgICogQHJldHVybnMge1VuaXRDb2xsZWN0aW9ufVxyXG4gICAqL1xyXG4gIGJpbmFyeU9wZXJhdGlvbiggb3AsIGNvbGxlY3Rpb24gKSB7XHJcbiAgICByZXR1cm4gbmV3IFVuaXRDb2xsZWN0aW9uKCBfLnJhbmdlKCAwLCBNYXRoLm1heCggdGhpcy5xdWFudGl0aWVzLmxlbmd0aCwgY29sbGVjdGlvbi5xdWFudGl0aWVzLmxlbmd0aCApICkubWFwKCBpID0+IHtcclxuICAgICAgcmV0dXJuIG9wKCB0aGlzLnF1YW50aXRpZXNbIGkgXSB8fCAwLCBjb2xsZWN0aW9uLnF1YW50aXRpZXNbIGkgXSB8fCAwICk7XHJcbiAgICB9ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHJlc3VsdCBvZiBhZGRpbmcgdGhlIHR3byBjb2xsZWN0aW9ucy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1VuaXRDb2xsZWN0aW9ufSBjb2xsZWN0aW9uXHJcbiAgICogQHJldHVybnMge1VuaXRDb2xsZWN0aW9ufVxyXG4gICAqL1xyXG4gIHBsdXMoIGNvbGxlY3Rpb24gKSB7XHJcbiAgICByZXR1cm4gdGhpcy5iaW5hcnlPcGVyYXRpb24oICggYSwgYiApID0+IGEgKyBiLCBjb2xsZWN0aW9uICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSByZXN1bHQgb2Ygc3VidHJhY3RpbmcgdGhlIHR3byBjb2xsZWN0aW9ucy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1VuaXRDb2xsZWN0aW9ufSBjb2xsZWN0aW9uXHJcbiAgICogQHJldHVybnMge1VuaXRDb2xsZWN0aW9ufVxyXG4gICAqL1xyXG4gIG1pbnVzKCBjb2xsZWN0aW9uICkge1xyXG4gICAgcmV0dXJuIHRoaXMuYmluYXJ5T3BlcmF0aW9uKCAoIGEsIGIgKSA9PiBhIC0gYiwgY29sbGVjdGlvbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgY29sbGVjdGlvbiBpcyBlZmZlY3RpdmVseSBhIHN1cGVyc2V0IG9mIHRoZSBnaXZlbiBjb2xsZWN0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VW5pdENvbGxlY3Rpb259IGNvbGxlY3Rpb25cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBjb250YWlucyggY29sbGVjdGlvbiApIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNvbGxlY3Rpb24ucXVhbnRpdGllcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3Qgb3VyQ29lZmZpY2llbnQgPSB0aGlzLnF1YW50aXRpZXNbIGkgXTtcclxuICAgICAgY29uc3QgdGhlaXJDb2VmZmljaWVudCA9IGNvbGxlY3Rpb24ucXVhbnRpdGllc1sgaSBdO1xyXG5cclxuICAgICAgaWYgKCB0aGVpckNvZWZmaWNpZW50ICYmICggIW91ckNvZWZmaWNpZW50IHx8IHRoZWlyQ29lZmZpY2llbnQgPiBvdXJDb2VmZmljaWVudCApICkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIHVzZWZ1bCBmb3IgZGVidWdnaW5nLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgdG9TdHJpbmcoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5xdWFudGl0aWVzLm1hcCggKCBxdWFudGl0eSwgaW5kZXggKSA9PiBxdWFudGl0eSA/IGAke3F1YW50aXR5fS8ke2luZGV4ICsgMX1gIDogJycgKS5maWx0ZXIoIF8uaWRlbnRpdHkgKS5qb2luKCAnICsgJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgYW4gYXJyYXkgb2YgZnJhY3Rpb25zIHRvIHRoZSBjb3JyZXNwb25kaW5nIFVuaXRDb2xsZWN0aW9uIHdpdGggdGhlIHNhbWUgc3VtLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPEZyYWN0aW9uPn0gZnJhY3Rpb25zXHJcbiAgICogQHJldHVybnMge1VuaXRDb2xsZWN0aW9ufVxyXG4gICAqL1xyXG4gIHN0YXRpYyBmcmFjdGlvbnNUb0NvbGxlY3Rpb24oIGZyYWN0aW9ucyApIHtcclxuICAgIGNvbnN0IHF1YW50aXRpZXMgPSBbXTtcclxuICAgIGZyYWN0aW9ucy5mb3JFYWNoKCBmcmFjdGlvbiA9PiB7XHJcbiAgICAgIHdoaWxlICggcXVhbnRpdGllcy5sZW5ndGggPCBmcmFjdGlvbi5kZW5vbWluYXRvciApIHtcclxuICAgICAgICBxdWFudGl0aWVzLnB1c2goIDAgKTtcclxuICAgICAgfVxyXG4gICAgICBxdWFudGl0aWVzWyBmcmFjdGlvbi5kZW5vbWluYXRvciAtIDEgXSArPSBmcmFjdGlvbi5udW1lcmF0b3I7XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gbmV3IFVuaXRDb2xsZWN0aW9uKCBxdWFudGl0aWVzICk7XHJcbiAgfVxyXG59XHJcblxyXG5mcmFjdGlvbnNDb21tb24ucmVnaXN0ZXIoICdVbml0Q29sbGVjdGlvbicsIFVuaXRDb2xsZWN0aW9uICk7XHJcbmV4cG9ydCBkZWZhdWx0IFVuaXRDb2xsZWN0aW9uOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sNkNBQTZDO0FBQ2xFLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFFdEQsTUFB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