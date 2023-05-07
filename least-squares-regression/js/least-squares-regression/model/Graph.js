// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model of a rectangular graph upon which various data points can be placed.
 * The graph Model is responsible for generating all statistical quantities related to a dataPoint set for 'best Fit Line' and 'My Line'
 * In addition, the associated Residuals (for 'My Line' and 'Best Fit Line') of the dataPoints are handled by graph model.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import Residual from './Residual.js';

class Graph {
  /**
   * @param {Range} xRange
   * @param {Range} yRange
   */
  constructor( xRange, yRange ) {

    // @public {Property.<number>} in radians, a proxy for the 'my line' slope.
    this.angleProperty = new NumberProperty( 0 );

    // @public {Property.<number>} in units of the graph bounds
    this.interceptProperty = new NumberProperty( 0 );

    // @public {Property.<boolean>} visibility of My Line on the graph and associated checkbox
    this.myLineVisibleProperty = new BooleanProperty( true );

    // @public {Property.<boolean>} visibility of Best Fit Line on the graph and associated checkbox
    this.bestFitLineVisibleProperty = new BooleanProperty( false );

    // @public {Property.<boolean>} visibility of Residuals of My Line (checkbox only)
    this.myLineShowResidualsProperty = new BooleanProperty( false );

    // @public {Property.<boolean>} visibility of Squared Residuals of My Line (checkbox only)
    this.myLineShowSquaredResidualsProperty = new BooleanProperty( false );

    // @public {Property.<boolean>} visibility of Residuals of Best Fit Line (checkbox only)
    this.bestFitLineShowResidualsProperty = new BooleanProperty( false );

    // @public {Property.<boolean>} visibility of Squared Residuals of Best Fit Line (checkbox only)
    this.bestFitLineShowSquaredResidualsProperty = new BooleanProperty( false );

    // @public {Property.<boolean>}  property that controls the visibility of the Residuals on the graph for My Line
    this.myLineResidualsVisibleProperty = new DerivedProperty( [ this.myLineVisibleProperty, this.myLineShowResidualsProperty ],
      ( myLineVisible, myLineShowResiduals ) => myLineVisible && myLineShowResiduals );

    // @public {Property.<boolean>} property that controls the visibility of the Square Residuals on the graph for My Line
    this.myLineSquaredResidualsVisibleProperty = new DerivedProperty( [ this.myLineVisibleProperty, this.myLineShowSquaredResidualsProperty ],
      ( myLineVisible, myLineShowSquaredResiduals ) => myLineVisible && myLineShowSquaredResiduals );

    // @public {Property.<boolean>} property that controls the visibility of the Square Residuals on the graph for Best Fit Line
    this.bestFitLineResidualsVisibleProperty = new DerivedProperty( [ this.bestFitLineVisibleProperty, this.bestFitLineShowResidualsProperty ],
      ( bestFitLineVisible, bestFitLineShowResiduals ) => bestFitLineVisible && bestFitLineShowResiduals );

    // @public {Property.<boolean>} property that controls the visibility of the Square Residuals on the graph for Best Fit Line
    this.bestFitLineSquaredResidualsVisibleProperty = new DerivedProperty( [ this.bestFitLineVisibleProperty, this.bestFitLineShowSquaredResidualsProperty ],
      ( bestFitLineVisible, bestFitLineShowSquaredResiduals ) => bestFitLineVisible && bestFitLineShowSquaredResiduals );

    // Bounds for the graph in model coordinates, it is a unit square. This remains the same for all DataSets
    // @public read-only
    this.bounds = new Bounds2( 0, 0, 1, 1 );

    // observable arrays of the line and squared residuals (wrapped in a property) for MyLine and BestFitLine
    this.myLineResiduals = createObservableArray(); // @public
    this.bestFitLineResiduals = createObservableArray(); // @public

    // array of the dataPoints that are overlapping the graph.
    this.dataPointsOnGraph = [];  // @public read-only

    // set the domain of the graphs (for future use by the equation Node and the graph Axes)
    this.setGraphDomain( xRange, yRange );
  }

