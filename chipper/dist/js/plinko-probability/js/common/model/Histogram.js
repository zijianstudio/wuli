// Copyright 2015-2021, University of Colorado Boulder

/**
 * Model of a histogram that keeps track of the number of counts in each bin
 * and some associated statistics
 *
 * @author Martin Veillette (Berea College)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import plinkoProbability from '../../plinkoProbability.js';
import PlinkoProbabilityConstants from '../PlinkoProbabilityConstants.js';

// constants
const BOUNDS = PlinkoProbabilityConstants.HISTOGRAM_BOUNDS;
class Histogram {
  /**
   * @param {Property.<number>} numberOfRowsProperty
   */
  constructor(numberOfRowsProperty) {
    this.bins = []; // @public {Object[]}
    this.average = 0; // @public (read-only)
    this.standardDeviation = 0; // @public (read-only)
    this.standardDeviationOfMean = 0; // @public (read-only)
    this.landedBallsNumber = 0; // @public (read-only)

    // convenience variables
    this.sumOfSquares = 0; // @private
    this.variance = 0; // @private
    this.numberOfRowsProperty = numberOfRowsProperty; // @private

    // initialized all the bins to zero.
    this.setBinsToZero();

    // emitters;
    this.histogramUpdatedEmitter = new Emitter(); // @public

    // link is present for the lifetime of the sim
    numberOfRowsProperty.link(() => {
      this.reset(); // if the number of rows change then reset the histogram
    });
  }

  /**
   * sets all the binCounts to 0 and resets the statistics
   * @public
   */
  reset() {
    this.setBinsToZero();
    this.resetStatistics();
    this.histogramUpdatedEmitter.emit();
  }

  /**
   * Used in the "ballsOnScreen" query parameter to set an initial amount of balls within the histogram.
   *
   * @param ballsOnScreen {number} - user inputted query parameter for the amount of balls the histogram is initialized with
   * @public
   */
  prepopulate(ballsOnScreen) {
    // temporarily stores the binCount for each bin in an empty array.
    const tempBins = [];
    for (let tempBinIndex = 0; tempBinIndex < this.numberOfRowsProperty.get() + 1; tempBinIndex++) {
      tempBins[tempBinIndex] = 0;
    }

    // determines probability of balls falling through galton board
    for (let ballIndex = 0; ballIndex < ballsOnScreen; ballIndex++) {
      let columnNumber = 0;
      // the path of the balls through the pegs of the galton board  is determined for the prepopulated balls only
      for (let rowNumber = 0; rowNumber <= this.numberOfRowsProperty.get(); rowNumber++) {
        const direction = dotRandom.nextBoolean() ? 'left' : 'right';

        // increment the column number of the next row, but not for the last row
        if (rowNumber < this.numberOfRowsProperty.get()) {
          columnNumber += direction === 'left' ? 0 : 1;
        }
      }
      // updates the binCount of a bin at a specific index
      tempBins[columnNumber]++;
    }

    // takes values in temporary bin array and translates them into our bin array
    for (let tempBinIndex = 0; tempBinIndex < this.numberOfRowsProperty.get() + 1; tempBinIndex++) {
      this.bins[tempBinIndex] = {
        binCount: tempBins[tempBinIndex],
        // number of balls that will be in the bin (including those currently falling through the galton board)
        visibleBinCount: tempBins[tempBinIndex],
        // number of balls that are in the bin
        orientation: 0 // 0 is center, 1 is right, -1 is left
      };
    }

    // now we update the view and generate our statistics
    this.initializeStatistics();
    this.histogramUpdatedEmitter.emit();
  }

  /**
   * Sets the value of all bins in the histogram to zero.
   *
   * @private
   */
  setBinsToZero() {
    this.bins = []; // reset the bin array to an empty array
    let binInfo;
    const maxBins = PlinkoProbabilityConstants.ROWS_RANGE.max + 1;
    for (let i = 0; i < maxBins; i++) {
      binInfo = {
        binCount: 0,
        // number of balls that will be in the bin (including those currently falling through the galton board)
        visibleBinCount: 0,
        // number of balls that are in the bin
        orientation: 0 // 0 is center, 1 is right, -1 is left
      };

      this.bins.push(binInfo);
    }
  }

  /**
   * Updates the array elements for the number of balls in a bin and the horizontal final position of the last ball.
   *
   * @param {Ball} ball
   * @public
   */
  updateBinCountAndOrientation(ball) {
    this.bins[ball.binIndex].binCount++;
    this.bins[ball.binIndex].orientation = ball.binOrientation;
  }

  /**
   * Update the histogram statistic due to adding one ball in bin 'binIndex'
   *
   * @param {number} binIndex - the bin index associated with the landed ball.
   * @private
   */
  updateStatistics(binIndex) {
    this.landedBallsNumber++;

    // convenience variable
    const N = this.landedBallsNumber;
    this.average = ((N - 1) * this.average + binIndex) / N;
    this.sumOfSquares += binIndex * binIndex;

    // the variance and standard deviations exist only when the number of balls is larger than 1
    if (N > 1) {
      this.variance = (this.sumOfSquares - N * this.average * this.average) / (N - 1);
      this.standardDeviation = Math.sqrt(this.variance);
      this.standardDeviationOfMean = this.standardDeviation / Math.sqrt(N);
    } else {
      this.variance = 0;
      this.standardDeviation = 0;
      this.standardDeviationOfMean = 0;
    }
  }

  /**
   * Initializes statistics based on what's in the bins.
   * @private
   */
  initializeStatistics() {
    let totalNumberOfBalls = 0;
    let sum = 0;
    let sumOfSquares = 0;
    this.bins.forEach((bin, binIndex) => {
      totalNumberOfBalls += bin.binCount;
      sum += bin.binCount * binIndex;
      sumOfSquares += bin.binCount * binIndex * binIndex;
    });
    this.sumOfSquares = sumOfSquares;
    this.landedBallsNumber = totalNumberOfBalls;
    this.average = sum / totalNumberOfBalls;
    this.variance = (sumOfSquares - this.average * this.average * totalNumberOfBalls) / (totalNumberOfBalls - 1);
    this.standardDeviation = Math.sqrt(this.variance);
    this.standardDeviationOfMean = this.standardDeviation / Math.sqrt(totalNumberOfBalls);
  }

  /**
   * Resets all the statistics data to zero
   *
   * @private
   */
  resetStatistics() {
    this.landedBallsNumber = 0;
    this.average = 0;
    this.sumOfSquares = 0;
    this.variance = 0;
    this.standardDeviation = 0;
    this.standardDeviationOfMean = 0;
  }

  /**
   * Add an additional ball to the appropriate bin and update all the relevant statistics
   *
   * @param {Ball} ball
   * @public
   */
  addBallToHistogram(ball) {
    this.bins[ball.binIndex].visibleBinCount++;
    this.updateStatistics(ball.binIndex);
    this.histogramUpdatedEmitter.emit();
  }

  /**
   * Function that returns the number of counts in a bin
   * The count is a non-negative integer
   *
   * @param {number} binIndex
   * @returns {number}
   * @public
   */
  getBinCount(binIndex) {
    return this.bins[binIndex].visibleBinCount; // an integer
  }

  /**
   * Function that returns the fractional occupation of a bin
   * The fraction is smaller than one but the sum of all fractions add up to one
   *
   * @param {number} binIndex - an integer
   * @returns {number}
   * @public
   */
  getFractionalBinCount(binIndex) {
    if (this.landedBallsNumber > 0) {
      return this.bins[binIndex].visibleBinCount / this.landedBallsNumber; // fraction is smaller than one
    } else {
      // no balls are present
      return 0;
    }
  }

  /**
   * Function that returns an array of the fractional 'normalized 'occupation of a bin, i.e.
   * the fractional normalized account is done with respect to the bin with the largest count
   * Hence at least one element of the array will return a value of 1 (unless the array is completely
   * filled with zeros in which case it returns an array of zeros)
   *
   * @returns {Array.<number>}
   * @public
   */
  getNormalizedSampleDistribution() {
    const maxCount = this.getMaximumBinCount();
    // we don't want to divide by zero; if maxCount is zero, then bin.visibleCount is zero anyway.
    const divisionFactor = Math.max(maxCount, 1);
    const normalizedArray = this.bins.map(bin => bin.visibleBinCount / divisionFactor);
    return normalizedArray;
  }

  /**
   * Function that returns the maximum value of all the balls in the bins
   * This includes the balls that still traveling through the GaltonBoard
   *
   * @returns {number}
   * @public
   */
  getMaximumActualBinCount() {
    let maxCount = 0;
    this.bins.forEach(binElement => {
      maxCount = Math.max(maxCount, binElement.binCount);
    });
    return maxCount;
  }

  /**
   * Function that returns the maximum visible value of the balls in the bins
   * This does not include the balls that are still traveling through the GaltonBoard
   *
   * @returns {number}
   * @public
   */
  getMaximumBinCount() {
    let maxCount = 0;
    this.bins.forEach(binElement => {
      maxCount = Math.max(maxCount, binElement.visibleBinCount);
    });
    return maxCount;
  }

  /**
   * Function that returns the center x coordinate of a bin with index binIndex
   *
   * @param {number} binIndex - index associated with the bin, the index may range from 0 to numberOfBins-1
   * @param {number} numberOfBins - the number of bins on the screen
   * @returns {number}
   * @public
   */
  getBinCenterX(binIndex, numberOfBins) {
    assert && assert(binIndex < numberOfBins, 'The binIndex must be smaller than the total number of bins');
    return (binIndex + 1 / 2) / numberOfBins * BOUNDS.width + BOUNDS.minX;
  }

  /**
   * Function that returns the left position of a bin
   *
   * @param {number} binIndex
   * @param {number} numberOfBins - the number of bins on the screen
   * @returns {number}
   * @public
   */
  getBinLeft(binIndex, numberOfBins) {
    assert && assert(binIndex < numberOfBins, 'The binIndex must be smaller than the total number of bins');
    return binIndex / numberOfBins * BOUNDS.width + BOUNDS.minX;
  }

  /**
   * Function that returns the minimum X value, i.e. the leftmost position of all the bins
   *
   * @returns {number}
   * @public
   */
  getMinX() {
    return BOUNDS.minX;
  }

  /**
   * Function that returns the center X value of the bins, i.e. the center position of all the bins
   *
   * @returns {number}
   * @public
   */
  getCenterX() {
    return BOUNDS.centerX;
  }

  /**
   * Function that returns the minimum Y value, i.e. the bottom position of all the bins
   *
   * @public
   * @returns {number}
   */
  getMinY() {
    return BOUNDS.minY;
  }

  /**
   * Function that returns the x position (in model coordinates) associated with
   * the average (mean) value of the histogram.
   *
   * @param {number} value
   * @param {number} numberOfBins - the number of bins on the screen
   * @returns {number}
   * @public
   */
  getValuePosition(value, numberOfBins) {
    assert && assert(value < numberOfBins && value >= 0, 'the average should range from 0 and the max number of bins -1');
    return (value + 1 / 2) / numberOfBins * BOUNDS.width + BOUNDS.minX;
  }
}
plinkoProbability.register('Histogram', Histogram);
export default Histogram;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwiZG90UmFuZG9tIiwicGxpbmtvUHJvYmFiaWxpdHkiLCJQbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cyIsIkJPVU5EUyIsIkhJU1RPR1JBTV9CT1VORFMiLCJIaXN0b2dyYW0iLCJjb25zdHJ1Y3RvciIsIm51bWJlck9mUm93c1Byb3BlcnR5IiwiYmlucyIsImF2ZXJhZ2UiLCJzdGFuZGFyZERldmlhdGlvbiIsInN0YW5kYXJkRGV2aWF0aW9uT2ZNZWFuIiwibGFuZGVkQmFsbHNOdW1iZXIiLCJzdW1PZlNxdWFyZXMiLCJ2YXJpYW5jZSIsInNldEJpbnNUb1plcm8iLCJoaXN0b2dyYW1VcGRhdGVkRW1pdHRlciIsImxpbmsiLCJyZXNldCIsInJlc2V0U3RhdGlzdGljcyIsImVtaXQiLCJwcmVwb3B1bGF0ZSIsImJhbGxzT25TY3JlZW4iLCJ0ZW1wQmlucyIsInRlbXBCaW5JbmRleCIsImdldCIsImJhbGxJbmRleCIsImNvbHVtbk51bWJlciIsInJvd051bWJlciIsImRpcmVjdGlvbiIsIm5leHRCb29sZWFuIiwiYmluQ291bnQiLCJ2aXNpYmxlQmluQ291bnQiLCJvcmllbnRhdGlvbiIsImluaXRpYWxpemVTdGF0aXN0aWNzIiwiYmluSW5mbyIsIm1heEJpbnMiLCJST1dTX1JBTkdFIiwibWF4IiwiaSIsInB1c2giLCJ1cGRhdGVCaW5Db3VudEFuZE9yaWVudGF0aW9uIiwiYmFsbCIsImJpbkluZGV4IiwiYmluT3JpZW50YXRpb24iLCJ1cGRhdGVTdGF0aXN0aWNzIiwiTiIsIk1hdGgiLCJzcXJ0IiwidG90YWxOdW1iZXJPZkJhbGxzIiwic3VtIiwiZm9yRWFjaCIsImJpbiIsImFkZEJhbGxUb0hpc3RvZ3JhbSIsImdldEJpbkNvdW50IiwiZ2V0RnJhY3Rpb25hbEJpbkNvdW50IiwiZ2V0Tm9ybWFsaXplZFNhbXBsZURpc3RyaWJ1dGlvbiIsIm1heENvdW50IiwiZ2V0TWF4aW11bUJpbkNvdW50IiwiZGl2aXNpb25GYWN0b3IiLCJub3JtYWxpemVkQXJyYXkiLCJtYXAiLCJnZXRNYXhpbXVtQWN0dWFsQmluQ291bnQiLCJiaW5FbGVtZW50IiwiZ2V0QmluQ2VudGVyWCIsIm51bWJlck9mQmlucyIsImFzc2VydCIsIndpZHRoIiwibWluWCIsImdldEJpbkxlZnQiLCJnZXRNaW5YIiwiZ2V0Q2VudGVyWCIsImNlbnRlclgiLCJnZXRNaW5ZIiwibWluWSIsImdldFZhbHVlUG9zaXRpb24iLCJ2YWx1ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSGlzdG9ncmFtLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIG9mIGEgaGlzdG9ncmFtIHRoYXQga2VlcHMgdHJhY2sgb2YgdGhlIG51bWJlciBvZiBjb3VudHMgaW4gZWFjaCBiaW5cclxuICogYW5kIHNvbWUgYXNzb2NpYXRlZCBzdGF0aXN0aWNzXHJcbiAqXHJcbiAqIEBhdXRob3IgTWFydGluIFZlaWxsZXR0ZSAoQmVyZWEgQ29sbGVnZSlcclxuICovXHJcblxyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgcGxpbmtvUHJvYmFiaWxpdHkgZnJvbSAnLi4vLi4vcGxpbmtvUHJvYmFiaWxpdHkuanMnO1xyXG5pbXBvcnQgUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMgZnJvbSAnLi4vUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEJPVU5EUyA9IFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzLkhJU1RPR1JBTV9CT1VORFM7XHJcblxyXG5jbGFzcyBIaXN0b2dyYW0ge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IG51bWJlck9mUm93c1Byb3BlcnR5XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG51bWJlck9mUm93c1Byb3BlcnR5ICkge1xyXG5cclxuICAgIHRoaXMuYmlucyA9IFtdOyAvLyBAcHVibGljIHtPYmplY3RbXX1cclxuICAgIHRoaXMuYXZlcmFnZSA9IDA7IC8vIEBwdWJsaWMgKHJlYWQtb25seSlcclxuICAgIHRoaXMuc3RhbmRhcmREZXZpYXRpb24gPSAwOyAvLyBAcHVibGljIChyZWFkLW9ubHkpXHJcbiAgICB0aGlzLnN0YW5kYXJkRGV2aWF0aW9uT2ZNZWFuID0gMDsgLy8gQHB1YmxpYyAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy5sYW5kZWRCYWxsc051bWJlciA9IDA7IC8vIEBwdWJsaWMgKHJlYWQtb25seSlcclxuXHJcbiAgICAvLyBjb252ZW5pZW5jZSB2YXJpYWJsZXNcclxuICAgIHRoaXMuc3VtT2ZTcXVhcmVzID0gMDsgLy8gQHByaXZhdGVcclxuICAgIHRoaXMudmFyaWFuY2UgPSAwOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5udW1iZXJPZlJvd3NQcm9wZXJ0eSA9IG51bWJlck9mUm93c1Byb3BlcnR5OyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIC8vIGluaXRpYWxpemVkIGFsbCB0aGUgYmlucyB0byB6ZXJvLlxyXG4gICAgdGhpcy5zZXRCaW5zVG9aZXJvKCk7XHJcblxyXG4gICAgLy8gZW1pdHRlcnM7XHJcbiAgICB0aGlzLmhpc3RvZ3JhbVVwZGF0ZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTsgLy8gQHB1YmxpY1xyXG5cclxuICAgIC8vIGxpbmsgaXMgcHJlc2VudCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW1cclxuICAgIG51bWJlck9mUm93c1Byb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgdGhpcy5yZXNldCgpOyAvLyBpZiB0aGUgbnVtYmVyIG9mIHJvd3MgY2hhbmdlIHRoZW4gcmVzZXQgdGhlIGhpc3RvZ3JhbVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIHNldHMgYWxsIHRoZSBiaW5Db3VudHMgdG8gMCBhbmQgcmVzZXRzIHRoZSBzdGF0aXN0aWNzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5zZXRCaW5zVG9aZXJvKCk7XHJcbiAgICB0aGlzLnJlc2V0U3RhdGlzdGljcygpO1xyXG4gICAgdGhpcy5oaXN0b2dyYW1VcGRhdGVkRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVc2VkIGluIHRoZSBcImJhbGxzT25TY3JlZW5cIiBxdWVyeSBwYXJhbWV0ZXIgdG8gc2V0IGFuIGluaXRpYWwgYW1vdW50IG9mIGJhbGxzIHdpdGhpbiB0aGUgaGlzdG9ncmFtLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGJhbGxzT25TY3JlZW4ge251bWJlcn0gLSB1c2VyIGlucHV0dGVkIHF1ZXJ5IHBhcmFtZXRlciBmb3IgdGhlIGFtb3VudCBvZiBiYWxscyB0aGUgaGlzdG9ncmFtIGlzIGluaXRpYWxpemVkIHdpdGhcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcHJlcG9wdWxhdGUoIGJhbGxzT25TY3JlZW4gKSB7XHJcblxyXG4gICAgLy8gdGVtcG9yYXJpbHkgc3RvcmVzIHRoZSBiaW5Db3VudCBmb3IgZWFjaCBiaW4gaW4gYW4gZW1wdHkgYXJyYXkuXHJcbiAgICBjb25zdCB0ZW1wQmlucyA9IFtdO1xyXG4gICAgZm9yICggbGV0IHRlbXBCaW5JbmRleCA9IDA7IHRlbXBCaW5JbmRleCA8ICggdGhpcy5udW1iZXJPZlJvd3NQcm9wZXJ0eS5nZXQoKSArIDEgKTsgdGVtcEJpbkluZGV4KysgKSB7XHJcbiAgICAgIHRlbXBCaW5zWyB0ZW1wQmluSW5kZXggXSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZGV0ZXJtaW5lcyBwcm9iYWJpbGl0eSBvZiBiYWxscyBmYWxsaW5nIHRocm91Z2ggZ2FsdG9uIGJvYXJkXHJcbiAgICBmb3IgKCBsZXQgYmFsbEluZGV4ID0gMDsgYmFsbEluZGV4IDwgYmFsbHNPblNjcmVlbjsgYmFsbEluZGV4KysgKSB7XHJcbiAgICAgIGxldCBjb2x1bW5OdW1iZXIgPSAwO1xyXG4gICAgICAvLyB0aGUgcGF0aCBvZiB0aGUgYmFsbHMgdGhyb3VnaCB0aGUgcGVncyBvZiB0aGUgZ2FsdG9uIGJvYXJkICBpcyBkZXRlcm1pbmVkIGZvciB0aGUgcHJlcG9wdWxhdGVkIGJhbGxzIG9ubHlcclxuICAgICAgZm9yICggbGV0IHJvd051bWJlciA9IDA7IHJvd051bWJlciA8PSB0aGlzLm51bWJlck9mUm93c1Byb3BlcnR5LmdldCgpOyByb3dOdW1iZXIrKyApIHtcclxuICAgICAgICBjb25zdCBkaXJlY3Rpb24gPSAoIGRvdFJhbmRvbS5uZXh0Qm9vbGVhbigpID8gJ2xlZnQnIDogJ3JpZ2h0JyApO1xyXG5cclxuICAgICAgICAvLyBpbmNyZW1lbnQgdGhlIGNvbHVtbiBudW1iZXIgb2YgdGhlIG5leHQgcm93LCBidXQgbm90IGZvciB0aGUgbGFzdCByb3dcclxuICAgICAgICBpZiAoIHJvd051bWJlciA8IHRoaXMubnVtYmVyT2ZSb3dzUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgICAgICBjb2x1bW5OdW1iZXIgKz0gKCBkaXJlY3Rpb24gPT09ICdsZWZ0JyApID8gMCA6IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIC8vIHVwZGF0ZXMgdGhlIGJpbkNvdW50IG9mIGEgYmluIGF0IGEgc3BlY2lmaWMgaW5kZXhcclxuICAgICAgdGVtcEJpbnNbIGNvbHVtbk51bWJlciBdKys7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIHRha2VzIHZhbHVlcyBpbiB0ZW1wb3JhcnkgYmluIGFycmF5IGFuZCB0cmFuc2xhdGVzIHRoZW0gaW50byBvdXIgYmluIGFycmF5XHJcbiAgICBmb3IgKCBsZXQgdGVtcEJpbkluZGV4ID0gMDsgdGVtcEJpbkluZGV4IDwgKCB0aGlzLm51bWJlck9mUm93c1Byb3BlcnR5LmdldCgpICsgMSApOyB0ZW1wQmluSW5kZXgrKyApIHtcclxuICAgICAgdGhpcy5iaW5zWyB0ZW1wQmluSW5kZXggXSA9IHtcclxuICAgICAgICBiaW5Db3VudDogdGVtcEJpbnNbIHRlbXBCaW5JbmRleCBdLCAvLyBudW1iZXIgb2YgYmFsbHMgdGhhdCB3aWxsIGJlIGluIHRoZSBiaW4gKGluY2x1ZGluZyB0aG9zZSBjdXJyZW50bHkgZmFsbGluZyB0aHJvdWdoIHRoZSBnYWx0b24gYm9hcmQpXHJcbiAgICAgICAgdmlzaWJsZUJpbkNvdW50OiB0ZW1wQmluc1sgdGVtcEJpbkluZGV4IF0sIC8vIG51bWJlciBvZiBiYWxscyB0aGF0IGFyZSBpbiB0aGUgYmluXHJcbiAgICAgICAgb3JpZW50YXRpb246IDAgLy8gMCBpcyBjZW50ZXIsIDEgaXMgcmlnaHQsIC0xIGlzIGxlZnRcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBub3cgd2UgdXBkYXRlIHRoZSB2aWV3IGFuZCBnZW5lcmF0ZSBvdXIgc3RhdGlzdGljc1xyXG4gICAgdGhpcy5pbml0aWFsaXplU3RhdGlzdGljcygpO1xyXG4gICAgdGhpcy5oaXN0b2dyYW1VcGRhdGVkRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBhbGwgYmlucyBpbiB0aGUgaGlzdG9ncmFtIHRvIHplcm8uXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHNldEJpbnNUb1plcm8oKSB7XHJcbiAgICB0aGlzLmJpbnMgPSBbXTsgLy8gcmVzZXQgdGhlIGJpbiBhcnJheSB0byBhbiBlbXB0eSBhcnJheVxyXG4gICAgbGV0IGJpbkluZm87XHJcbiAgICBjb25zdCBtYXhCaW5zID0gUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuUk9XU19SQU5HRS5tYXggKyAxO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbWF4QmluczsgaSsrICkge1xyXG4gICAgICBiaW5JbmZvID0ge1xyXG4gICAgICAgIGJpbkNvdW50OiAwLCAvLyBudW1iZXIgb2YgYmFsbHMgdGhhdCB3aWxsIGJlIGluIHRoZSBiaW4gKGluY2x1ZGluZyB0aG9zZSBjdXJyZW50bHkgZmFsbGluZyB0aHJvdWdoIHRoZSBnYWx0b24gYm9hcmQpXHJcbiAgICAgICAgdmlzaWJsZUJpbkNvdW50OiAwLCAvLyBudW1iZXIgb2YgYmFsbHMgdGhhdCBhcmUgaW4gdGhlIGJpblxyXG4gICAgICAgIG9yaWVudGF0aW9uOiAwIC8vIDAgaXMgY2VudGVyLCAxIGlzIHJpZ2h0LCAtMSBpcyBsZWZ0XHJcbiAgICAgIH07XHJcbiAgICAgIHRoaXMuYmlucy5wdXNoKCBiaW5JbmZvICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSBhcnJheSBlbGVtZW50cyBmb3IgdGhlIG51bWJlciBvZiBiYWxscyBpbiBhIGJpbiBhbmQgdGhlIGhvcml6b250YWwgZmluYWwgcG9zaXRpb24gb2YgdGhlIGxhc3QgYmFsbC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QmFsbH0gYmFsbFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICB1cGRhdGVCaW5Db3VudEFuZE9yaWVudGF0aW9uKCBiYWxsICkge1xyXG4gICAgdGhpcy5iaW5zWyBiYWxsLmJpbkluZGV4IF0uYmluQ291bnQrKztcclxuICAgIHRoaXMuYmluc1sgYmFsbC5iaW5JbmRleCBdLm9yaWVudGF0aW9uID0gYmFsbC5iaW5PcmllbnRhdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgaGlzdG9ncmFtIHN0YXRpc3RpYyBkdWUgdG8gYWRkaW5nIG9uZSBiYWxsIGluIGJpbiAnYmluSW5kZXgnXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYmluSW5kZXggLSB0aGUgYmluIGluZGV4IGFzc29jaWF0ZWQgd2l0aCB0aGUgbGFuZGVkIGJhbGwuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVTdGF0aXN0aWNzKCBiaW5JbmRleCApIHtcclxuICAgIHRoaXMubGFuZGVkQmFsbHNOdW1iZXIrKztcclxuXHJcbiAgICAvLyBjb252ZW5pZW5jZSB2YXJpYWJsZVxyXG4gICAgY29uc3QgTiA9IHRoaXMubGFuZGVkQmFsbHNOdW1iZXI7XHJcblxyXG4gICAgdGhpcy5hdmVyYWdlID0gKCAoIE4gLSAxICkgKiB0aGlzLmF2ZXJhZ2UgKyBiaW5JbmRleCApIC8gTjtcclxuICAgIHRoaXMuc3VtT2ZTcXVhcmVzICs9IGJpbkluZGV4ICogYmluSW5kZXg7XHJcblxyXG4gICAgLy8gdGhlIHZhcmlhbmNlIGFuZCBzdGFuZGFyZCBkZXZpYXRpb25zIGV4aXN0IG9ubHkgd2hlbiB0aGUgbnVtYmVyIG9mIGJhbGxzIGlzIGxhcmdlciB0aGFuIDFcclxuICAgIGlmICggTiA+IDEgKSB7XHJcbiAgICAgIHRoaXMudmFyaWFuY2UgPSAoIHRoaXMuc3VtT2ZTcXVhcmVzIC0gTiAqIHRoaXMuYXZlcmFnZSAqIHRoaXMuYXZlcmFnZSApIC8gKCBOIC0gMSApO1xyXG4gICAgICB0aGlzLnN0YW5kYXJkRGV2aWF0aW9uID0gTWF0aC5zcXJ0KCB0aGlzLnZhcmlhbmNlICk7XHJcbiAgICAgIHRoaXMuc3RhbmRhcmREZXZpYXRpb25PZk1lYW4gPSB0aGlzLnN0YW5kYXJkRGV2aWF0aW9uIC8gTWF0aC5zcXJ0KCBOICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy52YXJpYW5jZSA9IDA7XHJcbiAgICAgIHRoaXMuc3RhbmRhcmREZXZpYXRpb24gPSAwO1xyXG4gICAgICB0aGlzLnN0YW5kYXJkRGV2aWF0aW9uT2ZNZWFuID0gMDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIHN0YXRpc3RpY3MgYmFzZWQgb24gd2hhdCdzIGluIHRoZSBiaW5zLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZVN0YXRpc3RpY3MoKSB7XHJcblxyXG4gICAgbGV0IHRvdGFsTnVtYmVyT2ZCYWxscyA9IDA7XHJcbiAgICBsZXQgc3VtID0gMDtcclxuICAgIGxldCBzdW1PZlNxdWFyZXMgPSAwO1xyXG5cclxuICAgIHRoaXMuYmlucy5mb3JFYWNoKCAoIGJpbiwgYmluSW5kZXggKSA9PiB7XHJcbiAgICAgIHRvdGFsTnVtYmVyT2ZCYWxscyArPSBiaW4uYmluQ291bnQ7XHJcbiAgICAgIHN1bSArPSBiaW4uYmluQ291bnQgKiBiaW5JbmRleDtcclxuICAgICAgc3VtT2ZTcXVhcmVzICs9IGJpbi5iaW5Db3VudCAqIGJpbkluZGV4ICogYmluSW5kZXg7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zdW1PZlNxdWFyZXMgPSBzdW1PZlNxdWFyZXM7XHJcbiAgICB0aGlzLmxhbmRlZEJhbGxzTnVtYmVyID0gdG90YWxOdW1iZXJPZkJhbGxzO1xyXG4gICAgdGhpcy5hdmVyYWdlID0gc3VtIC8gdG90YWxOdW1iZXJPZkJhbGxzO1xyXG4gICAgdGhpcy52YXJpYW5jZSA9ICggc3VtT2ZTcXVhcmVzIC0gKCB0aGlzLmF2ZXJhZ2UgKiB0aGlzLmF2ZXJhZ2UgKiB0b3RhbE51bWJlck9mQmFsbHMgKSApIC8gKCB0b3RhbE51bWJlck9mQmFsbHMgLSAxICk7XHJcbiAgICB0aGlzLnN0YW5kYXJkRGV2aWF0aW9uID0gTWF0aC5zcXJ0KCB0aGlzLnZhcmlhbmNlICk7XHJcbiAgICB0aGlzLnN0YW5kYXJkRGV2aWF0aW9uT2ZNZWFuID0gdGhpcy5zdGFuZGFyZERldmlhdGlvbiAvIE1hdGguc3FydCggdG90YWxOdW1iZXJPZkJhbGxzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgYWxsIHRoZSBzdGF0aXN0aWNzIGRhdGEgdG8gemVyb1xyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICByZXNldFN0YXRpc3RpY3MoKSB7XHJcbiAgICB0aGlzLmxhbmRlZEJhbGxzTnVtYmVyID0gMDtcclxuICAgIHRoaXMuYXZlcmFnZSA9IDA7XHJcbiAgICB0aGlzLnN1bU9mU3F1YXJlcyA9IDA7XHJcbiAgICB0aGlzLnZhcmlhbmNlID0gMDtcclxuICAgIHRoaXMuc3RhbmRhcmREZXZpYXRpb24gPSAwO1xyXG4gICAgdGhpcy5zdGFuZGFyZERldmlhdGlvbk9mTWVhbiA9IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYW4gYWRkaXRpb25hbCBiYWxsIHRvIHRoZSBhcHByb3ByaWF0ZSBiaW4gYW5kIHVwZGF0ZSBhbGwgdGhlIHJlbGV2YW50IHN0YXRpc3RpY3NcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QmFsbH0gYmFsbFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhZGRCYWxsVG9IaXN0b2dyYW0oIGJhbGwgKSB7XHJcbiAgICB0aGlzLmJpbnNbIGJhbGwuYmluSW5kZXggXS52aXNpYmxlQmluQ291bnQrKztcclxuICAgIHRoaXMudXBkYXRlU3RhdGlzdGljcyggYmFsbC5iaW5JbmRleCApO1xyXG4gICAgdGhpcy5oaXN0b2dyYW1VcGRhdGVkRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIG51bWJlciBvZiBjb3VudHMgaW4gYSBiaW5cclxuICAgKiBUaGUgY291bnQgaXMgYSBub24tbmVnYXRpdmUgaW50ZWdlclxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJpbkluZGV4XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0QmluQ291bnQoIGJpbkluZGV4ICkge1xyXG4gICAgcmV0dXJuIHRoaXMuYmluc1sgYmluSW5kZXggXS52aXNpYmxlQmluQ291bnQ7IC8vIGFuIGludGVnZXJcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgZnJhY3Rpb25hbCBvY2N1cGF0aW9uIG9mIGEgYmluXHJcbiAgICogVGhlIGZyYWN0aW9uIGlzIHNtYWxsZXIgdGhhbiBvbmUgYnV0IHRoZSBzdW0gb2YgYWxsIGZyYWN0aW9ucyBhZGQgdXAgdG8gb25lXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYmluSW5kZXggLSBhbiBpbnRlZ2VyXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0RnJhY3Rpb25hbEJpbkNvdW50KCBiaW5JbmRleCApIHtcclxuICAgIGlmICggdGhpcy5sYW5kZWRCYWxsc051bWJlciA+IDAgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmJpbnNbIGJpbkluZGV4IF0udmlzaWJsZUJpbkNvdW50IC8gdGhpcy5sYW5kZWRCYWxsc051bWJlcjsgLy8gZnJhY3Rpb24gaXMgc21hbGxlciB0aGFuIG9uZVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIG5vIGJhbGxzIGFyZSBwcmVzZW50XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGFycmF5IG9mIHRoZSBmcmFjdGlvbmFsICdub3JtYWxpemVkICdvY2N1cGF0aW9uIG9mIGEgYmluLCBpLmUuXHJcbiAgICogdGhlIGZyYWN0aW9uYWwgbm9ybWFsaXplZCBhY2NvdW50IGlzIGRvbmUgd2l0aCByZXNwZWN0IHRvIHRoZSBiaW4gd2l0aCB0aGUgbGFyZ2VzdCBjb3VudFxyXG4gICAqIEhlbmNlIGF0IGxlYXN0IG9uZSBlbGVtZW50IG9mIHRoZSBhcnJheSB3aWxsIHJldHVybiBhIHZhbHVlIG9mIDEgKHVubGVzcyB0aGUgYXJyYXkgaXMgY29tcGxldGVseVxyXG4gICAqIGZpbGxlZCB3aXRoIHplcm9zIGluIHdoaWNoIGNhc2UgaXQgcmV0dXJucyBhbiBhcnJheSBvZiB6ZXJvcylcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48bnVtYmVyPn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0Tm9ybWFsaXplZFNhbXBsZURpc3RyaWJ1dGlvbigpIHtcclxuICAgIGNvbnN0IG1heENvdW50ID0gdGhpcy5nZXRNYXhpbXVtQmluQ291bnQoKTtcclxuICAgIC8vIHdlIGRvbid0IHdhbnQgdG8gZGl2aWRlIGJ5IHplcm87IGlmIG1heENvdW50IGlzIHplcm8sIHRoZW4gYmluLnZpc2libGVDb3VudCBpcyB6ZXJvIGFueXdheS5cclxuICAgIGNvbnN0IGRpdmlzaW9uRmFjdG9yID0gTWF0aC5tYXgoIG1heENvdW50LCAxICk7XHJcbiAgICBjb25zdCBub3JtYWxpemVkQXJyYXkgPSB0aGlzLmJpbnMubWFwKCBiaW4gPT4gYmluLnZpc2libGVCaW5Db3VudCAvIGRpdmlzaW9uRmFjdG9yICk7XHJcbiAgICByZXR1cm4gbm9ybWFsaXplZEFycmF5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBtYXhpbXVtIHZhbHVlIG9mIGFsbCB0aGUgYmFsbHMgaW4gdGhlIGJpbnNcclxuICAgKiBUaGlzIGluY2x1ZGVzIHRoZSBiYWxscyB0aGF0IHN0aWxsIHRyYXZlbGluZyB0aHJvdWdoIHRoZSBHYWx0b25Cb2FyZFxyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TWF4aW11bUFjdHVhbEJpbkNvdW50KCkge1xyXG4gICAgbGV0IG1heENvdW50ID0gMDtcclxuICAgIHRoaXMuYmlucy5mb3JFYWNoKCBiaW5FbGVtZW50ID0+IHtcclxuICAgICAgbWF4Q291bnQgPSBNYXRoLm1heCggbWF4Q291bnQsIGJpbkVsZW1lbnQuYmluQ291bnQgKTtcclxuICAgIH0gKTtcclxuICAgIHJldHVybiBtYXhDb3VudDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgbWF4aW11bSB2aXNpYmxlIHZhbHVlIG9mIHRoZSBiYWxscyBpbiB0aGUgYmluc1xyXG4gICAqIFRoaXMgZG9lcyBub3QgaW5jbHVkZSB0aGUgYmFsbHMgdGhhdCBhcmUgc3RpbGwgdHJhdmVsaW5nIHRocm91Z2ggdGhlIEdhbHRvbkJvYXJkXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRNYXhpbXVtQmluQ291bnQoKSB7XHJcbiAgICBsZXQgbWF4Q291bnQgPSAwO1xyXG4gICAgdGhpcy5iaW5zLmZvckVhY2goIGJpbkVsZW1lbnQgPT4ge1xyXG4gICAgICBtYXhDb3VudCA9IE1hdGgubWF4KCBtYXhDb3VudCwgYmluRWxlbWVudC52aXNpYmxlQmluQ291bnQgKTtcclxuICAgIH0gKTtcclxuICAgIHJldHVybiBtYXhDb3VudDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY2VudGVyIHggY29vcmRpbmF0ZSBvZiBhIGJpbiB3aXRoIGluZGV4IGJpbkluZGV4XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYmluSW5kZXggLSBpbmRleCBhc3NvY2lhdGVkIHdpdGggdGhlIGJpbiwgdGhlIGluZGV4IG1heSByYW5nZSBmcm9tIDAgdG8gbnVtYmVyT2ZCaW5zLTFcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtYmVyT2ZCaW5zIC0gdGhlIG51bWJlciBvZiBiaW5zIG9uIHRoZSBzY3JlZW5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRCaW5DZW50ZXJYKCBiaW5JbmRleCwgbnVtYmVyT2ZCaW5zICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmluSW5kZXggPCBudW1iZXJPZkJpbnMsICdUaGUgYmluSW5kZXggbXVzdCBiZSBzbWFsbGVyIHRoYW4gdGhlIHRvdGFsIG51bWJlciBvZiBiaW5zJyApO1xyXG4gICAgcmV0dXJuICggKCBiaW5JbmRleCArIDEgLyAyICkgLyBudW1iZXJPZkJpbnMgKSAqIEJPVU5EUy53aWR0aCArIEJPVU5EUy5taW5YO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBsZWZ0IHBvc2l0aW9uIG9mIGEgYmluXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYmluSW5kZXhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtYmVyT2ZCaW5zIC0gdGhlIG51bWJlciBvZiBiaW5zIG9uIHRoZSBzY3JlZW5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRCaW5MZWZ0KCBiaW5JbmRleCwgbnVtYmVyT2ZCaW5zICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmluSW5kZXggPCBudW1iZXJPZkJpbnMsICdUaGUgYmluSW5kZXggbXVzdCBiZSBzbWFsbGVyIHRoYW4gdGhlIHRvdGFsIG51bWJlciBvZiBiaW5zJyApO1xyXG4gICAgcmV0dXJuICggYmluSW5kZXggLyBudW1iZXJPZkJpbnMgKSAqIEJPVU5EUy53aWR0aCArIEJPVU5EUy5taW5YO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBtaW5pbXVtIFggdmFsdWUsIGkuZS4gdGhlIGxlZnRtb3N0IHBvc2l0aW9uIG9mIGFsbCB0aGUgYmluc1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TWluWCgpIHtcclxuICAgIHJldHVybiBCT1VORFMubWluWDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY2VudGVyIFggdmFsdWUgb2YgdGhlIGJpbnMsIGkuZS4gdGhlIGNlbnRlciBwb3NpdGlvbiBvZiBhbGwgdGhlIGJpbnNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldENlbnRlclgoKSB7XHJcbiAgICByZXR1cm4gQk9VTkRTLmNlbnRlclg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIG1pbmltdW0gWSB2YWx1ZSwgaS5lLiB0aGUgYm90dG9tIHBvc2l0aW9uIG9mIGFsbCB0aGUgYmluc1xyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0TWluWSgpIHtcclxuICAgIHJldHVybiBCT1VORFMubWluWTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgeCBwb3NpdGlvbiAoaW4gbW9kZWwgY29vcmRpbmF0ZXMpIGFzc29jaWF0ZWQgd2l0aFxyXG4gICAqIHRoZSBhdmVyYWdlIChtZWFuKSB2YWx1ZSBvZiB0aGUgaGlzdG9ncmFtLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bWJlck9mQmlucyAtIHRoZSBudW1iZXIgb2YgYmlucyBvbiB0aGUgc2NyZWVuXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0VmFsdWVQb3NpdGlvbiggdmFsdWUsIG51bWJlck9mQmlucyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhbHVlIDwgbnVtYmVyT2ZCaW5zICYmIHZhbHVlID49IDAsICd0aGUgYXZlcmFnZSBzaG91bGQgcmFuZ2UgZnJvbSAwIGFuZCB0aGUgbWF4IG51bWJlciBvZiBiaW5zIC0xJyApO1xyXG4gICAgcmV0dXJuICggKCB2YWx1ZSArIDEgLyAyICkgLyBudW1iZXJPZkJpbnMgKSAqIEJPVU5EUy53aWR0aCArIEJPVU5EUy5taW5YO1xyXG4gIH1cclxufVxyXG5cclxucGxpbmtvUHJvYmFiaWxpdHkucmVnaXN0ZXIoICdIaXN0b2dyYW0nLCBIaXN0b2dyYW0gKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEhpc3RvZ3JhbTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsaUJBQWlCLE1BQU0sNEJBQTRCO0FBQzFELE9BQU9DLDBCQUEwQixNQUFNLGtDQUFrQzs7QUFFekU7QUFDQSxNQUFNQyxNQUFNLEdBQUdELDBCQUEwQixDQUFDRSxnQkFBZ0I7QUFFMUQsTUFBTUMsU0FBUyxDQUFDO0VBQ2Q7QUFDRjtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLG9CQUFvQixFQUFHO0lBRWxDLElBQUksQ0FBQ0MsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ2hCLElBQUksQ0FBQ0MsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLElBQUksQ0FBQ0MsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDNUIsSUFBSSxDQUFDQyx1QkFBdUIsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNsQyxJQUFJLENBQUNDLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxDQUFDOztJQUU1QjtJQUNBLElBQUksQ0FBQ0MsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3ZCLElBQUksQ0FBQ0MsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ25CLElBQUksQ0FBQ1Asb0JBQW9CLEdBQUdBLG9CQUFvQixDQUFDLENBQUM7O0lBRWxEO0lBQ0EsSUFBSSxDQUFDUSxhQUFhLENBQUMsQ0FBQzs7SUFFcEI7SUFDQSxJQUFJLENBQUNDLHVCQUF1QixHQUFHLElBQUlqQixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7O0lBRTlDO0lBQ0FRLG9CQUFvQixDQUFDVSxJQUFJLENBQUUsTUFBTTtNQUMvQixJQUFJLENBQUND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