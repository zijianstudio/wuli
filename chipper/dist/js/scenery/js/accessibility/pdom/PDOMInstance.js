// Copyright 2015-2023, University of Colorado Boulder

/**
 * An instance that is synchronously created, for handling accessibility needs.
 *
 * Consider the following example:
 *
 * We have a node structure:
 * A
 *  B ( accessible )
 *    C (accessible )
 *      D
 *        E (accessible)
 *         G (accessible)
 *        F
 *          H (accessible)
 *
 *
 * Which has an equivalent accessible instance tree:
 * root
 *  AB
 *    ABC
 *      ABCDE
 *        ABCDEG
 *      ABCDFH
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import cleanArray from '../../../../phet-core/js/cleanArray.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Pool from '../../../../phet-core/js/Pool.js';
import { FocusManager, Node, PDOMPeer, PDOMUtils, scenery, Trail, TransformTracker } from '../../imports.js';

// PDOMInstances support two different styles of unique IDs, each with their own tradeoffs, https://github.com/phetsims/phet-io/issues/1851
class PDOMUniqueIdStrategy extends EnumerationValue {
  static INDICES = new PDOMUniqueIdStrategy();
  static TRAIL_ID = new PDOMUniqueIdStrategy();
  static enumeration = new Enumeration(PDOMUniqueIdStrategy);
}

// A type representing a fake instance, for some aggressive auditing (under ?assertslow)

// This constant is set up to allow us to change our unique id strategy. Both strategies have trade-offs that are
// described in https://github.com/phetsims/phet-io/issues/1847#issuecomment-1068377336. TRAIL_ID is our path forward
// currently, but will break PhET-iO playback if any Nodes are created in the recorded sim OR playback sim but not
// both. Further information in the above issue and https://github.com/phetsims/phet-io/issues/1851.
const UNIQUE_ID_STRATEGY = PDOMUniqueIdStrategy.TRAIL_ID;
let globalId = 1;
class PDOMInstance {
  // unique ID

  // {Display}

  // {number} - The number of nodes in our trail that are NOT in our parent's trail and do NOT have our
  // display in their pdomDisplays. For non-root instances, this is initialized later in the constructor.
  // {Array.<Node>} - Nodes that are in our trail (but not those of our parent)
  relativeNodes = [];

  // {Array.<boolean>} - Whether our display is in the respective relativeNodes' pdomDisplays
  relativeVisibilities = [];

  // {function} - The listeners added to the respective relativeNodes
  relativeListeners = [];

  // (scenery-internal) {TransformTracker|null} - Used to quickly compute the global matrix of this
  // instance's transform source Node and observe when the transform changes. Used by PDOMPeer to update
  // positioning of sibling elements. By default, watches this PDOMInstance's visual trail.
  transformTracker = null;

  // {boolean} - Whether we are currently in a "disposed" (in the pool) state, or are available to be
  // re-initialized
  /**
   * Constructor for PDOMInstance, uses an initialize method for pooling.
   *
   * @param parent - parent of this instance, null if root of PDOMInstance tree
   * @param display
   * @param trail - trail to the node for this PDOMInstance
   */
  constructor(parent, display, trail) {
    this.initializePDOMInstance(parent, display, trail);
  }

  /**
   * Initializes an PDOMInstance, implements construction for pooling.
   *
   * @param parent - null if this PDOMInstance is root of PDOMInstance tree
   * @param display
   * @param trail - trail to node for this PDOMInstance
   * @returns - Returns 'this' reference, for chaining
   */
  initializePDOMInstance(parent, display, trail) {
    assert && assert(!this.id || this.isDisposed, 'If we previously existed, we need to have been disposed');

    // unique ID
    this.id = this.id || globalId++;
    this.parent = parent;

    // {Display}
    this.display = display;

    // {Trail}
    this.trail = trail;

    // {boolean}
    this.isRootInstance = parent === null;

    // {Node|null}
    this.node = this.isRootInstance ? null : trail.lastNode();

    // {Array.<PDOMInstance>}
    this.children = cleanArray(this.children);

    // If we are the root accessible instance, we won't actually have a reference to a node.
    if (this.node) {
      this.node.addPDOMInstance(this);
    }

    // {number} - The number of nodes in our trail that are NOT in our parent's trail and do NOT have our
    // display in their pdomDisplays. For non-root instances, this is initialized later in the constructor.
    this.invisibleCount = 0;

    // {Array.<Node>} - Nodes that are in our trail (but not those of our parent)
    this.relativeNodes = [];

    // {Array.<boolean>} - Whether our display is in the respective relativeNodes' pdomDisplays
    this.relativeVisibilities = [];

    // {function} - The listeners added to the respective relativeNodes
    this.relativeListeners = [];

    // (scenery-internal) {TransformTracker|null} - Used to quickly compute the global matrix of this
    // instance's transform source Node and observe when the transform changes. Used by PDOMPeer to update
    // positioning of sibling elements. By default, watches this PDOMInstance's visual trail.
    this.transformTracker = null;
    this.updateTransformTracker(this.node ? this.node.pdomTransformSourceNode : null);

    // {boolean} - Whether we are currently in a "disposed" (in the pool) state, or are available to be
    // re-initialized
    this.isDisposed = false;
    if (this.isRootInstance) {
      const accessibilityContainer = document.createElement('div');

      // @ts-expect-error - Poolable is a mixin and TypeScript doesn't have good mixin support
      this.peer = PDOMPeer.createFromPool(this, {
        primarySibling: accessibilityContainer
      });
    } else {
      // @ts-expect-error - Poolable a mixin and TypeScript doesn't have good mixin support
      this.peer = PDOMPeer.createFromPool(this);

      // The peer is not fully constructed until this update function is called, see https://github.com/phetsims/scenery/issues/832
      // Trail Ids will never change, so update them eagerly, a single time during construction.
      this.peer.update(UNIQUE_ID_STRATEGY === PDOMUniqueIdStrategy.TRAIL_ID);
      assert && assert(this.peer.primarySibling, 'accessible peer must have a primarySibling upon completion of construction');

      // Scan over all of the nodes in our trail (that are NOT in our parent's trail) to check for pdomDisplays
      // so we can initialize our invisibleCount and add listeners.
      const parentTrail = this.parent.trail;
      for (let i = parentTrail.length; i < trail.length; i++) {
        const relativeNode = trail.nodes[i];
        this.relativeNodes.push(relativeNode);
        const pdomDisplays = relativeNode._pdomDisplaysInfo.pdomDisplays;
        const isVisible = _.includes(pdomDisplays, display);
        this.relativeVisibilities.push(isVisible);
        if (!isVisible) {
          this.invisibleCount++;
        }
        const listener = this.checkAccessibleDisplayVisibility.bind(this, i - parentTrail.length);
        relativeNode.pdomDisplaysEmitter.addListener(listener);
        this.relativeListeners.push(listener);
      }
      this.updateVisibility();
    }
    sceneryLog && sceneryLog.PDOMInstance && sceneryLog.PDOMInstance(`Initialized ${this.toString()}`);
    return this;
  }

  /**
   * Adds a series of (sorted) accessible instances as children.
   */
  addConsecutiveInstances(pdomInstances) {
    sceneryLog && sceneryLog.PDOMInstance && sceneryLog.PDOMInstance(`addConsecutiveInstances on ${this.toString()} with: ${pdomInstances.map(inst => inst.toString()).join(',')}`);
    sceneryLog && sceneryLog.PDOMInstance && sceneryLog.push();
    const hadChildren = this.children.length > 0;
    Array.prototype.push.apply(this.children, pdomInstances);
    for (let i = 0; i < pdomInstances.length; i++) {
      // Append the container parent to the end (so that, when provided in order, we don't have to resort below
      // when initializing).
      assert && assert(!!this.peer.primarySibling, 'Primary sibling must be defined to insert elements.');

      // @ts-expect-error - when PDOMPeer is converted to TS this ts-expect-error can probably be removed
      PDOMUtils.insertElements(this.peer.primarySibling, pdomInstances[i].peer.topLevelElements);
    }
    if (hadChildren) {
      this.sortChildren();
    }
    if (assert && this.node) {
      assert && assert(this.node instanceof Node);

      // If you hit this when mutating both children and innerContent at the same time, it is an issue with scenery,
      // remove once in a single step and the add the other in the next step.
      this.children.length > 0 && assert(!this.node.innerContent, `${this.children.length} child PDOMInstances present but this node has innerContent: ${this.node.innerContent}`);
    }
    if (UNIQUE_ID_STRATEGY === PDOMUniqueIdStrategy.INDICES) {
      // This kills performance if there are enough PDOMInstances
      this.updateDescendantPeerIds(pdomInstances);
    }
    sceneryLog && sceneryLog.PDOMInstance && sceneryLog.pop();
  }

  /**
   * Removes any child instances that are based on the provided trail.
   */
  removeInstancesForTrail(trail) {
    sceneryLog && sceneryLog.PDOMInstance && sceneryLog.PDOMInstance(`removeInstancesForTrail on ${this.toString()} with trail ${trail.toString()}`);
    sceneryLog && sceneryLog.PDOMInstance && sceneryLog.push();
    for (let i = 0; i < this.children.length; i++) {
      const childInstance = this.children[i];
      const childTrail = childInstance.trail;

      // Not worth it to inspect before our trail ends, since it should be (!) guaranteed to be equal
      let differs = childTrail.length < trail.length;
      if (!differs) {
        for (let j = this.trail.length; j < trail.length; j++) {
          if (trail.nodes[j] !== childTrail.nodes[j]) {
            differs = true;
            break;
          }
        }
      }
      if (!differs) {
        this.children.splice(i, 1);
        childInstance.dispose();
        i -= 1;
      }
    }
    sceneryLog && sceneryLog.PDOMInstance && sceneryLog.pop();
  }

  /**
   * Removes all of the children.
   */
  removeAllChildren() {
    sceneryLog && sceneryLog.PDOMInstance && sceneryLog.PDOMInstance(`removeAllChildren on ${this.toString()}`);
    sceneryLog && sceneryLog.PDOMInstance && sceneryLog.push();
    while (this.children.length) {
      this.children.pop().dispose();
    }
    sceneryLog && sceneryLog.PDOMInstance && sceneryLog.pop();
  }

  /**
   * Returns an PDOMInstance child (if one exists with the given Trail), or null otherwise.
   */
  findChildWithTrail(trail) {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (child.trail.equals(trail)) {
        return child;
      }
    }
    return null;
  }

  /**
   * Remove a subtree of PDOMInstances from this PDOMInstance
   *
   * @param trail - children of this PDOMInstance will be removed if the child trails are extensions
   *                        of the trail.
   * (scenery-internal)
   */
  removeSubtree(trail) {
    sceneryLog && sceneryLog.PDOMInstance && sceneryLog.PDOMInstance(`removeSubtree on ${this.toString()} with trail ${trail.toString()}`);
    sceneryLog && sceneryLog.PDOMInstance && sceneryLog.push();
    for (let i = this.children.length - 1; i >= 0; i--) {
      const childInstance = this.children[i];
      if (childInstance.trail.isExtensionOf(trail, true)) {
        sceneryLog && sceneryLog.PDOMInstance && sceneryLog.PDOMInstance(`Remove parent: ${this.toString()}, child: ${childInstance.toString()}`);
        this.children.splice(i, 1); // remove it from the children array

        // Dispose the entire subtree of PDOMInstances
        childInstance.dispose();
      }
    }
    sceneryLog && sceneryLog.PDOMInstance && sceneryLog.pop();
  }

  /**
   * Checks to see whether our visibility needs an update based on an pdomDisplays change.
   *
   * @param index - Index into the relativeNodes array (which node had the notification)
   */
  checkAccessibleDisplayVisibility(index) {
    const isNodeVisible = _.includes(this.relativeNodes[index]._pdomDisplaysInfo.pdomDisplays, this.display);
    const wasNodeVisible = this.relativeVisibilities[index];
    if (isNodeVisible !== wasNodeVisible) {
      this.relativeVisibilities[index] = isNodeVisible;
      const wasVisible = this.invisibleCount === 0;
      this.invisibleCount += isNodeVisible ? -1 : 1;
      assert && assert(this.invisibleCount >= 0 && this.invisibleCount <= this.relativeNodes.length);
      const isVisible = this.invisibleCount === 0;
      if (isVisible !== wasVisible) {
        this.updateVisibility();
      }
    }
  }

  /**
   * Update visibility of this peer's accessible DOM content. The hidden attribute will hide all of the descendant
   * DOM content, so it is not necessary to update the subtree of PDOMInstances since the browser
   * will do this for us.
   */
  updateVisibility() {
    assert && assert(!!this.peer, 'Peer needs to be available on update visibility.');
    this.peer.setVisible(this.invisibleCount <= 0);

    // if we hid a parent element, blur focus if active element was an ancestor
    if (!this.peer.isVisible() && FocusManager.pdomFocusedNode) {
      assert && assert(FocusManager.pdomFocusedNode.pdomInstances.length === 1, 'focusable Nodes do not support DAG, and should be connected with an instance if focused.');

      // NOTE: We don't seem to be able to import normally here
      if (FocusManager.pdomFocusedNode.pdomInstances[0].trail.containsNode(this.node)) {
        FocusManager.pdomFocus = null;
      }
    }
  }

  /**
   * Returns whether the parallel DOM for this instance and its ancestors are not hidden.
   */
  isGloballyVisible() {
    assert && assert(!!this.peer, 'PDOMPeer needs to be available, has this PDOMInstance been disposed?');

    // If this peer is hidden, then return because that attribute will bubble down to children,
    // otherwise recurse to parent.
    if (!this.peer.isVisible()) {
      return false;
    } else if (this.parent) {
      return this.parent.isGloballyVisible();
    } else {
      // base case at root
      return true;
    }
  }

  /**
   * Returns what our list of children (after sorting) should be.
   *
   * @param trail - A partial trail, where the root of the trail is either this.node or the display's root
   *                        node (if we are the root PDOMInstance)
   */
  getChildOrdering(trail) {
    const node = trail.lastNode();
    const effectiveChildren = node.getEffectiveChildren();
    let i;
    const instances = [];

    // base case, node has accessible content, but don't match the "root" node of this accessible instance
    if (node.hasPDOMContent && node !== this.node) {
      const potentialInstances = node.pdomInstances;
      instanceLoop:
      // eslint-disable-line no-labels
      for (i = 0; i < potentialInstances.length; i++) {
        const potentialInstance = potentialInstances[i];
        if (potentialInstance.parent !== this) {
          continue;
        }
        for (let j = 0; j < trail.length; j++) {
          if (trail.nodes[j] !== potentialInstance.trail.nodes[j + potentialInstance.trail.length - trail.length]) {
            continue instanceLoop; // eslint-disable-line no-labels
          }
        }

        instances.push(potentialInstance); // length will always be 1
      }

      assert && assert(instances.length <= 1, 'If we select more than one this way, we have problems');
    } else {
      for (i = 0; i < effectiveChildren.length; i++) {
        trail.addDescendant(effectiveChildren[i], i);
        Array.prototype.push.apply(instances, this.getChildOrdering(trail));
        trail.removeDescendant();
      }
    }
    return instances;
  }

  /**
   * Sort our child accessible instances in the order they should appear in the parallel DOM. We do this by
   * creating a comparison function between two accessible instances. The function walks along the trails
   * of the children, looking for specified accessible orders that would determine the ordering for the two
   * PDOMInstances.
   *
   * (scenery-internal)
   */
  sortChildren() {
    // It's simpler/faster to just grab our order directly with one recursion, rather than specifying a sorting
    // function (since a lot gets re-evaluated in that case).

    assert && assert(this.peer !== null, 'peer required for sort');
    let nodeForTrail;
    if (this.isRootInstance) {
      assert && assert(this.display !== null, 'Display should be available for the root');
      nodeForTrail = this.display.rootNode;
    } else {
      assert && assert(this.node !== null, 'Node should be defined, were we disposed?');
      nodeForTrail = this.node;
    }
    const targetChildren = this.getChildOrdering(new Trail(nodeForTrail));
    assert && assert(targetChildren.length === this.children.length, 'sorting should not change number of children');

    // {Array.<PDOMInstance>}
    this.children = targetChildren;

    // the DOMElement to add the child DOMElements to.
    const primarySibling = this.peer.primarySibling;

    // Ignore DAG for focused trail. We need to know if there is a focused child instance so that we can avoid
    // temporarily detaching the focused element from the DOM. See https://github.com/phetsims/my-solar-system/issues/142
    const focusedTrail = FocusManager.pdomFocusedNode?.pdomInstances[0]?.trail || null;

    // "i" will keep track of the "collapsed" index when all DOMElements for all PDOMInstance children are
    // added to a single parent DOMElement (this PDOMInstance's PDOMPeer's primarySibling)
    let i = primarySibling.childNodes.length - 1;
    const focusedChildInstance = focusedTrail && _.find(this.children, child => focusedTrail.containsNode(child.peer.node));
    if (focusedChildInstance) {
      // If there's a focused child instance, we need to make sure that its primarySibling is not detached from the DOM
      // (this has caused focus issues, see https://github.com/phetsims/my-solar-system/issues/142).
      // Since this doesn't happen often, we can just recompute the full order, and move every other element.

      const desiredOrder = _.flatten(this.children.map(child => child.peer.topLevelElements));
      const needsOrderChange = !_.every(desiredOrder, (desiredElement, index) => primarySibling.children[index] === desiredElement);
      if (needsOrderChange) {
        const pivotElement = focusedChildInstance.peer.getTopLevelElementContainingPrimarySibling();
        const pivotIndex = desiredOrder.indexOf(pivotElement);
        assert && assert(pivotIndex >= 0);

        // Insert all elements before the pivot element
        for (let j = 0; j < pivotIndex; j++) {
          primarySibling.insertBefore(desiredOrder[j], pivotElement);
        }

        // Insert all elements after the pivot element
        for (let j = pivotIndex + 1; j < desiredOrder.length; j++) {
          primarySibling.appendChild(desiredOrder[j]);
        }
      }
    } else {
      // Iterate through all PDOMInstance children
      for (let peerIndex = this.children.length - 1; peerIndex >= 0; peerIndex--) {
        const peer = this.children[peerIndex].peer;

        // Iterate through all top level elements of an PDOMInstance's peer
        for (let elementIndex = peer.topLevelElements.length - 1; elementIndex >= 0; elementIndex--) {
          const element = peer.topLevelElements[elementIndex];

          // Reorder DOM elements in a way that doesn't do any work if they are already in a sorted order.
          // No need to reinsert if `element` is already in the right order
          if (primarySibling.childNodes[i] !== element) {
            primarySibling.insertBefore(element, primarySibling.childNodes[i + 1]);
          }

          // Decrement so that it is easier to place elements using the browser's Node.insertBefore API
          i--;
        }
      }
    }
    if (assert) {
      const desiredOrder = _.flatten(this.children.map(child => child.peer.topLevelElements));

      // Verify the order
      assert(_.every(desiredOrder, (desiredElement, index) => primarySibling.children[index] === desiredElement));
    }
    if (UNIQUE_ID_STRATEGY === PDOMUniqueIdStrategy.INDICES) {
      // This kills performance if there are enough PDOMInstances
      this.updateDescendantPeerIds(this.children);
    }
  }

  /**
   * Create a new TransformTracker that will observe transforms along the trail of this PDOMInstance OR
   * the provided pdomTransformSourceNode. See ParallelDOM.setPDOMTransformSourceNode(). The The source Node
   * must not use DAG so that its trail is unique.
   */
  updateTransformTracker(pdomTransformSourceNode) {
    this.transformTracker && this.transformTracker.dispose();
    let trackedTrail = null;
    if (pdomTransformSourceNode) {
      trackedTrail = pdomTransformSourceNode.getUniqueTrail();
    } else {
      trackedTrail = PDOMInstance.guessVisualTrail(this.trail, this.display.rootNode);
    }
    this.transformTracker = new TransformTracker(trackedTrail);
  }

  /**
   * Depending on what the unique ID strategy is, formulate the correct id for this PDOM instance.
   */
  getPDOMInstanceUniqueId() {
    if (UNIQUE_ID_STRATEGY === PDOMUniqueIdStrategy.INDICES) {
      const indicesString = [];
      let pdomInstance = this; // eslint-disable-line consistent-this, @typescript-eslint/no-this-alias

      while (pdomInstance.parent) {
        const indexOf = pdomInstance.parent.children.indexOf(pdomInstance);
        if (indexOf === -1) {
          return 'STILL_BEING_CREATED' + dotRandom.nextDouble();
        }
        indicesString.unshift(indexOf);
        pdomInstance = pdomInstance.parent;
      }
      return indicesString.join(PDOMUtils.PDOM_UNIQUE_ID_SEPARATOR);
    } else {
      assert && assert(UNIQUE_ID_STRATEGY === PDOMUniqueIdStrategy.TRAIL_ID);
      return this.trail.getUniqueId();
    }
  }

  /**
   * Using indices requires updating whenever the PDOMInstance tree changes, so recursively update all descendant
   * ids from such a change. Update peer ids for provided instances and all descendants of provided instances.
   */
  updateDescendantPeerIds(pdomInstances) {
    assert && assert(UNIQUE_ID_STRATEGY === PDOMUniqueIdStrategy.INDICES, 'method should not be used with uniqueId comes from TRAIL_ID');
    const toUpdate = Array.from(pdomInstances);
    while (toUpdate.length > 0) {
      const pdomInstance = toUpdate.shift();
      pdomInstance.peer.updateIndicesStringAndElementIds();
      toUpdate.push(...pdomInstance.children);
    }
  }

  /**
   * @param display
   * @param uniqueId - value returned from PDOMInstance.getPDOMInstanceUniqueId()
   * @returns null if there is no path to the unique id provided.
   */
  static uniqueIdToTrail(display, uniqueId) {
    if (UNIQUE_ID_STRATEGY === PDOMUniqueIdStrategy.INDICES) {
      return display.getTrailFromPDOMIndicesString(uniqueId);
    } else {
      assert && assert(UNIQUE_ID_STRATEGY === PDOMUniqueIdStrategy.TRAIL_ID);
      return Trail.fromUniqueId(display.rootNode, uniqueId);
    }
  }

  /**
   * Recursive disposal, to make eligible for garbage collection.
   *
   * (scenery-internal)
   */
  dispose() {
    sceneryLog && sceneryLog.PDOMInstance && sceneryLog.PDOMInstance(`Disposing ${this.toString()}`);
    sceneryLog && sceneryLog.PDOMInstance && sceneryLog.push();
    assert && assert(!!this.peer, 'PDOMPeer required, were we already disposed?');
    const thisPeer = this.peer;

    // Disconnect DOM and remove listeners
    if (!this.isRootInstance) {
      // remove this peer's primary sibling DOM Element (or its container parent) from the parent peer's
      // primary sibling (or its child container)
      PDOMUtils.removeElements(this.parent.peer.primarySibling, thisPeer.topLevelElements);
      for (let i = 0; i < this.relativeNodes.length; i++) {
        this.relativeNodes[i].pdomDisplaysEmitter.removeListener(this.relativeListeners[i]);
      }
    }
    while (this.children.length) {
      this.children.pop().dispose();
    }

    // NOTE: We dispose OUR peer after disposing children, so our peer can be available for our children during
    // disposal.
    thisPeer.dispose();

    // dispose after the peer so the peer can remove any listeners from it
    this.transformTracker.dispose();
    this.transformTracker = null;

    // If we are the root accessible instance, we won't actually have a reference to a node.
    if (this.node) {
      this.node.removePDOMInstance(this);
    }
    this.relativeNodes = null;
    this.display = null;
    this.trail = null;
    this.node = null;
    this.peer = null;
    this.isDisposed = true;
    this.freeToPool();
    sceneryLog && sceneryLog.PDOMInstance && sceneryLog.pop();
  }

  /**
   * For debugging purposes.
   */
  toString() {
    return `${this.id}#{${this.trail.toString()}}`;
  }

  /**
   * For debugging purposes, inspect the tree of PDOMInstances from the root.
   *
   * Only ever called from the _rootPDOMInstance of the display.
   *
   * (scenery-internal)
   */
  auditRoot() {
    if (!assert) {
      return;
    }
    const rootNode = this.display.rootNode;
    assert(this.trail.length === 0, 'Should only call auditRoot() on the root PDOMInstance for a display');
    function audit(fakeInstance, pdomInstance) {
      assert && assert(fakeInstance.children.length === pdomInstance.children.length, 'Different number of children in accessible instance');
      assert && assert(fakeInstance.node === pdomInstance.node, 'Node mismatch for PDOMInstance');
      for (let i = 0; i < pdomInstance.children.length; i++) {
        audit(fakeInstance.children[i], pdomInstance.children[i]);
      }
      const isVisible = pdomInstance.isGloballyVisible();
      let shouldBeVisible = true;
      for (let i = 0; i < pdomInstance.trail.length; i++) {
        const node = pdomInstance.trail.nodes[i];
        const trails = node.getTrailsTo(rootNode).filter(trail => trail.isPDOMVisible());
        if (trails.length === 0) {
          shouldBeVisible = false;
          break;
        }
      }
      assert && assert(isVisible === shouldBeVisible, 'Instance visibility mismatch');
    }
    audit(PDOMInstance.createFakePDOMTree(rootNode), this);
  }

  /**
   * Since a "Trail" on PDOMInstance can have discontinuous jumps (due to pdomOrder), this finds the best
   * actual visual Trail to use, from the trail of an PDOMInstance to the root of a Display.
   *
   * @param trail - trail of the PDOMInstance, which can containe "gaps"
   * @param rootNode - root of a Display
   */
  static guessVisualTrail(trail, rootNode) {
    trail.reindex();

    // Search for places in the trail where adjacent nodes do NOT have a parent-child relationship, i.e.
    // !nodes[ n ].hasChild( nodes[ n + 1 ] ).
    // NOTE: This index points to the parent where this is the case, because the indices in the trail are such that:
    // trail.nodes[ n ].children[ trail.indices[ n ] ] = trail.nodes[ n + 1 ]
    const lastBadIndex = trail.indices.lastIndexOf(-1);

    // If we have no bad indices, just return our trail immediately.
    if (lastBadIndex < 0) {
      return trail;
    }
    const firstGoodIndex = lastBadIndex + 1;
    const firstGoodNode = trail.nodes[firstGoodIndex];
    const baseTrails = firstGoodNode.getTrailsTo(rootNode);

    // firstGoodNode might not be attached to a Display either! Maybe client just hasn't gotten to it yet, so we
    // fail gracefully-ish?
    // assert && assert( baseTrails.length > 0, '"good node" in trail with gap not attached to root')
    if (baseTrails.length === 0) {
      return trail;
    }

    // Add the rest of the trail back in
    const baseTrail = baseTrails[0];
    for (let i = firstGoodIndex + 1; i < trail.length; i++) {
      baseTrail.addDescendant(trail.nodes[i]);
    }
    assert && assert(baseTrail.isValid(), `trail not valid: ${trail.uniqueId}`);
    return baseTrail;
  }

  /**
   * Creates a fake PDOMInstance-like tree structure (with the equivalent nodes and children structure).
   * For debugging.
   *
   * @returns Type FakePDOMInstance: { node: {Node}, children: {Array.<FakePDOMInstance>} }
   */
  static createFakePDOMTree(rootNode) {
    function createFakeTree(node) {
      let fakeInstances = _.flatten(node.getEffectiveChildren().map(createFakeTree));
      if (node.hasPDOMContent) {
        fakeInstances = [{
          node: node,
          children: fakeInstances
        }];
      }
      return fakeInstances;
    }
    return {
      node: null,
      // @ts-expect-error
      children: createFakeTree(rootNode)
    };
  }
  freeToPool() {
    PDOMInstance.pool.freeToPool(this);
  }
  static pool = new Pool(PDOMInstance, {
    initialize: PDOMInstance.prototype.initializePDOMInstance
  });
}
scenery.register('PDOMInstance', PDOMInstance);
export default PDOMInstance;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJjbGVhbkFycmF5IiwiRW51bWVyYXRpb24iLCJFbnVtZXJhdGlvblZhbHVlIiwiUG9vbCIsIkZvY3VzTWFuYWdlciIsIk5vZGUiLCJQRE9NUGVlciIsIlBET01VdGlscyIsInNjZW5lcnkiLCJUcmFpbCIsIlRyYW5zZm9ybVRyYWNrZXIiLCJQRE9NVW5pcXVlSWRTdHJhdGVneSIsIklORElDRVMiLCJUUkFJTF9JRCIsImVudW1lcmF0aW9uIiwiVU5JUVVFX0lEX1NUUkFURUdZIiwiZ2xvYmFsSWQiLCJQRE9NSW5zdGFuY2UiLCJyZWxhdGl2ZU5vZGVzIiwicmVsYXRpdmVWaXNpYmlsaXRpZXMiLCJyZWxhdGl2ZUxpc3RlbmVycyIsInRyYW5zZm9ybVRyYWNrZXIiLCJjb25zdHJ1Y3RvciIsInBhcmVudCIsImRpc3BsYXkiLCJ0cmFpbCIsImluaXRpYWxpemVQRE9NSW5zdGFuY2UiLCJhc3NlcnQiLCJpZCIsImlzRGlzcG9zZWQiLCJpc1Jvb3RJbnN0YW5jZSIsIm5vZGUiLCJsYXN0Tm9kZSIsImNoaWxkcmVuIiwiYWRkUERPTUluc3RhbmNlIiwiaW52aXNpYmxlQ291bnQiLCJ1cGRhdGVUcmFuc2Zvcm1UcmFja2VyIiwicGRvbVRyYW5zZm9ybVNvdXJjZU5vZGUiLCJhY2Nlc3NpYmlsaXR5Q29udGFpbmVyIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwicGVlciIsImNyZWF0ZUZyb21Qb29sIiwicHJpbWFyeVNpYmxpbmciLCJ1cGRhdGUiLCJwYXJlbnRUcmFpbCIsImkiLCJsZW5ndGgiLCJyZWxhdGl2ZU5vZGUiLCJub2RlcyIsInB1c2giLCJwZG9tRGlzcGxheXMiLCJfcGRvbURpc3BsYXlzSW5mbyIsImlzVmlzaWJsZSIsIl8iLCJpbmNsdWRlcyIsImxpc3RlbmVyIiwiY2hlY2tBY2Nlc3NpYmxlRGlzcGxheVZpc2liaWxpdHkiLCJiaW5kIiwicGRvbURpc3BsYXlzRW1pdHRlciIsImFkZExpc3RlbmVyIiwidXBkYXRlVmlzaWJpbGl0eSIsInNjZW5lcnlMb2ciLCJ0b1N0cmluZyIsImFkZENvbnNlY3V0aXZlSW5zdGFuY2VzIiwicGRvbUluc3RhbmNlcyIsIm1hcCIsImluc3QiLCJqb2luIiwiaGFkQ2hpbGRyZW4iLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiaW5zZXJ0RWxlbWVudHMiLCJ0b3BMZXZlbEVsZW1lbnRzIiwic29ydENoaWxkcmVuIiwiaW5uZXJDb250ZW50IiwidXBkYXRlRGVzY2VuZGFudFBlZXJJZHMiLCJwb3AiLCJyZW1vdmVJbnN0YW5jZXNGb3JUcmFpbCIsImNoaWxkSW5zdGFuY2UiLCJjaGlsZFRyYWlsIiwiZGlmZmVycyIsImoiLCJzcGxpY2UiLCJkaXNwb3NlIiwicmVtb3ZlQWxsQ2hpbGRyZW4iLCJmaW5kQ2hpbGRXaXRoVHJhaWwiLCJjaGlsZCIsImVxdWFscyIsInJlbW92ZVN1YnRyZWUiLCJpc0V4dGVuc2lvbk9mIiwiaW5kZXgiLCJpc05vZGVWaXNpYmxlIiwid2FzTm9kZVZpc2libGUiLCJ3YXNWaXNpYmxlIiwic2V0VmlzaWJsZSIsInBkb21Gb2N1c2VkTm9kZSIsImNvbnRhaW5zTm9kZSIsInBkb21Gb2N1cyIsImlzR2xvYmFsbHlWaXNpYmxlIiwiZ2V0Q2hpbGRPcmRlcmluZyIsImVmZmVjdGl2ZUNoaWxkcmVuIiwiZ2V0RWZmZWN0aXZlQ2hpbGRyZW4iLCJpbnN0YW5jZXMiLCJoYXNQRE9NQ29udGVudCIsInBvdGVudGlhbEluc3RhbmNlcyIsImluc3RhbmNlTG9vcCIsInBvdGVudGlhbEluc3RhbmNlIiwiYWRkRGVzY2VuZGFudCIsInJlbW92ZURlc2NlbmRhbnQiLCJub2RlRm9yVHJhaWwiLCJyb290Tm9kZSIsInRhcmdldENoaWxkcmVuIiwiZm9jdXNlZFRyYWlsIiwiY2hpbGROb2RlcyIsImZvY3VzZWRDaGlsZEluc3RhbmNlIiwiZmluZCIsImRlc2lyZWRPcmRlciIsImZsYXR0ZW4iLCJuZWVkc09yZGVyQ2hhbmdlIiwiZXZlcnkiLCJkZXNpcmVkRWxlbWVudCIsInBpdm90RWxlbWVudCIsImdldFRvcExldmVsRWxlbWVudENvbnRhaW5pbmdQcmltYXJ5U2libGluZyIsInBpdm90SW5kZXgiLCJpbmRleE9mIiwiaW5zZXJ0QmVmb3JlIiwiYXBwZW5kQ2hpbGQiLCJwZWVySW5kZXgiLCJlbGVtZW50SW5kZXgiLCJlbGVtZW50IiwidHJhY2tlZFRyYWlsIiwiZ2V0VW5pcXVlVHJhaWwiLCJndWVzc1Zpc3VhbFRyYWlsIiwiZ2V0UERPTUluc3RhbmNlVW5pcXVlSWQiLCJpbmRpY2VzU3RyaW5nIiwicGRvbUluc3RhbmNlIiwibmV4dERvdWJsZSIsInVuc2hpZnQiLCJQRE9NX1VOSVFVRV9JRF9TRVBBUkFUT1IiLCJnZXRVbmlxdWVJZCIsInRvVXBkYXRlIiwiZnJvbSIsInNoaWZ0IiwidXBkYXRlSW5kaWNlc1N0cmluZ0FuZEVsZW1lbnRJZHMiLCJ1bmlxdWVJZFRvVHJhaWwiLCJ1bmlxdWVJZCIsImdldFRyYWlsRnJvbVBET01JbmRpY2VzU3RyaW5nIiwiZnJvbVVuaXF1ZUlkIiwidGhpc1BlZXIiLCJyZW1vdmVFbGVtZW50cyIsInJlbW92ZUxpc3RlbmVyIiwicmVtb3ZlUERPTUluc3RhbmNlIiwiZnJlZVRvUG9vbCIsImF1ZGl0Um9vdCIsImF1ZGl0IiwiZmFrZUluc3RhbmNlIiwic2hvdWxkQmVWaXNpYmxlIiwidHJhaWxzIiwiZ2V0VHJhaWxzVG8iLCJmaWx0ZXIiLCJpc1BET01WaXNpYmxlIiwiY3JlYXRlRmFrZVBET01UcmVlIiwicmVpbmRleCIsImxhc3RCYWRJbmRleCIsImluZGljZXMiLCJsYXN0SW5kZXhPZiIsImZpcnN0R29vZEluZGV4IiwiZmlyc3RHb29kTm9kZSIsImJhc2VUcmFpbHMiLCJiYXNlVHJhaWwiLCJpc1ZhbGlkIiwiY3JlYXRlRmFrZVRyZWUiLCJmYWtlSW5zdGFuY2VzIiwicG9vbCIsImluaXRpYWxpemUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBET01JbnN0YW5jZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBbiBpbnN0YW5jZSB0aGF0IGlzIHN5bmNocm9ub3VzbHkgY3JlYXRlZCwgZm9yIGhhbmRsaW5nIGFjY2Vzc2liaWxpdHkgbmVlZHMuXHJcbiAqXHJcbiAqIENvbnNpZGVyIHRoZSBmb2xsb3dpbmcgZXhhbXBsZTpcclxuICpcclxuICogV2UgaGF2ZSBhIG5vZGUgc3RydWN0dXJlOlxyXG4gKiBBXHJcbiAqICBCICggYWNjZXNzaWJsZSApXHJcbiAqICAgIEMgKGFjY2Vzc2libGUgKVxyXG4gKiAgICAgIERcclxuICogICAgICAgIEUgKGFjY2Vzc2libGUpXHJcbiAqICAgICAgICAgRyAoYWNjZXNzaWJsZSlcclxuICogICAgICAgIEZcclxuICogICAgICAgICAgSCAoYWNjZXNzaWJsZSlcclxuICpcclxuICpcclxuICogV2hpY2ggaGFzIGFuIGVxdWl2YWxlbnQgYWNjZXNzaWJsZSBpbnN0YW5jZSB0cmVlOlxyXG4gKiByb290XHJcbiAqICBBQlxyXG4gKiAgICBBQkNcclxuICogICAgICBBQkNERVxyXG4gKiAgICAgICAgQUJDREVHXHJcbiAqICAgICAgQUJDREZIXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb24uanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25WYWx1ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25WYWx1ZS5qcyc7XHJcbmltcG9ydCBQb29sIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sLmpzJztcclxuaW1wb3J0IHsgRGlzcGxheSwgRm9jdXNNYW5hZ2VyLCBOb2RlLCBQRE9NUGVlciwgUERPTVV0aWxzLCBzY2VuZXJ5LCBUcmFpbCwgVHJhbnNmb3JtVHJhY2tlciB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xyXG5cclxuLy8gUERPTUluc3RhbmNlcyBzdXBwb3J0IHR3byBkaWZmZXJlbnQgc3R5bGVzIG9mIHVuaXF1ZSBJRHMsIGVhY2ggd2l0aCB0aGVpciBvd24gdHJhZGVvZmZzLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTg1MVxyXG5jbGFzcyBQRE9NVW5pcXVlSWRTdHJhdGVneSBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWUge1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSU5ESUNFUyA9IG5ldyBQRE9NVW5pcXVlSWRTdHJhdGVneSgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVFJBSUxfSUQgPSBuZXcgUERPTVVuaXF1ZUlkU3RyYXRlZ3koKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBlbnVtZXJhdGlvbiA9IG5ldyBFbnVtZXJhdGlvbiggUERPTVVuaXF1ZUlkU3RyYXRlZ3kgKTtcclxufVxyXG5cclxuLy8gQSB0eXBlIHJlcHJlc2VudGluZyBhIGZha2UgaW5zdGFuY2UsIGZvciBzb21lIGFnZ3Jlc3NpdmUgYXVkaXRpbmcgKHVuZGVyID9hc3NlcnRzbG93KVxyXG50eXBlIEZha2VJbnN0YW5jZSA9IHtcclxuICBub2RlOiBOb2RlIHwgbnVsbDtcclxuICBjaGlsZHJlbjogRmFrZUluc3RhbmNlW107XHJcbn07XHJcblxyXG4vLyBUaGlzIGNvbnN0YW50IGlzIHNldCB1cCB0byBhbGxvdyB1cyB0byBjaGFuZ2Ugb3VyIHVuaXF1ZSBpZCBzdHJhdGVneS4gQm90aCBzdHJhdGVnaWVzIGhhdmUgdHJhZGUtb2ZmcyB0aGF0IGFyZVxyXG4vLyBkZXNjcmliZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE4NDcjaXNzdWVjb21tZW50LTEwNjgzNzczMzYuIFRSQUlMX0lEIGlzIG91ciBwYXRoIGZvcndhcmRcclxuLy8gY3VycmVudGx5LCBidXQgd2lsbCBicmVhayBQaEVULWlPIHBsYXliYWNrIGlmIGFueSBOb2RlcyBhcmUgY3JlYXRlZCBpbiB0aGUgcmVjb3JkZWQgc2ltIE9SIHBsYXliYWNrIHNpbSBidXQgbm90XHJcbi8vIGJvdGguIEZ1cnRoZXIgaW5mb3JtYXRpb24gaW4gdGhlIGFib3ZlIGlzc3VlIGFuZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTg1MS5cclxuY29uc3QgVU5JUVVFX0lEX1NUUkFURUdZID0gUERPTVVuaXF1ZUlkU3RyYXRlZ3kuVFJBSUxfSUQ7XHJcblxyXG5sZXQgZ2xvYmFsSWQgPSAxO1xyXG5cclxuY2xhc3MgUERPTUluc3RhbmNlIHtcclxuXHJcbiAgLy8gdW5pcXVlIElEXHJcbiAgcHJpdmF0ZSBpZCE6IG51bWJlcjtcclxuXHJcbiAgcHVibGljIHBhcmVudCE6IFBET01JbnN0YW5jZSB8IG51bGw7XHJcblxyXG4gIC8vIHtEaXNwbGF5fVxyXG4gIHByaXZhdGUgZGlzcGxheSE6IERpc3BsYXkgfCBudWxsO1xyXG5cclxuICBwdWJsaWMgdHJhaWwhOiBUcmFpbCB8IG51bGw7XHJcbiAgcHVibGljIGlzUm9vdEluc3RhbmNlITogYm9vbGVhbjtcclxuICBwdWJsaWMgbm9kZSE6IE5vZGUgfCBudWxsO1xyXG4gIHB1YmxpYyBjaGlsZHJlbiE6IFBET01JbnN0YW5jZVtdO1xyXG4gIHB1YmxpYyBwZWVyITogUERPTVBlZXIgfCBudWxsO1xyXG5cclxuICAvLyB7bnVtYmVyfSAtIFRoZSBudW1iZXIgb2Ygbm9kZXMgaW4gb3VyIHRyYWlsIHRoYXQgYXJlIE5PVCBpbiBvdXIgcGFyZW50J3MgdHJhaWwgYW5kIGRvIE5PVCBoYXZlIG91clxyXG4gIC8vIGRpc3BsYXkgaW4gdGhlaXIgcGRvbURpc3BsYXlzLiBGb3Igbm9uLXJvb3QgaW5zdGFuY2VzLCB0aGlzIGlzIGluaXRpYWxpemVkIGxhdGVyIGluIHRoZSBjb25zdHJ1Y3Rvci5cclxuICBwcml2YXRlIGludmlzaWJsZUNvdW50ITogbnVtYmVyO1xyXG5cclxuICAvLyB7QXJyYXkuPE5vZGU+fSAtIE5vZGVzIHRoYXQgYXJlIGluIG91ciB0cmFpbCAoYnV0IG5vdCB0aG9zZSBvZiBvdXIgcGFyZW50KVxyXG4gIHByaXZhdGUgcmVsYXRpdmVOb2RlczogTm9kZVtdIHwgbnVsbCA9IFtdO1xyXG5cclxuICAvLyB7QXJyYXkuPGJvb2xlYW4+fSAtIFdoZXRoZXIgb3VyIGRpc3BsYXkgaXMgaW4gdGhlIHJlc3BlY3RpdmUgcmVsYXRpdmVOb2RlcycgcGRvbURpc3BsYXlzXHJcbiAgcHJpdmF0ZSByZWxhdGl2ZVZpc2liaWxpdGllczogYm9vbGVhbltdID0gW107XHJcblxyXG4gIC8vIHtmdW5jdGlvbn0gLSBUaGUgbGlzdGVuZXJzIGFkZGVkIHRvIHRoZSByZXNwZWN0aXZlIHJlbGF0aXZlTm9kZXNcclxuICBwcml2YXRlIHJlbGF0aXZlTGlzdGVuZXJzOiAoICgpID0+IHZvaWQgKVtdID0gW107XHJcblxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKSB7VHJhbnNmb3JtVHJhY2tlcnxudWxsfSAtIFVzZWQgdG8gcXVpY2tseSBjb21wdXRlIHRoZSBnbG9iYWwgbWF0cml4IG9mIHRoaXNcclxuICAvLyBpbnN0YW5jZSdzIHRyYW5zZm9ybSBzb3VyY2UgTm9kZSBhbmQgb2JzZXJ2ZSB3aGVuIHRoZSB0cmFuc2Zvcm0gY2hhbmdlcy4gVXNlZCBieSBQRE9NUGVlciB0byB1cGRhdGVcclxuICAvLyBwb3NpdGlvbmluZyBvZiBzaWJsaW5nIGVsZW1lbnRzLiBCeSBkZWZhdWx0LCB3YXRjaGVzIHRoaXMgUERPTUluc3RhbmNlJ3MgdmlzdWFsIHRyYWlsLlxyXG4gIHB1YmxpYyB0cmFuc2Zvcm1UcmFja2VyOiBUcmFuc2Zvcm1UcmFja2VyIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8vIHtib29sZWFufSAtIFdoZXRoZXIgd2UgYXJlIGN1cnJlbnRseSBpbiBhIFwiZGlzcG9zZWRcIiAoaW4gdGhlIHBvb2wpIHN0YXRlLCBvciBhcmUgYXZhaWxhYmxlIHRvIGJlXHJcbiAgLy8gcmUtaW5pdGlhbGl6ZWRcclxuICBwcml2YXRlIGlzRGlzcG9zZWQhOiBib29sZWFuO1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3RvciBmb3IgUERPTUluc3RhbmNlLCB1c2VzIGFuIGluaXRpYWxpemUgbWV0aG9kIGZvciBwb29saW5nLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHBhcmVudCAtIHBhcmVudCBvZiB0aGlzIGluc3RhbmNlLCBudWxsIGlmIHJvb3Qgb2YgUERPTUluc3RhbmNlIHRyZWVcclxuICAgKiBAcGFyYW0gZGlzcGxheVxyXG4gICAqIEBwYXJhbSB0cmFpbCAtIHRyYWlsIHRvIHRoZSBub2RlIGZvciB0aGlzIFBET01JbnN0YW5jZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcGFyZW50OiBQRE9NSW5zdGFuY2UgfCBudWxsLCBkaXNwbGF5OiBEaXNwbGF5LCB0cmFpbDogVHJhaWwgKSB7XHJcbiAgICB0aGlzLmluaXRpYWxpemVQRE9NSW5zdGFuY2UoIHBhcmVudCwgZGlzcGxheSwgdHJhaWwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIGFuIFBET01JbnN0YW5jZSwgaW1wbGVtZW50cyBjb25zdHJ1Y3Rpb24gZm9yIHBvb2xpbmcuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGFyZW50IC0gbnVsbCBpZiB0aGlzIFBET01JbnN0YW5jZSBpcyByb290IG9mIFBET01JbnN0YW5jZSB0cmVlXHJcbiAgICogQHBhcmFtIGRpc3BsYXlcclxuICAgKiBAcGFyYW0gdHJhaWwgLSB0cmFpbCB0byBub2RlIGZvciB0aGlzIFBET01JbnN0YW5jZVxyXG4gICAqIEByZXR1cm5zIC0gUmV0dXJucyAndGhpcycgcmVmZXJlbmNlLCBmb3IgY2hhaW5pbmdcclxuICAgKi9cclxuICBwdWJsaWMgaW5pdGlhbGl6ZVBET01JbnN0YW5jZSggcGFyZW50OiBQRE9NSW5zdGFuY2UgfCBudWxsLCBkaXNwbGF5OiBEaXNwbGF5LCB0cmFpbDogVHJhaWwgKTogUERPTUluc3RhbmNlIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlkIHx8IHRoaXMuaXNEaXNwb3NlZCwgJ0lmIHdlIHByZXZpb3VzbHkgZXhpc3RlZCwgd2UgbmVlZCB0byBoYXZlIGJlZW4gZGlzcG9zZWQnICk7XHJcblxyXG4gICAgLy8gdW5pcXVlIElEXHJcbiAgICB0aGlzLmlkID0gdGhpcy5pZCB8fCBnbG9iYWxJZCsrO1xyXG5cclxuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xyXG5cclxuICAgIC8vIHtEaXNwbGF5fVxyXG4gICAgdGhpcy5kaXNwbGF5ID0gZGlzcGxheTtcclxuXHJcbiAgICAvLyB7VHJhaWx9XHJcbiAgICB0aGlzLnRyYWlsID0gdHJhaWw7XHJcblxyXG4gICAgLy8ge2Jvb2xlYW59XHJcbiAgICB0aGlzLmlzUm9vdEluc3RhbmNlID0gcGFyZW50ID09PSBudWxsO1xyXG5cclxuICAgIC8vIHtOb2RlfG51bGx9XHJcbiAgICB0aGlzLm5vZGUgPSB0aGlzLmlzUm9vdEluc3RhbmNlID8gbnVsbCA6IHRyYWlsLmxhc3ROb2RlKCk7XHJcblxyXG4gICAgLy8ge0FycmF5LjxQRE9NSW5zdGFuY2U+fVxyXG4gICAgdGhpcy5jaGlsZHJlbiA9IGNsZWFuQXJyYXkoIHRoaXMuY2hpbGRyZW4gKTtcclxuXHJcbiAgICAvLyBJZiB3ZSBhcmUgdGhlIHJvb3QgYWNjZXNzaWJsZSBpbnN0YW5jZSwgd2Ugd29uJ3QgYWN0dWFsbHkgaGF2ZSBhIHJlZmVyZW5jZSB0byBhIG5vZGUuXHJcbiAgICBpZiAoIHRoaXMubm9kZSApIHtcclxuICAgICAgdGhpcy5ub2RlLmFkZFBET01JbnN0YW5jZSggdGhpcyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHtudW1iZXJ9IC0gVGhlIG51bWJlciBvZiBub2RlcyBpbiBvdXIgdHJhaWwgdGhhdCBhcmUgTk9UIGluIG91ciBwYXJlbnQncyB0cmFpbCBhbmQgZG8gTk9UIGhhdmUgb3VyXHJcbiAgICAvLyBkaXNwbGF5IGluIHRoZWlyIHBkb21EaXNwbGF5cy4gRm9yIG5vbi1yb290IGluc3RhbmNlcywgdGhpcyBpcyBpbml0aWFsaXplZCBsYXRlciBpbiB0aGUgY29uc3RydWN0b3IuXHJcbiAgICB0aGlzLmludmlzaWJsZUNvdW50ID0gMDtcclxuXHJcbiAgICAvLyB7QXJyYXkuPE5vZGU+fSAtIE5vZGVzIHRoYXQgYXJlIGluIG91ciB0cmFpbCAoYnV0IG5vdCB0aG9zZSBvZiBvdXIgcGFyZW50KVxyXG4gICAgdGhpcy5yZWxhdGl2ZU5vZGVzID0gW107XHJcblxyXG4gICAgLy8ge0FycmF5Ljxib29sZWFuPn0gLSBXaGV0aGVyIG91ciBkaXNwbGF5IGlzIGluIHRoZSByZXNwZWN0aXZlIHJlbGF0aXZlTm9kZXMnIHBkb21EaXNwbGF5c1xyXG4gICAgdGhpcy5yZWxhdGl2ZVZpc2liaWxpdGllcyA9IFtdO1xyXG5cclxuICAgIC8vIHtmdW5jdGlvbn0gLSBUaGUgbGlzdGVuZXJzIGFkZGVkIHRvIHRoZSByZXNwZWN0aXZlIHJlbGF0aXZlTm9kZXNcclxuICAgIHRoaXMucmVsYXRpdmVMaXN0ZW5lcnMgPSBbXTtcclxuXHJcbiAgICAvLyAoc2NlbmVyeS1pbnRlcm5hbCkge1RyYW5zZm9ybVRyYWNrZXJ8bnVsbH0gLSBVc2VkIHRvIHF1aWNrbHkgY29tcHV0ZSB0aGUgZ2xvYmFsIG1hdHJpeCBvZiB0aGlzXHJcbiAgICAvLyBpbnN0YW5jZSdzIHRyYW5zZm9ybSBzb3VyY2UgTm9kZSBhbmQgb2JzZXJ2ZSB3aGVuIHRoZSB0cmFuc2Zvcm0gY2hhbmdlcy4gVXNlZCBieSBQRE9NUGVlciB0byB1cGRhdGVcclxuICAgIC8vIHBvc2l0aW9uaW5nIG9mIHNpYmxpbmcgZWxlbWVudHMuIEJ5IGRlZmF1bHQsIHdhdGNoZXMgdGhpcyBQRE9NSW5zdGFuY2UncyB2aXN1YWwgdHJhaWwuXHJcbiAgICB0aGlzLnRyYW5zZm9ybVRyYWNrZXIgPSBudWxsO1xyXG4gICAgdGhpcy51cGRhdGVUcmFuc2Zvcm1UcmFja2VyKCB0aGlzLm5vZGUgPyB0aGlzLm5vZGUucGRvbVRyYW5zZm9ybVNvdXJjZU5vZGUgOiBudWxsICk7XHJcblxyXG4gICAgLy8ge2Jvb2xlYW59IC0gV2hldGhlciB3ZSBhcmUgY3VycmVudGx5IGluIGEgXCJkaXNwb3NlZFwiIChpbiB0aGUgcG9vbCkgc3RhdGUsIG9yIGFyZSBhdmFpbGFibGUgdG8gYmVcclxuICAgIC8vIHJlLWluaXRpYWxpemVkXHJcbiAgICB0aGlzLmlzRGlzcG9zZWQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoIHRoaXMuaXNSb290SW5zdGFuY2UgKSB7XHJcbiAgICAgIGNvbnN0IGFjY2Vzc2liaWxpdHlDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xyXG5cclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFBvb2xhYmxlIGlzIGEgbWl4aW4gYW5kIFR5cGVTY3JpcHQgZG9lc24ndCBoYXZlIGdvb2QgbWl4aW4gc3VwcG9ydFxyXG4gICAgICB0aGlzLnBlZXIgPSBQRE9NUGVlci5jcmVhdGVGcm9tUG9vbCggdGhpcywge1xyXG4gICAgICAgIHByaW1hcnlTaWJsaW5nOiBhY2Nlc3NpYmlsaXR5Q29udGFpbmVyXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFBvb2xhYmxlIGEgbWl4aW4gYW5kIFR5cGVTY3JpcHQgZG9lc24ndCBoYXZlIGdvb2QgbWl4aW4gc3VwcG9ydFxyXG4gICAgICB0aGlzLnBlZXIgPSBQRE9NUGVlci5jcmVhdGVGcm9tUG9vbCggdGhpcyApO1xyXG5cclxuICAgICAgLy8gVGhlIHBlZXIgaXMgbm90IGZ1bGx5IGNvbnN0cnVjdGVkIHVudGlsIHRoaXMgdXBkYXRlIGZ1bmN0aW9uIGlzIGNhbGxlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84MzJcclxuICAgICAgLy8gVHJhaWwgSWRzIHdpbGwgbmV2ZXIgY2hhbmdlLCBzbyB1cGRhdGUgdGhlbSBlYWdlcmx5LCBhIHNpbmdsZSB0aW1lIGR1cmluZyBjb25zdHJ1Y3Rpb24uXHJcbiAgICAgIHRoaXMucGVlciEudXBkYXRlKCBVTklRVUVfSURfU1RSQVRFR1kgPT09IFBET01VbmlxdWVJZFN0cmF0ZWd5LlRSQUlMX0lEICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucGVlciEucHJpbWFyeVNpYmxpbmcsICdhY2Nlc3NpYmxlIHBlZXIgbXVzdCBoYXZlIGEgcHJpbWFyeVNpYmxpbmcgdXBvbiBjb21wbGV0aW9uIG9mIGNvbnN0cnVjdGlvbicgKTtcclxuXHJcbiAgICAgIC8vIFNjYW4gb3ZlciBhbGwgb2YgdGhlIG5vZGVzIGluIG91ciB0cmFpbCAodGhhdCBhcmUgTk9UIGluIG91ciBwYXJlbnQncyB0cmFpbCkgdG8gY2hlY2sgZm9yIHBkb21EaXNwbGF5c1xyXG4gICAgICAvLyBzbyB3ZSBjYW4gaW5pdGlhbGl6ZSBvdXIgaW52aXNpYmxlQ291bnQgYW5kIGFkZCBsaXN0ZW5lcnMuXHJcbiAgICAgIGNvbnN0IHBhcmVudFRyYWlsID0gdGhpcy5wYXJlbnQhLnRyYWlsITtcclxuICAgICAgZm9yICggbGV0IGkgPSBwYXJlbnRUcmFpbC5sZW5ndGg7IGkgPCB0cmFpbC5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCByZWxhdGl2ZU5vZGUgPSB0cmFpbC5ub2Rlc1sgaSBdO1xyXG4gICAgICAgIHRoaXMucmVsYXRpdmVOb2Rlcy5wdXNoKCByZWxhdGl2ZU5vZGUgKTtcclxuXHJcbiAgICAgICAgY29uc3QgcGRvbURpc3BsYXlzID0gcmVsYXRpdmVOb2RlLl9wZG9tRGlzcGxheXNJbmZvLnBkb21EaXNwbGF5cztcclxuICAgICAgICBjb25zdCBpc1Zpc2libGUgPSBfLmluY2x1ZGVzKCBwZG9tRGlzcGxheXMsIGRpc3BsYXkgKTtcclxuICAgICAgICB0aGlzLnJlbGF0aXZlVmlzaWJpbGl0aWVzLnB1c2goIGlzVmlzaWJsZSApO1xyXG4gICAgICAgIGlmICggIWlzVmlzaWJsZSApIHtcclxuICAgICAgICAgIHRoaXMuaW52aXNpYmxlQ291bnQrKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGxpc3RlbmVyID0gdGhpcy5jaGVja0FjY2Vzc2libGVEaXNwbGF5VmlzaWJpbGl0eS5iaW5kKCB0aGlzLCBpIC0gcGFyZW50VHJhaWwubGVuZ3RoICk7XHJcbiAgICAgICAgcmVsYXRpdmVOb2RlLnBkb21EaXNwbGF5c0VtaXR0ZXIuYWRkTGlzdGVuZXIoIGxpc3RlbmVyICk7XHJcbiAgICAgICAgdGhpcy5yZWxhdGl2ZUxpc3RlbmVycy5wdXNoKCBsaXN0ZW5lciApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVZpc2liaWxpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlKFxyXG4gICAgICBgSW5pdGlhbGl6ZWQgJHt0aGlzLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIHNlcmllcyBvZiAoc29ydGVkKSBhY2Nlc3NpYmxlIGluc3RhbmNlcyBhcyBjaGlsZHJlbi5cclxuICAgKi9cclxuICBwdWJsaWMgYWRkQ29uc2VjdXRpdmVJbnN0YW5jZXMoIHBkb21JbnN0YW5jZXM6IFBET01JbnN0YW5jZVtdICk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZShcclxuICAgICAgYGFkZENvbnNlY3V0aXZlSW5zdGFuY2VzIG9uICR7dGhpcy50b1N0cmluZygpfSB3aXRoOiAke3Bkb21JbnN0YW5jZXMubWFwKCBpbnN0ID0+IGluc3QudG9TdHJpbmcoKSApLmpvaW4oICcsJyApfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgY29uc3QgaGFkQ2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuLmxlbmd0aCA+IDA7XHJcblxyXG4gICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoIHRoaXMuY2hpbGRyZW4sIHBkb21JbnN0YW5jZXMgKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwZG9tSW5zdGFuY2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAvLyBBcHBlbmQgdGhlIGNvbnRhaW5lciBwYXJlbnQgdG8gdGhlIGVuZCAoc28gdGhhdCwgd2hlbiBwcm92aWRlZCBpbiBvcmRlciwgd2UgZG9uJ3QgaGF2ZSB0byByZXNvcnQgYmVsb3dcclxuICAgICAgLy8gd2hlbiBpbml0aWFsaXppbmcpLlxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhIXRoaXMucGVlciEucHJpbWFyeVNpYmxpbmcsICdQcmltYXJ5IHNpYmxpbmcgbXVzdCBiZSBkZWZpbmVkIHRvIGluc2VydCBlbGVtZW50cy4nICk7XHJcblxyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gd2hlbiBQRE9NUGVlciBpcyBjb252ZXJ0ZWQgdG8gVFMgdGhpcyB0cy1leHBlY3QtZXJyb3IgY2FuIHByb2JhYmx5IGJlIHJlbW92ZWRcclxuICAgICAgUERPTVV0aWxzLmluc2VydEVsZW1lbnRzKCB0aGlzLnBlZXIucHJpbWFyeVNpYmxpbmchLCBwZG9tSW5zdGFuY2VzWyBpIF0ucGVlci50b3BMZXZlbEVsZW1lbnRzICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBoYWRDaGlsZHJlbiApIHtcclxuICAgICAgdGhpcy5zb3J0Q2hpbGRyZW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGFzc2VydCAmJiB0aGlzLm5vZGUgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubm9kZSBpbnN0YW5jZW9mIE5vZGUgKTtcclxuXHJcbiAgICAgIC8vIElmIHlvdSBoaXQgdGhpcyB3aGVuIG11dGF0aW5nIGJvdGggY2hpbGRyZW4gYW5kIGlubmVyQ29udGVudCBhdCB0aGUgc2FtZSB0aW1lLCBpdCBpcyBhbiBpc3N1ZSB3aXRoIHNjZW5lcnksXHJcbiAgICAgIC8vIHJlbW92ZSBvbmNlIGluIGEgc2luZ2xlIHN0ZXAgYW5kIHRoZSBhZGQgdGhlIG90aGVyIGluIHRoZSBuZXh0IHN0ZXAuXHJcbiAgICAgIHRoaXMuY2hpbGRyZW4ubGVuZ3RoID4gMCAmJiBhc3NlcnQoICF0aGlzLm5vZGUuaW5uZXJDb250ZW50LFxyXG4gICAgICAgIGAke3RoaXMuY2hpbGRyZW4ubGVuZ3RofSBjaGlsZCBQRE9NSW5zdGFuY2VzIHByZXNlbnQgYnV0IHRoaXMgbm9kZSBoYXMgaW5uZXJDb250ZW50OiAke3RoaXMubm9kZS5pbm5lckNvbnRlbnR9YCApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggVU5JUVVFX0lEX1NUUkFURUdZID09PSBQRE9NVW5pcXVlSWRTdHJhdGVneS5JTkRJQ0VTICkge1xyXG5cclxuICAgICAgLy8gVGhpcyBraWxscyBwZXJmb3JtYW5jZSBpZiB0aGVyZSBhcmUgZW5vdWdoIFBET01JbnN0YW5jZXNcclxuICAgICAgdGhpcy51cGRhdGVEZXNjZW5kYW50UGVlcklkcyggcGRvbUluc3RhbmNlcyApO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYW55IGNoaWxkIGluc3RhbmNlcyB0aGF0IGFyZSBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgdHJhaWwuXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZUluc3RhbmNlc0ZvclRyYWlsKCB0cmFpbDogVHJhaWwgKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlKFxyXG4gICAgICBgcmVtb3ZlSW5zdGFuY2VzRm9yVHJhaWwgb24gJHt0aGlzLnRvU3RyaW5nKCl9IHdpdGggdHJhaWwgJHt0cmFpbC50b1N0cmluZygpfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgY2hpbGRJbnN0YW5jZSA9IHRoaXMuY2hpbGRyZW5bIGkgXTtcclxuICAgICAgY29uc3QgY2hpbGRUcmFpbCA9IGNoaWxkSW5zdGFuY2UudHJhaWw7XHJcblxyXG4gICAgICAvLyBOb3Qgd29ydGggaXQgdG8gaW5zcGVjdCBiZWZvcmUgb3VyIHRyYWlsIGVuZHMsIHNpbmNlIGl0IHNob3VsZCBiZSAoISkgZ3VhcmFudGVlZCB0byBiZSBlcXVhbFxyXG4gICAgICBsZXQgZGlmZmVycyA9IGNoaWxkVHJhaWwhLmxlbmd0aCA8IHRyYWlsLmxlbmd0aDtcclxuICAgICAgaWYgKCAhZGlmZmVycyApIHtcclxuICAgICAgICBmb3IgKCBsZXQgaiA9IHRoaXMudHJhaWwhLmxlbmd0aDsgaiA8IHRyYWlsLmxlbmd0aDsgaisrICkge1xyXG4gICAgICAgICAgaWYgKCB0cmFpbC5ub2Rlc1sgaiBdICE9PSBjaGlsZFRyYWlsIS5ub2Rlc1sgaiBdICkge1xyXG4gICAgICAgICAgICBkaWZmZXJzID0gdHJ1ZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoICFkaWZmZXJzICkge1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKCBpLCAxICk7XHJcbiAgICAgICAgY2hpbGRJbnN0YW5jZS5kaXNwb3NlKCk7XHJcbiAgICAgICAgaSAtPSAxO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhbGwgb2YgdGhlIGNoaWxkcmVuLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVBbGxDaGlsZHJlbigpOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5QRE9NSW5zdGFuY2UoIGByZW1vdmVBbGxDaGlsZHJlbiBvbiAke3RoaXMudG9TdHJpbmcoKX1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIHdoaWxlICggdGhpcy5jaGlsZHJlbi5sZW5ndGggKSB7XHJcbiAgICAgIHRoaXMuY2hpbGRyZW4ucG9wKCkhLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIFBET01JbnN0YW5jZSBjaGlsZCAoaWYgb25lIGV4aXN0cyB3aXRoIHRoZSBnaXZlbiBUcmFpbCksIG9yIG51bGwgb3RoZXJ3aXNlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBmaW5kQ2hpbGRXaXRoVHJhaWwoIHRyYWlsOiBUcmFpbCApOiBQRE9NSW5zdGFuY2UgfCBudWxsIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGNoaWxkID0gdGhpcy5jaGlsZHJlblsgaSBdO1xyXG4gICAgICBpZiAoIGNoaWxkLnRyYWlsIS5lcXVhbHMoIHRyYWlsICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIGNoaWxkO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBhIHN1YnRyZWUgb2YgUERPTUluc3RhbmNlcyBmcm9tIHRoaXMgUERPTUluc3RhbmNlXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdHJhaWwgLSBjaGlsZHJlbiBvZiB0aGlzIFBET01JbnN0YW5jZSB3aWxsIGJlIHJlbW92ZWQgaWYgdGhlIGNoaWxkIHRyYWlscyBhcmUgZXh0ZW5zaW9uc1xyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgb2YgdGhlIHRyYWlsLlxyXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVTdWJ0cmVlKCB0cmFpbDogVHJhaWwgKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlKFxyXG4gICAgICBgcmVtb3ZlU3VidHJlZSBvbiAke3RoaXMudG9TdHJpbmcoKX0gd2l0aCB0cmFpbCAke3RyYWlsLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgIGNvbnN0IGNoaWxkSW5zdGFuY2UgPSB0aGlzLmNoaWxkcmVuWyBpIF07XHJcbiAgICAgIGlmICggY2hpbGRJbnN0YW5jZS50cmFpbCEuaXNFeHRlbnNpb25PZiggdHJhaWwsIHRydWUgKSApIHtcclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlKFxyXG4gICAgICAgICAgYFJlbW92ZSBwYXJlbnQ6ICR7dGhpcy50b1N0cmluZygpfSwgY2hpbGQ6ICR7Y2hpbGRJbnN0YW5jZS50b1N0cmluZygpfWAgKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLnNwbGljZSggaSwgMSApOyAvLyByZW1vdmUgaXQgZnJvbSB0aGUgY2hpbGRyZW4gYXJyYXlcclxuXHJcbiAgICAgICAgLy8gRGlzcG9zZSB0aGUgZW50aXJlIHN1YnRyZWUgb2YgUERPTUluc3RhbmNlc1xyXG4gICAgICAgIGNoaWxkSW5zdGFuY2UuZGlzcG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIHRvIHNlZSB3aGV0aGVyIG91ciB2aXNpYmlsaXR5IG5lZWRzIGFuIHVwZGF0ZSBiYXNlZCBvbiBhbiBwZG9tRGlzcGxheXMgY2hhbmdlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGluZGV4IC0gSW5kZXggaW50byB0aGUgcmVsYXRpdmVOb2RlcyBhcnJheSAod2hpY2ggbm9kZSBoYWQgdGhlIG5vdGlmaWNhdGlvbilcclxuICAgKi9cclxuICBwcml2YXRlIGNoZWNrQWNjZXNzaWJsZURpc3BsYXlWaXNpYmlsaXR5KCBpbmRleDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgY29uc3QgaXNOb2RlVmlzaWJsZSA9IF8uaW5jbHVkZXMoIHRoaXMucmVsYXRpdmVOb2RlcyFbIGluZGV4IF0uX3Bkb21EaXNwbGF5c0luZm8ucGRvbURpc3BsYXlzLCB0aGlzLmRpc3BsYXkgKTtcclxuICAgIGNvbnN0IHdhc05vZGVWaXNpYmxlID0gdGhpcy5yZWxhdGl2ZVZpc2liaWxpdGllc1sgaW5kZXggXTtcclxuXHJcbiAgICBpZiAoIGlzTm9kZVZpc2libGUgIT09IHdhc05vZGVWaXNpYmxlICkge1xyXG4gICAgICB0aGlzLnJlbGF0aXZlVmlzaWJpbGl0aWVzWyBpbmRleCBdID0gaXNOb2RlVmlzaWJsZTtcclxuXHJcbiAgICAgIGNvbnN0IHdhc1Zpc2libGUgPSB0aGlzLmludmlzaWJsZUNvdW50ID09PSAwO1xyXG5cclxuICAgICAgdGhpcy5pbnZpc2libGVDb3VudCArPSAoIGlzTm9kZVZpc2libGUgPyAtMSA6IDEgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pbnZpc2libGVDb3VudCA+PSAwICYmIHRoaXMuaW52aXNpYmxlQ291bnQgPD0gdGhpcy5yZWxhdGl2ZU5vZGVzIS5sZW5ndGggKTtcclxuXHJcbiAgICAgIGNvbnN0IGlzVmlzaWJsZSA9IHRoaXMuaW52aXNpYmxlQ291bnQgPT09IDA7XHJcblxyXG4gICAgICBpZiAoIGlzVmlzaWJsZSAhPT0gd2FzVmlzaWJsZSApIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpc2liaWxpdHkoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHZpc2liaWxpdHkgb2YgdGhpcyBwZWVyJ3MgYWNjZXNzaWJsZSBET00gY29udGVudC4gVGhlIGhpZGRlbiBhdHRyaWJ1dGUgd2lsbCBoaWRlIGFsbCBvZiB0aGUgZGVzY2VuZGFudFxyXG4gICAqIERPTSBjb250ZW50LCBzbyBpdCBpcyBub3QgbmVjZXNzYXJ5IHRvIHVwZGF0ZSB0aGUgc3VidHJlZSBvZiBQRE9NSW5zdGFuY2VzIHNpbmNlIHRoZSBicm93c2VyXHJcbiAgICogd2lsbCBkbyB0aGlzIGZvciB1cy5cclxuICAgKi9cclxuICBwcml2YXRlIHVwZGF0ZVZpc2liaWxpdHkoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhIXRoaXMucGVlciwgJ1BlZXIgbmVlZHMgdG8gYmUgYXZhaWxhYmxlIG9uIHVwZGF0ZSB2aXNpYmlsaXR5LicgKTtcclxuICAgIHRoaXMucGVlciEuc2V0VmlzaWJsZSggdGhpcy5pbnZpc2libGVDb3VudCA8PSAwICk7XHJcblxyXG4gICAgLy8gaWYgd2UgaGlkIGEgcGFyZW50IGVsZW1lbnQsIGJsdXIgZm9jdXMgaWYgYWN0aXZlIGVsZW1lbnQgd2FzIGFuIGFuY2VzdG9yXHJcbiAgICBpZiAoICF0aGlzLnBlZXIhLmlzVmlzaWJsZSgpICYmIEZvY3VzTWFuYWdlci5wZG9tRm9jdXNlZE5vZGUgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIEZvY3VzTWFuYWdlci5wZG9tRm9jdXNlZE5vZGUucGRvbUluc3RhbmNlcy5sZW5ndGggPT09IDEsXHJcbiAgICAgICAgJ2ZvY3VzYWJsZSBOb2RlcyBkbyBub3Qgc3VwcG9ydCBEQUcsIGFuZCBzaG91bGQgYmUgY29ubmVjdGVkIHdpdGggYW4gaW5zdGFuY2UgaWYgZm9jdXNlZC4nICk7XHJcblxyXG4gICAgICAvLyBOT1RFOiBXZSBkb24ndCBzZWVtIHRvIGJlIGFibGUgdG8gaW1wb3J0IG5vcm1hbGx5IGhlcmVcclxuICAgICAgaWYgKCBGb2N1c01hbmFnZXIucGRvbUZvY3VzZWROb2RlLnBkb21JbnN0YW5jZXNbIDAgXS50cmFpbCEuY29udGFpbnNOb2RlKCB0aGlzLm5vZGUhICkgKSB7XHJcbiAgICAgICAgRm9jdXNNYW5hZ2VyLnBkb21Gb2N1cyA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgcGFyYWxsZWwgRE9NIGZvciB0aGlzIGluc3RhbmNlIGFuZCBpdHMgYW5jZXN0b3JzIGFyZSBub3QgaGlkZGVuLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc0dsb2JhbGx5VmlzaWJsZSgpOiBib29sZWFuIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICEhdGhpcy5wZWVyLCAnUERPTVBlZXIgbmVlZHMgdG8gYmUgYXZhaWxhYmxlLCBoYXMgdGhpcyBQRE9NSW5zdGFuY2UgYmVlbiBkaXNwb3NlZD8nICk7XHJcblxyXG4gICAgLy8gSWYgdGhpcyBwZWVyIGlzIGhpZGRlbiwgdGhlbiByZXR1cm4gYmVjYXVzZSB0aGF0IGF0dHJpYnV0ZSB3aWxsIGJ1YmJsZSBkb3duIHRvIGNoaWxkcmVuLFxyXG4gICAgLy8gb3RoZXJ3aXNlIHJlY3Vyc2UgdG8gcGFyZW50LlxyXG4gICAgaWYgKCAhdGhpcy5wZWVyIS5pc1Zpc2libGUoKSApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMucGFyZW50ICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnQuaXNHbG9iYWxseVZpc2libGUoKTtcclxuICAgIH1cclxuICAgIGVsc2UgeyAvLyBiYXNlIGNhc2UgYXQgcm9vdFxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hhdCBvdXIgbGlzdCBvZiBjaGlsZHJlbiAoYWZ0ZXIgc29ydGluZykgc2hvdWxkIGJlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHRyYWlsIC0gQSBwYXJ0aWFsIHRyYWlsLCB3aGVyZSB0aGUgcm9vdCBvZiB0aGUgdHJhaWwgaXMgZWl0aGVyIHRoaXMubm9kZSBvciB0aGUgZGlzcGxheSdzIHJvb3RcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUgKGlmIHdlIGFyZSB0aGUgcm9vdCBQRE9NSW5zdGFuY2UpXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRDaGlsZE9yZGVyaW5nKCB0cmFpbDogVHJhaWwgKTogUERPTUluc3RhbmNlW10ge1xyXG4gICAgY29uc3Qgbm9kZSA9IHRyYWlsLmxhc3ROb2RlKCk7XHJcbiAgICBjb25zdCBlZmZlY3RpdmVDaGlsZHJlbiA9IG5vZGUuZ2V0RWZmZWN0aXZlQ2hpbGRyZW4oKTtcclxuICAgIGxldCBpO1xyXG4gICAgY29uc3QgaW5zdGFuY2VzOiBQRE9NSW5zdGFuY2VbXSA9IFtdO1xyXG5cclxuICAgIC8vIGJhc2UgY2FzZSwgbm9kZSBoYXMgYWNjZXNzaWJsZSBjb250ZW50LCBidXQgZG9uJ3QgbWF0Y2ggdGhlIFwicm9vdFwiIG5vZGUgb2YgdGhpcyBhY2Nlc3NpYmxlIGluc3RhbmNlXHJcbiAgICBpZiAoIG5vZGUuaGFzUERPTUNvbnRlbnQgJiYgbm9kZSAhPT0gdGhpcy5ub2RlICkge1xyXG4gICAgICBjb25zdCBwb3RlbnRpYWxJbnN0YW5jZXMgPSBub2RlLnBkb21JbnN0YW5jZXM7XHJcblxyXG4gICAgICBpbnN0YW5jZUxvb3A6IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbGFiZWxzXHJcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBwb3RlbnRpYWxJbnN0YW5jZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgICBjb25zdCBwb3RlbnRpYWxJbnN0YW5jZSA9IHBvdGVudGlhbEluc3RhbmNlc1sgaSBdO1xyXG4gICAgICAgICAgaWYgKCBwb3RlbnRpYWxJbnN0YW5jZS5wYXJlbnQgIT09IHRoaXMgKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRyYWlsLmxlbmd0aDsgaisrICkge1xyXG4gICAgICAgICAgICBpZiAoIHRyYWlsLm5vZGVzWyBqIF0gIT09IHBvdGVudGlhbEluc3RhbmNlLnRyYWlsIS5ub2Rlc1sgaiArIHBvdGVudGlhbEluc3RhbmNlLnRyYWlsIS5sZW5ndGggLSB0cmFpbC5sZW5ndGggXSApIHtcclxuICAgICAgICAgICAgICBjb250aW51ZSBpbnN0YW5jZUxvb3A7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbGFiZWxzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpbnN0YW5jZXMucHVzaCggcG90ZW50aWFsSW5zdGFuY2UgKTsgLy8gbGVuZ3RoIHdpbGwgYWx3YXlzIGJlIDFcclxuICAgICAgICB9XHJcblxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbnN0YW5jZXMubGVuZ3RoIDw9IDEsICdJZiB3ZSBzZWxlY3QgbW9yZSB0aGFuIG9uZSB0aGlzIHdheSwgd2UgaGF2ZSBwcm9ibGVtcycgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBmb3IgKCBpID0gMDsgaSA8IGVmZmVjdGl2ZUNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIHRyYWlsLmFkZERlc2NlbmRhbnQoIGVmZmVjdGl2ZUNoaWxkcmVuWyBpIF0sIGkgKTtcclxuICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSggaW5zdGFuY2VzLCB0aGlzLmdldENoaWxkT3JkZXJpbmcoIHRyYWlsICkgKTtcclxuICAgICAgICB0cmFpbC5yZW1vdmVEZXNjZW5kYW50KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaW5zdGFuY2VzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU29ydCBvdXIgY2hpbGQgYWNjZXNzaWJsZSBpbnN0YW5jZXMgaW4gdGhlIG9yZGVyIHRoZXkgc2hvdWxkIGFwcGVhciBpbiB0aGUgcGFyYWxsZWwgRE9NLiBXZSBkbyB0aGlzIGJ5XHJcbiAgICogY3JlYXRpbmcgYSBjb21wYXJpc29uIGZ1bmN0aW9uIGJldHdlZW4gdHdvIGFjY2Vzc2libGUgaW5zdGFuY2VzLiBUaGUgZnVuY3Rpb24gd2Fsa3MgYWxvbmcgdGhlIHRyYWlsc1xyXG4gICAqIG9mIHRoZSBjaGlsZHJlbiwgbG9va2luZyBmb3Igc3BlY2lmaWVkIGFjY2Vzc2libGUgb3JkZXJzIHRoYXQgd291bGQgZGV0ZXJtaW5lIHRoZSBvcmRlcmluZyBmb3IgdGhlIHR3b1xyXG4gICAqIFBET01JbnN0YW5jZXMuXHJcbiAgICpcclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgc29ydENoaWxkcmVuKCk6IHZvaWQge1xyXG4gICAgLy8gSXQncyBzaW1wbGVyL2Zhc3RlciB0byBqdXN0IGdyYWIgb3VyIG9yZGVyIGRpcmVjdGx5IHdpdGggb25lIHJlY3Vyc2lvbiwgcmF0aGVyIHRoYW4gc3BlY2lmeWluZyBhIHNvcnRpbmdcclxuICAgIC8vIGZ1bmN0aW9uIChzaW5jZSBhIGxvdCBnZXRzIHJlLWV2YWx1YXRlZCBpbiB0aGF0IGNhc2UpLlxyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucGVlciAhPT0gbnVsbCwgJ3BlZXIgcmVxdWlyZWQgZm9yIHNvcnQnICk7XHJcbiAgICBsZXQgbm9kZUZvclRyYWlsOiBOb2RlO1xyXG4gICAgaWYgKCB0aGlzLmlzUm9vdEluc3RhbmNlICkge1xyXG5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5kaXNwbGF5ICE9PSBudWxsLCAnRGlzcGxheSBzaG91bGQgYmUgYXZhaWxhYmxlIGZvciB0aGUgcm9vdCcgKTtcclxuICAgICAgbm9kZUZvclRyYWlsID0gdGhpcy5kaXNwbGF5IS5yb290Tm9kZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm5vZGUgIT09IG51bGwsICdOb2RlIHNob3VsZCBiZSBkZWZpbmVkLCB3ZXJlIHdlIGRpc3Bvc2VkPycgKTtcclxuICAgICAgbm9kZUZvclRyYWlsID0gdGhpcy5ub2RlITtcclxuICAgIH1cclxuICAgIGNvbnN0IHRhcmdldENoaWxkcmVuID0gdGhpcy5nZXRDaGlsZE9yZGVyaW5nKCBuZXcgVHJhaWwoIG5vZGVGb3JUcmFpbCApICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGFyZ2V0Q2hpbGRyZW4ubGVuZ3RoID09PSB0aGlzLmNoaWxkcmVuLmxlbmd0aCwgJ3NvcnRpbmcgc2hvdWxkIG5vdCBjaGFuZ2UgbnVtYmVyIG9mIGNoaWxkcmVuJyApO1xyXG5cclxuICAgIC8vIHtBcnJheS48UERPTUluc3RhbmNlPn1cclxuICAgIHRoaXMuY2hpbGRyZW4gPSB0YXJnZXRDaGlsZHJlbjtcclxuXHJcbiAgICAvLyB0aGUgRE9NRWxlbWVudCB0byBhZGQgdGhlIGNoaWxkIERPTUVsZW1lbnRzIHRvLlxyXG4gICAgY29uc3QgcHJpbWFyeVNpYmxpbmcgPSB0aGlzLnBlZXIhLnByaW1hcnlTaWJsaW5nITtcclxuXHJcbiAgICAvLyBJZ25vcmUgREFHIGZvciBmb2N1c2VkIHRyYWlsLiBXZSBuZWVkIHRvIGtub3cgaWYgdGhlcmUgaXMgYSBmb2N1c2VkIGNoaWxkIGluc3RhbmNlIHNvIHRoYXQgd2UgY2FuIGF2b2lkXHJcbiAgICAvLyB0ZW1wb3JhcmlseSBkZXRhY2hpbmcgdGhlIGZvY3VzZWQgZWxlbWVudCBmcm9tIHRoZSBET00uIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbXktc29sYXItc3lzdGVtL2lzc3Vlcy8xNDJcclxuICAgIGNvbnN0IGZvY3VzZWRUcmFpbCA9IEZvY3VzTWFuYWdlci5wZG9tRm9jdXNlZE5vZGU/LnBkb21JbnN0YW5jZXNbIDAgXT8udHJhaWwgfHwgbnVsbDtcclxuXHJcbiAgICAvLyBcImlcIiB3aWxsIGtlZXAgdHJhY2sgb2YgdGhlIFwiY29sbGFwc2VkXCIgaW5kZXggd2hlbiBhbGwgRE9NRWxlbWVudHMgZm9yIGFsbCBQRE9NSW5zdGFuY2UgY2hpbGRyZW4gYXJlXHJcbiAgICAvLyBhZGRlZCB0byBhIHNpbmdsZSBwYXJlbnQgRE9NRWxlbWVudCAodGhpcyBQRE9NSW5zdGFuY2UncyBQRE9NUGVlcidzIHByaW1hcnlTaWJsaW5nKVxyXG4gICAgbGV0IGkgPSBwcmltYXJ5U2libGluZy5jaGlsZE5vZGVzLmxlbmd0aCAtIDE7XHJcblxyXG4gICAgY29uc3QgZm9jdXNlZENoaWxkSW5zdGFuY2UgPSBmb2N1c2VkVHJhaWwgJiYgXy5maW5kKCB0aGlzLmNoaWxkcmVuLCBjaGlsZCA9PiBmb2N1c2VkVHJhaWwuY29udGFpbnNOb2RlKCBjaGlsZC5wZWVyIS5ub2RlISApICk7XHJcbiAgICBpZiAoIGZvY3VzZWRDaGlsZEluc3RhbmNlICkge1xyXG4gICAgICAvLyBJZiB0aGVyZSdzIGEgZm9jdXNlZCBjaGlsZCBpbnN0YW5jZSwgd2UgbmVlZCB0byBtYWtlIHN1cmUgdGhhdCBpdHMgcHJpbWFyeVNpYmxpbmcgaXMgbm90IGRldGFjaGVkIGZyb20gdGhlIERPTVxyXG4gICAgICAvLyAodGhpcyBoYXMgY2F1c2VkIGZvY3VzIGlzc3Vlcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9teS1zb2xhci1zeXN0ZW0vaXNzdWVzLzE0MikuXHJcbiAgICAgIC8vIFNpbmNlIHRoaXMgZG9lc24ndCBoYXBwZW4gb2Z0ZW4sIHdlIGNhbiBqdXN0IHJlY29tcHV0ZSB0aGUgZnVsbCBvcmRlciwgYW5kIG1vdmUgZXZlcnkgb3RoZXIgZWxlbWVudC5cclxuXHJcbiAgICAgIGNvbnN0IGRlc2lyZWRPcmRlciA9IF8uZmxhdHRlbiggdGhpcy5jaGlsZHJlbi5tYXAoIGNoaWxkID0+IGNoaWxkLnBlZXIhLnRvcExldmVsRWxlbWVudHMhICkgKTtcclxuICAgICAgY29uc3QgbmVlZHNPcmRlckNoYW5nZSA9ICFfLmV2ZXJ5KCBkZXNpcmVkT3JkZXIsICggZGVzaXJlZEVsZW1lbnQsIGluZGV4ICkgPT4gcHJpbWFyeVNpYmxpbmcuY2hpbGRyZW5bIGluZGV4IF0gPT09IGRlc2lyZWRFbGVtZW50ICk7XHJcblxyXG4gICAgICBpZiAoIG5lZWRzT3JkZXJDaGFuZ2UgKSB7XHJcbiAgICAgICAgY29uc3QgcGl2b3RFbGVtZW50ID0gZm9jdXNlZENoaWxkSW5zdGFuY2UucGVlciEuZ2V0VG9wTGV2ZWxFbGVtZW50Q29udGFpbmluZ1ByaW1hcnlTaWJsaW5nKCk7XHJcbiAgICAgICAgY29uc3QgcGl2b3RJbmRleCA9IGRlc2lyZWRPcmRlci5pbmRleE9mKCBwaXZvdEVsZW1lbnQgKTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwaXZvdEluZGV4ID49IDAgKTtcclxuXHJcbiAgICAgICAgLy8gSW5zZXJ0IGFsbCBlbGVtZW50cyBiZWZvcmUgdGhlIHBpdm90IGVsZW1lbnRcclxuICAgICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBwaXZvdEluZGV4OyBqKysgKSB7XHJcbiAgICAgICAgICBwcmltYXJ5U2libGluZy5pbnNlcnRCZWZvcmUoIGRlc2lyZWRPcmRlclsgaiBdLCBwaXZvdEVsZW1lbnQgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluc2VydCBhbGwgZWxlbWVudHMgYWZ0ZXIgdGhlIHBpdm90IGVsZW1lbnRcclxuICAgICAgICBmb3IgKCBsZXQgaiA9IHBpdm90SW5kZXggKyAxOyBqIDwgZGVzaXJlZE9yZGVyLmxlbmd0aDsgaisrICkge1xyXG4gICAgICAgICAgcHJpbWFyeVNpYmxpbmcuYXBwZW5kQ2hpbGQoIGRlc2lyZWRPcmRlclsgaiBdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGFsbCBQRE9NSW5zdGFuY2UgY2hpbGRyZW5cclxuICAgICAgZm9yICggbGV0IHBlZXJJbmRleCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMTsgcGVlckluZGV4ID49IDA7IHBlZXJJbmRleC0tICkge1xyXG4gICAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLmNoaWxkcmVuWyBwZWVySW5kZXggXS5wZWVyITtcclxuXHJcbiAgICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGFsbCB0b3AgbGV2ZWwgZWxlbWVudHMgb2YgYW4gUERPTUluc3RhbmNlJ3MgcGVlclxyXG4gICAgICAgIGZvciAoIGxldCBlbGVtZW50SW5kZXggPSBwZWVyLnRvcExldmVsRWxlbWVudHMhLmxlbmd0aCAtIDE7IGVsZW1lbnRJbmRleCA+PSAwOyBlbGVtZW50SW5kZXgtLSApIHtcclxuICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBwZWVyLnRvcExldmVsRWxlbWVudHMhWyBlbGVtZW50SW5kZXggXTtcclxuXHJcbiAgICAgICAgICAvLyBSZW9yZGVyIERPTSBlbGVtZW50cyBpbiBhIHdheSB0aGF0IGRvZXNuJ3QgZG8gYW55IHdvcmsgaWYgdGhleSBhcmUgYWxyZWFkeSBpbiBhIHNvcnRlZCBvcmRlci5cclxuICAgICAgICAgIC8vIE5vIG5lZWQgdG8gcmVpbnNlcnQgaWYgYGVsZW1lbnRgIGlzIGFscmVhZHkgaW4gdGhlIHJpZ2h0IG9yZGVyXHJcbiAgICAgICAgICBpZiAoIHByaW1hcnlTaWJsaW5nLmNoaWxkTm9kZXNbIGkgXSAhPT0gZWxlbWVudCApIHtcclxuICAgICAgICAgICAgcHJpbWFyeVNpYmxpbmcuaW5zZXJ0QmVmb3JlKCBlbGVtZW50LCBwcmltYXJ5U2libGluZy5jaGlsZE5vZGVzWyBpICsgMSBdICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gRGVjcmVtZW50IHNvIHRoYXQgaXQgaXMgZWFzaWVyIHRvIHBsYWNlIGVsZW1lbnRzIHVzaW5nIHRoZSBicm93c2VyJ3MgTm9kZS5pbnNlcnRCZWZvcmUgQVBJXHJcbiAgICAgICAgICBpLS07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIGNvbnN0IGRlc2lyZWRPcmRlciA9IF8uZmxhdHRlbiggdGhpcy5jaGlsZHJlbi5tYXAoIGNoaWxkID0+IGNoaWxkLnBlZXIhLnRvcExldmVsRWxlbWVudHMhICkgKTtcclxuXHJcbiAgICAgIC8vIFZlcmlmeSB0aGUgb3JkZXJcclxuICAgICAgYXNzZXJ0KCBfLmV2ZXJ5KCBkZXNpcmVkT3JkZXIsICggZGVzaXJlZEVsZW1lbnQsIGluZGV4ICkgPT4gcHJpbWFyeVNpYmxpbmcuY2hpbGRyZW5bIGluZGV4IF0gPT09IGRlc2lyZWRFbGVtZW50ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIFVOSVFVRV9JRF9TVFJBVEVHWSA9PT0gUERPTVVuaXF1ZUlkU3RyYXRlZ3kuSU5ESUNFUyApIHtcclxuXHJcbiAgICAgIC8vIFRoaXMga2lsbHMgcGVyZm9ybWFuY2UgaWYgdGhlcmUgYXJlIGVub3VnaCBQRE9NSW5zdGFuY2VzXHJcbiAgICAgIHRoaXMudXBkYXRlRGVzY2VuZGFudFBlZXJJZHMoIHRoaXMuY2hpbGRyZW4gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIG5ldyBUcmFuc2Zvcm1UcmFja2VyIHRoYXQgd2lsbCBvYnNlcnZlIHRyYW5zZm9ybXMgYWxvbmcgdGhlIHRyYWlsIG9mIHRoaXMgUERPTUluc3RhbmNlIE9SXHJcbiAgICogdGhlIHByb3ZpZGVkIHBkb21UcmFuc2Zvcm1Tb3VyY2VOb2RlLiBTZWUgUGFyYWxsZWxET00uc2V0UERPTVRyYW5zZm9ybVNvdXJjZU5vZGUoKS4gVGhlIFRoZSBzb3VyY2UgTm9kZVxyXG4gICAqIG11c3Qgbm90IHVzZSBEQUcgc28gdGhhdCBpdHMgdHJhaWwgaXMgdW5pcXVlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB1cGRhdGVUcmFuc2Zvcm1UcmFja2VyKCBwZG9tVHJhbnNmb3JtU291cmNlTm9kZTogTm9kZSB8IG51bGwgKTogdm9pZCB7XHJcbiAgICB0aGlzLnRyYW5zZm9ybVRyYWNrZXIgJiYgdGhpcy50cmFuc2Zvcm1UcmFja2VyLmRpc3Bvc2UoKTtcclxuXHJcbiAgICBsZXQgdHJhY2tlZFRyYWlsID0gbnVsbDtcclxuICAgIGlmICggcGRvbVRyYW5zZm9ybVNvdXJjZU5vZGUgKSB7XHJcbiAgICAgIHRyYWNrZWRUcmFpbCA9IHBkb21UcmFuc2Zvcm1Tb3VyY2VOb2RlLmdldFVuaXF1ZVRyYWlsKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdHJhY2tlZFRyYWlsID0gUERPTUluc3RhbmNlLmd1ZXNzVmlzdWFsVHJhaWwoIHRoaXMudHJhaWwhLCB0aGlzLmRpc3BsYXkhLnJvb3ROb2RlICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50cmFuc2Zvcm1UcmFja2VyID0gbmV3IFRyYW5zZm9ybVRyYWNrZXIoIHRyYWNrZWRUcmFpbCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGVwZW5kaW5nIG9uIHdoYXQgdGhlIHVuaXF1ZSBJRCBzdHJhdGVneSBpcywgZm9ybXVsYXRlIHRoZSBjb3JyZWN0IGlkIGZvciB0aGlzIFBET00gaW5zdGFuY2UuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFBET01JbnN0YW5jZVVuaXF1ZUlkKCk6IHN0cmluZyB7XHJcblxyXG4gICAgaWYgKCBVTklRVUVfSURfU1RSQVRFR1kgPT09IFBET01VbmlxdWVJZFN0cmF0ZWd5LklORElDRVMgKSB7XHJcblxyXG4gICAgICBjb25zdCBpbmRpY2VzU3RyaW5nID0gW107XHJcblxyXG4gICAgICBsZXQgcGRvbUluc3RhbmNlOiBQRE9NSW5zdGFuY2UgPSB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbnNpc3RlbnQtdGhpcywgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcclxuXHJcbiAgICAgIHdoaWxlICggcGRvbUluc3RhbmNlLnBhcmVudCApIHtcclxuICAgICAgICBjb25zdCBpbmRleE9mID0gcGRvbUluc3RhbmNlLnBhcmVudC5jaGlsZHJlbi5pbmRleE9mKCBwZG9tSW5zdGFuY2UgKTtcclxuICAgICAgICBpZiAoIGluZGV4T2YgPT09IC0xICkge1xyXG4gICAgICAgICAgcmV0dXJuICdTVElMTF9CRUlOR19DUkVBVEVEJyArIGRvdFJhbmRvbS5uZXh0RG91YmxlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluZGljZXNTdHJpbmcudW5zaGlmdCggaW5kZXhPZiApO1xyXG4gICAgICAgIHBkb21JbnN0YW5jZSA9IHBkb21JbnN0YW5jZS5wYXJlbnQ7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGluZGljZXNTdHJpbmcuam9pbiggUERPTVV0aWxzLlBET01fVU5JUVVFX0lEX1NFUEFSQVRPUiApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIFVOSVFVRV9JRF9TVFJBVEVHWSA9PT0gUERPTVVuaXF1ZUlkU3RyYXRlZ3kuVFJBSUxfSUQgKTtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLnRyYWlsIS5nZXRVbmlxdWVJZCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXNpbmcgaW5kaWNlcyByZXF1aXJlcyB1cGRhdGluZyB3aGVuZXZlciB0aGUgUERPTUluc3RhbmNlIHRyZWUgY2hhbmdlcywgc28gcmVjdXJzaXZlbHkgdXBkYXRlIGFsbCBkZXNjZW5kYW50XHJcbiAgICogaWRzIGZyb20gc3VjaCBhIGNoYW5nZS4gVXBkYXRlIHBlZXIgaWRzIGZvciBwcm92aWRlZCBpbnN0YW5jZXMgYW5kIGFsbCBkZXNjZW5kYW50cyBvZiBwcm92aWRlZCBpbnN0YW5jZXMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB1cGRhdGVEZXNjZW5kYW50UGVlcklkcyggcGRvbUluc3RhbmNlczogUERPTUluc3RhbmNlW10gKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBVTklRVUVfSURfU1RSQVRFR1kgPT09IFBET01VbmlxdWVJZFN0cmF0ZWd5LklORElDRVMsICdtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkIHdpdGggdW5pcXVlSWQgY29tZXMgZnJvbSBUUkFJTF9JRCcgKTtcclxuICAgIGNvbnN0IHRvVXBkYXRlID0gQXJyYXkuZnJvbSggcGRvbUluc3RhbmNlcyApO1xyXG4gICAgd2hpbGUgKCB0b1VwZGF0ZS5sZW5ndGggPiAwICkge1xyXG4gICAgICBjb25zdCBwZG9tSW5zdGFuY2UgPSB0b1VwZGF0ZS5zaGlmdCgpITtcclxuICAgICAgcGRvbUluc3RhbmNlLnBlZXIhLnVwZGF0ZUluZGljZXNTdHJpbmdBbmRFbGVtZW50SWRzKCk7XHJcbiAgICAgIHRvVXBkYXRlLnB1c2goIC4uLnBkb21JbnN0YW5jZS5jaGlsZHJlbiApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGRpc3BsYXlcclxuICAgKiBAcGFyYW0gdW5pcXVlSWQgLSB2YWx1ZSByZXR1cm5lZCBmcm9tIFBET01JbnN0YW5jZS5nZXRQRE9NSW5zdGFuY2VVbmlxdWVJZCgpXHJcbiAgICogQHJldHVybnMgbnVsbCBpZiB0aGVyZSBpcyBubyBwYXRoIHRvIHRoZSB1bmlxdWUgaWQgcHJvdmlkZWQuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyB1bmlxdWVJZFRvVHJhaWwoIGRpc3BsYXk6IERpc3BsYXksIHVuaXF1ZUlkOiBzdHJpbmcgKTogVHJhaWwgfCBudWxsIHtcclxuICAgIGlmICggVU5JUVVFX0lEX1NUUkFURUdZID09PSBQRE9NVW5pcXVlSWRTdHJhdGVneS5JTkRJQ0VTICkge1xyXG4gICAgICByZXR1cm4gZGlzcGxheS5nZXRUcmFpbEZyb21QRE9NSW5kaWNlc1N0cmluZyggdW5pcXVlSWQgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBVTklRVUVfSURfU1RSQVRFR1kgPT09IFBET01VbmlxdWVJZFN0cmF0ZWd5LlRSQUlMX0lEICk7XHJcbiAgICAgIHJldHVybiBUcmFpbC5mcm9tVW5pcXVlSWQoIGRpc3BsYXkucm9vdE5vZGUsIHVuaXF1ZUlkICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWN1cnNpdmUgZGlzcG9zYWwsIHRvIG1ha2UgZWxpZ2libGUgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cclxuICAgKlxyXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZShcclxuICAgICAgYERpc3Bvc2luZyAke3RoaXMudG9TdHJpbmcoKX1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICEhdGhpcy5wZWVyLCAnUERPTVBlZXIgcmVxdWlyZWQsIHdlcmUgd2UgYWxyZWFkeSBkaXNwb3NlZD8nICk7XHJcbiAgICBjb25zdCB0aGlzUGVlciA9IHRoaXMucGVlciE7XHJcblxyXG4gICAgLy8gRGlzY29ubmVjdCBET00gYW5kIHJlbW92ZSBsaXN0ZW5lcnNcclxuICAgIGlmICggIXRoaXMuaXNSb290SW5zdGFuY2UgKSB7XHJcblxyXG4gICAgICAvLyByZW1vdmUgdGhpcyBwZWVyJ3MgcHJpbWFyeSBzaWJsaW5nIERPTSBFbGVtZW50IChvciBpdHMgY29udGFpbmVyIHBhcmVudCkgZnJvbSB0aGUgcGFyZW50IHBlZXInc1xyXG4gICAgICAvLyBwcmltYXJ5IHNpYmxpbmcgKG9yIGl0cyBjaGlsZCBjb250YWluZXIpXHJcbiAgICAgIFBET01VdGlscy5yZW1vdmVFbGVtZW50cyggdGhpcy5wYXJlbnQhLnBlZXIhLnByaW1hcnlTaWJsaW5nISwgdGhpc1BlZXIudG9wTGV2ZWxFbGVtZW50cyEgKTtcclxuXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMucmVsYXRpdmVOb2RlcyEubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgdGhpcy5yZWxhdGl2ZU5vZGVzIVsgaSBdLnBkb21EaXNwbGF5c0VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMucmVsYXRpdmVMaXN0ZW5lcnNbIGkgXSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgd2hpbGUgKCB0aGlzLmNoaWxkcmVuLmxlbmd0aCApIHtcclxuICAgICAgdGhpcy5jaGlsZHJlbi5wb3AoKSEuZGlzcG9zZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE5PVEU6IFdlIGRpc3Bvc2UgT1VSIHBlZXIgYWZ0ZXIgZGlzcG9zaW5nIGNoaWxkcmVuLCBzbyBvdXIgcGVlciBjYW4gYmUgYXZhaWxhYmxlIGZvciBvdXIgY2hpbGRyZW4gZHVyaW5nXHJcbiAgICAvLyBkaXNwb3NhbC5cclxuICAgIHRoaXNQZWVyLmRpc3Bvc2UoKTtcclxuXHJcbiAgICAvLyBkaXNwb3NlIGFmdGVyIHRoZSBwZWVyIHNvIHRoZSBwZWVyIGNhbiByZW1vdmUgYW55IGxpc3RlbmVycyBmcm9tIGl0XHJcbiAgICB0aGlzLnRyYW5zZm9ybVRyYWNrZXIhLmRpc3Bvc2UoKTtcclxuICAgIHRoaXMudHJhbnNmb3JtVHJhY2tlciA9IG51bGw7XHJcblxyXG4gICAgLy8gSWYgd2UgYXJlIHRoZSByb290IGFjY2Vzc2libGUgaW5zdGFuY2UsIHdlIHdvbid0IGFjdHVhbGx5IGhhdmUgYSByZWZlcmVuY2UgdG8gYSBub2RlLlxyXG4gICAgaWYgKCB0aGlzLm5vZGUgKSB7XHJcbiAgICAgIHRoaXMubm9kZS5yZW1vdmVQRE9NSW5zdGFuY2UoIHRoaXMgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlbGF0aXZlTm9kZXMgPSBudWxsO1xyXG4gICAgdGhpcy5kaXNwbGF5ID0gbnVsbDtcclxuICAgIHRoaXMudHJhaWwgPSBudWxsO1xyXG4gICAgdGhpcy5ub2RlID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLnBlZXIgPSBudWxsO1xyXG4gICAgdGhpcy5pc0Rpc3Bvc2VkID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLmZyZWVUb1Bvb2woKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGb3IgZGVidWdnaW5nIHB1cnBvc2VzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGAke3RoaXMuaWR9I3ske3RoaXMudHJhaWwhLnRvU3RyaW5nKCl9fWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGb3IgZGVidWdnaW5nIHB1cnBvc2VzLCBpbnNwZWN0IHRoZSB0cmVlIG9mIFBET01JbnN0YW5jZXMgZnJvbSB0aGUgcm9vdC5cclxuICAgKlxyXG4gICAqIE9ubHkgZXZlciBjYWxsZWQgZnJvbSB0aGUgX3Jvb3RQRE9NSW5zdGFuY2Ugb2YgdGhlIGRpc3BsYXkuXHJcbiAgICpcclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgYXVkaXRSb290KCk6IHZvaWQge1xyXG4gICAgaWYgKCAhYXNzZXJ0ICkgeyByZXR1cm47IH1cclxuXHJcbiAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuZGlzcGxheSEucm9vdE5vZGU7XHJcblxyXG4gICAgYXNzZXJ0KCB0aGlzLnRyYWlsIS5sZW5ndGggPT09IDAsXHJcbiAgICAgICdTaG91bGQgb25seSBjYWxsIGF1ZGl0Um9vdCgpIG9uIHRoZSByb290IFBET01JbnN0YW5jZSBmb3IgYSBkaXNwbGF5JyApO1xyXG5cclxuICAgIGZ1bmN0aW9uIGF1ZGl0KCBmYWtlSW5zdGFuY2U6IEZha2VJbnN0YW5jZSwgcGRvbUluc3RhbmNlOiBQRE9NSW5zdGFuY2UgKTogdm9pZCB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZha2VJbnN0YW5jZS5jaGlsZHJlbi5sZW5ndGggPT09IHBkb21JbnN0YW5jZS5jaGlsZHJlbi5sZW5ndGgsXHJcbiAgICAgICAgJ0RpZmZlcmVudCBudW1iZXIgb2YgY2hpbGRyZW4gaW4gYWNjZXNzaWJsZSBpbnN0YW5jZScgKTtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZha2VJbnN0YW5jZS5ub2RlID09PSBwZG9tSW5zdGFuY2Uubm9kZSwgJ05vZGUgbWlzbWF0Y2ggZm9yIFBET01JbnN0YW5jZScgKTtcclxuXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBkb21JbnN0YW5jZS5jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBhdWRpdCggZmFrZUluc3RhbmNlLmNoaWxkcmVuWyBpIF0sIHBkb21JbnN0YW5jZS5jaGlsZHJlblsgaSBdICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGlzVmlzaWJsZSA9IHBkb21JbnN0YW5jZS5pc0dsb2JhbGx5VmlzaWJsZSgpO1xyXG5cclxuICAgICAgbGV0IHNob3VsZEJlVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBkb21JbnN0YW5jZS50cmFpbCEubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IHBkb21JbnN0YW5jZS50cmFpbCEubm9kZXNbIGkgXTtcclxuICAgICAgICBjb25zdCB0cmFpbHMgPSBub2RlLmdldFRyYWlsc1RvKCByb290Tm9kZSApLmZpbHRlciggdHJhaWwgPT4gdHJhaWwuaXNQRE9NVmlzaWJsZSgpICk7XHJcbiAgICAgICAgaWYgKCB0cmFpbHMubGVuZ3RoID09PSAwICkge1xyXG4gICAgICAgICAgc2hvdWxkQmVWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzVmlzaWJsZSA9PT0gc2hvdWxkQmVWaXNpYmxlLCAnSW5zdGFuY2UgdmlzaWJpbGl0eSBtaXNtYXRjaCcgKTtcclxuICAgIH1cclxuXHJcbiAgICBhdWRpdCggUERPTUluc3RhbmNlLmNyZWF0ZUZha2VQRE9NVHJlZSggcm9vdE5vZGUgKSwgdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2luY2UgYSBcIlRyYWlsXCIgb24gUERPTUluc3RhbmNlIGNhbiBoYXZlIGRpc2NvbnRpbnVvdXMganVtcHMgKGR1ZSB0byBwZG9tT3JkZXIpLCB0aGlzIGZpbmRzIHRoZSBiZXN0XHJcbiAgICogYWN0dWFsIHZpc3VhbCBUcmFpbCB0byB1c2UsIGZyb20gdGhlIHRyYWlsIG9mIGFuIFBET01JbnN0YW5jZSB0byB0aGUgcm9vdCBvZiBhIERpc3BsYXkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdHJhaWwgLSB0cmFpbCBvZiB0aGUgUERPTUluc3RhbmNlLCB3aGljaCBjYW4gY29udGFpbmUgXCJnYXBzXCJcclxuICAgKiBAcGFyYW0gcm9vdE5vZGUgLSByb290IG9mIGEgRGlzcGxheVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgZ3Vlc3NWaXN1YWxUcmFpbCggdHJhaWw6IFRyYWlsLCByb290Tm9kZTogTm9kZSApOiBUcmFpbCB7XHJcbiAgICB0cmFpbC5yZWluZGV4KCk7XHJcblxyXG4gICAgLy8gU2VhcmNoIGZvciBwbGFjZXMgaW4gdGhlIHRyYWlsIHdoZXJlIGFkamFjZW50IG5vZGVzIGRvIE5PVCBoYXZlIGEgcGFyZW50LWNoaWxkIHJlbGF0aW9uc2hpcCwgaS5lLlxyXG4gICAgLy8gIW5vZGVzWyBuIF0uaGFzQ2hpbGQoIG5vZGVzWyBuICsgMSBdICkuXHJcbiAgICAvLyBOT1RFOiBUaGlzIGluZGV4IHBvaW50cyB0byB0aGUgcGFyZW50IHdoZXJlIHRoaXMgaXMgdGhlIGNhc2UsIGJlY2F1c2UgdGhlIGluZGljZXMgaW4gdGhlIHRyYWlsIGFyZSBzdWNoIHRoYXQ6XHJcbiAgICAvLyB0cmFpbC5ub2Rlc1sgbiBdLmNoaWxkcmVuWyB0cmFpbC5pbmRpY2VzWyBuIF0gXSA9IHRyYWlsLm5vZGVzWyBuICsgMSBdXHJcbiAgICBjb25zdCBsYXN0QmFkSW5kZXggPSB0cmFpbC5pbmRpY2VzLmxhc3RJbmRleE9mKCAtMSApO1xyXG5cclxuICAgIC8vIElmIHdlIGhhdmUgbm8gYmFkIGluZGljZXMsIGp1c3QgcmV0dXJuIG91ciB0cmFpbCBpbW1lZGlhdGVseS5cclxuICAgIGlmICggbGFzdEJhZEluZGV4IDwgMCApIHtcclxuICAgICAgcmV0dXJuIHRyYWlsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZpcnN0R29vZEluZGV4ID0gbGFzdEJhZEluZGV4ICsgMTtcclxuICAgIGNvbnN0IGZpcnN0R29vZE5vZGUgPSB0cmFpbC5ub2Rlc1sgZmlyc3RHb29kSW5kZXggXTtcclxuICAgIGNvbnN0IGJhc2VUcmFpbHMgPSBmaXJzdEdvb2ROb2RlLmdldFRyYWlsc1RvKCByb290Tm9kZSApO1xyXG5cclxuICAgIC8vIGZpcnN0R29vZE5vZGUgbWlnaHQgbm90IGJlIGF0dGFjaGVkIHRvIGEgRGlzcGxheSBlaXRoZXIhIE1heWJlIGNsaWVudCBqdXN0IGhhc24ndCBnb3R0ZW4gdG8gaXQgeWV0LCBzbyB3ZVxyXG4gICAgLy8gZmFpbCBncmFjZWZ1bGx5LWlzaD9cclxuICAgIC8vIGFzc2VydCAmJiBhc3NlcnQoIGJhc2VUcmFpbHMubGVuZ3RoID4gMCwgJ1wiZ29vZCBub2RlXCIgaW4gdHJhaWwgd2l0aCBnYXAgbm90IGF0dGFjaGVkIHRvIHJvb3QnKVxyXG4gICAgaWYgKCBiYXNlVHJhaWxzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgcmV0dXJuIHRyYWlsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCB0aGUgcmVzdCBvZiB0aGUgdHJhaWwgYmFjayBpblxyXG4gICAgY29uc3QgYmFzZVRyYWlsID0gYmFzZVRyYWlsc1sgMCBdO1xyXG4gICAgZm9yICggbGV0IGkgPSBmaXJzdEdvb2RJbmRleCArIDE7IGkgPCB0cmFpbC5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgYmFzZVRyYWlsLmFkZERlc2NlbmRhbnQoIHRyYWlsLm5vZGVzWyBpIF0gKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBiYXNlVHJhaWwuaXNWYWxpZCgpLCBgdHJhaWwgbm90IHZhbGlkOiAke3RyYWlsLnVuaXF1ZUlkfWAgKTtcclxuXHJcbiAgICByZXR1cm4gYmFzZVRyYWlsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGZha2UgUERPTUluc3RhbmNlLWxpa2UgdHJlZSBzdHJ1Y3R1cmUgKHdpdGggdGhlIGVxdWl2YWxlbnQgbm9kZXMgYW5kIGNoaWxkcmVuIHN0cnVjdHVyZSkuXHJcbiAgICogRm9yIGRlYnVnZ2luZy5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIFR5cGUgRmFrZVBET01JbnN0YW5jZTogeyBub2RlOiB7Tm9kZX0sIGNoaWxkcmVuOiB7QXJyYXkuPEZha2VQRE9NSW5zdGFuY2U+fSB9XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgY3JlYXRlRmFrZVBET01UcmVlKCByb290Tm9kZTogTm9kZSApOiBGYWtlSW5zdGFuY2Uge1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlRmFrZVRyZWUoIG5vZGU6IE5vZGUgKTogb2JqZWN0IHtcclxuICAgICAgbGV0IGZha2VJbnN0YW5jZXMgPSBfLmZsYXR0ZW4oIG5vZGUuZ2V0RWZmZWN0aXZlQ2hpbGRyZW4oKS5tYXAoIGNyZWF0ZUZha2VUcmVlICkgKSBhcyBGYWtlSW5zdGFuY2VbXTtcclxuICAgICAgaWYgKCBub2RlLmhhc1BET01Db250ZW50ICkge1xyXG4gICAgICAgIGZha2VJbnN0YW5jZXMgPSBbIHtcclxuICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICBjaGlsZHJlbjogZmFrZUluc3RhbmNlc1xyXG4gICAgICAgIH0gXTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFrZUluc3RhbmNlcztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBub2RlOiBudWxsLFxyXG5cclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICBjaGlsZHJlbjogY3JlYXRlRmFrZVRyZWUoIHJvb3ROb2RlIClcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZnJlZVRvUG9vbCgpOiB2b2lkIHtcclxuICAgIFBET01JbnN0YW5jZS5wb29sLmZyZWVUb1Bvb2woIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgcG9vbCA9IG5ldyBQb29sKCBQRE9NSW5zdGFuY2UsIHtcclxuICAgIGluaXRpYWxpemU6IFBET01JbnN0YW5jZS5wcm90b3R5cGUuaW5pdGlhbGl6ZVBET01JbnN0YW5jZVxyXG4gIH0gKTtcclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ1BET01JbnN0YW5jZScsIFBET01JbnN0YW5jZSApO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBET01JbnN0YW5jZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxVQUFVLE1BQU0sd0NBQXdDO0FBQy9ELE9BQU9DLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsZ0JBQWdCLE1BQU0sOENBQThDO0FBQzNFLE9BQU9DLElBQUksTUFBTSxrQ0FBa0M7QUFDbkQsU0FBa0JDLFlBQVksRUFBRUMsSUFBSSxFQUFFQyxRQUFRLEVBQUVDLFNBQVMsRUFBRUMsT0FBTyxFQUFFQyxLQUFLLEVBQUVDLGdCQUFnQixRQUFRLGtCQUFrQjs7QUFFckg7QUFDQSxNQUFNQyxvQkFBb0IsU0FBU1QsZ0JBQWdCLENBQUM7RUFDbEQsT0FBdUJVLE9BQU8sR0FBRyxJQUFJRCxvQkFBb0IsQ0FBQyxDQUFDO0VBQzNELE9BQXVCRSxRQUFRLEdBQUcsSUFBSUYsb0JBQW9CLENBQUMsQ0FBQztFQUU1RCxPQUF1QkcsV0FBVyxHQUFHLElBQUliLFdBQVcsQ0FBRVUsb0JBQXFCLENBQUM7QUFDOUU7O0FBRUE7O0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNSSxrQkFBa0IsR0FBR0osb0JBQW9CLENBQUNFLFFBQVE7QUFFeEQsSUFBSUcsUUFBUSxHQUFHLENBQUM7QUFFaEIsTUFBTUMsWUFBWSxDQUFDO0VBRWpCOztFQUtBOztFQVNBO0VBQ0E7RUFHQTtFQUNRQyxhQUFhLEdBQWtCLEVBQUU7O0VBRXpDO0VBQ1FDLG9CQUFvQixHQUFjLEVBQUU7O0VBRTVD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