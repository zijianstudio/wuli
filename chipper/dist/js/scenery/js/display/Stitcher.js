// Copyright 2014-2022, University of Colorado Boulder

/**
 * Abstract base type (and API) for stitching implementations. Stitching is:
 * A method of updating the blocks for a backbone (the changes from the previous frame to the current frame), and
 * setting up the drawables to be attached/detached from blocks. At a high level:
 *   - We have an ordered list of blocks displayed in the last frame.
 *   - We have an ordered list of drawables displayed in the last frame (and what block they are part of).
 *   - We have an ordered list of drawables that will be displayed in the next frame (and whether they were part of our
 *     backbone, and if so what block they were in).
 *   - We need to efficiently create/dispose required blocks, add/remove drawables from blocks, notify blocks of their
 *     drawable range, and ensure blocks are displayed back-to-front.
 *
 * Since stitching usually only involves one or a few small changes (except for on sim initialization), the stitch
 * method is provided with a list of intervals that were (potentially) changed. This consists of a linked-list of
 * intervals (it is constructed during recursion through a tree that skips known-unchanged subtrees). The intervals
 * are completely disjoint (don't overlap, and aren't adjacent - there is at least one drawable that is unchanged
 * in-between change intervals).
 *
 * Assumes the same object instance will be reused multiple times, possibly for different backbones.
 *
 * Any stitcher implementations should always call initialize() first and clean() at the end, so that we can set up
 * and then clean up any object references (allowing them to be garbage-collected or pooled more safely).
 *
 * Stitcher responsibilities:
 *   1. Blocks used in the previous frame but not used in the current frame (no drawables, not attached) should be
 *      marked for disposal.
 *   2. Blocks should be created as necessary.
 *   3. If a changed drawable is removed from a block, it should have notePendingRemoval called on it.
 *   4. If a changed drawable is added to a block, it should have notePendingAddition called on it.
 *   5. If an unchanged drawable is to have a block change, it should have notePendingMove called on it.
 *   6. New blocks should be added to the DOM (appendChild presumably)
 *   7. Removed blocks should be removed from the DOM (removeChild)
 *      NOTE: check for child-parent relationship, since DOM blocks (wrappers) may have been
 *      added to the DOM elsewhere in another backbone's stitch already (which in the DOM
 *      automatically removes it from our backbone's div)
 *   8. If a block's first or last drawable changes, it should have notifyInterval called on it.
 *   9. At the end of the stitch, the backbone should have a way of iterating over its blocks in order (preferably an
 *      Array for fast repaint iteration)
 *   10. New blocks should have setBlockBackbone( backbone ) called on them
 *   11. Blocks with any drawable change should have backbone.markDirtyDrawable( block ) called so it can be visited
 *       in the repaint phase.
 *   12. Blocks should have z-indices set in the proper stacking order (back to front), using backbone.reindexBlocks()
 *       or equivalent (it tries to change as few z-indices as possible).
 *
 * Stitcher desired behavior and optimizations:
 *   1. Reuse blocks of the same renderer type, instead of removing one and creating another.
 *   2. Minimize (as much as is possible) how many drawables are added and removed from blocks (try not to remove 1000
 *      drawables from A and add them to B if we could instead just add/remove 5 drawables from C to D)
 *   3. No more DOM manipulation than necessary
 *   4. Optimize first for "one or a few small change intervals" that only cause local changes (no blocks created,
 *      removed or reordered). It would be ideal to do this very quickly, so it could be done every frame in
 *      simulations.
 *
 * Current constraints:
 *   1. DOM drawables should be paired with exactly one block (basically a wrapper, they are inserted directly into the
 *      DOM, and a DOM block should only ever be given the same drawable.
 *   2. Otherwise, consecutive drawables with the same renderer should be part of the same block. In the future we will
 *      want to allow "gaps" to form between (if something with a different renderer gets added and removed a lot
 *      in-between), but we'll need to figure out performance-sensitive flags to indicate when this needs to not be
 *      done (opacity and types of blending require no gaps between same-renderer drawables).
 *
 * Gluing: consequences of "no gaps"
 * There are two (important) implications:
 * Gluing
 *   If we have the following blocks:
 *     … A (SVG), B (Canvas), C (SVG) ...
 *   and all drawables for for B are removed, the following would be invalid ("has a gap"):
 *     … A (SVG), C (SVG) …
 *   so we need to glue them together, usually either resulting in:
 *     … A (SVG) …
 *   or
 *     … C (SVG) …
 *   with A or C including all of the drawables that were in A and C.
 *   More generally:
 *     If a change interval used to have its before/after (unchanged) drawables on two
 *     different blocks and for the current frame there will be no blocks in-between,
 *     we will need to "glue".
 *   Additionally, note the case:
 *     … A (SVG), B (Canvas), C (DOM), D (SVG), E (Canvas), F (SVG).
 *   If B,C,E are all removed, the results of A,D,F will have to all be combined into one layer
 * Un-gluing
 *   If we have the following drawables, all part of one block:
 *     … a (svg), b (svg) …
 *   and we insert a drawable with a different renderer:
 *     … a (svg), c (canvas), b (svg) ...
 *   we will need to split them into to SVG blocks
 *   More generally:
 *     If a change interval used to have its before/after (unchanged) drawables included
 *     in the same block, and the current frame requires a block to be inserted
 *     in-between, we will need to "un-glue".
 * These consequences mean that "unchanged" drawables (outside of change intervals) may need to have their block changed
 * (with notePendingMove). For performance, please consider which "end" should keep its drawables (the other end's
 * drawables will ALL have to be added/removed, which can be a major performance loss if we choose the wrong one).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import cleanArray from '../../../phet-core/js/cleanArray.js';
import { CanvasBlock, DOMBlock, Drawable, Renderer, scenery, SVGBlock, WebGLBlock } from '../imports.js';
class Stitcher {
  /**
   * Main stitch entry point, called directly from the backbone or cache. We are modifying our backbone's blocks and
   * their attached drawables.
   * @public
   *
   * The change-interval pair denotes a linked-list of change intervals that we will need to stitch across (they
   * contain drawables that need to be removed and added, and it may affect how we lay out blocks in the stacking
   * order).
   *
   * @param {BackboneDrawable} backbone
   * @param {Drawable|null} firstDrawable
   * @param {Drawable|null} lastDrawable
   * @param {Drawable|null} oldFirstDrawable
   * @param {Drawable|null} oldLastDrawable
   * @param {ChangeInterval} firstChangeInterval
   * @param {ChangeInterval} lastChangeInterval
   */
  initialize(backbone, firstDrawable, lastDrawable, oldFirstDrawable, oldLastDrawable, firstChangeInterval, lastChangeInterval) {
    assert && assert(firstChangeInterval && lastChangeInterval, 'We are guaranteed at least one change interval');
    assert && assert(!firstDrawable || firstDrawable.previousDrawable === null, 'End boundary of drawable linked list should link to null');
    assert && assert(!lastDrawable || lastDrawable.nextDrawable === null, 'End boundary of drawable linked list should link to null');
    if (sceneryLog && sceneryLog.Stitch) {
      sceneryLog.Stitch(`stitch ${backbone.toString()} first:${firstDrawable ? firstDrawable.toString() : 'null'} last:${lastDrawable ? lastDrawable.toString() : 'null'} oldFirst:${oldFirstDrawable ? oldFirstDrawable.toString() : 'null'} oldLast:${oldLastDrawable ? oldLastDrawable.toString() : 'null'}`);
      sceneryLog.push();
    }
    if (sceneryLog && sceneryLog.StitchDrawables) {
      sceneryLog.StitchDrawables('Before:');
      sceneryLog.push();
      Stitcher.debugDrawables(oldFirstDrawable, oldLastDrawable, firstChangeInterval, lastChangeInterval, false);
      sceneryLog.pop();
      sceneryLog.StitchDrawables('After:');
      sceneryLog.push();
      Stitcher.debugDrawables(firstDrawable, lastDrawable, firstChangeInterval, lastChangeInterval, true);
      sceneryLog.pop();
    }
    this.backbone = backbone;
    this.firstDrawable = firstDrawable;
    this.lastDrawable = lastDrawable;

    // list of blocks that have their pendingFirstDrawable or pendingLastDrawable set, and need updateInterval() called
    this.touchedBlocks = cleanArray(this.touchedBlocks);
    if (assertSlow) {
      assertSlow(!this.initialized, 'We should not be already initialized (clean should be called)');
      this.initialized = true;
      this.reindexed = false;
      this.pendingAdditions = [];
      this.pendingRemovals = [];
      this.pendingMoves = [];
      this.createdBlocks = [];
      this.disposedBlocks = [];
      this.intervalsNotified = [];
      this.boundariesRecorded = false;
      this.previousBlocks = backbone.blocks.slice(0); // copy of previous blocks
    }
  }

  /**
   * Removes object references
   * @public
   */
  clean() {
    sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch('clean');
    sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch('-----------------------------------');
    if (assertSlow) {
      this.auditStitch();
      this.initialized = false;
    }
    this.backbone = null;
    this.firstDrawable = null;
    this.lastDrawable = null;
    sceneryLog && sceneryLog.Stitch && sceneryLog.pop();
  }

  /**
   * Writes the first/last drawables for the entire backbone into its memory. We want to wait to do this until we have
   * read from its previous values.
   * @protected
   */
  recordBackboneBoundaries() {
    sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`recording backbone boundaries: ${this.firstDrawable ? this.firstDrawable.toString() : 'null'} to ${this.lastDrawable ? this.lastDrawable.toString() : 'null'}`);
    this.backbone.previousFirstDrawable = this.firstDrawable;
    this.backbone.previousLastDrawable = this.lastDrawable;
    if (assertSlow) {
      this.boundariesRecorded = true;
    }
  }

  /**
   * Records that this {Drawable} drawable should be added/moved to the {Block} at a later time
   * @protected
   *
   * @param {Drawable} drawable
   * @param {Block} block
   */
  notePendingAddition(drawable, block) {
    assert && assert(drawable.renderer === block.renderer);
    sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`pending add: ${drawable.toString()} to ${block.toString()}`);
    sceneryLog && sceneryLog.Stitch && sceneryLog.push();
    drawable.notePendingAddition(this.backbone.display, block, this.backbone);
    if (assertSlow) {
      this.pendingAdditions.push({
        drawable: drawable,
        block: block
      });
    }
    sceneryLog && sceneryLog.Stitch && sceneryLog.pop();
  }

  /**
   * Records that this {Drawable} drawable should be moved to the {Block} at a later time (called only on external
   * drawables). notePendingAddition and notePendingRemoval should not be called on a drawable that had
   * notePendingMove called on it during the same stitch, and vice versa.
   * @protected
   *
   * @param {Drawable} drawable
   * @param {Block} block
   */
  notePendingMove(drawable, block) {
    assert && assert(drawable.renderer === block.renderer);
    sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`pending move: ${drawable.toString()} to ${block.toString()}`);
    sceneryLog && sceneryLog.Stitch && sceneryLog.push();
    drawable.notePendingMove(this.backbone.display, block);
    if (assertSlow) {
      this.pendingMoves.push({
        drawable: drawable,
        block: block
      });
    }
    sceneryLog && sceneryLog.Stitch && sceneryLog.pop();
  }

  /**
   * Records that this {Drawable} drawable should be removed/moved from the {Block} at a later time
   * @protected
   *
   * @param {Drawable} drawable
   */
  notePendingRemoval(drawable) {
    sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`pending remove: ${drawable.toString()}`);
    sceneryLog && sceneryLog.Stitch && sceneryLog.push();
    drawable.notePendingRemoval(this.backbone.display);
    if (assertSlow) {
      this.pendingRemovals.push({
        drawable: drawable
      });
    }
    sceneryLog && sceneryLog.Stitch && sceneryLog.pop();
  }

  /**
   * Records that this {Block} block should be disposed at a later time. It should not be in the blocks array at the
   * end of the stitch.
   * @protected
   *
   * @param {Block} block
   */
  markBlockForDisposal(block) {
    sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`block for disposal: ${block.toString()}`);
    sceneryLog && sceneryLog.Stitch && sceneryLog.push();

    //TODO: PERFORMANCE: does this cause reflows / style calculation
    if (block.domElement.parentNode === this.backbone.domElement) {
      // guarded, since we may have a (new) child drawable add it before we can remove it
      this.backbone.domElement.removeChild(block.domElement);
    }
    block.markForDisposal(this.backbone.display);
    if (assertSlow) {
      this.disposedBlocks.push({
        block: block
      });
    }
    sceneryLog && sceneryLog.Stitch && sceneryLog.pop();
  }

  /**
   * @protected
   */
  removeAllBlocks() {
    sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`marking all blocks for disposal (count ${this.backbone.blocks.length})`);
    sceneryLog && sceneryLog.Stitch && sceneryLog.push();
    while (this.backbone.blocks.length) {
      const block = this.backbone.blocks[0];
      this.removeBlock(block);
      this.markBlockForDisposal(block);
    }
    sceneryLog && sceneryLog.Stitch && sceneryLog.pop();
  }

  /**
   * Immediately notify a block of its first/last drawable.
   * @protected
   *
   * @param {Block} block
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   */
  notifyInterval(block, firstDrawable, lastDrawable) {
    sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`notify interval: ${block.toString()} ${firstDrawable.toString()} to ${lastDrawable.toString()}`);
    sceneryLog && sceneryLog.Stitch && sceneryLog.push();
    block.notifyInterval(firstDrawable, lastDrawable);

    // mark it dirty, since its drawables probably changed?
    //OHTWO TODO: is this necessary? What is this doing?
    this.backbone.markDirtyDrawable(block);
    if (assertSlow) {
      this.intervalsNotified.push({
        block: block,
        firstDrawable: firstDrawable,
        lastDrawable: lastDrawable
      });
    }
    sceneryLog && sceneryLog.Stitch && sceneryLog.pop();
  }

  /**
   * Note a block's tentative first drawable and block before (should be flushed later with updateBlockIntervals())
   * @protected
   *
   * @param {Block} block
   * @param {Drawable} firstDrawable
   */
  markBeforeBlock(block, firstDrawable) {
    sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`marking block first drawable ${block.toString()} with ${firstDrawable.toString()}`);
    block.pendingFirstDrawable = firstDrawable;
    this.touchedBlocks.push(block);
  }

  /**
   * Note a block's tentative last drawable and block after (should be flushed later with updateBlockIntervals())
   * @protected
   *
   * @param {Block} block
   * @param {Drawable} lastDrawable
   */
  markAfterBlock(block, lastDrawable) {
    sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`marking block last drawable ${block.toString()} with ${lastDrawable.toString()}`);
    block.pendingLastDrawable = lastDrawable;
    this.touchedBlocks.push(block);
  }

  /**
   * Flushes markBeforeBlock/markAfterBlock changes to notifyInterval on blocks themselves.
   * @protected
   */
  updateBlockIntervals() {
    while (this.touchedBlocks.length) {
      const block = this.touchedBlocks.pop();
      if (block.used) {
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`update interval: ${block.toString()} ${block.pendingFirstDrawable.toString()} to ${block.pendingLastDrawable.toString()}`);
        block.updateInterval();

        // mark it dirty, since its drawables probably changed?
        //OHTWO TODO: is this necessary? What is this doing?
        this.backbone.markDirtyDrawable(block);
        if (assertSlow) {
          this.intervalsNotified.push({
            block: block,
            firstDrawable: block.pendingFirstDrawable,
            lastDrawable: block.pendingLastDrawable
          });
        }
      } else {
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`skipping update interval: ${block.toString()}, unused`);
      }
    }
  }

  /**
   * Creates a fresh block with the desired renderer and {Drawable} arbitrary drawable included, and adds it to
   * our DOM.
   * @protected
   *
   * @param {number} renderer
   * @param {Drawable} drawable
   * @returns {Block}
   */
  createBlock(renderer, drawable) {
    const backbone = this.backbone;
    let block;
    if (Renderer.isCanvas(renderer)) {
      block = CanvasBlock.createFromPool(backbone.display, renderer, backbone.transformRootInstance, backbone.backboneInstance);
    } else if (Renderer.isSVG(renderer)) {
      //OHTWO TODO: handle filter root separately from the backbone instance?
      block = SVGBlock.createFromPool(backbone.display, renderer, backbone.transformRootInstance, backbone.backboneInstance);
    } else if (Renderer.isDOM(renderer)) {
      block = DOMBlock.createFromPool(backbone.display, drawable);
    } else if (Renderer.isWebGL(renderer)) {
      block = WebGLBlock.createFromPool(backbone.display, renderer, backbone.transformRootInstance, backbone.backboneInstance);
    } else {
      throw new Error(`unsupported renderer for createBlock: ${renderer}`);
    }
    sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`created block: ${block.toString()} with renderer: ${renderer} for drawable: ${drawable.toString()}`);
    block.setBlockBackbone(backbone);

    //OHTWO TODO: minor speedup by appending only once its fragment is constructed? or use DocumentFragment?
    backbone.domElement.appendChild(block.domElement);

    // if backbone is a display root, hide all of its content from screen readers
    if (backbone.isDisplayRoot) {
      block.domElement.setAttribute('aria-hidden', true);
    }

    // mark it dirty for now, so we can check
    backbone.markDirtyDrawable(block);
    if (assertSlow) {
      this.createdBlocks.push({
        block: block,
        renderer: renderer,
        drawable: drawable
      });
    }
    return block;
  }

  /**
   * Immediately appends a block to our blocks array
   * @protected
   *
   * @param {Block} block
   */
  appendBlock(block) {
    sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`appending block: ${block.toString()}`);
    this.backbone.blocks.push(block);
    if (assertSlow) {
      this.reindexed = false;
    }
  }

  /**
   * Immediately removes a block to our blocks array
   * @protected
   *
   * @param {Block} block
   */
  removeBlock(block) {
    sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`removing block: ${block.toString()}`);

    // remove the block from our internal list
    const blockIndex = _.indexOf(this.backbone.blocks, block);
    assert && assert(blockIndex >= 0, `Cannot remove block, not attached: ${block.toString()}`);
    this.backbone.blocks.splice(blockIndex, 1);
    if (assertSlow) {
      this.reindexed = false;
    }
  }

  /**
   * @protected
   */
  useNoBlocks() {
    sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch('using no blocks');

    // i.e. we will not use any blocks
    cleanArray(this.backbone.blocks);
  }

  /**
   * Triggers all blocks in the blocks array to have their z-index properties set so that they visually stack
   * correctly.
   * @protected
   */
  reindex() {
    sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch('reindexing blocks');
    this.backbone.reindexBlocks();
    if (assertSlow) {
      this.reindexed = true;
    }
  }

  /**
   * An audit for testing assertions
   * @protected
   */
  auditStitch() {
    if (assertSlow) {
      const blocks = this.backbone.blocks;
      const previousBlocks = this.previousBlocks;
      assertSlow(this.initialized, 'We seem to have finished a stitch without proper initialization');
      assertSlow(this.boundariesRecorded, 'Our stitch API requires recordBackboneBoundaries() to be called before' + ' it is finished.');

      // ensure our indices are up-to-date (reindexed, or did not change)
      assertSlow(this.reindexed || blocks.length === 0 ||
      // array equality of previousBlocks and blocks
      previousBlocks.length === blocks.length && _.every(_.zip(previousBlocks, blocks), arr => arr[0] === arr[1]), 'Did not reindex on a block change where we are left with blocks');

      // all created blocks had intervals notified
      _.each(this.createdBlocks, blockData => {
        assertSlow(_.some(this.intervalsNotified, intervalData => blockData.block === intervalData.block), `Created block does not seem to have an interval notified: ${blockData.block.toString()}`);
      });

      // no disposed blocks had intervals notified
      _.each(this.disposedBlocks, blockData => {
        assertSlow(!_.some(this.intervalsNotified, intervalData => blockData.block === intervalData.block), `Removed block seems to have an interval notified: ${blockData.block.toString()}`);
      });

      // all drawables for disposed blocks have been marked as pending removal (or moved)
      _.each(this.disposedBlocks, blockData => {
        const block = blockData.block;
        _.each(Drawable.oldListToArray(block.firstDrawable, block.lastDrawable), drawable => {
          assertSlow(_.some(this.pendingRemovals, removalData => removalData.drawable === drawable) || _.some(this.pendingMoves, moveData => moveData.drawable === drawable), `Drawable ${drawable.toString()} originally listed for disposed block ${block.toString()} does not seem to be marked for pending removal or move!`);
        });
      });

      // all drawables for created blocks have been marked as pending addition or moved for our block
      _.each(this.createdBlocks, blockData => {
        const block = blockData.block;
        _.each(Drawable.listToArray(block.pendingFirstDrawable, block.pendingLastDrawable), drawable => {
          assertSlow(_.some(this.pendingAdditions, additionData => additionData.drawable === drawable && additionData.block === block) || _.some(this.pendingMoves, moveData => moveData.drawable === drawable && moveData.block === block), `Drawable ${drawable.toString()} now listed for created block ${block.toString()} does not seem to be marked for pending addition or move!`);
        });
      });

      // all disposed blocks should have been removed
      _.each(this.disposedBlocks, blockData => {
        const blockIdx = _.indexOf(blocks, blockData.block);
        assertSlow(blockIdx < 0, `Disposed block ${blockData.block.toString()} still present at index ${blockIdx}`);
      });

      // all created blocks should have been added
      _.each(this.createdBlocks, blockData => {
        const blockIdx = _.indexOf(blocks, blockData.block);
        assertSlow(blockIdx >= 0, `Created block ${blockData.block.toString()} is not in the blocks array`);
      });

      // all current blocks should be marked as used
      _.each(blocks, block => {
        assertSlow(block.used, 'All current blocks should be marked as used');
      });
      assertSlow(blocks.length - previousBlocks.length === this.createdBlocks.length - this.disposedBlocks.length, `${'The count of unmodified blocks should be constant (equal differences):\n' + 'created: '}${_.map(this.createdBlocks, n => n.block.id).join(',')}\n` + `disposed: ${_.map(this.disposedBlocks, n => n.block.id).join(',')}\n` + `before: ${_.map(previousBlocks, n => n.id).join(',')}\n` + `after: ${_.map(blocks, n => n.id).join(',')}`);
      assertSlow(this.touchedBlocks.length === 0, 'If we marked any blocks for changes, we should have called updateBlockIntervals');
      if (blocks.length) {
        assertSlow(this.backbone.previousFirstDrawable !== null && this.backbone.previousLastDrawable !== null, 'If we are left with at least one block, we must be tracking at least one drawable');
        assertSlow(blocks[0].pendingFirstDrawable === this.backbone.previousFirstDrawable, 'Our first drawable should match the first drawable of our first block');
        assertSlow(blocks[blocks.length - 1].pendingLastDrawable === this.backbone.previousLastDrawable, 'Our last drawable should match the last drawable of our last block');
        for (let i = 0; i < blocks.length - 1; i++) {
          // [i] and [i+1] are a pair of consecutive blocks
          assertSlow(blocks[i].pendingLastDrawable.nextDrawable === blocks[i + 1].pendingFirstDrawable && blocks[i].pendingLastDrawable === blocks[i + 1].pendingFirstDrawable.previousDrawable, 'Consecutive blocks should have boundary drawables that are also consecutive in the linked list');
        }
      } else {
        assertSlow(this.backbone.previousFirstDrawable === null && this.backbone.previousLastDrawable === null, 'If we are left with no blocks, it must mean we are tracking precisely zero drawables');
      }
    }
  }

  /**
   * @public
   *
   * @param {ChangeInterval} firstChangeInterval
   */
  static debugIntervals(firstChangeInterval) {
    if (sceneryLog && sceneryLog.Stitch) {
      for (let debugInterval = firstChangeInterval; debugInterval !== null; debugInterval = debugInterval.nextChangeInterval) {
        sceneryLog.Stitch(`  interval: ${debugInterval.isEmpty() ? '(empty) ' : ''}${debugInterval.drawableBefore ? debugInterval.drawableBefore.toString() : '-'} to ${debugInterval.drawableAfter ? debugInterval.drawableAfter.toString() : '-'}`);
      }
    }
  }

  /**
   * Logs a bunch of information about the old (useCurrent===false) or new (useCurrent===true) drawable linked list.
   * @public
   *
   * @param {Drawable|null} firstDrawable
   * @param {Drawable|null} lastDrawable
   * @param {ChangeInterval} firstChangeInterval
   * @param {ChangeInterval} lastChangeInterval
   * @param {boolean} useCurrent
   */
  static debugDrawables(firstDrawable, lastDrawable, firstChangeInterval, lastChangeInterval, useCurrent) {
    if (sceneryLog && sceneryLog.StitchDrawables) {
      if (firstDrawable === null) {
        sceneryLog.StitchDrawables('nothing', 'color: #666;');
        return;
      }
      let isChanged = firstChangeInterval.drawableBefore === null;
      let currentInterval = firstChangeInterval;
      for (let drawable = firstDrawable;; drawable = useCurrent ? drawable.nextDrawable : drawable.oldNextDrawable) {
        if (isChanged && drawable === currentInterval.drawableAfter) {
          isChanged = false;
          currentInterval = currentInterval.nextChangeInterval;
        }
        const drawableString = `${drawable.renderer} ${!useCurrent && drawable.parentDrawable ? drawable.parentDrawable.toString() : ''} ${drawable.toDetailedString()}`;
        sceneryLog.StitchDrawables(drawableString, isChanged ? useCurrent ? 'color: #0a0;' : 'color: #a00;' : 'color: #666');
        if (!isChanged && currentInterval && currentInterval.drawableBefore === drawable) {
          isChanged = true;
        }
        if (drawable === lastDrawable) {
          break;
        }
      }
    }
  }
}
scenery.register('Stitcher', Stitcher);
export default Stitcher;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjbGVhbkFycmF5IiwiQ2FudmFzQmxvY2siLCJET01CbG9jayIsIkRyYXdhYmxlIiwiUmVuZGVyZXIiLCJzY2VuZXJ5IiwiU1ZHQmxvY2siLCJXZWJHTEJsb2NrIiwiU3RpdGNoZXIiLCJpbml0aWFsaXplIiwiYmFja2JvbmUiLCJmaXJzdERyYXdhYmxlIiwibGFzdERyYXdhYmxlIiwib2xkRmlyc3REcmF3YWJsZSIsIm9sZExhc3REcmF3YWJsZSIsImZpcnN0Q2hhbmdlSW50ZXJ2YWwiLCJsYXN0Q2hhbmdlSW50ZXJ2YWwiLCJhc3NlcnQiLCJwcmV2aW91c0RyYXdhYmxlIiwibmV4dERyYXdhYmxlIiwic2NlbmVyeUxvZyIsIlN0aXRjaCIsInRvU3RyaW5nIiwicHVzaCIsIlN0aXRjaERyYXdhYmxlcyIsImRlYnVnRHJhd2FibGVzIiwicG9wIiwidG91Y2hlZEJsb2NrcyIsImFzc2VydFNsb3ciLCJpbml0aWFsaXplZCIsInJlaW5kZXhlZCIsInBlbmRpbmdBZGRpdGlvbnMiLCJwZW5kaW5nUmVtb3ZhbHMiLCJwZW5kaW5nTW92ZXMiLCJjcmVhdGVkQmxvY2tzIiwiZGlzcG9zZWRCbG9ja3MiLCJpbnRlcnZhbHNOb3RpZmllZCIsImJvdW5kYXJpZXNSZWNvcmRlZCIsInByZXZpb3VzQmxvY2tzIiwiYmxvY2tzIiwic2xpY2UiLCJjbGVhbiIsImF1ZGl0U3RpdGNoIiwicmVjb3JkQmFja2JvbmVCb3VuZGFyaWVzIiwicHJldmlvdXNGaXJzdERyYXdhYmxlIiwicHJldmlvdXNMYXN0RHJhd2FibGUiLCJub3RlUGVuZGluZ0FkZGl0aW9uIiwiZHJhd2FibGUiLCJibG9jayIsInJlbmRlcmVyIiwiZGlzcGxheSIsIm5vdGVQZW5kaW5nTW92ZSIsIm5vdGVQZW5kaW5nUmVtb3ZhbCIsIm1hcmtCbG9ja0ZvckRpc3Bvc2FsIiwiZG9tRWxlbWVudCIsInBhcmVudE5vZGUiLCJyZW1vdmVDaGlsZCIsIm1hcmtGb3JEaXNwb3NhbCIsInJlbW92ZUFsbEJsb2NrcyIsImxlbmd0aCIsInJlbW92ZUJsb2NrIiwibm90aWZ5SW50ZXJ2YWwiLCJtYXJrRGlydHlEcmF3YWJsZSIsIm1hcmtCZWZvcmVCbG9jayIsInBlbmRpbmdGaXJzdERyYXdhYmxlIiwibWFya0FmdGVyQmxvY2siLCJwZW5kaW5nTGFzdERyYXdhYmxlIiwidXBkYXRlQmxvY2tJbnRlcnZhbHMiLCJ1c2VkIiwidXBkYXRlSW50ZXJ2YWwiLCJjcmVhdGVCbG9jayIsImlzQ2FudmFzIiwiY3JlYXRlRnJvbVBvb2wiLCJ0cmFuc2Zvcm1Sb290SW5zdGFuY2UiLCJiYWNrYm9uZUluc3RhbmNlIiwiaXNTVkciLCJpc0RPTSIsImlzV2ViR0wiLCJFcnJvciIsInNldEJsb2NrQmFja2JvbmUiLCJhcHBlbmRDaGlsZCIsImlzRGlzcGxheVJvb3QiLCJzZXRBdHRyaWJ1dGUiLCJhcHBlbmRCbG9jayIsImJsb2NrSW5kZXgiLCJfIiwiaW5kZXhPZiIsInNwbGljZSIsInVzZU5vQmxvY2tzIiwicmVpbmRleCIsInJlaW5kZXhCbG9ja3MiLCJldmVyeSIsInppcCIsImFyciIsImVhY2giLCJibG9ja0RhdGEiLCJzb21lIiwiaW50ZXJ2YWxEYXRhIiwib2xkTGlzdFRvQXJyYXkiLCJyZW1vdmFsRGF0YSIsIm1vdmVEYXRhIiwibGlzdFRvQXJyYXkiLCJhZGRpdGlvbkRhdGEiLCJibG9ja0lkeCIsIm1hcCIsIm4iLCJpZCIsImpvaW4iLCJpIiwiZGVidWdJbnRlcnZhbHMiLCJkZWJ1Z0ludGVydmFsIiwibmV4dENoYW5nZUludGVydmFsIiwiaXNFbXB0eSIsImRyYXdhYmxlQmVmb3JlIiwiZHJhd2FibGVBZnRlciIsInVzZUN1cnJlbnQiLCJpc0NoYW5nZWQiLCJjdXJyZW50SW50ZXJ2YWwiLCJvbGROZXh0RHJhd2FibGUiLCJkcmF3YWJsZVN0cmluZyIsInBhcmVudERyYXdhYmxlIiwidG9EZXRhaWxlZFN0cmluZyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3RpdGNoZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5cclxuLyoqXHJcbiAqIEFic3RyYWN0IGJhc2UgdHlwZSAoYW5kIEFQSSkgZm9yIHN0aXRjaGluZyBpbXBsZW1lbnRhdGlvbnMuIFN0aXRjaGluZyBpczpcclxuICogQSBtZXRob2Qgb2YgdXBkYXRpbmcgdGhlIGJsb2NrcyBmb3IgYSBiYWNrYm9uZSAodGhlIGNoYW5nZXMgZnJvbSB0aGUgcHJldmlvdXMgZnJhbWUgdG8gdGhlIGN1cnJlbnQgZnJhbWUpLCBhbmRcclxuICogc2V0dGluZyB1cCB0aGUgZHJhd2FibGVzIHRvIGJlIGF0dGFjaGVkL2RldGFjaGVkIGZyb20gYmxvY2tzLiBBdCBhIGhpZ2ggbGV2ZWw6XHJcbiAqICAgLSBXZSBoYXZlIGFuIG9yZGVyZWQgbGlzdCBvZiBibG9ja3MgZGlzcGxheWVkIGluIHRoZSBsYXN0IGZyYW1lLlxyXG4gKiAgIC0gV2UgaGF2ZSBhbiBvcmRlcmVkIGxpc3Qgb2YgZHJhd2FibGVzIGRpc3BsYXllZCBpbiB0aGUgbGFzdCBmcmFtZSAoYW5kIHdoYXQgYmxvY2sgdGhleSBhcmUgcGFydCBvZikuXHJcbiAqICAgLSBXZSBoYXZlIGFuIG9yZGVyZWQgbGlzdCBvZiBkcmF3YWJsZXMgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgbmV4dCBmcmFtZSAoYW5kIHdoZXRoZXIgdGhleSB3ZXJlIHBhcnQgb2Ygb3VyXHJcbiAqICAgICBiYWNrYm9uZSwgYW5kIGlmIHNvIHdoYXQgYmxvY2sgdGhleSB3ZXJlIGluKS5cclxuICogICAtIFdlIG5lZWQgdG8gZWZmaWNpZW50bHkgY3JlYXRlL2Rpc3Bvc2UgcmVxdWlyZWQgYmxvY2tzLCBhZGQvcmVtb3ZlIGRyYXdhYmxlcyBmcm9tIGJsb2Nrcywgbm90aWZ5IGJsb2NrcyBvZiB0aGVpclxyXG4gKiAgICAgZHJhd2FibGUgcmFuZ2UsIGFuZCBlbnN1cmUgYmxvY2tzIGFyZSBkaXNwbGF5ZWQgYmFjay10by1mcm9udC5cclxuICpcclxuICogU2luY2Ugc3RpdGNoaW5nIHVzdWFsbHkgb25seSBpbnZvbHZlcyBvbmUgb3IgYSBmZXcgc21hbGwgY2hhbmdlcyAoZXhjZXB0IGZvciBvbiBzaW0gaW5pdGlhbGl6YXRpb24pLCB0aGUgc3RpdGNoXHJcbiAqIG1ldGhvZCBpcyBwcm92aWRlZCB3aXRoIGEgbGlzdCBvZiBpbnRlcnZhbHMgdGhhdCB3ZXJlIChwb3RlbnRpYWxseSkgY2hhbmdlZC4gVGhpcyBjb25zaXN0cyBvZiBhIGxpbmtlZC1saXN0IG9mXHJcbiAqIGludGVydmFscyAoaXQgaXMgY29uc3RydWN0ZWQgZHVyaW5nIHJlY3Vyc2lvbiB0aHJvdWdoIGEgdHJlZSB0aGF0IHNraXBzIGtub3duLXVuY2hhbmdlZCBzdWJ0cmVlcykuIFRoZSBpbnRlcnZhbHNcclxuICogYXJlIGNvbXBsZXRlbHkgZGlzam9pbnQgKGRvbid0IG92ZXJsYXAsIGFuZCBhcmVuJ3QgYWRqYWNlbnQgLSB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgZHJhd2FibGUgdGhhdCBpcyB1bmNoYW5nZWRcclxuICogaW4tYmV0d2VlbiBjaGFuZ2UgaW50ZXJ2YWxzKS5cclxuICpcclxuICogQXNzdW1lcyB0aGUgc2FtZSBvYmplY3QgaW5zdGFuY2Ugd2lsbCBiZSByZXVzZWQgbXVsdGlwbGUgdGltZXMsIHBvc3NpYmx5IGZvciBkaWZmZXJlbnQgYmFja2JvbmVzLlxyXG4gKlxyXG4gKiBBbnkgc3RpdGNoZXIgaW1wbGVtZW50YXRpb25zIHNob3VsZCBhbHdheXMgY2FsbCBpbml0aWFsaXplKCkgZmlyc3QgYW5kIGNsZWFuKCkgYXQgdGhlIGVuZCwgc28gdGhhdCB3ZSBjYW4gc2V0IHVwXHJcbiAqIGFuZCB0aGVuIGNsZWFuIHVwIGFueSBvYmplY3QgcmVmZXJlbmNlcyAoYWxsb3dpbmcgdGhlbSB0byBiZSBnYXJiYWdlLWNvbGxlY3RlZCBvciBwb29sZWQgbW9yZSBzYWZlbHkpLlxyXG4gKlxyXG4gKiBTdGl0Y2hlciByZXNwb25zaWJpbGl0aWVzOlxyXG4gKiAgIDEuIEJsb2NrcyB1c2VkIGluIHRoZSBwcmV2aW91cyBmcmFtZSBidXQgbm90IHVzZWQgaW4gdGhlIGN1cnJlbnQgZnJhbWUgKG5vIGRyYXdhYmxlcywgbm90IGF0dGFjaGVkKSBzaG91bGQgYmVcclxuICogICAgICBtYXJrZWQgZm9yIGRpc3Bvc2FsLlxyXG4gKiAgIDIuIEJsb2NrcyBzaG91bGQgYmUgY3JlYXRlZCBhcyBuZWNlc3NhcnkuXHJcbiAqICAgMy4gSWYgYSBjaGFuZ2VkIGRyYXdhYmxlIGlzIHJlbW92ZWQgZnJvbSBhIGJsb2NrLCBpdCBzaG91bGQgaGF2ZSBub3RlUGVuZGluZ1JlbW92YWwgY2FsbGVkIG9uIGl0LlxyXG4gKiAgIDQuIElmIGEgY2hhbmdlZCBkcmF3YWJsZSBpcyBhZGRlZCB0byBhIGJsb2NrLCBpdCBzaG91bGQgaGF2ZSBub3RlUGVuZGluZ0FkZGl0aW9uIGNhbGxlZCBvbiBpdC5cclxuICogICA1LiBJZiBhbiB1bmNoYW5nZWQgZHJhd2FibGUgaXMgdG8gaGF2ZSBhIGJsb2NrIGNoYW5nZSwgaXQgc2hvdWxkIGhhdmUgbm90ZVBlbmRpbmdNb3ZlIGNhbGxlZCBvbiBpdC5cclxuICogICA2LiBOZXcgYmxvY2tzIHNob3VsZCBiZSBhZGRlZCB0byB0aGUgRE9NIChhcHBlbmRDaGlsZCBwcmVzdW1hYmx5KVxyXG4gKiAgIDcuIFJlbW92ZWQgYmxvY2tzIHNob3VsZCBiZSByZW1vdmVkIGZyb20gdGhlIERPTSAocmVtb3ZlQ2hpbGQpXHJcbiAqICAgICAgTk9URTogY2hlY2sgZm9yIGNoaWxkLXBhcmVudCByZWxhdGlvbnNoaXAsIHNpbmNlIERPTSBibG9ja3MgKHdyYXBwZXJzKSBtYXkgaGF2ZSBiZWVuXHJcbiAqICAgICAgYWRkZWQgdG8gdGhlIERPTSBlbHNld2hlcmUgaW4gYW5vdGhlciBiYWNrYm9uZSdzIHN0aXRjaCBhbHJlYWR5ICh3aGljaCBpbiB0aGUgRE9NXHJcbiAqICAgICAgYXV0b21hdGljYWxseSByZW1vdmVzIGl0IGZyb20gb3VyIGJhY2tib25lJ3MgZGl2KVxyXG4gKiAgIDguIElmIGEgYmxvY2sncyBmaXJzdCBvciBsYXN0IGRyYXdhYmxlIGNoYW5nZXMsIGl0IHNob3VsZCBoYXZlIG5vdGlmeUludGVydmFsIGNhbGxlZCBvbiBpdC5cclxuICogICA5LiBBdCB0aGUgZW5kIG9mIHRoZSBzdGl0Y2gsIHRoZSBiYWNrYm9uZSBzaG91bGQgaGF2ZSBhIHdheSBvZiBpdGVyYXRpbmcgb3ZlciBpdHMgYmxvY2tzIGluIG9yZGVyIChwcmVmZXJhYmx5IGFuXHJcbiAqICAgICAgQXJyYXkgZm9yIGZhc3QgcmVwYWludCBpdGVyYXRpb24pXHJcbiAqICAgMTAuIE5ldyBibG9ja3Mgc2hvdWxkIGhhdmUgc2V0QmxvY2tCYWNrYm9uZSggYmFja2JvbmUgKSBjYWxsZWQgb24gdGhlbVxyXG4gKiAgIDExLiBCbG9ja3Mgd2l0aCBhbnkgZHJhd2FibGUgY2hhbmdlIHNob3VsZCBoYXZlIGJhY2tib25lLm1hcmtEaXJ0eURyYXdhYmxlKCBibG9jayApIGNhbGxlZCBzbyBpdCBjYW4gYmUgdmlzaXRlZFxyXG4gKiAgICAgICBpbiB0aGUgcmVwYWludCBwaGFzZS5cclxuICogICAxMi4gQmxvY2tzIHNob3VsZCBoYXZlIHotaW5kaWNlcyBzZXQgaW4gdGhlIHByb3BlciBzdGFja2luZyBvcmRlciAoYmFjayB0byBmcm9udCksIHVzaW5nIGJhY2tib25lLnJlaW5kZXhCbG9ja3MoKVxyXG4gKiAgICAgICBvciBlcXVpdmFsZW50IChpdCB0cmllcyB0byBjaGFuZ2UgYXMgZmV3IHotaW5kaWNlcyBhcyBwb3NzaWJsZSkuXHJcbiAqXHJcbiAqIFN0aXRjaGVyIGRlc2lyZWQgYmVoYXZpb3IgYW5kIG9wdGltaXphdGlvbnM6XHJcbiAqICAgMS4gUmV1c2UgYmxvY2tzIG9mIHRoZSBzYW1lIHJlbmRlcmVyIHR5cGUsIGluc3RlYWQgb2YgcmVtb3Zpbmcgb25lIGFuZCBjcmVhdGluZyBhbm90aGVyLlxyXG4gKiAgIDIuIE1pbmltaXplIChhcyBtdWNoIGFzIGlzIHBvc3NpYmxlKSBob3cgbWFueSBkcmF3YWJsZXMgYXJlIGFkZGVkIGFuZCByZW1vdmVkIGZyb20gYmxvY2tzICh0cnkgbm90IHRvIHJlbW92ZSAxMDAwXHJcbiAqICAgICAgZHJhd2FibGVzIGZyb20gQSBhbmQgYWRkIHRoZW0gdG8gQiBpZiB3ZSBjb3VsZCBpbnN0ZWFkIGp1c3QgYWRkL3JlbW92ZSA1IGRyYXdhYmxlcyBmcm9tIEMgdG8gRClcclxuICogICAzLiBObyBtb3JlIERPTSBtYW5pcHVsYXRpb24gdGhhbiBuZWNlc3NhcnlcclxuICogICA0LiBPcHRpbWl6ZSBmaXJzdCBmb3IgXCJvbmUgb3IgYSBmZXcgc21hbGwgY2hhbmdlIGludGVydmFsc1wiIHRoYXQgb25seSBjYXVzZSBsb2NhbCBjaGFuZ2VzIChubyBibG9ja3MgY3JlYXRlZCxcclxuICogICAgICByZW1vdmVkIG9yIHJlb3JkZXJlZCkuIEl0IHdvdWxkIGJlIGlkZWFsIHRvIGRvIHRoaXMgdmVyeSBxdWlja2x5LCBzbyBpdCBjb3VsZCBiZSBkb25lIGV2ZXJ5IGZyYW1lIGluXHJcbiAqICAgICAgc2ltdWxhdGlvbnMuXHJcbiAqXHJcbiAqIEN1cnJlbnQgY29uc3RyYWludHM6XHJcbiAqICAgMS4gRE9NIGRyYXdhYmxlcyBzaG91bGQgYmUgcGFpcmVkIHdpdGggZXhhY3RseSBvbmUgYmxvY2sgKGJhc2ljYWxseSBhIHdyYXBwZXIsIHRoZXkgYXJlIGluc2VydGVkIGRpcmVjdGx5IGludG8gdGhlXHJcbiAqICAgICAgRE9NLCBhbmQgYSBET00gYmxvY2sgc2hvdWxkIG9ubHkgZXZlciBiZSBnaXZlbiB0aGUgc2FtZSBkcmF3YWJsZS5cclxuICogICAyLiBPdGhlcndpc2UsIGNvbnNlY3V0aXZlIGRyYXdhYmxlcyB3aXRoIHRoZSBzYW1lIHJlbmRlcmVyIHNob3VsZCBiZSBwYXJ0IG9mIHRoZSBzYW1lIGJsb2NrLiBJbiB0aGUgZnV0dXJlIHdlIHdpbGxcclxuICogICAgICB3YW50IHRvIGFsbG93IFwiZ2Fwc1wiIHRvIGZvcm0gYmV0d2VlbiAoaWYgc29tZXRoaW5nIHdpdGggYSBkaWZmZXJlbnQgcmVuZGVyZXIgZ2V0cyBhZGRlZCBhbmQgcmVtb3ZlZCBhIGxvdFxyXG4gKiAgICAgIGluLWJldHdlZW4pLCBidXQgd2UnbGwgbmVlZCB0byBmaWd1cmUgb3V0IHBlcmZvcm1hbmNlLXNlbnNpdGl2ZSBmbGFncyB0byBpbmRpY2F0ZSB3aGVuIHRoaXMgbmVlZHMgdG8gbm90IGJlXHJcbiAqICAgICAgZG9uZSAob3BhY2l0eSBhbmQgdHlwZXMgb2YgYmxlbmRpbmcgcmVxdWlyZSBubyBnYXBzIGJldHdlZW4gc2FtZS1yZW5kZXJlciBkcmF3YWJsZXMpLlxyXG4gKlxyXG4gKiBHbHVpbmc6IGNvbnNlcXVlbmNlcyBvZiBcIm5vIGdhcHNcIlxyXG4gKiBUaGVyZSBhcmUgdHdvIChpbXBvcnRhbnQpIGltcGxpY2F0aW9uczpcclxuICogR2x1aW5nXHJcbiAqICAgSWYgd2UgaGF2ZSB0aGUgZm9sbG93aW5nIGJsb2NrczpcclxuICogICAgIOKApiBBIChTVkcpLCBCIChDYW52YXMpLCBDIChTVkcpIC4uLlxyXG4gKiAgIGFuZCBhbGwgZHJhd2FibGVzIGZvciBmb3IgQiBhcmUgcmVtb3ZlZCwgdGhlIGZvbGxvd2luZyB3b3VsZCBiZSBpbnZhbGlkIChcImhhcyBhIGdhcFwiKTpcclxuICogICAgIOKApiBBIChTVkcpLCBDIChTVkcpIOKAplxyXG4gKiAgIHNvIHdlIG5lZWQgdG8gZ2x1ZSB0aGVtIHRvZ2V0aGVyLCB1c3VhbGx5IGVpdGhlciByZXN1bHRpbmcgaW46XHJcbiAqICAgICDigKYgQSAoU1ZHKSDigKZcclxuICogICBvclxyXG4gKiAgICAg4oCmIEMgKFNWRykg4oCmXHJcbiAqICAgd2l0aCBBIG9yIEMgaW5jbHVkaW5nIGFsbCBvZiB0aGUgZHJhd2FibGVzIHRoYXQgd2VyZSBpbiBBIGFuZCBDLlxyXG4gKiAgIE1vcmUgZ2VuZXJhbGx5OlxyXG4gKiAgICAgSWYgYSBjaGFuZ2UgaW50ZXJ2YWwgdXNlZCB0byBoYXZlIGl0cyBiZWZvcmUvYWZ0ZXIgKHVuY2hhbmdlZCkgZHJhd2FibGVzIG9uIHR3b1xyXG4gKiAgICAgZGlmZmVyZW50IGJsb2NrcyBhbmQgZm9yIHRoZSBjdXJyZW50IGZyYW1lIHRoZXJlIHdpbGwgYmUgbm8gYmxvY2tzIGluLWJldHdlZW4sXHJcbiAqICAgICB3ZSB3aWxsIG5lZWQgdG8gXCJnbHVlXCIuXHJcbiAqICAgQWRkaXRpb25hbGx5LCBub3RlIHRoZSBjYXNlOlxyXG4gKiAgICAg4oCmIEEgKFNWRyksIEIgKENhbnZhcyksIEMgKERPTSksIEQgKFNWRyksIEUgKENhbnZhcyksIEYgKFNWRykuXHJcbiAqICAgSWYgQixDLEUgYXJlIGFsbCByZW1vdmVkLCB0aGUgcmVzdWx0cyBvZiBBLEQsRiB3aWxsIGhhdmUgdG8gYWxsIGJlIGNvbWJpbmVkIGludG8gb25lIGxheWVyXHJcbiAqIFVuLWdsdWluZ1xyXG4gKiAgIElmIHdlIGhhdmUgdGhlIGZvbGxvd2luZyBkcmF3YWJsZXMsIGFsbCBwYXJ0IG9mIG9uZSBibG9jazpcclxuICogICAgIOKApiBhIChzdmcpLCBiIChzdmcpIOKAplxyXG4gKiAgIGFuZCB3ZSBpbnNlcnQgYSBkcmF3YWJsZSB3aXRoIGEgZGlmZmVyZW50IHJlbmRlcmVyOlxyXG4gKiAgICAg4oCmIGEgKHN2ZyksIGMgKGNhbnZhcyksIGIgKHN2ZykgLi4uXHJcbiAqICAgd2Ugd2lsbCBuZWVkIHRvIHNwbGl0IHRoZW0gaW50byB0byBTVkcgYmxvY2tzXHJcbiAqICAgTW9yZSBnZW5lcmFsbHk6XHJcbiAqICAgICBJZiBhIGNoYW5nZSBpbnRlcnZhbCB1c2VkIHRvIGhhdmUgaXRzIGJlZm9yZS9hZnRlciAodW5jaGFuZ2VkKSBkcmF3YWJsZXMgaW5jbHVkZWRcclxuICogICAgIGluIHRoZSBzYW1lIGJsb2NrLCBhbmQgdGhlIGN1cnJlbnQgZnJhbWUgcmVxdWlyZXMgYSBibG9jayB0byBiZSBpbnNlcnRlZFxyXG4gKiAgICAgaW4tYmV0d2Vlbiwgd2Ugd2lsbCBuZWVkIHRvIFwidW4tZ2x1ZVwiLlxyXG4gKiBUaGVzZSBjb25zZXF1ZW5jZXMgbWVhbiB0aGF0IFwidW5jaGFuZ2VkXCIgZHJhd2FibGVzIChvdXRzaWRlIG9mIGNoYW5nZSBpbnRlcnZhbHMpIG1heSBuZWVkIHRvIGhhdmUgdGhlaXIgYmxvY2sgY2hhbmdlZFxyXG4gKiAod2l0aCBub3RlUGVuZGluZ01vdmUpLiBGb3IgcGVyZm9ybWFuY2UsIHBsZWFzZSBjb25zaWRlciB3aGljaCBcImVuZFwiIHNob3VsZCBrZWVwIGl0cyBkcmF3YWJsZXMgKHRoZSBvdGhlciBlbmQnc1xyXG4gKiBkcmF3YWJsZXMgd2lsbCBBTEwgaGF2ZSB0byBiZSBhZGRlZC9yZW1vdmVkLCB3aGljaCBjYW4gYmUgYSBtYWpvciBwZXJmb3JtYW5jZSBsb3NzIGlmIHdlIGNob29zZSB0aGUgd3Jvbmcgb25lKS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBjbGVhbkFycmF5IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9jbGVhbkFycmF5LmpzJztcclxuaW1wb3J0IHsgQ2FudmFzQmxvY2ssIERPTUJsb2NrLCBEcmF3YWJsZSwgUmVuZGVyZXIsIHNjZW5lcnksIFNWR0Jsb2NrLCBXZWJHTEJsb2NrIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG5jbGFzcyBTdGl0Y2hlciB7XHJcbiAgLyoqXHJcbiAgICogTWFpbiBzdGl0Y2ggZW50cnkgcG9pbnQsIGNhbGxlZCBkaXJlY3RseSBmcm9tIHRoZSBiYWNrYm9uZSBvciBjYWNoZS4gV2UgYXJlIG1vZGlmeWluZyBvdXIgYmFja2JvbmUncyBibG9ja3MgYW5kXHJcbiAgICogdGhlaXIgYXR0YWNoZWQgZHJhd2FibGVzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoZSBjaGFuZ2UtaW50ZXJ2YWwgcGFpciBkZW5vdGVzIGEgbGlua2VkLWxpc3Qgb2YgY2hhbmdlIGludGVydmFscyB0aGF0IHdlIHdpbGwgbmVlZCB0byBzdGl0Y2ggYWNyb3NzICh0aGV5XHJcbiAgICogY29udGFpbiBkcmF3YWJsZXMgdGhhdCBuZWVkIHRvIGJlIHJlbW92ZWQgYW5kIGFkZGVkLCBhbmQgaXQgbWF5IGFmZmVjdCBob3cgd2UgbGF5IG91dCBibG9ja3MgaW4gdGhlIHN0YWNraW5nXHJcbiAgICogb3JkZXIpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCYWNrYm9uZURyYXdhYmxlfSBiYWNrYm9uZVxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV8bnVsbH0gZmlyc3REcmF3YWJsZVxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV8bnVsbH0gbGFzdERyYXdhYmxlXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZXxudWxsfSBvbGRGaXJzdERyYXdhYmxlXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZXxudWxsfSBvbGRMYXN0RHJhd2FibGVcclxuICAgKiBAcGFyYW0ge0NoYW5nZUludGVydmFsfSBmaXJzdENoYW5nZUludGVydmFsXHJcbiAgICogQHBhcmFtIHtDaGFuZ2VJbnRlcnZhbH0gbGFzdENoYW5nZUludGVydmFsXHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZSggYmFja2JvbmUsIGZpcnN0RHJhd2FibGUsIGxhc3REcmF3YWJsZSwgb2xkRmlyc3REcmF3YWJsZSwgb2xkTGFzdERyYXdhYmxlLCBmaXJzdENoYW5nZUludGVydmFsLCBsYXN0Q2hhbmdlSW50ZXJ2YWwgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmaXJzdENoYW5nZUludGVydmFsICYmIGxhc3RDaGFuZ2VJbnRlcnZhbCwgJ1dlIGFyZSBndWFyYW50ZWVkIGF0IGxlYXN0IG9uZSBjaGFuZ2UgaW50ZXJ2YWwnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhZmlyc3REcmF3YWJsZSB8fCBmaXJzdERyYXdhYmxlLnByZXZpb3VzRHJhd2FibGUgPT09IG51bGwsXHJcbiAgICAgICdFbmQgYm91bmRhcnkgb2YgZHJhd2FibGUgbGlua2VkIGxpc3Qgc2hvdWxkIGxpbmsgdG8gbnVsbCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFsYXN0RHJhd2FibGUgfHwgbGFzdERyYXdhYmxlLm5leHREcmF3YWJsZSA9PT0gbnVsbCxcclxuICAgICAgJ0VuZCBib3VuZGFyeSBvZiBkcmF3YWJsZSBsaW5rZWQgbGlzdCBzaG91bGQgbGluayB0byBudWxsJyApO1xyXG5cclxuICAgIGlmICggc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCApIHtcclxuICAgICAgc2NlbmVyeUxvZy5TdGl0Y2goIGBzdGl0Y2ggJHtiYWNrYm9uZS50b1N0cmluZygpXHJcbiAgICAgIH0gZmlyc3Q6JHtmaXJzdERyYXdhYmxlID8gZmlyc3REcmF3YWJsZS50b1N0cmluZygpIDogJ251bGwnXHJcbiAgICAgIH0gbGFzdDoke2xhc3REcmF3YWJsZSA/IGxhc3REcmF3YWJsZS50b1N0cmluZygpIDogJ251bGwnXHJcbiAgICAgIH0gb2xkRmlyc3Q6JHtvbGRGaXJzdERyYXdhYmxlID8gb2xkRmlyc3REcmF3YWJsZS50b1N0cmluZygpIDogJ251bGwnXHJcbiAgICAgIH0gb2xkTGFzdDoke29sZExhc3REcmF3YWJsZSA/IG9sZExhc3REcmF3YWJsZS50b1N0cmluZygpIDogJ251bGwnfWAgKTtcclxuICAgICAgc2NlbmVyeUxvZy5wdXNoKCk7XHJcbiAgICB9XHJcbiAgICBpZiAoIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2hEcmF3YWJsZXMgKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cuU3RpdGNoRHJhd2FibGVzKCAnQmVmb3JlOicgKTtcclxuICAgICAgc2NlbmVyeUxvZy5wdXNoKCk7XHJcbiAgICAgIFN0aXRjaGVyLmRlYnVnRHJhd2FibGVzKCBvbGRGaXJzdERyYXdhYmxlLCBvbGRMYXN0RHJhd2FibGUsIGZpcnN0Q2hhbmdlSW50ZXJ2YWwsIGxhc3RDaGFuZ2VJbnRlcnZhbCwgZmFsc2UgKTtcclxuICAgICAgc2NlbmVyeUxvZy5wb3AoKTtcclxuXHJcbiAgICAgIHNjZW5lcnlMb2cuU3RpdGNoRHJhd2FibGVzKCAnQWZ0ZXI6JyApO1xyXG4gICAgICBzY2VuZXJ5TG9nLnB1c2goKTtcclxuICAgICAgU3RpdGNoZXIuZGVidWdEcmF3YWJsZXMoIGZpcnN0RHJhd2FibGUsIGxhc3REcmF3YWJsZSwgZmlyc3RDaGFuZ2VJbnRlcnZhbCwgbGFzdENoYW5nZUludGVydmFsLCB0cnVlICk7XHJcbiAgICAgIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5iYWNrYm9uZSA9IGJhY2tib25lO1xyXG4gICAgdGhpcy5maXJzdERyYXdhYmxlID0gZmlyc3REcmF3YWJsZTtcclxuICAgIHRoaXMubGFzdERyYXdhYmxlID0gbGFzdERyYXdhYmxlO1xyXG5cclxuICAgIC8vIGxpc3Qgb2YgYmxvY2tzIHRoYXQgaGF2ZSB0aGVpciBwZW5kaW5nRmlyc3REcmF3YWJsZSBvciBwZW5kaW5nTGFzdERyYXdhYmxlIHNldCwgYW5kIG5lZWQgdXBkYXRlSW50ZXJ2YWwoKSBjYWxsZWRcclxuICAgIHRoaXMudG91Y2hlZEJsb2NrcyA9IGNsZWFuQXJyYXkoIHRoaXMudG91Y2hlZEJsb2NrcyApO1xyXG5cclxuICAgIGlmICggYXNzZXJ0U2xvdyApIHtcclxuICAgICAgYXNzZXJ0U2xvdyggIXRoaXMuaW5pdGlhbGl6ZWQsICdXZSBzaG91bGQgbm90IGJlIGFscmVhZHkgaW5pdGlhbGl6ZWQgKGNsZWFuIHNob3VsZCBiZSBjYWxsZWQpJyApO1xyXG4gICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgdGhpcy5yZWluZGV4ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgIHRoaXMucGVuZGluZ0FkZGl0aW9ucyA9IFtdO1xyXG4gICAgICB0aGlzLnBlbmRpbmdSZW1vdmFscyA9IFtdO1xyXG4gICAgICB0aGlzLnBlbmRpbmdNb3ZlcyA9IFtdO1xyXG4gICAgICB0aGlzLmNyZWF0ZWRCbG9ja3MgPSBbXTtcclxuICAgICAgdGhpcy5kaXNwb3NlZEJsb2NrcyA9IFtdO1xyXG4gICAgICB0aGlzLmludGVydmFsc05vdGlmaWVkID0gW107XHJcbiAgICAgIHRoaXMuYm91bmRhcmllc1JlY29yZGVkID0gZmFsc2U7XHJcblxyXG4gICAgICB0aGlzLnByZXZpb3VzQmxvY2tzID0gYmFja2JvbmUuYmxvY2tzLnNsaWNlKCAwICk7IC8vIGNvcHkgb2YgcHJldmlvdXMgYmxvY2tzXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIG9iamVjdCByZWZlcmVuY2VzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNsZWFuKCkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCAmJiBzY2VuZXJ5TG9nLlN0aXRjaCggJ2NsZWFuJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCAmJiBzY2VuZXJ5TG9nLlN0aXRjaCggJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyApO1xyXG5cclxuICAgIGlmICggYXNzZXJ0U2xvdyApIHtcclxuICAgICAgdGhpcy5hdWRpdFN0aXRjaCgpO1xyXG5cclxuICAgICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYmFja2JvbmUgPSBudWxsO1xyXG4gICAgdGhpcy5maXJzdERyYXdhYmxlID0gbnVsbDtcclxuICAgIHRoaXMubGFzdERyYXdhYmxlID0gbnVsbDtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXcml0ZXMgdGhlIGZpcnN0L2xhc3QgZHJhd2FibGVzIGZvciB0aGUgZW50aXJlIGJhY2tib25lIGludG8gaXRzIG1lbW9yeS4gV2Ugd2FudCB0byB3YWl0IHRvIGRvIHRoaXMgdW50aWwgd2UgaGF2ZVxyXG4gICAqIHJlYWQgZnJvbSBpdHMgcHJldmlvdXMgdmFsdWVzLlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKi9cclxuICByZWNvcmRCYWNrYm9uZUJvdW5kYXJpZXMoKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cuU3RpdGNoKCBgcmVjb3JkaW5nIGJhY2tib25lIGJvdW5kYXJpZXM6ICR7XHJcbiAgICAgIHRoaXMuZmlyc3REcmF3YWJsZSA/IHRoaXMuZmlyc3REcmF3YWJsZS50b1N0cmluZygpIDogJ251bGwnXHJcbiAgICB9IHRvICR7XHJcbiAgICAgIHRoaXMubGFzdERyYXdhYmxlID8gdGhpcy5sYXN0RHJhd2FibGUudG9TdHJpbmcoKSA6ICdudWxsJ31gICk7XHJcbiAgICB0aGlzLmJhY2tib25lLnByZXZpb3VzRmlyc3REcmF3YWJsZSA9IHRoaXMuZmlyc3REcmF3YWJsZTtcclxuICAgIHRoaXMuYmFja2JvbmUucHJldmlvdXNMYXN0RHJhd2FibGUgPSB0aGlzLmxhc3REcmF3YWJsZTtcclxuXHJcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XHJcbiAgICAgIHRoaXMuYm91bmRhcmllc1JlY29yZGVkID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlY29yZHMgdGhhdCB0aGlzIHtEcmF3YWJsZX0gZHJhd2FibGUgc2hvdWxkIGJlIGFkZGVkL21vdmVkIHRvIHRoZSB7QmxvY2t9IGF0IGEgbGF0ZXIgdGltZVxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXHJcbiAgICogQHBhcmFtIHtCbG9ja30gYmxvY2tcclxuICAgKi9cclxuICBub3RlUGVuZGluZ0FkZGl0aW9uKCBkcmF3YWJsZSwgYmxvY2sgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkcmF3YWJsZS5yZW5kZXJlciA9PT0gYmxvY2sucmVuZGVyZXIgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cuU3RpdGNoKCBgcGVuZGluZyBhZGQ6ICR7ZHJhd2FibGUudG9TdHJpbmcoKX0gdG8gJHtibG9jay50b1N0cmluZygpfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgZHJhd2FibGUubm90ZVBlbmRpbmdBZGRpdGlvbiggdGhpcy5iYWNrYm9uZS5kaXNwbGF5LCBibG9jaywgdGhpcy5iYWNrYm9uZSApO1xyXG5cclxuICAgIGlmICggYXNzZXJ0U2xvdyApIHtcclxuICAgICAgdGhpcy5wZW5kaW5nQWRkaXRpb25zLnB1c2goIHtcclxuICAgICAgICBkcmF3YWJsZTogZHJhd2FibGUsXHJcbiAgICAgICAgYmxvY2s6IGJsb2NrXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWNvcmRzIHRoYXQgdGhpcyB7RHJhd2FibGV9IGRyYXdhYmxlIHNob3VsZCBiZSBtb3ZlZCB0byB0aGUge0Jsb2NrfSBhdCBhIGxhdGVyIHRpbWUgKGNhbGxlZCBvbmx5IG9uIGV4dGVybmFsXHJcbiAgICogZHJhd2FibGVzKS4gbm90ZVBlbmRpbmdBZGRpdGlvbiBhbmQgbm90ZVBlbmRpbmdSZW1vdmFsIHNob3VsZCBub3QgYmUgY2FsbGVkIG9uIGEgZHJhd2FibGUgdGhhdCBoYWRcclxuICAgKiBub3RlUGVuZGluZ01vdmUgY2FsbGVkIG9uIGl0IGR1cmluZyB0aGUgc2FtZSBzdGl0Y2gsIGFuZCB2aWNlIHZlcnNhLlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXHJcbiAgICogQHBhcmFtIHtCbG9ja30gYmxvY2tcclxuICAgKi9cclxuICBub3RlUGVuZGluZ01vdmUoIGRyYXdhYmxlLCBibG9jayApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRyYXdhYmxlLnJlbmRlcmVyID09PSBibG9jay5yZW5kZXJlciApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5TdGl0Y2goIGBwZW5kaW5nIG1vdmU6ICR7ZHJhd2FibGUudG9TdHJpbmcoKX0gdG8gJHtibG9jay50b1N0cmluZygpfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgZHJhd2FibGUubm90ZVBlbmRpbmdNb3ZlKCB0aGlzLmJhY2tib25lLmRpc3BsYXksIGJsb2NrICk7XHJcblxyXG4gICAgaWYgKCBhc3NlcnRTbG93ICkge1xyXG4gICAgICB0aGlzLnBlbmRpbmdNb3Zlcy5wdXNoKCB7XHJcbiAgICAgICAgZHJhd2FibGU6IGRyYXdhYmxlLFxyXG4gICAgICAgIGJsb2NrOiBibG9ja1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVjb3JkcyB0aGF0IHRoaXMge0RyYXdhYmxlfSBkcmF3YWJsZSBzaG91bGQgYmUgcmVtb3ZlZC9tb3ZlZCBmcm9tIHRoZSB7QmxvY2t9IGF0IGEgbGF0ZXIgdGltZVxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXHJcbiAgICovXHJcbiAgbm90ZVBlbmRpbmdSZW1vdmFsKCBkcmF3YWJsZSApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5TdGl0Y2goIGBwZW5kaW5nIHJlbW92ZTogJHtkcmF3YWJsZS50b1N0cmluZygpfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgZHJhd2FibGUubm90ZVBlbmRpbmdSZW1vdmFsKCB0aGlzLmJhY2tib25lLmRpc3BsYXkgKTtcclxuXHJcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XHJcbiAgICAgIHRoaXMucGVuZGluZ1JlbW92YWxzLnB1c2goIHtcclxuICAgICAgICBkcmF3YWJsZTogZHJhd2FibGVcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlY29yZHMgdGhhdCB0aGlzIHtCbG9ja30gYmxvY2sgc2hvdWxkIGJlIGRpc3Bvc2VkIGF0IGEgbGF0ZXIgdGltZS4gSXQgc2hvdWxkIG5vdCBiZSBpbiB0aGUgYmxvY2tzIGFycmF5IGF0IHRoZVxyXG4gICAqIGVuZCBvZiB0aGUgc3RpdGNoLlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QmxvY2t9IGJsb2NrXHJcbiAgICovXHJcbiAgbWFya0Jsb2NrRm9yRGlzcG9zYWwoIGJsb2NrICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCAmJiBzY2VuZXJ5TG9nLlN0aXRjaCggYGJsb2NrIGZvciBkaXNwb3NhbDogJHtibG9jay50b1N0cmluZygpfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy9UT0RPOiBQRVJGT1JNQU5DRTogZG9lcyB0aGlzIGNhdXNlIHJlZmxvd3MgLyBzdHlsZSBjYWxjdWxhdGlvblxyXG4gICAgaWYgKCBibG9jay5kb21FbGVtZW50LnBhcmVudE5vZGUgPT09IHRoaXMuYmFja2JvbmUuZG9tRWxlbWVudCApIHtcclxuICAgICAgLy8gZ3VhcmRlZCwgc2luY2Ugd2UgbWF5IGhhdmUgYSAobmV3KSBjaGlsZCBkcmF3YWJsZSBhZGQgaXQgYmVmb3JlIHdlIGNhbiByZW1vdmUgaXRcclxuICAgICAgdGhpcy5iYWNrYm9uZS5kb21FbGVtZW50LnJlbW92ZUNoaWxkKCBibG9jay5kb21FbGVtZW50ICk7XHJcbiAgICB9XHJcbiAgICBibG9jay5tYXJrRm9yRGlzcG9zYWwoIHRoaXMuYmFja2JvbmUuZGlzcGxheSApO1xyXG5cclxuICAgIGlmICggYXNzZXJ0U2xvdyApIHtcclxuICAgICAgdGhpcy5kaXNwb3NlZEJsb2Nrcy5wdXNoKCB7XHJcbiAgICAgICAgYmxvY2s6IGJsb2NrXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgcmVtb3ZlQWxsQmxvY2tzKCkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCAmJiBzY2VuZXJ5TG9nLlN0aXRjaCggYG1hcmtpbmcgYWxsIGJsb2NrcyBmb3IgZGlzcG9zYWwgKGNvdW50ICR7dGhpcy5iYWNrYm9uZS5ibG9ja3MubGVuZ3RofSlgICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIHdoaWxlICggdGhpcy5iYWNrYm9uZS5ibG9ja3MubGVuZ3RoICkge1xyXG4gICAgICBjb25zdCBibG9jayA9IHRoaXMuYmFja2JvbmUuYmxvY2tzWyAwIF07XHJcblxyXG4gICAgICB0aGlzLnJlbW92ZUJsb2NrKCBibG9jayApO1xyXG4gICAgICB0aGlzLm1hcmtCbG9ja0ZvckRpc3Bvc2FsKCBibG9jayApO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEltbWVkaWF0ZWx5IG5vdGlmeSBhIGJsb2NrIG9mIGl0cyBmaXJzdC9sYXN0IGRyYXdhYmxlLlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QmxvY2t9IGJsb2NrXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZmlyc3REcmF3YWJsZVxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGxhc3REcmF3YWJsZVxyXG4gICAqL1xyXG4gIG5vdGlmeUludGVydmFsKCBibG9jaywgZmlyc3REcmF3YWJsZSwgbGFzdERyYXdhYmxlICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCAmJiBzY2VuZXJ5TG9nLlN0aXRjaCggYG5vdGlmeSBpbnRlcnZhbDogJHtibG9jay50b1N0cmluZygpfSAke1xyXG4gICAgICBmaXJzdERyYXdhYmxlLnRvU3RyaW5nKCl9IHRvICR7bGFzdERyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBibG9jay5ub3RpZnlJbnRlcnZhbCggZmlyc3REcmF3YWJsZSwgbGFzdERyYXdhYmxlICk7XHJcblxyXG4gICAgLy8gbWFyayBpdCBkaXJ0eSwgc2luY2UgaXRzIGRyYXdhYmxlcyBwcm9iYWJseSBjaGFuZ2VkP1xyXG4gICAgLy9PSFRXTyBUT0RPOiBpcyB0aGlzIG5lY2Vzc2FyeT8gV2hhdCBpcyB0aGlzIGRvaW5nP1xyXG4gICAgdGhpcy5iYWNrYm9uZS5tYXJrRGlydHlEcmF3YWJsZSggYmxvY2sgKTtcclxuXHJcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XHJcbiAgICAgIHRoaXMuaW50ZXJ2YWxzTm90aWZpZWQucHVzaCgge1xyXG4gICAgICAgIGJsb2NrOiBibG9jayxcclxuICAgICAgICBmaXJzdERyYXdhYmxlOiBmaXJzdERyYXdhYmxlLFxyXG4gICAgICAgIGxhc3REcmF3YWJsZTogbGFzdERyYXdhYmxlXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBOb3RlIGEgYmxvY2sncyB0ZW50YXRpdmUgZmlyc3QgZHJhd2FibGUgYW5kIGJsb2NrIGJlZm9yZSAoc2hvdWxkIGJlIGZsdXNoZWQgbGF0ZXIgd2l0aCB1cGRhdGVCbG9ja0ludGVydmFscygpKVxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QmxvY2t9IGJsb2NrXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZmlyc3REcmF3YWJsZVxyXG4gICAqL1xyXG4gIG1hcmtCZWZvcmVCbG9jayggYmxvY2ssIGZpcnN0RHJhd2FibGUgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cuU3RpdGNoKCBgbWFya2luZyBibG9jayBmaXJzdCBkcmF3YWJsZSAke2Jsb2NrLnRvU3RyaW5nKCl9IHdpdGggJHtmaXJzdERyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIGJsb2NrLnBlbmRpbmdGaXJzdERyYXdhYmxlID0gZmlyc3REcmF3YWJsZTtcclxuICAgIHRoaXMudG91Y2hlZEJsb2Nrcy5wdXNoKCBibG9jayApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTm90ZSBhIGJsb2NrJ3MgdGVudGF0aXZlIGxhc3QgZHJhd2FibGUgYW5kIGJsb2NrIGFmdGVyIChzaG91bGQgYmUgZmx1c2hlZCBsYXRlciB3aXRoIHVwZGF0ZUJsb2NrSW50ZXJ2YWxzKCkpXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCbG9ja30gYmxvY2tcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBsYXN0RHJhd2FibGVcclxuICAgKi9cclxuICBtYXJrQWZ0ZXJCbG9jayggYmxvY2ssIGxhc3REcmF3YWJsZSApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5TdGl0Y2goIGBtYXJraW5nIGJsb2NrIGxhc3QgZHJhd2FibGUgJHtibG9jay50b1N0cmluZygpfSB3aXRoICR7bGFzdERyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIGJsb2NrLnBlbmRpbmdMYXN0RHJhd2FibGUgPSBsYXN0RHJhd2FibGU7XHJcbiAgICB0aGlzLnRvdWNoZWRCbG9ja3MucHVzaCggYmxvY2sgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZsdXNoZXMgbWFya0JlZm9yZUJsb2NrL21hcmtBZnRlckJsb2NrIGNoYW5nZXMgdG8gbm90aWZ5SW50ZXJ2YWwgb24gYmxvY2tzIHRoZW1zZWx2ZXMuXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqL1xyXG4gIHVwZGF0ZUJsb2NrSW50ZXJ2YWxzKCkge1xyXG4gICAgd2hpbGUgKCB0aGlzLnRvdWNoZWRCbG9ja3MubGVuZ3RoICkge1xyXG4gICAgICBjb25zdCBibG9jayA9IHRoaXMudG91Y2hlZEJsb2Nrcy5wb3AoKTtcclxuXHJcbiAgICAgIGlmICggYmxvY2sudXNlZCApIHtcclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cuU3RpdGNoKCBgdXBkYXRlIGludGVydmFsOiAke2Jsb2NrLnRvU3RyaW5nKCl9ICR7XHJcbiAgICAgICAgICBibG9jay5wZW5kaW5nRmlyc3REcmF3YWJsZS50b1N0cmluZygpfSB0byAke2Jsb2NrLnBlbmRpbmdMYXN0RHJhd2FibGUudG9TdHJpbmcoKX1gICk7XHJcblxyXG4gICAgICAgIGJsb2NrLnVwZGF0ZUludGVydmFsKCk7XHJcblxyXG4gICAgICAgIC8vIG1hcmsgaXQgZGlydHksIHNpbmNlIGl0cyBkcmF3YWJsZXMgcHJvYmFibHkgY2hhbmdlZD9cclxuICAgICAgICAvL09IVFdPIFRPRE86IGlzIHRoaXMgbmVjZXNzYXJ5PyBXaGF0IGlzIHRoaXMgZG9pbmc/XHJcbiAgICAgICAgdGhpcy5iYWNrYm9uZS5tYXJrRGlydHlEcmF3YWJsZSggYmxvY2sgKTtcclxuXHJcbiAgICAgICAgaWYgKCBhc3NlcnRTbG93ICkge1xyXG4gICAgICAgICAgdGhpcy5pbnRlcnZhbHNOb3RpZmllZC5wdXNoKCB7XHJcbiAgICAgICAgICAgIGJsb2NrOiBibG9jayxcclxuICAgICAgICAgICAgZmlyc3REcmF3YWJsZTogYmxvY2sucGVuZGluZ0ZpcnN0RHJhd2FibGUsXHJcbiAgICAgICAgICAgIGxhc3REcmF3YWJsZTogYmxvY2sucGVuZGluZ0xhc3REcmF3YWJsZVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cuU3RpdGNoKCBgc2tpcHBpbmcgdXBkYXRlIGludGVydmFsOiAke2Jsb2NrLnRvU3RyaW5nKCl9LCB1bnVzZWRgICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBmcmVzaCBibG9jayB3aXRoIHRoZSBkZXNpcmVkIHJlbmRlcmVyIGFuZCB7RHJhd2FibGV9IGFyYml0cmFyeSBkcmF3YWJsZSBpbmNsdWRlZCwgYW5kIGFkZHMgaXQgdG9cclxuICAgKiBvdXIgRE9NLlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXHJcbiAgICogQHJldHVybnMge0Jsb2NrfVxyXG4gICAqL1xyXG4gIGNyZWF0ZUJsb2NrKCByZW5kZXJlciwgZHJhd2FibGUgKSB7XHJcbiAgICBjb25zdCBiYWNrYm9uZSA9IHRoaXMuYmFja2JvbmU7XHJcbiAgICBsZXQgYmxvY2s7XHJcblxyXG4gICAgaWYgKCBSZW5kZXJlci5pc0NhbnZhcyggcmVuZGVyZXIgKSApIHtcclxuICAgICAgYmxvY2sgPSBDYW52YXNCbG9jay5jcmVhdGVGcm9tUG9vbCggYmFja2JvbmUuZGlzcGxheSwgcmVuZGVyZXIsIGJhY2tib25lLnRyYW5zZm9ybVJvb3RJbnN0YW5jZSwgYmFja2JvbmUuYmFja2JvbmVJbnN0YW5jZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIFJlbmRlcmVyLmlzU1ZHKCByZW5kZXJlciApICkge1xyXG4gICAgICAvL09IVFdPIFRPRE86IGhhbmRsZSBmaWx0ZXIgcm9vdCBzZXBhcmF0ZWx5IGZyb20gdGhlIGJhY2tib25lIGluc3RhbmNlP1xyXG4gICAgICBibG9jayA9IFNWR0Jsb2NrLmNyZWF0ZUZyb21Qb29sKCBiYWNrYm9uZS5kaXNwbGF5LCByZW5kZXJlciwgYmFja2JvbmUudHJhbnNmb3JtUm9vdEluc3RhbmNlLCBiYWNrYm9uZS5iYWNrYm9uZUluc3RhbmNlICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggUmVuZGVyZXIuaXNET00oIHJlbmRlcmVyICkgKSB7XHJcbiAgICAgIGJsb2NrID0gRE9NQmxvY2suY3JlYXRlRnJvbVBvb2woIGJhY2tib25lLmRpc3BsYXksIGRyYXdhYmxlICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggUmVuZGVyZXIuaXNXZWJHTCggcmVuZGVyZXIgKSApIHtcclxuICAgICAgYmxvY2sgPSBXZWJHTEJsb2NrLmNyZWF0ZUZyb21Qb29sKCBiYWNrYm9uZS5kaXNwbGF5LCByZW5kZXJlciwgYmFja2JvbmUudHJhbnNmb3JtUm9vdEluc3RhbmNlLCBiYWNrYm9uZS5iYWNrYm9uZUluc3RhbmNlICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgdW5zdXBwb3J0ZWQgcmVuZGVyZXIgZm9yIGNyZWF0ZUJsb2NrOiAke3JlbmRlcmVyfWAgKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cuU3RpdGNoKCBgY3JlYXRlZCBibG9jazogJHtibG9jay50b1N0cmluZygpXHJcbiAgICB9IHdpdGggcmVuZGVyZXI6ICR7cmVuZGVyZXJcclxuICAgIH0gZm9yIGRyYXdhYmxlOiAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIGJsb2NrLnNldEJsb2NrQmFja2JvbmUoIGJhY2tib25lICk7XHJcblxyXG4gICAgLy9PSFRXTyBUT0RPOiBtaW5vciBzcGVlZHVwIGJ5IGFwcGVuZGluZyBvbmx5IG9uY2UgaXRzIGZyYWdtZW50IGlzIGNvbnN0cnVjdGVkPyBvciB1c2UgRG9jdW1lbnRGcmFnbWVudD9cclxuICAgIGJhY2tib25lLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQoIGJsb2NrLmRvbUVsZW1lbnQgKTtcclxuXHJcbiAgICAvLyBpZiBiYWNrYm9uZSBpcyBhIGRpc3BsYXkgcm9vdCwgaGlkZSBhbGwgb2YgaXRzIGNvbnRlbnQgZnJvbSBzY3JlZW4gcmVhZGVyc1xyXG4gICAgaWYgKCBiYWNrYm9uZS5pc0Rpc3BsYXlSb290ICkge1xyXG4gICAgICBibG9jay5kb21FbGVtZW50LnNldEF0dHJpYnV0ZSggJ2FyaWEtaGlkZGVuJywgdHJ1ZSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1hcmsgaXQgZGlydHkgZm9yIG5vdywgc28gd2UgY2FuIGNoZWNrXHJcbiAgICBiYWNrYm9uZS5tYXJrRGlydHlEcmF3YWJsZSggYmxvY2sgKTtcclxuXHJcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XHJcbiAgICAgIHRoaXMuY3JlYXRlZEJsb2Nrcy5wdXNoKCB7XHJcbiAgICAgICAgYmxvY2s6IGJsb2NrLFxyXG4gICAgICAgIHJlbmRlcmVyOiByZW5kZXJlcixcclxuICAgICAgICBkcmF3YWJsZTogZHJhd2FibGVcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBibG9jaztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEltbWVkaWF0ZWx5IGFwcGVuZHMgYSBibG9jayB0byBvdXIgYmxvY2tzIGFycmF5XHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCbG9ja30gYmxvY2tcclxuICAgKi9cclxuICBhcHBlbmRCbG9jayggYmxvY2sgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cuU3RpdGNoKCBgYXBwZW5kaW5nIGJsb2NrOiAke2Jsb2NrLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIHRoaXMuYmFja2JvbmUuYmxvY2tzLnB1c2goIGJsb2NrICk7XHJcblxyXG4gICAgaWYgKCBhc3NlcnRTbG93ICkge1xyXG4gICAgICB0aGlzLnJlaW5kZXhlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW1tZWRpYXRlbHkgcmVtb3ZlcyBhIGJsb2NrIHRvIG91ciBibG9ja3MgYXJyYXlcclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Jsb2NrfSBibG9ja1xyXG4gICAqL1xyXG4gIHJlbW92ZUJsb2NrKCBibG9jayApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5TdGl0Y2goIGByZW1vdmluZyBibG9jazogJHtibG9jay50b1N0cmluZygpfWAgKTtcclxuXHJcbiAgICAvLyByZW1vdmUgdGhlIGJsb2NrIGZyb20gb3VyIGludGVybmFsIGxpc3RcclxuICAgIGNvbnN0IGJsb2NrSW5kZXggPSBfLmluZGV4T2YoIHRoaXMuYmFja2JvbmUuYmxvY2tzLCBibG9jayApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmxvY2tJbmRleCA+PSAwLCBgQ2Fubm90IHJlbW92ZSBibG9jaywgbm90IGF0dGFjaGVkOiAke2Jsb2NrLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgdGhpcy5iYWNrYm9uZS5ibG9ja3Muc3BsaWNlKCBibG9ja0luZGV4LCAxICk7XHJcblxyXG4gICAgaWYgKCBhc3NlcnRTbG93ICkge1xyXG4gICAgICB0aGlzLnJlaW5kZXhlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqL1xyXG4gIHVzZU5vQmxvY2tzKCkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCAmJiBzY2VuZXJ5TG9nLlN0aXRjaCggJ3VzaW5nIG5vIGJsb2NrcycgKTtcclxuXHJcbiAgICAvLyBpLmUuIHdlIHdpbGwgbm90IHVzZSBhbnkgYmxvY2tzXHJcbiAgICBjbGVhbkFycmF5KCB0aGlzLmJhY2tib25lLmJsb2NrcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZ2dlcnMgYWxsIGJsb2NrcyBpbiB0aGUgYmxvY2tzIGFycmF5IHRvIGhhdmUgdGhlaXIgei1pbmRleCBwcm9wZXJ0aWVzIHNldCBzbyB0aGF0IHRoZXkgdmlzdWFsbHkgc3RhY2tcclxuICAgKiBjb3JyZWN0bHkuXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqL1xyXG4gIHJlaW5kZXgoKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cuU3RpdGNoKCAncmVpbmRleGluZyBibG9ja3MnICk7XHJcblxyXG4gICAgdGhpcy5iYWNrYm9uZS5yZWluZGV4QmxvY2tzKCk7XHJcblxyXG4gICAgaWYgKCBhc3NlcnRTbG93ICkge1xyXG4gICAgICB0aGlzLnJlaW5kZXhlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBbiBhdWRpdCBmb3IgdGVzdGluZyBhc3NlcnRpb25zXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqL1xyXG4gIGF1ZGl0U3RpdGNoKCkge1xyXG4gICAgaWYgKCBhc3NlcnRTbG93ICkge1xyXG4gICAgICBjb25zdCBibG9ja3MgPSB0aGlzLmJhY2tib25lLmJsb2NrcztcclxuICAgICAgY29uc3QgcHJldmlvdXNCbG9ja3MgPSB0aGlzLnByZXZpb3VzQmxvY2tzO1xyXG5cclxuICAgICAgYXNzZXJ0U2xvdyggdGhpcy5pbml0aWFsaXplZCwgJ1dlIHNlZW0gdG8gaGF2ZSBmaW5pc2hlZCBhIHN0aXRjaCB3aXRob3V0IHByb3BlciBpbml0aWFsaXphdGlvbicgKTtcclxuICAgICAgYXNzZXJ0U2xvdyggdGhpcy5ib3VuZGFyaWVzUmVjb3JkZWQsICdPdXIgc3RpdGNoIEFQSSByZXF1aXJlcyByZWNvcmRCYWNrYm9uZUJvdW5kYXJpZXMoKSB0byBiZSBjYWxsZWQgYmVmb3JlJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIGl0IGlzIGZpbmlzaGVkLicgKTtcclxuXHJcbiAgICAgIC8vIGVuc3VyZSBvdXIgaW5kaWNlcyBhcmUgdXAtdG8tZGF0ZSAocmVpbmRleGVkLCBvciBkaWQgbm90IGNoYW5nZSlcclxuICAgICAgYXNzZXJ0U2xvdyggdGhpcy5yZWluZGV4ZWQgfHwgYmxvY2tzLmxlbmd0aCA9PT0gMCB8fFxyXG4gICAgICAgICAgICAgICAgICAvLyBhcnJheSBlcXVhbGl0eSBvZiBwcmV2aW91c0Jsb2NrcyBhbmQgYmxvY2tzXHJcbiAgICAgICAgICAgICAgICAgICggcHJldmlvdXNCbG9ja3MubGVuZ3RoID09PSBibG9ja3MubGVuZ3RoICYmXHJcbiAgICAgICAgICAgICAgICAgICAgXy5ldmVyeSggXy56aXAoIHByZXZpb3VzQmxvY2tzLCBibG9ja3MgKSwgYXJyID0+IGFyclsgMCBdID09PSBhcnJbIDEgXSApICksXHJcbiAgICAgICAgJ0RpZCBub3QgcmVpbmRleCBvbiBhIGJsb2NrIGNoYW5nZSB3aGVyZSB3ZSBhcmUgbGVmdCB3aXRoIGJsb2NrcycgKTtcclxuXHJcbiAgICAgIC8vIGFsbCBjcmVhdGVkIGJsb2NrcyBoYWQgaW50ZXJ2YWxzIG5vdGlmaWVkXHJcbiAgICAgIF8uZWFjaCggdGhpcy5jcmVhdGVkQmxvY2tzLCBibG9ja0RhdGEgPT4ge1xyXG4gICAgICAgIGFzc2VydFNsb3coIF8uc29tZSggdGhpcy5pbnRlcnZhbHNOb3RpZmllZCwgaW50ZXJ2YWxEYXRhID0+IGJsb2NrRGF0YS5ibG9jayA9PT0gaW50ZXJ2YWxEYXRhLmJsb2NrICksIGBDcmVhdGVkIGJsb2NrIGRvZXMgbm90IHNlZW0gdG8gaGF2ZSBhbiBpbnRlcnZhbCBub3RpZmllZDogJHtibG9ja0RhdGEuYmxvY2sudG9TdHJpbmcoKX1gICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIG5vIGRpc3Bvc2VkIGJsb2NrcyBoYWQgaW50ZXJ2YWxzIG5vdGlmaWVkXHJcbiAgICAgIF8uZWFjaCggdGhpcy5kaXNwb3NlZEJsb2NrcywgYmxvY2tEYXRhID0+IHtcclxuICAgICAgICBhc3NlcnRTbG93KCAhXy5zb21lKCB0aGlzLmludGVydmFsc05vdGlmaWVkLCBpbnRlcnZhbERhdGEgPT4gYmxvY2tEYXRhLmJsb2NrID09PSBpbnRlcnZhbERhdGEuYmxvY2sgKSwgYFJlbW92ZWQgYmxvY2sgc2VlbXMgdG8gaGF2ZSBhbiBpbnRlcnZhbCBub3RpZmllZDogJHtibG9ja0RhdGEuYmxvY2sudG9TdHJpbmcoKX1gICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIGFsbCBkcmF3YWJsZXMgZm9yIGRpc3Bvc2VkIGJsb2NrcyBoYXZlIGJlZW4gbWFya2VkIGFzIHBlbmRpbmcgcmVtb3ZhbCAob3IgbW92ZWQpXHJcbiAgICAgIF8uZWFjaCggdGhpcy5kaXNwb3NlZEJsb2NrcywgYmxvY2tEYXRhID0+IHtcclxuICAgICAgICBjb25zdCBibG9jayA9IGJsb2NrRGF0YS5ibG9jaztcclxuICAgICAgICBfLmVhY2goIERyYXdhYmxlLm9sZExpc3RUb0FycmF5KCBibG9jay5maXJzdERyYXdhYmxlLCBibG9jay5sYXN0RHJhd2FibGUgKSwgZHJhd2FibGUgPT4ge1xyXG4gICAgICAgICAgYXNzZXJ0U2xvdyggXy5zb21lKCB0aGlzLnBlbmRpbmdSZW1vdmFscywgcmVtb3ZhbERhdGEgPT4gcmVtb3ZhbERhdGEuZHJhd2FibGUgPT09IGRyYXdhYmxlICkgfHwgXy5zb21lKCB0aGlzLnBlbmRpbmdNb3ZlcywgbW92ZURhdGEgPT4gbW92ZURhdGEuZHJhd2FibGUgPT09IGRyYXdhYmxlICksIGBEcmF3YWJsZSAke2RyYXdhYmxlLnRvU3RyaW5nKCl9IG9yaWdpbmFsbHkgbGlzdGVkIGZvciBkaXNwb3NlZCBibG9jayAke2Jsb2NrLnRvU3RyaW5nKClcclxuICAgICAgICAgIH0gZG9lcyBub3Qgc2VlbSB0byBiZSBtYXJrZWQgZm9yIHBlbmRpbmcgcmVtb3ZhbCBvciBtb3ZlIWAgKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIGFsbCBkcmF3YWJsZXMgZm9yIGNyZWF0ZWQgYmxvY2tzIGhhdmUgYmVlbiBtYXJrZWQgYXMgcGVuZGluZyBhZGRpdGlvbiBvciBtb3ZlZCBmb3Igb3VyIGJsb2NrXHJcbiAgICAgIF8uZWFjaCggdGhpcy5jcmVhdGVkQmxvY2tzLCBibG9ja0RhdGEgPT4ge1xyXG4gICAgICAgIGNvbnN0IGJsb2NrID0gYmxvY2tEYXRhLmJsb2NrO1xyXG4gICAgICAgIF8uZWFjaCggRHJhd2FibGUubGlzdFRvQXJyYXkoIGJsb2NrLnBlbmRpbmdGaXJzdERyYXdhYmxlLCBibG9jay5wZW5kaW5nTGFzdERyYXdhYmxlICksIGRyYXdhYmxlID0+IHtcclxuICAgICAgICAgIGFzc2VydFNsb3coIF8uc29tZSggdGhpcy5wZW5kaW5nQWRkaXRpb25zLCBhZGRpdGlvbkRhdGEgPT4gYWRkaXRpb25EYXRhLmRyYXdhYmxlID09PSBkcmF3YWJsZSAmJiBhZGRpdGlvbkRhdGEuYmxvY2sgPT09IGJsb2NrICkgfHwgXy5zb21lKCB0aGlzLnBlbmRpbmdNb3ZlcywgbW92ZURhdGEgPT4gbW92ZURhdGEuZHJhd2FibGUgPT09IGRyYXdhYmxlICYmIG1vdmVEYXRhLmJsb2NrID09PSBibG9jayApLCBgRHJhd2FibGUgJHtkcmF3YWJsZS50b1N0cmluZygpfSBub3cgbGlzdGVkIGZvciBjcmVhdGVkIGJsb2NrICR7YmxvY2sudG9TdHJpbmcoKVxyXG4gICAgICAgICAgfSBkb2VzIG5vdCBzZWVtIHRvIGJlIG1hcmtlZCBmb3IgcGVuZGluZyBhZGRpdGlvbiBvciBtb3ZlIWAgKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIGFsbCBkaXNwb3NlZCBibG9ja3Mgc2hvdWxkIGhhdmUgYmVlbiByZW1vdmVkXHJcbiAgICAgIF8uZWFjaCggdGhpcy5kaXNwb3NlZEJsb2NrcywgYmxvY2tEYXRhID0+IHtcclxuICAgICAgICBjb25zdCBibG9ja0lkeCA9IF8uaW5kZXhPZiggYmxvY2tzLCBibG9ja0RhdGEuYmxvY2sgKTtcclxuICAgICAgICBhc3NlcnRTbG93KCBibG9ja0lkeCA8IDAsIGBEaXNwb3NlZCBibG9jayAke2Jsb2NrRGF0YS5ibG9jay50b1N0cmluZygpfSBzdGlsbCBwcmVzZW50IGF0IGluZGV4ICR7YmxvY2tJZHh9YCApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBhbGwgY3JlYXRlZCBibG9ja3Mgc2hvdWxkIGhhdmUgYmVlbiBhZGRlZFxyXG4gICAgICBfLmVhY2goIHRoaXMuY3JlYXRlZEJsb2NrcywgYmxvY2tEYXRhID0+IHtcclxuICAgICAgICBjb25zdCBibG9ja0lkeCA9IF8uaW5kZXhPZiggYmxvY2tzLCBibG9ja0RhdGEuYmxvY2sgKTtcclxuICAgICAgICBhc3NlcnRTbG93KCBibG9ja0lkeCA+PSAwLCBgQ3JlYXRlZCBibG9jayAke2Jsb2NrRGF0YS5ibG9jay50b1N0cmluZygpfSBpcyBub3QgaW4gdGhlIGJsb2NrcyBhcnJheWAgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gYWxsIGN1cnJlbnQgYmxvY2tzIHNob3VsZCBiZSBtYXJrZWQgYXMgdXNlZFxyXG4gICAgICBfLmVhY2goIGJsb2NrcywgYmxvY2sgPT4ge1xyXG4gICAgICAgIGFzc2VydFNsb3coIGJsb2NrLnVzZWQsICdBbGwgY3VycmVudCBibG9ja3Mgc2hvdWxkIGJlIG1hcmtlZCBhcyB1c2VkJyApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBhc3NlcnRTbG93KCBibG9ja3MubGVuZ3RoIC0gcHJldmlvdXNCbG9ja3MubGVuZ3RoID09PSB0aGlzLmNyZWF0ZWRCbG9ja3MubGVuZ3RoIC0gdGhpcy5kaXNwb3NlZEJsb2Nrcy5sZW5ndGgsXHJcbiAgICAgICAgYCR7J1RoZSBjb3VudCBvZiB1bm1vZGlmaWVkIGJsb2NrcyBzaG91bGQgYmUgY29uc3RhbnQgKGVxdWFsIGRpZmZlcmVuY2VzKTpcXG4nICtcclxuICAgICAgICAnY3JlYXRlZDogJ30ke18ubWFwKCB0aGlzLmNyZWF0ZWRCbG9ja3MsIG4gPT4gbi5ibG9jay5pZCApLmpvaW4oICcsJyApfVxcbmAgK1xyXG4gICAgICAgIGBkaXNwb3NlZDogJHtfLm1hcCggdGhpcy5kaXNwb3NlZEJsb2NrcywgbiA9PiBuLmJsb2NrLmlkICkuam9pbiggJywnICl9XFxuYCArXHJcbiAgICAgICAgYGJlZm9yZTogJHtfLm1hcCggcHJldmlvdXNCbG9ja3MsIG4gPT4gbi5pZCApLmpvaW4oICcsJyApfVxcbmAgK1xyXG4gICAgICAgIGBhZnRlcjogJHtfLm1hcCggYmxvY2tzLCBuID0+IG4uaWQgKS5qb2luKCAnLCcgKX1gICk7XHJcblxyXG4gICAgICBhc3NlcnRTbG93KCB0aGlzLnRvdWNoZWRCbG9ja3MubGVuZ3RoID09PSAwLFxyXG4gICAgICAgICdJZiB3ZSBtYXJrZWQgYW55IGJsb2NrcyBmb3IgY2hhbmdlcywgd2Ugc2hvdWxkIGhhdmUgY2FsbGVkIHVwZGF0ZUJsb2NrSW50ZXJ2YWxzJyApO1xyXG5cclxuICAgICAgaWYgKCBibG9ja3MubGVuZ3RoICkge1xyXG5cclxuICAgICAgICBhc3NlcnRTbG93KCB0aGlzLmJhY2tib25lLnByZXZpb3VzRmlyc3REcmF3YWJsZSAhPT0gbnVsbCAmJlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmFja2JvbmUucHJldmlvdXNMYXN0RHJhd2FibGUgIT09IG51bGwsXHJcbiAgICAgICAgICAnSWYgd2UgYXJlIGxlZnQgd2l0aCBhdCBsZWFzdCBvbmUgYmxvY2ssIHdlIG11c3QgYmUgdHJhY2tpbmcgYXQgbGVhc3Qgb25lIGRyYXdhYmxlJyApO1xyXG5cclxuICAgICAgICBhc3NlcnRTbG93KCBibG9ja3NbIDAgXS5wZW5kaW5nRmlyc3REcmF3YWJsZSA9PT0gdGhpcy5iYWNrYm9uZS5wcmV2aW91c0ZpcnN0RHJhd2FibGUsXHJcbiAgICAgICAgICAnT3VyIGZpcnN0IGRyYXdhYmxlIHNob3VsZCBtYXRjaCB0aGUgZmlyc3QgZHJhd2FibGUgb2Ygb3VyIGZpcnN0IGJsb2NrJyApO1xyXG5cclxuICAgICAgICBhc3NlcnRTbG93KCBibG9ja3NbIGJsb2Nrcy5sZW5ndGggLSAxIF0ucGVuZGluZ0xhc3REcmF3YWJsZSA9PT0gdGhpcy5iYWNrYm9uZS5wcmV2aW91c0xhc3REcmF3YWJsZSxcclxuICAgICAgICAgICdPdXIgbGFzdCBkcmF3YWJsZSBzaG91bGQgbWF0Y2ggdGhlIGxhc3QgZHJhd2FibGUgb2Ygb3VyIGxhc3QgYmxvY2snICk7XHJcblxyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGJsb2Nrcy5sZW5ndGggLSAxOyBpKysgKSB7XHJcbiAgICAgICAgICAvLyBbaV0gYW5kIFtpKzFdIGFyZSBhIHBhaXIgb2YgY29uc2VjdXRpdmUgYmxvY2tzXHJcbiAgICAgICAgICBhc3NlcnRTbG93KCBibG9ja3NbIGkgXS5wZW5kaW5nTGFzdERyYXdhYmxlLm5leHREcmF3YWJsZSA9PT0gYmxvY2tzWyBpICsgMSBdLnBlbmRpbmdGaXJzdERyYXdhYmxlICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICBibG9ja3NbIGkgXS5wZW5kaW5nTGFzdERyYXdhYmxlID09PSBibG9ja3NbIGkgKyAxIF0ucGVuZGluZ0ZpcnN0RHJhd2FibGUucHJldmlvdXNEcmF3YWJsZSxcclxuICAgICAgICAgICAgJ0NvbnNlY3V0aXZlIGJsb2NrcyBzaG91bGQgaGF2ZSBib3VuZGFyeSBkcmF3YWJsZXMgdGhhdCBhcmUgYWxzbyBjb25zZWN1dGl2ZSBpbiB0aGUgbGlua2VkIGxpc3QnICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGFzc2VydFNsb3coIHRoaXMuYmFja2JvbmUucHJldmlvdXNGaXJzdERyYXdhYmxlID09PSBudWxsICYmXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWNrYm9uZS5wcmV2aW91c0xhc3REcmF3YWJsZSA9PT0gbnVsbCxcclxuICAgICAgICAgICdJZiB3ZSBhcmUgbGVmdCB3aXRoIG5vIGJsb2NrcywgaXQgbXVzdCBtZWFuIHdlIGFyZSB0cmFja2luZyBwcmVjaXNlbHkgemVybyBkcmF3YWJsZXMnICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Q2hhbmdlSW50ZXJ2YWx9IGZpcnN0Q2hhbmdlSW50ZXJ2YWxcclxuICAgKi9cclxuICBzdGF0aWMgZGVidWdJbnRlcnZhbHMoIGZpcnN0Q2hhbmdlSW50ZXJ2YWwgKSB7XHJcbiAgICBpZiAoIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggKSB7XHJcbiAgICAgIGZvciAoIGxldCBkZWJ1Z0ludGVydmFsID0gZmlyc3RDaGFuZ2VJbnRlcnZhbDsgZGVidWdJbnRlcnZhbCAhPT0gbnVsbDsgZGVidWdJbnRlcnZhbCA9IGRlYnVnSW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsICkge1xyXG4gICAgICAgIHNjZW5lcnlMb2cuU3RpdGNoKCBgICBpbnRlcnZhbDogJHtcclxuICAgICAgICAgIGRlYnVnSW50ZXJ2YWwuaXNFbXB0eSgpID8gJyhlbXB0eSkgJyA6ICcnXHJcbiAgICAgICAgfSR7ZGVidWdJbnRlcnZhbC5kcmF3YWJsZUJlZm9yZSA/IGRlYnVnSW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUudG9TdHJpbmcoKSA6ICctJ30gdG8gJHtcclxuICAgICAgICAgIGRlYnVnSW50ZXJ2YWwuZHJhd2FibGVBZnRlciA/IGRlYnVnSW50ZXJ2YWwuZHJhd2FibGVBZnRlci50b1N0cmluZygpIDogJy0nfWAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTG9ncyBhIGJ1bmNoIG9mIGluZm9ybWF0aW9uIGFib3V0IHRoZSBvbGQgKHVzZUN1cnJlbnQ9PT1mYWxzZSkgb3IgbmV3ICh1c2VDdXJyZW50PT09dHJ1ZSkgZHJhd2FibGUgbGlua2VkIGxpc3QuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZXxudWxsfSBmaXJzdERyYXdhYmxlXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZXxudWxsfSBsYXN0RHJhd2FibGVcclxuICAgKiBAcGFyYW0ge0NoYW5nZUludGVydmFsfSBmaXJzdENoYW5nZUludGVydmFsXHJcbiAgICogQHBhcmFtIHtDaGFuZ2VJbnRlcnZhbH0gbGFzdENoYW5nZUludGVydmFsXHJcbiAgICogQHBhcmFtIHtib29sZWFufSB1c2VDdXJyZW50XHJcbiAgICovXHJcbiAgc3RhdGljIGRlYnVnRHJhd2FibGVzKCBmaXJzdERyYXdhYmxlLCBsYXN0RHJhd2FibGUsIGZpcnN0Q2hhbmdlSW50ZXJ2YWwsIGxhc3RDaGFuZ2VJbnRlcnZhbCwgdXNlQ3VycmVudCApIHtcclxuICAgIGlmICggc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaERyYXdhYmxlcyApIHtcclxuICAgICAgaWYgKCBmaXJzdERyYXdhYmxlID09PSBudWxsICkge1xyXG4gICAgICAgIHNjZW5lcnlMb2cuU3RpdGNoRHJhd2FibGVzKCAnbm90aGluZycsICdjb2xvcjogIzY2NjsnICk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgaXNDaGFuZ2VkID0gZmlyc3RDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUJlZm9yZSA9PT0gbnVsbDtcclxuICAgICAgbGV0IGN1cnJlbnRJbnRlcnZhbCA9IGZpcnN0Q2hhbmdlSW50ZXJ2YWw7XHJcblxyXG4gICAgICBmb3IgKCBsZXQgZHJhd2FibGUgPSBmaXJzdERyYXdhYmxlOyA7IGRyYXdhYmxlID0gKCB1c2VDdXJyZW50ID8gZHJhd2FibGUubmV4dERyYXdhYmxlIDogZHJhd2FibGUub2xkTmV4dERyYXdhYmxlICkgKSB7XHJcbiAgICAgICAgaWYgKCBpc0NoYW5nZWQgJiYgZHJhd2FibGUgPT09IGN1cnJlbnRJbnRlcnZhbC5kcmF3YWJsZUFmdGVyICkge1xyXG4gICAgICAgICAgaXNDaGFuZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgICBjdXJyZW50SW50ZXJ2YWwgPSBjdXJyZW50SW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZHJhd2FibGVTdHJpbmcgPSBgJHtkcmF3YWJsZS5yZW5kZXJlcn0gJHsoICF1c2VDdXJyZW50ICYmIGRyYXdhYmxlLnBhcmVudERyYXdhYmxlICkgPyBkcmF3YWJsZS5wYXJlbnREcmF3YWJsZS50b1N0cmluZygpIDogJyd9ICR7ZHJhd2FibGUudG9EZXRhaWxlZFN0cmluZygpfWA7XHJcbiAgICAgICAgc2NlbmVyeUxvZy5TdGl0Y2hEcmF3YWJsZXMoIGRyYXdhYmxlU3RyaW5nLCBpc0NoYW5nZWQgPyAoIHVzZUN1cnJlbnQgPyAnY29sb3I6ICMwYTA7JyA6ICdjb2xvcjogI2EwMDsnICkgOiAnY29sb3I6ICM2NjYnICk7XHJcblxyXG4gICAgICAgIGlmICggIWlzQ2hhbmdlZCAmJiBjdXJyZW50SW50ZXJ2YWwgJiYgY3VycmVudEludGVydmFsLmRyYXdhYmxlQmVmb3JlID09PSBkcmF3YWJsZSApIHtcclxuICAgICAgICAgIGlzQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIGRyYXdhYmxlID09PSBsYXN0RHJhd2FibGUgKSB7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdTdGl0Y2hlcicsIFN0aXRjaGVyICk7XHJcbmV4cG9ydCBkZWZhdWx0IFN0aXRjaGVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0scUNBQXFDO0FBQzVELFNBQVNDLFdBQVcsRUFBRUMsUUFBUSxFQUFFQyxRQUFRLEVBQUVDLFFBQVEsRUFBRUMsT0FBTyxFQUFFQyxRQUFRLEVBQUVDLFVBQVUsUUFBUSxlQUFlO0FBRXhHLE1BQU1DLFFBQVEsQ0FBQztFQUNiO0FB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