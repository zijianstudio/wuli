// Copyright 2021-2023, University of Colorado Boulder

/**
 * Node that can display a 1, 10, 100, or other style of single countingObject which can be clicked/dragged to create
 * countingObjects. Factored out from ExplorePanel.js in make-a-ten, see https://github.com/phetsims/number-play/issues/19
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BaseNumber from '../../../../counting-common/js/common/model/BaseNumber.js';
import CountingObject from '../../../../counting-common/js/common/model/CountingObject.js';
import BaseNumberNode from '../../../../counting-common/js/common/view/BaseNumberNode.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Node } from '../../../../scenery/js/imports.js';
import countingCommon from '../../countingCommon.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import CountingObjectType from '../model/CountingObjectType.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Multilink from '../../../../axon/js/Multilink.js';
class CountingCreatorNode extends Node {
  // The value that a countingObject has when created from this CountingCreatorNode.

  // The Node in which the created countingObjects are positioned in.

  // The Node that can receive input for creating a countingObject.

  // The sum of the countingObjects in the countingArea.

  // When the sum is growing, when the sum has reached (equals) this number, we turn off the frontTarget visibility.
  // When the sum is decreasing, when we have reached this number, we turn on the backTarget visibility.
  // Example: For a maxSum of 10 and a creatorNumberValue of 1, this number is 9.
  // When the sum is growing, when the sum has reached (equals) this number, we turn off the backTarget visibility.
  // When the sum is decreasing, when we have reached this number, we turn on the frontTarget visibility.
  // Example: For a maxSum of 10 and a creatorNumberValue of 1, this number is 8.
  // The offset of the backTargetNode compared to the frontTargetNode.
  // Of the two-stack that makes up the targetNode, this is the countingObjectNode in the back.
  // Of the two-stack that makes up the targetNode, this is the countingObjectNode in the front.
  // The highest possible sum of the countingArea. This CountingCreatorNode cannot create countingObjects with a sum
  // greater than this number.
  constructor(place, coordinateFrameNode, sumProperty, resetEmitter, addAndDragCountingObject, providedOptions) {
    const options = optionize()({
      countingObjectTypeProperty: new EnumerationProperty(CountingObjectType.PAPER_NUMBER),
      groupingEnabledProperty: new BooleanProperty(true),
      groupedTargetScale: 0.65,
      ungroupedTargetScale: 1,
      backTargetOffset: new Vector2(-9, -9),
      pointerAreaXDilation: 15,
      pointerAreaYDilation: 5,
      pointerAreaXShift: 0
    }, providedOptions);
    super(options);
    this.creatorNumberValue = Math.pow(10, place);
    this.coordinateFrameNode = coordinateFrameNode;
    this.sumProperty = sumProperty;
    this.maxSum = sumProperty.range.max;
    this.frontTargetVisibilitySum = this.maxSum - this.creatorNumberValue;
    this.backTargetVisibilitySum = this.frontTargetVisibilitySum - this.creatorNumberValue;
    this.backTargetOffset = options.backTargetOffset;
    this.backTargetNode = new Node();
    this.frontTargetNode = new Node();
    this.targetNode = new Node({
      cursor: 'pointer',
      children: [this.backTargetNode, this.frontTargetNode]
    });
    this.addChild(this.targetNode);

    /**
     * Creates a target that represents the frontTargetNode or backTargetNode.
     */
    const createSingleTargetNode = offset => {
      const targetNode = new Node();
      targetNode.addChild(this.createBaseNumberNode(place, options.countingObjectTypeProperty, options.groupingEnabledProperty));
      const scale = options.groupingEnabledProperty.value ? options.groupedTargetScale : options.ungroupedTargetScale;
      targetNode.scale(scale);
      targetNode.translation = offset;
      return targetNode;
    };

    // When the countingObjectType or groupingEnabled state changes, redraw the front and back targets to match their
    // new state.
    Multilink.multilink([options.countingObjectTypeProperty, options.groupingEnabledProperty], (countingObjectType, groupingEnabled) => {
      // Record what the visibility of the target nodes was before re-creating them.
      const backTargetNodeVisible = this.backTargetNode.visible;
      const frontTargetNodeVisible = this.frontTargetNode.visible;

      // Create the new target nodes.
      this.backTargetNode = createSingleTargetNode(options.backTargetOffset);
      this.frontTargetNode = createSingleTargetNode(Vector2.ZERO);

      // Set the new target nodes to their correct visibility states.
      this.backTargetNode.visible = backTargetNodeVisible;
      this.frontTargetNode.visible = frontTargetNodeVisible;

      // Swap in the new target nodes and dilate the touch area accordingly.
      this.targetNode.children = [this.backTargetNode, this.frontTargetNode];
      const pointerArea = this.targetNode.localBounds.dilatedXY(options.pointerAreaXDilation, options.pointerAreaYDilation).shiftedX(options.pointerAreaXShift);
      this.targetNode.touchArea = pointerArea;
      this.targetNode.mouseArea = pointerArea;
      this.targetNode.inputEnabled = backTargetNodeVisible || frontTargetNodeVisible;

      // Recenter ourselves after we change the bounds of the front and back targets
      if (options.center) {
        this.center = options.center;
      }
    });

    // See if targets should be made invisible when the sum increases.
    sumProperty.lazyLink(this.validateVisibilityForTargetsForIncreasingSum.bind(this));

    // Add an input listener on the targetNode for creating countingObjects.
    this.targetNode.addInputListener({
      down: event => {
        if (!event.canStartPress()) {
          return;
        }

        // We want this relative to coordinateFrameNode, so it is guaranteed to be the proper view coordinates.
        const viewPosition = coordinateFrameNode.globalToLocalPoint(event.pointer.point);
        const countingObject = new CountingObject(this.creatorNumberValue, new Vector2(0, 0), {
          groupingEnabledProperty: options.groupingEnabledProperty
        });

        // Once we have the number's bounds, we set the position so that our pointer is in the middle of the drag target.
        countingObject.setDestination(viewPosition.minus(countingObject.getDragTargetOffset()), false);

        // Create and start dragging the new paper number node
        addAndDragCountingObject(event, countingObject);
      }
    });

    // Reset the targets visibility and inputEnabled when the sim is reset..
    resetEmitter.addListener(() => {
      this.backTargetNode.visible = true;
      this.frontTargetNode.visible = true;
      this.targetNode.inputEnabled = true;
    });
  }

  /**
   * Check if either target should be made invisible, only for cases where the sum is increasing. Decreasing sum is
   * handled separately because of animations of the countingObjects.
   */
  validateVisibilityForTargetsForIncreasingSum(sum, oldSum) {
    if (sum === oldSum + this.creatorNumberValue) {
      if (sum === this.frontTargetVisibilitySum) {
        this.frontTargetNode.visible = false;
      } else if (sum === this.maxSum) {
        this.backTargetNode.visible = false;
        this.targetNode.inputEnabled = false;
      }
    }
  }

  /**
   * Checks if either the backTargetNode or frontTargetNode should be made visible again, based on the state of their
   * current visibility and the sum.
   */
  validateVisibilityForTargetsForDecreasingSum(returnedNumberValue) {
    for (let i = 0; i < returnedNumberValue / this.creatorNumberValue; i++) {
      if (!this.backTargetNode.visible && this.sumProperty.value <= this.frontTargetVisibilitySum) {
        this.backTargetNode.visible = true;
        this.targetNode.inputEnabled = true;
      } else if (!this.frontTargetNode.visible && this.sumProperty.value <= this.backTargetVisibilitySum) {
        this.frontTargetNode.visible = true;
      }
    }
  }

  /**
   * Returns the view coordinates of the target.
   */
  getOriginPosition() {
    // Trail to coordinateFrameNode, not including the coordinateFrameNode.
    const trail = this.coordinateFrameNode.getUniqueLeafTrailTo(this.targetNode).slice(1);
    const origin = this.sumProperty.value <= this.backTargetVisibilitySum ? this.frontTargetNode.localBounds.center : this.frontTargetNode.localBounds.center.plus(this.backTargetOffset);

    // Transformed to view coordinates.
    return trail.localToGlobalPoint(origin);
  }

  /**
   * Returns a BaseNumberNode to be used as the target icon.
   */
  createBaseNumberNode(place, countingObjectTypeProperty, groupingEnabledProperty) {
    return new BaseNumberNode(new BaseNumber(1, place), 1, {
      includeHandles: false,
      countingObjectType: countingObjectTypeProperty.value,
      groupingEnabled: groupingEnabledProperty.value
    });
  }
}
countingCommon.register('CountingCreatorNode', CountingCreatorNode);
export default CountingCreatorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCYXNlTnVtYmVyIiwiQ291bnRpbmdPYmplY3QiLCJCYXNlTnVtYmVyTm9kZSIsIlZlY3RvcjIiLCJOb2RlIiwiY291bnRpbmdDb21tb24iLCJFbnVtZXJhdGlvblByb3BlcnR5IiwiQ291bnRpbmdPYmplY3RUeXBlIiwiQm9vbGVhblByb3BlcnR5Iiwib3B0aW9uaXplIiwiTXVsdGlsaW5rIiwiQ291bnRpbmdDcmVhdG9yTm9kZSIsImNvbnN0cnVjdG9yIiwicGxhY2UiLCJjb29yZGluYXRlRnJhbWVOb2RlIiwic3VtUHJvcGVydHkiLCJyZXNldEVtaXR0ZXIiLCJhZGRBbmREcmFnQ291bnRpbmdPYmplY3QiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiY291bnRpbmdPYmplY3RUeXBlUHJvcGVydHkiLCJQQVBFUl9OVU1CRVIiLCJncm91cGluZ0VuYWJsZWRQcm9wZXJ0eSIsImdyb3VwZWRUYXJnZXRTY2FsZSIsInVuZ3JvdXBlZFRhcmdldFNjYWxlIiwiYmFja1RhcmdldE9mZnNldCIsInBvaW50ZXJBcmVhWERpbGF0aW9uIiwicG9pbnRlckFyZWFZRGlsYXRpb24iLCJwb2ludGVyQXJlYVhTaGlmdCIsImNyZWF0b3JOdW1iZXJWYWx1ZSIsIk1hdGgiLCJwb3ciLCJtYXhTdW0iLCJyYW5nZSIsIm1heCIsImZyb250VGFyZ2V0VmlzaWJpbGl0eVN1bSIsImJhY2tUYXJnZXRWaXNpYmlsaXR5U3VtIiwiYmFja1RhcmdldE5vZGUiLCJmcm9udFRhcmdldE5vZGUiLCJ0YXJnZXROb2RlIiwiY3Vyc29yIiwiY2hpbGRyZW4iLCJhZGRDaGlsZCIsImNyZWF0ZVNpbmdsZVRhcmdldE5vZGUiLCJvZmZzZXQiLCJjcmVhdGVCYXNlTnVtYmVyTm9kZSIsInNjYWxlIiwidmFsdWUiLCJ0cmFuc2xhdGlvbiIsIm11bHRpbGluayIsImNvdW50aW5nT2JqZWN0VHlwZSIsImdyb3VwaW5nRW5hYmxlZCIsImJhY2tUYXJnZXROb2RlVmlzaWJsZSIsInZpc2libGUiLCJmcm9udFRhcmdldE5vZGVWaXNpYmxlIiwiWkVSTyIsInBvaW50ZXJBcmVhIiwibG9jYWxCb3VuZHMiLCJkaWxhdGVkWFkiLCJzaGlmdGVkWCIsInRvdWNoQXJlYSIsIm1vdXNlQXJlYSIsImlucHV0RW5hYmxlZCIsImNlbnRlciIsImxhenlMaW5rIiwidmFsaWRhdGVWaXNpYmlsaXR5Rm9yVGFyZ2V0c0ZvckluY3JlYXNpbmdTdW0iLCJiaW5kIiwiYWRkSW5wdXRMaXN0ZW5lciIsImRvd24iLCJldmVudCIsImNhblN0YXJ0UHJlc3MiLCJ2aWV3UG9zaXRpb24iLCJnbG9iYWxUb0xvY2FsUG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJjb3VudGluZ09iamVjdCIsInNldERlc3RpbmF0aW9uIiwibWludXMiLCJnZXREcmFnVGFyZ2V0T2Zmc2V0IiwiYWRkTGlzdGVuZXIiLCJzdW0iLCJvbGRTdW0iLCJ2YWxpZGF0ZVZpc2liaWxpdHlGb3JUYXJnZXRzRm9yRGVjcmVhc2luZ1N1bSIsInJldHVybmVkTnVtYmVyVmFsdWUiLCJpIiwiZ2V0T3JpZ2luUG9zaXRpb24iLCJ0cmFpbCIsImdldFVuaXF1ZUxlYWZUcmFpbFRvIiwic2xpY2UiLCJvcmlnaW4iLCJwbHVzIiwibG9jYWxUb0dsb2JhbFBvaW50IiwiaW5jbHVkZUhhbmRsZXMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvdW50aW5nQ3JlYXRvck5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTm9kZSB0aGF0IGNhbiBkaXNwbGF5IGEgMSwgMTAsIDEwMCwgb3Igb3RoZXIgc3R5bGUgb2Ygc2luZ2xlIGNvdW50aW5nT2JqZWN0IHdoaWNoIGNhbiBiZSBjbGlja2VkL2RyYWdnZWQgdG8gY3JlYXRlXHJcbiAqIGNvdW50aW5nT2JqZWN0cy4gRmFjdG9yZWQgb3V0IGZyb20gRXhwbG9yZVBhbmVsLmpzIGluIG1ha2UtYS10ZW4sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbnVtYmVyLXBsYXkvaXNzdWVzLzE5XHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBCYXNlTnVtYmVyIGZyb20gJy4uLy4uLy4uLy4uL2NvdW50aW5nLWNvbW1vbi9qcy9jb21tb24vbW9kZWwvQmFzZU51bWJlci5qcyc7XHJcbmltcG9ydCBDb3VudGluZ09iamVjdCBmcm9tICcuLi8uLi8uLi8uLi9jb3VudGluZy1jb21tb24vanMvY29tbW9uL21vZGVsL0NvdW50aW5nT2JqZWN0LmpzJztcclxuaW1wb3J0IEJhc2VOdW1iZXJOb2RlIGZyb20gJy4uLy4uLy4uLy4uL2NvdW50aW5nLWNvbW1vbi9qcy9jb21tb24vdmlldy9CYXNlTnVtYmVyTm9kZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgTm9kZU9wdGlvbnMsIFByZXNzTGlzdGVuZXJFdmVudCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBjb3VudGluZ0NvbW1vbiBmcm9tICcuLi8uLi9jb3VudGluZ0NvbW1vbi5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IENvdW50aW5nT2JqZWN0VHlwZSBmcm9tICcuLi9tb2RlbC9Db3VudGluZ09iamVjdFR5cGUuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuXHJcbiAgLy8gdGhlIHR5cGUgb2Ygb3VyIGNvdW50aW5nT2JqZWN0IGJlaW5nIGRpc3BsYXllZFxyXG4gIGNvdW50aW5nT2JqZWN0VHlwZVByb3BlcnR5PzogVFJlYWRPbmx5UHJvcGVydHk8Q291bnRpbmdPYmplY3RUeXBlPjtcclxuXHJcbiAgLy8gd2hldGhlciBncm91cGluZyBpcyBlbmFibGVkIGZvciB0aGUgZGlzcGxheWVkIGNvdW50aW5nT2JqZWN0XHJcbiAgZ3JvdXBpbmdFbmFibGVkUHJvcGVydHk/OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gdGhlIHNjYWxlIG9mIHRoZSB0YXJnZXROb2RlIHdoZW4gZ3JvdXBpbmcgaXMgdHVybmVkIG9uXHJcbiAgZ3JvdXBlZFRhcmdldFNjYWxlPzogbnVtYmVyO1xyXG5cclxuICAvLyB0aGUgc2NhbGUgb2YgdGhlIHRhcmdldE5vZGUgd2hlbiBncm91cGluZyBpcyB0dXJuZWQgb2ZmXHJcbiAgdW5ncm91cGVkVGFyZ2V0U2NhbGU/OiBudW1iZXI7XHJcblxyXG4gIC8vIHRoZSBvZmZzZXQgb2YgdGhlIGJhY2tUYXJnZXROb2RlIGNvbXBhcmVkIHRvIHRoZSBmcm9udFRhcmdldE5vZGVcclxuICBiYWNrVGFyZ2V0T2Zmc2V0PzogVmVjdG9yMjtcclxuXHJcbiAgLy8gU2V0IGZvciB0b3VjaCBhbmQgbW91c2UgYXJlYXNcclxuICBwb2ludGVyQXJlYVhEaWxhdGlvbj86IG51bWJlcjtcclxuICBwb2ludGVyQXJlYVlEaWxhdGlvbj86IG51bWJlcjtcclxuICBwb2ludGVyQXJlYVhTaGlmdD86IG51bWJlcjtcclxufTtcclxudHlwZSBDb3VudGluZ0NyZWF0b3JOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZU9wdGlvbnM7XHJcblxyXG5jbGFzcyBDb3VudGluZ0NyZWF0b3JOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8vIFRoZSB2YWx1ZSB0aGF0IGEgY291bnRpbmdPYmplY3QgaGFzIHdoZW4gY3JlYXRlZCBmcm9tIHRoaXMgQ291bnRpbmdDcmVhdG9yTm9kZS5cclxuICBwcml2YXRlIHJlYWRvbmx5IGNyZWF0b3JOdW1iZXJWYWx1ZTogbnVtYmVyO1xyXG5cclxuICAvLyBUaGUgTm9kZSBpbiB3aGljaCB0aGUgY3JlYXRlZCBjb3VudGluZ09iamVjdHMgYXJlIHBvc2l0aW9uZWQgaW4uXHJcbiAgcHJpdmF0ZSBjb29yZGluYXRlRnJhbWVOb2RlOiBOb2RlO1xyXG5cclxuICAvLyBUaGUgTm9kZSB0aGF0IGNhbiByZWNlaXZlIGlucHV0IGZvciBjcmVhdGluZyBhIGNvdW50aW5nT2JqZWN0LlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgdGFyZ2V0Tm9kZTogTm9kZTtcclxuXHJcbiAgLy8gVGhlIHN1bSBvZiB0aGUgY291bnRpbmdPYmplY3RzIGluIHRoZSBjb3VudGluZ0FyZWEuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBzdW1Qcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPjtcclxuXHJcbiAgLy8gV2hlbiB0aGUgc3VtIGlzIGdyb3dpbmcsIHdoZW4gdGhlIHN1bSBoYXMgcmVhY2hlZCAoZXF1YWxzKSB0aGlzIG51bWJlciwgd2UgdHVybiBvZmYgdGhlIGZyb250VGFyZ2V0IHZpc2liaWxpdHkuXHJcbiAgLy8gV2hlbiB0aGUgc3VtIGlzIGRlY3JlYXNpbmcsIHdoZW4gd2UgaGF2ZSByZWFjaGVkIHRoaXMgbnVtYmVyLCB3ZSB0dXJuIG9uIHRoZSBiYWNrVGFyZ2V0IHZpc2liaWxpdHkuXHJcbiAgLy8gRXhhbXBsZTogRm9yIGEgbWF4U3VtIG9mIDEwIGFuZCBhIGNyZWF0b3JOdW1iZXJWYWx1ZSBvZiAxLCB0aGlzIG51bWJlciBpcyA5LlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZnJvbnRUYXJnZXRWaXNpYmlsaXR5U3VtOiBudW1iZXI7XHJcblxyXG4gIC8vIFdoZW4gdGhlIHN1bSBpcyBncm93aW5nLCB3aGVuIHRoZSBzdW0gaGFzIHJlYWNoZWQgKGVxdWFscykgdGhpcyBudW1iZXIsIHdlIHR1cm4gb2ZmIHRoZSBiYWNrVGFyZ2V0IHZpc2liaWxpdHkuXHJcbiAgLy8gV2hlbiB0aGUgc3VtIGlzIGRlY3JlYXNpbmcsIHdoZW4gd2UgaGF2ZSByZWFjaGVkIHRoaXMgbnVtYmVyLCB3ZSB0dXJuIG9uIHRoZSBmcm9udFRhcmdldCB2aXNpYmlsaXR5LlxyXG4gIC8vIEV4YW1wbGU6IEZvciBhIG1heFN1bSBvZiAxMCBhbmQgYSBjcmVhdG9yTnVtYmVyVmFsdWUgb2YgMSwgdGhpcyBudW1iZXIgaXMgOC5cclxuICBwcml2YXRlIHJlYWRvbmx5IGJhY2tUYXJnZXRWaXNpYmlsaXR5U3VtOiBudW1iZXI7XHJcblxyXG4gIC8vIFRoZSBvZmZzZXQgb2YgdGhlIGJhY2tUYXJnZXROb2RlIGNvbXBhcmVkIHRvIHRoZSBmcm9udFRhcmdldE5vZGUuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBiYWNrVGFyZ2V0T2Zmc2V0OiBWZWN0b3IyO1xyXG5cclxuICAvLyBPZiB0aGUgdHdvLXN0YWNrIHRoYXQgbWFrZXMgdXAgdGhlIHRhcmdldE5vZGUsIHRoaXMgaXMgdGhlIGNvdW50aW5nT2JqZWN0Tm9kZSBpbiB0aGUgYmFjay5cclxuICBwcml2YXRlIGJhY2tUYXJnZXROb2RlOiBOb2RlO1xyXG5cclxuICAvLyBPZiB0aGUgdHdvLXN0YWNrIHRoYXQgbWFrZXMgdXAgdGhlIHRhcmdldE5vZGUsIHRoaXMgaXMgdGhlIGNvdW50aW5nT2JqZWN0Tm9kZSBpbiB0aGUgZnJvbnQuXHJcbiAgcHJpdmF0ZSBmcm9udFRhcmdldE5vZGU6IE5vZGU7XHJcblxyXG4gIC8vIFRoZSBoaWdoZXN0IHBvc3NpYmxlIHN1bSBvZiB0aGUgY291bnRpbmdBcmVhLiBUaGlzIENvdW50aW5nQ3JlYXRvck5vZGUgY2Fubm90IGNyZWF0ZSBjb3VudGluZ09iamVjdHMgd2l0aCBhIHN1bVxyXG4gIC8vIGdyZWF0ZXIgdGhhbiB0aGlzIG51bWJlci5cclxuICBwcml2YXRlIHJlYWRvbmx5IG1heFN1bTogbnVtYmVyO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHBsYWNlOiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlRnJhbWVOb2RlOiBOb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgc3VtUHJvcGVydHk6IE51bWJlclByb3BlcnR5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgcmVzZXRFbWl0dGVyOiBURW1pdHRlcixcclxuICAgICAgICAgICAgICAgICAgICAgIGFkZEFuZERyYWdDb3VudGluZ09iamVjdDogKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50LCBjb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QgKSA9PiB2b2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zPzogQ291bnRpbmdDcmVhdG9yTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDb3VudGluZ0NyZWF0b3JOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcbiAgICAgIGNvdW50aW5nT2JqZWN0VHlwZVByb3BlcnR5OiBuZXcgRW51bWVyYXRpb25Qcm9wZXJ0eSggQ291bnRpbmdPYmplY3RUeXBlLlBBUEVSX05VTUJFUiApLFxyXG4gICAgICBncm91cGluZ0VuYWJsZWRQcm9wZXJ0eTogbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApLFxyXG4gICAgICBncm91cGVkVGFyZ2V0U2NhbGU6IDAuNjUsXHJcbiAgICAgIHVuZ3JvdXBlZFRhcmdldFNjYWxlOiAxLFxyXG4gICAgICBiYWNrVGFyZ2V0T2Zmc2V0OiBuZXcgVmVjdG9yMiggLTksIC05ICksXHJcblxyXG4gICAgICBwb2ludGVyQXJlYVhEaWxhdGlvbjogMTUsXHJcbiAgICAgIHBvaW50ZXJBcmVhWURpbGF0aW9uOiA1LFxyXG4gICAgICBwb2ludGVyQXJlYVhTaGlmdDogMFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmNyZWF0b3JOdW1iZXJWYWx1ZSA9IE1hdGgucG93KCAxMCwgcGxhY2UgKTtcclxuXHJcbiAgICB0aGlzLmNvb3JkaW5hdGVGcmFtZU5vZGUgPSBjb29yZGluYXRlRnJhbWVOb2RlO1xyXG5cclxuICAgIHRoaXMuc3VtUHJvcGVydHkgPSBzdW1Qcm9wZXJ0eTtcclxuXHJcbiAgICB0aGlzLm1heFN1bSA9IHN1bVByb3BlcnR5LnJhbmdlLm1heDtcclxuXHJcbiAgICB0aGlzLmZyb250VGFyZ2V0VmlzaWJpbGl0eVN1bSA9IHRoaXMubWF4U3VtIC0gdGhpcy5jcmVhdG9yTnVtYmVyVmFsdWU7XHJcbiAgICB0aGlzLmJhY2tUYXJnZXRWaXNpYmlsaXR5U3VtID0gdGhpcy5mcm9udFRhcmdldFZpc2liaWxpdHlTdW0gLSB0aGlzLmNyZWF0b3JOdW1iZXJWYWx1ZTtcclxuXHJcbiAgICB0aGlzLmJhY2tUYXJnZXRPZmZzZXQgPSBvcHRpb25zLmJhY2tUYXJnZXRPZmZzZXQ7XHJcblxyXG4gICAgdGhpcy5iYWNrVGFyZ2V0Tm9kZSA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmZyb250VGFyZ2V0Tm9kZSA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgdGhpcy50YXJnZXROb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgIGNoaWxkcmVuOiBbIHRoaXMuYmFja1RhcmdldE5vZGUsIHRoaXMuZnJvbnRUYXJnZXROb2RlIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMudGFyZ2V0Tm9kZSApO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIHRhcmdldCB0aGF0IHJlcHJlc2VudHMgdGhlIGZyb250VGFyZ2V0Tm9kZSBvciBiYWNrVGFyZ2V0Tm9kZS5cclxuICAgICAqL1xyXG4gICAgY29uc3QgY3JlYXRlU2luZ2xlVGFyZ2V0Tm9kZSA9ICggb2Zmc2V0OiBWZWN0b3IyICk6IE5vZGUgPT4ge1xyXG4gICAgICBjb25zdCB0YXJnZXROb2RlID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICAgIHRhcmdldE5vZGUuYWRkQ2hpbGQoIHRoaXMuY3JlYXRlQmFzZU51bWJlck5vZGUoIHBsYWNlLCBvcHRpb25zLmNvdW50aW5nT2JqZWN0VHlwZVByb3BlcnR5LCBvcHRpb25zLmdyb3VwaW5nRW5hYmxlZFByb3BlcnR5ICkgKTtcclxuICAgICAgY29uc3Qgc2NhbGUgPSBvcHRpb25zLmdyb3VwaW5nRW5hYmxlZFByb3BlcnR5LnZhbHVlID8gb3B0aW9ucy5ncm91cGVkVGFyZ2V0U2NhbGUgOiBvcHRpb25zLnVuZ3JvdXBlZFRhcmdldFNjYWxlO1xyXG4gICAgICB0YXJnZXROb2RlLnNjYWxlKCBzY2FsZSApO1xyXG5cclxuICAgICAgdGFyZ2V0Tm9kZS50cmFuc2xhdGlvbiA9IG9mZnNldDtcclxuICAgICAgcmV0dXJuIHRhcmdldE5vZGU7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIGNvdW50aW5nT2JqZWN0VHlwZSBvciBncm91cGluZ0VuYWJsZWQgc3RhdGUgY2hhbmdlcywgcmVkcmF3IHRoZSBmcm9udCBhbmQgYmFjayB0YXJnZXRzIHRvIG1hdGNoIHRoZWlyXHJcbiAgICAvLyBuZXcgc3RhdGUuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIG9wdGlvbnMuY291bnRpbmdPYmplY3RUeXBlUHJvcGVydHksIG9wdGlvbnMuZ3JvdXBpbmdFbmFibGVkUHJvcGVydHkgXSxcclxuICAgICAgKCBjb3VudGluZ09iamVjdFR5cGUsIGdyb3VwaW5nRW5hYmxlZCApID0+IHtcclxuXHJcbiAgICAgICAgLy8gUmVjb3JkIHdoYXQgdGhlIHZpc2liaWxpdHkgb2YgdGhlIHRhcmdldCBub2RlcyB3YXMgYmVmb3JlIHJlLWNyZWF0aW5nIHRoZW0uXHJcbiAgICAgICAgY29uc3QgYmFja1RhcmdldE5vZGVWaXNpYmxlID0gdGhpcy5iYWNrVGFyZ2V0Tm9kZS52aXNpYmxlO1xyXG4gICAgICAgIGNvbnN0IGZyb250VGFyZ2V0Tm9kZVZpc2libGUgPSB0aGlzLmZyb250VGFyZ2V0Tm9kZS52aXNpYmxlO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgdGhlIG5ldyB0YXJnZXQgbm9kZXMuXHJcbiAgICAgICAgdGhpcy5iYWNrVGFyZ2V0Tm9kZSA9IGNyZWF0ZVNpbmdsZVRhcmdldE5vZGUoIG9wdGlvbnMuYmFja1RhcmdldE9mZnNldCApO1xyXG4gICAgICAgIHRoaXMuZnJvbnRUYXJnZXROb2RlID0gY3JlYXRlU2luZ2xlVGFyZ2V0Tm9kZSggVmVjdG9yMi5aRVJPICk7XHJcblxyXG4gICAgICAgIC8vIFNldCB0aGUgbmV3IHRhcmdldCBub2RlcyB0byB0aGVpciBjb3JyZWN0IHZpc2liaWxpdHkgc3RhdGVzLlxyXG4gICAgICAgIHRoaXMuYmFja1RhcmdldE5vZGUudmlzaWJsZSA9IGJhY2tUYXJnZXROb2RlVmlzaWJsZTtcclxuICAgICAgICB0aGlzLmZyb250VGFyZ2V0Tm9kZS52aXNpYmxlID0gZnJvbnRUYXJnZXROb2RlVmlzaWJsZTtcclxuXHJcbiAgICAgICAgLy8gU3dhcCBpbiB0aGUgbmV3IHRhcmdldCBub2RlcyBhbmQgZGlsYXRlIHRoZSB0b3VjaCBhcmVhIGFjY29yZGluZ2x5LlxyXG4gICAgICAgIHRoaXMudGFyZ2V0Tm9kZS5jaGlsZHJlbiA9IFsgdGhpcy5iYWNrVGFyZ2V0Tm9kZSwgdGhpcy5mcm9udFRhcmdldE5vZGUgXTtcclxuXHJcbiAgICAgICAgY29uc3QgcG9pbnRlckFyZWEgPSB0aGlzLnRhcmdldE5vZGUubG9jYWxCb3VuZHNcclxuICAgICAgICAgIC5kaWxhdGVkWFkoIG9wdGlvbnMucG9pbnRlckFyZWFYRGlsYXRpb24sIG9wdGlvbnMucG9pbnRlckFyZWFZRGlsYXRpb24gKVxyXG4gICAgICAgICAgLnNoaWZ0ZWRYKCBvcHRpb25zLnBvaW50ZXJBcmVhWFNoaWZ0ICk7XHJcbiAgICAgICAgdGhpcy50YXJnZXROb2RlLnRvdWNoQXJlYSA9IHBvaW50ZXJBcmVhO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0Tm9kZS5tb3VzZUFyZWEgPSBwb2ludGVyQXJlYTtcclxuXHJcbiAgICAgICAgdGhpcy50YXJnZXROb2RlLmlucHV0RW5hYmxlZCA9IGJhY2tUYXJnZXROb2RlVmlzaWJsZSB8fCBmcm9udFRhcmdldE5vZGVWaXNpYmxlO1xyXG5cclxuICAgICAgICAvLyBSZWNlbnRlciBvdXJzZWx2ZXMgYWZ0ZXIgd2UgY2hhbmdlIHRoZSBib3VuZHMgb2YgdGhlIGZyb250IGFuZCBiYWNrIHRhcmdldHNcclxuICAgICAgICBpZiAoIG9wdGlvbnMuY2VudGVyICkge1xyXG4gICAgICAgICAgdGhpcy5jZW50ZXIgPSBvcHRpb25zLmNlbnRlcjtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBTZWUgaWYgdGFyZ2V0cyBzaG91bGQgYmUgbWFkZSBpbnZpc2libGUgd2hlbiB0aGUgc3VtIGluY3JlYXNlcy5cclxuICAgIHN1bVByb3BlcnR5LmxhenlMaW5rKCB0aGlzLnZhbGlkYXRlVmlzaWJpbGl0eUZvclRhcmdldHNGb3JJbmNyZWFzaW5nU3VtLmJpbmQoIHRoaXMgKSApO1xyXG5cclxuICAgIC8vIEFkZCBhbiBpbnB1dCBsaXN0ZW5lciBvbiB0aGUgdGFyZ2V0Tm9kZSBmb3IgY3JlYXRpbmcgY291bnRpbmdPYmplY3RzLlxyXG4gICAgdGhpcy50YXJnZXROb2RlLmFkZElucHV0TGlzdGVuZXIoIHtcclxuICAgICAgZG93bjogKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICkgPT4ge1xyXG4gICAgICAgIGlmICggIWV2ZW50LmNhblN0YXJ0UHJlc3MoKSApIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIC8vIFdlIHdhbnQgdGhpcyByZWxhdGl2ZSB0byBjb29yZGluYXRlRnJhbWVOb2RlLCBzbyBpdCBpcyBndWFyYW50ZWVkIHRvIGJlIHRoZSBwcm9wZXIgdmlldyBjb29yZGluYXRlcy5cclxuICAgICAgICBjb25zdCB2aWV3UG9zaXRpb24gPSBjb29yZGluYXRlRnJhbWVOb2RlLmdsb2JhbFRvTG9jYWxQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApO1xyXG4gICAgICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0ID0gbmV3IENvdW50aW5nT2JqZWN0KCB0aGlzLmNyZWF0b3JOdW1iZXJWYWx1ZSwgbmV3IFZlY3RvcjIoIDAsIDAgKSwge1xyXG4gICAgICAgICAgZ3JvdXBpbmdFbmFibGVkUHJvcGVydHk6IG9wdGlvbnMuZ3JvdXBpbmdFbmFibGVkUHJvcGVydHlcclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIC8vIE9uY2Ugd2UgaGF2ZSB0aGUgbnVtYmVyJ3MgYm91bmRzLCB3ZSBzZXQgdGhlIHBvc2l0aW9uIHNvIHRoYXQgb3VyIHBvaW50ZXIgaXMgaW4gdGhlIG1pZGRsZSBvZiB0aGUgZHJhZyB0YXJnZXQuXHJcbiAgICAgICAgY291bnRpbmdPYmplY3Quc2V0RGVzdGluYXRpb24oIHZpZXdQb3NpdGlvbi5taW51cyggY291bnRpbmdPYmplY3QuZ2V0RHJhZ1RhcmdldE9mZnNldCgpICksIGZhbHNlICk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhbmQgc3RhcnQgZHJhZ2dpbmcgdGhlIG5ldyBwYXBlciBudW1iZXIgbm9kZVxyXG4gICAgICAgIGFkZEFuZERyYWdDb3VudGluZ09iamVjdCggZXZlbnQsIGNvdW50aW5nT2JqZWN0ICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBSZXNldCB0aGUgdGFyZ2V0cyB2aXNpYmlsaXR5IGFuZCBpbnB1dEVuYWJsZWQgd2hlbiB0aGUgc2ltIGlzIHJlc2V0Li5cclxuICAgIHJlc2V0RW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICB0aGlzLmJhY2tUYXJnZXROb2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICB0aGlzLmZyb250VGFyZ2V0Tm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgdGhpcy50YXJnZXROb2RlLmlucHV0RW5hYmxlZCA9IHRydWU7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayBpZiBlaXRoZXIgdGFyZ2V0IHNob3VsZCBiZSBtYWRlIGludmlzaWJsZSwgb25seSBmb3IgY2FzZXMgd2hlcmUgdGhlIHN1bSBpcyBpbmNyZWFzaW5nLiBEZWNyZWFzaW5nIHN1bSBpc1xyXG4gICAqIGhhbmRsZWQgc2VwYXJhdGVseSBiZWNhdXNlIG9mIGFuaW1hdGlvbnMgb2YgdGhlIGNvdW50aW5nT2JqZWN0cy5cclxuICAgKi9cclxuICBwcml2YXRlIHZhbGlkYXRlVmlzaWJpbGl0eUZvclRhcmdldHNGb3JJbmNyZWFzaW5nU3VtKCBzdW06IG51bWJlciwgb2xkU3VtOiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBpZiAoIHN1bSA9PT0gb2xkU3VtICsgdGhpcy5jcmVhdG9yTnVtYmVyVmFsdWUgKSB7XHJcbiAgICAgIGlmICggc3VtID09PSB0aGlzLmZyb250VGFyZ2V0VmlzaWJpbGl0eVN1bSApIHtcclxuICAgICAgICB0aGlzLmZyb250VGFyZ2V0Tm9kZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHN1bSA9PT0gdGhpcy5tYXhTdW0gKSB7XHJcbiAgICAgICAgdGhpcy5iYWNrVGFyZ2V0Tm9kZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy50YXJnZXROb2RlLmlucHV0RW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVja3MgaWYgZWl0aGVyIHRoZSBiYWNrVGFyZ2V0Tm9kZSBvciBmcm9udFRhcmdldE5vZGUgc2hvdWxkIGJlIG1hZGUgdmlzaWJsZSBhZ2FpbiwgYmFzZWQgb24gdGhlIHN0YXRlIG9mIHRoZWlyXHJcbiAgICogY3VycmVudCB2aXNpYmlsaXR5IGFuZCB0aGUgc3VtLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB2YWxpZGF0ZVZpc2liaWxpdHlGb3JUYXJnZXRzRm9yRGVjcmVhc2luZ1N1bSggcmV0dXJuZWROdW1iZXJWYWx1ZTogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcmV0dXJuZWROdW1iZXJWYWx1ZSAvIHRoaXMuY3JlYXRvck51bWJlclZhbHVlOyBpKysgKSB7XHJcbiAgICAgIGlmICggIXRoaXMuYmFja1RhcmdldE5vZGUudmlzaWJsZSAmJiB0aGlzLnN1bVByb3BlcnR5LnZhbHVlIDw9IHRoaXMuZnJvbnRUYXJnZXRWaXNpYmlsaXR5U3VtICkge1xyXG4gICAgICAgIHRoaXMuYmFja1RhcmdldE5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy50YXJnZXROb2RlLmlucHV0RW5hYmxlZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoICF0aGlzLmZyb250VGFyZ2V0Tm9kZS52aXNpYmxlICYmIHRoaXMuc3VtUHJvcGVydHkudmFsdWUgPD0gdGhpcy5iYWNrVGFyZ2V0VmlzaWJpbGl0eVN1bSApIHtcclxuICAgICAgICB0aGlzLmZyb250VGFyZ2V0Tm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdmlldyBjb29yZGluYXRlcyBvZiB0aGUgdGFyZ2V0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRPcmlnaW5Qb3NpdGlvbigpOiBWZWN0b3IyIHtcclxuXHJcbiAgICAvLyBUcmFpbCB0byBjb29yZGluYXRlRnJhbWVOb2RlLCBub3QgaW5jbHVkaW5nIHRoZSBjb29yZGluYXRlRnJhbWVOb2RlLlxyXG4gICAgY29uc3QgdHJhaWwgPSB0aGlzLmNvb3JkaW5hdGVGcmFtZU5vZGUuZ2V0VW5pcXVlTGVhZlRyYWlsVG8oIHRoaXMudGFyZ2V0Tm9kZSApLnNsaWNlKCAxICk7XHJcblxyXG4gICAgY29uc3Qgb3JpZ2luID0gdGhpcy5zdW1Qcm9wZXJ0eS52YWx1ZSA8PSB0aGlzLmJhY2tUYXJnZXRWaXNpYmlsaXR5U3VtID9cclxuICAgICAgICAgICAgICAgICAgIHRoaXMuZnJvbnRUYXJnZXROb2RlLmxvY2FsQm91bmRzLmNlbnRlciA6XHJcbiAgICAgICAgICAgICAgICAgICB0aGlzLmZyb250VGFyZ2V0Tm9kZS5sb2NhbEJvdW5kcy5jZW50ZXIucGx1cyggdGhpcy5iYWNrVGFyZ2V0T2Zmc2V0ICk7XHJcblxyXG4gICAgLy8gVHJhbnNmb3JtZWQgdG8gdmlldyBjb29yZGluYXRlcy5cclxuICAgIHJldHVybiB0cmFpbC5sb2NhbFRvR2xvYmFsUG9pbnQoIG9yaWdpbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIEJhc2VOdW1iZXJOb2RlIHRvIGJlIHVzZWQgYXMgdGhlIHRhcmdldCBpY29uLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY3JlYXRlQmFzZU51bWJlck5vZGUoIHBsYWNlOiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnRpbmdPYmplY3RUeXBlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PENvdW50aW5nT2JqZWN0VHlwZT4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXBpbmdFbmFibGVkUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+ICk6IEJhc2VOdW1iZXJOb2RlIHtcclxuXHJcbiAgICByZXR1cm4gbmV3IEJhc2VOdW1iZXJOb2RlKCBuZXcgQmFzZU51bWJlciggMSwgcGxhY2UgKSwgMSwge1xyXG4gICAgICBpbmNsdWRlSGFuZGxlczogZmFsc2UsXHJcbiAgICAgIGNvdW50aW5nT2JqZWN0VHlwZTogY291bnRpbmdPYmplY3RUeXBlUHJvcGVydHkudmFsdWUsXHJcbiAgICAgIGdyb3VwaW5nRW5hYmxlZDogZ3JvdXBpbmdFbmFibGVkUHJvcGVydHkudmFsdWVcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmNvdW50aW5nQ29tbW9uLnJlZ2lzdGVyKCAnQ291bnRpbmdDcmVhdG9yTm9kZScsIENvdW50aW5nQ3JlYXRvck5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgQ291bnRpbmdDcmVhdG9yTm9kZTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0sMkRBQTJEO0FBQ2xGLE9BQU9DLGNBQWMsTUFBTSwrREFBK0Q7QUFDMUYsT0FBT0MsY0FBYyxNQUFNLDhEQUE4RDtBQUN6RixPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELFNBQVNDLElBQUksUUFBeUMsbUNBQW1DO0FBQ3pGLE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFFcEQsT0FBT0MsbUJBQW1CLE1BQU0sNENBQTRDO0FBQzVFLE9BQU9DLGtCQUFrQixNQUFNLGdDQUFnQztBQUUvRCxPQUFPQyxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFDN0QsT0FBT0MsU0FBUyxNQUFNLGtDQUFrQztBQTJCeEQsTUFBTUMsbUJBQW1CLFNBQVNQLElBQUksQ0FBQztFQUVyQzs7RUFH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