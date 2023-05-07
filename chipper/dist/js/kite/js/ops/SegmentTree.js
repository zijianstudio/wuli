// Copyright 2022-2023, University of Colorado Boulder

/**
 * An accelerated data structure of items where it supports fast queries of "what items overlap wth x values",
 * so we don't have to iterate through all items.
 *
 * This effectively combines an interval/segment tree with red-black tree balancing for insertion.
 *
 * For proper red-black constraints, we handle ranges from -infinity to infinity.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import arrayRemove from '../../../phet-core/js/arrayRemove.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import Pool from '../../../phet-core/js/Pool.js';
import { kite } from '../imports.js';
let globalId = 1;
const scratchArray = [];
export default class SegmentTree {
  // Our epsilon, used to expand the bounds of segments so we have some non-zero amount of "overlap" for our segments

  // All items currently in the tree

  /**
   * @param epsilon - Used to expand the bounds of segments so we have some non-zero amount of "overlap" for our
   *                  segments
   */
  constructor(epsilon = 1e-6) {
    this.rootNode = SegmentNode.pool.create(this, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    this.rootNode.isBlack = true;
    this.epsilon = epsilon;
    this.items = new Set();
  }
  /**
   * Calls interruptableCallback in turn for every "possibly overlapping" item stored in this tree.
   *
   * @param item - The item to use for the bounds range.
   * @param interruptableCallback - When this returns true, the search will be aborted
   */
  query(item, interruptableCallback) {
    const id = globalId++;
    if (this.rootNode) {
      return this.rootNode.query(item, this.getMinX(item, this.epsilon), this.getMaxX(item, this.epsilon), id, interruptableCallback);
    } else {
      return false;
    }
  }
  addItem(item) {
    const min = this.getMinX(item, this.epsilon);
    const max = this.getMaxX(item, this.epsilon);

    // TOOD: consider adding into one traversal
    this.rootNode.split(min, this);
    this.rootNode.split(max, this);
    this.rootNode.addItem(item, min, max);
    this.items.add(item);
  }
  removeItem(item) {
    this.rootNode.removeItem(item, this.getMinX(item, this.epsilon), this.getMaxX(item, this.epsilon));
    this.items.delete(item);
  }

  /**
   * For assertion purposes
   */
  audit() {
    this.rootNode.audit(this.epsilon, this.items, []);
  }
  toString() {
    let spacing = 0;
    let string = '';
    (function recurse(node) {
      string += `${_.repeat('  ', spacing)}${node.toString()}\n`;
      spacing++;
      if (node.hasChildren()) {
        recurse(node.left);
        recurse(node.right);
      }
      spacing--;
    })(this.rootNode);
    return string;
  }
}

// The nodes in our tree
class SegmentNode {
  // The minimum x value of this subtree

  // The maximum x value of this subtree

  // Child nodes (not specified if we have no children or splitValue). Left value is defined as the smaller range.

  // Parent node (root will have null)

  // The value where we split our interval into our children (so if we are 0-10, and a split value of 5, our left child
  // will have 0-5 and our right child will have 5-10.
  // All items that cover this full range of our min-max. These will be stored as high up in the tree as possible.
  // Red-black tree color information, for self-balancing
  constructor(tree, min, max) {
    this.items = [];
    this.initialize(tree, min, max);
  }
  initialize(tree, min, max) {
    this.min = min;
    this.max = max;
    this.splitValue = null;
    this.left = null;
    this.right = null;
    this.parent = null;
    this.tree = tree;
    this.isBlack = false;
    cleanArray(this.items);
    return this;
  }
  contains(n) {
    return n >= this.min && n <= this.max;
  }
  hasChildren() {
    return this.splitValue !== null;
  }

