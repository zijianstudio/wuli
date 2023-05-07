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
const MAX_DISTANCE_FROM_BALANCE_CENTER_TO_MASS = (Utils.roundSymmetric(Plank.LENGTH / Plank.INTER_SNAP_TO_MARKER_DISTANCE / 2) - 1) * Plank.INTER_SNAP_TO_MARKER_DISTANCE;

// Parameters that control how many attempts are made to generate a unique
// balance challenge.
const MAX_GEN_ATTEMPTS = 50;
const MAX_HALVING_OF_PAST_LIST = 3;

// List of masses that can be used on either side of the balance challenges
// or as the fixed masses in mass deduction challenges.
const BALANCE_CHALLENGE_MASSES = [new BrickStack(1, Vector2.ZERO), new BrickStack(2, Vector2.ZERO), new BrickStack(3, Vector2.ZERO), new BrickStack(4, Vector2.ZERO), new TinyRock(Vector2.ZERO, false), new SmallRock(Vector2.ZERO, false), new MediumRock(Vector2.ZERO, false), new BigRock(Vector2.ZERO, false), new Boy(Vector2.ZERO, false), new Girl(Vector2.ZERO, false), new Man(Vector2.ZERO, false), new Woman(Vector2.ZERO, false), new Barrel(Vector2.ZERO, false), new CinderBlock(Vector2.ZERO, false), new Puppy(Vector2.ZERO, false), new SodaBottle(Vector2.ZERO, false), new SmallBucket(Vector2.ZERO, false)];

// List of masses that can be used as "mystery masses" in the mass
// deduction challenges.  These should not appear in other tabs, lest the
// user could already know their mass.
const MYSTERY_MASSES = [new FireHydrant(Vector2.ZERO, true), new Television(Vector2.ZERO, true), new LargeTrashCan(Vector2.ZERO, true), new SmallRock(Vector2.ZERO, true), new Crate(Vector2.ZERO, true), new FlowerPot(Vector2.ZERO, true), new MediumBucket(Vector2.ZERO, true), new LargeBucket(Vector2.ZERO, true), new PottedPlant(Vector2.ZERO, true), new Tire(Vector2.ZERO, true)];

// List of masses that are "low profile", meaning that they are short.
// This is needed for the tilt-prediction style of problem, since taller
// masses end up going behind the tilt prediction selector.
const LOW_PROFILE_MASSES = [new TinyRock(Vector2.ZERO, false), new SmallRock(Vector2.ZERO, false), new MediumRock(Vector2.ZERO, false), new CinderBlock(Vector2.ZERO, false), new SmallBucket(Vector2.ZERO, false)];