  /**
   * Reset the visibility of the lines and residuals as well as the angle and intercept.
   * Empty out the two residual arrays and the dataPoints on Graph array
   * @public
   */
  reset() {
    this.angleProperty.reset();
    this.interceptProperty.reset();
    this.myLineVisibleProperty.reset();
    this.bestFitLineVisibleProperty.reset();
    this.myLineShowResidualsProperty.reset();
    this.myLineShowSquaredResidualsProperty.reset();
    this.bestFitLineShowResidualsProperty.reset();
    this.bestFitLineShowSquaredResidualsProperty.reset();
    this.dataPointsOnGraph = [];
    this.myLineResiduals.clear();
    this.bestFitLineResiduals.clear();
  }

  /**
   * Empty out the two residual arrays and the dataPoints on Graph array
   * @public
   */
  resetOnChangeOfDataSet() {
    this.dataPointsOnGraph = [];
    this.myLineResiduals.clear();
    this.bestFitLineResiduals.clear();
  }

  /**
   * Sets the horizontal and vertical graph domain of dataSets and the corresponding multiplicative factor for the slope and intercept
   * @public
   * @param {Range} xRange
   * @param {Range} yRange
   */
  setGraphDomain( xRange, yRange ) {
    this.xRange = xRange; // @public
    this.yRange = yRange; // @public
    this.slopeFactor = ( yRange.max - yRange.min ) / ( xRange.max - xRange.min ) / ( this.bounds.height / this.bounds.width );// @public
    this.interceptFactor = ( yRange.max - yRange.min ) / this.bounds.height; // @public
    this.interceptOffset = ( yRange.min ); // @public
  }

  /**
   * Update the model Residuals for 'My Line' and 'Best Fit Line'
   * @private
   */
  update() {
    this.updateMyLineResiduals();
    this.updateBestFitLineResiduals();
  }

  /**
   * Convert the angle of a line (measured from the horizontal x axis) to a slope
   * @public read-only
   * @param {number} angle
   */
  slope( angle ) {
    return Math.tan( angle ) * this.bounds.height / this.bounds.width;
  }

  /**
   * Add a 'My Line' model Residual to a dataPoint
   * @private
   * @param {DataPoint} dataPoint
   */
  addMyLineResidual( dataPoint ) {
    const myLineResidual = new Residual( dataPoint, this.slope( this.angleProperty.value ), this.interceptProperty.value );
    this.myLineResiduals.push( new Property( myLineResidual ) );
  }

  /**
   * Add a 'Best Fit Line' model Residual to a dataPoint
   * @private
   * @param {DataPoint} dataPoint
   */
  addBestFitLineResidual( dataPoint ) {

    const linearFitParameters = this.getLinearFit();
    const bestFitLineResidual = new Residual( dataPoint, linearFitParameters.slope, linearFitParameters.intercept );
    this.bestFitLineResiduals.push( new Property( bestFitLineResidual ) );
  }

  /**
   * Remove the 'My Line' model Residual attached to a dataPoint
   * @private
   * @param {DataPoint} dataPoint
   */
  removeMyLineResidual( dataPoint ) {
    const myLineResidualsCopy = this.myLineResiduals.slice();
    myLineResidualsCopy.forEach( myLineResidualProperty => {
      if ( myLineResidualProperty.value.dataPoint === dataPoint ) {
        this.myLineResiduals.remove( myLineResidualProperty );
      }
    } );
  }

  /**
   * Remove a 'Best Fit Line' model Residual attached to a dataPoint
   * @private
   * @param {DataPoint} dataPoint
   */
  removeBestFitLineResidual( dataPoint ) {
    const bestFitLineResidualsCopy = this.bestFitLineResiduals.slice();
    bestFitLineResidualsCopy.forEach( bestFitLineResidualProperty => {
      if ( bestFitLineResidualProperty.value.dataPoint === dataPoint ) {
        this.bestFitLineResiduals.remove( bestFitLineResidualProperty );
      }
    } );
  }

  /**
   * Update all 'My Line' model Residuals
   * (Necessary to update when the slope and the intercept of 'My Line' are modified)
   * @public
   */
  updateMyLineResiduals() {
    this.myLineResiduals.forEach( residualProperty => {
      const dataPoint = residualProperty.value.dataPoint;
      residualProperty.value = new Residual( dataPoint, this.slope( this.angleProperty.value ), this.interceptProperty.value );
    } );
  }

