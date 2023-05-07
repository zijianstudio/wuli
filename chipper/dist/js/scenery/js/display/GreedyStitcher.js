// Copyright 2014-2022, University of Colorado Boulder

/**
 * Stitcher that only rebuilds the parts necessary, and attempts greedy block matching as an optimization.
 *
 * Given a list of change intervals, our greedy stitcher breaks it down into 'sub-blocks' consisting of
 * drawables that are 'internal' to the change interval that all have the same renderer, and handles the
 * glue/unglue/matching situations in a greedy way by always using the first possible (allowing only one sweep
 * instead of multiple ones over the drawable linked list for this process).
 *
 * Conceptually, we break down drawables into groups that are 'internal' to each change interval (inside, not
 * including the un-changed ends), and 'external' (that are not internal to any intervals).
 *
 * For each interval, we first make sure that the next 'external' group of drawables has the proper blocks (for
 * instance, this can change with a glue/unglue operation, with processEdgeCases), then proceed to break the 'internal'
 * drawables into sub-blocks and process those with processSubBlock.
 *
 * Our stitcher has a list of blocks noted as 'reusable' that we use for two purposes:
 *   1. So that we can shift blocks to where they are needed, instead of removing (e.g.) an SVG block and
 *      creating another.
 *   2. So that blocks that are unused at the end of our stitch can be removed, and marked for disposal.
 * At the start of the stitch, we mark completely 'internal' blocks as reusable, so they can be shifted around as
 * necessary (used in a greedy way which may not be optimal). It's also possible during later phases for blocks that
 * also contain 'external' drawables to be marked as reusable, due to glue cases where before we needed multiple
 * blocks and now we only need one.
 *
 * We also use a linked-list of blocks during stitch operations (that then re-builds an array of blocks on any changes
 * after all stitching is done) for simplicity, and to avoid O(n^2) cases that would result from having to look up
 * indices in the block array during stitching.
 *
 * NOTE: Stitcher instances may be reused many times, even with different backbones. It should always release any
 * object references that it held after usage.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import cleanArray from '../../../phet-core/js/cleanArray.js';
import { Block, ChangeInterval, Drawable, Renderer, scenery, Stitcher } from '../imports.js';

// Returns whether the consecutive {Drawable}s 'a' and 'b' should be put into separate blocks
function hasGapBetweenDrawables(a, b) {
  return a.renderer !== b.renderer || Renderer.isDOM(a.renderer) || Renderer.isDOM(b.renderer);
}

// Whether the drawable and its previous sibling should be in the same block. Will be false if there is no sibling
function isOpenBefore(drawable) {
  return drawable.previousDrawable !== null && !hasGapBetweenDrawables(drawable.previousDrawable, drawable);
}

// Whether the drawable and its next sibling should be in the same block. Will be false if there is no sibling
function isOpenAfter(drawable) {
  return drawable.nextDrawable !== null && !hasGapBetweenDrawables(drawable, drawable.nextDrawable);
}

// If the change interval will contain any new (added) drawables
function intervalHasNewInternalDrawables(interval, firstStitchDrawable, lastStitchDrawable) {
  if (interval.drawableBefore) {
    return interval.drawableBefore.nextDrawable !== interval.drawableAfter; // OK for after to be null
  } else if (interval.drawableAfter) {
    return interval.drawableAfter.previousDrawable !== interval.drawableBefore; // OK for before to be null
  } else {
    return firstStitchDrawable !== null;
  }
}

// If the change interval contained any drawables that are to be removed
function intervalHasOldInternalDrawables(interval, oldFirstStitchDrawable, oldLastStitchDrawable) {
  if (interval.drawableBefore) {
    return interval.drawableBefore.oldNextDrawable !== interval.drawableAfter; // OK for after to be null
  } else if (interval.drawableAfter) {
    return interval.drawableAfter.oldPreviousDrawable !== interval.drawableBefore; // OK for before to be null
  } else {
    return oldFirstStitchDrawable !== null;
  }
}

// Whether there are blocks that consist of drawables that are ALL internal to the {ChangeInterval} interval.
function intervalHasOldInternalBlocks(interval, firstStitchBlock, lastStitchBlock) {
  const beforeBlock = interval.drawableBefore ? interval.drawableBefore.parentDrawable : null;
  const afterBlock = interval.drawableAfter ? interval.drawableAfter.parentDrawable : null;
  if (beforeBlock && afterBlock && beforeBlock === afterBlock) {
    return false;
  }
  if (beforeBlock) {
    return beforeBlock.nextBlock !== afterBlock; // OK for after to be null
  } else if (afterBlock) {
    return afterBlock.previousBlock !== beforeBlock; // OK for before to be null
  } else {
    return firstStitchBlock !== null;
  }
}

/**
 * Finds the furthest external drawable that:
 * (a) Before the next change interval (if we have a next change interval)
 * (b) Has the same renderer as the interval's drawableAfter
 */
function getLastCompatibleExternalDrawable(interval) {
  const firstDrawable = interval.drawableAfter;
  if (firstDrawable) {
    const renderer = firstDrawable.renderer;

    // we stop our search before we reach this (null is acceptable), ensuring we don't go into the next change interval
    const cutoffDrawable = interval.nextChangeInterval ? interval.nextChangeInterval.drawableBefore.nextDrawable : null;
    let drawable = firstDrawable;
    while (true) {
      // eslint-disable-line no-constant-condition
      const nextDrawable = drawable.nextDrawable;

      // first comparison also does null check when necessary
      if (nextDrawable !== cutoffDrawable && nextDrawable.renderer === renderer) {
        drawable = nextDrawable;
      } else {
        break;
      }
    }
    return drawable;
  } else {
    return null; // with no drawableAfter, we don't have any external drawables after our interval
  }
}

class GreedyStitcher extends Stitcher {
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
   * @param {Drawable|null} firstStitchDrawable
   * @param {Drawable|null} lastStitchDrawable
   * @param {Drawable|null} oldFirstStitchDrawable
   * @param {Drawable|null} oldLastStitchDrawable
   * @param {ChangeInterval} firstChangeInterval
   * @param {ChangeInterval} lastChangeInterval
   */
  stitch(backbone, firstStitchDrawable, lastStitchDrawable, oldFirstStitchDrawable, oldLastStitchDrawable, firstChangeInterval, lastChangeInterval) {
    // required call to the Stitcher interface (see Stitcher.initialize()).
    this.initialize(backbone, firstStitchDrawable, lastStitchDrawable, oldFirstStitchDrawable, oldLastStitchDrawable, firstChangeInterval, lastChangeInterval);

    // Tracks whether our order of blocks changed. If it did, we'll need to rebuild our blocks array. This flag is
    // set if we remove any blocks, create any blocks, or change the order between two blocks (via linkBlocks).
    // It does NOT occur in unuseBlock, since we may reuse the same block in the same position (thus not having an
    // order change).
    this.blockOrderChanged = false;

    // List of blocks that (in the current part of the stitch being processed) are not set to be used by any
    // drawables. Blocks are added to here when they are fully internal to a change interval, and when we glue
    // blocks together. They can be reused through the block-matching process. If they are not reused at the end of
    // this stitch, they will be marked for removal.
    this.reusableBlocks = cleanArray(this.reusableBlocks); // re-use instance, since we are effectively pooled

    // To properly handle glue/unglue situations with external blocks (ones that aren't reusable after phase 1),
    // we need some extra tracking for our inner sub-block edge case loop.
    this.blockWasAdded = false; // we need to know if a previously-existing block was added, and remove it otherwise.

    let interval;

    // record current first/last drawables for the entire backbone
    this.recordBackboneBoundaries();
    sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.GreedyStitcher('phase 1: old linked list');
    sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.push();

    // Handle pending removal of old blocks/drawables. First, we need to mark all 'internal' drawables with
    // notePendingRemoval(), so that if they aren't added back in this backbone, that they are removed from their
    // old block. Note that later we will add the ones that stay on this backbone, so that they only either change
    // blocks, or stay on the same block.
    if (backbone.blocks.length) {
      const veryFirstBlock = backbone.blocks[0];
      const veryLastBlock = backbone.blocks[backbone.blocks.length - 1];
      for (interval = firstChangeInterval; interval !== null; interval = interval.nextChangeInterval) {
        assert && assert(!interval.isEmpty(), 'We now guarantee that the intervals are non-empty');

        // First, we need to mark all old 'internal' drawables with notePendingRemoval(), so that if they aren't added
        // back in this backbone, that they are removed from their old block. Note that later we will add the ones
        // that stay on this backbone, so that they only either change blocks, or stay on the same block.
        if (intervalHasOldInternalDrawables(interval, oldFirstStitchDrawable, oldLastStitchDrawable)) {
          const firstRemoval = interval.drawableBefore ? interval.drawableBefore.oldNextDrawable : oldFirstStitchDrawable;
          const lastRemoval = interval.drawableAfter ? interval.drawableAfter.oldPreviousDrawable : oldLastStitchDrawable;

          // drawable iteration on the 'old' linked list
          for (let removedDrawable = firstRemoval;; removedDrawable = removedDrawable.oldNextDrawable) {
            this.notePendingRemoval(removedDrawable);
            if (removedDrawable === lastRemoval) {
              break;
            }
          }
        }

        // Blocks totally contained within the change interval are marked as reusable (doesn't include end blocks).
        if (intervalHasOldInternalBlocks(interval, veryFirstBlock, veryLastBlock)) {
          const firstBlock = interval.drawableBefore === null ? backbone.blocks[0] : interval.drawableBefore.parentDrawable.nextBlock;
          const lastBlock = interval.drawableAfter === null ? backbone.blocks[backbone.blocks.length - 1] : interval.drawableAfter.parentDrawable.previousBlock;
          for (let markedBlock = firstBlock;; markedBlock = markedBlock.nextBlock) {
            this.unuseBlock(markedBlock);
            if (markedBlock === lastBlock) {
              break;
            }
          }
        }
      }
    }
    sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.pop();
    sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.GreedyStitcher('phase 2: new linked list');
    sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.push();

    // Don't process the single interval left if we aren't left with any drawables (thus left with no blocks)
    if (firstStitchDrawable) {
      for (interval = firstChangeInterval; interval !== null; interval = interval.nextChangeInterval) {
        this.processInterval(backbone, interval, firstStitchDrawable, lastStitchDrawable);
      }
    }
    sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.pop();
    sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.GreedyStitcher('phase 3: cleanup');
    sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.push();

    // Anything in our 'reusable' blocks array should be removed from our DOM and marked for disposal.
    this.removeUnusedBlocks();

    // Fire off notifyInterval calls to blocks if their boundaries (first/last drawables) have changed. This is
    // a necessary call since we used markBeforeBlock/markAfterBlock to record block boundaries as we went along.
    // We don't want to do this synchronously, because then you could update a block's boundaries multiple times,
    // which may be expensive.
    this.updateBlockIntervals();
    if (firstStitchDrawable === null) {
      // i.e. clear our blocks array
      this.useNoBlocks();
    } else if (this.blockOrderChanged) {
      // Rebuild our blocks array from the linked list format we used for recording our changes (avoids O(n^2)
      // situations since we don't need to do array index lookups while making changes, but only at the end).
      this.processBlockLinkedList(backbone, firstStitchDrawable.pendingParentDrawable, lastStitchDrawable.pendingParentDrawable);

      // Actually reindex the DOM elements of the blocks (changing as necessary)
      this.reindex();
    }

    // required call to the Stitcher interface (see Stitcher.clean()).
    this.clean();

    // release the references we made in this type
    cleanArray(this.reusableBlocks);
    sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.pop();
  }

  /**
   * Does the main bulk of the work for each change interval.
   * @private
   *
   * @param {BackboneDrawable} backbone
   * @param {ChangeInterval} interval
   * @param {Drawable|null} firstStitchDrawable
   * @param {Drawable|null} lastStitchDrawable
   */
  processInterval(backbone, interval, firstStitchDrawable, lastStitchDrawable) {
    assert && assert(interval instanceof ChangeInterval);
    assert && assert(firstStitchDrawable instanceof Drawable, 'We assume we have a non-null remaining section');
    assert && assert(lastStitchDrawable instanceof Drawable, 'We assume we have a non-null remaining section');
    assert && assert(!interval.isEmpty(), 'We now guarantee that the intervals are non-empty');
    sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`interval: ${interval.drawableBefore ? interval.drawableBefore.toString() : 'null'} to ${interval.drawableAfter ? interval.drawableAfter.toString() : 'null'}`);
    sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.push();

