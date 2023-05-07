// Copyright 2020-2022, University of Colorado Boulder

/**
 * OperationTrackingNumberLine is a specialization of the spatialized number line that tracks a set of addition and
 * subtraction operations so that they can be depicted on the number line.  It is important to note that the operation
 * order matters in how they are depicted, so this is designed with that assumption in mind.  In other words, it is
 * *not* designed such that it can handle an arbitrary number of operations in any order.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import NumberLinePoint from '../../../../number-line-common/js/common/model/NumberLinePoint.js';
import SpatializedNumberLine from '../../../../number-line-common/js/common/model/SpatializedNumberLine.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color } from '../../../../scenery/js/imports.js';
import numberLineOperations from '../../numberLineOperations.js';
import NLOConstants from '../NLOConstants.js';
import NumberLineOperation from './NumberLineOperation.js';
import Operation from './Operation.js';
class OperationTrackingNumberLine extends SpatializedNumberLine {
  /**
   * {Vector2} zeroPosition - the position in model space of the zero point on the number line
   * {NumberProperty} startingValueProperty - the starting value from which all operations will build
   * {Object} [options]
   * @public
   */
  constructor(zeroPosition, options) {
    options = merge({
      // {number} - the number of operations tracked
      numberOfOperationsTracked: 1,
      // {NumberProperty} - the value from which the operations will start, created if not supplied
      startingValueProperty: null,
      // {Color[]} - A list of colors that is used for the points that appear on the number line.  The list is ordered
      // such that the first color is the color of the initial point, the second is the color of the first operation if
      // present, and so on.
      pointColorList: [NLOConstants.DARK_BLUE_POINT_COLOR, NLOConstants.MEDIUM_BLUE_POINT_COLOR],
      // {boolean} - whether operation labels are initially visible, can be changed later via the Property
      operationLabelsInitiallyVisible: true,
      // {boolean} - whether descriptions are initially visible, can be changed later via the Property
      operationDescriptionsInitiallyVisible: true,
      // {boolean} - automatically deactivate an operation after it has been active for a while
      automaticallyDeactivateOperations: false,
      // {Object[]} - options used for each of the tracked operations, can either be an empty array if no options need
      // to be passed to the operations, or a set of options objects, one for each tracked operation
      operationOptionsArray: []
    }, options);
    assert && assert(options.numberOfOperationsTracked > 0 && options.numberOfOperationsTracked <= 2, `unsupported number of operations specified: ${options.numberOfOperationsTracked}`);
    assert && assert(options.pointColorList.length = options.numberOfOperationsTracked + 1, 'number of potential points doesn\'t match length of point color list');
    assert && assert(options.operationOptionsArray.length === 0 || options.operationOptionsArray.length === options.numberOfOperationsTracked, 'must either provide no operation options or the same number as the tracked operations');
    super(zeroPosition, options);

    // @public (read-write) - The starting value from which the active operations add and/or subtract, created if not
    // supplied.
    this.startingValueProperty = options.startingValueProperty;
    if (!this.startingValueProperty) {
      this.startingValueProperty = new NumberProperty(0);
    }

    // @public (read-write)
    this.showOperationLabelsProperty = new BooleanProperty(options.operationLabelsInitiallyVisible);

    // @public (read-write)
    this.showOperationDescriptionsProperty = new BooleanProperty(options.operationDescriptionsInitiallyVisible);

    // @public (read-only) {NumberLineOperation[] - An array of operations that this number line will track.  The order
    // matters in how changes are processed and how things are portrayed in the view, which is one of the main reasons
    // that they are created at construction rather than added and removed.  This is also better for phet-io.
    this.operations = [];
    _.times(options.numberOfOperationsTracked, index => {
      this.operations.push(new NumberLineOperation(options.operationOptionsArray[index] || {}));
    });

    // @public (read-write) - the number line point that corresponds with the starting value, this is always present
    this.startingPoint = new NumberLinePoint(this, {
      valueProperty: this.startingValueProperty,
      initialColor: options.pointColorList[0]
    });
    this.addPoint(this.startingPoint);

    // @public (read-only) {NumberLinePoint[]}- The endpoints for each operation.  There is one endpoint for each
    // operation and these are added to or removed from the number line as the corresponding operation goes active or
    // inactive.  The position in the array identifies the operation to which the endpoint corresponds.
    this.endpoints = [];
    _.times(options.numberOfOperationsTracked, index => {
      this.endpoints.push(new NumberLinePoint(this, {
        initialColor: options.pointColorList[index + 1]
      }));
    });

    // @public (read-only) {Map.<operation, number>} - A map that tracks when an operation expires, only used if
    // automatic deactivation is enabled.
    this.operationExpirationTimes = new Map();

    // function closure to update endpoint values as operations change
    const updateEndpoints = () => {
      // Cycle through the operations in order and update all endpoint values.
      this.operations.forEach((operation, index) => {
        const endpoint = this.endpoints[index];
        if (operation.isActiveProperty.value) {
          // state checking
          assert && assert(endpoint, 'there is no endpoint for this operation, internal state is incorrect');

          // The operation is active, so make sure its endpoint is on the number line.
          if (!this.hasPoint(endpoint)) {
            this.addPoint(endpoint);
          }

          // Update the value of the endpoint to the result of this operation EXCEPT when the endpoint is being dragged,
          // since in that case it is probably the dragging that caused the change to the operation, so setting the
          // value here will cause reentry.
          if (!endpoint.isDraggingProperty.value) {
            endpoint.valueProperty.set(this.getOperationResult(operation));
          }
        } else {
          // For an inactive operation, set the endpoint's value at what is essentially the starting point, like it was
          // an operation with an amount of zero.
          endpoint.valueProperty.set(index === 0 ? this.startingValueProperty.value : this.endpoints[index - 1].valueProperty.value);

          // Remove the associated endpoint if it's on the number line.
          if (this.hasPoint(endpoint)) {
            this.removePoint(endpoint);
          }
        }
      });
    };

    // function closure to update operations as endpoints are changed from being dragged
    const updateOperationWhenEndpointDragged = () => {
      this.endpoints.forEach((endpoint, index) => {
        if (endpoint.isDraggingProperty.value) {
          // State checking - By design, it should not be possible to drag an endpoint unless the operation with which
          // it is associated is active.
          assert && assert(this.operations[index].isActiveProperty, 'associated operation is not active');

          // The value of this endpoint was just changed by the user dragging it.  Update the amount of the
          // corresponding operation to match.
          const operation = this.operations[index];
          assert && assert(operation.isActiveProperty.value, 'state error - it should not be possible to update an inactive operation via dragging');
          const sign = operation.operationTypeProperty.value === Operation.SUBTRACTION ? -1 : 1;
          operation.amountProperty.set(sign * (endpoint.valueProperty.value - this.getOperationStartValue(operation)));
        }
      });
    };
    this.operations.forEach(operation => {
      // Set up listeners to update the endpoint values as the operations change.
      Multilink.multilink([operation.isActiveProperty, operation.amountProperty, operation.operationTypeProperty], updateEndpoints);

      // Update expiration times as operations become active and inactive. No unlink is necessary.
      operation.isActiveProperty.link(isActive => {
        if (isActive) {
          if (options.automaticallyDeactivateOperations) {
            this.operationExpirationTimes.set(operation, phet.joist.elapsedTime + NLOConstants.OPERATION_AUTO_DEACTIVATE_TIME);
          }
          this.getOperationStartPoint(operation).colorProperty.reset();
        } else {
          if (this.operationExpirationTimes.has(operation)) {
            this.operationExpirationTimes.delete(operation);
          }
        }
      });
    });

    // Update the endpoints if the starting point moves.  These instances are assumed to be persistent and therefore no
    // unlink is necessary.
    this.startingValueProperty.link(updateEndpoints);

    // Update the operations when the endpoints are dragged.  These instances are assumed to be persistent and therefore
    // no unlink is necessary.
    this.endpoints.forEach(endpoint => {
      endpoint.valueProperty.link(updateOperationWhenEndpointDragged);
    });
  }

  /**
   * Get the endpoint for the specified operation.
   * @param {NumberLineOperation} operation
   * @returns {NumberLinePoint}
   * @private
   */
  getOperationEndpoint(operation) {
    assert && assert(this.operations.includes(operation));
    return this.endpoints[this.operations.indexOf(operation)];
  }

  /**
   * Remove all operations, does nothing if there are none.
   * @public
   */
  deactivateAllOperations() {
    this.operations.forEach(operation => {
      operation.isActiveProperty.set(false);
    });
  }

  /**
   * Go through the operations and calculate the current end value.
   * @returns {number}
   * @public
   */
  getCurrentEndValue() {
    let value = this.startingValueProperty.value;
    this.operations.forEach(operation => {
      if (operation.isActiveProperty.value) {
        value = operation.getResult(value);
      }
    });
    return value;
  }

  /**
   * Get the value after this operation and all those that precede it on the operations list have been applied.
   * @param {NumberLineOperation} targetOperation
   * @returns {number}
   * @public
   */
  getOperationResult(targetOperation) {
    assert && assert(targetOperation.operationTypeProperty.value === Operation.ADDITION || targetOperation.operationTypeProperty.value === Operation.SUBTRACTION, 'unrecognized operation type');

    // Go through the list of operations modifying the end value based on the result of each until the requested
    // operation result has been processed.
    let value = this.startingValueProperty.value;
    for (let i = 0; i < this.operations.length; i++) {
      const operation = this.operations[i];
      if (operation.isActiveProperty.value) {
        value = operation.getResult(value);
      }

      // Test if we're done.
      if (operation === targetOperation) {
        break;
      }
    }
    return value;
  }

  /**
   * Get the start value of this operation by starting from the initial value and executing all operations that precede
   * it.
   * @param targetOperation
   * @returns {number}
   * @public
   */
  getOperationStartValue(targetOperation) {
    let value = this.startingValueProperty.value;
    for (let i = 0; i < this.operations.length; i++) {
      const operation = this.operations[i];
      if (operation === targetOperation) {
        break;
      } else if (operation.isActiveProperty.value) {
        value = operation.getResult(value);
      }
    }
    return value;
  }

  /**
   * Returns true if the start and end values of the operation are either entirely above or below the display range.
   * @param {NumberLineOperation} operation
   * @returns {boolean}
   * @public
   */
  isOperationCompletelyOutOfDisplayedRange(operation) {
    assert && assert(this.operations.includes(operation), 'the operation is not on this number line');
    const startValue = this.getOperationStartValue(operation);
    const endValue = this.getOperationResult(operation);
    const displayedRange = this.displayedRangeProperty.value;
    return startValue < displayedRange.min && endValue < displayedRange.min || startValue > displayedRange.max && endValue > displayedRange.max;
  }

  /**
   * Returns true if this operation starts or ends at the min or max of the displayed range and the other endpoint is
   * out of the displayed range.
   * @param {NumberLineOperation} operation
   * @returns {boolean}
   * @public
   */
  isOperationAtEdgeOfDisplayedRange(operation) {
    assert && assert(this.operations.includes(operation), 'the operation is not on this number line');
    const startValue = this.getOperationStartValue(operation);
    const endValue = this.getOperationResult(operation);
    const displayedRange = this.displayedRangeProperty.value;
    return startValue === displayedRange.min && endValue <= startValue || startValue === displayedRange.max && endValue >= startValue || endValue === displayedRange.min && startValue <= endValue || endValue === displayedRange.max && startValue >= endValue;
  }

  /**
   * Returns true if this operation is partially in and partially out of the display range.  Note that this will return
   * false if the operation is entirely inside the display range, so use carefully.
   * @param {NumberLineOperation} operation
   * @returns {boolean}
   * @public
   */
  isOperationPartiallyInDisplayedRange(operation) {
    assert && assert(this.operations.includes(operation), 'the operation is not on this number line');
    const startValue = this.getOperationStartValue(operation);
    const endValue = this.getOperationResult(operation);
    const displayedRange = this.displayedRangeProperty.value;
    return displayedRange.contains(startValue) && !displayedRange.contains(endValue) || !displayedRange.contains(startValue) && displayedRange.contains(endValue) || startValue < displayedRange.min && endValue > displayedRange.max || startValue > displayedRange.min && endValue < displayedRange.max;
  }

  /**
   * Get an array of the operations that are currently active on the number line.
   * @returns {NumberLineOperation[]}
   * @public
   */
  getActiveOperations() {
    const list = [];
    this.operations.forEach(operation => {
      if (operation.isActiveProperty.value) {
        list.push(operation);
      }
    });
    return list;
  }

  /**
   * @param {NumberLineOperation} operation
   * @returns {NumberLinePoint}
   * @private
   */
  getOperationStartPoint(operation) {
    const operationIndex = this.operations.indexOf(operation);
    let startingPoint;
    if (operationIndex === 0) {
      startingPoint = this.startingPoint;
    } else {
      startingPoint = this.endpoints[operationIndex - 1];
    }
    return startingPoint;
  }

  /**
   * @public
   */
  step() {
    for (const [operation, expirationTime] of this.operationExpirationTimes) {
      const operationStartPoint = this.getOperationStartPoint(operation);
      const operationStartPointColor = operationStartPoint.colorProperty.value;
      if (expirationTime < phet.joist.elapsedTime) {
        // Set the starting value to be where the end of this operation was.
        this.startingValueProperty.set(this.getOperationResult(operation));

        // Make sure the starting point is at full opacity.
        const nonFadedColor = new Color(operationStartPointColor.r, operationStartPointColor.g, operationStartPointColor.b, 1);
        operationStartPoint.colorProperty.set(nonFadedColor);

        // This operation has expired, so deactivate it.
        operation.isActiveProperty.set(false);
      } else {
        // This operation hasn't expired yet, but it's on the way.  Fade it's origin point as it gets close.
        if (expirationTime - phet.joist.elapsedTime < NLOConstants.OPERATION_FADE_OUT_TIME) {
          const opacity = Math.min(1, (expirationTime - phet.joist.elapsedTime) / NLOConstants.OPERATION_FADE_OUT_TIME);
          const potentiallyFadedColor = new Color(operationStartPointColor.r, operationStartPointColor.g, operationStartPointColor.b, opacity);
          operationStartPoint.colorProperty.set(potentiallyFadedColor);
        }
      }
    }
  }

  /**
   * Restore initial state.
   * @public
   * @override
   */
  reset() {
    this.deactivateAllOperations();
    this.startingValueProperty.reset();
    super.reset();

    // Reset the properties that were defined in this subclass.
    this.showOperationLabelsProperty.reset();
    this.showOperationDescriptionsProperty.reset();

    // Resetting the number line removes all points, so we need to add back the starting point.
    this.startingPoint.colorProperty.reset();
    this.addPoint(this.startingPoint);
  }
}
numberLineOperations.register('OperationTrackingNumberLine', OperationTrackingNumberLine);
export default OperationTrackingNumberLine;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIk51bWJlckxpbmVQb2ludCIsIlNwYXRpYWxpemVkTnVtYmVyTGluZSIsIm1lcmdlIiwiQ29sb3IiLCJudW1iZXJMaW5lT3BlcmF0aW9ucyIsIk5MT0NvbnN0YW50cyIsIk51bWJlckxpbmVPcGVyYXRpb24iLCJPcGVyYXRpb24iLCJPcGVyYXRpb25UcmFja2luZ051bWJlckxpbmUiLCJjb25zdHJ1Y3RvciIsInplcm9Qb3NpdGlvbiIsIm9wdGlvbnMiLCJudW1iZXJPZk9wZXJhdGlvbnNUcmFja2VkIiwic3RhcnRpbmdWYWx1ZVByb3BlcnR5IiwicG9pbnRDb2xvckxpc3QiLCJEQVJLX0JMVUVfUE9JTlRfQ09MT1IiLCJNRURJVU1fQkxVRV9QT0lOVF9DT0xPUiIsIm9wZXJhdGlvbkxhYmVsc0luaXRpYWxseVZpc2libGUiLCJvcGVyYXRpb25EZXNjcmlwdGlvbnNJbml0aWFsbHlWaXNpYmxlIiwiYXV0b21hdGljYWxseURlYWN0aXZhdGVPcGVyYXRpb25zIiwib3BlcmF0aW9uT3B0aW9uc0FycmF5IiwiYXNzZXJ0IiwibGVuZ3RoIiwic2hvd09wZXJhdGlvbkxhYmVsc1Byb3BlcnR5Iiwic2hvd09wZXJhdGlvbkRlc2NyaXB0aW9uc1Byb3BlcnR5Iiwib3BlcmF0aW9ucyIsIl8iLCJ0aW1lcyIsImluZGV4IiwicHVzaCIsInN0YXJ0aW5nUG9pbnQiLCJ2YWx1ZVByb3BlcnR5IiwiaW5pdGlhbENvbG9yIiwiYWRkUG9pbnQiLCJlbmRwb2ludHMiLCJvcGVyYXRpb25FeHBpcmF0aW9uVGltZXMiLCJNYXAiLCJ1cGRhdGVFbmRwb2ludHMiLCJmb3JFYWNoIiwib3BlcmF0aW9uIiwiZW5kcG9pbnQiLCJpc0FjdGl2ZVByb3BlcnR5IiwidmFsdWUiLCJoYXNQb2ludCIsImlzRHJhZ2dpbmdQcm9wZXJ0eSIsInNldCIsImdldE9wZXJhdGlvblJlc3VsdCIsInJlbW92ZVBvaW50IiwidXBkYXRlT3BlcmF0aW9uV2hlbkVuZHBvaW50RHJhZ2dlZCIsInNpZ24iLCJvcGVyYXRpb25UeXBlUHJvcGVydHkiLCJTVUJUUkFDVElPTiIsImFtb3VudFByb3BlcnR5IiwiZ2V0T3BlcmF0aW9uU3RhcnRWYWx1ZSIsIm11bHRpbGluayIsImxpbmsiLCJpc0FjdGl2ZSIsInBoZXQiLCJqb2lzdCIsImVsYXBzZWRUaW1lIiwiT1BFUkFUSU9OX0FVVE9fREVBQ1RJVkFURV9USU1FIiwiZ2V0T3BlcmF0aW9uU3RhcnRQb2ludCIsImNvbG9yUHJvcGVydHkiLCJyZXNldCIsImhhcyIsImRlbGV0ZSIsImdldE9wZXJhdGlvbkVuZHBvaW50IiwiaW5jbHVkZXMiLCJpbmRleE9mIiwiZGVhY3RpdmF0ZUFsbE9wZXJhdGlvbnMiLCJnZXRDdXJyZW50RW5kVmFsdWUiLCJnZXRSZXN1bHQiLCJ0YXJnZXRPcGVyYXRpb24iLCJBRERJVElPTiIsImkiLCJpc09wZXJhdGlvbkNvbXBsZXRlbHlPdXRPZkRpc3BsYXllZFJhbmdlIiwic3RhcnRWYWx1ZSIsImVuZFZhbHVlIiwiZGlzcGxheWVkUmFuZ2UiLCJkaXNwbGF5ZWRSYW5nZVByb3BlcnR5IiwibWluIiwibWF4IiwiaXNPcGVyYXRpb25BdEVkZ2VPZkRpc3BsYXllZFJhbmdlIiwiaXNPcGVyYXRpb25QYXJ0aWFsbHlJbkRpc3BsYXllZFJhbmdlIiwiY29udGFpbnMiLCJnZXRBY3RpdmVPcGVyYXRpb25zIiwibGlzdCIsIm9wZXJhdGlvbkluZGV4Iiwic3RlcCIsImV4cGlyYXRpb25UaW1lIiwib3BlcmF0aW9uU3RhcnRQb2ludCIsIm9wZXJhdGlvblN0YXJ0UG9pbnRDb2xvciIsIm5vbkZhZGVkQ29sb3IiLCJyIiwiZyIsImIiLCJPUEVSQVRJT05fRkFERV9PVVRfVElNRSIsIm9wYWNpdHkiLCJNYXRoIiwicG90ZW50aWFsbHlGYWRlZENvbG9yIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJPcGVyYXRpb25UcmFja2luZ051bWJlckxpbmUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogT3BlcmF0aW9uVHJhY2tpbmdOdW1iZXJMaW5lIGlzIGEgc3BlY2lhbGl6YXRpb24gb2YgdGhlIHNwYXRpYWxpemVkIG51bWJlciBsaW5lIHRoYXQgdHJhY2tzIGEgc2V0IG9mIGFkZGl0aW9uIGFuZFxyXG4gKiBzdWJ0cmFjdGlvbiBvcGVyYXRpb25zIHNvIHRoYXQgdGhleSBjYW4gYmUgZGVwaWN0ZWQgb24gdGhlIG51bWJlciBsaW5lLiAgSXQgaXMgaW1wb3J0YW50IHRvIG5vdGUgdGhhdCB0aGUgb3BlcmF0aW9uXHJcbiAqIG9yZGVyIG1hdHRlcnMgaW4gaG93IHRoZXkgYXJlIGRlcGljdGVkLCBzbyB0aGlzIGlzIGRlc2lnbmVkIHdpdGggdGhhdCBhc3N1bXB0aW9uIGluIG1pbmQuICBJbiBvdGhlciB3b3JkcywgaXQgaXNcclxuICogKm5vdCogZGVzaWduZWQgc3VjaCB0aGF0IGl0IGNhbiBoYW5kbGUgYW4gYXJiaXRyYXJ5IG51bWJlciBvZiBvcGVyYXRpb25zIGluIGFueSBvcmRlci5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlckxpbmVQb2ludCBmcm9tICcuLi8uLi8uLi8uLi9udW1iZXItbGluZS1jb21tb24vanMvY29tbW9uL21vZGVsL051bWJlckxpbmVQb2ludC5qcyc7XHJcbmltcG9ydCBTcGF0aWFsaXplZE51bWJlckxpbmUgZnJvbSAnLi4vLi4vLi4vLi4vbnVtYmVyLWxpbmUtY29tbW9uL2pzL2NvbW1vbi9tb2RlbC9TcGF0aWFsaXplZE51bWJlckxpbmUuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbnVtYmVyTGluZU9wZXJhdGlvbnMgZnJvbSAnLi4vLi4vbnVtYmVyTGluZU9wZXJhdGlvbnMuanMnO1xyXG5pbXBvcnQgTkxPQ29uc3RhbnRzIGZyb20gJy4uL05MT0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBOdW1iZXJMaW5lT3BlcmF0aW9uIGZyb20gJy4vTnVtYmVyTGluZU9wZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBPcGVyYXRpb24gZnJvbSAnLi9PcGVyYXRpb24uanMnO1xyXG5cclxuY2xhc3MgT3BlcmF0aW9uVHJhY2tpbmdOdW1iZXJMaW5lIGV4dGVuZHMgU3BhdGlhbGl6ZWROdW1iZXJMaW5lIHtcclxuXHJcbiAgLyoqXHJcbiAgICoge1ZlY3RvcjJ9IHplcm9Qb3NpdGlvbiAtIHRoZSBwb3NpdGlvbiBpbiBtb2RlbCBzcGFjZSBvZiB0aGUgemVybyBwb2ludCBvbiB0aGUgbnVtYmVyIGxpbmVcclxuICAgKiB7TnVtYmVyUHJvcGVydHl9IHN0YXJ0aW5nVmFsdWVQcm9wZXJ0eSAtIHRoZSBzdGFydGluZyB2YWx1ZSBmcm9tIHdoaWNoIGFsbCBvcGVyYXRpb25zIHdpbGwgYnVpbGRcclxuICAgKiB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHplcm9Qb3NpdGlvbiwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9IC0gdGhlIG51bWJlciBvZiBvcGVyYXRpb25zIHRyYWNrZWRcclxuICAgICAgbnVtYmVyT2ZPcGVyYXRpb25zVHJhY2tlZDogMSxcclxuXHJcbiAgICAgIC8vIHtOdW1iZXJQcm9wZXJ0eX0gLSB0aGUgdmFsdWUgZnJvbSB3aGljaCB0aGUgb3BlcmF0aW9ucyB3aWxsIHN0YXJ0LCBjcmVhdGVkIGlmIG5vdCBzdXBwbGllZFxyXG4gICAgICBzdGFydGluZ1ZhbHVlUHJvcGVydHk6IG51bGwsXHJcblxyXG4gICAgICAvLyB7Q29sb3JbXX0gLSBBIGxpc3Qgb2YgY29sb3JzIHRoYXQgaXMgdXNlZCBmb3IgdGhlIHBvaW50cyB0aGF0IGFwcGVhciBvbiB0aGUgbnVtYmVyIGxpbmUuICBUaGUgbGlzdCBpcyBvcmRlcmVkXHJcbiAgICAgIC8vIHN1Y2ggdGhhdCB0aGUgZmlyc3QgY29sb3IgaXMgdGhlIGNvbG9yIG9mIHRoZSBpbml0aWFsIHBvaW50LCB0aGUgc2Vjb25kIGlzIHRoZSBjb2xvciBvZiB0aGUgZmlyc3Qgb3BlcmF0aW9uIGlmXHJcbiAgICAgIC8vIHByZXNlbnQsIGFuZCBzbyBvbi5cclxuICAgICAgcG9pbnRDb2xvckxpc3Q6IFsgTkxPQ29uc3RhbnRzLkRBUktfQkxVRV9QT0lOVF9DT0xPUiwgTkxPQ29uc3RhbnRzLk1FRElVTV9CTFVFX1BPSU5UX0NPTE9SIF0sXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSB3aGV0aGVyIG9wZXJhdGlvbiBsYWJlbHMgYXJlIGluaXRpYWxseSB2aXNpYmxlLCBjYW4gYmUgY2hhbmdlZCBsYXRlciB2aWEgdGhlIFByb3BlcnR5XHJcbiAgICAgIG9wZXJhdGlvbkxhYmVsc0luaXRpYWxseVZpc2libGU6IHRydWUsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSB3aGV0aGVyIGRlc2NyaXB0aW9ucyBhcmUgaW5pdGlhbGx5IHZpc2libGUsIGNhbiBiZSBjaGFuZ2VkIGxhdGVyIHZpYSB0aGUgUHJvcGVydHlcclxuICAgICAgb3BlcmF0aW9uRGVzY3JpcHRpb25zSW5pdGlhbGx5VmlzaWJsZTogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIGF1dG9tYXRpY2FsbHkgZGVhY3RpdmF0ZSBhbiBvcGVyYXRpb24gYWZ0ZXIgaXQgaGFzIGJlZW4gYWN0aXZlIGZvciBhIHdoaWxlXHJcbiAgICAgIGF1dG9tYXRpY2FsbHlEZWFjdGl2YXRlT3BlcmF0aW9uczogZmFsc2UsXHJcblxyXG4gICAgICAvLyB7T2JqZWN0W119IC0gb3B0aW9ucyB1c2VkIGZvciBlYWNoIG9mIHRoZSB0cmFja2VkIG9wZXJhdGlvbnMsIGNhbiBlaXRoZXIgYmUgYW4gZW1wdHkgYXJyYXkgaWYgbm8gb3B0aW9ucyBuZWVkXHJcbiAgICAgIC8vIHRvIGJlIHBhc3NlZCB0byB0aGUgb3BlcmF0aW9ucywgb3IgYSBzZXQgb2Ygb3B0aW9ucyBvYmplY3RzLCBvbmUgZm9yIGVhY2ggdHJhY2tlZCBvcGVyYXRpb25cclxuICAgICAgb3BlcmF0aW9uT3B0aW9uc0FycmF5OiBbXVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICBvcHRpb25zLm51bWJlck9mT3BlcmF0aW9uc1RyYWNrZWQgPiAwICYmIG9wdGlvbnMubnVtYmVyT2ZPcGVyYXRpb25zVHJhY2tlZCA8PSAyLFxyXG4gICAgICBgdW5zdXBwb3J0ZWQgbnVtYmVyIG9mIG9wZXJhdGlvbnMgc3BlY2lmaWVkOiAke29wdGlvbnMubnVtYmVyT2ZPcGVyYXRpb25zVHJhY2tlZH1gXHJcbiAgICApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgICAgb3B0aW9ucy5wb2ludENvbG9yTGlzdC5sZW5ndGggPSBvcHRpb25zLm51bWJlck9mT3BlcmF0aW9uc1RyYWNrZWQgKyAxLFxyXG4gICAgICAnbnVtYmVyIG9mIHBvdGVudGlhbCBwb2ludHMgZG9lc25cXCd0IG1hdGNoIGxlbmd0aCBvZiBwb2ludCBjb2xvciBsaXN0J1xyXG4gICAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgIG9wdGlvbnMub3BlcmF0aW9uT3B0aW9uc0FycmF5Lmxlbmd0aCA9PT0gMCB8fCBvcHRpb25zLm9wZXJhdGlvbk9wdGlvbnNBcnJheS5sZW5ndGggPT09IG9wdGlvbnMubnVtYmVyT2ZPcGVyYXRpb25zVHJhY2tlZCxcclxuICAgICAgJ211c3QgZWl0aGVyIHByb3ZpZGUgbm8gb3BlcmF0aW9uIG9wdGlvbnMgb3IgdGhlIHNhbWUgbnVtYmVyIGFzIHRoZSB0cmFja2VkIG9wZXJhdGlvbnMnXHJcbiAgICApO1xyXG5cclxuICAgIHN1cGVyKCB6ZXJvUG9zaXRpb24sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLXdyaXRlKSAtIFRoZSBzdGFydGluZyB2YWx1ZSBmcm9tIHdoaWNoIHRoZSBhY3RpdmUgb3BlcmF0aW9ucyBhZGQgYW5kL29yIHN1YnRyYWN0LCBjcmVhdGVkIGlmIG5vdFxyXG4gICAgLy8gc3VwcGxpZWQuXHJcbiAgICB0aGlzLnN0YXJ0aW5nVmFsdWVQcm9wZXJ0eSA9IG9wdGlvbnMuc3RhcnRpbmdWYWx1ZVByb3BlcnR5O1xyXG4gICAgaWYgKCAhdGhpcy5zdGFydGluZ1ZhbHVlUHJvcGVydHkgKSB7XHJcbiAgICAgIHRoaXMuc3RhcnRpbmdWYWx1ZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC13cml0ZSlcclxuICAgIHRoaXMuc2hvd09wZXJhdGlvbkxhYmVsc1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggb3B0aW9ucy5vcGVyYXRpb25MYWJlbHNJbml0aWFsbHlWaXNpYmxlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC13cml0ZSlcclxuICAgIHRoaXMuc2hvd09wZXJhdGlvbkRlc2NyaXB0aW9uc1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggb3B0aW9ucy5vcGVyYXRpb25EZXNjcmlwdGlvbnNJbml0aWFsbHlWaXNpYmxlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7TnVtYmVyTGluZU9wZXJhdGlvbltdIC0gQW4gYXJyYXkgb2Ygb3BlcmF0aW9ucyB0aGF0IHRoaXMgbnVtYmVyIGxpbmUgd2lsbCB0cmFjay4gIFRoZSBvcmRlclxyXG4gICAgLy8gbWF0dGVycyBpbiBob3cgY2hhbmdlcyBhcmUgcHJvY2Vzc2VkIGFuZCBob3cgdGhpbmdzIGFyZSBwb3J0cmF5ZWQgaW4gdGhlIHZpZXcsIHdoaWNoIGlzIG9uZSBvZiB0aGUgbWFpbiByZWFzb25zXHJcbiAgICAvLyB0aGF0IHRoZXkgYXJlIGNyZWF0ZWQgYXQgY29uc3RydWN0aW9uIHJhdGhlciB0aGFuIGFkZGVkIGFuZCByZW1vdmVkLiAgVGhpcyBpcyBhbHNvIGJldHRlciBmb3IgcGhldC1pby5cclxuICAgIHRoaXMub3BlcmF0aW9ucyA9IFtdO1xyXG4gICAgXy50aW1lcyggb3B0aW9ucy5udW1iZXJPZk9wZXJhdGlvbnNUcmFja2VkLCBpbmRleCA9PiB7XHJcbiAgICAgIHRoaXMub3BlcmF0aW9ucy5wdXNoKCBuZXcgTnVtYmVyTGluZU9wZXJhdGlvbiggb3B0aW9ucy5vcGVyYXRpb25PcHRpb25zQXJyYXlbIGluZGV4IF0gfHwge30gKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtd3JpdGUpIC0gdGhlIG51bWJlciBsaW5lIHBvaW50IHRoYXQgY29ycmVzcG9uZHMgd2l0aCB0aGUgc3RhcnRpbmcgdmFsdWUsIHRoaXMgaXMgYWx3YXlzIHByZXNlbnRcclxuICAgIHRoaXMuc3RhcnRpbmdQb2ludCA9IG5ldyBOdW1iZXJMaW5lUG9pbnQoIHRoaXMsIHtcclxuICAgICAgdmFsdWVQcm9wZXJ0eTogdGhpcy5zdGFydGluZ1ZhbHVlUHJvcGVydHksXHJcbiAgICAgIGluaXRpYWxDb2xvcjogb3B0aW9ucy5wb2ludENvbG9yTGlzdFsgMCBdXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZFBvaW50KCB0aGlzLnN0YXJ0aW5nUG9pbnQgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtOdW1iZXJMaW5lUG9pbnRbXX0tIFRoZSBlbmRwb2ludHMgZm9yIGVhY2ggb3BlcmF0aW9uLiAgVGhlcmUgaXMgb25lIGVuZHBvaW50IGZvciBlYWNoXHJcbiAgICAvLyBvcGVyYXRpb24gYW5kIHRoZXNlIGFyZSBhZGRlZCB0byBvciByZW1vdmVkIGZyb20gdGhlIG51bWJlciBsaW5lIGFzIHRoZSBjb3JyZXNwb25kaW5nIG9wZXJhdGlvbiBnb2VzIGFjdGl2ZSBvclxyXG4gICAgLy8gaW5hY3RpdmUuICBUaGUgcG9zaXRpb24gaW4gdGhlIGFycmF5IGlkZW50aWZpZXMgdGhlIG9wZXJhdGlvbiB0byB3aGljaCB0aGUgZW5kcG9pbnQgY29ycmVzcG9uZHMuXHJcbiAgICB0aGlzLmVuZHBvaW50cyA9IFtdO1xyXG4gICAgXy50aW1lcyggb3B0aW9ucy5udW1iZXJPZk9wZXJhdGlvbnNUcmFja2VkLCBpbmRleCA9PiB7XHJcbiAgICAgIHRoaXMuZW5kcG9pbnRzLnB1c2goIG5ldyBOdW1iZXJMaW5lUG9pbnQoIHRoaXMsIHtcclxuICAgICAgICBpbml0aWFsQ29sb3I6IG9wdGlvbnMucG9pbnRDb2xvckxpc3RbIGluZGV4ICsgMSBdXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge01hcC48b3BlcmF0aW9uLCBudW1iZXI+fSAtIEEgbWFwIHRoYXQgdHJhY2tzIHdoZW4gYW4gb3BlcmF0aW9uIGV4cGlyZXMsIG9ubHkgdXNlZCBpZlxyXG4gICAgLy8gYXV0b21hdGljIGRlYWN0aXZhdGlvbiBpcyBlbmFibGVkLlxyXG4gICAgdGhpcy5vcGVyYXRpb25FeHBpcmF0aW9uVGltZXMgPSBuZXcgTWFwKCk7XHJcblxyXG4gICAgLy8gZnVuY3Rpb24gY2xvc3VyZSB0byB1cGRhdGUgZW5kcG9pbnQgdmFsdWVzIGFzIG9wZXJhdGlvbnMgY2hhbmdlXHJcbiAgICBjb25zdCB1cGRhdGVFbmRwb2ludHMgPSAoKSA9PiB7XHJcblxyXG4gICAgICAvLyBDeWNsZSB0aHJvdWdoIHRoZSBvcGVyYXRpb25zIGluIG9yZGVyIGFuZCB1cGRhdGUgYWxsIGVuZHBvaW50IHZhbHVlcy5cclxuICAgICAgdGhpcy5vcGVyYXRpb25zLmZvckVhY2goICggb3BlcmF0aW9uLCBpbmRleCApID0+IHtcclxuICAgICAgICBjb25zdCBlbmRwb2ludCA9IHRoaXMuZW5kcG9pbnRzWyBpbmRleCBdO1xyXG4gICAgICAgIGlmICggb3BlcmF0aW9uLmlzQWN0aXZlUHJvcGVydHkudmFsdWUgKSB7XHJcblxyXG4gICAgICAgICAgLy8gc3RhdGUgY2hlY2tpbmdcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGVuZHBvaW50LCAndGhlcmUgaXMgbm8gZW5kcG9pbnQgZm9yIHRoaXMgb3BlcmF0aW9uLCBpbnRlcm5hbCBzdGF0ZSBpcyBpbmNvcnJlY3QnICk7XHJcblxyXG4gICAgICAgICAgLy8gVGhlIG9wZXJhdGlvbiBpcyBhY3RpdmUsIHNvIG1ha2Ugc3VyZSBpdHMgZW5kcG9pbnQgaXMgb24gdGhlIG51bWJlciBsaW5lLlxyXG4gICAgICAgICAgaWYgKCAhdGhpcy5oYXNQb2ludCggZW5kcG9pbnQgKSApIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRQb2ludCggZW5kcG9pbnQgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBVcGRhdGUgdGhlIHZhbHVlIG9mIHRoZSBlbmRwb2ludCB0byB0aGUgcmVzdWx0IG9mIHRoaXMgb3BlcmF0aW9uIEVYQ0VQVCB3aGVuIHRoZSBlbmRwb2ludCBpcyBiZWluZyBkcmFnZ2VkLFxyXG4gICAgICAgICAgLy8gc2luY2UgaW4gdGhhdCBjYXNlIGl0IGlzIHByb2JhYmx5IHRoZSBkcmFnZ2luZyB0aGF0IGNhdXNlZCB0aGUgY2hhbmdlIHRvIHRoZSBvcGVyYXRpb24sIHNvIHNldHRpbmcgdGhlXHJcbiAgICAgICAgICAvLyB2YWx1ZSBoZXJlIHdpbGwgY2F1c2UgcmVlbnRyeS5cclxuICAgICAgICAgIGlmICggIWVuZHBvaW50LmlzRHJhZ2dpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICAgICAgZW5kcG9pbnQudmFsdWVQcm9wZXJ0eS5zZXQoIHRoaXMuZ2V0T3BlcmF0aW9uUmVzdWx0KCBvcGVyYXRpb24gKSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBGb3IgYW4gaW5hY3RpdmUgb3BlcmF0aW9uLCBzZXQgdGhlIGVuZHBvaW50J3MgdmFsdWUgYXQgd2hhdCBpcyBlc3NlbnRpYWxseSB0aGUgc3RhcnRpbmcgcG9pbnQsIGxpa2UgaXQgd2FzXHJcbiAgICAgICAgICAvLyBhbiBvcGVyYXRpb24gd2l0aCBhbiBhbW91bnQgb2YgemVyby5cclxuICAgICAgICAgIGVuZHBvaW50LnZhbHVlUHJvcGVydHkuc2V0KCBpbmRleCA9PT0gMCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFydGluZ1ZhbHVlUHJvcGVydHkudmFsdWUgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW5kcG9pbnRzWyBpbmRleCAtIDEgXS52YWx1ZVByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgICAgICAgLy8gUmVtb3ZlIHRoZSBhc3NvY2lhdGVkIGVuZHBvaW50IGlmIGl0J3Mgb24gdGhlIG51bWJlciBsaW5lLlxyXG4gICAgICAgICAgaWYgKCB0aGlzLmhhc1BvaW50KCBlbmRwb2ludCApICkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVBvaW50KCBlbmRwb2ludCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBmdW5jdGlvbiBjbG9zdXJlIHRvIHVwZGF0ZSBvcGVyYXRpb25zIGFzIGVuZHBvaW50cyBhcmUgY2hhbmdlZCBmcm9tIGJlaW5nIGRyYWdnZWRcclxuICAgIGNvbnN0IHVwZGF0ZU9wZXJhdGlvbldoZW5FbmRwb2ludERyYWdnZWQgPSAoKSA9PiB7XHJcblxyXG4gICAgICB0aGlzLmVuZHBvaW50cy5mb3JFYWNoKCAoIGVuZHBvaW50LCBpbmRleCApID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCBlbmRwb2ludC5pc0RyYWdnaW5nUHJvcGVydHkudmFsdWUgKSB7XHJcblxyXG4gICAgICAgICAgLy8gU3RhdGUgY2hlY2tpbmcgLSBCeSBkZXNpZ24sIGl0IHNob3VsZCBub3QgYmUgcG9zc2libGUgdG8gZHJhZyBhbiBlbmRwb2ludCB1bmxlc3MgdGhlIG9wZXJhdGlvbiB3aXRoIHdoaWNoXHJcbiAgICAgICAgICAvLyBpdCBpcyBhc3NvY2lhdGVkIGlzIGFjdGl2ZS5cclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMub3BlcmF0aW9uc1sgaW5kZXggXS5pc0FjdGl2ZVByb3BlcnR5LCAnYXNzb2NpYXRlZCBvcGVyYXRpb24gaXMgbm90IGFjdGl2ZScgKTtcclxuXHJcbiAgICAgICAgICAvLyBUaGUgdmFsdWUgb2YgdGhpcyBlbmRwb2ludCB3YXMganVzdCBjaGFuZ2VkIGJ5IHRoZSB1c2VyIGRyYWdnaW5nIGl0LiAgVXBkYXRlIHRoZSBhbW91bnQgb2YgdGhlXHJcbiAgICAgICAgICAvLyBjb3JyZXNwb25kaW5nIG9wZXJhdGlvbiB0byBtYXRjaC5cclxuICAgICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IHRoaXMub3BlcmF0aW9uc1sgaW5kZXggXTtcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgICAgICAgIG9wZXJhdGlvbi5pc0FjdGl2ZVByb3BlcnR5LnZhbHVlLFxyXG4gICAgICAgICAgICAnc3RhdGUgZXJyb3IgLSBpdCBzaG91bGQgbm90IGJlIHBvc3NpYmxlIHRvIHVwZGF0ZSBhbiBpbmFjdGl2ZSBvcGVyYXRpb24gdmlhIGRyYWdnaW5nJ1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGNvbnN0IHNpZ24gPSBvcGVyYXRpb24ub3BlcmF0aW9uVHlwZVByb3BlcnR5LnZhbHVlID09PSBPcGVyYXRpb24uU1VCVFJBQ1RJT04gPyAtMSA6IDE7XHJcbiAgICAgICAgICBvcGVyYXRpb24uYW1vdW50UHJvcGVydHkuc2V0KFxyXG4gICAgICAgICAgICBzaWduICogKCBlbmRwb2ludC52YWx1ZVByb3BlcnR5LnZhbHVlIC0gdGhpcy5nZXRPcGVyYXRpb25TdGFydFZhbHVlKCBvcGVyYXRpb24gKSApXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLm9wZXJhdGlvbnMuZm9yRWFjaCggb3BlcmF0aW9uID0+IHtcclxuXHJcbiAgICAgIC8vIFNldCB1cCBsaXN0ZW5lcnMgdG8gdXBkYXRlIHRoZSBlbmRwb2ludCB2YWx1ZXMgYXMgdGhlIG9wZXJhdGlvbnMgY2hhbmdlLlxyXG4gICAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICAgIFsgb3BlcmF0aW9uLmlzQWN0aXZlUHJvcGVydHksIG9wZXJhdGlvbi5hbW91bnRQcm9wZXJ0eSwgb3BlcmF0aW9uLm9wZXJhdGlvblR5cGVQcm9wZXJ0eSBdLFxyXG4gICAgICAgIHVwZGF0ZUVuZHBvaW50c1xyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gVXBkYXRlIGV4cGlyYXRpb24gdGltZXMgYXMgb3BlcmF0aW9ucyBiZWNvbWUgYWN0aXZlIGFuZCBpbmFjdGl2ZS4gTm8gdW5saW5rIGlzIG5lY2Vzc2FyeS5cclxuICAgICAgb3BlcmF0aW9uLmlzQWN0aXZlUHJvcGVydHkubGluayggaXNBY3RpdmUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIGlzQWN0aXZlICkge1xyXG4gICAgICAgICAgaWYgKCBvcHRpb25zLmF1dG9tYXRpY2FsbHlEZWFjdGl2YXRlT3BlcmF0aW9ucyApIHtcclxuICAgICAgICAgICAgdGhpcy5vcGVyYXRpb25FeHBpcmF0aW9uVGltZXMuc2V0KCBvcGVyYXRpb24sIHBoZXQuam9pc3QuZWxhcHNlZFRpbWUgKyBOTE9Db25zdGFudHMuT1BFUkFUSU9OX0FVVE9fREVBQ1RJVkFURV9USU1FICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmdldE9wZXJhdGlvblN0YXJ0UG9pbnQoIG9wZXJhdGlvbiApLmNvbG9yUHJvcGVydHkucmVzZXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBpZiAoIHRoaXMub3BlcmF0aW9uRXhwaXJhdGlvblRpbWVzLmhhcyggb3BlcmF0aW9uICkgKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3BlcmF0aW9uRXhwaXJhdGlvblRpbWVzLmRlbGV0ZSggb3BlcmF0aW9uICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBlbmRwb2ludHMgaWYgdGhlIHN0YXJ0aW5nIHBvaW50IG1vdmVzLiAgVGhlc2UgaW5zdGFuY2VzIGFyZSBhc3N1bWVkIHRvIGJlIHBlcnNpc3RlbnQgYW5kIHRoZXJlZm9yZSBub1xyXG4gICAgLy8gdW5saW5rIGlzIG5lY2Vzc2FyeS5cclxuICAgIHRoaXMuc3RhcnRpbmdWYWx1ZVByb3BlcnR5LmxpbmsoIHVwZGF0ZUVuZHBvaW50cyApO1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgb3BlcmF0aW9ucyB3aGVuIHRoZSBlbmRwb2ludHMgYXJlIGRyYWdnZWQuICBUaGVzZSBpbnN0YW5jZXMgYXJlIGFzc3VtZWQgdG8gYmUgcGVyc2lzdGVudCBhbmQgdGhlcmVmb3JlXHJcbiAgICAvLyBubyB1bmxpbmsgaXMgbmVjZXNzYXJ5LlxyXG4gICAgdGhpcy5lbmRwb2ludHMuZm9yRWFjaCggZW5kcG9pbnQgPT4ge1xyXG4gICAgICBlbmRwb2ludC52YWx1ZVByb3BlcnR5LmxpbmsoIHVwZGF0ZU9wZXJhdGlvbldoZW5FbmRwb2ludERyYWdnZWQgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgZW5kcG9pbnQgZm9yIHRoZSBzcGVjaWZpZWQgb3BlcmF0aW9uLlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyTGluZU9wZXJhdGlvbn0gb3BlcmF0aW9uXHJcbiAgICogQHJldHVybnMge051bWJlckxpbmVQb2ludH1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldE9wZXJhdGlvbkVuZHBvaW50KCBvcGVyYXRpb24gKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm9wZXJhdGlvbnMuaW5jbHVkZXMoIG9wZXJhdGlvbiApICk7XHJcbiAgICByZXR1cm4gdGhpcy5lbmRwb2ludHNbIHRoaXMub3BlcmF0aW9ucy5pbmRleE9mKCBvcGVyYXRpb24gKSBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGFsbCBvcGVyYXRpb25zLCBkb2VzIG5vdGhpbmcgaWYgdGhlcmUgYXJlIG5vbmUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRlYWN0aXZhdGVBbGxPcGVyYXRpb25zKCkge1xyXG4gICAgdGhpcy5vcGVyYXRpb25zLmZvckVhY2goIG9wZXJhdGlvbiA9PiB7XHJcbiAgICAgIG9wZXJhdGlvbi5pc0FjdGl2ZVByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdvIHRocm91Z2ggdGhlIG9wZXJhdGlvbnMgYW5kIGNhbGN1bGF0ZSB0aGUgY3VycmVudCBlbmQgdmFsdWUuXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0Q3VycmVudEVuZFZhbHVlKCkge1xyXG4gICAgbGV0IHZhbHVlID0gdGhpcy5zdGFydGluZ1ZhbHVlUHJvcGVydHkudmFsdWU7XHJcbiAgICB0aGlzLm9wZXJhdGlvbnMuZm9yRWFjaCggb3BlcmF0aW9uID0+IHtcclxuICAgICAgaWYgKCBvcGVyYXRpb24uaXNBY3RpdmVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICB2YWx1ZSA9IG9wZXJhdGlvbi5nZXRSZXN1bHQoIHZhbHVlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgdmFsdWUgYWZ0ZXIgdGhpcyBvcGVyYXRpb24gYW5kIGFsbCB0aG9zZSB0aGF0IHByZWNlZGUgaXQgb24gdGhlIG9wZXJhdGlvbnMgbGlzdCBoYXZlIGJlZW4gYXBwbGllZC5cclxuICAgKiBAcGFyYW0ge051bWJlckxpbmVPcGVyYXRpb259IHRhcmdldE9wZXJhdGlvblxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE9wZXJhdGlvblJlc3VsdCggdGFyZ2V0T3BlcmF0aW9uICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgIHRhcmdldE9wZXJhdGlvbi5vcGVyYXRpb25UeXBlUHJvcGVydHkudmFsdWUgPT09IE9wZXJhdGlvbi5BRERJVElPTiB8fFxyXG4gICAgICB0YXJnZXRPcGVyYXRpb24ub3BlcmF0aW9uVHlwZVByb3BlcnR5LnZhbHVlID09PSBPcGVyYXRpb24uU1VCVFJBQ1RJT04sXHJcbiAgICAgICd1bnJlY29nbml6ZWQgb3BlcmF0aW9uIHR5cGUnXHJcbiAgICApO1xyXG5cclxuICAgIC8vIEdvIHRocm91Z2ggdGhlIGxpc3Qgb2Ygb3BlcmF0aW9ucyBtb2RpZnlpbmcgdGhlIGVuZCB2YWx1ZSBiYXNlZCBvbiB0aGUgcmVzdWx0IG9mIGVhY2ggdW50aWwgdGhlIHJlcXVlc3RlZFxyXG4gICAgLy8gb3BlcmF0aW9uIHJlc3VsdCBoYXMgYmVlbiBwcm9jZXNzZWQuXHJcbiAgICBsZXQgdmFsdWUgPSB0aGlzLnN0YXJ0aW5nVmFsdWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMub3BlcmF0aW9ucy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3Qgb3BlcmF0aW9uID0gdGhpcy5vcGVyYXRpb25zWyBpIF07XHJcbiAgICAgIGlmICggb3BlcmF0aW9uLmlzQWN0aXZlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgdmFsdWUgPSBvcGVyYXRpb24uZ2V0UmVzdWx0KCB2YWx1ZSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBUZXN0IGlmIHdlJ3JlIGRvbmUuXHJcbiAgICAgIGlmICggb3BlcmF0aW9uID09PSB0YXJnZXRPcGVyYXRpb24gKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgc3RhcnQgdmFsdWUgb2YgdGhpcyBvcGVyYXRpb24gYnkgc3RhcnRpbmcgZnJvbSB0aGUgaW5pdGlhbCB2YWx1ZSBhbmQgZXhlY3V0aW5nIGFsbCBvcGVyYXRpb25zIHRoYXQgcHJlY2VkZVxyXG4gICAqIGl0LlxyXG4gICAqIEBwYXJhbSB0YXJnZXRPcGVyYXRpb25cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRPcGVyYXRpb25TdGFydFZhbHVlKCB0YXJnZXRPcGVyYXRpb24gKSB7XHJcbiAgICBsZXQgdmFsdWUgPSB0aGlzLnN0YXJ0aW5nVmFsdWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMub3BlcmF0aW9ucy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3Qgb3BlcmF0aW9uID0gdGhpcy5vcGVyYXRpb25zWyBpIF07XHJcbiAgICAgIGlmICggb3BlcmF0aW9uID09PSB0YXJnZXRPcGVyYXRpb24gKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIG9wZXJhdGlvbi5pc0FjdGl2ZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIHZhbHVlID0gb3BlcmF0aW9uLmdldFJlc3VsdCggdmFsdWUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBzdGFydCBhbmQgZW5kIHZhbHVlcyBvZiB0aGUgb3BlcmF0aW9uIGFyZSBlaXRoZXIgZW50aXJlbHkgYWJvdmUgb3IgYmVsb3cgdGhlIGRpc3BsYXkgcmFuZ2UuXHJcbiAgICogQHBhcmFtIHtOdW1iZXJMaW5lT3BlcmF0aW9ufSBvcGVyYXRpb25cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgaXNPcGVyYXRpb25Db21wbGV0ZWx5T3V0T2ZEaXNwbGF5ZWRSYW5nZSggb3BlcmF0aW9uICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5vcGVyYXRpb25zLmluY2x1ZGVzKCBvcGVyYXRpb24gKSwgJ3RoZSBvcGVyYXRpb24gaXMgbm90IG9uIHRoaXMgbnVtYmVyIGxpbmUnICk7XHJcbiAgICBjb25zdCBzdGFydFZhbHVlID0gdGhpcy5nZXRPcGVyYXRpb25TdGFydFZhbHVlKCBvcGVyYXRpb24gKTtcclxuICAgIGNvbnN0IGVuZFZhbHVlID0gdGhpcy5nZXRPcGVyYXRpb25SZXN1bHQoIG9wZXJhdGlvbiApO1xyXG4gICAgY29uc3QgZGlzcGxheWVkUmFuZ2UgPSB0aGlzLmRpc3BsYXllZFJhbmdlUHJvcGVydHkudmFsdWU7XHJcbiAgICByZXR1cm4gc3RhcnRWYWx1ZSA8IGRpc3BsYXllZFJhbmdlLm1pbiAmJiBlbmRWYWx1ZSA8IGRpc3BsYXllZFJhbmdlLm1pbiB8fFxyXG4gICAgICAgICAgIHN0YXJ0VmFsdWUgPiBkaXNwbGF5ZWRSYW5nZS5tYXggJiYgZW5kVmFsdWUgPiBkaXNwbGF5ZWRSYW5nZS5tYXg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBvcGVyYXRpb24gc3RhcnRzIG9yIGVuZHMgYXQgdGhlIG1pbiBvciBtYXggb2YgdGhlIGRpc3BsYXllZCByYW5nZSBhbmQgdGhlIG90aGVyIGVuZHBvaW50IGlzXHJcbiAgICogb3V0IG9mIHRoZSBkaXNwbGF5ZWQgcmFuZ2UuXHJcbiAgICogQHBhcmFtIHtOdW1iZXJMaW5lT3BlcmF0aW9ufSBvcGVyYXRpb25cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgaXNPcGVyYXRpb25BdEVkZ2VPZkRpc3BsYXllZFJhbmdlKCBvcGVyYXRpb24gKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm9wZXJhdGlvbnMuaW5jbHVkZXMoIG9wZXJhdGlvbiApLCAndGhlIG9wZXJhdGlvbiBpcyBub3Qgb24gdGhpcyBudW1iZXIgbGluZScgKTtcclxuICAgIGNvbnN0IHN0YXJ0VmFsdWUgPSB0aGlzLmdldE9wZXJhdGlvblN0YXJ0VmFsdWUoIG9wZXJhdGlvbiApO1xyXG4gICAgY29uc3QgZW5kVmFsdWUgPSB0aGlzLmdldE9wZXJhdGlvblJlc3VsdCggb3BlcmF0aW9uICk7XHJcbiAgICBjb25zdCBkaXNwbGF5ZWRSYW5nZSA9IHRoaXMuZGlzcGxheWVkUmFuZ2VQcm9wZXJ0eS52YWx1ZTtcclxuICAgIHJldHVybiAoIHN0YXJ0VmFsdWUgPT09IGRpc3BsYXllZFJhbmdlLm1pbiAmJiBlbmRWYWx1ZSA8PSBzdGFydFZhbHVlICkgfHxcclxuICAgICAgICAgICAoIHN0YXJ0VmFsdWUgPT09IGRpc3BsYXllZFJhbmdlLm1heCAmJiBlbmRWYWx1ZSA+PSBzdGFydFZhbHVlICkgfHxcclxuICAgICAgICAgICAoIGVuZFZhbHVlID09PSBkaXNwbGF5ZWRSYW5nZS5taW4gJiYgc3RhcnRWYWx1ZSA8PSBlbmRWYWx1ZSApIHx8XHJcbiAgICAgICAgICAgKCBlbmRWYWx1ZSA9PT0gZGlzcGxheWVkUmFuZ2UubWF4ICYmIHN0YXJ0VmFsdWUgPj0gZW5kVmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIG9wZXJhdGlvbiBpcyBwYXJ0aWFsbHkgaW4gYW5kIHBhcnRpYWxseSBvdXQgb2YgdGhlIGRpc3BsYXkgcmFuZ2UuICBOb3RlIHRoYXQgdGhpcyB3aWxsIHJldHVyblxyXG4gICAqIGZhbHNlIGlmIHRoZSBvcGVyYXRpb24gaXMgZW50aXJlbHkgaW5zaWRlIHRoZSBkaXNwbGF5IHJhbmdlLCBzbyB1c2UgY2FyZWZ1bGx5LlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyTGluZU9wZXJhdGlvbn0gb3BlcmF0aW9uXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGlzT3BlcmF0aW9uUGFydGlhbGx5SW5EaXNwbGF5ZWRSYW5nZSggb3BlcmF0aW9uICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5vcGVyYXRpb25zLmluY2x1ZGVzKCBvcGVyYXRpb24gKSwgJ3RoZSBvcGVyYXRpb24gaXMgbm90IG9uIHRoaXMgbnVtYmVyIGxpbmUnICk7XHJcbiAgICBjb25zdCBzdGFydFZhbHVlID0gdGhpcy5nZXRPcGVyYXRpb25TdGFydFZhbHVlKCBvcGVyYXRpb24gKTtcclxuICAgIGNvbnN0IGVuZFZhbHVlID0gdGhpcy5nZXRPcGVyYXRpb25SZXN1bHQoIG9wZXJhdGlvbiApO1xyXG4gICAgY29uc3QgZGlzcGxheWVkUmFuZ2UgPSB0aGlzLmRpc3BsYXllZFJhbmdlUHJvcGVydHkudmFsdWU7XHJcbiAgICByZXR1cm4gZGlzcGxheWVkUmFuZ2UuY29udGFpbnMoIHN0YXJ0VmFsdWUgKSAmJiAhZGlzcGxheWVkUmFuZ2UuY29udGFpbnMoIGVuZFZhbHVlICkgfHxcclxuICAgICAgICAgICAhZGlzcGxheWVkUmFuZ2UuY29udGFpbnMoIHN0YXJ0VmFsdWUgKSAmJiBkaXNwbGF5ZWRSYW5nZS5jb250YWlucyggZW5kVmFsdWUgKSB8fFxyXG4gICAgICAgICAgIHN0YXJ0VmFsdWUgPCBkaXNwbGF5ZWRSYW5nZS5taW4gJiYgZW5kVmFsdWUgPiBkaXNwbGF5ZWRSYW5nZS5tYXggfHxcclxuICAgICAgICAgICBzdGFydFZhbHVlID4gZGlzcGxheWVkUmFuZ2UubWluICYmIGVuZFZhbHVlIDwgZGlzcGxheWVkUmFuZ2UubWF4O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGFuIGFycmF5IG9mIHRoZSBvcGVyYXRpb25zIHRoYXQgYXJlIGN1cnJlbnRseSBhY3RpdmUgb24gdGhlIG51bWJlciBsaW5lLlxyXG4gICAqIEByZXR1cm5zIHtOdW1iZXJMaW5lT3BlcmF0aW9uW119XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldEFjdGl2ZU9wZXJhdGlvbnMoKSB7XHJcbiAgICBjb25zdCBsaXN0ID0gW107XHJcbiAgICB0aGlzLm9wZXJhdGlvbnMuZm9yRWFjaCggb3BlcmF0aW9uID0+IHtcclxuICAgICAgaWYgKCBvcGVyYXRpb24uaXNBY3RpdmVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICBsaXN0LnB1c2goIG9wZXJhdGlvbiApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gbGlzdDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyTGluZU9wZXJhdGlvbn0gb3BlcmF0aW9uXHJcbiAgICogQHJldHVybnMge051bWJlckxpbmVQb2ludH1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldE9wZXJhdGlvblN0YXJ0UG9pbnQoIG9wZXJhdGlvbiApIHtcclxuICAgIGNvbnN0IG9wZXJhdGlvbkluZGV4ID0gdGhpcy5vcGVyYXRpb25zLmluZGV4T2YoIG9wZXJhdGlvbiApO1xyXG4gICAgbGV0IHN0YXJ0aW5nUG9pbnQ7XHJcbiAgICBpZiAoIG9wZXJhdGlvbkluZGV4ID09PSAwICkge1xyXG4gICAgICBzdGFydGluZ1BvaW50ID0gdGhpcy5zdGFydGluZ1BvaW50O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHN0YXJ0aW5nUG9pbnQgPSB0aGlzLmVuZHBvaW50c1sgb3BlcmF0aW9uSW5kZXggLSAxIF07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RhcnRpbmdQb2ludDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCkge1xyXG4gICAgZm9yICggY29uc3QgWyBvcGVyYXRpb24sIGV4cGlyYXRpb25UaW1lIF0gb2YgdGhpcy5vcGVyYXRpb25FeHBpcmF0aW9uVGltZXMgKSB7XHJcblxyXG4gICAgICBjb25zdCBvcGVyYXRpb25TdGFydFBvaW50ID0gdGhpcy5nZXRPcGVyYXRpb25TdGFydFBvaW50KCBvcGVyYXRpb24gKTtcclxuICAgICAgY29uc3Qgb3BlcmF0aW9uU3RhcnRQb2ludENvbG9yID0gb3BlcmF0aW9uU3RhcnRQb2ludC5jb2xvclByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgICAgaWYgKCBleHBpcmF0aW9uVGltZSA8IHBoZXQuam9pc3QuZWxhcHNlZFRpbWUgKSB7XHJcblxyXG4gICAgICAgIC8vIFNldCB0aGUgc3RhcnRpbmcgdmFsdWUgdG8gYmUgd2hlcmUgdGhlIGVuZCBvZiB0aGlzIG9wZXJhdGlvbiB3YXMuXHJcbiAgICAgICAgdGhpcy5zdGFydGluZ1ZhbHVlUHJvcGVydHkuc2V0KCB0aGlzLmdldE9wZXJhdGlvblJlc3VsdCggb3BlcmF0aW9uICkgKTtcclxuXHJcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBzdGFydGluZyBwb2ludCBpcyBhdCBmdWxsIG9wYWNpdHkuXHJcbiAgICAgICAgY29uc3Qgbm9uRmFkZWRDb2xvciA9IG5ldyBDb2xvciggb3BlcmF0aW9uU3RhcnRQb2ludENvbG9yLnIsIG9wZXJhdGlvblN0YXJ0UG9pbnRDb2xvci5nLCBvcGVyYXRpb25TdGFydFBvaW50Q29sb3IuYiwgMSApO1xyXG4gICAgICAgIG9wZXJhdGlvblN0YXJ0UG9pbnQuY29sb3JQcm9wZXJ0eS5zZXQoIG5vbkZhZGVkQ29sb3IgKTtcclxuXHJcbiAgICAgICAgLy8gVGhpcyBvcGVyYXRpb24gaGFzIGV4cGlyZWQsIHNvIGRlYWN0aXZhdGUgaXQuXHJcbiAgICAgICAgb3BlcmF0aW9uLmlzQWN0aXZlUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBUaGlzIG9wZXJhdGlvbiBoYXNuJ3QgZXhwaXJlZCB5ZXQsIGJ1dCBpdCdzIG9uIHRoZSB3YXkuICBGYWRlIGl0J3Mgb3JpZ2luIHBvaW50IGFzIGl0IGdldHMgY2xvc2UuXHJcbiAgICAgICAgaWYgKCBleHBpcmF0aW9uVGltZSAtIHBoZXQuam9pc3QuZWxhcHNlZFRpbWUgPCBOTE9Db25zdGFudHMuT1BFUkFUSU9OX0ZBREVfT1VUX1RJTUUgKSB7XHJcbiAgICAgICAgICBjb25zdCBvcGFjaXR5ID0gTWF0aC5taW4oIDEsICggZXhwaXJhdGlvblRpbWUgLSBwaGV0LmpvaXN0LmVsYXBzZWRUaW1lICkgLyBOTE9Db25zdGFudHMuT1BFUkFUSU9OX0ZBREVfT1VUX1RJTUUgKTtcclxuICAgICAgICAgIGNvbnN0IHBvdGVudGlhbGx5RmFkZWRDb2xvciA9IG5ldyBDb2xvcihcclxuICAgICAgICAgICAgb3BlcmF0aW9uU3RhcnRQb2ludENvbG9yLnIsXHJcbiAgICAgICAgICAgIG9wZXJhdGlvblN0YXJ0UG9pbnRDb2xvci5nLFxyXG4gICAgICAgICAgICBvcGVyYXRpb25TdGFydFBvaW50Q29sb3IuYixcclxuICAgICAgICAgICAgb3BhY2l0eVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIG9wZXJhdGlvblN0YXJ0UG9pbnQuY29sb3JQcm9wZXJ0eS5zZXQoIHBvdGVudGlhbGx5RmFkZWRDb2xvciApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzdG9yZSBpbml0aWFsIHN0YXRlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuXHJcbiAgICB0aGlzLmRlYWN0aXZhdGVBbGxPcGVyYXRpb25zKCk7XHJcbiAgICB0aGlzLnN0YXJ0aW5nVmFsdWVQcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcblxyXG4gICAgLy8gUmVzZXQgdGhlIHByb3BlcnRpZXMgdGhhdCB3ZXJlIGRlZmluZWQgaW4gdGhpcyBzdWJjbGFzcy5cclxuICAgIHRoaXMuc2hvd09wZXJhdGlvbkxhYmVsc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNob3dPcGVyYXRpb25EZXNjcmlwdGlvbnNQcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIC8vIFJlc2V0dGluZyB0aGUgbnVtYmVyIGxpbmUgcmVtb3ZlcyBhbGwgcG9pbnRzLCBzbyB3ZSBuZWVkIHRvIGFkZCBiYWNrIHRoZSBzdGFydGluZyBwb2ludC5cclxuICAgIHRoaXMuc3RhcnRpbmdQb2ludC5jb2xvclByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmFkZFBvaW50KCB0aGlzLnN0YXJ0aW5nUG9pbnQgKTtcclxuICB9XHJcbn1cclxuXHJcbm51bWJlckxpbmVPcGVyYXRpb25zLnJlZ2lzdGVyKCAnT3BlcmF0aW9uVHJhY2tpbmdOdW1iZXJMaW5lJywgT3BlcmF0aW9uVHJhY2tpbmdOdW1iZXJMaW5lICk7XHJcbmV4cG9ydCBkZWZhdWx0IE9wZXJhdGlvblRyYWNraW5nTnVtYmVyTGluZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLGNBQWMs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