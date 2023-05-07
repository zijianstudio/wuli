// Copyright 2014-2020, University of Colorado Boulder

/**
 * Type that defines a residual and a square residual.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';

class Residual {
  /**
   * @param {DataPoint} dataPoint
   * @param {number} slope
   * @param {number} intercept
   */
  constructor( dataPoint, slope, intercept ) {

    // store the dataPoint to be able to identify residual node
    this.dataPoint = dataPoint;

    // find the vertical position of the line following y = slope* x + intercept;
    const yValue = slope * dataPoint.positionProperty.value.x + intercept;

    // The vertical displacement is positive if the datePoint is above the line and negative if below
    const verticalDisplacement = dataPoint.positionProperty.value.y - yValue;

    // @public read-only
    this.point1 = new Vector2( dataPoint.positionProperty.value.x, dataPoint.positionProperty.value.y );  // position of dataPoint
    this.point2 = new Vector2( dataPoint.positionProperty.value.x, yValue );   // position of the point on the line

    // the square residual should not overlap the line
    // @public read-only
    this.isSquaredResidualToTheLeft = ( slope * verticalDisplacement > 0 );
  }
}

leastSquaresRegression.register( 'Residual', Residual );

export default Residual;