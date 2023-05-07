// Copyright 2018-2020, University of Colorado Boulder

/**
 * Searches for all combinations of a sum of fractions that sum to a given value, e.g. given the fraction 9/4 and the
 * coefficients 1,2,3,4,5,6, it can find all of the values a,b,c,d,e,f that satisfy
 * a/1 + b/2 + c/3 + d/4 + e/5 + f/6 === X/Y. It is also possible to constrain the search with other options, for
 * efficiency's sake.
 *
 * There is some up-front computation that will figure out an effective "search plan", i.e. what order should we search
 * for values of a,b,c,d,e,f, and how can we make the search space smaller? For instance, the value of e/5 in this case
 * can be highly constrained. The rest of the LHS (a/1 + b/2 + c/3 + d/4 + f/6) will reduce to a fraction whose
 * denominator is NOT a multiple of 5, so if (X/Y - e/5)'s denominator is a multiple of 5, it can be excluded. In this
 * case, it excludes 4/5ths of the values of e.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import PrimeFactor from '../../common/model/PrimeFactor.js';
import PrimeFactorization from '../../common/model/PrimeFactorization.js';
import fractionsCommon from '../../fractionsCommon.js';
import UnitCollection from './UnitCollection.js';
class CollectionFinder {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      // {Array.<PrimeFactorization>} - The available denominators that can be used.
      denominators: _.range(1, 9).map(PrimeFactorization.factor)
    }, options);
    const denominators = options.denominators;
    const lcm = _.reduce(denominators, (a, b) => a.lcm(b), PrimeFactorization.ONE);
    const inverses = denominators.map(f => lcm.divided(f));

    // {Array.<PrimeFactorization>}
    const constraintDivisors = _.flatten(lcm.factors.map(factor => {
      return _.range(1, factor.order + 1).map(order => {
        return new PrimeFactorization([new PrimeFactor(factor.prime, order)]);
      });
    }));

    // {Array.<Array.<PrimeFactorization>>} - constraint index => list of denominators included
    const constraintDenominators = constraintDivisors.map(divisor => denominators.filter((denominator, index) => {
      return !divisor.divides(inverses[index]);
    }));

    // {Array.<Entry>}
    const entries = [];
    function filterUncomputedDenominators(divisorDenominators) {
      return divisorDenominators.filter(denominator => !_.some(entries, entry => entry.denominator === denominator));
    }
    function findMinConstraintIndex() {
      let bestIndex = -1;
      let bestDivisor = null;
      let bestNumUncomputedDenominators = Number.POSITIVE_INFINITY;
      for (let i = 0; i < constraintDivisors.length; i++) {
        const divisor = constraintDivisors[i];
        const divisorDenominators = constraintDenominators[i];
        const uncomputedDenominators = filterUncomputedDenominators(divisorDenominators);
        if (uncomputedDenominators.length < bestNumUncomputedDenominators || uncomputedDenominators.length === bestNumUncomputedDenominators && divisor.number > bestDivisor.number) {
          bestIndex = i;
          bestDivisor = divisor;
          bestNumUncomputedDenominators = uncomputedDenominators.length;
        }
      }
      return bestIndex;
    }
    while (constraintDivisors.length) {
      const constraintIndex = findMinConstraintIndex();
      const divisorDenominators = constraintDenominators[constraintIndex];
      filterUncomputedDenominators(divisorDenominators).forEach(uncomputedDenominator => {
        entries.push(new Entry(uncomputedDenominator, lcm.divided(uncomputedDenominator)));
      });
      for (let i = 0; i < constraintDivisors.length; i++) {
        const divisor = constraintDivisors[i];
        const divisorDenominators = constraintDenominators[i];
        const uncomputedDenominators = filterUncomputedDenominators(divisorDenominators);
        if (uncomputedDenominators.length === 0) {
          const denominatorIndices = divisorDenominators.map(d => _.findIndex(entries, entry => entry.denominator === d));
          const constraint = new Constraint(divisor, divisorDenominators, lcm, denominatorIndices);
          entries[entries.length - 1].constraints.push(constraint);
        }
      }
      constraintDivisors.splice(constraintIndex, 1);
      constraintDenominators.splice(constraintIndex, 1);
    }
    filterUncomputedDenominators(denominators).forEach(uncomputedDenominator => {
      entries.push(new Entry(uncomputedDenominator, lcm.divided(uncomputedDenominator)));
    });

    // @private {Array.<Entry>}
    this.entries = entries;

    // @private {PrimeFactorization}
    this.lcm = lcm;

    // @private {number}
    this.maxDenominatorNumber = Math.max(...denominators.map(d => d.number));

    // @private {Array.<number>} - Maps "internal index" (based on entries) into the UnitCollection array index.
    this.collectionIndexMap = this.entries.map(entry => entry.denominator.number - 1);
  }

  /**
   * Returns an array of all UnitCollections that match the given parameters (using this finder's denominators).
   * This is basically a list of all ways a given fraction (the input) can be partitioned into different sums of
   * fractions (with this finder's denominators) with numerators matching the option constraints.
   * @public
   *
   * @param {Fraction} fraction
   * @param {Object} [options]
   * @returns {Array.<UnitCollection>}
   */
  search(fraction, options) {
    const {
      // {number} - The maximum possible quantity for each individual denominator (so e.g. if maxQuantity:4, the
      // finder will never report 5 halves).
      maxQuantity = Number.POSITIVE_INFINITY,
      // {number} - The maximum possible quantity total including all denominators (so e.g. if maxTotalQuantity:4,
      // the finder will never report 2 halves and 3 thirds).
      maxTotalQuantity = Number.POSITIVE_INFINITY,
      // {number} - The maximum total number of non-zero coefficients allowed. For example if maxNonzeroCount:2,
      // the finder will never report three non-zero numerators for different denominators.
      maxNonzeroCount = Number.POSITIVE_INFINITY
    } = options || {};
    const self = this;
    assert && assert(typeof maxQuantity === 'number' && maxQuantity >= 1);
    assert && assert(typeof maxTotalQuantity === 'number' && maxTotalQuantity >= 1);
    const r = fraction.numerator * this.lcm.number / fraction.denominator;
    const entries = this.entries;
    const coefficients = [];
    const results = [];

    // If our lcm is not a multiple of the fraction's denominator, we will have no possible solutions.
    if (r % 1 !== 0) {
      return results;
    }
    (function recur(index, remainder, totalCount, nonzeroCount) {
      const entry = entries[index];
      const maxCoefficient = Math.min(maxQuantity, Math.floor(remainder / entry.inverseNumber), maxTotalQuantity - totalCount);
      if (index === entries.length - 1) {
        // If we have an exact solution, then maxCoefficient should be our sole solution due to the division
        const coefficient = maxCoefficient;
        const subRemainder = remainder - coefficient * entry.inverseNumber;
        if (subRemainder === 0) {
          // We have a solution!

          coefficients.push(coefficient);
          const collection = self.unitCollectionFromCoefficients(coefficients);
          coefficients.pop();
          assert && assert(collection.totalFraction.reduced().equals(fraction.reduced()));
          assert && collection.quantities.forEach(quantity => assert(quantity <= maxQuantity));
          assert && assert(_.sum(collection.quantities) <= maxTotalQuantity);
          results.push(collection);
        }
      } else {
        for (let coefficient = 0; coefficient <= maxCoefficient; coefficient++) {
          const subRemainder = remainder - coefficient * entry.inverseNumber;
          assert && assert(subRemainder >= 0);
          coefficients.push(coefficient);
          let constraintsSatisfied = true;
          for (let i = 0; i < entry.constraints.length; i++) {
            const constraint = entry.constraints[i];
            if (!constraint.satisfies(r, coefficients)) {
              constraintsSatisfied = false;
              break;
            }
          }
          const nextNonzeroCount = nonzeroCount + (coefficient > 0 ? 1 : 0);
          if (constraintsSatisfied && nextNonzeroCount <= maxNonzeroCount) {
            recur(index + 1, subRemainder, totalCount + coefficient, nextNonzeroCount);
          }
          coefficients.pop();
        }
      }
    })(0, r, 0, 0);
    return results;
  }

  /**
   * Like search() above, but with "simple" logic (and slower) for unit test verification.
   * @public
   *
   * @param {Fraction} fraction
   * @param {Object} [options]
   * @returns {Array.<UnitCollection>}
   */
  bruteForceSearch(fraction, options) {
    const {
      // {number} - The maximum possible quantity for each individual denominator (so e.g. if maxQuantity:4, the
      // finder will never report 5 halves).
      maxQuantity = Number.POSITIVE_INFINITY,
      // {number} - The maximum possible quantity total including all denominators (so e.g. if maxTotalQuantity:4,
      // the finder will never report 2 halves and 3 thirds).
      maxTotalQuantity = Number.POSITIVE_INFINITY
    } = options || {};
    const self = this;
    assert && assert(typeof maxQuantity === 'number' && maxQuantity >= 1);
    assert && assert(typeof maxTotalQuantity === 'number' && maxTotalQuantity >= 1);
    const entries = this.entries;
    const results = [];
    const coefficients = [];

    /**
     * @param {number} index - Index into our denominators
     * @param {Fraction} remainder
     * @param {number} totalCount
     */
    (function recur(index, remainder, totalCount) {
      const denominator = entries[index].denominatorNumber;
      for (let coefficient = 0; coefficient <= maxQuantity; coefficient++) {
        const subRemainder = remainder.minus(new Fraction(coefficient, denominator));
        if (subRemainder.value < 0 || coefficient + totalCount > maxTotalQuantity) {
          break;
        }
        coefficients.push(coefficient);
        if (index === entries.length - 1) {
          if (subRemainder.numerator === 0) {
            // We have a solution!
            const collection = self.unitCollectionFromCoefficients(coefficients);
            assert && assert(collection.totalFraction.reduced().equals(fraction.reduced()));
            assert && collection.quantities.forEach(quantity => assert(quantity <= maxQuantity));
            assert && assert(_.sum(collection.quantities) <= maxTotalQuantity);
            results.push(collection);
          }
        } else {
          recur(index + 1, subRemainder, totalCount + coefficient);
        }
        coefficients.pop();
      }
    })(0, fraction, 0);
    return results;
  }

  /**
   * Permutes and pads coefficients to create a UnitCollection.
   * @private
   *
   * @param {Array.<number>} coefficients - In the same order as our entries, e.g. coefficients[ i ] is the
   *                                        coefficient for entries[ i ].
   * @returns {UnitCollection}
   */
  unitCollectionFromCoefficients(coefficients) {
    // {Array.<number>} - Construct some permuted coefficients in the "correct" order
    const permutedCoefficients = [];

    // Zero-pad, since we may have some denominators "missing"
    while (permutedCoefficients.length < this.maxDenominatorNumber) {
      permutedCoefficients.push(0);
    }

    // Fill in the coefficients we do have.
    for (let i = 0; i < coefficients.length; i++) {
      permutedCoefficients[this.collectionIndexMap[i]] = coefficients[i];
    }
    return new UnitCollection(permutedCoefficients);
  }
}
class Entry {
  /**
   * @param {PrimeFactorization} denominator
   * @param {PrimeFactorization} inverse
   * @param {Array.<Constraint>} constraints
   */
  constructor(denominator, inverse, constraints = []) {
    // @public {PrimeFactorization}
    this.denominator = denominator;

    // @public {PrimeFactorization}
    this.inverse = inverse;

    // @public {Array.<Constraint>}
    this.constraints = constraints;

    // @public {number}
    this.denominatorNumber = denominator.number;

    // @public {number}
    this.inverseNumber = inverse.number;
  }

