// Copyright 2021-2023, University of Colorado Boulder

/**
 * Visual view of paper numbers (CountingObject), with stacked images based on the digits of the number.
 *
 * @author Sharfudeen Ashraf
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import { DragListener, Node, Rectangle } from '../../../../scenery/js/imports.js';
import countingCommon from '../../countingCommon.js';
import ArithmeticRules from '../model/ArithmeticRules.js';
import CountingObject from '../model/CountingObject.js';
import BaseNumberNode from './BaseNumberNode.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import CountingObjectType from '../model/CountingObjectType.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';

// types

// constants
const MINIMUM_OVERLAP_AMOUNT_TO_COMBINE = 8; // in screen coordinates

class CountingObjectNode extends Node {
  // Triggered with self when this paper number node starts to get dragged

  // Triggered with self when this paper number node is split

  // Triggered when user interaction with this paper number begins.

  // When true, don't emit from the moveEmitter (synthetic drag)

  // indicates what CountingObjectType this is

  // Container for the digit image nodes

  // Hit target for the "split" behavior, where one number would be pulled off from the existing number.

  // Hit target for the "move" behavior, which just drags the existing paper number.

  // View-coordinate offset between our position and the pointer's position, used for keeping drags synced.

  // Listener that hooks model position to view translation.

  // Listener for when our number changes

  // Listener reference that gets attached/detached. Handles moving the Node to the front.

  // Listener for when our scale changes

  // Listener for when the handle opacity changes in the model

  // Listener for when whether the paper number's value is included in the sum changes

  // Fires when the user stops dragging a paper number node.

  constructor(countingObject, availableViewBoundsProperty, addAndDragCountingObject, handleDroppedCountingObject, providedOptions) {
    super();
    const options = optionize()({
      countingObjectTypeProperty: new EnumerationProperty(CountingObjectType.PAPER_NUMBER),
      baseNumberNodeOptions: {}
    }, providedOptions);
    this.countingObject = countingObject;
    this.moveEmitter = new Emitter({
      parameters: [{
        valueType: CountingObjectNode
      }]
    });
    this.splitEmitter = new Emitter({
      parameters: [{
        valueType: CountingObjectNode
      }]
    });
    this.interactionStartedEmitter = new Emitter({
      parameters: [{
        valueType: CountingObjectNode
      }]
    });
    this.preventMoveEmit = false;
    this.availableViewBoundsProperty = availableViewBoundsProperty;
    this.countingObjectTypeProperty = options.countingObjectTypeProperty;
    this.baseNumberNodeOptions = options.baseNumberNodeOptions;
    this.endDragEmitter = new Emitter({
      parameters: [{
        valueType: CountingObjectNode
      }]
    });
    this.numberImageContainer = new Node({
      pickable: false
    });
    this.addChild(this.numberImageContainer);
    this.handleNode = null;
    this.splitTarget = new Rectangle(0, 0, 0, 0, {
      cursor: 'pointer'
    });
    this.addChild(this.splitTarget);
    this.moveTarget = new Rectangle(0, 0, 100, 100, {
      cursor: 'move'
    });
    this.addChild(this.moveTarget);
    this.moveDragListener = new DragListener({
      targetNode: this,
      pressCursor: 'move',
      // Our target doesn't have the move cursor, so we need to override here
      start: event => {
        this.interactionStartedEmitter.emit(this);
        if (!this.preventMoveEmit) {
          this.moveEmitter.emit(this);
        }
      },
      drag: (event, listener) => {
        countingObject.setConstrainedDestination(availableViewBoundsProperty.value, listener.parentPoint, false);
      },
      end: () => {
        if (!this.isDisposed) {
          // check if disposed before handling end, see https://github.com/phetsims/make-a-ten/issues/298
          handleDroppedCountingObject(this.countingObject);
          this.endDragEmitter.emit(this);
        }
      }
    });
    this.moveDragListener.isUserControlledProperty.link(controlled => {
      countingObject.userControlledProperty.value = controlled;
    });
    this.moveTarget.addInputListener(this.moveDragListener);
    this.splitDragListener = {
      down: event => {
        if (!event.canStartPress()) {
          return;
        }
        const viewPosition = this.globalToParentPoint(event.pointer.point);

        // Determine how much (if any) gets moved off
        const pulledPlace = countingObject.getBaseNumberAt(this.parentToLocalPoint(viewPosition)).place;
        const amountToRemove = ArithmeticRules.pullApartNumbers(countingObject.numberValueProperty.value, pulledPlace);
        const amountRemaining = countingObject.numberValueProperty.value - amountToRemove;

        // it cannot be split - so start moving
        if (!amountToRemove) {
          this.startSyntheticDrag(event);
          return;
        }
        countingObject.changeNumber(amountRemaining);
        this.interactionStartedEmitter.emit(this);
        this.splitEmitter.emit(this);

        // Create the newCountingObject such that the user is dragging it from the top, which causes the
        // newCountingObject to "jump" up and show some separation from the original countingObject beneath.
        const newCountingObject = new CountingObject(amountToRemove, new Vector2(countingObject.positionProperty.value.x, viewPosition.y), {
          groupingEnabledProperty: countingObject.groupingEnabledProperty
        });
        addAndDragCountingObject(event, newCountingObject);
      }
    };
    this.splitTarget.addInputListener(this.splitDragListener);
    this.translationListener = position => {
      this.translation = position;
    };
    this.scaleListener = scale => {
      this.setScaleMagnitude(scale);
    };
    this.handleOpacityListener = handleOpacity => {
      this.handleNode && this.handleNode.setOpacity(handleOpacity);
    };
    this.updateNumberListener = this.updateNumber.bind(this);
    this.userControlledListener = userControlled => {
      if (userControlled) {
        this.moveToFront();
      }
    };
    this.includeInSumListener = includedInSum => {
      if (!includedInSum) {
        this.interruptSubtreeInput();
        this.pickable = false;
      }
    };

    // Move this CountingObjectNode to the front of its Node layer when the model emits.
    countingObject.moveToFrontEmitter.addListener(() => {
      this.moveToFront();
    });
  }

  /**
   * Rebuilds the image nodes that display the actual paper number, and resizes the mouse/touch targets.
   */
  updateNumber() {
    const groupingEnabled = this.countingObject.groupingEnabledProperty.value;

    // Reversing (largest place first) allows easier opacity computation and has the nodes in order for setting children.
    const reversedBaseNumbers = this.countingObject.baseNumbers.slice().reverse();
    this.numberImageContainer.children = _.map(reversedBaseNumbers, (baseNumber, index) => {
      // A descendant is another BaseNumberNode with a smaller place.
      const hasDescendant = reversedBaseNumbers[index + 1] !== undefined;
      return new BaseNumberNode(baseNumber, 0.95 * Math.pow(0.97, index), combineOptions({
        countingObjectType: this.countingObjectTypeProperty.value,
        includeHandles: true,
        groupingEnabled: groupingEnabled,
        isLargestBaseNumber: index === 0,
        hasDescendant: hasDescendant,
        isPartOfStack: reversedBaseNumbers.length > 1
      }, this.baseNumberNodeOptions));
    });
    const biggestBaseNumberNode = this.numberImageContainer.children[0];
    const fullBounds = this.numberImageContainer.bounds.copy();
    const backgroundNode = biggestBaseNumberNode.backgroundNode;

    // if there is no background node, then this paper number is an object without a background node, so its bounds
    // without a handle are the full bounds. if there is a background, then the bounds of that exclude the handle
    // already, so use that
    const boundsWithoutHandle = backgroundNode ? biggestBaseNumberNode.localToParentBounds(backgroundNode.bounds) : fullBounds;

    // This includes the splitting handle by design
    this.countingObject.localBounds = fullBounds;

    // use boundsWithoutHandle for animating back to the creator node because including the handle in the bounds makes
    // the paper numbers animate to the wrong offset (since the creator node is a card without a handle, so
    // the returning object should match its shape).
    this.countingObject.returnAnimationBounds = boundsWithoutHandle;
    if (groupingEnabled) {
      this.splitTarget.visible = true;
      let baseNumberNodeHasHandle = false;
      let firstHandleXPosition = 0;
      let lastHandleXPosition = 0;
      this.numberImageContainer.children.forEach(node => {
        const baseNumberNode = node;
        if (baseNumberNode.handleNode && !firstHandleXPosition) {
          firstHandleXPosition = baseNumberNode.localToParentBounds(baseNumberNode.handleNode.bounds).centerX;
          this.handleNode = baseNumberNode.handleNode;
          baseNumberNodeHasHandle = true;
        }
        if (baseNumberNode.handleNode) {
          lastHandleXPosition = baseNumberNode.localToParentBounds(baseNumberNode.handleNode.bounds).centerX;
        }
      });
      const padding = 18;
      const splitTargetBounds = baseNumberNodeHasHandle ? new Bounds2(firstHandleXPosition - padding, fullBounds.minY - padding / 2, lastHandleXPosition + padding, boundsWithoutHandle.minY) : new Bounds2(0, 0, 0, 0);
      this.moveTarget.mouseArea = this.moveTarget.touchArea = this.moveTarget.rectBounds = boundsWithoutHandle;
      this.splitTarget.mouseArea = this.splitTarget.touchArea = this.splitTarget.rectBounds = splitTargetBounds;
    } else {
      this.splitTarget.visible = false;
      this.moveTarget.mouseArea = this.moveTarget.touchArea = this.moveTarget.rectBounds = boundsWithoutHandle;
      this.splitTarget.mouseArea = this.splitTarget.touchArea = this.splitTarget.rectBounds = new Bounds2(0, 0, 0, 0);
    }

    // Changing the number must have happened from an interaction. If combined, we want to put cues on this.
    this.interactionStartedEmitter.emit(this);
  }

  /**
   * Called when we grab an event from a different input (like clicking the paper number in the explore panel, or
   * splitting paper numbers), and starts a drag on this paper number.
   *
   * @param event - Scenery event from the relevant input handler
   */
  startSyntheticDrag(event) {
    // Don't emit a move event, as we don't want the cue to disappear.
    this.preventMoveEmit = true;
    this.moveDragListener.press(event);
    this.preventMoveEmit = false;
  }

  /**
   * Implements the API for ClosestDragForwardingListener. Only pass through events if this paper number is still pickable, see
   * https://github.com/phetsims/number-play/issues/39
   *
   * @param event - Scenery event from the relevant input handler
   */
  startDrag(event) {
    if (this.pickable !== false) {
      if (this.globalToLocalPoint(event.pointer.point).y < this.splitTarget.bottom && this.countingObject.numberValueProperty.value > 1) {
        this.splitDragListener.down(event);
      } else {
        this.moveDragListener.press(event);
      }
    }
  }

  /**
   * Implements the API for ClosestDragForwardingListener.
   */
  computeDistance(globalPoint) {
    if (this.countingObject.userControlledProperty.value) {
      return Number.POSITIVE_INFINITY;
    } else {
      const globalBounds = this.localToGlobalBounds(this.countingObject.localBounds);
      return Math.sqrt(globalBounds.minimumDistanceToPointSquared(globalPoint));
    }
  }

  /**
   * Attaches listeners to the model. Should be called when added to the scene graph.
   */
  attachListeners() {
    // mirrored unlinks in dispose()
    this.countingObject.handleOpacityProperty.link(this.handleOpacityListener);
    this.countingObject.scaleProperty.link(this.scaleListener);
    this.countingObject.userControlledProperty.link(this.userControlledListener);
    this.countingObject.numberValueProperty.link(this.updateNumberListener);
    this.countingObject.positionProperty.link(this.translationListener);
    this.countingObject.includeInSumProperty.link(this.includeInSumListener);
  }

  /**
   * Removes listeners from the model. Should be called when removed from the scene graph.
   */
  dispose() {
    this.countingObject.includeInSumProperty.unlink(this.includeInSumListener);
    this.countingObject.positionProperty.unlink(this.translationListener);
    this.countingObject.numberValueProperty.unlink(this.updateNumberListener);
    this.countingObject.userControlledProperty.unlink(this.userControlledListener);
    this.countingObject.scaleProperty.unlink(this.scaleListener);
    this.countingObject.handleOpacityProperty.unlink(this.handleOpacityListener);

    // remove any listeners on the children before detaching them
    this.numberImageContainer.children.forEach(child => child.dispose());
    super.dispose();
  }

  /**
   * Find all nodes which are attachable to the dragged node. This method is called once the user ends the dragging.
   */
  findAttachableNodes(allCountingObjectNodes) {
    const attachableNodeCandidates = allCountingObjectNodes.slice();
    arrayRemove(attachableNodeCandidates, this);

    // find all other paper number nodes that are overlapping the dropped node
    const unorderedAttachableNodes = attachableNodeCandidates.filter(candidateNode => {
      return candidateNode.localToParentBounds(candidateNode.moveTarget.bounds).eroded(MINIMUM_OVERLAP_AMOUNT_TO_COMBINE).intersectsBounds(this.localToParentBounds(this.moveTarget.bounds).eroded(MINIMUM_OVERLAP_AMOUNT_TO_COMBINE));
    });

    // sort by how much area they are overlapping the dropped node
    return _.sortBy(unorderedAttachableNodes, attachableNode => {
      const overlappingBounds = attachableNode.moveTarget.bounds.intersection(this.moveTarget.bounds);
      return overlappingBounds.width * overlappingBounds.height;
    });
  }
}
countingCommon.register('CountingObjectNode', CountingObjectNode);
export default CountingObjectNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwiQm91bmRzMiIsImFycmF5UmVtb3ZlIiwiRHJhZ0xpc3RlbmVyIiwiTm9kZSIsIlJlY3RhbmdsZSIsImNvdW50aW5nQ29tbW9uIiwiQXJpdGhtZXRpY1J1bGVzIiwiQ291bnRpbmdPYmplY3QiLCJCYXNlTnVtYmVyTm9kZSIsIlZlY3RvcjIiLCJDb3VudGluZ09iamVjdFR5cGUiLCJFbnVtZXJhdGlvblByb3BlcnR5Iiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJNSU5JTVVNX09WRVJMQVBfQU1PVU5UX1RPX0NPTUJJTkUiLCJDb3VudGluZ09iamVjdE5vZGUiLCJjb25zdHJ1Y3RvciIsImNvdW50aW5nT2JqZWN0IiwiYXZhaWxhYmxlVmlld0JvdW5kc1Byb3BlcnR5IiwiYWRkQW5kRHJhZ0NvdW50aW5nT2JqZWN0IiwiaGFuZGxlRHJvcHBlZENvdW50aW5nT2JqZWN0IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImNvdW50aW5nT2JqZWN0VHlwZVByb3BlcnR5IiwiUEFQRVJfTlVNQkVSIiwiYmFzZU51bWJlck5vZGVPcHRpb25zIiwibW92ZUVtaXR0ZXIiLCJwYXJhbWV0ZXJzIiwidmFsdWVUeXBlIiwic3BsaXRFbWl0dGVyIiwiaW50ZXJhY3Rpb25TdGFydGVkRW1pdHRlciIsInByZXZlbnRNb3ZlRW1pdCIsImVuZERyYWdFbWl0dGVyIiwibnVtYmVySW1hZ2VDb250YWluZXIiLCJwaWNrYWJsZSIsImFkZENoaWxkIiwiaGFuZGxlTm9kZSIsInNwbGl0VGFyZ2V0IiwiY3Vyc29yIiwibW92ZVRhcmdldCIsIm1vdmVEcmFnTGlzdGVuZXIiLCJ0YXJnZXROb2RlIiwicHJlc3NDdXJzb3IiLCJzdGFydCIsImV2ZW50IiwiZW1pdCIsImRyYWciLCJsaXN0ZW5lciIsInNldENvbnN0cmFpbmVkRGVzdGluYXRpb24iLCJ2YWx1ZSIsInBhcmVudFBvaW50IiwiZW5kIiwiaXNEaXNwb3NlZCIsImlzVXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsImxpbmsiLCJjb250cm9sbGVkIiwidXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsImFkZElucHV0TGlzdGVuZXIiLCJzcGxpdERyYWdMaXN0ZW5lciIsImRvd24iLCJjYW5TdGFydFByZXNzIiwidmlld1Bvc2l0aW9uIiwiZ2xvYmFsVG9QYXJlbnRQb2ludCIsInBvaW50ZXIiLCJwb2ludCIsInB1bGxlZFBsYWNlIiwiZ2V0QmFzZU51bWJlckF0IiwicGFyZW50VG9Mb2NhbFBvaW50IiwicGxhY2UiLCJhbW91bnRUb1JlbW92ZSIsInB1bGxBcGFydE51bWJlcnMiLCJudW1iZXJWYWx1ZVByb3BlcnR5IiwiYW1vdW50UmVtYWluaW5nIiwic3RhcnRTeW50aGV0aWNEcmFnIiwiY2hhbmdlTnVtYmVyIiwibmV3Q291bnRpbmdPYmplY3QiLCJwb3NpdGlvblByb3BlcnR5IiwieCIsInkiLCJncm91cGluZ0VuYWJsZWRQcm9wZXJ0eSIsInRyYW5zbGF0aW9uTGlzdGVuZXIiLCJwb3NpdGlvbiIsInRyYW5zbGF0aW9uIiwic2NhbGVMaXN0ZW5lciIsInNjYWxlIiwic2V0U2NhbGVNYWduaXR1ZGUiLCJoYW5kbGVPcGFjaXR5TGlzdGVuZXIiLCJoYW5kbGVPcGFjaXR5Iiwic2V0T3BhY2l0eSIsInVwZGF0ZU51bWJlckxpc3RlbmVyIiwidXBkYXRlTnVtYmVyIiwiYmluZCIsInVzZXJDb250cm9sbGVkTGlzdGVuZXIiLCJ1c2VyQ29udHJvbGxlZCIsIm1vdmVUb0Zyb250IiwiaW5jbHVkZUluU3VtTGlzdGVuZXIiLCJpbmNsdWRlZEluU3VtIiwiaW50ZXJydXB0U3VidHJlZUlucHV0IiwibW92ZVRvRnJvbnRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJncm91cGluZ0VuYWJsZWQiLCJyZXZlcnNlZEJhc2VOdW1iZXJzIiwiYmFzZU51bWJlcnMiLCJzbGljZSIsInJldmVyc2UiLCJjaGlsZHJlbiIsIl8iLCJtYXAiLCJiYXNlTnVtYmVyIiwiaW5kZXgiLCJoYXNEZXNjZW5kYW50IiwidW5kZWZpbmVkIiwiTWF0aCIsInBvdyIsImNvdW50aW5nT2JqZWN0VHlwZSIsImluY2x1ZGVIYW5kbGVzIiwiaXNMYXJnZXN0QmFzZU51bWJlciIsImlzUGFydE9mU3RhY2siLCJsZW5ndGgiLCJiaWdnZXN0QmFzZU51bWJlck5vZGUiLCJmdWxsQm91bmRzIiwiYm91bmRzIiwiY29weSIsImJhY2tncm91bmROb2RlIiwiYm91bmRzV2l0aG91dEhhbmRsZSIsImxvY2FsVG9QYXJlbnRCb3VuZHMiLCJsb2NhbEJvdW5kcyIsInJldHVybkFuaW1hdGlvbkJvdW5kcyIsInZpc2libGUiLCJiYXNlTnVtYmVyTm9kZUhhc0hhbmRsZSIsImZpcnN0SGFuZGxlWFBvc2l0aW9uIiwibGFzdEhhbmRsZVhQb3NpdGlvbiIsImZvckVhY2giLCJub2RlIiwiYmFzZU51bWJlck5vZGUiLCJjZW50ZXJYIiwicGFkZGluZyIsInNwbGl0VGFyZ2V0Qm91bmRzIiwibWluWSIsIm1vdXNlQXJlYSIsInRvdWNoQXJlYSIsInJlY3RCb3VuZHMiLCJwcmVzcyIsInN0YXJ0RHJhZyIsImdsb2JhbFRvTG9jYWxQb2ludCIsImJvdHRvbSIsImNvbXB1dGVEaXN0YW5jZSIsImdsb2JhbFBvaW50IiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJnbG9iYWxCb3VuZHMiLCJsb2NhbFRvR2xvYmFsQm91bmRzIiwic3FydCIsIm1pbmltdW1EaXN0YW5jZVRvUG9pbnRTcXVhcmVkIiwiYXR0YWNoTGlzdGVuZXJzIiwiaGFuZGxlT3BhY2l0eVByb3BlcnR5Iiwic2NhbGVQcm9wZXJ0eSIsImluY2x1ZGVJblN1bVByb3BlcnR5IiwiZGlzcG9zZSIsInVubGluayIsImNoaWxkIiwiZmluZEF0dGFjaGFibGVOb2RlcyIsImFsbENvdW50aW5nT2JqZWN0Tm9kZXMiLCJhdHRhY2hhYmxlTm9kZUNhbmRpZGF0ZXMiLCJ1bm9yZGVyZWRBdHRhY2hhYmxlTm9kZXMiLCJmaWx0ZXIiLCJjYW5kaWRhdGVOb2RlIiwiZXJvZGVkIiwiaW50ZXJzZWN0c0JvdW5kcyIsInNvcnRCeSIsImF0dGFjaGFibGVOb2RlIiwib3ZlcmxhcHBpbmdCb3VuZHMiLCJpbnRlcnNlY3Rpb24iLCJ3aWR0aCIsImhlaWdodCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ291bnRpbmdPYmplY3ROb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZpc3VhbCB2aWV3IG9mIHBhcGVyIG51bWJlcnMgKENvdW50aW5nT2JqZWN0KSwgd2l0aCBzdGFja2VkIGltYWdlcyBiYXNlZCBvbiB0aGUgZGlnaXRzIG9mIHRoZSBudW1iZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2hhcmZ1ZGVlbiBBc2hyYWZcclxuICovXHJcblxyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xyXG5pbXBvcnQgeyBEcmFnTGlzdGVuZXIsIE5vZGUsIFByZXNzTGlzdGVuZXJFdmVudCwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGNvdW50aW5nQ29tbW9uIGZyb20gJy4uLy4uL2NvdW50aW5nQ29tbW9uLmpzJztcclxuaW1wb3J0IEFyaXRobWV0aWNSdWxlcyBmcm9tICcuLi9tb2RlbC9Bcml0aG1ldGljUnVsZXMuanMnO1xyXG5pbXBvcnQgQ291bnRpbmdPYmplY3QgZnJvbSAnLi4vbW9kZWwvQ291bnRpbmdPYmplY3QuanMnO1xyXG5pbXBvcnQgQmFzZU51bWJlck5vZGUsIHsgQmFzZU51bWJlck5vZGVPcHRpb25zIH0gZnJvbSAnLi9CYXNlTnVtYmVyTm9kZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IENvdW50aW5nT2JqZWN0VHlwZSBmcm9tICcuLi9tb2RlbC9Db3VudGluZ09iamVjdFR5cGUuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xyXG5cclxuLy8gdHlwZXNcclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBjb3VudGluZ09iamVjdFR5cGVQcm9wZXJ0eT86IFRSZWFkT25seVByb3BlcnR5PENvdW50aW5nT2JqZWN0VHlwZT47XHJcbiAgYmFzZU51bWJlck5vZGVPcHRpb25zPzogUGljazxCYXNlTnVtYmVyTm9kZU9wdGlvbnMsICdoYW5kbGVPZmZzZXRZJz47XHJcbn07XHJcbnR5cGUgQ291bnRpbmdPYmplY3ROb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE1JTklNVU1fT1ZFUkxBUF9BTU9VTlRfVE9fQ09NQklORSA9IDg7IC8vIGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG5cclxuY2xhc3MgQ291bnRpbmdPYmplY3ROb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgcHVibGljIHJlYWRvbmx5IGNvdW50aW5nT2JqZWN0OiBDb3VudGluZ09iamVjdDtcclxuXHJcbiAgLy8gVHJpZ2dlcmVkIHdpdGggc2VsZiB3aGVuIHRoaXMgcGFwZXIgbnVtYmVyIG5vZGUgc3RhcnRzIHRvIGdldCBkcmFnZ2VkXHJcbiAgcHVibGljIHJlYWRvbmx5IG1vdmVFbWl0dGVyOiBURW1pdHRlcjxbIENvdW50aW5nT2JqZWN0Tm9kZSBdPjtcclxuXHJcbiAgLy8gVHJpZ2dlcmVkIHdpdGggc2VsZiB3aGVuIHRoaXMgcGFwZXIgbnVtYmVyIG5vZGUgaXMgc3BsaXRcclxuICBwdWJsaWMgcmVhZG9ubHkgc3BsaXRFbWl0dGVyOiBURW1pdHRlcjxbIENvdW50aW5nT2JqZWN0Tm9kZSBdPjtcclxuXHJcbiAgLy8gVHJpZ2dlcmVkIHdoZW4gdXNlciBpbnRlcmFjdGlvbiB3aXRoIHRoaXMgcGFwZXIgbnVtYmVyIGJlZ2lucy5cclxuICBwdWJsaWMgcmVhZG9ubHkgaW50ZXJhY3Rpb25TdGFydGVkRW1pdHRlcjogVEVtaXR0ZXI8WyBDb3VudGluZ09iamVjdE5vZGUgXT47XHJcblxyXG4gIC8vIFdoZW4gdHJ1ZSwgZG9uJ3QgZW1pdCBmcm9tIHRoZSBtb3ZlRW1pdHRlciAoc3ludGhldGljIGRyYWcpXHJcbiAgcHJpdmF0ZSBwcmV2ZW50TW92ZUVtaXQ6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBhdmFpbGFibGVWaWV3Qm91bmRzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PEJvdW5kczI+O1xyXG5cclxuICAvLyBpbmRpY2F0ZXMgd2hhdCBDb3VudGluZ09iamVjdFR5cGUgdGhpcyBpc1xyXG4gIHB1YmxpYyByZWFkb25seSBjb3VudGluZ09iamVjdFR5cGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Q291bnRpbmdPYmplY3RUeXBlPjtcclxuXHJcbiAgLy8gQ29udGFpbmVyIGZvciB0aGUgZGlnaXQgaW1hZ2Ugbm9kZXNcclxuICBwcml2YXRlIHJlYWRvbmx5IG51bWJlckltYWdlQ29udGFpbmVyOiBOb2RlO1xyXG5cclxuICAvLyBIaXQgdGFyZ2V0IGZvciB0aGUgXCJzcGxpdFwiIGJlaGF2aW9yLCB3aGVyZSBvbmUgbnVtYmVyIHdvdWxkIGJlIHB1bGxlZCBvZmYgZnJvbSB0aGUgZXhpc3RpbmcgbnVtYmVyLlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgc3BsaXRUYXJnZXQ6IFJlY3RhbmdsZTtcclxuXHJcbiAgLy8gSGl0IHRhcmdldCBmb3IgdGhlIFwibW92ZVwiIGJlaGF2aW9yLCB3aGljaCBqdXN0IGRyYWdzIHRoZSBleGlzdGluZyBwYXBlciBudW1iZXIuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBtb3ZlVGFyZ2V0OiBSZWN0YW5nbGU7XHJcblxyXG4gIC8vIFZpZXctY29vcmRpbmF0ZSBvZmZzZXQgYmV0d2VlbiBvdXIgcG9zaXRpb24gYW5kIHRoZSBwb2ludGVyJ3MgcG9zaXRpb24sIHVzZWQgZm9yIGtlZXBpbmcgZHJhZ3Mgc3luY2VkLlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbW92ZURyYWdMaXN0ZW5lcjogRHJhZ0xpc3RlbmVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc3BsaXREcmFnTGlzdGVuZXI6IHsgZG93bjogKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICkgPT4gdm9pZCB9O1xyXG5cclxuICAvLyBMaXN0ZW5lciB0aGF0IGhvb2tzIG1vZGVsIHBvc2l0aW9uIHRvIHZpZXcgdHJhbnNsYXRpb24uXHJcbiAgcHJpdmF0ZSByZWFkb25seSB0cmFuc2xhdGlvbkxpc3RlbmVyOiAoIHBvc2l0aW9uOiBWZWN0b3IyICkgPT4gdm9pZDtcclxuXHJcbiAgLy8gTGlzdGVuZXIgZm9yIHdoZW4gb3VyIG51bWJlciBjaGFuZ2VzXHJcbiAgcHJpdmF0ZSByZWFkb25seSB1cGRhdGVOdW1iZXJMaXN0ZW5lcjogKCkgPT4gdm9pZDtcclxuXHJcbiAgLy8gTGlzdGVuZXIgcmVmZXJlbmNlIHRoYXQgZ2V0cyBhdHRhY2hlZC9kZXRhY2hlZC4gSGFuZGxlcyBtb3ZpbmcgdGhlIE5vZGUgdG8gdGhlIGZyb250LlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgdXNlckNvbnRyb2xsZWRMaXN0ZW5lcjogKCB1c2VyQ29udHJvbGxlZDogYm9vbGVhbiApID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBiYXNlTnVtYmVyTm9kZU9wdGlvbnM6IFBpY2s8QmFzZU51bWJlck5vZGVPcHRpb25zLCAnaGFuZGxlT2Zmc2V0WSc+O1xyXG5cclxuICAvLyBMaXN0ZW5lciBmb3Igd2hlbiBvdXIgc2NhbGUgY2hhbmdlc1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc2NhbGVMaXN0ZW5lcjogKCBzY2FsZTogbnVtYmVyICkgPT4gdm9pZDtcclxuXHJcbiAgLy8gTGlzdGVuZXIgZm9yIHdoZW4gdGhlIGhhbmRsZSBvcGFjaXR5IGNoYW5nZXMgaW4gdGhlIG1vZGVsXHJcbiAgcHJpdmF0ZSByZWFkb25seSBoYW5kbGVPcGFjaXR5TGlzdGVuZXI6ICggaGFuZGxlT3BhY2l0eTogbnVtYmVyICkgPT4gdm9pZDtcclxuXHJcbiAgLy8gTGlzdGVuZXIgZm9yIHdoZW4gd2hldGhlciB0aGUgcGFwZXIgbnVtYmVyJ3MgdmFsdWUgaXMgaW5jbHVkZWQgaW4gdGhlIHN1bSBjaGFuZ2VzXHJcbiAgcHJpdmF0ZSByZWFkb25seSBpbmNsdWRlSW5TdW1MaXN0ZW5lcjogKCBpbmNsdWRlZEluU3VtOiBib29sZWFuICkgPT4gdm9pZDtcclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVOb2RlOiBudWxsIHwgTm9kZTtcclxuXHJcbiAgLy8gRmlyZXMgd2hlbiB0aGUgdXNlciBzdG9wcyBkcmFnZ2luZyBhIHBhcGVyIG51bWJlciBub2RlLlxyXG4gIHB1YmxpYyByZWFkb25seSBlbmREcmFnRW1pdHRlcjogVEVtaXR0ZXI8WyBDb3VudGluZ09iamVjdE5vZGUgXT47XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY291bnRpbmdPYmplY3Q6IENvdW50aW5nT2JqZWN0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVmlld0JvdW5kc1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxCb3VuZHMyPixcclxuICAgICAgICAgICAgICAgICAgICAgIGFkZEFuZERyYWdDb3VudGluZ09iamVjdDogKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50LCBjb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QgKSA9PiB2b2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgaGFuZGxlRHJvcHBlZENvdW50aW5nT2JqZWN0OiAoIGNvdW50aW5nT2JqZWN0OiBDb3VudGluZ09iamVjdCApID0+IHZvaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBDb3VudGluZ09iamVjdE5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDb3VudGluZ09iamVjdE5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucz4oKSgge1xyXG4gICAgICBjb3VudGluZ09iamVjdFR5cGVQcm9wZXJ0eTogbmV3IEVudW1lcmF0aW9uUHJvcGVydHkoIENvdW50aW5nT2JqZWN0VHlwZS5QQVBFUl9OVU1CRVIgKSxcclxuICAgICAgYmFzZU51bWJlck5vZGVPcHRpb25zOiB7fVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdCA9IGNvdW50aW5nT2JqZWN0O1xyXG5cclxuICAgIHRoaXMubW92ZUVtaXR0ZXIgPSBuZXcgRW1pdHRlciggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiBDb3VudGluZ09iamVjdE5vZGUgfSBdIH0gKTtcclxuICAgIHRoaXMuc3BsaXRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHsgcGFyYW1ldGVyczogWyB7IHZhbHVlVHlwZTogQ291bnRpbmdPYmplY3ROb2RlIH0gXSB9ICk7XHJcbiAgICB0aGlzLmludGVyYWN0aW9uU3RhcnRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlciggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiBDb3VudGluZ09iamVjdE5vZGUgfSBdIH0gKTtcclxuICAgIHRoaXMucHJldmVudE1vdmVFbWl0ID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5hdmFpbGFibGVWaWV3Qm91bmRzUHJvcGVydHkgPSBhdmFpbGFibGVWaWV3Qm91bmRzUHJvcGVydHk7XHJcblxyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdFR5cGVQcm9wZXJ0eSA9IG9wdGlvbnMuY291bnRpbmdPYmplY3RUeXBlUHJvcGVydHk7XHJcblxyXG4gICAgdGhpcy5iYXNlTnVtYmVyTm9kZU9wdGlvbnMgPSBvcHRpb25zLmJhc2VOdW1iZXJOb2RlT3B0aW9ucztcclxuICAgIHRoaXMuZW5kRHJhZ0VtaXR0ZXIgPSBuZXcgRW1pdHRlciggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiBDb3VudGluZ09iamVjdE5vZGUgfSBdIH0gKTtcclxuICAgIHRoaXMubnVtYmVySW1hZ2VDb250YWluZXIgPSBuZXcgTm9kZSgge1xyXG4gICAgICBwaWNrYWJsZTogZmFsc2VcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMubnVtYmVySW1hZ2VDb250YWluZXIgKTtcclxuXHJcbiAgICB0aGlzLmhhbmRsZU5vZGUgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuc3BsaXRUYXJnZXQgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAwLCAwLCB7XHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnNwbGl0VGFyZ2V0ICk7XHJcblxyXG4gICAgdGhpcy5tb3ZlVGFyZ2V0ID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMTAwLCAxMDAsIHtcclxuICAgICAgY3Vyc29yOiAnbW92ZSdcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMubW92ZVRhcmdldCApO1xyXG5cclxuICAgIHRoaXMubW92ZURyYWdMaXN0ZW5lciA9IG5ldyBEcmFnTGlzdGVuZXIoIHtcclxuICAgICAgdGFyZ2V0Tm9kZTogdGhpcyxcclxuICAgICAgcHJlc3NDdXJzb3I6ICdtb3ZlJywgLy8gT3VyIHRhcmdldCBkb2Vzbid0IGhhdmUgdGhlIG1vdmUgY3Vyc29yLCBzbyB3ZSBuZWVkIHRvIG92ZXJyaWRlIGhlcmVcclxuICAgICAgc3RhcnQ6ICggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApID0+IHtcclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uU3RhcnRlZEVtaXR0ZXIuZW1pdCggdGhpcyApO1xyXG4gICAgICAgIGlmICggIXRoaXMucHJldmVudE1vdmVFbWl0ICkge1xyXG4gICAgICAgICAgdGhpcy5tb3ZlRW1pdHRlci5lbWl0KCB0aGlzICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgZHJhZzogKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50LCBsaXN0ZW5lcjogRHJhZ0xpc3RlbmVyICkgPT4ge1xyXG4gICAgICAgIGNvdW50aW5nT2JqZWN0LnNldENvbnN0cmFpbmVkRGVzdGluYXRpb24oIGF2YWlsYWJsZVZpZXdCb3VuZHNQcm9wZXJ0eS52YWx1ZSwgbGlzdGVuZXIucGFyZW50UG9pbnQsIGZhbHNlICk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBlbmQ6ICgpID0+IHtcclxuICAgICAgICBpZiAoICF0aGlzLmlzRGlzcG9zZWQgKSB7IC8vIGNoZWNrIGlmIGRpc3Bvc2VkIGJlZm9yZSBoYW5kbGluZyBlbmQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbWFrZS1hLXRlbi9pc3N1ZXMvMjk4XHJcbiAgICAgICAgICBoYW5kbGVEcm9wcGVkQ291bnRpbmdPYmplY3QoIHRoaXMuY291bnRpbmdPYmplY3QgKTtcclxuICAgICAgICAgIHRoaXMuZW5kRHJhZ0VtaXR0ZXIuZW1pdCggdGhpcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5tb3ZlRHJhZ0xpc3RlbmVyLmlzVXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5saW5rKCBjb250cm9sbGVkID0+IHtcclxuICAgICAgY291bnRpbmdPYmplY3QudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSA9IGNvbnRyb2xsZWQ7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLm1vdmVUYXJnZXQuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5tb3ZlRHJhZ0xpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy5zcGxpdERyYWdMaXN0ZW5lciA9IHtcclxuICAgICAgZG93bjogZXZlbnQgPT4ge1xyXG4gICAgICAgIGlmICggIWV2ZW50LmNhblN0YXJ0UHJlc3MoKSApIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdQb3NpdGlvbiA9IHRoaXMuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApO1xyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgaG93IG11Y2ggKGlmIGFueSkgZ2V0cyBtb3ZlZCBvZmZcclxuICAgICAgICBjb25zdCBwdWxsZWRQbGFjZSA9IGNvdW50aW5nT2JqZWN0LmdldEJhc2VOdW1iZXJBdCggdGhpcy5wYXJlbnRUb0xvY2FsUG9pbnQoIHZpZXdQb3NpdGlvbiApICkucGxhY2U7XHJcblxyXG4gICAgICAgIGNvbnN0IGFtb3VudFRvUmVtb3ZlID0gQXJpdGhtZXRpY1J1bGVzLnB1bGxBcGFydE51bWJlcnMoIGNvdW50aW5nT2JqZWN0Lm51bWJlclZhbHVlUHJvcGVydHkudmFsdWUsIHB1bGxlZFBsYWNlICk7XHJcbiAgICAgICAgY29uc3QgYW1vdW50UmVtYWluaW5nID0gY291bnRpbmdPYmplY3QubnVtYmVyVmFsdWVQcm9wZXJ0eS52YWx1ZSAtIGFtb3VudFRvUmVtb3ZlO1xyXG5cclxuICAgICAgICAvLyBpdCBjYW5ub3QgYmUgc3BsaXQgLSBzbyBzdGFydCBtb3ZpbmdcclxuICAgICAgICBpZiAoICFhbW91bnRUb1JlbW92ZSApIHtcclxuICAgICAgICAgIHRoaXMuc3RhcnRTeW50aGV0aWNEcmFnKCBldmVudCApO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY291bnRpbmdPYmplY3QuY2hhbmdlTnVtYmVyKCBhbW91bnRSZW1haW5pbmcgKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvblN0YXJ0ZWRFbWl0dGVyLmVtaXQoIHRoaXMgKTtcclxuICAgICAgICB0aGlzLnNwbGl0RW1pdHRlci5lbWl0KCB0aGlzICk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgbmV3Q291bnRpbmdPYmplY3Qgc3VjaCB0aGF0IHRoZSB1c2VyIGlzIGRyYWdnaW5nIGl0IGZyb20gdGhlIHRvcCwgd2hpY2ggY2F1c2VzIHRoZVxyXG4gICAgICAgIC8vIG5ld0NvdW50aW5nT2JqZWN0IHRvIFwianVtcFwiIHVwIGFuZCBzaG93IHNvbWUgc2VwYXJhdGlvbiBmcm9tIHRoZSBvcmlnaW5hbCBjb3VudGluZ09iamVjdCBiZW5lYXRoLlxyXG4gICAgICAgIGNvbnN0IG5ld0NvdW50aW5nT2JqZWN0ID0gbmV3IENvdW50aW5nT2JqZWN0KFxyXG4gICAgICAgICAgYW1vdW50VG9SZW1vdmUsXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggY291bnRpbmdPYmplY3QucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54LCB2aWV3UG9zaXRpb24ueSApLCB7XHJcbiAgICAgICAgICAgIGdyb3VwaW5nRW5hYmxlZFByb3BlcnR5OiBjb3VudGluZ09iamVjdC5ncm91cGluZ0VuYWJsZWRQcm9wZXJ0eVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIGFkZEFuZERyYWdDb3VudGluZ09iamVjdCggZXZlbnQsIG5ld0NvdW50aW5nT2JqZWN0ICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGlzLnNwbGl0VGFyZ2V0LmFkZElucHV0TGlzdGVuZXIoIHRoaXMuc3BsaXREcmFnTGlzdGVuZXIgKTtcclxuXHJcbiAgICB0aGlzLnRyYW5zbGF0aW9uTGlzdGVuZXIgPSBwb3NpdGlvbiA9PiB7XHJcbiAgICAgIHRoaXMudHJhbnNsYXRpb24gPSBwb3NpdGlvbjtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5zY2FsZUxpc3RlbmVyID0gc2NhbGUgPT4ge1xyXG4gICAgICB0aGlzLnNldFNjYWxlTWFnbml0dWRlKCBzY2FsZSApO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmhhbmRsZU9wYWNpdHlMaXN0ZW5lciA9IGhhbmRsZU9wYWNpdHkgPT4ge1xyXG4gICAgICB0aGlzLmhhbmRsZU5vZGUgJiYgdGhpcy5oYW5kbGVOb2RlLnNldE9wYWNpdHkoIGhhbmRsZU9wYWNpdHkgKTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy51cGRhdGVOdW1iZXJMaXN0ZW5lciA9IHRoaXMudXBkYXRlTnVtYmVyLmJpbmQoIHRoaXMgKTtcclxuXHJcbiAgICB0aGlzLnVzZXJDb250cm9sbGVkTGlzdGVuZXIgPSB1c2VyQ29udHJvbGxlZCA9PiB7XHJcbiAgICAgIGlmICggdXNlckNvbnRyb2xsZWQgKSB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG9Gcm9udCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuaW5jbHVkZUluU3VtTGlzdGVuZXIgPSBpbmNsdWRlZEluU3VtID0+IHtcclxuICAgICAgaWYgKCAhaW5jbHVkZWRJblN1bSApIHtcclxuICAgICAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xyXG4gICAgICAgIHRoaXMucGlja2FibGUgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBNb3ZlIHRoaXMgQ291bnRpbmdPYmplY3ROb2RlIHRvIHRoZSBmcm9udCBvZiBpdHMgTm9kZSBsYXllciB3aGVuIHRoZSBtb2RlbCBlbWl0cy5cclxuICAgIGNvdW50aW5nT2JqZWN0Lm1vdmVUb0Zyb250RW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICB0aGlzLm1vdmVUb0Zyb250KCk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWJ1aWxkcyB0aGUgaW1hZ2Ugbm9kZXMgdGhhdCBkaXNwbGF5IHRoZSBhY3R1YWwgcGFwZXIgbnVtYmVyLCBhbmQgcmVzaXplcyB0aGUgbW91c2UvdG91Y2ggdGFyZ2V0cy5cclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlTnVtYmVyKCk6IHZvaWQge1xyXG4gICAgY29uc3QgZ3JvdXBpbmdFbmFibGVkID0gdGhpcy5jb3VudGluZ09iamVjdC5ncm91cGluZ0VuYWJsZWRQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAvLyBSZXZlcnNpbmcgKGxhcmdlc3QgcGxhY2UgZmlyc3QpIGFsbG93cyBlYXNpZXIgb3BhY2l0eSBjb21wdXRhdGlvbiBhbmQgaGFzIHRoZSBub2RlcyBpbiBvcmRlciBmb3Igc2V0dGluZyBjaGlsZHJlbi5cclxuICAgIGNvbnN0IHJldmVyc2VkQmFzZU51bWJlcnMgPSB0aGlzLmNvdW50aW5nT2JqZWN0LmJhc2VOdW1iZXJzLnNsaWNlKCkucmV2ZXJzZSgpO1xyXG5cclxuICAgIHRoaXMubnVtYmVySW1hZ2VDb250YWluZXIuY2hpbGRyZW4gPSBfLm1hcCggcmV2ZXJzZWRCYXNlTnVtYmVycywgKCBiYXNlTnVtYmVyLCBpbmRleCApID0+IHtcclxuXHJcbiAgICAgIC8vIEEgZGVzY2VuZGFudCBpcyBhbm90aGVyIEJhc2VOdW1iZXJOb2RlIHdpdGggYSBzbWFsbGVyIHBsYWNlLlxyXG4gICAgICBjb25zdCBoYXNEZXNjZW5kYW50ID0gcmV2ZXJzZWRCYXNlTnVtYmVyc1sgaW5kZXggKyAxIF0gIT09IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgIHJldHVybiBuZXcgQmFzZU51bWJlck5vZGUoXHJcbiAgICAgICAgYmFzZU51bWJlcixcclxuICAgICAgICAwLjk1ICogTWF0aC5wb3coIDAuOTcsIGluZGV4ICksIGNvbWJpbmVPcHRpb25zPEJhc2VOdW1iZXJOb2RlT3B0aW9ucz4oIHtcclxuICAgICAgICAgIGNvdW50aW5nT2JqZWN0VHlwZTogdGhpcy5jb3VudGluZ09iamVjdFR5cGVQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICAgIGluY2x1ZGVIYW5kbGVzOiB0cnVlLFxyXG4gICAgICAgICAgZ3JvdXBpbmdFbmFibGVkOiBncm91cGluZ0VuYWJsZWQsXHJcbiAgICAgICAgICBpc0xhcmdlc3RCYXNlTnVtYmVyOiBpbmRleCA9PT0gMCxcclxuICAgICAgICAgIGhhc0Rlc2NlbmRhbnQ6IGhhc0Rlc2NlbmRhbnQsXHJcbiAgICAgICAgICBpc1BhcnRPZlN0YWNrOiByZXZlcnNlZEJhc2VOdW1iZXJzLmxlbmd0aCA+IDFcclxuICAgICAgICB9LCB0aGlzLmJhc2VOdW1iZXJOb2RlT3B0aW9ucyApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYmlnZ2VzdEJhc2VOdW1iZXJOb2RlID0gdGhpcy5udW1iZXJJbWFnZUNvbnRhaW5lci5jaGlsZHJlblsgMCBdIGFzIEJhc2VOdW1iZXJOb2RlO1xyXG5cclxuICAgIGNvbnN0IGZ1bGxCb3VuZHMgPSB0aGlzLm51bWJlckltYWdlQ29udGFpbmVyLmJvdW5kcy5jb3B5KCk7XHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kTm9kZSA9IGJpZ2dlc3RCYXNlTnVtYmVyTm9kZS5iYWNrZ3JvdW5kTm9kZTtcclxuXHJcbiAgICAvLyBpZiB0aGVyZSBpcyBubyBiYWNrZ3JvdW5kIG5vZGUsIHRoZW4gdGhpcyBwYXBlciBudW1iZXIgaXMgYW4gb2JqZWN0IHdpdGhvdXQgYSBiYWNrZ3JvdW5kIG5vZGUsIHNvIGl0cyBib3VuZHNcclxuICAgIC8vIHdpdGhvdXQgYSBoYW5kbGUgYXJlIHRoZSBmdWxsIGJvdW5kcy4gaWYgdGhlcmUgaXMgYSBiYWNrZ3JvdW5kLCB0aGVuIHRoZSBib3VuZHMgb2YgdGhhdCBleGNsdWRlIHRoZSBoYW5kbGVcclxuICAgIC8vIGFscmVhZHksIHNvIHVzZSB0aGF0XHJcbiAgICBjb25zdCBib3VuZHNXaXRob3V0SGFuZGxlID0gYmFja2dyb3VuZE5vZGUgPyBiaWdnZXN0QmFzZU51bWJlck5vZGUubG9jYWxUb1BhcmVudEJvdW5kcyggYmFja2dyb3VuZE5vZGUuYm91bmRzICkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxCb3VuZHM7XHJcblxyXG4gICAgLy8gVGhpcyBpbmNsdWRlcyB0aGUgc3BsaXR0aW5nIGhhbmRsZSBieSBkZXNpZ25cclxuICAgIHRoaXMuY291bnRpbmdPYmplY3QubG9jYWxCb3VuZHMgPSBmdWxsQm91bmRzO1xyXG5cclxuICAgIC8vIHVzZSBib3VuZHNXaXRob3V0SGFuZGxlIGZvciBhbmltYXRpbmcgYmFjayB0byB0aGUgY3JlYXRvciBub2RlIGJlY2F1c2UgaW5jbHVkaW5nIHRoZSBoYW5kbGUgaW4gdGhlIGJvdW5kcyBtYWtlc1xyXG4gICAgLy8gdGhlIHBhcGVyIG51bWJlcnMgYW5pbWF0ZSB0byB0aGUgd3Jvbmcgb2Zmc2V0IChzaW5jZSB0aGUgY3JlYXRvciBub2RlIGlzIGEgY2FyZCB3aXRob3V0IGEgaGFuZGxlLCBzb1xyXG4gICAgLy8gdGhlIHJldHVybmluZyBvYmplY3Qgc2hvdWxkIG1hdGNoIGl0cyBzaGFwZSkuXHJcbiAgICB0aGlzLmNvdW50aW5nT2JqZWN0LnJldHVybkFuaW1hdGlvbkJvdW5kcyA9IGJvdW5kc1dpdGhvdXRIYW5kbGU7XHJcblxyXG4gICAgaWYgKCBncm91cGluZ0VuYWJsZWQgKSB7XHJcbiAgICAgIHRoaXMuc3BsaXRUYXJnZXQudmlzaWJsZSA9IHRydWU7XHJcblxyXG4gICAgICBsZXQgYmFzZU51bWJlck5vZGVIYXNIYW5kbGUgPSBmYWxzZTtcclxuICAgICAgbGV0IGZpcnN0SGFuZGxlWFBvc2l0aW9uID0gMDtcclxuICAgICAgbGV0IGxhc3RIYW5kbGVYUG9zaXRpb24gPSAwO1xyXG5cclxuICAgICAgdGhpcy5udW1iZXJJbWFnZUNvbnRhaW5lci5jaGlsZHJlbi5mb3JFYWNoKCBub2RlID0+IHtcclxuICAgICAgICBjb25zdCBiYXNlTnVtYmVyTm9kZSA9IG5vZGUgYXMgQmFzZU51bWJlck5vZGU7XHJcblxyXG4gICAgICAgIGlmICggYmFzZU51bWJlck5vZGUuaGFuZGxlTm9kZSAmJiAhZmlyc3RIYW5kbGVYUG9zaXRpb24gKSB7XHJcbiAgICAgICAgICBmaXJzdEhhbmRsZVhQb3NpdGlvbiA9IGJhc2VOdW1iZXJOb2RlLmxvY2FsVG9QYXJlbnRCb3VuZHMoIGJhc2VOdW1iZXJOb2RlLmhhbmRsZU5vZGUuYm91bmRzICkuY2VudGVyWDtcclxuICAgICAgICAgIHRoaXMuaGFuZGxlTm9kZSA9IGJhc2VOdW1iZXJOb2RlLmhhbmRsZU5vZGU7XHJcbiAgICAgICAgICBiYXNlTnVtYmVyTm9kZUhhc0hhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggYmFzZU51bWJlck5vZGUuaGFuZGxlTm9kZSApIHtcclxuICAgICAgICAgIGxhc3RIYW5kbGVYUG9zaXRpb24gPSBiYXNlTnVtYmVyTm9kZS5sb2NhbFRvUGFyZW50Qm91bmRzKCBiYXNlTnVtYmVyTm9kZS5oYW5kbGVOb2RlLmJvdW5kcyApLmNlbnRlclg7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICAgIGNvbnN0IHBhZGRpbmcgPSAxODtcclxuXHJcbiAgICAgIGNvbnN0IHNwbGl0VGFyZ2V0Qm91bmRzID0gYmFzZU51bWJlck5vZGVIYXNIYW5kbGUgPyBuZXcgQm91bmRzMihcclxuICAgICAgICBmaXJzdEhhbmRsZVhQb3NpdGlvbiAtIHBhZGRpbmcsXHJcbiAgICAgICAgZnVsbEJvdW5kcy5taW5ZIC0gcGFkZGluZyAvIDIsXHJcbiAgICAgICAgbGFzdEhhbmRsZVhQb3NpdGlvbiArIHBhZGRpbmcsXHJcbiAgICAgICAgYm91bmRzV2l0aG91dEhhbmRsZS5taW5ZXHJcbiAgICAgICkgOiBuZXcgQm91bmRzMiggMCwgMCwgMCwgMCApO1xyXG5cclxuICAgICAgdGhpcy5tb3ZlVGFyZ2V0Lm1vdXNlQXJlYSA9IHRoaXMubW92ZVRhcmdldC50b3VjaEFyZWEgPSB0aGlzLm1vdmVUYXJnZXQucmVjdEJvdW5kcyA9IGJvdW5kc1dpdGhvdXRIYW5kbGU7XHJcbiAgICAgIHRoaXMuc3BsaXRUYXJnZXQubW91c2VBcmVhID0gdGhpcy5zcGxpdFRhcmdldC50b3VjaEFyZWEgPSB0aGlzLnNwbGl0VGFyZ2V0LnJlY3RCb3VuZHMgPSBzcGxpdFRhcmdldEJvdW5kcztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnNwbGl0VGFyZ2V0LnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5tb3ZlVGFyZ2V0Lm1vdXNlQXJlYSA9IHRoaXMubW92ZVRhcmdldC50b3VjaEFyZWEgPSB0aGlzLm1vdmVUYXJnZXQucmVjdEJvdW5kcyA9IGJvdW5kc1dpdGhvdXRIYW5kbGU7XHJcbiAgICAgIHRoaXMuc3BsaXRUYXJnZXQubW91c2VBcmVhID0gdGhpcy5zcGxpdFRhcmdldC50b3VjaEFyZWEgPSB0aGlzLnNwbGl0VGFyZ2V0LnJlY3RCb3VuZHMgPSBuZXcgQm91bmRzMiggMCwgMCwgMCwgMCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoYW5naW5nIHRoZSBudW1iZXIgbXVzdCBoYXZlIGhhcHBlbmVkIGZyb20gYW4gaW50ZXJhY3Rpb24uIElmIGNvbWJpbmVkLCB3ZSB3YW50IHRvIHB1dCBjdWVzIG9uIHRoaXMuXHJcbiAgICB0aGlzLmludGVyYWN0aW9uU3RhcnRlZEVtaXR0ZXIuZW1pdCggdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gd2UgZ3JhYiBhbiBldmVudCBmcm9tIGEgZGlmZmVyZW50IGlucHV0IChsaWtlIGNsaWNraW5nIHRoZSBwYXBlciBudW1iZXIgaW4gdGhlIGV4cGxvcmUgcGFuZWwsIG9yXHJcbiAgICogc3BsaXR0aW5nIHBhcGVyIG51bWJlcnMpLCBhbmQgc3RhcnRzIGEgZHJhZyBvbiB0aGlzIHBhcGVyIG51bWJlci5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBldmVudCAtIFNjZW5lcnkgZXZlbnQgZnJvbSB0aGUgcmVsZXZhbnQgaW5wdXQgaGFuZGxlclxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGFydFN5bnRoZXRpY0RyYWcoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogdm9pZCB7XHJcbiAgICAvLyBEb24ndCBlbWl0IGEgbW92ZSBldmVudCwgYXMgd2UgZG9uJ3Qgd2FudCB0aGUgY3VlIHRvIGRpc2FwcGVhci5cclxuICAgIHRoaXMucHJldmVudE1vdmVFbWl0ID0gdHJ1ZTtcclxuICAgIHRoaXMubW92ZURyYWdMaXN0ZW5lci5wcmVzcyggZXZlbnQgKTtcclxuICAgIHRoaXMucHJldmVudE1vdmVFbWl0ID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbXBsZW1lbnRzIHRoZSBBUEkgZm9yIENsb3Nlc3REcmFnRm9yd2FyZGluZ0xpc3RlbmVyLiBPbmx5IHBhc3MgdGhyb3VnaCBldmVudHMgaWYgdGhpcyBwYXBlciBudW1iZXIgaXMgc3RpbGwgcGlja2FibGUsIHNlZVxyXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9udW1iZXItcGxheS9pc3N1ZXMvMzlcclxuICAgKlxyXG4gICAqIEBwYXJhbSBldmVudCAtIFNjZW5lcnkgZXZlbnQgZnJvbSB0aGUgcmVsZXZhbnQgaW5wdXQgaGFuZGxlclxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGFydERyYWcoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogdm9pZCB7XHJcbiAgICBpZiAoIHRoaXMucGlja2FibGUgIT09IGZhbHNlICkge1xyXG4gICAgICBpZiAoIHRoaXMuZ2xvYmFsVG9Mb2NhbFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkueSA8IHRoaXMuc3BsaXRUYXJnZXQuYm90dG9tICYmIHRoaXMuY291bnRpbmdPYmplY3QubnVtYmVyVmFsdWVQcm9wZXJ0eS52YWx1ZSA+IDEgKSB7XHJcbiAgICAgICAgdGhpcy5zcGxpdERyYWdMaXN0ZW5lci5kb3duKCBldmVudCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMubW92ZURyYWdMaXN0ZW5lci5wcmVzcyggZXZlbnQgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW1wbGVtZW50cyB0aGUgQVBJIGZvciBDbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lci5cclxuICAgKi9cclxuICBwdWJsaWMgY29tcHV0ZURpc3RhbmNlKCBnbG9iYWxQb2ludDogVmVjdG9yMiApOiBudW1iZXIge1xyXG4gICAgaWYgKCB0aGlzLmNvdW50aW5nT2JqZWN0LnVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHJldHVybiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgZ2xvYmFsQm91bmRzID0gdGhpcy5sb2NhbFRvR2xvYmFsQm91bmRzKCB0aGlzLmNvdW50aW5nT2JqZWN0LmxvY2FsQm91bmRzICk7XHJcbiAgICAgIHJldHVybiBNYXRoLnNxcnQoIGdsb2JhbEJvdW5kcy5taW5pbXVtRGlzdGFuY2VUb1BvaW50U3F1YXJlZCggZ2xvYmFsUG9pbnQgKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXR0YWNoZXMgbGlzdGVuZXJzIHRvIHRoZSBtb2RlbC4gU2hvdWxkIGJlIGNhbGxlZCB3aGVuIGFkZGVkIHRvIHRoZSBzY2VuZSBncmFwaC5cclxuICAgKi9cclxuICBwdWJsaWMgYXR0YWNoTGlzdGVuZXJzKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIG1pcnJvcmVkIHVubGlua3MgaW4gZGlzcG9zZSgpXHJcbiAgICB0aGlzLmNvdW50aW5nT2JqZWN0LmhhbmRsZU9wYWNpdHlQcm9wZXJ0eS5saW5rKCB0aGlzLmhhbmRsZU9wYWNpdHlMaXN0ZW5lciApO1xyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdC5zY2FsZVByb3BlcnR5LmxpbmsoIHRoaXMuc2NhbGVMaXN0ZW5lciApO1xyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdC51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxpbmsoIHRoaXMudXNlckNvbnRyb2xsZWRMaXN0ZW5lciApO1xyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdC5udW1iZXJWYWx1ZVByb3BlcnR5LmxpbmsoIHRoaXMudXBkYXRlTnVtYmVyTGlzdGVuZXIgKTtcclxuICAgIHRoaXMuY291bnRpbmdPYmplY3QucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCB0aGlzLnRyYW5zbGF0aW9uTGlzdGVuZXIgKTtcclxuICAgIHRoaXMuY291bnRpbmdPYmplY3QuaW5jbHVkZUluU3VtUHJvcGVydHkubGluayggdGhpcy5pbmNsdWRlSW5TdW1MaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBsaXN0ZW5lcnMgZnJvbSB0aGUgbW9kZWwuIFNob3VsZCBiZSBjYWxsZWQgd2hlbiByZW1vdmVkIGZyb20gdGhlIHNjZW5lIGdyYXBoLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdC5pbmNsdWRlSW5TdW1Qcm9wZXJ0eS51bmxpbmsoIHRoaXMuaW5jbHVkZUluU3VtTGlzdGVuZXIgKTtcclxuICAgIHRoaXMuY291bnRpbmdPYmplY3QucG9zaXRpb25Qcm9wZXJ0eS51bmxpbmsoIHRoaXMudHJhbnNsYXRpb25MaXN0ZW5lciApO1xyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdC5udW1iZXJWYWx1ZVByb3BlcnR5LnVubGluayggdGhpcy51cGRhdGVOdW1iZXJMaXN0ZW5lciApO1xyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdC51c2VyQ29udHJvbGxlZFByb3BlcnR5LnVubGluayggdGhpcy51c2VyQ29udHJvbGxlZExpc3RlbmVyICk7XHJcbiAgICB0aGlzLmNvdW50aW5nT2JqZWN0LnNjYWxlUHJvcGVydHkudW5saW5rKCB0aGlzLnNjYWxlTGlzdGVuZXIgKTtcclxuICAgIHRoaXMuY291bnRpbmdPYmplY3QuaGFuZGxlT3BhY2l0eVByb3BlcnR5LnVubGluayggdGhpcy5oYW5kbGVPcGFjaXR5TGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyByZW1vdmUgYW55IGxpc3RlbmVycyBvbiB0aGUgY2hpbGRyZW4gYmVmb3JlIGRldGFjaGluZyB0aGVtXHJcbiAgICB0aGlzLm51bWJlckltYWdlQ29udGFpbmVyLmNoaWxkcmVuLmZvckVhY2goIGNoaWxkID0+IGNoaWxkLmRpc3Bvc2UoKSApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmluZCBhbGwgbm9kZXMgd2hpY2ggYXJlIGF0dGFjaGFibGUgdG8gdGhlIGRyYWdnZWQgbm9kZS4gVGhpcyBtZXRob2QgaXMgY2FsbGVkIG9uY2UgdGhlIHVzZXIgZW5kcyB0aGUgZHJhZ2dpbmcuXHJcbiAgICovXHJcbiAgcHVibGljIGZpbmRBdHRhY2hhYmxlTm9kZXMoIGFsbENvdW50aW5nT2JqZWN0Tm9kZXM6IENvdW50aW5nT2JqZWN0Tm9kZVtdICk6IENvdW50aW5nT2JqZWN0Tm9kZVtdIHtcclxuICAgIGNvbnN0IGF0dGFjaGFibGVOb2RlQ2FuZGlkYXRlcyA9IGFsbENvdW50aW5nT2JqZWN0Tm9kZXMuc2xpY2UoKTtcclxuICAgIGFycmF5UmVtb3ZlKCBhdHRhY2hhYmxlTm9kZUNhbmRpZGF0ZXMsIHRoaXMgKTtcclxuXHJcbiAgICAvLyBmaW5kIGFsbCBvdGhlciBwYXBlciBudW1iZXIgbm9kZXMgdGhhdCBhcmUgb3ZlcmxhcHBpbmcgdGhlIGRyb3BwZWQgbm9kZVxyXG4gICAgY29uc3QgdW5vcmRlcmVkQXR0YWNoYWJsZU5vZGVzID0gYXR0YWNoYWJsZU5vZGVDYW5kaWRhdGVzLmZpbHRlciggY2FuZGlkYXRlTm9kZSA9PiB7XHJcbiAgICAgIHJldHVybiBjYW5kaWRhdGVOb2RlLmxvY2FsVG9QYXJlbnRCb3VuZHMoIGNhbmRpZGF0ZU5vZGUubW92ZVRhcmdldC5ib3VuZHMgKS5lcm9kZWQoIE1JTklNVU1fT1ZFUkxBUF9BTU9VTlRfVE9fQ09NQklORSApXHJcbiAgICAgICAgLmludGVyc2VjdHNCb3VuZHMoIHRoaXMubG9jYWxUb1BhcmVudEJvdW5kcyggdGhpcy5tb3ZlVGFyZ2V0LmJvdW5kcyApLmVyb2RlZCggTUlOSU1VTV9PVkVSTEFQX0FNT1VOVF9UT19DT01CSU5FICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBzb3J0IGJ5IGhvdyBtdWNoIGFyZWEgdGhleSBhcmUgb3ZlcmxhcHBpbmcgdGhlIGRyb3BwZWQgbm9kZVxyXG4gICAgcmV0dXJuIF8uc29ydEJ5KCB1bm9yZGVyZWRBdHRhY2hhYmxlTm9kZXMsIGF0dGFjaGFibGVOb2RlID0+IHtcclxuICAgICAgY29uc3Qgb3ZlcmxhcHBpbmdCb3VuZHMgPSBhdHRhY2hhYmxlTm9kZS5tb3ZlVGFyZ2V0LmJvdW5kcy5pbnRlcnNlY3Rpb24oIHRoaXMubW92ZVRhcmdldC5ib3VuZHMgKTtcclxuICAgICAgcmV0dXJuIG92ZXJsYXBwaW5nQm91bmRzLndpZHRoICogb3ZlcmxhcHBpbmdCb3VuZHMuaGVpZ2h0O1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuY291bnRpbmdDb21tb24ucmVnaXN0ZXIoICdDb3VudGluZ09iamVjdE5vZGUnLCBDb3VudGluZ09iamVjdE5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvdW50aW5nT2JqZWN0Tm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLGdDQUFnQztBQUNwRCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsU0FBU0MsWUFBWSxFQUFFQyxJQUFJLEVBQXNCQyxTQUFTLFFBQVEsbUNBQW1DO0FBQ3JHLE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0MsZUFBZSxNQUFNLDZCQUE2QjtBQUN6RCxPQUFPQyxjQUFjLE1BQU0sNEJBQTRCO0FBQ3ZELE9BQU9DLGNBQWMsTUFBaUMscUJBQXFCO0FBQzNFLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0Msa0JBQWtCLE1BQU0sZ0NBQWdDO0FBQy9ELE9BQU9DLG1CQUFtQixNQUFNLDRDQUE0QztBQUU1RSxPQUFPQyxTQUFTLElBQUlDLGNBQWMsUUFBUSx1Q0FBdUM7O0FBR2pGOztBQU9BO0FBQ0EsTUFBTUMsaUNBQWlDLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRTdDLE1BQU1DLGtCQUFrQixTQUFTWixJQUFJLENBQUM7RUFHcEM7O0VBR0E7O0VBR0E7O0VBR0E7O0VBSUE7O0VBR0E7O0VBR0E7O0VBR0E7O0VBR0E7O0VBSUE7O0VBR0E7O0VBR0E7O0VBSUE7O0VBR0E7O0VBR0E7O0VBS0E7O0VBR09hLFdBQVdBLENBQUVDLGNBQThCLEVBQzlCQywyQkFBdUQsRUFDdkRDLHdCQUErRixFQUMvRkMsMkJBQXVFLEVBQ3ZFQyxlQUEyQyxFQUFHO0lBRWhFLEtBQUssQ0FBQyxDQUFDO0lBRVAsTUFBTUMsT0FBTyxHQUFHVixTQUFTLENBQXlDLENBQUMsQ0FBRTtNQUNuRVcsMEJBQTBCLEVBQUUsSUFBSVosbUJBQW1CLENBQUVELGtCQUFrQixDQUFDYyxZQUFhLENBQUM7TUFDdEZDLHFCQUFxQixFQUFFLENBQUM7SUFDMUIsQ0FBQyxFQUFFSixlQUFnQixDQUFDO0lBRXBCLElBQUksQ0FBQ0osY0FBYyxHQUFHQSxjQUFjO0lBRXBDLElBQUksQ0FBQ1MsV0FBVyxHQUFHLElBQUkzQixPQUFPLENBQUU7TUFBRTRCLFVBQVUsRUFBRSxDQUFFO1FBQUVDLFNBQVMsRUFBRWI7TUFBbUIsQ0FBQztJQUFHLENBQUUsQ0FBQztJQUN2RixJQUFJLENBQUNjLFlBQVksR0FBRyxJQUFJOUIsT0FBTyxDQUFFO01BQUU0QixVQUFVLEVBQUUsQ0FBRTtRQUFFQyxTQUFTLEVBQUViO01BQW1CLENBQUM7SUFBRyxDQUFFLENBQUM7SUFDeEYsSUFBSSxDQUFDZSx5QkFBeUIsR0FBRyxJQUFJL0IsT0FBTyxDQUFFO01BQUU0QixVQUFVLEVBQUUsQ0FBRTtRQUFFQyxTQUFTLEVBQUViO01BQW1CLENBQUM7SUFBRyxDQUFFLENBQUM7SUFDckcsSUFBSSxDQUFDZ0IsZUFBZSxHQUFHLEtBQUs7SUFFNUIsSUFBSSxDQUFDYiwyQkFBMkIsR0FBR0EsMkJBQTJCO0lBRTlELElBQUksQ0FBQ0ssMEJBQTBCLEdBQUdELE9BQU8sQ0FBQ0MsMEJBQTBCO0lBRXBFLElBQUksQ0FBQ0UscUJBQXFCLEdBQUdILE9BQU8sQ0FBQ0cscUJBQXFCO0lBQzFELElBQUksQ0FBQ08sY0FBYyxHQUFHLElBQUlqQyxPQUFPLENBQUU7TUFBRTRCLFVBQVUsRUFBRSxDQUFFO1FBQUVDLFNBQVMsRUFBRWI7TUFBbUIsQ0FBQztJQUFHLENBQUUsQ0FBQztJQUMxRixJQUFJLENBQUNrQixvQkFBb0IsR0FBRyxJQUFJOUIsSUFBSSxDQUFFO01BQ3BDK0IsUUFBUSxFQUFFO0lBQ1osQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDQyxRQUFRLENBQUUsSUFBSSxDQUFDRixvQkFBcUIsQ0FBQztJQUUxQyxJQUFJLENBQUNHLFVBQVUsR0FBRyxJQUFJO0lBRXRCLElBQUksQ0FBQ0MsV0FBVyxHQUFHLElBQUlqQyxTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO01BQzVDa0MsTUFBTSxFQUFFO0lBQ1YsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDSCxRQUFRLENBQUUsSUFBSSxDQUFDRSxXQUFZLENBQUM7SUFFakMsSUFBSSxDQUFDRSxVQUFVLEdBQUcsSUFBSW5DLFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7TUFDL0NrQyxNQUFNLEVBQUU7SUFDVixDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNILFFBQVEsQ0FBRSxJQUFJLENBQUNJLFVBQVcsQ0FBQztJQUVoQyxJQUFJLENBQUNDLGdCQUFnQixHQUFHLElBQUl0QyxZQUFZLENBQUU7TUFDeEN1QyxVQUFVLEVBQUUsSUFBSTtNQUNoQkMsV0FBVyxFQUFFLE1BQU07TUFBRTtNQUNyQkMsS0FBSyxFQUFJQyxLQUF5QixJQUFNO1FBQ3RDLElBQUksQ0FBQ2QseUJBQXlCLENBQUNlLElBQUksQ0FBRSxJQUFLLENBQUM7UUFDM0MsSUFBSyxDQUFDLElBQUksQ0FBQ2QsZUFBZSxFQUFHO1VBQzNCLElBQUksQ0FBQ0wsV0FBVyxDQUFDbUIsSUFBSSxDQUFFLElBQUssQ0FBQztRQUMvQjtNQUNGLENBQUM7TUFFREMsSUFBSSxFQUFFQSxDQUFFRixLQUF5QixFQUFFRyxRQUFzQixLQUFNO1FBQzdEOUIsY0FBYyxDQUFDK0IseUJBQXlCLENBQUU5QiwyQkFBMkIsQ0FBQytCLEtBQUssRUFBRUYsUUFBUSxDQUFDRyxXQUFXLEVBQUUsS0FBTSxDQUFDO01BQzVHLENBQUM7TUFFREMsR0FBRyxFQUFFQSxDQUFBLEtBQU07UUFDVCxJQUFLLENBQUMsSUFBSSxDQUFDQyxVQUFVLEVBQUc7VUFBRTtVQUN4QmhDLDJCQUEyQixDQUFFLElBQUksQ0FBQ0gsY0FBZSxDQUFDO1VBQ2xELElBQUksQ0FBQ2UsY0FBYyxDQUFDYSxJQUFJLENBQUUsSUFBSyxDQUFDO1FBQ2xDO01BQ0Y7SUFDRixDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNMLGdCQUFnQixDQUFDYSx3QkFBd0IsQ0FBQ0MsSUFBSSxDQUFFQyxVQUFVLElBQUk7TUFDakV0QyxjQUFjLENBQUN1QyxzQkFBc0IsQ0FBQ1AsS0FBSyxHQUFHTSxVQUFVO0lBQzFELENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ2hCLFVBQVUsQ0FBQ2tCLGdCQUFnQixDQUFFLElBQUksQ0FBQ2pCLGdCQUFpQixDQUFDO0lBRXpELElBQUksQ0FBQ2tCLGlCQUFpQixHQUFHO01BQ3ZCQyxJQUFJLEVBQUVmLEtBQUssSUFBSTtRQUNiLElBQUssQ0FBQ0EsS0FBSyxDQUFDZ0IsYUFBYSxDQUFDLENBQUMsRUFBRztVQUFFO1FBQVE7UUFFeEMsTUFBTUMsWUFBWSxHQUFHLElBQUksQ0FBQ0MsbUJBQW1CLENBQUVsQixLQUFLLENBQUNtQixPQUFPLENBQUNDLEtBQU0sQ0FBQzs7UUFFcEU7UUFDQSxNQUFNQyxXQUFXLEdBQUdoRCxjQUFjLENBQUNpRCxlQUFlLENBQUUsSUFBSSxDQUFDQyxrQkFBa0IsQ0FBRU4sWUFBYSxDQUFFLENBQUMsQ0FBQ08sS0FBSztRQUVuRyxNQUFNQyxjQUFjLEdBQUcvRCxlQUFlLENBQUNnRSxnQkFBZ0IsQ0FBRXJELGNBQWMsQ0FBQ3NELG1CQUFtQixDQUFDdEIsS0FBSyxFQUFFZ0IsV0FBWSxDQUFDO1FBQ2hILE1BQU1PLGVBQWUsR0FBR3ZELGNBQWMsQ0FBQ3NELG1CQUFtQixDQUFDdEIsS0FBSyxHQUFHb0IsY0FBYzs7UUFFakY7UUFDQSxJQUFLLENBQUNBLGNBQWMsRUFBRztVQUNyQixJQUFJLENBQUNJLGtCQUFrQixDQUFFN0IsS0FBTSxDQUFDO1VBQ2hDO1FBQ0Y7UUFFQTNCLGNBQWMsQ0FBQ3lELFlBQVksQ0FBRUYsZUFBZ0IsQ0FBQztRQUU5QyxJQUFJLENBQUMxQyx5QkFBeUIsQ0FBQ2UsSUFBSSxDQUFFLElBQUssQ0FBQztRQUMzQyxJQUFJLENBQUNoQixZQUFZLENBQUNnQixJQUFJLENBQUUsSUFBSyxDQUFDOztRQUU5QjtRQUNBO1FBQ0EsTUFBTThCLGlCQUFpQixHQUFHLElBQUlwRSxjQUFjLENBQzFDOEQsY0FBYyxFQUNkLElBQUk1RCxPQUFPLENBQUVRLGNBQWMsQ0FBQzJELGdCQUFnQixDQUFDM0IsS0FBSyxDQUFDNEIsQ0FBQyxFQUFFaEIsWUFBWSxDQUFDaUIsQ0FBRSxDQUFDLEVBQUU7VUFDdEVDLHVCQUF1QixFQUFFOUQsY0FBYyxDQUFDOEQ7UUFDMUMsQ0FBRSxDQUFDO1FBQ0w1RCx3QkFBd0IsQ0FBRXlCLEtBQUssRUFBRStCLGlCQUFrQixDQUFDO01BQ3REO0lBQ0YsQ0FBQztJQUNELElBQUksQ0FBQ3RDLFdBQVcsQ0FBQ29CLGdCQUFnQixDQUFFLElBQUksQ0FBQ0MsaUJBQWtCLENBQUM7SUFFM0QsSUFBSSxDQUFDc0IsbUJBQW1CLEdBQUdDLFFBQVEsSUFBSTtNQUNyQyxJQUFJLENBQUNDLFdBQVcsR0FBR0QsUUFBUTtJQUM3QixDQUFDO0lBRUQsSUFBSSxDQUFDRSxhQUFhLEdBQUdDLEtBQUssSUFBSTtNQUM1QixJQUFJLENBQUNDLGlCQUFpQixDQUFFRCxLQUFNLENBQUM7SUFDakMsQ0FBQztJQUVELElBQUksQ0FBQ0UscUJBQXFCLEdBQUdDLGFBQWEsSUFBSTtNQUM1QyxJQUFJLENBQUNuRCxVQUFVLElBQUksSUFBSSxDQUFDQSxVQUFVLENBQUNvRCxVQUFVLENBQUVELGFBQWMsQ0FBQztJQUNoRSxDQUFDO0lBRUQsSUFBSSxDQUFDRSxvQkFBb0IsR0FBRyxJQUFJLENBQUNDLFlBQVksQ0FBQ0MsSUFBSSxDQUFFLElBQUssQ0FBQztJQUUxRCxJQUFJLENBQUNDLHNCQUFzQixHQUFHQyxjQUFjLElBQUk7TUFDOUMsSUFBS0EsY0FBYyxFQUFHO1FBQ3BCLElBQUksQ0FBQ0MsV0FBVyxDQUFDLENBQUM7TUFDcEI7SUFDRixDQUFDO0lBRUQsSUFBSSxDQUFDQyxvQkFBb0IsR0FBR0MsYUFBYSxJQUFJO01BQzNDLElBQUssQ0FBQ0EsYUFBYSxFQUFHO1FBQ3BCLElBQUksQ0FBQ0MscUJBQXFCLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMvRCxRQUFRLEdBQUcsS0FBSztNQUN2QjtJQUNGLENBQUM7O0lBRUQ7SUFDQWpCLGNBQWMsQ0FBQ2lGLGtCQUFrQixDQUFDQyxXQUFXLENBQUUsTUFBTTtNQUNuRCxJQUFJLENBQUNMLFdBQVcsQ0FBQyxDQUFDO0lBQ3BCLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtFQUNTSixZQUFZQSxDQUFBLEVBQVM7SUFDMUIsTUFBTVUsZUFBZSxHQUFHLElBQUksQ0FBQ25GLGNBQWMsQ0FBQzhELHVCQUF1QixDQUFDOUIsS0FBSzs7SUFFekU7SUFDQSxNQUFNb0QsbUJBQW1CLEdBQUcsSUFBSSxDQUFDcEYsY0FBYyxDQUFDcUYsV0FBVyxDQUFDQyxLQUFLLENBQUMsQ0FBQyxDQUFDQyxPQUFPLENBQUMsQ0FBQztJQUU3RSxJQUFJLENBQUN2RSxvQkFBb0IsQ0FBQ3dFLFFBQVEsR0FBR0MsQ0FBQyxDQUFDQyxHQUFHLENBQUVOLG1CQUFtQixFQUFFLENBQUVPLFVBQVUsRUFBRUMsS0FBSyxLQUFNO01BRXhGO01BQ0EsTUFBTUMsYUFBYSxHQUFHVCxtQkFBbUIsQ0FBRVEsS0FBSyxHQUFHLENBQUMsQ0FBRSxLQUFLRSxTQUFTO01BRXBFLE9BQU8sSUFBSXZHLGNBQWMsQ0FDdkJvRyxVQUFVLEVBQ1YsSUFBSSxHQUFHSSxJQUFJLENBQUNDLEdBQUcsQ0FBRSxJQUFJLEVBQUVKLEtBQU0sQ0FBQyxFQUFFaEcsY0FBYyxDQUF5QjtRQUNyRXFHLGtCQUFrQixFQUFFLElBQUksQ0FBQzNGLDBCQUEwQixDQUFDMEIsS0FBSztRQUN6RGtFLGNBQWMsRUFBRSxJQUFJO1FBQ3BCZixlQUFlLEVBQUVBLGVBQWU7UUFDaENnQixtQkFBbUIsRUFBRVAsS0FBSyxLQUFLLENBQUM7UUFDaENDLGFBQWEsRUFBRUEsYUFBYTtRQUM1Qk8sYUFBYSxFQUFFaEIsbUJBQW1CLENBQUNpQixNQUFNLEdBQUc7TUFDOUMsQ0FBQyxFQUFFLElBQUksQ0FBQzdGLHFCQUFzQixDQUFFLENBQUM7SUFDckMsQ0FBRSxDQUFDO0lBRUgsTUFBTThGLHFCQUFxQixHQUFHLElBQUksQ0FBQ3RGLG9CQUFvQixDQUFDd0UsUUFBUSxDQUFFLENBQUMsQ0FBb0I7SUFFdkYsTUFBTWUsVUFBVSxHQUFHLElBQUksQ0FBQ3ZGLG9CQUFvQixDQUFDd0YsTUFBTSxDQUFDQyxJQUFJLENBQUMsQ0FBQztJQUMxRCxNQUFNQyxjQUFjLEdBQUdKLHFCQUFxQixDQUFDSSxjQUFjOztJQUUzRDtJQUNBO0lBQ0E7SUFDQSxNQUFNQyxtQkFBbUIsR0FBR0QsY0FBYyxHQUFHSixxQkFBcUIsQ0FBQ00sbUJBQW1CLENBQUVGLGNBQWMsQ0FBQ0YsTUFBTyxDQUFDLEdBQ25GRCxVQUFVOztJQUV0QztJQUNBLElBQUksQ0FBQ3ZHLGNBQWMsQ0FBQzZHLFdBQVcsR0FBR04sVUFBVTs7SUFFNUM7SUFDQTtJQUNBO0lBQ0EsSUFBSSxDQUFDdkcsY0FBYyxDQUFDOEcscUJBQXFCLEdBQUdILG1CQUFtQjtJQUUvRCxJQUFLeEIsZUFBZSxFQUFHO01BQ3JCLElBQUksQ0FBQy9ELFdBQVcsQ0FBQzJGLE9BQU8sR0FBRyxJQUFJO01BRS9CLElBQUlDLHVCQUF1QixHQUFHLEtBQUs7TUFDbkMsSUFBSUMsb0JBQW9CLEdBQUcsQ0FBQztNQUM1QixJQUFJQyxtQkFBbUIsR0FBRyxDQUFDO01BRTNCLElBQUksQ0FBQ2xHLG9CQUFvQixDQUFDd0UsUUFBUSxDQUFDMkIsT0FBTyxDQUFFQyxJQUFJLElBQUk7UUFDbEQsTUFBTUMsY0FBYyxHQUFHRCxJQUFzQjtRQUU3QyxJQUFLQyxjQUFjLENBQUNsRyxVQUFVLElBQUksQ0FBQzhGLG9CQUFvQixFQUFHO1VBQ3hEQSxvQkFBb0IsR0FBR0ksY0FBYyxDQUFDVCxtQkFBbUIsQ0FBRVMsY0FBYyxDQUFDbEcsVUFBVSxDQUFDcUYsTUFBTyxDQUFDLENBQUNjLE9BQU87VUFDckcsSUFBSSxDQUFDbkcsVUFBVSxHQUFHa0csY0FBYyxDQUFDbEcsVUFBVTtVQUMzQzZGLHVCQUF1QixHQUFHLElBQUk7UUFDaEM7UUFDQSxJQUFLSyxjQUFjLENBQUNsRyxVQUFVLEVBQUc7VUFDL0IrRixtQkFBbUIsR0FBR0csY0FBYyxDQUFDVCxtQkFBbUIsQ0FBRVMsY0FBYyxDQUFDbEcsVUFBVSxDQUFDcUYsTUFBTyxDQUFDLENBQUNjLE9BQU87UUFDdEc7TUFDRixDQUFFLENBQUM7TUFDSCxNQUFNQyxPQUFPLEdBQUcsRUFBRTtNQUVsQixNQUFNQyxpQkFBaUIsR0FBR1IsdUJBQXVCLEdBQUcsSUFBSWpJLE9BQU8sQ0FDN0RrSSxvQkFBb0IsR0FBR00sT0FBTyxFQUM5QmhCLFVBQVUsQ0FBQ2tCLElBQUksR0FBR0YsT0FBTyxHQUFHLENBQUMsRUFDN0JMLG1CQUFtQixHQUFHSyxPQUFPLEVBQzdCWixtQkFBbUIsQ0FBQ2MsSUFDdEIsQ0FBQyxHQUFHLElBQUkxSSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO01BRTdCLElBQUksQ0FBQ3VDLFVBQVUsQ0FBQ29HLFNBQVMsR0FBRyxJQUFJLENBQUNwRyxVQUFVLENBQUNxRyxTQUFTLEdBQUcsSUFBSSxDQUFDckcsVUFBVSxDQUFDc0csVUFBVSxHQUFHakIsbUJBQW1CO01BQ3hHLElBQUksQ0FBQ3ZGLFdBQVcsQ0FBQ3NHLFNBQVMsR0FBRyxJQUFJLENBQUN0RyxXQUFXLENBQUN1RyxTQUFTLEdBQUcsSUFBSSxDQUFDdkcsV0FBVyxDQUFDd0csVUFBVSxHQUFHSixpQkFBaUI7SUFDM0csQ0FBQyxNQUNJO01BQ0gsSUFBSSxDQUFDcEcsV0FBVyxDQUFDMkYsT0FBTyxHQUFHLEtBQUs7TUFDaEMsSUFBSSxDQUFDekYsVUFBVSxDQUFDb0csU0FBUyxHQUFHLElBQUksQ0FBQ3BHLFVBQVUsQ0FBQ3FHLFNBQVMsR0FBRyxJQUFJLENBQUNyRyxVQUFVLENBQUNzRyxVQUFVLEdBQUdqQixtQkFBbUI7TUFDeEcsSUFBSSxDQUFDdkYsV0FBVyxDQUFDc0csU0FBUyxHQUFHLElBQUksQ0FBQ3RHLFdBQVcsQ0FBQ3VHLFNBQVMsR0FBRyxJQUFJLENBQUN2RyxXQUFXLENBQUN3RyxVQUFVLEdBQUcsSUFBSTdJLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7SUFDbkg7O0lBRUE7SUFDQSxJQUFJLENBQUM4Qix5QkFBeUIsQ0FBQ2UsSUFBSSxDQUFFLElBQUssQ0FBQztFQUM3Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDUzRCLGtCQUFrQkEsQ0FBRTdCLEtBQXlCLEVBQVM7SUFDM0Q7SUFDQSxJQUFJLENBQUNiLGVBQWUsR0FBRyxJQUFJO0lBQzNCLElBQUksQ0FBQ1MsZ0JBQWdCLENBQUNzRyxLQUFLLENBQUVsRyxLQUFNLENBQUM7SUFDcEMsSUFBSSxDQUFDYixlQUFlLEdBQUcsS0FBSztFQUM5Qjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU2dILFNBQVNBLENBQUVuRyxLQUF5QixFQUFTO0lBQ2xELElBQUssSUFBSSxDQUFDVixRQUFRLEtBQUssS0FBSyxFQUFHO01BQzdCLElBQUssSUFBSSxDQUFDOEcsa0JBQWtCLENBQUVwRyxLQUFLLENBQUNtQixPQUFPLENBQUNDLEtBQU0sQ0FBQyxDQUFDYyxDQUFDLEdBQUcsSUFBSSxDQUFDekMsV0FBVyxDQUFDNEcsTUFBTSxJQUFJLElBQUksQ0FBQ2hJLGNBQWMsQ0FBQ3NELG1CQUFtQixDQUFDdEIsS0FBSyxHQUFHLENBQUMsRUFBRztRQUNySSxJQUFJLENBQUNTLGlCQUFpQixDQUFDQyxJQUFJLENBQUVmLEtBQU0sQ0FBQztNQUN0QyxDQUFDLE1BQ0k7UUFDSCxJQUFJLENBQUNKLGdCQUFnQixDQUFDc0csS0FBSyxDQUFFbEcsS0FBTSxDQUFDO01BQ3RDO0lBQ0Y7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7RUFDU3NHLGVBQWVBLENBQUVDLFdBQW9CLEVBQVc7SUFDckQsSUFBSyxJQUFJLENBQUNsSSxjQUFjLENBQUN1QyxzQkFBc0IsQ0FBQ1AsS0FBSyxFQUFHO01BQ3RELE9BQU9tRyxNQUFNLENBQUNDLGlCQUFpQjtJQUNqQyxDQUFDLE1BQ0k7TUFDSCxNQUFNQyxZQUFZLEdBQUcsSUFBSSxDQUFDQyxtQkFBbUIsQ0FBRSxJQUFJLENBQUN0SSxjQUFjLENBQUM2RyxXQUFZLENBQUM7TUFDaEYsT0FBT2QsSUFBSSxDQUFDd0MsSUFBSSxDQUFFRixZQUFZLENBQUNHLDZCQUE2QixDQUFFTixXQUFZLENBQUUsQ0FBQztJQUMvRTtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtFQUNTTyxlQUFlQSxDQUFBLEVBQVM7SUFFN0I7SUFDQSxJQUFJLENBQUN6SSxjQUFjLENBQUMwSSxxQkFBcUIsQ0FBQ3JHLElBQUksQ0FBRSxJQUFJLENBQUNnQyxxQkFBc0IsQ0FBQztJQUM1RSxJQUFJLENBQUNyRSxjQUFjLENBQUMySSxhQUFhLENBQUN0RyxJQUFJLENBQUUsSUFBSSxDQUFDNkIsYUFBYyxDQUFDO0lBQzVELElBQUksQ0FBQ2xFLGNBQWMsQ0FBQ3VDLHNCQUFzQixDQUFDRixJQUFJLENBQUUsSUFBSSxDQUFDc0Msc0JBQXVCLENBQUM7SUFDOUUsSUFBSSxDQUFDM0UsY0FBYyxDQUFDc0QsbUJBQW1CLENBQUNqQixJQUFJLENBQUUsSUFBSSxDQUFDbUMsb0JBQXFCLENBQUM7SUFDekUsSUFBSSxDQUFDeEUsY0FBYyxDQUFDMkQsZ0JBQWdCLENBQUN0QixJQUFJLENBQUUsSUFBSSxDQUFDMEIsbUJBQW9CLENBQUM7SUFDckUsSUFBSSxDQUFDL0QsY0FBYyxDQUFDNEksb0JBQW9CLENBQUN2RyxJQUFJLENBQUUsSUFBSSxDQUFDeUMsb0JBQXFCLENBQUM7RUFDNUU7O0VBRUE7QUFDRjtBQUNBO0VBQ2tCK0QsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCLElBQUksQ0FBQzdJLGNBQWMsQ0FBQzRJLG9CQUFvQixDQUFDRSxNQUFNLENBQUUsSUFBSSxDQUFDaEUsb0JBQXFCLENBQUM7SUFDNUUsSUFBSSxDQUFDOUUsY0FBYyxDQUFDMkQsZ0JBQWdCLENBQUNtRixNQUFNLENBQUUsSUFBSSxDQUFDL0UsbUJBQW9CLENBQUM7SUFDdkUsSUFBSSxDQUFDL0QsY0FBYyxDQUFDc0QsbUJBQW1CLENBQUN3RixNQUFNLENBQUUsSUFBSSxDQUFDdEUsb0JBQXFCLENBQUM7SUFDM0UsSUFBSSxDQUFDeEUsY0FBYyxDQUFDdUMsc0JBQXNCLENBQUN1RyxNQUFNLENBQUUsSUFBSSxDQUFDbkUsc0JBQXVCLENBQUM7SUFDaEYsSUFBSSxDQUFDM0UsY0FBYyxDQUFDMkksYUFBYSxDQUFDRyxNQUFNLENBQUUsSUFBSSxDQUFDNUUsYUFBYyxDQUFDO0lBQzlELElBQUksQ0FBQ2xFLGNBQWMsQ0FBQzBJLHFCQUFxQixDQUFDSSxNQUFNLENBQUUsSUFBSSxDQUFDekUscUJBQXNCLENBQUM7O0lBRTlFO0lBQ0EsSUFBSSxDQUFDckQsb0JBQW9CLENBQUN3RSxRQUFRLENBQUMyQixPQUFPLENBQUU0QixLQUFLLElBQUlBLEtBQUssQ0FBQ0YsT0FBTyxDQUFDLENBQUUsQ0FBQztJQUN0RSxLQUFLLENBQUNBLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCOztFQUVBO0FBQ0Y7QUFDQTtFQUNTRyxtQkFBbUJBLENBQUVDLHNCQUE0QyxFQUF5QjtJQUMvRixNQUFNQyx3QkFBd0IsR0FBR0Qsc0JBQXNCLENBQUMzRCxLQUFLLENBQUMsQ0FBQztJQUMvRHRHLFdBQVcsQ0FBRWtLLHdCQUF3QixFQUFFLElBQUssQ0FBQzs7SUFFN0M7SUFDQSxNQUFNQyx3QkFBd0IsR0FBR0Qsd0JBQXdCLENBQUNFLE1BQU0sQ0FBRUMsYUFBYSxJQUFJO01BQ2pGLE9BQU9BLGFBQWEsQ0FBQ3pDLG1CQUFtQixDQUFFeUMsYUFBYSxDQUFDL0gsVUFBVSxDQUFDa0YsTUFBTyxDQUFDLENBQUM4QyxNQUFNLENBQUV6SixpQ0FBa0MsQ0FBQyxDQUNwSDBKLGdCQUFnQixDQUFFLElBQUksQ0FBQzNDLG1CQUFtQixDQUFFLElBQUksQ0FBQ3RGLFVBQVUsQ0FBQ2tGLE1BQU8sQ0FBQyxDQUFDOEMsTUFBTSxDQUFFekosaUNBQWtDLENBQUUsQ0FBQztJQUN2SCxDQUFFLENBQUM7O0lBRUg7SUFDQSxPQUFPNEYsQ0FBQyxDQUFDK0QsTUFBTSxDQUFFTCx3QkFBd0IsRUFBRU0sY0FBYyxJQUFJO01BQzNELE1BQU1DLGlCQUFpQixHQUFHRCxjQUFjLENBQUNuSSxVQUFVLENBQUNrRixNQUFNLENBQUNtRCxZQUFZLENBQUUsSUFBSSxDQUFDckksVUFBVSxDQUFDa0YsTUFBTyxDQUFDO01BQ2pHLE9BQU9rRCxpQkFBaUIsQ0FBQ0UsS0FBSyxHQUFHRixpQkFBaUIsQ0FBQ0csTUFBTTtJQUMzRCxDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUF6SyxjQUFjLENBQUMwSyxRQUFRLENBQUUsb0JBQW9CLEVBQUVoSyxrQkFBbUIsQ0FBQztBQUVuRSxlQUFlQSxrQkFBa0IifQ==