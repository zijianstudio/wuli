// Copyright 2014-2022, University of Colorado Boulder

/**
 * This is a factory pattern object that generates sets of challenges for use in
 * the balance game.  In this type, the terminology used to distinguish
 * between the various levels of difficulty for the challenges are (in order of
 * increasing difficulty):
 * - Simple
 * - Easy
 * - Moderate
 * - Advanced
 * This is not to be confused with the numerical game levels, since there is
 * not necessarily a direct correspondence between the numerical levels and
 * all of the challenges generated for that level.
 *
 * @author John Blanco
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import balancingAct from '../../balancingAct.js';
import BASharedConstants from '../../common/BASharedConstants.js';
import Barrel from '../../common/model/masses/Barrel.js';
import BigRock from '../../common/model/masses/BigRock.js';
import Boy from '../../common/model/masses/Boy.js';
import BrickStack from '../../common/model/masses/BrickStack.js';
import CinderBlock from '../../common/model/masses/CinderBlock.js';
import Crate from '../../common/model/masses/Crate.js';
import FireHydrant from '../../common/model/masses/FireHydrant.js';
import FlowerPot from '../../common/model/masses/FlowerPot.js';
import Girl from '../../common/model/masses/Girl.js';
import LargeBucket from '../../common/model/masses/LargeBucket.js';
import LargeTrashCan from '../../common/model/masses/LargeTrashCan.js';
import Man from '../../common/model/masses/Man.js';
import MediumBucket from '../../common/model/masses/MediumBucket.js';
import MediumRock from '../../common/model/masses/MediumRock.js';
import PottedPlant from '../../common/model/masses/PottedPlant.js';
import Puppy from '../../common/model/masses/Puppy.js';
import SmallBucket from '../../common/model/masses/SmallBucket.js';
import SmallRock from '../../common/model/masses/SmallRock.js';
import SodaBottle from '../../common/model/masses/SodaBottle.js';
import Television from '../../common/model/masses/Television.js';
import TinyRock from '../../common/model/masses/TinyRock.js';
import Tire from '../../common/model/masses/Tire.js';
import Woman from '../../common/model/masses/Woman.js';
import Plank from '../../common/model/Plank.js';
import BalanceMassesChallenge from './BalanceMassesChallenge.js';
import MassDeductionChallenge from './MassDeductionChallenge.js';
import TiltPredictionChallenge from './TiltPredictionChallenge.js';

// Maximum allowed distance from center of balance for positioning a mass.
const MAX_DISTANCE_FROM_BALANCE_CENTER_TO_MASS = ( Utils.roundSymmetric( Plank.LENGTH / Plank.INTER_SNAP_TO_MARKER_DISTANCE / 2 ) - 1 ) * Plank.INTER_SNAP_TO_MARKER_DISTANCE;

// Parameters that control how many attempts are made to generate a unique
// balance challenge.
const MAX_GEN_ATTEMPTS = 50;
const MAX_HALVING_OF_PAST_LIST = 3;

// List of masses that can be used on either side of the balance challenges
// or as the fixed masses in mass deduction challenges.
const BALANCE_CHALLENGE_MASSES = [
  new BrickStack( 1, Vector2.ZERO ),
  new BrickStack( 2, Vector2.ZERO ),
  new BrickStack( 3, Vector2.ZERO ),
  new BrickStack( 4, Vector2.ZERO ),
  new TinyRock( Vector2.ZERO, false ),
  new SmallRock( Vector2.ZERO, false ),
  new MediumRock( Vector2.ZERO, false ),
  new BigRock( Vector2.ZERO, false ),
  new Boy( Vector2.ZERO, false ),
  new Girl( Vector2.ZERO, false ),
  new Man( Vector2.ZERO, false ),
  new Woman( Vector2.ZERO, false ),
  new Barrel( Vector2.ZERO, false ),
  new CinderBlock( Vector2.ZERO, false ),
  new Puppy( Vector2.ZERO, false ),
  new SodaBottle( Vector2.ZERO, false ),
  new SmallBucket( Vector2.ZERO, false )
];

// List of masses that can be used as "mystery masses" in the mass
// deduction challenges.  These should not appear in other tabs, lest the
// user could already know their mass.
const MYSTERY_MASSES = [
  new FireHydrant( Vector2.ZERO, true ),
  new Television( Vector2.ZERO, true ),
  new LargeTrashCan( Vector2.ZERO, true ),
  new SmallRock( Vector2.ZERO, true ),
  new Crate( Vector2.ZERO, true ),
  new FlowerPot( Vector2.ZERO, true ),
  new MediumBucket( Vector2.ZERO, true ),
  new LargeBucket( Vector2.ZERO, true ),
  new PottedPlant( Vector2.ZERO, true ),
  new Tire( Vector2.ZERO, true )
];

// List of masses that are "low profile", meaning that they are short.
// This is needed for the tilt-prediction style of problem, since taller
// masses end up going behind the tilt prediction selector.
const LOW_PROFILE_MASSES = [
  new TinyRock( Vector2.ZERO, false ),
  new SmallRock( Vector2.ZERO, false ),
  new MediumRock( Vector2.ZERO, false ),
  new CinderBlock( Vector2.ZERO, false ),
  new SmallBucket( Vector2.ZERO, false )
];

// Lists used to keep track of the challenges generated so far so that we
// can avoid creating the same challenges multiple times.
const usedBalanceChallenges = [];
const usedMassDeductionChallenges = [];
const usedTiltPredictionChallenges = [];

const BalanceGameChallengeFactory = {

  // Generate a random integer from 0 (inclusive) to max (exclusive)
  randInt( max ) {
    return Math.floor( dotRandom.nextDouble() * max );
  },

  /**
   * Determine whether a challenge with the given values for the fixed and
   * movable masses and the given constraints on the plank can be solved.
   */
  isChallengeSolvable( fixedMassValue, movableMassValue, distanceIncrement, maxDistance ) {
    if ( fixedMassValue * distanceIncrement > movableMassValue * maxDistance || fixedMassValue * maxDistance < movableMassValue * distanceIncrement ) {
      // The balance is not long enough to allow these masses to be balanced.
      return false;
    }

    return ( fixedMassValue / movableMassValue ) % distanceIncrement <= BASharedConstants.COMPARISON_TOLERANCE;
  },

  chooseRandomValidFixedMassDistance( fixedMassValue, movableMassValue ) {
    const validFixedMassDistances = this.getPossibleDistanceList( fixedMassValue, movableMassValue );

    // Randomly choose a distance to use from the identified set.
    return -validFixedMassDistances[ this.randInt( validFixedMassDistances.length ) ];
  },

  /**
   * Take a list of masses and return a set of mass-distance pairs that
   * position the masses such that they are close to being balanced but are
   * NOT balanced.  This is a convenience method that was written to
   * consolidate some code written for generating tilt-prediction challenges.
   */
  positionMassesCloseToBalancing( minDistance, maxDistance, masses ) {
    let bestNetTorque = Number.POSITIVE_INFINITY;
    const minAcceptableTorque = 1; // Determined empirically.
    let distanceList = [];
    let bestDistanceList = distanceList;
    for ( let i = 0; i < MAX_GEN_ATTEMPTS; i++ ) {
      distanceList = [];
      // Generate a set of unique, random, and valid distances for the
      // placement of the masses.
      for ( let j = 0; distanceList.length < masses.length && j < MAX_GEN_ATTEMPTS; j++ ) {
        let candidateDistance = this.generateRandomValidPlankDistance( minDistance, maxDistance );
        if ( j === 0 ) {
          // Randomly invert (or don't) the first random distance.
          candidateDistance = dotRandom.nextDouble() >= 0.5 ? -candidateDistance : candidateDistance;
        }
        else {
          // Make the sign of this distance be the opposite of the
          // previous one.
          candidateDistance = distanceList[ distanceList.length - 1 ] > 0 ? -candidateDistance : candidateDistance;
        }
        // Check if unique.
        if ( distanceList.indexOf( candidateDistance ) === -1 ) {
          distanceList.push( candidateDistance );
        }
      }
      // Handle the unlikely case where enough unique distances couldn't
      // be found.
      if ( distanceList.length !== masses.length ) {
        distanceList = [];
        for ( let k = 0; k < masses.length; k++ ) {
          // Just add a linear set of distances.
          distanceList.push( minDistance + Plank.INTER_SNAP_TO_MARKER_DISTANCE * k );
          // Output a warning.
          console.log( ' Warning: Unable to find enough unique distances for positioning masses.' );
        }
      }
      // Calculate the net torque for this set of masses.
      let netTorque = 0;
      for ( let m = 0; m < masses.length; m++ ) {
        netTorque += masses[ m ].massValue * distanceList[ m ];
      }
      netTorque = Math.abs( netTorque );
      if ( netTorque < bestNetTorque && netTorque > minAcceptableTorque ) {
        bestNetTorque = netTorque;
        bestDistanceList = distanceList.slice( 0 );
      }
    }

    // Create the array of mass-distance pairs from the original set of
    // masses and the best randomly-generated distances.
    const repositionedMasses = [];
    for ( let i = 0; i < masses.length; i++ ) {
      repositionedMasses.push( { mass: masses[ i ], distance: bestDistanceList[ i ] } );
    }
    return repositionedMasses;
  },

  /**
   * Convenience function that generates a valid random distance from the
   * center of the plank.  The plank only allows discrete distances (i.e. it
   * is quantized), which is why this is needed.
   */
  generateRandomValidPlankDistance() {
    const maxDistance = Plank.LENGTH / 2;
    const increment = Plank.INTER_SNAP_TO_MARKER_DISTANCE;
    const maxIncrements = Utils.roundSymmetric( maxDistance / increment ) - 1;
    return ( this.randInt( maxIncrements ) + 1 ) * increment;
  },

  generateRandomValidPlankDistanceRange( minDistance, maxDistance ) {
    const minIncrements = Math.ceil( minDistance / Plank.INTER_SNAP_TO_MARKER_DISTANCE );
    const maxIncrements = Math.floor( maxDistance / Plank.INTER_SNAP_TO_MARKER_DISTANCE );

    return ( this.randInt( maxIncrements - minIncrements + 1 ) + minIncrements ) * Plank.INTER_SNAP_TO_MARKER_DISTANCE;
  },

  /**
   * Generate the list of solvable balance game challenges that can be
   * created from the given set of two fixed masses and one movable mass.
   */
  generateSolvableChallenges( fixedMass1Prototype, fixedMass2Prototype, movableMassPrototype, distanceIncrement, maxDistance ) {
    const solvableChallenges = [];
    for ( let fixedMass1Distance = distanceIncrement; fixedMass1Distance <= maxDistance; fixedMass1Distance += distanceIncrement ) {
      for ( let fixedMass2Distance = distanceIncrement; fixedMass2Distance <= maxDistance; fixedMass2Distance += distanceIncrement ) {
        if ( fixedMass1Distance === fixedMass2Distance || Math.abs( fixedMass1Distance - fixedMass2Distance ) < 1.1 * distanceIncrement ) {
          // Skip cases where the fixed masses are at the same
          // position or just one increment apart.
          continue;
        }
        const fixedMassTorque = fixedMass1Prototype.massValue * fixedMass1Distance + fixedMass2Prototype.massValue * fixedMass2Distance;
        const movableMassDistance = fixedMassTorque / movableMassPrototype.massValue;
        if ( movableMassDistance >= distanceIncrement && movableMassDistance <= maxDistance && movableMassDistance % distanceIncrement === 0 ) {
          // This is a solvable configuration.  Add it to the list.
          solvableChallenges.push( BalanceMassesChallenge.create2Fixed1Movable( fixedMass1Prototype.createCopy(), fixedMass1Distance,
            fixedMass2Prototype.createCopy(), fixedMass2Distance, movableMassPrototype.createCopy() ) );
        }
      }
    }

    return solvableChallenges;
  },

  /**
   * Get a list of the distances at which the fixed mass could be positioned
   * that would allow the movable mass to be positioned somewhere on the
   * other side of the fulcrum and balance the fixed mass.
   */
  getPossibleDistanceList( massOfFixedItem, massOfMovableItem ) {
    const validFixedMassDistances = [];
    for ( let testDistance = Plank.INTER_SNAP_TO_MARKER_DISTANCE;
          testDistance <= Plank.MAX_VALID_MASS_DISTANCE_FROM_CENTER;
          testDistance += Plank.INTER_SNAP_TO_MARKER_DISTANCE ) {

      const possibleFixedMassDistance = testDistance * massOfMovableItem / massOfFixedItem;
      if ( possibleFixedMassDistance <= Plank.MAX_VALID_MASS_DISTANCE_FROM_CENTER &&
           possibleFixedMassDistance >= Plank.INTER_SNAP_TO_MARKER_DISTANCE - BASharedConstants.COMPARISON_TOLERANCE &&
           possibleFixedMassDistance % Plank.INTER_SNAP_TO_MARKER_DISTANCE < BASharedConstants.COMPARISON_TOLERANCE ) {
        // This is a valid distance.
        validFixedMassDistances.push( possibleFixedMassDistance );
      }
    }
    return validFixedMassDistances;
  },

  createTwoBrickStackChallenge( numBricksInFixedStack, fixedStackDistanceFromCenter, numBricksInMovableStack ) {
    return BalanceMassesChallenge.create1Fixed1Movable( new BrickStack( numBricksInFixedStack ), fixedStackDistanceFromCenter, new BrickStack( numBricksInMovableStack ) );
  },

  /**
   * Create a mass from the list of available given an original mass value
   * and a list of ratios.  The created mass will have a mass value that
   * equals the original value multiplied by one of the given ratios.
   *
   * @param {number} massValue - Mass needed
   * @param {Array} ratios - Array of ratios (massValue / createdMassValue) which are acceptable.
   */
  createMassByRatio( massValue, ratios ) {
    const indexOffset = this.randInt( BALANCE_CHALLENGE_MASSES.length );
    for ( let i = 0; i < BALANCE_CHALLENGE_MASSES.length; i++ ) {
      const candidateMassPrototype = BALANCE_CHALLENGE_MASSES[ ( i + indexOffset ) % BALANCE_CHALLENGE_MASSES.length ];
      for ( let j = 0; j < ratios.length; j++ ) {
        if ( candidateMassPrototype.massValue * ratios[ j ] === massValue ) {
          // We have found a matching mass.  Clone it and return it.
          return candidateMassPrototype.createCopy();
        }
      }
    }

    // If we made it to here, that means that there is no mass that
    // matches the specified criteria.
    return null;
  },

  // Generate a simple challenge where brick stacks of equal mass appear on each side.
  generateSimpleBalanceChallenge() {
    const numBricks = this.randInt( 4 ) + 1;
    const distance = -this.generateRandomValidPlankDistance();
    return this.createTwoBrickStackChallenge( numBricks, distance, numBricks );
  },

  /**
   * Generate a challenge that consists of brick stacks in simple ratios to
   * one another.  For instance, the fixed brick stack might be 2 bricks,
   * and the movable state be one brick.
   * <p/>
   * Ratios used are 2:1 or 1:2.
   */
  generateEasyBalanceChallenge() {
    let numBricksInFixedStack = 1;
    let numBricksInMovableStack = 1;
    let validFixedStackDistances = [];

    while ( validFixedStackDistances.length === 0 ) {
      // Choose the number of bricks in the fixed stack.  Must be 1, 2,
      // or 4 in order to support the ratios used.
      numBricksInFixedStack = Math.pow( 2, this.randInt( 3 ) );

      // Choose the number of bricks in movable stack.
      if ( numBricksInFixedStack === 1 || dotRandom.nextDouble() > 0.5 ) {
        numBricksInMovableStack = 2 * numBricksInFixedStack;
      }
      else {
        numBricksInMovableStack = numBricksInFixedStack / 2;
      }

      // Create a list of the distances at which the fixed stack may be
      // positioned to balance the movable stack.
      validFixedStackDistances = this.getPossibleDistanceList( numBricksInFixedStack * BrickStack.BRICK_MASS,
        numBricksInMovableStack * BrickStack.BRICK_MASS );
    }

    // Randomly choose a distance to use from the identified set.
    const fixedStackDistanceFromCenter = -validFixedStackDistances[ this.randInt( validFixedStackDistances.length ) ];

    // Create the challenge.
    return this.createTwoBrickStackChallenge( numBricksInFixedStack, fixedStackDistanceFromCenter, numBricksInMovableStack );
  },

  /**
   * Create a challenge in which one fixed mass must be balanced by another,
   * and the distance ratios can be more complex than in the simpler
   * challenges, e.g. 3:2.
   */
  generateModerateBalanceChallenge() {

    let fixedMassPrototype;
    let movableMass;

    // Create random challenges until a solvable one is created.
    do {
      // Randomly choose a fixed mass.
      fixedMassPrototype = BALANCE_CHALLENGE_MASSES[ this.randInt( BALANCE_CHALLENGE_MASSES.length ) ];

      // Choose a mass at one of the desired ratios.
      movableMass = this.createMassByRatio( fixedMassPrototype.massValue, [ 3.0, 1.0 / 3.0, 3.0 / 2.0, 2.0 / 3.0, 4.0, 1.0 / 4.0 ] );
      assert && assert( movableMass !== null, 'No masses match provided ratios.' );
    }
    while ( !this.isChallengeSolvable( fixedMassPrototype.massValue,
      movableMass.massValue,
      Plank.INTER_SNAP_TO_MARKER_DISTANCE,
      MAX_DISTANCE_FROM_BALANCE_CENTER_TO_MASS ) );

    // Randomly choose a distance to use for the fixed mass position.
    const fixedStackDistanceFromCenter = this.chooseRandomValidFixedMassDistance( fixedMassPrototype.massValue, movableMass.massValue );

    // Create the challenge.
    return BalanceMassesChallenge.create1Fixed1Movable( fixedMassPrototype.createCopy(), fixedStackDistanceFromCenter, movableMass );
  },

  /**
   * Generate a challenge where there are multiple fixed masses that must be
   * balanced by a single movable mass.
   */
  generateAdvancedBalanceChallenge() {
    let solvableChallenges;

    do {
      const fixedMass1Prototype = BALANCE_CHALLENGE_MASSES[ this.randInt( BALANCE_CHALLENGE_MASSES.length ) ];
      const fixedMass2Prototype = BALANCE_CHALLENGE_MASSES[ this.randInt( BALANCE_CHALLENGE_MASSES.length ) ];
      const movableMassPrototype = BALANCE_CHALLENGE_MASSES[ this.randInt( BALANCE_CHALLENGE_MASSES.length ) ];
      solvableChallenges = this.generateSolvableChallenges( fixedMass1Prototype, fixedMass2Prototype, movableMassPrototype,
        Plank.INTER_SNAP_TO_MARKER_DISTANCE, Plank.LENGTH / 2 - Plank.INTER_SNAP_TO_MARKER_DISTANCE );
    } while ( solvableChallenges.length === 0 );

    // Choose one of the solvable configurations at random.
    return solvableChallenges[ this.randInt( solvableChallenges.length ) ];
  },

  /**
   * Generate a simple tilt-prediction style of challenge.  This one only
   * uses bricks, and never produces perfectly balanced challenges.
   */
  generateSimpleTiltPredictionChallenge() {
    // Choose two different numbers between 1 and 4 (inclusive) for the
    // number of bricks in the two stacks.
    const numBricksInLeftStack = 1 + this.randInt( 4 );
    let numBricksInRightStack = numBricksInLeftStack;
    while ( numBricksInRightStack === numBricksInLeftStack ) {
      numBricksInRightStack = 1 + this.randInt( 4 );
    }

    // Choose a distance from the center, which will be used for
    // positioning both stacks.  The max and min values can be tweaked if
    // desired to limit the range of distances generated.
    const distanceFromPlankCenter = this.generateRandomValidPlankDistance( Plank.INTER_SNAP_TO_MARKER_DISTANCE,
      Plank.LENGTH / 2 - Plank.INTER_SNAP_TO_MARKER_DISTANCE * 3 );

    // Create the actual challenge from the pieces.
    return TiltPredictionChallenge.create(
      new BrickStack( numBricksInLeftStack ),
      distanceFromPlankCenter,
      new BrickStack( numBricksInRightStack ),
      -distanceFromPlankCenter );
  },

  /**
   * Generate an easy tilt-prediction style of challenge.  This one only
   * uses brick stacks of equal size, and they may or may not balance.
   *
   * @return
   */
  generateEasyTiltPredictionChallenge() {
    const generateRandomValidPlankDistanceRange = 1 + this.randInt( 4 );

    // Generate distance for the left mass.
    const leftMassDistance = this.generateRandomValidPlankDistanceRange( 2 * Plank.INTER_SNAP_TO_MARKER_DISTANCE,
      Plank.LENGTH / 2 - Plank.INTER_SNAP_TO_MARKER_DISTANCE * 2 );

    // Make a fixed proportion of these challenges balanced and the rest
    // not balanced.
    let rightMassDistance = -leftMassDistance;
    if ( dotRandom.nextDouble() > 0.2 ) {
      rightMassDistance = -this.generateRandomValidPlankDistanceRange( 2 * Plank.INTER_SNAP_TO_MARKER_DISTANCE,
        Plank.LENGTH / 2 - Plank.INTER_SNAP_TO_MARKER_DISTANCE * 2 );
    }

    // Create the actual challenge from the pieces.
    return TiltPredictionChallenge.create( new BrickStack( generateRandomValidPlankDistanceRange ),
      leftMassDistance,
      new BrickStack( generateRandomValidPlankDistanceRange ),
      rightMassDistance );
  },

  generateModerateTiltPredictionChallenge() {
    // Select the masses, bricks on one side, non bricks on the other.
    let leftMass = LOW_PROFILE_MASSES[ this.randInt( LOW_PROFILE_MASSES.length ) ].createCopy();
    let rightMass = new BrickStack( this.randInt( 4 ) + 1 );
    if ( dotRandom.nextDouble() >= 0.5 ) {
      // Switch the masses.
      const tempMassPrototype = leftMass;
      leftMass = rightMass;
      rightMass = tempMassPrototype;
    }

    // Make the masses almost but not quite balanced.
    const massDistancePairs = this.positionMassesCloseToBalancing(
      Plank.INTER_SNAP_TO_MARKER_DISTANCE,
      Plank.LENGTH / 2 - 2 * Plank.INTER_SNAP_TO_MARKER_DISTANCE,
      [ leftMass, rightMass ] );

    return new TiltPredictionChallenge( massDistancePairs );
  },

  generateAdvancedTiltPredictionChallenge() {
    // Choose three random masses, bricks on one side, non-bricks on the other.
    const mass1 = LOW_PROFILE_MASSES[ this.randInt( LOW_PROFILE_MASSES.length ) ].createCopy();
    const mass2 = LOW_PROFILE_MASSES[ this.randInt( LOW_PROFILE_MASSES.length ) ].createCopy();
    const mass3 = new BrickStack( this.randInt( 4 ) + 1 );

    // Get a set of mass-distance pairs comprised of these masses
    // positioned in such a way that they are almost, but not quite, balanced.
    const massDistancePairs = this.positionMassesCloseToBalancing( Plank.INTER_SNAP_TO_MARKER_DISTANCE,
      Plank.LENGTH / 2 - Plank.INTER_SNAP_TO_MARKER_DISTANCE, [ mass1, mass2, mass3 ] );

    // Create the actual challenge from the pieces.
    return new TiltPredictionChallenge( massDistancePairs );
  },

  /**
   * Generate a mass deduction style challenge where the fixed mystery mass
   * is the same value as the known mass.
   */
  generateSimpleMassDeductionChallenge() {
    const indexOffset = 1 + this.randInt( BALANCE_CHALLENGE_MASSES.length );
    let knownMass = null;
    let mysteryMassPrototype = null;

    // Select a mystery mass and create a known mass with the same mass value.
    for ( let i = 0; i < MYSTERY_MASSES.length && knownMass === null; i++ ) {
      mysteryMassPrototype = MYSTERY_MASSES[ ( i + indexOffset ) % MYSTERY_MASSES.length ];
      knownMass = this.createMassByRatio( mysteryMassPrototype.massValue, [ 1 ] );
    }

    // There must be at least one combination that works.  If not, it's a
    // major problem in the code that must be fixed.
    assert && assert( knownMass !== null );

    // Since the masses are equal, any position for the mystery mass should
    // create a solvable challenge.
    const mysteryMassDistanceFromCenter = -this.generateRandomValidPlankDistance();

    // Create the challenge.
    return MassDeductionChallenge.create( mysteryMassPrototype.createCopy(), mysteryMassDistanceFromCenter, knownMass );
  },

  /**
   * Generate a mass deduction style challenge where the fixed mystery mass
   * is either twice as heavy or half as heavy as the known mass.
   */
  generateEasyMassDeductionChallenge() {
    const indexOffset = this.randInt( BALANCE_CHALLENGE_MASSES.length );
    let knownMass = null;
    let mysteryMassPrototype = null;

    for ( let i = 0; i < MYSTERY_MASSES.length && knownMass === null; i++ ) {
      mysteryMassPrototype = MYSTERY_MASSES[ ( i + indexOffset ) % MYSTERY_MASSES.length ];
      knownMass = this.createMassByRatio( mysteryMassPrototype.massValue, [ 2, 0.5 ] );
    }

    // There must be at least one combination that works.  If not, it's a
    // major problem in the code that must be fixed.
    assert && assert( knownMass !== null, 'Failed to generate an easy mass deduction challenge' );

    // Choose a distance for the mystery mass.
    const possibleDistances = this.getPossibleDistanceList( mysteryMassPrototype.massValue, knownMass.massValue );
    const mysteryMassDistanceFromCenter = -possibleDistances[ this.randInt( possibleDistances.length ) ];

    // Create the challenge.
    return MassDeductionChallenge.create( mysteryMassPrototype.createCopy(), mysteryMassDistanceFromCenter, knownMass );
  },

  /**
   * Generate a mass deduction style challenge where the fixed mystery mass
   * is related to the movable mass by a ratio that is more complicate than
   * 2:1 or 1:2, e.g. 1:3.
   */
  generateModerateMassDeductionChallenge() {
    const indexOffset = this.randInt( BALANCE_CHALLENGE_MASSES.length );
    let knownMass = null;
    let mysteryMassPrototype = null;

    for ( let i = 0; i < MYSTERY_MASSES.length && knownMass === null; i++ ) {
      mysteryMassPrototype = MYSTERY_MASSES[ ( i + indexOffset ) % MYSTERY_MASSES.length ];
      knownMass = this.createMassByRatio( mysteryMassPrototype.massValue, [ 1.5, 3, ( 1.0 / 3.0 ), ( 2.0 / 3.0 ), 4, ( 1.0 / 4.0 ) ] );
    }

    // There must be at least one combination that works.  If not, it's a
    // major problem in the code that must be fixed.
    assert && assert( knownMass !== null, 'No combinations for mass deduction challenge generation' );

    // Choose a distance for the mystery mass.
    const possibleDistances = this.getPossibleDistanceList( mysteryMassPrototype.massValue, knownMass.massValue );
    const mysteryMassDistanceFromCenter = -possibleDistances[ this.randInt( possibleDistances.length ) ];

    // Create the challenge.
    return MassDeductionChallenge.create( mysteryMassPrototype.createCopy(), mysteryMassDistanceFromCenter, knownMass );
  },

  /**
   * Convenience function for removing the oldest half of a list (which is
   * the lower indicies).
   */
  removeOldestHalfOfList( list ) {
    list.splice( 0, Utils.roundSymmetric( list.length / 2 ) );
  },

  /**
   * Method to generate a "unique" challenge, meaning one that the user
   * either hasn't seen before or at least hasn't seen recently.  The caller
   * provides functions for generating the challenges and testing its
   * uniqueness, as well as a list of previous challenges to test against.
   */
  generateUniqueChallenge( challengeGenerator, uniquenessTest, previousChallenges ) {
    let challenge = null;
    let uniqueChallengeGenerated = false;

    for ( let i = 0; i < MAX_HALVING_OF_PAST_LIST && !uniqueChallengeGenerated; i++ ) {
      for ( let j = 0; j < MAX_GEN_ATTEMPTS; j++ ) {

        // Create a challenge.
        challenge = challengeGenerator();

        // Check whether the challenge is unique.
        if ( uniquenessTest( challenge, previousChallenges ) ) {
          // If so, we're done.
          uniqueChallengeGenerated = true;
          break;
        }
      }
      if ( !uniqueChallengeGenerated ) {
        // Several attempts did not yield a unique challenge, so
        // reduce the number of past challenges on the list in order
        // to make it easier, and then try again.
        this.removeOldestHalfOfList( previousChallenges );
      }
    }
    assert && assert( challenge !== null ); // The algorithm above should always produce something, log it if not.
    previousChallenges.push( challenge );
    return challenge;
  },

  /**
   * Test a challenge against a list of challenges to see if the given
   * challenge uses unique mass values for the movable and fixed masses.
   * Distances are ignored, so if a challenge is tested against a set that
   * contains one with the same masses but different distances, this will
   * return false, indicating that the challenge is non-unique.
   *
   * @param testChallenge
   * @param usedChallengeList
   * @return
   */
  usesUniqueMasses( testChallenge, usedChallengeList ) {
    return !_.some( usedChallengeList, challenge => challenge.usesSameMasses( testChallenge ) );
  },

  /**
   * Tests a challenge against a set of challenges to see whether the test
   * challenge has unique fixed masses and distances compared to all of the
   * challenges on the comparison list.  If any of the challenge on the
   * comparison list have the same fixed masses at the same distances from
   * the center, this will return false, indicating that the test challenge
   * is not unique.
   *
   * @param testChallenge
   * @param usedChallengeList
   * @return
   */
  usesUniqueFixedMassesAndDistances( testChallenge, usedChallengeList ) {
    return !_.some( usedChallengeList, challenge => challenge.usesSameFixedMassesAndDistances( testChallenge ) );
  },

  /**
   * Tests a challenge against a set of challenges to see whether the test
   * challenge has unique fixed masses compared to all of the challenges on
   * the list.  If any of the challenge on the comparison list have the same
   * fixed masses, this will return false, indicating that the challenge is
   * not unique.
   *
   * @param testChallenge
   * @param usedChallengeList
   * @return
   */
  usesUniqueFixedMasses( testChallenge, usedChallengeList ) {
    return !_.some( usedChallengeList, challenge => challenge.usesSameFixedMasses( testChallenge ) );
  },

  generateBalanceChallenge( level ) {
    return this.generateUniqueChallenge( this.balanceChallengeGenerators[ level ].bind( this ), this.usesUniqueMasses, usedBalanceChallenges );
  },

  simpleBalanceChallengeGenerator() {
    return this.generateUniqueChallenge( this.generateSimpleBalanceChallenge.bind( this ), this.usesUniqueMasses, usedBalanceChallenges );
  },

  easyBalanceChallengeGenerator() {
    return this.generateUniqueChallenge( this.generateEasyBalanceChallenge.bind( this ), this.usesUniqueMasses, usedBalanceChallenges );
  },

  moderateBalanceChallengeGenerator() {
    return this.generateUniqueChallenge( this.generateModerateBalanceChallenge.bind( this ), this.usesUniqueMasses, usedBalanceChallenges );
  },

  advancedBalanceChallengeGenerator() {
    return this.generateUniqueChallenge( this.generateAdvancedBalanceChallenge.bind( this ), this.usesUniqueMasses, usedBalanceChallenges );
  },

  simpleMassDeductionChallengeGenerator() {
    return this.generateUniqueChallenge( this.generateSimpleMassDeductionChallenge.bind( this ), this.usesUniqueFixedMasses, usedMassDeductionChallenges );
  },

  easyMassDeductionChallengeGenerator() {
    return this.generateUniqueChallenge( this.generateEasyMassDeductionChallenge.bind( this ), this.usesUniqueFixedMasses, usedMassDeductionChallenges );
  },

  moderateMassDeductionChallengeGenerator() {
    return this.generateUniqueChallenge( this.generateModerateMassDeductionChallenge.bind( this ), this.usesUniqueFixedMasses, usedMassDeductionChallenges );
  },

  simpleTiltPredictionChallengeGenerator() {
    return this.generateUniqueChallenge( this.generateSimpleTiltPredictionChallenge.bind( this ), this.usesUniqueFixedMassesAndDistances, usedTiltPredictionChallenges );
  },

  easyTiltPredictionChallengeGenerator() {
    return this.generateUniqueChallenge( this.generateEasyTiltPredictionChallenge.bind( this ), this.usesUniqueFixedMassesAndDistances, usedTiltPredictionChallenges );
  },

  moderateTiltPredictionChallengeGenerator() {
    return this.generateUniqueChallenge( this.generateModerateTiltPredictionChallenge.bind( this ), this.usesUniqueFixedMassesAndDistances, usedTiltPredictionChallenges );
  },

  advancedTiltPredictionChallengeGenerator() {
    return this.generateUniqueChallenge( this.generateAdvancedTiltPredictionChallenge.bind( this ), this.usesUniqueFixedMassesAndDistances, usedTiltPredictionChallenges );
  },

  generateChallengeSet( level ) {
    const balanceChallengeList = [];
    switch( level ) {

      case 0:
        balanceChallengeList.push( this.simpleBalanceChallengeGenerator() );
        balanceChallengeList.push( this.simpleTiltPredictionChallengeGenerator() );
        balanceChallengeList.push( this.easyBalanceChallengeGenerator() );
        balanceChallengeList.push( this.simpleMassDeductionChallengeGenerator() );
        balanceChallengeList.push( this.simpleTiltPredictionChallengeGenerator() );
        balanceChallengeList.push( this.easyMassDeductionChallengeGenerator() );
        break;

      case 1:
        balanceChallengeList.push( this.easyTiltPredictionChallengeGenerator() );
        balanceChallengeList.push( this.easyBalanceChallengeGenerator() );
        balanceChallengeList.push( this.easyMassDeductionChallengeGenerator() );
        balanceChallengeList.push( this.easyTiltPredictionChallengeGenerator() );
        balanceChallengeList.push( this.easyMassDeductionChallengeGenerator() );
        balanceChallengeList.push( this.moderateBalanceChallengeGenerator() );
        break;

      case 2:
        balanceChallengeList.push( this.moderateBalanceChallengeGenerator() );
        balanceChallengeList.push( this.easyMassDeductionChallengeGenerator() );
        balanceChallengeList.push( this.moderateTiltPredictionChallengeGenerator() );
        balanceChallengeList.push( this.moderateBalanceChallengeGenerator() );
        balanceChallengeList.push( this.moderateTiltPredictionChallengeGenerator() );
        balanceChallengeList.push( this.moderateMassDeductionChallengeGenerator() );
        break;

      case 3:
        balanceChallengeList.push( this.advancedTiltPredictionChallengeGenerator() );
        balanceChallengeList.push( this.advancedBalanceChallengeGenerator() );
        balanceChallengeList.push( this.moderateMassDeductionChallengeGenerator() );
        balanceChallengeList.push( this.advancedTiltPredictionChallengeGenerator() );
        balanceChallengeList.push( this.moderateMassDeductionChallengeGenerator() );
        balanceChallengeList.push( this.advancedBalanceChallengeGenerator() );
        break;

      default:
        throw new Error( `Can't generate challenge set for requested level: ${level}` );
    }
    return balanceChallengeList;
  }
};

balancingAct.register( 'BalanceGameChallengeFactory', BalanceGameChallengeFactory );

export default BalanceGameChallengeFactory;
