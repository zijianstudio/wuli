// Copyright 2020-2023, University of Colorado Boulder

/**
 * FourierSeries is the model of a Fourier series, used in the 'Discrete' and 'Wave Game' screens.
 * For the 'Wave Packet' screen, a simpler model is used, due to the number of Fourier components
 * required - see FourierComponent.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import FMWColors from '../FMWColors.js';
import FMWConstants from '../FMWConstants.js';
import getAmplitudeFunction from './getAmplitudeFunction.js';
import Harmonic from './Harmonic.js';
// constants
const DEFAULT_AMPLITUDES = Array(FMWConstants.MAX_HARMONICS).fill(0);
const DEFAULT_AMPLITUDE_RANGE = new Range(-FMWConstants.MAX_AMPLITUDE, FMWConstants.MAX_AMPLITUDE);
export default class FourierSeries extends PhetioObject {
  // properties of the fundamental (first, n=1) harmonic
  // frequency, in Hz
  // period, in milliseconds
  // wavelength, in meters
  // aliases that correspond to symbols used in equations
  // period
  // wavelength
  // the range of all harmonic amplitudes
  // Amplitudes for all harmonics. This was requested for PhET-iO, but has proven to be generally useful.
  // It needs to be of type UnknownDerivedProperty because we're using setDeferred to optimize listener notifications.
  // whether sound is enabled for this Fourier series
  // volume of the sound for this Fourier series
  constructor(providedOptions) {
    const options = optionize()({
      // FourierSeriesOptions
      numberOfHarmonics: FMWConstants.MAX_HARMONICS,
      amplitudeRange: DEFAULT_AMPLITUDE_RANGE,
      // {Range} the range of all harmonic amplitudes
      amplitudes: DEFAULT_AMPLITUDES,
      // {number[]} initial amplitudes for the harmonics

      // PhetioObjectOptions
      phetioState: false
    }, providedOptions);
    assert && assert(Number.isInteger(options.numberOfHarmonics) && options.numberOfHarmonics > 0);
    assert && assert(options.numberOfHarmonics <= FMWColors.HARMONIC_COLOR_PROPERTIES.length);
    assert && assert(_.every(options.amplitudes, amplitude => options.amplitudeRange.contains(amplitude)), 'one or more amplitudes are out of range');
    super(options);
    this.fundamentalFrequency = 440;
    this.fundamentalPeriod = 1000 / this.fundamentalFrequency;
    this.fundamentalWavelength = 1;
    this.T = this.fundamentalPeriod;
    this.L = this.fundamentalWavelength;
    this.amplitudeRange = options.amplitudeRange;

    // Parent tandem for harmonics
    const harmonicsTandem = options.tandem.createTandem('harmonics');
    this.harmonics = [];
    for (let order = 1; order <= options.numberOfHarmonics; order++) {
      this.harmonics.push(new Harmonic({
        order: order,
        frequency: this.fundamentalFrequency * order,
        wavelength: this.L / order,
        colorProperty: FMWColors.HARMONIC_COLOR_PROPERTIES[order - 1],
        amplitude: options.amplitudes[order - 1],
        amplitudeRange: this.amplitudeRange,
        tandem: harmonicsTandem.createTandem(`harmonic${order}`)
      }));
    }
    assert && assert(this.harmonics.length === options.numberOfHarmonics, 'unexpected number of harmonics');
    this.amplitudesProperty = DerivedProperty.deriveAny(this.harmonics.map(harmonic => harmonic.amplitudeProperty), () => this.harmonics.map(harmonic => harmonic.amplitudeProperty.value), {
      phetioDocumentation: 'the amplitudes of all harmonics',
      phetioValueType: ArrayIO(NumberIO),
      tandem: options.tandem.createTandem('amplitudesProperty')
    });
    this.soundEnabledProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('soundEnabledProperty')
    });
    this.soundOutputLevelProperty = new NumberProperty(0.5, {
      range: new Range(0.05, 1),
      tandem: options.tandem.createTandem('soundOutputLevelProperty')
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }

  /**
   * Resets the Fourier series.
   */
  reset() {
    this.resetHarmonics();
    this.soundEnabledProperty.reset();
    this.soundOutputLevelProperty.reset();
  }

  /**
   * Resets the harmonics. Since this causes amplitudesProperty to go through intermediate states,
   * notification of amplitudesProperty listeners is deferred until all harmonics have been updated.
   */
  resetHarmonics() {
    this.amplitudesProperty.setDeferred(true);
    this.harmonics.forEach(harmonic => harmonic.reset());
    const notifyListeners = this.amplitudesProperty.setDeferred(false);
    notifyListeners && notifyListeners();
  }

  /**
   * Sets the amplitudes for harmonics. Since this causes amplitudesProperty to go through intermediate states,
   * notification of amplitudesProperty listeners is deferred until all harmonics have been updated.
   */
  setAmplitudes(amplitudes) {
    assert && assert(amplitudes.length === this.harmonics.length, 'requires an amplitude for each harmonic');
    this.amplitudesProperty.setDeferred(true);
    for (let i = 0; i < amplitudes.length; i++) {
      this.harmonics[i].amplitudeProperty.value = amplitudes[i];
    }
    const notifyListeners = this.amplitudesProperty.setDeferred(false);
    notifyListeners && notifyListeners();
  }

  /**
   * Sets all amplitudes to the specified value. Since this causes amplitudesProperty to go through intermediate states,
   * notification of amplitudesProperty listeners is deferred until all harmonics have been updated.
   */
  setAllAmplitudes(amplitude) {
    this.amplitudesProperty.setDeferred(true);
    this.harmonics.forEach(harmonic => {
      harmonic.amplitudeProperty.value = amplitude;
    });
    const notifyListeners = this.amplitudesProperty.setDeferred(false);
    notifyListeners && notifyListeners();
  }

  /**
   * Creates the data set for the sum of the harmonics in the Fourier Series. Points are ordered by increasing x value.
   *
   * This does not use Harmonic.createDataSet or the datasets that it creates, because:
   * (1) Calling Harmonic.createDataSet would create many more Vector2 instances.
   * (2) Harmonic.createDataSet does not provide all of the points needed to compute the sum. The number of points
   *     in the data set created by Harmonic.createDataSet is a function of the harmonic's frequency, as more points
   *     are required to plot higher-frequency harmonics.
   */
  createSumDataSet(xAxisDescription, domain, seriesType, t) {
    assert && assert(t >= 0);
    const sumDataSet = []; // {Vector2[]}

    const xRange = xAxisDescription.createRangeForDomain(domain, this.L, this.T);
    const dx = xRange.getLength() / FMWConstants.MAX_POINTS_PER_DATA_SET;
    const amplitudeFunction = getAmplitudeFunction(domain, seriesType); // {function}

    let x = xRange.min;
    while (x <= xRange.max) {
      let y = 0;
      for (let i = 0; i < this.harmonics.length; i++) {
        const harmonic = this.harmonics[i];
        const amplitude = harmonic.amplitudeProperty.value;
        if (amplitude !== 0) {
          y += amplitudeFunction(amplitude, harmonic.order, x, t, this.L, this.T);
        }
      }
      sumDataSet.push(new Vector2(x, y));
      x += dx;
    }
    return sumDataSet;
  }

  /**
   * Gets the harmonics that have zero amplitude.
   */
  getZeroHarmonics() {
    return this.harmonics.filter(harmonic => harmonic.amplitudeProperty.value === 0);
  }

  /**
   * Gets the harmonics that have non-zero amplitude.
   */
  getNonZeroHarmonics() {
    return this.harmonics.filter(harmonic => harmonic.amplitudeProperty.value !== 0);
  }

  /**
   * Gets the number of harmonics in the answer that have non-zero amplitude.
   */
  getNumberOfNonZeroHarmonics() {
    // Rather than return this.getNonZeroHarmonics().length, this implementation is optimized so that nothing is allocated.
    let count = 0;
    this.harmonics.forEach(harmonic => {
      if (harmonic.amplitudeProperty.value !== 0) {
        count++;
      }
    });
    return count;
  }
}
fourierMakingWaves.register('FourierSeries', FourierSeries);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiVmVjdG9yMiIsIm9wdGlvbml6ZSIsIlBoZXRpb09iamVjdCIsIkFycmF5SU8iLCJOdW1iZXJJTyIsImZvdXJpZXJNYWtpbmdXYXZlcyIsIkZNV0NvbG9ycyIsIkZNV0NvbnN0YW50cyIsImdldEFtcGxpdHVkZUZ1bmN0aW9uIiwiSGFybW9uaWMiLCJERUZBVUxUX0FNUExJVFVERVMiLCJBcnJheSIsIk1BWF9IQVJNT05JQ1MiLCJmaWxsIiwiREVGQVVMVF9BTVBMSVRVREVfUkFOR0UiLCJNQVhfQU1QTElUVURFIiwiRm91cmllclNlcmllcyIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIm51bWJlck9mSGFybW9uaWNzIiwiYW1wbGl0dWRlUmFuZ2UiLCJhbXBsaXR1ZGVzIiwicGhldGlvU3RhdGUiLCJhc3NlcnQiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJIQVJNT05JQ19DT0xPUl9QUk9QRVJUSUVTIiwibGVuZ3RoIiwiXyIsImV2ZXJ5IiwiYW1wbGl0dWRlIiwiY29udGFpbnMiLCJmdW5kYW1lbnRhbEZyZXF1ZW5jeSIsImZ1bmRhbWVudGFsUGVyaW9kIiwiZnVuZGFtZW50YWxXYXZlbGVuZ3RoIiwiVCIsIkwiLCJoYXJtb25pY3NUYW5kZW0iLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJoYXJtb25pY3MiLCJvcmRlciIsInB1c2giLCJmcmVxdWVuY3kiLCJ3YXZlbGVuZ3RoIiwiY29sb3JQcm9wZXJ0eSIsImFtcGxpdHVkZXNQcm9wZXJ0eSIsImRlcml2ZUFueSIsIm1hcCIsImhhcm1vbmljIiwiYW1wbGl0dWRlUHJvcGVydHkiLCJ2YWx1ZSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJwaGV0aW9WYWx1ZVR5cGUiLCJzb3VuZEVuYWJsZWRQcm9wZXJ0eSIsInNvdW5kT3V0cHV0TGV2ZWxQcm9wZXJ0eSIsInJhbmdlIiwiZGlzcG9zZSIsInJlc2V0IiwicmVzZXRIYXJtb25pY3MiLCJzZXREZWZlcnJlZCIsImZvckVhY2giLCJub3RpZnlMaXN0ZW5lcnMiLCJzZXRBbXBsaXR1ZGVzIiwiaSIsInNldEFsbEFtcGxpdHVkZXMiLCJjcmVhdGVTdW1EYXRhU2V0IiwieEF4aXNEZXNjcmlwdGlvbiIsImRvbWFpbiIsInNlcmllc1R5cGUiLCJ0Iiwic3VtRGF0YVNldCIsInhSYW5nZSIsImNyZWF0ZVJhbmdlRm9yRG9tYWluIiwiZHgiLCJnZXRMZW5ndGgiLCJNQVhfUE9JTlRTX1BFUl9EQVRBX1NFVCIsImFtcGxpdHVkZUZ1bmN0aW9uIiwieCIsIm1pbiIsIm1heCIsInkiLCJnZXRaZXJvSGFybW9uaWNzIiwiZmlsdGVyIiwiZ2V0Tm9uWmVyb0hhcm1vbmljcyIsImdldE51bWJlck9mTm9uWmVyb0hhcm1vbmljcyIsImNvdW50IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGb3VyaWVyU2VyaWVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEZvdXJpZXJTZXJpZXMgaXMgdGhlIG1vZGVsIG9mIGEgRm91cmllciBzZXJpZXMsIHVzZWQgaW4gdGhlICdEaXNjcmV0ZScgYW5kICdXYXZlIEdhbWUnIHNjcmVlbnMuXHJcbiAqIEZvciB0aGUgJ1dhdmUgUGFja2V0JyBzY3JlZW4sIGEgc2ltcGxlciBtb2RlbCBpcyB1c2VkLCBkdWUgdG8gdGhlIG51bWJlciBvZiBGb3VyaWVyIGNvbXBvbmVudHNcclxuICogcmVxdWlyZWQgLSBzZWUgRm91cmllckNvbXBvbmVudC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSwgeyBVbmtub3duRGVyaXZlZFByb3BlcnR5IH0gZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFBoZXRpb09iamVjdCwgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBBcnJheUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9BcnJheUlPLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBmb3VyaWVyTWFraW5nV2F2ZXMgZnJvbSAnLi4vLi4vZm91cmllck1ha2luZ1dhdmVzLmpzJztcclxuaW1wb3J0IEZNV0NvbG9ycyBmcm9tICcuLi9GTVdDb2xvcnMuanMnO1xyXG5pbXBvcnQgRk1XQ29uc3RhbnRzIGZyb20gJy4uL0ZNV0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBBeGlzRGVzY3JpcHRpb24gZnJvbSAnLi9BeGlzRGVzY3JpcHRpb24uanMnO1xyXG5pbXBvcnQgRG9tYWluIGZyb20gJy4vRG9tYWluLmpzJztcclxuaW1wb3J0IGdldEFtcGxpdHVkZUZ1bmN0aW9uIGZyb20gJy4vZ2V0QW1wbGl0dWRlRnVuY3Rpb24uanMnO1xyXG5pbXBvcnQgSGFybW9uaWMgZnJvbSAnLi9IYXJtb25pYy5qcyc7XHJcbmltcG9ydCBTZXJpZXNUeXBlIGZyb20gJy4vU2VyaWVzVHlwZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgREVGQVVMVF9BTVBMSVRVREVTID0gQXJyYXkoIEZNV0NvbnN0YW50cy5NQVhfSEFSTU9OSUNTICkuZmlsbCggMCApO1xyXG5jb25zdCBERUZBVUxUX0FNUExJVFVERV9SQU5HRSA9IG5ldyBSYW5nZSggLUZNV0NvbnN0YW50cy5NQVhfQU1QTElUVURFLCBGTVdDb25zdGFudHMuTUFYX0FNUExJVFVERSApO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBudW1iZXJPZkhhcm1vbmljcz86IG51bWJlcjtcclxuICBhbXBsaXR1ZGVSYW5nZT86IFJhbmdlOyAvLyB0aGUgcmFuZ2Ugb2YgYWxsIGhhcm1vbmljIGFtcGxpdHVkZXNcclxuICBhbXBsaXR1ZGVzPzogbnVtYmVyW107IC8vIGluaXRpYWwgYW1wbGl0dWRlcyBmb3IgdGhlIGhhcm1vbmljc1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgRm91cmllclNlcmllc09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxQaGV0aW9PYmplY3RPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGb3VyaWVyU2VyaWVzIGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcclxuXHJcbiAgLy8gcHJvcGVydGllcyBvZiB0aGUgZnVuZGFtZW50YWwgKGZpcnN0LCBuPTEpIGhhcm1vbmljXHJcbiAgcHVibGljIHJlYWRvbmx5IGZ1bmRhbWVudGFsRnJlcXVlbmN5OiBudW1iZXI7IC8vIGZyZXF1ZW5jeSwgaW4gSHpcclxuICBwdWJsaWMgcmVhZG9ubHkgZnVuZGFtZW50YWxQZXJpb2Q6IG51bWJlcjsgLy8gcGVyaW9kLCBpbiBtaWxsaXNlY29uZHNcclxuICBwdWJsaWMgcmVhZG9ubHkgZnVuZGFtZW50YWxXYXZlbGVuZ3RoOiBudW1iZXI7IC8vIHdhdmVsZW5ndGgsIGluIG1ldGVyc1xyXG5cclxuICAvLyBhbGlhc2VzIHRoYXQgY29ycmVzcG9uZCB0byBzeW1ib2xzIHVzZWQgaW4gZXF1YXRpb25zXHJcbiAgcHVibGljIHJlYWRvbmx5IFQ6IG51bWJlcjsgLy8gcGVyaW9kXHJcbiAgcHVibGljIHJlYWRvbmx5IEw6IG51bWJlcjsgLy8gd2F2ZWxlbmd0aFxyXG5cclxuICAvLyB0aGUgcmFuZ2Ugb2YgYWxsIGhhcm1vbmljIGFtcGxpdHVkZXNcclxuICBwdWJsaWMgcmVhZG9ubHkgYW1wbGl0dWRlUmFuZ2U6IFJhbmdlO1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgaGFybW9uaWNzOiBIYXJtb25pY1tdO1xyXG5cclxuICAvLyBBbXBsaXR1ZGVzIGZvciBhbGwgaGFybW9uaWNzLiBUaGlzIHdhcyByZXF1ZXN0ZWQgZm9yIFBoRVQtaU8sIGJ1dCBoYXMgcHJvdmVuIHRvIGJlIGdlbmVyYWxseSB1c2VmdWwuXHJcbiAgLy8gSXQgbmVlZHMgdG8gYmUgb2YgdHlwZSBVbmtub3duRGVyaXZlZFByb3BlcnR5IGJlY2F1c2Ugd2UncmUgdXNpbmcgc2V0RGVmZXJyZWQgdG8gb3B0aW1pemUgbGlzdGVuZXIgbm90aWZpY2F0aW9ucy5cclxuICBwdWJsaWMgcmVhZG9ubHkgYW1wbGl0dWRlc1Byb3BlcnR5OiBVbmtub3duRGVyaXZlZFByb3BlcnR5PG51bWJlcltdPjtcclxuXHJcbiAgLy8gd2hldGhlciBzb3VuZCBpcyBlbmFibGVkIGZvciB0aGlzIEZvdXJpZXIgc2VyaWVzXHJcbiAgcHVibGljIHJlYWRvbmx5IHNvdW5kRW5hYmxlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gdm9sdW1lIG9mIHRoZSBzb3VuZCBmb3IgdGhpcyBGb3VyaWVyIHNlcmllc1xyXG4gIHB1YmxpYyByZWFkb25seSBzb3VuZE91dHB1dExldmVsUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogRm91cmllclNlcmllc09wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxGb3VyaWVyU2VyaWVzT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIEZvdXJpZXJTZXJpZXNPcHRpb25zXHJcbiAgICAgIG51bWJlck9mSGFybW9uaWNzOiBGTVdDb25zdGFudHMuTUFYX0hBUk1PTklDUyxcclxuICAgICAgYW1wbGl0dWRlUmFuZ2U6IERFRkFVTFRfQU1QTElUVURFX1JBTkdFLCAvLyB7UmFuZ2V9IHRoZSByYW5nZSBvZiBhbGwgaGFybW9uaWMgYW1wbGl0dWRlc1xyXG4gICAgICBhbXBsaXR1ZGVzOiBERUZBVUxUX0FNUExJVFVERVMsIC8vIHtudW1iZXJbXX0gaW5pdGlhbCBhbXBsaXR1ZGVzIGZvciB0aGUgaGFybW9uaWNzXHJcblxyXG4gICAgICAvLyBQaGV0aW9PYmplY3RPcHRpb25zXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggb3B0aW9ucy5udW1iZXJPZkhhcm1vbmljcyApICYmIG9wdGlvbnMubnVtYmVyT2ZIYXJtb25pY3MgPiAwICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLm51bWJlck9mSGFybW9uaWNzIDw9IEZNV0NvbG9ycy5IQVJNT05JQ19DT0xPUl9QUk9QRVJUSUVTLmxlbmd0aCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5ldmVyeSggb3B0aW9ucy5hbXBsaXR1ZGVzLCBhbXBsaXR1ZGUgPT4gb3B0aW9ucy5hbXBsaXR1ZGVSYW5nZS5jb250YWlucyggYW1wbGl0dWRlICkgKSxcclxuICAgICAgJ29uZSBvciBtb3JlIGFtcGxpdHVkZXMgYXJlIG91dCBvZiByYW5nZScgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuZnVuZGFtZW50YWxGcmVxdWVuY3kgPSA0NDA7XHJcbiAgICB0aGlzLmZ1bmRhbWVudGFsUGVyaW9kID0gMTAwMCAvIHRoaXMuZnVuZGFtZW50YWxGcmVxdWVuY3k7XHJcbiAgICB0aGlzLmZ1bmRhbWVudGFsV2F2ZWxlbmd0aCA9IDE7XHJcblxyXG4gICAgdGhpcy5UID0gdGhpcy5mdW5kYW1lbnRhbFBlcmlvZDtcclxuICAgIHRoaXMuTCA9IHRoaXMuZnVuZGFtZW50YWxXYXZlbGVuZ3RoO1xyXG5cclxuICAgIHRoaXMuYW1wbGl0dWRlUmFuZ2UgPSBvcHRpb25zLmFtcGxpdHVkZVJhbmdlO1xyXG5cclxuICAgIC8vIFBhcmVudCB0YW5kZW0gZm9yIGhhcm1vbmljc1xyXG4gICAgY29uc3QgaGFybW9uaWNzVGFuZGVtID0gb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaGFybW9uaWNzJyApO1xyXG5cclxuICAgIHRoaXMuaGFybW9uaWNzID0gW107XHJcbiAgICBmb3IgKCBsZXQgb3JkZXIgPSAxOyBvcmRlciA8PSBvcHRpb25zLm51bWJlck9mSGFybW9uaWNzOyBvcmRlcisrICkge1xyXG4gICAgICB0aGlzLmhhcm1vbmljcy5wdXNoKCBuZXcgSGFybW9uaWMoIHtcclxuICAgICAgICBvcmRlcjogb3JkZXIsXHJcbiAgICAgICAgZnJlcXVlbmN5OiB0aGlzLmZ1bmRhbWVudGFsRnJlcXVlbmN5ICogb3JkZXIsXHJcbiAgICAgICAgd2F2ZWxlbmd0aDogdGhpcy5MIC8gb3JkZXIsXHJcbiAgICAgICAgY29sb3JQcm9wZXJ0eTogRk1XQ29sb3JzLkhBUk1PTklDX0NPTE9SX1BST1BFUlRJRVNbIG9yZGVyIC0gMSBdLFxyXG4gICAgICAgIGFtcGxpdHVkZTogb3B0aW9ucy5hbXBsaXR1ZGVzWyBvcmRlciAtIDEgXSxcclxuICAgICAgICBhbXBsaXR1ZGVSYW5nZTogdGhpcy5hbXBsaXR1ZGVSYW5nZSxcclxuICAgICAgICB0YW5kZW06IGhhcm1vbmljc1RhbmRlbS5jcmVhdGVUYW5kZW0oIGBoYXJtb25pYyR7b3JkZXJ9YCApXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5oYXJtb25pY3MubGVuZ3RoID09PSBvcHRpb25zLm51bWJlck9mSGFybW9uaWNzLCAndW5leHBlY3RlZCBudW1iZXIgb2YgaGFybW9uaWNzJyApO1xyXG5cclxuICAgIHRoaXMuYW1wbGl0dWRlc1Byb3BlcnR5ID0gRGVyaXZlZFByb3BlcnR5LmRlcml2ZUFueShcclxuICAgICAgdGhpcy5oYXJtb25pY3MubWFwKCBoYXJtb25pYyA9PiBoYXJtb25pYy5hbXBsaXR1ZGVQcm9wZXJ0eSApLFxyXG4gICAgICAoKSA9PiB0aGlzLmhhcm1vbmljcy5tYXAoIGhhcm1vbmljID0+IGhhcm1vbmljLmFtcGxpdHVkZVByb3BlcnR5LnZhbHVlICksIHtcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndGhlIGFtcGxpdHVkZXMgb2YgYWxsIGhhcm1vbmljcycsXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBBcnJheUlPKCBOdW1iZXJJTyApLFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYW1wbGl0dWRlc1Byb3BlcnR5JyApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNvdW5kRW5hYmxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzb3VuZEVuYWJsZWRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuc291bmRPdXRwdXRMZXZlbFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLjUsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMC4wNSwgMSApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NvdW5kT3V0cHV0TGV2ZWxQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGUgRm91cmllciBzZXJpZXMuXHJcbiAgICovXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5yZXNldEhhcm1vbmljcygpO1xyXG4gICAgdGhpcy5zb3VuZEVuYWJsZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zb3VuZE91dHB1dExldmVsUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGUgaGFybW9uaWNzLiBTaW5jZSB0aGlzIGNhdXNlcyBhbXBsaXR1ZGVzUHJvcGVydHkgdG8gZ28gdGhyb3VnaCBpbnRlcm1lZGlhdGUgc3RhdGVzLFxyXG4gICAqIG5vdGlmaWNhdGlvbiBvZiBhbXBsaXR1ZGVzUHJvcGVydHkgbGlzdGVuZXJzIGlzIGRlZmVycmVkIHVudGlsIGFsbCBoYXJtb25pY3MgaGF2ZSBiZWVuIHVwZGF0ZWQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSByZXNldEhhcm1vbmljcygpOiB2b2lkIHtcclxuICAgIHRoaXMuYW1wbGl0dWRlc1Byb3BlcnR5LnNldERlZmVycmVkKCB0cnVlICk7XHJcbiAgICB0aGlzLmhhcm1vbmljcy5mb3JFYWNoKCBoYXJtb25pYyA9PiBoYXJtb25pYy5yZXNldCgpICk7XHJcbiAgICBjb25zdCBub3RpZnlMaXN0ZW5lcnMgPSB0aGlzLmFtcGxpdHVkZXNQcm9wZXJ0eS5zZXREZWZlcnJlZCggZmFsc2UgKTtcclxuICAgIG5vdGlmeUxpc3RlbmVycyAmJiBub3RpZnlMaXN0ZW5lcnMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGFtcGxpdHVkZXMgZm9yIGhhcm1vbmljcy4gU2luY2UgdGhpcyBjYXVzZXMgYW1wbGl0dWRlc1Byb3BlcnR5IHRvIGdvIHRocm91Z2ggaW50ZXJtZWRpYXRlIHN0YXRlcyxcclxuICAgKiBub3RpZmljYXRpb24gb2YgYW1wbGl0dWRlc1Byb3BlcnR5IGxpc3RlbmVycyBpcyBkZWZlcnJlZCB1bnRpbCBhbGwgaGFybW9uaWNzIGhhdmUgYmVlbiB1cGRhdGVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRBbXBsaXR1ZGVzKCBhbXBsaXR1ZGVzOiBudW1iZXJbXSApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFtcGxpdHVkZXMubGVuZ3RoID09PSB0aGlzLmhhcm1vbmljcy5sZW5ndGgsICdyZXF1aXJlcyBhbiBhbXBsaXR1ZGUgZm9yIGVhY2ggaGFybW9uaWMnICk7XHJcblxyXG4gICAgdGhpcy5hbXBsaXR1ZGVzUHJvcGVydHkuc2V0RGVmZXJyZWQoIHRydWUgKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGFtcGxpdHVkZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuaGFybW9uaWNzWyBpIF0uYW1wbGl0dWRlUHJvcGVydHkudmFsdWUgPSBhbXBsaXR1ZGVzWyBpIF07XHJcbiAgICB9XHJcbiAgICBjb25zdCBub3RpZnlMaXN0ZW5lcnMgPSB0aGlzLmFtcGxpdHVkZXNQcm9wZXJ0eS5zZXREZWZlcnJlZCggZmFsc2UgKTtcclxuICAgIG5vdGlmeUxpc3RlbmVycyAmJiBub3RpZnlMaXN0ZW5lcnMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgYWxsIGFtcGxpdHVkZXMgdG8gdGhlIHNwZWNpZmllZCB2YWx1ZS4gU2luY2UgdGhpcyBjYXVzZXMgYW1wbGl0dWRlc1Byb3BlcnR5IHRvIGdvIHRocm91Z2ggaW50ZXJtZWRpYXRlIHN0YXRlcyxcclxuICAgKiBub3RpZmljYXRpb24gb2YgYW1wbGl0dWRlc1Byb3BlcnR5IGxpc3RlbmVycyBpcyBkZWZlcnJlZCB1bnRpbCBhbGwgaGFybW9uaWNzIGhhdmUgYmVlbiB1cGRhdGVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRBbGxBbXBsaXR1ZGVzKCBhbXBsaXR1ZGU6IG51bWJlciApOiB2b2lkIHtcclxuICAgIHRoaXMuYW1wbGl0dWRlc1Byb3BlcnR5LnNldERlZmVycmVkKCB0cnVlICk7XHJcbiAgICB0aGlzLmhhcm1vbmljcy5mb3JFYWNoKCBoYXJtb25pYyA9PiB7XHJcbiAgICAgIGhhcm1vbmljLmFtcGxpdHVkZVByb3BlcnR5LnZhbHVlID0gYW1wbGl0dWRlO1xyXG4gICAgfSApO1xyXG4gICAgY29uc3Qgbm90aWZ5TGlzdGVuZXJzID0gdGhpcy5hbXBsaXR1ZGVzUHJvcGVydHkuc2V0RGVmZXJyZWQoIGZhbHNlICk7XHJcbiAgICBub3RpZnlMaXN0ZW5lcnMgJiYgbm90aWZ5TGlzdGVuZXJzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBkYXRhIHNldCBmb3IgdGhlIHN1bSBvZiB0aGUgaGFybW9uaWNzIGluIHRoZSBGb3VyaWVyIFNlcmllcy4gUG9pbnRzIGFyZSBvcmRlcmVkIGJ5IGluY3JlYXNpbmcgeCB2YWx1ZS5cclxuICAgKlxyXG4gICAqIFRoaXMgZG9lcyBub3QgdXNlIEhhcm1vbmljLmNyZWF0ZURhdGFTZXQgb3IgdGhlIGRhdGFzZXRzIHRoYXQgaXQgY3JlYXRlcywgYmVjYXVzZTpcclxuICAgKiAoMSkgQ2FsbGluZyBIYXJtb25pYy5jcmVhdGVEYXRhU2V0IHdvdWxkIGNyZWF0ZSBtYW55IG1vcmUgVmVjdG9yMiBpbnN0YW5jZXMuXHJcbiAgICogKDIpIEhhcm1vbmljLmNyZWF0ZURhdGFTZXQgZG9lcyBub3QgcHJvdmlkZSBhbGwgb2YgdGhlIHBvaW50cyBuZWVkZWQgdG8gY29tcHV0ZSB0aGUgc3VtLiBUaGUgbnVtYmVyIG9mIHBvaW50c1xyXG4gICAqICAgICBpbiB0aGUgZGF0YSBzZXQgY3JlYXRlZCBieSBIYXJtb25pYy5jcmVhdGVEYXRhU2V0IGlzIGEgZnVuY3Rpb24gb2YgdGhlIGhhcm1vbmljJ3MgZnJlcXVlbmN5LCBhcyBtb3JlIHBvaW50c1xyXG4gICAqICAgICBhcmUgcmVxdWlyZWQgdG8gcGxvdCBoaWdoZXItZnJlcXVlbmN5IGhhcm1vbmljcy5cclxuICAgKi9cclxuICBwdWJsaWMgY3JlYXRlU3VtRGF0YVNldCggeEF4aXNEZXNjcmlwdGlvbjogQXhpc0Rlc2NyaXB0aW9uLCBkb21haW46IERvbWFpbiwgc2VyaWVzVHlwZTogU2VyaWVzVHlwZSwgdDogbnVtYmVyICk6IFZlY3RvcjJbXSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0ID49IDAgKTtcclxuXHJcbiAgICBjb25zdCBzdW1EYXRhU2V0ID0gW107IC8vIHtWZWN0b3IyW119XHJcblxyXG4gICAgY29uc3QgeFJhbmdlID0geEF4aXNEZXNjcmlwdGlvbi5jcmVhdGVSYW5nZUZvckRvbWFpbiggZG9tYWluLCB0aGlzLkwsIHRoaXMuVCApO1xyXG4gICAgY29uc3QgZHggPSB4UmFuZ2UuZ2V0TGVuZ3RoKCkgLyBGTVdDb25zdGFudHMuTUFYX1BPSU5UU19QRVJfREFUQV9TRVQ7XHJcbiAgICBjb25zdCBhbXBsaXR1ZGVGdW5jdGlvbiA9IGdldEFtcGxpdHVkZUZ1bmN0aW9uKCBkb21haW4sIHNlcmllc1R5cGUgKTsgLy8ge2Z1bmN0aW9ufVxyXG5cclxuICAgIGxldCB4ID0geFJhbmdlLm1pbjtcclxuICAgIHdoaWxlICggeCA8PSB4UmFuZ2UubWF4ICkge1xyXG4gICAgICBsZXQgeSA9IDA7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuaGFybW9uaWNzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IGhhcm1vbmljID0gdGhpcy5oYXJtb25pY3NbIGkgXTtcclxuICAgICAgICBjb25zdCBhbXBsaXR1ZGUgPSBoYXJtb25pYy5hbXBsaXR1ZGVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICBpZiAoIGFtcGxpdHVkZSAhPT0gMCApIHtcclxuICAgICAgICAgIHkgKz0gYW1wbGl0dWRlRnVuY3Rpb24oIGFtcGxpdHVkZSwgaGFybW9uaWMub3JkZXIsIHgsIHQsIHRoaXMuTCwgdGhpcy5UICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHN1bURhdGFTZXQucHVzaCggbmV3IFZlY3RvcjIoIHgsIHkgKSApO1xyXG4gICAgICB4ICs9IGR4O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzdW1EYXRhU2V0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgaGFybW9uaWNzIHRoYXQgaGF2ZSB6ZXJvIGFtcGxpdHVkZS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0WmVyb0hhcm1vbmljcygpOiBIYXJtb25pY1tdIHtcclxuICAgIHJldHVybiB0aGlzLmhhcm1vbmljcy5maWx0ZXIoIGhhcm1vbmljID0+IGhhcm1vbmljLmFtcGxpdHVkZVByb3BlcnR5LnZhbHVlID09PSAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBoYXJtb25pY3MgdGhhdCBoYXZlIG5vbi16ZXJvIGFtcGxpdHVkZS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Tm9uWmVyb0hhcm1vbmljcygpOiBIYXJtb25pY1tdIHtcclxuICAgIHJldHVybiB0aGlzLmhhcm1vbmljcy5maWx0ZXIoIGhhcm1vbmljID0+IGhhcm1vbmljLmFtcGxpdHVkZVByb3BlcnR5LnZhbHVlICE9PSAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgaGFybW9uaWNzIGluIHRoZSBhbnN3ZXIgdGhhdCBoYXZlIG5vbi16ZXJvIGFtcGxpdHVkZS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TnVtYmVyT2ZOb25aZXJvSGFybW9uaWNzKCk6IG51bWJlciB7XHJcblxyXG4gICAgLy8gUmF0aGVyIHRoYW4gcmV0dXJuIHRoaXMuZ2V0Tm9uWmVyb0hhcm1vbmljcygpLmxlbmd0aCwgdGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBvcHRpbWl6ZWQgc28gdGhhdCBub3RoaW5nIGlzIGFsbG9jYXRlZC5cclxuICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICB0aGlzLmhhcm1vbmljcy5mb3JFYWNoKCBoYXJtb25pYyA9PiB7XHJcbiAgICAgIGlmICggaGFybW9uaWMuYW1wbGl0dWRlUHJvcGVydHkudmFsdWUgIT09IDAgKSB7XHJcbiAgICAgICAgY291bnQrKztcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIGNvdW50O1xyXG4gIH1cclxufVxyXG5cclxuZm91cmllck1ha2luZ1dhdmVzLnJlZ2lzdGVyKCAnRm91cmllclNlcmllcycsIEZvdXJpZXJTZXJpZXMgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFrQyx3Q0FBd0M7QUFDaEcsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUVsRSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQUU3RCxPQUFPQyxZQUFZLE1BQStCLHVDQUF1QztBQUN6RixPQUFPQyxPQUFPLE1BQU0sd0NBQXdDO0FBQzVELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0Ms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