// Copyright 2013-2022, University of Colorado Boulder

/**
 * Handles a visual SVG layer of drawables.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import cleanArray from '../../../phet-core/js/cleanArray.js';
import Poolable from '../../../phet-core/js/Poolable.js';
import { CountMap, FittedBlock, scenery, SVGGroup, svgns, Utils } from '../imports.js';
class SVGBlock extends FittedBlock {
  /**
   * @mixes Poolable
   *
   * @param {Display} display - the scenery Display this SVGBlock will appear in
   * @param {number} renderer - the bitmask for the renderer, see Renderer.js
   * @param {Instance} transformRootInstance - TODO: Documentation
   * @param {Instance} filterRootInstance - TODO: Documentation
   */
  constructor(display, renderer, transformRootInstance, filterRootInstance) {
    super();
    this.initialize(display, renderer, transformRootInstance, filterRootInstance);
  }

  /**
   * @public
   *
   * @param {Display} display - the scenery Display this SVGBlock will appear in
   * @param {number} renderer - the bitmask for the renderer, see Renderer.js
   * @param {Instance} transformRootInstance - TODO: Documentation
   * @param {Instance} filterRootInstance - TODO: Documentation
   * @returns {FittedBlock}
   */
  initialize(display, renderer, transformRootInstance, filterRootInstance) {
    super.initialize(display, renderer, transformRootInstance, FittedBlock.COMMON_ANCESTOR);

    // @public {Instance}
    this.filterRootInstance = filterRootInstance;

    // @private {Array.<SVGGradient>}
    this.dirtyGradients = cleanArray(this.dirtyGradients);

    // @private {Array.<SVGGroup>}
    this.dirtyGroups = cleanArray(this.dirtyGroups);

    // @private {Array.<Drawable>}
    this.dirtyDrawables = cleanArray(this.dirtyDrawables);

    // @private {CountMap.<Paint,SVGGradient|SVGPattern>}
    this.paintCountMap = this.paintCountMap || new CountMap(this.onAddPaint.bind(this), this.onRemovePaint.bind(this));

    // @private {boolean} - Tracks whether we have no dirty objects that would require cleanup or releases
    this.areReferencesReduced = true;
    if (!this.domElement) {
      // main SVG element
      this.svg = document.createElementNS(svgns, 'svg');
      this.svg.style.position = 'absolute';
      this.svg.style.left = '0';
      this.svg.style.top = '0';

      // pdom - make sure the element is not focusable (it is focusable by default in IE11 full screen mode)
      this.svg.setAttribute('focusable', false);

      //OHTWO TODO: why would we clip the individual layers also? Seems like a potentially useless performance loss
      // this.svg.style.clip = 'rect(0px,' + width + 'px,' + height + 'px,0px)';
      this.svg.style['pointer-events'] = 'none';

      // @public {SVGDefsElement} - the <defs> block that we will be stuffing gradients and patterns into
      this.defs = document.createElementNS(svgns, 'defs');
      this.svg.appendChild(this.defs);
      this.baseTransformGroup = document.createElementNS(svgns, 'g');
      this.svg.appendChild(this.baseTransformGroup);
      this.domElement = this.svg;
    }

    // reset what layer fitting can do
    Utils.prepareForTransform(this.svg); // Apply CSS needed for future CSS transforms to work properly.

    Utils.unsetTransform(this.svg); // clear out any transforms that could have been previously applied
    this.baseTransformGroup.setAttribute('transform', ''); // no base transform

    const instanceClosestToRoot = transformRootInstance.trail.nodes.length > filterRootInstance.trail.nodes.length ? filterRootInstance : transformRootInstance;
    this.rootGroup = SVGGroup.createFromPool(this, instanceClosestToRoot, null);
    this.baseTransformGroup.appendChild(this.rootGroup.svgGroup);

    // TODO: dirty list of nodes (each should go dirty only once, easier than scanning all?)

    sceneryLog && sceneryLog.SVGBlock && sceneryLog.SVGBlock(`initialized #${this.id}`);
    return this;
  }

  /**
   * Callback for paintCountMap's create
   * @private
   *
   * @param {Paint} paint
   * @returns {SVGGradient|SVGPattern}
   */
  onAddPaint(paint) {
    const svgPaint = paint.createSVGPaint(this);
    svgPaint.definition.setAttribute('id', `${paint.id}-${this.id}`);
    this.defs.appendChild(svgPaint.definition);
    return svgPaint;
  }

  /**
   * Callback for paintCountMap's destroy
   * @private
   *
   * @param {Paint} paint
   * @param {SVGGradient|SVGPattern} svgPaint
   */
  onRemovePaint(paint, svgPaint) {
    this.defs.removeChild(svgPaint.definition);
    svgPaint.dispose();
  }

  /*
   * Increases our reference count for the specified {Paint}. If it didn't exist before, we'll add the SVG def to the
   * paint can be referenced by SVG id.
   * @public
   *
   * @param {Paint} paint
   */
  incrementPaint(paint) {
    assert && assert(paint.isPaint);
    sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`incrementPaint ${this} ${paint}`);
    this.paintCountMap.increment(paint);
  }

  /*
   * Decreases our reference count for the specified {Paint}. If this was the last reference, we'll remove the SVG def
   * from our SVG tree to prevent memory leaks, etc.
   * @public
   *
   * @param {Paint} paint
   */
  decrementPaint(paint) {
    assert && assert(paint.isPaint);
    sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`decrementPaint ${this} ${paint}`);
    this.paintCountMap.decrement(paint);
  }

  /**
   * @public
   *
   * @param {SVGGradient} gradient
   */
  markDirtyGradient(gradient) {
    this.dirtyGradients.push(gradient);
    this.markDirty();
  }

  /**
   * @public
   *
   * @param {Block} block
   */
  markDirtyGroup(block) {
    this.dirtyGroups.push(block);
    this.markDirty();
    if (this.areReferencesReduced) {
      this.display.markForReducedReferences(this);
    }
    this.areReferencesReduced = false;
  }

  /**
   * @public
   *
   * @param {Drawable} drawable
   */
  markDirtyDrawable(drawable) {
    sceneryLog && sceneryLog.dirty && sceneryLog.dirty(`markDirtyDrawable on SVGBlock#${this.id} with ${drawable.toString()}`);
    this.dirtyDrawables.push(drawable);
    this.markDirty();
    if (this.areReferencesReduced) {
      this.display.markForReducedReferences(this);
    }
    this.areReferencesReduced = false;
  }

  /**
   * @public
   * @override
   */
  setSizeFullDisplay() {
    sceneryLog && sceneryLog.SVGBlock && sceneryLog.SVGBlock(`setSizeFullDisplay #${this.id}`);
    this.baseTransformGroup.removeAttribute('transform');
    Utils.unsetTransform(this.svg);
    const size = this.display.getSize();
    this.svg.setAttribute('width', size.width);
    this.svg.setAttribute('height', size.height);
  }

  /**
   * @public
   * @override
   */
  setSizeFitBounds() {
    sceneryLog && sceneryLog.SVGBlock && sceneryLog.SVGBlock(`setSizeFitBounds #${this.id} with ${this.fitBounds.toString()}`);
    const x = this.fitBounds.minX;
    const y = this.fitBounds.minY;
    assert && assert(isFinite(x) && isFinite(y), 'Invalid SVG transform for SVGBlock');
    assert && assert(this.fitBounds.isValid(), 'Invalid fitBounds');
    this.baseTransformGroup.setAttribute('transform', `translate(${-x},${-y})`); // subtract off so we have a tight fit
    Utils.setTransform(`matrix(1,0,0,1,${x},${y})`, this.svg); // reapply the translation as a CSS transform
    this.svg.setAttribute('width', this.fitBounds.width);
    this.svg.setAttribute('height', this.fitBounds.height);
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
    sceneryLog && sceneryLog.SVGBlock && sceneryLog.SVGBlock(`update #${this.id}`);

    //OHTWO TODO: call here!
    // TODO: What does the above TODO mean?
    while (this.dirtyGroups.length) {
      const group = this.dirtyGroups.pop();

      // if this group has been disposed or moved to another block, don't mess with it
      if (group.block === this) {
        group.update();
      }
    }
    while (this.dirtyGradients.length) {
      this.dirtyGradients.pop().update();
    }
    while (this.dirtyDrawables.length) {
      const drawable = this.dirtyDrawables.pop();

      // if this drawable has been disposed or moved to another block, don't mess with it
      // TODO: If it was moved to another block, why might it still appear in our list?  Shouldn't that be an assertion check?
      if (drawable.parentDrawable === this) {
        drawable.update();
      }
    }
    this.areReferencesReduced = true; // Once we've iterated through things, we've automatically reduced our references.

    // checks will be done in updateFit() to see whether it is needed
    this.updateFit();
    return true;
  }

  /**
   * Looks to remove dirty objects that may have been disposed.
   * See https://github.com/phetsims/energy-forms-and-changes/issues/356
   * @public
   *
   * @public
   */
  reduceReferences() {
    // no-op if we had an update first
    if (this.areReferencesReduced) {
      return;
    }

    // Attempts to do this in a high-performance way, where we're not shifting array contents around (so we'll do this
    // in one scan).

    let inspectionIndex = 0;
    let replacementIndex = 0;
    while (inspectionIndex < this.dirtyGroups.length) {
      const group = this.dirtyGroups[inspectionIndex];

      // Only keep things that reference our block.
      if (group.block === this) {
        // If the indices are the same, don't do the operation
        if (replacementIndex !== inspectionIndex) {
          this.dirtyGroups[replacementIndex] = group;
        }
        replacementIndex++;
      }
      inspectionIndex++;
    }

    // Our array should be only that length now
    while (this.dirtyGroups.length > replacementIndex) {
      this.dirtyGroups.pop();
    }

    // Do a similar thing with dirtyDrawables (not optimized out because for right now we want to maximize performance).
    inspectionIndex = 0;
    replacementIndex = 0;
    while (inspectionIndex < this.dirtyDrawables.length) {
      const drawable = this.dirtyDrawables[inspectionIndex];

      // Only keep things that reference our block as the parentDrawable.
      if (drawable.parentDrawable === this) {
        // If the indices are the same, don't do the operation
        if (replacementIndex !== inspectionIndex) {
          this.dirtyDrawables[replacementIndex] = drawable;
        }
        replacementIndex++;
      }
      inspectionIndex++;
    }

    // Our array should be only that length now
    while (this.dirtyDrawables.length > replacementIndex) {
      this.dirtyDrawables.pop();
    }
    this.areReferencesReduced = true;
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    sceneryLog && sceneryLog.SVGBlock && sceneryLog.SVGBlock(`dispose #${this.id}`);

    // make it take up zero area, so that we don't use up excess memory
    this.svg.setAttribute('width', '0');
    this.svg.setAttribute('height', '0');

    // clear references
    this.filterRootInstance = null;
    cleanArray(this.dirtyGradients);
    cleanArray(this.dirtyGroups);
    cleanArray(this.dirtyDrawables);
    this.paintCountMap.clear();
    this.baseTransformGroup.removeChild(this.rootGroup.svgGroup);
    this.rootGroup.dispose();
    this.rootGroup = null;

    // since we may not properly remove all defs yet
    while (this.defs.childNodes.length) {
      this.defs.removeChild(this.defs.childNodes[0]);
    }
    super.dispose();
  }

  /**
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */
  addDrawable(drawable) {
    sceneryLog && sceneryLog.SVGBlock && sceneryLog.SVGBlock(`#${this.id}.addDrawable ${drawable.toString()}`);
    super.addDrawable(drawable);
    SVGGroup.addDrawable(this, drawable);
    drawable.updateSVGBlock(this);
  }

  /**
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */
  removeDrawable(drawable) {
    sceneryLog && sceneryLog.SVGBlock && sceneryLog.SVGBlock(`#${this.id}.removeDrawable ${drawable.toString()}`);
    SVGGroup.removeDrawable(this, drawable);
    super.removeDrawable(drawable);

    // NOTE: we don't unset the drawable's defs here, since it will either be disposed (will clear it)
    // or will be added to another SVGBlock (which will overwrite it)
  }

  /**
   * @public
   * @override
   *
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   */
  onIntervalChange(firstDrawable, lastDrawable) {
    sceneryLog && sceneryLog.SVGBlock && sceneryLog.SVGBlock(`#${this.id}.onIntervalChange ${firstDrawable.toString()} to ${lastDrawable.toString()}`);
    super.onIntervalChange(firstDrawable, lastDrawable);
  }

  /**
   * Returns a string form of this object
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `SVGBlock#${this.id}-${FittedBlock.fitString[this.fit]}`;
  }
}
scenery.register('SVGBlock', SVGBlock);
Poolable.mixInto(SVGBlock);
export default SVGBlock;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjbGVhbkFycmF5IiwiUG9vbGFibGUiLCJDb3VudE1hcCIsIkZpdHRlZEJsb2NrIiwic2NlbmVyeSIsIlNWR0dyb3VwIiwic3ZnbnMiLCJVdGlscyIsIlNWR0Jsb2NrIiwiY29uc3RydWN0b3IiLCJkaXNwbGF5IiwicmVuZGVyZXIiLCJ0cmFuc2Zvcm1Sb290SW5zdGFuY2UiLCJmaWx0ZXJSb290SW5zdGFuY2UiLCJpbml0aWFsaXplIiwiQ09NTU9OX0FOQ0VTVE9SIiwiZGlydHlHcmFkaWVudHMiLCJkaXJ0eUdyb3VwcyIsImRpcnR5RHJhd2FibGVzIiwicGFpbnRDb3VudE1hcCIsIm9uQWRkUGFpbnQiLCJiaW5kIiwib25SZW1vdmVQYWludCIsImFyZVJlZmVyZW5jZXNSZWR1Y2VkIiwiZG9tRWxlbWVudCIsInN2ZyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudE5TIiwic3R5bGUiLCJwb3NpdGlvbiIsImxlZnQiLCJ0b3AiLCJzZXRBdHRyaWJ1dGUiLCJkZWZzIiwiYXBwZW5kQ2hpbGQiLCJiYXNlVHJhbnNmb3JtR3JvdXAiLCJwcmVwYXJlRm9yVHJhbnNmb3JtIiwidW5zZXRUcmFuc2Zvcm0iLCJpbnN0YW5jZUNsb3Nlc3RUb1Jvb3QiLCJ0cmFpbCIsIm5vZGVzIiwibGVuZ3RoIiwicm9vdEdyb3VwIiwiY3JlYXRlRnJvbVBvb2wiLCJzdmdHcm91cCIsInNjZW5lcnlMb2ciLCJpZCIsInBhaW50Iiwic3ZnUGFpbnQiLCJjcmVhdGVTVkdQYWludCIsImRlZmluaXRpb24iLCJyZW1vdmVDaGlsZCIsImRpc3Bvc2UiLCJpbmNyZW1lbnRQYWludCIsImFzc2VydCIsImlzUGFpbnQiLCJQYWludHMiLCJpbmNyZW1lbnQiLCJkZWNyZW1lbnRQYWludCIsImRlY3JlbWVudCIsIm1hcmtEaXJ0eUdyYWRpZW50IiwiZ3JhZGllbnQiLCJwdXNoIiwibWFya0RpcnR5IiwibWFya0RpcnR5R3JvdXAiLCJibG9jayIsIm1hcmtGb3JSZWR1Y2VkUmVmZXJlbmNlcyIsIm1hcmtEaXJ0eURyYXdhYmxlIiwiZHJhd2FibGUiLCJkaXJ0eSIsInRvU3RyaW5nIiwic2V0U2l6ZUZ1bGxEaXNwbGF5IiwicmVtb3ZlQXR0cmlidXRlIiwic2l6ZSIsImdldFNpemUiLCJ3aWR0aCIsImhlaWdodCIsInNldFNpemVGaXRCb3VuZHMiLCJmaXRCb3VuZHMiLCJ4IiwibWluWCIsInkiLCJtaW5ZIiwiaXNGaW5pdGUiLCJpc1ZhbGlkIiwic2V0VHJhbnNmb3JtIiwidXBkYXRlIiwiZ3JvdXAiLCJwb3AiLCJwYXJlbnREcmF3YWJsZSIsInVwZGF0ZUZpdCIsInJlZHVjZVJlZmVyZW5jZXMiLCJpbnNwZWN0aW9uSW5kZXgiLCJyZXBsYWNlbWVudEluZGV4IiwiY2xlYXIiLCJjaGlsZE5vZGVzIiwiYWRkRHJhd2FibGUiLCJ1cGRhdGVTVkdCbG9jayIsInJlbW92ZURyYXdhYmxlIiwib25JbnRlcnZhbENoYW5nZSIsImZpcnN0RHJhd2FibGUiLCJsYXN0RHJhd2FibGUiLCJmaXRTdHJpbmciLCJmaXQiLCJyZWdpc3RlciIsIm1peEludG8iXSwic291cmNlcyI6WyJTVkdCbG9jay5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBIYW5kbGVzIGEgdmlzdWFsIFNWRyBsYXllciBvZiBkcmF3YWJsZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XHJcbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xyXG5pbXBvcnQgeyBDb3VudE1hcCwgRml0dGVkQmxvY2ssIHNjZW5lcnksIFNWR0dyb3VwLCBzdmducywgVXRpbHMgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbmNsYXNzIFNWR0Jsb2NrIGV4dGVuZHMgRml0dGVkQmxvY2sge1xyXG4gIC8qKlxyXG4gICAqIEBtaXhlcyBQb29sYWJsZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5IC0gdGhlIHNjZW5lcnkgRGlzcGxheSB0aGlzIFNWR0Jsb2NrIHdpbGwgYXBwZWFyIGluXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyIC0gdGhlIGJpdG1hc2sgZm9yIHRoZSByZW5kZXJlciwgc2VlIFJlbmRlcmVyLmpzXHJcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gdHJhbnNmb3JtUm9vdEluc3RhbmNlIC0gVE9ETzogRG9jdW1lbnRhdGlvblxyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGZpbHRlclJvb3RJbnN0YW5jZSAtIFRPRE86IERvY3VtZW50YXRpb25cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZGlzcGxheSwgcmVuZGVyZXIsIHRyYW5zZm9ybVJvb3RJbnN0YW5jZSwgZmlsdGVyUm9vdEluc3RhbmNlICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICB0aGlzLmluaXRpYWxpemUoIGRpc3BsYXksIHJlbmRlcmVyLCB0cmFuc2Zvcm1Sb290SW5zdGFuY2UsIGZpbHRlclJvb3RJbnN0YW5jZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5IC0gdGhlIHNjZW5lcnkgRGlzcGxheSB0aGlzIFNWR0Jsb2NrIHdpbGwgYXBwZWFyIGluXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyIC0gdGhlIGJpdG1hc2sgZm9yIHRoZSByZW5kZXJlciwgc2VlIFJlbmRlcmVyLmpzXHJcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gdHJhbnNmb3JtUm9vdEluc3RhbmNlIC0gVE9ETzogRG9jdW1lbnRhdGlvblxyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGZpbHRlclJvb3RJbnN0YW5jZSAtIFRPRE86IERvY3VtZW50YXRpb25cclxuICAgKiBAcmV0dXJucyB7Rml0dGVkQmxvY2t9XHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZSggZGlzcGxheSwgcmVuZGVyZXIsIHRyYW5zZm9ybVJvb3RJbnN0YW5jZSwgZmlsdGVyUm9vdEluc3RhbmNlICkge1xyXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSggZGlzcGxheSwgcmVuZGVyZXIsIHRyYW5zZm9ybVJvb3RJbnN0YW5jZSwgRml0dGVkQmxvY2suQ09NTU9OX0FOQ0VTVE9SICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7SW5zdGFuY2V9XHJcbiAgICB0aGlzLmZpbHRlclJvb3RJbnN0YW5jZSA9IGZpbHRlclJvb3RJbnN0YW5jZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPFNWR0dyYWRpZW50Pn1cclxuICAgIHRoaXMuZGlydHlHcmFkaWVudHMgPSBjbGVhbkFycmF5KCB0aGlzLmRpcnR5R3JhZGllbnRzICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0FycmF5LjxTVkdHcm91cD59XHJcbiAgICB0aGlzLmRpcnR5R3JvdXBzID0gY2xlYW5BcnJheSggdGhpcy5kaXJ0eUdyb3VwcyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBcnJheS48RHJhd2FibGU+fVxyXG4gICAgdGhpcy5kaXJ0eURyYXdhYmxlcyA9IGNsZWFuQXJyYXkoIHRoaXMuZGlydHlEcmF3YWJsZXMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Q291bnRNYXAuPFBhaW50LFNWR0dyYWRpZW50fFNWR1BhdHRlcm4+fVxyXG4gICAgdGhpcy5wYWludENvdW50TWFwID0gdGhpcy5wYWludENvdW50TWFwIHx8IG5ldyBDb3VudE1hcChcclxuICAgICAgdGhpcy5vbkFkZFBhaW50LmJpbmQoIHRoaXMgKSxcclxuICAgICAgdGhpcy5vblJlbW92ZVBhaW50LmJpbmQoIHRoaXMgKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBUcmFja3Mgd2hldGhlciB3ZSBoYXZlIG5vIGRpcnR5IG9iamVjdHMgdGhhdCB3b3VsZCByZXF1aXJlIGNsZWFudXAgb3IgcmVsZWFzZXNcclxuICAgIHRoaXMuYXJlUmVmZXJlbmNlc1JlZHVjZWQgPSB0cnVlO1xyXG5cclxuICAgIGlmICggIXRoaXMuZG9tRWxlbWVudCApIHtcclxuXHJcbiAgICAgIC8vIG1haW4gU1ZHIGVsZW1lbnRcclxuICAgICAgdGhpcy5zdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAnc3ZnJyApO1xyXG4gICAgICB0aGlzLnN2Zy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICAgIHRoaXMuc3ZnLnN0eWxlLmxlZnQgPSAnMCc7XHJcbiAgICAgIHRoaXMuc3ZnLnN0eWxlLnRvcCA9ICcwJztcclxuXHJcbiAgICAgIC8vIHBkb20gLSBtYWtlIHN1cmUgdGhlIGVsZW1lbnQgaXMgbm90IGZvY3VzYWJsZSAoaXQgaXMgZm9jdXNhYmxlIGJ5IGRlZmF1bHQgaW4gSUUxMSBmdWxsIHNjcmVlbiBtb2RlKVxyXG4gICAgICB0aGlzLnN2Zy5zZXRBdHRyaWJ1dGUoICdmb2N1c2FibGUnLCBmYWxzZSApO1xyXG5cclxuICAgICAgLy9PSFRXTyBUT0RPOiB3aHkgd291bGQgd2UgY2xpcCB0aGUgaW5kaXZpZHVhbCBsYXllcnMgYWxzbz8gU2VlbXMgbGlrZSBhIHBvdGVudGlhbGx5IHVzZWxlc3MgcGVyZm9ybWFuY2UgbG9zc1xyXG4gICAgICAvLyB0aGlzLnN2Zy5zdHlsZS5jbGlwID0gJ3JlY3QoMHB4LCcgKyB3aWR0aCArICdweCwnICsgaGVpZ2h0ICsgJ3B4LDBweCknO1xyXG4gICAgICB0aGlzLnN2Zy5zdHlsZVsgJ3BvaW50ZXItZXZlbnRzJyBdID0gJ25vbmUnO1xyXG5cclxuICAgICAgLy8gQHB1YmxpYyB7U1ZHRGVmc0VsZW1lbnR9IC0gdGhlIDxkZWZzPiBibG9jayB0aGF0IHdlIHdpbGwgYmUgc3R1ZmZpbmcgZ3JhZGllbnRzIGFuZCBwYXR0ZXJucyBpbnRvXHJcbiAgICAgIHRoaXMuZGVmcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnbnMsICdkZWZzJyApO1xyXG4gICAgICB0aGlzLnN2Zy5hcHBlbmRDaGlsZCggdGhpcy5kZWZzICk7XHJcblxyXG4gICAgICB0aGlzLmJhc2VUcmFuc2Zvcm1Hcm91cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnbnMsICdnJyApO1xyXG4gICAgICB0aGlzLnN2Zy5hcHBlbmRDaGlsZCggdGhpcy5iYXNlVHJhbnNmb3JtR3JvdXAgKTtcclxuXHJcbiAgICAgIHRoaXMuZG9tRWxlbWVudCA9IHRoaXMuc3ZnO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlc2V0IHdoYXQgbGF5ZXIgZml0dGluZyBjYW4gZG9cclxuICAgIFV0aWxzLnByZXBhcmVGb3JUcmFuc2Zvcm0oIHRoaXMuc3ZnICk7IC8vIEFwcGx5IENTUyBuZWVkZWQgZm9yIGZ1dHVyZSBDU1MgdHJhbnNmb3JtcyB0byB3b3JrIHByb3Blcmx5LlxyXG5cclxuICAgIFV0aWxzLnVuc2V0VHJhbnNmb3JtKCB0aGlzLnN2ZyApOyAvLyBjbGVhciBvdXQgYW55IHRyYW5zZm9ybXMgdGhhdCBjb3VsZCBoYXZlIGJlZW4gcHJldmlvdXNseSBhcHBsaWVkXHJcbiAgICB0aGlzLmJhc2VUcmFuc2Zvcm1Hcm91cC5zZXRBdHRyaWJ1dGUoICd0cmFuc2Zvcm0nLCAnJyApOyAvLyBubyBiYXNlIHRyYW5zZm9ybVxyXG5cclxuICAgIGNvbnN0IGluc3RhbmNlQ2xvc2VzdFRvUm9vdCA9IHRyYW5zZm9ybVJvb3RJbnN0YW5jZS50cmFpbC5ub2Rlcy5sZW5ndGggPiBmaWx0ZXJSb290SW5zdGFuY2UudHJhaWwubm9kZXMubGVuZ3RoID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlclJvb3RJbnN0YW5jZSA6IHRyYW5zZm9ybVJvb3RJbnN0YW5jZTtcclxuXHJcbiAgICB0aGlzLnJvb3RHcm91cCA9IFNWR0dyb3VwLmNyZWF0ZUZyb21Qb29sKCB0aGlzLCBpbnN0YW5jZUNsb3Nlc3RUb1Jvb3QsIG51bGwgKTtcclxuICAgIHRoaXMuYmFzZVRyYW5zZm9ybUdyb3VwLmFwcGVuZENoaWxkKCB0aGlzLnJvb3RHcm91cC5zdmdHcm91cCApO1xyXG5cclxuICAgIC8vIFRPRE86IGRpcnR5IGxpc3Qgb2Ygbm9kZXMgKGVhY2ggc2hvdWxkIGdvIGRpcnR5IG9ubHkgb25jZSwgZWFzaWVyIHRoYW4gc2Nhbm5pbmcgYWxsPylcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU1ZHQmxvY2sgJiYgc2NlbmVyeUxvZy5TVkdCbG9jayggYGluaXRpYWxpemVkICMke3RoaXMuaWR9YCApO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGJhY2sgZm9yIHBhaW50Q291bnRNYXAncyBjcmVhdGVcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQYWludH0gcGFpbnRcclxuICAgKiBAcmV0dXJucyB7U1ZHR3JhZGllbnR8U1ZHUGF0dGVybn1cclxuICAgKi9cclxuICBvbkFkZFBhaW50KCBwYWludCApIHtcclxuICAgIGNvbnN0IHN2Z1BhaW50ID0gcGFpbnQuY3JlYXRlU1ZHUGFpbnQoIHRoaXMgKTtcclxuICAgIHN2Z1BhaW50LmRlZmluaXRpb24uc2V0QXR0cmlidXRlKCAnaWQnLCBgJHtwYWludC5pZH0tJHt0aGlzLmlkfWAgKTtcclxuICAgIHRoaXMuZGVmcy5hcHBlbmRDaGlsZCggc3ZnUGFpbnQuZGVmaW5pdGlvbiApO1xyXG5cclxuICAgIHJldHVybiBzdmdQYWludDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxiYWNrIGZvciBwYWludENvdW50TWFwJ3MgZGVzdHJveVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BhaW50fSBwYWludFxyXG4gICAqIEBwYXJhbSB7U1ZHR3JhZGllbnR8U1ZHUGF0dGVybn0gc3ZnUGFpbnRcclxuICAgKi9cclxuICBvblJlbW92ZVBhaW50KCBwYWludCwgc3ZnUGFpbnQgKSB7XHJcbiAgICB0aGlzLmRlZnMucmVtb3ZlQ2hpbGQoIHN2Z1BhaW50LmRlZmluaXRpb24gKTtcclxuICAgIHN2Z1BhaW50LmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogSW5jcmVhc2VzIG91ciByZWZlcmVuY2UgY291bnQgZm9yIHRoZSBzcGVjaWZpZWQge1BhaW50fS4gSWYgaXQgZGlkbid0IGV4aXN0IGJlZm9yZSwgd2UnbGwgYWRkIHRoZSBTVkcgZGVmIHRvIHRoZVxyXG4gICAqIHBhaW50IGNhbiBiZSByZWZlcmVuY2VkIGJ5IFNWRyBpZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BhaW50fSBwYWludFxyXG4gICAqL1xyXG4gIGluY3JlbWVudFBhaW50KCBwYWludCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBhaW50LmlzUGFpbnQgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCBgaW5jcmVtZW50UGFpbnQgJHt0aGlzfSAke3BhaW50fWAgKTtcclxuXHJcbiAgICB0aGlzLnBhaW50Q291bnRNYXAuaW5jcmVtZW50KCBwYWludCApO1xyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBEZWNyZWFzZXMgb3VyIHJlZmVyZW5jZSBjb3VudCBmb3IgdGhlIHNwZWNpZmllZCB7UGFpbnR9LiBJZiB0aGlzIHdhcyB0aGUgbGFzdCByZWZlcmVuY2UsIHdlJ2xsIHJlbW92ZSB0aGUgU1ZHIGRlZlxyXG4gICAqIGZyb20gb3VyIFNWRyB0cmVlIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzLCBldGMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQYWludH0gcGFpbnRcclxuICAgKi9cclxuICBkZWNyZW1lbnRQYWludCggcGFpbnQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwYWludC5pc1BhaW50ICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggYGRlY3JlbWVudFBhaW50ICR7dGhpc30gJHtwYWludH1gICk7XHJcblxyXG4gICAgdGhpcy5wYWludENvdW50TWFwLmRlY3JlbWVudCggcGFpbnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U1ZHR3JhZGllbnR9IGdyYWRpZW50XHJcbiAgICovXHJcbiAgbWFya0RpcnR5R3JhZGllbnQoIGdyYWRpZW50ICkge1xyXG4gICAgdGhpcy5kaXJ0eUdyYWRpZW50cy5wdXNoKCBncmFkaWVudCApO1xyXG4gICAgdGhpcy5tYXJrRGlydHkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QmxvY2t9IGJsb2NrXHJcbiAgICovXHJcbiAgbWFya0RpcnR5R3JvdXAoIGJsb2NrICkge1xyXG4gICAgdGhpcy5kaXJ0eUdyb3Vwcy5wdXNoKCBibG9jayApO1xyXG4gICAgdGhpcy5tYXJrRGlydHkoKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuYXJlUmVmZXJlbmNlc1JlZHVjZWQgKSB7XHJcbiAgICAgIHRoaXMuZGlzcGxheS5tYXJrRm9yUmVkdWNlZFJlZmVyZW5jZXMoIHRoaXMgKTtcclxuICAgIH1cclxuICAgIHRoaXMuYXJlUmVmZXJlbmNlc1JlZHVjZWQgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXHJcbiAgICovXHJcbiAgbWFya0RpcnR5RHJhd2FibGUoIGRyYXdhYmxlICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLmRpcnR5ICYmIHNjZW5lcnlMb2cuZGlydHkoIGBtYXJrRGlydHlEcmF3YWJsZSBvbiBTVkdCbG9jayMke3RoaXMuaWR9IHdpdGggJHtkcmF3YWJsZS50b1N0cmluZygpfWAgKTtcclxuICAgIHRoaXMuZGlydHlEcmF3YWJsZXMucHVzaCggZHJhd2FibGUgKTtcclxuICAgIHRoaXMubWFya0RpcnR5KCk7XHJcblxyXG4gICAgaWYgKCB0aGlzLmFyZVJlZmVyZW5jZXNSZWR1Y2VkICkge1xyXG4gICAgICB0aGlzLmRpc3BsYXkubWFya0ZvclJlZHVjZWRSZWZlcmVuY2VzKCB0aGlzICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFyZVJlZmVyZW5jZXNSZWR1Y2VkID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgc2V0U2l6ZUZ1bGxEaXNwbGF5KCkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNWR0Jsb2NrICYmIHNjZW5lcnlMb2cuU1ZHQmxvY2soIGBzZXRTaXplRnVsbERpc3BsYXkgIyR7dGhpcy5pZH1gICk7XHJcblxyXG4gICAgdGhpcy5iYXNlVHJhbnNmb3JtR3JvdXAucmVtb3ZlQXR0cmlidXRlKCAndHJhbnNmb3JtJyApO1xyXG4gICAgVXRpbHMudW5zZXRUcmFuc2Zvcm0oIHRoaXMuc3ZnICk7XHJcblxyXG4gICAgY29uc3Qgc2l6ZSA9IHRoaXMuZGlzcGxheS5nZXRTaXplKCk7XHJcbiAgICB0aGlzLnN2Zy5zZXRBdHRyaWJ1dGUoICd3aWR0aCcsIHNpemUud2lkdGggKTtcclxuICAgIHRoaXMuc3ZnLnNldEF0dHJpYnV0ZSggJ2hlaWdodCcsIHNpemUuaGVpZ2h0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgc2V0U2l6ZUZpdEJvdW5kcygpIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TVkdCbG9jayAmJiBzY2VuZXJ5TG9nLlNWR0Jsb2NrKCBgc2V0U2l6ZUZpdEJvdW5kcyAjJHt0aGlzLmlkfSB3aXRoICR7dGhpcy5maXRCb3VuZHMudG9TdHJpbmcoKX1gICk7XHJcblxyXG4gICAgY29uc3QgeCA9IHRoaXMuZml0Qm91bmRzLm1pblg7XHJcbiAgICBjb25zdCB5ID0gdGhpcy5maXRCb3VuZHMubWluWTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeCApICYmIGlzRmluaXRlKCB5ICksICdJbnZhbGlkIFNWRyB0cmFuc2Zvcm0gZm9yIFNWR0Jsb2NrJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5maXRCb3VuZHMuaXNWYWxpZCgpLCAnSW52YWxpZCBmaXRCb3VuZHMnICk7XHJcblxyXG4gICAgdGhpcy5iYXNlVHJhbnNmb3JtR3JvdXAuc2V0QXR0cmlidXRlKCAndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgkey14fSwkey15fSlgICk7IC8vIHN1YnRyYWN0IG9mZiBzbyB3ZSBoYXZlIGEgdGlnaHQgZml0XHJcbiAgICBVdGlscy5zZXRUcmFuc2Zvcm0oIGBtYXRyaXgoMSwwLDAsMSwke3h9LCR7eX0pYCwgdGhpcy5zdmcgKTsgLy8gcmVhcHBseSB0aGUgdHJhbnNsYXRpb24gYXMgYSBDU1MgdHJhbnNmb3JtXHJcbiAgICB0aGlzLnN2Zy5zZXRBdHRyaWJ1dGUoICd3aWR0aCcsIHRoaXMuZml0Qm91bmRzLndpZHRoICk7XHJcbiAgICB0aGlzLnN2Zy5zZXRBdHRyaWJ1dGUoICdoZWlnaHQnLCB0aGlzLmZpdEJvdW5kcy5oZWlnaHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIERPTSBhcHBlYXJhbmNlIG9mIHRoaXMgZHJhd2FibGUgKHdoZXRoZXIgYnkgcHJlcGFyaW5nL2NhbGxpbmcgZHJhdyBjYWxscywgRE9NIGVsZW1lbnQgdXBkYXRlcywgZXRjLilcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoZSB1cGRhdGUgc2hvdWxkIGNvbnRpbnVlIChpZiBmYWxzZSwgZnVydGhlciB1cGRhdGVzIGluIHN1cGVydHlwZSBzdGVwcyBzaG91bGQgbm90XHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgYmUgZG9uZSkuXHJcbiAgICovXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgLy8gU2VlIGlmIHdlIG5lZWQgdG8gYWN0dWFsbHkgdXBkYXRlIHRoaW5ncyAod2lsbCBiYWlsIG91dCBpZiB3ZSBhcmUgbm90IGRpcnR5LCBvciBpZiB3ZSd2ZSBiZWVuIGRpc3Bvc2VkKVxyXG4gICAgaWYgKCAhc3VwZXIudXBkYXRlKCkgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU1ZHQmxvY2sgJiYgc2NlbmVyeUxvZy5TVkdCbG9jayggYHVwZGF0ZSAjJHt0aGlzLmlkfWAgKTtcclxuXHJcbiAgICAvL09IVFdPIFRPRE86IGNhbGwgaGVyZSFcclxuICAgIC8vIFRPRE86IFdoYXQgZG9lcyB0aGUgYWJvdmUgVE9ETyBtZWFuP1xyXG4gICAgd2hpbGUgKCB0aGlzLmRpcnR5R3JvdXBzLmxlbmd0aCApIHtcclxuICAgICAgY29uc3QgZ3JvdXAgPSB0aGlzLmRpcnR5R3JvdXBzLnBvcCgpO1xyXG5cclxuICAgICAgLy8gaWYgdGhpcyBncm91cCBoYXMgYmVlbiBkaXNwb3NlZCBvciBtb3ZlZCB0byBhbm90aGVyIGJsb2NrLCBkb24ndCBtZXNzIHdpdGggaXRcclxuICAgICAgaWYgKCBncm91cC5ibG9jayA9PT0gdGhpcyApIHtcclxuICAgICAgICBncm91cC51cGRhdGUoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgd2hpbGUgKCB0aGlzLmRpcnR5R3JhZGllbnRzLmxlbmd0aCApIHtcclxuICAgICAgdGhpcy5kaXJ0eUdyYWRpZW50cy5wb3AoKS51cGRhdGUoKTtcclxuICAgIH1cclxuICAgIHdoaWxlICggdGhpcy5kaXJ0eURyYXdhYmxlcy5sZW5ndGggKSB7XHJcbiAgICAgIGNvbnN0IGRyYXdhYmxlID0gdGhpcy5kaXJ0eURyYXdhYmxlcy5wb3AoKTtcclxuXHJcbiAgICAgIC8vIGlmIHRoaXMgZHJhd2FibGUgaGFzIGJlZW4gZGlzcG9zZWQgb3IgbW92ZWQgdG8gYW5vdGhlciBibG9jaywgZG9uJ3QgbWVzcyB3aXRoIGl0XHJcbiAgICAgIC8vIFRPRE86IElmIGl0IHdhcyBtb3ZlZCB0byBhbm90aGVyIGJsb2NrLCB3aHkgbWlnaHQgaXQgc3RpbGwgYXBwZWFyIGluIG91ciBsaXN0PyAgU2hvdWxkbid0IHRoYXQgYmUgYW4gYXNzZXJ0aW9uIGNoZWNrP1xyXG4gICAgICBpZiAoIGRyYXdhYmxlLnBhcmVudERyYXdhYmxlID09PSB0aGlzICkge1xyXG4gICAgICAgIGRyYXdhYmxlLnVwZGF0ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hcmVSZWZlcmVuY2VzUmVkdWNlZCA9IHRydWU7IC8vIE9uY2Ugd2UndmUgaXRlcmF0ZWQgdGhyb3VnaCB0aGluZ3MsIHdlJ3ZlIGF1dG9tYXRpY2FsbHkgcmVkdWNlZCBvdXIgcmVmZXJlbmNlcy5cclxuXHJcbiAgICAvLyBjaGVja3Mgd2lsbCBiZSBkb25lIGluIHVwZGF0ZUZpdCgpIHRvIHNlZSB3aGV0aGVyIGl0IGlzIG5lZWRlZFxyXG4gICAgdGhpcy51cGRhdGVGaXQoKTtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExvb2tzIHRvIHJlbW92ZSBkaXJ0eSBvYmplY3RzIHRoYXQgbWF5IGhhdmUgYmVlbiBkaXNwb3NlZC5cclxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VuZXJneS1mb3Jtcy1hbmQtY2hhbmdlcy9pc3N1ZXMvMzU2XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlZHVjZVJlZmVyZW5jZXMoKSB7XHJcbiAgICAvLyBuby1vcCBpZiB3ZSBoYWQgYW4gdXBkYXRlIGZpcnN0XHJcbiAgICBpZiAoIHRoaXMuYXJlUmVmZXJlbmNlc1JlZHVjZWQgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBdHRlbXB0cyB0byBkbyB0aGlzIGluIGEgaGlnaC1wZXJmb3JtYW5jZSB3YXksIHdoZXJlIHdlJ3JlIG5vdCBzaGlmdGluZyBhcnJheSBjb250ZW50cyBhcm91bmQgKHNvIHdlJ2xsIGRvIHRoaXNcclxuICAgIC8vIGluIG9uZSBzY2FuKS5cclxuXHJcbiAgICBsZXQgaW5zcGVjdGlvbkluZGV4ID0gMDtcclxuICAgIGxldCByZXBsYWNlbWVudEluZGV4ID0gMDtcclxuXHJcbiAgICB3aGlsZSAoIGluc3BlY3Rpb25JbmRleCA8IHRoaXMuZGlydHlHcm91cHMubGVuZ3RoICkge1xyXG4gICAgICBjb25zdCBncm91cCA9IHRoaXMuZGlydHlHcm91cHNbIGluc3BlY3Rpb25JbmRleCBdO1xyXG5cclxuICAgICAgLy8gT25seSBrZWVwIHRoaW5ncyB0aGF0IHJlZmVyZW5jZSBvdXIgYmxvY2suXHJcbiAgICAgIGlmICggZ3JvdXAuYmxvY2sgPT09IHRoaXMgKSB7XHJcbiAgICAgICAgLy8gSWYgdGhlIGluZGljZXMgYXJlIHRoZSBzYW1lLCBkb24ndCBkbyB0aGUgb3BlcmF0aW9uXHJcbiAgICAgICAgaWYgKCByZXBsYWNlbWVudEluZGV4ICE9PSBpbnNwZWN0aW9uSW5kZXggKSB7XHJcbiAgICAgICAgICB0aGlzLmRpcnR5R3JvdXBzWyByZXBsYWNlbWVudEluZGV4IF0gPSBncm91cDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVwbGFjZW1lbnRJbmRleCsrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpbnNwZWN0aW9uSW5kZXgrKztcclxuICAgIH1cclxuXHJcbiAgICAvLyBPdXIgYXJyYXkgc2hvdWxkIGJlIG9ubHkgdGhhdCBsZW5ndGggbm93XHJcbiAgICB3aGlsZSAoIHRoaXMuZGlydHlHcm91cHMubGVuZ3RoID4gcmVwbGFjZW1lbnRJbmRleCApIHtcclxuICAgICAgdGhpcy5kaXJ0eUdyb3Vwcy5wb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBEbyBhIHNpbWlsYXIgdGhpbmcgd2l0aCBkaXJ0eURyYXdhYmxlcyAobm90IG9wdGltaXplZCBvdXQgYmVjYXVzZSBmb3IgcmlnaHQgbm93IHdlIHdhbnQgdG8gbWF4aW1pemUgcGVyZm9ybWFuY2UpLlxyXG4gICAgaW5zcGVjdGlvbkluZGV4ID0gMDtcclxuICAgIHJlcGxhY2VtZW50SW5kZXggPSAwO1xyXG5cclxuICAgIHdoaWxlICggaW5zcGVjdGlvbkluZGV4IDwgdGhpcy5kaXJ0eURyYXdhYmxlcy5sZW5ndGggKSB7XHJcbiAgICAgIGNvbnN0IGRyYXdhYmxlID0gdGhpcy5kaXJ0eURyYXdhYmxlc1sgaW5zcGVjdGlvbkluZGV4IF07XHJcblxyXG4gICAgICAvLyBPbmx5IGtlZXAgdGhpbmdzIHRoYXQgcmVmZXJlbmNlIG91ciBibG9jayBhcyB0aGUgcGFyZW50RHJhd2FibGUuXHJcbiAgICAgIGlmICggZHJhd2FibGUucGFyZW50RHJhd2FibGUgPT09IHRoaXMgKSB7XHJcbiAgICAgICAgLy8gSWYgdGhlIGluZGljZXMgYXJlIHRoZSBzYW1lLCBkb24ndCBkbyB0aGUgb3BlcmF0aW9uXHJcbiAgICAgICAgaWYgKCByZXBsYWNlbWVudEluZGV4ICE9PSBpbnNwZWN0aW9uSW5kZXggKSB7XHJcbiAgICAgICAgICB0aGlzLmRpcnR5RHJhd2FibGVzWyByZXBsYWNlbWVudEluZGV4IF0gPSBkcmF3YWJsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVwbGFjZW1lbnRJbmRleCsrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpbnNwZWN0aW9uSW5kZXgrKztcclxuICAgIH1cclxuXHJcbiAgICAvLyBPdXIgYXJyYXkgc2hvdWxkIGJlIG9ubHkgdGhhdCBsZW5ndGggbm93XHJcbiAgICB3aGlsZSAoIHRoaXMuZGlydHlEcmF3YWJsZXMubGVuZ3RoID4gcmVwbGFjZW1lbnRJbmRleCApIHtcclxuICAgICAgdGhpcy5kaXJ0eURyYXdhYmxlcy5wb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmFyZVJlZmVyZW5jZXNSZWR1Y2VkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TVkdCbG9jayAmJiBzY2VuZXJ5TG9nLlNWR0Jsb2NrKCBgZGlzcG9zZSAjJHt0aGlzLmlkfWAgKTtcclxuXHJcbiAgICAvLyBtYWtlIGl0IHRha2UgdXAgemVybyBhcmVhLCBzbyB0aGF0IHdlIGRvbid0IHVzZSB1cCBleGNlc3MgbWVtb3J5XHJcbiAgICB0aGlzLnN2Zy5zZXRBdHRyaWJ1dGUoICd3aWR0aCcsICcwJyApO1xyXG4gICAgdGhpcy5zdmcuc2V0QXR0cmlidXRlKCAnaGVpZ2h0JywgJzAnICk7XHJcblxyXG4gICAgLy8gY2xlYXIgcmVmZXJlbmNlc1xyXG4gICAgdGhpcy5maWx0ZXJSb290SW5zdGFuY2UgPSBudWxsO1xyXG5cclxuICAgIGNsZWFuQXJyYXkoIHRoaXMuZGlydHlHcmFkaWVudHMgKTtcclxuICAgIGNsZWFuQXJyYXkoIHRoaXMuZGlydHlHcm91cHMgKTtcclxuICAgIGNsZWFuQXJyYXkoIHRoaXMuZGlydHlEcmF3YWJsZXMgKTtcclxuXHJcbiAgICB0aGlzLnBhaW50Q291bnRNYXAuY2xlYXIoKTtcclxuXHJcbiAgICB0aGlzLmJhc2VUcmFuc2Zvcm1Hcm91cC5yZW1vdmVDaGlsZCggdGhpcy5yb290R3JvdXAuc3ZnR3JvdXAgKTtcclxuICAgIHRoaXMucm9vdEdyb3VwLmRpc3Bvc2UoKTtcclxuICAgIHRoaXMucm9vdEdyb3VwID0gbnVsbDtcclxuXHJcbiAgICAvLyBzaW5jZSB3ZSBtYXkgbm90IHByb3Blcmx5IHJlbW92ZSBhbGwgZGVmcyB5ZXRcclxuICAgIHdoaWxlICggdGhpcy5kZWZzLmNoaWxkTm9kZXMubGVuZ3RoICkge1xyXG4gICAgICB0aGlzLmRlZnMucmVtb3ZlQ2hpbGQoIHRoaXMuZGVmcy5jaGlsZE5vZGVzWyAwIF0gKTtcclxuICAgIH1cclxuXHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZVxyXG4gICAqL1xyXG4gIGFkZERyYXdhYmxlKCBkcmF3YWJsZSApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TVkdCbG9jayAmJiBzY2VuZXJ5TG9nLlNWR0Jsb2NrKCBgIyR7dGhpcy5pZH0uYWRkRHJhd2FibGUgJHtkcmF3YWJsZS50b1N0cmluZygpfWAgKTtcclxuXHJcbiAgICBzdXBlci5hZGREcmF3YWJsZSggZHJhd2FibGUgKTtcclxuXHJcbiAgICBTVkdHcm91cC5hZGREcmF3YWJsZSggdGhpcywgZHJhd2FibGUgKTtcclxuICAgIGRyYXdhYmxlLnVwZGF0ZVNWR0Jsb2NrKCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZVxyXG4gICAqL1xyXG4gIHJlbW92ZURyYXdhYmxlKCBkcmF3YWJsZSApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TVkdCbG9jayAmJiBzY2VuZXJ5TG9nLlNWR0Jsb2NrKCBgIyR7dGhpcy5pZH0ucmVtb3ZlRHJhd2FibGUgJHtkcmF3YWJsZS50b1N0cmluZygpfWAgKTtcclxuXHJcbiAgICBTVkdHcm91cC5yZW1vdmVEcmF3YWJsZSggdGhpcywgZHJhd2FibGUgKTtcclxuXHJcbiAgICBzdXBlci5yZW1vdmVEcmF3YWJsZSggZHJhd2FibGUgKTtcclxuXHJcbiAgICAvLyBOT1RFOiB3ZSBkb24ndCB1bnNldCB0aGUgZHJhd2FibGUncyBkZWZzIGhlcmUsIHNpbmNlIGl0IHdpbGwgZWl0aGVyIGJlIGRpc3Bvc2VkICh3aWxsIGNsZWFyIGl0KVxyXG4gICAgLy8gb3Igd2lsbCBiZSBhZGRlZCB0byBhbm90aGVyIFNWR0Jsb2NrICh3aGljaCB3aWxsIG92ZXJ3cml0ZSBpdClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGZpcnN0RHJhd2FibGVcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBsYXN0RHJhd2FibGVcclxuICAgKi9cclxuICBvbkludGVydmFsQ2hhbmdlKCBmaXJzdERyYXdhYmxlLCBsYXN0RHJhd2FibGUgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU1ZHQmxvY2sgJiYgc2NlbmVyeUxvZy5TVkdCbG9jayggYCMke3RoaXMuaWR9Lm9uSW50ZXJ2YWxDaGFuZ2UgJHtmaXJzdERyYXdhYmxlLnRvU3RyaW5nKCl9IHRvICR7bGFzdERyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIHN1cGVyLm9uSW50ZXJ2YWxDaGFuZ2UoIGZpcnN0RHJhd2FibGUsIGxhc3REcmF3YWJsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHN0cmluZyBmb3JtIG9mIHRoaXMgb2JqZWN0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICB0b1N0cmluZygpIHtcclxuICAgIHJldHVybiBgU1ZHQmxvY2sjJHt0aGlzLmlkfS0ke0ZpdHRlZEJsb2NrLmZpdFN0cmluZ1sgdGhpcy5maXQgXX1gO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ1NWR0Jsb2NrJywgU1ZHQmxvY2sgKTtcclxuXHJcblBvb2xhYmxlLm1peEludG8oIFNWR0Jsb2NrICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTVkdCbG9jazsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLHFDQUFxQztBQUM1RCxPQUFPQyxRQUFRLE1BQU0sbUNBQW1DO0FBQ3hELFNBQVNDLFFBQVEsRUFBRUMsV0FBVyxFQUFFQyxPQUFPLEVBQUVDLFFBQVEsRUFBRUMsS0FBSyxFQUFFQyxLQUFLLFFBQVEsZUFBZTtBQUV0RixNQUFNQyxRQUFRLFNBQVNMLFdBQVcsQ0FBQztFQUNqQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VNLFdBQVdBLENBQUVDLE9BQU8sRUFBRUMsUUFBUSxFQUFFQyxxQkFBcUIsRUFBRUMsa0JBQWtCLEVBQUc7SUFDMUUsS0FBSyxDQUFDLENBQUM7SUFFUCxJQUFJLENBQUNDLFVBQVUsQ0FBRUosT0FBTyxFQUFFQyxRQUFRLEVBQUVDLHFCQUFxQixFQUFFQyxrQkFBbUIsQ0FBQztFQUNqRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsVUFBVUEsQ0FBRUosT0FBTyxFQUFFQyxRQUFRLEVBQUVDLHFCQUFxQixFQUFFQyxrQkFBa0IsRUFBRztJQUN6RSxLQUFLLENBQUNDLFVBQVUsQ0FBRUosT0FBTyxFQUFFQyxRQUFRLEVBQUVDLHFCQUFxQixFQUFFVCxXQUFXLENBQUNZLGVBQWdCLENBQUM7O0lBRXpGO0lBQ0EsSUFBSSxDQUFDRixrQkFBa0IsR0FBR0Esa0JBQWtCOztJQUU1QztJQUNBLElBQUksQ0FBQ0csY0FBYyxHQUFHaEIsVUFBVSxDQUFFLElBQUksQ0FBQ2dCLGNBQWUsQ0FBQzs7SUFFdkQ7SUFDQSxJQUFJLENBQUNDLFdBQVcsR0FBR2pC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