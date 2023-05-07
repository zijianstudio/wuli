// Copyright 2015-2023, University of Colorado Boulder

/**
 * Given a rectangular containing area, takes care of allocating and deallocating smaller rectangular "bins" that fit
 * together inside the area and do not overlap. Optimized more for runtime CPU usage than space currently.
 *
 * For example:
 * #begin canvasExample binPacker 256x256
 * #on
 * var binPacker = new phet.dot.BinPacker( new dot.Bounds2( 0, 0, 256, 256 ) );
 * var bins = [];
 * for ( var i = 0; i < 100; i++ ) {
 *   var bin = binPacker.allocate( Math.random() * 64, Math.random() * 64 );
 *   if ( bin ) {
 *     bins.push( bin );
 *   }
 * }
 * #off
 *
 * context.strokeStyle = '#000';
 * bins.forEach( function( bin ) {
 *   var bounds = bin.bounds;
 *   context.strokeRect( bounds.x, bounds.y, bounds.width, bounds.height );
 * } );
 * #end canvasExample
 *
 * @author Sharfudeen Ashraf
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from './Bounds2.js';
import dot from './dot.js';
export default class BinPacker {
  /**
   * Creates a BinPacker with the specified containing bounds.
   *
   * @param bounds - The available bounds to pack bins inside.
   */
  constructor(bounds) {
    this.rootBin = new Bin(bounds, null);
  }

  /**
   * Allocates a bin with the specified width and height if possible (returning a {Bin}), otherwise returns null.
   */
  allocate(width, height) {
    // find a leaf bin that has available room (or null)
    const bin = this.rootBin.findAvailableBin(width, height);
    if (bin) {
      // split it into a sized sub-bin for our purpose that we will use, and other bins for future allocations
      const sizedBin = bin.split(width, height);

      // mark our bin as used
      sizedBin.use();
      return sizedBin;
    } else {
      return null;
    }
  }

  /**
   * Deallocates a bin, so that its area can be reused by future allocations.
   *
   * @param bin - The bin that was returned from allocate().
   */
  deallocate(bin) {
    bin.unuse();
  }
  toString() {
    let result = '';
    let padding = '';
    function binTree(bin) {
      result += `${padding + bin.toString()}\n`;
      padding = `${padding}  `;
      _.each(bin.children, binTree);
      padding = padding.substring(2);
    }
    binTree(this.rootBin);
    return result;
  }
}
dot.register('BinPacker', BinPacker);
export class Bin {
  // Our containing bounds

  // Parent bin, if applicable

  // Whether our children are responsible for our area

  // Whether we are marked as a bin that is used

  // (dot-internal)
  /**
   * A rectangular bin that can be used itself or split into sub-bins.
   */
  constructor(bounds, parent) {
    this.bounds = bounds;
    this.parent = parent;
    this.isSplit = false;
    this.isUsed = false;
    this.children = [];
  }

  /**
   * Finds an unused bin with open area that is at least width-x-height in size. (dot-internal)
   */
  findAvailableBin(width, height) {
    assert && assert(width > 0 && height > 0, 'Empty bin requested?');

    // If we are marked as used ourself, we can't be used
    if (this.isUsed) {
      return null;
    }
    // If our bounds can't fit it, skip this entire sub-tree
    else if (this.bounds.width < width || this.bounds.height < height) {
      return null;
    }
    // If we have been split, check our children
    else if (this.isSplit) {
      for (let i = 0; i < this.children.length; i++) {
        const result = this.children[i].findAvailableBin(width, height);
        if (result) {
          return result;
        }
      }
      // No child can fit the area
      return null;
    }
    // Otherwise we are free and our dimensions are compatible (checked above)
    else {
      return this;
    }
  }

