// Copyright 2021-2023, University of Colorado Boulder

/**
 * Base model for counting screens.
 *
 * @author Sharfudeen Ashraf
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import countingCommon from '../../countingCommon.js';
import CountingObject from './CountingObject.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
class CountingCommonModel {
  // Numbers in play that can be interacted with.

  // the sum of all paper numbers

  // used to notify view sub-components that reset is being called

  constructor(highestCount) {
    this.countingObjects = createObservableArray();
    this.sumProperty = new NumberProperty(0, {
      range: new Range(0, highestCount)
    });
    this.resetEmitter = new Emitter();
  }

  /**
   * Given two paper numbers, combine them (set one's value to the sum of their previous values, and remove the
   * other).
   */
  collapseNumberModels(availableModelBounds, draggedCountingObject, droppedCountingObject) {
    const dropTargetNumberValue = droppedCountingObject.numberValueProperty.value;
    const draggedNumberValue = draggedCountingObject.numberValueProperty.value;
    const newValue = dropTargetNumberValue + draggedNumberValue;
    let numberToRemove;
    let numberToChange;

    // See https://github.com/phetsims/make-a-ten/issues/260
    if (draggedCountingObject.digitLength === droppedCountingObject.digitLength) {
      numberToRemove = draggedCountingObject;
      numberToChange = droppedCountingObject;
    } else {
      // The larger number gets changed, the smaller one gets removed.
      const droppingOnLarger = dropTargetNumberValue > draggedNumberValue;
      numberToRemove = droppingOnLarger ? draggedCountingObject : droppedCountingObject;
      numberToChange = droppingOnLarger ? droppedCountingObject : draggedCountingObject;
    }

    // Apply changes
    this.removeCountingObject(numberToRemove);
    numberToChange.changeNumber(newValue);
    numberToChange.setConstrainedDestination(availableModelBounds, numberToChange.positionProperty.value, false);
    numberToChange.moveToFrontEmitter.emit();
  }

  /**
   * Add a CountingObject to the model
   */
  addCountingObject(countingObject) {
    this.countingObjects.push(countingObject);
  }

  /**
   * Remove a CountingObject from the model
   */
  removeCountingObject(countingObject) {
    this.countingObjects.remove(countingObject);
  }

  /**
   * Remove all CountingObjects from the model.
   */
  removeAllCountingObjects() {
    this.countingObjects.clear();
  }

  /**
   * Given an array of integers, create and add paper numbers for each that are evenly distributed across the screen.
   */
  addMultipleNumbers(numbers) {
    for (let i = 0; i < numbers.length; i++) {
      const number = numbers[i];

      // Ingore 0s
      if (!number) {
        continue;
      }

      // evenly distribute across the screen
      const x = ScreenView.DEFAULT_LAYOUT_BOUNDS.width * (1 + i) / (numbers.length + 1);
      const initialNumberPosition = new Vector2(x, ScreenView.DEFAULT_LAYOUT_BOUNDS.height / 2.5);
      const countingObject = new CountingObject(number, initialNumberPosition);
      this.addCountingObject(countingObject);
    }
  }

  /**
   * @param availableModelBounds - Constrain the position to be inside these bounds
   * @param countingObject1
   * @param countingObject2
   * @param getRepelOffsets
   */
  repelAway(availableModelBounds, countingObject1, countingObject2, getRepelOffsets) {
    // Determine which are 'left' and 'right'
    const isPaper1Left = countingObject1.positionProperty.value.x < countingObject2.positionProperty.value.x;
    const leftCountingObject = isPaper1Left ? countingObject1 : countingObject2;
    const rightCountingObject = isPaper1Left ? countingObject2 : countingObject1;

    // Determine offsets
    const repelOffsets = getRepelOffsets(leftCountingObject, rightCountingObject);
    const repelLeftOffset = repelOffsets.left;
    const repelRightOffset = repelOffsets.right;
    const leftPosition = leftCountingObject.positionProperty.value.plusXY(repelLeftOffset, 0);
    const rightPosition = rightCountingObject.positionProperty.value.plusXY(repelRightOffset, 0);

    // Kick off the animation to the destination
    const animateToDestination = true;
    leftCountingObject.setConstrainedDestination(availableModelBounds, leftPosition, animateToDestination);
    rightCountingObject.setConstrainedDestination(availableModelBounds, rightPosition, animateToDestination);
  }

  /**
   * Updates the total sum of the paper numbers.
   */
  calculateTotal() {
    let total = 0;
    this.countingObjects.filter(countingObject => countingObject.includeInSumProperty.value).forEach(countingObject => {
      total += countingObject.numberValueProperty.value;
    });
    this.sumProperty.value = total;
  }

  /**
   * Reset the model
   */
  reset() {
    this.removeAllCountingObjects();
    this.calculateTotal();
    this.resetEmitter.emit();
  }
}
countingCommon.register('CountingCommonModel', CountingCommonModel);
export default CountingCommonModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJWZWN0b3IyIiwiU2NyZWVuVmlldyIsImNvdW50aW5nQ29tbW9uIiwiQ291bnRpbmdPYmplY3QiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJSYW5nZSIsIkNvdW50aW5nQ29tbW9uTW9kZWwiLCJjb25zdHJ1Y3RvciIsImhpZ2hlc3RDb3VudCIsImNvdW50aW5nT2JqZWN0cyIsInN1bVByb3BlcnR5IiwicmFuZ2UiLCJyZXNldEVtaXR0ZXIiLCJjb2xsYXBzZU51bWJlck1vZGVscyIsImF2YWlsYWJsZU1vZGVsQm91bmRzIiwiZHJhZ2dlZENvdW50aW5nT2JqZWN0IiwiZHJvcHBlZENvdW50aW5nT2JqZWN0IiwiZHJvcFRhcmdldE51bWJlclZhbHVlIiwibnVtYmVyVmFsdWVQcm9wZXJ0eSIsInZhbHVlIiwiZHJhZ2dlZE51bWJlclZhbHVlIiwibmV3VmFsdWUiLCJudW1iZXJUb1JlbW92ZSIsIm51bWJlclRvQ2hhbmdlIiwiZGlnaXRMZW5ndGgiLCJkcm9wcGluZ09uTGFyZ2VyIiwicmVtb3ZlQ291bnRpbmdPYmplY3QiLCJjaGFuZ2VOdW1iZXIiLCJzZXRDb25zdHJhaW5lZERlc3RpbmF0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsIm1vdmVUb0Zyb250RW1pdHRlciIsImVtaXQiLCJhZGRDb3VudGluZ09iamVjdCIsImNvdW50aW5nT2JqZWN0IiwicHVzaCIsInJlbW92ZSIsInJlbW92ZUFsbENvdW50aW5nT2JqZWN0cyIsImNsZWFyIiwiYWRkTXVsdGlwbGVOdW1iZXJzIiwibnVtYmVycyIsImkiLCJsZW5ndGgiLCJudW1iZXIiLCJ4IiwiREVGQVVMVF9MQVlPVVRfQk9VTkRTIiwid2lkdGgiLCJpbml0aWFsTnVtYmVyUG9zaXRpb24iLCJoZWlnaHQiLCJyZXBlbEF3YXkiLCJjb3VudGluZ09iamVjdDEiLCJjb3VudGluZ09iamVjdDIiLCJnZXRSZXBlbE9mZnNldHMiLCJpc1BhcGVyMUxlZnQiLCJsZWZ0Q291bnRpbmdPYmplY3QiLCJyaWdodENvdW50aW5nT2JqZWN0IiwicmVwZWxPZmZzZXRzIiwicmVwZWxMZWZ0T2Zmc2V0IiwibGVmdCIsInJlcGVsUmlnaHRPZmZzZXQiLCJyaWdodCIsImxlZnRQb3NpdGlvbiIsInBsdXNYWSIsInJpZ2h0UG9zaXRpb24iLCJhbmltYXRlVG9EZXN0aW5hdGlvbiIsImNhbGN1bGF0ZVRvdGFsIiwidG90YWwiLCJmaWx0ZXIiLCJpbmNsdWRlSW5TdW1Qcm9wZXJ0eSIsImZvckVhY2giLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ291bnRpbmdDb21tb25Nb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYXNlIG1vZGVsIGZvciBjb3VudGluZyBzY3JlZW5zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmXHJcbiAqL1xyXG5cclxuaW1wb3J0IGNyZWF0ZU9ic2VydmFibGVBcnJheSwgeyBPYnNlcnZhYmxlQXJyYXkgfSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL2NyZWF0ZU9ic2VydmFibGVBcnJheS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBjb3VudGluZ0NvbW1vbiBmcm9tICcuLi8uLi9jb3VudGluZ0NvbW1vbi5qcyc7XHJcbmltcG9ydCBDb3VudGluZ09iamVjdCBmcm9tICcuL0NvdW50aW5nT2JqZWN0LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XHJcbmltcG9ydCBUTW9kZWwgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvVE1vZGVsLmpzJztcclxuXHJcbmNsYXNzIENvdW50aW5nQ29tbW9uTW9kZWwgaW1wbGVtZW50cyBUTW9kZWwge1xyXG5cclxuICAvLyBOdW1iZXJzIGluIHBsYXkgdGhhdCBjYW4gYmUgaW50ZXJhY3RlZCB3aXRoLlxyXG4gIHB1YmxpYyBjb3VudGluZ09iamVjdHM6IE9ic2VydmFibGVBcnJheTxDb3VudGluZ09iamVjdD47XHJcblxyXG4gIC8vIHRoZSBzdW0gb2YgYWxsIHBhcGVyIG51bWJlcnNcclxuICBwdWJsaWMgc3VtUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG5cclxuICAvLyB1c2VkIHRvIG5vdGlmeSB2aWV3IHN1Yi1jb21wb25lbnRzIHRoYXQgcmVzZXQgaXMgYmVpbmcgY2FsbGVkXHJcbiAgcHVibGljIHJlYWRvbmx5IHJlc2V0RW1pdHRlcjogVEVtaXR0ZXI7XHJcblxyXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvciggaGlnaGVzdENvdW50OiBudW1iZXIgKSB7XHJcbiAgICB0aGlzLmNvdW50aW5nT2JqZWN0cyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG4gICAgdGhpcy5zdW1Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCBoaWdoZXN0Q291bnQgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5yZXNldEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2l2ZW4gdHdvIHBhcGVyIG51bWJlcnMsIGNvbWJpbmUgdGhlbSAoc2V0IG9uZSdzIHZhbHVlIHRvIHRoZSBzdW0gb2YgdGhlaXIgcHJldmlvdXMgdmFsdWVzLCBhbmQgcmVtb3ZlIHRoZVxyXG4gICAqIG90aGVyKS5cclxuICAgKi9cclxuICBwdWJsaWMgY29sbGFwc2VOdW1iZXJNb2RlbHMoIGF2YWlsYWJsZU1vZGVsQm91bmRzOiBCb3VuZHMyLCBkcmFnZ2VkQ291bnRpbmdPYmplY3Q6IENvdW50aW5nT2JqZWN0LCBkcm9wcGVkQ291bnRpbmdPYmplY3Q6IENvdW50aW5nT2JqZWN0ICk6IHZvaWQge1xyXG4gICAgY29uc3QgZHJvcFRhcmdldE51bWJlclZhbHVlID0gZHJvcHBlZENvdW50aW5nT2JqZWN0Lm51bWJlclZhbHVlUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBkcmFnZ2VkTnVtYmVyVmFsdWUgPSBkcmFnZ2VkQ291bnRpbmdPYmplY3QubnVtYmVyVmFsdWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnN0IG5ld1ZhbHVlID0gZHJvcFRhcmdldE51bWJlclZhbHVlICsgZHJhZ2dlZE51bWJlclZhbHVlO1xyXG5cclxuICAgIGxldCBudW1iZXJUb1JlbW92ZTtcclxuICAgIGxldCBudW1iZXJUb0NoYW5nZTtcclxuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL21ha2UtYS10ZW4vaXNzdWVzLzI2MFxyXG4gICAgaWYgKCBkcmFnZ2VkQ291bnRpbmdPYmplY3QuZGlnaXRMZW5ndGggPT09IGRyb3BwZWRDb3VudGluZ09iamVjdC5kaWdpdExlbmd0aCApIHtcclxuICAgICAgbnVtYmVyVG9SZW1vdmUgPSBkcmFnZ2VkQ291bnRpbmdPYmplY3Q7XHJcbiAgICAgIG51bWJlclRvQ2hhbmdlID0gZHJvcHBlZENvdW50aW5nT2JqZWN0O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIFRoZSBsYXJnZXIgbnVtYmVyIGdldHMgY2hhbmdlZCwgdGhlIHNtYWxsZXIgb25lIGdldHMgcmVtb3ZlZC5cclxuICAgICAgY29uc3QgZHJvcHBpbmdPbkxhcmdlciA9IGRyb3BUYXJnZXROdW1iZXJWYWx1ZSA+IGRyYWdnZWROdW1iZXJWYWx1ZTtcclxuICAgICAgbnVtYmVyVG9SZW1vdmUgPSBkcm9wcGluZ09uTGFyZ2VyID8gZHJhZ2dlZENvdW50aW5nT2JqZWN0IDogZHJvcHBlZENvdW50aW5nT2JqZWN0O1xyXG4gICAgICBudW1iZXJUb0NoYW5nZSA9IGRyb3BwaW5nT25MYXJnZXIgPyBkcm9wcGVkQ291bnRpbmdPYmplY3QgOiBkcmFnZ2VkQ291bnRpbmdPYmplY3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQXBwbHkgY2hhbmdlc1xyXG4gICAgdGhpcy5yZW1vdmVDb3VudGluZ09iamVjdCggbnVtYmVyVG9SZW1vdmUgKTtcclxuICAgIG51bWJlclRvQ2hhbmdlLmNoYW5nZU51bWJlciggbmV3VmFsdWUgKTtcclxuXHJcbiAgICBudW1iZXJUb0NoYW5nZS5zZXRDb25zdHJhaW5lZERlc3RpbmF0aW9uKCBhdmFpbGFibGVNb2RlbEJvdW5kcywgbnVtYmVyVG9DaGFuZ2UucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSwgZmFsc2UgKTtcclxuICAgIG51bWJlclRvQ2hhbmdlLm1vdmVUb0Zyb250RW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSBDb3VudGluZ09iamVjdCB0byB0aGUgbW9kZWxcclxuICAgKi9cclxuICBwdWJsaWMgYWRkQ291bnRpbmdPYmplY3QoIGNvdW50aW5nT2JqZWN0OiBDb3VudGluZ09iamVjdCApOiB2b2lkIHtcclxuICAgIHRoaXMuY291bnRpbmdPYmplY3RzLnB1c2goIGNvdW50aW5nT2JqZWN0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYSBDb3VudGluZ09iamVjdCBmcm9tIHRoZSBtb2RlbFxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVDb3VudGluZ09iamVjdCggY291bnRpbmdPYmplY3Q6IENvdW50aW5nT2JqZWN0ICk6IHZvaWQge1xyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdHMucmVtb3ZlKCBjb3VudGluZ09iamVjdCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGFsbCBDb3VudGluZ09iamVjdHMgZnJvbSB0aGUgbW9kZWwuXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZUFsbENvdW50aW5nT2JqZWN0cygpOiB2b2lkIHtcclxuICAgIHRoaXMuY291bnRpbmdPYmplY3RzLmNsZWFyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBhbiBhcnJheSBvZiBpbnRlZ2VycywgY3JlYXRlIGFuZCBhZGQgcGFwZXIgbnVtYmVycyBmb3IgZWFjaCB0aGF0IGFyZSBldmVubHkgZGlzdHJpYnV0ZWQgYWNyb3NzIHRoZSBzY3JlZW4uXHJcbiAgICovXHJcbiAgcHVibGljIGFkZE11bHRpcGxlTnVtYmVycyggbnVtYmVyczogbnVtYmVyW10gKTogdm9pZCB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1iZXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBudW1iZXIgPSBudW1iZXJzWyBpIF07XHJcblxyXG4gICAgICAvLyBJbmdvcmUgMHNcclxuICAgICAgaWYgKCAhbnVtYmVyICkgeyBjb250aW51ZTsgfVxyXG5cclxuICAgICAgLy8gZXZlbmx5IGRpc3RyaWJ1dGUgYWNyb3NzIHRoZSBzY3JlZW5cclxuICAgICAgY29uc3QgeCA9IFNjcmVlblZpZXcuREVGQVVMVF9MQVlPVVRfQk9VTkRTLndpZHRoICogKCAxICsgaSApIC8gKCBudW1iZXJzLmxlbmd0aCArIDEgKTtcclxuICAgICAgY29uc3QgaW5pdGlhbE51bWJlclBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIHgsIFNjcmVlblZpZXcuREVGQVVMVF9MQVlPVVRfQk9VTkRTLmhlaWdodCAvIDIuNSApO1xyXG4gICAgICBjb25zdCBjb3VudGluZ09iamVjdCA9IG5ldyBDb3VudGluZ09iamVjdCggbnVtYmVyLCBpbml0aWFsTnVtYmVyUG9zaXRpb24gKTtcclxuICAgICAgdGhpcy5hZGRDb3VudGluZ09iamVjdCggY291bnRpbmdPYmplY3QgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBhdmFpbGFibGVNb2RlbEJvdW5kcyAtIENvbnN0cmFpbiB0aGUgcG9zaXRpb24gdG8gYmUgaW5zaWRlIHRoZXNlIGJvdW5kc1xyXG4gICAqIEBwYXJhbSBjb3VudGluZ09iamVjdDFcclxuICAgKiBAcGFyYW0gY291bnRpbmdPYmplY3QyXHJcbiAgICogQHBhcmFtIGdldFJlcGVsT2Zmc2V0c1xyXG4gICAqL1xyXG4gIHB1YmxpYyByZXBlbEF3YXkoIGF2YWlsYWJsZU1vZGVsQm91bmRzOiBCb3VuZHMyLCBjb3VudGluZ09iamVjdDE6IENvdW50aW5nT2JqZWN0LCBjb3VudGluZ09iamVjdDI6IENvdW50aW5nT2JqZWN0LFxyXG4gICAgICAgICAgICAgICAgICAgIGdldFJlcGVsT2Zmc2V0czogKCBsZWZ0Q291bnRpbmdPYmplY3Q6IENvdW50aW5nT2JqZWN0LCByaWdodENvdW50aW5nT2JqZWN0OiBDb3VudGluZ09iamVjdCApID0+IHsgbGVmdDogbnVtYmVyOyByaWdodDogbnVtYmVyIH0gKTogdm9pZCB7XHJcbiAgICAvLyBEZXRlcm1pbmUgd2hpY2ggYXJlICdsZWZ0JyBhbmQgJ3JpZ2h0J1xyXG4gICAgY29uc3QgaXNQYXBlcjFMZWZ0ID0gY291bnRpbmdPYmplY3QxLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueCA8IGNvdW50aW5nT2JqZWN0Mi5wb3NpdGlvblByb3BlcnR5LnZhbHVlLng7XHJcbiAgICBjb25zdCBsZWZ0Q291bnRpbmdPYmplY3QgPSBpc1BhcGVyMUxlZnQgPyBjb3VudGluZ09iamVjdDEgOiBjb3VudGluZ09iamVjdDI7XHJcbiAgICBjb25zdCByaWdodENvdW50aW5nT2JqZWN0ID0gaXNQYXBlcjFMZWZ0ID8gY291bnRpbmdPYmplY3QyIDogY291bnRpbmdPYmplY3QxO1xyXG5cclxuICAgIC8vIERldGVybWluZSBvZmZzZXRzXHJcbiAgICBjb25zdCByZXBlbE9mZnNldHMgPSBnZXRSZXBlbE9mZnNldHMoIGxlZnRDb3VudGluZ09iamVjdCwgcmlnaHRDb3VudGluZ09iamVjdCApO1xyXG4gICAgY29uc3QgcmVwZWxMZWZ0T2Zmc2V0ID0gcmVwZWxPZmZzZXRzLmxlZnQ7XHJcbiAgICBjb25zdCByZXBlbFJpZ2h0T2Zmc2V0ID0gcmVwZWxPZmZzZXRzLnJpZ2h0O1xyXG4gICAgY29uc3QgbGVmdFBvc2l0aW9uID0gbGVmdENvdW50aW5nT2JqZWN0LnBvc2l0aW9uUHJvcGVydHkudmFsdWUucGx1c1hZKCByZXBlbExlZnRPZmZzZXQsIDAgKTtcclxuICAgIGNvbnN0IHJpZ2h0UG9zaXRpb24gPSByaWdodENvdW50aW5nT2JqZWN0LnBvc2l0aW9uUHJvcGVydHkudmFsdWUucGx1c1hZKCByZXBlbFJpZ2h0T2Zmc2V0LCAwICk7XHJcblxyXG4gICAgLy8gS2ljayBvZmYgdGhlIGFuaW1hdGlvbiB0byB0aGUgZGVzdGluYXRpb25cclxuICAgIGNvbnN0IGFuaW1hdGVUb0Rlc3RpbmF0aW9uID0gdHJ1ZTtcclxuICAgIGxlZnRDb3VudGluZ09iamVjdC5zZXRDb25zdHJhaW5lZERlc3RpbmF0aW9uKCBhdmFpbGFibGVNb2RlbEJvdW5kcywgbGVmdFBvc2l0aW9uLCBhbmltYXRlVG9EZXN0aW5hdGlvbiApO1xyXG4gICAgcmlnaHRDb3VudGluZ09iamVjdC5zZXRDb25zdHJhaW5lZERlc3RpbmF0aW9uKCBhdmFpbGFibGVNb2RlbEJvdW5kcywgcmlnaHRQb3NpdGlvbiwgYW5pbWF0ZVRvRGVzdGluYXRpb24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIHRvdGFsIHN1bSBvZiB0aGUgcGFwZXIgbnVtYmVycy5cclxuICAgKi9cclxuICBwdWJsaWMgY2FsY3VsYXRlVG90YWwoKTogdm9pZCB7XHJcbiAgICBsZXQgdG90YWwgPSAwO1xyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdHMuZmlsdGVyKCBjb3VudGluZ09iamVjdCA9PiBjb3VudGluZ09iamVjdC5pbmNsdWRlSW5TdW1Qcm9wZXJ0eS52YWx1ZSApLmZvckVhY2goIGNvdW50aW5nT2JqZWN0ID0+IHtcclxuICAgICAgdG90YWwgKz0gY291bnRpbmdPYmplY3QubnVtYmVyVmFsdWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgIH0gKTtcclxuICAgIHRoaXMuc3VtUHJvcGVydHkudmFsdWUgPSB0b3RhbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IHRoZSBtb2RlbFxyXG4gICAqL1xyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMucmVtb3ZlQWxsQ291bnRpbmdPYmplY3RzKCk7XHJcbiAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsKCk7XHJcbiAgICB0aGlzLnJlc2V0RW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5jb3VudGluZ0NvbW1vbi5yZWdpc3RlciggJ0NvdW50aW5nQ29tbW9uTW9kZWwnLCBDb3VudGluZ0NvbW1vbk1vZGVsICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDb3VudGluZ0NvbW1vbk1vZGVsO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EscUJBQXFCLE1BQTJCLDhDQUE4QztBQUNyRyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFVBQVUsTUFBTSxvQ0FBb0M7QUFDM0QsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUNwRCxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBRWhELE9BQU9DLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBSS9DLE1B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