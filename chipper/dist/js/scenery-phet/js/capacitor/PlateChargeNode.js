// Copyright 2019-2022, University of Colorado Boulder

/**
 * Base class for representation of plate charge.  Plate charge is represented
 * as an integer number of '+' or '-' symbols. These symbols are distributed
 * across some portion of the plate's top face.
 *
 * All model coordinates are relative to the capacitor's local coordinate frame.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import Multilink from '../../../axon/js/Multilink.js';
import validate from '../../../axon/js/validate.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import merge from '../../../phet-core/js/merge.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import { CanvasNode, Node } from '../../../scenery/js/imports.js';
import PhetColorScheme from '../PhetColorScheme.js';
import sceneryPhet from '../sceneryPhet.js';
import CapacitorConstants from './CapacitorConstants.js';

// constants
const POSITIVE_CHARGE_COLOR = PhetColorScheme.RED_COLORBLIND.toCSS(); // CSS passed into context fillStyle
const NEGATIVE_CHARGE_COLOR = 'blue';
const NUMBER_OF_PLATE_CHARGES = new Range(1, 625);
const NEGATIVE_CHARGE_SIZE = new Dimension2(7, 2);
class PlateChargeNode extends CanvasNode {
  /**
   * @param {Capacitor} capacitor
   * @param {YawPitchModelViewTransform3} modelViewTransform
   * @param {Object} [options]
   */
  constructor(capacitor, modelViewTransform, options) {
    options = merge({
      // {string} - 'POSITIVE' or 'NEGATIVE'
      polarity: CapacitorConstants.POLARITY.POSITIVE,
      maxPlateCharge: Infinity,
      opacity: 1.0,
      orientation: Orientation.VERTICAL,
      canvasBounds: null // Bounds2|null
    }, options);
    validate(options.orientation, {
      validValues: Orientation.enumeration.values
    });
    super({
      canvasBounds: options.canvasBounds
    });
    const self = this; // extend scope for nested callbacks

    // @private {Capacitor}
    this.capacitor = capacitor;

    // @private {Orientation}
    this.orientation = options.orientation;

    // @private {YawPitchModelViewTransform3}
    this.modelViewTransform = modelViewTransform;

    // @private {string} - 'POSITIVE' or 'NEGATIVE'
    this.polarity = options.polarity;

    // @private {number}
    this.maxPlateCharge = options.maxPlateCharge;

    // @private {number}
    this.opacity = options.opacity;
    this.parentNode = new Node(); // @private parent node for charges
    this.addChild(this.parentNode);

    // No disposal required because the capacitor exists for the life of the sim
    Multilink.multilink([capacitor.plateSizeProperty, capacitor.plateChargeProperty], () => self.isVisible() && self.invalidatePaint());

    // Update when this Node becomes visible.
    this.visibleProperty.link(visible => visible && this.invalidatePaint());
  }

  /**
   * @param {number} numberOfObjects
   * @param {number} width
   * @param {number} height
   * @private
   *
   * @returns {Dimension2}
   */
  getGridSize(numberOfObjects, width, height) {
    let columns = 0;
    let rows = 0;
    if (numberOfObjects > 0) {
      const alpha = Math.sqrt(numberOfObjects / width / height);
      columns = Utils.roundSymmetric(width * alpha);

      // compute rows 2 ways, choose the best fit
      const rows1 = Utils.roundSymmetric(height * alpha);
      const rows2 = Utils.roundSymmetric(numberOfObjects / columns);
      if (rows1 !== rows2) {
        const error1 = Math.abs(numberOfObjects - rows1 * columns);
        const error2 = Math.abs(numberOfObjects - rows2 * columns);
        rows = error1 < error2 ? rows1 : rows2;
      } else {
        rows = rows1;
      }

      // handle boundary cases
      if (columns === 0) {
        columns = 1;
        rows = numberOfObjects;
      } else if (rows === 0) {
        rows = 1;
        columns = numberOfObjects;
      }
    }
    assert && assert(columns >= 0 && rows >= 0, 'There must be at least 1 column or 1 row of charges.');
    return new Dimension2(columns, rows);
  }

  /**
   * Get plate charge from capacitor in the model
   * @public
   *
   * @returns {number} charge
   */
  getPlateCharge() {
    return this.capacitor.plateChargeProperty.value;
  }

  /**
   * Gets the x offset (relative to the plate origin) of the portion of the plate that is facing the vacuum gap
   * @public
   *
   * @returns {number} offset
   */
  getContactXOrigin() {
    return -this.capacitor.plateSizeProperty.value.width / 2;
  }

  /**
   * Gets the width of the portion of the plate that is in contact with air.
   * @public
   *
   * @returns {number}
   */
  getContactWidth() {
    return this.capacitor.plateSizeProperty.value.width;
  }

  /**
   * Returns true if plate is positively charged
   *
   * @returns {Boolean}
   * @public
   */
  isPositivelyCharged() {
    return this.getPlateCharge() >= 0 && this.polarity === CapacitorConstants.POLARITY.POSITIVE || this.getPlateCharge() < 0 && this.polarity === CapacitorConstants.POLARITY.NEGATIVE;
  }

  /**
   * Updates the view to match the model. Charges are arranged in a grid.
   *
   * @param {CanvasRenderingContext2D} context
   * @public
   */
  paintCanvas(context) {
    const plateCharge = this.getPlateCharge();
    const numberOfCharges = this.getNumberOfCharges(plateCharge, this.maxPlateCharge);
    if (numberOfCharges > 0) {
      const zMargin = this.modelViewTransform.viewToModelDeltaXY(NEGATIVE_CHARGE_SIZE.width, 0).x;
      const gridWidth = this.getContactWidth(); // contact between plate and vacuum gap
      const gridDepth = this.capacitor.plateSizeProperty.value.depth - 2 * zMargin;

      // grid dimensions
      const gridSize = this.getGridSize(numberOfCharges, gridWidth, gridDepth);
      const rows = gridSize.height;
      const columns = gridSize.width;

      // distance between cells
      const dx = gridWidth / columns;
      const dz = gridDepth / rows;

      // offset to move us to the center of cells
      const xOffset = dx / 2;
      const zOffset = dz / 2;

      // populate the grid
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          // calculate center position for the charge in cell of the grid
          const x = this.getContactXOrigin() + xOffset + column * dx;
          const y = 0;
          let z = -(gridDepth / 2) + zMargin / 2 + zOffset + row * dz;

          // #2935, so that single charge is not obscured by wire connected to center of top plate
          if (numberOfCharges === 1) {
            z -= dz / 6;
          }
          const centerPosition = this.modelViewTransform.modelToViewXYZ(x, y, z);

          // add the signed charge to the grid
          if (this.isPositivelyCharged()) {
            addPositiveCharge(centerPosition, context);
          } else {
            addNegativeCharge(centerPosition, context, this.orientation);
          }
        }
      }
    }
  }

  /**
   * Computes number of charges, linearly proportional to plate charge.  If plate charge is less than half of an
   * electron charge, number of charges is zero.
   * @public
   *
   * @param {number} plateCharge
   * @param {number} maxPlateCharge
   * @returns {number}
   */
  getNumberOfCharges(plateCharge, maxPlateCharge) {
    const absCharge = Math.abs(plateCharge);
    let numberOfCharges = Utils.toFixedNumber(NUMBER_OF_PLATE_CHARGES.max * (absCharge / maxPlateCharge), 0);
    if (absCharge > 0 && numberOfCharges < NUMBER_OF_PLATE_CHARGES.min) {
      numberOfCharges = NUMBER_OF_PLATE_CHARGES.min;
    }
    return Math.min(NUMBER_OF_PLATE_CHARGES.max, numberOfCharges);
  }
}