  /**
   * Update all 'My Best Fit Line' model Residuals
   * @private
   */
  updateBestFitLineResiduals() {
    if ( this.isLinearFitDefined() ) {
      const linearFitParameters = this.getLinearFit();
      this.bestFitLineResiduals.forEach( residualProperty => {
        const dataPoint = residualProperty.value.dataPoint;
        residualProperty.value = new Residual( dataPoint, linearFitParameters.slope, linearFitParameters.intercept );
      } );
    }
  }

  /**
   * Add Data Points on Graph in bulk such that no update is triggered throughout the process.
   * This is done for performance reason.
   * @public (accessed by LeastSquareRegressionModel)
   * @param {Array.<DataPoint>} dataPoints
   */
  addDataPointsOnGraphAndResidualsInBulk( dataPoints ) {
    // for performance reason one should add all the dataPoints on the graph
    // then we can calculate the best Fit Line (only once)
    // and then add all the Residuals.
    dataPoints.forEach( dataPoint => {
      this.dataPointsOnGraph.push( dataPoint );
    } );

    const mySlope = this.slope( this.angleProperty.value );
    const myIntercept = this.interceptProperty.value;

    // add a 'myLineResidual' for every single dataPoint
    dataPoints.forEach( dataPoint => {
      const myLineResidual = new Residual( dataPoint, mySlope, myIntercept );
      this.myLineResiduals.push( new Property( myLineResidual ) );
    } );

    // add a 'best fit Line' residual  for every single dataPoint
    // unless there is not  linearFit (because there is less than 2 data points on the board for instance)
    if ( this.isLinearFitDefined() ) {
      const linearFitParameters = this.getLinearFit();
      dataPoints.forEach( dataPoint => {
        const bestFitLineResidual = new Residual( dataPoint, linearFitParameters.slope, linearFitParameters.intercept );
        this.bestFitLineResiduals.push( new Property( bestFitLineResidual ) );
      } );
    }
  }

  /**
   * Function that returns true if the dataPoint is on the array.
   * @private
   * @param {DataPoint} dataPoint
   * @returns {boolean}
   */
  isDataPointOnList( dataPoint ) {
    const index = this.dataPointsOnGraph.indexOf( dataPoint );
    return ( index !== -1 );
  }

  /**
   * Function that determines if the Position of a Data Point is within the visual bounds of the graph
   * @private
   * @param {Vector2} position
   * @returns {boolean}
   */
  isDataPointPositionOverlappingGraph( position ) {
    return this.bounds.containsPoint( position );
  }

  /**
   * Add the dataPoint top the dataPointsOnGraph Array and add 'My Line' and 'Best Fit Line' model Residuals
   * @public (accessed by LeastSquareRegressionModel)
   * @param {DataPoint} dataPoint
   */
  addPointAndResiduals( dataPoint ) {
    this.dataPointsOnGraph.push( dataPoint );
    this.addMyLineResidual( dataPoint );

    // a BestFit line exists if there are two dataPoints or more.
    // if there are two dataPoints on the graph, we don't add my bestFitLine residual
    // since the residual are zero by definition
    // if there are exactly three data points on the graph we need to add three residuals
    if ( this.dataPointsOnGraph.length === 3 ) {
      this.dataPointsOnGraph.forEach( dataPoint => {
        this.addBestFitLineResidual( dataPoint );
      } );
    }
    // for three dataPoints or more there is one residual for every dataPoint added
    if ( this.dataPointsOnGraph.length > 3 ) {
      this.addBestFitLineResidual( dataPoint );
    }

    dataPoint.positionUpdateListener = () => {
      this.update();
    };
    dataPoint.positionProperty.link( dataPoint.positionUpdateListener );
  }

