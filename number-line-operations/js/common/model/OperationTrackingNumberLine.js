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
  constructor( zeroPosition, options ) {

    options = merge( {

      // {number} - the number of operations tracked
      numberOfOperationsTracked: 1,

      // {NumberProperty} - the value from which the operations will start, created if not supplied
      startingValueProperty: null,

      // {Color[]} - A list of colors that is used for the points that appear on the number line.  The list is ordered
      // such that the first color is the color of the initial point, the second is the color of the first operation if
      // present, and so on.
      pointColorList: [ NLOConstants.DARK_BLUE_POINT_COLOR, NLOConstants.MEDIUM_BLUE_POINT_COLOR ],

      // {boolean} - whether operation labels are initially visible, can be changed later via the Property
      operationLabelsInitiallyVisible: true,

      // {boolean} - whether descriptions are initially visible, can be changed later via the Property
      operationDescriptionsInitiallyVisible: true,

      // {boolean} - automatically deactivate an operation after it has been active for a while
      automaticallyDeactivateOperations: false,

      // {Object[]} - options used for each of the tracked operations, can either be an empty array if no options need
      // to be passed to the operations, or a set of options objects, one for each tracked operation
      operationOptionsArray: []
    }, options );

    assert && assert(
    options.numberOfOperationsTracked > 0 && options.numberOfOperationsTracked <= 2,
      `unsupported number of operations specified: ${options.numberOfOperationsTracked}`
    );
    assert && assert(
      options.pointColorList.length = options.numberOfOperationsTracked + 1,
      'number of potential points doesn\'t match length of point color list'
    );
    assert && assert(
      options.operationOptionsArray.length === 0 || options.operationOptionsArray.length === options.numberOfOperationsTracked,
      'must either provide no operation options or the same number as the tracked operations'
    );

    super( zeroPosition, options );

    // @public (read-write) - The starting value from which the active operations add and/or subtract, created if not
    // supplied.
    this.startingValueProperty = options.startingValueProperty;
    if ( !this.startingValueProperty ) {
      this.startingValueProperty = new NumberProperty( 0 );
    }

    // @public (read-write)
    this.showOperationLabelsProperty = new BooleanProperty( options.operationLabelsInitiallyVisible );

    // @public (read-write)
    this.showOperationDescriptionsProperty = new BooleanProperty( options.operationDescriptionsInitiallyVisible );

    // @public (read-only) {NumberLineOperation[] - An array of operations that this number line will track.  The order
    // matters in how changes are processed and how things are portrayed in the view, which is one of the main reasons
    // that they are created at construction rather than added and removed.  This is also better for phet-io.
    this.operations = [];
    _.times( options.numberOfOperationsTracked, index => {
      this.operations.push( new NumberLineOperation( options.operationOptionsArray[ index ] || {} ) );
    } );

    // @public (read-write) - the number line point that corresponds with the starting value, this is always present
    this.startingPoint = new NumberLinePoint( this, {
      valueProperty: this.startingValueProperty,
      initialColor: options.pointColorList[ 0 ]
    } );
    this.addPoint( this.startingPoint );

    // @public (read-only) {NumberLinePoint[]}- The endpoints for each operation.  There is one endpoint for each
    // operation and these are added to or removed from the number line as the corresponding operation goes active or
    // inactive.  The position in the array identifies the operation to which the endpoint corresponds.
    this.endpoints = [];
    _.times( options.numberOfOperationsTracked, index => {
      this.endpoints.push( new NumberLinePoint( this, {
        initialColor: options.pointColorList[ index + 1 ]
      } ) );
    } );

    // @public (read-only) {Map.<operation, number>} - A map that tracks when an operation expires, only used if
    // automatic deactivation is enabled.
    this.operationExpirationTimes = new Map();

    // function closure to update endpoint values as operations change
    const updateEndpoints = () => {

      // Cycle through the operations in order and update all endpoint values.
      this.operations.forEach( ( operation, index ) => {
        const endpoint = this.endpoints[ index ];
        if ( operation.isActiveProperty.value ) {

          // state checking
          assert && assert( endpoint, 'there is no endpoint for this operation, internal state is incorrect' );

          // The operation is active, so make sure its endpoint is on the number line.
          if ( !this.hasPoint( endpoint ) ) {
            this.addPoint( endpoint );
          }

          // Update the value of the endpoint to the result of this operation EXCEPT when the endpoint is being dragged,
          // since in that case it is probably the dragging that caused the change to the operation, so setting the
          // value here will cause reentry.
          if ( !endpoint.isDraggingProperty.value ) {
            endpoint.valueProperty.set( this.getOperationResult( operation ) );
          }
        }
        else {

          // For an inactive operation, set the endpoint's value at what is essentially the starting point, like it was
          // an operation with an amount of zero.
          endpoint.valueProperty.set( index === 0 ?
                                      this.startingValueProperty.value :
                                      this.endpoints[ index - 1 ].valueProperty.value );

          // Remove the associated endpoint if it's on the number line.
          if ( this.hasPoint( endpoint ) ) {
            this.removePoint( endpoint );
          }
        }
      } );
    };

    // function closure to update operations as endpoints are changed from being dragged
    const updateOperationWhenEndpointDragged = () => {

      this.endpoints.forEach( ( endpoint, index ) => {

        if ( endpoint.isDraggingProperty.value ) {

          // State checking - By design, it should not be possible to drag an endpoint unless the operation with which
          // it is associated is active.
          assert && assert( this.operations[ index ].isActiveProperty, 'associated operation is not active' );

          // The value of this endpoint was just changed by the user dragging it.  Update the amount of the
          // corresponding operation to match.
          const operation = this.operations[ index ];
          assert && assert(
            operation.isActiveProperty.value,
            'state error - it should not be possible to update an inactive operation via dragging'
          );
          const sign = operation.operationTypeProperty.value === Operation.SUBTRACTION ? -1 : 1;
          operation.amountProperty.set(
            sign * ( endpoint.valueProperty.value - this.getOperationStartValue( operation ) )
          );
        }
      } );
    };

    this.operations.forEach( operation => {

      // Set up listeners to update the endpoint values as the operations change.
      Multilink.multilink(
        [ operation.isActiveProperty, operation.amountProperty, operation.operationTypeProperty ],
        updateEndpoints
      );

      // Update expiration times as operations become active and inactive. No unlink is necessary.
      operation.isActiveProperty.link( isActive => {

        if ( isActive ) {
          if ( options.automaticallyDeactivateOperations ) {
            this.operationExpirationTimes.set( operation, phet.joist.elapsedTime + NLOConstants.OPERATION_AUTO_DEACTIVATE_TIME );
          }
          this.getOperationStartPoint( operation ).colorProperty.reset();
        }
        else {
          if ( this.operationExpirationTimes.has( operation ) ) {
            this.operationExpirationTimes.delete( operation );
          }
        }
      } );
    } );

    // Update the endpoints if the starting point moves.  These instances are assumed to be persistent and therefore no
    // unlink is necessary.
    this.startingValueProperty.link( updateEndpoints );

    // Update the operations when the endpoints are dragged.  These instances are assumed to be persistent and therefore
    // no unlink is necessary.
    this.endpoints.forEach( endpoint => {
      endpoint.valueProperty.link( updateOperationWhenEndpointDragged );
    } );
  }

  /**
   * Get the endpoint for the specified operation.
   * @param {NumberLineOperation} operation
   * @returns {NumberLinePoint}
   * @private
   */
  getOperationEndpoint( operation ) {
    assert && assert( this.operations.includes( operation ) );
    return this.endpoints[ this.operations.indexOf( operation ) ];
  }

  /**
   * Remove all operations, does nothing if there are none.
   * @public
   */
  deactivateAllOperations() {
    this.operations.forEach( operation => {
      operation.isActiveProperty.set( false );
    } );
  }

  /**
   * Go through the operations and calculate the current end value.
   * @returns {number}
   * @public
   */
  getCurrentEndValue() {
    let value = this.startingValueProperty.value;
    this.operations.forEach( operation => {
      if ( operation.isActiveProperty.value ) {
        value = operation.getResult( value );
      }
    } );
    return value;
  }

  /**
   * Get the value after this operation and all those that precede it on the operations list have been applied.
   * @param {NumberLineOperation} targetOperation
   * @returns {number}
   * @public
   */
  getOperationResult( targetOperation ) {

    assert && assert(
      targetOperation.operationTypeProperty.value === Operation.ADDITION ||
      targetOperation.operationTypeProperty.value === Operation.SUBTRACTION,
      'unrecognized operation type'
    );

    // Go through the list of operations modifying the end value based on the result of each until the requested
    // operation result has been processed.
    let value = this.startingValueProperty.value;
    for ( let i = 0; i < this.operations.length; i++ ) {
      const operation = this.operations[ i ];
      if ( operation.isActiveProperty.value ) {
        value = operation.getResult( value );
      }

      // Test if we're done.
      if ( operation === targetOperation ) {
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
  getOperationStartValue( targetOperation ) {
    let value = this.startingValueProperty.value;
    for ( let i = 0; i < this.operations.length; i++ ) {
      const operation = this.operations[ i ];
      if ( operation === targetOperation ) {
        break;
      }
      else if ( operation.isActiveProperty.value ) {
        value = operation.getResult( value );
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
  isOperationCompletelyOutOfDisplayedRange( operation ) {
    assert && assert( this.operations.includes( operation ), 'the operation is not on this number line' );
    const startValue = this.getOperationStartValue( operation );
    const endValue = this.getOperationResult( operation );
    const displayedRange = this.displayedRangeProperty.value;
    return startValue < displayedRange.min && endValue < displayedRange.min ||
           startValue > displayedRange.max && endValue > displayedRange.max;
  }

  /**
   * Returns true if this operation starts or ends at the min or max of the displayed range and the other endpoint is
   * out of the displayed range.
   * @param {NumberLineOperation} operation
   * @returns {boolean}
   * @public
   */
  isOperationAtEdgeOfDisplayedRange( operation ) {
    assert && assert( this.operations.includes( operation ), 'the operation is not on this number line' );
    const startValue = this.getOperationStartValue( operation );
    const endValue = this.getOperationResult( operation );
    const displayedRange = this.displayedRangeProperty.value;
    return ( startValue === displayedRange.min && endValue <= startValue ) ||
           ( startValue === displayedRange.max && endValue >= startValue ) ||
           ( endValue === displayedRange.min && startValue <= endValue ) ||
           ( endValue === displayedRange.max && startValue >= endValue );
  }

  /**
   * Returns true if this operation is partially in and partially out of the display range.  Note that this will return
   * false if the operation is entirely inside the display range, so use carefully.
   * @param {NumberLineOperation} operation
   * @returns {boolean}
   * @public
   */
  isOperationPartiallyInDisplayedRange( operation ) {
    assert && assert( this.operations.includes( operation ), 'the operation is not on this number line' );
    const startValue = this.getOperationStartValue( operation );
    const endValue = this.getOperationResult( operation );
    const displayedRange = this.displayedRangeProperty.value;
    return displayedRange.contains( startValue ) && !displayedRange.contains( endValue ) ||
           !displayedRange.contains( startValue ) && displayedRange.contains( endValue ) ||
           startValue < displayedRange.min && endValue > displayedRange.max ||
           startValue > displayedRange.min && endValue < displayedRange.max;
  }

  /**
   * Get an array of the operations that are currently active on the number line.
   * @returns {NumberLineOperation[]}
   * @public
   */
  getActiveOperations() {
    const list = [];
    this.operations.forEach( operation => {
      if ( operation.isActiveProperty.value ) {
        list.push( operation );
      }
    } );
    return list;
  }

  /**
   * @param {NumberLineOperation} operation
   * @returns {NumberLinePoint}
   * @private
   */
  getOperationStartPoint( operation ) {
    const operationIndex = this.operations.indexOf( operation );
    let startingPoint;
    if ( operationIndex === 0 ) {
      startingPoint = this.startingPoint;
    }
    else {
      startingPoint = this.endpoints[ operationIndex - 1 ];
    }
    return startingPoint;
  }

  /**
   * @public
   */
  step() {
    for ( const [ operation, expirationTime ] of this.operationExpirationTimes ) {

      const operationStartPoint = this.getOperationStartPoint( operation );
      const operationStartPointColor = operationStartPoint.colorProperty.value;

      if ( expirationTime < phet.joist.elapsedTime ) {

        // Set the starting value to be where the end of this operation was.
        this.startingValueProperty.set( this.getOperationResult( operation ) );

        // Make sure the starting point is at full opacity.
        const nonFadedColor = new Color( operationStartPointColor.r, operationStartPointColor.g, operationStartPointColor.b, 1 );
        operationStartPoint.colorProperty.set( nonFadedColor );

        // This operation has expired, so deactivate it.
        operation.isActiveProperty.set( false );
      }
      else {

        // This operation hasn't expired yet, but it's on the way.  Fade it's origin point as it gets close.
        if ( expirationTime - phet.joist.elapsedTime < NLOConstants.OPERATION_FADE_OUT_TIME ) {
          const opacity = Math.min( 1, ( expirationTime - phet.joist.elapsedTime ) / NLOConstants.OPERATION_FADE_OUT_TIME );
          const potentiallyFadedColor = new Color(
            operationStartPointColor.r,
            operationStartPointColor.g,
            operationStartPointColor.b,
            opacity
          );
          operationStartPoint.colorProperty.set( potentiallyFadedColor );
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
    this.addPoint( this.startingPoint );
  }
}

numberLineOperations.register( 'OperationTrackingNumberLine', OperationTrackingNumberLine );
export default OperationTrackingNumberLine;