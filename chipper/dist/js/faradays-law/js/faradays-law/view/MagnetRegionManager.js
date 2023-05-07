// Copyright 2018-2022, University of Colorado Boulder

/**
 * Base type for handling accessibility alert and description logic associated with the position of the magnet. This
 * includes proximity to one or both coils, field strength at one or both coils, sim screen position, and coil
 * entrance/exit regions (informs the user of upper/lower coil position relative to the magnet).
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Utils from '../../../../dot/js/Utils.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawConstants from '../FaradaysLawConstants.js';
import MagnetDirectionEnum from '../model/MagnetDirectionEnum.js';
import CoilTypeEnum from './CoilTypeEnum.js';

// constants
const NUMBER_OF_ROWS = 3;
const EDGE_TOLERANCE = 5;
const VERTICAL_EDGE_TOLERANCE = Utils.roundSymmetric(FaradaysLawConstants.MAGNET_HEIGHT / 2) + EDGE_TOLERANCE;
const HORIZONTAL_EDGE_TOLERANCE = Utils.roundSymmetric(FaradaysLawConstants.MAGNET_WIDTH / 2) + EDGE_TOLERANCE;
const {
  LEFT,
  RIGHT
} = MagnetDirectionEnum;
const SCREEN_MIDPOINT_X = FaradaysLawConstants.LAYOUT_BOUNDS.centerX;
const coilProximityToRegion = new LinearFunction(95, 260, 1, 3, true); // determined empirically from sim testing

const rowHeight = Utils.roundSymmetric(FaradaysLawConstants.LAYOUT_BOUNDS.getHeight() / NUMBER_OF_ROWS);
const columnWidth = Utils.roundSymmetric(FaradaysLawConstants.LAYOUT_BOUNDS.getWidth() / NUMBER_OF_ROWS);

// the distance the magnet must mofe in order for the extra prompt to be removed
const DISTANCE_MOVED_THRESHOLD = Utils.roundSymmetric(FaradaysLawConstants.LAYOUT_BOUNDS.width / 5);

/**
 * Creates a new Bounds2 object centered on the privided vector.
 *
 * @param  {Vector2} vector the position on which to center the bounds
 * @returns {Bounds2}        the bounds of the magnet at the passed position
 */
const createMagnetBounds = vector => {
  const halfWidth = FaradaysLawConstants.MAGNET_WIDTH / 2;
  const halfHeight = FaradaysLawConstants.MAGNET_HEIGHT / 2;
  return new Bounds2(vector.x - halfWidth, vector.y - halfHeight, vector.x + halfWidth, vector.y + halfHeight);
};
class MagnetRegionManager {
  /**
   * The MagnetRegionManager class accepts an instance of the model for linking the appropriate properties and mapping to
   * numbers and strings for a11y-related alerts and descriptions. We watch model properties and update internal values
   * that can be accessed via public getters by other types.
   *
   * @param {Object} model  FaradaysLawModel
   */
  constructor(model) {
    this.model = model;
    this.magnet = model.magnet;
    this.topCoil = model.topCoil;
    this.bottomCoil = model.bottomCoil;
    this.bounds = model.bounds;
    this.showExtraMoveText = true; // for displaying detailed magnet movement instructions
    this.magnetIsAnimating = false;
    this.magnetStoppedByKeyboard = false;

    // @private
    // generate bounds to indicate if magnet is inside the coil
    this._topCoilInnerBounds = new Bounds2(Math.max(model.topCoilRestrictedBounds[0].minX, model.topCoilRestrictedBounds[1].minX), Math.min(model.topCoilRestrictedBounds[0].maxY, model.topCoilRestrictedBounds[1].maxY), Math.min(model.topCoilRestrictedBounds[0].maxX, model.topCoilRestrictedBounds[1].maxX), Math.max(model.topCoilRestrictedBounds[0].minY, model.topCoilRestrictedBounds[1].minY)).eroded(2);

    // @private
    this._bottomCoilInnerBounds = new Bounds2(Math.max(model.bottomCoilRestrictedBounds[0].minX, model.bottomCoilRestrictedBounds[1].minX), Math.min(model.bottomCoilRestrictedBounds[0].maxY, model.bottomCoilRestrictedBounds[1].maxY), Math.min(model.bottomCoilRestrictedBounds[0].maxX, model.bottomCoilRestrictedBounds[1].maxX), Math.max(model.bottomCoilRestrictedBounds[0].minY, model.bottomCoilRestrictedBounds[1].minY)).eroded(2);

    // @private
    // TODO: adjust setting this based on magnet and coil bounds instead of position
    this._adjacentCoil = CoilTypeEnum.NO_COIL;
    this._touchingCoil = this._magnetScreenSide = 'right';
    this._positionRegion = this.getPositionRegion(model.magnet.positionProperty.get());
    this._topCoilProximity = 0;
    this._bottomCoilProximity = 0;
    this._topCoilFieldStrength = 0;
    this._bottomCoilFiledStrength = 0;
    Multilink.multilink([model.topCoilVisibleProperty, model.magnet.positionProperty], (showTopCoil, position) => {
      this._adjacentCoil = this.getCoilAdjacentToVector(position, showTopCoil);
    });
    let distanceMoved = 0;
    model.magnet.positionProperty.link((position, oldPosition) => {
      this._positionRegion = this.getPositionRegion(position);
      if (oldPosition && this.showExtraMoveText) {
        const delta = position.distance(oldPosition);
        distanceMoved += delta;
        this.showExtraMoveText = distanceMoved < DISTANCE_MOVED_THRESHOLD;
      }
      this._magnetScreenSide = position.x >= SCREEN_MIDPOINT_X ? 'right' : 'left';
      this._magnetInCoil = !this.getTopCoilProximityRegion(position) || !this.getBottomCoilProximityRegion(position);
    });
  }

  /*****************************************************************************
   * Magnet position region methods for adjacent coil and sim screen position. *
   *****************************************************************************/

  /**
   * Returns the index of the intersected coil region or -1 on error.
   * @public
   *
   * @returns {Number}
   */
  getTouchingCoil() {
    const coilSides = [{
      side: 'top',
      coil: CoilTypeEnum.TWO_COIL
    }, {
      side: 'bottom',
      coil: CoilTypeEnum.TWO_COIL
    }, {
      side: 'top',
      coil: CoilTypeEnum.FOUR_COIL
    }, {
      side: 'bottom',
      coil: CoilTypeEnum.FOUR_COIL
    }];
    const intersectedBounds = this.model.getIntersectedRestrictedBounds(createMagnetBounds(this.magnet.positionProperty.value));
    const listOfRestrictedBounds = this.model.bottomCoilRestrictedBounds.concat(this.model.topCoilRestrictedBounds);
    const i = listOfRestrictedBounds.indexOf(intersectedBounds);

    // TODO: The code below looks wrong.  The return type doesn't match the header docs, and the whole thing is too
    //  tightly coupled to the way bounds are managed in the model.  See
    // https://github.com/phetsims/faradays-law/issues/164. Also, it seems like it should return null instead of -1 if
    // no intersection is found.

    if (i >= 0) {
      return coilSides[i];
    } else {
      return i;
    }
  }

