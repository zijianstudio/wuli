// Copyright 2018-2021, University of Colorado Boulder

/**
 * Represents a mixed or non-mixed fraction represented by numerator/denominator and optionally a whole number.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import fractionsCommon from '../../fractionsCommon.js';
import BuildingType from './BuildingType.js';
import Group from './Group.js';
import NumberSpot from './NumberSpot.js';
import NumberSpotType from './NumberSpotType.js';

// constants

// {number} - Controls for the sizing of the number group
const HORIZONTAL_SPACING = 18;
const FRACTIONAL_NUMBER_HEIGHT = 43;
const FRACTIONAL_NUMBER_WIDTH = 32;
const WHOLE_NUMBER_HEIGHT = 100;
const WHOLE_NUMBER_WIDTH = FractionsCommonConstants.WHOLE_FRACTIONAL_SIZE_RATIO * FRACTIONAL_NUMBER_WIDTH;
const VERTICAL_SPACING = 12;

// {Bounds2} - Of the spots, in an arbitrary coordinate frame
const SEPARATE_NUMERATOR_BOUNDS = Bounds2.rect(0, 0, FRACTIONAL_NUMBER_WIDTH, FRACTIONAL_NUMBER_HEIGHT);
const SEPARATE_DENOMINATOR_BOUNDS = Bounds2.rect(0, SEPARATE_NUMERATOR_BOUNDS.bottom + 2 * VERTICAL_SPACING, FRACTIONAL_NUMBER_WIDTH, FRACTIONAL_NUMBER_HEIGHT);
const SEPARATE_WHOLE_BOUNDS = Bounds2.rect(-WHOLE_NUMBER_WIDTH - HORIZONTAL_SPACING, (2 * FRACTIONAL_NUMBER_HEIGHT + 2 * VERTICAL_SPACING - WHOLE_NUMBER_HEIGHT) / 2, WHOLE_NUMBER_WIDTH, WHOLE_NUMBER_HEIGHT);

// {Vector2} - Centers of the two "groups" of spots (mixed and unmixed)
const UNMIXED_CENTER = SEPARATE_NUMERATOR_BOUNDS.union(SEPARATE_DENOMINATOR_BOUNDS).center;
const MIXED_CENTER = SEPARATE_NUMERATOR_BOUNDS.union(SEPARATE_DENOMINATOR_BOUNDS).union(SEPARATE_WHOLE_BOUNDS).center;

// {Bounds2} - "Centered" versions of the spot bounds for the "unmixed" case
const NUMERATOR_BOUNDS = SEPARATE_NUMERATOR_BOUNDS.shiftedXY(-UNMIXED_CENTER.x, -UNMIXED_CENTER.y);
const DENOMINATOR_BOUNDS = SEPARATE_DENOMINATOR_BOUNDS.shiftedXY(-UNMIXED_CENTER.x, -UNMIXED_CENTER.y);

// {Bounds2} - "Centered" versions of the spot bounds for the "mixed" case
const MIXED_NUMERATOR_BOUNDS = SEPARATE_NUMERATOR_BOUNDS.shiftedXY(-MIXED_CENTER.x, -MIXED_CENTER.y);
const MIXED_DENOMINATOR_BOUNDS = SEPARATE_DENOMINATOR_BOUNDS.shiftedXY(-MIXED_CENTER.x, -MIXED_CENTER.y);
const MIXED_WHOLE_BOUNDS = SEPARATE_WHOLE_BOUNDS.shiftedXY(-MIXED_CENTER.x, -MIXED_CENTER.y);
class NumberGroup extends Group {
  /**
   * @param {boolean} isMixedNumber
   * @param {Object} [options]
   */
  constructor(isMixedNumber, options) {
    options = merge({
      // {Property.<Range|null>}
      activeNumberRangeProperty: new Property(null)
    }, options);
    super(BuildingType.NUMBER);

    // @public {boolean}
    this.isMixedNumber = isMixedNumber;

    // @private {Property.<Range|null>}
    this.activeNumberRangeProperty = options.activeNumberRangeProperty;

    // @public {NumberSpot}
    this.numeratorSpot = new NumberSpot(this, NumberSpotType.NUMERATOR, isMixedNumber ? MIXED_NUMERATOR_BOUNDS : NUMERATOR_BOUNDS);

    // @public {NumberSpot}
    this.denominatorSpot = new NumberSpot(this, NumberSpotType.DENOMINATOR, isMixedNumber ? MIXED_DENOMINATOR_BOUNDS : DENOMINATOR_BOUNDS);

    // @public {NumberSpot|null}
    this.wholeSpot = isMixedNumber ? new NumberSpot(this, NumberSpotType.WHOLE, MIXED_WHOLE_BOUNDS) : null;

    // @public {Array.<NumberSpot>}
    this.spots = [...(isMixedNumber ? [this.wholeSpot] : []), this.numeratorSpot, this.denominatorSpot];

    // @public {Property.<boolean>}
    this.isCompleteProperty = new DerivedProperty(this.spots.map(spot => spot.pieceProperty), () => {
      return _.every(this.spots, spot => spot.pieceProperty.value !== null);
    });

    // @public {Property.<boolean>}
    this.hasPiecesProperty = new DerivedProperty(this.spots.map(spot => spot.pieceProperty), () => {
      return _.some(this.spots, spot => spot.pieceProperty.value !== null);
    });

    // @public {Property.<boolean>}
    this.hasDoubleDigitsProperty = new DerivedProperty([this.numeratorSpot.pieceProperty, this.denominatorSpot.pieceProperty], (numeratorPiece, denominatorPiece) => {
      return numeratorPiece && numeratorPiece.number >= 10 || denominatorPiece && denominatorPiece.number >= 10;
    });
    const allSpotsBounds = _.reduce(this.spots, (bounds, spot) => bounds.union(spot.bounds), Bounds2.NOTHING);

    // @public {Property.<Bounds2>}
    this.allSpotsBoundsProperty = new DerivedProperty([this.hasDoubleDigitsProperty], hasDoubleDigits => {
      const bounds = allSpotsBounds.copy();
      if (hasDoubleDigits) {
        bounds.maxX += 10;
        if (!this.isMixedNumber) {
          bounds.minX -= 10;
        }
      }
      return bounds;
    });

    // @private {function}
    this.spotAllowedListener = this.updateAllowedSpots.bind(this);
    this.activeNumberRangeProperty.link(this.spotAllowedListener);
  }

  /**
   * The current "amount" of the entire group
   * @public
   * @override
   *
   * @returns {Fraction}
   */
  get totalFraction() {
    const fraction = new Fraction(this.wholeSpot && this.wholeSpot.pieceProperty.value ? this.wholeSpot.pieceProperty.value.number : 0, 1);
    if (this.numeratorSpot.pieceProperty.value && this.denominatorSpot.pieceProperty.value) {
      fraction.add(new Fraction(this.numeratorSpot.pieceProperty.value.number, this.denominatorSpot.pieceProperty.value.number));
    }
    return fraction;
  }

  /**
   * The center positions of every "container" in the group.
   * @public
   * @override
   *
   * @returns {Array.<Vector2>}
   */
  get centerPoints() {
    return [this.positionProperty.value];
  }

  /**
   * Updates whether each spot is marked as "normal" or "cannot drop a piece on it".
   * @private
   */
  updateAllowedSpots() {
    if (this.isMixedNumber) {
      const range = this.activeNumberRangeProperty.value;
      this.numeratorSpot.showNotAllowedProperty.value = range === null ? false : !this.canPlaceNumberInSpot(range.min, this.numeratorSpot);
      this.denominatorSpot.showNotAllowedProperty.value = range === null ? false : !this.canPlaceNumberInSpot(range.max, this.denominatorSpot);
      this.wholeSpot.showNotAllowedProperty.value = range === null ? false : !this.canPlaceNumberInSpot(range.min, this.wholeSpot);
    }
  }

  /**
   * Returns whether it would be legal, given the current state, to place a number piece with the given number into
   * the given spot.
   * @public
   *
   * @param {number} number
   * @param {NumberSpot} spot
   * @returns {boolean}
   */
  canPlaceNumberInSpot(number, spot) {
    // NOTE: Intellij formatting really mucks up things if this is simplified to one boolean expression. It's left in
    // this more verbose form so the nesting is more understandable.

    if (spot.pieceProperty.value !== null) {
      return false;
    }
    if (this.isMixedNumber) {
      if (spot === this.denominatorSpot && this.numeratorSpot.pieceProperty.value !== null && this.numeratorSpot.pieceProperty.value.number >= number) {
        return false;
      }
      if (spot === this.numeratorSpot && this.denominatorSpot.pieceProperty.value !== null && this.denominatorSpot.pieceProperty.value.number <= number) {
        return false;
      }

      // Don't allow 1s here as there is no valid choice
      if (spot === this.denominatorSpot && number === 1) {
        return false;
      }

      // Don't allow putting 2-digit numbers in the wholes spot.
      if (spot === this.wholeSpot && number >= 10) {
        return false;
      }
    }
    return true;
  }

  /**
   * Whether this group contains any pieces.
   * @public
   * @override
   *
   * @returns {boolean}
   */
  hasAnyPieces() {
    return _.some(this.spots, spot => spot.pieceProperty.value !== null);
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.activeNumberRangeProperty.unlink(this.spotAllowedListener);
    super.dispose();
  }
}
fractionsCommon.register('NumberGroup', NumberGroup);
export default NumberGroup;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJtZXJnZSIsIkZyYWN0aW9uIiwiRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzIiwiZnJhY3Rpb25zQ29tbW9uIiwiQnVpbGRpbmdUeXBlIiwiR3JvdXAiLCJOdW1iZXJTcG90IiwiTnVtYmVyU3BvdFR5cGUiLCJIT1JJWk9OVEFMX1NQQUNJTkciLCJGUkFDVElPTkFMX05VTUJFUl9IRUlHSFQiLCJGUkFDVElPTkFMX05VTUJFUl9XSURUSCIsIldIT0xFX05VTUJFUl9IRUlHSFQiLCJXSE9MRV9OVU1CRVJfV0lEVEgiLCJXSE9MRV9GUkFDVElPTkFMX1NJWkVfUkFUSU8iLCJWRVJUSUNBTF9TUEFDSU5HIiwiU0VQQVJBVEVfTlVNRVJBVE9SX0JPVU5EUyIsInJlY3QiLCJTRVBBUkFURV9ERU5PTUlOQVRPUl9CT1VORFMiLCJib3R0b20iLCJTRVBBUkFURV9XSE9MRV9CT1VORFMiLCJVTk1JWEVEX0NFTlRFUiIsInVuaW9uIiwiY2VudGVyIiwiTUlYRURfQ0VOVEVSIiwiTlVNRVJBVE9SX0JPVU5EUyIsInNoaWZ0ZWRYWSIsIngiLCJ5IiwiREVOT01JTkFUT1JfQk9VTkRTIiwiTUlYRURfTlVNRVJBVE9SX0JPVU5EUyIsIk1JWEVEX0RFTk9NSU5BVE9SX0JPVU5EUyIsIk1JWEVEX1dIT0xFX0JPVU5EUyIsIk51bWJlckdyb3VwIiwiY29uc3RydWN0b3IiLCJpc01peGVkTnVtYmVyIiwib3B0aW9ucyIsImFjdGl2ZU51bWJlclJhbmdlUHJvcGVydHkiLCJOVU1CRVIiLCJudW1lcmF0b3JTcG90IiwiTlVNRVJBVE9SIiwiZGVub21pbmF0b3JTcG90IiwiREVOT01JTkFUT1IiLCJ3aG9sZVNwb3QiLCJXSE9MRSIsInNwb3RzIiwiaXNDb21wbGV0ZVByb3BlcnR5IiwibWFwIiwic3BvdCIsInBpZWNlUHJvcGVydHkiLCJfIiwiZXZlcnkiLCJ2YWx1ZSIsImhhc1BpZWNlc1Byb3BlcnR5Iiwic29tZSIsImhhc0RvdWJsZURpZ2l0c1Byb3BlcnR5IiwibnVtZXJhdG9yUGllY2UiLCJkZW5vbWluYXRvclBpZWNlIiwibnVtYmVyIiwiYWxsU3BvdHNCb3VuZHMiLCJyZWR1Y2UiLCJib3VuZHMiLCJOT1RISU5HIiwiYWxsU3BvdHNCb3VuZHNQcm9wZXJ0eSIsImhhc0RvdWJsZURpZ2l0cyIsImNvcHkiLCJtYXhYIiwibWluWCIsInNwb3RBbGxvd2VkTGlzdGVuZXIiLCJ1cGRhdGVBbGxvd2VkU3BvdHMiLCJiaW5kIiwibGluayIsInRvdGFsRnJhY3Rpb24iLCJmcmFjdGlvbiIsImFkZCIsImNlbnRlclBvaW50cyIsInBvc2l0aW9uUHJvcGVydHkiLCJyYW5nZSIsInNob3dOb3RBbGxvd2VkUHJvcGVydHkiLCJjYW5QbGFjZU51bWJlckluU3BvdCIsIm1pbiIsIm1heCIsImhhc0FueVBpZWNlcyIsImRpc3Bvc2UiLCJ1bmxpbmsiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk51bWJlckdyb3VwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYSBtaXhlZCBvciBub24tbWl4ZWQgZnJhY3Rpb24gcmVwcmVzZW50ZWQgYnkgbnVtZXJhdG9yL2Rlbm9taW5hdG9yIGFuZCBvcHRpb25hbGx5IGEgd2hvbGUgbnVtYmVyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvbW9kZWwvRnJhY3Rpb24uanMnO1xyXG5pbXBvcnQgRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9GcmFjdGlvbnNDb21tb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgZnJhY3Rpb25zQ29tbW9uIGZyb20gJy4uLy4uL2ZyYWN0aW9uc0NvbW1vbi5qcyc7XHJcbmltcG9ydCBCdWlsZGluZ1R5cGUgZnJvbSAnLi9CdWlsZGluZ1R5cGUuanMnO1xyXG5pbXBvcnQgR3JvdXAgZnJvbSAnLi9Hcm91cC5qcyc7XHJcbmltcG9ydCBOdW1iZXJTcG90IGZyb20gJy4vTnVtYmVyU3BvdC5qcyc7XHJcbmltcG9ydCBOdW1iZXJTcG90VHlwZSBmcm9tICcuL051bWJlclNwb3RUeXBlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5cclxuLy8ge251bWJlcn0gLSBDb250cm9scyBmb3IgdGhlIHNpemluZyBvZiB0aGUgbnVtYmVyIGdyb3VwXHJcbmNvbnN0IEhPUklaT05UQUxfU1BBQ0lORyA9IDE4O1xyXG5jb25zdCBGUkFDVElPTkFMX05VTUJFUl9IRUlHSFQgPSA0MztcclxuY29uc3QgRlJBQ1RJT05BTF9OVU1CRVJfV0lEVEggPSAzMjtcclxuY29uc3QgV0hPTEVfTlVNQkVSX0hFSUdIVCA9IDEwMDtcclxuY29uc3QgV0hPTEVfTlVNQkVSX1dJRFRIID0gRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLldIT0xFX0ZSQUNUSU9OQUxfU0laRV9SQVRJTyAqIEZSQUNUSU9OQUxfTlVNQkVSX1dJRFRIO1xyXG5jb25zdCBWRVJUSUNBTF9TUEFDSU5HID0gMTI7XHJcblxyXG4vLyB7Qm91bmRzMn0gLSBPZiB0aGUgc3BvdHMsIGluIGFuIGFyYml0cmFyeSBjb29yZGluYXRlIGZyYW1lXHJcbmNvbnN0IFNFUEFSQVRFX05VTUVSQVRPUl9CT1VORFMgPSBCb3VuZHMyLnJlY3QoIDAsIDAsIEZSQUNUSU9OQUxfTlVNQkVSX1dJRFRILCBGUkFDVElPTkFMX05VTUJFUl9IRUlHSFQgKTtcclxuY29uc3QgU0VQQVJBVEVfREVOT01JTkFUT1JfQk9VTkRTID0gQm91bmRzMi5yZWN0KCAwLCBTRVBBUkFURV9OVU1FUkFUT1JfQk9VTkRTLmJvdHRvbSArIDIgKiBWRVJUSUNBTF9TUEFDSU5HLCBGUkFDVElPTkFMX05VTUJFUl9XSURUSCwgRlJBQ1RJT05BTF9OVU1CRVJfSEVJR0hUICk7XHJcbmNvbnN0IFNFUEFSQVRFX1dIT0xFX0JPVU5EUyA9IEJvdW5kczIucmVjdCggLVdIT0xFX05VTUJFUl9XSURUSCAtIEhPUklaT05UQUxfU1BBQ0lORywgKCAyICogRlJBQ1RJT05BTF9OVU1CRVJfSEVJR0hUICsgMiAqIFZFUlRJQ0FMX1NQQUNJTkcgLSBXSE9MRV9OVU1CRVJfSEVJR0hUICkgLyAyLCBXSE9MRV9OVU1CRVJfV0lEVEgsIFdIT0xFX05VTUJFUl9IRUlHSFQgKTtcclxuXHJcbi8vIHtWZWN0b3IyfSAtIENlbnRlcnMgb2YgdGhlIHR3byBcImdyb3Vwc1wiIG9mIHNwb3RzIChtaXhlZCBhbmQgdW5taXhlZClcclxuY29uc3QgVU5NSVhFRF9DRU5URVIgPSBTRVBBUkFURV9OVU1FUkFUT1JfQk9VTkRTLnVuaW9uKCBTRVBBUkFURV9ERU5PTUlOQVRPUl9CT1VORFMgKS5jZW50ZXI7XHJcbmNvbnN0IE1JWEVEX0NFTlRFUiA9IFNFUEFSQVRFX05VTUVSQVRPUl9CT1VORFMudW5pb24oIFNFUEFSQVRFX0RFTk9NSU5BVE9SX0JPVU5EUyApLnVuaW9uKCBTRVBBUkFURV9XSE9MRV9CT1VORFMgKS5jZW50ZXI7XHJcblxyXG4vLyB7Qm91bmRzMn0gLSBcIkNlbnRlcmVkXCIgdmVyc2lvbnMgb2YgdGhlIHNwb3QgYm91bmRzIGZvciB0aGUgXCJ1bm1peGVkXCIgY2FzZVxyXG5jb25zdCBOVU1FUkFUT1JfQk9VTkRTID0gU0VQQVJBVEVfTlVNRVJBVE9SX0JPVU5EUy5zaGlmdGVkWFkoIC1VTk1JWEVEX0NFTlRFUi54LCAtVU5NSVhFRF9DRU5URVIueSApO1xyXG5jb25zdCBERU5PTUlOQVRPUl9CT1VORFMgPSBTRVBBUkFURV9ERU5PTUlOQVRPUl9CT1VORFMuc2hpZnRlZFhZKCAtVU5NSVhFRF9DRU5URVIueCwgLVVOTUlYRURfQ0VOVEVSLnkgKTtcclxuXHJcbi8vIHtCb3VuZHMyfSAtIFwiQ2VudGVyZWRcIiB2ZXJzaW9ucyBvZiB0aGUgc3BvdCBib3VuZHMgZm9yIHRoZSBcIm1peGVkXCIgY2FzZVxyXG5jb25zdCBNSVhFRF9OVU1FUkFUT1JfQk9VTkRTID0gU0VQQVJBVEVfTlVNRVJBVE9SX0JPVU5EUy5zaGlmdGVkWFkoIC1NSVhFRF9DRU5URVIueCwgLU1JWEVEX0NFTlRFUi55ICk7XHJcbmNvbnN0IE1JWEVEX0RFTk9NSU5BVE9SX0JPVU5EUyA9IFNFUEFSQVRFX0RFTk9NSU5BVE9SX0JPVU5EUy5zaGlmdGVkWFkoIC1NSVhFRF9DRU5URVIueCwgLU1JWEVEX0NFTlRFUi55ICk7XHJcbmNvbnN0IE1JWEVEX1dIT0xFX0JPVU5EUyA9IFNFUEFSQVRFX1dIT0xFX0JPVU5EUy5zaGlmdGVkWFkoIC1NSVhFRF9DRU5URVIueCwgLU1JWEVEX0NFTlRFUi55ICk7XHJcblxyXG5jbGFzcyBOdW1iZXJHcm91cCBleHRlbmRzIEdyb3VwIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzTWl4ZWROdW1iZXJcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGlzTWl4ZWROdW1iZXIsIG9wdGlvbnMgKSB7XHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIHtQcm9wZXJ0eS48UmFuZ2V8bnVsbD59XHJcbiAgICAgIGFjdGl2ZU51bWJlclJhbmdlUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggbnVsbCApXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIEJ1aWxkaW5nVHlwZS5OVU1CRVIgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufVxyXG4gICAgdGhpcy5pc01peGVkTnVtYmVyID0gaXNNaXhlZE51bWJlcjtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7UHJvcGVydHkuPFJhbmdlfG51bGw+fVxyXG4gICAgdGhpcy5hY3RpdmVOdW1iZXJSYW5nZVByb3BlcnR5ID0gb3B0aW9ucy5hY3RpdmVOdW1iZXJSYW5nZVByb3BlcnR5O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge051bWJlclNwb3R9XHJcbiAgICB0aGlzLm51bWVyYXRvclNwb3QgPSBuZXcgTnVtYmVyU3BvdCggdGhpcywgTnVtYmVyU3BvdFR5cGUuTlVNRVJBVE9SLCBpc01peGVkTnVtYmVyID8gTUlYRURfTlVNRVJBVE9SX0JPVU5EUyA6IE5VTUVSQVRPUl9CT1VORFMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtOdW1iZXJTcG90fVxyXG4gICAgdGhpcy5kZW5vbWluYXRvclNwb3QgPSBuZXcgTnVtYmVyU3BvdCggdGhpcywgTnVtYmVyU3BvdFR5cGUuREVOT01JTkFUT1IsIGlzTWl4ZWROdW1iZXIgPyBNSVhFRF9ERU5PTUlOQVRPUl9CT1VORFMgOiBERU5PTUlOQVRPUl9CT1VORFMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtOdW1iZXJTcG90fG51bGx9XHJcbiAgICB0aGlzLndob2xlU3BvdCA9IGlzTWl4ZWROdW1iZXIgPyBuZXcgTnVtYmVyU3BvdCggdGhpcywgTnVtYmVyU3BvdFR5cGUuV0hPTEUsIE1JWEVEX1dIT0xFX0JPVU5EUyApIDogbnVsbDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48TnVtYmVyU3BvdD59XHJcbiAgICB0aGlzLnNwb3RzID0gW1xyXG4gICAgICAuLi4oIGlzTWl4ZWROdW1iZXIgPyBbIHRoaXMud2hvbGVTcG90IF0gOiBbXSApLFxyXG4gICAgICB0aGlzLm51bWVyYXRvclNwb3QsXHJcbiAgICAgIHRoaXMuZGVub21pbmF0b3JTcG90XHJcbiAgICBdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn1cclxuICAgIHRoaXMuaXNDb21wbGV0ZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggdGhpcy5zcG90cy5tYXAoIHNwb3QgPT4gc3BvdC5waWVjZVByb3BlcnR5ICksICgpID0+IHtcclxuICAgICAgcmV0dXJuIF8uZXZlcnkoIHRoaXMuc3BvdHMsIHNwb3QgPT4gc3BvdC5waWVjZVByb3BlcnR5LnZhbHVlICE9PSBudWxsICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fVxyXG4gICAgdGhpcy5oYXNQaWVjZXNQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIHRoaXMuc3BvdHMubWFwKCBzcG90ID0+IHNwb3QucGllY2VQcm9wZXJ0eSApLCAoKSA9PiB7XHJcbiAgICAgIHJldHVybiBfLnNvbWUoIHRoaXMuc3BvdHMsIHNwb3QgPT4gc3BvdC5waWVjZVByb3BlcnR5LnZhbHVlICE9PSBudWxsICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fVxyXG4gICAgdGhpcy5oYXNEb3VibGVEaWdpdHNQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFtcclxuICAgICAgdGhpcy5udW1lcmF0b3JTcG90LnBpZWNlUHJvcGVydHksXHJcbiAgICAgIHRoaXMuZGVub21pbmF0b3JTcG90LnBpZWNlUHJvcGVydHlcclxuICAgIF0sICggbnVtZXJhdG9yUGllY2UsIGRlbm9taW5hdG9yUGllY2UgKSA9PiB7XHJcbiAgICAgIHJldHVybiAoIG51bWVyYXRvclBpZWNlICYmIG51bWVyYXRvclBpZWNlLm51bWJlciA+PSAxMCApIHx8XHJcbiAgICAgICAgICAgICAoIGRlbm9taW5hdG9yUGllY2UgJiYgZGVub21pbmF0b3JQaWVjZS5udW1iZXIgPj0gMTAgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBhbGxTcG90c0JvdW5kcyA9IF8ucmVkdWNlKCB0aGlzLnNwb3RzLCAoIGJvdW5kcywgc3BvdCApID0+IGJvdW5kcy51bmlvbiggc3BvdC5ib3VuZHMgKSwgQm91bmRzMi5OT1RISU5HICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPEJvdW5kczI+fVxyXG4gICAgdGhpcy5hbGxTcG90c0JvdW5kc1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLmhhc0RvdWJsZURpZ2l0c1Byb3BlcnR5IF0sIGhhc0RvdWJsZURpZ2l0cyA9PiB7XHJcbiAgICAgIGNvbnN0IGJvdW5kcyA9IGFsbFNwb3RzQm91bmRzLmNvcHkoKTtcclxuICAgICAgaWYgKCBoYXNEb3VibGVEaWdpdHMgKSB7XHJcbiAgICAgICAgYm91bmRzLm1heFggKz0gMTA7XHJcbiAgICAgICAgaWYgKCAhdGhpcy5pc01peGVkTnVtYmVyICkge1xyXG4gICAgICAgICAgYm91bmRzLm1pblggLT0gMTA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBib3VuZHM7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufVxyXG4gICAgdGhpcy5zcG90QWxsb3dlZExpc3RlbmVyID0gdGhpcy51cGRhdGVBbGxvd2VkU3BvdHMuYmluZCggdGhpcyApO1xyXG4gICAgdGhpcy5hY3RpdmVOdW1iZXJSYW5nZVByb3BlcnR5LmxpbmsoIHRoaXMuc3BvdEFsbG93ZWRMaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGN1cnJlbnQgXCJhbW91bnRcIiBvZiB0aGUgZW50aXJlIGdyb3VwXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge0ZyYWN0aW9ufVxyXG4gICAqL1xyXG4gIGdldCB0b3RhbEZyYWN0aW9uKCkge1xyXG4gICAgY29uc3QgZnJhY3Rpb24gPSBuZXcgRnJhY3Rpb24oIHRoaXMud2hvbGVTcG90ICYmIHRoaXMud2hvbGVTcG90LnBpZWNlUHJvcGVydHkudmFsdWUgPyB0aGlzLndob2xlU3BvdC5waWVjZVByb3BlcnR5LnZhbHVlLm51bWJlciA6IDAsIDEgKTtcclxuICAgIGlmICggdGhpcy5udW1lcmF0b3JTcG90LnBpZWNlUHJvcGVydHkudmFsdWUgJiYgdGhpcy5kZW5vbWluYXRvclNwb3QucGllY2VQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgZnJhY3Rpb24uYWRkKCBuZXcgRnJhY3Rpb24oIHRoaXMubnVtZXJhdG9yU3BvdC5waWVjZVByb3BlcnR5LnZhbHVlLm51bWJlciwgdGhpcy5kZW5vbWluYXRvclNwb3QucGllY2VQcm9wZXJ0eS52YWx1ZS5udW1iZXIgKSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZyYWN0aW9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGNlbnRlciBwb3NpdGlvbnMgb2YgZXZlcnkgXCJjb250YWluZXJcIiBpbiB0aGUgZ3JvdXAuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge0FycmF5LjxWZWN0b3IyPn1cclxuICAgKi9cclxuICBnZXQgY2VudGVyUG9pbnRzKCkge1xyXG4gICAgcmV0dXJuIFsgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHdoZXRoZXIgZWFjaCBzcG90IGlzIG1hcmtlZCBhcyBcIm5vcm1hbFwiIG9yIFwiY2Fubm90IGRyb3AgYSBwaWVjZSBvbiBpdFwiLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlQWxsb3dlZFNwb3RzKCkge1xyXG4gICAgaWYgKCB0aGlzLmlzTWl4ZWROdW1iZXIgKSB7XHJcbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5hY3RpdmVOdW1iZXJSYW5nZVByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgICAgdGhpcy5udW1lcmF0b3JTcG90LnNob3dOb3RBbGxvd2VkUHJvcGVydHkudmFsdWUgPSByYW5nZSA9PT0gbnVsbCA/IGZhbHNlIDogIXRoaXMuY2FuUGxhY2VOdW1iZXJJblNwb3QoIHJhbmdlLm1pbiwgdGhpcy5udW1lcmF0b3JTcG90ICk7XHJcbiAgICAgIHRoaXMuZGVub21pbmF0b3JTcG90LnNob3dOb3RBbGxvd2VkUHJvcGVydHkudmFsdWUgPSByYW5nZSA9PT0gbnVsbCA/IGZhbHNlIDogIXRoaXMuY2FuUGxhY2VOdW1iZXJJblNwb3QoIHJhbmdlLm1heCwgdGhpcy5kZW5vbWluYXRvclNwb3QgKTtcclxuICAgICAgdGhpcy53aG9sZVNwb3Quc2hvd05vdEFsbG93ZWRQcm9wZXJ0eS52YWx1ZSA9IHJhbmdlID09PSBudWxsID8gZmFsc2UgOiAhdGhpcy5jYW5QbGFjZU51bWJlckluU3BvdCggcmFuZ2UubWluLCB0aGlzLndob2xlU3BvdCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIGl0IHdvdWxkIGJlIGxlZ2FsLCBnaXZlbiB0aGUgY3VycmVudCBzdGF0ZSwgdG8gcGxhY2UgYSBudW1iZXIgcGllY2Ugd2l0aCB0aGUgZ2l2ZW4gbnVtYmVyIGludG9cclxuICAgKiB0aGUgZ2l2ZW4gc3BvdC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtYmVyXHJcbiAgICogQHBhcmFtIHtOdW1iZXJTcG90fSBzcG90XHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgY2FuUGxhY2VOdW1iZXJJblNwb3QoIG51bWJlciwgc3BvdCApIHtcclxuICAgIC8vIE5PVEU6IEludGVsbGlqIGZvcm1hdHRpbmcgcmVhbGx5IG11Y2tzIHVwIHRoaW5ncyBpZiB0aGlzIGlzIHNpbXBsaWZpZWQgdG8gb25lIGJvb2xlYW4gZXhwcmVzc2lvbi4gSXQncyBsZWZ0IGluXHJcbiAgICAvLyB0aGlzIG1vcmUgdmVyYm9zZSBmb3JtIHNvIHRoZSBuZXN0aW5nIGlzIG1vcmUgdW5kZXJzdGFuZGFibGUuXHJcblxyXG4gICAgaWYgKCBzcG90LnBpZWNlUHJvcGVydHkudmFsdWUgIT09IG51bGwgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMuaXNNaXhlZE51bWJlciApIHtcclxuICAgICAgaWYgKCBzcG90ID09PSB0aGlzLmRlbm9taW5hdG9yU3BvdCAmJiB0aGlzLm51bWVyYXRvclNwb3QucGllY2VQcm9wZXJ0eS52YWx1ZSAhPT0gbnVsbCAmJiB0aGlzLm51bWVyYXRvclNwb3QucGllY2VQcm9wZXJ0eS52YWx1ZS5udW1iZXIgPj0gbnVtYmVyICkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHNwb3QgPT09IHRoaXMubnVtZXJhdG9yU3BvdCAmJiB0aGlzLmRlbm9taW5hdG9yU3BvdC5waWVjZVByb3BlcnR5LnZhbHVlICE9PSBudWxsICYmIHRoaXMuZGVub21pbmF0b3JTcG90LnBpZWNlUHJvcGVydHkudmFsdWUubnVtYmVyIDw9IG51bWJlciApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIERvbid0IGFsbG93IDFzIGhlcmUgYXMgdGhlcmUgaXMgbm8gdmFsaWQgY2hvaWNlXHJcbiAgICAgIGlmICggc3BvdCA9PT0gdGhpcy5kZW5vbWluYXRvclNwb3QgJiYgbnVtYmVyID09PSAxICkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRG9uJ3QgYWxsb3cgcHV0dGluZyAyLWRpZ2l0IG51bWJlcnMgaW4gdGhlIHdob2xlcyBzcG90LlxyXG4gICAgICBpZiAoIHNwb3QgPT09IHRoaXMud2hvbGVTcG90ICYmIG51bWJlciA+PSAxMCApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgdGhpcyBncm91cCBjb250YWlucyBhbnkgcGllY2VzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGhhc0FueVBpZWNlcygpIHtcclxuICAgIHJldHVybiBfLnNvbWUoIHRoaXMuc3BvdHMsIHNwb3QgPT4gc3BvdC5waWVjZVByb3BlcnR5LnZhbHVlICE9PSBudWxsICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5hY3RpdmVOdW1iZXJSYW5nZVByb3BlcnR5LnVubGluayggdGhpcy5zcG90QWxsb3dlZExpc3RlbmVyICk7XHJcblxyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuZnJhY3Rpb25zQ29tbW9uLnJlZ2lzdGVyKCAnTnVtYmVyR3JvdXAnLCBOdW1iZXJHcm91cCApO1xyXG5leHBvcnQgZGVmYXVsdCBOdW1iZXJHcm91cDtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsUUFBUSxNQUFNLDZDQUE2QztBQUNsRSxPQUFPQyx3QkFBd0IsTUFBTSwwQ0FBMEM7QUFDL0UsT0FBT0MsZUFBZSxN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