// Lists used to keep track of the challenges generated so far so that we
// can avoid creating the same challenges multiple times.
const usedBalanceChallenges = [];
const usedMassDeductionChallenges = [];
const usedTiltPredictionChallenges = [];
const BalanceGameChallengeFactory = {
  // Generate a random integer from 0 (inclusive) to max (exclusive)
  randInt(max) {
    return Math.floor(dotRandom.nextDouble() * max);
  },
  /**
   * Determine whether a challenge with the given values for the fixed and
   * movable masses and the given constraints on the plank can be solved.
   */
  isChallengeSolvable(fixedMassValue, movableMassValue, distanceIncrement, maxDistance) {
    if (fixedMassValue * distanceIncrement > movableMassValue * maxDistance || fixedMassValue * maxDistance < movableMassValue * distanceIncrement) {
      // The balance is not long enough to allow these masses to be balanced.
      return false;
    }
    return fixedMassValue / movableMassValue % distanceIncrement <= BASharedConstants.COMPARISON_TOLERANCE;
  },
  chooseRandomValidFixedMassDistance(fixedMassValue, movableMassValue) {
    const validFixedMassDistances = this.getPossibleDistanceList(fixedMassValue, movableMassValue);

    // Randomly choose a distance to use from the identified set.
    return -validFixedMassDistances[this.randInt(validFixedMassDistances.length)];
  },
  /**
   * Take a list of masses and return a set of mass-distance pairs that
   * position the masses such that they are close to being balanced but are
   * NOT balanced.  This is a convenience method that was written to
   * consolidate some code written for generating tilt-prediction challenges.
   */
  positionMassesCloseToBalancing(minDistance, maxDistance, masses) {
    let bestNetTorque = Number.POSITIVE_INFINITY;
    const minAcceptableTorque = 1; // Determined empirically.
    let distanceList = [];
    let bestDistanceList = distanceList;
    for (let i = 0; i < MAX_GEN_ATTEMPTS; i++) {
      distanceList = [];
      // Generate a set of unique, random, and valid distances for the
      // placement of the masses.
      for (let j = 0; distanceList.length < masses.length && j < MAX_GEN_ATTEMPTS; j++) {
        let candidateDistance = this.generateRandomValidPlankDistance(minDistance, maxDistance);
        if (j === 0) {
          // Randomly invert (or don't) the first random distance.
          candidateDistance = dotRandom.nextDouble() >= 0.5 ? -candidateDistance : candidateDistance;
        } else {
          // Make the sign of this distance be the opposite of the
          // previous one.
          candidateDistance = distanceList[distanceList.length - 1] > 0 ? -candidateDistance : candidateDistance;
        }
        // Check if unique.
        if (distanceList.indexOf(candidateDistance) === -1) {
          distanceList.push(candidateDistance);
        }
      }
      // Handle the unlikely case where enough unique distances couldn't
      // be found.
      if (distanceList.length !== masses.length) {
        distanceList = [];
        for (let k = 0; k < masses.length; k++) {
          // Just add a linear set of distances.
          distanceList.push(minDistance + Plank.INTER_SNAP_TO_MARKER_DISTANCE * k);
          // Output a warning.
          console.log(' Warning: Unable to find enough unique distances for positioning masses.');
        }
      }
      // Calculate the net torque for this set of masses.
      let netTorque = 0;
      for (let m = 0; m < masses.length; m++) {
        netTorque += masses[m].massValue * distanceList[m];
      }
      netTorque = Math.abs(netTorque);
      if (netTorque < bestNetTorque && netTorque > minAcceptableTorque) {
        bestNetTorque = netTorque;
        bestDistanceList = distanceList.slice(0);
      }
    }

    // Create the array of mass-distance pairs from the original set of
    // masses and the best randomly-generated distances.
    const repositionedMasses = [];
    for (let i = 0; i < masses.length; i++) {
      repositionedMasses.push({
        mass: masses[i],
        distance: bestDistanceList[i]
      });
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
    const maxIncrements = Utils.roundSymmetric(maxDistance / increment) - 1;
    return (this.randInt(maxIncrements) + 1) * increment;
  },
  generateRandomValidPlankDistanceRange(minDistance, maxDistance) {
    const minIncrements = Math.ceil(minDistance / Plank.INTER_SNAP_TO_MARKER_DISTANCE);
    const maxIncrements = Math.floor(maxDistance / Plank.INTER_SNAP_TO_MARKER_DISTANCE);
    return (this.randInt(maxIncrements - minIncrements + 1) + minIncrements) * Plank.INTER_SNAP_TO_MARKER_DISTANCE;
  },
  /**
   * Generate the list of solvable balance game challenges that can be
   * created from the given set of two fixed masses and one movable mass.
   */
  generateSolvableChallenges(fixedMass1Prototype, fixedMass2Prototype, movableMassPrototype, distanceIncrement, maxDistance) {
    const solvableChallenges = [];
    for (let fixedMass1Distance = distanceIncrement; fixedMass1Distance <= maxDistance; fixedMass1Distance += distanceIncrement) {
      for (let fixedMass2Distance = distanceIncrement; fixedMass2Distance <= maxDistance; fixedMass2Distance += distanceIncrement) {
        if (fixedMass1Distance === fixedMass2Distance || Math.abs(fixedMass1Distance - fixedMass2Distance) < 1.1 * distanceIncrement) {
          // Skip cases where the fixed masses are at the same
          // position or just one increment apart.
          continue;
        }
        const fixedMassTorque = fixedMass1Prototype.massValue * fixedMass1Distance + fixedMass2Prototype.massValue * fixedMass2Distance;
        const movableMassDistance = fixedMassTorque / movableMassPrototype.massValue;
        if (movableMassDistance >= distanceIncrement && movableMassDistance <= maxDistance && movableMassDistance % distanceIncrement === 0) {
          // This is a solvable configuration.  Add it to the list.
          solvableChallenges.push(BalanceMassesChallenge.create2Fixed1Movable(fixedMass1Prototype.createCopy(), fixedMass1Distance, fixedMass2Prototype.createCopy(), fixedMass2Distance, movableMassPrototype.createCopy()));
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
  getPossibleDistanceList(massOfFixedItem, massOfMovableItem) {
    const validFixedMassDistances = [];
    for (let testDistance = Plank.INTER_SNAP_TO_MARKER_DISTANCE; testDistance <= Plank.MAX_VALID_MASS_DISTANCE_FROM_CENTER; testDistance += Plank.INTER_SNAP_TO_MARKER_DISTANCE) {
      const possibleFixedMassDistance = testDistance * massOfMovableItem / massOfFixedItem;
      if (possibleFixedMassDistance <= Plank.MAX_VALID_MASS_DISTANCE_FROM_CENTER && possibleFixedMassDistance >= Plank.INTER_SNAP_TO_MARKER_DISTANCE - BASharedConstants.COMPARISON_TOLERANCE && possibleFixedMassDistance % Plank.INTER_SNAP_TO_MARKER_DISTANCE < BASharedConstants.COMPARISON_TOLERANCE) {
        // This is a valid distance.
        validFixedMassDistances.push(possibleFixedMassDistance);
      }
    }
    return validFixedMassDistances;
  },
  createTwoBrickStackChallenge(numBricksInFixedStack, fixedStackDistanceFromCenter, numBricksInMovableStack) {
    return BalanceMassesChallenge.create1Fixed1Movable(new BrickStack(numBricksInFixedStack), fixedStackDistanceFromCenter, new BrickStack(numBricksInMovableStack));
  },
  /**
   * Create a mass from the list of available given an original mass value
   * and a list of ratios.  The created mass will have a mass value that
   * equals the original value multiplied by one of the given ratios.
   *
   * @param {number} massValue - Mass needed
   * @param {Array} ratios - Array of ratios (massValue / createdMassValue) which are acceptable.
   */
  createMassByRatio(massValue, ratios) {
    const indexOffset = this.randInt(BALANCE_CHALLENGE_MASSES.length);
    for (let i = 0; i < BALANCE_CHALLENGE_MASSES.length; i++) {
      const candidateMassPrototype = BALANCE_CHALLENGE_MASSES[(i + indexOffset) % BALANCE_CHALLENGE_MASSES.length];
      for (let j = 0; j < ratios.length; j++) {
        if (candidateMassPrototype.massValue * ratios[j] === massValue) {
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
    const numBricks = this.randInt(4) + 1;
    const distance = -this.generateRandomValidPlankDistance();
    return this.createTwoBrickStackChallenge(numBricks, distance, numBricks);
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
    while (validFixedStackDistances.length === 0) {
      // Choose the number of bricks in the fixed stack.  Must be 1, 2,
      // or 4 in order to support the ratios used.
      numBricksInFixedStack = Math.pow(2, this.randInt(3));

      // Choose the number of bricks in movable stack.
      if (numBricksInFixedStack === 1 || dotRandom.nextDouble() > 0.5) {
        numBricksInMovableStack = 2 * numBricksInFixedStack;
      } else {
        numBricksInMovableStack = numBricksInFixedStack / 2;
      }

      // Create a list of the distances at which the fixed stack may be
      // positioned to balance the movable stack.
      validFixedStackDistances = this.getPossibleDistanceList(numBricksInFixedStack * BrickStack.BRICK_MASS, numBricksInMovableStack * BrickStack.BRICK_MASS);
    }

    // Randomly choose a distance to use from the identified set.
    const fixedStackDistanceFromCenter = -validFixedStackDistances[this.randInt(validFixedStackDistances.length)];

    // Create the challenge.
    return this.createTwoBrickStackChallenge(numBricksInFixedStack, fixedStackDistanceFromCenter, numBricksInMovableStack);
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
      fixedMassPrototype = BALANCE_CHALLENGE_MASSES[this.randInt(BALANCE_CHALLENGE_MASSES.length)];

      // Choose a mass at one of the desired ratios.
      movableMass = this.createMassByRatio(fixedMassPrototype.massValue, [3.0, 1.0 / 3.0, 3.0 / 2.0, 2.0 / 3.0, 4.0, 1.0 / 4.0]);
      assert && assert(movableMass !== null, 'No masses match provided ratios.');
    } while (!this.isChallengeSolvable(fixedMassPrototype.massValue, movableMass.massValue, Plank.INTER_SNAP_TO_MARKER_DISTANCE, MAX_DISTANCE_FROM_BALANCE_CENTER_TO_MASS));

    // Randomly choose a distance to use for the fixed mass position.
    const fixedStackDistanceFromCenter = this.chooseRandomValidFixedMassDistance(fixedMassPrototype.massValue, movableMass.massValue);

    // Create the challenge.
    return BalanceMassesChallenge.create1Fixed1Movable(fixedMassPrototype.createCopy(), fixedStackDistanceFromCenter, movableMass);
  },
  /**
   * Generate a challenge where there are multiple fixed masses that must be
   * balanced by a single movable mass.
   */
  generateAdvancedBalanceChallenge() {
    let solvableChallenges;
    do {
      const fixedMass1Prototype = BALANCE_CHALLENGE_MASSES[this.randInt(BALANCE_CHALLENGE_MASSES.length)];
      const fixedMass2Prototype = BALANCE_CHALLENGE_MASSES[this.randInt(BALANCE_CHALLENGE_MASSES.length)];
      const movableMassPrototype = BALANCE_CHALLENGE_MASSES[this.randInt(BALANCE_CHALLENGE_MASSES.length)];
      solvableChallenges = this.generateSolvableChallenges(fixedMass1Prototype, fixedMass2Prototype, movableMassPrototype, Plank.INTER_SNAP_TO_MARKER_DISTANCE, Plank.LENGTH / 2 - Plank.INTER_SNAP_TO_MARKER_DISTANCE);
    } while (solvableChallenges.length === 0);

    // Choose one of the solvable configurations at random.
    return solvableChallenges[this.randInt(solvableChallenges.length)];
  },
  /**
   * Generate a simple tilt-prediction style of challenge.  This one only
   * uses bricks, and never produces perfectly balanced challenges.
   */
  generateSimpleTiltPredictionChallenge() {
    // Choose two different numbers between 1 and 4 (inclusive) for the
    // number of bricks in the two stacks.
    const numBricksInLeftStack = 1 + this.randInt(4);
    let numBricksInRightStack = numBricksInLeftStack;
    while (numBricksInRightStack === numBricksInLeftStack) {
      numBricksInRightStack = 1 + this.randInt(4);
    }

    // Choose a distance from the center, which will be used for
    // positioning both stacks.  The max and min values can be tweaked if
    // desired to limit the range of distances generated.
    const distanceFromPlankCenter = this.generateRandomValidPlankDistance(Plank.INTER_SNAP_TO_MARKER_DISTANCE, Plank.LENGTH / 2 - Plank.INTER_SNAP_TO_MARKER_DISTANCE * 3);

    // Create the actual challenge from the pieces.
    return TiltPredictionChallenge.create(new BrickStack(numBricksInLeftStack), distanceFromPlankCenter, new BrickStack(numBricksInRightStack), -distanceFromPlankCenter);
  },
  /**
   * Generate an easy tilt-prediction style of challenge.  This one only
   * uses brick stacks of equal size, and they may or may not balance.
   *
   * @return
   */
  generateEasyTiltPredictionChallenge() {
    const generateRandomValidPlankDistanceRange = 1 + this.randInt(4);

    // Generate distance for the left mass.
    const leftMassDistance = this.generateRandomValidPlankDistanceRange(2 * Plank.INTER_SNAP_TO_MARKER_DISTANCE, Plank.LENGTH / 2 - Plank.INTER_SNAP_TO_MARKER_DISTANCE * 2);

    // Make a fixed proportion of these challenges balanced and the rest
    // not balanced.
    let rightMassDistance = -leftMassDistance;
    if (dotRandom.nextDouble() > 0.2) {
      rightMassDistance = -this.generateRandomValidPlankDistanceRange(2 * Plank.INTER_SNAP_TO_MARKER_DISTANCE, Plank.LENGTH / 2 - Plank.INTER_SNAP_TO_MARKER_DISTANCE * 2);
    }

    // Create the actual challenge from the pieces.
    return TiltPredictionChallenge.create(new BrickStack(generateRandomValidPlankDistanceRange), leftMassDistance, new BrickStack(generateRandomValidPlankDistanceRange), rightMassDistance);
  },
  generateModerateTiltPredictionChallenge() {
    // Select the masses, bricks on one side, non bricks on the other.
    let leftMass = LOW_PROFILE_MASSES[this.randInt(LOW_PROFILE_MASSES.length)].createCopy();
    let rightMass = new BrickStack(this.randInt(4) + 1);
    if (dotRandom.nextDouble() >= 0.5) {
      // Switch the masses.
      const tempMassPrototype = leftMass;
      leftMass = rightMass;
      rightMass = tempMassPrototype;
    }

    // Make the masses almost but not quite balanced.
    const massDistancePairs = this.positionMassesCloseToBalancing(Plank.INTER_SNAP_TO_MARKER_DISTANCE, Plank.LENGTH / 2 - 2 * Plank.INTER_SNAP_TO_MARKER_DISTANCE, [leftMass, rightMass]);
    return new TiltPredictionChallenge(massDistancePairs);
  },
  generateAdvancedTiltPredictionChallenge() {
    // Choose three random masses, bricks on one side, non-bricks on the other.
    const mass1 = LOW_PROFILE_MASSES[this.randInt(LOW_PROFILE_MASSES.length)].createCopy();
    const mass2 = LOW_PROFILE_MASSES[this.randInt(LOW_PROFILE_MASSES.length)].createCopy();
    const mass3 = new BrickStack(this.randInt(4) + 1);

    // Get a set of mass-distance pairs comprised of these masses
    // positioned in such a way that they are almost, but not quite, balanced.
    const massDistancePairs = this.positionMassesCloseToBalancing(Plank.INTER_SNAP_TO_MARKER_DISTANCE, Plank.LENGTH / 2 - Plank.INTER_SNAP_TO_MARKER_DISTANCE, [mass1, mass2, mass3]);

    // Create the actual challenge from the pieces.
    return new TiltPredictionChallenge(massDistancePairs);
  },
  /**
   * Generate a mass deduction style challenge where the fixed mystery mass
   * is the same value as the known mass.
   */
  generateSimpleMassDeductionChallenge() {
    const indexOffset = 1 + this.randInt(BALANCE_CHALLENGE_MASSES.length);
    let knownMass = null;
    let mysteryMassPrototype = null;

    // Select a mystery mass and create a known mass with the same mass value.
    for (let i = 0; i < MYSTERY_MASSES.length && knownMass === null; i++) {
      mysteryMassPrototype = MYSTERY_MASSES[(i + indexOffset) % MYSTERY_MASSES.length];
      knownMass = this.createMassByRatio(mysteryMassPrototype.massValue, [1]);
    }

    // There must be at least one combination that works.  If not, it's a
    // major problem in the code that must be fixed.
    assert && assert(knownMass !== null);

    // Since the masses are equal, any position for the mystery mass should
    // create a solvable challenge.
    const mysteryMassDistanceFromCenter = -this.generateRandomValidPlankDistance();

    // Create the challenge.
    return MassDeductionChallenge.create(mysteryMassPrototype.createCopy(), mysteryMassDistanceFromCenter, knownMass);
  },
  /**
   * Generate a mass deduction style challenge where the fixed mystery mass
   * is either twice as heavy or half as heavy as the known mass.
   */
  generateEasyMassDeductionChallenge() {
    const indexOffset = this.randInt(BALANCE_CHALLENGE_MASSES.length);
    let knownMass = null;
    let mysteryMassPrototype = null;
    for (let i = 0; i < MYSTERY_MASSES.length && knownMass === null; i++) {
      mysteryMassPrototype = MYSTERY_MASSES[(i + indexOffset) % MYSTERY_MASSES.length];
      knownMass = this.createMassByRatio(mysteryMassPrototype.massValue, [2, 0.5]);
    }

    // There must be at least one combination that works.  If not, it's a
    // major problem in the code that must be fixed.
    assert && assert(knownMass !== null, 'Failed to generate an easy mass deduction challenge');

    // Choose a distance for the mystery mass.
    const possibleDistances = this.getPossibleDistanceList(mysteryMassPrototype.massValue, knownMass.massValue);
    const mysteryMassDistanceFromCenter = -possibleDistances[this.randInt(possibleDistances.length)];

    // Create the challenge.
    return MassDeductionChallenge.create(mysteryMassPrototype.createCopy(), mysteryMassDistanceFromCenter, knownMass);
  },
  /**
   * Generate a mass deduction style challenge where the fixed mystery mass
   * is related to the movable mass by a ratio that is more complicate than
   * 2:1 or 1:2, e.g. 1:3.
   */
  generateModerateMassDeductionChallenge() {
    const indexOffset = this.randInt(BALANCE_CHALLENGE_MASSES.length);
    let knownMass = null;
    let mysteryMassPrototype = null;
    for (let i = 0; i < MYSTERY_MASSES.length && knownMass === null; i++) {
      mysteryMassPrototype = MYSTERY_MASSES[(i + indexOffset) % MYSTERY_MASSES.length];
      knownMass = this.createMassByRatio(mysteryMassPrototype.massValue, [1.5, 3, 1.0 / 3.0, 2.0 / 3.0, 4, 1.0 / 4.0]);
    }

    // There must be at least one combination that works.  If not, it's a
    // major problem in the code that must be fixed.
    assert && assert(knownMass !== null, 'No combinations for mass deduction challenge generation');

    // Choose a distance for the mystery mass.
    const possibleDistances = this.getPossibleDistanceList(mysteryMassPrototype.massValue, knownMass.massValue);
    const mysteryMassDistanceFromCenter = -possibleDistances[this.randInt(possibleDistances.length)];

    // Create the challenge.
    return MassDeductionChallenge.create(mysteryMassPrototype.createCopy(), mysteryMassDistanceFromCenter, knownMass);
  },
  /**
   * Convenience function for removing the oldest half of a list (which is
   * the lower indicies).
   */
  removeOldestHalfOfList(list) {
    list.splice(0, Utils.roundSymmetric(list.length / 2));
  },
  /**
   * Method to generate a "unique" challenge, meaning one that the user
   * either hasn't seen before or at least hasn't seen recently.  The caller
   * provides functions for generating the challenges and testing its
   * uniqueness, as well as a list of previous challenges to test against.
   */
  generateUniqueChallenge(challengeGenerator, uniquenessTest, previousChallenges) {
    let challenge = null;
    let uniqueChallengeGenerated = false;
    for (let i = 0; i < MAX_HALVING_OF_PAST_LIST && !uniqueChallengeGenerated; i++) {
      for (let j = 0; j < MAX_GEN_ATTEMPTS; j++) {
        // Create a challenge.
        challenge = challengeGenerator();

        // Check whether the challenge is unique.
        if (uniquenessTest(challenge, previousChallenges)) {
          // If so, we're done.
          uniqueChallengeGenerated = true;
          break;
        }
      }
      if (!uniqueChallengeGenerated) {
        // Several attempts did not yield a unique challenge, so
        // reduce the number of past challenges on the list in order
        // to make it easier, and then try again.
        this.removeOldestHalfOfList(previousChallenges);
      }
    }
    assert && assert(challenge !== null); // The algorithm above should always produce something, log it if not.
    previousChallenges.push(challenge);
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
  usesUniqueMasses(testChallenge, usedChallengeList) {
    return !_.some(usedChallengeList, challenge => challenge.usesSameMasses(testChallenge));
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
  usesUniqueFixedMassesAndDistances(testChallenge, usedChallengeList) {
    return !_.some(usedChallengeList, challenge => challenge.usesSameFixedMassesAndDistances(testChallenge));
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
  usesUniqueFixedMasses(testChallenge, usedChallengeList) {
    return !_.some(usedChallengeList, challenge => challenge.usesSameFixedMasses(testChallenge));
  },
  generateBalanceChallenge(level) {
    return this.generateUniqueChallenge(this.balanceChallengeGenerators[level].bind(this), this.usesUniqueMasses, usedBalanceChallenges);
  },
  simpleBalanceChallengeGenerator() {
    return this.generateUniqueChallenge(this.generateSimpleBalanceChallenge.bind(this), this.usesUniqueMasses, usedBalanceChallenges);
  },
  easyBalanceChallengeGenerator() {
    return this.generateUniqueChallenge(this.generateEasyBalanceChallenge.bind(this), this.usesUniqueMasses, usedBalanceChallenges);
  },
  moderateBalanceChallengeGenerator() {
    return this.generateUniqueChallenge(this.generateModerateBalanceChallenge.bind(this), this.usesUniqueMasses, usedBalanceChallenges);
  },
  advancedBalanceChallengeGenerator() {
    return this.generateUniqueChallenge(this.generateAdvancedBalanceChallenge.bind(this), this.usesUniqueMasses, usedBalanceChallenges);
  },
  simpleMassDeductionChallengeGenerator() {
    return this.generateUniqueChallenge(this.generateSimpleMassDeductionChallenge.bind(this), this.usesUniqueFixedMasses, usedMassDeductionChallenges);
  },
  easyMassDeductionChallengeGenerator() {
    return this.generateUniqueChallenge(this.generateEasyMassDeductionChallenge.bind(this), this.usesUniqueFixedMasses, usedMassDeductionChallenges);
  },
  moderateMassDeductionChallengeGenerator() {
    return this.generateUniqueChallenge(this.generateModerateMassDeductionChallenge.bind(this), this.usesUniqueFixedMasses, usedMassDeductionChallenges);
  },
  simpleTiltPredictionChallengeGenerator() {
    return this.generateUniqueChallenge(this.generateSimpleTiltPredictionChallenge.bind(this), this.usesUniqueFixedMassesAndDistances, usedTiltPredictionChallenges);
  },
  easyTiltPredictionChallengeGenerator() {
    return this.generateUniqueChallenge(this.generateEasyTiltPredictionChallenge.bind(this), this.usesUniqueFixedMassesAndDistances, usedTiltPredictionChallenges);
  },
  moderateTiltPredictionChallengeGenerator() {
    return this.generateUniqueChallenge(this.generateModerateTiltPredictionChallenge.bind(this), this.usesUniqueFixedMassesAndDistances, usedTiltPredictionChallenges);
  },
  advancedTiltPredictionChallengeGenerator() {
    return this.generateUniqueChallenge(this.generateAdvancedTiltPredictionChallenge.bind(this), this.usesUniqueFixedMassesAndDistances, usedTiltPredictionChallenges);
  },
  generateChallengeSet(level) {
    const balanceChallengeList = [];
    switch (level) {
      case 0:
        balanceChallengeList.push(this.simpleBalanceChallengeGenerator());
        balanceChallengeList.push(this.simpleTiltPredictionChallengeGenerator());
        balanceChallengeList.push(this.easyBalanceChallengeGenerator());
        balanceChallengeList.push(this.simpleMassDeductionChallengeGenerator());
        balanceChallengeList.push(this.simpleTiltPredictionChallengeGenerator());
        balanceChallengeList.push(this.easyMassDeductionChallengeGenerator());
        break;
      case 1:
        balanceChallengeList.push(this.easyTiltPredictionChallengeGenerator());
        balanceChallengeList.push(this.easyBalanceChallengeGenerator());
        balanceChallengeList.push(this.easyMassDeductionChallengeGenerator());
        balanceChallengeList.push(this.easyTiltPredictionChallengeGenerator());
        balanceChallengeList.push(this.easyMassDeductionChallengeGenerator());
        balanceChallengeList.push(this.moderateBalanceChallengeGenerator());
        break;
      case 2:
        balanceChallengeList.push(this.moderateBalanceChallengeGenerator());
        balanceChallengeList.push(this.easyMassDeductionChallengeGenerator());
        balanceChallengeList.push(this.moderateTiltPredictionChallengeGenerator());
        balanceChallengeList.push(this.moderateBalanceChallengeGenerator());
        balanceChallengeList.push(this.moderateTiltPredictionChallengeGenerator());
        balanceChallengeList.push(this.moderateMassDeductionChallengeGenerator());
        break;
      case 3:
        balanceChallengeList.push(this.advancedTiltPredictionChallengeGenerator());
        balanceChallengeList.push(this.advancedBalanceChallengeGenerator());
        balanceChallengeList.push(this.moderateMassDeductionChallengeGenerator());
        balanceChallengeList.push(this.advancedTiltPredictionChallengeGenerator());
        balanceChallengeList.push(this.moderateMassDeductionChallengeGenerator());
        balanceChallengeList.push(this.advancedBalanceChallengeGenerator());
        break;
      default:
        throw new Error(`Can't generate challenge set for requested level: ${level}`);
    }
    return balanceChallengeList;
  }
};
balancingAct.register('BalanceGameChallengeFactory', BalanceGameChallengeFactory);
export default BalanceGameChallengeFactory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJVdGlscyIsIlZlY3RvcjIiLCJiYWxhbmNpbmdBY3QiLCJCQVNoYXJlZENvbnN0YW50cyIsIkJhcnJlbCIsIkJpZ1JvY2siLCJCb3kiLCJCcmlja1N0YWNrIiwiQ2luZGVyQmxvY2siLCJDcmF0ZSIsIkZpcmVIeWRyYW50IiwiRmxvd2VyUG90IiwiR2lybCIsIkxhcmdlQnVja2V0IiwiTGFyZ2VUcmFzaENhbiIsIk1hbiIsIk1lZGl1bUJ1Y2tldCIsIk1lZGl1bVJvY2siLCJQb3R0ZWRQbGFudCIsIlB1cHB5IiwiU21hbGxCdWNrZXQiLCJTbWFsbFJvY2siLCJTb2RhQm90dGxlIiwiVGVsZXZpc2lvbiIsIlRpbnlSb2NrIiwiVGlyZSIsIldvbWFuIiwiUGxhbmsiLCJCYWxhbmNlTWFzc2VzQ2hhbGxlbmdlIiwiTWFzc0RlZHVjdGlvbkNoYWxsZW5nZSIsIlRpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlIiwiTUFYX0RJU1RBTkNFX0ZST01fQkFMQU5DRV9DRU5URVJfVE9fTUFTUyIsInJvdW5kU3ltbWV0cmljIiwiTEVOR1RIIiwiSU5URVJfU05BUF9UT19NQVJLRVJfRElTVEFOQ0UiLCJNQVhfR0VOX0FUVEVNUFRTIiwiTUFYX0hBTFZJTkdfT0ZfUEFTVF9MSVNUIiwiQkFMQU5DRV9DSEFMTEVOR0VfTUFTU0VTIiwiWkVSTyIsIk1ZU1RFUllfTUFTU0VTIiwiTE9XX1BST0ZJTEVfTUFTU0VTIiwidXNlZEJhbGFuY2VDaGFsbGVuZ2VzIiwidXNlZE1hc3NEZWR1Y3Rpb25DaGFsbGVuZ2VzIiwidXNlZFRpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlcyIsIkJhbGFuY2VHYW1lQ2hhbGxlbmdlRmFjdG9yeSIsInJhbmRJbnQiLCJtYXgiLCJNYXRoIiwiZmxvb3IiLCJuZXh0RG91YmxlIiwiaXNDaGFsbGVuZ2VTb2x2YWJsZSIsImZpeGVkTWFzc1ZhbHVlIiwibW92YWJsZU1hc3NWYWx1ZSIsImRpc3RhbmNlSW5jcmVtZW50IiwibWF4RGlzdGFuY2UiLCJDT01QQVJJU09OX1RPTEVSQU5DRSIsImNob29zZVJhbmRvbVZhbGlkRml4ZWRNYXNzRGlzdGFuY2UiLCJ2YWxpZEZpeGVkTWFzc0Rpc3RhbmNlcyIsImdldFBvc3NpYmxlRGlzdGFuY2VMaXN0IiwibGVuZ3RoIiwicG9zaXRpb25NYXNzZXNDbG9zZVRvQmFsYW5jaW5nIiwibWluRGlzdGFuY2UiLCJtYXNzZXMiLCJiZXN0TmV0VG9ycXVlIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJtaW5BY2NlcHRhYmxlVG9ycXVlIiwiZGlzdGFuY2VMaXN0IiwiYmVzdERpc3RhbmNlTGlzdCIsImkiLCJqIiwiY2FuZGlkYXRlRGlzdGFuY2UiLCJnZW5lcmF0ZVJhbmRvbVZhbGlkUGxhbmtEaXN0YW5jZSIsImluZGV4T2YiLCJwdXNoIiwiayIsImNvbnNvbGUiLCJsb2ciLCJuZXRUb3JxdWUiLCJtIiwibWFzc1ZhbHVlIiwiYWJzIiwic2xpY2UiLCJyZXBvc2l0aW9uZWRNYXNzZXMiLCJtYXNzIiwiZGlzdGFuY2UiLCJpbmNyZW1lbnQiLCJtYXhJbmNyZW1lbnRzIiwiZ2VuZXJhdGVSYW5kb21WYWxpZFBsYW5rRGlzdGFuY2VSYW5nZSIsIm1pbkluY3JlbWVudHMiLCJjZWlsIiwiZ2VuZXJhdGVTb2x2YWJsZUNoYWxsZW5nZXMiLCJmaXhlZE1hc3MxUHJvdG90eXBlIiwiZml4ZWRNYXNzMlByb3RvdHlwZSIsIm1vdmFibGVNYXNzUHJvdG90eXBlIiwic29sdmFibGVDaGFsbGVuZ2VzIiwiZml4ZWRNYXNzMURpc3RhbmNlIiwiZml4ZWRNYXNzMkRpc3RhbmNlIiwiZml4ZWRNYXNzVG9ycXVlIiwibW92YWJsZU1hc3NEaXN0YW5jZSIsImNyZWF0ZTJGaXhlZDFNb3ZhYmxlIiwiY3JlYXRlQ29weSIsIm1hc3NPZkZpeGVkSXRlbSIsIm1hc3NPZk1vdmFibGVJdGVtIiwidGVzdERpc3RhbmNlIiwiTUFYX1ZBTElEX01BU1NfRElTVEFOQ0VfRlJPTV9DRU5URVIiLCJwb3NzaWJsZUZpeGVkTWFzc0Rpc3RhbmNlIiwiY3JlYXRlVHdvQnJpY2tTdGFja0NoYWxsZW5nZSIsIm51bUJyaWNrc0luRml4ZWRTdGFjayIsImZpeGVkU3RhY2tEaXN0YW5jZUZyb21DZW50ZXIiLCJudW1Ccmlja3NJbk1vdmFibGVTdGFjayIsImNyZWF0ZTFGaXhlZDFNb3ZhYmxlIiwiY3JlYXRlTWFzc0J5UmF0aW8iLCJyYXRpb3MiLCJpbmRleE9mZnNldCIsImNhbmRpZGF0ZU1hc3NQcm90b3R5cGUiLCJnZW5lcmF0ZVNpbXBsZUJhbGFuY2VDaGFsbGVuZ2UiLCJudW1Ccmlja3MiLCJnZW5lcmF0ZUVhc3lCYWxhbmNlQ2hhbGxlbmdlIiwidmFsaWRGaXhlZFN0YWNrRGlzdGFuY2VzIiwicG93IiwiQlJJQ0tfTUFTUyIsImdlbmVyYXRlTW9kZXJhdGVCYWxhbmNlQ2hhbGxlbmdlIiwiZml4ZWRNYXNzUHJvdG90eXBlIiwibW92YWJsZU1hc3MiLCJhc3NlcnQiLCJnZW5lcmF0ZUFkdmFuY2VkQmFsYW5jZUNoYWxsZW5nZSIsImdlbmVyYXRlU2ltcGxlVGlsdFByZWRpY3Rpb25DaGFsbGVuZ2UiLCJudW1Ccmlja3NJbkxlZnRTdGFjayIsIm51bUJyaWNrc0luUmlnaHRTdGFjayIsImRpc3RhbmNlRnJvbVBsYW5rQ2VudGVyIiwiY3JlYXRlIiwiZ2VuZXJhdGVFYXN5VGlsdFByZWRpY3Rpb25DaGFsbGVuZ2UiLCJsZWZ0TWFzc0Rpc3RhbmNlIiwicmlnaHRNYXNzRGlzdGFuY2UiLCJnZW5lcmF0ZU1vZGVyYXRlVGlsdFByZWRpY3Rpb25DaGFsbGVuZ2UiLCJsZWZ0TWFzcyIsInJpZ2h0TWFzcyIsInRlbXBNYXNzUHJvdG90eXBlIiwibWFzc0Rpc3RhbmNlUGFpcnMiLCJnZW5lcmF0ZUFkdmFuY2VkVGlsdFByZWRpY3Rpb25DaGFsbGVuZ2UiLCJtYXNzMSIsIm1hc3MyIiwibWFzczMiLCJnZW5lcmF0ZVNpbXBsZU1hc3NEZWR1Y3Rpb25DaGFsbGVuZ2UiLCJrbm93bk1hc3MiLCJteXN0ZXJ5TWFzc1Byb3RvdHlwZSIsIm15c3RlcnlNYXNzRGlzdGFuY2VGcm9tQ2VudGVyIiwiZ2VuZXJhdGVFYXN5TWFzc0RlZHVjdGlvbkNoYWxsZW5nZSIsInBvc3NpYmxlRGlzdGFuY2VzIiwiZ2VuZXJhdGVNb2RlcmF0ZU1hc3NEZWR1Y3Rpb25DaGFsbGVuZ2UiLCJyZW1vdmVPbGRlc3RIYWxmT2ZMaXN0IiwibGlzdCIsInNwbGljZSIsImdlbmVyYXRlVW5pcXVlQ2hhbGxlbmdlIiwiY2hhbGxlbmdlR2VuZXJhdG9yIiwidW5pcXVlbmVzc1Rlc3QiLCJwcmV2aW91c0NoYWxsZW5nZXMiLCJjaGFsbGVuZ2UiLCJ1bmlxdWVDaGFsbGVuZ2VHZW5lcmF0ZWQiLCJ1c2VzVW5pcXVlTWFzc2VzIiwidGVzdENoYWxsZW5nZSIsInVzZWRDaGFsbGVuZ2VMaXN0IiwiXyIsInNvbWUiLCJ1c2VzU2FtZU1hc3NlcyIsInVzZXNVbmlxdWVGaXhlZE1hc3Nlc0FuZERpc3RhbmNlcyIsInVzZXNTYW1lRml4ZWRNYXNzZXNBbmREaXN0YW5jZXMiLCJ1c2VzVW5pcXVlRml4ZWRNYXNzZXMiLCJ1c2VzU2FtZUZpeGVkTWFzc2VzIiwiZ2VuZXJhdGVCYWxhbmNlQ2hhbGxlbmdlIiwibGV2ZWwiLCJiYWxhbmNlQ2hhbGxlbmdlR2VuZXJhdG9ycyIsImJpbmQiLCJzaW1wbGVCYWxhbmNlQ2hhbGxlbmdlR2VuZXJhdG9yIiwiZWFzeUJhbGFuY2VDaGFsbGVuZ2VHZW5lcmF0b3IiLCJtb2RlcmF0ZUJhbGFuY2VDaGFsbGVuZ2VHZW5lcmF0b3IiLCJhZHZhbmNlZEJhbGFuY2VDaGFsbGVuZ2VHZW5lcmF0b3IiLCJzaW1wbGVNYXNzRGVkdWN0aW9uQ2hhbGxlbmdlR2VuZXJhdG9yIiwiZWFzeU1hc3NEZWR1Y3Rpb25DaGFsbGVuZ2VHZW5lcmF0b3IiLCJtb2RlcmF0ZU1hc3NEZWR1Y3Rpb25DaGFsbGVuZ2VHZW5lcmF0b3IiLCJzaW1wbGVUaWx0UHJlZGljdGlvbkNoYWxsZW5nZUdlbmVyYXRvciIsImVhc3lUaWx0UHJlZGljdGlvbkNoYWxsZW5nZUdlbmVyYXRvciIsIm1vZGVyYXRlVGlsdFByZWRpY3Rpb25DaGFsbGVuZ2VHZW5lcmF0b3IiLCJhZHZhbmNlZFRpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlR2VuZXJhdG9yIiwiZ2VuZXJhdGVDaGFsbGVuZ2VTZXQiLCJiYWxhbmNlQ2hhbGxlbmdlTGlzdCIsIkVycm9yIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYWxhbmNlR2FtZUNoYWxsZW5nZUZhY3RvcnkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhpcyBpcyBhIGZhY3RvcnkgcGF0dGVybiBvYmplY3QgdGhhdCBnZW5lcmF0ZXMgc2V0cyBvZiBjaGFsbGVuZ2VzIGZvciB1c2UgaW5cclxuICogdGhlIGJhbGFuY2UgZ2FtZS4gIEluIHRoaXMgdHlwZSwgdGhlIHRlcm1pbm9sb2d5IHVzZWQgdG8gZGlzdGluZ3Vpc2hcclxuICogYmV0d2VlbiB0aGUgdmFyaW91cyBsZXZlbHMgb2YgZGlmZmljdWx0eSBmb3IgdGhlIGNoYWxsZW5nZXMgYXJlIChpbiBvcmRlciBvZlxyXG4gKiBpbmNyZWFzaW5nIGRpZmZpY3VsdHkpOlxyXG4gKiAtIFNpbXBsZVxyXG4gKiAtIEVhc3lcclxuICogLSBNb2RlcmF0ZVxyXG4gKiAtIEFkdmFuY2VkXHJcbiAqIFRoaXMgaXMgbm90IHRvIGJlIGNvbmZ1c2VkIHdpdGggdGhlIG51bWVyaWNhbCBnYW1lIGxldmVscywgc2luY2UgdGhlcmUgaXNcclxuICogbm90IG5lY2Vzc2FyaWx5IGEgZGlyZWN0IGNvcnJlc3BvbmRlbmNlIGJldHdlZW4gdGhlIG51bWVyaWNhbCBsZXZlbHMgYW5kXHJcbiAqIGFsbCBvZiB0aGUgY2hhbGxlbmdlcyBnZW5lcmF0ZWQgZm9yIHRoYXQgbGV2ZWwuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgYmFsYW5jaW5nQWN0IGZyb20gJy4uLy4uL2JhbGFuY2luZ0FjdC5qcyc7XHJcbmltcG9ydCBCQVNoYXJlZENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQkFTaGFyZWRDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQmFycmVsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9tYXNzZXMvQmFycmVsLmpzJztcclxuaW1wb3J0IEJpZ1JvY2sgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL21hc3Nlcy9CaWdSb2NrLmpzJztcclxuaW1wb3J0IEJveSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvbWFzc2VzL0JveS5qcyc7XHJcbmltcG9ydCBCcmlja1N0YWNrIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9tYXNzZXMvQnJpY2tTdGFjay5qcyc7XHJcbmltcG9ydCBDaW5kZXJCbG9jayBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvbWFzc2VzL0NpbmRlckJsb2NrLmpzJztcclxuaW1wb3J0IENyYXRlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9tYXNzZXMvQ3JhdGUuanMnO1xyXG5pbXBvcnQgRmlyZUh5ZHJhbnQgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL21hc3Nlcy9GaXJlSHlkcmFudC5qcyc7XHJcbmltcG9ydCBGbG93ZXJQb3QgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL21hc3Nlcy9GbG93ZXJQb3QuanMnO1xyXG5pbXBvcnQgR2lybCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvbWFzc2VzL0dpcmwuanMnO1xyXG5pbXBvcnQgTGFyZ2VCdWNrZXQgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL21hc3Nlcy9MYXJnZUJ1Y2tldC5qcyc7XHJcbmltcG9ydCBMYXJnZVRyYXNoQ2FuIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9tYXNzZXMvTGFyZ2VUcmFzaENhbi5qcyc7XHJcbmltcG9ydCBNYW4gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL21hc3Nlcy9NYW4uanMnO1xyXG5pbXBvcnQgTWVkaXVtQnVja2V0IGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9tYXNzZXMvTWVkaXVtQnVja2V0LmpzJztcclxuaW1wb3J0IE1lZGl1bVJvY2sgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL21hc3Nlcy9NZWRpdW1Sb2NrLmpzJztcclxuaW1wb3J0IFBvdHRlZFBsYW50IGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9tYXNzZXMvUG90dGVkUGxhbnQuanMnO1xyXG5pbXBvcnQgUHVwcHkgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL21hc3Nlcy9QdXBweS5qcyc7XHJcbmltcG9ydCBTbWFsbEJ1Y2tldCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvbWFzc2VzL1NtYWxsQnVja2V0LmpzJztcclxuaW1wb3J0IFNtYWxsUm9jayBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvbWFzc2VzL1NtYWxsUm9jay5qcyc7XHJcbmltcG9ydCBTb2RhQm90dGxlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9tYXNzZXMvU29kYUJvdHRsZS5qcyc7XHJcbmltcG9ydCBUZWxldmlzaW9uIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9tYXNzZXMvVGVsZXZpc2lvbi5qcyc7XHJcbmltcG9ydCBUaW55Um9jayBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvbWFzc2VzL1RpbnlSb2NrLmpzJztcclxuaW1wb3J0IFRpcmUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL21hc3Nlcy9UaXJlLmpzJztcclxuaW1wb3J0IFdvbWFuIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9tYXNzZXMvV29tYW4uanMnO1xyXG5pbXBvcnQgUGxhbmsgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1BsYW5rLmpzJztcclxuaW1wb3J0IEJhbGFuY2VNYXNzZXNDaGFsbGVuZ2UgZnJvbSAnLi9CYWxhbmNlTWFzc2VzQ2hhbGxlbmdlLmpzJztcclxuaW1wb3J0IE1hc3NEZWR1Y3Rpb25DaGFsbGVuZ2UgZnJvbSAnLi9NYXNzRGVkdWN0aW9uQ2hhbGxlbmdlLmpzJztcclxuaW1wb3J0IFRpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlIGZyb20gJy4vVGlsdFByZWRpY3Rpb25DaGFsbGVuZ2UuanMnO1xyXG5cclxuLy8gTWF4aW11bSBhbGxvd2VkIGRpc3RhbmNlIGZyb20gY2VudGVyIG9mIGJhbGFuY2UgZm9yIHBvc2l0aW9uaW5nIGEgbWFzcy5cclxuY29uc3QgTUFYX0RJU1RBTkNFX0ZST01fQkFMQU5DRV9DRU5URVJfVE9fTUFTUyA9ICggVXRpbHMucm91bmRTeW1tZXRyaWMoIFBsYW5rLkxFTkdUSCAvIFBsYW5rLklOVEVSX1NOQVBfVE9fTUFSS0VSX0RJU1RBTkNFIC8gMiApIC0gMSApICogUGxhbmsuSU5URVJfU05BUF9UT19NQVJLRVJfRElTVEFOQ0U7XHJcblxyXG4vLyBQYXJhbWV0ZXJzIHRoYXQgY29udHJvbCBob3cgbWFueSBhdHRlbXB0cyBhcmUgbWFkZSB0byBnZW5lcmF0ZSBhIHVuaXF1ZVxyXG4vLyBiYWxhbmNlIGNoYWxsZW5nZS5cclxuY29uc3QgTUFYX0dFTl9BVFRFTVBUUyA9IDUwO1xyXG5jb25zdCBNQVhfSEFMVklOR19PRl9QQVNUX0xJU1QgPSAzO1xyXG5cclxuLy8gTGlzdCBvZiBtYXNzZXMgdGhhdCBjYW4gYmUgdXNlZCBvbiBlaXRoZXIgc2lkZSBvZiB0aGUgYmFsYW5jZSBjaGFsbGVuZ2VzXHJcbi8vIG9yIGFzIHRoZSBmaXhlZCBtYXNzZXMgaW4gbWFzcyBkZWR1Y3Rpb24gY2hhbGxlbmdlcy5cclxuY29uc3QgQkFMQU5DRV9DSEFMTEVOR0VfTUFTU0VTID0gW1xyXG4gIG5ldyBCcmlja1N0YWNrKCAxLCBWZWN0b3IyLlpFUk8gKSxcclxuICBuZXcgQnJpY2tTdGFjayggMiwgVmVjdG9yMi5aRVJPICksXHJcbiAgbmV3IEJyaWNrU3RhY2soIDMsIFZlY3RvcjIuWkVSTyApLFxyXG4gIG5ldyBCcmlja1N0YWNrKCA0LCBWZWN0b3IyLlpFUk8gKSxcclxuICBuZXcgVGlueVJvY2soIFZlY3RvcjIuWkVSTywgZmFsc2UgKSxcclxuICBuZXcgU21hbGxSb2NrKCBWZWN0b3IyLlpFUk8sIGZhbHNlICksXHJcbiAgbmV3IE1lZGl1bVJvY2soIFZlY3RvcjIuWkVSTywgZmFsc2UgKSxcclxuICBuZXcgQmlnUm9jayggVmVjdG9yMi5aRVJPLCBmYWxzZSApLFxyXG4gIG5ldyBCb3koIFZlY3RvcjIuWkVSTywgZmFsc2UgKSxcclxuICBuZXcgR2lybCggVmVjdG9yMi5aRVJPLCBmYWxzZSApLFxyXG4gIG5ldyBNYW4oIFZlY3RvcjIuWkVSTywgZmFsc2UgKSxcclxuICBuZXcgV29tYW4oIFZlY3RvcjIuWkVSTywgZmFsc2UgKSxcclxuICBuZXcgQmFycmVsKCBWZWN0b3IyLlpFUk8sIGZhbHNlICksXHJcbiAgbmV3IENpbmRlckJsb2NrKCBWZWN0b3IyLlpFUk8sIGZhbHNlICksXHJcbiAgbmV3IFB1cHB5KCBWZWN0b3IyLlpFUk8sIGZhbHNlICksXHJcbiAgbmV3IFNvZGFCb3R0bGUoIFZlY3RvcjIuWkVSTywgZmFsc2UgKSxcclxuICBuZXcgU21hbGxCdWNrZXQoIFZlY3RvcjIuWkVSTywgZmFsc2UgKVxyXG5dO1xyXG5cclxuLy8gTGlzdCBvZiBtYXNzZXMgdGhhdCBjYW4gYmUgdXNlZCBhcyBcIm15c3RlcnkgbWFzc2VzXCIgaW4gdGhlIG1hc3NcclxuLy8gZGVkdWN0aW9uIGNoYWxsZW5nZXMuICBUaGVzZSBzaG91bGQgbm90IGFwcGVhciBpbiBvdGhlciB0YWJzLCBsZXN0IHRoZVxyXG4vLyB1c2VyIGNvdWxkIGFscmVhZHkga25vdyB0aGVpciBtYXNzLlxyXG5jb25zdCBNWVNURVJZX01BU1NFUyA9IFtcclxuICBuZXcgRmlyZUh5ZHJhbnQoIFZlY3RvcjIuWkVSTywgdHJ1ZSApLFxyXG4gIG5ldyBUZWxldmlzaW9uKCBWZWN0b3IyLlpFUk8sIHRydWUgKSxcclxuICBuZXcgTGFyZ2VUcmFzaENhbiggVmVjdG9yMi5aRVJPLCB0cnVlICksXHJcbiAgbmV3IFNtYWxsUm9jayggVmVjdG9yMi5aRVJPLCB0cnVlICksXHJcbiAgbmV3IENyYXRlKCBWZWN0b3IyLlpFUk8sIHRydWUgKSxcclxuICBuZXcgRmxvd2VyUG90KCBWZWN0b3IyLlpFUk8sIHRydWUgKSxcclxuICBuZXcgTWVkaXVtQnVja2V0KCBWZWN0b3IyLlpFUk8sIHRydWUgKSxcclxuICBuZXcgTGFyZ2VCdWNrZXQoIFZlY3RvcjIuWkVSTywgdHJ1ZSApLFxyXG4gIG5ldyBQb3R0ZWRQbGFudCggVmVjdG9yMi5aRVJPLCB0cnVlICksXHJcbiAgbmV3IFRpcmUoIFZlY3RvcjIuWkVSTywgdHJ1ZSApXHJcbl07XHJcblxyXG4vLyBMaXN0IG9mIG1hc3NlcyB0aGF0IGFyZSBcImxvdyBwcm9maWxlXCIsIG1lYW5pbmcgdGhhdCB0aGV5IGFyZSBzaG9ydC5cclxuLy8gVGhpcyBpcyBuZWVkZWQgZm9yIHRoZSB0aWx0LXByZWRpY3Rpb24gc3R5bGUgb2YgcHJvYmxlbSwgc2luY2UgdGFsbGVyXHJcbi8vIG1hc3NlcyBlbmQgdXAgZ29pbmcgYmVoaW5kIHRoZSB0aWx0IHByZWRpY3Rpb24gc2VsZWN0b3IuXHJcbmNvbnN0IExPV19QUk9GSUxFX01BU1NFUyA9IFtcclxuICBuZXcgVGlueVJvY2soIFZlY3RvcjIuWkVSTywgZmFsc2UgKSxcclxuICBuZXcgU21hbGxSb2NrKCBWZWN0b3IyLlpFUk8sIGZhbHNlICksXHJcbiAgbmV3IE1lZGl1bVJvY2soIFZlY3RvcjIuWkVSTywgZmFsc2UgKSxcclxuICBuZXcgQ2luZGVyQmxvY2soIFZlY3RvcjIuWkVSTywgZmFsc2UgKSxcclxuICBuZXcgU21hbGxCdWNrZXQoIFZlY3RvcjIuWkVSTywgZmFsc2UgKVxyXG5dO1xyXG5cclxuLy8gTGlzdHMgdXNlZCB0byBrZWVwIHRyYWNrIG9mIHRoZSBjaGFsbGVuZ2VzIGdlbmVyYXRlZCBzbyBmYXIgc28gdGhhdCB3ZVxyXG4vLyBjYW4gYXZvaWQgY3JlYXRpbmcgdGhlIHNhbWUgY2hhbGxlbmdlcyBtdWx0aXBsZSB0aW1lcy5cclxuY29uc3QgdXNlZEJhbGFuY2VDaGFsbGVuZ2VzID0gW107XHJcbmNvbnN0IHVzZWRNYXNzRGVkdWN0aW9uQ2hhbGxlbmdlcyA9IFtdO1xyXG5jb25zdCB1c2VkVGlsdFByZWRpY3Rpb25DaGFsbGVuZ2VzID0gW107XHJcblxyXG5jb25zdCBCYWxhbmNlR2FtZUNoYWxsZW5nZUZhY3RvcnkgPSB7XHJcblxyXG4gIC8vIEdlbmVyYXRlIGEgcmFuZG9tIGludGVnZXIgZnJvbSAwIChpbmNsdXNpdmUpIHRvIG1heCAoZXhjbHVzaXZlKVxyXG4gIHJhbmRJbnQoIG1heCApIHtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKCBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogbWF4ICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lIHdoZXRoZXIgYSBjaGFsbGVuZ2Ugd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzIGZvciB0aGUgZml4ZWQgYW5kXHJcbiAgICogbW92YWJsZSBtYXNzZXMgYW5kIHRoZSBnaXZlbiBjb25zdHJhaW50cyBvbiB0aGUgcGxhbmsgY2FuIGJlIHNvbHZlZC5cclxuICAgKi9cclxuICBpc0NoYWxsZW5nZVNvbHZhYmxlKCBmaXhlZE1hc3NWYWx1ZSwgbW92YWJsZU1hc3NWYWx1ZSwgZGlzdGFuY2VJbmNyZW1lbnQsIG1heERpc3RhbmNlICkge1xyXG4gICAgaWYgKCBmaXhlZE1hc3NWYWx1ZSAqIGRpc3RhbmNlSW5jcmVtZW50ID4gbW92YWJsZU1hc3NWYWx1ZSAqIG1heERpc3RhbmNlIHx8IGZpeGVkTWFzc1ZhbHVlICogbWF4RGlzdGFuY2UgPCBtb3ZhYmxlTWFzc1ZhbHVlICogZGlzdGFuY2VJbmNyZW1lbnQgKSB7XHJcbiAgICAgIC8vIFRoZSBiYWxhbmNlIGlzIG5vdCBsb25nIGVub3VnaCB0byBhbGxvdyB0aGVzZSBtYXNzZXMgdG8gYmUgYmFsYW5jZWQuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gKCBmaXhlZE1hc3NWYWx1ZSAvIG1vdmFibGVNYXNzVmFsdWUgKSAlIGRpc3RhbmNlSW5jcmVtZW50IDw9IEJBU2hhcmVkQ29uc3RhbnRzLkNPTVBBUklTT05fVE9MRVJBTkNFO1xyXG4gIH0sXHJcblxyXG4gIGNob29zZVJhbmRvbVZhbGlkRml4ZWRNYXNzRGlzdGFuY2UoIGZpeGVkTWFzc1ZhbHVlLCBtb3ZhYmxlTWFzc1ZhbHVlICkge1xyXG4gICAgY29uc3QgdmFsaWRGaXhlZE1hc3NEaXN0YW5jZXMgPSB0aGlzLmdldFBvc3NpYmxlRGlzdGFuY2VMaXN0KCBmaXhlZE1hc3NWYWx1ZSwgbW92YWJsZU1hc3NWYWx1ZSApO1xyXG5cclxuICAgIC8vIFJhbmRvbWx5IGNob29zZSBhIGRpc3RhbmNlIHRvIHVzZSBmcm9tIHRoZSBpZGVudGlmaWVkIHNldC5cclxuICAgIHJldHVybiAtdmFsaWRGaXhlZE1hc3NEaXN0YW5jZXNbIHRoaXMucmFuZEludCggdmFsaWRGaXhlZE1hc3NEaXN0YW5jZXMubGVuZ3RoICkgXTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBUYWtlIGEgbGlzdCBvZiBtYXNzZXMgYW5kIHJldHVybiBhIHNldCBvZiBtYXNzLWRpc3RhbmNlIHBhaXJzIHRoYXRcclxuICAgKiBwb3NpdGlvbiB0aGUgbWFzc2VzIHN1Y2ggdGhhdCB0aGV5IGFyZSBjbG9zZSB0byBiZWluZyBiYWxhbmNlZCBidXQgYXJlXHJcbiAgICogTk9UIGJhbGFuY2VkLiAgVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCB0aGF0IHdhcyB3cml0dGVuIHRvXHJcbiAgICogY29uc29saWRhdGUgc29tZSBjb2RlIHdyaXR0ZW4gZm9yIGdlbmVyYXRpbmcgdGlsdC1wcmVkaWN0aW9uIGNoYWxsZW5nZXMuXHJcbiAgICovXHJcbiAgcG9zaXRpb25NYXNzZXNDbG9zZVRvQmFsYW5jaW5nKCBtaW5EaXN0YW5jZSwgbWF4RGlzdGFuY2UsIG1hc3NlcyApIHtcclxuICAgIGxldCBiZXN0TmV0VG9ycXVlID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgY29uc3QgbWluQWNjZXB0YWJsZVRvcnF1ZSA9IDE7IC8vIERldGVybWluZWQgZW1waXJpY2FsbHkuXHJcbiAgICBsZXQgZGlzdGFuY2VMaXN0ID0gW107XHJcbiAgICBsZXQgYmVzdERpc3RhbmNlTGlzdCA9IGRpc3RhbmNlTGlzdDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IE1BWF9HRU5fQVRURU1QVFM7IGkrKyApIHtcclxuICAgICAgZGlzdGFuY2VMaXN0ID0gW107XHJcbiAgICAgIC8vIEdlbmVyYXRlIGEgc2V0IG9mIHVuaXF1ZSwgcmFuZG9tLCBhbmQgdmFsaWQgZGlzdGFuY2VzIGZvciB0aGVcclxuICAgICAgLy8gcGxhY2VtZW50IG9mIHRoZSBtYXNzZXMuXHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgZGlzdGFuY2VMaXN0Lmxlbmd0aCA8IG1hc3Nlcy5sZW5ndGggJiYgaiA8IE1BWF9HRU5fQVRURU1QVFM7IGorKyApIHtcclxuICAgICAgICBsZXQgY2FuZGlkYXRlRGlzdGFuY2UgPSB0aGlzLmdlbmVyYXRlUmFuZG9tVmFsaWRQbGFua0Rpc3RhbmNlKCBtaW5EaXN0YW5jZSwgbWF4RGlzdGFuY2UgKTtcclxuICAgICAgICBpZiAoIGogPT09IDAgKSB7XHJcbiAgICAgICAgICAvLyBSYW5kb21seSBpbnZlcnQgKG9yIGRvbid0KSB0aGUgZmlyc3QgcmFuZG9tIGRpc3RhbmNlLlxyXG4gICAgICAgICAgY2FuZGlkYXRlRGlzdGFuY2UgPSBkb3RSYW5kb20ubmV4dERvdWJsZSgpID49IDAuNSA/IC1jYW5kaWRhdGVEaXN0YW5jZSA6IGNhbmRpZGF0ZURpc3RhbmNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIE1ha2UgdGhlIHNpZ24gb2YgdGhpcyBkaXN0YW5jZSBiZSB0aGUgb3Bwb3NpdGUgb2YgdGhlXHJcbiAgICAgICAgICAvLyBwcmV2aW91cyBvbmUuXHJcbiAgICAgICAgICBjYW5kaWRhdGVEaXN0YW5jZSA9IGRpc3RhbmNlTGlzdFsgZGlzdGFuY2VMaXN0Lmxlbmd0aCAtIDEgXSA+IDAgPyAtY2FuZGlkYXRlRGlzdGFuY2UgOiBjYW5kaWRhdGVEaXN0YW5jZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgdW5pcXVlLlxyXG4gICAgICAgIGlmICggZGlzdGFuY2VMaXN0LmluZGV4T2YoIGNhbmRpZGF0ZURpc3RhbmNlICkgPT09IC0xICkge1xyXG4gICAgICAgICAgZGlzdGFuY2VMaXN0LnB1c2goIGNhbmRpZGF0ZURpc3RhbmNlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIC8vIEhhbmRsZSB0aGUgdW5saWtlbHkgY2FzZSB3aGVyZSBlbm91Z2ggdW5pcXVlIGRpc3RhbmNlcyBjb3VsZG4ndFxyXG4gICAgICAvLyBiZSBmb3VuZC5cclxuICAgICAgaWYgKCBkaXN0YW5jZUxpc3QubGVuZ3RoICE9PSBtYXNzZXMubGVuZ3RoICkge1xyXG4gICAgICAgIGRpc3RhbmNlTGlzdCA9IFtdO1xyXG4gICAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IG1hc3Nlcy5sZW5ndGg7IGsrKyApIHtcclxuICAgICAgICAgIC8vIEp1c3QgYWRkIGEgbGluZWFyIHNldCBvZiBkaXN0YW5jZXMuXHJcbiAgICAgICAgICBkaXN0YW5jZUxpc3QucHVzaCggbWluRGlzdGFuY2UgKyBQbGFuay5JTlRFUl9TTkFQX1RPX01BUktFUl9ESVNUQU5DRSAqIGsgKTtcclxuICAgICAgICAgIC8vIE91dHB1dCBhIHdhcm5pbmcuXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyggJyBXYXJuaW5nOiBVbmFibGUgdG8gZmluZCBlbm91Z2ggdW5pcXVlIGRpc3RhbmNlcyBmb3IgcG9zaXRpb25pbmcgbWFzc2VzLicgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBuZXQgdG9ycXVlIGZvciB0aGlzIHNldCBvZiBtYXNzZXMuXHJcbiAgICAgIGxldCBuZXRUb3JxdWUgPSAwO1xyXG4gICAgICBmb3IgKCBsZXQgbSA9IDA7IG0gPCBtYXNzZXMubGVuZ3RoOyBtKysgKSB7XHJcbiAgICAgICAgbmV0VG9ycXVlICs9IG1hc3Nlc1sgbSBdLm1hc3NWYWx1ZSAqIGRpc3RhbmNlTGlzdFsgbSBdO1xyXG4gICAgICB9XHJcbiAgICAgIG5ldFRvcnF1ZSA9IE1hdGguYWJzKCBuZXRUb3JxdWUgKTtcclxuICAgICAgaWYgKCBuZXRUb3JxdWUgPCBiZXN0TmV0VG9ycXVlICYmIG5ldFRvcnF1ZSA+IG1pbkFjY2VwdGFibGVUb3JxdWUgKSB7XHJcbiAgICAgICAgYmVzdE5ldFRvcnF1ZSA9IG5ldFRvcnF1ZTtcclxuICAgICAgICBiZXN0RGlzdGFuY2VMaXN0ID0gZGlzdGFuY2VMaXN0LnNsaWNlKCAwICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGFycmF5IG9mIG1hc3MtZGlzdGFuY2UgcGFpcnMgZnJvbSB0aGUgb3JpZ2luYWwgc2V0IG9mXHJcbiAgICAvLyBtYXNzZXMgYW5kIHRoZSBiZXN0IHJhbmRvbWx5LWdlbmVyYXRlZCBkaXN0YW5jZXMuXHJcbiAgICBjb25zdCByZXBvc2l0aW9uZWRNYXNzZXMgPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG1hc3Nlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgcmVwb3NpdGlvbmVkTWFzc2VzLnB1c2goIHsgbWFzczogbWFzc2VzWyBpIF0sIGRpc3RhbmNlOiBiZXN0RGlzdGFuY2VMaXN0WyBpIF0gfSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcG9zaXRpb25lZE1hc3NlcztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDb252ZW5pZW5jZSBmdW5jdGlvbiB0aGF0IGdlbmVyYXRlcyBhIHZhbGlkIHJhbmRvbSBkaXN0YW5jZSBmcm9tIHRoZVxyXG4gICAqIGNlbnRlciBvZiB0aGUgcGxhbmsuICBUaGUgcGxhbmsgb25seSBhbGxvd3MgZGlzY3JldGUgZGlzdGFuY2VzIChpLmUuIGl0XHJcbiAgICogaXMgcXVhbnRpemVkKSwgd2hpY2ggaXMgd2h5IHRoaXMgaXMgbmVlZGVkLlxyXG4gICAqL1xyXG4gIGdlbmVyYXRlUmFuZG9tVmFsaWRQbGFua0Rpc3RhbmNlKCkge1xyXG4gICAgY29uc3QgbWF4RGlzdGFuY2UgPSBQbGFuay5MRU5HVEggLyAyO1xyXG4gICAgY29uc3QgaW5jcmVtZW50ID0gUGxhbmsuSU5URVJfU05BUF9UT19NQVJLRVJfRElTVEFOQ0U7XHJcbiAgICBjb25zdCBtYXhJbmNyZW1lbnRzID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIG1heERpc3RhbmNlIC8gaW5jcmVtZW50ICkgLSAxO1xyXG4gICAgcmV0dXJuICggdGhpcy5yYW5kSW50KCBtYXhJbmNyZW1lbnRzICkgKyAxICkgKiBpbmNyZW1lbnQ7XHJcbiAgfSxcclxuXHJcbiAgZ2VuZXJhdGVSYW5kb21WYWxpZFBsYW5rRGlzdGFuY2VSYW5nZSggbWluRGlzdGFuY2UsIG1heERpc3RhbmNlICkge1xyXG4gICAgY29uc3QgbWluSW5jcmVtZW50cyA9IE1hdGguY2VpbCggbWluRGlzdGFuY2UgLyBQbGFuay5JTlRFUl9TTkFQX1RPX01BUktFUl9ESVNUQU5DRSApO1xyXG4gICAgY29uc3QgbWF4SW5jcmVtZW50cyA9IE1hdGguZmxvb3IoIG1heERpc3RhbmNlIC8gUGxhbmsuSU5URVJfU05BUF9UT19NQVJLRVJfRElTVEFOQ0UgKTtcclxuXHJcbiAgICByZXR1cm4gKCB0aGlzLnJhbmRJbnQoIG1heEluY3JlbWVudHMgLSBtaW5JbmNyZW1lbnRzICsgMSApICsgbWluSW5jcmVtZW50cyApICogUGxhbmsuSU5URVJfU05BUF9UT19NQVJLRVJfRElTVEFOQ0U7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogR2VuZXJhdGUgdGhlIGxpc3Qgb2Ygc29sdmFibGUgYmFsYW5jZSBnYW1lIGNoYWxsZW5nZXMgdGhhdCBjYW4gYmVcclxuICAgKiBjcmVhdGVkIGZyb20gdGhlIGdpdmVuIHNldCBvZiB0d28gZml4ZWQgbWFzc2VzIGFuZCBvbmUgbW92YWJsZSBtYXNzLlxyXG4gICAqL1xyXG4gIGdlbmVyYXRlU29sdmFibGVDaGFsbGVuZ2VzKCBmaXhlZE1hc3MxUHJvdG90eXBlLCBmaXhlZE1hc3MyUHJvdG90eXBlLCBtb3ZhYmxlTWFzc1Byb3RvdHlwZSwgZGlzdGFuY2VJbmNyZW1lbnQsIG1heERpc3RhbmNlICkge1xyXG4gICAgY29uc3Qgc29sdmFibGVDaGFsbGVuZ2VzID0gW107XHJcbiAgICBmb3IgKCBsZXQgZml4ZWRNYXNzMURpc3RhbmNlID0gZGlzdGFuY2VJbmNyZW1lbnQ7IGZpeGVkTWFzczFEaXN0YW5jZSA8PSBtYXhEaXN0YW5jZTsgZml4ZWRNYXNzMURpc3RhbmNlICs9IGRpc3RhbmNlSW5jcmVtZW50ICkge1xyXG4gICAgICBmb3IgKCBsZXQgZml4ZWRNYXNzMkRpc3RhbmNlID0gZGlzdGFuY2VJbmNyZW1lbnQ7IGZpeGVkTWFzczJEaXN0YW5jZSA8PSBtYXhEaXN0YW5jZTsgZml4ZWRNYXNzMkRpc3RhbmNlICs9IGRpc3RhbmNlSW5jcmVtZW50ICkge1xyXG4gICAgICAgIGlmICggZml4ZWRNYXNzMURpc3RhbmNlID09PSBmaXhlZE1hc3MyRGlzdGFuY2UgfHwgTWF0aC5hYnMoIGZpeGVkTWFzczFEaXN0YW5jZSAtIGZpeGVkTWFzczJEaXN0YW5jZSApIDwgMS4xICogZGlzdGFuY2VJbmNyZW1lbnQgKSB7XHJcbiAgICAgICAgICAvLyBTa2lwIGNhc2VzIHdoZXJlIHRoZSBmaXhlZCBtYXNzZXMgYXJlIGF0IHRoZSBzYW1lXHJcbiAgICAgICAgICAvLyBwb3NpdGlvbiBvciBqdXN0IG9uZSBpbmNyZW1lbnQgYXBhcnQuXHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZml4ZWRNYXNzVG9ycXVlID0gZml4ZWRNYXNzMVByb3RvdHlwZS5tYXNzVmFsdWUgKiBmaXhlZE1hc3MxRGlzdGFuY2UgKyBmaXhlZE1hc3MyUHJvdG90eXBlLm1hc3NWYWx1ZSAqIGZpeGVkTWFzczJEaXN0YW5jZTtcclxuICAgICAgICBjb25zdCBtb3ZhYmxlTWFzc0Rpc3RhbmNlID0gZml4ZWRNYXNzVG9ycXVlIC8gbW92YWJsZU1hc3NQcm90b3R5cGUubWFzc1ZhbHVlO1xyXG4gICAgICAgIGlmICggbW92YWJsZU1hc3NEaXN0YW5jZSA+PSBkaXN0YW5jZUluY3JlbWVudCAmJiBtb3ZhYmxlTWFzc0Rpc3RhbmNlIDw9IG1heERpc3RhbmNlICYmIG1vdmFibGVNYXNzRGlzdGFuY2UgJSBkaXN0YW5jZUluY3JlbWVudCA9PT0gMCApIHtcclxuICAgICAgICAgIC8vIFRoaXMgaXMgYSBzb2x2YWJsZSBjb25maWd1cmF0aW9uLiAgQWRkIGl0IHRvIHRoZSBsaXN0LlxyXG4gICAgICAgICAgc29sdmFibGVDaGFsbGVuZ2VzLnB1c2goIEJhbGFuY2VNYXNzZXNDaGFsbGVuZ2UuY3JlYXRlMkZpeGVkMU1vdmFibGUoIGZpeGVkTWFzczFQcm90b3R5cGUuY3JlYXRlQ29weSgpLCBmaXhlZE1hc3MxRGlzdGFuY2UsXHJcbiAgICAgICAgICAgIGZpeGVkTWFzczJQcm90b3R5cGUuY3JlYXRlQ29weSgpLCBmaXhlZE1hc3MyRGlzdGFuY2UsIG1vdmFibGVNYXNzUHJvdG90eXBlLmNyZWF0ZUNvcHkoKSApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNvbHZhYmxlQ2hhbGxlbmdlcztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBsaXN0IG9mIHRoZSBkaXN0YW5jZXMgYXQgd2hpY2ggdGhlIGZpeGVkIG1hc3MgY291bGQgYmUgcG9zaXRpb25lZFxyXG4gICAqIHRoYXQgd291bGQgYWxsb3cgdGhlIG1vdmFibGUgbWFzcyB0byBiZSBwb3NpdGlvbmVkIHNvbWV3aGVyZSBvbiB0aGVcclxuICAgKiBvdGhlciBzaWRlIG9mIHRoZSBmdWxjcnVtIGFuZCBiYWxhbmNlIHRoZSBmaXhlZCBtYXNzLlxyXG4gICAqL1xyXG4gIGdldFBvc3NpYmxlRGlzdGFuY2VMaXN0KCBtYXNzT2ZGaXhlZEl0ZW0sIG1hc3NPZk1vdmFibGVJdGVtICkge1xyXG4gICAgY29uc3QgdmFsaWRGaXhlZE1hc3NEaXN0YW5jZXMgPSBbXTtcclxuICAgIGZvciAoIGxldCB0ZXN0RGlzdGFuY2UgPSBQbGFuay5JTlRFUl9TTkFQX1RPX01BUktFUl9ESVNUQU5DRTtcclxuICAgICAgICAgIHRlc3REaXN0YW5jZSA8PSBQbGFuay5NQVhfVkFMSURfTUFTU19ESVNUQU5DRV9GUk9NX0NFTlRFUjtcclxuICAgICAgICAgIHRlc3REaXN0YW5jZSArPSBQbGFuay5JTlRFUl9TTkFQX1RPX01BUktFUl9ESVNUQU5DRSApIHtcclxuXHJcbiAgICAgIGNvbnN0IHBvc3NpYmxlRml4ZWRNYXNzRGlzdGFuY2UgPSB0ZXN0RGlzdGFuY2UgKiBtYXNzT2ZNb3ZhYmxlSXRlbSAvIG1hc3NPZkZpeGVkSXRlbTtcclxuICAgICAgaWYgKCBwb3NzaWJsZUZpeGVkTWFzc0Rpc3RhbmNlIDw9IFBsYW5rLk1BWF9WQUxJRF9NQVNTX0RJU1RBTkNFX0ZST01fQ0VOVEVSICYmXHJcbiAgICAgICAgICAgcG9zc2libGVGaXhlZE1hc3NEaXN0YW5jZSA+PSBQbGFuay5JTlRFUl9TTkFQX1RPX01BUktFUl9ESVNUQU5DRSAtIEJBU2hhcmVkQ29uc3RhbnRzLkNPTVBBUklTT05fVE9MRVJBTkNFICYmXHJcbiAgICAgICAgICAgcG9zc2libGVGaXhlZE1hc3NEaXN0YW5jZSAlIFBsYW5rLklOVEVSX1NOQVBfVE9fTUFSS0VSX0RJU1RBTkNFIDwgQkFTaGFyZWRDb25zdGFudHMuQ09NUEFSSVNPTl9UT0xFUkFOQ0UgKSB7XHJcbiAgICAgICAgLy8gVGhpcyBpcyBhIHZhbGlkIGRpc3RhbmNlLlxyXG4gICAgICAgIHZhbGlkRml4ZWRNYXNzRGlzdGFuY2VzLnB1c2goIHBvc3NpYmxlRml4ZWRNYXNzRGlzdGFuY2UgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbGlkRml4ZWRNYXNzRGlzdGFuY2VzO1xyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZVR3b0JyaWNrU3RhY2tDaGFsbGVuZ2UoIG51bUJyaWNrc0luRml4ZWRTdGFjaywgZml4ZWRTdGFja0Rpc3RhbmNlRnJvbUNlbnRlciwgbnVtQnJpY2tzSW5Nb3ZhYmxlU3RhY2sgKSB7XHJcbiAgICByZXR1cm4gQmFsYW5jZU1hc3Nlc0NoYWxsZW5nZS5jcmVhdGUxRml4ZWQxTW92YWJsZSggbmV3IEJyaWNrU3RhY2soIG51bUJyaWNrc0luRml4ZWRTdGFjayApLCBmaXhlZFN0YWNrRGlzdGFuY2VGcm9tQ2VudGVyLCBuZXcgQnJpY2tTdGFjayggbnVtQnJpY2tzSW5Nb3ZhYmxlU3RhY2sgKSApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIG1hc3MgZnJvbSB0aGUgbGlzdCBvZiBhdmFpbGFibGUgZ2l2ZW4gYW4gb3JpZ2luYWwgbWFzcyB2YWx1ZVxyXG4gICAqIGFuZCBhIGxpc3Qgb2YgcmF0aW9zLiAgVGhlIGNyZWF0ZWQgbWFzcyB3aWxsIGhhdmUgYSBtYXNzIHZhbHVlIHRoYXRcclxuICAgKiBlcXVhbHMgdGhlIG9yaWdpbmFsIHZhbHVlIG11bHRpcGxpZWQgYnkgb25lIG9mIHRoZSBnaXZlbiByYXRpb3MuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWFzc1ZhbHVlIC0gTWFzcyBuZWVkZWRcclxuICAgKiBAcGFyYW0ge0FycmF5fSByYXRpb3MgLSBBcnJheSBvZiByYXRpb3MgKG1hc3NWYWx1ZSAvIGNyZWF0ZWRNYXNzVmFsdWUpIHdoaWNoIGFyZSBhY2NlcHRhYmxlLlxyXG4gICAqL1xyXG4gIGNyZWF0ZU1hc3NCeVJhdGlvKCBtYXNzVmFsdWUsIHJhdGlvcyApIHtcclxuICAgIGNvbnN0IGluZGV4T2Zmc2V0ID0gdGhpcy5yYW5kSW50KCBCQUxBTkNFX0NIQUxMRU5HRV9NQVNTRVMubGVuZ3RoICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBCQUxBTkNFX0NIQUxMRU5HRV9NQVNTRVMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZU1hc3NQcm90b3R5cGUgPSBCQUxBTkNFX0NIQUxMRU5HRV9NQVNTRVNbICggaSArIGluZGV4T2Zmc2V0ICkgJSBCQUxBTkNFX0NIQUxMRU5HRV9NQVNTRVMubGVuZ3RoIF07XHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHJhdGlvcy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICBpZiAoIGNhbmRpZGF0ZU1hc3NQcm90b3R5cGUubWFzc1ZhbHVlICogcmF0aW9zWyBqIF0gPT09IG1hc3NWYWx1ZSApIHtcclxuICAgICAgICAgIC8vIFdlIGhhdmUgZm91bmQgYSBtYXRjaGluZyBtYXNzLiAgQ2xvbmUgaXQgYW5kIHJldHVybiBpdC5cclxuICAgICAgICAgIHJldHVybiBjYW5kaWRhdGVNYXNzUHJvdG90eXBlLmNyZWF0ZUNvcHkoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB3ZSBtYWRlIGl0IHRvIGhlcmUsIHRoYXQgbWVhbnMgdGhhdCB0aGVyZSBpcyBubyBtYXNzIHRoYXRcclxuICAgIC8vIG1hdGNoZXMgdGhlIHNwZWNpZmllZCBjcml0ZXJpYS5cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH0sXHJcblxyXG4gIC8vIEdlbmVyYXRlIGEgc2ltcGxlIGNoYWxsZW5nZSB3aGVyZSBicmljayBzdGFja3Mgb2YgZXF1YWwgbWFzcyBhcHBlYXIgb24gZWFjaCBzaWRlLlxyXG4gIGdlbmVyYXRlU2ltcGxlQmFsYW5jZUNoYWxsZW5nZSgpIHtcclxuICAgIGNvbnN0IG51bUJyaWNrcyA9IHRoaXMucmFuZEludCggNCApICsgMTtcclxuICAgIGNvbnN0IGRpc3RhbmNlID0gLXRoaXMuZ2VuZXJhdGVSYW5kb21WYWxpZFBsYW5rRGlzdGFuY2UoKTtcclxuICAgIHJldHVybiB0aGlzLmNyZWF0ZVR3b0JyaWNrU3RhY2tDaGFsbGVuZ2UoIG51bUJyaWNrcywgZGlzdGFuY2UsIG51bUJyaWNrcyApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEdlbmVyYXRlIGEgY2hhbGxlbmdlIHRoYXQgY29uc2lzdHMgb2YgYnJpY2sgc3RhY2tzIGluIHNpbXBsZSByYXRpb3MgdG9cclxuICAgKiBvbmUgYW5vdGhlci4gIEZvciBpbnN0YW5jZSwgdGhlIGZpeGVkIGJyaWNrIHN0YWNrIG1pZ2h0IGJlIDIgYnJpY2tzLFxyXG4gICAqIGFuZCB0aGUgbW92YWJsZSBzdGF0ZSBiZSBvbmUgYnJpY2suXHJcbiAgICogPHAvPlxyXG4gICAqIFJhdGlvcyB1c2VkIGFyZSAyOjEgb3IgMToyLlxyXG4gICAqL1xyXG4gIGdlbmVyYXRlRWFzeUJhbGFuY2VDaGFsbGVuZ2UoKSB7XHJcbiAgICBsZXQgbnVtQnJpY2tzSW5GaXhlZFN0YWNrID0gMTtcclxuICAgIGxldCBudW1Ccmlja3NJbk1vdmFibGVTdGFjayA9IDE7XHJcbiAgICBsZXQgdmFsaWRGaXhlZFN0YWNrRGlzdGFuY2VzID0gW107XHJcblxyXG4gICAgd2hpbGUgKCB2YWxpZEZpeGVkU3RhY2tEaXN0YW5jZXMubGVuZ3RoID09PSAwICkge1xyXG4gICAgICAvLyBDaG9vc2UgdGhlIG51bWJlciBvZiBicmlja3MgaW4gdGhlIGZpeGVkIHN0YWNrLiAgTXVzdCBiZSAxLCAyLFxyXG4gICAgICAvLyBvciA0IGluIG9yZGVyIHRvIHN1cHBvcnQgdGhlIHJhdGlvcyB1c2VkLlxyXG4gICAgICBudW1Ccmlja3NJbkZpeGVkU3RhY2sgPSBNYXRoLnBvdyggMiwgdGhpcy5yYW5kSW50KCAzICkgKTtcclxuXHJcbiAgICAgIC8vIENob29zZSB0aGUgbnVtYmVyIG9mIGJyaWNrcyBpbiBtb3ZhYmxlIHN0YWNrLlxyXG4gICAgICBpZiAoIG51bUJyaWNrc0luRml4ZWRTdGFjayA9PT0gMSB8fCBkb3RSYW5kb20ubmV4dERvdWJsZSgpID4gMC41ICkge1xyXG4gICAgICAgIG51bUJyaWNrc0luTW92YWJsZVN0YWNrID0gMiAqIG51bUJyaWNrc0luRml4ZWRTdGFjaztcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBudW1Ccmlja3NJbk1vdmFibGVTdGFjayA9IG51bUJyaWNrc0luRml4ZWRTdGFjayAvIDI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENyZWF0ZSBhIGxpc3Qgb2YgdGhlIGRpc3RhbmNlcyBhdCB3aGljaCB0aGUgZml4ZWQgc3RhY2sgbWF5IGJlXHJcbiAgICAgIC8vIHBvc2l0aW9uZWQgdG8gYmFsYW5jZSB0aGUgbW92YWJsZSBzdGFjay5cclxuICAgICAgdmFsaWRGaXhlZFN0YWNrRGlzdGFuY2VzID0gdGhpcy5nZXRQb3NzaWJsZURpc3RhbmNlTGlzdCggbnVtQnJpY2tzSW5GaXhlZFN0YWNrICogQnJpY2tTdGFjay5CUklDS19NQVNTLFxyXG4gICAgICAgIG51bUJyaWNrc0luTW92YWJsZVN0YWNrICogQnJpY2tTdGFjay5CUklDS19NQVNTICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmFuZG9tbHkgY2hvb3NlIGEgZGlzdGFuY2UgdG8gdXNlIGZyb20gdGhlIGlkZW50aWZpZWQgc2V0LlxyXG4gICAgY29uc3QgZml4ZWRTdGFja0Rpc3RhbmNlRnJvbUNlbnRlciA9IC12YWxpZEZpeGVkU3RhY2tEaXN0YW5jZXNbIHRoaXMucmFuZEludCggdmFsaWRGaXhlZFN0YWNrRGlzdGFuY2VzLmxlbmd0aCApIF07XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBjaGFsbGVuZ2UuXHJcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVUd29Ccmlja1N0YWNrQ2hhbGxlbmdlKCBudW1Ccmlja3NJbkZpeGVkU3RhY2ssIGZpeGVkU3RhY2tEaXN0YW5jZUZyb21DZW50ZXIsIG51bUJyaWNrc0luTW92YWJsZVN0YWNrICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGEgY2hhbGxlbmdlIGluIHdoaWNoIG9uZSBmaXhlZCBtYXNzIG11c3QgYmUgYmFsYW5jZWQgYnkgYW5vdGhlcixcclxuICAgKiBhbmQgdGhlIGRpc3RhbmNlIHJhdGlvcyBjYW4gYmUgbW9yZSBjb21wbGV4IHRoYW4gaW4gdGhlIHNpbXBsZXJcclxuICAgKiBjaGFsbGVuZ2VzLCBlLmcuIDM6Mi5cclxuICAgKi9cclxuICBnZW5lcmF0ZU1vZGVyYXRlQmFsYW5jZUNoYWxsZW5nZSgpIHtcclxuXHJcbiAgICBsZXQgZml4ZWRNYXNzUHJvdG90eXBlO1xyXG4gICAgbGV0IG1vdmFibGVNYXNzO1xyXG5cclxuICAgIC8vIENyZWF0ZSByYW5kb20gY2hhbGxlbmdlcyB1bnRpbCBhIHNvbHZhYmxlIG9uZSBpcyBjcmVhdGVkLlxyXG4gICAgZG8ge1xyXG4gICAgICAvLyBSYW5kb21seSBjaG9vc2UgYSBmaXhlZCBtYXNzLlxyXG4gICAgICBmaXhlZE1hc3NQcm90b3R5cGUgPSBCQUxBTkNFX0NIQUxMRU5HRV9NQVNTRVNbIHRoaXMucmFuZEludCggQkFMQU5DRV9DSEFMTEVOR0VfTUFTU0VTLmxlbmd0aCApIF07XHJcblxyXG4gICAgICAvLyBDaG9vc2UgYSBtYXNzIGF0IG9uZSBvZiB0aGUgZGVzaXJlZCByYXRpb3MuXHJcbiAgICAgIG1vdmFibGVNYXNzID0gdGhpcy5jcmVhdGVNYXNzQnlSYXRpbyggZml4ZWRNYXNzUHJvdG90eXBlLm1hc3NWYWx1ZSwgWyAzLjAsIDEuMCAvIDMuMCwgMy4wIC8gMi4wLCAyLjAgLyAzLjAsIDQuMCwgMS4wIC8gNC4wIF0gKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbW92YWJsZU1hc3MgIT09IG51bGwsICdObyBtYXNzZXMgbWF0Y2ggcHJvdmlkZWQgcmF0aW9zLicgKTtcclxuICAgIH1cclxuICAgIHdoaWxlICggIXRoaXMuaXNDaGFsbGVuZ2VTb2x2YWJsZSggZml4ZWRNYXNzUHJvdG90eXBlLm1hc3NWYWx1ZSxcclxuICAgICAgbW92YWJsZU1hc3MubWFzc1ZhbHVlLFxyXG4gICAgICBQbGFuay5JTlRFUl9TTkFQX1RPX01BUktFUl9ESVNUQU5DRSxcclxuICAgICAgTUFYX0RJU1RBTkNFX0ZST01fQkFMQU5DRV9DRU5URVJfVE9fTUFTUyApICk7XHJcblxyXG4gICAgLy8gUmFuZG9tbHkgY2hvb3NlIGEgZGlzdGFuY2UgdG8gdXNlIGZvciB0aGUgZml4ZWQgbWFzcyBwb3NpdGlvbi5cclxuICAgIGNvbnN0IGZpeGVkU3RhY2tEaXN0YW5jZUZyb21DZW50ZXIgPSB0aGlzLmNob29zZVJhbmRvbVZhbGlkRml4ZWRNYXNzRGlzdGFuY2UoIGZpeGVkTWFzc1Byb3RvdHlwZS5tYXNzVmFsdWUsIG1vdmFibGVNYXNzLm1hc3NWYWx1ZSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgY2hhbGxlbmdlLlxyXG4gICAgcmV0dXJuIEJhbGFuY2VNYXNzZXNDaGFsbGVuZ2UuY3JlYXRlMUZpeGVkMU1vdmFibGUoIGZpeGVkTWFzc1Byb3RvdHlwZS5jcmVhdGVDb3B5KCksIGZpeGVkU3RhY2tEaXN0YW5jZUZyb21DZW50ZXIsIG1vdmFibGVNYXNzICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogR2VuZXJhdGUgYSBjaGFsbGVuZ2Ugd2hlcmUgdGhlcmUgYXJlIG11bHRpcGxlIGZpeGVkIG1hc3NlcyB0aGF0IG11c3QgYmVcclxuICAgKiBiYWxhbmNlZCBieSBhIHNpbmdsZSBtb3ZhYmxlIG1hc3MuXHJcbiAgICovXHJcbiAgZ2VuZXJhdGVBZHZhbmNlZEJhbGFuY2VDaGFsbGVuZ2UoKSB7XHJcbiAgICBsZXQgc29sdmFibGVDaGFsbGVuZ2VzO1xyXG5cclxuICAgIGRvIHtcclxuICAgICAgY29uc3QgZml4ZWRNYXNzMVByb3RvdHlwZSA9IEJBTEFOQ0VfQ0hBTExFTkdFX01BU1NFU1sgdGhpcy5yYW5kSW50KCBCQUxBTkNFX0NIQUxMRU5HRV9NQVNTRVMubGVuZ3RoICkgXTtcclxuICAgICAgY29uc3QgZml4ZWRNYXNzMlByb3RvdHlwZSA9IEJBTEFOQ0VfQ0hBTExFTkdFX01BU1NFU1sgdGhpcy5yYW5kSW50KCBCQUxBTkNFX0NIQUxMRU5HRV9NQVNTRVMubGVuZ3RoICkgXTtcclxuICAgICAgY29uc3QgbW92YWJsZU1hc3NQcm90b3R5cGUgPSBCQUxBTkNFX0NIQUxMRU5HRV9NQVNTRVNbIHRoaXMucmFuZEludCggQkFMQU5DRV9DSEFMTEVOR0VfTUFTU0VTLmxlbmd0aCApIF07XHJcbiAgICAgIHNvbHZhYmxlQ2hhbGxlbmdlcyA9IHRoaXMuZ2VuZXJhdGVTb2x2YWJsZUNoYWxsZW5nZXMoIGZpeGVkTWFzczFQcm90b3R5cGUsIGZpeGVkTWFzczJQcm90b3R5cGUsIG1vdmFibGVNYXNzUHJvdG90eXBlLFxyXG4gICAgICAgIFBsYW5rLklOVEVSX1NOQVBfVE9fTUFSS0VSX0RJU1RBTkNFLCBQbGFuay5MRU5HVEggLyAyIC0gUGxhbmsuSU5URVJfU05BUF9UT19NQVJLRVJfRElTVEFOQ0UgKTtcclxuICAgIH0gd2hpbGUgKCBzb2x2YWJsZUNoYWxsZW5nZXMubGVuZ3RoID09PSAwICk7XHJcblxyXG4gICAgLy8gQ2hvb3NlIG9uZSBvZiB0aGUgc29sdmFibGUgY29uZmlndXJhdGlvbnMgYXQgcmFuZG9tLlxyXG4gICAgcmV0dXJuIHNvbHZhYmxlQ2hhbGxlbmdlc1sgdGhpcy5yYW5kSW50KCBzb2x2YWJsZUNoYWxsZW5nZXMubGVuZ3RoICkgXTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBHZW5lcmF0ZSBhIHNpbXBsZSB0aWx0LXByZWRpY3Rpb24gc3R5bGUgb2YgY2hhbGxlbmdlLiAgVGhpcyBvbmUgb25seVxyXG4gICAqIHVzZXMgYnJpY2tzLCBhbmQgbmV2ZXIgcHJvZHVjZXMgcGVyZmVjdGx5IGJhbGFuY2VkIGNoYWxsZW5nZXMuXHJcbiAgICovXHJcbiAgZ2VuZXJhdGVTaW1wbGVUaWx0UHJlZGljdGlvbkNoYWxsZW5nZSgpIHtcclxuICAgIC8vIENob29zZSB0d28gZGlmZmVyZW50IG51bWJlcnMgYmV0d2VlbiAxIGFuZCA0IChpbmNsdXNpdmUpIGZvciB0aGVcclxuICAgIC8vIG51bWJlciBvZiBicmlja3MgaW4gdGhlIHR3byBzdGFja3MuXHJcbiAgICBjb25zdCBudW1Ccmlja3NJbkxlZnRTdGFjayA9IDEgKyB0aGlzLnJhbmRJbnQoIDQgKTtcclxuICAgIGxldCBudW1Ccmlja3NJblJpZ2h0U3RhY2sgPSBudW1Ccmlja3NJbkxlZnRTdGFjaztcclxuICAgIHdoaWxlICggbnVtQnJpY2tzSW5SaWdodFN0YWNrID09PSBudW1Ccmlja3NJbkxlZnRTdGFjayApIHtcclxuICAgICAgbnVtQnJpY2tzSW5SaWdodFN0YWNrID0gMSArIHRoaXMucmFuZEludCggNCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENob29zZSBhIGRpc3RhbmNlIGZyb20gdGhlIGNlbnRlciwgd2hpY2ggd2lsbCBiZSB1c2VkIGZvclxyXG4gICAgLy8gcG9zaXRpb25pbmcgYm90aCBzdGFja3MuICBUaGUgbWF4IGFuZCBtaW4gdmFsdWVzIGNhbiBiZSB0d2Vha2VkIGlmXHJcbiAgICAvLyBkZXNpcmVkIHRvIGxpbWl0IHRoZSByYW5nZSBvZiBkaXN0YW5jZXMgZ2VuZXJhdGVkLlxyXG4gICAgY29uc3QgZGlzdGFuY2VGcm9tUGxhbmtDZW50ZXIgPSB0aGlzLmdlbmVyYXRlUmFuZG9tVmFsaWRQbGFua0Rpc3RhbmNlKCBQbGFuay5JTlRFUl9TTkFQX1RPX01BUktFUl9ESVNUQU5DRSxcclxuICAgICAgUGxhbmsuTEVOR1RIIC8gMiAtIFBsYW5rLklOVEVSX1NOQVBfVE9fTUFSS0VSX0RJU1RBTkNFICogMyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgYWN0dWFsIGNoYWxsZW5nZSBmcm9tIHRoZSBwaWVjZXMuXHJcbiAgICByZXR1cm4gVGlsdFByZWRpY3Rpb25DaGFsbGVuZ2UuY3JlYXRlKFxyXG4gICAgICBuZXcgQnJpY2tTdGFjayggbnVtQnJpY2tzSW5MZWZ0U3RhY2sgKSxcclxuICAgICAgZGlzdGFuY2VGcm9tUGxhbmtDZW50ZXIsXHJcbiAgICAgIG5ldyBCcmlja1N0YWNrKCBudW1Ccmlja3NJblJpZ2h0U3RhY2sgKSxcclxuICAgICAgLWRpc3RhbmNlRnJvbVBsYW5rQ2VudGVyICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogR2VuZXJhdGUgYW4gZWFzeSB0aWx0LXByZWRpY3Rpb24gc3R5bGUgb2YgY2hhbGxlbmdlLiAgVGhpcyBvbmUgb25seVxyXG4gICAqIHVzZXMgYnJpY2sgc3RhY2tzIG9mIGVxdWFsIHNpemUsIGFuZCB0aGV5IG1heSBvciBtYXkgbm90IGJhbGFuY2UuXHJcbiAgICpcclxuICAgKiBAcmV0dXJuXHJcbiAgICovXHJcbiAgZ2VuZXJhdGVFYXN5VGlsdFByZWRpY3Rpb25DaGFsbGVuZ2UoKSB7XHJcbiAgICBjb25zdCBnZW5lcmF0ZVJhbmRvbVZhbGlkUGxhbmtEaXN0YW5jZVJhbmdlID0gMSArIHRoaXMucmFuZEludCggNCApO1xyXG5cclxuICAgIC8vIEdlbmVyYXRlIGRpc3RhbmNlIGZvciB0aGUgbGVmdCBtYXNzLlxyXG4gICAgY29uc3QgbGVmdE1hc3NEaXN0YW5jZSA9IHRoaXMuZ2VuZXJhdGVSYW5kb21WYWxpZFBsYW5rRGlzdGFuY2VSYW5nZSggMiAqIFBsYW5rLklOVEVSX1NOQVBfVE9fTUFSS0VSX0RJU1RBTkNFLFxyXG4gICAgICBQbGFuay5MRU5HVEggLyAyIC0gUGxhbmsuSU5URVJfU05BUF9UT19NQVJLRVJfRElTVEFOQ0UgKiAyICk7XHJcblxyXG4gICAgLy8gTWFrZSBhIGZpeGVkIHByb3BvcnRpb24gb2YgdGhlc2UgY2hhbGxlbmdlcyBiYWxhbmNlZCBhbmQgdGhlIHJlc3RcclxuICAgIC8vIG5vdCBiYWxhbmNlZC5cclxuICAgIGxldCByaWdodE1hc3NEaXN0YW5jZSA9IC1sZWZ0TWFzc0Rpc3RhbmNlO1xyXG4gICAgaWYgKCBkb3RSYW5kb20ubmV4dERvdWJsZSgpID4gMC4yICkge1xyXG4gICAgICByaWdodE1hc3NEaXN0YW5jZSA9IC10aGlzLmdlbmVyYXRlUmFuZG9tVmFsaWRQbGFua0Rpc3RhbmNlUmFuZ2UoIDIgKiBQbGFuay5JTlRFUl9TTkFQX1RPX01BUktFUl9ESVNUQU5DRSxcclxuICAgICAgICBQbGFuay5MRU5HVEggLyAyIC0gUGxhbmsuSU5URVJfU05BUF9UT19NQVJLRVJfRElTVEFOQ0UgKiAyICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBhY3R1YWwgY2hhbGxlbmdlIGZyb20gdGhlIHBpZWNlcy5cclxuICAgIHJldHVybiBUaWx0UHJlZGljdGlvbkNoYWxsZW5nZS5jcmVhdGUoIG5ldyBCcmlja1N0YWNrKCBnZW5lcmF0ZVJhbmRvbVZhbGlkUGxhbmtEaXN0YW5jZVJhbmdlICksXHJcbiAgICAgIGxlZnRNYXNzRGlzdGFuY2UsXHJcbiAgICAgIG5ldyBCcmlja1N0YWNrKCBnZW5lcmF0ZVJhbmRvbVZhbGlkUGxhbmtEaXN0YW5jZVJhbmdlICksXHJcbiAgICAgIHJpZ2h0TWFzc0Rpc3RhbmNlICk7XHJcbiAgfSxcclxuXHJcbiAgZ2VuZXJhdGVNb2RlcmF0ZVRpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlKCkge1xyXG4gICAgLy8gU2VsZWN0IHRoZSBtYXNzZXMsIGJyaWNrcyBvbiBvbmUgc2lkZSwgbm9uIGJyaWNrcyBvbiB0aGUgb3RoZXIuXHJcbiAgICBsZXQgbGVmdE1hc3MgPSBMT1dfUFJPRklMRV9NQVNTRVNbIHRoaXMucmFuZEludCggTE9XX1BST0ZJTEVfTUFTU0VTLmxlbmd0aCApIF0uY3JlYXRlQ29weSgpO1xyXG4gICAgbGV0IHJpZ2h0TWFzcyA9IG5ldyBCcmlja1N0YWNrKCB0aGlzLnJhbmRJbnQoIDQgKSArIDEgKTtcclxuICAgIGlmICggZG90UmFuZG9tLm5leHREb3VibGUoKSA+PSAwLjUgKSB7XHJcbiAgICAgIC8vIFN3aXRjaCB0aGUgbWFzc2VzLlxyXG4gICAgICBjb25zdCB0ZW1wTWFzc1Byb3RvdHlwZSA9IGxlZnRNYXNzO1xyXG4gICAgICBsZWZ0TWFzcyA9IHJpZ2h0TWFzcztcclxuICAgICAgcmlnaHRNYXNzID0gdGVtcE1hc3NQcm90b3R5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTWFrZSB0aGUgbWFzc2VzIGFsbW9zdCBidXQgbm90IHF1aXRlIGJhbGFuY2VkLlxyXG4gICAgY29uc3QgbWFzc0Rpc3RhbmNlUGFpcnMgPSB0aGlzLnBvc2l0aW9uTWFzc2VzQ2xvc2VUb0JhbGFuY2luZyhcclxuICAgICAgUGxhbmsuSU5URVJfU05BUF9UT19NQVJLRVJfRElTVEFOQ0UsXHJcbiAgICAgIFBsYW5rLkxFTkdUSCAvIDIgLSAyICogUGxhbmsuSU5URVJfU05BUF9UT19NQVJLRVJfRElTVEFOQ0UsXHJcbiAgICAgIFsgbGVmdE1hc3MsIHJpZ2h0TWFzcyBdICk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBUaWx0UHJlZGljdGlvbkNoYWxsZW5nZSggbWFzc0Rpc3RhbmNlUGFpcnMgKTtcclxuICB9LFxyXG5cclxuICBnZW5lcmF0ZUFkdmFuY2VkVGlsdFByZWRpY3Rpb25DaGFsbGVuZ2UoKSB7XHJcbiAgICAvLyBDaG9vc2UgdGhyZWUgcmFuZG9tIG1hc3NlcywgYnJpY2tzIG9uIG9uZSBzaWRlLCBub24tYnJpY2tzIG9uIHRoZSBvdGhlci5cclxuICAgIGNvbnN0IG1hc3MxID0gTE9XX1BST0ZJTEVfTUFTU0VTWyB0aGlzLnJhbmRJbnQoIExPV19QUk9GSUxFX01BU1NFUy5sZW5ndGggKSBdLmNyZWF0ZUNvcHkoKTtcclxuICAgIGNvbnN0IG1hc3MyID0gTE9XX1BST0ZJTEVfTUFTU0VTWyB0aGlzLnJhbmRJbnQoIExPV19QUk9GSUxFX01BU1NFUy5sZW5ndGggKSBdLmNyZWF0ZUNvcHkoKTtcclxuICAgIGNvbnN0IG1hc3MzID0gbmV3IEJyaWNrU3RhY2soIHRoaXMucmFuZEludCggNCApICsgMSApO1xyXG5cclxuICAgIC8vIEdldCBhIHNldCBvZiBtYXNzLWRpc3RhbmNlIHBhaXJzIGNvbXByaXNlZCBvZiB0aGVzZSBtYXNzZXNcclxuICAgIC8vIHBvc2l0aW9uZWQgaW4gc3VjaCBhIHdheSB0aGF0IHRoZXkgYXJlIGFsbW9zdCwgYnV0IG5vdCBxdWl0ZSwgYmFsYW5jZWQuXHJcbiAgICBjb25zdCBtYXNzRGlzdGFuY2VQYWlycyA9IHRoaXMucG9zaXRpb25NYXNzZXNDbG9zZVRvQmFsYW5jaW5nKCBQbGFuay5JTlRFUl9TTkFQX1RPX01BUktFUl9ESVNUQU5DRSxcclxuICAgICAgUGxhbmsuTEVOR1RIIC8gMiAtIFBsYW5rLklOVEVSX1NOQVBfVE9fTUFSS0VSX0RJU1RBTkNFLCBbIG1hc3MxLCBtYXNzMiwgbWFzczMgXSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgYWN0dWFsIGNoYWxsZW5nZSBmcm9tIHRoZSBwaWVjZXMuXHJcbiAgICByZXR1cm4gbmV3IFRpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlKCBtYXNzRGlzdGFuY2VQYWlycyApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEdlbmVyYXRlIGEgbWFzcyBkZWR1Y3Rpb24gc3R5bGUgY2hhbGxlbmdlIHdoZXJlIHRoZSBmaXhlZCBteXN0ZXJ5IG1hc3NcclxuICAgKiBpcyB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUga25vd24gbWFzcy5cclxuICAgKi9cclxuICBnZW5lcmF0ZVNpbXBsZU1hc3NEZWR1Y3Rpb25DaGFsbGVuZ2UoKSB7XHJcbiAgICBjb25zdCBpbmRleE9mZnNldCA9IDEgKyB0aGlzLnJhbmRJbnQoIEJBTEFOQ0VfQ0hBTExFTkdFX01BU1NFUy5sZW5ndGggKTtcclxuICAgIGxldCBrbm93bk1hc3MgPSBudWxsO1xyXG4gICAgbGV0IG15c3RlcnlNYXNzUHJvdG90eXBlID0gbnVsbDtcclxuXHJcbiAgICAvLyBTZWxlY3QgYSBteXN0ZXJ5IG1hc3MgYW5kIGNyZWF0ZSBhIGtub3duIG1hc3Mgd2l0aCB0aGUgc2FtZSBtYXNzIHZhbHVlLlxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgTVlTVEVSWV9NQVNTRVMubGVuZ3RoICYmIGtub3duTWFzcyA9PT0gbnVsbDsgaSsrICkge1xyXG4gICAgICBteXN0ZXJ5TWFzc1Byb3RvdHlwZSA9IE1ZU1RFUllfTUFTU0VTWyAoIGkgKyBpbmRleE9mZnNldCApICUgTVlTVEVSWV9NQVNTRVMubGVuZ3RoIF07XHJcbiAgICAgIGtub3duTWFzcyA9IHRoaXMuY3JlYXRlTWFzc0J5UmF0aW8oIG15c3RlcnlNYXNzUHJvdG90eXBlLm1hc3NWYWx1ZSwgWyAxIF0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGVyZSBtdXN0IGJlIGF0IGxlYXN0IG9uZSBjb21iaW5hdGlvbiB0aGF0IHdvcmtzLiAgSWYgbm90LCBpdCdzIGFcclxuICAgIC8vIG1ham9yIHByb2JsZW0gaW4gdGhlIGNvZGUgdGhhdCBtdXN0IGJlIGZpeGVkLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCgga25vd25NYXNzICE9PSBudWxsICk7XHJcblxyXG4gICAgLy8gU2luY2UgdGhlIG1hc3NlcyBhcmUgZXF1YWwsIGFueSBwb3NpdGlvbiBmb3IgdGhlIG15c3RlcnkgbWFzcyBzaG91bGRcclxuICAgIC8vIGNyZWF0ZSBhIHNvbHZhYmxlIGNoYWxsZW5nZS5cclxuICAgIGNvbnN0IG15c3RlcnlNYXNzRGlzdGFuY2VGcm9tQ2VudGVyID0gLXRoaXMuZ2VuZXJhdGVSYW5kb21WYWxpZFBsYW5rRGlzdGFuY2UoKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGNoYWxsZW5nZS5cclxuICAgIHJldHVybiBNYXNzRGVkdWN0aW9uQ2hhbGxlbmdlLmNyZWF0ZSggbXlzdGVyeU1hc3NQcm90b3R5cGUuY3JlYXRlQ29weSgpLCBteXN0ZXJ5TWFzc0Rpc3RhbmNlRnJvbUNlbnRlciwga25vd25NYXNzICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogR2VuZXJhdGUgYSBtYXNzIGRlZHVjdGlvbiBzdHlsZSBjaGFsbGVuZ2Ugd2hlcmUgdGhlIGZpeGVkIG15c3RlcnkgbWFzc1xyXG4gICAqIGlzIGVpdGhlciB0d2ljZSBhcyBoZWF2eSBvciBoYWxmIGFzIGhlYXZ5IGFzIHRoZSBrbm93biBtYXNzLlxyXG4gICAqL1xyXG4gIGdlbmVyYXRlRWFzeU1hc3NEZWR1Y3Rpb25DaGFsbGVuZ2UoKSB7XHJcbiAgICBjb25zdCBpbmRleE9mZnNldCA9IHRoaXMucmFuZEludCggQkFMQU5DRV9DSEFMTEVOR0VfTUFTU0VTLmxlbmd0aCApO1xyXG4gICAgbGV0IGtub3duTWFzcyA9IG51bGw7XHJcbiAgICBsZXQgbXlzdGVyeU1hc3NQcm90b3R5cGUgPSBudWxsO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IE1ZU1RFUllfTUFTU0VTLmxlbmd0aCAmJiBrbm93bk1hc3MgPT09IG51bGw7IGkrKyApIHtcclxuICAgICAgbXlzdGVyeU1hc3NQcm90b3R5cGUgPSBNWVNURVJZX01BU1NFU1sgKCBpICsgaW5kZXhPZmZzZXQgKSAlIE1ZU1RFUllfTUFTU0VTLmxlbmd0aCBdO1xyXG4gICAgICBrbm93bk1hc3MgPSB0aGlzLmNyZWF0ZU1hc3NCeVJhdGlvKCBteXN0ZXJ5TWFzc1Byb3RvdHlwZS5tYXNzVmFsdWUsIFsgMiwgMC41IF0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGVyZSBtdXN0IGJlIGF0IGxlYXN0IG9uZSBjb21iaW5hdGlvbiB0aGF0IHdvcmtzLiAgSWYgbm90LCBpdCdzIGFcclxuICAgIC8vIG1ham9yIHByb2JsZW0gaW4gdGhlIGNvZGUgdGhhdCBtdXN0IGJlIGZpeGVkLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCgga25vd25NYXNzICE9PSBudWxsLCAnRmFpbGVkIHRvIGdlbmVyYXRlIGFuIGVhc3kgbWFzcyBkZWR1Y3Rpb24gY2hhbGxlbmdlJyApO1xyXG5cclxuICAgIC8vIENob29zZSBhIGRpc3RhbmNlIGZvciB0aGUgbXlzdGVyeSBtYXNzLlxyXG4gICAgY29uc3QgcG9zc2libGVEaXN0YW5jZXMgPSB0aGlzLmdldFBvc3NpYmxlRGlzdGFuY2VMaXN0KCBteXN0ZXJ5TWFzc1Byb3RvdHlwZS5tYXNzVmFsdWUsIGtub3duTWFzcy5tYXNzVmFsdWUgKTtcclxuICAgIGNvbnN0IG15c3RlcnlNYXNzRGlzdGFuY2VGcm9tQ2VudGVyID0gLXBvc3NpYmxlRGlzdGFuY2VzWyB0aGlzLnJhbmRJbnQoIHBvc3NpYmxlRGlzdGFuY2VzLmxlbmd0aCApIF07XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBjaGFsbGVuZ2UuXHJcbiAgICByZXR1cm4gTWFzc0RlZHVjdGlvbkNoYWxsZW5nZS5jcmVhdGUoIG15c3RlcnlNYXNzUHJvdG90eXBlLmNyZWF0ZUNvcHkoKSwgbXlzdGVyeU1hc3NEaXN0YW5jZUZyb21DZW50ZXIsIGtub3duTWFzcyApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEdlbmVyYXRlIGEgbWFzcyBkZWR1Y3Rpb24gc3R5bGUgY2hhbGxlbmdlIHdoZXJlIHRoZSBmaXhlZCBteXN0ZXJ5IG1hc3NcclxuICAgKiBpcyByZWxhdGVkIHRvIHRoZSBtb3ZhYmxlIG1hc3MgYnkgYSByYXRpbyB0aGF0IGlzIG1vcmUgY29tcGxpY2F0ZSB0aGFuXHJcbiAgICogMjoxIG9yIDE6MiwgZS5nLiAxOjMuXHJcbiAgICovXHJcbiAgZ2VuZXJhdGVNb2RlcmF0ZU1hc3NEZWR1Y3Rpb25DaGFsbGVuZ2UoKSB7XHJcbiAgICBjb25zdCBpbmRleE9mZnNldCA9IHRoaXMucmFuZEludCggQkFMQU5DRV9DSEFMTEVOR0VfTUFTU0VTLmxlbmd0aCApO1xyXG4gICAgbGV0IGtub3duTWFzcyA9IG51bGw7XHJcbiAgICBsZXQgbXlzdGVyeU1hc3NQcm90b3R5cGUgPSBudWxsO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IE1ZU1RFUllfTUFTU0VTLmxlbmd0aCAmJiBrbm93bk1hc3MgPT09IG51bGw7IGkrKyApIHtcclxuICAgICAgbXlzdGVyeU1hc3NQcm90b3R5cGUgPSBNWVNURVJZX01BU1NFU1sgKCBpICsgaW5kZXhPZmZzZXQgKSAlIE1ZU1RFUllfTUFTU0VTLmxlbmd0aCBdO1xyXG4gICAgICBrbm93bk1hc3MgPSB0aGlzLmNyZWF0ZU1hc3NCeVJhdGlvKCBteXN0ZXJ5TWFzc1Byb3RvdHlwZS5tYXNzVmFsdWUsIFsgMS41LCAzLCAoIDEuMCAvIDMuMCApLCAoIDIuMCAvIDMuMCApLCA0LCAoIDEuMCAvIDQuMCApIF0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGVyZSBtdXN0IGJlIGF0IGxlYXN0IG9uZSBjb21iaW5hdGlvbiB0aGF0IHdvcmtzLiAgSWYgbm90LCBpdCdzIGFcclxuICAgIC8vIG1ham9yIHByb2JsZW0gaW4gdGhlIGNvZGUgdGhhdCBtdXN0IGJlIGZpeGVkLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCgga25vd25NYXNzICE9PSBudWxsLCAnTm8gY29tYmluYXRpb25zIGZvciBtYXNzIGRlZHVjdGlvbiBjaGFsbGVuZ2UgZ2VuZXJhdGlvbicgKTtcclxuXHJcbiAgICAvLyBDaG9vc2UgYSBkaXN0YW5jZSBmb3IgdGhlIG15c3RlcnkgbWFzcy5cclxuICAgIGNvbnN0IHBvc3NpYmxlRGlzdGFuY2VzID0gdGhpcy5nZXRQb3NzaWJsZURpc3RhbmNlTGlzdCggbXlzdGVyeU1hc3NQcm90b3R5cGUubWFzc1ZhbHVlLCBrbm93bk1hc3MubWFzc1ZhbHVlICk7XHJcbiAgICBjb25zdCBteXN0ZXJ5TWFzc0Rpc3RhbmNlRnJvbUNlbnRlciA9IC1wb3NzaWJsZURpc3RhbmNlc1sgdGhpcy5yYW5kSW50KCBwb3NzaWJsZURpc3RhbmNlcy5sZW5ndGggKSBdO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgY2hhbGxlbmdlLlxyXG4gICAgcmV0dXJuIE1hc3NEZWR1Y3Rpb25DaGFsbGVuZ2UuY3JlYXRlKCBteXN0ZXJ5TWFzc1Byb3RvdHlwZS5jcmVhdGVDb3B5KCksIG15c3RlcnlNYXNzRGlzdGFuY2VGcm9tQ2VudGVyLCBrbm93bk1hc3MgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDb252ZW5pZW5jZSBmdW5jdGlvbiBmb3IgcmVtb3ZpbmcgdGhlIG9sZGVzdCBoYWxmIG9mIGEgbGlzdCAod2hpY2ggaXNcclxuICAgKiB0aGUgbG93ZXIgaW5kaWNpZXMpLlxyXG4gICAqL1xyXG4gIHJlbW92ZU9sZGVzdEhhbGZPZkxpc3QoIGxpc3QgKSB7XHJcbiAgICBsaXN0LnNwbGljZSggMCwgVXRpbHMucm91bmRTeW1tZXRyaWMoIGxpc3QubGVuZ3RoIC8gMiApICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogTWV0aG9kIHRvIGdlbmVyYXRlIGEgXCJ1bmlxdWVcIiBjaGFsbGVuZ2UsIG1lYW5pbmcgb25lIHRoYXQgdGhlIHVzZXJcclxuICAgKiBlaXRoZXIgaGFzbid0IHNlZW4gYmVmb3JlIG9yIGF0IGxlYXN0IGhhc24ndCBzZWVuIHJlY2VudGx5LiAgVGhlIGNhbGxlclxyXG4gICAqIHByb3ZpZGVzIGZ1bmN0aW9ucyBmb3IgZ2VuZXJhdGluZyB0aGUgY2hhbGxlbmdlcyBhbmQgdGVzdGluZyBpdHNcclxuICAgKiB1bmlxdWVuZXNzLCBhcyB3ZWxsIGFzIGEgbGlzdCBvZiBwcmV2aW91cyBjaGFsbGVuZ2VzIHRvIHRlc3QgYWdhaW5zdC5cclxuICAgKi9cclxuICBnZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggY2hhbGxlbmdlR2VuZXJhdG9yLCB1bmlxdWVuZXNzVGVzdCwgcHJldmlvdXNDaGFsbGVuZ2VzICkge1xyXG4gICAgbGV0IGNoYWxsZW5nZSA9IG51bGw7XHJcbiAgICBsZXQgdW5pcXVlQ2hhbGxlbmdlR2VuZXJhdGVkID0gZmFsc2U7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgTUFYX0hBTFZJTkdfT0ZfUEFTVF9MSVNUICYmICF1bmlxdWVDaGFsbGVuZ2VHZW5lcmF0ZWQ7IGkrKyApIHtcclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgTUFYX0dFTl9BVFRFTVBUUzsgaisrICkge1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgYSBjaGFsbGVuZ2UuXHJcbiAgICAgICAgY2hhbGxlbmdlID0gY2hhbGxlbmdlR2VuZXJhdG9yKCk7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGNoYWxsZW5nZSBpcyB1bmlxdWUuXHJcbiAgICAgICAgaWYgKCB1bmlxdWVuZXNzVGVzdCggY2hhbGxlbmdlLCBwcmV2aW91c0NoYWxsZW5nZXMgKSApIHtcclxuICAgICAgICAgIC8vIElmIHNvLCB3ZSdyZSBkb25lLlxyXG4gICAgICAgICAgdW5pcXVlQ2hhbGxlbmdlR2VuZXJhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoICF1bmlxdWVDaGFsbGVuZ2VHZW5lcmF0ZWQgKSB7XHJcbiAgICAgICAgLy8gU2V2ZXJhbCBhdHRlbXB0cyBkaWQgbm90IHlpZWxkIGEgdW5pcXVlIGNoYWxsZW5nZSwgc29cclxuICAgICAgICAvLyByZWR1Y2UgdGhlIG51bWJlciBvZiBwYXN0IGNoYWxsZW5nZXMgb24gdGhlIGxpc3QgaW4gb3JkZXJcclxuICAgICAgICAvLyB0byBtYWtlIGl0IGVhc2llciwgYW5kIHRoZW4gdHJ5IGFnYWluLlxyXG4gICAgICAgIHRoaXMucmVtb3ZlT2xkZXN0SGFsZk9mTGlzdCggcHJldmlvdXNDaGFsbGVuZ2VzICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNoYWxsZW5nZSAhPT0gbnVsbCApOyAvLyBUaGUgYWxnb3JpdGhtIGFib3ZlIHNob3VsZCBhbHdheXMgcHJvZHVjZSBzb21ldGhpbmcsIGxvZyBpdCBpZiBub3QuXHJcbiAgICBwcmV2aW91c0NoYWxsZW5nZXMucHVzaCggY2hhbGxlbmdlICk7XHJcbiAgICByZXR1cm4gY2hhbGxlbmdlO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFRlc3QgYSBjaGFsbGVuZ2UgYWdhaW5zdCBhIGxpc3Qgb2YgY2hhbGxlbmdlcyB0byBzZWUgaWYgdGhlIGdpdmVuXHJcbiAgICogY2hhbGxlbmdlIHVzZXMgdW5pcXVlIG1hc3MgdmFsdWVzIGZvciB0aGUgbW92YWJsZSBhbmQgZml4ZWQgbWFzc2VzLlxyXG4gICAqIERpc3RhbmNlcyBhcmUgaWdub3JlZCwgc28gaWYgYSBjaGFsbGVuZ2UgaXMgdGVzdGVkIGFnYWluc3QgYSBzZXQgdGhhdFxyXG4gICAqIGNvbnRhaW5zIG9uZSB3aXRoIHRoZSBzYW1lIG1hc3NlcyBidXQgZGlmZmVyZW50IGRpc3RhbmNlcywgdGhpcyB3aWxsXHJcbiAgICogcmV0dXJuIGZhbHNlLCBpbmRpY2F0aW5nIHRoYXQgdGhlIGNoYWxsZW5nZSBpcyBub24tdW5pcXVlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHRlc3RDaGFsbGVuZ2VcclxuICAgKiBAcGFyYW0gdXNlZENoYWxsZW5nZUxpc3RcclxuICAgKiBAcmV0dXJuXHJcbiAgICovXHJcbiAgdXNlc1VuaXF1ZU1hc3NlcyggdGVzdENoYWxsZW5nZSwgdXNlZENoYWxsZW5nZUxpc3QgKSB7XHJcbiAgICByZXR1cm4gIV8uc29tZSggdXNlZENoYWxsZW5nZUxpc3QsIGNoYWxsZW5nZSA9PiBjaGFsbGVuZ2UudXNlc1NhbWVNYXNzZXMoIHRlc3RDaGFsbGVuZ2UgKSApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFRlc3RzIGEgY2hhbGxlbmdlIGFnYWluc3QgYSBzZXQgb2YgY2hhbGxlbmdlcyB0byBzZWUgd2hldGhlciB0aGUgdGVzdFxyXG4gICAqIGNoYWxsZW5nZSBoYXMgdW5pcXVlIGZpeGVkIG1hc3NlcyBhbmQgZGlzdGFuY2VzIGNvbXBhcmVkIHRvIGFsbCBvZiB0aGVcclxuICAgKiBjaGFsbGVuZ2VzIG9uIHRoZSBjb21wYXJpc29uIGxpc3QuICBJZiBhbnkgb2YgdGhlIGNoYWxsZW5nZSBvbiB0aGVcclxuICAgKiBjb21wYXJpc29uIGxpc3QgaGF2ZSB0aGUgc2FtZSBmaXhlZCBtYXNzZXMgYXQgdGhlIHNhbWUgZGlzdGFuY2VzIGZyb21cclxuICAgKiB0aGUgY2VudGVyLCB0aGlzIHdpbGwgcmV0dXJuIGZhbHNlLCBpbmRpY2F0aW5nIHRoYXQgdGhlIHRlc3QgY2hhbGxlbmdlXHJcbiAgICogaXMgbm90IHVuaXF1ZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB0ZXN0Q2hhbGxlbmdlXHJcbiAgICogQHBhcmFtIHVzZWRDaGFsbGVuZ2VMaXN0XHJcbiAgICogQHJldHVyblxyXG4gICAqL1xyXG4gIHVzZXNVbmlxdWVGaXhlZE1hc3Nlc0FuZERpc3RhbmNlcyggdGVzdENoYWxsZW5nZSwgdXNlZENoYWxsZW5nZUxpc3QgKSB7XHJcbiAgICByZXR1cm4gIV8uc29tZSggdXNlZENoYWxsZW5nZUxpc3QsIGNoYWxsZW5nZSA9PiBjaGFsbGVuZ2UudXNlc1NhbWVGaXhlZE1hc3Nlc0FuZERpc3RhbmNlcyggdGVzdENoYWxsZW5nZSApICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogVGVzdHMgYSBjaGFsbGVuZ2UgYWdhaW5zdCBhIHNldCBvZiBjaGFsbGVuZ2VzIHRvIHNlZSB3aGV0aGVyIHRoZSB0ZXN0XHJcbiAgICogY2hhbGxlbmdlIGhhcyB1bmlxdWUgZml4ZWQgbWFzc2VzIGNvbXBhcmVkIHRvIGFsbCBvZiB0aGUgY2hhbGxlbmdlcyBvblxyXG4gICAqIHRoZSBsaXN0LiAgSWYgYW55IG9mIHRoZSBjaGFsbGVuZ2Ugb24gdGhlIGNvbXBhcmlzb24gbGlzdCBoYXZlIHRoZSBzYW1lXHJcbiAgICogZml4ZWQgbWFzc2VzLCB0aGlzIHdpbGwgcmV0dXJuIGZhbHNlLCBpbmRpY2F0aW5nIHRoYXQgdGhlIGNoYWxsZW5nZSBpc1xyXG4gICAqIG5vdCB1bmlxdWUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdGVzdENoYWxsZW5nZVxyXG4gICAqIEBwYXJhbSB1c2VkQ2hhbGxlbmdlTGlzdFxyXG4gICAqIEByZXR1cm5cclxuICAgKi9cclxuICB1c2VzVW5pcXVlRml4ZWRNYXNzZXMoIHRlc3RDaGFsbGVuZ2UsIHVzZWRDaGFsbGVuZ2VMaXN0ICkge1xyXG4gICAgcmV0dXJuICFfLnNvbWUoIHVzZWRDaGFsbGVuZ2VMaXN0LCBjaGFsbGVuZ2UgPT4gY2hhbGxlbmdlLnVzZXNTYW1lRml4ZWRNYXNzZXMoIHRlc3RDaGFsbGVuZ2UgKSApO1xyXG4gIH0sXHJcblxyXG4gIGdlbmVyYXRlQmFsYW5jZUNoYWxsZW5nZSggbGV2ZWwgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggdGhpcy5iYWxhbmNlQ2hhbGxlbmdlR2VuZXJhdG9yc1sgbGV2ZWwgXS5iaW5kKCB0aGlzICksIHRoaXMudXNlc1VuaXF1ZU1hc3NlcywgdXNlZEJhbGFuY2VDaGFsbGVuZ2VzICk7XHJcbiAgfSxcclxuXHJcbiAgc2ltcGxlQmFsYW5jZUNoYWxsZW5nZUdlbmVyYXRvcigpIHtcclxuICAgIHJldHVybiB0aGlzLmdlbmVyYXRlVW5pcXVlQ2hhbGxlbmdlKCB0aGlzLmdlbmVyYXRlU2ltcGxlQmFsYW5jZUNoYWxsZW5nZS5iaW5kKCB0aGlzICksIHRoaXMudXNlc1VuaXF1ZU1hc3NlcywgdXNlZEJhbGFuY2VDaGFsbGVuZ2VzICk7XHJcbiAgfSxcclxuXHJcbiAgZWFzeUJhbGFuY2VDaGFsbGVuZ2VHZW5lcmF0b3IoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggdGhpcy5nZW5lcmF0ZUVhc3lCYWxhbmNlQ2hhbGxlbmdlLmJpbmQoIHRoaXMgKSwgdGhpcy51c2VzVW5pcXVlTWFzc2VzLCB1c2VkQmFsYW5jZUNoYWxsZW5nZXMgKTtcclxuICB9LFxyXG5cclxuICBtb2RlcmF0ZUJhbGFuY2VDaGFsbGVuZ2VHZW5lcmF0b3IoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggdGhpcy5nZW5lcmF0ZU1vZGVyYXRlQmFsYW5jZUNoYWxsZW5nZS5iaW5kKCB0aGlzICksIHRoaXMudXNlc1VuaXF1ZU1hc3NlcywgdXNlZEJhbGFuY2VDaGFsbGVuZ2VzICk7XHJcbiAgfSxcclxuXHJcbiAgYWR2YW5jZWRCYWxhbmNlQ2hhbGxlbmdlR2VuZXJhdG9yKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIHRoaXMuZ2VuZXJhdGVBZHZhbmNlZEJhbGFuY2VDaGFsbGVuZ2UuYmluZCggdGhpcyApLCB0aGlzLnVzZXNVbmlxdWVNYXNzZXMsIHVzZWRCYWxhbmNlQ2hhbGxlbmdlcyApO1xyXG4gIH0sXHJcblxyXG4gIHNpbXBsZU1hc3NEZWR1Y3Rpb25DaGFsbGVuZ2VHZW5lcmF0b3IoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggdGhpcy5nZW5lcmF0ZVNpbXBsZU1hc3NEZWR1Y3Rpb25DaGFsbGVuZ2UuYmluZCggdGhpcyApLCB0aGlzLnVzZXNVbmlxdWVGaXhlZE1hc3NlcywgdXNlZE1hc3NEZWR1Y3Rpb25DaGFsbGVuZ2VzICk7XHJcbiAgfSxcclxuXHJcbiAgZWFzeU1hc3NEZWR1Y3Rpb25DaGFsbGVuZ2VHZW5lcmF0b3IoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggdGhpcy5nZW5lcmF0ZUVhc3lNYXNzRGVkdWN0aW9uQ2hhbGxlbmdlLmJpbmQoIHRoaXMgKSwgdGhpcy51c2VzVW5pcXVlRml4ZWRNYXNzZXMsIHVzZWRNYXNzRGVkdWN0aW9uQ2hhbGxlbmdlcyApO1xyXG4gIH0sXHJcblxyXG4gIG1vZGVyYXRlTWFzc0RlZHVjdGlvbkNoYWxsZW5nZUdlbmVyYXRvcigpIHtcclxuICAgIHJldHVybiB0aGlzLmdlbmVyYXRlVW5pcXVlQ2hhbGxlbmdlKCB0aGlzLmdlbmVyYXRlTW9kZXJhdGVNYXNzRGVkdWN0aW9uQ2hhbGxlbmdlLmJpbmQoIHRoaXMgKSwgdGhpcy51c2VzVW5pcXVlRml4ZWRNYXNzZXMsIHVzZWRNYXNzRGVkdWN0aW9uQ2hhbGxlbmdlcyApO1xyXG4gIH0sXHJcblxyXG4gIHNpbXBsZVRpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlR2VuZXJhdG9yKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIHRoaXMuZ2VuZXJhdGVTaW1wbGVUaWx0UHJlZGljdGlvbkNoYWxsZW5nZS5iaW5kKCB0aGlzICksIHRoaXMudXNlc1VuaXF1ZUZpeGVkTWFzc2VzQW5kRGlzdGFuY2VzLCB1c2VkVGlsdFByZWRpY3Rpb25DaGFsbGVuZ2VzICk7XHJcbiAgfSxcclxuXHJcbiAgZWFzeVRpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlR2VuZXJhdG9yKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIHRoaXMuZ2VuZXJhdGVFYXN5VGlsdFByZWRpY3Rpb25DaGFsbGVuZ2UuYmluZCggdGhpcyApLCB0aGlzLnVzZXNVbmlxdWVGaXhlZE1hc3Nlc0FuZERpc3RhbmNlcywgdXNlZFRpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlcyApO1xyXG4gIH0sXHJcblxyXG4gIG1vZGVyYXRlVGlsdFByZWRpY3Rpb25DaGFsbGVuZ2VHZW5lcmF0b3IoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggdGhpcy5nZW5lcmF0ZU1vZGVyYXRlVGlsdFByZWRpY3Rpb25DaGFsbGVuZ2UuYmluZCggdGhpcyApLCB0aGlzLnVzZXNVbmlxdWVGaXhlZE1hc3Nlc0FuZERpc3RhbmNlcywgdXNlZFRpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlcyApO1xyXG4gIH0sXHJcblxyXG4gIGFkdmFuY2VkVGlsdFByZWRpY3Rpb25DaGFsbGVuZ2VHZW5lcmF0b3IoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggdGhpcy5nZW5lcmF0ZUFkdmFuY2VkVGlsdFByZWRpY3Rpb25DaGFsbGVuZ2UuYmluZCggdGhpcyApLCB0aGlzLnVzZXNVbmlxdWVGaXhlZE1hc3Nlc0FuZERpc3RhbmNlcywgdXNlZFRpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlcyApO1xyXG4gIH0sXHJcblxyXG4gIGdlbmVyYXRlQ2hhbGxlbmdlU2V0KCBsZXZlbCApIHtcclxuICAgIGNvbnN0IGJhbGFuY2VDaGFsbGVuZ2VMaXN0ID0gW107XHJcbiAgICBzd2l0Y2goIGxldmVsICkge1xyXG5cclxuICAgICAgY2FzZSAwOlxyXG4gICAgICAgIGJhbGFuY2VDaGFsbGVuZ2VMaXN0LnB1c2goIHRoaXMuc2ltcGxlQmFsYW5jZUNoYWxsZW5nZUdlbmVyYXRvcigpICk7XHJcbiAgICAgICAgYmFsYW5jZUNoYWxsZW5nZUxpc3QucHVzaCggdGhpcy5zaW1wbGVUaWx0UHJlZGljdGlvbkNoYWxsZW5nZUdlbmVyYXRvcigpICk7XHJcbiAgICAgICAgYmFsYW5jZUNoYWxsZW5nZUxpc3QucHVzaCggdGhpcy5lYXN5QmFsYW5jZUNoYWxsZW5nZUdlbmVyYXRvcigpICk7XHJcbiAgICAgICAgYmFsYW5jZUNoYWxsZW5nZUxpc3QucHVzaCggdGhpcy5zaW1wbGVNYXNzRGVkdWN0aW9uQ2hhbGxlbmdlR2VuZXJhdG9yKCkgKTtcclxuICAgICAgICBiYWxhbmNlQ2hhbGxlbmdlTGlzdC5wdXNoKCB0aGlzLnNpbXBsZVRpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlR2VuZXJhdG9yKCkgKTtcclxuICAgICAgICBiYWxhbmNlQ2hhbGxlbmdlTGlzdC5wdXNoKCB0aGlzLmVhc3lNYXNzRGVkdWN0aW9uQ2hhbGxlbmdlR2VuZXJhdG9yKCkgKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgMTpcclxuICAgICAgICBiYWxhbmNlQ2hhbGxlbmdlTGlzdC5wdXNoKCB0aGlzLmVhc3lUaWx0UHJlZGljdGlvbkNoYWxsZW5nZUdlbmVyYXRvcigpICk7XHJcbiAgICAgICAgYmFsYW5jZUNoYWxsZW5nZUxpc3QucHVzaCggdGhpcy5lYXN5QmFsYW5jZUNoYWxsZW5nZUdlbmVyYXRvcigpICk7XHJcbiAgICAgICAgYmFsYW5jZUNoYWxsZW5nZUxpc3QucHVzaCggdGhpcy5lYXN5TWFzc0RlZHVjdGlvbkNoYWxsZW5nZUdlbmVyYXRvcigpICk7XHJcbiAgICAgICAgYmFsYW5jZUNoYWxsZW5nZUxpc3QucHVzaCggdGhpcy5lYXN5VGlsdFByZWRpY3Rpb25DaGFsbGVuZ2VHZW5lcmF0b3IoKSApO1xyXG4gICAgICAgIGJhbGFuY2VDaGFsbGVuZ2VMaXN0LnB1c2goIHRoaXMuZWFzeU1hc3NEZWR1Y3Rpb25DaGFsbGVuZ2VHZW5lcmF0b3IoKSApO1xyXG4gICAgICAgIGJhbGFuY2VDaGFsbGVuZ2VMaXN0LnB1c2goIHRoaXMubW9kZXJhdGVCYWxhbmNlQ2hhbGxlbmdlR2VuZXJhdG9yKCkgKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgMjpcclxuICAgICAgICBiYWxhbmNlQ2hhbGxlbmdlTGlzdC5wdXNoKCB0aGlzLm1vZGVyYXRlQmFsYW5jZUNoYWxsZW5nZUdlbmVyYXRvcigpICk7XHJcbiAgICAgICAgYmFsYW5jZUNoYWxsZW5nZUxpc3QucHVzaCggdGhpcy5lYXN5TWFzc0RlZHVjdGlvbkNoYWxsZW5nZUdlbmVyYXRvcigpICk7XHJcbiAgICAgICAgYmFsYW5jZUNoYWxsZW5nZUxpc3QucHVzaCggdGhpcy5tb2RlcmF0ZVRpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlR2VuZXJhdG9yKCkgKTtcclxuICAgICAgICBiYWxhbmNlQ2hhbGxlbmdlTGlzdC5wdXNoKCB0aGlzLm1vZGVyYXRlQmFsYW5jZUNoYWxsZW5nZUdlbmVyYXRvcigpICk7XHJcbiAgICAgICAgYmFsYW5jZUNoYWxsZW5nZUxpc3QucHVzaCggdGhpcy5tb2RlcmF0ZVRpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlR2VuZXJhdG9yKCkgKTtcclxuICAgICAgICBiYWxhbmNlQ2hhbGxlbmdlTGlzdC5wdXNoKCB0aGlzLm1vZGVyYXRlTWFzc0RlZHVjdGlvbkNoYWxsZW5nZUdlbmVyYXRvcigpICk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIDM6XHJcbiAgICAgICAgYmFsYW5jZUNoYWxsZW5nZUxpc3QucHVzaCggdGhpcy5hZHZhbmNlZFRpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlR2VuZXJhdG9yKCkgKTtcclxuICAgICAgICBiYWxhbmNlQ2hhbGxlbmdlTGlzdC5wdXNoKCB0aGlzLmFkdmFuY2VkQmFsYW5jZUNoYWxsZW5nZUdlbmVyYXRvcigpICk7XHJcbiAgICAgICAgYmFsYW5jZUNoYWxsZW5nZUxpc3QucHVzaCggdGhpcy5tb2RlcmF0ZU1hc3NEZWR1Y3Rpb25DaGFsbGVuZ2VHZW5lcmF0b3IoKSApO1xyXG4gICAgICAgIGJhbGFuY2VDaGFsbGVuZ2VMaXN0LnB1c2goIHRoaXMuYWR2YW5jZWRUaWx0UHJlZGljdGlvbkNoYWxsZW5nZUdlbmVyYXRvcigpICk7XHJcbiAgICAgICAgYmFsYW5jZUNoYWxsZW5nZUxpc3QucHVzaCggdGhpcy5tb2RlcmF0ZU1hc3NEZWR1Y3Rpb25DaGFsbGVuZ2VHZW5lcmF0b3IoKSApO1xyXG4gICAgICAgIGJhbGFuY2VDaGFsbGVuZ2VMaXN0LnB1c2goIHRoaXMuYWR2YW5jZWRCYWxhbmNlQ2hhbGxlbmdlR2VuZXJhdG9yKCkgKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgQ2FuJ3QgZ2VuZXJhdGUgY2hhbGxlbmdlIHNldCBmb3IgcmVxdWVzdGVkIGxldmVsOiAke2xldmVsfWAgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBiYWxhbmNlQ2hhbGxlbmdlTGlzdDtcclxuICB9XHJcbn07XHJcblxyXG5iYWxhbmNpbmdBY3QucmVnaXN0ZXIoICdCYWxhbmNlR2FtZUNoYWxsZW5nZUZhY3RvcnknLCBCYWxhbmNlR2FtZUNoYWxsZW5nZUZhY3RvcnkgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJhbGFuY2VHYW1lQ2hhbGxlbmdlRmFjdG9yeTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsWUFBWSxNQUFNLHVCQUF1QjtBQUNoRCxPQUFPQyxpQkFBaUIsTUFBTSxtQ0FBbUM7QUFDakUsT0FBT0MsTUFBTSxNQUFNLHFDQUFxQztBQUN4RCxPQUFPQyxPQUFPLE1BQU0sc0NBQXNDO0FBQzFELE9BQU9DLEdBQUcsTUFBTSxrQ0FBa0M7QUFDbEQsT0FBT0MsVUFBVSxNQUFNLHlDQUF5QztBQUNoRSxPQUFPQyxXQUFXLE1BQU0sMENBQTBDO0FBQ2xFLE9BQU9DLEtBQUssTUFBTSxvQ0FBb0M7QUFDdEQsT0FBT0MsV0FBVyxNQUFNLDBDQUEwQztBQUNsRSxPQUFPQyxTQUFTLE1BQU0sd0NBQXdDO0FBQzlELE9BQU9DLElBQUksTUFBTSxtQ0FBbUM7QUFDcEQsT0FBT0MsV0FBVyxNQUFNLDBDQUEwQztBQUNsRSxPQUFPQyxhQUFhLE1BQU0sNENBQTRDO0FBQ3RFLE9BQU9DLEdBQUcsTUFBTSxrQ0FBa0M7QUFDbEQsT0FBT0MsWUFBWSxNQUFNLDJDQUEyQztBQUNwRSxPQUFPQyxVQUFVLE1BQU0seUNBQXlDO0FBQ2hFLE9BQU9DLFdBQVcsTUFBTSwwQ0FBMEM7QUFDbEUsT0FBT0MsS0FBSyxNQUFNLG9DQUFvQztBQUN0RCxPQUFPQyxXQUFXLE1BQU0sMENBQTBDO0FBQ2xFLE9BQU9DLFNBQVMsTUFBTSx3Q0FBd0M7QUFDOUQsT0FBT0MsVUFBVSxNQUFNLHlDQUF5QztBQUNoRSxPQUFPQyxVQUFVLE1BQU0seUNBQXlDO0FBQ2hFLE9BQU9DLFFBQVEsTUFBTSx1Q0FBdUM7QUFDNUQsT0FBT0MsSUFBSSxNQUFNLG1DQUFtQztBQUNwRCxPQUFPQyxLQUFLLE1BQU0sb0NBQW9DO0FBQ3RELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0Msc0JBQXNCLE1BQU0sNkJBQTZCO0FBQ2hFLE9BQU9DLHNCQUFzQixNQUFNLDZCQUE2QjtBQUNoRSxPQUFPQyx1QkFBdUIsTUFBTSw4QkFBOEI7O0FBRWxFO0FBQ0EsTUFBTUMsd0NBQXdDLEdBQUcsQ0FBRS9CLEtBQUssQ0FBQ2dDLGNBQWMsQ0FBRUwsS0FBSyxDQUFDTSxNQUFNLEdBQUdOLEtBQUssQ0FBQ08sNkJBQTZCLEdBQUcsQ0FBRSxDQUFDLEdBQUcsQ0FBQyxJQUFLUCxLQUFLLENBQUNPLDZCQUE2Qjs7QUFFN0s7QUFDQTtBQUNBLE1BQU1DLGdCQUFnQixHQUFHLEVBQUU7QUFDM0IsTUFBTUMsd0JBQXdCLEdBQUcsQ0FBQzs7QUFFbEM7QUFDQTtBQUNBLE1BQU1DLHdCQUF3QixHQUFHLENBQy9CLElBQUk5QixVQUFVLENBQUUsQ0FBQyxFQUFFTixPQUFPLENBQUNxQyxJQUFLLENBQUMsRUFDakMsSUFBSS9CLFVBQVUsQ0FBRSxDQUFDLEVBQUVOLE9BQU8sQ0FBQ3FDLElBQUssQ0FBQyxFQUNqQyxJQUFJL0IsVUFBVSxDQUFFLENBQUMsRUFBRU4sT0FBTyxDQUFDcUMsSUFBSyxDQUFDLEVBQ2pDLElBQUkvQixVQUFVLENBQUUsQ0FBQyxFQUFFTixPQUFPLENBQUNxQyxJQUFLLENBQUMsRUFDakMsSUFBSWQsUUFBUSxDQUFFdkIsT0FBTyxDQUFDcUMsSUFBSSxFQUFFLEtBQU0sQ0FBQyxFQUNuQyxJQUFJakIsU0FBUyxDQUFFcEIsT0FBTyxDQUFDcUMsSUFBSSxFQUFFLEtBQU0sQ0FBQyxFQUNwQyxJQUFJckIsVUFBVSxDQUFFaEIsT0FBTyxDQUFDcUMsSUFBSSxFQUFFLEtBQU0sQ0FBQyxFQUNyQyxJQUFJakMsT0FBTyxDQUFFSixPQUFPLENBQUNxQyxJQUFJLEVBQUUsS0FBTSxDQUFDLEVBQ2xDLElBQUloQyxHQUFHLENBQUVMLE9BQU8sQ0FBQ3FDLElBQUksRUFBRSxLQUFNLENBQUMsRUFDOUIsSUFBSTFCLElBQUksQ0FBRVgsT0FBTyxDQUFDcUMsSUFBSSxFQUFFLEtBQU0sQ0FBQyxFQUMvQixJQUFJdkIsR0FBRyxDQUFFZCxPQUFPLENBQUNxQyxJQUFJLEVBQUUsS0FBTSxDQUFDLEVBQzlCLElBQUlaLEtBQUssQ0FBRXpCLE9BQU8sQ0FBQ3FDLElBQUksRUFBRSxLQUFNLENBQUMsRUFDaEMsSUFBSWxDLE1BQU0sQ0FBRUgsT0FBTyxDQUFDcUMsSUFBSSxFQUFFLEtBQU0sQ0FBQyxFQUNqQyxJQUFJOUIsV0FBVyxDQUFFUCxPQUFPLENBQUNxQyxJQUFJLEVBQUUsS0FBTSxDQUFDLEVBQ3RDLElBQUluQixLQUFLLENBQUVsQixPQUFPLENBQUNxQyxJQUFJLEVBQUUsS0FBTSxDQUFDLEVBQ2hDLElBQUloQixVQUFVLENBQUVyQixPQUFPLENBQUNxQyxJQUFJLEVBQUUsS0FBTSxDQUFDLEVBQ3JDLElBQUlsQixXQUFXLENBQUVuQixPQUFPLENBQUNxQyxJQUFJLEVBQUUsS0FBTSxDQUFDLENBQ3ZDOztBQUVEO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLGNBQWMsR0FBRyxDQUNyQixJQUFJN0IsV0FBVyxDQUFFVCxPQUFPLENBQUNxQyxJQUFJLEVBQUUsSUFBSyxDQUFDLEVBQ3JDLElBQUlmLFVBQVUsQ0FBRXRCLE9BQU8sQ0FBQ3FDLElBQUksRUFBRSxJQUFLLENBQUMsRUFDcEMsSUFBSXhCLGFBQWEsQ0FBRWIsT0FBTyxDQUFDcUMsSUFBSSxFQUFFLElBQUssQ0FBQyxFQUN2QyxJQUFJakIsU0FBUyxDQUFFcEIsT0FBTyxDQUFDcUMsSUFBSSxFQUFFLElBQUssQ0FBQyxFQUNuQyxJQUFJN0IsS0FBSyxDQUFFUixPQUFPLENBQUNxQyxJQUFJLEVBQUUsSUFBSyxDQUFDLEVBQy9CLElBQUkzQixTQUFTLENBQUVWLE9BQU8sQ0FBQ3FDLElBQUksRUFBRSxJQUFLLENBQUMsRUFDbkMsSUFBSXRCLFlBQVksQ0FBRWYsT0FBTyxDQUFDcUMsSUFBSSxFQUFFLElBQUssQ0FBQyxFQUN0QyxJQUFJekIsV0FBVyxDQUFFWixPQUFPLENBQUNxQyxJQUFJLEVBQUUsSUFBSyxDQUFDLEVBQ3JDLElBQUlwQixXQUFXLENBQUVqQixPQUFPLENBQUNxQyxJQUFJLEVBQUUsSUFBSyxDQUFDLEVBQ3JDLElBQUliLElBQUksQ0FBRXhCLE9BQU8sQ0FBQ3FDLElBQUksRUFBRSxJQUFLLENBQUMsQ0FDL0I7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsTUFBTUUsa0JBQWtCLEdBQUcsQ0FDekIsSUFBSWhCLFFBQVEsQ0FBRXZCLE9BQU8sQ0FBQ3FDLElBQUksRUFBRSxLQUFNLENBQUMsRUFDbkMsSUFBSWpCLFNBQVMsQ0FBRXBCLE9BQU8sQ0FBQ3FDLElBQUksRUFBRSxLQUFNLENBQUMsRUFDcEMsSUFBSXJCLFVBQVUsQ0FBRWhCLE9BQU8sQ0FBQ3FDLElBQUksRUFBRSxLQUFNLENBQUMsRUFDckMsSUFBSTlCLFdBQVcsQ0FBRVAsT0FBTyxDQUFDcUMsSUFBSSxFQUFFLEtBQU0sQ0FBQyxFQUN0QyxJQUFJbEIsV0FBVyxDQUFFbkIsT0FBTyxDQUFDcUMsSUFBSSxFQUFFLEtBQU0sQ0FBQyxDQUN2Qzs7QUFFRDtBQUNBO0FBQ0EsTUFBTUcscUJBQXFCLEdBQUcsRUFBRTtBQUNoQyxNQUFNQywyQkFBMkIsR0FBRyxFQUFFO0FBQ3RDLE1BQU1DLDRCQUE0QixHQUFHLEVBQUU7QUFFdkMsTUFBTUMsMkJBQTJCLEdBQUc7RUFFbEM7RUFDQUMsT0FBT0EsQ0FBRUMsR0FBRyxFQUFHO0lBQ2IsT0FBT0MsSUFBSSxDQUFDQyxLQUFLLENBQUVqRCxTQUFTLENBQUNrRCxVQUFVLENBQUMsQ0FBQyxHQUFHSCxHQUFJLENBQUM7RUFDbkQsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VJLG1CQUFtQkEsQ0FBRUMsY0FBYyxFQUFFQyxnQkFBZ0IsRUFBRUMsaUJBQWlCLEVBQUVDLFdBQVcsRUFBRztJQUN0RixJQUFLSCxjQUFjLEdBQUdFLGlCQUFpQixHQUFHRCxnQkFBZ0IsR0FBR0UsV0FBVyxJQUFJSCxjQUFjLEdBQUdHLFdBQVcsR0FBR0YsZ0JBQWdCLEdBQUdDLGlCQUFpQixFQUFHO01BQ2hKO01BQ0EsT0FBTyxLQUFLO0lBQ2Q7SUFFQSxPQUFTRixjQUFjLEdBQUdDLGdCQUFnQixHQUFLQyxpQkFBaUIsSUFBSWxELGlCQUFpQixDQUFDb0Qsb0JBQW9CO0VBQzVHLENBQUM7RUFFREMsa0NBQWtDQSxDQUFFTCxjQUFjLEVBQUVDLGdCQUFnQixFQUFHO0lBQ3JFLE1BQU1LLHVCQUF1QixHQUFHLElBQUksQ0FBQ0MsdUJBQXVCLENBQUVQLGNBQWMsRUFBRUMsZ0JBQWlCLENBQUM7O0lBRWhHO0lBQ0EsT0FBTyxDQUFDSyx1QkFBdUIsQ0FBRSxJQUFJLENBQUNaLE9BQU8sQ0FBRVksdUJBQXVCLENBQUNFLE1BQU8sQ0FBQyxDQUFFO0VBQ25GLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsOEJBQThCQSxDQUFFQyxXQUFXLEVBQUVQLFdBQVcsRUFBRVEsTUFBTSxFQUFHO0lBQ2pFLElBQUlDLGFBQWEsR0FBR0MsTUFBTSxDQUFDQyxpQkFBaUI7SUFDNUMsTUFBTUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDL0IsSUFBSUMsWUFBWSxHQUFHLEVBQUU7SUFDckIsSUFBSUMsZ0JBQWdCLEdBQUdELFlBQVk7SUFDbkMsS0FBTSxJQUFJRSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdsQyxnQkFBZ0IsRUFBRWtDLENBQUMsRUFBRSxFQUFHO01BQzNDRixZQUFZLEdBQUcsRUFBRTtNQUNqQjtNQUNBO01BQ0EsS0FBTSxJQUFJRyxDQUFDLEdBQUcsQ0FBQyxFQUFFSCxZQUFZLENBQUNSLE1BQU0sR0FBR0csTUFBTSxDQUFDSCxNQUFNLElBQUlXLENBQUMsR0FBR25DLGdCQUFnQixFQUFFbUMsQ0FBQyxFQUFFLEVBQUc7UUFDbEYsSUFBSUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDQyxnQ0FBZ0MsQ0FBRVgsV0FBVyxFQUFFUCxXQUFZLENBQUM7UUFDekYsSUFBS2dCLENBQUMsS0FBSyxDQUFDLEVBQUc7VUFDYjtVQUNBQyxpQkFBaUIsR0FBR3hFLFNBQVMsQ0FBQ2tELFVBQVUsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUNzQixpQkFBaUIsR0FBR0EsaUJBQWlCO1FBQzVGLENBQUMsTUFDSTtVQUNIO1VBQ0E7VUFDQUEsaUJBQWlCLEdBQUdKLFlBQVksQ0FBRUEsWUFBWSxDQUFDUixNQUFNLEdBQUcsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUNZLGlCQUFpQixHQUFHQSxpQkFBaUI7UUFDMUc7UUFDQTtRQUNBLElBQUtKLFlBQVksQ0FBQ00sT0FBTyxDQUFFRixpQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFHO1VBQ3RESixZQUFZLENBQUNPLElBQUksQ0FBRUgsaUJBQWtCLENBQUM7UUFDeEM7TUFDRjtNQUNBO01BQ0E7TUFDQSxJQUFLSixZQUFZLENBQUNSLE1BQU0sS0FBS0csTUFBTSxDQUFDSCxNQUFNLEVBQUc7UUFDM0NRLFlBQVksR0FBRyxFQUFFO1FBQ2pCLEtBQU0sSUFBSVEsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHYixNQUFNLENBQUNILE1BQU0sRUFBRWdCLENBQUMsRUFBRSxFQUFHO1VBQ3hDO1VBQ0FSLFlBQVksQ0FBQ08sSUFBSSxDQUFFYixXQUFXLEdBQUdsQyxLQUFLLENBQUNPLDZCQUE2QixHQUFHeUMsQ0FBRSxDQUFDO1VBQzFFO1VBQ0FDLE9BQU8sQ0FBQ0MsR0FBRyxDQUFFLDBFQUEyRSxDQUFDO1FBQzNGO01BQ0Y7TUFDQTtNQUNBLElBQUlDLFNBQVMsR0FBRyxDQUFDO01BQ2pCLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHakIsTUFBTSxDQUFDSCxNQUFNLEVBQUVvQixDQUFDLEVBQUUsRUFBRztRQUN4Q0QsU0FBUyxJQUFJaEIsTUFBTSxDQUFFaUIsQ0FBQyxDQUFFLENBQUNDLFNBQVMsR0FBR2IsWUFBWSxDQUFFWSxDQUFDLENBQUU7TUFDeEQ7TUFDQUQsU0FBUyxHQUFHL0IsSUFBSSxDQUFDa0MsR0FBRyxDQUFFSCxTQUFVLENBQUM7TUFDakMsSUFBS0EsU0FBUyxHQUFHZixhQUFhLElBQUllLFNBQVMsR0FBR1osbUJBQW1CLEVBQUc7UUFDbEVILGFBQWEsR0FBR2UsU0FBUztRQUN6QlYsZ0JBQWdCLEdBQUdELFlBQVksQ0FBQ2UsS0FBSyxDQUFFLENBQUUsQ0FBQztNQUM1QztJQUNGOztJQUVBO0lBQ0E7SUFDQSxNQUFNQyxrQkFBa0IsR0FBRyxFQUFFO0lBQzdCLEtBQU0sSUFBSWQsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHUCxNQUFNLENBQUNILE1BQU0sRUFBRVUsQ0FBQyxFQUFFLEVBQUc7TUFDeENjLGtCQUFrQixDQUFDVCxJQUFJLENBQUU7UUFBRVUsSUFBSSxFQUFFdEIsTUFBTSxDQUFFTyxDQUFDLENBQUU7UUFBRWdCLFFBQVEsRUFBRWpCLGdCQUFnQixDQUFFQyxDQUFDO01BQUcsQ0FBRSxDQUFDO0lBQ25GO0lBQ0EsT0FBT2Msa0JBQWtCO0VBQzNCLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VYLGdDQUFnQ0EsQ0FBQSxFQUFHO0lBQ2pDLE1BQU1sQixXQUFXLEdBQUczQixLQUFLLENBQUNNLE1BQU0sR0FBRyxDQUFDO0lBQ3BDLE1BQU1xRCxTQUFTLEdBQUczRCxLQUFLLENBQUNPLDZCQUE2QjtJQUNyRCxNQUFNcUQsYUFBYSxHQUFHdkYsS0FBSyxDQUFDZ0MsY0FBYyxDQUFFc0IsV0FBVyxHQUFHZ0MsU0FBVSxDQUFDLEdBQUcsQ0FBQztJQUN6RSxPQUFPLENBQUUsSUFBSSxDQUFDekMsT0FBTyxDQUFFMEMsYUFBYyxDQUFDLEdBQUcsQ0FBQyxJQUFLRCxTQUFTO0VBQzFELENBQUM7RUFFREUscUNBQXFDQSxDQUFFM0IsV0FBVyxFQUFFUCxXQUFXLEVBQUc7SUFDaEUsTUFBTW1DLGFBQWEsR0FBRzFDLElBQUksQ0FBQzJDLElBQUksQ0FBRTdCLFdBQVcsR0FBR2xDLEtBQUssQ0FBQ08sNkJBQThCLENBQUM7SUFDcEYsTUFBTXFELGFBQWEsR0FBR3hDLElBQUksQ0FBQ0MsS0FBSyxDQUFFTSxXQUFXLEdBQUczQixLQUFLLENBQUNPLDZCQUE4QixDQUFDO0lBRXJGLE9BQU8sQ0FBRSxJQUFJLENBQUNXLE9BQU8sQ0FBRTBDLGFBQWEsR0FBR0UsYUFBYSxHQUFHLENBQUUsQ0FBQyxHQUFHQSxhQUFhLElBQUs5RCxLQUFLLENBQUNPLDZCQUE2QjtFQUNwSCxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7RUFDRXlELDBCQUEwQkEsQ0FBRUMsbUJBQW1CLEVBQUVDLG1CQUFtQixFQUFFQyxvQkFBb0IsRUFBRXpDLGlCQUFpQixFQUFFQyxXQUFXLEVBQUc7SUFDM0gsTUFBTXlDLGtCQUFrQixHQUFHLEVBQUU7SUFDN0IsS0FBTSxJQUFJQyxrQkFBa0IsR0FBRzNDLGlCQUFpQixFQUFFMkMsa0JBQWtCLElBQUkxQyxXQUFXLEVBQUUwQyxrQkFBa0IsSUFBSTNDLGlCQUFpQixFQUFHO01BQzdILEtBQU0sSUFBSTRDLGtCQUFrQixHQUFHNUMsaUJBQWlCLEVBQUU0QyxrQkFBa0IsSUFBSTNDLFdBQVcsRUFBRTJDLGtCQUFrQixJQUFJNUMsaUJBQWlCLEVBQUc7UUFDN0gsSUFBSzJDLGtCQUFrQixLQUFLQyxrQkFBa0IsSUFBSWxELElBQUksQ0FBQ2tDLEdBQUcsQ0FBRWUsa0JBQWtCLEdBQUdDLGtCQUFtQixDQUFDLEdBQUcsR0FBRyxHQUFHNUMsaUJBQWlCLEVBQUc7VUFDaEk7VUFDQTtVQUNBO1FBQ0Y7UUFDQSxNQUFNNkMsZUFBZSxHQUFHTixtQkFBbUIsQ0FBQ1osU0FBUyxHQUFHZ0Isa0JBQWtCLEdBQUdILG1CQUFtQixDQUFDYixTQUFTLEdBQUdpQixrQkFBa0I7UUFDL0gsTUFBTUUsbUJBQW1CLEdBQUdELGVBQWUsR0FBR0osb0JBQW9CLENBQUNkLFNBQVM7UUFDNUUsSUFBS21CLG1CQUFtQixJQUFJOUMsaUJBQWlCLElBQUk4QyxtQkFBbUIsSUFBSTdDLFdBQVcsSUFBSTZDLG1CQUFtQixHQUFHOUMsaUJBQWlCLEtBQUssQ0FBQyxFQUFHO1VBQ3JJO1VBQ0EwQyxrQkFBa0IsQ0FBQ3JCLElBQUksQ0FBRTlDLHNCQUFzQixDQUFDd0Usb0JBQW9CLENBQUVSLG1CQUFtQixDQUFDUyxVQUFVLENBQUMsQ0FBQyxFQUFFTCxrQkFBa0IsRUFDeEhILG1CQUFtQixDQUFDUSxVQUFVLENBQUMsQ0FBQyxFQUFFSixrQkFBa0IsRUFBRUgsb0JBQW9CLENBQUNPLFVBQVUsQ0FBQyxDQUFFLENBQUUsQ0FBQztRQUMvRjtNQUNGO0lBQ0Y7SUFFQSxPQUFPTixrQkFBa0I7RUFDM0IsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRXJDLHVCQUF1QkEsQ0FBRTRDLGVBQWUsRUFBRUMsaUJBQWlCLEVBQUc7SUFDNUQsTUFBTTlDLHVCQUF1QixHQUFHLEVBQUU7SUFDbEMsS0FBTSxJQUFJK0MsWUFBWSxHQUFHN0UsS0FBSyxDQUFDTyw2QkFBNkIsRUFDdERzRSxZQUFZLElBQUk3RSxLQUFLLENBQUM4RSxtQ0FBbUMsRUFDekRELFlBQVksSUFBSTdFLEtBQUssQ0FBQ08sNkJBQTZCLEVBQUc7TUFFMUQsTUFBTXdFLHlCQUF5QixHQUFHRixZQUFZLEdBQUdELGlCQUFpQixHQUFHRCxlQUFlO01BQ3BGLElBQUtJLHlCQUF5QixJQUFJL0UsS0FBSyxDQUFDOEUsbUNBQW1DLElBQ3RFQyx5QkFBeUIsSUFBSS9FLEtBQUssQ0FBQ08sNkJBQTZCLEdBQUcvQixpQkFBaUIsQ0FBQ29ELG9CQUFvQixJQUN6R21ELHlCQUF5QixHQUFHL0UsS0FBSyxDQUFDTyw2QkFBNkIsR0FBRy9CLGlCQUFpQixDQUFDb0Qsb0JBQW9CLEVBQUc7UUFDOUc7UUFDQUUsdUJBQXVCLENBQUNpQixJQUFJLENBQUVnQyx5QkFBMEIsQ0FBQztNQUMzRDtJQUNGO0lBQ0EsT0FBT2pELHVCQUF1QjtFQUNoQyxDQUFDO0VBRURrRCw0QkFBNEJBLENBQUVDLHFCQUFxQixFQUFFQyw0QkFBNEIsRUFBRUMsdUJBQXVCLEVBQUc7SUFDM0csT0FBT2xGLHNCQUFzQixDQUFDbUYsb0JBQW9CLENBQUUsSUFBSXhHLFVBQVUsQ0FBRXFHLHFCQUFzQixDQUFDLEVBQUVDLDRCQUE0QixFQUFFLElBQUl0RyxVQUFVLENBQUV1Ryx1QkFBd0IsQ0FBRSxDQUFDO0VBQ3hLLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLGlCQUFpQkEsQ0FBRWhDLFNBQVMsRUFBRWlDLE1BQU0sRUFBRztJQUNyQyxNQUFNQyxXQUFXLEdBQUcsSUFBSSxDQUFDckUsT0FBTyxDQUFFUix3QkFBd0IsQ0FBQ3NCLE1BQU8sQ0FBQztJQUNuRSxLQUFNLElBQUlVLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2hDLHdCQUF3QixDQUFDc0IsTUFBTSxFQUFFVSxDQUFDLEVBQUUsRUFBRztNQUMxRCxNQUFNOEMsc0JBQXNCLEdBQUc5RSx3QkFBd0IsQ0FBRSxDQUFFZ0MsQ0FBQyxHQUFHNkMsV0FBVyxJQUFLN0Usd0JBQXdCLENBQUNzQixNQUFNLENBQUU7TUFDaEgsS0FBTSxJQUFJVyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcyQyxNQUFNLENBQUN0RCxNQUFNLEVBQUVXLENBQUMsRUFBRSxFQUFHO1FBQ3hDLElBQUs2QyxzQkFBc0IsQ0FBQ25DLFNBQVMsR0FBR2lDLE1BQU0sQ0FBRTNDLENBQUMsQ0FBRSxLQUFLVSxTQUFTLEVBQUc7VUFDbEU7VUFDQSxPQUFPbUMsc0JBQXNCLENBQUNkLFVBQVUsQ0FBQyxDQUFDO1FBQzVDO01BQ0Y7SUFDRjs7SUFFQTtJQUNBO0lBQ0EsT0FBTyxJQUFJO0VBQ2IsQ0FBQztFQUVEO0VBQ0FlLDhCQUE4QkEsQ0FBQSxFQUFHO0lBQy9CLE1BQU1DLFNBQVMsR0FBRyxJQUFJLENBQUN4RSxPQUFPLENBQUUsQ0FBRSxDQUFDLEdBQUcsQ0FBQztJQUN2QyxNQUFNd0MsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDYixnQ0FBZ0MsQ0FBQyxDQUFDO0lBQ3pELE9BQU8sSUFBSSxDQUFDbUMsNEJBQTRCLENBQUVVLFNBQVMsRUFBRWhDLFFBQVEsRUFBRWdDLFNBQVUsQ0FBQztFQUM1RSxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsNEJBQTRCQSxDQUFBLEVBQUc7SUFDN0IsSUFBSVYscUJBQXFCLEdBQUcsQ0FBQztJQUM3QixJQUFJRSx1QkFBdUIsR0FBRyxDQUFDO0lBQy9CLElBQUlTLHdCQUF3QixHQUFHLEVBQUU7SUFFakMsT0FBUUEsd0JBQXdCLENBQUM1RCxNQUFNLEtBQUssQ0FBQyxFQUFHO01BQzlDO01BQ0E7TUFDQWlELHFCQUFxQixHQUFHN0QsSUFBSSxDQUFDeUUsR0FBRyxDQUFFLENBQUMsRUFBRSxJQUFJLENBQUMzRSxPQUFPLENBQUUsQ0FBRSxDQUFFLENBQUM7O01BRXhEO01BQ0EsSUFBSytELHFCQUFxQixLQUFLLENBQUMsSUFBSTdHLFNBQVMsQ0FBQ2tELFVBQVUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFHO1FBQ2pFNkQsdUJBQXVCLEdBQUcsQ0FBQyxHQUFHRixxQkFBcUI7TUFDckQsQ0FBQyxNQUNJO1FBQ0hFLHVCQUF1QixHQUFHRixxQkFBcUIsR0FBRyxDQUFDO01BQ3JEOztNQUVBO01BQ0E7TUFDQVcsd0JBQXdCLEdBQUcsSUFBSSxDQUFDN0QsdUJBQXVCLENBQUVrRCxxQkFBcUIsR0FBR3JHLFVBQVUsQ0FBQ2tILFVBQVUsRUFDcEdYLHVCQUF1QixHQUFHdkcsVUFBVSxDQUFDa0gsVUFBVyxDQUFDO0lBQ3JEOztJQUVBO0lBQ0EsTUFBTVosNEJBQTRCLEdBQUcsQ0FBQ1Usd0JBQXdCLENBQUUsSUFBSSxDQUFDMUUsT0FBTyxDQUFFMEUsd0JBQXdCLENBQUM1RCxNQUFPLENBQUMsQ0FBRTs7SUFFakg7SUFDQSxPQUFPLElBQUksQ0FBQ2dELDRCQUE0QixDQUFFQyxxQkFBcUIsRUFBRUMsNEJBQTRCLEVBQUVDLHVCQUF3QixDQUFDO0VBQzFILENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VZLGdDQUFnQ0EsQ0FBQSxFQUFHO0lBRWpDLElBQUlDLGtCQUFrQjtJQUN0QixJQUFJQyxXQUFXOztJQUVmO0lBQ0EsR0FBRztNQUNEO01BQ0FELGtCQUFrQixHQUFHdEYsd0JBQXdCLENBQUUsSUFBSSxDQUFDUSxPQUFPLENBQUVSLHdCQUF3QixDQUFDc0IsTUFBTyxDQUFDLENBQUU7O01BRWhHO01BQ0FpRSxXQUFXLEdBQUcsSUFBSSxDQUFDWixpQkFBaUIsQ0FBRVcsa0JBQWtCLENBQUMzQyxTQUFTLEVBQUUsQ0FBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUcsQ0FBQztNQUM5SDZDLE1BQU0sSUFBSUEsTUFBTSxDQUFFRCxXQUFXLEtBQUssSUFBSSxFQUFFLGtDQUFtQyxDQUFDO0lBQzlFLENBQUMsUUFDTyxDQUFDLElBQUksQ0FBQzFFLG1CQUFtQixDQUFFeUUsa0JBQWtCLENBQUMzQyxTQUFTLEVBQzdENEMsV0FBVyxDQUFDNUMsU0FBUyxFQUNyQnJELEtBQUssQ0FBQ08sNkJBQTZCLEVBQ25DSCx3Q0FBeUMsQ0FBQzs7SUFFNUM7SUFDQSxNQUFNOEUsNEJBQTRCLEdBQUcsSUFBSSxDQUFDckQsa0NBQWtDLENBQUVtRSxrQkFBa0IsQ0FBQzNDLFNBQVMsRUFBRTRDLFdBQVcsQ0FBQzVDLFNBQVUsQ0FBQzs7SUFFbkk7SUFDQSxPQUFPcEQsc0JBQXNCLENBQUNtRixvQkFBb0IsQ0FBRVksa0JBQWtCLENBQUN0QixVQUFVLENBQUMsQ0FBQyxFQUFFUSw0QkFBNEIsRUFBRWUsV0FBWSxDQUFDO0VBQ2xJLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtFQUNFRSxnQ0FBZ0NBLENBQUEsRUFBRztJQUNqQyxJQUFJL0Isa0JBQWtCO0lBRXRCLEdBQUc7TUFDRCxNQUFNSCxtQkFBbUIsR0FBR3ZELHdCQUF3QixDQUFFLElBQUksQ0FBQ1EsT0FBTyxDQUFFUix3QkFBd0IsQ0FBQ3NCLE1BQU8sQ0FBQyxDQUFFO01BQ3ZHLE1BQU1rQyxtQkFBbUIsR0FBR3hELHdCQUF3QixDQUFFLElBQUksQ0FBQ1EsT0FBTyxDQUFFUix3QkFBd0IsQ0FBQ3NCLE1BQU8sQ0FBQyxDQUFFO01BQ3ZHLE1BQU1tQyxvQkFBb0IsR0FBR3pELHdCQUF3QixDQUFFLElBQUksQ0FBQ1EsT0FBTyxDQUFFUix3QkFBd0IsQ0FBQ3NCLE1BQU8sQ0FBQyxDQUFFO01BQ3hHb0Msa0JBQWtCLEdBQUcsSUFBSSxDQUFDSiwwQkFBMEIsQ0FBRUMsbUJBQW1CLEVBQUVDLG1CQUFtQixFQUFFQyxvQkFBb0IsRUFDbEhuRSxLQUFLLENBQUNPLDZCQUE2QixFQUFFUCxLQUFLLENBQUNNLE1BQU0sR0FBRyxDQUFDLEdBQUdOLEtBQUssQ0FBQ08sNkJBQThCLENBQUM7SUFDakcsQ0FBQyxRQUFTNkQsa0JBQWtCLENBQUNwQyxNQUFNLEtBQUssQ0FBQzs7SUFFekM7SUFDQSxPQUFPb0Msa0JBQWtCLENBQUUsSUFBSSxDQUFDbEQsT0FBTyxDQUFFa0Qsa0JBQWtCLENBQUNwQyxNQUFPLENBQUMsQ0FBRTtFQUN4RSxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7RUFDRW9FLHFDQUFxQ0EsQ0FBQSxFQUFHO0lBQ3RDO0lBQ0E7SUFDQSxNQUFNQyxvQkFBb0IsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDbkYsT0FBTyxDQUFFLENBQUUsQ0FBQztJQUNsRCxJQUFJb0YscUJBQXFCLEdBQUdELG9CQUFvQjtJQUNoRCxPQUFRQyxxQkFBcUIsS0FBS0Qsb0JBQW9CLEVBQUc7TUFDdkRDLHFCQUFxQixHQUFHLENBQUMsR0FBRyxJQUFJLENBQUNwRixPQUFPLENBQUUsQ0FBRSxDQUFDO0lBQy9DOztJQUVBO0lBQ0E7SUFDQTtJQUNBLE1BQU1xRix1QkFBdUIsR0FBRyxJQUFJLENBQUMxRCxnQ0FBZ0MsQ0FBRTdDLEtBQUssQ0FBQ08sNkJBQTZCLEVBQ3hHUCxLQUFLLENBQUNNLE1BQU0sR0FBRyxDQUFDLEdBQUdOLEtBQUssQ0FBQ08sNkJBQTZCLEdBQUcsQ0FBRSxDQUFDOztJQUU5RDtJQUNBLE9BQU9KLHVCQUF1QixDQUFDcUcsTUFBTSxDQUNuQyxJQUFJNUgsVUFBVSxDQUFFeUgsb0JBQXFCLENBQUMsRUFDdENFLHVCQUF1QixFQUN2QixJQUFJM0gsVUFBVSxDQUFFMEgscUJBQXNCLENBQUMsRUFDdkMsQ0FBQ0MsdUJBQXdCLENBQUM7RUFDOUIsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxtQ0FBbUNBLENBQUEsRUFBRztJQUNwQyxNQUFNNUMscUNBQXFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQzNDLE9BQU8sQ0FBRSxDQUFFLENBQUM7O0lBRW5FO0lBQ0EsTUFBTXdGLGdCQUFnQixHQUFHLElBQUksQ0FBQzdDLHFDQUFxQyxDQUFFLENBQUMsR0FBRzdELEtBQUssQ0FBQ08sNkJBQTZCLEVBQzFHUCxLQUFLLENBQUNNLE1BQU0sR0FBRyxDQUFDLEdBQUdOLEtBQUssQ0FBQ08sNkJBQTZCLEdBQUcsQ0FBRSxDQUFDOztJQUU5RDtJQUNBO0lBQ0EsSUFBSW9HLGlCQUFpQixHQUFHLENBQUNELGdCQUFnQjtJQUN6QyxJQUFLdEksU0FBUyxDQUFDa0QsVUFBVSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUc7TUFDbENxRixpQkFBaUIsR0FBRyxDQUFDLElBQUksQ0FBQzlDLHFDQUFxQyxDQUFFLENBQUMsR0FBRzdELEtBQUssQ0FBQ08sNkJBQTZCLEVBQ3RHUCxLQUFLLENBQUNNLE1BQU0sR0FBRyxDQUFDLEdBQUdOLEtBQUssQ0FBQ08sNkJBQTZCLEdBQUcsQ0FBRSxDQUFDO0lBQ2hFOztJQUVBO0lBQ0EsT0FBT0osdUJBQXVCLENBQUNxRyxNQUFNLENBQUUsSUFBSTVILFVBQVUsQ0FBRWlGLHFDQUFzQyxDQUFDLEVBQzVGNkMsZ0JBQWdCLEVBQ2hCLElBQUk5SCxVQUFVLENBQUVpRixxQ0FBc0MsQ0FBQyxFQUN2RDhDLGlCQUFrQixDQUFDO0VBQ3ZCLENBQUM7RUFFREMsdUNBQXVDQSxDQUFBLEVBQUc7SUFDeEM7SUFDQSxJQUFJQyxRQUFRLEdBQUdoRyxrQkFBa0IsQ0FBRSxJQUFJLENBQUNLLE9BQU8sQ0FBRUwsa0JBQWtCLENBQUNtQixNQUFPLENBQUMsQ0FBRSxDQUFDMEMsVUFBVSxDQUFDLENBQUM7SUFDM0YsSUFBSW9DLFNBQVMsR0FBRyxJQUFJbEksVUFBVSxDQUFFLElBQUksQ0FBQ3NDLE9BQU8sQ0FBRSxDQUFFLENBQUMsR0FBRyxDQUFFLENBQUM7SUFDdkQsSUFBSzlDLFNBQVMsQ0FBQ2tELFVBQVUsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFHO01BQ25DO01BQ0EsTUFBTXlGLGlCQUFpQixHQUFHRixRQUFRO01BQ2xDQSxRQUFRLEdBQUdDLFNBQVM7TUFDcEJBLFNBQVMsR0FBR0MsaUJBQWlCO0lBQy9COztJQUVBO0lBQ0EsTUFBTUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDL0UsOEJBQThCLENBQzNEakMsS0FBSyxDQUFDTyw2QkFBNkIsRUFDbkNQLEtBQUssQ0FBQ00sTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUdOLEtBQUssQ0FBQ08sNkJBQTZCLEVBQzFELENBQUVzRyxRQUFRLEVBQUVDLFNBQVMsQ0FBRyxDQUFDO0lBRTNCLE9BQU8sSUFBSTNHLHVCQUF1QixDQUFFNkcsaUJBQWtCLENBQUM7RUFDekQsQ0FBQztFQUVEQyx1Q0FBdUNBLENBQUEsRUFBRztJQUN4QztJQUNBLE1BQU1DLEtBQUssR0FBR3JHLGtCQUFrQixDQUFFLElBQUksQ0FBQ0ssT0FBTyxDQUFFTCxrQkFBa0IsQ0FBQ21CLE1BQU8sQ0FBQyxDQUFFLENBQUMwQyxVQUFVLENBQUMsQ0FBQztJQUMxRixNQUFNeUMsS0FBSyxHQUFHdEcsa0JBQWtCLENBQUUsSUFBSSxDQUFDSyxPQUFPLENBQUVMLGtCQUFrQixDQUFDbUIsTUFBTyxDQUFDLENBQUUsQ0FBQzBDLFVBQVUsQ0FBQyxDQUFDO0lBQzFGLE1BQU0wQyxLQUFLLEdBQUcsSUFBSXhJLFVBQVUsQ0FBRSxJQUFJLENBQUNzQyxPQUFPLENBQUUsQ0FBRSxDQUFDLEdBQUcsQ0FBRSxDQUFDOztJQUVyRDtJQUNBO0lBQ0EsTUFBTThGLGlCQUFpQixHQUFHLElBQUksQ0FBQy9FLDhCQUE4QixDQUFFakMsS0FBSyxDQUFDTyw2QkFBNkIsRUFDaEdQLEtBQUssQ0FBQ00sTUFBTSxHQUFHLENBQUMsR0FBR04sS0FBSyxDQUFDTyw2QkFBNkIsRUFBRSxDQUFFMkcsS0FBSyxFQUFFQyxLQUFLLEVBQUVDLEtBQUssQ0FBRyxDQUFDOztJQUVuRjtJQUNBLE9BQU8sSUFBSWpILHVCQUF1QixDQUFFNkcsaUJBQWtCLENBQUM7RUFDekQsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VLLG9DQUFvQ0EsQ0FBQSxFQUFHO0lBQ3JDLE1BQU05QixXQUFXLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQ3JFLE9BQU8sQ0FBRVIsd0JBQXdCLENBQUNzQixNQUFPLENBQUM7SUFDdkUsSUFBSXNGLFNBQVMsR0FBRyxJQUFJO0lBQ3BCLElBQUlDLG9CQUFvQixHQUFHLElBQUk7O0lBRS9CO0lBQ0EsS0FBTSxJQUFJN0UsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHOUIsY0FBYyxDQUFDb0IsTUFBTSxJQUFJc0YsU0FBUyxLQUFLLElBQUksRUFBRTVFLENBQUMsRUFBRSxFQUFHO01BQ3RFNkUsb0JBQW9CLEdBQUczRyxjQUFjLENBQUUsQ0FBRThCLENBQUMsR0FBRzZDLFdBQVcsSUFBSzNFLGNBQWMsQ0FBQ29CLE1BQU0sQ0FBRTtNQUNwRnNGLFNBQVMsR0FBRyxJQUFJLENBQUNqQyxpQkFBaUIsQ0FBRWtDLG9CQUFvQixDQUFDbEUsU0FBUyxFQUFFLENBQUUsQ0FBQyxDQUFHLENBQUM7SUFDN0U7O0lBRUE7SUFDQTtJQUNBNkMsTUFBTSxJQUFJQSxNQUFNLENBQUVvQixTQUFTLEtBQUssSUFBSyxDQUFDOztJQUV0QztJQUNBO0lBQ0EsTUFBTUUsNkJBQTZCLEdBQUcsQ0FBQyxJQUFJLENBQUMzRSxnQ0FBZ0MsQ0FBQyxDQUFDOztJQUU5RTtJQUNBLE9BQU8zQyxzQkFBc0IsQ0FBQ3NHLE1BQU0sQ0FBRWUsb0JBQW9CLENBQUM3QyxVQUFVLENBQUMsQ0FBQyxFQUFFOEMsNkJBQTZCLEVBQUVGLFNBQVUsQ0FBQztFQUNySCxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7RUFDRUcsa0NBQWtDQSxDQUFBLEVBQUc7SUFDbkMsTUFBTWxDLFdBQVcsR0FBRyxJQUFJLENBQUNyRSxPQUFPLENBQUVSLHdCQUF3QixDQUFDc0IsTUFBTyxDQUFDO0lBQ25FLElBQUlzRixTQUFTLEdBQUcsSUFBSTtJQUNwQixJQUFJQyxvQkFBb0IsR0FBRyxJQUFJO0lBRS9CLEtBQU0sSUFBSTdFLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRzlCLGNBQWMsQ0FBQ29CLE1BQU0sSUFBSXNGLFNBQVMsS0FBSyxJQUFJLEVBQUU1RSxDQUFDLEVBQUUsRUFBRztNQUN0RTZFLG9CQUFvQixHQUFHM0csY0FBYyxDQUFFLENBQUU4QixDQUFDLEdBQUc2QyxXQUFXLElBQUszRSxjQUFjLENBQUNvQixNQUFNLENBQUU7TUFDcEZzRixTQUFTLEdBQUcsSUFBSSxDQUFDakMsaUJBQWlCLENBQUVrQyxvQkFBb0IsQ0FBQ2xFLFNBQVMsRUFBRSxDQUFFLENBQUMsRUFBRSxHQUFHLENBQUcsQ0FBQztJQUNsRjs7SUFFQTtJQUNBO0lBQ0E2QyxNQUFNLElBQUlBLE1BQU0sQ0FBRW9CLFNBQVMsS0FBSyxJQUFJLEVBQUUscURBQXNELENBQUM7O0lBRTdGO0lBQ0EsTUFBTUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDM0YsdUJBQXVCLENBQUV3RixvQkFBb0IsQ0FBQ2xFLFNBQVMsRUFBRWlFLFNBQVMsQ0FBQ2pFLFNBQVUsQ0FBQztJQUM3RyxNQUFNbUUsNkJBQTZCLEdBQUcsQ0FBQ0UsaUJBQWlCLENBQUUsSUFBSSxDQUFDeEcsT0FBTyxDQUFFd0csaUJBQWlCLENBQUMxRixNQUFPLENBQUMsQ0FBRTs7SUFFcEc7SUFDQSxPQUFPOUIsc0JBQXNCLENBQUNzRyxNQUFNLENBQUVlLG9CQUFvQixDQUFDN0MsVUFBVSxDQUFDLENBQUMsRUFBRThDLDZCQUE2QixFQUFFRixTQUFVLENBQUM7RUFDckgsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUssc0NBQXNDQSxDQUFBLEVBQUc7SUFDdkMsTUFBTXBDLFdBQVcsR0FBRyxJQUFJLENBQUNyRSxPQUFPLENBQUVSLHdCQUF3QixDQUFDc0IsTUFBTyxDQUFDO0lBQ25FLElBQUlzRixTQUFTLEdBQUcsSUFBSTtJQUNwQixJQUFJQyxvQkFBb0IsR0FBRyxJQUFJO0lBRS9CLEtBQU0sSUFBSTdFLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRzlCLGNBQWMsQ0FBQ29CLE1BQU0sSUFBSXNGLFNBQVMsS0FBSyxJQUFJLEVBQUU1RSxDQUFDLEVBQUUsRUFBRztNQUN0RTZFLG9CQUFvQixHQUFHM0csY0FBYyxDQUFFLENBQUU4QixDQUFDLEdBQUc2QyxXQUFXLElBQUszRSxjQUFjLENBQUNvQixNQUFNLENBQUU7TUFDcEZzRixTQUFTLEdBQUcsSUFBSSxDQUFDakMsaUJBQWlCLENBQUVrQyxvQkFBb0IsQ0FBQ2xFLFNBQVMsRUFBRSxDQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUksR0FBRyxHQUFHLEdBQUcsRUFBTSxHQUFHLEdBQUcsR0FBRyxFQUFJLENBQUMsRUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFLLENBQUM7SUFDbEk7O0lBRUE7SUFDQTtJQUNBNkMsTUFBTSxJQUFJQSxNQUFNLENBQUVvQixTQUFTLEtBQUssSUFBSSxFQUFFLHlEQUEwRCxDQUFDOztJQUVqRztJQUNBLE1BQU1JLGlCQUFpQixHQUFHLElBQUksQ0FBQzNGLHVCQUF1QixDQUFFd0Ysb0JBQW9CLENBQUNsRSxTQUFTLEVBQUVpRSxTQUFTLENBQUNqRSxTQUFVLENBQUM7SUFDN0csTUFBTW1FLDZCQUE2QixHQUFHLENBQUNFLGlCQUFpQixDQUFFLElBQUksQ0FBQ3hHLE9BQU8sQ0FBRXdHLGlCQUFpQixDQUFDMUYsTUFBTyxDQUFDLENBQUU7O0lBRXBHO0lBQ0EsT0FBTzlCLHNCQUFzQixDQUFDc0csTUFBTSxDQUFFZSxvQkFBb0IsQ0FBQzdDLFVBQVUsQ0FBQyxDQUFDLEVBQUU4Qyw2QkFBNkIsRUFBRUYsU0FBVSxDQUFDO0VBQ3JILENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtFQUNFTSxzQkFBc0JBLENBQUVDLElBQUksRUFBRztJQUM3QkEsSUFBSSxDQUFDQyxNQUFNLENBQUUsQ0FBQyxFQUFFekosS0FBSyxDQUFDZ0MsY0FBYyxDQUFFd0gsSUFBSSxDQUFDN0YsTUFBTSxHQUFHLENBQUUsQ0FBRSxDQUFDO0VBQzNELENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRStGLHVCQUF1QkEsQ0FBRUMsa0JBQWtCLEVBQUVDLGNBQWMsRUFBRUMsa0JBQWtCLEVBQUc7SUFDaEYsSUFBSUMsU0FBUyxHQUFHLElBQUk7SUFDcEIsSUFBSUMsd0JBQXdCLEdBQUcsS0FBSztJQUVwQyxLQUFNLElBQUkxRixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdqQyx3QkFBd0IsSUFBSSxDQUFDMkgsd0JBQXdCLEVBQUUxRixDQUFDLEVBQUUsRUFBRztNQUNoRixLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR25DLGdCQUFnQixFQUFFbUMsQ0FBQyxFQUFFLEVBQUc7UUFFM0M7UUFDQXdGLFNBQVMsR0FBR0gsa0JBQWtCLENBQUMsQ0FBQzs7UUFFaEM7UUFDQSxJQUFLQyxjQUFjLENBQUVFLFNBQVMsRUFBRUQsa0JBQW1CLENBQUMsRUFBRztVQUNyRDtVQUNBRSx3QkFBd0IsR0FBRyxJQUFJO1VBQy9CO1FBQ0Y7TUFDRjtNQUNBLElBQUssQ0FBQ0Esd0JBQXdCLEVBQUc7UUFDL0I7UUFDQTtRQUNBO1FBQ0EsSUFBSSxDQUFDUixzQkFBc0IsQ0FBRU0sa0JBQW1CLENBQUM7TUFDbkQ7SUFDRjtJQUNBaEMsTUFBTSxJQUFJQSxNQUFNLENBQUVpQyxTQUFTLEtBQUssSUFBSyxDQUFDLENBQUMsQ0FBQztJQUN4Q0Qsa0JBQWtCLENBQUNuRixJQUFJLENBQUVvRixTQUFVLENBQUM7SUFDcEMsT0FBT0EsU0FBUztFQUNsQixDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxnQkFBZ0JBLENBQUVDLGFBQWEsRUFBRUMsaUJBQWlCLEVBQUc7SUFDbkQsT0FBTyxDQUFDQyxDQUFDLENBQUNDLElBQUksQ0FBRUYsaUJBQWlCLEVBQUVKLFNBQVMsSUFBSUEsU0FBUyxDQUFDTyxjQUFjLENBQUVKLGFBQWMsQ0FBRSxDQUFDO0VBQzdGLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUssaUNBQWlDQSxDQUFFTCxhQUFhLEVBQUVDLGlCQUFpQixFQUFHO0lBQ3BFLE9BQU8sQ0FBQ0MsQ0FBQyxDQUFDQyxJQUFJLENBQUVGLGlCQUFpQixFQUFFSixTQUFTLElBQUlBLFNBQVMsQ0FBQ1MsK0JBQStCLENBQUVOLGFBQWMsQ0FBRSxDQUFDO0VBQzlHLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VPLHFCQUFxQkEsQ0FBRVAsYUFBYSxFQUFFQyxpQkFBaUIsRUFBRztJQUN4RCxPQUFPLENBQUNDLENBQUMsQ0FBQ0MsSUFBSSxDQUFFRixpQkFBaUIsRUFBRUosU0FBUyxJQUFJQSxTQUFTLENBQUNXLG1CQUFtQixDQUFFUixhQUFjLENBQUUsQ0FBQztFQUNsRyxDQUFDO0VBRURTLHdCQUF3QkEsQ0FBRUMsS0FBSyxFQUFHO0lBQ2hDLE9BQU8sSUFBSSxDQUFDakIsdUJBQXVCLENBQUUsSUFBSSxDQUFDa0IsMEJBQTBCLENBQUVELEtBQUssQ0FBRSxDQUFDRSxJQUFJLENBQUUsSUFBSyxDQUFDLEVBQUUsSUFBSSxDQUFDYixnQkFBZ0IsRUFBRXZILHFCQUFzQixDQUFDO0VBQzVJLENBQUM7RUFFRHFJLCtCQUErQkEsQ0FBQSxFQUFHO0lBQ2hDLE9BQU8sSUFBSSxDQUFDcEIsdUJBQXVCLENBQUUsSUFBSSxDQUFDdEMsOEJBQThCLENBQUN5RCxJQUFJLENBQUUsSUFBSyxDQUFDLEVBQUUsSUFBSSxDQUFDYixnQkFBZ0IsRUFBRXZILHFCQUFzQixDQUFDO0VBQ3ZJLENBQUM7RUFFRHNJLDZCQUE2QkEsQ0FBQSxFQUFHO0lBQzlCLE9BQU8sSUFBSSxDQUFDckIsdUJBQXVCLENBQUUsSUFBSSxDQUFDcEMsNEJBQTRCLENBQUN1RCxJQUFJLENBQUUsSUFBSyxDQUFDLEVBQUUsSUFBSSxDQUFDYixnQkFBZ0IsRUFBRXZILHFCQUFzQixDQUFDO0VBQ3JJLENBQUM7RUFFRHVJLGlDQUFpQ0EsQ0FBQSxFQUFHO0lBQ2xDLE9BQU8sSUFBSSxDQUFDdEIsdUJBQXVCLENBQUUsSUFBSSxDQUFDaEMsZ0NBQWdDLENBQUNtRCxJQUFJLENBQUUsSUFBSyxDQUFDLEVBQUUsSUFBSSxDQUFDYixnQkFBZ0IsRUFBRXZILHFCQUFzQixDQUFDO0VBQ3pJLENBQUM7RUFFRHdJLGlDQUFpQ0EsQ0FBQSxFQUFHO0lBQ2xDLE9BQU8sSUFBSSxDQUFDdkIsdUJBQXVCLENBQUUsSUFBSSxDQUFDNUIsZ0NBQWdDLENBQUMrQyxJQUFJLENBQUUsSUFBSyxDQUFDLEVBQUUsSUFBSSxDQUFDYixnQkFBZ0IsRUFBRXZILHFCQUFzQixDQUFDO0VBQ3pJLENBQUM7RUFFRHlJLHFDQUFxQ0EsQ0FBQSxFQUFHO0lBQ3RDLE9BQU8sSUFBSSxDQUFDeEIsdUJBQXVCLENBQUUsSUFBSSxDQUFDVixvQ0FBb0MsQ0FBQzZCLElBQUksQ0FBRSxJQUFLLENBQUMsRUFBRSxJQUFJLENBQUNMLHFCQUFxQixFQUFFOUgsMkJBQTRCLENBQUM7RUFDeEosQ0FBQztFQUVEeUksbUNBQW1DQSxDQUFBLEVBQUc7SUFDcEMsT0FBTyxJQUFJLENBQUN6Qix1QkFBdUIsQ0FBRSxJQUFJLENBQUNOLGtDQUFrQyxDQUFDeUIsSUFBSSxDQUFFLElBQUssQ0FBQyxFQUFFLElBQUksQ0FBQ0wscUJBQXFCLEVBQUU5SCwyQkFBNEIsQ0FBQztFQUN0SixDQUFDO0VBRUQwSSx1Q0FBdUNBLENBQUEsRUFBRztJQUN4QyxPQUFPLElBQUksQ0FBQzFCLHVCQUF1QixDQUFFLElBQUksQ0FBQ0osc0NBQXNDLENBQUN1QixJQUFJLENBQUUsSUFBSyxDQUFDLEVBQUUsSUFBSSxDQUFDTCxxQkFBcUIsRUFBRTlILDJCQUE0QixDQUFDO0VBQzFKLENBQUM7RUFFRDJJLHNDQUFzQ0EsQ0FBQSxFQUFHO0lBQ3ZDLE9BQU8sSUFBSSxDQUFDM0IsdUJBQXVCLENBQUUsSUFBSSxDQUFDM0IscUNBQXFDLENBQUM4QyxJQUFJLENBQUUsSUFBSyxDQUFDLEVBQUUsSUFBSSxDQUFDUCxpQ0FBaUMsRUFBRTNILDRCQUE2QixDQUFDO0VBQ3RLLENBQUM7RUFFRDJJLG9DQUFvQ0EsQ0FBQSxFQUFHO0lBQ3JDLE9BQU8sSUFBSSxDQUFDNUIsdUJBQXVCLENBQUUsSUFBSSxDQUFDdEIsbUNBQW1DLENBQUN5QyxJQUFJLENBQUUsSUFBSyxDQUFDLEVBQUUsSUFBSSxDQUFDUCxpQ0FBaUMsRUFBRTNILDRCQUE2QixDQUFDO0VBQ3BLLENBQUM7RUFFRDRJLHdDQUF3Q0EsQ0FBQSxFQUFHO0lBQ3pDLE9BQU8sSUFBSSxDQUFDN0IsdUJBQXVCLENBQUUsSUFBSSxDQUFDbkIsdUNBQXVDLENBQUNzQyxJQUFJLENBQUUsSUFBSyxDQUFDLEVBQUUsSUFBSSxDQUFDUCxpQ0FBaUMsRUFBRTNILDRCQUE2QixDQUFDO0VBQ3hLLENBQUM7RUFFRDZJLHdDQUF3Q0EsQ0FBQSxFQUFHO0lBQ3pDLE9BQU8sSUFBSSxDQUFDOUIsdUJBQXVCLENBQUUsSUFBSSxDQUFDZCx1Q0FBdUMsQ0FBQ2lDLElBQUksQ0FBRSxJQUFLLENBQUMsRUFBRSxJQUFJLENBQUNQLGlDQUFpQyxFQUFFM0gsNEJBQTZCLENBQUM7RUFDeEssQ0FBQztFQUVEOEksb0JBQW9CQSxDQUFFZCxLQUFLLEVBQUc7SUFDNUIsTUFBTWUsb0JBQW9CLEdBQUcsRUFBRTtJQUMvQixRQUFRZixLQUFLO01BRVgsS0FBSyxDQUFDO1FBQ0plLG9CQUFvQixDQUFDaEgsSUFBSSxDQUFFLElBQUksQ0FBQ29HLCtCQUErQixDQUFDLENBQUUsQ0FBQztRQUNuRVksb0JBQW9CLENBQUNoSCxJQUFJLENBQUUsSUFBSSxDQUFDMkcsc0NBQXNDLENBQUMsQ0FBRSxDQUFDO1FBQzFFSyxvQkFBb0IsQ0FBQ2hILElBQUksQ0FBRSxJQUFJLENBQUNxRyw2QkFBNkIsQ0FBQyxDQUFFLENBQUM7UUFDakVXLG9CQUFvQixDQUFDaEgsSUFBSSxDQUFFLElBQUksQ0FBQ3dHLHFDQUFxQyxDQUFDLENBQUUsQ0FBQztRQUN6RVEsb0JBQW9CLENBQUNoSCxJQUFJLENBQUUsSUFBSSxDQUFDMkcsc0NBQXNDLENBQUMsQ0FBRSxDQUFDO1FBQzFFSyxvQkFBb0IsQ0FBQ2hILElBQUksQ0FBRSxJQUFJLENBQUN5RyxtQ0FBbUMsQ0FBQyxDQUFFLENBQUM7UUFDdkU7TUFFRixLQUFLLENBQUM7UUFDSk8sb0JBQW9CLENBQUNoSCxJQUFJLENBQUUsSUFBSSxDQUFDNEcsb0NBQW9DLENBQUMsQ0FBRSxDQUFDO1FBQ3hFSSxvQkFBb0IsQ0FBQ2hILElBQUksQ0FBRSxJQUFJLENBQUNxRyw2QkFBNkIsQ0FBQyxDQUFFLENBQUM7UUFDakVXLG9CQUFvQixDQUFDaEgsSUFBSSxDQUFFLElBQUksQ0FBQ3lHLG1DQUFtQyxDQUFDLENBQUUsQ0FBQztRQUN2RU8sb0JBQW9CLENBQUNoSCxJQUFJLENBQUUsSUFBSSxDQUFDNEcsb0NBQW9DLENBQUMsQ0FBRSxDQUFDO1FBQ3hFSSxvQkFBb0IsQ0FBQ2hILElBQUksQ0FBRSxJQUFJLENBQUN5RyxtQ0FBbUMsQ0FBQyxDQUFFLENBQUM7UUFDdkVPLG9CQUFvQixDQUFDaEgsSUFBSSxDQUFFLElBQUksQ0FBQ3NHLGlDQUFpQyxDQUFDLENBQUUsQ0FBQztRQUNyRTtNQUVGLEtBQUssQ0FBQztRQUNKVSxvQkFBb0IsQ0FBQ2hILElBQUksQ0FBRSxJQUFJLENBQUNzRyxpQ0FBaUMsQ0FBQyxDQUFFLENBQUM7UUFDckVVLG9CQUFvQixDQUFDaEgsSUFBSSxDQUFFLElBQUksQ0FBQ3lHLG1DQUFtQyxDQUFDLENBQUUsQ0FBQztRQUN2RU8sb0JBQW9CLENBQUNoSCxJQUFJLENBQUUsSUFBSSxDQUFDNkcsd0NBQXdDLENBQUMsQ0FBRSxDQUFDO1FBQzVFRyxvQkFBb0IsQ0FBQ2hILElBQUksQ0FBRSxJQUFJLENBQUNzRyxpQ0FBaUMsQ0FBQyxDQUFFLENBQUM7UUFDckVVLG9CQUFvQixDQUFDaEgsSUFBSSxDQUFFLElBQUksQ0FBQzZHLHdDQUF3QyxDQUFDLENBQUUsQ0FBQztRQUM1RUcsb0JBQW9CLENBQUNoSCxJQUFJLENBQUUsSUFBSSxDQUFDMEcsdUNBQXVDLENBQUMsQ0FBRSxDQUFDO1FBQzNFO01BRUYsS0FBSyxDQUFDO1FBQ0pNLG9CQUFvQixDQUFDaEgsSUFBSSxDQUFFLElBQUksQ0FBQzhHLHdDQUF3QyxDQUFDLENBQUUsQ0FBQztRQUM1RUUsb0JBQW9CLENBQUNoSCxJQUFJLENBQUUsSUFBSSxDQUFDdUcsaUNBQWlDLENBQUMsQ0FBRSxDQUFDO1FBQ3JFUyxvQkFBb0IsQ0FBQ2hILElBQUksQ0FBRSxJQUFJLENBQUMwRyx1Q0FBdUMsQ0FBQyxDQUFFLENBQUM7UUFDM0VNLG9CQUFvQixDQUFDaEgsSUFBSSxDQUFFLElBQUksQ0FBQzhHLHdDQUF3QyxDQUFDLENBQUUsQ0FBQztRQUM1RUUsb0JBQW9CLENBQUNoSCxJQUFJLENBQUUsSUFBSSxDQUFDMEcsdUNBQXVDLENBQUMsQ0FBRSxDQUFDO1FBQzNFTSxvQkFBb0IsQ0FBQ2hILElBQUksQ0FBRSxJQUFJLENBQUN1RyxpQ0FBaUMsQ0FBQyxDQUFFLENBQUM7UUFDckU7TUFFRjtRQUNFLE1BQU0sSUFBSVUsS0FBSyxDQUFHLHFEQUFvRGhCLEtBQU0sRUFBRSxDQUFDO0lBQ25GO0lBQ0EsT0FBT2Usb0JBQW9CO0VBQzdCO0FBQ0YsQ0FBQztBQUVEeEwsWUFBWSxDQUFDMEwsUUFBUSxDQUFFLDZCQUE2QixFQUFFaEosMkJBQTRCLENBQUM7QUFFbkYsZUFBZUEsMkJBQTJCIn0=