  /**
   * Splits this bin into multiple child bins, and returns the child with the dimensions (width,height). (dot-internal)
   */
  split(width, height) {
    assert && assert(this.bounds.width >= width && this.bounds.height >= height, 'Bin does not have space');
    assert && assert(!this.isSplit, 'Bin should not be re-split');
    assert && assert(!this.isUsed, 'Bin should not be split when used');
    assert && assert(width > 0 && height > 0, 'Empty bin requested?');

    // if our dimensions match exactly, don't split (return ourself)
    if (width === this.bounds.width && height === this.bounds.height) {
      return this;
    }

    // mark as split
    this.isSplit = true;

    // locations of the split
    const splitX = this.bounds.minX + width;
    const splitY = this.bounds.minY + height;

    /*
     * How an area is split (for now). In the future, splitting more after determining what we need to fit next would
     * potentially be better, but this preserves the width better (which many times we need).
     *
     *   ************************************
     *   *                  *               *
     *   *                  *               *
     *   *       main       *     right     *
     *   * (width x height) *               *
     *   *                  *               *
     *   ************************************
     *   *                                  *
     *   *              bottom              *
     *   *                                  *
     *   ************************************
     */
    const mainBounds = new Bounds2(this.bounds.minX, this.bounds.minY, splitX, splitY);
    const rightBounds = new Bounds2(splitX, this.bounds.minY, this.bounds.maxX, splitY);
    const bottomBounds = new Bounds2(this.bounds.minX, splitY, this.bounds.maxX, this.bounds.maxY);
    const mainBin = new Bin(mainBounds, this);
    this.children.push(mainBin);

    // only add right/bottom if they take up area
    if (rightBounds.hasNonzeroArea()) {
      this.children.push(new Bin(rightBounds, this));
    }
    if (bottomBounds.hasNonzeroArea()) {
      this.children.push(new Bin(bottomBounds, this));
    }
    return mainBin;
  }

  /**
   * Mark this bin as used. (dot-internal)
   */
  use() {
    assert && assert(!this.isSplit, 'Should not mark a split bin as used');
    assert && assert(!this.isUsed, 'Should not mark a used bin as used');
    this.isUsed = true;
  }

  /**
   * Mark this bin as not used, and attempt to collapse split parents if all children are unused. (dot-internal)
   */
  unuse() {
    assert && assert(this.isUsed, 'Can only unuse a used instance');
    this.isUsed = false;
    this.parent && this.parent.attemptToCollapse();
  }

  /**
   * If our bin can be collapsed (it is split and has children that are not used AND not split), then we will become
   * not split, and will remove our children. If successful, it will also call this on our parent, fully attempting
   * to clean up unused data structures.
   */
  attemptToCollapse() {
    assert && assert(this.isSplit, 'Should only attempt to collapse split bins');

    // Bail out if a single child isn't able to be collapsed. If it is not split or used, it won't have any children
    // or needs.
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (child.isSplit || child.isUsed) {
        return;
      }
    }

    // We can now collapse ourselves neatly
    this.children = [];
    this.isSplit = false;

