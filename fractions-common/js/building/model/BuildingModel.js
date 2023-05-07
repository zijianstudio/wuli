// Copyright 2018-2023, University of Colorado Boulder

/**
 * Model representation for the pieces/stacks/groups for numbers/pies/bars.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import EnumerationMap from '../../../../phet-core/js/EnumerationMap.js';
import Easing from '../../../../twixt/js/Easing.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import fractionsCommon from '../../fractionsCommon.js';
import BuildingRepresentation from './BuildingRepresentation.js';
import BuildingType from './BuildingType.js';
import NumberGroup from './NumberGroup.js';
import NumberSpotType from './NumberSpotType.js';
import NumberStack from './NumberStack.js';
import ShapeContainer from './ShapeContainer.js';
import ShapeGroup from './ShapeGroup.js';
import ShapeStack from './ShapeStack.js';

// constants
const scratchVector = new Vector2( 0, 0 ); // Used to minimize garbage collection by reusing a vector.

class BuildingModel {
  constructor() {

    // @public {Array.<ShapeStack>}
    this.shapeStacks = [];

    // @public {Array.<NumberStack>}
    this.numberStacks = [];

    // @public {Array.<ShapeGroupStack>}
    this.shapeGroupStacks = [];

    // @public {Array.<NumberGroupStack>}
    this.numberGroupStacks = [];

    // @public {ObservableArrayDef.<ShapeGroup>}
    this.shapeGroups = createObservableArray();

    // @public {ObservableArrayDef.<ShapePiece>} - Shape pieces in the play area (controlled or animating)
    this.activeShapePieces = createObservableArray();

    // @public {ObservableArrayDef.<NumberGroup>}
    this.numberGroups = createObservableArray();

    // @public {ObservableArrayDef.<NumberPiece>} - Number pieces in the play area (controlled or animating)
    this.activeNumberPieces = createObservableArray();

    // @private {ObservableArrayDef.<NumberPiece>} - Tracking number pieces being dragged, so we can decide whether each
    // number group should show any "do not drop here" symbols on their spots.
    this.draggedNumberPieces = createObservableArray();

    // @private {Property.<Range|null>} - null when there are no active numbers, otherwise a range of all values being
    // dragged.
    this.activeNumberRangeProperty = new Property( null, {
      valueComparisonStrategy: 'equalsFunction'
    } );

    // @public {Property.<Group|null>} - We'll only show controls for this group (and track the previous value)
    this.selectedGroupProperty = new Property( null );
    this.previouslySelectedGroupProperty = new Property( null );

    // Hook up the correct values for previouslySelectedGroupProperty (no need to unlink due to same lifetime)
    this.selectedGroupProperty.lazyLink( ( newValue, oldValue ) => {
      if ( oldValue ) {
        this.previouslySelectedGroupProperty.value = oldValue;
      }
    } );

    // @public {EnumerationMap.<Array.<Stack>>} - The stacks for groups
    this.groupStacksMap = new EnumerationMap( BuildingType, type => ( {
      [ BuildingType.SHAPE ]: this.shapeGroupStacks,
      [ BuildingType.NUMBER ]: this.numberGroupStacks
    }[ type ] ) );

    // @public {EnumerationMap.<ObservableArrayDef.<Group>>} - The arrays of groups
    this.groupsMap = new EnumerationMap( BuildingType, type => ( {
      [ BuildingType.SHAPE ]: this.shapeGroups,
      [ BuildingType.NUMBER ]: this.numberGroups
    }[ type ] ) );

    // @public {EnumerationMap.<Array.<ShapePiece|NumberPiece>>} - The active pieces arrays
    this.activePiecesMap = new EnumerationMap( BuildingType, type => ( {
      [ BuildingType.SHAPE ]: this.activeShapePieces,
      [ BuildingType.NUMBER ]: this.activeNumberPieces
    }[ type ] ) );

    // Check for duplicates (but only when assertions are enabled)
    assert && this.activePiecesMap.forEach( ( activePieces, type ) => {
      activePieces.addItemAddedListener( () => {
        assert( activePieces.length === _.uniq( activePieces ).length, `Duplicate items should not be added to active pieces for ${type}` );
      } );
    } );

    const rangeListener = this.updateDraggedNumberRange.bind( this );
    this.draggedNumberPieces.addItemAddedListener( rangeListener );
    this.draggedNumberPieces.addItemRemovedListener( rangeListener );
    rangeListener();
  }

  /**
   * Called when the user drags a shape piece from a stack.
   * @public
   *
   * @param {ShapePiece} shapePiece
   */
  dragShapePieceFromStack( shapePiece ) {
    this.activeShapePieces.push( shapePiece );
  }

  /**
   * Called when the user drags a number piece from a stack.
   * @public
   *
   * @param {NumberPiece} numberPiece
   */
  dragNumberPieceFromStack( numberPiece ) {
    this.activeNumberPieces.push( numberPiece );
    this.draggedNumberPieces.push( numberPiece );
  }

  /**
   * Called when the user drags a group from a stack.
   * @public
   *
   * @param {Group} group
   */
  dragGroupFromStack( group ) {
    this.groupsMap.get( group.type ).push( group );
  }

  /**
   * Returns a corresponding ShapeStack that should be used as the "home" of a given ShapePiece (if it's returned from
   * the play area with an animation, etc.)
   * @public
   *
   * @param {ShapePiece} shapePiece
   * @returns {ShapeStack|null}
   */
  findMatchingShapeStack( shapePiece ) {
    return _.find( this.shapeStacks, stack => stack.representation === shapePiece.representation && stack.fraction.equals( shapePiece.fraction ) ) || null;
  }

  /**
   * Returns a corresponding NumberStack that should be used as the "home" of a given NumberPiece (if it's returned from
   * the play area with an animation, etc.)
   * @public
   *
   * @param {NumberPiece} numberPiece
   * @returns {NumberStack|null}
   */
  findMatchingNumberStack( numberPiece ) {
    return _.find( this.numberStacks, stack => stack.number === numberPiece.number ) || null;
  }

  /**
   * Returns the index to which pieces should animate to in the shape stack.
   * @protected
   *
   * @param {ShapeStack} shapeStack
   * @returns {number}
   */
  getShapeStackIndex( shapeStack ) {
    return shapeStack.shapePieces.length;
  }

  /**
   * Returns the index to which pieces should animate to in the number stack.
   * @protected
   *
   * @param {NumberStack} numberStack
   * @returns {number}
   */
  getNumberStackIndex( numberStack ) {
    return numberStack.numberPieces.length;
  }

  /**
   * Animates a piece back to its "home" stack.
   * @public
   *
   * @param {ShapePiece} shapePiece
   */
  returnActiveShapePiece( shapePiece ) {
    const shapeStack = this.findMatchingShapeStack( shapePiece );
    const shapeMatrix = ShapeStack.getShapeMatrix( shapePiece.fraction, shapePiece.representation, this.getShapeStackIndex( shapeStack ) );
    shapePiece.animator.animateTo( {
      position: shapeStack.positionProperty.value.plus( shapeMatrix.timesVector2( Vector2.ZERO ).timesScalar(
        FractionsCommonConstants.SHAPE_BUILD_SCALE
      ) ),
      rotation: 0, // All shapes on building-based screens have 0 rotation in their stacks
      scale: FractionsCommonConstants.SHAPE_BUILD_SCALE,
      shadow: 0,
      animationInvalidationProperty: shapeStack.positionProperty,
      endAnimationCallback: () => {
        this.activeShapePieces.remove( shapePiece );
        if ( shapeStack.isMutable ) {
          shapeStack.shapePieces.push( shapePiece );
        }
      }
    } );
  }

  /**
   * Animates a piece back to its "home" stack.
   * @public
   *
   * @param {NumberPiece} numberPiece
   */
  returnActiveNumberPiece( numberPiece ) {
    const numberStack = this.findMatchingNumberStack( numberPiece );
    const offset = NumberStack.getOffset( this.getNumberStackIndex( numberStack ) );
    numberPiece.animator.animateTo( {
      position: numberStack.positionProperty.value.plus( offset.timesScalar( FractionsCommonConstants.NUMBER_BUILD_SCALE ) ),
      scale: 1,
      animationInvalidationProperty: numberStack.positionProperty,
      endAnimationCallback: () => {
        this.activeNumberPieces.remove( numberPiece );
        if ( numberStack.isMutable ) {
          numberStack.numberPieces.push( numberPiece );
        }
      }
    } );
  }

  /**
   * Places a ShapePiece into a ShapeContainer.
   * @public
   *
   * @param {ShapePiece} shapePiece
   * @param {ShapeContainer} shapeContainer
   * @param {ShapeGroup} shapeGroup
   */
  placeActiveShapePiece( shapePiece, shapeContainer, shapeGroup ) {
    shapeContainer.shapePieces.push( shapePiece );

    const shapeMatrix = ShapeContainer.getShapeMatrix( shapeContainer.getShapeRatio( shapePiece ), shapePiece.fraction, shapePiece.representation );
    shapePiece.animator.animateTo( {
      position: shapeGroup.positionProperty.value.plus( shapeContainer.offset ).plus( shapeMatrix.timesVector2( Vector2.ZERO ) ),
      rotation: shapeMatrix.rotation,
      scale: 1,
      shadow: 0,
      animationInvalidationProperty: shapeGroup.positionProperty,
      easing: Easing.QUADRATIC_IN_OUT,
      endAnimationCallback: () => {
        this.activeShapePieces.remove( shapePiece );
      }
    } );

    this.selectedGroupProperty.value = shapeGroup;
  }

  /**
   * Returns the closest ShapeContainer that the given shape piece could be dropped on.
   * @public
   *
   * @param {ShapePiece} shapePiece
   * @param {number} threshold - How much distance can be allowed between the two for it to be droppable.
   * @returns {ShapeContainer|null}
   */
  closestDroppableShapeContainer( shapePiece, threshold ) {
    let closestContainer = null;
    let closestDistance = threshold;

    const point = shapePiece.positionProperty.value;

    this.shapeGroups.forEach( shapeGroup => {
      const localPoint = scratchVector.set( point ).subtract( shapeGroup.positionProperty.value );

      shapeGroup.shapeContainers.forEach( shapeContainer => {
        if ( shapeContainer.canFitPiece( shapePiece ) ) {
          const distance = shapeContainer.distanceFromPoint( localPoint );
          if ( distance <= closestDistance ) {
            closestDistance = distance;
            closestContainer = shapeContainer;
          }
        }
      } );
    } );

    return closestContainer;
  }

  /**
   * Called when a ShapePiece is dropped by the user.
   * @public
   *
   * @param {ShapePiece} shapePiece
   * @param {number} threshold - How much distance to allow between the piece and a container/group for it to be
   *                             dropped inside.
   */
  shapePieceDropped( shapePiece, threshold ) {
    const closestContainer = this.closestDroppableShapeContainer( shapePiece, threshold );

    if ( closestContainer ) {
      this.placeActiveShapePiece( shapePiece, closestContainer, closestContainer.shapeGroup );
    }
    else {
      this.returnActiveShapePiece( shapePiece );
    }
  }

  /**
   * Called when a NumberPiece is dropped by the user.
   * @public
   *
   * @param {NumberPiece} numberPiece
   * @param {number} threshold - How much distance to allow between the piece and a container/group for it to be
   *                             dropped inside.
   */
  numberPieceDropped( numberPiece, threshold ) {
    let closestSpot = null;
    let closestDistance = threshold;

    const point = numberPiece.positionProperty.value;

    this.numberGroups.forEach( numberGroup => {
      const localPoint = scratchVector.set( point ).subtract( numberGroup.positionProperty.value );

      numberGroup.spots.forEach( spot => {
        if ( numberGroup.canPlaceNumberInSpot( numberPiece.number, spot ) ) {
          const distance = Math.sqrt( spot.bounds.minimumDistanceToPointSquared( localPoint ) );
          if ( distance <= closestDistance ) {
            closestDistance = distance;
            closestSpot = spot;
          }
        }
      } );
    } );

    this.draggedNumberPieces.remove( numberPiece );

    if ( closestSpot ) {
      // Instant like the old sim (for now)
      this.placeNumberPiece( closestSpot, numberPiece );
    }
    else {
      this.returnActiveNumberPiece( numberPiece );
    }
  }

  /**
   * Places a NumberPiece in a NumberSpot
   * @public
   *
   * @param {NumberSpot} numberSpot
   * @param {NumberPiece} numberPiece
   */
  placeNumberPiece( numberSpot, numberPiece ) {
    numberSpot.pieceProperty.value = numberPiece;
    this.activeNumberPieces.remove( numberPiece );

    this.selectedGroupProperty.value = numberSpot.numberGroup;
  }

  /**
   * Removes the last piece from a ShapeGroup (animating it back to its home stack).
   * @public
   *
   * @param {ShapeGroup} shapeGroup
   */
  removeLastPieceFromShapeGroup( shapeGroup ) {
    for ( let i = shapeGroup.shapeContainers.length - 1; i >= 0; i-- ) {
      const shapeContainer = shapeGroup.shapeContainers.get( i );
      if ( shapeContainer.shapePieces.length ) {
        const shapePiece = shapeContainer.shapePieces.pop();

        // If the piece hasn't arrived yet, just complete the animation
        shapePiece.animator.endAnimation();

        const shapeMatrix = ShapeContainer.getShapeMatrix( shapeContainer.totalFractionProperty.value.value, shapePiece.fraction, shapePiece.representation );
        const containerPoint = shapeGroup.positionProperty.value.plus( shapeContainer.offset );
        shapePiece.positionProperty.value = containerPoint.plus( shapeMatrix.timesVector2( Vector2.ZERO ) );
        shapePiece.rotationProperty.value = shapeMatrix.rotation;
        this.activeShapePieces.push( shapePiece );
        this.returnActiveShapePiece( shapePiece );
        return;
      }
    }
    throw new Error( 'Could not find a piece to remove' );
  }

  /**
   * Removes the last piece from a NumberGroup (animating it back to its home stack).
   * @public
   *
   * @param {NumberGroup} numberGroup
   */
  removeLastPieceFromNumberGroup( numberGroup ) {
    for ( let i = 0; i < numberGroup.spots.length; i++ ) {
      const spot = numberGroup.spots[ i ];
      if ( spot.pieceProperty.value !== null ) {
        const numberPiece = spot.pieceProperty.value;
        spot.pieceProperty.value = null;

        numberPiece.positionProperty.value = spot.bounds.center.plus( numberGroup.positionProperty.value );
        if ( spot.type === NumberSpotType.WHOLE ) {
          numberPiece.scaleProperty.value = FractionsCommonConstants.WHOLE_FRACTIONAL_SIZE_RATIO;
        }
        this.activeNumberPieces.push( numberPiece );
        this.returnActiveNumberPiece( numberPiece );
        return;
      }
    }
  }

  /**
   * Adds a ShapeGroup to the model (usually created from a stack)
   * @public
   *
   * @param {BuildingRepresentation} representation
   * @param {number} [maxContainers]
   * @returns {ShapeGroup}
   */
  addShapeGroup( representation, maxContainers = FractionsCommonConstants.MAX_SHAPE_CONTAINERS ) {
    const shapeGroup = new ShapeGroup( representation, {
      returnPieceListener: () => {
        this.removeLastPieceFromShapeGroup( shapeGroup );
      },
      maxContainers: maxContainers
    } );
    this.dragGroupFromStack( shapeGroup );
    return shapeGroup;
  }

  /**
   * Adds a NumberGroup to the model (usually created from a stack)
   * @public
   *
   * @param {boolean} isMixedNumber
   * @returns {NumberGroup}
   */
  addNumberGroup( isMixedNumber ) {
    const numberGroup = new NumberGroup( isMixedNumber, {
      activeNumberRangeProperty: this.activeNumberRangeProperty
    } );
    this.dragGroupFromStack( numberGroup );

    return numberGroup;
  }

  /**
   * Animates the ShapeGroup back to its "home" stack.
   * @public
   *
   * @param {ShapeGroup} shapeGroup
   */
  returnShapeGroup( shapeGroup ) {
    while ( shapeGroup.hasAnyPieces() ) {
      this.removeLastPieceFromShapeGroup( shapeGroup );
    }

    while ( shapeGroup.shapeContainers.length > 1 ) {
      shapeGroup.decreaseContainerCount();
    }

    const shapeGroupStack = _.find( this.shapeGroupStacks, shapeGroupStack => shapeGroupStack.representation === shapeGroup.representation );
    const positionProperty = shapeGroupStack.positionProperty;
    shapeGroup.animator.animateTo( {
      position: positionProperty.value,
      scale: FractionsCommonConstants.SHAPE_BUILD_SCALE,
      animationInvalidationProperty: positionProperty,
      endAnimationCallback: () => {
        this.shapeGroups.remove( shapeGroup );
        if ( shapeGroupStack.isMutable ) {
          shapeGroupStack.shapeGroups.push( shapeGroup );
        }
        else {
          shapeGroup.dispose();
        }
      }
    } );
  }

  /**
   * Animates the NumberGroup back to its "home" stack.
   * @public
   *
   * @param {NumberGroup} numberGroup
   */
  returnNumberGroup( numberGroup ) {
    while ( numberGroup.hasAnyPieces() ) {
      this.removeLastPieceFromNumberGroup( numberGroup );
    }

    const numberGroupStack = _.find( this.numberGroupStacks, numberGroupStack => numberGroupStack.isMixedNumber === numberGroup.isMixedNumber );
    const positionProperty = numberGroupStack.positionProperty;
    numberGroup.animator.animateTo( {
      position: positionProperty.value,
      scale: FractionsCommonConstants.NUMBER_BUILD_SCALE,
      animationInvalidationProperty: positionProperty,
      endAnimationCallback: () => {
        this.numberGroups.remove( numberGroup );
        if ( numberGroupStack.isMutable ) {
          numberGroupStack.numberGroups.push( numberGroup );
        }
        else {
          numberGroup.dispose();
        }
      }
    } );
  }

  /**
   * When our dragged number pieces change, we need to update our numeric range.
   * @private
   */
  updateDraggedNumberRange() {
    if ( this.draggedNumberPieces.length === 0 ) {
      this.activeNumberRangeProperty.value = null;
    }
    else {
      let min = Number.POSITIVE_INFINITY;
      let max = Number.NEGATIVE_INFINITY;

      this.draggedNumberPieces.forEach( numberPiece => {
        min = Math.min( min, numberPiece.number );
        max = Math.max( max, numberPiece.number );
      } );

      this.activeNumberRangeProperty.value = new Range( min, max );
    }
  }

  /**
   * Ends the animation of everything possible.
   * @public
   */
  endAnimation() {
    this.activeShapePieces.forEach( shapePiece => {
      shapePiece.animator.endAnimation();
    } );
    this.activeNumberPieces.forEach( shapePiece => {
      shapePiece.animator.endAnimation();
    } );
    this.shapeGroups.forEach( shapeGroup => {
      shapeGroup.animator.endAnimation();
    } );
    this.numberGroups.forEach( numberGroup => {
      numberGroup.animator.endAnimation();
    } );
  }

  /**
   * Returns the layout quantity of the "largest" stack.
   * @public
   *
   * @returns {number}
   */
  getLargestStackLayoutQuantity() {
    let quantity = 0;
    [
      ...this.shapeStacks,
      ...this.numberStacks,
      ...this.shapeGroupStacks,
      ...this.numberGroupStacks
    ].forEach( stack => {
      quantity = Math.max( quantity, stack.layoutQuantity );
    } );
    return quantity;
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {
    this.endAnimation();

    this.selectedGroupProperty.reset();
    this.shapeGroups.reset();
    this.numberGroups.forEach( numberGroup => {
      if ( !numberGroup.isDisposed ) {
        numberGroup.dispose();
      }
    } );
    this.numberGroups.reset();
    this.activeShapePieces.reset();
    this.activeNumberPieces.reset();
    this.draggedNumberPieces.reset();
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    this.shapeGroups.forEach( shapeGroup => shapeGroup.step( dt ) );
    this.numberGroups.forEach( numberGroup => numberGroup.step( dt ) );

    this.activeShapePieces.forEach( shapePiece => {
      shapePiece.step( dt );

      // Don't compute the closest for ALL pieces, that would hurt performance.
      if ( shapePiece.representation === BuildingRepresentation.PIE && shapePiece.isUserControlledProperty.value ) {
        const closestContainer = this.closestDroppableShapeContainer( shapePiece, Number.POSITIVE_INFINITY );
        if ( closestContainer ) {
          shapePiece.orientTowardsContainer( closestContainer, dt );
        }
      }
    } );

    this.activeNumberPieces.forEach( numberPiece => numberPiece.step( dt ) );
  }
}

fractionsCommon.register( 'BuildingModel', BuildingModel );
export default BuildingModel;