  /**
   * Returns a string form of the entry, for debugging.
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `${this.denominator}${this.constraints.map(c => `\n  ${c}`)}`;
  }
}
class Constraint {
  /**
   * @param {PrimeFactorization} divisor
   * @param {Array.<PrimeFactorization>} denominators
   * @param {PrimeFactorization} lcm
   * @param {Array.<number>} denominatorIndices
   */
  constructor(divisor, denominators, lcm, denominatorIndices) {
    assert && assert(divisor instanceof PrimeFactorization);
    assert && assert(Array.isArray(denominators));
    assert && denominators.forEach(d => assert(d instanceof PrimeFactorization));
    assert && assert(lcm instanceof PrimeFactorization);
    assert && assert(Array.isArray(denominatorIndices));
    assert && denominatorIndices.forEach(i => assert(typeof i === 'number'));
    assert && assert(denominators.length === denominatorIndices.length);

    // @public {PrimeFactorization}
    this.divisor = divisor;

    // @public {Array.<PrimeFactorization>}
    this.denominators = denominators;

    // @private {PrimeFactorization}
    this.lcm = lcm;

    // @private {Array.<number>}
    this.denominatorIndices = denominatorIndices;

    // @private {number}
    this.divisorNumber = divisor.number;

    // @private {Array.<number>}
    this.denominatorCoefficients = denominators.map(d => lcm.divided(d).number);
  }

  /**
   * Returns whether this constraint is satisfied by the given total (r = lcm * fraction) and the coefficients.
   * @public
   *
   * @param {number} r
   * @param {Array.<number>} coefficients
   * @returns {boolean}
   */
  satisfies(r, coefficients) {
    assert && assert(typeof r === 'number');
    assert && assert(Array.isArray(coefficients));
    let sum = 0;
    for (let i = 0; i < this.denominatorCoefficients.length; i++) {
      sum += coefficients[this.denominatorIndices[i]] * this.denominatorCoefficients[i];
    }
    return r % this.divisorNumber === sum % this.divisorNumber;
  }