  /**
   * Remove a dataPoint and its associated residuals ('My Line' and 'Best Fit Line')
   * @public (accessed by LeastSquareRegressionModel)
   * @param {DataPoint} dataPoint
   */
  removePointAndResiduals( dataPoint ) {
    assert && assert( this.isDataPointOnList( dataPoint ), ' need the point to be on the list to remove it' );
    const index = this.dataPointsOnGraph.indexOf( dataPoint );
    this.dataPointsOnGraph.splice( index, 1 );

    this.removeMyLineResidual( dataPoint );

    // if there are two dataPoints on the graph, remove all residuals
    if ( this.dataPointsOnGraph.length === 2 ) {
      this.removeBestFitLineResiduals();
    }
    else {
      this.removeBestFitLineResidual( dataPoint );
    }
    this.update();
    if ( dataPoint.positionProperty.hasListener( dataPoint.positionUpdateListener ) ) {
      dataPoint.positionProperty.unlink( dataPoint.positionUpdateListener );
    }
  }

  /**
   * Function that removes all the best Fit Line Residuals
   * @private
   */
  removeBestFitLineResiduals() {
    this.bestFitLineResiduals.clear();
  }

  /**
   * Function that returns the sum of squared residuals of all the dataPoints on the list (compared with a line with a slope and intercept)
   * @private
   * @param {number} slope
   * @param {number} intercept
   * @returns {number} sumOfSquareResiduals
   */
  sumOfSquaredResiduals( slope, intercept ) {
    let sumOfSquareResiduals = 0;
    this.dataPointsOnGraph.forEach( dataPoint => {
      const yResidual = ( slope * dataPoint.positionProperty.value.x + intercept ) - dataPoint.positionProperty.value.y;
      sumOfSquareResiduals += yResidual * yResidual;
    } );
    return sumOfSquareResiduals;
  }

  /**
   * Function that returns the sum of squared residuals of 'My Line'
   * The sum of squared residual is zero if there are less than one dataPoint on the graph.
   * @public read-only
   * @returns {number} sumOfSquareResiduals
   */
  getMyLineSumOfSquaredResiduals() {
    if ( this.dataPointsOnGraph.length >= 1 ) {
      return this.sumOfSquaredResiduals( this.slope( this.angleProperty.value ), this.interceptProperty.value );
    }
    else {
      return 0;
    }
  }

  /**
   * Function that returns the sum of squared residuals of 'Best Fit Line'
   * The sum of squared residual is zero if there are less than two dataPoints on the graph
   * @public read-only
   * @returns {number} sumOfSquareResiduals
   */
  getBestFitLineSumOfSquaredResiduals() {
    if ( this.isLinearFitDefined() ) {
      const linearFitParameters = this.getLinearFit();
      return this.sumOfSquaredResiduals( linearFitParameters.slope, linearFitParameters.intercept );
    }
    else {
      return 0;
    }
  }

  /**
   * Returns an array of two points that crosses the left and the right hand side of the graph bounds
   * @public read-only
   * @param {number} slope
   * @param {number} intercept
   * @returns {{point1: Vector2, point2: Vector2}}
   */
  getBoundaryPoints( slope, intercept ) {

    const yValueLeft = slope * this.bounds.minX + intercept;
    const yValueRight = slope * this.bounds.maxX + intercept;
    const boundaryPoints = {
      point1: new Vector2( this.bounds.minX, yValueLeft ),
      point2: new Vector2( this.bounds.maxX, yValueRight )
    };

    return boundaryPoints;
  }

  /**
   * Function that updates statistical properties of the dataPoints on the graph.
   * @private
   */
  getStatistics() {

    const dataPointArray = this.dataPointsOnGraph;
    assert && assert( dataPointArray !== null, 'dataPointsOnGraph must contain data' );
    const arrayLength = dataPointArray.length;

    const squaresXX = _.map( dataPointArray, dataPoint => dataPoint.positionProperty.value.x * dataPoint.positionProperty.value.x );
    const squaresXY = _.map( dataPointArray, dataPoint => dataPoint.positionProperty.value.x * dataPoint.positionProperty.value.y );
    const squaresYY = _.map( dataPointArray, dataPoint => dataPoint.positionProperty.value.y * dataPoint.positionProperty.value.y );
    const positionArrayX = _.map( dataPointArray, dataPoint => dataPoint.positionProperty.value.x );
    const positionArrayY = _.map( dataPointArray, dataPoint => dataPoint.positionProperty.value.y );

    function add( memo, num ) {
      return memo + num;
    }

    const sumOfSquaresXX = _.reduce( squaresXX, add, 0 );
    const sumOfSquaresXY = _.reduce( squaresXY, add, 0 );
    const sumOfSquaresYY = _.reduce( squaresYY, add, 0 );
    const sumOfX = _.reduce( positionArrayX, add, 0 );
    const sumOfY = _.reduce( positionArrayY, add, 0 );

    this.averageOfSumOfSquaresXX = sumOfSquaresXX / arrayLength;
    this.averageOfSumOfSquaresXY = sumOfSquaresXY / arrayLength;
    this.averageOfSumOfSquaresYY = sumOfSquaresYY / arrayLength;
    this.averageOfSumOfX = sumOfX / arrayLength;
    this.averageOfSumOfY = sumOfY / arrayLength;
  }

