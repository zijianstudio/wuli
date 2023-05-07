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
const sample = array => dotRandom.sample( array );
const shuffle = array => dotRandom.shuffle( array );
const nextIntBetween = ( a, b ) => dotRandom.nextIntBetween( a, b );
const choose = ( q, i ) => FractionLevel.choose( q, i );
const inclusive = ( a, b ) => _.range( a, b + 1 );
const repeat = ( q, i ) => _.times( q, () => i );
const splittable = array => array.filter( f => f.denominator <= 4 );
const notSplittable = array => array.filter( f => f.denominator > 4 );
const chooseSplittable = ( q, i, c = 1 ) => [ ...choose( c, splittable( i ) ), ...choose( q - c, i ) ];

// constants
const collectionFinder8 = new CollectionFinder( {
  // default denominators to match the Java search
  denominators: inclusive( 1, 8 ).map( PrimeFactorization.factor )
} );
const collectionFinder9 = new CollectionFinder( {
  // default denominators to match the Java search
  denominators: inclusive( 1, 9 ).map( PrimeFactorization.factor )
} );
const COLORS_3 = [
  FractionsCommonColors.level1Property,
  FractionsCommonColors.level2Property,
  FractionsCommonColors.level3Property
];
const COLORS_4 = [
  ...COLORS_3,
  FractionsCommonColors.level4Property
];

// common lists of fractions needed
const expandableMixedNumbersFractions = _.flatten( inclusive( 1, 3 ).map( whole => {
  return [
    new Fraction( 1, 2 ),
    new Fraction( 1, 3 ),
    new Fraction( 2, 3 ),
    new Fraction( 1, 4 ),
    new Fraction( 3, 4 )
  ].map( f => f.plusInteger( whole ) );
} ) );
const mixedNumbersFractions = _.flatten( inclusive( 1, 3 ).map( whole => {
  return [
    new Fraction( 1, 2 ),
    new Fraction( 1, 3 ),
    new Fraction( 2, 3 ),
    new Fraction( 1, 4 ),
    new Fraction( 3, 4 ),
    new Fraction( 1, 5 ),
    new Fraction( 2, 5 ),
    new Fraction( 3, 5 ),
    new Fraction( 4, 5 ),
    new Fraction( 1, 6 ),
    new Fraction( 5, 6 ),
    new Fraction( 1, 7 ),
    new Fraction( 2, 7 ),
    new Fraction( 3, 7 ),
    new Fraction( 4, 7 ),
    new Fraction( 5, 7 ),
    new Fraction( 6, 7 ),
    new Fraction( 1, 8 ),
    new Fraction( 3, 8 ),
    new Fraction( 5, 8 ),
    new Fraction( 7, 8 ),
    new Fraction( 1, 9 ),
    new Fraction( 2, 9 ),
    new Fraction( 4, 9 ),
    new Fraction( 5, 9 ),
    new Fraction( 7, 9 ),
    new Fraction( 8, 9 )
  ].map( f => f.plusInteger( whole ) );
} ) );
const allMixedNumberFractions = _.flatten( inclusive( 1, 3 ).map( whole => {
  return _.flatten( inclusive( 2, 8 ).map( denominator => {
    return inclusive( 1, denominator - 1 ).map( numerator => {
      return new Fraction( numerator, denominator ).plusInteger( whole );
    } );
  } ) );
} ) );

class FractionLevel {
  /**
   * @param {number} number
   * @param {number} numTargets
   * @param {BuildingType} buildingType
   * @param {ColorDef} color
   * @param {function} generateChallenge - function({number} levelNumber, {ColorDef} color): {FractionChallenge}
   */
  constructor( number, numTargets, buildingType, color, generateChallenge ) {

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
    this.challengeProperty = new Property( this.nextChallenge() );

    // Clear out the initial value so that we don't leak memory (since they retain a reference to the previous
    // challenge).
    this.challengeProperty._initialValue = null;

    // @public {Property.<number>}
    this.scoreProperty = new DynamicProperty( this.challengeProperty, {
      derive: 'scoreProperty'
    } );
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
      challenge = this.generateChallenge( this.number, this.color );
    }
    while ( challenge.getLargestStackLayoutQuantity() > 10 );

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
  static choose( quantity, items ) {
    assert && assert( typeof quantity === 'number' );
    assert && assert( Array.isArray( items ) );
    assert && assert( items.length >= quantity );

    return shuffle( items ).slice( 0, quantity );
  }

  /**
   * Returns a list of unit (1/x) fractions from a list of fractions, such that each (A/B) is converted to Ax (1/B).
   * @private
   *
   * @param {Array.<Fraction>} fractions
   * @returns {Array.<Fraction>}
   */
  static unitFractions( fractions ) {
    return _.flatten( fractions.map( fraction => {
      return repeat( fraction.numerator, new Fraction( 1, fraction.denominator ) );
    } ) );
  }

