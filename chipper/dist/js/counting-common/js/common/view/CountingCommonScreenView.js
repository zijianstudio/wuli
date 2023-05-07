// Copyright 2021-2023, University of Colorado Boulder

/**
 * Common ScreenView for CommonModel.
 *
 * @author Sharfudeen Ashraf
 */

import Property from '../../../../axon/js/Property.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node, Plane } from '../../../../scenery/js/imports.js';
import ClosestDragForwardingListener from '../../../../sun/js/ClosestDragForwardingListener.js';
import countingCommon from '../../countingCommon.js';
import CountingCommonConstants from '../CountingCommonConstants.js';
import ArithmeticRules from '../model/ArithmeticRules.js';
import CountingObjectNode from './CountingObjectNode.js';
import Tandem from '../../../../tandem/js/Tandem.js';

// types

class CountingCommonScreenView extends ScreenView {
  // Where all of the paper numbers are. NOTE: Subtypes need to add this as a child with the proper place in layering
  // (this common view doesn't do that).
  // The view coordinates where numbers can be dragged. Can update when the sim is resized.
  // Handle touches nearby to the numbers, and interpret those as the proper drag.
  // CountingObject.id => {CountingObjectNode} - lookup map for efficiency
  constructor(model) {
    super({
      tandem: Tandem.OPT_OUT
    });
    this.model = model;
    this.countingObjectLayerNode = new Node();
    this.countingObjectNodeMap = {};
    this.availableViewBoundsProperty = new Property(ScreenView.DEFAULT_LAYOUT_BOUNDS);
    this.closestDragForwardingListener = new ClosestDragForwardingListener(30, 0);
    const backgroundDragTarget = new Plane();
    backgroundDragTarget.addInputListener(this.closestDragForwardingListener);
    this.addChild(backgroundDragTarget);

    // Persistent, no need to unlink
    this.availableViewBoundsProperty.lazyLink(availableViewBounds => {
      model.countingObjects.forEach(countingObject => {
        countingObject.setConstrainedDestination(availableViewBounds, countingObject.positionProperty.value);
      });
    });
    this.resetAllButton = new ResetAllButton({
      listener: () => {
        model.reset();
        this.reset();
      }
    });
    this.addChild(this.resetAllButton);
  }

  /**
   * Used to work around super initialization order
   */
  finishInitialization() {
    const countingObjectAddedListener = this.onCountingObjectAdded.bind(this);
    const countingObjectRemovedListener = this.onCountingObjectRemoved.bind(this);

    // Add nodes for every already-existing paper number
    this.model.countingObjects.forEach(countingObjectAddedListener);

    // Add and remove nodes to match the model
    this.model.countingObjects.addItemAddedListener(countingObjectAddedListener);
    this.model.countingObjects.addItemRemovedListener(countingObjectRemovedListener);
  }

  /**
   * Add a paper number to the model and immediately start dragging it with the provided event.
   *
   * @param event - The Scenery event that triggered this.
   * @param countingObject - The paper number to add and then drag
   */
  addAndDragCountingObject(event, countingObject) {
    // Add it and lookup the related node.
    this.model.addCountingObject(countingObject);
    const countingObjectNode = this.findCountingObjectNode(countingObject);
    countingObjectNode.startSyntheticDrag(event);
  }

  /**
   * Creates and adds a CountingObjectNode.
   */
  onCountingObjectAdded(countingObject) {
    const countingObjectNode = new CountingObjectNode(countingObject, this.availableViewBoundsProperty, this.addAndDragCountingObject.bind(this), this.tryToCombineCountingObjects.bind(this));
    this.countingObjectNodeMap[countingObjectNode.countingObject.id] = countingObjectNode;
    this.countingObjectLayerNode.addChild(countingObjectNode);
    countingObjectNode.attachListeners();
    this.closestDragForwardingListener.addDraggableItem(countingObjectNode);
    return countingObjectNode;
  }

  /**
   * Handles removing the relevant CountingObjectNode
   */
  onCountingObjectRemoved(countingObject) {
    const countingObjectNode = this.findCountingObjectNode(countingObject);
    delete this.countingObjectNodeMap[countingObjectNode.countingObject.id];
    this.closestDragForwardingListener.removeDraggableItem(countingObjectNode);
    countingObjectNode.dispose();
  }