    // check if our interval removes everything, we may need a glue
    if (!intervalHasNewInternalDrawables(interval, firstStitchDrawable, lastStitchDrawable)) {
      sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('no current internal drawables in interval');

      // separate if, last condition above would cause issues with the normal operation branch
      if (interval.drawableBefore && interval.drawableAfter) {
        assert && assert(interval.drawableBefore.nextDrawable === interval.drawableAfter);

        // if we removed everything (no new internal drawables), our drawableBefore is open 'after', if our
        // drawableAfter is open 'before' since they are siblings (only one flag needed).
        const isOpen = !hasGapBetweenDrawables(interval.drawableBefore, interval.drawableAfter);

        // handle glue/unglue or any other 'external' changes
        this.processEdgeCases(interval, isOpen, isOpen);
      }
      if (interval.drawableBefore && !isOpenAfter(interval.drawableBefore)) {
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('closed-after collapsed link:');
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.push();
        this.linkAfterDrawable(interval.drawableBefore);
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.pop();
      } else if (interval.drawableAfter && !isOpenBefore(interval.drawableAfter)) {
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('closed-before collapsed link:');
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.push();
        this.linkBeforeDrawable(interval.drawableAfter);
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.pop();
      }
    }
    // otherwise normal operation
    else {
      let drawable = interval.drawableBefore ? interval.drawableBefore.nextDrawable : firstStitchDrawable;

      // if we have any current drawables at all
      let subBlockFirstDrawable = null;
      let matchedBlock = null;
      let isFirst = true;

      // separate our new-drawable linked-list into sub-blocks that we will process individually
      while (true) {
        // eslint-disable-line no-constant-condition
        const nextDrawable = drawable.nextDrawable;
        const isLast = nextDrawable === interval.drawableAfter;
        assert && assert(nextDrawable !== null || isLast, 'If our nextDrawable is null, isLast must be true');
        if (!subBlockFirstDrawable) {
          subBlockFirstDrawable = drawable;
        }

        // See if any of our 'new' drawables were part of a block that we've marked as reusable. If this is the case,
        // we'll greedily try to use this block for matching if possible (ignoring the other potential matches for
        // other drawables after in the same sub-block).
        if (matchedBlock === null && drawable.parentDrawable && !drawable.parentDrawable.used && drawable.backbone === backbone && drawable.parentDrawable.parentDrawable === backbone) {
          matchedBlock = drawable.parentDrawable;
          sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`matching at ${drawable.toString()} with ${matchedBlock}`);
        }
        if (isLast || hasGapBetweenDrawables(drawable, nextDrawable)) {
          if (isFirst) {
            // we'll handle any glue/unglue at the start, so every processSubBlock can be set correctly.
            this.processEdgeCases(interval, isOpenBefore(subBlockFirstDrawable), isOpenAfter(drawable));
          }

          // do the necessary work for each sub-block (adding drawables, linking, using matched blocks)
          this.processSubBlock(interval, subBlockFirstDrawable, drawable, matchedBlock, isFirst, isLast);
          subBlockFirstDrawable = null;
          matchedBlock = null;
          isFirst = false;
        }
        if (isLast) {
          break;
        } else {
          drawable = nextDrawable;
        }
      }
    }
    sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.pop();
  }

  /**
   * @private
   *
   * @param {ChangeInterval} interval
   * @param {Drawable} firstDrawable - for the specific sub-block
   * @param {Drawable} lastDrawable - for the specific sub-block
   * @param {Block} matchedBlock
   * @param {boolean} isFirst
   * @param {boolean} isLast
   */
  processSubBlock(interval, firstDrawable, lastDrawable, matchedBlock, isFirst, isLast) {
    sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`sub-block: ${firstDrawable.toString()} to ${lastDrawable.toString()} ${matchedBlock ? `with matched: ${matchedBlock.toString()}` : 'with no match'}`);
    sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.push();
    const openBefore = isOpenBefore(firstDrawable);
    const openAfter = isOpenAfter(lastDrawable);
    assert && assert(!openBefore || isFirst, 'openBefore implies isFirst');
    assert && assert(!openAfter || isLast, 'openAfter implies isLast');
    assert && assert(!openBefore || !openAfter || firstDrawable.previousDrawable.pendingParentDrawable === lastDrawable.nextDrawable.pendingParentDrawable, 'If we would use both the before and after blocks, make sure any gluing ');

    // if our sub-block gets combined into the previous block, use its block instead of any match-scanned blocks
    if (openBefore) {
      matchedBlock = firstDrawable.previousDrawable.pendingParentDrawable;
      sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`combining into before block: ${matchedBlock.toString()}`);
    }

    // if our sub-block gets combined into the next block, use its block instead of any match-scanned blocks
    if (openAfter) {
      matchedBlock = lastDrawable.nextDrawable.pendingParentDrawable;
      sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`combining into after block: ${matchedBlock.toString()}`);
    }

    // create a block if matchedBlock is null, otherwise mark it as used (if it is in reusableBlocks)
    matchedBlock = this.ensureUsedBlock(matchedBlock, firstDrawable);

    // add internal drawables
    for (let drawable = firstDrawable;; drawable = drawable.nextDrawable) {
      this.notePendingAddition(drawable, matchedBlock);
      if (drawable === lastDrawable) {
        break;
      }
    }

    // link our blocks (and set pending block boundaries) as needed. assumes glue/unglue has already been performed
    if (!openBefore) {
      sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('closed-before link:');
      sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.push();
      this.linkBeforeDrawable(firstDrawable);
      sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.pop();
    }
    if (isLast && !openAfter) {
      sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('last closed-after link:');
      sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.push();
      this.linkAfterDrawable(lastDrawable);
      sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.pop();
    }
    sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.pop();
  }

  /**
   * firstDrawable and lastDrawable refer to the specific sub-block (if it exists), isLast refers to if it's the
   * last sub-block
   * @private
   *
   * @param {ChangeInterval} interval
   * @param {boolean} openBefore
   * @param {boolean} openAfter
   */
  processEdgeCases(interval, openBefore, openAfter) {
    // this test passes for glue and unglue cases
    if (interval.drawableBefore !== null && interval.drawableAfter !== null) {
      const beforeBlock = interval.drawableBefore.pendingParentDrawable;
      const afterBlock = interval.drawableAfter.pendingParentDrawable;
      const nextAfterBlock = interval.nextChangeInterval && interval.nextChangeInterval.drawableAfter ? interval.nextChangeInterval.drawableAfter.pendingParentDrawable : null;

      // Since we want to remove any afterBlock at the end of its run if we don't have blockWasAdded set, this check
      // is necessary to see if we have already used this specific block.
      // Otherwise, we would remove our (potentially very-first) block when it has already been used externally.
      if (beforeBlock === afterBlock) {
        this.blockWasAdded = true;
      }
      sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`edge case: ${openBefore ? 'open-before ' : ''}${openAfter ? 'open-after ' : ''}${beforeBlock.toString()} to ${afterBlock.toString()}`);
      sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.push();

      // deciding what new block should be used for the external group of drawables after our change interval
      let newAfterBlock;
      // if we have no gaps/boundaries, we should not have two different blocks
      if (openBefore && openAfter) {
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`glue using ${beforeBlock.toString()}`);
        newAfterBlock = beforeBlock;
      } else {
        // if we can't use our afterBlock, since it was used before, or wouldn't create a split
        if (this.blockWasAdded || beforeBlock === afterBlock) {
          sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('split with fresh block');
          // for simplicity right now, we always create a fresh block (to avoid messing up reused blocks) after, and
          // always change everything after (instead of before), so we don't have to jump across multiple previous
          // change intervals
          newAfterBlock = this.createBlock(interval.drawableAfter.renderer, interval.drawableAfter);
          this.blockOrderChanged = true; // needs to be done on block creation
        }
        // otherwise we can use our after block
        else {
          sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`split with same afterBlock ${afterBlock.toString()}`);
          newAfterBlock = afterBlock;
        }
      }

      // If we didn't change our block, mark it as added so we don't remove it.
      if (afterBlock === newAfterBlock) {
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('no externals change here (blockWasAdded => true)');
        this.blockWasAdded = true;
      }
      // Otherwise if we changed the block, move over only the external drawables between this interval and the next
      // interval.
      else {
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('moving externals');
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.push();
        this.changeExternals(interval, newAfterBlock);
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.pop();
      }

      // If the next interval's old afterBlock isn't the same as our old afterBlock, we need to make our decision
      // about whether to mark our old afterBlock as reusable, or whether it was used.
      if (nextAfterBlock !== afterBlock) {
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('end of afterBlock stretch');

        // If our block wasn't added yet, it wouldn't ever be added later naturally (so we mark it as reusable).
        if (!this.blockWasAdded) {
          sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`unusing ${afterBlock.toString()}`);
          this.unuseBlock(afterBlock);
        }
        this.blockWasAdded = false;
      }
      sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.pop();
    }
  }

  /**
   * Marks all 'external' drawables from the end (drawableAfter) of the {ChangeInterval} interval to either the end
   * of their old block or the drawableAfter of the next interval (whichever is sooner) as being needed to be moved to
   * our {Block} newBlock. The next processInterval will both handle the drawables inside that next interval, and
   * will be responsible for the 'external' drawables after that.
   * @private
   *
   * @param {ChangeInterval} interval
   * @param {Block} newBlock
   */
  changeExternals(interval, newBlock) {
    const lastExternalDrawable = getLastCompatibleExternalDrawable(interval);
    this.notePendingMoves(newBlock, interval.drawableAfter, lastExternalDrawable);

    // If we didn't make it all the way to the next change interval's drawableBefore (there was another block
    // starting before the next interval), we need to link our new block to that next block.
    if (!interval.nextChangeInterval || interval.nextChangeInterval.drawableBefore !== lastExternalDrawable) {
      this.linkAfterDrawable(lastExternalDrawable);
    }
  }

  /**
   * Given a {Drawable} firstDrawable and {Drawable} lastDrawable, we mark all drawables in-between (inclusively) as
   * needing to be moved to our {Block} newBlock. This should only be called on external drawables, and should only
   * occur as needed with glue/unglue cases in the stitch.
   * @private
   *
   * @param {Block} newBlock
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   */
  notePendingMoves(newBlock, firstDrawable, lastDrawable) {
    for (let drawable = firstDrawable;; drawable = drawable.nextDrawable) {
      assert && assert(!drawable.pendingAddition && !drawable.pendingRemoval, 'Moved drawables should be thought of as unchanged, and thus have nothing pending yet');
      this.notePendingMove(drawable, newBlock);
      if (drawable === lastDrawable) {
        break;
      }
    }
  }

  /**
   * If there is no currentBlock, we create one to match. Otherwise if the currentBlock is marked as 'unused' (i.e.
   * it is in the reusableBlocks array), we mark it as used so it won't me matched elsewhere.
   * @private
   *
   * @param {Block} currentBlock
   * @param {Drawable} someIncludedDrawable
   * @returns {Block}
   */
  ensureUsedBlock(currentBlock, someIncludedDrawable) {
    // if we have a matched block (or started with one)
    if (currentBlock) {
      sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`using existing block: ${currentBlock.toString()}`);
      // since our currentBlock may be from reusableBlocks, we will need to mark it as used now.
      if (!currentBlock.used) {
        this.useBlock(currentBlock);
      }
    } else {
      // need to create one
      sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('searching for block');
      currentBlock = this.getBlockForRenderer(someIncludedDrawable.renderer, someIncludedDrawable);
    }
    return currentBlock;
  }

  /**
   * Attemps to find an unused block with the same renderer if possible, otherwise creates a
   * compatible block.
   * @private
   *
   * NOTE: this doesn't handle hooking up the block linked list
   *
   * @param {number} renderer
   * @param {Drawable} drawable
   * @returns {Block}
   */
  getBlockForRenderer(renderer, drawable) {
    let block;

    // If it's not a DOM block, scan our reusable blocks for one with the same renderer.
    // If it's DOM, it should be processed correctly in reusableBlocks, and will never reach this point.
    if (!Renderer.isDOM(renderer)) {
      // backwards scan, hopefully it's faster?
      for (let i = this.reusableBlocks.length - 1; i >= 0; i--) {
        const tmpBlock = this.reusableBlocks[i];
        assert && assert(!tmpBlock.used);
        if (tmpBlock.renderer === renderer) {
          this.useBlockAtIndex(tmpBlock, i);
          block = tmpBlock;
          break;
        }
      }
    }
    if (!block) {
      // Didn't find it in our reusable blocks, create a fresh one from scratch
      block = this.createBlock(renderer, drawable);
    }
    this.blockOrderChanged = true; // we created a new block, this will always happen

    return block;
  }

  /**
   * Marks a block as unused, moving it to the reusableBlocks array.
   * @private
   *
   * @param {Block} block
   */
  unuseBlock(block) {
    if (block.used) {
      sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`unusing block: ${block.toString()}`);
      block.used = false; // mark it as unused until we pull it out (so we can reuse, or quickly identify)
      this.reusableBlocks.push(block);
    } else {
      sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`not using already-unused block: ${block.toString()}`);
    }
  }

  /**
   * Removes a block from the list of reused blocks (done during matching)
   * @private
   *
   * @param {Block} block
   */
  useBlock(block) {
    this.useBlockAtIndex(block, _.indexOf(this.reusableBlocks, block));
  }

  /**
   * @private
   *
   * @param {Block} block
   * @param {number} index
   */
  useBlockAtIndex(block, index) {
    sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`using reusable block: ${block.toString()} with renderer: ${block.renderer}`);
    assert && assert(index >= 0 && this.reusableBlocks[index] === block, `bad index for useBlockAtIndex: ${index}`);
    assert && assert(!block.used, 'Should be called on an unused (reusable) block');

    // remove it
    this.reusableBlocks.splice(index, 1);

    // mark it as used
    block.used = true;
  }

  /**
   * Removes all of our unused blocks from our domElement, and marks them for disposal.
   * @private
   */
  removeUnusedBlocks() {
    sceneryLog && sceneryLog.GreedyStitcher && this.reusableBlocks.length && sceneryLog.GreedyStitcher('removeUnusedBlocks');
    sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.push();
    while (this.reusableBlocks.length) {
      const block = this.reusableBlocks.pop();
      this.markBlockForDisposal(block);
      this.blockOrderChanged = true;
    }
    sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.pop();
  }

  /**
   * Links blocks before a drawable (whether it is the first drawable or not)
   * @private
   *
   * @param {Drawable} drawable
   */
  linkBeforeDrawable(drawable) {
    sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`link before ${drawable.toString()}`);
    const beforeDrawable = drawable.previousDrawable;
    this.linkBlocks(beforeDrawable ? beforeDrawable.pendingParentDrawable : null, drawable.pendingParentDrawable, beforeDrawable, drawable);
  }

  /**
   * links blocks after a drawable (whether it is the last drawable or not)
   * @private
   *
   * @param {Drawable} drawable
   */
  linkAfterDrawable(drawable) {
    sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`link after ${drawable.toString()}`);
    const afterDrawable = drawable.nextDrawable;
    this.linkBlocks(drawable.pendingParentDrawable, afterDrawable ? afterDrawable.pendingParentDrawable : null, drawable, afterDrawable);
  }

  /**
   * Called to mark a boundary between blocks, or at the end of our list of blocks (one block/drawable pair being
   * null notes that it is the start/end, and there is no previous/next block).
   * This updates the block linked-list as necessary (noting changes when they occur) so that we can rebuild an array
   * at the end of the stitch, avoiding O(n^2) issues if we were to do block-array-index lookups during linking
   * operations (this results in linear time for blocks).
   * It also marks block boundaries as dirty when necessary, so that we can make one pass through with
   * updateBlockIntervals() that updates all of the block's boundaries (avoiding more than one update per block per
   * frame).
   * @private
   *
   * @param {Block|null} beforeBlock
   * @param {Block|null} afterBlock
   * @param {Drawable|null} beforeDrawable
   * @param {Drawable|null} afterDrawable
   */
  linkBlocks(beforeBlock, afterBlock, beforeDrawable, afterDrawable) {
    sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.GreedyStitcher(`linking blocks: ${beforeBlock ? `${beforeBlock.toString()} (${beforeDrawable.toString()})` : 'null'} to ${afterBlock ? `${afterBlock.toString()} (${afterDrawable.toString()})` : 'null'}`);
    sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.push();
    assert && assert(beforeBlock === null && beforeDrawable === null || beforeBlock instanceof Block && beforeDrawable instanceof Drawable);
    assert && assert(afterBlock === null && afterDrawable === null || afterBlock instanceof Block && afterDrawable instanceof Drawable);
    if (beforeBlock) {
      if (beforeBlock.nextBlock !== afterBlock) {
        this.blockOrderChanged = true;

        // disconnect from the previously-connected block (if any)
        if (beforeBlock.nextBlock) {
          beforeBlock.nextBlock.previousBlock = null;
        }
        beforeBlock.nextBlock = afterBlock;
      }
      this.markAfterBlock(beforeBlock, beforeDrawable);
    }
    if (afterBlock) {
      if (afterBlock.previousBlock !== beforeBlock) {
        this.blockOrderChanged = true;

        // disconnect from the previously-connected block (if any)
        if (afterBlock.previousBlock) {
          afterBlock.previousBlock.nextBlock = null;
        }
        afterBlock.previousBlock = beforeBlock;
      }
      this.markBeforeBlock(afterBlock, afterDrawable);
    }
    sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.pop();
  }

  /**
   * Rebuilds the backbone's block array from our linked-list data.
   * @private
   *
   * @param {BackboneDrawable} backbone
   * @param {Block|null} firstBlock
   * @param {Block|null} lastBlock
   */
  processBlockLinkedList(backbone, firstBlock, lastBlock) {
    // for now, just clear out the array first
    while (backbone.blocks.length) {
      backbone.blocks.pop();
    }
    sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.GreedyStitcher(`processBlockLinkedList: ${firstBlock.toString()} to ${lastBlock.toString()}`);
    sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.push();

    // leave the array as-is if there are no blocks
    if (firstBlock) {
      // rewrite it starting with the first block
      for (let block = firstBlock;; block = block.nextBlock) {
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.GreedyStitcher(block.toString());
        backbone.blocks.push(block);
        if (block === lastBlock) {
          break;
        }
      }
    }
    sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.pop();
  }
}
scenery.register('GreedyStitcher', GreedyStitcher);
export default GreedyStitcher;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjbGVhbkFycmF5IiwiQmxvY2siLCJDaGFuZ2VJbnRlcnZhbCIsIkRyYXdhYmxlIiwiUmVuZGVyZXIiLCJzY2VuZXJ5IiwiU3RpdGNoZXIiLCJoYXNHYXBCZXR3ZWVuRHJhd2FibGVzIiwiYSIsImIiLCJyZW5kZXJlciIsImlzRE9NIiwiaXNPcGVuQmVmb3JlIiwiZHJhd2FibGUiLCJwcmV2aW91c0RyYXdhYmxlIiwiaXNPcGVuQWZ0ZXIiLCJuZXh0RHJhd2FibGUiLCJpbnRlcnZhbEhhc05ld0ludGVybmFsRHJhd2FibGVzIiwiaW50ZXJ2YWwiLCJmaXJzdFN0aXRjaERyYXdhYmxlIiwibGFzdFN0aXRjaERyYXdhYmxlIiwiZHJhd2FibGVCZWZvcmUiLCJkcmF3YWJsZUFmdGVyIiwiaW50ZXJ2YWxIYXNPbGRJbnRlcm5hbERyYXdhYmxlcyIsIm9sZEZpcnN0U3RpdGNoRHJhd2FibGUiLCJvbGRMYXN0U3RpdGNoRHJhd2FibGUiLCJvbGROZXh0RHJhd2FibGUiLCJvbGRQcmV2aW91c0RyYXdhYmxlIiwiaW50ZXJ2YWxIYXNPbGRJbnRlcm5hbEJsb2NrcyIsImZpcnN0U3RpdGNoQmxvY2siLCJsYXN0U3RpdGNoQmxvY2siLCJiZWZvcmVCbG9jayIsInBhcmVudERyYXdhYmxlIiwiYWZ0ZXJCbG9jayIsIm5leHRCbG9jayIsInByZXZpb3VzQmxvY2siLCJnZXRMYXN0Q29tcGF0aWJsZUV4dGVybmFsRHJhd2FibGUiLCJmaXJzdERyYXdhYmxlIiwiY3V0b2ZmRHJhd2FibGUiLCJuZXh0Q2hhbmdlSW50ZXJ2YWwiLCJHcmVlZHlTdGl0Y2hlciIsInN0aXRjaCIsImJhY2tib25lIiwiZmlyc3RDaGFuZ2VJbnRlcnZhbCIsImxhc3RDaGFuZ2VJbnRlcnZhbCIsImluaXRpYWxpemUiLCJibG9ja09yZGVyQ2hhbmdlZCIsInJldXNhYmxlQmxvY2tzIiwiYmxvY2tXYXNBZGRlZCIsInJlY29yZEJhY2tib25lQm91bmRhcmllcyIsInNjZW5lcnlMb2ciLCJwdXNoIiwiYmxvY2tzIiwibGVuZ3RoIiwidmVyeUZpcnN0QmxvY2siLCJ2ZXJ5TGFzdEJsb2NrIiwiYXNzZXJ0IiwiaXNFbXB0eSIsImZpcnN0UmVtb3ZhbCIsImxhc3RSZW1vdmFsIiwicmVtb3ZlZERyYXdhYmxlIiwibm90ZVBlbmRpbmdSZW1vdmFsIiwiZmlyc3RCbG9jayIsImxhc3RCbG9jayIsIm1hcmtlZEJsb2NrIiwidW51c2VCbG9jayIsInBvcCIsInByb2Nlc3NJbnRlcnZhbCIsInJlbW92ZVVudXNlZEJsb2NrcyIsInVwZGF0ZUJsb2NrSW50ZXJ2YWxzIiwidXNlTm9CbG9ja3MiLCJwcm9jZXNzQmxvY2tMaW5rZWRMaXN0IiwicGVuZGluZ1BhcmVudERyYXdhYmxlIiwicmVpbmRleCIsImNsZWFuIiwiR3JlZWR5VmVyYm9zZSIsInRvU3RyaW5nIiwiaXNPcGVuIiwicHJvY2Vzc0VkZ2VDYXNlcyIsImxpbmtBZnRlckRyYXdhYmxlIiwibGlua0JlZm9yZURyYXdhYmxlIiwic3ViQmxvY2tGaXJzdERyYXdhYmxlIiwibWF0Y2hlZEJsb2NrIiwiaXNGaXJzdCIsImlzTGFzdCIsInVzZWQiLCJwcm9jZXNzU3ViQmxvY2siLCJsYXN0RHJhd2FibGUiLCJvcGVuQmVmb3JlIiwib3BlbkFmdGVyIiwiZW5zdXJlVXNlZEJsb2NrIiwibm90ZVBlbmRpbmdBZGRpdGlvbiIsIm5leHRBZnRlckJsb2NrIiwibmV3QWZ0ZXJCbG9jayIsImNyZWF0ZUJsb2NrIiwiY2hhbmdlRXh0ZXJuYWxzIiwibmV3QmxvY2siLCJsYXN0RXh0ZXJuYWxEcmF3YWJsZSIsIm5vdGVQZW5kaW5nTW92ZXMiLCJwZW5kaW5nQWRkaXRpb24iLCJwZW5kaW5nUmVtb3ZhbCIsIm5vdGVQZW5kaW5nTW92ZSIsImN1cnJlbnRCbG9jayIsInNvbWVJbmNsdWRlZERyYXdhYmxlIiwidXNlQmxvY2siLCJnZXRCbG9ja0ZvclJlbmRlcmVyIiwiYmxvY2siLCJpIiwidG1wQmxvY2siLCJ1c2VCbG9ja0F0SW5kZXgiLCJfIiwiaW5kZXhPZiIsImluZGV4Iiwic3BsaWNlIiwibWFya0Jsb2NrRm9yRGlzcG9zYWwiLCJiZWZvcmVEcmF3YWJsZSIsImxpbmtCbG9ja3MiLCJhZnRlckRyYXdhYmxlIiwibWFya0FmdGVyQmxvY2siLCJtYXJrQmVmb3JlQmxvY2siLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdyZWVkeVN0aXRjaGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFN0aXRjaGVyIHRoYXQgb25seSByZWJ1aWxkcyB0aGUgcGFydHMgbmVjZXNzYXJ5LCBhbmQgYXR0ZW1wdHMgZ3JlZWR5IGJsb2NrIG1hdGNoaW5nIGFzIGFuIG9wdGltaXphdGlvbi5cclxuICpcclxuICogR2l2ZW4gYSBsaXN0IG9mIGNoYW5nZSBpbnRlcnZhbHMsIG91ciBncmVlZHkgc3RpdGNoZXIgYnJlYWtzIGl0IGRvd24gaW50byAnc3ViLWJsb2NrcycgY29uc2lzdGluZyBvZlxyXG4gKiBkcmF3YWJsZXMgdGhhdCBhcmUgJ2ludGVybmFsJyB0byB0aGUgY2hhbmdlIGludGVydmFsIHRoYXQgYWxsIGhhdmUgdGhlIHNhbWUgcmVuZGVyZXIsIGFuZCBoYW5kbGVzIHRoZVxyXG4gKiBnbHVlL3VuZ2x1ZS9tYXRjaGluZyBzaXR1YXRpb25zIGluIGEgZ3JlZWR5IHdheSBieSBhbHdheXMgdXNpbmcgdGhlIGZpcnN0IHBvc3NpYmxlIChhbGxvd2luZyBvbmx5IG9uZSBzd2VlcFxyXG4gKiBpbnN0ZWFkIG9mIG11bHRpcGxlIG9uZXMgb3ZlciB0aGUgZHJhd2FibGUgbGlua2VkIGxpc3QgZm9yIHRoaXMgcHJvY2VzcykuXHJcbiAqXHJcbiAqIENvbmNlcHR1YWxseSwgd2UgYnJlYWsgZG93biBkcmF3YWJsZXMgaW50byBncm91cHMgdGhhdCBhcmUgJ2ludGVybmFsJyB0byBlYWNoIGNoYW5nZSBpbnRlcnZhbCAoaW5zaWRlLCBub3RcclxuICogaW5jbHVkaW5nIHRoZSB1bi1jaGFuZ2VkIGVuZHMpLCBhbmQgJ2V4dGVybmFsJyAodGhhdCBhcmUgbm90IGludGVybmFsIHRvIGFueSBpbnRlcnZhbHMpLlxyXG4gKlxyXG4gKiBGb3IgZWFjaCBpbnRlcnZhbCwgd2UgZmlyc3QgbWFrZSBzdXJlIHRoYXQgdGhlIG5leHQgJ2V4dGVybmFsJyBncm91cCBvZiBkcmF3YWJsZXMgaGFzIHRoZSBwcm9wZXIgYmxvY2tzIChmb3JcclxuICogaW5zdGFuY2UsIHRoaXMgY2FuIGNoYW5nZSB3aXRoIGEgZ2x1ZS91bmdsdWUgb3BlcmF0aW9uLCB3aXRoIHByb2Nlc3NFZGdlQ2FzZXMpLCB0aGVuIHByb2NlZWQgdG8gYnJlYWsgdGhlICdpbnRlcm5hbCdcclxuICogZHJhd2FibGVzIGludG8gc3ViLWJsb2NrcyBhbmQgcHJvY2VzcyB0aG9zZSB3aXRoIHByb2Nlc3NTdWJCbG9jay5cclxuICpcclxuICogT3VyIHN0aXRjaGVyIGhhcyBhIGxpc3Qgb2YgYmxvY2tzIG5vdGVkIGFzICdyZXVzYWJsZScgdGhhdCB3ZSB1c2UgZm9yIHR3byBwdXJwb3NlczpcclxuICogICAxLiBTbyB0aGF0IHdlIGNhbiBzaGlmdCBibG9ja3MgdG8gd2hlcmUgdGhleSBhcmUgbmVlZGVkLCBpbnN0ZWFkIG9mIHJlbW92aW5nIChlLmcuKSBhbiBTVkcgYmxvY2sgYW5kXHJcbiAqICAgICAgY3JlYXRpbmcgYW5vdGhlci5cclxuICogICAyLiBTbyB0aGF0IGJsb2NrcyB0aGF0IGFyZSB1bnVzZWQgYXQgdGhlIGVuZCBvZiBvdXIgc3RpdGNoIGNhbiBiZSByZW1vdmVkLCBhbmQgbWFya2VkIGZvciBkaXNwb3NhbC5cclxuICogQXQgdGhlIHN0YXJ0IG9mIHRoZSBzdGl0Y2gsIHdlIG1hcmsgY29tcGxldGVseSAnaW50ZXJuYWwnIGJsb2NrcyBhcyByZXVzYWJsZSwgc28gdGhleSBjYW4gYmUgc2hpZnRlZCBhcm91bmQgYXNcclxuICogbmVjZXNzYXJ5ICh1c2VkIGluIGEgZ3JlZWR5IHdheSB3aGljaCBtYXkgbm90IGJlIG9wdGltYWwpLiBJdCdzIGFsc28gcG9zc2libGUgZHVyaW5nIGxhdGVyIHBoYXNlcyBmb3IgYmxvY2tzIHRoYXRcclxuICogYWxzbyBjb250YWluICdleHRlcm5hbCcgZHJhd2FibGVzIHRvIGJlIG1hcmtlZCBhcyByZXVzYWJsZSwgZHVlIHRvIGdsdWUgY2FzZXMgd2hlcmUgYmVmb3JlIHdlIG5lZWRlZCBtdWx0aXBsZVxyXG4gKiBibG9ja3MgYW5kIG5vdyB3ZSBvbmx5IG5lZWQgb25lLlxyXG4gKlxyXG4gKiBXZSBhbHNvIHVzZSBhIGxpbmtlZC1saXN0IG9mIGJsb2NrcyBkdXJpbmcgc3RpdGNoIG9wZXJhdGlvbnMgKHRoYXQgdGhlbiByZS1idWlsZHMgYW4gYXJyYXkgb2YgYmxvY2tzIG9uIGFueSBjaGFuZ2VzXHJcbiAqIGFmdGVyIGFsbCBzdGl0Y2hpbmcgaXMgZG9uZSkgZm9yIHNpbXBsaWNpdHksIGFuZCB0byBhdm9pZCBPKG5eMikgY2FzZXMgdGhhdCB3b3VsZCByZXN1bHQgZnJvbSBoYXZpbmcgdG8gbG9vayB1cFxyXG4gKiBpbmRpY2VzIGluIHRoZSBibG9jayBhcnJheSBkdXJpbmcgc3RpdGNoaW5nLlxyXG4gKlxyXG4gKiBOT1RFOiBTdGl0Y2hlciBpbnN0YW5jZXMgbWF5IGJlIHJldXNlZCBtYW55IHRpbWVzLCBldmVuIHdpdGggZGlmZmVyZW50IGJhY2tib25lcy4gSXQgc2hvdWxkIGFsd2F5cyByZWxlYXNlIGFueVxyXG4gKiBvYmplY3QgcmVmZXJlbmNlcyB0aGF0IGl0IGhlbGQgYWZ0ZXIgdXNhZ2UuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XHJcbmltcG9ydCB7IEJsb2NrLCBDaGFuZ2VJbnRlcnZhbCwgRHJhd2FibGUsIFJlbmRlcmVyLCBzY2VuZXJ5LCBTdGl0Y2hlciB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5cclxuLy8gUmV0dXJucyB3aGV0aGVyIHRoZSBjb25zZWN1dGl2ZSB7RHJhd2FibGV9cyAnYScgYW5kICdiJyBzaG91bGQgYmUgcHV0IGludG8gc2VwYXJhdGUgYmxvY2tzXHJcbmZ1bmN0aW9uIGhhc0dhcEJldHdlZW5EcmF3YWJsZXMoIGEsIGIgKSB7XHJcbiAgcmV0dXJuIGEucmVuZGVyZXIgIT09IGIucmVuZGVyZXIgfHwgUmVuZGVyZXIuaXNET00oIGEucmVuZGVyZXIgKSB8fCBSZW5kZXJlci5pc0RPTSggYi5yZW5kZXJlciApO1xyXG59XHJcblxyXG4vLyBXaGV0aGVyIHRoZSBkcmF3YWJsZSBhbmQgaXRzIHByZXZpb3VzIHNpYmxpbmcgc2hvdWxkIGJlIGluIHRoZSBzYW1lIGJsb2NrLiBXaWxsIGJlIGZhbHNlIGlmIHRoZXJlIGlzIG5vIHNpYmxpbmdcclxuZnVuY3Rpb24gaXNPcGVuQmVmb3JlKCBkcmF3YWJsZSApIHtcclxuICByZXR1cm4gZHJhd2FibGUucHJldmlvdXNEcmF3YWJsZSAhPT0gbnVsbCAmJiAhaGFzR2FwQmV0d2VlbkRyYXdhYmxlcyggZHJhd2FibGUucHJldmlvdXNEcmF3YWJsZSwgZHJhd2FibGUgKTtcclxufVxyXG5cclxuLy8gV2hldGhlciB0aGUgZHJhd2FibGUgYW5kIGl0cyBuZXh0IHNpYmxpbmcgc2hvdWxkIGJlIGluIHRoZSBzYW1lIGJsb2NrLiBXaWxsIGJlIGZhbHNlIGlmIHRoZXJlIGlzIG5vIHNpYmxpbmdcclxuZnVuY3Rpb24gaXNPcGVuQWZ0ZXIoIGRyYXdhYmxlICkge1xyXG4gIHJldHVybiBkcmF3YWJsZS5uZXh0RHJhd2FibGUgIT09IG51bGwgJiYgIWhhc0dhcEJldHdlZW5EcmF3YWJsZXMoIGRyYXdhYmxlLCBkcmF3YWJsZS5uZXh0RHJhd2FibGUgKTtcclxufVxyXG5cclxuLy8gSWYgdGhlIGNoYW5nZSBpbnRlcnZhbCB3aWxsIGNvbnRhaW4gYW55IG5ldyAoYWRkZWQpIGRyYXdhYmxlc1xyXG5mdW5jdGlvbiBpbnRlcnZhbEhhc05ld0ludGVybmFsRHJhd2FibGVzKCBpbnRlcnZhbCwgZmlyc3RTdGl0Y2hEcmF3YWJsZSwgbGFzdFN0aXRjaERyYXdhYmxlICkge1xyXG4gIGlmICggaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgKSB7XHJcbiAgICByZXR1cm4gaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUubmV4dERyYXdhYmxlICE9PSBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyOyAvLyBPSyBmb3IgYWZ0ZXIgdG8gYmUgbnVsbFxyXG4gIH1cclxuICBlbHNlIGlmICggaW50ZXJ2YWwuZHJhd2FibGVBZnRlciApIHtcclxuICAgIHJldHVybiBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyLnByZXZpb3VzRHJhd2FibGUgIT09IGludGVydmFsLmRyYXdhYmxlQmVmb3JlOyAvLyBPSyBmb3IgYmVmb3JlIHRvIGJlIG51bGxcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICByZXR1cm4gZmlyc3RTdGl0Y2hEcmF3YWJsZSAhPT0gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbi8vIElmIHRoZSBjaGFuZ2UgaW50ZXJ2YWwgY29udGFpbmVkIGFueSBkcmF3YWJsZXMgdGhhdCBhcmUgdG8gYmUgcmVtb3ZlZFxyXG5mdW5jdGlvbiBpbnRlcnZhbEhhc09sZEludGVybmFsRHJhd2FibGVzKCBpbnRlcnZhbCwgb2xkRmlyc3RTdGl0Y2hEcmF3YWJsZSwgb2xkTGFzdFN0aXRjaERyYXdhYmxlICkge1xyXG4gIGlmICggaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgKSB7XHJcbiAgICByZXR1cm4gaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUub2xkTmV4dERyYXdhYmxlICE9PSBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyOyAvLyBPSyBmb3IgYWZ0ZXIgdG8gYmUgbnVsbFxyXG4gIH1cclxuICBlbHNlIGlmICggaW50ZXJ2YWwuZHJhd2FibGVBZnRlciApIHtcclxuICAgIHJldHVybiBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyLm9sZFByZXZpb3VzRHJhd2FibGUgIT09IGludGVydmFsLmRyYXdhYmxlQmVmb3JlOyAvLyBPSyBmb3IgYmVmb3JlIHRvIGJlIG51bGxcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICByZXR1cm4gb2xkRmlyc3RTdGl0Y2hEcmF3YWJsZSAhPT0gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbi8vIFdoZXRoZXIgdGhlcmUgYXJlIGJsb2NrcyB0aGF0IGNvbnNpc3Qgb2YgZHJhd2FibGVzIHRoYXQgYXJlIEFMTCBpbnRlcm5hbCB0byB0aGUge0NoYW5nZUludGVydmFsfSBpbnRlcnZhbC5cclxuZnVuY3Rpb24gaW50ZXJ2YWxIYXNPbGRJbnRlcm5hbEJsb2NrcyggaW50ZXJ2YWwsIGZpcnN0U3RpdGNoQmxvY2ssIGxhc3RTdGl0Y2hCbG9jayApIHtcclxuICBjb25zdCBiZWZvcmVCbG9jayA9IGludGVydmFsLmRyYXdhYmxlQmVmb3JlID8gaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUucGFyZW50RHJhd2FibGUgOiBudWxsO1xyXG4gIGNvbnN0IGFmdGVyQmxvY2sgPSBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyID8gaW50ZXJ2YWwuZHJhd2FibGVBZnRlci5wYXJlbnREcmF3YWJsZSA6IG51bGw7XHJcblxyXG4gIGlmICggYmVmb3JlQmxvY2sgJiYgYWZ0ZXJCbG9jayAmJiBiZWZvcmVCbG9jayA9PT0gYWZ0ZXJCbG9jayApIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGlmICggYmVmb3JlQmxvY2sgKSB7XHJcbiAgICByZXR1cm4gYmVmb3JlQmxvY2submV4dEJsb2NrICE9PSBhZnRlckJsb2NrOyAvLyBPSyBmb3IgYWZ0ZXIgdG8gYmUgbnVsbFxyXG4gIH1cclxuICBlbHNlIGlmICggYWZ0ZXJCbG9jayApIHtcclxuICAgIHJldHVybiBhZnRlckJsb2NrLnByZXZpb3VzQmxvY2sgIT09IGJlZm9yZUJsb2NrOyAvLyBPSyBmb3IgYmVmb3JlIHRvIGJlIG51bGxcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICByZXR1cm4gZmlyc3RTdGl0Y2hCbG9jayAhPT0gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGaW5kcyB0aGUgZnVydGhlc3QgZXh0ZXJuYWwgZHJhd2FibGUgdGhhdDpcclxuICogKGEpIEJlZm9yZSB0aGUgbmV4dCBjaGFuZ2UgaW50ZXJ2YWwgKGlmIHdlIGhhdmUgYSBuZXh0IGNoYW5nZSBpbnRlcnZhbClcclxuICogKGIpIEhhcyB0aGUgc2FtZSByZW5kZXJlciBhcyB0aGUgaW50ZXJ2YWwncyBkcmF3YWJsZUFmdGVyXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRMYXN0Q29tcGF0aWJsZUV4dGVybmFsRHJhd2FibGUoIGludGVydmFsICkge1xyXG4gIGNvbnN0IGZpcnN0RHJhd2FibGUgPSBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyO1xyXG5cclxuICBpZiAoIGZpcnN0RHJhd2FibGUgKSB7XHJcbiAgICBjb25zdCByZW5kZXJlciA9IGZpcnN0RHJhd2FibGUucmVuZGVyZXI7XHJcblxyXG4gICAgLy8gd2Ugc3RvcCBvdXIgc2VhcmNoIGJlZm9yZSB3ZSByZWFjaCB0aGlzIChudWxsIGlzIGFjY2VwdGFibGUpLCBlbnN1cmluZyB3ZSBkb24ndCBnbyBpbnRvIHRoZSBuZXh0IGNoYW5nZSBpbnRlcnZhbFxyXG4gICAgY29uc3QgY3V0b2ZmRHJhd2FibGUgPSBpbnRlcnZhbC5uZXh0Q2hhbmdlSW50ZXJ2YWwgPyBpbnRlcnZhbC5uZXh0Q2hhbmdlSW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUubmV4dERyYXdhYmxlIDogbnVsbDtcclxuXHJcbiAgICBsZXQgZHJhd2FibGUgPSBmaXJzdERyYXdhYmxlO1xyXG5cclxuICAgIHdoaWxlICggdHJ1ZSApIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zdGFudC1jb25kaXRpb25cclxuICAgICAgY29uc3QgbmV4dERyYXdhYmxlID0gZHJhd2FibGUubmV4dERyYXdhYmxlO1xyXG5cclxuICAgICAgLy8gZmlyc3QgY29tcGFyaXNvbiBhbHNvIGRvZXMgbnVsbCBjaGVjayB3aGVuIG5lY2Vzc2FyeVxyXG4gICAgICBpZiAoIG5leHREcmF3YWJsZSAhPT0gY3V0b2ZmRHJhd2FibGUgJiYgbmV4dERyYXdhYmxlLnJlbmRlcmVyID09PSByZW5kZXJlciApIHtcclxuICAgICAgICBkcmF3YWJsZSA9IG5leHREcmF3YWJsZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkcmF3YWJsZTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICByZXR1cm4gbnVsbDsgLy8gd2l0aCBubyBkcmF3YWJsZUFmdGVyLCB3ZSBkb24ndCBoYXZlIGFueSBleHRlcm5hbCBkcmF3YWJsZXMgYWZ0ZXIgb3VyIGludGVydmFsXHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBHcmVlZHlTdGl0Y2hlciBleHRlbmRzIFN0aXRjaGVyIHtcclxuICAvKipcclxuICAgKiBNYWluIHN0aXRjaCBlbnRyeSBwb2ludCwgY2FsbGVkIGRpcmVjdGx5IGZyb20gdGhlIGJhY2tib25lIG9yIGNhY2hlLiBXZSBhcmUgbW9kaWZ5aW5nIG91ciBiYWNrYm9uZSdzIGJsb2NrcyBhbmRcclxuICAgKiB0aGVpciBhdHRhY2hlZCBkcmF3YWJsZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhlIGNoYW5nZS1pbnRlcnZhbCBwYWlyIGRlbm90ZXMgYSBsaW5rZWQtbGlzdCBvZiBjaGFuZ2UgaW50ZXJ2YWxzIHRoYXQgd2Ugd2lsbCBuZWVkIHRvIHN0aXRjaCBhY3Jvc3MgKHRoZXlcclxuICAgKiBjb250YWluIGRyYXdhYmxlcyB0aGF0IG5lZWQgdG8gYmUgcmVtb3ZlZCBhbmQgYWRkZWQsIGFuZCBpdCBtYXkgYWZmZWN0IGhvdyB3ZSBsYXkgb3V0IGJsb2NrcyBpbiB0aGUgc3RhY2tpbmdcclxuICAgKiBvcmRlcikuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JhY2tib25lRHJhd2FibGV9IGJhY2tib25lXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZXxudWxsfSBmaXJzdFN0aXRjaERyYXdhYmxlXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZXxudWxsfSBsYXN0U3RpdGNoRHJhd2FibGVcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfG51bGx9IG9sZEZpcnN0U3RpdGNoRHJhd2FibGVcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfG51bGx9IG9sZExhc3RTdGl0Y2hEcmF3YWJsZVxyXG4gICAqIEBwYXJhbSB7Q2hhbmdlSW50ZXJ2YWx9IGZpcnN0Q2hhbmdlSW50ZXJ2YWxcclxuICAgKiBAcGFyYW0ge0NoYW5nZUludGVydmFsfSBsYXN0Q2hhbmdlSW50ZXJ2YWxcclxuICAgKi9cclxuICBzdGl0Y2goIGJhY2tib25lLCBmaXJzdFN0aXRjaERyYXdhYmxlLCBsYXN0U3RpdGNoRHJhd2FibGUsIG9sZEZpcnN0U3RpdGNoRHJhd2FibGUsIG9sZExhc3RTdGl0Y2hEcmF3YWJsZSwgZmlyc3RDaGFuZ2VJbnRlcnZhbCwgbGFzdENoYW5nZUludGVydmFsICkge1xyXG4gICAgLy8gcmVxdWlyZWQgY2FsbCB0byB0aGUgU3RpdGNoZXIgaW50ZXJmYWNlIChzZWUgU3RpdGNoZXIuaW5pdGlhbGl6ZSgpKS5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZSggYmFja2JvbmUsIGZpcnN0U3RpdGNoRHJhd2FibGUsIGxhc3RTdGl0Y2hEcmF3YWJsZSwgb2xkRmlyc3RTdGl0Y2hEcmF3YWJsZSwgb2xkTGFzdFN0aXRjaERyYXdhYmxlLCBmaXJzdENoYW5nZUludGVydmFsLCBsYXN0Q2hhbmdlSW50ZXJ2YWwgKTtcclxuXHJcbiAgICAvLyBUcmFja3Mgd2hldGhlciBvdXIgb3JkZXIgb2YgYmxvY2tzIGNoYW5nZWQuIElmIGl0IGRpZCwgd2UnbGwgbmVlZCB0byByZWJ1aWxkIG91ciBibG9ja3MgYXJyYXkuIFRoaXMgZmxhZyBpc1xyXG4gICAgLy8gc2V0IGlmIHdlIHJlbW92ZSBhbnkgYmxvY2tzLCBjcmVhdGUgYW55IGJsb2Nrcywgb3IgY2hhbmdlIHRoZSBvcmRlciBiZXR3ZWVuIHR3byBibG9ja3MgKHZpYSBsaW5rQmxvY2tzKS5cclxuICAgIC8vIEl0IGRvZXMgTk9UIG9jY3VyIGluIHVudXNlQmxvY2ssIHNpbmNlIHdlIG1heSByZXVzZSB0aGUgc2FtZSBibG9jayBpbiB0aGUgc2FtZSBwb3NpdGlvbiAodGh1cyBub3QgaGF2aW5nIGFuXHJcbiAgICAvLyBvcmRlciBjaGFuZ2UpLlxyXG4gICAgdGhpcy5ibG9ja09yZGVyQ2hhbmdlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIExpc3Qgb2YgYmxvY2tzIHRoYXQgKGluIHRoZSBjdXJyZW50IHBhcnQgb2YgdGhlIHN0aXRjaCBiZWluZyBwcm9jZXNzZWQpIGFyZSBub3Qgc2V0IHRvIGJlIHVzZWQgYnkgYW55XHJcbiAgICAvLyBkcmF3YWJsZXMuIEJsb2NrcyBhcmUgYWRkZWQgdG8gaGVyZSB3aGVuIHRoZXkgYXJlIGZ1bGx5IGludGVybmFsIHRvIGEgY2hhbmdlIGludGVydmFsLCBhbmQgd2hlbiB3ZSBnbHVlXHJcbiAgICAvLyBibG9ja3MgdG9nZXRoZXIuIFRoZXkgY2FuIGJlIHJldXNlZCB0aHJvdWdoIHRoZSBibG9jay1tYXRjaGluZyBwcm9jZXNzLiBJZiB0aGV5IGFyZSBub3QgcmV1c2VkIGF0IHRoZSBlbmQgb2ZcclxuICAgIC8vIHRoaXMgc3RpdGNoLCB0aGV5IHdpbGwgYmUgbWFya2VkIGZvciByZW1vdmFsLlxyXG4gICAgdGhpcy5yZXVzYWJsZUJsb2NrcyA9IGNsZWFuQXJyYXkoIHRoaXMucmV1c2FibGVCbG9ja3MgKTsgLy8gcmUtdXNlIGluc3RhbmNlLCBzaW5jZSB3ZSBhcmUgZWZmZWN0aXZlbHkgcG9vbGVkXHJcblxyXG4gICAgLy8gVG8gcHJvcGVybHkgaGFuZGxlIGdsdWUvdW5nbHVlIHNpdHVhdGlvbnMgd2l0aCBleHRlcm5hbCBibG9ja3MgKG9uZXMgdGhhdCBhcmVuJ3QgcmV1c2FibGUgYWZ0ZXIgcGhhc2UgMSksXHJcbiAgICAvLyB3ZSBuZWVkIHNvbWUgZXh0cmEgdHJhY2tpbmcgZm9yIG91ciBpbm5lciBzdWItYmxvY2sgZWRnZSBjYXNlIGxvb3AuXHJcbiAgICB0aGlzLmJsb2NrV2FzQWRkZWQgPSBmYWxzZTsgLy8gd2UgbmVlZCB0byBrbm93IGlmIGEgcHJldmlvdXNseS1leGlzdGluZyBibG9jayB3YXMgYWRkZWQsIGFuZCByZW1vdmUgaXQgb3RoZXJ3aXNlLlxyXG5cclxuICAgIGxldCBpbnRlcnZhbDtcclxuXHJcbiAgICAvLyByZWNvcmQgY3VycmVudCBmaXJzdC9sYXN0IGRyYXdhYmxlcyBmb3IgdGhlIGVudGlyZSBiYWNrYm9uZVxyXG4gICAgdGhpcy5yZWNvcmRCYWNrYm9uZUJvdW5kYXJpZXMoKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5U3RpdGNoZXIgJiYgc2NlbmVyeUxvZy5HcmVlZHlTdGl0Y2hlciggJ3BoYXNlIDE6IG9sZCBsaW5rZWQgbGlzdCcgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlTdGl0Y2hlciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgcGVuZGluZyByZW1vdmFsIG9mIG9sZCBibG9ja3MvZHJhd2FibGVzLiBGaXJzdCwgd2UgbmVlZCB0byBtYXJrIGFsbCAnaW50ZXJuYWwnIGRyYXdhYmxlcyB3aXRoXHJcbiAgICAvLyBub3RlUGVuZGluZ1JlbW92YWwoKSwgc28gdGhhdCBpZiB0aGV5IGFyZW4ndCBhZGRlZCBiYWNrIGluIHRoaXMgYmFja2JvbmUsIHRoYXQgdGhleSBhcmUgcmVtb3ZlZCBmcm9tIHRoZWlyXHJcbiAgICAvLyBvbGQgYmxvY2suIE5vdGUgdGhhdCBsYXRlciB3ZSB3aWxsIGFkZCB0aGUgb25lcyB0aGF0IHN0YXkgb24gdGhpcyBiYWNrYm9uZSwgc28gdGhhdCB0aGV5IG9ubHkgZWl0aGVyIGNoYW5nZVxyXG4gICAgLy8gYmxvY2tzLCBvciBzdGF5IG9uIHRoZSBzYW1lIGJsb2NrLlxyXG4gICAgaWYgKCBiYWNrYm9uZS5ibG9ja3MubGVuZ3RoICkge1xyXG4gICAgICBjb25zdCB2ZXJ5Rmlyc3RCbG9jayA9IGJhY2tib25lLmJsb2Nrc1sgMCBdO1xyXG4gICAgICBjb25zdCB2ZXJ5TGFzdEJsb2NrID0gYmFja2JvbmUuYmxvY2tzWyBiYWNrYm9uZS5ibG9ja3MubGVuZ3RoIC0gMSBdO1xyXG5cclxuICAgICAgZm9yICggaW50ZXJ2YWwgPSBmaXJzdENoYW5nZUludGVydmFsOyBpbnRlcnZhbCAhPT0gbnVsbDsgaW50ZXJ2YWwgPSBpbnRlcnZhbC5uZXh0Q2hhbmdlSW50ZXJ2YWwgKSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIWludGVydmFsLmlzRW1wdHkoKSwgJ1dlIG5vdyBndWFyYW50ZWUgdGhhdCB0aGUgaW50ZXJ2YWxzIGFyZSBub24tZW1wdHknICk7XHJcblxyXG4gICAgICAgIC8vIEZpcnN0LCB3ZSBuZWVkIHRvIG1hcmsgYWxsIG9sZCAnaW50ZXJuYWwnIGRyYXdhYmxlcyB3aXRoIG5vdGVQZW5kaW5nUmVtb3ZhbCgpLCBzbyB0aGF0IGlmIHRoZXkgYXJlbid0IGFkZGVkXHJcbiAgICAgICAgLy8gYmFjayBpbiB0aGlzIGJhY2tib25lLCB0aGF0IHRoZXkgYXJlIHJlbW92ZWQgZnJvbSB0aGVpciBvbGQgYmxvY2suIE5vdGUgdGhhdCBsYXRlciB3ZSB3aWxsIGFkZCB0aGUgb25lc1xyXG4gICAgICAgIC8vIHRoYXQgc3RheSBvbiB0aGlzIGJhY2tib25lLCBzbyB0aGF0IHRoZXkgb25seSBlaXRoZXIgY2hhbmdlIGJsb2Nrcywgb3Igc3RheSBvbiB0aGUgc2FtZSBibG9jay5cclxuICAgICAgICBpZiAoIGludGVydmFsSGFzT2xkSW50ZXJuYWxEcmF3YWJsZXMoIGludGVydmFsLCBvbGRGaXJzdFN0aXRjaERyYXdhYmxlLCBvbGRMYXN0U3RpdGNoRHJhd2FibGUgKSApIHtcclxuICAgICAgICAgIGNvbnN0IGZpcnN0UmVtb3ZhbCA9IGludGVydmFsLmRyYXdhYmxlQmVmb3JlID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludGVydmFsLmRyYXdhYmxlQmVmb3JlLm9sZE5leHREcmF3YWJsZSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRGaXJzdFN0aXRjaERyYXdhYmxlO1xyXG4gICAgICAgICAgY29uc3QgbGFzdFJlbW92YWwgPSBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWwuZHJhd2FibGVBZnRlci5vbGRQcmV2aW91c0RyYXdhYmxlIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkTGFzdFN0aXRjaERyYXdhYmxlO1xyXG5cclxuICAgICAgICAgIC8vIGRyYXdhYmxlIGl0ZXJhdGlvbiBvbiB0aGUgJ29sZCcgbGlua2VkIGxpc3RcclxuICAgICAgICAgIGZvciAoIGxldCByZW1vdmVkRHJhd2FibGUgPSBmaXJzdFJlbW92YWw7IDsgcmVtb3ZlZERyYXdhYmxlID0gcmVtb3ZlZERyYXdhYmxlLm9sZE5leHREcmF3YWJsZSApIHtcclxuICAgICAgICAgICAgdGhpcy5ub3RlUGVuZGluZ1JlbW92YWwoIHJlbW92ZWREcmF3YWJsZSApO1xyXG4gICAgICAgICAgICBpZiAoIHJlbW92ZWREcmF3YWJsZSA9PT0gbGFzdFJlbW92YWwgKSB7IGJyZWFrOyB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBCbG9ja3MgdG90YWxseSBjb250YWluZWQgd2l0aGluIHRoZSBjaGFuZ2UgaW50ZXJ2YWwgYXJlIG1hcmtlZCBhcyByZXVzYWJsZSAoZG9lc24ndCBpbmNsdWRlIGVuZCBibG9ja3MpLlxyXG4gICAgICAgIGlmICggaW50ZXJ2YWxIYXNPbGRJbnRlcm5hbEJsb2NrcyggaW50ZXJ2YWwsIHZlcnlGaXJzdEJsb2NrLCB2ZXJ5TGFzdEJsb2NrICkgKSB7XHJcbiAgICAgICAgICBjb25zdCBmaXJzdEJsb2NrID0gaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgPT09IG51bGwgPyBiYWNrYm9uZS5ibG9ja3NbIDAgXSA6IGludGVydmFsLmRyYXdhYmxlQmVmb3JlLnBhcmVudERyYXdhYmxlLm5leHRCbG9jaztcclxuICAgICAgICAgIGNvbnN0IGxhc3RCbG9jayA9IGludGVydmFsLmRyYXdhYmxlQWZ0ZXIgPT09IG51bGwgPyBiYWNrYm9uZS5ibG9ja3NbIGJhY2tib25lLmJsb2Nrcy5sZW5ndGggLSAxIF0gOiBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyLnBhcmVudERyYXdhYmxlLnByZXZpb3VzQmxvY2s7XHJcblxyXG4gICAgICAgICAgZm9yICggbGV0IG1hcmtlZEJsb2NrID0gZmlyc3RCbG9jazsgOyBtYXJrZWRCbG9jayA9IG1hcmtlZEJsb2NrLm5leHRCbG9jayApIHtcclxuICAgICAgICAgICAgdGhpcy51bnVzZUJsb2NrKCBtYXJrZWRCbG9jayApO1xyXG4gICAgICAgICAgICBpZiAoIG1hcmtlZEJsb2NrID09PSBsYXN0QmxvY2sgKSB7IGJyZWFrOyB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyICYmIHNjZW5lcnlMb2cuR3JlZWR5U3RpdGNoZXIoICdwaGFzZSAyOiBuZXcgbGlua2VkIGxpc3QnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5U3RpdGNoZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gRG9uJ3QgcHJvY2VzcyB0aGUgc2luZ2xlIGludGVydmFsIGxlZnQgaWYgd2UgYXJlbid0IGxlZnQgd2l0aCBhbnkgZHJhd2FibGVzICh0aHVzIGxlZnQgd2l0aCBubyBibG9ja3MpXHJcbiAgICBpZiAoIGZpcnN0U3RpdGNoRHJhd2FibGUgKSB7XHJcbiAgICAgIGZvciAoIGludGVydmFsID0gZmlyc3RDaGFuZ2VJbnRlcnZhbDsgaW50ZXJ2YWwgIT09IG51bGw7IGludGVydmFsID0gaW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsICkge1xyXG4gICAgICAgIHRoaXMucHJvY2Vzc0ludGVydmFsKCBiYWNrYm9uZSwgaW50ZXJ2YWwsIGZpcnN0U3RpdGNoRHJhd2FibGUsIGxhc3RTdGl0Y2hEcmF3YWJsZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyICYmIHNjZW5lcnlMb2cuR3JlZWR5U3RpdGNoZXIoICdwaGFzZSAzOiBjbGVhbnVwJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIC8vIEFueXRoaW5nIGluIG91ciAncmV1c2FibGUnIGJsb2NrcyBhcnJheSBzaG91bGQgYmUgcmVtb3ZlZCBmcm9tIG91ciBET00gYW5kIG1hcmtlZCBmb3IgZGlzcG9zYWwuXHJcbiAgICB0aGlzLnJlbW92ZVVudXNlZEJsb2NrcygpO1xyXG5cclxuICAgIC8vIEZpcmUgb2ZmIG5vdGlmeUludGVydmFsIGNhbGxzIHRvIGJsb2NrcyBpZiB0aGVpciBib3VuZGFyaWVzIChmaXJzdC9sYXN0IGRyYXdhYmxlcykgaGF2ZSBjaGFuZ2VkLiBUaGlzIGlzXHJcbiAgICAvLyBhIG5lY2Vzc2FyeSBjYWxsIHNpbmNlIHdlIHVzZWQgbWFya0JlZm9yZUJsb2NrL21hcmtBZnRlckJsb2NrIHRvIHJlY29yZCBibG9jayBib3VuZGFyaWVzIGFzIHdlIHdlbnQgYWxvbmcuXHJcbiAgICAvLyBXZSBkb24ndCB3YW50IHRvIGRvIHRoaXMgc3luY2hyb25vdXNseSwgYmVjYXVzZSB0aGVuIHlvdSBjb3VsZCB1cGRhdGUgYSBibG9jaydzIGJvdW5kYXJpZXMgbXVsdGlwbGUgdGltZXMsXHJcbiAgICAvLyB3aGljaCBtYXkgYmUgZXhwZW5zaXZlLlxyXG4gICAgdGhpcy51cGRhdGVCbG9ja0ludGVydmFscygpO1xyXG5cclxuICAgIGlmICggZmlyc3RTdGl0Y2hEcmF3YWJsZSA9PT0gbnVsbCApIHtcclxuICAgICAgLy8gaS5lLiBjbGVhciBvdXIgYmxvY2tzIGFycmF5XHJcbiAgICAgIHRoaXMudXNlTm9CbG9ja3MoKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLmJsb2NrT3JkZXJDaGFuZ2VkICkge1xyXG4gICAgICAvLyBSZWJ1aWxkIG91ciBibG9ja3MgYXJyYXkgZnJvbSB0aGUgbGlua2VkIGxpc3QgZm9ybWF0IHdlIHVzZWQgZm9yIHJlY29yZGluZyBvdXIgY2hhbmdlcyAoYXZvaWRzIE8obl4yKVxyXG4gICAgICAvLyBzaXR1YXRpb25zIHNpbmNlIHdlIGRvbid0IG5lZWQgdG8gZG8gYXJyYXkgaW5kZXggbG9va3VwcyB3aGlsZSBtYWtpbmcgY2hhbmdlcywgYnV0IG9ubHkgYXQgdGhlIGVuZCkuXHJcbiAgICAgIHRoaXMucHJvY2Vzc0Jsb2NrTGlua2VkTGlzdCggYmFja2JvbmUsIGZpcnN0U3RpdGNoRHJhd2FibGUucGVuZGluZ1BhcmVudERyYXdhYmxlLCBsYXN0U3RpdGNoRHJhd2FibGUucGVuZGluZ1BhcmVudERyYXdhYmxlICk7XHJcblxyXG4gICAgICAvLyBBY3R1YWxseSByZWluZGV4IHRoZSBET00gZWxlbWVudHMgb2YgdGhlIGJsb2NrcyAoY2hhbmdpbmcgYXMgbmVjZXNzYXJ5KVxyXG4gICAgICB0aGlzLnJlaW5kZXgoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZXF1aXJlZCBjYWxsIHRvIHRoZSBTdGl0Y2hlciBpbnRlcmZhY2UgKHNlZSBTdGl0Y2hlci5jbGVhbigpKS5cclxuICAgIHRoaXMuY2xlYW4oKTtcclxuXHJcbiAgICAvLyByZWxlYXNlIHRoZSByZWZlcmVuY2VzIHdlIG1hZGUgaW4gdGhpcyB0eXBlXHJcbiAgICBjbGVhbkFycmF5KCB0aGlzLnJldXNhYmxlQmxvY2tzICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEb2VzIHRoZSBtYWluIGJ1bGsgb2YgdGhlIHdvcmsgZm9yIGVhY2ggY2hhbmdlIGludGVydmFsLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JhY2tib25lRHJhd2FibGV9IGJhY2tib25lXHJcbiAgICogQHBhcmFtIHtDaGFuZ2VJbnRlcnZhbH0gaW50ZXJ2YWxcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfG51bGx9IGZpcnN0U3RpdGNoRHJhd2FibGVcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfG51bGx9IGxhc3RTdGl0Y2hEcmF3YWJsZVxyXG4gICAqL1xyXG4gIHByb2Nlc3NJbnRlcnZhbCggYmFja2JvbmUsIGludGVydmFsLCBmaXJzdFN0aXRjaERyYXdhYmxlLCBsYXN0U3RpdGNoRHJhd2FibGUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbnRlcnZhbCBpbnN0YW5jZW9mIENoYW5nZUludGVydmFsICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmaXJzdFN0aXRjaERyYXdhYmxlIGluc3RhbmNlb2YgRHJhd2FibGUsICdXZSBhc3N1bWUgd2UgaGF2ZSBhIG5vbi1udWxsIHJlbWFpbmluZyBzZWN0aW9uJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGFzdFN0aXRjaERyYXdhYmxlIGluc3RhbmNlb2YgRHJhd2FibGUsICdXZSBhc3N1bWUgd2UgaGF2ZSBhIG5vbi1udWxsIHJlbWFpbmluZyBzZWN0aW9uJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWludGVydmFsLmlzRW1wdHkoKSwgJ1dlIG5vdyBndWFyYW50ZWUgdGhhdCB0aGUgaW50ZXJ2YWxzIGFyZSBub24tZW1wdHknICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlKCBgaW50ZXJ2YWw6ICR7XHJcbiAgICAgIGludGVydmFsLmRyYXdhYmxlQmVmb3JlID8gaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUudG9TdHJpbmcoKSA6ICdudWxsJ1xyXG4gICAgfSB0byAke1xyXG4gICAgICBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyID8gaW50ZXJ2YWwuZHJhd2FibGVBZnRlci50b1N0cmluZygpIDogJ251bGwnfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIC8vIGNoZWNrIGlmIG91ciBpbnRlcnZhbCByZW1vdmVzIGV2ZXJ5dGhpbmcsIHdlIG1heSBuZWVkIGEgZ2x1ZVxyXG4gICAgaWYgKCAhaW50ZXJ2YWxIYXNOZXdJbnRlcm5hbERyYXdhYmxlcyggaW50ZXJ2YWwsIGZpcnN0U3RpdGNoRHJhd2FibGUsIGxhc3RTdGl0Y2hEcmF3YWJsZSApICkge1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoICdubyBjdXJyZW50IGludGVybmFsIGRyYXdhYmxlcyBpbiBpbnRlcnZhbCcgKTtcclxuXHJcbiAgICAgIC8vIHNlcGFyYXRlIGlmLCBsYXN0IGNvbmRpdGlvbiBhYm92ZSB3b3VsZCBjYXVzZSBpc3N1ZXMgd2l0aCB0aGUgbm9ybWFsIG9wZXJhdGlvbiBicmFuY2hcclxuICAgICAgaWYgKCBpbnRlcnZhbC5kcmF3YWJsZUJlZm9yZSAmJiBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGludGVydmFsLmRyYXdhYmxlQmVmb3JlLm5leHREcmF3YWJsZSA9PT0gaW50ZXJ2YWwuZHJhd2FibGVBZnRlciApO1xyXG5cclxuICAgICAgICAvLyBpZiB3ZSByZW1vdmVkIGV2ZXJ5dGhpbmcgKG5vIG5ldyBpbnRlcm5hbCBkcmF3YWJsZXMpLCBvdXIgZHJhd2FibGVCZWZvcmUgaXMgb3BlbiAnYWZ0ZXInLCBpZiBvdXJcclxuICAgICAgICAvLyBkcmF3YWJsZUFmdGVyIGlzIG9wZW4gJ2JlZm9yZScgc2luY2UgdGhleSBhcmUgc2libGluZ3MgKG9ubHkgb25lIGZsYWcgbmVlZGVkKS5cclxuICAgICAgICBjb25zdCBpc09wZW4gPSAhaGFzR2FwQmV0d2VlbkRyYXdhYmxlcyggaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUsIGludGVydmFsLmRyYXdhYmxlQWZ0ZXIgKTtcclxuXHJcbiAgICAgICAgLy8gaGFuZGxlIGdsdWUvdW5nbHVlIG9yIGFueSBvdGhlciAnZXh0ZXJuYWwnIGNoYW5nZXNcclxuICAgICAgICB0aGlzLnByb2Nlc3NFZGdlQ2FzZXMoIGludGVydmFsLCBpc09wZW4sIGlzT3BlbiApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIGludGVydmFsLmRyYXdhYmxlQmVmb3JlICYmICFpc09wZW5BZnRlciggaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgKSApIHtcclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoICdjbG9zZWQtYWZ0ZXIgY29sbGFwc2VkIGxpbms6JyApO1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG4gICAgICAgIHRoaXMubGlua0FmdGVyRHJhd2FibGUoIGludGVydmFsLmRyYXdhYmxlQmVmb3JlICk7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggaW50ZXJ2YWwuZHJhd2FibGVBZnRlciAmJiAhaXNPcGVuQmVmb3JlKCBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyICkgKSB7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlKCAnY2xvc2VkLWJlZm9yZSBjb2xsYXBzZWQgbGluazonICk7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcbiAgICAgICAgdGhpcy5saW5rQmVmb3JlRHJhd2FibGUoIGludGVydmFsLmRyYXdhYmxlQWZ0ZXIgKTtcclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBvdGhlcndpc2Ugbm9ybWFsIG9wZXJhdGlvblxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGxldCBkcmF3YWJsZSA9IGludGVydmFsLmRyYXdhYmxlQmVmb3JlID8gaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUubmV4dERyYXdhYmxlIDogZmlyc3RTdGl0Y2hEcmF3YWJsZTtcclxuXHJcbiAgICAgIC8vIGlmIHdlIGhhdmUgYW55IGN1cnJlbnQgZHJhd2FibGVzIGF0IGFsbFxyXG4gICAgICBsZXQgc3ViQmxvY2tGaXJzdERyYXdhYmxlID0gbnVsbDtcclxuICAgICAgbGV0IG1hdGNoZWRCbG9jayA9IG51bGw7XHJcbiAgICAgIGxldCBpc0ZpcnN0ID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIHNlcGFyYXRlIG91ciBuZXctZHJhd2FibGUgbGlua2VkLWxpc3QgaW50byBzdWItYmxvY2tzIHRoYXQgd2Ugd2lsbCBwcm9jZXNzIGluZGl2aWR1YWxseVxyXG4gICAgICB3aGlsZSAoIHRydWUgKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc3RhbnQtY29uZGl0aW9uXHJcbiAgICAgICAgY29uc3QgbmV4dERyYXdhYmxlID0gZHJhd2FibGUubmV4dERyYXdhYmxlO1xyXG4gICAgICAgIGNvbnN0IGlzTGFzdCA9IG5leHREcmF3YWJsZSA9PT0gaW50ZXJ2YWwuZHJhd2FibGVBZnRlcjtcclxuXHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbmV4dERyYXdhYmxlICE9PSBudWxsIHx8IGlzTGFzdCwgJ0lmIG91ciBuZXh0RHJhd2FibGUgaXMgbnVsbCwgaXNMYXN0IG11c3QgYmUgdHJ1ZScgKTtcclxuXHJcbiAgICAgICAgaWYgKCAhc3ViQmxvY2tGaXJzdERyYXdhYmxlICkge1xyXG4gICAgICAgICAgc3ViQmxvY2tGaXJzdERyYXdhYmxlID0gZHJhd2FibGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTZWUgaWYgYW55IG9mIG91ciAnbmV3JyBkcmF3YWJsZXMgd2VyZSBwYXJ0IG9mIGEgYmxvY2sgdGhhdCB3ZSd2ZSBtYXJrZWQgYXMgcmV1c2FibGUuIElmIHRoaXMgaXMgdGhlIGNhc2UsXHJcbiAgICAgICAgLy8gd2UnbGwgZ3JlZWRpbHkgdHJ5IHRvIHVzZSB0aGlzIGJsb2NrIGZvciBtYXRjaGluZyBpZiBwb3NzaWJsZSAoaWdub3JpbmcgdGhlIG90aGVyIHBvdGVudGlhbCBtYXRjaGVzIGZvclxyXG4gICAgICAgIC8vIG90aGVyIGRyYXdhYmxlcyBhZnRlciBpbiB0aGUgc2FtZSBzdWItYmxvY2spLlxyXG4gICAgICAgIGlmICggbWF0Y2hlZEJsb2NrID09PSBudWxsICYmIGRyYXdhYmxlLnBhcmVudERyYXdhYmxlICYmICFkcmF3YWJsZS5wYXJlbnREcmF3YWJsZS51c2VkICYmIGRyYXdhYmxlLmJhY2tib25lID09PSBiYWNrYm9uZSAmJlxyXG4gICAgICAgICAgICAgZHJhd2FibGUucGFyZW50RHJhd2FibGUucGFyZW50RHJhd2FibGUgPT09IGJhY2tib25lICkge1xyXG4gICAgICAgICAgbWF0Y2hlZEJsb2NrID0gZHJhd2FibGUucGFyZW50RHJhd2FibGU7XHJcbiAgICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoIGBtYXRjaGluZyBhdCAke2RyYXdhYmxlLnRvU3RyaW5nKCl9IHdpdGggJHttYXRjaGVkQmxvY2t9YCApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCBpc0xhc3QgfHwgaGFzR2FwQmV0d2VlbkRyYXdhYmxlcyggZHJhd2FibGUsIG5leHREcmF3YWJsZSApICkge1xyXG4gICAgICAgICAgaWYgKCBpc0ZpcnN0ICkge1xyXG4gICAgICAgICAgICAvLyB3ZSdsbCBoYW5kbGUgYW55IGdsdWUvdW5nbHVlIGF0IHRoZSBzdGFydCwgc28gZXZlcnkgcHJvY2Vzc1N1YkJsb2NrIGNhbiBiZSBzZXQgY29ycmVjdGx5LlxyXG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NFZGdlQ2FzZXMoIGludGVydmFsLCBpc09wZW5CZWZvcmUoIHN1YkJsb2NrRmlyc3REcmF3YWJsZSApLCBpc09wZW5BZnRlciggZHJhd2FibGUgKSApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIGRvIHRoZSBuZWNlc3Nhcnkgd29yayBmb3IgZWFjaCBzdWItYmxvY2sgKGFkZGluZyBkcmF3YWJsZXMsIGxpbmtpbmcsIHVzaW5nIG1hdGNoZWQgYmxvY2tzKVxyXG4gICAgICAgICAgdGhpcy5wcm9jZXNzU3ViQmxvY2soIGludGVydmFsLCBzdWJCbG9ja0ZpcnN0RHJhd2FibGUsIGRyYXdhYmxlLCBtYXRjaGVkQmxvY2ssIGlzRmlyc3QsIGlzTGFzdCApO1xyXG5cclxuICAgICAgICAgIHN1YkJsb2NrRmlyc3REcmF3YWJsZSA9IG51bGw7XHJcbiAgICAgICAgICBtYXRjaGVkQmxvY2sgPSBudWxsO1xyXG4gICAgICAgICAgaXNGaXJzdCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCBpc0xhc3QgKSB7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBkcmF3YWJsZSA9IG5leHREcmF3YWJsZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NoYW5nZUludGVydmFsfSBpbnRlcnZhbFxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGZpcnN0RHJhd2FibGUgLSBmb3IgdGhlIHNwZWNpZmljIHN1Yi1ibG9ja1xyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGxhc3REcmF3YWJsZSAtIGZvciB0aGUgc3BlY2lmaWMgc3ViLWJsb2NrXHJcbiAgICogQHBhcmFtIHtCbG9ja30gbWF0Y2hlZEJsb2NrXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0ZpcnN0XHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0xhc3RcclxuICAgKi9cclxuICBwcm9jZXNzU3ViQmxvY2soIGludGVydmFsLCBmaXJzdERyYXdhYmxlLCBsYXN0RHJhd2FibGUsIG1hdGNoZWRCbG9jaywgaXNGaXJzdCwgaXNMYXN0ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlKFxyXG4gICAgICBgc3ViLWJsb2NrOiAke2ZpcnN0RHJhd2FibGUudG9TdHJpbmcoKX0gdG8gJHtsYXN0RHJhd2FibGUudG9TdHJpbmcoKX0gJHtcclxuICAgICAgICBtYXRjaGVkQmxvY2sgPyBgd2l0aCBtYXRjaGVkOiAke21hdGNoZWRCbG9jay50b1N0cmluZygpfWAgOiAnd2l0aCBubyBtYXRjaCd9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgY29uc3Qgb3BlbkJlZm9yZSA9IGlzT3BlbkJlZm9yZSggZmlyc3REcmF3YWJsZSApO1xyXG4gICAgY29uc3Qgb3BlbkFmdGVyID0gaXNPcGVuQWZ0ZXIoIGxhc3REcmF3YWJsZSApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcGVuQmVmb3JlIHx8IGlzRmlyc3QsICdvcGVuQmVmb3JlIGltcGxpZXMgaXNGaXJzdCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcGVuQWZ0ZXIgfHwgaXNMYXN0LCAnb3BlbkFmdGVyIGltcGxpZXMgaXNMYXN0JyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcGVuQmVmb3JlIHx8ICFvcGVuQWZ0ZXIgfHwgZmlyc3REcmF3YWJsZS5wcmV2aW91c0RyYXdhYmxlLnBlbmRpbmdQYXJlbnREcmF3YWJsZSA9PT0gbGFzdERyYXdhYmxlLm5leHREcmF3YWJsZS5wZW5kaW5nUGFyZW50RHJhd2FibGUsXHJcbiAgICAgICdJZiB3ZSB3b3VsZCB1c2UgYm90aCB0aGUgYmVmb3JlIGFuZCBhZnRlciBibG9ja3MsIG1ha2Ugc3VyZSBhbnkgZ2x1aW5nICcgKTtcclxuXHJcbiAgICAvLyBpZiBvdXIgc3ViLWJsb2NrIGdldHMgY29tYmluZWQgaW50byB0aGUgcHJldmlvdXMgYmxvY2ssIHVzZSBpdHMgYmxvY2sgaW5zdGVhZCBvZiBhbnkgbWF0Y2gtc2Nhbm5lZCBibG9ja3NcclxuICAgIGlmICggb3BlbkJlZm9yZSApIHtcclxuICAgICAgbWF0Y2hlZEJsb2NrID0gZmlyc3REcmF3YWJsZS5wcmV2aW91c0RyYXdhYmxlLnBlbmRpbmdQYXJlbnREcmF3YWJsZTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlKCBgY29tYmluaW5nIGludG8gYmVmb3JlIGJsb2NrOiAke21hdGNoZWRCbG9jay50b1N0cmluZygpfWAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBvdXIgc3ViLWJsb2NrIGdldHMgY29tYmluZWQgaW50byB0aGUgbmV4dCBibG9jaywgdXNlIGl0cyBibG9jayBpbnN0ZWFkIG9mIGFueSBtYXRjaC1zY2FubmVkIGJsb2Nrc1xyXG4gICAgaWYgKCBvcGVuQWZ0ZXIgKSB7XHJcbiAgICAgIG1hdGNoZWRCbG9jayA9IGxhc3REcmF3YWJsZS5uZXh0RHJhd2FibGUucGVuZGluZ1BhcmVudERyYXdhYmxlO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoIGBjb21iaW5pbmcgaW50byBhZnRlciBibG9jazogJHttYXRjaGVkQmxvY2sudG9TdHJpbmcoKX1gICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY3JlYXRlIGEgYmxvY2sgaWYgbWF0Y2hlZEJsb2NrIGlzIG51bGwsIG90aGVyd2lzZSBtYXJrIGl0IGFzIHVzZWQgKGlmIGl0IGlzIGluIHJldXNhYmxlQmxvY2tzKVxyXG4gICAgbWF0Y2hlZEJsb2NrID0gdGhpcy5lbnN1cmVVc2VkQmxvY2soIG1hdGNoZWRCbG9jaywgZmlyc3REcmF3YWJsZSApO1xyXG5cclxuICAgIC8vIGFkZCBpbnRlcm5hbCBkcmF3YWJsZXNcclxuICAgIGZvciAoIGxldCBkcmF3YWJsZSA9IGZpcnN0RHJhd2FibGU7IDsgZHJhd2FibGUgPSBkcmF3YWJsZS5uZXh0RHJhd2FibGUgKSB7XHJcbiAgICAgIHRoaXMubm90ZVBlbmRpbmdBZGRpdGlvbiggZHJhd2FibGUsIG1hdGNoZWRCbG9jayApO1xyXG4gICAgICBpZiAoIGRyYXdhYmxlID09PSBsYXN0RHJhd2FibGUgKSB7IGJyZWFrOyB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbGluayBvdXIgYmxvY2tzIChhbmQgc2V0IHBlbmRpbmcgYmxvY2sgYm91bmRhcmllcykgYXMgbmVlZGVkLiBhc3N1bWVzIGdsdWUvdW5nbHVlIGhhcyBhbHJlYWR5IGJlZW4gcGVyZm9ybWVkXHJcbiAgICBpZiAoICFvcGVuQmVmb3JlICkge1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoICdjbG9zZWQtYmVmb3JlIGxpbms6JyApO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuICAgICAgdGhpcy5saW5rQmVmb3JlRHJhd2FibGUoIGZpcnN0RHJhd2FibGUgKTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgIH1cclxuICAgIGlmICggaXNMYXN0ICYmICFvcGVuQWZ0ZXIgKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSggJ2xhc3QgY2xvc2VkLWFmdGVyIGxpbms6JyApO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuICAgICAgdGhpcy5saW5rQWZ0ZXJEcmF3YWJsZSggbGFzdERyYXdhYmxlICk7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGZpcnN0RHJhd2FibGUgYW5kIGxhc3REcmF3YWJsZSByZWZlciB0byB0aGUgc3BlY2lmaWMgc3ViLWJsb2NrIChpZiBpdCBleGlzdHMpLCBpc0xhc3QgcmVmZXJzIHRvIGlmIGl0J3MgdGhlXHJcbiAgICogbGFzdCBzdWItYmxvY2tcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtDaGFuZ2VJbnRlcnZhbH0gaW50ZXJ2YWxcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG9wZW5CZWZvcmVcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG9wZW5BZnRlclxyXG4gICAqL1xyXG4gIHByb2Nlc3NFZGdlQ2FzZXMoIGludGVydmFsLCBvcGVuQmVmb3JlLCBvcGVuQWZ0ZXIgKSB7XHJcbiAgICAvLyB0aGlzIHRlc3QgcGFzc2VzIGZvciBnbHVlIGFuZCB1bmdsdWUgY2FzZXNcclxuICAgIGlmICggaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgIT09IG51bGwgJiYgaW50ZXJ2YWwuZHJhd2FibGVBZnRlciAhPT0gbnVsbCApIHtcclxuICAgICAgY29uc3QgYmVmb3JlQmxvY2sgPSBpbnRlcnZhbC5kcmF3YWJsZUJlZm9yZS5wZW5kaW5nUGFyZW50RHJhd2FibGU7XHJcbiAgICAgIGNvbnN0IGFmdGVyQmxvY2sgPSBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyLnBlbmRpbmdQYXJlbnREcmF3YWJsZTtcclxuICAgICAgY29uc3QgbmV4dEFmdGVyQmxvY2sgPSAoIGludGVydmFsLm5leHRDaGFuZ2VJbnRlcnZhbCAmJiBpbnRlcnZhbC5uZXh0Q2hhbmdlSW50ZXJ2YWwuZHJhd2FibGVBZnRlciApID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnRlcnZhbC5uZXh0Q2hhbmdlSW50ZXJ2YWwuZHJhd2FibGVBZnRlci5wZW5kaW5nUGFyZW50RHJhd2FibGUgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGw7XHJcblxyXG4gICAgICAvLyBTaW5jZSB3ZSB3YW50IHRvIHJlbW92ZSBhbnkgYWZ0ZXJCbG9jayBhdCB0aGUgZW5kIG9mIGl0cyBydW4gaWYgd2UgZG9uJ3QgaGF2ZSBibG9ja1dhc0FkZGVkIHNldCwgdGhpcyBjaGVja1xyXG4gICAgICAvLyBpcyBuZWNlc3NhcnkgdG8gc2VlIGlmIHdlIGhhdmUgYWxyZWFkeSB1c2VkIHRoaXMgc3BlY2lmaWMgYmxvY2suXHJcbiAgICAgIC8vIE90aGVyd2lzZSwgd2Ugd291bGQgcmVtb3ZlIG91ciAocG90ZW50aWFsbHkgdmVyeS1maXJzdCkgYmxvY2sgd2hlbiBpdCBoYXMgYWxyZWFkeSBiZWVuIHVzZWQgZXh0ZXJuYWxseS5cclxuICAgICAgaWYgKCBiZWZvcmVCbG9jayA9PT0gYWZ0ZXJCbG9jayApIHtcclxuICAgICAgICB0aGlzLmJsb2NrV2FzQWRkZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoXHJcbiAgICAgICAgYGVkZ2UgY2FzZTogJHtcclxuICAgICAgICAgIG9wZW5CZWZvcmUgPyAnb3Blbi1iZWZvcmUgJyA6ICcnXHJcbiAgICAgICAgfSR7b3BlbkFmdGVyID8gJ29wZW4tYWZ0ZXIgJyA6ICcnXHJcbiAgICAgICAgfSR7YmVmb3JlQmxvY2sudG9TdHJpbmcoKX0gdG8gJHthZnRlckJsb2NrLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAgIC8vIGRlY2lkaW5nIHdoYXQgbmV3IGJsb2NrIHNob3VsZCBiZSB1c2VkIGZvciB0aGUgZXh0ZXJuYWwgZ3JvdXAgb2YgZHJhd2FibGVzIGFmdGVyIG91ciBjaGFuZ2UgaW50ZXJ2YWxcclxuICAgICAgbGV0IG5ld0FmdGVyQmxvY2s7XHJcbiAgICAgIC8vIGlmIHdlIGhhdmUgbm8gZ2Fwcy9ib3VuZGFyaWVzLCB3ZSBzaG91bGQgbm90IGhhdmUgdHdvIGRpZmZlcmVudCBibG9ja3NcclxuICAgICAgaWYgKCBvcGVuQmVmb3JlICYmIG9wZW5BZnRlciApIHtcclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoIGBnbHVlIHVzaW5nICR7YmVmb3JlQmxvY2sudG9TdHJpbmcoKX1gICk7XHJcbiAgICAgICAgbmV3QWZ0ZXJCbG9jayA9IGJlZm9yZUJsb2NrO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIGlmIHdlIGNhbid0IHVzZSBvdXIgYWZ0ZXJCbG9jaywgc2luY2UgaXQgd2FzIHVzZWQgYmVmb3JlLCBvciB3b3VsZG4ndCBjcmVhdGUgYSBzcGxpdFxyXG4gICAgICAgIGlmICggdGhpcy5ibG9ja1dhc0FkZGVkIHx8IGJlZm9yZUJsb2NrID09PSBhZnRlckJsb2NrICkge1xyXG4gICAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlKCAnc3BsaXQgd2l0aCBmcmVzaCBibG9jaycgKTtcclxuICAgICAgICAgIC8vIGZvciBzaW1wbGljaXR5IHJpZ2h0IG5vdywgd2UgYWx3YXlzIGNyZWF0ZSBhIGZyZXNoIGJsb2NrICh0byBhdm9pZCBtZXNzaW5nIHVwIHJldXNlZCBibG9ja3MpIGFmdGVyLCBhbmRcclxuICAgICAgICAgIC8vIGFsd2F5cyBjaGFuZ2UgZXZlcnl0aGluZyBhZnRlciAoaW5zdGVhZCBvZiBiZWZvcmUpLCBzbyB3ZSBkb24ndCBoYXZlIHRvIGp1bXAgYWNyb3NzIG11bHRpcGxlIHByZXZpb3VzXHJcbiAgICAgICAgICAvLyBjaGFuZ2UgaW50ZXJ2YWxzXHJcbiAgICAgICAgICBuZXdBZnRlckJsb2NrID0gdGhpcy5jcmVhdGVCbG9jayggaW50ZXJ2YWwuZHJhd2FibGVBZnRlci5yZW5kZXJlciwgaW50ZXJ2YWwuZHJhd2FibGVBZnRlciApO1xyXG4gICAgICAgICAgdGhpcy5ibG9ja09yZGVyQ2hhbmdlZCA9IHRydWU7IC8vIG5lZWRzIHRvIGJlIGRvbmUgb24gYmxvY2sgY3JlYXRpb25cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlIHdlIGNhbiB1c2Ugb3VyIGFmdGVyIGJsb2NrXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoIGBzcGxpdCB3aXRoIHNhbWUgYWZ0ZXJCbG9jayAke2FmdGVyQmxvY2sudG9TdHJpbmcoKX1gICk7XHJcbiAgICAgICAgICBuZXdBZnRlckJsb2NrID0gYWZ0ZXJCbG9jaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIHdlIGRpZG4ndCBjaGFuZ2Ugb3VyIGJsb2NrLCBtYXJrIGl0IGFzIGFkZGVkIHNvIHdlIGRvbid0IHJlbW92ZSBpdC5cclxuICAgICAgaWYgKCBhZnRlckJsb2NrID09PSBuZXdBZnRlckJsb2NrICkge1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSggJ25vIGV4dGVybmFscyBjaGFuZ2UgaGVyZSAoYmxvY2tXYXNBZGRlZCA9PiB0cnVlKScgKTtcclxuICAgICAgICB0aGlzLmJsb2NrV2FzQWRkZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgICAgLy8gT3RoZXJ3aXNlIGlmIHdlIGNoYW5nZWQgdGhlIGJsb2NrLCBtb3ZlIG92ZXIgb25seSB0aGUgZXh0ZXJuYWwgZHJhd2FibGVzIGJldHdlZW4gdGhpcyBpbnRlcnZhbCBhbmQgdGhlIG5leHRcclxuICAgICAgLy8gaW50ZXJ2YWwuXHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSggJ21vdmluZyBleHRlcm5hbHMnICk7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VFeHRlcm5hbHMoIGludGVydmFsLCBuZXdBZnRlckJsb2NrICk7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgdGhlIG5leHQgaW50ZXJ2YWwncyBvbGQgYWZ0ZXJCbG9jayBpc24ndCB0aGUgc2FtZSBhcyBvdXIgb2xkIGFmdGVyQmxvY2ssIHdlIG5lZWQgdG8gbWFrZSBvdXIgZGVjaXNpb25cclxuICAgICAgLy8gYWJvdXQgd2hldGhlciB0byBtYXJrIG91ciBvbGQgYWZ0ZXJCbG9jayBhcyByZXVzYWJsZSwgb3Igd2hldGhlciBpdCB3YXMgdXNlZC5cclxuICAgICAgaWYgKCBuZXh0QWZ0ZXJCbG9jayAhPT0gYWZ0ZXJCbG9jayApIHtcclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoICdlbmQgb2YgYWZ0ZXJCbG9jayBzdHJldGNoJyApO1xyXG5cclxuICAgICAgICAvLyBJZiBvdXIgYmxvY2sgd2Fzbid0IGFkZGVkIHlldCwgaXQgd291bGRuJ3QgZXZlciBiZSBhZGRlZCBsYXRlciBuYXR1cmFsbHkgKHNvIHdlIG1hcmsgaXQgYXMgcmV1c2FibGUpLlxyXG4gICAgICAgIGlmICggIXRoaXMuYmxvY2tXYXNBZGRlZCApIHtcclxuICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSggYHVudXNpbmcgJHthZnRlckJsb2NrLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgICAgICAgdGhpcy51bnVzZUJsb2NrKCBhZnRlckJsb2NrICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYmxvY2tXYXNBZGRlZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFya3MgYWxsICdleHRlcm5hbCcgZHJhd2FibGVzIGZyb20gdGhlIGVuZCAoZHJhd2FibGVBZnRlcikgb2YgdGhlIHtDaGFuZ2VJbnRlcnZhbH0gaW50ZXJ2YWwgdG8gZWl0aGVyIHRoZSBlbmRcclxuICAgKiBvZiB0aGVpciBvbGQgYmxvY2sgb3IgdGhlIGRyYXdhYmxlQWZ0ZXIgb2YgdGhlIG5leHQgaW50ZXJ2YWwgKHdoaWNoZXZlciBpcyBzb29uZXIpIGFzIGJlaW5nIG5lZWRlZCB0byBiZSBtb3ZlZCB0b1xyXG4gICAqIG91ciB7QmxvY2t9IG5ld0Jsb2NrLiBUaGUgbmV4dCBwcm9jZXNzSW50ZXJ2YWwgd2lsbCBib3RoIGhhbmRsZSB0aGUgZHJhd2FibGVzIGluc2lkZSB0aGF0IG5leHQgaW50ZXJ2YWwsIGFuZFxyXG4gICAqIHdpbGwgYmUgcmVzcG9uc2libGUgZm9yIHRoZSAnZXh0ZXJuYWwnIGRyYXdhYmxlcyBhZnRlciB0aGF0LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NoYW5nZUludGVydmFsfSBpbnRlcnZhbFxyXG4gICAqIEBwYXJhbSB7QmxvY2t9IG5ld0Jsb2NrXHJcbiAgICovXHJcbiAgY2hhbmdlRXh0ZXJuYWxzKCBpbnRlcnZhbCwgbmV3QmxvY2sgKSB7XHJcbiAgICBjb25zdCBsYXN0RXh0ZXJuYWxEcmF3YWJsZSA9IGdldExhc3RDb21wYXRpYmxlRXh0ZXJuYWxEcmF3YWJsZSggaW50ZXJ2YWwgKTtcclxuICAgIHRoaXMubm90ZVBlbmRpbmdNb3ZlcyggbmV3QmxvY2ssIGludGVydmFsLmRyYXdhYmxlQWZ0ZXIsIGxhc3RFeHRlcm5hbERyYXdhYmxlICk7XHJcblxyXG4gICAgLy8gSWYgd2UgZGlkbid0IG1ha2UgaXQgYWxsIHRoZSB3YXkgdG8gdGhlIG5leHQgY2hhbmdlIGludGVydmFsJ3MgZHJhd2FibGVCZWZvcmUgKHRoZXJlIHdhcyBhbm90aGVyIGJsb2NrXHJcbiAgICAvLyBzdGFydGluZyBiZWZvcmUgdGhlIG5leHQgaW50ZXJ2YWwpLCB3ZSBuZWVkIHRvIGxpbmsgb3VyIG5ldyBibG9jayB0byB0aGF0IG5leHQgYmxvY2suXHJcbiAgICBpZiAoICFpbnRlcnZhbC5uZXh0Q2hhbmdlSW50ZXJ2YWwgfHwgaW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsLmRyYXdhYmxlQmVmb3JlICE9PSBsYXN0RXh0ZXJuYWxEcmF3YWJsZSApIHtcclxuICAgICAgdGhpcy5saW5rQWZ0ZXJEcmF3YWJsZSggbGFzdEV4dGVybmFsRHJhd2FibGUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIGEge0RyYXdhYmxlfSBmaXJzdERyYXdhYmxlIGFuZCB7RHJhd2FibGV9IGxhc3REcmF3YWJsZSwgd2UgbWFyayBhbGwgZHJhd2FibGVzIGluLWJldHdlZW4gKGluY2x1c2l2ZWx5KSBhc1xyXG4gICAqIG5lZWRpbmcgdG8gYmUgbW92ZWQgdG8gb3VyIHtCbG9ja30gbmV3QmxvY2suIFRoaXMgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIG9uIGV4dGVybmFsIGRyYXdhYmxlcywgYW5kIHNob3VsZCBvbmx5XHJcbiAgICogb2NjdXIgYXMgbmVlZGVkIHdpdGggZ2x1ZS91bmdsdWUgY2FzZXMgaW4gdGhlIHN0aXRjaC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCbG9ja30gbmV3QmxvY2tcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBmaXJzdERyYXdhYmxlXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gbGFzdERyYXdhYmxlXHJcbiAgICovXHJcbiAgbm90ZVBlbmRpbmdNb3ZlcyggbmV3QmxvY2ssIGZpcnN0RHJhd2FibGUsIGxhc3REcmF3YWJsZSApIHtcclxuICAgIGZvciAoIGxldCBkcmF3YWJsZSA9IGZpcnN0RHJhd2FibGU7IDsgZHJhd2FibGUgPSBkcmF3YWJsZS5uZXh0RHJhd2FibGUgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFkcmF3YWJsZS5wZW5kaW5nQWRkaXRpb24gJiYgIWRyYXdhYmxlLnBlbmRpbmdSZW1vdmFsLFxyXG4gICAgICAgICdNb3ZlZCBkcmF3YWJsZXMgc2hvdWxkIGJlIHRob3VnaHQgb2YgYXMgdW5jaGFuZ2VkLCBhbmQgdGh1cyBoYXZlIG5vdGhpbmcgcGVuZGluZyB5ZXQnICk7XHJcblxyXG4gICAgICB0aGlzLm5vdGVQZW5kaW5nTW92ZSggZHJhd2FibGUsIG5ld0Jsb2NrICk7XHJcbiAgICAgIGlmICggZHJhd2FibGUgPT09IGxhc3REcmF3YWJsZSApIHsgYnJlYWs7IH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElmIHRoZXJlIGlzIG5vIGN1cnJlbnRCbG9jaywgd2UgY3JlYXRlIG9uZSB0byBtYXRjaC4gT3RoZXJ3aXNlIGlmIHRoZSBjdXJyZW50QmxvY2sgaXMgbWFya2VkIGFzICd1bnVzZWQnIChpLmUuXHJcbiAgICogaXQgaXMgaW4gdGhlIHJldXNhYmxlQmxvY2tzIGFycmF5KSwgd2UgbWFyayBpdCBhcyB1c2VkIHNvIGl0IHdvbid0IG1lIG1hdGNoZWQgZWxzZXdoZXJlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Jsb2NrfSBjdXJyZW50QmxvY2tcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBzb21lSW5jbHVkZWREcmF3YWJsZVxyXG4gICAqIEByZXR1cm5zIHtCbG9ja31cclxuICAgKi9cclxuICBlbnN1cmVVc2VkQmxvY2soIGN1cnJlbnRCbG9jaywgc29tZUluY2x1ZGVkRHJhd2FibGUgKSB7XHJcbiAgICAvLyBpZiB3ZSBoYXZlIGEgbWF0Y2hlZCBibG9jayAob3Igc3RhcnRlZCB3aXRoIG9uZSlcclxuICAgIGlmICggY3VycmVudEJsb2NrICkge1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoIGB1c2luZyBleGlzdGluZyBibG9jazogJHtjdXJyZW50QmxvY2sudG9TdHJpbmcoKX1gICk7XHJcbiAgICAgIC8vIHNpbmNlIG91ciBjdXJyZW50QmxvY2sgbWF5IGJlIGZyb20gcmV1c2FibGVCbG9ja3MsIHdlIHdpbGwgbmVlZCB0byBtYXJrIGl0IGFzIHVzZWQgbm93LlxyXG4gICAgICBpZiAoICFjdXJyZW50QmxvY2sudXNlZCApIHtcclxuICAgICAgICB0aGlzLnVzZUJsb2NrKCBjdXJyZW50QmxvY2sgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIG5lZWQgdG8gY3JlYXRlIG9uZVxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoICdzZWFyY2hpbmcgZm9yIGJsb2NrJyApO1xyXG4gICAgICBjdXJyZW50QmxvY2sgPSB0aGlzLmdldEJsb2NrRm9yUmVuZGVyZXIoIHNvbWVJbmNsdWRlZERyYXdhYmxlLnJlbmRlcmVyLCBzb21lSW5jbHVkZWREcmF3YWJsZSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGN1cnJlbnRCbG9jaztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGVtcHMgdG8gZmluZCBhbiB1bnVzZWQgYmxvY2sgd2l0aCB0aGUgc2FtZSByZW5kZXJlciBpZiBwb3NzaWJsZSwgb3RoZXJ3aXNlIGNyZWF0ZXMgYVxyXG4gICAqIGNvbXBhdGlibGUgYmxvY2suXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIE5PVEU6IHRoaXMgZG9lc24ndCBoYW5kbGUgaG9va2luZyB1cCB0aGUgYmxvY2sgbGlua2VkIGxpc3RcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXHJcbiAgICogQHJldHVybnMge0Jsb2NrfVxyXG4gICAqL1xyXG4gIGdldEJsb2NrRm9yUmVuZGVyZXIoIHJlbmRlcmVyLCBkcmF3YWJsZSApIHtcclxuICAgIGxldCBibG9jaztcclxuXHJcbiAgICAvLyBJZiBpdCdzIG5vdCBhIERPTSBibG9jaywgc2NhbiBvdXIgcmV1c2FibGUgYmxvY2tzIGZvciBvbmUgd2l0aCB0aGUgc2FtZSByZW5kZXJlci5cclxuICAgIC8vIElmIGl0J3MgRE9NLCBpdCBzaG91bGQgYmUgcHJvY2Vzc2VkIGNvcnJlY3RseSBpbiByZXVzYWJsZUJsb2NrcywgYW5kIHdpbGwgbmV2ZXIgcmVhY2ggdGhpcyBwb2ludC5cclxuICAgIGlmICggIVJlbmRlcmVyLmlzRE9NKCByZW5kZXJlciApICkge1xyXG4gICAgICAvLyBiYWNrd2FyZHMgc2NhbiwgaG9wZWZ1bGx5IGl0J3MgZmFzdGVyP1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IHRoaXMucmV1c2FibGVCbG9ja3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgICAgY29uc3QgdG1wQmxvY2sgPSB0aGlzLnJldXNhYmxlQmxvY2tzWyBpIF07XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRtcEJsb2NrLnVzZWQgKTtcclxuICAgICAgICBpZiAoIHRtcEJsb2NrLnJlbmRlcmVyID09PSByZW5kZXJlciApIHtcclxuICAgICAgICAgIHRoaXMudXNlQmxvY2tBdEluZGV4KCB0bXBCbG9jaywgaSApO1xyXG4gICAgICAgICAgYmxvY2sgPSB0bXBCbG9jaztcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICggIWJsb2NrICkge1xyXG4gICAgICAvLyBEaWRuJ3QgZmluZCBpdCBpbiBvdXIgcmV1c2FibGUgYmxvY2tzLCBjcmVhdGUgYSBmcmVzaCBvbmUgZnJvbSBzY3JhdGNoXHJcbiAgICAgIGJsb2NrID0gdGhpcy5jcmVhdGVCbG9jayggcmVuZGVyZXIsIGRyYXdhYmxlICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5ibG9ja09yZGVyQ2hhbmdlZCA9IHRydWU7IC8vIHdlIGNyZWF0ZWQgYSBuZXcgYmxvY2ssIHRoaXMgd2lsbCBhbHdheXMgaGFwcGVuXHJcblxyXG4gICAgcmV0dXJuIGJsb2NrO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFya3MgYSBibG9jayBhcyB1bnVzZWQsIG1vdmluZyBpdCB0byB0aGUgcmV1c2FibGVCbG9ja3MgYXJyYXkuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QmxvY2t9IGJsb2NrXHJcbiAgICovXHJcbiAgdW51c2VCbG9jayggYmxvY2sgKSB7XHJcbiAgICBpZiAoIGJsb2NrLnVzZWQgKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSggYHVudXNpbmcgYmxvY2s6ICR7YmxvY2sudG9TdHJpbmcoKX1gICk7XHJcbiAgICAgIGJsb2NrLnVzZWQgPSBmYWxzZTsgLy8gbWFyayBpdCBhcyB1bnVzZWQgdW50aWwgd2UgcHVsbCBpdCBvdXQgKHNvIHdlIGNhbiByZXVzZSwgb3IgcXVpY2tseSBpZGVudGlmeSlcclxuICAgICAgdGhpcy5yZXVzYWJsZUJsb2Nrcy5wdXNoKCBibG9jayApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSggYG5vdCB1c2luZyBhbHJlYWR5LXVudXNlZCBibG9jazogJHtibG9jay50b1N0cmluZygpfWAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBibG9jayBmcm9tIHRoZSBsaXN0IG9mIHJldXNlZCBibG9ja3MgKGRvbmUgZHVyaW5nIG1hdGNoaW5nKVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Jsb2NrfSBibG9ja1xyXG4gICAqL1xyXG4gIHVzZUJsb2NrKCBibG9jayApIHtcclxuICAgIHRoaXMudXNlQmxvY2tBdEluZGV4KCBibG9jaywgXy5pbmRleE9mKCB0aGlzLnJldXNhYmxlQmxvY2tzLCBibG9jayApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCbG9ja30gYmxvY2tcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcclxuICAgKi9cclxuICB1c2VCbG9ja0F0SW5kZXgoIGJsb2NrLCBpbmRleCApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSggYHVzaW5nIHJldXNhYmxlIGJsb2NrOiAke2Jsb2NrLnRvU3RyaW5nKCl9IHdpdGggcmVuZGVyZXI6ICR7YmxvY2sucmVuZGVyZXJ9YCApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4ID49IDAgJiYgdGhpcy5yZXVzYWJsZUJsb2Nrc1sgaW5kZXggXSA9PT0gYmxvY2ssIGBiYWQgaW5kZXggZm9yIHVzZUJsb2NrQXRJbmRleDogJHtpbmRleH1gICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWJsb2NrLnVzZWQsICdTaG91bGQgYmUgY2FsbGVkIG9uIGFuIHVudXNlZCAocmV1c2FibGUpIGJsb2NrJyApO1xyXG5cclxuICAgIC8vIHJlbW92ZSBpdFxyXG4gICAgdGhpcy5yZXVzYWJsZUJsb2Nrcy5zcGxpY2UoIGluZGV4LCAxICk7XHJcblxyXG4gICAgLy8gbWFyayBpdCBhcyB1c2VkXHJcbiAgICBibG9jay51c2VkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYWxsIG9mIG91ciB1bnVzZWQgYmxvY2tzIGZyb20gb3VyIGRvbUVsZW1lbnQsIGFuZCBtYXJrcyB0aGVtIGZvciBkaXNwb3NhbC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHJlbW92ZVVudXNlZEJsb2NrcygpIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlTdGl0Y2hlciAmJiB0aGlzLnJldXNhYmxlQmxvY2tzLmxlbmd0aCAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyKCAncmVtb3ZlVW51c2VkQmxvY2tzJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG4gICAgd2hpbGUgKCB0aGlzLnJldXNhYmxlQmxvY2tzLmxlbmd0aCApIHtcclxuICAgICAgY29uc3QgYmxvY2sgPSB0aGlzLnJldXNhYmxlQmxvY2tzLnBvcCgpO1xyXG4gICAgICB0aGlzLm1hcmtCbG9ja0ZvckRpc3Bvc2FsKCBibG9jayApO1xyXG4gICAgICB0aGlzLmJsb2NrT3JkZXJDaGFuZ2VkID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlTdGl0Y2hlciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTGlua3MgYmxvY2tzIGJlZm9yZSBhIGRyYXdhYmxlICh3aGV0aGVyIGl0IGlzIHRoZSBmaXJzdCBkcmF3YWJsZSBvciBub3QpXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXHJcbiAgICovXHJcbiAgbGlua0JlZm9yZURyYXdhYmxlKCBkcmF3YWJsZSApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSggYGxpbmsgYmVmb3JlICR7ZHJhd2FibGUudG9TdHJpbmcoKX1gICk7XHJcbiAgICBjb25zdCBiZWZvcmVEcmF3YWJsZSA9IGRyYXdhYmxlLnByZXZpb3VzRHJhd2FibGU7XHJcbiAgICB0aGlzLmxpbmtCbG9ja3MoIGJlZm9yZURyYXdhYmxlID8gYmVmb3JlRHJhd2FibGUucGVuZGluZ1BhcmVudERyYXdhYmxlIDogbnVsbCxcclxuICAgICAgZHJhd2FibGUucGVuZGluZ1BhcmVudERyYXdhYmxlLFxyXG4gICAgICBiZWZvcmVEcmF3YWJsZSxcclxuICAgICAgZHJhd2FibGUgKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBsaW5rcyBibG9ja3MgYWZ0ZXIgYSBkcmF3YWJsZSAod2hldGhlciBpdCBpcyB0aGUgbGFzdCBkcmF3YWJsZSBvciBub3QpXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXHJcbiAgICovXHJcbiAgbGlua0FmdGVyRHJhd2FibGUoIGRyYXdhYmxlICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlKCBgbGluayBhZnRlciAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgY29uc3QgYWZ0ZXJEcmF3YWJsZSA9IGRyYXdhYmxlLm5leHREcmF3YWJsZTtcclxuICAgIHRoaXMubGlua0Jsb2NrcyggZHJhd2FibGUucGVuZGluZ1BhcmVudERyYXdhYmxlLFxyXG4gICAgICBhZnRlckRyYXdhYmxlID8gYWZ0ZXJEcmF3YWJsZS5wZW5kaW5nUGFyZW50RHJhd2FibGUgOiBudWxsLFxyXG4gICAgICBkcmF3YWJsZSxcclxuICAgICAgYWZ0ZXJEcmF3YWJsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHRvIG1hcmsgYSBib3VuZGFyeSBiZXR3ZWVuIGJsb2Nrcywgb3IgYXQgdGhlIGVuZCBvZiBvdXIgbGlzdCBvZiBibG9ja3MgKG9uZSBibG9jay9kcmF3YWJsZSBwYWlyIGJlaW5nXHJcbiAgICogbnVsbCBub3RlcyB0aGF0IGl0IGlzIHRoZSBzdGFydC9lbmQsIGFuZCB0aGVyZSBpcyBubyBwcmV2aW91cy9uZXh0IGJsb2NrKS5cclxuICAgKiBUaGlzIHVwZGF0ZXMgdGhlIGJsb2NrIGxpbmtlZC1saXN0IGFzIG5lY2Vzc2FyeSAobm90aW5nIGNoYW5nZXMgd2hlbiB0aGV5IG9jY3VyKSBzbyB0aGF0IHdlIGNhbiByZWJ1aWxkIGFuIGFycmF5XHJcbiAgICogYXQgdGhlIGVuZCBvZiB0aGUgc3RpdGNoLCBhdm9pZGluZyBPKG5eMikgaXNzdWVzIGlmIHdlIHdlcmUgdG8gZG8gYmxvY2stYXJyYXktaW5kZXggbG9va3VwcyBkdXJpbmcgbGlua2luZ1xyXG4gICAqIG9wZXJhdGlvbnMgKHRoaXMgcmVzdWx0cyBpbiBsaW5lYXIgdGltZSBmb3IgYmxvY2tzKS5cclxuICAgKiBJdCBhbHNvIG1hcmtzIGJsb2NrIGJvdW5kYXJpZXMgYXMgZGlydHkgd2hlbiBuZWNlc3NhcnksIHNvIHRoYXQgd2UgY2FuIG1ha2Ugb25lIHBhc3MgdGhyb3VnaCB3aXRoXHJcbiAgICogdXBkYXRlQmxvY2tJbnRlcnZhbHMoKSB0aGF0IHVwZGF0ZXMgYWxsIG9mIHRoZSBibG9jaydzIGJvdW5kYXJpZXMgKGF2b2lkaW5nIG1vcmUgdGhhbiBvbmUgdXBkYXRlIHBlciBibG9jayBwZXJcclxuICAgKiBmcmFtZSkuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QmxvY2t8bnVsbH0gYmVmb3JlQmxvY2tcclxuICAgKiBAcGFyYW0ge0Jsb2NrfG51bGx9IGFmdGVyQmxvY2tcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfG51bGx9IGJlZm9yZURyYXdhYmxlXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZXxudWxsfSBhZnRlckRyYXdhYmxlXHJcbiAgICovXHJcbiAgbGlua0Jsb2NrcyggYmVmb3JlQmxvY2ssIGFmdGVyQmxvY2ssIGJlZm9yZURyYXdhYmxlLCBhZnRlckRyYXdhYmxlICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyICYmIHNjZW5lcnlMb2cuR3JlZWR5U3RpdGNoZXIoIGBsaW5raW5nIGJsb2NrczogJHtcclxuICAgICAgYmVmb3JlQmxvY2sgPyAoIGAke2JlZm9yZUJsb2NrLnRvU3RyaW5nKCl9ICgke2JlZm9yZURyYXdhYmxlLnRvU3RyaW5nKCl9KWAgKSA6ICdudWxsJ1xyXG4gICAgfSB0byAke1xyXG4gICAgICBhZnRlckJsb2NrID8gKCBgJHthZnRlckJsb2NrLnRvU3RyaW5nKCl9ICgke2FmdGVyRHJhd2FibGUudG9TdHJpbmcoKX0pYCApIDogJ251bGwnfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlTdGl0Y2hlciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAoIGJlZm9yZUJsb2NrID09PSBudWxsICYmIGJlZm9yZURyYXdhYmxlID09PSBudWxsICkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICggYmVmb3JlQmxvY2sgaW5zdGFuY2VvZiBCbG9jayAmJiBiZWZvcmVEcmF3YWJsZSBpbnN0YW5jZW9mIERyYXdhYmxlICkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICggYWZ0ZXJCbG9jayA9PT0gbnVsbCAmJiBhZnRlckRyYXdhYmxlID09PSBudWxsICkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICggYWZ0ZXJCbG9jayBpbnN0YW5jZW9mIEJsb2NrICYmIGFmdGVyRHJhd2FibGUgaW5zdGFuY2VvZiBEcmF3YWJsZSApICk7XHJcblxyXG4gICAgaWYgKCBiZWZvcmVCbG9jayApIHtcclxuICAgICAgaWYgKCBiZWZvcmVCbG9jay5uZXh0QmxvY2sgIT09IGFmdGVyQmxvY2sgKSB7XHJcbiAgICAgICAgdGhpcy5ibG9ja09yZGVyQ2hhbmdlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIGRpc2Nvbm5lY3QgZnJvbSB0aGUgcHJldmlvdXNseS1jb25uZWN0ZWQgYmxvY2sgKGlmIGFueSlcclxuICAgICAgICBpZiAoIGJlZm9yZUJsb2NrLm5leHRCbG9jayApIHtcclxuICAgICAgICAgIGJlZm9yZUJsb2NrLm5leHRCbG9jay5wcmV2aW91c0Jsb2NrID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGJlZm9yZUJsb2NrLm5leHRCbG9jayA9IGFmdGVyQmxvY2s7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5tYXJrQWZ0ZXJCbG9jayggYmVmb3JlQmxvY2ssIGJlZm9yZURyYXdhYmxlICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIGFmdGVyQmxvY2sgKSB7XHJcbiAgICAgIGlmICggYWZ0ZXJCbG9jay5wcmV2aW91c0Jsb2NrICE9PSBiZWZvcmVCbG9jayApIHtcclxuICAgICAgICB0aGlzLmJsb2NrT3JkZXJDaGFuZ2VkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gZGlzY29ubmVjdCBmcm9tIHRoZSBwcmV2aW91c2x5LWNvbm5lY3RlZCBibG9jayAoaWYgYW55KVxyXG4gICAgICAgIGlmICggYWZ0ZXJCbG9jay5wcmV2aW91c0Jsb2NrICkge1xyXG4gICAgICAgICAgYWZ0ZXJCbG9jay5wcmV2aW91c0Jsb2NrLm5leHRCbG9jayA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhZnRlckJsb2NrLnByZXZpb3VzQmxvY2sgPSBiZWZvcmVCbG9jaztcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1hcmtCZWZvcmVCbG9jayggYWZ0ZXJCbG9jaywgYWZ0ZXJEcmF3YWJsZSApO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlTdGl0Y2hlciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVidWlsZHMgdGhlIGJhY2tib25lJ3MgYmxvY2sgYXJyYXkgZnJvbSBvdXIgbGlua2VkLWxpc3QgZGF0YS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCYWNrYm9uZURyYXdhYmxlfSBiYWNrYm9uZVxyXG4gICAqIEBwYXJhbSB7QmxvY2t8bnVsbH0gZmlyc3RCbG9ja1xyXG4gICAqIEBwYXJhbSB7QmxvY2t8bnVsbH0gbGFzdEJsb2NrXHJcbiAgICovXHJcbiAgcHJvY2Vzc0Jsb2NrTGlua2VkTGlzdCggYmFja2JvbmUsIGZpcnN0QmxvY2ssIGxhc3RCbG9jayApIHtcclxuICAgIC8vIGZvciBub3csIGp1c3QgY2xlYXIgb3V0IHRoZSBhcnJheSBmaXJzdFxyXG4gICAgd2hpbGUgKCBiYWNrYm9uZS5ibG9ja3MubGVuZ3RoICkge1xyXG4gICAgICBiYWNrYm9uZS5ibG9ja3MucG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyICYmIHNjZW5lcnlMb2cuR3JlZWR5U3RpdGNoZXIoIGBwcm9jZXNzQmxvY2tMaW5rZWRMaXN0OiAke2ZpcnN0QmxvY2sudG9TdHJpbmcoKX0gdG8gJHtsYXN0QmxvY2sudG9TdHJpbmcoKX1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5U3RpdGNoZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gbGVhdmUgdGhlIGFycmF5IGFzLWlzIGlmIHRoZXJlIGFyZSBubyBibG9ja3NcclxuICAgIGlmICggZmlyc3RCbG9jayApIHtcclxuXHJcbiAgICAgIC8vIHJld3JpdGUgaXQgc3RhcnRpbmcgd2l0aCB0aGUgZmlyc3QgYmxvY2tcclxuICAgICAgZm9yICggbGV0IGJsb2NrID0gZmlyc3RCbG9jazsgOyBibG9jayA9IGJsb2NrLm5leHRCbG9jayApIHtcclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5U3RpdGNoZXIgJiYgc2NlbmVyeUxvZy5HcmVlZHlTdGl0Y2hlciggYmxvY2sudG9TdHJpbmcoKSApO1xyXG5cclxuICAgICAgICBiYWNrYm9uZS5ibG9ja3MucHVzaCggYmxvY2sgKTtcclxuXHJcbiAgICAgICAgaWYgKCBibG9jayA9PT0gbGFzdEJsb2NrICkgeyBicmVhazsgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnR3JlZWR5U3RpdGNoZXInLCBHcmVlZHlTdGl0Y2hlciApO1xyXG5leHBvcnQgZGVmYXVsdCBHcmVlZHlTdGl0Y2hlcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0scUNBQXFDO0FBQzVELFNBQVNDLEtBQUssRUFBRUMsY0FBYyxFQUFFQyxRQUFRLEVBQUVDLFFBQVEsRUFBRUMsT0FBTyxFQUFFQyxRQUFRLFFBQVEsZUFBZTs7QUFFNUY7QUFDQSxTQUFTQyxzQkFBc0JBLENBQUVDLENBQUMsRUFBRUMsQ0FBQyxFQUFHO0VBQ3RDLE9BQU9ELENBQUMsQ0FBQ0UsUUFBUSxLQUFLRCxDQUFDLENBQUNDLFFBQVEsSUFBSU4sUUFBUSxDQUFDTyxLQUFLLENBQUVILENBQUMsQ0FBQ0UsUUFB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