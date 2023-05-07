// Copyright 2013-2022, University of Colorado Boulder

/**
 * Something that can be displayed with a specific renderer.
 * NOTE: Drawables are assumed to be pooled with PoolableMixin, as freeToPool() is called.
 *
 * A drawable's life-cycle starts with its initialization (calling initialize once), and ends with its disposal
 * (where it is freed to its own pool).
 *
 * Drawables are part of an unordered drawable "tree" where each drawable can have a parent references. This is used
 * for, among other things, propagation of 'dirty' flags and usage during stitching.
 *
 * Blocks and backbones (sub-types of Drawable) contain children (creating a tree, although shared caches make it more
 * like a DAG). Our Scenery Display is built from a root backbone, that contains blocks. This can be Canvas/SVG, but
 * may also contain a DOM block with another backbone (used for opacity, CSS transforms, etc.).
 *
 * Drawables are part of two inherent linked lists: an "old" and a "new" one. Usually they are the same, but during
 * updates, the "new" linked list is changed to accomodate any changes, and then a stitch process is done to mark which
 * block (parent) we will belong to.
 *
 * As part of stitching or other processes, a Drawable is responsible for recording its pending state changes. Most
 * notably, we need to determine whether a drawable is being added, moved, or removed in the next frame. This is done
 * with an idempotent API using notePendingAddition/notePendingRemoval/notePendingMove. Either:
 *   - One or more notePendingMove() calls are made. When we are updated with updateBlock(), we will move to the
 *     last block referenced with notePendingMove() (which may be a no-op if it is the same block).
 *   - Zero or one notePendingAddition() call is made, and zero or one notePendingRemoval() call is made. Our action is:
 *     - No addition, no removal: nothing done
 *     - No addition, one removal: We are removed from our last block (and then presumably disposed later)
 *     - One addition, no removal: We are added to our new (pending) block, without being removed from anything
 *     - One addition, one removal: We are removed from our last block and added to our new (pending) block.
 * It is set up so that the order of addition/removal calls doesn't matter, since these can occur from within different
 * backbone stitches (removed in one, added in another, or with the order reversed). Our updateBlocks() is guaranteed
 * to be called after all of those have been completed.
 *
 * APIs for drawable types:
 *
 * DOM: {
 *   domElement: {HTMLElement}
 * }
 * Canvas: {
 *   paintCanvas: function( {CanvasContextWrapper} wrapper, {Node} node, {Matrix3} matrix )
 * }
 * SVG: {
 *   svgElement: {SVGElement}
 * }
 * WebGL: {
 *   onAddToBlock: function( {WebGLBlock} block )
 *   onRemoveFromBlock: function( {WebGLBlock} block )
 *   render: function( {ShaderProgram} shaderProgram )
 *   shaderAttributes: {string[]} - names of vertex attributes to be used
 * }
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TinyProperty from '../../../axon/js/TinyProperty.js';
import { Block, Renderer, scenery } from '../imports.js';
let globalId = 1;
class Drawable {
  /**
   * @public
   *
   * @param {number} renderer
   * @returns {Drawable} - for chaining
   */
  initialize(renderer) {
    assert && assert(!this.id || this.isDisposed, 'If we previously existed, we need to have been disposed');

    // @public {number} - unique ID for drawables
    this.id = this.id || globalId++;
    sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`[${this.constructor.name}*] initialize ${this.toString()}`);
    this.clean();

    // @public {number} - Bitmask defined by Renderer.js
    this.renderer = renderer;

    // @public {boolean}
    this.dirty = true;

    // @private {boolean}
    this.isDisposed = false;
    this.linksDirty = false;

    // @public {TinyProperty.<boolean>}
    this.visibleProperty = new TinyProperty(true);
    this.fittableProperty = new TinyProperty(true); // If false, will cause our parent block to not be fitted

    return this;
  }

  /**
   * Cleans the state of this drawable to the defaults.
   * @protected
   */
  clean() {
    // @public {Drawable|null} - what drawable we are being rendered (or put) into (will be filled in later)
    this.parentDrawable = null;

    // @public {BackboneDrawable|null} - a backbone reference (if applicable).
    this.backbone = null;

    // @public {Drawable|null} - what our parent drawable will be after the stitch is finished
    this.pendingParentDrawable = null;

    // @public {BackboneDrawable|null} - what our backbone will be after the stitch is finished (if applicable)
    this.pendingBackbone = null;

    // @public {boolean} - whether we are to be added to a block/backbone in our updateBlock() call
    this.pendingAddition = false;

    // @public {boolean} - whether we are to be removed from a block/backbone in our updateBlock() call
    this.pendingRemoval = false;
    assert && assert(!this.previousDrawable && !this.nextDrawable, 'By cleaning (disposal or fresh creation), we should have disconnected from the linked list');

    // @public {Drawable|null} - Linked list handling (will be filled in later)
    this.previousDrawable = null;
    this.nextDrawable = null;

    // @public {Drawable|null} - Similar to previousDrawable/nextDrawable, but without recent changes, so that we can
    // traverse both orders at the same time for stitching.
    this.oldPreviousDrawable = null;
    this.oldNextDrawable = null;
    this.visibleProperty && this.visibleProperty.removeAllListeners();
    this.fittableProperty && this.fittableProperty.removeAllListeners();
  }

  /**
   * Updates the DOM appearance of this drawable (whether by preparing/calling draw calls, DOM element updates, etc.)
   * @public
   *
   * Generally meant to be overridden in subtypes (but should still call this to check if they should update).
   *
   * @returns {boolean} - Whether the update should continue (if false, further updates in supertype steps should not
   *                      be done).
   */
  update() {
    let needsFurtherUpdates = false;
    if (this.dirty && !this.isDisposed) {
      this.dirty = false;
      needsFurtherUpdates = true;
    }
    return needsFurtherUpdates;
  }

  /**
   * Sets whether the drawable is visible.
   * @public
   *
   * @param {boolean} visible
   */
  setVisible(visible) {
    this.visibleProperty.value = visible;
  }
  set visible(value) {
    this.setVisible(value);
  }

  /**
   * Returns whether the drawable is visible.
   * @public
   *
   * @returns {boolean}
   */
  isVisible() {
    return this.visibleProperty.value;
  }
  get visible() {
    return this.isVisible();
  }

  /**
   * Sets whether this drawable is fittable.
   * @public
   *
   * NOTE: Should be called just after initialization (before being added to blocks) if we aren't fittable.
   *
   * @param {boolean} fittable
   */
  setFittable(fittable) {
    this.fittableProperty.value = fittable;
  }
  set fittable(value) {
    this.setFittable(value);
  }

  /**
   * Returns whether the drawable is fittable.
   * @public
   *
   * @returns {boolean}
   */
  isFittable() {
    return this.fittableProperty.value;
  }
  get fittable() {
    return this.isFittable();
  }

  /**
   * Called to add a block (us) as a child of a backbone
   * @public
   *
   * @param {BackboneDrawable} backboneInstance
   */
  setBlockBackbone(backboneInstance) {
    sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`[${this.constructor.name}*] setBlockBackbone ${this.toString()} with ${backboneInstance.toString()}`);

    // if this is being called, Block will be guaranteed to be loaded
    assert && assert(this instanceof Block);
    this.parentDrawable = backboneInstance;
    this.backbone = backboneInstance;
    this.pendingParentDrawable = backboneInstance;
    this.pendingBackbone = backboneInstance;
    this.pendingAddition = false;
    this.pendingRemoval = false;
  }

  /**
   * Notifies the Display of a pending addition.
   * @public
   *
   * @param {Display} display
   * @param {Block} block
   * @param {BackboneDrawable} backbone
   */
  notePendingAddition(display, block, backbone) {
    sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`[${this.constructor.name}*] notePendingAddition ${this.toString()} with ${block.toString()}, ${backbone ? backbone.toString() : '-'}`);
    assert && assert(backbone !== undefined, 'backbone can be either null or a backbone');
    assert && assert(block instanceof Block);
    this.pendingParentDrawable = block;
    this.pendingBackbone = backbone;
    this.pendingAddition = true;

    // if we weren't already marked for an update, mark us
    if (!this.pendingRemoval) {
      display.markDrawableChangedBlock(this);
    }
  }

  /**
   * Notifies the Display of a pending removal.
   * @public
   *
   * @param {Display} display
   */
  notePendingRemoval(display) {
    sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`[${this.constructor.name}*] notePendingRemoval ${this.toString()}`);
    this.pendingRemoval = true;

    // if we weren't already marked for an update, mark us
    if (!this.pendingAddition) {
      display.markDrawableChangedBlock(this);
    }
  }

  /**
   * Notifies the Display of a pending move.
   * @public
   *
   * Moving a drawable that isn't changing backbones, just potentially changing its block.
   * It should not have notePendingAddition or notePendingRemoval called on it.
   *
   * @param {Display} display
   * @param {Block} block
   */
  notePendingMove(display, block) {
    sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`[${this.constructor.name}*] notePendingMove ${this.toString()} with ${block.toString()}`);
    assert && assert(block instanceof Block);
    this.pendingParentDrawable = block;
    if (!this.pendingRemoval || !this.pendingAddition) {
      display.markDrawableChangedBlock(this);
    }

    // set both flags, since we need it to be removed and added
    this.pendingAddition = true;
    this.pendingRemoval = true;
  }

  /**
   * Updates the block.
   * @public
   *
   * @returns {boolean} - Whether we changed our block
   */
  updateBlock() {
    sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`[${this.constructor.name}*] updateBlock ${this.toString()} with add:${this.pendingAddition} remove:${this.pendingRemoval} old:${this.parentDrawable ? this.parentDrawable.toString() : '-'} new:${this.pendingParentDrawable ? this.pendingParentDrawable.toString() : '-'}`);
    sceneryLog && sceneryLog.Drawable && sceneryLog.push();
    let changed = false;
    if (this.pendingRemoval || this.pendingAddition) {
      // we are only unchanged if we have an addition AND removal, and the endpoints are identical
      changed = !this.pendingRemoval || !this.pendingAddition || this.parentDrawable !== this.pendingParentDrawable || this.backbone !== this.pendingBackbone;
      if (changed) {
        if (this.pendingRemoval) {
          sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`removing from ${this.parentDrawable.toString()}`);
          this.parentDrawable.removeDrawable(this);

          // remove references if we are not being added back in
          if (!this.pendingAddition) {
            this.pendingParentDrawable = null;
            this.pendingBackbone = null;
          }
        }
        this.parentDrawable = this.pendingParentDrawable;
        this.backbone = this.pendingBackbone;
        if (this.pendingAddition) {
          sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`adding to ${this.parentDrawable.toString()}`);
          this.parentDrawable.addDrawable(this);
        }
      } else {
        sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable('unchanged');
        if (this.pendingAddition && Renderer.isCanvas(this.renderer)) {
          this.parentDrawable.onPotentiallyMovedDrawable(this);
        }
      }
      this.pendingAddition = false;
      this.pendingRemoval = false;
    }
    sceneryLog && sceneryLog.Drawable && sceneryLog.pop();
    return changed;
  }

  /**
   * Moves the old-drawable-linked-list information into the current-linked-list.
   * @public
   */
  updateLinks() {
    this.oldNextDrawable = this.nextDrawable;
    this.oldPreviousDrawable = this.previousDrawable;
    this.linksDirty = false;
  }

  /**
   * Marks this as needing an update.
   * @public
   */
  markDirty() {
    if (!this.dirty) {
      this.dirty = true;

      // TODO: notify what we want to call repaint() later
      if (this.parentDrawable) {
        this.parentDrawable.markDirtyDrawable(this);
      }
    }
  }

  /**
   * Marks our linked list as dirty.
   * @public
   *
   * Will ensure that after syncTree phase is done, we will have updateLinks() called on us
   *
   * @param {Display} display
   */
  markLinksDirty(display) {
    if (!this.linksDirty) {
      this.linksDirty = true;
      display.markDrawableForLinksUpdate(this);
    }
  }

  /**
   * Marks us for disposal in the next phase of updateDisplay(), and disconnects from the linked list
   * @public
   *
   * @param {Display} display
   */
  markForDisposal(display) {
    // as we are marked for disposal, we disconnect from the linked list (so our disposal setting nulls won't cause issues)
    Drawable.disconnectBefore(this, display);
    Drawable.disconnectAfter(this, display);
    display.markDrawableForDisposal(this);
  }

  /**
   * Disposes immediately, and makes no guarantees about out linked list's state (disconnects).
   * @public
   *
   * @param {Display} display
   */
  disposeImmediately(display) {
    // as we are marked for disposal, we disconnect from the linked list (so our disposal setting nulls won't cause issues)
    Drawable.disconnectBefore(this, display);
    Drawable.disconnectAfter(this, display);
    this.dispose();
  }

  /**
   * Releases references
   * @public
   *
   * NOTE: Generally do not call this directly, use markForDisposal (so Display will dispose us), or disposeImmediately.
   *
   * @param {*} !this.isDisposed
   * @param {*} 'We should not re-dispose drawables'
   */
  dispose() {
    assert && assert(!this.isDisposed, 'We should not re-dispose drawables');
    sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`[${this.constructor.name}*] dispose ${this.toString()}`);
    sceneryLog && sceneryLog.Drawable && sceneryLog.push();
    this.clean();
    this.isDisposed = true;

    // for now
    this.freeToPool();
    sceneryLog && sceneryLog.Drawable && sceneryLog.pop();
  }

  /**
   * Runs checks on the drawable, based on certain flags.
   * @public
   *
   * @param {boolean} allowPendingBlock
   * @param {boolean} allowPendingList
   * @param {boolean} allowDirty
   */
  audit(allowPendingBlock, allowPendingList, allowDirty) {
    if (assertSlow) {
      assertSlow && assertSlow(!this.isDisposed, 'If we are being audited, we assume we are in the drawable display tree, and we should not be marked as disposed');
      assertSlow && assertSlow(this.renderer, 'Should not have a 0 (no) renderer');
      assertSlow && assertSlow(!this.backbone || this.parentDrawable, 'If we have a backbone reference, we must have a parentDrawable (our block)');
      if (!allowPendingBlock) {
        assertSlow && assertSlow(!this.pendingAddition);
        assertSlow && assertSlow(!this.pendingRemoval);
        assertSlow && assertSlow(this.parentDrawable === this.pendingParentDrawable, 'Assure our parent and pending parent match, if we have updated blocks');
        assertSlow && assertSlow(this.backbone === this.pendingBackbone, 'Assure our backbone and pending backbone match, if we have updated blocks');
      }
      if (!allowPendingList) {
        assertSlow && assertSlow(this.oldPreviousDrawable === this.previousDrawable, 'Pending linked-list references should be cleared by now');
        assertSlow && assertSlow(this.oldNextDrawable === this.nextDrawable, 'Pending linked-list references should be cleared by now');
        assertSlow && assertSlow(!this.linksDirty, 'Links dirty flag should be clean');
      }
      if (!allowDirty) {
        assertSlow && assertSlow(!this.dirty, 'Should not be dirty at this phase, if we are in the drawable display tree');
      }
    }
  }

  /**
   * Returns a string form of this object
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `${this.constructor.name}#${this.id}`;
  }

  /**
   * Returns a more-informative string form of this object.
   * @public
   *
   * @returns {string}
   */
  toDetailedString() {
    return this.toString();
  }

  /**
   * Connects the two drawables in the linked list, while cutting the previous connection and marking
   * @public
   *
   * @param {Drawable} a
   * @param {Drawable} b
   * @param {Display} display
   */
  static connectDrawables(a, b, display) {
    // we don't need to do anything if there is no change
    if (a.nextDrawable !== b) {
      // touch previous neighbors
      if (a.nextDrawable) {
        a.nextDrawable.markLinksDirty(display);
        a.nextDrawable.previousDrawable = null;
      }
      if (b.previousDrawable) {
        b.previousDrawable.markLinksDirty(display);
        b.previousDrawable.nextDrawable = null;
      }
      a.nextDrawable = b;
      b.previousDrawable = a;

      // mark these as needing updates
      a.markLinksDirty(display);
      b.markLinksDirty(display);
    }
  }

  /**
   * Disconnects the previous/before drawable from the provided one (for the linked list).
   * @public
   *
   * @param {Drawable} drawable
   * @param {Display} display
   */
  static disconnectBefore(drawable, display) {
    // we don't need to do anything if there is no change
    if (drawable.previousDrawable) {
      drawable.markLinksDirty(display);
      drawable.previousDrawable.markLinksDirty(display);
      drawable.previousDrawable.nextDrawable = null;
      drawable.previousDrawable = null;
    }
  }

  /**
   * Disconnects the next/after drawable from the provided one (for the linked list).
   * @public
   *
   * @param {Drawable} drawable
   * @param {Display} display
   */
  static disconnectAfter(drawable, display) {
    // we don't need to do anything if there is no change
    if (drawable.nextDrawable) {
      drawable.markLinksDirty(display);
      drawable.nextDrawable.markLinksDirty(display);
      drawable.nextDrawable.previousDrawable = null;
      drawable.nextDrawable = null;
    }
  }

  /**
   * Converts a linked list of drawables to an array (useful for debugging/assertion purposes, should not be used in
   * production code).
   * @public
   *
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   * @returns {Array.<Drawable>}
   */
  static listToArray(firstDrawable, lastDrawable) {
    const arr = [];

    // assumes we'll hit lastDrawable, otherwise we'll NPE
    for (let drawable = firstDrawable;; drawable = drawable.nextDrawable) {
      arr.push(drawable);
      if (drawable === lastDrawable) {
        break;
      }
    }
    return arr;
  }

  /**
   * Converts an old linked list of drawables to an array (useful for debugging/assertion purposes, should not be
   * used in production code)
   * @public
   *
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   * @returns {Array.<Drawable>}
   */
  static oldListToArray(firstDrawable, lastDrawable) {
    const arr = [];

    // assumes we'll hit lastDrawable, otherwise we'll NPE
    for (let drawable = firstDrawable;; drawable = drawable.oldNextDrawable) {
      arr.push(drawable);
      if (drawable === lastDrawable) {
        break;
      }
    }
    return arr;
  }
}
scenery.register('Drawable', Drawable);
export default Drawable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaW55UHJvcGVydHkiLCJCbG9jayIsIlJlbmRlcmVyIiwic2NlbmVyeSIsImdsb2JhbElkIiwiRHJhd2FibGUiLCJpbml0aWFsaXplIiwicmVuZGVyZXIiLCJhc3NlcnQiLCJpZCIsImlzRGlzcG9zZWQiLCJzY2VuZXJ5TG9nIiwiY29uc3RydWN0b3IiLCJuYW1lIiwidG9TdHJpbmciLCJjbGVhbiIsImRpcnR5IiwibGlua3NEaXJ0eSIsInZpc2libGVQcm9wZXJ0eSIsImZpdHRhYmxlUHJvcGVydHkiLCJwYXJlbnREcmF3YWJsZSIsImJhY2tib25lIiwicGVuZGluZ1BhcmVudERyYXdhYmxlIiwicGVuZGluZ0JhY2tib25lIiwicGVuZGluZ0FkZGl0aW9uIiwicGVuZGluZ1JlbW92YWwiLCJwcmV2aW91c0RyYXdhYmxlIiwibmV4dERyYXdhYmxlIiwib2xkUHJldmlvdXNEcmF3YWJsZSIsIm9sZE5leHREcmF3YWJsZSIsInJlbW92ZUFsbExpc3RlbmVycyIsInVwZGF0ZSIsIm5lZWRzRnVydGhlclVwZGF0ZXMiLCJzZXRWaXNpYmxlIiwidmlzaWJsZSIsInZhbHVlIiwiaXNWaXNpYmxlIiwic2V0Rml0dGFibGUiLCJmaXR0YWJsZSIsImlzRml0dGFibGUiLCJzZXRCbG9ja0JhY2tib25lIiwiYmFja2JvbmVJbnN0YW5jZSIsIm5vdGVQZW5kaW5nQWRkaXRpb24iLCJkaXNwbGF5IiwiYmxvY2siLCJ1bmRlZmluZWQiLCJtYXJrRHJhd2FibGVDaGFuZ2VkQmxvY2siLCJub3RlUGVuZGluZ1JlbW92YWwiLCJub3RlUGVuZGluZ01vdmUiLCJ1cGRhdGVCbG9jayIsInB1c2giLCJjaGFuZ2VkIiwicmVtb3ZlRHJhd2FibGUiLCJhZGREcmF3YWJsZSIsImlzQ2FudmFzIiwib25Qb3RlbnRpYWxseU1vdmVkRHJhd2FibGUiLCJwb3AiLCJ1cGRhdGVMaW5rcyIsIm1hcmtEaXJ0eSIsIm1hcmtEaXJ0eURyYXdhYmxlIiwibWFya0xpbmtzRGlydHkiLCJtYXJrRHJhd2FibGVGb3JMaW5rc1VwZGF0ZSIsIm1hcmtGb3JEaXNwb3NhbCIsImRpc2Nvbm5lY3RCZWZvcmUiLCJkaXNjb25uZWN0QWZ0ZXIiLCJtYXJrRHJhd2FibGVGb3JEaXNwb3NhbCIsImRpc3Bvc2VJbW1lZGlhdGVseSIsImRpc3Bvc2UiLCJmcmVlVG9Qb29sIiwiYXVkaXQiLCJhbGxvd1BlbmRpbmdCbG9jayIsImFsbG93UGVuZGluZ0xpc3QiLCJhbGxvd0RpcnR5IiwiYXNzZXJ0U2xvdyIsInRvRGV0YWlsZWRTdHJpbmciLCJjb25uZWN0RHJhd2FibGVzIiwiYSIsImIiLCJkcmF3YWJsZSIsImxpc3RUb0FycmF5IiwiZmlyc3REcmF3YWJsZSIsImxhc3REcmF3YWJsZSIsImFyciIsIm9sZExpc3RUb0FycmF5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEcmF3YWJsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTb21ldGhpbmcgdGhhdCBjYW4gYmUgZGlzcGxheWVkIHdpdGggYSBzcGVjaWZpYyByZW5kZXJlci5cclxuICogTk9URTogRHJhd2FibGVzIGFyZSBhc3N1bWVkIHRvIGJlIHBvb2xlZCB3aXRoIFBvb2xhYmxlTWl4aW4sIGFzIGZyZWVUb1Bvb2woKSBpcyBjYWxsZWQuXHJcbiAqXHJcbiAqIEEgZHJhd2FibGUncyBsaWZlLWN5Y2xlIHN0YXJ0cyB3aXRoIGl0cyBpbml0aWFsaXphdGlvbiAoY2FsbGluZyBpbml0aWFsaXplIG9uY2UpLCBhbmQgZW5kcyB3aXRoIGl0cyBkaXNwb3NhbFxyXG4gKiAod2hlcmUgaXQgaXMgZnJlZWQgdG8gaXRzIG93biBwb29sKS5cclxuICpcclxuICogRHJhd2FibGVzIGFyZSBwYXJ0IG9mIGFuIHVub3JkZXJlZCBkcmF3YWJsZSBcInRyZWVcIiB3aGVyZSBlYWNoIGRyYXdhYmxlIGNhbiBoYXZlIGEgcGFyZW50IHJlZmVyZW5jZXMuIFRoaXMgaXMgdXNlZFxyXG4gKiBmb3IsIGFtb25nIG90aGVyIHRoaW5ncywgcHJvcGFnYXRpb24gb2YgJ2RpcnR5JyBmbGFncyBhbmQgdXNhZ2UgZHVyaW5nIHN0aXRjaGluZy5cclxuICpcclxuICogQmxvY2tzIGFuZCBiYWNrYm9uZXMgKHN1Yi10eXBlcyBvZiBEcmF3YWJsZSkgY29udGFpbiBjaGlsZHJlbiAoY3JlYXRpbmcgYSB0cmVlLCBhbHRob3VnaCBzaGFyZWQgY2FjaGVzIG1ha2UgaXQgbW9yZVxyXG4gKiBsaWtlIGEgREFHKS4gT3VyIFNjZW5lcnkgRGlzcGxheSBpcyBidWlsdCBmcm9tIGEgcm9vdCBiYWNrYm9uZSwgdGhhdCBjb250YWlucyBibG9ja3MuIFRoaXMgY2FuIGJlIENhbnZhcy9TVkcsIGJ1dFxyXG4gKiBtYXkgYWxzbyBjb250YWluIGEgRE9NIGJsb2NrIHdpdGggYW5vdGhlciBiYWNrYm9uZSAodXNlZCBmb3Igb3BhY2l0eSwgQ1NTIHRyYW5zZm9ybXMsIGV0Yy4pLlxyXG4gKlxyXG4gKiBEcmF3YWJsZXMgYXJlIHBhcnQgb2YgdHdvIGluaGVyZW50IGxpbmtlZCBsaXN0czogYW4gXCJvbGRcIiBhbmQgYSBcIm5ld1wiIG9uZS4gVXN1YWxseSB0aGV5IGFyZSB0aGUgc2FtZSwgYnV0IGR1cmluZ1xyXG4gKiB1cGRhdGVzLCB0aGUgXCJuZXdcIiBsaW5rZWQgbGlzdCBpcyBjaGFuZ2VkIHRvIGFjY29tb2RhdGUgYW55IGNoYW5nZXMsIGFuZCB0aGVuIGEgc3RpdGNoIHByb2Nlc3MgaXMgZG9uZSB0byBtYXJrIHdoaWNoXHJcbiAqIGJsb2NrIChwYXJlbnQpIHdlIHdpbGwgYmVsb25nIHRvLlxyXG4gKlxyXG4gKiBBcyBwYXJ0IG9mIHN0aXRjaGluZyBvciBvdGhlciBwcm9jZXNzZXMsIGEgRHJhd2FibGUgaXMgcmVzcG9uc2libGUgZm9yIHJlY29yZGluZyBpdHMgcGVuZGluZyBzdGF0ZSBjaGFuZ2VzLiBNb3N0XHJcbiAqIG5vdGFibHksIHdlIG5lZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBkcmF3YWJsZSBpcyBiZWluZyBhZGRlZCwgbW92ZWQsIG9yIHJlbW92ZWQgaW4gdGhlIG5leHQgZnJhbWUuIFRoaXMgaXMgZG9uZVxyXG4gKiB3aXRoIGFuIGlkZW1wb3RlbnQgQVBJIHVzaW5nIG5vdGVQZW5kaW5nQWRkaXRpb24vbm90ZVBlbmRpbmdSZW1vdmFsL25vdGVQZW5kaW5nTW92ZS4gRWl0aGVyOlxyXG4gKiAgIC0gT25lIG9yIG1vcmUgbm90ZVBlbmRpbmdNb3ZlKCkgY2FsbHMgYXJlIG1hZGUuIFdoZW4gd2UgYXJlIHVwZGF0ZWQgd2l0aCB1cGRhdGVCbG9jaygpLCB3ZSB3aWxsIG1vdmUgdG8gdGhlXHJcbiAqICAgICBsYXN0IGJsb2NrIHJlZmVyZW5jZWQgd2l0aCBub3RlUGVuZGluZ01vdmUoKSAod2hpY2ggbWF5IGJlIGEgbm8tb3AgaWYgaXQgaXMgdGhlIHNhbWUgYmxvY2spLlxyXG4gKiAgIC0gWmVybyBvciBvbmUgbm90ZVBlbmRpbmdBZGRpdGlvbigpIGNhbGwgaXMgbWFkZSwgYW5kIHplcm8gb3Igb25lIG5vdGVQZW5kaW5nUmVtb3ZhbCgpIGNhbGwgaXMgbWFkZS4gT3VyIGFjdGlvbiBpczpcclxuICogICAgIC0gTm8gYWRkaXRpb24sIG5vIHJlbW92YWw6IG5vdGhpbmcgZG9uZVxyXG4gKiAgICAgLSBObyBhZGRpdGlvbiwgb25lIHJlbW92YWw6IFdlIGFyZSByZW1vdmVkIGZyb20gb3VyIGxhc3QgYmxvY2sgKGFuZCB0aGVuIHByZXN1bWFibHkgZGlzcG9zZWQgbGF0ZXIpXHJcbiAqICAgICAtIE9uZSBhZGRpdGlvbiwgbm8gcmVtb3ZhbDogV2UgYXJlIGFkZGVkIHRvIG91ciBuZXcgKHBlbmRpbmcpIGJsb2NrLCB3aXRob3V0IGJlaW5nIHJlbW92ZWQgZnJvbSBhbnl0aGluZ1xyXG4gKiAgICAgLSBPbmUgYWRkaXRpb24sIG9uZSByZW1vdmFsOiBXZSBhcmUgcmVtb3ZlZCBmcm9tIG91ciBsYXN0IGJsb2NrIGFuZCBhZGRlZCB0byBvdXIgbmV3IChwZW5kaW5nKSBibG9jay5cclxuICogSXQgaXMgc2V0IHVwIHNvIHRoYXQgdGhlIG9yZGVyIG9mIGFkZGl0aW9uL3JlbW92YWwgY2FsbHMgZG9lc24ndCBtYXR0ZXIsIHNpbmNlIHRoZXNlIGNhbiBvY2N1ciBmcm9tIHdpdGhpbiBkaWZmZXJlbnRcclxuICogYmFja2JvbmUgc3RpdGNoZXMgKHJlbW92ZWQgaW4gb25lLCBhZGRlZCBpbiBhbm90aGVyLCBvciB3aXRoIHRoZSBvcmRlciByZXZlcnNlZCkuIE91ciB1cGRhdGVCbG9ja3MoKSBpcyBndWFyYW50ZWVkXHJcbiAqIHRvIGJlIGNhbGxlZCBhZnRlciBhbGwgb2YgdGhvc2UgaGF2ZSBiZWVuIGNvbXBsZXRlZC5cclxuICpcclxuICogQVBJcyBmb3IgZHJhd2FibGUgdHlwZXM6XHJcbiAqXHJcbiAqIERPTToge1xyXG4gKiAgIGRvbUVsZW1lbnQ6IHtIVE1MRWxlbWVudH1cclxuICogfVxyXG4gKiBDYW52YXM6IHtcclxuICogICBwYWludENhbnZhczogZnVuY3Rpb24oIHtDYW52YXNDb250ZXh0V3JhcHBlcn0gd3JhcHBlciwge05vZGV9IG5vZGUsIHtNYXRyaXgzfSBtYXRyaXggKVxyXG4gKiB9XHJcbiAqIFNWRzoge1xyXG4gKiAgIHN2Z0VsZW1lbnQ6IHtTVkdFbGVtZW50fVxyXG4gKiB9XHJcbiAqIFdlYkdMOiB7XHJcbiAqICAgb25BZGRUb0Jsb2NrOiBmdW5jdGlvbigge1dlYkdMQmxvY2t9IGJsb2NrIClcclxuICogICBvblJlbW92ZUZyb21CbG9jazogZnVuY3Rpb24oIHtXZWJHTEJsb2NrfSBibG9jayApXHJcbiAqICAgcmVuZGVyOiBmdW5jdGlvbigge1NoYWRlclByb2dyYW19IHNoYWRlclByb2dyYW0gKVxyXG4gKiAgIHNoYWRlckF0dHJpYnV0ZXM6IHtzdHJpbmdbXX0gLSBuYW1lcyBvZiB2ZXJ0ZXggYXR0cmlidXRlcyB0byBiZSB1c2VkXHJcbiAqIH1cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBUaW55UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UaW55UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBCbG9jaywgUmVuZGVyZXIsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbmxldCBnbG9iYWxJZCA9IDE7XHJcblxyXG5jbGFzcyBEcmF3YWJsZSB7XHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyXHJcbiAgICogQHJldHVybnMge0RyYXdhYmxlfSAtIGZvciBjaGFpbmluZ1xyXG4gICAqL1xyXG4gIGluaXRpYWxpemUoIHJlbmRlcmVyICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlkIHx8IHRoaXMuaXNEaXNwb3NlZCwgJ0lmIHdlIHByZXZpb3VzbHkgZXhpc3RlZCwgd2UgbmVlZCB0byBoYXZlIGJlZW4gZGlzcG9zZWQnICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIHVuaXF1ZSBJRCBmb3IgZHJhd2FibGVzXHJcbiAgICB0aGlzLmlkID0gdGhpcy5pZCB8fCBnbG9iYWxJZCsrO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EcmF3YWJsZSAmJiBzY2VuZXJ5TG9nLkRyYXdhYmxlKCBgWyR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSpdIGluaXRpYWxpemUgJHt0aGlzLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIHRoaXMuY2xlYW4oKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gQml0bWFzayBkZWZpbmVkIGJ5IFJlbmRlcmVyLmpzXHJcbiAgICB0aGlzLnJlbmRlcmVyID0gcmVuZGVyZXI7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn1cclxuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufVxyXG4gICAgdGhpcy5pc0Rpc3Bvc2VkID0gZmFsc2U7XHJcbiAgICB0aGlzLmxpbmtzRGlydHkgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtUaW55UHJvcGVydHkuPGJvb2xlYW4+fVxyXG4gICAgdGhpcy52aXNpYmxlUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCB0cnVlICk7XHJcbiAgICB0aGlzLmZpdHRhYmxlUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCB0cnVlICk7IC8vIElmIGZhbHNlLCB3aWxsIGNhdXNlIG91ciBwYXJlbnQgYmxvY2sgdG8gbm90IGJlIGZpdHRlZFxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYW5zIHRoZSBzdGF0ZSBvZiB0aGlzIGRyYXdhYmxlIHRvIHRoZSBkZWZhdWx0cy5cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgY2xlYW4oKSB7XHJcbiAgICAvLyBAcHVibGljIHtEcmF3YWJsZXxudWxsfSAtIHdoYXQgZHJhd2FibGUgd2UgYXJlIGJlaW5nIHJlbmRlcmVkIChvciBwdXQpIGludG8gKHdpbGwgYmUgZmlsbGVkIGluIGxhdGVyKVxyXG4gICAgdGhpcy5wYXJlbnREcmF3YWJsZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QmFja2JvbmVEcmF3YWJsZXxudWxsfSAtIGEgYmFja2JvbmUgcmVmZXJlbmNlIChpZiBhcHBsaWNhYmxlKS5cclxuICAgIHRoaXMuYmFja2JvbmUgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0RyYXdhYmxlfG51bGx9IC0gd2hhdCBvdXIgcGFyZW50IGRyYXdhYmxlIHdpbGwgYmUgYWZ0ZXIgdGhlIHN0aXRjaCBpcyBmaW5pc2hlZFxyXG4gICAgdGhpcy5wZW5kaW5nUGFyZW50RHJhd2FibGUgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0JhY2tib25lRHJhd2FibGV8bnVsbH0gLSB3aGF0IG91ciBiYWNrYm9uZSB3aWxsIGJlIGFmdGVyIHRoZSBzdGl0Y2ggaXMgZmluaXNoZWQgKGlmIGFwcGxpY2FibGUpXHJcbiAgICB0aGlzLnBlbmRpbmdCYWNrYm9uZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn0gLSB3aGV0aGVyIHdlIGFyZSB0byBiZSBhZGRlZCB0byBhIGJsb2NrL2JhY2tib25lIGluIG91ciB1cGRhdGVCbG9jaygpIGNhbGxcclxuICAgIHRoaXMucGVuZGluZ0FkZGl0aW9uID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn0gLSB3aGV0aGVyIHdlIGFyZSB0byBiZSByZW1vdmVkIGZyb20gYSBibG9jay9iYWNrYm9uZSBpbiBvdXIgdXBkYXRlQmxvY2soKSBjYWxsXHJcbiAgICB0aGlzLnBlbmRpbmdSZW1vdmFsID0gZmFsc2U7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMucHJldmlvdXNEcmF3YWJsZSAmJiAhdGhpcy5uZXh0RHJhd2FibGUsXHJcbiAgICAgICdCeSBjbGVhbmluZyAoZGlzcG9zYWwgb3IgZnJlc2ggY3JlYXRpb24pLCB3ZSBzaG91bGQgaGF2ZSBkaXNjb25uZWN0ZWQgZnJvbSB0aGUgbGlua2VkIGxpc3QnICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RHJhd2FibGV8bnVsbH0gLSBMaW5rZWQgbGlzdCBoYW5kbGluZyAod2lsbCBiZSBmaWxsZWQgaW4gbGF0ZXIpXHJcbiAgICB0aGlzLnByZXZpb3VzRHJhd2FibGUgPSBudWxsO1xyXG4gICAgdGhpcy5uZXh0RHJhd2FibGUgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0RyYXdhYmxlfG51bGx9IC0gU2ltaWxhciB0byBwcmV2aW91c0RyYXdhYmxlL25leHREcmF3YWJsZSwgYnV0IHdpdGhvdXQgcmVjZW50IGNoYW5nZXMsIHNvIHRoYXQgd2UgY2FuXHJcbiAgICAvLyB0cmF2ZXJzZSBib3RoIG9yZGVycyBhdCB0aGUgc2FtZSB0aW1lIGZvciBzdGl0Y2hpbmcuXHJcbiAgICB0aGlzLm9sZFByZXZpb3VzRHJhd2FibGUgPSBudWxsO1xyXG4gICAgdGhpcy5vbGROZXh0RHJhd2FibGUgPSBudWxsO1xyXG5cclxuICAgIHRoaXMudmlzaWJsZVByb3BlcnR5ICYmIHRoaXMudmlzaWJsZVByb3BlcnR5LnJlbW92ZUFsbExpc3RlbmVycygpO1xyXG4gICAgdGhpcy5maXR0YWJsZVByb3BlcnR5ICYmIHRoaXMuZml0dGFibGVQcm9wZXJ0eS5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIERPTSBhcHBlYXJhbmNlIG9mIHRoaXMgZHJhd2FibGUgKHdoZXRoZXIgYnkgcHJlcGFyaW5nL2NhbGxpbmcgZHJhdyBjYWxscywgRE9NIGVsZW1lbnQgdXBkYXRlcywgZXRjLilcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBHZW5lcmFsbHkgbWVhbnQgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJ0eXBlcyAoYnV0IHNob3VsZCBzdGlsbCBjYWxsIHRoaXMgdG8gY2hlY2sgaWYgdGhleSBzaG91bGQgdXBkYXRlKS5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIFdoZXRoZXIgdGhlIHVwZGF0ZSBzaG91bGQgY29udGludWUgKGlmIGZhbHNlLCBmdXJ0aGVyIHVwZGF0ZXMgaW4gc3VwZXJ0eXBlIHN0ZXBzIHNob3VsZCBub3RcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICBiZSBkb25lKS5cclxuICAgKi9cclxuICB1cGRhdGUoKSB7XHJcbiAgICBsZXQgbmVlZHNGdXJ0aGVyVXBkYXRlcyA9IGZhbHNlO1xyXG5cclxuICAgIGlmICggdGhpcy5kaXJ0eSAmJiAhdGhpcy5pc0Rpc3Bvc2VkICkge1xyXG4gICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XHJcbiAgICAgIG5lZWRzRnVydGhlclVwZGF0ZXMgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZWVkc0Z1cnRoZXJVcGRhdGVzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB3aGV0aGVyIHRoZSBkcmF3YWJsZSBpcyB2aXNpYmxlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmlzaWJsZVxyXG4gICAqL1xyXG4gIHNldFZpc2libGUoIHZpc2libGUgKSB7XHJcbiAgICB0aGlzLnZpc2libGVQcm9wZXJ0eS52YWx1ZSA9IHZpc2libGU7XHJcbiAgfVxyXG5cclxuICBzZXQgdmlzaWJsZSggdmFsdWUgKSB7IHRoaXMuc2V0VmlzaWJsZSggdmFsdWUgKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGRyYXdhYmxlIGlzIHZpc2libGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNWaXNpYmxlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudmlzaWJsZVByb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHZpc2libGUoKSB7IHJldHVybiB0aGlzLmlzVmlzaWJsZSgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgd2hldGhlciB0aGlzIGRyYXdhYmxlIGlzIGZpdHRhYmxlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIE5PVEU6IFNob3VsZCBiZSBjYWxsZWQganVzdCBhZnRlciBpbml0aWFsaXphdGlvbiAoYmVmb3JlIGJlaW5nIGFkZGVkIHRvIGJsb2NrcykgaWYgd2UgYXJlbid0IGZpdHRhYmxlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBmaXR0YWJsZVxyXG4gICAqL1xyXG4gIHNldEZpdHRhYmxlKCBmaXR0YWJsZSApIHtcclxuICAgIHRoaXMuZml0dGFibGVQcm9wZXJ0eS52YWx1ZSA9IGZpdHRhYmxlO1xyXG4gIH1cclxuXHJcbiAgc2V0IGZpdHRhYmxlKCB2YWx1ZSApIHsgdGhpcy5zZXRGaXR0YWJsZSggdmFsdWUgKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGRyYXdhYmxlIGlzIGZpdHRhYmxlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzRml0dGFibGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5maXR0YWJsZVByb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGZpdHRhYmxlKCkgeyByZXR1cm4gdGhpcy5pc0ZpdHRhYmxlKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHRvIGFkZCBhIGJsb2NrICh1cykgYXMgYSBjaGlsZCBvZiBhIGJhY2tib25lXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCYWNrYm9uZURyYXdhYmxlfSBiYWNrYm9uZUluc3RhbmNlXHJcbiAgICovXHJcbiAgc2V0QmxvY2tCYWNrYm9uZSggYmFja2JvbmVJbnN0YW5jZSApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EcmF3YWJsZSAmJiBzY2VuZXJ5TG9nLkRyYXdhYmxlKCBgWyR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSpdIHNldEJsb2NrQmFja2JvbmUgJHtcclxuICAgICAgdGhpcy50b1N0cmluZygpfSB3aXRoICR7YmFja2JvbmVJbnN0YW5jZS50b1N0cmluZygpfWAgKTtcclxuXHJcbiAgICAvLyBpZiB0aGlzIGlzIGJlaW5nIGNhbGxlZCwgQmxvY2sgd2lsbCBiZSBndWFyYW50ZWVkIHRvIGJlIGxvYWRlZFxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcyBpbnN0YW5jZW9mIEJsb2NrICk7XHJcblxyXG4gICAgdGhpcy5wYXJlbnREcmF3YWJsZSA9IGJhY2tib25lSW5zdGFuY2U7XHJcbiAgICB0aGlzLmJhY2tib25lID0gYmFja2JvbmVJbnN0YW5jZTtcclxuICAgIHRoaXMucGVuZGluZ1BhcmVudERyYXdhYmxlID0gYmFja2JvbmVJbnN0YW5jZTtcclxuICAgIHRoaXMucGVuZGluZ0JhY2tib25lID0gYmFja2JvbmVJbnN0YW5jZTtcclxuICAgIHRoaXMucGVuZGluZ0FkZGl0aW9uID0gZmFsc2U7XHJcbiAgICB0aGlzLnBlbmRpbmdSZW1vdmFsID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBOb3RpZmllcyB0aGUgRGlzcGxheSBvZiBhIHBlbmRpbmcgYWRkaXRpb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XHJcbiAgICogQHBhcmFtIHtCbG9ja30gYmxvY2tcclxuICAgKiBAcGFyYW0ge0JhY2tib25lRHJhd2FibGV9IGJhY2tib25lXHJcbiAgICovXHJcbiAgbm90ZVBlbmRpbmdBZGRpdGlvbiggZGlzcGxheSwgYmxvY2ssIGJhY2tib25lICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRyYXdhYmxlICYmIHNjZW5lcnlMb2cuRHJhd2FibGUoIGBbJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9Kl0gbm90ZVBlbmRpbmdBZGRpdGlvbiAke1xyXG4gICAgICB0aGlzLnRvU3RyaW5nKCl9IHdpdGggJHtibG9jay50b1N0cmluZygpfSwgJHtcclxuICAgICAgYmFja2JvbmUgPyBiYWNrYm9uZS50b1N0cmluZygpIDogJy0nfWAgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBiYWNrYm9uZSAhPT0gdW5kZWZpbmVkLCAnYmFja2JvbmUgY2FuIGJlIGVpdGhlciBudWxsIG9yIGEgYmFja2JvbmUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBibG9jayBpbnN0YW5jZW9mIEJsb2NrICk7XHJcblxyXG4gICAgdGhpcy5wZW5kaW5nUGFyZW50RHJhd2FibGUgPSBibG9jaztcclxuICAgIHRoaXMucGVuZGluZ0JhY2tib25lID0gYmFja2JvbmU7XHJcbiAgICB0aGlzLnBlbmRpbmdBZGRpdGlvbiA9IHRydWU7XHJcblxyXG4gICAgLy8gaWYgd2Ugd2VyZW4ndCBhbHJlYWR5IG1hcmtlZCBmb3IgYW4gdXBkYXRlLCBtYXJrIHVzXHJcbiAgICBpZiAoICF0aGlzLnBlbmRpbmdSZW1vdmFsICkge1xyXG4gICAgICBkaXNwbGF5Lm1hcmtEcmF3YWJsZUNoYW5nZWRCbG9jayggdGhpcyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTm90aWZpZXMgdGhlIERpc3BsYXkgb2YgYSBwZW5kaW5nIHJlbW92YWwuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XHJcbiAgICovXHJcbiAgbm90ZVBlbmRpbmdSZW1vdmFsKCBkaXNwbGF5ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRyYXdhYmxlICYmIHNjZW5lcnlMb2cuRHJhd2FibGUoIGBbJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9Kl0gbm90ZVBlbmRpbmdSZW1vdmFsICR7XHJcbiAgICAgIHRoaXMudG9TdHJpbmcoKX1gICk7XHJcblxyXG4gICAgdGhpcy5wZW5kaW5nUmVtb3ZhbCA9IHRydWU7XHJcblxyXG4gICAgLy8gaWYgd2Ugd2VyZW4ndCBhbHJlYWR5IG1hcmtlZCBmb3IgYW4gdXBkYXRlLCBtYXJrIHVzXHJcbiAgICBpZiAoICF0aGlzLnBlbmRpbmdBZGRpdGlvbiApIHtcclxuICAgICAgZGlzcGxheS5tYXJrRHJhd2FibGVDaGFuZ2VkQmxvY2soIHRoaXMgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE5vdGlmaWVzIHRoZSBEaXNwbGF5IG9mIGEgcGVuZGluZyBtb3ZlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIE1vdmluZyBhIGRyYXdhYmxlIHRoYXQgaXNuJ3QgY2hhbmdpbmcgYmFja2JvbmVzLCBqdXN0IHBvdGVudGlhbGx5IGNoYW5naW5nIGl0cyBibG9jay5cclxuICAgKiBJdCBzaG91bGQgbm90IGhhdmUgbm90ZVBlbmRpbmdBZGRpdGlvbiBvciBub3RlUGVuZGluZ1JlbW92YWwgY2FsbGVkIG9uIGl0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XHJcbiAgICogQHBhcmFtIHtCbG9ja30gYmxvY2tcclxuICAgKi9cclxuICBub3RlUGVuZGluZ01vdmUoIGRpc3BsYXksIGJsb2NrICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRyYXdhYmxlICYmIHNjZW5lcnlMb2cuRHJhd2FibGUoIGBbJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9Kl0gbm90ZVBlbmRpbmdNb3ZlICR7XHJcbiAgICAgIHRoaXMudG9TdHJpbmcoKX0gd2l0aCAke2Jsb2NrLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJsb2NrIGluc3RhbmNlb2YgQmxvY2sgKTtcclxuXHJcbiAgICB0aGlzLnBlbmRpbmdQYXJlbnREcmF3YWJsZSA9IGJsb2NrO1xyXG5cclxuICAgIGlmICggIXRoaXMucGVuZGluZ1JlbW92YWwgfHwgIXRoaXMucGVuZGluZ0FkZGl0aW9uICkge1xyXG4gICAgICBkaXNwbGF5Lm1hcmtEcmF3YWJsZUNoYW5nZWRCbG9jayggdGhpcyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHNldCBib3RoIGZsYWdzLCBzaW5jZSB3ZSBuZWVkIGl0IHRvIGJlIHJlbW92ZWQgYW5kIGFkZGVkXHJcbiAgICB0aGlzLnBlbmRpbmdBZGRpdGlvbiA9IHRydWU7XHJcbiAgICB0aGlzLnBlbmRpbmdSZW1vdmFsID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIGJsb2NrLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIFdoZXRoZXIgd2UgY2hhbmdlZCBvdXIgYmxvY2tcclxuICAgKi9cclxuICB1cGRhdGVCbG9jaygpIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EcmF3YWJsZSAmJiBzY2VuZXJ5TG9nLkRyYXdhYmxlKCBgWyR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSpdIHVwZGF0ZUJsb2NrICR7dGhpcy50b1N0cmluZygpXHJcbiAgICB9IHdpdGggYWRkOiR7dGhpcy5wZW5kaW5nQWRkaXRpb25cclxuICAgIH0gcmVtb3ZlOiR7dGhpcy5wZW5kaW5nUmVtb3ZhbFxyXG4gICAgfSBvbGQ6JHt0aGlzLnBhcmVudERyYXdhYmxlID8gdGhpcy5wYXJlbnREcmF3YWJsZS50b1N0cmluZygpIDogJy0nXHJcbiAgICB9IG5ldzoke3RoaXMucGVuZGluZ1BhcmVudERyYXdhYmxlID8gdGhpcy5wZW5kaW5nUGFyZW50RHJhd2FibGUudG9TdHJpbmcoKSA6ICctJ31gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRHJhd2FibGUgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoIHRoaXMucGVuZGluZ1JlbW92YWwgfHwgdGhpcy5wZW5kaW5nQWRkaXRpb24gKSB7XHJcbiAgICAgIC8vIHdlIGFyZSBvbmx5IHVuY2hhbmdlZCBpZiB3ZSBoYXZlIGFuIGFkZGl0aW9uIEFORCByZW1vdmFsLCBhbmQgdGhlIGVuZHBvaW50cyBhcmUgaWRlbnRpY2FsXHJcbiAgICAgIGNoYW5nZWQgPSAhdGhpcy5wZW5kaW5nUmVtb3ZhbCB8fCAhdGhpcy5wZW5kaW5nQWRkaXRpb24gfHxcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50RHJhd2FibGUgIT09IHRoaXMucGVuZGluZ1BhcmVudERyYXdhYmxlIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJhY2tib25lICE9PSB0aGlzLnBlbmRpbmdCYWNrYm9uZTtcclxuXHJcbiAgICAgIGlmICggY2hhbmdlZCApIHtcclxuICAgICAgICBpZiAoIHRoaXMucGVuZGluZ1JlbW92YWwgKSB7XHJcbiAgICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRHJhd2FibGUgJiYgc2NlbmVyeUxvZy5EcmF3YWJsZSggYHJlbW92aW5nIGZyb20gJHt0aGlzLnBhcmVudERyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgICAgICAgdGhpcy5wYXJlbnREcmF3YWJsZS5yZW1vdmVEcmF3YWJsZSggdGhpcyApO1xyXG5cclxuICAgICAgICAgIC8vIHJlbW92ZSByZWZlcmVuY2VzIGlmIHdlIGFyZSBub3QgYmVpbmcgYWRkZWQgYmFjayBpblxyXG4gICAgICAgICAgaWYgKCAhdGhpcy5wZW5kaW5nQWRkaXRpb24gKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGVuZGluZ1BhcmVudERyYXdhYmxlID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5wZW5kaW5nQmFja2JvbmUgPSBudWxsO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wYXJlbnREcmF3YWJsZSA9IHRoaXMucGVuZGluZ1BhcmVudERyYXdhYmxlO1xyXG4gICAgICAgIHRoaXMuYmFja2JvbmUgPSB0aGlzLnBlbmRpbmdCYWNrYm9uZTtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLnBlbmRpbmdBZGRpdGlvbiApIHtcclxuICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EcmF3YWJsZSAmJiBzY2VuZXJ5TG9nLkRyYXdhYmxlKCBgYWRkaW5nIHRvICR7dGhpcy5wYXJlbnREcmF3YWJsZS50b1N0cmluZygpfWAgKTtcclxuICAgICAgICAgIHRoaXMucGFyZW50RHJhd2FibGUuYWRkRHJhd2FibGUoIHRoaXMgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRyYXdhYmxlICYmIHNjZW5lcnlMb2cuRHJhd2FibGUoICd1bmNoYW5nZWQnICk7XHJcblxyXG4gICAgICAgIGlmICggdGhpcy5wZW5kaW5nQWRkaXRpb24gJiYgUmVuZGVyZXIuaXNDYW52YXMoIHRoaXMucmVuZGVyZXIgKSApIHtcclxuICAgICAgICAgIHRoaXMucGFyZW50RHJhd2FibGUub25Qb3RlbnRpYWxseU1vdmVkRHJhd2FibGUoIHRoaXMgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMucGVuZGluZ0FkZGl0aW9uID0gZmFsc2U7XHJcbiAgICAgIHRoaXMucGVuZGluZ1JlbW92YWwgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRHJhd2FibGUgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuXHJcbiAgICByZXR1cm4gY2hhbmdlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmVzIHRoZSBvbGQtZHJhd2FibGUtbGlua2VkLWxpc3QgaW5mb3JtYXRpb24gaW50byB0aGUgY3VycmVudC1saW5rZWQtbGlzdC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdXBkYXRlTGlua3MoKSB7XHJcbiAgICB0aGlzLm9sZE5leHREcmF3YWJsZSA9IHRoaXMubmV4dERyYXdhYmxlO1xyXG4gICAgdGhpcy5vbGRQcmV2aW91c0RyYXdhYmxlID0gdGhpcy5wcmV2aW91c0RyYXdhYmxlO1xyXG4gICAgdGhpcy5saW5rc0RpcnR5ID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXJrcyB0aGlzIGFzIG5lZWRpbmcgYW4gdXBkYXRlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBtYXJrRGlydHkoKSB7XHJcbiAgICBpZiAoICF0aGlzLmRpcnR5ICkge1xyXG4gICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIFRPRE86IG5vdGlmeSB3aGF0IHdlIHdhbnQgdG8gY2FsbCByZXBhaW50KCkgbGF0ZXJcclxuICAgICAgaWYgKCB0aGlzLnBhcmVudERyYXdhYmxlICkge1xyXG4gICAgICAgIHRoaXMucGFyZW50RHJhd2FibGUubWFya0RpcnR5RHJhd2FibGUoIHRoaXMgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFya3Mgb3VyIGxpbmtlZCBsaXN0IGFzIGRpcnR5LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFdpbGwgZW5zdXJlIHRoYXQgYWZ0ZXIgc3luY1RyZWUgcGhhc2UgaXMgZG9uZSwgd2Ugd2lsbCBoYXZlIHVwZGF0ZUxpbmtzKCkgY2FsbGVkIG9uIHVzXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Rpc3BsYXl9IGRpc3BsYXlcclxuICAgKi9cclxuICBtYXJrTGlua3NEaXJ0eSggZGlzcGxheSApIHtcclxuICAgIGlmICggIXRoaXMubGlua3NEaXJ0eSApIHtcclxuICAgICAgdGhpcy5saW5rc0RpcnR5ID0gdHJ1ZTtcclxuICAgICAgZGlzcGxheS5tYXJrRHJhd2FibGVGb3JMaW5rc1VwZGF0ZSggdGhpcyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFya3MgdXMgZm9yIGRpc3Bvc2FsIGluIHRoZSBuZXh0IHBoYXNlIG9mIHVwZGF0ZURpc3BsYXkoKSwgYW5kIGRpc2Nvbm5lY3RzIGZyb20gdGhlIGxpbmtlZCBsaXN0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XHJcbiAgICovXHJcbiAgbWFya0ZvckRpc3Bvc2FsKCBkaXNwbGF5ICkge1xyXG4gICAgLy8gYXMgd2UgYXJlIG1hcmtlZCBmb3IgZGlzcG9zYWwsIHdlIGRpc2Nvbm5lY3QgZnJvbSB0aGUgbGlua2VkIGxpc3QgKHNvIG91ciBkaXNwb3NhbCBzZXR0aW5nIG51bGxzIHdvbid0IGNhdXNlIGlzc3VlcylcclxuICAgIERyYXdhYmxlLmRpc2Nvbm5lY3RCZWZvcmUoIHRoaXMsIGRpc3BsYXkgKTtcclxuICAgIERyYXdhYmxlLmRpc2Nvbm5lY3RBZnRlciggdGhpcywgZGlzcGxheSApO1xyXG5cclxuICAgIGRpc3BsYXkubWFya0RyYXdhYmxlRm9yRGlzcG9zYWwoIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc3Bvc2VzIGltbWVkaWF0ZWx5LCBhbmQgbWFrZXMgbm8gZ3VhcmFudGVlcyBhYm91dCBvdXQgbGlua2VkIGxpc3QncyBzdGF0ZSAoZGlzY29ubmVjdHMpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RGlzcGxheX0gZGlzcGxheVxyXG4gICAqL1xyXG4gIGRpc3Bvc2VJbW1lZGlhdGVseSggZGlzcGxheSApIHtcclxuICAgIC8vIGFzIHdlIGFyZSBtYXJrZWQgZm9yIGRpc3Bvc2FsLCB3ZSBkaXNjb25uZWN0IGZyb20gdGhlIGxpbmtlZCBsaXN0IChzbyBvdXIgZGlzcG9zYWwgc2V0dGluZyBudWxscyB3b24ndCBjYXVzZSBpc3N1ZXMpXHJcbiAgICBEcmF3YWJsZS5kaXNjb25uZWN0QmVmb3JlKCB0aGlzLCBkaXNwbGF5ICk7XHJcbiAgICBEcmF3YWJsZS5kaXNjb25uZWN0QWZ0ZXIoIHRoaXMsIGRpc3BsYXkgKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXNcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBOT1RFOiBHZW5lcmFsbHkgZG8gbm90IGNhbGwgdGhpcyBkaXJlY3RseSwgdXNlIG1hcmtGb3JEaXNwb3NhbCAoc28gRGlzcGxheSB3aWxsIGRpc3Bvc2UgdXMpLCBvciBkaXNwb3NlSW1tZWRpYXRlbHkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0geyp9ICF0aGlzLmlzRGlzcG9zZWRcclxuICAgKiBAcGFyYW0geyp9ICdXZSBzaG91bGQgbm90IHJlLWRpc3Bvc2UgZHJhd2FibGVzJ1xyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pc0Rpc3Bvc2VkLCAnV2Ugc2hvdWxkIG5vdCByZS1kaXNwb3NlIGRyYXdhYmxlcycgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRHJhd2FibGUgJiYgc2NlbmVyeUxvZy5EcmF3YWJsZSggYFske3RoaXMuY29uc3RydWN0b3IubmFtZX0qXSBkaXNwb3NlICR7dGhpcy50b1N0cmluZygpfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EcmF3YWJsZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICB0aGlzLmNsZWFuKCk7XHJcbiAgICB0aGlzLmlzRGlzcG9zZWQgPSB0cnVlO1xyXG5cclxuICAgIC8vIGZvciBub3dcclxuICAgIHRoaXMuZnJlZVRvUG9vbCgpO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EcmF3YWJsZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUnVucyBjaGVja3Mgb24gdGhlIGRyYXdhYmxlLCBiYXNlZCBvbiBjZXJ0YWluIGZsYWdzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYWxsb3dQZW5kaW5nQmxvY2tcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFsbG93UGVuZGluZ0xpc3RcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFsbG93RGlydHlcclxuICAgKi9cclxuICBhdWRpdCggYWxsb3dQZW5kaW5nQmxvY2ssIGFsbG93UGVuZGluZ0xpc3QsIGFsbG93RGlydHkgKSB7XHJcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XHJcbiAgICAgIGFzc2VydFNsb3cgJiYgYXNzZXJ0U2xvdyggIXRoaXMuaXNEaXNwb3NlZCxcclxuICAgICAgICAnSWYgd2UgYXJlIGJlaW5nIGF1ZGl0ZWQsIHdlIGFzc3VtZSB3ZSBhcmUgaW4gdGhlIGRyYXdhYmxlIGRpc3BsYXkgdHJlZSwgYW5kIHdlIHNob3VsZCBub3QgYmUgbWFya2VkIGFzIGRpc3Bvc2VkJyApO1xyXG4gICAgICBhc3NlcnRTbG93ICYmIGFzc2VydFNsb3coIHRoaXMucmVuZGVyZXIsICdTaG91bGQgbm90IGhhdmUgYSAwIChubykgcmVuZGVyZXInICk7XHJcblxyXG4gICAgICBhc3NlcnRTbG93ICYmIGFzc2VydFNsb3coICF0aGlzLmJhY2tib25lIHx8IHRoaXMucGFyZW50RHJhd2FibGUsXHJcbiAgICAgICAgJ0lmIHdlIGhhdmUgYSBiYWNrYm9uZSByZWZlcmVuY2UsIHdlIG11c3QgaGF2ZSBhIHBhcmVudERyYXdhYmxlIChvdXIgYmxvY2spJyApO1xyXG5cclxuICAgICAgaWYgKCAhYWxsb3dQZW5kaW5nQmxvY2sgKSB7XHJcbiAgICAgICAgYXNzZXJ0U2xvdyAmJiBhc3NlcnRTbG93KCAhdGhpcy5wZW5kaW5nQWRkaXRpb24gKTtcclxuICAgICAgICBhc3NlcnRTbG93ICYmIGFzc2VydFNsb3coICF0aGlzLnBlbmRpbmdSZW1vdmFsICk7XHJcbiAgICAgICAgYXNzZXJ0U2xvdyAmJiBhc3NlcnRTbG93KCB0aGlzLnBhcmVudERyYXdhYmxlID09PSB0aGlzLnBlbmRpbmdQYXJlbnREcmF3YWJsZSxcclxuICAgICAgICAgICdBc3N1cmUgb3VyIHBhcmVudCBhbmQgcGVuZGluZyBwYXJlbnQgbWF0Y2gsIGlmIHdlIGhhdmUgdXBkYXRlZCBibG9ja3MnICk7XHJcbiAgICAgICAgYXNzZXJ0U2xvdyAmJiBhc3NlcnRTbG93KCB0aGlzLmJhY2tib25lID09PSB0aGlzLnBlbmRpbmdCYWNrYm9uZSxcclxuICAgICAgICAgICdBc3N1cmUgb3VyIGJhY2tib25lIGFuZCBwZW5kaW5nIGJhY2tib25lIG1hdGNoLCBpZiB3ZSBoYXZlIHVwZGF0ZWQgYmxvY2tzJyApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoICFhbGxvd1BlbmRpbmdMaXN0ICkge1xyXG4gICAgICAgIGFzc2VydFNsb3cgJiYgYXNzZXJ0U2xvdyggdGhpcy5vbGRQcmV2aW91c0RyYXdhYmxlID09PSB0aGlzLnByZXZpb3VzRHJhd2FibGUsXHJcbiAgICAgICAgICAnUGVuZGluZyBsaW5rZWQtbGlzdCByZWZlcmVuY2VzIHNob3VsZCBiZSBjbGVhcmVkIGJ5IG5vdycgKTtcclxuICAgICAgICBhc3NlcnRTbG93ICYmIGFzc2VydFNsb3coIHRoaXMub2xkTmV4dERyYXdhYmxlID09PSB0aGlzLm5leHREcmF3YWJsZSxcclxuICAgICAgICAgICdQZW5kaW5nIGxpbmtlZC1saXN0IHJlZmVyZW5jZXMgc2hvdWxkIGJlIGNsZWFyZWQgYnkgbm93JyApO1xyXG4gICAgICAgIGFzc2VydFNsb3cgJiYgYXNzZXJ0U2xvdyggIXRoaXMubGlua3NEaXJ0eSwgJ0xpbmtzIGRpcnR5IGZsYWcgc2hvdWxkIGJlIGNsZWFuJyApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoICFhbGxvd0RpcnR5ICkge1xyXG4gICAgICAgIGFzc2VydFNsb3cgJiYgYXNzZXJ0U2xvdyggIXRoaXMuZGlydHksXHJcbiAgICAgICAgICAnU2hvdWxkIG5vdCBiZSBkaXJ0eSBhdCB0aGlzIHBoYXNlLCBpZiB3ZSBhcmUgaW4gdGhlIGRyYXdhYmxlIGRpc3BsYXkgdHJlZScgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHN0cmluZyBmb3JtIG9mIHRoaXMgb2JqZWN0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICB0b1N0cmluZygpIHtcclxuICAgIHJldHVybiBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IyR7dGhpcy5pZH1gO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG1vcmUtaW5mb3JtYXRpdmUgc3RyaW5nIGZvcm0gb2YgdGhpcyBvYmplY3QuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICB0b0RldGFpbGVkU3RyaW5nKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbm5lY3RzIHRoZSB0d28gZHJhd2FibGVzIGluIHRoZSBsaW5rZWQgbGlzdCwgd2hpbGUgY3V0dGluZyB0aGUgcHJldmlvdXMgY29ubmVjdGlvbiBhbmQgbWFya2luZ1xyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGFcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBiXHJcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XHJcbiAgICovXHJcbiAgc3RhdGljIGNvbm5lY3REcmF3YWJsZXMoIGEsIGIsIGRpc3BsYXkgKSB7XHJcbiAgICAvLyB3ZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nIGlmIHRoZXJlIGlzIG5vIGNoYW5nZVxyXG4gICAgaWYgKCBhLm5leHREcmF3YWJsZSAhPT0gYiApIHtcclxuICAgICAgLy8gdG91Y2ggcHJldmlvdXMgbmVpZ2hib3JzXHJcbiAgICAgIGlmICggYS5uZXh0RHJhd2FibGUgKSB7XHJcbiAgICAgICAgYS5uZXh0RHJhd2FibGUubWFya0xpbmtzRGlydHkoIGRpc3BsYXkgKTtcclxuICAgICAgICBhLm5leHREcmF3YWJsZS5wcmV2aW91c0RyYXdhYmxlID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGIucHJldmlvdXNEcmF3YWJsZSApIHtcclxuICAgICAgICBiLnByZXZpb3VzRHJhd2FibGUubWFya0xpbmtzRGlydHkoIGRpc3BsYXkgKTtcclxuICAgICAgICBiLnByZXZpb3VzRHJhd2FibGUubmV4dERyYXdhYmxlID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgYS5uZXh0RHJhd2FibGUgPSBiO1xyXG4gICAgICBiLnByZXZpb3VzRHJhd2FibGUgPSBhO1xyXG5cclxuICAgICAgLy8gbWFyayB0aGVzZSBhcyBuZWVkaW5nIHVwZGF0ZXNcclxuICAgICAgYS5tYXJrTGlua3NEaXJ0eSggZGlzcGxheSApO1xyXG4gICAgICBiLm1hcmtMaW5rc0RpcnR5KCBkaXNwbGF5ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNjb25uZWN0cyB0aGUgcHJldmlvdXMvYmVmb3JlIGRyYXdhYmxlIGZyb20gdGhlIHByb3ZpZGVkIG9uZSAoZm9yIHRoZSBsaW5rZWQgbGlzdCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcclxuICAgKiBAcGFyYW0ge0Rpc3BsYXl9IGRpc3BsYXlcclxuICAgKi9cclxuICBzdGF0aWMgZGlzY29ubmVjdEJlZm9yZSggZHJhd2FibGUsIGRpc3BsYXkgKSB7XHJcbiAgICAvLyB3ZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nIGlmIHRoZXJlIGlzIG5vIGNoYW5nZVxyXG4gICAgaWYgKCBkcmF3YWJsZS5wcmV2aW91c0RyYXdhYmxlICkge1xyXG4gICAgICBkcmF3YWJsZS5tYXJrTGlua3NEaXJ0eSggZGlzcGxheSApO1xyXG4gICAgICBkcmF3YWJsZS5wcmV2aW91c0RyYXdhYmxlLm1hcmtMaW5rc0RpcnR5KCBkaXNwbGF5ICk7XHJcbiAgICAgIGRyYXdhYmxlLnByZXZpb3VzRHJhd2FibGUubmV4dERyYXdhYmxlID0gbnVsbDtcclxuICAgICAgZHJhd2FibGUucHJldmlvdXNEcmF3YWJsZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNjb25uZWN0cyB0aGUgbmV4dC9hZnRlciBkcmF3YWJsZSBmcm9tIHRoZSBwcm92aWRlZCBvbmUgKGZvciB0aGUgbGlua2VkIGxpc3QpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXHJcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XHJcbiAgICovXHJcbiAgc3RhdGljIGRpc2Nvbm5lY3RBZnRlciggZHJhd2FibGUsIGRpc3BsYXkgKSB7XHJcbiAgICAvLyB3ZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nIGlmIHRoZXJlIGlzIG5vIGNoYW5nZVxyXG4gICAgaWYgKCBkcmF3YWJsZS5uZXh0RHJhd2FibGUgKSB7XHJcbiAgICAgIGRyYXdhYmxlLm1hcmtMaW5rc0RpcnR5KCBkaXNwbGF5ICk7XHJcbiAgICAgIGRyYXdhYmxlLm5leHREcmF3YWJsZS5tYXJrTGlua3NEaXJ0eSggZGlzcGxheSApO1xyXG4gICAgICBkcmF3YWJsZS5uZXh0RHJhd2FibGUucHJldmlvdXNEcmF3YWJsZSA9IG51bGw7XHJcbiAgICAgIGRyYXdhYmxlLm5leHREcmF3YWJsZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0cyBhIGxpbmtlZCBsaXN0IG9mIGRyYXdhYmxlcyB0byBhbiBhcnJheSAodXNlZnVsIGZvciBkZWJ1Z2dpbmcvYXNzZXJ0aW9uIHB1cnBvc2VzLCBzaG91bGQgbm90IGJlIHVzZWQgaW5cclxuICAgKiBwcm9kdWN0aW9uIGNvZGUpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGZpcnN0RHJhd2FibGVcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBsYXN0RHJhd2FibGVcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPERyYXdhYmxlPn1cclxuICAgKi9cclxuICBzdGF0aWMgbGlzdFRvQXJyYXkoIGZpcnN0RHJhd2FibGUsIGxhc3REcmF3YWJsZSApIHtcclxuICAgIGNvbnN0IGFyciA9IFtdO1xyXG5cclxuICAgIC8vIGFzc3VtZXMgd2UnbGwgaGl0IGxhc3REcmF3YWJsZSwgb3RoZXJ3aXNlIHdlJ2xsIE5QRVxyXG4gICAgZm9yICggbGV0IGRyYXdhYmxlID0gZmlyc3REcmF3YWJsZTsgOyBkcmF3YWJsZSA9IGRyYXdhYmxlLm5leHREcmF3YWJsZSApIHtcclxuICAgICAgYXJyLnB1c2goIGRyYXdhYmxlICk7XHJcblxyXG4gICAgICBpZiAoIGRyYXdhYmxlID09PSBsYXN0RHJhd2FibGUgKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYXJyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgYW4gb2xkIGxpbmtlZCBsaXN0IG9mIGRyYXdhYmxlcyB0byBhbiBhcnJheSAodXNlZnVsIGZvciBkZWJ1Z2dpbmcvYXNzZXJ0aW9uIHB1cnBvc2VzLCBzaG91bGQgbm90IGJlXHJcbiAgICogdXNlZCBpbiBwcm9kdWN0aW9uIGNvZGUpXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZmlyc3REcmF3YWJsZVxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGxhc3REcmF3YWJsZVxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48RHJhd2FibGU+fVxyXG4gICAqL1xyXG4gIHN0YXRpYyBvbGRMaXN0VG9BcnJheSggZmlyc3REcmF3YWJsZSwgbGFzdERyYXdhYmxlICkge1xyXG4gICAgY29uc3QgYXJyID0gW107XHJcblxyXG4gICAgLy8gYXNzdW1lcyB3ZSdsbCBoaXQgbGFzdERyYXdhYmxlLCBvdGhlcndpc2Ugd2UnbGwgTlBFXHJcbiAgICBmb3IgKCBsZXQgZHJhd2FibGUgPSBmaXJzdERyYXdhYmxlOyA7IGRyYXdhYmxlID0gZHJhd2FibGUub2xkTmV4dERyYXdhYmxlICkge1xyXG4gICAgICBhcnIucHVzaCggZHJhd2FibGUgKTtcclxuXHJcbiAgICAgIGlmICggZHJhd2FibGUgPT09IGxhc3REcmF3YWJsZSApIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhcnI7XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnRHJhd2FibGUnLCBEcmF3YWJsZSApO1xyXG5leHBvcnQgZGVmYXVsdCBEcmF3YWJsZTsiXSwibWFwcGluZ3Mi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