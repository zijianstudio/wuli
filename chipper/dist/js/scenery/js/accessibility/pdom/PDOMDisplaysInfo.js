// Copyright 2018-2022, University of Colorado Boulder

/**
 * Per-node information required to track what PDOM Displays our Node is visible under. A PDOM display is a Display that
 * is marked true with the `accessibility` option, and thus creates and manages a ParallelDOM (see ParallelDOM and
 * general scenery accessibility doc for more details). Acts like a multimap
 * (duplicates allowed) to indicate how many times we appear in an pdom display.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Renderer, scenery } from '../../imports.js';
export default class PDOMDisplaysInfo {
  // (duplicates allowed) - There is one copy of each pdom
  // Display for each trail (from its root node to this node) that is fully visible (assuming this subtree has
  // pdom content).
  // Thus, the value of this is:
  // - If this node is invisible OR the subtree has no pdomContent/pdomOrder: []
  // - Otherwise, it is the concatenation of our parents' pdomDisplays (AND any pdom displays rooted
  //   at this node).
  // This value is synchronously updated, and supports pdomInstances by letting them know when certain
  // nodes are visible on the display.
  /**
   * Tracks pdom display information for our given node.
   * (scenery-internal)
   */
  constructor(node) {
    this.node = node;
    this.pdomDisplays = [];
  }

  /**
   * Called when the node is added as a child to this node AND the node's subtree contains pdom content. (scenery-internal)
   */
  onAddChild(node) {
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`onAddChild n#${node.id} (parent:n#${this.node.id})`);
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
    if (node._pdomDisplaysInfo.canHavePDOMDisplays()) {
      node._pdomDisplaysInfo.addPDOMDisplays(this.pdomDisplays);
    }
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
  }

  /**
   * Called when the node is removed as a child from this node AND the node's subtree contains pdom content. (scenery-internal)
   */
  onRemoveChild(node) {
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`onRemoveChild n#${node.id} (parent:n#${this.node.id})`);
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
    if (node._pdomDisplaysInfo.canHavePDOMDisplays()) {
      node._pdomDisplaysInfo.removePDOMDisplays(this.pdomDisplays);
    }
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
  }

  /**
   * Called when our summary bitmask changes (scenery-internal)
   */
  onSummaryChange(oldBitmask, newBitmask) {
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`onSummaryChange n#${this.node.id} wasPDOM:${!(Renderer.bitmaskNoPDOM & oldBitmask)}, isPDOM:${!(Renderer.bitmaskNoPDOM & newBitmask)}`);
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();

    // If we are invisible, our pdomDisplays would not have changed ([] => [])
    if (this.node.visible && this.node.pdomVisible) {
      const hadPDOM = !(Renderer.bitmaskNoPDOM & oldBitmask);
      const hasPDOM = !(Renderer.bitmaskNoPDOM & newBitmask);

      // If we changed to have pdom content, we need to recursively add pdom displays.
      if (hasPDOM && !hadPDOM) {
        this.addAllPDOMDisplays();
      }

      // If we changed to NOT have pdom content, we need to recursively remove pdom displays.
      if (!hasPDOM && hadPDOM) {
        this.removeAllPDOMDisplays();
      }
    }
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
  }

  /**
   * Called when our visibility changes. (scenery-internal)
   */
  onVisibilityChange(visible) {
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`onVisibilityChange n#${this.node.id} visible:${visible}`);
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();

    // If we don't have pdom (or pdomVisible), our pdomDisplays would not have changed ([] => [])
    if (this.node.pdomVisible && !this.node._rendererSummary.hasNoPDOM()) {
      if (visible) {
        this.addAllPDOMDisplays();
      } else {
        this.removeAllPDOMDisplays();
      }
    }
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
  }

  /**
   * Called when our pdomVisibility changes. (scenery-internal)
   */
  onPDOMVisibilityChange(visible) {
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`onPDOMVisibilityChange n#${this.node.id} pdomVisible:${visible}`);
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();

    // If we don't have pdom, our pdomDisplays would not have changed ([] => [])
    if (this.node.visible && !this.node._rendererSummary.hasNoPDOM()) {
      if (visible) {
        this.addAllPDOMDisplays();
      } else {
        this.removeAllPDOMDisplays();
      }
    }
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
  }

  /**
   * Called when we have a rooted display added to this node. (scenery-internal)
   */
  onAddedRootedDisplay(display) {
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`onAddedRootedDisplay n#${this.node.id}`);
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
    if (display._accessible && this.canHavePDOMDisplays()) {
      this.addPDOMDisplays([display]);
    }
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
  }

  /**
   * Called when we have a rooted display removed from this node. (scenery-internal)
   */
  onRemovedRootedDisplay(display) {
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`onRemovedRootedDisplay n#${this.node.id}`);
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
    if (display._accessible && this.canHavePDOMDisplays()) {
      this.removePDOMDisplays([display]);
    }
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
  }

  /**
   * Returns whether we can have pdomDisplays specified in our array. (scenery-internal)
   */
  canHavePDOMDisplays() {
    return this.node.visible && this.node.pdomVisible && !this.node._rendererSummary.hasNoPDOM();
  }

  /**
   * Adds all of our pdom displays to our array (and propagates).
   */
  addAllPDOMDisplays() {
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`addAllPDOMDisplays n#${this.node.id}`);
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
    assert && assert(this.pdomDisplays.length === 0, 'Should be empty before adding everything');
    assert && assert(this.canHavePDOMDisplays(), 'Should happen when we can store pdomDisplays');
    let i;
    const displays = [];

    // Concatenation of our parents' pdomDisplays
    for (i = 0; i < this.node._parents.length; i++) {
      Array.prototype.push.apply(displays, this.node._parents[i]._pdomDisplaysInfo.pdomDisplays);
    }

    // AND any acessible displays rooted at this node
    for (i = 0; i < this.node._rootedDisplays.length; i++) {
      const display = this.node._rootedDisplays[i];
      if (display._accessible) {
        displays.push(display);
      }
    }
    this.addPDOMDisplays(displays);
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
  }

  /**
   * Removes all of our pdom displays from our array (and propagates).
   */
  removeAllPDOMDisplays() {
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`removeAllPDOMDisplays n#${this.node.id}`);
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
    assert && assert(!this.canHavePDOMDisplays(), 'Should happen when we cannot store pdomDisplays');

    // TODO: is there a way to avoid a copy?
    this.removePDOMDisplays(this.pdomDisplays.slice());
    assert && assert(this.pdomDisplays.length === 0, 'Should be empty after removing everything');
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
  }

  /**
   * Adds a list of pdom displays to our internal list. See pdomDisplays documentation.
   */
  addPDOMDisplays(displays) {
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`addPDOMDisplays n#${this.node.id} numDisplays:${displays.length}`);
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
    assert && assert(Array.isArray(displays));

    // Simplifies things if we can stop no-ops here.
    if (displays.length !== 0) {
      Array.prototype.push.apply(this.pdomDisplays, displays);

      // Propagate the change to our children
      for (let i = 0; i < this.node._children.length; i++) {
        const child = this.node._children[i];
        if (child._pdomDisplaysInfo.canHavePDOMDisplays()) {
          this.node._children[i]._pdomDisplaysInfo.addPDOMDisplays(displays);
        }
      }
      this.node.pdomDisplaysEmitter.emit();
    }
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
  }

  /**
   * Removes a list of pdom displays from our internal list. See pdomDisplays documentation.
   */
  removePDOMDisplays(displays) {
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`removePDOMDisplays n#${this.node.id} numDisplays:${displays.length}`);
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
    assert && assert(Array.isArray(displays));
    assert && assert(this.pdomDisplays.length >= displays.length, 'there should be at least as many PDOMDisplays as Displays');

    // Simplifies things if we can stop no-ops here.
    if (displays.length !== 0) {
      let i;
      for (i = displays.length - 1; i >= 0; i--) {
        const index = this.pdomDisplays.lastIndexOf(displays[i]);
        assert && assert(index >= 0);
        this.pdomDisplays.splice(i, 1);
      }

      // Propagate the change to our children
      for (i = 0; i < this.node._children.length; i++) {
        const child = this.node._children[i];
        // NOTE: Since this gets called many times from the RendererSummary (which happens before the actual child
        // modification happens), we DO NOT want to traverse to the child node getting removed. Ideally a better
        // solution than this flag should be found.
        if (child._pdomDisplaysInfo.canHavePDOMDisplays() && !child._isGettingRemovedFromParent) {
          child._pdomDisplaysInfo.removePDOMDisplays(displays);
        }
      }
      this.node.pdomDisplaysEmitter.emit();
    }
    sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
  }
}
scenery.register('PDOMDisplaysInfo', PDOMDisplaysInfo);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZW5kZXJlciIsInNjZW5lcnkiLCJQRE9NRGlzcGxheXNJbmZvIiwiY29uc3RydWN0b3IiLCJub2RlIiwicGRvbURpc3BsYXlzIiwib25BZGRDaGlsZCIsInNjZW5lcnlMb2ciLCJpZCIsInB1c2giLCJfcGRvbURpc3BsYXlzSW5mbyIsImNhbkhhdmVQRE9NRGlzcGxheXMiLCJhZGRQRE9NRGlzcGxheXMiLCJwb3AiLCJvblJlbW92ZUNoaWxkIiwicmVtb3ZlUERPTURpc3BsYXlzIiwib25TdW1tYXJ5Q2hhbmdlIiwib2xkQml0bWFzayIsIm5ld0JpdG1hc2siLCJiaXRtYXNrTm9QRE9NIiwidmlzaWJsZSIsInBkb21WaXNpYmxlIiwiaGFkUERPTSIsImhhc1BET00iLCJhZGRBbGxQRE9NRGlzcGxheXMiLCJyZW1vdmVBbGxQRE9NRGlzcGxheXMiLCJvblZpc2liaWxpdHlDaGFuZ2UiLCJfcmVuZGVyZXJTdW1tYXJ5IiwiaGFzTm9QRE9NIiwib25QRE9NVmlzaWJpbGl0eUNoYW5nZSIsIm9uQWRkZWRSb290ZWREaXNwbGF5IiwiZGlzcGxheSIsIl9hY2Nlc3NpYmxlIiwib25SZW1vdmVkUm9vdGVkRGlzcGxheSIsImFzc2VydCIsImxlbmd0aCIsImkiLCJkaXNwbGF5cyIsIl9wYXJlbnRzIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJhcHBseSIsIl9yb290ZWREaXNwbGF5cyIsInNsaWNlIiwiaXNBcnJheSIsIl9jaGlsZHJlbiIsImNoaWxkIiwicGRvbURpc3BsYXlzRW1pdHRlciIsImVtaXQiLCJpbmRleCIsImxhc3RJbmRleE9mIiwic3BsaWNlIiwiX2lzR2V0dGluZ1JlbW92ZWRGcm9tUGFyZW50IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQRE9NRGlzcGxheXNJbmZvLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBlci1ub2RlIGluZm9ybWF0aW9uIHJlcXVpcmVkIHRvIHRyYWNrIHdoYXQgUERPTSBEaXNwbGF5cyBvdXIgTm9kZSBpcyB2aXNpYmxlIHVuZGVyLiBBIFBET00gZGlzcGxheSBpcyBhIERpc3BsYXkgdGhhdFxyXG4gKiBpcyBtYXJrZWQgdHJ1ZSB3aXRoIHRoZSBgYWNjZXNzaWJpbGl0eWAgb3B0aW9uLCBhbmQgdGh1cyBjcmVhdGVzIGFuZCBtYW5hZ2VzIGEgUGFyYWxsZWxET00gKHNlZSBQYXJhbGxlbERPTSBhbmRcclxuICogZ2VuZXJhbCBzY2VuZXJ5IGFjY2Vzc2liaWxpdHkgZG9jIGZvciBtb3JlIGRldGFpbHMpLiBBY3RzIGxpa2UgYSBtdWx0aW1hcFxyXG4gKiAoZHVwbGljYXRlcyBhbGxvd2VkKSB0byBpbmRpY2F0ZSBob3cgbWFueSB0aW1lcyB3ZSBhcHBlYXIgaW4gYW4gcGRvbSBkaXNwbGF5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgRGlzcGxheSwgTm9kZSwgUmVuZGVyZXIsIHNjZW5lcnkgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBET01EaXNwbGF5c0luZm8ge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IG5vZGU6IE5vZGU7XHJcblxyXG4gIC8vIChkdXBsaWNhdGVzIGFsbG93ZWQpIC0gVGhlcmUgaXMgb25lIGNvcHkgb2YgZWFjaCBwZG9tXHJcbiAgLy8gRGlzcGxheSBmb3IgZWFjaCB0cmFpbCAoZnJvbSBpdHMgcm9vdCBub2RlIHRvIHRoaXMgbm9kZSkgdGhhdCBpcyBmdWxseSB2aXNpYmxlIChhc3N1bWluZyB0aGlzIHN1YnRyZWUgaGFzXHJcbiAgLy8gcGRvbSBjb250ZW50KS5cclxuICAvLyBUaHVzLCB0aGUgdmFsdWUgb2YgdGhpcyBpczpcclxuICAvLyAtIElmIHRoaXMgbm9kZSBpcyBpbnZpc2libGUgT1IgdGhlIHN1YnRyZWUgaGFzIG5vIHBkb21Db250ZW50L3Bkb21PcmRlcjogW11cclxuICAvLyAtIE90aGVyd2lzZSwgaXQgaXMgdGhlIGNvbmNhdGVuYXRpb24gb2Ygb3VyIHBhcmVudHMnIHBkb21EaXNwbGF5cyAoQU5EIGFueSBwZG9tIGRpc3BsYXlzIHJvb3RlZFxyXG4gIC8vICAgYXQgdGhpcyBub2RlKS5cclxuICAvLyBUaGlzIHZhbHVlIGlzIHN5bmNocm9ub3VzbHkgdXBkYXRlZCwgYW5kIHN1cHBvcnRzIHBkb21JbnN0YW5jZXMgYnkgbGV0dGluZyB0aGVtIGtub3cgd2hlbiBjZXJ0YWluXHJcbiAgLy8gbm9kZXMgYXJlIHZpc2libGUgb24gdGhlIGRpc3BsYXkuXHJcbiAgcHVibGljIHJlYWRvbmx5IHBkb21EaXNwbGF5czogRGlzcGxheVtdO1xyXG5cclxuICAvKipcclxuICAgKiBUcmFja3MgcGRvbSBkaXNwbGF5IGluZm9ybWF0aW9uIGZvciBvdXIgZ2l2ZW4gbm9kZS5cclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG5vZGU6IE5vZGUgKSB7XHJcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xyXG4gICAgdGhpcy5wZG9tRGlzcGxheXMgPSBbXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIHRoZSBub2RlIGlzIGFkZGVkIGFzIGEgY2hpbGQgdG8gdGhpcyBub2RlIEFORCB0aGUgbm9kZSdzIHN1YnRyZWUgY29udGFpbnMgcGRvbSBjb250ZW50LiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgb25BZGRDaGlsZCggbm9kZTogTm9kZSApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyggYG9uQWRkQ2hpbGQgbiMke25vZGUuaWR9IChwYXJlbnQ6biMke3RoaXMubm9kZS5pZH0pYCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgaWYgKCBub2RlLl9wZG9tRGlzcGxheXNJbmZvLmNhbkhhdmVQRE9NRGlzcGxheXMoKSApIHtcclxuICAgICAgbm9kZS5fcGRvbURpc3BsYXlzSW5mby5hZGRQRE9NRGlzcGxheXMoIHRoaXMucGRvbURpc3BsYXlzICk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIHRoZSBub2RlIGlzIHJlbW92ZWQgYXMgYSBjaGlsZCBmcm9tIHRoaXMgbm9kZSBBTkQgdGhlIG5vZGUncyBzdWJ0cmVlIGNvbnRhaW5zIHBkb20gY29udGVudC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIG9uUmVtb3ZlQ2hpbGQoIG5vZGU6IE5vZGUgKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8oIGBvblJlbW92ZUNoaWxkIG4jJHtub2RlLmlkfSAocGFyZW50Om4jJHt0aGlzLm5vZGUuaWR9KWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGlmICggbm9kZS5fcGRvbURpc3BsYXlzSW5mby5jYW5IYXZlUERPTURpc3BsYXlzKCkgKSB7XHJcbiAgICAgIG5vZGUuX3Bkb21EaXNwbGF5c0luZm8ucmVtb3ZlUERPTURpc3BsYXlzKCB0aGlzLnBkb21EaXNwbGF5cyApO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBvdXIgc3VtbWFyeSBiaXRtYXNrIGNoYW5nZXMgKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIG9uU3VtbWFyeUNoYW5nZSggb2xkQml0bWFzazogbnVtYmVyLCBuZXdCaXRtYXNrOiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8oIGBvblN1bW1hcnlDaGFuZ2UgbiMke3RoaXMubm9kZS5pZH0gd2FzUERPTTokeyEoIFJlbmRlcmVyLmJpdG1hc2tOb1BET00gJiBvbGRCaXRtYXNrICl9LCBpc1BET006JHshKCBSZW5kZXJlci5iaXRtYXNrTm9QRE9NICYgbmV3Qml0bWFzayApfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIC8vIElmIHdlIGFyZSBpbnZpc2libGUsIG91ciBwZG9tRGlzcGxheXMgd291bGQgbm90IGhhdmUgY2hhbmdlZCAoW10gPT4gW10pXHJcbiAgICBpZiAoIHRoaXMubm9kZS52aXNpYmxlICYmIHRoaXMubm9kZS5wZG9tVmlzaWJsZSApIHtcclxuICAgICAgY29uc3QgaGFkUERPTSA9ICEoIFJlbmRlcmVyLmJpdG1hc2tOb1BET00gJiBvbGRCaXRtYXNrICk7XHJcbiAgICAgIGNvbnN0IGhhc1BET00gPSAhKCBSZW5kZXJlci5iaXRtYXNrTm9QRE9NICYgbmV3Qml0bWFzayApO1xyXG5cclxuICAgICAgLy8gSWYgd2UgY2hhbmdlZCB0byBoYXZlIHBkb20gY29udGVudCwgd2UgbmVlZCB0byByZWN1cnNpdmVseSBhZGQgcGRvbSBkaXNwbGF5cy5cclxuICAgICAgaWYgKCBoYXNQRE9NICYmICFoYWRQRE9NICkge1xyXG4gICAgICAgIHRoaXMuYWRkQWxsUERPTURpc3BsYXlzKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIHdlIGNoYW5nZWQgdG8gTk9UIGhhdmUgcGRvbSBjb250ZW50LCB3ZSBuZWVkIHRvIHJlY3Vyc2l2ZWx5IHJlbW92ZSBwZG9tIGRpc3BsYXlzLlxyXG4gICAgICBpZiAoICFoYXNQRE9NICYmIGhhZFBET00gKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVBbGxQRE9NRGlzcGxheXMoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBvdXIgdmlzaWJpbGl0eSBjaGFuZ2VzLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgb25WaXNpYmlsaXR5Q2hhbmdlKCB2aXNpYmxlOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvKCBgb25WaXNpYmlsaXR5Q2hhbmdlIG4jJHt0aGlzLm5vZGUuaWR9IHZpc2libGU6JHt2aXNpYmxlfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIC8vIElmIHdlIGRvbid0IGhhdmUgcGRvbSAob3IgcGRvbVZpc2libGUpLCBvdXIgcGRvbURpc3BsYXlzIHdvdWxkIG5vdCBoYXZlIGNoYW5nZWQgKFtdID0+IFtdKVxyXG4gICAgaWYgKCB0aGlzLm5vZGUucGRvbVZpc2libGUgJiYgIXRoaXMubm9kZS5fcmVuZGVyZXJTdW1tYXJ5Lmhhc05vUERPTSgpICkge1xyXG4gICAgICBpZiAoIHZpc2libGUgKSB7XHJcbiAgICAgICAgdGhpcy5hZGRBbGxQRE9NRGlzcGxheXMoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUFsbFBET01EaXNwbGF5cygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIG91ciBwZG9tVmlzaWJpbGl0eSBjaGFuZ2VzLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgb25QRE9NVmlzaWJpbGl0eUNoYW5nZSggdmlzaWJsZTogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyggYG9uUERPTVZpc2liaWxpdHlDaGFuZ2UgbiMke3RoaXMubm9kZS5pZH0gcGRvbVZpc2libGU6JHt2aXNpYmxlfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIC8vIElmIHdlIGRvbid0IGhhdmUgcGRvbSwgb3VyIHBkb21EaXNwbGF5cyB3b3VsZCBub3QgaGF2ZSBjaGFuZ2VkIChbXSA9PiBbXSlcclxuICAgIGlmICggdGhpcy5ub2RlLnZpc2libGUgJiYgIXRoaXMubm9kZS5fcmVuZGVyZXJTdW1tYXJ5Lmhhc05vUERPTSgpICkge1xyXG4gICAgICBpZiAoIHZpc2libGUgKSB7XHJcbiAgICAgICAgdGhpcy5hZGRBbGxQRE9NRGlzcGxheXMoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUFsbFBET01EaXNwbGF5cygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIHdlIGhhdmUgYSByb290ZWQgZGlzcGxheSBhZGRlZCB0byB0aGlzIG5vZGUuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBvbkFkZGVkUm9vdGVkRGlzcGxheSggZGlzcGxheTogRGlzcGxheSApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyggYG9uQWRkZWRSb290ZWREaXNwbGF5IG4jJHt0aGlzLm5vZGUuaWR9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgaWYgKCBkaXNwbGF5Ll9hY2Nlc3NpYmxlICYmIHRoaXMuY2FuSGF2ZVBET01EaXNwbGF5cygpICkge1xyXG4gICAgICB0aGlzLmFkZFBET01EaXNwbGF5cyggWyBkaXNwbGF5IF0gKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gd2UgaGF2ZSBhIHJvb3RlZCBkaXNwbGF5IHJlbW92ZWQgZnJvbSB0aGlzIG5vZGUuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBvblJlbW92ZWRSb290ZWREaXNwbGF5KCBkaXNwbGF5OiBEaXNwbGF5ICk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvKCBgb25SZW1vdmVkUm9vdGVkRGlzcGxheSBuIyR7dGhpcy5ub2RlLmlkfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGlmICggZGlzcGxheS5fYWNjZXNzaWJsZSAmJiB0aGlzLmNhbkhhdmVQRE9NRGlzcGxheXMoKSApIHtcclxuICAgICAgdGhpcy5yZW1vdmVQRE9NRGlzcGxheXMoIFsgZGlzcGxheSBdICk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB3ZSBjYW4gaGF2ZSBwZG9tRGlzcGxheXMgc3BlY2lmaWVkIGluIG91ciBhcnJheS4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGNhbkhhdmVQRE9NRGlzcGxheXMoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5ub2RlLnZpc2libGUgJiYgdGhpcy5ub2RlLnBkb21WaXNpYmxlICYmICF0aGlzLm5vZGUuX3JlbmRlcmVyU3VtbWFyeS5oYXNOb1BET00oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYWxsIG9mIG91ciBwZG9tIGRpc3BsYXlzIHRvIG91ciBhcnJheSAoYW5kIHByb3BhZ2F0ZXMpLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYWRkQWxsUERPTURpc3BsYXlzKCk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvKCBgYWRkQWxsUERPTURpc3BsYXlzIG4jJHt0aGlzLm5vZGUuaWR9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wZG9tRGlzcGxheXMubGVuZ3RoID09PSAwLCAnU2hvdWxkIGJlIGVtcHR5IGJlZm9yZSBhZGRpbmcgZXZlcnl0aGluZycgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY2FuSGF2ZVBET01EaXNwbGF5cygpLCAnU2hvdWxkIGhhcHBlbiB3aGVuIHdlIGNhbiBzdG9yZSBwZG9tRGlzcGxheXMnICk7XHJcblxyXG4gICAgbGV0IGk7XHJcbiAgICBjb25zdCBkaXNwbGF5czogRGlzcGxheVtdID0gW107XHJcblxyXG4gICAgLy8gQ29uY2F0ZW5hdGlvbiBvZiBvdXIgcGFyZW50cycgcGRvbURpc3BsYXlzXHJcbiAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMubm9kZS5fcGFyZW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoIGRpc3BsYXlzLCB0aGlzLm5vZGUuX3BhcmVudHNbIGkgXS5fcGRvbURpc3BsYXlzSW5mby5wZG9tRGlzcGxheXMgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBTkQgYW55IGFjZXNzaWJsZSBkaXNwbGF5cyByb290ZWQgYXQgdGhpcyBub2RlXHJcbiAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMubm9kZS5fcm9vdGVkRGlzcGxheXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGRpc3BsYXkgPSB0aGlzLm5vZGUuX3Jvb3RlZERpc3BsYXlzWyBpIF07XHJcbiAgICAgIGlmICggZGlzcGxheS5fYWNjZXNzaWJsZSApIHtcclxuICAgICAgICBkaXNwbGF5cy5wdXNoKCBkaXNwbGF5ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmFkZFBET01EaXNwbGF5cyggZGlzcGxheXMgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhbGwgb2Ygb3VyIHBkb20gZGlzcGxheXMgZnJvbSBvdXIgYXJyYXkgKGFuZCBwcm9wYWdhdGVzKS5cclxuICAgKi9cclxuICBwcml2YXRlIHJlbW92ZUFsbFBET01EaXNwbGF5cygpOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyggYHJlbW92ZUFsbFBET01EaXNwbGF5cyBuIyR7dGhpcy5ub2RlLmlkfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmNhbkhhdmVQRE9NRGlzcGxheXMoKSwgJ1Nob3VsZCBoYXBwZW4gd2hlbiB3ZSBjYW5ub3Qgc3RvcmUgcGRvbURpc3BsYXlzJyApO1xyXG5cclxuICAgIC8vIFRPRE86IGlzIHRoZXJlIGEgd2F5IHRvIGF2b2lkIGEgY29weT9cclxuICAgIHRoaXMucmVtb3ZlUERPTURpc3BsYXlzKCB0aGlzLnBkb21EaXNwbGF5cy5zbGljZSgpICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wZG9tRGlzcGxheXMubGVuZ3RoID09PSAwLCAnU2hvdWxkIGJlIGVtcHR5IGFmdGVyIHJlbW92aW5nIGV2ZXJ5dGhpbmcnICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBsaXN0IG9mIHBkb20gZGlzcGxheXMgdG8gb3VyIGludGVybmFsIGxpc3QuIFNlZSBwZG9tRGlzcGxheXMgZG9jdW1lbnRhdGlvbi5cclxuICAgKi9cclxuICBwcml2YXRlIGFkZFBET01EaXNwbGF5cyggZGlzcGxheXM6IERpc3BsYXlbXSApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyggYGFkZFBET01EaXNwbGF5cyBuIyR7dGhpcy5ub2RlLmlkfSBudW1EaXNwbGF5czoke2Rpc3BsYXlzLmxlbmd0aH1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBkaXNwbGF5cyApICk7XHJcblxyXG4gICAgLy8gU2ltcGxpZmllcyB0aGluZ3MgaWYgd2UgY2FuIHN0b3Agbm8tb3BzIGhlcmUuXHJcbiAgICBpZiAoIGRpc3BsYXlzLmxlbmd0aCAhPT0gMCApIHtcclxuICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoIHRoaXMucGRvbURpc3BsYXlzLCBkaXNwbGF5cyApO1xyXG5cclxuICAgICAgLy8gUHJvcGFnYXRlIHRoZSBjaGFuZ2UgdG8gb3VyIGNoaWxkcmVuXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubm9kZS5fY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLm5vZGUuX2NoaWxkcmVuWyBpIF07XHJcbiAgICAgICAgaWYgKCBjaGlsZC5fcGRvbURpc3BsYXlzSW5mby5jYW5IYXZlUERPTURpc3BsYXlzKCkgKSB7XHJcbiAgICAgICAgICB0aGlzLm5vZGUuX2NoaWxkcmVuWyBpIF0uX3Bkb21EaXNwbGF5c0luZm8uYWRkUERPTURpc3BsYXlzKCBkaXNwbGF5cyApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5ub2RlLnBkb21EaXNwbGF5c0VtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGEgbGlzdCBvZiBwZG9tIGRpc3BsYXlzIGZyb20gb3VyIGludGVybmFsIGxpc3QuIFNlZSBwZG9tRGlzcGxheXMgZG9jdW1lbnRhdGlvbi5cclxuICAgKi9cclxuICBwcml2YXRlIHJlbW92ZVBET01EaXNwbGF5cyggZGlzcGxheXM6IERpc3BsYXlbXSApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyggYHJlbW92ZVBET01EaXNwbGF5cyBuIyR7dGhpcy5ub2RlLmlkfSBudW1EaXNwbGF5czoke2Rpc3BsYXlzLmxlbmd0aH1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBkaXNwbGF5cyApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnBkb21EaXNwbGF5cy5sZW5ndGggPj0gZGlzcGxheXMubGVuZ3RoLCAndGhlcmUgc2hvdWxkIGJlIGF0IGxlYXN0IGFzIG1hbnkgUERPTURpc3BsYXlzIGFzIERpc3BsYXlzJyApO1xyXG5cclxuICAgIC8vIFNpbXBsaWZpZXMgdGhpbmdzIGlmIHdlIGNhbiBzdG9wIG5vLW9wcyBoZXJlLlxyXG4gICAgaWYgKCBkaXNwbGF5cy5sZW5ndGggIT09IDAgKSB7XHJcbiAgICAgIGxldCBpO1xyXG5cclxuICAgICAgZm9yICggaSA9IGRpc3BsYXlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5wZG9tRGlzcGxheXMubGFzdEluZGV4T2YoIGRpc3BsYXlzWyBpIF0gKTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCA+PSAwICk7XHJcbiAgICAgICAgdGhpcy5wZG9tRGlzcGxheXMuc3BsaWNlKCBpLCAxICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFByb3BhZ2F0ZSB0aGUgY2hhbmdlIHRvIG91ciBjaGlsZHJlblxyXG4gICAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMubm9kZS5fY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLm5vZGUuX2NoaWxkcmVuWyBpIF07XHJcbiAgICAgICAgLy8gTk9URTogU2luY2UgdGhpcyBnZXRzIGNhbGxlZCBtYW55IHRpbWVzIGZyb20gdGhlIFJlbmRlcmVyU3VtbWFyeSAod2hpY2ggaGFwcGVucyBiZWZvcmUgdGhlIGFjdHVhbCBjaGlsZFxyXG4gICAgICAgIC8vIG1vZGlmaWNhdGlvbiBoYXBwZW5zKSwgd2UgRE8gTk9UIHdhbnQgdG8gdHJhdmVyc2UgdG8gdGhlIGNoaWxkIG5vZGUgZ2V0dGluZyByZW1vdmVkLiBJZGVhbGx5IGEgYmV0dGVyXHJcbiAgICAgICAgLy8gc29sdXRpb24gdGhhbiB0aGlzIGZsYWcgc2hvdWxkIGJlIGZvdW5kLlxyXG4gICAgICAgIGlmICggY2hpbGQuX3Bkb21EaXNwbGF5c0luZm8uY2FuSGF2ZVBET01EaXNwbGF5cygpICYmICFjaGlsZC5faXNHZXR0aW5nUmVtb3ZlZEZyb21QYXJlbnQgKSB7XHJcbiAgICAgICAgICBjaGlsZC5fcGRvbURpc3BsYXlzSW5mby5yZW1vdmVQRE9NRGlzcGxheXMoIGRpc3BsYXlzICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLm5vZGUucGRvbURpc3BsYXlzRW1pdHRlci5lbWl0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdQRE9NRGlzcGxheXNJbmZvJywgUERPTURpc3BsYXlzSW5mbyApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBd0JBLFFBQVEsRUFBRUMsT0FBTyxRQUFRLGtCQUFrQjtBQUVuRSxlQUFlLE1BQU1DLGdCQUFnQixDQUFDO0VBSXBDO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUdBO0FBQ0Y7QUFDQTtBQUNBO0VBQ1NDLFdBQVdBLENBQUVDLElBQVUsRUFBRztJQUMvQixJQUFJLENBQUNBLElBQUksR0FBR0EsSUFBSTtJQUNoQixJQUFJLENBQUNDLFlBQVksR0FBRyxFQUFFO0VBQ3hCOztFQUVBO0FBQ0Y7QUFDQTtFQUNTQyxVQUFVQSxDQUFFRixJQUFVLEVBQVM7SUFDcENHLFVBQVUsSUFBSUEsVUFBVSxDQUFDTCxnQkFBZ0IsSUFBSUssVUFBVSxDQUFDTCxnQkFBZ0IsQ0FBRyxnQkFBZUUsSUFBSSxDQUFDSSxFQUFHLGNBQWEsSUFBSSxDQUFDSixJQUFJLENBQUNJLEVBQUcsR0FBRyxDQUFDO0lBQ2hJRCxVQUFVLElBQUlBLFVBQVUsQ0FBQ0wsZ0JBQWdCLElBQUlLLFVBQVUsQ0FBQ0UsSUFBSSxDQUFDLENBQUM7SUFFOUQsSUFBS0wsSUFBSSxDQUFDTSxpQkFBaUIsQ0FBQ0MsbUJBQW1CLENBQUMsQ0FBQyxFQUFHO01BQ2xEUCxJQUFJLENBQUNNLGlCQUFpQixDQUFDRSxlQUFlLENBQUUsSUFBSSxDQUFDUCxZQUFhLENBQUM7SUFDN0Q7SUFFQUUsVUFBVSxJQUFJQSxVQUFVLENBQUNMLGdCQUFnQixJQUFJSyxVQUFVLENBQUNNLEdBQUcsQ0FBQyxDQUFDO0VBQy9EOztFQUVBO0FBQ0Y7QUFDQTtFQUNTQyxhQUFhQSxDQUFFVixJQUFVLEVBQVM7SUFDdkNHLFVB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