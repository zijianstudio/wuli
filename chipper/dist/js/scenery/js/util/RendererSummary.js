// Copyright 2013-2022, University of Colorado Boulder

/**
 * Contains information about what renderers (and a few other flags) are supported for an entire subtree.
 *
 * We effectively do this by tracking bitmask changes from scenery.js (used for rendering properties in general). In particular, we count
 * how many zeros in the bitmask we have in key places.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Node, Renderer, scenery } from '../imports.js';
const summaryBits = [
// renderer bits ("Is renderer X supported by the entire sub-tree?")
Renderer.bitmaskCanvas, Renderer.bitmaskSVG, Renderer.bitmaskDOM, Renderer.bitmaskWebGL,
// summary bits (added to the renderer bitmask to handle special flags for the summary)
Renderer.bitmaskSingleCanvas, Renderer.bitmaskSingleSVG, Renderer.bitmaskNotPainted, Renderer.bitmaskBoundsValid,
// NOTE: This could be separated out into its own implementation for this flag, since
// there are cases where we actually have nothing fromt he PDOM DUE to things being pulled out by another pdom order.
// This is generally NOT the case, so I've left this in here because it significantly simplifies the implementation.
Renderer.bitmaskNoPDOM,
// inverse renderer bits ("Do all painted nodes NOT support renderer X in this sub-tree?")
Renderer.bitmaskLacksCanvas, Renderer.bitmaskLacksSVG, Renderer.bitmaskLacksDOM, Renderer.bitmaskLacksWebGL];
const numSummaryBits = summaryBits.length;

// A bitmask with all of the bits set that we record
let bitmaskAll = 0;
for (let l = 0; l < numSummaryBits; l++) {
  bitmaskAll |= summaryBits[l];
}
class RendererSummary {
  /**
   * @param {Node} node
   */
  constructor(node) {
    assert && assert(node instanceof Node);

    // NOTE: assumes that we are created in the Node constructor
    assert && assert(node._rendererBitmask === Renderer.bitmaskNodeDefault, 'Node must have a default bitmask when creating a RendererSummary');
    assert && assert(node._children.length === 0, 'Node cannot have children when creating a RendererSummary');

    // @private {Node}
    this.node = node;

    // @private {Object} Maps stringified bitmask bit (e.g. "1" for Canvas, since Renderer.bitmaskCanvas is 0x01) to
    // a count of how many children (or self) have that property (e.g. can't renderer all of their contents with Canvas)
    this._counts = {};
    for (let i = 0; i < numSummaryBits; i++) {
      this._counts[summaryBits[i]] = 0; // set everything to 0 at first
    }

    // @public {number} (scenery-internal)
    this.bitmask = bitmaskAll;

    // @private {number}
    this.selfBitmask = RendererSummary.summaryBitmaskForNodeSelf(node);
    this.summaryChange(this.bitmask, this.selfBitmask);

    // required listeners to update our summary based on painted/non-painted information
    const listener = this.selfChange.bind(this);
    this.node.filterChangeEmitter.addListener(listener);
    this.node.clipAreaProperty.lazyLink(listener);
    this.node.rendererSummaryRefreshEmitter.addListener(listener);
  }

  /**
   * Use a bitmask of all 1s to represent 'does not exist' since we count zeros
   * @public
   *
   * @param {number} oldBitmask
   * @param {number} newBitmask
   */
  summaryChange(oldBitmask, newBitmask) {
    assert && this.audit();
    const changeBitmask = oldBitmask ^ newBitmask; // bit set only if it changed

    let ancestorOldMask = 0;
    let ancestorNewMask = 0;
    for (let i = 0; i < numSummaryBits; i++) {
      const bit = summaryBits[i];

      // If the bit for the renderer has changed
      if (bit & changeBitmask) {
        // If it is now set (wasn't before), gained support for the renderer
        if (bit & newBitmask) {
          this._counts[bit]--; // reduce count, since we count the number of 0s (unsupported)
          if (this._counts[bit] === 0) {
            ancestorNewMask |= bit; // add our bit to the "new" mask we will send to ancestors
          }
        }
        // It was set before (now isn't), lost support for the renderer
        else {
          this._counts[bit]++; // increment the count, since we count the number of 0s (unsupported)
          if (this._counts[bit] === 1) {
            ancestorOldMask |= bit; // add our bit to the "old" mask we will send to ancestors
          }
        }
      }
    }

    if (ancestorOldMask || ancestorNewMask) {
      const oldSubtreeBitmask = this.bitmask;
      assert && assert(oldSubtreeBitmask !== undefined);
      for (let j = 0; j < numSummaryBits; j++) {
        const ancestorBit = summaryBits[j];
        // Check for added bits
        if (ancestorNewMask & ancestorBit) {
          this.bitmask |= ancestorBit;
        }

        // Check for removed bits
        if (ancestorOldMask & ancestorBit) {
          this.bitmask ^= ancestorBit;
          assert && assert(!(this.bitmask & ancestorBit), 'Should be cleared, doing cheaper XOR assuming it already was set');
        }
      }
      this.node.instanceRefreshEmitter.emit();
      this.node.onSummaryChange(oldSubtreeBitmask, this.bitmask);
      const len = this.node._parents.length;
      for (let k = 0; k < len; k++) {
        this.node._parents[k]._rendererSummary.summaryChange(ancestorOldMask, ancestorNewMask);
      }
      assert && assert(this.bitmask === this.computeBitmask(), 'Sanity check');
    }
    assert && this.audit();
  }

  /**
   * @public
   */
  selfChange() {
    const oldBitmask = this.selfBitmask;
    const newBitmask = RendererSummary.summaryBitmaskForNodeSelf(this.node);
    if (oldBitmask !== newBitmask) {
      this.summaryChange(oldBitmask, newBitmask);
      this.selfBitmask = newBitmask;
    }
  }

  /**
   * @private
   *
   * @returns {number}
   */
  computeBitmask() {
    let bitmask = 0;
    for (let i = 0; i < numSummaryBits; i++) {
      if (this._counts[summaryBits[i]] === 0) {
        bitmask |= summaryBits[i];
      }
    }
    return bitmask;
  }

  /**
   * @public
   * Is the renderer compatible with every single painted node under this subtree?
   * (Can this entire sub-tree be rendered with just this renderer)
   *
   * @param {number} renderer - Single bit preferred. If multiple bits set, requires ALL painted nodes are compatible
   *                            with ALL of the bits.
   */
  isSubtreeFullyCompatible(renderer) {
    return !!(renderer & this.bitmask);
  }

  /**
   * @public
   * Is the renderer compatible with at least one painted node under this subtree?
   *
   * @param {number} renderer - Single bit preferred. If multiple bits set, will return if a single painted node is
   *                            compatible with at least one of the bits.
   */
  isSubtreeContainingCompatible(renderer) {
    return !(renderer << Renderer.bitmaskLacksShift & this.bitmask);
  }

  /**
   * @public
   *
   * @returns {boolean}
   */
  isSingleCanvasSupported() {
    return !!(Renderer.bitmaskSingleCanvas & this.bitmask);
  }

  /**
   * @public
   *
   * @returns {boolean}
   */
  isSingleSVGSupported() {
    return !!(Renderer.bitmaskSingleSVG & this.bitmask);
  }

  /**
   * @public
   *
   * @returns {boolean}
   */
  isNotPainted() {
    return !!(Renderer.bitmaskNotPainted & this.bitmask);
  }

  /**
   * @public
   *
   * @returns {boolean}
   */
  hasNoPDOM() {
    return !!(Renderer.bitmaskNoPDOM & this.bitmask);
  }

  /**
   * @public
   *
   * @returns {boolean}
   */
  areBoundsValid() {
    return !!(Renderer.bitmaskBoundsValid & this.bitmask);
  }

  /**
   * Given a bitmask representing a list of ordered preferred renderers, we check to see if all of our nodes can be
   * displayed in a single SVG block, AND that given the preferred renderers, that it will actually happen in our
   * rendering process.
   * @public
   *
   * @param {number} preferredRenderers
   * @returns {boolean}
   */
  isSubtreeRenderedExclusivelySVG(preferredRenderers) {
    // Check if we have anything that would PREVENT us from having a single SVG block
    if (!this.isSingleSVGSupported()) {
      return false;
    }

    // Check for any renderer preferences that would CAUSE us to choose not to display with a single SVG block
    for (let i = 0; i < Renderer.numActiveRenderers; i++) {
      // Grab the next-most preferred renderer
      const renderer = Renderer.bitmaskOrder(preferredRenderers, i);

      // If it's SVG, congrats! Everything will render in SVG (since SVG is supported, as noted above)
      if (Renderer.bitmaskSVG & renderer) {
        return true;
      }

      // Since it's not SVG, if there's a single painted node that supports this renderer (which is preferred over SVG),
      // then it will be rendered with this renderer, NOT SVG.
      if (this.isSubtreeContainingCompatible(renderer)) {
        return false;
      }
    }
    return false; // sanity check
  }

  /**
   * Given a bitmask representing a list of ordered preferred renderers, we check to see if all of our nodes can be
   * displayed in a single Canvas block, AND that given the preferred renderers, that it will actually happen in our
   * rendering process.
   * @public
   *
   * @param {number} preferredRenderers
   * @returns {boolean}
   */
  isSubtreeRenderedExclusivelyCanvas(preferredRenderers) {
    // Check if we have anything that would PREVENT us from having a single Canvas block
    if (!this.isSingleCanvasSupported()) {
      return false;
    }

    // Check for any renderer preferences that would CAUSE us to choose not to display with a single Canvas block
    for (let i = 0; i < Renderer.numActiveRenderers; i++) {
      // Grab the next-most preferred renderer
      const renderer = Renderer.bitmaskOrder(preferredRenderers, i);

      // If it's Canvas, congrats! Everything will render in Canvas (since Canvas is supported, as noted above)
      if (Renderer.bitmaskCanvas & renderer) {
        return true;
      }

      // Since it's not Canvas, if there's a single painted node that supports this renderer (which is preferred over Canvas),
      // then it will be rendered with this renderer, NOT Canvas.
      if (this.isSubtreeContainingCompatible(renderer)) {
        return false;
      }
    }
    return false; // sanity check
  }

  /**
   * For debugging purposes
   * @public
   */
  audit() {
    if (assert) {
      for (let i = 0; i < numSummaryBits; i++) {
        const bit = summaryBits[i];
        const countIsZero = this._counts[bit] === 0;
        const bitmaskContainsBit = !!(this.bitmask & bit);
        assert(countIsZero === bitmaskContainsBit, 'Bits should be set if count is zero');
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
    let result = RendererSummary.bitmaskToString(this.bitmask);
    for (let i = 0; i < numSummaryBits; i++) {
      const bit = summaryBits[i];
      const countForBit = this._counts[bit];
      if (countForBit !== 0) {
        result += ` ${RendererSummary.bitToString(bit)}:${countForBit}`;
      }
    }
    return result;
  }

  /**
   * Determines which of the summary bits can be set for a specific Node (ignoring children/ancestors).
   * For instance, for bitmaskSingleSVG, we only don't include the flag if THIS node prevents its usage
   * (even though child nodes may prevent it in the renderer summary itself).
   * @public
   *
   * @param {Node} node
   */
  static summaryBitmaskForNodeSelf(node) {
    let bitmask = node._rendererBitmask;
    if (node.isPainted()) {
      bitmask |= (node._rendererBitmask & Renderer.bitmaskCurrentRendererArea ^ Renderer.bitmaskCurrentRendererArea) << Renderer.bitmaskLacksShift;
    } else {
      bitmask |= Renderer.bitmaskCurrentRendererArea << Renderer.bitmaskLacksShift;
    }

    // NOTE: If changing, see Instance.updateRenderingState
    const requiresSplit = node._hints.cssTransform || node._hints.layerSplit;
    const rendererHint = node._hints.renderer;

    // Whether this subtree will be able to support a single SVG element
    // NOTE: If changing, see Instance.updateRenderingState
    if (!requiresSplit &&
    // Can't have a single SVG element if we are split
    Renderer.isSVG(node._rendererBitmask) && (
    // If our node doesn't support SVG, can't do it
    !rendererHint || Renderer.isSVG(rendererHint))) {
      // Can't if a renderer hint is set to something else
      bitmask |= Renderer.bitmaskSingleSVG;
    }

    // Whether this subtree will be able to support a single Canvas element
    // NOTE: If changing, see Instance.updateRenderingState
    if (!requiresSplit &&
    // Can't have a single SVG element if we are split
    Renderer.isCanvas(node._rendererBitmask) && (
    // If our node doesn't support Canvas, can't do it
    !rendererHint || Renderer.isCanvas(rendererHint))) {
      // Can't if a renderer hint is set to something else
      bitmask |= Renderer.bitmaskSingleCanvas;
    }
    if (!node.isPainted()) {
      bitmask |= Renderer.bitmaskNotPainted;
    }
    if (node.areSelfBoundsValid()) {
      bitmask |= Renderer.bitmaskBoundsValid;
    }
    if (!node.hasPDOMContent && !node.hasPDOMOrder()) {
      bitmask |= Renderer.bitmaskNoPDOM;
    }
    return bitmask;
  }

  /**
   * For debugging purposes
   * @public
   *
   * @param {number} bit
   * @returns {string}
   */
  static bitToString(bit) {
    if (bit === Renderer.bitmaskCanvas) {
      return 'Canvas';
    }
    if (bit === Renderer.bitmaskSVG) {
      return 'SVG';
    }
    if (bit === Renderer.bitmaskDOM) {
      return 'DOM';
    }
    if (bit === Renderer.bitmaskWebGL) {
      return 'WebGL';
    }
    if (bit === Renderer.bitmaskLacksCanvas) {
      return '(-Canvas)';
    }
    if (bit === Renderer.bitmaskLacksSVG) {
      return '(-SVG)';
    }
    if (bit === Renderer.bitmaskLacksDOM) {
      return '(-DOM)';
    }
    if (bit === Renderer.bitmaskLacksWebGL) {
      return '(-WebGL)';
    }
    if (bit === Renderer.bitmaskSingleCanvas) {
      return 'SingleCanvas';
    }
    if (bit === Renderer.bitmaskSingleSVG) {
      return 'SingleSVG';
    }
    if (bit === Renderer.bitmaskNotPainted) {
      return 'NotPainted';
    }
    if (bit === Renderer.bitmaskBoundsValid) {
      return 'BoundsValid';
    }
    if (bit === Renderer.bitmaskNoPDOM) {
      return 'NotAccessible';
    }
    return '?';
  }

  /**
   * For debugging purposes
   * @public
   *
   * @param {number} bitmask
   * @returns {string}
   */
  static bitmaskToString(bitmask) {
    let result = '';
    for (let i = 0; i < numSummaryBits; i++) {
      const bit = summaryBits[i];
      if (bitmask & bit) {
        result += `${RendererSummary.bitToString(bit)} `;
      }
    }
    return result;
  }
}

// @public {number}
RendererSummary.bitmaskAll = bitmaskAll;
scenery.register('RendererSummary', RendererSummary);
export default RendererSummary;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb2RlIiwiUmVuZGVyZXIiLCJzY2VuZXJ5Iiwic3VtbWFyeUJpdHMiLCJiaXRtYXNrQ2FudmFzIiwiYml0bWFza1NWRyIsImJpdG1hc2tET00iLCJiaXRtYXNrV2ViR0wiLCJiaXRtYXNrU2luZ2xlQ2FudmFzIiwiYml0bWFza1NpbmdsZVNWRyIsImJpdG1hc2tOb3RQYWludGVkIiwiYml0bWFza0JvdW5kc1ZhbGlkIiwiYml0bWFza05vUERPTSIsImJpdG1hc2tMYWNrc0NhbnZhcyIsImJpdG1hc2tMYWNrc1NWRyIsImJpdG1hc2tMYWNrc0RPTSIsImJpdG1hc2tMYWNrc1dlYkdMIiwibnVtU3VtbWFyeUJpdHMiLCJsZW5ndGgiLCJiaXRtYXNrQWxsIiwibCIsIlJlbmRlcmVyU3VtbWFyeSIsImNvbnN0cnVjdG9yIiwibm9kZSIsImFzc2VydCIsIl9yZW5kZXJlckJpdG1hc2siLCJiaXRtYXNrTm9kZURlZmF1bHQiLCJfY2hpbGRyZW4iLCJfY291bnRzIiwiaSIsImJpdG1hc2siLCJzZWxmQml0bWFzayIsInN1bW1hcnlCaXRtYXNrRm9yTm9kZVNlbGYiLCJzdW1tYXJ5Q2hhbmdlIiwibGlzdGVuZXIiLCJzZWxmQ2hhbmdlIiwiYmluZCIsImZpbHRlckNoYW5nZUVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImNsaXBBcmVhUHJvcGVydHkiLCJsYXp5TGluayIsInJlbmRlcmVyU3VtbWFyeVJlZnJlc2hFbWl0dGVyIiwib2xkQml0bWFzayIsIm5ld0JpdG1hc2siLCJhdWRpdCIsImNoYW5nZUJpdG1hc2siLCJhbmNlc3Rvck9sZE1hc2siLCJhbmNlc3Rvck5ld01hc2siLCJiaXQiLCJvbGRTdWJ0cmVlQml0bWFzayIsInVuZGVmaW5lZCIsImoiLCJhbmNlc3RvckJpdCIsImluc3RhbmNlUmVmcmVzaEVtaXR0ZXIiLCJlbWl0Iiwib25TdW1tYXJ5Q2hhbmdlIiwibGVuIiwiX3BhcmVudHMiLCJrIiwiX3JlbmRlcmVyU3VtbWFyeSIsImNvbXB1dGVCaXRtYXNrIiwiaXNTdWJ0cmVlRnVsbHlDb21wYXRpYmxlIiwicmVuZGVyZXIiLCJpc1N1YnRyZWVDb250YWluaW5nQ29tcGF0aWJsZSIsImJpdG1hc2tMYWNrc1NoaWZ0IiwiaXNTaW5nbGVDYW52YXNTdXBwb3J0ZWQiLCJpc1NpbmdsZVNWR1N1cHBvcnRlZCIsImlzTm90UGFpbnRlZCIsImhhc05vUERPTSIsImFyZUJvdW5kc1ZhbGlkIiwiaXNTdWJ0cmVlUmVuZGVyZWRFeGNsdXNpdmVseVNWRyIsInByZWZlcnJlZFJlbmRlcmVycyIsIm51bUFjdGl2ZVJlbmRlcmVycyIsImJpdG1hc2tPcmRlciIsImlzU3VidHJlZVJlbmRlcmVkRXhjbHVzaXZlbHlDYW52YXMiLCJjb3VudElzWmVybyIsImJpdG1hc2tDb250YWluc0JpdCIsInRvU3RyaW5nIiwicmVzdWx0IiwiYml0bWFza1RvU3RyaW5nIiwiY291bnRGb3JCaXQiLCJiaXRUb1N0cmluZyIsImlzUGFpbnRlZCIsImJpdG1hc2tDdXJyZW50UmVuZGVyZXJBcmVhIiwicmVxdWlyZXNTcGxpdCIsIl9oaW50cyIsImNzc1RyYW5zZm9ybSIsImxheWVyU3BsaXQiLCJyZW5kZXJlckhpbnQiLCJpc1NWRyIsImlzQ2FudmFzIiwiYXJlU2VsZkJvdW5kc1ZhbGlkIiwiaGFzUERPTUNvbnRlbnQiLCJoYXNQRE9NT3JkZXIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJlbmRlcmVyU3VtbWFyeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCB3aGF0IHJlbmRlcmVycyAoYW5kIGEgZmV3IG90aGVyIGZsYWdzKSBhcmUgc3VwcG9ydGVkIGZvciBhbiBlbnRpcmUgc3VidHJlZS5cclxuICpcclxuICogV2UgZWZmZWN0aXZlbHkgZG8gdGhpcyBieSB0cmFja2luZyBiaXRtYXNrIGNoYW5nZXMgZnJvbSBzY2VuZXJ5LmpzICh1c2VkIGZvciByZW5kZXJpbmcgcHJvcGVydGllcyBpbiBnZW5lcmFsKS4gSW4gcGFydGljdWxhciwgd2UgY291bnRcclxuICogaG93IG1hbnkgemVyb3MgaW4gdGhlIGJpdG1hc2sgd2UgaGF2ZSBpbiBrZXkgcGxhY2VzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgTm9kZSwgUmVuZGVyZXIsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbmNvbnN0IHN1bW1hcnlCaXRzID0gW1xyXG4gIC8vIHJlbmRlcmVyIGJpdHMgKFwiSXMgcmVuZGVyZXIgWCBzdXBwb3J0ZWQgYnkgdGhlIGVudGlyZSBzdWItdHJlZT9cIilcclxuICBSZW5kZXJlci5iaXRtYXNrQ2FudmFzLFxyXG4gIFJlbmRlcmVyLmJpdG1hc2tTVkcsXHJcbiAgUmVuZGVyZXIuYml0bWFza0RPTSxcclxuICBSZW5kZXJlci5iaXRtYXNrV2ViR0wsXHJcblxyXG4gIC8vIHN1bW1hcnkgYml0cyAoYWRkZWQgdG8gdGhlIHJlbmRlcmVyIGJpdG1hc2sgdG8gaGFuZGxlIHNwZWNpYWwgZmxhZ3MgZm9yIHRoZSBzdW1tYXJ5KVxyXG4gIFJlbmRlcmVyLmJpdG1hc2tTaW5nbGVDYW52YXMsXHJcbiAgUmVuZGVyZXIuYml0bWFza1NpbmdsZVNWRyxcclxuICBSZW5kZXJlci5iaXRtYXNrTm90UGFpbnRlZCxcclxuICBSZW5kZXJlci5iaXRtYXNrQm91bmRzVmFsaWQsXHJcbiAgLy8gTk9URTogVGhpcyBjb3VsZCBiZSBzZXBhcmF0ZWQgb3V0IGludG8gaXRzIG93biBpbXBsZW1lbnRhdGlvbiBmb3IgdGhpcyBmbGFnLCBzaW5jZVxyXG4gIC8vIHRoZXJlIGFyZSBjYXNlcyB3aGVyZSB3ZSBhY3R1YWxseSBoYXZlIG5vdGhpbmcgZnJvbXQgaGUgUERPTSBEVUUgdG8gdGhpbmdzIGJlaW5nIHB1bGxlZCBvdXQgYnkgYW5vdGhlciBwZG9tIG9yZGVyLlxyXG4gIC8vIFRoaXMgaXMgZ2VuZXJhbGx5IE5PVCB0aGUgY2FzZSwgc28gSSd2ZSBsZWZ0IHRoaXMgaW4gaGVyZSBiZWNhdXNlIGl0IHNpZ25pZmljYW50bHkgc2ltcGxpZmllcyB0aGUgaW1wbGVtZW50YXRpb24uXHJcbiAgUmVuZGVyZXIuYml0bWFza05vUERPTSxcclxuXHJcbiAgLy8gaW52ZXJzZSByZW5kZXJlciBiaXRzIChcIkRvIGFsbCBwYWludGVkIG5vZGVzIE5PVCBzdXBwb3J0IHJlbmRlcmVyIFggaW4gdGhpcyBzdWItdHJlZT9cIilcclxuICBSZW5kZXJlci5iaXRtYXNrTGFja3NDYW52YXMsXHJcbiAgUmVuZGVyZXIuYml0bWFza0xhY2tzU1ZHLFxyXG4gIFJlbmRlcmVyLmJpdG1hc2tMYWNrc0RPTSxcclxuICBSZW5kZXJlci5iaXRtYXNrTGFja3NXZWJHTFxyXG5dO1xyXG5jb25zdCBudW1TdW1tYXJ5Qml0cyA9IHN1bW1hcnlCaXRzLmxlbmd0aDtcclxuXHJcbi8vIEEgYml0bWFzayB3aXRoIGFsbCBvZiB0aGUgYml0cyBzZXQgdGhhdCB3ZSByZWNvcmRcclxubGV0IGJpdG1hc2tBbGwgPSAwO1xyXG5mb3IgKCBsZXQgbCA9IDA7IGwgPCBudW1TdW1tYXJ5Qml0czsgbCsrICkge1xyXG4gIGJpdG1hc2tBbGwgfD0gc3VtbWFyeUJpdHNbIGwgXTtcclxufVxyXG5cclxuY2xhc3MgUmVuZGVyZXJTdW1tYXJ5IHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggbm9kZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUgaW5zdGFuY2VvZiBOb2RlICk7XHJcblxyXG4gICAgLy8gTk9URTogYXNzdW1lcyB0aGF0IHdlIGFyZSBjcmVhdGVkIGluIHRoZSBOb2RlIGNvbnN0cnVjdG9yXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlLl9yZW5kZXJlckJpdG1hc2sgPT09IFJlbmRlcmVyLmJpdG1hc2tOb2RlRGVmYXVsdCwgJ05vZGUgbXVzdCBoYXZlIGEgZGVmYXVsdCBiaXRtYXNrIHdoZW4gY3JlYXRpbmcgYSBSZW5kZXJlclN1bW1hcnknICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlLl9jaGlsZHJlbi5sZW5ndGggPT09IDAsICdOb2RlIGNhbm5vdCBoYXZlIGNoaWxkcmVuIHdoZW4gY3JlYXRpbmcgYSBSZW5kZXJlclN1bW1hcnknICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge05vZGV9XHJcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtPYmplY3R9IE1hcHMgc3RyaW5naWZpZWQgYml0bWFzayBiaXQgKGUuZy4gXCIxXCIgZm9yIENhbnZhcywgc2luY2UgUmVuZGVyZXIuYml0bWFza0NhbnZhcyBpcyAweDAxKSB0b1xyXG4gICAgLy8gYSBjb3VudCBvZiBob3cgbWFueSBjaGlsZHJlbiAob3Igc2VsZikgaGF2ZSB0aGF0IHByb3BlcnR5IChlLmcuIGNhbid0IHJlbmRlcmVyIGFsbCBvZiB0aGVpciBjb250ZW50cyB3aXRoIENhbnZhcylcclxuICAgIHRoaXMuX2NvdW50cyA9IHt9O1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtU3VtbWFyeUJpdHM7IGkrKyApIHtcclxuICAgICAgdGhpcy5fY291bnRzWyBzdW1tYXJ5Qml0c1sgaSBdIF0gPSAwOyAvLyBzZXQgZXZlcnl0aGluZyB0byAwIGF0IGZpcnN0XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgIHRoaXMuYml0bWFzayA9IGJpdG1hc2tBbGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn1cclxuICAgIHRoaXMuc2VsZkJpdG1hc2sgPSBSZW5kZXJlclN1bW1hcnkuc3VtbWFyeUJpdG1hc2tGb3JOb2RlU2VsZiggbm9kZSApO1xyXG5cclxuICAgIHRoaXMuc3VtbWFyeUNoYW5nZSggdGhpcy5iaXRtYXNrLCB0aGlzLnNlbGZCaXRtYXNrICk7XHJcblxyXG4gICAgLy8gcmVxdWlyZWQgbGlzdGVuZXJzIHRvIHVwZGF0ZSBvdXIgc3VtbWFyeSBiYXNlZCBvbiBwYWludGVkL25vbi1wYWludGVkIGluZm9ybWF0aW9uXHJcbiAgICBjb25zdCBsaXN0ZW5lciA9IHRoaXMuc2VsZkNoYW5nZS5iaW5kKCB0aGlzICk7XHJcbiAgICB0aGlzLm5vZGUuZmlsdGVyQ2hhbmdlRW1pdHRlci5hZGRMaXN0ZW5lciggbGlzdGVuZXIgKTtcclxuICAgIHRoaXMubm9kZS5jbGlwQXJlYVByb3BlcnR5LmxhenlMaW5rKCBsaXN0ZW5lciApO1xyXG4gICAgdGhpcy5ub2RlLnJlbmRlcmVyU3VtbWFyeVJlZnJlc2hFbWl0dGVyLmFkZExpc3RlbmVyKCBsaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXNlIGEgYml0bWFzayBvZiBhbGwgMXMgdG8gcmVwcmVzZW50ICdkb2VzIG5vdCBleGlzdCcgc2luY2Ugd2UgY291bnQgemVyb3NcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gb2xkQml0bWFza1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuZXdCaXRtYXNrXHJcbiAgICovXHJcbiAgc3VtbWFyeUNoYW5nZSggb2xkQml0bWFzaywgbmV3Qml0bWFzayApIHtcclxuICAgIGFzc2VydCAmJiB0aGlzLmF1ZGl0KCk7XHJcblxyXG4gICAgY29uc3QgY2hhbmdlQml0bWFzayA9IG9sZEJpdG1hc2sgXiBuZXdCaXRtYXNrOyAvLyBiaXQgc2V0IG9ubHkgaWYgaXQgY2hhbmdlZFxyXG5cclxuICAgIGxldCBhbmNlc3Rvck9sZE1hc2sgPSAwO1xyXG4gICAgbGV0IGFuY2VzdG9yTmV3TWFzayA9IDA7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1TdW1tYXJ5Qml0czsgaSsrICkge1xyXG4gICAgICBjb25zdCBiaXQgPSBzdW1tYXJ5Qml0c1sgaSBdO1xyXG5cclxuICAgICAgLy8gSWYgdGhlIGJpdCBmb3IgdGhlIHJlbmRlcmVyIGhhcyBjaGFuZ2VkXHJcbiAgICAgIGlmICggYml0ICYgY2hhbmdlQml0bWFzayApIHtcclxuXHJcbiAgICAgICAgLy8gSWYgaXQgaXMgbm93IHNldCAod2Fzbid0IGJlZm9yZSksIGdhaW5lZCBzdXBwb3J0IGZvciB0aGUgcmVuZGVyZXJcclxuICAgICAgICBpZiAoIGJpdCAmIG5ld0JpdG1hc2sgKSB7XHJcbiAgICAgICAgICB0aGlzLl9jb3VudHNbIGJpdCBdLS07IC8vIHJlZHVjZSBjb3VudCwgc2luY2Ugd2UgY291bnQgdGhlIG51bWJlciBvZiAwcyAodW5zdXBwb3J0ZWQpXHJcbiAgICAgICAgICBpZiAoIHRoaXMuX2NvdW50c1sgYml0IF0gPT09IDAgKSB7XHJcbiAgICAgICAgICAgIGFuY2VzdG9yTmV3TWFzayB8PSBiaXQ7IC8vIGFkZCBvdXIgYml0IHRvIHRoZSBcIm5ld1wiIG1hc2sgd2Ugd2lsbCBzZW5kIHRvIGFuY2VzdG9yc1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBJdCB3YXMgc2V0IGJlZm9yZSAobm93IGlzbid0KSwgbG9zdCBzdXBwb3J0IGZvciB0aGUgcmVuZGVyZXJcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuX2NvdW50c1sgYml0IF0rKzsgLy8gaW5jcmVtZW50IHRoZSBjb3VudCwgc2luY2Ugd2UgY291bnQgdGhlIG51bWJlciBvZiAwcyAodW5zdXBwb3J0ZWQpXHJcbiAgICAgICAgICBpZiAoIHRoaXMuX2NvdW50c1sgYml0IF0gPT09IDEgKSB7XHJcbiAgICAgICAgICAgIGFuY2VzdG9yT2xkTWFzayB8PSBiaXQ7IC8vIGFkZCBvdXIgYml0IHRvIHRoZSBcIm9sZFwiIG1hc2sgd2Ugd2lsbCBzZW5kIHRvIGFuY2VzdG9yc1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICggYW5jZXN0b3JPbGRNYXNrIHx8IGFuY2VzdG9yTmV3TWFzayApIHtcclxuXHJcbiAgICAgIGNvbnN0IG9sZFN1YnRyZWVCaXRtYXNrID0gdGhpcy5iaXRtYXNrO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvbGRTdWJ0cmVlQml0bWFzayAhPT0gdW5kZWZpbmVkICk7XHJcblxyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBudW1TdW1tYXJ5Qml0czsgaisrICkge1xyXG4gICAgICAgIGNvbnN0IGFuY2VzdG9yQml0ID0gc3VtbWFyeUJpdHNbIGogXTtcclxuICAgICAgICAvLyBDaGVjayBmb3IgYWRkZWQgYml0c1xyXG4gICAgICAgIGlmICggYW5jZXN0b3JOZXdNYXNrICYgYW5jZXN0b3JCaXQgKSB7XHJcbiAgICAgICAgICB0aGlzLmJpdG1hc2sgfD0gYW5jZXN0b3JCaXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDaGVjayBmb3IgcmVtb3ZlZCBiaXRzXHJcbiAgICAgICAgaWYgKCBhbmNlc3Rvck9sZE1hc2sgJiBhbmNlc3RvckJpdCApIHtcclxuICAgICAgICAgIHRoaXMuYml0bWFzayBePSBhbmNlc3RvckJpdDtcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICEoIHRoaXMuYml0bWFzayAmIGFuY2VzdG9yQml0ICksXHJcbiAgICAgICAgICAgICdTaG91bGQgYmUgY2xlYXJlZCwgZG9pbmcgY2hlYXBlciBYT1IgYXNzdW1pbmcgaXQgYWxyZWFkeSB3YXMgc2V0JyApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5ub2RlLmluc3RhbmNlUmVmcmVzaEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICB0aGlzLm5vZGUub25TdW1tYXJ5Q2hhbmdlKCBvbGRTdWJ0cmVlQml0bWFzaywgdGhpcy5iaXRtYXNrICk7XHJcblxyXG4gICAgICBjb25zdCBsZW4gPSB0aGlzLm5vZGUuX3BhcmVudHMubGVuZ3RoO1xyXG4gICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCBsZW47IGsrKyApIHtcclxuICAgICAgICB0aGlzLm5vZGUuX3BhcmVudHNbIGsgXS5fcmVuZGVyZXJTdW1tYXJ5LnN1bW1hcnlDaGFuZ2UoIGFuY2VzdG9yT2xkTWFzaywgYW5jZXN0b3JOZXdNYXNrICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYml0bWFzayA9PT0gdGhpcy5jb21wdXRlQml0bWFzaygpLCAnU2FuaXR5IGNoZWNrJyApO1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydCAmJiB0aGlzLmF1ZGl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2VsZkNoYW5nZSgpIHtcclxuICAgIGNvbnN0IG9sZEJpdG1hc2sgPSB0aGlzLnNlbGZCaXRtYXNrO1xyXG4gICAgY29uc3QgbmV3Qml0bWFzayA9IFJlbmRlcmVyU3VtbWFyeS5zdW1tYXJ5Qml0bWFza0Zvck5vZGVTZWxmKCB0aGlzLm5vZGUgKTtcclxuICAgIGlmICggb2xkQml0bWFzayAhPT0gbmV3Qml0bWFzayApIHtcclxuICAgICAgdGhpcy5zdW1tYXJ5Q2hhbmdlKCBvbGRCaXRtYXNrLCBuZXdCaXRtYXNrICk7XHJcbiAgICAgIHRoaXMuc2VsZkJpdG1hc2sgPSBuZXdCaXRtYXNrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgY29tcHV0ZUJpdG1hc2soKSB7XHJcbiAgICBsZXQgYml0bWFzayA9IDA7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1TdW1tYXJ5Qml0czsgaSsrICkge1xyXG4gICAgICBpZiAoIHRoaXMuX2NvdW50c1sgc3VtbWFyeUJpdHNbIGkgXSBdID09PSAwICkge1xyXG4gICAgICAgIGJpdG1hc2sgfD0gc3VtbWFyeUJpdHNbIGkgXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJpdG1hc2s7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogSXMgdGhlIHJlbmRlcmVyIGNvbXBhdGlibGUgd2l0aCBldmVyeSBzaW5nbGUgcGFpbnRlZCBub2RlIHVuZGVyIHRoaXMgc3VidHJlZT9cclxuICAgKiAoQ2FuIHRoaXMgZW50aXJlIHN1Yi10cmVlIGJlIHJlbmRlcmVkIHdpdGgganVzdCB0aGlzIHJlbmRlcmVyKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyIC0gU2luZ2xlIGJpdCBwcmVmZXJyZWQuIElmIG11bHRpcGxlIGJpdHMgc2V0LCByZXF1aXJlcyBBTEwgcGFpbnRlZCBub2RlcyBhcmUgY29tcGF0aWJsZVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggQUxMIG9mIHRoZSBiaXRzLlxyXG4gICAqL1xyXG4gIGlzU3VidHJlZUZ1bGx5Q29tcGF0aWJsZSggcmVuZGVyZXIgKSB7XHJcbiAgICByZXR1cm4gISEoIHJlbmRlcmVyICYgdGhpcy5iaXRtYXNrICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogSXMgdGhlIHJlbmRlcmVyIGNvbXBhdGlibGUgd2l0aCBhdCBsZWFzdCBvbmUgcGFpbnRlZCBub2RlIHVuZGVyIHRoaXMgc3VidHJlZT9cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlciAtIFNpbmdsZSBiaXQgcHJlZmVycmVkLiBJZiBtdWx0aXBsZSBiaXRzIHNldCwgd2lsbCByZXR1cm4gaWYgYSBzaW5nbGUgcGFpbnRlZCBub2RlIGlzXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGF0aWJsZSB3aXRoIGF0IGxlYXN0IG9uZSBvZiB0aGUgYml0cy5cclxuICAgKi9cclxuICBpc1N1YnRyZWVDb250YWluaW5nQ29tcGF0aWJsZSggcmVuZGVyZXIgKSB7XHJcbiAgICByZXR1cm4gISggKCByZW5kZXJlciA8PCBSZW5kZXJlci5iaXRtYXNrTGFja3NTaGlmdCApICYgdGhpcy5iaXRtYXNrICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc1NpbmdsZUNhbnZhc1N1cHBvcnRlZCgpIHtcclxuICAgIHJldHVybiAhISggUmVuZGVyZXIuYml0bWFza1NpbmdsZUNhbnZhcyAmIHRoaXMuYml0bWFzayApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNTaW5nbGVTVkdTdXBwb3J0ZWQoKSB7XHJcbiAgICByZXR1cm4gISEoIFJlbmRlcmVyLmJpdG1hc2tTaW5nbGVTVkcgJiB0aGlzLmJpdG1hc2sgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzTm90UGFpbnRlZCgpIHtcclxuICAgIHJldHVybiAhISggUmVuZGVyZXIuYml0bWFza05vdFBhaW50ZWQgJiB0aGlzLmJpdG1hc2sgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGhhc05vUERPTSgpIHtcclxuICAgIHJldHVybiAhISggUmVuZGVyZXIuYml0bWFza05vUERPTSAmIHRoaXMuYml0bWFzayApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgYXJlQm91bmRzVmFsaWQoKSB7XHJcbiAgICByZXR1cm4gISEoIFJlbmRlcmVyLmJpdG1hc2tCb3VuZHNWYWxpZCAmIHRoaXMuYml0bWFzayApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2l2ZW4gYSBiaXRtYXNrIHJlcHJlc2VudGluZyBhIGxpc3Qgb2Ygb3JkZXJlZCBwcmVmZXJyZWQgcmVuZGVyZXJzLCB3ZSBjaGVjayB0byBzZWUgaWYgYWxsIG9mIG91ciBub2RlcyBjYW4gYmVcclxuICAgKiBkaXNwbGF5ZWQgaW4gYSBzaW5nbGUgU1ZHIGJsb2NrLCBBTkQgdGhhdCBnaXZlbiB0aGUgcHJlZmVycmVkIHJlbmRlcmVycywgdGhhdCBpdCB3aWxsIGFjdHVhbGx5IGhhcHBlbiBpbiBvdXJcclxuICAgKiByZW5kZXJpbmcgcHJvY2Vzcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcHJlZmVycmVkUmVuZGVyZXJzXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNTdWJ0cmVlUmVuZGVyZWRFeGNsdXNpdmVseVNWRyggcHJlZmVycmVkUmVuZGVyZXJzICkge1xyXG4gICAgLy8gQ2hlY2sgaWYgd2UgaGF2ZSBhbnl0aGluZyB0aGF0IHdvdWxkIFBSRVZFTlQgdXMgZnJvbSBoYXZpbmcgYSBzaW5nbGUgU1ZHIGJsb2NrXHJcbiAgICBpZiAoICF0aGlzLmlzU2luZ2xlU1ZHU3VwcG9ydGVkKCkgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBmb3IgYW55IHJlbmRlcmVyIHByZWZlcmVuY2VzIHRoYXQgd291bGQgQ0FVU0UgdXMgdG8gY2hvb3NlIG5vdCB0byBkaXNwbGF5IHdpdGggYSBzaW5nbGUgU1ZHIGJsb2NrXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBSZW5kZXJlci5udW1BY3RpdmVSZW5kZXJlcnM7IGkrKyApIHtcclxuICAgICAgLy8gR3JhYiB0aGUgbmV4dC1tb3N0IHByZWZlcnJlZCByZW5kZXJlclxyXG4gICAgICBjb25zdCByZW5kZXJlciA9IFJlbmRlcmVyLmJpdG1hc2tPcmRlciggcHJlZmVycmVkUmVuZGVyZXJzLCBpICk7XHJcblxyXG4gICAgICAvLyBJZiBpdCdzIFNWRywgY29uZ3JhdHMhIEV2ZXJ5dGhpbmcgd2lsbCByZW5kZXIgaW4gU1ZHIChzaW5jZSBTVkcgaXMgc3VwcG9ydGVkLCBhcyBub3RlZCBhYm92ZSlcclxuICAgICAgaWYgKCBSZW5kZXJlci5iaXRtYXNrU1ZHICYgcmVuZGVyZXIgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNpbmNlIGl0J3Mgbm90IFNWRywgaWYgdGhlcmUncyBhIHNpbmdsZSBwYWludGVkIG5vZGUgdGhhdCBzdXBwb3J0cyB0aGlzIHJlbmRlcmVyICh3aGljaCBpcyBwcmVmZXJyZWQgb3ZlciBTVkcpLFxyXG4gICAgICAvLyB0aGVuIGl0IHdpbGwgYmUgcmVuZGVyZWQgd2l0aCB0aGlzIHJlbmRlcmVyLCBOT1QgU1ZHLlxyXG4gICAgICBpZiAoIHRoaXMuaXNTdWJ0cmVlQ29udGFpbmluZ0NvbXBhdGlibGUoIHJlbmRlcmVyICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlOyAvLyBzYW5pdHkgY2hlY2tcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIGEgYml0bWFzayByZXByZXNlbnRpbmcgYSBsaXN0IG9mIG9yZGVyZWQgcHJlZmVycmVkIHJlbmRlcmVycywgd2UgY2hlY2sgdG8gc2VlIGlmIGFsbCBvZiBvdXIgbm9kZXMgY2FuIGJlXHJcbiAgICogZGlzcGxheWVkIGluIGEgc2luZ2xlIENhbnZhcyBibG9jaywgQU5EIHRoYXQgZ2l2ZW4gdGhlIHByZWZlcnJlZCByZW5kZXJlcnMsIHRoYXQgaXQgd2lsbCBhY3R1YWxseSBoYXBwZW4gaW4gb3VyXHJcbiAgICogcmVuZGVyaW5nIHByb2Nlc3MuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHByZWZlcnJlZFJlbmRlcmVyc1xyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzU3VidHJlZVJlbmRlcmVkRXhjbHVzaXZlbHlDYW52YXMoIHByZWZlcnJlZFJlbmRlcmVycyApIHtcclxuICAgIC8vIENoZWNrIGlmIHdlIGhhdmUgYW55dGhpbmcgdGhhdCB3b3VsZCBQUkVWRU5UIHVzIGZyb20gaGF2aW5nIGEgc2luZ2xlIENhbnZhcyBibG9ja1xyXG4gICAgaWYgKCAhdGhpcy5pc1NpbmdsZUNhbnZhc1N1cHBvcnRlZCgpICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIGFueSByZW5kZXJlciBwcmVmZXJlbmNlcyB0aGF0IHdvdWxkIENBVVNFIHVzIHRvIGNob29zZSBub3QgdG8gZGlzcGxheSB3aXRoIGEgc2luZ2xlIENhbnZhcyBibG9ja1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgUmVuZGVyZXIubnVtQWN0aXZlUmVuZGVyZXJzOyBpKysgKSB7XHJcbiAgICAgIC8vIEdyYWIgdGhlIG5leHQtbW9zdCBwcmVmZXJyZWQgcmVuZGVyZXJcclxuICAgICAgY29uc3QgcmVuZGVyZXIgPSBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIHByZWZlcnJlZFJlbmRlcmVycywgaSApO1xyXG5cclxuICAgICAgLy8gSWYgaXQncyBDYW52YXMsIGNvbmdyYXRzISBFdmVyeXRoaW5nIHdpbGwgcmVuZGVyIGluIENhbnZhcyAoc2luY2UgQ2FudmFzIGlzIHN1cHBvcnRlZCwgYXMgbm90ZWQgYWJvdmUpXHJcbiAgICAgIGlmICggUmVuZGVyZXIuYml0bWFza0NhbnZhcyAmIHJlbmRlcmVyICkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTaW5jZSBpdCdzIG5vdCBDYW52YXMsIGlmIHRoZXJlJ3MgYSBzaW5nbGUgcGFpbnRlZCBub2RlIHRoYXQgc3VwcG9ydHMgdGhpcyByZW5kZXJlciAod2hpY2ggaXMgcHJlZmVycmVkIG92ZXIgQ2FudmFzKSxcclxuICAgICAgLy8gdGhlbiBpdCB3aWxsIGJlIHJlbmRlcmVkIHdpdGggdGhpcyByZW5kZXJlciwgTk9UIENhbnZhcy5cclxuICAgICAgaWYgKCB0aGlzLmlzU3VidHJlZUNvbnRhaW5pbmdDb21wYXRpYmxlKCByZW5kZXJlciApICkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTsgLy8gc2FuaXR5IGNoZWNrXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGb3IgZGVidWdnaW5nIHB1cnBvc2VzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGF1ZGl0KCkge1xyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bVN1bW1hcnlCaXRzOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgYml0ID0gc3VtbWFyeUJpdHNbIGkgXTtcclxuICAgICAgICBjb25zdCBjb3VudElzWmVybyA9IHRoaXMuX2NvdW50c1sgYml0IF0gPT09IDA7XHJcbiAgICAgICAgY29uc3QgYml0bWFza0NvbnRhaW5zQml0ID0gISEoIHRoaXMuYml0bWFzayAmIGJpdCApO1xyXG4gICAgICAgIGFzc2VydCggY291bnRJc1plcm8gPT09IGJpdG1hc2tDb250YWluc0JpdCwgJ0JpdHMgc2hvdWxkIGJlIHNldCBpZiBjb3VudCBpcyB6ZXJvJyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIGZvcm0gb2YgdGhpcyBvYmplY3RcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHRvU3RyaW5nKCkge1xyXG4gICAgbGV0IHJlc3VsdCA9IFJlbmRlcmVyU3VtbWFyeS5iaXRtYXNrVG9TdHJpbmcoIHRoaXMuYml0bWFzayApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtU3VtbWFyeUJpdHM7IGkrKyApIHtcclxuICAgICAgY29uc3QgYml0ID0gc3VtbWFyeUJpdHNbIGkgXTtcclxuICAgICAgY29uc3QgY291bnRGb3JCaXQgPSB0aGlzLl9jb3VudHNbIGJpdCBdO1xyXG4gICAgICBpZiAoIGNvdW50Rm9yQml0ICE9PSAwICkge1xyXG4gICAgICAgIHJlc3VsdCArPSBgICR7UmVuZGVyZXJTdW1tYXJ5LmJpdFRvU3RyaW5nKCBiaXQgKX06JHtjb3VudEZvckJpdH1gO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyB3aGljaCBvZiB0aGUgc3VtbWFyeSBiaXRzIGNhbiBiZSBzZXQgZm9yIGEgc3BlY2lmaWMgTm9kZSAoaWdub3JpbmcgY2hpbGRyZW4vYW5jZXN0b3JzKS5cclxuICAgKiBGb3IgaW5zdGFuY2UsIGZvciBiaXRtYXNrU2luZ2xlU1ZHLCB3ZSBvbmx5IGRvbid0IGluY2x1ZGUgdGhlIGZsYWcgaWYgVEhJUyBub2RlIHByZXZlbnRzIGl0cyB1c2FnZVxyXG4gICAqIChldmVuIHRob3VnaCBjaGlsZCBub2RlcyBtYXkgcHJldmVudCBpdCBpbiB0aGUgcmVuZGVyZXIgc3VtbWFyeSBpdHNlbGYpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBzdW1tYXJ5Qml0bWFza0Zvck5vZGVTZWxmKCBub2RlICkge1xyXG4gICAgbGV0IGJpdG1hc2sgPSBub2RlLl9yZW5kZXJlckJpdG1hc2s7XHJcblxyXG4gICAgaWYgKCBub2RlLmlzUGFpbnRlZCgpICkge1xyXG4gICAgICBiaXRtYXNrIHw9ICggKCBub2RlLl9yZW5kZXJlckJpdG1hc2sgJiBSZW5kZXJlci5iaXRtYXNrQ3VycmVudFJlbmRlcmVyQXJlYSApIF4gUmVuZGVyZXIuYml0bWFza0N1cnJlbnRSZW5kZXJlckFyZWEgKSA8PCBSZW5kZXJlci5iaXRtYXNrTGFja3NTaGlmdDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBiaXRtYXNrIHw9IFJlbmRlcmVyLmJpdG1hc2tDdXJyZW50UmVuZGVyZXJBcmVhIDw8IFJlbmRlcmVyLmJpdG1hc2tMYWNrc1NoaWZ0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE5PVEU6IElmIGNoYW5naW5nLCBzZWUgSW5zdGFuY2UudXBkYXRlUmVuZGVyaW5nU3RhdGVcclxuICAgIGNvbnN0IHJlcXVpcmVzU3BsaXQgPSBub2RlLl9oaW50cy5jc3NUcmFuc2Zvcm0gfHwgbm9kZS5faGludHMubGF5ZXJTcGxpdDtcclxuICAgIGNvbnN0IHJlbmRlcmVySGludCA9IG5vZGUuX2hpbnRzLnJlbmRlcmVyO1xyXG5cclxuICAgIC8vIFdoZXRoZXIgdGhpcyBzdWJ0cmVlIHdpbGwgYmUgYWJsZSB0byBzdXBwb3J0IGEgc2luZ2xlIFNWRyBlbGVtZW50XHJcbiAgICAvLyBOT1RFOiBJZiBjaGFuZ2luZywgc2VlIEluc3RhbmNlLnVwZGF0ZVJlbmRlcmluZ1N0YXRlXHJcbiAgICBpZiAoICFyZXF1aXJlc1NwbGl0ICYmIC8vIENhbid0IGhhdmUgYSBzaW5nbGUgU1ZHIGVsZW1lbnQgaWYgd2UgYXJlIHNwbGl0XHJcbiAgICAgICAgIFJlbmRlcmVyLmlzU1ZHKCBub2RlLl9yZW5kZXJlckJpdG1hc2sgKSAmJiAvLyBJZiBvdXIgbm9kZSBkb2Vzbid0IHN1cHBvcnQgU1ZHLCBjYW4ndCBkbyBpdFxyXG4gICAgICAgICAoICFyZW5kZXJlckhpbnQgfHwgUmVuZGVyZXIuaXNTVkcoIHJlbmRlcmVySGludCApICkgKSB7IC8vIENhbid0IGlmIGEgcmVuZGVyZXIgaGludCBpcyBzZXQgdG8gc29tZXRoaW5nIGVsc2VcclxuICAgICAgYml0bWFzayB8PSBSZW5kZXJlci5iaXRtYXNrU2luZ2xlU1ZHO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdoZXRoZXIgdGhpcyBzdWJ0cmVlIHdpbGwgYmUgYWJsZSB0byBzdXBwb3J0IGEgc2luZ2xlIENhbnZhcyBlbGVtZW50XHJcbiAgICAvLyBOT1RFOiBJZiBjaGFuZ2luZywgc2VlIEluc3RhbmNlLnVwZGF0ZVJlbmRlcmluZ1N0YXRlXHJcbiAgICBpZiAoICFyZXF1aXJlc1NwbGl0ICYmIC8vIENhbid0IGhhdmUgYSBzaW5nbGUgU1ZHIGVsZW1lbnQgaWYgd2UgYXJlIHNwbGl0XHJcbiAgICAgICAgIFJlbmRlcmVyLmlzQ2FudmFzKCBub2RlLl9yZW5kZXJlckJpdG1hc2sgKSAmJiAvLyBJZiBvdXIgbm9kZSBkb2Vzbid0IHN1cHBvcnQgQ2FudmFzLCBjYW4ndCBkbyBpdFxyXG4gICAgICAgICAoICFyZW5kZXJlckhpbnQgfHwgUmVuZGVyZXIuaXNDYW52YXMoIHJlbmRlcmVySGludCApICkgKSB7IC8vIENhbid0IGlmIGEgcmVuZGVyZXIgaGludCBpcyBzZXQgdG8gc29tZXRoaW5nIGVsc2VcclxuICAgICAgYml0bWFzayB8PSBSZW5kZXJlci5iaXRtYXNrU2luZ2xlQ2FudmFzO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggIW5vZGUuaXNQYWludGVkKCkgKSB7XHJcbiAgICAgIGJpdG1hc2sgfD0gUmVuZGVyZXIuYml0bWFza05vdFBhaW50ZWQ7XHJcbiAgICB9XHJcbiAgICBpZiAoIG5vZGUuYXJlU2VsZkJvdW5kc1ZhbGlkKCkgKSB7XHJcbiAgICAgIGJpdG1hc2sgfD0gUmVuZGVyZXIuYml0bWFza0JvdW5kc1ZhbGlkO1xyXG4gICAgfVxyXG4gICAgaWYgKCAhbm9kZS5oYXNQRE9NQ29udGVudCAmJiAhbm9kZS5oYXNQRE9NT3JkZXIoKSApIHtcclxuICAgICAgYml0bWFzayB8PSBSZW5kZXJlci5iaXRtYXNrTm9QRE9NO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBiaXRtYXNrO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRm9yIGRlYnVnZ2luZyBwdXJwb3Nlc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiaXRcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBiaXRUb1N0cmluZyggYml0ICkge1xyXG4gICAgaWYgKCBiaXQgPT09IFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKSB7IHJldHVybiAnQ2FudmFzJzsgfVxyXG4gICAgaWYgKCBiaXQgPT09IFJlbmRlcmVyLmJpdG1hc2tTVkcgKSB7IHJldHVybiAnU1ZHJzsgfVxyXG4gICAgaWYgKCBiaXQgPT09IFJlbmRlcmVyLmJpdG1hc2tET00gKSB7IHJldHVybiAnRE9NJzsgfVxyXG4gICAgaWYgKCBiaXQgPT09IFJlbmRlcmVyLmJpdG1hc2tXZWJHTCApIHsgcmV0dXJuICdXZWJHTCc7IH1cclxuICAgIGlmICggYml0ID09PSBSZW5kZXJlci5iaXRtYXNrTGFja3NDYW52YXMgKSB7IHJldHVybiAnKC1DYW52YXMpJzsgfVxyXG4gICAgaWYgKCBiaXQgPT09IFJlbmRlcmVyLmJpdG1hc2tMYWNrc1NWRyApIHsgcmV0dXJuICcoLVNWRyknOyB9XHJcbiAgICBpZiAoIGJpdCA9PT0gUmVuZGVyZXIuYml0bWFza0xhY2tzRE9NICkgeyByZXR1cm4gJygtRE9NKSc7IH1cclxuICAgIGlmICggYml0ID09PSBSZW5kZXJlci5iaXRtYXNrTGFja3NXZWJHTCApIHsgcmV0dXJuICcoLVdlYkdMKSc7IH1cclxuICAgIGlmICggYml0ID09PSBSZW5kZXJlci5iaXRtYXNrU2luZ2xlQ2FudmFzICkgeyByZXR1cm4gJ1NpbmdsZUNhbnZhcyc7IH1cclxuICAgIGlmICggYml0ID09PSBSZW5kZXJlci5iaXRtYXNrU2luZ2xlU1ZHICkgeyByZXR1cm4gJ1NpbmdsZVNWRyc7IH1cclxuICAgIGlmICggYml0ID09PSBSZW5kZXJlci5iaXRtYXNrTm90UGFpbnRlZCApIHsgcmV0dXJuICdOb3RQYWludGVkJzsgfVxyXG4gICAgaWYgKCBiaXQgPT09IFJlbmRlcmVyLmJpdG1hc2tCb3VuZHNWYWxpZCApIHsgcmV0dXJuICdCb3VuZHNWYWxpZCc7IH1cclxuICAgIGlmICggYml0ID09PSBSZW5kZXJlci5iaXRtYXNrTm9QRE9NICkgeyByZXR1cm4gJ05vdEFjY2Vzc2libGUnOyB9XHJcbiAgICByZXR1cm4gJz8nO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRm9yIGRlYnVnZ2luZyBwdXJwb3Nlc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiaXRtYXNrXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBzdGF0aWMgYml0bWFza1RvU3RyaW5nKCBiaXRtYXNrICkge1xyXG4gICAgbGV0IHJlc3VsdCA9ICcnO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtU3VtbWFyeUJpdHM7IGkrKyApIHtcclxuICAgICAgY29uc3QgYml0ID0gc3VtbWFyeUJpdHNbIGkgXTtcclxuICAgICAgaWYgKCBiaXRtYXNrICYgYml0ICkge1xyXG4gICAgICAgIHJlc3VsdCArPSBgJHtSZW5kZXJlclN1bW1hcnkuYml0VG9TdHJpbmcoIGJpdCApfSBgO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxufVxyXG5cclxuLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG5SZW5kZXJlclN1bW1hcnkuYml0bWFza0FsbCA9IGJpdG1hc2tBbGw7XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUmVuZGVyZXJTdW1tYXJ5JywgUmVuZGVyZXJTdW1tYXJ5ICk7XHJcbmV4cG9ydCBkZWZhdWx0IFJlbmRlcmVyU3VtbWFyeTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsSUFBSSxFQUFFQyxRQUFRLEVBQUVDLE9BQU8sUUFB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