  /**
   * Get the current value of the adjacent coil.
   * @public
   *
   * @returns {String}
   */
  get adjacentCoil() {
    return this._adjacentCoil;
  }

  /**
   * Get the side of the sim screen containing the magnet. The midpoint is set to the 'right' side.
   * @public
   *
   * @returns {String}
   */
  get magnetScreenSide() {
    return this._magnetScreenSide;
  }

  /**
   * Returns true if the magnet intersect the bounds of a coil. Used in conjunction with 'adjacentCoil'.
   * @public
   *
   * @returns {String}
   */
  get magnetInCoil() {
    return this._magnetInCoil;
  }

  /**
   * @public
   * @returns {boolean}
   */
  get magnetInOrVeryCloseToCoil() {
    return this.magnetToBottomCoilProximity <= 1 || this.model.topCoilVisibleProperty.get() && this.magnetToTopCoilProximity <= 1;
  }

  /**
   * Get the coil whose inner vertical bounds contain the y value of the given vector.
   *
   * @private
   * @param  {Vector2} vector
   * @returns {String}
   */
  getCoilAdjacentToVector(vector, showTopCoil) {
    const y = vector.y;
    if (showTopCoil && y <= this._topCoilInnerBounds.maxY && y >= this._topCoilInnerBounds.minY) {
      return CoilTypeEnum.TWO_COIL;
    }
    if (y <= this._bottomCoilInnerBounds.maxY && y >= this._bottomCoilInnerBounds.minY) {
      return CoilTypeEnum.FOUR_COIL;
    }
    return CoilTypeEnum.NO_COIL;
  }

  /**
   * Get the current region, one of 0..9
   *
   * @returns {int}
   */
  get positionRegion() {
    return this._positionRegion;
  }

  /**
   * Get the region of the screen that contains the provided vector. For Faraday's Law, the screen is divided into 9
   * regions that are numbered 0 - 8 in row major order, left to right.
   * @public
   *
   * @param  {Vector2} vector
   * @returns {int}
   */
  getPositionRegion({
    x,
    y
  }) {
    return NUMBER_OF_ROWS * MagnetRegionManager.getRow(y) + MagnetRegionManager.getColumn(x);
  }
  get magnetAtEdge() {
    return this.isVectorAtEdge(this.magnet.positionProperty.get());
  }

  /**
   * @public
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  isVectorAtEdge({
    x,
    y
  }) {
    const {
      minX,
      minY,
      maxX,
      maxY
    } = this.bounds;
    const verticalMinDistance = Math.min(Math.abs(y - minY), Math.abs(y - maxY));
    const horizontalMinDistance = Math.min(Math.abs(x - minX), Math.abs(x - maxX));
    return verticalMinDistance <= VERTICAL_EDGE_TOLERANCE || horizontalMinDistance <= HORIZONTAL_EDGE_TOLERANCE;
  }

  /**
   * @public
   * @returns {MagnetDirectionEnum}
   */
  get coilDirection() {
    const coilsCenterX = this.topCoil.position.x + (this.bottomCoil.position.x - this.topCoil.position.x) / 2;
    return this.magnet.positionProperty.get().x - coilsCenterX < 0 ? RIGHT : LEFT;
  }

  /**
   * @public
   * @param {Vector2} vector
   * @returns {string}
   */
  getBottomCoilDirection(vector) {
    return vector.x - this.bottomCoil.position < 0 ? RIGHT : LEFT;
  }

  /**
   * @public
   * @returns {number}
   */
  get magnetToTopCoilProximity() {
    return this.getTopCoilProximityRegion(this.magnet.positionProperty.get());
  }

  /**
   * @public
   * @returns {number}
   */
  get magnetToBottomCoilProximity() {
    return this.getBottomCoilProximityRegion(this.magnet.positionProperty.get());
  }

  /**
   * @public
   * @param Vector2
   * @returns {number}
   */
  getTopCoilProximityRegion(vector) {
    if (!this.model.topCoilVisibleProperty.get()) {
      return -1;
    }
    return this.getCoilProximityRegion(vector, CoilTypeEnum.TWO_COIL);
  }

  /**
   * @public
   * @param {Vector2} vector
   * @returns {number}
   */
  getBottomCoilProximityRegion(vector) {
    return this.getCoilProximityRegion(vector, CoilTypeEnum.FOUR_COIL);
  }

  /**
   * @public
   * @param {Vector2} vector
   * @param {CoilTypeEnum} coilType
   * @returns {number}
   */
  getCoilProximityRegion(vector, coilType) {
    const magnetBounds = createMagnetBounds(vector);
    const coilBounds = coilType === CoilTypeEnum.TWO_COIL ? this._topCoilInnerBounds : this._bottomCoilInnerBounds;
    if (coilBounds.intersectsBounds(magnetBounds)) {
      return 0;
    }
    const distance = this.getDistanceToCoil(vector, coilType);
    return Utils.roundSymmetric(coilProximityToRegion.evaluate(distance));
  }

  /**
   * @public
   * @param position
   * @param coilType
   * @returns {number}
   */
  getDistanceToCoil(position, coilType) {
    const coilPosition = coilType === CoilTypeEnum.TWO_COIL ? this.topCoil.position : this.bottomCoil.position;
    return position.distance(coilPosition);
  }

  /**
   * @public
   * @returns {number}
   */
  getTopCoilFieldStrengthRegion() {
    return this.getFieldStrengthAtCoilRegion(this.topCoil);
  }

  /**
   * @public
   * @returns {number}
   */
  getBottomCoilFieldStrengthRegion() {
    return this.getFieldStrengthAtCoilRegion(this.bottomCoil);
  }

  /**
   * @public
   * @param {Coil} coil
   * @returns {number}
   */
  getFieldStrengthAtCoilRegion(coil) {
    if (coil.position.distance(this.magnet.positionProperty.get()) < 70) {
      return 4;
    }
    const fieldStrength = coil.magneticFieldProperty.get();
    return MagnetRegionManager.mapFieldStrengthToInteger(Math.abs(fieldStrength));
  }

  /**
   * @public
   */
  stopMagnetAnimationWithKeyboard() {
    this.magnetStoppedByKeyboard = true;
    this.magnetIsAnimating = false;
  }

  /**
   * @public
   * @param isAnimating
   */
  setMagnetIsAnimating(isAnimating) {
    this.magnetIsAnimating = isAnimating;
  }

  /**
   * @public
   */
  resetKeyboardStop() {
    this.magnetStoppedByKeyboard = false;
  }

  /**
   * Get the 0-based row number for a y coordinate.
   * @public
   * @param  {Number} y
   * @returns {int}
   */
  static getRow(y) {
    return MagnetRegionManager.mapSegment(y, rowHeight);
  }

  /**
   * Get the 0-based column number for an x coordinate.
   * @public
   * @param  {Number} x
   * @returns {int}
   */
  static getColumn(x) {
    return MagnetRegionManager.mapSegment(x, columnWidth);
  }

  /**
   * Maps a given number to a given segment number based on the size of the segment. This function assumes that there
   * are an equal number of rows and columns.
   * @public
   *
   * @param  {Number} value
   * @param  {Number} segmentSize
   * @returns {int}
   */
  static mapSegment(value, segmentSize) {
    for (let i = 0; i < NUMBER_OF_ROWS; i++) {
      if (value <= (i + 1) * segmentSize) {
        return i;
      }
    }
    return NUMBER_OF_ROWS - 1;
  }

