// Copyright 2018-2021, University of Colorado Boulder

/**
 * Represents and handles generation of the levels for the "building" style fractions sims.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import arrayDifference from '../../../../phet-core/js/arrayDifference.js';
import merge from '../../../../phet-core/js/merge.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import PrimeFactorization from '../../common/model/PrimeFactorization.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import CollectionFinder from './CollectionFinder.js';
import FilledPartition from './FilledPartition.js';
import FillType from './FillType.js';
import FractionChallenge from './FractionChallenge.js';
import ShapePartition from './ShapePartition.js';
import ShapeTarget from './ShapeTarget.js';

// Convenience functions.
const nextBoolean = () => dotRandom.nextBoolean();
const sample = array => dotRandom.sample(array);
const shuffle = array => dotRandom.shuffle(array);
const nextIntBetween = (a, b) => dotRandom.nextIntBetween(a, b);
const choose = (q, i) => FractionLevel.choose(q, i);
const inclusive = (a, b) => _.range(a, b + 1);
const repeat = (q, i) => _.times(q, () => i);
const splittable = array => array.filter(f => f.denominator <= 4);
const notSplittable = array => array.filter(f => f.denominator > 4);
const chooseSplittable = (q, i, c = 1) => [...choose(c, splittable(i)), ...choose(q - c, i)];

// constants
const collectionFinder8 = new CollectionFinder({
  // default denominators to match the Java search
  denominators: inclusive(1, 8).map(PrimeFactorization.factor)
});
const collectionFinder9 = new CollectionFinder({
  // default denominators to match the Java search
  denominators: inclusive(1, 9).map(PrimeFactorization.factor)
});
const COLORS_3 = [FractionsCommonColors.level1Property, FractionsCommonColors.level2Property, FractionsCommonColors.level3Property];
const COLORS_4 = [...COLORS_3, FractionsCommonColors.level4Property];

// common lists of fractions needed
const expandableMixedNumbersFractions = _.flatten(inclusive(1, 3).map(whole => {
  return [new Fraction(1, 2), new Fraction(1, 3), new Fraction(2, 3), new Fraction(1, 4), new Fraction(3, 4)].map(f => f.plusInteger(whole));
}));
const mixedNumbersFractions = _.flatten(inclusive(1, 3).map(whole => {
  return [new Fraction(1, 2), new Fraction(1, 3), new Fraction(2, 3), new Fraction(1, 4), new Fraction(3, 4), new Fraction(1, 5), new Fraction(2, 5), new Fraction(3, 5), new Fraction(4, 5), new Fraction(1, 6), new Fraction(5, 6), new Fraction(1, 7), new Fraction(2, 7), new Fraction(3, 7), new Fraction(4, 7), new Fraction(5, 7), new Fraction(6, 7), new Fraction(1, 8), new Fraction(3, 8), new Fraction(5, 8), new Fraction(7, 8), new Fraction(1, 9), new Fraction(2, 9), new Fraction(4, 9), new Fraction(5, 9), new Fraction(7, 9), new Fraction(8, 9)].map(f => f.plusInteger(whole));
}));
const allMixedNumberFractions = _.flatten(inclusive(1, 3).map(whole => {
  return _.flatten(inclusive(2, 8).map(denominator => {
    return inclusive(1, denominator - 1).map(numerator => {
      return new Fraction(numerator, denominator).plusInteger(whole);
    });
  }));
}));
class FractionLevel {
  /**
   * @param {number} number
   * @param {number} numTargets
   * @param {BuildingType} buildingType
   * @param {ColorDef} color
   * @param {function} generateChallenge - function({number} levelNumber, {ColorDef} color): {FractionChallenge}
   */
  constructor(number, numTargets, buildingType, color, generateChallenge) {
    // @public {number}
    this.number = number;

    // @public {number}
    this.numTargets = numTargets;

    // @public {BuildingType}
    this.buildingType = buildingType;

    // @public {ColorDef}
    this.color = color;

    // @private {function}
    this.generateChallenge = generateChallenge;

    // @public {Property.<FractionChallenge>}
    this.challengeProperty = new Property(this.nextChallenge());

    // Clear out the initial value so that we don't leak memory (since they retain a reference to the previous
    // challenge).
    this.challengeProperty._initialValue = null;

    // @public {Property.<number>}
    this.scoreProperty = new DynamicProperty(this.challengeProperty, {
      derive: 'scoreProperty'
    });
  }

  /**
   * Returns a fresh FractionChallenge that satisfies constraints.
   * @private
   *
   * @returns {FractionChallenge}
   */
  nextChallenge() {
    let challenge = null;
    do {
      challenge = this.generateChallenge(this.number, this.color);
    } while (challenge.getLargestStackLayoutQuantity() > 10);
    return challenge;
  }

  /**
   * Resets the object.
   * @public
   */
  reset() {
    // Note it as a refreshed challenge, so that we'll dissolve to it if needed.
    const nextChallenge = this.nextChallenge();
    this.challengeProperty.value.refreshedChallenge = nextChallenge;
    this.challengeProperty.value = nextChallenge;
  }

  /**
   * Returns a random subset of the items (without replacement), in a random order.
   * @public
   *
   * @param {number} quantity
   * @param {Array.<*>} items
   * @returns {Array.<*>}
   */
  static choose(quantity, items) {
    assert && assert(typeof quantity === 'number');
    assert && assert(Array.isArray(items));
    assert && assert(items.length >= quantity);
    return shuffle(items).slice(0, quantity);
  }

  /**
   * Returns a list of unit (1/x) fractions from a list of fractions, such that each (A/B) is converted to Ax (1/B).
   * @private
   *
   * @param {Array.<Fraction>} fractions
   * @returns {Array.<Fraction>}
   */
  static unitFractions(fractions) {
    return _.flatten(fractions.map(fraction => {
      return repeat(fraction.numerator, new Fraction(1, fraction.denominator));
    }));
  }

  /**
   * Returns a list of unit (1/x) fractions from a list of fractions (handling mixed fractions), such that
   * each (A B/C) is converted to Ax (1/1) and Bx (1/C).
   * @private
   *
   * @param {Array.<Fraction>} fractions
   * @returns {Array.<Fraction>}
   */
  static straightforwardFractions(fractions) {
    return _.flatten(fractions.map(fraction => {
      const whole = Math.floor(fraction.value);
      return [...repeat(whole, new Fraction(1, 1)), ...repeat(fraction.numerator - whole * fraction.denominator, new Fraction(1, fraction.denominator))];
    }));
  }

  /**
   * Finds fractions suitable for shape group containers, minimizing the number of pieces total. For example for
   * 1/2 and 13/8, it splits wholes away (1/1, 1/2 and 5/8), splits 5/8 into 1/2 + 1/8, and returns 1/1,1/2,1/2,1/8
   * in a non-important order.
   * @private
   *
   * @param {Array.<Fraction>}
   * @returns {Fraction}
   */
  static minimizedFractions(fractions) {
    return _.flatten(fractions.map(fraction => {
      const whole = Math.floor(fraction.value);
      const remainder = fraction.minusInteger(whole);
      const collections = collectionFinder8.search(remainder);
      const collection = _.sortBy(collections, 'totalQuantities')[0];
      return [...repeat(whole, new Fraction(1, 1)), ...collection.unitFractions];
    }));
  }

  /**
   * Picks at random a "fairly low number of fractions" that add up to the given fraction.
   * @private
   *
   * @param {Fraction} fraction
   * @param {number} [quantity] - Return a random set from the top `quantity` of possibilities.
   */
  static interestingFractions(fraction, quantity = 5) {
    let collections = collectionFinder8.search(fraction);
    assert && assert(collections.length);

    // Java comment:
    //In order to remove the tedium but still require creation of interesting shapes, sort by the number of pieces
    //required to create the fraction
    //and choose one of the solutions with a small number of cards.
    _.sortBy(collections, collection => collection.totalQuantities);
    const filteredCollections = collections.filter(collection => collection.fractions.length > 1);
    // The Java code used collections with more than one denominator whenever possible
    if (filteredCollections.length) {
      collections = filteredCollections;
    }
    collections = collections.slice(0, quantity);
    return sample(collections).unitFractions;
  }

  /**
   * Returns a list of fractions with an equivalent sum, where up to `quantity` fractions have been split into
   * sub-fractions.
   * @private
   *
   * @param {Array.<Fraction>} fractions
   * @param {Object} [options]
   * @returns {Array.<Fraction>}
   */
  static simpleSplitFractions(fractions, options) {
    options = merge({
      // {number} - Up to how many fractions to split
      quantity: Number.POSITIVE_INFINITY,
      // {number} - The maximum denominator to consider for a split (any larger denominators will be ignored)
      maxDenominator: 4,
      // {Array.<Array.<Fraction>>} - Partitions that add up to 1, in a distribution that will evenly create denominators
      splits: [[new Fraction(1, 2), new Fraction(1, 2)], [new Fraction(1, 2), new Fraction(1, 2)], [new Fraction(1, 2), new Fraction(1, 2)], [new Fraction(1, 3), new Fraction(1, 3), new Fraction(1, 3)], [new Fraction(1, 3), new Fraction(1, 3), new Fraction(1, 3)]]
    }, options);

    // Make a copy of all fractions, so we have unique instances (for down below)
    fractions = fractions.map(f => f.copy());
    const availableFractions = fractions.filter(f => f.denominator <= options.maxDenominator);
    const fractionsToChange = choose(Math.min(options.quantity, availableFractions.length), availableFractions);
    const otherFractions = arrayDifference(fractions, fractionsToChange);
    return [..._.flatten(fractionsToChange.map(fraction => {
      const availableSplits = options.splits.filter(splitFractions => _.every(splitFractions, splitFraction => {
        return splitFraction.denominator * fraction.denominator <= 8;
      }));
      return sample(availableSplits).map(f => f.times(fraction));
    })), ...otherFractions];
  }

  /**
   * Returns an (optionally) filtered list of fractions from the list of numerators/denominators.
   * @public
   *
   * @param {Array.<number>} numerators
   * @param {Array.<number>} denominators
   * @param {function} [predicate] - function( {Fraction} ): {boolean}
   * @returns {Array.<Fraction>}
   */
  static fractions(numerators, denominators, predicate = _.constant(true)) {
    return _.flatten(numerators.map(numerator => {
      return denominators.map(denominator => {
        return new Fraction(numerator, denominator);
      }).filter(predicate);
    }));
  }

  /**
   * Returns a list of numbers required exactly for the given fractions (for number challenges).
   * @public
   *
   * @param {Array.<Fraction>}
   * @returns {Array.<number>}
   */
  static exactNumbers(fractions) {
    return _.flatten(fractions.map(fraction => [fraction.numerator, fraction.denominator])).filter(_.identity);
  }

  /**
   * Returns a list of numbers required exactly for the given fractions (for number challenges).
   * @public
   *
   * @param {Array.<Fraction>}
   * @returns {Array.<number>}
   */
  static exactMixedNumbers(fractions) {
    return _.flatten(fractions.map(fraction => {
      const whole = Math.floor(fraction.value);
      fraction = fraction.minus(new Fraction(whole, 1));
      return [whole, fraction.numerator, fraction.denominator];
    })).filter(_.identity);
  }

  /**
   * Returns a multiplied version of the fraction (equal to the same value, but larger numerator and denominator).
   * @private
   *
   * @param {Fraction} fraction
   * @returns {Fraction}
   */
  static multiplyFraction(fraction) {
    const multiplier = sample(fraction.denominator <= 4 ? fraction.denominator <= 3 ? [2, 3] : [2] : [1]);
    return new Fraction(fraction.numerator * multiplier, fraction.denominator * multiplier);
  }

  /**
   * Returns a list of numbers required exactly for the given fractions (for number challenges), but multiplied by
   * a given factor.
   * @public
   *
   * @param {Array.<Fraction>}
   * @param {boolean} separateWhole - If true, the whole portion will be separated out into a card of its own.
   * @returns {Array.<number>}
   */
  static multipliedNumbers(fractions, separateWhole) {
    return _.flatten(fractions.map(fraction => {
      const result = [];

      // Add the whole part (if applicable)
      if (separateWhole) {
        const whole = Math.floor(fraction.value);
        if (whole > 0) {
          result.push(whole);
          fraction = fraction.minus(new Fraction(whole, 1));
        }
      }

      // Add the numerator/denominator
      const multiplier = sample(fraction.denominator <= 4 ? fraction.denominator <= 3 ? [2, 3] : [2] : [1]);
      result.push(fraction.numerator * multiplier);
      result.push(fraction.denominator * multiplier);
      return result;
    })).filter(_.identity);
  }

  /**
   * Returns a list of numbers required exactly for the given fractions (for number challenges), but with a certain
   * quantity of them multiplied by a random factor.
   * @public
   *
   * @param {Array.<Fraction>}
   * @param {number} quantity
   * @param {boolean} separateWhole - If true, the whole portion will be separated out into a card of its own.
   * @returns {Array.<number>}
   */
  static withMultipliedNumbers(fractions, quantity, separateWhole) {
    assert && assert(typeof separateWhole === 'boolean');
    let breakable = shuffle(splittable(fractions));
    let unbreakable = notSplittable(fractions);

    // TODO: see decision on https://github.com/phetsims/fractions-common/issues/8, what to do if we lack the
    // number of breakable bits?
    // assert && assert( breakable.length >= quantity );

    // Reshape the arrays so that we have at most `quantity` in breakable (we'll multiply those)
    if (breakable.length > quantity) {
      unbreakable = [...unbreakable, ...breakable.slice(quantity)];
      breakable = breakable.slice(0, quantity);
    }
    return [...(separateWhole ? FractionLevel.exactMixedNumbers(unbreakable) : FractionLevel.exactNumbers(unbreakable)), ...FractionLevel.multipliedNumbers(breakable, separateWhole)];
  }

  /**
   * Creates ShapeTargets from a list of fractions, finding matching shape partitions.
   * @private
   *
   * @param {Array.<ShapePartition>} shapePartitions
   * @param {Array.<Fraction>} fractions
   * @param {Array.<ColorDef>} colors
   * @param {FillType|null} fillType - If null, will have the chance of being sequential or random.
   * @param {boolean} [allowSubdivision] - If true, it could use a partition with e.g. 9 shapes for a denominator of 3
   * @returns {Array.<ShapeTarget>}
   */
  static targetsFromFractions(shapePartitions, fractions, colors, fillType, allowSubdivision = false) {
    colors = shuffle(colors);
    return fractions.map((fraction, index) => {
      const potentialPartitions = allowSubdivision ? ShapePartition.supportsDivisibleDenominator(shapePartitions, fraction.denominator) : ShapePartition.supportsDenominator(shapePartitions, fraction.denominator);
      const concreteFillType = fillType ? fillType : sample([FillType.SEQUENTIAL, FillType.MIXED]);
      return ShapeTarget.fill(sample(potentialPartitions), fraction, colors[index], concreteFillType);
    });
  }

  /**
   * Creates ShapeTargets from a list of shapePartitions (randomly selecting the partitions and THEN determining the
   * numerator from the partition's denominator).
   * @private
   *
   * @param {Array.<ShapePartition>} shapePartitions
   * @param {Array.<ColorDef>} colors
   * @param {function} denominatorToNumerator - function( {number} denominator ): {number}
   * @param {FillType|null} fillType - If null, will have the chance of being sequential or random.
   * @returns {Array.<ShapeTarget>}
   */
  static targetsFromPartitions(shapePartitions, colors, denominatorToNumerator, fillType) {
    colors = shuffle(colors);
    return shapePartitions.map((shapePartition, index) => {
      const denominator = shapePartition.length;
      const concreteFillType = fillType ? fillType : sample([FillType.SEQUENTIAL, FillType.MIXED]);
      return ShapeTarget.fill(shapePartition, new Fraction(denominatorToNumerator(denominator), denominator), colors[index], concreteFillType);
    });
  }

  /**
   * Splits a fraction into a "difficult" number of pieces that are suitable to fit into shape group containers
   * (should fit into ceil(fraction.value) different containers of size 1).
   * @private
   *
   * @param {Fraction} fraction
   * @param {number} [maxNonzeroCount] - Only allow up to this many different denominators in the result.
   * @returns {Array.<Fraction>}
   */
  static difficultSplit(fraction, maxNonzeroCount = 5) {
    const wholeCount = Math.ceil(fraction.value);
    const fullWholeCount = Math.floor(fraction.value);
    const remainder = fraction.minusInteger(Math.floor(fraction.value));

    // Need to filter the collections so we don't end up needing too many whole sections
    const collections = shuffle(collectionFinder8.search(fraction, {
      maxNonzeroCount: maxNonzeroCount,
      maxTotalQuantity: fullWholeCount + remainder.numerator + 5,
      maxQuantity: Math.max(fraction.denominator - 1, 4)
    }));

    // Because of performance, just grab up to the first 40 legal collections
    const legalCollections = [];
    for (let i = 0; i < collections.length; i++) {
      const collection = collections[i];
      const compactRequiredGroups = collection.getCompactRequiredGroups(wholeCount, wholeCount);
      if (compactRequiredGroups !== null && compactRequiredGroups.length <= wholeCount) {
        legalCollections.push(collection);
      }
      if (legalCollections.length === 40) {
        break;
      }
    }
    const maxNondivisible = _.max(legalCollections.map(collection => collection.nondivisibleCount));

    // Don't always force the "most difficult" since that might be one or two options.
    const difficultCollections = legalCollections.filter(collection => collection.nondivisibleCount >= maxNondivisible - 1);
    const collection = sample(difficultCollections);

    // Break apart wholes
    return FractionLevel.simpleSplitFractions(collection.unitFractions, {
      maxDenominator: 1
    });
  }

  /**
   * Returns a difficult (varying denominator, random fill) shape target for a given fraction.
   * @private
   *
   * @param {Array.<ShapePartition>} shapePartitions
   * @param {Fraction} fraction
   * @param {ColorDef} color
   * @returns {ShapeTarget}
   */
  static difficultMixedShapeTarget(shapePartitions, fraction, color) {
    const wholeCount = Math.ceil(fraction.value);

    // Need to filter the collections so we don't end up needing too many whole sections
    const collections = collectionFinder9.search(fraction, {
      maxNonzeroCount: 4
    }).filter(collection => _.sum(collection.fractions.map(f => Math.ceil(f.value))) <= wholeCount);
    const maxNondivisible = _.max(collections.map(collection => collection.nondivisibleCount));
    // Don't always force the "most difficult" since that might be one or two options.
    const difficultCollections = collections.filter(collection => collection.nondivisibleCount >= maxNondivisible - 1);
    const collection = sample(difficultCollections);
    return new ShapeTarget(fraction, shuffle(_.flatten(collection.fractions.map(subFraction => {
      const shapePartition = sample(ShapePartition.supportsDenominator(shapePartitions, subFraction.denominator));
      return FilledPartition.randomFill(shapePartition, subFraction, color);
    }))));
  }

  /**
   * Creates a challenge for (unmixed) shapes level 1.
   * @public
   *
   * Design doc:
   * > Two "draws", one target should be from the set  {1/1, 2/2, 3/3} and the second draw for the next two targets
   * > from the set {1/2, 1/3, 2/3}
   *
   * We do three "draws", one from the first set, and two from the second set (if that's clear).
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level1Shapes(levelNumber, color) {
    const targetFractions = shuffle([...choose(1, [new Fraction(1, 1), new Fraction(2, 2), new Fraction(3, 3)]), ...choose(2, [new Fraction(1, 2), new Fraction(1, 3), new Fraction(2, 3)])]);
    const pieceFractions = [...repeat(2, new Fraction(1, 1)), ...repeat(2, new Fraction(1, 2)), ...repeat(3, new Fraction(1, 3))];
    return FractionChallenge.createShapeChallenge(levelNumber, false, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (unmixed) shapes level 2.
   * @public
   *
   * Design doc:
   * > Choosing from a distribution of fractions ranging from 1/2 to 4/5.  The numerator can be 1, 2, 3, or 4 and the
   * > denominator could be 2, 3, 4, or 5 with the stipulation that the fraction is always less than 1. No "wholes" in
   * > the shapes piles. 2 possible ways to make at least one of the targets
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level2Shapes(levelNumber, color) {
    const targetFractions = chooseSplittable(3, [new Fraction(1, 2), new Fraction(1, 3), new Fraction(1, 4), new Fraction(1, 5), new Fraction(2, 3), new Fraction(2, 4), new Fraction(2, 5), new Fraction(3, 4), new Fraction(3, 5), new Fraction(4, 5)]);
    const pieceFractions = [...FractionLevel.unitFractions(targetFractions), ...FractionLevel.interestingFractions(sample(splittable(targetFractions)))];
    return FractionChallenge.createShapeChallenge(levelNumber, false, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (unmixed) shapes level 3.
   * @public
   *
   * Design doc:
   * > Like level 2, but now fractions ranging from 1/1 to 6/6, and with "whole" pieces available.
   * > Number of pieces of each fraction allowing for multiple solutions
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level3Shapes(levelNumber, color) {
    const targetFractions = chooseSplittable(3, _.flatten(inclusive(1, 6).map(d => {
      return inclusive(1, d).map(n => new Fraction(n, d));
    })));
    const pieceFractions = [...FractionLevel.unitFractions(targetFractions.map(f => f.value === 1 ? Fraction.ONE : f)), ..._.flatten(targetFractions.map(f => FractionLevel.interestingFractions(f, 2)))];
    return FractionChallenge.createShapeChallenge(levelNumber, false, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (unmixed) shapes level 4.
   * @public
   *
   * Java doc:
   * > Goal: build the same targets with constrained pieces.
   * > 2 possible targets, which are {1/2, 1/1}.  For 1/1, constrain one of the targets so they must use two different
   * > sizes.  For instance, only enough halves and quarters so they must do 1 half piece and 2 quarter pieces. Or 2
   * > third pieces and 2 sixth pieces.
   *
   * Design doc:
   * > All 3 targets the same, 2 possible target values {1/2, 1/1}.
   * > No "whole" pieces available
   * > constrain one of the targets so that two different sizes must be used.
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level4Shapes(levelNumber, color) {
    let targetFractions;
    let pieceFractions;
    if (nextBoolean()) {
      // Java wholesLevel4
      targetFractions = repeat(3, new Fraction(1, 1));
      pieceFractions = [...repeat(3, new Fraction(1, 2)), ...repeat(3, new Fraction(1, 3)), ...repeat(3, new Fraction(1, 4)), ...repeat(3, new Fraction(1, 6))];
    } else {
      // Java halfLevel4, but custom-modified to have the constraint satisfied
      targetFractions = repeat(3, new Fraction(1, 2));
      pieceFractions = [new Fraction(1, 2), ...repeat(3, new Fraction(1, 3)), ...repeat(3, new Fraction(1, 4)), ...repeat(2, new Fraction(1, 6))];
    }
    return FractionChallenge.createShapeChallenge(levelNumber, false, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (unmixed) shapes level 5.
   * @public
   *
   * Java doc:
   * > Pie shapes for this level
   * > numerator able to range from 1-8, and denominator able to range from 1-8, with the number less than or equal to
   * > 1
   * > all pieces available to fulfill targets in the most straightforward way (so for instance if 3/8 appears there
   * > will 3 1/8 pieces)
   *
   * Design doc:
   * > - numerator able to range from 1-8, and denominator able to range from 1-8, with the number less than or equal
   * >   to 1
   * > - all pieces available to fulfill targets in the most straightforward way (so for instance if 3/8 appears there
   * >   will 3 1/8 pieces)
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level5Shapes(levelNumber, color) {
    const targetFractions = choose(3, inclusive(1, 8)).map(denominator => {
      return new Fraction(nextIntBetween(1, denominator), denominator);
    });
    const pieceFractions = FractionLevel.unitFractions(targetFractions);
    return FractionChallenge.createShapeChallenge(levelNumber, false, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (unmixed) shapes level 6.
   * @public
   *
   * Java doc:
   * > --all targets are made from only 2 stacks of the same size pieces
   * > --So for instance we give a stack of thirds and a stack of halves, and {2/3, 2/4, 5/6, 1/1} are the target
   * >   fractions, but we constrain the pieces so that some fractions must be made in "interesting" ways.  2/3 could
   * >   just be made with 2 third pieces, but 5/6 would need to be made of a 1/2 and a 1/3.
   * > --It seems the sets that would work well for pieces would be, {1/2, 1/3}, {1/2, 1/4}, {1/3, 1/4}, {1/2, 1/6},
   * >   {1/3, 1/6}, {1/4, 1/8}, {1/2, 1/8}
   * > --the constraint should be such that only enough pieces exist to complete the targets.
   * > Keep the values less than 1 by trial and error.
   *
   * Design doc:
   * > -- switch to 4 targets for this level
   * > -- all targets are made from only 2 stacks of pieces
   * > -- So for instance we give a stack of thirds and a stack of halves, and {2/3, 2/4, 5/6, 1/1} are the target
   * >    fractions, but we constrain the pieces so that some fractions must be made in "interesting" ways.  2/3
   * >    could just be made with 2 third pieces, but 5/6 would need to be made of a 1/2 and a 1/3.
   * > -- It seems the sets that would work well for pieces would be, {1/2, 1/3}, {1/2, 1/4}, {1/3, 1/4}, {1/2, 1/6},
   *      {1/3, 1/6}, {1/4, 1/8}, {1/2, 1/8}
   * > -- the constraint should be such that only enough pieces exist to complete the targets
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level6Shapes(levelNumber, color) {
    while (true) {
      // eslint-disable-line no-constant-condition

      // Java doc:
      //let's implement this my making each solution as na + mb, where a and b are the fractions from pairs above

      const cardSizes = sample([[2, 3], [2, 4], [3, 4], [2, 6], [3, 6], [4, 8], [2, 8]]);
      const selectedCoefficients = choose(4, [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1], [2, 2], [3, 1], [1, 3]]);
      const targetFractions = selectedCoefficients.map(([n, m]) => {
        return new Fraction(n, cardSizes[0]).plus(new Fraction(m, cardSizes[1])).reduced();
      });
      if (_.some(targetFractions, f => Fraction.ONE.isLessThan(f))) {
        continue;
      }
      const pieceFractions = _.flatten(selectedCoefficients.map(([n, m]) => {
        return [...repeat(n, new Fraction(1, cardSizes[0])), ...repeat(m, new Fraction(1, cardSizes[1]))];
      }));
      return FractionChallenge.createShapeChallenge(levelNumber, false, color, targetFractions, pieceFractions);
    }
  }

  /**
   * Creates a challenge for (unmixed) shapes level 7.
   * @public
   *
   * Java doc:
   * > --Top two targets, and bottom 2 targets are equivalent but still numbers less than 1
   * > -- A built in check to draw a different fraction for the top 2 and the bottom 2
   * > -- Possible fractions sets from which to draw 2 each {1/2, 1/3, 2/3, 1/4, 3/4, 5/6, 3/8, 5/8}
   * > -- Shape pieces constrained so that for instance if 1/2 and 1/2 appears for the top targets, a 1/2 piece might
   * >    be available but the other one will need to be made with a 1/4 and 1/4, or a 1/3 and a 1/6 or such.
   * > -- If 3/8 or 5/8 are drawn circles should be used, if not circles or tiles will work fine
   *
   * Design doc:
   * > --Top two targets, and bottom 2 targets are equivalent but still numbers less than 1
   * > -- A built in check to draw a different fraction for the top 2 and the bottom 2
   * > -- Possible fractions sets from which to draw 2 each {1/2, 1/3, 2/3, 1/4, 3/4, 5/6, 3/8, 5/8}
   * > -- Shape pieces constrained so that for instance if 1/2 and 1/2 appears for the top targets, a 1/2 piece might
   * >    be available but the other one will need to be made with a 1/4 and 1/4, or a 1/3 and a 1/6 or such.
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level7Shapes(levelNumber, color) {
    const selected = choose(2, [new Fraction(1, 2), new Fraction(1, 3), new Fraction(2, 3), new Fraction(1, 4), new Fraction(3, 4), new Fraction(5, 6), new Fraction(3, 8), new Fraction(5, 8)]);
    const targetFractions = [selected[0], selected[0], selected[1], selected[1]];
    const pieceFractions = _.flatten(_.flatten([choose(2, collectionFinder8.search(selected[0], {
      maxQuantity: 8
    })), choose(2, collectionFinder8.search(selected[1], {
      maxQuantity: 8
    }))]).map(collection => collection.unitFractions));
    return FractionChallenge.createShapeChallenge(levelNumber, false, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (unmixed) shapes level 8.
   * @public
   *
   * Java doc:
   * > -- Introduce numbers larger than 1 at this level
   * > -- On this level lets have at least 2 numbers larger than 1 as targets
   * > -- Enough pieces available to match targets in "obvious ways"...so if 5/4 is a target a whole piece is
   * >    available and a 1/4 piece available
   * > -- Students are first introduced to numbers greater than 1 only with 1/2's and 1/4's.  So if the number is
   * >    greater than 1 on level 8, it should be something like 3/2 or 4/2 or 7/4, since 1/2's and 1/4's are more
   * >    familiar to students (rather than 1/3's and such).
   *
   * Design doc:
   * > -- Introduce numbers larger than 1 at this level
   * > -- On this level  at least 2 numbers larger than 1 as targets
   * > -- Enough pieces available to match targets in "obvious ways"...so if 5/4 is a target a whole piece is
   * >    available and a 1/4 piece available for numbers larger than 1, uses only 1/2's or 1/4's on this level
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level8Shapes(levelNumber, color) {
    const targetFractions = shuffle([...choose(2, [new Fraction(3, 2), new Fraction(4, 2), new Fraction(5, 4), new Fraction(7, 4)]), ...choose(2, [new Fraction(2, 3), new Fraction(3, 4), new Fraction(2, 5), new Fraction(3, 5), new Fraction(4, 5)])]);
    const pieceFractions = FractionLevel.straightforwardFractions(targetFractions);
    return FractionChallenge.createShapeChallenge(levelNumber, false, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (unmixed) shapes level 9.
   * @public
   *
   * Java doc:
   * > --Same as level 8 but now some targets only allow "non-obvious" matches with pieces.  For instance, if the
   * >   target is greater than one, no "wholes" should be available.  So if 5/4 is a target it would need to be
   * >   built from something like 2 half pieces and a quarter piece
   *
   * Design doc:
   * > --Same as level 8 but now some targets only allow "non-obvious" matches with pieces.  For instance, if the
   * >   target is greater than one, no "wholes" should be available.  So if 5/4 is a target it would need to be
   * >   built from something like 2 half pieces and a quarter piece
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level9Shapes(levelNumber, color) {
    const targetFractions = shuffle([...choose(2, [new Fraction(3, 2), new Fraction(4, 2), new Fraction(5, 4), new Fraction(7, 4)]), ...choose(2, [new Fraction(2, 3), new Fraction(3, 4), new Fraction(2, 5), new Fraction(3, 5), new Fraction(4, 5)])]);
    const pieceFractions = [...FractionLevel.simpleSplitFractions(FractionLevel.straightforwardFractions(targetFractions.slice(0, 2)), {
      maxDenominator: 1
    }), ...FractionLevel.difficultSplit(targetFractions[2]), ...FractionLevel.difficultSplit(targetFractions[3])];
    return FractionChallenge.createShapeChallenge(levelNumber, false, color, shuffle(targetFractions), pieceFractions);
  }

  /**
   * Creates a challenge for (unmixed) shapes level 10.
   * @public
   *
   * Java doc:
   * > --Same as level 7 but now all targets are greater than one.
   * > --Still top two targets same, and bottom two targets the same
   * > --No whole pieces available, and targets must be built in interesting ways.  E.g., the target must be built
   * >   from 3 or more pieces as a way to constrain the pieces given. So for instance something like 4/3 would have
   * >   to be built by something like 1(half) + 2(quarters) + (1/3)
   *
   * Design doc:
   * > --Same as level 7 but now all targets are greater than one.
   * > --Still top two targets same, and bottom two targets the same
   * > --No whole pieces available, and targets must be built in interesting ways.  We could say something like the
   * >   target must be built from 3 or more pieces as a way to constrain the pieces given. So for instance something
   * >   like 4/3 would have to be built by something like 1(half) + 2(quarters) + (1/3)
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level10Shapes(levelNumber, color) {
    const fractions = choose(2, [new Fraction(3, 2), new Fraction(4, 3), new Fraction(5, 3), new Fraction(5, 4), new Fraction(7, 4), new Fraction(6, 5), new Fraction(7, 5), new Fraction(8, 5), new Fraction(9, 5), new Fraction(7, 6)]);
    const targetFractions = [fractions[0], fractions[0], fractions[1], fractions[1]];
    const pieceFractions = _.flatten(targetFractions.map(f => FractionLevel.difficultSplit(f)));
    return FractionChallenge.createShapeChallenge(levelNumber, false, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (mixed) shapes level 1.
   * @public
   *
   * Design doc:
   * -- {1:1/2, 2:1/2, 2:1/4} as the targets
   * -- Wholes, 1/2's, and 1/4's to complete targets
   * -- as before refreshing will randomly reorder targets, and choose between circles/rectangles
   * -- a few extra pieces to allow multiple pathways to a solution (for instance, 2 halves that could form a whole)
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level1ShapesMixed(levelNumber, color) {
    const targetFractions = shuffle([new Fraction(3, 2), new Fraction(5, 2), new Fraction(9, 4)]);
    const pieceFractions = [...FractionLevel.straightforwardFractions(targetFractions), new Fraction(1, 1), new Fraction(1, 2), new Fraction(1, 2), new Fraction(1, 4)];
    return FractionChallenge.createShapeChallenge(levelNumber, true, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (mixed) shapes level 2.
   * @public
   *
   * Design doc:
   * -- Targets with 1 or 2 as whole number, fractional portion from the set {1/2, 1/3, 2/3, ¼, ¾}
   * -- Wholes, 1/2's, 1/3's, and 1/4's
   * -- a few extra pieces to allow multiple pathways to a solution
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level2ShapesMixed(levelNumber, color) {
    const targetFractions = choose(3, _.flatten(inclusive(1, 2).map(whole => {
      return [new Fraction(1, 2), new Fraction(1, 3), new Fraction(2, 3), new Fraction(1, 4), new Fraction(3, 4)].map(f => f.plusInteger(whole));
    })));
    const pieceFractions = [...FractionLevel.straightforwardFractions(targetFractions), ..._.flatten(choose(2, [[new Fraction(1, 1)], [new Fraction(1, 2), new Fraction(1, 2)], [new Fraction(1, 3), new Fraction(1, 3), new Fraction(1, 3)], [new Fraction(1, 4), new Fraction(1, 4)]]))];
    return FractionChallenge.createShapeChallenge(levelNumber, true, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (mixed) shapes level 3.
   * @public
   *
   * Design doc:
   * -- All targets 1, 2, or 3, as whole number, fractional portion from the set {1/2, 1/3, 2/3, 1/4, 3/4, 1/6, 5/6}
   * -- a few extra pieces to allow multiple pathways to a solution
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level3ShapesMixed(levelNumber, color) {
    const targetFractions = choose(3, _.flatten(inclusive(1, 3).map(whole => {
      return [new Fraction(1, 2), new Fraction(1, 3), new Fraction(2, 3), new Fraction(1, 4), new Fraction(3, 4), new Fraction(1, 6), new Fraction(5, 6)].map(f => f.plusInteger(whole));
    })));
    const pieceFractions = [...FractionLevel.straightforwardFractions(targetFractions), ...FractionLevel.interestingFractions(sample(targetFractions))];
    return FractionChallenge.createShapeChallenge(levelNumber, true, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (mixed) shapes level 4.
   * @public
   *
   * Design doc:
   * -- All targets the same
   * -- 1, 2, or 3, as whole number, fractional portion from the set {1/2, 1/3, 2/3, ¼, ¾}
   * -- Pieces constrained so only enough pieces to complete targets.
   * -- Force some wholes to be built from fractional portions.  So if all targets were {1:1/2}, only 1 or 2 whole
   *    pieces would be available
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level4ShapesMixed(levelNumber, color) {
    const fraction = sample(_.flatten(inclusive(1, 3).map(whole => {
      return [new Fraction(1, 2), new Fraction(1, 3), new Fraction(2, 3), new Fraction(1, 4), new Fraction(3, 4)].map(f => f.plusInteger(whole));
    })));
    const targetFractions = [fraction.copy(), fraction.copy(), fraction.copy()];
    const pieceFractions = FractionLevel.simpleSplitFractions(FractionLevel.straightforwardFractions(targetFractions), {
      maxDenominator: 1,
      quantity: Math.floor(fraction.value) * 3 - 2
    });
    return FractionChallenge.createShapeChallenge(levelNumber, true, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (mixed) shapes level 5.
   * @public
   *
   * Design doc:
   * -- Targets with 1, 2, or 3, as whole number, fractional portion from the set {1/2, 1/3, 2/3, ¼, ¾, 1/5, 2/5, 3/5,
   *    4/5, 1/6, 5/6, 1/7, 2/7, 3/7, 4/7, 5/7, 6/7, 1/8, 3/8, 5/8, 7/8}
   * -- A few more cards than needed, but at least one target must be constructed with "nontrivial" pieces.  For
   *    instance {1:1/3} only have two 1/6 pieces available for building
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level5ShapesMixed(levelNumber, color) {
    const targetFractions = chooseSplittable(3, _.flatten(inclusive(1, 3).map(whole => {
      return [new Fraction(1, 2), new Fraction(1, 3), new Fraction(2, 3), new Fraction(1, 4), new Fraction(3, 4), new Fraction(1, 5), new Fraction(2, 5), new Fraction(3, 5), new Fraction(4, 5), new Fraction(1, 6), new Fraction(5, 6), new Fraction(1, 7), new Fraction(2, 7), new Fraction(3, 7), new Fraction(4, 7), new Fraction(5, 7), new Fraction(6, 7), new Fraction(1, 8), new Fraction(3, 8), new Fraction(5, 8), new Fraction(7, 8)].map(f => f.plusInteger(whole));
    })));
    const pieceFractions = [...FractionLevel.simpleSplitFractions(FractionLevel.straightforwardFractions(targetFractions), {
      quantity: 5
    }), ...FractionLevel.interestingFractions(sample(splittable(targetFractions)), 3)];
    return FractionChallenge.createShapeChallenge(levelNumber, true, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (mixed) shapes level 6.
   * @public
   *
   * Design doc:
   * -- Targets with 1, 2, or 3, as whole number, fractional portion from the set {1/2, 1/3, 2/3, 1/6, 5/6} or {1/2,
   *    ¼, ¾, 1/8, 3/8, 5/8, 7/8}
   * -- Pieces will be wholes, and either {1/2's and 1/6's} or {1/2's and 1/8's}
   * -- Only enough pieces to fulfill targets.  Pieces chosen to minimize small pieces, so for instance if 5/8 is a
   *    fractional portion it will be built with a 1/2 and a 1/8 piece.
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level6ShapesMixed(levelNumber, color) {
    const fractionPortion = sample([[new Fraction(1, 2), new Fraction(1, 3), new Fraction(2, 3), new Fraction(1, 6), new Fraction(5, 6)], [new Fraction(1, 2), new Fraction(1, 4), new Fraction(3, 4), new Fraction(1, 8), new Fraction(3, 8), new Fraction(5, 8), new Fraction(7, 8)]]);
    const targetFractions = choose(4, _.flatten(inclusive(1, 3).map(whole => {
      return fractionPortion.map(f => f.plusInteger(whole));
    })));
    const pieceFractions = FractionLevel.minimizedFractions(targetFractions);
    return FractionChallenge.createShapeChallenge(levelNumber, true, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (mixed) shapes level 7.
   * @public
   *
   * Design doc:
   * --Top two targets are the same, bottom two targets are the same
   * -- Targets with 1, 2, or 3, as whole number, fractional portion from the set {1/2, 1/3, 2/3, ¼, ¾, 1/6, 5/6, 1/8,
   *    3/8, 5/8, 7/8}
   * -- Only enough pieces to fulfill targets. One of each of the top and bottom targets require "nontrivial" pieces
   *    to build the solution.
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level7ShapesMixed(levelNumber, color) {
    const baseFractions = choose(2, _.flatten(inclusive(1, 3).map(whole => {
      return [new Fraction(1, 2), new Fraction(1, 3), new Fraction(2, 3), new Fraction(1, 4), new Fraction(3, 4), new Fraction(1, 6), new Fraction(5, 6), new Fraction(1, 8), new Fraction(3, 8), new Fraction(5, 8), new Fraction(7, 8)].map(f => f.plusInteger(whole));
    })));
    const topFraction = baseFractions[0];
    const bottomFraction = baseFractions[1];
    const topFractions = repeat(2, topFraction);
    const bottomFractions = repeat(2, bottomFraction);
    const targetFractions = [...topFractions, ...bottomFractions];
    const pieceFractions = [...FractionLevel.difficultSplit(topFraction), ...FractionLevel.difficultSplit(bottomFraction), ...FractionLevel.straightforwardFractions([topFraction, bottomFraction])];
    return FractionChallenge.createShapeChallenge(levelNumber, true, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (mixed) shapes level 8.
   * @public
   *
   * Design doc:
   * -- Targets with 1, 2, or 3, as whole number, fractional portion from the set {1/2, 1/3, 2/3, ¼, ¾, 1/5, 2/5, 3/5,
   *    4/5, 1/6, 5/6}
   * -- Only enough pieces to fulfill targets
   * -- At least 2 targets require "nontrivial" pieces
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level8ShapesMixed(levelNumber, color) {
    const targetFractions = chooseSplittable(4, _.flatten(inclusive(1, 3).map(whole => {
      return [new Fraction(1, 2), new Fraction(1, 3), new Fraction(2, 3), new Fraction(1, 4), new Fraction(3, 4), new Fraction(1, 5), new Fraction(2, 5), new Fraction(3, 5), new Fraction(4, 5), new Fraction(1, 6), new Fraction(5, 6)].map(f => f.plusInteger(whole));
    })), 2);
    const pieceFractions = [..._.flatten(targetFractions.slice(0, 2).map(f => FractionLevel.difficultSplit(f))), ...FractionLevel.straightforwardFractions(targetFractions.slice(2))];
    return FractionChallenge.createShapeChallenge(levelNumber, true, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (mixed) shapes level 9.
   * @public
   *
   * Design doc:
   * -- Same as level 8, but now all 4 targets must be built with some "nontrivial pieces"
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level9ShapesMixed(levelNumber, color) {
    const targetFractions = choose(4, _.flatten(inclusive(1, 3).map(whole => {
      return [new Fraction(1, 2), new Fraction(1, 3), new Fraction(2, 3), new Fraction(1, 4), new Fraction(3, 4), new Fraction(1, 5), new Fraction(2, 5), new Fraction(3, 5), new Fraction(4, 5), new Fraction(1, 6), new Fraction(5, 6)].map(f => f.plusInteger(whole));
    })));
    const pieceFractions = _.flatten(targetFractions.map(f => FractionLevel.difficultSplit(f)));
    return FractionChallenge.createShapeChallenge(levelNumber, true, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (mixed) shapes level 10.
   * @public
   *
   * Design doc:
   * -- Same as level 9, but fractional portion from the set {1/2, 1/3, 2/3, ¼, ¾, 1/6, 5/6, 1/8, 3/8, 5/8, 7/8}
   *
   * @param {number} levelNumber
   * @param {ColorDef} color
   * @returns {FractionChallenge}
   */
  static level10ShapesMixed(levelNumber, color) {
    const targetFractions = choose(4, _.flatten(inclusive(1, 3).map(whole => {
      return [new Fraction(1, 2), new Fraction(1, 3), new Fraction(2, 3), new Fraction(1, 4), new Fraction(3, 4), new Fraction(1, 6), new Fraction(5, 6), new Fraction(1, 8), new Fraction(3, 8), new Fraction(5, 8), new Fraction(7, 8)].map(f => f.plusInteger(whole));
    })));
    const pieceFractions = _.flatten(targetFractions.map(f => FractionLevel.difficultSplit(f)));
    return FractionChallenge.createShapeChallenge(levelNumber, true, color, targetFractions, pieceFractions);
  }

  /**
   * Creates a challenge for (unmixed) numbers level 1.
   * @public
   *
   * Design doc:
   * > -- fractions are {1/2, ⅓, ⅔}
   * > -- if refresh button is pressed, colors and numbers are shuffled
   * > -- always circles
   * > -- just enough cards to complete targets
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level1Numbers(levelNumber) {
    const targetFractions = shuffle([new Fraction(1, 2), new Fraction(1, 3), new Fraction(2, 3)]);
    const pieceNumbers = FractionLevel.exactNumbers(targetFractions);
    const shapeTargets = FractionLevel.targetsFromFractions(ShapePartition.PIES, targetFractions, COLORS_3, FillType.SEQUENTIAL);
    return FractionChallenge.createNumberChallenge(levelNumber, false, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (unmixed) numbers level 2.
   * @public
   *
   * Design doc:
   * > --Distribution of fractions ranging from 1/2 to 4/5.  As in the numerator could be 1, 2, 3, or 4 and the
   * >   denominator could be 2, 3, 4, or 5 with the stipulation that the fraction is always less than 1.
   * > -- circles or rectangles, but all targets one shape
   * > --just enough cards to complete targets
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level2Numbers(levelNumber) {
    const shapePartitions = sample([ShapePartition.PIES, ShapePartition.HORIZONTAL_BARS, ShapePartition.VERTICAL_BARS]);
    const targetFractions = choose(3, FractionLevel.fractions(inclusive(1, 4), inclusive(2, 5), f => f.isLessThan(Fraction.ONE)));
    const pieceNumbers = FractionLevel.exactNumbers(targetFractions);
    const shapeTargets = FractionLevel.targetsFromFractions(shapePartitions, targetFractions, COLORS_3, FillType.SEQUENTIAL);
    return FractionChallenge.createNumberChallenge(levelNumber, false, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (unmixed) numbers level 3.
   * @public
   *
   * Design doc:
   * -- All targets “six flowers”
   * -- Range ⅙ to ⅚
   * -- cards available to allow multiple solutions.  For instance, 2/6, could be represented as ⅓
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level3Numbers(levelNumber) {
    const shapePartitions = [ShapePartition.SIX_FLOWER];
    const numerators = choose(3, inclusive(1, 5));
    const targetFractions = numerators.map(n => new Fraction(n, 6));
    const pieceNumbers = [...FractionLevel.exactNumbers(targetFractions), ...FractionLevel.multipliedNumbers(choose(2, targetFractions), false)];
    const shapeTargets = FractionLevel.targetsFromFractions(shapePartitions, targetFractions, COLORS_3, FillType.SEQUENTIAL);
    return FractionChallenge.createNumberChallenge(levelNumber, false, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (unmixed) numbers level 4.
   * @public
   *
   * Design doc:
   * -- All triangles seems good,
   * -- numerator and denominator able to range from 1-9
   * -- just enough cards to complete targets
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level4Numbers(levelNumber) {
    const shapePartitions = ShapePartition.PYRAMIDS;
    const targetFractions = [new Fraction(1, 1), new Fraction(sample(inclusive(1, 4)), 4), new Fraction(sample(inclusive(1, 9)), 9)];
    const pieceNumbers = FractionLevel.exactNumbers(targetFractions);
    const shapeTargets = FractionLevel.targetsFromFractions(shapePartitions, targetFractions, COLORS_3, FillType.SEQUENTIAL);
    return FractionChallenge.createNumberChallenge(levelNumber, false, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (unmixed) numbers level 5.
   * @public
   *
   * Design doc:
   * - numerator able to range from 1-9, and denominator able to range from 1-9, with the number less than 1
   * - all representations possible (circle, "9 and 4 square", bars, triangles, 6 flower, perhaps regular polygons), I
   * - all cards available to fulfill challenges in the most straightforward way, for instance a 4/5 representation
   *   has a 4 and a 5 available.
   * --just enough cards to complete targets
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level5Numbers(levelNumber) {
    const shapeTargets = FractionLevel.targetsFromPartitions(choose(3, ShapePartition.LIMITED_9_GAME_PARTITIONS.filter(partition => partition.length > 1)), COLORS_3, d => sample(inclusive(1, d - 1)), FillType.SEQUENTIAL);
    const pieceNumbers = FractionLevel.exactNumbers(shapeTargets.map(target => target.fraction));
    return FractionChallenge.createNumberChallenge(levelNumber, false, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (unmixed) numbers level 6.
   * @public
   *
   * Design doc:
   * -- 4 targets from this level forward
   * -- Same as level 5, but now random fill is possible
   * -- card constraints at this point, so at least one of the representations only has cards available to match it
   *    with a "nonobvious fraction".  For instance if 3/9 appears, and 5/9 appears, we have 1(5) and 1(9), but not
   *    2(9), so that 1/3 would need to be used to match.
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level6Numbers(levelNumber) {
    const shapeTargets = FractionLevel.targetsFromPartitions(choose(4, ShapePartition.LIMITED_9_GAME_PARTITIONS), COLORS_4, d => sample(inclusive(1, d)), null);
    const pieceNumbers = FractionLevel.withMultipliedNumbers(shapeTargets.map(target => target.fraction), 2, false);
    return FractionChallenge.createNumberChallenge(levelNumber, false, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (unmixed) numbers level 7.
   * @public
   *
   * Design doc:
   * -- Top two representations are equivalent, and bottom 2 representations are equivalent but still numbers less
   *    than 1
   * -- A built in check to draw a different fraction for the top 2 and the bottom 2
   * -- Possible fractions sets from which to draw 2 each {1/2, 2/4, 3/6}, {1/3, 2/6, 3/9}, {2/3, 4/6, 3/9},
   *    {1/4, 2/8}, {3/4, 6/8}
   * -- The representations are both be equal, for instance, 2 pies divided the same, and two bars divided the same,
   *    so that the learning goal is focused on the same exact picture can be represented by 2 different fractions.
   *    Always displaying the simplified fraction as the picture.
   * -- Cards constrained, so for instance if {1/2, 3/6} is drawn for the top pair and {3/4, 6/8} drawn for the
   *    bottom, we would have 1(1), 1(2), 2(3), 1(4), 2(6), 1(8)
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level7Numbers(levelNumber) {
    const baseFractions = choose(2, [[new Fraction(1, 2), new Fraction(2, 4), new Fraction(3, 6)], [new Fraction(1, 3), new Fraction(2, 6), new Fraction(3, 9)], [new Fraction(2, 3), new Fraction(4, 6), new Fraction(6, 9)], [new Fraction(1, 4), new Fraction(2, 8)], [new Fraction(3, 4), new Fraction(6, 8)]]).map(fractions => choose(2, fractions));
    const smallFractions = baseFractions.map(fractions => _.minBy(fractions, 'denominator'));
    const shapePartitionChoices = choose(2, [ShapePartition.PIES, ShapePartition.HORIZONTAL_BARS, ShapePartition.VERTICAL_BARS]);
    const colors = shuffle(COLORS_4);
    const pieceNumbers = FractionLevel.exactNumbers(_.flatten(baseFractions));
    const shapeTargets = inclusive(0, 3).map(index => {
      const mainIndex = index < 2 ? 0 : 1;
      const smallFraction = smallFractions[mainIndex].reduced();
      return ShapeTarget.fill(sample(ShapePartition.supportsDenominator(shapePartitionChoices[mainIndex], smallFraction.denominator)), smallFraction, colors[index], FillType.SEQUENTIAL);
    });
    return FractionChallenge.createNumberChallenge(levelNumber, false, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (unmixed) numbers level 8.
   * @public
   *
   * Design doc:
   * -- Introduce double representations at this level (numbers greater than 1)
   * -- 8 cards, 4 each of 2 numbers
   * -- randomly choose from  {2/3, 3/2, 2/2, 3/3}, {2/4, 4/2, 2/2, 4/4}, {3/4,4/3, 3/3, 4/4}, {3/5, 5/3, 3/3, 5/5},
   *    {3/6, 6/3, 3/3, 6/6}
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level8Numbers(levelNumber) {
    const fractions = shuffle(sample([[new Fraction(2, 3), new Fraction(3, 2), new Fraction(2, 2), new Fraction(3, 3)], [new Fraction(2, 4), new Fraction(4, 2), new Fraction(2, 2), new Fraction(4, 4)], [new Fraction(3, 4), new Fraction(4, 3), new Fraction(3, 3), new Fraction(4, 4)], [new Fraction(3, 5), new Fraction(5, 3), new Fraction(3, 3), new Fraction(5, 5)], [new Fraction(3, 6), new Fraction(6, 3), new Fraction(3, 3), new Fraction(6, 6)]]));
    const shapeTargets = FractionLevel.targetsFromFractions(_.flatten(ShapePartition.UNIVERSAL_PARTITIONS), fractions, COLORS_4, FillType.SEQUENTIAL);
    const pieceNumbers = FractionLevel.exactNumbers(fractions);
    return FractionChallenge.createNumberChallenge(levelNumber, false, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (unmixed) numbers level 9.
   * @public
   *
   * Design doc:
   * -- Representations both less than 1 and greater than 1
   * -- All representations possible
   * -- No card constraints (as in straightforward matching of number and picture possible)
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level9Numbers(levelNumber) {
    const shapeTargets = FractionLevel.targetsFromPartitions(choose(4, ShapePartition.LIMITED_9_GAME_PARTITIONS), COLORS_4, d => sample(inclusive(1, 2 * d)), FillType.MIXED);
    const pieceNumbers = FractionLevel.exactNumbers(shapeTargets.map(target => target.fraction));
    return FractionChallenge.createNumberChallenge(levelNumber, false, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (unmixed) numbers level 10.
   * @public
   *
   * Design doc:
   * -- Same as level  9 but with card constraints
   * -- One or two representations use a prime number scale factor for each to generate the cards, for instance if
   * one of the  representations was 4/3, we use the scale factor (3/3), and we would need a 12 and a 9 card.
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level10Numbers(levelNumber) {
    const shapeTargets = FractionLevel.targetsFromPartitions(choose(4, ShapePartition.LIMITED_9_GAME_PARTITIONS), COLORS_4, d => sample(inclusive(1, 2 * d)), FillType.MIXED);
    const pieceNumbers = FractionLevel.withMultipliedNumbers(shapeTargets.map(target => target.fraction), 2, false);
    return FractionChallenge.createNumberChallenge(levelNumber, false, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (mixed) numbers level 1.
   * @public
   *
   * Design doc:
   * -- Circles as targets
   * -- {1:1/2, 2:1/2, 3:1/4} as the challenges
   * -- just enough cards to complete targets
   * -- As before, refreshing will randomly reorder, recolor
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level1NumbersMixed(levelNumber) {
    const fractions = shuffle([new Fraction(3, 2), new Fraction(5, 2), new Fraction(13, 4)]);
    const shapeTargets = FractionLevel.targetsFromFractions(ShapePartition.PIES, fractions, COLORS_3, FillType.SEQUENTIAL);
    const pieceNumbers = FractionLevel.exactMixedNumbers(fractions);
    return FractionChallenge.createNumberChallenge(levelNumber, true, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (mixed) numbers level 2.
   * @public
   *
   * Design doc:
   * -- Circles or Rectangles as targets, but all targets are the same shape
   * -- 1, 2, or 3, as whole number
   * -- Fractional portion from the set {1/2, 1/3, 2/3, ¼, ¾}
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level2NumbersMixed(levelNumber) {
    const fractions = choose(3, expandableMixedNumbersFractions);
    const shapePartitions = sample([ShapePartition.PIES, ShapePartition.HORIZONTAL_BARS]);
    const shapeTargets = FractionLevel.targetsFromFractions(shapePartitions, fractions, COLORS_3, FillType.SEQUENTIAL);
    const pieceNumbers = FractionLevel.exactMixedNumbers(fractions);
    return FractionChallenge.createNumberChallenge(levelNumber, true, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (mixed) numbers level 3.
   * @public
   *
   * Design doc:
   * -- All targets shaped like “six flowers”
   * -- 1, 2, or 3, as whole number
   * -- Fractional portion from the set {1/2, 1/3, 2/3, 1/6, 5/6}
   * -- So, if a “six flower” is showing 3/6, we will want a 1 and 2 card in the deck
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level3NumbersMixed(levelNumber) {
    const fractions = choose(3, _.flatten(inclusive(1, 3).map(whole => {
      return [new Fraction(1, 2), new Fraction(1, 3), new Fraction(2, 3), new Fraction(1, 6), new Fraction(5, 6)].map(f => f.plusInteger(whole));
    })));
    const shapeTargets = FractionLevel.targetsFromFractions([ShapePartition.SIX_FLOWER], fractions, COLORS_3, FillType.SEQUENTIAL, true);
    const pieceNumbers = FractionLevel.exactMixedNumbers(fractions);
    return FractionChallenge.createNumberChallenge(levelNumber, true, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (mixed) numbers level 4.
   * @public
   *
   * Design doc:
   * -- All triangles
   * -- 1, 2, or 3, as whole number
   * -- Fractional portion from the set {1/2, 1/3, 2/3, ¼, ¾, 1/9, 2/9, 4/9, 5/9, 7/9, 8/9}
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level4NumbersMixed(levelNumber) {
    const fractions = choose(3, _.flatten(inclusive(1, 3).map(whole => {
      return [new Fraction(1, 2), new Fraction(1, 3), new Fraction(2, 3), new Fraction(1, 4), new Fraction(3, 4), new Fraction(1, 9), new Fraction(2, 9), new Fraction(4, 9), new Fraction(5, 9), new Fraction(7, 9), new Fraction(8, 9)].map(f => f.plusInteger(whole));
    })));
    const shapeTargets = FractionLevel.targetsFromFractions(ShapePartition.PYRAMIDS, fractions, COLORS_3, FillType.SEQUENTIAL, true);
    const pieceNumbers = FractionLevel.exactMixedNumbers(fractions);
    return FractionChallenge.createNumberChallenge(levelNumber, true, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (mixed) numbers level 5.
   * @public
   *
   * Design doc:
   * -- All representations possible, but each target is only one type of representation
   * -- 1, 2, or 3, as whole number
   * -- Fractional portion from the set {1/2, 1/3, 2/3, ¼, ¾, 1/5, 2/5, 3/5, 4/5, 1/6, 5/6, 1/7, 2/7, 3/7, 4/7, 5/7,
   *    6/7, 1/8, 3/8, 5/8, 7/8, 1/9, 2/9, 4/9, 5/9, 7/9, 8/9}
   * -- 2 of the representations match cards exactly, 1 of the representations requires simplifying to a solution
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level5NumbersMixed(levelNumber) {
    const fractions = chooseSplittable(3, mixedNumbersFractions, 1);
    const multipliedFractions = shuffle([...fractions.slice(0, 1).map(FractionLevel.multiplyFraction), ...fractions.slice(1)]);
    const shapeTargets = FractionLevel.targetsFromFractions(ShapePartition.LIMITED_9_GAME_PARTITIONS, multipliedFractions, COLORS_3, FillType.SEQUENTIAL, true);
    const pieceNumbers = FractionLevel.exactMixedNumbers(fractions);
    return FractionChallenge.createNumberChallenge(levelNumber, true, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (mixed) numbers level 6.
   * @public
   *
   * Design doc:
   * -- Same as level 5 (now with 4 targets)
   * -- Random fill now possible, so for instance {2:1/4} could be represented by 2 full circles with a partially
   *    filled circle in between them.  As in, we do not need to strictly fill from left to right.
   * -- 2 of the representations require simplifying
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level6NumbersMixed(levelNumber) {
    const fractions = chooseSplittable(4, mixedNumbersFractions, 2);
    const multipliedFractions = shuffle([...fractions.slice(0, 2).map(FractionLevel.multiplyFraction), ...fractions.slice(2)]);
    const shapeTargets = FractionLevel.targetsFromFractions(ShapePartition.LIMITED_9_GAME_PARTITIONS, multipliedFractions, COLORS_4, FillType.MIXED, true);
    const pieceNumbers = FractionLevel.exactMixedNumbers(fractions);
    return FractionChallenge.createNumberChallenge(levelNumber, true, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (mixed) numbers level 7.
   * @public
   *
   * Design doc:
   * -- Top two representations are equivalent in magnitude, and bottom 2 representations are equivalent in magnitude
   * -- For instance if the top two representations are {1:1/2}, the first  representation could be a full circle and
   *    a half circle divided in halves, and the second circle could be a full circle and a half circle divide in
   *    fourths.
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level7NumbersMixed(levelNumber) {
    const baseFractions = choose(2, expandableMixedNumbersFractions);
    const smallMultipliers = [new Fraction(2, 2)];
    const multipliers = [new Fraction(2, 2), new Fraction(3, 3)];
    const fractions = [...shuffle([baseFractions[0], baseFractions[0].times(sample(baseFractions[0].denominator >= 4 ? smallMultipliers : multipliers))]), ...shuffle([baseFractions[1], baseFractions[1].times(sample(baseFractions[1].denominator >= 4 ? smallMultipliers : multipliers))])];
    const shapeTargets = FractionLevel.targetsFromFractions(ShapePartition.LIMITED_9_GAME_PARTITIONS, fractions, COLORS_4, FillType.SEQUENTIAL);
    const pieceNumbers = [...FractionLevel.exactMixedNumbers(baseFractions), ...FractionLevel.exactMixedNumbers(baseFractions)];
    return FractionChallenge.createNumberChallenge(levelNumber, true, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (mixed) numbers level 8.
   * @public
   *
   * Design doc:
   * -- Same as level 6
   * -- All 4 representations require simplifying
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level8NumbersMixed(levelNumber) {
    const unreducedFractions = choose(4, _.flatten(inclusive(1, 3).map(whole => {
      return [new Fraction(2, 4), new Fraction(3, 6), new Fraction(4, 8), new Fraction(2, 6), new Fraction(3, 9), new Fraction(4, 6), new Fraction(6, 9), new Fraction(2, 8), new Fraction(6, 8)].map(f => f.plusInteger(whole));
    })));
    const fractions = unreducedFractions.map(f => f.reduced());
    const shapeTargets = FractionLevel.targetsFromFractions(ShapePartition.LIMITED_9_GAME_PARTITIONS, unreducedFractions, COLORS_4, FillType.RANDOM, true);
    const pieceNumbers = FractionLevel.exactMixedNumbers(fractions);
    return FractionChallenge.createNumberChallenge(levelNumber, true, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (mixed) numbers level 9.
   * @public
   *
   * Design doc:
   * -- All representations, random fill, and simplifying possible
   * -- Now representations within the targets can have different divisions, do this for 2 of the targets
   * -- So, for instance if {1:3/4} is being represented by circles, the first circle could be divided in ¼’s and the
   *    second circle divided in 1/8’s, with pieces randomly distributed between the two circles.
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level9NumbersMixed(levelNumber) {
    const fractions = choose(4, allMixedNumberFractions);
    const shapeTargets = shuffle(fractions.map((fraction, index) => {
      const color = COLORS_4[index];
      if (index < 2) {
        const shapePartitions = sample([ShapePartition.PIES, ShapePartition.EXTENDED_HORIZONTAL_BARS, ShapePartition.EXTENDED_VERTICAL_BARS, ShapePartition.EXTENDED_RECTANGULAR_BARS]);
        return FractionLevel.difficultMixedShapeTarget(shapePartitions, fraction, color);
      } else {
        return ShapeTarget.randomFill(sample(ShapePartition.supportsDenominator(ShapePartition.LIMITED_9_GAME_PARTITIONS, fraction.denominator)), fraction, color);
      }
    }));
    const pieceNumbers = FractionLevel.exactMixedNumbers(fractions);
    return FractionChallenge.createNumberChallenge(levelNumber, true, shapeTargets, pieceNumbers);
  }

  /**
   * Creates a challenge for (mixed) numbers level 10.
   * @public
   *
   * Design doc:
   * -- Same as level 9, but now all 4 targets can have different internal divisions in representations.
   *
   * @param {number} levelNumber
   * @returns {FractionChallenge}
   */
  static level10NumbersMixed(levelNumber) {
    const fractions = choose(4, allMixedNumberFractions);
    const colors = shuffle(COLORS_4);
    const shapeTargets = fractions.map((fraction, index) => {
      const shapePartitions = sample([ShapePartition.PIES, ShapePartition.EXTENDED_HORIZONTAL_BARS, ShapePartition.EXTENDED_VERTICAL_BARS, ShapePartition.EXTENDED_RECTANGULAR_BARS]);
      return FractionLevel.difficultMixedShapeTarget(shapePartitions, fraction, colors[index]);
    });
    const pieceNumbers = FractionLevel.multipliedNumbers(fractions, true);
    return FractionChallenge.createNumberChallenge(levelNumber, true, shapeTargets, pieceNumbers);
  }
}
fractionsCommon.register('FractionLevel', FractionLevel);
export default FractionLevel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEeW5hbWljUHJvcGVydHkiLCJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsImFycmF5RGlmZmVyZW5jZSIsIm1lcmdlIiwiRnJhY3Rpb24iLCJQcmltZUZhY3Rvcml6YXRpb24iLCJGcmFjdGlvbnNDb21tb25Db2xvcnMiLCJmcmFjdGlvbnNDb21tb24iLCJDb2xsZWN0aW9uRmluZGVyIiwiRmlsbGVkUGFydGl0aW9uIiwiRmlsbFR5cGUiLCJGcmFjdGlvbkNoYWxsZW5nZSIsIlNoYXBlUGFydGl0aW9uIiwiU2hhcGVUYXJnZXQiLCJuZXh0Qm9vbGVhbiIsInNhbXBsZSIsImFycmF5Iiwic2h1ZmZsZSIsIm5leHRJbnRCZXR3ZWVuIiwiYSIsImIiLCJjaG9vc2UiLCJxIiwiaSIsIkZyYWN0aW9uTGV2ZWwiLCJpbmNsdXNpdmUiLCJfIiwicmFuZ2UiLCJyZXBlYXQiLCJ0aW1lcyIsInNwbGl0dGFibGUiLCJmaWx0ZXIiLCJmIiwiZGVub21pbmF0b3IiLCJub3RTcGxpdHRhYmxlIiwiY2hvb3NlU3BsaXR0YWJsZSIsImMiLCJjb2xsZWN0aW9uRmluZGVyOCIsImRlbm9taW5hdG9ycyIsIm1hcCIsImZhY3RvciIsImNvbGxlY3Rpb25GaW5kZXI5IiwiQ09MT1JTXzMiLCJsZXZlbDFQcm9wZXJ0eSIsImxldmVsMlByb3BlcnR5IiwibGV2ZWwzUHJvcGVydHkiLCJDT0xPUlNfNCIsImxldmVsNFByb3BlcnR5IiwiZXhwYW5kYWJsZU1peGVkTnVtYmVyc0ZyYWN0aW9ucyIsImZsYXR0ZW4iLCJ3aG9sZSIsInBsdXNJbnRlZ2VyIiwibWl4ZWROdW1iZXJzRnJhY3Rpb25zIiwiYWxsTWl4ZWROdW1iZXJGcmFjdGlvbnMiLCJudW1lcmF0b3IiLCJjb25zdHJ1Y3RvciIsIm51bWJlciIsIm51bVRhcmdldHMiLCJidWlsZGluZ1R5cGUiLCJjb2xvciIsImdlbmVyYXRlQ2hhbGxlbmdlIiwiY2hhbGxlbmdlUHJvcGVydHkiLCJuZXh0Q2hhbGxlbmdlIiwiX2luaXRpYWxWYWx1ZSIsInNjb3JlUHJvcGVydHkiLCJkZXJpdmUiLCJjaGFsbGVuZ2UiLCJnZXRMYXJnZXN0U3RhY2tMYXlvdXRRdWFudGl0eSIsInJlc2V0IiwidmFsdWUiLCJyZWZyZXNoZWRDaGFsbGVuZ2UiLCJxdWFudGl0eSIsIml0ZW1zIiwiYXNzZXJ0IiwiQXJyYXkiLCJpc0FycmF5IiwibGVuZ3RoIiwic2xpY2UiLCJ1bml0RnJhY3Rpb25zIiwiZnJhY3Rpb25zIiwiZnJhY3Rpb24iLCJzdHJhaWdodGZvcndhcmRGcmFjdGlvbnMiLCJNYXRoIiwiZmxvb3IiLCJtaW5pbWl6ZWRGcmFjdGlvbnMiLCJyZW1haW5kZXIiLCJtaW51c0ludGVnZXIiLCJjb2xsZWN0aW9ucyIsInNlYXJjaCIsImNvbGxlY3Rpb24iLCJzb3J0QnkiLCJpbnRlcmVzdGluZ0ZyYWN0aW9ucyIsInRvdGFsUXVhbnRpdGllcyIsImZpbHRlcmVkQ29sbGVjdGlvbnMiLCJzaW1wbGVTcGxpdEZyYWN0aW9ucyIsIm9wdGlvbnMiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsIm1heERlbm9taW5hdG9yIiwic3BsaXRzIiwiY29weSIsImF2YWlsYWJsZUZyYWN0aW9ucyIsImZyYWN0aW9uc1RvQ2hhbmdlIiwibWluIiwib3RoZXJGcmFjdGlvbnMiLCJhdmFpbGFibGVTcGxpdHMiLCJzcGxpdEZyYWN0aW9ucyIsImV2ZXJ5Iiwic3BsaXRGcmFjdGlvbiIsIm51bWVyYXRvcnMiLCJwcmVkaWNhdGUiLCJjb25zdGFudCIsImV4YWN0TnVtYmVycyIsImlkZW50aXR5IiwiZXhhY3RNaXhlZE51bWJlcnMiLCJtaW51cyIsIm11bHRpcGx5RnJhY3Rpb24iLCJtdWx0aXBsaWVyIiwibXVsdGlwbGllZE51bWJlcnMiLCJzZXBhcmF0ZVdob2xlIiwicmVzdWx0IiwicHVzaCIsIndpdGhNdWx0aXBsaWVkTnVtYmVycyIsImJyZWFrYWJsZSIsInVuYnJlYWthYmxlIiwidGFyZ2V0c0Zyb21GcmFjdGlvbnMiLCJzaGFwZVBhcnRpdGlvbnMiLCJjb2xvcnMiLCJmaWxsVHlwZSIsImFsbG93U3ViZGl2aXNpb24iLCJpbmRleCIsInBvdGVudGlhbFBhcnRpdGlvbnMiLCJzdXBwb3J0c0RpdmlzaWJsZURlbm9taW5hdG9yIiwic3VwcG9ydHNEZW5vbWluYXRvciIsImNvbmNyZXRlRmlsbFR5cGUiLCJTRVFVRU5USUFMIiwiTUlYRUQiLCJmaWxsIiwidGFyZ2V0c0Zyb21QYXJ0aXRpb25zIiwiZGVub21pbmF0b3JUb051bWVyYXRvciIsInNoYXBlUGFydGl0aW9uIiwiZGlmZmljdWx0U3BsaXQiLCJtYXhOb256ZXJvQ291bnQiLCJ3aG9sZUNvdW50IiwiY2VpbCIsImZ1bGxXaG9sZUNvdW50IiwibWF4VG90YWxRdWFudGl0eSIsIm1heFF1YW50aXR5IiwibWF4IiwibGVnYWxDb2xsZWN0aW9ucyIsImNvbXBhY3RSZXF1aXJlZEdyb3VwcyIsImdldENvbXBhY3RSZXF1aXJlZEdyb3VwcyIsIm1heE5vbmRpdmlzaWJsZSIsIm5vbmRpdmlzaWJsZUNvdW50IiwiZGlmZmljdWx0Q29sbGVjdGlvbnMiLCJkaWZmaWN1bHRNaXhlZFNoYXBlVGFyZ2V0Iiwic3VtIiwic3ViRnJhY3Rpb24iLCJyYW5kb21GaWxsIiwibGV2ZWwxU2hhcGVzIiwibGV2ZWxOdW1iZXIiLCJ0YXJnZXRGcmFjdGlvbnMiLCJwaWVjZUZyYWN0aW9ucyIsImNyZWF0ZVNoYXBlQ2hhbGxlbmdlIiwibGV2ZWwyU2hhcGVzIiwibGV2ZWwzU2hhcGVzIiwiZCIsIm4iLCJPTkUiLCJsZXZlbDRTaGFwZXMiLCJsZXZlbDVTaGFwZXMiLCJsZXZlbDZTaGFwZXMiLCJjYXJkU2l6ZXMiLCJzZWxlY3RlZENvZWZmaWNpZW50cyIsIm0iLCJwbHVzIiwicmVkdWNlZCIsInNvbWUiLCJpc0xlc3NUaGFuIiwibGV2ZWw3U2hhcGVzIiwic2VsZWN0ZWQiLCJsZXZlbDhTaGFwZXMiLCJsZXZlbDlTaGFwZXMiLCJsZXZlbDEwU2hhcGVzIiwibGV2ZWwxU2hhcGVzTWl4ZWQiLCJsZXZlbDJTaGFwZXNNaXhlZCIsImxldmVsM1NoYXBlc01peGVkIiwibGV2ZWw0U2hhcGVzTWl4ZWQiLCJsZXZlbDVTaGFwZXNNaXhlZCIsImxldmVsNlNoYXBlc01peGVkIiwiZnJhY3Rpb25Qb3J0aW9uIiwibGV2ZWw3U2hhcGVzTWl4ZWQiLCJiYXNlRnJhY3Rpb25zIiwidG9wRnJhY3Rpb24iLCJib3R0b21GcmFjdGlvbiIsInRvcEZyYWN0aW9ucyIsImJvdHRvbUZyYWN0aW9ucyIsImxldmVsOFNoYXBlc01peGVkIiwibGV2ZWw5U2hhcGVzTWl4ZWQiLCJsZXZlbDEwU2hhcGVzTWl4ZWQiLCJsZXZlbDFOdW1iZXJzIiwicGllY2VOdW1iZXJzIiwic2hhcGVUYXJnZXRzIiwiUElFUyIsImNyZWF0ZU51bWJlckNoYWxsZW5nZSIsImxldmVsMk51bWJlcnMiLCJIT1JJWk9OVEFMX0JBUlMiLCJWRVJUSUNBTF9CQVJTIiwibGV2ZWwzTnVtYmVycyIsIlNJWF9GTE9XRVIiLCJsZXZlbDROdW1iZXJzIiwiUFlSQU1JRFMiLCJsZXZlbDVOdW1iZXJzIiwiTElNSVRFRF85X0dBTUVfUEFSVElUSU9OUyIsInBhcnRpdGlvbiIsInRhcmdldCIsImxldmVsNk51bWJlcnMiLCJsZXZlbDdOdW1iZXJzIiwic21hbGxGcmFjdGlvbnMiLCJtaW5CeSIsInNoYXBlUGFydGl0aW9uQ2hvaWNlcyIsIm1haW5JbmRleCIsInNtYWxsRnJhY3Rpb24iLCJsZXZlbDhOdW1iZXJzIiwiVU5JVkVSU0FMX1BBUlRJVElPTlMiLCJsZXZlbDlOdW1iZXJzIiwibGV2ZWwxME51bWJlcnMiLCJsZXZlbDFOdW1iZXJzTWl4ZWQiLCJsZXZlbDJOdW1iZXJzTWl4ZWQiLCJsZXZlbDNOdW1iZXJzTWl4ZWQiLCJsZXZlbDROdW1iZXJzTWl4ZWQiLCJsZXZlbDVOdW1iZXJzTWl4ZWQiLCJtdWx0aXBsaWVkRnJhY3Rpb25zIiwibGV2ZWw2TnVtYmVyc01peGVkIiwibGV2ZWw3TnVtYmVyc01peGVkIiwic21hbGxNdWx0aXBsaWVycyIsIm11bHRpcGxpZXJzIiwibGV2ZWw4TnVtYmVyc01peGVkIiwidW5yZWR1Y2VkRnJhY3Rpb25zIiwiUkFORE9NIiwibGV2ZWw5TnVtYmVyc01peGVkIiwiRVhURU5ERURfSE9SSVpPTlRBTF9CQVJTIiwiRVhURU5ERURfVkVSVElDQUxfQkFSUyIsIkVYVEVOREVEX1JFQ1RBTkdVTEFSX0JBUlMiLCJsZXZlbDEwTnVtYmVyc01peGVkIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGcmFjdGlvbkxldmVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYW5kIGhhbmRsZXMgZ2VuZXJhdGlvbiBvZiB0aGUgbGV2ZWxzIGZvciB0aGUgXCJidWlsZGluZ1wiIHN0eWxlIGZyYWN0aW9ucyBzaW1zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IER5bmFtaWNQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0R5bmFtaWNQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IGFycmF5RGlmZmVyZW5jZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvYXJyYXlEaWZmZXJlbmNlLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBGcmFjdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL21vZGVsL0ZyYWN0aW9uLmpzJztcclxuaW1wb3J0IFByaW1lRmFjdG9yaXphdGlvbiBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvUHJpbWVGYWN0b3JpemF0aW9uLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vbkNvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9GcmFjdGlvbnNDb21tb25Db2xvcnMuanMnO1xyXG5pbXBvcnQgZnJhY3Rpb25zQ29tbW9uIGZyb20gJy4uLy4uL2ZyYWN0aW9uc0NvbW1vbi5qcyc7XHJcbmltcG9ydCBDb2xsZWN0aW9uRmluZGVyIGZyb20gJy4vQ29sbGVjdGlvbkZpbmRlci5qcyc7XHJcbmltcG9ydCBGaWxsZWRQYXJ0aXRpb24gZnJvbSAnLi9GaWxsZWRQYXJ0aXRpb24uanMnO1xyXG5pbXBvcnQgRmlsbFR5cGUgZnJvbSAnLi9GaWxsVHlwZS5qcyc7XHJcbmltcG9ydCBGcmFjdGlvbkNoYWxsZW5nZSBmcm9tICcuL0ZyYWN0aW9uQ2hhbGxlbmdlLmpzJztcclxuaW1wb3J0IFNoYXBlUGFydGl0aW9uIGZyb20gJy4vU2hhcGVQYXJ0aXRpb24uanMnO1xyXG5pbXBvcnQgU2hhcGVUYXJnZXQgZnJvbSAnLi9TaGFwZVRhcmdldC5qcyc7XHJcblxyXG4vLyBDb252ZW5pZW5jZSBmdW5jdGlvbnMuXHJcbmNvbnN0IG5leHRCb29sZWFuID0gKCkgPT4gZG90UmFuZG9tLm5leHRCb29sZWFuKCk7XHJcbmNvbnN0IHNhbXBsZSA9IGFycmF5ID0+IGRvdFJhbmRvbS5zYW1wbGUoIGFycmF5ICk7XHJcbmNvbnN0IHNodWZmbGUgPSBhcnJheSA9PiBkb3RSYW5kb20uc2h1ZmZsZSggYXJyYXkgKTtcclxuY29uc3QgbmV4dEludEJldHdlZW4gPSAoIGEsIGIgKSA9PiBkb3RSYW5kb20ubmV4dEludEJldHdlZW4oIGEsIGIgKTtcclxuY29uc3QgY2hvb3NlID0gKCBxLCBpICkgPT4gRnJhY3Rpb25MZXZlbC5jaG9vc2UoIHEsIGkgKTtcclxuY29uc3QgaW5jbHVzaXZlID0gKCBhLCBiICkgPT4gXy5yYW5nZSggYSwgYiArIDEgKTtcclxuY29uc3QgcmVwZWF0ID0gKCBxLCBpICkgPT4gXy50aW1lcyggcSwgKCkgPT4gaSApO1xyXG5jb25zdCBzcGxpdHRhYmxlID0gYXJyYXkgPT4gYXJyYXkuZmlsdGVyKCBmID0+IGYuZGVub21pbmF0b3IgPD0gNCApO1xyXG5jb25zdCBub3RTcGxpdHRhYmxlID0gYXJyYXkgPT4gYXJyYXkuZmlsdGVyKCBmID0+IGYuZGVub21pbmF0b3IgPiA0ICk7XHJcbmNvbnN0IGNob29zZVNwbGl0dGFibGUgPSAoIHEsIGksIGMgPSAxICkgPT4gWyAuLi5jaG9vc2UoIGMsIHNwbGl0dGFibGUoIGkgKSApLCAuLi5jaG9vc2UoIHEgLSBjLCBpICkgXTtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBjb2xsZWN0aW9uRmluZGVyOCA9IG5ldyBDb2xsZWN0aW9uRmluZGVyKCB7XHJcbiAgLy8gZGVmYXVsdCBkZW5vbWluYXRvcnMgdG8gbWF0Y2ggdGhlIEphdmEgc2VhcmNoXHJcbiAgZGVub21pbmF0b3JzOiBpbmNsdXNpdmUoIDEsIDggKS5tYXAoIFByaW1lRmFjdG9yaXphdGlvbi5mYWN0b3IgKVxyXG59ICk7XHJcbmNvbnN0IGNvbGxlY3Rpb25GaW5kZXI5ID0gbmV3IENvbGxlY3Rpb25GaW5kZXIoIHtcclxuICAvLyBkZWZhdWx0IGRlbm9taW5hdG9ycyB0byBtYXRjaCB0aGUgSmF2YSBzZWFyY2hcclxuICBkZW5vbWluYXRvcnM6IGluY2x1c2l2ZSggMSwgOSApLm1hcCggUHJpbWVGYWN0b3JpemF0aW9uLmZhY3RvciApXHJcbn0gKTtcclxuY29uc3QgQ09MT1JTXzMgPSBbXHJcbiAgRnJhY3Rpb25zQ29tbW9uQ29sb3JzLmxldmVsMVByb3BlcnR5LFxyXG4gIEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5sZXZlbDJQcm9wZXJ0eSxcclxuICBGcmFjdGlvbnNDb21tb25Db2xvcnMubGV2ZWwzUHJvcGVydHlcclxuXTtcclxuY29uc3QgQ09MT1JTXzQgPSBbXHJcbiAgLi4uQ09MT1JTXzMsXHJcbiAgRnJhY3Rpb25zQ29tbW9uQ29sb3JzLmxldmVsNFByb3BlcnR5XHJcbl07XHJcblxyXG4vLyBjb21tb24gbGlzdHMgb2YgZnJhY3Rpb25zIG5lZWRlZFxyXG5jb25zdCBleHBhbmRhYmxlTWl4ZWROdW1iZXJzRnJhY3Rpb25zID0gXy5mbGF0dGVuKCBpbmNsdXNpdmUoIDEsIDMgKS5tYXAoIHdob2xlID0+IHtcclxuICByZXR1cm4gW1xyXG4gICAgbmV3IEZyYWN0aW9uKCAxLCAyICksXHJcbiAgICBuZXcgRnJhY3Rpb24oIDEsIDMgKSxcclxuICAgIG5ldyBGcmFjdGlvbiggMiwgMyApLFxyXG4gICAgbmV3IEZyYWN0aW9uKCAxLCA0ICksXHJcbiAgICBuZXcgRnJhY3Rpb24oIDMsIDQgKVxyXG4gIF0ubWFwKCBmID0+IGYucGx1c0ludGVnZXIoIHdob2xlICkgKTtcclxufSApICk7XHJcbmNvbnN0IG1peGVkTnVtYmVyc0ZyYWN0aW9ucyA9IF8uZmxhdHRlbiggaW5jbHVzaXZlKCAxLCAzICkubWFwKCB3aG9sZSA9PiB7XHJcbiAgcmV0dXJuIFtcclxuICAgIG5ldyBGcmFjdGlvbiggMSwgMiApLFxyXG4gICAgbmV3IEZyYWN0aW9uKCAxLCAzICksXHJcbiAgICBuZXcgRnJhY3Rpb24oIDIsIDMgKSxcclxuICAgIG5ldyBGcmFjdGlvbiggMSwgNCApLFxyXG4gICAgbmV3IEZyYWN0aW9uKCAzLCA0ICksXHJcbiAgICBuZXcgRnJhY3Rpb24oIDEsIDUgKSxcclxuICAgIG5ldyBGcmFjdGlvbiggMiwgNSApLFxyXG4gICAgbmV3IEZyYWN0aW9uKCAzLCA1ICksXHJcbiAgICBuZXcgRnJhY3Rpb24oIDQsIDUgKSxcclxuICAgIG5ldyBGcmFjdGlvbiggMSwgNiApLFxyXG4gICAgbmV3IEZyYWN0aW9uKCA1LCA2ICksXHJcbiAgICBuZXcgRnJhY3Rpb24oIDEsIDcgKSxcclxuICAgIG5ldyBGcmFjdGlvbiggMiwgNyApLFxyXG4gICAgbmV3IEZyYWN0aW9uKCAzLCA3ICksXHJcbiAgICBuZXcgRnJhY3Rpb24oIDQsIDcgKSxcclxuICAgIG5ldyBGcmFjdGlvbiggNSwgNyApLFxyXG4gICAgbmV3IEZyYWN0aW9uKCA2LCA3ICksXHJcbiAgICBuZXcgRnJhY3Rpb24oIDEsIDggKSxcclxuICAgIG5ldyBGcmFjdGlvbiggMywgOCApLFxyXG4gICAgbmV3IEZyYWN0aW9uKCA1LCA4ICksXHJcbiAgICBuZXcgRnJhY3Rpb24oIDcsIDggKSxcclxuICAgIG5ldyBGcmFjdGlvbiggMSwgOSApLFxyXG4gICAgbmV3IEZyYWN0aW9uKCAyLCA5ICksXHJcbiAgICBuZXcgRnJhY3Rpb24oIDQsIDkgKSxcclxuICAgIG5ldyBGcmFjdGlvbiggNSwgOSApLFxyXG4gICAgbmV3IEZyYWN0aW9uKCA3LCA5ICksXHJcbiAgICBuZXcgRnJhY3Rpb24oIDgsIDkgKVxyXG4gIF0ubWFwKCBmID0+IGYucGx1c0ludGVnZXIoIHdob2xlICkgKTtcclxufSApICk7XHJcbmNvbnN0IGFsbE1peGVkTnVtYmVyRnJhY3Rpb25zID0gXy5mbGF0dGVuKCBpbmNsdXNpdmUoIDEsIDMgKS5tYXAoIHdob2xlID0+IHtcclxuICByZXR1cm4gXy5mbGF0dGVuKCBpbmNsdXNpdmUoIDIsIDggKS5tYXAoIGRlbm9taW5hdG9yID0+IHtcclxuICAgIHJldHVybiBpbmNsdXNpdmUoIDEsIGRlbm9taW5hdG9yIC0gMSApLm1hcCggbnVtZXJhdG9yID0+IHtcclxuICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbiggbnVtZXJhdG9yLCBkZW5vbWluYXRvciApLnBsdXNJbnRlZ2VyKCB3aG9sZSApO1xyXG4gICAgfSApO1xyXG4gIH0gKSApO1xyXG59ICkgKTtcclxuXHJcbmNsYXNzIEZyYWN0aW9uTGV2ZWwge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXJcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtVGFyZ2V0c1xyXG4gICAqIEBwYXJhbSB7QnVpbGRpbmdUeXBlfSBidWlsZGluZ1R5cGVcclxuICAgKiBAcGFyYW0ge0NvbG9yRGVmfSBjb2xvclxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGdlbmVyYXRlQ2hhbGxlbmdlIC0gZnVuY3Rpb24oe251bWJlcn0gbGV2ZWxOdW1iZXIsIHtDb2xvckRlZn0gY29sb3IpOiB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG51bWJlciwgbnVtVGFyZ2V0cywgYnVpbGRpbmdUeXBlLCBjb2xvciwgZ2VuZXJhdGVDaGFsbGVuZ2UgKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy5udW1iZXIgPSBudW1iZXI7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy5udW1UYXJnZXRzID0gbnVtVGFyZ2V0cztcclxuXHJcbiAgICAvLyBAcHVibGljIHtCdWlsZGluZ1R5cGV9XHJcbiAgICB0aGlzLmJ1aWxkaW5nVHlwZSA9IGJ1aWxkaW5nVHlwZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtDb2xvckRlZn1cclxuICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259XHJcbiAgICB0aGlzLmdlbmVyYXRlQ2hhbGxlbmdlID0gZ2VuZXJhdGVDaGFsbGVuZ2U7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPEZyYWN0aW9uQ2hhbGxlbmdlPn1cclxuICAgIHRoaXMuY2hhbGxlbmdlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHRoaXMubmV4dENoYWxsZW5nZSgpICk7XHJcblxyXG4gICAgLy8gQ2xlYXIgb3V0IHRoZSBpbml0aWFsIHZhbHVlIHNvIHRoYXQgd2UgZG9uJ3QgbGVhayBtZW1vcnkgKHNpbmNlIHRoZXkgcmV0YWluIGEgcmVmZXJlbmNlIHRvIHRoZSBwcmV2aW91c1xyXG4gICAgLy8gY2hhbGxlbmdlKS5cclxuICAgIHRoaXMuY2hhbGxlbmdlUHJvcGVydHkuX2luaXRpYWxWYWx1ZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59XHJcbiAgICB0aGlzLnNjb3JlUHJvcGVydHkgPSBuZXcgRHluYW1pY1Byb3BlcnR5KCB0aGlzLmNoYWxsZW5nZVByb3BlcnR5LCB7XHJcbiAgICAgIGRlcml2ZTogJ3Njb3JlUHJvcGVydHknXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgZnJlc2ggRnJhY3Rpb25DaGFsbGVuZ2UgdGhhdCBzYXRpc2ZpZXMgY29uc3RyYWludHMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtGcmFjdGlvbkNoYWxsZW5nZX1cclxuICAgKi9cclxuICBuZXh0Q2hhbGxlbmdlKCkge1xyXG4gICAgbGV0IGNoYWxsZW5nZSA9IG51bGw7XHJcbiAgICBkbyB7XHJcbiAgICAgIGNoYWxsZW5nZSA9IHRoaXMuZ2VuZXJhdGVDaGFsbGVuZ2UoIHRoaXMubnVtYmVyLCB0aGlzLmNvbG9yICk7XHJcbiAgICB9XHJcbiAgICB3aGlsZSAoIGNoYWxsZW5nZS5nZXRMYXJnZXN0U3RhY2tMYXlvdXRRdWFudGl0eSgpID4gMTAgKTtcclxuXHJcbiAgICByZXR1cm4gY2hhbGxlbmdlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSBvYmplY3QuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgLy8gTm90ZSBpdCBhcyBhIHJlZnJlc2hlZCBjaGFsbGVuZ2UsIHNvIHRoYXQgd2UnbGwgZGlzc29sdmUgdG8gaXQgaWYgbmVlZGVkLlxyXG4gICAgY29uc3QgbmV4dENoYWxsZW5nZSA9IHRoaXMubmV4dENoYWxsZW5nZSgpO1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VQcm9wZXJ0eS52YWx1ZS5yZWZyZXNoZWRDaGFsbGVuZ2UgPSBuZXh0Q2hhbGxlbmdlO1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VQcm9wZXJ0eS52YWx1ZSA9IG5leHRDaGFsbGVuZ2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgcmFuZG9tIHN1YnNldCBvZiB0aGUgaXRlbXMgKHdpdGhvdXQgcmVwbGFjZW1lbnQpLCBpbiBhIHJhbmRvbSBvcmRlci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcXVhbnRpdHlcclxuICAgKiBAcGFyYW0ge0FycmF5LjwqPn0gaXRlbXNcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPCo+fVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjaG9vc2UoIHF1YW50aXR5LCBpdGVtcyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBxdWFudGl0eSA9PT0gJ251bWJlcicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGl0ZW1zICkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGl0ZW1zLmxlbmd0aCA+PSBxdWFudGl0eSApO1xyXG5cclxuICAgIHJldHVybiBzaHVmZmxlKCBpdGVtcyApLnNsaWNlKCAwLCBxdWFudGl0eSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGxpc3Qgb2YgdW5pdCAoMS94KSBmcmFjdGlvbnMgZnJvbSBhIGxpc3Qgb2YgZnJhY3Rpb25zLCBzdWNoIHRoYXQgZWFjaCAoQS9CKSBpcyBjb252ZXJ0ZWQgdG8gQXggKDEvQikuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPEZyYWN0aW9uPn0gZnJhY3Rpb25zXHJcbiAgICogQHJldHVybnMge0FycmF5LjxGcmFjdGlvbj59XHJcbiAgICovXHJcbiAgc3RhdGljIHVuaXRGcmFjdGlvbnMoIGZyYWN0aW9ucyApIHtcclxuICAgIHJldHVybiBfLmZsYXR0ZW4oIGZyYWN0aW9ucy5tYXAoIGZyYWN0aW9uID0+IHtcclxuICAgICAgcmV0dXJuIHJlcGVhdCggZnJhY3Rpb24ubnVtZXJhdG9yLCBuZXcgRnJhY3Rpb24oIDEsIGZyYWN0aW9uLmRlbm9taW5hdG9yICkgKTtcclxuICAgIH0gKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGxpc3Qgb2YgdW5pdCAoMS94KSBmcmFjdGlvbnMgZnJvbSBhIGxpc3Qgb2YgZnJhY3Rpb25zIChoYW5kbGluZyBtaXhlZCBmcmFjdGlvbnMpLCBzdWNoIHRoYXRcclxuICAgKiBlYWNoIChBIEIvQykgaXMgY29udmVydGVkIHRvIEF4ICgxLzEpIGFuZCBCeCAoMS9DKS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48RnJhY3Rpb24+fSBmcmFjdGlvbnNcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPEZyYWN0aW9uPn1cclxuICAgKi9cclxuICBzdGF0aWMgc3RyYWlnaHRmb3J3YXJkRnJhY3Rpb25zKCBmcmFjdGlvbnMgKSB7XHJcbiAgICByZXR1cm4gXy5mbGF0dGVuKCBmcmFjdGlvbnMubWFwKCBmcmFjdGlvbiA9PiB7XHJcbiAgICAgIGNvbnN0IHdob2xlID0gTWF0aC5mbG9vciggZnJhY3Rpb24udmFsdWUgKTtcclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICAuLi5yZXBlYXQoIHdob2xlLCBuZXcgRnJhY3Rpb24oIDEsIDEgKSApLFxyXG4gICAgICAgIC4uLnJlcGVhdCggZnJhY3Rpb24ubnVtZXJhdG9yIC0gd2hvbGUgKiBmcmFjdGlvbi5kZW5vbWluYXRvciwgbmV3IEZyYWN0aW9uKCAxLCBmcmFjdGlvbi5kZW5vbWluYXRvciApIClcclxuICAgICAgXTtcclxuICAgIH0gKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmluZHMgZnJhY3Rpb25zIHN1aXRhYmxlIGZvciBzaGFwZSBncm91cCBjb250YWluZXJzLCBtaW5pbWl6aW5nIHRoZSBudW1iZXIgb2YgcGllY2VzIHRvdGFsLiBGb3IgZXhhbXBsZSBmb3JcclxuICAgKiAxLzIgYW5kIDEzLzgsIGl0IHNwbGl0cyB3aG9sZXMgYXdheSAoMS8xLCAxLzIgYW5kIDUvOCksIHNwbGl0cyA1LzggaW50byAxLzIgKyAxLzgsIGFuZCByZXR1cm5zIDEvMSwxLzIsMS8yLDEvOFxyXG4gICAqIGluIGEgbm9uLWltcG9ydGFudCBvcmRlci5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48RnJhY3Rpb24+fVxyXG4gICAqIEByZXR1cm5zIHtGcmFjdGlvbn1cclxuICAgKi9cclxuICBzdGF0aWMgbWluaW1pemVkRnJhY3Rpb25zKCBmcmFjdGlvbnMgKSB7XHJcbiAgICByZXR1cm4gXy5mbGF0dGVuKCBmcmFjdGlvbnMubWFwKCBmcmFjdGlvbiA9PiB7XHJcbiAgICAgIGNvbnN0IHdob2xlID0gTWF0aC5mbG9vciggZnJhY3Rpb24udmFsdWUgKTtcclxuICAgICAgY29uc3QgcmVtYWluZGVyID0gZnJhY3Rpb24ubWludXNJbnRlZ2VyKCB3aG9sZSApO1xyXG4gICAgICBjb25zdCBjb2xsZWN0aW9ucyA9IGNvbGxlY3Rpb25GaW5kZXI4LnNlYXJjaCggcmVtYWluZGVyICk7XHJcbiAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSBfLnNvcnRCeSggY29sbGVjdGlvbnMsICd0b3RhbFF1YW50aXRpZXMnIClbIDAgXTtcclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICAuLi5yZXBlYXQoIHdob2xlLCBuZXcgRnJhY3Rpb24oIDEsIDEgKSApLFxyXG4gICAgICAgIC4uLmNvbGxlY3Rpb24udW5pdEZyYWN0aW9uc1xyXG4gICAgICBdO1xyXG4gICAgfSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQaWNrcyBhdCByYW5kb20gYSBcImZhaXJseSBsb3cgbnVtYmVyIG9mIGZyYWN0aW9uc1wiIHRoYXQgYWRkIHVwIHRvIHRoZSBnaXZlbiBmcmFjdGlvbi5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtGcmFjdGlvbn0gZnJhY3Rpb25cclxuICAgKiBAcGFyYW0ge251bWJlcn0gW3F1YW50aXR5XSAtIFJldHVybiBhIHJhbmRvbSBzZXQgZnJvbSB0aGUgdG9wIGBxdWFudGl0eWAgb2YgcG9zc2liaWxpdGllcy5cclxuICAgKi9cclxuICBzdGF0aWMgaW50ZXJlc3RpbmdGcmFjdGlvbnMoIGZyYWN0aW9uLCBxdWFudGl0eSA9IDUgKSB7XHJcbiAgICBsZXQgY29sbGVjdGlvbnMgPSBjb2xsZWN0aW9uRmluZGVyOC5zZWFyY2goIGZyYWN0aW9uICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb2xsZWN0aW9ucy5sZW5ndGggKTtcclxuXHJcbiAgICAvLyBKYXZhIGNvbW1lbnQ6XHJcbiAgICAvL0luIG9yZGVyIHRvIHJlbW92ZSB0aGUgdGVkaXVtIGJ1dCBzdGlsbCByZXF1aXJlIGNyZWF0aW9uIG9mIGludGVyZXN0aW5nIHNoYXBlcywgc29ydCBieSB0aGUgbnVtYmVyIG9mIHBpZWNlc1xyXG4gICAgLy9yZXF1aXJlZCB0byBjcmVhdGUgdGhlIGZyYWN0aW9uXHJcbiAgICAvL2FuZCBjaG9vc2Ugb25lIG9mIHRoZSBzb2x1dGlvbnMgd2l0aCBhIHNtYWxsIG51bWJlciBvZiBjYXJkcy5cclxuICAgIF8uc29ydEJ5KCBjb2xsZWN0aW9ucywgY29sbGVjdGlvbiA9PiBjb2xsZWN0aW9uLnRvdGFsUXVhbnRpdGllcyApO1xyXG4gICAgY29uc3QgZmlsdGVyZWRDb2xsZWN0aW9ucyA9IGNvbGxlY3Rpb25zLmZpbHRlciggY29sbGVjdGlvbiA9PiBjb2xsZWN0aW9uLmZyYWN0aW9ucy5sZW5ndGggPiAxICk7XHJcbiAgICAvLyBUaGUgSmF2YSBjb2RlIHVzZWQgY29sbGVjdGlvbnMgd2l0aCBtb3JlIHRoYW4gb25lIGRlbm9taW5hdG9yIHdoZW5ldmVyIHBvc3NpYmxlXHJcbiAgICBpZiAoIGZpbHRlcmVkQ29sbGVjdGlvbnMubGVuZ3RoICkge1xyXG4gICAgICBjb2xsZWN0aW9ucyA9IGZpbHRlcmVkQ29sbGVjdGlvbnM7XHJcbiAgICB9XHJcbiAgICBjb2xsZWN0aW9ucyA9IGNvbGxlY3Rpb25zLnNsaWNlKCAwLCBxdWFudGl0eSApO1xyXG5cclxuICAgIHJldHVybiBzYW1wbGUoIGNvbGxlY3Rpb25zICkudW5pdEZyYWN0aW9ucztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBsaXN0IG9mIGZyYWN0aW9ucyB3aXRoIGFuIGVxdWl2YWxlbnQgc3VtLCB3aGVyZSB1cCB0byBgcXVhbnRpdHlgIGZyYWN0aW9ucyBoYXZlIGJlZW4gc3BsaXQgaW50b1xyXG4gICAqIHN1Yi1mcmFjdGlvbnMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPEZyYWN0aW9uPn0gZnJhY3Rpb25zXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48RnJhY3Rpb24+fVxyXG4gICAqL1xyXG4gIHN0YXRpYyBzaW1wbGVTcGxpdEZyYWN0aW9ucyggZnJhY3Rpb25zLCBvcHRpb25zICkge1xyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIC8vIHtudW1iZXJ9IC0gVXAgdG8gaG93IG1hbnkgZnJhY3Rpb25zIHRvIHNwbGl0XHJcbiAgICAgIHF1YW50aXR5OiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXHJcblxyXG4gICAgICAvLyB7bnVtYmVyfSAtIFRoZSBtYXhpbXVtIGRlbm9taW5hdG9yIHRvIGNvbnNpZGVyIGZvciBhIHNwbGl0IChhbnkgbGFyZ2VyIGRlbm9taW5hdG9ycyB3aWxsIGJlIGlnbm9yZWQpXHJcbiAgICAgIG1heERlbm9taW5hdG9yOiA0LFxyXG5cclxuICAgICAgLy8ge0FycmF5LjxBcnJheS48RnJhY3Rpb24+Pn0gLSBQYXJ0aXRpb25zIHRoYXQgYWRkIHVwIHRvIDEsIGluIGEgZGlzdHJpYnV0aW9uIHRoYXQgd2lsbCBldmVubHkgY3JlYXRlIGRlbm9taW5hdG9yc1xyXG4gICAgICBzcGxpdHM6IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDIgKSxcclxuICAgICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMiApXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDIgKSxcclxuICAgICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMiApXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDIgKSxcclxuICAgICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMiApXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDMgKSxcclxuICAgICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMyApLFxyXG4gICAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCAzIClcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMyApLFxyXG4gICAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCAzICksXHJcbiAgICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDMgKVxyXG4gICAgICAgIF1cclxuICAgICAgXVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIE1ha2UgYSBjb3B5IG9mIGFsbCBmcmFjdGlvbnMsIHNvIHdlIGhhdmUgdW5pcXVlIGluc3RhbmNlcyAoZm9yIGRvd24gYmVsb3cpXHJcbiAgICBmcmFjdGlvbnMgPSBmcmFjdGlvbnMubWFwKCBmID0+IGYuY29weSgpICk7XHJcblxyXG4gICAgY29uc3QgYXZhaWxhYmxlRnJhY3Rpb25zID0gZnJhY3Rpb25zLmZpbHRlciggZiA9PiBmLmRlbm9taW5hdG9yIDw9IG9wdGlvbnMubWF4RGVub21pbmF0b3IgKTtcclxuICAgIGNvbnN0IGZyYWN0aW9uc1RvQ2hhbmdlID0gY2hvb3NlKCBNYXRoLm1pbiggb3B0aW9ucy5xdWFudGl0eSwgYXZhaWxhYmxlRnJhY3Rpb25zLmxlbmd0aCApLCBhdmFpbGFibGVGcmFjdGlvbnMgKTtcclxuICAgIGNvbnN0IG90aGVyRnJhY3Rpb25zID0gYXJyYXlEaWZmZXJlbmNlKCBmcmFjdGlvbnMsIGZyYWN0aW9uc1RvQ2hhbmdlICk7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgLi4uXy5mbGF0dGVuKCBmcmFjdGlvbnNUb0NoYW5nZS5tYXAoIGZyYWN0aW9uID0+IHtcclxuICAgICAgICBjb25zdCBhdmFpbGFibGVTcGxpdHMgPSBvcHRpb25zLnNwbGl0cy5maWx0ZXIoIHNwbGl0RnJhY3Rpb25zID0+IF8uZXZlcnkoIHNwbGl0RnJhY3Rpb25zLCBzcGxpdEZyYWN0aW9uID0+IHtcclxuICAgICAgICAgIHJldHVybiBzcGxpdEZyYWN0aW9uLmRlbm9taW5hdG9yICogZnJhY3Rpb24uZGVub21pbmF0b3IgPD0gODtcclxuICAgICAgICB9ICkgKTtcclxuICAgICAgICByZXR1cm4gc2FtcGxlKCBhdmFpbGFibGVTcGxpdHMgKS5tYXAoIGYgPT4gZi50aW1lcyggZnJhY3Rpb24gKSApO1xyXG4gICAgICB9ICkgKSxcclxuICAgICAgLi4ub3RoZXJGcmFjdGlvbnNcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIChvcHRpb25hbGx5KSBmaWx0ZXJlZCBsaXN0IG9mIGZyYWN0aW9ucyBmcm9tIHRoZSBsaXN0IG9mIG51bWVyYXRvcnMvZGVub21pbmF0b3JzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPG51bWJlcj59IG51bWVyYXRvcnNcclxuICAgKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fSBkZW5vbWluYXRvcnNcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBbcHJlZGljYXRlXSAtIGZ1bmN0aW9uKCB7RnJhY3Rpb259ICk6IHtib29sZWFufVxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48RnJhY3Rpb24+fVxyXG4gICAqL1xyXG4gIHN0YXRpYyBmcmFjdGlvbnMoIG51bWVyYXRvcnMsIGRlbm9taW5hdG9ycywgcHJlZGljYXRlID0gXy5jb25zdGFudCggdHJ1ZSApICkge1xyXG4gICAgcmV0dXJuIF8uZmxhdHRlbiggbnVtZXJhdG9ycy5tYXAoIG51bWVyYXRvciA9PiB7XHJcbiAgICAgIHJldHVybiBkZW5vbWluYXRvcnMubWFwKCBkZW5vbWluYXRvciA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbiggbnVtZXJhdG9yLCBkZW5vbWluYXRvciApO1xyXG4gICAgICB9ICkuZmlsdGVyKCBwcmVkaWNhdGUgKTtcclxuICAgIH0gKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGxpc3Qgb2YgbnVtYmVycyByZXF1aXJlZCBleGFjdGx5IGZvciB0aGUgZ2l2ZW4gZnJhY3Rpb25zIChmb3IgbnVtYmVyIGNoYWxsZW5nZXMpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPEZyYWN0aW9uPn1cclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPG51bWJlcj59XHJcbiAgICovXHJcbiAgc3RhdGljIGV4YWN0TnVtYmVycyggZnJhY3Rpb25zICkge1xyXG4gICAgcmV0dXJuIF8uZmxhdHRlbiggZnJhY3Rpb25zLm1hcCggZnJhY3Rpb24gPT4gW1xyXG4gICAgICBmcmFjdGlvbi5udW1lcmF0b3IsXHJcbiAgICAgIGZyYWN0aW9uLmRlbm9taW5hdG9yXHJcbiAgICBdICkgKS5maWx0ZXIoIF8uaWRlbnRpdHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBsaXN0IG9mIG51bWJlcnMgcmVxdWlyZWQgZXhhY3RseSBmb3IgdGhlIGdpdmVuIGZyYWN0aW9ucyAoZm9yIG51bWJlciBjaGFsbGVuZ2VzKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxGcmFjdGlvbj59XHJcbiAgICogQHJldHVybnMge0FycmF5LjxudW1iZXI+fVxyXG4gICAqL1xyXG4gIHN0YXRpYyBleGFjdE1peGVkTnVtYmVycyggZnJhY3Rpb25zICkge1xyXG4gICAgcmV0dXJuIF8uZmxhdHRlbiggZnJhY3Rpb25zLm1hcCggZnJhY3Rpb24gPT4ge1xyXG4gICAgICBjb25zdCB3aG9sZSA9IE1hdGguZmxvb3IoIGZyYWN0aW9uLnZhbHVlICk7XHJcbiAgICAgIGZyYWN0aW9uID0gZnJhY3Rpb24ubWludXMoIG5ldyBGcmFjdGlvbiggd2hvbGUsIDEgKSApO1xyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIHdob2xlLFxyXG4gICAgICAgIGZyYWN0aW9uLm51bWVyYXRvcixcclxuICAgICAgICBmcmFjdGlvbi5kZW5vbWluYXRvclxyXG4gICAgICBdO1xyXG4gICAgfSApICkuZmlsdGVyKCBfLmlkZW50aXR5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbXVsdGlwbGllZCB2ZXJzaW9uIG9mIHRoZSBmcmFjdGlvbiAoZXF1YWwgdG8gdGhlIHNhbWUgdmFsdWUsIGJ1dCBsYXJnZXIgbnVtZXJhdG9yIGFuZCBkZW5vbWluYXRvcikuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RnJhY3Rpb259IGZyYWN0aW9uXHJcbiAgICogQHJldHVybnMge0ZyYWN0aW9ufVxyXG4gICAqL1xyXG4gIHN0YXRpYyBtdWx0aXBseUZyYWN0aW9uKCBmcmFjdGlvbiApIHtcclxuICAgIGNvbnN0IG11bHRpcGxpZXIgPSBzYW1wbGUoIGZyYWN0aW9uLmRlbm9taW5hdG9yIDw9IDQgPyAoIGZyYWN0aW9uLmRlbm9taW5hdG9yIDw9IDMgPyBbIDIsIDMgXSA6IFsgMiBdICkgOiBbIDEgXSApO1xyXG4gICAgcmV0dXJuIG5ldyBGcmFjdGlvbihcclxuICAgICAgZnJhY3Rpb24ubnVtZXJhdG9yICogbXVsdGlwbGllcixcclxuICAgICAgZnJhY3Rpb24uZGVub21pbmF0b3IgKiBtdWx0aXBsaWVyXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGxpc3Qgb2YgbnVtYmVycyByZXF1aXJlZCBleGFjdGx5IGZvciB0aGUgZ2l2ZW4gZnJhY3Rpb25zIChmb3IgbnVtYmVyIGNoYWxsZW5nZXMpLCBidXQgbXVsdGlwbGllZCBieVxyXG4gICAqIGEgZ2l2ZW4gZmFjdG9yLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPEZyYWN0aW9uPn1cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNlcGFyYXRlV2hvbGUgLSBJZiB0cnVlLCB0aGUgd2hvbGUgcG9ydGlvbiB3aWxsIGJlIHNlcGFyYXRlZCBvdXQgaW50byBhIGNhcmQgb2YgaXRzIG93bi5cclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPG51bWJlcj59XHJcbiAgICovXHJcbiAgc3RhdGljIG11bHRpcGxpZWROdW1iZXJzKCBmcmFjdGlvbnMsIHNlcGFyYXRlV2hvbGUgKSB7XHJcbiAgICByZXR1cm4gXy5mbGF0dGVuKCBmcmFjdGlvbnMubWFwKCBmcmFjdGlvbiA9PiB7XHJcbiAgICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xyXG5cclxuICAgICAgLy8gQWRkIHRoZSB3aG9sZSBwYXJ0IChpZiBhcHBsaWNhYmxlKVxyXG4gICAgICBpZiAoIHNlcGFyYXRlV2hvbGUgKSB7XHJcbiAgICAgICAgY29uc3Qgd2hvbGUgPSBNYXRoLmZsb29yKCBmcmFjdGlvbi52YWx1ZSApO1xyXG4gICAgICAgIGlmICggd2hvbGUgPiAwICkge1xyXG4gICAgICAgICAgcmVzdWx0LnB1c2goIHdob2xlICk7XHJcbiAgICAgICAgICBmcmFjdGlvbiA9IGZyYWN0aW9uLm1pbnVzKCBuZXcgRnJhY3Rpb24oIHdob2xlLCAxICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgbnVtZXJhdG9yL2Rlbm9taW5hdG9yXHJcbiAgICAgIGNvbnN0IG11bHRpcGxpZXIgPSBzYW1wbGUoIGZyYWN0aW9uLmRlbm9taW5hdG9yIDw9IDQgPyAoIGZyYWN0aW9uLmRlbm9taW5hdG9yIDw9IDMgPyBbIDIsIDMgXSA6IFsgMiBdICkgOiBbIDEgXSApO1xyXG4gICAgICByZXN1bHQucHVzaCggZnJhY3Rpb24ubnVtZXJhdG9yICogbXVsdGlwbGllciApO1xyXG4gICAgICByZXN1bHQucHVzaCggZnJhY3Rpb24uZGVub21pbmF0b3IgKiBtdWx0aXBsaWVyICk7XHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfSApICkuZmlsdGVyKCBfLmlkZW50aXR5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBudW1iZXJzIHJlcXVpcmVkIGV4YWN0bHkgZm9yIHRoZSBnaXZlbiBmcmFjdGlvbnMgKGZvciBudW1iZXIgY2hhbGxlbmdlcyksIGJ1dCB3aXRoIGEgY2VydGFpblxyXG4gICAqIHF1YW50aXR5IG9mIHRoZW0gbXVsdGlwbGllZCBieSBhIHJhbmRvbSBmYWN0b3IuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48RnJhY3Rpb24+fVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBxdWFudGl0eVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2VwYXJhdGVXaG9sZSAtIElmIHRydWUsIHRoZSB3aG9sZSBwb3J0aW9uIHdpbGwgYmUgc2VwYXJhdGVkIG91dCBpbnRvIGEgY2FyZCBvZiBpdHMgb3duLlxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48bnVtYmVyPn1cclxuICAgKi9cclxuICBzdGF0aWMgd2l0aE11bHRpcGxpZWROdW1iZXJzKCBmcmFjdGlvbnMsIHF1YW50aXR5LCBzZXBhcmF0ZVdob2xlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHNlcGFyYXRlV2hvbGUgPT09ICdib29sZWFuJyApO1xyXG5cclxuICAgIGxldCBicmVha2FibGUgPSBzaHVmZmxlKCBzcGxpdHRhYmxlKCBmcmFjdGlvbnMgKSApO1xyXG4gICAgbGV0IHVuYnJlYWthYmxlID0gbm90U3BsaXR0YWJsZSggZnJhY3Rpb25zICk7XHJcblxyXG4gICAgLy8gVE9ETzogc2VlIGRlY2lzaW9uIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mcmFjdGlvbnMtY29tbW9uL2lzc3Vlcy84LCB3aGF0IHRvIGRvIGlmIHdlIGxhY2sgdGhlXHJcbiAgICAvLyBudW1iZXIgb2YgYnJlYWthYmxlIGJpdHM/XHJcbiAgICAvLyBhc3NlcnQgJiYgYXNzZXJ0KCBicmVha2FibGUubGVuZ3RoID49IHF1YW50aXR5ICk7XHJcblxyXG4gICAgLy8gUmVzaGFwZSB0aGUgYXJyYXlzIHNvIHRoYXQgd2UgaGF2ZSBhdCBtb3N0IGBxdWFudGl0eWAgaW4gYnJlYWthYmxlICh3ZSdsbCBtdWx0aXBseSB0aG9zZSlcclxuICAgIGlmICggYnJlYWthYmxlLmxlbmd0aCA+IHF1YW50aXR5ICkge1xyXG4gICAgICB1bmJyZWFrYWJsZSA9IFtcclxuICAgICAgICAuLi51bmJyZWFrYWJsZSxcclxuICAgICAgICAuLi5icmVha2FibGUuc2xpY2UoIHF1YW50aXR5IClcclxuICAgICAgXTtcclxuICAgICAgYnJlYWthYmxlID0gYnJlYWthYmxlLnNsaWNlKCAwLCBxdWFudGl0eSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbXHJcbiAgICAgIC4uLiggc2VwYXJhdGVXaG9sZSA/IEZyYWN0aW9uTGV2ZWwuZXhhY3RNaXhlZE51bWJlcnMoIHVuYnJlYWthYmxlICkgOiBGcmFjdGlvbkxldmVsLmV4YWN0TnVtYmVycyggdW5icmVha2FibGUgKSApLFxyXG4gICAgICAuLi5GcmFjdGlvbkxldmVsLm11bHRpcGxpZWROdW1iZXJzKCBicmVha2FibGUsIHNlcGFyYXRlV2hvbGUgKVxyXG4gICAgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgU2hhcGVUYXJnZXRzIGZyb20gYSBsaXN0IG9mIGZyYWN0aW9ucywgZmluZGluZyBtYXRjaGluZyBzaGFwZSBwYXJ0aXRpb25zLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxTaGFwZVBhcnRpdGlvbj59IHNoYXBlUGFydGl0aW9uc1xyXG4gICAqIEBwYXJhbSB7QXJyYXkuPEZyYWN0aW9uPn0gZnJhY3Rpb25zXHJcbiAgICogQHBhcmFtIHtBcnJheS48Q29sb3JEZWY+fSBjb2xvcnNcclxuICAgKiBAcGFyYW0ge0ZpbGxUeXBlfG51bGx9IGZpbGxUeXBlIC0gSWYgbnVsbCwgd2lsbCBoYXZlIHRoZSBjaGFuY2Ugb2YgYmVpbmcgc2VxdWVudGlhbCBvciByYW5kb20uXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBbYWxsb3dTdWJkaXZpc2lvbl0gLSBJZiB0cnVlLCBpdCBjb3VsZCB1c2UgYSBwYXJ0aXRpb24gd2l0aCBlLmcuIDkgc2hhcGVzIGZvciBhIGRlbm9taW5hdG9yIG9mIDNcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPFNoYXBlVGFyZ2V0Pn1cclxuICAgKi9cclxuICBzdGF0aWMgdGFyZ2V0c0Zyb21GcmFjdGlvbnMoIHNoYXBlUGFydGl0aW9ucywgZnJhY3Rpb25zLCBjb2xvcnMsIGZpbGxUeXBlLCBhbGxvd1N1YmRpdmlzaW9uID0gZmFsc2UgKSB7XHJcbiAgICBjb2xvcnMgPSBzaHVmZmxlKCBjb2xvcnMgKTtcclxuICAgIHJldHVybiBmcmFjdGlvbnMubWFwKCAoIGZyYWN0aW9uLCBpbmRleCApID0+IHtcclxuICAgICAgY29uc3QgcG90ZW50aWFsUGFydGl0aW9ucyA9IGFsbG93U3ViZGl2aXNpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gU2hhcGVQYXJ0aXRpb24uc3VwcG9ydHNEaXZpc2libGVEZW5vbWluYXRvciggc2hhcGVQYXJ0aXRpb25zLCBmcmFjdGlvbi5kZW5vbWluYXRvciApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFNoYXBlUGFydGl0aW9uLnN1cHBvcnRzRGVub21pbmF0b3IoIHNoYXBlUGFydGl0aW9ucywgZnJhY3Rpb24uZGVub21pbmF0b3IgKTtcclxuICAgICAgY29uc3QgY29uY3JldGVGaWxsVHlwZSA9IGZpbGxUeXBlID8gZmlsbFR5cGUgOiBzYW1wbGUoIFtcclxuICAgICAgICBGaWxsVHlwZS5TRVFVRU5USUFMLFxyXG4gICAgICAgIEZpbGxUeXBlLk1JWEVEXHJcbiAgICAgIF0gKTtcclxuXHJcbiAgICAgIHJldHVybiBTaGFwZVRhcmdldC5maWxsKCBzYW1wbGUoIHBvdGVudGlhbFBhcnRpdGlvbnMgKSwgZnJhY3Rpb24sIGNvbG9yc1sgaW5kZXggXSwgY29uY3JldGVGaWxsVHlwZSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBTaGFwZVRhcmdldHMgZnJvbSBhIGxpc3Qgb2Ygc2hhcGVQYXJ0aXRpb25zIChyYW5kb21seSBzZWxlY3RpbmcgdGhlIHBhcnRpdGlvbnMgYW5kIFRIRU4gZGV0ZXJtaW5pbmcgdGhlXHJcbiAgICogbnVtZXJhdG9yIGZyb20gdGhlIHBhcnRpdGlvbidzIGRlbm9taW5hdG9yKS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48U2hhcGVQYXJ0aXRpb24+fSBzaGFwZVBhcnRpdGlvbnNcclxuICAgKiBAcGFyYW0ge0FycmF5LjxDb2xvckRlZj59IGNvbG9yc1xyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGRlbm9taW5hdG9yVG9OdW1lcmF0b3IgLSBmdW5jdGlvbigge251bWJlcn0gZGVub21pbmF0b3IgKToge251bWJlcn1cclxuICAgKiBAcGFyYW0ge0ZpbGxUeXBlfG51bGx9IGZpbGxUeXBlIC0gSWYgbnVsbCwgd2lsbCBoYXZlIHRoZSBjaGFuY2Ugb2YgYmVpbmcgc2VxdWVudGlhbCBvciByYW5kb20uXHJcbiAgICogQHJldHVybnMge0FycmF5LjxTaGFwZVRhcmdldD59XHJcbiAgICovXHJcbiAgc3RhdGljIHRhcmdldHNGcm9tUGFydGl0aW9ucyggc2hhcGVQYXJ0aXRpb25zLCBjb2xvcnMsIGRlbm9taW5hdG9yVG9OdW1lcmF0b3IsIGZpbGxUeXBlICkge1xyXG4gICAgY29sb3JzID0gc2h1ZmZsZSggY29sb3JzICk7XHJcbiAgICByZXR1cm4gc2hhcGVQYXJ0aXRpb25zLm1hcCggKCBzaGFwZVBhcnRpdGlvbiwgaW5kZXggKSA9PiB7XHJcbiAgICAgIGNvbnN0IGRlbm9taW5hdG9yID0gc2hhcGVQYXJ0aXRpb24ubGVuZ3RoO1xyXG4gICAgICBjb25zdCBjb25jcmV0ZUZpbGxUeXBlID0gZmlsbFR5cGUgPyBmaWxsVHlwZSA6IHNhbXBsZSggW1xyXG4gICAgICAgIEZpbGxUeXBlLlNFUVVFTlRJQUwsXHJcbiAgICAgICAgRmlsbFR5cGUuTUlYRURcclxuICAgICAgXSApO1xyXG4gICAgICByZXR1cm4gU2hhcGVUYXJnZXQuZmlsbCggc2hhcGVQYXJ0aXRpb24sIG5ldyBGcmFjdGlvbiggZGVub21pbmF0b3JUb051bWVyYXRvciggZGVub21pbmF0b3IgKSwgZGVub21pbmF0b3IgKSwgY29sb3JzWyBpbmRleCBdLCBjb25jcmV0ZUZpbGxUeXBlICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTcGxpdHMgYSBmcmFjdGlvbiBpbnRvIGEgXCJkaWZmaWN1bHRcIiBudW1iZXIgb2YgcGllY2VzIHRoYXQgYXJlIHN1aXRhYmxlIHRvIGZpdCBpbnRvIHNoYXBlIGdyb3VwIGNvbnRhaW5lcnNcclxuICAgKiAoc2hvdWxkIGZpdCBpbnRvIGNlaWwoZnJhY3Rpb24udmFsdWUpIGRpZmZlcmVudCBjb250YWluZXJzIG9mIHNpemUgMSkuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RnJhY3Rpb259IGZyYWN0aW9uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFttYXhOb256ZXJvQ291bnRdIC0gT25seSBhbGxvdyB1cCB0byB0aGlzIG1hbnkgZGlmZmVyZW50IGRlbm9taW5hdG9ycyBpbiB0aGUgcmVzdWx0LlxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48RnJhY3Rpb24+fVxyXG4gICAqL1xyXG4gIHN0YXRpYyBkaWZmaWN1bHRTcGxpdCggZnJhY3Rpb24sIG1heE5vbnplcm9Db3VudCA9IDUgKSB7XHJcbiAgICBjb25zdCB3aG9sZUNvdW50ID0gTWF0aC5jZWlsKCBmcmFjdGlvbi52YWx1ZSApO1xyXG4gICAgY29uc3QgZnVsbFdob2xlQ291bnQgPSBNYXRoLmZsb29yKCBmcmFjdGlvbi52YWx1ZSApO1xyXG4gICAgY29uc3QgcmVtYWluZGVyID0gZnJhY3Rpb24ubWludXNJbnRlZ2VyKCBNYXRoLmZsb29yKCBmcmFjdGlvbi52YWx1ZSApICk7XHJcblxyXG4gICAgLy8gTmVlZCB0byBmaWx0ZXIgdGhlIGNvbGxlY3Rpb25zIHNvIHdlIGRvbid0IGVuZCB1cCBuZWVkaW5nIHRvbyBtYW55IHdob2xlIHNlY3Rpb25zXHJcbiAgICBjb25zdCBjb2xsZWN0aW9ucyA9IHNodWZmbGUoIGNvbGxlY3Rpb25GaW5kZXI4LnNlYXJjaCggZnJhY3Rpb24sIHtcclxuICAgICAgbWF4Tm9uemVyb0NvdW50OiBtYXhOb256ZXJvQ291bnQsXHJcbiAgICAgIG1heFRvdGFsUXVhbnRpdHk6IGZ1bGxXaG9sZUNvdW50ICsgcmVtYWluZGVyLm51bWVyYXRvciArIDUsXHJcbiAgICAgIG1heFF1YW50aXR5OiBNYXRoLm1heCggZnJhY3Rpb24uZGVub21pbmF0b3IgLSAxLCA0IClcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIEJlY2F1c2Ugb2YgcGVyZm9ybWFuY2UsIGp1c3QgZ3JhYiB1cCB0byB0aGUgZmlyc3QgNDAgbGVnYWwgY29sbGVjdGlvbnNcclxuICAgIGNvbnN0IGxlZ2FsQ29sbGVjdGlvbnMgPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNvbGxlY3Rpb25zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBjb2xsZWN0aW9uID0gY29sbGVjdGlvbnNbIGkgXTtcclxuICAgICAgY29uc3QgY29tcGFjdFJlcXVpcmVkR3JvdXBzID0gY29sbGVjdGlvbi5nZXRDb21wYWN0UmVxdWlyZWRHcm91cHMoIHdob2xlQ291bnQsIHdob2xlQ291bnQgKTtcclxuICAgICAgaWYgKCBjb21wYWN0UmVxdWlyZWRHcm91cHMgIT09IG51bGwgJiYgY29tcGFjdFJlcXVpcmVkR3JvdXBzLmxlbmd0aCA8PSB3aG9sZUNvdW50ICkge1xyXG4gICAgICAgIGxlZ2FsQ29sbGVjdGlvbnMucHVzaCggY29sbGVjdGlvbiApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggbGVnYWxDb2xsZWN0aW9ucy5sZW5ndGggPT09IDQwICkge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbWF4Tm9uZGl2aXNpYmxlID0gXy5tYXgoIGxlZ2FsQ29sbGVjdGlvbnMubWFwKCBjb2xsZWN0aW9uID0+IGNvbGxlY3Rpb24ubm9uZGl2aXNpYmxlQ291bnQgKSApO1xyXG5cclxuICAgIC8vIERvbid0IGFsd2F5cyBmb3JjZSB0aGUgXCJtb3N0IGRpZmZpY3VsdFwiIHNpbmNlIHRoYXQgbWlnaHQgYmUgb25lIG9yIHR3byBvcHRpb25zLlxyXG4gICAgY29uc3QgZGlmZmljdWx0Q29sbGVjdGlvbnMgPSBsZWdhbENvbGxlY3Rpb25zLmZpbHRlciggY29sbGVjdGlvbiA9PiBjb2xsZWN0aW9uLm5vbmRpdmlzaWJsZUNvdW50ID49IG1heE5vbmRpdmlzaWJsZSAtIDEgKTtcclxuICAgIGNvbnN0IGNvbGxlY3Rpb24gPSBzYW1wbGUoIGRpZmZpY3VsdENvbGxlY3Rpb25zICk7XHJcblxyXG4gICAgLy8gQnJlYWsgYXBhcnQgd2hvbGVzXHJcbiAgICByZXR1cm4gRnJhY3Rpb25MZXZlbC5zaW1wbGVTcGxpdEZyYWN0aW9ucyggY29sbGVjdGlvbi51bml0RnJhY3Rpb25zLCB7XHJcbiAgICAgIG1heERlbm9taW5hdG9yOiAxXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgZGlmZmljdWx0ICh2YXJ5aW5nIGRlbm9taW5hdG9yLCByYW5kb20gZmlsbCkgc2hhcGUgdGFyZ2V0IGZvciBhIGdpdmVuIGZyYWN0aW9uLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxTaGFwZVBhcnRpdGlvbj59IHNoYXBlUGFydGl0aW9uc1xyXG4gICAqIEBwYXJhbSB7RnJhY3Rpb259IGZyYWN0aW9uXHJcbiAgICogQHBhcmFtIHtDb2xvckRlZn0gY29sb3JcclxuICAgKiBAcmV0dXJucyB7U2hhcGVUYXJnZXR9XHJcbiAgICovXHJcbiAgc3RhdGljIGRpZmZpY3VsdE1peGVkU2hhcGVUYXJnZXQoIHNoYXBlUGFydGl0aW9ucywgZnJhY3Rpb24sIGNvbG9yICkge1xyXG4gICAgY29uc3Qgd2hvbGVDb3VudCA9IE1hdGguY2VpbCggZnJhY3Rpb24udmFsdWUgKTtcclxuXHJcbiAgICAvLyBOZWVkIHRvIGZpbHRlciB0aGUgY29sbGVjdGlvbnMgc28gd2UgZG9uJ3QgZW5kIHVwIG5lZWRpbmcgdG9vIG1hbnkgd2hvbGUgc2VjdGlvbnNcclxuICAgIGNvbnN0IGNvbGxlY3Rpb25zID0gY29sbGVjdGlvbkZpbmRlcjkuc2VhcmNoKCBmcmFjdGlvbiwge1xyXG4gICAgICBtYXhOb256ZXJvQ291bnQ6IDRcclxuICAgIH0gKS5maWx0ZXIoIGNvbGxlY3Rpb24gPT4gXy5zdW0oIGNvbGxlY3Rpb24uZnJhY3Rpb25zLm1hcCggZiA9PiBNYXRoLmNlaWwoIGYudmFsdWUgKSApICkgPD0gd2hvbGVDb3VudCApO1xyXG5cclxuICAgIGNvbnN0IG1heE5vbmRpdmlzaWJsZSA9IF8ubWF4KCBjb2xsZWN0aW9ucy5tYXAoIGNvbGxlY3Rpb24gPT4gY29sbGVjdGlvbi5ub25kaXZpc2libGVDb3VudCApICk7XHJcbiAgICAvLyBEb24ndCBhbHdheXMgZm9yY2UgdGhlIFwibW9zdCBkaWZmaWN1bHRcIiBzaW5jZSB0aGF0IG1pZ2h0IGJlIG9uZSBvciB0d28gb3B0aW9ucy5cclxuICAgIGNvbnN0IGRpZmZpY3VsdENvbGxlY3Rpb25zID0gY29sbGVjdGlvbnMuZmlsdGVyKCBjb2xsZWN0aW9uID0+IGNvbGxlY3Rpb24ubm9uZGl2aXNpYmxlQ291bnQgPj0gbWF4Tm9uZGl2aXNpYmxlIC0gMSApO1xyXG4gICAgY29uc3QgY29sbGVjdGlvbiA9IHNhbXBsZSggZGlmZmljdWx0Q29sbGVjdGlvbnMgKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFNoYXBlVGFyZ2V0KCBmcmFjdGlvbiwgc2h1ZmZsZSggXy5mbGF0dGVuKCBjb2xsZWN0aW9uLmZyYWN0aW9ucy5tYXAoIHN1YkZyYWN0aW9uID0+IHtcclxuICAgICAgY29uc3Qgc2hhcGVQYXJ0aXRpb24gPSBzYW1wbGUoIFNoYXBlUGFydGl0aW9uLnN1cHBvcnRzRGVub21pbmF0b3IoIHNoYXBlUGFydGl0aW9ucywgc3ViRnJhY3Rpb24uZGVub21pbmF0b3IgKSApO1xyXG4gICAgICByZXR1cm4gRmlsbGVkUGFydGl0aW9uLnJhbmRvbUZpbGwoIHNoYXBlUGFydGl0aW9uLCBzdWJGcmFjdGlvbiwgY29sb3IgKTtcclxuICAgIH0gKSApICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBjaGFsbGVuZ2UgZm9yICh1bm1peGVkKSBzaGFwZXMgbGV2ZWwgMS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBEZXNpZ24gZG9jOlxyXG4gICAqID4gVHdvIFwiZHJhd3NcIiwgb25lIHRhcmdldCBzaG91bGQgYmUgZnJvbSB0aGUgc2V0ICB7MS8xLCAyLzIsIDMvM30gYW5kIHRoZSBzZWNvbmQgZHJhdyBmb3IgdGhlIG5leHQgdHdvIHRhcmdldHNcclxuICAgKiA+IGZyb20gdGhlIHNldCB7MS8yLCAxLzMsIDIvM31cclxuICAgKlxyXG4gICAqIFdlIGRvIHRocmVlIFwiZHJhd3NcIiwgb25lIGZyb20gdGhlIGZpcnN0IHNldCwgYW5kIHR3byBmcm9tIHRoZSBzZWNvbmQgc2V0IChpZiB0aGF0J3MgY2xlYXIpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsTnVtYmVyXHJcbiAgICogQHBhcmFtIHtDb2xvckRlZn0gY29sb3JcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsMVNoYXBlcyggbGV2ZWxOdW1iZXIsIGNvbG9yICkge1xyXG4gICAgY29uc3QgdGFyZ2V0RnJhY3Rpb25zID0gc2h1ZmZsZSggW1xyXG4gICAgICAuLi5jaG9vc2UoIDEsIFtcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDEgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDIsIDIgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDMsIDMgKVxyXG4gICAgICBdICksXHJcbiAgICAgIC4uLmNob29zZSggMiwgW1xyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMiApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMyApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMiwgMyApXHJcbiAgICAgIF0gKVxyXG4gICAgXSApO1xyXG5cclxuICAgIGNvbnN0IHBpZWNlRnJhY3Rpb25zID0gW1xyXG4gICAgICAuLi5yZXBlYXQoIDIsIG5ldyBGcmFjdGlvbiggMSwgMSApICksXHJcbiAgICAgIC4uLnJlcGVhdCggMiwgbmV3IEZyYWN0aW9uKCAxLCAyICkgKSxcclxuICAgICAgLi4ucmVwZWF0KCAzLCBuZXcgRnJhY3Rpb24oIDEsIDMgKSApXHJcbiAgICBdO1xyXG5cclxuICAgIHJldHVybiBGcmFjdGlvbkNoYWxsZW5nZS5jcmVhdGVTaGFwZUNoYWxsZW5nZSggbGV2ZWxOdW1iZXIsIGZhbHNlLCBjb2xvciwgdGFyZ2V0RnJhY3Rpb25zLCBwaWVjZUZyYWN0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNoYWxsZW5nZSBmb3IgKHVubWl4ZWQpIHNoYXBlcyBsZXZlbCAyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIERlc2lnbiBkb2M6XHJcbiAgICogPiBDaG9vc2luZyBmcm9tIGEgZGlzdHJpYnV0aW9uIG9mIGZyYWN0aW9ucyByYW5naW5nIGZyb20gMS8yIHRvIDQvNS4gIFRoZSBudW1lcmF0b3IgY2FuIGJlIDEsIDIsIDMsIG9yIDQgYW5kIHRoZVxyXG4gICAqID4gZGVub21pbmF0b3IgY291bGQgYmUgMiwgMywgNCwgb3IgNSB3aXRoIHRoZSBzdGlwdWxhdGlvbiB0aGF0IHRoZSBmcmFjdGlvbiBpcyBhbHdheXMgbGVzcyB0aGFuIDEuIE5vIFwid2hvbGVzXCIgaW5cclxuICAgKiA+IHRoZSBzaGFwZXMgcGlsZXMuIDIgcG9zc2libGUgd2F5cyB0byBtYWtlIGF0IGxlYXN0IG9uZSBvZiB0aGUgdGFyZ2V0c1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsTnVtYmVyXHJcbiAgICogQHBhcmFtIHtDb2xvckRlZn0gY29sb3JcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsMlNoYXBlcyggbGV2ZWxOdW1iZXIsIGNvbG9yICkge1xyXG4gICAgY29uc3QgdGFyZ2V0RnJhY3Rpb25zID0gY2hvb3NlU3BsaXR0YWJsZSggMywgW1xyXG4gICAgICBuZXcgRnJhY3Rpb24oIDEsIDIgKSxcclxuICAgICAgbmV3IEZyYWN0aW9uKCAxLCAzICksXHJcbiAgICAgIG5ldyBGcmFjdGlvbiggMSwgNCApLFxyXG4gICAgICBuZXcgRnJhY3Rpb24oIDEsIDUgKSxcclxuICAgICAgbmV3IEZyYWN0aW9uKCAyLCAzICksXHJcbiAgICAgIG5ldyBGcmFjdGlvbiggMiwgNCApLFxyXG4gICAgICBuZXcgRnJhY3Rpb24oIDIsIDUgKSxcclxuICAgICAgbmV3IEZyYWN0aW9uKCAzLCA0ICksXHJcbiAgICAgIG5ldyBGcmFjdGlvbiggMywgNSApLFxyXG4gICAgICBuZXcgRnJhY3Rpb24oIDQsIDUgKVxyXG4gICAgXSApO1xyXG5cclxuICAgIGNvbnN0IHBpZWNlRnJhY3Rpb25zID0gW1xyXG4gICAgICAuLi5GcmFjdGlvbkxldmVsLnVuaXRGcmFjdGlvbnMoIHRhcmdldEZyYWN0aW9ucyApLFxyXG4gICAgICAuLi5GcmFjdGlvbkxldmVsLmludGVyZXN0aW5nRnJhY3Rpb25zKCBzYW1wbGUoIHNwbGl0dGFibGUoIHRhcmdldEZyYWN0aW9ucyApICkgKVxyXG4gICAgXTtcclxuXHJcbiAgICByZXR1cm4gRnJhY3Rpb25DaGFsbGVuZ2UuY3JlYXRlU2hhcGVDaGFsbGVuZ2UoIGxldmVsTnVtYmVyLCBmYWxzZSwgY29sb3IsIHRhcmdldEZyYWN0aW9ucywgcGllY2VGcmFjdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBjaGFsbGVuZ2UgZm9yICh1bm1peGVkKSBzaGFwZXMgbGV2ZWwgMy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBEZXNpZ24gZG9jOlxyXG4gICAqID4gTGlrZSBsZXZlbCAyLCBidXQgbm93IGZyYWN0aW9ucyByYW5naW5nIGZyb20gMS8xIHRvIDYvNiwgYW5kIHdpdGggXCJ3aG9sZVwiIHBpZWNlcyBhdmFpbGFibGUuXHJcbiAgICogPiBOdW1iZXIgb2YgcGllY2VzIG9mIGVhY2ggZnJhY3Rpb24gYWxsb3dpbmcgZm9yIG11bHRpcGxlIHNvbHV0aW9uc1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsTnVtYmVyXHJcbiAgICogQHBhcmFtIHtDb2xvckRlZn0gY29sb3JcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsM1NoYXBlcyggbGV2ZWxOdW1iZXIsIGNvbG9yICkge1xyXG4gICAgY29uc3QgdGFyZ2V0RnJhY3Rpb25zID0gY2hvb3NlU3BsaXR0YWJsZSggMywgXy5mbGF0dGVuKCBpbmNsdXNpdmUoIDEsIDYgKS5tYXAoIGQgPT4ge1xyXG4gICAgICByZXR1cm4gaW5jbHVzaXZlKCAxLCBkICkubWFwKCBuID0+IG5ldyBGcmFjdGlvbiggbiwgZCApICk7XHJcbiAgICB9ICkgKSApO1xyXG5cclxuICAgIGNvbnN0IHBpZWNlRnJhY3Rpb25zID0gW1xyXG4gICAgICAuLi5GcmFjdGlvbkxldmVsLnVuaXRGcmFjdGlvbnMoIHRhcmdldEZyYWN0aW9ucy5tYXAoIGYgPT4gZi52YWx1ZSA9PT0gMSA/IEZyYWN0aW9uLk9ORSA6IGYgKSApLFxyXG4gICAgICAuLi5fLmZsYXR0ZW4oIHRhcmdldEZyYWN0aW9ucy5tYXAoIGYgPT4gRnJhY3Rpb25MZXZlbC5pbnRlcmVzdGluZ0ZyYWN0aW9ucyggZiwgMiApICkgKVxyXG4gICAgXTtcclxuXHJcbiAgICByZXR1cm4gRnJhY3Rpb25DaGFsbGVuZ2UuY3JlYXRlU2hhcGVDaGFsbGVuZ2UoIGxldmVsTnVtYmVyLCBmYWxzZSwgY29sb3IsIHRhcmdldEZyYWN0aW9ucywgcGllY2VGcmFjdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBjaGFsbGVuZ2UgZm9yICh1bm1peGVkKSBzaGFwZXMgbGV2ZWwgNC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBKYXZhIGRvYzpcclxuICAgKiA+IEdvYWw6IGJ1aWxkIHRoZSBzYW1lIHRhcmdldHMgd2l0aCBjb25zdHJhaW5lZCBwaWVjZXMuXHJcbiAgICogPiAyIHBvc3NpYmxlIHRhcmdldHMsIHdoaWNoIGFyZSB7MS8yLCAxLzF9LiAgRm9yIDEvMSwgY29uc3RyYWluIG9uZSBvZiB0aGUgdGFyZ2V0cyBzbyB0aGV5IG11c3QgdXNlIHR3byBkaWZmZXJlbnRcclxuICAgKiA+IHNpemVzLiAgRm9yIGluc3RhbmNlLCBvbmx5IGVub3VnaCBoYWx2ZXMgYW5kIHF1YXJ0ZXJzIHNvIHRoZXkgbXVzdCBkbyAxIGhhbGYgcGllY2UgYW5kIDIgcXVhcnRlciBwaWVjZXMuIE9yIDJcclxuICAgKiA+IHRoaXJkIHBpZWNlcyBhbmQgMiBzaXh0aCBwaWVjZXMuXHJcbiAgICpcclxuICAgKiBEZXNpZ24gZG9jOlxyXG4gICAqID4gQWxsIDMgdGFyZ2V0cyB0aGUgc2FtZSwgMiBwb3NzaWJsZSB0YXJnZXQgdmFsdWVzIHsxLzIsIDEvMX0uXHJcbiAgICogPiBObyBcIndob2xlXCIgcGllY2VzIGF2YWlsYWJsZVxyXG4gICAqID4gY29uc3RyYWluIG9uZSBvZiB0aGUgdGFyZ2V0cyBzbyB0aGF0IHR3byBkaWZmZXJlbnQgc2l6ZXMgbXVzdCBiZSB1c2VkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsTnVtYmVyXHJcbiAgICogQHBhcmFtIHtDb2xvckRlZn0gY29sb3JcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsNFNoYXBlcyggbGV2ZWxOdW1iZXIsIGNvbG9yICkge1xyXG4gICAgbGV0IHRhcmdldEZyYWN0aW9ucztcclxuICAgIGxldCBwaWVjZUZyYWN0aW9ucztcclxuXHJcbiAgICBpZiAoIG5leHRCb29sZWFuKCkgKSB7XHJcbiAgICAgIC8vIEphdmEgd2hvbGVzTGV2ZWw0XHJcbiAgICAgIHRhcmdldEZyYWN0aW9ucyA9IHJlcGVhdCggMywgbmV3IEZyYWN0aW9uKCAxLCAxICkgKTtcclxuICAgICAgcGllY2VGcmFjdGlvbnMgPSBbXHJcbiAgICAgICAgLi4ucmVwZWF0KCAzLCBuZXcgRnJhY3Rpb24oIDEsIDIgKSApLFxyXG4gICAgICAgIC4uLnJlcGVhdCggMywgbmV3IEZyYWN0aW9uKCAxLCAzICkgKSxcclxuICAgICAgICAuLi5yZXBlYXQoIDMsIG5ldyBGcmFjdGlvbiggMSwgNCApICksXHJcbiAgICAgICAgLi4ucmVwZWF0KCAzLCBuZXcgRnJhY3Rpb24oIDEsIDYgKSApXHJcbiAgICAgIF07XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gSmF2YSBoYWxmTGV2ZWw0LCBidXQgY3VzdG9tLW1vZGlmaWVkIHRvIGhhdmUgdGhlIGNvbnN0cmFpbnQgc2F0aXNmaWVkXHJcbiAgICAgIHRhcmdldEZyYWN0aW9ucyA9IHJlcGVhdCggMywgbmV3IEZyYWN0aW9uKCAxLCAyICkgKTtcclxuICAgICAgcGllY2VGcmFjdGlvbnMgPSBbXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCAyICksXHJcbiAgICAgICAgLi4ucmVwZWF0KCAzLCBuZXcgRnJhY3Rpb24oIDEsIDMgKSApLFxyXG4gICAgICAgIC4uLnJlcGVhdCggMywgbmV3IEZyYWN0aW9uKCAxLCA0ICkgKSxcclxuICAgICAgICAuLi5yZXBlYXQoIDIsIG5ldyBGcmFjdGlvbiggMSwgNiApIClcclxuICAgICAgXTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gRnJhY3Rpb25DaGFsbGVuZ2UuY3JlYXRlU2hhcGVDaGFsbGVuZ2UoIGxldmVsTnVtYmVyLCBmYWxzZSwgY29sb3IsIHRhcmdldEZyYWN0aW9ucywgcGllY2VGcmFjdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBjaGFsbGVuZ2UgZm9yICh1bm1peGVkKSBzaGFwZXMgbGV2ZWwgNS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBKYXZhIGRvYzpcclxuICAgKiA+IFBpZSBzaGFwZXMgZm9yIHRoaXMgbGV2ZWxcclxuICAgKiA+IG51bWVyYXRvciBhYmxlIHRvIHJhbmdlIGZyb20gMS04LCBhbmQgZGVub21pbmF0b3IgYWJsZSB0byByYW5nZSBmcm9tIDEtOCwgd2l0aCB0aGUgbnVtYmVyIGxlc3MgdGhhbiBvciBlcXVhbCB0b1xyXG4gICAqID4gMVxyXG4gICAqID4gYWxsIHBpZWNlcyBhdmFpbGFibGUgdG8gZnVsZmlsbCB0YXJnZXRzIGluIHRoZSBtb3N0IHN0cmFpZ2h0Zm9yd2FyZCB3YXkgKHNvIGZvciBpbnN0YW5jZSBpZiAzLzggYXBwZWFycyB0aGVyZVxyXG4gICAqID4gd2lsbCAzIDEvOCBwaWVjZXMpXHJcbiAgICpcclxuICAgKiBEZXNpZ24gZG9jOlxyXG4gICAqID4gLSBudW1lcmF0b3IgYWJsZSB0byByYW5nZSBmcm9tIDEtOCwgYW5kIGRlbm9taW5hdG9yIGFibGUgdG8gcmFuZ2UgZnJvbSAxLTgsIHdpdGggdGhlIG51bWJlciBsZXNzIHRoYW4gb3IgZXF1YWxcclxuICAgKiA+ICAgdG8gMVxyXG4gICAqID4gLSBhbGwgcGllY2VzIGF2YWlsYWJsZSB0byBmdWxmaWxsIHRhcmdldHMgaW4gdGhlIG1vc3Qgc3RyYWlnaHRmb3J3YXJkIHdheSAoc28gZm9yIGluc3RhbmNlIGlmIDMvOCBhcHBlYXJzIHRoZXJlXHJcbiAgICogPiAgIHdpbGwgMyAxLzggcGllY2VzKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsTnVtYmVyXHJcbiAgICogQHBhcmFtIHtDb2xvckRlZn0gY29sb3JcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsNVNoYXBlcyggbGV2ZWxOdW1iZXIsIGNvbG9yICkge1xyXG4gICAgY29uc3QgdGFyZ2V0RnJhY3Rpb25zID0gY2hvb3NlKCAzLCBpbmNsdXNpdmUoIDEsIDggKSApLm1hcCggZGVub21pbmF0b3IgPT4ge1xyXG4gICAgICByZXR1cm4gbmV3IEZyYWN0aW9uKCBuZXh0SW50QmV0d2VlbiggMSwgZGVub21pbmF0b3IgKSwgZGVub21pbmF0b3IgKTtcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHBpZWNlRnJhY3Rpb25zID0gRnJhY3Rpb25MZXZlbC51bml0RnJhY3Rpb25zKCB0YXJnZXRGcmFjdGlvbnMgKTtcclxuXHJcbiAgICByZXR1cm4gRnJhY3Rpb25DaGFsbGVuZ2UuY3JlYXRlU2hhcGVDaGFsbGVuZ2UoIGxldmVsTnVtYmVyLCBmYWxzZSwgY29sb3IsIHRhcmdldEZyYWN0aW9ucywgcGllY2VGcmFjdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBjaGFsbGVuZ2UgZm9yICh1bm1peGVkKSBzaGFwZXMgbGV2ZWwgNi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBKYXZhIGRvYzpcclxuICAgKiA+IC0tYWxsIHRhcmdldHMgYXJlIG1hZGUgZnJvbSBvbmx5IDIgc3RhY2tzIG9mIHRoZSBzYW1lIHNpemUgcGllY2VzXHJcbiAgICogPiAtLVNvIGZvciBpbnN0YW5jZSB3ZSBnaXZlIGEgc3RhY2sgb2YgdGhpcmRzIGFuZCBhIHN0YWNrIG9mIGhhbHZlcywgYW5kIHsyLzMsIDIvNCwgNS82LCAxLzF9IGFyZSB0aGUgdGFyZ2V0XHJcbiAgICogPiAgIGZyYWN0aW9ucywgYnV0IHdlIGNvbnN0cmFpbiB0aGUgcGllY2VzIHNvIHRoYXQgc29tZSBmcmFjdGlvbnMgbXVzdCBiZSBtYWRlIGluIFwiaW50ZXJlc3RpbmdcIiB3YXlzLiAgMi8zIGNvdWxkXHJcbiAgICogPiAgIGp1c3QgYmUgbWFkZSB3aXRoIDIgdGhpcmQgcGllY2VzLCBidXQgNS82IHdvdWxkIG5lZWQgdG8gYmUgbWFkZSBvZiBhIDEvMiBhbmQgYSAxLzMuXHJcbiAgICogPiAtLUl0IHNlZW1zIHRoZSBzZXRzIHRoYXQgd291bGQgd29yayB3ZWxsIGZvciBwaWVjZXMgd291bGQgYmUsIHsxLzIsIDEvM30sIHsxLzIsIDEvNH0sIHsxLzMsIDEvNH0sIHsxLzIsIDEvNn0sXHJcbiAgICogPiAgIHsxLzMsIDEvNn0sIHsxLzQsIDEvOH0sIHsxLzIsIDEvOH1cclxuICAgKiA+IC0tdGhlIGNvbnN0cmFpbnQgc2hvdWxkIGJlIHN1Y2ggdGhhdCBvbmx5IGVub3VnaCBwaWVjZXMgZXhpc3QgdG8gY29tcGxldGUgdGhlIHRhcmdldHMuXHJcbiAgICogPiBLZWVwIHRoZSB2YWx1ZXMgbGVzcyB0aGFuIDEgYnkgdHJpYWwgYW5kIGVycm9yLlxyXG4gICAqXHJcbiAgICogRGVzaWduIGRvYzpcclxuICAgKiA+IC0tIHN3aXRjaCB0byA0IHRhcmdldHMgZm9yIHRoaXMgbGV2ZWxcclxuICAgKiA+IC0tIGFsbCB0YXJnZXRzIGFyZSBtYWRlIGZyb20gb25seSAyIHN0YWNrcyBvZiBwaWVjZXNcclxuICAgKiA+IC0tIFNvIGZvciBpbnN0YW5jZSB3ZSBnaXZlIGEgc3RhY2sgb2YgdGhpcmRzIGFuZCBhIHN0YWNrIG9mIGhhbHZlcywgYW5kIHsyLzMsIDIvNCwgNS82LCAxLzF9IGFyZSB0aGUgdGFyZ2V0XHJcbiAgICogPiAgICBmcmFjdGlvbnMsIGJ1dCB3ZSBjb25zdHJhaW4gdGhlIHBpZWNlcyBzbyB0aGF0IHNvbWUgZnJhY3Rpb25zIG11c3QgYmUgbWFkZSBpbiBcImludGVyZXN0aW5nXCIgd2F5cy4gIDIvM1xyXG4gICAqID4gICAgY291bGQganVzdCBiZSBtYWRlIHdpdGggMiB0aGlyZCBwaWVjZXMsIGJ1dCA1LzYgd291bGQgbmVlZCB0byBiZSBtYWRlIG9mIGEgMS8yIGFuZCBhIDEvMy5cclxuICAgKiA+IC0tIEl0IHNlZW1zIHRoZSBzZXRzIHRoYXQgd291bGQgd29yayB3ZWxsIGZvciBwaWVjZXMgd291bGQgYmUsIHsxLzIsIDEvM30sIHsxLzIsIDEvNH0sIHsxLzMsIDEvNH0sIHsxLzIsIDEvNn0sXHJcbiAgICogICAgICB7MS8zLCAxLzZ9LCB7MS80LCAxLzh9LCB7MS8yLCAxLzh9XHJcbiAgICogPiAtLSB0aGUgY29uc3RyYWludCBzaG91bGQgYmUgc3VjaCB0aGF0IG9ubHkgZW5vdWdoIHBpZWNlcyBleGlzdCB0byBjb21wbGV0ZSB0aGUgdGFyZ2V0c1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsTnVtYmVyXHJcbiAgICogQHBhcmFtIHtDb2xvckRlZn0gY29sb3JcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsNlNoYXBlcyggbGV2ZWxOdW1iZXIsIGNvbG9yICkge1xyXG4gICAgd2hpbGUgKCB0cnVlICkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxyXG5cclxuICAgICAgLy8gSmF2YSBkb2M6XHJcbiAgICAgIC8vbGV0J3MgaW1wbGVtZW50IHRoaXMgbXkgbWFraW5nIGVhY2ggc29sdXRpb24gYXMgbmEgKyBtYiwgd2hlcmUgYSBhbmQgYiBhcmUgdGhlIGZyYWN0aW9ucyBmcm9tIHBhaXJzIGFib3ZlXHJcblxyXG4gICAgICBjb25zdCBjYXJkU2l6ZXMgPSBzYW1wbGUoIFsgWyAyLCAzIF0sIFsgMiwgNCBdLCBbIDMsIDQgXSwgWyAyLCA2IF0sIFsgMywgNiBdLCBbIDQsIDggXSwgWyAyLCA4IF0gXSApO1xyXG4gICAgICBjb25zdCBzZWxlY3RlZENvZWZmaWNpZW50cyA9IGNob29zZSggNCwgWyBbIDAsIDEgXSwgWyAxLCAwIF0sIFsgMSwgMSBdLCBbIDEsIDIgXSwgWyAyLCAxIF0sIFsgMiwgMiBdLCBbIDMsIDEgXSwgWyAxLCAzIF0gXSApO1xyXG5cclxuICAgICAgY29uc3QgdGFyZ2V0RnJhY3Rpb25zID0gc2VsZWN0ZWRDb2VmZmljaWVudHMubWFwKCAoIFsgbiwgbSBdICkgPT4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgRnJhY3Rpb24oIG4sIGNhcmRTaXplc1sgMCBdICkucGx1cyggbmV3IEZyYWN0aW9uKCBtLCBjYXJkU2l6ZXNbIDEgXSApICkucmVkdWNlZCgpO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGlmICggXy5zb21lKCB0YXJnZXRGcmFjdGlvbnMsIGYgPT4gRnJhY3Rpb24uT05FLmlzTGVzc1RoYW4oIGYgKSApICkge1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBwaWVjZUZyYWN0aW9ucyA9IF8uZmxhdHRlbiggc2VsZWN0ZWRDb2VmZmljaWVudHMubWFwKCAoIFsgbiwgbSBdICkgPT4ge1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAuLi5yZXBlYXQoIG4sIG5ldyBGcmFjdGlvbiggMSwgY2FyZFNpemVzWyAwIF0gKSApLFxyXG4gICAgICAgICAgLi4ucmVwZWF0KCBtLCBuZXcgRnJhY3Rpb24oIDEsIGNhcmRTaXplc1sgMSBdICkgKVxyXG4gICAgICAgIF07XHJcbiAgICAgIH0gKSApO1xyXG5cclxuICAgICAgcmV0dXJuIEZyYWN0aW9uQ2hhbGxlbmdlLmNyZWF0ZVNoYXBlQ2hhbGxlbmdlKCBsZXZlbE51bWJlciwgZmFsc2UsIGNvbG9yLCB0YXJnZXRGcmFjdGlvbnMsIHBpZWNlRnJhY3Rpb25zICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY2hhbGxlbmdlIGZvciAodW5taXhlZCkgc2hhcGVzIGxldmVsIDcuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogSmF2YSBkb2M6XHJcbiAgICogPiAtLVRvcCB0d28gdGFyZ2V0cywgYW5kIGJvdHRvbSAyIHRhcmdldHMgYXJlIGVxdWl2YWxlbnQgYnV0IHN0aWxsIG51bWJlcnMgbGVzcyB0aGFuIDFcclxuICAgKiA+IC0tIEEgYnVpbHQgaW4gY2hlY2sgdG8gZHJhdyBhIGRpZmZlcmVudCBmcmFjdGlvbiBmb3IgdGhlIHRvcCAyIGFuZCB0aGUgYm90dG9tIDJcclxuICAgKiA+IC0tIFBvc3NpYmxlIGZyYWN0aW9ucyBzZXRzIGZyb20gd2hpY2ggdG8gZHJhdyAyIGVhY2ggezEvMiwgMS8zLCAyLzMsIDEvNCwgMy80LCA1LzYsIDMvOCwgNS84fVxyXG4gICAqID4gLS0gU2hhcGUgcGllY2VzIGNvbnN0cmFpbmVkIHNvIHRoYXQgZm9yIGluc3RhbmNlIGlmIDEvMiBhbmQgMS8yIGFwcGVhcnMgZm9yIHRoZSB0b3AgdGFyZ2V0cywgYSAxLzIgcGllY2UgbWlnaHRcclxuICAgKiA+ICAgIGJlIGF2YWlsYWJsZSBidXQgdGhlIG90aGVyIG9uZSB3aWxsIG5lZWQgdG8gYmUgbWFkZSB3aXRoIGEgMS80IGFuZCAxLzQsIG9yIGEgMS8zIGFuZCBhIDEvNiBvciBzdWNoLlxyXG4gICAqID4gLS0gSWYgMy84IG9yIDUvOCBhcmUgZHJhd24gY2lyY2xlcyBzaG91bGQgYmUgdXNlZCwgaWYgbm90IGNpcmNsZXMgb3IgdGlsZXMgd2lsbCB3b3JrIGZpbmVcclxuICAgKlxyXG4gICAqIERlc2lnbiBkb2M6XHJcbiAgICogPiAtLVRvcCB0d28gdGFyZ2V0cywgYW5kIGJvdHRvbSAyIHRhcmdldHMgYXJlIGVxdWl2YWxlbnQgYnV0IHN0aWxsIG51bWJlcnMgbGVzcyB0aGFuIDFcclxuICAgKiA+IC0tIEEgYnVpbHQgaW4gY2hlY2sgdG8gZHJhdyBhIGRpZmZlcmVudCBmcmFjdGlvbiBmb3IgdGhlIHRvcCAyIGFuZCB0aGUgYm90dG9tIDJcclxuICAgKiA+IC0tIFBvc3NpYmxlIGZyYWN0aW9ucyBzZXRzIGZyb20gd2hpY2ggdG8gZHJhdyAyIGVhY2ggezEvMiwgMS8zLCAyLzMsIDEvNCwgMy80LCA1LzYsIDMvOCwgNS84fVxyXG4gICAqID4gLS0gU2hhcGUgcGllY2VzIGNvbnN0cmFpbmVkIHNvIHRoYXQgZm9yIGluc3RhbmNlIGlmIDEvMiBhbmQgMS8yIGFwcGVhcnMgZm9yIHRoZSB0b3AgdGFyZ2V0cywgYSAxLzIgcGllY2UgbWlnaHRcclxuICAgKiA+ICAgIGJlIGF2YWlsYWJsZSBidXQgdGhlIG90aGVyIG9uZSB3aWxsIG5lZWQgdG8gYmUgbWFkZSB3aXRoIGEgMS80IGFuZCAxLzQsIG9yIGEgMS8zIGFuZCBhIDEvNiBvciBzdWNoLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsTnVtYmVyXHJcbiAgICogQHBhcmFtIHtDb2xvckRlZn0gY29sb3JcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsN1NoYXBlcyggbGV2ZWxOdW1iZXIsIGNvbG9yICkge1xyXG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBjaG9vc2UoIDIsIFtcclxuICAgICAgbmV3IEZyYWN0aW9uKCAxLCAyICksXHJcbiAgICAgIG5ldyBGcmFjdGlvbiggMSwgMyApLFxyXG4gICAgICBuZXcgRnJhY3Rpb24oIDIsIDMgKSxcclxuICAgICAgbmV3IEZyYWN0aW9uKCAxLCA0ICksXHJcbiAgICAgIG5ldyBGcmFjdGlvbiggMywgNCApLFxyXG4gICAgICBuZXcgRnJhY3Rpb24oIDUsIDYgKSxcclxuICAgICAgbmV3IEZyYWN0aW9uKCAzLCA4ICksXHJcbiAgICAgIG5ldyBGcmFjdGlvbiggNSwgOCApXHJcbiAgICBdICk7XHJcblxyXG4gICAgY29uc3QgdGFyZ2V0RnJhY3Rpb25zID0gW1xyXG4gICAgICBzZWxlY3RlZFsgMCBdLFxyXG4gICAgICBzZWxlY3RlZFsgMCBdLFxyXG4gICAgICBzZWxlY3RlZFsgMSBdLFxyXG4gICAgICBzZWxlY3RlZFsgMSBdXHJcbiAgICBdO1xyXG5cclxuICAgIGNvbnN0IHBpZWNlRnJhY3Rpb25zID0gXy5mbGF0dGVuKCBfLmZsYXR0ZW4oIFtcclxuICAgICAgY2hvb3NlKCAyLCBjb2xsZWN0aW9uRmluZGVyOC5zZWFyY2goIHNlbGVjdGVkWyAwIF0sIHtcclxuICAgICAgICBtYXhRdWFudGl0eTogOFxyXG4gICAgICB9ICkgKSxcclxuICAgICAgY2hvb3NlKCAyLCBjb2xsZWN0aW9uRmluZGVyOC5zZWFyY2goIHNlbGVjdGVkWyAxIF0sIHtcclxuICAgICAgICBtYXhRdWFudGl0eTogOFxyXG4gICAgICB9ICkgKVxyXG4gICAgXSApLm1hcCggY29sbGVjdGlvbiA9PiBjb2xsZWN0aW9uLnVuaXRGcmFjdGlvbnMgKSApO1xyXG5cclxuICAgIHJldHVybiBGcmFjdGlvbkNoYWxsZW5nZS5jcmVhdGVTaGFwZUNoYWxsZW5nZSggbGV2ZWxOdW1iZXIsIGZhbHNlLCBjb2xvciwgdGFyZ2V0RnJhY3Rpb25zLCBwaWVjZUZyYWN0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNoYWxsZW5nZSBmb3IgKHVubWl4ZWQpIHNoYXBlcyBsZXZlbCA4LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEphdmEgZG9jOlxyXG4gICAqID4gLS0gSW50cm9kdWNlIG51bWJlcnMgbGFyZ2VyIHRoYW4gMSBhdCB0aGlzIGxldmVsXHJcbiAgICogPiAtLSBPbiB0aGlzIGxldmVsIGxldHMgaGF2ZSBhdCBsZWFzdCAyIG51bWJlcnMgbGFyZ2VyIHRoYW4gMSBhcyB0YXJnZXRzXHJcbiAgICogPiAtLSBFbm91Z2ggcGllY2VzIGF2YWlsYWJsZSB0byBtYXRjaCB0YXJnZXRzIGluIFwib2J2aW91cyB3YXlzXCIuLi5zbyBpZiA1LzQgaXMgYSB0YXJnZXQgYSB3aG9sZSBwaWVjZSBpc1xyXG4gICAqID4gICAgYXZhaWxhYmxlIGFuZCBhIDEvNCBwaWVjZSBhdmFpbGFibGVcclxuICAgKiA+IC0tIFN0dWRlbnRzIGFyZSBmaXJzdCBpbnRyb2R1Y2VkIHRvIG51bWJlcnMgZ3JlYXRlciB0aGFuIDEgb25seSB3aXRoIDEvMidzIGFuZCAxLzQncy4gIFNvIGlmIHRoZSBudW1iZXIgaXNcclxuICAgKiA+ICAgIGdyZWF0ZXIgdGhhbiAxIG9uIGxldmVsIDgsIGl0IHNob3VsZCBiZSBzb21ldGhpbmcgbGlrZSAzLzIgb3IgNC8yIG9yIDcvNCwgc2luY2UgMS8yJ3MgYW5kIDEvNCdzIGFyZSBtb3JlXHJcbiAgICogPiAgICBmYW1pbGlhciB0byBzdHVkZW50cyAocmF0aGVyIHRoYW4gMS8zJ3MgYW5kIHN1Y2gpLlxyXG4gICAqXHJcbiAgICogRGVzaWduIGRvYzpcclxuICAgKiA+IC0tIEludHJvZHVjZSBudW1iZXJzIGxhcmdlciB0aGFuIDEgYXQgdGhpcyBsZXZlbFxyXG4gICAqID4gLS0gT24gdGhpcyBsZXZlbCAgYXQgbGVhc3QgMiBudW1iZXJzIGxhcmdlciB0aGFuIDEgYXMgdGFyZ2V0c1xyXG4gICAqID4gLS0gRW5vdWdoIHBpZWNlcyBhdmFpbGFibGUgdG8gbWF0Y2ggdGFyZ2V0cyBpbiBcIm9idmlvdXMgd2F5c1wiLi4uc28gaWYgNS80IGlzIGEgdGFyZ2V0IGEgd2hvbGUgcGllY2UgaXNcclxuICAgKiA+ICAgIGF2YWlsYWJsZSBhbmQgYSAxLzQgcGllY2UgYXZhaWxhYmxlIGZvciBudW1iZXJzIGxhcmdlciB0aGFuIDEsIHVzZXMgb25seSAxLzIncyBvciAxLzQncyBvbiB0aGlzIGxldmVsXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxOdW1iZXJcclxuICAgKiBAcGFyYW0ge0NvbG9yRGVmfSBjb2xvclxyXG4gICAqIEByZXR1cm5zIHtGcmFjdGlvbkNoYWxsZW5nZX1cclxuICAgKi9cclxuICBzdGF0aWMgbGV2ZWw4U2hhcGVzKCBsZXZlbE51bWJlciwgY29sb3IgKSB7XHJcbiAgICBjb25zdCB0YXJnZXRGcmFjdGlvbnMgPSBzaHVmZmxlKCBbXHJcbiAgICAgIC4uLmNob29zZSggMiwgWyBuZXcgRnJhY3Rpb24oIDMsIDIgKSwgbmV3IEZyYWN0aW9uKCA0LCAyICksIG5ldyBGcmFjdGlvbiggNSwgNCApLCBuZXcgRnJhY3Rpb24oIDcsIDQgKSBdICksXHJcbiAgICAgIC4uLmNob29zZSggMiwgWyBuZXcgRnJhY3Rpb24oIDIsIDMgKSwgbmV3IEZyYWN0aW9uKCAzLCA0ICksIG5ldyBGcmFjdGlvbiggMiwgNSApLCBuZXcgRnJhY3Rpb24oIDMsIDUgKSwgbmV3IEZyYWN0aW9uKCA0LCA1ICkgXSApXHJcbiAgICBdICk7XHJcblxyXG4gICAgY29uc3QgcGllY2VGcmFjdGlvbnMgPSBGcmFjdGlvbkxldmVsLnN0cmFpZ2h0Zm9yd2FyZEZyYWN0aW9ucyggdGFyZ2V0RnJhY3Rpb25zICk7XHJcblxyXG4gICAgcmV0dXJuIEZyYWN0aW9uQ2hhbGxlbmdlLmNyZWF0ZVNoYXBlQ2hhbGxlbmdlKCBsZXZlbE51bWJlciwgZmFsc2UsIGNvbG9yLCB0YXJnZXRGcmFjdGlvbnMsIHBpZWNlRnJhY3Rpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY2hhbGxlbmdlIGZvciAodW5taXhlZCkgc2hhcGVzIGxldmVsIDkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogSmF2YSBkb2M6XHJcbiAgICogPiAtLVNhbWUgYXMgbGV2ZWwgOCBidXQgbm93IHNvbWUgdGFyZ2V0cyBvbmx5IGFsbG93IFwibm9uLW9idmlvdXNcIiBtYXRjaGVzIHdpdGggcGllY2VzLiAgRm9yIGluc3RhbmNlLCBpZiB0aGVcclxuICAgKiA+ICAgdGFyZ2V0IGlzIGdyZWF0ZXIgdGhhbiBvbmUsIG5vIFwid2hvbGVzXCIgc2hvdWxkIGJlIGF2YWlsYWJsZS4gIFNvIGlmIDUvNCBpcyBhIHRhcmdldCBpdCB3b3VsZCBuZWVkIHRvIGJlXHJcbiAgICogPiAgIGJ1aWx0IGZyb20gc29tZXRoaW5nIGxpa2UgMiBoYWxmIHBpZWNlcyBhbmQgYSBxdWFydGVyIHBpZWNlXHJcbiAgICpcclxuICAgKiBEZXNpZ24gZG9jOlxyXG4gICAqID4gLS1TYW1lIGFzIGxldmVsIDggYnV0IG5vdyBzb21lIHRhcmdldHMgb25seSBhbGxvdyBcIm5vbi1vYnZpb3VzXCIgbWF0Y2hlcyB3aXRoIHBpZWNlcy4gIEZvciBpbnN0YW5jZSwgaWYgdGhlXHJcbiAgICogPiAgIHRhcmdldCBpcyBncmVhdGVyIHRoYW4gb25lLCBubyBcIndob2xlc1wiIHNob3VsZCBiZSBhdmFpbGFibGUuICBTbyBpZiA1LzQgaXMgYSB0YXJnZXQgaXQgd291bGQgbmVlZCB0byBiZVxyXG4gICAqID4gICBidWlsdCBmcm9tIHNvbWV0aGluZyBsaWtlIDIgaGFsZiBwaWVjZXMgYW5kIGEgcXVhcnRlciBwaWVjZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsTnVtYmVyXHJcbiAgICogQHBhcmFtIHtDb2xvckRlZn0gY29sb3JcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsOVNoYXBlcyggbGV2ZWxOdW1iZXIsIGNvbG9yICkge1xyXG4gICAgY29uc3QgdGFyZ2V0RnJhY3Rpb25zID0gc2h1ZmZsZSggW1xyXG4gICAgICAuLi5jaG9vc2UoIDIsIFsgbmV3IEZyYWN0aW9uKCAzLCAyICksIG5ldyBGcmFjdGlvbiggNCwgMiApLCBuZXcgRnJhY3Rpb24oIDUsIDQgKSwgbmV3IEZyYWN0aW9uKCA3LCA0ICkgXSApLFxyXG4gICAgICAuLi5jaG9vc2UoIDIsIFsgbmV3IEZyYWN0aW9uKCAyLCAzICksIG5ldyBGcmFjdGlvbiggMywgNCApLCBuZXcgRnJhY3Rpb24oIDIsIDUgKSwgbmV3IEZyYWN0aW9uKCAzLCA1ICksIG5ldyBGcmFjdGlvbiggNCwgNSApIF0gKVxyXG4gICAgXSApO1xyXG5cclxuICAgIGNvbnN0IHBpZWNlRnJhY3Rpb25zID0gW1xyXG4gICAgICAuLi5GcmFjdGlvbkxldmVsLnNpbXBsZVNwbGl0RnJhY3Rpb25zKCBGcmFjdGlvbkxldmVsLnN0cmFpZ2h0Zm9yd2FyZEZyYWN0aW9ucyggdGFyZ2V0RnJhY3Rpb25zLnNsaWNlKCAwLCAyICkgKSwge1xyXG4gICAgICAgIG1heERlbm9taW5hdG9yOiAxXHJcbiAgICAgIH0gKSxcclxuICAgICAgLi4uRnJhY3Rpb25MZXZlbC5kaWZmaWN1bHRTcGxpdCggdGFyZ2V0RnJhY3Rpb25zWyAyIF0gKSxcclxuICAgICAgLi4uRnJhY3Rpb25MZXZlbC5kaWZmaWN1bHRTcGxpdCggdGFyZ2V0RnJhY3Rpb25zWyAzIF0gKVxyXG4gICAgXTtcclxuXHJcbiAgICByZXR1cm4gRnJhY3Rpb25DaGFsbGVuZ2UuY3JlYXRlU2hhcGVDaGFsbGVuZ2UoIGxldmVsTnVtYmVyLCBmYWxzZSwgY29sb3IsIHNodWZmbGUoIHRhcmdldEZyYWN0aW9ucyApLCBwaWVjZUZyYWN0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNoYWxsZW5nZSBmb3IgKHVubWl4ZWQpIHNoYXBlcyBsZXZlbCAxMC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBKYXZhIGRvYzpcclxuICAgKiA+IC0tU2FtZSBhcyBsZXZlbCA3IGJ1dCBub3cgYWxsIHRhcmdldHMgYXJlIGdyZWF0ZXIgdGhhbiBvbmUuXHJcbiAgICogPiAtLVN0aWxsIHRvcCB0d28gdGFyZ2V0cyBzYW1lLCBhbmQgYm90dG9tIHR3byB0YXJnZXRzIHRoZSBzYW1lXHJcbiAgICogPiAtLU5vIHdob2xlIHBpZWNlcyBhdmFpbGFibGUsIGFuZCB0YXJnZXRzIG11c3QgYmUgYnVpbHQgaW4gaW50ZXJlc3Rpbmcgd2F5cy4gIEUuZy4sIHRoZSB0YXJnZXQgbXVzdCBiZSBidWlsdFxyXG4gICAqID4gICBmcm9tIDMgb3IgbW9yZSBwaWVjZXMgYXMgYSB3YXkgdG8gY29uc3RyYWluIHRoZSBwaWVjZXMgZ2l2ZW4uIFNvIGZvciBpbnN0YW5jZSBzb21ldGhpbmcgbGlrZSA0LzMgd291bGQgaGF2ZVxyXG4gICAqID4gICB0byBiZSBidWlsdCBieSBzb21ldGhpbmcgbGlrZSAxKGhhbGYpICsgMihxdWFydGVycykgKyAoMS8zKVxyXG4gICAqXHJcbiAgICogRGVzaWduIGRvYzpcclxuICAgKiA+IC0tU2FtZSBhcyBsZXZlbCA3IGJ1dCBub3cgYWxsIHRhcmdldHMgYXJlIGdyZWF0ZXIgdGhhbiBvbmUuXHJcbiAgICogPiAtLVN0aWxsIHRvcCB0d28gdGFyZ2V0cyBzYW1lLCBhbmQgYm90dG9tIHR3byB0YXJnZXRzIHRoZSBzYW1lXHJcbiAgICogPiAtLU5vIHdob2xlIHBpZWNlcyBhdmFpbGFibGUsIGFuZCB0YXJnZXRzIG11c3QgYmUgYnVpbHQgaW4gaW50ZXJlc3Rpbmcgd2F5cy4gIFdlIGNvdWxkIHNheSBzb21ldGhpbmcgbGlrZSB0aGVcclxuICAgKiA+ICAgdGFyZ2V0IG11c3QgYmUgYnVpbHQgZnJvbSAzIG9yIG1vcmUgcGllY2VzIGFzIGEgd2F5IHRvIGNvbnN0cmFpbiB0aGUgcGllY2VzIGdpdmVuLiBTbyBmb3IgaW5zdGFuY2Ugc29tZXRoaW5nXHJcbiAgICogPiAgIGxpa2UgNC8zIHdvdWxkIGhhdmUgdG8gYmUgYnVpbHQgYnkgc29tZXRoaW5nIGxpa2UgMShoYWxmKSArIDIocXVhcnRlcnMpICsgKDEvMylcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbE51bWJlclxyXG4gICAqIEBwYXJhbSB7Q29sb3JEZWZ9IGNvbG9yXHJcbiAgICogQHJldHVybnMge0ZyYWN0aW9uQ2hhbGxlbmdlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBsZXZlbDEwU2hhcGVzKCBsZXZlbE51bWJlciwgY29sb3IgKSB7XHJcbiAgICBjb25zdCBmcmFjdGlvbnMgPSBjaG9vc2UoIDIsIFtcclxuICAgICAgbmV3IEZyYWN0aW9uKCAzLCAyICksXHJcbiAgICAgIG5ldyBGcmFjdGlvbiggNCwgMyApLCBuZXcgRnJhY3Rpb24oIDUsIDMgKSxcclxuICAgICAgbmV3IEZyYWN0aW9uKCA1LCA0ICksIG5ldyBGcmFjdGlvbiggNywgNCApLFxyXG4gICAgICBuZXcgRnJhY3Rpb24oIDYsIDUgKSwgbmV3IEZyYWN0aW9uKCA3LCA1ICksIG5ldyBGcmFjdGlvbiggOCwgNSApLCBuZXcgRnJhY3Rpb24oIDksIDUgKSxcclxuICAgICAgbmV3IEZyYWN0aW9uKCA3LCA2IClcclxuICAgIF0gKTtcclxuICAgIGNvbnN0IHRhcmdldEZyYWN0aW9ucyA9IFsgZnJhY3Rpb25zWyAwIF0sIGZyYWN0aW9uc1sgMCBdLCBmcmFjdGlvbnNbIDEgXSwgZnJhY3Rpb25zWyAxIF0gXTtcclxuXHJcbiAgICBjb25zdCBwaWVjZUZyYWN0aW9ucyA9IF8uZmxhdHRlbiggdGFyZ2V0RnJhY3Rpb25zLm1hcCggZiA9PiBGcmFjdGlvbkxldmVsLmRpZmZpY3VsdFNwbGl0KCBmICkgKSApO1xyXG5cclxuICAgIHJldHVybiBGcmFjdGlvbkNoYWxsZW5nZS5jcmVhdGVTaGFwZUNoYWxsZW5nZSggbGV2ZWxOdW1iZXIsIGZhbHNlLCBjb2xvciwgdGFyZ2V0RnJhY3Rpb25zLCBwaWVjZUZyYWN0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNoYWxsZW5nZSBmb3IgKG1peGVkKSBzaGFwZXMgbGV2ZWwgMS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBEZXNpZ24gZG9jOlxyXG4gICAqIC0tIHsxOjEvMiwgMjoxLzIsIDI6MS80fSBhcyB0aGUgdGFyZ2V0c1xyXG4gICAqIC0tIFdob2xlcywgMS8yJ3MsIGFuZCAxLzQncyB0byBjb21wbGV0ZSB0YXJnZXRzXHJcbiAgICogLS0gYXMgYmVmb3JlIHJlZnJlc2hpbmcgd2lsbCByYW5kb21seSByZW9yZGVyIHRhcmdldHMsIGFuZCBjaG9vc2UgYmV0d2VlbiBjaXJjbGVzL3JlY3RhbmdsZXNcclxuICAgKiAtLSBhIGZldyBleHRyYSBwaWVjZXMgdG8gYWxsb3cgbXVsdGlwbGUgcGF0aHdheXMgdG8gYSBzb2x1dGlvbiAoZm9yIGluc3RhbmNlLCAyIGhhbHZlcyB0aGF0IGNvdWxkIGZvcm0gYSB3aG9sZSlcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbE51bWJlclxyXG4gICAqIEBwYXJhbSB7Q29sb3JEZWZ9IGNvbG9yXHJcbiAgICogQHJldHVybnMge0ZyYWN0aW9uQ2hhbGxlbmdlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBsZXZlbDFTaGFwZXNNaXhlZCggbGV2ZWxOdW1iZXIsIGNvbG9yICkge1xyXG4gICAgY29uc3QgdGFyZ2V0RnJhY3Rpb25zID0gc2h1ZmZsZSggW1xyXG4gICAgICBuZXcgRnJhY3Rpb24oIDMsIDIgKSxcclxuICAgICAgbmV3IEZyYWN0aW9uKCA1LCAyICksXHJcbiAgICAgIG5ldyBGcmFjdGlvbiggOSwgNCApXHJcbiAgICBdICk7XHJcbiAgICBjb25zdCBwaWVjZUZyYWN0aW9ucyA9IFtcclxuICAgICAgLi4uRnJhY3Rpb25MZXZlbC5zdHJhaWdodGZvcndhcmRGcmFjdGlvbnMoIHRhcmdldEZyYWN0aW9ucyApLFxyXG4gICAgICBuZXcgRnJhY3Rpb24oIDEsIDEgKSxcclxuICAgICAgbmV3IEZyYWN0aW9uKCAxLCAyICksXHJcbiAgICAgIG5ldyBGcmFjdGlvbiggMSwgMiApLFxyXG4gICAgICBuZXcgRnJhY3Rpb24oIDEsIDQgKVxyXG4gICAgXTtcclxuICAgIHJldHVybiBGcmFjdGlvbkNoYWxsZW5nZS5jcmVhdGVTaGFwZUNoYWxsZW5nZSggbGV2ZWxOdW1iZXIsIHRydWUsIGNvbG9yLCB0YXJnZXRGcmFjdGlvbnMsIHBpZWNlRnJhY3Rpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY2hhbGxlbmdlIGZvciAobWl4ZWQpIHNoYXBlcyBsZXZlbCAyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIERlc2lnbiBkb2M6XHJcbiAgICogLS0gVGFyZ2V0cyB3aXRoIDEgb3IgMiBhcyB3aG9sZSBudW1iZXIsIGZyYWN0aW9uYWwgcG9ydGlvbiBmcm9tIHRoZSBzZXQgezEvMiwgMS8zLCAyLzMsIMK8LCDCvn1cclxuICAgKiAtLSBXaG9sZXMsIDEvMidzLCAxLzMncywgYW5kIDEvNCdzXHJcbiAgICogLS0gYSBmZXcgZXh0cmEgcGllY2VzIHRvIGFsbG93IG11bHRpcGxlIHBhdGh3YXlzIHRvIGEgc29sdXRpb25cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbE51bWJlclxyXG4gICAqIEBwYXJhbSB7Q29sb3JEZWZ9IGNvbG9yXHJcbiAgICogQHJldHVybnMge0ZyYWN0aW9uQ2hhbGxlbmdlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBsZXZlbDJTaGFwZXNNaXhlZCggbGV2ZWxOdW1iZXIsIGNvbG9yICkge1xyXG4gICAgY29uc3QgdGFyZ2V0RnJhY3Rpb25zID0gY2hvb3NlKCAzLCBfLmZsYXR0ZW4oIGluY2x1c2l2ZSggMSwgMiApLm1hcCggd2hvbGUgPT4ge1xyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMiApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMyApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMiwgMyApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgNCApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMywgNCApXHJcbiAgICAgIF0ubWFwKCBmID0+IGYucGx1c0ludGVnZXIoIHdob2xlICkgKTtcclxuICAgIH0gKSApICk7XHJcbiAgICBjb25zdCBwaWVjZUZyYWN0aW9ucyA9IFtcclxuICAgICAgLi4uRnJhY3Rpb25MZXZlbC5zdHJhaWdodGZvcndhcmRGcmFjdGlvbnMoIHRhcmdldEZyYWN0aW9ucyApLFxyXG4gICAgICAuLi5fLmZsYXR0ZW4oIGNob29zZSggMiwgW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMSApXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDIgKSxcclxuICAgICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMiApXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDMgKSxcclxuICAgICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMyApLFxyXG4gICAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCAzIClcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIG5ldyBGcmFjdGlvbiggMSwgNCApLFxyXG4gICAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCA0IClcclxuICAgICAgICBdXHJcbiAgICAgIF0gKSApXHJcbiAgICBdO1xyXG4gICAgcmV0dXJuIEZyYWN0aW9uQ2hhbGxlbmdlLmNyZWF0ZVNoYXBlQ2hhbGxlbmdlKCBsZXZlbE51bWJlciwgdHJ1ZSwgY29sb3IsIHRhcmdldEZyYWN0aW9ucywgcGllY2VGcmFjdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBjaGFsbGVuZ2UgZm9yIChtaXhlZCkgc2hhcGVzIGxldmVsIDMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogRGVzaWduIGRvYzpcclxuICAgKiAtLSBBbGwgdGFyZ2V0cyAxLCAyLCBvciAzLCBhcyB3aG9sZSBudW1iZXIsIGZyYWN0aW9uYWwgcG9ydGlvbiBmcm9tIHRoZSBzZXQgezEvMiwgMS8zLCAyLzMsIDEvNCwgMy80LCAxLzYsIDUvNn1cclxuICAgKiAtLSBhIGZldyBleHRyYSBwaWVjZXMgdG8gYWxsb3cgbXVsdGlwbGUgcGF0aHdheXMgdG8gYSBzb2x1dGlvblxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsTnVtYmVyXHJcbiAgICogQHBhcmFtIHtDb2xvckRlZn0gY29sb3JcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsM1NoYXBlc01peGVkKCBsZXZlbE51bWJlciwgY29sb3IgKSB7XHJcbiAgICBjb25zdCB0YXJnZXRGcmFjdGlvbnMgPSBjaG9vc2UoIDMsIF8uZmxhdHRlbiggaW5jbHVzaXZlKCAxLCAzICkubWFwKCB3aG9sZSA9PiB7XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCAyICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCAzICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAyLCAzICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCA0ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAzLCA0ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCA2ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA1LCA2IClcclxuICAgICAgXS5tYXAoIGYgPT4gZi5wbHVzSW50ZWdlciggd2hvbGUgKSApO1xyXG4gICAgfSApICkgKTtcclxuICAgIGNvbnN0IHBpZWNlRnJhY3Rpb25zID0gW1xyXG4gICAgICAuLi5GcmFjdGlvbkxldmVsLnN0cmFpZ2h0Zm9yd2FyZEZyYWN0aW9ucyggdGFyZ2V0RnJhY3Rpb25zICksXHJcbiAgICAgIC4uLkZyYWN0aW9uTGV2ZWwuaW50ZXJlc3RpbmdGcmFjdGlvbnMoIHNhbXBsZSggdGFyZ2V0RnJhY3Rpb25zICkgKVxyXG4gICAgXTtcclxuICAgIHJldHVybiBGcmFjdGlvbkNoYWxsZW5nZS5jcmVhdGVTaGFwZUNoYWxsZW5nZSggbGV2ZWxOdW1iZXIsIHRydWUsIGNvbG9yLCB0YXJnZXRGcmFjdGlvbnMsIHBpZWNlRnJhY3Rpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY2hhbGxlbmdlIGZvciAobWl4ZWQpIHNoYXBlcyBsZXZlbCA0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIERlc2lnbiBkb2M6XHJcbiAgICogLS0gQWxsIHRhcmdldHMgdGhlIHNhbWVcclxuICAgKiAtLSAxLCAyLCBvciAzLCBhcyB3aG9sZSBudW1iZXIsIGZyYWN0aW9uYWwgcG9ydGlvbiBmcm9tIHRoZSBzZXQgezEvMiwgMS8zLCAyLzMsIMK8LCDCvn1cclxuICAgKiAtLSBQaWVjZXMgY29uc3RyYWluZWQgc28gb25seSBlbm91Z2ggcGllY2VzIHRvIGNvbXBsZXRlIHRhcmdldHMuXHJcbiAgICogLS0gRm9yY2Ugc29tZSB3aG9sZXMgdG8gYmUgYnVpbHQgZnJvbSBmcmFjdGlvbmFsIHBvcnRpb25zLiAgU28gaWYgYWxsIHRhcmdldHMgd2VyZSB7MToxLzJ9LCBvbmx5IDEgb3IgMiB3aG9sZVxyXG4gICAqICAgIHBpZWNlcyB3b3VsZCBiZSBhdmFpbGFibGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbE51bWJlclxyXG4gICAqIEBwYXJhbSB7Q29sb3JEZWZ9IGNvbG9yXHJcbiAgICogQHJldHVybnMge0ZyYWN0aW9uQ2hhbGxlbmdlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBsZXZlbDRTaGFwZXNNaXhlZCggbGV2ZWxOdW1iZXIsIGNvbG9yICkge1xyXG4gICAgY29uc3QgZnJhY3Rpb24gPSBzYW1wbGUoIF8uZmxhdHRlbiggaW5jbHVzaXZlKCAxLCAzICkubWFwKCB3aG9sZSA9PiB7XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCAyICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCAzICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAyLCAzICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCA0ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAzLCA0IClcclxuICAgICAgXS5tYXAoIGYgPT4gZi5wbHVzSW50ZWdlciggd2hvbGUgKSApO1xyXG4gICAgfSApICkgKTtcclxuXHJcbiAgICBjb25zdCB0YXJnZXRGcmFjdGlvbnMgPSBbXHJcbiAgICAgIGZyYWN0aW9uLmNvcHkoKSxcclxuICAgICAgZnJhY3Rpb24uY29weSgpLFxyXG4gICAgICBmcmFjdGlvbi5jb3B5KClcclxuICAgIF07XHJcblxyXG4gICAgY29uc3QgcGllY2VGcmFjdGlvbnMgPSBGcmFjdGlvbkxldmVsLnNpbXBsZVNwbGl0RnJhY3Rpb25zKCBGcmFjdGlvbkxldmVsLnN0cmFpZ2h0Zm9yd2FyZEZyYWN0aW9ucyggdGFyZ2V0RnJhY3Rpb25zICksIHtcclxuICAgICAgbWF4RGVub21pbmF0b3I6IDEsXHJcbiAgICAgIHF1YW50aXR5OiBNYXRoLmZsb29yKCBmcmFjdGlvbi52YWx1ZSApICogMyAtIDJcclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gRnJhY3Rpb25DaGFsbGVuZ2UuY3JlYXRlU2hhcGVDaGFsbGVuZ2UoIGxldmVsTnVtYmVyLCB0cnVlLCBjb2xvciwgdGFyZ2V0RnJhY3Rpb25zLCBwaWVjZUZyYWN0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNoYWxsZW5nZSBmb3IgKG1peGVkKSBzaGFwZXMgbGV2ZWwgNS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBEZXNpZ24gZG9jOlxyXG4gICAqIC0tIFRhcmdldHMgd2l0aCAxLCAyLCBvciAzLCBhcyB3aG9sZSBudW1iZXIsIGZyYWN0aW9uYWwgcG9ydGlvbiBmcm9tIHRoZSBzZXQgezEvMiwgMS8zLCAyLzMsIMK8LCDCviwgMS81LCAyLzUsIDMvNSxcclxuICAgKiAgICA0LzUsIDEvNiwgNS82LCAxLzcsIDIvNywgMy83LCA0LzcsIDUvNywgNi83LCAxLzgsIDMvOCwgNS84LCA3Lzh9XHJcbiAgICogLS0gQSBmZXcgbW9yZSBjYXJkcyB0aGFuIG5lZWRlZCwgYnV0IGF0IGxlYXN0IG9uZSB0YXJnZXQgbXVzdCBiZSBjb25zdHJ1Y3RlZCB3aXRoIFwibm9udHJpdmlhbFwiIHBpZWNlcy4gIEZvclxyXG4gICAqICAgIGluc3RhbmNlIHsxOjEvM30gb25seSBoYXZlIHR3byAxLzYgcGllY2VzIGF2YWlsYWJsZSBmb3IgYnVpbGRpbmdcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbE51bWJlclxyXG4gICAqIEBwYXJhbSB7Q29sb3JEZWZ9IGNvbG9yXHJcbiAgICogQHJldHVybnMge0ZyYWN0aW9uQ2hhbGxlbmdlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBsZXZlbDVTaGFwZXNNaXhlZCggbGV2ZWxOdW1iZXIsIGNvbG9yICkge1xyXG4gICAgY29uc3QgdGFyZ2V0RnJhY3Rpb25zID0gY2hvb3NlU3BsaXR0YWJsZSggMywgXy5mbGF0dGVuKCBpbmNsdXNpdmUoIDEsIDMgKS5tYXAoIHdob2xlID0+IHtcclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDIgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDMgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDIsIDMgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDQgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDMsIDQgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDUgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDIsIDUgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDMsIDUgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDQsIDUgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDYgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDUsIDYgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDcgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDIsIDcgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDMsIDcgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDQsIDcgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDUsIDcgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDYsIDcgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDggKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDMsIDggKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDUsIDggKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDcsIDggKVxyXG4gICAgICBdLm1hcCggZiA9PiBmLnBsdXNJbnRlZ2VyKCB3aG9sZSApICk7XHJcbiAgICB9ICkgKSApO1xyXG5cclxuICAgIGNvbnN0IHBpZWNlRnJhY3Rpb25zID0gW1xyXG4gICAgICAuLi5GcmFjdGlvbkxldmVsLnNpbXBsZVNwbGl0RnJhY3Rpb25zKCBGcmFjdGlvbkxldmVsLnN0cmFpZ2h0Zm9yd2FyZEZyYWN0aW9ucyggdGFyZ2V0RnJhY3Rpb25zICksIHtcclxuICAgICAgICBxdWFudGl0eTogNVxyXG4gICAgICB9ICksXHJcbiAgICAgIC4uLkZyYWN0aW9uTGV2ZWwuaW50ZXJlc3RpbmdGcmFjdGlvbnMoIHNhbXBsZSggc3BsaXR0YWJsZSggdGFyZ2V0RnJhY3Rpb25zICkgKSwgMyApXHJcbiAgICBdO1xyXG5cclxuICAgIHJldHVybiBGcmFjdGlvbkNoYWxsZW5nZS5jcmVhdGVTaGFwZUNoYWxsZW5nZSggbGV2ZWxOdW1iZXIsIHRydWUsIGNvbG9yLCB0YXJnZXRGcmFjdGlvbnMsIHBpZWNlRnJhY3Rpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY2hhbGxlbmdlIGZvciAobWl4ZWQpIHNoYXBlcyBsZXZlbCA2LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIERlc2lnbiBkb2M6XHJcbiAgICogLS0gVGFyZ2V0cyB3aXRoIDEsIDIsIG9yIDMsIGFzIHdob2xlIG51bWJlciwgZnJhY3Rpb25hbCBwb3J0aW9uIGZyb20gdGhlIHNldCB7MS8yLCAxLzMsIDIvMywgMS82LCA1LzZ9IG9yIHsxLzIsXHJcbiAgICogICAgwrwsIMK+LCAxLzgsIDMvOCwgNS84LCA3Lzh9XHJcbiAgICogLS0gUGllY2VzIHdpbGwgYmUgd2hvbGVzLCBhbmQgZWl0aGVyIHsxLzIncyBhbmQgMS82J3N9IG9yIHsxLzIncyBhbmQgMS84J3N9XHJcbiAgICogLS0gT25seSBlbm91Z2ggcGllY2VzIHRvIGZ1bGZpbGwgdGFyZ2V0cy4gIFBpZWNlcyBjaG9zZW4gdG8gbWluaW1pemUgc21hbGwgcGllY2VzLCBzbyBmb3IgaW5zdGFuY2UgaWYgNS84IGlzIGFcclxuICAgKiAgICBmcmFjdGlvbmFsIHBvcnRpb24gaXQgd2lsbCBiZSBidWlsdCB3aXRoIGEgMS8yIGFuZCBhIDEvOCBwaWVjZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbE51bWJlclxyXG4gICAqIEBwYXJhbSB7Q29sb3JEZWZ9IGNvbG9yXHJcbiAgICogQHJldHVybnMge0ZyYWN0aW9uQ2hhbGxlbmdlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBsZXZlbDZTaGFwZXNNaXhlZCggbGV2ZWxOdW1iZXIsIGNvbG9yICkge1xyXG4gICAgY29uc3QgZnJhY3Rpb25Qb3J0aW9uID0gc2FtcGxlKCBbXHJcbiAgICAgIFtcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDIgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDMgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDIsIDMgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDEsIDYgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDUsIDYgKVxyXG4gICAgICBdLCBbXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCAyICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCA0ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAzLCA0ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCA4ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAzLCA4ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA1LCA4ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA3LCA4IClcclxuICAgICAgXVxyXG4gICAgXSApO1xyXG5cclxuICAgIGNvbnN0IHRhcmdldEZyYWN0aW9ucyA9IGNob29zZSggNCwgXy5mbGF0dGVuKCBpbmNsdXNpdmUoIDEsIDMgKS5tYXAoIHdob2xlID0+IHtcclxuICAgICAgcmV0dXJuIGZyYWN0aW9uUG9ydGlvbi5tYXAoIGYgPT4gZi5wbHVzSW50ZWdlciggd2hvbGUgKSApO1xyXG4gICAgfSApICkgKTtcclxuICAgIGNvbnN0IHBpZWNlRnJhY3Rpb25zID0gRnJhY3Rpb25MZXZlbC5taW5pbWl6ZWRGcmFjdGlvbnMoIHRhcmdldEZyYWN0aW9ucyApO1xyXG5cclxuICAgIHJldHVybiBGcmFjdGlvbkNoYWxsZW5nZS5jcmVhdGVTaGFwZUNoYWxsZW5nZSggbGV2ZWxOdW1iZXIsIHRydWUsIGNvbG9yLCB0YXJnZXRGcmFjdGlvbnMsIHBpZWNlRnJhY3Rpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY2hhbGxlbmdlIGZvciAobWl4ZWQpIHNoYXBlcyBsZXZlbCA3LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIERlc2lnbiBkb2M6XHJcbiAgICogLS1Ub3AgdHdvIHRhcmdldHMgYXJlIHRoZSBzYW1lLCBib3R0b20gdHdvIHRhcmdldHMgYXJlIHRoZSBzYW1lXHJcbiAgICogLS0gVGFyZ2V0cyB3aXRoIDEsIDIsIG9yIDMsIGFzIHdob2xlIG51bWJlciwgZnJhY3Rpb25hbCBwb3J0aW9uIGZyb20gdGhlIHNldCB7MS8yLCAxLzMsIDIvMywgwrwsIMK+LCAxLzYsIDUvNiwgMS84LFxyXG4gICAqICAgIDMvOCwgNS84LCA3Lzh9XHJcbiAgICogLS0gT25seSBlbm91Z2ggcGllY2VzIHRvIGZ1bGZpbGwgdGFyZ2V0cy4gT25lIG9mIGVhY2ggb2YgdGhlIHRvcCBhbmQgYm90dG9tIHRhcmdldHMgcmVxdWlyZSBcIm5vbnRyaXZpYWxcIiBwaWVjZXNcclxuICAgKiAgICB0byBidWlsZCB0aGUgc29sdXRpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxOdW1iZXJcclxuICAgKiBAcGFyYW0ge0NvbG9yRGVmfSBjb2xvclxyXG4gICAqIEByZXR1cm5zIHtGcmFjdGlvbkNoYWxsZW5nZX1cclxuICAgKi9cclxuICBzdGF0aWMgbGV2ZWw3U2hhcGVzTWl4ZWQoIGxldmVsTnVtYmVyLCBjb2xvciApIHtcclxuICAgIGNvbnN0IGJhc2VGcmFjdGlvbnMgPSBjaG9vc2UoIDIsIF8uZmxhdHRlbiggaW5jbHVzaXZlKCAxLCAzICkubWFwKCB3aG9sZSA9PiB7XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCAyICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCAzICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAyLCAzICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCA0ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAzLCA0ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCA2ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA1LCA2ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCA4ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAzLCA4ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA1LCA4ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA3LCA4IClcclxuICAgICAgXS5tYXAoIGYgPT4gZi5wbHVzSW50ZWdlciggd2hvbGUgKSApO1xyXG4gICAgfSApICkgKTtcclxuXHJcbiAgICBjb25zdCB0b3BGcmFjdGlvbiA9IGJhc2VGcmFjdGlvbnNbIDAgXTtcclxuICAgIGNvbnN0IGJvdHRvbUZyYWN0aW9uID0gYmFzZUZyYWN0aW9uc1sgMSBdO1xyXG5cclxuICAgIGNvbnN0IHRvcEZyYWN0aW9ucyA9IHJlcGVhdCggMiwgdG9wRnJhY3Rpb24gKTtcclxuICAgIGNvbnN0IGJvdHRvbUZyYWN0aW9ucyA9IHJlcGVhdCggMiwgYm90dG9tRnJhY3Rpb24gKTtcclxuICAgIGNvbnN0IHRhcmdldEZyYWN0aW9ucyA9IFtcclxuICAgICAgLi4udG9wRnJhY3Rpb25zLFxyXG4gICAgICAuLi5ib3R0b21GcmFjdGlvbnNcclxuICAgIF07XHJcblxyXG4gICAgY29uc3QgcGllY2VGcmFjdGlvbnMgPSBbXHJcbiAgICAgIC4uLkZyYWN0aW9uTGV2ZWwuZGlmZmljdWx0U3BsaXQoIHRvcEZyYWN0aW9uICksXHJcbiAgICAgIC4uLkZyYWN0aW9uTGV2ZWwuZGlmZmljdWx0U3BsaXQoIGJvdHRvbUZyYWN0aW9uICksXHJcbiAgICAgIC4uLkZyYWN0aW9uTGV2ZWwuc3RyYWlnaHRmb3J3YXJkRnJhY3Rpb25zKCBbIHRvcEZyYWN0aW9uLCBib3R0b21GcmFjdGlvbiBdIClcclxuICAgIF07XHJcblxyXG4gICAgcmV0dXJuIEZyYWN0aW9uQ2hhbGxlbmdlLmNyZWF0ZVNoYXBlQ2hhbGxlbmdlKCBsZXZlbE51bWJlciwgdHJ1ZSwgY29sb3IsIHRhcmdldEZyYWN0aW9ucywgcGllY2VGcmFjdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBjaGFsbGVuZ2UgZm9yIChtaXhlZCkgc2hhcGVzIGxldmVsIDguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogRGVzaWduIGRvYzpcclxuICAgKiAtLSBUYXJnZXRzIHdpdGggMSwgMiwgb3IgMywgYXMgd2hvbGUgbnVtYmVyLCBmcmFjdGlvbmFsIHBvcnRpb24gZnJvbSB0aGUgc2V0IHsxLzIsIDEvMywgMi8zLCDCvCwgwr4sIDEvNSwgMi81LCAzLzUsXHJcbiAgICogICAgNC81LCAxLzYsIDUvNn1cclxuICAgKiAtLSBPbmx5IGVub3VnaCBwaWVjZXMgdG8gZnVsZmlsbCB0YXJnZXRzXHJcbiAgICogLS0gQXQgbGVhc3QgMiB0YXJnZXRzIHJlcXVpcmUgXCJub250cml2aWFsXCIgcGllY2VzXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxOdW1iZXJcclxuICAgKiBAcGFyYW0ge0NvbG9yRGVmfSBjb2xvclxyXG4gICAqIEByZXR1cm5zIHtGcmFjdGlvbkNoYWxsZW5nZX1cclxuICAgKi9cclxuICBzdGF0aWMgbGV2ZWw4U2hhcGVzTWl4ZWQoIGxldmVsTnVtYmVyLCBjb2xvciApIHtcclxuICAgIGNvbnN0IHRhcmdldEZyYWN0aW9ucyA9IGNob29zZVNwbGl0dGFibGUoIDQsIF8uZmxhdHRlbiggaW5jbHVzaXZlKCAxLCAzICkubWFwKCB3aG9sZSA9PiB7XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCAyICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCAzICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAyLCAzICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCA0ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAzLCA0ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCA1ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAyLCA1ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAzLCA1ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA0LCA1ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCA2ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA1LCA2IClcclxuICAgICAgXS5tYXAoIGYgPT4gZi5wbHVzSW50ZWdlciggd2hvbGUgKSApO1xyXG4gICAgfSApICksIDIgKTtcclxuXHJcbiAgICBjb25zdCBwaWVjZUZyYWN0aW9ucyA9IFtcclxuICAgICAgLi4uXy5mbGF0dGVuKCB0YXJnZXRGcmFjdGlvbnMuc2xpY2UoIDAsIDIgKS5tYXAoIGYgPT4gRnJhY3Rpb25MZXZlbC5kaWZmaWN1bHRTcGxpdCggZiApICkgKSxcclxuICAgICAgLi4uRnJhY3Rpb25MZXZlbC5zdHJhaWdodGZvcndhcmRGcmFjdGlvbnMoIHRhcmdldEZyYWN0aW9ucy5zbGljZSggMiApIClcclxuICAgIF07XHJcblxyXG4gICAgcmV0dXJuIEZyYWN0aW9uQ2hhbGxlbmdlLmNyZWF0ZVNoYXBlQ2hhbGxlbmdlKCBsZXZlbE51bWJlciwgdHJ1ZSwgY29sb3IsIHRhcmdldEZyYWN0aW9ucywgcGllY2VGcmFjdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBjaGFsbGVuZ2UgZm9yIChtaXhlZCkgc2hhcGVzIGxldmVsIDkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogRGVzaWduIGRvYzpcclxuICAgKiAtLSBTYW1lIGFzIGxldmVsIDgsIGJ1dCBub3cgYWxsIDQgdGFyZ2V0cyBtdXN0IGJlIGJ1aWx0IHdpdGggc29tZSBcIm5vbnRyaXZpYWwgcGllY2VzXCJcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbE51bWJlclxyXG4gICAqIEBwYXJhbSB7Q29sb3JEZWZ9IGNvbG9yXHJcbiAgICogQHJldHVybnMge0ZyYWN0aW9uQ2hhbGxlbmdlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBsZXZlbDlTaGFwZXNNaXhlZCggbGV2ZWxOdW1iZXIsIGNvbG9yICkge1xyXG4gICAgY29uc3QgdGFyZ2V0RnJhY3Rpb25zID0gY2hvb3NlKCA0LCBfLmZsYXR0ZW4oIGluY2x1c2l2ZSggMSwgMyApLm1hcCggd2hvbGUgPT4ge1xyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMiApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMyApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMiwgMyApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgNCApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMywgNCApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgNSApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMiwgNSApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMywgNSApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggNCwgNSApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgNiApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggNSwgNiApXHJcbiAgICAgIF0ubWFwKCBmID0+IGYucGx1c0ludGVnZXIoIHdob2xlICkgKTtcclxuICAgIH0gKSApICk7XHJcblxyXG4gICAgY29uc3QgcGllY2VGcmFjdGlvbnMgPSBfLmZsYXR0ZW4oIHRhcmdldEZyYWN0aW9ucy5tYXAoIGYgPT4gRnJhY3Rpb25MZXZlbC5kaWZmaWN1bHRTcGxpdCggZiApICkgKTtcclxuXHJcbiAgICByZXR1cm4gRnJhY3Rpb25DaGFsbGVuZ2UuY3JlYXRlU2hhcGVDaGFsbGVuZ2UoIGxldmVsTnVtYmVyLCB0cnVlLCBjb2xvciwgdGFyZ2V0RnJhY3Rpb25zLCBwaWVjZUZyYWN0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNoYWxsZW5nZSBmb3IgKG1peGVkKSBzaGFwZXMgbGV2ZWwgMTAuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogRGVzaWduIGRvYzpcclxuICAgKiAtLSBTYW1lIGFzIGxldmVsIDksIGJ1dCBmcmFjdGlvbmFsIHBvcnRpb24gZnJvbSB0aGUgc2V0IHsxLzIsIDEvMywgMi8zLCDCvCwgwr4sIDEvNiwgNS82LCAxLzgsIDMvOCwgNS84LCA3Lzh9XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxOdW1iZXJcclxuICAgKiBAcGFyYW0ge0NvbG9yRGVmfSBjb2xvclxyXG4gICAqIEByZXR1cm5zIHtGcmFjdGlvbkNoYWxsZW5nZX1cclxuICAgKi9cclxuICBzdGF0aWMgbGV2ZWwxMFNoYXBlc01peGVkKCBsZXZlbE51bWJlciwgY29sb3IgKSB7XHJcbiAgICBjb25zdCB0YXJnZXRGcmFjdGlvbnMgPSBjaG9vc2UoIDQsIF8uZmxhdHRlbiggaW5jbHVzaXZlKCAxLCAzICkubWFwKCB3aG9sZSA9PiB7XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCAyICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCAzICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAyLCAzICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCA0ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAzLCA0ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCA2ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA1LCA2ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCA4ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAzLCA4ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA1LCA4ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA3LCA4IClcclxuICAgICAgXS5tYXAoIGYgPT4gZi5wbHVzSW50ZWdlciggd2hvbGUgKSApO1xyXG4gICAgfSApICkgKTtcclxuXHJcbiAgICBjb25zdCBwaWVjZUZyYWN0aW9ucyA9IF8uZmxhdHRlbiggdGFyZ2V0RnJhY3Rpb25zLm1hcCggZiA9PiBGcmFjdGlvbkxldmVsLmRpZmZpY3VsdFNwbGl0KCBmICkgKSApO1xyXG5cclxuICAgIHJldHVybiBGcmFjdGlvbkNoYWxsZW5nZS5jcmVhdGVTaGFwZUNoYWxsZW5nZSggbGV2ZWxOdW1iZXIsIHRydWUsIGNvbG9yLCB0YXJnZXRGcmFjdGlvbnMsIHBpZWNlRnJhY3Rpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY2hhbGxlbmdlIGZvciAodW5taXhlZCkgbnVtYmVycyBsZXZlbCAxLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIERlc2lnbiBkb2M6XHJcbiAgICogPiAtLSBmcmFjdGlvbnMgYXJlIHsxLzIsIOKFkywg4oWUfVxyXG4gICAqID4gLS0gaWYgcmVmcmVzaCBidXR0b24gaXMgcHJlc3NlZCwgY29sb3JzIGFuZCBudW1iZXJzIGFyZSBzaHVmZmxlZFxyXG4gICAqID4gLS0gYWx3YXlzIGNpcmNsZXNcclxuICAgKiA+IC0tIGp1c3QgZW5vdWdoIGNhcmRzIHRvIGNvbXBsZXRlIHRhcmdldHNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbE51bWJlclxyXG4gICAqIEByZXR1cm5zIHtGcmFjdGlvbkNoYWxsZW5nZX1cclxuICAgKi9cclxuICBzdGF0aWMgbGV2ZWwxTnVtYmVycyggbGV2ZWxOdW1iZXIgKSB7XHJcbiAgICBjb25zdCB0YXJnZXRGcmFjdGlvbnMgPSBzaHVmZmxlKCBbXHJcbiAgICAgIG5ldyBGcmFjdGlvbiggMSwgMiApLFxyXG4gICAgICBuZXcgRnJhY3Rpb24oIDEsIDMgKSxcclxuICAgICAgbmV3IEZyYWN0aW9uKCAyLCAzIClcclxuICAgIF0gKTtcclxuICAgIGNvbnN0IHBpZWNlTnVtYmVycyA9IEZyYWN0aW9uTGV2ZWwuZXhhY3ROdW1iZXJzKCB0YXJnZXRGcmFjdGlvbnMgKTtcclxuICAgIGNvbnN0IHNoYXBlVGFyZ2V0cyA9IEZyYWN0aW9uTGV2ZWwudGFyZ2V0c0Zyb21GcmFjdGlvbnMoIFNoYXBlUGFydGl0aW9uLlBJRVMsIHRhcmdldEZyYWN0aW9ucywgQ09MT1JTXzMsIEZpbGxUeXBlLlNFUVVFTlRJQUwgKTtcclxuXHJcbiAgICByZXR1cm4gRnJhY3Rpb25DaGFsbGVuZ2UuY3JlYXRlTnVtYmVyQ2hhbGxlbmdlKCBsZXZlbE51bWJlciwgZmFsc2UsIHNoYXBlVGFyZ2V0cywgcGllY2VOdW1iZXJzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY2hhbGxlbmdlIGZvciAodW5taXhlZCkgbnVtYmVycyBsZXZlbCAyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIERlc2lnbiBkb2M6XHJcbiAgICogPiAtLURpc3RyaWJ1dGlvbiBvZiBmcmFjdGlvbnMgcmFuZ2luZyBmcm9tIDEvMiB0byA0LzUuICBBcyBpbiB0aGUgbnVtZXJhdG9yIGNvdWxkIGJlIDEsIDIsIDMsIG9yIDQgYW5kIHRoZVxyXG4gICAqID4gICBkZW5vbWluYXRvciBjb3VsZCBiZSAyLCAzLCA0LCBvciA1IHdpdGggdGhlIHN0aXB1bGF0aW9uIHRoYXQgdGhlIGZyYWN0aW9uIGlzIGFsd2F5cyBsZXNzIHRoYW4gMS5cclxuICAgKiA+IC0tIGNpcmNsZXMgb3IgcmVjdGFuZ2xlcywgYnV0IGFsbCB0YXJnZXRzIG9uZSBzaGFwZVxyXG4gICAqID4gLS1qdXN0IGVub3VnaCBjYXJkcyB0byBjb21wbGV0ZSB0YXJnZXRzXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxOdW1iZXJcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsMk51bWJlcnMoIGxldmVsTnVtYmVyICkge1xyXG4gICAgY29uc3Qgc2hhcGVQYXJ0aXRpb25zID0gc2FtcGxlKCBbXHJcbiAgICAgIFNoYXBlUGFydGl0aW9uLlBJRVMsXHJcbiAgICAgIFNoYXBlUGFydGl0aW9uLkhPUklaT05UQUxfQkFSUyxcclxuICAgICAgU2hhcGVQYXJ0aXRpb24uVkVSVElDQUxfQkFSU1xyXG4gICAgXSApO1xyXG5cclxuICAgIGNvbnN0IHRhcmdldEZyYWN0aW9ucyA9IGNob29zZSggMywgRnJhY3Rpb25MZXZlbC5mcmFjdGlvbnMoIGluY2x1c2l2ZSggMSwgNCApLCBpbmNsdXNpdmUoIDIsIDUgKSwgZiA9PiBmLmlzTGVzc1RoYW4oIEZyYWN0aW9uLk9ORSApICkgKTtcclxuICAgIGNvbnN0IHBpZWNlTnVtYmVycyA9IEZyYWN0aW9uTGV2ZWwuZXhhY3ROdW1iZXJzKCB0YXJnZXRGcmFjdGlvbnMgKTtcclxuICAgIGNvbnN0IHNoYXBlVGFyZ2V0cyA9IEZyYWN0aW9uTGV2ZWwudGFyZ2V0c0Zyb21GcmFjdGlvbnMoIHNoYXBlUGFydGl0aW9ucywgdGFyZ2V0RnJhY3Rpb25zLCBDT0xPUlNfMywgRmlsbFR5cGUuU0VRVUVOVElBTCApO1xyXG5cclxuICAgIHJldHVybiBGcmFjdGlvbkNoYWxsZW5nZS5jcmVhdGVOdW1iZXJDaGFsbGVuZ2UoIGxldmVsTnVtYmVyLCBmYWxzZSwgc2hhcGVUYXJnZXRzLCBwaWVjZU51bWJlcnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBjaGFsbGVuZ2UgZm9yICh1bm1peGVkKSBudW1iZXJzIGxldmVsIDMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogRGVzaWduIGRvYzpcclxuICAgKiAtLSBBbGwgdGFyZ2V0cyDigJxzaXggZmxvd2Vyc+KAnVxyXG4gICAqIC0tIFJhbmdlIOKFmSB0byDihZpcclxuICAgKiAtLSBjYXJkcyBhdmFpbGFibGUgdG8gYWxsb3cgbXVsdGlwbGUgc29sdXRpb25zLiAgRm9yIGluc3RhbmNlLCAyLzYsIGNvdWxkIGJlIHJlcHJlc2VudGVkIGFzIOKFk1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsTnVtYmVyXHJcbiAgICogQHJldHVybnMge0ZyYWN0aW9uQ2hhbGxlbmdlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBsZXZlbDNOdW1iZXJzKCBsZXZlbE51bWJlciApIHtcclxuICAgIGNvbnN0IHNoYXBlUGFydGl0aW9ucyA9IFtcclxuICAgICAgU2hhcGVQYXJ0aXRpb24uU0lYX0ZMT1dFUlxyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdCBudW1lcmF0b3JzID0gY2hvb3NlKCAzLCBpbmNsdXNpdmUoIDEsIDUgKSApO1xyXG4gICAgY29uc3QgdGFyZ2V0RnJhY3Rpb25zID0gbnVtZXJhdG9ycy5tYXAoIG4gPT4gbmV3IEZyYWN0aW9uKCBuLCA2ICkgKTtcclxuICAgIGNvbnN0IHBpZWNlTnVtYmVycyA9IFtcclxuICAgICAgLi4uRnJhY3Rpb25MZXZlbC5leGFjdE51bWJlcnMoIHRhcmdldEZyYWN0aW9ucyApLFxyXG4gICAgICAuLi5GcmFjdGlvbkxldmVsLm11bHRpcGxpZWROdW1iZXJzKCBjaG9vc2UoIDIsIHRhcmdldEZyYWN0aW9ucyApLCBmYWxzZSApXHJcbiAgICBdO1xyXG4gICAgY29uc3Qgc2hhcGVUYXJnZXRzID0gRnJhY3Rpb25MZXZlbC50YXJnZXRzRnJvbUZyYWN0aW9ucyggc2hhcGVQYXJ0aXRpb25zLCB0YXJnZXRGcmFjdGlvbnMsIENPTE9SU18zLCBGaWxsVHlwZS5TRVFVRU5USUFMICk7XHJcblxyXG4gICAgcmV0dXJuIEZyYWN0aW9uQ2hhbGxlbmdlLmNyZWF0ZU51bWJlckNoYWxsZW5nZSggbGV2ZWxOdW1iZXIsIGZhbHNlLCBzaGFwZVRhcmdldHMsIHBpZWNlTnVtYmVycyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNoYWxsZW5nZSBmb3IgKHVubWl4ZWQpIG51bWJlcnMgbGV2ZWwgNC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBEZXNpZ24gZG9jOlxyXG4gICAqIC0tIEFsbCB0cmlhbmdsZXMgc2VlbXMgZ29vZCxcclxuICAgKiAtLSBudW1lcmF0b3IgYW5kIGRlbm9taW5hdG9yIGFibGUgdG8gcmFuZ2UgZnJvbSAxLTlcclxuICAgKiAtLSBqdXN0IGVub3VnaCBjYXJkcyB0byBjb21wbGV0ZSB0YXJnZXRzXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxOdW1iZXJcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsNE51bWJlcnMoIGxldmVsTnVtYmVyICkge1xyXG4gICAgY29uc3Qgc2hhcGVQYXJ0aXRpb25zID0gU2hhcGVQYXJ0aXRpb24uUFlSQU1JRFM7XHJcbiAgICBjb25zdCB0YXJnZXRGcmFjdGlvbnMgPSBbXHJcbiAgICAgIG5ldyBGcmFjdGlvbiggMSwgMSApLFxyXG4gICAgICBuZXcgRnJhY3Rpb24oIHNhbXBsZSggaW5jbHVzaXZlKCAxLCA0ICkgKSwgNCApLFxyXG4gICAgICBuZXcgRnJhY3Rpb24oIHNhbXBsZSggaW5jbHVzaXZlKCAxLCA5ICkgKSwgOSApXHJcbiAgICBdO1xyXG4gICAgY29uc3QgcGllY2VOdW1iZXJzID0gRnJhY3Rpb25MZXZlbC5leGFjdE51bWJlcnMoIHRhcmdldEZyYWN0aW9ucyApO1xyXG4gICAgY29uc3Qgc2hhcGVUYXJnZXRzID0gRnJhY3Rpb25MZXZlbC50YXJnZXRzRnJvbUZyYWN0aW9ucyggc2hhcGVQYXJ0aXRpb25zLCB0YXJnZXRGcmFjdGlvbnMsIENPTE9SU18zLCBGaWxsVHlwZS5TRVFVRU5USUFMICk7XHJcblxyXG4gICAgcmV0dXJuIEZyYWN0aW9uQ2hhbGxlbmdlLmNyZWF0ZU51bWJlckNoYWxsZW5nZSggbGV2ZWxOdW1iZXIsIGZhbHNlLCBzaGFwZVRhcmdldHMsIHBpZWNlTnVtYmVycyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNoYWxsZW5nZSBmb3IgKHVubWl4ZWQpIG51bWJlcnMgbGV2ZWwgNS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBEZXNpZ24gZG9jOlxyXG4gICAqIC0gbnVtZXJhdG9yIGFibGUgdG8gcmFuZ2UgZnJvbSAxLTksIGFuZCBkZW5vbWluYXRvciBhYmxlIHRvIHJhbmdlIGZyb20gMS05LCB3aXRoIHRoZSBudW1iZXIgbGVzcyB0aGFuIDFcclxuICAgKiAtIGFsbCByZXByZXNlbnRhdGlvbnMgcG9zc2libGUgKGNpcmNsZSwgXCI5IGFuZCA0IHNxdWFyZVwiLCBiYXJzLCB0cmlhbmdsZXMsIDYgZmxvd2VyLCBwZXJoYXBzIHJlZ3VsYXIgcG9seWdvbnMpLCBJXHJcbiAgICogLSBhbGwgY2FyZHMgYXZhaWxhYmxlIHRvIGZ1bGZpbGwgY2hhbGxlbmdlcyBpbiB0aGUgbW9zdCBzdHJhaWdodGZvcndhcmQgd2F5LCBmb3IgaW5zdGFuY2UgYSA0LzUgcmVwcmVzZW50YXRpb25cclxuICAgKiAgIGhhcyBhIDQgYW5kIGEgNSBhdmFpbGFibGUuXHJcbiAgICogLS1qdXN0IGVub3VnaCBjYXJkcyB0byBjb21wbGV0ZSB0YXJnZXRzXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxOdW1iZXJcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsNU51bWJlcnMoIGxldmVsTnVtYmVyICkge1xyXG4gICAgY29uc3Qgc2hhcGVUYXJnZXRzID0gRnJhY3Rpb25MZXZlbC50YXJnZXRzRnJvbVBhcnRpdGlvbnMoXHJcbiAgICAgIGNob29zZSggMywgU2hhcGVQYXJ0aXRpb24uTElNSVRFRF85X0dBTUVfUEFSVElUSU9OUy5maWx0ZXIoIHBhcnRpdGlvbiA9PiBwYXJ0aXRpb24ubGVuZ3RoID4gMSApICksXHJcbiAgICAgIENPTE9SU18zLCBkID0+IHNhbXBsZSggaW5jbHVzaXZlKCAxLCBkIC0gMSApICksIEZpbGxUeXBlLlNFUVVFTlRJQUxcclxuICAgICk7XHJcbiAgICBjb25zdCBwaWVjZU51bWJlcnMgPSBGcmFjdGlvbkxldmVsLmV4YWN0TnVtYmVycyggc2hhcGVUYXJnZXRzLm1hcCggdGFyZ2V0ID0+IHRhcmdldC5mcmFjdGlvbiApICk7XHJcblxyXG4gICAgcmV0dXJuIEZyYWN0aW9uQ2hhbGxlbmdlLmNyZWF0ZU51bWJlckNoYWxsZW5nZSggbGV2ZWxOdW1iZXIsIGZhbHNlLCBzaGFwZVRhcmdldHMsIHBpZWNlTnVtYmVycyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNoYWxsZW5nZSBmb3IgKHVubWl4ZWQpIG51bWJlcnMgbGV2ZWwgNi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBEZXNpZ24gZG9jOlxyXG4gICAqIC0tIDQgdGFyZ2V0cyBmcm9tIHRoaXMgbGV2ZWwgZm9yd2FyZFxyXG4gICAqIC0tIFNhbWUgYXMgbGV2ZWwgNSwgYnV0IG5vdyByYW5kb20gZmlsbCBpcyBwb3NzaWJsZVxyXG4gICAqIC0tIGNhcmQgY29uc3RyYWludHMgYXQgdGhpcyBwb2ludCwgc28gYXQgbGVhc3Qgb25lIG9mIHRoZSByZXByZXNlbnRhdGlvbnMgb25seSBoYXMgY2FyZHMgYXZhaWxhYmxlIHRvIG1hdGNoIGl0XHJcbiAgICogICAgd2l0aCBhIFwibm9ub2J2aW91cyBmcmFjdGlvblwiLiAgRm9yIGluc3RhbmNlIGlmIDMvOSBhcHBlYXJzLCBhbmQgNS85IGFwcGVhcnMsIHdlIGhhdmUgMSg1KSBhbmQgMSg5KSwgYnV0IG5vdFxyXG4gICAqICAgIDIoOSksIHNvIHRoYXQgMS8zIHdvdWxkIG5lZWQgdG8gYmUgdXNlZCB0byBtYXRjaC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbE51bWJlclxyXG4gICAqIEByZXR1cm5zIHtGcmFjdGlvbkNoYWxsZW5nZX1cclxuICAgKi9cclxuICBzdGF0aWMgbGV2ZWw2TnVtYmVycyggbGV2ZWxOdW1iZXIgKSB7XHJcbiAgICBjb25zdCBzaGFwZVRhcmdldHMgPSBGcmFjdGlvbkxldmVsLnRhcmdldHNGcm9tUGFydGl0aW9ucyggY2hvb3NlKCA0LCBTaGFwZVBhcnRpdGlvbi5MSU1JVEVEXzlfR0FNRV9QQVJUSVRJT05TICksIENPTE9SU180LCBkID0+IHNhbXBsZSggaW5jbHVzaXZlKCAxLCBkICkgKSwgbnVsbCApO1xyXG4gICAgY29uc3QgcGllY2VOdW1iZXJzID0gRnJhY3Rpb25MZXZlbC53aXRoTXVsdGlwbGllZE51bWJlcnMoIHNoYXBlVGFyZ2V0cy5tYXAoIHRhcmdldCA9PiB0YXJnZXQuZnJhY3Rpb24gKSwgMiwgZmFsc2UgKTtcclxuXHJcbiAgICByZXR1cm4gRnJhY3Rpb25DaGFsbGVuZ2UuY3JlYXRlTnVtYmVyQ2hhbGxlbmdlKCBsZXZlbE51bWJlciwgZmFsc2UsIHNoYXBlVGFyZ2V0cywgcGllY2VOdW1iZXJzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY2hhbGxlbmdlIGZvciAodW5taXhlZCkgbnVtYmVycyBsZXZlbCA3LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIERlc2lnbiBkb2M6XHJcbiAgICogLS0gVG9wIHR3byByZXByZXNlbnRhdGlvbnMgYXJlIGVxdWl2YWxlbnQsIGFuZCBib3R0b20gMiByZXByZXNlbnRhdGlvbnMgYXJlIGVxdWl2YWxlbnQgYnV0IHN0aWxsIG51bWJlcnMgbGVzc1xyXG4gICAqICAgIHRoYW4gMVxyXG4gICAqIC0tIEEgYnVpbHQgaW4gY2hlY2sgdG8gZHJhdyBhIGRpZmZlcmVudCBmcmFjdGlvbiBmb3IgdGhlIHRvcCAyIGFuZCB0aGUgYm90dG9tIDJcclxuICAgKiAtLSBQb3NzaWJsZSBmcmFjdGlvbnMgc2V0cyBmcm9tIHdoaWNoIHRvIGRyYXcgMiBlYWNoIHsxLzIsIDIvNCwgMy82fSwgezEvMywgMi82LCAzLzl9LCB7Mi8zLCA0LzYsIDMvOX0sXHJcbiAgICogICAgezEvNCwgMi84fSwgezMvNCwgNi84fVxyXG4gICAqIC0tIFRoZSByZXByZXNlbnRhdGlvbnMgYXJlIGJvdGggYmUgZXF1YWwsIGZvciBpbnN0YW5jZSwgMiBwaWVzIGRpdmlkZWQgdGhlIHNhbWUsIGFuZCB0d28gYmFycyBkaXZpZGVkIHRoZSBzYW1lLFxyXG4gICAqICAgIHNvIHRoYXQgdGhlIGxlYXJuaW5nIGdvYWwgaXMgZm9jdXNlZCBvbiB0aGUgc2FtZSBleGFjdCBwaWN0dXJlIGNhbiBiZSByZXByZXNlbnRlZCBieSAyIGRpZmZlcmVudCBmcmFjdGlvbnMuXHJcbiAgICogICAgQWx3YXlzIGRpc3BsYXlpbmcgdGhlIHNpbXBsaWZpZWQgZnJhY3Rpb24gYXMgdGhlIHBpY3R1cmUuXHJcbiAgICogLS0gQ2FyZHMgY29uc3RyYWluZWQsIHNvIGZvciBpbnN0YW5jZSBpZiB7MS8yLCAzLzZ9IGlzIGRyYXduIGZvciB0aGUgdG9wIHBhaXIgYW5kIHszLzQsIDYvOH0gZHJhd24gZm9yIHRoZVxyXG4gICAqICAgIGJvdHRvbSwgd2Ugd291bGQgaGF2ZSAxKDEpLCAxKDIpLCAyKDMpLCAxKDQpLCAyKDYpLCAxKDgpXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxOdW1iZXJcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsN051bWJlcnMoIGxldmVsTnVtYmVyICkge1xyXG4gICAgY29uc3QgYmFzZUZyYWN0aW9ucyA9IGNob29zZSggMiwgW1xyXG4gICAgICBbXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCAyICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAyLCA0ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAzLCA2IClcclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMyApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMiwgNiApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMywgOSApXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDIsIDMgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDQsIDYgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDYsIDkgKVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAxLCA0ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAyLCA4IClcclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMywgNCApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggNiwgOCApXHJcbiAgICAgIF1cclxuICAgIF0gKS5tYXAoIGZyYWN0aW9ucyA9PiBjaG9vc2UoIDIsIGZyYWN0aW9ucyApICk7XHJcbiAgICBjb25zdCBzbWFsbEZyYWN0aW9ucyA9IGJhc2VGcmFjdGlvbnMubWFwKCBmcmFjdGlvbnMgPT4gXy5taW5CeSggZnJhY3Rpb25zLCAnZGVub21pbmF0b3InICkgKTtcclxuXHJcbiAgICBjb25zdCBzaGFwZVBhcnRpdGlvbkNob2ljZXMgPSBjaG9vc2UoIDIsIFtcclxuICAgICAgU2hhcGVQYXJ0aXRpb24uUElFUyxcclxuICAgICAgU2hhcGVQYXJ0aXRpb24uSE9SSVpPTlRBTF9CQVJTLFxyXG4gICAgICBTaGFwZVBhcnRpdGlvbi5WRVJUSUNBTF9CQVJTXHJcbiAgICBdICk7XHJcblxyXG4gICAgY29uc3QgY29sb3JzID0gc2h1ZmZsZSggQ09MT1JTXzQgKTtcclxuXHJcbiAgICBjb25zdCBwaWVjZU51bWJlcnMgPSBGcmFjdGlvbkxldmVsLmV4YWN0TnVtYmVycyggXy5mbGF0dGVuKCBiYXNlRnJhY3Rpb25zICkgKTtcclxuXHJcbiAgICBjb25zdCBzaGFwZVRhcmdldHMgPSBpbmNsdXNpdmUoIDAsIDMgKS5tYXAoIGluZGV4ID0+IHtcclxuICAgICAgY29uc3QgbWFpbkluZGV4ID0gaW5kZXggPCAyID8gMCA6IDE7XHJcbiAgICAgIGNvbnN0IHNtYWxsRnJhY3Rpb24gPSBzbWFsbEZyYWN0aW9uc1sgbWFpbkluZGV4IF0ucmVkdWNlZCgpO1xyXG4gICAgICByZXR1cm4gU2hhcGVUYXJnZXQuZmlsbCggc2FtcGxlKCBTaGFwZVBhcnRpdGlvbi5zdXBwb3J0c0Rlbm9taW5hdG9yKCBzaGFwZVBhcnRpdGlvbkNob2ljZXNbIG1haW5JbmRleCBdLCBzbWFsbEZyYWN0aW9uLmRlbm9taW5hdG9yICkgKSxcclxuICAgICAgICBzbWFsbEZyYWN0aW9uLFxyXG4gICAgICAgIGNvbG9yc1sgaW5kZXggXSxcclxuICAgICAgICBGaWxsVHlwZS5TRVFVRU5USUFMICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIEZyYWN0aW9uQ2hhbGxlbmdlLmNyZWF0ZU51bWJlckNoYWxsZW5nZSggbGV2ZWxOdW1iZXIsIGZhbHNlLCBzaGFwZVRhcmdldHMsIHBpZWNlTnVtYmVycyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNoYWxsZW5nZSBmb3IgKHVubWl4ZWQpIG51bWJlcnMgbGV2ZWwgOC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBEZXNpZ24gZG9jOlxyXG4gICAqIC0tIEludHJvZHVjZSBkb3VibGUgcmVwcmVzZW50YXRpb25zIGF0IHRoaXMgbGV2ZWwgKG51bWJlcnMgZ3JlYXRlciB0aGFuIDEpXHJcbiAgICogLS0gOCBjYXJkcywgNCBlYWNoIG9mIDIgbnVtYmVyc1xyXG4gICAqIC0tIHJhbmRvbWx5IGNob29zZSBmcm9tICB7Mi8zLCAzLzIsIDIvMiwgMy8zfSwgezIvNCwgNC8yLCAyLzIsIDQvNH0sIHszLzQsNC8zLCAzLzMsIDQvNH0sIHszLzUsIDUvMywgMy8zLCA1LzV9LFxyXG4gICAqICAgIHszLzYsIDYvMywgMy8zLCA2LzZ9XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxOdW1iZXJcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsOE51bWJlcnMoIGxldmVsTnVtYmVyICkge1xyXG4gICAgY29uc3QgZnJhY3Rpb25zID0gc2h1ZmZsZSggc2FtcGxlKCBbXHJcbiAgICAgIFtcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDIsIDMgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDMsIDIgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDIsIDIgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDMsIDMgKVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAyLCA0ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA0LCAyICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAyLCAyICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA0LCA0IClcclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMywgNCApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggNCwgMyApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMywgMyApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggNCwgNCApXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDMsIDUgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDUsIDMgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDMsIDMgKSxcclxuICAgICAgICBuZXcgRnJhY3Rpb24oIDUsIDUgKVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAzLCA2ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA2LCAzICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAzLCAzICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA2LCA2IClcclxuICAgICAgXVxyXG4gICAgXSApICk7XHJcblxyXG4gICAgY29uc3Qgc2hhcGVUYXJnZXRzID0gRnJhY3Rpb25MZXZlbC50YXJnZXRzRnJvbUZyYWN0aW9ucyggXy5mbGF0dGVuKCBTaGFwZVBhcnRpdGlvbi5VTklWRVJTQUxfUEFSVElUSU9OUyApLCBmcmFjdGlvbnMsIENPTE9SU180LCBGaWxsVHlwZS5TRVFVRU5USUFMICk7XHJcbiAgICBjb25zdCBwaWVjZU51bWJlcnMgPSBGcmFjdGlvbkxldmVsLmV4YWN0TnVtYmVycyggZnJhY3Rpb25zICk7XHJcblxyXG4gICAgcmV0dXJuIEZyYWN0aW9uQ2hhbGxlbmdlLmNyZWF0ZU51bWJlckNoYWxsZW5nZSggbGV2ZWxOdW1iZXIsIGZhbHNlLCBzaGFwZVRhcmdldHMsIHBpZWNlTnVtYmVycyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNoYWxsZW5nZSBmb3IgKHVubWl4ZWQpIG51bWJlcnMgbGV2ZWwgOS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBEZXNpZ24gZG9jOlxyXG4gICAqIC0tIFJlcHJlc2VudGF0aW9ucyBib3RoIGxlc3MgdGhhbiAxIGFuZCBncmVhdGVyIHRoYW4gMVxyXG4gICAqIC0tIEFsbCByZXByZXNlbnRhdGlvbnMgcG9zc2libGVcclxuICAgKiAtLSBObyBjYXJkIGNvbnN0cmFpbnRzIChhcyBpbiBzdHJhaWdodGZvcndhcmQgbWF0Y2hpbmcgb2YgbnVtYmVyIGFuZCBwaWN0dXJlIHBvc3NpYmxlKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsTnVtYmVyXHJcbiAgICogQHJldHVybnMge0ZyYWN0aW9uQ2hhbGxlbmdlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBsZXZlbDlOdW1iZXJzKCBsZXZlbE51bWJlciApIHtcclxuICAgIGNvbnN0IHNoYXBlVGFyZ2V0cyA9IEZyYWN0aW9uTGV2ZWwudGFyZ2V0c0Zyb21QYXJ0aXRpb25zKCBjaG9vc2UoIDQsIFNoYXBlUGFydGl0aW9uLkxJTUlURURfOV9HQU1FX1BBUlRJVElPTlMgKSwgQ09MT1JTXzQsIGQgPT4gc2FtcGxlKCBpbmNsdXNpdmUoIDEsIDIgKiBkICkgKSwgRmlsbFR5cGUuTUlYRUQgKTtcclxuICAgIGNvbnN0IHBpZWNlTnVtYmVycyA9IEZyYWN0aW9uTGV2ZWwuZXhhY3ROdW1iZXJzKCBzaGFwZVRhcmdldHMubWFwKCB0YXJnZXQgPT4gdGFyZ2V0LmZyYWN0aW9uICkgKTtcclxuXHJcbiAgICByZXR1cm4gRnJhY3Rpb25DaGFsbGVuZ2UuY3JlYXRlTnVtYmVyQ2hhbGxlbmdlKCBsZXZlbE51bWJlciwgZmFsc2UsIHNoYXBlVGFyZ2V0cywgcGllY2VOdW1iZXJzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY2hhbGxlbmdlIGZvciAodW5taXhlZCkgbnVtYmVycyBsZXZlbCAxMC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBEZXNpZ24gZG9jOlxyXG4gICAqIC0tIFNhbWUgYXMgbGV2ZWwgIDkgYnV0IHdpdGggY2FyZCBjb25zdHJhaW50c1xyXG4gICAqIC0tIE9uZSBvciB0d28gcmVwcmVzZW50YXRpb25zIHVzZSBhIHByaW1lIG51bWJlciBzY2FsZSBmYWN0b3IgZm9yIGVhY2ggdG8gZ2VuZXJhdGUgdGhlIGNhcmRzLCBmb3IgaW5zdGFuY2UgaWZcclxuICAgKiBvbmUgb2YgdGhlICByZXByZXNlbnRhdGlvbnMgd2FzIDQvMywgd2UgdXNlIHRoZSBzY2FsZSBmYWN0b3IgKDMvMyksIGFuZCB3ZSB3b3VsZCBuZWVkIGEgMTIgYW5kIGEgOSBjYXJkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsTnVtYmVyXHJcbiAgICogQHJldHVybnMge0ZyYWN0aW9uQ2hhbGxlbmdlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBsZXZlbDEwTnVtYmVycyggbGV2ZWxOdW1iZXIgKSB7XHJcbiAgICBjb25zdCBzaGFwZVRhcmdldHMgPSBGcmFjdGlvbkxldmVsLnRhcmdldHNGcm9tUGFydGl0aW9ucyhcclxuICAgICAgY2hvb3NlKCA0LCBTaGFwZVBhcnRpdGlvbi5MSU1JVEVEXzlfR0FNRV9QQVJUSVRJT05TICksXHJcbiAgICAgIENPTE9SU180LCBkID0+IHNhbXBsZSggaW5jbHVzaXZlKCAxLCAyICogZCApICksIEZpbGxUeXBlLk1JWEVEXHJcbiAgICApO1xyXG4gICAgY29uc3QgcGllY2VOdW1iZXJzID0gRnJhY3Rpb25MZXZlbC53aXRoTXVsdGlwbGllZE51bWJlcnMoIHNoYXBlVGFyZ2V0cy5tYXAoIHRhcmdldCA9PiB0YXJnZXQuZnJhY3Rpb24gKSwgMiwgZmFsc2UgKTtcclxuXHJcbiAgICByZXR1cm4gRnJhY3Rpb25DaGFsbGVuZ2UuY3JlYXRlTnVtYmVyQ2hhbGxlbmdlKCBsZXZlbE51bWJlciwgZmFsc2UsIHNoYXBlVGFyZ2V0cywgcGllY2VOdW1iZXJzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY2hhbGxlbmdlIGZvciAobWl4ZWQpIG51bWJlcnMgbGV2ZWwgMS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBEZXNpZ24gZG9jOlxyXG4gICAqIC0tIENpcmNsZXMgYXMgdGFyZ2V0c1xyXG4gICAqIC0tIHsxOjEvMiwgMjoxLzIsIDM6MS80fSBhcyB0aGUgY2hhbGxlbmdlc1xyXG4gICAqIC0tIGp1c3QgZW5vdWdoIGNhcmRzIHRvIGNvbXBsZXRlIHRhcmdldHNcclxuICAgKiAtLSBBcyBiZWZvcmUsIHJlZnJlc2hpbmcgd2lsbCByYW5kb21seSByZW9yZGVyLCByZWNvbG9yXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxOdW1iZXJcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsMU51bWJlcnNNaXhlZCggbGV2ZWxOdW1iZXIgKSB7XHJcbiAgICBjb25zdCBmcmFjdGlvbnMgPSBzaHVmZmxlKCBbXHJcbiAgICAgIG5ldyBGcmFjdGlvbiggMywgMiApLFxyXG4gICAgICBuZXcgRnJhY3Rpb24oIDUsIDIgKSxcclxuICAgICAgbmV3IEZyYWN0aW9uKCAxMywgNCApXHJcbiAgICBdICk7XHJcbiAgICBjb25zdCBzaGFwZVRhcmdldHMgPSBGcmFjdGlvbkxldmVsLnRhcmdldHNGcm9tRnJhY3Rpb25zKCBTaGFwZVBhcnRpdGlvbi5QSUVTLCBmcmFjdGlvbnMsIENPTE9SU18zLCBGaWxsVHlwZS5TRVFVRU5USUFMICk7XHJcbiAgICBjb25zdCBwaWVjZU51bWJlcnMgPSBGcmFjdGlvbkxldmVsLmV4YWN0TWl4ZWROdW1iZXJzKCBmcmFjdGlvbnMgKTtcclxuXHJcbiAgICByZXR1cm4gRnJhY3Rpb25DaGFsbGVuZ2UuY3JlYXRlTnVtYmVyQ2hhbGxlbmdlKCBsZXZlbE51bWJlciwgdHJ1ZSwgc2hhcGVUYXJnZXRzLCBwaWVjZU51bWJlcnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBjaGFsbGVuZ2UgZm9yIChtaXhlZCkgbnVtYmVycyBsZXZlbCAyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIERlc2lnbiBkb2M6XHJcbiAgICogLS0gQ2lyY2xlcyBvciBSZWN0YW5nbGVzIGFzIHRhcmdldHMsIGJ1dCBhbGwgdGFyZ2V0cyBhcmUgdGhlIHNhbWUgc2hhcGVcclxuICAgKiAtLSAxLCAyLCBvciAzLCBhcyB3aG9sZSBudW1iZXJcclxuICAgKiAtLSBGcmFjdGlvbmFsIHBvcnRpb24gZnJvbSB0aGUgc2V0IHsxLzIsIDEvMywgMi8zLCDCvCwgwr59XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxOdW1iZXJcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsMk51bWJlcnNNaXhlZCggbGV2ZWxOdW1iZXIgKSB7XHJcbiAgICBjb25zdCBmcmFjdGlvbnMgPSBjaG9vc2UoIDMsIGV4cGFuZGFibGVNaXhlZE51bWJlcnNGcmFjdGlvbnMgKTtcclxuICAgIGNvbnN0IHNoYXBlUGFydGl0aW9ucyA9IHNhbXBsZSggW1xyXG4gICAgICBTaGFwZVBhcnRpdGlvbi5QSUVTLFxyXG4gICAgICBTaGFwZVBhcnRpdGlvbi5IT1JJWk9OVEFMX0JBUlNcclxuICAgIF0gKTtcclxuXHJcbiAgICBjb25zdCBzaGFwZVRhcmdldHMgPSBGcmFjdGlvbkxldmVsLnRhcmdldHNGcm9tRnJhY3Rpb25zKCBzaGFwZVBhcnRpdGlvbnMsIGZyYWN0aW9ucywgQ09MT1JTXzMsIEZpbGxUeXBlLlNFUVVFTlRJQUwgKTtcclxuICAgIGNvbnN0IHBpZWNlTnVtYmVycyA9IEZyYWN0aW9uTGV2ZWwuZXhhY3RNaXhlZE51bWJlcnMoIGZyYWN0aW9ucyApO1xyXG5cclxuICAgIHJldHVybiBGcmFjdGlvbkNoYWxsZW5nZS5jcmVhdGVOdW1iZXJDaGFsbGVuZ2UoIGxldmVsTnVtYmVyLCB0cnVlLCBzaGFwZVRhcmdldHMsIHBpZWNlTnVtYmVycyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNoYWxsZW5nZSBmb3IgKG1peGVkKSBudW1iZXJzIGxldmVsIDMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogRGVzaWduIGRvYzpcclxuICAgKiAtLSBBbGwgdGFyZ2V0cyBzaGFwZWQgbGlrZSDigJxzaXggZmxvd2Vyc+KAnVxyXG4gICAqIC0tIDEsIDIsIG9yIDMsIGFzIHdob2xlIG51bWJlclxyXG4gICAqIC0tIEZyYWN0aW9uYWwgcG9ydGlvbiBmcm9tIHRoZSBzZXQgezEvMiwgMS8zLCAyLzMsIDEvNiwgNS82fVxyXG4gICAqIC0tIFNvLCBpZiBhIOKAnHNpeCBmbG93ZXLigJ0gaXMgc2hvd2luZyAzLzYsIHdlIHdpbGwgd2FudCBhIDEgYW5kIDIgY2FyZCBpbiB0aGUgZGVja1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsTnVtYmVyXHJcbiAgICogQHJldHVybnMge0ZyYWN0aW9uQ2hhbGxlbmdlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBsZXZlbDNOdW1iZXJzTWl4ZWQoIGxldmVsTnVtYmVyICkge1xyXG4gICAgY29uc3QgZnJhY3Rpb25zID0gY2hvb3NlKCAzLCBfLmZsYXR0ZW4oIGluY2x1c2l2ZSggMSwgMyApLm1hcCggd2hvbGUgPT4ge1xyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMiApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMyApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMiwgMyApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgNiApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggNSwgNiApXHJcbiAgICAgIF0ubWFwKCBmID0+IGYucGx1c0ludGVnZXIoIHdob2xlICkgKTtcclxuICAgIH0gKSApICk7XHJcblxyXG4gICAgY29uc3Qgc2hhcGVUYXJnZXRzID0gRnJhY3Rpb25MZXZlbC50YXJnZXRzRnJvbUZyYWN0aW9ucyggWyBTaGFwZVBhcnRpdGlvbi5TSVhfRkxPV0VSIF0sIGZyYWN0aW9ucywgQ09MT1JTXzMsIEZpbGxUeXBlLlNFUVVFTlRJQUwsIHRydWUgKTtcclxuICAgIGNvbnN0IHBpZWNlTnVtYmVycyA9IEZyYWN0aW9uTGV2ZWwuZXhhY3RNaXhlZE51bWJlcnMoIGZyYWN0aW9ucyApO1xyXG5cclxuICAgIHJldHVybiBGcmFjdGlvbkNoYWxsZW5nZS5jcmVhdGVOdW1iZXJDaGFsbGVuZ2UoIGxldmVsTnVtYmVyLCB0cnVlLCBzaGFwZVRhcmdldHMsIHBpZWNlTnVtYmVycyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNoYWxsZW5nZSBmb3IgKG1peGVkKSBudW1iZXJzIGxldmVsIDQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogRGVzaWduIGRvYzpcclxuICAgKiAtLSBBbGwgdHJpYW5nbGVzXHJcbiAgICogLS0gMSwgMiwgb3IgMywgYXMgd2hvbGUgbnVtYmVyXHJcbiAgICogLS0gRnJhY3Rpb25hbCBwb3J0aW9uIGZyb20gdGhlIHNldCB7MS8yLCAxLzMsIDIvMywgwrwsIMK+LCAxLzksIDIvOSwgNC85LCA1LzksIDcvOSwgOC85fVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsTnVtYmVyXHJcbiAgICogQHJldHVybnMge0ZyYWN0aW9uQ2hhbGxlbmdlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBsZXZlbDROdW1iZXJzTWl4ZWQoIGxldmVsTnVtYmVyICkge1xyXG4gICAgY29uc3QgZnJhY3Rpb25zID0gY2hvb3NlKCAzLCBfLmZsYXR0ZW4oIGluY2x1c2l2ZSggMSwgMyApLm1hcCggd2hvbGUgPT4ge1xyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMiApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgMyApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMiwgMyApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgNCApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMywgNCApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMSwgOSApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggMiwgOSApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggNCwgOSApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggNSwgOSApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggNywgOSApLFxyXG4gICAgICAgIG5ldyBGcmFjdGlvbiggOCwgOSApXHJcbiAgICAgIF0ubWFwKCBmID0+IGYucGx1c0ludGVnZXIoIHdob2xlICkgKTtcclxuICAgIH0gKSApICk7XHJcblxyXG4gICAgY29uc3Qgc2hhcGVUYXJnZXRzID0gRnJhY3Rpb25MZXZlbC50YXJnZXRzRnJvbUZyYWN0aW9ucyggU2hhcGVQYXJ0aXRpb24uUFlSQU1JRFMsIGZyYWN0aW9ucywgQ09MT1JTXzMsIEZpbGxUeXBlLlNFUVVFTlRJQUwsIHRydWUgKTtcclxuICAgIGNvbnN0IHBpZWNlTnVtYmVycyA9IEZyYWN0aW9uTGV2ZWwuZXhhY3RNaXhlZE51bWJlcnMoIGZyYWN0aW9ucyApO1xyXG5cclxuICAgIHJldHVybiBGcmFjdGlvbkNoYWxsZW5nZS5jcmVhdGVOdW1iZXJDaGFsbGVuZ2UoIGxldmVsTnVtYmVyLCB0cnVlLCBzaGFwZVRhcmdldHMsIHBpZWNlTnVtYmVycyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNoYWxsZW5nZSBmb3IgKG1peGVkKSBudW1iZXJzIGxldmVsIDUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogRGVzaWduIGRvYzpcclxuICAgKiAtLSBBbGwgcmVwcmVzZW50YXRpb25zIHBvc3NpYmxlLCBidXQgZWFjaCB0YXJnZXQgaXMgb25seSBvbmUgdHlwZSBvZiByZXByZXNlbnRhdGlvblxyXG4gICAqIC0tIDEsIDIsIG9yIDMsIGFzIHdob2xlIG51bWJlclxyXG4gICAqIC0tIEZyYWN0aW9uYWwgcG9ydGlvbiBmcm9tIHRoZSBzZXQgezEvMiwgMS8zLCAyLzMsIMK8LCDCviwgMS81LCAyLzUsIDMvNSwgNC81LCAxLzYsIDUvNiwgMS83LCAyLzcsIDMvNywgNC83LCA1LzcsXHJcbiAgICogICAgNi83LCAxLzgsIDMvOCwgNS84LCA3LzgsIDEvOSwgMi85LCA0LzksIDUvOSwgNy85LCA4Lzl9XHJcbiAgICogLS0gMiBvZiB0aGUgcmVwcmVzZW50YXRpb25zIG1hdGNoIGNhcmRzIGV4YWN0bHksIDEgb2YgdGhlIHJlcHJlc2VudGF0aW9ucyByZXF1aXJlcyBzaW1wbGlmeWluZyB0byBhIHNvbHV0aW9uXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxOdW1iZXJcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsNU51bWJlcnNNaXhlZCggbGV2ZWxOdW1iZXIgKSB7XHJcbiAgICBjb25zdCBmcmFjdGlvbnMgPSBjaG9vc2VTcGxpdHRhYmxlKCAzLCBtaXhlZE51bWJlcnNGcmFjdGlvbnMsIDEgKTtcclxuICAgIGNvbnN0IG11bHRpcGxpZWRGcmFjdGlvbnMgPSBzaHVmZmxlKCBbXHJcbiAgICAgIC4uLmZyYWN0aW9ucy5zbGljZSggMCwgMSApLm1hcCggRnJhY3Rpb25MZXZlbC5tdWx0aXBseUZyYWN0aW9uICksXHJcbiAgICAgIC4uLmZyYWN0aW9ucy5zbGljZSggMSApXHJcbiAgICBdICk7XHJcblxyXG4gICAgY29uc3Qgc2hhcGVUYXJnZXRzID0gRnJhY3Rpb25MZXZlbC50YXJnZXRzRnJvbUZyYWN0aW9ucyggU2hhcGVQYXJ0aXRpb24uTElNSVRFRF85X0dBTUVfUEFSVElUSU9OUywgbXVsdGlwbGllZEZyYWN0aW9ucywgQ09MT1JTXzMsIEZpbGxUeXBlLlNFUVVFTlRJQUwsIHRydWUgKTtcclxuXHJcbiAgICBjb25zdCBwaWVjZU51bWJlcnMgPSBGcmFjdGlvbkxldmVsLmV4YWN0TWl4ZWROdW1iZXJzKCBmcmFjdGlvbnMgKTtcclxuXHJcbiAgICByZXR1cm4gRnJhY3Rpb25DaGFsbGVuZ2UuY3JlYXRlTnVtYmVyQ2hhbGxlbmdlKCBsZXZlbE51bWJlciwgdHJ1ZSwgc2hhcGVUYXJnZXRzLCBwaWVjZU51bWJlcnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBjaGFsbGVuZ2UgZm9yIChtaXhlZCkgbnVtYmVycyBsZXZlbCA2LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIERlc2lnbiBkb2M6XHJcbiAgICogLS0gU2FtZSBhcyBsZXZlbCA1IChub3cgd2l0aCA0IHRhcmdldHMpXHJcbiAgICogLS0gUmFuZG9tIGZpbGwgbm93IHBvc3NpYmxlLCBzbyBmb3IgaW5zdGFuY2UgezI6MS80fSBjb3VsZCBiZSByZXByZXNlbnRlZCBieSAyIGZ1bGwgY2lyY2xlcyB3aXRoIGEgcGFydGlhbGx5XHJcbiAgICogICAgZmlsbGVkIGNpcmNsZSBpbiBiZXR3ZWVuIHRoZW0uICBBcyBpbiwgd2UgZG8gbm90IG5lZWQgdG8gc3RyaWN0bHkgZmlsbCBmcm9tIGxlZnQgdG8gcmlnaHQuXHJcbiAgICogLS0gMiBvZiB0aGUgcmVwcmVzZW50YXRpb25zIHJlcXVpcmUgc2ltcGxpZnlpbmdcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbE51bWJlclxyXG4gICAqIEByZXR1cm5zIHtGcmFjdGlvbkNoYWxsZW5nZX1cclxuICAgKi9cclxuICBzdGF0aWMgbGV2ZWw2TnVtYmVyc01peGVkKCBsZXZlbE51bWJlciApIHtcclxuICAgIGNvbnN0IGZyYWN0aW9ucyA9IGNob29zZVNwbGl0dGFibGUoIDQsIG1peGVkTnVtYmVyc0ZyYWN0aW9ucywgMiApO1xyXG4gICAgY29uc3QgbXVsdGlwbGllZEZyYWN0aW9ucyA9IHNodWZmbGUoIFtcclxuICAgICAgLi4uZnJhY3Rpb25zLnNsaWNlKCAwLCAyICkubWFwKCBGcmFjdGlvbkxldmVsLm11bHRpcGx5RnJhY3Rpb24gKSxcclxuICAgICAgLi4uZnJhY3Rpb25zLnNsaWNlKCAyIClcclxuICAgIF0gKTtcclxuXHJcbiAgICBjb25zdCBzaGFwZVRhcmdldHMgPSBGcmFjdGlvbkxldmVsLnRhcmdldHNGcm9tRnJhY3Rpb25zKCBTaGFwZVBhcnRpdGlvbi5MSU1JVEVEXzlfR0FNRV9QQVJUSVRJT05TLCBtdWx0aXBsaWVkRnJhY3Rpb25zLCBDT0xPUlNfNCwgRmlsbFR5cGUuTUlYRUQsIHRydWUgKTtcclxuICAgIGNvbnN0IHBpZWNlTnVtYmVycyA9IEZyYWN0aW9uTGV2ZWwuZXhhY3RNaXhlZE51bWJlcnMoIGZyYWN0aW9ucyApO1xyXG5cclxuICAgIHJldHVybiBGcmFjdGlvbkNoYWxsZW5nZS5jcmVhdGVOdW1iZXJDaGFsbGVuZ2UoIGxldmVsTnVtYmVyLCB0cnVlLCBzaGFwZVRhcmdldHMsIHBpZWNlTnVtYmVycyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNoYWxsZW5nZSBmb3IgKG1peGVkKSBudW1iZXJzIGxldmVsIDcuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogRGVzaWduIGRvYzpcclxuICAgKiAtLSBUb3AgdHdvIHJlcHJlc2VudGF0aW9ucyBhcmUgZXF1aXZhbGVudCBpbiBtYWduaXR1ZGUsIGFuZCBib3R0b20gMiByZXByZXNlbnRhdGlvbnMgYXJlIGVxdWl2YWxlbnQgaW4gbWFnbml0dWRlXHJcbiAgICogLS0gRm9yIGluc3RhbmNlIGlmIHRoZSB0b3AgdHdvIHJlcHJlc2VudGF0aW9ucyBhcmUgezE6MS8yfSwgdGhlIGZpcnN0ICByZXByZXNlbnRhdGlvbiBjb3VsZCBiZSBhIGZ1bGwgY2lyY2xlIGFuZFxyXG4gICAqICAgIGEgaGFsZiBjaXJjbGUgZGl2aWRlZCBpbiBoYWx2ZXMsIGFuZCB0aGUgc2Vjb25kIGNpcmNsZSBjb3VsZCBiZSBhIGZ1bGwgY2lyY2xlIGFuZCBhIGhhbGYgY2lyY2xlIGRpdmlkZSBpblxyXG4gICAqICAgIGZvdXJ0aHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxOdW1iZXJcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsN051bWJlcnNNaXhlZCggbGV2ZWxOdW1iZXIgKSB7XHJcbiAgICBjb25zdCBiYXNlRnJhY3Rpb25zID0gY2hvb3NlKCAyLCBleHBhbmRhYmxlTWl4ZWROdW1iZXJzRnJhY3Rpb25zICk7XHJcbiAgICBjb25zdCBzbWFsbE11bHRpcGxpZXJzID0gW1xyXG4gICAgICBuZXcgRnJhY3Rpb24oIDIsIDIgKVxyXG4gICAgXTtcclxuICAgIGNvbnN0IG11bHRpcGxpZXJzID0gW1xyXG4gICAgICBuZXcgRnJhY3Rpb24oIDIsIDIgKSxcclxuICAgICAgbmV3IEZyYWN0aW9uKCAzLCAzIClcclxuICAgIF07XHJcbiAgICBjb25zdCBmcmFjdGlvbnMgPSBbXHJcbiAgICAgIC4uLnNodWZmbGUoIFsgYmFzZUZyYWN0aW9uc1sgMCBdLCBiYXNlRnJhY3Rpb25zWyAwIF0udGltZXMoIHNhbXBsZSggYmFzZUZyYWN0aW9uc1sgMCBdLmRlbm9taW5hdG9yID49IDQgPyBzbWFsbE11bHRpcGxpZXJzIDogbXVsdGlwbGllcnMgKSApIF0gKSxcclxuICAgICAgLi4uc2h1ZmZsZSggWyBiYXNlRnJhY3Rpb25zWyAxIF0sIGJhc2VGcmFjdGlvbnNbIDEgXS50aW1lcyggc2FtcGxlKCBiYXNlRnJhY3Rpb25zWyAxIF0uZGVub21pbmF0b3IgPj0gNCA/IHNtYWxsTXVsdGlwbGllcnMgOiBtdWx0aXBsaWVycyApICkgXSApXHJcbiAgICBdO1xyXG5cclxuICAgIGNvbnN0IHNoYXBlVGFyZ2V0cyA9IEZyYWN0aW9uTGV2ZWwudGFyZ2V0c0Zyb21GcmFjdGlvbnMoIFNoYXBlUGFydGl0aW9uLkxJTUlURURfOV9HQU1FX1BBUlRJVElPTlMsIGZyYWN0aW9ucywgQ09MT1JTXzQsIEZpbGxUeXBlLlNFUVVFTlRJQUwgKTtcclxuICAgIGNvbnN0IHBpZWNlTnVtYmVycyA9IFtcclxuICAgICAgLi4uRnJhY3Rpb25MZXZlbC5leGFjdE1peGVkTnVtYmVycyggYmFzZUZyYWN0aW9ucyApLFxyXG4gICAgICAuLi5GcmFjdGlvbkxldmVsLmV4YWN0TWl4ZWROdW1iZXJzKCBiYXNlRnJhY3Rpb25zIClcclxuICAgIF07XHJcblxyXG4gICAgcmV0dXJuIEZyYWN0aW9uQ2hhbGxlbmdlLmNyZWF0ZU51bWJlckNoYWxsZW5nZSggbGV2ZWxOdW1iZXIsIHRydWUsIHNoYXBlVGFyZ2V0cywgcGllY2VOdW1iZXJzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY2hhbGxlbmdlIGZvciAobWl4ZWQpIG51bWJlcnMgbGV2ZWwgOC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBEZXNpZ24gZG9jOlxyXG4gICAqIC0tIFNhbWUgYXMgbGV2ZWwgNlxyXG4gICAqIC0tIEFsbCA0IHJlcHJlc2VudGF0aW9ucyByZXF1aXJlIHNpbXBsaWZ5aW5nXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxOdW1iZXJcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsOE51bWJlcnNNaXhlZCggbGV2ZWxOdW1iZXIgKSB7XHJcbiAgICBjb25zdCB1bnJlZHVjZWRGcmFjdGlvbnMgPSBjaG9vc2UoIDQsIF8uZmxhdHRlbiggaW5jbHVzaXZlKCAxLCAzICkubWFwKCB3aG9sZSA9PiB7XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAyLCA0ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAzLCA2ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA0LCA4ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAyLCA2ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAzLCA5ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA0LCA2ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA2LCA5ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCAyLCA4ICksXHJcbiAgICAgICAgbmV3IEZyYWN0aW9uKCA2LCA4IClcclxuICAgICAgXS5tYXAoIGYgPT4gZi5wbHVzSW50ZWdlciggd2hvbGUgKSApO1xyXG4gICAgfSApICkgKTtcclxuICAgIGNvbnN0IGZyYWN0aW9ucyA9IHVucmVkdWNlZEZyYWN0aW9ucy5tYXAoIGYgPT4gZi5yZWR1Y2VkKCkgKTtcclxuXHJcbiAgICBjb25zdCBzaGFwZVRhcmdldHMgPSBGcmFjdGlvbkxldmVsLnRhcmdldHNGcm9tRnJhY3Rpb25zKCBTaGFwZVBhcnRpdGlvbi5MSU1JVEVEXzlfR0FNRV9QQVJUSVRJT05TLCB1bnJlZHVjZWRGcmFjdGlvbnMsIENPTE9SU180LCBGaWxsVHlwZS5SQU5ET00sIHRydWUgKTtcclxuICAgIGNvbnN0IHBpZWNlTnVtYmVycyA9IEZyYWN0aW9uTGV2ZWwuZXhhY3RNaXhlZE51bWJlcnMoIGZyYWN0aW9ucyApO1xyXG5cclxuICAgIHJldHVybiBGcmFjdGlvbkNoYWxsZW5nZS5jcmVhdGVOdW1iZXJDaGFsbGVuZ2UoIGxldmVsTnVtYmVyLCB0cnVlLCBzaGFwZVRhcmdldHMsIHBpZWNlTnVtYmVycyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNoYWxsZW5nZSBmb3IgKG1peGVkKSBudW1iZXJzIGxldmVsIDkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogRGVzaWduIGRvYzpcclxuICAgKiAtLSBBbGwgcmVwcmVzZW50YXRpb25zLCByYW5kb20gZmlsbCwgYW5kIHNpbXBsaWZ5aW5nIHBvc3NpYmxlXHJcbiAgICogLS0gTm93IHJlcHJlc2VudGF0aW9ucyB3aXRoaW4gdGhlIHRhcmdldHMgY2FuIGhhdmUgZGlmZmVyZW50IGRpdmlzaW9ucywgZG8gdGhpcyBmb3IgMiBvZiB0aGUgdGFyZ2V0c1xyXG4gICAqIC0tIFNvLCBmb3IgaW5zdGFuY2UgaWYgezE6My80fSBpcyBiZWluZyByZXByZXNlbnRlZCBieSBjaXJjbGVzLCB0aGUgZmlyc3QgY2lyY2xlIGNvdWxkIGJlIGRpdmlkZWQgaW4gwrzigJlzIGFuZCB0aGVcclxuICAgKiAgICBzZWNvbmQgY2lyY2xlIGRpdmlkZWQgaW4gMS844oCZcywgd2l0aCBwaWVjZXMgcmFuZG9tbHkgZGlzdHJpYnV0ZWQgYmV0d2VlbiB0aGUgdHdvIGNpcmNsZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxOdW1iZXJcclxuICAgKiBAcmV0dXJucyB7RnJhY3Rpb25DaGFsbGVuZ2V9XHJcbiAgICovXHJcbiAgc3RhdGljIGxldmVsOU51bWJlcnNNaXhlZCggbGV2ZWxOdW1iZXIgKSB7XHJcbiAgICBjb25zdCBmcmFjdGlvbnMgPSBjaG9vc2UoIDQsIGFsbE1peGVkTnVtYmVyRnJhY3Rpb25zICk7XHJcblxyXG4gICAgY29uc3Qgc2hhcGVUYXJnZXRzID0gc2h1ZmZsZSggZnJhY3Rpb25zLm1hcCggKCBmcmFjdGlvbiwgaW5kZXggKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbG9yID0gQ09MT1JTXzRbIGluZGV4IF07XHJcbiAgICAgIGlmICggaW5kZXggPCAyICkge1xyXG4gICAgICAgIGNvbnN0IHNoYXBlUGFydGl0aW9ucyA9IHNhbXBsZSggW1xyXG4gICAgICAgICAgU2hhcGVQYXJ0aXRpb24uUElFUyxcclxuICAgICAgICAgIFNoYXBlUGFydGl0aW9uLkVYVEVOREVEX0hPUklaT05UQUxfQkFSUyxcclxuICAgICAgICAgIFNoYXBlUGFydGl0aW9uLkVYVEVOREVEX1ZFUlRJQ0FMX0JBUlMsXHJcbiAgICAgICAgICBTaGFwZVBhcnRpdGlvbi5FWFRFTkRFRF9SRUNUQU5HVUxBUl9CQVJTXHJcbiAgICAgICAgXSApO1xyXG4gICAgICAgIHJldHVybiBGcmFjdGlvbkxldmVsLmRpZmZpY3VsdE1peGVkU2hhcGVUYXJnZXQoIHNoYXBlUGFydGl0aW9ucywgZnJhY3Rpb24sIGNvbG9yICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFNoYXBlVGFyZ2V0LnJhbmRvbUZpbGwoIHNhbXBsZSggU2hhcGVQYXJ0aXRpb24uc3VwcG9ydHNEZW5vbWluYXRvciggU2hhcGVQYXJ0aXRpb24uTElNSVRFRF85X0dBTUVfUEFSVElUSU9OUywgZnJhY3Rpb24uZGVub21pbmF0b3IgKSApLCBmcmFjdGlvbiwgY29sb3IgKTtcclxuICAgICAgfVxyXG4gICAgfSApICk7XHJcbiAgICBjb25zdCBwaWVjZU51bWJlcnMgPSBGcmFjdGlvbkxldmVsLmV4YWN0TWl4ZWROdW1iZXJzKCBmcmFjdGlvbnMgKTtcclxuXHJcbiAgICByZXR1cm4gRnJhY3Rpb25DaGFsbGVuZ2UuY3JlYXRlTnVtYmVyQ2hhbGxlbmdlKCBsZXZlbE51bWJlciwgdHJ1ZSwgc2hhcGVUYXJnZXRzLCBwaWVjZU51bWJlcnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBjaGFsbGVuZ2UgZm9yIChtaXhlZCkgbnVtYmVycyBsZXZlbCAxMC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBEZXNpZ24gZG9jOlxyXG4gICAqIC0tIFNhbWUgYXMgbGV2ZWwgOSwgYnV0IG5vdyBhbGwgNCB0YXJnZXRzIGNhbiBoYXZlIGRpZmZlcmVudCBpbnRlcm5hbCBkaXZpc2lvbnMgaW4gcmVwcmVzZW50YXRpb25zLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsTnVtYmVyXHJcbiAgICogQHJldHVybnMge0ZyYWN0aW9uQ2hhbGxlbmdlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBsZXZlbDEwTnVtYmVyc01peGVkKCBsZXZlbE51bWJlciApIHtcclxuICAgIGNvbnN0IGZyYWN0aW9ucyA9IGNob29zZSggNCwgYWxsTWl4ZWROdW1iZXJGcmFjdGlvbnMgKTtcclxuICAgIGNvbnN0IGNvbG9ycyA9IHNodWZmbGUoIENPTE9SU180ICk7XHJcblxyXG4gICAgY29uc3Qgc2hhcGVUYXJnZXRzID0gZnJhY3Rpb25zLm1hcCggKCBmcmFjdGlvbiwgaW5kZXggKSA9PiB7XHJcbiAgICAgIGNvbnN0IHNoYXBlUGFydGl0aW9ucyA9IHNhbXBsZSggW1xyXG4gICAgICAgIFNoYXBlUGFydGl0aW9uLlBJRVMsXHJcbiAgICAgICAgU2hhcGVQYXJ0aXRpb24uRVhURU5ERURfSE9SSVpPTlRBTF9CQVJTLFxyXG4gICAgICAgIFNoYXBlUGFydGl0aW9uLkVYVEVOREVEX1ZFUlRJQ0FMX0JBUlMsXHJcbiAgICAgICAgU2hhcGVQYXJ0aXRpb24uRVhURU5ERURfUkVDVEFOR1VMQVJfQkFSU1xyXG4gICAgICBdICk7XHJcbiAgICAgIHJldHVybiBGcmFjdGlvbkxldmVsLmRpZmZpY3VsdE1peGVkU2hhcGVUYXJnZXQoIHNoYXBlUGFydGl0aW9ucywgZnJhY3Rpb24sIGNvbG9yc1sgaW5kZXggXSApO1xyXG4gICAgfSApO1xyXG4gICAgY29uc3QgcGllY2VOdW1iZXJzID0gRnJhY3Rpb25MZXZlbC5tdWx0aXBsaWVkTnVtYmVycyggZnJhY3Rpb25zLCB0cnVlICk7XHJcblxyXG4gICAgcmV0dXJuIEZyYWN0aW9uQ2hhbGxlbmdlLmNyZWF0ZU51bWJlckNoYWxsZW5nZSggbGV2ZWxOdW1iZXIsIHRydWUsIHNoYXBlVGFyZ2V0cywgcGllY2VOdW1iZXJzICk7XHJcbiAgfVxyXG59XHJcblxyXG5mcmFjdGlvbnNDb21tb24ucmVnaXN0ZXIoICdGcmFjdGlvbkxldmVsJywgRnJhY3Rpb25MZXZlbCApO1xyXG5leHBvcnQgZGVmYXVsdCBGcmFjdGlvbkxldmVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxlQUFlLE1BQU0sNkNBQTZDO0FBQ3pFLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsUUFBUSxNQUFN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RUFDcEIsSUFBSUEsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDcEIsSUFBSUEsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDcEIsSUFBSUEsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDcEIsSUFBSUEsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDcEIsSUFBSUEsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDcEIsSUFBSUEsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDcEIsSUFBSUEsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDcEIsSUFBSUEsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDcEIsSUFBSUEsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDcEIsSUFBSUEsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDcEIsSUFBSUEsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDcEIsSUFBSUEsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDcEIsSUFBSUEsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDcEIsSUFBSUEsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDcEIsSUFBSUEsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDcEIsSUFBSUEsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDcEIsSUFBSUEsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsQ0FDckIsQ0FBQ21DLEdBQUcsQ0FBRVAsQ0FBQyxJQUFJQSxDQUFDLENBQUNtQixXQUFXLENBQUVELEtBQU0sQ0FBRSxDQUFDO0FBQ3RDLENBQUUsQ0FBRSxDQUFDO0FBQ0wsTUFBTUcsdUJBQXVCLEdBQUczQixDQUFDLENBQUN1QixPQUFPLENBQUV4QixTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDYyxHQUFHLENB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