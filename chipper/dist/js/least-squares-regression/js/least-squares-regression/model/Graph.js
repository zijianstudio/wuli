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
  constructor(xRange, yRange) {
    // @public {Property.<number>} in radians, a proxy for the 'my line' slope.
    this.angleProperty = new NumberProperty(0);

    // @public {Property.<number>} in units of the graph bounds
    this.interceptProperty = new NumberProperty(0);

    // @public {Property.<boolean>} visibility of My Line on the graph and associated checkbox
    this.myLineVisibleProperty = new BooleanProperty(true);

    // @public {Property.<boolean>} visibility of Best Fit Line on the graph and associated checkbox
    this.bestFitLineVisibleProperty = new BooleanProperty(false);

    // @public {Property.<boolean>} visibility of Residuals of My Line (checkbox only)
    this.myLineShowResidualsProperty = new BooleanProperty(false);

    // @public {Property.<boolean>} visibility of Squared Residuals of My Line (checkbox only)
    this.myLineShowSquaredResidualsProperty = new BooleanProperty(false);

    // @public {Property.<boolean>} visibility of Residuals of Best Fit Line (checkbox only)
    this.bestFitLineShowResidualsProperty = new BooleanProperty(false);

    // @public {Property.<boolean>} visibility of Squared Residuals of Best Fit Line (checkbox only)
    this.bestFitLineShowSquaredResidualsProperty = new BooleanProperty(false);

    // @public {Property.<boolean>}  property that controls the visibility of the Residuals on the graph for My Line
    this.myLineResidualsVisibleProperty = new DerivedProperty([this.myLineVisibleProperty, this.myLineShowResidualsProperty], (myLineVisible, myLineShowResiduals) => myLineVisible && myLineShowResiduals);

    // @public {Property.<boolean>} property that controls the visibility of the Square Residuals on the graph for My Line
    this.myLineSquaredResidualsVisibleProperty = new DerivedProperty([this.myLineVisibleProperty, this.myLineShowSquaredResidualsProperty], (myLineVisible, myLineShowSquaredResiduals) => myLineVisible && myLineShowSquaredResiduals);

    // @public {Property.<boolean>} property that controls the visibility of the Square Residuals on the graph for Best Fit Line
    this.bestFitLineResidualsVisibleProperty = new DerivedProperty([this.bestFitLineVisibleProperty, this.bestFitLineShowResidualsProperty], (bestFitLineVisible, bestFitLineShowResiduals) => bestFitLineVisible && bestFitLineShowResiduals);

    // @public {Property.<boolean>} property that controls the visibility of the Square Residuals on the graph for Best Fit Line
    this.bestFitLineSquaredResidualsVisibleProperty = new DerivedProperty([this.bestFitLineVisibleProperty, this.bestFitLineShowSquaredResidualsProperty], (bestFitLineVisible, bestFitLineShowSquaredResiduals) => bestFitLineVisible && bestFitLineShowSquaredResiduals);

    // Bounds for the graph in model coordinates, it is a unit square. This remains the same for all DataSets
    // @public read-only
    this.bounds = new Bounds2(0, 0, 1, 1);

    // observable arrays of the line and squared residuals (wrapped in a property) for MyLine and BestFitLine
    this.myLineResiduals = createObservableArray(); // @public
    this.bestFitLineResiduals = createObservableArray(); // @public

    // array of the dataPoints that are overlapping the graph.
    this.dataPointsOnGraph = []; // @public read-only

    // set the domain of the graphs (for future use by the equation Node and the graph Axes)
    this.setGraphDomain(xRange, yRange);
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
  setGraphDomain(xRange, yRange) {
    this.xRange = xRange; // @public
    this.yRange = yRange; // @public
    this.slopeFactor = (yRange.max - yRange.min) / (xRange.max - xRange.min) / (this.bounds.height / this.bounds.width); // @public
    this.interceptFactor = (yRange.max - yRange.min) / this.bounds.height; // @public
    this.interceptOffset = yRange.min; // @public
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
  slope(angle) {
    return Math.tan(angle) * this.bounds.height / this.bounds.width;
  }

  /**
   * Add a 'My Line' model Residual to a dataPoint
   * @private
   * @param {DataPoint} dataPoint
   */
  addMyLineResidual(dataPoint) {
    const myLineResidual = new Residual(dataPoint, this.slope(this.angleProperty.value), this.interceptProperty.value);
    this.myLineResiduals.push(new Property(myLineResidual));
  }

  /**
   * Add a 'Best Fit Line' model Residual to a dataPoint
   * @private
   * @param {DataPoint} dataPoint
   */
  addBestFitLineResidual(dataPoint) {
    const linearFitParameters = this.getLinearFit();
    const bestFitLineResidual = new Residual(dataPoint, linearFitParameters.slope, linearFitParameters.intercept);
    this.bestFitLineResiduals.push(new Property(bestFitLineResidual));
  }

  /**
   * Remove the 'My Line' model Residual attached to a dataPoint
   * @private
   * @param {DataPoint} dataPoint
   */
  removeMyLineResidual(dataPoint) {
    const myLineResidualsCopy = this.myLineResiduals.slice();
    myLineResidualsCopy.forEach(myLineResidualProperty => {
      if (myLineResidualProperty.value.dataPoint === dataPoint) {
        this.myLineResiduals.remove(myLineResidualProperty);
      }
    });
  }

  /**
   * Remove a 'Best Fit Line' model Residual attached to a dataPoint
   * @private
   * @param {DataPoint} dataPoint
   */
  removeBestFitLineResidual(dataPoint) {
    const bestFitLineResidualsCopy = this.bestFitLineResiduals.slice();
    bestFitLineResidualsCopy.forEach(bestFitLineResidualProperty => {
      if (bestFitLineResidualProperty.value.dataPoint === dataPoint) {
        this.bestFitLineResiduals.remove(bestFitLineResidualProperty);
      }
    });
  }

  /**
   * Update all 'My Line' model Residuals
   * (Necessary to update when the slope and the intercept of 'My Line' are modified)
   * @public
   */
  updateMyLineResiduals() {
    this.myLineResiduals.forEach(residualProperty => {
      const dataPoint = residualProperty.value.dataPoint;
      residualProperty.value = new Residual(dataPoint, this.slope(this.angleProperty.value), this.interceptProperty.value);
    });
  }

  /**
   * Update all 'My Best Fit Line' model Residuals
   * @private
   */
  updateBestFitLineResiduals() {
    if (this.isLinearFitDefined()) {
      const linearFitParameters = this.getLinearFit();
      this.bestFitLineResiduals.forEach(residualProperty => {
        const dataPoint = residualProperty.value.dataPoint;
        residualProperty.value = new Residual(dataPoint, linearFitParameters.slope, linearFitParameters.intercept);
      });
    }
  }

  /**
   * Add Data Points on Graph in bulk such that no update is triggered throughout the process.
   * This is done for performance reason.
   * @public (accessed by LeastSquareRegressionModel)
   * @param {Array.<DataPoint>} dataPoints
   */
  addDataPointsOnGraphAndResidualsInBulk(dataPoints) {
    // for performance reason one should add all the dataPoints on the graph
    // then we can calculate the best Fit Line (only once)
    // and then add all the Residuals.
    dataPoints.forEach(dataPoint => {
      this.dataPointsOnGraph.push(dataPoint);
    });
    const mySlope = this.slope(this.angleProperty.value);
    const myIntercept = this.interceptProperty.value;

    // add a 'myLineResidual' for every single dataPoint
    dataPoints.forEach(dataPoint => {
      const myLineResidual = new Residual(dataPoint, mySlope, myIntercept);
      this.myLineResiduals.push(new Property(myLineResidual));
    });

    // add a 'best fit Line' residual  for every single dataPoint
    // unless there is not  linearFit (because there is less than 2 data points on the board for instance)
    if (this.isLinearFitDefined()) {
      const linearFitParameters = this.getLinearFit();
      dataPoints.forEach(dataPoint => {
        const bestFitLineResidual = new Residual(dataPoint, linearFitParameters.slope, linearFitParameters.intercept);
        this.bestFitLineResiduals.push(new Property(bestFitLineResidual));
      });
    }
  }

  /**
   * Function that returns true if the dataPoint is on the array.
   * @private
   * @param {DataPoint} dataPoint
   * @returns {boolean}
   */
  isDataPointOnList(dataPoint) {
    const index = this.dataPointsOnGraph.indexOf(dataPoint);
    return index !== -1;
  }

  /**
   * Function that determines if the Position of a Data Point is within the visual bounds of the graph
   * @private
   * @param {Vector2} position
   * @returns {boolean}
   */
  isDataPointPositionOverlappingGraph(position) {
    return this.bounds.containsPoint(position);
  }

  /**
   * Add the dataPoint top the dataPointsOnGraph Array and add 'My Line' and 'Best Fit Line' model Residuals
   * @public (accessed by LeastSquareRegressionModel)
   * @param {DataPoint} dataPoint
   */
  addPointAndResiduals(dataPoint) {
    this.dataPointsOnGraph.push(dataPoint);
    this.addMyLineResidual(dataPoint);

    // a BestFit line exists if there are two dataPoints or more.
    // if there are two dataPoints on the graph, we don't add my bestFitLine residual
    // since the residual are zero by definition
    // if there are exactly three data points on the graph we need to add three residuals
    if (this.dataPointsOnGraph.length === 3) {
      this.dataPointsOnGraph.forEach(dataPoint => {
        this.addBestFitLineResidual(dataPoint);
      });
    }
    // for three dataPoints or more there is one residual for every dataPoint added
    if (this.dataPointsOnGraph.length > 3) {
      this.addBestFitLineResidual(dataPoint);
    }
    dataPoint.positionUpdateListener = () => {
      this.update();
    };
    dataPoint.positionProperty.link(dataPoint.positionUpdateListener);
  }

  /**
   * Remove a dataPoint and its associated residuals ('My Line' and 'Best Fit Line')
   * @public (accessed by LeastSquareRegressionModel)
   * @param {DataPoint} dataPoint
   */
  removePointAndResiduals(dataPoint) {
    assert && assert(this.isDataPointOnList(dataPoint), ' need the point to be on the list to remove it');
    const index = this.dataPointsOnGraph.indexOf(dataPoint);
    this.dataPointsOnGraph.splice(index, 1);
    this.removeMyLineResidual(dataPoint);

    // if there are two dataPoints on the graph, remove all residuals
    if (this.dataPointsOnGraph.length === 2) {
      this.removeBestFitLineResiduals();
    } else {
      this.removeBestFitLineResidual(dataPoint);
    }
    this.update();
    if (dataPoint.positionProperty.hasListener(dataPoint.positionUpdateListener)) {
      dataPoint.positionProperty.unlink(dataPoint.positionUpdateListener);
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
  sumOfSquaredResiduals(slope, intercept) {
    let sumOfSquareResiduals = 0;
    this.dataPointsOnGraph.forEach(dataPoint => {
      const yResidual = slope * dataPoint.positionProperty.value.x + intercept - dataPoint.positionProperty.value.y;
      sumOfSquareResiduals += yResidual * yResidual;
    });
    return sumOfSquareResiduals;
  }

  /**
   * Function that returns the sum of squared residuals of 'My Line'
   * The sum of squared residual is zero if there are less than one dataPoint on the graph.
   * @public read-only
   * @returns {number} sumOfSquareResiduals
   */
  getMyLineSumOfSquaredResiduals() {
    if (this.dataPointsOnGraph.length >= 1) {
      return this.sumOfSquaredResiduals(this.slope(this.angleProperty.value), this.interceptProperty.value);
    } else {
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
    if (this.isLinearFitDefined()) {
      const linearFitParameters = this.getLinearFit();
      return this.sumOfSquaredResiduals(linearFitParameters.slope, linearFitParameters.intercept);
    } else {
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
  getBoundaryPoints(slope, intercept) {
    const yValueLeft = slope * this.bounds.minX + intercept;
    const yValueRight = slope * this.bounds.maxX + intercept;
    const boundaryPoints = {
      point1: new Vector2(this.bounds.minX, yValueLeft),
      point2: new Vector2(this.bounds.maxX, yValueRight)
    };
    return boundaryPoints;
  }

  /**
   * Function that updates statistical properties of the dataPoints on the graph.
   * @private
   */
  getStatistics() {
    const dataPointArray = this.dataPointsOnGraph;
    assert && assert(dataPointArray !== null, 'dataPointsOnGraph must contain data');
    const arrayLength = dataPointArray.length;
    const squaresXX = _.map(dataPointArray, dataPoint => dataPoint.positionProperty.value.x * dataPoint.positionProperty.value.x);
    const squaresXY = _.map(dataPointArray, dataPoint => dataPoint.positionProperty.value.x * dataPoint.positionProperty.value.y);
    const squaresYY = _.map(dataPointArray, dataPoint => dataPoint.positionProperty.value.y * dataPoint.positionProperty.value.y);
    const positionArrayX = _.map(dataPointArray, dataPoint => dataPoint.positionProperty.value.x);
    const positionArrayY = _.map(dataPointArray, dataPoint => dataPoint.positionProperty.value.y);
    function add(memo, num) {
      return memo + num;
    }
    const sumOfSquaresXX = _.reduce(squaresXX, add, 0);
    const sumOfSquaresXY = _.reduce(squaresXY, add, 0);
    const sumOfSquaresYY = _.reduce(squaresYY, add, 0);
    const sumOfX = _.reduce(positionArrayX, add, 0);
    const sumOfY = _.reduce(positionArrayY, add, 0);
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
    if (this.dataPointsOnGraph.length < 2) {
      isDefined = false;
    } else {
      this.getStatistics();
      const xVariance = this.averageOfSumOfSquaresXX - this.averageOfSumOfX * this.averageOfSumOfX;
      // the linear fit parameters are not defined when the points are aligned vertically (infinite slope).
      // check for a threshold to prevent https://github.com/phetsims/least-squares-regression/issues/60
      if (xVariance < 2e-10) {
        isDefined = false;
      } else {
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
    if (!this.isLinearFitDefined()) {
      return null;
    } else {
      this.getStatistics();
      let pearsonCoefficientCorrelationNumerator = this.averageOfSumOfSquaresXY - this.averageOfSumOfX * this.averageOfSumOfY;
      if (Math.abs(pearsonCoefficientCorrelationNumerator) < 1E-10) {
        pearsonCoefficientCorrelationNumerator = 0;
      }

      // for very small values, we can end up with a very small or negative number.  In this case, return null so we
      // don't get a NaN for the coefficient.
      const number = (this.averageOfSumOfSquaresXX - this.averageOfSumOfX * this.averageOfSumOfX) * (this.averageOfSumOfSquaresYY - this.averageOfSumOfY * this.averageOfSumOfY);
      if (number < 1E-15) {
        return null;
      }
      const pearsonCoefficientCorrelationDenominator = Math.sqrt(number);

      // make sure the denominator is not equal to zero, this happens if all the points are aligned vertically
      if (pearsonCoefficientCorrelationDenominator === 0) {
        return null; //
      } else {
        const pearsonCoefficientCorrelation = pearsonCoefficientCorrelationNumerator / pearsonCoefficientCorrelationDenominator;
        return pearsonCoefficientCorrelation;
      }
    }
  }
}
leastSquaresRegression.register('Graph', Graph);
export default Graph;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiQm91bmRzMiIsIlZlY3RvcjIiLCJsZWFzdFNxdWFyZXNSZWdyZXNzaW9uIiwiUmVzaWR1YWwiLCJHcmFwaCIsImNvbnN0cnVjdG9yIiwieFJhbmdlIiwieVJhbmdlIiwiYW5nbGVQcm9wZXJ0eSIsImludGVyY2VwdFByb3BlcnR5IiwibXlMaW5lVmlzaWJsZVByb3BlcnR5IiwiYmVzdEZpdExpbmVWaXNpYmxlUHJvcGVydHkiLCJteUxpbmVTaG93UmVzaWR1YWxzUHJvcGVydHkiLCJteUxpbmVTaG93U3F1YXJlZFJlc2lkdWFsc1Byb3BlcnR5IiwiYmVzdEZpdExpbmVTaG93UmVzaWR1YWxzUHJvcGVydHkiLCJiZXN0Rml0TGluZVNob3dTcXVhcmVkUmVzaWR1YWxzUHJvcGVydHkiLCJteUxpbmVSZXNpZHVhbHNWaXNpYmxlUHJvcGVydHkiLCJteUxpbmVWaXNpYmxlIiwibXlMaW5lU2hvd1Jlc2lkdWFscyIsIm15TGluZVNxdWFyZWRSZXNpZHVhbHNWaXNpYmxlUHJvcGVydHkiLCJteUxpbmVTaG93U3F1YXJlZFJlc2lkdWFscyIsImJlc3RGaXRMaW5lUmVzaWR1YWxzVmlzaWJsZVByb3BlcnR5IiwiYmVzdEZpdExpbmVWaXNpYmxlIiwiYmVzdEZpdExpbmVTaG93UmVzaWR1YWxzIiwiYmVzdEZpdExpbmVTcXVhcmVkUmVzaWR1YWxzVmlzaWJsZVByb3BlcnR5IiwiYmVzdEZpdExpbmVTaG93U3F1YXJlZFJlc2lkdWFscyIsImJvdW5kcyIsIm15TGluZVJlc2lkdWFscyIsImJlc3RGaXRMaW5lUmVzaWR1YWxzIiwiZGF0YVBvaW50c09uR3JhcGgiLCJzZXRHcmFwaERvbWFpbiIsInJlc2V0IiwiY2xlYXIiLCJyZXNldE9uQ2hhbmdlT2ZEYXRhU2V0Iiwic2xvcGVGYWN0b3IiLCJtYXgiLCJtaW4iLCJoZWlnaHQiLCJ3aWR0aCIsImludGVyY2VwdEZhY3RvciIsImludGVyY2VwdE9mZnNldCIsInVwZGF0ZSIsInVwZGF0ZU15TGluZVJlc2lkdWFscyIsInVwZGF0ZUJlc3RGaXRMaW5lUmVzaWR1YWxzIiwic2xvcGUiLCJhbmdsZSIsIk1hdGgiLCJ0YW4iLCJhZGRNeUxpbmVSZXNpZHVhbCIsImRhdGFQb2ludCIsIm15TGluZVJlc2lkdWFsIiwidmFsdWUiLCJwdXNoIiwiYWRkQmVzdEZpdExpbmVSZXNpZHVhbCIsImxpbmVhckZpdFBhcmFtZXRlcnMiLCJnZXRMaW5lYXJGaXQiLCJiZXN0Rml0TGluZVJlc2lkdWFsIiwiaW50ZXJjZXB0IiwicmVtb3ZlTXlMaW5lUmVzaWR1YWwiLCJteUxpbmVSZXNpZHVhbHNDb3B5Iiwic2xpY2UiLCJmb3JFYWNoIiwibXlMaW5lUmVzaWR1YWxQcm9wZXJ0eSIsInJlbW92ZSIsInJlbW92ZUJlc3RGaXRMaW5lUmVzaWR1YWwiLCJiZXN0Rml0TGluZVJlc2lkdWFsc0NvcHkiLCJiZXN0Rml0TGluZVJlc2lkdWFsUHJvcGVydHkiLCJyZXNpZHVhbFByb3BlcnR5IiwiaXNMaW5lYXJGaXREZWZpbmVkIiwiYWRkRGF0YVBvaW50c09uR3JhcGhBbmRSZXNpZHVhbHNJbkJ1bGsiLCJkYXRhUG9pbnRzIiwibXlTbG9wZSIsIm15SW50ZXJjZXB0IiwiaXNEYXRhUG9pbnRPbkxpc3QiLCJpbmRleCIsImluZGV4T2YiLCJpc0RhdGFQb2ludFBvc2l0aW9uT3ZlcmxhcHBpbmdHcmFwaCIsInBvc2l0aW9uIiwiY29udGFpbnNQb2ludCIsImFkZFBvaW50QW5kUmVzaWR1YWxzIiwibGVuZ3RoIiwicG9zaXRpb25VcGRhdGVMaXN0ZW5lciIsInBvc2l0aW9uUHJvcGVydHkiLCJsaW5rIiwicmVtb3ZlUG9pbnRBbmRSZXNpZHVhbHMiLCJhc3NlcnQiLCJzcGxpY2UiLCJyZW1vdmVCZXN0Rml0TGluZVJlc2lkdWFscyIsImhhc0xpc3RlbmVyIiwidW5saW5rIiwic3VtT2ZTcXVhcmVkUmVzaWR1YWxzIiwic3VtT2ZTcXVhcmVSZXNpZHVhbHMiLCJ5UmVzaWR1YWwiLCJ4IiwieSIsImdldE15TGluZVN1bU9mU3F1YXJlZFJlc2lkdWFscyIsImdldEJlc3RGaXRMaW5lU3VtT2ZTcXVhcmVkUmVzaWR1YWxzIiwiZ2V0Qm91bmRhcnlQb2ludHMiLCJ5VmFsdWVMZWZ0IiwibWluWCIsInlWYWx1ZVJpZ2h0IiwibWF4WCIsImJvdW5kYXJ5UG9pbnRzIiwicG9pbnQxIiwicG9pbnQyIiwiZ2V0U3RhdGlzdGljcyIsImRhdGFQb2ludEFycmF5IiwiYXJyYXlMZW5ndGgiLCJzcXVhcmVzWFgiLCJfIiwibWFwIiwic3F1YXJlc1hZIiwic3F1YXJlc1lZIiwicG9zaXRpb25BcnJheVgiLCJwb3NpdGlvbkFycmF5WSIsImFkZCIsIm1lbW8iLCJudW0iLCJzdW1PZlNxdWFyZXNYWCIsInJlZHVjZSIsInN1bU9mU3F1YXJlc1hZIiwic3VtT2ZTcXVhcmVzWVkiLCJzdW1PZlgiLCJzdW1PZlkiLCJhdmVyYWdlT2ZTdW1PZlNxdWFyZXNYWCIsImF2ZXJhZ2VPZlN1bU9mU3F1YXJlc1hZIiwiYXZlcmFnZU9mU3VtT2ZTcXVhcmVzWVkiLCJhdmVyYWdlT2ZTdW1PZlgiLCJhdmVyYWdlT2ZTdW1PZlkiLCJpc0RlZmluZWQiLCJ4VmFyaWFuY2UiLCJzbG9wZU51bWVyYXRvciIsInNsb3BlRGVub21pbmF0b3IiLCJmaXRQYXJhbWV0ZXJzIiwiZ2V0UGVhcnNvbkNvZWZmaWNpZW50Q29ycmVsYXRpb24iLCJwZWFyc29uQ29lZmZpY2llbnRDb3JyZWxhdGlvbk51bWVyYXRvciIsImFicyIsIm51bWJlciIsInBlYXJzb25Db2VmZmljaWVudENvcnJlbGF0aW9uRGVub21pbmF0b3IiLCJzcXJ0IiwicGVhcnNvbkNvZWZmaWNpZW50Q29ycmVsYXRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdyYXBoLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIG9mIGEgcmVjdGFuZ3VsYXIgZ3JhcGggdXBvbiB3aGljaCB2YXJpb3VzIGRhdGEgcG9pbnRzIGNhbiBiZSBwbGFjZWQuXHJcbiAqIFRoZSBncmFwaCBNb2RlbCBpcyByZXNwb25zaWJsZSBmb3IgZ2VuZXJhdGluZyBhbGwgc3RhdGlzdGljYWwgcXVhbnRpdGllcyByZWxhdGVkIHRvIGEgZGF0YVBvaW50IHNldCBmb3IgJ2Jlc3QgRml0IExpbmUnIGFuZCAnTXkgTGluZSdcclxuICogSW4gYWRkaXRpb24sIHRoZSBhc3NvY2lhdGVkIFJlc2lkdWFscyAoZm9yICdNeSBMaW5lJyBhbmQgJ0Jlc3QgRml0IExpbmUnKSBvZiB0aGUgZGF0YVBvaW50cyBhcmUgaGFuZGxlZCBieSBncmFwaCBtb2RlbC5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGUgKEJlcmVhIENvbGxlZ2UpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbGVhc3RTcXVhcmVzUmVncmVzc2lvbiBmcm9tICcuLi8uLi9sZWFzdFNxdWFyZXNSZWdyZXNzaW9uLmpzJztcclxuaW1wb3J0IFJlc2lkdWFsIGZyb20gJy4vUmVzaWR1YWwuanMnO1xyXG5cclxuY2xhc3MgR3JhcGgge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHhSYW5nZVxyXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHlSYW5nZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB4UmFuZ2UsIHlSYW5nZSApIHtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn0gaW4gcmFkaWFucywgYSBwcm94eSBmb3IgdGhlICdteSBsaW5lJyBzbG9wZS5cclxuICAgIHRoaXMuYW5nbGVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSBpbiB1bml0cyBvZiB0aGUgZ3JhcGggYm91bmRzXHJcbiAgICB0aGlzLmludGVyY2VwdFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSB2aXNpYmlsaXR5IG9mIE15IExpbmUgb24gdGhlIGdyYXBoIGFuZCBhc3NvY2lhdGVkIGNoZWNrYm94XHJcbiAgICB0aGlzLm15TGluZVZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHZpc2liaWxpdHkgb2YgQmVzdCBGaXQgTGluZSBvbiB0aGUgZ3JhcGggYW5kIGFzc29jaWF0ZWQgY2hlY2tib3hcclxuICAgIHRoaXMuYmVzdEZpdExpbmVWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gdmlzaWJpbGl0eSBvZiBSZXNpZHVhbHMgb2YgTXkgTGluZSAoY2hlY2tib3ggb25seSlcclxuICAgIHRoaXMubXlMaW5lU2hvd1Jlc2lkdWFsc1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHZpc2liaWxpdHkgb2YgU3F1YXJlZCBSZXNpZHVhbHMgb2YgTXkgTGluZSAoY2hlY2tib3ggb25seSlcclxuICAgIHRoaXMubXlMaW5lU2hvd1NxdWFyZWRSZXNpZHVhbHNQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSB2aXNpYmlsaXR5IG9mIFJlc2lkdWFscyBvZiBCZXN0IEZpdCBMaW5lIChjaGVja2JveCBvbmx5KVxyXG4gICAgdGhpcy5iZXN0Rml0TGluZVNob3dSZXNpZHVhbHNQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSB2aXNpYmlsaXR5IG9mIFNxdWFyZWQgUmVzaWR1YWxzIG9mIEJlc3QgRml0IExpbmUgKGNoZWNrYm94IG9ubHkpXHJcbiAgICB0aGlzLmJlc3RGaXRMaW5lU2hvd1NxdWFyZWRSZXNpZHVhbHNQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSAgcHJvcGVydHkgdGhhdCBjb250cm9scyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgUmVzaWR1YWxzIG9uIHRoZSBncmFwaCBmb3IgTXkgTGluZVxyXG4gICAgdGhpcy5teUxpbmVSZXNpZHVhbHNWaXNpYmxlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMubXlMaW5lVmlzaWJsZVByb3BlcnR5LCB0aGlzLm15TGluZVNob3dSZXNpZHVhbHNQcm9wZXJ0eSBdLFxyXG4gICAgICAoIG15TGluZVZpc2libGUsIG15TGluZVNob3dSZXNpZHVhbHMgKSA9PiBteUxpbmVWaXNpYmxlICYmIG15TGluZVNob3dSZXNpZHVhbHMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHByb3BlcnR5IHRoYXQgY29udHJvbHMgdGhlIHZpc2liaWxpdHkgb2YgdGhlIFNxdWFyZSBSZXNpZHVhbHMgb24gdGhlIGdyYXBoIGZvciBNeSBMaW5lXHJcbiAgICB0aGlzLm15TGluZVNxdWFyZWRSZXNpZHVhbHNWaXNpYmxlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMubXlMaW5lVmlzaWJsZVByb3BlcnR5LCB0aGlzLm15TGluZVNob3dTcXVhcmVkUmVzaWR1YWxzUHJvcGVydHkgXSxcclxuICAgICAgKCBteUxpbmVWaXNpYmxlLCBteUxpbmVTaG93U3F1YXJlZFJlc2lkdWFscyApID0+IG15TGluZVZpc2libGUgJiYgbXlMaW5lU2hvd1NxdWFyZWRSZXNpZHVhbHMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHByb3BlcnR5IHRoYXQgY29udHJvbHMgdGhlIHZpc2liaWxpdHkgb2YgdGhlIFNxdWFyZSBSZXNpZHVhbHMgb24gdGhlIGdyYXBoIGZvciBCZXN0IEZpdCBMaW5lXHJcbiAgICB0aGlzLmJlc3RGaXRMaW5lUmVzaWR1YWxzVmlzaWJsZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLmJlc3RGaXRMaW5lVmlzaWJsZVByb3BlcnR5LCB0aGlzLmJlc3RGaXRMaW5lU2hvd1Jlc2lkdWFsc1Byb3BlcnR5IF0sXHJcbiAgICAgICggYmVzdEZpdExpbmVWaXNpYmxlLCBiZXN0Rml0TGluZVNob3dSZXNpZHVhbHMgKSA9PiBiZXN0Rml0TGluZVZpc2libGUgJiYgYmVzdEZpdExpbmVTaG93UmVzaWR1YWxzICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSBwcm9wZXJ0eSB0aGF0IGNvbnRyb2xzIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBTcXVhcmUgUmVzaWR1YWxzIG9uIHRoZSBncmFwaCBmb3IgQmVzdCBGaXQgTGluZVxyXG4gICAgdGhpcy5iZXN0Rml0TGluZVNxdWFyZWRSZXNpZHVhbHNWaXNpYmxlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMuYmVzdEZpdExpbmVWaXNpYmxlUHJvcGVydHksIHRoaXMuYmVzdEZpdExpbmVTaG93U3F1YXJlZFJlc2lkdWFsc1Byb3BlcnR5IF0sXHJcbiAgICAgICggYmVzdEZpdExpbmVWaXNpYmxlLCBiZXN0Rml0TGluZVNob3dTcXVhcmVkUmVzaWR1YWxzICkgPT4gYmVzdEZpdExpbmVWaXNpYmxlICYmIGJlc3RGaXRMaW5lU2hvd1NxdWFyZWRSZXNpZHVhbHMgKTtcclxuXHJcbiAgICAvLyBCb3VuZHMgZm9yIHRoZSBncmFwaCBpbiBtb2RlbCBjb29yZGluYXRlcywgaXQgaXMgYSB1bml0IHNxdWFyZS4gVGhpcyByZW1haW5zIHRoZSBzYW1lIGZvciBhbGwgRGF0YVNldHNcclxuICAgIC8vIEBwdWJsaWMgcmVhZC1vbmx5XHJcbiAgICB0aGlzLmJvdW5kcyA9IG5ldyBCb3VuZHMyKCAwLCAwLCAxLCAxICk7XHJcblxyXG4gICAgLy8gb2JzZXJ2YWJsZSBhcnJheXMgb2YgdGhlIGxpbmUgYW5kIHNxdWFyZWQgcmVzaWR1YWxzICh3cmFwcGVkIGluIGEgcHJvcGVydHkpIGZvciBNeUxpbmUgYW5kIEJlc3RGaXRMaW5lXHJcbiAgICB0aGlzLm15TGluZVJlc2lkdWFscyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpOyAvLyBAcHVibGljXHJcbiAgICB0aGlzLmJlc3RGaXRMaW5lUmVzaWR1YWxzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7IC8vIEBwdWJsaWNcclxuXHJcbiAgICAvLyBhcnJheSBvZiB0aGUgZGF0YVBvaW50cyB0aGF0IGFyZSBvdmVybGFwcGluZyB0aGUgZ3JhcGguXHJcbiAgICB0aGlzLmRhdGFQb2ludHNPbkdyYXBoID0gW107ICAvLyBAcHVibGljIHJlYWQtb25seVxyXG5cclxuICAgIC8vIHNldCB0aGUgZG9tYWluIG9mIHRoZSBncmFwaHMgKGZvciBmdXR1cmUgdXNlIGJ5IHRoZSBlcXVhdGlvbiBOb2RlIGFuZCB0aGUgZ3JhcGggQXhlcylcclxuICAgIHRoaXMuc2V0R3JhcGhEb21haW4oIHhSYW5nZSwgeVJhbmdlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldCB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgbGluZXMgYW5kIHJlc2lkdWFscyBhcyB3ZWxsIGFzIHRoZSBhbmdsZSBhbmQgaW50ZXJjZXB0LlxyXG4gICAqIEVtcHR5IG91dCB0aGUgdHdvIHJlc2lkdWFsIGFycmF5cyBhbmQgdGhlIGRhdGFQb2ludHMgb24gR3JhcGggYXJyYXlcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLmFuZ2xlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaW50ZXJjZXB0UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubXlMaW5lVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmJlc3RGaXRMaW5lVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLm15TGluZVNob3dSZXNpZHVhbHNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5teUxpbmVTaG93U3F1YXJlZFJlc2lkdWFsc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmJlc3RGaXRMaW5lU2hvd1Jlc2lkdWFsc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmJlc3RGaXRMaW5lU2hvd1NxdWFyZWRSZXNpZHVhbHNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5kYXRhUG9pbnRzT25HcmFwaCA9IFtdO1xyXG4gICAgdGhpcy5teUxpbmVSZXNpZHVhbHMuY2xlYXIoKTtcclxuICAgIHRoaXMuYmVzdEZpdExpbmVSZXNpZHVhbHMuY2xlYXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEVtcHR5IG91dCB0aGUgdHdvIHJlc2lkdWFsIGFycmF5cyBhbmQgdGhlIGRhdGFQb2ludHMgb24gR3JhcGggYXJyYXlcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXRPbkNoYW5nZU9mRGF0YVNldCgpIHtcclxuICAgIHRoaXMuZGF0YVBvaW50c09uR3JhcGggPSBbXTtcclxuICAgIHRoaXMubXlMaW5lUmVzaWR1YWxzLmNsZWFyKCk7XHJcbiAgICB0aGlzLmJlc3RGaXRMaW5lUmVzaWR1YWxzLmNsZWFyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBob3Jpem9udGFsIGFuZCB2ZXJ0aWNhbCBncmFwaCBkb21haW4gb2YgZGF0YVNldHMgYW5kIHRoZSBjb3JyZXNwb25kaW5nIG11bHRpcGxpY2F0aXZlIGZhY3RvciBmb3IgdGhlIHNsb3BlIGFuZCBpbnRlcmNlcHRcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtSYW5nZX0geFJhbmdlXHJcbiAgICogQHBhcmFtIHtSYW5nZX0geVJhbmdlXHJcbiAgICovXHJcbiAgc2V0R3JhcGhEb21haW4oIHhSYW5nZSwgeVJhbmdlICkge1xyXG4gICAgdGhpcy54UmFuZ2UgPSB4UmFuZ2U7IC8vIEBwdWJsaWNcclxuICAgIHRoaXMueVJhbmdlID0geVJhbmdlOyAvLyBAcHVibGljXHJcbiAgICB0aGlzLnNsb3BlRmFjdG9yID0gKCB5UmFuZ2UubWF4IC0geVJhbmdlLm1pbiApIC8gKCB4UmFuZ2UubWF4IC0geFJhbmdlLm1pbiApIC8gKCB0aGlzLmJvdW5kcy5oZWlnaHQgLyB0aGlzLmJvdW5kcy53aWR0aCApOy8vIEBwdWJsaWNcclxuICAgIHRoaXMuaW50ZXJjZXB0RmFjdG9yID0gKCB5UmFuZ2UubWF4IC0geVJhbmdlLm1pbiApIC8gdGhpcy5ib3VuZHMuaGVpZ2h0OyAvLyBAcHVibGljXHJcbiAgICB0aGlzLmludGVyY2VwdE9mZnNldCA9ICggeVJhbmdlLm1pbiApOyAvLyBAcHVibGljXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIG1vZGVsIFJlc2lkdWFscyBmb3IgJ015IExpbmUnIGFuZCAnQmVzdCBGaXQgTGluZSdcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZSgpIHtcclxuICAgIHRoaXMudXBkYXRlTXlMaW5lUmVzaWR1YWxzKCk7XHJcbiAgICB0aGlzLnVwZGF0ZUJlc3RGaXRMaW5lUmVzaWR1YWxzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0IHRoZSBhbmdsZSBvZiBhIGxpbmUgKG1lYXN1cmVkIGZyb20gdGhlIGhvcml6b250YWwgeCBheGlzKSB0byBhIHNsb3BlXHJcbiAgICogQHB1YmxpYyByZWFkLW9ubHlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGVcclxuICAgKi9cclxuICBzbG9wZSggYW5nbGUgKSB7XHJcbiAgICByZXR1cm4gTWF0aC50YW4oIGFuZ2xlICkgKiB0aGlzLmJvdW5kcy5oZWlnaHQgLyB0aGlzLmJvdW5kcy53aWR0aDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhICdNeSBMaW5lJyBtb2RlbCBSZXNpZHVhbCB0byBhIGRhdGFQb2ludFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIHtEYXRhUG9pbnR9IGRhdGFQb2ludFxyXG4gICAqL1xyXG4gIGFkZE15TGluZVJlc2lkdWFsKCBkYXRhUG9pbnQgKSB7XHJcbiAgICBjb25zdCBteUxpbmVSZXNpZHVhbCA9IG5ldyBSZXNpZHVhbCggZGF0YVBvaW50LCB0aGlzLnNsb3BlKCB0aGlzLmFuZ2xlUHJvcGVydHkudmFsdWUgKSwgdGhpcy5pbnRlcmNlcHRQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgdGhpcy5teUxpbmVSZXNpZHVhbHMucHVzaCggbmV3IFByb3BlcnR5KCBteUxpbmVSZXNpZHVhbCApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSAnQmVzdCBGaXQgTGluZScgbW9kZWwgUmVzaWR1YWwgdG8gYSBkYXRhUG9pbnRcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSB7RGF0YVBvaW50fSBkYXRhUG9pbnRcclxuICAgKi9cclxuICBhZGRCZXN0Rml0TGluZVJlc2lkdWFsKCBkYXRhUG9pbnQgKSB7XHJcblxyXG4gICAgY29uc3QgbGluZWFyRml0UGFyYW1ldGVycyA9IHRoaXMuZ2V0TGluZWFyRml0KCk7XHJcbiAgICBjb25zdCBiZXN0Rml0TGluZVJlc2lkdWFsID0gbmV3IFJlc2lkdWFsKCBkYXRhUG9pbnQsIGxpbmVhckZpdFBhcmFtZXRlcnMuc2xvcGUsIGxpbmVhckZpdFBhcmFtZXRlcnMuaW50ZXJjZXB0ICk7XHJcbiAgICB0aGlzLmJlc3RGaXRMaW5lUmVzaWR1YWxzLnB1c2goIG5ldyBQcm9wZXJ0eSggYmVzdEZpdExpbmVSZXNpZHVhbCApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgdGhlICdNeSBMaW5lJyBtb2RlbCBSZXNpZHVhbCBhdHRhY2hlZCB0byBhIGRhdGFQb2ludFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIHtEYXRhUG9pbnR9IGRhdGFQb2ludFxyXG4gICAqL1xyXG4gIHJlbW92ZU15TGluZVJlc2lkdWFsKCBkYXRhUG9pbnQgKSB7XHJcbiAgICBjb25zdCBteUxpbmVSZXNpZHVhbHNDb3B5ID0gdGhpcy5teUxpbmVSZXNpZHVhbHMuc2xpY2UoKTtcclxuICAgIG15TGluZVJlc2lkdWFsc0NvcHkuZm9yRWFjaCggbXlMaW5lUmVzaWR1YWxQcm9wZXJ0eSA9PiB7XHJcbiAgICAgIGlmICggbXlMaW5lUmVzaWR1YWxQcm9wZXJ0eS52YWx1ZS5kYXRhUG9pbnQgPT09IGRhdGFQb2ludCApIHtcclxuICAgICAgICB0aGlzLm15TGluZVJlc2lkdWFscy5yZW1vdmUoIG15TGluZVJlc2lkdWFsUHJvcGVydHkgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGEgJ0Jlc3QgRml0IExpbmUnIG1vZGVsIFJlc2lkdWFsIGF0dGFjaGVkIHRvIGEgZGF0YVBvaW50XHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0ge0RhdGFQb2ludH0gZGF0YVBvaW50XHJcbiAgICovXHJcbiAgcmVtb3ZlQmVzdEZpdExpbmVSZXNpZHVhbCggZGF0YVBvaW50ICkge1xyXG4gICAgY29uc3QgYmVzdEZpdExpbmVSZXNpZHVhbHNDb3B5ID0gdGhpcy5iZXN0Rml0TGluZVJlc2lkdWFscy5zbGljZSgpO1xyXG4gICAgYmVzdEZpdExpbmVSZXNpZHVhbHNDb3B5LmZvckVhY2goIGJlc3RGaXRMaW5lUmVzaWR1YWxQcm9wZXJ0eSA9PiB7XHJcbiAgICAgIGlmICggYmVzdEZpdExpbmVSZXNpZHVhbFByb3BlcnR5LnZhbHVlLmRhdGFQb2ludCA9PT0gZGF0YVBvaW50ICkge1xyXG4gICAgICAgIHRoaXMuYmVzdEZpdExpbmVSZXNpZHVhbHMucmVtb3ZlKCBiZXN0Rml0TGluZVJlc2lkdWFsUHJvcGVydHkgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIGFsbCAnTXkgTGluZScgbW9kZWwgUmVzaWR1YWxzXHJcbiAgICogKE5lY2Vzc2FyeSB0byB1cGRhdGUgd2hlbiB0aGUgc2xvcGUgYW5kIHRoZSBpbnRlcmNlcHQgb2YgJ015IExpbmUnIGFyZSBtb2RpZmllZClcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdXBkYXRlTXlMaW5lUmVzaWR1YWxzKCkge1xyXG4gICAgdGhpcy5teUxpbmVSZXNpZHVhbHMuZm9yRWFjaCggcmVzaWR1YWxQcm9wZXJ0eSA9PiB7XHJcbiAgICAgIGNvbnN0IGRhdGFQb2ludCA9IHJlc2lkdWFsUHJvcGVydHkudmFsdWUuZGF0YVBvaW50O1xyXG4gICAgICByZXNpZHVhbFByb3BlcnR5LnZhbHVlID0gbmV3IFJlc2lkdWFsKCBkYXRhUG9pbnQsIHRoaXMuc2xvcGUoIHRoaXMuYW5nbGVQcm9wZXJ0eS52YWx1ZSApLCB0aGlzLmludGVyY2VwdFByb3BlcnR5LnZhbHVlICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgYWxsICdNeSBCZXN0IEZpdCBMaW5lJyBtb2RlbCBSZXNpZHVhbHNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZUJlc3RGaXRMaW5lUmVzaWR1YWxzKCkge1xyXG4gICAgaWYgKCB0aGlzLmlzTGluZWFyRml0RGVmaW5lZCgpICkge1xyXG4gICAgICBjb25zdCBsaW5lYXJGaXRQYXJhbWV0ZXJzID0gdGhpcy5nZXRMaW5lYXJGaXQoKTtcclxuICAgICAgdGhpcy5iZXN0Rml0TGluZVJlc2lkdWFscy5mb3JFYWNoKCByZXNpZHVhbFByb3BlcnR5ID0+IHtcclxuICAgICAgICBjb25zdCBkYXRhUG9pbnQgPSByZXNpZHVhbFByb3BlcnR5LnZhbHVlLmRhdGFQb2ludDtcclxuICAgICAgICByZXNpZHVhbFByb3BlcnR5LnZhbHVlID0gbmV3IFJlc2lkdWFsKCBkYXRhUG9pbnQsIGxpbmVhckZpdFBhcmFtZXRlcnMuc2xvcGUsIGxpbmVhckZpdFBhcmFtZXRlcnMuaW50ZXJjZXB0ICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBEYXRhIFBvaW50cyBvbiBHcmFwaCBpbiBidWxrIHN1Y2ggdGhhdCBubyB1cGRhdGUgaXMgdHJpZ2dlcmVkIHRocm91Z2hvdXQgdGhlIHByb2Nlc3MuXHJcbiAgICogVGhpcyBpcyBkb25lIGZvciBwZXJmb3JtYW5jZSByZWFzb24uXHJcbiAgICogQHB1YmxpYyAoYWNjZXNzZWQgYnkgTGVhc3RTcXVhcmVSZWdyZXNzaW9uTW9kZWwpXHJcbiAgICogQHBhcmFtIHtBcnJheS48RGF0YVBvaW50Pn0gZGF0YVBvaW50c1xyXG4gICAqL1xyXG4gIGFkZERhdGFQb2ludHNPbkdyYXBoQW5kUmVzaWR1YWxzSW5CdWxrKCBkYXRhUG9pbnRzICkge1xyXG4gICAgLy8gZm9yIHBlcmZvcm1hbmNlIHJlYXNvbiBvbmUgc2hvdWxkIGFkZCBhbGwgdGhlIGRhdGFQb2ludHMgb24gdGhlIGdyYXBoXHJcbiAgICAvLyB0aGVuIHdlIGNhbiBjYWxjdWxhdGUgdGhlIGJlc3QgRml0IExpbmUgKG9ubHkgb25jZSlcclxuICAgIC8vIGFuZCB0aGVuIGFkZCBhbGwgdGhlIFJlc2lkdWFscy5cclxuICAgIGRhdGFQb2ludHMuZm9yRWFjaCggZGF0YVBvaW50ID0+IHtcclxuICAgICAgdGhpcy5kYXRhUG9pbnRzT25HcmFwaC5wdXNoKCBkYXRhUG9pbnQgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBteVNsb3BlID0gdGhpcy5zbG9wZSggdGhpcy5hbmdsZVByb3BlcnR5LnZhbHVlICk7XHJcbiAgICBjb25zdCBteUludGVyY2VwdCA9IHRoaXMuaW50ZXJjZXB0UHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgLy8gYWRkIGEgJ215TGluZVJlc2lkdWFsJyBmb3IgZXZlcnkgc2luZ2xlIGRhdGFQb2ludFxyXG4gICAgZGF0YVBvaW50cy5mb3JFYWNoKCBkYXRhUG9pbnQgPT4ge1xyXG4gICAgICBjb25zdCBteUxpbmVSZXNpZHVhbCA9IG5ldyBSZXNpZHVhbCggZGF0YVBvaW50LCBteVNsb3BlLCBteUludGVyY2VwdCApO1xyXG4gICAgICB0aGlzLm15TGluZVJlc2lkdWFscy5wdXNoKCBuZXcgUHJvcGVydHkoIG15TGluZVJlc2lkdWFsICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBhZGQgYSAnYmVzdCBmaXQgTGluZScgcmVzaWR1YWwgIGZvciBldmVyeSBzaW5nbGUgZGF0YVBvaW50XHJcbiAgICAvLyB1bmxlc3MgdGhlcmUgaXMgbm90ICBsaW5lYXJGaXQgKGJlY2F1c2UgdGhlcmUgaXMgbGVzcyB0aGFuIDIgZGF0YSBwb2ludHMgb24gdGhlIGJvYXJkIGZvciBpbnN0YW5jZSlcclxuICAgIGlmICggdGhpcy5pc0xpbmVhckZpdERlZmluZWQoKSApIHtcclxuICAgICAgY29uc3QgbGluZWFyRml0UGFyYW1ldGVycyA9IHRoaXMuZ2V0TGluZWFyRml0KCk7XHJcbiAgICAgIGRhdGFQb2ludHMuZm9yRWFjaCggZGF0YVBvaW50ID0+IHtcclxuICAgICAgICBjb25zdCBiZXN0Rml0TGluZVJlc2lkdWFsID0gbmV3IFJlc2lkdWFsKCBkYXRhUG9pbnQsIGxpbmVhckZpdFBhcmFtZXRlcnMuc2xvcGUsIGxpbmVhckZpdFBhcmFtZXRlcnMuaW50ZXJjZXB0ICk7XHJcbiAgICAgICAgdGhpcy5iZXN0Rml0TGluZVJlc2lkdWFscy5wdXNoKCBuZXcgUHJvcGVydHkoIGJlc3RGaXRMaW5lUmVzaWR1YWwgKSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgdHJ1ZSBpZiB0aGUgZGF0YVBvaW50IGlzIG9uIHRoZSBhcnJheS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSB7RGF0YVBvaW50fSBkYXRhUG9pbnRcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc0RhdGFQb2ludE9uTGlzdCggZGF0YVBvaW50ICkge1xyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmRhdGFQb2ludHNPbkdyYXBoLmluZGV4T2YoIGRhdGFQb2ludCApO1xyXG4gICAgcmV0dXJuICggaW5kZXggIT09IC0xICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0aGF0IGRldGVybWluZXMgaWYgdGhlIFBvc2l0aW9uIG9mIGEgRGF0YSBQb2ludCBpcyB3aXRoaW4gdGhlIHZpc3VhbCBib3VuZHMgb2YgdGhlIGdyYXBoXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNEYXRhUG9pbnRQb3NpdGlvbk92ZXJsYXBwaW5nR3JhcGgoIHBvc2l0aW9uICkge1xyXG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLmNvbnRhaW5zUG9pbnQoIHBvc2l0aW9uICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgdGhlIGRhdGFQb2ludCB0b3AgdGhlIGRhdGFQb2ludHNPbkdyYXBoIEFycmF5IGFuZCBhZGQgJ015IExpbmUnIGFuZCAnQmVzdCBGaXQgTGluZScgbW9kZWwgUmVzaWR1YWxzXHJcbiAgICogQHB1YmxpYyAoYWNjZXNzZWQgYnkgTGVhc3RTcXVhcmVSZWdyZXNzaW9uTW9kZWwpXHJcbiAgICogQHBhcmFtIHtEYXRhUG9pbnR9IGRhdGFQb2ludFxyXG4gICAqL1xyXG4gIGFkZFBvaW50QW5kUmVzaWR1YWxzKCBkYXRhUG9pbnQgKSB7XHJcbiAgICB0aGlzLmRhdGFQb2ludHNPbkdyYXBoLnB1c2goIGRhdGFQb2ludCApO1xyXG4gICAgdGhpcy5hZGRNeUxpbmVSZXNpZHVhbCggZGF0YVBvaW50ICk7XHJcblxyXG4gICAgLy8gYSBCZXN0Rml0IGxpbmUgZXhpc3RzIGlmIHRoZXJlIGFyZSB0d28gZGF0YVBvaW50cyBvciBtb3JlLlxyXG4gICAgLy8gaWYgdGhlcmUgYXJlIHR3byBkYXRhUG9pbnRzIG9uIHRoZSBncmFwaCwgd2UgZG9uJ3QgYWRkIG15IGJlc3RGaXRMaW5lIHJlc2lkdWFsXHJcbiAgICAvLyBzaW5jZSB0aGUgcmVzaWR1YWwgYXJlIHplcm8gYnkgZGVmaW5pdGlvblxyXG4gICAgLy8gaWYgdGhlcmUgYXJlIGV4YWN0bHkgdGhyZWUgZGF0YSBwb2ludHMgb24gdGhlIGdyYXBoIHdlIG5lZWQgdG8gYWRkIHRocmVlIHJlc2lkdWFsc1xyXG4gICAgaWYgKCB0aGlzLmRhdGFQb2ludHNPbkdyYXBoLmxlbmd0aCA9PT0gMyApIHtcclxuICAgICAgdGhpcy5kYXRhUG9pbnRzT25HcmFwaC5mb3JFYWNoKCBkYXRhUG9pbnQgPT4ge1xyXG4gICAgICAgIHRoaXMuYWRkQmVzdEZpdExpbmVSZXNpZHVhbCggZGF0YVBvaW50ICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIC8vIGZvciB0aHJlZSBkYXRhUG9pbnRzIG9yIG1vcmUgdGhlcmUgaXMgb25lIHJlc2lkdWFsIGZvciBldmVyeSBkYXRhUG9pbnQgYWRkZWRcclxuICAgIGlmICggdGhpcy5kYXRhUG9pbnRzT25HcmFwaC5sZW5ndGggPiAzICkge1xyXG4gICAgICB0aGlzLmFkZEJlc3RGaXRMaW5lUmVzaWR1YWwoIGRhdGFQb2ludCApO1xyXG4gICAgfVxyXG5cclxuICAgIGRhdGFQb2ludC5wb3NpdGlvblVwZGF0ZUxpc3RlbmVyID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgfTtcclxuICAgIGRhdGFQb2ludC5wb3NpdGlvblByb3BlcnR5LmxpbmsoIGRhdGFQb2ludC5wb3NpdGlvblVwZGF0ZUxpc3RlbmVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYSBkYXRhUG9pbnQgYW5kIGl0cyBhc3NvY2lhdGVkIHJlc2lkdWFscyAoJ015IExpbmUnIGFuZCAnQmVzdCBGaXQgTGluZScpXHJcbiAgICogQHB1YmxpYyAoYWNjZXNzZWQgYnkgTGVhc3RTcXVhcmVSZWdyZXNzaW9uTW9kZWwpXHJcbiAgICogQHBhcmFtIHtEYXRhUG9pbnR9IGRhdGFQb2ludFxyXG4gICAqL1xyXG4gIHJlbW92ZVBvaW50QW5kUmVzaWR1YWxzKCBkYXRhUG9pbnQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzRGF0YVBvaW50T25MaXN0KCBkYXRhUG9pbnQgKSwgJyBuZWVkIHRoZSBwb2ludCB0byBiZSBvbiB0aGUgbGlzdCB0byByZW1vdmUgaXQnICk7XHJcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuZGF0YVBvaW50c09uR3JhcGguaW5kZXhPZiggZGF0YVBvaW50ICk7XHJcbiAgICB0aGlzLmRhdGFQb2ludHNPbkdyYXBoLnNwbGljZSggaW5kZXgsIDEgKTtcclxuXHJcbiAgICB0aGlzLnJlbW92ZU15TGluZVJlc2lkdWFsKCBkYXRhUG9pbnQgKTtcclxuXHJcbiAgICAvLyBpZiB0aGVyZSBhcmUgdHdvIGRhdGFQb2ludHMgb24gdGhlIGdyYXBoLCByZW1vdmUgYWxsIHJlc2lkdWFsc1xyXG4gICAgaWYgKCB0aGlzLmRhdGFQb2ludHNPbkdyYXBoLmxlbmd0aCA9PT0gMiApIHtcclxuICAgICAgdGhpcy5yZW1vdmVCZXN0Rml0TGluZVJlc2lkdWFscygpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlQmVzdEZpdExpbmVSZXNpZHVhbCggZGF0YVBvaW50ICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgaWYgKCBkYXRhUG9pbnQucG9zaXRpb25Qcm9wZXJ0eS5oYXNMaXN0ZW5lciggZGF0YVBvaW50LnBvc2l0aW9uVXBkYXRlTGlzdGVuZXIgKSApIHtcclxuICAgICAgZGF0YVBvaW50LnBvc2l0aW9uUHJvcGVydHkudW5saW5rKCBkYXRhUG9pbnQucG9zaXRpb25VcGRhdGVMaXN0ZW5lciApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdGhhdCByZW1vdmVzIGFsbCB0aGUgYmVzdCBGaXQgTGluZSBSZXNpZHVhbHNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHJlbW92ZUJlc3RGaXRMaW5lUmVzaWR1YWxzKCkge1xyXG4gICAgdGhpcy5iZXN0Rml0TGluZVJlc2lkdWFscy5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBzdW0gb2Ygc3F1YXJlZCByZXNpZHVhbHMgb2YgYWxsIHRoZSBkYXRhUG9pbnRzIG9uIHRoZSBsaXN0IChjb21wYXJlZCB3aXRoIGEgbGluZSB3aXRoIGEgc2xvcGUgYW5kIGludGVyY2VwdClcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzbG9wZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbnRlcmNlcHRcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzdW1PZlNxdWFyZVJlc2lkdWFsc1xyXG4gICAqL1xyXG4gIHN1bU9mU3F1YXJlZFJlc2lkdWFscyggc2xvcGUsIGludGVyY2VwdCApIHtcclxuICAgIGxldCBzdW1PZlNxdWFyZVJlc2lkdWFscyA9IDA7XHJcbiAgICB0aGlzLmRhdGFQb2ludHNPbkdyYXBoLmZvckVhY2goIGRhdGFQb2ludCA9PiB7XHJcbiAgICAgIGNvbnN0IHlSZXNpZHVhbCA9ICggc2xvcGUgKiBkYXRhUG9pbnQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54ICsgaW50ZXJjZXB0ICkgLSBkYXRhUG9pbnQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55O1xyXG4gICAgICBzdW1PZlNxdWFyZVJlc2lkdWFscyArPSB5UmVzaWR1YWwgKiB5UmVzaWR1YWw7XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gc3VtT2ZTcXVhcmVSZXNpZHVhbHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHN1bSBvZiBzcXVhcmVkIHJlc2lkdWFscyBvZiAnTXkgTGluZSdcclxuICAgKiBUaGUgc3VtIG9mIHNxdWFyZWQgcmVzaWR1YWwgaXMgemVybyBpZiB0aGVyZSBhcmUgbGVzcyB0aGFuIG9uZSBkYXRhUG9pbnQgb24gdGhlIGdyYXBoLlxyXG4gICAqIEBwdWJsaWMgcmVhZC1vbmx5XHJcbiAgICogQHJldHVybnMge251bWJlcn0gc3VtT2ZTcXVhcmVSZXNpZHVhbHNcclxuICAgKi9cclxuICBnZXRNeUxpbmVTdW1PZlNxdWFyZWRSZXNpZHVhbHMoKSB7XHJcbiAgICBpZiAoIHRoaXMuZGF0YVBvaW50c09uR3JhcGgubGVuZ3RoID49IDEgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnN1bU9mU3F1YXJlZFJlc2lkdWFscyggdGhpcy5zbG9wZSggdGhpcy5hbmdsZVByb3BlcnR5LnZhbHVlICksIHRoaXMuaW50ZXJjZXB0UHJvcGVydHkudmFsdWUgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgc3VtIG9mIHNxdWFyZWQgcmVzaWR1YWxzIG9mICdCZXN0IEZpdCBMaW5lJ1xyXG4gICAqIFRoZSBzdW0gb2Ygc3F1YXJlZCByZXNpZHVhbCBpcyB6ZXJvIGlmIHRoZXJlIGFyZSBsZXNzIHRoYW4gdHdvIGRhdGFQb2ludHMgb24gdGhlIGdyYXBoXHJcbiAgICogQHB1YmxpYyByZWFkLW9ubHlcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzdW1PZlNxdWFyZVJlc2lkdWFsc1xyXG4gICAqL1xyXG4gIGdldEJlc3RGaXRMaW5lU3VtT2ZTcXVhcmVkUmVzaWR1YWxzKCkge1xyXG4gICAgaWYgKCB0aGlzLmlzTGluZWFyRml0RGVmaW5lZCgpICkge1xyXG4gICAgICBjb25zdCBsaW5lYXJGaXRQYXJhbWV0ZXJzID0gdGhpcy5nZXRMaW5lYXJGaXQoKTtcclxuICAgICAgcmV0dXJuIHRoaXMuc3VtT2ZTcXVhcmVkUmVzaWR1YWxzKCBsaW5lYXJGaXRQYXJhbWV0ZXJzLnNsb3BlLCBsaW5lYXJGaXRQYXJhbWV0ZXJzLmludGVyY2VwdCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiB0d28gcG9pbnRzIHRoYXQgY3Jvc3NlcyB0aGUgbGVmdCBhbmQgdGhlIHJpZ2h0IGhhbmQgc2lkZSBvZiB0aGUgZ3JhcGggYm91bmRzXHJcbiAgICogQHB1YmxpYyByZWFkLW9ubHlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc2xvcGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW50ZXJjZXB0XHJcbiAgICogQHJldHVybnMge3twb2ludDE6IFZlY3RvcjIsIHBvaW50MjogVmVjdG9yMn19XHJcbiAgICovXHJcbiAgZ2V0Qm91bmRhcnlQb2ludHMoIHNsb3BlLCBpbnRlcmNlcHQgKSB7XHJcblxyXG4gICAgY29uc3QgeVZhbHVlTGVmdCA9IHNsb3BlICogdGhpcy5ib3VuZHMubWluWCArIGludGVyY2VwdDtcclxuICAgIGNvbnN0IHlWYWx1ZVJpZ2h0ID0gc2xvcGUgKiB0aGlzLmJvdW5kcy5tYXhYICsgaW50ZXJjZXB0O1xyXG4gICAgY29uc3QgYm91bmRhcnlQb2ludHMgPSB7XHJcbiAgICAgIHBvaW50MTogbmV3IFZlY3RvcjIoIHRoaXMuYm91bmRzLm1pblgsIHlWYWx1ZUxlZnQgKSxcclxuICAgICAgcG9pbnQyOiBuZXcgVmVjdG9yMiggdGhpcy5ib3VuZHMubWF4WCwgeVZhbHVlUmlnaHQgKVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gYm91bmRhcnlQb2ludHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0aGF0IHVwZGF0ZXMgc3RhdGlzdGljYWwgcHJvcGVydGllcyBvZiB0aGUgZGF0YVBvaW50cyBvbiB0aGUgZ3JhcGguXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXRTdGF0aXN0aWNzKCkge1xyXG5cclxuICAgIGNvbnN0IGRhdGFQb2ludEFycmF5ID0gdGhpcy5kYXRhUG9pbnRzT25HcmFwaDtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRhdGFQb2ludEFycmF5ICE9PSBudWxsLCAnZGF0YVBvaW50c09uR3JhcGggbXVzdCBjb250YWluIGRhdGEnICk7XHJcbiAgICBjb25zdCBhcnJheUxlbmd0aCA9IGRhdGFQb2ludEFycmF5Lmxlbmd0aDtcclxuXHJcbiAgICBjb25zdCBzcXVhcmVzWFggPSBfLm1hcCggZGF0YVBvaW50QXJyYXksIGRhdGFQb2ludCA9PiBkYXRhUG9pbnQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54ICogZGF0YVBvaW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUueCApO1xyXG4gICAgY29uc3Qgc3F1YXJlc1hZID0gXy5tYXAoIGRhdGFQb2ludEFycmF5LCBkYXRhUG9pbnQgPT4gZGF0YVBvaW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUueCAqIGRhdGFQb2ludC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgKTtcclxuICAgIGNvbnN0IHNxdWFyZXNZWSA9IF8ubWFwKCBkYXRhUG9pbnRBcnJheSwgZGF0YVBvaW50ID0+IGRhdGFQb2ludC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgKiBkYXRhUG9pbnQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ICk7XHJcbiAgICBjb25zdCBwb3NpdGlvbkFycmF5WCA9IF8ubWFwKCBkYXRhUG9pbnRBcnJheSwgZGF0YVBvaW50ID0+IGRhdGFQb2ludC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnggKTtcclxuICAgIGNvbnN0IHBvc2l0aW9uQXJyYXlZID0gXy5tYXAoIGRhdGFQb2ludEFycmF5LCBkYXRhUG9pbnQgPT4gZGF0YVBvaW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUueSApO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFkZCggbWVtbywgbnVtICkge1xyXG4gICAgICByZXR1cm4gbWVtbyArIG51bTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzdW1PZlNxdWFyZXNYWCA9IF8ucmVkdWNlKCBzcXVhcmVzWFgsIGFkZCwgMCApO1xyXG4gICAgY29uc3Qgc3VtT2ZTcXVhcmVzWFkgPSBfLnJlZHVjZSggc3F1YXJlc1hZLCBhZGQsIDAgKTtcclxuICAgIGNvbnN0IHN1bU9mU3F1YXJlc1lZID0gXy5yZWR1Y2UoIHNxdWFyZXNZWSwgYWRkLCAwICk7XHJcbiAgICBjb25zdCBzdW1PZlggPSBfLnJlZHVjZSggcG9zaXRpb25BcnJheVgsIGFkZCwgMCApO1xyXG4gICAgY29uc3Qgc3VtT2ZZID0gXy5yZWR1Y2UoIHBvc2l0aW9uQXJyYXlZLCBhZGQsIDAgKTtcclxuXHJcbiAgICB0aGlzLmF2ZXJhZ2VPZlN1bU9mU3F1YXJlc1hYID0gc3VtT2ZTcXVhcmVzWFggLyBhcnJheUxlbmd0aDtcclxuICAgIHRoaXMuYXZlcmFnZU9mU3VtT2ZTcXVhcmVzWFkgPSBzdW1PZlNxdWFyZXNYWSAvIGFycmF5TGVuZ3RoO1xyXG4gICAgdGhpcy5hdmVyYWdlT2ZTdW1PZlNxdWFyZXNZWSA9IHN1bU9mU3F1YXJlc1lZIC8gYXJyYXlMZW5ndGg7XHJcbiAgICB0aGlzLmF2ZXJhZ2VPZlN1bU9mWCA9IHN1bU9mWCAvIGFycmF5TGVuZ3RoO1xyXG4gICAgdGhpcy5hdmVyYWdlT2ZTdW1PZlkgPSBzdW1PZlkgLyBhcnJheUxlbmd0aDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyBpZiBhIGJlc3QgZml0IGxpbmUgZml0IGV4aXN0c1xyXG4gICAqIEBwdWJsaWMgcmVhZC1vbmx5XHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNMaW5lYXJGaXREZWZpbmVkKCkge1xyXG4gICAgbGV0IGlzRGVmaW5lZDtcclxuICAgIC8vIHlvdSBjYW4ndCBoYXZlIGEgbGluZWFyIGZpdCB3aXRoIGxlc3MgdGhhbiAyIGRhdGEgcG9pbnRzXHJcbiAgICBpZiAoIHRoaXMuZGF0YVBvaW50c09uR3JhcGgubGVuZ3RoIDwgMiApIHtcclxuICAgICAgaXNEZWZpbmVkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5nZXRTdGF0aXN0aWNzKCk7XHJcbiAgICAgIGNvbnN0IHhWYXJpYW5jZSA9IHRoaXMuYXZlcmFnZU9mU3VtT2ZTcXVhcmVzWFggLSB0aGlzLmF2ZXJhZ2VPZlN1bU9mWCAqIHRoaXMuYXZlcmFnZU9mU3VtT2ZYO1xyXG4gICAgICAvLyB0aGUgbGluZWFyIGZpdCBwYXJhbWV0ZXJzIGFyZSBub3QgZGVmaW5lZCB3aGVuIHRoZSBwb2ludHMgYXJlIGFsaWduZWQgdmVydGljYWxseSAoaW5maW5pdGUgc2xvcGUpLlxyXG4gICAgICAvLyBjaGVjayBmb3IgYSB0aHJlc2hvbGQgdG8gcHJldmVudCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbGVhc3Qtc3F1YXJlcy1yZWdyZXNzaW9uL2lzc3Vlcy82MFxyXG4gICAgICBpZiAoIHhWYXJpYW5jZSA8IDJlLTEwICkge1xyXG4gICAgICAgIGlzRGVmaW5lZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlzRGVmaW5lZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBpc0RlZmluZWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlICdiZXN0IGZpdCBsaW5lJyBwYXJhbWV0ZXJzLCBpLmUuIHNsb3BlIGFuZCBpbnRlcmNlcHQgb2YgdGhlIGRhdGFQb2ludHMgb24gdGhlIGdyYXBoLlxyXG4gICAqIEl0IHdvdWxkIGJlIHdpc2UgdG8gY2hlY2sgaWYgaXNMaW5lYXJGaXREZWZpbmVkKCkgaXMgdHJ1ZSBiZWZvcmUgY2FsbGluZyB0aGlzIGZ1bmN0aW9uLlxyXG4gICAqIEBwdWJsaWMgcmVhZC1vbmx5XHJcbiAgICogQHJldHVybnMge3tzbG9wZTogbnVtYmVyLCBpbnRlcmNlcHQ6IG51bWJlcn19XHJcbiAgICovXHJcbiAgZ2V0TGluZWFyRml0KCkge1xyXG4gICAgdGhpcy5nZXRTdGF0aXN0aWNzKCk7XHJcbiAgICBjb25zdCBzbG9wZU51bWVyYXRvciA9IHRoaXMuYXZlcmFnZU9mU3VtT2ZTcXVhcmVzWFkgLSB0aGlzLmF2ZXJhZ2VPZlN1bU9mWCAqIHRoaXMuYXZlcmFnZU9mU3VtT2ZZO1xyXG4gICAgY29uc3Qgc2xvcGVEZW5vbWluYXRvciA9IHRoaXMuYXZlcmFnZU9mU3VtT2ZTcXVhcmVzWFggLSB0aGlzLmF2ZXJhZ2VPZlN1bU9mWCAqIHRoaXMuYXZlcmFnZU9mU3VtT2ZYO1xyXG4gICAgY29uc3Qgc2xvcGUgPSBzbG9wZU51bWVyYXRvciAvIHNsb3BlRGVub21pbmF0b3I7XHJcbiAgICBjb25zdCBpbnRlcmNlcHQgPSB0aGlzLmF2ZXJhZ2VPZlN1bU9mWSAtIHNsb3BlICogdGhpcy5hdmVyYWdlT2ZTdW1PZlg7XHJcblxyXG4gICAgY29uc3QgZml0UGFyYW1ldGVycyA9IHtcclxuICAgICAgc2xvcGU6IHNsb3BlLFxyXG4gICAgICBpbnRlcmNlcHQ6IGludGVyY2VwdFxyXG4gICAgfTtcclxuICAgIHJldHVybiBmaXRQYXJhbWV0ZXJzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBQZWFyc29uIENvZWZmaWNpZW50IENvcnJlbGF0aW9uXHJcbiAgICogSXQgcmV0dXJucyBudWxsIGlmIHRoZXJlIGFyZSBsZXNzIHRoYW4gdHdvIGRhdGFQb2ludHMgb24gdGhlIGdyYXBoLlxyXG4gICAqIEZvciB0d28gZGF0YVBvaW50cyBhbmQgbW9yZSwgdGhlIFBlYXJzb24gY29lZmZpY2llbnQgcmFuZ2VzIGZyb20gLTEgdG8gMS5cclxuICAgKiBOb3RlIHRoYXQgdGhlIFBlYXJzb24gQ29lZmZpY2llbnQgQ29ycmVsYXRpb24gaXMgYW4gaW50cmluc2ljIHByb3BlcnR5IG9mIGEgc2V0IG9mIERhdGFQb2ludFxyXG4gICAqIFNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1BlYXJzb25fcHJvZHVjdC1tb21lbnRfY29ycmVsYXRpb25fY29lZmZpY2llbnRcclxuICAgKiBAcHVibGljIHJlYWQtb25seVxyXG4gICAqIEByZXR1cm5zIHtudWxsfHxudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0UGVhcnNvbkNvZWZmaWNpZW50Q29ycmVsYXRpb24oKSB7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5pc0xpbmVhckZpdERlZmluZWQoKSApIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5nZXRTdGF0aXN0aWNzKCk7XHJcbiAgICAgIGxldCBwZWFyc29uQ29lZmZpY2llbnRDb3JyZWxhdGlvbk51bWVyYXRvciA9IHRoaXMuYXZlcmFnZU9mU3VtT2ZTcXVhcmVzWFkgLSB0aGlzLmF2ZXJhZ2VPZlN1bU9mWCAqIHRoaXMuYXZlcmFnZU9mU3VtT2ZZO1xyXG5cclxuICAgICAgaWYgKCBNYXRoLmFicyggcGVhcnNvbkNvZWZmaWNpZW50Q29ycmVsYXRpb25OdW1lcmF0b3IgKSA8IDFFLTEwICkge1xyXG4gICAgICAgIHBlYXJzb25Db2VmZmljaWVudENvcnJlbGF0aW9uTnVtZXJhdG9yID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gZm9yIHZlcnkgc21hbGwgdmFsdWVzLCB3ZSBjYW4gZW5kIHVwIHdpdGggYSB2ZXJ5IHNtYWxsIG9yIG5lZ2F0aXZlIG51bWJlci4gIEluIHRoaXMgY2FzZSwgcmV0dXJuIG51bGwgc28gd2VcclxuICAgICAgLy8gZG9uJ3QgZ2V0IGEgTmFOIGZvciB0aGUgY29lZmZpY2llbnQuXHJcbiAgICAgIGNvbnN0IG51bWJlciA9ICggdGhpcy5hdmVyYWdlT2ZTdW1PZlNxdWFyZXNYWCAtIHRoaXMuYXZlcmFnZU9mU3VtT2ZYICogdGhpcy5hdmVyYWdlT2ZTdW1PZlggKSAqICggdGhpcy5hdmVyYWdlT2ZTdW1PZlNxdWFyZXNZWSAtIHRoaXMuYXZlcmFnZU9mU3VtT2ZZICogdGhpcy5hdmVyYWdlT2ZTdW1PZlkgKTtcclxuICAgICAgaWYgKCBudW1iZXIgPCAxRS0xNSApIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBwZWFyc29uQ29lZmZpY2llbnRDb3JyZWxhdGlvbkRlbm9taW5hdG9yID0gTWF0aC5zcXJ0KCBudW1iZXIgKTtcclxuXHJcbiAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgZGVub21pbmF0b3IgaXMgbm90IGVxdWFsIHRvIHplcm8sIHRoaXMgaGFwcGVucyBpZiBhbGwgdGhlIHBvaW50cyBhcmUgYWxpZ25lZCB2ZXJ0aWNhbGx5XHJcbiAgICAgIGlmICggcGVhcnNvbkNvZWZmaWNpZW50Q29ycmVsYXRpb25EZW5vbWluYXRvciA9PT0gMCApIHtcclxuICAgICAgICByZXR1cm4gbnVsbDsgLy9cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBjb25zdCBwZWFyc29uQ29lZmZpY2llbnRDb3JyZWxhdGlvbiA9IHBlYXJzb25Db2VmZmljaWVudENvcnJlbGF0aW9uTnVtZXJhdG9yIC8gcGVhcnNvbkNvZWZmaWNpZW50Q29ycmVsYXRpb25EZW5vbWluYXRvcjtcclxuICAgICAgICByZXR1cm4gcGVhcnNvbkNvZWZmaWNpZW50Q29ycmVsYXRpb247XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmxlYXN0U3F1YXJlc1JlZ3Jlc3Npb24ucmVnaXN0ZXIoICdHcmFwaCcsIEdyYXBoICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHcmFwaDtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MscUJBQXFCLE1BQU0sOENBQThDO0FBQ2hGLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxzQkFBc0IsTUFBTSxpQ0FBaUM7QUFDcEUsT0FBT0MsUUFBUSxNQUFNLGVBQWU7QUFFcEMsTUFBTUMsS0FBSyxDQUFDO0VBQ1Y7QUFDRjtBQUNBO0FBQ0E7RUFDRUMs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