/**
 * Draw a positive charge with canvas.  'Plus' sign is painted with two
 * overlapping rectangles around a center position.
 *
 * @param {Vector2} position - center position of the charge in view space
 * @param {CanvasRenderingContext2D} context - context for the canvas methods
 * @private
 */
const addPositiveCharge = (position, context) => {
  const chargeWidth = NEGATIVE_CHARGE_SIZE.width;
  const chargeHeight = NEGATIVE_CHARGE_SIZE.height;
  context.fillStyle = POSITIVE_CHARGE_COLOR;
  context.fillRect(position.x - chargeWidth / 2, position.y - chargeHeight / 2, chargeWidth, chargeHeight);
  context.fillRect(position.x - chargeHeight / 2, position.y - chargeWidth / 2, chargeHeight, chargeWidth);
};

/**
 * Draw a negative charge with canvas.  'Minus' sign is painted with a single
 * rectangle around a center position.
 *
 * @param {Vector2} position
 * @param {CanvasRenderingContext2D} context
 * @param {string} orientation
 * @private
 */
const addNegativeCharge = (position, context, orientation) => {
  const chargeWidth = NEGATIVE_CHARGE_SIZE.width;
  const chargeHeight = NEGATIVE_CHARGE_SIZE.height;
  context.fillStyle = NEGATIVE_CHARGE_COLOR;
  if (orientation === Orientation.VERTICAL) {
    context.fillRect(position.x - chargeWidth / 2, position.y, chargeWidth, chargeHeight);
  } else {
    context.fillRect(position.x - chargeHeight / 2, position.y - 2.5, chargeHeight, chargeWidth);
  }
};
sceneryPhet.register('PlateChargeNode', PlateChargeNode);
export default PlateChargeNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJ2YWxpZGF0ZSIsIkRpbWVuc2lvbjIiLCJSYW5nZSIsIlV0aWxzIiwibWVyZ2UiLCJPcmllbnRhdGlvbiIsIkNhbnZhc05vZGUiLCJOb2RlIiwiUGhldENvbG9yU2NoZW1lIiwic2NlbmVyeVBoZXQiLCJDYXBhY2l0b3JDb25zdGFudHMiLCJQT1NJVElWRV9DSEFSR0VfQ09MT1IiLCJSRURfQ09MT1JCTElORCIsInRvQ1NTIiwiTkVHQVRJVkVfQ0hBUkdFX0NPTE9SIiwiTlVNQkVSX09GX1BMQVRFX0NIQVJHRVMiLCJORUdBVElWRV9DSEFSR0VfU0laRSIsIlBsYXRlQ2hhcmdlTm9kZSIsImNvbnN0cnVjdG9yIiwiY2FwYWNpdG9yIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwib3B0aW9ucyIsInBvbGFyaXR5IiwiUE9MQVJJVFkiLCJQT1NJVElWRSIsIm1heFBsYXRlQ2hhcmdlIiwiSW5maW5pdHkiLCJvcGFjaXR5Iiwib3JpZW50YXRpb24iLCJWRVJUSUNBTCIsImNhbnZhc0JvdW5kcyIsInZhbGlkVmFsdWVzIiwiZW51bWVyYXRpb24iLCJ2YWx1ZXMiLCJzZWxmIiwicGFyZW50Tm9kZSIsImFkZENoaWxkIiwibXVsdGlsaW5rIiwicGxhdGVTaXplUHJvcGVydHkiLCJwbGF0ZUNoYXJnZVByb3BlcnR5IiwiaXNWaXNpYmxlIiwiaW52YWxpZGF0ZVBhaW50IiwidmlzaWJsZVByb3BlcnR5IiwibGluayIsInZpc2libGUiLCJnZXRHcmlkU2l6ZSIsIm51bWJlck9mT2JqZWN0cyIsIndpZHRoIiwiaGVpZ2h0IiwiY29sdW1ucyIsInJvd3MiLCJhbHBoYSIsIk1hdGgiLCJzcXJ0Iiwicm91bmRTeW1tZXRyaWMiLCJyb3dzMSIsInJvd3MyIiwiZXJyb3IxIiwiYWJzIiwiZXJyb3IyIiwiYXNzZXJ0IiwiZ2V0UGxhdGVDaGFyZ2UiLCJ2YWx1ZSIsImdldENvbnRhY3RYT3JpZ2luIiwiZ2V0Q29udGFjdFdpZHRoIiwiaXNQb3NpdGl2ZWx5Q2hhcmdlZCIsIk5FR0FUSVZFIiwicGFpbnRDYW52YXMiLCJjb250ZXh0IiwicGxhdGVDaGFyZ2UiLCJudW1iZXJPZkNoYXJnZXMiLCJnZXROdW1iZXJPZkNoYXJnZXMiLCJ6TWFyZ2luIiwidmlld1RvTW9kZWxEZWx0YVhZIiwieCIsImdyaWRXaWR0aCIsImdyaWREZXB0aCIsImRlcHRoIiwiZ3JpZFNpemUiLCJkeCIsImR6IiwieE9mZnNldCIsInpPZmZzZXQiLCJyb3ciLCJjb2x1bW4iLCJ5IiwieiIsImNlbnRlclBvc2l0aW9uIiwibW9kZWxUb1ZpZXdYWVoiLCJhZGRQb3NpdGl2ZUNoYXJnZSIsImFkZE5lZ2F0aXZlQ2hhcmdlIiwiYWJzQ2hhcmdlIiwidG9GaXhlZE51bWJlciIsIm1heCIsIm1pbiIsInBvc2l0aW9uIiwiY2hhcmdlV2lkdGgiLCJjaGFyZ2VIZWlnaHQiLCJmaWxsU3R5bGUiLCJmaWxsUmVjdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGxhdGVDaGFyZ2VOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhc2UgY2xhc3MgZm9yIHJlcHJlc2VudGF0aW9uIG9mIHBsYXRlIGNoYXJnZS4gIFBsYXRlIGNoYXJnZSBpcyByZXByZXNlbnRlZFxyXG4gKiBhcyBhbiBpbnRlZ2VyIG51bWJlciBvZiAnKycgb3IgJy0nIHN5bWJvbHMuIFRoZXNlIHN5bWJvbHMgYXJlIGRpc3RyaWJ1dGVkXHJcbiAqIGFjcm9zcyBzb21lIHBvcnRpb24gb2YgdGhlIHBsYXRlJ3MgdG9wIGZhY2UuXHJcbiAqXHJcbiAqIEFsbCBtb2RlbCBjb29yZGluYXRlcyBhcmUgcmVsYXRpdmUgdG8gdGhlIGNhcGFjaXRvcidzIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEFuZHJldyBBZGFyZSAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IHZhbGlkYXRlIGZyb20gJy4uLy4uLy4uL2F4b24vanMvdmFsaWRhdGUuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBPcmllbnRhdGlvbiBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvT3JpZW50YXRpb24uanMnO1xyXG5pbXBvcnQgeyBDYW52YXNOb2RlLCBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBoZXRDb2xvclNjaGVtZSBmcm9tICcuLi9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vc2NlbmVyeVBoZXQuanMnO1xyXG5pbXBvcnQgQ2FwYWNpdG9yQ29uc3RhbnRzIGZyb20gJy4vQ2FwYWNpdG9yQ29uc3RhbnRzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBQT1NJVElWRV9DSEFSR0VfQ09MT1IgPSBQaGV0Q29sb3JTY2hlbWUuUkVEX0NPTE9SQkxJTkQudG9DU1MoKTsgLy8gQ1NTIHBhc3NlZCBpbnRvIGNvbnRleHQgZmlsbFN0eWxlXHJcbmNvbnN0IE5FR0FUSVZFX0NIQVJHRV9DT0xPUiA9ICdibHVlJztcclxuY29uc3QgTlVNQkVSX09GX1BMQVRFX0NIQVJHRVMgPSBuZXcgUmFuZ2UoIDEsIDYyNSApO1xyXG5jb25zdCBORUdBVElWRV9DSEFSR0VfU0laRSA9IG5ldyBEaW1lbnNpb24yKCA3LCAyICk7XHJcblxyXG5jbGFzcyBQbGF0ZUNoYXJnZU5vZGUgZXh0ZW5kcyBDYW52YXNOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDYXBhY2l0b3J9IGNhcGFjaXRvclxyXG4gICAqIEBwYXJhbSB7WWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNhcGFjaXRvciwgbW9kZWxWaWV3VHJhbnNmb3JtLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICAvLyB7c3RyaW5nfSAtICdQT1NJVElWRScgb3IgJ05FR0FUSVZFJ1xyXG4gICAgICBwb2xhcml0eTogQ2FwYWNpdG9yQ29uc3RhbnRzLlBPTEFSSVRZLlBPU0lUSVZFLFxyXG4gICAgICBtYXhQbGF0ZUNoYXJnZTogSW5maW5pdHksXHJcbiAgICAgIG9wYWNpdHk6IDEuMCxcclxuICAgICAgb3JpZW50YXRpb246IE9yaWVudGF0aW9uLlZFUlRJQ0FMLFxyXG4gICAgICBjYW52YXNCb3VuZHM6IG51bGwgLy8gQm91bmRzMnxudWxsXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgdmFsaWRhdGUoIG9wdGlvbnMub3JpZW50YXRpb24sIHsgdmFsaWRWYWx1ZXM6IE9yaWVudGF0aW9uLmVudW1lcmF0aW9uLnZhbHVlcyB9ICk7XHJcblxyXG4gICAgc3VwZXIoIHsgY2FudmFzQm91bmRzOiBvcHRpb25zLmNhbnZhc0JvdW5kcyB9ICk7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpczsgLy8gZXh0ZW5kIHNjb3BlIGZvciBuZXN0ZWQgY2FsbGJhY2tzXHJcblxyXG4gICAgLy8gQHByaXZhdGUge0NhcGFjaXRvcn1cclxuICAgIHRoaXMuY2FwYWNpdG9yID0gY2FwYWNpdG9yO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtPcmllbnRhdGlvbn1cclxuICAgIHRoaXMub3JpZW50YXRpb24gPSBvcHRpb25zLm9yaWVudGF0aW9uO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtZYXdQaXRjaE1vZGVsVmlld1RyYW5zZm9ybTN9XHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IG1vZGVsVmlld1RyYW5zZm9ybTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7c3RyaW5nfSAtICdQT1NJVElWRScgb3IgJ05FR0FUSVZFJ1xyXG4gICAgdGhpcy5wb2xhcml0eSA9IG9wdGlvbnMucG9sYXJpdHk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn1cclxuICAgIHRoaXMubWF4UGxhdGVDaGFyZ2UgPSBvcHRpb25zLm1heFBsYXRlQ2hhcmdlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9XHJcbiAgICB0aGlzLm9wYWNpdHkgPSBvcHRpb25zLm9wYWNpdHk7XHJcblxyXG4gICAgdGhpcy5wYXJlbnROb2RlID0gbmV3IE5vZGUoKTsgLy8gQHByaXZhdGUgcGFyZW50IG5vZGUgZm9yIGNoYXJnZXNcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMucGFyZW50Tm9kZSApO1xyXG5cclxuICAgIC8vIE5vIGRpc3Bvc2FsIHJlcXVpcmVkIGJlY2F1c2UgdGhlIGNhcGFjaXRvciBleGlzdHMgZm9yIHRoZSBsaWZlIG9mIHRoZSBzaW1cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFtcclxuICAgICAgICBjYXBhY2l0b3IucGxhdGVTaXplUHJvcGVydHksXHJcbiAgICAgICAgY2FwYWNpdG9yLnBsYXRlQ2hhcmdlUHJvcGVydHlcclxuICAgICAgXSwgKCkgPT4gc2VsZi5pc1Zpc2libGUoKSAmJiBzZWxmLmludmFsaWRhdGVQYWludCgpXHJcbiAgICApO1xyXG5cclxuICAgIC8vIFVwZGF0ZSB3aGVuIHRoaXMgTm9kZSBiZWNvbWVzIHZpc2libGUuXHJcbiAgICB0aGlzLnZpc2libGVQcm9wZXJ0eS5saW5rKCB2aXNpYmxlID0+IHZpc2libGUgJiYgdGhpcy5pbnZhbGlkYXRlUGFpbnQoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bWJlck9mT2JqZWN0c1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge0RpbWVuc2lvbjJ9XHJcbiAgICovXHJcbiAgZ2V0R3JpZFNpemUoIG51bWJlck9mT2JqZWN0cywgd2lkdGgsIGhlaWdodCApIHtcclxuICAgIGxldCBjb2x1bW5zID0gMDtcclxuICAgIGxldCByb3dzID0gMDtcclxuICAgIGlmICggbnVtYmVyT2ZPYmplY3RzID4gMCApIHtcclxuXHJcbiAgICAgIGNvbnN0IGFscGhhID0gTWF0aC5zcXJ0KCBudW1iZXJPZk9iamVjdHMgLyB3aWR0aCAvIGhlaWdodCApO1xyXG4gICAgICBjb2x1bW5zID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIHdpZHRoICogYWxwaGEgKTtcclxuXHJcbiAgICAgIC8vIGNvbXB1dGUgcm93cyAyIHdheXMsIGNob29zZSB0aGUgYmVzdCBmaXRcclxuICAgICAgY29uc3Qgcm93czEgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggaGVpZ2h0ICogYWxwaGEgKTtcclxuICAgICAgY29uc3Qgcm93czIgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggbnVtYmVyT2ZPYmplY3RzIC8gY29sdW1ucyApO1xyXG4gICAgICBpZiAoIHJvd3MxICE9PSByb3dzMiApIHtcclxuICAgICAgICBjb25zdCBlcnJvcjEgPSBNYXRoLmFicyggbnVtYmVyT2ZPYmplY3RzIC0gKCByb3dzMSAqIGNvbHVtbnMgKSApO1xyXG4gICAgICAgIGNvbnN0IGVycm9yMiA9IE1hdGguYWJzKCBudW1iZXJPZk9iamVjdHMgLSAoIHJvd3MyICogY29sdW1ucyApICk7XHJcbiAgICAgICAgcm93cyA9ICggZXJyb3IxIDwgZXJyb3IyICkgPyByb3dzMSA6IHJvd3MyO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJvd3MgPSByb3dzMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaGFuZGxlIGJvdW5kYXJ5IGNhc2VzXHJcbiAgICAgIGlmICggY29sdW1ucyA9PT0gMCApIHtcclxuICAgICAgICBjb2x1bW5zID0gMTtcclxuICAgICAgICByb3dzID0gbnVtYmVyT2ZPYmplY3RzO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCByb3dzID09PSAwICkge1xyXG4gICAgICAgIHJvd3MgPSAxO1xyXG4gICAgICAgIGNvbHVtbnMgPSBudW1iZXJPZk9iamVjdHM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbHVtbnMgPj0gMCAmJiByb3dzID49IDAsICdUaGVyZSBtdXN0IGJlIGF0IGxlYXN0IDEgY29sdW1uIG9yIDEgcm93IG9mIGNoYXJnZXMuJyApO1xyXG4gICAgcmV0dXJuIG5ldyBEaW1lbnNpb24yKCBjb2x1bW5zLCByb3dzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgcGxhdGUgY2hhcmdlIGZyb20gY2FwYWNpdG9yIGluIHRoZSBtb2RlbFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IGNoYXJnZVxyXG4gICAqL1xyXG4gIGdldFBsYXRlQ2hhcmdlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY2FwYWNpdG9yLnBsYXRlQ2hhcmdlUHJvcGVydHkudmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB4IG9mZnNldCAocmVsYXRpdmUgdG8gdGhlIHBsYXRlIG9yaWdpbikgb2YgdGhlIHBvcnRpb24gb2YgdGhlIHBsYXRlIHRoYXQgaXMgZmFjaW5nIHRoZSB2YWN1dW0gZ2FwXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn0gb2Zmc2V0XHJcbiAgICovXHJcbiAgZ2V0Q29udGFjdFhPcmlnaW4oKSB7XHJcbiAgICByZXR1cm4gLXRoaXMuY2FwYWNpdG9yLnBsYXRlU2l6ZVByb3BlcnR5LnZhbHVlLndpZHRoIC8gMjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHdpZHRoIG9mIHRoZSBwb3J0aW9uIG9mIHRoZSBwbGF0ZSB0aGF0IGlzIGluIGNvbnRhY3Qgd2l0aCBhaXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRDb250YWN0V2lkdGgoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jYXBhY2l0b3IucGxhdGVTaXplUHJvcGVydHkudmFsdWUud2lkdGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgcGxhdGUgaXMgcG9zaXRpdmVseSBjaGFyZ2VkXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgaXNQb3NpdGl2ZWx5Q2hhcmdlZCgpIHtcclxuICAgIHJldHVybiAoIHRoaXMuZ2V0UGxhdGVDaGFyZ2UoKSA+PSAwICYmIHRoaXMucG9sYXJpdHkgPT09IENhcGFjaXRvckNvbnN0YW50cy5QT0xBUklUWS5QT1NJVElWRSApIHx8XHJcbiAgICAgICAgICAgKCB0aGlzLmdldFBsYXRlQ2hhcmdlKCkgPCAwICYmIHRoaXMucG9sYXJpdHkgPT09IENhcGFjaXRvckNvbnN0YW50cy5QT0xBUklUWS5ORUdBVElWRSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgdmlldyB0byBtYXRjaCB0aGUgbW9kZWwuIENoYXJnZXMgYXJlIGFycmFuZ2VkIGluIGEgZ3JpZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjb250ZXh0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHBhaW50Q2FudmFzKCBjb250ZXh0ICkge1xyXG5cclxuICAgIGNvbnN0IHBsYXRlQ2hhcmdlID0gdGhpcy5nZXRQbGF0ZUNoYXJnZSgpO1xyXG4gICAgY29uc3QgbnVtYmVyT2ZDaGFyZ2VzID0gdGhpcy5nZXROdW1iZXJPZkNoYXJnZXMoIHBsYXRlQ2hhcmdlLCB0aGlzLm1heFBsYXRlQ2hhcmdlICk7XHJcblxyXG4gICAgaWYgKCBudW1iZXJPZkNoYXJnZXMgPiAwICkge1xyXG5cclxuICAgICAgY29uc3Qgek1hcmdpbiA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsRGVsdGFYWSggTkVHQVRJVkVfQ0hBUkdFX1NJWkUud2lkdGgsIDAgKS54O1xyXG5cclxuICAgICAgY29uc3QgZ3JpZFdpZHRoID0gdGhpcy5nZXRDb250YWN0V2lkdGgoKTsgLy8gY29udGFjdCBiZXR3ZWVuIHBsYXRlIGFuZCB2YWN1dW0gZ2FwXHJcbiAgICAgIGNvbnN0IGdyaWREZXB0aCA9IHRoaXMuY2FwYWNpdG9yLnBsYXRlU2l6ZVByb3BlcnR5LnZhbHVlLmRlcHRoIC0gKCAyICogek1hcmdpbiApO1xyXG5cclxuICAgICAgLy8gZ3JpZCBkaW1lbnNpb25zXHJcbiAgICAgIGNvbnN0IGdyaWRTaXplID0gdGhpcy5nZXRHcmlkU2l6ZSggbnVtYmVyT2ZDaGFyZ2VzLCBncmlkV2lkdGgsIGdyaWREZXB0aCApO1xyXG4gICAgICBjb25zdCByb3dzID0gZ3JpZFNpemUuaGVpZ2h0O1xyXG4gICAgICBjb25zdCBjb2x1bW5zID0gZ3JpZFNpemUud2lkdGg7XHJcblxyXG4gICAgICAvLyBkaXN0YW5jZSBiZXR3ZWVuIGNlbGxzXHJcbiAgICAgIGNvbnN0IGR4ID0gZ3JpZFdpZHRoIC8gY29sdW1ucztcclxuICAgICAgY29uc3QgZHogPSBncmlkRGVwdGggLyByb3dzO1xyXG5cclxuICAgICAgLy8gb2Zmc2V0IHRvIG1vdmUgdXMgdG8gdGhlIGNlbnRlciBvZiBjZWxsc1xyXG4gICAgICBjb25zdCB4T2Zmc2V0ID0gZHggLyAyO1xyXG4gICAgICBjb25zdCB6T2Zmc2V0ID0gZHogLyAyO1xyXG5cclxuICAgICAgLy8gcG9wdWxhdGUgdGhlIGdyaWRcclxuICAgICAgZm9yICggbGV0IHJvdyA9IDA7IHJvdyA8IHJvd3M7IHJvdysrICkge1xyXG4gICAgICAgIGZvciAoIGxldCBjb2x1bW4gPSAwOyBjb2x1bW4gPCBjb2x1bW5zOyBjb2x1bW4rKyApIHtcclxuXHJcbiAgICAgICAgICAvLyBjYWxjdWxhdGUgY2VudGVyIHBvc2l0aW9uIGZvciB0aGUgY2hhcmdlIGluIGNlbGwgb2YgdGhlIGdyaWRcclxuICAgICAgICAgIGNvbnN0IHggPSB0aGlzLmdldENvbnRhY3RYT3JpZ2luKCkgKyB4T2Zmc2V0ICsgKCBjb2x1bW4gKiBkeCApO1xyXG4gICAgICAgICAgY29uc3QgeSA9IDA7XHJcbiAgICAgICAgICBsZXQgeiA9IC0oIGdyaWREZXB0aCAvIDIgKSArICggek1hcmdpbiAvIDIgKSArIHpPZmZzZXQgKyAoIHJvdyAqIGR6ICk7XHJcblxyXG4gICAgICAgICAgLy8gIzI5MzUsIHNvIHRoYXQgc2luZ2xlIGNoYXJnZSBpcyBub3Qgb2JzY3VyZWQgYnkgd2lyZSBjb25uZWN0ZWQgdG8gY2VudGVyIG9mIHRvcCBwbGF0ZVxyXG4gICAgICAgICAgaWYgKCBudW1iZXJPZkNoYXJnZXMgPT09IDEgKSB7XHJcbiAgICAgICAgICAgIHogLT0gZHogLyA2O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3QgY2VudGVyUG9zaXRpb24gPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1hZWiggeCwgeSwgeiApO1xyXG5cclxuICAgICAgICAgIC8vIGFkZCB0aGUgc2lnbmVkIGNoYXJnZSB0byB0aGUgZ3JpZFxyXG4gICAgICAgICAgaWYgKCB0aGlzLmlzUG9zaXRpdmVseUNoYXJnZWQoKSApIHtcclxuICAgICAgICAgICAgYWRkUG9zaXRpdmVDaGFyZ2UoIGNlbnRlclBvc2l0aW9uLCBjb250ZXh0ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYWRkTmVnYXRpdmVDaGFyZ2UoIGNlbnRlclBvc2l0aW9uLCBjb250ZXh0LCB0aGlzLm9yaWVudGF0aW9uICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wdXRlcyBudW1iZXIgb2YgY2hhcmdlcywgbGluZWFybHkgcHJvcG9ydGlvbmFsIHRvIHBsYXRlIGNoYXJnZS4gIElmIHBsYXRlIGNoYXJnZSBpcyBsZXNzIHRoYW4gaGFsZiBvZiBhblxyXG4gICAqIGVsZWN0cm9uIGNoYXJnZSwgbnVtYmVyIG9mIGNoYXJnZXMgaXMgemVyby5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcGxhdGVDaGFyZ2VcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4UGxhdGVDaGFyZ2VcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldE51bWJlck9mQ2hhcmdlcyggcGxhdGVDaGFyZ2UsIG1heFBsYXRlQ2hhcmdlICkge1xyXG4gICAgY29uc3QgYWJzQ2hhcmdlID0gTWF0aC5hYnMoIHBsYXRlQ2hhcmdlICk7XHJcbiAgICBsZXQgbnVtYmVyT2ZDaGFyZ2VzID0gVXRpbHMudG9GaXhlZE51bWJlciggTlVNQkVSX09GX1BMQVRFX0NIQVJHRVMubWF4ICogKCBhYnNDaGFyZ2UgLyBtYXhQbGF0ZUNoYXJnZSApLCAwICk7XHJcbiAgICBpZiAoIGFic0NoYXJnZSA+IDAgJiYgbnVtYmVyT2ZDaGFyZ2VzIDwgTlVNQkVSX09GX1BMQVRFX0NIQVJHRVMubWluICkge1xyXG4gICAgICBudW1iZXJPZkNoYXJnZXMgPSBOVU1CRVJfT0ZfUExBVEVfQ0hBUkdFUy5taW47XHJcbiAgICB9XHJcbiAgICByZXR1cm4gTWF0aC5taW4oIE5VTUJFUl9PRl9QTEFURV9DSEFSR0VTLm1heCwgbnVtYmVyT2ZDaGFyZ2VzICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogRHJhdyBhIHBvc2l0aXZlIGNoYXJnZSB3aXRoIGNhbnZhcy4gICdQbHVzJyBzaWduIGlzIHBhaW50ZWQgd2l0aCB0d29cclxuICogb3ZlcmxhcHBpbmcgcmVjdGFuZ2xlcyBhcm91bmQgYSBjZW50ZXIgcG9zaXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7VmVjdG9yMn0gcG9zaXRpb24gLSBjZW50ZXIgcG9zaXRpb24gb2YgdGhlIGNoYXJnZSBpbiB2aWV3IHNwYWNlXHJcbiAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjb250ZXh0IC0gY29udGV4dCBmb3IgdGhlIGNhbnZhcyBtZXRob2RzXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5jb25zdCBhZGRQb3NpdGl2ZUNoYXJnZSA9ICggcG9zaXRpb24sIGNvbnRleHQgKSA9PiB7XHJcbiAgY29uc3QgY2hhcmdlV2lkdGggPSBORUdBVElWRV9DSEFSR0VfU0laRS53aWR0aDtcclxuICBjb25zdCBjaGFyZ2VIZWlnaHQgPSBORUdBVElWRV9DSEFSR0VfU0laRS5oZWlnaHQ7XHJcblxyXG4gIGNvbnRleHQuZmlsbFN0eWxlID0gUE9TSVRJVkVfQ0hBUkdFX0NPTE9SO1xyXG4gIGNvbnRleHQuZmlsbFJlY3QoIHBvc2l0aW9uLnggLSBjaGFyZ2VXaWR0aCAvIDIsIHBvc2l0aW9uLnkgLSBjaGFyZ2VIZWlnaHQgLyAyLCBjaGFyZ2VXaWR0aCwgY2hhcmdlSGVpZ2h0ICk7XHJcbiAgY29udGV4dC5maWxsUmVjdCggcG9zaXRpb24ueCAtIGNoYXJnZUhlaWdodCAvIDIsIHBvc2l0aW9uLnkgLSBjaGFyZ2VXaWR0aCAvIDIsIGNoYXJnZUhlaWdodCwgY2hhcmdlV2lkdGggKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEcmF3IGEgbmVnYXRpdmUgY2hhcmdlIHdpdGggY2FudmFzLiAgJ01pbnVzJyBzaWduIGlzIHBhaW50ZWQgd2l0aCBhIHNpbmdsZVxyXG4gKiByZWN0YW5nbGUgYXJvdW5kIGEgY2VudGVyIHBvc2l0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXHJcbiAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjb250ZXh0XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmllbnRhdGlvblxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuY29uc3QgYWRkTmVnYXRpdmVDaGFyZ2UgPSAoIHBvc2l0aW9uLCBjb250ZXh0LCBvcmllbnRhdGlvbiApID0+IHtcclxuICBjb25zdCBjaGFyZ2VXaWR0aCA9IE5FR0FUSVZFX0NIQVJHRV9TSVpFLndpZHRoO1xyXG4gIGNvbnN0IGNoYXJnZUhlaWdodCA9IE5FR0FUSVZFX0NIQVJHRV9TSVpFLmhlaWdodDtcclxuXHJcbiAgY29udGV4dC5maWxsU3R5bGUgPSBORUdBVElWRV9DSEFSR0VfQ09MT1I7XHJcbiAgaWYgKCBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uVkVSVElDQUwgKSB7XHJcbiAgICBjb250ZXh0LmZpbGxSZWN0KCBwb3NpdGlvbi54IC0gY2hhcmdlV2lkdGggLyAyLCBwb3NpdGlvbi55LCBjaGFyZ2VXaWR0aCwgY2hhcmdlSGVpZ2h0ICk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgY29udGV4dC5maWxsUmVjdCggcG9zaXRpb24ueCAtIGNoYXJnZUhlaWdodCAvIDIsIHBvc2l0aW9uLnkgLSAyLjUsIGNoYXJnZUhlaWdodCwgY2hhcmdlV2lkdGggKTtcclxuICB9XHJcbn07XHJcblxyXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ1BsYXRlQ2hhcmdlTm9kZScsIFBsYXRlQ2hhcmdlTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBQbGF0ZUNoYXJnZU5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLCtCQUErQjtBQUNyRCxPQUFPQyxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLFVBQVUsTUFBTSwrQkFBK0I7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLDBCQUEwQjtBQUM1QyxPQUFPQyxLQUFLLE1BQU0sMEJBQTBCO0FBQzVDLE9BQU9DLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsT0FBT0MsV0FBVyxNQUFNLHNDQUFzQztBQUM5RCxTQUFTQyxVQUFVLEVBQUVDLElBQUksUUFBUSxnQ0FBZ0M7QUFDakUsT0FBT0MsZUFBZSxNQUFNLHVCQUF1QjtBQUNuRCxPQUFPQyxXQUFXLE1BQU0sbUJBQW1CO0FBQzNDLE9BQU9DLGtCQUFrQixNQUFNLHlCQUF5Qjs7QUFFeEQ7QUFDQSxNQUFNQyxxQkFBcUIsR0FBR0gsZUFBZSxDQUFDSSxjQUFjLENBQUNDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0RSxNQUFNQyxxQkFBcUIsR0FBRyxNQUFNO0FBQ3BDLE1BQU1DLHVCQUF1QixHQUFHLElBQUliLEtBQUssQ0FBRSxDQUFDLEVBQUUsR0FBSSxDQUFDO0FBQ25ELE1BQU1jLG9CQUFvQixHQUFHLElBQUlmLFVBQVUsQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0FBRW5ELE1BQU1nQixlQUFlLFNBQVNYLFVBQVUsQ0FBQztFQUV2QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VZLFdBQVdBLENBQUVDLFNBQVMsRUFBRUMsa0JBQWtCLEVBQUVDLE9BQU8sRUFBRztJQUVwREEsT0FBTyxHQUFHakIsS0FBSyxDQUFFO01BQ2Y7TUFDQWtCLFFBQVEsRUFBRVosa0JBQWtCLENBQUNhLFFBQVEs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