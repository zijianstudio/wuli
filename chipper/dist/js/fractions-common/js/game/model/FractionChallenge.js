// Copyright 2018-2021, University of Colorado Boulder

/**
 * The state of a single (potentially in-progress) challenge for a level.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import { ColorDef } from '../../../../scenery/js/imports.js';
import BuildingModel from '../../building/model/BuildingModel.js';
import BuildingRepresentation from '../../building/model/BuildingRepresentation.js';
import Group from '../../building/model/Group.js';
import NumberGroup from '../../building/model/NumberGroup.js';
import NumberGroupStack from '../../building/model/NumberGroupStack.js';
import NumberPiece from '../../building/model/NumberPiece.js';
import NumberStack from '../../building/model/NumberStack.js';
import ShapeGroup from '../../building/model/ShapeGroup.js';
import ShapeGroupStack from '../../building/model/ShapeGroupStack.js';
import ShapePiece from '../../building/model/ShapePiece.js';
import ShapeStack from '../../building/model/ShapeStack.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import PrimeFactorization from '../../common/model/PrimeFactorization.js';
import fractionsCommon from '../../fractionsCommon.js';
import ChallengeType from './ChallengeType.js';
import CollectionFinder from './CollectionFinder.js';
import ShapeTarget from './ShapeTarget.js';
import Target from './Target.js';
import UnitCollection from './UnitCollection.js';

// global
let isDoingResetGeneration = false; // We need different behavior when generating levels from a reset, tracked with this flag

// {Array.<ChallengeType>} - When resetting levels, this will hold the challenge types for the first 4.
let resetTypes = [];
class FractionChallenge extends BuildingModel {
  /**
   * @param {number} levelNumber
   * @param {ChallengeType} challengeType
   * @param {boolean} hasMixedTargets
   * @param {Array.<Target>} targets
   * @param {Array.<ShapePiece>} shapePieces
   * @param {Array.<NumberPiece>} numberPieces
   */
  constructor(levelNumber, challengeType, hasMixedTargets, targets, shapePieces, numberPieces) {
    assert && assert(typeof levelNumber === 'number');
    assert && assert(ChallengeType.VALUES.includes(challengeType));
    assert && assert(typeof hasMixedTargets === 'boolean');
    assert && assert(Array.isArray(targets));
    assert && assert(Array.isArray(shapePieces));
    assert && assert(Array.isArray(numberPieces));
    assert && targets.forEach(target => assert(target instanceof Target));
    assert && shapePieces.forEach(shapePiece => assert(shapePiece instanceof ShapePiece));
    assert && numberPieces.forEach(numberPiece => assert(numberPiece instanceof NumberPiece));
    super();
    const hasPies = _.some(shapePieces, piece => piece.representation === BuildingRepresentation.PIE);
    const hasBars = _.some(shapePieces, piece => piece.representation === BuildingRepresentation.BAR);
    const hasNumbers = !!numberPieces.length;
    assert && assert(hasPies + hasBars + hasNumbers === 1, 'We only support one for now');

    // @public {number}
    this.levelNumber = levelNumber;

    // @public {ChallengeType}
    this.challengeType = challengeType;

    // @public {Array.<Target>}
    this.targets = targets;

    // @public {boolean}
    this.hasMixedTargets = hasMixedTargets;

    // @public {boolean}
    this.hasShapes = hasBars || hasPies;

    // @public {BuildingRepresentation|null}
    this.representation = hasPies ? BuildingRepresentation.PIE : hasBars ? BuildingRepresentation.BAR : null;

    // @public {number}
    this.maxTargetWholes = Math.ceil(Math.max(...targets.map(target => target.fraction.value)));

    // @public {number}
    this.maxNumber = Math.max(...numberPieces.map(numberPiece => numberPiece.number));

    // @public {Property.<number>}
    this.scoreProperty = new DerivedProperty(targets.map(target => target.groupProperty), (...groups) => {
      return groups.filter(group => group !== null).length;
    });

    // @public {FractionChallenge} - Set externally if, when going from this challenge to the specified one, there
    // should instead be a "refresh" animation instead of "next" challenge.
    this.refreshedChallenge = null;

    // Sort out inputs (with a new copy, so we don't modify our actual parameter reference) so we create the stacks in
    // increasing order
    shapePieces = shapePieces.slice().sort((a, b) => {
      // NOTE: This seems backwards, but we want the BIGGEST fraction at the start (since it has the smallest
      // denominator)
      if (a.fraction.isLessThan(b.fraction)) {
        return 1;
      } else if (a.fraction.equals(b.fraction)) {
        return 0;
      } else {
        return -1;
      }
    });
    numberPieces = numberPieces.slice().sort((a, b) => {
      if (a.number < b.number) {
        return -1;
      } else if (a.number === b.number) {
        return 0;
      } else {
        return 1;
      }
    });
    if (hasPies) {
      this.shapeGroupStacks.push(new ShapeGroupStack(targets.length, BuildingRepresentation.PIE, this.maxTargetWholes > 1));
    }
    if (hasBars) {
      this.shapeGroupStacks.push(new ShapeGroupStack(targets.length, BuildingRepresentation.BAR, this.maxTargetWholes > 1));
    }
    if (hasNumbers) {
      this.numberGroupStacks.push(new NumberGroupStack(targets.length, this.hasMixedTargets));
    }

    // Create ShapeStacks for a given type of ShapePiece (if one doesn't exist), and add the piece to it.
    shapePieces.forEach(shapePiece => {
      let shapeStack = this.findMatchingShapeStack(shapePiece);
      if (!shapeStack) {
        const quantity = shapePieces.filter(otherPiece => otherPiece.fraction.equals(shapePiece.fraction)).length;
        shapeStack = new ShapeStack(shapePiece.fraction, quantity, shapePiece.representation, shapePiece.color);
        this.shapeStacks.push(shapeStack);
      }
      shapeStack.shapePieces.push(shapePiece);
    });

    // Create NumberStacks for a given type of NumberPiece (if one doesn't exist), and add the piece to it.
    numberPieces.forEach(numberPiece => {
      let numberStack = this.findMatchingNumberStack(numberPiece);
      if (!numberStack) {
        const quantity = numberPieces.filter(otherPiece => otherPiece.number === numberPiece.number).length;
        numberStack = new NumberStack(numberPiece.number, quantity);
        this.numberStacks.push(numberStack);
      }
      numberStack.numberPieces.push(numberPiece);
    });

    // Add in enough ShapeGroups in the stack to solve for all targets
    if (shapePieces.length) {
      this.shapeGroupStacks.forEach(shapeGroupStack => {
        _.times(targets.length - 1, () => {
          const shapeGroup = new ShapeGroup(shapeGroupStack.representation, {
            returnPieceListener: () => {
              this.removeLastPieceFromShapeGroup(shapeGroup);
            },
            maxContainers: this.maxTargetWholes
          });
          shapeGroupStack.shapeGroups.push(shapeGroup);
        });
      });
    }
    // Add in enough NumberGroups in the stack to solve for all targets
    if (numberPieces.length) {
      this.numberGroupStacks.forEach(numberGroupStack => {
        _.times(targets.length - 1, () => {
          numberGroupStack.numberGroups.push(new NumberGroup(numberGroupStack.isMixedNumber, {
            activeNumberRangeProperty: this.activeNumberRangeProperty
          }));
        });
      });
    }

    // Most of our creation logic is in reset(), so this initializes some state
    this.reset();

    // We'll add in any relevant "initial" groups, so that there is one out in the play area.
    const initialGroups = [];
    let lastInitialGroup = null;
    if (hasPies) {
      lastInitialGroup = this.addShapeGroup(BuildingRepresentation.PIE, this.maxTargetWholes);
      initialGroups.push(lastInitialGroup);
    }
    if (hasBars) {
      lastInitialGroup = this.addShapeGroup(BuildingRepresentation.BAR, this.maxTargetWholes);
      initialGroups.push(lastInitialGroup);
    }
    if (hasNumbers) {
      lastInitialGroup = this.addNumberGroup(this.hasMixedTargets);
      initialGroups.push(lastInitialGroup);
    }
    if (lastInitialGroup) {
      this.selectedGroupProperty.value = lastInitialGroup;
    }

    // Lay out initial groups
    const halfSpace = 170;
    initialGroups.forEach((group, index) => {
      group.positionProperty.value = new Vector2(halfSpace * (2 * index - initialGroups.length + 1), 0);
    });
  }

  /**
   * Finds the closest Target to a list of given model positions.
   * @public
   *
   * @param {Array.<Vector2>} positions
   * @returns {Target}
   */
  findClosestTarget(positions) {
    let bestTarget = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    positions.forEach(position => {
      this.targets.forEach(target => {
        const distance = target.positionProperty.value.distance(position);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestTarget = target;
        }
      });
    });
    assert && assert(bestTarget);
    return bestTarget;
  }

  /**
   * If nothing is selected, try to select the most-previously-selected group.
   * @public
   */
  selectPreviouslySelectedGroup() {
    if (this.selectedGroupProperty.value) {
      return;
    }
    const previousGroup = this.previouslySelectedGroupProperty.value;
    if (previousGroup && (this.shapeGroups.includes(previousGroup) || this.numberGroups.includes(previousGroup))) {
      this.selectedGroupProperty.value = this.previouslySelectedGroupProperty.value;
    } else {
      const firstGroup = this.shapeGroups.length > 0 ? this.shapeGroups.get(0) : this.numberGroups.length > 0 ? this.numberGroups.get(0) : null;

      // If there is no previously-selected group, we'll just select the first one.
      // See https://github.com/phetsims/fractions-common/issues/43#issuecomment-454149966
      if (firstGroup) {
        this.selectedGroupProperty.value = firstGroup;
      }
    }
  }

  /**
   * Handles moving a Group into the collection area (Target).
   * @public
   *
   * @param {Group} group
   * @param {Target} target
   * @param {ObservableArrayDef.<Group>} groupArray
   * @param {number} scale
   */
  collectGroup(group, target, groupArray, scale) {
    assert && assert(group instanceof Group);
    assert && assert(target.groupProperty.value === null);

    // Setting this should result in a side-effect of updating our target's positionProperty to the correct position.
    target.groupProperty.value = group;

    // Try to start moving out another group
    this.ensureGroups(group.type);
    const positionProperty = target.positionProperty;
    group.animator.animateTo({
      position: positionProperty.value,
      scale: scale,
      animationInvalidationProperty: positionProperty,
      endAnimationCallback: () => {
        groupArray.remove(group);
      }
    });
  }

  /**
   * Handles moving a ShapeGroup into the collection area (Target).
   * @public
   *
   * @param {ShapeGroup} shapeGroup
   * @param {Target} target
   */
  collectShapeGroup(shapeGroup, target) {
    shapeGroup.partitionDenominatorProperty.value = target.fraction.denominator;
    this.collectGroup(shapeGroup, target, this.shapeGroups, FractionsCommonConstants.SHAPE_COLLECTION_SCALE);
  }

  /**
   * Handles moving a NumberGroup into the collection area (Target).
   * @public
   *
   * @param {NumberGroup} numberGroup
   * @param {Target} target
   */
  collectNumberGroup(numberGroup, target) {
    this.collectGroup(numberGroup, target, this.numberGroups, FractionsCommonConstants.NUMBER_COLLECTION_SCALE);
  }

  /**
   * Moves a group to the center of the play area.
   * @public
   *
   * @param {Group} group
   */
  centerGroup(group) {
    assert && assert(group instanceof Group);
    group.animator.animateTo({
      position: Vector2.ZERO,
      scale: 1,
      velocity: 60
    });
  }

  /**
   * If there are no groups, it moves one out to the center of the play area.
   * @private
   *
   * @param {BuildingType} type
   */
  ensureGroups(type) {
    const groupArray = this.groupsMap.get(type);
    const stackArray = this.groupStacksMap.get(type);

    // If we already have one out, don't look for more
    if (groupArray.length >= 2) {
      return;
    }
    for (let i = 0; i < stackArray.length; i++) {
      const groupStack = stackArray[i];
      if (!groupStack.isEmpty()) {
        const group = groupStack.array.pop();
        group.clear();
        group.positionProperty.value = groupStack.positionProperty.value;
        groupArray.push(group);
        this.centerGroup(group);
        this.selectedGroupProperty.value = group;
        break;
      }
    }
  }

  /**
   * Grabs a ShapePiece from the stack, sets up state for it to be dragged/placed, and places it at the
   * given point.
   * @public
   *
   * @param {ShapeStack} stack
   * @param {Vector2} modelPoint
   * @returns {ShapePiece}
   */
  pullShapePieceFromStack(stack, modelPoint) {
    const shapePiece = stack.shapePieces.pop();
    shapePiece.clear();
    shapePiece.positionProperty.value = modelPoint;
    this.dragShapePieceFromStack(shapePiece);
    return shapePiece;
  }

  /**
   * Grabs a NumberPiece from the stack, sets up state for it to be dragged/placed, and places it at the
   * given point.
   * @public
   *
   * @param {NumberStack} stack
   * @param {Vector2} modelPoint
   * @returns {NumberPiece}
   */
  pullNumberPieceFromStack(stack, modelPoint) {
    const numberPiece = stack.numberPieces.pop();
    numberPiece.clear();
    numberPiece.positionProperty.value = modelPoint;
    this.dragNumberPieceFromStack(numberPiece);
    return numberPiece;
  }

  /**
   * Grabs a Group from the stack, sets up state for it to be dragged/placed, and places it at the
   * given point.
   * @public
   *
   * @param {ShapeGroupStack|NumberGroupStack} stack
   * @param {Vector2} modelPoint
   * @returns {ShapeGroup}
   */
  pullGroupFromStack(stack, modelPoint) {
    const group = stack.array.pop();
    group.clear();
    group.positionProperty.value = modelPoint;
    this.dragGroupFromStack(group);
    return group;
  }

  /**
   * Returns the contents of a target to the collection panels.
   * @public
   *
   * @param {Target} target
   */
  returnTarget(target) {
    const group = target.groupProperty.value;
    if (group) {
      // If the group hasn't fully completed its animation, then force it to complete early.
      group.animator.endAnimation();
      target.groupProperty.value = null;
      if (this.hasShapes) {
        this.shapeGroups.push(group);
        this.returnShapeGroup(group);
      } else {
        this.numberGroups.push(group);
        this.returnNumberGroup(group);
      }
    }
  }

  /**
   * Does a semi-reset of the challenge state, and constructs a solution (without putting things in targets).
   * @public
   *
   * NOTE: This is generally only available for when ?showAnswers is provided.
   */
  cheat() {
    // First we do a lot of work to stop what's happening and do a "soft" reset
    this.endAnimation();
    this.targets.forEach(target => this.returnTarget(target));
    this.endAnimation();
    this.shapeGroups.forEach(shapeGroup => this.returnShapeGroup(shapeGroup));
    this.numberGroups.forEach(numberGroup => this.returnNumberGroup(numberGroup));
    this.endAnimation();
    const groupStack = this.hasShapes ? this.shapeGroupStacks[0] : this.numberGroupStacks[0];
    const numGroups = groupStack.array.length;
    const groups = _.range(0, numGroups).map(index => {
      const point = new Vector2(this.hasShapes ? -100 : 0, (index - (numGroups - 1) / 2) * 100);
      return this.pullGroupFromStack(groupStack, point);
    });
    this.endAnimation();
    if (this.hasShapes) {
      let maxQuantity = 0;
      const availableCollection = UnitCollection.fractionsToCollection(this.shapeStacks.map(shapeStack => {
        maxQuantity = Math.max(maxQuantity, shapeStack.array.length);
        return new Fraction(shapeStack.array.length, shapeStack.fraction.denominator);
      }));
      const denominators = availableCollection.nonzeroDenominators;
      const fractions = this.targets.map(target => target.fraction);

      // Only search over the given denominators
      const collectionFinder = new CollectionFinder({
        denominators: denominators.map(PrimeFactorization.factor)
      });
      const solution = FractionChallenge.findShapeSolution(fractions, collectionFinder, maxQuantity, availableCollection);
      solution.forEach((groupCollections, groupIndex) => {
        // Add containers where needed
        const group = groups[groupIndex];
        while (group.shapeContainers.length < groupCollections.length) {
          group.increaseContainerCount();
        }

        // Move the pieces to the containers
        groupCollections.forEach((collection, containerIndex) => {
          collection.unitFractions.forEach(fraction => {
            const stack = _.find(this.shapeStacks, stack => stack.fraction.equals(fraction));
            const piece = this.pullShapePieceFromStack(stack, Vector2.ZERO);
            this.placeActiveShapePiece(piece, group.shapeContainers.get(containerIndex), group);
          });
        });
      });
    } else {
      const pullNumberPiece = (number, spot) => {
        const stack = _.find(this.numberStacks, stack => stack.number === number);
        const piece = this.pullNumberPieceFromStack(stack, Vector2.ZERO);
        this.draggedNumberPieces.remove(piece);
        this.placeNumberPiece(spot, piece);
      };
      const availableQuantities = {};
      const numbers = this.numberStacks.map(numberStack => {
        availableQuantities[numberStack.number] = numberStack.array.length;
        return numberStack.number;
      });
      const fractions = [];

      // if we have mixed numbers, their "whole" parts are exactly computable
      groups.forEach((group, index) => {
        let fraction = this.targets[index].fraction;
        if (group.isMixedNumber) {
          const whole = Math.floor(fraction.value);
          pullNumberPiece(whole, group.wholeSpot);
          availableQuantities[whole]--;
          fraction = fraction.minusInteger(whole);
        }
        fractions.push(fraction.reduced());
      });
      const solution = FractionChallenge.findNumberSolution(fractions, Math.max(...numbers), availableQuantities);
      groups.forEach((group, index) => {
        pullNumberPiece(solution[index] * fractions[index].numerator, group.numeratorSpot);
        pullNumberPiece(solution[index] * fractions[index].denominator, group.denominatorSpot);
      });
    }
    this.endAnimation();
  }

  /**
   * Returns a solution to shape challenges.
   * @private
   *
   * @param {Array.<Fraction>} fractions - The target fractions to fill
   * @param {CollectionFinder} collectionFinder
   * @param {number} maxQuantity - No solution which takes more than this much of one piece type would be correct.
   * @param {UnitCollection} availableCollection - Represents the pieces we have available
   * @returns {Array.<Array.<UnitCollection>>} - For each group, for each container, a unit collection of the
   *                                             fractions to be placed inside.
   */
  static findShapeSolution(fractions, collectionFinder, maxQuantity, availableCollection) {
    // {Array.<Array.<Object>>} - Each object is { {Array.<UnitCollection>} containers, {UnitCollection} total }
    const fractionPossibilities = fractions.map(fraction => {
      const collections = collectionFinder.search(fraction, {
        maxQuantity: maxQuantity
      });

      // {Array.<Array.<Array.<Fraction>>>}
      const compactGroups = collections.map(collection => collection.getCompactRequiredGroups(Math.ceil(fraction.value))).filter(_.identity);
      return compactGroups.map(compactGroup => {
        const containers = compactGroup.map(UnitCollection.fractionsToCollection);
        return {
          containers: containers,
          total: _.reduce(containers, (a, b) => a.plus(b), new UnitCollection([]))
        };
      });
    });
    let currentCollection = availableCollection;
    function findSolution(i) {
      // eslint-disable-line consistent-return
      if (i === fractions.length) {
        return [];
      }
      const possibilities = fractionPossibilities[i];
      for (let j = 0; j < possibilities.length; j++) {
        const possibility = possibilities[j];
        if (currentCollection.includes(possibility.total)) {
          currentCollection = currentCollection.minus(possibility.total);
          const subsolution = findSolution(i + 1);
          currentCollection = currentCollection.plus(possibility.total);
          if (subsolution) {
            return [possibility.containers, ...subsolution];
          }
        }
      }
    }
    return findSolution(0);
  }

  /**
   * Returns an array of solutions (multipliers for each fraction such that numerator*n and denominator*n are in
   * availableQuantities).
   * @private
   *
   * @param {Array.<Fraction>} fractions
   * @param {number} maxNumber
   * @param {Object} availableQuantities - Map from number => quantity available.
   * @returns {Array.<number>} - multipliers
   */
  static findNumberSolution(fractions, maxNumber, availableQuantities) {
    if (fractions.length === 0) {
      return [];
    }
    const fraction = fractions[0];
    const maxSolution = Math.floor(maxNumber / fraction.denominator);
    for (let i = 1; i <= maxSolution; i++) {
      const numerator = i * fraction.numerator;
      const denominator = i * fraction.denominator;
      if (availableQuantities[numerator] && availableQuantities[denominator] && (numerator !== denominator || availableQuantities[numerator] > 1)) {
        availableQuantities[numerator]--;
        availableQuantities[denominator]--;
        const subsolution = FractionChallenge.findNumberSolution(fractions.slice(1), maxNumber, availableQuantities);
        availableQuantities[numerator]++;
        availableQuantities[denominator]++;
        if (subsolution) {
          return [i, ...subsolution];
        }
      }
    }
    return null;
  }

  /**
   * There is a desired "pseudorandom" generation for the first 4 shape levels, which should have a "nice" mix of
   * pie and bar. This should change on every "initial" or "reset" generation (where all 4 are generated), but
   * if only one is generated then it should be random.
   * @public
   *
   * Call this before generation when it's initial/reset.
   */
  static beginFullGeneration() {
    isDoingResetGeneration = true;
    resetTypes = [...dotRandom.shuffle([ChallengeType.PIE, ChallengeType.BAR]), ...dotRandom.shuffle([ChallengeType.PIE, ChallengeType.BAR])];
  }

  /**
   * Call this after generation when it's initial/reset, see beginFullGeneration()
   * @public
   */
  static endFullGeneration() {
    isDoingResetGeneration = false;
  }

  /**
   * Creates a FractionChallenge for a "Shape" level.
   * @public
   *
   * @param {number} levelNumber
   * @param {boolean} hasMixedTargets
   * @param {ColorDef} color
   * @param {Array.<Fraction>} targetFractions
   * @param {Array.<Fraction>} pieceFractions
   * @returns {FractionChallenge}
   */
  static createShapeChallenge(levelNumber, hasMixedTargets, color, targetFractions, pieceFractions) {
    assert && assert(typeof levelNumber === 'number');
    assert && assert(typeof hasMixedTargets === 'boolean');
    assert && assert(ColorDef.isColorDef(color));
    assert && assert(Array.isArray(targetFractions));
    assert && targetFractions.forEach(fraction => assert(fraction instanceof Fraction));
    assert && assert(Array.isArray(pieceFractions));
    assert && pieceFractions.forEach(fraction => assert(fraction instanceof Fraction));

    // Pseudorandom start for the first 4 levels
    const type = levelNumber >= 1 && levelNumber <= 4 && isDoingResetGeneration ? resetTypes[levelNumber - 1] : dotRandom.nextBoolean() ? ChallengeType.PIE : ChallengeType.BAR;
    const representation = type === ChallengeType.PIE ? BuildingRepresentation.PIE : BuildingRepresentation.BAR;
    const targets = targetFractions.map(f => new Target(f));
    const shapePieces = pieceFractions.map(f => new ShapePiece(f, representation, color));
    return new FractionChallenge(levelNumber, type, hasMixedTargets, targets, shapePieces, []);
  }

  /**
   * Creates a FractionChallenge for a "Number" level.
   * @public
   *
   * @param {number} levelNumber
   * @param {boolean} hasMixedTargets
   * @param {Array.<ShapeTarget>} shapeTargets
   * @param {Array.<number>} pieceNumbers
   */
  static createNumberChallenge(levelNumber, hasMixedTargets, shapeTargets, pieceNumbers) {
    assert && assert(typeof levelNumber === 'number');
    assert && assert(typeof hasMixedTargets === 'boolean');
    assert && assert(Array.isArray(shapeTargets));
    assert && shapeTargets.forEach(shapeTarget => assert(shapeTarget instanceof ShapeTarget));
    assert && assert(Array.isArray(pieceNumbers));
    assert && pieceNumbers.forEach(pieceNumber => assert(typeof pieceNumber === 'number'));
    return new FractionChallenge(levelNumber, ChallengeType.NUMBER, hasMixedTargets, shapeTargets, [], pieceNumbers.map(number => {
      return new NumberPiece(number);
    }));
  }
}
fractionsCommon.register('FractionChallenge', FractionChallenge);
export default FractionChallenge;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJkb3RSYW5kb20iLCJWZWN0b3IyIiwiRnJhY3Rpb24iLCJDb2xvckRlZiIsIkJ1aWxkaW5nTW9kZWwiLCJCdWlsZGluZ1JlcHJlc2VudGF0aW9uIiwiR3JvdXAiLCJOdW1iZXJHcm91cCIsIk51bWJlckdyb3VwU3RhY2siLCJOdW1iZXJQaWVjZSIsIk51bWJlclN0YWNrIiwiU2hhcGVHcm91cCIsIlNoYXBlR3JvdXBTdGFjayIsIlNoYXBlUGllY2UiLCJTaGFwZVN0YWNrIiwiRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzIiwiUHJpbWVGYWN0b3JpemF0aW9uIiwiZnJhY3Rpb25zQ29tbW9uIiwiQ2hhbGxlbmdlVHlwZSIsIkNvbGxlY3Rpb25GaW5kZXIiLCJTaGFwZVRhcmdldCIsIlRhcmdldCIsIlVuaXRDb2xsZWN0aW9uIiwiaXNEb2luZ1Jlc2V0R2VuZXJhdGlvbiIsInJlc2V0VHlwZXMiLCJGcmFjdGlvbkNoYWxsZW5nZSIsImNvbnN0cnVjdG9yIiwibGV2ZWxOdW1iZXIiLCJjaGFsbGVuZ2VUeXBlIiwiaGFzTWl4ZWRUYXJnZXRzIiwidGFyZ2V0cyIsInNoYXBlUGllY2VzIiwibnVtYmVyUGllY2VzIiwiYXNzZXJ0IiwiVkFMVUVTIiwiaW5jbHVkZXMiLCJBcnJheSIsImlzQXJyYXkiLCJmb3JFYWNoIiwidGFyZ2V0Iiwic2hhcGVQaWVjZSIsIm51bWJlclBpZWNlIiwiaGFzUGllcyIsIl8iLCJzb21lIiwicGllY2UiLCJyZXByZXNlbnRhdGlvbiIsIlBJRSIsImhhc0JhcnMiLCJCQVIiLCJoYXNOdW1iZXJzIiwibGVuZ3RoIiwiaGFzU2hhcGVzIiwibWF4VGFyZ2V0V2hvbGVzIiwiTWF0aCIsImNlaWwiLCJtYXgiLCJtYXAiLCJmcmFjdGlvbiIsInZhbHVlIiwibWF4TnVtYmVyIiwibnVtYmVyIiwic2NvcmVQcm9wZXJ0eSIsImdyb3VwUHJvcGVydHkiLCJncm91cHMiLCJmaWx0ZXIiLCJncm91cCIsInJlZnJlc2hlZENoYWxsZW5nZSIsInNsaWNlIiwic29ydCIsImEiLCJiIiwiaXNMZXNzVGhhbiIsImVxdWFscyIsInNoYXBlR3JvdXBTdGFja3MiLCJwdXNoIiwibnVtYmVyR3JvdXBTdGFja3MiLCJzaGFwZVN0YWNrIiwiZmluZE1hdGNoaW5nU2hhcGVTdGFjayIsInF1YW50aXR5Iiwib3RoZXJQaWVjZSIsImNvbG9yIiwic2hhcGVTdGFja3MiLCJudW1iZXJTdGFjayIsImZpbmRNYXRjaGluZ051bWJlclN0YWNrIiwibnVtYmVyU3RhY2tzIiwic2hhcGVHcm91cFN0YWNrIiwidGltZXMiLCJzaGFwZUdyb3VwIiwicmV0dXJuUGllY2VMaXN0ZW5lciIsInJlbW92ZUxhc3RQaWVjZUZyb21TaGFwZUdyb3VwIiwibWF4Q29udGFpbmVycyIsInNoYXBlR3JvdXBzIiwibnVtYmVyR3JvdXBTdGFjayIsIm51bWJlckdyb3VwcyIsImlzTWl4ZWROdW1iZXIiLCJhY3RpdmVOdW1iZXJSYW5nZVByb3BlcnR5IiwicmVzZXQiLCJpbml0aWFsR3JvdXBzIiwibGFzdEluaXRpYWxHcm91cCIsImFkZFNoYXBlR3JvdXAiLCJhZGROdW1iZXJHcm91cCIsInNlbGVjdGVkR3JvdXBQcm9wZXJ0eSIsImhhbGZTcGFjZSIsImluZGV4IiwicG9zaXRpb25Qcm9wZXJ0eSIsImZpbmRDbG9zZXN0VGFyZ2V0IiwicG9zaXRpb25zIiwiYmVzdFRhcmdldCIsImJlc3REaXN0YW5jZSIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwicG9zaXRpb24iLCJkaXN0YW5jZSIsInNlbGVjdFByZXZpb3VzbHlTZWxlY3RlZEdyb3VwIiwicHJldmlvdXNHcm91cCIsInByZXZpb3VzbHlTZWxlY3RlZEdyb3VwUHJvcGVydHkiLCJmaXJzdEdyb3VwIiwiZ2V0IiwiY29sbGVjdEdyb3VwIiwiZ3JvdXBBcnJheSIsInNjYWxlIiwiZW5zdXJlR3JvdXBzIiwidHlwZSIsImFuaW1hdG9yIiwiYW5pbWF0ZVRvIiwiYW5pbWF0aW9uSW52YWxpZGF0aW9uUHJvcGVydHkiLCJlbmRBbmltYXRpb25DYWxsYmFjayIsInJlbW92ZSIsImNvbGxlY3RTaGFwZUdyb3VwIiwicGFydGl0aW9uRGVub21pbmF0b3JQcm9wZXJ0eSIsImRlbm9taW5hdG9yIiwiU0hBUEVfQ09MTEVDVElPTl9TQ0FMRSIsImNvbGxlY3ROdW1iZXJHcm91cCIsIm51bWJlckdyb3VwIiwiTlVNQkVSX0NPTExFQ1RJT05fU0NBTEUiLCJjZW50ZXJHcm91cCIsIlpFUk8iLCJ2ZWxvY2l0eSIsImdyb3Vwc01hcCIsInN0YWNrQXJyYXkiLCJncm91cFN0YWNrc01hcCIsImkiLCJncm91cFN0YWNrIiwiaXNFbXB0eSIsImFycmF5IiwicG9wIiwiY2xlYXIiLCJwdWxsU2hhcGVQaWVjZUZyb21TdGFjayIsInN0YWNrIiwibW9kZWxQb2ludCIsImRyYWdTaGFwZVBpZWNlRnJvbVN0YWNrIiwicHVsbE51bWJlclBpZWNlRnJvbVN0YWNrIiwiZHJhZ051bWJlclBpZWNlRnJvbVN0YWNrIiwicHVsbEdyb3VwRnJvbVN0YWNrIiwiZHJhZ0dyb3VwRnJvbVN0YWNrIiwicmV0dXJuVGFyZ2V0IiwiZW5kQW5pbWF0aW9uIiwicmV0dXJuU2hhcGVHcm91cCIsInJldHVybk51bWJlckdyb3VwIiwiY2hlYXQiLCJudW1Hcm91cHMiLCJyYW5nZSIsInBvaW50IiwibWF4UXVhbnRpdHkiLCJhdmFpbGFibGVDb2xsZWN0aW9uIiwiZnJhY3Rpb25zVG9Db2xsZWN0aW9uIiwiZGVub21pbmF0b3JzIiwibm9uemVyb0Rlbm9taW5hdG9ycyIsImZyYWN0aW9ucyIsImNvbGxlY3Rpb25GaW5kZXIiLCJmYWN0b3IiLCJzb2x1dGlvbiIsImZpbmRTaGFwZVNvbHV0aW9uIiwiZ3JvdXBDb2xsZWN0aW9ucyIsImdyb3VwSW5kZXgiLCJzaGFwZUNvbnRhaW5lcnMiLCJpbmNyZWFzZUNvbnRhaW5lckNvdW50IiwiY29sbGVjdGlvbiIsImNvbnRhaW5lckluZGV4IiwidW5pdEZyYWN0aW9ucyIsImZpbmQiLCJwbGFjZUFjdGl2ZVNoYXBlUGllY2UiLCJwdWxsTnVtYmVyUGllY2UiLCJzcG90IiwiZHJhZ2dlZE51bWJlclBpZWNlcyIsInBsYWNlTnVtYmVyUGllY2UiLCJhdmFpbGFibGVRdWFudGl0aWVzIiwibnVtYmVycyIsIndob2xlIiwiZmxvb3IiLCJ3aG9sZVNwb3QiLCJtaW51c0ludGVnZXIiLCJyZWR1Y2VkIiwiZmluZE51bWJlclNvbHV0aW9uIiwibnVtZXJhdG9yIiwibnVtZXJhdG9yU3BvdCIsImRlbm9taW5hdG9yU3BvdCIsImZyYWN0aW9uUG9zc2liaWxpdGllcyIsImNvbGxlY3Rpb25zIiwic2VhcmNoIiwiY29tcGFjdEdyb3VwcyIsImdldENvbXBhY3RSZXF1aXJlZEdyb3VwcyIsImlkZW50aXR5IiwiY29tcGFjdEdyb3VwIiwiY29udGFpbmVycyIsInRvdGFsIiwicmVkdWNlIiwicGx1cyIsImN1cnJlbnRDb2xsZWN0aW9uIiwiZmluZFNvbHV0aW9uIiwicG9zc2liaWxpdGllcyIsImoiLCJwb3NzaWJpbGl0eSIsIm1pbnVzIiwic3Vic29sdXRpb24iLCJtYXhTb2x1dGlvbiIsImJlZ2luRnVsbEdlbmVyYXRpb24iLCJzaHVmZmxlIiwiZW5kRnVsbEdlbmVyYXRpb24iLCJjcmVhdGVTaGFwZUNoYWxsZW5nZSIsInRhcmdldEZyYWN0aW9ucyIsInBpZWNlRnJhY3Rpb25zIiwiaXNDb2xvckRlZiIsIm5leHRCb29sZWFuIiwiZiIsImNyZWF0ZU51bWJlckNoYWxsZW5nZSIsInNoYXBlVGFyZ2V0cyIsInBpZWNlTnVtYmVycyIsInNoYXBlVGFyZ2V0IiwicGllY2VOdW1iZXIiLCJOVU1CRVIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkZyYWN0aW9uQ2hhbGxlbmdlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBzdGF0ZSBvZiBhIHNpbmdsZSAocG90ZW50aWFsbHkgaW4tcHJvZ3Jlc3MpIGNoYWxsZW5nZSBmb3IgYSBsZXZlbC5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBGcmFjdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL21vZGVsL0ZyYWN0aW9uLmpzJztcclxuaW1wb3J0IHsgQ29sb3JEZWYgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQnVpbGRpbmdNb2RlbCBmcm9tICcuLi8uLi9idWlsZGluZy9tb2RlbC9CdWlsZGluZ01vZGVsLmpzJztcclxuaW1wb3J0IEJ1aWxkaW5nUmVwcmVzZW50YXRpb24gZnJvbSAnLi4vLi4vYnVpbGRpbmcvbW9kZWwvQnVpbGRpbmdSZXByZXNlbnRhdGlvbi5qcyc7XHJcbmltcG9ydCBHcm91cCBmcm9tICcuLi8uLi9idWlsZGluZy9tb2RlbC9Hcm91cC5qcyc7XHJcbmltcG9ydCBOdW1iZXJHcm91cCBmcm9tICcuLi8uLi9idWlsZGluZy9tb2RlbC9OdW1iZXJHcm91cC5qcyc7XHJcbmltcG9ydCBOdW1iZXJHcm91cFN0YWNrIGZyb20gJy4uLy4uL2J1aWxkaW5nL21vZGVsL051bWJlckdyb3VwU3RhY2suanMnO1xyXG5pbXBvcnQgTnVtYmVyUGllY2UgZnJvbSAnLi4vLi4vYnVpbGRpbmcvbW9kZWwvTnVtYmVyUGllY2UuanMnO1xyXG5pbXBvcnQgTnVtYmVyU3RhY2sgZnJvbSAnLi4vLi4vYnVpbGRpbmcvbW9kZWwvTnVtYmVyU3RhY2suanMnO1xyXG5pbXBvcnQgU2hhcGVHcm91cCBmcm9tICcuLi8uLi9idWlsZGluZy9tb2RlbC9TaGFwZUdyb3VwLmpzJztcclxuaW1wb3J0IFNoYXBlR3JvdXBTdGFjayBmcm9tICcuLi8uLi9idWlsZGluZy9tb2RlbC9TaGFwZUdyb3VwU3RhY2suanMnO1xyXG5pbXBvcnQgU2hhcGVQaWVjZSBmcm9tICcuLi8uLi9idWlsZGluZy9tb2RlbC9TaGFwZVBpZWNlLmpzJztcclxuaW1wb3J0IFNoYXBlU3RhY2sgZnJvbSAnLi4vLi4vYnVpbGRpbmcvbW9kZWwvU2hhcGVTdGFjay5qcyc7XHJcbmltcG9ydCBGcmFjdGlvbnNDb21tb25Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0ZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBQcmltZUZhY3Rvcml6YXRpb24gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1ByaW1lRmFjdG9yaXphdGlvbi5qcyc7XHJcbmltcG9ydCBmcmFjdGlvbnNDb21tb24gZnJvbSAnLi4vLi4vZnJhY3Rpb25zQ29tbW9uLmpzJztcclxuaW1wb3J0IENoYWxsZW5nZVR5cGUgZnJvbSAnLi9DaGFsbGVuZ2VUeXBlLmpzJztcclxuaW1wb3J0IENvbGxlY3Rpb25GaW5kZXIgZnJvbSAnLi9Db2xsZWN0aW9uRmluZGVyLmpzJztcclxuaW1wb3J0IFNoYXBlVGFyZ2V0IGZyb20gJy4vU2hhcGVUYXJnZXQuanMnO1xyXG5pbXBvcnQgVGFyZ2V0IGZyb20gJy4vVGFyZ2V0LmpzJztcclxuaW1wb3J0IFVuaXRDb2xsZWN0aW9uIGZyb20gJy4vVW5pdENvbGxlY3Rpb24uanMnO1xyXG5cclxuLy8gZ2xvYmFsXHJcbmxldCBpc0RvaW5nUmVzZXRHZW5lcmF0aW9uID0gZmFsc2U7IC8vIFdlIG5lZWQgZGlmZmVyZW50IGJlaGF2aW9yIHdoZW4gZ2VuZXJhdGluZyBsZXZlbHMgZnJvbSBhIHJlc2V0LCB0cmFja2VkIHdpdGggdGhpcyBmbGFnXHJcblxyXG4vLyB7QXJyYXkuPENoYWxsZW5nZVR5cGU+fSAtIFdoZW4gcmVzZXR0aW5nIGxldmVscywgdGhpcyB3aWxsIGhvbGQgdGhlIGNoYWxsZW5nZSB0eXBlcyBmb3IgdGhlIGZpcnN0IDQuXHJcbmxldCByZXNldFR5cGVzID0gW107XHJcblxyXG5jbGFzcyBGcmFjdGlvbkNoYWxsZW5nZSBleHRlbmRzIEJ1aWxkaW5nTW9kZWwge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbE51bWJlclxyXG4gICAqIEBwYXJhbSB7Q2hhbGxlbmdlVHlwZX0gY2hhbGxlbmdlVHlwZVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaGFzTWl4ZWRUYXJnZXRzXHJcbiAgICogQHBhcmFtIHtBcnJheS48VGFyZ2V0Pn0gdGFyZ2V0c1xyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFNoYXBlUGllY2U+fSBzaGFwZVBpZWNlc1xyXG4gICAqIEBwYXJhbSB7QXJyYXkuPE51bWJlclBpZWNlPn0gbnVtYmVyUGllY2VzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGxldmVsTnVtYmVyLCBjaGFsbGVuZ2VUeXBlLCBoYXNNaXhlZFRhcmdldHMsIHRhcmdldHMsIHNoYXBlUGllY2VzLCBudW1iZXJQaWVjZXMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbGV2ZWxOdW1iZXIgPT09ICdudW1iZXInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBDaGFsbGVuZ2VUeXBlLlZBTFVFUy5pbmNsdWRlcyggY2hhbGxlbmdlVHlwZSApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgaGFzTWl4ZWRUYXJnZXRzID09PSAnYm9vbGVhbicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIHRhcmdldHMgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggc2hhcGVQaWVjZXMgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggbnVtYmVyUGllY2VzICkgKTtcclxuICAgIGFzc2VydCAmJiB0YXJnZXRzLmZvckVhY2goIHRhcmdldCA9PiBhc3NlcnQoIHRhcmdldCBpbnN0YW5jZW9mIFRhcmdldCApICk7XHJcbiAgICBhc3NlcnQgJiYgc2hhcGVQaWVjZXMuZm9yRWFjaCggc2hhcGVQaWVjZSA9PiBhc3NlcnQoIHNoYXBlUGllY2UgaW5zdGFuY2VvZiBTaGFwZVBpZWNlICkgKTtcclxuICAgIGFzc2VydCAmJiBudW1iZXJQaWVjZXMuZm9yRWFjaCggbnVtYmVyUGllY2UgPT4gYXNzZXJ0KCBudW1iZXJQaWVjZSBpbnN0YW5jZW9mIE51bWJlclBpZWNlICkgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIGNvbnN0IGhhc1BpZXMgPSBfLnNvbWUoIHNoYXBlUGllY2VzLCBwaWVjZSA9PiBwaWVjZS5yZXByZXNlbnRhdGlvbiA9PT0gQnVpbGRpbmdSZXByZXNlbnRhdGlvbi5QSUUgKTtcclxuICAgIGNvbnN0IGhhc0JhcnMgPSBfLnNvbWUoIHNoYXBlUGllY2VzLCBwaWVjZSA9PiBwaWVjZS5yZXByZXNlbnRhdGlvbiA9PT0gQnVpbGRpbmdSZXByZXNlbnRhdGlvbi5CQVIgKTtcclxuICAgIGNvbnN0IGhhc051bWJlcnMgPSAhIW51bWJlclBpZWNlcy5sZW5ndGg7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaGFzUGllcyArIGhhc0JhcnMgKyBoYXNOdW1iZXJzID09PSAxLCAnV2Ugb25seSBzdXBwb3J0IG9uZSBmb3Igbm93JyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMubGV2ZWxOdW1iZXIgPSBsZXZlbE51bWJlcjtcclxuXHJcbiAgICAvLyBAcHVibGljIHtDaGFsbGVuZ2VUeXBlfVxyXG4gICAgdGhpcy5jaGFsbGVuZ2VUeXBlID0gY2hhbGxlbmdlVHlwZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48VGFyZ2V0Pn1cclxuICAgIHRoaXMudGFyZ2V0cyA9IHRhcmdldHM7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn1cclxuICAgIHRoaXMuaGFzTWl4ZWRUYXJnZXRzID0gaGFzTWl4ZWRUYXJnZXRzO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59XHJcbiAgICB0aGlzLmhhc1NoYXBlcyA9IGhhc0JhcnMgfHwgaGFzUGllcztcclxuXHJcbiAgICAvLyBAcHVibGljIHtCdWlsZGluZ1JlcHJlc2VudGF0aW9ufG51bGx9XHJcbiAgICB0aGlzLnJlcHJlc2VudGF0aW9uID0gaGFzUGllcyA/IEJ1aWxkaW5nUmVwcmVzZW50YXRpb24uUElFIDogKCBoYXNCYXJzID8gQnVpbGRpbmdSZXByZXNlbnRhdGlvbi5CQVIgOiBudWxsICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy5tYXhUYXJnZXRXaG9sZXMgPSBNYXRoLmNlaWwoIE1hdGgubWF4KCAuLi50YXJnZXRzLm1hcCggdGFyZ2V0ID0+IHRhcmdldC5mcmFjdGlvbi52YWx1ZSApICkgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9XHJcbiAgICB0aGlzLm1heE51bWJlciA9IE1hdGgubWF4KCAuLi5udW1iZXJQaWVjZXMubWFwKCBudW1iZXJQaWVjZSA9PiBudW1iZXJQaWVjZS5udW1iZXIgKSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fVxyXG4gICAgdGhpcy5zY29yZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggdGFyZ2V0cy5tYXAoIHRhcmdldCA9PiB0YXJnZXQuZ3JvdXBQcm9wZXJ0eSApLCAoIC4uLmdyb3VwcyApID0+IHtcclxuICAgICAgcmV0dXJuIGdyb3Vwcy5maWx0ZXIoIGdyb3VwID0+IGdyb3VwICE9PSBudWxsICkubGVuZ3RoO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0ZyYWN0aW9uQ2hhbGxlbmdlfSAtIFNldCBleHRlcm5hbGx5IGlmLCB3aGVuIGdvaW5nIGZyb20gdGhpcyBjaGFsbGVuZ2UgdG8gdGhlIHNwZWNpZmllZCBvbmUsIHRoZXJlXHJcbiAgICAvLyBzaG91bGQgaW5zdGVhZCBiZSBhIFwicmVmcmVzaFwiIGFuaW1hdGlvbiBpbnN0ZWFkIG9mIFwibmV4dFwiIGNoYWxsZW5nZS5cclxuICAgIHRoaXMucmVmcmVzaGVkQ2hhbGxlbmdlID0gbnVsbDtcclxuXHJcbiAgICAvLyBTb3J0IG91dCBpbnB1dHMgKHdpdGggYSBuZXcgY29weSwgc28gd2UgZG9uJ3QgbW9kaWZ5IG91ciBhY3R1YWwgcGFyYW1ldGVyIHJlZmVyZW5jZSkgc28gd2UgY3JlYXRlIHRoZSBzdGFja3MgaW5cclxuICAgIC8vIGluY3JlYXNpbmcgb3JkZXJcclxuICAgIHNoYXBlUGllY2VzID0gc2hhcGVQaWVjZXMuc2xpY2UoKS5zb3J0KCAoIGEsIGIgKSA9PiB7XHJcbiAgICAgIC8vIE5PVEU6IFRoaXMgc2VlbXMgYmFja3dhcmRzLCBidXQgd2Ugd2FudCB0aGUgQklHR0VTVCBmcmFjdGlvbiBhdCB0aGUgc3RhcnQgKHNpbmNlIGl0IGhhcyB0aGUgc21hbGxlc3RcclxuICAgICAgLy8gZGVub21pbmF0b3IpXHJcbiAgICAgIGlmICggYS5mcmFjdGlvbi5pc0xlc3NUaGFuKCBiLmZyYWN0aW9uICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGEuZnJhY3Rpb24uZXF1YWxzKCBiLmZyYWN0aW9uICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICBudW1iZXJQaWVjZXMgPSBudW1iZXJQaWVjZXMuc2xpY2UoKS5zb3J0KCAoIGEsIGIgKSA9PiB7XHJcbiAgICAgIGlmICggYS5udW1iZXIgPCBiLm51bWJlciApIHsgcmV0dXJuIC0xOyB9XHJcbiAgICAgIGVsc2UgaWYgKCBhLm51bWJlciA9PT0gYi5udW1iZXIgKSB7IHJldHVybiAwOyB9XHJcbiAgICAgIGVsc2UgeyByZXR1cm4gMTsgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGlmICggaGFzUGllcyApIHtcclxuICAgICAgdGhpcy5zaGFwZUdyb3VwU3RhY2tzLnB1c2goIG5ldyBTaGFwZUdyb3VwU3RhY2soIHRhcmdldHMubGVuZ3RoLCBCdWlsZGluZ1JlcHJlc2VudGF0aW9uLlBJRSwgdGhpcy5tYXhUYXJnZXRXaG9sZXMgPiAxICkgKTtcclxuICAgIH1cclxuICAgIGlmICggaGFzQmFycyApIHtcclxuICAgICAgdGhpcy5zaGFwZUdyb3VwU3RhY2tzLnB1c2goIG5ldyBTaGFwZUdyb3VwU3RhY2soIHRhcmdldHMubGVuZ3RoLCBCdWlsZGluZ1JlcHJlc2VudGF0aW9uLkJBUiwgdGhpcy5tYXhUYXJnZXRXaG9sZXMgPiAxICkgKTtcclxuICAgIH1cclxuICAgIGlmICggaGFzTnVtYmVycyApIHtcclxuICAgICAgdGhpcy5udW1iZXJHcm91cFN0YWNrcy5wdXNoKCBuZXcgTnVtYmVyR3JvdXBTdGFjayggdGFyZ2V0cy5sZW5ndGgsIHRoaXMuaGFzTWl4ZWRUYXJnZXRzICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgU2hhcGVTdGFja3MgZm9yIGEgZ2l2ZW4gdHlwZSBvZiBTaGFwZVBpZWNlIChpZiBvbmUgZG9lc24ndCBleGlzdCksIGFuZCBhZGQgdGhlIHBpZWNlIHRvIGl0LlxyXG4gICAgc2hhcGVQaWVjZXMuZm9yRWFjaCggc2hhcGVQaWVjZSA9PiB7XHJcbiAgICAgIGxldCBzaGFwZVN0YWNrID0gdGhpcy5maW5kTWF0Y2hpbmdTaGFwZVN0YWNrKCBzaGFwZVBpZWNlICk7XHJcbiAgICAgIGlmICggIXNoYXBlU3RhY2sgKSB7XHJcbiAgICAgICAgY29uc3QgcXVhbnRpdHkgPSBzaGFwZVBpZWNlcy5maWx0ZXIoIG90aGVyUGllY2UgPT4gb3RoZXJQaWVjZS5mcmFjdGlvbi5lcXVhbHMoIHNoYXBlUGllY2UuZnJhY3Rpb24gKSApLmxlbmd0aDtcclxuICAgICAgICBzaGFwZVN0YWNrID0gbmV3IFNoYXBlU3RhY2soIHNoYXBlUGllY2UuZnJhY3Rpb24sIHF1YW50aXR5LCBzaGFwZVBpZWNlLnJlcHJlc2VudGF0aW9uLCBzaGFwZVBpZWNlLmNvbG9yICk7XHJcbiAgICAgICAgdGhpcy5zaGFwZVN0YWNrcy5wdXNoKCBzaGFwZVN0YWNrICk7XHJcbiAgICAgIH1cclxuICAgICAgc2hhcGVTdGFjay5zaGFwZVBpZWNlcy5wdXNoKCBzaGFwZVBpZWNlICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIE51bWJlclN0YWNrcyBmb3IgYSBnaXZlbiB0eXBlIG9mIE51bWJlclBpZWNlIChpZiBvbmUgZG9lc24ndCBleGlzdCksIGFuZCBhZGQgdGhlIHBpZWNlIHRvIGl0LlxyXG4gICAgbnVtYmVyUGllY2VzLmZvckVhY2goIG51bWJlclBpZWNlID0+IHtcclxuICAgICAgbGV0IG51bWJlclN0YWNrID0gdGhpcy5maW5kTWF0Y2hpbmdOdW1iZXJTdGFjayggbnVtYmVyUGllY2UgKTtcclxuICAgICAgaWYgKCAhbnVtYmVyU3RhY2sgKSB7XHJcbiAgICAgICAgY29uc3QgcXVhbnRpdHkgPSBudW1iZXJQaWVjZXMuZmlsdGVyKCBvdGhlclBpZWNlID0+IG90aGVyUGllY2UubnVtYmVyID09PSBudW1iZXJQaWVjZS5udW1iZXIgKS5sZW5ndGg7XHJcbiAgICAgICAgbnVtYmVyU3RhY2sgPSBuZXcgTnVtYmVyU3RhY2soIG51bWJlclBpZWNlLm51bWJlciwgcXVhbnRpdHkgKTtcclxuICAgICAgICB0aGlzLm51bWJlclN0YWNrcy5wdXNoKCBudW1iZXJTdGFjayApO1xyXG4gICAgICB9XHJcbiAgICAgIG51bWJlclN0YWNrLm51bWJlclBpZWNlcy5wdXNoKCBudW1iZXJQaWVjZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFkZCBpbiBlbm91Z2ggU2hhcGVHcm91cHMgaW4gdGhlIHN0YWNrIHRvIHNvbHZlIGZvciBhbGwgdGFyZ2V0c1xyXG4gICAgaWYgKCBzaGFwZVBpZWNlcy5sZW5ndGggKSB7XHJcbiAgICAgIHRoaXMuc2hhcGVHcm91cFN0YWNrcy5mb3JFYWNoKCBzaGFwZUdyb3VwU3RhY2sgPT4ge1xyXG4gICAgICAgIF8udGltZXMoIHRhcmdldHMubGVuZ3RoIC0gMSwgKCkgPT4ge1xyXG4gICAgICAgICAgY29uc3Qgc2hhcGVHcm91cCA9IG5ldyBTaGFwZUdyb3VwKCBzaGFwZUdyb3VwU3RhY2sucmVwcmVzZW50YXRpb24sIHtcclxuICAgICAgICAgICAgcmV0dXJuUGllY2VMaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMucmVtb3ZlTGFzdFBpZWNlRnJvbVNoYXBlR3JvdXAoIHNoYXBlR3JvdXAgKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbWF4Q29udGFpbmVyczogdGhpcy5tYXhUYXJnZXRXaG9sZXNcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIHNoYXBlR3JvdXBTdGFjay5zaGFwZUdyb3Vwcy5wdXNoKCBzaGFwZUdyb3VwICk7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICAvLyBBZGQgaW4gZW5vdWdoIE51bWJlckdyb3VwcyBpbiB0aGUgc3RhY2sgdG8gc29sdmUgZm9yIGFsbCB0YXJnZXRzXHJcbiAgICBpZiAoIG51bWJlclBpZWNlcy5sZW5ndGggKSB7XHJcbiAgICAgIHRoaXMubnVtYmVyR3JvdXBTdGFja3MuZm9yRWFjaCggbnVtYmVyR3JvdXBTdGFjayA9PiB7XHJcbiAgICAgICAgXy50aW1lcyggdGFyZ2V0cy5sZW5ndGggLSAxLCAoKSA9PiB7XHJcbiAgICAgICAgICBudW1iZXJHcm91cFN0YWNrLm51bWJlckdyb3Vwcy5wdXNoKCBuZXcgTnVtYmVyR3JvdXAoIG51bWJlckdyb3VwU3RhY2suaXNNaXhlZE51bWJlciwge1xyXG4gICAgICAgICAgICBhY3RpdmVOdW1iZXJSYW5nZVByb3BlcnR5OiB0aGlzLmFjdGl2ZU51bWJlclJhbmdlUHJvcGVydHlcclxuICAgICAgICAgIH0gKSApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE1vc3Qgb2Ygb3VyIGNyZWF0aW9uIGxvZ2ljIGlzIGluIHJlc2V0KCksIHNvIHRoaXMgaW5pdGlhbGl6ZXMgc29tZSBzdGF0ZVxyXG4gICAgdGhpcy5yZXNldCgpO1xyXG5cclxuICAgIC8vIFdlJ2xsIGFkZCBpbiBhbnkgcmVsZXZhbnQgXCJpbml0aWFsXCIgZ3JvdXBzLCBzbyB0aGF0IHRoZXJlIGlzIG9uZSBvdXQgaW4gdGhlIHBsYXkgYXJlYS5cclxuICAgIGNvbnN0IGluaXRpYWxHcm91cHMgPSBbXTtcclxuICAgIGxldCBsYXN0SW5pdGlhbEdyb3VwID0gbnVsbDtcclxuICAgIGlmICggaGFzUGllcyApIHtcclxuICAgICAgbGFzdEluaXRpYWxHcm91cCA9IHRoaXMuYWRkU2hhcGVHcm91cCggQnVpbGRpbmdSZXByZXNlbnRhdGlvbi5QSUUsIHRoaXMubWF4VGFyZ2V0V2hvbGVzICk7XHJcbiAgICAgIGluaXRpYWxHcm91cHMucHVzaCggbGFzdEluaXRpYWxHcm91cCApO1xyXG4gICAgfVxyXG4gICAgaWYgKCBoYXNCYXJzICkge1xyXG4gICAgICBsYXN0SW5pdGlhbEdyb3VwID0gdGhpcy5hZGRTaGFwZUdyb3VwKCBCdWlsZGluZ1JlcHJlc2VudGF0aW9uLkJBUiwgdGhpcy5tYXhUYXJnZXRXaG9sZXMgKTtcclxuICAgICAgaW5pdGlhbEdyb3Vwcy5wdXNoKCBsYXN0SW5pdGlhbEdyb3VwICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIGhhc051bWJlcnMgKSB7XHJcbiAgICAgIGxhc3RJbml0aWFsR3JvdXAgPSB0aGlzLmFkZE51bWJlckdyb3VwKCB0aGlzLmhhc01peGVkVGFyZ2V0cyApO1xyXG4gICAgICBpbml0aWFsR3JvdXBzLnB1c2goIGxhc3RJbml0aWFsR3JvdXAgKTtcclxuICAgIH1cclxuICAgIGlmICggbGFzdEluaXRpYWxHcm91cCApIHtcclxuICAgICAgdGhpcy5zZWxlY3RlZEdyb3VwUHJvcGVydHkudmFsdWUgPSBsYXN0SW5pdGlhbEdyb3VwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExheSBvdXQgaW5pdGlhbCBncm91cHNcclxuICAgIGNvbnN0IGhhbGZTcGFjZSA9IDE3MDtcclxuICAgIGluaXRpYWxHcm91cHMuZm9yRWFjaCggKCBncm91cCwgaW5kZXggKSA9PiB7XHJcbiAgICAgIGdyb3VwLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBuZXcgVmVjdG9yMiggaGFsZlNwYWNlICogKCAyICogaW5kZXggLSBpbml0aWFsR3JvdXBzLmxlbmd0aCArIDEgKSwgMCApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmluZHMgdGhlIGNsb3Nlc3QgVGFyZ2V0IHRvIGEgbGlzdCBvZiBnaXZlbiBtb2RlbCBwb3NpdGlvbnMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48VmVjdG9yMj59IHBvc2l0aW9uc1xyXG4gICAqIEByZXR1cm5zIHtUYXJnZXR9XHJcbiAgICovXHJcbiAgZmluZENsb3Nlc3RUYXJnZXQoIHBvc2l0aW9ucyApIHtcclxuICAgIGxldCBiZXN0VGFyZ2V0ID0gbnVsbDtcclxuICAgIGxldCBiZXN0RGlzdGFuY2UgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcblxyXG4gICAgcG9zaXRpb25zLmZvckVhY2goIHBvc2l0aW9uID0+IHtcclxuICAgICAgdGhpcy50YXJnZXRzLmZvckVhY2goIHRhcmdldCA9PiB7XHJcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSB0YXJnZXQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5kaXN0YW5jZSggcG9zaXRpb24gKTtcclxuICAgICAgICBpZiAoIGRpc3RhbmNlIDwgYmVzdERpc3RhbmNlICkge1xyXG4gICAgICAgICAgYmVzdERpc3RhbmNlID0gZGlzdGFuY2U7XHJcbiAgICAgICAgICBiZXN0VGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJlc3RUYXJnZXQgKTtcclxuXHJcbiAgICByZXR1cm4gYmVzdFRhcmdldDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElmIG5vdGhpbmcgaXMgc2VsZWN0ZWQsIHRyeSB0byBzZWxlY3QgdGhlIG1vc3QtcHJldmlvdXNseS1zZWxlY3RlZCBncm91cC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2VsZWN0UHJldmlvdXNseVNlbGVjdGVkR3JvdXAoKSB7XHJcbiAgICBpZiAoIHRoaXMuc2VsZWN0ZWRHcm91cFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcHJldmlvdXNHcm91cCA9IHRoaXMucHJldmlvdXNseVNlbGVjdGVkR3JvdXBQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGlmICggcHJldmlvdXNHcm91cCAmJiAoIHRoaXMuc2hhcGVHcm91cHMuaW5jbHVkZXMoIHByZXZpb3VzR3JvdXAgKSB8fCB0aGlzLm51bWJlckdyb3Vwcy5pbmNsdWRlcyggcHJldmlvdXNHcm91cCApICkgKSB7XHJcbiAgICAgIHRoaXMuc2VsZWN0ZWRHcm91cFByb3BlcnR5LnZhbHVlID0gdGhpcy5wcmV2aW91c2x5U2VsZWN0ZWRHcm91cFByb3BlcnR5LnZhbHVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNvbnN0IGZpcnN0R3JvdXAgPSB0aGlzLnNoYXBlR3JvdXBzLmxlbmd0aCA+IDAgPyB0aGlzLnNoYXBlR3JvdXBzLmdldCggMCApIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubnVtYmVyR3JvdXBzLmxlbmd0aCA+IDAgPyB0aGlzLm51bWJlckdyb3Vwcy5nZXQoIDAgKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xyXG5cclxuICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gcHJldmlvdXNseS1zZWxlY3RlZCBncm91cCwgd2UnbGwganVzdCBzZWxlY3QgdGhlIGZpcnN0IG9uZS5cclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mcmFjdGlvbnMtY29tbW9uL2lzc3Vlcy80MyNpc3N1ZWNvbW1lbnQtNDU0MTQ5OTY2XHJcbiAgICAgIGlmICggZmlyc3RHcm91cCApIHtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkR3JvdXBQcm9wZXJ0eS52YWx1ZSA9IGZpcnN0R3JvdXA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhhbmRsZXMgbW92aW5nIGEgR3JvdXAgaW50byB0aGUgY29sbGVjdGlvbiBhcmVhIChUYXJnZXQpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7R3JvdXB9IGdyb3VwXHJcbiAgICogQHBhcmFtIHtUYXJnZXR9IHRhcmdldFxyXG4gICAqIEBwYXJhbSB7T2JzZXJ2YWJsZUFycmF5RGVmLjxHcm91cD59IGdyb3VwQXJyYXlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc2NhbGVcclxuICAgKi9cclxuICBjb2xsZWN0R3JvdXAoIGdyb3VwLCB0YXJnZXQsIGdyb3VwQXJyYXksIHNjYWxlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZ3JvdXAgaW5zdGFuY2VvZiBHcm91cCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGFyZ2V0Lmdyb3VwUHJvcGVydHkudmFsdWUgPT09IG51bGwgKTtcclxuXHJcbiAgICAvLyBTZXR0aW5nIHRoaXMgc2hvdWxkIHJlc3VsdCBpbiBhIHNpZGUtZWZmZWN0IG9mIHVwZGF0aW5nIG91ciB0YXJnZXQncyBwb3NpdGlvblByb3BlcnR5IHRvIHRoZSBjb3JyZWN0IHBvc2l0aW9uLlxyXG4gICAgdGFyZ2V0Lmdyb3VwUHJvcGVydHkudmFsdWUgPSBncm91cDtcclxuXHJcbiAgICAvLyBUcnkgdG8gc3RhcnQgbW92aW5nIG91dCBhbm90aGVyIGdyb3VwXHJcbiAgICB0aGlzLmVuc3VyZUdyb3VwcyggZ3JvdXAudHlwZSApO1xyXG5cclxuICAgIGNvbnN0IHBvc2l0aW9uUHJvcGVydHkgPSB0YXJnZXQucG9zaXRpb25Qcm9wZXJ0eTtcclxuICAgIGdyb3VwLmFuaW1hdG9yLmFuaW1hdGVUbygge1xyXG4gICAgICBwb3NpdGlvbjogcG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgc2NhbGU6IHNjYWxlLFxyXG4gICAgICBhbmltYXRpb25JbnZhbGlkYXRpb25Qcm9wZXJ0eTogcG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgZW5kQW5pbWF0aW9uQ2FsbGJhY2s6ICgpID0+IHtcclxuICAgICAgICBncm91cEFycmF5LnJlbW92ZSggZ3JvdXAgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlcyBtb3ZpbmcgYSBTaGFwZUdyb3VwIGludG8gdGhlIGNvbGxlY3Rpb24gYXJlYSAoVGFyZ2V0KS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NoYXBlR3JvdXB9IHNoYXBlR3JvdXBcclxuICAgKiBAcGFyYW0ge1RhcmdldH0gdGFyZ2V0XHJcbiAgICovXHJcbiAgY29sbGVjdFNoYXBlR3JvdXAoIHNoYXBlR3JvdXAsIHRhcmdldCApIHtcclxuICAgIHNoYXBlR3JvdXAucGFydGl0aW9uRGVub21pbmF0b3JQcm9wZXJ0eS52YWx1ZSA9IHRhcmdldC5mcmFjdGlvbi5kZW5vbWluYXRvcjtcclxuXHJcbiAgICB0aGlzLmNvbGxlY3RHcm91cCggc2hhcGVHcm91cCwgdGFyZ2V0LCB0aGlzLnNoYXBlR3JvdXBzLCBGcmFjdGlvbnNDb21tb25Db25zdGFudHMuU0hBUEVfQ09MTEVDVElPTl9TQ0FMRSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlcyBtb3ZpbmcgYSBOdW1iZXJHcm91cCBpbnRvIHRoZSBjb2xsZWN0aW9uIGFyZWEgKFRhcmdldCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJHcm91cH0gbnVtYmVyR3JvdXBcclxuICAgKiBAcGFyYW0ge1RhcmdldH0gdGFyZ2V0XHJcbiAgICovXHJcbiAgY29sbGVjdE51bWJlckdyb3VwKCBudW1iZXJHcm91cCwgdGFyZ2V0ICkge1xyXG4gICAgdGhpcy5jb2xsZWN0R3JvdXAoIG51bWJlckdyb3VwLCB0YXJnZXQsIHRoaXMubnVtYmVyR3JvdXBzLCBGcmFjdGlvbnNDb21tb25Db25zdGFudHMuTlVNQkVSX0NPTExFQ1RJT05fU0NBTEUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmVzIGEgZ3JvdXAgdG8gdGhlIGNlbnRlciBvZiB0aGUgcGxheSBhcmVhLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7R3JvdXB9IGdyb3VwXHJcbiAgICovXHJcbiAgY2VudGVyR3JvdXAoIGdyb3VwICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZ3JvdXAgaW5zdGFuY2VvZiBHcm91cCApO1xyXG5cclxuICAgIGdyb3VwLmFuaW1hdG9yLmFuaW1hdGVUbygge1xyXG4gICAgICBwb3NpdGlvbjogVmVjdG9yMi5aRVJPLFxyXG4gICAgICBzY2FsZTogMSxcclxuICAgICAgdmVsb2NpdHk6IDYwXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJZiB0aGVyZSBhcmUgbm8gZ3JvdXBzLCBpdCBtb3ZlcyBvbmUgb3V0IHRvIHRoZSBjZW50ZXIgb2YgdGhlIHBsYXkgYXJlYS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCdWlsZGluZ1R5cGV9IHR5cGVcclxuICAgKi9cclxuICBlbnN1cmVHcm91cHMoIHR5cGUgKSB7XHJcbiAgICBjb25zdCBncm91cEFycmF5ID0gdGhpcy5ncm91cHNNYXAuZ2V0KCB0eXBlICk7XHJcbiAgICBjb25zdCBzdGFja0FycmF5ID0gdGhpcy5ncm91cFN0YWNrc01hcC5nZXQoIHR5cGUgKTtcclxuXHJcbiAgICAvLyBJZiB3ZSBhbHJlYWR5IGhhdmUgb25lIG91dCwgZG9uJ3QgbG9vayBmb3IgbW9yZVxyXG4gICAgaWYgKCBncm91cEFycmF5Lmxlbmd0aCA+PSAyICkgeyByZXR1cm47IH1cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGFja0FycmF5Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBncm91cFN0YWNrID0gc3RhY2tBcnJheVsgaSBdO1xyXG4gICAgICBpZiAoICFncm91cFN0YWNrLmlzRW1wdHkoKSApIHtcclxuICAgICAgICBjb25zdCBncm91cCA9IGdyb3VwU3RhY2suYXJyYXkucG9wKCk7XHJcbiAgICAgICAgZ3JvdXAuY2xlYXIoKTtcclxuICAgICAgICBncm91cC5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gZ3JvdXBTdGFjay5wb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgIGdyb3VwQXJyYXkucHVzaCggZ3JvdXAgKTtcclxuICAgICAgICB0aGlzLmNlbnRlckdyb3VwKCBncm91cCApO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRHcm91cFByb3BlcnR5LnZhbHVlID0gZ3JvdXA7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdyYWJzIGEgU2hhcGVQaWVjZSBmcm9tIHRoZSBzdGFjaywgc2V0cyB1cCBzdGF0ZSBmb3IgaXQgdG8gYmUgZHJhZ2dlZC9wbGFjZWQsIGFuZCBwbGFjZXMgaXQgYXQgdGhlXHJcbiAgICogZ2l2ZW4gcG9pbnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTaGFwZVN0YWNrfSBzdGFja1xyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gbW9kZWxQb2ludFxyXG4gICAqIEByZXR1cm5zIHtTaGFwZVBpZWNlfVxyXG4gICAqL1xyXG4gIHB1bGxTaGFwZVBpZWNlRnJvbVN0YWNrKCBzdGFjaywgbW9kZWxQb2ludCApIHtcclxuICAgIGNvbnN0IHNoYXBlUGllY2UgPSBzdGFjay5zaGFwZVBpZWNlcy5wb3AoKTtcclxuICAgIHNoYXBlUGllY2UuY2xlYXIoKTtcclxuICAgIHNoYXBlUGllY2UucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IG1vZGVsUG9pbnQ7XHJcbiAgICB0aGlzLmRyYWdTaGFwZVBpZWNlRnJvbVN0YWNrKCBzaGFwZVBpZWNlICk7XHJcbiAgICByZXR1cm4gc2hhcGVQaWVjZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdyYWJzIGEgTnVtYmVyUGllY2UgZnJvbSB0aGUgc3RhY2ssIHNldHMgdXAgc3RhdGUgZm9yIGl0IHRvIGJlIGRyYWdnZWQvcGxhY2VkLCBhbmQgcGxhY2VzIGl0IGF0IHRoZVxyXG4gICAqIGdpdmVuIHBvaW50LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyU3RhY2t9IHN0YWNrXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBtb2RlbFBvaW50XHJcbiAgICogQHJldHVybnMge051bWJlclBpZWNlfVxyXG4gICAqL1xyXG4gIHB1bGxOdW1iZXJQaWVjZUZyb21TdGFjayggc3RhY2ssIG1vZGVsUG9pbnQgKSB7XHJcbiAgICBjb25zdCBudW1iZXJQaWVjZSA9IHN0YWNrLm51bWJlclBpZWNlcy5wb3AoKTtcclxuICAgIG51bWJlclBpZWNlLmNsZWFyKCk7XHJcbiAgICBudW1iZXJQaWVjZS5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gbW9kZWxQb2ludDtcclxuICAgIHRoaXMuZHJhZ051bWJlclBpZWNlRnJvbVN0YWNrKCBudW1iZXJQaWVjZSApO1xyXG4gICAgcmV0dXJuIG51bWJlclBpZWNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR3JhYnMgYSBHcm91cCBmcm9tIHRoZSBzdGFjaywgc2V0cyB1cCBzdGF0ZSBmb3IgaXQgdG8gYmUgZHJhZ2dlZC9wbGFjZWQsIGFuZCBwbGFjZXMgaXQgYXQgdGhlXHJcbiAgICogZ2l2ZW4gcG9pbnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTaGFwZUdyb3VwU3RhY2t8TnVtYmVyR3JvdXBTdGFja30gc3RhY2tcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IG1vZGVsUG9pbnRcclxuICAgKiBAcmV0dXJucyB7U2hhcGVHcm91cH1cclxuICAgKi9cclxuICBwdWxsR3JvdXBGcm9tU3RhY2soIHN0YWNrLCBtb2RlbFBvaW50ICkge1xyXG4gICAgY29uc3QgZ3JvdXAgPSBzdGFjay5hcnJheS5wb3AoKTtcclxuICAgIGdyb3VwLmNsZWFyKCk7XHJcbiAgICBncm91cC5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gbW9kZWxQb2ludDtcclxuICAgIHRoaXMuZHJhZ0dyb3VwRnJvbVN0YWNrKCBncm91cCApO1xyXG4gICAgcmV0dXJuIGdyb3VwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY29udGVudHMgb2YgYSB0YXJnZXQgdG8gdGhlIGNvbGxlY3Rpb24gcGFuZWxzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VGFyZ2V0fSB0YXJnZXRcclxuICAgKi9cclxuICByZXR1cm5UYXJnZXQoIHRhcmdldCApIHtcclxuICAgIGNvbnN0IGdyb3VwID0gdGFyZ2V0Lmdyb3VwUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgaWYgKCBncm91cCApIHtcclxuXHJcbiAgICAgIC8vIElmIHRoZSBncm91cCBoYXNuJ3QgZnVsbHkgY29tcGxldGVkIGl0cyBhbmltYXRpb24sIHRoZW4gZm9yY2UgaXQgdG8gY29tcGxldGUgZWFybHkuXHJcbiAgICAgIGdyb3VwLmFuaW1hdG9yLmVuZEFuaW1hdGlvbigpO1xyXG5cclxuICAgICAgdGFyZ2V0Lmdyb3VwUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgICBpZiAoIHRoaXMuaGFzU2hhcGVzICkge1xyXG4gICAgICAgIHRoaXMuc2hhcGVHcm91cHMucHVzaCggZ3JvdXAgKTtcclxuICAgICAgICB0aGlzLnJldHVyblNoYXBlR3JvdXAoIGdyb3VwICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5udW1iZXJHcm91cHMucHVzaCggZ3JvdXAgKTtcclxuICAgICAgICB0aGlzLnJldHVybk51bWJlckdyb3VwKCBncm91cCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEb2VzIGEgc2VtaS1yZXNldCBvZiB0aGUgY2hhbGxlbmdlIHN0YXRlLCBhbmQgY29uc3RydWN0cyBhIHNvbHV0aW9uICh3aXRob3V0IHB1dHRpbmcgdGhpbmdzIGluIHRhcmdldHMpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgaXMgZ2VuZXJhbGx5IG9ubHkgYXZhaWxhYmxlIGZvciB3aGVuID9zaG93QW5zd2VycyBpcyBwcm92aWRlZC5cclxuICAgKi9cclxuICBjaGVhdCgpIHtcclxuXHJcbiAgICAvLyBGaXJzdCB3ZSBkbyBhIGxvdCBvZiB3b3JrIHRvIHN0b3Agd2hhdCdzIGhhcHBlbmluZyBhbmQgZG8gYSBcInNvZnRcIiByZXNldFxyXG4gICAgdGhpcy5lbmRBbmltYXRpb24oKTtcclxuXHJcbiAgICB0aGlzLnRhcmdldHMuZm9yRWFjaCggdGFyZ2V0ID0+IHRoaXMucmV0dXJuVGFyZ2V0KCB0YXJnZXQgKSApO1xyXG4gICAgdGhpcy5lbmRBbmltYXRpb24oKTtcclxuXHJcbiAgICB0aGlzLnNoYXBlR3JvdXBzLmZvckVhY2goIHNoYXBlR3JvdXAgPT4gdGhpcy5yZXR1cm5TaGFwZUdyb3VwKCBzaGFwZUdyb3VwICkgKTtcclxuICAgIHRoaXMubnVtYmVyR3JvdXBzLmZvckVhY2goIG51bWJlckdyb3VwID0+IHRoaXMucmV0dXJuTnVtYmVyR3JvdXAoIG51bWJlckdyb3VwICkgKTtcclxuICAgIHRoaXMuZW5kQW5pbWF0aW9uKCk7XHJcblxyXG4gICAgY29uc3QgZ3JvdXBTdGFjayA9IHRoaXMuaGFzU2hhcGVzID8gdGhpcy5zaGFwZUdyb3VwU3RhY2tzWyAwIF0gOiB0aGlzLm51bWJlckdyb3VwU3RhY2tzWyAwIF07XHJcblxyXG4gICAgY29uc3QgbnVtR3JvdXBzID0gZ3JvdXBTdGFjay5hcnJheS5sZW5ndGg7XHJcbiAgICBjb25zdCBncm91cHMgPSBfLnJhbmdlKCAwLCBudW1Hcm91cHMgKS5tYXAoIGluZGV4ID0+IHtcclxuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgVmVjdG9yMiggdGhpcy5oYXNTaGFwZXMgPyAtMTAwIDogMCwgKCBpbmRleCAtICggbnVtR3JvdXBzIC0gMSApIC8gMiApICogMTAwICk7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5wdWxsR3JvdXBGcm9tU3RhY2soIGdyb3VwU3RhY2ssIHBvaW50ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5lbmRBbmltYXRpb24oKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuaGFzU2hhcGVzICkge1xyXG4gICAgICBsZXQgbWF4UXVhbnRpdHkgPSAwO1xyXG4gICAgICBjb25zdCBhdmFpbGFibGVDb2xsZWN0aW9uID0gVW5pdENvbGxlY3Rpb24uZnJhY3Rpb25zVG9Db2xsZWN0aW9uKCB0aGlzLnNoYXBlU3RhY2tzLm1hcCggc2hhcGVTdGFjayA9PiB7XHJcbiAgICAgICAgbWF4UXVhbnRpdHkgPSBNYXRoLm1heCggbWF4UXVhbnRpdHksIHNoYXBlU3RhY2suYXJyYXkubGVuZ3RoICk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbiggc2hhcGVTdGFjay5hcnJheS5sZW5ndGgsIHNoYXBlU3RhY2suZnJhY3Rpb24uZGVub21pbmF0b3IgKTtcclxuICAgICAgfSApICk7XHJcbiAgICAgIGNvbnN0IGRlbm9taW5hdG9ycyA9IGF2YWlsYWJsZUNvbGxlY3Rpb24ubm9uemVyb0Rlbm9taW5hdG9ycztcclxuICAgICAgY29uc3QgZnJhY3Rpb25zID0gdGhpcy50YXJnZXRzLm1hcCggdGFyZ2V0ID0+IHRhcmdldC5mcmFjdGlvbiApO1xyXG5cclxuICAgICAgLy8gT25seSBzZWFyY2ggb3ZlciB0aGUgZ2l2ZW4gZGVub21pbmF0b3JzXHJcbiAgICAgIGNvbnN0IGNvbGxlY3Rpb25GaW5kZXIgPSBuZXcgQ29sbGVjdGlvbkZpbmRlcigge1xyXG4gICAgICAgIGRlbm9taW5hdG9yczogZGVub21pbmF0b3JzLm1hcCggUHJpbWVGYWN0b3JpemF0aW9uLmZhY3RvciApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGNvbnN0IHNvbHV0aW9uID0gRnJhY3Rpb25DaGFsbGVuZ2UuZmluZFNoYXBlU29sdXRpb24oIGZyYWN0aW9ucywgY29sbGVjdGlvbkZpbmRlciwgbWF4UXVhbnRpdHksIGF2YWlsYWJsZUNvbGxlY3Rpb24gKTtcclxuXHJcbiAgICAgIHNvbHV0aW9uLmZvckVhY2goICggZ3JvdXBDb2xsZWN0aW9ucywgZ3JvdXBJbmRleCApID0+IHtcclxuICAgICAgICAvLyBBZGQgY29udGFpbmVycyB3aGVyZSBuZWVkZWRcclxuICAgICAgICBjb25zdCBncm91cCA9IGdyb3Vwc1sgZ3JvdXBJbmRleCBdO1xyXG4gICAgICAgIHdoaWxlICggZ3JvdXAuc2hhcGVDb250YWluZXJzLmxlbmd0aCA8IGdyb3VwQ29sbGVjdGlvbnMubGVuZ3RoICkge1xyXG4gICAgICAgICAgZ3JvdXAuaW5jcmVhc2VDb250YWluZXJDb3VudCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTW92ZSB0aGUgcGllY2VzIHRvIHRoZSBjb250YWluZXJzXHJcbiAgICAgICAgZ3JvdXBDb2xsZWN0aW9ucy5mb3JFYWNoKCAoIGNvbGxlY3Rpb24sIGNvbnRhaW5lckluZGV4ICkgPT4ge1xyXG4gICAgICAgICAgY29sbGVjdGlvbi51bml0RnJhY3Rpb25zLmZvckVhY2goIGZyYWN0aW9uID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgc3RhY2sgPSBfLmZpbmQoIHRoaXMuc2hhcGVTdGFja3MsIHN0YWNrID0+IHN0YWNrLmZyYWN0aW9uLmVxdWFscyggZnJhY3Rpb24gKSApO1xyXG4gICAgICAgICAgICBjb25zdCBwaWVjZSA9IHRoaXMucHVsbFNoYXBlUGllY2VGcm9tU3RhY2soIHN0YWNrLCBWZWN0b3IyLlpFUk8gKTtcclxuICAgICAgICAgICAgdGhpcy5wbGFjZUFjdGl2ZVNoYXBlUGllY2UoIHBpZWNlLCBncm91cC5zaGFwZUNvbnRhaW5lcnMuZ2V0KCBjb250YWluZXJJbmRleCApLCBncm91cCApO1xyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNvbnN0IHB1bGxOdW1iZXJQaWVjZSA9ICggbnVtYmVyLCBzcG90ICkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHN0YWNrID0gXy5maW5kKCB0aGlzLm51bWJlclN0YWNrcywgc3RhY2sgPT4gc3RhY2subnVtYmVyID09PSBudW1iZXIgKTtcclxuICAgICAgICBjb25zdCBwaWVjZSA9IHRoaXMucHVsbE51bWJlclBpZWNlRnJvbVN0YWNrKCBzdGFjaywgVmVjdG9yMi5aRVJPICk7XHJcbiAgICAgICAgdGhpcy5kcmFnZ2VkTnVtYmVyUGllY2VzLnJlbW92ZSggcGllY2UgKTtcclxuICAgICAgICB0aGlzLnBsYWNlTnVtYmVyUGllY2UoIHNwb3QsIHBpZWNlICk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBjb25zdCBhdmFpbGFibGVRdWFudGl0aWVzID0ge307XHJcbiAgICAgIGNvbnN0IG51bWJlcnMgPSB0aGlzLm51bWJlclN0YWNrcy5tYXAoIG51bWJlclN0YWNrID0+IHtcclxuICAgICAgICBhdmFpbGFibGVRdWFudGl0aWVzWyBudW1iZXJTdGFjay5udW1iZXIgXSA9IG51bWJlclN0YWNrLmFycmF5Lmxlbmd0aDtcclxuICAgICAgICByZXR1cm4gbnVtYmVyU3RhY2subnVtYmVyO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGNvbnN0IGZyYWN0aW9ucyA9IFtdO1xyXG5cclxuICAgICAgLy8gaWYgd2UgaGF2ZSBtaXhlZCBudW1iZXJzLCB0aGVpciBcIndob2xlXCIgcGFydHMgYXJlIGV4YWN0bHkgY29tcHV0YWJsZVxyXG4gICAgICBncm91cHMuZm9yRWFjaCggKCBncm91cCwgaW5kZXggKSA9PiB7XHJcbiAgICAgICAgbGV0IGZyYWN0aW9uID0gdGhpcy50YXJnZXRzWyBpbmRleCBdLmZyYWN0aW9uO1xyXG4gICAgICAgIGlmICggZ3JvdXAuaXNNaXhlZE51bWJlciApIHtcclxuICAgICAgICAgIGNvbnN0IHdob2xlID0gTWF0aC5mbG9vciggZnJhY3Rpb24udmFsdWUgKTtcclxuICAgICAgICAgIHB1bGxOdW1iZXJQaWVjZSggd2hvbGUsIGdyb3VwLndob2xlU3BvdCApO1xyXG4gICAgICAgICAgYXZhaWxhYmxlUXVhbnRpdGllc1sgd2hvbGUgXS0tO1xyXG4gICAgICAgICAgZnJhY3Rpb24gPSBmcmFjdGlvbi5taW51c0ludGVnZXIoIHdob2xlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZyYWN0aW9ucy5wdXNoKCBmcmFjdGlvbi5yZWR1Y2VkKCkgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgY29uc3Qgc29sdXRpb24gPSBGcmFjdGlvbkNoYWxsZW5nZS5maW5kTnVtYmVyU29sdXRpb24oIGZyYWN0aW9ucywgTWF0aC5tYXgoIC4uLm51bWJlcnMgKSwgYXZhaWxhYmxlUXVhbnRpdGllcyApO1xyXG5cclxuICAgICAgZ3JvdXBzLmZvckVhY2goICggZ3JvdXAsIGluZGV4ICkgPT4ge1xyXG4gICAgICAgIHB1bGxOdW1iZXJQaWVjZSggc29sdXRpb25bIGluZGV4IF0gKiBmcmFjdGlvbnNbIGluZGV4IF0ubnVtZXJhdG9yLCBncm91cC5udW1lcmF0b3JTcG90ICk7XHJcbiAgICAgICAgcHVsbE51bWJlclBpZWNlKCBzb2x1dGlvblsgaW5kZXggXSAqIGZyYWN0aW9uc1sgaW5kZXggXS5kZW5vbWluYXRvciwgZ3JvdXAuZGVub21pbmF0b3JTcG90ICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmVuZEFuaW1hdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHNvbHV0aW9uIHRvIHNoYXBlIGNoYWxsZW5nZXMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPEZyYWN0aW9uPn0gZnJhY3Rpb25zIC0gVGhlIHRhcmdldCBmcmFjdGlvbnMgdG8gZmlsbFxyXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbkZpbmRlcn0gY29sbGVjdGlvbkZpbmRlclxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhRdWFudGl0eSAtIE5vIHNvbHV0aW9uIHdoaWNoIHRha2VzIG1vcmUgdGhhbiB0aGlzIG11Y2ggb2Ygb25lIHBpZWNlIHR5cGUgd291bGQgYmUgY29ycmVjdC5cclxuICAgKiBAcGFyYW0ge1VuaXRDb2xsZWN0aW9ufSBhdmFpbGFibGVDb2xsZWN0aW9uIC0gUmVwcmVzZW50cyB0aGUgcGllY2VzIHdlIGhhdmUgYXZhaWxhYmxlXHJcbiAgICogQHJldHVybnMge0FycmF5LjxBcnJheS48VW5pdENvbGxlY3Rpb24+Pn0gLSBGb3IgZWFjaCBncm91cCwgZm9yIGVhY2ggY29udGFpbmVyLCBhIHVuaXQgY29sbGVjdGlvbiBvZiB0aGVcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9ucyB0byBiZSBwbGFjZWQgaW5zaWRlLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBmaW5kU2hhcGVTb2x1dGlvbiggZnJhY3Rpb25zLCBjb2xsZWN0aW9uRmluZGVyLCBtYXhRdWFudGl0eSwgYXZhaWxhYmxlQ29sbGVjdGlvbiApIHtcclxuXHJcbiAgICAvLyB7QXJyYXkuPEFycmF5LjxPYmplY3Q+Pn0gLSBFYWNoIG9iamVjdCBpcyB7IHtBcnJheS48VW5pdENvbGxlY3Rpb24+fSBjb250YWluZXJzLCB7VW5pdENvbGxlY3Rpb259IHRvdGFsIH1cclxuICAgIGNvbnN0IGZyYWN0aW9uUG9zc2liaWxpdGllcyA9IGZyYWN0aW9ucy5tYXAoIGZyYWN0aW9uID0+IHtcclxuICAgICAgY29uc3QgY29sbGVjdGlvbnMgPSBjb2xsZWN0aW9uRmluZGVyLnNlYXJjaCggZnJhY3Rpb24sIHtcclxuICAgICAgICBtYXhRdWFudGl0eTogbWF4UXVhbnRpdHlcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8ge0FycmF5LjxBcnJheS48QXJyYXkuPEZyYWN0aW9uPj4+fVxyXG4gICAgICBjb25zdCBjb21wYWN0R3JvdXBzID0gY29sbGVjdGlvbnMubWFwKCBjb2xsZWN0aW9uID0+IGNvbGxlY3Rpb24uZ2V0Q29tcGFjdFJlcXVpcmVkR3JvdXBzKCBNYXRoLmNlaWwoIGZyYWN0aW9uLnZhbHVlICkgKSApLmZpbHRlciggXy5pZGVudGl0eSApO1xyXG5cclxuICAgICAgcmV0dXJuIGNvbXBhY3RHcm91cHMubWFwKCBjb21wYWN0R3JvdXAgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNvbnRhaW5lcnMgPSBjb21wYWN0R3JvdXAubWFwKCBVbml0Q29sbGVjdGlvbi5mcmFjdGlvbnNUb0NvbGxlY3Rpb24gKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgY29udGFpbmVyczogY29udGFpbmVycyxcclxuICAgICAgICAgIHRvdGFsOiBfLnJlZHVjZSggY29udGFpbmVycywgKCBhLCBiICkgPT4gYS5wbHVzKCBiICksIG5ldyBVbml0Q29sbGVjdGlvbiggW10gKSApXHJcbiAgICAgICAgfTtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGxldCBjdXJyZW50Q29sbGVjdGlvbiA9IGF2YWlsYWJsZUNvbGxlY3Rpb247XHJcblxyXG4gICAgZnVuY3Rpb24gZmluZFNvbHV0aW9uKCBpICkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXHJcbiAgICAgIGlmICggaSA9PT0gZnJhY3Rpb25zLmxlbmd0aCApIHtcclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHBvc3NpYmlsaXRpZXMgPSBmcmFjdGlvblBvc3NpYmlsaXRpZXNbIGkgXTtcclxuXHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHBvc3NpYmlsaXRpZXMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgY29uc3QgcG9zc2liaWxpdHkgPSBwb3NzaWJpbGl0aWVzWyBqIF07XHJcbiAgICAgICAgaWYgKCBjdXJyZW50Q29sbGVjdGlvbi5pbmNsdWRlcyggcG9zc2liaWxpdHkudG90YWwgKSApIHtcclxuICAgICAgICAgIGN1cnJlbnRDb2xsZWN0aW9uID0gY3VycmVudENvbGxlY3Rpb24ubWludXMoIHBvc3NpYmlsaXR5LnRvdGFsICk7XHJcblxyXG4gICAgICAgICAgY29uc3Qgc3Vic29sdXRpb24gPSBmaW5kU29sdXRpb24oIGkgKyAxICk7XHJcblxyXG4gICAgICAgICAgY3VycmVudENvbGxlY3Rpb24gPSBjdXJyZW50Q29sbGVjdGlvbi5wbHVzKCBwb3NzaWJpbGl0eS50b3RhbCApO1xyXG5cclxuICAgICAgICAgIGlmICggc3Vic29sdXRpb24gKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbIHBvc3NpYmlsaXR5LmNvbnRhaW5lcnMsIC4uLnN1YnNvbHV0aW9uIF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZpbmRTb2x1dGlvbiggMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBzb2x1dGlvbnMgKG11bHRpcGxpZXJzIGZvciBlYWNoIGZyYWN0aW9uIHN1Y2ggdGhhdCBudW1lcmF0b3IqbiBhbmQgZGVub21pbmF0b3IqbiBhcmUgaW5cclxuICAgKiBhdmFpbGFibGVRdWFudGl0aWVzKS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48RnJhY3Rpb24+fSBmcmFjdGlvbnNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4TnVtYmVyXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGF2YWlsYWJsZVF1YW50aXRpZXMgLSBNYXAgZnJvbSBudW1iZXIgPT4gcXVhbnRpdHkgYXZhaWxhYmxlLlxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48bnVtYmVyPn0gLSBtdWx0aXBsaWVyc1xyXG4gICAqL1xyXG4gIHN0YXRpYyBmaW5kTnVtYmVyU29sdXRpb24oIGZyYWN0aW9ucywgbWF4TnVtYmVyLCBhdmFpbGFibGVRdWFudGl0aWVzICkge1xyXG4gICAgaWYgKCBmcmFjdGlvbnMubGVuZ3RoID09PSAwICkge1xyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZnJhY3Rpb24gPSBmcmFjdGlvbnNbIDAgXTtcclxuICAgIGNvbnN0IG1heFNvbHV0aW9uID0gTWF0aC5mbG9vciggbWF4TnVtYmVyIC8gZnJhY3Rpb24uZGVub21pbmF0b3IgKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPD0gbWF4U29sdXRpb247IGkrKyApIHtcclxuICAgICAgY29uc3QgbnVtZXJhdG9yID0gaSAqIGZyYWN0aW9uLm51bWVyYXRvcjtcclxuICAgICAgY29uc3QgZGVub21pbmF0b3IgPSBpICogZnJhY3Rpb24uZGVub21pbmF0b3I7XHJcbiAgICAgIGlmICggYXZhaWxhYmxlUXVhbnRpdGllc1sgbnVtZXJhdG9yIF0gJiYgYXZhaWxhYmxlUXVhbnRpdGllc1sgZGVub21pbmF0b3IgXSAmJlxyXG4gICAgICAgICAgICggbnVtZXJhdG9yICE9PSBkZW5vbWluYXRvciB8fCBhdmFpbGFibGVRdWFudGl0aWVzWyBudW1lcmF0b3IgXSA+IDEgKSApIHtcclxuICAgICAgICBhdmFpbGFibGVRdWFudGl0aWVzWyBudW1lcmF0b3IgXS0tO1xyXG4gICAgICAgIGF2YWlsYWJsZVF1YW50aXRpZXNbIGRlbm9taW5hdG9yIF0tLTtcclxuICAgICAgICBjb25zdCBzdWJzb2x1dGlvbiA9IEZyYWN0aW9uQ2hhbGxlbmdlLmZpbmROdW1iZXJTb2x1dGlvbiggZnJhY3Rpb25zLnNsaWNlKCAxICksIG1heE51bWJlciwgYXZhaWxhYmxlUXVhbnRpdGllcyApO1xyXG4gICAgICAgIGF2YWlsYWJsZVF1YW50aXRpZXNbIG51bWVyYXRvciBdKys7XHJcbiAgICAgICAgYXZhaWxhYmxlUXVhbnRpdGllc1sgZGVub21pbmF0b3IgXSsrO1xyXG5cclxuICAgICAgICBpZiAoIHN1YnNvbHV0aW9uICkge1xyXG4gICAgICAgICAgcmV0dXJuIFsgaSwgLi4uc3Vic29sdXRpb24gXTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZXJlIGlzIGEgZGVzaXJlZCBcInBzZXVkb3JhbmRvbVwiIGdlbmVyYXRpb24gZm9yIHRoZSBmaXJzdCA0IHNoYXBlIGxldmVscywgd2hpY2ggc2hvdWxkIGhhdmUgYSBcIm5pY2VcIiBtaXggb2ZcclxuICAgKiBwaWUgYW5kIGJhci4gVGhpcyBzaG91bGQgY2hhbmdlIG9uIGV2ZXJ5IFwiaW5pdGlhbFwiIG9yIFwicmVzZXRcIiBnZW5lcmF0aW9uICh3aGVyZSBhbGwgNCBhcmUgZ2VuZXJhdGVkKSwgYnV0XHJcbiAgICogaWYgb25seSBvbmUgaXMgZ2VuZXJhdGVkIHRoZW4gaXQgc2hvdWxkIGJlIHJhbmRvbS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBDYWxsIHRoaXMgYmVmb3JlIGdlbmVyYXRpb24gd2hlbiBpdCdzIGluaXRpYWwvcmVzZXQuXHJcbiAgICovXHJcbiAgc3RhdGljIGJlZ2luRnVsbEdlbmVyYXRpb24oKSB7XHJcbiAgICBpc0RvaW5nUmVzZXRHZW5lcmF0aW9uID0gdHJ1ZTtcclxuICAgIHJlc2V0VHlwZXMgPSBbXHJcbiAgICAgIC4uLmRvdFJhbmRvbS5zaHVmZmxlKCBbXHJcbiAgICAgICAgQ2hhbGxlbmdlVHlwZS5QSUUsXHJcbiAgICAgICAgQ2hhbGxlbmdlVHlwZS5CQVJcclxuICAgICAgXSApLFxyXG4gICAgICAuLi5kb3RSYW5kb20uc2h1ZmZsZSggW1xyXG4gICAgICAgIENoYWxsZW5nZVR5cGUuUElFLFxyXG4gICAgICAgIENoYWxsZW5nZVR5cGUuQkFSXHJcbiAgICAgIF0gKVxyXG4gICAgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGwgdGhpcyBhZnRlciBnZW5lcmF0aW9uIHdoZW4gaXQncyBpbml0aWFsL3Jlc2V0LCBzZWUgYmVnaW5GdWxsR2VuZXJhdGlvbigpXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0YXRpYyBlbmRGdWxsR2VuZXJhdGlvbigpIHtcclxuICAgIGlzRG9pbmdSZXNldEdlbmVyYXRpb24gPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBGcmFjdGlvbkNoYWxsZW5nZSBmb3IgYSBcIlNoYXBlXCIgbGV2ZWwuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsTnVtYmVyXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBoYXNNaXhlZFRhcmdldHNcclxuICAgKiBAcGFyYW0ge0NvbG9yRGVmfSBjb2xvclxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPEZyYWN0aW9uPn0gdGFyZ2V0RnJhY3Rpb25zXHJcbiAgICogQHBhcmFtIHtBcnJheS48RnJhY3Rpb24+fSBwaWVjZUZyYWN0aW9uc1xyXG4gICAqIEByZXR1cm5zIHtGcmFjdGlvbkNoYWxsZW5nZX1cclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlU2hhcGVDaGFsbGVuZ2UoIGxldmVsTnVtYmVyLCBoYXNNaXhlZFRhcmdldHMsIGNvbG9yLCB0YXJnZXRGcmFjdGlvbnMsIHBpZWNlRnJhY3Rpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGxldmVsTnVtYmVyID09PSAnbnVtYmVyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGhhc01peGVkVGFyZ2V0cyA9PT0gJ2Jvb2xlYW4nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBDb2xvckRlZi5pc0NvbG9yRGVmKCBjb2xvciApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCB0YXJnZXRGcmFjdGlvbnMgKSApO1xyXG4gICAgYXNzZXJ0ICYmIHRhcmdldEZyYWN0aW9ucy5mb3JFYWNoKCBmcmFjdGlvbiA9PiBhc3NlcnQoIGZyYWN0aW9uIGluc3RhbmNlb2YgRnJhY3Rpb24gKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggcGllY2VGcmFjdGlvbnMgKSApO1xyXG4gICAgYXNzZXJ0ICYmIHBpZWNlRnJhY3Rpb25zLmZvckVhY2goIGZyYWN0aW9uID0+IGFzc2VydCggZnJhY3Rpb24gaW5zdGFuY2VvZiBGcmFjdGlvbiApICk7XHJcblxyXG4gICAgLy8gUHNldWRvcmFuZG9tIHN0YXJ0IGZvciB0aGUgZmlyc3QgNCBsZXZlbHNcclxuICAgIGNvbnN0IHR5cGUgPSAoIGxldmVsTnVtYmVyID49IDEgJiYgbGV2ZWxOdW1iZXIgPD0gNCAmJiBpc0RvaW5nUmVzZXRHZW5lcmF0aW9uIClcclxuICAgICAgICAgICAgICAgICA/IHJlc2V0VHlwZXNbIGxldmVsTnVtYmVyIC0gMSBdXHJcbiAgICAgICAgICAgICAgICAgOiBkb3RSYW5kb20ubmV4dEJvb2xlYW4oKSA/IENoYWxsZW5nZVR5cGUuUElFIDogQ2hhbGxlbmdlVHlwZS5CQVI7XHJcblxyXG4gICAgY29uc3QgcmVwcmVzZW50YXRpb24gPSB0eXBlID09PSBDaGFsbGVuZ2VUeXBlLlBJRSA/IEJ1aWxkaW5nUmVwcmVzZW50YXRpb24uUElFIDogQnVpbGRpbmdSZXByZXNlbnRhdGlvbi5CQVI7XHJcbiAgICBjb25zdCB0YXJnZXRzID0gdGFyZ2V0RnJhY3Rpb25zLm1hcCggZiA9PiBuZXcgVGFyZ2V0KCBmICkgKTtcclxuICAgIGNvbnN0IHNoYXBlUGllY2VzID0gcGllY2VGcmFjdGlvbnMubWFwKCBmID0+IG5ldyBTaGFwZVBpZWNlKCBmLCByZXByZXNlbnRhdGlvbiwgY29sb3IgKSApO1xyXG4gICAgcmV0dXJuIG5ldyBGcmFjdGlvbkNoYWxsZW5nZSggbGV2ZWxOdW1iZXIsIHR5cGUsIGhhc01peGVkVGFyZ2V0cywgdGFyZ2V0cywgc2hhcGVQaWVjZXMsIFtdICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgRnJhY3Rpb25DaGFsbGVuZ2UgZm9yIGEgXCJOdW1iZXJcIiBsZXZlbC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxOdW1iZXJcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGhhc01peGVkVGFyZ2V0c1xyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFNoYXBlVGFyZ2V0Pn0gc2hhcGVUYXJnZXRzXHJcbiAgICogQHBhcmFtIHtBcnJheS48bnVtYmVyPn0gcGllY2VOdW1iZXJzXHJcbiAgICovXHJcbiAgc3RhdGljIGNyZWF0ZU51bWJlckNoYWxsZW5nZSggbGV2ZWxOdW1iZXIsIGhhc01peGVkVGFyZ2V0cywgc2hhcGVUYXJnZXRzLCBwaWVjZU51bWJlcnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbGV2ZWxOdW1iZXIgPT09ICdudW1iZXInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgaGFzTWl4ZWRUYXJnZXRzID09PSAnYm9vbGVhbicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIHNoYXBlVGFyZ2V0cyApICk7XHJcbiAgICBhc3NlcnQgJiYgc2hhcGVUYXJnZXRzLmZvckVhY2goIHNoYXBlVGFyZ2V0ID0+IGFzc2VydCggc2hhcGVUYXJnZXQgaW5zdGFuY2VvZiBTaGFwZVRhcmdldCApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBwaWVjZU51bWJlcnMgKSApO1xyXG4gICAgYXNzZXJ0ICYmIHBpZWNlTnVtYmVycy5mb3JFYWNoKCBwaWVjZU51bWJlciA9PiBhc3NlcnQoIHR5cGVvZiBwaWVjZU51bWJlciA9PT0gJ251bWJlcicgKSApO1xyXG5cclxuICAgIHJldHVybiBuZXcgRnJhY3Rpb25DaGFsbGVuZ2UoIGxldmVsTnVtYmVyLCBDaGFsbGVuZ2VUeXBlLk5VTUJFUiwgaGFzTWl4ZWRUYXJnZXRzLCBzaGFwZVRhcmdldHMsIFtdLCBwaWVjZU51bWJlcnMubWFwKCBudW1iZXIgPT4ge1xyXG4gICAgICByZXR1cm4gbmV3IE51bWJlclBpZWNlKCBudW1iZXIgKTtcclxuICAgIH0gKSApO1xyXG4gIH1cclxufVxyXG5cclxuZnJhY3Rpb25zQ29tbW9uLnJlZ2lzdGVyKCAnRnJhY3Rpb25DaGFsbGVuZ2UnLCBGcmFjdGlvbkNoYWxsZW5nZSApO1xyXG5leHBvcnQgZGVmYXVsdCBGcmFjdGlvbkNoYWxsZW5nZTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFFBQVEsTUFBTSw2Q0FBNkM7QUFDbEUsU0FBU0MsUUFBUSxRQUFRLG1DQUFtQztBQUM1RCxPQUFPQyxhQUFhLE1BQU0sdUNBQXVDO0FBQ2pFLE9BQU9DLHNCQUFzQixNQUFNLGdEQUFnRDtBQUNuRixPQUFPQyxLQUFLLE1BQU0sK0JBQStCO0FBQ2pELE9BQU9DLFdBQVcsTUFBTSxxQ0FBcUM7QUFDN0QsT0FBT0MsZ0JBQWdCLE1BQU0sMENB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