  /**
   * Given a {CountingObject}, find our current display ({CountingObjectNode}) of it.
   */
  findCountingObjectNode(countingObject) {
    const result = this.countingObjectNodeMap[countingObject.id];
    assert && assert(result, 'Did not find matching Node');
    return result;
  }

  /**
   * When the user drops a paper number they were dragging, see if it can combine with any other nearby paper numbers.
   */
  tryToCombineCountingObjects(draggedCountingObject) {
    const draggedNode = this.findCountingObjectNode(draggedCountingObject);
    const draggedNumberValue = draggedCountingObject.numberValueProperty.value;
    const allCountingObjectNodes = this.countingObjectLayerNode.children;
    const droppedNodes = draggedNode.findAttachableNodes(allCountingObjectNodes);

    // Check them in reverse order (the one on the top should get more priority)
    droppedNodes.reverse();
    if (droppedNodes.length) {
      const droppedNode = droppedNodes[0];
      const droppedCountingObject = droppedNode.countingObject;
      const droppedNumberValue = droppedCountingObject.numberValueProperty.value;
      if (ArithmeticRules.canAddNumbers(draggedNumberValue, droppedNumberValue)) {
        this.model.collapseNumberModels(this.availableViewBoundsProperty.value, draggedCountingObject, droppedCountingObject);
      } else {
        // repel numbers - show rejection
        this.model.repelAway(this.availableViewBoundsProperty.value, draggedCountingObject, droppedCountingObject, (leftCountingObject, rightCountingObject) => {
          return {
            left: -CountingCommonConstants.MOVE_AWAY_DISTANCE[leftCountingObject.digitLength],
            right: CountingCommonConstants.MOVE_AWAY_DISTANCE[rightCountingObject.digitLength]
          };
        });
      }
    }
  }

  /**
   * Meant for subtypes to override to do additional component layout. Can't override layout(), as it takes additional
   * parameters that we may not have access to.
   */
  layoutControls() {
    this.resetAllButton.right = this.visibleBoundsProperty.value.right - 10;
    this.resetAllButton.bottom = this.visibleBoundsProperty.value.bottom - 10;
  }

  /**
   * Some views may need to constrain the vertical room at the top (for dragging numbers) due to a status bar.
   * This should be overridden to return the value required.
   *
   * @returns - Amount in view coordinates to leave at the top of the screen
   */
  getTopBoundsOffset() {
    return 0;
  }
  layout(bounds) {
    super.layout(bounds);

    // Some views may need to make extra room for a status bar
    const top = this.visibleBoundsProperty.value.minY + this.getTopBoundsOffset();
    this.availableViewBoundsProperty.value = this.visibleBoundsProperty.value.withMinY(top);
    this.layoutControls();
  }

