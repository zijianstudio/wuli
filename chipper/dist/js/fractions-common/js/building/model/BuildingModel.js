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
const scratchVector = new Vector2(0, 0); // Used to minimize garbage collection by reusing a vector.

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
    this.activeNumberRangeProperty = new Property(null, {
      valueComparisonStrategy: 'equalsFunction'
    });

    // @public {Property.<Group|null>} - We'll only show controls for this group (and track the previous value)
    this.selectedGroupProperty = new Property(null);
    this.previouslySelectedGroupProperty = new Property(null);

    // Hook up the correct values for previouslySelectedGroupProperty (no need to unlink due to same lifetime)
    this.selectedGroupProperty.lazyLink((newValue, oldValue) => {
      if (oldValue) {
        this.previouslySelectedGroupProperty.value = oldValue;
      }
    });

    // @public {EnumerationMap.<Array.<Stack>>} - The stacks for groups
    this.groupStacksMap = new EnumerationMap(BuildingType, type => ({
      [BuildingType.SHAPE]: this.shapeGroupStacks,
      [BuildingType.NUMBER]: this.numberGroupStacks
    })[type]);

    // @public {EnumerationMap.<ObservableArrayDef.<Group>>} - The arrays of groups
    this.groupsMap = new EnumerationMap(BuildingType, type => ({
      [BuildingType.SHAPE]: this.shapeGroups,
      [BuildingType.NUMBER]: this.numberGroups
    })[type]);

    // @public {EnumerationMap.<Array.<ShapePiece|NumberPiece>>} - The active pieces arrays
    this.activePiecesMap = new EnumerationMap(BuildingType, type => ({
      [BuildingType.SHAPE]: this.activeShapePieces,
      [BuildingType.NUMBER]: this.activeNumberPieces
    })[type]);

    // Check for duplicates (but only when assertions are enabled)
    assert && this.activePiecesMap.forEach((activePieces, type) => {
      activePieces.addItemAddedListener(() => {
        assert(activePieces.length === _.uniq(activePieces).length, `Duplicate items should not be added to active pieces for ${type}`);
      });
    });
    const rangeListener = this.updateDraggedNumberRange.bind(this);
    this.draggedNumberPieces.addItemAddedListener(rangeListener);
    this.draggedNumberPieces.addItemRemovedListener(rangeListener);
    rangeListener();
  }

  /**
   * Called when the user drags a shape piece from a stack.
   * @public
   *
   * @param {ShapePiece} shapePiece
   */
  dragShapePieceFromStack(shapePiece) {
    this.activeShapePieces.push(shapePiece);
  }

  /**
   * Called when the user drags a number piece from a stack.
   * @public
   *
   * @param {NumberPiece} numberPiece
   */
  dragNumberPieceFromStack(numberPiece) {
    this.activeNumberPieces.push(numberPiece);
    this.draggedNumberPieces.push(numberPiece);
  }

  /**
   * Called when the user drags a group from a stack.
   * @public
   *
   * @param {Group} group
   */
  dragGroupFromStack(group) {
    this.groupsMap.get(group.type).push(group);
  }

  /**
   * Returns a corresponding ShapeStack that should be used as the "home" of a given ShapePiece (if it's returned from
   * the play area with an animation, etc.)
   * @public
   *
   * @param {ShapePiece} shapePiece
   * @returns {ShapeStack|null}
   */
  findMatchingShapeStack(shapePiece) {
    return _.find(this.shapeStacks, stack => stack.representation === shapePiece.representation && stack.fraction.equals(shapePiece.fraction)) || null;
  }

  /**
   * Returns a corresponding NumberStack that should be used as the "home" of a given NumberPiece (if it's returned from
   * the play area with an animation, etc.)
   * @public
   *
   * @param {NumberPiece} numberPiece
   * @returns {NumberStack|null}
   */
  findMatchingNumberStack(numberPiece) {
    return _.find(this.numberStacks, stack => stack.number === numberPiece.number) || null;
  }

  /**
   * Returns the index to which pieces should animate to in the shape stack.
   * @protected
   *
   * @param {ShapeStack} shapeStack
   * @returns {number}
   */
  getShapeStackIndex(shapeStack) {
    return shapeStack.shapePieces.length;
  }

  /**
   * Returns the index to which pieces should animate to in the number stack.
   * @protected
   *
   * @param {NumberStack} numberStack
   * @returns {number}
   */
  getNumberStackIndex(numberStack) {
    return numberStack.numberPieces.length;
  }

  /**
   * Animates a piece back to its "home" stack.
   * @public
   *
   * @param {ShapePiece} shapePiece
   */
  returnActiveShapePiece(shapePiece) {
    const shapeStack = this.findMatchingShapeStack(shapePiece);
    const shapeMatrix = ShapeStack.getShapeMatrix(shapePiece.fraction, shapePiece.representation, this.getShapeStackIndex(shapeStack));
    shapePiece.animator.animateTo({
      position: shapeStack.positionProperty.value.plus(shapeMatrix.timesVector2(Vector2.ZERO).timesScalar(FractionsCommonConstants.SHAPE_BUILD_SCALE)),
      rotation: 0,
      // All shapes on building-based screens have 0 rotation in their stacks
      scale: FractionsCommonConstants.SHAPE_BUILD_SCALE,
      shadow: 0,
      animationInvalidationProperty: shapeStack.positionProperty,
      endAnimationCallback: () => {
        this.activeShapePieces.remove(shapePiece);
        if (shapeStack.isMutable) {
          shapeStack.shapePieces.push(shapePiece);
        }
      }
    });
  }

  /**
   * Animates a piece back to its "home" stack.
   * @public
   *
   * @param {NumberPiece} numberPiece
   */
  returnActiveNumberPiece(numberPiece) {
    const numberStack = this.findMatchingNumberStack(numberPiece);
    const offset = NumberStack.getOffset(this.getNumberStackIndex(numberStack));
    numberPiece.animator.animateTo({
      position: numberStack.positionProperty.value.plus(offset.timesScalar(FractionsCommonConstants.NUMBER_BUILD_SCALE)),
      scale: 1,
      animationInvalidationProperty: numberStack.positionProperty,
      endAnimationCallback: () => {
        this.activeNumberPieces.remove(numberPiece);
        if (numberStack.isMutable) {
          numberStack.numberPieces.push(numberPiece);
        }
      }
    });
  }

  /**
   * Places a ShapePiece into a ShapeContainer.
   * @public
   *
   * @param {ShapePiece} shapePiece
   * @param {ShapeContainer} shapeContainer
   * @param {ShapeGroup} shapeGroup
   */
  placeActiveShapePiece(shapePiece, shapeContainer, shapeGroup) {
    shapeContainer.shapePieces.push(shapePiece);
    const shapeMatrix = ShapeContainer.getShapeMatrix(shapeContainer.getShapeRatio(shapePiece), shapePiece.fraction, shapePiece.representation);
    shapePiece.animator.animateTo({
      position: shapeGroup.positionProperty.value.plus(shapeContainer.offset).plus(shapeMatrix.timesVector2(Vector2.ZERO)),
      rotation: shapeMatrix.rotation,
      scale: 1,
      shadow: 0,
      animationInvalidationProperty: shapeGroup.positionProperty,
      easing: Easing.QUADRATIC_IN_OUT,
      endAnimationCallback: () => {
        this.activeShapePieces.remove(shapePiece);
      }
    });
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
  closestDroppableShapeContainer(shapePiece, threshold) {
    let closestContainer = null;
    let closestDistance = threshold;
    const point = shapePiece.positionProperty.value;
    this.shapeGroups.forEach(shapeGroup => {
      const localPoint = scratchVector.set(point).subtract(shapeGroup.positionProperty.value);
      shapeGroup.shapeContainers.forEach(shapeContainer => {
        if (shapeContainer.canFitPiece(shapePiece)) {
          const distance = shapeContainer.distanceFromPoint(localPoint);
          if (distance <= closestDistance) {
            closestDistance = distance;
            closestContainer = shapeContainer;
          }
        }
      });
    });
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
  shapePieceDropped(shapePiece, threshold) {
    const closestContainer = this.closestDroppableShapeContainer(shapePiece, threshold);
    if (closestContainer) {
      this.placeActiveShapePiece(shapePiece, closestContainer, closestContainer.shapeGroup);
    } else {
      this.returnActiveShapePiece(shapePiece);
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
  numberPieceDropped(numberPiece, threshold) {
    let closestSpot = null;
    let closestDistance = threshold;
    const point = numberPiece.positionProperty.value;
    this.numberGroups.forEach(numberGroup => {
      const localPoint = scratchVector.set(point).subtract(numberGroup.positionProperty.value);
      numberGroup.spots.forEach(spot => {
        if (numberGroup.canPlaceNumberInSpot(numberPiece.number, spot)) {
          const distance = Math.sqrt(spot.bounds.minimumDistanceToPointSquared(localPoint));
          if (distance <= closestDistance) {
            closestDistance = distance;
            closestSpot = spot;
          }
        }
      });
    });
    this.draggedNumberPieces.remove(numberPiece);
    if (closestSpot) {
      // Instant like the old sim (for now)
      this.placeNumberPiece(closestSpot, numberPiece);
    } else {
      this.returnActiveNumberPiece(numberPiece);
    }
  }

  /**
   * Places a NumberPiece in a NumberSpot
   * @public
   *
   * @param {NumberSpot} numberSpot
   * @param {NumberPiece} numberPiece
   */
  placeNumberPiece(numberSpot, numberPiece) {
    numberSpot.pieceProperty.value = numberPiece;
    this.activeNumberPieces.remove(numberPiece);
    this.selectedGroupProperty.value = numberSpot.numberGroup;
  }

  /**
   * Removes the last piece from a ShapeGroup (animating it back to its home stack).
   * @public
   *
   * @param {ShapeGroup} shapeGroup
   */
  removeLastPieceFromShapeGroup(shapeGroup) {
    for (let i = shapeGroup.shapeContainers.length - 1; i >= 0; i--) {
      const shapeContainer = shapeGroup.shapeContainers.get(i);
      if (shapeContainer.shapePieces.length) {
        const shapePiece = shapeContainer.shapePieces.pop();

        // If the piece hasn't arrived yet, just complete the animation
        shapePiece.animator.endAnimation();
        const shapeMatrix = ShapeContainer.getShapeMatrix(shapeContainer.totalFractionProperty.value.value, shapePiece.fraction, shapePiece.representation);
        const containerPoint = shapeGroup.positionProperty.value.plus(shapeContainer.offset);
        shapePiece.positionProperty.value = containerPoint.plus(shapeMatrix.timesVector2(Vector2.ZERO));
        shapePiece.rotationProperty.value = shapeMatrix.rotation;
        this.activeShapePieces.push(shapePiece);
        this.returnActiveShapePiece(shapePiece);
        return;
      }
    }
    throw new Error('Could not find a piece to remove');
  }

  /**
   * Removes the last piece from a NumberGroup (animating it back to its home stack).
   * @public
   *
   * @param {NumberGroup} numberGroup
   */
  removeLastPieceFromNumberGroup(numberGroup) {
    for (let i = 0; i < numberGroup.spots.length; i++) {
      const spot = numberGroup.spots[i];
      if (spot.pieceProperty.value !== null) {
        const numberPiece = spot.pieceProperty.value;
        spot.pieceProperty.value = null;
        numberPiece.positionProperty.value = spot.bounds.center.plus(numberGroup.positionProperty.value);
        if (spot.type === NumberSpotType.WHOLE) {
          numberPiece.scaleProperty.value = FractionsCommonConstants.WHOLE_FRACTIONAL_SIZE_RATIO;
        }
        this.activeNumberPieces.push(numberPiece);
        this.returnActiveNumberPiece(numberPiece);
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
  addShapeGroup(representation, maxContainers = FractionsCommonConstants.MAX_SHAPE_CONTAINERS) {
    const shapeGroup = new ShapeGroup(representation, {
      returnPieceListener: () => {
        this.removeLastPieceFromShapeGroup(shapeGroup);
      },
      maxContainers: maxContainers
    });
    this.dragGroupFromStack(shapeGroup);
    return shapeGroup;
  }

  /**
   * Adds a NumberGroup to the model (usually created from a stack)
   * @public
   *
   * @param {boolean} isMixedNumber
   * @returns {NumberGroup}
   */
  addNumberGroup(isMixedNumber) {
    const numberGroup = new NumberGroup(isMixedNumber, {
      activeNumberRangeProperty: this.activeNumberRangeProperty
    });
    this.dragGroupFromStack(numberGroup);
    return numberGroup;
  }

  /**
   * Animates the ShapeGroup back to its "home" stack.
   * @public
   *
   * @param {ShapeGroup} shapeGroup
   */
  returnShapeGroup(shapeGroup) {
    while (shapeGroup.hasAnyPieces()) {
      this.removeLastPieceFromShapeGroup(shapeGroup);
    }
    while (shapeGroup.shapeContainers.length > 1) {
      shapeGroup.decreaseContainerCount();
    }
    const shapeGroupStack = _.find(this.shapeGroupStacks, shapeGroupStack => shapeGroupStack.representation === shapeGroup.representation);
    const positionProperty = shapeGroupStack.positionProperty;
    shapeGroup.animator.animateTo({
      position: positionProperty.value,
      scale: FractionsCommonConstants.SHAPE_BUILD_SCALE,
      animationInvalidationProperty: positionProperty,
      endAnimationCallback: () => {
        this.shapeGroups.remove(shapeGroup);
        if (shapeGroupStack.isMutable) {
          shapeGroupStack.shapeGroups.push(shapeGroup);
        } else {
          shapeGroup.dispose();
        }
      }
    });
  }

  /**
   * Animates the NumberGroup back to its "home" stack.
   * @public
   *
   * @param {NumberGroup} numberGroup
   */
  returnNumberGroup(numberGroup) {
    while (numberGroup.hasAnyPieces()) {
      this.removeLastPieceFromNumberGroup(numberGroup);
    }
    const numberGroupStack = _.find(this.numberGroupStacks, numberGroupStack => numberGroupStack.isMixedNumber === numberGroup.isMixedNumber);
    const positionProperty = numberGroupStack.positionProperty;
    numberGroup.animator.animateTo({
      position: positionProperty.value,
      scale: FractionsCommonConstants.NUMBER_BUILD_SCALE,
      animationInvalidationProperty: positionProperty,
      endAnimationCallback: () => {
        this.numberGroups.remove(numberGroup);
        if (numberGroupStack.isMutable) {
          numberGroupStack.numberGroups.push(numberGroup);
        } else {
          numberGroup.dispose();
        }
      }
    });
  }

  /**
   * When our dragged number pieces change, we need to update our numeric range.
   * @private
   */
  updateDraggedNumberRange() {
    if (this.draggedNumberPieces.length === 0) {
      this.activeNumberRangeProperty.value = null;
    } else {
      let min = Number.POSITIVE_INFINITY;
      let max = Number.NEGATIVE_INFINITY;
      this.draggedNumberPieces.forEach(numberPiece => {
        min = Math.min(min, numberPiece.number);
        max = Math.max(max, numberPiece.number);
      });
      this.activeNumberRangeProperty.value = new Range(min, max);
    }
  }

  /**
   * Ends the animation of everything possible.
   * @public
   */
  endAnimation() {
    this.activeShapePieces.forEach(shapePiece => {
      shapePiece.animator.endAnimation();
    });
    this.activeNumberPieces.forEach(shapePiece => {
      shapePiece.animator.endAnimation();
    });
    this.shapeGroups.forEach(shapeGroup => {
      shapeGroup.animator.endAnimation();
    });
    this.numberGroups.forEach(numberGroup => {
      numberGroup.animator.endAnimation();
    });
  }

  /**
   * Returns the layout quantity of the "largest" stack.
   * @public
   *
   * @returns {number}
   */
  getLargestStackLayoutQuantity() {
    let quantity = 0;
    [...this.shapeStacks, ...this.numberStacks, ...this.shapeGroupStacks, ...this.numberGroupStacks].forEach(stack => {
      quantity = Math.max(quantity, stack.layoutQuantity);
    });
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
    this.numberGroups.forEach(numberGroup => {
      if (!numberGroup.isDisposed) {
        numberGroup.dispose();
      }
    });
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
  step(dt) {
    this.shapeGroups.forEach(shapeGroup => shapeGroup.step(dt));
    this.numberGroups.forEach(numberGroup => numberGroup.step(dt));
    this.activeShapePieces.forEach(shapePiece => {
      shapePiece.step(dt);

      // Don't compute the closest for ALL pieces, that would hurt performance.
      if (shapePiece.representation === BuildingRepresentation.PIE && shapePiece.isUserControlledProperty.value) {
        const closestContainer = this.closestDroppableShapeContainer(shapePiece, Number.POSITIVE_INFINITY);
        if (closestContainer) {
          shapePiece.orientTowardsContainer(closestContainer, dt);
        }
      }
    });
    this.activeNumberPieces.forEach(numberPiece => numberPiece.step(dt));
  }
}
fractionsCommon.register('BuildingModel', BuildingModel);
export default BuildingModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJQcm9wZXJ0eSIsIlJhbmdlIiwiVmVjdG9yMiIsIkVudW1lcmF0aW9uTWFwIiwiRWFzaW5nIiwiRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzIiwiZnJhY3Rpb25zQ29tbW9uIiwiQnVpbGRpbmdSZXByZXNlbnRhdGlvbiIsIkJ1aWxkaW5nVHlwZSIsIk51bWJlckdyb3VwIiwiTnVtYmVyU3BvdFR5cGUiLCJOdW1iZXJTdGFjayIsIlNoYXBlQ29udGFpbmVyIiwiU2hhcGVHcm91cCIsIlNoYXBlU3RhY2siLCJzY3JhdGNoVmVjdG9yIiwiQnVpbGRpbmdNb2RlbCIsImNvbnN0cnVjdG9yIiwic2hhcGVTdGFja3MiLCJudW1iZXJTdGFja3MiLCJzaGFwZUdyb3VwU3RhY2tzIiwibnVtYmVyR3JvdXBTdGFja3MiLCJzaGFwZUdyb3VwcyIsImFjdGl2ZVNoYXBlUGllY2VzIiwibnVtYmVyR3JvdXBzIiwiYWN0aXZlTnVtYmVyUGllY2VzIiwiZHJhZ2dlZE51bWJlclBpZWNlcyIsImFjdGl2ZU51bWJlclJhbmdlUHJvcGVydHkiLCJ2YWx1ZUNvbXBhcmlzb25TdHJhdGVneSIsInNlbGVjdGVkR3JvdXBQcm9wZXJ0eSIsInByZXZpb3VzbHlTZWxlY3RlZEdyb3VwUHJvcGVydHkiLCJsYXp5TGluayIsIm5ld1ZhbHVlIiwib2xkVmFsdWUiLCJ2YWx1ZSIsImdyb3VwU3RhY2tzTWFwIiwidHlwZSIsIlNIQVBFIiwiTlVNQkVSIiwiZ3JvdXBzTWFwIiwiYWN0aXZlUGllY2VzTWFwIiwiYXNzZXJ0IiwiZm9yRWFjaCIsImFjdGl2ZVBpZWNlcyIsImFkZEl0ZW1BZGRlZExpc3RlbmVyIiwibGVuZ3RoIiwiXyIsInVuaXEiLCJyYW5nZUxpc3RlbmVyIiwidXBkYXRlRHJhZ2dlZE51bWJlclJhbmdlIiwiYmluZCIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJkcmFnU2hhcGVQaWVjZUZyb21TdGFjayIsInNoYXBlUGllY2UiLCJwdXNoIiwiZHJhZ051bWJlclBpZWNlRnJvbVN0YWNrIiwibnVtYmVyUGllY2UiLCJkcmFnR3JvdXBGcm9tU3RhY2siLCJncm91cCIsImdldCIsImZpbmRNYXRjaGluZ1NoYXBlU3RhY2siLCJmaW5kIiwic3RhY2siLCJyZXByZXNlbnRhdGlvbiIsImZyYWN0aW9uIiwiZXF1YWxzIiwiZmluZE1hdGNoaW5nTnVtYmVyU3RhY2siLCJudW1iZXIiLCJnZXRTaGFwZVN0YWNrSW5kZXgiLCJzaGFwZVN0YWNrIiwic2hhcGVQaWVjZXMiLCJnZXROdW1iZXJTdGFja0luZGV4IiwibnVtYmVyU3RhY2siLCJudW1iZXJQaWVjZXMiLCJyZXR1cm5BY3RpdmVTaGFwZVBpZWNlIiwic2hhcGVNYXRyaXgiLCJnZXRTaGFwZU1hdHJpeCIsImFuaW1hdG9yIiwiYW5pbWF0ZVRvIiwicG9zaXRpb24iLCJwb3NpdGlvblByb3BlcnR5IiwicGx1cyIsInRpbWVzVmVjdG9yMiIsIlpFUk8iLCJ0aW1lc1NjYWxhciIsIlNIQVBFX0JVSUxEX1NDQUxFIiwicm90YXRpb24iLCJzY2FsZSIsInNoYWRvdyIsImFuaW1hdGlvbkludmFsaWRhdGlvblByb3BlcnR5IiwiZW5kQW5pbWF0aW9uQ2FsbGJhY2siLCJyZW1vdmUiLCJpc011dGFibGUiLCJyZXR1cm5BY3RpdmVOdW1iZXJQaWVjZSIsIm9mZnNldCIsImdldE9mZnNldCIsIk5VTUJFUl9CVUlMRF9TQ0FMRSIsInBsYWNlQWN0aXZlU2hhcGVQaWVjZSIsInNoYXBlQ29udGFpbmVyIiwic2hhcGVHcm91cCIsImdldFNoYXBlUmF0aW8iLCJlYXNpbmciLCJRVUFEUkFUSUNfSU5fT1VUIiwiY2xvc2VzdERyb3BwYWJsZVNoYXBlQ29udGFpbmVyIiwidGhyZXNob2xkIiwiY2xvc2VzdENvbnRhaW5lciIsImNsb3Nlc3REaXN0YW5jZSIsInBvaW50IiwibG9jYWxQb2ludCIsInNldCIsInN1YnRyYWN0Iiwic2hhcGVDb250YWluZXJzIiwiY2FuRml0UGllY2UiLCJkaXN0YW5jZSIsImRpc3RhbmNlRnJvbVBvaW50Iiwic2hhcGVQaWVjZURyb3BwZWQiLCJudW1iZXJQaWVjZURyb3BwZWQiLCJjbG9zZXN0U3BvdCIsIm51bWJlckdyb3VwIiwic3BvdHMiLCJzcG90IiwiY2FuUGxhY2VOdW1iZXJJblNwb3QiLCJNYXRoIiwic3FydCIsImJvdW5kcyIsIm1pbmltdW1EaXN0YW5jZVRvUG9pbnRTcXVhcmVkIiwicGxhY2VOdW1iZXJQaWVjZSIsIm51bWJlclNwb3QiLCJwaWVjZVByb3BlcnR5IiwicmVtb3ZlTGFzdFBpZWNlRnJvbVNoYXBlR3JvdXAiLCJpIiwicG9wIiwiZW5kQW5pbWF0aW9uIiwidG90YWxGcmFjdGlvblByb3BlcnR5IiwiY29udGFpbmVyUG9pbnQiLCJyb3RhdGlvblByb3BlcnR5IiwiRXJyb3IiLCJyZW1vdmVMYXN0UGllY2VGcm9tTnVtYmVyR3JvdXAiLCJjZW50ZXIiLCJXSE9MRSIsInNjYWxlUHJvcGVydHkiLCJXSE9MRV9GUkFDVElPTkFMX1NJWkVfUkFUSU8iLCJhZGRTaGFwZUdyb3VwIiwibWF4Q29udGFpbmVycyIsIk1BWF9TSEFQRV9DT05UQUlORVJTIiwicmV0dXJuUGllY2VMaXN0ZW5lciIsImFkZE51bWJlckdyb3VwIiwiaXNNaXhlZE51bWJlciIsInJldHVyblNoYXBlR3JvdXAiLCJoYXNBbnlQaWVjZXMiLCJkZWNyZWFzZUNvbnRhaW5lckNvdW50Iiwic2hhcGVHcm91cFN0YWNrIiwiZGlzcG9zZSIsInJldHVybk51bWJlckdyb3VwIiwibnVtYmVyR3JvdXBTdGFjayIsIm1pbiIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwibWF4IiwiTkVHQVRJVkVfSU5GSU5JVFkiLCJnZXRMYXJnZXN0U3RhY2tMYXlvdXRRdWFudGl0eSIsInF1YW50aXR5IiwibGF5b3V0UXVhbnRpdHkiLCJyZXNldCIsImlzRGlzcG9zZWQiLCJzdGVwIiwiZHQiLCJQSUUiLCJpc1VzZXJDb250cm9sbGVkUHJvcGVydHkiLCJvcmllbnRUb3dhcmRzQ29udGFpbmVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCdWlsZGluZ01vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIHJlcHJlc2VudGF0aW9uIGZvciB0aGUgcGllY2VzL3N0YWNrcy9ncm91cHMgZm9yIG51bWJlcnMvcGllcy9iYXJzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGNyZWF0ZU9ic2VydmFibGVBcnJheSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL2NyZWF0ZU9ic2VydmFibGVBcnJheS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uTWFwIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbk1hcC5qcyc7XHJcbmltcG9ydCBFYXNpbmcgZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvRWFzaW5nLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IGZyYWN0aW9uc0NvbW1vbiBmcm9tICcuLi8uLi9mcmFjdGlvbnNDb21tb24uanMnO1xyXG5pbXBvcnQgQnVpbGRpbmdSZXByZXNlbnRhdGlvbiBmcm9tICcuL0J1aWxkaW5nUmVwcmVzZW50YXRpb24uanMnO1xyXG5pbXBvcnQgQnVpbGRpbmdUeXBlIGZyb20gJy4vQnVpbGRpbmdUeXBlLmpzJztcclxuaW1wb3J0IE51bWJlckdyb3VwIGZyb20gJy4vTnVtYmVyR3JvdXAuanMnO1xyXG5pbXBvcnQgTnVtYmVyU3BvdFR5cGUgZnJvbSAnLi9OdW1iZXJTcG90VHlwZS5qcyc7XHJcbmltcG9ydCBOdW1iZXJTdGFjayBmcm9tICcuL051bWJlclN0YWNrLmpzJztcclxuaW1wb3J0IFNoYXBlQ29udGFpbmVyIGZyb20gJy4vU2hhcGVDb250YWluZXIuanMnO1xyXG5pbXBvcnQgU2hhcGVHcm91cCBmcm9tICcuL1NoYXBlR3JvdXAuanMnO1xyXG5pbXBvcnQgU2hhcGVTdGFjayBmcm9tICcuL1NoYXBlU3RhY2suanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IHNjcmF0Y2hWZWN0b3IgPSBuZXcgVmVjdG9yMiggMCwgMCApOyAvLyBVc2VkIHRvIG1pbmltaXplIGdhcmJhZ2UgY29sbGVjdGlvbiBieSByZXVzaW5nIGEgdmVjdG9yLlxyXG5cclxuY2xhc3MgQnVpbGRpbmdNb2RlbCB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPFNoYXBlU3RhY2s+fVxyXG4gICAgdGhpcy5zaGFwZVN0YWNrcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxOdW1iZXJTdGFjaz59XHJcbiAgICB0aGlzLm51bWJlclN0YWNrcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxTaGFwZUdyb3VwU3RhY2s+fVxyXG4gICAgdGhpcy5zaGFwZUdyb3VwU3RhY2tzID0gW107XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPE51bWJlckdyb3VwU3RhY2s+fVxyXG4gICAgdGhpcy5udW1iZXJHcm91cFN0YWNrcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge09ic2VydmFibGVBcnJheURlZi48U2hhcGVHcm91cD59XHJcbiAgICB0aGlzLnNoYXBlR3JvdXBzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7T2JzZXJ2YWJsZUFycmF5RGVmLjxTaGFwZVBpZWNlPn0gLSBTaGFwZSBwaWVjZXMgaW4gdGhlIHBsYXkgYXJlYSAoY29udHJvbGxlZCBvciBhbmltYXRpbmcpXHJcbiAgICB0aGlzLmFjdGl2ZVNoYXBlUGllY2VzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7T2JzZXJ2YWJsZUFycmF5RGVmLjxOdW1iZXJHcm91cD59XHJcbiAgICB0aGlzLm51bWJlckdyb3VwcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge09ic2VydmFibGVBcnJheURlZi48TnVtYmVyUGllY2U+fSAtIE51bWJlciBwaWVjZXMgaW4gdGhlIHBsYXkgYXJlYSAoY29udHJvbGxlZCBvciBhbmltYXRpbmcpXHJcbiAgICB0aGlzLmFjdGl2ZU51bWJlclBpZWNlcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtPYnNlcnZhYmxlQXJyYXlEZWYuPE51bWJlclBpZWNlPn0gLSBUcmFja2luZyBudW1iZXIgcGllY2VzIGJlaW5nIGRyYWdnZWQsIHNvIHdlIGNhbiBkZWNpZGUgd2hldGhlciBlYWNoXHJcbiAgICAvLyBudW1iZXIgZ3JvdXAgc2hvdWxkIHNob3cgYW55IFwiZG8gbm90IGRyb3AgaGVyZVwiIHN5bWJvbHMgb24gdGhlaXIgc3BvdHMuXHJcbiAgICB0aGlzLmRyYWdnZWROdW1iZXJQaWVjZXMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7UHJvcGVydHkuPFJhbmdlfG51bGw+fSAtIG51bGwgd2hlbiB0aGVyZSBhcmUgbm8gYWN0aXZlIG51bWJlcnMsIG90aGVyd2lzZSBhIHJhbmdlIG9mIGFsbCB2YWx1ZXMgYmVpbmdcclxuICAgIC8vIGRyYWdnZWQuXHJcbiAgICB0aGlzLmFjdGl2ZU51bWJlclJhbmdlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwsIHtcclxuICAgICAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdlcXVhbHNGdW5jdGlvbidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48R3JvdXB8bnVsbD59IC0gV2UnbGwgb25seSBzaG93IGNvbnRyb2xzIGZvciB0aGlzIGdyb3VwIChhbmQgdHJhY2sgdGhlIHByZXZpb3VzIHZhbHVlKVxyXG4gICAgdGhpcy5zZWxlY3RlZEdyb3VwUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwgKTtcclxuICAgIHRoaXMucHJldmlvdXNseVNlbGVjdGVkR3JvdXBQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbnVsbCApO1xyXG5cclxuICAgIC8vIEhvb2sgdXAgdGhlIGNvcnJlY3QgdmFsdWVzIGZvciBwcmV2aW91c2x5U2VsZWN0ZWRHcm91cFByb3BlcnR5IChubyBuZWVkIHRvIHVubGluayBkdWUgdG8gc2FtZSBsaWZldGltZSlcclxuICAgIHRoaXMuc2VsZWN0ZWRHcm91cFByb3BlcnR5LmxhenlMaW5rKCAoIG5ld1ZhbHVlLCBvbGRWYWx1ZSApID0+IHtcclxuICAgICAgaWYgKCBvbGRWYWx1ZSApIHtcclxuICAgICAgICB0aGlzLnByZXZpb3VzbHlTZWxlY3RlZEdyb3VwUHJvcGVydHkudmFsdWUgPSBvbGRWYWx1ZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0VudW1lcmF0aW9uTWFwLjxBcnJheS48U3RhY2s+Pn0gLSBUaGUgc3RhY2tzIGZvciBncm91cHNcclxuICAgIHRoaXMuZ3JvdXBTdGFja3NNYXAgPSBuZXcgRW51bWVyYXRpb25NYXAoIEJ1aWxkaW5nVHlwZSwgdHlwZSA9PiAoIHtcclxuICAgICAgWyBCdWlsZGluZ1R5cGUuU0hBUEUgXTogdGhpcy5zaGFwZUdyb3VwU3RhY2tzLFxyXG4gICAgICBbIEJ1aWxkaW5nVHlwZS5OVU1CRVIgXTogdGhpcy5udW1iZXJHcm91cFN0YWNrc1xyXG4gICAgfVsgdHlwZSBdICkgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtFbnVtZXJhdGlvbk1hcC48T2JzZXJ2YWJsZUFycmF5RGVmLjxHcm91cD4+fSAtIFRoZSBhcnJheXMgb2YgZ3JvdXBzXHJcbiAgICB0aGlzLmdyb3Vwc01hcCA9IG5ldyBFbnVtZXJhdGlvbk1hcCggQnVpbGRpbmdUeXBlLCB0eXBlID0+ICgge1xyXG4gICAgICBbIEJ1aWxkaW5nVHlwZS5TSEFQRSBdOiB0aGlzLnNoYXBlR3JvdXBzLFxyXG4gICAgICBbIEJ1aWxkaW5nVHlwZS5OVU1CRVIgXTogdGhpcy5udW1iZXJHcm91cHNcclxuICAgIH1bIHR5cGUgXSApICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RW51bWVyYXRpb25NYXAuPEFycmF5LjxTaGFwZVBpZWNlfE51bWJlclBpZWNlPj59IC0gVGhlIGFjdGl2ZSBwaWVjZXMgYXJyYXlzXHJcbiAgICB0aGlzLmFjdGl2ZVBpZWNlc01hcCA9IG5ldyBFbnVtZXJhdGlvbk1hcCggQnVpbGRpbmdUeXBlLCB0eXBlID0+ICgge1xyXG4gICAgICBbIEJ1aWxkaW5nVHlwZS5TSEFQRSBdOiB0aGlzLmFjdGl2ZVNoYXBlUGllY2VzLFxyXG4gICAgICBbIEJ1aWxkaW5nVHlwZS5OVU1CRVIgXTogdGhpcy5hY3RpdmVOdW1iZXJQaWVjZXNcclxuICAgIH1bIHR5cGUgXSApICk7XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIGR1cGxpY2F0ZXMgKGJ1dCBvbmx5IHdoZW4gYXNzZXJ0aW9ucyBhcmUgZW5hYmxlZClcclxuICAgIGFzc2VydCAmJiB0aGlzLmFjdGl2ZVBpZWNlc01hcC5mb3JFYWNoKCAoIGFjdGl2ZVBpZWNlcywgdHlwZSApID0+IHtcclxuICAgICAgYWN0aXZlUGllY2VzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgICAgYXNzZXJ0KCBhY3RpdmVQaWVjZXMubGVuZ3RoID09PSBfLnVuaXEoIGFjdGl2ZVBpZWNlcyApLmxlbmd0aCwgYER1cGxpY2F0ZSBpdGVtcyBzaG91bGQgbm90IGJlIGFkZGVkIHRvIGFjdGl2ZSBwaWVjZXMgZm9yICR7dHlwZX1gICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCByYW5nZUxpc3RlbmVyID0gdGhpcy51cGRhdGVEcmFnZ2VkTnVtYmVyUmFuZ2UuYmluZCggdGhpcyApO1xyXG4gICAgdGhpcy5kcmFnZ2VkTnVtYmVyUGllY2VzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCByYW5nZUxpc3RlbmVyICk7XHJcbiAgICB0aGlzLmRyYWdnZWROdW1iZXJQaWVjZXMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggcmFuZ2VMaXN0ZW5lciApO1xyXG4gICAgcmFuZ2VMaXN0ZW5lcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHVzZXIgZHJhZ3MgYSBzaGFwZSBwaWVjZSBmcm9tIGEgc3RhY2suXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTaGFwZVBpZWNlfSBzaGFwZVBpZWNlXHJcbiAgICovXHJcbiAgZHJhZ1NoYXBlUGllY2VGcm9tU3RhY2soIHNoYXBlUGllY2UgKSB7XHJcbiAgICB0aGlzLmFjdGl2ZVNoYXBlUGllY2VzLnB1c2goIHNoYXBlUGllY2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIHRoZSB1c2VyIGRyYWdzIGEgbnVtYmVyIHBpZWNlIGZyb20gYSBzdGFjay5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlclBpZWNlfSBudW1iZXJQaWVjZVxyXG4gICAqL1xyXG4gIGRyYWdOdW1iZXJQaWVjZUZyb21TdGFjayggbnVtYmVyUGllY2UgKSB7XHJcbiAgICB0aGlzLmFjdGl2ZU51bWJlclBpZWNlcy5wdXNoKCBudW1iZXJQaWVjZSApO1xyXG4gICAgdGhpcy5kcmFnZ2VkTnVtYmVyUGllY2VzLnB1c2goIG51bWJlclBpZWNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgdXNlciBkcmFncyBhIGdyb3VwIGZyb20gYSBzdGFjay5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0dyb3VwfSBncm91cFxyXG4gICAqL1xyXG4gIGRyYWdHcm91cEZyb21TdGFjayggZ3JvdXAgKSB7XHJcbiAgICB0aGlzLmdyb3Vwc01hcC5nZXQoIGdyb3VwLnR5cGUgKS5wdXNoKCBncm91cCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGNvcnJlc3BvbmRpbmcgU2hhcGVTdGFjayB0aGF0IHNob3VsZCBiZSB1c2VkIGFzIHRoZSBcImhvbWVcIiBvZiBhIGdpdmVuIFNoYXBlUGllY2UgKGlmIGl0J3MgcmV0dXJuZWQgZnJvbVxyXG4gICAqIHRoZSBwbGF5IGFyZWEgd2l0aCBhbiBhbmltYXRpb24sIGV0Yy4pXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTaGFwZVBpZWNlfSBzaGFwZVBpZWNlXHJcbiAgICogQHJldHVybnMge1NoYXBlU3RhY2t8bnVsbH1cclxuICAgKi9cclxuICBmaW5kTWF0Y2hpbmdTaGFwZVN0YWNrKCBzaGFwZVBpZWNlICkge1xyXG4gICAgcmV0dXJuIF8uZmluZCggdGhpcy5zaGFwZVN0YWNrcywgc3RhY2sgPT4gc3RhY2sucmVwcmVzZW50YXRpb24gPT09IHNoYXBlUGllY2UucmVwcmVzZW50YXRpb24gJiYgc3RhY2suZnJhY3Rpb24uZXF1YWxzKCBzaGFwZVBpZWNlLmZyYWN0aW9uICkgKSB8fCBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGNvcnJlc3BvbmRpbmcgTnVtYmVyU3RhY2sgdGhhdCBzaG91bGQgYmUgdXNlZCBhcyB0aGUgXCJob21lXCIgb2YgYSBnaXZlbiBOdW1iZXJQaWVjZSAoaWYgaXQncyByZXR1cm5lZCBmcm9tXHJcbiAgICogdGhlIHBsYXkgYXJlYSB3aXRoIGFuIGFuaW1hdGlvbiwgZXRjLilcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlclBpZWNlfSBudW1iZXJQaWVjZVxyXG4gICAqIEByZXR1cm5zIHtOdW1iZXJTdGFja3xudWxsfVxyXG4gICAqL1xyXG4gIGZpbmRNYXRjaGluZ051bWJlclN0YWNrKCBudW1iZXJQaWVjZSApIHtcclxuICAgIHJldHVybiBfLmZpbmQoIHRoaXMubnVtYmVyU3RhY2tzLCBzdGFjayA9PiBzdGFjay5udW1iZXIgPT09IG51bWJlclBpZWNlLm51bWJlciApIHx8IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBpbmRleCB0byB3aGljaCBwaWVjZXMgc2hvdWxkIGFuaW1hdGUgdG8gaW4gdGhlIHNoYXBlIHN0YWNrLlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2hhcGVTdGFja30gc2hhcGVTdGFja1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0U2hhcGVTdGFja0luZGV4KCBzaGFwZVN0YWNrICkge1xyXG4gICAgcmV0dXJuIHNoYXBlU3RhY2suc2hhcGVQaWVjZXMubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgaW5kZXggdG8gd2hpY2ggcGllY2VzIHNob3VsZCBhbmltYXRlIHRvIGluIHRoZSBudW1iZXIgc3RhY2suXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJTdGFja30gbnVtYmVyU3RhY2tcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldE51bWJlclN0YWNrSW5kZXgoIG51bWJlclN0YWNrICkge1xyXG4gICAgcmV0dXJuIG51bWJlclN0YWNrLm51bWJlclBpZWNlcy5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBbmltYXRlcyBhIHBpZWNlIGJhY2sgdG8gaXRzIFwiaG9tZVwiIHN0YWNrLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2hhcGVQaWVjZX0gc2hhcGVQaWVjZVxyXG4gICAqL1xyXG4gIHJldHVybkFjdGl2ZVNoYXBlUGllY2UoIHNoYXBlUGllY2UgKSB7XHJcbiAgICBjb25zdCBzaGFwZVN0YWNrID0gdGhpcy5maW5kTWF0Y2hpbmdTaGFwZVN0YWNrKCBzaGFwZVBpZWNlICk7XHJcbiAgICBjb25zdCBzaGFwZU1hdHJpeCA9IFNoYXBlU3RhY2suZ2V0U2hhcGVNYXRyaXgoIHNoYXBlUGllY2UuZnJhY3Rpb24sIHNoYXBlUGllY2UucmVwcmVzZW50YXRpb24sIHRoaXMuZ2V0U2hhcGVTdGFja0luZGV4KCBzaGFwZVN0YWNrICkgKTtcclxuICAgIHNoYXBlUGllY2UuYW5pbWF0b3IuYW5pbWF0ZVRvKCB7XHJcbiAgICAgIHBvc2l0aW9uOiBzaGFwZVN0YWNrLnBvc2l0aW9uUHJvcGVydHkudmFsdWUucGx1cyggc2hhcGVNYXRyaXgudGltZXNWZWN0b3IyKCBWZWN0b3IyLlpFUk8gKS50aW1lc1NjYWxhcihcclxuICAgICAgICBGcmFjdGlvbnNDb21tb25Db25zdGFudHMuU0hBUEVfQlVJTERfU0NBTEVcclxuICAgICAgKSApLFxyXG4gICAgICByb3RhdGlvbjogMCwgLy8gQWxsIHNoYXBlcyBvbiBidWlsZGluZy1iYXNlZCBzY3JlZW5zIGhhdmUgMCByb3RhdGlvbiBpbiB0aGVpciBzdGFja3NcclxuICAgICAgc2NhbGU6IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5TSEFQRV9CVUlMRF9TQ0FMRSxcclxuICAgICAgc2hhZG93OiAwLFxyXG4gICAgICBhbmltYXRpb25JbnZhbGlkYXRpb25Qcm9wZXJ0eTogc2hhcGVTdGFjay5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBlbmRBbmltYXRpb25DYWxsYmFjazogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlU2hhcGVQaWVjZXMucmVtb3ZlKCBzaGFwZVBpZWNlICk7XHJcbiAgICAgICAgaWYgKCBzaGFwZVN0YWNrLmlzTXV0YWJsZSApIHtcclxuICAgICAgICAgIHNoYXBlU3RhY2suc2hhcGVQaWVjZXMucHVzaCggc2hhcGVQaWVjZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQW5pbWF0ZXMgYSBwaWVjZSBiYWNrIHRvIGl0cyBcImhvbWVcIiBzdGFjay5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlclBpZWNlfSBudW1iZXJQaWVjZVxyXG4gICAqL1xyXG4gIHJldHVybkFjdGl2ZU51bWJlclBpZWNlKCBudW1iZXJQaWVjZSApIHtcclxuICAgIGNvbnN0IG51bWJlclN0YWNrID0gdGhpcy5maW5kTWF0Y2hpbmdOdW1iZXJTdGFjayggbnVtYmVyUGllY2UgKTtcclxuICAgIGNvbnN0IG9mZnNldCA9IE51bWJlclN0YWNrLmdldE9mZnNldCggdGhpcy5nZXROdW1iZXJTdGFja0luZGV4KCBudW1iZXJTdGFjayApICk7XHJcbiAgICBudW1iZXJQaWVjZS5hbmltYXRvci5hbmltYXRlVG8oIHtcclxuICAgICAgcG9zaXRpb246IG51bWJlclN0YWNrLnBvc2l0aW9uUHJvcGVydHkudmFsdWUucGx1cyggb2Zmc2V0LnRpbWVzU2NhbGFyKCBGcmFjdGlvbnNDb21tb25Db25zdGFudHMuTlVNQkVSX0JVSUxEX1NDQUxFICkgKSxcclxuICAgICAgc2NhbGU6IDEsXHJcbiAgICAgIGFuaW1hdGlvbkludmFsaWRhdGlvblByb3BlcnR5OiBudW1iZXJTdGFjay5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBlbmRBbmltYXRpb25DYWxsYmFjazogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlTnVtYmVyUGllY2VzLnJlbW92ZSggbnVtYmVyUGllY2UgKTtcclxuICAgICAgICBpZiAoIG51bWJlclN0YWNrLmlzTXV0YWJsZSApIHtcclxuICAgICAgICAgIG51bWJlclN0YWNrLm51bWJlclBpZWNlcy5wdXNoKCBudW1iZXJQaWVjZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGxhY2VzIGEgU2hhcGVQaWVjZSBpbnRvIGEgU2hhcGVDb250YWluZXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTaGFwZVBpZWNlfSBzaGFwZVBpZWNlXHJcbiAgICogQHBhcmFtIHtTaGFwZUNvbnRhaW5lcn0gc2hhcGVDb250YWluZXJcclxuICAgKiBAcGFyYW0ge1NoYXBlR3JvdXB9IHNoYXBlR3JvdXBcclxuICAgKi9cclxuICBwbGFjZUFjdGl2ZVNoYXBlUGllY2UoIHNoYXBlUGllY2UsIHNoYXBlQ29udGFpbmVyLCBzaGFwZUdyb3VwICkge1xyXG4gICAgc2hhcGVDb250YWluZXIuc2hhcGVQaWVjZXMucHVzaCggc2hhcGVQaWVjZSApO1xyXG5cclxuICAgIGNvbnN0IHNoYXBlTWF0cml4ID0gU2hhcGVDb250YWluZXIuZ2V0U2hhcGVNYXRyaXgoIHNoYXBlQ29udGFpbmVyLmdldFNoYXBlUmF0aW8oIHNoYXBlUGllY2UgKSwgc2hhcGVQaWVjZS5mcmFjdGlvbiwgc2hhcGVQaWVjZS5yZXByZXNlbnRhdGlvbiApO1xyXG4gICAgc2hhcGVQaWVjZS5hbmltYXRvci5hbmltYXRlVG8oIHtcclxuICAgICAgcG9zaXRpb246IHNoYXBlR3JvdXAucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCBzaGFwZUNvbnRhaW5lci5vZmZzZXQgKS5wbHVzKCBzaGFwZU1hdHJpeC50aW1lc1ZlY3RvcjIoIFZlY3RvcjIuWkVSTyApICksXHJcbiAgICAgIHJvdGF0aW9uOiBzaGFwZU1hdHJpeC5yb3RhdGlvbixcclxuICAgICAgc2NhbGU6IDEsXHJcbiAgICAgIHNoYWRvdzogMCxcclxuICAgICAgYW5pbWF0aW9uSW52YWxpZGF0aW9uUHJvcGVydHk6IHNoYXBlR3JvdXAucG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgZWFzaW5nOiBFYXNpbmcuUVVBRFJBVElDX0lOX09VVCxcclxuICAgICAgZW5kQW5pbWF0aW9uQ2FsbGJhY2s6ICgpID0+IHtcclxuICAgICAgICB0aGlzLmFjdGl2ZVNoYXBlUGllY2VzLnJlbW92ZSggc2hhcGVQaWVjZSApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zZWxlY3RlZEdyb3VwUHJvcGVydHkudmFsdWUgPSBzaGFwZUdyb3VwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY2xvc2VzdCBTaGFwZUNvbnRhaW5lciB0aGF0IHRoZSBnaXZlbiBzaGFwZSBwaWVjZSBjb3VsZCBiZSBkcm9wcGVkIG9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2hhcGVQaWVjZX0gc2hhcGVQaWVjZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aHJlc2hvbGQgLSBIb3cgbXVjaCBkaXN0YW5jZSBjYW4gYmUgYWxsb3dlZCBiZXR3ZWVuIHRoZSB0d28gZm9yIGl0IHRvIGJlIGRyb3BwYWJsZS5cclxuICAgKiBAcmV0dXJucyB7U2hhcGVDb250YWluZXJ8bnVsbH1cclxuICAgKi9cclxuICBjbG9zZXN0RHJvcHBhYmxlU2hhcGVDb250YWluZXIoIHNoYXBlUGllY2UsIHRocmVzaG9sZCApIHtcclxuICAgIGxldCBjbG9zZXN0Q29udGFpbmVyID0gbnVsbDtcclxuICAgIGxldCBjbG9zZXN0RGlzdGFuY2UgPSB0aHJlc2hvbGQ7XHJcblxyXG4gICAgY29uc3QgcG9pbnQgPSBzaGFwZVBpZWNlLnBvc2l0aW9uUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgdGhpcy5zaGFwZUdyb3Vwcy5mb3JFYWNoKCBzaGFwZUdyb3VwID0+IHtcclxuICAgICAgY29uc3QgbG9jYWxQb2ludCA9IHNjcmF0Y2hWZWN0b3Iuc2V0KCBwb2ludCApLnN1YnRyYWN0KCBzaGFwZUdyb3VwLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuXHJcbiAgICAgIHNoYXBlR3JvdXAuc2hhcGVDb250YWluZXJzLmZvckVhY2goIHNoYXBlQ29udGFpbmVyID0+IHtcclxuICAgICAgICBpZiAoIHNoYXBlQ29udGFpbmVyLmNhbkZpdFBpZWNlKCBzaGFwZVBpZWNlICkgKSB7XHJcbiAgICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHNoYXBlQ29udGFpbmVyLmRpc3RhbmNlRnJvbVBvaW50KCBsb2NhbFBvaW50ICk7XHJcbiAgICAgICAgICBpZiAoIGRpc3RhbmNlIDw9IGNsb3Nlc3REaXN0YW5jZSApIHtcclxuICAgICAgICAgICAgY2xvc2VzdERpc3RhbmNlID0gZGlzdGFuY2U7XHJcbiAgICAgICAgICAgIGNsb3Nlc3RDb250YWluZXIgPSBzaGFwZUNvbnRhaW5lcjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gY2xvc2VzdENvbnRhaW5lcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGEgU2hhcGVQaWVjZSBpcyBkcm9wcGVkIGJ5IHRoZSB1c2VyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2hhcGVQaWVjZX0gc2hhcGVQaWVjZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aHJlc2hvbGQgLSBIb3cgbXVjaCBkaXN0YW5jZSB0byBhbGxvdyBiZXR3ZWVuIHRoZSBwaWVjZSBhbmQgYSBjb250YWluZXIvZ3JvdXAgZm9yIGl0IHRvIGJlXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyb3BwZWQgaW5zaWRlLlxyXG4gICAqL1xyXG4gIHNoYXBlUGllY2VEcm9wcGVkKCBzaGFwZVBpZWNlLCB0aHJlc2hvbGQgKSB7XHJcbiAgICBjb25zdCBjbG9zZXN0Q29udGFpbmVyID0gdGhpcy5jbG9zZXN0RHJvcHBhYmxlU2hhcGVDb250YWluZXIoIHNoYXBlUGllY2UsIHRocmVzaG9sZCApO1xyXG5cclxuICAgIGlmICggY2xvc2VzdENvbnRhaW5lciApIHtcclxuICAgICAgdGhpcy5wbGFjZUFjdGl2ZVNoYXBlUGllY2UoIHNoYXBlUGllY2UsIGNsb3Nlc3RDb250YWluZXIsIGNsb3Nlc3RDb250YWluZXIuc2hhcGVHcm91cCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMucmV0dXJuQWN0aXZlU2hhcGVQaWVjZSggc2hhcGVQaWVjZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gYSBOdW1iZXJQaWVjZSBpcyBkcm9wcGVkIGJ5IHRoZSB1c2VyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyUGllY2V9IG51bWJlclBpZWNlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRocmVzaG9sZCAtIEhvdyBtdWNoIGRpc3RhbmNlIHRvIGFsbG93IGJldHdlZW4gdGhlIHBpZWNlIGFuZCBhIGNvbnRhaW5lci9ncm91cCBmb3IgaXQgdG8gYmVcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJvcHBlZCBpbnNpZGUuXHJcbiAgICovXHJcbiAgbnVtYmVyUGllY2VEcm9wcGVkKCBudW1iZXJQaWVjZSwgdGhyZXNob2xkICkge1xyXG4gICAgbGV0IGNsb3Nlc3RTcG90ID0gbnVsbDtcclxuICAgIGxldCBjbG9zZXN0RGlzdGFuY2UgPSB0aHJlc2hvbGQ7XHJcblxyXG4gICAgY29uc3QgcG9pbnQgPSBudW1iZXJQaWVjZS5wb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIHRoaXMubnVtYmVyR3JvdXBzLmZvckVhY2goIG51bWJlckdyb3VwID0+IHtcclxuICAgICAgY29uc3QgbG9jYWxQb2ludCA9IHNjcmF0Y2hWZWN0b3Iuc2V0KCBwb2ludCApLnN1YnRyYWN0KCBudW1iZXJHcm91cC5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgICBudW1iZXJHcm91cC5zcG90cy5mb3JFYWNoKCBzcG90ID0+IHtcclxuICAgICAgICBpZiAoIG51bWJlckdyb3VwLmNhblBsYWNlTnVtYmVySW5TcG90KCBudW1iZXJQaWVjZS5udW1iZXIsIHNwb3QgKSApIHtcclxuICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KCBzcG90LmJvdW5kcy5taW5pbXVtRGlzdGFuY2VUb1BvaW50U3F1YXJlZCggbG9jYWxQb2ludCApICk7XHJcbiAgICAgICAgICBpZiAoIGRpc3RhbmNlIDw9IGNsb3Nlc3REaXN0YW5jZSApIHtcclxuICAgICAgICAgICAgY2xvc2VzdERpc3RhbmNlID0gZGlzdGFuY2U7XHJcbiAgICAgICAgICAgIGNsb3Nlc3RTcG90ID0gc3BvdDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmRyYWdnZWROdW1iZXJQaWVjZXMucmVtb3ZlKCBudW1iZXJQaWVjZSApO1xyXG5cclxuICAgIGlmICggY2xvc2VzdFNwb3QgKSB7XHJcbiAgICAgIC8vIEluc3RhbnQgbGlrZSB0aGUgb2xkIHNpbSAoZm9yIG5vdylcclxuICAgICAgdGhpcy5wbGFjZU51bWJlclBpZWNlKCBjbG9zZXN0U3BvdCwgbnVtYmVyUGllY2UgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnJldHVybkFjdGl2ZU51bWJlclBpZWNlKCBudW1iZXJQaWVjZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGxhY2VzIGEgTnVtYmVyUGllY2UgaW4gYSBOdW1iZXJTcG90XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJTcG90fSBudW1iZXJTcG90XHJcbiAgICogQHBhcmFtIHtOdW1iZXJQaWVjZX0gbnVtYmVyUGllY2VcclxuICAgKi9cclxuICBwbGFjZU51bWJlclBpZWNlKCBudW1iZXJTcG90LCBudW1iZXJQaWVjZSApIHtcclxuICAgIG51bWJlclNwb3QucGllY2VQcm9wZXJ0eS52YWx1ZSA9IG51bWJlclBpZWNlO1xyXG4gICAgdGhpcy5hY3RpdmVOdW1iZXJQaWVjZXMucmVtb3ZlKCBudW1iZXJQaWVjZSApO1xyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWRHcm91cFByb3BlcnR5LnZhbHVlID0gbnVtYmVyU3BvdC5udW1iZXJHcm91cDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgdGhlIGxhc3QgcGllY2UgZnJvbSBhIFNoYXBlR3JvdXAgKGFuaW1hdGluZyBpdCBiYWNrIHRvIGl0cyBob21lIHN0YWNrKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NoYXBlR3JvdXB9IHNoYXBlR3JvdXBcclxuICAgKi9cclxuICByZW1vdmVMYXN0UGllY2VGcm9tU2hhcGVHcm91cCggc2hhcGVHcm91cCApIHtcclxuICAgIGZvciAoIGxldCBpID0gc2hhcGVHcm91cC5zaGFwZUNvbnRhaW5lcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgIGNvbnN0IHNoYXBlQ29udGFpbmVyID0gc2hhcGVHcm91cC5zaGFwZUNvbnRhaW5lcnMuZ2V0KCBpICk7XHJcbiAgICAgIGlmICggc2hhcGVDb250YWluZXIuc2hhcGVQaWVjZXMubGVuZ3RoICkge1xyXG4gICAgICAgIGNvbnN0IHNoYXBlUGllY2UgPSBzaGFwZUNvbnRhaW5lci5zaGFwZVBpZWNlcy5wb3AoKTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIHBpZWNlIGhhc24ndCBhcnJpdmVkIHlldCwganVzdCBjb21wbGV0ZSB0aGUgYW5pbWF0aW9uXHJcbiAgICAgICAgc2hhcGVQaWVjZS5hbmltYXRvci5lbmRBbmltYXRpb24oKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc2hhcGVNYXRyaXggPSBTaGFwZUNvbnRhaW5lci5nZXRTaGFwZU1hdHJpeCggc2hhcGVDb250YWluZXIudG90YWxGcmFjdGlvblByb3BlcnR5LnZhbHVlLnZhbHVlLCBzaGFwZVBpZWNlLmZyYWN0aW9uLCBzaGFwZVBpZWNlLnJlcHJlc2VudGF0aW9uICk7XHJcbiAgICAgICAgY29uc3QgY29udGFpbmVyUG9pbnQgPSBzaGFwZUdyb3VwLnBvc2l0aW9uUHJvcGVydHkudmFsdWUucGx1cyggc2hhcGVDb250YWluZXIub2Zmc2V0ICk7XHJcbiAgICAgICAgc2hhcGVQaWVjZS5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gY29udGFpbmVyUG9pbnQucGx1cyggc2hhcGVNYXRyaXgudGltZXNWZWN0b3IyKCBWZWN0b3IyLlpFUk8gKSApO1xyXG4gICAgICAgIHNoYXBlUGllY2Uucm90YXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHNoYXBlTWF0cml4LnJvdGF0aW9uO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlU2hhcGVQaWVjZXMucHVzaCggc2hhcGVQaWVjZSApO1xyXG4gICAgICAgIHRoaXMucmV0dXJuQWN0aXZlU2hhcGVQaWVjZSggc2hhcGVQaWVjZSApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnQ291bGQgbm90IGZpbmQgYSBwaWVjZSB0byByZW1vdmUnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIHRoZSBsYXN0IHBpZWNlIGZyb20gYSBOdW1iZXJHcm91cCAoYW5pbWF0aW5nIGl0IGJhY2sgdG8gaXRzIGhvbWUgc3RhY2spLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyR3JvdXB9IG51bWJlckdyb3VwXHJcbiAgICovXHJcbiAgcmVtb3ZlTGFzdFBpZWNlRnJvbU51bWJlckdyb3VwKCBudW1iZXJHcm91cCApIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlckdyb3VwLnNwb3RzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBzcG90ID0gbnVtYmVyR3JvdXAuc3BvdHNbIGkgXTtcclxuICAgICAgaWYgKCBzcG90LnBpZWNlUHJvcGVydHkudmFsdWUgIT09IG51bGwgKSB7XHJcbiAgICAgICAgY29uc3QgbnVtYmVyUGllY2UgPSBzcG90LnBpZWNlUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgc3BvdC5waWVjZVByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuXHJcbiAgICAgICAgbnVtYmVyUGllY2UucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHNwb3QuYm91bmRzLmNlbnRlci5wbHVzKCBudW1iZXJHcm91cC5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgICAgaWYgKCBzcG90LnR5cGUgPT09IE51bWJlclNwb3RUeXBlLldIT0xFICkge1xyXG4gICAgICAgICAgbnVtYmVyUGllY2Uuc2NhbGVQcm9wZXJ0eS52YWx1ZSA9IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5XSE9MRV9GUkFDVElPTkFMX1NJWkVfUkFUSU87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYWN0aXZlTnVtYmVyUGllY2VzLnB1c2goIG51bWJlclBpZWNlICk7XHJcbiAgICAgICAgdGhpcy5yZXR1cm5BY3RpdmVOdW1iZXJQaWVjZSggbnVtYmVyUGllY2UgKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBTaGFwZUdyb3VwIHRvIHRoZSBtb2RlbCAodXN1YWxseSBjcmVhdGVkIGZyb20gYSBzdGFjaylcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0J1aWxkaW5nUmVwcmVzZW50YXRpb259IHJlcHJlc2VudGF0aW9uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFttYXhDb250YWluZXJzXVxyXG4gICAqIEByZXR1cm5zIHtTaGFwZUdyb3VwfVxyXG4gICAqL1xyXG4gIGFkZFNoYXBlR3JvdXAoIHJlcHJlc2VudGF0aW9uLCBtYXhDb250YWluZXJzID0gRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLk1BWF9TSEFQRV9DT05UQUlORVJTICkge1xyXG4gICAgY29uc3Qgc2hhcGVHcm91cCA9IG5ldyBTaGFwZUdyb3VwKCByZXByZXNlbnRhdGlvbiwge1xyXG4gICAgICByZXR1cm5QaWVjZUxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVMYXN0UGllY2VGcm9tU2hhcGVHcm91cCggc2hhcGVHcm91cCApO1xyXG4gICAgICB9LFxyXG4gICAgICBtYXhDb250YWluZXJzOiBtYXhDb250YWluZXJzXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmRyYWdHcm91cEZyb21TdGFjayggc2hhcGVHcm91cCApO1xyXG4gICAgcmV0dXJuIHNoYXBlR3JvdXA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgTnVtYmVyR3JvdXAgdG8gdGhlIG1vZGVsICh1c3VhbGx5IGNyZWF0ZWQgZnJvbSBhIHN0YWNrKVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNNaXhlZE51bWJlclxyXG4gICAqIEByZXR1cm5zIHtOdW1iZXJHcm91cH1cclxuICAgKi9cclxuICBhZGROdW1iZXJHcm91cCggaXNNaXhlZE51bWJlciApIHtcclxuICAgIGNvbnN0IG51bWJlckdyb3VwID0gbmV3IE51bWJlckdyb3VwKCBpc01peGVkTnVtYmVyLCB7XHJcbiAgICAgIGFjdGl2ZU51bWJlclJhbmdlUHJvcGVydHk6IHRoaXMuYWN0aXZlTnVtYmVyUmFuZ2VQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5kcmFnR3JvdXBGcm9tU3RhY2soIG51bWJlckdyb3VwICk7XHJcblxyXG4gICAgcmV0dXJuIG51bWJlckdyb3VwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQW5pbWF0ZXMgdGhlIFNoYXBlR3JvdXAgYmFjayB0byBpdHMgXCJob21lXCIgc3RhY2suXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTaGFwZUdyb3VwfSBzaGFwZUdyb3VwXHJcbiAgICovXHJcbiAgcmV0dXJuU2hhcGVHcm91cCggc2hhcGVHcm91cCApIHtcclxuICAgIHdoaWxlICggc2hhcGVHcm91cC5oYXNBbnlQaWVjZXMoKSApIHtcclxuICAgICAgdGhpcy5yZW1vdmVMYXN0UGllY2VGcm9tU2hhcGVHcm91cCggc2hhcGVHcm91cCApO1xyXG4gICAgfVxyXG5cclxuICAgIHdoaWxlICggc2hhcGVHcm91cC5zaGFwZUNvbnRhaW5lcnMubGVuZ3RoID4gMSApIHtcclxuICAgICAgc2hhcGVHcm91cC5kZWNyZWFzZUNvbnRhaW5lckNvdW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc2hhcGVHcm91cFN0YWNrID0gXy5maW5kKCB0aGlzLnNoYXBlR3JvdXBTdGFja3MsIHNoYXBlR3JvdXBTdGFjayA9PiBzaGFwZUdyb3VwU3RhY2sucmVwcmVzZW50YXRpb24gPT09IHNoYXBlR3JvdXAucmVwcmVzZW50YXRpb24gKTtcclxuICAgIGNvbnN0IHBvc2l0aW9uUHJvcGVydHkgPSBzaGFwZUdyb3VwU3RhY2sucG9zaXRpb25Qcm9wZXJ0eTtcclxuICAgIHNoYXBlR3JvdXAuYW5pbWF0b3IuYW5pbWF0ZVRvKCB7XHJcbiAgICAgIHBvc2l0aW9uOiBwb3NpdGlvblByb3BlcnR5LnZhbHVlLFxyXG4gICAgICBzY2FsZTogRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLlNIQVBFX0JVSUxEX1NDQUxFLFxyXG4gICAgICBhbmltYXRpb25JbnZhbGlkYXRpb25Qcm9wZXJ0eTogcG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgZW5kQW5pbWF0aW9uQ2FsbGJhY2s6ICgpID0+IHtcclxuICAgICAgICB0aGlzLnNoYXBlR3JvdXBzLnJlbW92ZSggc2hhcGVHcm91cCApO1xyXG4gICAgICAgIGlmICggc2hhcGVHcm91cFN0YWNrLmlzTXV0YWJsZSApIHtcclxuICAgICAgICAgIHNoYXBlR3JvdXBTdGFjay5zaGFwZUdyb3Vwcy5wdXNoKCBzaGFwZUdyb3VwICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgc2hhcGVHcm91cC5kaXNwb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBbmltYXRlcyB0aGUgTnVtYmVyR3JvdXAgYmFjayB0byBpdHMgXCJob21lXCIgc3RhY2suXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJHcm91cH0gbnVtYmVyR3JvdXBcclxuICAgKi9cclxuICByZXR1cm5OdW1iZXJHcm91cCggbnVtYmVyR3JvdXAgKSB7XHJcbiAgICB3aGlsZSAoIG51bWJlckdyb3VwLmhhc0FueVBpZWNlcygpICkge1xyXG4gICAgICB0aGlzLnJlbW92ZUxhc3RQaWVjZUZyb21OdW1iZXJHcm91cCggbnVtYmVyR3JvdXAgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBudW1iZXJHcm91cFN0YWNrID0gXy5maW5kKCB0aGlzLm51bWJlckdyb3VwU3RhY2tzLCBudW1iZXJHcm91cFN0YWNrID0+IG51bWJlckdyb3VwU3RhY2suaXNNaXhlZE51bWJlciA9PT0gbnVtYmVyR3JvdXAuaXNNaXhlZE51bWJlciApO1xyXG4gICAgY29uc3QgcG9zaXRpb25Qcm9wZXJ0eSA9IG51bWJlckdyb3VwU3RhY2sucG9zaXRpb25Qcm9wZXJ0eTtcclxuICAgIG51bWJlckdyb3VwLmFuaW1hdG9yLmFuaW1hdGVUbygge1xyXG4gICAgICBwb3NpdGlvbjogcG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgc2NhbGU6IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5OVU1CRVJfQlVJTERfU0NBTEUsXHJcbiAgICAgIGFuaW1hdGlvbkludmFsaWRhdGlvblByb3BlcnR5OiBwb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBlbmRBbmltYXRpb25DYWxsYmFjazogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMubnVtYmVyR3JvdXBzLnJlbW92ZSggbnVtYmVyR3JvdXAgKTtcclxuICAgICAgICBpZiAoIG51bWJlckdyb3VwU3RhY2suaXNNdXRhYmxlICkge1xyXG4gICAgICAgICAgbnVtYmVyR3JvdXBTdGFjay5udW1iZXJHcm91cHMucHVzaCggbnVtYmVyR3JvdXAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBudW1iZXJHcm91cC5kaXNwb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGVuIG91ciBkcmFnZ2VkIG51bWJlciBwaWVjZXMgY2hhbmdlLCB3ZSBuZWVkIHRvIHVwZGF0ZSBvdXIgbnVtZXJpYyByYW5nZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZURyYWdnZWROdW1iZXJSYW5nZSgpIHtcclxuICAgIGlmICggdGhpcy5kcmFnZ2VkTnVtYmVyUGllY2VzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgdGhpcy5hY3RpdmVOdW1iZXJSYW5nZVByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBsZXQgbWluID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgICBsZXQgbWF4ID0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZO1xyXG5cclxuICAgICAgdGhpcy5kcmFnZ2VkTnVtYmVyUGllY2VzLmZvckVhY2goIG51bWJlclBpZWNlID0+IHtcclxuICAgICAgICBtaW4gPSBNYXRoLm1pbiggbWluLCBudW1iZXJQaWVjZS5udW1iZXIgKTtcclxuICAgICAgICBtYXggPSBNYXRoLm1heCggbWF4LCBudW1iZXJQaWVjZS5udW1iZXIgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgdGhpcy5hY3RpdmVOdW1iZXJSYW5nZVByb3BlcnR5LnZhbHVlID0gbmV3IFJhbmdlKCBtaW4sIG1heCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRW5kcyB0aGUgYW5pbWF0aW9uIG9mIGV2ZXJ5dGhpbmcgcG9zc2libGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGVuZEFuaW1hdGlvbigpIHtcclxuICAgIHRoaXMuYWN0aXZlU2hhcGVQaWVjZXMuZm9yRWFjaCggc2hhcGVQaWVjZSA9PiB7XHJcbiAgICAgIHNoYXBlUGllY2UuYW5pbWF0b3IuZW5kQW5pbWF0aW9uKCk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFjdGl2ZU51bWJlclBpZWNlcy5mb3JFYWNoKCBzaGFwZVBpZWNlID0+IHtcclxuICAgICAgc2hhcGVQaWVjZS5hbmltYXRvci5lbmRBbmltYXRpb24oKTtcclxuICAgIH0gKTtcclxuICAgIHRoaXMuc2hhcGVHcm91cHMuZm9yRWFjaCggc2hhcGVHcm91cCA9PiB7XHJcbiAgICAgIHNoYXBlR3JvdXAuYW5pbWF0b3IuZW5kQW5pbWF0aW9uKCk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLm51bWJlckdyb3Vwcy5mb3JFYWNoKCBudW1iZXJHcm91cCA9PiB7XHJcbiAgICAgIG51bWJlckdyb3VwLmFuaW1hdG9yLmVuZEFuaW1hdGlvbigpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbGF5b3V0IHF1YW50aXR5IG9mIHRoZSBcImxhcmdlc3RcIiBzdGFjay5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldExhcmdlc3RTdGFja0xheW91dFF1YW50aXR5KCkge1xyXG4gICAgbGV0IHF1YW50aXR5ID0gMDtcclxuICAgIFtcclxuICAgICAgLi4udGhpcy5zaGFwZVN0YWNrcyxcclxuICAgICAgLi4udGhpcy5udW1iZXJTdGFja3MsXHJcbiAgICAgIC4uLnRoaXMuc2hhcGVHcm91cFN0YWNrcyxcclxuICAgICAgLi4udGhpcy5udW1iZXJHcm91cFN0YWNrc1xyXG4gICAgXS5mb3JFYWNoKCBzdGFjayA9PiB7XHJcbiAgICAgIHF1YW50aXR5ID0gTWF0aC5tYXgoIHF1YW50aXR5LCBzdGFjay5sYXlvdXRRdWFudGl0eSApO1xyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIHF1YW50aXR5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSBtb2RlbC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLmVuZEFuaW1hdGlvbigpO1xyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWRHcm91cFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNoYXBlR3JvdXBzLnJlc2V0KCk7XHJcbiAgICB0aGlzLm51bWJlckdyb3Vwcy5mb3JFYWNoKCBudW1iZXJHcm91cCA9PiB7XHJcbiAgICAgIGlmICggIW51bWJlckdyb3VwLmlzRGlzcG9zZWQgKSB7XHJcbiAgICAgICAgbnVtYmVyR3JvdXAuZGlzcG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLm51bWJlckdyb3Vwcy5yZXNldCgpO1xyXG4gICAgdGhpcy5hY3RpdmVTaGFwZVBpZWNlcy5yZXNldCgpO1xyXG4gICAgdGhpcy5hY3RpdmVOdW1iZXJQaWVjZXMucmVzZXQoKTtcclxuICAgIHRoaXMuZHJhZ2dlZE51bWJlclBpZWNlcy5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcHMgZm9yd2FyZCBpbiB0aW1lLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgdGhpcy5zaGFwZUdyb3Vwcy5mb3JFYWNoKCBzaGFwZUdyb3VwID0+IHNoYXBlR3JvdXAuc3RlcCggZHQgKSApO1xyXG4gICAgdGhpcy5udW1iZXJHcm91cHMuZm9yRWFjaCggbnVtYmVyR3JvdXAgPT4gbnVtYmVyR3JvdXAuc3RlcCggZHQgKSApO1xyXG5cclxuICAgIHRoaXMuYWN0aXZlU2hhcGVQaWVjZXMuZm9yRWFjaCggc2hhcGVQaWVjZSA9PiB7XHJcbiAgICAgIHNoYXBlUGllY2Uuc3RlcCggZHQgKTtcclxuXHJcbiAgICAgIC8vIERvbid0IGNvbXB1dGUgdGhlIGNsb3Nlc3QgZm9yIEFMTCBwaWVjZXMsIHRoYXQgd291bGQgaHVydCBwZXJmb3JtYW5jZS5cclxuICAgICAgaWYgKCBzaGFwZVBpZWNlLnJlcHJlc2VudGF0aW9uID09PSBCdWlsZGluZ1JlcHJlc2VudGF0aW9uLlBJRSAmJiBzaGFwZVBpZWNlLmlzVXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICBjb25zdCBjbG9zZXN0Q29udGFpbmVyID0gdGhpcy5jbG9zZXN0RHJvcHBhYmxlU2hhcGVDb250YWluZXIoIHNoYXBlUGllY2UsIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSApO1xyXG4gICAgICAgIGlmICggY2xvc2VzdENvbnRhaW5lciApIHtcclxuICAgICAgICAgIHNoYXBlUGllY2Uub3JpZW50VG93YXJkc0NvbnRhaW5lciggY2xvc2VzdENvbnRhaW5lciwgZHQgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFjdGl2ZU51bWJlclBpZWNlcy5mb3JFYWNoKCBudW1iZXJQaWVjZSA9PiBudW1iZXJQaWVjZS5zdGVwKCBkdCApICk7XHJcbiAgfVxyXG59XHJcblxyXG5mcmFjdGlvbnNDb21tb24ucmVnaXN0ZXIoICdCdWlsZGluZ01vZGVsJywgQnVpbGRpbmdNb2RlbCApO1xyXG5leHBvcnQgZGVmYXVsdCBCdWlsZGluZ01vZGVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxxQkFBcUIsTUFBTSw4Q0FBOEM7QUFDaEYsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsY0FBYyxNQUFNLDRDQUE0QztBQUN2RSxPQUFPQyxNQUFNLE1BQU0sZ0NBQWdDO0FBQ25ELE9BQU9DLHdCQUF3QixNQUFNLDBDQUEwQztBQUMvRSxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLHNCQUFzQixNQUFNLDZCQUE2QjtBQUNoRSxPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBQzVDLE9BQU9DLFdBQVcsTUFBTSxrQkFBa0I7QUFDMUMsT0FBT0MsY0FBYyxNQUFNLHFCQUFxQjtBQUNoRCxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBQzFDLE9BQU9DLGNBQWMsTUFBTSxxQkFBcUI7QUFDaEQsT0FBT0MsVUFBVSxNQUFNLGlCQUFpQjtBQUN4QyxPQUFPQyxVQUFVLE1BQU0saUJBQWlCOztBQUV4QztBQUNBLE1BQU1DLGFBQWEsR0FBRyxJQUFJYixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRTNDLE1BQU1jLGFBQWEsQ0FBQztFQUNsQkMsV0FBV0EsQ0FBQSxFQUFHO0lBRVo7SUFDQSxJQUFJLENBQUNDLFdBQVcsR0FBRyxFQUFFOztJQUVyQjtJQUNBLElBQUksQ0FBQ0MsWUFBWSxHQUFHLEVBQUU7O0lBRXRCO0lBQ0EsSUFBSSxDQUFDQyxnQkFBZ0IsR0FBRyxFQUFFOztJQUUxQjtJQUNBLElBQUksQ0FBQ0MsaUJBQWlCLEdBQUcsRUFBRTs7SUFFM0I7SUFDQSxJQUFJLENBQUNDLFdBQVcsR0FBR3ZCLHFCQUFxQixDQUFDLENBQUM7O0lBRTFDO0lBQ0EsSUFBSSxDQUFDd0IsaUJBQWlCLEdBQUd4QixxQkFBcUIsQ0FBQyxDQUFDOztJQUVoRDtJQUNBLElBQUksQ0FBQ3lCLFlBQVksR0FBR3pCLHFCQUFxQixDQUFDLENBQUM7O0lBRTNDO0lBQ0EsSUFBSSxDQUFDMEIsa0JBQWtCLEdBQUcxQixxQkFBcUIsQ0FBQyxDQUFDOztJQUVqRDtJQUNBO0lBQ0EsSUFBSSxDQUFDMkIsbUJBQW1CLEdBQUczQixxQkFBcUIsQ0FBQyxDQUFDOztJQUVsRDtJQUNBO0lBQ0EsSUFBSSxDQUFDNEIseUJBQXlCLEdBQUcsSUFBSTNCLFFBQVEsQ0FBRSxJQUFJLEVBQUU7TUFDbkQ0Qix1QkFBdUIsRUFBRTtJQUMzQixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNDLHFCQUFxQixHQUFHLElBQUk3QixRQUFRLENBQUUsSUFBSyxDQUFDO0lBQ2pELElBQUksQ0FBQzhCLCtCQUErQixHQUFHLElBQUk5QixRQUFRLENBQUUsSUFBSyxDQUFDOztJQUUzRDtJQUNBLElBQUksQ0FBQzZCLHFCQUFxQixDQUFDRSxRQUFRLENBQUUsQ0FBRUMsUUFBUSxFQUFFQyxRQUFRLEtBQU07TUFDN0QsSUFBS0EsUUFBUSxFQUFHO1FBQ2QsSUFBSSxDQUFDSCwrQkFBK0IsQ0FBQ0ksS0FBSyxHQUFHRCxRQUFRO01BQ3ZEO0lBQ0YsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDRSxjQUFjLEdBQUcsSUFBSWhDLGNBQWMsQ0FBRUssWUFBWSxFQUFFNEIsSUFBSSxJQUFNO01BQ2hFLENBQUU1QixZQUFZLENBQUM2QixLQUFLLEdBQUksSUFBSSxDQUFDakIsZ0JBQWdCO01BQzdDLENBQUVaLFlBQVksQ0FBQzhCLE1BQU0sR0FBSSxJQUFJLENBQUNqQjtJQUNoQyxDQUFDLEVBQUVlLElBQUksQ0FBSyxDQUFDOztJQUViO0lBQ0EsSUFBSSxDQUFDRyxTQUFTLEdBQUcsSUFBSXBDLGNBQWMsQ0FBRUssWUFBWSxFQUFFNEIsSUFBSSxJQUFNO01BQzNELENBQUU1QixZQUFZLENBQUM2QixLQUFLLEdBQUksSUFBSSxDQUFDZixXQUFXO01BQ3hDLENBQUVkLFlBQVksQ0FBQzhCLE1BQU0sR0FBSSxJQUFJLENBQUNkO0lBQ2hDLENBQUMsRUFBRVksSUFBSSxDQUFLLENBQUM7O0lBRWI7SUFDQSxJQUFJLENBQUNJLGVBQWUsR0FBRyxJQUFJckMsY0FBYyxDQUFFSyxZQUFZLEVBQUU0QixJQUFJLElBQU07TUFDakUsQ0FBRTVCLFlBQVksQ0FBQzZCLEtBQUssR0FBSSxJQUFJLENBQUNkLGlCQUFpQjtNQUM5QyxDQUFFZixZQUFZLENBQUM4QixNQUFNLEdBQUksSUFBSSxDQUFDYjtJQUNoQyxDQUFDLEVBQUVXLElBQUksQ0FBSyxDQUFDOztJQUViO0lBQ0FLLE1BQU0sSUFBSSxJQUFJLENBQUNELGVBQWUsQ0FBQ0UsT0FBTyxDQUFFLENBQUVDLFlBQVksRUFBRVAsSUFBSSxLQUFNO01BQ2hFTyxZQUFZLENBQUNDLG9CQUFvQixDQUFFLE1BQU07UUFDdkNILE1BQU0sQ0FBRUUsWUFBWSxDQUFDRSxNQUFNLEtBQUtDLENBQUMsQ0FBQ0MsSUFBSSxDQUFFSixZQUFhLENBQUMsQ0FBQ0UsTUFBTSxFQUFHLDREQUEyRFQsSUFBSyxFQUFFLENBQUM7TUFDckksQ0FBRSxDQUFDO0lBQ0wsQ0FBRSxDQUFDO0lBRUgsTUFBTVksYUFBYSxHQUFHLElBQUksQ0FBQ0Msd0JBQXdCLENBQUNDLElBQUksQ0FBRSxJQUFLLENBQUM7SUFDaEUsSUFBSSxDQUFDeEIsbUJBQW1CLENBQUNrQixvQkFBb0IsQ0FBRUksYUFBYyxDQUFDO0lBQzlELElBQUksQ0FBQ3RCLG1CQUFtQixDQUFDeUIsc0JBQXNCLENBQUVILGFBQWMsQ0FBQztJQUNoRUEsYUFBYSxDQUFDLENBQUM7RUFDakI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VJLHVCQUF1QkEsQ0FBRUMsVUFBVSxFQUFHO0lBQ3BDLElBQUksQ0FBQzlCLGlCQUFpQixDQUFDK0IsSUFBSSxDQUFFRCxVQUFXLENBQUM7RUFDM0M7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLHdCQUF3QkEsQ0FBRUMsV0FBVyxFQUFHO0lBQ3RDLElBQUksQ0FBQy9CLGtCQUFrQixDQUFDNkIsSUFBSSxDQUFFRSxXQUFZLENBQUM7SUFDM0MsSUFBSSxDQUFDOUIsbUJBQW1CLENBQUM0QixJQUFJLENBQUVFLFdBQVksQ0FBQztFQUM5Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsa0JBQWtCQSxDQUFFQyxLQUFLLEVBQUc7SUFDMUIsSUFBSSxDQUFDbkIsU0FBUyxDQUFDb0IsR0FBRyxDQUFFRCxLQUFLLENBQUN0QixJQUFLLENBQUMsQ0FBQ2tCLElBQUksQ0FBRUksS0FBTSxDQUFDO0VBQ2hEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsc0JBQXNCQSxDQUFFUCxVQUFVLEVBQUc7SUFDbkMsT0FBT1AsQ0FBQyxDQUFDZSxJQUFJLENBQUUsSUFBSSxDQUFDM0MsV0FBVyxFQUFFNEMsS0FBSyxJQUFJQSxLQUFLLENBQUNDLGNBQWMsS0FBS1YsVUFBVSxDQUFDVSxjQUFjLElBQUlELEtBQUssQ0FBQ0UsUUFBUSxDQUFDQyxNQUFNLENBQUVaLFVBQVUsQ0FBQ1csUUFBUyxDQUFFLENBQUMsSUFBSSxJQUFJO0VBQ3hKOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsdUJBQXVCQSxDQUFFVixXQUFXLEVBQUc7SUFDckMsT0FBT1YsQ0FBQyxDQUFDZSxJQUFJLENBQUUsSUFBSSxDQUFDMUMsWUFBWSxFQUFFMkMsS0FBSyxJQUFJQSxLQUFLLENBQUNLLE1BQU0sS0FBS1gsV0FBVyxDQUFDVyxNQUFPLENBQUMsSUFBSSxJQUFJO0VBQzFGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLGtCQUFrQkEsQ0FBRUMsVUFBVSxFQUFHO0lBQy9CLE9BQU9BLFVBQVUsQ0FBQ0MsV0FBVyxDQUFDekIsTUFBTTtFQUN0Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFMEIsbUJBQW1CQSxDQUFFQyxXQUFXLEVBQUc7SUFDakMsT0FBT0EsV0FBVyxDQUFDQyxZQUFZLENBQUM1QixNQUFNO0VBQ3hDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFNkIsc0JBQXNCQSxDQUFFckIsVUFBVSxFQUFHO0lBQ25DLE1BQU1nQixVQUFVLEdBQUcsSUFBSSxDQUFDVCxzQkFBc0IsQ0FBRVAsVUFBVyxDQUFDO0lBQzVELE1BQU1zQixXQUFXLEdBQUc3RCxVQUFVLENBQUM4RCxjQUFjLENBQUV2QixVQUFVLENBQUNXLFFBQVEsRUFBRVgsVUFBVSxDQUFDVSxjQUFjLEVBQUUsSUFBSSxDQUFDSyxrQkFBa0IsQ0FBRUMsVUFBVyxDQUFFLENBQUM7SUFDdEloQixVQUFVLENBQUN3QixRQUFRLENBQUNDLFNBQVMsQ0FBRTtNQUM3QkMsUUFBUSxFQUFFVixVQUFVLENBQUNXLGdCQUFnQixDQUFDOUMsS0FBSyxDQUFDK0MsSUFBSSxDQUFFTixXQUFXLENBQUNPLFlBQVksQ0FBRWhGLE9BQU8sQ0FBQ2lGLElBQUssQ0FBQyxDQUFDQyxXQUFXLENBQ3BHL0Usd0JBQXdCLENBQUNnRixpQkFDM0IsQ0FBRSxDQUFDO01BQ0hDLFFBQVEsRUFBRSxDQUFDO01BQUU7TUFDYkMsS0FBSyxFQUFFbEYsd0JBQXdCLENBQUNnRixpQkFBaUI7TUFDakRHLE1BQU0sRUFBRSxDQUFDO01BQ1RDLDZCQUE2QixFQUFFcEIsVUFBVSxDQUFDVyxnQkFBZ0I7TUFDMURVLG9CQUFvQixFQUFFQSxDQUFBLEtBQU07UUFDMUIsSUFBSSxDQUFDbkUsaUJBQWlCLENBQUNvRSxNQUFNLENBQUV0QyxVQUFXLENBQUM7UUFDM0MsSUFBS2dCLFVBQVUsQ0FBQ3VCLFNBQVMsRUFBRztVQUMxQnZCLFVBQVUsQ0FBQ0MsV0FBVyxDQUFDaEIsSUFBSSxDQUFFRCxVQUFXLENBQUM7UUFDM0M7TUFDRjtJQUNGLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFd0MsdUJBQXVCQSxDQUFFckMsV0FBVyxFQUFHO0lBQ3JDLE1BQU1nQixXQUFXLEdBQUcsSUFBSSxDQUFDTix1QkFBdUIsQ0FBRVYsV0FBWSxDQUFDO0lBQy9ELE1BQU1zQyxNQUFNLEdBQUduRixXQUFXLENBQUNvRixTQUFTLENBQUUsSUFBSSxDQUFDeEIsbUJBQW1CLENBQUVDLFdBQVksQ0FBRSxDQUFDO0lBQy9FaEIsV0FBVyxDQUFDcUIsUUFBUSxDQUFDQyxTQUFTLENBQUU7TUFDOUJDLFFBQVEsRUFBRVAsV0FBVyxDQUFDUSxnQkFBZ0IsQ0FBQzlDLEtBQUssQ0FBQytDLElBQUksQ0FBRWEsTUFBTSxDQUFDVixXQUFXLENBQUUvRSx3QkFBd0IsQ0FBQzJGLGtCQUFtQixDQUFFLENBQUM7TUFDdEhULEtBQUssRUFBRSxDQUFDO01BQ1JFLDZCQUE2QixFQUFFakIsV0FBVyxDQUFDUSxnQkFBZ0I7TUFDM0RVLG9CQUFvQixFQUFFQSxDQUFBLEtBQU07UUFDMUIsSUFBSSxDQUFDakUsa0JBQWtCLENBQUNrRSxNQUFNLENBQUVuQyxXQUFZLENBQUM7UUFDN0MsSUFBS2dCLFdBQVcsQ0FBQ29CLFNBQVMsRUFBRztVQUMzQnBCLFdBQVcsQ0FBQ0MsWUFBWSxDQUFDbkIsSUFBSSxDQUFFRSxXQUFZLENBQUM7UUFDOUM7TUFDRjtJQUNGLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRXlDLHFCQUFxQkEsQ0FBRTVDLFVBQVUsRUFBRTZDLGNBQWMsRUFBRUMsVUFBVSxFQUFHO0lBQzlERCxjQUFjLENBQUM1QixXQUFXLENBQUNoQixJQUFJLENBQUVELFVBQVcsQ0FBQztJQUU3QyxNQUFNc0IsV0FBVyxHQUFHL0QsY0FBYyxDQUFDZ0UsY0FBYyxDQUFFc0IsY0FBYyxDQUFDRSxhQUFhLENBQUUvQyxVQUFXLENBQUMsRUFBRUEsVUFBVSxDQUFDVyxRQUFRLEVBQUVYLFVBQVUsQ0FBQ1UsY0FBZSxDQUFDO0lBQy9JVixVQUFVLENBQUN3QixRQUFRLENBQUNDLFNBQVMsQ0FBRTtNQUM3QkMsUUFBUSxFQUFFb0IsVUFBVSxDQUFDbkIsZ0JBQWdCLENBQUM5QyxLQUFLLENBQUMrQyxJQUFJLENBQUVpQixjQUFjLENBQUNKLE1BQU8sQ0FBQyxDQUFDYixJQUFJLENBQUVOLFdBQVcsQ0FBQ08sWUFBWSxDQUFFaEYsT0FBTyxDQUFDaUYsSUFBSyxDQUFFLENBQUM7TUFDMUhHLFFBQVEsRUFBRVgsV0FBVyxDQUFDVyxRQUFRO01BQzlCQyxLQUFLLEVBQUUsQ0FBQztNQUNSQyxNQUFNLEVBQUUsQ0FBQztNQUNUQyw2QkFBNkIsRUFBRVUsVUFBVSxDQUFDbkIsZ0JBQWdCO01BQzFEcUIsTUFBTSxFQUFFakcsTUFBTSxDQUFDa0csZ0JBQWdCO01BQy9CWixvQkFBb0IsRUFBRUEsQ0FBQSxLQUFNO1FBQzFCLElBQUksQ0FBQ25FLGlCQUFpQixDQUFDb0UsTUFBTSxDQUFFdEMsVUFBVyxDQUFDO01BQzdDO0lBQ0YsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDeEIscUJBQXFCLENBQUNLLEtBQUssR0FBR2lFLFVBQVU7RUFDL0M7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSSw4QkFBOEJBLENBQUVsRCxVQUFVLEVBQUVtRCxTQUFTLEVBQUc7SUFDdEQsSUFBSUMsZ0JBQWdCLEdBQUcsSUFBSTtJQUMzQixJQUFJQyxlQUFlLEdBQUdGLFNBQVM7SUFFL0IsTUFBTUcsS0FBSyxHQUFHdEQsVUFBVSxDQUFDMkIsZ0JBQWdCLENBQUM5QyxLQUFLO0lBRS9DLElBQUksQ0FBQ1osV0FBVyxDQUFDb0IsT0FBTyxDQUFFeUQsVUFBVSxJQUFJO01BQ3RDLE1BQU1TLFVBQVUsR0FBRzdGLGFBQWEsQ0FBQzhGLEdBQUcsQ0FBRUYsS0FBTSxDQUFDLENBQUNHLFFBQVEsQ0FBRVgsVUFBVSxDQUFDbkIsZ0JBQWdCLENBQUM5QyxLQUFNLENBQUM7TUFFM0ZpRSxVQUFVLENBQUNZLGVBQWUsQ0FBQ3JFLE9BQU8sQ0FBRXdELGNBQWMsSUFBSTtRQUNwRCxJQUFLQSxjQUFjLENBQUNjLFdBQVcsQ0FBRTNELFVBQVcsQ0FBQyxFQUFHO1VBQzlDLE1BQU00RCxRQUFRLEdBQUdmLGNBQWMsQ0FBQ2dCLGlCQUFpQixDQUFFTixVQUFXLENBQUM7VUFDL0QsSUFBS0ssUUFBUSxJQUFJUCxlQUFlLEVBQUc7WUFDakNBLGVBQWUsR0FBR08sUUFBUTtZQUMxQlIsZ0JBQWdCLEdBQUdQLGNBQWM7VUFDbkM7UUFDRjtNQUNGLENBQUUsQ0FBQztJQUNMLENBQUUsQ0FBQztJQUVILE9BQU9PLGdCQUFnQjtFQUN6Qjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VVLGlCQUFpQkEsQ0FBRTlELFVBQVUsRUFBRW1ELFNBQVMsRUFBRztJQUN6QyxNQUFNQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUNGLDhCQUE4QixDQUFFbEQsVUFBVSxFQUFFbUQsU0FBVSxDQUFDO0lBRXJGLElBQUtDLGdCQUFnQixFQUFHO01BQ3RCLElBQUksQ0FBQ1IscUJBQXFCLENBQUU1QyxVQUFVLEVBQUVvRCxnQkFBZ0IsRUFBRUEsZ0JBQWdCLENBQUNOLFVBQVcsQ0FBQztJQUN6RixDQUFDLE1BQ0k7TUFDSCxJQUFJLENBQUN6QixzQkFBc0IsQ0FBRXJCLFVBQVcsQ0FBQztJQUMzQztFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRStELGtCQUFrQkEsQ0FBRTVELFdBQVcsRUFBRWdELFNBQVMsRUFBRztJQUMzQyxJQUFJYSxXQUFXLEdBQUcsSUFBSTtJQUN0QixJQUFJWCxlQUFlLEdBQUdGLFNBQVM7SUFFL0IsTUFBTUcsS0FBSyxHQUFHbkQsV0FBVyxDQUFDd0IsZ0JBQWdCLENBQUM5QyxLQUFLO0lBRWhELElBQUksQ0FBQ1YsWUFBWSxDQUFDa0IsT0FBTyxDQUFFNEUsV0FBVyxJQUFJO01BQ3hDLE1BQU1WLFVBQVUsR0FBRzdGLGFBQWEsQ0FBQzhGLEdBQUcsQ0FBRUYsS0FBTSxDQUFDLENBQUNHLFFBQVEsQ0FBRVEsV0FBVyxDQUFDdEMsZ0JBQWdCLENBQUM5QyxLQUFNLENBQUM7TUFFNUZvRixXQUFXLENBQUNDLEtBQUssQ0FBQzdFLE9BQU8sQ0FBRThFLElBQUksSUFBSTtRQUNqQyxJQUFLRixXQUFXLENBQUNHLG9CQUFvQixDQUFFakUsV0FBVyxDQUFDVyxNQUFNLEVBQUVxRCxJQUFLLENBQUMsRUFBRztVQUNsRSxNQUFNUCxRQUFRLEdBQUdTLElBQUksQ0FBQ0MsSUFBSSxDQUFFSCxJQUFJLENBQUNJLE1BQU0sQ0FBQ0MsNkJBQTZCLENBQUVqQixVQUFXLENBQUUsQ0FBQztVQUNyRixJQUFLSyxRQUFRLElBQUlQLGVBQWUsRUFBRztZQUNqQ0EsZUFBZSxHQUFHTyxRQUFRO1lBQzFCSSxXQUFXLEdBQUdHLElBQUk7VUFDcEI7UUFDRjtNQUNGLENBQUUsQ0FBQztJQUNMLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQzlGLG1CQUFtQixDQUFDaUUsTUFBTSxDQUFFbkMsV0FBWSxDQUFDO0lBRTlDLElBQUs2RCxXQUFXLEVBQUc7TUFDakI7TUFDQSxJQUFJLENBQUNTLGdCQUFnQixDQUFFVCxXQUFXLEVBQUU3RCxXQUFZLENBQUM7SUFDbkQsQ0FBQyxNQUNJO01BQ0gsSUFBSSxDQUFDcUMsdUJBQXVCLENBQUVyQyxXQUFZLENBQUM7SUFDN0M7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFc0UsZ0JBQWdCQSxDQUFFQyxVQUFVLEVBQUV2RSxXQUFXLEVBQUc7SUFDMUN1RSxVQUFVLENBQUNDLGFBQWEsQ0FBQzlGLEtBQUssR0FBR3NCLFdBQVc7SUFDNUMsSUFBSSxDQUFDL0Isa0JBQWtCLENBQUNrRSxNQUFNLENBQUVuQyxXQUFZLENBQUM7SUFFN0MsSUFBSSxDQUFDM0IscUJBQXFCLENBQUNLLEtBQUssR0FBRzZGLFVBQVUsQ0FBQ1QsV0FBVztFQUMzRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVcsNkJBQTZCQSxDQUFFOUIsVUFBVSxFQUFHO0lBQzFDLEtBQU0sSUFBSStCLENBQUMsR0FBRy9CLFVBQVUsQ0FBQ1ksZUFBZSxDQUFDbEUsTUFBTSxHQUFHLENBQUMsRUFBRXFGLENBQUMsSUFBSSxDQUFDLEVBQUVBLENBQUMsRUFBRSxFQUFHO01BQ2pFLE1BQU1oQyxjQUFjLEdBQUdDLFVBQVUsQ0FBQ1ksZUFBZSxDQUFDcEQsR0FBRyxDQUFFdUUsQ0FBRSxDQUFDO01BQzFELElBQUtoQyxjQUFjLENBQUM1QixXQUFXLENBQUN6QixNQUFNLEVBQUc7UUFDdkMsTUFBTVEsVUFBVSxHQUFHNkMsY0FBYyxDQUFDNUIsV0FBVyxDQUFDNkQsR0FBRyxDQUFDLENBQUM7O1FBRW5EO1FBQ0E5RSxVQUFVLENBQUN3QixRQUFRLENBQUN1RCxZQUFZLENBQUMsQ0FBQztRQUVsQyxNQUFNekQsV0FBVyxHQUFHL0QsY0FBYyxDQUFDZ0UsY0FBYyxDQUFFc0IsY0FBYyxDQUFDbUMscUJBQXFCLENBQUNuRyxLQUFLLENBQUNBLEtBQUssRUFBRW1CLFVBQVUsQ0FBQ1csUUFBUSxFQUFFWCxVQUFVLENBQUNVLGNBQWUsQ0FBQztRQUNySixNQUFNdUUsY0FBYyxHQUFHbkMsVUFBVSxDQUFDbkIsZ0JBQWdCLENBQUM5QyxLQUFLLENBQUMrQyxJQUFJLENBQUVpQixjQUFjLENBQUNKLE1BQU8sQ0FBQztRQUN0RnpDLFVBQVUsQ0FBQzJCLGdCQUFnQixDQUFDOUMsS0FBSyxHQUFHb0csY0FBYyxDQUFDckQsSUFBSSxDQUFFTixXQUFXLENBQUNPLFlBQVksQ0FBRWhGLE9BQU8sQ0FBQ2lGLElBQUssQ0FBRSxDQUFDO1FBQ25HOUIsVUFBVSxDQUFDa0YsZ0JBQWdCLENBQUNyRyxLQUFLLEdBQUd5QyxXQUFXLENBQUNXLFFBQVE7UUFDeEQsSUFBSSxDQUFDL0QsaUJBQWlCLENBQUMrQixJQUFJLENBQUVELFVBQVcsQ0FBQztRQUN6QyxJQUFJLENBQUNxQixzQkFBc0IsQ0FBRXJCLFVBQVcsQ0FBQztRQUN6QztNQUNGO0lBQ0Y7SUFDQSxNQUFNLElBQUltRixLQUFLLENBQUUsa0NBQW1DLENBQUM7RUFDdkQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLDhCQUE4QkEsQ0FBRW5CLFdBQVcsRUFBRztJQUM1QyxLQUFNLElBQUlZLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR1osV0FBVyxDQUFDQyxLQUFLLENBQUMxRSxNQUFNLEVBQUVxRixDQUFDLEVBQUUsRUFBRztNQUNuRCxNQUFNVixJQUFJLEdBQUdGLFdBQVcsQ0FBQ0MsS0FBSyxDQUFFVyxDQUFDLENBQUU7TUFDbkMsSUFBS1YsSUFBSSxDQUFDUSxhQUFhLENBQUM5RixLQUFLLEtBQUssSUFBSSxFQUFHO1FBQ3ZDLE1BQU1zQixXQUFXLEdBQUdnRSxJQUFJLENBQUNRLGFBQWEsQ0FBQzlGLEtBQUs7UUFDNUNzRixJQUFJLENBQUNRLGFBQWEsQ0FBQzlGLEtBQUssR0FBRyxJQUFJO1FBRS9Cc0IsV0FBVyxDQUFDd0IsZ0JBQWdCLENBQUM5QyxLQUFLLEdBQUdzRixJQUFJLENBQUNJLE1BQU0sQ0FBQ2MsTUFBTSxDQUFDekQsSUFBSSxDQUFFcUMsV0FBVyxDQUFDdEMsZ0JBQWdCLENBQUM5QyxLQUFNLENBQUM7UUFDbEcsSUFBS3NGLElBQUksQ0FBQ3BGLElBQUksS0FBSzFCLGNBQWMsQ0FBQ2lJLEtBQUssRUFBRztVQUN4Q25GLFdBQVcsQ0FBQ29GLGFBQWEsQ0FBQzFHLEtBQUssR0FBRzdCLHdCQUF3QixDQUFDd0ksMkJBQTJCO1FBQ3hGO1FBQ0EsSUFBSSxDQUFDcEgsa0JBQWtCLENBQUM2QixJQUFJLENBQUVFLFdBQVksQ0FBQztRQUMzQyxJQUFJLENBQUNxQyx1QkFBdUIsQ0FBRXJDLFdBQVksQ0FBQztRQUMzQztNQUNGO0lBQ0Y7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VzRixhQUFhQSxDQUFFL0UsY0FBYyxFQUFFZ0YsYUFBYSxHQUFHMUksd0JBQXdCLENBQUMySSxvQkFBb0IsRUFBRztJQUM3RixNQUFNN0MsVUFBVSxHQUFHLElBQUl0RixVQUFVLENBQUVrRCxjQUFjLEVBQUU7TUFDakRrRixtQkFBbUIsRUFBRUEsQ0FBQSxLQUFNO1FBQ3pCLElBQUksQ0FBQ2hCLDZCQUE2QixDQUFFOUIsVUFBVyxDQUFDO01BQ2xELENBQUM7TUFDRDRDLGFBQWEsRUFBRUE7SUFDakIsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDdEYsa0JBQWtCLENBQUUwQyxVQUFXLENBQUM7SUFDckMsT0FBT0EsVUFBVTtFQUNuQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFK0MsY0FBY0EsQ0FBRUMsYUFBYSxFQUFHO0lBQzlCLE1BQU03QixXQUFXLEdBQUcsSUFBSTdHLFdBQVcsQ0FBRTBJLGFBQWEsRUFBRTtNQUNsRHhILHlCQUF5QixFQUFFLElBQUksQ0FBQ0E7SUFDbEMsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDOEIsa0JBQWtCLENBQUU2RCxXQUFZLENBQUM7SUFFdEMsT0FBT0EsV0FBVztFQUNwQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRThCLGdCQUFnQkEsQ0FBRWpELFVBQVUsRUFBRztJQUM3QixPQUFRQSxVQUFVLENBQUNrRCxZQUFZLENBQUMsQ0FBQyxFQUFHO01BQ2xDLElBQUksQ0FBQ3BCLDZCQUE2QixDQUFFOUIsVUFBVyxDQUFDO0lBQ2xEO0lBRUEsT0FBUUEsVUFBVSxDQUFDWSxlQUFlLENBQUNsRSxNQUFNLEdBQUcsQ0FBQyxFQUFHO01BQzlDc0QsVUFBVSxDQUFDbUQsc0JBQXNCLENBQUMsQ0FBQztJQUNyQztJQUVBLE1BQU1DLGVBQWUsR0FBR3pHLENBQUMsQ0FBQ2UsSUFBSSxDQUFFLElBQUksQ0FBQ3pDLGdCQUFnQixFQUFFbUksZUFBZSxJQUFJQSxlQUFlLENBQUN4RixjQUFjLEtBQUtvQyxVQUFVLENBQUNwQyxjQUFlLENBQUM7SUFDeEksTUFBTWlCLGdCQUFnQixHQUFHdUUsZUFBZSxDQUFDdkUsZ0JBQWdCO0lBQ3pEbUIsVUFBVSxDQUFDdEIsUUFBUSxDQUFDQyxTQUFTLENBQUU7TUFDN0JDLFFBQVEsRUFBRUMsZ0JBQWdCLENBQUM5QyxLQUFLO01BQ2hDcUQsS0FBSyxFQUFFbEYsd0JBQXdCLENBQUNnRixpQkFBaUI7TUFDakRJLDZCQUE2QixFQUFFVCxnQkFBZ0I7TUFDL0NVLG9CQUFvQixFQUFFQSxDQUFBLEtBQU07UUFDMUIsSUFBSSxDQUFDcEUsV0FBVyxDQUFDcUUsTUFBTSxDQUFFUSxVQUFXLENBQUM7UUFDckMsSUFBS29ELGVBQWUsQ0FBQzNELFNBQVMsRUFBRztVQUMvQjJELGVBQWUsQ0FBQ2pJLFdBQVcsQ0FBQ2dDLElBQUksQ0FBRTZDLFVBQVcsQ0FBQztRQUNoRCxDQUFDLE1BQ0k7VUFDSEEsVUFBVSxDQUFDcUQsT0FBTyxDQUFDLENBQUM7UUFDdEI7TUFDRjtJQUNGLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxpQkFBaUJBLENBQUVuQyxXQUFXLEVBQUc7SUFDL0IsT0FBUUEsV0FBVyxDQUFDK0IsWUFBWSxDQUFDLENBQUMsRUFBRztNQUNuQyxJQUFJLENBQUNaLDhCQUE4QixDQUFFbkIsV0FBWSxDQUFDO0lBQ3BEO0lBRUEsTUFBTW9DLGdCQUFnQixHQUFHNUcsQ0FBQyxDQUFDZSxJQUFJLENBQUUsSUFBSSxDQUFDeEMsaUJBQWlCLEVBQUVxSSxnQkFBZ0IsSUFBSUEsZ0JBQWdCLENBQUNQLGFBQWEsS0FBSzdCLFdBQVcsQ0FBQzZCLGFBQWMsQ0FBQztJQUMzSSxNQUFNbkUsZ0JBQWdCLEdBQUcwRSxnQkFBZ0IsQ0FBQzFFLGdCQUFnQjtJQUMxRHNDLFdBQVcsQ0FBQ3pDLFFBQVEsQ0FBQ0MsU0FBUyxDQUFFO01BQzlCQyxRQUFRLEVBQUVDLGdCQUFnQixDQUFDOUMsS0FBSztNQUNoQ3FELEtBQUssRUFBRWxGLHdCQUF3QixDQUFDMkYsa0JBQWtCO01BQ2xEUCw2QkFBNkIsRUFBRVQsZ0JBQWdCO01BQy9DVSxvQkFBb0IsRUFBRUEsQ0FBQSxLQUFNO1FBQzFCLElBQUksQ0FBQ2xFLFlBQVksQ0FBQ21FLE1BQU0sQ0FBRTJCLFdBQVksQ0FBQztRQUN2QyxJQUFLb0MsZ0JBQWdCLENBQUM5RCxTQUFTLEVBQUc7VUFDaEM4RCxnQkFBZ0IsQ0FBQ2xJLFlBQVksQ0FBQzhCLElBQUksQ0FBRWdFLFdBQVksQ0FBQztRQUNuRCxDQUFDLE1BQ0k7VUFDSEEsV0FBVyxDQUFDa0MsT0FBTyxDQUFDLENBQUM7UUFDdkI7TUFDRjtJQUNGLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0V2Ryx3QkFBd0JBLENBQUEsRUFBRztJQUN6QixJQUFLLElBQUksQ0FBQ3ZCLG1CQUFtQixDQUFDbUIsTUFBTSxLQUFLLENBQUMsRUFBRztNQUMzQyxJQUFJLENBQUNsQix5QkFBeUIsQ0FBQ08sS0FBSyxHQUFHLElBQUk7SUFDN0MsQ0FBQyxNQUNJO01BQ0gsSUFBSXlILEdBQUcsR0FBR0MsTUFBTSxDQUFDQyxpQkFBaUI7TUFDbEMsSUFBSUMsR0FBRyxHQUFHRixNQUFNLENBQUNHLGlCQUFpQjtNQUVsQyxJQUFJLENBQUNySSxtQkFBbUIsQ0FBQ2dCLE9BQU8sQ0FBRWMsV0FBVyxJQUFJO1FBQy9DbUcsR0FBRyxHQUFHakMsSUFBSSxDQUFDaUMsR0FBRyxDQUFFQSxHQUFHLEVBQUVuRyxXQUFXLENBQUNXLE1BQU8sQ0FBQztRQUN6QzJGLEdBQUcsR0FBR3BDLElBQUksQ0FBQ29DLEdBQUcsQ0FBRUEsR0FBRyxFQUFFdEcsV0FBVyxDQUFDVyxNQUFPLENBQUM7TUFDM0MsQ0FBRSxDQUFDO01BRUgsSUFBSSxDQUFDeEMseUJBQXlCLENBQUNPLEtBQUssR0FBRyxJQUFJakMsS0FBSyxDQUFFMEosR0FBRyxFQUFFRyxHQUFJLENBQUM7SUFDOUQ7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFMUIsWUFBWUEsQ0FBQSxFQUFHO0lBQ2IsSUFBSSxDQUFDN0csaUJBQWlCLENBQUNtQixPQUFPLENBQUVXLFVBQVUsSUFBSTtNQUM1Q0EsVUFBVSxDQUFDd0IsUUFBUSxDQUFDdUQsWUFBWSxDQUFDLENBQUM7SUFDcEMsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDM0csa0JBQWtCLENBQUNpQixPQUFPLENBQUVXLFVBQVUsSUFBSTtNQUM3Q0EsVUFBVSxDQUFDd0IsUUFBUSxDQUFDdUQsWUFBWSxDQUFDLENBQUM7SUFDcEMsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDOUcsV0FBVyxDQUFDb0IsT0FBTyxDQUFFeUQsVUFBVSxJQUFJO01BQ3RDQSxVQUFVLENBQUN0QixRQUFRLENBQUN1RCxZQUFZLENBQUMsQ0FBQztJQUNwQyxDQUFFLENBQUM7SUFDSCxJQUFJLENBQUM1RyxZQUFZLENBQUNrQixPQUFPLENBQUU0RSxXQUFXLElBQUk7TUFDeENBLFdBQVcsQ0FBQ3pDLFFBQVEsQ0FBQ3VELFlBQVksQ0FBQyxDQUFDO0lBQ3JDLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFNEIsNkJBQTZCQSxDQUFBLEVBQUc7SUFDOUIsSUFBSUMsUUFBUSxHQUFHLENBQUM7SUFDaEIsQ0FDRSxHQUFHLElBQUksQ0FBQy9JLFdBQVcsRUFDbkIsR0FBRyxJQUFJLENBQUNDLFlBQVksRUFDcEIsR0FBRyxJQUFJLENBQUNDLGdCQUFnQixFQUN4QixHQUFHLElBQUksQ0FBQ0MsaUJBQWlCLENBQzFCLENBQUNxQixPQUFPLENBQUVvQixLQUFLLElBQUk7TUFDbEJtRyxRQUFRLEdBQUd2QyxJQUFJLENBQUNvQyxHQUFHLENBQUVHLFFBQVEsRUFBRW5HLEtBQUssQ0FBQ29HLGNBQWUsQ0FBQztJQUN2RCxDQUFFLENBQUM7SUFDSCxPQUFPRCxRQUFRO0VBQ2pCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VFLEtBQUtBLENBQUEsRUFBRztJQUNOLElBQUksQ0FBQy9CLFlBQVksQ0FBQyxDQUFDO0lBRW5CLElBQUksQ0FBQ3ZHLHFCQUFxQixDQUFDc0ksS0FBSyxDQUFDLENBQUM7SUFDbEMsSUFBSSxDQUFDN0ksV0FBVyxDQUFDNkksS0FBSyxDQUFDLENBQUM7SUFDeEIsSUFBSSxDQUFDM0ksWUFBWSxDQUFDa0IsT0FBTyxDQUFFNEUsV0FBVyxJQUFJO01BQ3hDLElBQUssQ0FBQ0EsV0FBVyxDQUFDOEMsVUFBVSxFQUFHO1FBQzdCOUMsV0FBVyxDQUFDa0MsT0FBTyxDQUFDLENBQUM7TUFDdkI7SUFDRixDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNoSSxZQUFZLENBQUMySSxLQUFLLENBQUMsQ0FBQztJQUN6QixJQUFJLENBQUM1SSxpQkFBaUIsQ0FBQzRJLEtBQUssQ0FBQyxDQUFDO0lBQzlCLElBQUksQ0FBQzFJLGtCQUFrQixDQUFDMEksS0FBSyxDQUFDLENBQUM7SUFDL0IsSUFBSSxDQUFDekksbUJBQW1CLENBQUN5SSxLQUFLLENBQUMsQ0FBQztFQUNsQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsSUFBSUEsQ0FBRUMsRUFBRSxFQUFHO0lBQ1QsSUFBSSxDQUFDaEosV0FBVyxDQUFDb0IsT0FBTyxDQUFFeUQsVUFBVSxJQUFJQSxVQUFVLENBQUNrRSxJQUFJLENBQUVDLEVBQUcsQ0FBRSxDQUFDO0lBQy9ELElBQUksQ0FBQzlJLFlBQVksQ0FBQ2tCLE9BQU8sQ0FBRTRFLFdBQVcsSUFBSUEsV0FBVyxDQUFDK0MsSUFBSSxDQUFFQyxFQUFHLENBQUUsQ0FBQztJQUVsRSxJQUFJLENBQUMvSSxpQkFBaUIsQ0FBQ21CLE9BQU8sQ0FBRVcsVUFBVSxJQUFJO01BQzVDQSxVQUFVLENBQUNnSCxJQUFJLENBQUVDLEVBQUcsQ0FBQzs7TUFFckI7TUFDQSxJQUFLakgsVUFBVSxDQUFDVSxjQUFjLEtBQUt4RCxzQkFBc0IsQ0FBQ2dLLEdBQUcsSUFBSWxILFVBQVUsQ0FBQ21ILHdCQUF3QixDQUFDdEksS0FBSyxFQUFHO1FBQzNHLE1BQU11RSxnQkFBZ0IsR0FBRyxJQUFJLENBQUNGLDhCQUE4QixDQUFFbEQsVUFBVSxFQUFFdUcsTUFBTSxDQUFDQyxpQkFBa0IsQ0FBQztRQUNwRyxJQUFLcEQsZ0JBQWdCLEVBQUc7VUFDdEJwRCxVQUFVLENBQUNvSCxzQkFBc0IsQ0FBRWhFLGdCQUFnQixFQUFFNkQsRUFBRyxDQUFDO1FBQzNEO01BQ0Y7SUFDRixDQUFFLENBQUM7SUFFSCxJQUFJLENBQUM3SSxrQkFBa0IsQ0FBQ2lCLE9BQU8sQ0FBRWMsV0FBVyxJQUFJQSxXQUFXLENBQUM2RyxJQUFJLENBQUVDLEVBQUcsQ0FBRSxDQUFDO0VBQzFFO0FBQ0Y7QUFFQWhLLGVBQWUsQ0FBQ29LLFFBQVEsQ0FBRSxlQUFlLEVBQUUxSixhQUFjLENBQUM7QUFDMUQsZUFBZUEsYUFBYSJ9