// Copyright 2014-2022, University of Colorado Boulder

/**
 * RelativeTransform is a component of an Instance. It is responsible for tracking changes to "relative" transforms, and
 * computing them in an efficient manner.
 *
 * A "relative" transform here is the transform that a Trail would have, not necessarily rooted at the display's root.
 * Imagine we have a CSS-transformed backbone div, and nodes underneath that render to Canvas. On the Canvas, we will
 * need to set the context's transform to the matrix that will transform from the displayed instances' local coordinates
 * frames to the CSS-transformed backbone instance. Notably, transforming the backbone instance or any of its ancestors
 * does NOT affect this "relative" transform from the instance to the displayed instances, while any Node transform
 * changes between (not including) the backbone instance and (including) the displayed instance WILL affect that
 * relative transform. This is key to setting the CSS transform on backbones, DOM nodes, having the transforms necessary
 * for the fastest Canvas display, and determining fitting bounds for layers.
 *
 * Each Instance has its own "relative trail", although these aren't stored. We use implicit hierarchies in the Instance
 * tree for this purpose. If an Instance is a CSS-transformed backbone, or any other case that requires drawing beneath
 * to be done relative to its local coordinate frame, we call it a transform "root", and it has instance.isTransformed
 * set to true. This should NEVER change for an instance (any changes that would do this require reconstructing the
 * instance tree).
 *
 * There are implicit hierarchies for each root, with trails starting from that root's children (they won't apply that
 * root's transform since we assume we are working within that root's local coordinate frame). These should be
 * effectively independent (if there are no bugs), so that flags affecting one implicit hierarchy will not affect the
 * other (dirty flags, etc.), and traversals should not cross these boundaries.
 *
 * For various purposes, we want a system that can:
 * - every frame before repainting: notify listeners on instances whether its relative transform has changed
 *                                  (add|removeListener)
 * - every frame before repainting: precompute relative transforms on instances where we know this is required
 *                                  (add|removePrecompute)
 * - any time during repainting:    provide an efficient way to lazily compute relative transforms when needed
 *
 * This is done by first having one step in the pre-repaint phase that traverses the tree where necessary, notifying
 * relative transform listeners, and precomputing relative transforms when they have changed (and precomputation is
 * requested). This traversal leaves metadata on the instances so that we can (fairly) efficiently force relative
 * transform "validation" any time afterwards that makes sure the matrix property is up-to-date.
 *
 * First of all, to ensure we traverse the right parts of the tree, we need to keep metadata on what needs to be
 * traversed. This is done by tracking counts of listeners/precompution needs, both on the instance itself, and how many
 * children have these needs. We use counts instead of boolean flags so that we can update this quickly while (a) never
 * requiring full children scans to update this metadata, and (b) minimizing the need to traverse all the way up to the
 * root to update the metadata. The end result is hasDescendantListenerNeed and hasDescendantComputeNeed which compute,
 * respectively, whether we need to traverse this instance for listeners and precomputation. Additionally,
 * hasAncestorListenerNeed and hasAncestorComputeNeed compute whether our parent needs to traverse up to us.
 *
 * The other tricky bits to remember for this traversal are the flags it sets, and how later validation uses and updates
 * these flags. First of all, we have relativeSelfDirty and relativeChildDirtyFrame. When a node's transform changes,
 * we mark relativeSelfDirty on the node, and relativeChildDirtyFrame for all ancestors up to (and including) the
 * transform root. relativeChildDirtyFrame allows us to prune our traversal to only modified subtrees. Additionally, so
 * that we can retain the invariant that it is "set" parent node if it is set on a child, we store the rendering frame
 * ID (unique to traversals) instead of a boolean true/false. Our traversal may skip subtrees where
 * relativeChildDirtyFrame is "set" due to no listeners or precomputation needed for that subtree, so if we used
 * booleans this would be violated. Violating that invariant would prevent us from "bailing out" when setting the
 * relativeChildDirtyFrame flag, and on EVERY transform change we would have to traverse ALL of the way to the root
 * (instead of the efficient "stop at the ancestor where it is also set").
 *
 * relativeSelfDirty is initially set on instances whose nodes had transform changes (they mark that this relative
 * transform, and all transforms beneath, are dirty). We maintain the invariant that if a relative transform needs to be
 * recomputed, it or one of its ancestors WILL ALWAYS have this flag set. This is required so that later validation of
 * the relative transform can verify whether it has been changed in an efficient way. When we recompute the relative
 * transform for one instance, we have to set this flag on all children to maintain this invariant.
 *
 * Additionally, so that we can have fast "validation" speed, we also store into relativeFrameId the last rendering
 * frame ID (counter) where we either verified that the relative transform is up to date, or we have recomputed it. Thus
 * when "validating" a relative transform that wasn't precomputed, we only need to scan up the ancestors to the first
 * one that was verified OK this frame (boolean flags are insufficient for this, since we would have to clear them all
 * to false on every frame, requiring a full tree traversal). In the future, we may set this flag to the frame
 * proactively during traversal to speed up validation, but that is not done at the time of this writing.
 *
 * Some helpful notes for the scope of various relativeTransform bits:
 *                         (transformRoot) (regular) (regular) (transformRoot)
 * relativeChildDirtyFrame [---------------------------------]                 (int)
 * relativeSelfDirty                       [---------------------------------]
 * matrix                                  [---------------------------------] (transform on root applies to
 *                                                                             its parent context)
 * relativeFrameId                         [---------------------------------] (int)
 * child counts            [---------------------------------]                 (e.g. relativeChildrenListenersCount,
 *                                                                             relativeChildrenPrecomputeCount)
 * self counts                             [---------------------------------] (e.g. relativePrecomputeCount,
 *                                                                             relativeTransformListeners.length)
 **********************
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Matrix3 from '../../../dot/js/Matrix3.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import { scenery } from '../imports.js';
class RelativeTransform {
  /**
   * @param {Instance} instance
   */
  constructor(instance) {
    this.instance = instance;
  }

  /**
   * Responsible for initialization and cleaning of this. If the parameters are both null, we'll want to clean our
   * external references (like Instance does).
   * @public
   *
   * @param {Display|null} display
   * @param {Trail|null} trail
   * @returns {RelativeTransform} - Returns this, to allow chaining.
   */
  initialize(display, trail) {
    this.display = display;
    this.trail = trail;
    this.node = trail && trail.lastNode();

    // properties relevant to the node's direct transform
    this.transformDirty = true; // whether the node's transform has changed (until the pre-repaint phase)
    this.nodeTransformListener = this.nodeTransformListener || this.onNodeTransformDirty.bind(this);

    // the actual cached transform to the root
    this.matrix = this.matrix || Matrix3.identity();

    // whether our matrix is dirty
    this.relativeSelfDirty = true;

    // how many children have (or have descendants with) relativeTransformListeners
    this.relativeChildrenListenersCount = 0;

    // if >0, indicates this should be precomputed in the pre-repaint phase
    this.relativePrecomputeCount = 0;

    // how many children have (or have descendants with) >0 relativePrecomputeCount
    this.relativeChildrenPrecomputeCount = 0;

    // used to mark what frame the transform was updated in (to accelerate non-precomputed relative transform access)
    this.relativeFrameId = -1;

    // Whether children have dirty transforms (if it is the current frame) NOTE: used only for pre-repaint traversal,
    // and can be ignored if it has a value less than the current frame ID. This allows us to traverse and hit all
    // listeners for this particular traversal, without leaving an invalid subtree (a boolean flag here is
    // insufficient, since our traversal handling would validate our invariant of
    // this.relativeChildDirtyFrame => parent.relativeChildDirtyFrame). In this case, they are both effectively
    // "false" unless they are the current frame ID, in which case that invariant holds.
    this.relativeChildDirtyFrame = display ? display._frameId : 0;

    // will be notified in pre-repaint phase that our relative transform has changed (but not computed by default)
    //OHTWO TODO: should we rely on listeners removing themselves?
    this.relativeTransformListeners = cleanArray(this.relativeTransformListeners);
    return this; // allow chaining
  }

  /**
   * @public
   *
   * @returns {RelativeTransform|null}
   */
  get parent() {
    return this.instance.parent ? this.instance.parent.relativeTransform : null;
  }

  /**
   * @public
   *
   * @param {Instance} instance
   */
  addInstance(instance) {
    if (instance.stateless) {
      assert && assert(!instance.relativeTransform.hasAncestorListenerNeed(), 'We only track changes properly if stateless instances do not have needs');
      assert && assert(!instance.relativeTransform.hasAncestorComputeNeed(), 'We only track changes properly if stateless instances do not have needs');
    } else {
      if (instance.relativeTransform.hasAncestorListenerNeed()) {
        this.incrementTransformListenerChildren();
      }
      if (instance.relativeTransform.hasAncestorComputeNeed()) {
        this.incrementTransformPrecomputeChildren();
      }
    }

    // mark the instance's transform as dirty, so that it will be reachable in the pre-repaint traversal pass
    instance.relativeTransform.forceMarkTransformDirty();
  }

  /**
   * @public
   *
   * @param {Instance} instance
   */
  removeInstance(instance) {
    if (instance.relativeTransform.hasAncestorListenerNeed()) {
      this.decrementTransformListenerChildren();
    }
    if (instance.relativeTransform.hasAncestorComputeNeed()) {
      this.decrementTransformPrecomputeChildren();
    }
  }

  /**
   * @public
   */
  attachNodeListeners() {
    this.node.transformEmitter.addListener(this.nodeTransformListener);
  }

  /**
   * @public
   */
  detachNodeListeners() {
    this.node.transformEmitter.removeListener(this.nodeTransformListener);
  }

  /*---------------------------------------------------------------------------*
   * Relative transform listener count recursive handling
   *----------------------------------------------------------------------------*/

  /**
   * Only for descendants need, ignores 'self' need on isTransformed
   * @private
   *
   * @returns {boolean}
   */
  hasDescendantListenerNeed() {
    if (this.instance.isTransformed) {
      return this.relativeChildrenListenersCount > 0;
    } else {
      return this.relativeChildrenListenersCount > 0 || this.relativeTransformListeners.length > 0;
    }
  }

  /**
   * Only for ancestors need, ignores child need on isTransformed
   * @private
   *
   * @returns {boolean}
   */
  hasAncestorListenerNeed() {
    if (this.instance.isTransformed) {
      return this.relativeTransformListeners.length > 0;
    } else {
      return this.relativeChildrenListenersCount > 0 || this.relativeTransformListeners.length > 0;
    }
  }

  /**
   * @private
   *
   * @returns {boolean}
   */
  hasSelfListenerNeed() {
    return this.relativeTransformListeners.length > 0;
  }

  /**
   * Called on the ancestor of the instance with the need
   * @private
   */
  incrementTransformListenerChildren() {
    const before = this.hasAncestorListenerNeed();
    this.relativeChildrenListenersCount++;
    if (before !== this.hasAncestorListenerNeed()) {
      assert && assert(!this.instance.isTransformed, 'Should not be a change in need if we have the isTransformed flag');
      this.parent && this.parent.incrementTransformListenerChildren();
    }
  }

  /**
   * Called on the ancestor of the instance with the need
   * @private
   */
  decrementTransformListenerChildren() {
    const before = this.hasAncestorListenerNeed();
    this.relativeChildrenListenersCount--;
    if (before !== this.hasAncestorListenerNeed()) {
      assert && assert(!this.instance.isTransformed, 'Should not be a change in need if we have the isTransformed flag');
      this.parent && this.parent.decrementTransformListenerChildren();
    }
  }

  /**
   * Called on the instance itself
   * @public
   *
   * @param {function} listener
   */
  addListener(listener) {
    const before = this.hasAncestorListenerNeed();
    this.relativeTransformListeners.push(listener);
    if (before !== this.hasAncestorListenerNeed()) {
      this.parent && this.parent.incrementTransformListenerChildren();

      // if we just went from "not needing to be traversed" to "needing to be traversed", mark ourselves as dirty so
      // that we for-sure get future updates
      if (!this.hasAncestorComputeNeed()) {
        // TODO: can we do better than this?
        this.forceMarkTransformDirty();
      }
    }
  }

  /**
   * Called on the instance itself
   * @public
   *
   * @param {function} listener
   */
  removeListener(listener) {
    const before = this.hasAncestorListenerNeed();

    // TODO: replace with a 'remove' function call
    this.relativeTransformListeners.splice(_.indexOf(this.relativeTransformListeners, listener), 1);
    if (before !== this.hasAncestorListenerNeed()) {
      this.parent && this.parent.decrementTransformListenerChildren();
    }
  }

  /*---------------------------------------------------------------------------*
   * Relative transform precompute flag recursive handling
   *----------------------------------------------------------------------------*/

  /**
   * Only for descendants need, ignores 'self' need on isTransformed
   * @private
   *
   * @returns {boolean}
   */
  hasDescendantComputeNeed() {
    if (this.instance.isTransformed) {
      return this.relativeChildrenPrecomputeCount > 0;
    } else {
      return this.relativeChildrenPrecomputeCount > 0 || this.relativePrecomputeCount > 0;
    }
  }

  /**
   * Only for ancestors need, ignores child need on isTransformed
   * @private
   *
   * @returns {boolean}
   */
  hasAncestorComputeNeed() {
    if (this.instance.isTransformed) {
      return this.relativePrecomputeCount > 0;
    } else {
      return this.relativeChildrenPrecomputeCount > 0 || this.relativePrecomputeCount > 0;
    }
  }

  /**
   * @private
   *
   * @returns {boolean}
   */
  hasSelfComputeNeed() {
    return this.relativePrecomputeCount > 0;
  }

  /**
   * Called on the ancestor of the instance with the need
   * @private
   */
  incrementTransformPrecomputeChildren() {
    const before = this.hasAncestorComputeNeed();
    this.relativeChildrenPrecomputeCount++;
    if (before !== this.hasAncestorComputeNeed()) {
      assert && assert(!this.instance.isTransformed, 'Should not be a change in need if we have the isTransformed flag');
      this.parent && this.parent.incrementTransformPrecomputeChildren();
    }
  }

  /**
   * Called on the ancestor of the instance with the need
   * @private
   */
  decrementTransformPrecomputeChildren() {
    const before = this.hasAncestorComputeNeed();
    this.relativeChildrenPrecomputeCount--;
    if (before !== this.hasAncestorComputeNeed()) {
      assert && assert(!this.instance.isTransformed, 'Should not be a change in need if we have the isTransformed flag');
      this.parent && this.parent.decrementTransformPrecomputeChildren();
    }
  }

  /**
   * Called on the instance itself
   * @public
   */
  addPrecompute() {
    const before = this.hasAncestorComputeNeed();
    this.relativePrecomputeCount++;
    if (before !== this.hasAncestorComputeNeed()) {
      this.parent && this.parent.incrementTransformPrecomputeChildren();

      // if we just went from "not needing to be traversed" to "needing to be traversed", mark ourselves as dirty so
      // that we for-sure get future updates
      if (!this.hasAncestorListenerNeed()) {
        // TODO: can we do better than this?
        this.forceMarkTransformDirty();
      }
    }
  }

  /**
   * Called on the instance itself
   * @public
   */
  removePrecompute() {
    const before = this.hasAncestorComputeNeed();
    this.relativePrecomputeCount--;
    if (before !== this.hasAncestorComputeNeed()) {
      this.parent && this.parent.decrementTransformPrecomputeChildren();
    }
  }

  /*---------------------------------------------------------------------------*
   * Relative transform handling
   *----------------------------------------------------------------------------*/

  /**
   * Called immediately when the corresponding node has a transform change (can happen multiple times between renders)
   * @private
   */
  onNodeTransformDirty() {
    if (!this.transformDirty) {
      this.forceMarkTransformDirty();
    }
  }

  /**
   * @private
   */
  forceMarkTransformDirty() {
    this.transformDirty = true;
    this.relativeSelfDirty = true;
    const frameId = this.display._frameId;

    // mark all ancestors with relativeChildDirtyFrame, bailing out when possible
    let instance = this.instance.parent;
    while (instance && instance.relativeTransform.relativeChildDirtyFrame !== frameId) {
      const parentInstance = instance.parent;
      const isTransformed = instance.isTransformed;

      // NOTE: our while loop guarantees that it wasn't frameId
      instance.relativeTransform.relativeChildDirtyFrame = frameId;

      // always mark an instance without a parent (root instance!)
      if (parentInstance === null) {
        // passTransform depends on whether it is marked as a transform root
        this.display.markTransformRootDirty(instance, isTransformed);
        break;
      } else if (isTransformed) {
        this.display.markTransformRootDirty(instance, true); // passTransform true
        break;
      }
      instance = parentInstance;
    }
  }

  /**
   * Updates our matrix based on any parents, and the node's current transform
   * @private
   */
  computeRelativeTransform() {
    const nodeMatrix = this.node.getMatrix();
    if (this.instance.parent && !this.instance.parent.isTransformed) {
      // mutable form of parentMatrix * nodeMatrix
      this.matrix.set(this.parent.matrix);
      this.matrix.multiplyMatrix(nodeMatrix);
    } else {
      // we are the first in the trail transform, so we just directly copy the matrix over
      this.matrix.set(nodeMatrix);
    }

    // mark the frame where this transform was updated, to accelerate non-precomputed access
    this.relativeFrameId = this.display._frameId;
    this.relativeSelfDirty = false;
  }

  /**
   * @public
   *
   * @returns {boolean}
   */
  isValidationNotNeeded() {
    return this.hasAncestorComputeNeed() || this.relativeFrameId === this.display._frameId;
  }

  /**
   * Called from any place in the rendering process where we are not guaranteed to have a fresh relative transform.
   * needs to scan up the tree, so it is more expensive than precomputed transforms.
   * @returns Whether we had to update this transform
   * @public
   */
  validate() {
    // if we are clean, bail out. If we have a compute "need", we will always be clean here since this is after the
    // traversal step. If we did not have a compute "need", we check whether we were already updated this frame by
    // computeRelativeTransform.
    if (this.isValidationNotNeeded()) {
      return;
    }

    // if we are not the first transform from the root, validate our parent. isTransform check prevents us from
    // passing a transform root.
    if (this.instance.parent && !this.instance.parent.isTransformed) {
      this.parent.validate();
    }

    // validation of the parent may have changed our relativeSelfDirty flag to true, so we check now (could also have
    // been true before)
    if (this.relativeSelfDirty) {
      // compute the transform, and mark us as not relative-dirty
      this.computeRelativeTransform();

      // mark all children now as dirty, since we had to update (marked so that other children from the one we are
      // validating will know that they need updates)
      // if we were called from a child's validate(), they will now need to compute their transform
      const len = this.instance.children.length;
      for (let i = 0; i < len; i++) {
        this.instance.children[i].relativeTransform.relativeSelfDirty = true;
      }
    }
  }

  /**
   * Called during the pre-repaint phase to (a) fire off all relative transform listeners that should be fired, and
   * (b) precompute transforms were desired.
   * @public
   *
   * @param {boolean} ancestorWasDirty
   * @param {boolean} ancestorIsDirty
   * @param {number} frameId
   * @param {boolean} passTransform
   */
  updateTransformListenersAndCompute(ancestorWasDirty, ancestorIsDirty, frameId, passTransform) {
    sceneryLog && sceneryLog.RelativeTransform && sceneryLog.RelativeTransform(`update/compute: ${this.toString()} ${ancestorWasDirty} => ${ancestorIsDirty}${passTransform ? ' passTransform' : ''}`);
    sceneryLog && sceneryLog.RelativeTransform && sceneryLog.push();
    let len;
    let i;
    if (passTransform) {
      // if we are passing isTransform, just apply this to the children
      len = this.instance.children.length;
      for (i = 0; i < len; i++) {
        this.instance.children[i].relativeTransform.updateTransformListenersAndCompute(false, false, frameId, false);
      }
    } else {
      const wasDirty = ancestorWasDirty || this.relativeSelfDirty;
      const wasSubtreeDirty = wasDirty || this.relativeChildDirtyFrame === frameId;
      const hasComputeNeed = this.hasDescendantComputeNeed();
      const hasListenerNeed = this.hasDescendantListenerNeed();
      const hasSelfComputeNeed = this.hasSelfComputeNeed();
      const hasSelfListenerNeed = this.hasSelfListenerNeed();

      // if our relative transform will be dirty but our parents' transform will be clean, we need to mark ourselves
      // as dirty (so that later access can identify we are dirty).
      if (!hasComputeNeed && wasDirty && !ancestorIsDirty) {
        this.relativeSelfDirty = true;
      }

      // check if traversal isn't needed (no instances marked as having listeners or needing computation)
      // either the subtree is clean (no traversal needed for compute/listeners), or we have no compute/listener needs
      if (!wasSubtreeDirty || !hasComputeNeed && !hasListenerNeed && !hasSelfComputeNeed && !hasSelfListenerNeed) {
        sceneryLog && sceneryLog.RelativeTransform && sceneryLog.pop();
        return;
      }

      // if desired, compute the transform
      if (wasDirty && (hasComputeNeed || hasSelfComputeNeed)) {
        // compute this transform in the pre-repaint phase, so it is cheap when always used/
        // we update when the child-precompute count >0, since those children will need
        this.computeRelativeTransform();
      }
      if (this.transformDirty) {
        this.transformDirty = false;
      }

      // no hasListenerNeed guard needed?
      this.notifyRelativeTransformListeners();

      // only update children if we aren't transformed (completely other context)
      if (!this.instance.isTransformed || passTransform) {
        const isDirty = wasDirty && !(hasComputeNeed || hasSelfComputeNeed);

        // continue the traversal
        len = this.instance.children.length;
        for (i = 0; i < len; i++) {
          this.instance.children[i].relativeTransform.updateTransformListenersAndCompute(wasDirty, isDirty, frameId, false);
        }
      }
    }
    sceneryLog && sceneryLog.RelativeTransform && sceneryLog.pop();
  }

  /**
   * @private
   */
  notifyRelativeTransformListeners() {
    const len = this.relativeTransformListeners.length;
    for (let i = 0; i < len; i++) {
      this.relativeTransformListeners[i]();
    }
  }

  /**
   * @public
   *
   * @param {number} frameId
   * @param {boolean} allowValidationNotNeededChecks
   */
  audit(frameId, allowValidationNotNeededChecks) {
    // get the relative matrix, computed to be up-to-date, and ignores any flags/counts so we can check whether our
    // state is consistent
    function currentRelativeMatrix(instance) {
      const resultMatrix = Matrix3.pool.fetch();
      const nodeMatrix = instance.node.getMatrix();
      if (!instance.parent) {
        // if our instance has no parent, ignore its transform
        resultMatrix.set(Matrix3.IDENTITY);
      } else if (!instance.parent.isTransformed) {
        // mutable form of parentMatrix * nodeMatrix
        resultMatrix.set(currentRelativeMatrix(instance.parent));
        resultMatrix.multiplyMatrix(nodeMatrix);
      } else {
        // we are the first in the trail transform, so we just directly copy the matrix over
        resultMatrix.set(nodeMatrix);
      }
      return resultMatrix;
    }
    function hasRelativeSelfDirty(instance) {
      // if validation isn't needed, act like nothing is dirty (matching our validate behavior)
      if (allowValidationNotNeededChecks && instance.isValidationNotNeeded()) {
        return false;
      }
      return instance.relativeSelfDirty || instance.parent && hasRelativeSelfDirty(instance.parent);
    }
    if (assertSlow) {
      // count verification for invariants
      let notifyRelativeCount = 0;
      let precomputeRelativeCount = 0;
      for (let i = 0; i < this.instance.children.length; i++) {
        const childInstance = this.instance.children[i];
        if (childInstance.relativeTransform.hasAncestorListenerNeed()) {
          notifyRelativeCount++;
        }
        if (childInstance.relativeTransform.hasAncestorComputeNeed()) {
          precomputeRelativeCount++;
        }
      }
      assertSlow(notifyRelativeCount === this.relativeChildrenListenersCount, 'Relative listener count invariant');
      assertSlow(precomputeRelativeCount === this.relativeChildrenPrecomputeCount, 'Relative precompute count invariant');
      assertSlow(!this.parent || this.instance.isTransformed || this.relativeChildDirtyFrame !== frameId || this.parent.relativeChildDirtyFrame === frameId, 'If we have a parent, we need to hold the invariant ' + 'this.relativeChildDirtyFrame => parent.relativeChildDirtyFrame');

      // Since we check to see if something is not dirty, we need to handle this when we are actually reporting
      // what is dirty. See https://github.com/phetsims/scenery/issues/512
      if (!allowValidationNotNeededChecks && !hasRelativeSelfDirty(this)) {
        const matrix = currentRelativeMatrix(this);
        assertSlow(matrix.equals(this.matrix), 'If there is no relativeSelfDirty flag set here or in our' + ' ancestors, our matrix should be up-to-date');
      }
    }
  }
}
scenery.register('RelativeTransform', RelativeTransform);
export default RelativeTransform;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXgzIiwiY2xlYW5BcnJheSIsInNjZW5lcnkiLCJSZWxhdGl2ZVRyYW5zZm9ybSIsImNvbnN0cnVjdG9yIiwiaW5zdGFuY2UiLCJpbml0aWFsaXplIiwiZGlzcGxheSIsInRyYWlsIiwibm9kZSIsImxhc3ROb2RlIiwidHJhbnNmb3JtRGlydHkiLCJub2RlVHJhbnNmb3JtTGlzdGVuZXIiLCJvbk5vZGVUcmFuc2Zvcm1EaXJ0eSIsImJpbmQiLCJtYXRyaXgiLCJpZGVudGl0eSIsInJlbGF0aXZlU2VsZkRpcnR5IiwicmVsYXRpdmVDaGlsZHJlbkxpc3RlbmVyc0NvdW50IiwicmVsYXRpdmVQcmVjb21wdXRlQ291bnQiLCJyZWxhdGl2ZUNoaWxkcmVuUHJlY29tcHV0ZUNvdW50IiwicmVsYXRpdmVGcmFtZUlkIiwicmVsYXRpdmVDaGlsZERpcnR5RnJhbWUiLCJfZnJhbWVJZCIsInJlbGF0aXZlVHJhbnNmb3JtTGlzdGVuZXJzIiwicGFyZW50IiwicmVsYXRpdmVUcmFuc2Zvcm0iLCJhZGRJbnN0YW5jZSIsInN0YXRlbGVzcyIsImFzc2VydCIsImhhc0FuY2VzdG9yTGlzdGVuZXJOZWVkIiwiaGFzQW5jZXN0b3JDb21wdXRlTmVlZCIsImluY3JlbWVudFRyYW5zZm9ybUxpc3RlbmVyQ2hpbGRyZW4iLCJpbmNyZW1lbnRUcmFuc2Zvcm1QcmVjb21wdXRlQ2hpbGRyZW4iLCJmb3JjZU1hcmtUcmFuc2Zvcm1EaXJ0eSIsInJlbW92ZUluc3RhbmNlIiwiZGVjcmVtZW50VHJhbnNmb3JtTGlzdGVuZXJDaGlsZHJlbiIsImRlY3JlbWVudFRyYW5zZm9ybVByZWNvbXB1dGVDaGlsZHJlbiIsImF0dGFjaE5vZGVMaXN0ZW5lcnMiLCJ0cmFuc2Zvcm1FbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJkZXRhY2hOb2RlTGlzdGVuZXJzIiwicmVtb3ZlTGlzdGVuZXIiLCJoYXNEZXNjZW5kYW50TGlzdGVuZXJOZWVkIiwiaXNUcmFuc2Zvcm1lZCIsImxlbmd0aCIsImhhc1NlbGZMaXN0ZW5lck5lZWQiLCJiZWZvcmUiLCJsaXN0ZW5lciIsInB1c2giLCJzcGxpY2UiLCJfIiwiaW5kZXhPZiIsImhhc0Rlc2NlbmRhbnRDb21wdXRlTmVlZCIsImhhc1NlbGZDb21wdXRlTmVlZCIsImFkZFByZWNvbXB1dGUiLCJyZW1vdmVQcmVjb21wdXRlIiwiZnJhbWVJZCIsInBhcmVudEluc3RhbmNlIiwibWFya1RyYW5zZm9ybVJvb3REaXJ0eSIsImNvbXB1dGVSZWxhdGl2ZVRyYW5zZm9ybSIsIm5vZGVNYXRyaXgiLCJnZXRNYXRyaXgiLCJzZXQiLCJtdWx0aXBseU1hdHJpeCIsImlzVmFsaWRhdGlvbk5vdE5lZWRlZCIsInZhbGlkYXRlIiwibGVuIiwiY2hpbGRyZW4iLCJpIiwidXBkYXRlVHJhbnNmb3JtTGlzdGVuZXJzQW5kQ29tcHV0ZSIsImFuY2VzdG9yV2FzRGlydHkiLCJhbmNlc3RvcklzRGlydHkiLCJwYXNzVHJhbnNmb3JtIiwic2NlbmVyeUxvZyIsInRvU3RyaW5nIiwid2FzRGlydHkiLCJ3YXNTdWJ0cmVlRGlydHkiLCJoYXNDb21wdXRlTmVlZCIsImhhc0xpc3RlbmVyTmVlZCIsInBvcCIsIm5vdGlmeVJlbGF0aXZlVHJhbnNmb3JtTGlzdGVuZXJzIiwiaXNEaXJ0eSIsImF1ZGl0IiwiYWxsb3dWYWxpZGF0aW9uTm90TmVlZGVkQ2hlY2tzIiwiY3VycmVudFJlbGF0aXZlTWF0cml4IiwicmVzdWx0TWF0cml4IiwicG9vbCIsImZldGNoIiwiSURFTlRJVFkiLCJoYXNSZWxhdGl2ZVNlbGZEaXJ0eSIsImFzc2VydFNsb3ciLCJub3RpZnlSZWxhdGl2ZUNvdW50IiwicHJlY29tcHV0ZVJlbGF0aXZlQ291bnQiLCJjaGlsZEluc3RhbmNlIiwiZXF1YWxzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJSZWxhdGl2ZVRyYW5zZm9ybS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSZWxhdGl2ZVRyYW5zZm9ybSBpcyBhIGNvbXBvbmVudCBvZiBhbiBJbnN0YW5jZS4gSXQgaXMgcmVzcG9uc2libGUgZm9yIHRyYWNraW5nIGNoYW5nZXMgdG8gXCJyZWxhdGl2ZVwiIHRyYW5zZm9ybXMsIGFuZFxyXG4gKiBjb21wdXRpbmcgdGhlbSBpbiBhbiBlZmZpY2llbnQgbWFubmVyLlxyXG4gKlxyXG4gKiBBIFwicmVsYXRpdmVcIiB0cmFuc2Zvcm0gaGVyZSBpcyB0aGUgdHJhbnNmb3JtIHRoYXQgYSBUcmFpbCB3b3VsZCBoYXZlLCBub3QgbmVjZXNzYXJpbHkgcm9vdGVkIGF0IHRoZSBkaXNwbGF5J3Mgcm9vdC5cclxuICogSW1hZ2luZSB3ZSBoYXZlIGEgQ1NTLXRyYW5zZm9ybWVkIGJhY2tib25lIGRpdiwgYW5kIG5vZGVzIHVuZGVybmVhdGggdGhhdCByZW5kZXIgdG8gQ2FudmFzLiBPbiB0aGUgQ2FudmFzLCB3ZSB3aWxsXHJcbiAqIG5lZWQgdG8gc2V0IHRoZSBjb250ZXh0J3MgdHJhbnNmb3JtIHRvIHRoZSBtYXRyaXggdGhhdCB3aWxsIHRyYW5zZm9ybSBmcm9tIHRoZSBkaXNwbGF5ZWQgaW5zdGFuY2VzJyBsb2NhbCBjb29yZGluYXRlc1xyXG4gKiBmcmFtZXMgdG8gdGhlIENTUy10cmFuc2Zvcm1lZCBiYWNrYm9uZSBpbnN0YW5jZS4gTm90YWJseSwgdHJhbnNmb3JtaW5nIHRoZSBiYWNrYm9uZSBpbnN0YW5jZSBvciBhbnkgb2YgaXRzIGFuY2VzdG9yc1xyXG4gKiBkb2VzIE5PVCBhZmZlY3QgdGhpcyBcInJlbGF0aXZlXCIgdHJhbnNmb3JtIGZyb20gdGhlIGluc3RhbmNlIHRvIHRoZSBkaXNwbGF5ZWQgaW5zdGFuY2VzLCB3aGlsZSBhbnkgTm9kZSB0cmFuc2Zvcm1cclxuICogY2hhbmdlcyBiZXR3ZWVuIChub3QgaW5jbHVkaW5nKSB0aGUgYmFja2JvbmUgaW5zdGFuY2UgYW5kIChpbmNsdWRpbmcpIHRoZSBkaXNwbGF5ZWQgaW5zdGFuY2UgV0lMTCBhZmZlY3QgdGhhdFxyXG4gKiByZWxhdGl2ZSB0cmFuc2Zvcm0uIFRoaXMgaXMga2V5IHRvIHNldHRpbmcgdGhlIENTUyB0cmFuc2Zvcm0gb24gYmFja2JvbmVzLCBET00gbm9kZXMsIGhhdmluZyB0aGUgdHJhbnNmb3JtcyBuZWNlc3NhcnlcclxuICogZm9yIHRoZSBmYXN0ZXN0IENhbnZhcyBkaXNwbGF5LCBhbmQgZGV0ZXJtaW5pbmcgZml0dGluZyBib3VuZHMgZm9yIGxheWVycy5cclxuICpcclxuICogRWFjaCBJbnN0YW5jZSBoYXMgaXRzIG93biBcInJlbGF0aXZlIHRyYWlsXCIsIGFsdGhvdWdoIHRoZXNlIGFyZW4ndCBzdG9yZWQuIFdlIHVzZSBpbXBsaWNpdCBoaWVyYXJjaGllcyBpbiB0aGUgSW5zdGFuY2VcclxuICogdHJlZSBmb3IgdGhpcyBwdXJwb3NlLiBJZiBhbiBJbnN0YW5jZSBpcyBhIENTUy10cmFuc2Zvcm1lZCBiYWNrYm9uZSwgb3IgYW55IG90aGVyIGNhc2UgdGhhdCByZXF1aXJlcyBkcmF3aW5nIGJlbmVhdGhcclxuICogdG8gYmUgZG9uZSByZWxhdGl2ZSB0byBpdHMgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSwgd2UgY2FsbCBpdCBhIHRyYW5zZm9ybSBcInJvb3RcIiwgYW5kIGl0IGhhcyBpbnN0YW5jZS5pc1RyYW5zZm9ybWVkXHJcbiAqIHNldCB0byB0cnVlLiBUaGlzIHNob3VsZCBORVZFUiBjaGFuZ2UgZm9yIGFuIGluc3RhbmNlIChhbnkgY2hhbmdlcyB0aGF0IHdvdWxkIGRvIHRoaXMgcmVxdWlyZSByZWNvbnN0cnVjdGluZyB0aGVcclxuICogaW5zdGFuY2UgdHJlZSkuXHJcbiAqXHJcbiAqIFRoZXJlIGFyZSBpbXBsaWNpdCBoaWVyYXJjaGllcyBmb3IgZWFjaCByb290LCB3aXRoIHRyYWlscyBzdGFydGluZyBmcm9tIHRoYXQgcm9vdCdzIGNoaWxkcmVuICh0aGV5IHdvbid0IGFwcGx5IHRoYXRcclxuICogcm9vdCdzIHRyYW5zZm9ybSBzaW5jZSB3ZSBhc3N1bWUgd2UgYXJlIHdvcmtpbmcgd2l0aGluIHRoYXQgcm9vdCdzIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUpLiBUaGVzZSBzaG91bGQgYmVcclxuICogZWZmZWN0aXZlbHkgaW5kZXBlbmRlbnQgKGlmIHRoZXJlIGFyZSBubyBidWdzKSwgc28gdGhhdCBmbGFncyBhZmZlY3Rpbmcgb25lIGltcGxpY2l0IGhpZXJhcmNoeSB3aWxsIG5vdCBhZmZlY3QgdGhlXHJcbiAqIG90aGVyIChkaXJ0eSBmbGFncywgZXRjLiksIGFuZCB0cmF2ZXJzYWxzIHNob3VsZCBub3QgY3Jvc3MgdGhlc2UgYm91bmRhcmllcy5cclxuICpcclxuICogRm9yIHZhcmlvdXMgcHVycG9zZXMsIHdlIHdhbnQgYSBzeXN0ZW0gdGhhdCBjYW46XHJcbiAqIC0gZXZlcnkgZnJhbWUgYmVmb3JlIHJlcGFpbnRpbmc6IG5vdGlmeSBsaXN0ZW5lcnMgb24gaW5zdGFuY2VzIHdoZXRoZXIgaXRzIHJlbGF0aXZlIHRyYW5zZm9ybSBoYXMgY2hhbmdlZFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoYWRkfHJlbW92ZUxpc3RlbmVyKVxyXG4gKiAtIGV2ZXJ5IGZyYW1lIGJlZm9yZSByZXBhaW50aW5nOiBwcmVjb21wdXRlIHJlbGF0aXZlIHRyYW5zZm9ybXMgb24gaW5zdGFuY2VzIHdoZXJlIHdlIGtub3cgdGhpcyBpcyByZXF1aXJlZFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoYWRkfHJlbW92ZVByZWNvbXB1dGUpXHJcbiAqIC0gYW55IHRpbWUgZHVyaW5nIHJlcGFpbnRpbmc6ICAgIHByb3ZpZGUgYW4gZWZmaWNpZW50IHdheSB0byBsYXppbHkgY29tcHV0ZSByZWxhdGl2ZSB0cmFuc2Zvcm1zIHdoZW4gbmVlZGVkXHJcbiAqXHJcbiAqIFRoaXMgaXMgZG9uZSBieSBmaXJzdCBoYXZpbmcgb25lIHN0ZXAgaW4gdGhlIHByZS1yZXBhaW50IHBoYXNlIHRoYXQgdHJhdmVyc2VzIHRoZSB0cmVlIHdoZXJlIG5lY2Vzc2FyeSwgbm90aWZ5aW5nXHJcbiAqIHJlbGF0aXZlIHRyYW5zZm9ybSBsaXN0ZW5lcnMsIGFuZCBwcmVjb21wdXRpbmcgcmVsYXRpdmUgdHJhbnNmb3JtcyB3aGVuIHRoZXkgaGF2ZSBjaGFuZ2VkIChhbmQgcHJlY29tcHV0YXRpb24gaXNcclxuICogcmVxdWVzdGVkKS4gVGhpcyB0cmF2ZXJzYWwgbGVhdmVzIG1ldGFkYXRhIG9uIHRoZSBpbnN0YW5jZXMgc28gdGhhdCB3ZSBjYW4gKGZhaXJseSkgZWZmaWNpZW50bHkgZm9yY2UgcmVsYXRpdmVcclxuICogdHJhbnNmb3JtIFwidmFsaWRhdGlvblwiIGFueSB0aW1lIGFmdGVyd2FyZHMgdGhhdCBtYWtlcyBzdXJlIHRoZSBtYXRyaXggcHJvcGVydHkgaXMgdXAtdG8tZGF0ZS5cclxuICpcclxuICogRmlyc3Qgb2YgYWxsLCB0byBlbnN1cmUgd2UgdHJhdmVyc2UgdGhlIHJpZ2h0IHBhcnRzIG9mIHRoZSB0cmVlLCB3ZSBuZWVkIHRvIGtlZXAgbWV0YWRhdGEgb24gd2hhdCBuZWVkcyB0byBiZVxyXG4gKiB0cmF2ZXJzZWQuIFRoaXMgaXMgZG9uZSBieSB0cmFja2luZyBjb3VudHMgb2YgbGlzdGVuZXJzL3ByZWNvbXB1dGlvbiBuZWVkcywgYm90aCBvbiB0aGUgaW5zdGFuY2UgaXRzZWxmLCBhbmQgaG93IG1hbnlcclxuICogY2hpbGRyZW4gaGF2ZSB0aGVzZSBuZWVkcy4gV2UgdXNlIGNvdW50cyBpbnN0ZWFkIG9mIGJvb2xlYW4gZmxhZ3Mgc28gdGhhdCB3ZSBjYW4gdXBkYXRlIHRoaXMgcXVpY2tseSB3aGlsZSAoYSkgbmV2ZXJcclxuICogcmVxdWlyaW5nIGZ1bGwgY2hpbGRyZW4gc2NhbnMgdG8gdXBkYXRlIHRoaXMgbWV0YWRhdGEsIGFuZCAoYikgbWluaW1pemluZyB0aGUgbmVlZCB0byB0cmF2ZXJzZSBhbGwgdGhlIHdheSB1cCB0byB0aGVcclxuICogcm9vdCB0byB1cGRhdGUgdGhlIG1ldGFkYXRhLiBUaGUgZW5kIHJlc3VsdCBpcyBoYXNEZXNjZW5kYW50TGlzdGVuZXJOZWVkIGFuZCBoYXNEZXNjZW5kYW50Q29tcHV0ZU5lZWQgd2hpY2ggY29tcHV0ZSxcclxuICogcmVzcGVjdGl2ZWx5LCB3aGV0aGVyIHdlIG5lZWQgdG8gdHJhdmVyc2UgdGhpcyBpbnN0YW5jZSBmb3IgbGlzdGVuZXJzIGFuZCBwcmVjb21wdXRhdGlvbi4gQWRkaXRpb25hbGx5LFxyXG4gKiBoYXNBbmNlc3Rvckxpc3RlbmVyTmVlZCBhbmQgaGFzQW5jZXN0b3JDb21wdXRlTmVlZCBjb21wdXRlIHdoZXRoZXIgb3VyIHBhcmVudCBuZWVkcyB0byB0cmF2ZXJzZSB1cCB0byB1cy5cclxuICpcclxuICogVGhlIG90aGVyIHRyaWNreSBiaXRzIHRvIHJlbWVtYmVyIGZvciB0aGlzIHRyYXZlcnNhbCBhcmUgdGhlIGZsYWdzIGl0IHNldHMsIGFuZCBob3cgbGF0ZXIgdmFsaWRhdGlvbiB1c2VzIGFuZCB1cGRhdGVzXHJcbiAqIHRoZXNlIGZsYWdzLiBGaXJzdCBvZiBhbGwsIHdlIGhhdmUgcmVsYXRpdmVTZWxmRGlydHkgYW5kIHJlbGF0aXZlQ2hpbGREaXJ0eUZyYW1lLiBXaGVuIGEgbm9kZSdzIHRyYW5zZm9ybSBjaGFuZ2VzLFxyXG4gKiB3ZSBtYXJrIHJlbGF0aXZlU2VsZkRpcnR5IG9uIHRoZSBub2RlLCBhbmQgcmVsYXRpdmVDaGlsZERpcnR5RnJhbWUgZm9yIGFsbCBhbmNlc3RvcnMgdXAgdG8gKGFuZCBpbmNsdWRpbmcpIHRoZVxyXG4gKiB0cmFuc2Zvcm0gcm9vdC4gcmVsYXRpdmVDaGlsZERpcnR5RnJhbWUgYWxsb3dzIHVzIHRvIHBydW5lIG91ciB0cmF2ZXJzYWwgdG8gb25seSBtb2RpZmllZCBzdWJ0cmVlcy4gQWRkaXRpb25hbGx5LCBzb1xyXG4gKiB0aGF0IHdlIGNhbiByZXRhaW4gdGhlIGludmFyaWFudCB0aGF0IGl0IGlzIFwic2V0XCIgcGFyZW50IG5vZGUgaWYgaXQgaXMgc2V0IG9uIGEgY2hpbGQsIHdlIHN0b3JlIHRoZSByZW5kZXJpbmcgZnJhbWVcclxuICogSUQgKHVuaXF1ZSB0byB0cmF2ZXJzYWxzKSBpbnN0ZWFkIG9mIGEgYm9vbGVhbiB0cnVlL2ZhbHNlLiBPdXIgdHJhdmVyc2FsIG1heSBza2lwIHN1YnRyZWVzIHdoZXJlXHJcbiAqIHJlbGF0aXZlQ2hpbGREaXJ0eUZyYW1lIGlzIFwic2V0XCIgZHVlIHRvIG5vIGxpc3RlbmVycyBvciBwcmVjb21wdXRhdGlvbiBuZWVkZWQgZm9yIHRoYXQgc3VidHJlZSwgc28gaWYgd2UgdXNlZFxyXG4gKiBib29sZWFucyB0aGlzIHdvdWxkIGJlIHZpb2xhdGVkLiBWaW9sYXRpbmcgdGhhdCBpbnZhcmlhbnQgd291bGQgcHJldmVudCB1cyBmcm9tIFwiYmFpbGluZyBvdXRcIiB3aGVuIHNldHRpbmcgdGhlXHJcbiAqIHJlbGF0aXZlQ2hpbGREaXJ0eUZyYW1lIGZsYWcsIGFuZCBvbiBFVkVSWSB0cmFuc2Zvcm0gY2hhbmdlIHdlIHdvdWxkIGhhdmUgdG8gdHJhdmVyc2UgQUxMIG9mIHRoZSB3YXkgdG8gdGhlIHJvb3RcclxuICogKGluc3RlYWQgb2YgdGhlIGVmZmljaWVudCBcInN0b3AgYXQgdGhlIGFuY2VzdG9yIHdoZXJlIGl0IGlzIGFsc28gc2V0XCIpLlxyXG4gKlxyXG4gKiByZWxhdGl2ZVNlbGZEaXJ0eSBpcyBpbml0aWFsbHkgc2V0IG9uIGluc3RhbmNlcyB3aG9zZSBub2RlcyBoYWQgdHJhbnNmb3JtIGNoYW5nZXMgKHRoZXkgbWFyayB0aGF0IHRoaXMgcmVsYXRpdmVcclxuICogdHJhbnNmb3JtLCBhbmQgYWxsIHRyYW5zZm9ybXMgYmVuZWF0aCwgYXJlIGRpcnR5KS4gV2UgbWFpbnRhaW4gdGhlIGludmFyaWFudCB0aGF0IGlmIGEgcmVsYXRpdmUgdHJhbnNmb3JtIG5lZWRzIHRvIGJlXHJcbiAqIHJlY29tcHV0ZWQsIGl0IG9yIG9uZSBvZiBpdHMgYW5jZXN0b3JzIFdJTEwgQUxXQVlTIGhhdmUgdGhpcyBmbGFnIHNldC4gVGhpcyBpcyByZXF1aXJlZCBzbyB0aGF0IGxhdGVyIHZhbGlkYXRpb24gb2ZcclxuICogdGhlIHJlbGF0aXZlIHRyYW5zZm9ybSBjYW4gdmVyaWZ5IHdoZXRoZXIgaXQgaGFzIGJlZW4gY2hhbmdlZCBpbiBhbiBlZmZpY2llbnQgd2F5LiBXaGVuIHdlIHJlY29tcHV0ZSB0aGUgcmVsYXRpdmVcclxuICogdHJhbnNmb3JtIGZvciBvbmUgaW5zdGFuY2UsIHdlIGhhdmUgdG8gc2V0IHRoaXMgZmxhZyBvbiBhbGwgY2hpbGRyZW4gdG8gbWFpbnRhaW4gdGhpcyBpbnZhcmlhbnQuXHJcbiAqXHJcbiAqIEFkZGl0aW9uYWxseSwgc28gdGhhdCB3ZSBjYW4gaGF2ZSBmYXN0IFwidmFsaWRhdGlvblwiIHNwZWVkLCB3ZSBhbHNvIHN0b3JlIGludG8gcmVsYXRpdmVGcmFtZUlkIHRoZSBsYXN0IHJlbmRlcmluZ1xyXG4gKiBmcmFtZSBJRCAoY291bnRlcikgd2hlcmUgd2UgZWl0aGVyIHZlcmlmaWVkIHRoYXQgdGhlIHJlbGF0aXZlIHRyYW5zZm9ybSBpcyB1cCB0byBkYXRlLCBvciB3ZSBoYXZlIHJlY29tcHV0ZWQgaXQuIFRodXNcclxuICogd2hlbiBcInZhbGlkYXRpbmdcIiBhIHJlbGF0aXZlIHRyYW5zZm9ybSB0aGF0IHdhc24ndCBwcmVjb21wdXRlZCwgd2Ugb25seSBuZWVkIHRvIHNjYW4gdXAgdGhlIGFuY2VzdG9ycyB0byB0aGUgZmlyc3RcclxuICogb25lIHRoYXQgd2FzIHZlcmlmaWVkIE9LIHRoaXMgZnJhbWUgKGJvb2xlYW4gZmxhZ3MgYXJlIGluc3VmZmljaWVudCBmb3IgdGhpcywgc2luY2Ugd2Ugd291bGQgaGF2ZSB0byBjbGVhciB0aGVtIGFsbFxyXG4gKiB0byBmYWxzZSBvbiBldmVyeSBmcmFtZSwgcmVxdWlyaW5nIGEgZnVsbCB0cmVlIHRyYXZlcnNhbCkuIEluIHRoZSBmdXR1cmUsIHdlIG1heSBzZXQgdGhpcyBmbGFnIHRvIHRoZSBmcmFtZVxyXG4gKiBwcm9hY3RpdmVseSBkdXJpbmcgdHJhdmVyc2FsIHRvIHNwZWVkIHVwIHZhbGlkYXRpb24sIGJ1dCB0aGF0IGlzIG5vdCBkb25lIGF0IHRoZSB0aW1lIG9mIHRoaXMgd3JpdGluZy5cclxuICpcclxuICogU29tZSBoZWxwZnVsIG5vdGVzIGZvciB0aGUgc2NvcGUgb2YgdmFyaW91cyByZWxhdGl2ZVRyYW5zZm9ybSBiaXRzOlxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAodHJhbnNmb3JtUm9vdCkgKHJlZ3VsYXIpIChyZWd1bGFyKSAodHJhbnNmb3JtUm9vdClcclxuICogcmVsYXRpdmVDaGlsZERpcnR5RnJhbWUgWy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLV0gICAgICAgICAgICAgICAgIChpbnQpXHJcbiAqIHJlbGF0aXZlU2VsZkRpcnR5ICAgICAgICAgICAgICAgICAgICAgICBbLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXVxyXG4gKiBtYXRyaXggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLV0gKHRyYW5zZm9ybSBvbiByb290IGFwcGxpZXMgdG9cclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0cyBwYXJlbnQgY29udGV4dClcclxuICogcmVsYXRpdmVGcmFtZUlkICAgICAgICAgICAgICAgICAgICAgICAgIFstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1dIChpbnQpXHJcbiAqIGNoaWxkIGNvdW50cyAgICAgICAgICAgIFstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1dICAgICAgICAgICAgICAgICAoZS5nLiByZWxhdGl2ZUNoaWxkcmVuTGlzdGVuZXJzQ291bnQsXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZUNoaWxkcmVuUHJlY29tcHV0ZUNvdW50KVxyXG4gKiBzZWxmIGNvdW50cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLV0gKGUuZy4gcmVsYXRpdmVQcmVjb21wdXRlQ291bnQsXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZVRyYW5zZm9ybUxpc3RlbmVycy5sZW5ndGgpXHJcbiAqKioqKioqKioqKioqKioqKioqKioqXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBjbGVhbkFycmF5IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9jbGVhbkFycmF5LmpzJztcclxuaW1wb3J0IHsgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5cclxuY2xhc3MgUmVsYXRpdmVUcmFuc2Zvcm0ge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGluc3RhbmNlICkge1xyXG4gICAgdGhpcy5pbnN0YW5jZSA9IGluc3RhbmNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzcG9uc2libGUgZm9yIGluaXRpYWxpemF0aW9uIGFuZCBjbGVhbmluZyBvZiB0aGlzLiBJZiB0aGUgcGFyYW1ldGVycyBhcmUgYm90aCBudWxsLCB3ZSdsbCB3YW50IHRvIGNsZWFuIG91clxyXG4gICAqIGV4dGVybmFsIHJlZmVyZW5jZXMgKGxpa2UgSW5zdGFuY2UgZG9lcykuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEaXNwbGF5fG51bGx9IGRpc3BsYXlcclxuICAgKiBAcGFyYW0ge1RyYWlsfG51bGx9IHRyYWlsXHJcbiAgICogQHJldHVybnMge1JlbGF0aXZlVHJhbnNmb3JtfSAtIFJldHVybnMgdGhpcywgdG8gYWxsb3cgY2hhaW5pbmcuXHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZSggZGlzcGxheSwgdHJhaWwgKSB7XHJcbiAgICB0aGlzLmRpc3BsYXkgPSBkaXNwbGF5O1xyXG4gICAgdGhpcy50cmFpbCA9IHRyYWlsO1xyXG4gICAgdGhpcy5ub2RlID0gdHJhaWwgJiYgdHJhaWwubGFzdE5vZGUoKTtcclxuXHJcbiAgICAvLyBwcm9wZXJ0aWVzIHJlbGV2YW50IHRvIHRoZSBub2RlJ3MgZGlyZWN0IHRyYW5zZm9ybVxyXG4gICAgdGhpcy50cmFuc2Zvcm1EaXJ0eSA9IHRydWU7IC8vIHdoZXRoZXIgdGhlIG5vZGUncyB0cmFuc2Zvcm0gaGFzIGNoYW5nZWQgKHVudGlsIHRoZSBwcmUtcmVwYWludCBwaGFzZSlcclxuICAgIHRoaXMubm9kZVRyYW5zZm9ybUxpc3RlbmVyID0gdGhpcy5ub2RlVHJhbnNmb3JtTGlzdGVuZXIgfHwgdGhpcy5vbk5vZGVUcmFuc2Zvcm1EaXJ0eS5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgLy8gdGhlIGFjdHVhbCBjYWNoZWQgdHJhbnNmb3JtIHRvIHRoZSByb290XHJcbiAgICB0aGlzLm1hdHJpeCA9IHRoaXMubWF0cml4IHx8IE1hdHJpeDMuaWRlbnRpdHkoKTtcclxuXHJcbiAgICAvLyB3aGV0aGVyIG91ciBtYXRyaXggaXMgZGlydHlcclxuICAgIHRoaXMucmVsYXRpdmVTZWxmRGlydHkgPSB0cnVlO1xyXG5cclxuICAgIC8vIGhvdyBtYW55IGNoaWxkcmVuIGhhdmUgKG9yIGhhdmUgZGVzY2VuZGFudHMgd2l0aCkgcmVsYXRpdmVUcmFuc2Zvcm1MaXN0ZW5lcnNcclxuICAgIHRoaXMucmVsYXRpdmVDaGlsZHJlbkxpc3RlbmVyc0NvdW50ID0gMDtcclxuXHJcbiAgICAvLyBpZiA+MCwgaW5kaWNhdGVzIHRoaXMgc2hvdWxkIGJlIHByZWNvbXB1dGVkIGluIHRoZSBwcmUtcmVwYWludCBwaGFzZVxyXG4gICAgdGhpcy5yZWxhdGl2ZVByZWNvbXB1dGVDb3VudCA9IDA7XHJcblxyXG4gICAgLy8gaG93IG1hbnkgY2hpbGRyZW4gaGF2ZSAob3IgaGF2ZSBkZXNjZW5kYW50cyB3aXRoKSA+MCByZWxhdGl2ZVByZWNvbXB1dGVDb3VudFxyXG4gICAgdGhpcy5yZWxhdGl2ZUNoaWxkcmVuUHJlY29tcHV0ZUNvdW50ID0gMDtcclxuXHJcbiAgICAvLyB1c2VkIHRvIG1hcmsgd2hhdCBmcmFtZSB0aGUgdHJhbnNmb3JtIHdhcyB1cGRhdGVkIGluICh0byBhY2NlbGVyYXRlIG5vbi1wcmVjb21wdXRlZCByZWxhdGl2ZSB0cmFuc2Zvcm0gYWNjZXNzKVxyXG4gICAgdGhpcy5yZWxhdGl2ZUZyYW1lSWQgPSAtMTtcclxuXHJcbiAgICAvLyBXaGV0aGVyIGNoaWxkcmVuIGhhdmUgZGlydHkgdHJhbnNmb3JtcyAoaWYgaXQgaXMgdGhlIGN1cnJlbnQgZnJhbWUpIE5PVEU6IHVzZWQgb25seSBmb3IgcHJlLXJlcGFpbnQgdHJhdmVyc2FsLFxyXG4gICAgLy8gYW5kIGNhbiBiZSBpZ25vcmVkIGlmIGl0IGhhcyBhIHZhbHVlIGxlc3MgdGhhbiB0aGUgY3VycmVudCBmcmFtZSBJRC4gVGhpcyBhbGxvd3MgdXMgdG8gdHJhdmVyc2UgYW5kIGhpdCBhbGxcclxuICAgIC8vIGxpc3RlbmVycyBmb3IgdGhpcyBwYXJ0aWN1bGFyIHRyYXZlcnNhbCwgd2l0aG91dCBsZWF2aW5nIGFuIGludmFsaWQgc3VidHJlZSAoYSBib29sZWFuIGZsYWcgaGVyZSBpc1xyXG4gICAgLy8gaW5zdWZmaWNpZW50LCBzaW5jZSBvdXIgdHJhdmVyc2FsIGhhbmRsaW5nIHdvdWxkIHZhbGlkYXRlIG91ciBpbnZhcmlhbnQgb2ZcclxuICAgIC8vIHRoaXMucmVsYXRpdmVDaGlsZERpcnR5RnJhbWUgPT4gcGFyZW50LnJlbGF0aXZlQ2hpbGREaXJ0eUZyYW1lKS4gSW4gdGhpcyBjYXNlLCB0aGV5IGFyZSBib3RoIGVmZmVjdGl2ZWx5XHJcbiAgICAvLyBcImZhbHNlXCIgdW5sZXNzIHRoZXkgYXJlIHRoZSBjdXJyZW50IGZyYW1lIElELCBpbiB3aGljaCBjYXNlIHRoYXQgaW52YXJpYW50IGhvbGRzLlxyXG4gICAgdGhpcy5yZWxhdGl2ZUNoaWxkRGlydHlGcmFtZSA9IGRpc3BsYXkgPyBkaXNwbGF5Ll9mcmFtZUlkIDogMDtcclxuXHJcbiAgICAvLyB3aWxsIGJlIG5vdGlmaWVkIGluIHByZS1yZXBhaW50IHBoYXNlIHRoYXQgb3VyIHJlbGF0aXZlIHRyYW5zZm9ybSBoYXMgY2hhbmdlZCAoYnV0IG5vdCBjb21wdXRlZCBieSBkZWZhdWx0KVxyXG4gICAgLy9PSFRXTyBUT0RPOiBzaG91bGQgd2UgcmVseSBvbiBsaXN0ZW5lcnMgcmVtb3ZpbmcgdGhlbXNlbHZlcz9cclxuICAgIHRoaXMucmVsYXRpdmVUcmFuc2Zvcm1MaXN0ZW5lcnMgPSBjbGVhbkFycmF5KCB0aGlzLnJlbGF0aXZlVHJhbnNmb3JtTGlzdGVuZXJzICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7UmVsYXRpdmVUcmFuc2Zvcm18bnVsbH1cclxuICAgKi9cclxuICBnZXQgcGFyZW50KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaW5zdGFuY2UucGFyZW50ID8gdGhpcy5pbnN0YW5jZS5wYXJlbnQucmVsYXRpdmVUcmFuc2Zvcm0gOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gaW5zdGFuY2VcclxuICAgKi9cclxuICBhZGRJbnN0YW5jZSggaW5zdGFuY2UgKSB7XHJcbiAgICBpZiAoIGluc3RhbmNlLnN0YXRlbGVzcyApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIWluc3RhbmNlLnJlbGF0aXZlVHJhbnNmb3JtLmhhc0FuY2VzdG9yTGlzdGVuZXJOZWVkKCksXHJcbiAgICAgICAgJ1dlIG9ubHkgdHJhY2sgY2hhbmdlcyBwcm9wZXJseSBpZiBzdGF0ZWxlc3MgaW5zdGFuY2VzIGRvIG5vdCBoYXZlIG5lZWRzJyApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhaW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0uaGFzQW5jZXN0b3JDb21wdXRlTmVlZCgpLFxyXG4gICAgICAgICdXZSBvbmx5IHRyYWNrIGNoYW5nZXMgcHJvcGVybHkgaWYgc3RhdGVsZXNzIGluc3RhbmNlcyBkbyBub3QgaGF2ZSBuZWVkcycgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBpZiAoIGluc3RhbmNlLnJlbGF0aXZlVHJhbnNmb3JtLmhhc0FuY2VzdG9yTGlzdGVuZXJOZWVkKCkgKSB7XHJcbiAgICAgICAgdGhpcy5pbmNyZW1lbnRUcmFuc2Zvcm1MaXN0ZW5lckNoaWxkcmVuKCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBpbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5oYXNBbmNlc3RvckNvbXB1dGVOZWVkKCkgKSB7XHJcbiAgICAgICAgdGhpcy5pbmNyZW1lbnRUcmFuc2Zvcm1QcmVjb21wdXRlQ2hpbGRyZW4oKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIG1hcmsgdGhlIGluc3RhbmNlJ3MgdHJhbnNmb3JtIGFzIGRpcnR5LCBzbyB0aGF0IGl0IHdpbGwgYmUgcmVhY2hhYmxlIGluIHRoZSBwcmUtcmVwYWludCB0cmF2ZXJzYWwgcGFzc1xyXG4gICAgaW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0uZm9yY2VNYXJrVHJhbnNmb3JtRGlydHkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgcmVtb3ZlSW5zdGFuY2UoIGluc3RhbmNlICkge1xyXG4gICAgaWYgKCBpbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5oYXNBbmNlc3Rvckxpc3RlbmVyTmVlZCgpICkge1xyXG4gICAgICB0aGlzLmRlY3JlbWVudFRyYW5zZm9ybUxpc3RlbmVyQ2hpbGRyZW4oKTtcclxuICAgIH1cclxuICAgIGlmICggaW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0uaGFzQW5jZXN0b3JDb21wdXRlTmVlZCgpICkge1xyXG4gICAgICB0aGlzLmRlY3JlbWVudFRyYW5zZm9ybVByZWNvbXB1dGVDaGlsZHJlbigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGF0dGFjaE5vZGVMaXN0ZW5lcnMoKSB7XHJcbiAgICB0aGlzLm5vZGUudHJhbnNmb3JtRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5ub2RlVHJhbnNmb3JtTGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkZXRhY2hOb2RlTGlzdGVuZXJzKCkge1xyXG4gICAgdGhpcy5ub2RlLnRyYW5zZm9ybUVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMubm9kZVRyYW5zZm9ybUxpc3RlbmVyICk7XHJcbiAgfVxyXG5cclxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgKiBSZWxhdGl2ZSB0cmFuc2Zvcm0gbGlzdGVuZXIgY291bnQgcmVjdXJzaXZlIGhhbmRsaW5nXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogT25seSBmb3IgZGVzY2VuZGFudHMgbmVlZCwgaWdub3JlcyAnc2VsZicgbmVlZCBvbiBpc1RyYW5zZm9ybWVkXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGhhc0Rlc2NlbmRhbnRMaXN0ZW5lck5lZWQoKSB7XHJcbiAgICBpZiAoIHRoaXMuaW5zdGFuY2UuaXNUcmFuc2Zvcm1lZCApIHtcclxuICAgICAgcmV0dXJuIHRoaXMucmVsYXRpdmVDaGlsZHJlbkxpc3RlbmVyc0NvdW50ID4gMDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5yZWxhdGl2ZUNoaWxkcmVuTGlzdGVuZXJzQ291bnQgPiAwIHx8IHRoaXMucmVsYXRpdmVUcmFuc2Zvcm1MaXN0ZW5lcnMubGVuZ3RoID4gMDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE9ubHkgZm9yIGFuY2VzdG9ycyBuZWVkLCBpZ25vcmVzIGNoaWxkIG5lZWQgb24gaXNUcmFuc2Zvcm1lZFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBoYXNBbmNlc3Rvckxpc3RlbmVyTmVlZCgpIHtcclxuICAgIGlmICggdGhpcy5pbnN0YW5jZS5pc1RyYW5zZm9ybWVkICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5yZWxhdGl2ZVRyYW5zZm9ybUxpc3RlbmVycy5sZW5ndGggPiAwO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnJlbGF0aXZlQ2hpbGRyZW5MaXN0ZW5lcnNDb3VudCA+IDAgfHwgdGhpcy5yZWxhdGl2ZVRyYW5zZm9ybUxpc3RlbmVycy5sZW5ndGggPiAwO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGhhc1NlbGZMaXN0ZW5lck5lZWQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5yZWxhdGl2ZVRyYW5zZm9ybUxpc3RlbmVycy5sZW5ndGggPiAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIG9uIHRoZSBhbmNlc3RvciBvZiB0aGUgaW5zdGFuY2Ugd2l0aCB0aGUgbmVlZFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaW5jcmVtZW50VHJhbnNmb3JtTGlzdGVuZXJDaGlsZHJlbigpIHtcclxuICAgIGNvbnN0IGJlZm9yZSA9IHRoaXMuaGFzQW5jZXN0b3JMaXN0ZW5lck5lZWQoKTtcclxuXHJcbiAgICB0aGlzLnJlbGF0aXZlQ2hpbGRyZW5MaXN0ZW5lcnNDb3VudCsrO1xyXG4gICAgaWYgKCBiZWZvcmUgIT09IHRoaXMuaGFzQW5jZXN0b3JMaXN0ZW5lck5lZWQoKSApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaW5zdGFuY2UuaXNUcmFuc2Zvcm1lZCwgJ1Nob3VsZCBub3QgYmUgYSBjaGFuZ2UgaW4gbmVlZCBpZiB3ZSBoYXZlIHRoZSBpc1RyYW5zZm9ybWVkIGZsYWcnICk7XHJcblxyXG4gICAgICB0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5pbmNyZW1lbnRUcmFuc2Zvcm1MaXN0ZW5lckNoaWxkcmVuKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgb24gdGhlIGFuY2VzdG9yIG9mIHRoZSBpbnN0YW5jZSB3aXRoIHRoZSBuZWVkXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBkZWNyZW1lbnRUcmFuc2Zvcm1MaXN0ZW5lckNoaWxkcmVuKCkge1xyXG4gICAgY29uc3QgYmVmb3JlID0gdGhpcy5oYXNBbmNlc3Rvckxpc3RlbmVyTmVlZCgpO1xyXG5cclxuICAgIHRoaXMucmVsYXRpdmVDaGlsZHJlbkxpc3RlbmVyc0NvdW50LS07XHJcbiAgICBpZiAoIGJlZm9yZSAhPT0gdGhpcy5oYXNBbmNlc3Rvckxpc3RlbmVyTmVlZCgpICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pbnN0YW5jZS5pc1RyYW5zZm9ybWVkLCAnU2hvdWxkIG5vdCBiZSBhIGNoYW5nZSBpbiBuZWVkIGlmIHdlIGhhdmUgdGhlIGlzVHJhbnNmb3JtZWQgZmxhZycgKTtcclxuXHJcbiAgICAgIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LmRlY3JlbWVudFRyYW5zZm9ybUxpc3RlbmVyQ2hpbGRyZW4oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCBvbiB0aGUgaW5zdGFuY2UgaXRzZWxmXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXJcclxuICAgKi9cclxuICBhZGRMaXN0ZW5lciggbGlzdGVuZXIgKSB7XHJcbiAgICBjb25zdCBiZWZvcmUgPSB0aGlzLmhhc0FuY2VzdG9yTGlzdGVuZXJOZWVkKCk7XHJcblxyXG4gICAgdGhpcy5yZWxhdGl2ZVRyYW5zZm9ybUxpc3RlbmVycy5wdXNoKCBsaXN0ZW5lciApO1xyXG4gICAgaWYgKCBiZWZvcmUgIT09IHRoaXMuaGFzQW5jZXN0b3JMaXN0ZW5lck5lZWQoKSApIHtcclxuICAgICAgdGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQuaW5jcmVtZW50VHJhbnNmb3JtTGlzdGVuZXJDaGlsZHJlbigpO1xyXG5cclxuICAgICAgLy8gaWYgd2UganVzdCB3ZW50IGZyb20gXCJub3QgbmVlZGluZyB0byBiZSB0cmF2ZXJzZWRcIiB0byBcIm5lZWRpbmcgdG8gYmUgdHJhdmVyc2VkXCIsIG1hcmsgb3Vyc2VsdmVzIGFzIGRpcnR5IHNvXHJcbiAgICAgIC8vIHRoYXQgd2UgZm9yLXN1cmUgZ2V0IGZ1dHVyZSB1cGRhdGVzXHJcbiAgICAgIGlmICggIXRoaXMuaGFzQW5jZXN0b3JDb21wdXRlTmVlZCgpICkge1xyXG4gICAgICAgIC8vIFRPRE86IGNhbiB3ZSBkbyBiZXR0ZXIgdGhhbiB0aGlzP1xyXG4gICAgICAgIHRoaXMuZm9yY2VNYXJrVHJhbnNmb3JtRGlydHkoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIG9uIHRoZSBpbnN0YW5jZSBpdHNlbGZcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaXN0ZW5lclxyXG4gICAqL1xyXG4gIHJlbW92ZUxpc3RlbmVyKCBsaXN0ZW5lciApIHtcclxuICAgIGNvbnN0IGJlZm9yZSA9IHRoaXMuaGFzQW5jZXN0b3JMaXN0ZW5lck5lZWQoKTtcclxuXHJcbiAgICAvLyBUT0RPOiByZXBsYWNlIHdpdGggYSAncmVtb3ZlJyBmdW5jdGlvbiBjYWxsXHJcbiAgICB0aGlzLnJlbGF0aXZlVHJhbnNmb3JtTGlzdGVuZXJzLnNwbGljZSggXy5pbmRleE9mKCB0aGlzLnJlbGF0aXZlVHJhbnNmb3JtTGlzdGVuZXJzLCBsaXN0ZW5lciApLCAxICk7XHJcbiAgICBpZiAoIGJlZm9yZSAhPT0gdGhpcy5oYXNBbmNlc3Rvckxpc3RlbmVyTmVlZCgpICkge1xyXG4gICAgICB0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5kZWNyZW1lbnRUcmFuc2Zvcm1MaXN0ZW5lckNoaWxkcmVuKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgKiBSZWxhdGl2ZSB0cmFuc2Zvcm0gcHJlY29tcHV0ZSBmbGFnIHJlY3Vyc2l2ZSBoYW5kbGluZ1xyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gIC8qKlxyXG4gICAqIE9ubHkgZm9yIGRlc2NlbmRhbnRzIG5lZWQsIGlnbm9yZXMgJ3NlbGYnIG5lZWQgb24gaXNUcmFuc2Zvcm1lZFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBoYXNEZXNjZW5kYW50Q29tcHV0ZU5lZWQoKSB7XHJcbiAgICBpZiAoIHRoaXMuaW5zdGFuY2UuaXNUcmFuc2Zvcm1lZCApIHtcclxuICAgICAgcmV0dXJuIHRoaXMucmVsYXRpdmVDaGlsZHJlblByZWNvbXB1dGVDb3VudCA+IDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMucmVsYXRpdmVDaGlsZHJlblByZWNvbXB1dGVDb3VudCA+IDAgfHwgdGhpcy5yZWxhdGl2ZVByZWNvbXB1dGVDb3VudCA+IDA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBPbmx5IGZvciBhbmNlc3RvcnMgbmVlZCwgaWdub3JlcyBjaGlsZCBuZWVkIG9uIGlzVHJhbnNmb3JtZWRcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaGFzQW5jZXN0b3JDb21wdXRlTmVlZCgpIHtcclxuICAgIGlmICggdGhpcy5pbnN0YW5jZS5pc1RyYW5zZm9ybWVkICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5yZWxhdGl2ZVByZWNvbXB1dGVDb3VudCA+IDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMucmVsYXRpdmVDaGlsZHJlblByZWNvbXB1dGVDb3VudCA+IDAgfHwgdGhpcy5yZWxhdGl2ZVByZWNvbXB1dGVDb3VudCA+IDA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaGFzU2VsZkNvbXB1dGVOZWVkKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucmVsYXRpdmVQcmVjb21wdXRlQ291bnQgPiAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIG9uIHRoZSBhbmNlc3RvciBvZiB0aGUgaW5zdGFuY2Ugd2l0aCB0aGUgbmVlZFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaW5jcmVtZW50VHJhbnNmb3JtUHJlY29tcHV0ZUNoaWxkcmVuKCkge1xyXG4gICAgY29uc3QgYmVmb3JlID0gdGhpcy5oYXNBbmNlc3RvckNvbXB1dGVOZWVkKCk7XHJcblxyXG4gICAgdGhpcy5yZWxhdGl2ZUNoaWxkcmVuUHJlY29tcHV0ZUNvdW50Kys7XHJcbiAgICBpZiAoIGJlZm9yZSAhPT0gdGhpcy5oYXNBbmNlc3RvckNvbXB1dGVOZWVkKCkgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmluc3RhbmNlLmlzVHJhbnNmb3JtZWQsICdTaG91bGQgbm90IGJlIGEgY2hhbmdlIGluIG5lZWQgaWYgd2UgaGF2ZSB0aGUgaXNUcmFuc2Zvcm1lZCBmbGFnJyApO1xyXG5cclxuICAgICAgdGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQuaW5jcmVtZW50VHJhbnNmb3JtUHJlY29tcHV0ZUNoaWxkcmVuKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgb24gdGhlIGFuY2VzdG9yIG9mIHRoZSBpbnN0YW5jZSB3aXRoIHRoZSBuZWVkXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBkZWNyZW1lbnRUcmFuc2Zvcm1QcmVjb21wdXRlQ2hpbGRyZW4oKSB7XHJcbiAgICBjb25zdCBiZWZvcmUgPSB0aGlzLmhhc0FuY2VzdG9yQ29tcHV0ZU5lZWQoKTtcclxuXHJcbiAgICB0aGlzLnJlbGF0aXZlQ2hpbGRyZW5QcmVjb21wdXRlQ291bnQtLTtcclxuICAgIGlmICggYmVmb3JlICE9PSB0aGlzLmhhc0FuY2VzdG9yQ29tcHV0ZU5lZWQoKSApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaW5zdGFuY2UuaXNUcmFuc2Zvcm1lZCwgJ1Nob3VsZCBub3QgYmUgYSBjaGFuZ2UgaW4gbmVlZCBpZiB3ZSBoYXZlIHRoZSBpc1RyYW5zZm9ybWVkIGZsYWcnICk7XHJcblxyXG4gICAgICB0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5kZWNyZW1lbnRUcmFuc2Zvcm1QcmVjb21wdXRlQ2hpbGRyZW4oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCBvbiB0aGUgaW5zdGFuY2UgaXRzZWxmXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFkZFByZWNvbXB1dGUoKSB7XHJcbiAgICBjb25zdCBiZWZvcmUgPSB0aGlzLmhhc0FuY2VzdG9yQ29tcHV0ZU5lZWQoKTtcclxuXHJcbiAgICB0aGlzLnJlbGF0aXZlUHJlY29tcHV0ZUNvdW50Kys7XHJcbiAgICBpZiAoIGJlZm9yZSAhPT0gdGhpcy5oYXNBbmNlc3RvckNvbXB1dGVOZWVkKCkgKSB7XHJcbiAgICAgIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LmluY3JlbWVudFRyYW5zZm9ybVByZWNvbXB1dGVDaGlsZHJlbigpO1xyXG5cclxuICAgICAgLy8gaWYgd2UganVzdCB3ZW50IGZyb20gXCJub3QgbmVlZGluZyB0byBiZSB0cmF2ZXJzZWRcIiB0byBcIm5lZWRpbmcgdG8gYmUgdHJhdmVyc2VkXCIsIG1hcmsgb3Vyc2VsdmVzIGFzIGRpcnR5IHNvXHJcbiAgICAgIC8vIHRoYXQgd2UgZm9yLXN1cmUgZ2V0IGZ1dHVyZSB1cGRhdGVzXHJcbiAgICAgIGlmICggIXRoaXMuaGFzQW5jZXN0b3JMaXN0ZW5lck5lZWQoKSApIHtcclxuICAgICAgICAvLyBUT0RPOiBjYW4gd2UgZG8gYmV0dGVyIHRoYW4gdGhpcz9cclxuICAgICAgICB0aGlzLmZvcmNlTWFya1RyYW5zZm9ybURpcnR5KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCBvbiB0aGUgaW5zdGFuY2UgaXRzZWxmXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlbW92ZVByZWNvbXB1dGUoKSB7XHJcbiAgICBjb25zdCBiZWZvcmUgPSB0aGlzLmhhc0FuY2VzdG9yQ29tcHV0ZU5lZWQoKTtcclxuXHJcbiAgICB0aGlzLnJlbGF0aXZlUHJlY29tcHV0ZUNvdW50LS07XHJcbiAgICBpZiAoIGJlZm9yZSAhPT0gdGhpcy5oYXNBbmNlc3RvckNvbXB1dGVOZWVkKCkgKSB7XHJcbiAgICAgIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LmRlY3JlbWVudFRyYW5zZm9ybVByZWNvbXB1dGVDaGlsZHJlbigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogUmVsYXRpdmUgdHJhbnNmb3JtIGhhbmRsaW5nXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGltbWVkaWF0ZWx5IHdoZW4gdGhlIGNvcnJlc3BvbmRpbmcgbm9kZSBoYXMgYSB0cmFuc2Zvcm0gY2hhbmdlIChjYW4gaGFwcGVuIG11bHRpcGxlIHRpbWVzIGJldHdlZW4gcmVuZGVycylcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIG9uTm9kZVRyYW5zZm9ybURpcnR5KCkge1xyXG4gICAgaWYgKCAhdGhpcy50cmFuc2Zvcm1EaXJ0eSApIHtcclxuICAgICAgdGhpcy5mb3JjZU1hcmtUcmFuc2Zvcm1EaXJ0eSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBmb3JjZU1hcmtUcmFuc2Zvcm1EaXJ0eSgpIHtcclxuICAgIHRoaXMudHJhbnNmb3JtRGlydHkgPSB0cnVlO1xyXG4gICAgdGhpcy5yZWxhdGl2ZVNlbGZEaXJ0eSA9IHRydWU7XHJcblxyXG4gICAgY29uc3QgZnJhbWVJZCA9IHRoaXMuZGlzcGxheS5fZnJhbWVJZDtcclxuXHJcbiAgICAvLyBtYXJrIGFsbCBhbmNlc3RvcnMgd2l0aCByZWxhdGl2ZUNoaWxkRGlydHlGcmFtZSwgYmFpbGluZyBvdXQgd2hlbiBwb3NzaWJsZVxyXG4gICAgbGV0IGluc3RhbmNlID0gdGhpcy5pbnN0YW5jZS5wYXJlbnQ7XHJcbiAgICB3aGlsZSAoIGluc3RhbmNlICYmIGluc3RhbmNlLnJlbGF0aXZlVHJhbnNmb3JtLnJlbGF0aXZlQ2hpbGREaXJ0eUZyYW1lICE9PSBmcmFtZUlkICkge1xyXG4gICAgICBjb25zdCBwYXJlbnRJbnN0YW5jZSA9IGluc3RhbmNlLnBhcmVudDtcclxuICAgICAgY29uc3QgaXNUcmFuc2Zvcm1lZCA9IGluc3RhbmNlLmlzVHJhbnNmb3JtZWQ7XHJcblxyXG4gICAgICAvLyBOT1RFOiBvdXIgd2hpbGUgbG9vcCBndWFyYW50ZWVzIHRoYXQgaXQgd2Fzbid0IGZyYW1lSWRcclxuICAgICAgaW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0ucmVsYXRpdmVDaGlsZERpcnR5RnJhbWUgPSBmcmFtZUlkO1xyXG5cclxuICAgICAgLy8gYWx3YXlzIG1hcmsgYW4gaW5zdGFuY2Ugd2l0aG91dCBhIHBhcmVudCAocm9vdCBpbnN0YW5jZSEpXHJcbiAgICAgIGlmICggcGFyZW50SW5zdGFuY2UgPT09IG51bGwgKSB7XHJcbiAgICAgICAgLy8gcGFzc1RyYW5zZm9ybSBkZXBlbmRzIG9uIHdoZXRoZXIgaXQgaXMgbWFya2VkIGFzIGEgdHJhbnNmb3JtIHJvb3RcclxuICAgICAgICB0aGlzLmRpc3BsYXkubWFya1RyYW5zZm9ybVJvb3REaXJ0eSggaW5zdGFuY2UsIGlzVHJhbnNmb3JtZWQgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggaXNUcmFuc2Zvcm1lZCApIHtcclxuICAgICAgICB0aGlzLmRpc3BsYXkubWFya1RyYW5zZm9ybVJvb3REaXJ0eSggaW5zdGFuY2UsIHRydWUgKTsgLy8gcGFzc1RyYW5zZm9ybSB0cnVlXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGluc3RhbmNlID0gcGFyZW50SW5zdGFuY2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIG91ciBtYXRyaXggYmFzZWQgb24gYW55IHBhcmVudHMsIGFuZCB0aGUgbm9kZSdzIGN1cnJlbnQgdHJhbnNmb3JtXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjb21wdXRlUmVsYXRpdmVUcmFuc2Zvcm0oKSB7XHJcbiAgICBjb25zdCBub2RlTWF0cml4ID0gdGhpcy5ub2RlLmdldE1hdHJpeCgpO1xyXG5cclxuICAgIGlmICggdGhpcy5pbnN0YW5jZS5wYXJlbnQgJiYgIXRoaXMuaW5zdGFuY2UucGFyZW50LmlzVHJhbnNmb3JtZWQgKSB7XHJcbiAgICAgIC8vIG11dGFibGUgZm9ybSBvZiBwYXJlbnRNYXRyaXggKiBub2RlTWF0cml4XHJcbiAgICAgIHRoaXMubWF0cml4LnNldCggdGhpcy5wYXJlbnQubWF0cml4ICk7XHJcbiAgICAgIHRoaXMubWF0cml4Lm11bHRpcGx5TWF0cml4KCBub2RlTWF0cml4ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gd2UgYXJlIHRoZSBmaXJzdCBpbiB0aGUgdHJhaWwgdHJhbnNmb3JtLCBzbyB3ZSBqdXN0IGRpcmVjdGx5IGNvcHkgdGhlIG1hdHJpeCBvdmVyXHJcbiAgICAgIHRoaXMubWF0cml4LnNldCggbm9kZU1hdHJpeCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1hcmsgdGhlIGZyYW1lIHdoZXJlIHRoaXMgdHJhbnNmb3JtIHdhcyB1cGRhdGVkLCB0byBhY2NlbGVyYXRlIG5vbi1wcmVjb21wdXRlZCBhY2Nlc3NcclxuICAgIHRoaXMucmVsYXRpdmVGcmFtZUlkID0gdGhpcy5kaXNwbGF5Ll9mcmFtZUlkO1xyXG4gICAgdGhpcy5yZWxhdGl2ZVNlbGZEaXJ0eSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNWYWxpZGF0aW9uTm90TmVlZGVkKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaGFzQW5jZXN0b3JDb21wdXRlTmVlZCgpIHx8IHRoaXMucmVsYXRpdmVGcmFtZUlkID09PSB0aGlzLmRpc3BsYXkuX2ZyYW1lSWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgZnJvbSBhbnkgcGxhY2UgaW4gdGhlIHJlbmRlcmluZyBwcm9jZXNzIHdoZXJlIHdlIGFyZSBub3QgZ3VhcmFudGVlZCB0byBoYXZlIGEgZnJlc2ggcmVsYXRpdmUgdHJhbnNmb3JtLlxyXG4gICAqIG5lZWRzIHRvIHNjYW4gdXAgdGhlIHRyZWUsIHNvIGl0IGlzIG1vcmUgZXhwZW5zaXZlIHRoYW4gcHJlY29tcHV0ZWQgdHJhbnNmb3Jtcy5cclxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHdlIGhhZCB0byB1cGRhdGUgdGhpcyB0cmFuc2Zvcm1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdmFsaWRhdGUoKSB7XHJcbiAgICAvLyBpZiB3ZSBhcmUgY2xlYW4sIGJhaWwgb3V0LiBJZiB3ZSBoYXZlIGEgY29tcHV0ZSBcIm5lZWRcIiwgd2Ugd2lsbCBhbHdheXMgYmUgY2xlYW4gaGVyZSBzaW5jZSB0aGlzIGlzIGFmdGVyIHRoZVxyXG4gICAgLy8gdHJhdmVyc2FsIHN0ZXAuIElmIHdlIGRpZCBub3QgaGF2ZSBhIGNvbXB1dGUgXCJuZWVkXCIsIHdlIGNoZWNrIHdoZXRoZXIgd2Ugd2VyZSBhbHJlYWR5IHVwZGF0ZWQgdGhpcyBmcmFtZSBieVxyXG4gICAgLy8gY29tcHV0ZVJlbGF0aXZlVHJhbnNmb3JtLlxyXG4gICAgaWYgKCB0aGlzLmlzVmFsaWRhdGlvbk5vdE5lZWRlZCgpICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgd2UgYXJlIG5vdCB0aGUgZmlyc3QgdHJhbnNmb3JtIGZyb20gdGhlIHJvb3QsIHZhbGlkYXRlIG91ciBwYXJlbnQuIGlzVHJhbnNmb3JtIGNoZWNrIHByZXZlbnRzIHVzIGZyb21cclxuICAgIC8vIHBhc3NpbmcgYSB0cmFuc2Zvcm0gcm9vdC5cclxuICAgIGlmICggdGhpcy5pbnN0YW5jZS5wYXJlbnQgJiYgIXRoaXMuaW5zdGFuY2UucGFyZW50LmlzVHJhbnNmb3JtZWQgKSB7XHJcbiAgICAgIHRoaXMucGFyZW50LnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdmFsaWRhdGlvbiBvZiB0aGUgcGFyZW50IG1heSBoYXZlIGNoYW5nZWQgb3VyIHJlbGF0aXZlU2VsZkRpcnR5IGZsYWcgdG8gdHJ1ZSwgc28gd2UgY2hlY2sgbm93IChjb3VsZCBhbHNvIGhhdmVcclxuICAgIC8vIGJlZW4gdHJ1ZSBiZWZvcmUpXHJcbiAgICBpZiAoIHRoaXMucmVsYXRpdmVTZWxmRGlydHkgKSB7XHJcbiAgICAgIC8vIGNvbXB1dGUgdGhlIHRyYW5zZm9ybSwgYW5kIG1hcmsgdXMgYXMgbm90IHJlbGF0aXZlLWRpcnR5XHJcbiAgICAgIHRoaXMuY29tcHV0ZVJlbGF0aXZlVHJhbnNmb3JtKCk7XHJcblxyXG4gICAgICAvLyBtYXJrIGFsbCBjaGlsZHJlbiBub3cgYXMgZGlydHksIHNpbmNlIHdlIGhhZCB0byB1cGRhdGUgKG1hcmtlZCBzbyB0aGF0IG90aGVyIGNoaWxkcmVuIGZyb20gdGhlIG9uZSB3ZSBhcmVcclxuICAgICAgLy8gdmFsaWRhdGluZyB3aWxsIGtub3cgdGhhdCB0aGV5IG5lZWQgdXBkYXRlcylcclxuICAgICAgLy8gaWYgd2Ugd2VyZSBjYWxsZWQgZnJvbSBhIGNoaWxkJ3MgdmFsaWRhdGUoKSwgdGhleSB3aWxsIG5vdyBuZWVkIHRvIGNvbXB1dGUgdGhlaXIgdHJhbnNmb3JtXHJcbiAgICAgIGNvbnN0IGxlbiA9IHRoaXMuaW5zdGFuY2UuY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZW47IGkrKyApIHtcclxuICAgICAgICB0aGlzLmluc3RhbmNlLmNoaWxkcmVuWyBpIF0ucmVsYXRpdmVUcmFuc2Zvcm0ucmVsYXRpdmVTZWxmRGlydHkgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgZHVyaW5nIHRoZSBwcmUtcmVwYWludCBwaGFzZSB0byAoYSkgZmlyZSBvZmYgYWxsIHJlbGF0aXZlIHRyYW5zZm9ybSBsaXN0ZW5lcnMgdGhhdCBzaG91bGQgYmUgZmlyZWQsIGFuZFxyXG4gICAqIChiKSBwcmVjb21wdXRlIHRyYW5zZm9ybXMgd2VyZSBkZXNpcmVkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYW5jZXN0b3JXYXNEaXJ0eVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYW5jZXN0b3JJc0RpcnR5XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGZyYW1lSWRcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHBhc3NUcmFuc2Zvcm1cclxuICAgKi9cclxuICB1cGRhdGVUcmFuc2Zvcm1MaXN0ZW5lcnNBbmRDb21wdXRlKCBhbmNlc3Rvcldhc0RpcnR5LCBhbmNlc3RvcklzRGlydHksIGZyYW1lSWQsIHBhc3NUcmFuc2Zvcm0gKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUmVsYXRpdmVUcmFuc2Zvcm0gJiYgc2NlbmVyeUxvZy5SZWxhdGl2ZVRyYW5zZm9ybShcclxuICAgICAgYHVwZGF0ZS9jb21wdXRlOiAke3RoaXMudG9TdHJpbmcoKX0gJHthbmNlc3Rvcldhc0RpcnR5fSA9PiAke2FuY2VzdG9ySXNEaXJ0eVxyXG4gICAgICB9JHtwYXNzVHJhbnNmb3JtID8gJyBwYXNzVHJhbnNmb3JtJyA6ICcnfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5SZWxhdGl2ZVRyYW5zZm9ybSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBsZXQgbGVuO1xyXG4gICAgbGV0IGk7XHJcblxyXG4gICAgaWYgKCBwYXNzVHJhbnNmb3JtICkge1xyXG4gICAgICAvLyBpZiB3ZSBhcmUgcGFzc2luZyBpc1RyYW5zZm9ybSwganVzdCBhcHBseSB0aGlzIHRvIHRoZSBjaGlsZHJlblxyXG4gICAgICBsZW4gPSB0aGlzLmluc3RhbmNlLmNoaWxkcmVuLmxlbmd0aDtcclxuICAgICAgZm9yICggaSA9IDA7IGkgPCBsZW47IGkrKyApIHtcclxuICAgICAgICB0aGlzLmluc3RhbmNlLmNoaWxkcmVuWyBpIF0ucmVsYXRpdmVUcmFuc2Zvcm0udXBkYXRlVHJhbnNmb3JtTGlzdGVuZXJzQW5kQ29tcHV0ZSggZmFsc2UsIGZhbHNlLCBmcmFtZUlkLCBmYWxzZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3Qgd2FzRGlydHkgPSBhbmNlc3Rvcldhc0RpcnR5IHx8IHRoaXMucmVsYXRpdmVTZWxmRGlydHk7XHJcbiAgICAgIGNvbnN0IHdhc1N1YnRyZWVEaXJ0eSA9IHdhc0RpcnR5IHx8IHRoaXMucmVsYXRpdmVDaGlsZERpcnR5RnJhbWUgPT09IGZyYW1lSWQ7XHJcbiAgICAgIGNvbnN0IGhhc0NvbXB1dGVOZWVkID0gdGhpcy5oYXNEZXNjZW5kYW50Q29tcHV0ZU5lZWQoKTtcclxuICAgICAgY29uc3QgaGFzTGlzdGVuZXJOZWVkID0gdGhpcy5oYXNEZXNjZW5kYW50TGlzdGVuZXJOZWVkKCk7XHJcbiAgICAgIGNvbnN0IGhhc1NlbGZDb21wdXRlTmVlZCA9IHRoaXMuaGFzU2VsZkNvbXB1dGVOZWVkKCk7XHJcbiAgICAgIGNvbnN0IGhhc1NlbGZMaXN0ZW5lck5lZWQgPSB0aGlzLmhhc1NlbGZMaXN0ZW5lck5lZWQoKTtcclxuXHJcbiAgICAgIC8vIGlmIG91ciByZWxhdGl2ZSB0cmFuc2Zvcm0gd2lsbCBiZSBkaXJ0eSBidXQgb3VyIHBhcmVudHMnIHRyYW5zZm9ybSB3aWxsIGJlIGNsZWFuLCB3ZSBuZWVkIHRvIG1hcmsgb3Vyc2VsdmVzXHJcbiAgICAgIC8vIGFzIGRpcnR5IChzbyB0aGF0IGxhdGVyIGFjY2VzcyBjYW4gaWRlbnRpZnkgd2UgYXJlIGRpcnR5KS5cclxuICAgICAgaWYgKCAhaGFzQ29tcHV0ZU5lZWQgJiYgd2FzRGlydHkgJiYgIWFuY2VzdG9ySXNEaXJ0eSApIHtcclxuICAgICAgICB0aGlzLnJlbGF0aXZlU2VsZkRpcnR5ID0gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gY2hlY2sgaWYgdHJhdmVyc2FsIGlzbid0IG5lZWRlZCAobm8gaW5zdGFuY2VzIG1hcmtlZCBhcyBoYXZpbmcgbGlzdGVuZXJzIG9yIG5lZWRpbmcgY29tcHV0YXRpb24pXHJcbiAgICAgIC8vIGVpdGhlciB0aGUgc3VidHJlZSBpcyBjbGVhbiAobm8gdHJhdmVyc2FsIG5lZWRlZCBmb3IgY29tcHV0ZS9saXN0ZW5lcnMpLCBvciB3ZSBoYXZlIG5vIGNvbXB1dGUvbGlzdGVuZXIgbmVlZHNcclxuICAgICAgaWYgKCAhd2FzU3VidHJlZURpcnR5IHx8ICggIWhhc0NvbXB1dGVOZWVkICYmICFoYXNMaXN0ZW5lck5lZWQgJiYgIWhhc1NlbGZDb21wdXRlTmVlZCAmJiAhaGFzU2VsZkxpc3RlbmVyTmVlZCApICkge1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5SZWxhdGl2ZVRyYW5zZm9ybSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaWYgZGVzaXJlZCwgY29tcHV0ZSB0aGUgdHJhbnNmb3JtXHJcbiAgICAgIGlmICggd2FzRGlydHkgJiYgKCBoYXNDb21wdXRlTmVlZCB8fCBoYXNTZWxmQ29tcHV0ZU5lZWQgKSApIHtcclxuICAgICAgICAvLyBjb21wdXRlIHRoaXMgdHJhbnNmb3JtIGluIHRoZSBwcmUtcmVwYWludCBwaGFzZSwgc28gaXQgaXMgY2hlYXAgd2hlbiBhbHdheXMgdXNlZC9cclxuICAgICAgICAvLyB3ZSB1cGRhdGUgd2hlbiB0aGUgY2hpbGQtcHJlY29tcHV0ZSBjb3VudCA+MCwgc2luY2UgdGhvc2UgY2hpbGRyZW4gd2lsbCBuZWVkXHJcbiAgICAgICAgdGhpcy5jb21wdXRlUmVsYXRpdmVUcmFuc2Zvcm0oKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCB0aGlzLnRyYW5zZm9ybURpcnR5ICkge1xyXG4gICAgICAgIHRoaXMudHJhbnNmb3JtRGlydHkgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gbm8gaGFzTGlzdGVuZXJOZWVkIGd1YXJkIG5lZWRlZD9cclxuICAgICAgdGhpcy5ub3RpZnlSZWxhdGl2ZVRyYW5zZm9ybUxpc3RlbmVycygpO1xyXG5cclxuICAgICAgLy8gb25seSB1cGRhdGUgY2hpbGRyZW4gaWYgd2UgYXJlbid0IHRyYW5zZm9ybWVkIChjb21wbGV0ZWx5IG90aGVyIGNvbnRleHQpXHJcbiAgICAgIGlmICggIXRoaXMuaW5zdGFuY2UuaXNUcmFuc2Zvcm1lZCB8fCBwYXNzVHJhbnNmb3JtICkge1xyXG5cclxuICAgICAgICBjb25zdCBpc0RpcnR5ID0gd2FzRGlydHkgJiYgISggaGFzQ29tcHV0ZU5lZWQgfHwgaGFzU2VsZkNvbXB1dGVOZWVkICk7XHJcblxyXG4gICAgICAgIC8vIGNvbnRpbnVlIHRoZSB0cmF2ZXJzYWxcclxuICAgICAgICBsZW4gPSB0aGlzLmluc3RhbmNlLmNoaWxkcmVuLmxlbmd0aDtcclxuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGxlbjsgaSsrICkge1xyXG4gICAgICAgICAgdGhpcy5pbnN0YW5jZS5jaGlsZHJlblsgaSBdLnJlbGF0aXZlVHJhbnNmb3JtLnVwZGF0ZVRyYW5zZm9ybUxpc3RlbmVyc0FuZENvbXB1dGUoIHdhc0RpcnR5LCBpc0RpcnR5LCBmcmFtZUlkLCBmYWxzZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5SZWxhdGl2ZVRyYW5zZm9ybSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBub3RpZnlSZWxhdGl2ZVRyYW5zZm9ybUxpc3RlbmVycygpIHtcclxuICAgIGNvbnN0IGxlbiA9IHRoaXMucmVsYXRpdmVUcmFuc2Zvcm1MaXN0ZW5lcnMubGVuZ3RoO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XHJcbiAgICAgIHRoaXMucmVsYXRpdmVUcmFuc2Zvcm1MaXN0ZW5lcnNbIGkgXSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGZyYW1lSWRcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFsbG93VmFsaWRhdGlvbk5vdE5lZWRlZENoZWNrc1xyXG4gICAqL1xyXG4gIGF1ZGl0KCBmcmFtZUlkLCBhbGxvd1ZhbGlkYXRpb25Ob3ROZWVkZWRDaGVja3MgKSB7XHJcbiAgICAvLyBnZXQgdGhlIHJlbGF0aXZlIG1hdHJpeCwgY29tcHV0ZWQgdG8gYmUgdXAtdG8tZGF0ZSwgYW5kIGlnbm9yZXMgYW55IGZsYWdzL2NvdW50cyBzbyB3ZSBjYW4gY2hlY2sgd2hldGhlciBvdXJcclxuICAgIC8vIHN0YXRlIGlzIGNvbnNpc3RlbnRcclxuICAgIGZ1bmN0aW9uIGN1cnJlbnRSZWxhdGl2ZU1hdHJpeCggaW5zdGFuY2UgKSB7XHJcbiAgICAgIGNvbnN0IHJlc3VsdE1hdHJpeCA9IE1hdHJpeDMucG9vbC5mZXRjaCgpO1xyXG4gICAgICBjb25zdCBub2RlTWF0cml4ID0gaW5zdGFuY2Uubm9kZS5nZXRNYXRyaXgoKTtcclxuXHJcbiAgICAgIGlmICggIWluc3RhbmNlLnBhcmVudCApIHtcclxuICAgICAgICAvLyBpZiBvdXIgaW5zdGFuY2UgaGFzIG5vIHBhcmVudCwgaWdub3JlIGl0cyB0cmFuc2Zvcm1cclxuICAgICAgICByZXN1bHRNYXRyaXguc2V0KCBNYXRyaXgzLklERU5USVRZICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoICFpbnN0YW5jZS5wYXJlbnQuaXNUcmFuc2Zvcm1lZCApIHtcclxuICAgICAgICAvLyBtdXRhYmxlIGZvcm0gb2YgcGFyZW50TWF0cml4ICogbm9kZU1hdHJpeFxyXG4gICAgICAgIHJlc3VsdE1hdHJpeC5zZXQoIGN1cnJlbnRSZWxhdGl2ZU1hdHJpeCggaW5zdGFuY2UucGFyZW50ICkgKTtcclxuICAgICAgICByZXN1bHRNYXRyaXgubXVsdGlwbHlNYXRyaXgoIG5vZGVNYXRyaXggKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyB3ZSBhcmUgdGhlIGZpcnN0IGluIHRoZSB0cmFpbCB0cmFuc2Zvcm0sIHNvIHdlIGp1c3QgZGlyZWN0bHkgY29weSB0aGUgbWF0cml4IG92ZXJcclxuICAgICAgICByZXN1bHRNYXRyaXguc2V0KCBub2RlTWF0cml4ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiByZXN1bHRNYXRyaXg7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaGFzUmVsYXRpdmVTZWxmRGlydHkoIGluc3RhbmNlICkge1xyXG4gICAgICAvLyBpZiB2YWxpZGF0aW9uIGlzbid0IG5lZWRlZCwgYWN0IGxpa2Ugbm90aGluZyBpcyBkaXJ0eSAobWF0Y2hpbmcgb3VyIHZhbGlkYXRlIGJlaGF2aW9yKVxyXG4gICAgICBpZiAoIGFsbG93VmFsaWRhdGlvbk5vdE5lZWRlZENoZWNrcyAmJiBpbnN0YW5jZS5pc1ZhbGlkYXRpb25Ob3ROZWVkZWQoKSApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBpbnN0YW5jZS5yZWxhdGl2ZVNlbGZEaXJ0eSB8fCAoIGluc3RhbmNlLnBhcmVudCAmJiBoYXNSZWxhdGl2ZVNlbGZEaXJ0eSggaW5zdGFuY2UucGFyZW50ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XHJcbiAgICAgIC8vIGNvdW50IHZlcmlmaWNhdGlvbiBmb3IgaW52YXJpYW50c1xyXG4gICAgICBsZXQgbm90aWZ5UmVsYXRpdmVDb3VudCA9IDA7XHJcbiAgICAgIGxldCBwcmVjb21wdXRlUmVsYXRpdmVDb3VudCA9IDA7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuaW5zdGFuY2UuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgY2hpbGRJbnN0YW5jZSA9IHRoaXMuaW5zdGFuY2UuY2hpbGRyZW5bIGkgXTtcclxuXHJcbiAgICAgICAgaWYgKCBjaGlsZEluc3RhbmNlLnJlbGF0aXZlVHJhbnNmb3JtLmhhc0FuY2VzdG9yTGlzdGVuZXJOZWVkKCkgKSB7XHJcbiAgICAgICAgICBub3RpZnlSZWxhdGl2ZUNvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggY2hpbGRJbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5oYXNBbmNlc3RvckNvbXB1dGVOZWVkKCkgKSB7XHJcbiAgICAgICAgICBwcmVjb21wdXRlUmVsYXRpdmVDb3VudCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBhc3NlcnRTbG93KCBub3RpZnlSZWxhdGl2ZUNvdW50ID09PSB0aGlzLnJlbGF0aXZlQ2hpbGRyZW5MaXN0ZW5lcnNDb3VudCxcclxuICAgICAgICAnUmVsYXRpdmUgbGlzdGVuZXIgY291bnQgaW52YXJpYW50JyApO1xyXG4gICAgICBhc3NlcnRTbG93KCBwcmVjb21wdXRlUmVsYXRpdmVDb3VudCA9PT0gdGhpcy5yZWxhdGl2ZUNoaWxkcmVuUHJlY29tcHV0ZUNvdW50LFxyXG4gICAgICAgICdSZWxhdGl2ZSBwcmVjb21wdXRlIGNvdW50IGludmFyaWFudCcgKTtcclxuXHJcbiAgICAgIGFzc2VydFNsb3coICF0aGlzLnBhcmVudCB8fCB0aGlzLmluc3RhbmNlLmlzVHJhbnNmb3JtZWQgfHwgKCB0aGlzLnJlbGF0aXZlQ2hpbGREaXJ0eUZyYW1lICE9PSBmcmFtZUlkICkgfHxcclxuICAgICAgICAgICAgICAgICAgKCB0aGlzLnBhcmVudC5yZWxhdGl2ZUNoaWxkRGlydHlGcmFtZSA9PT0gZnJhbWVJZCApLFxyXG4gICAgICAgICdJZiB3ZSBoYXZlIGEgcGFyZW50LCB3ZSBuZWVkIHRvIGhvbGQgdGhlIGludmFyaWFudCAnICtcclxuICAgICAgICAndGhpcy5yZWxhdGl2ZUNoaWxkRGlydHlGcmFtZSA9PiBwYXJlbnQucmVsYXRpdmVDaGlsZERpcnR5RnJhbWUnICk7XHJcblxyXG4gICAgICAvLyBTaW5jZSB3ZSBjaGVjayB0byBzZWUgaWYgc29tZXRoaW5nIGlzIG5vdCBkaXJ0eSwgd2UgbmVlZCB0byBoYW5kbGUgdGhpcyB3aGVuIHdlIGFyZSBhY3R1YWxseSByZXBvcnRpbmdcclxuICAgICAgLy8gd2hhdCBpcyBkaXJ0eS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy81MTJcclxuICAgICAgaWYgKCAhYWxsb3dWYWxpZGF0aW9uTm90TmVlZGVkQ2hlY2tzICYmICFoYXNSZWxhdGl2ZVNlbGZEaXJ0eSggdGhpcyApICkge1xyXG4gICAgICAgIGNvbnN0IG1hdHJpeCA9IGN1cnJlbnRSZWxhdGl2ZU1hdHJpeCggdGhpcyApO1xyXG4gICAgICAgIGFzc2VydFNsb3coIG1hdHJpeC5lcXVhbHMoIHRoaXMubWF0cml4ICksICdJZiB0aGVyZSBpcyBubyByZWxhdGl2ZVNlbGZEaXJ0eSBmbGFnIHNldCBoZXJlIG9yIGluIG91cicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgYW5jZXN0b3JzLCBvdXIgbWF0cml4IHNob3VsZCBiZSB1cC10by1kYXRlJyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUmVsYXRpdmVUcmFuc2Zvcm0nLCBSZWxhdGl2ZVRyYW5zZm9ybSApO1xyXG5leHBvcnQgZGVmYXVsdCBSZWxhdGl2ZVRyYW5zZm9ybTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxVQUFVLE1BQU0scUNBQXFDO0FBQzVELFNBQVNDLE9BQU8sUUFBUSxlQUFlO0FBRXZDLE1BQU1DLGlCQUFpQixDQUFDO0VBQ3RCO0FBQ0Y7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxRQUFRLEVBQUc7SUFDdEIsSUFBSSxDQUFDQSxRQUFRLEdBQUdBLFFBQVE7RUFDMUI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFVBQVVBLENBQUVDLE9BQU8sRUFBRUMsS0FBSyxFQUFHO0lBQzNCLElBQUksQ0FBQ0QsT0FBTyxHQUFHQSxPQUFPO0lBQ3RCLElBQUks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