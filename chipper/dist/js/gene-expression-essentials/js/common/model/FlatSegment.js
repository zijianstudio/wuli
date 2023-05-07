// Copyright 2015-2020, University of Colorado Boulder

/**
 * Flat segment extends ShapeSegment and has no height, so mRNA contained in this segment is not wound.
 *
 * @author John Blanco
 * @author Mohamed Safi
 * @author Aadish Gupta
 */

import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import GEEConstants from '../GEEConstants.js';
import ShapeSegment from './ShapeSegment.js';
import SquareSegment from './SquareSegment.js';
class FlatSegment extends ShapeSegment {
  /**
   * @param {Object} owner
   * @param {Vector2} origin
   */
  constructor(owner, origin) {
    super(owner);
    this.bounds.setMinMax(origin.x, origin.y, origin.x, origin.y); // make sure bounds height and width is zero
    this.updateAttachmentSitePosition();
  }

  /**
   * @override
   * For a flat segment, the length of mRNA contained is equal to  the width.
   * @returns {number}
   * @public
   */
  getContainedLength() {
    return this.bounds.getWidth();
  }

  /**
   * @override
   * @param {number} length
   * @param {WindingBiomolecule} windingBiomolecule
   * @param {Array.<ShapeSegment>} shapeSegmentList
   * @public
   */
  add(length, windingBiomolecule, shapeSegmentList) {
    // This shouldn't be called if there is no remaining capacity.
    assert && assert(this.getContainedLength() <= this.capacity);
    let growthAmount = length;
    if (this.getContainedLength() + length > this.capacity) {
      // This segment can't hold the specified length. Add a new square segment to the end of the segment list and put
      // the excess in there.
      const newSquareSegment = new SquareSegment(this.owner, this.getLowerRightCornerPosition());
      growthAmount = this.capacity - this.getContainedLength(); // Clamp growth at remaining capacity.
      newSquareSegment.add(length - growthAmount, windingBiomolecule, shapeSegmentList);
      windingBiomolecule.insertAfterShapeSegment(this, newSquareSegment);
    }

    // Grow the bounds linearly to the left to accommodate the additional length.
    this.bounds.setMinMax(this.bounds.x - growthAmount, this.bounds.y, this.bounds.x + this.bounds.getWidth(), this.bounds.y);
    this.updateAttachmentSitePosition();
  }

  /**
   * @override
   * @param {number} length
   * @param {Array.<ShapeSegment>} shapeSegmentList
   * @public
   */
  remove(length, shapeSegmentList) {
    this.bounds.setMinMax(this.bounds.x, this.bounds.y, this.bounds.x + this.bounds.getWidth() - length, this.bounds.y);

    // If the length has gotten to zero, remove this segment from  the list.
    if (this.getContainedLength() < ShapeSegment.FLOATING_POINT_COMP_FACTOR) {
      const index = shapeSegmentList.indexOf(this);
      shapeSegmentList.splice(index, 1);
    }
    this.updateAttachmentSitePosition();
  }

