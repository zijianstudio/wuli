// Copyright 2014-2022, University of Colorado Boulder

/**
 * Type that represents a movable dataPoint in the view.
 *
 * @author Martin Veillette (Berea College)
 */

import { Circle, SimpleDragHandler } from '../../../../scenery/js/imports.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';
import DataPointNode from './DataPointNode.js';

class DynamicDataPointNode extends DataPointNode {
  /**
   * @param {DataPoint} dataPoint
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( dataPoint, modelViewTransform ) {

    // Create the visual representation of the DynamicDataPoint
    const representation = new Circle( LeastSquaresRegressionConstants.DYNAMIC_DATA_POINT_RADIUS, {
      fill: LeastSquaresRegressionConstants.DYNAMIC_DATA_POINT_FILL,
      stroke: LeastSquaresRegressionConstants.DYNAMIC_DATA_POINT_STROKE,
      lineWidth: LeastSquaresRegressionConstants.DYNAMIC_DATA_POINT_LINE_WIDTH
    } );

    super( dataPoint, representation, modelViewTransform );

    // Expand the touch area
    this.touchArea = this.localBounds.dilatedXY( 15, 15 );

    // Add the listener that will allow the user to drag the dataPoint around.
    this.addInputListener( new SimpleDragHandler( {
      // Allow moving a finger (touch) across a node to pick it up.
      allowTouchSnag: true,

      // Handler that moves the dataPoint in model space.
      start: ( event, trail ) => {
        dataPoint.userControlledProperty.set( true );
      },

      translate: args => {
        dataPoint.positionProperty.value = modelViewTransform.viewToModelPosition( args.position );
      },

      end: () => {
        dataPoint.userControlledProperty.set( false );
      }
    } ) );
  }
}

leastSquaresRegression.register( 'DynamicDataPointNode', DynamicDataPointNode );

export default DynamicDataPointNode;