    // And attempt to collapse our parent
    this.parent && this.parent.attemptToCollapse();
  }
  toString() {
    return this.bounds.toString() + (this.isUsed ? ' used' : '');
  }
}
BinPacker.Bin = Bin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiZG90IiwiQmluUGFja2VyIiwiY29uc3RydWN0b3IiLCJib3VuZHMiLCJyb290QmluIiwiQmluIiwiYWxsb2NhdGUiLCJ3aWR0aCIsImhlaWdodCIsImJpbiIsImZpbmRBdmFpbGFibGVCaW4iLCJzaXplZEJpbiIsInNwbGl0IiwidXNlIiwiZGVhbGxvY2F0ZSIsInVudXNlIiwidG9TdHJpbmciLCJyZXN1bHQiLCJwYWRkaW5nIiwiYmluVHJlZSIsIl8iLCJlYWNoIiwiY2hpbGRyZW4iLCJzdWJzdHJpbmciLCJyZWdpc3RlciIsInBhcmVudCIsImlzU3BsaXQiLCJpc1VzZWQiLCJhc3NlcnQiLCJpIiwibGVuZ3RoIiwic3BsaXRYIiwibWluWCIsInNwbGl0WSIsIm1pblkiLCJtYWluQm91bmRzIiwicmlnaHRCb3VuZHMiLCJtYXhYIiwiYm90dG9tQm91bmRzIiwibWF4WSIsIm1haW5CaW4iLCJwdXNoIiwiaGFzTm9uemVyb0FyZWEiLCJhdHRlbXB0VG9Db2xsYXBzZSIsImNoaWxkIl0sInNvdXJjZXMiOlsiQmluUGFja2VyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEdpdmVuIGEgcmVjdGFuZ3VsYXIgY29udGFpbmluZyBhcmVhLCB0YWtlcyBjYXJlIG9mIGFsbG9jYXRpbmcgYW5kIGRlYWxsb2NhdGluZyBzbWFsbGVyIHJlY3Rhbmd1bGFyIFwiYmluc1wiIHRoYXQgZml0XHJcbiAqIHRvZ2V0aGVyIGluc2lkZSB0aGUgYXJlYSBhbmQgZG8gbm90IG92ZXJsYXAuIE9wdGltaXplZCBtb3JlIGZvciBydW50aW1lIENQVSB1c2FnZSB0aGFuIHNwYWNlIGN1cnJlbnRseS5cclxuICpcclxuICogRm9yIGV4YW1wbGU6XHJcbiAqICNiZWdpbiBjYW52YXNFeGFtcGxlIGJpblBhY2tlciAyNTZ4MjU2XHJcbiAqICNvblxyXG4gKiB2YXIgYmluUGFja2VyID0gbmV3IHBoZXQuZG90LkJpblBhY2tlciggbmV3IGRvdC5Cb3VuZHMyKCAwLCAwLCAyNTYsIDI1NiApICk7XHJcbiAqIHZhciBiaW5zID0gW107XHJcbiAqIGZvciAoIHZhciBpID0gMDsgaSA8IDEwMDsgaSsrICkge1xyXG4gKiAgIHZhciBiaW4gPSBiaW5QYWNrZXIuYWxsb2NhdGUoIE1hdGgucmFuZG9tKCkgKiA2NCwgTWF0aC5yYW5kb20oKSAqIDY0ICk7XHJcbiAqICAgaWYgKCBiaW4gKSB7XHJcbiAqICAgICBiaW5zLnB1c2goIGJpbiApO1xyXG4gKiAgIH1cclxuICogfVxyXG4gKiAjb2ZmXHJcbiAqXHJcbiAqIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnIzAwMCc7XHJcbiAqIGJpbnMuZm9yRWFjaCggZnVuY3Rpb24oIGJpbiApIHtcclxuICogICB2YXIgYm91bmRzID0gYmluLmJvdW5kcztcclxuICogICBjb250ZXh0LnN0cm9rZVJlY3QoIGJvdW5kcy54LCBib3VuZHMueSwgYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0ICk7XHJcbiAqIH0gKTtcclxuICogI2VuZCBjYW52YXNFeGFtcGxlXHJcbiAqXHJcbiAqIEBhdXRob3IgU2hhcmZ1ZGVlbiBBc2hyYWZcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4vQm91bmRzMi5qcyc7XHJcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmluUGFja2VyIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSByb290QmluOiBCaW47XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBCaW5QYWNrZXIgd2l0aCB0aGUgc3BlY2lmaWVkIGNvbnRhaW5pbmcgYm91bmRzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGJvdW5kcyAtIFRoZSBhdmFpbGFibGUgYm91bmRzIHRvIHBhY2sgYmlucyBpbnNpZGUuXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBib3VuZHM6IEJvdW5kczIgKSB7XHJcbiAgICB0aGlzLnJvb3RCaW4gPSBuZXcgQmluKCBib3VuZHMsIG51bGwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFsbG9jYXRlcyBhIGJpbiB3aXRoIHRoZSBzcGVjaWZpZWQgd2lkdGggYW5kIGhlaWdodCBpZiBwb3NzaWJsZSAocmV0dXJuaW5nIGEge0Jpbn0pLCBvdGhlcndpc2UgcmV0dXJucyBudWxsLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhbGxvY2F0ZSggd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKTogQmluIHwgbnVsbCB7XHJcbiAgICAvLyBmaW5kIGEgbGVhZiBiaW4gdGhhdCBoYXMgYXZhaWxhYmxlIHJvb20gKG9yIG51bGwpXHJcbiAgICBjb25zdCBiaW4gPSB0aGlzLnJvb3RCaW4uZmluZEF2YWlsYWJsZUJpbiggd2lkdGgsIGhlaWdodCApO1xyXG5cclxuICAgIGlmICggYmluICkge1xyXG4gICAgICAvLyBzcGxpdCBpdCBpbnRvIGEgc2l6ZWQgc3ViLWJpbiBmb3Igb3VyIHB1cnBvc2UgdGhhdCB3ZSB3aWxsIHVzZSwgYW5kIG90aGVyIGJpbnMgZm9yIGZ1dHVyZSBhbGxvY2F0aW9uc1xyXG4gICAgICBjb25zdCBzaXplZEJpbiA9IGJpbi5zcGxpdCggd2lkdGgsIGhlaWdodCApO1xyXG5cclxuICAgICAgLy8gbWFyayBvdXIgYmluIGFzIHVzZWRcclxuICAgICAgc2l6ZWRCaW4udXNlKCk7XHJcblxyXG4gICAgICByZXR1cm4gc2l6ZWRCaW47XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZWFsbG9jYXRlcyBhIGJpbiwgc28gdGhhdCBpdHMgYXJlYSBjYW4gYmUgcmV1c2VkIGJ5IGZ1dHVyZSBhbGxvY2F0aW9ucy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBiaW4gLSBUaGUgYmluIHRoYXQgd2FzIHJldHVybmVkIGZyb20gYWxsb2NhdGUoKS5cclxuICAgKi9cclxuICBwdWJsaWMgZGVhbGxvY2F0ZSggYmluOiBCaW4gKTogdm9pZCB7XHJcbiAgICBiaW4udW51c2UoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xyXG4gICAgbGV0IHJlc3VsdCA9ICcnO1xyXG5cclxuICAgIGxldCBwYWRkaW5nID0gJyc7XHJcblxyXG4gICAgZnVuY3Rpb24gYmluVHJlZSggYmluOiBCaW4gKTogdm9pZCB7XHJcbiAgICAgIHJlc3VsdCArPSBgJHtwYWRkaW5nICsgYmluLnRvU3RyaW5nKCl9XFxuYDtcclxuICAgICAgcGFkZGluZyA9IGAke3BhZGRpbmd9ICBgO1xyXG4gICAgICBfLmVhY2goIGJpbi5jaGlsZHJlbiwgYmluVHJlZSApO1xyXG4gICAgICBwYWRkaW5nID0gcGFkZGluZy5zdWJzdHJpbmcoIDIgKTtcclxuICAgIH1cclxuXHJcbiAgICBiaW5UcmVlKCB0aGlzLnJvb3RCaW4gKTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBCaW46IHR5cGVvZiBCaW47XHJcbn1cclxuXHJcbmRvdC5yZWdpc3RlciggJ0JpblBhY2tlcicsIEJpblBhY2tlciApO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJpbiB7XHJcblxyXG4gIC8vIE91ciBjb250YWluaW5nIGJvdW5kc1xyXG4gIHB1YmxpYyBib3VuZHM6IEJvdW5kczI7XHJcblxyXG4gIC8vIFBhcmVudCBiaW4sIGlmIGFwcGxpY2FibGVcclxuICBwcml2YXRlIHBhcmVudDogQmluIHwgbnVsbDtcclxuXHJcbiAgLy8gV2hldGhlciBvdXIgY2hpbGRyZW4gYXJlIHJlc3BvbnNpYmxlIGZvciBvdXIgYXJlYVxyXG4gIHByaXZhdGUgaXNTcGxpdDogYm9vbGVhbjtcclxuXHJcbiAgLy8gV2hldGhlciB3ZSBhcmUgbWFya2VkIGFzIGEgYmluIHRoYXQgaXMgdXNlZFxyXG4gIHByaXZhdGUgaXNVc2VkOiBib29sZWFuO1xyXG5cclxuICBwdWJsaWMgY2hpbGRyZW46IEJpbltdOyAvLyAoZG90LWludGVybmFsKVxyXG5cclxuICAvKipcclxuICAgKiBBIHJlY3Rhbmd1bGFyIGJpbiB0aGF0IGNhbiBiZSB1c2VkIGl0c2VsZiBvciBzcGxpdCBpbnRvIHN1Yi1iaW5zLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYm91bmRzOiBCb3VuZHMyLCBwYXJlbnQ6IEJpbiB8IG51bGwgKSB7XHJcbiAgICB0aGlzLmJvdW5kcyA9IGJvdW5kcztcclxuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xyXG4gICAgdGhpcy5pc1NwbGl0ID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzVXNlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmluZHMgYW4gdW51c2VkIGJpbiB3aXRoIG9wZW4gYXJlYSB0aGF0IGlzIGF0IGxlYXN0IHdpZHRoLXgtaGVpZ2h0IGluIHNpemUuIChkb3QtaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGZpbmRBdmFpbGFibGVCaW4oIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyICk6IEJpbiB8IG51bGwge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggd2lkdGggPiAwICYmIGhlaWdodCA+IDAsICdFbXB0eSBiaW4gcmVxdWVzdGVkPycgKTtcclxuXHJcbiAgICAvLyBJZiB3ZSBhcmUgbWFya2VkIGFzIHVzZWQgb3Vyc2VsZiwgd2UgY2FuJ3QgYmUgdXNlZFxyXG4gICAgaWYgKCB0aGlzLmlzVXNlZCApIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICAvLyBJZiBvdXIgYm91bmRzIGNhbid0IGZpdCBpdCwgc2tpcCB0aGlzIGVudGlyZSBzdWItdHJlZVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuYm91bmRzLndpZHRoIDwgd2lkdGggfHwgdGhpcy5ib3VuZHMuaGVpZ2h0IDwgaGVpZ2h0ICkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIC8vIElmIHdlIGhhdmUgYmVlbiBzcGxpdCwgY2hlY2sgb3VyIGNoaWxkcmVuXHJcbiAgICBlbHNlIGlmICggdGhpcy5pc1NwbGl0ICkge1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuY2hpbGRyZW5bIGkgXS5maW5kQXZhaWxhYmxlQmluKCB3aWR0aCwgaGVpZ2h0ICk7XHJcbiAgICAgICAgaWYgKCByZXN1bHQgKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvLyBObyBjaGlsZCBjYW4gZml0IHRoZSBhcmVhXHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgLy8gT3RoZXJ3aXNlIHdlIGFyZSBmcmVlIGFuZCBvdXIgZGltZW5zaW9ucyBhcmUgY29tcGF0aWJsZSAoY2hlY2tlZCBhYm92ZSlcclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNwbGl0cyB0aGlzIGJpbiBpbnRvIG11bHRpcGxlIGNoaWxkIGJpbnMsIGFuZCByZXR1cm5zIHRoZSBjaGlsZCB3aXRoIHRoZSBkaW1lbnNpb25zICh3aWR0aCxoZWlnaHQpLiAoZG90LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzcGxpdCggd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKTogQmluIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYm91bmRzLndpZHRoID49IHdpZHRoICYmIHRoaXMuYm91bmRzLmhlaWdodCA+PSBoZWlnaHQsXHJcbiAgICAgICdCaW4gZG9lcyBub3QgaGF2ZSBzcGFjZScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzU3BsaXQsICdCaW4gc2hvdWxkIG5vdCBiZSByZS1zcGxpdCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzVXNlZCwgJ0JpbiBzaG91bGQgbm90IGJlIHNwbGl0IHdoZW4gdXNlZCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdpZHRoID4gMCAmJiBoZWlnaHQgPiAwLCAnRW1wdHkgYmluIHJlcXVlc3RlZD8nICk7XHJcblxyXG4gICAgLy8gaWYgb3VyIGRpbWVuc2lvbnMgbWF0Y2ggZXhhY3RseSwgZG9uJ3Qgc3BsaXQgKHJldHVybiBvdXJzZWxmKVxyXG4gICAgaWYgKCB3aWR0aCA9PT0gdGhpcy5ib3VuZHMud2lkdGggJiYgaGVpZ2h0ID09PSB0aGlzLmJvdW5kcy5oZWlnaHQgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1hcmsgYXMgc3BsaXRcclxuICAgIHRoaXMuaXNTcGxpdCA9IHRydWU7XHJcblxyXG4gICAgLy8gbG9jYXRpb25zIG9mIHRoZSBzcGxpdFxyXG4gICAgY29uc3Qgc3BsaXRYID0gdGhpcy5ib3VuZHMubWluWCArIHdpZHRoO1xyXG4gICAgY29uc3Qgc3BsaXRZID0gdGhpcy5ib3VuZHMubWluWSArIGhlaWdodDtcclxuXHJcbiAgICAvKlxyXG4gICAgICogSG93IGFuIGFyZWEgaXMgc3BsaXQgKGZvciBub3cpLiBJbiB0aGUgZnV0dXJlLCBzcGxpdHRpbmcgbW9yZSBhZnRlciBkZXRlcm1pbmluZyB3aGF0IHdlIG5lZWQgdG8gZml0IG5leHQgd291bGRcclxuICAgICAqIHBvdGVudGlhbGx5IGJlIGJldHRlciwgYnV0IHRoaXMgcHJlc2VydmVzIHRoZSB3aWR0aCBiZXR0ZXIgKHdoaWNoIG1hbnkgdGltZXMgd2UgbmVlZCkuXHJcbiAgICAgKlxyXG4gICAgICogICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqICAgKiAgICAgICAgICAgICAgICAgICogICAgICAgICAgICAgICAqXHJcbiAgICAgKiAgICogICAgICAgICAgICAgICAgICAqICAgICAgICAgICAgICAgKlxyXG4gICAgICogICAqICAgICAgIG1haW4gICAgICAgKiAgICAgcmlnaHQgICAgICpcclxuICAgICAqICAgKiAod2lkdGggeCBoZWlnaHQpICogICAgICAgICAgICAgICAqXHJcbiAgICAgKiAgICogICAgICAgICAgICAgICAgICAqICAgICAgICAgICAgICAgKlxyXG4gICAgICogICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXHJcbiAgICAgKiAgICogICAgICAgICAgICAgIGJvdHRvbSAgICAgICAgICAgICAgKlxyXG4gICAgICogICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcclxuICAgICAqICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IG1haW5Cb3VuZHMgPSBuZXcgQm91bmRzMiggdGhpcy5ib3VuZHMubWluWCwgdGhpcy5ib3VuZHMubWluWSwgc3BsaXRYLCBzcGxpdFkgKTtcclxuICAgIGNvbnN0IHJpZ2h0Qm91bmRzID0gbmV3IEJvdW5kczIoIHNwbGl0WCwgdGhpcy5ib3VuZHMubWluWSwgdGhpcy5ib3VuZHMubWF4WCwgc3BsaXRZICk7XHJcbiAgICBjb25zdCBib3R0b21Cb3VuZHMgPSBuZXcgQm91bmRzMiggdGhpcy5ib3VuZHMubWluWCwgc3BsaXRZLCB0aGlzLmJvdW5kcy5tYXhYLCB0aGlzLmJvdW5kcy5tYXhZICk7XHJcblxyXG4gICAgY29uc3QgbWFpbkJpbiA9IG5ldyBCaW4oIG1haW5Cb3VuZHMsIHRoaXMgKTtcclxuICAgIHRoaXMuY2hpbGRyZW4ucHVzaCggbWFpbkJpbiApO1xyXG5cclxuICAgIC8vIG9ubHkgYWRkIHJpZ2h0L2JvdHRvbSBpZiB0aGV5IHRha2UgdXAgYXJlYVxyXG4gICAgaWYgKCByaWdodEJvdW5kcy5oYXNOb256ZXJvQXJlYSgpICkge1xyXG4gICAgICB0aGlzLmNoaWxkcmVuLnB1c2goIG5ldyBCaW4oIHJpZ2h0Qm91bmRzLCB0aGlzICkgKTtcclxuICAgIH1cclxuICAgIGlmICggYm90dG9tQm91bmRzLmhhc05vbnplcm9BcmVhKCkgKSB7XHJcbiAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaCggbmV3IEJpbiggYm90dG9tQm91bmRzLCB0aGlzICkgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbWFpbkJpbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcmsgdGhpcyBiaW4gYXMgdXNlZC4gKGRvdC1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgdXNlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaXNTcGxpdCwgJ1Nob3VsZCBub3QgbWFyayBhIHNwbGl0IGJpbiBhcyB1c2VkJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaXNVc2VkLCAnU2hvdWxkIG5vdCBtYXJrIGEgdXNlZCBiaW4gYXMgdXNlZCcgKTtcclxuXHJcbiAgICB0aGlzLmlzVXNlZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXJrIHRoaXMgYmluIGFzIG5vdCB1c2VkLCBhbmQgYXR0ZW1wdCB0byBjb2xsYXBzZSBzcGxpdCBwYXJlbnRzIGlmIGFsbCBjaGlsZHJlbiBhcmUgdW51c2VkLiAoZG90LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyB1bnVzZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNVc2VkLCAnQ2FuIG9ubHkgdW51c2UgYSB1c2VkIGluc3RhbmNlJyApO1xyXG5cclxuICAgIHRoaXMuaXNVc2VkID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQuYXR0ZW1wdFRvQ29sbGFwc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElmIG91ciBiaW4gY2FuIGJlIGNvbGxhcHNlZCAoaXQgaXMgc3BsaXQgYW5kIGhhcyBjaGlsZHJlbiB0aGF0IGFyZSBub3QgdXNlZCBBTkQgbm90IHNwbGl0KSwgdGhlbiB3ZSB3aWxsIGJlY29tZVxyXG4gICAqIG5vdCBzcGxpdCwgYW5kIHdpbGwgcmVtb3ZlIG91ciBjaGlsZHJlbi4gSWYgc3VjY2Vzc2Z1bCwgaXQgd2lsbCBhbHNvIGNhbGwgdGhpcyBvbiBvdXIgcGFyZW50LCBmdWxseSBhdHRlbXB0aW5nXHJcbiAgICogdG8gY2xlYW4gdXAgdW51c2VkIGRhdGEgc3RydWN0dXJlcy5cclxuICAgKi9cclxuICBwcml2YXRlIGF0dGVtcHRUb0NvbGxhcHNlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc1NwbGl0LCAnU2hvdWxkIG9ubHkgYXR0ZW1wdCB0byBjb2xsYXBzZSBzcGxpdCBiaW5zJyApO1xyXG5cclxuICAgIC8vIEJhaWwgb3V0IGlmIGEgc2luZ2xlIGNoaWxkIGlzbid0IGFibGUgdG8gYmUgY29sbGFwc2VkLiBJZiBpdCBpcyBub3Qgc3BsaXQgb3IgdXNlZCwgaXQgd29uJ3QgaGF2ZSBhbnkgY2hpbGRyZW5cclxuICAgIC8vIG9yIG5lZWRzLlxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLmNoaWxkcmVuWyBpIF07XHJcblxyXG4gICAgICBpZiAoIGNoaWxkLmlzU3BsaXQgfHwgY2hpbGQuaXNVc2VkICkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFdlIGNhbiBub3cgY29sbGFwc2Ugb3Vyc2VsdmVzIG5lYXRseVxyXG4gICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xyXG4gICAgdGhpcy5pc1NwbGl0ID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQW5kIGF0dGVtcHQgdG8gY29sbGFwc2Ugb3VyIHBhcmVudFxyXG4gICAgdGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQuYXR0ZW1wdFRvQ29sbGFwc2UoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLnRvU3RyaW5nKCkgKyAoIHRoaXMuaXNVc2VkID8gJyB1c2VkJyA6ICcnICk7XHJcbiAgfVxyXG59XHJcblxyXG5CaW5QYWNrZXIuQmluID0gQmluO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sY0FBYztBQUNsQyxPQUFPQyxHQUFHLE1BQU0sVUFBVTtBQUUxQixlQUFlLE1BQU1DLFNBQVMsQ0FBQztFQUk3QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ1NDLFdBQVdBLENBQUVDLE1BQWUsRUFBRztJQUNwQyxJQUFJLENBQUNDLE9BQU8sR0FBRyxJQUFJQyxHQUFHLENBQUVGLE1BQU0sRUFBRSxJQUFLLENBQUM7RUFDeEM7O0VBRUE7QUFDRjtBQUNBO0VBQ1NHLFFBQVFBLENBQUVDLEtBQWEsRUFBRUMsTUFBYyxFQUFlO0lBQzNEO0lBQ0EsTUFBTUMsR0FBRyxHQUFHLElBQUksQ0FBQ0wsT0FBTyxDQUFDTSxnQkFBZ0IsQ0FBRUgsS0FBSyxFQUFFQyxNQUFPLENBQUM7SUFFMUQsSUFBS0MsR0FBRyxFQUFHO01BQ1Q7TUFDQSxNQUFNRSxRQUFRLEdBQUdGLEdBQUcsQ0FBQ0csS0FBSyxDQUFFTCxLQUFL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