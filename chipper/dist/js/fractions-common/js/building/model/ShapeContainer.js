// Copyright 2018-2020, University of Colorado Boulder

/**
 * Represents an area of value 1 that can hold shape pieces that in total can sum up to 1.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import fractionsCommon from '../../fractionsCommon.js';
import BuildingRepresentation from './BuildingRepresentation.js';
import ShapePiece from './ShapePiece.js';
const scratchVector = new Vector2(0, 0); // Used as a shared Vector2 so that we can avoid allocating vectors dynamically.

class ShapeContainer {
  /**
   * @param {ShapeGroup} shapeGroup - So far it is easier to pass through this reference (no need for 1 container).
   * @param {Property.<number>} partitionDenominatorProperty
   * @param {BuildingRepresentation} representation
   * @param {Emitter} changedEmitter
   * @param {Vector2} offset - Offset from the ShapeGroup's origin
   */
  constructor(shapeGroup, partitionDenominatorProperty, representation, changedEmitter, offset) {
    // @public {ShapeGroup} shapeGroup
    this.shapeGroup = shapeGroup;

    // @public {Property.<number>}
    this.partitionDenominatorProperty = partitionDenominatorProperty;

    // @public {BuildingRepresentation}
    this.representation = representation;

    // @public {Emitter}
    this.changedEmitter = changedEmitter;

    // @public {Vector2}
    this.offset = offset;

    // @public {ObservableArrayDef.<ShapePiece>}
    this.shapePieces = createObservableArray();

    // @public {Property.<Fraction>}
    this.totalFractionProperty = new Property(new Fraction(0, 1));

    // Keep totalFractionProperty up-to-date
    this.shapePieces.addItemAddedListener(shapePiece => {
      this.totalFractionProperty.value = this.totalFractionProperty.value.plus(shapePiece.fraction).reduced();
      this.changedEmitter.emit();
    });
    this.shapePieces.addItemRemovedListener(shapePiece => {
      this.totalFractionProperty.value = this.totalFractionProperty.value.minus(shapePiece.fraction).reduced();
      this.changedEmitter.emit();
    });
  }

  /**
   * Returns whether the ShapePiece can be placed into this container.
   * @public
   *
   * @param {ShapePiece} shapePiece
   * @returns {boolean}
   */
  canFitPiece(shapePiece) {
    if (shapePiece.representation !== this.representation) {
      return false;
    }
    const potentialTotalFraction = this.totalFractionProperty.value.plus(shapePiece.fraction).reduce();
    return potentialTotalFraction.isLessThan(Fraction.ONE) || potentialTotalFraction.equals(Fraction.ONE);
  }

  /**
   * Returns the distance of a point from this container.
   * @public
   *
   * @param {Vector2} point
   * @returns {number}
   */
  distanceFromPoint(point) {
    // Subtract off our local offset
    const localPoint = scratchVector.set(point).subtract(this.offset);
    if (this.representation === BuildingRepresentation.PIE) {
      return Math.max(0, localPoint.magnitude - FractionsCommonConstants.SHAPE_SIZE / 2);
    } else if (this.representation === BuildingRepresentation.BAR) {
      return Math.sqrt(ShapePiece.VERTICAL_BAR_BOUNDS.minimumDistanceToPointSquared(localPoint));
    } else {
      throw new Error(`Unsupported representation for ShapeContainer: ${this.representation}`);
    }
  }

  /**
   * Returns the value (from 0 to 1) of where this piece's "start" is.
   * @public
   *
   * @param {ShapePiece} shapePiece
   * @returns {number}
   */
  getShapeRatio(shapePiece) {
    let rotation = 0;
    for (let i = 0; i < this.shapePieces.length; i++) {
      const currentShapePiece = this.shapePieces.get(i);
      if (currentShapePiece === shapePiece) {
        return rotation;
      }
      rotation += currentShapePiece.fraction.value;
    }
    throw new Error('ShapePiece not found');
  }

  /**
   * Returns the matrix transform (locally) for how to position a piece in the container with the given properties.
   * @public
   *
   * @param {number} startingRatio - The numeric value of all fraction pieces BEFORE the desired piece to orient
   * @param {Fraction} fraction - The value of the piece to orient
   * @param {BuildingRepresentation} representation
   * @returns {Matrix3}
   */
  static getShapeMatrix(startingRatio, fraction, representation) {
    if (representation === BuildingRepresentation.PIE) {
      if (fraction.equals(Fraction.ONE)) {
        return Matrix3.IDENTITY;
      } else {
        const centroid = ShapePiece.getSweptCentroid(fraction);
        const angle = -2 * Math.PI * startingRatio;
        return Matrix3.rotation2(angle).timesMatrix(Matrix3.translationFromVector(centroid));
      }
    } else if (representation === BuildingRepresentation.BAR) {
      const centralValue = startingRatio + fraction.value / 2;
      return Matrix3.translation(Utils.linear(0, 1, ShapePiece.VERTICAL_BAR_BOUNDS.minX, ShapePiece.VERTICAL_BAR_BOUNDS.maxX, centralValue), 0);
    } else {
      throw new Error(`Unsupported representation for getShapeMatrix: ${representation}`);
    }
  }
}
fractionsCommon.register('ShapeContainer', ShapeContainer);
export default ShapeContainer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJQcm9wZXJ0eSIsIk1hdHJpeDMiLCJVdGlscyIsIlZlY3RvcjIiLCJGcmFjdGlvbiIsIkZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cyIsImZyYWN0aW9uc0NvbW1vbiIsIkJ1aWxkaW5nUmVwcmVzZW50YXRpb24iLCJTaGFwZVBpZWNlIiwic2NyYXRjaFZlY3RvciIsIlNoYXBlQ29udGFpbmVyIiwiY29uc3RydWN0b3IiLCJzaGFwZUdyb3VwIiwicGFydGl0aW9uRGVub21pbmF0b3JQcm9wZXJ0eSIsInJlcHJlc2VudGF0aW9uIiwiY2hhbmdlZEVtaXR0ZXIiLCJvZmZzZXQiLCJzaGFwZVBpZWNlcyIsInRvdGFsRnJhY3Rpb25Qcm9wZXJ0eSIsImFkZEl0ZW1BZGRlZExpc3RlbmVyIiwic2hhcGVQaWVjZSIsInZhbHVlIiwicGx1cyIsImZyYWN0aW9uIiwicmVkdWNlZCIsImVtaXQiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwibWludXMiLCJjYW5GaXRQaWVjZSIsInBvdGVudGlhbFRvdGFsRnJhY3Rpb24iLCJyZWR1Y2UiLCJpc0xlc3NUaGFuIiwiT05FIiwiZXF1YWxzIiwiZGlzdGFuY2VGcm9tUG9pbnQiLCJwb2ludCIsImxvY2FsUG9pbnQiLCJzZXQiLCJzdWJ0cmFjdCIsIlBJRSIsIk1hdGgiLCJtYXgiLCJtYWduaXR1ZGUiLCJTSEFQRV9TSVpFIiwiQkFSIiwic3FydCIsIlZFUlRJQ0FMX0JBUl9CT1VORFMiLCJtaW5pbXVtRGlzdGFuY2VUb1BvaW50U3F1YXJlZCIsIkVycm9yIiwiZ2V0U2hhcGVSYXRpbyIsInJvdGF0aW9uIiwiaSIsImxlbmd0aCIsImN1cnJlbnRTaGFwZVBpZWNlIiwiZ2V0IiwiZ2V0U2hhcGVNYXRyaXgiLCJzdGFydGluZ1JhdGlvIiwiSURFTlRJVFkiLCJjZW50cm9pZCIsImdldFN3ZXB0Q2VudHJvaWQiLCJhbmdsZSIsIlBJIiwicm90YXRpb24yIiwidGltZXNNYXRyaXgiLCJ0cmFuc2xhdGlvbkZyb21WZWN0b3IiLCJjZW50cmFsVmFsdWUiLCJ0cmFuc2xhdGlvbiIsImxpbmVhciIsIm1pblgiLCJtYXhYIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTaGFwZUNvbnRhaW5lci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGFuIGFyZWEgb2YgdmFsdWUgMSB0aGF0IGNhbiBob2xkIHNoYXBlIHBpZWNlcyB0aGF0IGluIHRvdGFsIGNhbiBzdW0gdXAgdG8gMS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvbW9kZWwvRnJhY3Rpb24uanMnO1xyXG5pbXBvcnQgRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9GcmFjdGlvbnNDb21tb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgZnJhY3Rpb25zQ29tbW9uIGZyb20gJy4uLy4uL2ZyYWN0aW9uc0NvbW1vbi5qcyc7XHJcbmltcG9ydCBCdWlsZGluZ1JlcHJlc2VudGF0aW9uIGZyb20gJy4vQnVpbGRpbmdSZXByZXNlbnRhdGlvbi5qcyc7XHJcbmltcG9ydCBTaGFwZVBpZWNlIGZyb20gJy4vU2hhcGVQaWVjZS5qcyc7XHJcblxyXG5jb25zdCBzY3JhdGNoVmVjdG9yID0gbmV3IFZlY3RvcjIoIDAsIDAgKTsgLy8gVXNlZCBhcyBhIHNoYXJlZCBWZWN0b3IyIHNvIHRoYXQgd2UgY2FuIGF2b2lkIGFsbG9jYXRpbmcgdmVjdG9ycyBkeW5hbWljYWxseS5cclxuXHJcbmNsYXNzIFNoYXBlQ29udGFpbmVyIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1NoYXBlR3JvdXB9IHNoYXBlR3JvdXAgLSBTbyBmYXIgaXQgaXMgZWFzaWVyIHRvIHBhc3MgdGhyb3VnaCB0aGlzIHJlZmVyZW5jZSAobm8gbmVlZCBmb3IgMSBjb250YWluZXIpLlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IHBhcnRpdGlvbkRlbm9taW5hdG9yUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge0J1aWxkaW5nUmVwcmVzZW50YXRpb259IHJlcHJlc2VudGF0aW9uXHJcbiAgICogQHBhcmFtIHtFbWl0dGVyfSBjaGFuZ2VkRW1pdHRlclxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gb2Zmc2V0IC0gT2Zmc2V0IGZyb20gdGhlIFNoYXBlR3JvdXAncyBvcmlnaW5cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc2hhcGVHcm91cCwgcGFydGl0aW9uRGVub21pbmF0b3JQcm9wZXJ0eSwgcmVwcmVzZW50YXRpb24sIGNoYW5nZWRFbWl0dGVyLCBvZmZzZXQgKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7U2hhcGVHcm91cH0gc2hhcGVHcm91cFxyXG4gICAgdGhpcy5zaGFwZUdyb3VwID0gc2hhcGVHcm91cDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn1cclxuICAgIHRoaXMucGFydGl0aW9uRGVub21pbmF0b3JQcm9wZXJ0eSA9IHBhcnRpdGlvbkRlbm9taW5hdG9yUHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QnVpbGRpbmdSZXByZXNlbnRhdGlvbn1cclxuICAgIHRoaXMucmVwcmVzZW50YXRpb24gPSByZXByZXNlbnRhdGlvbjtcclxuXHJcbiAgICAvLyBAcHVibGljIHtFbWl0dGVyfVxyXG4gICAgdGhpcy5jaGFuZ2VkRW1pdHRlciA9IGNoYW5nZWRFbWl0dGVyO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1ZlY3RvcjJ9XHJcbiAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtPYnNlcnZhYmxlQXJyYXlEZWYuPFNoYXBlUGllY2U+fVxyXG4gICAgdGhpcy5zaGFwZVBpZWNlcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxGcmFjdGlvbj59XHJcbiAgICB0aGlzLnRvdGFsRnJhY3Rpb25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbmV3IEZyYWN0aW9uKCAwLCAxICkgKTtcclxuXHJcbiAgICAvLyBLZWVwIHRvdGFsRnJhY3Rpb25Qcm9wZXJ0eSB1cC10by1kYXRlXHJcbiAgICB0aGlzLnNoYXBlUGllY2VzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCBzaGFwZVBpZWNlID0+IHtcclxuICAgICAgdGhpcy50b3RhbEZyYWN0aW9uUHJvcGVydHkudmFsdWUgPSB0aGlzLnRvdGFsRnJhY3Rpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCBzaGFwZVBpZWNlLmZyYWN0aW9uICkucmVkdWNlZCgpO1xyXG4gICAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgIH0gKTtcclxuICAgIHRoaXMuc2hhcGVQaWVjZXMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggc2hhcGVQaWVjZSA9PiB7XHJcbiAgICAgIHRoaXMudG90YWxGcmFjdGlvblByb3BlcnR5LnZhbHVlID0gdGhpcy50b3RhbEZyYWN0aW9uUHJvcGVydHkudmFsdWUubWludXMoIHNoYXBlUGllY2UuZnJhY3Rpb24gKS5yZWR1Y2VkKCk7XHJcbiAgICAgIHRoaXMuY2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBTaGFwZVBpZWNlIGNhbiBiZSBwbGFjZWQgaW50byB0aGlzIGNvbnRhaW5lci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NoYXBlUGllY2V9IHNoYXBlUGllY2VcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBjYW5GaXRQaWVjZSggc2hhcGVQaWVjZSApIHtcclxuICAgIGlmICggc2hhcGVQaWVjZS5yZXByZXNlbnRhdGlvbiAhPT0gdGhpcy5yZXByZXNlbnRhdGlvbiApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHBvdGVudGlhbFRvdGFsRnJhY3Rpb24gPSB0aGlzLnRvdGFsRnJhY3Rpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCBzaGFwZVBpZWNlLmZyYWN0aW9uICkucmVkdWNlKCk7XHJcbiAgICByZXR1cm4gcG90ZW50aWFsVG90YWxGcmFjdGlvbi5pc0xlc3NUaGFuKCBGcmFjdGlvbi5PTkUgKSB8fCBwb3RlbnRpYWxUb3RhbEZyYWN0aW9uLmVxdWFscyggRnJhY3Rpb24uT05FICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBkaXN0YW5jZSBvZiBhIHBvaW50IGZyb20gdGhpcyBjb250YWluZXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb2ludFxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZGlzdGFuY2VGcm9tUG9pbnQoIHBvaW50ICkge1xyXG5cclxuICAgIC8vIFN1YnRyYWN0IG9mZiBvdXIgbG9jYWwgb2Zmc2V0XHJcbiAgICBjb25zdCBsb2NhbFBvaW50ID0gc2NyYXRjaFZlY3Rvci5zZXQoIHBvaW50ICkuc3VidHJhY3QoIHRoaXMub2Zmc2V0ICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLnJlcHJlc2VudGF0aW9uID09PSBCdWlsZGluZ1JlcHJlc2VudGF0aW9uLlBJRSApIHtcclxuICAgICAgcmV0dXJuIE1hdGgubWF4KCAwLCBsb2NhbFBvaW50Lm1hZ25pdHVkZSAtIEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5TSEFQRV9TSVpFIC8gMiApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMucmVwcmVzZW50YXRpb24gPT09IEJ1aWxkaW5nUmVwcmVzZW50YXRpb24uQkFSICkge1xyXG4gICAgICByZXR1cm4gTWF0aC5zcXJ0KCBTaGFwZVBpZWNlLlZFUlRJQ0FMX0JBUl9CT1VORFMubWluaW11bURpc3RhbmNlVG9Qb2ludFNxdWFyZWQoIGxvY2FsUG9pbnQgKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggYFVuc3VwcG9ydGVkIHJlcHJlc2VudGF0aW9uIGZvciBTaGFwZUNvbnRhaW5lcjogJHt0aGlzLnJlcHJlc2VudGF0aW9ufWAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHZhbHVlIChmcm9tIDAgdG8gMSkgb2Ygd2hlcmUgdGhpcyBwaWVjZSdzIFwic3RhcnRcIiBpcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NoYXBlUGllY2V9IHNoYXBlUGllY2VcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldFNoYXBlUmF0aW8oIHNoYXBlUGllY2UgKSB7XHJcbiAgICBsZXQgcm90YXRpb24gPSAwO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zaGFwZVBpZWNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgY3VycmVudFNoYXBlUGllY2UgPSB0aGlzLnNoYXBlUGllY2VzLmdldCggaSApO1xyXG4gICAgICBpZiAoIGN1cnJlbnRTaGFwZVBpZWNlID09PSBzaGFwZVBpZWNlICkge1xyXG4gICAgICAgIHJldHVybiByb3RhdGlvbjtcclxuICAgICAgfVxyXG4gICAgICByb3RhdGlvbiArPSBjdXJyZW50U2hhcGVQaWVjZS5mcmFjdGlvbi52YWx1ZTtcclxuICAgIH1cclxuICAgIHRocm93IG5ldyBFcnJvciggJ1NoYXBlUGllY2Ugbm90IGZvdW5kJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbWF0cml4IHRyYW5zZm9ybSAobG9jYWxseSkgZm9yIGhvdyB0byBwb3NpdGlvbiBhIHBpZWNlIGluIHRoZSBjb250YWluZXIgd2l0aCB0aGUgZ2l2ZW4gcHJvcGVydGllcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnRpbmdSYXRpbyAtIFRoZSBudW1lcmljIHZhbHVlIG9mIGFsbCBmcmFjdGlvbiBwaWVjZXMgQkVGT1JFIHRoZSBkZXNpcmVkIHBpZWNlIHRvIG9yaWVudFxyXG4gICAqIEBwYXJhbSB7RnJhY3Rpb259IGZyYWN0aW9uIC0gVGhlIHZhbHVlIG9mIHRoZSBwaWVjZSB0byBvcmllbnRcclxuICAgKiBAcGFyYW0ge0J1aWxkaW5nUmVwcmVzZW50YXRpb259IHJlcHJlc2VudGF0aW9uXHJcbiAgICogQHJldHVybnMge01hdHJpeDN9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldFNoYXBlTWF0cml4KCBzdGFydGluZ1JhdGlvLCBmcmFjdGlvbiwgcmVwcmVzZW50YXRpb24gKSB7XHJcbiAgICBpZiAoIHJlcHJlc2VudGF0aW9uID09PSBCdWlsZGluZ1JlcHJlc2VudGF0aW9uLlBJRSApIHtcclxuICAgICAgaWYgKCBmcmFjdGlvbi5lcXVhbHMoIEZyYWN0aW9uLk9ORSApICkge1xyXG4gICAgICAgIHJldHVybiBNYXRyaXgzLklERU5USVRZO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGNlbnRyb2lkID0gU2hhcGVQaWVjZS5nZXRTd2VwdENlbnRyb2lkKCBmcmFjdGlvbiApO1xyXG4gICAgICAgIGNvbnN0IGFuZ2xlID0gLTIgKiBNYXRoLlBJICogc3RhcnRpbmdSYXRpbztcclxuICAgICAgICByZXR1cm4gTWF0cml4My5yb3RhdGlvbjIoIGFuZ2xlICkudGltZXNNYXRyaXgoIE1hdHJpeDMudHJhbnNsYXRpb25Gcm9tVmVjdG9yKCBjZW50cm9pZCApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCByZXByZXNlbnRhdGlvbiA9PT0gQnVpbGRpbmdSZXByZXNlbnRhdGlvbi5CQVIgKSB7XHJcbiAgICAgIGNvbnN0IGNlbnRyYWxWYWx1ZSA9IHN0YXJ0aW5nUmF0aW8gKyBmcmFjdGlvbi52YWx1ZSAvIDI7XHJcbiAgICAgIHJldHVybiBNYXRyaXgzLnRyYW5zbGF0aW9uKCBVdGlscy5saW5lYXIoIDAsIDEsIFNoYXBlUGllY2UuVkVSVElDQUxfQkFSX0JPVU5EUy5taW5YLCBTaGFwZVBpZWNlLlZFUlRJQ0FMX0JBUl9CT1VORFMubWF4WCwgY2VudHJhbFZhbHVlICksIDAgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBVbnN1cHBvcnRlZCByZXByZXNlbnRhdGlvbiBmb3IgZ2V0U2hhcGVNYXRyaXg6ICR7cmVwcmVzZW50YXRpb259YCApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnJhY3Rpb25zQ29tbW9uLnJlZ2lzdGVyKCAnU2hhcGVDb250YWluZXInLCBTaGFwZUNvbnRhaW5lciApO1xyXG5leHBvcnQgZGVmYXVsdCBTaGFwZUNvbnRhaW5lcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EscUJBQXFCLE1BQU0sOENBQThDO0FBQ2hGLE9BQU9DLFFBQVEsTUFB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