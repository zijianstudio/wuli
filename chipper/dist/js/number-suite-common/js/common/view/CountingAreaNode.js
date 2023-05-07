// Copyright 2022-2023, University of Colorado Boulder

/**
 * Node for a CountingArea. This file was copied from counting-common/common/view/CountingCommonScreenView.js and
 * make-a-ten/explore/view/MakeATenExploreScreenView.js and then modified by @chrisklus to be used in number-suite-common.
 * See https://github.com/phetsims/number-suite-common/issues/41.
 *
 * @author Sharfudeen Ashraf
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import CountingObjectNode from '../../../../counting-common/js/common/view/CountingObjectNode.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import ClosestDragForwardingListener from '../../../../sun/js/ClosestDragForwardingListener.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import CountingObjectCreatorPanel from './CountingObjectCreatorPanel.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import CountingCommonConstants from '../../../../counting-common/js/common/CountingCommonConstants.js';
import CountingObjectType from '../../../../counting-common/js/common/model/CountingObjectType.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import optionize from '../../../../phet-core/js/optionize.js';
import DraggableTenFrameNode from '../../lab/view/DraggableTenFrameNode.js';
import Multilink from '../../../../axon/js/Multilink.js';
// constants
const COUNTING_OBJECT_HANDLE_OFFSET_Y = -9.5; // empirically determined to be an appropriate length for just 10s and 1s, in screen coords

const COUNTING_OBJECT_REPEL_DISTANCE = 10; // empirically determined to look nice, in screen coords, repel this much
const COUNTING_OBJECT_REPEL_WHEN_CLOSER_THAN = 7; // If object are closer than this, than commence repel

class CountingAreaNode extends Node {
  // called when a countingObject finishes animating, see onNumberAnimationFinished

  // called when a countingObjectNode finishes being dragged, see onNumberDragFinished

  // our model

  // CountingObject.id => {CountingObjectNode} - lookup map for efficiency

  // The bounds of the countingArea where countingObjects can be dragged, named so that it doesn't overwrite Node.boundsProperty

  // see options.viewHasIndependentModel for doc

  // handle touches nearby to the countingObjects, and interpret those as the proper drag.

  // Node parent for all CountingObjectNode instances, created if not provided.

  getCountingObjectOrigin = () => Vector2.ZERO;
  constructor(countingArea, countingObjectTypeProperty, countingAreaBoundsProperty, providedOptions) {
    const options = optionize()({
      countingObjectLayerNode: null,
      backgroundDragTargetNode: null,
      viewHasIndependentModel: true,
      includeCountingObjectCreatorPanel: true,
      creatorPanelX: null,
      returnZoneProperty: null
    }, providedOptions);
    super(options);
    this.animationFinishedListener = countingObject => this.onNumberAnimationFinished(countingObject);
    this.dragFinishedListener = countingObjectNode => this.onNumberDragFinished(countingObjectNode.countingObject);
    this.countingArea = countingArea;
    this.countingObjectNodeMap = {};
    this.countingAreaBoundsProperty = countingAreaBoundsProperty;
    this.countingObjectTypeProperty = countingObjectTypeProperty;
    this.viewHasIndependentModel = options.viewHasIndependentModel;
    this.closestDragForwardingListener = new ClosestDragForwardingListener(30, 0);
    let backgroundDragTargetNode = null;
    if (options.backgroundDragTargetNode) {
      backgroundDragTargetNode = options.backgroundDragTargetNode;
    } else {
      backgroundDragTargetNode = new Rectangle(countingAreaBoundsProperty.value);
      this.addChild(backgroundDragTargetNode);
    }
    backgroundDragTargetNode.addInputListener(this.closestDragForwardingListener);
    const countingObjectAddedListener = this.onCountingObjectAdded.bind(this);
    const countingObjectRemovedListener = this.onCountingObjectRemoved.bind(this);

    // Add nodes for every already-existing countingObject
    countingArea.countingObjects.forEach(countingObjectAddedListener);

    // Add and remove nodes to match the countingArea
    countingArea.countingObjects.addItemAddedListener(countingObjectAddedListener);
    countingArea.countingObjects.addItemRemovedListener(countingObjectRemovedListener);

    // Persistent, no need to unlink
    this.countingAreaBoundsProperty.lazyLink(() => {
      this.constrainAllPositions();
    });

    // create the CountingObjectCreatorPanel
    this.countingObjectCreatorPanel = new CountingObjectCreatorPanel(countingArea, this, options.countingObjectCreatorPanelOptions);
    if (options.creatorPanelX) {
      this.countingObjectCreatorPanel.centerX = options.creatorPanelX;
    } else {
      this.countingObjectCreatorPanel.left = countingAreaBoundsProperty.value.minX + CountingCommonConstants.COUNTING_AREA_MARGIN;
    }

    // set the y position of the CountingObjectCreatorPanel. NOTE: It is assumed below during initialization that the
    // CountingObjectCreatorPanel is positioned along the bottom of the countingArea bounds
    const updateCountingObjectCreatorPanelPosition = () => {
      this.countingObjectCreatorPanel.bottom = countingAreaBoundsProperty.value.bottom - CountingCommonConstants.COUNTING_AREA_MARGIN;
    };
    countingAreaBoundsProperty.link(updateCountingObjectCreatorPanelPosition);
    this.transformEmitter.addListener(updateCountingObjectCreatorPanelPosition);
    if (options.includeCountingObjectCreatorPanel) {
      this.addChild(this.countingObjectCreatorPanel);
      this.getCountingObjectOrigin = () => this.countingObjectCreatorPanel.countingCreatorNode.getOriginPosition();
    }

    // initialize the model with positioning information
    if (this.viewHasIndependentModel) {
      const countingObjectCreatorNodeHeight = options.includeCountingObjectCreatorPanel ? this.countingObjectCreatorPanel.height : 0;
      this.countingArea.initialize(this.getCountingObjectOrigin, countingObjectCreatorNodeHeight, countingAreaBoundsProperty);
    }
    if (options.countingObjectLayerNode) {
      this.countingObjectLayerNode = options.countingObjectLayerNode;
    } else {
      this.countingObjectLayerNode = new Node();

      // add the countingObjectLayerNode after the creator panel
      this.addChild(this.countingObjectLayerNode);
    }
    this.includeCountingObjectCreatorPanel = options.includeCountingObjectCreatorPanel;
    this.returnZoneProperty = options.returnZoneProperty;

    // In the view only because of countingObjectNode.updateNumber()
    Multilink.lazyMultilink([this.countingArea.groupingEnabledProperty, countingObjectTypeProperty], groupingEnabled => {
      // When grouping is turned off, break apart any object groups
      !groupingEnabled && this.countingArea.breakApartCountingObjects(true);
      for (let i = 0; i < this.countingArea.countingObjects.length; i++) {
        const countingObject = this.countingArea.countingObjects[i];
        const countingObjectNode = this.getCountingObjectNode(countingObject);

        // Need to call this on countingObjects that are NOT included in sum.
        countingObjectNode.updateNumber();

        // Don't constrain a destination to objects not included in sum.
        if (!countingObject.isAnimating) {
          // In general this should be superfluous, but the "card" around a counting object type has larger bounds
          // than the object itself, so we need to handle this.
          countingObject.setConstrainedDestination(this.countingAreaBoundsProperty.value, countingObject.positionProperty.value);
        }
      }
    });
  }

  /**
   * Add a countingObject to the countingArea and immediately start dragging it with the provided event.
   *
   * @param event - The Scenery event that triggered this.
   * @param countingObject - The countingObject to add and then drag
   *
   * TODO: same as CountingCommonScreenView.addAndDragCountingObject https://github.com/phetsims/number-suite-common/issues/41
   * only difference is call to countingArea.calculateTotal()
   */
  addAndDragCountingObject(event, countingObject) {
    // Add it and lookup the related node.
    this.countingArea.addCountingObject(countingObject);
    this.countingArea.calculateTotal();
    const countingObjectNode = this.getCountingObjectNode(countingObject);
    countingObjectNode.startSyntheticDrag(event);
  }

  /**
   * Creates and adds a CountingObjectNode.
   *
   * TODO: same work as CountingCommonScreenView.onCountingObjectAdded https://github.com/phetsims/number-suite-common/issues/41
   * Add listener calls are duplicated from MakeATenExploreScreenView.onCountingObjectAdded
   */
  onCountingObjectAdded(countingObject) {
    const countingObjectNode = new CountingObjectNode(countingObject, this.countingAreaBoundsProperty, this.addAndDragCountingObject.bind(this), this.handleDroppedCountingObject.bind(this), {
      countingObjectTypeProperty: this.countingObjectTypeProperty,
      baseNumberNodeOptions: {
        handleOffsetY: COUNTING_OBJECT_HANDLE_OFFSET_Y
      }
    });
    this.countingObjectNodeMap[countingObjectNode.countingObject.id] = countingObjectNode;
    this.countingObjectLayerNode.addChild(countingObjectNode);
    countingObjectNode.attachListeners();
    this.closestDragForwardingListener.addDraggableItem(countingObjectNode);

    // add listeners
    countingObject.endAnimationEmitter.addListener(this.animationFinishedListener);
    countingObjectNode.endDragEmitter.addListener(this.dragFinishedListener);
  }

  /**
   * Handles removing the relevant CountingObjectNode
   * TODO: Duplicated from CountingCommonScreenView.onCountingObjectRemoved https://github.com/phetsims/number-suite-common/issues/41
   * Listener removal duplicated from MakeATenExploreScreenView.onCountingObjectRemoved
   */
  onCountingObjectRemoved(countingObject) {
    // TODO: same as CountingCommonScreenView.findCountingObjectNode https://github.com/phetsims/number-suite-common/issues/41
    const countingObjectNode = this.getCountingObjectNode(countingObject);

    // Remove listeners
    countingObjectNode.endDragEmitter.removeListener(this.dragFinishedListener);
    countingObject.endAnimationEmitter.removeListener(this.animationFinishedListener);
    delete this.countingObjectNodeMap[countingObjectNode.countingObject.id];
    this.closestDragForwardingListener.removeDraggableItem(countingObjectNode);
    countingObjectNode.dispose();
  }

  /**
   * Given a CountingObject, get the current view (CountingObjectNode) of it.
   * TODO: Duplication, https://github.com/phetsims/number-suite-common/issues/41
   */
  getCountingObjectNode(countingObject) {
    const result = this.countingObjectNodeMap[countingObject.id];
    assert && assert(result, 'Did not find matching Node');
    return result;
  }

  /**
   * When the user drops a countingObject they were dragging, try to do the following things in order:
   * 1. See if there's any tenFrames underneath the dropped countingObject that should be added to.
   * 2. See if there's any countingObjects underneath the dropped countingObject that should either be combined with or
   *    moved away from.
   *
   * The implementation of checking for tenFrames first matches the current design, but a new or changed design could
   * require a different order of checking.
   */
  handleDroppedCountingObject(draggedCountingObject) {
    if (this.tryToAddToTenFrame(draggedCountingObject)) {
      return;
    }

    // TODO: duplication https://github.com/phetsims/number-suite-common/issues/41
    const draggedNode = this.getCountingObjectNode(draggedCountingObject);

    // TODO: semi-duplication https://github.com/phetsims/number-suite-common/issues/41
    // remove any countingObjects that aren't included in the sum - these are already on their way back to the creatorNode and
    // should not be tried to combined with. return if no countingObjects are left or if the draggedCountingObject is not
    // included in the sum
    const allCountingObjectNodes = _.filter(this.countingObjectLayerNode.children, child => child instanceof CountingObjectNode && child.countingObject.includeInSumProperty.value);
    if (allCountingObjectNodes.length === 0 || !draggedCountingObject.includeInSumProperty.value) {
      return;
    }

    // TODO: duplication https://github.com/phetsims/number-suite-common/issues/41
    const droppedNodes = draggedNode.findAttachableNodes(allCountingObjectNodes);

    // TODO: duplication https://github.com/phetsims/number-suite-common/issues/41
    // Check them in reverse order (the one on the top should get more priority)
    droppedNodes.reverse();
    for (let i = 0; i < droppedNodes.length; i++) {
      const droppedNode = droppedNodes[i];
      const droppedCountingObject = droppedNode.countingObject;

      // if grouping is turned off, repel away
      if (!this.countingArea.groupingEnabledProperty.value || !droppedCountingObject.groupingEnabledProperty.value) {
        if (draggedCountingObject.positionProperty.value.distance(droppedCountingObject.positionProperty.value) < COUNTING_OBJECT_REPEL_WHEN_CLOSER_THAN) {
          this.countingArea.repelAway(this.countingAreaBoundsProperty.value, draggedCountingObject, droppedCountingObject, () => {
            return {
              left: -COUNTING_OBJECT_REPEL_DISTANCE,
              right: COUNTING_OBJECT_REPEL_DISTANCE
            };
          });
        }
      } else {
        // TODO: duplication https://github.com/phetsims/number-suite-common/issues/41
        // allow any two numbers to be combined
        this.countingArea.collapseNumberModels(this.countingAreaBoundsProperty.value, draggedCountingObject, droppedCountingObject);
        return; // No need to re-layer or try combining with others
      }
    }
  }

  /**
   * Returns whether we were able to add the countingObject to a tenFrame. If true, it also adds the countingObject
   * to the tenFrame.
   */
  tryToAddToTenFrame(droppedCountingObject) {
    if (!this.countingArea.tenFrames) {
      return false;
    }
    const droppedCountingObjectNode = this.getCountingObjectNode(droppedCountingObject);
    const allDraggableTenFrameNodes = _.filter(this.countingObjectLayerNode.children, child => child instanceof DraggableTenFrameNode);
    const droppedNodeCountingType = droppedCountingObjectNode.countingObjectTypeProperty.value;
    if (!allDraggableTenFrameNodes.length) {
      return false;
    }
    const tenFrameNode = this.findAttachableTenFrameNode(droppedCountingObjectNode, allDraggableTenFrameNodes);

    // If we found a tenFrame underneath this countingObject
    if (tenFrameNode) {
      // If this countingObject is not already in a tenFrame
      if (!this.isCountingObjectContainedByTenFrame(droppedCountingObject)) {
        const tenFrame = tenFrameNode.tenFrame;

        // If the countingObject and tenFrame have the same countingObjectType
        let tenFrameSharesCountingObjectType = false;
        if (tenFrame.countingObjects.lengthProperty.value > 0) {
          tenFrameSharesCountingObjectType = this.countingArea.countingObjects.includes(tenFrame.countingObjects[0]);
        }

        // Paper number cannot be added to tenFrames anyways.
        const noCountingObjectsInTenFrame = !tenFrame.countingObjects.lengthProperty.value && droppedNodeCountingType !== CountingObjectType.PAPER_NUMBER;

        // Add only similar object types, or non paper-numbers if tenFrame is empty
        const shouldAdd = tenFrameSharesCountingObjectType || noCountingObjectsInTenFrame;

        // Push away objects when the tenFrame is full
        if (!tenFrame.isFull() && shouldAdd) {
          tenFrame.addCountingObject(droppedCountingObject);
        } else {
          tenFrame.pushAwayCountingObject(droppedCountingObject, this.countingAreaBoundsProperty.value);
        }
      }
      return true;
    } else {
      return false;
    }
  }

  /**
   * Is the provided countingObject already in a tenFrame.
   */
  isCountingObjectContainedByTenFrame(countingObject) {
    let isContained = false;
    this.countingArea.tenFrames?.forEach(tenFrame => {
      if (tenFrame.containsCountingObject(countingObject)) {
        isContained = true;
      }
    });
    return isContained;
  }

  /**
   * Given the countingObjectNode and an array of DraggableTenFrameNodes, return the highest TenFrameNode that the
   * countingObjectNode is on top of, if any (or null if none are found). This relies on the assumption that the
   * DraggableTenFrameNodes provided are currently children of a Node layer.
   */
  findAttachableTenFrameNode(countingObjectNode, allDraggableTenFrameNodes) {
    const tenFrameNodeCandidates = allDraggableTenFrameNodes.slice();

    // Find all DraggableTenFrameNodes that are underneath the dropped countingObjectNode.
    const unorderedAttachableTenFrameNodes = tenFrameNodeCandidates.filter(tenFrameNode => {
      return tenFrameNode.tenFrame.isCountingObjectOnTopOf(countingObjectNode.countingObject);
    });
    let attachableTenFrameNode = null;

    // Select the top attachable TenFrameNode, if any were attachable from above.
    if (unorderedAttachableTenFrameNodes) {
      attachableTenFrameNode = _.maxBy(unorderedAttachableTenFrameNodes, attachableTenFrameNode => {
        return attachableTenFrameNode.parent.indexOfChild(attachableTenFrameNode);
      });
    }
    return attachableTenFrameNode;
  }

  /**
   * Make sure all countingObjects are within the availableViewBounds
   * TODO: Duplication, https://github.com/phetsims/number-suite-common/issues/41
   */
  constrainAllPositions() {
    this.countingArea.countingObjects.forEach(countingObject => {
      countingObject.setConstrainedDestination(this.countingAreaBoundsProperty.value, countingObject.positionProperty.value);
    });
  }

  /**
   * Whether the countingObject is predominantly over the explore panel (should be collected).
   */
  isNumberInReturnZone(countingObject) {
    const parentBounds = this.getCountingObjectNode(countingObject).bounds;

    // And the bounds of our panel
    const panelBounds = this.returnZoneProperty ? this.returnZoneProperty.value : this.countingObjectCreatorPanel.bounds;
    return panelBounds.intersectsBounds(parentBounds);
  }

  /**
   * Called when a countingObject has finished animating to its destination.
   */
  onNumberAnimationFinished(countingObject) {
    // If it animated to the return zone, it's probably split and meant to be returned.
    if (this.countingArea.countingObjects.includes(countingObject) && this.isNumberInReturnZone(countingObject)) {
      if (countingObject.includeInSumProperty.value) {
        this.onNumberDragFinished(countingObject);
      } else {
        const countingObjectValue = countingObject.numberValueProperty.value;
        this.countingArea.removeCountingObject(countingObject);

        // see if the creator node should show any hidden targets since a counting object was just returned
        this.countingObjectCreatorPanel.countingCreatorNode.validateVisibilityForTargetsForDecreasingSum(countingObjectValue);
      }
    } else if (!this.viewHasIndependentModel) {
      // if this view is running off of a shared model, then if a countingObject has already been removed from the model,
      // check if creator node should be updated
      const countingObjectValue = countingObject.numberValueProperty.value;
      this.countingObjectCreatorPanel.countingCreatorNode.validateVisibilityForTargetsForDecreasingSum(countingObjectValue);
    }
  }

  /**
   * Called when a countingObject has finished being dragged.
   */
  onNumberDragFinished(countingObject) {
    if (!this.includeCountingObjectCreatorPanel) {
      return;
    }

    // Return it to the panel if it's been dropped in the panel.
    if (this.isNumberInReturnZone(countingObject)) {
      countingObject.includeInSumProperty.value = false;
      this.countingArea.calculateTotal();

      // Set its destination to the proper target (with the offset so that it will disappear once centered).
      let targetPosition = this.countingObjectCreatorPanel.countingCreatorNode.getOriginPosition();
      targetPosition = targetPosition.minus(countingObject.returnAnimationBounds.center);
      const targetScale = countingObject.groupingEnabledProperty.value ? NumberSuiteCommonConstants.GROUPED_STORED_COUNTING_OBJECT_SCALE : NumberSuiteCommonConstants.UNGROUPED_STORED_COUNTING_OBJECT_SCALE;
      countingObject.setDestination(targetPosition, true, {
        targetScale: targetScale,
        targetHandleOpacity: 0
      });
    }
  }

  /**
   * Creates a serialization of the countingObjects in the model. This includes the position, value, and z-index of the
   * countingObjects.
   */
  getSerializedCountingObjectsIncludedInSum() {
    const countingObjectsIncludedInSum = this.countingArea.getCountingObjectsIncludedInSum();
    const countingObjectPositions = [];
    countingObjectsIncludedInSum.forEach(countingObject => {
      const countingObjectZIndex = this.countingObjectLayerNode.children.indexOf(this.getCountingObjectNode(countingObject));
      assert && assert(countingObjectZIndex >= 0, `countingObject's corresponding Node not in countingObjectLayerNode: ${countingObjectZIndex}`);
      countingObjectPositions.push({
        position: countingObject.positionProperty.value,
        numberValue: countingObject.numberValueProperty.value,
        zIndex: countingObjectZIndex
      });
    });
    return countingObjectPositions;
  }
}
numberSuiteCommon.register('CountingAreaNode', CountingAreaNode);
export default CountingAreaNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb3VudGluZ09iamVjdE5vZGUiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiQ2xvc2VzdERyYWdGb3J3YXJkaW5nTGlzdGVuZXIiLCJudW1iZXJTdWl0ZUNvbW1vbiIsIkNvdW50aW5nT2JqZWN0Q3JlYXRvclBhbmVsIiwiVmVjdG9yMiIsIkNvdW50aW5nQ29tbW9uQ29uc3RhbnRzIiwiQ291bnRpbmdPYmplY3RUeXBlIiwiTnVtYmVyU3VpdGVDb21tb25Db25zdGFudHMiLCJvcHRpb25pemUiLCJEcmFnZ2FibGVUZW5GcmFtZU5vZGUiLCJNdWx0aWxpbmsiLCJDT1VOVElOR19PQkpFQ1RfSEFORExFX09GRlNFVF9ZIiwiQ09VTlRJTkdfT0JKRUNUX1JFUEVMX0RJU1RBTkNFIiwiQ09VTlRJTkdfT0JKRUNUX1JFUEVMX1dIRU5fQ0xPU0VSX1RIQU4iLCJDb3VudGluZ0FyZWFOb2RlIiwiZ2V0Q291bnRpbmdPYmplY3RPcmlnaW4iLCJaRVJPIiwiY29uc3RydWN0b3IiLCJjb3VudGluZ0FyZWEiLCJjb3VudGluZ09iamVjdFR5cGVQcm9wZXJ0eSIsImNvdW50aW5nQXJlYUJvdW5kc1Byb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImNvdW50aW5nT2JqZWN0TGF5ZXJOb2RlIiwiYmFja2dyb3VuZERyYWdUYXJnZXROb2RlIiwidmlld0hhc0luZGVwZW5kZW50TW9kZWwiLCJpbmNsdWRlQ291bnRpbmdPYmplY3RDcmVhdG9yUGFuZWwiLCJjcmVhdG9yUGFuZWxYIiwicmV0dXJuWm9uZVByb3BlcnR5IiwiYW5pbWF0aW9uRmluaXNoZWRMaXN0ZW5lciIsImNvdW50aW5nT2JqZWN0Iiwib25OdW1iZXJBbmltYXRpb25GaW5pc2hlZCIsImRyYWdGaW5pc2hlZExpc3RlbmVyIiwiY291bnRpbmdPYmplY3ROb2RlIiwib25OdW1iZXJEcmFnRmluaXNoZWQiLCJjb3VudGluZ09iamVjdE5vZGVNYXAiLCJjbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lciIsInZhbHVlIiwiYWRkQ2hpbGQiLCJhZGRJbnB1dExpc3RlbmVyIiwiY291bnRpbmdPYmplY3RBZGRlZExpc3RlbmVyIiwib25Db3VudGluZ09iamVjdEFkZGVkIiwiYmluZCIsImNvdW50aW5nT2JqZWN0UmVtb3ZlZExpc3RlbmVyIiwib25Db3VudGluZ09iamVjdFJlbW92ZWQiLCJjb3VudGluZ09iamVjdHMiLCJmb3JFYWNoIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwibGF6eUxpbmsiLCJjb25zdHJhaW5BbGxQb3NpdGlvbnMiLCJjb3VudGluZ09iamVjdENyZWF0b3JQYW5lbCIsImNvdW50aW5nT2JqZWN0Q3JlYXRvclBhbmVsT3B0aW9ucyIsImNlbnRlclgiLCJsZWZ0IiwibWluWCIsIkNPVU5USU5HX0FSRUFfTUFSR0lOIiwidXBkYXRlQ291bnRpbmdPYmplY3RDcmVhdG9yUGFuZWxQb3NpdGlvbiIsImJvdHRvbSIsImxpbmsiLCJ0cmFuc2Zvcm1FbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJjb3VudGluZ0NyZWF0b3JOb2RlIiwiZ2V0T3JpZ2luUG9zaXRpb24iLCJjb3VudGluZ09iamVjdENyZWF0b3JOb2RlSGVpZ2h0IiwiaGVpZ2h0IiwiaW5pdGlhbGl6ZSIsImxhenlNdWx0aWxpbmsiLCJncm91cGluZ0VuYWJsZWRQcm9wZXJ0eSIsImdyb3VwaW5nRW5hYmxlZCIsImJyZWFrQXBhcnRDb3VudGluZ09iamVjdHMiLCJpIiwibGVuZ3RoIiwiZ2V0Q291bnRpbmdPYmplY3ROb2RlIiwidXBkYXRlTnVtYmVyIiwiaXNBbmltYXRpbmciLCJzZXRDb25zdHJhaW5lZERlc3RpbmF0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsImFkZEFuZERyYWdDb3VudGluZ09iamVjdCIsImV2ZW50IiwiYWRkQ291bnRpbmdPYmplY3QiLCJjYWxjdWxhdGVUb3RhbCIsInN0YXJ0U3ludGhldGljRHJhZyIsImhhbmRsZURyb3BwZWRDb3VudGluZ09iamVjdCIsImJhc2VOdW1iZXJOb2RlT3B0aW9ucyIsImhhbmRsZU9mZnNldFkiLCJpZCIsImF0dGFjaExpc3RlbmVycyIsImFkZERyYWdnYWJsZUl0ZW0iLCJlbmRBbmltYXRpb25FbWl0dGVyIiwiZW5kRHJhZ0VtaXR0ZXIiLCJyZW1vdmVMaXN0ZW5lciIsInJlbW92ZURyYWdnYWJsZUl0ZW0iLCJkaXNwb3NlIiwicmVzdWx0IiwiYXNzZXJ0IiwiZHJhZ2dlZENvdW50aW5nT2JqZWN0IiwidHJ5VG9BZGRUb1RlbkZyYW1lIiwiZHJhZ2dlZE5vZGUiLCJhbGxDb3VudGluZ09iamVjdE5vZGVzIiwiXyIsImZpbHRlciIsImNoaWxkcmVuIiwiY2hpbGQiLCJpbmNsdWRlSW5TdW1Qcm9wZXJ0eSIsImRyb3BwZWROb2RlcyIsImZpbmRBdHRhY2hhYmxlTm9kZXMiLCJyZXZlcnNlIiwiZHJvcHBlZE5vZGUiLCJkcm9wcGVkQ291bnRpbmdPYmplY3QiLCJkaXN0YW5jZSIsInJlcGVsQXdheSIsInJpZ2h0IiwiY29sbGFwc2VOdW1iZXJNb2RlbHMiLCJ0ZW5GcmFtZXMiLCJkcm9wcGVkQ291bnRpbmdPYmplY3ROb2RlIiwiYWxsRHJhZ2dhYmxlVGVuRnJhbWVOb2RlcyIsImRyb3BwZWROb2RlQ291bnRpbmdUeXBlIiwidGVuRnJhbWVOb2RlIiwiZmluZEF0dGFjaGFibGVUZW5GcmFtZU5vZGUiLCJpc0NvdW50aW5nT2JqZWN0Q29udGFpbmVkQnlUZW5GcmFtZSIsInRlbkZyYW1lIiwidGVuRnJhbWVTaGFyZXNDb3VudGluZ09iamVjdFR5cGUiLCJsZW5ndGhQcm9wZXJ0eSIsImluY2x1ZGVzIiwibm9Db3VudGluZ09iamVjdHNJblRlbkZyYW1lIiwiUEFQRVJfTlVNQkVSIiwic2hvdWxkQWRkIiwiaXNGdWxsIiwicHVzaEF3YXlDb3VudGluZ09iamVjdCIsImlzQ29udGFpbmVkIiwiY29udGFpbnNDb3VudGluZ09iamVjdCIsInRlbkZyYW1lTm9kZUNhbmRpZGF0ZXMiLCJzbGljZSIsInVub3JkZXJlZEF0dGFjaGFibGVUZW5GcmFtZU5vZGVzIiwiaXNDb3VudGluZ09iamVjdE9uVG9wT2YiLCJhdHRhY2hhYmxlVGVuRnJhbWVOb2RlIiwibWF4QnkiLCJwYXJlbnQiLCJpbmRleE9mQ2hpbGQiLCJpc051bWJlckluUmV0dXJuWm9uZSIsInBhcmVudEJvdW5kcyIsImJvdW5kcyIsInBhbmVsQm91bmRzIiwiaW50ZXJzZWN0c0JvdW5kcyIsImNvdW50aW5nT2JqZWN0VmFsdWUiLCJudW1iZXJWYWx1ZVByb3BlcnR5IiwicmVtb3ZlQ291bnRpbmdPYmplY3QiLCJ2YWxpZGF0ZVZpc2liaWxpdHlGb3JUYXJnZXRzRm9yRGVjcmVhc2luZ1N1bSIsInRhcmdldFBvc2l0aW9uIiwibWludXMiLCJyZXR1cm5BbmltYXRpb25Cb3VuZHMiLCJjZW50ZXIiLCJ0YXJnZXRTY2FsZSIsIkdST1VQRURfU1RPUkVEX0NPVU5USU5HX09CSkVDVF9TQ0FMRSIsIlVOR1JPVVBFRF9TVE9SRURfQ09VTlRJTkdfT0JKRUNUX1NDQUxFIiwic2V0RGVzdGluYXRpb24iLCJ0YXJnZXRIYW5kbGVPcGFjaXR5IiwiZ2V0U2VyaWFsaXplZENvdW50aW5nT2JqZWN0c0luY2x1ZGVkSW5TdW0iLCJjb3VudGluZ09iamVjdHNJbmNsdWRlZEluU3VtIiwiZ2V0Q291bnRpbmdPYmplY3RzSW5jbHVkZWRJblN1bSIsImNvdW50aW5nT2JqZWN0UG9zaXRpb25zIiwiY291bnRpbmdPYmplY3RaSW5kZXgiLCJpbmRleE9mIiwicHVzaCIsInBvc2l0aW9uIiwibnVtYmVyVmFsdWUiLCJ6SW5kZXgiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvdW50aW5nQXJlYU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTm9kZSBmb3IgYSBDb3VudGluZ0FyZWEuIFRoaXMgZmlsZSB3YXMgY29waWVkIGZyb20gY291bnRpbmctY29tbW9uL2NvbW1vbi92aWV3L0NvdW50aW5nQ29tbW9uU2NyZWVuVmlldy5qcyBhbmRcclxuICogbWFrZS1hLXRlbi9leHBsb3JlL3ZpZXcvTWFrZUFUZW5FeHBsb3JlU2NyZWVuVmlldy5qcyBhbmQgdGhlbiBtb2RpZmllZCBieSBAY2hyaXNrbHVzIHRvIGJlIHVzZWQgaW4gbnVtYmVyLXN1aXRlLWNvbW1vbi5cclxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9udW1iZXItc3VpdGUtY29tbW9uL2lzc3Vlcy80MS5cclxuICpcclxuICogQGF1dGhvciBTaGFyZnVkZWVuIEFzaHJhZlxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IENvdW50aW5nT2JqZWN0IGZyb20gJy4uLy4uLy4uLy4uL2NvdW50aW5nLWNvbW1vbi9qcy9jb21tb24vbW9kZWwvQ291bnRpbmdPYmplY3QuanMnO1xyXG5pbXBvcnQgQ291bnRpbmdPYmplY3ROb2RlIGZyb20gJy4uLy4uLy4uLy4uL2NvdW50aW5nLWNvbW1vbi9qcy9jb21tb24vdmlldy9Db3VudGluZ09iamVjdE5vZGUuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zLCBQcmVzc0xpc3RlbmVyRXZlbnQsIFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ2xvc2VzdERyYWdGb3J3YXJkaW5nTGlzdGVuZXIuanMnO1xyXG5pbXBvcnQgbnVtYmVyU3VpdGVDb21tb24gZnJvbSAnLi4vLi4vbnVtYmVyU3VpdGVDb21tb24uanMnO1xyXG5pbXBvcnQgQ291bnRpbmdBcmVhLCB7IENvdW50aW5nT2JqZWN0U2VyaWFsaXphdGlvbiB9IGZyb20gJy4uL21vZGVsL0NvdW50aW5nQXJlYS5qcyc7XHJcbmltcG9ydCBDb3VudGluZ09iamVjdENyZWF0b3JQYW5lbCwgeyBDb3VudGluZ09iamVjdENyZWF0b3JQYW5lbE9wdGlvbnMgfSBmcm9tICcuL0NvdW50aW5nT2JqZWN0Q3JlYXRvclBhbmVsLmpzJztcclxuaW1wb3J0IHsgQ291bnRpbmdPYmplY3ROb2RlTWFwIH0gZnJvbSAnLi4vLi4vLi4vLi4vY291bnRpbmctY29tbW9uL2pzL2NvbW1vbi92aWV3L0NvdW50aW5nQ29tbW9uU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IENvdW50aW5nQ29tbW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL2NvdW50aW5nLWNvbW1vbi9qcy9jb21tb24vQ291bnRpbmdDb21tb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgQ291bnRpbmdPYmplY3RUeXBlIGZyb20gJy4uLy4uLy4uLy4uL2NvdW50aW5nLWNvbW1vbi9qcy9jb21tb24vbW9kZWwvQ291bnRpbmdPYmplY3RUeXBlLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyU3VpdGVDb21tb25Db25zdGFudHMgZnJvbSAnLi4vTnVtYmVyU3VpdGVDb21tb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgRHJhZ2dhYmxlVGVuRnJhbWVOb2RlIGZyb20gJy4uLy4uL2xhYi92aWV3L0RyYWdnYWJsZVRlbkZyYW1lTm9kZS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGNvdW50aW5nT2JqZWN0TGF5ZXJOb2RlPzogbnVsbCB8IE5vZGU7XHJcbiAgYmFja2dyb3VuZERyYWdUYXJnZXROb2RlPzogbnVsbCB8IE5vZGU7XHJcbiAgdmlld0hhc0luZGVwZW5kZW50TW9kZWw/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRoaXMgdmlldyBpcyBob29rZWQgdXAgdG8gaXRzIG93biBtb2RlbCBvciBhIHNoYXJlZCBtb2RlbFxyXG4gIGluY2x1ZGVDb3VudGluZ09iamVjdENyZWF0b3JQYW5lbD86IGJvb2xlYW47XHJcbiAgY3JlYXRvclBhbmVsWD86IG51bGwgfCBudW1iZXI7XHJcbiAgcmV0dXJuWm9uZVByb3BlcnR5PzogbnVsbCB8IFRSZWFkT25seVByb3BlcnR5PEJvdW5kczI+O1xyXG4gIGNvdW50aW5nT2JqZWN0Q3JlYXRvclBhbmVsT3B0aW9ucz86IENvdW50aW5nT2JqZWN0Q3JlYXRvclBhbmVsT3B0aW9ucztcclxufTtcclxudHlwZSBDb3VudGluZ0FyZWFOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IENPVU5USU5HX09CSkVDVF9IQU5ETEVfT0ZGU0VUX1kgPSAtOS41OyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIGJlIGFuIGFwcHJvcHJpYXRlIGxlbmd0aCBmb3IganVzdCAxMHMgYW5kIDFzLCBpbiBzY3JlZW4gY29vcmRzXHJcblxyXG5jb25zdCBDT1VOVElOR19PQkpFQ1RfUkVQRUxfRElTVEFOQ0UgPSAxMDsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byBsb29rIG5pY2UsIGluIHNjcmVlbiBjb29yZHMsIHJlcGVsIHRoaXMgbXVjaFxyXG5jb25zdCBDT1VOVElOR19PQkpFQ1RfUkVQRUxfV0hFTl9DTE9TRVJfVEhBTiA9IDc7IC8vIElmIG9iamVjdCBhcmUgY2xvc2VyIHRoYW4gdGhpcywgdGhhbiBjb21tZW5jZSByZXBlbFxyXG5cclxuY2xhc3MgQ291bnRpbmdBcmVhTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvLyBjYWxsZWQgd2hlbiBhIGNvdW50aW5nT2JqZWN0IGZpbmlzaGVzIGFuaW1hdGluZywgc2VlIG9uTnVtYmVyQW5pbWF0aW9uRmluaXNoZWRcclxuICBwcml2YXRlIHJlYWRvbmx5IGFuaW1hdGlvbkZpbmlzaGVkTGlzdGVuZXI6ICggY291bnRpbmdPYmplY3Q6IENvdW50aW5nT2JqZWN0ICkgPT4gdm9pZDtcclxuXHJcbiAgLy8gY2FsbGVkIHdoZW4gYSBjb3VudGluZ09iamVjdE5vZGUgZmluaXNoZXMgYmVpbmcgZHJhZ2dlZCwgc2VlIG9uTnVtYmVyRHJhZ0ZpbmlzaGVkXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkcmFnRmluaXNoZWRMaXN0ZW5lcjogKCBjb3VudGluZ09iamVjdE5vZGU6IENvdW50aW5nT2JqZWN0Tm9kZSApID0+IHZvaWQ7XHJcblxyXG4gIC8vIG91ciBtb2RlbFxyXG4gIHB1YmxpYyByZWFkb25seSBjb3VudGluZ0FyZWE6IENvdW50aW5nQXJlYTtcclxuXHJcbiAgLy8gQ291bnRpbmdPYmplY3QuaWQgPT4ge0NvdW50aW5nT2JqZWN0Tm9kZX0gLSBsb29rdXAgbWFwIGZvciBlZmZpY2llbmN5XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjb3VudGluZ09iamVjdE5vZGVNYXA6IENvdW50aW5nT2JqZWN0Tm9kZU1hcDtcclxuXHJcbiAgLy8gVGhlIGJvdW5kcyBvZiB0aGUgY291bnRpbmdBcmVhIHdoZXJlIGNvdW50aW5nT2JqZWN0cyBjYW4gYmUgZHJhZ2dlZCwgbmFtZWQgc28gdGhhdCBpdCBkb2Vzbid0IG92ZXJ3cml0ZSBOb2RlLmJvdW5kc1Byb3BlcnR5XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjb3VudGluZ0FyZWFCb3VuZHNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Qm91bmRzMj47XHJcbiAgcHVibGljIHJlYWRvbmx5IGNvdW50aW5nT2JqZWN0VHlwZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxDb3VudGluZ09iamVjdFR5cGU+O1xyXG5cclxuICAvLyBzZWUgb3B0aW9ucy52aWV3SGFzSW5kZXBlbmRlbnRNb2RlbCBmb3IgZG9jXHJcbiAgcHJpdmF0ZSByZWFkb25seSB2aWV3SGFzSW5kZXBlbmRlbnRNb2RlbDogYm9vbGVhbjtcclxuXHJcbiAgLy8gaGFuZGxlIHRvdWNoZXMgbmVhcmJ5IHRvIHRoZSBjb3VudGluZ09iamVjdHMsIGFuZCBpbnRlcnByZXQgdGhvc2UgYXMgdGhlIHByb3BlciBkcmFnLlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgY2xvc2VzdERyYWdGb3J3YXJkaW5nTGlzdGVuZXI6IENsb3Nlc3REcmFnRm9yd2FyZGluZ0xpc3RlbmVyO1xyXG5cclxuICAvLyBOb2RlIHBhcmVudCBmb3IgYWxsIENvdW50aW5nT2JqZWN0Tm9kZSBpbnN0YW5jZXMsIGNyZWF0ZWQgaWYgbm90IHByb3ZpZGVkLlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgY291bnRpbmdPYmplY3RMYXllck5vZGU6IE5vZGU7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBjb3VudGluZ09iamVjdENyZWF0b3JQYW5lbDogQ291bnRpbmdPYmplY3RDcmVhdG9yUGFuZWw7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBpbmNsdWRlQ291bnRpbmdPYmplY3RDcmVhdG9yUGFuZWw6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBnZXRDb3VudGluZ09iamVjdE9yaWdpbjogKCkgPT4gVmVjdG9yMiA9ICgpID0+IFZlY3RvcjIuWkVSTztcclxuICBwcml2YXRlIHJlYWRvbmx5IHJldHVyblpvbmVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Qm91bmRzMj4gfCBudWxsO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNvdW50aW5nQXJlYTogQ291bnRpbmdBcmVhLFxyXG4gICAgICAgICAgICAgICAgICAgICAgY291bnRpbmdPYmplY3RUeXBlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PENvdW50aW5nT2JqZWN0VHlwZT4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBjb3VudGluZ0FyZWFCb3VuZHNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Qm91bmRzMj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBDb3VudGluZ0FyZWFOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPENvdW50aW5nQXJlYU5vZGVPcHRpb25zLCBTdHJpY3RPbWl0PFNlbGZPcHRpb25zLCAnY291bnRpbmdPYmplY3RDcmVhdG9yUGFuZWxPcHRpb25zJz4sIE5vZGVPcHRpb25zPigpKCB7XHJcbiAgICAgIGNvdW50aW5nT2JqZWN0TGF5ZXJOb2RlOiBudWxsLFxyXG4gICAgICBiYWNrZ3JvdW5kRHJhZ1RhcmdldE5vZGU6IG51bGwsXHJcbiAgICAgIHZpZXdIYXNJbmRlcGVuZGVudE1vZGVsOiB0cnVlLFxyXG4gICAgICBpbmNsdWRlQ291bnRpbmdPYmplY3RDcmVhdG9yUGFuZWw6IHRydWUsXHJcbiAgICAgIGNyZWF0b3JQYW5lbFg6IG51bGwsXHJcbiAgICAgIHJldHVyblpvbmVQcm9wZXJ0eTogbnVsbFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmFuaW1hdGlvbkZpbmlzaGVkTGlzdGVuZXIgPSAoIGNvdW50aW5nT2JqZWN0OiBDb3VudGluZ09iamVjdCApID0+IHRoaXMub25OdW1iZXJBbmltYXRpb25GaW5pc2hlZCggY291bnRpbmdPYmplY3QgKTtcclxuICAgIHRoaXMuZHJhZ0ZpbmlzaGVkTGlzdGVuZXIgPSAoIGNvdW50aW5nT2JqZWN0Tm9kZTogQ291bnRpbmdPYmplY3ROb2RlICkgPT4gdGhpcy5vbk51bWJlckRyYWdGaW5pc2hlZCggY291bnRpbmdPYmplY3ROb2RlLmNvdW50aW5nT2JqZWN0ICk7XHJcblxyXG4gICAgdGhpcy5jb3VudGluZ0FyZWEgPSBjb3VudGluZ0FyZWE7XHJcblxyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdE5vZGVNYXAgPSB7fTtcclxuXHJcbiAgICB0aGlzLmNvdW50aW5nQXJlYUJvdW5kc1Byb3BlcnR5ID0gY291bnRpbmdBcmVhQm91bmRzUHJvcGVydHk7XHJcbiAgICB0aGlzLmNvdW50aW5nT2JqZWN0VHlwZVByb3BlcnR5ID0gY291bnRpbmdPYmplY3RUeXBlUHJvcGVydHk7XHJcblxyXG4gICAgdGhpcy52aWV3SGFzSW5kZXBlbmRlbnRNb2RlbCA9IG9wdGlvbnMudmlld0hhc0luZGVwZW5kZW50TW9kZWw7XHJcblxyXG4gICAgdGhpcy5jbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lciA9IG5ldyBDbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lciggMzAsIDAgKTtcclxuICAgIGxldCBiYWNrZ3JvdW5kRHJhZ1RhcmdldE5vZGUgPSBudWxsO1xyXG4gICAgaWYgKCBvcHRpb25zLmJhY2tncm91bmREcmFnVGFyZ2V0Tm9kZSApIHtcclxuICAgICAgYmFja2dyb3VuZERyYWdUYXJnZXROb2RlID0gb3B0aW9ucy5iYWNrZ3JvdW5kRHJhZ1RhcmdldE5vZGU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgYmFja2dyb3VuZERyYWdUYXJnZXROb2RlID0gbmV3IFJlY3RhbmdsZSggY291bnRpbmdBcmVhQm91bmRzUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggYmFja2dyb3VuZERyYWdUYXJnZXROb2RlICk7XHJcbiAgICB9XHJcbiAgICBiYWNrZ3JvdW5kRHJhZ1RhcmdldE5vZGUuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5jbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lciApO1xyXG5cclxuICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0QWRkZWRMaXN0ZW5lciA9IHRoaXMub25Db3VudGluZ09iamVjdEFkZGVkLmJpbmQoIHRoaXMgKTtcclxuICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0UmVtb3ZlZExpc3RlbmVyID0gdGhpcy5vbkNvdW50aW5nT2JqZWN0UmVtb3ZlZC5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgLy8gQWRkIG5vZGVzIGZvciBldmVyeSBhbHJlYWR5LWV4aXN0aW5nIGNvdW50aW5nT2JqZWN0XHJcbiAgICBjb3VudGluZ0FyZWEuY291bnRpbmdPYmplY3RzLmZvckVhY2goIGNvdW50aW5nT2JqZWN0QWRkZWRMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIEFkZCBhbmQgcmVtb3ZlIG5vZGVzIHRvIG1hdGNoIHRoZSBjb3VudGluZ0FyZWFcclxuICAgIGNvdW50aW5nQXJlYS5jb3VudGluZ09iamVjdHMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIGNvdW50aW5nT2JqZWN0QWRkZWRMaXN0ZW5lciApO1xyXG4gICAgY291bnRpbmdBcmVhLmNvdW50aW5nT2JqZWN0cy5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCBjb3VudGluZ09iamVjdFJlbW92ZWRMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIFBlcnNpc3RlbnQsIG5vIG5lZWQgdG8gdW5saW5rXHJcbiAgICB0aGlzLmNvdW50aW5nQXJlYUJvdW5kc1Byb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY29uc3RyYWluQWxsUG9zaXRpb25zKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBDb3VudGluZ09iamVjdENyZWF0b3JQYW5lbFxyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdENyZWF0b3JQYW5lbCA9IG5ldyBDb3VudGluZ09iamVjdENyZWF0b3JQYW5lbCggY291bnRpbmdBcmVhLCB0aGlzLCBvcHRpb25zLmNvdW50aW5nT2JqZWN0Q3JlYXRvclBhbmVsT3B0aW9ucyApO1xyXG4gICAgaWYgKCBvcHRpb25zLmNyZWF0b3JQYW5lbFggKSB7XHJcbiAgICAgIHRoaXMuY291bnRpbmdPYmplY3RDcmVhdG9yUGFuZWwuY2VudGVyWCA9IG9wdGlvbnMuY3JlYXRvclBhbmVsWDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLmNvdW50aW5nT2JqZWN0Q3JlYXRvclBhbmVsLmxlZnQgPSBjb3VudGluZ0FyZWFCb3VuZHNQcm9wZXJ0eS52YWx1ZS5taW5YICsgQ291bnRpbmdDb21tb25Db25zdGFudHMuQ09VTlRJTkdfQVJFQV9NQVJHSU47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2V0IHRoZSB5IHBvc2l0aW9uIG9mIHRoZSBDb3VudGluZ09iamVjdENyZWF0b3JQYW5lbC4gTk9URTogSXQgaXMgYXNzdW1lZCBiZWxvdyBkdXJpbmcgaW5pdGlhbGl6YXRpb24gdGhhdCB0aGVcclxuICAgIC8vIENvdW50aW5nT2JqZWN0Q3JlYXRvclBhbmVsIGlzIHBvc2l0aW9uZWQgYWxvbmcgdGhlIGJvdHRvbSBvZiB0aGUgY291bnRpbmdBcmVhIGJvdW5kc1xyXG4gICAgY29uc3QgdXBkYXRlQ291bnRpbmdPYmplY3RDcmVhdG9yUGFuZWxQb3NpdGlvbiA9ICgpID0+IHtcclxuICAgICAgdGhpcy5jb3VudGluZ09iamVjdENyZWF0b3JQYW5lbC5ib3R0b20gPSBjb3VudGluZ0FyZWFCb3VuZHNQcm9wZXJ0eS52YWx1ZS5ib3R0b20gLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvdW50aW5nQ29tbW9uQ29uc3RhbnRzLkNPVU5USU5HX0FSRUFfTUFSR0lOO1xyXG4gICAgfTtcclxuICAgIGNvdW50aW5nQXJlYUJvdW5kc1Byb3BlcnR5LmxpbmsoIHVwZGF0ZUNvdW50aW5nT2JqZWN0Q3JlYXRvclBhbmVsUG9zaXRpb24gKTtcclxuICAgIHRoaXMudHJhbnNmb3JtRW1pdHRlci5hZGRMaXN0ZW5lciggdXBkYXRlQ291bnRpbmdPYmplY3RDcmVhdG9yUGFuZWxQb3NpdGlvbiApO1xyXG5cclxuICAgIGlmICggb3B0aW9ucy5pbmNsdWRlQ291bnRpbmdPYmplY3RDcmVhdG9yUGFuZWwgKSB7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuY291bnRpbmdPYmplY3RDcmVhdG9yUGFuZWwgKTtcclxuICAgICAgdGhpcy5nZXRDb3VudGluZ09iamVjdE9yaWdpbiA9ICgpID0+IHRoaXMuY291bnRpbmdPYmplY3RDcmVhdG9yUGFuZWwuY291bnRpbmdDcmVhdG9yTm9kZS5nZXRPcmlnaW5Qb3NpdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGluaXRpYWxpemUgdGhlIG1vZGVsIHdpdGggcG9zaXRpb25pbmcgaW5mb3JtYXRpb25cclxuICAgIGlmICggdGhpcy52aWV3SGFzSW5kZXBlbmRlbnRNb2RlbCApIHtcclxuICAgICAgY29uc3QgY291bnRpbmdPYmplY3RDcmVhdG9yTm9kZUhlaWdodCA9IG9wdGlvbnMuaW5jbHVkZUNvdW50aW5nT2JqZWN0Q3JlYXRvclBhbmVsID8gdGhpcy5jb3VudGluZ09iamVjdENyZWF0b3JQYW5lbC5oZWlnaHQgOiAwO1xyXG4gICAgICB0aGlzLmNvdW50aW5nQXJlYS5pbml0aWFsaXplKCB0aGlzLmdldENvdW50aW5nT2JqZWN0T3JpZ2luLCBjb3VudGluZ09iamVjdENyZWF0b3JOb2RlSGVpZ2h0LCBjb3VudGluZ0FyZWFCb3VuZHNQcm9wZXJ0eSApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggb3B0aW9ucy5jb3VudGluZ09iamVjdExheWVyTm9kZSApIHtcclxuICAgICAgdGhpcy5jb3VudGluZ09iamVjdExheWVyTm9kZSA9IG9wdGlvbnMuY291bnRpbmdPYmplY3RMYXllck5vZGU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5jb3VudGluZ09iamVjdExheWVyTm9kZSA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgICAvLyBhZGQgdGhlIGNvdW50aW5nT2JqZWN0TGF5ZXJOb2RlIGFmdGVyIHRoZSBjcmVhdG9yIHBhbmVsXHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuY291bnRpbmdPYmplY3RMYXllck5vZGUgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmluY2x1ZGVDb3VudGluZ09iamVjdENyZWF0b3JQYW5lbCA9IG9wdGlvbnMuaW5jbHVkZUNvdW50aW5nT2JqZWN0Q3JlYXRvclBhbmVsO1xyXG4gICAgdGhpcy5yZXR1cm5ab25lUHJvcGVydHkgPSBvcHRpb25zLnJldHVyblpvbmVQcm9wZXJ0eTtcclxuXHJcbiAgICAvLyBJbiB0aGUgdmlldyBvbmx5IGJlY2F1c2Ugb2YgY291bnRpbmdPYmplY3ROb2RlLnVwZGF0ZU51bWJlcigpXHJcbiAgICBNdWx0aWxpbmsubGF6eU11bHRpbGluayggW1xyXG4gICAgICB0aGlzLmNvdW50aW5nQXJlYS5ncm91cGluZ0VuYWJsZWRQcm9wZXJ0eSxcclxuICAgICAgY291bnRpbmdPYmplY3RUeXBlUHJvcGVydHlcclxuICAgIF0sIGdyb3VwaW5nRW5hYmxlZCA9PiB7XHJcblxyXG4gICAgICAvLyBXaGVuIGdyb3VwaW5nIGlzIHR1cm5lZCBvZmYsIGJyZWFrIGFwYXJ0IGFueSBvYmplY3QgZ3JvdXBzXHJcbiAgICAgICFncm91cGluZ0VuYWJsZWQgJiYgdGhpcy5jb3VudGluZ0FyZWEuYnJlYWtBcGFydENvdW50aW5nT2JqZWN0cyggdHJ1ZSApO1xyXG5cclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5jb3VudGluZ0FyZWEuY291bnRpbmdPYmplY3RzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0ID0gdGhpcy5jb3VudGluZ0FyZWEuY291bnRpbmdPYmplY3RzWyBpIF07XHJcbiAgICAgICAgY29uc3QgY291bnRpbmdPYmplY3ROb2RlID0gdGhpcy5nZXRDb3VudGluZ09iamVjdE5vZGUoIGNvdW50aW5nT2JqZWN0ICk7XHJcblxyXG4gICAgICAgIC8vIE5lZWQgdG8gY2FsbCB0aGlzIG9uIGNvdW50aW5nT2JqZWN0cyB0aGF0IGFyZSBOT1QgaW5jbHVkZWQgaW4gc3VtLlxyXG4gICAgICAgIGNvdW50aW5nT2JqZWN0Tm9kZS51cGRhdGVOdW1iZXIoKTtcclxuXHJcbiAgICAgICAgLy8gRG9uJ3QgY29uc3RyYWluIGEgZGVzdGluYXRpb24gdG8gb2JqZWN0cyBub3QgaW5jbHVkZWQgaW4gc3VtLlxyXG4gICAgICAgIGlmICggIWNvdW50aW5nT2JqZWN0LmlzQW5pbWF0aW5nICkge1xyXG5cclxuICAgICAgICAgIC8vIEluIGdlbmVyYWwgdGhpcyBzaG91bGQgYmUgc3VwZXJmbHVvdXMsIGJ1dCB0aGUgXCJjYXJkXCIgYXJvdW5kIGEgY291bnRpbmcgb2JqZWN0IHR5cGUgaGFzIGxhcmdlciBib3VuZHNcclxuICAgICAgICAgIC8vIHRoYW4gdGhlIG9iamVjdCBpdHNlbGYsIHNvIHdlIG5lZWQgdG8gaGFuZGxlIHRoaXMuXHJcbiAgICAgICAgICBjb3VudGluZ09iamVjdC5zZXRDb25zdHJhaW5lZERlc3RpbmF0aW9uKCB0aGlzLmNvdW50aW5nQXJlYUJvdW5kc1Byb3BlcnR5LnZhbHVlLCBjb3VudGluZ09iamVjdC5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSBjb3VudGluZ09iamVjdCB0byB0aGUgY291bnRpbmdBcmVhIGFuZCBpbW1lZGlhdGVseSBzdGFydCBkcmFnZ2luZyBpdCB3aXRoIHRoZSBwcm92aWRlZCBldmVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBldmVudCAtIFRoZSBTY2VuZXJ5IGV2ZW50IHRoYXQgdHJpZ2dlcmVkIHRoaXMuXHJcbiAgICogQHBhcmFtIGNvdW50aW5nT2JqZWN0IC0gVGhlIGNvdW50aW5nT2JqZWN0IHRvIGFkZCBhbmQgdGhlbiBkcmFnXHJcbiAgICpcclxuICAgKiBUT0RPOiBzYW1lIGFzIENvdW50aW5nQ29tbW9uU2NyZWVuVmlldy5hZGRBbmREcmFnQ291bnRpbmdPYmplY3QgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL251bWJlci1zdWl0ZS1jb21tb24vaXNzdWVzLzQxXHJcbiAgICogb25seSBkaWZmZXJlbmNlIGlzIGNhbGwgdG8gY291bnRpbmdBcmVhLmNhbGN1bGF0ZVRvdGFsKClcclxuICAgKi9cclxuICBwdWJsaWMgYWRkQW5kRHJhZ0NvdW50aW5nT2JqZWN0KCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50LCBjb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gQWRkIGl0IGFuZCBsb29rdXAgdGhlIHJlbGF0ZWQgbm9kZS5cclxuICAgIHRoaXMuY291bnRpbmdBcmVhLmFkZENvdW50aW5nT2JqZWN0KCBjb3VudGluZ09iamVjdCApO1xyXG4gICAgdGhpcy5jb3VudGluZ0FyZWEuY2FsY3VsYXRlVG90YWwoKTtcclxuXHJcbiAgICBjb25zdCBjb3VudGluZ09iamVjdE5vZGUgPSB0aGlzLmdldENvdW50aW5nT2JqZWN0Tm9kZSggY291bnRpbmdPYmplY3QgKTtcclxuICAgIGNvdW50aW5nT2JqZWN0Tm9kZS5zdGFydFN5bnRoZXRpY0RyYWcoIGV2ZW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGFuZCBhZGRzIGEgQ291bnRpbmdPYmplY3ROb2RlLlxyXG4gICAqXHJcbiAgICogVE9ETzogc2FtZSB3b3JrIGFzIENvdW50aW5nQ29tbW9uU2NyZWVuVmlldy5vbkNvdW50aW5nT2JqZWN0QWRkZWQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL251bWJlci1zdWl0ZS1jb21tb24vaXNzdWVzLzQxXHJcbiAgICogQWRkIGxpc3RlbmVyIGNhbGxzIGFyZSBkdXBsaWNhdGVkIGZyb20gTWFrZUFUZW5FeHBsb3JlU2NyZWVuVmlldy5vbkNvdW50aW5nT2JqZWN0QWRkZWRcclxuICAgKi9cclxuICBwdWJsaWMgb25Db3VudGluZ09iamVjdEFkZGVkKCBjb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QgKTogdm9pZCB7XHJcblxyXG4gICAgY29uc3QgY291bnRpbmdPYmplY3ROb2RlID0gbmV3IENvdW50aW5nT2JqZWN0Tm9kZShcclxuICAgICAgY291bnRpbmdPYmplY3QsXHJcbiAgICAgIHRoaXMuY291bnRpbmdBcmVhQm91bmRzUHJvcGVydHksXHJcbiAgICAgIHRoaXMuYWRkQW5kRHJhZ0NvdW50aW5nT2JqZWN0LmJpbmQoIHRoaXMgKSxcclxuICAgICAgdGhpcy5oYW5kbGVEcm9wcGVkQ291bnRpbmdPYmplY3QuYmluZCggdGhpcyApLCB7XHJcbiAgICAgICAgY291bnRpbmdPYmplY3RUeXBlUHJvcGVydHk6IHRoaXMuY291bnRpbmdPYmplY3RUeXBlUHJvcGVydHksXHJcbiAgICAgICAgYmFzZU51bWJlck5vZGVPcHRpb25zOiB7XHJcbiAgICAgICAgICBoYW5kbGVPZmZzZXRZOiBDT1VOVElOR19PQkpFQ1RfSEFORExFX09GRlNFVF9ZXHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdE5vZGVNYXBbIGNvdW50aW5nT2JqZWN0Tm9kZS5jb3VudGluZ09iamVjdC5pZCBdID0gY291bnRpbmdPYmplY3ROb2RlO1xyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdExheWVyTm9kZS5hZGRDaGlsZCggY291bnRpbmdPYmplY3ROb2RlICk7XHJcbiAgICBjb3VudGluZ09iamVjdE5vZGUuYXR0YWNoTGlzdGVuZXJzKCk7XHJcblxyXG4gICAgdGhpcy5jbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lci5hZGREcmFnZ2FibGVJdGVtKCBjb3VudGluZ09iamVjdE5vZGUgKTtcclxuXHJcbiAgICAvLyBhZGQgbGlzdGVuZXJzXHJcbiAgICBjb3VudGluZ09iamVjdC5lbmRBbmltYXRpb25FbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLmFuaW1hdGlvbkZpbmlzaGVkTGlzdGVuZXIgKTtcclxuICAgIGNvdW50aW5nT2JqZWN0Tm9kZS5lbmREcmFnRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5kcmFnRmluaXNoZWRMaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlcyByZW1vdmluZyB0aGUgcmVsZXZhbnQgQ291bnRpbmdPYmplY3ROb2RlXHJcbiAgICogVE9ETzogRHVwbGljYXRlZCBmcm9tIENvdW50aW5nQ29tbW9uU2NyZWVuVmlldy5vbkNvdW50aW5nT2JqZWN0UmVtb3ZlZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbnVtYmVyLXN1aXRlLWNvbW1vbi9pc3N1ZXMvNDFcclxuICAgKiBMaXN0ZW5lciByZW1vdmFsIGR1cGxpY2F0ZWQgZnJvbSBNYWtlQVRlbkV4cGxvcmVTY3JlZW5WaWV3Lm9uQ291bnRpbmdPYmplY3RSZW1vdmVkXHJcbiAgICovXHJcbiAgcHVibGljIG9uQ291bnRpbmdPYmplY3RSZW1vdmVkKCBjb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QgKTogdm9pZCB7XHJcbiAgICAvLyBUT0RPOiBzYW1lIGFzIENvdW50aW5nQ29tbW9uU2NyZWVuVmlldy5maW5kQ291bnRpbmdPYmplY3ROb2RlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9udW1iZXItc3VpdGUtY29tbW9uL2lzc3Vlcy80MVxyXG4gICAgY29uc3QgY291bnRpbmdPYmplY3ROb2RlID0gdGhpcy5nZXRDb3VudGluZ09iamVjdE5vZGUoIGNvdW50aW5nT2JqZWN0ICk7XHJcblxyXG4gICAgLy8gUmVtb3ZlIGxpc3RlbmVyc1xyXG4gICAgY291bnRpbmdPYmplY3ROb2RlLmVuZERyYWdFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLmRyYWdGaW5pc2hlZExpc3RlbmVyICk7XHJcbiAgICBjb3VudGluZ09iamVjdC5lbmRBbmltYXRpb25FbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLmFuaW1hdGlvbkZpbmlzaGVkTGlzdGVuZXIgKTtcclxuXHJcbiAgICBkZWxldGUgdGhpcy5jb3VudGluZ09iamVjdE5vZGVNYXBbIGNvdW50aW5nT2JqZWN0Tm9kZS5jb3VudGluZ09iamVjdC5pZCBdO1xyXG4gICAgdGhpcy5jbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lci5yZW1vdmVEcmFnZ2FibGVJdGVtKCBjb3VudGluZ09iamVjdE5vZGUgKTtcclxuICAgIGNvdW50aW5nT2JqZWN0Tm9kZS5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBhIENvdW50aW5nT2JqZWN0LCBnZXQgdGhlIGN1cnJlbnQgdmlldyAoQ291bnRpbmdPYmplY3ROb2RlKSBvZiBpdC5cclxuICAgKiBUT0RPOiBEdXBsaWNhdGlvbiwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL251bWJlci1zdWl0ZS1jb21tb24vaXNzdWVzLzQxXHJcbiAgICovXHJcbiAgcHVibGljIGdldENvdW50aW5nT2JqZWN0Tm9kZSggY291bnRpbmdPYmplY3Q6IENvdW50aW5nT2JqZWN0ICk6IENvdW50aW5nT2JqZWN0Tm9kZSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmNvdW50aW5nT2JqZWN0Tm9kZU1hcFsgY291bnRpbmdPYmplY3QuaWQgXTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlc3VsdCwgJ0RpZCBub3QgZmluZCBtYXRjaGluZyBOb2RlJyApO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZW4gdGhlIHVzZXIgZHJvcHMgYSBjb3VudGluZ09iamVjdCB0aGV5IHdlcmUgZHJhZ2dpbmcsIHRyeSB0byBkbyB0aGUgZm9sbG93aW5nIHRoaW5ncyBpbiBvcmRlcjpcclxuICAgKiAxLiBTZWUgaWYgdGhlcmUncyBhbnkgdGVuRnJhbWVzIHVuZGVybmVhdGggdGhlIGRyb3BwZWQgY291bnRpbmdPYmplY3QgdGhhdCBzaG91bGQgYmUgYWRkZWQgdG8uXHJcbiAgICogMi4gU2VlIGlmIHRoZXJlJ3MgYW55IGNvdW50aW5nT2JqZWN0cyB1bmRlcm5lYXRoIHRoZSBkcm9wcGVkIGNvdW50aW5nT2JqZWN0IHRoYXQgc2hvdWxkIGVpdGhlciBiZSBjb21iaW5lZCB3aXRoIG9yXHJcbiAgICogICAgbW92ZWQgYXdheSBmcm9tLlxyXG4gICAqXHJcbiAgICogVGhlIGltcGxlbWVudGF0aW9uIG9mIGNoZWNraW5nIGZvciB0ZW5GcmFtZXMgZmlyc3QgbWF0Y2hlcyB0aGUgY3VycmVudCBkZXNpZ24sIGJ1dCBhIG5ldyBvciBjaGFuZ2VkIGRlc2lnbiBjb3VsZFxyXG4gICAqIHJlcXVpcmUgYSBkaWZmZXJlbnQgb3JkZXIgb2YgY2hlY2tpbmcuXHJcbiAgICovXHJcbiAgcHVibGljIGhhbmRsZURyb3BwZWRDb3VudGluZ09iamVjdCggZHJhZ2dlZENvdW50aW5nT2JqZWN0OiBDb3VudGluZ09iamVjdCApOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy50cnlUb0FkZFRvVGVuRnJhbWUoIGRyYWdnZWRDb3VudGluZ09iamVjdCApICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETzogZHVwbGljYXRpb24gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL251bWJlci1zdWl0ZS1jb21tb24vaXNzdWVzLzQxXHJcbiAgICBjb25zdCBkcmFnZ2VkTm9kZSA9IHRoaXMuZ2V0Q291bnRpbmdPYmplY3ROb2RlKCBkcmFnZ2VkQ291bnRpbmdPYmplY3QgKTtcclxuXHJcbiAgICAvLyBUT0RPOiBzZW1pLWR1cGxpY2F0aW9uIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9udW1iZXItc3VpdGUtY29tbW9uL2lzc3Vlcy80MVxyXG4gICAgLy8gcmVtb3ZlIGFueSBjb3VudGluZ09iamVjdHMgdGhhdCBhcmVuJ3QgaW5jbHVkZWQgaW4gdGhlIHN1bSAtIHRoZXNlIGFyZSBhbHJlYWR5IG9uIHRoZWlyIHdheSBiYWNrIHRvIHRoZSBjcmVhdG9yTm9kZSBhbmRcclxuICAgIC8vIHNob3VsZCBub3QgYmUgdHJpZWQgdG8gY29tYmluZWQgd2l0aC4gcmV0dXJuIGlmIG5vIGNvdW50aW5nT2JqZWN0cyBhcmUgbGVmdCBvciBpZiB0aGUgZHJhZ2dlZENvdW50aW5nT2JqZWN0IGlzIG5vdFxyXG4gICAgLy8gaW5jbHVkZWQgaW4gdGhlIHN1bVxyXG4gICAgY29uc3QgYWxsQ291bnRpbmdPYmplY3ROb2RlcyA9IF8uZmlsdGVyKCB0aGlzLmNvdW50aW5nT2JqZWN0TGF5ZXJOb2RlLmNoaWxkcmVuLFxyXG4gICAgICBjaGlsZCA9PiBjaGlsZCBpbnN0YW5jZW9mIENvdW50aW5nT2JqZWN0Tm9kZSAmJiBjaGlsZC5jb3VudGluZ09iamVjdC5pbmNsdWRlSW5TdW1Qcm9wZXJ0eS52YWx1ZSApIGFzIENvdW50aW5nT2JqZWN0Tm9kZVtdO1xyXG5cclxuICAgIGlmICggYWxsQ291bnRpbmdPYmplY3ROb2Rlcy5sZW5ndGggPT09IDAgfHwgIWRyYWdnZWRDb3VudGluZ09iamVjdC5pbmNsdWRlSW5TdW1Qcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE86IGR1cGxpY2F0aW9uIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9udW1iZXItc3VpdGUtY29tbW9uL2lzc3Vlcy80MVxyXG4gICAgY29uc3QgZHJvcHBlZE5vZGVzID0gZHJhZ2dlZE5vZGUuZmluZEF0dGFjaGFibGVOb2RlcyggYWxsQ291bnRpbmdPYmplY3ROb2RlcyApO1xyXG5cclxuICAgIC8vIFRPRE86IGR1cGxpY2F0aW9uIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9udW1iZXItc3VpdGUtY29tbW9uL2lzc3Vlcy80MVxyXG4gICAgLy8gQ2hlY2sgdGhlbSBpbiByZXZlcnNlIG9yZGVyICh0aGUgb25lIG9uIHRoZSB0b3Agc2hvdWxkIGdldCBtb3JlIHByaW9yaXR5KVxyXG4gICAgZHJvcHBlZE5vZGVzLnJldmVyc2UoKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBkcm9wcGVkTm9kZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGRyb3BwZWROb2RlID0gZHJvcHBlZE5vZGVzWyBpIF07XHJcbiAgICAgIGNvbnN0IGRyb3BwZWRDb3VudGluZ09iamVjdCA9IGRyb3BwZWROb2RlLmNvdW50aW5nT2JqZWN0O1xyXG5cclxuICAgICAgLy8gaWYgZ3JvdXBpbmcgaXMgdHVybmVkIG9mZiwgcmVwZWwgYXdheVxyXG4gICAgICBpZiAoICF0aGlzLmNvdW50aW5nQXJlYS5ncm91cGluZ0VuYWJsZWRQcm9wZXJ0eS52YWx1ZSB8fCAhZHJvcHBlZENvdW50aW5nT2JqZWN0Lmdyb3VwaW5nRW5hYmxlZFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIGlmICggZHJhZ2dlZENvdW50aW5nT2JqZWN0LnBvc2l0aW9uUHJvcGVydHkudmFsdWUuZGlzdGFuY2UoIGRyb3BwZWRDb3VudGluZ09iamVjdC5wb3NpdGlvblByb3BlcnR5LnZhbHVlICkgPCBDT1VOVElOR19PQkpFQ1RfUkVQRUxfV0hFTl9DTE9TRVJfVEhBTiApIHtcclxuICAgICAgICAgIHRoaXMuY291bnRpbmdBcmVhLnJlcGVsQXdheSggdGhpcy5jb3VudGluZ0FyZWFCb3VuZHNQcm9wZXJ0eS52YWx1ZSwgZHJhZ2dlZENvdW50aW5nT2JqZWN0LCBkcm9wcGVkQ291bnRpbmdPYmplY3QsICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICBsZWZ0OiAtQ09VTlRJTkdfT0JKRUNUX1JFUEVMX0RJU1RBTkNFLFxyXG4gICAgICAgICAgICAgIHJpZ2h0OiBDT1VOVElOR19PQkpFQ1RfUkVQRUxfRElTVEFOQ0VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gVE9ETzogZHVwbGljYXRpb24gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL251bWJlci1zdWl0ZS1jb21tb24vaXNzdWVzLzQxXHJcbiAgICAgICAgLy8gYWxsb3cgYW55IHR3byBudW1iZXJzIHRvIGJlIGNvbWJpbmVkXHJcbiAgICAgICAgdGhpcy5jb3VudGluZ0FyZWEuY29sbGFwc2VOdW1iZXJNb2RlbHMoIHRoaXMuY291bnRpbmdBcmVhQm91bmRzUHJvcGVydHkudmFsdWUsIGRyYWdnZWRDb3VudGluZ09iamVjdCwgZHJvcHBlZENvdW50aW5nT2JqZWN0ICk7XHJcbiAgICAgICAgcmV0dXJuOyAvLyBObyBuZWVkIHRvIHJlLWxheWVyIG9yIHRyeSBjb21iaW5pbmcgd2l0aCBvdGhlcnNcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHdlIHdlcmUgYWJsZSB0byBhZGQgdGhlIGNvdW50aW5nT2JqZWN0IHRvIGEgdGVuRnJhbWUuIElmIHRydWUsIGl0IGFsc28gYWRkcyB0aGUgY291bnRpbmdPYmplY3RcclxuICAgKiB0byB0aGUgdGVuRnJhbWUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0cnlUb0FkZFRvVGVuRnJhbWUoIGRyb3BwZWRDb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QgKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoICF0aGlzLmNvdW50aW5nQXJlYS50ZW5GcmFtZXMgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkcm9wcGVkQ291bnRpbmdPYmplY3ROb2RlID0gdGhpcy5nZXRDb3VudGluZ09iamVjdE5vZGUoIGRyb3BwZWRDb3VudGluZ09iamVjdCApO1xyXG4gICAgY29uc3QgYWxsRHJhZ2dhYmxlVGVuRnJhbWVOb2RlcyA9IF8uZmlsdGVyKCB0aGlzLmNvdW50aW5nT2JqZWN0TGF5ZXJOb2RlLmNoaWxkcmVuLFxyXG4gICAgICBjaGlsZCA9PiBjaGlsZCBpbnN0YW5jZW9mIERyYWdnYWJsZVRlbkZyYW1lTm9kZSApIGFzIERyYWdnYWJsZVRlbkZyYW1lTm9kZVtdO1xyXG5cclxuICAgIGNvbnN0IGRyb3BwZWROb2RlQ291bnRpbmdUeXBlID0gZHJvcHBlZENvdW50aW5nT2JqZWN0Tm9kZS5jb3VudGluZ09iamVjdFR5cGVQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICBpZiAoICFhbGxEcmFnZ2FibGVUZW5GcmFtZU5vZGVzLmxlbmd0aCApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRlbkZyYW1lTm9kZSA9IHRoaXMuZmluZEF0dGFjaGFibGVUZW5GcmFtZU5vZGUoIGRyb3BwZWRDb3VudGluZ09iamVjdE5vZGUsIGFsbERyYWdnYWJsZVRlbkZyYW1lTm9kZXMgKTtcclxuXHJcbiAgICAvLyBJZiB3ZSBmb3VuZCBhIHRlbkZyYW1lIHVuZGVybmVhdGggdGhpcyBjb3VudGluZ09iamVjdFxyXG4gICAgaWYgKCB0ZW5GcmFtZU5vZGUgKSB7XHJcblxyXG4gICAgICAvLyBJZiB0aGlzIGNvdW50aW5nT2JqZWN0IGlzIG5vdCBhbHJlYWR5IGluIGEgdGVuRnJhbWVcclxuICAgICAgaWYgKCAhdGhpcy5pc0NvdW50aW5nT2JqZWN0Q29udGFpbmVkQnlUZW5GcmFtZSggZHJvcHBlZENvdW50aW5nT2JqZWN0ICkgKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHRlbkZyYW1lID0gdGVuRnJhbWVOb2RlLnRlbkZyYW1lO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgY291bnRpbmdPYmplY3QgYW5kIHRlbkZyYW1lIGhhdmUgdGhlIHNhbWUgY291bnRpbmdPYmplY3RUeXBlXHJcbiAgICAgICAgbGV0IHRlbkZyYW1lU2hhcmVzQ291bnRpbmdPYmplY3RUeXBlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmICggdGVuRnJhbWUuY291bnRpbmdPYmplY3RzLmxlbmd0aFByb3BlcnR5LnZhbHVlID4gMCApIHtcclxuICAgICAgICAgIHRlbkZyYW1lU2hhcmVzQ291bnRpbmdPYmplY3RUeXBlID0gdGhpcy5jb3VudGluZ0FyZWEuY291bnRpbmdPYmplY3RzLmluY2x1ZGVzKCB0ZW5GcmFtZS5jb3VudGluZ09iamVjdHNbIDAgXSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUGFwZXIgbnVtYmVyIGNhbm5vdCBiZSBhZGRlZCB0byB0ZW5GcmFtZXMgYW55d2F5cy5cclxuICAgICAgICBjb25zdCBub0NvdW50aW5nT2JqZWN0c0luVGVuRnJhbWUgPSAhdGVuRnJhbWUuY291bnRpbmdPYmplY3RzLmxlbmd0aFByb3BlcnR5LnZhbHVlICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJvcHBlZE5vZGVDb3VudGluZ1R5cGUgIT09IENvdW50aW5nT2JqZWN0VHlwZS5QQVBFUl9OVU1CRVI7XHJcblxyXG4gICAgICAgIC8vIEFkZCBvbmx5IHNpbWlsYXIgb2JqZWN0IHR5cGVzLCBvciBub24gcGFwZXItbnVtYmVycyBpZiB0ZW5GcmFtZSBpcyBlbXB0eVxyXG4gICAgICAgIGNvbnN0IHNob3VsZEFkZCA9IHRlbkZyYW1lU2hhcmVzQ291bnRpbmdPYmplY3RUeXBlIHx8IG5vQ291bnRpbmdPYmplY3RzSW5UZW5GcmFtZTtcclxuXHJcbiAgICAgICAgLy8gUHVzaCBhd2F5IG9iamVjdHMgd2hlbiB0aGUgdGVuRnJhbWUgaXMgZnVsbFxyXG4gICAgICAgIGlmICggIXRlbkZyYW1lLmlzRnVsbCgpICYmIHNob3VsZEFkZCApIHtcclxuICAgICAgICAgIHRlbkZyYW1lLmFkZENvdW50aW5nT2JqZWN0KCBkcm9wcGVkQ291bnRpbmdPYmplY3QgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0ZW5GcmFtZS5wdXNoQXdheUNvdW50aW5nT2JqZWN0KCBkcm9wcGVkQ291bnRpbmdPYmplY3QsIHRoaXMuY291bnRpbmdBcmVhQm91bmRzUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSXMgdGhlIHByb3ZpZGVkIGNvdW50aW5nT2JqZWN0IGFscmVhZHkgaW4gYSB0ZW5GcmFtZS5cclxuICAgKi9cclxuICBwcml2YXRlIGlzQ291bnRpbmdPYmplY3RDb250YWluZWRCeVRlbkZyYW1lKCBjb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QgKTogYm9vbGVhbiB7XHJcbiAgICBsZXQgaXNDb250YWluZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuY291bnRpbmdBcmVhLnRlbkZyYW1lcz8uZm9yRWFjaCggdGVuRnJhbWUgPT4ge1xyXG4gICAgICBpZiAoIHRlbkZyYW1lLmNvbnRhaW5zQ291bnRpbmdPYmplY3QoIGNvdW50aW5nT2JqZWN0ICkgKSB7XHJcbiAgICAgICAgaXNDb250YWluZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIGlzQ29udGFpbmVkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2l2ZW4gdGhlIGNvdW50aW5nT2JqZWN0Tm9kZSBhbmQgYW4gYXJyYXkgb2YgRHJhZ2dhYmxlVGVuRnJhbWVOb2RlcywgcmV0dXJuIHRoZSBoaWdoZXN0IFRlbkZyYW1lTm9kZSB0aGF0IHRoZVxyXG4gICAqIGNvdW50aW5nT2JqZWN0Tm9kZSBpcyBvbiB0b3Agb2YsIGlmIGFueSAob3IgbnVsbCBpZiBub25lIGFyZSBmb3VuZCkuIFRoaXMgcmVsaWVzIG9uIHRoZSBhc3N1bXB0aW9uIHRoYXQgdGhlXHJcbiAgICogRHJhZ2dhYmxlVGVuRnJhbWVOb2RlcyBwcm92aWRlZCBhcmUgY3VycmVudGx5IGNoaWxkcmVuIG9mIGEgTm9kZSBsYXllci5cclxuICAgKi9cclxuICBwcml2YXRlIGZpbmRBdHRhY2hhYmxlVGVuRnJhbWVOb2RlKCBjb3VudGluZ09iamVjdE5vZGU6IENvdW50aW5nT2JqZWN0Tm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxEcmFnZ2FibGVUZW5GcmFtZU5vZGVzOiBEcmFnZ2FibGVUZW5GcmFtZU5vZGVbXSApOiBEcmFnZ2FibGVUZW5GcmFtZU5vZGUgfCBudWxsIHtcclxuICAgIGNvbnN0IHRlbkZyYW1lTm9kZUNhbmRpZGF0ZXMgPSBhbGxEcmFnZ2FibGVUZW5GcmFtZU5vZGVzLnNsaWNlKCk7XHJcblxyXG4gICAgLy8gRmluZCBhbGwgRHJhZ2dhYmxlVGVuRnJhbWVOb2RlcyB0aGF0IGFyZSB1bmRlcm5lYXRoIHRoZSBkcm9wcGVkIGNvdW50aW5nT2JqZWN0Tm9kZS5cclxuICAgIGNvbnN0IHVub3JkZXJlZEF0dGFjaGFibGVUZW5GcmFtZU5vZGVzID0gdGVuRnJhbWVOb2RlQ2FuZGlkYXRlcy5maWx0ZXIoIHRlbkZyYW1lTm9kZSA9PiB7XHJcbiAgICAgIHJldHVybiB0ZW5GcmFtZU5vZGUudGVuRnJhbWUuaXNDb3VudGluZ09iamVjdE9uVG9wT2YoIGNvdW50aW5nT2JqZWN0Tm9kZS5jb3VudGluZ09iamVjdCApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGxldCBhdHRhY2hhYmxlVGVuRnJhbWVOb2RlID0gbnVsbDtcclxuXHJcbiAgICAvLyBTZWxlY3QgdGhlIHRvcCBhdHRhY2hhYmxlIFRlbkZyYW1lTm9kZSwgaWYgYW55IHdlcmUgYXR0YWNoYWJsZSBmcm9tIGFib3ZlLlxyXG4gICAgaWYgKCB1bm9yZGVyZWRBdHRhY2hhYmxlVGVuRnJhbWVOb2RlcyApIHtcclxuICAgICAgYXR0YWNoYWJsZVRlbkZyYW1lTm9kZSA9IF8ubWF4QnkoIHVub3JkZXJlZEF0dGFjaGFibGVUZW5GcmFtZU5vZGVzLCBhdHRhY2hhYmxlVGVuRnJhbWVOb2RlID0+IHtcclxuICAgICAgICByZXR1cm4gYXR0YWNoYWJsZVRlbkZyYW1lTm9kZS5wYXJlbnQhLmluZGV4T2ZDaGlsZCggYXR0YWNoYWJsZVRlbkZyYW1lTm9kZSApO1xyXG4gICAgICB9ICkhO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhdHRhY2hhYmxlVGVuRnJhbWVOb2RlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFrZSBzdXJlIGFsbCBjb3VudGluZ09iamVjdHMgYXJlIHdpdGhpbiB0aGUgYXZhaWxhYmxlVmlld0JvdW5kc1xyXG4gICAqIFRPRE86IER1cGxpY2F0aW9uLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbnVtYmVyLXN1aXRlLWNvbW1vbi9pc3N1ZXMvNDFcclxuICAgKi9cclxuICBwcml2YXRlIGNvbnN0cmFpbkFsbFBvc2l0aW9ucygpOiB2b2lkIHtcclxuICAgIHRoaXMuY291bnRpbmdBcmVhLmNvdW50aW5nT2JqZWN0cy5mb3JFYWNoKCAoIGNvdW50aW5nT2JqZWN0OiBDb3VudGluZ09iamVjdCApID0+IHtcclxuICAgICAgY291bnRpbmdPYmplY3Quc2V0Q29uc3RyYWluZWREZXN0aW5hdGlvbiggdGhpcy5jb3VudGluZ0FyZWFCb3VuZHNQcm9wZXJ0eS52YWx1ZSwgY291bnRpbmdPYmplY3QucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGUgY291bnRpbmdPYmplY3QgaXMgcHJlZG9taW5hbnRseSBvdmVyIHRoZSBleHBsb3JlIHBhbmVsIChzaG91bGQgYmUgY29sbGVjdGVkKS5cclxuICAgKi9cclxuICBwcml2YXRlIGlzTnVtYmVySW5SZXR1cm5ab25lKCBjb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QgKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBwYXJlbnRCb3VuZHMgPSB0aGlzLmdldENvdW50aW5nT2JqZWN0Tm9kZSggY291bnRpbmdPYmplY3QgKS5ib3VuZHM7XHJcblxyXG4gICAgLy8gQW5kIHRoZSBib3VuZHMgb2Ygb3VyIHBhbmVsXHJcbiAgICBjb25zdCBwYW5lbEJvdW5kcyA9IHRoaXMucmV0dXJuWm9uZVByb3BlcnR5ID8gdGhpcy5yZXR1cm5ab25lUHJvcGVydHkudmFsdWUgOiB0aGlzLmNvdW50aW5nT2JqZWN0Q3JlYXRvclBhbmVsLmJvdW5kcztcclxuXHJcbiAgICByZXR1cm4gcGFuZWxCb3VuZHMuaW50ZXJzZWN0c0JvdW5kcyggcGFyZW50Qm91bmRzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIGNvdW50aW5nT2JqZWN0IGhhcyBmaW5pc2hlZCBhbmltYXRpbmcgdG8gaXRzIGRlc3RpbmF0aW9uLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgb25OdW1iZXJBbmltYXRpb25GaW5pc2hlZCggY291bnRpbmdPYmplY3Q6IENvdW50aW5nT2JqZWN0ICk6IHZvaWQge1xyXG5cclxuICAgIC8vIElmIGl0IGFuaW1hdGVkIHRvIHRoZSByZXR1cm4gem9uZSwgaXQncyBwcm9iYWJseSBzcGxpdCBhbmQgbWVhbnQgdG8gYmUgcmV0dXJuZWQuXHJcbiAgICBpZiAoIHRoaXMuY291bnRpbmdBcmVhLmNvdW50aW5nT2JqZWN0cy5pbmNsdWRlcyggY291bnRpbmdPYmplY3QgKSAmJiB0aGlzLmlzTnVtYmVySW5SZXR1cm5ab25lKCBjb3VudGluZ09iamVjdCApICkge1xyXG4gICAgICBpZiAoIGNvdW50aW5nT2JqZWN0LmluY2x1ZGVJblN1bVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIHRoaXMub25OdW1iZXJEcmFnRmluaXNoZWQoIGNvdW50aW5nT2JqZWN0ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY29uc3QgY291bnRpbmdPYmplY3RWYWx1ZSA9IGNvdW50aW5nT2JqZWN0Lm51bWJlclZhbHVlUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgdGhpcy5jb3VudGluZ0FyZWEucmVtb3ZlQ291bnRpbmdPYmplY3QoIGNvdW50aW5nT2JqZWN0ICk7XHJcblxyXG4gICAgICAgIC8vIHNlZSBpZiB0aGUgY3JlYXRvciBub2RlIHNob3VsZCBzaG93IGFueSBoaWRkZW4gdGFyZ2V0cyBzaW5jZSBhIGNvdW50aW5nIG9iamVjdCB3YXMganVzdCByZXR1cm5lZFxyXG4gICAgICAgIHRoaXMuY291bnRpbmdPYmplY3RDcmVhdG9yUGFuZWwuY291bnRpbmdDcmVhdG9yTm9kZS52YWxpZGF0ZVZpc2liaWxpdHlGb3JUYXJnZXRzRm9yRGVjcmVhc2luZ1N1bSggY291bnRpbmdPYmplY3RWYWx1ZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggIXRoaXMudmlld0hhc0luZGVwZW5kZW50TW9kZWwgKSB7XHJcblxyXG4gICAgICAvLyBpZiB0aGlzIHZpZXcgaXMgcnVubmluZyBvZmYgb2YgYSBzaGFyZWQgbW9kZWwsIHRoZW4gaWYgYSBjb3VudGluZ09iamVjdCBoYXMgYWxyZWFkeSBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgbW9kZWwsXHJcbiAgICAgIC8vIGNoZWNrIGlmIGNyZWF0b3Igbm9kZSBzaG91bGQgYmUgdXBkYXRlZFxyXG4gICAgICBjb25zdCBjb3VudGluZ09iamVjdFZhbHVlID0gY291bnRpbmdPYmplY3QubnVtYmVyVmFsdWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgdGhpcy5jb3VudGluZ09iamVjdENyZWF0b3JQYW5lbC5jb3VudGluZ0NyZWF0b3JOb2RlLnZhbGlkYXRlVmlzaWJpbGl0eUZvclRhcmdldHNGb3JEZWNyZWFzaW5nU3VtKCBjb3VudGluZ09iamVjdFZhbHVlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIGNvdW50aW5nT2JqZWN0IGhhcyBmaW5pc2hlZCBiZWluZyBkcmFnZ2VkLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgb25OdW1iZXJEcmFnRmluaXNoZWQoIGNvdW50aW5nT2JqZWN0OiBDb3VudGluZ09iamVjdCApOiB2b2lkIHtcclxuXHJcbiAgICBpZiAoICF0aGlzLmluY2x1ZGVDb3VudGluZ09iamVjdENyZWF0b3JQYW5lbCApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJldHVybiBpdCB0byB0aGUgcGFuZWwgaWYgaXQncyBiZWVuIGRyb3BwZWQgaW4gdGhlIHBhbmVsLlxyXG4gICAgaWYgKCB0aGlzLmlzTnVtYmVySW5SZXR1cm5ab25lKCBjb3VudGluZ09iamVjdCApICkge1xyXG4gICAgICBjb3VudGluZ09iamVjdC5pbmNsdWRlSW5TdW1Qcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmNvdW50aW5nQXJlYS5jYWxjdWxhdGVUb3RhbCgpO1xyXG5cclxuICAgICAgLy8gU2V0IGl0cyBkZXN0aW5hdGlvbiB0byB0aGUgcHJvcGVyIHRhcmdldCAod2l0aCB0aGUgb2Zmc2V0IHNvIHRoYXQgaXQgd2lsbCBkaXNhcHBlYXIgb25jZSBjZW50ZXJlZCkuXHJcbiAgICAgIGxldCB0YXJnZXRQb3NpdGlvbiA9IHRoaXMuY291bnRpbmdPYmplY3RDcmVhdG9yUGFuZWwuY291bnRpbmdDcmVhdG9yTm9kZS5nZXRPcmlnaW5Qb3NpdGlvbigpO1xyXG4gICAgICB0YXJnZXRQb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uLm1pbnVzKCBjb3VudGluZ09iamVjdC5yZXR1cm5BbmltYXRpb25Cb3VuZHMuY2VudGVyICk7XHJcbiAgICAgIGNvbnN0IHRhcmdldFNjYWxlID0gY291bnRpbmdPYmplY3QuZ3JvdXBpbmdFbmFibGVkUHJvcGVydHkudmFsdWUgPyBOdW1iZXJTdWl0ZUNvbW1vbkNvbnN0YW50cy5HUk9VUEVEX1NUT1JFRF9DT1VOVElOR19PQkpFQ1RfU0NBTEUgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIE51bWJlclN1aXRlQ29tbW9uQ29uc3RhbnRzLlVOR1JPVVBFRF9TVE9SRURfQ09VTlRJTkdfT0JKRUNUX1NDQUxFO1xyXG4gICAgICBjb3VudGluZ09iamVjdC5zZXREZXN0aW5hdGlvbiggdGFyZ2V0UG9zaXRpb24sIHRydWUsIHtcclxuICAgICAgICB0YXJnZXRTY2FsZTogdGFyZ2V0U2NhbGUsXHJcbiAgICAgICAgdGFyZ2V0SGFuZGxlT3BhY2l0eTogMFxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgc2VyaWFsaXphdGlvbiBvZiB0aGUgY291bnRpbmdPYmplY3RzIGluIHRoZSBtb2RlbC4gVGhpcyBpbmNsdWRlcyB0aGUgcG9zaXRpb24sIHZhbHVlLCBhbmQgei1pbmRleCBvZiB0aGVcclxuICAgKiBjb3VudGluZ09iamVjdHMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFNlcmlhbGl6ZWRDb3VudGluZ09iamVjdHNJbmNsdWRlZEluU3VtKCk6IENvdW50aW5nT2JqZWN0U2VyaWFsaXphdGlvbltdIHtcclxuICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0c0luY2x1ZGVkSW5TdW0gPSB0aGlzLmNvdW50aW5nQXJlYS5nZXRDb3VudGluZ09iamVjdHNJbmNsdWRlZEluU3VtKCk7XHJcblxyXG4gICAgY29uc3QgY291bnRpbmdPYmplY3RQb3NpdGlvbnM6IENvdW50aW5nT2JqZWN0U2VyaWFsaXphdGlvbltdID0gW107XHJcbiAgICBjb3VudGluZ09iamVjdHNJbmNsdWRlZEluU3VtLmZvckVhY2goIGNvdW50aW5nT2JqZWN0ID0+IHtcclxuICAgICAgY29uc3QgY291bnRpbmdPYmplY3RaSW5kZXggPSB0aGlzLmNvdW50aW5nT2JqZWN0TGF5ZXJOb2RlLmNoaWxkcmVuLmluZGV4T2YoIHRoaXMuZ2V0Q291bnRpbmdPYmplY3ROb2RlKCBjb3VudGluZ09iamVjdCApICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvdW50aW5nT2JqZWN0WkluZGV4ID49IDAsXHJcbiAgICAgICAgYGNvdW50aW5nT2JqZWN0J3MgY29ycmVzcG9uZGluZyBOb2RlIG5vdCBpbiBjb3VudGluZ09iamVjdExheWVyTm9kZTogJHtjb3VudGluZ09iamVjdFpJbmRleH1gICk7XHJcblxyXG4gICAgICBjb3VudGluZ09iamVjdFBvc2l0aW9ucy5wdXNoKCB7XHJcbiAgICAgICAgcG9zaXRpb246IGNvdW50aW5nT2JqZWN0LnBvc2l0aW9uUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgbnVtYmVyVmFsdWU6IGNvdW50aW5nT2JqZWN0Lm51bWJlclZhbHVlUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgekluZGV4OiBjb3VudGluZ09iamVjdFpJbmRleFxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIGNvdW50aW5nT2JqZWN0UG9zaXRpb25zO1xyXG4gIH1cclxufVxyXG5cclxubnVtYmVyU3VpdGVDb21tb24ucmVnaXN0ZXIoICdDb3VudGluZ0FyZWFOb2RlJywgQ291bnRpbmdBcmVhTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBDb3VudGluZ0FyZWFOb2RlO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0Esa0JBQWtCLE1BQU0sa0VBQWtFO0FBRWpHLFNBQVNDLElBQUksRUFBbUNDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDcEcsT0FBT0MsNkJBQTZCLE1BQU0scURBQXFEO0FBQy9GLE9BQU9DLGlCQUFpQixNQUFNLDRCQUE0QjtBQUUxRCxPQUFPQywwQkFBMEIsTUFBNkMsaUNBQWlDO0FBRS9HLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsdUJBQXVCLE1BQU0sa0VBQWtFO0FBQ3RHLE9BQU9DLGtCQUFrQixNQUFNLG1FQUFtRTtBQUVsRyxPQUFPQywwQkFBMEIsTUFBTSxrQ0FBa0M7QUFDekUsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQUM3RCxPQUFPQyxxQkFBcUIsTUFBTSx5Q0FBeUM7QUFFM0UsT0FBT0MsU0FBUyxNQUFNLGtDQUFrQztBQWF4RDtBQUNBLE1BQU1DLCtCQUErQixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRTlD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