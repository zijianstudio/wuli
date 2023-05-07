// Copyright 2020-2023, University of Colorado Boulder

/**
 * TransformedCurve is a Curve subclass for a curve that the user interacts with and manipulates, which then
 * triggers a change in the CurvePoints. It is used for f(x) (the 'original' curve) and the 'Predict' curve.
 *
 * TransformedCurve is mainly responsible for:
 *
 *   - Resetting all the points of the curve
 *   - Saving the state of the curve
 *   - Undoing the curve to its previous state
 *   - Erasing the curve by setting points to y=0
 *   - Smoothing the curve
 *   - Implementing the response algorithms that are used when the user drags on the TransformedCurve. The response is
 *     affected by the CurveManipulationMode and the 'width' of the curve-manipulation. The algorithms for curve
 *     manipulation response were adapted and improved from the flash implementation of Calculus Grapher. The methods
 *     associated with the various CurveManipulationModes are
 *     - HILL -> hill
 *     - TRIANGLE -> triangle
 *     - PEDESTAL -> pedestal
 *     - PARABOLA -> parabola
 *     - SINUSOID -> sinusoid
 *     - FREEFORM -> freeform
 *     - TILT -> tilt
 *     - SHIFT -> shift
 *
 * We should note that the TransformedCurve class is the basis of the original curve, and, therefore,
 * its first, and second derivative will be evaluated. As a result, much effort was spent creating curve manipulations
 * that yields unusually smooth curves for which their first and second derivatives are themselves smooth.
 *
 * Most curve manipulations make use of a weight function to "blend" in a curve segment into a previous curve.
 * A weight function is a mathematical device used when performing an average to give
 * some elements more "weight" or influence on the result than other elements in the same set.
 * The result of the application of a weight function is a weighted sum or weighted average.
 * A variety of weight functions ranging from Gaussian kernel, super Gaussian, mollifying functions
 * are used to create curves without cusps and discontinuities.
 *
 * TransformedCurve is created at the start and persists for the lifetime of the simulation.
 *
 * @author Martin Veillette
 */
import Vector2 from '../../../../dot/js/Vector2.js';
import calculusGrapher from '../../calculusGrapher.js';
import CalculusGrapherQueryParameters from '../CalculusGrapherQueryParameters.js';
import Curve from './Curve.js';
import optionize from '../../../../phet-core/js/optionize.js';
import CurveManipulationMode from './CurveManipulationMode.js';
import CalculusGrapherConstants from '../CalculusGrapherConstants.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import CompletePiecewiseLinearFunction from '../../../../dot/js/CompletePiecewiseLinearFunction.js'; // constants
import Tandem from '../../../../tandem/js/Tandem.js';

// constants
const EDGE_SLOPE_FACTOR = CalculusGrapherQueryParameters.edgeSlopeFactor;
const STANDARD_DEVIATION = CalculusGrapherQueryParameters.smoothingStandardDeviation;
const MAX_TILT = CalculusGrapherQueryParameters.maxTilt;
const TYPICAL_Y = CalculusGrapherConstants.TYPICAL_Y;
const WEE_WIDTH = CalculusGrapherConstants.CURVE_X_RANGE.getLength() / 40;
const UPPER_WEIGHT = 0.999; // a very large cutoff for weights
const LOWER_WEIGHT = 1e-8; // a very small number that cutoff small weight contributions.

assert && assert(UPPER_WEIGHT < 1 && UPPER_WEIGHT >= 0, `UPPER_WEIGHT must range from 0 to 1, inclusive: ${UPPER_WEIGHT}`);
assert && assert(LOWER_WEIGHT < 1 && LOWER_WEIGHT >= 0, `LOWER_WEIGHT must range from 0 to 1, inclusive: ${LOWER_WEIGHT}`);
assert && assert(LOWER_WEIGHT < UPPER_WEIGHT, 'LOWER_WEIGHT must be < UPPER_WEIGHT');
export default class TransformedCurve extends Curve {
  // Has the curve been manipulated since instantiation or the last reset call? Used by the view to show cueing arrows.

  constructor(providedOptions) {
    const options = optionize()({
      // CurveOptions
      pointsPropertyReadOnly: false
    }, providedOptions);
    super(options);
    this.wasManipulatedProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('wasManipulatedProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'Has the curve been manipulated by the student?'
    });

    // To make the sim acceptably responsive, the value of pointsProperty (an array of CurvePoint) typically does not
    // change. Instead, the CurvePoints are mutated in place, and curveChangedEmitter.emit is called when the mutation
    // is completed. An exception to this occurs in PhET-iO brand for originalCurve.pointsProperty and
    // predictCurve.pointsProperty. The value will change when using the 'Set Value' control in Studio, or the value
    // is set via the 'setValue' PhET-iO API call. And in that case, we need to explicitly call curveChangedEmitter.emit.
    // See:
    // https://github.com/phetsims/calculus-grapher/issues/90
    // https://github.com/phetsims/calculus-grapher/issues/278
    // https://github.com/phetsims/calculus-grapher/issues/309
    // https://github.com/phetsims/calculus-grapher/issues/327
    this.pointsProperty.lazyLink(() => {
      assert && assert(Tandem.PHET_IO_ENABLED, 'pointsProperty may only be set in the PhET-iO version.');
      this.curveChangedEmitter.emit();
    });
  }
  reset() {
    this.wasManipulatedProperty.reset();

    // Reset every CurvePoint to its initial state.
    this.points.forEach(point => point.reset());
    this.curveChangedEmitter.emit();
  }

  /**
   * Erases the curve by setting all the points to zero and point type to smooth.
   * Note that this method is called erase because it is invoked when the erase button is pressed.
   * We never erase a curve or dispose of the curve points in this simulation.
   */
  erase() {
    // Make erase undoable, see https://github.com/phetsims/calculus-grapher/issues/331
    this.save();

    // Set the point values to zero and smooth type.
    this.points.forEach(point => {
      point.y = 0;
      point.pointType = 'smooth';
    });

    // Signal that this Curve has changed.
    this.curveChangedEmitter.emit();
  }

  /**
   * Saves the current state (y-value and pointType) of the Points for the next undo() call.
   *
   * This method is invoked when the user starts manipulating the TransformedCurve. When the undo button is pressed,
   * the CurvePoints of the TransformedCurve will be set to their last saved state.
   */
  save() {
    // Save the current state of each CurvePoint.
    this.points.forEach(point => point.save());
  }

  /**
   * Sets the state of this CurvedPoint on this Curve to its last saved state.
   * This method is invoked when the undo button is pressed, which successively undoes the last action.
   */
  undo() {
    // Revert to the saved pointState of each CurvePoint.
    this.points.forEach(point => point.undo());

    // Signal that this Curve has changed.
    this.curveChangedEmitter.emit();
  }

  /**
   * Smooths the curve. It is called when the user presses the 'smooth' button.
   * This method uses a weighted-average algorithm for 'smoothing' a curve, using a Gaussian kernel
   * see https://en.wikipedia.org/wiki/Kernel_smoother
   */
  smooth() {
    // Saves the current values of our Points for the next undo() call.
    // Note that the current y-values are the same as the previous y-values
    // for all Points in the TransformedCurve.
    this.save();

    // Normalized Gaussian kernel that will be used in the convolution of our curve
    const normalizationFactor = 1 / (STANDARD_DEVIATION * Math.sqrt(2 * Math.PI));

    // Weighted kernel: Note that gaussianFunction(x) = gaussianFunction(-x), which we will use later on.
    const gaussianFunction = x => normalizationFactor * Math.exp(-1 / 2 * (x / STANDARD_DEVIATION) ** 2);

    // Loops through each Point of the curve and set the new y-value.
    this.points.forEach(point => {
      // Main idea: For each point we want to average its y-value with points in the local "neighborhood".
      // We will do so by summing points on the left and the right of this point with appropriate weights.

      // Flags that tracks the sum over all points of the weighted y-values.
      let totalWeight = 0;
      let weightedY = 0;

      // We start the sum with the point we want to average.
      totalWeight += gaussianFunction(0);
      weightedY += this.getClosestPointAt(point.x).lastSavedY * gaussianFunction(0);

      // We will sum the other points, ideally all of them, in practice, we use the kernel over a number of standard deviations.
      // Beyond 3 standard deviations, the kernel has a very small weight, less than 1%, so that points beyond
      // three standard deviations do not make meaningful contributions to the average.
      const numberOfStandardDeviations = 3;

      // Loops through each point on BOTH sides of the window, adding the y-value to our total in order
      // to do a symmetric sum: https://github.com/phetsims/calculus-grapher/issues/293.
      for (let dx = this.deltaX; dx <= numberOfStandardDeviations * STANDARD_DEVIATION; dx += this.deltaX) {
        // Weight of a point at a distance dx from our point of interest
        const weight = gaussianFunction(dx);

        // Add the weights (times two because we have points on the left and the right)
        totalWeight += 2 * weight;

        // Add the points lastSavedY, which was the Point's y-value before the smooth() method was called.
        weightedY += this.getClosestPointAt(point.x + dx).lastSavedY * weight + this.getClosestPointAt(point.x - dx).lastSavedY * weight;
      }

      // Set the point's new y-value to be the weighted average of all the other points.
      point.y = weightedY / totalWeight;

      // Since this is a smoothing operation, we are explicitly setting the point type to smooth (for all points), regardless
      // of their previous point type.
      point.pointType = 'smooth';
    });

    // Signals that this Curve has changed.
    this.curveChangedEmitter.emit();
  }

  /**
   * Modifies the points based on the curveManipulationMode and selected width.
   * Sets wasManipulatedProperty and notifies listeners that the Curve has changed.
   *
   * @param mode
   * @param width
   * @param position - position of cursor in model coordinates
   * @param [penultimatePosition] - last position of cursor in model coordinates, relevant only for CurveManipulationMode.FREEFORM
   * @param [antepenultimatePosition] - before last position in model coordinates, relevant only for CurveManipulationMode.FREEFORM
   */
  manipulateCurve(mode, width, position, penultimatePosition, antepenultimatePosition) {
    if (mode === CurveManipulationMode.HILL) {
      this.hill(width, position.x, position.y);
    } else if (mode === CurveManipulationMode.TRIANGLE) {
      this.triangle(width, position.x, position.y);
    } else if (mode === CurveManipulationMode.PEDESTAL) {
      this.pedestal(width, position.x, position.y);
    } else if (mode === CurveManipulationMode.PARABOLA) {
      this.parabola(width, position.x, position.y);
    } else if (mode === CurveManipulationMode.SINUSOID) {
      this.sinusoid(width, position.x, position.y);
    } else if (mode === CurveManipulationMode.FREEFORM) {
      assert && assert(penultimatePosition !== undefined && antepenultimatePosition !== undefined);
      this.freeform(position, penultimatePosition, antepenultimatePosition);
    } else if (mode === CurveManipulationMode.TILT) {
      this.tilt(position.x, position.y);
    } else if (mode === CurveManipulationMode.SHIFT) {
      this.shift(position.x, position.y);
    } else {
      throw new Error(`unsupported mode: ${mode}`);
    }

    // Note that the curve has been manipulated.
    this.wasManipulatedProperty.value = true;

    // Notify that the curve has changed.
    this.curveChangedEmitter.emit();
  }

  /**
   * Implements the HILL CurveManipulationMode.
   * Creates a smooth, continuous, and differentiable bell-shaped curve, to the passed-in peak.
   * If you call this method, you are responsible for setting wasManipulatedProperty calling curveChangedEmitter.emit().
   */
  hill(width, peakX, peakY) {
    const closestPoint = this.getClosestPointAt(peakX);
    this.points.forEach(point => {
      // Determine the weight associated with the peak
      const P = Math.exp(-Math.pow((point.x - closestPoint.x) / (width / (2 * Math.sqrt(2))), 2));
      this.updatePointValue(point, P, peakY);
      this.updatePointType(point, P);
    });
  }

  /**
   * Implements the TRIANGLE CurveManipulationMode.
   * Creates a triangle-shaped peak that is non-differentiable where it intersects with the rest of the Curve.
   * If you call this method, you are responsible for setting wasManipulatedProperty calling curveChangedEmitter.emit().
   */
  triangle(width, peakX, peakY) {
    const closestPoint = this.getClosestPointAt(peakX);

    // Amount to shift the CurvePoint closest to the passed-in peak.
    const deltaY = peakY - closestPoint.lastSavedY;

    // Set the slope coefficient such that the base of the triangle at y=0 has a 'width' equal
    // to this.curveManipulationWidth when the peak is at typicalY value
    const slope = TYPICAL_Y / (width / 2);
    const peakFunction = (deltaY, x) => {
      return peakY - Math.sign(deltaY) * slope * Math.abs(x - closestPoint.x);
    };

    // Update the y values and point types of the points
    this.iterateFunctionOverPoints(peakFunction, deltaY);

    // IterateFunctionOverPoints assumes the peakFunction is smooth, but we have a cusp at the peak of the triangle
    closestPoint.pointType = 'cusp';
    this.getClosestPointAt(peakX + this.deltaX).pointType = 'cusp';
  }

  /**
   * Implements the PEDESTAL CurveManipulationMode.
   * Creates a smooth and continuous trapezoidal-shaped curve with rounded corners.
   * If you call this method, you are responsible for setting wasManipulatedProperty calling curveChangedEmitter.emit().
   */
  pedestal(width, peakX, peakY) {
    const closestPoint = this.getClosestPointAt(peakX);

    // Super Gaussian function for centered at x-value `mu`, with min amplitude of 0 and max of 1;
    // We use the square of a Gaussian in order to have a very symmetric derivative at the edges of the pedestal
    const gaussianWeight = (x, mu) => Math.exp(-1 * ((x - mu) / EDGE_SLOPE_FACTOR) ** 4);

    // Width at the top of the pedestal: The width as defined above represents the width at the base, the plateau width
    // must therefore take into account the width of the edges.
    const plateauWidth = width - 2 * EDGE_SLOPE_FACTOR;
    assert && assert(plateauWidth > 0, 'plateau width must be positive');
    this.points.forEach(point => {
      // Weight for point transformation
      let P;

      // Condition for the plateau
      if (Math.abs(point.x - closestPoint.x) < plateauWidth / 2) {
        P = 1;
      }

      // Condition for the left of the plateau
      else if (point.x <= closestPoint.x) {
        // Gaussian weight transitions smoothly from 0 to 1 as x increases
        P = gaussianWeight(point.x, closestPoint.x - plateauWidth / 2);
      } else {
        // Point must be to the right of closestPoint
        // Gaussian weight transitions smoothly from 1 to 0 as x increases
        P = gaussianWeight(point.x, closestPoint.x + plateauWidth / 2);
      }
      this.updatePointValue(point, P, peakY);
      this.updatePointType(point, P);
    });
  }

  /**
   * Implements the PARABOLA CurveManipulationMode.
   * Creates a quadratic that is non-differentiable where it intersects with the rest of the Curve.
   * If you call this method, you are responsible for setting wasManipulatedProperty calling curveChangedEmitter.emit().
   */
  parabola(width, peakX, peakY) {
    const closestPoint = this.getClosestPointAt(peakX);

    // Amount to shift the CurvePoint closest to the passed-in peak.
    const deltaY = peakY - closestPoint.lastSavedY;

    // Will set the parabola coefficient such that the parabola at y=0 has a 'width' equal
    // to this.curveManipulationWidth when the peak is at a typicalY value
    const A = TYPICAL_Y * Math.pow(2 / width, 2);
    const peakFunction = (deltaY, x) => {
      return peakY - Math.sign(deltaY) * A * Math.pow(x - closestPoint.x, 2);
    };

    // Update the y values and point types of the points
    this.iterateFunctionOverPoints(peakFunction, deltaY);
  }

  /**
   * Implements the SINUSOID CurveManipulationMode.
   * Creates a sinusoidal wave with a varying amplitude based on the drag-position.
   * If you call this method, you are responsible for setting wasManipulatedProperty calling curveChangedEmitter.emit().
   */
  sinusoid(width, x, y) {
    const closestPoint = this.getClosestPointAt(x);

    // Wavelength associated with the sinusoidal function
    const wavelength = 2 * Math.PI * width / CalculusGrapherConstants.CURVE_MANIPULATION_WIDTH_RANGE.defaultValue;

    // Cosine function to apply to points. Cosine function passes through `position`
    const cosineFunction = x => y * Math.cos(Math.PI * 2 * (closestPoint.x - x) / wavelength);

    // Weight function that goes from 1 to 0 from highX to lowX
    // Note that the fact that it is a cosine function is happenstance
    const weightFunction = (point, highX, lowX) => Math.cos(Math.PI / 2 * (point.x - highX) / Math.abs(lowX - highX)) ** 2;

    // Base width where we apply the sinusoidal function - ideally it should be an odd multiple of half-wavelengths
    const cosineBase = 7 * (wavelength / 2);

    // Width of the transition region to the left and right - ideally should be less than a quarter wavelength
    const edgeWidth = wavelength / 8;

    //             |<---------------cosineBase-------------------->|
    //   ----------|--------------|-----------------|--------------|----------
    //          leftMin        leftMax         rightMin        rightMax
    //   ----------|--------------|-----------------|--------------|----------
    //             |<-edgeWidth-->|                 |<-edgeWidth-->|

    // Bounds to the transition regions to the right and the left for the sinusoidal function

    const cosineBaseMax = closestPoint.x + cosineBase / 2;
    const cosineBaseMin = closestPoint.x - cosineBase / 2;
    const rightMax = cosineBaseMax > this.xRange.max ? cosineBaseMax : this.getClosestPointAt(cosineBaseMax).x;
    const leftMin = cosineBaseMin < this.xRange.min ? cosineBaseMin : this.getClosestPointAt(cosineBaseMin).x;
    const rightMin = rightMax - edgeWidth;
    const leftMax = leftMin + edgeWidth;

    // Is the transition region to the left currently zero (or nearly zero)
    const isLeftRegionZero = this.isRegionZero(leftMin, leftMax);

    // Is the transition region to the right currently zero (or nearly zero)
    const isRightRegionZero = this.isRegionZero(rightMin, rightMax);
    this.points.forEach(point => {
      // Weight associated with the sinusoidal function:  0<=P<=1
      // P=1 corresponds to a pure sinusoidal function (overriding the previous function)
      // whereas P=0 gives all the weight to the initial (saved) function/curve (sinusoidal function has no effect).
      let P;
      if (point.x >= leftMax && point.x <= rightMin) {
        // In the inner region, always have a pure sinusoidal, weight of 1
        P = 1;
      } else if (point.x > leftMin && point.x < leftMax) {
        // In the outer region to the left P transitions from 0 to 1, unless it is empty, in which case it is 1
        P = isLeftRegionZero ? 1 : weightFunction(point, leftMax, leftMin);
      } else if (point.x > rightMin && point.x < rightMax) {
        // In the outer region to the right P transitions from 1 to 0, unless it is empty, in which case it is 1
        P = isRightRegionZero ? 1 : weightFunction(point, rightMin, rightMax);
      } else {
        // Outside the cosine base, the weight is zero
        P = 0;
      }

      // Assign the y value with the correct weight
      point.y = P * cosineFunction(point.x) + (1 - P) * point.lastSavedY;

      // Assign the point type
      this.updatePointType(point, P);
    });

    // If the left region was zero and within the range of the curve, then the sinusoidal function will have a kink.
    // So we must tag the cusps at the left edge of the curve in that case
    if (isLeftRegionZero && cosineBaseMin > this.xRange.min) {
      const index = this.getClosestIndexAt(leftMin);
      this.points[index].pointType = 'cusp';
      if (this.points[index + 1]) {
        this.points[index + 1].pointType = 'cusp';
      }
    }

    // If the right region was zero and within the range of the curve, then the sinusoidal function will have a kink on the right side
    // So we must tag the cusps at the right edge of the curve in that case.
    if (isRightRegionZero && cosineBaseMax < this.xRange.max) {
      const index = this.getClosestIndexAt(rightMax);
      this.points[index].pointType = 'cusp';
      if (this.points[index - 1]) {
        this.points[index - 1].pointType = 'cusp';
      }
    }
  }

  /**
   * Implements the FREEFORM CurveManipulationMode.
   * Allows the user to drag Points in the Curve to any desired position to create custom but smooth shapes.
   * This method will update the curve with the new position value. It attempts to create a smooth curve
   * between position and antepenultimatePosition. The main goal of the drawToForm method is to create a
   * curve segment that is smooth enough that it can be twice differentiable without generating discontinuities.
   * If you call this method, you are responsible for setting wasManipulatedProperty calling curveChangedEmitter.emit().
   *
   * @param position - in model coordinates
   * @param penultimatePosition - in model coordinates
   * @param antepenultimatePosition - in model coordinates
   */
  freeform(position, penultimatePosition, antepenultimatePosition) {
    // Closest point associated with the position
    const closestPoint = this.getClosestPointAt(position.x);

    // Amount to shift the CurvePoint closest to the passed-in position.
    closestPoint.y = position.y;

    // Point associated with the last drag event
    if (penultimatePosition) {
      const lastPoint = this.getClosestPointAt(penultimatePosition.x);

      // We want to create a straight line between this point and the last drag event point
      const closestVector = closestPoint.getVector();
      this.interpolate(closestVector.x, closestVector.y, lastPoint.x, penultimatePosition.y);
    } else {
      // There is no position associated with the last drag event.
      // Let's create a hill with a narrow width at the closestPoint.
      // See https://github.com/phetsims/calculus-grapher/issues/218
      this.hill(WEE_WIDTH, closestPoint.x, closestPoint.y);
    }
    if (penultimatePosition && antepenultimatePosition) {
      const lastPoint = this.getClosestPointAt(penultimatePosition.x);

      // Point associated with the last drag event
      const nextToLastPoint = this.getClosestPointAt(antepenultimatePosition.x);

      // Checks that lastPoint is in between closestPoint and nextToLastPoint
      if ((closestPoint.x - lastPoint.x) * (nextToLastPoint.x - lastPoint.x) < 0) {
        // Finds two control points that are approximately midway between our three points
        const cp1Point = this.getClosestPointAt((position.x + penultimatePosition.x) / 2);
        const cp2Point = this.getClosestPointAt((penultimatePosition.x + antepenultimatePosition.x) / 2);

        // Check that the lastPoint is between cp1 and cp2
        if ((cp1Point.x - lastPoint.x) * (cp2Point.x - lastPoint.x) < 0) {
          // x separation between two adjacent points in a curve array
          const deltaX = this.deltaX;

          // Vectors associated with the drag events.
          // Note that the x-values are the allowed CurvePoints x-values but the
          // y-values match the y value from the dragListener
          const v1 = new Vector2(nextToLastPoint.x, antepenultimatePosition.y);
          const v2 = new Vector2(lastPoint.x, penultimatePosition.y);
          const v3 = new Vector2(closestPoint.x, position.y);

          // Are we dragging from left to right?
          const isAscending = nextToLastPoint.x < closestPoint.x;
          const sortedVectors = isAscending ? [v1, v2, v3] : [v3, v2, v1];

          // Piecewise function composed of the two linear functions.
          const piecewiseFunction = new CompletePiecewiseLinearFunction(sortedVectors);

          // Distance over which we will mollify the points
          const distance = Math.abs(cp2Point.x - cp1Point.x);
          const numberSteps = distance / deltaX;

          // Are we incrementing points from right to left or left to right?
          const signedDeltaX = isAscending ? deltaX : -deltaX;

          // A function of x used that will be used to mollify the piecewise function
          const mollifierFunction = createMollifierFunction(distance);

          // Iterate over the intermediate x-values that need to be mollified.
          for (let i = 0; i < numberSteps; i++) {
            // x value of the point that needs to be mollified
            const x = cp2Point.x + i * signedDeltaX;

            // Weight of the mollifier function
            let weight = 0;

            // Weight of the piecewiseFunction
            let functionWeight = 0;

            // Apply the mollifying algorithm on the point located at x by convoluting it with nearby points
            for (let dx = -distance; dx < distance; dx += deltaX / 4) {
              weight += mollifierFunction(dx);
              functionWeight += mollifierFunction(dx) * piecewiseFunction.evaluate(x + dx);
            }
            this.getClosestPointAt(x).y = functionWeight / weight;
          }
        }
      }
    }

    // Assign type to points

    // Main idea: assign the smooth type to ALL points between penultimatePosition to position (
    // and possibly antepenultimatePosition if it exists), then come back to it by reassigning the
    // closestPoint (and its point partner ahead of the drag) to be discontinuous.

    // does penultimatePosition exist?
    if (penultimatePosition) {
      // Point associated with the last drag event
      const lastPoint = this.getClosestPointAt(penultimatePosition.x);

      // Find the index of the closestPoint and the lastPoint
      const lastPointIndex = this.getIndex(lastPoint);
      const closestPointIndex = this.getIndex(closestPoint);

      // Assign the points between the lastPoint and the closestPoint to be smooth
      let min = Math.min(closestPointIndex, lastPointIndex);
      let max = Math.max(closestPointIndex, lastPointIndex);
      for (let i = min; i <= max; i++) {
        this.points[i].pointType = 'smooth';
      }

      // Does antepenultimatePosition exist?
      if (antepenultimatePosition) {
        const nextToLastPoint = this.getClosestPointAt(antepenultimatePosition.x);

        // Find the index of the nextToLastPoint
        const nextToLastPointIndex = this.getIndex(nextToLastPoint);

        // Assign the points between the nextToLastPoint and the lastPoint to be smooth
        min = Math.min(lastPointIndex, nextToLastPointIndex);
        max = Math.max(lastPointIndex, nextToLastPointIndex);
        for (let i = min; i <= max; i++) {
          const point = this.points[i];

          // We don't want to assign the very last point as it may be discontinuous if the drag has turned
          if (point !== nextToLastPoint) {
            point.pointType = 'smooth';
          }
        }
      }

      // Assign the current drag position to be discontinuous
      closestPoint.pointType = 'discontinuous';

      // We need to figure out what is the direction of the drag, and assign the point "ahead" to be discontinuous
      if (lastPointIndex > closestPointIndex) {
        this.getClosestPointAt(closestPoint.x - this.deltaX).pointType = 'discontinuous';
      } else if (lastPointIndex < closestPointIndex) {
        this.getClosestPointAt(closestPoint.x + this.deltaX).pointType = 'discontinuous';
      }

      // We need to consider the case where the drag has turned, which can occur only if antepenultimatePosition exists
      // and the lastPoint is between the closestPoint and the nextToLastPoint

      if (antepenultimatePosition) {
        // Point associated with the last drag event
        const nextToLastPoint = this.getClosestPointAt(antepenultimatePosition.x);

        // is the lastPoint between the closestPoint and the nextToLastPoint?
        if ((closestPoint.x - lastPoint.x) * (nextToLastPoint.x - lastPoint.x) > 0) {
          // We have to assign the lastPoint to be discontinuous since the drag has turned at this point.
          lastPoint.pointType = 'discontinuous';

          // We need to figure out what was the direction of the drag, and assign the point that was "ahead" to be discontinuous
          if (lastPointIndex > closestPointIndex) {
            this.getClosestPointAt(lastPoint.x - this.deltaX).pointType = 'discontinuous';
          } else if (lastPointIndex < closestPointIndex) {
            this.getClosestPointAt(lastPoint.x + this.deltaX).pointType = 'discontinuous';
          }
        }
      }
    }
  }

  /**
   * Implements the TILT CurveManipulationMode.
   * Tilts the curve to the specified drag position, in model coordinates.
   * If you call this method, you are responsible for setting wasManipulatedProperty calling curveChangedEmitter.emit().
   * @param x - x-coordinate of the drag position
   * @param y - y-coordinate of the drag position
   */
  tilt(x, y) {
    // Fulcrum point: chosen to be the leftmost point.
    const pivotPoint = this.points[0];
    const leverArm = x - pivotPoint.x;

    // Exclude drags with zero leverArm
    if (leverArm !== 0) {
      // Slope between drag position and pivotPoint
      const targetSlope = (y - pivotPoint.y) / leverArm;

      // Update points only if the targetSlope is less than MAX_TILT
      if (Math.abs(targetSlope) < MAX_TILT) {
        const oldSlope = (this.getClosestPointAt(x).lastSavedY - pivotPoint.y) / leverArm;
        const incrementSlope = targetSlope - oldSlope;

        // Shift each of the CurvePoints by a factor associated with the incrementSlope.
        this.points.forEach(point => {
          point.y = point.lastSavedY + incrementSlope * (point.x - pivotPoint.x);
        });
      }
    }
  }

  /**
   * Implements the SHIFT CurveManipulationMode.
   * Shifts the curve to the specified drag position, in model coordinates.
   * If you call this method, you are responsible for setting wasManipulatedProperty calling curveChangedEmitter.emit().
   * @param x - x-coordinate of the drag position
   * @param y - y-coordinate of the drag position
   */
  shift(x, y) {
    // Amount to shift the entire curve.
    const deltaY = y - this.getClosestPointAt(x).y;

    // Shift each of the CurvePoints by deltaY.
    this.points.forEach(point => {
      point.y += deltaY;
    });
  }

  /**
   * Sets the y-value of points between position1 and position2 using a linear interpolation.
   * This method is used for FREEFORM mode.
   */
  interpolate(x1, y1, x2, y2) {
    // x-separation between two adjacent points in a curve array
    const deltaX = this.deltaX;

    // x-distance between the new and old point
    const distX = Math.abs(x1 - x2);
    const signedOne = x1 > x2 ? -1 : 1;

    // Perform a linear interpolation between position1 and position2
    for (let dx = deltaX; dx < distX; dx += deltaX) {
      // The xPosition of the point to be interpolated, is either to the left or right of position1
      const xPosition = x1 + signedOne * dx;

      // Weight needed to interpolate the y-values, weight will never exceed 1.
      const W = dx / distX;

      // Update the y value of an intermediate point
      this.getClosestPointAt(xPosition).y = (1 - W) * y1 + W * y2;
    }
  }

  /**
   * Are the y-values zero (or nearly zero) for the points between xMin and xMax.
   * This method is used for SINUSOID mode.
   */
  isRegionZero(xMin, xMax) {
    assert && assert(xMin <= xMax, 'xMin must be less than xMax');
    return this.points.every(point => {
      const isOutsideBounds = point.x < xMin || point.x > xMax;
      return isOutsideBounds || Math.abs(point.lastSavedY) < 1e-3;
    });
  }

  /**
   * Update the type of a point to smooth if the weight associated to the new function is very large,
   * otherwise leave as is.
   */
  updatePointType(point, weight) {
    assert && assert(weight >= 0 && weight <= 1, `weight must range between 0 and 1: ${weight}`);

    // If the weight is very large, we have effectively replaced the previous values by the new function, which we know to be smooth.
    point.pointType = weight > UPPER_WEIGHT ? 'smooth' : point.lastSavedType;
  }

  /**
   * Update pointValue with appropriate weight, but if weight is very small leave as is.
   * (see https://github.com/phetsims/calculus-grapher/issues/261)
   */
  updatePointValue(point, weight, peakY) {
    assert && assert(weight >= 0 && weight <= 1, `weight must range between 0 and 1: ${weight}`);

    // If the weight is very small, we are practically ignoring the new function. Let's explicitly replace it by the lastSavedY instead.
    point.y = weight > LOWER_WEIGHT ? weight * peakY + (1 - weight) * point.lastSavedY : point.lastSavedY;
  }

  /**
   * Applies the peak function to the curve points and updates their point type.
   * The peak function is applied within a subdomain of the curve.
   * This will result in a piecewise function iof the old  curve and new function.
   * No attempt is made to blend the peak function. We update the point type of the edge points in the
   * subdomains as discontinuous or cusps.
   * This method is used for TRIANGLE and PARABOLA modes.
   *
   * @param peakFunction - the function to be applied to the curve
   * @param deltaY - the y offset of the drag
   */
  iterateFunctionOverPoints(peakFunction, deltaY) {
    let wasPreviousPointModified = null;
    this.points.forEach((point, index) => {
      // New Y value, subject to conditions below
      const newY = peakFunction(deltaY, point.x);

      // Is the point within the 'width' and the change "larger" than the previous y value.
      const isModified = deltaY > 0 && newY > point.lastSavedY || deltaY < 0 && newY < point.lastSavedY;

      // Update the y value
      point.y = isModified ? newY : point.lastSavedY;

      // Update the point Type - we assume the interior region of the peak function is smooth
      // (this is not the case for TRIANGLE therefore we will need to correct it )
      point.pointType = isModified ? 'smooth' : point.lastSavedType;

      // Context: The updated y values will result in a piecewise function of the new function and the old y-values.
      // We need to identify the points where the transitions happen. Those points will be labeled cusps or discontinuities
      if (wasPreviousPointModified !== null && wasPreviousPointModified !== isModified) {
        // We always label discontinuities and cusps on an adjacent pair of points.
        const rightPoint = point;
        const leftPoint = this.points[index - 1];

        // If the right point (point inside the new function) used to be discontinuous, leave type as is, Otherwise label it as cusp.
        rightPoint.pointType = rightPoint.lastSavedType === 'discontinuous' ? 'discontinuous' : 'cusp';

        // The left point should have the same pointType as its adjacent pair point
        leftPoint.pointType = rightPoint.pointType;
      }
      wasPreviousPointModified = isModified;
    });
  }
}

