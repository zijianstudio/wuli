// Copyright 2015-2023, University of Colorado Boulder

/**
 * A builder produces an output by running an input through a set of functions.
 * The functions occupy a set of slots in what is conceptually a series pipeline.
 * Each slot contains 0 or 1 function instance.
 * An empty slot is equivalent to the identity function.
 * Each slot has an associated window, through which a card can be seen when passing through the builder
 * when the 'See Inside' feature is turned on.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Emitter from '../../../../../axon/js/Emitter.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import merge from '../../../../../phet-core/js/merge.js';
import functionBuilder from '../../../functionBuilder.js';
import FBColors from '../../FBColors.js';
import FBConstants from '../../FBConstants.js';
import FunctionSlot from './FunctionSlot.js';

// {number} x-offset of center of 'see inside' window from it's corresponding slot in the builder
const WINDOW_X_OFFSET = FBConstants.FUNCTION_SIZE.width / 2 - FBConstants.FUNCTION_X_INSET_FACTOR * FBConstants.FUNCTION_SIZE.width / 2;
export default class Builder {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      // {number} number of function slots
      numberOfSlots: 1,
      // {number} horizontal distance between input and output slots
      width: 200,
      // {number} height of the builder at it ends
      endHeight: FBConstants.FUNCTION_SIZE.height + 58,
      // {number} height of the builder at its waist
      waistHeight: FBConstants.FUNCTION_SIZE.height + 20,
      // {Vector2} position of the center of the input
      position: new Vector2(0, 0),
      // {*} color scheme for builder, with these properties:
      // top - top color for vertical gradient
      // middle - middle color for vertical gradient
      // bottom - bottom color for vertical gradient
      // ends - color for builder ends
      colorScheme: FBColors.BUILDER_BLUE
    }, options);

    // verify duck typing of colorScheme
    assert && assert(options.colorScheme.top && options.colorScheme.middle && options.colorScheme.bottom && options.colorScheme.ends);

    // @public (read-only)
    this.numberOfSlots = options.numberOfSlots;
    this.width = options.width;
    this.endHeight = options.endHeight;
    this.waistHeight = options.waistHeight;
    this.position = options.position;
    this.colorScheme = options.colorScheme;

    // width occupied by slots
    let totalWidthOfSlots = options.numberOfSlots * FBConstants.FUNCTION_SIZE.width;
    if (options.numberOfSlots > 1) {
      totalWidthOfSlots -= (options.numberOfSlots - 1) * FBConstants.FUNCTION_X_INSET_FACTOR * FBConstants.FUNCTION_SIZE.width;
    }
    assert && assert(totalWidthOfSlots > 0);

    // @public {FunctionSlot[]} slots
    this.slots = [];
    const leftSlotPosition = new Vector2(this.position.x + (this.width - totalWidthOfSlots + FBConstants.FUNCTION_SIZE.width) / 2, this.position.y);
    for (let i = 0; i < options.numberOfSlots; i++) {
      // position is at slot's center
      const dx = i * FBConstants.FUNCTION_SIZE.width - i * FBConstants.FUNCTION_X_INSET_FACTOR * FBConstants.FUNCTION_SIZE.width;
      const slotPosition = leftSlotPosition.plusXY(dx, 0);

      // each slot is initially empty
      this.slots.push(new FunctionSlot(slotPosition));
    }
    assert && assert(this.slots.length === this.numberOfSlots);

    // @public emit is called when any function changes
    this.functionChangedEmitter = new Emitter();

    // @public for layout convenience
    this.left = this.position.x;
    this.right = this.left + options.width;
    this.centerX = this.left + options.width / 2;
  }

  /**
   * Applies functions to an input.
   *
   * @param {*} input - input, type is specific to the functions
   * @param {number} numberOfFunctionsToApply - how many functions to apply (empty slots are effectively identity functions)
   * @returns {*} output, with same type as input
   * @public
   */
  applyFunctions(input, numberOfFunctionsToApply) {
    assert && assert(numberOfFunctionsToApply >= 0 && numberOfFunctionsToApply <= this.numberOfSlots);
    let output = input;
    for (let i = 0; i < numberOfFunctionsToApply; i++) {
      const slot = this.slots[i];
      if (!slot.isEmpty()) {
        output = slot.functionInstance.applyFunction(output);
      }
    }
    return output;
  }

  /**
   * Applies all functions that are in the builder.
   *
   * @param {*} input - input, type is specific to the functions
   * @returns {*} output, with same type as input
   * @public
   */
  applyAllFunctions(input) {
    return this.applyFunctions(input, this.numberOfSlots);
  }

  /**
   * Puts a function instance into a slot.
   *
   * @param {AbstractFunction} functionInstance
   * @param {number} slotNumber
   * @public
   */
  addFunctionInstance(functionInstance, slotNumber) {
    assert && assert(functionInstance);
    assert && assert(this.isValidSlotNumber(slotNumber));
    assert && assert(!this.containsFunctionInstance(functionInstance), 'function is already in builder');
    const slot = this.slots[slotNumber];
    assert && assert(slot.isEmpty(), `slot ${slotNumber} is occupied`);
    slot.functionInstance = functionInstance;
    this.functionChangedEmitter.emit();
  }

  /**
   * Removes a function instance from a slot.
   *
   * @param {AbstractFunction} functionInstance
   * @param {number} slotNumber
   * @public
   */
  removeFunctionInstance(functionInstance, slotNumber) {
    assert && assert(functionInstance);
    assert && assert(this.isValidSlotNumber(slotNumber));
    const slot = this.slots[slotNumber];
    assert && assert(slot.contains(functionInstance), `functionInstance is not in slot ${slotNumber}`);
    slot.clear();
    this.functionChangedEmitter.emit();
  }

  /**
   * Does the builder contain the specified function instance?
   *
   * @param {AbstractFunction} functionInstance
   * @returns {boolean}
   * @public
   */
  containsFunctionInstance(functionInstance) {
    assert && assert(functionInstance);
    return this.getSlotNumber(functionInstance) !== FunctionSlot.NO_SLOT_NUMBER;
  }

  /**
   * Is the specified slot number valid?
   *
   * @param {number} slotNumber
   * @returns {boolean}
   * @public
   */
  isValidSlotNumber(slotNumber) {
    return slotNumber >= 0 && slotNumber < this.slots.length;
  }

  /**
   * Gets the slot number occupied by a function instance.
   *
   * @param {AbstractFunction} functionInstance
   * @returns {number} FunctionSlot.NO_SLOT_NUMBER if the function instance isn't in any slot
   * @public
   */
  getSlotNumber(functionInstance) {
    assert && assert(functionInstance);
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      if (slot.contains(functionInstance)) {
        return i;
      }
    }
    return FunctionSlot.NO_SLOT_NUMBER;
  }

  /**
   * Gets the position of the specified slot.
   *
   * @param {number} slotNumber
   * @returns {Vector2} position in the global coordinate frame
   * @public
   */
  getSlotPosition(slotNumber) {
    assert && assert(this.isValidSlotNumber(slotNumber));
    return this.slots[slotNumber].position;
  }

  /**
   * Gets the slot that is closest to the specified position.
   *
   * @param {Vector2} position - the position of the function instance
   * @param {number} distanceThreshold - position must be at least this close to slot's position
   * @returns {number} slot number, FunctionSlot.NO_SLOT_NUMBER if no slot is close enough
   * @public
   */
  getClosestSlot(position, distanceThreshold) {
    assert && assert(position);
    let slotNumber = FunctionSlot.NO_SLOT_NUMBER;
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      if (slotNumber === FunctionSlot.NO_SLOT_NUMBER) {
        if (slot.position.distance(position) < distanceThreshold) {
          slotNumber = i;
        }
      } else if (slot.position.distance(position) < this.slots[slotNumber].position.distance(position)) {
        slotNumber = i;
      }
    }
    return slotNumber;
  }

  /**
   * Is the specified window number valid?
   *
   * @param {number} windowNumber
   * @returns {boolean}
   * @public
   */
  isValidWindowNumber(windowNumber) {
    return this.isValidSlotNumber(windowNumber);
  }

  /**
   * Gets the position (center) of a 'see inside' window.
   *
   * @param {number} windowNumber
   * @returns {Vector2}
   * @public
   */
  getWindowPosition(windowNumber) {
    assert && assert(this.isValidWindowNumber(windowNumber));
    const slot = this.slots[windowNumber];
    return new Vector2(slot.position.x + WINDOW_X_OFFSET, slot.position.y);
  }

  /**
   * Gets the number of the window whose x coordinate is > some x coordinate.
   *
   * @param {number} x
   * @returns {number} FunctionSlot.NO_SLOT_NUMBER if there is no window >
   * @public
   */
  getWindowNumberGreaterThan(x) {
    for (let i = 0; i < this.slots.length; i++) {
      const windowPosition = this.getWindowPosition(i);
      if (windowPosition.x > x) {
        return i;
      }
    }
    return FunctionSlot.NO_SLOT_NUMBER;
  }

  /**
   * Gets the number of the window whose x coordinate is <= some x coordinate.
   *
   * @param {number} x
   * @returns {number} FunctionSlot.NO_SLOT_NUMBER if there is no window <=
   * @public
   */
  getWindowNumberLessThanOrEqualTo(x) {
    for (let i = this.slots.length - 1; i >= 0; i--) {
      const windowPosition = this.getWindowPosition(i);
      if (windowPosition.x <= x) {
        return i;
      }
    }
    return FunctionSlot.NO_SLOT_NUMBER;
  }
}
functionBuilder.register('Builder', Builder);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwiVmVjdG9yMiIsIm1lcmdlIiwiZnVuY3Rpb25CdWlsZGVyIiwiRkJDb2xvcnMiLCJGQkNvbnN0YW50cyIsIkZ1bmN0aW9uU2xvdCIsIldJTkRPV19YX09GRlNFVCIsIkZVTkNUSU9OX1NJWkUiLCJ3aWR0aCIsIkZVTkNUSU9OX1hfSU5TRVRfRkFDVE9SIiwiQnVpbGRlciIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsIm51bWJlck9mU2xvdHMiLCJlbmRIZWlnaHQiLCJoZWlnaHQiLCJ3YWlzdEhlaWdodCIsInBvc2l0aW9uIiwiY29sb3JTY2hlbWUiLCJCVUlMREVSX0JMVUUiLCJhc3NlcnQiLCJ0b3AiLCJtaWRkbGUiLCJib3R0b20iLCJlbmRzIiwidG90YWxXaWR0aE9mU2xvdHMiLCJzbG90cyIsImxlZnRTbG90UG9zaXRpb24iLCJ4IiwieSIsImkiLCJkeCIsInNsb3RQb3NpdGlvbiIsInBsdXNYWSIsInB1c2giLCJsZW5ndGgiLCJmdW5jdGlvbkNoYW5nZWRFbWl0dGVyIiwibGVmdCIsInJpZ2h0IiwiY2VudGVyWCIsImFwcGx5RnVuY3Rpb25zIiwiaW5wdXQiLCJudW1iZXJPZkZ1bmN0aW9uc1RvQXBwbHkiLCJvdXRwdXQiLCJzbG90IiwiaXNFbXB0eSIsImZ1bmN0aW9uSW5zdGFuY2UiLCJhcHBseUZ1bmN0aW9uIiwiYXBwbHlBbGxGdW5jdGlvbnMiLCJhZGRGdW5jdGlvbkluc3RhbmNlIiwic2xvdE51bWJlciIsImlzVmFsaWRTbG90TnVtYmVyIiwiY29udGFpbnNGdW5jdGlvbkluc3RhbmNlIiwiZW1pdCIsInJlbW92ZUZ1bmN0aW9uSW5zdGFuY2UiLCJjb250YWlucyIsImNsZWFyIiwiZ2V0U2xvdE51bWJlciIsIk5PX1NMT1RfTlVNQkVSIiwiZ2V0U2xvdFBvc2l0aW9uIiwiZ2V0Q2xvc2VzdFNsb3QiLCJkaXN0YW5jZVRocmVzaG9sZCIsImRpc3RhbmNlIiwiaXNWYWxpZFdpbmRvd051bWJlciIsIndpbmRvd051bWJlciIsImdldFdpbmRvd1Bvc2l0aW9uIiwiZ2V0V2luZG93TnVtYmVyR3JlYXRlclRoYW4iLCJ3aW5kb3dQb3NpdGlvbiIsImdldFdpbmRvd051bWJlckxlc3NUaGFuT3JFcXVhbFRvIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCdWlsZGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgYnVpbGRlciBwcm9kdWNlcyBhbiBvdXRwdXQgYnkgcnVubmluZyBhbiBpbnB1dCB0aHJvdWdoIGEgc2V0IG9mIGZ1bmN0aW9ucy5cclxuICogVGhlIGZ1bmN0aW9ucyBvY2N1cHkgYSBzZXQgb2Ygc2xvdHMgaW4gd2hhdCBpcyBjb25jZXB0dWFsbHkgYSBzZXJpZXMgcGlwZWxpbmUuXHJcbiAqIEVhY2ggc2xvdCBjb250YWlucyAwIG9yIDEgZnVuY3Rpb24gaW5zdGFuY2UuXHJcbiAqIEFuIGVtcHR5IHNsb3QgaXMgZXF1aXZhbGVudCB0byB0aGUgaWRlbnRpdHkgZnVuY3Rpb24uXHJcbiAqIEVhY2ggc2xvdCBoYXMgYW4gYXNzb2NpYXRlZCB3aW5kb3csIHRocm91Z2ggd2hpY2ggYSBjYXJkIGNhbiBiZSBzZWVuIHdoZW4gcGFzc2luZyB0aHJvdWdoIHRoZSBidWlsZGVyXHJcbiAqIHdoZW4gdGhlICdTZWUgSW5zaWRlJyBmZWF0dXJlIGlzIHR1cm5lZCBvbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgZnVuY3Rpb25CdWlsZGVyIGZyb20gJy4uLy4uLy4uL2Z1bmN0aW9uQnVpbGRlci5qcyc7XHJcbmltcG9ydCBGQkNvbG9ycyBmcm9tICcuLi8uLi9GQkNvbG9ycy5qcyc7XHJcbmltcG9ydCBGQkNvbnN0YW50cyBmcm9tICcuLi8uLi9GQkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBGdW5jdGlvblNsb3QgZnJvbSAnLi9GdW5jdGlvblNsb3QuanMnO1xyXG5cclxuLy8ge251bWJlcn0geC1vZmZzZXQgb2YgY2VudGVyIG9mICdzZWUgaW5zaWRlJyB3aW5kb3cgZnJvbSBpdCdzIGNvcnJlc3BvbmRpbmcgc2xvdCBpbiB0aGUgYnVpbGRlclxyXG5jb25zdCBXSU5ET1dfWF9PRkZTRVQgPSAoIEZCQ29uc3RhbnRzLkZVTkNUSU9OX1NJWkUud2lkdGggLyAyICkgLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoIEZCQ29uc3RhbnRzLkZVTkNUSU9OX1hfSU5TRVRfRkFDVE9SICogRkJDb25zdGFudHMuRlVOQ1RJT05fU0laRS53aWR0aCAvIDIgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJ1aWxkZXIge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyB7bnVtYmVyfSBudW1iZXIgb2YgZnVuY3Rpb24gc2xvdHNcclxuICAgICAgbnVtYmVyT2ZTbG90czogMSxcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9IGhvcml6b250YWwgZGlzdGFuY2UgYmV0d2VlbiBpbnB1dCBhbmQgb3V0cHV0IHNsb3RzXHJcbiAgICAgIHdpZHRoOiAyMDAsXHJcblxyXG4gICAgICAvLyB7bnVtYmVyfSBoZWlnaHQgb2YgdGhlIGJ1aWxkZXIgYXQgaXQgZW5kc1xyXG4gICAgICBlbmRIZWlnaHQ6IEZCQ29uc3RhbnRzLkZVTkNUSU9OX1NJWkUuaGVpZ2h0ICsgNTgsXHJcblxyXG4gICAgICAvLyB7bnVtYmVyfSBoZWlnaHQgb2YgdGhlIGJ1aWxkZXIgYXQgaXRzIHdhaXN0XHJcbiAgICAgIHdhaXN0SGVpZ2h0OiBGQkNvbnN0YW50cy5GVU5DVElPTl9TSVpFLmhlaWdodCArIDIwLFxyXG5cclxuICAgICAgLy8ge1ZlY3RvcjJ9IHBvc2l0aW9uIG9mIHRoZSBjZW50ZXIgb2YgdGhlIGlucHV0XHJcbiAgICAgIHBvc2l0aW9uOiBuZXcgVmVjdG9yMiggMCwgMCApLFxyXG5cclxuICAgICAgLy8geyp9IGNvbG9yIHNjaGVtZSBmb3IgYnVpbGRlciwgd2l0aCB0aGVzZSBwcm9wZXJ0aWVzOlxyXG4gICAgICAvLyB0b3AgLSB0b3AgY29sb3IgZm9yIHZlcnRpY2FsIGdyYWRpZW50XHJcbiAgICAgIC8vIG1pZGRsZSAtIG1pZGRsZSBjb2xvciBmb3IgdmVydGljYWwgZ3JhZGllbnRcclxuICAgICAgLy8gYm90dG9tIC0gYm90dG9tIGNvbG9yIGZvciB2ZXJ0aWNhbCBncmFkaWVudFxyXG4gICAgICAvLyBlbmRzIC0gY29sb3IgZm9yIGJ1aWxkZXIgZW5kc1xyXG4gICAgICBjb2xvclNjaGVtZTogRkJDb2xvcnMuQlVJTERFUl9CTFVFXHJcblxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHZlcmlmeSBkdWNrIHR5cGluZyBvZiBjb2xvclNjaGVtZVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5jb2xvclNjaGVtZS50b3AgJiYgb3B0aW9ucy5jb2xvclNjaGVtZS5taWRkbGUgJiZcclxuICAgIG9wdGlvbnMuY29sb3JTY2hlbWUuYm90dG9tICYmIG9wdGlvbnMuY29sb3JTY2hlbWUuZW5kcyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSlcclxuICAgIHRoaXMubnVtYmVyT2ZTbG90cyA9IG9wdGlvbnMubnVtYmVyT2ZTbG90cztcclxuICAgIHRoaXMud2lkdGggPSBvcHRpb25zLndpZHRoO1xyXG4gICAgdGhpcy5lbmRIZWlnaHQgPSBvcHRpb25zLmVuZEhlaWdodDtcclxuICAgIHRoaXMud2Fpc3RIZWlnaHQgPSBvcHRpb25zLndhaXN0SGVpZ2h0O1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG9wdGlvbnMucG9zaXRpb247XHJcbiAgICB0aGlzLmNvbG9yU2NoZW1lID0gb3B0aW9ucy5jb2xvclNjaGVtZTtcclxuXHJcbiAgICAvLyB3aWR0aCBvY2N1cGllZCBieSBzbG90c1xyXG4gICAgbGV0IHRvdGFsV2lkdGhPZlNsb3RzID0gb3B0aW9ucy5udW1iZXJPZlNsb3RzICogRkJDb25zdGFudHMuRlVOQ1RJT05fU0laRS53aWR0aDtcclxuICAgIGlmICggb3B0aW9ucy5udW1iZXJPZlNsb3RzID4gMSApIHtcclxuICAgICAgdG90YWxXaWR0aE9mU2xvdHMgLT0gKCAoIG9wdGlvbnMubnVtYmVyT2ZTbG90cyAtIDEgKSAqIEZCQ29uc3RhbnRzLkZVTkNUSU9OX1hfSU5TRVRfRkFDVE9SICogRkJDb25zdGFudHMuRlVOQ1RJT05fU0laRS53aWR0aCApO1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdG90YWxXaWR0aE9mU2xvdHMgPiAwICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RnVuY3Rpb25TbG90W119IHNsb3RzXHJcbiAgICB0aGlzLnNsb3RzID0gW107XHJcbiAgICBjb25zdCBsZWZ0U2xvdFBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIHRoaXMucG9zaXRpb24ueCArICggdGhpcy53aWR0aCAtIHRvdGFsV2lkdGhPZlNsb3RzICsgRkJDb25zdGFudHMuRlVOQ1RJT05fU0laRS53aWR0aCApIC8gMiwgdGhpcy5wb3NpdGlvbi55ICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBvcHRpb25zLm51bWJlck9mU2xvdHM7IGkrKyApIHtcclxuXHJcbiAgICAgIC8vIHBvc2l0aW9uIGlzIGF0IHNsb3QncyBjZW50ZXJcclxuICAgICAgY29uc3QgZHggPSBpICogRkJDb25zdGFudHMuRlVOQ1RJT05fU0laRS53aWR0aCAtIGkgKiBGQkNvbnN0YW50cy5GVU5DVElPTl9YX0lOU0VUX0ZBQ1RPUiAqIEZCQ29uc3RhbnRzLkZVTkNUSU9OX1NJWkUud2lkdGg7XHJcbiAgICAgIGNvbnN0IHNsb3RQb3NpdGlvbiA9IGxlZnRTbG90UG9zaXRpb24ucGx1c1hZKCBkeCwgMCApO1xyXG5cclxuICAgICAgLy8gZWFjaCBzbG90IGlzIGluaXRpYWxseSBlbXB0eVxyXG4gICAgICB0aGlzLnNsb3RzLnB1c2goIG5ldyBGdW5jdGlvblNsb3QoIHNsb3RQb3NpdGlvbiApICk7XHJcbiAgICB9XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnNsb3RzLmxlbmd0aCA9PT0gdGhpcy5udW1iZXJPZlNsb3RzICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyBlbWl0IGlzIGNhbGxlZCB3aGVuIGFueSBmdW5jdGlvbiBjaGFuZ2VzXHJcbiAgICB0aGlzLmZ1bmN0aW9uQ2hhbmdlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgZm9yIGxheW91dCBjb252ZW5pZW5jZVxyXG4gICAgdGhpcy5sZWZ0ID0gdGhpcy5wb3NpdGlvbi54O1xyXG4gICAgdGhpcy5yaWdodCA9IHRoaXMubGVmdCArIG9wdGlvbnMud2lkdGg7XHJcbiAgICB0aGlzLmNlbnRlclggPSB0aGlzLmxlZnQgKyAoIG9wdGlvbnMud2lkdGggLyAyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBsaWVzIGZ1bmN0aW9ucyB0byBhbiBpbnB1dC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Kn0gaW5wdXQgLSBpbnB1dCwgdHlwZSBpcyBzcGVjaWZpYyB0byB0aGUgZnVuY3Rpb25zXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bWJlck9mRnVuY3Rpb25zVG9BcHBseSAtIGhvdyBtYW55IGZ1bmN0aW9ucyB0byBhcHBseSAoZW1wdHkgc2xvdHMgYXJlIGVmZmVjdGl2ZWx5IGlkZW50aXR5IGZ1bmN0aW9ucylcclxuICAgKiBAcmV0dXJucyB7Kn0gb3V0cHV0LCB3aXRoIHNhbWUgdHlwZSBhcyBpbnB1dFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhcHBseUZ1bmN0aW9ucyggaW5wdXQsIG51bWJlck9mRnVuY3Rpb25zVG9BcHBseSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICggbnVtYmVyT2ZGdW5jdGlvbnNUb0FwcGx5ID49IDAgKSAmJiAoIG51bWJlck9mRnVuY3Rpb25zVG9BcHBseSA8PSB0aGlzLm51bWJlck9mU2xvdHMgKSApO1xyXG4gICAgbGV0IG91dHB1dCA9IGlucHV0O1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZGdW5jdGlvbnNUb0FwcGx5OyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHNsb3QgPSB0aGlzLnNsb3RzWyBpIF07XHJcbiAgICAgIGlmICggIXNsb3QuaXNFbXB0eSgpICkge1xyXG4gICAgICAgIG91dHB1dCA9IHNsb3QuZnVuY3Rpb25JbnN0YW5jZS5hcHBseUZ1bmN0aW9uKCBvdXRwdXQgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG91dHB1dDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGxpZXMgYWxsIGZ1bmN0aW9ucyB0aGF0IGFyZSBpbiB0aGUgYnVpbGRlci5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Kn0gaW5wdXQgLSBpbnB1dCwgdHlwZSBpcyBzcGVjaWZpYyB0byB0aGUgZnVuY3Rpb25zXHJcbiAgICogQHJldHVybnMgeyp9IG91dHB1dCwgd2l0aCBzYW1lIHR5cGUgYXMgaW5wdXRcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYXBwbHlBbGxGdW5jdGlvbnMoIGlucHV0ICkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXBwbHlGdW5jdGlvbnMoIGlucHV0LCB0aGlzLm51bWJlck9mU2xvdHMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFB1dHMgYSBmdW5jdGlvbiBpbnN0YW5jZSBpbnRvIGEgc2xvdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QWJzdHJhY3RGdW5jdGlvbn0gZnVuY3Rpb25JbnN0YW5jZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzbG90TnVtYmVyXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFkZEZ1bmN0aW9uSW5zdGFuY2UoIGZ1bmN0aW9uSW5zdGFuY2UsIHNsb3ROdW1iZXIgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZnVuY3Rpb25JbnN0YW5jZSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc1ZhbGlkU2xvdE51bWJlciggc2xvdE51bWJlciApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5jb250YWluc0Z1bmN0aW9uSW5zdGFuY2UoIGZ1bmN0aW9uSW5zdGFuY2UgKSwgJ2Z1bmN0aW9uIGlzIGFscmVhZHkgaW4gYnVpbGRlcicgKTtcclxuXHJcbiAgICBjb25zdCBzbG90ID0gdGhpcy5zbG90c1sgc2xvdE51bWJlciBdO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2xvdC5pc0VtcHR5KCksIGBzbG90ICR7c2xvdE51bWJlcn0gaXMgb2NjdXBpZWRgICk7XHJcblxyXG4gICAgc2xvdC5mdW5jdGlvbkluc3RhbmNlID0gZnVuY3Rpb25JbnN0YW5jZTtcclxuICAgIHRoaXMuZnVuY3Rpb25DaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGEgZnVuY3Rpb24gaW5zdGFuY2UgZnJvbSBhIHNsb3QuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Fic3RyYWN0RnVuY3Rpb259IGZ1bmN0aW9uSW5zdGFuY2VcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc2xvdE51bWJlclxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZW1vdmVGdW5jdGlvbkluc3RhbmNlKCBmdW5jdGlvbkluc3RhbmNlLCBzbG90TnVtYmVyICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZ1bmN0aW9uSW5zdGFuY2UgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNWYWxpZFNsb3ROdW1iZXIoIHNsb3ROdW1iZXIgKSApO1xyXG5cclxuICAgIGNvbnN0IHNsb3QgPSB0aGlzLnNsb3RzWyBzbG90TnVtYmVyIF07XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzbG90LmNvbnRhaW5zKCBmdW5jdGlvbkluc3RhbmNlICksIGBmdW5jdGlvbkluc3RhbmNlIGlzIG5vdCBpbiBzbG90ICR7c2xvdE51bWJlcn1gICk7XHJcblxyXG4gICAgc2xvdC5jbGVhcigpO1xyXG4gICAgdGhpcy5mdW5jdGlvbkNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERvZXMgdGhlIGJ1aWxkZXIgY29udGFpbiB0aGUgc3BlY2lmaWVkIGZ1bmN0aW9uIGluc3RhbmNlP1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBYnN0cmFjdEZ1bmN0aW9ufSBmdW5jdGlvbkluc3RhbmNlXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNvbnRhaW5zRnVuY3Rpb25JbnN0YW5jZSggZnVuY3Rpb25JbnN0YW5jZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZ1bmN0aW9uSW5zdGFuY2UgKTtcclxuICAgIHJldHVybiAoIHRoaXMuZ2V0U2xvdE51bWJlciggZnVuY3Rpb25JbnN0YW5jZSApICE9PSBGdW5jdGlvblNsb3QuTk9fU0xPVF9OVU1CRVIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElzIHRoZSBzcGVjaWZpZWQgc2xvdCBudW1iZXIgdmFsaWQ/XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc2xvdE51bWJlclxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBpc1ZhbGlkU2xvdE51bWJlciggc2xvdE51bWJlciApIHtcclxuICAgIHJldHVybiAoIHNsb3ROdW1iZXIgPj0gMCAmJiBzbG90TnVtYmVyIDwgdGhpcy5zbG90cy5sZW5ndGggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHNsb3QgbnVtYmVyIG9jY3VwaWVkIGJ5IGEgZnVuY3Rpb24gaW5zdGFuY2UuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Fic3RyYWN0RnVuY3Rpb259IGZ1bmN0aW9uSW5zdGFuY2VcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBGdW5jdGlvblNsb3QuTk9fU0xPVF9OVU1CRVIgaWYgdGhlIGZ1bmN0aW9uIGluc3RhbmNlIGlzbid0IGluIGFueSBzbG90XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFNsb3ROdW1iZXIoIGZ1bmN0aW9uSW5zdGFuY2UgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmdW5jdGlvbkluc3RhbmNlICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnNsb3RzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBzbG90ID0gdGhpcy5zbG90c1sgaSBdO1xyXG4gICAgICBpZiAoIHNsb3QuY29udGFpbnMoIGZ1bmN0aW9uSW5zdGFuY2UgKSApIHtcclxuICAgICAgICByZXR1cm4gaTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIEZ1bmN0aW9uU2xvdC5OT19TTE9UX05VTUJFUjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBzcGVjaWZpZWQgc2xvdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzbG90TnVtYmVyXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9IHBvc2l0aW9uIGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRTbG90UG9zaXRpb24oIHNsb3ROdW1iZXIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzVmFsaWRTbG90TnVtYmVyKCBzbG90TnVtYmVyICkgKTtcclxuICAgIHJldHVybiB0aGlzLnNsb3RzWyBzbG90TnVtYmVyIF0ucG9zaXRpb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBzbG90IHRoYXQgaXMgY2xvc2VzdCB0byB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb3NpdGlvbiAtIHRoZSBwb3NpdGlvbiBvZiB0aGUgZnVuY3Rpb24gaW5zdGFuY2VcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGlzdGFuY2VUaHJlc2hvbGQgLSBwb3NpdGlvbiBtdXN0IGJlIGF0IGxlYXN0IHRoaXMgY2xvc2UgdG8gc2xvdCdzIHBvc2l0aW9uXHJcbiAgICogQHJldHVybnMge251bWJlcn0gc2xvdCBudW1iZXIsIEZ1bmN0aW9uU2xvdC5OT19TTE9UX05VTUJFUiBpZiBubyBzbG90IGlzIGNsb3NlIGVub3VnaFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRDbG9zZXN0U2xvdCggcG9zaXRpb24sIGRpc3RhbmNlVGhyZXNob2xkICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcG9zaXRpb24gKTtcclxuICAgIGxldCBzbG90TnVtYmVyID0gRnVuY3Rpb25TbG90Lk5PX1NMT1RfTlVNQkVSO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zbG90cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3Qgc2xvdCA9IHRoaXMuc2xvdHNbIGkgXTtcclxuICAgICAgaWYgKCBzbG90TnVtYmVyID09PSBGdW5jdGlvblNsb3QuTk9fU0xPVF9OVU1CRVIgKSB7XHJcbiAgICAgICAgaWYgKCBzbG90LnBvc2l0aW9uLmRpc3RhbmNlKCBwb3NpdGlvbiApIDwgZGlzdGFuY2VUaHJlc2hvbGQgKSB7XHJcbiAgICAgICAgICBzbG90TnVtYmVyID0gaTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHNsb3QucG9zaXRpb24uZGlzdGFuY2UoIHBvc2l0aW9uICkgPCB0aGlzLnNsb3RzWyBzbG90TnVtYmVyIF0ucG9zaXRpb24uZGlzdGFuY2UoIHBvc2l0aW9uICkgKSB7XHJcbiAgICAgICAgc2xvdE51bWJlciA9IGk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBzbG90TnVtYmVyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSXMgdGhlIHNwZWNpZmllZCB3aW5kb3cgbnVtYmVyIHZhbGlkP1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpbmRvd051bWJlclxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBpc1ZhbGlkV2luZG93TnVtYmVyKCB3aW5kb3dOdW1iZXIgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pc1ZhbGlkU2xvdE51bWJlciggd2luZG93TnVtYmVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBwb3NpdGlvbiAoY2VudGVyKSBvZiBhICdzZWUgaW5zaWRlJyB3aW5kb3cuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gd2luZG93TnVtYmVyXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFdpbmRvd1Bvc2l0aW9uKCB3aW5kb3dOdW1iZXIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzVmFsaWRXaW5kb3dOdW1iZXIoIHdpbmRvd051bWJlciApICk7XHJcbiAgICBjb25zdCBzbG90ID0gdGhpcy5zbG90c1sgd2luZG93TnVtYmVyIF07XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIHNsb3QucG9zaXRpb24ueCArIFdJTkRPV19YX09GRlNFVCwgc2xvdC5wb3NpdGlvbi55ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgdGhlIHdpbmRvdyB3aG9zZSB4IGNvb3JkaW5hdGUgaXMgPiBzb21lIHggY29vcmRpbmF0ZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHJldHVybnMge251bWJlcn0gRnVuY3Rpb25TbG90Lk5PX1NMT1RfTlVNQkVSIGlmIHRoZXJlIGlzIG5vIHdpbmRvdyA+XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFdpbmRvd051bWJlckdyZWF0ZXJUaGFuKCB4ICkge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zbG90cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3Qgd2luZG93UG9zaXRpb24gPSB0aGlzLmdldFdpbmRvd1Bvc2l0aW9uKCBpICk7XHJcbiAgICAgIGlmICggd2luZG93UG9zaXRpb24ueCA+IHggKSB7XHJcbiAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBGdW5jdGlvblNsb3QuTk9fU0xPVF9OVU1CRVI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgdGhlIHdpbmRvdyB3aG9zZSB4IGNvb3JkaW5hdGUgaXMgPD0gc29tZSB4IGNvb3JkaW5hdGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IEZ1bmN0aW9uU2xvdC5OT19TTE9UX05VTUJFUiBpZiB0aGVyZSBpcyBubyB3aW5kb3cgPD1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0V2luZG93TnVtYmVyTGVzc1RoYW5PckVxdWFsVG8oIHggKSB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IHRoaXMuc2xvdHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgIGNvbnN0IHdpbmRvd1Bvc2l0aW9uID0gdGhpcy5nZXRXaW5kb3dQb3NpdGlvbiggaSApO1xyXG4gICAgICBpZiAoIHdpbmRvd1Bvc2l0aW9uLnggPD0geCApIHtcclxuICAgICAgICByZXR1cm4gaTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIEZ1bmN0aW9uU2xvdC5OT19TTE9UX05VTUJFUjtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uQnVpbGRlci5yZWdpc3RlciggJ0J1aWxkZXInLCBCdWlsZGVyICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sbUNBQW1DO0FBQ3ZELE9BQU9DLE9BQU8sTUFBTSxrQ0FBa0M7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLHNDQUFzQztBQUN4RCxPQUFPQyxlQUFlLE1BQU0sNkJBQTZCO0FBQ3pELE9BQU9DLFFBQVEsTUFBTSxtQkFBbUI7QUFDeEMsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQyxZQUFZLE1BQU0sbUJBQW1COztBQUU1QztBQUNBLE1BQU1DLGVBQWUsR0FBS0YsV0FBVyxDQUFDRyxhQUFhLENBQUNDLEtBQUssR0FBRyxDQUFDLEdBQ25DSixXQUFXLENBQUNLLHVCQUF1QixHQUFHTCxXQUFXLENBQUNHLGFBQWEsQ0FBQ0MsS0FBSyxHQUFHLENBQUc7QUFFckcsZUFBZSxNQUFNRSxPQUFPLENBQUM7RUFFM0I7QUFDRjtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLE9BQU8sRUFBRztJQUVyQkEsT0FBTyxHQUFHWCxLQUFLLENBQUU7TUFFZjtNQUNBWSxhQUFhLEVBQUUsQ0FBQztNQUVoQjtNQUNBTCxLQUFLLEVBQUUsR0FBRztNQUVWO01BQ0FNLFNBQVMsRUFBRVYsV0FBVyxDQUFDRyxhQUFhLENBQUNRLE1BQU0sR0FBRyxFQUFFO01BRWhEO01BQ0FDLFdBQVcsRUFBRVosV0FBVyxDQUFDRyxhQUFhLENBQUNRLE1BQU0sR0FBRyxFQUFFO01BRWxEO01BQ0FFLFFBQVEsRUFBRSxJQUFJakIsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7TUFFN0I7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBa0IsV0FBVyxFQUFFZixRQUFRLENBQUNnQjtJQUV4QixDQUFDLEVBQUVQLE9BQVEsQ0FBQzs7SUFFWjtJQUNBUSxNQUFNLElBQUlBLE1BQU0sQ0FBRVIsT0FBTyxDQUFDTSxXQUFXLENBQUNHLEdBQUcsSUFBSVQsT0FBTyxDQUFDTSxXQUFXLENBQUNJLE1BQU0sSUFDdkVWLE9BQU8sQ0FBQ00sV0FBVyxDQUFDSyxNQUFNLElBQUlYLE9BQU8sQ0FBQ00sV0FBVyxDQUFDTSxJQUFLLENBQUM7O0lBRXhEO0lBQ0EsSUFBSSxDQUFDWCxhQUFhLEdBQUdELE9BQU8sQ0FBQ0MsYUFBYTtJQUMxQyxJQUFJLENBQUNMLEtBQUssR0FBR0ksT0FBTyxDQUFDSixLQUFLO0lBQzFCLElBQUksQ0FBQ00sU0FBUyxHQUFHRixPQUFPLENBQUNFLFNBQVM7SUFDbEMsSUFBSSxDQUFDRSxXQUFXLEdBQUdKLE9BQU8sQ0FBQ0ksV0FBVztJQUN0QyxJQUFJLENBQUNDLFFBQVEsR0FBR0wsT0FBTyxDQUFDSyxRQUFRO0lBQ2hDLElBQUksQ0FBQ0MsV0FBVyxHQUFHTixPQUFPLENBQUNNLFdBQVc7O0lBRXRDO0lBQ0EsSUFBSU8saUJBQWlCLEdBQUdiLE9BQU8sQ0FBQ0MsYUFBYSxHQUFHVCxXQUFXLENBQUNHLGFBQWEsQ0FBQ0MsS0FBSztJQUMvRSxJQUFLSSxPQUFPLENBQUNDLGFBQWEsR0FBRyxDQUFDLEVBQUc7TUFDL0JZLGlCQUFpQixJQUFNLENBQUViLE9BQU8sQ0FBQ0MsYUFBYSxHQUFHLENBQUMsSUFBS1QsV0FBVyxDQUFDSyx1QkFBdUIsR0FBR0wsV0FBVyxDQUFDRyxhQUFhLENBQUNDLEtBQU87SUFDaEk7SUFDQVksTUFBTSxJQUFJQSxNQUFNLENBQUVLLGlCQUFpQixHQUFHLENBQUUsQ0FBQzs7SUFFekM7SUFDQSxJQUFJLENBQUNDLEtBQUssR0FBRyxFQUFFO0lBQ2YsTUFBTUMsZ0JBQWdCLEdBQUcsSUFBSTNCLE9BQU8sQ0FBRSxJQUFJLENBQUNpQixRQUFRLENBQUNXLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBQ3BCLEtBQUssR0FBR2lCLGlCQUFpQixHQUFHckIsV0FBVyxDQUFDRyxhQUFhLENBQUNDLEtBQUssSUFBSyxDQUFDLEVBQUUsSUFBSSxDQUFDUyxRQUFRLENBQUNZLENBQUUsQ0FBQztJQUNuSixLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2xCLE9BQU8sQ0FBQ0MsYUFBYSxFQUFFaUIsQ0FBQyxFQUFFLEVBQUc7TUFFaEQ7TUFDQSxNQUFNQyxFQUFFLEdBQUdELENBQUMsR0FBRzFCLFdBQVcsQ0FBQ0csYUFBYSxDQUFDQyxLQUFLLEdBQUdzQixDQUFDLEdBQUcxQixXQUFXLENBQUNLLHVCQUF1QixHQUFHTCxXQUFXLENBQUNHLGFBQWEsQ0FBQ0MsS0FBSztNQUMxSCxNQUFNd0IsWUFBWSxHQUFHTCxnQkFBZ0IsQ0FBQ00sTUFBTSxDQUFFRixFQUFFLEVBQUUsQ0FBRSxDQUFDOztNQUVyRDtNQUNBLElBQUksQ0FBQ0wsS0FBSyxDQUFDUSxJQUFJLENBQUUsSUFBSTdCLFlBQVksQ0FBRTJCLFlBQWEsQ0FBRSxDQUFDO0lBQ3JEO0lBQ0FaLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ00sS0FBSyxDQUFDUyxNQUFNLEtBQUssSUFBSSxDQUFDdEIsYUFBYyxDQUFDOztJQUU1RDtJQUNBLElBQUksQ0FBQ3VCLHNCQUFzQixHQUFHLElBQUlyQyxPQUFPLENBQUMsQ0FBQzs7SUFFM0M7SUFDQSxJQUFJLENBQUNzQyxJQUFJLEdBQUcsSUFBSSxDQUFDcEIsUUFBUSxDQUFDVyxDQUFDO0lBQzNCLElBQUksQ0FBQ1UsS0FBSyxHQUFHLElBQUksQ0FBQ0QsSUFBSSxHQUFHekIsT0FBTyxDQUFDSixLQUFLO0lBQ3RDLElBQUksQ0FBQytCLE9BQU8sR0FBRyxJQUFJLENBQUNGLElBQUksR0FBS3pCLE9BQU8sQ0FBQ0osS0FBSyxHQUFHLENBQUc7RUFDbEQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFZ0MsY0FBY0EsQ0FBRUMsS0FBSyxFQUFFQyx3QkFBd0IsRUFBRztJQUNoRHRCLE1BQU0sSUFBSUEsTUFBTSxDQUFJc0Isd0JBQXdCLElBQUksQ0FBQyxJQUFRQSx3QkFBd0IsSUFBSSxJQUFJLENBQUM3QixhQUFnQixDQUFDO0lBQzNHLElBQUk4QixNQUFNLEdBQUdGLEtBQUs7SUFDbEIsS0FBTSxJQUFJWCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdZLHdCQUF3QixFQUFFWixDQUFDLEVBQUUsRUFBRztNQUNuRCxNQUFNYyxJQUFJLEdBQUcsSUFBSSxDQUFDbEIsS0FBSyxDQUFFSSxDQUFDLENBQUU7TUFDNUIsSUFBSyxDQUFDYyxJQUFJLENBQUNDLE9BQU8sQ0FBQyxDQUFDLEVBQUc7UUFDckJGLE1BQU0sR0FBR0MsSUFBSSxDQUFDRSxnQkFBZ0IsQ0FBQ0MsYUFBYSxDQUFFSixNQUFPLENBQUM7TUFDeEQ7SUFDRjtJQUNBLE9BQU9BLE1BQU07RUFDZjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSyxpQkFBaUJBLENBQUVQLEtBQUssRUFBRztJQUN6QixPQUFPLElBQUksQ0FBQ0QsY0FBYyxDQUFFQyxLQUFLLEVBQUUsSUFBSSxDQUFDNUIsYUFBYyxDQUFDO0VBQ3pEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VvQyxtQkFBbUJBLENBQUVILGdCQUFnQixFQUFFSSxVQUFVLEVBQUc7SUFFbEQ5QixNQUFNLElBQUlBLE1BQU0sQ0FBRTBCLGdCQUFpQixDQUFDO0lBQ3BDMUIsTUFBTSxJQUFJQSxNQUFNLENBQUUsSUFBSSxDQUFDK0IsaUJBQWlCLENBQUVELFVBQVcsQ0FBRSxDQUFDO0lBQ3hEOUIsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQyxJQUFJLENBQUNnQyx3QkFBd0IsQ0FBRU4sZ0JBQWlCLENBQUMsRUFBRSxnQ0FBaUMsQ0FBQztJQUV4RyxNQUFNRixJQUFJLEdBQUcsSUFBSSxDQUFDbEIsS0FBSyxDQUFFd0IsVUFBVSxDQUFFO0lBQ3JDOUIsTUFBTSxJQUFJQSxNQUFNLENBQUV3QixJQUFJLENBQUNDLE9BQU8sQ0FBQyxDQUFDLEVBQUcsUUFBT0ssVUFBVyxjQUFjLENBQUM7SUFFcEVOLElBQUksQ0FBQ0UsZ0JBQWdCLEdBQUdBLGdCQUFnQjtJQUN4QyxJQUFJLENBQUNWLHNCQUFzQixDQUFDaUIsSUFBSSxDQUFDLENBQUM7RUFDcEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsc0JBQXNCQSxDQUFFUixnQkFBZ0IsRUFBRUksVUFBVSxFQUFHO0lBRXJEOUIsTUFBTSxJQUFJQSxNQUFNLENBQUUwQixnQkFBaUIsQ0FBQztJQUNwQzFCLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQytCLGlCQUFpQixDQUFFRCxVQUFXLENBQUUsQ0FBQztJQUV4RCxNQUFNTixJQUFJLEdBQUcsSUFBSSxDQUFDbEIsS0FBSyxDQUFFd0IsVUFBVSxDQUFFO0lBQ3JDOUIsTUFBTSxJQUFJQSxNQUFNLENBQUV3QixJQUFJLENBQUNXLFFBQVEsQ0FBRVQsZ0JBQWlCLENBQUMsRUFBRyxtQ0FBa0NJLFVBQVcsRUFBRSxDQUFDO0lBRXRHTixJQUFJLENBQUNZLEtBQUssQ0FBQyxDQUFDO0lBQ1osSUFBSSxDQUFDcEIsc0JBQXNCLENBQUNpQixJQUFJLENBQUMsQ0FBQztFQUNwQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRCx3QkFBd0JBLENBQUVOLGdCQUFnQixFQUFHO0lBQzNDMUIsTUFBTSxJQUFJQSxNQUFNLENBQUUwQixnQkFBaUIsQ0FBQztJQUNwQyxPQUFTLElBQUksQ0FBQ1csYUFBYSxDQUFFWCxnQkFBaUIsQ0FBQyxLQUFLekMsWUFBWSxDQUFDcUQsY0FBYztFQUNqRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFUCxpQkFBaUJBLENBQUVELFVBQVUsRUFBRztJQUM5QixPQUFTQSxVQUFVLElBQUksQ0FBQyxJQUFJQSxVQUFVLEdBQUcsSUFBSSxDQUFDeEIsS0FBSyxDQUFDUyxNQUFNO0VBQzVEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VzQixhQUFhQSxDQUFFWCxnQkFBZ0IsRUFBRztJQUNoQzFCLE1BQU0sSUFBSUEsTUFBTSxDQUFFMEIsZ0JBQWlCLENBQUM7SUFDcEMsS0FBTSxJQUFJaEIsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ0osS0FBSyxDQUFDUyxNQUFNLEVBQUVMLENBQUMsRUFBRSxFQUFHO01BQzVDLE1BQU1jLElBQUksR0FBRyxJQUFJLENBQUNsQixLQUFLLENBQUVJLENBQUMsQ0FBRTtNQUM1QixJQUFLYyxJQUFJLENBQUNXLFFBQVEsQ0FBRVQsZ0JBQWlCLENBQUMsRUFBRztRQUN2QyxPQUFPaEIsQ0FBQztNQUNWO0lBQ0Y7SUFDQSxPQUFPekIsWUFBWSxDQUFDcUQsY0FBYztFQUNwQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxlQUFlQSxDQUFFVCxVQUFVLEVBQUc7SUFDNUI5QixNQUFNLElBQUlBLE1BQU0sQ0FBRSxJQUFJLENBQUMrQixpQkFBaUIsQ0FBRUQsVUFBVyxDQUFFLENBQUM7SUFDeEQsT0FBTyxJQUFJLENBQUN4QixLQUFLLENBQUV3QixVQUFVLENBQUUsQ0FBQ2pDLFFBQVE7RUFDMUM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFMkMsY0FBY0EsQ0FBRTNDLFFBQVEsRUFBRTRDLGlCQUFpQixFQUFHO0lBQzVDekMsTUFBTSxJQUFJQSxNQUFNLENBQUVILFFBQVMsQ0FBQztJQUM1QixJQUFJaUMsVUFBVSxHQUFHN0MsWUFBWSxDQUFDcUQsY0FBYztJQUM1QyxLQUFNLElBQUk1QixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDSixLQUFLLENBQUNTLE1BQU0sRUFBRUwsQ0FBQyxFQUFFLEVBQUc7TUFDNUMsTUFBTWMsSUFBSSxHQUFHLElBQUksQ0FBQ2xCLEtBQUssQ0FBRUksQ0FBQyxDQUFFO01BQzVCLElBQUtvQixVQUFVLEtBQUs3QyxZQUFZLENBQUNxRCxjQUFjLEVBQUc7UUFDaEQsSUFBS2QsSUFBSSxDQUFDM0IsUUFBUSxDQUFDNkMsUUFBUSxDQUFFN0MsUUFBUyxDQUFDLEdBQUc0QyxpQkFBaUIsRUFBRztVQUM1RFgsVUFBVSxHQUFHcEIsQ0FBQztRQUNoQjtNQUNGLENBQUMsTUFDSSxJQUFLYyxJQUFJLENBQUMzQixRQUFRLENBQUM2QyxRQUFRLENBQUU3QyxRQUFTLENBQUMsR0FBRyxJQUFJLENBQUNTLEtBQUssQ0FBRXdCLFVBQVUsQ0FBRSxDQUFDakMsUUFBUSxDQUFDNkMsUUFBUSxDQUFFN0MsUUFBUyxDQUFDLEVBQUc7UUFDdEdpQyxVQUFVLEdBQUdwQixDQUFDO01BQ2hCO0lBQ0Y7SUFDQSxPQUFPb0IsVUFBVTtFQUNuQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFYSxtQkFBbUJBLENBQUVDLFlBQVksRUFBRztJQUNsQyxPQUFPLElBQUksQ0FBQ2IsaUJBQWlCLENBQUVhLFlBQWEsQ0FBQztFQUMvQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxpQkFBaUJBLENBQUVELFlBQVksRUFBRztJQUNoQzVDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQzJDLG1CQUFtQixDQUFFQyxZQUFhLENBQUUsQ0FBQztJQUM1RCxNQUFNcEIsSUFBSSxHQUFHLElBQUksQ0FBQ2xCLEtBQUssQ0FBRXNDLFlBQVksQ0FBRTtJQUN2QyxPQUFPLElBQUloRSxPQUFPLENBQUU0QyxJQUFJLENBQUMzQixRQUFRLENBQUNXLENBQUMsR0FBR3RCLGVBQWUsRUFBRXNDLElBQUksQ0FBQzNCLFFBQVEsQ0FBQ1ksQ0FBRSxDQUFDO0VBQzFFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VxQywwQkFBMEJBLENBQUV0QyxDQUFDLEVBQUc7SUFDOUIsS0FBTSxJQUFJRSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDSixLQUFLLENBQUNTLE1BQU0sRUFBRUwsQ0FBQyxFQUFFLEVBQUc7TUFDNUMsTUFBTXFDLGNBQWMsR0FBRyxJQUFJLENBQUNGLGlCQUFpQixDQUFFbkMsQ0FBRSxDQUFDO01BQ2xELElBQUtxQyxjQUFjLENBQUN2QyxDQUFDLEdBQUdBLENBQUMsRUFBRztRQUMxQixPQUFPRSxDQUFDO01BQ1Y7SUFDRjtJQUNBLE9BQU96QixZQUFZLENBQUNxRCxjQUFjO0VBQ3BDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VVLGdDQUFnQ0EsQ0FBRXhDLENBQUMsRUFBRztJQUNwQyxLQUFNLElBQUlFLENBQUMsR0FBRyxJQUFJLENBQUNKLEtBQUssQ0FBQ1MsTUFBTSxHQUFHLENBQUMsRUFBRUwsQ0FBQyxJQUFJLENBQUMsRUFBRUEsQ0FBQyxFQUFFLEVBQUc7TUFDakQsTUFBTXFDLGNBQWMsR0FBRyxJQUFJLENBQUNGLGlCQUFpQixDQUFFbkMsQ0FBRSxDQUFDO01BQ2xELElBQUtxQyxjQUFjLENBQUN2QyxDQUFDLElBQUlBLENBQUMsRUFBRztRQUMzQixPQUFPRSxDQUFDO01BQ1Y7SUFDRjtJQUNBLE9BQU96QixZQUFZLENBQUNxRCxjQUFjO0VBQ3BDO0FBQ0Y7QUFFQXhELGVBQWUsQ0FBQ21FLFFBQVEsQ0FBRSxTQUFTLEVBQUUzRCxPQUFRLENBQUMifQ==