  /**
   * Iterates through interruptableCallback for every potentially overlapping edge - aborts when it returns true
   *
   * @param item
   * @param min - computed min for the item
   * @param max - computed max for the item
   * @param id - our 1-time id that we use to not repeat calls with the same item
   * @param interruptableCallback
   * @returns whether we were aborted
   */
  query(item, min, max, id, interruptableCallback) {
    let abort = false;

    // Partial containment works for everything checking for possible overlap
    if (this.min <= max && this.max >= min) {
      // Do an interruptable iteration
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        // @ts-expect-error
        if (!item.internalData.segmentId || item.internalData.segmentId < id) {
          // @ts-expect-error
          item.internalData.segmentId = id;
          abort = interruptableCallback(item);
          if (abort) {
            return true;
          }
        }
      }
      if (this.hasChildren()) {
        if (!abort) {
          abort = this.left.query(item, min, max, id, interruptableCallback);
        }
        if (!abort) {
          abort = this.right.query(item, min, max, id, interruptableCallback);
        }
      }
    }
    return abort;
  }

  /**
   * Replaces one child with another
   */
  swapChild(oldChild, newChild) {
    assert && assert(this.left === oldChild || this.right === oldChild);
    if (this.left === oldChild) {
      this.left = newChild;
    } else {
      this.right = newChild;
    }
  }
  hasChild(node) {
    return this.left === node || this.right === node;
  }
  otherChild(node) {
    assert && assert(this.hasChild(node));
    return this.left === node ? this.right : this.left;
  }

  /**
   * Tree operation needed for red-black self-balancing
   */
  leftRotate(tree) {
    assert && assert(this.hasChildren() && this.right.hasChildren());
    if (this.right.hasChildren()) {
      const y = this.right;
      const alpha = this.left;
      const beta = y.left;
      const gamma = y.right;

      // Recreate parent/child connections
      y.parent = this.parent;
      if (this.parent) {
        this.parent.swapChild(this, y);
      } else {
        tree.rootNode = y;
      }
      this.parent = y;
      beta.parent = this;
      y.left = this;
      this.left = alpha;
      this.right = beta;

      // Recompute min/max/splitValue
      this.max = beta.max;
      this.splitValue = alpha.max;
      y.min = this.min;
      y.splitValue = this.max;

      // Start recomputation of stored items
      const xEdges = cleanArray(scratchArray);
      xEdges.push(...this.items);
      cleanArray(this.items);

      // combine alpha-beta into x
      for (let i = alpha.items.length - 1; i >= 0; i--) {
        const edge = alpha.items[i];
        const index = beta.items.indexOf(edge);
        if (index >= 0) {
          alpha.items.splice(i, 1);
          beta.items.splice(index, 1);
          this.items.push(edge);
        }
      }

      // push y to beta and gamma
      beta.items.push(...y.items);
      gamma.items.push(...y.items);
      cleanArray(y.items);

      // x items to y
      y.items.push(...xEdges);
    }
  }

  /**
   * Tree operation needed for red-black self-balancing
   */
  rightRotate(tree) {
    assert && assert(this.hasChildren() && this.left.hasChildren());
    const x = this.left;
    const gamma = this.right;
    const alpha = x.left;
    const beta = x.right;

    // Recreate parent/child connections
    x.parent = this.parent;
    if (this.parent) {
      this.parent.swapChild(this, x);
    } else {
      tree.rootNode = x;
    }
    this.parent = x;
    beta.parent = this;
    x.right = this;
    this.left = beta;
    this.right = gamma;

    // Recompute min/max/splitValue
    this.min = beta.min;
    this.splitValue = gamma.min;
    x.max = this.max;
    x.splitValue = this.min;

    // Start recomputation of stored items
    const yEdges = cleanArray(scratchArray);
    yEdges.push(...this.items);
    cleanArray(this.items);

    // combine beta-gamma into y
    for (let i = gamma.items.length - 1; i >= 0; i--) {
      const edge = gamma.items[i];
      const index = beta.items.indexOf(edge);
      if (index >= 0) {
        gamma.items.splice(i, 1);
        beta.items.splice(index, 1);
        this.items.push(edge);
      }
    }

    // push x to alpha and beta
    alpha.items.push(...x.items);
    beta.items.push(...x.items);
    cleanArray(x.items);

    // y items to x
    x.items.push(...yEdges);
  }

  /**
   * Called after an insertion (or potentially deletion in the future) that handles red-black tree rebalancing.
   */
  fixRedBlack(tree) {
    assert && assert(!this.isBlack);
    if (!this.parent) {
      this.isBlack = true;
    } else {
      const parent = this.parent;
      if (!parent.isBlack) {
        // Due to red-black nature, grandparent should exist since if parent was the root, it would be black.
        const grandparent = parent.parent;
        const uncle = grandparent.otherChild(parent);
        if (!uncle.isBlack) {
          // case 1
          parent.isBlack = true;
          uncle.isBlack = true;
          grandparent.isBlack = false;
          grandparent.fixRedBlack(tree);
        } else {
          if (parent === grandparent.left) {
            if (this === parent.right) {
              // case 2
              parent.leftRotate(tree);
              parent.parent.isBlack = true;
              parent.parent.parent.isBlack = false;
              parent.parent.parent.rightRotate(tree);
            } else {
              // case 3
              parent.isBlack = true;
              grandparent.isBlack = false;
              grandparent.rightRotate(tree);
            }
          } else {
            if (this === parent.left) {
              // case 2
              parent.rightRotate(tree);
              parent.parent.isBlack = true;
              parent.parent.parent.isBlack = false;
              parent.parent.parent.leftRotate(tree);
            } else {
              // case 3
              parent.isBlack = true;
              grandparent.isBlack = false;
              grandparent.leftRotate(tree);
            }
          }
        }
      }
    }
  }

  /**
   * Triggers a split of whatever interval contains this value (or is a no-op if we already split at it before).
   */
  split(n, tree) {
    assert && assert(this.contains(n));

    // Ignore splits if we are already split on them
    if (n === this.min || n === this.max) {
      return;
    }
    if (this.hasChildren()) {
      // If our split value is the same as our current one, we've already split on that
      if (this.splitValue !== n) {
        (n > this.splitValue ? this.right : this.left).split(n, tree);
      }
    } else {
      this.splitValue = n;
      const newLeft = SegmentNode.pool.create(this.tree, this.min, n);
      newLeft.parent = this;
      this.left = newLeft;
      const newRight = SegmentNode.pool.create(this.tree, n, this.max);
      newRight.parent = this;
      this.right = newRight;

      // Check if we need to do red-black tree balancing
      if (!this.isBlack && this.parent) {
        const parent = this.parent;
        const sibling = parent.otherChild(this);
        if (sibling.isBlack) {
          if (this === parent.left) {
            parent.rightRotate(tree);
            newLeft.isBlack = true;
          } else {
            parent.leftRotate(tree);
            newRight.isBlack = true;
          }
          this.fixRedBlack(tree);
        } else {
          // case 1
          this.isBlack = true;
          sibling.isBlack = true;
          parent.isBlack = false;
          parent.fixRedBlack(tree);
        }
      }
    }
  }

  /**
   * Recursively adds an item
   */
  addItem(item, min, max) {
    // Ignore no-overlap cases
    if (this.min > max || this.max < min) {
      return;
    }
    if (this.min >= min && this.max <= max) {
      // We are fully contained
      this.items.push(item);
    } else if (this.hasChildren()) {
      this.left.addItem(item, min, max);
      this.right.addItem(item, min, max);
    }
  }

  /**
   * Recursively removes an item
   */
  removeItem(item, min, max) {
    // Ignore no-overlap cases
    if (this.min > max || this.max < min) {
      return;
    }
    if (this.min >= min && this.max <= max) {
      // We are fully contained
      assert && assert(this.items.includes(item));
      arrayRemove(this.items, item);
    } else if (this.hasChildren()) {
      this.left.removeItem(item, min, max);
      this.right.removeItem(item, min, max);
    }
  }

  /**
   * Recursively audits with assertions, checking all of our assumptions.
   *
   * @param epsilon
   * @param allItems - All items in the tree
   * @param presentItems - Edges that were present in ancestors
   */
  audit(epsilon, allItems, presentItems = []) {
    if (assert) {
      for (const item of presentItems) {
        assert(!this.items.includes(item));
      }
      for (const item of this.items) {
        // Containment check, this node should be fully contained
        assert(this.tree.getMinX(item, epsilon) <= this.min);
        assert(this.tree.getMaxX(item, epsilon) >= this.max);
      }
      for (const item of presentItems) {
        if (this.tree.getMinX(item, epsilon) <= this.min && this.tree.getMaxX(item, epsilon) >= this.max) {
          assert(allItems.has(item) || this.items.includes(item));
        }
      }
      assert(this.hasChildren() === (this.left !== null));
      assert(this.hasChildren() === (this.right !== null));
      assert(this.hasChildren() === (this.splitValue !== null));
      assert(this.min < this.max);
      if (this.parent) {
        assert(this.parent.hasChild(this));
        assert(this.isBlack || this.parent.isBlack);
      }
      if (this.hasChildren()) {
        assert(this.left.parent === this);
        assert(this.right.parent === this);
        assert(this.min === this.left.min);
        assert(this.max === this.right.max);
        assert(this.splitValue === this.left.max);
        assert(this.splitValue === this.right.min);
        for (const item of this.left.items) {
          assert(!this.right.items.includes(item), 'We shouldn\'t have two children with the same item');
        }
        const childPresentItems = [...presentItems, ...this.items];
        this.left.audit(epsilon, allItems, childPresentItems);
        this.right.audit(epsilon, allItems, childPresentItems);
      }
    }
  }
  toString() {
    return `[${this.min} ${this.max}] split:${this.splitValue} ${this.isBlack ? 'black' : 'red'} ${this.items}`;
  }
  freeToPool() {
    SegmentNode.pool.freeToPool(this);
  }
  static pool = new Pool(SegmentNode);
}
kite.register('SegmentTree', SegmentTree);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhcnJheVJlbW92ZSIsImNsZWFuQXJyYXkiLCJQb29sIiwia2l0ZSIsImdsb2JhbElkIiwic2NyYXRjaEFycmF5IiwiU2VnbWVudFRyZWUiLCJjb25zdHJ1Y3RvciIsImVwc2lsb24iLCJyb290Tm9kZSIsIlNlZ21lbnROb2RlIiwicG9vbCIsImNyZWF0ZSIsIk51bWJlciIsIk5FR0FUSVZFX0lORklOSVRZIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJpc0JsYWNrIiwiaXRlbXMiLCJTZXQiLCJxdWVyeSIsIml0ZW0iLCJpbnRlcnJ1cHRhYmxlQ2FsbGJhY2siLCJpZCIsImdldE1pblgiLCJnZXRNYXhYIiwiYWRkSXRlbSIsIm1pbiIsIm1heCIsInNwbGl0IiwiYWRkIiwicmVtb3ZlSXRlbSIsImRlbGV0ZSIsImF1ZGl0IiwidG9TdHJpbmciLCJzcGFjaW5nIiwic3RyaW5nIiwicmVjdXJzZSIsIm5vZGUiLCJfIiwicmVwZWF0IiwiaGFzQ2hpbGRyZW4iLCJsZWZ0IiwicmlnaHQiLCJ0cmVlIiwiaW5pdGlhbGl6ZSIsInNwbGl0VmFsdWUiLCJwYXJlbnQiLCJjb250YWlucyIsIm4iLCJhYm9ydCIsImkiLCJsZW5ndGgiLCJpbnRlcm5hbERhdGEiLCJzZWdtZW50SWQiLCJzd2FwQ2hpbGQiLCJvbGRDaGlsZCIsIm5ld0NoaWxkIiwiYXNzZXJ0IiwiaGFzQ2hpbGQiLCJvdGhlckNoaWxkIiwibGVmdFJvdGF0ZSIsInkiLCJhbHBoYSIsImJldGEiLCJnYW1tYSIsInhFZGdlcyIsInB1c2giLCJlZGdlIiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwicmlnaHRSb3RhdGUiLCJ4IiwieUVkZ2VzIiwiZml4UmVkQmxhY2siLCJncmFuZHBhcmVudCIsInVuY2xlIiwibmV3TGVmdCIsIm5ld1JpZ2h0Iiwic2libGluZyIsImluY2x1ZGVzIiwiYWxsSXRlbXMiLCJwcmVzZW50SXRlbXMiLCJoYXMiLCJjaGlsZFByZXNlbnRJdGVtcyIsImZyZWVUb1Bvb2wiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNlZ21lbnRUcmVlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEFuIGFjY2VsZXJhdGVkIGRhdGEgc3RydWN0dXJlIG9mIGl0ZW1zIHdoZXJlIGl0IHN1cHBvcnRzIGZhc3QgcXVlcmllcyBvZiBcIndoYXQgaXRlbXMgb3ZlcmxhcCB3dGggeCB2YWx1ZXNcIixcclxuICogc28gd2UgZG9uJ3QgaGF2ZSB0byBpdGVyYXRlIHRocm91Z2ggYWxsIGl0ZW1zLlxyXG4gKlxyXG4gKiBUaGlzIGVmZmVjdGl2ZWx5IGNvbWJpbmVzIGFuIGludGVydmFsL3NlZ21lbnQgdHJlZSB3aXRoIHJlZC1ibGFjayB0cmVlIGJhbGFuY2luZyBmb3IgaW5zZXJ0aW9uLlxyXG4gKlxyXG4gKiBGb3IgcHJvcGVyIHJlZC1ibGFjayBjb25zdHJhaW50cywgd2UgaGFuZGxlIHJhbmdlcyBmcm9tIC1pbmZpbml0eSB0byBpbmZpbml0eS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xyXG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XHJcbmltcG9ydCBQb29sIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sLmpzJztcclxuaW1wb3J0IHsgRWRnZSwga2l0ZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5cclxubGV0IGdsb2JhbElkID0gMTtcclxuY29uc3Qgc2NyYXRjaEFycmF5OiBFZGdlW10gPSBbXTtcclxuXHJcbnR5cGUgU2VnbWVudEluZm88VD4gPSB7XHJcbiAgZ2V0TWluWDogKCBpdGVtOiBULCBlcHNpbG9uOiBudW1iZXIgKSA9PiBudW1iZXI7XHJcbiAgZ2V0TWF4WDogKCBpdGVtOiBULCBlcHNpbG9uOiBudW1iZXIgKSA9PiBudW1iZXI7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBTZWdtZW50VHJlZTxUPiBpbXBsZW1lbnRzIFNlZ21lbnRJbmZvPFQ+IHtcclxuXHJcbiAgcHVibGljIHJvb3ROb2RlOiBTZWdtZW50Tm9kZTxUPjtcclxuXHJcbiAgLy8gT3VyIGVwc2lsb24sIHVzZWQgdG8gZXhwYW5kIHRoZSBib3VuZHMgb2Ygc2VnbWVudHMgc28gd2UgaGF2ZSBzb21lIG5vbi16ZXJvIGFtb3VudCBvZiBcIm92ZXJsYXBcIiBmb3Igb3VyIHNlZ21lbnRzXHJcbiAgcHJpdmF0ZSByZWFkb25seSBlcHNpbG9uOiBudW1iZXI7XHJcblxyXG4gIC8vIEFsbCBpdGVtcyBjdXJyZW50bHkgaW4gdGhlIHRyZWVcclxuICBwcml2YXRlIHJlYWRvbmx5IGl0ZW1zOiBTZXQ8VD47XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBlcHNpbG9uIC0gVXNlZCB0byBleHBhbmQgdGhlIGJvdW5kcyBvZiBzZWdtZW50cyBzbyB3ZSBoYXZlIHNvbWUgbm9uLXplcm8gYW1vdW50IG9mIFwib3ZlcmxhcFwiIGZvciBvdXJcclxuICAgKiAgICAgICAgICAgICAgICAgIHNlZ21lbnRzXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBlcHNpbG9uID0gMWUtNiApIHtcclxuICAgIHRoaXMucm9vdE5vZGUgPSBTZWdtZW50Tm9kZS5wb29sLmNyZWF0ZSggdGhpcywgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKSBhcyBTZWdtZW50Tm9kZTxUPjtcclxuICAgIHRoaXMucm9vdE5vZGUuaXNCbGFjayA9IHRydWU7XHJcblxyXG4gICAgdGhpcy5lcHNpbG9uID0gZXBzaWxvbjtcclxuXHJcbiAgICB0aGlzLml0ZW1zID0gbmV3IFNldDxUPigpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFic3RyYWN0IGdldE1pblgoIGl0ZW06IFQsIGVwc2lsb246IG51bWJlciApOiBudW1iZXI7XHJcbiAgcHVibGljIGFic3RyYWN0IGdldE1heFgoIGl0ZW06IFQsIGVwc2lsb246IG51bWJlciApOiBudW1iZXI7XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIGludGVycnVwdGFibGVDYWxsYmFjayBpbiB0dXJuIGZvciBldmVyeSBcInBvc3NpYmx5IG92ZXJsYXBwaW5nXCIgaXRlbSBzdG9yZWQgaW4gdGhpcyB0cmVlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGl0ZW0gLSBUaGUgaXRlbSB0byB1c2UgZm9yIHRoZSBib3VuZHMgcmFuZ2UuXHJcbiAgICogQHBhcmFtIGludGVycnVwdGFibGVDYWxsYmFjayAtIFdoZW4gdGhpcyByZXR1cm5zIHRydWUsIHRoZSBzZWFyY2ggd2lsbCBiZSBhYm9ydGVkXHJcbiAgICovXHJcbiAgcHVibGljIHF1ZXJ5KCBpdGVtOiBULCBpbnRlcnJ1cHRhYmxlQ2FsbGJhY2s6ICggaXRlbTogVCApID0+IGJvb2xlYW4gKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBpZCA9IGdsb2JhbElkKys7XHJcblxyXG4gICAgaWYgKCB0aGlzLnJvb3ROb2RlICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5yb290Tm9kZS5xdWVyeSggaXRlbSwgdGhpcy5nZXRNaW5YKCBpdGVtLCB0aGlzLmVwc2lsb24gKSwgdGhpcy5nZXRNYXhYKCBpdGVtLCB0aGlzLmVwc2lsb24gKSwgaWQsIGludGVycnVwdGFibGVDYWxsYmFjayApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRJdGVtKCBpdGVtOiBUICk6IHZvaWQge1xyXG4gICAgY29uc3QgbWluID0gdGhpcy5nZXRNaW5YKCBpdGVtLCB0aGlzLmVwc2lsb24gKTtcclxuICAgIGNvbnN0IG1heCA9IHRoaXMuZ2V0TWF4WCggaXRlbSwgdGhpcy5lcHNpbG9uICk7XHJcblxyXG4gICAgLy8gVE9PRDogY29uc2lkZXIgYWRkaW5nIGludG8gb25lIHRyYXZlcnNhbFxyXG4gICAgdGhpcy5yb290Tm9kZS5zcGxpdCggbWluLCB0aGlzICk7XHJcbiAgICB0aGlzLnJvb3ROb2RlLnNwbGl0KCBtYXgsIHRoaXMgKTtcclxuICAgIHRoaXMucm9vdE5vZGUuYWRkSXRlbSggaXRlbSwgbWluLCBtYXggKTtcclxuXHJcbiAgICB0aGlzLml0ZW1zLmFkZCggaXRlbSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlbW92ZUl0ZW0oIGl0ZW06IFQgKTogdm9pZCB7XHJcbiAgICB0aGlzLnJvb3ROb2RlLnJlbW92ZUl0ZW0oIGl0ZW0sIHRoaXMuZ2V0TWluWCggaXRlbSwgdGhpcy5lcHNpbG9uICksIHRoaXMuZ2V0TWF4WCggaXRlbSwgdGhpcy5lcHNpbG9uICkgKTtcclxuICAgIHRoaXMuaXRlbXMuZGVsZXRlKCBpdGVtICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGb3IgYXNzZXJ0aW9uIHB1cnBvc2VzXHJcbiAgICovXHJcbiAgcHVibGljIGF1ZGl0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5yb290Tm9kZS5hdWRpdCggdGhpcy5lcHNpbG9uLCB0aGlzLml0ZW1zLCBbXSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICBsZXQgc3BhY2luZyA9IDA7XHJcbiAgICBsZXQgc3RyaW5nID0gJyc7XHJcblxyXG4gICAgKCBmdW5jdGlvbiByZWN1cnNlKCBub2RlOiBTZWdtZW50Tm9kZTxUPiApIHtcclxuICAgICAgc3RyaW5nICs9IGAke18ucmVwZWF0KCAnICAnLCBzcGFjaW5nICl9JHtub2RlLnRvU3RyaW5nKCl9XFxuYDtcclxuICAgICAgc3BhY2luZysrO1xyXG4gICAgICBpZiAoIG5vZGUuaGFzQ2hpbGRyZW4oKSApIHtcclxuICAgICAgICByZWN1cnNlKCBub2RlLmxlZnQhICk7XHJcbiAgICAgICAgcmVjdXJzZSggbm9kZS5yaWdodCEgKTtcclxuICAgICAgfVxyXG4gICAgICBzcGFjaW5nLS07XHJcbiAgICB9ICkoIHRoaXMucm9vdE5vZGUgKTtcclxuXHJcbiAgICByZXR1cm4gc3RyaW5nO1xyXG4gIH1cclxufVxyXG5cclxuLy8gVGhlIG5vZGVzIGluIG91ciB0cmVlXHJcbmNsYXNzIFNlZ21lbnROb2RlPFQ+IHtcclxuXHJcbiAgLy8gVGhlIG1pbmltdW0geCB2YWx1ZSBvZiB0aGlzIHN1YnRyZWVcclxuICBwdWJsaWMgbWluITogbnVtYmVyO1xyXG5cclxuICAvLyBUaGUgbWF4aW11bSB4IHZhbHVlIG9mIHRoaXMgc3VidHJlZVxyXG4gIHB1YmxpYyBtYXghOiBudW1iZXI7XHJcblxyXG4gIC8vIENoaWxkIG5vZGVzIChub3Qgc3BlY2lmaWVkIGlmIHdlIGhhdmUgbm8gY2hpbGRyZW4gb3Igc3BsaXRWYWx1ZSkuIExlZnQgdmFsdWUgaXMgZGVmaW5lZCBhcyB0aGUgc21hbGxlciByYW5nZS5cclxuICBwdWJsaWMgbGVmdCE6IFNlZ21lbnROb2RlPFQ+IHwgbnVsbDtcclxuICBwdWJsaWMgcmlnaHQhOiBTZWdtZW50Tm9kZTxUPiB8IG51bGw7XHJcblxyXG4gIC8vIFBhcmVudCBub2RlIChyb290IHdpbGwgaGF2ZSBudWxsKVxyXG4gIHB1YmxpYyBwYXJlbnQhOiBTZWdtZW50Tm9kZTxUPiB8IG51bGw7XHJcblxyXG4gIC8vIFRoZSB2YWx1ZSB3aGVyZSB3ZSBzcGxpdCBvdXIgaW50ZXJ2YWwgaW50byBvdXIgY2hpbGRyZW4gKHNvIGlmIHdlIGFyZSAwLTEwLCBhbmQgYSBzcGxpdCB2YWx1ZSBvZiA1LCBvdXIgbGVmdCBjaGlsZFxyXG4gIC8vIHdpbGwgaGF2ZSAwLTUgYW5kIG91ciByaWdodCBjaGlsZCB3aWxsIGhhdmUgNS0xMC5cclxuICBwdWJsaWMgc3BsaXRWYWx1ZSE6IG51bWJlciB8IG51bGw7XHJcblxyXG4gIC8vIEFsbCBpdGVtcyB0aGF0IGNvdmVyIHRoaXMgZnVsbCByYW5nZSBvZiBvdXIgbWluLW1heC4gVGhlc2Ugd2lsbCBiZSBzdG9yZWQgYXMgaGlnaCB1cCBpbiB0aGUgdHJlZSBhcyBwb3NzaWJsZS5cclxuICBwdWJsaWMgaXRlbXM6IFRbXTtcclxuXHJcbiAgLy8gUmVkLWJsYWNrIHRyZWUgY29sb3IgaW5mb3JtYXRpb24sIGZvciBzZWxmLWJhbGFuY2luZ1xyXG4gIHB1YmxpYyBpc0JsYWNrITogYm9vbGVhbjtcclxuXHJcbiAgcHVibGljIHRyZWUhOiBTZWdtZW50VHJlZTxUPjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0cmVlOiBTZWdtZW50VHJlZTxUPiwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyICkge1xyXG4gICAgdGhpcy5pdGVtcyA9IFtdO1xyXG5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZSggdHJlZSwgbWluLCBtYXggKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBpbml0aWFsaXplKCB0cmVlOiBTZWdtZW50VHJlZTxUPiwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgdGhpcy5taW4gPSBtaW47XHJcbiAgICB0aGlzLm1heCA9IG1heDtcclxuXHJcbiAgICB0aGlzLnNwbGl0VmFsdWUgPSBudWxsO1xyXG4gICAgdGhpcy5sZWZ0ID0gbnVsbDtcclxuICAgIHRoaXMucmlnaHQgPSBudWxsO1xyXG4gICAgdGhpcy5wYXJlbnQgPSBudWxsO1xyXG4gICAgdGhpcy50cmVlID0gdHJlZTtcclxuXHJcbiAgICB0aGlzLmlzQmxhY2sgPSBmYWxzZTtcclxuXHJcbiAgICBjbGVhbkFycmF5KCB0aGlzLml0ZW1zICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY29udGFpbnMoIG46IG51bWJlciApOiBib29sZWFuIHtcclxuICAgIHJldHVybiBuID49IHRoaXMubWluICYmIG4gPD0gdGhpcy5tYXg7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaGFzQ2hpbGRyZW4oKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLnNwbGl0VmFsdWUgIT09IG51bGw7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogSXRlcmF0ZXMgdGhyb3VnaCBpbnRlcnJ1cHRhYmxlQ2FsbGJhY2sgZm9yIGV2ZXJ5IHBvdGVudGlhbGx5IG92ZXJsYXBwaW5nIGVkZ2UgLSBhYm9ydHMgd2hlbiBpdCByZXR1cm5zIHRydWVcclxuICAgKlxyXG4gICAqIEBwYXJhbSBpdGVtXHJcbiAgICogQHBhcmFtIG1pbiAtIGNvbXB1dGVkIG1pbiBmb3IgdGhlIGl0ZW1cclxuICAgKiBAcGFyYW0gbWF4IC0gY29tcHV0ZWQgbWF4IGZvciB0aGUgaXRlbVxyXG4gICAqIEBwYXJhbSBpZCAtIG91ciAxLXRpbWUgaWQgdGhhdCB3ZSB1c2UgdG8gbm90IHJlcGVhdCBjYWxscyB3aXRoIHRoZSBzYW1lIGl0ZW1cclxuICAgKiBAcGFyYW0gaW50ZXJydXB0YWJsZUNhbGxiYWNrXHJcbiAgICogQHJldHVybnMgd2hldGhlciB3ZSB3ZXJlIGFib3J0ZWRcclxuICAgKi9cclxuICBwdWJsaWMgcXVlcnkoIGl0ZW06IFQsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciwgaWQ6IG51bWJlciwgaW50ZXJydXB0YWJsZUNhbGxiYWNrOiAoIGl0ZW06IFQgKSA9PiBib29sZWFuICk6IGJvb2xlYW4ge1xyXG4gICAgbGV0IGFib3J0ID0gZmFsc2U7XHJcblxyXG4gICAgLy8gUGFydGlhbCBjb250YWlubWVudCB3b3JrcyBmb3IgZXZlcnl0aGluZyBjaGVja2luZyBmb3IgcG9zc2libGUgb3ZlcmxhcFxyXG4gICAgaWYgKCB0aGlzLm1pbiA8PSBtYXggJiYgdGhpcy5tYXggPj0gbWluICkge1xyXG5cclxuICAgICAgLy8gRG8gYW4gaW50ZXJydXB0YWJsZSBpdGVyYXRpb25cclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5pdGVtc1sgaSBdO1xyXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgICAgICBpZiAoICFpdGVtLmludGVybmFsRGF0YS5zZWdtZW50SWQgfHwgaXRlbS5pbnRlcm5hbERhdGEuc2VnbWVudElkIDwgaWQgKSB7XHJcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICAgICAgICBpdGVtLmludGVybmFsRGF0YS5zZWdtZW50SWQgPSBpZDtcclxuICAgICAgICAgIGFib3J0ID0gaW50ZXJydXB0YWJsZUNhbGxiYWNrKCBpdGVtICk7XHJcbiAgICAgICAgICBpZiAoIGFib3J0ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggdGhpcy5oYXNDaGlsZHJlbigpICkge1xyXG4gICAgICAgIGlmICggIWFib3J0ICkge1xyXG4gICAgICAgICAgYWJvcnQgPSB0aGlzLmxlZnQhLnF1ZXJ5KCBpdGVtLCBtaW4sIG1heCwgaWQsIGludGVycnVwdGFibGVDYWxsYmFjayApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCAhYWJvcnQgKSB7XHJcbiAgICAgICAgICBhYm9ydCA9IHRoaXMucmlnaHQhLnF1ZXJ5KCBpdGVtLCBtaW4sIG1heCwgaWQsIGludGVycnVwdGFibGVDYWxsYmFjayApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhYm9ydDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlcGxhY2VzIG9uZSBjaGlsZCB3aXRoIGFub3RoZXJcclxuICAgKi9cclxuICBwdWJsaWMgc3dhcENoaWxkKCBvbGRDaGlsZDogU2VnbWVudE5vZGU8VD4sIG5ld0NoaWxkOiBTZWdtZW50Tm9kZTxUPiApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubGVmdCA9PT0gb2xkQ2hpbGQgfHwgdGhpcy5yaWdodCA9PT0gb2xkQ2hpbGQgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMubGVmdCA9PT0gb2xkQ2hpbGQgKSB7XHJcbiAgICAgIHRoaXMubGVmdCA9IG5ld0NoaWxkO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMucmlnaHQgPSBuZXdDaGlsZDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBoYXNDaGlsZCggbm9kZTogU2VnbWVudE5vZGU8VD4gKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5sZWZ0ID09PSBub2RlIHx8IHRoaXMucmlnaHQgPT09IG5vZGU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3RoZXJDaGlsZCggbm9kZTogU2VnbWVudE5vZGU8VD4gKTogU2VnbWVudE5vZGU8VD4ge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5oYXNDaGlsZCggbm9kZSApICk7XHJcblxyXG4gICAgcmV0dXJuICggKCB0aGlzLmxlZnQgPT09IG5vZGUgKSA/IHRoaXMucmlnaHQgOiB0aGlzLmxlZnQgKSE7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmVlIG9wZXJhdGlvbiBuZWVkZWQgZm9yIHJlZC1ibGFjayBzZWxmLWJhbGFuY2luZ1xyXG4gICAqL1xyXG4gIHB1YmxpYyBsZWZ0Um90YXRlKCB0cmVlOiBTZWdtZW50VHJlZTxUPiApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaGFzQ2hpbGRyZW4oKSAmJiB0aGlzLnJpZ2h0IS5oYXNDaGlsZHJlbigpICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLnJpZ2h0IS5oYXNDaGlsZHJlbigpICkge1xyXG4gICAgICBjb25zdCB5ID0gdGhpcy5yaWdodCE7XHJcbiAgICAgIGNvbnN0IGFscGhhID0gdGhpcy5sZWZ0ITtcclxuICAgICAgY29uc3QgYmV0YSA9IHkubGVmdCE7XHJcbiAgICAgIGNvbnN0IGdhbW1hID0geS5yaWdodCE7XHJcblxyXG4gICAgICAvLyBSZWNyZWF0ZSBwYXJlbnQvY2hpbGQgY29ubmVjdGlvbnNcclxuICAgICAgeS5wYXJlbnQgPSB0aGlzLnBhcmVudDtcclxuICAgICAgaWYgKCB0aGlzLnBhcmVudCApIHtcclxuICAgICAgICB0aGlzLnBhcmVudC5zd2FwQ2hpbGQoIHRoaXMsIHkgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0cmVlLnJvb3ROb2RlID0geTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnBhcmVudCA9IHk7XHJcbiAgICAgIGJldGEucGFyZW50ID0gdGhpcztcclxuXHJcbiAgICAgIHkubGVmdCA9IHRoaXM7XHJcbiAgICAgIHRoaXMubGVmdCA9IGFscGhhO1xyXG4gICAgICB0aGlzLnJpZ2h0ID0gYmV0YTtcclxuXHJcbiAgICAgIC8vIFJlY29tcHV0ZSBtaW4vbWF4L3NwbGl0VmFsdWVcclxuICAgICAgdGhpcy5tYXggPSBiZXRhLm1heDtcclxuICAgICAgdGhpcy5zcGxpdFZhbHVlID0gYWxwaGEubWF4O1xyXG4gICAgICB5Lm1pbiA9IHRoaXMubWluO1xyXG4gICAgICB5LnNwbGl0VmFsdWUgPSB0aGlzLm1heDtcclxuXHJcbiAgICAgIC8vIFN0YXJ0IHJlY29tcHV0YXRpb24gb2Ygc3RvcmVkIGl0ZW1zXHJcbiAgICAgIGNvbnN0IHhFZGdlczogVFtdID0gY2xlYW5BcnJheSggc2NyYXRjaEFycmF5ICk7XHJcbiAgICAgIHhFZGdlcy5wdXNoKCAuLi50aGlzLml0ZW1zICk7XHJcbiAgICAgIGNsZWFuQXJyYXkoIHRoaXMuaXRlbXMgKTtcclxuXHJcbiAgICAgIC8vIGNvbWJpbmUgYWxwaGEtYmV0YSBpbnRvIHhcclxuICAgICAgZm9yICggbGV0IGkgPSBhbHBoYS5pdGVtcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcclxuICAgICAgICBjb25zdCBlZGdlID0gYWxwaGEuaXRlbXNbIGkgXTtcclxuICAgICAgICBjb25zdCBpbmRleCA9IGJldGEuaXRlbXMuaW5kZXhPZiggZWRnZSApO1xyXG4gICAgICAgIGlmICggaW5kZXggPj0gMCApIHtcclxuICAgICAgICAgIGFscGhhLml0ZW1zLnNwbGljZSggaSwgMSApO1xyXG4gICAgICAgICAgYmV0YS5pdGVtcy5zcGxpY2UoIGluZGV4LCAxICk7XHJcbiAgICAgICAgICB0aGlzLml0ZW1zLnB1c2goIGVkZ2UgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHB1c2ggeSB0byBiZXRhIGFuZCBnYW1tYVxyXG4gICAgICBiZXRhLml0ZW1zLnB1c2goIC4uLnkuaXRlbXMgKTtcclxuICAgICAgZ2FtbWEuaXRlbXMucHVzaCggLi4ueS5pdGVtcyApO1xyXG4gICAgICBjbGVhbkFycmF5KCB5Lml0ZW1zICk7XHJcblxyXG4gICAgICAvLyB4IGl0ZW1zIHRvIHlcclxuICAgICAgeS5pdGVtcy5wdXNoKCAuLi54RWRnZXMgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyZWUgb3BlcmF0aW9uIG5lZWRlZCBmb3IgcmVkLWJsYWNrIHNlbGYtYmFsYW5jaW5nXHJcbiAgICovXHJcbiAgcHVibGljIHJpZ2h0Um90YXRlKCB0cmVlOiBTZWdtZW50VHJlZTxUPiApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaGFzQ2hpbGRyZW4oKSAmJiB0aGlzLmxlZnQhLmhhc0NoaWxkcmVuKCkgKTtcclxuXHJcbiAgICBjb25zdCB4ID0gdGhpcy5sZWZ0ITtcclxuICAgIGNvbnN0IGdhbW1hID0gdGhpcy5yaWdodCE7XHJcbiAgICBjb25zdCBhbHBoYSA9IHgubGVmdCE7XHJcbiAgICBjb25zdCBiZXRhID0geC5yaWdodCE7XHJcblxyXG4gICAgLy8gUmVjcmVhdGUgcGFyZW50L2NoaWxkIGNvbm5lY3Rpb25zXHJcbiAgICB4LnBhcmVudCA9IHRoaXMucGFyZW50O1xyXG4gICAgaWYgKCB0aGlzLnBhcmVudCApIHtcclxuICAgICAgdGhpcy5wYXJlbnQuc3dhcENoaWxkKCB0aGlzLCB4ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdHJlZS5yb290Tm9kZSA9IHg7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBhcmVudCA9IHg7XHJcbiAgICBiZXRhLnBhcmVudCA9IHRoaXM7XHJcblxyXG4gICAgeC5yaWdodCA9IHRoaXM7XHJcbiAgICB0aGlzLmxlZnQgPSBiZXRhO1xyXG4gICAgdGhpcy5yaWdodCA9IGdhbW1hO1xyXG5cclxuICAgIC8vIFJlY29tcHV0ZSBtaW4vbWF4L3NwbGl0VmFsdWVcclxuICAgIHRoaXMubWluID0gYmV0YS5taW47XHJcbiAgICB0aGlzLnNwbGl0VmFsdWUgPSBnYW1tYS5taW47XHJcbiAgICB4Lm1heCA9IHRoaXMubWF4O1xyXG4gICAgeC5zcGxpdFZhbHVlID0gdGhpcy5taW47XHJcblxyXG4gICAgLy8gU3RhcnQgcmVjb21wdXRhdGlvbiBvZiBzdG9yZWQgaXRlbXNcclxuICAgIGNvbnN0IHlFZGdlczogVFtdID0gY2xlYW5BcnJheSggc2NyYXRjaEFycmF5ICk7XHJcbiAgICB5RWRnZXMucHVzaCggLi4udGhpcy5pdGVtcyApO1xyXG4gICAgY2xlYW5BcnJheSggdGhpcy5pdGVtcyApO1xyXG5cclxuICAgIC8vIGNvbWJpbmUgYmV0YS1nYW1tYSBpbnRvIHlcclxuICAgIGZvciAoIGxldCBpID0gZ2FtbWEuaXRlbXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgIGNvbnN0IGVkZ2UgPSBnYW1tYS5pdGVtc1sgaSBdO1xyXG4gICAgICBjb25zdCBpbmRleCA9IGJldGEuaXRlbXMuaW5kZXhPZiggZWRnZSApO1xyXG4gICAgICBpZiAoIGluZGV4ID49IDAgKSB7XHJcbiAgICAgICAgZ2FtbWEuaXRlbXMuc3BsaWNlKCBpLCAxICk7XHJcbiAgICAgICAgYmV0YS5pdGVtcy5zcGxpY2UoIGluZGV4LCAxICk7XHJcbiAgICAgICAgdGhpcy5pdGVtcy5wdXNoKCBlZGdlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBwdXNoIHggdG8gYWxwaGEgYW5kIGJldGFcclxuICAgIGFscGhhLml0ZW1zLnB1c2goIC4uLnguaXRlbXMgKTtcclxuICAgIGJldGEuaXRlbXMucHVzaCggLi4ueC5pdGVtcyApO1xyXG4gICAgY2xlYW5BcnJheSggeC5pdGVtcyApO1xyXG5cclxuICAgIC8vIHkgaXRlbXMgdG8geFxyXG4gICAgeC5pdGVtcy5wdXNoKCAuLi55RWRnZXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCBhZnRlciBhbiBpbnNlcnRpb24gKG9yIHBvdGVudGlhbGx5IGRlbGV0aW9uIGluIHRoZSBmdXR1cmUpIHRoYXQgaGFuZGxlcyByZWQtYmxhY2sgdHJlZSByZWJhbGFuY2luZy5cclxuICAgKi9cclxuICBwdWJsaWMgZml4UmVkQmxhY2soIHRyZWU6IFNlZ21lbnRUcmVlPFQ+ICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaXNCbGFjayApO1xyXG5cclxuICAgIGlmICggIXRoaXMucGFyZW50ICkge1xyXG4gICAgICB0aGlzLmlzQmxhY2sgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMucGFyZW50O1xyXG5cclxuICAgICAgaWYgKCAhcGFyZW50LmlzQmxhY2sgKSB7XHJcbiAgICAgICAgLy8gRHVlIHRvIHJlZC1ibGFjayBuYXR1cmUsIGdyYW5kcGFyZW50IHNob3VsZCBleGlzdCBzaW5jZSBpZiBwYXJlbnQgd2FzIHRoZSByb290LCBpdCB3b3VsZCBiZSBibGFjay5cclxuICAgICAgICBjb25zdCBncmFuZHBhcmVudCA9IHBhcmVudC5wYXJlbnQhO1xyXG4gICAgICAgIGNvbnN0IHVuY2xlID0gZ3JhbmRwYXJlbnQub3RoZXJDaGlsZCggcGFyZW50ICk7XHJcblxyXG4gICAgICAgIGlmICggIXVuY2xlLmlzQmxhY2sgKSB7XHJcbiAgICAgICAgICAvLyBjYXNlIDFcclxuICAgICAgICAgIHBhcmVudC5pc0JsYWNrID0gdHJ1ZTtcclxuICAgICAgICAgIHVuY2xlLmlzQmxhY2sgPSB0cnVlO1xyXG4gICAgICAgICAgZ3JhbmRwYXJlbnQuaXNCbGFjayA9IGZhbHNlO1xyXG4gICAgICAgICAgZ3JhbmRwYXJlbnQuZml4UmVkQmxhY2soIHRyZWUgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBpZiAoIHBhcmVudCA9PT0gZ3JhbmRwYXJlbnQubGVmdCApIHtcclxuICAgICAgICAgICAgaWYgKCB0aGlzID09PSBwYXJlbnQucmlnaHQgKSB7XHJcbiAgICAgICAgICAgICAgLy8gY2FzZSAyXHJcbiAgICAgICAgICAgICAgcGFyZW50LmxlZnRSb3RhdGUoIHRyZWUgKTtcclxuICAgICAgICAgICAgICBwYXJlbnQucGFyZW50IS5pc0JsYWNrID0gdHJ1ZTtcclxuICAgICAgICAgICAgICBwYXJlbnQucGFyZW50IS5wYXJlbnQhLmlzQmxhY2sgPSBmYWxzZTtcclxuICAgICAgICAgICAgICBwYXJlbnQucGFyZW50IS5wYXJlbnQhLnJpZ2h0Um90YXRlKCB0cmVlICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgLy8gY2FzZSAzXHJcbiAgICAgICAgICAgICAgcGFyZW50LmlzQmxhY2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgIGdyYW5kcGFyZW50LmlzQmxhY2sgPSBmYWxzZTtcclxuICAgICAgICAgICAgICBncmFuZHBhcmVudC5yaWdodFJvdGF0ZSggdHJlZSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCB0aGlzID09PSBwYXJlbnQubGVmdCApIHtcclxuICAgICAgICAgICAgICAvLyBjYXNlIDJcclxuICAgICAgICAgICAgICBwYXJlbnQucmlnaHRSb3RhdGUoIHRyZWUgKTtcclxuICAgICAgICAgICAgICBwYXJlbnQucGFyZW50IS5pc0JsYWNrID0gdHJ1ZTtcclxuICAgICAgICAgICAgICBwYXJlbnQucGFyZW50IS5wYXJlbnQhLmlzQmxhY2sgPSBmYWxzZTtcclxuICAgICAgICAgICAgICBwYXJlbnQucGFyZW50IS5wYXJlbnQhLmxlZnRSb3RhdGUoIHRyZWUgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAvLyBjYXNlIDNcclxuICAgICAgICAgICAgICBwYXJlbnQuaXNCbGFjayA9IHRydWU7XHJcbiAgICAgICAgICAgICAgZ3JhbmRwYXJlbnQuaXNCbGFjayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIGdyYW5kcGFyZW50LmxlZnRSb3RhdGUoIHRyZWUgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZ2dlcnMgYSBzcGxpdCBvZiB3aGF0ZXZlciBpbnRlcnZhbCBjb250YWlucyB0aGlzIHZhbHVlIChvciBpcyBhIG5vLW9wIGlmIHdlIGFscmVhZHkgc3BsaXQgYXQgaXQgYmVmb3JlKS5cclxuICAgKi9cclxuICBwdWJsaWMgc3BsaXQoIG46IG51bWJlciwgdHJlZTogU2VnbWVudFRyZWU8VD4gKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNvbnRhaW5zKCBuICkgKTtcclxuXHJcbiAgICAvLyBJZ25vcmUgc3BsaXRzIGlmIHdlIGFyZSBhbHJlYWR5IHNwbGl0IG9uIHRoZW1cclxuICAgIGlmICggbiA9PT0gdGhpcy5taW4gfHwgbiA9PT0gdGhpcy5tYXggKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMuaGFzQ2hpbGRyZW4oKSApIHtcclxuICAgICAgLy8gSWYgb3VyIHNwbGl0IHZhbHVlIGlzIHRoZSBzYW1lIGFzIG91ciBjdXJyZW50IG9uZSwgd2UndmUgYWxyZWFkeSBzcGxpdCBvbiB0aGF0XHJcbiAgICAgIGlmICggdGhpcy5zcGxpdFZhbHVlICE9PSBuICkge1xyXG4gICAgICAgICggbiA+IHRoaXMuc3BsaXRWYWx1ZSEgPyB0aGlzLnJpZ2h0IDogdGhpcy5sZWZ0ICkhLnNwbGl0KCBuLCB0cmVlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnNwbGl0VmFsdWUgPSBuO1xyXG5cclxuICAgICAgY29uc3QgbmV3TGVmdCA9IFNlZ21lbnROb2RlLnBvb2wuY3JlYXRlKCB0aGlzLnRyZWUsIHRoaXMubWluLCBuICkgYXMgU2VnbWVudE5vZGU8VD47XHJcbiAgICAgIG5ld0xlZnQucGFyZW50ID0gdGhpcztcclxuICAgICAgdGhpcy5sZWZ0ID0gbmV3TGVmdDtcclxuXHJcbiAgICAgIGNvbnN0IG5ld1JpZ2h0ID0gU2VnbWVudE5vZGUucG9vbC5jcmVhdGUoIHRoaXMudHJlZSwgbiwgdGhpcy5tYXggKSBhcyBTZWdtZW50Tm9kZTxUPjtcclxuICAgICAgbmV3UmlnaHQucGFyZW50ID0gdGhpcztcclxuICAgICAgdGhpcy5yaWdodCA9IG5ld1JpZ2h0O1xyXG5cclxuICAgICAgLy8gQ2hlY2sgaWYgd2UgbmVlZCB0byBkbyByZWQtYmxhY2sgdHJlZSBiYWxhbmNpbmdcclxuICAgICAgaWYgKCAhdGhpcy5pc0JsYWNrICYmIHRoaXMucGFyZW50ICkge1xyXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMucGFyZW50O1xyXG4gICAgICAgIGNvbnN0IHNpYmxpbmcgPSBwYXJlbnQub3RoZXJDaGlsZCggdGhpcyApITtcclxuICAgICAgICBpZiAoIHNpYmxpbmcuaXNCbGFjayApIHtcclxuICAgICAgICAgIGlmICggdGhpcyA9PT0gcGFyZW50LmxlZnQgKSB7XHJcbiAgICAgICAgICAgIHBhcmVudC5yaWdodFJvdGF0ZSggdHJlZSApO1xyXG4gICAgICAgICAgICBuZXdMZWZ0LmlzQmxhY2sgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHBhcmVudC5sZWZ0Um90YXRlKCB0cmVlICk7XHJcbiAgICAgICAgICAgIG5ld1JpZ2h0LmlzQmxhY2sgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5maXhSZWRCbGFjayggdHJlZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIGNhc2UgMVxyXG4gICAgICAgICAgdGhpcy5pc0JsYWNrID0gdHJ1ZTtcclxuICAgICAgICAgIHNpYmxpbmcuaXNCbGFjayA9IHRydWU7XHJcbiAgICAgICAgICBwYXJlbnQuaXNCbGFjayA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgIHBhcmVudC5maXhSZWRCbGFjayggdHJlZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVjdXJzaXZlbHkgYWRkcyBhbiBpdGVtXHJcbiAgICovXHJcbiAgcHVibGljIGFkZEl0ZW0oIGl0ZW06IFQsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciApOiB2b2lkIHtcclxuICAgIC8vIElnbm9yZSBuby1vdmVybGFwIGNhc2VzXHJcbiAgICBpZiAoIHRoaXMubWluID4gbWF4IHx8IHRoaXMubWF4IDwgbWluICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLm1pbiA+PSBtaW4gJiYgdGhpcy5tYXggPD0gbWF4ICkge1xyXG4gICAgICAvLyBXZSBhcmUgZnVsbHkgY29udGFpbmVkXHJcbiAgICAgIHRoaXMuaXRlbXMucHVzaCggaXRlbSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuaGFzQ2hpbGRyZW4oKSApIHtcclxuICAgICAgdGhpcy5sZWZ0IS5hZGRJdGVtKCBpdGVtLCBtaW4sIG1heCApO1xyXG4gICAgICB0aGlzLnJpZ2h0IS5hZGRJdGVtKCBpdGVtLCBtaW4sIG1heCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVjdXJzaXZlbHkgcmVtb3ZlcyBhbiBpdGVtXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZUl0ZW0oIGl0ZW06IFQsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciApOiB2b2lkIHtcclxuICAgIC8vIElnbm9yZSBuby1vdmVybGFwIGNhc2VzXHJcbiAgICBpZiAoIHRoaXMubWluID4gbWF4IHx8IHRoaXMubWF4IDwgbWluICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLm1pbiA+PSBtaW4gJiYgdGhpcy5tYXggPD0gbWF4ICkge1xyXG4gICAgICAvLyBXZSBhcmUgZnVsbHkgY29udGFpbmVkXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXRlbXMuaW5jbHVkZXMoIGl0ZW0gKSApO1xyXG4gICAgICBhcnJheVJlbW92ZSggdGhpcy5pdGVtcywgaXRlbSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuaGFzQ2hpbGRyZW4oKSApIHtcclxuICAgICAgdGhpcy5sZWZ0IS5yZW1vdmVJdGVtKCBpdGVtLCBtaW4sIG1heCApO1xyXG4gICAgICB0aGlzLnJpZ2h0IS5yZW1vdmVJdGVtKCBpdGVtLCBtaW4sIG1heCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVjdXJzaXZlbHkgYXVkaXRzIHdpdGggYXNzZXJ0aW9ucywgY2hlY2tpbmcgYWxsIG9mIG91ciBhc3N1bXB0aW9ucy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBlcHNpbG9uXHJcbiAgICogQHBhcmFtIGFsbEl0ZW1zIC0gQWxsIGl0ZW1zIGluIHRoZSB0cmVlXHJcbiAgICogQHBhcmFtIHByZXNlbnRJdGVtcyAtIEVkZ2VzIHRoYXQgd2VyZSBwcmVzZW50IGluIGFuY2VzdG9yc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBhdWRpdCggZXBzaWxvbjogbnVtYmVyLCBhbGxJdGVtczogU2V0PFQ+LCBwcmVzZW50SXRlbXM6IFRbXSA9IFtdICk6IHZvaWQge1xyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIGZvciAoIGNvbnN0IGl0ZW0gb2YgcHJlc2VudEl0ZW1zICkge1xyXG4gICAgICAgIGFzc2VydCggIXRoaXMuaXRlbXMuaW5jbHVkZXMoIGl0ZW0gKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGZvciAoIGNvbnN0IGl0ZW0gb2YgdGhpcy5pdGVtcyApIHtcclxuICAgICAgICAvLyBDb250YWlubWVudCBjaGVjaywgdGhpcyBub2RlIHNob3VsZCBiZSBmdWxseSBjb250YWluZWRcclxuICAgICAgICBhc3NlcnQoIHRoaXMudHJlZS5nZXRNaW5YKCBpdGVtLCBlcHNpbG9uICkgPD0gdGhpcy5taW4gKTtcclxuICAgICAgICBhc3NlcnQoIHRoaXMudHJlZS5nZXRNYXhYKCBpdGVtLCBlcHNpbG9uICkgPj0gdGhpcy5tYXggKTtcclxuICAgICAgfVxyXG4gICAgICBmb3IgKCBjb25zdCBpdGVtIG9mIHByZXNlbnRJdGVtcyApIHtcclxuICAgICAgICBpZiAoIHRoaXMudHJlZS5nZXRNaW5YKCBpdGVtLCBlcHNpbG9uICkgPD0gdGhpcy5taW4gJiYgdGhpcy50cmVlLmdldE1heFgoIGl0ZW0sIGVwc2lsb24gKSA+PSB0aGlzLm1heCApIHtcclxuICAgICAgICAgIGFzc2VydCggYWxsSXRlbXMuaGFzKCBpdGVtICkgfHwgdGhpcy5pdGVtcy5pbmNsdWRlcyggaXRlbSApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBhc3NlcnQoIHRoaXMuaGFzQ2hpbGRyZW4oKSA9PT0gKCB0aGlzLmxlZnQgIT09IG51bGwgKSApO1xyXG4gICAgICBhc3NlcnQoIHRoaXMuaGFzQ2hpbGRyZW4oKSA9PT0gKCB0aGlzLnJpZ2h0ICE9PSBudWxsICkgKTtcclxuICAgICAgYXNzZXJ0KCB0aGlzLmhhc0NoaWxkcmVuKCkgPT09ICggdGhpcy5zcGxpdFZhbHVlICE9PSBudWxsICkgKTtcclxuICAgICAgYXNzZXJ0KCB0aGlzLm1pbiA8IHRoaXMubWF4ICk7XHJcblxyXG4gICAgICBpZiAoIHRoaXMucGFyZW50ICkge1xyXG4gICAgICAgIGFzc2VydCggdGhpcy5wYXJlbnQuaGFzQ2hpbGQoIHRoaXMgKSApO1xyXG4gICAgICAgIGFzc2VydCggdGhpcy5pc0JsYWNrIHx8IHRoaXMucGFyZW50LmlzQmxhY2sgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHRoaXMuaGFzQ2hpbGRyZW4oKSApIHtcclxuICAgICAgICBhc3NlcnQoIHRoaXMubGVmdCEucGFyZW50ID09PSB0aGlzICk7XHJcbiAgICAgICAgYXNzZXJ0KCB0aGlzLnJpZ2h0IS5wYXJlbnQgPT09IHRoaXMgKTtcclxuICAgICAgICBhc3NlcnQoIHRoaXMubWluID09PSB0aGlzLmxlZnQhLm1pbiApO1xyXG4gICAgICAgIGFzc2VydCggdGhpcy5tYXggPT09IHRoaXMucmlnaHQhLm1heCApO1xyXG4gICAgICAgIGFzc2VydCggdGhpcy5zcGxpdFZhbHVlID09PSB0aGlzLmxlZnQhLm1heCApO1xyXG4gICAgICAgIGFzc2VydCggdGhpcy5zcGxpdFZhbHVlID09PSB0aGlzLnJpZ2h0IS5taW4gKTtcclxuXHJcbiAgICAgICAgZm9yICggY29uc3QgaXRlbSBvZiB0aGlzLmxlZnQhLml0ZW1zICkge1xyXG4gICAgICAgICAgYXNzZXJ0KCAhdGhpcy5yaWdodCEuaXRlbXMuaW5jbHVkZXMoIGl0ZW0gKSwgJ1dlIHNob3VsZG5cXCd0IGhhdmUgdHdvIGNoaWxkcmVuIHdpdGggdGhlIHNhbWUgaXRlbScgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNoaWxkUHJlc2VudEl0ZW1zID0gWyAuLi5wcmVzZW50SXRlbXMsIC4uLnRoaXMuaXRlbXMgXTtcclxuICAgICAgICB0aGlzLmxlZnQhLmF1ZGl0KCBlcHNpbG9uLCBhbGxJdGVtcywgY2hpbGRQcmVzZW50SXRlbXMgKTtcclxuICAgICAgICB0aGlzLnJpZ2h0IS5hdWRpdCggZXBzaWxvbiwgYWxsSXRlbXMsIGNoaWxkUHJlc2VudEl0ZW1zICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGBbJHt0aGlzLm1pbn0gJHt0aGlzLm1heH1dIHNwbGl0OiR7dGhpcy5zcGxpdFZhbHVlfSAke3RoaXMuaXNCbGFjayA/ICdibGFjaycgOiAncmVkJ30gJHt0aGlzLml0ZW1zfWA7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZnJlZVRvUG9vbCgpOiB2b2lkIHtcclxuICAgIFNlZ21lbnROb2RlLnBvb2wuZnJlZVRvUG9vbCggdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBwb29sID0gbmV3IFBvb2woIFNlZ21lbnROb2RlICk7XHJcblxyXG59XHJcbmtpdGUucmVnaXN0ZXIoICdTZWdtZW50VHJlZScsIFNlZ21lbnRUcmVlICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLHNDQUFzQztBQUM5RCxPQUFPQyxVQUFVLE1BQU0scUNBQXFDO0FBQzVELE9BQU9DLElBQUksTUFBTSwrQkFBK0I7QUFDaEQsU0FBZUMsSUFBSSxRQUFRLGVBQWU7QUFFMUMsSUFBSUMsUUFBUSxHQUFHLENBQUM7QUFDaEIsTUFBTUMsWUFBb0IsR0FBRyxFQUFFO0FBTy9CLGVBQWUsTUFBZUMsV0FBVyxDQUE4QjtFQUlyRTs7RUFHQTs7RUFHQTtBQUNGO0FBQ0E7QUFDQTtFQUNTQyxXQUFXQSxDQUFFQyxPQUFPLEdBQUcsSUFBSSxFQUFHO0lBQ25DLElBQUksQ0FBQ0MsUUFBUSxHQUFHQyxXQUFXLENBQUNDLElBQUksQ0FBQ0MsTUFBTSxDQUFFLElBQUksRUFB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