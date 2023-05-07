// Copyright 2018-2023, University of Colorado Boulder

/**
 * The main logic for maintaining the PDOM instance tree (see https://github.com/phetsims/scenery-phet/issues/365)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import arrayDifference from '../../../../phet-core/js/arrayDifference.js';
import { BrowserEvents, Node, PartialPDOMTrail, PDOMInstance, scenery, Trail } from '../../imports.js';

// Reference to the focused DOM element, so we can restore focus between big tree operations.
let activeElementId = null;
const PDOMTree = {
  /**
   * Called when a child node is added to a parent node (and the child is likely to have pdom content).
   * @public
   *
   * @param {Node} parent
   * @param {Node} child
   */
  addChild(parent, child) {
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`addChild parent:n#${parent._id}, child:n#${child._id}`);
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
    assert && assert(parent instanceof Node);
    assert && assert(child instanceof Node);
    assert && assert(!child._rendererSummary.hasNoPDOM());
    PDOMTree.beforeOp();
    if (!child._pdomParent) {
      PDOMTree.addTree(parent, child);
    }
    PDOMTree.afterOp();
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
  },
  /**
   * Called when a child node is removed from a parent node (and the child is likely to have pdom content).
   * @public
   *
   * @param {Node} parent
   * @param {Node} child
   */
  removeChild(parent, child) {
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`removeChild parent:n#${parent._id}, child:n#${child._id}`);
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
    assert && assert(parent instanceof Node);
    assert && assert(child instanceof Node);
    assert && assert(!child._rendererSummary.hasNoPDOM());
    PDOMTree.beforeOp();
    if (!child._pdomParent) {
      PDOMTree.removeTree(parent, child);
    }
    PDOMTree.afterOp();
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
  },
  /**
   * Called when a node's children are reordered (no additions/removals).
   * @public
   *
   * @param {Node} node
   */
  childrenOrderChange(node) {
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`childrenOrderChange node:n#${node._id}`);
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
    assert && assert(node instanceof Node);
    assert && assert(!node._rendererSummary.hasNoPDOM());
    PDOMTree.beforeOp();
    PDOMTree.reorder(node);
    PDOMTree.afterOp();
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
  },
  /**
   * Called when a node has an pdomOrder change.
   * @public
   *
   * @param {Node} node
   * @param {Array.<Node|null>|null} oldOrder
   * @param {Array.<Node|null>|null} newOrder
   */
  pdomOrderChange(node, oldOrder, newOrder) {
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`pdomOrderChange n#${node._id}: ${PDOMTree.debugOrder(oldOrder)},${PDOMTree.debugOrder(newOrder)}`);
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
    assert && assert(node instanceof Node);
    PDOMTree.beforeOp();
    const removedItems = []; // {Array.<Node|null>} - May contain the placeholder null
    const addedItems = []; // {Array.<Node|null>} - May contain the placeholder null

    arrayDifference(oldOrder || [], newOrder || [], removedItems, addedItems);
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`removed: ${PDOMTree.debugOrder(removedItems)}`);
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`added: ${PDOMTree.debugOrder(addedItems)}`);
    let i;
    let j;

    // Check some initial conditions
    if (assert) {
      for (i = 0; i < removedItems; i++) {
        assert(removedItems[i] === null || removedItems[i]._pdomParent === node, 'Node should have had an pdomOrder');
      }
      for (i = 0; i < addedItems; i++) {
        assert(addedItems[i] === null || addedItems[i]._pdomParent === null, 'Node is already specified in an pdomOrder');
      }
    }

    // NOTE: Performance could be improved in some cases if we can avoid rebuilding an pdom tree for DIRECT children
    // when changing whether they are present in the pdomOrder. Basically, if something is a child and NOT
    // in an pdomOrder, changing its parent's order to include it (or vice versa) triggers a rebuild when it
    // would not strictly be necessary.

    const pdomTrails = PDOMTree.findPDOMTrails(node);

    // Remove subtrees from us (that were removed)
    for (i = 0; i < removedItems.length; i++) {
      const removedItemToRemove = removedItems[i];
      if (removedItemToRemove) {
        PDOMTree.removeTree(node, removedItemToRemove, pdomTrails);
        removedItemToRemove._pdomParent = null;
      }
    }

    // Remove subtrees from their parents (that will be added here instead)
    for (i = 0; i < addedItems.length; i++) {
      const addedItemToRemove = addedItems[i];
      if (addedItemToRemove) {
        const removedParents = addedItemToRemove._parents;
        for (j = 0; j < removedParents.length; j++) {
          PDOMTree.removeTree(removedParents[j], addedItemToRemove);
        }
        addedItemToRemove._pdomParent = node;
      }
    }

    // Add subtrees to their parents (that were removed from our order)
    for (i = 0; i < removedItems.length; i++) {
      const removedItemToAdd = removedItems[i];
      if (removedItemToAdd) {
        const addedParents = removedItemToAdd._parents;
        for (j = 0; j < addedParents.length; j++) {
          PDOMTree.addTree(addedParents[j], removedItemToAdd);
        }
      }
    }

    // Add subtrees to us (that were added in this order change)
    for (i = 0; i < addedItems.length; i++) {
      const addedItemToAdd = addedItems[i];
      addedItemToAdd && PDOMTree.addTree(node, addedItemToAdd, pdomTrails);
    }
    PDOMTree.reorder(node, pdomTrails);
    PDOMTree.afterOp();
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
  },
  /**
   * Called when a node has an pdomContent change.
   * @public
   *
   * @param {Node} node
   */
  pdomContentChange(node) {
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`pdomContentChange n#${node._id}`);
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
    assert && assert(node instanceof Node);
    PDOMTree.beforeOp();
    let i;
    const parents = node._pdomParent ? [node._pdomParent] : node._parents;
    const pdomTrailsList = []; // pdomTrailsList[ i ] := PDOMTree.findPDOMTrails( parents[ i ] )

    // For now, just regenerate the full tree. Could optimize in the future, if we can swap the content for an
    // PDOMInstance.
    for (i = 0; i < parents.length; i++) {
      const parent = parents[i];
      const pdomTrails = PDOMTree.findPDOMTrails(parent);
      pdomTrailsList.push(pdomTrails);
      PDOMTree.removeTree(parent, node, pdomTrails);
    }

    // Do all removals before adding anything back in.
    for (i = 0; i < parents.length; i++) {
      PDOMTree.addTree(parents[i], node, pdomTrailsList[i]);
    }

    // An edge case is where we change the rootNode of the display (and don't have an effective parent)
    for (i = 0; i < node._rootedDisplays.length; i++) {
      const display = node._rootedDisplays[i];
      if (display._accessible) {
        PDOMTree.rebuildInstanceTree(display._rootPDOMInstance);
      }
    }
    PDOMTree.afterOp();
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
  },
  /**
   * Sets up a root instance with a given root node.
   * @public
   *
   * @param {PDOMInstance} rootInstance
   */
  rebuildInstanceTree(rootInstance) {
    const rootNode = rootInstance.display.rootNode;
    assert && assert(rootNode);
    rootInstance.removeAllChildren();
    rootInstance.addConsecutiveInstances(PDOMTree.createTree(new Trail(rootNode), rootInstance.display, rootInstance));
  },
  /**
   * Handles the conceptual addition of an pdom subtree.
   * @private
   *
   * @param {Node} parent
   * @param {Node} child
   * @param {Array.<PartialPDOMTrail>} [pdomTrails] - Will be computed if needed
   */
  addTree(parent, child, pdomTrails) {
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`addTree parent:n#${parent._id}, child:n#${child._id}`);
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
    assert && PDOMTree.auditNodeForPDOMCycles(parent);
    pdomTrails = pdomTrails || PDOMTree.findPDOMTrails(parent);
    for (let i = 0; i < pdomTrails.length; i++) {
      sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`trail: ${pdomTrails[i].trail.toString()} full:${pdomTrails[i].fullTrail.toString()} for ${pdomTrails[i].pdomInstance.toString()} root:${pdomTrails[i].isRoot}`);
      sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
      const partialTrail = pdomTrails[i];
      const parentInstance = partialTrail.pdomInstance;

      // The full trail doesn't have the child in it, so we temporarily add that for tree creation
      partialTrail.fullTrail.addDescendant(child);
      const childInstances = PDOMTree.createTree(partialTrail.fullTrail, parentInstance.display, parentInstance);
      partialTrail.fullTrail.removeDescendant(child);
      parentInstance.addConsecutiveInstances(childInstances);
      sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
    }
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
  },
  /**
   * Handles the conceptual removal of an pdom subtree.
   * @private
   *
   * @param {Node} parent
   * @param {Node} child
   * @param {Array.<PartialPDOMTrail>} [pdomTrails] - Will be computed if needed
   */
  removeTree(parent, child, pdomTrails) {
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`removeTree parent:n#${parent._id}, child:n#${child._id}`);
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
    pdomTrails = pdomTrails || PDOMTree.findPDOMTrails(parent);
    for (let i = 0; i < pdomTrails.length; i++) {
      const partialTrail = pdomTrails[i];

      // The full trail doesn't have the child in it, so we temporarily add that for tree removal
      partialTrail.fullTrail.addDescendant(child);
      partialTrail.pdomInstance.removeInstancesForTrail(partialTrail.fullTrail);
      partialTrail.fullTrail.removeDescendant(child);
    }
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
  },
  /**
   * Handles the conceptual sorting of an pdom subtree.
   * @private
   *
   * @param {Node} node
   * @param {Array.<PartialPDOMTrail>} [pdomTrails] - Will be computed if needed
   */
  reorder(node, pdomTrails) {
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`reorder n#${node._id}`);
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
    pdomTrails = pdomTrails || PDOMTree.findPDOMTrails(node);
    for (let i = 0; i < pdomTrails.length; i++) {
      const partialTrail = pdomTrails[i];

      // TODO: does it optimize things to pass the partial trail in (so we scan less)?
      partialTrail.pdomInstance.sortChildren();
    }
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
  },
  /**
   * Creates PDOM instances, returning an array of instances that should be added to the next level.
   * @private
   *
   * NOTE: Trails for which an already-existing instance exists will NOT create a new instance here. We only want to
   * fill in the "missing" structure. There are cases (a.children=[b,c], b.children=[c]) where removing an
   * pdomOrder can trigger addTree(a,b) AND addTree(b,c), and we can't create duplicate content.
   *
   * @param {Trail} trail
   * @param {Display} display
   * @param {PDOMInstance} parentInstance - Since we don't create the root here, can't be null
   * @returns {Array.<PDOMInstance>}
   */
  createTree(trail, display, parentInstance) {
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`createTree ${trail.toString()} parent:${parentInstance ? parentInstance.toString() : 'null'}`);
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
    const node = trail.lastNode();
    const effectiveChildren = node.getEffectiveChildren();
    sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`effectiveChildren: ${PDOMTree.debugOrder(effectiveChildren)}`);

    // If we have pdom content ourself, we need to create the instance (so we can provide it to child instances).
    let instance;
    let existed = false;
    if (node.hasPDOMContent) {
      instance = parentInstance.findChildWithTrail(trail);
      if (instance) {
        existed = true;
      } else {
        instance = PDOMInstance.pool.create(parentInstance, display, trail.copy());
      }

      // If there was an instance, then it should be the parent to effective children, otherwise, it isn't part of the
      // trail.
      parentInstance = instance;
    }

    // Create all of the direct-child instances.
    const childInstances = [];
    for (let i = 0; i < effectiveChildren.length; i++) {
      trail.addDescendant(effectiveChildren[i], i);
      Array.prototype.push.apply(childInstances, PDOMTree.createTree(trail, display, parentInstance));
      trail.removeDescendant();
    }

    // If we have an instance, hook things up, and return just it.
    if (instance) {
      instance.addConsecutiveInstances(childInstances);
      sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
      return existed ? [] : [instance];
    }
    // Otherwise pass things forward so they can be added as children by the parentInstance
    else {
      sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
      return childInstances;
    }
  },
  /**
   * Prepares for a pdom-tree-changing operation (saving some state). During DOM operations we don't want Display
   * input to dispatch events as focus changes.
   * @private
   */
  beforeOp() {
    activeElementId = document.activeElement.id;
    BrowserEvents.blockFocusCallbacks = true;
  },
  /**
   * Finalizes a pdom-tree-changing operation (restoring some state).
   * @private
   */
  afterOp() {
    const activeElement = document.getElementById(activeElementId);
    activeElement && activeElement.focus();
    BrowserEvents.blockFocusCallbacks = false;
  },
  /**
   * Returns all "pdom" trails from this node ancestor-wise to nodes that have display roots.
   * @private
   *
   * NOTE: "pdom" trails may not have strict parent-child relationships between adjacent nodes, as remapping of
   * the tree can have a "PDOM parent" and "pdom child" case (the child is in the parent's pdomOrder).
   *
   * @param {Node} node
   * @returns {Array.<PartialPDOMTrail>}
   */
  findPDOMTrails(node) {
    const trails = [];
    PDOMTree.recursivePDOMTrailSearch(trails, new Trail(node));
    return trails;
  },
  /**
   * Finds all partial "pdom" trails
   * @private
   *
   * @param {Array.<PartialPDOMTrail>} trailResults - Mutated, this is how we "return" our value.
   * @param {Trail} trail - Where to start from
   */
  recursivePDOMTrailSearch(trailResults, trail) {
    const root = trail.rootNode();
    let i;

    // If we find pdom content, our search ends here. IF it is connected to any accessible pdom displays somehow, it
    // will have pdom instances. We only care about these pdom instances, as they already have any DAG
    // deduplication applied.
    if (root.hasPDOMContent) {
      const instances = root.pdomInstances;
      for (i = 0; i < instances.length; i++) {
        trailResults.push(new PartialPDOMTrail(instances[i], trail.copy(), false));
      }
      return;
    }
    // Otherwise check for accessible pdom displays for which our node is the rootNode.
    else {
      const rootedDisplays = root.rootedDisplays;
      for (i = 0; i < rootedDisplays.length; i++) {
        const display = rootedDisplays[i];
        if (display._accessible) {
          trailResults.push(new PartialPDOMTrail(display._rootPDOMInstance, trail.copy(), true));
        }
      }
    }
    const parents = root._pdomParent ? [root._pdomParent] : root._parents;
    const parentCount = parents.length;
    for (i = 0; i < parentCount; i++) {
      const parent = parents[i];
      trail.addAncestor(parent);
      PDOMTree.recursivePDOMTrailSearch(trailResults, trail);
      trail.removeAncestor();
    }
  },
  /**
   * Ensures that the pdomDisplays on the node (and its subtree) are accurate.
   * @public
   */
  auditPDOMDisplays(node) {
    if (assertSlow) {
      if (node._pdomDisplaysInfo.canHavePDOMDisplays()) {
        let i;
        const displays = [];

        // Concatenation of our parents' pdomDisplays
        for (i = 0; i < node._parents.length; i++) {
          Array.prototype.push.apply(displays, node._parents[i]._pdomDisplaysInfo.pdomDisplays);
        }

        // And concatenation of any rooted displays (that support pdom)
        for (i = 0; i < node._rootedDisplays.length; i++) {
          const display = node._rootedDisplays[i];
          if (display._accessible) {
            displays.push(display);
          }
        }
        const actualArray = node._pdomDisplaysInfo.pdomDisplays.slice();
        const expectedArray = displays.slice(); // slice helps in debugging
        assertSlow(actualArray.length === expectedArray.length);
        for (i = 0; i < expectedArray.length; i++) {
          for (let j = 0; j < actualArray.length; j++) {
            if (expectedArray[i] === actualArray[j]) {
              expectedArray.splice(i, 1);
              actualArray.splice(j, 1);
              i--;
              break;
            }
          }
        }
        assertSlow(actualArray.length === 0 && expectedArray.length === 0, 'Mismatch with accessible pdom displays');
      } else {
        assertSlow(node._pdomDisplaysInfo.pdomDisplays.length === 0, 'Invisible/nonaccessible things should have no displays');
      }
    }
  },
  /**
   * Checks a given Node (with assertions) to ensure it is not part of a cycle in the combined graph with edges
   * defined by "there is a parent-child or pdomParent-pdomOrder" relationship between the two nodes.
   * @public (scenery-internal)
   *
   * See https://github.com/phetsims/scenery/issues/787 for more information (and for some detail on the cases
   * that we want to catch).
   *
   * @param {Node} node
   */
  auditNodeForPDOMCycles(node) {
    if (assert) {
      const trail = new Trail(node);
      (function recursiveSearch() {
        const root = trail.rootNode();
        assert(trail.length <= 1 || root !== node, `${'Accessible PDOM graph cycle detected. The combined scene-graph DAG with pdomOrder defining additional ' + 'parent-child relationships should still be a DAG. Cycle detected with the trail: '}${trail.toString()} path: ${trail.toPathString()}`);
        const parentCount = root._parents.length;
        for (let i = 0; i < parentCount; i++) {
          const parent = root._parents[i];
          trail.addAncestor(parent);
          recursiveSearch();
          trail.removeAncestor();
        }
        // Only visit the pdomParent if we didn't already visit it as a parent.
        if (root._pdomParent && !root._pdomParent.hasChild(root)) {
          trail.addAncestor(root._pdomParent);
          recursiveSearch();
          trail.removeAncestor();
        }
      })();
    }
  },
  /**
   * Returns a string representation of an order (using Node ids) for debugging.
   * @private
   *
   * @param {Array.<Node|null>|null} pdomOrder
   * @returns {string}
   */
  debugOrder(pdomOrder) {
    if (pdomOrder === null) {
      return 'null';
    }
    return `[${pdomOrder.map(nodeOrNull => nodeOrNull === null ? 'null' : nodeOrNull._id).join(',')}]`;
  }
};
scenery.register('PDOMTree', PDOMTree);
export default PDOMTree;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhcnJheURpZmZlcmVuY2UiLCJCcm93c2VyRXZlbnRzIiwiTm9kZSIsIlBhcnRpYWxQRE9NVHJhaWwiLCJQRE9NSW5zdGFuY2UiLCJzY2VuZXJ5IiwiVHJhaWwiLCJhY3RpdmVFbGVtZW50SWQiLCJQRE9NVHJlZSIsImFkZENoaWxkIiwicGFyZW50IiwiY2hpbGQiLCJzY2VuZXJ5TG9nIiwiX2lkIiwicHVzaCIsImFzc2VydCIsIl9yZW5kZXJlclN1bW1hcnkiLCJoYXNOb1BET00iLCJiZWZvcmVPcCIsIl9wZG9tUGFyZW50IiwiYWRkVHJlZSIsImFmdGVyT3AiLCJwb3AiLCJyZW1vdmVDaGlsZCIsInJlbW92ZVRyZWUiLCJjaGlsZHJlbk9yZGVyQ2hhbmdlIiwibm9kZSIsInJlb3JkZXIiLCJwZG9tT3JkZXJDaGFuZ2UiLCJvbGRPcmRlciIsIm5ld09yZGVyIiwiZGVidWdPcmRlciIsInJlbW92ZWRJdGVtcyIsImFkZGVkSXRlbXMiLCJpIiwiaiIsInBkb21UcmFpbHMiLCJmaW5kUERPTVRyYWlscyIsImxlbmd0aCIsInJlbW92ZWRJdGVtVG9SZW1vdmUiLCJhZGRlZEl0ZW1Ub1JlbW92ZSIsInJlbW92ZWRQYXJlbnRzIiwiX3BhcmVudHMiLCJyZW1vdmVkSXRlbVRvQWRkIiwiYWRkZWRQYXJlbnRzIiwiYWRkZWRJdGVtVG9BZGQiLCJwZG9tQ29udGVudENoYW5nZSIsInBhcmVudHMiLCJwZG9tVHJhaWxzTGlzdCIsIl9yb290ZWREaXNwbGF5cyIsImRpc3BsYXkiLCJfYWNjZXNzaWJsZSIsInJlYnVpbGRJbnN0YW5jZVRyZWUiLCJfcm9vdFBET01JbnN0YW5jZSIsInJvb3RJbnN0YW5jZSIsInJvb3ROb2RlIiwicmVtb3ZlQWxsQ2hpbGRyZW4iLCJhZGRDb25zZWN1dGl2ZUluc3RhbmNlcyIsImNyZWF0ZVRyZWUiLCJhdWRpdE5vZGVGb3JQRE9NQ3ljbGVzIiwidHJhaWwiLCJ0b1N0cmluZyIsImZ1bGxUcmFpbCIsInBkb21JbnN0YW5jZSIsImlzUm9vdCIsInBhcnRpYWxUcmFpbCIsInBhcmVudEluc3RhbmNlIiwiYWRkRGVzY2VuZGFudCIsImNoaWxkSW5zdGFuY2VzIiwicmVtb3ZlRGVzY2VuZGFudCIsInJlbW92ZUluc3RhbmNlc0ZvclRyYWlsIiwic29ydENoaWxkcmVuIiwibGFzdE5vZGUiLCJlZmZlY3RpdmVDaGlsZHJlbiIsImdldEVmZmVjdGl2ZUNoaWxkcmVuIiwiaW5zdGFuY2UiLCJleGlzdGVkIiwiaGFzUERPTUNvbnRlbnQiLCJmaW5kQ2hpbGRXaXRoVHJhaWwiLCJwb29sIiwiY3JlYXRlIiwiY29weSIsIkFycmF5IiwicHJvdG90eXBlIiwiYXBwbHkiLCJkb2N1bWVudCIsImFjdGl2ZUVsZW1lbnQiLCJpZCIsImJsb2NrRm9jdXNDYWxsYmFja3MiLCJnZXRFbGVtZW50QnlJZCIsImZvY3VzIiwidHJhaWxzIiwicmVjdXJzaXZlUERPTVRyYWlsU2VhcmNoIiwidHJhaWxSZXN1bHRzIiwicm9vdCIsImluc3RhbmNlcyIsInBkb21JbnN0YW5jZXMiLCJyb290ZWREaXNwbGF5cyIsInBhcmVudENvdW50IiwiYWRkQW5jZXN0b3IiLCJyZW1vdmVBbmNlc3RvciIsImF1ZGl0UERPTURpc3BsYXlzIiwiYXNzZXJ0U2xvdyIsIl9wZG9tRGlzcGxheXNJbmZvIiwiY2FuSGF2ZVBET01EaXNwbGF5cyIsImRpc3BsYXlzIiwicGRvbURpc3BsYXlzIiwiYWN0dWFsQXJyYXkiLCJzbGljZSIsImV4cGVjdGVkQXJyYXkiLCJzcGxpY2UiLCJyZWN1cnNpdmVTZWFyY2giLCJ0b1BhdGhTdHJpbmciLCJoYXNDaGlsZCIsInBkb21PcmRlciIsIm1hcCIsIm5vZGVPck51bGwiLCJqb2luIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQRE9NVHJlZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgbWFpbiBsb2dpYyBmb3IgbWFpbnRhaW5pbmcgdGhlIFBET00gaW5zdGFuY2UgdHJlZSAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzM2NSlcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBhcnJheURpZmZlcmVuY2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL2FycmF5RGlmZmVyZW5jZS5qcyc7XHJcbmltcG9ydCB7IEJyb3dzZXJFdmVudHMsIE5vZGUsIFBhcnRpYWxQRE9NVHJhaWwsIFBET01JbnN0YW5jZSwgc2NlbmVyeSwgVHJhaWwgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcclxuXHJcbi8vIFJlZmVyZW5jZSB0byB0aGUgZm9jdXNlZCBET00gZWxlbWVudCwgc28gd2UgY2FuIHJlc3RvcmUgZm9jdXMgYmV0d2VlbiBiaWcgdHJlZSBvcGVyYXRpb25zLlxyXG5sZXQgYWN0aXZlRWxlbWVudElkID0gbnVsbDtcclxuXHJcbmNvbnN0IFBET01UcmVlID0ge1xyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGEgY2hpbGQgbm9kZSBpcyBhZGRlZCB0byBhIHBhcmVudCBub2RlIChhbmQgdGhlIGNoaWxkIGlzIGxpa2VseSB0byBoYXZlIHBkb20gY29udGVudCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOb2RlfSBwYXJlbnRcclxuICAgKiBAcGFyYW0ge05vZGV9IGNoaWxkXHJcbiAgICovXHJcbiAgYWRkQ2hpbGQoIHBhcmVudCwgY2hpbGQgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSggYGFkZENoaWxkIHBhcmVudDpuIyR7cGFyZW50Ll9pZH0sIGNoaWxkOm4jJHtjaGlsZC5faWR9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBhcmVudCBpbnN0YW5jZW9mIE5vZGUgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNoaWxkIGluc3RhbmNlb2YgTm9kZSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWNoaWxkLl9yZW5kZXJlclN1bW1hcnkuaGFzTm9QRE9NKCkgKTtcclxuXHJcbiAgICBQRE9NVHJlZS5iZWZvcmVPcCgpO1xyXG5cclxuICAgIGlmICggIWNoaWxkLl9wZG9tUGFyZW50ICkge1xyXG4gICAgICBQRE9NVHJlZS5hZGRUcmVlKCBwYXJlbnQsIGNoaWxkICk7XHJcbiAgICB9XHJcblxyXG4gICAgUERPTVRyZWUuYWZ0ZXJPcCgpO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGEgY2hpbGQgbm9kZSBpcyByZW1vdmVkIGZyb20gYSBwYXJlbnQgbm9kZSAoYW5kIHRoZSBjaGlsZCBpcyBsaWtlbHkgdG8gaGF2ZSBwZG9tIGNvbnRlbnQpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Tm9kZX0gcGFyZW50XHJcbiAgICogQHBhcmFtIHtOb2RlfSBjaGlsZFxyXG4gICAqL1xyXG4gIHJlbW92ZUNoaWxkKCBwYXJlbnQsIGNoaWxkICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cuUERPTVRyZWUoIGByZW1vdmVDaGlsZCBwYXJlbnQ6biMke3BhcmVudC5faWR9LCBjaGlsZDpuIyR7Y2hpbGQuX2lkfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwYXJlbnQgaW5zdGFuY2VvZiBOb2RlICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjaGlsZCBpbnN0YW5jZW9mIE5vZGUgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFjaGlsZC5fcmVuZGVyZXJTdW1tYXJ5Lmhhc05vUERPTSgpICk7XHJcblxyXG4gICAgUERPTVRyZWUuYmVmb3JlT3AoKTtcclxuXHJcbiAgICBpZiAoICFjaGlsZC5fcGRvbVBhcmVudCApIHtcclxuICAgICAgUERPTVRyZWUucmVtb3ZlVHJlZSggcGFyZW50LCBjaGlsZCApO1xyXG4gICAgfVxyXG5cclxuICAgIFBET01UcmVlLmFmdGVyT3AoKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIG5vZGUncyBjaGlsZHJlbiBhcmUgcmVvcmRlcmVkIChubyBhZGRpdGlvbnMvcmVtb3ZhbHMpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxyXG4gICAqL1xyXG4gIGNoaWxkcmVuT3JkZXJDaGFuZ2UoIG5vZGUgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSggYGNoaWxkcmVuT3JkZXJDaGFuZ2Ugbm9kZTpuIyR7bm9kZS5faWR9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUgaW5zdGFuY2VvZiBOb2RlICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhbm9kZS5fcmVuZGVyZXJTdW1tYXJ5Lmhhc05vUERPTSgpICk7XHJcblxyXG4gICAgUERPTVRyZWUuYmVmb3JlT3AoKTtcclxuXHJcbiAgICBQRE9NVHJlZS5yZW9yZGVyKCBub2RlICk7XHJcblxyXG4gICAgUERPTVRyZWUuYWZ0ZXJPcCgpO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGEgbm9kZSBoYXMgYW4gcGRvbU9yZGVyIGNoYW5nZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcclxuICAgKiBAcGFyYW0ge0FycmF5LjxOb2RlfG51bGw+fG51bGx9IG9sZE9yZGVyXHJcbiAgICogQHBhcmFtIHtBcnJheS48Tm9kZXxudWxsPnxudWxsfSBuZXdPcmRlclxyXG4gICAqL1xyXG4gIHBkb21PcmRlckNoYW5nZSggbm9kZSwgb2xkT3JkZXIsIG5ld09yZGVyICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cuUERPTVRyZWUoIGBwZG9tT3JkZXJDaGFuZ2UgbiMke25vZGUuX2lkfTogJHtQRE9NVHJlZS5kZWJ1Z09yZGVyKCBvbGRPcmRlciApfSwke1BET01UcmVlLmRlYnVnT3JkZXIoIG5ld09yZGVyICl9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUgaW5zdGFuY2VvZiBOb2RlICk7XHJcblxyXG4gICAgUERPTVRyZWUuYmVmb3JlT3AoKTtcclxuXHJcbiAgICBjb25zdCByZW1vdmVkSXRlbXMgPSBbXTsgLy8ge0FycmF5LjxOb2RlfG51bGw+fSAtIE1heSBjb250YWluIHRoZSBwbGFjZWhvbGRlciBudWxsXHJcbiAgICBjb25zdCBhZGRlZEl0ZW1zID0gW107IC8vIHtBcnJheS48Tm9kZXxudWxsPn0gLSBNYXkgY29udGFpbiB0aGUgcGxhY2Vob2xkZXIgbnVsbFxyXG5cclxuICAgIGFycmF5RGlmZmVyZW5jZSggb2xkT3JkZXIgfHwgW10sIG5ld09yZGVyIHx8IFtdLCByZW1vdmVkSXRlbXMsIGFkZGVkSXRlbXMgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSggYHJlbW92ZWQ6ICR7UERPTVRyZWUuZGVidWdPcmRlciggcmVtb3ZlZEl0ZW1zICl9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cuUERPTVRyZWUoIGBhZGRlZDogJHtQRE9NVHJlZS5kZWJ1Z09yZGVyKCBhZGRlZEl0ZW1zICl9YCApO1xyXG5cclxuICAgIGxldCBpO1xyXG4gICAgbGV0IGo7XHJcblxyXG4gICAgLy8gQ2hlY2sgc29tZSBpbml0aWFsIGNvbmRpdGlvbnNcclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICBmb3IgKCBpID0gMDsgaSA8IHJlbW92ZWRJdGVtczsgaSsrICkge1xyXG4gICAgICAgIGFzc2VydCggcmVtb3ZlZEl0ZW1zWyBpIF0gPT09IG51bGwgfHwgcmVtb3ZlZEl0ZW1zWyBpIF0uX3Bkb21QYXJlbnQgPT09IG5vZGUsXHJcbiAgICAgICAgICAnTm9kZSBzaG91bGQgaGF2ZSBoYWQgYW4gcGRvbU9yZGVyJyApO1xyXG4gICAgICB9XHJcbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgYWRkZWRJdGVtczsgaSsrICkge1xyXG4gICAgICAgIGFzc2VydCggYWRkZWRJdGVtc1sgaSBdID09PSBudWxsIHx8IGFkZGVkSXRlbXNbIGkgXS5fcGRvbVBhcmVudCA9PT0gbnVsbCxcclxuICAgICAgICAgICdOb2RlIGlzIGFscmVhZHkgc3BlY2lmaWVkIGluIGFuIHBkb21PcmRlcicgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIE5PVEU6IFBlcmZvcm1hbmNlIGNvdWxkIGJlIGltcHJvdmVkIGluIHNvbWUgY2FzZXMgaWYgd2UgY2FuIGF2b2lkIHJlYnVpbGRpbmcgYW4gcGRvbSB0cmVlIGZvciBESVJFQ1QgY2hpbGRyZW5cclxuICAgIC8vIHdoZW4gY2hhbmdpbmcgd2hldGhlciB0aGV5IGFyZSBwcmVzZW50IGluIHRoZSBwZG9tT3JkZXIuIEJhc2ljYWxseSwgaWYgc29tZXRoaW5nIGlzIGEgY2hpbGQgYW5kIE5PVFxyXG4gICAgLy8gaW4gYW4gcGRvbU9yZGVyLCBjaGFuZ2luZyBpdHMgcGFyZW50J3Mgb3JkZXIgdG8gaW5jbHVkZSBpdCAob3IgdmljZSB2ZXJzYSkgdHJpZ2dlcnMgYSByZWJ1aWxkIHdoZW4gaXRcclxuICAgIC8vIHdvdWxkIG5vdCBzdHJpY3RseSBiZSBuZWNlc3NhcnkuXHJcblxyXG4gICAgY29uc3QgcGRvbVRyYWlscyA9IFBET01UcmVlLmZpbmRQRE9NVHJhaWxzKCBub2RlICk7XHJcblxyXG4gICAgLy8gUmVtb3ZlIHN1YnRyZWVzIGZyb20gdXMgKHRoYXQgd2VyZSByZW1vdmVkKVxyXG4gICAgZm9yICggaSA9IDA7IGkgPCByZW1vdmVkSXRlbXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHJlbW92ZWRJdGVtVG9SZW1vdmUgPSByZW1vdmVkSXRlbXNbIGkgXTtcclxuICAgICAgaWYgKCByZW1vdmVkSXRlbVRvUmVtb3ZlICkge1xyXG4gICAgICAgIFBET01UcmVlLnJlbW92ZVRyZWUoIG5vZGUsIHJlbW92ZWRJdGVtVG9SZW1vdmUsIHBkb21UcmFpbHMgKTtcclxuICAgICAgICByZW1vdmVkSXRlbVRvUmVtb3ZlLl9wZG9tUGFyZW50ID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbW92ZSBzdWJ0cmVlcyBmcm9tIHRoZWlyIHBhcmVudHMgKHRoYXQgd2lsbCBiZSBhZGRlZCBoZXJlIGluc3RlYWQpXHJcbiAgICBmb3IgKCBpID0gMDsgaSA8IGFkZGVkSXRlbXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGFkZGVkSXRlbVRvUmVtb3ZlID0gYWRkZWRJdGVtc1sgaSBdO1xyXG4gICAgICBpZiAoIGFkZGVkSXRlbVRvUmVtb3ZlICkge1xyXG4gICAgICAgIGNvbnN0IHJlbW92ZWRQYXJlbnRzID0gYWRkZWRJdGVtVG9SZW1vdmUuX3BhcmVudHM7XHJcbiAgICAgICAgZm9yICggaiA9IDA7IGogPCByZW1vdmVkUGFyZW50cy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICAgIFBET01UcmVlLnJlbW92ZVRyZWUoIHJlbW92ZWRQYXJlbnRzWyBqIF0sIGFkZGVkSXRlbVRvUmVtb3ZlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFkZGVkSXRlbVRvUmVtb3ZlLl9wZG9tUGFyZW50ID0gbm9kZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCBzdWJ0cmVlcyB0byB0aGVpciBwYXJlbnRzICh0aGF0IHdlcmUgcmVtb3ZlZCBmcm9tIG91ciBvcmRlcilcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgcmVtb3ZlZEl0ZW1zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCByZW1vdmVkSXRlbVRvQWRkID0gcmVtb3ZlZEl0ZW1zWyBpIF07XHJcbiAgICAgIGlmICggcmVtb3ZlZEl0ZW1Ub0FkZCApIHtcclxuICAgICAgICBjb25zdCBhZGRlZFBhcmVudHMgPSByZW1vdmVkSXRlbVRvQWRkLl9wYXJlbnRzO1xyXG4gICAgICAgIGZvciAoIGogPSAwOyBqIDwgYWRkZWRQYXJlbnRzLmxlbmd0aDsgaisrICkge1xyXG4gICAgICAgICAgUERPTVRyZWUuYWRkVHJlZSggYWRkZWRQYXJlbnRzWyBqIF0sIHJlbW92ZWRJdGVtVG9BZGQgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBBZGQgc3VidHJlZXMgdG8gdXMgKHRoYXQgd2VyZSBhZGRlZCBpbiB0aGlzIG9yZGVyIGNoYW5nZSlcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgYWRkZWRJdGVtcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgYWRkZWRJdGVtVG9BZGQgPSBhZGRlZEl0ZW1zWyBpIF07XHJcbiAgICAgIGFkZGVkSXRlbVRvQWRkICYmIFBET01UcmVlLmFkZFRyZWUoIG5vZGUsIGFkZGVkSXRlbVRvQWRkLCBwZG9tVHJhaWxzICk7XHJcbiAgICB9XHJcblxyXG4gICAgUERPTVRyZWUucmVvcmRlciggbm9kZSwgcGRvbVRyYWlscyApO1xyXG5cclxuICAgIFBET01UcmVlLmFmdGVyT3AoKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIG5vZGUgaGFzIGFuIHBkb21Db250ZW50IGNoYW5nZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcclxuICAgKi9cclxuICBwZG9tQ29udGVudENoYW5nZSggbm9kZSApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLlBET01UcmVlKCBgcGRvbUNvbnRlbnRDaGFuZ2UgbiMke25vZGUuX2lkfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlIGluc3RhbmNlb2YgTm9kZSApO1xyXG5cclxuICAgIFBET01UcmVlLmJlZm9yZU9wKCk7XHJcblxyXG4gICAgbGV0IGk7XHJcbiAgICBjb25zdCBwYXJlbnRzID0gbm9kZS5fcGRvbVBhcmVudCA/IFsgbm9kZS5fcGRvbVBhcmVudCBdIDogbm9kZS5fcGFyZW50cztcclxuICAgIGNvbnN0IHBkb21UcmFpbHNMaXN0ID0gW107IC8vIHBkb21UcmFpbHNMaXN0WyBpIF0gOj0gUERPTVRyZWUuZmluZFBET01UcmFpbHMoIHBhcmVudHNbIGkgXSApXHJcblxyXG4gICAgLy8gRm9yIG5vdywganVzdCByZWdlbmVyYXRlIHRoZSBmdWxsIHRyZWUuIENvdWxkIG9wdGltaXplIGluIHRoZSBmdXR1cmUsIGlmIHdlIGNhbiBzd2FwIHRoZSBjb250ZW50IGZvciBhblxyXG4gICAgLy8gUERPTUluc3RhbmNlLlxyXG4gICAgZm9yICggaSA9IDA7IGkgPCBwYXJlbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBwYXJlbnQgPSBwYXJlbnRzWyBpIF07XHJcblxyXG4gICAgICBjb25zdCBwZG9tVHJhaWxzID0gUERPTVRyZWUuZmluZFBET01UcmFpbHMoIHBhcmVudCApO1xyXG4gICAgICBwZG9tVHJhaWxzTGlzdC5wdXNoKCBwZG9tVHJhaWxzICk7XHJcblxyXG4gICAgICBQRE9NVHJlZS5yZW1vdmVUcmVlKCBwYXJlbnQsIG5vZGUsIHBkb21UcmFpbHMgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBEbyBhbGwgcmVtb3ZhbHMgYmVmb3JlIGFkZGluZyBhbnl0aGluZyBiYWNrIGluLlxyXG4gICAgZm9yICggaSA9IDA7IGkgPCBwYXJlbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBQRE9NVHJlZS5hZGRUcmVlKCBwYXJlbnRzWyBpIF0sIG5vZGUsIHBkb21UcmFpbHNMaXN0WyBpIF0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBbiBlZGdlIGNhc2UgaXMgd2hlcmUgd2UgY2hhbmdlIHRoZSByb290Tm9kZSBvZiB0aGUgZGlzcGxheSAoYW5kIGRvbid0IGhhdmUgYW4gZWZmZWN0aXZlIHBhcmVudClcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgbm9kZS5fcm9vdGVkRGlzcGxheXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGRpc3BsYXkgPSBub2RlLl9yb290ZWREaXNwbGF5c1sgaSBdO1xyXG4gICAgICBpZiAoIGRpc3BsYXkuX2FjY2Vzc2libGUgKSB7XHJcbiAgICAgICAgUERPTVRyZWUucmVidWlsZEluc3RhbmNlVHJlZSggZGlzcGxheS5fcm9vdFBET01JbnN0YW5jZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgUERPTVRyZWUuYWZ0ZXJPcCgpO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdXAgYSByb290IGluc3RhbmNlIHdpdGggYSBnaXZlbiByb290IG5vZGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQRE9NSW5zdGFuY2V9IHJvb3RJbnN0YW5jZVxyXG4gICAqL1xyXG4gIHJlYnVpbGRJbnN0YW5jZVRyZWUoIHJvb3RJbnN0YW5jZSApIHtcclxuICAgIGNvbnN0IHJvb3ROb2RlID0gcm9vdEluc3RhbmNlLmRpc3BsYXkucm9vdE5vZGU7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByb290Tm9kZSApO1xyXG5cclxuICAgIHJvb3RJbnN0YW5jZS5yZW1vdmVBbGxDaGlsZHJlbigpO1xyXG5cclxuICAgIHJvb3RJbnN0YW5jZS5hZGRDb25zZWN1dGl2ZUluc3RhbmNlcyggUERPTVRyZWUuY3JlYXRlVHJlZSggbmV3IFRyYWlsKCByb290Tm9kZSApLCByb290SW5zdGFuY2UuZGlzcGxheSwgcm9vdEluc3RhbmNlICkgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBIYW5kbGVzIHRoZSBjb25jZXB0dWFsIGFkZGl0aW9uIG9mIGFuIHBkb20gc3VidHJlZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOb2RlfSBwYXJlbnRcclxuICAgKiBAcGFyYW0ge05vZGV9IGNoaWxkXHJcbiAgICogQHBhcmFtIHtBcnJheS48UGFydGlhbFBET01UcmFpbD59IFtwZG9tVHJhaWxzXSAtIFdpbGwgYmUgY29tcHV0ZWQgaWYgbmVlZGVkXHJcbiAgICovXHJcbiAgYWRkVHJlZSggcGFyZW50LCBjaGlsZCwgcGRvbVRyYWlscyApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLlBET01UcmVlKCBgYWRkVHJlZSBwYXJlbnQ6biMke3BhcmVudC5faWR9LCBjaGlsZDpuIyR7Y2hpbGQuX2lkfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgUERPTVRyZWUuYXVkaXROb2RlRm9yUERPTUN5Y2xlcyggcGFyZW50ICk7XHJcblxyXG4gICAgcGRvbVRyYWlscyA9IHBkb21UcmFpbHMgfHwgUERPTVRyZWUuZmluZFBET01UcmFpbHMoIHBhcmVudCApO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBkb21UcmFpbHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLlBET01UcmVlKCBgdHJhaWw6ICR7cGRvbVRyYWlsc1sgaSBdLnRyYWlsLnRvU3RyaW5nKCl9IGZ1bGw6JHtwZG9tVHJhaWxzWyBpIF0uZnVsbFRyYWlsLnRvU3RyaW5nKCl9IGZvciAke3Bkb21UcmFpbHNbIGkgXS5wZG9tSW5zdGFuY2UudG9TdHJpbmcoKX0gcm9vdDoke3Bkb21UcmFpbHNbIGkgXS5pc1Jvb3R9YCApO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgICBjb25zdCBwYXJ0aWFsVHJhaWwgPSBwZG9tVHJhaWxzWyBpIF07XHJcbiAgICAgIGNvbnN0IHBhcmVudEluc3RhbmNlID0gcGFydGlhbFRyYWlsLnBkb21JbnN0YW5jZTtcclxuXHJcbiAgICAgIC8vIFRoZSBmdWxsIHRyYWlsIGRvZXNuJ3QgaGF2ZSB0aGUgY2hpbGQgaW4gaXQsIHNvIHdlIHRlbXBvcmFyaWx5IGFkZCB0aGF0IGZvciB0cmVlIGNyZWF0aW9uXHJcbiAgICAgIHBhcnRpYWxUcmFpbC5mdWxsVHJhaWwuYWRkRGVzY2VuZGFudCggY2hpbGQgKTtcclxuICAgICAgY29uc3QgY2hpbGRJbnN0YW5jZXMgPSBQRE9NVHJlZS5jcmVhdGVUcmVlKCBwYXJ0aWFsVHJhaWwuZnVsbFRyYWlsLCBwYXJlbnRJbnN0YW5jZS5kaXNwbGF5LCBwYXJlbnRJbnN0YW5jZSApO1xyXG4gICAgICBwYXJ0aWFsVHJhaWwuZnVsbFRyYWlsLnJlbW92ZURlc2NlbmRhbnQoIGNoaWxkICk7XHJcblxyXG4gICAgICBwYXJlbnRJbnN0YW5jZS5hZGRDb25zZWN1dGl2ZUluc3RhbmNlcyggY2hpbGRJbnN0YW5jZXMgKTtcclxuXHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEhhbmRsZXMgdGhlIGNvbmNlcHR1YWwgcmVtb3ZhbCBvZiBhbiBwZG9tIHN1YnRyZWUuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Tm9kZX0gcGFyZW50XHJcbiAgICogQHBhcmFtIHtOb2RlfSBjaGlsZFxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFBhcnRpYWxQRE9NVHJhaWw+fSBbcGRvbVRyYWlsc10gLSBXaWxsIGJlIGNvbXB1dGVkIGlmIG5lZWRlZFxyXG4gICAqL1xyXG4gIHJlbW92ZVRyZWUoIHBhcmVudCwgY2hpbGQsIHBkb21UcmFpbHMgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSggYHJlbW92ZVRyZWUgcGFyZW50Om4jJHtwYXJlbnQuX2lkfSwgY2hpbGQ6biMke2NoaWxkLl9pZH1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgcGRvbVRyYWlscyA9IHBkb21UcmFpbHMgfHwgUERPTVRyZWUuZmluZFBET01UcmFpbHMoIHBhcmVudCApO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBkb21UcmFpbHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHBhcnRpYWxUcmFpbCA9IHBkb21UcmFpbHNbIGkgXTtcclxuXHJcbiAgICAgIC8vIFRoZSBmdWxsIHRyYWlsIGRvZXNuJ3QgaGF2ZSB0aGUgY2hpbGQgaW4gaXQsIHNvIHdlIHRlbXBvcmFyaWx5IGFkZCB0aGF0IGZvciB0cmVlIHJlbW92YWxcclxuICAgICAgcGFydGlhbFRyYWlsLmZ1bGxUcmFpbC5hZGREZXNjZW5kYW50KCBjaGlsZCApO1xyXG4gICAgICBwYXJ0aWFsVHJhaWwucGRvbUluc3RhbmNlLnJlbW92ZUluc3RhbmNlc0ZvclRyYWlsKCBwYXJ0aWFsVHJhaWwuZnVsbFRyYWlsICk7XHJcbiAgICAgIHBhcnRpYWxUcmFpbC5mdWxsVHJhaWwucmVtb3ZlRGVzY2VuZGFudCggY2hpbGQgKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBIYW5kbGVzIHRoZSBjb25jZXB0dWFsIHNvcnRpbmcgb2YgYW4gcGRvbSBzdWJ0cmVlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcclxuICAgKiBAcGFyYW0ge0FycmF5LjxQYXJ0aWFsUERPTVRyYWlsPn0gW3Bkb21UcmFpbHNdIC0gV2lsbCBiZSBjb21wdXRlZCBpZiBuZWVkZWRcclxuICAgKi9cclxuICByZW9yZGVyKCBub2RlLCBwZG9tVHJhaWxzICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cuUERPTVRyZWUoIGByZW9yZGVyIG4jJHtub2RlLl9pZH1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgcGRvbVRyYWlscyA9IHBkb21UcmFpbHMgfHwgUERPTVRyZWUuZmluZFBET01UcmFpbHMoIG5vZGUgKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwZG9tVHJhaWxzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBwYXJ0aWFsVHJhaWwgPSBwZG9tVHJhaWxzWyBpIF07XHJcblxyXG4gICAgICAvLyBUT0RPOiBkb2VzIGl0IG9wdGltaXplIHRoaW5ncyB0byBwYXNzIHRoZSBwYXJ0aWFsIHRyYWlsIGluIChzbyB3ZSBzY2FuIGxlc3MpP1xyXG4gICAgICBwYXJ0aWFsVHJhaWwucGRvbUluc3RhbmNlLnNvcnRDaGlsZHJlbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgUERPTSBpbnN0YW5jZXMsIHJldHVybmluZyBhbiBhcnJheSBvZiBpbnN0YW5jZXMgdGhhdCBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIG5leHQgbGV2ZWwuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIE5PVEU6IFRyYWlscyBmb3Igd2hpY2ggYW4gYWxyZWFkeS1leGlzdGluZyBpbnN0YW5jZSBleGlzdHMgd2lsbCBOT1QgY3JlYXRlIGEgbmV3IGluc3RhbmNlIGhlcmUuIFdlIG9ubHkgd2FudCB0b1xyXG4gICAqIGZpbGwgaW4gdGhlIFwibWlzc2luZ1wiIHN0cnVjdHVyZS4gVGhlcmUgYXJlIGNhc2VzIChhLmNoaWxkcmVuPVtiLGNdLCBiLmNoaWxkcmVuPVtjXSkgd2hlcmUgcmVtb3ZpbmcgYW5cclxuICAgKiBwZG9tT3JkZXIgY2FuIHRyaWdnZXIgYWRkVHJlZShhLGIpIEFORCBhZGRUcmVlKGIsYyksIGFuZCB3ZSBjYW4ndCBjcmVhdGUgZHVwbGljYXRlIGNvbnRlbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1RyYWlsfSB0cmFpbFxyXG4gICAqIEBwYXJhbSB7RGlzcGxheX0gZGlzcGxheVxyXG4gICAqIEBwYXJhbSB7UERPTUluc3RhbmNlfSBwYXJlbnRJbnN0YW5jZSAtIFNpbmNlIHdlIGRvbid0IGNyZWF0ZSB0aGUgcm9vdCBoZXJlLCBjYW4ndCBiZSBudWxsXHJcbiAgICogQHJldHVybnMge0FycmF5LjxQRE9NSW5zdGFuY2U+fVxyXG4gICAqL1xyXG4gIGNyZWF0ZVRyZWUoIHRyYWlsLCBkaXNwbGF5LCBwYXJlbnRJbnN0YW5jZSApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLlBET01UcmVlKCBgY3JlYXRlVHJlZSAke3RyYWlsLnRvU3RyaW5nKCl9IHBhcmVudDoke3BhcmVudEluc3RhbmNlID8gcGFyZW50SW5zdGFuY2UudG9TdHJpbmcoKSA6ICdudWxsJ31gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgY29uc3Qgbm9kZSA9IHRyYWlsLmxhc3ROb2RlKCk7XHJcbiAgICBjb25zdCBlZmZlY3RpdmVDaGlsZHJlbiA9IG5vZGUuZ2V0RWZmZWN0aXZlQ2hpbGRyZW4oKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSggYGVmZmVjdGl2ZUNoaWxkcmVuOiAke1BET01UcmVlLmRlYnVnT3JkZXIoIGVmZmVjdGl2ZUNoaWxkcmVuICl9YCApO1xyXG5cclxuICAgIC8vIElmIHdlIGhhdmUgcGRvbSBjb250ZW50IG91cnNlbGYsIHdlIG5lZWQgdG8gY3JlYXRlIHRoZSBpbnN0YW5jZSAoc28gd2UgY2FuIHByb3ZpZGUgaXQgdG8gY2hpbGQgaW5zdGFuY2VzKS5cclxuICAgIGxldCBpbnN0YW5jZTtcclxuICAgIGxldCBleGlzdGVkID0gZmFsc2U7XHJcbiAgICBpZiAoIG5vZGUuaGFzUERPTUNvbnRlbnQgKSB7XHJcbiAgICAgIGluc3RhbmNlID0gcGFyZW50SW5zdGFuY2UuZmluZENoaWxkV2l0aFRyYWlsKCB0cmFpbCApO1xyXG4gICAgICBpZiAoIGluc3RhbmNlICkge1xyXG4gICAgICAgIGV4aXN0ZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGluc3RhbmNlID0gUERPTUluc3RhbmNlLnBvb2wuY3JlYXRlKCBwYXJlbnRJbnN0YW5jZSwgZGlzcGxheSwgdHJhaWwuY29weSgpICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIHRoZXJlIHdhcyBhbiBpbnN0YW5jZSwgdGhlbiBpdCBzaG91bGQgYmUgdGhlIHBhcmVudCB0byBlZmZlY3RpdmUgY2hpbGRyZW4sIG90aGVyd2lzZSwgaXQgaXNuJ3QgcGFydCBvZiB0aGVcclxuICAgICAgLy8gdHJhaWwuXHJcbiAgICAgIHBhcmVudEluc3RhbmNlID0gaW5zdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIGFsbCBvZiB0aGUgZGlyZWN0LWNoaWxkIGluc3RhbmNlcy5cclxuICAgIGNvbnN0IGNoaWxkSW5zdGFuY2VzID0gW107XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBlZmZlY3RpdmVDaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdHJhaWwuYWRkRGVzY2VuZGFudCggZWZmZWN0aXZlQ2hpbGRyZW5bIGkgXSwgaSApO1xyXG4gICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSggY2hpbGRJbnN0YW5jZXMsIFBET01UcmVlLmNyZWF0ZVRyZWUoIHRyYWlsLCBkaXNwbGF5LCBwYXJlbnRJbnN0YW5jZSApICk7XHJcbiAgICAgIHRyYWlsLnJlbW92ZURlc2NlbmRhbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB3ZSBoYXZlIGFuIGluc3RhbmNlLCBob29rIHRoaW5ncyB1cCwgYW5kIHJldHVybiBqdXN0IGl0LlxyXG4gICAgaWYgKCBpbnN0YW5jZSApIHtcclxuICAgICAgaW5zdGFuY2UuYWRkQ29uc2VjdXRpdmVJbnN0YW5jZXMoIGNoaWxkSW5zdGFuY2VzICk7XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgICAgcmV0dXJuIGV4aXN0ZWQgPyBbXSA6IFsgaW5zdGFuY2UgXTtcclxuICAgIH1cclxuICAgIC8vIE90aGVyd2lzZSBwYXNzIHRoaW5ncyBmb3J3YXJkIHNvIHRoZXkgY2FuIGJlIGFkZGVkIGFzIGNoaWxkcmVuIGJ5IHRoZSBwYXJlbnRJbnN0YW5jZVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgICByZXR1cm4gY2hpbGRJbnN0YW5jZXM7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUHJlcGFyZXMgZm9yIGEgcGRvbS10cmVlLWNoYW5naW5nIG9wZXJhdGlvbiAoc2F2aW5nIHNvbWUgc3RhdGUpLiBEdXJpbmcgRE9NIG9wZXJhdGlvbnMgd2UgZG9uJ3Qgd2FudCBEaXNwbGF5XHJcbiAgICogaW5wdXQgdG8gZGlzcGF0Y2ggZXZlbnRzIGFzIGZvY3VzIGNoYW5nZXMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBiZWZvcmVPcCgpIHtcclxuICAgIGFjdGl2ZUVsZW1lbnRJZCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuaWQ7XHJcbiAgICBCcm93c2VyRXZlbnRzLmJsb2NrRm9jdXNDYWxsYmFja3MgPSB0cnVlO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmFsaXplcyBhIHBkb20tdHJlZS1jaGFuZ2luZyBvcGVyYXRpb24gKHJlc3RvcmluZyBzb21lIHN0YXRlKS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGFmdGVyT3AoKSB7XHJcbiAgICBjb25zdCBhY3RpdmVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIGFjdGl2ZUVsZW1lbnRJZCApO1xyXG4gICAgYWN0aXZlRWxlbWVudCAmJiBhY3RpdmVFbGVtZW50LmZvY3VzKCk7XHJcbiAgICBCcm93c2VyRXZlbnRzLmJsb2NrRm9jdXNDYWxsYmFja3MgPSBmYWxzZTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFsbCBcInBkb21cIiB0cmFpbHMgZnJvbSB0aGlzIG5vZGUgYW5jZXN0b3Itd2lzZSB0byBub2RlcyB0aGF0IGhhdmUgZGlzcGxheSByb290cy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogTk9URTogXCJwZG9tXCIgdHJhaWxzIG1heSBub3QgaGF2ZSBzdHJpY3QgcGFyZW50LWNoaWxkIHJlbGF0aW9uc2hpcHMgYmV0d2VlbiBhZGphY2VudCBub2RlcywgYXMgcmVtYXBwaW5nIG9mXHJcbiAgICogdGhlIHRyZWUgY2FuIGhhdmUgYSBcIlBET00gcGFyZW50XCIgYW5kIFwicGRvbSBjaGlsZFwiIGNhc2UgKHRoZSBjaGlsZCBpcyBpbiB0aGUgcGFyZW50J3MgcGRvbU9yZGVyKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48UGFydGlhbFBET01UcmFpbD59XHJcbiAgICovXHJcbiAgZmluZFBET01UcmFpbHMoIG5vZGUgKSB7XHJcbiAgICBjb25zdCB0cmFpbHMgPSBbXTtcclxuICAgIFBET01UcmVlLnJlY3Vyc2l2ZVBET01UcmFpbFNlYXJjaCggdHJhaWxzLCBuZXcgVHJhaWwoIG5vZGUgKSApO1xyXG4gICAgcmV0dXJuIHRyYWlscztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBGaW5kcyBhbGwgcGFydGlhbCBcInBkb21cIiB0cmFpbHNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48UGFydGlhbFBET01UcmFpbD59IHRyYWlsUmVzdWx0cyAtIE11dGF0ZWQsIHRoaXMgaXMgaG93IHdlIFwicmV0dXJuXCIgb3VyIHZhbHVlLlxyXG4gICAqIEBwYXJhbSB7VHJhaWx9IHRyYWlsIC0gV2hlcmUgdG8gc3RhcnQgZnJvbVxyXG4gICAqL1xyXG4gIHJlY3Vyc2l2ZVBET01UcmFpbFNlYXJjaCggdHJhaWxSZXN1bHRzLCB0cmFpbCApIHtcclxuICAgIGNvbnN0IHJvb3QgPSB0cmFpbC5yb290Tm9kZSgpO1xyXG4gICAgbGV0IGk7XHJcblxyXG4gICAgLy8gSWYgd2UgZmluZCBwZG9tIGNvbnRlbnQsIG91ciBzZWFyY2ggZW5kcyBoZXJlLiBJRiBpdCBpcyBjb25uZWN0ZWQgdG8gYW55IGFjY2Vzc2libGUgcGRvbSBkaXNwbGF5cyBzb21laG93LCBpdFxyXG4gICAgLy8gd2lsbCBoYXZlIHBkb20gaW5zdGFuY2VzLiBXZSBvbmx5IGNhcmUgYWJvdXQgdGhlc2UgcGRvbSBpbnN0YW5jZXMsIGFzIHRoZXkgYWxyZWFkeSBoYXZlIGFueSBEQUdcclxuICAgIC8vIGRlZHVwbGljYXRpb24gYXBwbGllZC5cclxuICAgIGlmICggcm9vdC5oYXNQRE9NQ29udGVudCApIHtcclxuICAgICAgY29uc3QgaW5zdGFuY2VzID0gcm9vdC5wZG9tSW5zdGFuY2VzO1xyXG5cclxuICAgICAgZm9yICggaSA9IDA7IGkgPCBpbnN0YW5jZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgdHJhaWxSZXN1bHRzLnB1c2goIG5ldyBQYXJ0aWFsUERPTVRyYWlsKCBpbnN0YW5jZXNbIGkgXSwgdHJhaWwuY29weSgpLCBmYWxzZSApICk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgLy8gT3RoZXJ3aXNlIGNoZWNrIGZvciBhY2Nlc3NpYmxlIHBkb20gZGlzcGxheXMgZm9yIHdoaWNoIG91ciBub2RlIGlzIHRoZSByb290Tm9kZS5cclxuICAgIGVsc2Uge1xyXG4gICAgICBjb25zdCByb290ZWREaXNwbGF5cyA9IHJvb3Qucm9vdGVkRGlzcGxheXM7XHJcbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgcm9vdGVkRGlzcGxheXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgZGlzcGxheSA9IHJvb3RlZERpc3BsYXlzWyBpIF07XHJcblxyXG4gICAgICAgIGlmICggZGlzcGxheS5fYWNjZXNzaWJsZSApIHtcclxuICAgICAgICAgIHRyYWlsUmVzdWx0cy5wdXNoKCBuZXcgUGFydGlhbFBET01UcmFpbCggZGlzcGxheS5fcm9vdFBET01JbnN0YW5jZSwgdHJhaWwuY29weSgpLCB0cnVlICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwYXJlbnRzID0gcm9vdC5fcGRvbVBhcmVudCA/IFsgcm9vdC5fcGRvbVBhcmVudCBdIDogcm9vdC5fcGFyZW50cztcclxuICAgIGNvbnN0IHBhcmVudENvdW50ID0gcGFyZW50cy5sZW5ndGg7XHJcbiAgICBmb3IgKCBpID0gMDsgaSA8IHBhcmVudENvdW50OyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHBhcmVudCA9IHBhcmVudHNbIGkgXTtcclxuXHJcbiAgICAgIHRyYWlsLmFkZEFuY2VzdG9yKCBwYXJlbnQgKTtcclxuICAgICAgUERPTVRyZWUucmVjdXJzaXZlUERPTVRyYWlsU2VhcmNoKCB0cmFpbFJlc3VsdHMsIHRyYWlsICk7XHJcbiAgICAgIHRyYWlsLnJlbW92ZUFuY2VzdG9yKCk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogRW5zdXJlcyB0aGF0IHRoZSBwZG9tRGlzcGxheXMgb24gdGhlIG5vZGUgKGFuZCBpdHMgc3VidHJlZSkgYXJlIGFjY3VyYXRlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhdWRpdFBET01EaXNwbGF5cyggbm9kZSApIHtcclxuICAgIGlmICggYXNzZXJ0U2xvdyApIHtcclxuICAgICAgaWYgKCBub2RlLl9wZG9tRGlzcGxheXNJbmZvLmNhbkhhdmVQRE9NRGlzcGxheXMoKSApIHtcclxuXHJcbiAgICAgICAgbGV0IGk7XHJcbiAgICAgICAgY29uc3QgZGlzcGxheXMgPSBbXTtcclxuXHJcbiAgICAgICAgLy8gQ29uY2F0ZW5hdGlvbiBvZiBvdXIgcGFyZW50cycgcGRvbURpc3BsYXlzXHJcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBub2RlLl9wYXJlbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoIGRpc3BsYXlzLCBub2RlLl9wYXJlbnRzWyBpIF0uX3Bkb21EaXNwbGF5c0luZm8ucGRvbURpc3BsYXlzICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBbmQgY29uY2F0ZW5hdGlvbiBvZiBhbnkgcm9vdGVkIGRpc3BsYXlzICh0aGF0IHN1cHBvcnQgcGRvbSlcclxuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG5vZGUuX3Jvb3RlZERpc3BsYXlzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgY29uc3QgZGlzcGxheSA9IG5vZGUuX3Jvb3RlZERpc3BsYXlzWyBpIF07XHJcbiAgICAgICAgICBpZiAoIGRpc3BsYXkuX2FjY2Vzc2libGUgKSB7XHJcbiAgICAgICAgICAgIGRpc3BsYXlzLnB1c2goIGRpc3BsYXkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGFjdHVhbEFycmF5ID0gbm9kZS5fcGRvbURpc3BsYXlzSW5mby5wZG9tRGlzcGxheXMuc2xpY2UoKTtcclxuICAgICAgICBjb25zdCBleHBlY3RlZEFycmF5ID0gZGlzcGxheXMuc2xpY2UoKTsgLy8gc2xpY2UgaGVscHMgaW4gZGVidWdnaW5nXHJcbiAgICAgICAgYXNzZXJ0U2xvdyggYWN0dWFsQXJyYXkubGVuZ3RoID09PSBleHBlY3RlZEFycmF5Lmxlbmd0aCApO1xyXG5cclxuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGV4cGVjdGVkQXJyYXkubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBhY3R1YWxBcnJheS5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICAgICAgaWYgKCBleHBlY3RlZEFycmF5WyBpIF0gPT09IGFjdHVhbEFycmF5WyBqIF0gKSB7XHJcbiAgICAgICAgICAgICAgZXhwZWN0ZWRBcnJheS5zcGxpY2UoIGksIDEgKTtcclxuICAgICAgICAgICAgICBhY3R1YWxBcnJheS5zcGxpY2UoIGosIDEgKTtcclxuICAgICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzc2VydFNsb3coIGFjdHVhbEFycmF5Lmxlbmd0aCA9PT0gMCAmJiBleHBlY3RlZEFycmF5Lmxlbmd0aCA9PT0gMCwgJ01pc21hdGNoIHdpdGggYWNjZXNzaWJsZSBwZG9tIGRpc3BsYXlzJyApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGFzc2VydFNsb3coIG5vZGUuX3Bkb21EaXNwbGF5c0luZm8ucGRvbURpc3BsYXlzLmxlbmd0aCA9PT0gMCwgJ0ludmlzaWJsZS9ub25hY2Nlc3NpYmxlIHRoaW5ncyBzaG91bGQgaGF2ZSBubyBkaXNwbGF5cycgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrcyBhIGdpdmVuIE5vZGUgKHdpdGggYXNzZXJ0aW9ucykgdG8gZW5zdXJlIGl0IGlzIG5vdCBwYXJ0IG9mIGEgY3ljbGUgaW4gdGhlIGNvbWJpbmVkIGdyYXBoIHdpdGggZWRnZXNcclxuICAgKiBkZWZpbmVkIGJ5IFwidGhlcmUgaXMgYSBwYXJlbnQtY2hpbGQgb3IgcGRvbVBhcmVudC1wZG9tT3JkZXJcIiByZWxhdGlvbnNoaXAgYmV0d2VlbiB0aGUgdHdvIG5vZGVzLlxyXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzc4NyBmb3IgbW9yZSBpbmZvcm1hdGlvbiAoYW5kIGZvciBzb21lIGRldGFpbCBvbiB0aGUgY2FzZXNcclxuICAgKiB0aGF0IHdlIHdhbnQgdG8gY2F0Y2gpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlXHJcbiAgICovXHJcbiAgYXVkaXROb2RlRm9yUERPTUN5Y2xlcyggbm9kZSApIHtcclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICBjb25zdCB0cmFpbCA9IG5ldyBUcmFpbCggbm9kZSApO1xyXG5cclxuICAgICAgKCBmdW5jdGlvbiByZWN1cnNpdmVTZWFyY2goKSB7XHJcbiAgICAgICAgY29uc3Qgcm9vdCA9IHRyYWlsLnJvb3ROb2RlKCk7XHJcblxyXG4gICAgICAgIGFzc2VydCggdHJhaWwubGVuZ3RoIDw9IDEgfHwgcm9vdCAhPT0gbm9kZSxcclxuICAgICAgICAgIGAkeydBY2Nlc3NpYmxlIFBET00gZ3JhcGggY3ljbGUgZGV0ZWN0ZWQuIFRoZSBjb21iaW5lZCBzY2VuZS1ncmFwaCBEQUcgd2l0aCBwZG9tT3JkZXIgZGVmaW5pbmcgYWRkaXRpb25hbCAnICtcclxuICAgICAgICAgICAgICdwYXJlbnQtY2hpbGQgcmVsYXRpb25zaGlwcyBzaG91bGQgc3RpbGwgYmUgYSBEQUcuIEN5Y2xlIGRldGVjdGVkIHdpdGggdGhlIHRyYWlsOiAnfSR7dHJhaWwudG9TdHJpbmcoKVxyXG4gICAgICAgICAgfSBwYXRoOiAke3RyYWlsLnRvUGF0aFN0cmluZygpfWAgKTtcclxuXHJcbiAgICAgICAgY29uc3QgcGFyZW50Q291bnQgPSByb290Ll9wYXJlbnRzLmxlbmd0aDtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwYXJlbnRDb3VudDsgaSsrICkge1xyXG4gICAgICAgICAgY29uc3QgcGFyZW50ID0gcm9vdC5fcGFyZW50c1sgaSBdO1xyXG5cclxuICAgICAgICAgIHRyYWlsLmFkZEFuY2VzdG9yKCBwYXJlbnQgKTtcclxuICAgICAgICAgIHJlY3Vyc2l2ZVNlYXJjaCgpO1xyXG4gICAgICAgICAgdHJhaWwucmVtb3ZlQW5jZXN0b3IoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gT25seSB2aXNpdCB0aGUgcGRvbVBhcmVudCBpZiB3ZSBkaWRuJ3QgYWxyZWFkeSB2aXNpdCBpdCBhcyBhIHBhcmVudC5cclxuICAgICAgICBpZiAoIHJvb3QuX3Bkb21QYXJlbnQgJiYgIXJvb3QuX3Bkb21QYXJlbnQuaGFzQ2hpbGQoIHJvb3QgKSApIHtcclxuICAgICAgICAgIHRyYWlsLmFkZEFuY2VzdG9yKCByb290Ll9wZG9tUGFyZW50ICk7XHJcbiAgICAgICAgICByZWN1cnNpdmVTZWFyY2goKTtcclxuICAgICAgICAgIHRyYWlsLnJlbW92ZUFuY2VzdG9yKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICkoKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGFuIG9yZGVyICh1c2luZyBOb2RlIGlkcykgZm9yIGRlYnVnZ2luZy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48Tm9kZXxudWxsPnxudWxsfSBwZG9tT3JkZXJcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGRlYnVnT3JkZXIoIHBkb21PcmRlciApIHtcclxuICAgIGlmICggcGRvbU9yZGVyID09PSBudWxsICkgeyByZXR1cm4gJ251bGwnOyB9XHJcblxyXG4gICAgcmV0dXJuIGBbJHtwZG9tT3JkZXIubWFwKCBub2RlT3JOdWxsID0+IG5vZGVPck51bGwgPT09IG51bGwgPyAnbnVsbCcgOiBub2RlT3JOdWxsLl9pZCApLmpvaW4oICcsJyApfV1gO1xyXG4gIH1cclxufTtcclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdQRE9NVHJlZScsIFBET01UcmVlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQRE9NVHJlZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLDZDQUE2QztBQUN6RSxTQUFTQyxhQUFhLEVBQUVDLElBQUksRUFBRUMsZ0JBQWdCLEVBQUVDLFlBQVksRUFBRUMsT0FBTyxFQUFFQyxLQUFLLFFBQVEsa0JBQWtCOztBQUV0RztBQUNBLElBQUlDLGVBQWUsR0FBRyxJQUFJO0FBRTFCLE1BQU1DLFFBQVEsR0FBRztFQUNmO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFFBQVFBLENBQUVDLE1BQU0sRUFBRUMsS0FBSyxFQUFHO0lBQ3hCQyxVQUFVLElBQUlBLFVBQVUsQ0FBQ0osUUFBUSxJQUFJSSxVQUFVLENBQUNKLFFBQVEsQ0FBRyxxQkFBb0JFLE1BQU0sQ0FBQ0csR0FBSSxhQUFZRixLQUFLLENBQUNFLEdBQUksRUFBRSxDQUFDO0lBQ25IRCxVQUFVLElBQUlBLFVBQVUsQ0FBQ0osUUFBUSxJQUFJSSxVQUFVLENBQUNFLElBQUksQ0FBQyxDQUFDO0lBRXREQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUwsTUFBTSxZQUFZUixJQUFLLENBQUM7SUFDMUNhLE1BQU0sSUFBSUEsTUFBTSxDQUFFSixLQUFLLFlBQVlULElBQUssQ0FBQztJQUN6Q2EsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQ0osS0FBSyxDQUFDSyxnQkFBZ0IsQ0FBQ0MsU0FBUyxDQUFDLENBQUUsQ0FBQztJQUV2RFQsUUFBUSxDQUFDVSxRQUFRLENBQUMsQ0FBQztJQUVuQixJQUFLLENBQUNQLEtBQUssQ0FBQ1EsV0FBVyxFQUFHO01BQ3hCWCxRQUFRLENBQUNZLE9BQU8sQ0FBRVYsTUFBTSxFQUFFQyxLQUFNLENBQUM7SUFDbkM7SUFFQUgsUUFBUSxDQUFDYSxPQUFPLENBQUMsQ0FBQztJQUVsQlQsVUFBVSxJQUFJQSxVQUFVLENBQUNKLFFBQVEsSUFBSUksVUFBVSxDQUFDVSxHQUFHLENBQUMsQ0FBQztFQUN2RCxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRWIsTUFBTSxFQUFFQyxLQUFLLEVBQUc7SUFDM0JDLFVBQVUsSUFBSUEsVUFBVSxDQUFDSixRQUFRLElBQUlJLFVBQVUsQ0FBQ0osUUFBUSxDQUFHLHdCQUF1QkUsTUFBTSxDQUFDRyxHQUFJLGFBQVlGLEtBQUssQ0FBQ0UsR0FBSSxFQUFFLENBQUM7SUFDdEhELFVBQVUsSUFBSUEsVUFBVSxDQUFDSixRQUFRLElBQUlJLFVBQVUsQ0FBQ0UsSUFBSSxDQUFDLENBQUM7SUFFdERDLE1BQU0sSUFBSUEsTUFBTSxDQUFFTCxNQUFNLFlBQVlSLElBQUssQ0FBQztJQUMxQ2EsTUFBTSxJQUFJQSxNQUFNLENBQUVKLEtBQUssWUFBWVQsSUFBSyxDQUFDO0lBQ3pDYSxNQUFNLElBQUlBLE1BQU0sQ0FBRSxDQUFDSixLQUFLLENBQUNLLGdCQUFnQixDQUFDQyxTQUFTLENBQUMsQ0FBRSxDQUFDO0lBRXZEVCxRQUFRLENBQUNVLFFBQVEsQ0FBQyxDQUFDO0lBRW5CLElBQUssQ0FBQ1AsS0FBSyxDQUFDUSxXQUFXLEVBQUc7TUFDeEJYLFFBQVEsQ0FBQ2dCLFVBQVUsQ0FBRWQsTUFBTSxFQUFFQyxLQUFNLENBQUM7SUFDdEM7SUFFQUgsUUFBUSxDQUFDYSxPQUFPLENBQUMsQ0FBQztJQUVsQlQsVUFBVSxJQUFJQSxVQUFVLENBQUNKLFFBQVEsSUFBSUksVUFBVSxDQUFDVSxHQUFHLENBQUMsQ0FBQztFQUN2RCxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VHLG1CQUFtQkEsQ0FBRUMsSUFBSSxFQUFHO0lBQzFCZCxVQUFVLElBQUlBLFVBQVUsQ0FBQ0osUUFBUSxJQUFJSSxVQUFVLENBQUNKLFFBQVEsQ0FBRyw4QkFBNkJrQixJQUFJLENBQUNiLEdBQUksRUFBRSxDQUFDO0lBQ3BHRCxVQUFVLElBQUlBLFVBQVUsQ0FBQ0osUUFBUSxJQUFJSSxVQUFVLENBQUNFLElBQUksQ0FBQyxDQUFDO0lBRXREQyxNQUFNLElBQUlBLE1BQU0sQ0FBRVcsSUFBSSxZQUFZeEIsSUFBSyxDQUFDO0lBQ3hDYSxNQUFNLElBQUlBLE1BQU0sQ0FBRSxDQUFDVyxJQUFJLENBQUNWLGdCQUFnQixDQUFDQyxTQUFTLENBQUMsQ0FBRSxDQUFDO0lBRXREVCxRQUFRLENBQUNVLFFBQVEsQ0FBQyxDQUFDO0lBRW5CVixRQUFRLENBQUNtQixPQUFPLENBQUVELElBQUssQ0FBQztJQUV4QmxCLFFBQVEsQ0FBQ2EsT0FBTyxDQUFDLENBQUM7SUFFbEJULFVBQVUsSUFBSUEsVUFBVSxDQUFDSixRQUFRLElBQUlJLFVBQVUsQ0FBQ1UsR0FBRyxDQUFDLENBQUM7RUFDdkQsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU0sZUFBZUEsQ0FBRUYsSUFBSSxFQUFFRyxRQUFRLEVBQUVDLFFBQVEsRUFBRztJQUMxQ2xCLFVBQVUsSUFBSUEsVUFBVSxDQUFDSixRQUFRLElBQUlJLFVBQVUsQ0FBQ0osUUFBUSxDQUFHLHFCQUFvQmtCLElBQUksQ0FBQ2IsR0FBSSxLQUFJTCxRQUFRLENBQUN1QixVQUFVLENBQUVGLFFBQVMsQ0FBRSxJQUFHckIsUUFBUSxDQUFDdUIsVUFBVSxDQUFFRCxRQUFTLENBQUUsRUFBRSxDQUFDO0lBQ2xLbEIsVUFBVSxJQUFJQSxVQUFVLENBQUNKLFFBQVEsSUFBSUksVUFBVSxDQUFDRSxJQUFJLENBQUMsQ0FBQztJQUV0REMsTUFBTSxJQUFJQSxNQUFNLENBQUVXLElBQUksWUFBWXhCLElBQUssQ0FBQztJQUV4Q00sUUFBUSxDQUFDVSxRQUFRLENBQUMsQ0FBQztJQUVuQixNQUFNYyxZQUFZLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDekIsTUFBTUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxDQUFDOztJQUV2QmpDLGVBQWUsQ0FBRTZCLFFBQVEsSUFBSSxFQUFFLEVBQUVDLFFBQVEsSUFBSSxFQUFFLEVBQUVFLFlBQVksRUFBRUMsVUFBVyxDQUFDO0lBRTNFckIsVUFBVSxJQUFJQSxVQUFVLENBQUNKLFFBQVEsSUFBSUksVUFBVSxDQUFDSixRQUFRLENBQUcsWUFBV0EsUUFBUSxDQUFDdUIsVUFBVSxDQUFFQyxZQUFhLENBQUUsRUFBRSxDQUFDO0lBQzdHcEIsVUFBVSxJQUFJQSxVQUFVLENBQUNKLFFBQVEsSUFBSUksVUFBVSxDQUFDSixRQUFRLENBQUcsVUFBU0EsUUFBUSxDQUFDdUIsVUFBVSxDQUFFRSxVQUFXLENBQUUsRUFBRSxDQUFDO0lBRXpHLElBQUlDLENBQUM7SUFDTCxJQUFJQyxDQUFDOztJQUVMO0lBQ0EsSUFBS3BCLE1BQU0sRUFBRztNQUNaLEtBQU1tQixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdGLFlBQVksRUFBRUUsQ0FBQyxFQUFFLEVBQUc7UUFDbkNuQixNQUFNLENBQUVpQixZQUFZLENBQUVFLENBQUMsQ0FBRSxLQUFLLElBQUksSUFBSUYsWUFBWSxDQUFFRSxDQUFDLENBQUUsQ0FBQ2YsV0FBVyxLQUFLTyxJQUFJLEVBQzFFLG1DQUFvQyxDQUFDO01BQ3pDO01BQ0EsS0FBTVEsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRCxVQUFVLEVBQUVDLENBQUMsRUFBRSxFQUFHO1FBQ2pDbkIsTUFBTSxDQUFFa0IsVUFBVSxDQUFFQyxDQUFDLENBQUUsS0FBSyxJQUFJLElBQUlELFVBQVUsQ0FBRUMsQ0FBQyxDQUFFLENBQUNmLFdBQVcsS0FBSyxJQUFJLEVBQ3RFLDJDQUE0QyxDQUFDO01BQ2pEO0lBQ0Y7O0lBRUE7SUFDQTtJQUNBO0lBQ0E7O0lBRUEsTUFBTWlCLFVBQVUsR0FBRzVCLFFBQVEsQ0FBQzZCLGNBQWMsQ0FBRVgsSUFBSyxDQUFDOztJQUVsRDtJQUNBLEtBQU1RLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0YsWUFBWSxDQUFDTSxNQUFNLEVBQUVKLENBQUMsRUFBRSxFQUFHO01BQzFDLE1BQU1LLG1CQUFtQixHQUFHUCxZQUFZLENBQUVFLENBQUMsQ0FBRTtNQUM3QyxJQUFLSyxtQkFBbUIsRUFBRztRQUN6Qi9CLFFBQVEsQ0FBQ2dCLFVBQVUsQ0FBRUUsSUFBSSxFQUFFYSxtQkFBbUIsRUFBRUgsVUFBVyxDQUFDO1FBQzVERyxtQkFBbUIsQ0FBQ3BCLFdBQVcsR0FBRyxJQUFJO01BQ3hDO0lBQ0Y7O0lBRUE7SUFDQSxLQUFNZSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdELFVBQVUsQ0FBQ0ssTUFBTSxFQUFFSixDQUFDLEVBQUUsRUFBRztNQUN4QyxNQUFNTSxpQkFBaUIsR0FBR1AsVUFBVSxDQUFFQyxDQUFDLENBQUU7TUFDekMsSUFBS00saUJBQWlCLEVBQUc7UUFDdkIsTUFBTUMsY0FBYyxHQUFHRCxpQkFBaUIsQ0FBQ0UsUUFBUTtRQUNqRCxLQUFNUCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdNLGNBQWMsQ0FBQ0gsTUFBTSxFQUFFSCxDQUFDLEVBQUUsRUFBRztVQUM1QzNCLFFBQVEsQ0FBQ2dCLFVBQVUsQ0FBRWlCLGNBQWMsQ0FBRU4sQ0FBQyxDQUFFLEVBQUVLLGlCQUFrQixDQUFDO1FBQy9EO1FBQ0FBLGlCQUFpQixDQUFDckIsV0FBVyxHQUFHTyxJQUFJO01BQ3RDO0lBQ0Y7O0lBRUE7SUFDQSxLQUFNUSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdGLFlBQVksQ0FBQ00sTUFBTSxFQUFFSixDQUFDLEVBQUUsRUFBRztNQUMxQyxNQUFNUyxnQkFBZ0IsR0FBR1gsWUFBWSxDQUFFRSxDQUFDLENBQUU7TUFDMUMsSUFBS1MsZ0JBQWdCLEVBQUc7UUFDdEIsTUFBTUMsWUFBWSxHQUFHRCxnQkFBZ0IsQ0FBQ0QsUUFBUTtRQUM5QyxLQUFNUCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdTLFlBQVksQ0FBQ04sTUFBTSxFQUFFSCxDQUFDLEVBQUUsRUFBRztVQUMxQzNCLFFBQVEsQ0FBQ1ksT0FBTyxDQUFFd0IsWUFBWSxDQUFFVCxDQUFDLENBQUUsRUFBRVEsZ0JBQWlCLENBQUM7UUFDekQ7TUFDRjtJQUNGOztJQUVBO0lBQ0EsS0FBTVQsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRCxVQUFVLENBQUNLLE1BQU0sRUFBRUosQ0FBQyxFQUFFLEVBQUc7TUFDeEMsTUFBTVcsY0FBYyxHQUFHWixVQUFVLENBQUVDLENBQUMsQ0FBRTtNQUN0Q1csY0FBYyxJQUFJckMsUUFBUSxDQUFDWSxPQUFPLENBQUVNLElBQUksRUFBRW1CLGNBQWMsRUFBRVQsVUFBVyxDQUFDO0lBQ3hFO0lBRUE1QixRQUFRLENBQUNtQixPQUFPLENBQUVELElBQUksRUFBRVUsVUFBVyxDQUFDO0lBRXBDNUIsUUFBUSxDQUFDYSxPQUFPLENBQUMsQ0FBQztJQUVsQlQsVUFBVSxJQUFJQSxVQUFVLENBQUNKLFFBQVEsSUFBSUksVUFBVSxDQUFDVSxHQUFHLENBQUMsQ0FBQztFQUN2RCxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0V3QixpQkFBaUJBLENBQUVwQixJQUFJLEVBQUc7SUFDeEJkLFVBQVUsSUFBSUEsVUFBVSxDQUFDSixRQUFRLElBQUlJLFVBQVUsQ0FBQ0osUUFBUSxDQUFHLHVCQUFzQmtCLElBQUksQ0FBQ2IsR0FBSSxFQUFFLENBQUM7SUFDN0ZELFVBQVUsSUFBSUEsVUFBVSxDQUFDSixRQUFRLElBQUlJLFVBQVUsQ0FBQ0UsSUFBSSxDQUFDLENBQUM7SUFFdERDLE1BQU0sSUFBSUEsTUFBTSxDQUFFVyxJQUFJLFlBQVl4QixJQUFLLENBQUM7SUFFeENNLFFBQVEsQ0FBQ1UsUUFBUSxDQUFDLENBQUM7SUFFbkIsSUFBSWdCLENBQUM7SUFDTCxNQUFNYSxPQUFPLEdBQUdyQixJQUFJLENBQUNQLFdBQVcsR0FBRyxDQUFFTyxJQUFJLENBQUNQLFdBQVcsQ0FBRSxHQUFHTyxJQUFJLENBQUNnQixRQUFRO0lBQ3ZFLE1BQU1NLGNBQWMsR0FBRyxFQUFFLENBQUMsQ0FBQzs7SUFFM0I7SUFDQTtJQUNBLEtBQU1kLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2EsT0FBTyxDQUFDVCxNQUFNLEVBQUVKLENBQUMsRUFBRSxFQUFHO01BQ3JDLE1BQU14QixNQUFNLEdBQUdxQyxPQUFPLENBQUViLENBQUMsQ0FBRTtNQUUzQixNQUFNRSxVQUFVLEdBQUc1QixRQUFRLENBQUM2QixjQUFjLENBQUUzQixNQUFPLENBQUM7TUFDcERzQyxjQUFjLENBQUNsQyxJQUFJLENBQUVzQixVQUFXLENBQUM7TUFFakM1QixRQUFRLENBQUNnQixVQUFVLENBQUVkLE1BQU0sRUFBRWdCLElBQUksRUFBRVUsVUFBVyxDQUFDO0lBQ2pEOztJQUVBO0lBQ0EsS0FBTUYsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHYSxPQUFPLENBQUNULE1BQU0sRUFBRUosQ0FBQyxFQUFFLEVBQUc7TUFDckMxQixRQUFRLENBQUNZLE9BQU8sQ0FBRTJCLE9BQU8sQ0FBRWIsQ0FBQyxDQUFFLEVBQUVSLElBQUksRUFBRXNCLGNBQWMsQ0FBRWQsQ0FBQyxDQUFHLENBQUM7SUFDN0Q7O0lBRUE7SUFDQSxLQUFNQSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdSLElBQUksQ0FBQ3VCLGVBQWUsQ0FBQ1gsTUFBTSxFQUFFSixDQUFDLEVBQUUsRUFBRztNQUNsRCxNQUFNZ0IsT0FBTyxHQUFHeEIsSUFBSSxDQUFDdUIsZUFBZSxDQUFFZixDQUFDLENBQUU7TUFDekMsSUFBS2dCLE9BQU8sQ0FBQ0MsV0FBVyxFQUFHO1FBQ3pCM0MsUUFBUSxDQUFDNEMsbUJBQW1CLENBQUVGLE9BQU8sQ0FBQ0csaUJBQWtCLENBQUM7TUFDM0Q7SUFDRjtJQUVBN0MsUUFBUSxDQUFDYSxPQUFPLENBQUMsQ0FBQztJQUVsQlQsVUFBVSxJQUFJQSxVQUFVLENBQUNKLFFBQVEsSUFBSUksVUFBVSxDQUFDVSxHQUFHLENBQUMsQ0FBQztFQUN2RCxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0U4QixtQkFBbUJBLENBQUVFLFlBQVksRUFBRztJQUNsQyxNQUFNQyxRQUFRLEdBQUdELFlBQVksQ0FBQ0osT0FBTyxDQUFDSyxRQUFRO0lBQzlDeEMsTUFBTSxJQUFJQSxNQUFNLENBQUV3QyxRQUFTLENBQUM7SUFFNUJELFlBQVksQ0FBQ0UsaUJBQWlCLENBQUMsQ0FBQztJQUVoQ0YsWUFBWSxDQUFDRyx1QkFBdUIsQ0FBRWpELFFBQVEsQ0FBQ2tELFVBQVUsQ0FBRSxJQUFJcEQsS0FBSyxDQUFFaUQsUUFBUyxDQUFDLEVBQUVELFlBQVksQ0FBQ0osT0FBTyxFQUFFSSxZQUFhLENBQUUsQ0FBQztFQUMxSCxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFbEMsT0FBT0EsQ0FBRVYsTUFBTSxFQUFFQyxLQUFLLEVBQUV5QixVQUFVLEVBQUc7SUFDbkN4QixVQUFVLElBQUlBLFVBQVUsQ0FBQ0osUUFBUSxJQUFJSSxVQUFVLENBQUNKLFFBQVEsQ0FBRyxvQkFBbUJFLE1BQU0sQ0FBQ0csR0FBSSxhQUFZRixLQUFLLENBQUNFLEdBQUksRUFBRSxDQUFDO0lBQ2xIRCxVQUFVLElBQUlBLFVBQVUsQ0FBQ0osUUFBUSxJQUFJSSxVQUFVLENBQUNFLElBQUksQ0FBQyxDQUFDO0lBRXREQyxNQUFNLElBQUlQLFFBQVEsQ0FBQ21ELHNCQUFzQixDQUFFakQsTUFBTyxDQUFDO0lBRW5EMEIsVUFBVSxHQUFHQSxVQUFVLElBQUk1QixRQUFRLENBQUM2QixjQUFjLENBQUUzQixNQUFPLENBQUM7SUFFNUQsS0FBTSxJQUFJd0IsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRSxVQUFVLENBQUNFLE1BQU0sRUFBRUosQ0FBQyxFQUFFLEVBQUc7TUFDNUN0QixVQUFVLElBQUlBLFVBQVUsQ0FBQ0osUUFBUSxJQUFJSSxVQUFVLENBQUNKLFFBQVEsQ0FBRyxVQUFTNEIsVUFBVSxDQUFFRixDQUFDLENBQUUsQ0FBQzBCLEtBQUssQ0FBQ0MsUUFBUSxDQUFDLENBQUUsU0FBUXpCLFVBQVUsQ0FBRUYsQ0FBQyxDQUFFLENBQUM0QixTQUFTLENBQUNELFFBQVEsQ0FBQyxDQUFFLFFBQU96QixVQUFVLENBQUVGLENBQUMsQ0FBRSxDQUFDNkIsWUFBWSxDQUFDRixRQUFRLENBQUMsQ0FBRSxTQUFRekIsVUFBVSxDQUFFRixDQUFDLENBQUUsQ0FBQzhCLE1BQU8sRUFBRSxDQUFDO01BQ25PcEQsVUFBVSxJQUFJQSxVQUFVLENBQUNKLFFBQVEsSUFBSUksVUFBVSxDQUFDRSxJQUFJLENBQUMsQ0FBQztNQUV0RCxNQUFNbUQsWUFBWSxHQUFHN0IsVUFBVSxDQUFFRixDQUFDLENBQUU7TUFDcEMsTUFBTWdDLGNBQWMsR0FBR0QsWUFBWSxDQUFDRixZQUFZOztNQUVoRDtNQUNBRSxZQUFZLENBQUNILFNBQVMsQ0FBQ0ssYUFBYSxDQUFFeEQsS0FBTSxDQUFDO01BQzdDLE1BQU15RCxjQUFjLEdBQUc1RCxRQUFRLENBQUNrRCxVQUFVLENBQUVPLFlBQVksQ0FBQ0gsU0FBUyxFQUFFSSxjQUFjLENBQUNoQixPQUFPLEVBQUVnQixjQUFlLENBQUM7TUFDNUdELFlBQVksQ0FBQ0gsU0FBUyxDQUFDTyxnQkFBZ0IsQ0FBRTFELEtBQU0sQ0FBQztNQUVoRHVELGNBQWMsQ0FBQ1QsdUJBQXVCLENBQUVXLGNBQWUsQ0FBQztNQUV4RHhELFVBQVUsSUFBSUEsVUFBVSxDQUFDSixRQUFRLElBQUlJLFVBQVUsQ0FBQ1UsR0FBRyxDQUFDLENBQUM7SUFDdkQ7SUFFQVYsVUFBVSxJQUFJQSxVQUFVLENBQUNKLFFBQVEsSUFBSUksVUFBVSxDQUFDVSxHQUFHLENBQUMsQ0FBQztFQUN2RCxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxVQUFVQSxDQUFFZCxNQUFNLEVBQUVDLEtBQUssRUFBRXlCLFVBQVUsRUFBRztJQUN0Q3hCLFVBQVUsSUFBSUEsVUFBVSxDQUFDSixRQUFRLElBQUlJLFVBQVUsQ0FBQ0osUUFBUSxDQUFHLHVCQUFzQkUsTUFBTSxDQUFDRyxHQUFJLGFBQVlGLEtBQUssQ0FBQ0UsR0FBSSxFQUFFLENBQUM7SUFDckhELFVBQVUsSUFBSUEsVUFBVSxDQUFDSixRQUFRLElBQUlJLFVBQVUsQ0FBQ0UsSUFBSSxDQUFDLENBQUM7SUFFdERzQixVQUFVLEdBQUdBLFVBQVUsSUFBSTVCLFFBQVEsQ0FBQzZCLGNBQWMsQ0FBRTNCLE1BQU8sQ0FBQztJQUU1RCxLQUFNLElBQUl3QixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdFLFVBQVUsQ0FBQ0UsTUFBTSxFQUFFSixDQUFDLEVBQUUsRUFBRztNQUM1QyxNQUFNK0IsWUFBWSxHQUFHN0IsVUFBVSxDQUFFRixDQUFDLENBQUU7O01BRXBDO01BQ0ErQixZQUFZLENBQUNILFNBQVMsQ0FBQ0ssYUFBYSxDQUFFeEQsS0FBTSxDQUFDO01BQzdDc0QsWUFBWSxDQUFDRixZQUFZLENBQUNPLHVCQUF1QixDQUFFTCxZQUFZLENBQUNILFNBQVUsQ0FBQztNQUMzRUcsWUFBWSxDQUFDSCxTQUFTLENBQUNPLGdCQUFnQixDQUFFMUQsS0FBTSxDQUFDO0lBQ2xEO0lBRUFDLFVBQVUsSUFBSUEsVUFBVSxDQUFDSixRQUFRLElBQUlJLFVBQVUsQ0FBQ1UsR0FBRyxDQUFDLENBQUM7RUFDdkQsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VLLE9BQU9BLENBQUVELElBQUksRUFBRVUsVUFBVSxFQUFHO0lBQzFCeEIsVUFBVSxJQUFJQSxVQUFVLENBQUNKLFFBQVEsSUFBSUksVUFBVSxDQUFDSixRQUFRLENBQUcsYUFBWWtCLElBQUksQ0FBQ2IsR0FBSSxFQUFFLENBQUM7SUFDbkZELFVBQVUsSUFBSUEsVUFBVSxDQUFDSixRQUFRLElBQUlJLFVBQVUsQ0FBQ0UsSUFBSSxDQUFDLENBQUM7SUFFdERzQixVQUFVLEdBQUdBLFVBQVUsSUFBSTVCLFFBQVEsQ0FBQzZCLGNBQWMsQ0FBRVgsSUFBSyxDQUFDO0lBRTFELEtBQU0sSUFBSVEsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRSxVQUFVLENBQUNFLE1BQU0sRUFBRUosQ0FBQyxFQUFFLEVBQUc7TUFDNUMsTUFBTStCLFlBQVksR0FBRzdCLFVBQVUsQ0FBRUYsQ0FBQyxDQUFFOztNQUVwQztNQUNBK0IsWUFBWSxDQUFDRixZQUFZLENBQUNRLFlBQVksQ0FBQyxDQUFDO0lBQzFDO0lBRUEzRCxVQUFVLElBQUlBLFVBQVUsQ0FBQ0osUUFBUSxJQUFJSSxVQUFVLENBQUNVLEdBQUcsQ0FBQyxDQUFDO0VBQ3ZELENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFb0MsVUFBVUEsQ0FBRUUsS0FBSyxFQUFFVixPQUFPLEVBQUVnQixjQUFjLEVBQUc7SUFDM0N0RCxVQUFVLElBQUlBLFVBQVUsQ0FBQ0osUUFBUSxJQUFJSSxVQUFVLENBQUNKLFFBQVEsQ0FBRyxjQUFhb0QsS0FBSyxDQUFDQyxRQUFRLENBQUMsQ0FBRSxXQUFVSyxjQUFjLEdBQUdBLGNBQWMsQ0FBQ0wsUUFBUSxDQUFDLENBQUMsR0FBRyxNQUFPLEVBQUUsQ0FBQztJQUMxSmpELFVBQVUsSUFBSUEsVUFBVSxDQUFDSixRQUFRLElBQUlJLFVBQVUsQ0FBQ0UsSUFBSSxDQUFDLENBQUM7SUFFdEQsTUFBTVksSUFBSSxHQUFHa0MsS0FBSyxDQUFDWSxRQUFRLENBQUMsQ0FBQztJQUM3QixNQUFNQyxpQkFBaUIsR0FBRy9DLElBQUksQ0FBQ2dELG9CQUFvQixDQUFDLENBQUM7SUFFckQ5RCxVQUFVLElBQUlBLFVBQVUsQ0FBQ0osUUFBUSxJQUFJSSxVQUFVLENBQUNKLFFBQVEsQ0FBRyxzQkFBcUJBLFFBQVEsQ0FBQ3VCLFVBQVUsQ0FBRTBDLGlCQUFrQixDQUFFLEVBQUUsQ0FBQzs7SUFFNUg7SUFDQSxJQUFJRSxRQUFRO0lBQ1osSUFBSUMsT0FBTyxHQUFHLEtBQUs7SUFDbkIsSUFBS2xELElBQUksQ0FBQ21ELGNBQWMsRUFBRztNQUN6QkYsUUFBUSxHQUFHVCxjQUFjLENBQUNZLGtCQUFrQixDQUFFbEIsS0FBTSxDQUFDO01BQ3JELElBQUtlLFFBQVEsRUFBRztRQUNkQyxPQUFPLEdBQUcsSUFBSTtNQUNoQixDQUFDLE1BQ0k7UUFDSEQsUUFBUSxHQUFHdkUsWUFBWSxDQUFDMkUsSUFBSSxDQUFDQyxNQUFNLENBQUVkLGNBQWMsRUFBRWhCLE9BQU8sRUFBRVUsS0FBSyxDQUFDcUIsSUFBSSxDQUFDLENBQUUsQ0FBQztNQUM5RTs7TUFFQTtNQUNBO01BQ0FmLGNBQWMsR0FBR1MsUUFBUTtJQUMzQjs7SUFFQTtJQUNBLE1BQU1QLGNBQWMsR0FBRyxFQUFFO0lBQ3pCLEtBQU0sSUFBSWxDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR3VDLGlCQUFpQixDQUFDbkMsTUFBTSxFQUFFSixDQUFDLEVBQUUsRUFBRztNQUNuRDBCLEtBQUssQ0FBQ08sYUFBYSxDQUFFTSxpQkFBaUIsQ0FBRXZDLENBQUMsQ0FBRSxFQUFFQSxDQUFFLENBQUM7TUFDaERnRCxLQUFLLENBQUNDLFNBQVMsQ0FBQ3JFLElBQUksQ0FBQ3NFLEtBQUssQ0FBRWhCLGNBQWMsRUFBRTVELFFBQVEsQ0FBQ2tELFVBQVUsQ0FBRUUsS0FBSyxFQUFFVixPQUFPLEVBQUVnQixjQUFlLENBQUUsQ0FBQztNQUNuR04sS0FBSyxDQUFDUyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzFCOztJQUVBO0lBQ0EsSUFBS00sUUFBUSxFQUFHO01BQ2RBLFFBQVEsQ0FBQ2xCLHVCQUF1QixDQUFFVyxjQUFlLENBQUM7TUFFbER4RCxVQUFVLElBQUlBLFVBQVUsQ0FBQ0osUUFBUSxJQUFJSSxVQUFVLENBQUNVLEdBQUcsQ0FBQyxDQUFDO01BQ3JELE9BQU9zRCxPQUFPLEdBQUcsRUFBRSxHQUFHLENBQUVELFFBQVEsQ0FBRTtJQUNwQztJQUNBO0lBQUEsS0FDSztNQUNIL0QsVUFBVSxJQUFJQSxVQUFVLENBQUNKLFFBQVEsSUFBSUksVUFBVSxDQUFDVSxHQUFHLENBQUMsQ0FBQztNQUNyRCxPQUFPOEMsY0FBYztJQUN2QjtFQUNGLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VsRCxRQUFRQSxDQUFBLEVBQUc7SUFDVFgsZUFBZSxHQUFHOEUsUUFBUSxDQUFDQyxhQUFhLENBQUNDLEVBQUU7SUFDM0N0RixhQUFhLENBQUN1RixtQkFBbUIsR0FBRyxJQUFJO0VBQzFDLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtFQUNFbkUsT0FBT0EsQ0FBQSxFQUFHO0lBQ1IsTUFBTWlFLGFBQWEsR0FBR0QsUUFBUSxDQUFDSSxjQUFjLENBQUVsRixlQUFnQixDQUFDO0lBQ2hFK0UsYUFBYSxJQUFJQSxhQUFhLENBQUNJLEtBQUssQ0FBQyxDQUFDO0lBQ3RDekYsYUFBYSxDQUFDdUYsbUJBQW1CLEdBQUcsS0FBSztFQUMzQyxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRW5ELGNBQWNBLENBQUVYLElBQUksRUFBRztJQUNyQixNQUFNaUUsTUFBTSxHQUFHLEVBQUU7SUFDakJuRixRQUFRLENBQUNvRix3QkFBd0IsQ0FBRUQsTUFBTSxFQUFFLElBQUlyRixLQUFLLENBQUVvQixJQUFLLENBQUUsQ0FBQztJQUM5RCxPQUFPaUUsTUFBTTtFQUNmLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyx3QkFBd0JBLENBQUVDLFlBQVksRUFBRWpDLEtBQUssRUFBRztJQUM5QyxNQUFNa0MsSUFBSSxHQUFHbEMsS0FBSyxDQUFDTCxRQUFRLENBQUMsQ0FBQztJQUM3QixJQUFJckIsQ0FBQzs7SUFFTDtJQUNBO0lBQ0E7SUFDQSxJQUFLNEQsSUFBSSxDQUFDakIsY0FBYyxFQUFHO01BQ3pCLE1BQU1rQixTQUFTLEdBQUdELElBQUksQ0FBQ0UsYUFBYTtNQUVwQyxLQUFNOUQsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHNkQsU0FBUyxDQUFDekQsTUFBTSxFQUFFSixDQUFDLEVBQUUsRUFBRztRQUN2QzJELFlBQVksQ0FBQy9FLElBQUksQ0FBRSxJQUFJWCxnQkFBZ0IsQ0FBRTRGLFNBQVMsQ0FBRTdELENBQUMsQ0FBRSxFQUFFMEIsS0FBSyxDQUFDcUIsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFNLENBQUUsQ0FBQztNQUNsRjtNQUNBO0lBQ0Y7SUFDQTtJQUFBLEtBQ0s7TUFDSCxNQUFNZ0IsY0FBYyxHQUFHSCxJQUFJLENBQUNHLGNBQWM7TUFDMUMsS0FBTS9ELENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRytELGNBQWMsQ0FBQzNELE1BQU0sRUFBRUosQ0FBQyxFQUFFLEVBQUc7UUFDNUMsTUFBTWdCLE9BQU8sR0FBRytDLGNBQWMsQ0FBRS9ELENBQUMsQ0FBRTtRQUVuQyxJQUFLZ0IsT0FBTyxDQUFDQyxXQUFXLEVBQUc7VUFDekIwQyxZQUFZLENBQUMvRSxJQUFJLENBQUUsSUFBSVgsZ0JBQWdCLENBQUUrQyxPQUFPLENBQUNHLGlCQUFpQixFQUFFTyxLQUFLLENBQUNxQixJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUssQ0FBRSxDQUFDO1FBQzVGO01BQ0Y7SUFDRjtJQUVBLE1BQU1sQyxPQUFPLEdBQUcrQyxJQUFJLENBQUMzRSxXQUFXLEdBQUcsQ0FBRTJFLElBQUksQ0FBQzNFLFdBQVcsQ0FBRSxHQUFHMkUsSUFBSSxDQUFDcEQsUUFBUTtJQUN2RSxNQUFNd0QsV0FBVyxHQUFHbkQsT0FBTyxDQUFDVCxNQUFNO0lBQ2xDLEtBQU1KLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2dFLFdBQVcsRUFBRWhFLENBQUMsRUFBRSxFQUFHO01BQ2xDLE1BQU14QixNQUFNLEdBQUdxQyxPQUFPLENBQUViLENBQUMsQ0FBRTtNQUUzQjBCLEtBQUssQ0FBQ3VDLFdBQVcsQ0FBRXpGLE1BQU8sQ0FBQztNQUMzQkYsUUFBUSxDQUFDb0Ysd0JBQXdCLENBQUVDLFlBQVksRUFBRWpDLEtBQU0sQ0FBQztNQUN4REEsS0FBSyxDQUFDd0MsY0FBYyxDQUFDLENBQUM7SUFDeEI7RUFDRixDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7RUFDRUMsaUJBQWlCQSxDQUFFM0UsSUFBSSxFQUFHO0lBQ3hCLElBQUs0RSxVQUFVLEVBQUc7TUFDaEIsSUFBSzVFLElBQUksQ0FBQzZFLGlCQUFpQixDQUFDQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUc7UUFFbEQsSUFBSXRFLENBQUM7UUFDTCxNQUFNdUUsUUFBUSxHQUFHLEVBQUU7O1FBRW5CO1FBQ0EsS0FBTXZFLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR1IsSUFBSSxDQUFDZ0IsUUFBUSxDQUFDSixNQUFNLEVBQUVKLENBQUMsRUFBRSxFQUFHO1VBQzNDZ0QsS0FBSyxDQUFDQyxTQUFTLENBQUNyRSxJQUFJLENBQUNzRSxLQUFLLENBQUVxQixRQUFRLEVBQUUvRSxJQUFJLENBQUNnQixRQUFRLENBQUVSLENBQUMsQ0FBRSxDQUFDcUUsaUJBQWlCLENBQUNHLFlBQWEsQ0FBQztRQUMzRjs7UUFFQTtRQUNBLEtBQU14RSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdSLElBQUksQ0FBQ3VCLGVBQWUsQ0FBQ1gsTUFBTSxFQUFFSixDQUFDLEVBQUUsRUFBRztVQUNsRCxNQUFNZ0IsT0FBTyxHQUFHeEIsSUFBSSxDQUFDdUIsZUFBZSxDQUFFZixDQUFDLENBQUU7VUFDekMsSUFBS2dCLE9BQU8sQ0FBQ0MsV0FBVyxFQUFHO1lBQ3pCc0QsUUFBUSxDQUFDM0YsSUFBSSxDQUFFb0MsT0FBUSxDQUFDO1VBQzFCO1FBQ0Y7UUFFQSxNQUFNeUQsV0FBVyxHQUFHakYsSUFBSSxDQUFDNkUsaUJBQWlCLENBQUNHLFlBQVksQ0FBQ0UsS0FBSyxDQUFDLENBQUM7UUFDL0QsTUFBTUMsYUFBYSxHQUFHSixRQUFRLENBQUNHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4Q04sVUFBVSxDQUFFSyxXQUFXLENBQUNyRSxNQUFNLEtBQUt1RSxhQUFhLENBQUN2RSxNQUFPLENBQUM7UUFFekQsS0FBTUosQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHMkUsYUFBYSxDQUFDdkUsTUFBTSxFQUFFSixDQUFDLEVBQUUsRUFBRztVQUMzQyxLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR3dFLFdBQVcsQ0FBQ3JFLE1BQU0sRUFBRUgsQ0FBQyxFQUFFLEVBQUc7WUFDN0MsSUFBSzBFLGFBQWEsQ0FBRTNFLENBQUMsQ0FBRSxLQUFLeUUsV0FBVyxDQUFFeEUsQ0FBQyxDQUFFLEVBQUc7Y0FDN0MwRSxhQUFhLENBQUNDLE1BQU0sQ0FBRTVFLENBQUMsRUFBRSxDQUFFLENBQUM7Y0FDNUJ5RSxXQUFXLENBQUNHLE1BQU0sQ0FBRTNFLENBQUMsRUFBRSxDQUFFLENBQUM7Y0FDMUJELENBQUMsRUFBRTtjQUNIO1lBQ0Y7VUFDRjtRQUNGO1FBRUFvRSxVQUFVLENBQUVLLFdBQVcsQ0FBQ3JFLE1BQU0sS0FBSyxDQUFDLElBQUl1RSxhQUFhLENBQUN2RSxNQUFNLEtBQUssQ0FBQyxFQUFFLHdDQUF5QyxDQUFDO01BQ2hILENBQUMsTUFDSTtRQUNIZ0UsVUFBVSxDQUFFNUUsSUFBSSxDQUFDNkUsaUJBQWlCLENBQUNHLFlBQVksQ0FBQ3BFLE1BQU0sS0FBSyxDQUFDLEVBQUUsd0RBQXlELENBQUM7TUFDMUg7SUFDRjtFQUNGLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFcUIsc0JBQXNCQSxDQUFFakMsSUFBSSxFQUFHO0lBQzdCLElBQUtYLE1BQU0sRUFBRztNQUNaLE1BQU02QyxLQUFLLEdBQUcsSUFBSXRELEtBQUssQ0FBRW9CLElBQUssQ0FBQztNQUUvQixDQUFFLFNBQVNxRixlQUFlQSxDQUFBLEVBQUc7UUFDM0IsTUFBTWpCLElBQUksR0FBR2xDLEtBQUssQ0FBQ0wsUUFBUSxDQUFDLENBQUM7UUFFN0J4QyxNQUFNLENBQUU2QyxLQUFLLENBQUN0QixNQUFNLElBQUksQ0FBQyxJQUFJd0QsSUFBSSxLQUFLcEUsSUFBSSxFQUN2QyxHQUFFLHdHQUF3RyxHQUN4RyxtRkFBb0YsR0FBRWtDLEtBQUssQ0FBQ0MsUUFBUSxDQUFDLENBQ3ZHLFVBQVNELEtBQUssQ0FBQ29ELFlBQVksQ0FBQyxDQUFFLEVBQUUsQ0FBQztRQUVwQyxNQUFNZCxXQUFXLEdBQUdKLElBQUksQ0FBQ3BELFFBQVEsQ0FBQ0osTUFBTTtRQUN4QyxLQUFNLElBQUlKLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2dFLFdBQVcsRUFBRWhFLENBQUMsRUFBRSxFQUFHO1VBQ3RDLE1BQU14QixNQUFNLEdBQUdvRixJQUFJLENBQUNwRCxRQUFRLENBQUVSLENBQUMsQ0FBRTtVQUVqQzBCLEtBQUssQ0FBQ3VDLFdBQVcsQ0FBRXpGLE1BQU8sQ0FBQztVQUMzQnFHLGVBQWUsQ0FBQyxDQUFDO1VBQ2pCbkQsS0FBSyxDQUFDd0MsY0FBYyxDQUFDLENBQUM7UUFDeEI7UUFDQTtRQUNBLElBQUtOLElBQUksQ0FBQzNFLFdBQVcsSUFBSSxDQUFDMkUsSUFBSSxDQUFDM0UsV0FBVyxDQUFDOEYsUUFBUSxDQUFFbkIsSUFBSyxDQUFDLEVBQUc7VUFDNURsQyxLQUFLLENBQUN1QyxXQUFXLENBQUVMLElBQUksQ0FBQzNFLFdBQVksQ0FBQztVQUNyQzRGLGVBQWUsQ0FBQyxDQUFDO1VBQ2pCbkQsS0FBSyxDQUFDd0MsY0FBYyxDQUFDLENBQUM7UUFDeEI7TUFDRixDQUFDLEVBQUcsQ0FBQztJQUNQO0VBQ0YsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VyRSxVQUFVQSxDQUFFbUYsU0FBUyxFQUFHO0lBQ3RCLElBQUtBLFNBQVMsS0FBSyxJQUFJLEVBQUc7TUFBRSxPQUFPLE1BQU07SUFBRTtJQUUzQyxPQUFRLElBQUdBLFNBQVMsQ0FBQ0MsR0FBRyxDQUFFQyxVQUFVLElBQUlBLFVBQVUsS0FBSyxJQUFJLEdBQUcsTUFBTSxHQUFHQSxVQUFVLENBQUN2RyxHQUFJLENBQUMsQ0FBQ3dHLElBQUksQ0FBRSxHQUFJLENBQUUsR0FBRTtFQUN4RztBQUNGLENBQUM7QUFFRGhILE9BQU8sQ0FBQ2lILFFBQVEsQ0FBRSxVQUFVLEVBQUU5RyxRQUFTLENBQUM7QUFFeEMsZUFBZUEsUUFBUSJ9