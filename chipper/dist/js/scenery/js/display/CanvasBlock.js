// Copyright 2013-2022, University of Colorado Boulder

/**
 * Handles a visual Canvas layer of drawables.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Matrix3 from '../../../dot/js/Matrix3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import Poolable from '../../../phet-core/js/Poolable.js';
import { CanvasContextWrapper, Features, FittedBlock, Renderer, scenery, Utils } from '../imports.js';
const scratchMatrix = new Matrix3();
const scratchMatrix2 = new Matrix3();
class CanvasBlock extends FittedBlock {
  /**
   * @mixes Poolable
   *
   * @param {Display} display
   * @param {number} renderer - See Renderer.js for more information
   * @param {Instance} transformRootInstance
   * @param {Instance} filterRootInstance
   */
  constructor(display, renderer, transformRootInstance, filterRootInstance) {
    super();
    this.initialize(display, renderer, transformRootInstance, filterRootInstance);
  }

  /**
   * @public
   *
   * @param {Display} display
   * @param {number} renderer
   * @param {Instance} transformRootInstance
   * @param {Instance} filterRootInstance
   */
  initialize(display, renderer, transformRootInstance, filterRootInstance) {
    super.initialize(display, renderer, transformRootInstance, FittedBlock.COMMON_ANCESTOR);

    // @private {Instance}
    this.filterRootInstance = filterRootInstance;

    // @private {Array.<Drawable>}
    this.dirtyDrawables = cleanArray(this.dirtyDrawables);
    if (!this.domElement) {
      //OHTWO TODO: support tiled Canvas handling (will need to wrap then in a div, or something)
      // @public {HTMLCanvasElement}
      this.canvas = document.createElement('canvas');
      this.canvas.style.position = 'absolute';
      this.canvas.style.left = '0';
      this.canvas.style.top = '0';
      this.canvas.style.pointerEvents = 'none';

      // @private {number} - unique ID so that we can support rasterization with Display.foreignObjectRasterization
      this.canvasId = this.canvas.id = `scenery-canvas${this.id}`;

      // @private {CanvasRenderingContext2D}
      this.context = this.canvas.getContext('2d');
      this.context.save(); // We always immediately save every Canvas so we can restore/save for clipping

      // workaround for Chrome (WebKit) miterLimit bug: https://bugs.webkit.org/show_bug.cgi?id=108763
      this.context.miterLimit = 20;
      this.context.miterLimit = 10;

      // @private {CanvasContextWrapper} - Tracks intermediate Canvas context state, so we don't have to send
      // unnecessary Canvas commands.
      this.wrapper = new CanvasContextWrapper(this.canvas, this.context);

      // @public {DOMElement} - TODO: Doc this properly for {Block} as a whole
      this.domElement = this.canvas;

      // {Array.<CanvasContextWrapper>} as multiple Canvases are needed to properly render opacity within the block.
      this.wrapperStack = [this.wrapper];
    }

    // {number} - The index into the wrapperStack array where our current Canvas (that we are drawing to) is.
    this.wrapperStackIndex = 0;

    // @private {Object.<nodeId:number,number> - Maps node ID => count of how many listeners we WOULD have attached to
    // it. We only attach at most one listener to each node. We need to listen to all ancestors up to our filter root,
    // so that we can pick up opacity changes.
    this.filterListenerCountMap = this.filterListenerCountMap || {};

    // Reset any fit transforms that were applied
    Utils.prepareForTransform(this.canvas); // Apply CSS needed for future CSS transforms to work properly.
    Utils.unsetTransform(this.canvas); // clear out any transforms that could have been previously applied

    // @private {Vector2}
    this.canvasDrawOffset = new Vector2(0, 0);

    // @private {Drawable|null}
    this.currentDrawable = null;

    // @private {boolean} - Whether we need to re-apply clipping to our current Canvas
    this.clipDirty = true;

    // @private {number} - How many clips should be applied (given our current "position" in the walk up/down).
    this.clipCount = 0;

    // @private {number} - store our backing scale so we don't have to look it up while fitting
    this.backingScale = renderer & Renderer.bitmaskCanvasLowResolution ? 1 : Utils.backingScale(this.context);
    // TODO: > You can use window.matchMedia() to check if the value of devicePixelRatio changes (which can happen,
    // TODO: > for example, if the user drags the window to a display with a different pixel density).
    // TODO: OH NO, we may need to figure out watching this?

    // @private {function}
    this.clipDirtyListener = this.markDirty.bind(this);
    this.opacityDirtyListener = this.markDirty.bind(this);
    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`initialized #${this.id}`);
    // TODO: dirty list of nodes (each should go dirty only once, easier than scanning all?)
  }

  /**
   * @public
   * @override
   */
  setSizeFullDisplay() {
    const size = this.display.getSize();
    this.canvas.width = size.width * this.backingScale;
    this.canvas.height = size.height * this.backingScale;
    this.canvas.style.width = `${size.width}px`;
    this.canvas.style.height = `${size.height}px`;
    this.wrapper.resetStyles();
    this.canvasDrawOffset.setXY(0, 0);
    Utils.unsetTransform(this.canvas);
  }

  /**
   * @public
   * @override
   */
  setSizeFitBounds() {
    const x = this.fitBounds.minX;
    const y = this.fitBounds.minY;
    this.canvasDrawOffset.setXY(-x, -y); // subtract off so we have a tight fit
    //OHTWO TODO PERFORMANCE: see if we can get a speedup by putting the backing scale in our transform instead of with CSS?
    Utils.setTransform(`matrix(1,0,0,1,${x},${y})`, this.canvas); // reapply the translation as a CSS transform
    this.canvas.width = this.fitBounds.width * this.backingScale;
    this.canvas.height = this.fitBounds.height * this.backingScale;
    this.canvas.style.width = `${this.fitBounds.width}px`;
    this.canvas.style.height = `${this.fitBounds.height}px`;
    this.wrapper.resetStyles();
  }

  /**
   * Updates the DOM appearance of this drawable (whether by preparing/calling draw calls, DOM element updates, etc.)
   * @public
   * @override
   *
   * @returns {boolean} - Whether the update should continue (if false, further updates in supertype steps should not
   *                      be done).
   */
  update() {
    // See if we need to actually update things (will bail out if we are not dirty, or if we've been disposed)
    if (!super.update()) {
      return false;
    }
    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`update #${this.id}`);
    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.push();
    while (this.dirtyDrawables.length) {
      this.dirtyDrawables.pop().update();
    }

    // udpate the fit BEFORE drawing, since it may change our offset
    this.updateFit();

    // for now, clear everything!
    this.context.restore(); // just in case we were clipping/etc.
    this.context.setTransform(1, 0, 0, 1, 0, 0); // identity
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear everything
    this.context.save();
    this.wrapper.resetStyles();

    //OHTWO TODO: PERFORMANCE: create an array for faster drawable iteration (this is probably a hellish memory access pattern)
    //OHTWO TODO: why is "drawable !== null" check needed
    this.currentDrawable = null; // we haven't rendered a drawable this frame yet
    for (let drawable = this.firstDrawable; drawable !== null; drawable = drawable.nextDrawable) {
      this.renderDrawable(drawable);
      if (drawable === this.lastDrawable) {
        break;
      }
    }
    if (this.currentDrawable) {
      this.walkDown(this.currentDrawable.instance.trail, 0);
    }
    assert && assert(this.clipCount === 0, 'clipCount should be zero after walking back down');
    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.pop();
    return true;
  }

  /**
   * Reapplies clips to the current context. It's necessary to fully apply every clipping area for every ancestor,
   * due to how Canvas is set up. Should ideally be called when the clip is dirty.
   * @private
   *
   * This is necessary since you can't apply "nested" clipping areas naively in Canvas, but you specify one entire
   * clip area.
   *
   * @param {CanvasSelfDrawable} Drawable
   */
  applyClip(drawable) {
    this.clipDirty = false;
    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`Apply clip ${drawable.instance.trail.toDebugString()}`);
    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.push();
    const wrapper = this.wrapperStack[this.wrapperStackIndex];
    const context = wrapper.context;

    // Re-set (even if no clip is needed, so we get rid of the old clip)
    context.restore();
    context.save();
    wrapper.resetStyles();

    // If 0, no clip is needed
    if (this.clipCount) {
      const instance = drawable.instance;
      const trail = instance.trail;

      // Inverse of what we'll be applying to the scene, to get back to the root coordinate transform
      scratchMatrix.rowMajor(this.backingScale, 0, this.canvasDrawOffset.x * this.backingScale, 0, this.backingScale, this.canvasDrawOffset.y * this.backingScale, 0, 0, 1);
      scratchMatrix2.set(this.transformRootInstance.trail.getMatrix()).invert();
      scratchMatrix2.multiplyMatrix(scratchMatrix).canvasSetTransform(context);

      // Recursively apply clips and transforms
      for (let i = 0; i < trail.length; i++) {
        const node = trail.nodes[i];
        node.getMatrix().canvasAppendTransform(context);
        if (node.hasClipArea()) {
          context.beginPath();
          node.clipArea.writeToContext(context);
          // TODO: add the ability to show clipping highlights inline?
          // context.save();
          // context.strokeStyle = 'red';
          // context.lineWidth = 2;
          // context.stroke();
          // context.restore();
          context.clip();
        }
      }
    }
    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.pop();
  }

  /**
   * Pushes a wrapper onto our stack (creating if necessary), and initializes.
   * @private
   */
  pushWrapper() {
    this.wrapperStackIndex++;
    this.clipDirty = true;

    // If we need to push an entirely new Canvas to the stack
    if (this.wrapperStackIndex === this.wrapperStack.length) {
      const newCanvas = document.createElement('canvas');
      const newContext = newCanvas.getContext('2d');
      newContext.save();
      this.wrapperStack.push(new CanvasContextWrapper(newCanvas, newContext));
    }
    const wrapper = this.wrapperStack[this.wrapperStackIndex];
    const context = wrapper.context;

    // Size and clear our context
    wrapper.setDimensions(this.canvas.width, this.canvas.height);
    context.setTransform(1, 0, 0, 1, 0, 0); // identity
    context.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear everything
  }

  /**
   * Pops a wrapper off of our stack.
   * @private
   */
  popWrapper() {
    this.wrapperStackIndex--;
    this.clipDirty = true;
  }

  /**
   * Walk down towards the root, popping any clip/opacity effects that were needed.
   * @private
   *
   * @param {Trail} trail
   * @param {number} branchIndex - The first index where our before and after trails have diverged.
   */
  walkDown(trail, branchIndex) {
    const filterRootIndex = this.filterRootInstance.trail.length - 1;
    for (let i = trail.length - 1; i >= branchIndex; i--) {
      const node = trail.nodes[i];
      if (node.hasClipArea()) {
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`Pop clip ${trail.subtrailTo(node).toDebugString()}`);
        // Pop clip
        this.clipCount--;
        this.clipDirty = true;
      }

      // We should not apply opacity or other filters at or below the filter root
      if (i > filterRootIndex) {
        if (node._filters.length) {
          sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`Pop filters ${trail.subtrailTo(node).toDebugString()}`);
          const topWrapper = this.wrapperStack[this.wrapperStackIndex];
          const bottomWrapper = this.wrapperStack[this.wrapperStackIndex - 1];
          this.popWrapper();
          bottomWrapper.context.setTransform(1, 0, 0, 1, 0, 0);
          const filters = node._filters;
          // We need to fall back to a different filter behavior with Chrome, since it over-darkens otherwise with the
          // built-in feature.
          // NOTE: Not blocking chromium anymore, see https://github.com/phetsims/scenery/issues/1139
          // We'll go for the higher-performance but potentially-visually-different option.
          let canUseInternalFilter = Features.canvasFilter;
          for (let j = 0; j < filters.length; j++) {
            // If we use context.filter, it's equivalent to checking DOM compatibility on all of them.
            canUseInternalFilter = canUseInternalFilter && filters[j].isDOMCompatible();
          }
          if (canUseInternalFilter) {
            // Draw using the context.filter operation
            let filterString = '';
            for (let j = 0; j < filters.length; j++) {
              filterString += `${filterString ? ' ' : ''}${filters[j].getCSSFilterString()}`;
            }
            bottomWrapper.context.filter = filterString;
            bottomWrapper.context.drawImage(topWrapper.canvas, 0, 0);
            bottomWrapper.context.filter = 'none';
          } else {
            // Draw by manually manipulating the ImageData pixels of the top Canvas, then draw it in.
            for (let j = 0; j < filters.length; j++) {
              filters[j].applyCanvasFilter(topWrapper);
            }
            bottomWrapper.context.drawImage(topWrapper.canvas, 0, 0);
          }
        }
        if (node.getEffectiveOpacity() !== 1) {
          sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`Pop opacity ${trail.subtrailTo(node).toDebugString()}`);
          // Pop opacity
          const topWrapper = this.wrapperStack[this.wrapperStackIndex];
          const bottomWrapper = this.wrapperStack[this.wrapperStackIndex - 1];
          this.popWrapper();

          // Draw the transparent content into the next-level Canvas.
          bottomWrapper.context.setTransform(1, 0, 0, 1, 0, 0);
          bottomWrapper.context.globalAlpha = node.getEffectiveOpacity();
          bottomWrapper.context.drawImage(topWrapper.canvas, 0, 0);
          bottomWrapper.context.globalAlpha = 1;
        }
      }
    }
  }

  /**
   * Walk up towards the next leaf, pushing any clip/opacity effects that are needed.
   * @private
   *
   * @param {Trail} trail
   * @param {number} branchIndex - The first index where our before and after trails have diverged.
   */
  walkUp(trail, branchIndex) {
    const filterRootIndex = this.filterRootInstance.trail.length - 1;
    for (let i = branchIndex; i < trail.length; i++) {
      const node = trail.nodes[i];

      // We should not apply opacity at or below the filter root
      if (i > filterRootIndex) {
        if (node.getEffectiveOpacity() !== 1) {
          sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`Push opacity ${trail.subtrailTo(node).toDebugString()}`);

          // Push opacity
          this.pushWrapper();
        }
        if (node._filters.length) {
          sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`Push filters ${trail.subtrailTo(node).toDebugString()}`);

          // Push filters
          this.pushWrapper();
        }
      }
      if (node.hasClipArea()) {
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`Push clip ${trail.subtrailTo(node).toDebugString()}`);
        // Push clip
        this.clipCount++;
        this.clipDirty = true;
      }
    }
  }

  /**
   * Draws the drawable into our main Canvas.
   * @private
   *
   * For things like opacity/clipping, as part of this we walk up/down part of the instance tree for rendering each
   * drawable.
   *
   * @param {CanvasSelfDrawable} - TODO: In the future, we'll need to support Canvas caches (this should be updated
   *                               with a proper generalized type)
   */
  renderDrawable(drawable) {
    // do not paint invisible drawables, or drawables that are out of view
    if (!drawable.visible || this.canvas.width === 0 || this.canvas.height === 0) {
      return;
    }
    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`renderDrawable #${drawable.id} ${drawable.instance.trail.toDebugString()}`);
    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.push();

    // For opacity/clip, walk up/down as necessary (Can only walk down if we are not the first drawable)
    const branchIndex = this.currentDrawable ? drawable.instance.getBranchIndexTo(this.currentDrawable.instance) : 0;
    if (this.currentDrawable) {
      this.walkDown(this.currentDrawable.instance.trail, branchIndex);
    }
    this.walkUp(drawable.instance.trail, branchIndex);
    const wrapper = this.wrapperStack[this.wrapperStackIndex];
    const context = wrapper.context;

    // Re-apply the clip if necessary. The walk down/up may have flagged a potential clip change (if we walked across
    // something with a clip area).
    if (this.clipDirty) {
      this.applyClip(drawable);
    }

    // we're directly accessing the relative transform below, so we need to ensure that it is up-to-date
    assert && assert(drawable.instance.relativeTransform.isValidationNotNeeded());
    const matrix = drawable.instance.relativeTransform.matrix;

    // set the correct (relative to the transform root) transform up, instead of walking the hierarchy (for now)
    //OHTWO TODO: should we start premultiplying these matrices to remove this bottleneck?
    context.setTransform(this.backingScale, 0, 0, this.backingScale, this.canvasDrawOffset.x * this.backingScale, this.canvasDrawOffset.y * this.backingScale);
    if (drawable.instance !== this.transformRootInstance) {
      matrix.canvasAppendTransform(context);
    }

    // paint using its local coordinate frame
    drawable.paintCanvas(wrapper, drawable.instance.node, drawable.instance.relativeTransform.matrix);
    this.currentDrawable = drawable;
    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.pop();
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`dispose #${this.id}`);

    // clear references
    this.transformRootInstance = null;
    cleanArray(this.dirtyDrawables);

    // minimize memory exposure of the backing raster
    this.canvas.width = 0;
    this.canvas.height = 0;
    super.dispose();
  }

  /**
   * @public
   *
   * @param {Drawable} drawable
   */
  markDirtyDrawable(drawable) {
    sceneryLog && sceneryLog.dirty && sceneryLog.dirty(`markDirtyDrawable on CanvasBlock#${this.id} with ${drawable.toString()}`);
    assert && assert(drawable);
    if (assert) {
      // Catch infinite loops
      this.display.ensureNotPainting();
    }

    // TODO: instance check to see if it is a canvas cache (usually we don't need to call update on our drawables)
    this.dirtyDrawables.push(drawable);
    this.markDirty();
  }

  /**
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */
  addDrawable(drawable) {
    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`#${this.id}.addDrawable ${drawable.toString()}`);
    super.addDrawable(drawable);

    // Add opacity listeners (from this node up to the filter root)
    for (let instance = drawable.instance; instance && instance !== this.filterRootInstance; instance = instance.parent) {
      const node = instance.node;

      // Only add the listener if we don't already have one
      if (this.filterListenerCountMap[node.id]) {
        this.filterListenerCountMap[node.id]++;
      } else {
        this.filterListenerCountMap[node.id] = 1;
        node.filterChangeEmitter.addListener(this.opacityDirtyListener);
        node.clipAreaProperty.lazyLink(this.clipDirtyListener);
      }
    }
  }

  /**
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */
  removeDrawable(drawable) {
    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`#${this.id}.removeDrawable ${drawable.toString()}`);

    // Remove opacity listeners (from this node up to the filter root)
    for (let instance = drawable.instance; instance && instance !== this.filterRootInstance; instance = instance.parent) {
      const node = instance.node;
      assert && assert(this.filterListenerCountMap[node.id] > 0);
      this.filterListenerCountMap[node.id]--;
      if (this.filterListenerCountMap[node.id] === 0) {
        delete this.filterListenerCountMap[node.id];
        node.clipAreaProperty.unlink(this.clipDirtyListener);
        node.filterChangeEmitter.removeListener(this.opacityDirtyListener);
      }
    }
    super.removeDrawable(drawable);
  }

  /**
   * @public
   * @override
   *
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   */
  onIntervalChange(firstDrawable, lastDrawable) {
    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`#${this.id}.onIntervalChange ${firstDrawable.toString()} to ${lastDrawable.toString()}`);
    super.onIntervalChange(firstDrawable, lastDrawable);

    // If we have an interval change, we'll need to ensure we repaint (even if we're full-display). This was a missed
    // case for https://github.com/phetsims/scenery/issues/512, where it would only clear if it was a common-ancestor
    // fitted block.
    this.markDirty();
  }

  /**
   * @public
   *
   * @param {Drawable} drawable
   */
  onPotentiallyMovedDrawable(drawable) {
    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`#${this.id}.onPotentiallyMovedDrawable ${drawable.toString()}`);
    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.push();
    assert && assert(drawable.parentDrawable === this);

    // For now, mark it as dirty so that we redraw anything containing it. In the future, we could have more advanced
    // behavior that figures out the intersection-region for what was moved and what it was moved past, but that's
    // a harder problem.
    drawable.markDirty();
    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.pop();
  }

  /**
   * Returns a string form of this object
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `CanvasBlock#${this.id}-${FittedBlock.fitString[this.fit]}`;
  }
}
scenery.register('CanvasBlock', CanvasBlock);
Poolable.mixInto(CanvasBlock);
export default CanvasBlock;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXgzIiwiVmVjdG9yMiIsImNsZWFuQXJyYXkiLCJQb29sYWJsZSIsIkNhbnZhc0NvbnRleHRXcmFwcGVyIiwiRmVhdHVyZXMiLCJGaXR0ZWRCbG9jayIsIlJlbmRlcmVyIiwic2NlbmVyeSIsIlV0aWxzIiwic2NyYXRjaE1hdHJpeCIsInNjcmF0Y2hNYXRyaXgyIiwiQ2FudmFzQmxvY2siLCJjb25zdHJ1Y3RvciIsImRpc3BsYXkiLCJyZW5kZXJlciIsInRyYW5zZm9ybVJvb3RJbnN0YW5jZSIsImZpbHRlclJvb3RJbnN0YW5jZSIsImluaXRpYWxpemUiLCJDT01NT05fQU5DRVNUT1IiLCJkaXJ0eURyYXdhYmxlcyIsImRvbUVsZW1lbnQiLCJjYW52YXMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsInBvc2l0aW9uIiwibGVmdCIsInRvcCIsInBvaW50ZXJFdmVudHMiLCJjYW52YXNJZCIsImlkIiwiY29udGV4dCIsImdldENvbnRleHQiLCJzYXZlIiwibWl0ZXJMaW1pdCIsIndyYXBwZXIiLCJ3cmFwcGVyU3RhY2siLCJ3cmFwcGVyU3RhY2tJbmRleCIsImZpbHRlckxpc3RlbmVyQ291bnRNYXAiLCJwcmVwYXJlRm9yVHJhbnNmb3JtIiwidW5zZXRUcmFuc2Zvcm0iLCJjYW52YXNEcmF3T2Zmc2V0IiwiY3VycmVudERyYXdhYmxlIiwiY2xpcERpcnR5IiwiY2xpcENvdW50IiwiYmFja2luZ1NjYWxlIiwiYml0bWFza0NhbnZhc0xvd1Jlc29sdXRpb24iLCJjbGlwRGlydHlMaXN0ZW5lciIsIm1hcmtEaXJ0eSIsImJpbmQiLCJvcGFjaXR5RGlydHlMaXN0ZW5lciIsInNjZW5lcnlMb2ciLCJzZXRTaXplRnVsbERpc3BsYXkiLCJzaXplIiwiZ2V0U2l6ZSIsIndpZHRoIiwiaGVpZ2h0IiwicmVzZXRTdHlsZXMiLCJzZXRYWSIsInNldFNpemVGaXRCb3VuZHMiLCJ4IiwiZml0Qm91bmRzIiwibWluWCIsInkiLCJtaW5ZIiwic2V0VHJhbnNmb3JtIiwidXBkYXRlIiwicHVzaCIsImxlbmd0aCIsInBvcCIsInVwZGF0ZUZpdCIsInJlc3RvcmUiLCJjbGVhclJlY3QiLCJkcmF3YWJsZSIsImZpcnN0RHJhd2FibGUiLCJuZXh0RHJhd2FibGUiLCJyZW5kZXJEcmF3YWJsZSIsImxhc3REcmF3YWJsZSIsIndhbGtEb3duIiwiaW5zdGFuY2UiLCJ0cmFpbCIsImFzc2VydCIsImFwcGx5Q2xpcCIsInRvRGVidWdTdHJpbmciLCJyb3dNYWpvciIsInNldCIsImdldE1hdHJpeCIsImludmVydCIsIm11bHRpcGx5TWF0cml4IiwiY2FudmFzU2V0VHJhbnNmb3JtIiwiaSIsIm5vZGUiLCJub2RlcyIsImNhbnZhc0FwcGVuZFRyYW5zZm9ybSIsImhhc0NsaXBBcmVhIiwiYmVnaW5QYXRoIiwiY2xpcEFyZWEiLCJ3cml0ZVRvQ29udGV4dCIsImNsaXAiLCJwdXNoV3JhcHBlciIsIm5ld0NhbnZhcyIsIm5ld0NvbnRleHQiLCJzZXREaW1lbnNpb25zIiwicG9wV3JhcHBlciIsImJyYW5jaEluZGV4IiwiZmlsdGVyUm9vdEluZGV4Iiwic3VidHJhaWxUbyIsIl9maWx0ZXJzIiwidG9wV3JhcHBlciIsImJvdHRvbVdyYXBwZXIiLCJmaWx0ZXJzIiwiY2FuVXNlSW50ZXJuYWxGaWx0ZXIiLCJjYW52YXNGaWx0ZXIiLCJqIiwiaXNET01Db21wYXRpYmxlIiwiZmlsdGVyU3RyaW5nIiwiZ2V0Q1NTRmlsdGVyU3RyaW5nIiwiZmlsdGVyIiwiZHJhd0ltYWdlIiwiYXBwbHlDYW52YXNGaWx0ZXIiLCJnZXRFZmZlY3RpdmVPcGFjaXR5IiwiZ2xvYmFsQWxwaGEiLCJ3YWxrVXAiLCJ2aXNpYmxlIiwiZ2V0QnJhbmNoSW5kZXhUbyIsInJlbGF0aXZlVHJhbnNmb3JtIiwiaXNWYWxpZGF0aW9uTm90TmVlZGVkIiwibWF0cml4IiwicGFpbnRDYW52YXMiLCJkaXNwb3NlIiwibWFya0RpcnR5RHJhd2FibGUiLCJkaXJ0eSIsInRvU3RyaW5nIiwiZW5zdXJlTm90UGFpbnRpbmciLCJhZGREcmF3YWJsZSIsInBhcmVudCIsImZpbHRlckNoYW5nZUVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImNsaXBBcmVhUHJvcGVydHkiLCJsYXp5TGluayIsInJlbW92ZURyYXdhYmxlIiwidW5saW5rIiwicmVtb3ZlTGlzdGVuZXIiLCJvbkludGVydmFsQ2hhbmdlIiwib25Qb3RlbnRpYWxseU1vdmVkRHJhd2FibGUiLCJwYXJlbnREcmF3YWJsZSIsImZpdFN0cmluZyIsImZpdCIsInJlZ2lzdGVyIiwibWl4SW50byJdLCJzb3VyY2VzIjpbIkNhbnZhc0Jsb2NrLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEhhbmRsZXMgYSB2aXN1YWwgQ2FudmFzIGxheWVyIG9mIGRyYXdhYmxlcy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XHJcbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xyXG5pbXBvcnQgeyBDYW52YXNDb250ZXh0V3JhcHBlciwgRmVhdHVyZXMsIEZpdHRlZEJsb2NrLCBSZW5kZXJlciwgc2NlbmVyeSwgVXRpbHMgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbmNvbnN0IHNjcmF0Y2hNYXRyaXggPSBuZXcgTWF0cml4MygpO1xyXG5jb25zdCBzY3JhdGNoTWF0cml4MiA9IG5ldyBNYXRyaXgzKCk7XHJcblxyXG5jbGFzcyBDYW52YXNCbG9jayBleHRlbmRzIEZpdHRlZEJsb2NrIHtcclxuICAvKipcclxuICAgKiBAbWl4ZXMgUG9vbGFibGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RGlzcGxheX0gZGlzcGxheVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlciAtIFNlZSBSZW5kZXJlci5qcyBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IHRyYW5zZm9ybVJvb3RJbnN0YW5jZVxyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGZpbHRlclJvb3RJbnN0YW5jZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBkaXNwbGF5LCByZW5kZXJlciwgdHJhbnNmb3JtUm9vdEluc3RhbmNlLCBmaWx0ZXJSb290SW5zdGFuY2UgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZSggZGlzcGxheSwgcmVuZGVyZXIsIHRyYW5zZm9ybVJvb3RJbnN0YW5jZSwgZmlsdGVyUm9vdEluc3RhbmNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Rpc3BsYXl9IGRpc3BsYXlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVuZGVyZXJcclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSB0cmFuc2Zvcm1Sb290SW5zdGFuY2VcclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBmaWx0ZXJSb290SW5zdGFuY2VcclxuICAgKi9cclxuICBpbml0aWFsaXplKCBkaXNwbGF5LCByZW5kZXJlciwgdHJhbnNmb3JtUm9vdEluc3RhbmNlLCBmaWx0ZXJSb290SW5zdGFuY2UgKSB7XHJcbiAgICBzdXBlci5pbml0aWFsaXplKCBkaXNwbGF5LCByZW5kZXJlciwgdHJhbnNmb3JtUm9vdEluc3RhbmNlLCBGaXR0ZWRCbG9jay5DT01NT05fQU5DRVNUT1IgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7SW5zdGFuY2V9XHJcbiAgICB0aGlzLmZpbHRlclJvb3RJbnN0YW5jZSA9IGZpbHRlclJvb3RJbnN0YW5jZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPERyYXdhYmxlPn1cclxuICAgIHRoaXMuZGlydHlEcmF3YWJsZXMgPSBjbGVhbkFycmF5KCB0aGlzLmRpcnR5RHJhd2FibGVzICk7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5kb21FbGVtZW50ICkge1xyXG4gICAgICAvL09IVFdPIFRPRE86IHN1cHBvcnQgdGlsZWQgQ2FudmFzIGhhbmRsaW5nICh3aWxsIG5lZWQgdG8gd3JhcCB0aGVuIGluIGEgZGl2LCBvciBzb21ldGhpbmcpXHJcbiAgICAgIC8vIEBwdWJsaWMge0hUTUxDYW52YXNFbGVtZW50fVxyXG4gICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XHJcbiAgICAgIHRoaXMuY2FudmFzLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgICAgdGhpcy5jYW52YXMuc3R5bGUubGVmdCA9ICcwJztcclxuICAgICAgdGhpcy5jYW52YXMuc3R5bGUudG9wID0gJzAnO1xyXG4gICAgICB0aGlzLmNhbnZhcy5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xyXG5cclxuICAgICAgLy8gQHByaXZhdGUge251bWJlcn0gLSB1bmlxdWUgSUQgc28gdGhhdCB3ZSBjYW4gc3VwcG9ydCByYXN0ZXJpemF0aW9uIHdpdGggRGlzcGxheS5mb3JlaWduT2JqZWN0UmFzdGVyaXphdGlvblxyXG4gICAgICB0aGlzLmNhbnZhc0lkID0gdGhpcy5jYW52YXMuaWQgPSBgc2NlbmVyeS1jYW52YXMke3RoaXMuaWR9YDtcclxuXHJcbiAgICAgIC8vIEBwcml2YXRlIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9XHJcbiAgICAgIHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcclxuICAgICAgdGhpcy5jb250ZXh0LnNhdmUoKTsgLy8gV2UgYWx3YXlzIGltbWVkaWF0ZWx5IHNhdmUgZXZlcnkgQ2FudmFzIHNvIHdlIGNhbiByZXN0b3JlL3NhdmUgZm9yIGNsaXBwaW5nXHJcblxyXG4gICAgICAvLyB3b3JrYXJvdW5kIGZvciBDaHJvbWUgKFdlYktpdCkgbWl0ZXJMaW1pdCBidWc6IGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0xMDg3NjNcclxuICAgICAgdGhpcy5jb250ZXh0Lm1pdGVyTGltaXQgPSAyMDtcclxuICAgICAgdGhpcy5jb250ZXh0Lm1pdGVyTGltaXQgPSAxMDtcclxuXHJcbiAgICAgIC8vIEBwcml2YXRlIHtDYW52YXNDb250ZXh0V3JhcHBlcn0gLSBUcmFja3MgaW50ZXJtZWRpYXRlIENhbnZhcyBjb250ZXh0IHN0YXRlLCBzbyB3ZSBkb24ndCBoYXZlIHRvIHNlbmRcclxuICAgICAgLy8gdW5uZWNlc3NhcnkgQ2FudmFzIGNvbW1hbmRzLlxyXG4gICAgICB0aGlzLndyYXBwZXIgPSBuZXcgQ2FudmFzQ29udGV4dFdyYXBwZXIoIHRoaXMuY2FudmFzLCB0aGlzLmNvbnRleHQgKTtcclxuXHJcbiAgICAgIC8vIEBwdWJsaWMge0RPTUVsZW1lbnR9IC0gVE9ETzogRG9jIHRoaXMgcHJvcGVybHkgZm9yIHtCbG9ja30gYXMgYSB3aG9sZVxyXG4gICAgICB0aGlzLmRvbUVsZW1lbnQgPSB0aGlzLmNhbnZhcztcclxuXHJcbiAgICAgIC8vIHtBcnJheS48Q2FudmFzQ29udGV4dFdyYXBwZXI+fSBhcyBtdWx0aXBsZSBDYW52YXNlcyBhcmUgbmVlZGVkIHRvIHByb3Blcmx5IHJlbmRlciBvcGFjaXR5IHdpdGhpbiB0aGUgYmxvY2suXHJcbiAgICAgIHRoaXMud3JhcHBlclN0YWNrID0gWyB0aGlzLndyYXBwZXIgXTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB7bnVtYmVyfSAtIFRoZSBpbmRleCBpbnRvIHRoZSB3cmFwcGVyU3RhY2sgYXJyYXkgd2hlcmUgb3VyIGN1cnJlbnQgQ2FudmFzICh0aGF0IHdlIGFyZSBkcmF3aW5nIHRvKSBpcy5cclxuICAgIHRoaXMud3JhcHBlclN0YWNrSW5kZXggPSAwO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtPYmplY3QuPG5vZGVJZDpudW1iZXIsbnVtYmVyPiAtIE1hcHMgbm9kZSBJRCA9PiBjb3VudCBvZiBob3cgbWFueSBsaXN0ZW5lcnMgd2UgV09VTEQgaGF2ZSBhdHRhY2hlZCB0b1xyXG4gICAgLy8gaXQuIFdlIG9ubHkgYXR0YWNoIGF0IG1vc3Qgb25lIGxpc3RlbmVyIHRvIGVhY2ggbm9kZS4gV2UgbmVlZCB0byBsaXN0ZW4gdG8gYWxsIGFuY2VzdG9ycyB1cCB0byBvdXIgZmlsdGVyIHJvb3QsXHJcbiAgICAvLyBzbyB0aGF0IHdlIGNhbiBwaWNrIHVwIG9wYWNpdHkgY2hhbmdlcy5cclxuICAgIHRoaXMuZmlsdGVyTGlzdGVuZXJDb3VudE1hcCA9IHRoaXMuZmlsdGVyTGlzdGVuZXJDb3VudE1hcCB8fCB7fTtcclxuXHJcbiAgICAvLyBSZXNldCBhbnkgZml0IHRyYW5zZm9ybXMgdGhhdCB3ZXJlIGFwcGxpZWRcclxuICAgIFV0aWxzLnByZXBhcmVGb3JUcmFuc2Zvcm0oIHRoaXMuY2FudmFzICk7IC8vIEFwcGx5IENTUyBuZWVkZWQgZm9yIGZ1dHVyZSBDU1MgdHJhbnNmb3JtcyB0byB3b3JrIHByb3Blcmx5LlxyXG4gICAgVXRpbHMudW5zZXRUcmFuc2Zvcm0oIHRoaXMuY2FudmFzICk7IC8vIGNsZWFyIG91dCBhbnkgdHJhbnNmb3JtcyB0aGF0IGNvdWxkIGhhdmUgYmVlbiBwcmV2aW91c2x5IGFwcGxpZWRcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VmVjdG9yMn1cclxuICAgIHRoaXMuY2FudmFzRHJhd09mZnNldCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0RyYXdhYmxlfG51bGx9XHJcbiAgICB0aGlzLmN1cnJlbnREcmF3YWJsZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gV2hldGhlciB3ZSBuZWVkIHRvIHJlLWFwcGx5IGNsaXBwaW5nIHRvIG91ciBjdXJyZW50IENhbnZhc1xyXG4gICAgdGhpcy5jbGlwRGlydHkgPSB0cnVlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gSG93IG1hbnkgY2xpcHMgc2hvdWxkIGJlIGFwcGxpZWQgKGdpdmVuIG91ciBjdXJyZW50IFwicG9zaXRpb25cIiBpbiB0aGUgd2FsayB1cC9kb3duKS5cclxuICAgIHRoaXMuY2xpcENvdW50ID0gMDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIHN0b3JlIG91ciBiYWNraW5nIHNjYWxlIHNvIHdlIGRvbid0IGhhdmUgdG8gbG9vayBpdCB1cCB3aGlsZSBmaXR0aW5nXHJcbiAgICB0aGlzLmJhY2tpbmdTY2FsZSA9ICggcmVuZGVyZXIgJiBSZW5kZXJlci5iaXRtYXNrQ2FudmFzTG93UmVzb2x1dGlvbiApID8gMSA6IFV0aWxzLmJhY2tpbmdTY2FsZSggdGhpcy5jb250ZXh0ICk7XHJcbiAgICAvLyBUT0RPOiA+IFlvdSBjYW4gdXNlIHdpbmRvdy5tYXRjaE1lZGlhKCkgdG8gY2hlY2sgaWYgdGhlIHZhbHVlIG9mIGRldmljZVBpeGVsUmF0aW8gY2hhbmdlcyAod2hpY2ggY2FuIGhhcHBlbixcclxuICAgIC8vIFRPRE86ID4gZm9yIGV4YW1wbGUsIGlmIHRoZSB1c2VyIGRyYWdzIHRoZSB3aW5kb3cgdG8gYSBkaXNwbGF5IHdpdGggYSBkaWZmZXJlbnQgcGl4ZWwgZGVuc2l0eSkuXHJcbiAgICAvLyBUT0RPOiBPSCBOTywgd2UgbWF5IG5lZWQgdG8gZmlndXJlIG91dCB3YXRjaGluZyB0aGlzP1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cclxuICAgIHRoaXMuY2xpcERpcnR5TGlzdGVuZXIgPSB0aGlzLm1hcmtEaXJ0eS5iaW5kKCB0aGlzICk7XHJcbiAgICB0aGlzLm9wYWNpdHlEaXJ0eUxpc3RlbmVyID0gdGhpcy5tYXJrRGlydHkuYmluZCggdGhpcyApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrKCBgaW5pdGlhbGl6ZWQgIyR7dGhpcy5pZH1gICk7XHJcbiAgICAvLyBUT0RPOiBkaXJ0eSBsaXN0IG9mIG5vZGVzIChlYWNoIHNob3VsZCBnbyBkaXJ0eSBvbmx5IG9uY2UsIGVhc2llciB0aGFuIHNjYW5uaW5nIGFsbD8pXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgc2V0U2l6ZUZ1bGxEaXNwbGF5KCkge1xyXG4gICAgY29uc3Qgc2l6ZSA9IHRoaXMuZGlzcGxheS5nZXRTaXplKCk7XHJcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHNpemUud2lkdGggKiB0aGlzLmJhY2tpbmdTY2FsZTtcclxuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHNpemUuaGVpZ2h0ICogdGhpcy5iYWNraW5nU2NhbGU7XHJcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS53aWR0aCA9IGAke3NpemUud2lkdGh9cHhgO1xyXG4gICAgdGhpcy5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7c2l6ZS5oZWlnaHR9cHhgO1xyXG4gICAgdGhpcy53cmFwcGVyLnJlc2V0U3R5bGVzKCk7XHJcbiAgICB0aGlzLmNhbnZhc0RyYXdPZmZzZXQuc2V0WFkoIDAsIDAgKTtcclxuICAgIFV0aWxzLnVuc2V0VHJhbnNmb3JtKCB0aGlzLmNhbnZhcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIHNldFNpemVGaXRCb3VuZHMoKSB7XHJcbiAgICBjb25zdCB4ID0gdGhpcy5maXRCb3VuZHMubWluWDtcclxuICAgIGNvbnN0IHkgPSB0aGlzLmZpdEJvdW5kcy5taW5ZO1xyXG4gICAgdGhpcy5jYW52YXNEcmF3T2Zmc2V0LnNldFhZKCAteCwgLXkgKTsgLy8gc3VidHJhY3Qgb2ZmIHNvIHdlIGhhdmUgYSB0aWdodCBmaXRcclxuICAgIC8vT0hUV08gVE9ETyBQRVJGT1JNQU5DRTogc2VlIGlmIHdlIGNhbiBnZXQgYSBzcGVlZHVwIGJ5IHB1dHRpbmcgdGhlIGJhY2tpbmcgc2NhbGUgaW4gb3VyIHRyYW5zZm9ybSBpbnN0ZWFkIG9mIHdpdGggQ1NTP1xyXG4gICAgVXRpbHMuc2V0VHJhbnNmb3JtKCBgbWF0cml4KDEsMCwwLDEsJHt4fSwke3l9KWAsIHRoaXMuY2FudmFzICk7IC8vIHJlYXBwbHkgdGhlIHRyYW5zbGF0aW9uIGFzIGEgQ1NTIHRyYW5zZm9ybVxyXG4gICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmZpdEJvdW5kcy53aWR0aCAqIHRoaXMuYmFja2luZ1NjYWxlO1xyXG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5maXRCb3VuZHMuaGVpZ2h0ICogdGhpcy5iYWNraW5nU2NhbGU7XHJcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS53aWR0aCA9IGAke3RoaXMuZml0Qm91bmRzLndpZHRofXB4YDtcclxuICAgIHRoaXMuY2FudmFzLnN0eWxlLmhlaWdodCA9IGAke3RoaXMuZml0Qm91bmRzLmhlaWdodH1weGA7XHJcbiAgICB0aGlzLndyYXBwZXIucmVzZXRTdHlsZXMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIERPTSBhcHBlYXJhbmNlIG9mIHRoaXMgZHJhd2FibGUgKHdoZXRoZXIgYnkgcHJlcGFyaW5nL2NhbGxpbmcgZHJhdyBjYWxscywgRE9NIGVsZW1lbnQgdXBkYXRlcywgZXRjLilcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoZSB1cGRhdGUgc2hvdWxkIGNvbnRpbnVlIChpZiBmYWxzZSwgZnVydGhlciB1cGRhdGVzIGluIHN1cGVydHlwZSBzdGVwcyBzaG91bGQgbm90XHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgYmUgZG9uZSkuXHJcbiAgICovXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgLy8gU2VlIGlmIHdlIG5lZWQgdG8gYWN0dWFsbHkgdXBkYXRlIHRoaW5ncyAod2lsbCBiYWlsIG91dCBpZiB3ZSBhcmUgbm90IGRpcnR5LCBvciBpZiB3ZSd2ZSBiZWVuIGRpc3Bvc2VkKVxyXG4gICAgaWYgKCAhc3VwZXIudXBkYXRlKCkgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2sgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayggYHVwZGF0ZSAjJHt0aGlzLmlkfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICB3aGlsZSAoIHRoaXMuZGlydHlEcmF3YWJsZXMubGVuZ3RoICkge1xyXG4gICAgICB0aGlzLmRpcnR5RHJhd2FibGVzLnBvcCgpLnVwZGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHVkcGF0ZSB0aGUgZml0IEJFRk9SRSBkcmF3aW5nLCBzaW5jZSBpdCBtYXkgY2hhbmdlIG91ciBvZmZzZXRcclxuICAgIHRoaXMudXBkYXRlRml0KCk7XHJcblxyXG4gICAgLy8gZm9yIG5vdywgY2xlYXIgZXZlcnl0aGluZyFcclxuICAgIHRoaXMuY29udGV4dC5yZXN0b3JlKCk7IC8vIGp1c3QgaW4gY2FzZSB3ZSB3ZXJlIGNsaXBwaW5nL2V0Yy5cclxuICAgIHRoaXMuY29udGV4dC5zZXRUcmFuc2Zvcm0oIDEsIDAsIDAsIDEsIDAsIDAgKTsgLy8gaWRlbnRpdHlcclxuICAgIHRoaXMuY29udGV4dC5jbGVhclJlY3QoIDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQgKTsgLy8gY2xlYXIgZXZlcnl0aGluZ1xyXG4gICAgdGhpcy5jb250ZXh0LnNhdmUoKTtcclxuICAgIHRoaXMud3JhcHBlci5yZXNldFN0eWxlcygpO1xyXG5cclxuICAgIC8vT0hUV08gVE9ETzogUEVSRk9STUFOQ0U6IGNyZWF0ZSBhbiBhcnJheSBmb3IgZmFzdGVyIGRyYXdhYmxlIGl0ZXJhdGlvbiAodGhpcyBpcyBwcm9iYWJseSBhIGhlbGxpc2ggbWVtb3J5IGFjY2VzcyBwYXR0ZXJuKVxyXG4gICAgLy9PSFRXTyBUT0RPOiB3aHkgaXMgXCJkcmF3YWJsZSAhPT0gbnVsbFwiIGNoZWNrIG5lZWRlZFxyXG4gICAgdGhpcy5jdXJyZW50RHJhd2FibGUgPSBudWxsOyAvLyB3ZSBoYXZlbid0IHJlbmRlcmVkIGEgZHJhd2FibGUgdGhpcyBmcmFtZSB5ZXRcclxuICAgIGZvciAoIGxldCBkcmF3YWJsZSA9IHRoaXMuZmlyc3REcmF3YWJsZTsgZHJhd2FibGUgIT09IG51bGw7IGRyYXdhYmxlID0gZHJhd2FibGUubmV4dERyYXdhYmxlICkge1xyXG4gICAgICB0aGlzLnJlbmRlckRyYXdhYmxlKCBkcmF3YWJsZSApO1xyXG4gICAgICBpZiAoIGRyYXdhYmxlID09PSB0aGlzLmxhc3REcmF3YWJsZSApIHsgYnJlYWs7IH1cclxuICAgIH1cclxuICAgIGlmICggdGhpcy5jdXJyZW50RHJhd2FibGUgKSB7XHJcbiAgICAgIHRoaXMud2Fsa0Rvd24oIHRoaXMuY3VycmVudERyYXdhYmxlLmluc3RhbmNlLnRyYWlsLCAwICk7XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5jbGlwQ291bnQgPT09IDAsICdjbGlwQ291bnQgc2hvdWxkIGJlIHplcm8gYWZ0ZXIgd2Fsa2luZyBiYWNrIGRvd24nICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWFwcGxpZXMgY2xpcHMgdG8gdGhlIGN1cnJlbnQgY29udGV4dC4gSXQncyBuZWNlc3NhcnkgdG8gZnVsbHkgYXBwbHkgZXZlcnkgY2xpcHBpbmcgYXJlYSBmb3IgZXZlcnkgYW5jZXN0b3IsXHJcbiAgICogZHVlIHRvIGhvdyBDYW52YXMgaXMgc2V0IHVwLiBTaG91bGQgaWRlYWxseSBiZSBjYWxsZWQgd2hlbiB0aGUgY2xpcCBpcyBkaXJ0eS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogVGhpcyBpcyBuZWNlc3Nhcnkgc2luY2UgeW91IGNhbid0IGFwcGx5IFwibmVzdGVkXCIgY2xpcHBpbmcgYXJlYXMgbmFpdmVseSBpbiBDYW52YXMsIGJ1dCB5b3Ugc3BlY2lmeSBvbmUgZW50aXJlXHJcbiAgICogY2xpcCBhcmVhLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtDYW52YXNTZWxmRHJhd2FibGV9IERyYXdhYmxlXHJcbiAgICovXHJcbiAgYXBwbHlDbGlwKCBkcmF3YWJsZSApIHtcclxuICAgIHRoaXMuY2xpcERpcnR5ID0gZmFsc2U7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2sgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayggYEFwcGx5IGNsaXAgJHtkcmF3YWJsZS5pbnN0YW5jZS50cmFpbC50b0RlYnVnU3RyaW5nKCl9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGNvbnN0IHdyYXBwZXIgPSB0aGlzLndyYXBwZXJTdGFja1sgdGhpcy53cmFwcGVyU3RhY2tJbmRleCBdO1xyXG4gICAgY29uc3QgY29udGV4dCA9IHdyYXBwZXIuY29udGV4dDtcclxuXHJcbiAgICAvLyBSZS1zZXQgKGV2ZW4gaWYgbm8gY2xpcCBpcyBuZWVkZWQsIHNvIHdlIGdldCByaWQgb2YgdGhlIG9sZCBjbGlwKVxyXG4gICAgY29udGV4dC5yZXN0b3JlKCk7XHJcbiAgICBjb250ZXh0LnNhdmUoKTtcclxuICAgIHdyYXBwZXIucmVzZXRTdHlsZXMoKTtcclxuXHJcbiAgICAvLyBJZiAwLCBubyBjbGlwIGlzIG5lZWRlZFxyXG4gICAgaWYgKCB0aGlzLmNsaXBDb3VudCApIHtcclxuICAgICAgY29uc3QgaW5zdGFuY2UgPSBkcmF3YWJsZS5pbnN0YW5jZTtcclxuICAgICAgY29uc3QgdHJhaWwgPSBpbnN0YW5jZS50cmFpbDtcclxuXHJcbiAgICAgIC8vIEludmVyc2Ugb2Ygd2hhdCB3ZSdsbCBiZSBhcHBseWluZyB0byB0aGUgc2NlbmUsIHRvIGdldCBiYWNrIHRvIHRoZSByb290IGNvb3JkaW5hdGUgdHJhbnNmb3JtXHJcbiAgICAgIHNjcmF0Y2hNYXRyaXgucm93TWFqb3IoIHRoaXMuYmFja2luZ1NjYWxlLCAwLCB0aGlzLmNhbnZhc0RyYXdPZmZzZXQueCAqIHRoaXMuYmFja2luZ1NjYWxlLFxyXG4gICAgICAgIDAsIHRoaXMuYmFja2luZ1NjYWxlLCB0aGlzLmNhbnZhc0RyYXdPZmZzZXQueSAqIHRoaXMuYmFja2luZ1NjYWxlLFxyXG4gICAgICAgIDAsIDAsIDEgKTtcclxuICAgICAgc2NyYXRjaE1hdHJpeDIuc2V0KCB0aGlzLnRyYW5zZm9ybVJvb3RJbnN0YW5jZS50cmFpbC5nZXRNYXRyaXgoKSApLmludmVydCgpO1xyXG4gICAgICBzY3JhdGNoTWF0cml4Mi5tdWx0aXBseU1hdHJpeCggc2NyYXRjaE1hdHJpeCApLmNhbnZhc1NldFRyYW5zZm9ybSggY29udGV4dCApO1xyXG5cclxuICAgICAgLy8gUmVjdXJzaXZlbHkgYXBwbHkgY2xpcHMgYW5kIHRyYW5zZm9ybXNcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdHJhaWwubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRyYWlsLm5vZGVzWyBpIF07XHJcbiAgICAgICAgbm9kZS5nZXRNYXRyaXgoKS5jYW52YXNBcHBlbmRUcmFuc2Zvcm0oIGNvbnRleHQgKTtcclxuICAgICAgICBpZiAoIG5vZGUuaGFzQ2xpcEFyZWEoKSApIHtcclxuICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICBub2RlLmNsaXBBcmVhLndyaXRlVG9Db250ZXh0KCBjb250ZXh0ICk7XHJcbiAgICAgICAgICAvLyBUT0RPOiBhZGQgdGhlIGFiaWxpdHkgdG8gc2hvdyBjbGlwcGluZyBoaWdobGlnaHRzIGlubGluZT9cclxuICAgICAgICAgIC8vIGNvbnRleHQuc2F2ZSgpO1xyXG4gICAgICAgICAgLy8gY29udGV4dC5zdHJva2VTdHlsZSA9ICdyZWQnO1xyXG4gICAgICAgICAgLy8gY29udGV4dC5saW5lV2lkdGggPSAyO1xyXG4gICAgICAgICAgLy8gY29udGV4dC5zdHJva2UoKTtcclxuICAgICAgICAgIC8vIGNvbnRleHQucmVzdG9yZSgpO1xyXG4gICAgICAgICAgY29udGV4dC5jbGlwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQdXNoZXMgYSB3cmFwcGVyIG9udG8gb3VyIHN0YWNrIChjcmVhdGluZyBpZiBuZWNlc3NhcnkpLCBhbmQgaW5pdGlhbGl6ZXMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBwdXNoV3JhcHBlcigpIHtcclxuICAgIHRoaXMud3JhcHBlclN0YWNrSW5kZXgrKztcclxuICAgIHRoaXMuY2xpcERpcnR5ID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBJZiB3ZSBuZWVkIHRvIHB1c2ggYW4gZW50aXJlbHkgbmV3IENhbnZhcyB0byB0aGUgc3RhY2tcclxuICAgIGlmICggdGhpcy53cmFwcGVyU3RhY2tJbmRleCA9PT0gdGhpcy53cmFwcGVyU3RhY2subGVuZ3RoICkge1xyXG4gICAgICBjb25zdCBuZXdDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gICAgICBjb25zdCBuZXdDb250ZXh0ID0gbmV3Q2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcclxuICAgICAgbmV3Q29udGV4dC5zYXZlKCk7XHJcbiAgICAgIHRoaXMud3JhcHBlclN0YWNrLnB1c2goIG5ldyBDYW52YXNDb250ZXh0V3JhcHBlciggbmV3Q2FudmFzLCBuZXdDb250ZXh0ICkgKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHdyYXBwZXIgPSB0aGlzLndyYXBwZXJTdGFja1sgdGhpcy53cmFwcGVyU3RhY2tJbmRleCBdO1xyXG4gICAgY29uc3QgY29udGV4dCA9IHdyYXBwZXIuY29udGV4dDtcclxuXHJcbiAgICAvLyBTaXplIGFuZCBjbGVhciBvdXIgY29udGV4dFxyXG4gICAgd3JhcHBlci5zZXREaW1lbnNpb25zKCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0ICk7XHJcbiAgICBjb250ZXh0LnNldFRyYW5zZm9ybSggMSwgMCwgMCwgMSwgMCwgMCApOyAvLyBpZGVudGl0eVxyXG4gICAgY29udGV4dC5jbGVhclJlY3QoIDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQgKTsgLy8gY2xlYXIgZXZlcnl0aGluZ1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUG9wcyBhIHdyYXBwZXIgb2ZmIG9mIG91ciBzdGFjay5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHBvcFdyYXBwZXIoKSB7XHJcbiAgICB0aGlzLndyYXBwZXJTdGFja0luZGV4LS07XHJcbiAgICB0aGlzLmNsaXBEaXJ0eSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXYWxrIGRvd24gdG93YXJkcyB0aGUgcm9vdCwgcG9wcGluZyBhbnkgY2xpcC9vcGFjaXR5IGVmZmVjdHMgdGhhdCB3ZXJlIG5lZWRlZC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUcmFpbH0gdHJhaWxcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYnJhbmNoSW5kZXggLSBUaGUgZmlyc3QgaW5kZXggd2hlcmUgb3VyIGJlZm9yZSBhbmQgYWZ0ZXIgdHJhaWxzIGhhdmUgZGl2ZXJnZWQuXHJcbiAgICovXHJcbiAgd2Fsa0Rvd24oIHRyYWlsLCBicmFuY2hJbmRleCApIHtcclxuICAgIGNvbnN0IGZpbHRlclJvb3RJbmRleCA9IHRoaXMuZmlsdGVyUm9vdEluc3RhbmNlLnRyYWlsLmxlbmd0aCAtIDE7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSB0cmFpbC5sZW5ndGggLSAxOyBpID49IGJyYW5jaEluZGV4OyBpLS0gKSB7XHJcbiAgICAgIGNvbnN0IG5vZGUgPSB0cmFpbC5ub2Rlc1sgaSBdO1xyXG5cclxuICAgICAgaWYgKCBub2RlLmhhc0NsaXBBcmVhKCkgKSB7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2soIGBQb3AgY2xpcCAke3RyYWlsLnN1YnRyYWlsVG8oIG5vZGUgKS50b0RlYnVnU3RyaW5nKCl9YCApO1xyXG4gICAgICAgIC8vIFBvcCBjbGlwXHJcbiAgICAgICAgdGhpcy5jbGlwQ291bnQtLTtcclxuICAgICAgICB0aGlzLmNsaXBEaXJ0eSA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFdlIHNob3VsZCBub3QgYXBwbHkgb3BhY2l0eSBvciBvdGhlciBmaWx0ZXJzIGF0IG9yIGJlbG93IHRoZSBmaWx0ZXIgcm9vdFxyXG4gICAgICBpZiAoIGkgPiBmaWx0ZXJSb290SW5kZXggKSB7XHJcbiAgICAgICAgaWYgKCBub2RlLl9maWx0ZXJzLmxlbmd0aCApIHtcclxuICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrKCBgUG9wIGZpbHRlcnMgJHt0cmFpbC5zdWJ0cmFpbFRvKCBub2RlICkudG9EZWJ1Z1N0cmluZygpfWAgKTtcclxuXHJcbiAgICAgICAgICBjb25zdCB0b3BXcmFwcGVyID0gdGhpcy53cmFwcGVyU3RhY2tbIHRoaXMud3JhcHBlclN0YWNrSW5kZXggXTtcclxuICAgICAgICAgIGNvbnN0IGJvdHRvbVdyYXBwZXIgPSB0aGlzLndyYXBwZXJTdGFja1sgdGhpcy53cmFwcGVyU3RhY2tJbmRleCAtIDEgXTtcclxuICAgICAgICAgIHRoaXMucG9wV3JhcHBlcigpO1xyXG5cclxuICAgICAgICAgIGJvdHRvbVdyYXBwZXIuY29udGV4dC5zZXRUcmFuc2Zvcm0oIDEsIDAsIDAsIDEsIDAsIDAgKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBmaWx0ZXJzID0gbm9kZS5fZmlsdGVycztcclxuICAgICAgICAgIC8vIFdlIG5lZWQgdG8gZmFsbCBiYWNrIHRvIGEgZGlmZmVyZW50IGZpbHRlciBiZWhhdmlvciB3aXRoIENocm9tZSwgc2luY2UgaXQgb3Zlci1kYXJrZW5zIG90aGVyd2lzZSB3aXRoIHRoZVxyXG4gICAgICAgICAgLy8gYnVpbHQtaW4gZmVhdHVyZS5cclxuICAgICAgICAgIC8vIE5PVEU6IE5vdCBibG9ja2luZyBjaHJvbWl1bSBhbnltb3JlLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzExMzlcclxuICAgICAgICAgIC8vIFdlJ2xsIGdvIGZvciB0aGUgaGlnaGVyLXBlcmZvcm1hbmNlIGJ1dCBwb3RlbnRpYWxseS12aXN1YWxseS1kaWZmZXJlbnQgb3B0aW9uLlxyXG4gICAgICAgICAgbGV0IGNhblVzZUludGVybmFsRmlsdGVyID0gRmVhdHVyZXMuY2FudmFzRmlsdGVyO1xyXG4gICAgICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgZmlsdGVycy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICAgICAgLy8gSWYgd2UgdXNlIGNvbnRleHQuZmlsdGVyLCBpdCdzIGVxdWl2YWxlbnQgdG8gY2hlY2tpbmcgRE9NIGNvbXBhdGliaWxpdHkgb24gYWxsIG9mIHRoZW0uXHJcbiAgICAgICAgICAgIGNhblVzZUludGVybmFsRmlsdGVyID0gY2FuVXNlSW50ZXJuYWxGaWx0ZXIgJiYgZmlsdGVyc1sgaiBdLmlzRE9NQ29tcGF0aWJsZSgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICggY2FuVXNlSW50ZXJuYWxGaWx0ZXIgKSB7XHJcbiAgICAgICAgICAgIC8vIERyYXcgdXNpbmcgdGhlIGNvbnRleHQuZmlsdGVyIG9wZXJhdGlvblxyXG4gICAgICAgICAgICBsZXQgZmlsdGVyU3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IGZpbHRlcnMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgICAgICAgZmlsdGVyU3RyaW5nICs9IGAke2ZpbHRlclN0cmluZyA/ICcgJyA6ICcnfSR7ZmlsdGVyc1sgaiBdLmdldENTU0ZpbHRlclN0cmluZygpfWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYm90dG9tV3JhcHBlci5jb250ZXh0LmZpbHRlciA9IGZpbHRlclN0cmluZztcclxuICAgICAgICAgICAgYm90dG9tV3JhcHBlci5jb250ZXh0LmRyYXdJbWFnZSggdG9wV3JhcHBlci5jYW52YXMsIDAsIDAgKTtcclxuICAgICAgICAgICAgYm90dG9tV3JhcHBlci5jb250ZXh0LmZpbHRlciA9ICdub25lJztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBEcmF3IGJ5IG1hbnVhbGx5IG1hbmlwdWxhdGluZyB0aGUgSW1hZ2VEYXRhIHBpeGVscyBvZiB0aGUgdG9wIENhbnZhcywgdGhlbiBkcmF3IGl0IGluLlxyXG4gICAgICAgICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBmaWx0ZXJzLmxlbmd0aDsgaisrICkge1xyXG4gICAgICAgICAgICAgIGZpbHRlcnNbIGogXS5hcHBseUNhbnZhc0ZpbHRlciggdG9wV3JhcHBlciApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJvdHRvbVdyYXBwZXIuY29udGV4dC5kcmF3SW1hZ2UoIHRvcFdyYXBwZXIuY2FudmFzLCAwLCAwICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIG5vZGUuZ2V0RWZmZWN0aXZlT3BhY2l0eSgpICE9PSAxICkge1xyXG4gICAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2soIGBQb3Agb3BhY2l0eSAke3RyYWlsLnN1YnRyYWlsVG8oIG5vZGUgKS50b0RlYnVnU3RyaW5nKCl9YCApO1xyXG4gICAgICAgICAgLy8gUG9wIG9wYWNpdHlcclxuICAgICAgICAgIGNvbnN0IHRvcFdyYXBwZXIgPSB0aGlzLndyYXBwZXJTdGFja1sgdGhpcy53cmFwcGVyU3RhY2tJbmRleCBdO1xyXG4gICAgICAgICAgY29uc3QgYm90dG9tV3JhcHBlciA9IHRoaXMud3JhcHBlclN0YWNrWyB0aGlzLndyYXBwZXJTdGFja0luZGV4IC0gMSBdO1xyXG4gICAgICAgICAgdGhpcy5wb3BXcmFwcGVyKCk7XHJcblxyXG4gICAgICAgICAgLy8gRHJhdyB0aGUgdHJhbnNwYXJlbnQgY29udGVudCBpbnRvIHRoZSBuZXh0LWxldmVsIENhbnZhcy5cclxuICAgICAgICAgIGJvdHRvbVdyYXBwZXIuY29udGV4dC5zZXRUcmFuc2Zvcm0oIDEsIDAsIDAsIDEsIDAsIDAgKTtcclxuICAgICAgICAgIGJvdHRvbVdyYXBwZXIuY29udGV4dC5nbG9iYWxBbHBoYSA9IG5vZGUuZ2V0RWZmZWN0aXZlT3BhY2l0eSgpO1xyXG4gICAgICAgICAgYm90dG9tV3JhcHBlci5jb250ZXh0LmRyYXdJbWFnZSggdG9wV3JhcHBlci5jYW52YXMsIDAsIDAgKTtcclxuICAgICAgICAgIGJvdHRvbVdyYXBwZXIuY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXYWxrIHVwIHRvd2FyZHMgdGhlIG5leHQgbGVhZiwgcHVzaGluZyBhbnkgY2xpcC9vcGFjaXR5IGVmZmVjdHMgdGhhdCBhcmUgbmVlZGVkLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1RyYWlsfSB0cmFpbFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBicmFuY2hJbmRleCAtIFRoZSBmaXJzdCBpbmRleCB3aGVyZSBvdXIgYmVmb3JlIGFuZCBhZnRlciB0cmFpbHMgaGF2ZSBkaXZlcmdlZC5cclxuICAgKi9cclxuICB3YWxrVXAoIHRyYWlsLCBicmFuY2hJbmRleCApIHtcclxuICAgIGNvbnN0IGZpbHRlclJvb3RJbmRleCA9IHRoaXMuZmlsdGVyUm9vdEluc3RhbmNlLnRyYWlsLmxlbmd0aCAtIDE7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSBicmFuY2hJbmRleDsgaSA8IHRyYWlsLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBub2RlID0gdHJhaWwubm9kZXNbIGkgXTtcclxuXHJcbiAgICAgIC8vIFdlIHNob3VsZCBub3QgYXBwbHkgb3BhY2l0eSBhdCBvciBiZWxvdyB0aGUgZmlsdGVyIHJvb3RcclxuICAgICAgaWYgKCBpID4gZmlsdGVyUm9vdEluZGV4ICkge1xyXG4gICAgICAgIGlmICggbm9kZS5nZXRFZmZlY3RpdmVPcGFjaXR5KCkgIT09IDEgKSB7XHJcbiAgICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2sgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayggYFB1c2ggb3BhY2l0eSAke3RyYWlsLnN1YnRyYWlsVG8oIG5vZGUgKS50b0RlYnVnU3RyaW5nKCl9YCApO1xyXG5cclxuICAgICAgICAgIC8vIFB1c2ggb3BhY2l0eVxyXG4gICAgICAgICAgdGhpcy5wdXNoV3JhcHBlcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCBub2RlLl9maWx0ZXJzLmxlbmd0aCApIHtcclxuICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrKCBgUHVzaCBmaWx0ZXJzICR7dHJhaWwuc3VidHJhaWxUbyggbm9kZSApLnRvRGVidWdTdHJpbmcoKX1gICk7XHJcblxyXG4gICAgICAgICAgLy8gUHVzaCBmaWx0ZXJzXHJcbiAgICAgICAgICB0aGlzLnB1c2hXcmFwcGVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIG5vZGUuaGFzQ2xpcEFyZWEoKSApIHtcclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2sgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayggYFB1c2ggY2xpcCAke3RyYWlsLnN1YnRyYWlsVG8oIG5vZGUgKS50b0RlYnVnU3RyaW5nKCl9YCApO1xyXG4gICAgICAgIC8vIFB1c2ggY2xpcFxyXG4gICAgICAgIHRoaXMuY2xpcENvdW50Kys7XHJcbiAgICAgICAgdGhpcy5jbGlwRGlydHkgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEcmF3cyB0aGUgZHJhd2FibGUgaW50byBvdXIgbWFpbiBDYW52YXMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEZvciB0aGluZ3MgbGlrZSBvcGFjaXR5L2NsaXBwaW5nLCBhcyBwYXJ0IG9mIHRoaXMgd2Ugd2FsayB1cC9kb3duIHBhcnQgb2YgdGhlIGluc3RhbmNlIHRyZWUgZm9yIHJlbmRlcmluZyBlYWNoXHJcbiAgICogZHJhd2FibGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NhbnZhc1NlbGZEcmF3YWJsZX0gLSBUT0RPOiBJbiB0aGUgZnV0dXJlLCB3ZSdsbCBuZWVkIHRvIHN1cHBvcnQgQ2FudmFzIGNhY2hlcyAodGhpcyBzaG91bGQgYmUgdXBkYXRlZFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggYSBwcm9wZXIgZ2VuZXJhbGl6ZWQgdHlwZSlcclxuICAgKi9cclxuICByZW5kZXJEcmF3YWJsZSggZHJhd2FibGUgKSB7XHJcblxyXG4gICAgLy8gZG8gbm90IHBhaW50IGludmlzaWJsZSBkcmF3YWJsZXMsIG9yIGRyYXdhYmxlcyB0aGF0IGFyZSBvdXQgb2Ygdmlld1xyXG4gICAgaWYgKCAhZHJhd2FibGUudmlzaWJsZSB8fCB0aGlzLmNhbnZhcy53aWR0aCA9PT0gMCB8fCB0aGlzLmNhbnZhcy5oZWlnaHQgPT09IDAgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2sgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayggYHJlbmRlckRyYXdhYmxlICMke2RyYXdhYmxlLmlkfSAke2RyYXdhYmxlLmluc3RhbmNlLnRyYWlsLnRvRGVidWdTdHJpbmcoKX1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2sgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gRm9yIG9wYWNpdHkvY2xpcCwgd2FsayB1cC9kb3duIGFzIG5lY2Vzc2FyeSAoQ2FuIG9ubHkgd2FsayBkb3duIGlmIHdlIGFyZSBub3QgdGhlIGZpcnN0IGRyYXdhYmxlKVxyXG4gICAgY29uc3QgYnJhbmNoSW5kZXggPSB0aGlzLmN1cnJlbnREcmF3YWJsZSA/IGRyYXdhYmxlLmluc3RhbmNlLmdldEJyYW5jaEluZGV4VG8oIHRoaXMuY3VycmVudERyYXdhYmxlLmluc3RhbmNlICkgOiAwO1xyXG4gICAgaWYgKCB0aGlzLmN1cnJlbnREcmF3YWJsZSApIHtcclxuICAgICAgdGhpcy53YWxrRG93biggdGhpcy5jdXJyZW50RHJhd2FibGUuaW5zdGFuY2UudHJhaWwsIGJyYW5jaEluZGV4ICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLndhbGtVcCggZHJhd2FibGUuaW5zdGFuY2UudHJhaWwsIGJyYW5jaEluZGV4ICk7XHJcblxyXG4gICAgY29uc3Qgd3JhcHBlciA9IHRoaXMud3JhcHBlclN0YWNrWyB0aGlzLndyYXBwZXJTdGFja0luZGV4IF07XHJcbiAgICBjb25zdCBjb250ZXh0ID0gd3JhcHBlci5jb250ZXh0O1xyXG5cclxuICAgIC8vIFJlLWFwcGx5IHRoZSBjbGlwIGlmIG5lY2Vzc2FyeS4gVGhlIHdhbGsgZG93bi91cCBtYXkgaGF2ZSBmbGFnZ2VkIGEgcG90ZW50aWFsIGNsaXAgY2hhbmdlIChpZiB3ZSB3YWxrZWQgYWNyb3NzXHJcbiAgICAvLyBzb21ldGhpbmcgd2l0aCBhIGNsaXAgYXJlYSkuXHJcbiAgICBpZiAoIHRoaXMuY2xpcERpcnR5ICkge1xyXG4gICAgICB0aGlzLmFwcGx5Q2xpcCggZHJhd2FibGUgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB3ZSdyZSBkaXJlY3RseSBhY2Nlc3NpbmcgdGhlIHJlbGF0aXZlIHRyYW5zZm9ybSBiZWxvdywgc28gd2UgbmVlZCB0byBlbnN1cmUgdGhhdCBpdCBpcyB1cC10by1kYXRlXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkcmF3YWJsZS5pbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5pc1ZhbGlkYXRpb25Ob3ROZWVkZWQoKSApO1xyXG5cclxuICAgIGNvbnN0IG1hdHJpeCA9IGRyYXdhYmxlLmluc3RhbmNlLnJlbGF0aXZlVHJhbnNmb3JtLm1hdHJpeDtcclxuXHJcbiAgICAvLyBzZXQgdGhlIGNvcnJlY3QgKHJlbGF0aXZlIHRvIHRoZSB0cmFuc2Zvcm0gcm9vdCkgdHJhbnNmb3JtIHVwLCBpbnN0ZWFkIG9mIHdhbGtpbmcgdGhlIGhpZXJhcmNoeSAoZm9yIG5vdylcclxuICAgIC8vT0hUV08gVE9ETzogc2hvdWxkIHdlIHN0YXJ0IHByZW11bHRpcGx5aW5nIHRoZXNlIG1hdHJpY2VzIHRvIHJlbW92ZSB0aGlzIGJvdHRsZW5lY2s/XHJcbiAgICBjb250ZXh0LnNldFRyYW5zZm9ybShcclxuICAgICAgdGhpcy5iYWNraW5nU2NhbGUsXHJcbiAgICAgIDAsXHJcbiAgICAgIDAsXHJcbiAgICAgIHRoaXMuYmFja2luZ1NjYWxlLFxyXG4gICAgICB0aGlzLmNhbnZhc0RyYXdPZmZzZXQueCAqIHRoaXMuYmFja2luZ1NjYWxlLFxyXG4gICAgICB0aGlzLmNhbnZhc0RyYXdPZmZzZXQueSAqIHRoaXMuYmFja2luZ1NjYWxlXHJcbiAgICApO1xyXG5cclxuICAgIGlmICggZHJhd2FibGUuaW5zdGFuY2UgIT09IHRoaXMudHJhbnNmb3JtUm9vdEluc3RhbmNlICkge1xyXG4gICAgICBtYXRyaXguY2FudmFzQXBwZW5kVHJhbnNmb3JtKCBjb250ZXh0ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcGFpbnQgdXNpbmcgaXRzIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWVcclxuICAgIGRyYXdhYmxlLnBhaW50Q2FudmFzKCB3cmFwcGVyLCBkcmF3YWJsZS5pbnN0YW5jZS5ub2RlLCBkcmF3YWJsZS5pbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5tYXRyaXggKTtcclxuXHJcbiAgICB0aGlzLmN1cnJlbnREcmF3YWJsZSA9IGRyYXdhYmxlO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2soIGBkaXNwb3NlICMke3RoaXMuaWR9YCApO1xyXG5cclxuICAgIC8vIGNsZWFyIHJlZmVyZW5jZXNcclxuICAgIHRoaXMudHJhbnNmb3JtUm9vdEluc3RhbmNlID0gbnVsbDtcclxuICAgIGNsZWFuQXJyYXkoIHRoaXMuZGlydHlEcmF3YWJsZXMgKTtcclxuXHJcbiAgICAvLyBtaW5pbWl6ZSBtZW1vcnkgZXhwb3N1cmUgb2YgdGhlIGJhY2tpbmcgcmFzdGVyXHJcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IDA7XHJcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSAwO1xyXG5cclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXHJcbiAgICovXHJcbiAgbWFya0RpcnR5RHJhd2FibGUoIGRyYXdhYmxlICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLmRpcnR5ICYmIHNjZW5lcnlMb2cuZGlydHkoIGBtYXJrRGlydHlEcmF3YWJsZSBvbiBDYW52YXNCbG9jayMke3RoaXMuaWR9IHdpdGggJHtkcmF3YWJsZS50b1N0cmluZygpfWAgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkcmF3YWJsZSApO1xyXG5cclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICAvLyBDYXRjaCBpbmZpbml0ZSBsb29wc1xyXG4gICAgICB0aGlzLmRpc3BsYXkuZW5zdXJlTm90UGFpbnRpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPOiBpbnN0YW5jZSBjaGVjayB0byBzZWUgaWYgaXQgaXMgYSBjYW52YXMgY2FjaGUgKHVzdWFsbHkgd2UgZG9uJ3QgbmVlZCB0byBjYWxsIHVwZGF0ZSBvbiBvdXIgZHJhd2FibGVzKVxyXG4gICAgdGhpcy5kaXJ0eURyYXdhYmxlcy5wdXNoKCBkcmF3YWJsZSApO1xyXG4gICAgdGhpcy5tYXJrRGlydHkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXHJcbiAgICovXHJcbiAgYWRkRHJhd2FibGUoIGRyYXdhYmxlICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2soIGAjJHt0aGlzLmlkfS5hZGREcmF3YWJsZSAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIHN1cGVyLmFkZERyYXdhYmxlKCBkcmF3YWJsZSApO1xyXG5cclxuICAgIC8vIEFkZCBvcGFjaXR5IGxpc3RlbmVycyAoZnJvbSB0aGlzIG5vZGUgdXAgdG8gdGhlIGZpbHRlciByb290KVxyXG4gICAgZm9yICggbGV0IGluc3RhbmNlID0gZHJhd2FibGUuaW5zdGFuY2U7IGluc3RhbmNlICYmIGluc3RhbmNlICE9PSB0aGlzLmZpbHRlclJvb3RJbnN0YW5jZTsgaW5zdGFuY2UgPSBpbnN0YW5jZS5wYXJlbnQgKSB7XHJcbiAgICAgIGNvbnN0IG5vZGUgPSBpbnN0YW5jZS5ub2RlO1xyXG5cclxuICAgICAgLy8gT25seSBhZGQgdGhlIGxpc3RlbmVyIGlmIHdlIGRvbid0IGFscmVhZHkgaGF2ZSBvbmVcclxuICAgICAgaWYgKCB0aGlzLmZpbHRlckxpc3RlbmVyQ291bnRNYXBbIG5vZGUuaWQgXSApIHtcclxuICAgICAgICB0aGlzLmZpbHRlckxpc3RlbmVyQ291bnRNYXBbIG5vZGUuaWQgXSsrO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZmlsdGVyTGlzdGVuZXJDb3VudE1hcFsgbm9kZS5pZCBdID0gMTtcclxuXHJcbiAgICAgICAgbm9kZS5maWx0ZXJDaGFuZ2VFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLm9wYWNpdHlEaXJ0eUxpc3RlbmVyICk7XHJcbiAgICAgICAgbm9kZS5jbGlwQXJlYVByb3BlcnR5LmxhenlMaW5rKCB0aGlzLmNsaXBEaXJ0eUxpc3RlbmVyICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXHJcbiAgICovXHJcbiAgcmVtb3ZlRHJhd2FibGUoIGRyYXdhYmxlICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2soIGAjJHt0aGlzLmlkfS5yZW1vdmVEcmF3YWJsZSAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIC8vIFJlbW92ZSBvcGFjaXR5IGxpc3RlbmVycyAoZnJvbSB0aGlzIG5vZGUgdXAgdG8gdGhlIGZpbHRlciByb290KVxyXG4gICAgZm9yICggbGV0IGluc3RhbmNlID0gZHJhd2FibGUuaW5zdGFuY2U7IGluc3RhbmNlICYmIGluc3RhbmNlICE9PSB0aGlzLmZpbHRlclJvb3RJbnN0YW5jZTsgaW5zdGFuY2UgPSBpbnN0YW5jZS5wYXJlbnQgKSB7XHJcbiAgICAgIGNvbnN0IG5vZGUgPSBpbnN0YW5jZS5ub2RlO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmZpbHRlckxpc3RlbmVyQ291bnRNYXBbIG5vZGUuaWQgXSA+IDAgKTtcclxuICAgICAgdGhpcy5maWx0ZXJMaXN0ZW5lckNvdW50TWFwWyBub2RlLmlkIF0tLTtcclxuICAgICAgaWYgKCB0aGlzLmZpbHRlckxpc3RlbmVyQ291bnRNYXBbIG5vZGUuaWQgXSA9PT0gMCApIHtcclxuICAgICAgICBkZWxldGUgdGhpcy5maWx0ZXJMaXN0ZW5lckNvdW50TWFwWyBub2RlLmlkIF07XHJcblxyXG4gICAgICAgIG5vZGUuY2xpcEFyZWFQcm9wZXJ0eS51bmxpbmsoIHRoaXMuY2xpcERpcnR5TGlzdGVuZXIgKTtcclxuICAgICAgICBub2RlLmZpbHRlckNoYW5nZUVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMub3BhY2l0eURpcnR5TGlzdGVuZXIgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyLnJlbW92ZURyYXdhYmxlKCBkcmF3YWJsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZmlyc3REcmF3YWJsZVxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGxhc3REcmF3YWJsZVxyXG4gICAqL1xyXG4gIG9uSW50ZXJ2YWxDaGFuZ2UoIGZpcnN0RHJhd2FibGUsIGxhc3REcmF3YWJsZSApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrKCBgIyR7dGhpcy5pZH0ub25JbnRlcnZhbENoYW5nZSAke2ZpcnN0RHJhd2FibGUudG9TdHJpbmcoKX0gdG8gJHtsYXN0RHJhd2FibGUudG9TdHJpbmcoKX1gICk7XHJcblxyXG4gICAgc3VwZXIub25JbnRlcnZhbENoYW5nZSggZmlyc3REcmF3YWJsZSwgbGFzdERyYXdhYmxlICk7XHJcblxyXG4gICAgLy8gSWYgd2UgaGF2ZSBhbiBpbnRlcnZhbCBjaGFuZ2UsIHdlJ2xsIG5lZWQgdG8gZW5zdXJlIHdlIHJlcGFpbnQgKGV2ZW4gaWYgd2UncmUgZnVsbC1kaXNwbGF5KS4gVGhpcyB3YXMgYSBtaXNzZWRcclxuICAgIC8vIGNhc2UgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy81MTIsIHdoZXJlIGl0IHdvdWxkIG9ubHkgY2xlYXIgaWYgaXQgd2FzIGEgY29tbW9uLWFuY2VzdG9yXHJcbiAgICAvLyBmaXR0ZWQgYmxvY2suXHJcbiAgICB0aGlzLm1hcmtEaXJ0eSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcclxuICAgKi9cclxuICBvblBvdGVudGlhbGx5TW92ZWREcmF3YWJsZSggZHJhd2FibGUgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2sgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayggYCMke3RoaXMuaWR9Lm9uUG90ZW50aWFsbHlNb3ZlZERyYXdhYmxlICR7ZHJhd2FibGUudG9TdHJpbmcoKX1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2sgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZHJhd2FibGUucGFyZW50RHJhd2FibGUgPT09IHRoaXMgKTtcclxuXHJcbiAgICAvLyBGb3Igbm93LCBtYXJrIGl0IGFzIGRpcnR5IHNvIHRoYXQgd2UgcmVkcmF3IGFueXRoaW5nIGNvbnRhaW5pbmcgaXQuIEluIHRoZSBmdXR1cmUsIHdlIGNvdWxkIGhhdmUgbW9yZSBhZHZhbmNlZFxyXG4gICAgLy8gYmVoYXZpb3IgdGhhdCBmaWd1cmVzIG91dCB0aGUgaW50ZXJzZWN0aW9uLXJlZ2lvbiBmb3Igd2hhdCB3YXMgbW92ZWQgYW5kIHdoYXQgaXQgd2FzIG1vdmVkIHBhc3QsIGJ1dCB0aGF0J3NcclxuICAgIC8vIGEgaGFyZGVyIHByb2JsZW0uXHJcbiAgICBkcmF3YWJsZS5tYXJrRGlydHkoKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2sgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzdHJpbmcgZm9ybSBvZiB0aGlzIG9iamVjdFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgdG9TdHJpbmcoKSB7XHJcbiAgICByZXR1cm4gYENhbnZhc0Jsb2NrIyR7dGhpcy5pZH0tJHtGaXR0ZWRCbG9jay5maXRTdHJpbmdbIHRoaXMuZml0IF19YDtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdDYW52YXNCbG9jaycsIENhbnZhc0Jsb2NrICk7XHJcblxyXG5Qb29sYWJsZS5taXhJbnRvKCBDYW52YXNCbG9jayApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2FudmFzQmxvY2s7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxVQUFVLE1BQU0scUNBQXFDO0FBQzVELE9BQU9DLFFBQVEsTUFBTSxtQ0FBbUM7QUFDeEQsU0FBU0Msb0JBQW9CLEVBQUVDLFFBQVEsRUFBRUMsV0FBVyxFQUFFQyxRQUFRLEVBQUVDLE9BQU8sRUFBRUMsS0FBSyxRQUFRLGVBQWU7QUFFckcsTUFBTUMsYUFBYSxHQUFHLElBQUlWLE9BQU8sQ0FBQyxDQUFDO0FBQ25DLE1BQU1XLGNBQWMsR0FBRyxJQUFJWCxPQUFPLENBQUMsQ0FBQztBQUVwQyxNQUFNWSxXQUFXLFNBQVNOLFdBQVcsQ0FBQztFQUNwQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VPLFdBQVdBLENBQUVDLE9BQU8sRUFBRUMsUUFBUSxFQUFFQyxxQkFBcUIsRUFBRUMsa0JBQWtCLEVBQUc7SUFDMUUsS0FBSyxDQUFDLENBQUM7SUFFUCxJQUFJLENBQUNDLFVBQVUsQ0FBRUosT0FBTyxFQUFFQyxRQUFRLEVBQUVDLHFCQUFxQixFQUFFQyxrQkFBbUIsQ0FBQztFQUNqRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFVBQVVBLENBQUVKLE9BQU8sRUFBRUMsUUFBUSxFQUFFQyxxQkFBcUIsRUFBRUMsa0JBQWtCLEVBQUc7SUFDekUsS0FBSyxDQUFDQyxVQUFVLENBQUVKLE9BQU8sRUFBRUMsUUFBUSxFQUFFQyxxQkFBcUIsRUFBRVYsV0FBVyxDQUFDYSxlQUFnQixDQUFDOztJQUV6RjtJQUNBLElBQUksQ0FBQ0Ysa0JBQWtCLEdBQUdBLGtCQUFrQjs7SUFFNUM7SUFDQSxJQUFJ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