  /**
   * @override
   * @param {number} length
   * @param {WindingBiomolecule} windingBiomolecule
   * @param {Array.<ShapeSegment>} shapeSegmentList
   * @public
   */
  advance(length, windingBiomolecule, shapeSegmentList) {
    let outputSegment = windingBiomolecule.getPreviousShapeSegment(this);
    const inputSegment = windingBiomolecule.getNextShapeSegment(this);
    if (inputSegment === null) {
      // There is no input segment, meaning that the end of the mRNA strand is contained in THIS segment, so this
      // segment needs to shrink.
      const lengthToAdvance = Math.min(length, this.getContainedLength());
      this.remove(lengthToAdvance, shapeSegmentList);
      outputSegment.add(lengthToAdvance, windingBiomolecule, shapeSegmentList);
    } else if (inputSegment.getContainedLength() > length) {
      // The input segment contains enough mRNA length to supply this segment with the needed length.
      if (this.getContainedLength() + length <= this.capacity) {
        // The new length isn't enough to fill up this segment, so this segment just needs to grow.
        this.add(length, windingBiomolecule, shapeSegmentList);
      } else {
        // This segment is full or close enough to being full that it can't accommodate all of the specified length.
        // Some or all of that length must go in the output segment.
        const remainingCapacity = this.getRemainingCapacity();
        if (remainingCapacity > ShapeSegment.FLOATING_POINT_COMP_FACTOR) {
          // Not quite full yet - fill it up.
          this.maxOutLength();
          // This situation - one in which a segment that is having the mRNA advanced through it but it not yet full
          // should only occur when this segment is the first one on the shape segment list. So, add a new one to the
          // front of the segment list, but first, make sure there isn't something there already.

          assert && assert(outputSegment === null);
          const newLeaderSegment = new FlatSegment(this.owner, this.getUpperLeftCornerPosition());
          newLeaderSegment.setCapacity(GEEConstants.LEADER_LENGTH);
          windingBiomolecule.insertBeforeShapeSegment(this, newLeaderSegment);
          outputSegment = newLeaderSegment;
        }
        // Add some or all of the length to the output segment.
        outputSegment.add(length - remainingCapacity, windingBiomolecule, shapeSegmentList);
      }
      // Remove the length from the input segment.
      inputSegment.remove(length, shapeSegmentList);
    } else {
      // The input segment is still around, but doesn't have the specified advancement length within it. Shrink it to
      // zero, which will remove it, and then shrink the advancing segment by the remaining amount.
      this.remove(length - inputSegment.getContainedLength(), shapeSegmentList);
      inputSegment.remove(inputSegment.getContainedLength(), shapeSegmentList);
      outputSegment.add(length, windingBiomolecule, shapeSegmentList);
    }
    this.updateAttachmentSitePosition();
  }

  /**
   * @override
   * @param {number} length
   * @param {WindingBiomolecule} windingBiomolecule
   * @param {Array.<ShapeSegment>} shapeSegmentList
   * @public
   */
  advanceAndRemove(length, windingBiomolecule, shapeSegmentList) {
    const inputSegment = windingBiomolecule.getNextShapeSegment(this);
    if (inputSegment === null) {
      // There is no input segment, meaning that the end of the mRNA strand is contained in THIS segment, so this
      // segment needs to shrink.
      const lengthToRemove = Math.min(length, this.getContainedLength());
      this.remove(lengthToRemove, shapeSegmentList);
    } else if (inputSegment.getContainedLength() > length) {
      // The input segment contains enough mRNA to satisfy this request, so remove the length from there.
      inputSegment.remove(length, shapeSegmentList);
    } else {
      // The input segment is still around, but doesn't have enough mRNA within it. Shrink the input segment to zero
      // and then shrink this segment by the remaining amount.
      this.remove(length - inputSegment.getContainedLength(), shapeSegmentList);
      inputSegment.remove(inputSegment.getContainedLength(), shapeSegmentList);
    }
    this.updateAttachmentSitePosition();
  }