  /**
   * Function that determines if a best fit line fit exists
   * @public read-only
   * @returns {boolean}
   */
  isLinearFitDefined() {
    let isDefined;
    // you can't have a linear fit with less than 2 data points
    if ( this.dataPointsOnGraph.length < 2 ) {
      isDefined = false;
    }
    else {
      this.getStatistics();
      const xVariance = this.averageOfSumOfSquaresXX - this.averageOfSumOfX * this.averageOfSumOfX;
      // the linear fit parameters are not defined when the points are aligned vertically (infinite slope).
      // check for a threshold to prevent https://github.com/phetsims/least-squares-regression/issues/60
      if ( xVariance < 2e-10 ) {
        isDefined = false;
      }
      else {
        isDefined = true;
      }
    }
    return isDefined;
  }

  /**
   * Function that returns the 'best fit line' parameters, i.e. slope and intercept of the dataPoints on the graph.
   * It would be wise to check if isLinearFitDefined() is true before calling this function.
   * @public read-only
   * @returns {{slope: number, intercept: number}}
   */
  getLinearFit() {
    this.getStatistics();
    const slopeNumerator = this.averageOfSumOfSquaresXY - this.averageOfSumOfX * this.averageOfSumOfY;
    const slopeDenominator = this.averageOfSumOfSquaresXX - this.averageOfSumOfX * this.averageOfSumOfX;
    const slope = slopeNumerator / slopeDenominator;
    const intercept = this.averageOfSumOfY - slope * this.averageOfSumOfX;

    const fitParameters = {
      slope: slope,
      intercept: intercept
    };
    return fitParameters;
  }

  /**
   * Function that returns the Pearson Coefficient Correlation
   * It returns null if there are less than two dataPoints on the graph.
   * For two dataPoints and more, the Pearson coefficient ranges from -1 to 1.
   * Note that the Pearson Coefficient Correlation is an intrinsic property of a set of DataPoint
   * See http://en.wikipedia.org/wiki/Pearson_product-moment_correlation_coefficient
   * @public read-only
   * @returns {null||number}
   */
  getPearsonCoefficientCorrelation() {

    if ( !this.isLinearFitDefined() ) {
      return null;
    }
    else {
      this.getStatistics();
      let pearsonCoefficientCorrelationNumerator = this.averageOfSumOfSquaresXY - this.averageOfSumOfX * this.averageOfSumOfY;

      if ( Math.abs( pearsonCoefficientCorrelationNumerator ) < 1E-10 ) {
        pearsonCoefficientCorrelationNumerator = 0;
      }

      // for very small values, we can end up with a very small or negative number.  In this case, return null so we
      // don't get a NaN for the coefficient.
      const number = ( this.averageOfSumOfSquaresXX - this.averageOfSumOfX * this.averageOfSumOfX ) * ( this.averageOfSumOfSquaresYY - this.averageOfSumOfY * this.averageOfSumOfY );
      if ( number < 1E-15 ) {
        return null;
      }
      const pearsonCoefficientCorrelationDenominator = Math.sqrt( number );

      // make sure the denominator is not equal to zero, this happens if all the points are aligned vertically
      if ( pearsonCoefficientCorrelationDenominator === 0 ) {
        return null; //
      }
      else {
        const pearsonCoefficientCorrelation = pearsonCoefficientCorrelationNumerator / pearsonCoefficientCorrelationDenominator;
        return pearsonCoefficientCorrelation;
      }
    }
  }
}

leastSquaresRegression.register( 'Graph', Graph );

export default Graph;
