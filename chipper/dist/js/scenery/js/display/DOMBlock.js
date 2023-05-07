// Copyright 2014-2022, University of Colorado Boulder

/**
 * DOM Drawable wrapper for another DOM Drawable. Used so that we can have our own independent siblings, generally as part
 * of a Backbone's layers/blocks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Poolable from '../../../phet-core/js/Poolable.js';
import { Block, scenery } from '../imports.js';
class DOMBlock extends Block {
  /**
   * @mixes Poolable
   *
   * @param {Display} display
   * @param {Drawable} domDrawable
   */
  constructor(display, domDrawable) {
    super();
    this.initialize(display, domDrawable);
  }

  /**
   * @public
   *
   * @param {Display} display
   * @param {Drawable} domDrawable
   * @returns {DOMBlock} - For chaining
   */
  initialize(display, domDrawable) {
    // TODO: is it bad to pass the acceleration flags along?
    super.initialize(display, domDrawable.renderer);
    this.domDrawable = domDrawable;
    this.domElement = domDrawable.domElement;
    return this;
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
    this.domDrawable.update();
    return true;
  }

  /**
   * Releases references
   * @public
   * @override
   */
  dispose() {
    this.domDrawable = null;
    this.domElement = null;

    // super call
    super.dispose();
  }

  /**
   * @public
   *
   * @param {Drawable} drawable
   */
  markDirtyDrawable(drawable) {
    this.markDirty();
  }

  /**
   * Adds a drawable to this block.
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */
  addDrawable(drawable) {
    sceneryLog && sceneryLog.DOMBlock && sceneryLog.DOMBlock(`#${this.id}.addDrawable ${drawable.toString()}`);
    assert && assert(this.domDrawable === drawable, 'DOMBlock should only be used with one drawable for now (the one it was initialized with)');
    super.addDrawable(drawable);
  }

  /**
   * Removes a drawable from this block.
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */
  removeDrawable(drawable) {
    sceneryLog && sceneryLog.DOMBlock && sceneryLog.DOMBlock(`#${this.id}.removeDrawable ${drawable.toString()}`);
    assert && assert(this.domDrawable === drawable, 'DOMBlock should only be used with one drawable for now (the one it was initialized with)');
    super.removeDrawable(drawable);
  }
}
scenery.register('DOMBlock', DOMBlock);
Poolable.mixInto(DOMBlock);
export default DOMBlock;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQb29sYWJsZSIsIkJsb2NrIiwic2NlbmVyeSIsIkRPTUJsb2NrIiwiY29uc3RydWN0b3IiLCJkaXNwbGF5IiwiZG9tRHJhd2FibGUiLCJpbml0aWFsaXplIiwicmVuZGVyZXIiLCJkb21FbGVtZW50IiwidXBkYXRlIiwiZGlzcG9zZSIsIm1hcmtEaXJ0eURyYXdhYmxlIiwiZHJhd2FibGUiLCJtYXJrRGlydHkiLCJhZGREcmF3YWJsZSIsInNjZW5lcnlMb2ciLCJpZCIsInRvU3RyaW5nIiwiYXNzZXJ0IiwicmVtb3ZlRHJhd2FibGUiLCJyZWdpc3RlciIsIm1peEludG8iXSwic291cmNlcyI6WyJET01CbG9jay5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBET00gRHJhd2FibGUgd3JhcHBlciBmb3IgYW5vdGhlciBET00gRHJhd2FibGUuIFVzZWQgc28gdGhhdCB3ZSBjYW4gaGF2ZSBvdXIgb3duIGluZGVwZW5kZW50IHNpYmxpbmdzLCBnZW5lcmFsbHkgYXMgcGFydFxyXG4gKiBvZiBhIEJhY2tib25lJ3MgbGF5ZXJzL2Jsb2Nrcy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xyXG5pbXBvcnQgeyBCbG9jaywgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5cclxuY2xhc3MgRE9NQmxvY2sgZXh0ZW5kcyBCbG9jayB7XHJcbiAgLyoqXHJcbiAgICogQG1peGVzIFBvb2xhYmxlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Rpc3BsYXl9IGRpc3BsYXlcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkb21EcmF3YWJsZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBkaXNwbGF5LCBkb21EcmF3YWJsZSApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdGhpcy5pbml0aWFsaXplKCBkaXNwbGF5LCBkb21EcmF3YWJsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZG9tRHJhd2FibGVcclxuICAgKiBAcmV0dXJucyB7RE9NQmxvY2t9IC0gRm9yIGNoYWluaW5nXHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZSggZGlzcGxheSwgZG9tRHJhd2FibGUgKSB7XHJcbiAgICAvLyBUT0RPOiBpcyBpdCBiYWQgdG8gcGFzcyB0aGUgYWNjZWxlcmF0aW9uIGZsYWdzIGFsb25nP1xyXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSggZGlzcGxheSwgZG9tRHJhd2FibGUucmVuZGVyZXIgKTtcclxuXHJcbiAgICB0aGlzLmRvbURyYXdhYmxlID0gZG9tRHJhd2FibGU7XHJcbiAgICB0aGlzLmRvbUVsZW1lbnQgPSBkb21EcmF3YWJsZS5kb21FbGVtZW50O1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgRE9NIGFwcGVhcmFuY2Ugb2YgdGhpcyBkcmF3YWJsZSAod2hldGhlciBieSBwcmVwYXJpbmcvY2FsbGluZyBkcmF3IGNhbGxzLCBET00gZWxlbWVudCB1cGRhdGVzLCBldGMuKVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIFdoZXRoZXIgdGhlIHVwZGF0ZSBzaG91bGQgY29udGludWUgKGlmIGZhbHNlLCBmdXJ0aGVyIHVwZGF0ZXMgaW4gc3VwZXJ0eXBlIHN0ZXBzIHNob3VsZCBub3RcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICBiZSBkb25lKS5cclxuICAgKi9cclxuICB1cGRhdGUoKSB7XHJcbiAgICAvLyBTZWUgaWYgd2UgbmVlZCB0byBhY3R1YWxseSB1cGRhdGUgdGhpbmdzICh3aWxsIGJhaWwgb3V0IGlmIHdlIGFyZSBub3QgZGlydHksIG9yIGlmIHdlJ3ZlIGJlZW4gZGlzcG9zZWQpXHJcbiAgICBpZiAoICFzdXBlci51cGRhdGUoKSApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZG9tRHJhd2FibGUudXBkYXRlKCk7XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmRvbURyYXdhYmxlID0gbnVsbDtcclxuICAgIHRoaXMuZG9tRWxlbWVudCA9IG51bGw7XHJcblxyXG4gICAgLy8gc3VwZXIgY2FsbFxyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcclxuICAgKi9cclxuICBtYXJrRGlydHlEcmF3YWJsZSggZHJhd2FibGUgKSB7XHJcbiAgICB0aGlzLm1hcmtEaXJ0eSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIGRyYXdhYmxlIHRvIHRoaXMgYmxvY2suXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcclxuICAgKi9cclxuICBhZGREcmF3YWJsZSggZHJhd2FibGUgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRE9NQmxvY2sgJiYgc2NlbmVyeUxvZy5ET01CbG9jayggYCMke3RoaXMuaWR9LmFkZERyYXdhYmxlICR7ZHJhd2FibGUudG9TdHJpbmcoKX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmRvbURyYXdhYmxlID09PSBkcmF3YWJsZSwgJ0RPTUJsb2NrIHNob3VsZCBvbmx5IGJlIHVzZWQgd2l0aCBvbmUgZHJhd2FibGUgZm9yIG5vdyAodGhlIG9uZSBpdCB3YXMgaW5pdGlhbGl6ZWQgd2l0aCknICk7XHJcblxyXG4gICAgc3VwZXIuYWRkRHJhd2FibGUoIGRyYXdhYmxlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGEgZHJhd2FibGUgZnJvbSB0aGlzIGJsb2NrLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXHJcbiAgICovXHJcbiAgcmVtb3ZlRHJhd2FibGUoIGRyYXdhYmxlICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRPTUJsb2NrICYmIHNjZW5lcnlMb2cuRE9NQmxvY2soIGAjJHt0aGlzLmlkfS5yZW1vdmVEcmF3YWJsZSAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5kb21EcmF3YWJsZSA9PT0gZHJhd2FibGUsICdET01CbG9jayBzaG91bGQgb25seSBiZSB1c2VkIHdpdGggb25lIGRyYXdhYmxlIGZvciBub3cgKHRoZSBvbmUgaXQgd2FzIGluaXRpYWxpemVkIHdpdGgpJyApO1xyXG5cclxuICAgIHN1cGVyLnJlbW92ZURyYXdhYmxlKCBkcmF3YWJsZSApO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0RPTUJsb2NrJywgRE9NQmxvY2sgKTtcclxuXHJcblBvb2xhYmxlLm1peEludG8oIERPTUJsb2NrICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBET01CbG9jazsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNB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