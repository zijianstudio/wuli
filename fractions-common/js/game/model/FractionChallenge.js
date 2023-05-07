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
  constructor( levelNumber, challengeType, hasMixedTargets, targets, shapePieces, numberPieces ) {
    assert && assert( typeof levelNumber === 'number' );
    assert && assert( ChallengeType.VALUES.includes( challengeType ) );
    assert && assert( typeof hasMixedTargets === 'boolean' );
    assert && assert( Array.isArray( targets ) );
    assert && assert( Array.isArray( shapePieces ) );
    assert && assert( Array.isArray( numberPieces ) );
    assert && targets.forEach( target => assert( target instanceof Target ) );
    assert && shapePieces.forEach( shapePiece => assert( shapePiece instanceof ShapePiece ) );
    assert && numberPieces.forEach( numberPiece => assert( numberPiece instanceof NumberPiece ) );

    super();

    const hasPies = _.some( shapePieces, piece => piece.representation === BuildingRepresentation.PIE );
    const hasBars = _.some( shapePieces, piece => piece.representation === BuildingRepresentation.BAR );
    const hasNumbers = !!numberPieces.length;

    assert && assert( hasPies + hasBars + hasNumbers === 1, 'We only support one for now' );

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
    this.representation = hasPies ? BuildingRepresentation.PIE : ( hasBars ? BuildingRepresentation.BAR : null );

    // @public {number}
    this.maxTargetWholes = Math.ceil( Math.max( ...targets.map( target => target.fraction.value ) ) );

    // @public {number}
    this.maxNumber = Math.max( ...numberPieces.map( numberPiece => numberPiece.number ) );

    // @public {Property.<number>}
    this.scoreProperty = new DerivedProperty( targets.map( target => target.groupProperty ), ( ...groups ) => {
      return groups.filter( group => group !== null ).length;
    } );

    // @public {FractionChallenge} - Set externally if, when going from this challenge to the specified one, there
    // should instead be a "refresh" animation instead of "next" challenge.
    this.refreshedChallenge = null;

    // Sort out inputs (with a new copy, so we don't modify our actual parameter reference) so we create the stacks in
    // increasing order
    shapePieces = shapePieces.slice().sort( ( a, b ) => {
      // NOTE: This seems backwards, but we want the BIGGEST fraction at the start (since it has the smallest
      // denominator)
      if ( a.fraction.isLessThan( b.fraction ) ) {
        return 1;
      }
      else if ( a.fraction.equals( b.fraction ) ) {
        return 0;
      }
      else {
        return -1;
      }
    } );
    numberPieces = numberPieces.slice().sort( ( a, b ) => {
      if ( a.number < b.number ) { return -1; }
      else if ( a.number === b.number ) { return 0; }
      else { return 1; }
    } );

    if ( hasPies ) {
      this.shapeGroupStacks.push( new ShapeGroupStack( targets.length, BuildingRepresentation.PIE, this.maxTargetWholes > 1 ) );
    }
    if ( hasBars ) {
      this.shapeGroupStacks.push( new ShapeGroupStack( targets.length, BuildingRepresentation.BAR, this.maxTargetWholes > 1 ) );
    }
    if ( hasNumbers ) {
      this.numberGroupStacks.push( new NumberGroupStack( targets.length, this.hasMixedTargets ) );
    }

    // Create ShapeStacks for a given type of ShapePiece (if one doesn't exist), and add the piece to it.
    shapePieces.forEach( shapePiece => {
      let shapeStack = this.findMatchingShapeStack( shapePiece );
      if ( !shapeStack ) {
        const quantity = shapePieces.filter( otherPiece => otherPiece.fraction.equals( shapePiece.fraction ) ).length;
        shapeStack = new ShapeStack( shapePiece.fraction, quantity, shapePiece.representation, shapePiece.color );
        this.shapeStacks.push( shapeStack );
      }
      shapeStack.shapePieces.push( shapePiece );
    } );

    // Create NumberStacks for a given type of NumberPiece (if one doesn't exist), and add the piece to it.
    numberPieces.forEach( numberPiece => {
      let numberStack = this.findMatchingNumberStack( numberPiece );
      if ( !numberStack ) {
        const quantity = numberPieces.filter( otherPiece => otherPiece.number === numberPiece.number ).length;
        numberStack = new NumberStack( numberPiece.number, quantity );
        this.numberStacks.push( numberStack );
      }
      numberStack.numberPieces.push( numberPiece );
    } );

    // Add in enough ShapeGroups in the stack to solve for all targets
    if ( shapePieces.length ) {
      this.shapeGroupStacks.forEach( shapeGroupStack => {
        _.times( targets.length - 1, () => {
          const shapeGroup = new ShapeGroup( shapeGroupStack.representation, {
            returnPieceListener: () => {
              this.removeLastPieceFromShapeGroup( shapeGroup );
            },
            maxContainers: this.maxTargetWholes
          } );
          shapeGroupStack.shapeGroups.push( shapeGroup );
        } );
      } );
    }
    // Add in enough NumberGroups in the stack to solve for all targets
    if ( numberPieces.length ) {
      this.numberGroupStacks.forEach( numberGroupStack => {
        _.times( targets.length - 1, () => {
          numberGroupStack.numberGroups.push( new NumberGroup( numberGroupStack.isMixedNumber, {
            activeNumberRangeProperty: this.activeNumberRangeProperty
          } ) );
        } );
      } );
    }

    // Most of our creation logic is in reset(), so this initializes some state
    this.reset();

    // We'll add in any relevant "initial" groups, so that there is one out in the play area.
    const initialGroups = [];
    let lastInitialGroup = null;
    if ( hasPies ) {
      lastInitialGroup = this.addShapeGroup( BuildingRepresentation.PIE, this.maxTargetWholes );
      initialGroups.push( lastInitialGroup );
    }
    if ( hasBars ) {
      lastInitialGroup = this.addShapeGroup( BuildingRepresentation.BAR, this.maxTargetWholes );
      initialGroups.push( lastInitialGroup );
    }
    if ( hasNumbers ) {
      lastInitialGroup = this.addNumberGroup( this.hasMixedTargets );
      initialGroups.push( lastInitialGroup );
    }
    if ( lastInitialGroup ) {
      this.selectedGroupProperty.value = lastInitialGroup;
    }

    // Lay out initial groups
    const halfSpace = 170;
    initialGroups.forEach( ( group, index ) => {
      group.positionProperty.value = new Vector2( halfSpace * ( 2 * index - initialGroups.length + 1 ), 0 );
    } );
  }

  /**
   * Finds the closest Target to a list of given model positions.
   * @public
   *
   * @param {Array.<Vector2>} positions
   * @returns {Target}
   */
  findClosestTarget( positions ) {
    let bestTarget = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    positions.forEach( position => {
      this.targets.forEach( target => {
        const distance = target.positionProperty.value.distance( position );
        if ( distance < bestDistance ) {
          bestDistance = distance;
          bestTarget = target;
        }
      } );
    } );

    assert && assert( bestTarget );

    return bestTarget;
  }

  /**
   * If nothing is selected, try to select the most-previously-selected group.
   * @public
   */
  selectPreviouslySelectedGroup() {
    if ( this.selectedGroupProperty.value ) {
      return;
    }

    const previousGroup = this.previouslySelectedGroupProperty.value;
    if ( previousGroup && ( this.shapeGroups.includes( previousGroup ) || this.numberGroups.includes( previousGroup ) ) ) {
      this.selectedGroupProperty.value = this.previouslySelectedGroupProperty.value;
    }
    else {
      const firstGroup = this.shapeGroups.length > 0 ? this.shapeGroups.get( 0 ) :
                         this.numberGroups.length > 0 ? this.numberGroups.get( 0 ) :
                         null;

      // If there is no previously-selected group, we'll just select the first one.
      // See https://github.com/phetsims/fractions-common/issues/43#issuecomment-454149966
      if ( firstGroup ) {
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
  collectGroup( group, target, groupArray, scale ) {
    assert && assert( group instanceof Group );
    assert && assert( target.groupProperty.value === null );

    // Setting this should result in a side-effect of updating our target's positionProperty to the correct position.
    target.groupProperty.value = group;

    // Try to start moving out another group
    this.ensureGroups( group.type );

    const positionProperty = target.positionProperty;
    group.animator.animateTo( {
      position: positionProperty.value,
      scale: scale,
      animationInvalidationProperty: positionProperty,
      endAnimationCallback: () => {
        groupArray.remove( group );
      }
    } );
  }

  /**
   * Handles moving a ShapeGroup into the collection area (Target).
   * @public
   *
   * @param {ShapeGroup} shapeGroup
   * @param {Target} target
   */
  collectShapeGroup( shapeGroup, target ) {
    shapeGroup.partitionDenominatorProperty.value = target.fraction.denominator;

    this.collectGroup( shapeGroup, target, this.shapeGroups, FractionsCommonConstants.SHAPE_COLLECTION_SCALE );
  }

  /**
   * Handles moving a NumberGroup into the collection area (Target).
   * @public
   *
   * @param {NumberGroup} numberGroup
   * @param {Target} target
   */
  collectNumberGroup( numberGroup, target ) {
    this.collectGroup( numberGroup, target, this.numberGroups, FractionsCommonConstants.NUMBER_COLLECTION_SCALE );
  }

  /**
   * Moves a group to the center of the play area.
   * @public
   *
   * @param {Group} group
   */
  centerGroup( group ) {
    assert && assert( group instanceof Group );

    group.animator.animateTo( {
      position: Vector2.ZERO,
      scale: 1,
      velocity: 60
    } );
  }

  /**
   * If there are no groups, it moves one out to the center of the play area.
   * @private
   *
   * @param {BuildingType} type
   */
  ensureGroups( type ) {
    const groupArray = this.groupsMap.get( type );
    const stackArray = this.groupStacksMap.get( type );

    // If we already have one out, don't look for more
    if ( groupArray.length >= 2 ) { return; }

    for ( let i = 0; i < stackArray.length; i++ ) {
      const groupStack = stackArray[ i ];
      if ( !groupStack.isEmpty() ) {
        const group = groupStack.array.pop();
        group.clear();
        group.positionProperty.value = groupStack.positionProperty.value;
        groupArray.push( group );
        this.centerGroup( group );
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
  pullShapePieceFromStack( stack, modelPoint ) {
    const shapePiece = stack.shapePieces.pop();
    shapePiece.clear();
    shapePiece.positionProperty.value = modelPoint;
    this.dragShapePieceFromStack( shapePiece );
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
  pullNumberPieceFromStack( stack, modelPoint ) {
    const numberPiece = stack.numberPieces.pop();
    numberPiece.clear();
    numberPiece.positionProperty.value = modelPoint;
    this.dragNumberPieceFromStack( numberPiece );
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
  pullGroupFromStack( stack, modelPoint ) {
    const group = stack.array.pop();
    group.clear();
    group.positionProperty.value = modelPoint;
    this.dragGroupFromStack( group );
    return group;
  }

  /**
   * Returns the contents of a target to the collection panels.
   * @public
   *
   * @param {Target} target
   */
  returnTarget( target ) {
    const group = target.groupProperty.value;

    if ( group ) {

      // If the group hasn't fully completed its animation, then force it to complete early.
      group.animator.endAnimation();

      target.groupProperty.value = null;
      if ( this.hasShapes ) {
        this.shapeGroups.push( group );
        this.returnShapeGroup( group );
      }
      else {
        this.numberGroups.push( group );
        this.returnNumberGroup( group );
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

    this.targets.forEach( target => this.returnTarget( target ) );
    this.endAnimation();

    this.shapeGroups.forEach( shapeGroup => this.returnShapeGroup( shapeGroup ) );
    this.numberGroups.forEach( numberGroup => this.returnNumberGroup( numberGroup ) );
    this.endAnimation();

    const groupStack = this.hasShapes ? this.shapeGroupStacks[ 0 ] : this.numberGroupStacks[ 0 ];

    const numGroups = groupStack.array.length;
    const groups = _.range( 0, numGroups ).map( index => {
      const point = new Vector2( this.hasShapes ? -100 : 0, ( index - ( numGroups - 1 ) / 2 ) * 100 );

      return this.pullGroupFromStack( groupStack, point );
    } );

    this.endAnimation();

    if ( this.hasShapes ) {
      let maxQuantity = 0;
      const availableCollection = UnitCollection.fractionsToCollection( this.shapeStacks.map( shapeStack => {
        maxQuantity = Math.max( maxQuantity, shapeStack.array.length );
        return new Fraction( shapeStack.array.length, shapeStack.fraction.denominator );
      } ) );
      const denominators = availableCollection.nonzeroDenominators;
      const fractions = this.targets.map( target => target.fraction );

      // Only search over the given denominators
      const collectionFinder = new CollectionFinder( {
        denominators: denominators.map( PrimeFactorization.factor )
      } );

      const solution = FractionChallenge.findShapeSolution( fractions, collectionFinder, maxQuantity, availableCollection );

      solution.forEach( ( groupCollections, groupIndex ) => {
        // Add containers where needed
        const group = groups[ groupIndex ];
        while ( group.shapeContainers.length < groupCollections.length ) {
          group.increaseContainerCount();
        }

        // Move the pieces to the containers
        groupCollections.forEach( ( collection, containerIndex ) => {
          collection.unitFractions.forEach( fraction => {
            const stack = _.find( this.shapeStacks, stack => stack.fraction.equals( fraction ) );
            const piece = this.pullShapePieceFromStack( stack, Vector2.ZERO );
            this.placeActiveShapePiece( piece, group.shapeContainers.get( containerIndex ), group );
          } );
        } );
      } );
    }
    else {
      const pullNumberPiece = ( number, spot ) => {
        const stack = _.find( this.numberStacks, stack => stack.number === number );
        const piece = this.pullNumberPieceFromStack( stack, Vector2.ZERO );
        this.draggedNumberPieces.remove( piece );
        this.placeNumberPiece( spot, piece );
      };

      const availableQuantities = {};
      const numbers = this.numberStacks.map( numberStack => {
        availableQuantities[ numberStack.number ] = numberStack.array.length;
        return numberStack.number;
      } );
      const fractions = [];

      // if we have mixed numbers, their "whole" parts are exactly computable
      groups.forEach( ( group, index ) => {
        let fraction = this.targets[ index ].fraction;
        if ( group.isMixedNumber ) {
          const whole = Math.floor( fraction.value );
          pullNumberPiece( whole, group.wholeSpot );
          availableQuantities[ whole ]--;
          fraction = fraction.minusInteger( whole );
        }
        fractions.push( fraction.reduced() );
      } );

      const solution = FractionChallenge.findNumberSolution( fractions, Math.max( ...numbers ), availableQuantities );

      groups.forEach( ( group, index ) => {
        pullNumberPiece( solution[ index ] * fractions[ index ].numerator, group.numeratorSpot );
        pullNumberPiece( solution[ index ] * fractions[ index ].denominator, group.denominatorSpot );
      } );
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
  static findShapeSolution( fractions, collectionFinder, maxQuantity, availableCollection ) {

    // {Array.<Array.<Object>>} - Each object is { {Array.<UnitCollection>} containers, {UnitCollection} total }
    const fractionPossibilities = fractions.map( fraction => {
      const collections = collectionFinder.search( fraction, {
        maxQuantity: maxQuantity
      } );

      // {Array.<Array.<Array.<Fraction>>>}
      const compactGroups = collections.map( collection => collection.getCompactRequiredGroups( Math.ceil( fraction.value ) ) ).filter( _.identity );

      return compactGroups.map( compactGroup => {
        const containers = compactGroup.map( UnitCollection.fractionsToCollection );
        return {
          containers: containers,
          total: _.reduce( containers, ( a, b ) => a.plus( b ), new UnitCollection( [] ) )
        };
      } );
    } );

    let currentCollection = availableCollection;

    function findSolution( i ) { // eslint-disable-line consistent-return
      if ( i === fractions.length ) {
        return [];
      }

      const possibilities = fractionPossibilities[ i ];

      for ( let j = 0; j < possibilities.length; j++ ) {
        const possibility = possibilities[ j ];
        if ( currentCollection.includes( possibility.total ) ) {
          currentCollection = currentCollection.minus( possibility.total );

          const subsolution = findSolution( i + 1 );

          currentCollection = currentCollection.plus( possibility.total );

          if ( subsolution ) {
            return [ possibility.containers, ...subsolution ];
          }
        }
      }
    }

    return findSolution( 0 );
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
  static findNumberSolution( fractions, maxNumber, availableQuantities ) {
    if ( fractions.length === 0 ) {
      return [];
    }

    const fraction = fractions[ 0 ];
    const maxSolution = Math.floor( maxNumber / fraction.denominator );

    for ( let i = 1; i <= maxSolution; i++ ) {
      const numerator = i * fraction.numerator;
      const denominator = i * fraction.denominator;
      if ( availableQuantities[ numerator ] && availableQuantities[ denominator ] &&
           ( numerator !== denominator || availableQuantities[ numerator ] > 1 ) ) {
        availableQuantities[ numerator ]--;
        availableQuantities[ denominator ]--;
        const subsolution = FractionChallenge.findNumberSolution( fractions.slice( 1 ), maxNumber, availableQuantities );
        availableQuantities[ numerator ]++;
        availableQuantities[ denominator ]++;

        if ( subsolution ) {
          return [ i, ...subsolution ];
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
    resetTypes = [
      ...dotRandom.shuffle( [
        ChallengeType.PIE,
        ChallengeType.BAR
      ] ),
      ...dotRandom.shuffle( [
        ChallengeType.PIE,
        ChallengeType.BAR
      ] )
    ];
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
  static createShapeChallenge( levelNumber, hasMixedTargets, color, targetFractions, pieceFractions ) {
    assert && assert( typeof levelNumber === 'number' );
    assert && assert( typeof hasMixedTargets === 'boolean' );
    assert && assert( ColorDef.isColorDef( color ) );
    assert && assert( Array.isArray( targetFractions ) );
    assert && targetFractions.forEach( fraction => assert( fraction instanceof Fraction ) );
    assert && assert( Array.isArray( pieceFractions ) );
    assert && pieceFractions.forEach( fraction => assert( fraction instanceof Fraction ) );

    // Pseudorandom start for the first 4 levels
    const type = ( levelNumber >= 1 && levelNumber <= 4 && isDoingResetGeneration )
                 ? resetTypes[ levelNumber - 1 ]
                 : dotRandom.nextBoolean() ? ChallengeType.PIE : ChallengeType.BAR;

    const representation = type === ChallengeType.PIE ? BuildingRepresentation.PIE : BuildingRepresentation.BAR;
    const targets = targetFractions.map( f => new Target( f ) );
    const shapePieces = pieceFractions.map( f => new ShapePiece( f, representation, color ) );
    return new FractionChallenge( levelNumber, type, hasMixedTargets, targets, shapePieces, [] );
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
  static createNumberChallenge( levelNumber, hasMixedTargets, shapeTargets, pieceNumbers ) {
    assert && assert( typeof levelNumber === 'number' );
    assert && assert( typeof hasMixedTargets === 'boolean' );
    assert && assert( Array.isArray( shapeTargets ) );
    assert && shapeTargets.forEach( shapeTarget => assert( shapeTarget instanceof ShapeTarget ) );
    assert && assert( Array.isArray( pieceNumbers ) );
    assert && pieceNumbers.forEach( pieceNumber => assert( typeof pieceNumber === 'number' ) );

    return new FractionChallenge( levelNumber, ChallengeType.NUMBER, hasMixedTargets, shapeTargets, [], pieceNumbers.map( number => {
      return new NumberPiece( number );
    } ) );
  }
}

fractionsCommon.register( 'FractionChallenge', FractionChallenge );
export default FractionChallenge;