  /**
   * To reset the view, should be overridden
   */
  reset() {
    // Meant to be overridden
  }
}
countingCommon.register('CountingCommonScreenView', CountingCommonScreenView);
export default CountingCommonScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlblZpZXciLCJSZXNldEFsbEJ1dHRvbiIsIk5vZGUiLCJQbGFuZSIsIkNsb3Nlc3REcmFnRm9yd2FyZGluZ0xpc3RlbmVyIiwiY291bnRpbmdDb21tb24iLCJDb3VudGluZ0NvbW1vbkNvbnN0YW50cyIsIkFyaXRobWV0aWNSdWxlcyIsIkNvdW50aW5nT2JqZWN0Tm9kZSIsIlRhbmRlbSIsIkNvdW50aW5nQ29tbW9uU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0YW5kZW0iLCJPUFRfT1VUIiwiY291bnRpbmdPYmplY3RMYXllck5vZGUiLCJjb3VudGluZ09iamVjdE5vZGVNYXAiLCJhdmFpbGFibGVWaWV3Qm91bmRzUHJvcGVydHkiLCJERUZBVUxUX0xBWU9VVF9CT1VORFMiLCJjbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lciIsImJhY2tncm91bmREcmFnVGFyZ2V0IiwiYWRkSW5wdXRMaXN0ZW5lciIsImFkZENoaWxkIiwibGF6eUxpbmsiLCJhdmFpbGFibGVWaWV3Qm91bmRzIiwiY291bnRpbmdPYmplY3RzIiwiZm9yRWFjaCIsImNvdW50aW5nT2JqZWN0Iiwic2V0Q29uc3RyYWluZWREZXN0aW5hdGlvbiIsInBvc2l0aW9uUHJvcGVydHkiLCJ2YWx1ZSIsInJlc2V0QWxsQnV0dG9uIiwibGlzdGVuZXIiLCJyZXNldCIsImZpbmlzaEluaXRpYWxpemF0aW9uIiwiY291bnRpbmdPYmplY3RBZGRlZExpc3RlbmVyIiwib25Db3VudGluZ09iamVjdEFkZGVkIiwiYmluZCIsImNvdW50aW5nT2JqZWN0UmVtb3ZlZExpc3RlbmVyIiwib25Db3VudGluZ09iamVjdFJlbW92ZWQiLCJhZGRJdGVtQWRkZWRMaXN0ZW5lciIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJhZGRBbmREcmFnQ291bnRpbmdPYmplY3QiLCJldmVudCIsImFkZENvdW50aW5nT2JqZWN0IiwiY291bnRpbmdPYmplY3ROb2RlIiwiZmluZENvdW50aW5nT2JqZWN0Tm9kZSIsInN0YXJ0U3ludGhldGljRHJhZyIsInRyeVRvQ29tYmluZUNvdW50aW5nT2JqZWN0cyIsImlkIiwiYXR0YWNoTGlzdGVuZXJzIiwiYWRkRHJhZ2dhYmxlSXRlbSIsInJlbW92ZURyYWdnYWJsZUl0ZW0iLCJkaXNwb3NlIiwicmVzdWx0IiwiYXNzZXJ0IiwiZHJhZ2dlZENvdW50aW5nT2JqZWN0IiwiZHJhZ2dlZE5vZGUiLCJkcmFnZ2VkTnVtYmVyVmFsdWUiLCJudW1iZXJWYWx1ZVByb3BlcnR5IiwiYWxsQ291bnRpbmdPYmplY3ROb2RlcyIsImNoaWxkcmVuIiwiZHJvcHBlZE5vZGVzIiwiZmluZEF0dGFjaGFibGVOb2RlcyIsInJldmVyc2UiLCJsZW5ndGgiLCJkcm9wcGVkTm9kZSIsImRyb3BwZWRDb3VudGluZ09iamVjdCIsImRyb3BwZWROdW1iZXJWYWx1ZSIsImNhbkFkZE51bWJlcnMiLCJjb2xsYXBzZU51bWJlck1vZGVscyIsInJlcGVsQXdheSIsImxlZnRDb3VudGluZ09iamVjdCIsInJpZ2h0Q291bnRpbmdPYmplY3QiLCJsZWZ0IiwiTU9WRV9BV0FZX0RJU1RBTkNFIiwiZGlnaXRMZW5ndGgiLCJyaWdodCIsImxheW91dENvbnRyb2xzIiwidmlzaWJsZUJvdW5kc1Byb3BlcnR5IiwiYm90dG9tIiwiZ2V0VG9wQm91bmRzT2Zmc2V0IiwibGF5b3V0IiwiYm91bmRzIiwidG9wIiwibWluWSIsIndpdGhNaW5ZIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb3VudGluZ0NvbW1vblNjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29tbW9uIFNjcmVlblZpZXcgZm9yIENvbW1vbk1vZGVsLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUGxhbmUsIFByZXNzTGlzdGVuZXJFdmVudCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ2xvc2VzdERyYWdGb3J3YXJkaW5nTGlzdGVuZXIuanMnO1xyXG5pbXBvcnQgY291bnRpbmdDb21tb24gZnJvbSAnLi4vLi4vY291bnRpbmdDb21tb24uanMnO1xyXG5pbXBvcnQgQ291bnRpbmdDb21tb25Db25zdGFudHMgZnJvbSAnLi4vQ291bnRpbmdDb21tb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgQXJpdGhtZXRpY1J1bGVzIGZyb20gJy4uL21vZGVsL0FyaXRobWV0aWNSdWxlcy5qcyc7XHJcbmltcG9ydCBDb3VudGluZ09iamVjdE5vZGUgZnJvbSAnLi9Db3VudGluZ09iamVjdE5vZGUuanMnO1xyXG5pbXBvcnQgQ291bnRpbmdDb21tb25Nb2RlbCBmcm9tICcuLi9tb2RlbC9Db3VudGluZ0NvbW1vbk1vZGVsLmpzJztcclxuaW1wb3J0IENvdW50aW5nT2JqZWN0IGZyb20gJy4uL21vZGVsL0NvdW50aW5nT2JqZWN0LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5cclxuLy8gdHlwZXNcclxuZXhwb3J0IHR5cGUgQ291bnRpbmdPYmplY3ROb2RlTWFwID0gUmVjb3JkPG51bWJlciwgQ291bnRpbmdPYmplY3ROb2RlPjtcclxuXHJcbmNsYXNzIENvdW50aW5nQ29tbW9uU2NyZWVuVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG5cclxuICBwdWJsaWMgbW9kZWw6IENvdW50aW5nQ29tbW9uTW9kZWw7XHJcblxyXG4gIC8vIFdoZXJlIGFsbCBvZiB0aGUgcGFwZXIgbnVtYmVycyBhcmUuIE5PVEU6IFN1YnR5cGVzIG5lZWQgdG8gYWRkIHRoaXMgYXMgYSBjaGlsZCB3aXRoIHRoZSBwcm9wZXIgcGxhY2UgaW4gbGF5ZXJpbmdcclxuICAvLyAodGhpcyBjb21tb24gdmlldyBkb2Vzbid0IGRvIHRoYXQpLlxyXG4gIHByb3RlY3RlZCBjb3VudGluZ09iamVjdExheWVyTm9kZTogTm9kZTtcclxuXHJcbiAgLy8gVGhlIHZpZXcgY29vcmRpbmF0ZXMgd2hlcmUgbnVtYmVycyBjYW4gYmUgZHJhZ2dlZC4gQ2FuIHVwZGF0ZSB3aGVuIHRoZSBzaW0gaXMgcmVzaXplZC5cclxuICBwcml2YXRlIHJlYWRvbmx5IGF2YWlsYWJsZVZpZXdCb3VuZHNQcm9wZXJ0eTogUHJvcGVydHk8Qm91bmRzMj47XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHJlc2V0QWxsQnV0dG9uOiBSZXNldEFsbEJ1dHRvbjtcclxuXHJcbiAgLy8gSGFuZGxlIHRvdWNoZXMgbmVhcmJ5IHRvIHRoZSBudW1iZXJzLCBhbmQgaW50ZXJwcmV0IHRob3NlIGFzIHRoZSBwcm9wZXIgZHJhZy5cclxuICBwcml2YXRlIHJlYWRvbmx5IGNsb3Nlc3REcmFnRm9yd2FyZGluZ0xpc3RlbmVyOiBDbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lcjtcclxuXHJcbiAgLy8gQ291bnRpbmdPYmplY3QuaWQgPT4ge0NvdW50aW5nT2JqZWN0Tm9kZX0gLSBsb29rdXAgbWFwIGZvciBlZmZpY2llbmN5XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjb3VudGluZ09iamVjdE5vZGVNYXA6IENvdW50aW5nT2JqZWN0Tm9kZU1hcDtcclxuXHJcbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCBtb2RlbDogQ291bnRpbmdDb21tb25Nb2RlbCApIHtcclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcblxyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdExheWVyTm9kZSA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmNvdW50aW5nT2JqZWN0Tm9kZU1hcCA9IHt9O1xyXG4gICAgdGhpcy5hdmFpbGFibGVWaWV3Qm91bmRzUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIFNjcmVlblZpZXcuREVGQVVMVF9MQVlPVVRfQk9VTkRTICk7XHJcblxyXG4gICAgdGhpcy5jbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lciA9IG5ldyBDbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lciggMzAsIDAgKTtcclxuICAgIGNvbnN0IGJhY2tncm91bmREcmFnVGFyZ2V0ID0gbmV3IFBsYW5lKCk7XHJcbiAgICBiYWNrZ3JvdW5kRHJhZ1RhcmdldC5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLmNsb3Nlc3REcmFnRm9yd2FyZGluZ0xpc3RlbmVyICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBiYWNrZ3JvdW5kRHJhZ1RhcmdldCApO1xyXG5cclxuICAgIC8vIFBlcnNpc3RlbnQsIG5vIG5lZWQgdG8gdW5saW5rXHJcbiAgICB0aGlzLmF2YWlsYWJsZVZpZXdCb3VuZHNQcm9wZXJ0eS5sYXp5TGluayggKCBhdmFpbGFibGVWaWV3Qm91bmRzOiBCb3VuZHMyICkgPT4ge1xyXG4gICAgICBtb2RlbC5jb3VudGluZ09iamVjdHMuZm9yRWFjaCggY291bnRpbmdPYmplY3QgPT4ge1xyXG4gICAgICAgIGNvdW50aW5nT2JqZWN0LnNldENvbnN0cmFpbmVkRGVzdGluYXRpb24oIGF2YWlsYWJsZVZpZXdCb3VuZHMsIGNvdW50aW5nT2JqZWN0LnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMucmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5yZXNldEFsbEJ1dHRvbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXNlZCB0byB3b3JrIGFyb3VuZCBzdXBlciBpbml0aWFsaXphdGlvbiBvcmRlclxyXG4gICAqL1xyXG4gIHB1YmxpYyBmaW5pc2hJbml0aWFsaXphdGlvbigpOiB2b2lkIHtcclxuICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0QWRkZWRMaXN0ZW5lciA9IHRoaXMub25Db3VudGluZ09iamVjdEFkZGVkLmJpbmQoIHRoaXMgKTtcclxuICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0UmVtb3ZlZExpc3RlbmVyID0gdGhpcy5vbkNvdW50aW5nT2JqZWN0UmVtb3ZlZC5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgLy8gQWRkIG5vZGVzIGZvciBldmVyeSBhbHJlYWR5LWV4aXN0aW5nIHBhcGVyIG51bWJlclxyXG4gICAgdGhpcy5tb2RlbC5jb3VudGluZ09iamVjdHMuZm9yRWFjaCggY291bnRpbmdPYmplY3RBZGRlZExpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gQWRkIGFuZCByZW1vdmUgbm9kZXMgdG8gbWF0Y2ggdGhlIG1vZGVsXHJcbiAgICB0aGlzLm1vZGVsLmNvdW50aW5nT2JqZWN0cy5hZGRJdGVtQWRkZWRMaXN0ZW5lciggY291bnRpbmdPYmplY3RBZGRlZExpc3RlbmVyICk7XHJcbiAgICB0aGlzLm1vZGVsLmNvdW50aW5nT2JqZWN0cy5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCBjb3VudGluZ09iamVjdFJlbW92ZWRMaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGEgcGFwZXIgbnVtYmVyIHRvIHRoZSBtb2RlbCBhbmQgaW1tZWRpYXRlbHkgc3RhcnQgZHJhZ2dpbmcgaXQgd2l0aCB0aGUgcHJvdmlkZWQgZXZlbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZXZlbnQgLSBUaGUgU2NlbmVyeSBldmVudCB0aGF0IHRyaWdnZXJlZCB0aGlzLlxyXG4gICAqIEBwYXJhbSBjb3VudGluZ09iamVjdCAtIFRoZSBwYXBlciBudW1iZXIgdG8gYWRkIGFuZCB0aGVuIGRyYWdcclxuICAgKi9cclxuICBwdWJsaWMgYWRkQW5kRHJhZ0NvdW50aW5nT2JqZWN0KCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50LCBjb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QgKTogdm9pZCB7XHJcbiAgICAvLyBBZGQgaXQgYW5kIGxvb2t1cCB0aGUgcmVsYXRlZCBub2RlLlxyXG4gICAgdGhpcy5tb2RlbC5hZGRDb3VudGluZ09iamVjdCggY291bnRpbmdPYmplY3QgKTtcclxuXHJcbiAgICBjb25zdCBjb3VudGluZ09iamVjdE5vZGUgPSB0aGlzLmZpbmRDb3VudGluZ09iamVjdE5vZGUoIGNvdW50aW5nT2JqZWN0ICk7XHJcbiAgICBjb3VudGluZ09iamVjdE5vZGUuc3RhcnRTeW50aGV0aWNEcmFnKCBldmVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbmQgYWRkcyBhIENvdW50aW5nT2JqZWN0Tm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgb25Db3VudGluZ09iamVjdEFkZGVkKCBjb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QgKTogQ291bnRpbmdPYmplY3ROb2RlIHtcclxuICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0Tm9kZSA9IG5ldyBDb3VudGluZ09iamVjdE5vZGUoIGNvdW50aW5nT2JqZWN0LCB0aGlzLmF2YWlsYWJsZVZpZXdCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5hZGRBbmREcmFnQ291bnRpbmdPYmplY3QuYmluZCggdGhpcyApLCB0aGlzLnRyeVRvQ29tYmluZUNvdW50aW5nT2JqZWN0cy5iaW5kKCB0aGlzICkgKTtcclxuXHJcbiAgICB0aGlzLmNvdW50aW5nT2JqZWN0Tm9kZU1hcFsgY291bnRpbmdPYmplY3ROb2RlLmNvdW50aW5nT2JqZWN0LmlkIF0gPSBjb3VudGluZ09iamVjdE5vZGU7XHJcbiAgICB0aGlzLmNvdW50aW5nT2JqZWN0TGF5ZXJOb2RlLmFkZENoaWxkKCBjb3VudGluZ09iamVjdE5vZGUgKTtcclxuICAgIGNvdW50aW5nT2JqZWN0Tm9kZS5hdHRhY2hMaXN0ZW5lcnMoKTtcclxuXHJcbiAgICB0aGlzLmNsb3Nlc3REcmFnRm9yd2FyZGluZ0xpc3RlbmVyLmFkZERyYWdnYWJsZUl0ZW0oIGNvdW50aW5nT2JqZWN0Tm9kZSApO1xyXG5cclxuICAgIHJldHVybiBjb3VudGluZ09iamVjdE5vZGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIYW5kbGVzIHJlbW92aW5nIHRoZSByZWxldmFudCBDb3VudGluZ09iamVjdE5vZGVcclxuICAgKi9cclxuICBwdWJsaWMgb25Db3VudGluZ09iamVjdFJlbW92ZWQoIGNvdW50aW5nT2JqZWN0OiBDb3VudGluZ09iamVjdCApOiB2b2lkIHtcclxuICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0Tm9kZSA9IHRoaXMuZmluZENvdW50aW5nT2JqZWN0Tm9kZSggY291bnRpbmdPYmplY3QgKTtcclxuXHJcbiAgICBkZWxldGUgdGhpcy5jb3VudGluZ09iamVjdE5vZGVNYXBbIGNvdW50aW5nT2JqZWN0Tm9kZS5jb3VudGluZ09iamVjdC5pZCBdO1xyXG4gICAgdGhpcy5jbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lci5yZW1vdmVEcmFnZ2FibGVJdGVtKCBjb3VudGluZ09iamVjdE5vZGUgKTtcclxuICAgIGNvdW50aW5nT2JqZWN0Tm9kZS5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBhIHtDb3VudGluZ09iamVjdH0sIGZpbmQgb3VyIGN1cnJlbnQgZGlzcGxheSAoe0NvdW50aW5nT2JqZWN0Tm9kZX0pIG9mIGl0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBmaW5kQ291bnRpbmdPYmplY3ROb2RlKCBjb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QgKTogQ291bnRpbmdPYmplY3ROb2RlIHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuY291bnRpbmdPYmplY3ROb2RlTWFwWyBjb3VudGluZ09iamVjdC5pZCBdO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0LCAnRGlkIG5vdCBmaW5kIG1hdGNoaW5nIE5vZGUnICk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hlbiB0aGUgdXNlciBkcm9wcyBhIHBhcGVyIG51bWJlciB0aGV5IHdlcmUgZHJhZ2dpbmcsIHNlZSBpZiBpdCBjYW4gY29tYmluZSB3aXRoIGFueSBvdGhlciBuZWFyYnkgcGFwZXIgbnVtYmVycy5cclxuICAgKi9cclxuICBwdWJsaWMgdHJ5VG9Db21iaW5lQ291bnRpbmdPYmplY3RzKCBkcmFnZ2VkQ291bnRpbmdPYmplY3Q6IENvdW50aW5nT2JqZWN0ICk6IHZvaWQge1xyXG4gICAgY29uc3QgZHJhZ2dlZE5vZGUgPSB0aGlzLmZpbmRDb3VudGluZ09iamVjdE5vZGUoIGRyYWdnZWRDb3VudGluZ09iamVjdCApO1xyXG4gICAgY29uc3QgZHJhZ2dlZE51bWJlclZhbHVlID0gZHJhZ2dlZENvdW50aW5nT2JqZWN0Lm51bWJlclZhbHVlUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBhbGxDb3VudGluZ09iamVjdE5vZGVzID0gdGhpcy5jb3VudGluZ09iamVjdExheWVyTm9kZS5jaGlsZHJlbjtcclxuICAgIGNvbnN0IGRyb3BwZWROb2RlcyA9IGRyYWdnZWROb2RlLmZpbmRBdHRhY2hhYmxlTm9kZXMoIGFsbENvdW50aW5nT2JqZWN0Tm9kZXMgYXMgQ291bnRpbmdPYmplY3ROb2RlW10gKTtcclxuXHJcbiAgICAvLyBDaGVjayB0aGVtIGluIHJldmVyc2Ugb3JkZXIgKHRoZSBvbmUgb24gdGhlIHRvcCBzaG91bGQgZ2V0IG1vcmUgcHJpb3JpdHkpXHJcbiAgICBkcm9wcGVkTm9kZXMucmV2ZXJzZSgpO1xyXG5cclxuICAgIGlmICggZHJvcHBlZE5vZGVzLmxlbmd0aCApIHtcclxuICAgICAgY29uc3QgZHJvcHBlZE5vZGUgPSBkcm9wcGVkTm9kZXNbIDAgXTtcclxuICAgICAgY29uc3QgZHJvcHBlZENvdW50aW5nT2JqZWN0ID0gZHJvcHBlZE5vZGUuY291bnRpbmdPYmplY3Q7XHJcbiAgICAgIGNvbnN0IGRyb3BwZWROdW1iZXJWYWx1ZSA9IGRyb3BwZWRDb3VudGluZ09iamVjdC5udW1iZXJWYWx1ZVByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgICAgaWYgKCBBcml0aG1ldGljUnVsZXMuY2FuQWRkTnVtYmVycyggZHJhZ2dlZE51bWJlclZhbHVlLCBkcm9wcGVkTnVtYmVyVmFsdWUgKSApIHtcclxuICAgICAgICB0aGlzLm1vZGVsLmNvbGxhcHNlTnVtYmVyTW9kZWxzKCB0aGlzLmF2YWlsYWJsZVZpZXdCb3VuZHNQcm9wZXJ0eS52YWx1ZSwgZHJhZ2dlZENvdW50aW5nT2JqZWN0LCBkcm9wcGVkQ291bnRpbmdPYmplY3QgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyByZXBlbCBudW1iZXJzIC0gc2hvdyByZWplY3Rpb25cclxuICAgICAgICB0aGlzLm1vZGVsLnJlcGVsQXdheSggdGhpcy5hdmFpbGFibGVWaWV3Qm91bmRzUHJvcGVydHkudmFsdWUsIGRyYWdnZWRDb3VudGluZ09iamVjdCwgZHJvcHBlZENvdW50aW5nT2JqZWN0LFxyXG4gICAgICAgICAgKCBsZWZ0Q291bnRpbmdPYmplY3Q6IENvdW50aW5nT2JqZWN0LCByaWdodENvdW50aW5nT2JqZWN0OiBDb3VudGluZ09iamVjdCApID0+IHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgbGVmdDogLUNvdW50aW5nQ29tbW9uQ29uc3RhbnRzLk1PVkVfQVdBWV9ESVNUQU5DRVsgbGVmdENvdW50aW5nT2JqZWN0LmRpZ2l0TGVuZ3RoIF0sXHJcbiAgICAgICAgICAgICAgcmlnaHQ6IENvdW50aW5nQ29tbW9uQ29uc3RhbnRzLk1PVkVfQVdBWV9ESVNUQU5DRVsgcmlnaHRDb3VudGluZ09iamVjdC5kaWdpdExlbmd0aCBdXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1lYW50IGZvciBzdWJ0eXBlcyB0byBvdmVycmlkZSB0byBkbyBhZGRpdGlvbmFsIGNvbXBvbmVudCBsYXlvdXQuIENhbid0IG92ZXJyaWRlIGxheW91dCgpLCBhcyBpdCB0YWtlcyBhZGRpdGlvbmFsXHJcbiAgICogcGFyYW1ldGVycyB0aGF0IHdlIG1heSBub3QgaGF2ZSBhY2Nlc3MgdG8uXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGxheW91dENvbnRyb2xzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5yZXNldEFsbEJ1dHRvbi5yaWdodCA9IHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LnZhbHVlLnJpZ2h0IC0gMTA7XHJcbiAgICB0aGlzLnJlc2V0QWxsQnV0dG9uLmJvdHRvbSA9IHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LnZhbHVlLmJvdHRvbSAtIDEwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU29tZSB2aWV3cyBtYXkgbmVlZCB0byBjb25zdHJhaW4gdGhlIHZlcnRpY2FsIHJvb20gYXQgdGhlIHRvcCAoZm9yIGRyYWdnaW5nIG51bWJlcnMpIGR1ZSB0byBhIHN0YXR1cyBiYXIuXHJcbiAgICogVGhpcyBzaG91bGQgYmUgb3ZlcnJpZGRlbiB0byByZXR1cm4gdGhlIHZhbHVlIHJlcXVpcmVkLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgLSBBbW91bnQgaW4gdmlldyBjb29yZGluYXRlcyB0byBsZWF2ZSBhdCB0aGUgdG9wIG9mIHRoZSBzY3JlZW5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VG9wQm91bmRzT2Zmc2V0KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gMDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBsYXlvdXQoIGJvdW5kczogQm91bmRzMiApOiB2b2lkIHtcclxuICAgIHN1cGVyLmxheW91dCggYm91bmRzICk7XHJcblxyXG4gICAgLy8gU29tZSB2aWV3cyBtYXkgbmVlZCB0byBtYWtlIGV4dHJhIHJvb20gZm9yIGEgc3RhdHVzIGJhclxyXG4gICAgY29uc3QgdG9wID0gdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkudmFsdWUubWluWSArIHRoaXMuZ2V0VG9wQm91bmRzT2Zmc2V0KCk7XHJcbiAgICB0aGlzLmF2YWlsYWJsZVZpZXdCb3VuZHNQcm9wZXJ0eS52YWx1ZSA9IHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LnZhbHVlLndpdGhNaW5ZKCB0b3AgKTtcclxuXHJcbiAgICB0aGlzLmxheW91dENvbnRyb2xzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUbyByZXNldCB0aGUgdmlldywgc2hvdWxkIGJlIG92ZXJyaWRkZW5cclxuICAgKi9cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICAvLyBNZWFudCB0byBiZSBvdmVycmlkZGVuXHJcbiAgfVxyXG59XHJcblxyXG5jb3VudGluZ0NvbW1vbi5yZWdpc3RlciggJ0NvdW50aW5nQ29tbW9uU2NyZWVuVmlldycsIENvdW50aW5nQ29tbW9uU2NyZWVuVmlldyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ291bnRpbmdDb21tb25TY3JlZW5WaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFD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