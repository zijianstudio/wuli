// Copyright 2014-2021, University of Colorado Boulder

/**
 * Type that represents a static dataPoint in the view.
 *
 * @author Martin Veillette (Berea College)
 */

import { Circle } from '../../../../scenery/js/imports.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';
import DataPointNode from './DataPointNode.js';

class StaticDataPointNode extends DataPointNode {
  /**
   * @param {DataPoint} dataPoint
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( dataPoint, modelViewTransform ) {

    // Create and add  visual representation of the dataPoint
    const representation = new Circle( LeastSquaresRegressionConstants.STATIC_DATA_POINT_RADIUS, {
      fill: LeastSquaresRegressionConstants.STATIC_DATA_POINT_FILL,
      stroke: LeastSquaresRegressionConstants.STATIC_DATA_POINT_STROKE,
      lineWidth: LeastSquaresRegressionConstants.STATIC_DATA_POINT_LINE_WIDTH
    } );

    super( dataPoint, representation, modelViewTransform );
  }
}

leastSquaresRegression.register( 'StaticDataPointNode', StaticDataPointNode );

export default StaticDataPointNode;