  /**
   * Set size to be exactly the capacity. Do not create any new segments.
   * @private
   */
  maxOutLength() {
    const growthAmount = this.getRemainingCapacity();
    this.bounds.setMinMax(this.bounds.x - growthAmount, this.bounds.minY, this.bounds.x - growthAmount + this.capacity, this.bounds.minY);
    this.updateAttachmentSitePosition();
  }
}
geneExpressionEssentials.register('FlatSegment', FlatSegment);
export default FlatSegment;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMiLCJHRUVDb25zdGFudHMiLCJTaGFwZVNlZ21lbnQiLCJTcXVhcmVTZWdtZW50IiwiRmxhdFNlZ21lbnQiLCJjb25zdHJ1Y3RvciIsIm93bmVyIiwib3JpZ2luIiwiYm91bmRzIiwic2V0TWluTWF4IiwieCIsInkiLCJ1cGRhdGVBdHRhY2htZW50U2l0ZVBvc2l0aW9uIiwiZ2V0Q29udGFpbmVkTGVuZ3RoIiwiZ2V0V2lkdGgiLCJhZGQiLCJsZW5ndGgiLCJ3aW5kaW5nQmlvbW9sZWN1bGUiLCJzaGFwZVNlZ21lbnRMaXN0IiwiYXNzZXJ0IiwiY2FwYWNpdHkiLCJncm93dGhBbW91bnQiLCJuZXdTcXVhcmVTZWdtZW50IiwiZ2V0TG93ZXJSaWdodENvcm5lclBvc2l0aW9uIiwiaW5zZXJ0QWZ0ZXJTaGFwZVNlZ21lbnQiLCJyZW1vdmUiLCJGTE9BVElOR19QT0lOVF9DT01QX0ZBQ1RPUiIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsImFkdmFuY2UiLCJvdXRwdXRTZWdtZW50IiwiZ2V0UHJldmlvdXNTaGFwZVNlZ21lbnQiLCJpbnB1dFNlZ21lbnQiLCJnZXROZXh0U2hhcGVTZWdtZW50IiwibGVuZ3RoVG9BZHZhbmNlIiwiTWF0aCIsIm1pbiIsInJlbWFpbmluZ0NhcGFjaXR5IiwiZ2V0UmVtYWluaW5nQ2FwYWNpdHkiLCJtYXhPdXRMZW5ndGgiLCJuZXdMZWFkZXJTZWdtZW50IiwiZ2V0VXBwZXJMZWZ0Q29ybmVyUG9zaXRpb24iLCJzZXRDYXBhY2l0eSIsIkxFQURFUl9MRU5HVEgiLCJpbnNlcnRCZWZvcmVTaGFwZVNlZ21lbnQiLCJhZHZhbmNlQW5kUmVtb3ZlIiwibGVuZ3RoVG9SZW1vdmUiLCJtaW5ZIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGbGF0U2VnbWVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBGbGF0IHNlZ21lbnQgZXh0ZW5kcyBTaGFwZVNlZ21lbnQgYW5kIGhhcyBubyBoZWlnaHQsIHNvIG1STkEgY29udGFpbmVkIGluIHRoaXMgc2VnbWVudCBpcyBub3Qgd291bmQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBNb2hhbWVkIFNhZmlcclxuICogQGF1dGhvciBBYWRpc2ggR3VwdGFcclxuICovXHJcblxyXG5pbXBvcnQgZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIGZyb20gJy4uLy4uL2dlbmVFeHByZXNzaW9uRXNzZW50aWFscy5qcyc7XHJcbmltcG9ydCBHRUVDb25zdGFudHMgZnJvbSAnLi4vR0VFQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFNoYXBlU2VnbWVudCBmcm9tICcuL1NoYXBlU2VnbWVudC5qcyc7XHJcbmltcG9ydCBTcXVhcmVTZWdtZW50IGZyb20gJy4vU3F1YXJlU2VnbWVudC5qcyc7XHJcblxyXG5jbGFzcyBGbGF0U2VnbWVudCBleHRlbmRzIFNoYXBlU2VnbWVudCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvd25lclxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gb3JpZ2luXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG93bmVyLCBvcmlnaW4gKSB7XHJcbiAgICBzdXBlciggb3duZXIgKTtcclxuICAgIHRoaXMuYm91bmRzLnNldE1pbk1heCggb3JpZ2luLngsIG9yaWdpbi55LCBvcmlnaW4ueCwgb3JpZ2luLnkgKTsgLy8gbWFrZSBzdXJlIGJvdW5kcyBoZWlnaHQgYW5kIHdpZHRoIGlzIHplcm9cclxuICAgIHRoaXMudXBkYXRlQXR0YWNobWVudFNpdGVQb3NpdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogRm9yIGEgZmxhdCBzZWdtZW50LCB0aGUgbGVuZ3RoIG9mIG1STkEgY29udGFpbmVkIGlzIGVxdWFsIHRvICB0aGUgd2lkdGguXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0Q29udGFpbmVkTGVuZ3RoKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLmdldFdpZHRoKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoXHJcbiAgICogQHBhcmFtIHtXaW5kaW5nQmlvbW9sZWN1bGV9IHdpbmRpbmdCaW9tb2xlY3VsZVxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFNoYXBlU2VnbWVudD59IHNoYXBlU2VnbWVudExpc3RcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYWRkKCBsZW5ndGgsIHdpbmRpbmdCaW9tb2xlY3VsZSwgc2hhcGVTZWdtZW50TGlzdCApIHtcclxuXHJcbiAgICAvLyBUaGlzIHNob3VsZG4ndCBiZSBjYWxsZWQgaWYgdGhlcmUgaXMgbm8gcmVtYWluaW5nIGNhcGFjaXR5LlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5nZXRDb250YWluZWRMZW5ndGgoKSA8PSB0aGlzLmNhcGFjaXR5ICk7XHJcbiAgICBsZXQgZ3Jvd3RoQW1vdW50ID0gbGVuZ3RoO1xyXG4gICAgaWYgKCB0aGlzLmdldENvbnRhaW5lZExlbmd0aCgpICsgbGVuZ3RoID4gdGhpcy5jYXBhY2l0eSApIHtcclxuXHJcbiAgICAgIC8vIFRoaXMgc2VnbWVudCBjYW4ndCBob2xkIHRoZSBzcGVjaWZpZWQgbGVuZ3RoLiBBZGQgYSBuZXcgc3F1YXJlIHNlZ21lbnQgdG8gdGhlIGVuZCBvZiB0aGUgc2VnbWVudCBsaXN0IGFuZCBwdXRcclxuICAgICAgLy8gdGhlIGV4Y2VzcyBpbiB0aGVyZS5cclxuICAgICAgY29uc3QgbmV3U3F1YXJlU2VnbWVudCA9IG5ldyBTcXVhcmVTZWdtZW50KCB0aGlzLm93bmVyLCB0aGlzLmdldExvd2VyUmlnaHRDb3JuZXJQb3NpdGlvbigpICk7XHJcbiAgICAgIGdyb3d0aEFtb3VudCA9IHRoaXMuY2FwYWNpdHkgLSB0aGlzLmdldENvbnRhaW5lZExlbmd0aCgpOyAvLyBDbGFtcCBncm93dGggYXQgcmVtYWluaW5nIGNhcGFjaXR5LlxyXG4gICAgICBuZXdTcXVhcmVTZWdtZW50LmFkZCggbGVuZ3RoIC0gZ3Jvd3RoQW1vdW50LCB3aW5kaW5nQmlvbW9sZWN1bGUsIHNoYXBlU2VnbWVudExpc3QgKTtcclxuICAgICAgd2luZGluZ0Jpb21vbGVjdWxlLmluc2VydEFmdGVyU2hhcGVTZWdtZW50KCB0aGlzLCBuZXdTcXVhcmVTZWdtZW50ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR3JvdyB0aGUgYm91bmRzIGxpbmVhcmx5IHRvIHRoZSBsZWZ0IHRvIGFjY29tbW9kYXRlIHRoZSBhZGRpdGlvbmFsIGxlbmd0aC5cclxuICAgIHRoaXMuYm91bmRzLnNldE1pbk1heChcclxuICAgICAgdGhpcy5ib3VuZHMueCAtIGdyb3d0aEFtb3VudCxcclxuICAgICAgdGhpcy5ib3VuZHMueSxcclxuICAgICAgdGhpcy5ib3VuZHMueCArIHRoaXMuYm91bmRzLmdldFdpZHRoKCksXHJcbiAgICAgIHRoaXMuYm91bmRzLnlcclxuICAgICk7XHJcbiAgICB0aGlzLnVwZGF0ZUF0dGFjaG1lbnRTaXRlUG9zaXRpb24oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGhcclxuICAgKiBAcGFyYW0ge0FycmF5LjxTaGFwZVNlZ21lbnQ+fSBzaGFwZVNlZ21lbnRMaXN0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlbW92ZSggbGVuZ3RoLCBzaGFwZVNlZ21lbnRMaXN0ICkge1xyXG4gICAgdGhpcy5ib3VuZHMuc2V0TWluTWF4KCB0aGlzLmJvdW5kcy54LCB0aGlzLmJvdW5kcy55LCB0aGlzLmJvdW5kcy54ICsgdGhpcy5ib3VuZHMuZ2V0V2lkdGgoKSAtIGxlbmd0aCwgdGhpcy5ib3VuZHMueSApO1xyXG5cclxuICAgIC8vIElmIHRoZSBsZW5ndGggaGFzIGdvdHRlbiB0byB6ZXJvLCByZW1vdmUgdGhpcyBzZWdtZW50IGZyb20gIHRoZSBsaXN0LlxyXG4gICAgaWYgKCB0aGlzLmdldENvbnRhaW5lZExlbmd0aCgpIDwgU2hhcGVTZWdtZW50LkZMT0FUSU5HX1BPSU5UX0NPTVBfRkFDVE9SICkge1xyXG4gICAgICBjb25zdCBpbmRleCA9IHNoYXBlU2VnbWVudExpc3QuaW5kZXhPZiggdGhpcyApO1xyXG4gICAgICBzaGFwZVNlZ21lbnRMaXN0LnNwbGljZSggaW5kZXgsIDEgKTtcclxuICAgIH1cclxuICAgIHRoaXMudXBkYXRlQXR0YWNobWVudFNpdGVQb3NpdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aFxyXG4gICAqIEBwYXJhbSB7V2luZGluZ0Jpb21vbGVjdWxlfSB3aW5kaW5nQmlvbW9sZWN1bGVcclxuICAgKiBAcGFyYW0ge0FycmF5LjxTaGFwZVNlZ21lbnQ+fSBzaGFwZVNlZ21lbnRMaXN0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFkdmFuY2UoIGxlbmd0aCwgd2luZGluZ0Jpb21vbGVjdWxlLCBzaGFwZVNlZ21lbnRMaXN0ICkge1xyXG4gICAgbGV0IG91dHB1dFNlZ21lbnQgPSB3aW5kaW5nQmlvbW9sZWN1bGUuZ2V0UHJldmlvdXNTaGFwZVNlZ21lbnQoIHRoaXMgKTtcclxuICAgIGNvbnN0IGlucHV0U2VnbWVudCA9IHdpbmRpbmdCaW9tb2xlY3VsZS5nZXROZXh0U2hhcGVTZWdtZW50KCB0aGlzICk7XHJcbiAgICBpZiAoIGlucHV0U2VnbWVudCA9PT0gbnVsbCApIHtcclxuXHJcbiAgICAgIC8vIFRoZXJlIGlzIG5vIGlucHV0IHNlZ21lbnQsIG1lYW5pbmcgdGhhdCB0aGUgZW5kIG9mIHRoZSBtUk5BIHN0cmFuZCBpcyBjb250YWluZWQgaW4gVEhJUyBzZWdtZW50LCBzbyB0aGlzXHJcbiAgICAgIC8vIHNlZ21lbnQgbmVlZHMgdG8gc2hyaW5rLlxyXG4gICAgICBjb25zdCBsZW5ndGhUb0FkdmFuY2UgPSBNYXRoLm1pbiggbGVuZ3RoLCB0aGlzLmdldENvbnRhaW5lZExlbmd0aCgpICk7XHJcbiAgICAgIHRoaXMucmVtb3ZlKCBsZW5ndGhUb0FkdmFuY2UsIHNoYXBlU2VnbWVudExpc3QgKTtcclxuICAgICAgb3V0cHV0U2VnbWVudC5hZGQoIGxlbmd0aFRvQWR2YW5jZSwgd2luZGluZ0Jpb21vbGVjdWxlLCBzaGFwZVNlZ21lbnRMaXN0ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggaW5wdXRTZWdtZW50LmdldENvbnRhaW5lZExlbmd0aCgpID4gbGVuZ3RoICkge1xyXG5cclxuICAgICAgLy8gVGhlIGlucHV0IHNlZ21lbnQgY29udGFpbnMgZW5vdWdoIG1STkEgbGVuZ3RoIHRvIHN1cHBseSB0aGlzIHNlZ21lbnQgd2l0aCB0aGUgbmVlZGVkIGxlbmd0aC5cclxuICAgICAgaWYgKCB0aGlzLmdldENvbnRhaW5lZExlbmd0aCgpICsgbGVuZ3RoIDw9IHRoaXMuY2FwYWNpdHkgKSB7XHJcblxyXG4gICAgICAgIC8vIFRoZSBuZXcgbGVuZ3RoIGlzbid0IGVub3VnaCB0byBmaWxsIHVwIHRoaXMgc2VnbWVudCwgc28gdGhpcyBzZWdtZW50IGp1c3QgbmVlZHMgdG8gZ3Jvdy5cclxuICAgICAgICB0aGlzLmFkZCggbGVuZ3RoLCB3aW5kaW5nQmlvbW9sZWN1bGUsIHNoYXBlU2VnbWVudExpc3QgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyBUaGlzIHNlZ21lbnQgaXMgZnVsbCBvciBjbG9zZSBlbm91Z2ggdG8gYmVpbmcgZnVsbCB0aGF0IGl0IGNhbid0IGFjY29tbW9kYXRlIGFsbCBvZiB0aGUgc3BlY2lmaWVkIGxlbmd0aC5cclxuICAgICAgICAvLyBTb21lIG9yIGFsbCBvZiB0aGF0IGxlbmd0aCBtdXN0IGdvIGluIHRoZSBvdXRwdXQgc2VnbWVudC5cclxuICAgICAgICBjb25zdCByZW1haW5pbmdDYXBhY2l0eSA9IHRoaXMuZ2V0UmVtYWluaW5nQ2FwYWNpdHkoKTtcclxuICAgICAgICBpZiAoIHJlbWFpbmluZ0NhcGFjaXR5ID4gU2hhcGVTZWdtZW50LkZMT0FUSU5HX1BPSU5UX0NPTVBfRkFDVE9SICkge1xyXG5cclxuICAgICAgICAgIC8vIE5vdCBxdWl0ZSBmdWxsIHlldCAtIGZpbGwgaXQgdXAuXHJcbiAgICAgICAgICB0aGlzLm1heE91dExlbmd0aCgpO1xyXG4gICAgICAgICAgLy8gVGhpcyBzaXR1YXRpb24gLSBvbmUgaW4gd2hpY2ggYSBzZWdtZW50IHRoYXQgaXMgaGF2aW5nIHRoZSBtUk5BIGFkdmFuY2VkIHRocm91Z2ggaXQgYnV0IGl0IG5vdCB5ZXQgZnVsbFxyXG4gICAgICAgICAgLy8gc2hvdWxkIG9ubHkgb2NjdXIgd2hlbiB0aGlzIHNlZ21lbnQgaXMgdGhlIGZpcnN0IG9uZSBvbiB0aGUgc2hhcGUgc2VnbWVudCBsaXN0LiBTbywgYWRkIGEgbmV3IG9uZSB0byB0aGVcclxuICAgICAgICAgIC8vIGZyb250IG9mIHRoZSBzZWdtZW50IGxpc3QsIGJ1dCBmaXJzdCwgbWFrZSBzdXJlIHRoZXJlIGlzbid0IHNvbWV0aGluZyB0aGVyZSBhbHJlYWR5LlxyXG5cclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG91dHB1dFNlZ21lbnQgPT09IG51bGwgKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBuZXdMZWFkZXJTZWdtZW50ID0gbmV3IEZsYXRTZWdtZW50KCB0aGlzLm93bmVyLCB0aGlzLmdldFVwcGVyTGVmdENvcm5lclBvc2l0aW9uKCkgKTtcclxuICAgICAgICAgIG5ld0xlYWRlclNlZ21lbnQuc2V0Q2FwYWNpdHkoIEdFRUNvbnN0YW50cy5MRUFERVJfTEVOR1RIICk7XHJcbiAgICAgICAgICB3aW5kaW5nQmlvbW9sZWN1bGUuaW5zZXJ0QmVmb3JlU2hhcGVTZWdtZW50KCB0aGlzLCBuZXdMZWFkZXJTZWdtZW50ICk7XHJcbiAgICAgICAgICBvdXRwdXRTZWdtZW50ID0gbmV3TGVhZGVyU2VnbWVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQWRkIHNvbWUgb3IgYWxsIG9mIHRoZSBsZW5ndGggdG8gdGhlIG91dHB1dCBzZWdtZW50LlxyXG4gICAgICAgIG91dHB1dFNlZ21lbnQuYWRkKCBsZW5ndGggLSByZW1haW5pbmdDYXBhY2l0eSwgd2luZGluZ0Jpb21vbGVjdWxlLCBzaGFwZVNlZ21lbnRMaXN0ICk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gUmVtb3ZlIHRoZSBsZW5ndGggZnJvbSB0aGUgaW5wdXQgc2VnbWVudC5cclxuICAgICAgaW5wdXRTZWdtZW50LnJlbW92ZSggbGVuZ3RoLCBzaGFwZVNlZ21lbnRMaXN0ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFRoZSBpbnB1dCBzZWdtZW50IGlzIHN0aWxsIGFyb3VuZCwgYnV0IGRvZXNuJ3QgaGF2ZSB0aGUgc3BlY2lmaWVkIGFkdmFuY2VtZW50IGxlbmd0aCB3aXRoaW4gaXQuIFNocmluayBpdCB0b1xyXG4gICAgICAvLyB6ZXJvLCB3aGljaCB3aWxsIHJlbW92ZSBpdCwgYW5kIHRoZW4gc2hyaW5rIHRoZSBhZHZhbmNpbmcgc2VnbWVudCBieSB0aGUgcmVtYWluaW5nIGFtb3VudC5cclxuICAgICAgdGhpcy5yZW1vdmUoIGxlbmd0aCAtIGlucHV0U2VnbWVudC5nZXRDb250YWluZWRMZW5ndGgoKSwgc2hhcGVTZWdtZW50TGlzdCApO1xyXG4gICAgICBpbnB1dFNlZ21lbnQucmVtb3ZlKCBpbnB1dFNlZ21lbnQuZ2V0Q29udGFpbmVkTGVuZ3RoKCksIHNoYXBlU2VnbWVudExpc3QgKTtcclxuICAgICAgb3V0cHV0U2VnbWVudC5hZGQoIGxlbmd0aCwgd2luZGluZ0Jpb21vbGVjdWxlLCBzaGFwZVNlZ21lbnRMaXN0ICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnVwZGF0ZUF0dGFjaG1lbnRTaXRlUG9zaXRpb24oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGhcclxuICAgKiBAcGFyYW0ge1dpbmRpbmdCaW9tb2xlY3VsZX0gd2luZGluZ0Jpb21vbGVjdWxlXHJcbiAgICogQHBhcmFtIHtBcnJheS48U2hhcGVTZWdtZW50Pn0gc2hhcGVTZWdtZW50TGlzdFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhZHZhbmNlQW5kUmVtb3ZlKCBsZW5ndGgsIHdpbmRpbmdCaW9tb2xlY3VsZSwgc2hhcGVTZWdtZW50TGlzdCApIHtcclxuICAgIGNvbnN0IGlucHV0U2VnbWVudCA9IHdpbmRpbmdCaW9tb2xlY3VsZS5nZXROZXh0U2hhcGVTZWdtZW50KCB0aGlzICk7XHJcbiAgICBpZiAoIGlucHV0U2VnbWVudCA9PT0gbnVsbCApIHtcclxuXHJcbiAgICAgIC8vIFRoZXJlIGlzIG5vIGlucHV0IHNlZ21lbnQsIG1lYW5pbmcgdGhhdCB0aGUgZW5kIG9mIHRoZSBtUk5BIHN0cmFuZCBpcyBjb250YWluZWQgaW4gVEhJUyBzZWdtZW50LCBzbyB0aGlzXHJcbiAgICAgIC8vIHNlZ21lbnQgbmVlZHMgdG8gc2hyaW5rLlxyXG4gICAgICBjb25zdCBsZW5ndGhUb1JlbW92ZSA9IE1hdGgubWluKCBsZW5ndGgsIHRoaXMuZ2V0Q29udGFpbmVkTGVuZ3RoKCkgKTtcclxuICAgICAgdGhpcy5yZW1vdmUoIGxlbmd0aFRvUmVtb3ZlLCBzaGFwZVNlZ21lbnRMaXN0ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggaW5wdXRTZWdtZW50LmdldENvbnRhaW5lZExlbmd0aCgpID4gbGVuZ3RoICkge1xyXG5cclxuICAgICAgLy8gVGhlIGlucHV0IHNlZ21lbnQgY29udGFpbnMgZW5vdWdoIG1STkEgdG8gc2F0aXNmeSB0aGlzIHJlcXVlc3QsIHNvIHJlbW92ZSB0aGUgbGVuZ3RoIGZyb20gdGhlcmUuXHJcbiAgICAgIGlucHV0U2VnbWVudC5yZW1vdmUoIGxlbmd0aCwgc2hhcGVTZWdtZW50TGlzdCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIFRoZSBpbnB1dCBzZWdtZW50IGlzIHN0aWxsIGFyb3VuZCwgYnV0IGRvZXNuJ3QgaGF2ZSBlbm91Z2ggbVJOQSB3aXRoaW4gaXQuIFNocmluayB0aGUgaW5wdXQgc2VnbWVudCB0byB6ZXJvXHJcbiAgICAgIC8vIGFuZCB0aGVuIHNocmluayB0aGlzIHNlZ21lbnQgYnkgdGhlIHJlbWFpbmluZyBhbW91bnQuXHJcbiAgICAgIHRoaXMucmVtb3ZlKCBsZW5ndGggLSBpbnB1dFNlZ21lbnQuZ2V0Q29udGFpbmVkTGVuZ3RoKCksIHNoYXBlU2VnbWVudExpc3QgKTtcclxuICAgICAgaW5wdXRTZWdtZW50LnJlbW92ZSggaW5wdXRTZWdtZW50LmdldENvbnRhaW5lZExlbmd0aCgpLCBzaGFwZVNlZ21lbnRMaXN0ICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnVwZGF0ZUF0dGFjaG1lbnRTaXRlUG9zaXRpb24oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBzaXplIHRvIGJlIGV4YWN0bHkgdGhlIGNhcGFjaXR5LiBEbyBub3QgY3JlYXRlIGFueSBuZXcgc2VnbWVudHMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBtYXhPdXRMZW5ndGgoKSB7XHJcbiAgICBjb25zdCBncm93dGhBbW91bnQgPSB0aGlzLmdldFJlbWFpbmluZ0NhcGFjaXR5KCk7XHJcbiAgICB0aGlzLmJvdW5kcy5zZXRNaW5NYXgoIHRoaXMuYm91bmRzLnggLSBncm93dGhBbW91bnQsXHJcbiAgICAgIHRoaXMuYm91bmRzLm1pblksIHRoaXMuYm91bmRzLnggLSBncm93dGhBbW91bnQgKyB0aGlzLmNhcGFjaXR5LFxyXG4gICAgICB0aGlzLmJvdW5kcy5taW5ZICk7XHJcbiAgICB0aGlzLnVwZGF0ZUF0dGFjaG1lbnRTaXRlUG9zaXRpb24oKTtcclxuICB9XHJcbn1cclxuXHJcbmdlbmVFeHByZXNzaW9uRXNzZW50aWFscy5yZWdpc3RlciggJ0ZsYXRTZWdtZW50JywgRmxhdFNlZ21lbnQgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZsYXRTZWdtZW50OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0Esd0JBQXdCLE1BQU0sbUNBQW1DO0FBQ3hFLE9BQU9DLFlBQVksTUFBTSxvQkFBb0I7QUFDN0MsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQUM1QyxPQUFPQyxhQUFhLE1BQU0sb0JBQW9CO0FBRTlDLE1BQU1DLFdBQVcsU0FBU0YsWUFBWSxDQUFDO0VBRXJDO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VHLFdBQVdBLENBQUVDLEtBQUssRUFBRUMsTUFBTSxFQUFHO0lBQzNCLEtBQUssQ0FBRUQsS0FBTSxDQUFDO0lBQ2QsSUFBSSxDQUFDRSxNQUFNLENBQUNDLFNBQVMsQ0FBRUYsTUFBTSxDQUFDRyxDQUFDLEVBQUVILE1BQU0sQ0FBQ0ksQ0FBQyxFQUFFSixNQUFNLENBQUNHLENBQUMsRUFBRUgsTUFBTSxDQUFDSSxDQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pFLElBQUksQ0FBQ0MsNEJBQTRCLENBQUMsQ0FBQztFQUNyQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsa0JBQWtCQSxDQUFBLEVBQUc7SUFDbkIsT0FBTyxJQUFJLENBQUNMLE1BQU0sQ0FBQ00sUUFBUSxDQUFDLENBQUM7RUFDL0I7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsR0FBR0EsQ0FBRUMsTUFBTSxFQUFFQyxrQkFBa0IsRUFBRUMsZ0JBQWdCLEVBQUc7SUFFbEQ7SUFDQUMsTUFBTSxJQUFJQSxNQUFNLENBQUUsSUFBSSxDQUFDTixrQkFBa0IsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDTyxRQUFTLENBQUM7SUFDOUQsSUFBSUMsWUFBWSxHQUFHTCxNQUFN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