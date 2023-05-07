// Copyright 2016-2022, University of Colorado Boulder

/**
 * Sub-component of a Node that handles pickability and hit testing.
 *
 * A "listener equivalent" is either the existence of at least one input listener, or pickable:true. Nodes with
 * listener equivalents will basically try to hit-test ALL descendants that aren't invisible or pickable:false.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { scenery, Trail } from '../imports.js';
export default class Picker {
  // Our node

  // Whether our last-known state would have us be pruned by hit-test searches. Should be equal to
  // node.pickable === false || node.isVisible() === false. Updated synchronously.
  // Whether our last-known state would have us not prune descendant subtrees for the lack of listener equivalents
  // (whether we have a listener equivalent). Should be equal to
  // node.pickable === true || node._inputListeners.length > 0. Updated synchronously.
  // Whether our subtree can be pruned IF no ancestor (or us) has selfInclusive as true. Equivalent to:
  // node.pickable === false || !node.isVisible() || ( node.pickable !== true && subtreePickableCount === 0 )
  // Count designed to be non-zero when there is a listener equivalent in this node's subtree. Effectively the sum of
  // #inputListeners + (1?isPickable:true) + #childrenWithNonZeroCount. Notably, it ignores children who are guaranteed
  // to be pruned (selfPruned:true).
  // NOTE: We need "inclusive" and "exclusive" bounds to ideally be separate, so that they can be cached
  // independently. It's possible for one trail to have an ancestor with pickable:true (inclusive) while another
  // trail has no ancestors that make the search inclusive. This would introduce "thrashing" in the older version,
  // where it would continuously compute one or the other. Here, both versions can be stored.
  // Bounds to be used for pruning mouse hit tests when an ancestor has a listener equivalent. Updated lazily, while
  // the dirty flag is updated synchronously.
  // Bounds to be used for pruning mouse hit tests when ancestors have NO listener equivalent. Updated lazily, while
  // the dirty flag is updated synchronously.
  // Bounds to be used for pruning touch hit tests when an ancestor has a listener equivalent. Updated lazily, while
  // the dirty flag is updated synchronously.
  // Bounds to be used for pruning touch hit tests when ancestors have NO listener equivalent. Updated lazily, while
  // the dirty flag is updated synchronously.
  // Dirty flags, one for each Bounds.
  // Used to minimize garbage created in the hit-testing process
  constructor(node) {
    this.node = node;
    this.selfPruned = false;
    this.selfInclusive = false;
    this.subtreePrunable = true;
    this.subtreePickableCount = 0;
    this.mouseInclusiveBounds = Bounds2.NOTHING.copy();
    this.mouseExclusiveBounds = Bounds2.NOTHING.copy();
    this.touchInclusiveBounds = Bounds2.NOTHING.copy();
    this.touchExclusiveBounds = Bounds2.NOTHING.copy();
    this.mouseInclusiveDirty = true;
    this.mouseExclusiveDirty = true;
    this.touchInclusiveDirty = true;
    this.touchExclusiveDirty = true;
    this.scratchVector = new Vector2(0, 0);
  }

  /*
   * Return a trail to the top node (if any, otherwise null) whose self-rendered area contains the
   * point (in parent coordinates).
   *
   * @param point
   * @param useMouse - Whether mouse-specific customizations (and acceleration) applies
   * @param useTouch - Whether touch-specific customizations (and acceleration) applies
   */
  hitTest(point, useMouse, useTouch) {
    assert && assert(point, 'trailUnderPointer requires a point');
    sceneryLog && sceneryLog.hitTest && sceneryLog.hitTest(`-------------- ${this.node.constructor.name}#${this.node.id}`);
    const isBaseInclusive = this.selfInclusive;

    // Validate the bounds that we will be using for hit acceleration. This should validate all bounds that could be
    // hit by recursiveHitTest.
    if (useMouse) {
      if (isBaseInclusive) {
        this.validateMouseInclusive();
      } else {
        this.validateMouseExclusive();
      }
    } else if (useTouch) {
      if (isBaseInclusive) {
        this.validateTouchInclusive();
      } else {
        this.validateTouchExclusive();
      }
    } else {
      this.node.validateBounds();
    }

    // Kick off recursive handling, with isInclusive:false
    return this.recursiveHitTest(point, useMouse, useTouch, false);
  }

  /**
   * @param point
   * @param useMouse
   * @param useTouch
   * @param isInclusive - Essentially true if there is an ancestor or self with an input listener
   */
  recursiveHitTest(point, useMouse, useTouch, isInclusive) {
    isInclusive = isInclusive || this.selfInclusive;

    // If we are selfPruned, ignore this node and its subtree (invisible or pickable:false).
    // If the search is NOT inclusive (no listener equivalent), also ignore this subtree if subtreePrunable is true.
    if (this.selfPruned || !isInclusive && this.subtreePrunable) {
      sceneryLog && sceneryLog.hitTest && sceneryLog.hitTest(`${this.node.constructor.name}#${this.node.id} pruned ${this.selfPruned ? '(self)' : '(subtree)'}`);
      return null;
    }

    // Validation should have already been done in hitTest(), we just need to grab the accelerated bounds.
    let pruningBounds;
    if (useMouse) {
      pruningBounds = isInclusive ? this.mouseInclusiveBounds : this.mouseExclusiveBounds;
      assert && assert(isInclusive ? !this.mouseInclusiveDirty : !this.mouseExclusiveDirty);
    } else if (useTouch) {
      pruningBounds = isInclusive ? this.touchInclusiveBounds : this.touchExclusiveBounds;
      assert && assert(isInclusive ? !this.touchInclusiveDirty : !this.touchExclusiveDirty);
    } else {
      pruningBounds = this.node.bounds;
      assert && assert(!this.node._boundsDirty);
    }

    // Bail quickly if our point is not inside the bounds for the subtree.
    if (!pruningBounds.containsPoint(point)) {
      sceneryLog && sceneryLog.hitTest && sceneryLog.hitTest(`${this.node.constructor.name}#${this.node.id} pruned: ${useMouse ? 'mouse' : useTouch ? 'touch' : 'regular'}`);
      return null; // not in our bounds, so this point can't possibly be contained
    }

    // Transform the point in the local coordinate frame, so we can test it with the clipArea/children
    const localPoint = this.node._transform.getInverse().multiplyVector2(this.scratchVector.set(point));

    // If our point is outside of the local-coordinate clipping area, there should be no hit.
    const clipArea = this.node.clipArea;
    if (clipArea !== null && !clipArea.containsPoint(localPoint)) {
      sceneryLog && sceneryLog.hitTest && sceneryLog.hitTest(`${this.node.constructor.name}#${this.node.id} out of clip area`);
      return null;
    }
    sceneryLog && sceneryLog.hitTest && sceneryLog.hitTest(`${this.node.constructor.name}#${this.node.id}`);

    // Check children before our "self", since the children are rendered on top.
    // Manual iteration here so we can return directly, and so we can iterate backwards (last node is in front).
    for (let i = this.node._children.length - 1; i >= 0; i--) {
      const child = this.node._children[i];
      sceneryLog && sceneryLog.hitTest && sceneryLog.push();
      const childHit = child._picker.recursiveHitTest(localPoint, useMouse, useTouch, isInclusive);
      sceneryLog && sceneryLog.hitTest && sceneryLog.pop();

      // If there was a hit, immediately add our node to the start of the Trail (will recursively build the Trail).
      if (childHit) {
        return childHit.addAncestor(this.node, i);
      }
    }

    // Tests for mouse and touch hit areas before testing containsPointSelf
    if (useMouse && this.node._mouseArea) {
      sceneryLog && sceneryLog.hitTest && sceneryLog.hitTest(`${this.node.constructor.name}#${this.node.id} mouse area hit`);
      // NOTE: both Bounds2 and Shape have containsPoint! We use both here!
      return this.node._mouseArea.containsPoint(localPoint) ? new Trail(this.node) : null;
    }
    if (useTouch && this.node._touchArea) {
      sceneryLog && sceneryLog.hitTest && sceneryLog.hitTest(`${this.node.constructor.name}#${this.node.id} touch area hit`);
      // NOTE: both Bounds2 and Shape have containsPoint! We use both here!
      return this.node._touchArea.containsPoint(localPoint) ? new Trail(this.node) : null;
    }

    // Didn't hit our children, so check ourself as a last resort. Check our selfBounds first, so we can potentially
    // avoid hit-testing the actual object (which may be more expensive).
    if (this.node.selfBounds.containsPoint(localPoint)) {
      if (this.node.containsPointSelf(localPoint)) {
        sceneryLog && sceneryLog.hitTest && sceneryLog.hitTest(`${this.node.constructor.name}#${this.node.id} self hit`);
        return new Trail(this.node);
      }
    }

    // No hit
    return null;
  }

  /**
   * Recursively sets dirty flags to true. If the andExclusive parameter is false, only the "inclusive" flags
   * are set to dirty.
   *
   * @param andExclusive
   * @param [ignoreSelfDirty] - If true, will invalidate parents even if we were dirty.
   */
  invalidate(andExclusive, ignoreSelfDirty) {
    // Track whether a 'dirty' flag was changed from false=>true (or if ignoreSelfDirty is passed).
    let wasNotDirty = !!ignoreSelfDirty || !this.mouseInclusiveDirty || !this.touchInclusiveDirty;
    this.mouseInclusiveDirty = true;
    this.touchInclusiveDirty = true;
    if (andExclusive) {
      wasNotDirty = wasNotDirty || !this.mouseExclusiveDirty || !this.touchExclusiveDirty;
      this.mouseExclusiveDirty = true;
      this.touchExclusiveDirty = true;
    }

    // If we are selfPruned (or if we were already fully dirty), there should be no reason to call this on our
    // parents. If we are selfPruned, we are guaranteed to not be visited in a search by our parents, so changes
    // that make this picker dirty should NOT affect our parents' pickers values.
    if (!this.selfPruned && wasNotDirty) {
      const parents = this.node._parents;
      for (let i = 0; i < parents.length; i++) {
        parents[i]._picker.invalidate(andExclusive || this.selfInclusive, false);
      }
    }
  }

  /**
   * Computes the mouseInclusiveBounds for this picker (if dirty), and recursively validates it for all non-pruned
   * children.
   *
   * NOTE: For the future, consider sharing more code with related functions. I tried this, and it made things look
   * more complicated (and probably slower), so I've kept some duplication. If a change is made to this function,
   * please check the other validate* methods to see if they also need a change.
   */
  validateMouseInclusive() {
    if (!this.mouseInclusiveDirty) {
      return;
    }
    this.mouseInclusiveBounds.set(this.node.selfBounds);
    const children = this.node._children;
    for (let i = 0; i < children.length; i++) {
      const childPicker = children[i]._picker;

      // Since we are "inclusive", we don't care about subtreePrunable (we won't prune for that). Only check
      // if pruning is force (selfPruned).
      if (!childPicker.selfPruned) {
        childPicker.validateMouseInclusive();
        this.mouseInclusiveBounds.includeBounds(childPicker.mouseInclusiveBounds);
      }
    }

    // Include mouseArea (if applicable), exclude outside clipArea (if applicable), and transform to the parent
    // coordinate frame.
    this.applyAreasAndTransform(this.mouseInclusiveBounds, this.node._mouseArea);
    this.mouseInclusiveDirty = false;
  }

  /**
   * Computes the mouseExclusiveBounds for this picker (if dirty), and recursively validates the mouse-related bounds
   * for all non-pruned children.
   *
   * Notably, if a picker is selfInclusive, we will switch to validating mouseInclusiveBounds for its subtree, as this
   * is what the hit-testing will use.
   *
   * NOTE: For the future, consider sharing more code with related functions. I tried this, and it made things look
   * more complicated (and probably slower), so I've kept some duplication. If a change is made to this function,
   * please check the other validate* methods to see if they also need a change.
   */
  validateMouseExclusive() {
    if (!this.mouseExclusiveDirty) {
      return;
    }
    this.mouseExclusiveBounds.set(this.node.selfBounds);
    const children = this.node._children;
    for (let i = 0; i < children.length; i++) {
      const childPicker = children[i]._picker;

      // Since we are not "inclusive", we will prune the search if subtreePrunable is true.
      if (!childPicker.subtreePrunable) {
        // If our child is selfInclusive, we need to switch to the "inclusive" validation.
        if (childPicker.selfInclusive) {
          childPicker.validateMouseInclusive();
          this.mouseExclusiveBounds.includeBounds(childPicker.mouseInclusiveBounds);
        }
        // Otherwise, keep with the exclusive validation.
        else {
          childPicker.validateMouseExclusive();
          this.mouseExclusiveBounds.includeBounds(childPicker.mouseExclusiveBounds);
        }
      }
    }

    // Include mouseArea (if applicable), exclude outside clipArea (if applicable), and transform to the parent
    // coordinate frame.
    this.applyAreasAndTransform(this.mouseExclusiveBounds, this.node._mouseArea);
    this.mouseExclusiveDirty = false;
  }

  /**
   * Computes the touchInclusiveBounds for this picker (if dirty), and recursively validates it for all non-pruned
   * children.
   *
   * NOTE: For the future, consider sharing more code with related functions. I tried this, and it made things look
   * more complicated (and probably slower), so I've kept some duplication. If a change is made to this function,
   * please check the other validate* methods to see if they also need a change.
   */
  validateTouchInclusive() {
    if (!this.touchInclusiveDirty) {
      return;
    }
    this.touchInclusiveBounds.set(this.node.selfBounds);
    const children = this.node._children;
    for (let i = 0; i < children.length; i++) {
      const childPicker = children[i]._picker;

      // Since we are "inclusive", we don't care about subtreePrunable (we won't prune for that). Only check
      // if pruning is force (selfPruned).
      if (!childPicker.selfPruned) {
        childPicker.validateTouchInclusive();
        this.touchInclusiveBounds.includeBounds(childPicker.touchInclusiveBounds);
      }
    }

    // Include touchArea (if applicable), exclude outside clipArea (if applicable), and transform to the parent
    // coordinate frame.
    this.applyAreasAndTransform(this.touchInclusiveBounds, this.node._touchArea);
    this.touchInclusiveDirty = false;
  }

  /**
   * Computes the touchExclusiveBounds for this picker (if dirty), and recursively validates the touch-related bounds
   * for all non-pruned children.
   *
   * Notably, if a picker is selfInclusive, we will switch to validating touchInclusiveBounds for its subtree, as this
   * is what the hit-testing will use.
   *
   * NOTE: For the future, consider sharing more code with related functions. I tried this, and it made things look
   * more complicated (and probably slower), so I've kept some duplication. If a change is made to this function,
   * please check the other validate* methods to see if they also need a change.
   */
  validateTouchExclusive() {
    if (!this.touchExclusiveDirty) {
      return;
    }
    this.touchExclusiveBounds.set(this.node.selfBounds);
    const children = this.node._children;
    for (let i = 0; i < children.length; i++) {
      const childPicker = children[i]._picker;

      // Since we are not "inclusive", we will prune the search if subtreePrunable is true.
      if (!childPicker.subtreePrunable) {
        // If our child is selfInclusive, we need to switch to the "inclusive" validation.
        if (childPicker.selfInclusive) {
          childPicker.validateTouchInclusive();
          this.touchExclusiveBounds.includeBounds(childPicker.touchInclusiveBounds);
        }
        // Otherwise, keep with the exclusive validation.
        else {
          childPicker.validateTouchExclusive();
          this.touchExclusiveBounds.includeBounds(childPicker.touchExclusiveBounds);
        }
      }
    }

    // Include touchArea (if applicable), exclude outside clipArea (if applicable), and transform to the parent
    // coordinate frame.
    this.applyAreasAndTransform(this.touchExclusiveBounds, this.node._touchArea);
    this.touchExclusiveDirty = false;
  }

  /**
   * Include pointer areas (if applicable), exclude bounds outside the clip area (if applicable), and transform
   * into the parent coordinate frame. Mutates the bounds provided.
   *
   * Meant to be called by the validation methods, as this part is the same for every validation that is done.
   *
   * @param mutableBounds - The bounds to be mutated (e.g. mouseExclusiveBounds).
   * @param pointerArea - A mouseArea/touchArea that should be included in the search.
   */
  applyAreasAndTransform(mutableBounds, pointerArea) {
    // do this before the transformation to the parent coordinate frame (the mouseArea is in the local coordinate frame)
    if (pointerArea) {
      // we accept either Bounds2, or a Shape (in which case, we take the Shape's bounds)
      mutableBounds.includeBounds(pointerArea instanceof Bounds2 ? pointerArea : pointerArea.bounds);
    }
    const clipArea = this.node.clipArea;
    if (clipArea) {
      const clipBounds = clipArea.bounds;
      // exclude areas outside of the clipping area's bounds (for efficiency)
      // Uses Bounds2.constrainBounds, but inlined to prevent https://github.com/phetsims/projectile-motion/issues/155
      mutableBounds.minX = Math.max(mutableBounds.minX, clipBounds.minX);
      mutableBounds.minY = Math.max(mutableBounds.minY, clipBounds.minY);
      mutableBounds.maxX = Math.min(mutableBounds.maxX, clipBounds.maxX);
      mutableBounds.maxY = Math.min(mutableBounds.maxY, clipBounds.maxY);
    }

    // transform it to the parent coordinate frame
    this.node.transformBoundsFromLocalToParent(mutableBounds);
  }

  /**
   * Called from Node when a child is inserted. (scenery-internal)
   *
   * NOTE: The child may not be fully added when this is called. Don't audit, or assume that calls to the Node would
   * indicate the parent-child relationship.
   *
   * @param childNode - Our picker node's new child node.
   */
  onInsertChild(childNode) {
    // If the child is selfPruned, we don't have to update any metadata.
    if (!childNode._picker.selfPruned) {
      const hasPickable = childNode._picker.subtreePickableCount > 0;

      // If it has a non-zero subtreePickableCount, we'll need to increment our own count by 1.
      if (hasPickable) {
        this.changePickableCount(1);
      }

      // If it has a subtreePickableCount of zero, it would be pruned by "exclusive" searches, so we only need to
      // invalidate the "inclusive" bounds.
      this.invalidate(hasPickable, true);
    }
  }

  /**
   * Called from Node when a child is removed. (scenery-internal)
   *
   * NOTE: The child may not be fully removed when this is called. Don't audit, or assume that calls to the Node would
   * indicate the parent-child relationship.
   *
   * @param childNode - Our picker node's child that will be removed.
   */
  onRemoveChild(childNode) {
    // If the child is selfPruned, we don't have to update any metadata.
    if (!childNode._picker.selfPruned) {
      const hasPickable = childNode._picker.subtreePickableCount > 0;

      // If it has a non-zero subtreePickableCount, we'll need to decrement our own count by 1.
      if (hasPickable) {
        this.changePickableCount(-1);
      }

      // If it has a subtreePickableCount of zero, it would be pruned by "exclusive" searches, so we only need to
      // invalidate the "inclusive" bounds.
      this.invalidate(hasPickable, true);
    }
  }

  /**
   * Called from Node when an input listener is added to our node. (scenery-internal)
   */
  onAddInputListener() {
    // Update flags that depend on listener count
    this.checkSelfInclusive();
    this.checkSubtreePrunable();

    // Update our pickable count, since it includes a count of how many input listeners we have.
    this.changePickableCount(1); // NOTE: this should also trigger invalidation of mouse/touch bounds

    if (assertSlow) {
      this.audit();
    }
  }

  /**
   * Called from Node when an input listener is removed from our node. (scenery-internal)
   */
  onRemoveInputListener() {
    // Update flags that depend on listener count
    this.checkSelfInclusive();
    this.checkSubtreePrunable();

    // Update our pickable count, since it includes a count of how many input listeners we have.
    this.changePickableCount(-1); // NOTE: this should also trigger invalidation of mouse/touch bounds

    if (assertSlow) {
      this.audit();
    }
  }

  /**
   * Called when the 'pickable' value of our Node is changed. (scenery-internal)
   */
  onPickableChange(oldPickable, pickable) {
    // Update flags that depend on our pickable setting.
    this.checkSelfPruned();
    this.checkSelfInclusive();
    this.checkSubtreePrunable();

    // Compute our pickable count change (pickable:true counts for 1)
    const change = (oldPickable === true ? -1 : 0) + (pickable === true ? 1 : 0);
    if (change) {
      this.changePickableCount(change);
    }
    if (assertSlow) {
      this.audit();
    }
  }

  /**
   * Called when the visibility of our Node is changed. (scenery-internal)
   */
  onVisibilityChange() {
    // Update flags that depend on our visibility.
    this.checkSelfPruned();
    this.checkSubtreePrunable();
  }

  /**
   * Called when the mouseArea of the Node is changed. (scenery-internal)
   */
  onMouseAreaChange() {
    // Bounds can depend on the mouseArea, so we'll invalidate those.
    // TODO: Consider bounds invalidation that only does the 'mouse' flags, since we don't need to invalidate touches.
    this.invalidate(true);
  }

  /**
   * Called when the mouseArea of the Node is changed. (scenery-internal)
   */
  onTouchAreaChange() {
    // Bounds can depend on the touchArea, so we'll invalidate those.
    // TODO: Consider bounds invalidation that only does the 'touch' flags, since we don't need to invalidate mice.
    this.invalidate(true);
  }

  /**
   * Called when the transform of the Node is changed. (scenery-internal)
   */
  onTransformChange() {
    // Can affect our bounds
    this.invalidate(true);
  }

  /**
   * Called when the transform of the Node is changed. (scenery-internal)
   */
  onSelfBoundsDirty() {
    // Can affect our bounds
    this.invalidate(true);
  }

  /**
   * Called when the transform of the Node is changed. (scenery-internal)
   */
  onClipAreaChange() {
    // Can affect our bounds.
    this.invalidate(true);
  }

  /**
   * Check to see if we are 'selfPruned', and update the value. If it changed, we'll need to notify our parents.
   *
   * Note that the prunability "pickable:false" or "invisible" won't affect our computed bounds, so we don't
   * invalidate ourself.
   */
  checkSelfPruned() {
    const selfPruned = this.node.pickableProperty.value === false || !this.node.isVisible();
    if (this.selfPruned !== selfPruned) {
      this.selfPruned = selfPruned;

      // Notify parents
      const parents = this.node._parents;
      for (let i = 0; i < parents.length; i++) {
        const picker = parents[i]._picker;

        // If we have an input listener/pickable:true in our subtree, we'll need to invalidate exclusive bounds also,
        // and we'll want to update the pickable count of our parent.
        if (this.subtreePickableCount > 0) {
          picker.invalidate(true, true);
          picker.changePickableCount(this.selfPruned ? -1 : 1);
        }
        // If we have nothing in our subtree that would force a visit, we only need to invalidate the "inclusive"
        // bounds.
        else {
          picker.invalidate(false, true);
        }
      }
    }
  }

  /**
   * Check to see if we are 'selfInclusive', and update the value. If it changed, we'll need to invalidate ourself.
   */
  checkSelfInclusive() {
    const selfInclusive = this.node.pickableProperty.value === true || this.node._inputListeners.length > 0;
    if (this.selfInclusive !== selfInclusive) {
      this.selfInclusive = selfInclusive;

      // Our dirty flag handling for both inclusive and exclusive depend on this value.
      this.invalidate(true, true);
    }
  }

  /**
   * Update our 'subtreePrunable' flag.
   */
  checkSubtreePrunable() {
    const subtreePrunable = this.node.pickableProperty.value === false || !this.node.isVisible() || this.node.pickableProperty.value !== true && this.subtreePickableCount === 0;
    if (this.subtreePrunable !== subtreePrunable) {
      this.subtreePrunable = subtreePrunable;

      // Our dirty flag handling for both inclusive and exclusive depend on this value.
      this.invalidate(true, true);
    }
  }

  /**
   * Propagate the pickable count change down to our ancestors.
   *
   * @param n - The delta of how many pickable counts have been added/removed
   */
  changePickableCount(n) {
    if (n === 0) {
      return;
    }

    // Switching between 0 and 1 matters, since we then need to update the counts of our parents.
    const wasZero = this.subtreePickableCount === 0;
    this.subtreePickableCount += n;
    const isZero = this.subtreePickableCount === 0;

    // Our subtreePrunable value depends on our pickable count, make sure it gets updated.
    this.checkSubtreePrunable();
    assert && assert(this.subtreePickableCount >= 0, 'subtree pickable count should be guaranteed to be >= 0');
    if (!this.selfPruned && wasZero !== isZero) {
      // Update our parents if our count changed (AND if it matters, i.e. we aren't selfPruned).
      const len = this.node._parents.length;
      for (let i = 0; i < len; i++) {
        this.node._parents[i]._picker.changePickableCount(wasZero ? 1 : -1);
      }
    }
  }

  /**
   * Runs a number of consistency tests when assertSlow is enabled. Verifies most conditions, and helps to catch
   * bugs earlier when they are initially triggered. (scenery-internal)
   */
  audit() {
    if (assertSlow) {
      this.node._children.forEach(node => {
        node._picker.audit();
      });
      const localAssertSlow = assertSlow;
      const expectedSelfPruned = this.node.pickable === false || !this.node.isVisible();
      const expectedSelfInclusive = this.node.pickable === true || this.node._inputListeners.length > 0;
      const expectedSubtreePrunable = this.node.pickable === false || !this.node.isVisible() || this.node.pickable !== true && this.subtreePickableCount === 0;
      const expectedSubtreePickableCount = this.node._inputListeners.length + (this.node.pickableProperty.value === true ? 1 : 0) + _.filter(this.node._children, child => !child._picker.selfPruned && child._picker.subtreePickableCount > 0).length;
      assertSlow(this.selfPruned === expectedSelfPruned, 'selfPruned mismatch');
      assertSlow(this.selfInclusive === expectedSelfInclusive, 'selfInclusive mismatch');
      assertSlow(this.subtreePrunable === expectedSubtreePrunable, 'subtreePrunable mismatch');
      assertSlow(this.subtreePickableCount === expectedSubtreePickableCount, 'subtreePickableCount mismatch');
      this.node._parents.forEach(parent => {
        const parentPicker = parent._picker;

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const childPicker = this; // eslint-disable-line consistent-this

        if (!parentPicker.mouseInclusiveDirty) {
          localAssertSlow(childPicker.selfPruned || !childPicker.mouseInclusiveDirty);
        }
        if (!parentPicker.mouseExclusiveDirty) {
          if (childPicker.selfInclusive) {
            localAssertSlow(childPicker.selfPruned || !childPicker.mouseInclusiveDirty);
          } else {
            localAssertSlow(childPicker.selfPruned || childPicker.subtreePrunable || !childPicker.mouseExclusiveDirty);
          }
        }
        if (!parentPicker.touchInclusiveDirty) {
          localAssertSlow(childPicker.selfPruned || !childPicker.touchInclusiveDirty);
        }
        if (!parentPicker.touchExclusiveDirty) {
          if (childPicker.selfInclusive) {
            localAssertSlow(childPicker.selfPruned || !childPicker.touchInclusiveDirty);
          } else {
            localAssertSlow(childPicker.selfPruned || childPicker.subtreePrunable || !childPicker.touchExclusiveDirty);
          }
        }
      });
    }
  }
}
scenery.register('Picker', Picker);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVmVjdG9yMiIsInNjZW5lcnkiLCJUcmFpbCIsIlBpY2tlciIsImNvbnN0cnVjdG9yIiwibm9kZSIsInNlbGZQcnVuZWQiLCJzZWxmSW5jbHVzaXZlIiwic3VidHJlZVBydW5hYmxlIiwic3VidHJlZVBpY2thYmxlQ291bnQiLCJtb3VzZUluY2x1c2l2ZUJvdW5kcyIsIk5PVEhJTkciLCJjb3B5IiwibW91c2VFeGNsdXNpdmVCb3VuZHMiLCJ0b3VjaEluY2x1c2l2ZUJvdW5kcyIsInRvdWNoRXhjbHVzaXZlQm91bmRzIiwibW91c2VJbmNsdXNpdmVEaXJ0eSIsIm1vdXNlRXhjbHVzaXZlRGlydHkiLCJ0b3VjaEluY2x1c2l2ZURpcnR5IiwidG91Y2hFeGNsdXNpdmVEaXJ0eSIsInNjcmF0Y2hWZWN0b3IiLCJoaXRUZXN0IiwicG9pbnQiLCJ1c2VNb3VzZSIsInVzZVRvdWNoIiwiYXNzZXJ0Iiwic2NlbmVyeUxvZyIsIm5hbWUiLCJpZCIsImlzQmFzZUluY2x1c2l2ZSIsInZhbGlkYXRlTW91c2VJbmNsdXNpdmUiLCJ2YWxpZGF0ZU1vdXNlRXhjbHVzaXZlIiwidmFsaWRhdGVUb3VjaEluY2x1c2l2ZSIsInZhbGlkYXRlVG91Y2hFeGNsdXNpdmUiLCJ2YWxpZGF0ZUJvdW5kcyIsInJlY3Vyc2l2ZUhpdFRlc3QiLCJpc0luY2x1c2l2ZSIsInBydW5pbmdCb3VuZHMiLCJib3VuZHMiLCJfYm91bmRzRGlydHkiLCJjb250YWluc1BvaW50IiwibG9jYWxQb2ludCIsIl90cmFuc2Zvcm0iLCJnZXRJbnZlcnNlIiwibXVsdGlwbHlWZWN0b3IyIiwic2V0IiwiY2xpcEFyZWEiLCJpIiwiX2NoaWxkcmVuIiwibGVuZ3RoIiwiY2hpbGQiLCJwdXNoIiwiY2hpbGRIaXQiLCJfcGlja2VyIiwicG9wIiwiYWRkQW5jZXN0b3IiLCJfbW91c2VBcmVhIiwiX3RvdWNoQXJlYSIsInNlbGZCb3VuZHMiLCJjb250YWluc1BvaW50U2VsZiIsImludmFsaWRhdGUiLCJhbmRFeGNsdXNpdmUiLCJpZ25vcmVTZWxmRGlydHkiLCJ3YXNOb3REaXJ0eSIsInBhcmVudHMiLCJfcGFyZW50cyIsImNoaWxkcmVuIiwiY2hpbGRQaWNrZXIiLCJpbmNsdWRlQm91bmRzIiwiYXBwbHlBcmVhc0FuZFRyYW5zZm9ybSIsIm11dGFibGVCb3VuZHMiLCJwb2ludGVyQXJlYSIsImNsaXBCb3VuZHMiLCJtaW5YIiwiTWF0aCIsIm1heCIsIm1pblkiLCJtYXhYIiwibWluIiwibWF4WSIsInRyYW5zZm9ybUJvdW5kc0Zyb21Mb2NhbFRvUGFyZW50Iiwib25JbnNlcnRDaGlsZCIsImNoaWxkTm9kZSIsImhhc1BpY2thYmxlIiwiY2hhbmdlUGlja2FibGVDb3VudCIsIm9uUmVtb3ZlQ2hpbGQiLCJvbkFkZElucHV0TGlzdGVuZXIiLCJjaGVja1NlbGZJbmNsdXNpdmUiLCJjaGVja1N1YnRyZWVQcnVuYWJsZSIsImFzc2VydFNsb3ciLCJhdWRpdCIsIm9uUmVtb3ZlSW5wdXRMaXN0ZW5lciIsIm9uUGlja2FibGVDaGFuZ2UiLCJvbGRQaWNrYWJsZSIsInBpY2thYmxlIiwiY2hlY2tTZWxmUHJ1bmVkIiwiY2hhbmdlIiwib25WaXNpYmlsaXR5Q2hhbmdlIiwib25Nb3VzZUFyZWFDaGFuZ2UiLCJvblRvdWNoQXJlYUNoYW5nZSIsIm9uVHJhbnNmb3JtQ2hhbmdlIiwib25TZWxmQm91bmRzRGlydHkiLCJvbkNsaXBBcmVhQ2hhbmdlIiwicGlja2FibGVQcm9wZXJ0eSIsInZhbHVlIiwiaXNWaXNpYmxlIiwicGlja2VyIiwiX2lucHV0TGlzdGVuZXJzIiwibiIsIndhc1plcm8iLCJpc1plcm8iLCJsZW4iLCJmb3JFYWNoIiwibG9jYWxBc3NlcnRTbG93IiwiZXhwZWN0ZWRTZWxmUHJ1bmVkIiwiZXhwZWN0ZWRTZWxmSW5jbHVzaXZlIiwiZXhwZWN0ZWRTdWJ0cmVlUHJ1bmFibGUiLCJleHBlY3RlZFN1YnRyZWVQaWNrYWJsZUNvdW50IiwiXyIsImZpbHRlciIsInBhcmVudCIsInBhcmVudFBpY2tlciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGlja2VyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFN1Yi1jb21wb25lbnQgb2YgYSBOb2RlIHRoYXQgaGFuZGxlcyBwaWNrYWJpbGl0eSBhbmQgaGl0IHRlc3RpbmcuXHJcbiAqXHJcbiAqIEEgXCJsaXN0ZW5lciBlcXVpdmFsZW50XCIgaXMgZWl0aGVyIHRoZSBleGlzdGVuY2Ugb2YgYXQgbGVhc3Qgb25lIGlucHV0IGxpc3RlbmVyLCBvciBwaWNrYWJsZTp0cnVlLiBOb2RlcyB3aXRoXHJcbiAqIGxpc3RlbmVyIGVxdWl2YWxlbnRzIHdpbGwgYmFzaWNhbGx5IHRyeSB0byBoaXQtdGVzdCBBTEwgZGVzY2VuZGFudHMgdGhhdCBhcmVuJ3QgaW52aXNpYmxlIG9yIHBpY2thYmxlOmZhbHNlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIHNjZW5lcnksIFRyYWlsIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBpY2tlciB7XHJcblxyXG4gIC8vIE91ciBub2RlXHJcbiAgcHJpdmF0ZSByZWFkb25seSBub2RlOiBOb2RlO1xyXG5cclxuICAvLyBXaGV0aGVyIG91ciBsYXN0LWtub3duIHN0YXRlIHdvdWxkIGhhdmUgdXMgYmUgcHJ1bmVkIGJ5IGhpdC10ZXN0IHNlYXJjaGVzLiBTaG91bGQgYmUgZXF1YWwgdG9cclxuICAvLyBub2RlLnBpY2thYmxlID09PSBmYWxzZSB8fCBub2RlLmlzVmlzaWJsZSgpID09PSBmYWxzZS4gVXBkYXRlZCBzeW5jaHJvbm91c2x5LlxyXG4gIHByaXZhdGUgc2VsZlBydW5lZDogYm9vbGVhbjtcclxuXHJcbiAgLy8gV2hldGhlciBvdXIgbGFzdC1rbm93biBzdGF0ZSB3b3VsZCBoYXZlIHVzIG5vdCBwcnVuZSBkZXNjZW5kYW50IHN1YnRyZWVzIGZvciB0aGUgbGFjayBvZiBsaXN0ZW5lciBlcXVpdmFsZW50c1xyXG4gIC8vICh3aGV0aGVyIHdlIGhhdmUgYSBsaXN0ZW5lciBlcXVpdmFsZW50KS4gU2hvdWxkIGJlIGVxdWFsIHRvXHJcbiAgLy8gbm9kZS5waWNrYWJsZSA9PT0gdHJ1ZSB8fCBub2RlLl9pbnB1dExpc3RlbmVycy5sZW5ndGggPiAwLiBVcGRhdGVkIHN5bmNocm9ub3VzbHkuXHJcbiAgcHJpdmF0ZSBzZWxmSW5jbHVzaXZlOiBib29sZWFuO1xyXG5cclxuICAvLyBXaGV0aGVyIG91ciBzdWJ0cmVlIGNhbiBiZSBwcnVuZWQgSUYgbm8gYW5jZXN0b3IgKG9yIHVzKSBoYXMgc2VsZkluY2x1c2l2ZSBhcyB0cnVlLiBFcXVpdmFsZW50IHRvOlxyXG4gIC8vIG5vZGUucGlja2FibGUgPT09IGZhbHNlIHx8ICFub2RlLmlzVmlzaWJsZSgpIHx8ICggbm9kZS5waWNrYWJsZSAhPT0gdHJ1ZSAmJiBzdWJ0cmVlUGlja2FibGVDb3VudCA9PT0gMCApXHJcbiAgcHJpdmF0ZSBzdWJ0cmVlUHJ1bmFibGU6IGJvb2xlYW47XHJcblxyXG4gIC8vIENvdW50IGRlc2lnbmVkIHRvIGJlIG5vbi16ZXJvIHdoZW4gdGhlcmUgaXMgYSBsaXN0ZW5lciBlcXVpdmFsZW50IGluIHRoaXMgbm9kZSdzIHN1YnRyZWUuIEVmZmVjdGl2ZWx5IHRoZSBzdW0gb2ZcclxuICAvLyAjaW5wdXRMaXN0ZW5lcnMgKyAoMT9pc1BpY2thYmxlOnRydWUpICsgI2NoaWxkcmVuV2l0aE5vblplcm9Db3VudC4gTm90YWJseSwgaXQgaWdub3JlcyBjaGlsZHJlbiB3aG8gYXJlIGd1YXJhbnRlZWRcclxuICAvLyB0byBiZSBwcnVuZWQgKHNlbGZQcnVuZWQ6dHJ1ZSkuXHJcbiAgcHJpdmF0ZSBzdWJ0cmVlUGlja2FibGVDb3VudDogbnVtYmVyO1xyXG5cclxuICAvLyBOT1RFOiBXZSBuZWVkIFwiaW5jbHVzaXZlXCIgYW5kIFwiZXhjbHVzaXZlXCIgYm91bmRzIHRvIGlkZWFsbHkgYmUgc2VwYXJhdGUsIHNvIHRoYXQgdGhleSBjYW4gYmUgY2FjaGVkXHJcbiAgLy8gaW5kZXBlbmRlbnRseS4gSXQncyBwb3NzaWJsZSBmb3Igb25lIHRyYWlsIHRvIGhhdmUgYW4gYW5jZXN0b3Igd2l0aCBwaWNrYWJsZTp0cnVlIChpbmNsdXNpdmUpIHdoaWxlIGFub3RoZXJcclxuICAvLyB0cmFpbCBoYXMgbm8gYW5jZXN0b3JzIHRoYXQgbWFrZSB0aGUgc2VhcmNoIGluY2x1c2l2ZS4gVGhpcyB3b3VsZCBpbnRyb2R1Y2UgXCJ0aHJhc2hpbmdcIiBpbiB0aGUgb2xkZXIgdmVyc2lvbixcclxuICAvLyB3aGVyZSBpdCB3b3VsZCBjb250aW51b3VzbHkgY29tcHV0ZSBvbmUgb3IgdGhlIG90aGVyLiBIZXJlLCBib3RoIHZlcnNpb25zIGNhbiBiZSBzdG9yZWQuXHJcblxyXG4gIC8vIEJvdW5kcyB0byBiZSB1c2VkIGZvciBwcnVuaW5nIG1vdXNlIGhpdCB0ZXN0cyB3aGVuIGFuIGFuY2VzdG9yIGhhcyBhIGxpc3RlbmVyIGVxdWl2YWxlbnQuIFVwZGF0ZWQgbGF6aWx5LCB3aGlsZVxyXG4gIC8vIHRoZSBkaXJ0eSBmbGFnIGlzIHVwZGF0ZWQgc3luY2hyb25vdXNseS5cclxuICBwcml2YXRlIG1vdXNlSW5jbHVzaXZlQm91bmRzOiBCb3VuZHMyO1xyXG5cclxuICAvLyBCb3VuZHMgdG8gYmUgdXNlZCBmb3IgcHJ1bmluZyBtb3VzZSBoaXQgdGVzdHMgd2hlbiBhbmNlc3RvcnMgaGF2ZSBOTyBsaXN0ZW5lciBlcXVpdmFsZW50LiBVcGRhdGVkIGxhemlseSwgd2hpbGVcclxuICAvLyB0aGUgZGlydHkgZmxhZyBpcyB1cGRhdGVkIHN5bmNocm9ub3VzbHkuXHJcbiAgcHJpdmF0ZSBtb3VzZUV4Y2x1c2l2ZUJvdW5kczogQm91bmRzMjtcclxuXHJcbiAgLy8gQm91bmRzIHRvIGJlIHVzZWQgZm9yIHBydW5pbmcgdG91Y2ggaGl0IHRlc3RzIHdoZW4gYW4gYW5jZXN0b3IgaGFzIGEgbGlzdGVuZXIgZXF1aXZhbGVudC4gVXBkYXRlZCBsYXppbHksIHdoaWxlXHJcbiAgLy8gdGhlIGRpcnR5IGZsYWcgaXMgdXBkYXRlZCBzeW5jaHJvbm91c2x5LlxyXG4gIHByaXZhdGUgdG91Y2hJbmNsdXNpdmVCb3VuZHM6IEJvdW5kczI7XHJcblxyXG4gIC8vIEJvdW5kcyB0byBiZSB1c2VkIGZvciBwcnVuaW5nIHRvdWNoIGhpdCB0ZXN0cyB3aGVuIGFuY2VzdG9ycyBoYXZlIE5PIGxpc3RlbmVyIGVxdWl2YWxlbnQuIFVwZGF0ZWQgbGF6aWx5LCB3aGlsZVxyXG4gIC8vIHRoZSBkaXJ0eSBmbGFnIGlzIHVwZGF0ZWQgc3luY2hyb25vdXNseS5cclxuICBwcml2YXRlIHRvdWNoRXhjbHVzaXZlQm91bmRzOiBCb3VuZHMyO1xyXG5cclxuICAvLyBEaXJ0eSBmbGFncywgb25lIGZvciBlYWNoIEJvdW5kcy5cclxuICBwcml2YXRlIG1vdXNlSW5jbHVzaXZlRGlydHk6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBtb3VzZUV4Y2x1c2l2ZURpcnR5OiBib29sZWFuO1xyXG4gIHByaXZhdGUgdG91Y2hJbmNsdXNpdmVEaXJ0eTogYm9vbGVhbjtcclxuICBwcml2YXRlIHRvdWNoRXhjbHVzaXZlRGlydHk6IGJvb2xlYW47XHJcblxyXG4gIC8vIFVzZWQgdG8gbWluaW1pemUgZ2FyYmFnZSBjcmVhdGVkIGluIHRoZSBoaXQtdGVzdGluZyBwcm9jZXNzXHJcbiAgcHJpdmF0ZSBzY3JhdGNoVmVjdG9yOiBWZWN0b3IyO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG5vZGU6IE5vZGUgKSB7XHJcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xyXG4gICAgdGhpcy5zZWxmUHJ1bmVkID0gZmFsc2U7XHJcbiAgICB0aGlzLnNlbGZJbmNsdXNpdmUgPSBmYWxzZTtcclxuICAgIHRoaXMuc3VidHJlZVBydW5hYmxlID0gdHJ1ZTtcclxuICAgIHRoaXMuc3VidHJlZVBpY2thYmxlQ291bnQgPSAwO1xyXG4gICAgdGhpcy5tb3VzZUluY2x1c2l2ZUJvdW5kcyA9IEJvdW5kczIuTk9USElORy5jb3B5KCk7XHJcbiAgICB0aGlzLm1vdXNlRXhjbHVzaXZlQm91bmRzID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcclxuICAgIHRoaXMudG91Y2hJbmNsdXNpdmVCb3VuZHMgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpO1xyXG4gICAgdGhpcy50b3VjaEV4Y2x1c2l2ZUJvdW5kcyA9IEJvdW5kczIuTk9USElORy5jb3B5KCk7XHJcbiAgICB0aGlzLm1vdXNlSW5jbHVzaXZlRGlydHkgPSB0cnVlO1xyXG4gICAgdGhpcy5tb3VzZUV4Y2x1c2l2ZURpcnR5ID0gdHJ1ZTtcclxuICAgIHRoaXMudG91Y2hJbmNsdXNpdmVEaXJ0eSA9IHRydWU7XHJcbiAgICB0aGlzLnRvdWNoRXhjbHVzaXZlRGlydHkgPSB0cnVlO1xyXG4gICAgdGhpcy5zY3JhdGNoVmVjdG9yID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgdHJhaWwgdG8gdGhlIHRvcCBub2RlIChpZiBhbnksIG90aGVyd2lzZSBudWxsKSB3aG9zZSBzZWxmLXJlbmRlcmVkIGFyZWEgY29udGFpbnMgdGhlXHJcbiAgICogcG9pbnQgKGluIHBhcmVudCBjb29yZGluYXRlcykuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcG9pbnRcclxuICAgKiBAcGFyYW0gdXNlTW91c2UgLSBXaGV0aGVyIG1vdXNlLXNwZWNpZmljIGN1c3RvbWl6YXRpb25zIChhbmQgYWNjZWxlcmF0aW9uKSBhcHBsaWVzXHJcbiAgICogQHBhcmFtIHVzZVRvdWNoIC0gV2hldGhlciB0b3VjaC1zcGVjaWZpYyBjdXN0b21pemF0aW9ucyAoYW5kIGFjY2VsZXJhdGlvbikgYXBwbGllc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBoaXRUZXN0KCBwb2ludDogVmVjdG9yMiwgdXNlTW91c2U6IGJvb2xlYW4sIHVzZVRvdWNoOiBib29sZWFuICk6IFRyYWlsIHwgbnVsbCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb2ludCwgJ3RyYWlsVW5kZXJQb2ludGVyIHJlcXVpcmVzIGEgcG9pbnQnICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLmhpdFRlc3QgJiYgc2NlbmVyeUxvZy5oaXRUZXN0KCBgLS0tLS0tLS0tLS0tLS0gJHt0aGlzLm5vZGUuY29uc3RydWN0b3IubmFtZX0jJHt0aGlzLm5vZGUuaWR9YCApO1xyXG5cclxuICAgIGNvbnN0IGlzQmFzZUluY2x1c2l2ZSA9IHRoaXMuc2VsZkluY2x1c2l2ZTtcclxuXHJcbiAgICAvLyBWYWxpZGF0ZSB0aGUgYm91bmRzIHRoYXQgd2Ugd2lsbCBiZSB1c2luZyBmb3IgaGl0IGFjY2VsZXJhdGlvbi4gVGhpcyBzaG91bGQgdmFsaWRhdGUgYWxsIGJvdW5kcyB0aGF0IGNvdWxkIGJlXHJcbiAgICAvLyBoaXQgYnkgcmVjdXJzaXZlSGl0VGVzdC5cclxuICAgIGlmICggdXNlTW91c2UgKSB7XHJcbiAgICAgIGlmICggaXNCYXNlSW5jbHVzaXZlICkge1xyXG4gICAgICAgIHRoaXMudmFsaWRhdGVNb3VzZUluY2x1c2l2ZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMudmFsaWRhdGVNb3VzZUV4Y2x1c2l2ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdXNlVG91Y2ggKSB7XHJcbiAgICAgIGlmICggaXNCYXNlSW5jbHVzaXZlICkge1xyXG4gICAgICAgIHRoaXMudmFsaWRhdGVUb3VjaEluY2x1c2l2ZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMudmFsaWRhdGVUb3VjaEV4Y2x1c2l2ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5ub2RlLnZhbGlkYXRlQm91bmRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gS2ljayBvZmYgcmVjdXJzaXZlIGhhbmRsaW5nLCB3aXRoIGlzSW5jbHVzaXZlOmZhbHNlXHJcbiAgICByZXR1cm4gdGhpcy5yZWN1cnNpdmVIaXRUZXN0KCBwb2ludCwgdXNlTW91c2UsIHVzZVRvdWNoLCBmYWxzZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHBvaW50XHJcbiAgICogQHBhcmFtIHVzZU1vdXNlXHJcbiAgICogQHBhcmFtIHVzZVRvdWNoXHJcbiAgICogQHBhcmFtIGlzSW5jbHVzaXZlIC0gRXNzZW50aWFsbHkgdHJ1ZSBpZiB0aGVyZSBpcyBhbiBhbmNlc3RvciBvciBzZWxmIHdpdGggYW4gaW5wdXQgbGlzdGVuZXJcclxuICAgKi9cclxuICBwcml2YXRlIHJlY3Vyc2l2ZUhpdFRlc3QoIHBvaW50OiBWZWN0b3IyLCB1c2VNb3VzZTogYm9vbGVhbiwgdXNlVG91Y2g6IGJvb2xlYW4sIGlzSW5jbHVzaXZlOiBib29sZWFuICk6IFRyYWlsIHwgbnVsbCB7XHJcbiAgICBpc0luY2x1c2l2ZSA9IGlzSW5jbHVzaXZlIHx8IHRoaXMuc2VsZkluY2x1c2l2ZTtcclxuXHJcbiAgICAvLyBJZiB3ZSBhcmUgc2VsZlBydW5lZCwgaWdub3JlIHRoaXMgbm9kZSBhbmQgaXRzIHN1YnRyZWUgKGludmlzaWJsZSBvciBwaWNrYWJsZTpmYWxzZSkuXHJcbiAgICAvLyBJZiB0aGUgc2VhcmNoIGlzIE5PVCBpbmNsdXNpdmUgKG5vIGxpc3RlbmVyIGVxdWl2YWxlbnQpLCBhbHNvIGlnbm9yZSB0aGlzIHN1YnRyZWUgaWYgc3VidHJlZVBydW5hYmxlIGlzIHRydWUuXHJcbiAgICBpZiAoIHRoaXMuc2VsZlBydW5lZCB8fCAoICFpc0luY2x1c2l2ZSAmJiB0aGlzLnN1YnRyZWVQcnVuYWJsZSApICkge1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuaGl0VGVzdCAmJiBzY2VuZXJ5TG9nLmhpdFRlc3QoIGAke3RoaXMubm9kZS5jb25zdHJ1Y3Rvci5uYW1lfSMke3RoaXMubm9kZS5pZFxyXG4gICAgICB9IHBydW5lZCAke3RoaXMuc2VsZlBydW5lZCA/ICcoc2VsZiknIDogJyhzdWJ0cmVlKSd9YCApO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBWYWxpZGF0aW9uIHNob3VsZCBoYXZlIGFscmVhZHkgYmVlbiBkb25lIGluIGhpdFRlc3QoKSwgd2UganVzdCBuZWVkIHRvIGdyYWIgdGhlIGFjY2VsZXJhdGVkIGJvdW5kcy5cclxuICAgIGxldCBwcnVuaW5nQm91bmRzO1xyXG4gICAgaWYgKCB1c2VNb3VzZSApIHtcclxuICAgICAgcHJ1bmluZ0JvdW5kcyA9IGlzSW5jbHVzaXZlID8gdGhpcy5tb3VzZUluY2x1c2l2ZUJvdW5kcyA6IHRoaXMubW91c2VFeGNsdXNpdmVCb3VuZHM7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzSW5jbHVzaXZlID8gIXRoaXMubW91c2VJbmNsdXNpdmVEaXJ0eSA6ICF0aGlzLm1vdXNlRXhjbHVzaXZlRGlydHkgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB1c2VUb3VjaCApIHtcclxuICAgICAgcHJ1bmluZ0JvdW5kcyA9IGlzSW5jbHVzaXZlID8gdGhpcy50b3VjaEluY2x1c2l2ZUJvdW5kcyA6IHRoaXMudG91Y2hFeGNsdXNpdmVCb3VuZHM7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzSW5jbHVzaXZlID8gIXRoaXMudG91Y2hJbmNsdXNpdmVEaXJ0eSA6ICF0aGlzLnRvdWNoRXhjbHVzaXZlRGlydHkgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBwcnVuaW5nQm91bmRzID0gdGhpcy5ub2RlLmJvdW5kcztcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMubm9kZS5fYm91bmRzRGlydHkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBCYWlsIHF1aWNrbHkgaWYgb3VyIHBvaW50IGlzIG5vdCBpbnNpZGUgdGhlIGJvdW5kcyBmb3IgdGhlIHN1YnRyZWUuXHJcbiAgICBpZiAoICFwcnVuaW5nQm91bmRzLmNvbnRhaW5zUG9pbnQoIHBvaW50ICkgKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5oaXRUZXN0ICYmIHNjZW5lcnlMb2cuaGl0VGVzdCggYCR7dGhpcy5ub2RlLmNvbnN0cnVjdG9yLm5hbWV9IyR7dGhpcy5ub2RlLmlkfSBwcnVuZWQ6ICR7dXNlTW91c2UgPyAnbW91c2UnIDogKCB1c2VUb3VjaCA/ICd0b3VjaCcgOiAncmVndWxhcicgKX1gICk7XHJcbiAgICAgIHJldHVybiBudWxsOyAvLyBub3QgaW4gb3VyIGJvdW5kcywgc28gdGhpcyBwb2ludCBjYW4ndCBwb3NzaWJseSBiZSBjb250YWluZWRcclxuICAgIH1cclxuXHJcbiAgICAvLyBUcmFuc2Zvcm0gdGhlIHBvaW50IGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lLCBzbyB3ZSBjYW4gdGVzdCBpdCB3aXRoIHRoZSBjbGlwQXJlYS9jaGlsZHJlblxyXG4gICAgY29uc3QgbG9jYWxQb2ludCA9IHRoaXMubm9kZS5fdHJhbnNmb3JtLmdldEludmVyc2UoKS5tdWx0aXBseVZlY3RvcjIoIHRoaXMuc2NyYXRjaFZlY3Rvci5zZXQoIHBvaW50ICkgKTtcclxuXHJcbiAgICAvLyBJZiBvdXIgcG9pbnQgaXMgb3V0c2lkZSBvZiB0aGUgbG9jYWwtY29vcmRpbmF0ZSBjbGlwcGluZyBhcmVhLCB0aGVyZSBzaG91bGQgYmUgbm8gaGl0LlxyXG4gICAgY29uc3QgY2xpcEFyZWEgPSB0aGlzLm5vZGUuY2xpcEFyZWE7XHJcbiAgICBpZiAoIGNsaXBBcmVhICE9PSBudWxsICYmICFjbGlwQXJlYS5jb250YWluc1BvaW50KCBsb2NhbFBvaW50ICkgKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5oaXRUZXN0ICYmIHNjZW5lcnlMb2cuaGl0VGVzdCggYCR7dGhpcy5ub2RlLmNvbnN0cnVjdG9yLm5hbWV9IyR7dGhpcy5ub2RlLmlkfSBvdXQgb2YgY2xpcCBhcmVhYCApO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuaGl0VGVzdCAmJiBzY2VuZXJ5TG9nLmhpdFRlc3QoIGAke3RoaXMubm9kZS5jb25zdHJ1Y3Rvci5uYW1lfSMke3RoaXMubm9kZS5pZH1gICk7XHJcblxyXG4gICAgLy8gQ2hlY2sgY2hpbGRyZW4gYmVmb3JlIG91ciBcInNlbGZcIiwgc2luY2UgdGhlIGNoaWxkcmVuIGFyZSByZW5kZXJlZCBvbiB0b3AuXHJcbiAgICAvLyBNYW51YWwgaXRlcmF0aW9uIGhlcmUgc28gd2UgY2FuIHJldHVybiBkaXJlY3RseSwgYW5kIHNvIHdlIGNhbiBpdGVyYXRlIGJhY2t3YXJkcyAobGFzdCBub2RlIGlzIGluIGZyb250KS5cclxuICAgIGZvciAoIGxldCBpID0gdGhpcy5ub2RlLl9jaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcclxuICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLm5vZGUuX2NoaWxkcmVuWyBpIF07XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuaGl0VGVzdCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuICAgICAgY29uc3QgY2hpbGRIaXQgPSBjaGlsZC5fcGlja2VyLnJlY3Vyc2l2ZUhpdFRlc3QoIGxvY2FsUG9pbnQsIHVzZU1vdXNlLCB1c2VUb3VjaCwgaXNJbmNsdXNpdmUgKTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLmhpdFRlc3QgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuXHJcbiAgICAgIC8vIElmIHRoZXJlIHdhcyBhIGhpdCwgaW1tZWRpYXRlbHkgYWRkIG91ciBub2RlIHRvIHRoZSBzdGFydCBvZiB0aGUgVHJhaWwgKHdpbGwgcmVjdXJzaXZlbHkgYnVpbGQgdGhlIFRyYWlsKS5cclxuICAgICAgaWYgKCBjaGlsZEhpdCApIHtcclxuICAgICAgICByZXR1cm4gY2hpbGRIaXQuYWRkQW5jZXN0b3IoIHRoaXMubm9kZSwgaSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGVzdHMgZm9yIG1vdXNlIGFuZCB0b3VjaCBoaXQgYXJlYXMgYmVmb3JlIHRlc3RpbmcgY29udGFpbnNQb2ludFNlbGZcclxuICAgIGlmICggdXNlTW91c2UgJiYgdGhpcy5ub2RlLl9tb3VzZUFyZWEgKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5oaXRUZXN0ICYmIHNjZW5lcnlMb2cuaGl0VGVzdCggYCR7dGhpcy5ub2RlLmNvbnN0cnVjdG9yLm5hbWV9IyR7dGhpcy5ub2RlLmlkfSBtb3VzZSBhcmVhIGhpdGAgKTtcclxuICAgICAgLy8gTk9URTogYm90aCBCb3VuZHMyIGFuZCBTaGFwZSBoYXZlIGNvbnRhaW5zUG9pbnQhIFdlIHVzZSBib3RoIGhlcmUhXHJcbiAgICAgIHJldHVybiB0aGlzLm5vZGUuX21vdXNlQXJlYS5jb250YWluc1BvaW50KCBsb2NhbFBvaW50ICkgPyBuZXcgVHJhaWwoIHRoaXMubm9kZSApIDogbnVsbDtcclxuICAgIH1cclxuICAgIGlmICggdXNlVG91Y2ggJiYgdGhpcy5ub2RlLl90b3VjaEFyZWEgKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5oaXRUZXN0ICYmIHNjZW5lcnlMb2cuaGl0VGVzdCggYCR7dGhpcy5ub2RlLmNvbnN0cnVjdG9yLm5hbWV9IyR7dGhpcy5ub2RlLmlkfSB0b3VjaCBhcmVhIGhpdGAgKTtcclxuICAgICAgLy8gTk9URTogYm90aCBCb3VuZHMyIGFuZCBTaGFwZSBoYXZlIGNvbnRhaW5zUG9pbnQhIFdlIHVzZSBib3RoIGhlcmUhXHJcbiAgICAgIHJldHVybiB0aGlzLm5vZGUuX3RvdWNoQXJlYS5jb250YWluc1BvaW50KCBsb2NhbFBvaW50ICkgPyBuZXcgVHJhaWwoIHRoaXMubm9kZSApIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBEaWRuJ3QgaGl0IG91ciBjaGlsZHJlbiwgc28gY2hlY2sgb3Vyc2VsZiBhcyBhIGxhc3QgcmVzb3J0LiBDaGVjayBvdXIgc2VsZkJvdW5kcyBmaXJzdCwgc28gd2UgY2FuIHBvdGVudGlhbGx5XHJcbiAgICAvLyBhdm9pZCBoaXQtdGVzdGluZyB0aGUgYWN0dWFsIG9iamVjdCAod2hpY2ggbWF5IGJlIG1vcmUgZXhwZW5zaXZlKS5cclxuICAgIGlmICggdGhpcy5ub2RlLnNlbGZCb3VuZHMuY29udGFpbnNQb2ludCggbG9jYWxQb2ludCApICkge1xyXG4gICAgICBpZiAoIHRoaXMubm9kZS5jb250YWluc1BvaW50U2VsZiggbG9jYWxQb2ludCApICkge1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5oaXRUZXN0ICYmIHNjZW5lcnlMb2cuaGl0VGVzdCggYCR7dGhpcy5ub2RlLmNvbnN0cnVjdG9yLm5hbWV9IyR7dGhpcy5ub2RlLmlkfSBzZWxmIGhpdGAgKTtcclxuICAgICAgICByZXR1cm4gbmV3IFRyYWlsKCB0aGlzLm5vZGUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIE5vIGhpdFxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWN1cnNpdmVseSBzZXRzIGRpcnR5IGZsYWdzIHRvIHRydWUuIElmIHRoZSBhbmRFeGNsdXNpdmUgcGFyYW1ldGVyIGlzIGZhbHNlLCBvbmx5IHRoZSBcImluY2x1c2l2ZVwiIGZsYWdzXHJcbiAgICogYXJlIHNldCB0byBkaXJ0eS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBhbmRFeGNsdXNpdmVcclxuICAgKiBAcGFyYW0gW2lnbm9yZVNlbGZEaXJ0eV0gLSBJZiB0cnVlLCB3aWxsIGludmFsaWRhdGUgcGFyZW50cyBldmVuIGlmIHdlIHdlcmUgZGlydHkuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBpbnZhbGlkYXRlKCBhbmRFeGNsdXNpdmU6IGJvb2xlYW4sIGlnbm9yZVNlbGZEaXJ0eT86IGJvb2xlYW4gKTogdm9pZCB7XHJcblxyXG4gICAgLy8gVHJhY2sgd2hldGhlciBhICdkaXJ0eScgZmxhZyB3YXMgY2hhbmdlZCBmcm9tIGZhbHNlPT50cnVlIChvciBpZiBpZ25vcmVTZWxmRGlydHkgaXMgcGFzc2VkKS5cclxuICAgIGxldCB3YXNOb3REaXJ0eSA9ICEhaWdub3JlU2VsZkRpcnR5IHx8ICF0aGlzLm1vdXNlSW5jbHVzaXZlRGlydHkgfHwgIXRoaXMudG91Y2hJbmNsdXNpdmVEaXJ0eTtcclxuXHJcbiAgICB0aGlzLm1vdXNlSW5jbHVzaXZlRGlydHkgPSB0cnVlO1xyXG4gICAgdGhpcy50b3VjaEluY2x1c2l2ZURpcnR5ID0gdHJ1ZTtcclxuICAgIGlmICggYW5kRXhjbHVzaXZlICkge1xyXG4gICAgICB3YXNOb3REaXJ0eSA9IHdhc05vdERpcnR5IHx8ICF0aGlzLm1vdXNlRXhjbHVzaXZlRGlydHkgfHwgIXRoaXMudG91Y2hFeGNsdXNpdmVEaXJ0eTtcclxuICAgICAgdGhpcy5tb3VzZUV4Y2x1c2l2ZURpcnR5ID0gdHJ1ZTtcclxuICAgICAgdGhpcy50b3VjaEV4Y2x1c2l2ZURpcnR5ID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB3ZSBhcmUgc2VsZlBydW5lZCAob3IgaWYgd2Ugd2VyZSBhbHJlYWR5IGZ1bGx5IGRpcnR5KSwgdGhlcmUgc2hvdWxkIGJlIG5vIHJlYXNvbiB0byBjYWxsIHRoaXMgb24gb3VyXHJcbiAgICAvLyBwYXJlbnRzLiBJZiB3ZSBhcmUgc2VsZlBydW5lZCwgd2UgYXJlIGd1YXJhbnRlZWQgdG8gbm90IGJlIHZpc2l0ZWQgaW4gYSBzZWFyY2ggYnkgb3VyIHBhcmVudHMsIHNvIGNoYW5nZXNcclxuICAgIC8vIHRoYXQgbWFrZSB0aGlzIHBpY2tlciBkaXJ0eSBzaG91bGQgTk9UIGFmZmVjdCBvdXIgcGFyZW50cycgcGlja2VycyB2YWx1ZXMuXHJcbiAgICBpZiAoICF0aGlzLnNlbGZQcnVuZWQgJiYgd2FzTm90RGlydHkgKSB7XHJcbiAgICAgIGNvbnN0IHBhcmVudHMgPSB0aGlzLm5vZGUuX3BhcmVudHM7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBhcmVudHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgcGFyZW50c1sgaSBdLl9waWNrZXIuaW52YWxpZGF0ZSggYW5kRXhjbHVzaXZlIHx8IHRoaXMuc2VsZkluY2x1c2l2ZSwgZmFsc2UgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZXMgdGhlIG1vdXNlSW5jbHVzaXZlQm91bmRzIGZvciB0aGlzIHBpY2tlciAoaWYgZGlydHkpLCBhbmQgcmVjdXJzaXZlbHkgdmFsaWRhdGVzIGl0IGZvciBhbGwgbm9uLXBydW5lZFxyXG4gICAqIGNoaWxkcmVuLlxyXG4gICAqXHJcbiAgICogTk9URTogRm9yIHRoZSBmdXR1cmUsIGNvbnNpZGVyIHNoYXJpbmcgbW9yZSBjb2RlIHdpdGggcmVsYXRlZCBmdW5jdGlvbnMuIEkgdHJpZWQgdGhpcywgYW5kIGl0IG1hZGUgdGhpbmdzIGxvb2tcclxuICAgKiBtb3JlIGNvbXBsaWNhdGVkIChhbmQgcHJvYmFibHkgc2xvd2VyKSwgc28gSSd2ZSBrZXB0IHNvbWUgZHVwbGljYXRpb24uIElmIGEgY2hhbmdlIGlzIG1hZGUgdG8gdGhpcyBmdW5jdGlvbixcclxuICAgKiBwbGVhc2UgY2hlY2sgdGhlIG90aGVyIHZhbGlkYXRlKiBtZXRob2RzIHRvIHNlZSBpZiB0aGV5IGFsc28gbmVlZCBhIGNoYW5nZS5cclxuICAgKi9cclxuICBwcml2YXRlIHZhbGlkYXRlTW91c2VJbmNsdXNpdmUoKTogdm9pZCB7XHJcbiAgICBpZiAoICF0aGlzLm1vdXNlSW5jbHVzaXZlRGlydHkgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm1vdXNlSW5jbHVzaXZlQm91bmRzLnNldCggdGhpcy5ub2RlLnNlbGZCb3VuZHMgKTtcclxuXHJcbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMubm9kZS5fY2hpbGRyZW47XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgY2hpbGRQaWNrZXIgPSBjaGlsZHJlblsgaSBdLl9waWNrZXI7XHJcblxyXG4gICAgICAvLyBTaW5jZSB3ZSBhcmUgXCJpbmNsdXNpdmVcIiwgd2UgZG9uJ3QgY2FyZSBhYm91dCBzdWJ0cmVlUHJ1bmFibGUgKHdlIHdvbid0IHBydW5lIGZvciB0aGF0KS4gT25seSBjaGVja1xyXG4gICAgICAvLyBpZiBwcnVuaW5nIGlzIGZvcmNlIChzZWxmUHJ1bmVkKS5cclxuICAgICAgaWYgKCAhY2hpbGRQaWNrZXIuc2VsZlBydW5lZCApIHtcclxuICAgICAgICBjaGlsZFBpY2tlci52YWxpZGF0ZU1vdXNlSW5jbHVzaXZlKCk7XHJcbiAgICAgICAgdGhpcy5tb3VzZUluY2x1c2l2ZUJvdW5kcy5pbmNsdWRlQm91bmRzKCBjaGlsZFBpY2tlci5tb3VzZUluY2x1c2l2ZUJvdW5kcyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSW5jbHVkZSBtb3VzZUFyZWEgKGlmIGFwcGxpY2FibGUpLCBleGNsdWRlIG91dHNpZGUgY2xpcEFyZWEgKGlmIGFwcGxpY2FibGUpLCBhbmQgdHJhbnNmb3JtIHRvIHRoZSBwYXJlbnRcclxuICAgIC8vIGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAgICB0aGlzLmFwcGx5QXJlYXNBbmRUcmFuc2Zvcm0oIHRoaXMubW91c2VJbmNsdXNpdmVCb3VuZHMsIHRoaXMubm9kZS5fbW91c2VBcmVhICk7XHJcblxyXG4gICAgdGhpcy5tb3VzZUluY2x1c2l2ZURpcnR5ID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wdXRlcyB0aGUgbW91c2VFeGNsdXNpdmVCb3VuZHMgZm9yIHRoaXMgcGlja2VyIChpZiBkaXJ0eSksIGFuZCByZWN1cnNpdmVseSB2YWxpZGF0ZXMgdGhlIG1vdXNlLXJlbGF0ZWQgYm91bmRzXHJcbiAgICogZm9yIGFsbCBub24tcHJ1bmVkIGNoaWxkcmVuLlxyXG4gICAqXHJcbiAgICogTm90YWJseSwgaWYgYSBwaWNrZXIgaXMgc2VsZkluY2x1c2l2ZSwgd2Ugd2lsbCBzd2l0Y2ggdG8gdmFsaWRhdGluZyBtb3VzZUluY2x1c2l2ZUJvdW5kcyBmb3IgaXRzIHN1YnRyZWUsIGFzIHRoaXNcclxuICAgKiBpcyB3aGF0IHRoZSBoaXQtdGVzdGluZyB3aWxsIHVzZS5cclxuICAgKlxyXG4gICAqIE5PVEU6IEZvciB0aGUgZnV0dXJlLCBjb25zaWRlciBzaGFyaW5nIG1vcmUgY29kZSB3aXRoIHJlbGF0ZWQgZnVuY3Rpb25zLiBJIHRyaWVkIHRoaXMsIGFuZCBpdCBtYWRlIHRoaW5ncyBsb29rXHJcbiAgICogbW9yZSBjb21wbGljYXRlZCAoYW5kIHByb2JhYmx5IHNsb3dlciksIHNvIEkndmUga2VwdCBzb21lIGR1cGxpY2F0aW9uLiBJZiBhIGNoYW5nZSBpcyBtYWRlIHRvIHRoaXMgZnVuY3Rpb24sXHJcbiAgICogcGxlYXNlIGNoZWNrIHRoZSBvdGhlciB2YWxpZGF0ZSogbWV0aG9kcyB0byBzZWUgaWYgdGhleSBhbHNvIG5lZWQgYSBjaGFuZ2UuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB2YWxpZGF0ZU1vdXNlRXhjbHVzaXZlKCk6IHZvaWQge1xyXG4gICAgaWYgKCAhdGhpcy5tb3VzZUV4Y2x1c2l2ZURpcnR5ICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5tb3VzZUV4Y2x1c2l2ZUJvdW5kcy5zZXQoIHRoaXMubm9kZS5zZWxmQm91bmRzICk7XHJcblxyXG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLm5vZGUuX2NoaWxkcmVuO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGNoaWxkUGlja2VyID0gY2hpbGRyZW5bIGkgXS5fcGlja2VyO1xyXG5cclxuICAgICAgLy8gU2luY2Ugd2UgYXJlIG5vdCBcImluY2x1c2l2ZVwiLCB3ZSB3aWxsIHBydW5lIHRoZSBzZWFyY2ggaWYgc3VidHJlZVBydW5hYmxlIGlzIHRydWUuXHJcbiAgICAgIGlmICggIWNoaWxkUGlja2VyLnN1YnRyZWVQcnVuYWJsZSApIHtcclxuICAgICAgICAvLyBJZiBvdXIgY2hpbGQgaXMgc2VsZkluY2x1c2l2ZSwgd2UgbmVlZCB0byBzd2l0Y2ggdG8gdGhlIFwiaW5jbHVzaXZlXCIgdmFsaWRhdGlvbi5cclxuICAgICAgICBpZiAoIGNoaWxkUGlja2VyLnNlbGZJbmNsdXNpdmUgKSB7XHJcbiAgICAgICAgICBjaGlsZFBpY2tlci52YWxpZGF0ZU1vdXNlSW5jbHVzaXZlKCk7XHJcbiAgICAgICAgICB0aGlzLm1vdXNlRXhjbHVzaXZlQm91bmRzLmluY2x1ZGVCb3VuZHMoIGNoaWxkUGlja2VyLm1vdXNlSW5jbHVzaXZlQm91bmRzICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIE90aGVyd2lzZSwga2VlcCB3aXRoIHRoZSBleGNsdXNpdmUgdmFsaWRhdGlvbi5cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGNoaWxkUGlja2VyLnZhbGlkYXRlTW91c2VFeGNsdXNpdmUoKTtcclxuICAgICAgICAgIHRoaXMubW91c2VFeGNsdXNpdmVCb3VuZHMuaW5jbHVkZUJvdW5kcyggY2hpbGRQaWNrZXIubW91c2VFeGNsdXNpdmVCb3VuZHMgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBJbmNsdWRlIG1vdXNlQXJlYSAoaWYgYXBwbGljYWJsZSksIGV4Y2x1ZGUgb3V0c2lkZSBjbGlwQXJlYSAoaWYgYXBwbGljYWJsZSksIGFuZCB0cmFuc2Zvcm0gdG8gdGhlIHBhcmVudFxyXG4gICAgLy8gY29vcmRpbmF0ZSBmcmFtZS5cclxuICAgIHRoaXMuYXBwbHlBcmVhc0FuZFRyYW5zZm9ybSggdGhpcy5tb3VzZUV4Y2x1c2l2ZUJvdW5kcywgdGhpcy5ub2RlLl9tb3VzZUFyZWEgKTtcclxuXHJcbiAgICB0aGlzLm1vdXNlRXhjbHVzaXZlRGlydHkgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbXB1dGVzIHRoZSB0b3VjaEluY2x1c2l2ZUJvdW5kcyBmb3IgdGhpcyBwaWNrZXIgKGlmIGRpcnR5KSwgYW5kIHJlY3Vyc2l2ZWx5IHZhbGlkYXRlcyBpdCBmb3IgYWxsIG5vbi1wcnVuZWRcclxuICAgKiBjaGlsZHJlbi5cclxuICAgKlxyXG4gICAqIE5PVEU6IEZvciB0aGUgZnV0dXJlLCBjb25zaWRlciBzaGFyaW5nIG1vcmUgY29kZSB3aXRoIHJlbGF0ZWQgZnVuY3Rpb25zLiBJIHRyaWVkIHRoaXMsIGFuZCBpdCBtYWRlIHRoaW5ncyBsb29rXHJcbiAgICogbW9yZSBjb21wbGljYXRlZCAoYW5kIHByb2JhYmx5IHNsb3dlciksIHNvIEkndmUga2VwdCBzb21lIGR1cGxpY2F0aW9uLiBJZiBhIGNoYW5nZSBpcyBtYWRlIHRvIHRoaXMgZnVuY3Rpb24sXHJcbiAgICogcGxlYXNlIGNoZWNrIHRoZSBvdGhlciB2YWxpZGF0ZSogbWV0aG9kcyB0byBzZWUgaWYgdGhleSBhbHNvIG5lZWQgYSBjaGFuZ2UuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB2YWxpZGF0ZVRvdWNoSW5jbHVzaXZlKCk6IHZvaWQge1xyXG4gICAgaWYgKCAhdGhpcy50b3VjaEluY2x1c2l2ZURpcnR5ICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50b3VjaEluY2x1c2l2ZUJvdW5kcy5zZXQoIHRoaXMubm9kZS5zZWxmQm91bmRzICk7XHJcblxyXG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLm5vZGUuX2NoaWxkcmVuO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGNoaWxkUGlja2VyID0gY2hpbGRyZW5bIGkgXS5fcGlja2VyO1xyXG5cclxuICAgICAgLy8gU2luY2Ugd2UgYXJlIFwiaW5jbHVzaXZlXCIsIHdlIGRvbid0IGNhcmUgYWJvdXQgc3VidHJlZVBydW5hYmxlICh3ZSB3b24ndCBwcnVuZSBmb3IgdGhhdCkuIE9ubHkgY2hlY2tcclxuICAgICAgLy8gaWYgcHJ1bmluZyBpcyBmb3JjZSAoc2VsZlBydW5lZCkuXHJcbiAgICAgIGlmICggIWNoaWxkUGlja2VyLnNlbGZQcnVuZWQgKSB7XHJcbiAgICAgICAgY2hpbGRQaWNrZXIudmFsaWRhdGVUb3VjaEluY2x1c2l2ZSgpO1xyXG4gICAgICAgIHRoaXMudG91Y2hJbmNsdXNpdmVCb3VuZHMuaW5jbHVkZUJvdW5kcyggY2hpbGRQaWNrZXIudG91Y2hJbmNsdXNpdmVCb3VuZHMgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEluY2x1ZGUgdG91Y2hBcmVhIChpZiBhcHBsaWNhYmxlKSwgZXhjbHVkZSBvdXRzaWRlIGNsaXBBcmVhIChpZiBhcHBsaWNhYmxlKSwgYW5kIHRyYW5zZm9ybSB0byB0aGUgcGFyZW50XHJcbiAgICAvLyBjb29yZGluYXRlIGZyYW1lLlxyXG4gICAgdGhpcy5hcHBseUFyZWFzQW5kVHJhbnNmb3JtKCB0aGlzLnRvdWNoSW5jbHVzaXZlQm91bmRzLCB0aGlzLm5vZGUuX3RvdWNoQXJlYSApO1xyXG5cclxuICAgIHRoaXMudG91Y2hJbmNsdXNpdmVEaXJ0eSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZXMgdGhlIHRvdWNoRXhjbHVzaXZlQm91bmRzIGZvciB0aGlzIHBpY2tlciAoaWYgZGlydHkpLCBhbmQgcmVjdXJzaXZlbHkgdmFsaWRhdGVzIHRoZSB0b3VjaC1yZWxhdGVkIGJvdW5kc1xyXG4gICAqIGZvciBhbGwgbm9uLXBydW5lZCBjaGlsZHJlbi5cclxuICAgKlxyXG4gICAqIE5vdGFibHksIGlmIGEgcGlja2VyIGlzIHNlbGZJbmNsdXNpdmUsIHdlIHdpbGwgc3dpdGNoIHRvIHZhbGlkYXRpbmcgdG91Y2hJbmNsdXNpdmVCb3VuZHMgZm9yIGl0cyBzdWJ0cmVlLCBhcyB0aGlzXHJcbiAgICogaXMgd2hhdCB0aGUgaGl0LXRlc3Rpbmcgd2lsbCB1c2UuXHJcbiAgICpcclxuICAgKiBOT1RFOiBGb3IgdGhlIGZ1dHVyZSwgY29uc2lkZXIgc2hhcmluZyBtb3JlIGNvZGUgd2l0aCByZWxhdGVkIGZ1bmN0aW9ucy4gSSB0cmllZCB0aGlzLCBhbmQgaXQgbWFkZSB0aGluZ3MgbG9va1xyXG4gICAqIG1vcmUgY29tcGxpY2F0ZWQgKGFuZCBwcm9iYWJseSBzbG93ZXIpLCBzbyBJJ3ZlIGtlcHQgc29tZSBkdXBsaWNhdGlvbi4gSWYgYSBjaGFuZ2UgaXMgbWFkZSB0byB0aGlzIGZ1bmN0aW9uLFxyXG4gICAqIHBsZWFzZSBjaGVjayB0aGUgb3RoZXIgdmFsaWRhdGUqIG1ldGhvZHMgdG8gc2VlIGlmIHRoZXkgYWxzbyBuZWVkIGEgY2hhbmdlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgdmFsaWRhdGVUb3VjaEV4Y2x1c2l2ZSgpOiB2b2lkIHtcclxuICAgIGlmICggIXRoaXMudG91Y2hFeGNsdXNpdmVEaXJ0eSApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudG91Y2hFeGNsdXNpdmVCb3VuZHMuc2V0KCB0aGlzLm5vZGUuc2VsZkJvdW5kcyApO1xyXG5cclxuICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5ub2RlLl9jaGlsZHJlbjtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBjaGlsZFBpY2tlciA9IGNoaWxkcmVuWyBpIF0uX3BpY2tlcjtcclxuXHJcbiAgICAgIC8vIFNpbmNlIHdlIGFyZSBub3QgXCJpbmNsdXNpdmVcIiwgd2Ugd2lsbCBwcnVuZSB0aGUgc2VhcmNoIGlmIHN1YnRyZWVQcnVuYWJsZSBpcyB0cnVlLlxyXG4gICAgICBpZiAoICFjaGlsZFBpY2tlci5zdWJ0cmVlUHJ1bmFibGUgKSB7XHJcbiAgICAgICAgLy8gSWYgb3VyIGNoaWxkIGlzIHNlbGZJbmNsdXNpdmUsIHdlIG5lZWQgdG8gc3dpdGNoIHRvIHRoZSBcImluY2x1c2l2ZVwiIHZhbGlkYXRpb24uXHJcbiAgICAgICAgaWYgKCBjaGlsZFBpY2tlci5zZWxmSW5jbHVzaXZlICkge1xyXG4gICAgICAgICAgY2hpbGRQaWNrZXIudmFsaWRhdGVUb3VjaEluY2x1c2l2ZSgpO1xyXG4gICAgICAgICAgdGhpcy50b3VjaEV4Y2x1c2l2ZUJvdW5kcy5pbmNsdWRlQm91bmRzKCBjaGlsZFBpY2tlci50b3VjaEluY2x1c2l2ZUJvdW5kcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBPdGhlcndpc2UsIGtlZXAgd2l0aCB0aGUgZXhjbHVzaXZlIHZhbGlkYXRpb24uXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBjaGlsZFBpY2tlci52YWxpZGF0ZVRvdWNoRXhjbHVzaXZlKCk7XHJcbiAgICAgICAgICB0aGlzLnRvdWNoRXhjbHVzaXZlQm91bmRzLmluY2x1ZGVCb3VuZHMoIGNoaWxkUGlja2VyLnRvdWNoRXhjbHVzaXZlQm91bmRzICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSW5jbHVkZSB0b3VjaEFyZWEgKGlmIGFwcGxpY2FibGUpLCBleGNsdWRlIG91dHNpZGUgY2xpcEFyZWEgKGlmIGFwcGxpY2FibGUpLCBhbmQgdHJhbnNmb3JtIHRvIHRoZSBwYXJlbnRcclxuICAgIC8vIGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAgICB0aGlzLmFwcGx5QXJlYXNBbmRUcmFuc2Zvcm0oIHRoaXMudG91Y2hFeGNsdXNpdmVCb3VuZHMsIHRoaXMubm9kZS5fdG91Y2hBcmVhICk7XHJcblxyXG4gICAgdGhpcy50b3VjaEV4Y2x1c2l2ZURpcnR5ID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbmNsdWRlIHBvaW50ZXIgYXJlYXMgKGlmIGFwcGxpY2FibGUpLCBleGNsdWRlIGJvdW5kcyBvdXRzaWRlIHRoZSBjbGlwIGFyZWEgKGlmIGFwcGxpY2FibGUpLCBhbmQgdHJhbnNmb3JtXHJcbiAgICogaW50byB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUuIE11dGF0ZXMgdGhlIGJvdW5kcyBwcm92aWRlZC5cclxuICAgKlxyXG4gICAqIE1lYW50IHRvIGJlIGNhbGxlZCBieSB0aGUgdmFsaWRhdGlvbiBtZXRob2RzLCBhcyB0aGlzIHBhcnQgaXMgdGhlIHNhbWUgZm9yIGV2ZXJ5IHZhbGlkYXRpb24gdGhhdCBpcyBkb25lLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIG11dGFibGVCb3VuZHMgLSBUaGUgYm91bmRzIHRvIGJlIG11dGF0ZWQgKGUuZy4gbW91c2VFeGNsdXNpdmVCb3VuZHMpLlxyXG4gICAqIEBwYXJhbSBwb2ludGVyQXJlYSAtIEEgbW91c2VBcmVhL3RvdWNoQXJlYSB0aGF0IHNob3VsZCBiZSBpbmNsdWRlZCBpbiB0aGUgc2VhcmNoLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXBwbHlBcmVhc0FuZFRyYW5zZm9ybSggbXV0YWJsZUJvdW5kczogQm91bmRzMiwgcG9pbnRlckFyZWE6IFNoYXBlIHwgQm91bmRzMiB8IG51bGwgKTogdm9pZCB7XHJcbiAgICAvLyBkbyB0aGlzIGJlZm9yZSB0aGUgdHJhbnNmb3JtYXRpb24gdG8gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lICh0aGUgbW91c2VBcmVhIGlzIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKVxyXG4gICAgaWYgKCBwb2ludGVyQXJlYSApIHtcclxuICAgICAgLy8gd2UgYWNjZXB0IGVpdGhlciBCb3VuZHMyLCBvciBhIFNoYXBlIChpbiB3aGljaCBjYXNlLCB3ZSB0YWtlIHRoZSBTaGFwZSdzIGJvdW5kcylcclxuICAgICAgbXV0YWJsZUJvdW5kcy5pbmNsdWRlQm91bmRzKCBwb2ludGVyQXJlYSBpbnN0YW5jZW9mIEJvdW5kczIgPyAoIHBvaW50ZXJBcmVhICkgOiAoIHBvaW50ZXJBcmVhIGFzIHVua25vd24gYXMgU2hhcGUgKS5ib3VuZHMgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjbGlwQXJlYSA9IHRoaXMubm9kZS5jbGlwQXJlYTtcclxuICAgIGlmICggY2xpcEFyZWEgKSB7XHJcbiAgICAgIGNvbnN0IGNsaXBCb3VuZHMgPSBjbGlwQXJlYS5ib3VuZHM7XHJcbiAgICAgIC8vIGV4Y2x1ZGUgYXJlYXMgb3V0c2lkZSBvZiB0aGUgY2xpcHBpbmcgYXJlYSdzIGJvdW5kcyAoZm9yIGVmZmljaWVuY3kpXHJcbiAgICAgIC8vIFVzZXMgQm91bmRzMi5jb25zdHJhaW5Cb3VuZHMsIGJ1dCBpbmxpbmVkIHRvIHByZXZlbnQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Byb2plY3RpbGUtbW90aW9uL2lzc3Vlcy8xNTVcclxuICAgICAgbXV0YWJsZUJvdW5kcy5taW5YID0gTWF0aC5tYXgoIG11dGFibGVCb3VuZHMubWluWCwgY2xpcEJvdW5kcy5taW5YICk7XHJcbiAgICAgIG11dGFibGVCb3VuZHMubWluWSA9IE1hdGgubWF4KCBtdXRhYmxlQm91bmRzLm1pblksIGNsaXBCb3VuZHMubWluWSApO1xyXG4gICAgICBtdXRhYmxlQm91bmRzLm1heFggPSBNYXRoLm1pbiggbXV0YWJsZUJvdW5kcy5tYXhYLCBjbGlwQm91bmRzLm1heFggKTtcclxuICAgICAgbXV0YWJsZUJvdW5kcy5tYXhZID0gTWF0aC5taW4oIG11dGFibGVCb3VuZHMubWF4WSwgY2xpcEJvdW5kcy5tYXhZICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdHJhbnNmb3JtIGl0IHRvIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZVxyXG4gICAgdGhpcy5ub2RlLnRyYW5zZm9ybUJvdW5kc0Zyb21Mb2NhbFRvUGFyZW50KCBtdXRhYmxlQm91bmRzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgZnJvbSBOb2RlIHdoZW4gYSBjaGlsZCBpcyBpbnNlcnRlZC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGUgY2hpbGQgbWF5IG5vdCBiZSBmdWxseSBhZGRlZCB3aGVuIHRoaXMgaXMgY2FsbGVkLiBEb24ndCBhdWRpdCwgb3IgYXNzdW1lIHRoYXQgY2FsbHMgdG8gdGhlIE5vZGUgd291bGRcclxuICAgKiBpbmRpY2F0ZSB0aGUgcGFyZW50LWNoaWxkIHJlbGF0aW9uc2hpcC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjaGlsZE5vZGUgLSBPdXIgcGlja2VyIG5vZGUncyBuZXcgY2hpbGQgbm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgb25JbnNlcnRDaGlsZCggY2hpbGROb2RlOiBOb2RlICk6IHZvaWQge1xyXG4gICAgLy8gSWYgdGhlIGNoaWxkIGlzIHNlbGZQcnVuZWQsIHdlIGRvbid0IGhhdmUgdG8gdXBkYXRlIGFueSBtZXRhZGF0YS5cclxuICAgIGlmICggIWNoaWxkTm9kZS5fcGlja2VyLnNlbGZQcnVuZWQgKSB7XHJcbiAgICAgIGNvbnN0IGhhc1BpY2thYmxlID0gY2hpbGROb2RlLl9waWNrZXIuc3VidHJlZVBpY2thYmxlQ291bnQgPiAwO1xyXG5cclxuICAgICAgLy8gSWYgaXQgaGFzIGEgbm9uLXplcm8gc3VidHJlZVBpY2thYmxlQ291bnQsIHdlJ2xsIG5lZWQgdG8gaW5jcmVtZW50IG91ciBvd24gY291bnQgYnkgMS5cclxuICAgICAgaWYgKCBoYXNQaWNrYWJsZSApIHtcclxuICAgICAgICB0aGlzLmNoYW5nZVBpY2thYmxlQ291bnQoIDEgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgaXQgaGFzIGEgc3VidHJlZVBpY2thYmxlQ291bnQgb2YgemVybywgaXQgd291bGQgYmUgcHJ1bmVkIGJ5IFwiZXhjbHVzaXZlXCIgc2VhcmNoZXMsIHNvIHdlIG9ubHkgbmVlZCB0b1xyXG4gICAgICAvLyBpbnZhbGlkYXRlIHRoZSBcImluY2x1c2l2ZVwiIGJvdW5kcy5cclxuICAgICAgdGhpcy5pbnZhbGlkYXRlKCBoYXNQaWNrYWJsZSwgdHJ1ZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGZyb20gTm9kZSB3aGVuIGEgY2hpbGQgaXMgcmVtb3ZlZC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGUgY2hpbGQgbWF5IG5vdCBiZSBmdWxseSByZW1vdmVkIHdoZW4gdGhpcyBpcyBjYWxsZWQuIERvbid0IGF1ZGl0LCBvciBhc3N1bWUgdGhhdCBjYWxscyB0byB0aGUgTm9kZSB3b3VsZFxyXG4gICAqIGluZGljYXRlIHRoZSBwYXJlbnQtY2hpbGQgcmVsYXRpb25zaGlwLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGNoaWxkTm9kZSAtIE91ciBwaWNrZXIgbm9kZSdzIGNoaWxkIHRoYXQgd2lsbCBiZSByZW1vdmVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvblJlbW92ZUNoaWxkKCBjaGlsZE5vZGU6IE5vZGUgKTogdm9pZCB7XHJcbiAgICAvLyBJZiB0aGUgY2hpbGQgaXMgc2VsZlBydW5lZCwgd2UgZG9uJ3QgaGF2ZSB0byB1cGRhdGUgYW55IG1ldGFkYXRhLlxyXG4gICAgaWYgKCAhY2hpbGROb2RlLl9waWNrZXIuc2VsZlBydW5lZCApIHtcclxuICAgICAgY29uc3QgaGFzUGlja2FibGUgPSBjaGlsZE5vZGUuX3BpY2tlci5zdWJ0cmVlUGlja2FibGVDb3VudCA+IDA7XHJcblxyXG4gICAgICAvLyBJZiBpdCBoYXMgYSBub24temVybyBzdWJ0cmVlUGlja2FibGVDb3VudCwgd2UnbGwgbmVlZCB0byBkZWNyZW1lbnQgb3VyIG93biBjb3VudCBieSAxLlxyXG4gICAgICBpZiAoIGhhc1BpY2thYmxlICkge1xyXG4gICAgICAgIHRoaXMuY2hhbmdlUGlja2FibGVDb3VudCggLTEgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgaXQgaGFzIGEgc3VidHJlZVBpY2thYmxlQ291bnQgb2YgemVybywgaXQgd291bGQgYmUgcHJ1bmVkIGJ5IFwiZXhjbHVzaXZlXCIgc2VhcmNoZXMsIHNvIHdlIG9ubHkgbmVlZCB0b1xyXG4gICAgICAvLyBpbnZhbGlkYXRlIHRoZSBcImluY2x1c2l2ZVwiIGJvdW5kcy5cclxuICAgICAgdGhpcy5pbnZhbGlkYXRlKCBoYXNQaWNrYWJsZSwgdHJ1ZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGZyb20gTm9kZSB3aGVuIGFuIGlucHV0IGxpc3RlbmVyIGlzIGFkZGVkIHRvIG91ciBub2RlLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgb25BZGRJbnB1dExpc3RlbmVyKCk6IHZvaWQge1xyXG4gICAgLy8gVXBkYXRlIGZsYWdzIHRoYXQgZGVwZW5kIG9uIGxpc3RlbmVyIGNvdW50XHJcbiAgICB0aGlzLmNoZWNrU2VsZkluY2x1c2l2ZSgpO1xyXG4gICAgdGhpcy5jaGVja1N1YnRyZWVQcnVuYWJsZSgpO1xyXG5cclxuICAgIC8vIFVwZGF0ZSBvdXIgcGlja2FibGUgY291bnQsIHNpbmNlIGl0IGluY2x1ZGVzIGEgY291bnQgb2YgaG93IG1hbnkgaW5wdXQgbGlzdGVuZXJzIHdlIGhhdmUuXHJcbiAgICB0aGlzLmNoYW5nZVBpY2thYmxlQ291bnQoIDEgKTsgLy8gTk9URTogdGhpcyBzaG91bGQgYWxzbyB0cmlnZ2VyIGludmFsaWRhdGlvbiBvZiBtb3VzZS90b3VjaCBib3VuZHNcclxuXHJcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7IHRoaXMuYXVkaXQoKTsgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGZyb20gTm9kZSB3aGVuIGFuIGlucHV0IGxpc3RlbmVyIGlzIHJlbW92ZWQgZnJvbSBvdXIgbm9kZS4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIG9uUmVtb3ZlSW5wdXRMaXN0ZW5lcigpOiB2b2lkIHtcclxuICAgIC8vIFVwZGF0ZSBmbGFncyB0aGF0IGRlcGVuZCBvbiBsaXN0ZW5lciBjb3VudFxyXG4gICAgdGhpcy5jaGVja1NlbGZJbmNsdXNpdmUoKTtcclxuICAgIHRoaXMuY2hlY2tTdWJ0cmVlUHJ1bmFibGUoKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgb3VyIHBpY2thYmxlIGNvdW50LCBzaW5jZSBpdCBpbmNsdWRlcyBhIGNvdW50IG9mIGhvdyBtYW55IGlucHV0IGxpc3RlbmVycyB3ZSBoYXZlLlxyXG4gICAgdGhpcy5jaGFuZ2VQaWNrYWJsZUNvdW50KCAtMSApOyAvLyBOT1RFOiB0aGlzIHNob3VsZCBhbHNvIHRyaWdnZXIgaW52YWxpZGF0aW9uIG9mIG1vdXNlL3RvdWNoIGJvdW5kc1xyXG5cclxuICAgIGlmICggYXNzZXJ0U2xvdyApIHsgdGhpcy5hdWRpdCgpOyB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgJ3BpY2thYmxlJyB2YWx1ZSBvZiBvdXIgTm9kZSBpcyBjaGFuZ2VkLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgb25QaWNrYWJsZUNoYW5nZSggb2xkUGlja2FibGU6IGJvb2xlYW4gfCBudWxsLCBwaWNrYWJsZTogYm9vbGVhbiB8IG51bGwgKTogdm9pZCB7XHJcbiAgICAvLyBVcGRhdGUgZmxhZ3MgdGhhdCBkZXBlbmQgb24gb3VyIHBpY2thYmxlIHNldHRpbmcuXHJcbiAgICB0aGlzLmNoZWNrU2VsZlBydW5lZCgpO1xyXG4gICAgdGhpcy5jaGVja1NlbGZJbmNsdXNpdmUoKTtcclxuICAgIHRoaXMuY2hlY2tTdWJ0cmVlUHJ1bmFibGUoKTtcclxuXHJcbiAgICAvLyBDb21wdXRlIG91ciBwaWNrYWJsZSBjb3VudCBjaGFuZ2UgKHBpY2thYmxlOnRydWUgY291bnRzIGZvciAxKVxyXG4gICAgY29uc3QgY2hhbmdlID0gKCBvbGRQaWNrYWJsZSA9PT0gdHJ1ZSA/IC0xIDogMCApICsgKCBwaWNrYWJsZSA9PT0gdHJ1ZSA/IDEgOiAwICk7XHJcblxyXG4gICAgaWYgKCBjaGFuZ2UgKSB7XHJcbiAgICAgIHRoaXMuY2hhbmdlUGlja2FibGVDb3VudCggY2hhbmdlICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLmF1ZGl0KCk7IH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIHRoZSB2aXNpYmlsaXR5IG9mIG91ciBOb2RlIGlzIGNoYW5nZWQuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBvblZpc2liaWxpdHlDaGFuZ2UoKTogdm9pZCB7XHJcbiAgICAvLyBVcGRhdGUgZmxhZ3MgdGhhdCBkZXBlbmQgb24gb3VyIHZpc2liaWxpdHkuXHJcbiAgICB0aGlzLmNoZWNrU2VsZlBydW5lZCgpO1xyXG4gICAgdGhpcy5jaGVja1N1YnRyZWVQcnVuYWJsZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIG1vdXNlQXJlYSBvZiB0aGUgTm9kZSBpcyBjaGFuZ2VkLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgb25Nb3VzZUFyZWFDaGFuZ2UoKTogdm9pZCB7XHJcbiAgICAvLyBCb3VuZHMgY2FuIGRlcGVuZCBvbiB0aGUgbW91c2VBcmVhLCBzbyB3ZSdsbCBpbnZhbGlkYXRlIHRob3NlLlxyXG4gICAgLy8gVE9ETzogQ29uc2lkZXIgYm91bmRzIGludmFsaWRhdGlvbiB0aGF0IG9ubHkgZG9lcyB0aGUgJ21vdXNlJyBmbGFncywgc2luY2Ugd2UgZG9uJ3QgbmVlZCB0byBpbnZhbGlkYXRlIHRvdWNoZXMuXHJcbiAgICB0aGlzLmludmFsaWRhdGUoIHRydWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIHRoZSBtb3VzZUFyZWEgb2YgdGhlIE5vZGUgaXMgY2hhbmdlZC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIG9uVG91Y2hBcmVhQ2hhbmdlKCk6IHZvaWQge1xyXG4gICAgLy8gQm91bmRzIGNhbiBkZXBlbmQgb24gdGhlIHRvdWNoQXJlYSwgc28gd2UnbGwgaW52YWxpZGF0ZSB0aG9zZS5cclxuICAgIC8vIFRPRE86IENvbnNpZGVyIGJvdW5kcyBpbnZhbGlkYXRpb24gdGhhdCBvbmx5IGRvZXMgdGhlICd0b3VjaCcgZmxhZ3MsIHNpbmNlIHdlIGRvbid0IG5lZWQgdG8gaW52YWxpZGF0ZSBtaWNlLlxyXG4gICAgdGhpcy5pbnZhbGlkYXRlKCB0cnVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgdHJhbnNmb3JtIG9mIHRoZSBOb2RlIGlzIGNoYW5nZWQuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBvblRyYW5zZm9ybUNoYW5nZSgpOiB2b2lkIHtcclxuICAgIC8vIENhbiBhZmZlY3Qgb3VyIGJvdW5kc1xyXG4gICAgdGhpcy5pbnZhbGlkYXRlKCB0cnVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgdHJhbnNmb3JtIG9mIHRoZSBOb2RlIGlzIGNoYW5nZWQuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBvblNlbGZCb3VuZHNEaXJ0eSgpOiB2b2lkIHtcclxuICAgIC8vIENhbiBhZmZlY3Qgb3VyIGJvdW5kc1xyXG4gICAgdGhpcy5pbnZhbGlkYXRlKCB0cnVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgdHJhbnNmb3JtIG9mIHRoZSBOb2RlIGlzIGNoYW5nZWQuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBvbkNsaXBBcmVhQ2hhbmdlKCk6IHZvaWQge1xyXG4gICAgLy8gQ2FuIGFmZmVjdCBvdXIgYm91bmRzLlxyXG4gICAgdGhpcy5pbnZhbGlkYXRlKCB0cnVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayB0byBzZWUgaWYgd2UgYXJlICdzZWxmUHJ1bmVkJywgYW5kIHVwZGF0ZSB0aGUgdmFsdWUuIElmIGl0IGNoYW5nZWQsIHdlJ2xsIG5lZWQgdG8gbm90aWZ5IG91ciBwYXJlbnRzLlxyXG4gICAqXHJcbiAgICogTm90ZSB0aGF0IHRoZSBwcnVuYWJpbGl0eSBcInBpY2thYmxlOmZhbHNlXCIgb3IgXCJpbnZpc2libGVcIiB3b24ndCBhZmZlY3Qgb3VyIGNvbXB1dGVkIGJvdW5kcywgc28gd2UgZG9uJ3RcclxuICAgKiBpbnZhbGlkYXRlIG91cnNlbGYuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjaGVja1NlbGZQcnVuZWQoKTogdm9pZCB7XHJcbiAgICBjb25zdCBzZWxmUHJ1bmVkID0gdGhpcy5ub2RlLnBpY2thYmxlUHJvcGVydHkudmFsdWUgPT09IGZhbHNlIHx8ICF0aGlzLm5vZGUuaXNWaXNpYmxlKCk7XHJcbiAgICBpZiAoIHRoaXMuc2VsZlBydW5lZCAhPT0gc2VsZlBydW5lZCApIHtcclxuICAgICAgdGhpcy5zZWxmUHJ1bmVkID0gc2VsZlBydW5lZDtcclxuXHJcbiAgICAgIC8vIE5vdGlmeSBwYXJlbnRzXHJcbiAgICAgIGNvbnN0IHBhcmVudHMgPSB0aGlzLm5vZGUuX3BhcmVudHM7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBhcmVudHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgcGlja2VyID0gcGFyZW50c1sgaSBdLl9waWNrZXI7XHJcblxyXG4gICAgICAgIC8vIElmIHdlIGhhdmUgYW4gaW5wdXQgbGlzdGVuZXIvcGlja2FibGU6dHJ1ZSBpbiBvdXIgc3VidHJlZSwgd2UnbGwgbmVlZCB0byBpbnZhbGlkYXRlIGV4Y2x1c2l2ZSBib3VuZHMgYWxzbyxcclxuICAgICAgICAvLyBhbmQgd2UnbGwgd2FudCB0byB1cGRhdGUgdGhlIHBpY2thYmxlIGNvdW50IG9mIG91ciBwYXJlbnQuXHJcbiAgICAgICAgaWYgKCB0aGlzLnN1YnRyZWVQaWNrYWJsZUNvdW50ID4gMCApIHtcclxuICAgICAgICAgIHBpY2tlci5pbnZhbGlkYXRlKCB0cnVlLCB0cnVlICk7XHJcbiAgICAgICAgICBwaWNrZXIuY2hhbmdlUGlja2FibGVDb3VudCggdGhpcy5zZWxmUHJ1bmVkID8gLTEgOiAxICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgLy8gSWYgd2UgaGF2ZSBub3RoaW5nIGluIG91ciBzdWJ0cmVlIHRoYXQgd291bGQgZm9yY2UgYSB2aXNpdCwgd2Ugb25seSBuZWVkIHRvIGludmFsaWRhdGUgdGhlIFwiaW5jbHVzaXZlXCJcclxuICAgICAgICAvLyBib3VuZHMuXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBwaWNrZXIuaW52YWxpZGF0ZSggZmFsc2UsIHRydWUgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIHRvIHNlZSBpZiB3ZSBhcmUgJ3NlbGZJbmNsdXNpdmUnLCBhbmQgdXBkYXRlIHRoZSB2YWx1ZS4gSWYgaXQgY2hhbmdlZCwgd2UnbGwgbmVlZCB0byBpbnZhbGlkYXRlIG91cnNlbGYuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjaGVja1NlbGZJbmNsdXNpdmUoKTogdm9pZCB7XHJcbiAgICBjb25zdCBzZWxmSW5jbHVzaXZlID0gdGhpcy5ub2RlLnBpY2thYmxlUHJvcGVydHkudmFsdWUgPT09IHRydWUgfHwgdGhpcy5ub2RlLl9pbnB1dExpc3RlbmVycy5sZW5ndGggPiAwO1xyXG4gICAgaWYgKCB0aGlzLnNlbGZJbmNsdXNpdmUgIT09IHNlbGZJbmNsdXNpdmUgKSB7XHJcbiAgICAgIHRoaXMuc2VsZkluY2x1c2l2ZSA9IHNlbGZJbmNsdXNpdmU7XHJcblxyXG4gICAgICAvLyBPdXIgZGlydHkgZmxhZyBoYW5kbGluZyBmb3IgYm90aCBpbmNsdXNpdmUgYW5kIGV4Y2x1c2l2ZSBkZXBlbmQgb24gdGhpcyB2YWx1ZS5cclxuICAgICAgdGhpcy5pbnZhbGlkYXRlKCB0cnVlLCB0cnVlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgb3VyICdzdWJ0cmVlUHJ1bmFibGUnIGZsYWcuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjaGVja1N1YnRyZWVQcnVuYWJsZSgpOiB2b2lkIHtcclxuICAgIGNvbnN0IHN1YnRyZWVQcnVuYWJsZSA9IHRoaXMubm9kZS5waWNrYWJsZVByb3BlcnR5LnZhbHVlID09PSBmYWxzZSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIXRoaXMubm9kZS5pc1Zpc2libGUoKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCB0aGlzLm5vZGUucGlja2FibGVQcm9wZXJ0eS52YWx1ZSAhPT0gdHJ1ZSAmJiB0aGlzLnN1YnRyZWVQaWNrYWJsZUNvdW50ID09PSAwICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLnN1YnRyZWVQcnVuYWJsZSAhPT0gc3VidHJlZVBydW5hYmxlICkge1xyXG4gICAgICB0aGlzLnN1YnRyZWVQcnVuYWJsZSA9IHN1YnRyZWVQcnVuYWJsZTtcclxuXHJcbiAgICAgIC8vIE91ciBkaXJ0eSBmbGFnIGhhbmRsaW5nIGZvciBib3RoIGluY2x1c2l2ZSBhbmQgZXhjbHVzaXZlIGRlcGVuZCBvbiB0aGlzIHZhbHVlLlxyXG4gICAgICB0aGlzLmludmFsaWRhdGUoIHRydWUsIHRydWUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByb3BhZ2F0ZSB0aGUgcGlja2FibGUgY291bnQgY2hhbmdlIGRvd24gdG8gb3VyIGFuY2VzdG9ycy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBuIC0gVGhlIGRlbHRhIG9mIGhvdyBtYW55IHBpY2thYmxlIGNvdW50cyBoYXZlIGJlZW4gYWRkZWQvcmVtb3ZlZFxyXG4gICAqL1xyXG4gIHByaXZhdGUgY2hhbmdlUGlja2FibGVDb3VudCggbjogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgaWYgKCBuID09PSAwICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3dpdGNoaW5nIGJldHdlZW4gMCBhbmQgMSBtYXR0ZXJzLCBzaW5jZSB3ZSB0aGVuIG5lZWQgdG8gdXBkYXRlIHRoZSBjb3VudHMgb2Ygb3VyIHBhcmVudHMuXHJcbiAgICBjb25zdCB3YXNaZXJvID0gdGhpcy5zdWJ0cmVlUGlja2FibGVDb3VudCA9PT0gMDtcclxuICAgIHRoaXMuc3VidHJlZVBpY2thYmxlQ291bnQgKz0gbjtcclxuICAgIGNvbnN0IGlzWmVybyA9IHRoaXMuc3VidHJlZVBpY2thYmxlQ291bnQgPT09IDA7XHJcblxyXG4gICAgLy8gT3VyIHN1YnRyZWVQcnVuYWJsZSB2YWx1ZSBkZXBlbmRzIG9uIG91ciBwaWNrYWJsZSBjb3VudCwgbWFrZSBzdXJlIGl0IGdldHMgdXBkYXRlZC5cclxuICAgIHRoaXMuY2hlY2tTdWJ0cmVlUHJ1bmFibGUoKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnN1YnRyZWVQaWNrYWJsZUNvdW50ID49IDAsICdzdWJ0cmVlIHBpY2thYmxlIGNvdW50IHNob3VsZCBiZSBndWFyYW50ZWVkIHRvIGJlID49IDAnICk7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5zZWxmUHJ1bmVkICYmIHdhc1plcm8gIT09IGlzWmVybyApIHtcclxuICAgICAgLy8gVXBkYXRlIG91ciBwYXJlbnRzIGlmIG91ciBjb3VudCBjaGFuZ2VkIChBTkQgaWYgaXQgbWF0dGVycywgaS5lLiB3ZSBhcmVuJ3Qgc2VsZlBydW5lZCkuXHJcbiAgICAgIGNvbnN0IGxlbiA9IHRoaXMubm9kZS5fcGFyZW50cy5sZW5ndGg7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbjsgaSsrICkge1xyXG4gICAgICAgIHRoaXMubm9kZS5fcGFyZW50c1sgaSBdLl9waWNrZXIuY2hhbmdlUGlja2FibGVDb3VudCggd2FzWmVybyA/IDEgOiAtMSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSdW5zIGEgbnVtYmVyIG9mIGNvbnNpc3RlbmN5IHRlc3RzIHdoZW4gYXNzZXJ0U2xvdyBpcyBlbmFibGVkLiBWZXJpZmllcyBtb3N0IGNvbmRpdGlvbnMsIGFuZCBoZWxwcyB0byBjYXRjaFxyXG4gICAqIGJ1Z3MgZWFybGllciB3aGVuIHRoZXkgYXJlIGluaXRpYWxseSB0cmlnZ2VyZWQuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBhdWRpdCgpOiB2b2lkIHtcclxuICAgIGlmICggYXNzZXJ0U2xvdyApIHtcclxuICAgICAgdGhpcy5ub2RlLl9jaGlsZHJlbi5mb3JFYWNoKCBub2RlID0+IHtcclxuICAgICAgICBub2RlLl9waWNrZXIuYXVkaXQoKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgY29uc3QgbG9jYWxBc3NlcnRTbG93ID0gYXNzZXJ0U2xvdztcclxuXHJcbiAgICAgIGNvbnN0IGV4cGVjdGVkU2VsZlBydW5lZCA9IHRoaXMubm9kZS5waWNrYWJsZSA9PT0gZmFsc2UgfHwgIXRoaXMubm9kZS5pc1Zpc2libGUoKTtcclxuICAgICAgY29uc3QgZXhwZWN0ZWRTZWxmSW5jbHVzaXZlID0gdGhpcy5ub2RlLnBpY2thYmxlID09PSB0cnVlIHx8IHRoaXMubm9kZS5faW5wdXRMaXN0ZW5lcnMubGVuZ3RoID4gMDtcclxuICAgICAgY29uc3QgZXhwZWN0ZWRTdWJ0cmVlUHJ1bmFibGUgPSB0aGlzLm5vZGUucGlja2FibGUgPT09IGZhbHNlIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXRoaXMubm9kZS5pc1Zpc2libGUoKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggdGhpcy5ub2RlLnBpY2thYmxlICE9PSB0cnVlICYmIHRoaXMuc3VidHJlZVBpY2thYmxlQ291bnQgPT09IDAgKTtcclxuICAgICAgY29uc3QgZXhwZWN0ZWRTdWJ0cmVlUGlja2FibGVDb3VudCA9IHRoaXMubm9kZS5faW5wdXRMaXN0ZW5lcnMubGVuZ3RoICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggdGhpcy5ub2RlLnBpY2thYmxlUHJvcGVydHkudmFsdWUgPT09IHRydWUgPyAxIDogMCApICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uZmlsdGVyKCB0aGlzLm5vZGUuX2NoaWxkcmVuLCBjaGlsZCA9PiAhY2hpbGQuX3BpY2tlci5zZWxmUHJ1bmVkICYmIGNoaWxkLl9waWNrZXIuc3VidHJlZVBpY2thYmxlQ291bnQgPiAwICkubGVuZ3RoO1xyXG5cclxuICAgICAgYXNzZXJ0U2xvdyggdGhpcy5zZWxmUHJ1bmVkID09PSBleHBlY3RlZFNlbGZQcnVuZWQsICdzZWxmUHJ1bmVkIG1pc21hdGNoJyApO1xyXG4gICAgICBhc3NlcnRTbG93KCB0aGlzLnNlbGZJbmNsdXNpdmUgPT09IGV4cGVjdGVkU2VsZkluY2x1c2l2ZSwgJ3NlbGZJbmNsdXNpdmUgbWlzbWF0Y2gnICk7XHJcbiAgICAgIGFzc2VydFNsb3coIHRoaXMuc3VidHJlZVBydW5hYmxlID09PSBleHBlY3RlZFN1YnRyZWVQcnVuYWJsZSwgJ3N1YnRyZWVQcnVuYWJsZSBtaXNtYXRjaCcgKTtcclxuICAgICAgYXNzZXJ0U2xvdyggdGhpcy5zdWJ0cmVlUGlja2FibGVDb3VudCA9PT0gZXhwZWN0ZWRTdWJ0cmVlUGlja2FibGVDb3VudCwgJ3N1YnRyZWVQaWNrYWJsZUNvdW50IG1pc21hdGNoJyApO1xyXG5cclxuICAgICAgdGhpcy5ub2RlLl9wYXJlbnRzLmZvckVhY2goIHBhcmVudCA9PiB7XHJcbiAgICAgICAgY29uc3QgcGFyZW50UGlja2VyID0gcGFyZW50Ll9waWNrZXI7XHJcblxyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xyXG4gICAgICAgIGNvbnN0IGNoaWxkUGlja2VyID0gdGhpczsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjb25zaXN0ZW50LXRoaXNcclxuXHJcbiAgICAgICAgaWYgKCAhcGFyZW50UGlja2VyLm1vdXNlSW5jbHVzaXZlRGlydHkgKSB7XHJcbiAgICAgICAgICBsb2NhbEFzc2VydFNsb3coIGNoaWxkUGlja2VyLnNlbGZQcnVuZWQgfHwgIWNoaWxkUGlja2VyLm1vdXNlSW5jbHVzaXZlRGlydHkgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICggIXBhcmVudFBpY2tlci5tb3VzZUV4Y2x1c2l2ZURpcnR5ICkge1xyXG4gICAgICAgICAgaWYgKCBjaGlsZFBpY2tlci5zZWxmSW5jbHVzaXZlICkge1xyXG4gICAgICAgICAgICBsb2NhbEFzc2VydFNsb3coIGNoaWxkUGlja2VyLnNlbGZQcnVuZWQgfHwgIWNoaWxkUGlja2VyLm1vdXNlSW5jbHVzaXZlRGlydHkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsb2NhbEFzc2VydFNsb3coIGNoaWxkUGlja2VyLnNlbGZQcnVuZWQgfHwgY2hpbGRQaWNrZXIuc3VidHJlZVBydW5hYmxlIHx8ICFjaGlsZFBpY2tlci5tb3VzZUV4Y2x1c2l2ZURpcnR5ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoICFwYXJlbnRQaWNrZXIudG91Y2hJbmNsdXNpdmVEaXJ0eSApIHtcclxuICAgICAgICAgIGxvY2FsQXNzZXJ0U2xvdyggY2hpbGRQaWNrZXIuc2VsZlBydW5lZCB8fCAhY2hpbGRQaWNrZXIudG91Y2hJbmNsdXNpdmVEaXJ0eSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCAhcGFyZW50UGlja2VyLnRvdWNoRXhjbHVzaXZlRGlydHkgKSB7XHJcbiAgICAgICAgICBpZiAoIGNoaWxkUGlja2VyLnNlbGZJbmNsdXNpdmUgKSB7XHJcbiAgICAgICAgICAgIGxvY2FsQXNzZXJ0U2xvdyggY2hpbGRQaWNrZXIuc2VsZlBydW5lZCB8fCAhY2hpbGRQaWNrZXIudG91Y2hJbmNsdXNpdmVEaXJ0eSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGxvY2FsQXNzZXJ0U2xvdyggY2hpbGRQaWNrZXIuc2VsZlBydW5lZCB8fCBjaGlsZFBpY2tlci5zdWJ0cmVlUHJ1bmFibGUgfHwgIWNoaWxkUGlja2VyLnRvdWNoRXhjbHVzaXZlRGlydHkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdQaWNrZXInLCBQaWNrZXIgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxTQUFlQyxPQUFPLEVBQUVDLEtBQUssUUFBUSxlQUFlO0FBR3BELGVBQWUsTUFBTUMsTUFBTSxDQUFDO0VBRTFCOztFQUdBO0VBQ0E7RUFHQTtFQUNBO0VBQ0E7RUFHQTtFQUNBO0VBR0E7RUFDQTtFQUNBO0VBR0E7RUFDQTtFQUNBO0VBQ0E7RUFFQTtFQUNBO0VBR0E7RUFDQTtFQUdBO0VBQ0E7RUFHQTtFQUNBO0VBR0E7RUFNQTtFQUdPQyxXQUFXQSxDQUFFQyxJQUFVLEVBQUc7SUFDL0IsSUFBSSxDQUFDQSxJQUFJLEdBQUdBLElBQUk7SUFDaEIsSUFBSSxDQUFD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