  /**
   * @public
   * @param {number} fieldStrength
   * @returns {number}
   */
  static mapFieldStrengthToInteger(fieldStrength) {
    if (fieldStrength < 0.025) {
      return 0;
    } else if (fieldStrength >= 0.025 && fieldStrength < 0.04) {
      return 1;
    } else if (fieldStrength >= 0.04 && fieldStrength < 0.075) {
      return 2;
    } else if (fieldStrength >= 0.075 && fieldStrength < 0.18) {
      return 3;
    } else {
      return 4;
    }
  }
}
faradaysLaw.register('MagnetRegionManager', MagnetRegionManager);
export default MagnetRegionManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJCb3VuZHMyIiwiTGluZWFyRnVuY3Rpb24iLCJVdGlscyIsImZhcmFkYXlzTGF3IiwiRmFyYWRheXNMYXdDb25zdGFudHMiLCJNYWduZXREaXJlY3Rpb25FbnVtIiwiQ29pbFR5cGVFbnVtIiwiTlVNQkVSX09GX1JPV1MiLCJFREdFX1RPTEVSQU5DRSIsIlZFUlRJQ0FMX0VER0VfVE9MRVJBTkNFIiwicm91bmRTeW1tZXRyaWMiLCJNQUdORVRfSEVJR0hUIiwiSE9SSVpPTlRBTF9FREdFX1RPTEVSQU5DRSIsIk1BR05FVF9XSURUSCIsIkxFRlQiLCJSSUdIVCIsIlNDUkVFTl9NSURQT0lOVF9YIiwiTEFZT1VUX0JPVU5EUyIsImNlbnRlclgiLCJjb2lsUHJveGltaXR5VG9SZWdpb24iLCJyb3dIZWlnaHQiLCJnZXRIZWlnaHQiLCJjb2x1bW5XaWR0aCIsImdldFdpZHRoIiwiRElTVEFOQ0VfTU9WRURfVEhSRVNIT0xEIiwid2lkdGgiLCJjcmVhdGVNYWduZXRCb3VuZHMiLCJ2ZWN0b3IiLCJoYWxmV2lkdGgiLCJoYWxmSGVpZ2h0IiwieCIsInkiLCJNYWduZXRSZWdpb25NYW5hZ2VyIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsIm1hZ25ldCIsInRvcENvaWwiLCJib3R0b21Db2lsIiwiYm91bmRzIiwic2hvd0V4dHJhTW92ZVRleHQiLCJtYWduZXRJc0FuaW1hdGluZyIsIm1hZ25ldFN0b3BwZWRCeUtleWJvYXJkIiwiX3RvcENvaWxJbm5lckJvdW5kcyIsIk1hdGgiLCJtYXgiLCJ0b3BDb2lsUmVzdHJpY3RlZEJvdW5kcyIsIm1pblgiLCJtaW4iLCJtYXhZIiwibWF4WCIsIm1pblkiLCJlcm9kZWQiLCJfYm90dG9tQ29pbElubmVyQm91bmRzIiwiYm90dG9tQ29pbFJlc3RyaWN0ZWRCb3VuZHMiLCJfYWRqYWNlbnRDb2lsIiwiTk9fQ09JTCIsIl90b3VjaGluZ0NvaWwiLCJfbWFnbmV0U2NyZWVuU2lkZSIsIl9wb3NpdGlvblJlZ2lvbiIsImdldFBvc2l0aW9uUmVnaW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsImdldCIsIl90b3BDb2lsUHJveGltaXR5IiwiX2JvdHRvbUNvaWxQcm94aW1pdHkiLCJfdG9wQ29pbEZpZWxkU3RyZW5ndGgiLCJfYm90dG9tQ29pbEZpbGVkU3RyZW5ndGgiLCJtdWx0aWxpbmsiLCJ0b3BDb2lsVmlzaWJsZVByb3BlcnR5Iiwic2hvd1RvcENvaWwiLCJwb3NpdGlvbiIsImdldENvaWxBZGphY2VudFRvVmVjdG9yIiwiZGlzdGFuY2VNb3ZlZCIsImxpbmsiLCJvbGRQb3NpdGlvbiIsImRlbHRhIiwiZGlzdGFuY2UiLCJfbWFnbmV0SW5Db2lsIiwiZ2V0VG9wQ29pbFByb3hpbWl0eVJlZ2lvbiIsImdldEJvdHRvbUNvaWxQcm94aW1pdHlSZWdpb24iLCJnZXRUb3VjaGluZ0NvaWwiLCJjb2lsU2lkZXMiLCJzaWRlIiwiY29pbCIsIlRXT19DT0lMIiwiRk9VUl9DT0lMIiwiaW50ZXJzZWN0ZWRCb3VuZHMiLCJnZXRJbnRlcnNlY3RlZFJlc3RyaWN0ZWRCb3VuZHMiLCJ2YWx1ZSIsImxpc3RPZlJlc3RyaWN0ZWRCb3VuZHMiLCJjb25jYXQiLCJpIiwiaW5kZXhPZiIsImFkamFjZW50Q29pbCIsIm1hZ25ldFNjcmVlblNpZGUiLCJtYWduZXRJbkNvaWwiLCJtYWduZXRJbk9yVmVyeUNsb3NlVG9Db2lsIiwibWFnbmV0VG9Cb3R0b21Db2lsUHJveGltaXR5IiwibWFnbmV0VG9Ub3BDb2lsUHJveGltaXR5IiwicG9zaXRpb25SZWdpb24iLCJnZXRSb3ciLCJnZXRDb2x1bW4iLCJtYWduZXRBdEVkZ2UiLCJpc1ZlY3RvckF0RWRnZSIsInZlcnRpY2FsTWluRGlzdGFuY2UiLCJhYnMiLCJob3Jpem9udGFsTWluRGlzdGFuY2UiLCJjb2lsRGlyZWN0aW9uIiwiY29pbHNDZW50ZXJYIiwiZ2V0Qm90dG9tQ29pbERpcmVjdGlvbiIsImdldENvaWxQcm94aW1pdHlSZWdpb24iLCJjb2lsVHlwZSIsIm1hZ25ldEJvdW5kcyIsImNvaWxCb3VuZHMiLCJpbnRlcnNlY3RzQm91bmRzIiwiZ2V0RGlzdGFuY2VUb0NvaWwiLCJldmFsdWF0ZSIsImNvaWxQb3NpdGlvbiIsImdldFRvcENvaWxGaWVsZFN0cmVuZ3RoUmVnaW9uIiwiZ2V0RmllbGRTdHJlbmd0aEF0Q29pbFJlZ2lvbiIsImdldEJvdHRvbUNvaWxGaWVsZFN0cmVuZ3RoUmVnaW9uIiwiZmllbGRTdHJlbmd0aCIsIm1hZ25ldGljRmllbGRQcm9wZXJ0eSIsIm1hcEZpZWxkU3RyZW5ndGhUb0ludGVnZXIiLCJzdG9wTWFnbmV0QW5pbWF0aW9uV2l0aEtleWJvYXJkIiwic2V0TWFnbmV0SXNBbmltYXRpbmciLCJpc0FuaW1hdGluZyIsInJlc2V0S2V5Ym9hcmRTdG9wIiwibWFwU2VnbWVudCIsInNlZ21lbnRTaXplIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNYWduZXRSZWdpb25NYW5hZ2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuXHJcbi8qKlxyXG4gKiBCYXNlIHR5cGUgZm9yIGhhbmRsaW5nIGFjY2Vzc2liaWxpdHkgYWxlcnQgYW5kIGRlc2NyaXB0aW9uIGxvZ2ljIGFzc29jaWF0ZWQgd2l0aCB0aGUgcG9zaXRpb24gb2YgdGhlIG1hZ25ldC4gVGhpc1xyXG4gKiBpbmNsdWRlcyBwcm94aW1pdHkgdG8gb25lIG9yIGJvdGggY29pbHMsIGZpZWxkIHN0cmVuZ3RoIGF0IG9uZSBvciBib3RoIGNvaWxzLCBzaW0gc2NyZWVuIHBvc2l0aW9uLCBhbmQgY29pbFxyXG4gKiBlbnRyYW5jZS9leGl0IHJlZ2lvbnMgKGluZm9ybXMgdGhlIHVzZXIgb2YgdXBwZXIvbG93ZXIgY29pbCBwb3NpdGlvbiByZWxhdGl2ZSB0byB0aGUgbWFnbmV0KS5cclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEJhcmxvdyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgTGluZWFyRnVuY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0xpbmVhckZ1bmN0aW9uLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBmYXJhZGF5c0xhdyBmcm9tICcuLi8uLi9mYXJhZGF5c0xhdy5qcyc7XHJcbmltcG9ydCBGYXJhZGF5c0xhd0NvbnN0YW50cyBmcm9tICcuLi9GYXJhZGF5c0xhd0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBNYWduZXREaXJlY3Rpb25FbnVtIGZyb20gJy4uL21vZGVsL01hZ25ldERpcmVjdGlvbkVudW0uanMnO1xyXG5pbXBvcnQgQ29pbFR5cGVFbnVtIGZyb20gJy4vQ29pbFR5cGVFbnVtLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBOVU1CRVJfT0ZfUk9XUyA9IDM7XHJcbmNvbnN0IEVER0VfVE9MRVJBTkNFID0gNTtcclxuY29uc3QgVkVSVElDQUxfRURHRV9UT0xFUkFOQ0UgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggRmFyYWRheXNMYXdDb25zdGFudHMuTUFHTkVUX0hFSUdIVCAvIDIgKSArIEVER0VfVE9MRVJBTkNFO1xyXG5jb25zdCBIT1JJWk9OVEFMX0VER0VfVE9MRVJBTkNFID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIEZhcmFkYXlzTGF3Q29uc3RhbnRzLk1BR05FVF9XSURUSCAvIDIgKSArIEVER0VfVE9MRVJBTkNFO1xyXG5jb25zdCB7IExFRlQsIFJJR0hUIH0gPSBNYWduZXREaXJlY3Rpb25FbnVtO1xyXG5jb25zdCBTQ1JFRU5fTUlEUE9JTlRfWCA9IEZhcmFkYXlzTGF3Q29uc3RhbnRzLkxBWU9VVF9CT1VORFMuY2VudGVyWDtcclxuXHJcbmNvbnN0IGNvaWxQcm94aW1pdHlUb1JlZ2lvbiA9IG5ldyBMaW5lYXJGdW5jdGlvbiggOTUsIDI2MCwgMSwgMywgdHJ1ZSApOyAvLyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5IGZyb20gc2ltIHRlc3RpbmdcclxuXHJcbmNvbnN0IHJvd0hlaWdodCA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBGYXJhZGF5c0xhd0NvbnN0YW50cy5MQVlPVVRfQk9VTkRTLmdldEhlaWdodCgpIC8gTlVNQkVSX09GX1JPV1MgKTtcclxuY29uc3QgY29sdW1uV2lkdGggPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggRmFyYWRheXNMYXdDb25zdGFudHMuTEFZT1VUX0JPVU5EUy5nZXRXaWR0aCgpIC8gTlVNQkVSX09GX1JPV1MgKTtcclxuXHJcbi8vIHRoZSBkaXN0YW5jZSB0aGUgbWFnbmV0IG11c3QgbW9mZSBpbiBvcmRlciBmb3IgdGhlIGV4dHJhIHByb21wdCB0byBiZSByZW1vdmVkXHJcbmNvbnN0IERJU1RBTkNFX01PVkVEX1RIUkVTSE9MRCA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBGYXJhZGF5c0xhd0NvbnN0YW50cy5MQVlPVVRfQk9VTkRTLndpZHRoIC8gNSApO1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgQm91bmRzMiBvYmplY3QgY2VudGVyZWQgb24gdGhlIHByaXZpZGVkIHZlY3Rvci5cclxuICpcclxuICogQHBhcmFtICB7VmVjdG9yMn0gdmVjdG9yIHRoZSBwb3NpdGlvbiBvbiB3aGljaCB0byBjZW50ZXIgdGhlIGJvdW5kc1xyXG4gKiBAcmV0dXJucyB7Qm91bmRzMn0gICAgICAgIHRoZSBib3VuZHMgb2YgdGhlIG1hZ25ldCBhdCB0aGUgcGFzc2VkIHBvc2l0aW9uXHJcbiAqL1xyXG5jb25zdCBjcmVhdGVNYWduZXRCb3VuZHMgPSB2ZWN0b3IgPT4ge1xyXG4gIGNvbnN0IGhhbGZXaWR0aCA9IEZhcmFkYXlzTGF3Q29uc3RhbnRzLk1BR05FVF9XSURUSCAvIDI7XHJcbiAgY29uc3QgaGFsZkhlaWdodCA9IEZhcmFkYXlzTGF3Q29uc3RhbnRzLk1BR05FVF9IRUlHSFQgLyAyO1xyXG4gIHJldHVybiBuZXcgQm91bmRzMihcclxuICAgIHZlY3Rvci54IC0gaGFsZldpZHRoLFxyXG4gICAgdmVjdG9yLnkgLSBoYWxmSGVpZ2h0LFxyXG4gICAgdmVjdG9yLnggKyBoYWxmV2lkdGgsXHJcbiAgICB2ZWN0b3IueSArIGhhbGZIZWlnaHRcclxuICApO1xyXG59O1xyXG5cclxuY2xhc3MgTWFnbmV0UmVnaW9uTWFuYWdlciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBNYWduZXRSZWdpb25NYW5hZ2VyIGNsYXNzIGFjY2VwdHMgYW4gaW5zdGFuY2Ugb2YgdGhlIG1vZGVsIGZvciBsaW5raW5nIHRoZSBhcHByb3ByaWF0ZSBwcm9wZXJ0aWVzIGFuZCBtYXBwaW5nIHRvXHJcbiAgICogbnVtYmVycyBhbmQgc3RyaW5ncyBmb3IgYTExeS1yZWxhdGVkIGFsZXJ0cyBhbmQgZGVzY3JpcHRpb25zLiBXZSB3YXRjaCBtb2RlbCBwcm9wZXJ0aWVzIGFuZCB1cGRhdGUgaW50ZXJuYWwgdmFsdWVzXHJcbiAgICogdGhhdCBjYW4gYmUgYWNjZXNzZWQgdmlhIHB1YmxpYyBnZXR0ZXJzIGJ5IG90aGVyIHR5cGVzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsICBGYXJhZGF5c0xhd01vZGVsXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsICkge1xyXG5cclxuICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuICAgIHRoaXMubWFnbmV0ID0gbW9kZWwubWFnbmV0O1xyXG4gICAgdGhpcy50b3BDb2lsID0gbW9kZWwudG9wQ29pbDtcclxuICAgIHRoaXMuYm90dG9tQ29pbCA9IG1vZGVsLmJvdHRvbUNvaWw7XHJcbiAgICB0aGlzLmJvdW5kcyA9IG1vZGVsLmJvdW5kcztcclxuICAgIHRoaXMuc2hvd0V4dHJhTW92ZVRleHQgPSB0cnVlOyAvLyBmb3IgZGlzcGxheWluZyBkZXRhaWxlZCBtYWduZXQgbW92ZW1lbnQgaW5zdHJ1Y3Rpb25zXHJcbiAgICB0aGlzLm1hZ25ldElzQW5pbWF0aW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLm1hZ25ldFN0b3BwZWRCeUtleWJvYXJkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIC8vIGdlbmVyYXRlIGJvdW5kcyB0byBpbmRpY2F0ZSBpZiBtYWduZXQgaXMgaW5zaWRlIHRoZSBjb2lsXHJcbiAgICB0aGlzLl90b3BDb2lsSW5uZXJCb3VuZHMgPSBuZXcgQm91bmRzMihcclxuICAgICAgTWF0aC5tYXgoIG1vZGVsLnRvcENvaWxSZXN0cmljdGVkQm91bmRzWyAwIF0ubWluWCwgbW9kZWwudG9wQ29pbFJlc3RyaWN0ZWRCb3VuZHNbIDEgXS5taW5YICksXHJcbiAgICAgIE1hdGgubWluKCBtb2RlbC50b3BDb2lsUmVzdHJpY3RlZEJvdW5kc1sgMCBdLm1heFksIG1vZGVsLnRvcENvaWxSZXN0cmljdGVkQm91bmRzWyAxIF0ubWF4WSApLFxyXG4gICAgICBNYXRoLm1pbiggbW9kZWwudG9wQ29pbFJlc3RyaWN0ZWRCb3VuZHNbIDAgXS5tYXhYLCBtb2RlbC50b3BDb2lsUmVzdHJpY3RlZEJvdW5kc1sgMSBdLm1heFggKSxcclxuICAgICAgTWF0aC5tYXgoIG1vZGVsLnRvcENvaWxSZXN0cmljdGVkQm91bmRzWyAwIF0ubWluWSwgbW9kZWwudG9wQ29pbFJlc3RyaWN0ZWRCb3VuZHNbIDEgXS5taW5ZIClcclxuICAgICkuZXJvZGVkKCAyICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuX2JvdHRvbUNvaWxJbm5lckJvdW5kcyA9IG5ldyBCb3VuZHMyKFxyXG4gICAgICBNYXRoLm1heCggbW9kZWwuYm90dG9tQ29pbFJlc3RyaWN0ZWRCb3VuZHNbIDAgXS5taW5YLCBtb2RlbC5ib3R0b21Db2lsUmVzdHJpY3RlZEJvdW5kc1sgMSBdLm1pblggKSxcclxuICAgICAgTWF0aC5taW4oIG1vZGVsLmJvdHRvbUNvaWxSZXN0cmljdGVkQm91bmRzWyAwIF0ubWF4WSwgbW9kZWwuYm90dG9tQ29pbFJlc3RyaWN0ZWRCb3VuZHNbIDEgXS5tYXhZICksXHJcbiAgICAgIE1hdGgubWluKCBtb2RlbC5ib3R0b21Db2lsUmVzdHJpY3RlZEJvdW5kc1sgMCBdLm1heFgsIG1vZGVsLmJvdHRvbUNvaWxSZXN0cmljdGVkQm91bmRzWyAxIF0ubWF4WCApLFxyXG4gICAgICBNYXRoLm1heCggbW9kZWwuYm90dG9tQ29pbFJlc3RyaWN0ZWRCb3VuZHNbIDAgXS5taW5ZLCBtb2RlbC5ib3R0b21Db2lsUmVzdHJpY3RlZEJvdW5kc1sgMSBdLm1pblkgKVxyXG4gICAgKS5lcm9kZWQoIDIgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgLy8gVE9ETzogYWRqdXN0IHNldHRpbmcgdGhpcyBiYXNlZCBvbiBtYWduZXQgYW5kIGNvaWwgYm91bmRzIGluc3RlYWQgb2YgcG9zaXRpb25cclxuICAgIHRoaXMuX2FkamFjZW50Q29pbCA9IENvaWxUeXBlRW51bS5OT19DT0lMO1xyXG4gICAgdGhpcy5fdG91Y2hpbmdDb2lsID1cclxuICAgICAgdGhpcy5fbWFnbmV0U2NyZWVuU2lkZSA9ICdyaWdodCc7XHJcbiAgICB0aGlzLl9wb3NpdGlvblJlZ2lvbiA9IHRoaXMuZ2V0UG9zaXRpb25SZWdpb24oIG1vZGVsLm1hZ25ldC5wb3NpdGlvblByb3BlcnR5LmdldCgpICk7XHJcbiAgICB0aGlzLl90b3BDb2lsUHJveGltaXR5ID0gMDtcclxuICAgIHRoaXMuX2JvdHRvbUNvaWxQcm94aW1pdHkgPSAwO1xyXG4gICAgdGhpcy5fdG9wQ29pbEZpZWxkU3RyZW5ndGggPSAwO1xyXG4gICAgdGhpcy5fYm90dG9tQ29pbEZpbGVkU3RyZW5ndGggPSAwO1xyXG5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoXHJcbiAgICAgIFsgbW9kZWwudG9wQ29pbFZpc2libGVQcm9wZXJ0eSwgbW9kZWwubWFnbmV0LnBvc2l0aW9uUHJvcGVydHkgXSxcclxuICAgICAgKCBzaG93VG9wQ29pbCwgcG9zaXRpb24gKSA9PiB7XHJcbiAgICAgICAgdGhpcy5fYWRqYWNlbnRDb2lsID0gdGhpcy5nZXRDb2lsQWRqYWNlbnRUb1ZlY3RvciggcG9zaXRpb24sIHNob3dUb3BDb2lsICk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgbGV0IGRpc3RhbmNlTW92ZWQgPSAwO1xyXG5cclxuICAgIG1vZGVsLm1hZ25ldC5wb3NpdGlvblByb3BlcnR5LmxpbmsoICggcG9zaXRpb24sIG9sZFBvc2l0aW9uICkgPT4ge1xyXG4gICAgICB0aGlzLl9wb3NpdGlvblJlZ2lvbiA9IHRoaXMuZ2V0UG9zaXRpb25SZWdpb24oIHBvc2l0aW9uICk7XHJcblxyXG4gICAgICBpZiAoIG9sZFBvc2l0aW9uICYmIHRoaXMuc2hvd0V4dHJhTW92ZVRleHQgKSB7XHJcbiAgICAgICAgY29uc3QgZGVsdGEgPSBwb3NpdGlvbi5kaXN0YW5jZSggb2xkUG9zaXRpb24gKTtcclxuICAgICAgICBkaXN0YW5jZU1vdmVkICs9IGRlbHRhO1xyXG4gICAgICAgIHRoaXMuc2hvd0V4dHJhTW92ZVRleHQgPSBkaXN0YW5jZU1vdmVkIDwgRElTVEFOQ0VfTU9WRURfVEhSRVNIT0xEO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9tYWduZXRTY3JlZW5TaWRlID0gcG9zaXRpb24ueCA+PSBTQ1JFRU5fTUlEUE9JTlRfWCA/ICdyaWdodCcgOiAnbGVmdCc7XHJcbiAgICAgIHRoaXMuX21hZ25ldEluQ29pbCA9ICF0aGlzLmdldFRvcENvaWxQcm94aW1pdHlSZWdpb24oIHBvc2l0aW9uICkgfHwgIXRoaXMuZ2V0Qm90dG9tQ29pbFByb3hpbWl0eVJlZ2lvbiggcG9zaXRpb24gKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAqIE1hZ25ldCBwb3NpdGlvbiByZWdpb24gbWV0aG9kcyBmb3IgYWRqYWNlbnQgY29pbCBhbmQgc2ltIHNjcmVlbiBwb3NpdGlvbi4gKlxyXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGludGVyc2VjdGVkIGNvaWwgcmVnaW9uIG9yIC0xIG9uIGVycm9yLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0VG91Y2hpbmdDb2lsKCkge1xyXG4gICAgY29uc3QgY29pbFNpZGVzID0gW1xyXG4gICAgICB7IHNpZGU6ICd0b3AnLCBjb2lsOiBDb2lsVHlwZUVudW0uVFdPX0NPSUwgfSxcclxuICAgICAgeyBzaWRlOiAnYm90dG9tJywgY29pbDogQ29pbFR5cGVFbnVtLlRXT19DT0lMIH0sXHJcbiAgICAgIHsgc2lkZTogJ3RvcCcsIGNvaWw6IENvaWxUeXBlRW51bS5GT1VSX0NPSUwgfSxcclxuICAgICAgeyBzaWRlOiAnYm90dG9tJywgY29pbDogQ29pbFR5cGVFbnVtLkZPVVJfQ09JTCB9XHJcbiAgICBdO1xyXG4gICAgY29uc3QgaW50ZXJzZWN0ZWRCb3VuZHMgPSB0aGlzLm1vZGVsLmdldEludGVyc2VjdGVkUmVzdHJpY3RlZEJvdW5kcyggY3JlYXRlTWFnbmV0Qm91bmRzKCB0aGlzLm1hZ25ldC5wb3NpdGlvblByb3BlcnR5LnZhbHVlICkgKTtcclxuICAgIGNvbnN0IGxpc3RPZlJlc3RyaWN0ZWRCb3VuZHMgPSB0aGlzLm1vZGVsLmJvdHRvbUNvaWxSZXN0cmljdGVkQm91bmRzLmNvbmNhdCggdGhpcy5tb2RlbC50b3BDb2lsUmVzdHJpY3RlZEJvdW5kcyApO1xyXG4gICAgY29uc3QgaSA9IGxpc3RPZlJlc3RyaWN0ZWRCb3VuZHMuaW5kZXhPZiggaW50ZXJzZWN0ZWRCb3VuZHMgKTtcclxuXHJcbiAgICAvLyBUT0RPOiBUaGUgY29kZSBiZWxvdyBsb29rcyB3cm9uZy4gIFRoZSByZXR1cm4gdHlwZSBkb2Vzbid0IG1hdGNoIHRoZSBoZWFkZXIgZG9jcywgYW5kIHRoZSB3aG9sZSB0aGluZyBpcyB0b29cclxuICAgIC8vICB0aWdodGx5IGNvdXBsZWQgdG8gdGhlIHdheSBib3VuZHMgYXJlIG1hbmFnZWQgaW4gdGhlIG1vZGVsLiAgU2VlXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZmFyYWRheXMtbGF3L2lzc3Vlcy8xNjQuIEFsc28sIGl0IHNlZW1zIGxpa2UgaXQgc2hvdWxkIHJldHVybiBudWxsIGluc3RlYWQgb2YgLTEgaWZcclxuICAgIC8vIG5vIGludGVyc2VjdGlvbiBpcyBmb3VuZC5cclxuXHJcbiAgICBpZiAoIGkgPj0gMCApIHtcclxuICAgICAgcmV0dXJuIGNvaWxTaWRlc1sgaSBdO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBhZGphY2VudCBjb2lsLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0IGFkamFjZW50Q29pbCgpIHtcclxuICAgIHJldHVybiB0aGlzLl9hZGphY2VudENvaWw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHNpZGUgb2YgdGhlIHNpbSBzY3JlZW4gY29udGFpbmluZyB0aGUgbWFnbmV0LiBUaGUgbWlkcG9pbnQgaXMgc2V0IHRvIHRoZSAncmlnaHQnIHNpZGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge1N0cmluZ31cclxuICAgKi9cclxuICBnZXQgbWFnbmV0U2NyZWVuU2lkZSgpIHtcclxuICAgIHJldHVybiB0aGlzLl9tYWduZXRTY3JlZW5TaWRlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBtYWduZXQgaW50ZXJzZWN0IHRoZSBib3VuZHMgb2YgYSBjb2lsLiBVc2VkIGluIGNvbmp1bmN0aW9uIHdpdGggJ2FkamFjZW50Q29pbCcuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge1N0cmluZ31cclxuICAgKi9cclxuICBnZXQgbWFnbmV0SW5Db2lsKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX21hZ25ldEluQ29pbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBnZXQgbWFnbmV0SW5PclZlcnlDbG9zZVRvQ29pbCgpIHtcclxuICAgIHJldHVybiB0aGlzLm1hZ25ldFRvQm90dG9tQ29pbFByb3hpbWl0eSA8PSAxIHx8XHJcbiAgICAgICAgICAgKCB0aGlzLm1vZGVsLnRvcENvaWxWaXNpYmxlUHJvcGVydHkuZ2V0KCkgJiYgdGhpcy5tYWduZXRUb1RvcENvaWxQcm94aW1pdHkgPD0gMSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBjb2lsIHdob3NlIGlubmVyIHZlcnRpY2FsIGJvdW5kcyBjb250YWluIHRoZSB5IHZhbHVlIG9mIHRoZSBnaXZlbiB2ZWN0b3IuXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSAge1ZlY3RvcjJ9IHZlY3RvclxyXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0Q29pbEFkamFjZW50VG9WZWN0b3IoIHZlY3Rvciwgc2hvd1RvcENvaWwgKSB7XHJcbiAgICBjb25zdCB5ID0gdmVjdG9yLnk7XHJcblxyXG4gICAgaWYgKCBzaG93VG9wQ29pbCAmJiB5IDw9IHRoaXMuX3RvcENvaWxJbm5lckJvdW5kcy5tYXhZICYmIHkgPj0gdGhpcy5fdG9wQ29pbElubmVyQm91bmRzLm1pblkgKSB7XHJcbiAgICAgIHJldHVybiBDb2lsVHlwZUVudW0uVFdPX0NPSUw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB5IDw9IHRoaXMuX2JvdHRvbUNvaWxJbm5lckJvdW5kcy5tYXhZICYmIHkgPj0gdGhpcy5fYm90dG9tQ29pbElubmVyQm91bmRzLm1pblkgKSB7XHJcbiAgICAgIHJldHVybiBDb2lsVHlwZUVudW0uRk9VUl9DT0lMO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBDb2lsVHlwZUVudW0uTk9fQ09JTDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgY3VycmVudCByZWdpb24sIG9uZSBvZiAwLi45XHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7aW50fVxyXG4gICAqL1xyXG4gIGdldCBwb3NpdGlvblJlZ2lvbigpIHtcclxuICAgIHJldHVybiB0aGlzLl9wb3NpdGlvblJlZ2lvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgcmVnaW9uIG9mIHRoZSBzY3JlZW4gdGhhdCBjb250YWlucyB0aGUgcHJvdmlkZWQgdmVjdG9yLiBGb3IgRmFyYWRheSdzIExhdywgdGhlIHNjcmVlbiBpcyBkaXZpZGVkIGludG8gOVxyXG4gICAqIHJlZ2lvbnMgdGhhdCBhcmUgbnVtYmVyZWQgMCAtIDggaW4gcm93IG1ham9yIG9yZGVyLCBsZWZ0IHRvIHJpZ2h0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSAge1ZlY3RvcjJ9IHZlY3RvclxyXG4gICAqIEByZXR1cm5zIHtpbnR9XHJcbiAgICovXHJcbiAgZ2V0UG9zaXRpb25SZWdpb24oIHsgeCwgeSB9ICkge1xyXG4gICAgcmV0dXJuICggTlVNQkVSX09GX1JPV1MgKiBNYWduZXRSZWdpb25NYW5hZ2VyLmdldFJvdyggeSApICkgKyBNYWduZXRSZWdpb25NYW5hZ2VyLmdldENvbHVtbiggeCApO1xyXG4gIH1cclxuXHJcbiAgZ2V0IG1hZ25ldEF0RWRnZSgpIHtcclxuICAgIHJldHVybiB0aGlzLmlzVmVjdG9yQXRFZGdlKCB0aGlzLm1hZ25ldC5wb3NpdGlvblByb3BlcnR5LmdldCgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzVmVjdG9yQXRFZGdlKCB7IHgsIHkgfSApIHtcclxuICAgIGNvbnN0IHsgbWluWCwgbWluWSwgbWF4WCwgbWF4WSB9ID0gdGhpcy5ib3VuZHM7XHJcbiAgICBjb25zdCB2ZXJ0aWNhbE1pbkRpc3RhbmNlID0gTWF0aC5taW4oIE1hdGguYWJzKCB5IC0gbWluWSApLCBNYXRoLmFicyggeSAtIG1heFkgKSApO1xyXG4gICAgY29uc3QgaG9yaXpvbnRhbE1pbkRpc3RhbmNlID0gTWF0aC5taW4oIE1hdGguYWJzKCB4IC0gbWluWCApLCBNYXRoLmFicyggeCAtIG1heFggKSApO1xyXG5cclxuICAgIHJldHVybiB2ZXJ0aWNhbE1pbkRpc3RhbmNlIDw9IFZFUlRJQ0FMX0VER0VfVE9MRVJBTkNFIHx8IGhvcml6b250YWxNaW5EaXN0YW5jZSA8PSBIT1JJWk9OVEFMX0VER0VfVE9MRVJBTkNFO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtNYWduZXREaXJlY3Rpb25FbnVtfVxyXG4gICAqL1xyXG4gIGdldCBjb2lsRGlyZWN0aW9uKCkge1xyXG4gICAgY29uc3QgY29pbHNDZW50ZXJYID0gdGhpcy50b3BDb2lsLnBvc2l0aW9uLnggKyAoIHRoaXMuYm90dG9tQ29pbC5wb3NpdGlvbi54IC0gdGhpcy50b3BDb2lsLnBvc2l0aW9uLnggKSAvIDI7XHJcbiAgICByZXR1cm4gKCB0aGlzLm1hZ25ldC5wb3NpdGlvblByb3BlcnR5LmdldCgpLnggLSBjb2lsc0NlbnRlclggKSA8IDAgPyBSSUdIVCA6IExFRlQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSB2ZWN0b3JcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldEJvdHRvbUNvaWxEaXJlY3Rpb24oIHZlY3RvciApIHtcclxuICAgIHJldHVybiAoIHZlY3Rvci54IC0gdGhpcy5ib3R0b21Db2lsLnBvc2l0aW9uICkgPCAwID8gUklHSFQgOiBMRUZUO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0IG1hZ25ldFRvVG9wQ29pbFByb3hpbWl0eSgpIHtcclxuICAgIHJldHVybiB0aGlzLmdldFRvcENvaWxQcm94aW1pdHlSZWdpb24oIHRoaXMubWFnbmV0LnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldCBtYWduZXRUb0JvdHRvbUNvaWxQcm94aW1pdHkoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRCb3R0b21Db2lsUHJveGltaXR5UmVnaW9uKCB0aGlzLm1hZ25ldC5wb3NpdGlvblByb3BlcnR5LmdldCgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIFZlY3RvcjJcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldFRvcENvaWxQcm94aW1pdHlSZWdpb24oIHZlY3RvciApIHtcclxuICAgIGlmICggIXRoaXMubW9kZWwudG9wQ29pbFZpc2libGVQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q29pbFByb3hpbWl0eVJlZ2lvbiggdmVjdG9yLCBDb2lsVHlwZUVudW0uVFdPX0NPSUwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHZlY3RvclxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0Qm90dG9tQ29pbFByb3hpbWl0eVJlZ2lvbiggdmVjdG9yICkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q29pbFByb3hpbWl0eVJlZ2lvbiggdmVjdG9yLCBDb2lsVHlwZUVudW0uRk9VUl9DT0lMICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSB2ZWN0b3JcclxuICAgKiBAcGFyYW0ge0NvaWxUeXBlRW51bX0gY29pbFR5cGVcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldENvaWxQcm94aW1pdHlSZWdpb24oIHZlY3RvciwgY29pbFR5cGUgKSB7XHJcbiAgICBjb25zdCBtYWduZXRCb3VuZHMgPSBjcmVhdGVNYWduZXRCb3VuZHMoIHZlY3RvciApO1xyXG4gICAgY29uc3QgY29pbEJvdW5kcyA9IGNvaWxUeXBlID09PSBDb2lsVHlwZUVudW0uVFdPX0NPSUwgPyB0aGlzLl90b3BDb2lsSW5uZXJCb3VuZHMgOiB0aGlzLl9ib3R0b21Db2lsSW5uZXJCb3VuZHM7XHJcblxyXG4gICAgaWYgKCBjb2lsQm91bmRzLmludGVyc2VjdHNCb3VuZHMoIG1hZ25ldEJvdW5kcyApICkge1xyXG4gICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkaXN0YW5jZSA9IHRoaXMuZ2V0RGlzdGFuY2VUb0NvaWwoIHZlY3RvciwgY29pbFR5cGUgKTtcclxuXHJcbiAgICByZXR1cm4gVXRpbHMucm91bmRTeW1tZXRyaWMoIGNvaWxQcm94aW1pdHlUb1JlZ2lvbi5ldmFsdWF0ZSggZGlzdGFuY2UgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSBjb2lsVHlwZVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0RGlzdGFuY2VUb0NvaWwoIHBvc2l0aW9uLCBjb2lsVHlwZSApIHtcclxuICAgIGNvbnN0IGNvaWxQb3NpdGlvbiA9IGNvaWxUeXBlID09PSBDb2lsVHlwZUVudW0uVFdPX0NPSUwgPyB0aGlzLnRvcENvaWwucG9zaXRpb24gOiB0aGlzLmJvdHRvbUNvaWwucG9zaXRpb247XHJcbiAgICByZXR1cm4gcG9zaXRpb24uZGlzdGFuY2UoIGNvaWxQb3NpdGlvbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0VG9wQ29pbEZpZWxkU3RyZW5ndGhSZWdpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRGaWVsZFN0cmVuZ3RoQXRDb2lsUmVnaW9uKCB0aGlzLnRvcENvaWwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldEJvdHRvbUNvaWxGaWVsZFN0cmVuZ3RoUmVnaW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0RmllbGRTdHJlbmd0aEF0Q29pbFJlZ2lvbiggdGhpcy5ib3R0b21Db2lsICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtDb2lsfSBjb2lsXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRGaWVsZFN0cmVuZ3RoQXRDb2lsUmVnaW9uKCBjb2lsICkge1xyXG4gICAgaWYgKCBjb2lsLnBvc2l0aW9uLmRpc3RhbmNlKCB0aGlzLm1hZ25ldC5wb3NpdGlvblByb3BlcnR5LmdldCgpICkgPCA3MCApIHtcclxuICAgICAgcmV0dXJuIDQ7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZmllbGRTdHJlbmd0aCA9IGNvaWwubWFnbmV0aWNGaWVsZFByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIHJldHVybiBNYWduZXRSZWdpb25NYW5hZ2VyLm1hcEZpZWxkU3RyZW5ndGhUb0ludGVnZXIoIE1hdGguYWJzKCBmaWVsZFN0cmVuZ3RoICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdG9wTWFnbmV0QW5pbWF0aW9uV2l0aEtleWJvYXJkKCkge1xyXG4gICAgdGhpcy5tYWduZXRTdG9wcGVkQnlLZXlib2FyZCA9IHRydWU7XHJcbiAgICB0aGlzLm1hZ25ldElzQW5pbWF0aW5nID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIGlzQW5pbWF0aW5nXHJcbiAgICovXHJcbiAgc2V0TWFnbmV0SXNBbmltYXRpbmcoIGlzQW5pbWF0aW5nICkge1xyXG4gICAgdGhpcy5tYWduZXRJc0FuaW1hdGluZyA9IGlzQW5pbWF0aW5nO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0S2V5Ym9hcmRTdG9wKCkge1xyXG4gICAgdGhpcy5tYWduZXRTdG9wcGVkQnlLZXlib2FyZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSAwLWJhc2VkIHJvdyBudW1iZXIgZm9yIGEgeSBjb29yZGluYXRlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHlcclxuICAgKiBAcmV0dXJucyB7aW50fVxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRSb3coIHkgKSB7XHJcbiAgICByZXR1cm4gTWFnbmV0UmVnaW9uTWFuYWdlci5tYXBTZWdtZW50KCB5LCByb3dIZWlnaHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgMC1iYXNlZCBjb2x1bW4gbnVtYmVyIGZvciBhbiB4IGNvb3JkaW5hdGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSAge051bWJlcn0geFxyXG4gICAqIEByZXR1cm5zIHtpbnR9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldENvbHVtbiggeCApIHtcclxuICAgIHJldHVybiBNYWduZXRSZWdpb25NYW5hZ2VyLm1hcFNlZ21lbnQoIHgsIGNvbHVtbldpZHRoICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXBzIGEgZ2l2ZW4gbnVtYmVyIHRvIGEgZ2l2ZW4gc2VnbWVudCBudW1iZXIgYmFzZWQgb24gdGhlIHNpemUgb2YgdGhlIHNlZ21lbnQuIFRoaXMgZnVuY3Rpb24gYXNzdW1lcyB0aGF0IHRoZXJlXHJcbiAgICogYXJlIGFuIGVxdWFsIG51bWJlciBvZiByb3dzIGFuZCBjb2x1bW5zLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSAge051bWJlcn0gdmFsdWVcclxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHNlZ21lbnRTaXplXHJcbiAgICogQHJldHVybnMge2ludH1cclxuICAgKi9cclxuICBzdGF0aWMgbWFwU2VnbWVudCggdmFsdWUsIHNlZ21lbnRTaXplICkge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgTlVNQkVSX09GX1JPV1M7IGkrKyApIHtcclxuICAgICAgaWYgKCB2YWx1ZSA8PSAoIGkgKyAxICkgKiBzZWdtZW50U2l6ZSApIHtcclxuICAgICAgICByZXR1cm4gaTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIE5VTUJFUl9PRl9ST1dTIC0gMTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZmllbGRTdHJlbmd0aFxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgc3RhdGljIG1hcEZpZWxkU3RyZW5ndGhUb0ludGVnZXIoIGZpZWxkU3RyZW5ndGggKSB7XHJcbiAgICBpZiAoIGZpZWxkU3RyZW5ndGggPCAwLjAyNSApIHtcclxuICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggZmllbGRTdHJlbmd0aCA+PSAwLjAyNSAmJiBmaWVsZFN0cmVuZ3RoIDwgMC4wNCApIHtcclxuICAgICAgcmV0dXJuIDE7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggZmllbGRTdHJlbmd0aCA+PSAwLjA0ICYmIGZpZWxkU3RyZW5ndGggPCAwLjA3NSApIHtcclxuICAgICAgcmV0dXJuIDI7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggZmllbGRTdHJlbmd0aCA+PSAwLjA3NSAmJiBmaWVsZFN0cmVuZ3RoIDwgMC4xOCApIHtcclxuICAgICAgcmV0dXJuIDM7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIDQ7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mYXJhZGF5c0xhdy5yZWdpc3RlciggJ01hZ25ldFJlZ2lvbk1hbmFnZXInLCBNYWduZXRSZWdpb25NYW5hZ2VyICk7XHJcbmV4cG9ydCBkZWZhdWx0IE1hZ25ldFJlZ2lvbk1hbmFnZXI7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGNBQWMsTUFBTSxzQ0FBc0M7QUFDakUsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLG9CQUFvQixNQUFNLDRCQUE0QjtBQUM3RCxPQUFPQyxtQkFBbUIsTUFBTSxpQ0FBaUM7QUFDakUsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjs7QUFFNUM7QUFDQSxNQUFNQyxjQUFjLEdBQUcsQ0FBQztBQUN4QixNQUFN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