  /**
   * Returns a list of unit (1/x) fractions from a list of fractions (handling mixed fractions), such that
   * each (A B/C) is converted to Ax (1/1) and Bx (1/C).
   * @private
   *
   * @param {Array.<Fraction>} fractions
   * @returns {Array.<Fraction>}
   */
  static straightforwardFractions( fractions ) {
    return _.flatten( fractions.map( fraction => {
      const whole = Math.floor( fraction.value );
      return [
        ...repeat( whole, new Fraction( 1, 1 ) ),
        ...repeat( fraction.numerator - whole * fraction.denominator, new Fraction( 1, fraction.denominator ) )
      ];
    } ) );
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
  static minimizedFractions( fractions ) {
    return _.flatten( fractions.map( fraction => {
      const whole = Math.floor( fraction.value );
      const remainder = fraction.minusInteger( whole );
      const collections = collectionFinder8.search( remainder );
      const collection = _.sortBy( collections, 'totalQuantities' )[ 0 ];
      return [
        ...repeat( whole, new Fraction( 1, 1 ) ),
        ...collection.unitFractions
      ];
    } ) );
  }

  /**
   * Picks at random a "fairly low number of fractions" that add up to the given fraction.
   * @private
   *
   * @param {Fraction} fraction
   * @param {number} [quantity] - Return a random set from the top `quantity` of possibilities.
   */
  static interestingFractions( fraction, quantity = 5 ) {
    let collections = collectionFinder8.search( fraction );
    assert && assert( collections.length );

    // Java comment:
    //In order to remove the tedium but still require creation of interesting shapes, sort by the number of pieces
    //required to create the fraction
    //and choose one of the solutions with a small number of cards.
    _.sortBy( collections, collection => collection.totalQuantities );
    const filteredCollections = collections.filter( collection => collection.fractions.length > 1 );
    // The Java code used collections with more than one denominator whenever possible
    if ( filteredCollections.length ) {
      collections = filteredCollections;
    }
    collections = collections.slice( 0, quantity );

    return sample( collections ).unitFractions;
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
  static simpleSplitFractions( fractions, options ) {
    options = merge( {
      // {number} - Up to how many fractions to split
      quantity: Number.POSITIVE_INFINITY,

      // {number} - The maximum denominator to consider for a split (any larger denominators will be ignored)
      maxDenominator: 4,

      // {Array.<Array.<Fraction>>} - Partitions that add up to 1, in a distribution that will evenly create denominators
      splits: [
        [
          new Fraction( 1, 2 ),
          new Fraction( 1, 2 )
        ],
        [
          new Fraction( 1, 2 ),
          new Fraction( 1, 2 )
        ],
        [
          new Fraction( 1, 2 ),
          new Fraction( 1, 2 )
        ],
        [
          new Fraction( 1, 3 ),
          new Fraction( 1, 3 ),
          new Fraction( 1, 3 )
        ],
        [
          new Fraction( 1, 3 ),
          new Fraction( 1, 3 ),
          new Fraction( 1, 3 )
        ]
      ]
    }, options );

    // Make a copy of all fractions, so we have unique instances (for down below)
    fractions = fractions.map( f => f.copy() );

    const availableFractions = fractions.filter( f => f.denominator <= options.maxDenominator );
    const fractionsToChange = choose( Math.min( options.quantity, availableFractions.length ), availableFractions );
    const otherFractions = arrayDifference( fractions, fractionsToChange );

    return [
      ..._.flatten( fractionsToChange.map( fraction => {
        const availableSplits = options.splits.filter( splitFractions => _.every( splitFractions, splitFraction => {
          return splitFraction.denominator * fraction.denominator <= 8;
        } ) );
        return sample( availableSplits ).map( f => f.times( fraction ) );
      } ) ),
      ...otherFractions
    ];
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
  static fractions( numerators, denominators, predicate = _.constant( true ) ) {
    return _.flatten( numerators.map( numerator => {
      return denominators.map( denominator => {
        return new Fraction( numerator, denominator );
      } ).filter( predicate );
    } ) );
  }

  /**
   * Returns a list of numbers required exactly for the given fractions (for number challenges).
   * @public
   *
   * @param {Array.<Fraction>}
   * @returns {Array.<number>}
   */
  static exactNumbers( fractions ) {
    return _.flatten( fractions.map( fraction => [
      fraction.numerator,
      fraction.denominator
    ] ) ).filter( _.identity );
  }

  /**
   * Returns a list of numbers required exactly for the given fractions (for number challenges).
   * @public
   *
   * @param {Array.<Fraction>}
   * @returns {Array.<number>}
   */
  static exactMixedNumbers( fractions ) {
    return _.flatten( fractions.map( fraction => {
      const whole = Math.floor( fraction.value );
      fraction = fraction.minus( new Fraction( whole, 1 ) );
      return [
        whole,
        fraction.numerator,
        fraction.denominator
      ];
    } ) ).filter( _.identity );
  }

  /**
   * Returns a multiplied version of the fraction (equal to the same value, but larger numerator and denominator).
   * @private
   *
   * @param {Fraction} fraction
   * @returns {Fraction}
   */
  static multiplyFraction( fraction ) {
    const multiplier = sample( fraction.denominator <= 4 ? ( fraction.denominator <= 3 ? [ 2, 3 ] : [ 2 ] ) : [ 1 ] );
    return new Fraction(
      fraction.numerator * multiplier,
      fraction.denominator * multiplier
    );
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
  static multipliedNumbers( fractions, separateWhole ) {
    return _.flatten( fractions.map( fraction => {
      const result = [];

      // Add the whole part (if applicable)
      if ( separateWhole ) {
        const whole = Math.floor( fraction.value );
        if ( whole > 0 ) {
          result.push( whole );
          fraction = fraction.minus( new Fraction( whole, 1 ) );
        }
      }

      // Add the numerator/denominator
      const multiplier = sample( fraction.denominator <= 4 ? ( fraction.denominator <= 3 ? [ 2, 3 ] : [ 2 ] ) : [ 1 ] );
      result.push( fraction.numerator * multiplier );
      result.push( fraction.denominator * multiplier );

      return result;
    } ) ).filter( _.identity );
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
  static withMultipliedNumbers( fractions, quantity, separateWhole ) {
    assert && assert( typeof separateWhole === 'boolean' );

    let breakable = shuffle( splittable( fractions ) );
    let unbreakable = notSplittable( fractions );

    // TODO: see decision on https://github.com/phetsims/fractions-common/issues/8, what to do if we lack the
    // number of breakable bits?
    // assert && assert( breakable.length >= quantity );

    // Reshape the arrays so that we have at most `quantity` in breakable (we'll multiply those)
    if ( breakable.length > quantity ) {
      unbreakable = [
        ...unbreakable,
        ...breakable.slice( quantity )
      ];
      breakable = breakable.slice( 0, quantity );
    }

    return [
      ...( separateWhole ? FractionLevel.exactMixedNumbers( unbreakable ) : FractionLevel.exactNumbers( unbreakable ) ),
      ...FractionLevel.multipliedNumbers( breakable, separateWhole )
    ];
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
  static targetsFromFractions( shapePartitions, fractions, colors, fillType, allowSubdivision = false ) {
    colors = shuffle( colors );
    return fractions.map( ( fraction, index ) => {
      const potentialPartitions = allowSubdivision
                                  ? ShapePartition.supportsDivisibleDenominator( shapePartitions, fraction.denominator )
                                  : ShapePartition.supportsDenominator( shapePartitions, fraction.denominator );
      const concreteFillType = fillType ? fillType : sample( [
        FillType.SEQUENTIAL,
        FillType.MIXED
      ] );

      return ShapeTarget.fill( sample( potentialPartitions ), fraction, colors[ index ], concreteFillType );
    } );
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
  static targetsFromPartitions( shapePartitions, colors, denominatorToNumerator, fillType ) {
    colors = shuffle( colors );
    return shapePartitions.map( ( shapePartition, index ) => {
      const denominator = shapePartition.length;
      const concreteFillType = fillType ? fillType : sample( [
        FillType.SEQUENTIAL,
        FillType.MIXED
      ] );
      return ShapeTarget.fill( shapePartition, new Fraction( denominatorToNumerator( denominator ), denominator ), colors[ index ], concreteFillType );
    } );
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
  static difficultSplit( fraction, maxNonzeroCount = 5 ) {
    const wholeCount = Math.ceil( fraction.value );
    const fullWholeCount = Math.floor( fraction.value );
    const remainder = fraction.minusInteger( Math.floor( fraction.value ) );

    // Need to filter the collections so we don't end up needing too many whole sections
    const collections = shuffle( collectionFinder8.search( fraction, {
      maxNonzeroCount: maxNonzeroCount,
      maxTotalQuantity: fullWholeCount + remainder.numerator + 5,
      maxQuantity: Math.max( fraction.denominator - 1, 4 )
    } ) );

    // Because of performance, just grab up to the first 40 legal collections
    const legalCollections = [];
    for ( let i = 0; i < collections.length; i++ ) {
      const collection = collections[ i ];
      const compactRequiredGroups = collection.getCompactRequiredGroups( wholeCount, wholeCount );
      if ( compactRequiredGroups !== null && compactRequiredGroups.length <= wholeCount ) {
        legalCollections.push( collection );
      }
      if ( legalCollections.length === 40 ) {
        break;
      }
    }

    const maxNondivisible = _.max( legalCollections.map( collection => collection.nondivisibleCount ) );

    // Don't always force the "most difficult" since that might be one or two options.
    const difficultCollections = legalCollections.filter( collection => collection.nondivisibleCount >= maxNondivisible - 1 );
    const collection = sample( difficultCollections );

    // Break apart wholes
    return FractionLevel.simpleSplitFractions( collection.unitFractions, {
      maxDenominator: 1
    } );
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
  static difficultMixedShapeTarget( shapePartitions, fraction, color ) {
    const wholeCount = Math.ceil( fraction.value );

    // Need to filter the collections so we don't end up needing too many whole sections
    const collections = collectionFinder9.search( fraction, {
      maxNonzeroCount: 4
    } ).filter( collection => _.sum( collection.fractions.map( f => Math.ceil( f.value ) ) ) <= wholeCount );

    const maxNondivisible = _.max( collections.map( collection => collection.nondivisibleCount ) );
    // Don't always force the "most difficult" since that might be one or two options.
    const difficultCollections = collections.filter( collection => collection.nondivisibleCount >= maxNondivisible - 1 );
    const collection = sample( difficultCollections );

    return new ShapeTarget( fraction, shuffle( _.flatten( collection.fractions.map( subFraction => {
      const shapePartition = sample( ShapePartition.supportsDenominator( shapePartitions, subFraction.denominator ) );
      return FilledPartition.randomFill( shapePartition, subFraction, color );
    } ) ) ) );
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
  static level1Shapes( levelNumber, color ) {
    const targetFractions = shuffle( [
      ...choose( 1, [
        new Fraction( 1, 1 ),
        new Fraction( 2, 2 ),
        new Fraction( 3, 3 )
      ] ),
      ...choose( 2, [
        new Fraction( 1, 2 ),
        new Fraction( 1, 3 ),
        new Fraction( 2, 3 )
      ] )
    ] );

    const pieceFractions = [
      ...repeat( 2, new Fraction( 1, 1 ) ),
      ...repeat( 2, new Fraction( 1, 2 ) ),
      ...repeat( 3, new Fraction( 1, 3 ) )
    ];

    return FractionChallenge.createShapeChallenge( levelNumber, false, color, targetFractions, pieceFractions );
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
  static level2Shapes( levelNumber, color ) {
    const targetFractions = chooseSplittable( 3, [
      new Fraction( 1, 2 ),
      new Fraction( 1, 3 ),
      new Fraction( 1, 4 ),
      new Fraction( 1, 5 ),
      new Fraction( 2, 3 ),
      new Fraction( 2, 4 ),
      new Fraction( 2, 5 ),
      new Fraction( 3, 4 ),
      new Fraction( 3, 5 ),
      new Fraction( 4, 5 )
    ] );

    const pieceFractions = [
      ...FractionLevel.unitFractions( targetFractions ),
      ...FractionLevel.interestingFractions( sample( splittable( targetFractions ) ) )
    ];

    return FractionChallenge.createShapeChallenge( levelNumber, false, color, targetFractions, pieceFractions );
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
  static level3Shapes( levelNumber, color ) {
    const targetFractions = chooseSplittable( 3, _.flatten( inclusive( 1, 6 ).map( d => {
      return inclusive( 1, d ).map( n => new Fraction( n, d ) );
    } ) ) );

    const pieceFractions = [
      ...FractionLevel.unitFractions( targetFractions.map( f => f.value === 1 ? Fraction.ONE : f ) ),
      ..._.flatten( targetFractions.map( f => FractionLevel.interestingFractions( f, 2 ) ) )
    ];

    return FractionChallenge.createShapeChallenge( levelNumber, false, color, targetFractions, pieceFractions );
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
  static level4Shapes( levelNumber, color ) {
    let targetFractions;
    let pieceFractions;

    if ( nextBoolean() ) {
      // Java wholesLevel4
      targetFractions = repeat( 3, new Fraction( 1, 1 ) );
      pieceFractions = [
        ...repeat( 3, new Fraction( 1, 2 ) ),
        ...repeat( 3, new Fraction( 1, 3 ) ),
        ...repeat( 3, new Fraction( 1, 4 ) ),
        ...repeat( 3, new Fraction( 1, 6 ) )
      ];
    }
    else {
      // Java halfLevel4, but custom-modified to have the constraint satisfied
      targetFractions = repeat( 3, new Fraction( 1, 2 ) );
      pieceFractions = [
        new Fraction( 1, 2 ),
        ...repeat( 3, new Fraction( 1, 3 ) ),
        ...repeat( 3, new Fraction( 1, 4 ) ),
        ...repeat( 2, new Fraction( 1, 6 ) )
      ];
    }

    return FractionChallenge.createShapeChallenge( levelNumber, false, color, targetFractions, pieceFractions );
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
  static level5Shapes( levelNumber, color ) {
    const targetFractions = choose( 3, inclusive( 1, 8 ) ).map( denominator => {
      return new Fraction( nextIntBetween( 1, denominator ), denominator );
    } );
    const pieceFractions = FractionLevel.unitFractions( targetFractions );

    return FractionChallenge.createShapeChallenge( levelNumber, false, color, targetFractions, pieceFractions );
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
  static level6Shapes( levelNumber, color ) {
    while ( true ) { // eslint-disable-line no-constant-condition

      // Java doc:
      //let's implement this my making each solution as na + mb, where a and b are the fractions from pairs above

      const cardSizes = sample( [ [ 2, 3 ], [ 2, 4 ], [ 3, 4 ], [ 2, 6 ], [ 3, 6 ], [ 4, 8 ], [ 2, 8 ] ] );
      const selectedCoefficients = choose( 4, [ [ 0, 1 ], [ 1, 0 ], [ 1, 1 ], [ 1, 2 ], [ 2, 1 ], [ 2, 2 ], [ 3, 1 ], [ 1, 3 ] ] );

      const targetFractions = selectedCoefficients.map( ( [ n, m ] ) => {
        return new Fraction( n, cardSizes[ 0 ] ).plus( new Fraction( m, cardSizes[ 1 ] ) ).reduced();
      } );
      if ( _.some( targetFractions, f => Fraction.ONE.isLessThan( f ) ) ) {
        continue;
      }

      const pieceFractions = _.flatten( selectedCoefficients.map( ( [ n, m ] ) => {
        return [
          ...repeat( n, new Fraction( 1, cardSizes[ 0 ] ) ),
          ...repeat( m, new Fraction( 1, cardSizes[ 1 ] ) )
        ];
      } ) );

      return FractionChallenge.createShapeChallenge( levelNumber, false, color, targetFractions, pieceFractions );
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
  static level7Shapes( levelNumber, color ) {
    const selected = choose( 2, [
      new Fraction( 1, 2 ),
      new Fraction( 1, 3 ),
      new Fraction( 2, 3 ),
      new Fraction( 1, 4 ),
      new Fraction( 3, 4 ),
      new Fraction( 5, 6 ),
      new Fraction( 3, 8 ),
      new Fraction( 5, 8 )
    ] );

    const targetFractions = [
      selected[ 0 ],
      selected[ 0 ],
      selected[ 1 ],
      selected[ 1 ]
    ];

    const pieceFractions = _.flatten( _.flatten( [
      choose( 2, collectionFinder8.search( selected[ 0 ], {
        maxQuantity: 8
      } ) ),
      choose( 2, collectionFinder8.search( selected[ 1 ], {
        maxQuantity: 8
      } ) )
    ] ).map( collection => collection.unitFractions ) );

    return FractionChallenge.createShapeChallenge( levelNumber, false, color, targetFractions, pieceFractions );
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
  static level8Shapes( levelNumber, color ) {
    const targetFractions = shuffle( [
      ...choose( 2, [ new Fraction( 3, 2 ), new Fraction( 4, 2 ), new Fraction( 5, 4 ), new Fraction( 7, 4 ) ] ),
      ...choose( 2, [ new Fraction( 2, 3 ), new Fraction( 3, 4 ), new Fraction( 2, 5 ), new Fraction( 3, 5 ), new Fraction( 4, 5 ) ] )
    ] );

    const pieceFractions = FractionLevel.straightforwardFractions( targetFractions );

    return FractionChallenge.createShapeChallenge( levelNumber, false, color, targetFractions, pieceFractions );
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
  static level9Shapes( levelNumber, color ) {
    const targetFractions = shuffle( [
      ...choose( 2, [ new Fraction( 3, 2 ), new Fraction( 4, 2 ), new Fraction( 5, 4 ), new Fraction( 7, 4 ) ] ),
      ...choose( 2, [ new Fraction( 2, 3 ), new Fraction( 3, 4 ), new Fraction( 2, 5 ), new Fraction( 3, 5 ), new Fraction( 4, 5 ) ] )
    ] );

    const pieceFractions = [
      ...FractionLevel.simpleSplitFractions( FractionLevel.straightforwardFractions( targetFractions.slice( 0, 2 ) ), {
        maxDenominator: 1
      } ),
      ...FractionLevel.difficultSplit( targetFractions[ 2 ] ),
      ...FractionLevel.difficultSplit( targetFractions[ 3 ] )
    ];

    return FractionChallenge.createShapeChallenge( levelNumber, false, color, shuffle( targetFractions ), pieceFractions );
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
  static level10Shapes( levelNumber, color ) {
    const fractions = choose( 2, [
      new Fraction( 3, 2 ),
      new Fraction( 4, 3 ), new Fraction( 5, 3 ),
      new Fraction( 5, 4 ), new Fraction( 7, 4 ),
      new Fraction( 6, 5 ), new Fraction( 7, 5 ), new Fraction( 8, 5 ), new Fraction( 9, 5 ),
      new Fraction( 7, 6 )
    ] );
    const targetFractions = [ fractions[ 0 ], fractions[ 0 ], fractions[ 1 ], fractions[ 1 ] ];

    const pieceFractions = _.flatten( targetFractions.map( f => FractionLevel.difficultSplit( f ) ) );

    return FractionChallenge.createShapeChallenge( levelNumber, false, color, targetFractions, pieceFractions );
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
  static level1ShapesMixed( levelNumber, color ) {
    const targetFractions = shuffle( [
      new Fraction( 3, 2 ),
      new Fraction( 5, 2 ),
      new Fraction( 9, 4 )
    ] );
    const pieceFractions = [
      ...FractionLevel.straightforwardFractions( targetFractions ),
      new Fraction( 1, 1 ),
      new Fraction( 1, 2 ),
      new Fraction( 1, 2 ),
      new Fraction( 1, 4 )
    ];
    return FractionChallenge.createShapeChallenge( levelNumber, true, color, targetFractions, pieceFractions );
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
  static level2ShapesMixed( levelNumber, color ) {
    const targetFractions = choose( 3, _.flatten( inclusive( 1, 2 ).map( whole => {
      return [
        new Fraction( 1, 2 ),
        new Fraction( 1, 3 ),
        new Fraction( 2, 3 ),
        new Fraction( 1, 4 ),
        new Fraction( 3, 4 )
      ].map( f => f.plusInteger( whole ) );
    } ) ) );
    const pieceFractions = [
      ...FractionLevel.straightforwardFractions( targetFractions ),
      ..._.flatten( choose( 2, [
        [
          new Fraction( 1, 1 )
        ],
        [
          new Fraction( 1, 2 ),
          new Fraction( 1, 2 )
        ],
        [
          new Fraction( 1, 3 ),
          new Fraction( 1, 3 ),
          new Fraction( 1, 3 )
        ],
        [
          new Fraction( 1, 4 ),
          new Fraction( 1, 4 )
        ]
      ] ) )
    ];
    return FractionChallenge.createShapeChallenge( levelNumber, true, color, targetFractions, pieceFractions );
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
  static level3ShapesMixed( levelNumber, color ) {
    const targetFractions = choose( 3, _.flatten( inclusive( 1, 3 ).map( whole => {
      return [
        new Fraction( 1, 2 ),
        new Fraction( 1, 3 ),
        new Fraction( 2, 3 ),
        new Fraction( 1, 4 ),
        new Fraction( 3, 4 ),
        new Fraction( 1, 6 ),
        new Fraction( 5, 6 )
      ].map( f => f.plusInteger( whole ) );
    } ) ) );
    const pieceFractions = [
      ...FractionLevel.straightforwardFractions( targetFractions ),
      ...FractionLevel.interestingFractions( sample( targetFractions ) )
    ];
    return FractionChallenge.createShapeChallenge( levelNumber, true, color, targetFractions, pieceFractions );
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
  static level4ShapesMixed( levelNumber, color ) {
    const fraction = sample( _.flatten( inclusive( 1, 3 ).map( whole => {
      return [
        new Fraction( 1, 2 ),
        new Fraction( 1, 3 ),
        new Fraction( 2, 3 ),
        new Fraction( 1, 4 ),
        new Fraction( 3, 4 )
      ].map( f => f.plusInteger( whole ) );
    } ) ) );

    const targetFractions = [
      fraction.copy(),
      fraction.copy(),
      fraction.copy()
    ];

    const pieceFractions = FractionLevel.simpleSplitFractions( FractionLevel.straightforwardFractions( targetFractions ), {
      maxDenominator: 1,
      quantity: Math.floor( fraction.value ) * 3 - 2
    } );

    return FractionChallenge.createShapeChallenge( levelNumber, true, color, targetFractions, pieceFractions );
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
  static level5ShapesMixed( levelNumber, color ) {
    const targetFractions = chooseSplittable( 3, _.flatten( inclusive( 1, 3 ).map( whole => {
      return [
        new Fraction( 1, 2 ),
        new Fraction( 1, 3 ),
        new Fraction( 2, 3 ),
        new Fraction( 1, 4 ),
        new Fraction( 3, 4 ),
        new Fraction( 1, 5 ),
        new Fraction( 2, 5 ),
        new Fraction( 3, 5 ),
        new Fraction( 4, 5 ),
        new Fraction( 1, 6 ),
        new Fraction( 5, 6 ),
        new Fraction( 1, 7 ),
        new Fraction( 2, 7 ),
        new Fraction( 3, 7 ),
        new Fraction( 4, 7 ),
        new Fraction( 5, 7 ),
        new Fraction( 6, 7 ),
        new Fraction( 1, 8 ),
        new Fraction( 3, 8 ),
        new Fraction( 5, 8 ),
        new Fraction( 7, 8 )
      ].map( f => f.plusInteger( whole ) );
    } ) ) );

    const pieceFractions = [
      ...FractionLevel.simpleSplitFractions( FractionLevel.straightforwardFractions( targetFractions ), {
        quantity: 5
      } ),
      ...FractionLevel.interestingFractions( sample( splittable( targetFractions ) ), 3 )
    ];

    return FractionChallenge.createShapeChallenge( levelNumber, true, color, targetFractions, pieceFractions );
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
  static level6ShapesMixed( levelNumber, color ) {
    const fractionPortion = sample( [
      [
        new Fraction( 1, 2 ),
        new Fraction( 1, 3 ),
        new Fraction( 2, 3 ),
        new Fraction( 1, 6 ),
        new Fraction( 5, 6 )
      ], [
        new Fraction( 1, 2 ),
        new Fraction( 1, 4 ),
        new Fraction( 3, 4 ),
        new Fraction( 1, 8 ),
        new Fraction( 3, 8 ),
        new Fraction( 5, 8 ),
        new Fraction( 7, 8 )
      ]
    ] );

    const targetFractions = choose( 4, _.flatten( inclusive( 1, 3 ).map( whole => {
      return fractionPortion.map( f => f.plusInteger( whole ) );
    } ) ) );
    const pieceFractions = FractionLevel.minimizedFractions( targetFractions );

    return FractionChallenge.createShapeChallenge( levelNumber, true, color, targetFractions, pieceFractions );
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
  static level7ShapesMixed( levelNumber, color ) {
    const baseFractions = choose( 2, _.flatten( inclusive( 1, 3 ).map( whole => {
      return [
        new Fraction( 1, 2 ),
        new Fraction( 1, 3 ),
        new Fraction( 2, 3 ),
        new Fraction( 1, 4 ),
        new Fraction( 3, 4 ),
        new Fraction( 1, 6 ),
        new Fraction( 5, 6 ),
        new Fraction( 1, 8 ),
        new Fraction( 3, 8 ),
        new Fraction( 5, 8 ),
        new Fraction( 7, 8 )
      ].map( f => f.plusInteger( whole ) );
    } ) ) );

    const topFraction = baseFractions[ 0 ];
    const bottomFraction = baseFractions[ 1 ];

    const topFractions = repeat( 2, topFraction );
    const bottomFractions = repeat( 2, bottomFraction );
    const targetFractions = [
      ...topFractions,
      ...bottomFractions
    ];

    const pieceFractions = [
      ...FractionLevel.difficultSplit( topFraction ),
      ...FractionLevel.difficultSplit( bottomFraction ),
      ...FractionLevel.straightforwardFractions( [ topFraction, bottomFraction ] )
    ];

    return FractionChallenge.createShapeChallenge( levelNumber, true, color, targetFractions, pieceFractions );
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
  static level8ShapesMixed( levelNumber, color ) {
    const targetFractions = chooseSplittable( 4, _.flatten( inclusive( 1, 3 ).map( whole => {
      return [
        new Fraction( 1, 2 ),
        new Fraction( 1, 3 ),
        new Fraction( 2, 3 ),
        new Fraction( 1, 4 ),
        new Fraction( 3, 4 ),
        new Fraction( 1, 5 ),
        new Fraction( 2, 5 ),
        new Fraction( 3, 5 ),
        new Fraction( 4, 5 ),
        new Fraction( 1, 6 ),
        new Fraction( 5, 6 )
      ].map( f => f.plusInteger( whole ) );
    } ) ), 2 );

    const pieceFractions = [
      ..._.flatten( targetFractions.slice( 0, 2 ).map( f => FractionLevel.difficultSplit( f ) ) ),
      ...FractionLevel.straightforwardFractions( targetFractions.slice( 2 ) )
    ];

    return FractionChallenge.createShapeChallenge( levelNumber, true, color, targetFractions, pieceFractions );
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
  static level9ShapesMixed( levelNumber, color ) {
    const targetFractions = choose( 4, _.flatten( inclusive( 1, 3 ).map( whole => {
      return [
        new Fraction( 1, 2 ),
        new Fraction( 1, 3 ),
        new Fraction( 2, 3 ),
        new Fraction( 1, 4 ),
        new Fraction( 3, 4 ),
        new Fraction( 1, 5 ),
        new Fraction( 2, 5 ),
        new Fraction( 3, 5 ),
        new Fraction( 4, 5 ),
        new Fraction( 1, 6 ),
        new Fraction( 5, 6 )
      ].map( f => f.plusInteger( whole ) );
    } ) ) );

    const pieceFractions = _.flatten( targetFractions.map( f => FractionLevel.difficultSplit( f ) ) );

    return FractionChallenge.createShapeChallenge( levelNumber, true, color, targetFractions, pieceFractions );
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
  static level10ShapesMixed( levelNumber, color ) {
    const targetFractions = choose( 4, _.flatten( inclusive( 1, 3 ).map( whole => {
      return [
        new Fraction( 1, 2 ),
        new Fraction( 1, 3 ),
        new Fraction( 2, 3 ),
        new Fraction( 1, 4 ),
        new Fraction( 3, 4 ),
        new Fraction( 1, 6 ),
        new Fraction( 5, 6 ),
        new Fraction( 1, 8 ),
        new Fraction( 3, 8 ),
        new Fraction( 5, 8 ),
        new Fraction( 7, 8 )
      ].map( f => f.plusInteger( whole ) );
    } ) ) );

    const pieceFractions = _.flatten( targetFractions.map( f => FractionLevel.difficultSplit( f ) ) );

    return FractionChallenge.createShapeChallenge( levelNumber, true, color, targetFractions, pieceFractions );
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
  static level1Numbers( levelNumber ) {
    const targetFractions = shuffle( [
      new Fraction( 1, 2 ),
      new Fraction( 1, 3 ),
      new Fraction( 2, 3 )
    ] );
    const pieceNumbers = FractionLevel.exactNumbers( targetFractions );
    const shapeTargets = FractionLevel.targetsFromFractions( ShapePartition.PIES, targetFractions, COLORS_3, FillType.SEQUENTIAL );

    return FractionChallenge.createNumberChallenge( levelNumber, false, shapeTargets, pieceNumbers );
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
  static level2Numbers( levelNumber ) {
    const shapePartitions = sample( [
      ShapePartition.PIES,
      ShapePartition.HORIZONTAL_BARS,
      ShapePartition.VERTICAL_BARS
    ] );

    const targetFractions = choose( 3, FractionLevel.fractions( inclusive( 1, 4 ), inclusive( 2, 5 ), f => f.isLessThan( Fraction.ONE ) ) );
    const pieceNumbers = FractionLevel.exactNumbers( targetFractions );
    const shapeTargets = FractionLevel.targetsFromFractions( shapePartitions, targetFractions, COLORS_3, FillType.SEQUENTIAL );

    return FractionChallenge.createNumberChallenge( levelNumber, false, shapeTargets, pieceNumbers );
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
  static level3Numbers( levelNumber ) {
    const shapePartitions = [
      ShapePartition.SIX_FLOWER
    ];

    const numerators = choose( 3, inclusive( 1, 5 ) );
    const targetFractions = numerators.map( n => new Fraction( n, 6 ) );
    const pieceNumbers = [
      ...FractionLevel.exactNumbers( targetFractions ),
      ...FractionLevel.multipliedNumbers( choose( 2, targetFractions ), false )
    ];
    const shapeTargets = FractionLevel.targetsFromFractions( shapePartitions, targetFractions, COLORS_3, FillType.SEQUENTIAL );

    return FractionChallenge.createNumberChallenge( levelNumber, false, shapeTargets, pieceNumbers );
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
  static level4Numbers( levelNumber ) {
    const shapePartitions = ShapePartition.PYRAMIDS;
    const targetFractions = [
      new Fraction( 1, 1 ),
      new Fraction( sample( inclusive( 1, 4 ) ), 4 ),
      new Fraction( sample( inclusive( 1, 9 ) ), 9 )
    ];
    const pieceNumbers = FractionLevel.exactNumbers( targetFractions );
    const shapeTargets = FractionLevel.targetsFromFractions( shapePartitions, targetFractions, COLORS_3, FillType.SEQUENTIAL );

    return FractionChallenge.createNumberChallenge( levelNumber, false, shapeTargets, pieceNumbers );
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
  static level5Numbers( levelNumber ) {
    const shapeTargets = FractionLevel.targetsFromPartitions(
      choose( 3, ShapePartition.LIMITED_9_GAME_PARTITIONS.filter( partition => partition.length > 1 ) ),
      COLORS_3, d => sample( inclusive( 1, d - 1 ) ), FillType.SEQUENTIAL
    );
    const pieceNumbers = FractionLevel.exactNumbers( shapeTargets.map( target => target.fraction ) );

    return FractionChallenge.createNumberChallenge( levelNumber, false, shapeTargets, pieceNumbers );
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
  static level6Numbers( levelNumber ) {
    const shapeTargets = FractionLevel.targetsFromPartitions( choose( 4, ShapePartition.LIMITED_9_GAME_PARTITIONS ), COLORS_4, d => sample( inclusive( 1, d ) ), null );
    const pieceNumbers = FractionLevel.withMultipliedNumbers( shapeTargets.map( target => target.fraction ), 2, false );

    return FractionChallenge.createNumberChallenge( levelNumber, false, shapeTargets, pieceNumbers );
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
  static level7Numbers( levelNumber ) {
    const baseFractions = choose( 2, [
      [
        new Fraction( 1, 2 ),
        new Fraction( 2, 4 ),
        new Fraction( 3, 6 )
      ],
      [
        new Fraction( 1, 3 ),
        new Fraction( 2, 6 ),
        new Fraction( 3, 9 )
      ],
      [
        new Fraction( 2, 3 ),
        new Fraction( 4, 6 ),
        new Fraction( 6, 9 )
      ],
      [
        new Fraction( 1, 4 ),
        new Fraction( 2, 8 )
      ],
      [
        new Fraction( 3, 4 ),
        new Fraction( 6, 8 )
      ]
    ] ).map( fractions => choose( 2, fractions ) );
    const smallFractions = baseFractions.map( fractions => _.minBy( fractions, 'denominator' ) );

    const shapePartitionChoices = choose( 2, [
      ShapePartition.PIES,
      ShapePartition.HORIZONTAL_BARS,
      ShapePartition.VERTICAL_BARS
    ] );

    const colors = shuffle( COLORS_4 );

    const pieceNumbers = FractionLevel.exactNumbers( _.flatten( baseFractions ) );

    const shapeTargets = inclusive( 0, 3 ).map( index => {
      const mainIndex = index < 2 ? 0 : 1;
      const smallFraction = smallFractions[ mainIndex ].reduced();
      return ShapeTarget.fill( sample( ShapePartition.supportsDenominator( shapePartitionChoices[ mainIndex ], smallFraction.denominator ) ),
        smallFraction,
        colors[ index ],
        FillType.SEQUENTIAL );
    } );

    return FractionChallenge.createNumberChallenge( levelNumber, false, shapeTargets, pieceNumbers );
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
  static level8Numbers( levelNumber ) {
    const fractions = shuffle( sample( [
      [
        new Fraction( 2, 3 ),
        new Fraction( 3, 2 ),
        new Fraction( 2, 2 ),
        new Fraction( 3, 3 )
      ],
      [
        new Fraction( 2, 4 ),
        new Fraction( 4, 2 ),
        new Fraction( 2, 2 ),
        new Fraction( 4, 4 )
      ],
      [
        new Fraction( 3, 4 ),
        new Fraction( 4, 3 ),
        new Fraction( 3, 3 ),
        new Fraction( 4, 4 )
      ],
      [
        new Fraction( 3, 5 ),
        new Fraction( 5, 3 ),
        new Fraction( 3, 3 ),
        new Fraction( 5, 5 )
      ],
      [
        new Fraction( 3, 6 ),
        new Fraction( 6, 3 ),
        new Fraction( 3, 3 ),
        new Fraction( 6, 6 )
      ]
    ] ) );

    const shapeTargets = FractionLevel.targetsFromFractions( _.flatten( ShapePartition.UNIVERSAL_PARTITIONS ), fractions, COLORS_4, FillType.SEQUENTIAL );
    const pieceNumbers = FractionLevel.exactNumbers( fractions );

    return FractionChallenge.createNumberChallenge( levelNumber, false, shapeTargets, pieceNumbers );
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
  static level9Numbers( levelNumber ) {
    const shapeTargets = FractionLevel.targetsFromPartitions( choose( 4, ShapePartition.LIMITED_9_GAME_PARTITIONS ), COLORS_4, d => sample( inclusive( 1, 2 * d ) ), FillType.MIXED );
    const pieceNumbers = FractionLevel.exactNumbers( shapeTargets.map( target => target.fraction ) );

    return FractionChallenge.createNumberChallenge( levelNumber, false, shapeTargets, pieceNumbers );
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
  static level10Numbers( levelNumber ) {
    const shapeTargets = FractionLevel.targetsFromPartitions(
      choose( 4, ShapePartition.LIMITED_9_GAME_PARTITIONS ),
      COLORS_4, d => sample( inclusive( 1, 2 * d ) ), FillType.MIXED
    );
    const pieceNumbers = FractionLevel.withMultipliedNumbers( shapeTargets.map( target => target.fraction ), 2, false );

    return FractionChallenge.createNumberChallenge( levelNumber, false, shapeTargets, pieceNumbers );
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
  static level1NumbersMixed( levelNumber ) {
    const fractions = shuffle( [
      new Fraction( 3, 2 ),
      new Fraction( 5, 2 ),
      new Fraction( 13, 4 )
    ] );
    const shapeTargets = FractionLevel.targetsFromFractions( ShapePartition.PIES, fractions, COLORS_3, FillType.SEQUENTIAL );
    const pieceNumbers = FractionLevel.exactMixedNumbers( fractions );

    return FractionChallenge.createNumberChallenge( levelNumber, true, shapeTargets, pieceNumbers );
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
  static level2NumbersMixed( levelNumber ) {
    const fractions = choose( 3, expandableMixedNumbersFractions );
    const shapePartitions = sample( [
      ShapePartition.PIES,
      ShapePartition.HORIZONTAL_BARS
    ] );

    const shapeTargets = FractionLevel.targetsFromFractions( shapePartitions, fractions, COLORS_3, FillType.SEQUENTIAL );
    const pieceNumbers = FractionLevel.exactMixedNumbers( fractions );

    return FractionChallenge.createNumberChallenge( levelNumber, true, shapeTargets, pieceNumbers );
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
  static level3NumbersMixed( levelNumber ) {
    const fractions = choose( 3, _.flatten( inclusive( 1, 3 ).map( whole => {
      return [
        new Fraction( 1, 2 ),
        new Fraction( 1, 3 ),
        new Fraction( 2, 3 ),
        new Fraction( 1, 6 ),
        new Fraction( 5, 6 )
      ].map( f => f.plusInteger( whole ) );
    } ) ) );

    const shapeTargets = FractionLevel.targetsFromFractions( [ ShapePartition.SIX_FLOWER ], fractions, COLORS_3, FillType.SEQUENTIAL, true );
    const pieceNumbers = FractionLevel.exactMixedNumbers( fractions );

    return FractionChallenge.createNumberChallenge( levelNumber, true, shapeTargets, pieceNumbers );
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
  static level4NumbersMixed( levelNumber ) {
    const fractions = choose( 3, _.flatten( inclusive( 1, 3 ).map( whole => {
      return [
        new Fraction( 1, 2 ),
        new Fraction( 1, 3 ),
        new Fraction( 2, 3 ),
        new Fraction( 1, 4 ),
        new Fraction( 3, 4 ),
        new Fraction( 1, 9 ),
        new Fraction( 2, 9 ),
        new Fraction( 4, 9 ),
        new Fraction( 5, 9 ),
        new Fraction( 7, 9 ),
        new Fraction( 8, 9 )
      ].map( f => f.plusInteger( whole ) );
    } ) ) );

    const shapeTargets = FractionLevel.targetsFromFractions( ShapePartition.PYRAMIDS, fractions, COLORS_3, FillType.SEQUENTIAL, true );
    const pieceNumbers = FractionLevel.exactMixedNumbers( fractions );

    return FractionChallenge.createNumberChallenge( levelNumber, true, shapeTargets, pieceNumbers );
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
  static level5NumbersMixed( levelNumber ) {
    const fractions = chooseSplittable( 3, mixedNumbersFractions, 1 );
    const multipliedFractions = shuffle( [
      ...fractions.slice( 0, 1 ).map( FractionLevel.multiplyFraction ),
      ...fractions.slice( 1 )
    ] );

    const shapeTargets = FractionLevel.targetsFromFractions( ShapePartition.LIMITED_9_GAME_PARTITIONS, multipliedFractions, COLORS_3, FillType.SEQUENTIAL, true );

    const pieceNumbers = FractionLevel.exactMixedNumbers( fractions );

    return FractionChallenge.createNumberChallenge( levelNumber, true, shapeTargets, pieceNumbers );
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
  static level6NumbersMixed( levelNumber ) {
    const fractions = chooseSplittable( 4, mixedNumbersFractions, 2 );
    const multipliedFractions = shuffle( [
      ...fractions.slice( 0, 2 ).map( FractionLevel.multiplyFraction ),
      ...fractions.slice( 2 )
    ] );

    const shapeTargets = FractionLevel.targetsFromFractions( ShapePartition.LIMITED_9_GAME_PARTITIONS, multipliedFractions, COLORS_4, FillType.MIXED, true );
    const pieceNumbers = FractionLevel.exactMixedNumbers( fractions );

    return FractionChallenge.createNumberChallenge( levelNumber, true, shapeTargets, pieceNumbers );
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
  static level7NumbersMixed( levelNumber ) {
    const baseFractions = choose( 2, expandableMixedNumbersFractions );
    const smallMultipliers = [
      new Fraction( 2, 2 )
    ];
    const multipliers = [
      new Fraction( 2, 2 ),
      new Fraction( 3, 3 )
    ];
    const fractions = [
      ...shuffle( [ baseFractions[ 0 ], baseFractions[ 0 ].times( sample( baseFractions[ 0 ].denominator >= 4 ? smallMultipliers : multipliers ) ) ] ),
      ...shuffle( [ baseFractions[ 1 ], baseFractions[ 1 ].times( sample( baseFractions[ 1 ].denominator >= 4 ? smallMultipliers : multipliers ) ) ] )
    ];

    const shapeTargets = FractionLevel.targetsFromFractions( ShapePartition.LIMITED_9_GAME_PARTITIONS, fractions, COLORS_4, FillType.SEQUENTIAL );
    const pieceNumbers = [
      ...FractionLevel.exactMixedNumbers( baseFractions ),
      ...FractionLevel.exactMixedNumbers( baseFractions )
    ];

    return FractionChallenge.createNumberChallenge( levelNumber, true, shapeTargets, pieceNumbers );
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
  static level8NumbersMixed( levelNumber ) {
    const unreducedFractions = choose( 4, _.flatten( inclusive( 1, 3 ).map( whole => {
      return [
        new Fraction( 2, 4 ),
        new Fraction( 3, 6 ),
        new Fraction( 4, 8 ),
        new Fraction( 2, 6 ),
        new Fraction( 3, 9 ),
        new Fraction( 4, 6 ),
        new Fraction( 6, 9 ),
        new Fraction( 2, 8 ),
        new Fraction( 6, 8 )
      ].map( f => f.plusInteger( whole ) );
    } ) ) );
    const fractions = unreducedFractions.map( f => f.reduced() );

    const shapeTargets = FractionLevel.targetsFromFractions( ShapePartition.LIMITED_9_GAME_PARTITIONS, unreducedFractions, COLORS_4, FillType.RANDOM, true );
    const pieceNumbers = FractionLevel.exactMixedNumbers( fractions );

    return FractionChallenge.createNumberChallenge( levelNumber, true, shapeTargets, pieceNumbers );
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
  static level9NumbersMixed( levelNumber ) {
    const fractions = choose( 4, allMixedNumberFractions );

    const shapeTargets = shuffle( fractions.map( ( fraction, index ) => {
      const color = COLORS_4[ index ];
      if ( index < 2 ) {
        const shapePartitions = sample( [
          ShapePartition.PIES,
          ShapePartition.EXTENDED_HORIZONTAL_BARS,
          ShapePartition.EXTENDED_VERTICAL_BARS,
          ShapePartition.EXTENDED_RECTANGULAR_BARS
        ] );
        return FractionLevel.difficultMixedShapeTarget( shapePartitions, fraction, color );
      }
      else {
        return ShapeTarget.randomFill( sample( ShapePartition.supportsDenominator( ShapePartition.LIMITED_9_GAME_PARTITIONS, fraction.denominator ) ), fraction, color );
      }
    } ) );
    const pieceNumbers = FractionLevel.exactMixedNumbers( fractions );

    return FractionChallenge.createNumberChallenge( levelNumber, true, shapeTargets, pieceNumbers );
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
  static level10NumbersMixed( levelNumber ) {
    const fractions = choose( 4, allMixedNumberFractions );
    const colors = shuffle( COLORS_4 );

    const shapeTargets = fractions.map( ( fraction, index ) => {
      const shapePartitions = sample( [
        ShapePartition.PIES,
        ShapePartition.EXTENDED_HORIZONTAL_BARS,
        ShapePartition.EXTENDED_VERTICAL_BARS,
        ShapePartition.EXTENDED_RECTANGULAR_BARS
      ] );
      return FractionLevel.difficultMixedShapeTarget( shapePartitions, fraction, colors[ index ] );
    } );
    const pieceNumbers = FractionLevel.multipliedNumbers( fractions, true );

    return FractionChallenge.createNumberChallenge( levelNumber, true, shapeTargets, pieceNumbers );
  }
}

fractionsCommon.register( 'FractionLevel', FractionLevel );
export default FractionLevel;