  /**
   * Returns a string form of the entry, for debugging.
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `r = f(${this.denominators.join(',')}) (mod ${this.divisor})`;
  }
}
fractionsCommon.register('CollectionFinder', CollectionFinder);
export default CollectionFinder;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkZyYWN0aW9uIiwiUHJpbWVGYWN0b3IiLCJQcmltZUZhY3Rvcml6YXRpb24iLCJmcmFjdGlvbnNDb21tb24iLCJVbml0Q29sbGVjdGlvbiIsIkNvbGxlY3Rpb25GaW5kZXIiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJkZW5vbWluYXRvcnMiLCJfIiwicmFuZ2UiLCJtYXAiLCJmYWN0b3IiLCJsY20iLCJyZWR1Y2UiLCJhIiwiYiIsIk9ORSIsImludmVyc2VzIiwiZiIsImRpdmlkZWQiLCJjb25zdHJhaW50RGl2aXNvcnMiLCJmbGF0dGVuIiwiZmFjdG9ycyIsIm9yZGVyIiwicHJpbWUiLCJjb25zdHJhaW50RGVub21pbmF0b3JzIiwiZGl2aXNvciIsImZpbHRlciIsImRlbm9taW5hdG9yIiwiaW5kZXgiLCJkaXZpZGVzIiwiZW50cmllcyIsImZpbHRlclVuY29tcHV0ZWREZW5vbWluYXRvcnMiLCJkaXZpc29yRGVub21pbmF0b3JzIiwic29tZSIsImVudHJ5IiwiZmluZE1pbkNvbnN0cmFpbnRJbmRleCIsImJlc3RJbmRleCIsImJlc3REaXZpc29yIiwiYmVzdE51bVVuY29tcHV0ZWREZW5vbWluYXRvcnMiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsImkiLCJsZW5ndGgiLCJ1bmNvbXB1dGVkRGVub21pbmF0b3JzIiwibnVtYmVyIiwiY29uc3RyYWludEluZGV4IiwiZm9yRWFjaCIsInVuY29tcHV0ZWREZW5vbWluYXRvciIsInB1c2giLCJFbnRyeSIsImRlbm9taW5hdG9ySW5kaWNlcyIsImQiLCJmaW5kSW5kZXgiLCJjb25zdHJhaW50IiwiQ29uc3RyYWludCIsImNvbnN0cmFpbnRzIiwic3BsaWNlIiwibWF4RGVub21pbmF0b3JOdW1iZXIiLCJNYXRoIiwibWF4IiwiY29sbGVjdGlvbkluZGV4TWFwIiwic2VhcmNoIiwiZnJhY3Rpb24iLCJtYXhRdWFudGl0eSIsIm1heFRvdGFsUXVhbnRpdHkiLCJtYXhOb256ZXJvQ291bnQiLCJzZWxmIiwiYXNzZXJ0IiwiciIsIm51bWVyYXRvciIsImNvZWZmaWNpZW50cyIsInJlc3VsdHMiLCJyZWN1ciIsInJlbWFpbmRlciIsInRvdGFsQ291bnQiLCJub256ZXJvQ291bnQiLCJtYXhDb2VmZmljaWVudCIsIm1pbiIsImZsb29yIiwiaW52ZXJzZU51bWJlciIsImNvZWZmaWNpZW50Iiwic3ViUmVtYWluZGVyIiwiY29sbGVjdGlvbiIsInVuaXRDb2xsZWN0aW9uRnJvbUNvZWZmaWNpZW50cyIsInBvcCIsInRvdGFsRnJhY3Rpb24iLCJyZWR1Y2VkIiwiZXF1YWxzIiwicXVhbnRpdGllcyIsInF1YW50aXR5Iiwic3VtIiwiY29uc3RyYWludHNTYXRpc2ZpZWQiLCJzYXRpc2ZpZXMiLCJuZXh0Tm9uemVyb0NvdW50IiwiYnJ1dGVGb3JjZVNlYXJjaCIsImRlbm9taW5hdG9yTnVtYmVyIiwibWludXMiLCJ2YWx1ZSIsInBlcm11dGVkQ29lZmZpY2llbnRzIiwiaW52ZXJzZSIsInRvU3RyaW5nIiwiYyIsIkFycmF5IiwiaXNBcnJheSIsImRpdmlzb3JOdW1iZXIiLCJkZW5vbWluYXRvckNvZWZmaWNpZW50cyIsImpvaW4iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvbGxlY3Rpb25GaW5kZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2VhcmNoZXMgZm9yIGFsbCBjb21iaW5hdGlvbnMgb2YgYSBzdW0gb2YgZnJhY3Rpb25zIHRoYXQgc3VtIHRvIGEgZ2l2ZW4gdmFsdWUsIGUuZy4gZ2l2ZW4gdGhlIGZyYWN0aW9uIDkvNCBhbmQgdGhlXHJcbiAqIGNvZWZmaWNpZW50cyAxLDIsMyw0LDUsNiwgaXQgY2FuIGZpbmQgYWxsIG9mIHRoZSB2YWx1ZXMgYSxiLGMsZCxlLGYgdGhhdCBzYXRpc2Z5XHJcbiAqIGEvMSArIGIvMiArIGMvMyArIGQvNCArIGUvNSArIGYvNiA9PT0gWC9ZLiBJdCBpcyBhbHNvIHBvc3NpYmxlIHRvIGNvbnN0cmFpbiB0aGUgc2VhcmNoIHdpdGggb3RoZXIgb3B0aW9ucywgZm9yXHJcbiAqIGVmZmljaWVuY3kncyBzYWtlLlxyXG4gKlxyXG4gKiBUaGVyZSBpcyBzb21lIHVwLWZyb250IGNvbXB1dGF0aW9uIHRoYXQgd2lsbCBmaWd1cmUgb3V0IGFuIGVmZmVjdGl2ZSBcInNlYXJjaCBwbGFuXCIsIGkuZS4gd2hhdCBvcmRlciBzaG91bGQgd2Ugc2VhcmNoXHJcbiAqIGZvciB2YWx1ZXMgb2YgYSxiLGMsZCxlLGYsIGFuZCBob3cgY2FuIHdlIG1ha2UgdGhlIHNlYXJjaCBzcGFjZSBzbWFsbGVyPyBGb3IgaW5zdGFuY2UsIHRoZSB2YWx1ZSBvZiBlLzUgaW4gdGhpcyBjYXNlXHJcbiAqIGNhbiBiZSBoaWdobHkgY29uc3RyYWluZWQuIFRoZSByZXN0IG9mIHRoZSBMSFMgKGEvMSArIGIvMiArIGMvMyArIGQvNCArIGYvNikgd2lsbCByZWR1Y2UgdG8gYSBmcmFjdGlvbiB3aG9zZVxyXG4gKiBkZW5vbWluYXRvciBpcyBOT1QgYSBtdWx0aXBsZSBvZiA1LCBzbyBpZiAoWC9ZIC0gZS81KSdzIGRlbm9taW5hdG9yIGlzIGEgbXVsdGlwbGUgb2YgNSwgaXQgY2FuIGJlIGV4Y2x1ZGVkLiBJbiB0aGlzXHJcbiAqIGNhc2UsIGl0IGV4Y2x1ZGVzIDQvNXRocyBvZiB0aGUgdmFsdWVzIG9mIGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvbW9kZWwvRnJhY3Rpb24uanMnO1xyXG5pbXBvcnQgUHJpbWVGYWN0b3IgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1ByaW1lRmFjdG9yLmpzJztcclxuaW1wb3J0IFByaW1lRmFjdG9yaXphdGlvbiBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvUHJpbWVGYWN0b3JpemF0aW9uLmpzJztcclxuaW1wb3J0IGZyYWN0aW9uc0NvbW1vbiBmcm9tICcuLi8uLi9mcmFjdGlvbnNDb21tb24uanMnO1xyXG5pbXBvcnQgVW5pdENvbGxlY3Rpb24gZnJvbSAnLi9Vbml0Q29sbGVjdGlvbi5qcyc7XHJcblxyXG5jbGFzcyBDb2xsZWN0aW9uRmluZGVyIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgLy8ge0FycmF5LjxQcmltZUZhY3Rvcml6YXRpb24+fSAtIFRoZSBhdmFpbGFibGUgZGVub21pbmF0b3JzIHRoYXQgY2FuIGJlIHVzZWQuXHJcbiAgICAgIGRlbm9taW5hdG9yczogXy5yYW5nZSggMSwgOSApLm1hcCggUHJpbWVGYWN0b3JpemF0aW9uLmZhY3RvciApXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgZGVub21pbmF0b3JzID0gb3B0aW9ucy5kZW5vbWluYXRvcnM7XHJcblxyXG4gICAgY29uc3QgbGNtID0gXy5yZWR1Y2UoIGRlbm9taW5hdG9ycywgKCBhLCBiICkgPT4gYS5sY20oIGIgKSwgUHJpbWVGYWN0b3JpemF0aW9uLk9ORSApO1xyXG4gICAgY29uc3QgaW52ZXJzZXMgPSBkZW5vbWluYXRvcnMubWFwKCBmID0+IGxjbS5kaXZpZGVkKCBmICkgKTtcclxuXHJcbiAgICAvLyB7QXJyYXkuPFByaW1lRmFjdG9yaXphdGlvbj59XHJcbiAgICBjb25zdCBjb25zdHJhaW50RGl2aXNvcnMgPSBfLmZsYXR0ZW4oIGxjbS5mYWN0b3JzLm1hcCggZmFjdG9yID0+IHtcclxuICAgICAgcmV0dXJuIF8ucmFuZ2UoIDEsIGZhY3Rvci5vcmRlciArIDEgKS5tYXAoIG9yZGVyID0+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByaW1lRmFjdG9yaXphdGlvbiggWyBuZXcgUHJpbWVGYWN0b3IoIGZhY3Rvci5wcmltZSwgb3JkZXIgKSBdICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIHtBcnJheS48QXJyYXkuPFByaW1lRmFjdG9yaXphdGlvbj4+fSAtIGNvbnN0cmFpbnQgaW5kZXggPT4gbGlzdCBvZiBkZW5vbWluYXRvcnMgaW5jbHVkZWRcclxuICAgIGNvbnN0IGNvbnN0cmFpbnREZW5vbWluYXRvcnMgPSBjb25zdHJhaW50RGl2aXNvcnMubWFwKCBkaXZpc29yID0+IGRlbm9taW5hdG9ycy5maWx0ZXIoICggZGVub21pbmF0b3IsIGluZGV4ICkgPT4ge1xyXG4gICAgICByZXR1cm4gIWRpdmlzb3IuZGl2aWRlcyggaW52ZXJzZXNbIGluZGV4IF0gKTtcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIHtBcnJheS48RW50cnk+fVxyXG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xyXG5cclxuICAgIGZ1bmN0aW9uIGZpbHRlclVuY29tcHV0ZWREZW5vbWluYXRvcnMoIGRpdmlzb3JEZW5vbWluYXRvcnMgKSB7XHJcbiAgICAgIHJldHVybiBkaXZpc29yRGVub21pbmF0b3JzLmZpbHRlciggZGVub21pbmF0b3IgPT4gIV8uc29tZSggZW50cmllcywgZW50cnkgPT4gZW50cnkuZGVub21pbmF0b3IgPT09IGRlbm9taW5hdG9yICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBmaW5kTWluQ29uc3RyYWludEluZGV4KCkge1xyXG4gICAgICBsZXQgYmVzdEluZGV4ID0gLTE7XHJcbiAgICAgIGxldCBiZXN0RGl2aXNvciA9IG51bGw7XHJcbiAgICAgIGxldCBiZXN0TnVtVW5jb21wdXRlZERlbm9taW5hdG9ycyA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY29uc3RyYWludERpdmlzb3JzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IGRpdmlzb3IgPSBjb25zdHJhaW50RGl2aXNvcnNbIGkgXTtcclxuICAgICAgICBjb25zdCBkaXZpc29yRGVub21pbmF0b3JzID0gY29uc3RyYWludERlbm9taW5hdG9yc1sgaSBdO1xyXG4gICAgICAgIGNvbnN0IHVuY29tcHV0ZWREZW5vbWluYXRvcnMgPSBmaWx0ZXJVbmNvbXB1dGVkRGVub21pbmF0b3JzKCBkaXZpc29yRGVub21pbmF0b3JzICk7XHJcbiAgICAgICAgaWYgKCB1bmNvbXB1dGVkRGVub21pbmF0b3JzLmxlbmd0aCA8IGJlc3ROdW1VbmNvbXB1dGVkRGVub21pbmF0b3JzIHx8XHJcbiAgICAgICAgICAgICAoIHVuY29tcHV0ZWREZW5vbWluYXRvcnMubGVuZ3RoID09PSBiZXN0TnVtVW5jb21wdXRlZERlbm9taW5hdG9ycyAmJiBkaXZpc29yLm51bWJlciA+IGJlc3REaXZpc29yLm51bWJlciApICkge1xyXG4gICAgICAgICAgYmVzdEluZGV4ID0gaTtcclxuICAgICAgICAgIGJlc3REaXZpc29yID0gZGl2aXNvcjtcclxuICAgICAgICAgIGJlc3ROdW1VbmNvbXB1dGVkRGVub21pbmF0b3JzID0gdW5jb21wdXRlZERlbm9taW5hdG9ycy5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBiZXN0SW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgd2hpbGUgKCBjb25zdHJhaW50RGl2aXNvcnMubGVuZ3RoICkge1xyXG4gICAgICBjb25zdCBjb25zdHJhaW50SW5kZXggPSBmaW5kTWluQ29uc3RyYWludEluZGV4KCk7XHJcbiAgICAgIGNvbnN0IGRpdmlzb3JEZW5vbWluYXRvcnMgPSBjb25zdHJhaW50RGVub21pbmF0b3JzWyBjb25zdHJhaW50SW5kZXggXTtcclxuXHJcbiAgICAgIGZpbHRlclVuY29tcHV0ZWREZW5vbWluYXRvcnMoIGRpdmlzb3JEZW5vbWluYXRvcnMgKS5mb3JFYWNoKCB1bmNvbXB1dGVkRGVub21pbmF0b3IgPT4ge1xyXG4gICAgICAgIGVudHJpZXMucHVzaCggbmV3IEVudHJ5KCB1bmNvbXB1dGVkRGVub21pbmF0b3IsIGxjbS5kaXZpZGVkKCB1bmNvbXB1dGVkRGVub21pbmF0b3IgKSApICk7XHJcbiAgICAgIH0gKTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY29uc3RyYWludERpdmlzb3JzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IGRpdmlzb3IgPSBjb25zdHJhaW50RGl2aXNvcnNbIGkgXTtcclxuICAgICAgICBjb25zdCBkaXZpc29yRGVub21pbmF0b3JzID0gY29uc3RyYWludERlbm9taW5hdG9yc1sgaSBdO1xyXG4gICAgICAgIGNvbnN0IHVuY29tcHV0ZWREZW5vbWluYXRvcnMgPSBmaWx0ZXJVbmNvbXB1dGVkRGVub21pbmF0b3JzKCBkaXZpc29yRGVub21pbmF0b3JzICk7XHJcbiAgICAgICAgaWYgKCB1bmNvbXB1dGVkRGVub21pbmF0b3JzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgICAgIGNvbnN0IGRlbm9taW5hdG9ySW5kaWNlcyA9IGRpdmlzb3JEZW5vbWluYXRvcnMubWFwKCBkID0+IF8uZmluZEluZGV4KCBlbnRyaWVzLCBlbnRyeSA9PiBlbnRyeS5kZW5vbWluYXRvciA9PT0gZCApICk7XHJcbiAgICAgICAgICBjb25zdCBjb25zdHJhaW50ID0gbmV3IENvbnN0cmFpbnQoIGRpdmlzb3IsIGRpdmlzb3JEZW5vbWluYXRvcnMsIGxjbSwgZGVub21pbmF0b3JJbmRpY2VzICk7XHJcbiAgICAgICAgICBlbnRyaWVzWyBlbnRyaWVzLmxlbmd0aCAtIDEgXS5jb25zdHJhaW50cy5wdXNoKCBjb25zdHJhaW50ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdHJhaW50RGl2aXNvcnMuc3BsaWNlKCBjb25zdHJhaW50SW5kZXgsIDEgKTtcclxuICAgICAgY29uc3RyYWludERlbm9taW5hdG9ycy5zcGxpY2UoIGNvbnN0cmFpbnRJbmRleCwgMSApO1xyXG4gICAgfVxyXG4gICAgZmlsdGVyVW5jb21wdXRlZERlbm9taW5hdG9ycyggZGVub21pbmF0b3JzICkuZm9yRWFjaCggdW5jb21wdXRlZERlbm9taW5hdG9yID0+IHtcclxuICAgICAgZW50cmllcy5wdXNoKCBuZXcgRW50cnkoIHVuY29tcHV0ZWREZW5vbWluYXRvciwgbGNtLmRpdmlkZWQoIHVuY29tcHV0ZWREZW5vbWluYXRvciApICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPEVudHJ5Pn1cclxuICAgIHRoaXMuZW50cmllcyA9IGVudHJpZXM7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1ByaW1lRmFjdG9yaXphdGlvbn1cclxuICAgIHRoaXMubGNtID0gbGNtO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9XHJcbiAgICB0aGlzLm1heERlbm9taW5hdG9yTnVtYmVyID0gTWF0aC5tYXgoIC4uLmRlbm9taW5hdG9ycy5tYXAoIGQgPT4gZC5udW1iZXIgKSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBcnJheS48bnVtYmVyPn0gLSBNYXBzIFwiaW50ZXJuYWwgaW5kZXhcIiAoYmFzZWQgb24gZW50cmllcykgaW50byB0aGUgVW5pdENvbGxlY3Rpb24gYXJyYXkgaW5kZXguXHJcbiAgICB0aGlzLmNvbGxlY3Rpb25JbmRleE1hcCA9IHRoaXMuZW50cmllcy5tYXAoIGVudHJ5ID0+IGVudHJ5LmRlbm9taW5hdG9yLm51bWJlciAtIDEgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgYWxsIFVuaXRDb2xsZWN0aW9ucyB0aGF0IG1hdGNoIHRoZSBnaXZlbiBwYXJhbWV0ZXJzICh1c2luZyB0aGlzIGZpbmRlcidzIGRlbm9taW5hdG9ycykuXHJcbiAgICogVGhpcyBpcyBiYXNpY2FsbHkgYSBsaXN0IG9mIGFsbCB3YXlzIGEgZ2l2ZW4gZnJhY3Rpb24gKHRoZSBpbnB1dCkgY2FuIGJlIHBhcnRpdGlvbmVkIGludG8gZGlmZmVyZW50IHN1bXMgb2ZcclxuICAgKiBmcmFjdGlvbnMgKHdpdGggdGhpcyBmaW5kZXIncyBkZW5vbWluYXRvcnMpIHdpdGggbnVtZXJhdG9ycyBtYXRjaGluZyB0aGUgb3B0aW9uIGNvbnN0cmFpbnRzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RnJhY3Rpb259IGZyYWN0aW9uXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48VW5pdENvbGxlY3Rpb24+fVxyXG4gICAqL1xyXG4gIHNlYXJjaCggZnJhY3Rpb24sIG9wdGlvbnMgKSB7XHJcbiAgICBjb25zdCB7XHJcbiAgICAgIC8vIHtudW1iZXJ9IC0gVGhlIG1heGltdW0gcG9zc2libGUgcXVhbnRpdHkgZm9yIGVhY2ggaW5kaXZpZHVhbCBkZW5vbWluYXRvciAoc28gZS5nLiBpZiBtYXhRdWFudGl0eTo0LCB0aGVcclxuICAgICAgLy8gZmluZGVyIHdpbGwgbmV2ZXIgcmVwb3J0IDUgaGFsdmVzKS5cclxuICAgICAgbWF4UXVhbnRpdHkgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXHJcblxyXG4gICAgICAvLyB7bnVtYmVyfSAtIFRoZSBtYXhpbXVtIHBvc3NpYmxlIHF1YW50aXR5IHRvdGFsIGluY2x1ZGluZyBhbGwgZGVub21pbmF0b3JzIChzbyBlLmcuIGlmIG1heFRvdGFsUXVhbnRpdHk6NCxcclxuICAgICAgLy8gdGhlIGZpbmRlciB3aWxsIG5ldmVyIHJlcG9ydCAyIGhhbHZlcyBhbmQgMyB0aGlyZHMpLlxyXG4gICAgICBtYXhUb3RhbFF1YW50aXR5ID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxyXG5cclxuICAgICAgLy8ge251bWJlcn0gLSBUaGUgbWF4aW11bSB0b3RhbCBudW1iZXIgb2Ygbm9uLXplcm8gY29lZmZpY2llbnRzIGFsbG93ZWQuIEZvciBleGFtcGxlIGlmIG1heE5vbnplcm9Db3VudDoyLFxyXG4gICAgICAvLyB0aGUgZmluZGVyIHdpbGwgbmV2ZXIgcmVwb3J0IHRocmVlIG5vbi16ZXJvIG51bWVyYXRvcnMgZm9yIGRpZmZlcmVudCBkZW5vbWluYXRvcnMuXHJcbiAgICAgIG1heE5vbnplcm9Db3VudCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWVxyXG4gICAgfSA9IG9wdGlvbnMgfHwge307XHJcblxyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG1heFF1YW50aXR5ID09PSAnbnVtYmVyJyAmJiBtYXhRdWFudGl0eSA+PSAxICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbWF4VG90YWxRdWFudGl0eSA9PT0gJ251bWJlcicgJiYgbWF4VG90YWxRdWFudGl0eSA+PSAxICk7XHJcblxyXG4gICAgY29uc3QgciA9IGZyYWN0aW9uLm51bWVyYXRvciAqIHRoaXMubGNtLm51bWJlciAvIGZyYWN0aW9uLmRlbm9taW5hdG9yO1xyXG5cclxuICAgIGNvbnN0IGVudHJpZXMgPSB0aGlzLmVudHJpZXM7XHJcbiAgICBjb25zdCBjb2VmZmljaWVudHMgPSBbXTtcclxuICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcclxuXHJcbiAgICAvLyBJZiBvdXIgbGNtIGlzIG5vdCBhIG11bHRpcGxlIG9mIHRoZSBmcmFjdGlvbidzIGRlbm9taW5hdG9yLCB3ZSB3aWxsIGhhdmUgbm8gcG9zc2libGUgc29sdXRpb25zLlxyXG4gICAgaWYgKCByICUgMSAhPT0gMCApIHtcclxuICAgICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgICB9XHJcblxyXG4gICAgKCBmdW5jdGlvbiByZWN1ciggaW5kZXgsIHJlbWFpbmRlciwgdG90YWxDb3VudCwgbm9uemVyb0NvdW50ICkge1xyXG4gICAgICBjb25zdCBlbnRyeSA9IGVudHJpZXNbIGluZGV4IF07XHJcbiAgICAgIGNvbnN0IG1heENvZWZmaWNpZW50ID0gTWF0aC5taW4oIG1heFF1YW50aXR5LCBNYXRoLmZsb29yKCByZW1haW5kZXIgLyBlbnRyeS5pbnZlcnNlTnVtYmVyICksIG1heFRvdGFsUXVhbnRpdHkgLSB0b3RhbENvdW50ICk7XHJcbiAgICAgIGlmICggaW5kZXggPT09IGVudHJpZXMubGVuZ3RoIC0gMSApIHtcclxuICAgICAgICAvLyBJZiB3ZSBoYXZlIGFuIGV4YWN0IHNvbHV0aW9uLCB0aGVuIG1heENvZWZmaWNpZW50IHNob3VsZCBiZSBvdXIgc29sZSBzb2x1dGlvbiBkdWUgdG8gdGhlIGRpdmlzaW9uXHJcbiAgICAgICAgY29uc3QgY29lZmZpY2llbnQgPSBtYXhDb2VmZmljaWVudDtcclxuICAgICAgICBjb25zdCBzdWJSZW1haW5kZXIgPSByZW1haW5kZXIgLSBjb2VmZmljaWVudCAqIGVudHJ5LmludmVyc2VOdW1iZXI7XHJcbiAgICAgICAgaWYgKCBzdWJSZW1haW5kZXIgPT09IDAgKSB7XHJcbiAgICAgICAgICAvLyBXZSBoYXZlIGEgc29sdXRpb24hXHJcblxyXG4gICAgICAgICAgY29lZmZpY2llbnRzLnB1c2goIGNvZWZmaWNpZW50ICk7XHJcbiAgICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gc2VsZi51bml0Q29sbGVjdGlvbkZyb21Db2VmZmljaWVudHMoIGNvZWZmaWNpZW50cyApO1xyXG4gICAgICAgICAgY29lZmZpY2llbnRzLnBvcCgpO1xyXG5cclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbGxlY3Rpb24udG90YWxGcmFjdGlvbi5yZWR1Y2VkKCkuZXF1YWxzKCBmcmFjdGlvbi5yZWR1Y2VkKCkgKSApO1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGNvbGxlY3Rpb24ucXVhbnRpdGllcy5mb3JFYWNoKCBxdWFudGl0eSA9PiBhc3NlcnQoIHF1YW50aXR5IDw9IG1heFF1YW50aXR5ICkgKTtcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uc3VtKCBjb2xsZWN0aW9uLnF1YW50aXRpZXMgKSA8PSBtYXhUb3RhbFF1YW50aXR5ICk7XHJcblxyXG4gICAgICAgICAgcmVzdWx0cy5wdXNoKCBjb2xsZWN0aW9uICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGZvciAoIGxldCBjb2VmZmljaWVudCA9IDA7IGNvZWZmaWNpZW50IDw9IG1heENvZWZmaWNpZW50OyBjb2VmZmljaWVudCsrICkge1xyXG4gICAgICAgICAgY29uc3Qgc3ViUmVtYWluZGVyID0gcmVtYWluZGVyIC0gY29lZmZpY2llbnQgKiBlbnRyeS5pbnZlcnNlTnVtYmVyO1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc3ViUmVtYWluZGVyID49IDAgKTtcclxuXHJcbiAgICAgICAgICBjb2VmZmljaWVudHMucHVzaCggY29lZmZpY2llbnQgKTtcclxuXHJcbiAgICAgICAgICBsZXQgY29uc3RyYWludHNTYXRpc2ZpZWQgPSB0cnVlO1xyXG4gICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZW50cnkuY29uc3RyYWludHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbnN0cmFpbnQgPSBlbnRyeS5jb25zdHJhaW50c1sgaSBdO1xyXG4gICAgICAgICAgICBpZiAoICFjb25zdHJhaW50LnNhdGlzZmllcyggciwgY29lZmZpY2llbnRzICkgKSB7XHJcbiAgICAgICAgICAgICAgY29uc3RyYWludHNTYXRpc2ZpZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3QgbmV4dE5vbnplcm9Db3VudCA9IG5vbnplcm9Db3VudCArICggY29lZmZpY2llbnQgPiAwID8gMSA6IDAgKTtcclxuXHJcbiAgICAgICAgICBpZiAoIGNvbnN0cmFpbnRzU2F0aXNmaWVkICYmIG5leHROb256ZXJvQ291bnQgPD0gbWF4Tm9uemVyb0NvdW50ICkge1xyXG4gICAgICAgICAgICByZWN1ciggaW5kZXggKyAxLCBzdWJSZW1haW5kZXIsIHRvdGFsQ291bnQgKyBjb2VmZmljaWVudCwgbmV4dE5vbnplcm9Db3VudCApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvZWZmaWNpZW50cy5wb3AoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKSggMCwgciwgMCwgMCApO1xyXG5cclxuICAgIHJldHVybiByZXN1bHRzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTGlrZSBzZWFyY2goKSBhYm92ZSwgYnV0IHdpdGggXCJzaW1wbGVcIiBsb2dpYyAoYW5kIHNsb3dlcikgZm9yIHVuaXQgdGVzdCB2ZXJpZmljYXRpb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtGcmFjdGlvbn0gZnJhY3Rpb25cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICogQHJldHVybnMge0FycmF5LjxVbml0Q29sbGVjdGlvbj59XHJcbiAgICovXHJcbiAgYnJ1dGVGb3JjZVNlYXJjaCggZnJhY3Rpb24sIG9wdGlvbnMgKSB7XHJcbiAgICBjb25zdCB7XHJcbiAgICAgIC8vIHtudW1iZXJ9IC0gVGhlIG1heGltdW0gcG9zc2libGUgcXVhbnRpdHkgZm9yIGVhY2ggaW5kaXZpZHVhbCBkZW5vbWluYXRvciAoc28gZS5nLiBpZiBtYXhRdWFudGl0eTo0LCB0aGVcclxuICAgICAgLy8gZmluZGVyIHdpbGwgbmV2ZXIgcmVwb3J0IDUgaGFsdmVzKS5cclxuICAgICAgbWF4UXVhbnRpdHkgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXHJcblxyXG4gICAgICAvLyB7bnVtYmVyfSAtIFRoZSBtYXhpbXVtIHBvc3NpYmxlIHF1YW50aXR5IHRvdGFsIGluY2x1ZGluZyBhbGwgZGVub21pbmF0b3JzIChzbyBlLmcuIGlmIG1heFRvdGFsUXVhbnRpdHk6NCxcclxuICAgICAgLy8gdGhlIGZpbmRlciB3aWxsIG5ldmVyIHJlcG9ydCAyIGhhbHZlcyBhbmQgMyB0aGlyZHMpLlxyXG4gICAgICBtYXhUb3RhbFF1YW50aXR5ID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZXHJcbiAgICB9ID0gb3B0aW9ucyB8fCB7fTtcclxuXHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbWF4UXVhbnRpdHkgPT09ICdudW1iZXInICYmIG1heFF1YW50aXR5ID49IDEgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBtYXhUb3RhbFF1YW50aXR5ID09PSAnbnVtYmVyJyAmJiBtYXhUb3RhbFF1YW50aXR5ID49IDEgKTtcclxuXHJcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5lbnRyaWVzO1xyXG4gICAgY29uc3QgcmVzdWx0cyA9IFtdO1xyXG4gICAgY29uc3QgY29lZmZpY2llbnRzID0gW107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBJbmRleCBpbnRvIG91ciBkZW5vbWluYXRvcnNcclxuICAgICAqIEBwYXJhbSB7RnJhY3Rpb259IHJlbWFpbmRlclxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRvdGFsQ291bnRcclxuICAgICAqL1xyXG4gICAgKCBmdW5jdGlvbiByZWN1ciggaW5kZXgsIHJlbWFpbmRlciwgdG90YWxDb3VudCApIHtcclxuICAgICAgY29uc3QgZGVub21pbmF0b3IgPSBlbnRyaWVzWyBpbmRleCBdLmRlbm9taW5hdG9yTnVtYmVyO1xyXG5cclxuICAgICAgZm9yICggbGV0IGNvZWZmaWNpZW50ID0gMDsgY29lZmZpY2llbnQgPD0gbWF4UXVhbnRpdHk7IGNvZWZmaWNpZW50KysgKSB7XHJcbiAgICAgICAgY29uc3Qgc3ViUmVtYWluZGVyID0gcmVtYWluZGVyLm1pbnVzKCBuZXcgRnJhY3Rpb24oIGNvZWZmaWNpZW50LCBkZW5vbWluYXRvciApICk7XHJcbiAgICAgICAgaWYgKCBzdWJSZW1haW5kZXIudmFsdWUgPCAwIHx8IGNvZWZmaWNpZW50ICsgdG90YWxDb3VudCA+IG1heFRvdGFsUXVhbnRpdHkgKSB7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvZWZmaWNpZW50cy5wdXNoKCBjb2VmZmljaWVudCApO1xyXG4gICAgICAgIGlmICggaW5kZXggPT09IGVudHJpZXMubGVuZ3RoIC0gMSApIHtcclxuICAgICAgICAgIGlmICggc3ViUmVtYWluZGVyLm51bWVyYXRvciA9PT0gMCApIHtcclxuICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIHNvbHV0aW9uIVxyXG4gICAgICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gc2VsZi51bml0Q29sbGVjdGlvbkZyb21Db2VmZmljaWVudHMoIGNvZWZmaWNpZW50cyApO1xyXG5cclxuICAgICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggY29sbGVjdGlvbi50b3RhbEZyYWN0aW9uLnJlZHVjZWQoKS5lcXVhbHMoIGZyYWN0aW9uLnJlZHVjZWQoKSApICk7XHJcbiAgICAgICAgICAgIGFzc2VydCAmJiBjb2xsZWN0aW9uLnF1YW50aXRpZXMuZm9yRWFjaCggcXVhbnRpdHkgPT4gYXNzZXJ0KCBxdWFudGl0eSA8PSBtYXhRdWFudGl0eSApICk7XHJcbiAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uc3VtKCBjb2xsZWN0aW9uLnF1YW50aXRpZXMgKSA8PSBtYXhUb3RhbFF1YW50aXR5ICk7XHJcblxyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2goIGNvbGxlY3Rpb24gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICByZWN1ciggaW5kZXggKyAxLCBzdWJSZW1haW5kZXIsIHRvdGFsQ291bnQgKyBjb2VmZmljaWVudCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb2VmZmljaWVudHMucG9wKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKSggMCwgZnJhY3Rpb24sIDAgKTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0cztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBlcm11dGVzIGFuZCBwYWRzIGNvZWZmaWNpZW50cyB0byBjcmVhdGUgYSBVbml0Q29sbGVjdGlvbi5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48bnVtYmVyPn0gY29lZmZpY2llbnRzIC0gSW4gdGhlIHNhbWUgb3JkZXIgYXMgb3VyIGVudHJpZXMsIGUuZy4gY29lZmZpY2llbnRzWyBpIF0gaXMgdGhlXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29lZmZpY2llbnQgZm9yIGVudHJpZXNbIGkgXS5cclxuICAgKiBAcmV0dXJucyB7VW5pdENvbGxlY3Rpb259XHJcbiAgICovXHJcbiAgdW5pdENvbGxlY3Rpb25Gcm9tQ29lZmZpY2llbnRzKCBjb2VmZmljaWVudHMgKSB7XHJcbiAgICAvLyB7QXJyYXkuPG51bWJlcj59IC0gQ29uc3RydWN0IHNvbWUgcGVybXV0ZWQgY29lZmZpY2llbnRzIGluIHRoZSBcImNvcnJlY3RcIiBvcmRlclxyXG4gICAgY29uc3QgcGVybXV0ZWRDb2VmZmljaWVudHMgPSBbXTtcclxuXHJcbiAgICAvLyBaZXJvLXBhZCwgc2luY2Ugd2UgbWF5IGhhdmUgc29tZSBkZW5vbWluYXRvcnMgXCJtaXNzaW5nXCJcclxuICAgIHdoaWxlICggcGVybXV0ZWRDb2VmZmljaWVudHMubGVuZ3RoIDwgdGhpcy5tYXhEZW5vbWluYXRvck51bWJlciApIHtcclxuICAgICAgcGVybXV0ZWRDb2VmZmljaWVudHMucHVzaCggMCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZpbGwgaW4gdGhlIGNvZWZmaWNpZW50cyB3ZSBkbyBoYXZlLlxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY29lZmZpY2llbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBwZXJtdXRlZENvZWZmaWNpZW50c1sgdGhpcy5jb2xsZWN0aW9uSW5kZXhNYXBbIGkgXSBdID0gY29lZmZpY2llbnRzWyBpIF07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ldyBVbml0Q29sbGVjdGlvbiggcGVybXV0ZWRDb2VmZmljaWVudHMgKTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIEVudHJ5IHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1ByaW1lRmFjdG9yaXphdGlvbn0gZGVub21pbmF0b3JcclxuICAgKiBAcGFyYW0ge1ByaW1lRmFjdG9yaXphdGlvbn0gaW52ZXJzZVxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPENvbnN0cmFpbnQ+fSBjb25zdHJhaW50c1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBkZW5vbWluYXRvciwgaW52ZXJzZSwgY29uc3RyYWludHMgPSBbXSApIHtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcmltZUZhY3Rvcml6YXRpb259XHJcbiAgICB0aGlzLmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJpbWVGYWN0b3JpemF0aW9ufVxyXG4gICAgdGhpcy5pbnZlcnNlID0gaW52ZXJzZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48Q29uc3RyYWludD59XHJcbiAgICB0aGlzLmNvbnN0cmFpbnRzID0gY29uc3RyYWludHM7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy5kZW5vbWluYXRvck51bWJlciA9IGRlbm9taW5hdG9yLm51bWJlcjtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9XHJcbiAgICB0aGlzLmludmVyc2VOdW1iZXIgPSBpbnZlcnNlLm51bWJlcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzdHJpbmcgZm9ybSBvZiB0aGUgZW50cnksIGZvciBkZWJ1Z2dpbmcuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICB0b1N0cmluZygpIHtcclxuICAgIHJldHVybiBgJHt0aGlzLmRlbm9taW5hdG9yfSR7dGhpcy5jb25zdHJhaW50cy5tYXAoIGMgPT4gYFxcbiAgJHtjfWAgKX1gO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgQ29uc3RyYWludCB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQcmltZUZhY3Rvcml6YXRpb259IGRpdmlzb3JcclxuICAgKiBAcGFyYW0ge0FycmF5LjxQcmltZUZhY3Rvcml6YXRpb24+fSBkZW5vbWluYXRvcnNcclxuICAgKiBAcGFyYW0ge1ByaW1lRmFjdG9yaXphdGlvbn0gbGNtXHJcbiAgICogQHBhcmFtIHtBcnJheS48bnVtYmVyPn0gZGVub21pbmF0b3JJbmRpY2VzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGRpdmlzb3IsIGRlbm9taW5hdG9ycywgbGNtLCBkZW5vbWluYXRvckluZGljZXMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkaXZpc29yIGluc3RhbmNlb2YgUHJpbWVGYWN0b3JpemF0aW9uICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBkZW5vbWluYXRvcnMgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGRlbm9taW5hdG9ycy5mb3JFYWNoKCBkID0+IGFzc2VydCggZCBpbnN0YW5jZW9mIFByaW1lRmFjdG9yaXphdGlvbiApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsY20gaW5zdGFuY2VvZiBQcmltZUZhY3Rvcml6YXRpb24gKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGRlbm9taW5hdG9ySW5kaWNlcyApICk7XHJcbiAgICBhc3NlcnQgJiYgZGVub21pbmF0b3JJbmRpY2VzLmZvckVhY2goIGkgPT4gYXNzZXJ0KCB0eXBlb2YgaSA9PT0gJ251bWJlcicgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZGVub21pbmF0b3JzLmxlbmd0aCA9PT0gZGVub21pbmF0b3JJbmRpY2VzLmxlbmd0aCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1ByaW1lRmFjdG9yaXphdGlvbn1cclxuICAgIHRoaXMuZGl2aXNvciA9IGRpdmlzb3I7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPFByaW1lRmFjdG9yaXphdGlvbj59XHJcbiAgICB0aGlzLmRlbm9taW5hdG9ycyA9IGRlbm9taW5hdG9ycztcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7UHJpbWVGYWN0b3JpemF0aW9ufVxyXG4gICAgdGhpcy5sY20gPSBsY207XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0FycmF5LjxudW1iZXI+fVxyXG4gICAgdGhpcy5kZW5vbWluYXRvckluZGljZXMgPSBkZW5vbWluYXRvckluZGljZXM7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn1cclxuICAgIHRoaXMuZGl2aXNvck51bWJlciA9IGRpdmlzb3IubnVtYmVyO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBcnJheS48bnVtYmVyPn1cclxuICAgIHRoaXMuZGVub21pbmF0b3JDb2VmZmljaWVudHMgPSBkZW5vbWluYXRvcnMubWFwKCBkID0+IGxjbS5kaXZpZGVkKCBkICkubnVtYmVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBjb25zdHJhaW50IGlzIHNhdGlzZmllZCBieSB0aGUgZ2l2ZW4gdG90YWwgKHIgPSBsY20gKiBmcmFjdGlvbikgYW5kIHRoZSBjb2VmZmljaWVudHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJcclxuICAgKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fSBjb2VmZmljaWVudHNcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBzYXRpc2ZpZXMoIHIsIGNvZWZmaWNpZW50cyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiByID09PSAnbnVtYmVyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggY29lZmZpY2llbnRzICkgKTtcclxuXHJcbiAgICBsZXQgc3VtID0gMDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuZGVub21pbmF0b3JDb2VmZmljaWVudHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHN1bSArPSBjb2VmZmljaWVudHNbIHRoaXMuZGVub21pbmF0b3JJbmRpY2VzWyBpIF0gXSAqIHRoaXMuZGVub21pbmF0b3JDb2VmZmljaWVudHNbIGkgXTtcclxuICAgIH1cclxuICAgIHJldHVybiAoIHIgJSB0aGlzLmRpdmlzb3JOdW1iZXIgKSA9PT0gKCBzdW0gJSB0aGlzLmRpdmlzb3JOdW1iZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzdHJpbmcgZm9ybSBvZiB0aGUgZW50cnksIGZvciBkZWJ1Z2dpbmcuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICB0b1N0cmluZygpIHtcclxuICAgIHJldHVybiBgciA9IGYoJHt0aGlzLmRlbm9taW5hdG9ycy5qb2luKCAnLCcgKX0pIChtb2QgJHt0aGlzLmRpdmlzb3J9KWA7XHJcbiAgfVxyXG59XHJcblxyXG5mcmFjdGlvbnNDb21tb24ucmVnaXN0ZXIoICdDb2xsZWN0aW9uRmluZGVyJywgQ29sbGVjdGlvbkZpbmRlciApO1xyXG5leHBvcnQgZGVmYXVsdCBDb2xsZWN0aW9uRmluZGVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFFBQVEsTUFBTSw2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