/**
 * Returns a mollifier function of x, that is an infinitely differentiable function
 * Mollifier functions are used to smooth (a.k.a. mollify) other functions (see https://en.wikipedia.org/wiki/Mollifier)
 * @param width - the width for which the mollifying function does not return a zero value
 */
function createMollifierFunction(width) {
  assert && assert(width > 0, 'width must be positive');
  return x => Math.abs(x) < width / 2 ? Math.exp(1 / ((x / (width / 2)) ** 2 - 1)) : 0;
}
calculusGrapher.register('TransformedCurve', TransformedCurve);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiY2FsY3VsdXNHcmFwaGVyIiwiQ2FsY3VsdXNHcmFwaGVyUXVlcnlQYXJhbWV0ZXJzIiwiQ3VydmUiLCJvcHRpb25pemUiLCJDdXJ2ZU1hbmlwdWxhdGlvbk1vZGUiLCJDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMiLCJCb29sZWFuUHJvcGVydHkiLCJDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uIiwiVGFuZGVtIiwiRURHRV9TTE9QRV9GQUNUT1IiLCJlZGdlU2xvcGVGYWN0b3IiLCJTVEFOREFSRF9ERVZJQVRJT04iLCJzbW9vdGhpbmdTdGFuZGFyZERldmlhdGlvbiIsIk1BWF9USUxUIiwibWF4VGlsdCIsIlRZUElDQUxfWSIsIldFRV9XSURUSCIsIkNVUlZFX1hfUkFOR0UiLCJnZXRMZW5ndGgiLCJVUFBFUl9XRUlHSFQiLCJMT1dFUl9XRUlHSFQiLCJhc3NlcnQiLCJUcmFuc2Zvcm1lZEN1cnZlIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicG9pbnRzUHJvcGVydHlSZWFkT25seSIsIndhc01hbmlwdWxhdGVkUHJvcGVydHkiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9SZWFkT25seSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJwb2ludHNQcm9wZXJ0eSIsImxhenlMaW5rIiwiUEhFVF9JT19FTkFCTEVEIiwiY3VydmVDaGFuZ2VkRW1pdHRlciIsImVtaXQiLCJyZXNldCIsInBvaW50cyIsImZvckVhY2giLCJwb2ludCIsImVyYXNlIiwic2F2ZSIsInkiLCJwb2ludFR5cGUiLCJ1bmRvIiwic21vb3RoIiwibm9ybWFsaXphdGlvbkZhY3RvciIsIk1hdGgiLCJzcXJ0IiwiUEkiLCJnYXVzc2lhbkZ1bmN0aW9uIiwieCIsImV4cCIsInRvdGFsV2VpZ2h0Iiwid2VpZ2h0ZWRZIiwiZ2V0Q2xvc2VzdFBvaW50QXQiLCJsYXN0U2F2ZWRZIiwibnVtYmVyT2ZTdGFuZGFyZERldmlhdGlvbnMiLCJkeCIsImRlbHRhWCIsIndlaWdodCIsIm1hbmlwdWxhdGVDdXJ2ZSIsIm1vZGUiLCJ3aWR0aCIsInBvc2l0aW9uIiwicGVudWx0aW1hdGVQb3NpdGlvbiIsImFudGVwZW51bHRpbWF0ZVBvc2l0aW9uIiwiSElMTCIsImhpbGwiLCJUUklBTkdMRSIsInRyaWFuZ2xlIiwiUEVERVNUQUwiLCJwZWRlc3RhbCIsIlBBUkFCT0xBIiwicGFyYWJvbGEiLCJTSU5VU09JRCIsInNpbnVzb2lkIiwiRlJFRUZPUk0iLCJ1bmRlZmluZWQiLCJmcmVlZm9ybSIsIlRJTFQiLCJ0aWx0IiwiU0hJRlQiLCJzaGlmdCIsIkVycm9yIiwidmFsdWUiLCJwZWFrWCIsInBlYWtZIiwiY2xvc2VzdFBvaW50IiwiUCIsInBvdyIsInVwZGF0ZVBvaW50VmFsdWUiLCJ1cGRhdGVQb2ludFR5cGUiLCJkZWx0YVkiLCJzbG9wZSIsInBlYWtGdW5jdGlvbiIsInNpZ24iLCJhYnMiLCJpdGVyYXRlRnVuY3Rpb25PdmVyUG9pbnRzIiwiZ2F1c3NpYW5XZWlnaHQiLCJtdSIsInBsYXRlYXVXaWR0aCIsIkEiLCJ3YXZlbGVuZ3RoIiwiQ1VSVkVfTUFOSVBVTEFUSU9OX1dJRFRIX1JBTkdFIiwiZGVmYXVsdFZhbHVlIiwiY29zaW5lRnVuY3Rpb24iLCJjb3MiLCJ3ZWlnaHRGdW5jdGlvbiIsImhpZ2hYIiwibG93WCIsImNvc2luZUJhc2UiLCJlZGdlV2lkdGgiLCJjb3NpbmVCYXNlTWF4IiwiY29zaW5lQmFzZU1pbiIsInJpZ2h0TWF4IiwieFJhbmdlIiwibWF4IiwibGVmdE1pbiIsIm1pbiIsInJpZ2h0TWluIiwibGVmdE1heCIsImlzTGVmdFJlZ2lvblplcm8iLCJpc1JlZ2lvblplcm8iLCJpc1JpZ2h0UmVnaW9uWmVybyIsImluZGV4IiwiZ2V0Q2xvc2VzdEluZGV4QXQiLCJsYXN0UG9pbnQiLCJjbG9zZXN0VmVjdG9yIiwiZ2V0VmVjdG9yIiwiaW50ZXJwb2xhdGUiLCJuZXh0VG9MYXN0UG9pbnQiLCJjcDFQb2ludCIsImNwMlBvaW50IiwidjEiLCJ2MiIsInYzIiwiaXNBc2NlbmRpbmciLCJzb3J0ZWRWZWN0b3JzIiwicGllY2V3aXNlRnVuY3Rpb24iLCJkaXN0YW5jZSIsIm51bWJlclN0ZXBzIiwic2lnbmVkRGVsdGFYIiwibW9sbGlmaWVyRnVuY3Rpb24iLCJjcmVhdGVNb2xsaWZpZXJGdW5jdGlvbiIsImkiLCJmdW5jdGlvbldlaWdodCIsImV2YWx1YXRlIiwibGFzdFBvaW50SW5kZXgiLCJnZXRJbmRleCIsImNsb3Nlc3RQb2ludEluZGV4IiwibmV4dFRvTGFzdFBvaW50SW5kZXgiLCJwaXZvdFBvaW50IiwibGV2ZXJBcm0iLCJ0YXJnZXRTbG9wZSIsIm9sZFNsb3BlIiwiaW5jcmVtZW50U2xvcGUiLCJ4MSIsInkxIiwieDIiLCJ5MiIsImRpc3RYIiwic2lnbmVkT25lIiwieFBvc2l0aW9uIiwiVyIsInhNaW4iLCJ4TWF4IiwiZXZlcnkiLCJpc091dHNpZGVCb3VuZHMiLCJsYXN0U2F2ZWRUeXBlIiwid2FzUHJldmlvdXNQb2ludE1vZGlmaWVkIiwibmV3WSIsImlzTW9kaWZpZWQiLCJyaWdodFBvaW50IiwibGVmdFBvaW50IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUcmFuc2Zvcm1lZEN1cnZlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybWVkQ3VydmUgaXMgYSBDdXJ2ZSBzdWJjbGFzcyBmb3IgYSBjdXJ2ZSB0aGF0IHRoZSB1c2VyIGludGVyYWN0cyB3aXRoIGFuZCBtYW5pcHVsYXRlcywgd2hpY2ggdGhlblxyXG4gKiB0cmlnZ2VycyBhIGNoYW5nZSBpbiB0aGUgQ3VydmVQb2ludHMuIEl0IGlzIHVzZWQgZm9yIGYoeCkgKHRoZSAnb3JpZ2luYWwnIGN1cnZlKSBhbmQgdGhlICdQcmVkaWN0JyBjdXJ2ZS5cclxuICpcclxuICogVHJhbnNmb3JtZWRDdXJ2ZSBpcyBtYWlubHkgcmVzcG9uc2libGUgZm9yOlxyXG4gKlxyXG4gKiAgIC0gUmVzZXR0aW5nIGFsbCB0aGUgcG9pbnRzIG9mIHRoZSBjdXJ2ZVxyXG4gKiAgIC0gU2F2aW5nIHRoZSBzdGF0ZSBvZiB0aGUgY3VydmVcclxuICogICAtIFVuZG9pbmcgdGhlIGN1cnZlIHRvIGl0cyBwcmV2aW91cyBzdGF0ZVxyXG4gKiAgIC0gRXJhc2luZyB0aGUgY3VydmUgYnkgc2V0dGluZyBwb2ludHMgdG8geT0wXHJcbiAqICAgLSBTbW9vdGhpbmcgdGhlIGN1cnZlXHJcbiAqICAgLSBJbXBsZW1lbnRpbmcgdGhlIHJlc3BvbnNlIGFsZ29yaXRobXMgdGhhdCBhcmUgdXNlZCB3aGVuIHRoZSB1c2VyIGRyYWdzIG9uIHRoZSBUcmFuc2Zvcm1lZEN1cnZlLiBUaGUgcmVzcG9uc2UgaXNcclxuICogICAgIGFmZmVjdGVkIGJ5IHRoZSBDdXJ2ZU1hbmlwdWxhdGlvbk1vZGUgYW5kIHRoZSAnd2lkdGgnIG9mIHRoZSBjdXJ2ZS1tYW5pcHVsYXRpb24uIFRoZSBhbGdvcml0aG1zIGZvciBjdXJ2ZVxyXG4gKiAgICAgbWFuaXB1bGF0aW9uIHJlc3BvbnNlIHdlcmUgYWRhcHRlZCBhbmQgaW1wcm92ZWQgZnJvbSB0aGUgZmxhc2ggaW1wbGVtZW50YXRpb24gb2YgQ2FsY3VsdXMgR3JhcGhlci4gVGhlIG1ldGhvZHNcclxuICogICAgIGFzc29jaWF0ZWQgd2l0aCB0aGUgdmFyaW91cyBDdXJ2ZU1hbmlwdWxhdGlvbk1vZGVzIGFyZVxyXG4gKiAgICAgLSBISUxMIC0+IGhpbGxcclxuICogICAgIC0gVFJJQU5HTEUgLT4gdHJpYW5nbGVcclxuICogICAgIC0gUEVERVNUQUwgLT4gcGVkZXN0YWxcclxuICogICAgIC0gUEFSQUJPTEEgLT4gcGFyYWJvbGFcclxuICogICAgIC0gU0lOVVNPSUQgLT4gc2ludXNvaWRcclxuICogICAgIC0gRlJFRUZPUk0gLT4gZnJlZWZvcm1cclxuICogICAgIC0gVElMVCAtPiB0aWx0XHJcbiAqICAgICAtIFNISUZUIC0+IHNoaWZ0XHJcbiAqXHJcbiAqIFdlIHNob3VsZCBub3RlIHRoYXQgdGhlIFRyYW5zZm9ybWVkQ3VydmUgY2xhc3MgaXMgdGhlIGJhc2lzIG9mIHRoZSBvcmlnaW5hbCBjdXJ2ZSwgYW5kLCB0aGVyZWZvcmUsXHJcbiAqIGl0cyBmaXJzdCwgYW5kIHNlY29uZCBkZXJpdmF0aXZlIHdpbGwgYmUgZXZhbHVhdGVkLiBBcyBhIHJlc3VsdCwgbXVjaCBlZmZvcnQgd2FzIHNwZW50IGNyZWF0aW5nIGN1cnZlIG1hbmlwdWxhdGlvbnNcclxuICogdGhhdCB5aWVsZHMgdW51c3VhbGx5IHNtb290aCBjdXJ2ZXMgZm9yIHdoaWNoIHRoZWlyIGZpcnN0IGFuZCBzZWNvbmQgZGVyaXZhdGl2ZXMgYXJlIHRoZW1zZWx2ZXMgc21vb3RoLlxyXG4gKlxyXG4gKiBNb3N0IGN1cnZlIG1hbmlwdWxhdGlvbnMgbWFrZSB1c2Ugb2YgYSB3ZWlnaHQgZnVuY3Rpb24gdG8gXCJibGVuZFwiIGluIGEgY3VydmUgc2VnbWVudCBpbnRvIGEgcHJldmlvdXMgY3VydmUuXHJcbiAqIEEgd2VpZ2h0IGZ1bmN0aW9uIGlzIGEgbWF0aGVtYXRpY2FsIGRldmljZSB1c2VkIHdoZW4gcGVyZm9ybWluZyBhbiBhdmVyYWdlIHRvIGdpdmVcclxuICogc29tZSBlbGVtZW50cyBtb3JlIFwid2VpZ2h0XCIgb3IgaW5mbHVlbmNlIG9uIHRoZSByZXN1bHQgdGhhbiBvdGhlciBlbGVtZW50cyBpbiB0aGUgc2FtZSBzZXQuXHJcbiAqIFRoZSByZXN1bHQgb2YgdGhlIGFwcGxpY2F0aW9uIG9mIGEgd2VpZ2h0IGZ1bmN0aW9uIGlzIGEgd2VpZ2h0ZWQgc3VtIG9yIHdlaWdodGVkIGF2ZXJhZ2UuXHJcbiAqIEEgdmFyaWV0eSBvZiB3ZWlnaHQgZnVuY3Rpb25zIHJhbmdpbmcgZnJvbSBHYXVzc2lhbiBrZXJuZWwsIHN1cGVyIEdhdXNzaWFuLCBtb2xsaWZ5aW5nIGZ1bmN0aW9uc1xyXG4gKiBhcmUgdXNlZCB0byBjcmVhdGUgY3VydmVzIHdpdGhvdXQgY3VzcHMgYW5kIGRpc2NvbnRpbnVpdGllcy5cclxuICpcclxuICogVHJhbnNmb3JtZWRDdXJ2ZSBpcyBjcmVhdGVkIGF0IHRoZSBzdGFydCBhbmQgcGVyc2lzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlXHJcbiAqL1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBjYWxjdWx1c0dyYXBoZXIgZnJvbSAnLi4vLi4vY2FsY3VsdXNHcmFwaGVyLmpzJztcclxuaW1wb3J0IENhbGN1bHVzR3JhcGhlclF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9DYWxjdWx1c0dyYXBoZXJRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgQ3VydmUsIHsgQ3VydmVPcHRpb25zIH0gZnJvbSAnLi9DdXJ2ZS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgQ3VydmVNYW5pcHVsYXRpb25Nb2RlIGZyb20gJy4vQ3VydmVNYW5pcHVsYXRpb25Nb2RlLmpzJztcclxuaW1wb3J0IEN1cnZlUG9pbnQgZnJvbSAnLi9DdXJ2ZVBvaW50LmpzJztcclxuaW1wb3J0IENhbGN1bHVzR3JhcGhlckNvbnN0YW50cyBmcm9tICcuLi9DYWxjdWx1c0dyYXBoZXJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQ29tcGxldGVQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQ29tcGxldGVQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbi5qcyc7IC8vIGNvbnN0YW50c1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEVER0VfU0xPUEVfRkFDVE9SID0gQ2FsY3VsdXNHcmFwaGVyUXVlcnlQYXJhbWV0ZXJzLmVkZ2VTbG9wZUZhY3RvcjtcclxuY29uc3QgU1RBTkRBUkRfREVWSUFUSU9OID0gQ2FsY3VsdXNHcmFwaGVyUXVlcnlQYXJhbWV0ZXJzLnNtb290aGluZ1N0YW5kYXJkRGV2aWF0aW9uO1xyXG5jb25zdCBNQVhfVElMVCA9IENhbGN1bHVzR3JhcGhlclF1ZXJ5UGFyYW1ldGVycy5tYXhUaWx0O1xyXG5jb25zdCBUWVBJQ0FMX1kgPSBDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMuVFlQSUNBTF9ZO1xyXG5jb25zdCBXRUVfV0lEVEggPSBDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMuQ1VSVkVfWF9SQU5HRS5nZXRMZW5ndGgoKSAvIDQwO1xyXG5jb25zdCBVUFBFUl9XRUlHSFQgPSAwLjk5OTsgLy8gYSB2ZXJ5IGxhcmdlIGN1dG9mZiBmb3Igd2VpZ2h0c1xyXG5jb25zdCBMT1dFUl9XRUlHSFQgPSAxZS04OyAvLyBhIHZlcnkgc21hbGwgbnVtYmVyIHRoYXQgY3V0b2ZmIHNtYWxsIHdlaWdodCBjb250cmlidXRpb25zLlxyXG5cclxuYXNzZXJ0ICYmIGFzc2VydCggVVBQRVJfV0VJR0hUIDwgMSAmJiBVUFBFUl9XRUlHSFQgPj0gMCwgYFVQUEVSX1dFSUdIVCBtdXN0IHJhbmdlIGZyb20gMCB0byAxLCBpbmNsdXNpdmU6ICR7VVBQRVJfV0VJR0hUfWAgKTtcclxuYXNzZXJ0ICYmIGFzc2VydCggTE9XRVJfV0VJR0hUIDwgMSAmJiBMT1dFUl9XRUlHSFQgPj0gMCwgYExPV0VSX1dFSUdIVCBtdXN0IHJhbmdlIGZyb20gMCB0byAxLCBpbmNsdXNpdmU6ICR7TE9XRVJfV0VJR0hUfWAgKTtcclxuYXNzZXJ0ICYmIGFzc2VydCggTE9XRVJfV0VJR0hUIDwgVVBQRVJfV0VJR0hULCAnTE9XRVJfV0VJR0hUIG11c3QgYmUgPCBVUFBFUl9XRUlHSFQnICk7XHJcblxyXG50eXBlIE1hdGhGdW5jdGlvbiA9ICggeDogbnVtYmVyICkgPT4gbnVtYmVyO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG5leHBvcnQgdHlwZSBUcmFuc2Zvcm1lZEN1cnZlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgQ3VydmVPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHJhbnNmb3JtZWRDdXJ2ZSBleHRlbmRzIEN1cnZlIHtcclxuXHJcbiAgLy8gSGFzIHRoZSBjdXJ2ZSBiZWVuIG1hbmlwdWxhdGVkIHNpbmNlIGluc3RhbnRpYXRpb24gb3IgdGhlIGxhc3QgcmVzZXQgY2FsbD8gVXNlZCBieSB0aGUgdmlldyB0byBzaG93IGN1ZWluZyBhcnJvd3MuXHJcbiAgcHVibGljIHJlYWRvbmx5IHdhc01hbmlwdWxhdGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogVHJhbnNmb3JtZWRDdXJ2ZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxUcmFuc2Zvcm1lZEN1cnZlT3B0aW9ucywgU2VsZk9wdGlvbnMsIEN1cnZlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gQ3VydmVPcHRpb25zXHJcbiAgICAgIHBvaW50c1Byb3BlcnR5UmVhZE9ubHk6IGZhbHNlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMud2FzTWFuaXB1bGF0ZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnd2FzTWFuaXB1bGF0ZWRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdIYXMgdGhlIGN1cnZlIGJlZW4gbWFuaXB1bGF0ZWQgYnkgdGhlIHN0dWRlbnQ/J1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRvIG1ha2UgdGhlIHNpbSBhY2NlcHRhYmx5IHJlc3BvbnNpdmUsIHRoZSB2YWx1ZSBvZiBwb2ludHNQcm9wZXJ0eSAoYW4gYXJyYXkgb2YgQ3VydmVQb2ludCkgdHlwaWNhbGx5IGRvZXMgbm90XHJcbiAgICAvLyBjaGFuZ2UuIEluc3RlYWQsIHRoZSBDdXJ2ZVBvaW50cyBhcmUgbXV0YXRlZCBpbiBwbGFjZSwgYW5kIGN1cnZlQ2hhbmdlZEVtaXR0ZXIuZW1pdCBpcyBjYWxsZWQgd2hlbiB0aGUgbXV0YXRpb25cclxuICAgIC8vIGlzIGNvbXBsZXRlZC4gQW4gZXhjZXB0aW9uIHRvIHRoaXMgb2NjdXJzIGluIFBoRVQtaU8gYnJhbmQgZm9yIG9yaWdpbmFsQ3VydmUucG9pbnRzUHJvcGVydHkgYW5kXHJcbiAgICAvLyBwcmVkaWN0Q3VydmUucG9pbnRzUHJvcGVydHkuIFRoZSB2YWx1ZSB3aWxsIGNoYW5nZSB3aGVuIHVzaW5nIHRoZSAnU2V0IFZhbHVlJyBjb250cm9sIGluIFN0dWRpbywgb3IgdGhlIHZhbHVlXHJcbiAgICAvLyBpcyBzZXQgdmlhIHRoZSAnc2V0VmFsdWUnIFBoRVQtaU8gQVBJIGNhbGwuIEFuZCBpbiB0aGF0IGNhc2UsIHdlIG5lZWQgdG8gZXhwbGljaXRseSBjYWxsIGN1cnZlQ2hhbmdlZEVtaXR0ZXIuZW1pdC5cclxuICAgIC8vIFNlZTpcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jYWxjdWx1cy1ncmFwaGVyL2lzc3Vlcy85MFxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NhbGN1bHVzLWdyYXBoZXIvaXNzdWVzLzI3OFxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NhbGN1bHVzLWdyYXBoZXIvaXNzdWVzLzMwOVxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NhbGN1bHVzLWdyYXBoZXIvaXNzdWVzLzMyN1xyXG4gICAgdGhpcy5wb2ludHNQcm9wZXJ0eS5sYXp5TGluayggKCkgPT4ge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBUYW5kZW0uUEhFVF9JT19FTkFCTEVELCAncG9pbnRzUHJvcGVydHkgbWF5IG9ubHkgYmUgc2V0IGluIHRoZSBQaEVULWlPIHZlcnNpb24uJyApO1xyXG4gICAgICB0aGlzLmN1cnZlQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG5cclxuICAgIHRoaXMud2FzTWFuaXB1bGF0ZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIC8vIFJlc2V0IGV2ZXJ5IEN1cnZlUG9pbnQgdG8gaXRzIGluaXRpYWwgc3RhdGUuXHJcbiAgICB0aGlzLnBvaW50cy5mb3JFYWNoKCBwb2ludCA9PiBwb2ludC5yZXNldCgpICk7XHJcbiAgICB0aGlzLmN1cnZlQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXJhc2VzIHRoZSBjdXJ2ZSBieSBzZXR0aW5nIGFsbCB0aGUgcG9pbnRzIHRvIHplcm8gYW5kIHBvaW50IHR5cGUgdG8gc21vb3RoLlxyXG4gICAqIE5vdGUgdGhhdCB0aGlzIG1ldGhvZCBpcyBjYWxsZWQgZXJhc2UgYmVjYXVzZSBpdCBpcyBpbnZva2VkIHdoZW4gdGhlIGVyYXNlIGJ1dHRvbiBpcyBwcmVzc2VkLlxyXG4gICAqIFdlIG5ldmVyIGVyYXNlIGEgY3VydmUgb3IgZGlzcG9zZSBvZiB0aGUgY3VydmUgcG9pbnRzIGluIHRoaXMgc2ltdWxhdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgZXJhc2UoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gTWFrZSBlcmFzZSB1bmRvYWJsZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jYWxjdWx1cy1ncmFwaGVyL2lzc3Vlcy8zMzFcclxuICAgIHRoaXMuc2F2ZSgpO1xyXG5cclxuICAgIC8vIFNldCB0aGUgcG9pbnQgdmFsdWVzIHRvIHplcm8gYW5kIHNtb290aCB0eXBlLlxyXG4gICAgdGhpcy5wb2ludHMuZm9yRWFjaCggcG9pbnQgPT4ge1xyXG4gICAgICBwb2ludC55ID0gMDtcclxuICAgICAgcG9pbnQucG9pbnRUeXBlID0gJ3Ntb290aCc7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU2lnbmFsIHRoYXQgdGhpcyBDdXJ2ZSBoYXMgY2hhbmdlZC5cclxuICAgIHRoaXMuY3VydmVDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTYXZlcyB0aGUgY3VycmVudCBzdGF0ZSAoeS12YWx1ZSBhbmQgcG9pbnRUeXBlKSBvZiB0aGUgUG9pbnRzIGZvciB0aGUgbmV4dCB1bmRvKCkgY2FsbC5cclxuICAgKlxyXG4gICAqIFRoaXMgbWV0aG9kIGlzIGludm9rZWQgd2hlbiB0aGUgdXNlciBzdGFydHMgbWFuaXB1bGF0aW5nIHRoZSBUcmFuc2Zvcm1lZEN1cnZlLiBXaGVuIHRoZSB1bmRvIGJ1dHRvbiBpcyBwcmVzc2VkLFxyXG4gICAqIHRoZSBDdXJ2ZVBvaW50cyBvZiB0aGUgVHJhbnNmb3JtZWRDdXJ2ZSB3aWxsIGJlIHNldCB0byB0aGVpciBsYXN0IHNhdmVkIHN0YXRlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzYXZlKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIFNhdmUgdGhlIGN1cnJlbnQgc3RhdGUgb2YgZWFjaCBDdXJ2ZVBvaW50LlxyXG4gICAgdGhpcy5wb2ludHMuZm9yRWFjaCggcG9pbnQgPT4gcG9pbnQuc2F2ZSgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBzdGF0ZSBvZiB0aGlzIEN1cnZlZFBvaW50IG9uIHRoaXMgQ3VydmUgdG8gaXRzIGxhc3Qgc2F2ZWQgc3RhdGUuXHJcbiAgICogVGhpcyBtZXRob2QgaXMgaW52b2tlZCB3aGVuIHRoZSB1bmRvIGJ1dHRvbiBpcyBwcmVzc2VkLCB3aGljaCBzdWNjZXNzaXZlbHkgdW5kb2VzIHRoZSBsYXN0IGFjdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgdW5kbygpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBSZXZlcnQgdG8gdGhlIHNhdmVkIHBvaW50U3RhdGUgb2YgZWFjaCBDdXJ2ZVBvaW50LlxyXG4gICAgdGhpcy5wb2ludHMuZm9yRWFjaCggcG9pbnQgPT4gcG9pbnQudW5kbygpICk7XHJcblxyXG4gICAgLy8gU2lnbmFsIHRoYXQgdGhpcyBDdXJ2ZSBoYXMgY2hhbmdlZC5cclxuICAgIHRoaXMuY3VydmVDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTbW9vdGhzIHRoZSBjdXJ2ZS4gSXQgaXMgY2FsbGVkIHdoZW4gdGhlIHVzZXIgcHJlc3NlcyB0aGUgJ3Ntb290aCcgYnV0dG9uLlxyXG4gICAqIFRoaXMgbWV0aG9kIHVzZXMgYSB3ZWlnaHRlZC1hdmVyYWdlIGFsZ29yaXRobSBmb3IgJ3Ntb290aGluZycgYSBjdXJ2ZSwgdXNpbmcgYSBHYXVzc2lhbiBrZXJuZWxcclxuICAgKiBzZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvS2VybmVsX3Ntb290aGVyXHJcbiAgICovXHJcbiAgcHVibGljIHNtb290aCgpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBTYXZlcyB0aGUgY3VycmVudCB2YWx1ZXMgb2Ygb3VyIFBvaW50cyBmb3IgdGhlIG5leHQgdW5kbygpIGNhbGwuXHJcbiAgICAvLyBOb3RlIHRoYXQgdGhlIGN1cnJlbnQgeS12YWx1ZXMgYXJlIHRoZSBzYW1lIGFzIHRoZSBwcmV2aW91cyB5LXZhbHVlc1xyXG4gICAgLy8gZm9yIGFsbCBQb2ludHMgaW4gdGhlIFRyYW5zZm9ybWVkQ3VydmUuXHJcbiAgICB0aGlzLnNhdmUoKTtcclxuXHJcbiAgICAvLyBOb3JtYWxpemVkIEdhdXNzaWFuIGtlcm5lbCB0aGF0IHdpbGwgYmUgdXNlZCBpbiB0aGUgY29udm9sdXRpb24gb2Ygb3VyIGN1cnZlXHJcbiAgICBjb25zdCBub3JtYWxpemF0aW9uRmFjdG9yID0gMSAvICggU1RBTkRBUkRfREVWSUFUSU9OICogTWF0aC5zcXJ0KCAyICogTWF0aC5QSSApICk7XHJcblxyXG4gICAgLy8gV2VpZ2h0ZWQga2VybmVsOiBOb3RlIHRoYXQgZ2F1c3NpYW5GdW5jdGlvbih4KSA9IGdhdXNzaWFuRnVuY3Rpb24oLXgpLCB3aGljaCB3ZSB3aWxsIHVzZSBsYXRlciBvbi5cclxuICAgIGNvbnN0IGdhdXNzaWFuRnVuY3Rpb24gPSAoIHg6IG51bWJlciApID0+IG5vcm1hbGl6YXRpb25GYWN0b3IgKiBNYXRoLmV4cCggLTEgLyAyICogKCB4IC8gU1RBTkRBUkRfREVWSUFUSU9OICkgKiogMiApO1xyXG5cclxuICAgIC8vIExvb3BzIHRocm91Z2ggZWFjaCBQb2ludCBvZiB0aGUgY3VydmUgYW5kIHNldCB0aGUgbmV3IHktdmFsdWUuXHJcbiAgICB0aGlzLnBvaW50cy5mb3JFYWNoKCBwb2ludCA9PiB7XHJcblxyXG4gICAgICAvLyBNYWluIGlkZWE6IEZvciBlYWNoIHBvaW50IHdlIHdhbnQgdG8gYXZlcmFnZSBpdHMgeS12YWx1ZSB3aXRoIHBvaW50cyBpbiB0aGUgbG9jYWwgXCJuZWlnaGJvcmhvb2RcIi5cclxuICAgICAgLy8gV2Ugd2lsbCBkbyBzbyBieSBzdW1taW5nIHBvaW50cyBvbiB0aGUgbGVmdCBhbmQgdGhlIHJpZ2h0IG9mIHRoaXMgcG9pbnQgd2l0aCBhcHByb3ByaWF0ZSB3ZWlnaHRzLlxyXG5cclxuICAgICAgLy8gRmxhZ3MgdGhhdCB0cmFja3MgdGhlIHN1bSBvdmVyIGFsbCBwb2ludHMgb2YgdGhlIHdlaWdodGVkIHktdmFsdWVzLlxyXG4gICAgICBsZXQgdG90YWxXZWlnaHQgPSAwO1xyXG4gICAgICBsZXQgd2VpZ2h0ZWRZID0gMDtcclxuXHJcbiAgICAgIC8vIFdlIHN0YXJ0IHRoZSBzdW0gd2l0aCB0aGUgcG9pbnQgd2Ugd2FudCB0byBhdmVyYWdlLlxyXG4gICAgICB0b3RhbFdlaWdodCArPSBnYXVzc2lhbkZ1bmN0aW9uKCAwICk7XHJcbiAgICAgIHdlaWdodGVkWSArPSB0aGlzLmdldENsb3Nlc3RQb2ludEF0KCBwb2ludC54ICkubGFzdFNhdmVkWSAqIGdhdXNzaWFuRnVuY3Rpb24oIDAgKTtcclxuXHJcbiAgICAgIC8vIFdlIHdpbGwgc3VtIHRoZSBvdGhlciBwb2ludHMsIGlkZWFsbHkgYWxsIG9mIHRoZW0sIGluIHByYWN0aWNlLCB3ZSB1c2UgdGhlIGtlcm5lbCBvdmVyIGEgbnVtYmVyIG9mIHN0YW5kYXJkIGRldmlhdGlvbnMuXHJcbiAgICAgIC8vIEJleW9uZCAzIHN0YW5kYXJkIGRldmlhdGlvbnMsIHRoZSBrZXJuZWwgaGFzIGEgdmVyeSBzbWFsbCB3ZWlnaHQsIGxlc3MgdGhhbiAxJSwgc28gdGhhdCBwb2ludHMgYmV5b25kXHJcbiAgICAgIC8vIHRocmVlIHN0YW5kYXJkIGRldmlhdGlvbnMgZG8gbm90IG1ha2UgbWVhbmluZ2Z1bCBjb250cmlidXRpb25zIHRvIHRoZSBhdmVyYWdlLlxyXG4gICAgICBjb25zdCBudW1iZXJPZlN0YW5kYXJkRGV2aWF0aW9ucyA9IDM7XHJcblxyXG4gICAgICAvLyBMb29wcyB0aHJvdWdoIGVhY2ggcG9pbnQgb24gQk9USCBzaWRlcyBvZiB0aGUgd2luZG93LCBhZGRpbmcgdGhlIHktdmFsdWUgdG8gb3VyIHRvdGFsIGluIG9yZGVyXHJcbiAgICAgIC8vIHRvIGRvIGEgc3ltbWV0cmljIHN1bTogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NhbGN1bHVzLWdyYXBoZXIvaXNzdWVzLzI5My5cclxuICAgICAgZm9yICggbGV0IGR4ID0gdGhpcy5kZWx0YVg7IGR4IDw9IG51bWJlck9mU3RhbmRhcmREZXZpYXRpb25zICogU1RBTkRBUkRfREVWSUFUSU9OO1xyXG4gICAgICAgICAgICBkeCArPSB0aGlzLmRlbHRhWCApIHtcclxuXHJcbiAgICAgICAgLy8gV2VpZ2h0IG9mIGEgcG9pbnQgYXQgYSBkaXN0YW5jZSBkeCBmcm9tIG91ciBwb2ludCBvZiBpbnRlcmVzdFxyXG4gICAgICAgIGNvbnN0IHdlaWdodCA9IGdhdXNzaWFuRnVuY3Rpb24oIGR4ICk7XHJcblxyXG4gICAgICAgIC8vIEFkZCB0aGUgd2VpZ2h0cyAodGltZXMgdHdvIGJlY2F1c2Ugd2UgaGF2ZSBwb2ludHMgb24gdGhlIGxlZnQgYW5kIHRoZSByaWdodClcclxuICAgICAgICB0b3RhbFdlaWdodCArPSAyICogd2VpZ2h0O1xyXG5cclxuICAgICAgICAvLyBBZGQgdGhlIHBvaW50cyBsYXN0U2F2ZWRZLCB3aGljaCB3YXMgdGhlIFBvaW50J3MgeS12YWx1ZSBiZWZvcmUgdGhlIHNtb290aCgpIG1ldGhvZCB3YXMgY2FsbGVkLlxyXG4gICAgICAgIHdlaWdodGVkWSArPSB0aGlzLmdldENsb3Nlc3RQb2ludEF0KCBwb2ludC54ICsgZHggKS5sYXN0U2F2ZWRZICogd2VpZ2h0ICtcclxuICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRDbG9zZXN0UG9pbnRBdCggcG9pbnQueCAtIGR4ICkubGFzdFNhdmVkWSAqIHdlaWdodDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2V0IHRoZSBwb2ludCdzIG5ldyB5LXZhbHVlIHRvIGJlIHRoZSB3ZWlnaHRlZCBhdmVyYWdlIG9mIGFsbCB0aGUgb3RoZXIgcG9pbnRzLlxyXG4gICAgICBwb2ludC55ID0gd2VpZ2h0ZWRZIC8gdG90YWxXZWlnaHQ7XHJcblxyXG4gICAgICAvLyBTaW5jZSB0aGlzIGlzIGEgc21vb3RoaW5nIG9wZXJhdGlvbiwgd2UgYXJlIGV4cGxpY2l0bHkgc2V0dGluZyB0aGUgcG9pbnQgdHlwZSB0byBzbW9vdGggKGZvciBhbGwgcG9pbnRzKSwgcmVnYXJkbGVzc1xyXG4gICAgICAvLyBvZiB0aGVpciBwcmV2aW91cyBwb2ludCB0eXBlLlxyXG4gICAgICBwb2ludC5wb2ludFR5cGUgPSAnc21vb3RoJztcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTaWduYWxzIHRoYXQgdGhpcyBDdXJ2ZSBoYXMgY2hhbmdlZC5cclxuICAgIHRoaXMuY3VydmVDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb2RpZmllcyB0aGUgcG9pbnRzIGJhc2VkIG9uIHRoZSBjdXJ2ZU1hbmlwdWxhdGlvbk1vZGUgYW5kIHNlbGVjdGVkIHdpZHRoLlxyXG4gICAqIFNldHMgd2FzTWFuaXB1bGF0ZWRQcm9wZXJ0eSBhbmQgbm90aWZpZXMgbGlzdGVuZXJzIHRoYXQgdGhlIEN1cnZlIGhhcyBjaGFuZ2VkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIG1vZGVcclxuICAgKiBAcGFyYW0gd2lkdGhcclxuICAgKiBAcGFyYW0gcG9zaXRpb24gLSBwb3NpdGlvbiBvZiBjdXJzb3IgaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgKiBAcGFyYW0gW3BlbnVsdGltYXRlUG9zaXRpb25dIC0gbGFzdCBwb3NpdGlvbiBvZiBjdXJzb3IgaW4gbW9kZWwgY29vcmRpbmF0ZXMsIHJlbGV2YW50IG9ubHkgZm9yIEN1cnZlTWFuaXB1bGF0aW9uTW9kZS5GUkVFRk9STVxyXG4gICAqIEBwYXJhbSBbYW50ZXBlbnVsdGltYXRlUG9zaXRpb25dIC0gYmVmb3JlIGxhc3QgcG9zaXRpb24gaW4gbW9kZWwgY29vcmRpbmF0ZXMsIHJlbGV2YW50IG9ubHkgZm9yIEN1cnZlTWFuaXB1bGF0aW9uTW9kZS5GUkVFRk9STVxyXG4gICAqL1xyXG4gIHB1YmxpYyBtYW5pcHVsYXRlQ3VydmUoIG1vZGU6IEN1cnZlTWFuaXB1bGF0aW9uTW9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogbnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBWZWN0b3IyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBlbnVsdGltYXRlUG9zaXRpb24/OiBWZWN0b3IyIHwgbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBhbnRlcGVudWx0aW1hdGVQb3NpdGlvbj86IFZlY3RvcjIgfCBudWxsICk6IHZvaWQge1xyXG5cclxuICAgIGlmICggbW9kZSA9PT0gQ3VydmVNYW5pcHVsYXRpb25Nb2RlLkhJTEwgKSB7XHJcbiAgICAgIHRoaXMuaGlsbCggd2lkdGgsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBtb2RlID09PSBDdXJ2ZU1hbmlwdWxhdGlvbk1vZGUuVFJJQU5HTEUgKSB7XHJcbiAgICAgIHRoaXMudHJpYW5nbGUoIHdpZHRoLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggbW9kZSA9PT0gQ3VydmVNYW5pcHVsYXRpb25Nb2RlLlBFREVTVEFMICkge1xyXG4gICAgICB0aGlzLnBlZGVzdGFsKCB3aWR0aCwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIG1vZGUgPT09IEN1cnZlTWFuaXB1bGF0aW9uTW9kZS5QQVJBQk9MQSApIHtcclxuICAgICAgdGhpcy5wYXJhYm9sYSggd2lkdGgsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBtb2RlID09PSBDdXJ2ZU1hbmlwdWxhdGlvbk1vZGUuU0lOVVNPSUQgKSB7XHJcbiAgICAgIHRoaXMuc2ludXNvaWQoIHdpZHRoLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggbW9kZSA9PT0gQ3VydmVNYW5pcHVsYXRpb25Nb2RlLkZSRUVGT1JNICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwZW51bHRpbWF0ZVBvc2l0aW9uICE9PSB1bmRlZmluZWQgJiYgYW50ZXBlbnVsdGltYXRlUG9zaXRpb24gIT09IHVuZGVmaW5lZCApO1xyXG4gICAgICB0aGlzLmZyZWVmb3JtKCBwb3NpdGlvbiwgcGVudWx0aW1hdGVQb3NpdGlvbiEsIGFudGVwZW51bHRpbWF0ZVBvc2l0aW9uISApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIG1vZGUgPT09IEN1cnZlTWFuaXB1bGF0aW9uTW9kZS5USUxUICkge1xyXG4gICAgICB0aGlzLnRpbHQoIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBtb2RlID09PSBDdXJ2ZU1hbmlwdWxhdGlvbk1vZGUuU0hJRlQgKSB7XHJcbiAgICAgIHRoaXMuc2hpZnQoIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGB1bnN1cHBvcnRlZCBtb2RlOiAke21vZGV9YCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE5vdGUgdGhhdCB0aGUgY3VydmUgaGFzIGJlZW4gbWFuaXB1bGF0ZWQuXHJcbiAgICB0aGlzLndhc01hbmlwdWxhdGVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG5cclxuICAgIC8vIE5vdGlmeSB0aGF0IHRoZSBjdXJ2ZSBoYXMgY2hhbmdlZC5cclxuICAgIHRoaXMuY3VydmVDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbXBsZW1lbnRzIHRoZSBISUxMIEN1cnZlTWFuaXB1bGF0aW9uTW9kZS5cclxuICAgKiBDcmVhdGVzIGEgc21vb3RoLCBjb250aW51b3VzLCBhbmQgZGlmZmVyZW50aWFibGUgYmVsbC1zaGFwZWQgY3VydmUsIHRvIHRoZSBwYXNzZWQtaW4gcGVhay5cclxuICAgKiBJZiB5b3UgY2FsbCB0aGlzIG1ldGhvZCwgeW91IGFyZSByZXNwb25zaWJsZSBmb3Igc2V0dGluZyB3YXNNYW5pcHVsYXRlZFByb3BlcnR5IGNhbGxpbmcgY3VydmVDaGFuZ2VkRW1pdHRlci5lbWl0KCkuXHJcbiAgICovXHJcbiAgcHVibGljIGhpbGwoIHdpZHRoOiBudW1iZXIsIHBlYWtYOiBudW1iZXIsIHBlYWtZOiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgY29uc3QgY2xvc2VzdFBvaW50ID0gdGhpcy5nZXRDbG9zZXN0UG9pbnRBdCggcGVha1ggKTtcclxuXHJcbiAgICB0aGlzLnBvaW50cy5mb3JFYWNoKCBwb2ludCA9PiB7XHJcblxyXG4gICAgICAvLyBEZXRlcm1pbmUgdGhlIHdlaWdodCBhc3NvY2lhdGVkIHdpdGggdGhlIHBlYWtcclxuICAgICAgY29uc3QgUCA9IE1hdGguZXhwKCAtTWF0aC5wb3coICggcG9pbnQueCAtIGNsb3Nlc3RQb2ludC54ICkgLyAoIHdpZHRoIC8gKCAyICogTWF0aC5zcXJ0KCAyICkgKSApLCAyICkgKTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlUG9pbnRWYWx1ZSggcG9pbnQsIFAsIHBlYWtZICk7XHJcbiAgICAgIHRoaXMudXBkYXRlUG9pbnRUeXBlKCBwb2ludCwgUCApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW1wbGVtZW50cyB0aGUgVFJJQU5HTEUgQ3VydmVNYW5pcHVsYXRpb25Nb2RlLlxyXG4gICAqIENyZWF0ZXMgYSB0cmlhbmdsZS1zaGFwZWQgcGVhayB0aGF0IGlzIG5vbi1kaWZmZXJlbnRpYWJsZSB3aGVyZSBpdCBpbnRlcnNlY3RzIHdpdGggdGhlIHJlc3Qgb2YgdGhlIEN1cnZlLlxyXG4gICAqIElmIHlvdSBjYWxsIHRoaXMgbWV0aG9kLCB5b3UgYXJlIHJlc3BvbnNpYmxlIGZvciBzZXR0aW5nIHdhc01hbmlwdWxhdGVkUHJvcGVydHkgY2FsbGluZyBjdXJ2ZUNoYW5nZWRFbWl0dGVyLmVtaXQoKS5cclxuICAgKi9cclxuICBwdWJsaWMgdHJpYW5nbGUoIHdpZHRoOiBudW1iZXIsIHBlYWtYOiBudW1iZXIsIHBlYWtZOiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgY29uc3QgY2xvc2VzdFBvaW50ID0gdGhpcy5nZXRDbG9zZXN0UG9pbnRBdCggcGVha1ggKTtcclxuXHJcbiAgICAvLyBBbW91bnQgdG8gc2hpZnQgdGhlIEN1cnZlUG9pbnQgY2xvc2VzdCB0byB0aGUgcGFzc2VkLWluIHBlYWsuXHJcbiAgICBjb25zdCBkZWx0YVkgPSBwZWFrWSAtIGNsb3Nlc3RQb2ludC5sYXN0U2F2ZWRZO1xyXG5cclxuICAgIC8vIFNldCB0aGUgc2xvcGUgY29lZmZpY2llbnQgc3VjaCB0aGF0IHRoZSBiYXNlIG9mIHRoZSB0cmlhbmdsZSBhdCB5PTAgaGFzIGEgJ3dpZHRoJyBlcXVhbFxyXG4gICAgLy8gdG8gdGhpcy5jdXJ2ZU1hbmlwdWxhdGlvbldpZHRoIHdoZW4gdGhlIHBlYWsgaXMgYXQgdHlwaWNhbFkgdmFsdWVcclxuICAgIGNvbnN0IHNsb3BlID0gVFlQSUNBTF9ZIC8gKCB3aWR0aCAvIDIgKTtcclxuXHJcbiAgICBjb25zdCBwZWFrRnVuY3Rpb24gPSAoIGRlbHRhWTogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyID0+IHtcclxuICAgICAgcmV0dXJuIHBlYWtZIC0gTWF0aC5zaWduKCBkZWx0YVkgKSAqIHNsb3BlICogTWF0aC5hYnMoIHggLSBjbG9zZXN0UG9pbnQueCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHkgdmFsdWVzIGFuZCBwb2ludCB0eXBlcyBvZiB0aGUgcG9pbnRzXHJcbiAgICB0aGlzLml0ZXJhdGVGdW5jdGlvbk92ZXJQb2ludHMoIHBlYWtGdW5jdGlvbiwgZGVsdGFZICk7XHJcblxyXG4gICAgLy8gSXRlcmF0ZUZ1bmN0aW9uT3ZlclBvaW50cyBhc3N1bWVzIHRoZSBwZWFrRnVuY3Rpb24gaXMgc21vb3RoLCBidXQgd2UgaGF2ZSBhIGN1c3AgYXQgdGhlIHBlYWsgb2YgdGhlIHRyaWFuZ2xlXHJcbiAgICBjbG9zZXN0UG9pbnQucG9pbnRUeXBlID0gJ2N1c3AnO1xyXG4gICAgdGhpcy5nZXRDbG9zZXN0UG9pbnRBdCggcGVha1ggKyB0aGlzLmRlbHRhWCApLnBvaW50VHlwZSA9ICdjdXNwJztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEltcGxlbWVudHMgdGhlIFBFREVTVEFMIEN1cnZlTWFuaXB1bGF0aW9uTW9kZS5cclxuICAgKiBDcmVhdGVzIGEgc21vb3RoIGFuZCBjb250aW51b3VzIHRyYXBlem9pZGFsLXNoYXBlZCBjdXJ2ZSB3aXRoIHJvdW5kZWQgY29ybmVycy5cclxuICAgKiBJZiB5b3UgY2FsbCB0aGlzIG1ldGhvZCwgeW91IGFyZSByZXNwb25zaWJsZSBmb3Igc2V0dGluZyB3YXNNYW5pcHVsYXRlZFByb3BlcnR5IGNhbGxpbmcgY3VydmVDaGFuZ2VkRW1pdHRlci5lbWl0KCkuXHJcbiAgICovXHJcbiAgcHVibGljIHBlZGVzdGFsKCB3aWR0aDogbnVtYmVyLCBwZWFrWDogbnVtYmVyLCBwZWFrWTogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIGNvbnN0IGNsb3Nlc3RQb2ludCA9IHRoaXMuZ2V0Q2xvc2VzdFBvaW50QXQoIHBlYWtYICk7XHJcblxyXG4gICAgLy8gU3VwZXIgR2F1c3NpYW4gZnVuY3Rpb24gZm9yIGNlbnRlcmVkIGF0IHgtdmFsdWUgYG11YCwgd2l0aCBtaW4gYW1wbGl0dWRlIG9mIDAgYW5kIG1heCBvZiAxO1xyXG4gICAgLy8gV2UgdXNlIHRoZSBzcXVhcmUgb2YgYSBHYXVzc2lhbiBpbiBvcmRlciB0byBoYXZlIGEgdmVyeSBzeW1tZXRyaWMgZGVyaXZhdGl2ZSBhdCB0aGUgZWRnZXMgb2YgdGhlIHBlZGVzdGFsXHJcbiAgICBjb25zdCBnYXVzc2lhbldlaWdodCA9ICggeDogbnVtYmVyLCBtdTogbnVtYmVyICkgPT5cclxuICAgICAgTWF0aC5leHAoIC0xICogKCAoIHggLSBtdSApIC8gRURHRV9TTE9QRV9GQUNUT1IgKSAqKiA0ICk7XHJcblxyXG4gICAgLy8gV2lkdGggYXQgdGhlIHRvcCBvZiB0aGUgcGVkZXN0YWw6IFRoZSB3aWR0aCBhcyBkZWZpbmVkIGFib3ZlIHJlcHJlc2VudHMgdGhlIHdpZHRoIGF0IHRoZSBiYXNlLCB0aGUgcGxhdGVhdSB3aWR0aFxyXG4gICAgLy8gbXVzdCB0aGVyZWZvcmUgdGFrZSBpbnRvIGFjY291bnQgdGhlIHdpZHRoIG9mIHRoZSBlZGdlcy5cclxuICAgIGNvbnN0IHBsYXRlYXVXaWR0aCA9IHdpZHRoIC0gMiAqIEVER0VfU0xPUEVfRkFDVE9SO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBsYXRlYXVXaWR0aCA+IDAsICdwbGF0ZWF1IHdpZHRoIG11c3QgYmUgcG9zaXRpdmUnICk7XHJcblxyXG4gICAgdGhpcy5wb2ludHMuZm9yRWFjaCggcG9pbnQgPT4ge1xyXG5cclxuICAgICAgLy8gV2VpZ2h0IGZvciBwb2ludCB0cmFuc2Zvcm1hdGlvblxyXG4gICAgICBsZXQgUDtcclxuXHJcbiAgICAgIC8vIENvbmRpdGlvbiBmb3IgdGhlIHBsYXRlYXVcclxuICAgICAgaWYgKCBNYXRoLmFicyggcG9pbnQueCAtIGNsb3Nlc3RQb2ludC54ICkgPCBwbGF0ZWF1V2lkdGggLyAyICkge1xyXG4gICAgICAgIFAgPSAxO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDb25kaXRpb24gZm9yIHRoZSBsZWZ0IG9mIHRoZSBwbGF0ZWF1XHJcbiAgICAgIGVsc2UgaWYgKCBwb2ludC54IDw9IGNsb3Nlc3RQb2ludC54ICkge1xyXG5cclxuICAgICAgICAvLyBHYXVzc2lhbiB3ZWlnaHQgdHJhbnNpdGlvbnMgc21vb3RobHkgZnJvbSAwIHRvIDEgYXMgeCBpbmNyZWFzZXNcclxuICAgICAgICBQID0gZ2F1c3NpYW5XZWlnaHQoIHBvaW50LngsIGNsb3Nlc3RQb2ludC54IC0gcGxhdGVhdVdpZHRoIC8gMiApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBQb2ludCBtdXN0IGJlIHRvIHRoZSByaWdodCBvZiBjbG9zZXN0UG9pbnRcclxuICAgICAgICAvLyBHYXVzc2lhbiB3ZWlnaHQgdHJhbnNpdGlvbnMgc21vb3RobHkgZnJvbSAxIHRvIDAgYXMgeCBpbmNyZWFzZXNcclxuICAgICAgICBQID0gZ2F1c3NpYW5XZWlnaHQoIHBvaW50LngsIGNsb3Nlc3RQb2ludC54ICsgcGxhdGVhdVdpZHRoIC8gMiApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVBvaW50VmFsdWUoIHBvaW50LCBQLCBwZWFrWSApO1xyXG4gICAgICB0aGlzLnVwZGF0ZVBvaW50VHlwZSggcG9pbnQsIFAgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEltcGxlbWVudHMgdGhlIFBBUkFCT0xBIEN1cnZlTWFuaXB1bGF0aW9uTW9kZS5cclxuICAgKiBDcmVhdGVzIGEgcXVhZHJhdGljIHRoYXQgaXMgbm9uLWRpZmZlcmVudGlhYmxlIHdoZXJlIGl0IGludGVyc2VjdHMgd2l0aCB0aGUgcmVzdCBvZiB0aGUgQ3VydmUuXHJcbiAgICogSWYgeW91IGNhbGwgdGhpcyBtZXRob2QsIHlvdSBhcmUgcmVzcG9uc2libGUgZm9yIHNldHRpbmcgd2FzTWFuaXB1bGF0ZWRQcm9wZXJ0eSBjYWxsaW5nIGN1cnZlQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBwYXJhYm9sYSggd2lkdGg6IG51bWJlciwgcGVha1g6IG51bWJlciwgcGVha1k6IG51bWJlciApOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBjbG9zZXN0UG9pbnQgPSB0aGlzLmdldENsb3Nlc3RQb2ludEF0KCBwZWFrWCApO1xyXG5cclxuICAgIC8vIEFtb3VudCB0byBzaGlmdCB0aGUgQ3VydmVQb2ludCBjbG9zZXN0IHRvIHRoZSBwYXNzZWQtaW4gcGVhay5cclxuICAgIGNvbnN0IGRlbHRhWSA9IHBlYWtZIC0gY2xvc2VzdFBvaW50Lmxhc3RTYXZlZFk7XHJcblxyXG4gICAgLy8gV2lsbCBzZXQgdGhlIHBhcmFib2xhIGNvZWZmaWNpZW50IHN1Y2ggdGhhdCB0aGUgcGFyYWJvbGEgYXQgeT0wIGhhcyBhICd3aWR0aCcgZXF1YWxcclxuICAgIC8vIHRvIHRoaXMuY3VydmVNYW5pcHVsYXRpb25XaWR0aCB3aGVuIHRoZSBwZWFrIGlzIGF0IGEgdHlwaWNhbFkgdmFsdWVcclxuICAgIGNvbnN0IEEgPSBUWVBJQ0FMX1kgKiBNYXRoLnBvdyggMiAvIHdpZHRoLCAyICk7XHJcblxyXG4gICAgY29uc3QgcGVha0Z1bmN0aW9uID0gKCBkZWx0YVk6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciA9PiB7XHJcblxyXG4gICAgICByZXR1cm4gcGVha1kgLSBNYXRoLnNpZ24oIGRlbHRhWSApICogQSAqIE1hdGgucG93KCB4IC0gY2xvc2VzdFBvaW50LngsIDIgKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSB5IHZhbHVlcyBhbmQgcG9pbnQgdHlwZXMgb2YgdGhlIHBvaW50c1xyXG4gICAgdGhpcy5pdGVyYXRlRnVuY3Rpb25PdmVyUG9pbnRzKCBwZWFrRnVuY3Rpb24sIGRlbHRhWSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW1wbGVtZW50cyB0aGUgU0lOVVNPSUQgQ3VydmVNYW5pcHVsYXRpb25Nb2RlLlxyXG4gICAqIENyZWF0ZXMgYSBzaW51c29pZGFsIHdhdmUgd2l0aCBhIHZhcnlpbmcgYW1wbGl0dWRlIGJhc2VkIG9uIHRoZSBkcmFnLXBvc2l0aW9uLlxyXG4gICAqIElmIHlvdSBjYWxsIHRoaXMgbWV0aG9kLCB5b3UgYXJlIHJlc3BvbnNpYmxlIGZvciBzZXR0aW5nIHdhc01hbmlwdWxhdGVkUHJvcGVydHkgY2FsbGluZyBjdXJ2ZUNoYW5nZWRFbWl0dGVyLmVtaXQoKS5cclxuICAgKi9cclxuICBwdWJsaWMgc2ludXNvaWQoIHdpZHRoOiBudW1iZXIsIHg6IG51bWJlciwgeTogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIGNvbnN0IGNsb3Nlc3RQb2ludCA9IHRoaXMuZ2V0Q2xvc2VzdFBvaW50QXQoIHggKTtcclxuXHJcbiAgICAvLyBXYXZlbGVuZ3RoIGFzc29jaWF0ZWQgd2l0aCB0aGUgc2ludXNvaWRhbCBmdW5jdGlvblxyXG4gICAgY29uc3Qgd2F2ZWxlbmd0aCA9IDIgKiBNYXRoLlBJICogd2lkdGggLyBDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMuQ1VSVkVfTUFOSVBVTEFUSU9OX1dJRFRIX1JBTkdFLmRlZmF1bHRWYWx1ZTtcclxuXHJcbiAgICAvLyBDb3NpbmUgZnVuY3Rpb24gdG8gYXBwbHkgdG8gcG9pbnRzLiBDb3NpbmUgZnVuY3Rpb24gcGFzc2VzIHRocm91Z2ggYHBvc2l0aW9uYFxyXG4gICAgY29uc3QgY29zaW5lRnVuY3Rpb24gPSAoIHg6IG51bWJlciApID0+XHJcbiAgICAgIHkgKiBNYXRoLmNvcyggTWF0aC5QSSAqIDIgKiAoICggY2xvc2VzdFBvaW50LnggLSB4ICkgKSAvIHdhdmVsZW5ndGggKTtcclxuXHJcbiAgICAvLyBXZWlnaHQgZnVuY3Rpb24gdGhhdCBnb2VzIGZyb20gMSB0byAwIGZyb20gaGlnaFggdG8gbG93WFxyXG4gICAgLy8gTm90ZSB0aGF0IHRoZSBmYWN0IHRoYXQgaXQgaXMgYSBjb3NpbmUgZnVuY3Rpb24gaXMgaGFwcGVuc3RhbmNlXHJcbiAgICBjb25zdCB3ZWlnaHRGdW5jdGlvbiA9ICggcG9pbnQ6IEN1cnZlUG9pbnQsIGhpZ2hYOiBudW1iZXIsIGxvd1g6IG51bWJlciApID0+XHJcbiAgICAgIE1hdGguY29zKCBNYXRoLlBJIC8gMiAqICggcG9pbnQueCAtIGhpZ2hYICkgLyBNYXRoLmFicyggbG93WCAtIGhpZ2hYICkgKSAqKiAyO1xyXG5cclxuICAgIC8vIEJhc2Ugd2lkdGggd2hlcmUgd2UgYXBwbHkgdGhlIHNpbnVzb2lkYWwgZnVuY3Rpb24gLSBpZGVhbGx5IGl0IHNob3VsZCBiZSBhbiBvZGQgbXVsdGlwbGUgb2YgaGFsZi13YXZlbGVuZ3Roc1xyXG4gICAgY29uc3QgY29zaW5lQmFzZSA9IDcgKiAoIHdhdmVsZW5ndGggLyAyICk7XHJcblxyXG4gICAgLy8gV2lkdGggb2YgdGhlIHRyYW5zaXRpb24gcmVnaW9uIHRvIHRoZSBsZWZ0IGFuZCByaWdodCAtIGlkZWFsbHkgc2hvdWxkIGJlIGxlc3MgdGhhbiBhIHF1YXJ0ZXIgd2F2ZWxlbmd0aFxyXG4gICAgY29uc3QgZWRnZVdpZHRoID0gd2F2ZWxlbmd0aCAvIDg7XHJcblxyXG4gICAgLy8gICAgICAgICAgICAgfDwtLS0tLS0tLS0tLS0tLS1jb3NpbmVCYXNlLS0tLS0tLS0tLS0tLS0tLS0tLS0+fFxyXG4gICAgLy8gICAtLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS1cclxuICAgIC8vICAgICAgICAgIGxlZnRNaW4gICAgICAgIGxlZnRNYXggICAgICAgICByaWdodE1pbiAgICAgICAgcmlnaHRNYXhcclxuICAgIC8vICAgLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tXHJcbiAgICAvLyAgICAgICAgICAgICB8PC1lZGdlV2lkdGgtLT58ICAgICAgICAgICAgICAgICB8PC1lZGdlV2lkdGgtLT58XHJcblxyXG4gICAgLy8gQm91bmRzIHRvIHRoZSB0cmFuc2l0aW9uIHJlZ2lvbnMgdG8gdGhlIHJpZ2h0IGFuZCB0aGUgbGVmdCBmb3IgdGhlIHNpbnVzb2lkYWwgZnVuY3Rpb25cclxuXHJcbiAgICBjb25zdCBjb3NpbmVCYXNlTWF4ID0gY2xvc2VzdFBvaW50LnggKyBjb3NpbmVCYXNlIC8gMjtcclxuICAgIGNvbnN0IGNvc2luZUJhc2VNaW4gPSBjbG9zZXN0UG9pbnQueCAtIGNvc2luZUJhc2UgLyAyO1xyXG5cclxuICAgIGNvbnN0IHJpZ2h0TWF4ID0gKCBjb3NpbmVCYXNlTWF4ID4gdGhpcy54UmFuZ2UubWF4ICkgPyBjb3NpbmVCYXNlTWF4IDogdGhpcy5nZXRDbG9zZXN0UG9pbnRBdCggY29zaW5lQmFzZU1heCApLng7XHJcbiAgICBjb25zdCBsZWZ0TWluID0gKCBjb3NpbmVCYXNlTWluIDwgdGhpcy54UmFuZ2UubWluICkgPyBjb3NpbmVCYXNlTWluIDogdGhpcy5nZXRDbG9zZXN0UG9pbnRBdCggY29zaW5lQmFzZU1pbiApLng7XHJcbiAgICBjb25zdCByaWdodE1pbiA9IHJpZ2h0TWF4IC0gZWRnZVdpZHRoO1xyXG4gICAgY29uc3QgbGVmdE1heCA9IGxlZnRNaW4gKyBlZGdlV2lkdGg7XHJcblxyXG4gICAgLy8gSXMgdGhlIHRyYW5zaXRpb24gcmVnaW9uIHRvIHRoZSBsZWZ0IGN1cnJlbnRseSB6ZXJvIChvciBuZWFybHkgemVybylcclxuICAgIGNvbnN0IGlzTGVmdFJlZ2lvblplcm8gPSB0aGlzLmlzUmVnaW9uWmVybyggbGVmdE1pbiwgbGVmdE1heCApO1xyXG5cclxuICAgIC8vIElzIHRoZSB0cmFuc2l0aW9uIHJlZ2lvbiB0byB0aGUgcmlnaHQgY3VycmVudGx5IHplcm8gKG9yIG5lYXJseSB6ZXJvKVxyXG4gICAgY29uc3QgaXNSaWdodFJlZ2lvblplcm8gPSB0aGlzLmlzUmVnaW9uWmVybyggcmlnaHRNaW4sIHJpZ2h0TWF4ICk7XHJcblxyXG4gICAgdGhpcy5wb2ludHMuZm9yRWFjaCggcG9pbnQgPT4ge1xyXG5cclxuICAgICAgLy8gV2VpZ2h0IGFzc29jaWF0ZWQgd2l0aCB0aGUgc2ludXNvaWRhbCBmdW5jdGlvbjogIDA8PVA8PTFcclxuICAgICAgLy8gUD0xIGNvcnJlc3BvbmRzIHRvIGEgcHVyZSBzaW51c29pZGFsIGZ1bmN0aW9uIChvdmVycmlkaW5nIHRoZSBwcmV2aW91cyBmdW5jdGlvbilcclxuICAgICAgLy8gd2hlcmVhcyBQPTAgZ2l2ZXMgYWxsIHRoZSB3ZWlnaHQgdG8gdGhlIGluaXRpYWwgKHNhdmVkKSBmdW5jdGlvbi9jdXJ2ZSAoc2ludXNvaWRhbCBmdW5jdGlvbiBoYXMgbm8gZWZmZWN0KS5cclxuICAgICAgbGV0IFA6IG51bWJlcjtcclxuXHJcbiAgICAgIGlmICggcG9pbnQueCA+PSBsZWZ0TWF4ICYmIHBvaW50LnggPD0gcmlnaHRNaW4gKSB7XHJcblxyXG4gICAgICAgIC8vIEluIHRoZSBpbm5lciByZWdpb24sIGFsd2F5cyBoYXZlIGEgcHVyZSBzaW51c29pZGFsLCB3ZWlnaHQgb2YgMVxyXG4gICAgICAgIFAgPSAxO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBwb2ludC54ID4gbGVmdE1pbiAmJiBwb2ludC54IDwgbGVmdE1heCApIHtcclxuXHJcbiAgICAgICAgLy8gSW4gdGhlIG91dGVyIHJlZ2lvbiB0byB0aGUgbGVmdCBQIHRyYW5zaXRpb25zIGZyb20gMCB0byAxLCB1bmxlc3MgaXQgaXMgZW1wdHksIGluIHdoaWNoIGNhc2UgaXQgaXMgMVxyXG4gICAgICAgIFAgPSBpc0xlZnRSZWdpb25aZXJvID8gMSA6IHdlaWdodEZ1bmN0aW9uKCBwb2ludCwgbGVmdE1heCwgbGVmdE1pbiApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBwb2ludC54ID4gcmlnaHRNaW4gJiYgcG9pbnQueCA8IHJpZ2h0TWF4ICkge1xyXG5cclxuICAgICAgICAvLyBJbiB0aGUgb3V0ZXIgcmVnaW9uIHRvIHRoZSByaWdodCBQIHRyYW5zaXRpb25zIGZyb20gMSB0byAwLCB1bmxlc3MgaXQgaXMgZW1wdHksIGluIHdoaWNoIGNhc2UgaXQgaXMgMVxyXG4gICAgICAgIFAgPSBpc1JpZ2h0UmVnaW9uWmVybyA/IDEgOiB3ZWlnaHRGdW5jdGlvbiggcG9pbnQsIHJpZ2h0TWluLCByaWdodE1heCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBPdXRzaWRlIHRoZSBjb3NpbmUgYmFzZSwgdGhlIHdlaWdodCBpcyB6ZXJvXHJcbiAgICAgICAgUCA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEFzc2lnbiB0aGUgeSB2YWx1ZSB3aXRoIHRoZSBjb3JyZWN0IHdlaWdodFxyXG4gICAgICBwb2ludC55ID0gUCAqIGNvc2luZUZ1bmN0aW9uKCBwb2ludC54ICkgKyAoIDEgLSBQICkgKiBwb2ludC5sYXN0U2F2ZWRZO1xyXG5cclxuICAgICAgLy8gQXNzaWduIHRoZSBwb2ludCB0eXBlXHJcbiAgICAgIHRoaXMudXBkYXRlUG9pbnRUeXBlKCBwb2ludCwgUCApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIElmIHRoZSBsZWZ0IHJlZ2lvbiB3YXMgemVybyBhbmQgd2l0aGluIHRoZSByYW5nZSBvZiB0aGUgY3VydmUsIHRoZW4gdGhlIHNpbnVzb2lkYWwgZnVuY3Rpb24gd2lsbCBoYXZlIGEga2luay5cclxuICAgIC8vIFNvIHdlIG11c3QgdGFnIHRoZSBjdXNwcyBhdCB0aGUgbGVmdCBlZGdlIG9mIHRoZSBjdXJ2ZSBpbiB0aGF0IGNhc2VcclxuICAgIGlmICggaXNMZWZ0UmVnaW9uWmVybyAmJiAoIGNvc2luZUJhc2VNaW4gPiB0aGlzLnhSYW5nZS5taW4gKSApIHtcclxuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmdldENsb3Nlc3RJbmRleEF0KCBsZWZ0TWluICk7XHJcbiAgICAgIHRoaXMucG9pbnRzWyBpbmRleCBdLnBvaW50VHlwZSA9ICdjdXNwJztcclxuICAgICAgaWYgKCB0aGlzLnBvaW50c1sgaW5kZXggKyAxIF0gKSB7XHJcbiAgICAgICAgdGhpcy5wb2ludHNbIGluZGV4ICsgMSBdLnBvaW50VHlwZSA9ICdjdXNwJztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHRoZSByaWdodCByZWdpb24gd2FzIHplcm8gYW5kIHdpdGhpbiB0aGUgcmFuZ2Ugb2YgdGhlIGN1cnZlLCB0aGVuIHRoZSBzaW51c29pZGFsIGZ1bmN0aW9uIHdpbGwgaGF2ZSBhIGtpbmsgb24gdGhlIHJpZ2h0IHNpZGVcclxuICAgIC8vIFNvIHdlIG11c3QgdGFnIHRoZSBjdXNwcyBhdCB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgY3VydmUgaW4gdGhhdCBjYXNlLlxyXG4gICAgaWYgKCBpc1JpZ2h0UmVnaW9uWmVybyAmJiAoIGNvc2luZUJhc2VNYXggPCB0aGlzLnhSYW5nZS5tYXggKSApIHtcclxuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmdldENsb3Nlc3RJbmRleEF0KCByaWdodE1heCApO1xyXG4gICAgICB0aGlzLnBvaW50c1sgaW5kZXggXS5wb2ludFR5cGUgPSAnY3VzcCc7XHJcbiAgICAgIGlmICggdGhpcy5wb2ludHNbIGluZGV4IC0gMSBdICkge1xyXG4gICAgICAgIHRoaXMucG9pbnRzWyBpbmRleCAtIDEgXS5wb2ludFR5cGUgPSAnY3VzcCc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEltcGxlbWVudHMgdGhlIEZSRUVGT1JNIEN1cnZlTWFuaXB1bGF0aW9uTW9kZS5cclxuICAgKiBBbGxvd3MgdGhlIHVzZXIgdG8gZHJhZyBQb2ludHMgaW4gdGhlIEN1cnZlIHRvIGFueSBkZXNpcmVkIHBvc2l0aW9uIHRvIGNyZWF0ZSBjdXN0b20gYnV0IHNtb290aCBzaGFwZXMuXHJcbiAgICogVGhpcyBtZXRob2Qgd2lsbCB1cGRhdGUgdGhlIGN1cnZlIHdpdGggdGhlIG5ldyBwb3NpdGlvbiB2YWx1ZS4gSXQgYXR0ZW1wdHMgdG8gY3JlYXRlIGEgc21vb3RoIGN1cnZlXHJcbiAgICogYmV0d2VlbiBwb3NpdGlvbiBhbmQgYW50ZXBlbnVsdGltYXRlUG9zaXRpb24uIFRoZSBtYWluIGdvYWwgb2YgdGhlIGRyYXdUb0Zvcm0gbWV0aG9kIGlzIHRvIGNyZWF0ZSBhXHJcbiAgICogY3VydmUgc2VnbWVudCB0aGF0IGlzIHNtb290aCBlbm91Z2ggdGhhdCBpdCBjYW4gYmUgdHdpY2UgZGlmZmVyZW50aWFibGUgd2l0aG91dCBnZW5lcmF0aW5nIGRpc2NvbnRpbnVpdGllcy5cclxuICAgKiBJZiB5b3UgY2FsbCB0aGlzIG1ldGhvZCwgeW91IGFyZSByZXNwb25zaWJsZSBmb3Igc2V0dGluZyB3YXNNYW5pcHVsYXRlZFByb3BlcnR5IGNhbGxpbmcgY3VydmVDaGFuZ2VkRW1pdHRlci5lbWl0KCkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcG9zaXRpb24gLSBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAqIEBwYXJhbSBwZW51bHRpbWF0ZVBvc2l0aW9uIC0gaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgKiBAcGFyYW0gYW50ZXBlbnVsdGltYXRlUG9zaXRpb24gLSBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBmcmVlZm9ybSggcG9zaXRpb246IFZlY3RvcjIsIHBlbnVsdGltYXRlUG9zaXRpb246IFZlY3RvcjIgfCBudWxsLCBhbnRlcGVudWx0aW1hdGVQb3NpdGlvbjogVmVjdG9yMiB8IG51bGwgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gQ2xvc2VzdCBwb2ludCBhc3NvY2lhdGVkIHdpdGggdGhlIHBvc2l0aW9uXHJcbiAgICBjb25zdCBjbG9zZXN0UG9pbnQgPSB0aGlzLmdldENsb3Nlc3RQb2ludEF0KCBwb3NpdGlvbi54ICk7XHJcblxyXG4gICAgLy8gQW1vdW50IHRvIHNoaWZ0IHRoZSBDdXJ2ZVBvaW50IGNsb3Nlc3QgdG8gdGhlIHBhc3NlZC1pbiBwb3NpdGlvbi5cclxuICAgIGNsb3Nlc3RQb2ludC55ID0gcG9zaXRpb24ueTtcclxuXHJcbiAgICAvLyBQb2ludCBhc3NvY2lhdGVkIHdpdGggdGhlIGxhc3QgZHJhZyBldmVudFxyXG4gICAgaWYgKCBwZW51bHRpbWF0ZVBvc2l0aW9uICkge1xyXG4gICAgICBjb25zdCBsYXN0UG9pbnQgPSB0aGlzLmdldENsb3Nlc3RQb2ludEF0KCBwZW51bHRpbWF0ZVBvc2l0aW9uLnggKTtcclxuXHJcbiAgICAgIC8vIFdlIHdhbnQgdG8gY3JlYXRlIGEgc3RyYWlnaHQgbGluZSBiZXR3ZWVuIHRoaXMgcG9pbnQgYW5kIHRoZSBsYXN0IGRyYWcgZXZlbnQgcG9pbnRcclxuICAgICAgY29uc3QgY2xvc2VzdFZlY3RvciA9IGNsb3Nlc3RQb2ludC5nZXRWZWN0b3IoKTtcclxuICAgICAgdGhpcy5pbnRlcnBvbGF0ZSggY2xvc2VzdFZlY3Rvci54LCBjbG9zZXN0VmVjdG9yLnksIGxhc3RQb2ludC54LCBwZW51bHRpbWF0ZVBvc2l0aW9uLnkgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gVGhlcmUgaXMgbm8gcG9zaXRpb24gYXNzb2NpYXRlZCB3aXRoIHRoZSBsYXN0IGRyYWcgZXZlbnQuXHJcbiAgICAgIC8vIExldCdzIGNyZWF0ZSBhIGhpbGwgd2l0aCBhIG5hcnJvdyB3aWR0aCBhdCB0aGUgY2xvc2VzdFBvaW50LlxyXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NhbGN1bHVzLWdyYXBoZXIvaXNzdWVzLzIxOFxyXG4gICAgICB0aGlzLmhpbGwoIFdFRV9XSURUSCwgY2xvc2VzdFBvaW50LngsIGNsb3Nlc3RQb2ludC55ICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBwZW51bHRpbWF0ZVBvc2l0aW9uICYmIGFudGVwZW51bHRpbWF0ZVBvc2l0aW9uICkge1xyXG5cclxuICAgICAgY29uc3QgbGFzdFBvaW50ID0gdGhpcy5nZXRDbG9zZXN0UG9pbnRBdCggcGVudWx0aW1hdGVQb3NpdGlvbi54ICk7XHJcblxyXG4gICAgICAvLyBQb2ludCBhc3NvY2lhdGVkIHdpdGggdGhlIGxhc3QgZHJhZyBldmVudFxyXG4gICAgICBjb25zdCBuZXh0VG9MYXN0UG9pbnQgPSB0aGlzLmdldENsb3Nlc3RQb2ludEF0KCBhbnRlcGVudWx0aW1hdGVQb3NpdGlvbi54ICk7XHJcblxyXG4gICAgICAvLyBDaGVja3MgdGhhdCBsYXN0UG9pbnQgaXMgaW4gYmV0d2VlbiBjbG9zZXN0UG9pbnQgYW5kIG5leHRUb0xhc3RQb2ludFxyXG4gICAgICBpZiAoICggY2xvc2VzdFBvaW50LnggLSBsYXN0UG9pbnQueCApICogKCBuZXh0VG9MYXN0UG9pbnQueCAtIGxhc3RQb2ludC54ICkgPCAwICkge1xyXG5cclxuICAgICAgICAvLyBGaW5kcyB0d28gY29udHJvbCBwb2ludHMgdGhhdCBhcmUgYXBwcm94aW1hdGVseSBtaWR3YXkgYmV0d2VlbiBvdXIgdGhyZWUgcG9pbnRzXHJcbiAgICAgICAgY29uc3QgY3AxUG9pbnQgPSB0aGlzLmdldENsb3Nlc3RQb2ludEF0KCAoIHBvc2l0aW9uLnggKyBwZW51bHRpbWF0ZVBvc2l0aW9uLnggKSAvIDIgKTtcclxuICAgICAgICBjb25zdCBjcDJQb2ludCA9IHRoaXMuZ2V0Q2xvc2VzdFBvaW50QXQoICggcGVudWx0aW1hdGVQb3NpdGlvbi54ICsgYW50ZXBlbnVsdGltYXRlUG9zaXRpb24ueCApIC8gMiApO1xyXG5cclxuICAgICAgICAvLyBDaGVjayB0aGF0IHRoZSBsYXN0UG9pbnQgaXMgYmV0d2VlbiBjcDEgYW5kIGNwMlxyXG4gICAgICAgIGlmICggKCBjcDFQb2ludC54IC0gbGFzdFBvaW50LnggKSAqICggY3AyUG9pbnQueCAtIGxhc3RQb2ludC54ICkgPCAwICkge1xyXG5cclxuICAgICAgICAgIC8vIHggc2VwYXJhdGlvbiBiZXR3ZWVuIHR3byBhZGphY2VudCBwb2ludHMgaW4gYSBjdXJ2ZSBhcnJheVxyXG4gICAgICAgICAgY29uc3QgZGVsdGFYID0gdGhpcy5kZWx0YVg7XHJcblxyXG4gICAgICAgICAgLy8gVmVjdG9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIGRyYWcgZXZlbnRzLlxyXG4gICAgICAgICAgLy8gTm90ZSB0aGF0IHRoZSB4LXZhbHVlcyBhcmUgdGhlIGFsbG93ZWQgQ3VydmVQb2ludHMgeC12YWx1ZXMgYnV0IHRoZVxyXG4gICAgICAgICAgLy8geS12YWx1ZXMgbWF0Y2ggdGhlIHkgdmFsdWUgZnJvbSB0aGUgZHJhZ0xpc3RlbmVyXHJcbiAgICAgICAgICBjb25zdCB2MSA9IG5ldyBWZWN0b3IyKCBuZXh0VG9MYXN0UG9pbnQueCwgYW50ZXBlbnVsdGltYXRlUG9zaXRpb24ueSApO1xyXG4gICAgICAgICAgY29uc3QgdjIgPSBuZXcgVmVjdG9yMiggbGFzdFBvaW50LngsIHBlbnVsdGltYXRlUG9zaXRpb24ueSApO1xyXG4gICAgICAgICAgY29uc3QgdjMgPSBuZXcgVmVjdG9yMiggY2xvc2VzdFBvaW50LngsIHBvc2l0aW9uLnkgKTtcclxuXHJcbiAgICAgICAgICAvLyBBcmUgd2UgZHJhZ2dpbmcgZnJvbSBsZWZ0IHRvIHJpZ2h0P1xyXG4gICAgICAgICAgY29uc3QgaXNBc2NlbmRpbmcgPSBuZXh0VG9MYXN0UG9pbnQueCA8IGNsb3Nlc3RQb2ludC54O1xyXG5cclxuICAgICAgICAgIGNvbnN0IHNvcnRlZFZlY3RvcnMgPSBpc0FzY2VuZGluZyA/IFsgdjEsIHYyLCB2MyBdIDogWyB2MywgdjIsIHYxIF07XHJcblxyXG4gICAgICAgICAgLy8gUGllY2V3aXNlIGZ1bmN0aW9uIGNvbXBvc2VkIG9mIHRoZSB0d28gbGluZWFyIGZ1bmN0aW9ucy5cclxuICAgICAgICAgIGNvbnN0IHBpZWNld2lzZUZ1bmN0aW9uID0gbmV3IENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24oIHNvcnRlZFZlY3RvcnMgKTtcclxuXHJcbiAgICAgICAgICAvLyBEaXN0YW5jZSBvdmVyIHdoaWNoIHdlIHdpbGwgbW9sbGlmeSB0aGUgcG9pbnRzXHJcbiAgICAgICAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguYWJzKCBjcDJQb2ludC54IC0gY3AxUG9pbnQueCApO1xyXG4gICAgICAgICAgY29uc3QgbnVtYmVyU3RlcHMgPSBkaXN0YW5jZSAvIGRlbHRhWDtcclxuXHJcbiAgICAgICAgICAvLyBBcmUgd2UgaW5jcmVtZW50aW5nIHBvaW50cyBmcm9tIHJpZ2h0IHRvIGxlZnQgb3IgbGVmdCB0byByaWdodD9cclxuICAgICAgICAgIGNvbnN0IHNpZ25lZERlbHRhWCA9IGlzQXNjZW5kaW5nID8gZGVsdGFYIDogLWRlbHRhWDtcclxuXHJcbiAgICAgICAgICAvLyBBIGZ1bmN0aW9uIG9mIHggdXNlZCB0aGF0IHdpbGwgYmUgdXNlZCB0byBtb2xsaWZ5IHRoZSBwaWVjZXdpc2UgZnVuY3Rpb25cclxuICAgICAgICAgIGNvbnN0IG1vbGxpZmllckZ1bmN0aW9uID0gY3JlYXRlTW9sbGlmaWVyRnVuY3Rpb24oIGRpc3RhbmNlICk7XHJcblxyXG4gICAgICAgICAgLy8gSXRlcmF0ZSBvdmVyIHRoZSBpbnRlcm1lZGlhdGUgeC12YWx1ZXMgdGhhdCBuZWVkIHRvIGJlIG1vbGxpZmllZC5cclxuICAgICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlclN0ZXBzOyBpKysgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB4IHZhbHVlIG9mIHRoZSBwb2ludCB0aGF0IG5lZWRzIHRvIGJlIG1vbGxpZmllZFxyXG4gICAgICAgICAgICBjb25zdCB4ID0gY3AyUG9pbnQueCArIGkgKiBzaWduZWREZWx0YVg7XHJcblxyXG4gICAgICAgICAgICAvLyBXZWlnaHQgb2YgdGhlIG1vbGxpZmllciBmdW5jdGlvblxyXG4gICAgICAgICAgICBsZXQgd2VpZ2h0ID0gMDtcclxuXHJcbiAgICAgICAgICAgIC8vIFdlaWdodCBvZiB0aGUgcGllY2V3aXNlRnVuY3Rpb25cclxuICAgICAgICAgICAgbGV0IGZ1bmN0aW9uV2VpZ2h0ID0gMDtcclxuXHJcbiAgICAgICAgICAgIC8vIEFwcGx5IHRoZSBtb2xsaWZ5aW5nIGFsZ29yaXRobSBvbiB0aGUgcG9pbnQgbG9jYXRlZCBhdCB4IGJ5IGNvbnZvbHV0aW5nIGl0IHdpdGggbmVhcmJ5IHBvaW50c1xyXG4gICAgICAgICAgICBmb3IgKCBsZXQgZHggPSAtZGlzdGFuY2U7IGR4IDwgZGlzdGFuY2U7IGR4ICs9IGRlbHRhWCAvIDQgKSB7XHJcbiAgICAgICAgICAgICAgd2VpZ2h0ICs9IG1vbGxpZmllckZ1bmN0aW9uKCBkeCApO1xyXG4gICAgICAgICAgICAgIGZ1bmN0aW9uV2VpZ2h0ICs9IG1vbGxpZmllckZ1bmN0aW9uKCBkeCApICogcGllY2V3aXNlRnVuY3Rpb24uZXZhbHVhdGUoIHggKyBkeCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0Q2xvc2VzdFBvaW50QXQoIHggKS55ID0gZnVuY3Rpb25XZWlnaHQgLyB3ZWlnaHQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQXNzaWduIHR5cGUgdG8gcG9pbnRzXHJcblxyXG4gICAgLy8gTWFpbiBpZGVhOiBhc3NpZ24gdGhlIHNtb290aCB0eXBlIHRvIEFMTCBwb2ludHMgYmV0d2VlbiBwZW51bHRpbWF0ZVBvc2l0aW9uIHRvIHBvc2l0aW9uIChcclxuICAgIC8vIGFuZCBwb3NzaWJseSBhbnRlcGVudWx0aW1hdGVQb3NpdGlvbiBpZiBpdCBleGlzdHMpLCB0aGVuIGNvbWUgYmFjayB0byBpdCBieSByZWFzc2lnbmluZyB0aGVcclxuICAgIC8vIGNsb3Nlc3RQb2ludCAoYW5kIGl0cyBwb2ludCBwYXJ0bmVyIGFoZWFkIG9mIHRoZSBkcmFnKSB0byBiZSBkaXNjb250aW51b3VzLlxyXG5cclxuICAgIC8vIGRvZXMgcGVudWx0aW1hdGVQb3NpdGlvbiBleGlzdD9cclxuICAgIGlmICggcGVudWx0aW1hdGVQb3NpdGlvbiApIHtcclxuXHJcbiAgICAgIC8vIFBvaW50IGFzc29jaWF0ZWQgd2l0aCB0aGUgbGFzdCBkcmFnIGV2ZW50XHJcbiAgICAgIGNvbnN0IGxhc3RQb2ludCA9IHRoaXMuZ2V0Q2xvc2VzdFBvaW50QXQoIHBlbnVsdGltYXRlUG9zaXRpb24ueCApO1xyXG5cclxuICAgICAgLy8gRmluZCB0aGUgaW5kZXggb2YgdGhlIGNsb3Nlc3RQb2ludCBhbmQgdGhlIGxhc3RQb2ludFxyXG4gICAgICBjb25zdCBsYXN0UG9pbnRJbmRleCA9IHRoaXMuZ2V0SW5kZXgoIGxhc3RQb2ludCApO1xyXG4gICAgICBjb25zdCBjbG9zZXN0UG9pbnRJbmRleCA9IHRoaXMuZ2V0SW5kZXgoIGNsb3Nlc3RQb2ludCApO1xyXG5cclxuICAgICAgLy8gQXNzaWduIHRoZSBwb2ludHMgYmV0d2VlbiB0aGUgbGFzdFBvaW50IGFuZCB0aGUgY2xvc2VzdFBvaW50IHRvIGJlIHNtb290aFxyXG4gICAgICBsZXQgbWluID0gTWF0aC5taW4oIGNsb3Nlc3RQb2ludEluZGV4LCBsYXN0UG9pbnRJbmRleCApO1xyXG4gICAgICBsZXQgbWF4ID0gTWF0aC5tYXgoIGNsb3Nlc3RQb2ludEluZGV4LCBsYXN0UG9pbnRJbmRleCApO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IG1pbjsgaSA8PSBtYXg7IGkrKyApIHtcclxuICAgICAgICB0aGlzLnBvaW50c1sgaSBdLnBvaW50VHlwZSA9ICdzbW9vdGgnO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBEb2VzIGFudGVwZW51bHRpbWF0ZVBvc2l0aW9uIGV4aXN0P1xyXG4gICAgICBpZiAoIGFudGVwZW51bHRpbWF0ZVBvc2l0aW9uICkge1xyXG5cclxuICAgICAgICBjb25zdCBuZXh0VG9MYXN0UG9pbnQgPSB0aGlzLmdldENsb3Nlc3RQb2ludEF0KCBhbnRlcGVudWx0aW1hdGVQb3NpdGlvbi54ICk7XHJcblxyXG4gICAgICAgIC8vIEZpbmQgdGhlIGluZGV4IG9mIHRoZSBuZXh0VG9MYXN0UG9pbnRcclxuICAgICAgICBjb25zdCBuZXh0VG9MYXN0UG9pbnRJbmRleCA9IHRoaXMuZ2V0SW5kZXgoIG5leHRUb0xhc3RQb2ludCApO1xyXG5cclxuICAgICAgICAvLyBBc3NpZ24gdGhlIHBvaW50cyBiZXR3ZWVuIHRoZSBuZXh0VG9MYXN0UG9pbnQgYW5kIHRoZSBsYXN0UG9pbnQgdG8gYmUgc21vb3RoXHJcbiAgICAgICAgbWluID0gTWF0aC5taW4oIGxhc3RQb2ludEluZGV4LCBuZXh0VG9MYXN0UG9pbnRJbmRleCApO1xyXG4gICAgICAgIG1heCA9IE1hdGgubWF4KCBsYXN0UG9pbnRJbmRleCwgbmV4dFRvTGFzdFBvaW50SW5kZXggKTtcclxuXHJcbiAgICAgICAgZm9yICggbGV0IGkgPSBtaW47IGkgPD0gbWF4OyBpKysgKSB7XHJcbiAgICAgICAgICBjb25zdCBwb2ludCA9IHRoaXMucG9pbnRzWyBpIF07XHJcblxyXG4gICAgICAgICAgLy8gV2UgZG9uJ3Qgd2FudCB0byBhc3NpZ24gdGhlIHZlcnkgbGFzdCBwb2ludCBhcyBpdCBtYXkgYmUgZGlzY29udGludW91cyBpZiB0aGUgZHJhZyBoYXMgdHVybmVkXHJcbiAgICAgICAgICBpZiAoIHBvaW50ICE9PSBuZXh0VG9MYXN0UG9pbnQgKSB7XHJcbiAgICAgICAgICAgIHBvaW50LnBvaW50VHlwZSA9ICdzbW9vdGgnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQXNzaWduIHRoZSBjdXJyZW50IGRyYWcgcG9zaXRpb24gdG8gYmUgZGlzY29udGludW91c1xyXG4gICAgICBjbG9zZXN0UG9pbnQucG9pbnRUeXBlID0gJ2Rpc2NvbnRpbnVvdXMnO1xyXG5cclxuICAgICAgLy8gV2UgbmVlZCB0byBmaWd1cmUgb3V0IHdoYXQgaXMgdGhlIGRpcmVjdGlvbiBvZiB0aGUgZHJhZywgYW5kIGFzc2lnbiB0aGUgcG9pbnQgXCJhaGVhZFwiIHRvIGJlIGRpc2NvbnRpbnVvdXNcclxuICAgICAgaWYgKCBsYXN0UG9pbnRJbmRleCA+IGNsb3Nlc3RQb2ludEluZGV4ICkge1xyXG4gICAgICAgIHRoaXMuZ2V0Q2xvc2VzdFBvaW50QXQoIGNsb3Nlc3RQb2ludC54IC0gdGhpcy5kZWx0YVggKS5wb2ludFR5cGUgPSAnZGlzY29udGludW91cyc7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGxhc3RQb2ludEluZGV4IDwgY2xvc2VzdFBvaW50SW5kZXggKSB7XHJcbiAgICAgICAgdGhpcy5nZXRDbG9zZXN0UG9pbnRBdCggY2xvc2VzdFBvaW50LnggKyB0aGlzLmRlbHRhWCApLnBvaW50VHlwZSA9ICdkaXNjb250aW51b3VzJztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gV2UgbmVlZCB0byBjb25zaWRlciB0aGUgY2FzZSB3aGVyZSB0aGUgZHJhZyBoYXMgdHVybmVkLCB3aGljaCBjYW4gb2NjdXIgb25seSBpZiBhbnRlcGVudWx0aW1hdGVQb3NpdGlvbiBleGlzdHNcclxuICAgICAgLy8gYW5kIHRoZSBsYXN0UG9pbnQgaXMgYmV0d2VlbiB0aGUgY2xvc2VzdFBvaW50IGFuZCB0aGUgbmV4dFRvTGFzdFBvaW50XHJcblxyXG4gICAgICBpZiAoIGFudGVwZW51bHRpbWF0ZVBvc2l0aW9uICkge1xyXG5cclxuICAgICAgICAvLyBQb2ludCBhc3NvY2lhdGVkIHdpdGggdGhlIGxhc3QgZHJhZyBldmVudFxyXG4gICAgICAgIGNvbnN0IG5leHRUb0xhc3RQb2ludCA9IHRoaXMuZ2V0Q2xvc2VzdFBvaW50QXQoIGFudGVwZW51bHRpbWF0ZVBvc2l0aW9uLnggKTtcclxuXHJcbiAgICAgICAgLy8gaXMgdGhlIGxhc3RQb2ludCBiZXR3ZWVuIHRoZSBjbG9zZXN0UG9pbnQgYW5kIHRoZSBuZXh0VG9MYXN0UG9pbnQ/XHJcbiAgICAgICAgaWYgKCAoIGNsb3Nlc3RQb2ludC54IC0gbGFzdFBvaW50LnggKSAqICggbmV4dFRvTGFzdFBvaW50LnggLSBsYXN0UG9pbnQueCApID4gMCApIHtcclxuXHJcbiAgICAgICAgICAvLyBXZSBoYXZlIHRvIGFzc2lnbiB0aGUgbGFzdFBvaW50IHRvIGJlIGRpc2NvbnRpbnVvdXMgc2luY2UgdGhlIGRyYWcgaGFzIHR1cm5lZCBhdCB0aGlzIHBvaW50LlxyXG4gICAgICAgICAgbGFzdFBvaW50LnBvaW50VHlwZSA9ICdkaXNjb250aW51b3VzJztcclxuXHJcbiAgICAgICAgICAvLyBXZSBuZWVkIHRvIGZpZ3VyZSBvdXQgd2hhdCB3YXMgdGhlIGRpcmVjdGlvbiBvZiB0aGUgZHJhZywgYW5kIGFzc2lnbiB0aGUgcG9pbnQgdGhhdCB3YXMgXCJhaGVhZFwiIHRvIGJlIGRpc2NvbnRpbnVvdXNcclxuICAgICAgICAgIGlmICggbGFzdFBvaW50SW5kZXggPiBjbG9zZXN0UG9pbnRJbmRleCApIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRDbG9zZXN0UG9pbnRBdCggbGFzdFBvaW50LnggLSB0aGlzLmRlbHRhWCApLnBvaW50VHlwZSA9ICdkaXNjb250aW51b3VzJztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCBsYXN0UG9pbnRJbmRleCA8IGNsb3Nlc3RQb2ludEluZGV4ICkge1xyXG4gICAgICAgICAgICB0aGlzLmdldENsb3Nlc3RQb2ludEF0KCBsYXN0UG9pbnQueCArIHRoaXMuZGVsdGFYICkucG9pbnRUeXBlID0gJ2Rpc2NvbnRpbnVvdXMnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW1wbGVtZW50cyB0aGUgVElMVCBDdXJ2ZU1hbmlwdWxhdGlvbk1vZGUuXHJcbiAgICogVGlsdHMgdGhlIGN1cnZlIHRvIHRoZSBzcGVjaWZpZWQgZHJhZyBwb3NpdGlvbiwgaW4gbW9kZWwgY29vcmRpbmF0ZXMuXHJcbiAgICogSWYgeW91IGNhbGwgdGhpcyBtZXRob2QsIHlvdSBhcmUgcmVzcG9uc2libGUgZm9yIHNldHRpbmcgd2FzTWFuaXB1bGF0ZWRQcm9wZXJ0eSBjYWxsaW5nIGN1cnZlQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpLlxyXG4gICAqIEBwYXJhbSB4IC0geC1jb29yZGluYXRlIG9mIHRoZSBkcmFnIHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHkgLSB5LWNvb3JkaW5hdGUgb2YgdGhlIGRyYWcgcG9zaXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgdGlsdCggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gRnVsY3J1bSBwb2ludDogY2hvc2VuIHRvIGJlIHRoZSBsZWZ0bW9zdCBwb2ludC5cclxuICAgIGNvbnN0IHBpdm90UG9pbnQgPSB0aGlzLnBvaW50c1sgMCBdO1xyXG5cclxuICAgIGNvbnN0IGxldmVyQXJtID0geCAtIHBpdm90UG9pbnQueDtcclxuXHJcbiAgICAvLyBFeGNsdWRlIGRyYWdzIHdpdGggemVybyBsZXZlckFybVxyXG4gICAgaWYgKCBsZXZlckFybSAhPT0gMCApIHtcclxuXHJcbiAgICAgIC8vIFNsb3BlIGJldHdlZW4gZHJhZyBwb3NpdGlvbiBhbmQgcGl2b3RQb2ludFxyXG4gICAgICBjb25zdCB0YXJnZXRTbG9wZSA9ICggeSAtIHBpdm90UG9pbnQueSApIC8gbGV2ZXJBcm07XHJcblxyXG4gICAgICAvLyBVcGRhdGUgcG9pbnRzIG9ubHkgaWYgdGhlIHRhcmdldFNsb3BlIGlzIGxlc3MgdGhhbiBNQVhfVElMVFxyXG4gICAgICBpZiAoIE1hdGguYWJzKCB0YXJnZXRTbG9wZSApIDwgTUFYX1RJTFQgKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IG9sZFNsb3BlID0gKCB0aGlzLmdldENsb3Nlc3RQb2ludEF0KCB4ICkubGFzdFNhdmVkWSAtIHBpdm90UG9pbnQueSApIC8gbGV2ZXJBcm07XHJcblxyXG4gICAgICAgIGNvbnN0IGluY3JlbWVudFNsb3BlID0gdGFyZ2V0U2xvcGUgLSBvbGRTbG9wZTtcclxuXHJcbiAgICAgICAgLy8gU2hpZnQgZWFjaCBvZiB0aGUgQ3VydmVQb2ludHMgYnkgYSBmYWN0b3IgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbmNyZW1lbnRTbG9wZS5cclxuICAgICAgICB0aGlzLnBvaW50cy5mb3JFYWNoKCBwb2ludCA9PiB7IHBvaW50LnkgPSBwb2ludC5sYXN0U2F2ZWRZICsgaW5jcmVtZW50U2xvcGUgKiAoIHBvaW50LnggLSBwaXZvdFBvaW50LnggKTt9ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEltcGxlbWVudHMgdGhlIFNISUZUIEN1cnZlTWFuaXB1bGF0aW9uTW9kZS5cclxuICAgKiBTaGlmdHMgdGhlIGN1cnZlIHRvIHRoZSBzcGVjaWZpZWQgZHJhZyBwb3NpdGlvbiwgaW4gbW9kZWwgY29vcmRpbmF0ZXMuXHJcbiAgICogSWYgeW91IGNhbGwgdGhpcyBtZXRob2QsIHlvdSBhcmUgcmVzcG9uc2libGUgZm9yIHNldHRpbmcgd2FzTWFuaXB1bGF0ZWRQcm9wZXJ0eSBjYWxsaW5nIGN1cnZlQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpLlxyXG4gICAqIEBwYXJhbSB4IC0geC1jb29yZGluYXRlIG9mIHRoZSBkcmFnIHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHkgLSB5LWNvb3JkaW5hdGUgb2YgdGhlIGRyYWcgcG9zaXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc2hpZnQoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIC8vIEFtb3VudCB0byBzaGlmdCB0aGUgZW50aXJlIGN1cnZlLlxyXG4gICAgY29uc3QgZGVsdGFZID0geSAtIHRoaXMuZ2V0Q2xvc2VzdFBvaW50QXQoIHggKS55O1xyXG5cclxuICAgIC8vIFNoaWZ0IGVhY2ggb2YgdGhlIEN1cnZlUG9pbnRzIGJ5IGRlbHRhWS5cclxuICAgIHRoaXMucG9pbnRzLmZvckVhY2goIHBvaW50ID0+IHsgcG9pbnQueSArPSBkZWx0YVk7IH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHktdmFsdWUgb2YgcG9pbnRzIGJldHdlZW4gcG9zaXRpb24xIGFuZCBwb3NpdGlvbjIgdXNpbmcgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbi5cclxuICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIGZvciBGUkVFRk9STSBtb2RlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgaW50ZXJwb2xhdGUoIHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIHgyOiBudW1iZXIsIHkyOiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgLy8geC1zZXBhcmF0aW9uIGJldHdlZW4gdHdvIGFkamFjZW50IHBvaW50cyBpbiBhIGN1cnZlIGFycmF5XHJcbiAgICBjb25zdCBkZWx0YVggPSB0aGlzLmRlbHRhWDtcclxuXHJcbiAgICAvLyB4LWRpc3RhbmNlIGJldHdlZW4gdGhlIG5ldyBhbmQgb2xkIHBvaW50XHJcbiAgICBjb25zdCBkaXN0WCA9IE1hdGguYWJzKCB4MSAtIHgyICk7XHJcblxyXG4gICAgY29uc3Qgc2lnbmVkT25lOiBudW1iZXIgPSAoIHgxID4geDIgKSA/IC0xIDogMTtcclxuXHJcbiAgICAvLyBQZXJmb3JtIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiBwb3NpdGlvbjEgYW5kIHBvc2l0aW9uMlxyXG4gICAgZm9yICggbGV0IGR4ID0gZGVsdGFYOyBkeCA8IGRpc3RYOyBkeCArPSBkZWx0YVggKSB7XHJcblxyXG4gICAgICAvLyBUaGUgeFBvc2l0aW9uIG9mIHRoZSBwb2ludCB0byBiZSBpbnRlcnBvbGF0ZWQsIGlzIGVpdGhlciB0byB0aGUgbGVmdCBvciByaWdodCBvZiBwb3NpdGlvbjFcclxuICAgICAgY29uc3QgeFBvc2l0aW9uID0geDEgKyBzaWduZWRPbmUgKiBkeDtcclxuXHJcbiAgICAgIC8vIFdlaWdodCBuZWVkZWQgdG8gaW50ZXJwb2xhdGUgdGhlIHktdmFsdWVzLCB3ZWlnaHQgd2lsbCBuZXZlciBleGNlZWQgMS5cclxuICAgICAgY29uc3QgVyA9IGR4IC8gZGlzdFg7XHJcblxyXG4gICAgICAvLyBVcGRhdGUgdGhlIHkgdmFsdWUgb2YgYW4gaW50ZXJtZWRpYXRlIHBvaW50XHJcbiAgICAgIHRoaXMuZ2V0Q2xvc2VzdFBvaW50QXQoIHhQb3NpdGlvbiApLnkgPSAoIDEgLSBXICkgKiB5MSArIFcgKiB5MjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFyZSB0aGUgeS12YWx1ZXMgemVybyAob3IgbmVhcmx5IHplcm8pIGZvciB0aGUgcG9pbnRzIGJldHdlZW4geE1pbiBhbmQgeE1heC5cclxuICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIGZvciBTSU5VU09JRCBtb2RlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgaXNSZWdpb25aZXJvKCB4TWluOiBudW1iZXIsIHhNYXg6IG51bWJlciApOiBib29sZWFuIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHhNaW4gPD0geE1heCwgJ3hNaW4gbXVzdCBiZSBsZXNzIHRoYW4geE1heCcgKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5wb2ludHMuZXZlcnkoIHBvaW50ID0+IHtcclxuICAgICAgY29uc3QgaXNPdXRzaWRlQm91bmRzID0gcG9pbnQueCA8IHhNaW4gfHwgcG9pbnQueCA+IHhNYXg7XHJcbiAgICAgIHJldHVybiBpc091dHNpZGVCb3VuZHMgfHwgTWF0aC5hYnMoIHBvaW50Lmxhc3RTYXZlZFkgKSA8IDFlLTM7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIHR5cGUgb2YgYSBwb2ludCB0byBzbW9vdGggaWYgdGhlIHdlaWdodCBhc3NvY2lhdGVkIHRvIHRoZSBuZXcgZnVuY3Rpb24gaXMgdmVyeSBsYXJnZSxcclxuICAgKiBvdGhlcndpc2UgbGVhdmUgYXMgaXMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB1cGRhdGVQb2ludFR5cGUoIHBvaW50OiBDdXJ2ZVBvaW50LCB3ZWlnaHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdlaWdodCA+PSAwICYmIHdlaWdodCA8PSAxLCBgd2VpZ2h0IG11c3QgcmFuZ2UgYmV0d2VlbiAwIGFuZCAxOiAke3dlaWdodH1gICk7XHJcblxyXG4gICAgLy8gSWYgdGhlIHdlaWdodCBpcyB2ZXJ5IGxhcmdlLCB3ZSBoYXZlIGVmZmVjdGl2ZWx5IHJlcGxhY2VkIHRoZSBwcmV2aW91cyB2YWx1ZXMgYnkgdGhlIG5ldyBmdW5jdGlvbiwgd2hpY2ggd2Uga25vdyB0byBiZSBzbW9vdGguXHJcbiAgICBwb2ludC5wb2ludFR5cGUgPSAoIHdlaWdodCA+IFVQUEVSX1dFSUdIVCApID8gJ3Ntb290aCcgOiBwb2ludC5sYXN0U2F2ZWRUeXBlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHBvaW50VmFsdWUgd2l0aCBhcHByb3ByaWF0ZSB3ZWlnaHQsIGJ1dCBpZiB3ZWlnaHQgaXMgdmVyeSBzbWFsbCBsZWF2ZSBhcyBpcy5cclxuICAgKiAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jYWxjdWx1cy1ncmFwaGVyL2lzc3Vlcy8yNjEpXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB1cGRhdGVQb2ludFZhbHVlKCBwb2ludDogQ3VydmVQb2ludCwgd2VpZ2h0OiBudW1iZXIsIHBlYWtZOiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB3ZWlnaHQgPj0gMCAmJiB3ZWlnaHQgPD0gMSwgYHdlaWdodCBtdXN0IHJhbmdlIGJldHdlZW4gMCBhbmQgMTogJHt3ZWlnaHR9YCApO1xyXG5cclxuICAgIC8vIElmIHRoZSB3ZWlnaHQgaXMgdmVyeSBzbWFsbCwgd2UgYXJlIHByYWN0aWNhbGx5IGlnbm9yaW5nIHRoZSBuZXcgZnVuY3Rpb24uIExldCdzIGV4cGxpY2l0bHkgcmVwbGFjZSBpdCBieSB0aGUgbGFzdFNhdmVkWSBpbnN0ZWFkLlxyXG4gICAgcG9pbnQueSA9ICggd2VpZ2h0ID4gTE9XRVJfV0VJR0hUICkgPyB3ZWlnaHQgKiBwZWFrWSArICggMSAtIHdlaWdodCApICogcG9pbnQubGFzdFNhdmVkWSA6IHBvaW50Lmxhc3RTYXZlZFk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBsaWVzIHRoZSBwZWFrIGZ1bmN0aW9uIHRvIHRoZSBjdXJ2ZSBwb2ludHMgYW5kIHVwZGF0ZXMgdGhlaXIgcG9pbnQgdHlwZS5cclxuICAgKiBUaGUgcGVhayBmdW5jdGlvbiBpcyBhcHBsaWVkIHdpdGhpbiBhIHN1YmRvbWFpbiBvZiB0aGUgY3VydmUuXHJcbiAgICogVGhpcyB3aWxsIHJlc3VsdCBpbiBhIHBpZWNld2lzZSBmdW5jdGlvbiBpb2YgdGhlIG9sZCAgY3VydmUgYW5kIG5ldyBmdW5jdGlvbi5cclxuICAgKiBObyBhdHRlbXB0IGlzIG1hZGUgdG8gYmxlbmQgdGhlIHBlYWsgZnVuY3Rpb24uIFdlIHVwZGF0ZSB0aGUgcG9pbnQgdHlwZSBvZiB0aGUgZWRnZSBwb2ludHMgaW4gdGhlXHJcbiAgICogc3ViZG9tYWlucyBhcyBkaXNjb250aW51b3VzIG9yIGN1c3BzLlxyXG4gICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgZm9yIFRSSUFOR0xFIGFuZCBQQVJBQk9MQSBtb2Rlcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwZWFrRnVuY3Rpb24gLSB0aGUgZnVuY3Rpb24gdG8gYmUgYXBwbGllZCB0byB0aGUgY3VydmVcclxuICAgKiBAcGFyYW0gZGVsdGFZIC0gdGhlIHkgb2Zmc2V0IG9mIHRoZSBkcmFnXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBpdGVyYXRlRnVuY3Rpb25PdmVyUG9pbnRzKCBwZWFrRnVuY3Rpb246ICggZGVsdGFZOiBudW1iZXIsIHg6IG51bWJlciApID0+IG51bWJlciwgZGVsdGFZOiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgbGV0IHdhc1ByZXZpb3VzUG9pbnRNb2RpZmllZDogYm9vbGVhbiB8IG51bGwgPSBudWxsO1xyXG4gICAgdGhpcy5wb2ludHMuZm9yRWFjaCggKCBwb2ludCwgaW5kZXggKSA9PiB7XHJcblxyXG4gICAgICAvLyBOZXcgWSB2YWx1ZSwgc3ViamVjdCB0byBjb25kaXRpb25zIGJlbG93XHJcbiAgICAgIGNvbnN0IG5ld1kgPSBwZWFrRnVuY3Rpb24oIGRlbHRhWSwgcG9pbnQueCApO1xyXG5cclxuICAgICAgLy8gSXMgdGhlIHBvaW50IHdpdGhpbiB0aGUgJ3dpZHRoJyBhbmQgdGhlIGNoYW5nZSBcImxhcmdlclwiIHRoYW4gdGhlIHByZXZpb3VzIHkgdmFsdWUuXHJcbiAgICAgIGNvbnN0IGlzTW9kaWZpZWQgPSAoIGRlbHRhWSA+IDAgJiYgbmV3WSA+IHBvaW50Lmxhc3RTYXZlZFkgKSB8fCAoIGRlbHRhWSA8IDAgJiYgbmV3WSA8IHBvaW50Lmxhc3RTYXZlZFkgKTtcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0aGUgeSB2YWx1ZVxyXG4gICAgICBwb2ludC55ID0gaXNNb2RpZmllZCA/IG5ld1kgOiBwb2ludC5sYXN0U2F2ZWRZO1xyXG5cclxuICAgICAgLy8gVXBkYXRlIHRoZSBwb2ludCBUeXBlIC0gd2UgYXNzdW1lIHRoZSBpbnRlcmlvciByZWdpb24gb2YgdGhlIHBlYWsgZnVuY3Rpb24gaXMgc21vb3RoXHJcbiAgICAgIC8vICh0aGlzIGlzIG5vdCB0aGUgY2FzZSBmb3IgVFJJQU5HTEUgdGhlcmVmb3JlIHdlIHdpbGwgbmVlZCB0byBjb3JyZWN0IGl0IClcclxuICAgICAgcG9pbnQucG9pbnRUeXBlID0gaXNNb2RpZmllZCA/ICdzbW9vdGgnIDogcG9pbnQubGFzdFNhdmVkVHlwZTtcclxuXHJcbiAgICAgIC8vIENvbnRleHQ6IFRoZSB1cGRhdGVkIHkgdmFsdWVzIHdpbGwgcmVzdWx0IGluIGEgcGllY2V3aXNlIGZ1bmN0aW9uIG9mIHRoZSBuZXcgZnVuY3Rpb24gYW5kIHRoZSBvbGQgeS12YWx1ZXMuXHJcbiAgICAgIC8vIFdlIG5lZWQgdG8gaWRlbnRpZnkgdGhlIHBvaW50cyB3aGVyZSB0aGUgdHJhbnNpdGlvbnMgaGFwcGVuLiBUaG9zZSBwb2ludHMgd2lsbCBiZSBsYWJlbGVkIGN1c3BzIG9yIGRpc2NvbnRpbnVpdGllc1xyXG4gICAgICBpZiAoIHdhc1ByZXZpb3VzUG9pbnRNb2RpZmllZCAhPT0gbnVsbCAmJiB3YXNQcmV2aW91c1BvaW50TW9kaWZpZWQgIT09IGlzTW9kaWZpZWQgKSB7XHJcblxyXG4gICAgICAgIC8vIFdlIGFsd2F5cyBsYWJlbCBkaXNjb250aW51aXRpZXMgYW5kIGN1c3BzIG9uIGFuIGFkamFjZW50IHBhaXIgb2YgcG9pbnRzLlxyXG4gICAgICAgIGNvbnN0IHJpZ2h0UG9pbnQgPSBwb2ludDtcclxuICAgICAgICBjb25zdCBsZWZ0UG9pbnQgPSB0aGlzLnBvaW50c1sgaW5kZXggLSAxIF07XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSByaWdodCBwb2ludCAocG9pbnQgaW5zaWRlIHRoZSBuZXcgZnVuY3Rpb24pIHVzZWQgdG8gYmUgZGlzY29udGludW91cywgbGVhdmUgdHlwZSBhcyBpcywgT3RoZXJ3aXNlIGxhYmVsIGl0IGFzIGN1c3AuXHJcbiAgICAgICAgcmlnaHRQb2ludC5wb2ludFR5cGUgPSByaWdodFBvaW50Lmxhc3RTYXZlZFR5cGUgPT09ICdkaXNjb250aW51b3VzJyA/ICdkaXNjb250aW51b3VzJyA6ICdjdXNwJztcclxuXHJcbiAgICAgICAgLy8gVGhlIGxlZnQgcG9pbnQgc2hvdWxkIGhhdmUgdGhlIHNhbWUgcG9pbnRUeXBlIGFzIGl0cyBhZGphY2VudCBwYWlyIHBvaW50XHJcbiAgICAgICAgbGVmdFBvaW50LnBvaW50VHlwZSA9IHJpZ2h0UG9pbnQucG9pbnRUeXBlO1xyXG5cclxuICAgICAgfVxyXG4gICAgICB3YXNQcmV2aW91c1BvaW50TW9kaWZpZWQgPSBpc01vZGlmaWVkO1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBtb2xsaWZpZXIgZnVuY3Rpb24gb2YgeCwgdGhhdCBpcyBhbiBpbmZpbml0ZWx5IGRpZmZlcmVudGlhYmxlIGZ1bmN0aW9uXHJcbiAqIE1vbGxpZmllciBmdW5jdGlvbnMgYXJlIHVzZWQgdG8gc21vb3RoIChhLmsuYS4gbW9sbGlmeSkgb3RoZXIgZnVuY3Rpb25zIChzZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTW9sbGlmaWVyKVxyXG4gKiBAcGFyYW0gd2lkdGggLSB0aGUgd2lkdGggZm9yIHdoaWNoIHRoZSBtb2xsaWZ5aW5nIGZ1bmN0aW9uIGRvZXMgbm90IHJldHVybiBhIHplcm8gdmFsdWVcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZU1vbGxpZmllckZ1bmN0aW9uKCB3aWR0aDogbnVtYmVyICk6IE1hdGhGdW5jdGlvbiB7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggd2lkdGggPiAwLCAnd2lkdGggbXVzdCBiZSBwb3NpdGl2ZScgKTtcclxuICByZXR1cm4geCA9PiAoIE1hdGguYWJzKCB4ICkgPCB3aWR0aCAvIDIgKSA/IE1hdGguZXhwKCAxIC8gKCAoIHggLyAoIHdpZHRoIC8gMiApICkgKiogMiAtIDEgKSApIDogMDtcclxufVxyXG5cclxuY2FsY3VsdXNHcmFwaGVyLnJlZ2lzdGVyKCAnVHJhbnNmb3JtZWRDdXJ2ZScsIFRyYW5zZm9ybWVkQ3VydmUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyw4QkFBOEIsTUFBTSxzQ0FBc0M7QUFDakYsT0FBT0MsS0FBSyxNQUF3QixZQUFZO0FBQ2hELE9BQU9DLFNBQVMsTUFBNEIsdUNBQXVDO0FBQ25GLE9BQU9DLHFCQUFxQixNQUFNLDRCQUE0QjtBQUU5RCxPQUFPQyx3QkFBd0IsTUFBTSxnQ0FBZ0M7QUFDckUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUVwRSxPQUFPQywrQkFBK0IsTUFBTSx1REFBdUQsQ0FBQyxDQUFDO0FBQ3JHLE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7O0FBRXBEO0FBQ0EsTUFBTUMsaUJBQWlCLEdBQUdSLDhCQUE4QixDQUFDUyxlQUFlO0FBQ3hFLE1BQU1DLGtCQUFrQixHQUFHViw4QkFBOEIsQ0FBQ1csMEJBQTBCO0FBQ3BGLE1BQU1DLFFBQVEsR0FBR1osOEJBQThCLENBQUNhLE9BQU87QUFDdkQsTUFBTUMsU0FBUyxHQUFHVix3QkFBd0IsQ0FBQ1UsU0FBUztBQUNwRCxNQUFNQyxTQUFTLEdBQUdYLHdCQUF3QixDQUFDWSxhQUFhLENBQUNDLFNBQVMsQ0FBQyxD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