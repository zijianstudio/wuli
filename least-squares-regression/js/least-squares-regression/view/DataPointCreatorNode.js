// Copyright 2014-2022, University of Colorado Boulder

/**
 * A Scenery node that can be clicked upon to create new dataPoints in the model.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { Circle, Node, SimpleDragHandler } from '../../../../scenery/js/imports.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';
import DataPoint from '../model/DataPoint.js';

class DataPointCreatorNode extends Node {
  /**
   * @param {Function} addDataPointToModel - A function for adding the created dataPoint to the model
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( addDataPointToModel, modelViewTransform, options ) {
    super( { cursor: 'pointer' } );

    // Create the node that the user will click upon to add a model element to the view.
    const representation = new Circle( LeastSquaresRegressionConstants.DYNAMIC_DATA_POINT_RADIUS, {
      fill: LeastSquaresRegressionConstants.DYNAMIC_DATA_POINT_FILL,
      stroke: LeastSquaresRegressionConstants.DYNAMIC_DATA_POINT_STROKE,
      lineWidth: LeastSquaresRegressionConstants.DYNAMIC_DATA_POINT_LINE_WIDTH
    } );

    this.addChild( representation );

    // Set up the mouse and touch areas for this node so that this can still be grabbed when invisible.
    this.touchArea = this.localBounds.dilated( 15 );
    this.mouseArea = this.localBounds.dilated( 5 );

    let parentScreenView = null;
    let dataPoint;
    // Add the listener that will allow the user to click on this and create a new dataPoint, then position it in the model.
    this.addInputListener( new SimpleDragHandler( {

      // Allow moving a finger (touch) across this node to interact with it
      allowTouchSnag: true,

      start: ( event, trail ) => {

        // find the parent screen if not already found by moving up the scene graph
        if ( !parentScreenView ) {
          let testNode = this; // eslint-disable-line consistent-this
          while ( testNode !== null ) {
            if ( testNode instanceof ScreenView ) {
              parentScreenView = testNode;
              break;
            }
            testNode = testNode.parents[ 0 ]; // move up the scene graph by one level
          }
          assert && assert( parentScreenView, 'unable to find parent screen view' );
        }

        // Determine the initial position (set to be one circle radius above the pointer point)
        const initialPosition = parentScreenView.globalToLocalPoint( event.pointer.point.plus( new Vector2( 0, -LeastSquaresRegressionConstants.DYNAMIC_DATA_POINT_RADIUS ) ) );

        // Create and add the new model element.
        dataPoint = new DataPoint( modelViewTransform.viewToModelPosition( initialPosition ) );
        dataPoint.userControlledProperty.set( true );
        addDataPointToModel( dataPoint );

      },

      translate: translationParams => {
        dataPoint.positionProperty.value = dataPoint.positionProperty.value.plus( modelViewTransform.viewToModelDelta( translationParams.delta ) );
      },

      end: () => {
        dataPoint.userControlledProperty.set( false );
        dataPoint = null;
      }
    } ) );

    // Pass options through to parent.
    this.mutate( options );
  }
}

leastSquaresRegression.register( 'DataPointCreatorNode', DataPointCreatorNode );

export default DataPointCreatorNode;