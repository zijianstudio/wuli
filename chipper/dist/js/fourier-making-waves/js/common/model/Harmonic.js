// Copyright 2020-2023, University of Colorado Boulder

/**
 * Harmonic is the model of a harmonic in a Fourier series, used in the 'Discrete' and 'Wave Game' screens.
 * For the 'Wave Packet' screen, a simpler model is used, due to the number of Fourier components required -
 * see FourierComponent..
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import getAmplitudeFunction from './getAmplitudeFunction.js';
export default class Harmonic extends PhetioObject {
  // See SelfOptions

  // period of the harmonic, in milliseconds

  // amplitude of the harmonic, no units

  constructor(providedOptions) {
    const options = optionize()({
      // HarmonicOptions
      amplitude: 0,
      // PhetioObjectOptions
      phetioState: false
    }, providedOptions);
    assert && assert(Number.isInteger(options.order) && options.order > 0);
    assert && assert(options.frequency > 0);
    assert && assert(options.wavelength > 0);
    super(options);
    this.order = options.order;
    this.frequency = options.frequency;
    this.wavelength = options.wavelength;
    this.amplitudeRange = options.amplitudeRange;
    this.colorProperty = options.colorProperty;
    this.period = 1000 / this.frequency;
    this.amplitudeProperty = new NumberProperty(options.amplitude, {
      range: this.amplitudeRange,
      phetioDocumentation: 'the amplitude of this harmonic',
      tandem: options.tandem.createTandem('amplitudeProperty')
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  reset() {
    this.amplitudeProperty.reset();
  }

  /**
   * Create a data set to approximate this harmonic.
   */
  createDataSet(numberOfPoints, L, T, xAxisDescription, domain, seriesType, t) {
    const order = this.order;
    const amplitude = this.amplitudeProperty.value;
    const xRange = xAxisDescription.createRangeForDomain(domain, L, T);
    return Harmonic.createDataSetStatic(order, amplitude, numberOfPoints, L, T, xRange, domain, seriesType, t);
  }

  /**
   * Creates a data set for any harmonic. This is used in the Wave Packet screen, which does not create Harmonic
   * instances due to the large number of Fourier components involved.
   */
  static createDataSetStatic(order, amplitude, numberOfPoints, L, T, xRange, domain, seriesType, t) {
    assert && assert(Number.isInteger(order) && order > 0);
    assert && assert(Number.isInteger(numberOfPoints) && numberOfPoints > 0);
    assert && assert(L > 0);
    assert && assert(T > 0);
    assert && assert(t >= 0);
    const dataSet = [];
    const amplitudeFunction = getAmplitudeFunction(domain, seriesType);

    // Make dx a bit larger than necessary, so that we cover the entire xRange by slightly exceeding xRange.max.
    const dx = xRange.getLength() / (numberOfPoints - 1);
    let x = xRange.min;
    let y;
    for (let i = 0; i < numberOfPoints; i++) {
      y = amplitudeFunction(amplitude, order, x, t, L, T);
      dataSet.push(new Vector2(x, y));
      x += dx;
    }
    assert && assert(dataSet.length === numberOfPoints, 'incorrect number of points in dataSet');
    return dataSet;
  }
}
fourierMakingWaves.register('Harmonic', Harmonic);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJvcHRpb25pemUiLCJQaGV0aW9PYmplY3QiLCJmb3VyaWVyTWFraW5nV2F2ZXMiLCJnZXRBbXBsaXR1ZGVGdW5jdGlvbiIsIkhhcm1vbmljIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiYW1wbGl0dWRlIiwicGhldGlvU3RhdGUiLCJhc3NlcnQiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJvcmRlciIsImZyZXF1ZW5jeSIsIndhdmVsZW5ndGgiLCJhbXBsaXR1ZGVSYW5nZSIsImNvbG9yUHJvcGVydHkiLCJwZXJpb2QiLCJhbXBsaXR1ZGVQcm9wZXJ0eSIsInJhbmdlIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImRpc3Bvc2UiLCJyZXNldCIsImNyZWF0ZURhdGFTZXQiLCJudW1iZXJPZlBvaW50cyIsIkwiLCJUIiwieEF4aXNEZXNjcmlwdGlvbiIsImRvbWFpbiIsInNlcmllc1R5cGUiLCJ0IiwidmFsdWUiLCJ4UmFuZ2UiLCJjcmVhdGVSYW5nZUZvckRvbWFpbiIsImNyZWF0ZURhdGFTZXRTdGF0aWMiLCJkYXRhU2V0IiwiYW1wbGl0dWRlRnVuY3Rpb24iLCJkeCIsImdldExlbmd0aCIsIngiLCJtaW4iLCJ5IiwiaSIsInB1c2giLCJsZW5ndGgiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkhhcm1vbmljLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEhhcm1vbmljIGlzIHRoZSBtb2RlbCBvZiBhIGhhcm1vbmljIGluIGEgRm91cmllciBzZXJpZXMsIHVzZWQgaW4gdGhlICdEaXNjcmV0ZScgYW5kICdXYXZlIEdhbWUnIHNjcmVlbnMuXHJcbiAqIEZvciB0aGUgJ1dhdmUgUGFja2V0JyBzY3JlZW4sIGEgc2ltcGxlciBtb2RlbCBpcyB1c2VkLCBkdWUgdG8gdGhlIG51bWJlciBvZiBGb3VyaWVyIGNvbXBvbmVudHMgcmVxdWlyZWQgLVxyXG4gKiBzZWUgRm91cmllckNvbXBvbmVudC4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCB7IFRDb2xvciB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QsIHsgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgZm91cmllck1ha2luZ1dhdmVzIGZyb20gJy4uLy4uL2ZvdXJpZXJNYWtpbmdXYXZlcy5qcyc7XHJcbmltcG9ydCBBeGlzRGVzY3JpcHRpb24gZnJvbSAnLi9BeGlzRGVzY3JpcHRpb24uanMnO1xyXG5pbXBvcnQgRG9tYWluIGZyb20gJy4vRG9tYWluLmpzJztcclxuaW1wb3J0IGdldEFtcGxpdHVkZUZ1bmN0aW9uIGZyb20gJy4vZ2V0QW1wbGl0dWRlRnVuY3Rpb24uanMnO1xyXG5pbXBvcnQgU2VyaWVzVHlwZSBmcm9tICcuL1Nlcmllc1R5cGUuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuXHJcbiAgLy8gcmVxdWlyZWRcclxuICBvcmRlcjogbnVtYmVyOyAvLyB0aGUgb3JkZXIgb2YgdGhlIGhhcm1vbmljLCBudW1iZXJlZCBmcm9tIDFcclxuICBmcmVxdWVuY3k6IG51bWJlcjsgLy8gZnJlcXVlbmN5LCBpbiBIelxyXG4gIHdhdmVsZW5ndGg6IG51bWJlcjsgLy8gd2F2ZWxlbmd0aCwgaW4gbWV0ZXJzXHJcbiAgYW1wbGl0dWRlUmFuZ2U6IFJhbmdlOyAvLyByYW5nZSBvZiBhbXBsaXR1ZGUsIG5vIHVuaXRzXHJcbiAgY29sb3JQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8VENvbG9yPjsgLy8gdGhlIGNvbG9yIHVzZWQgdG8gdmlzdWFsaXplIHRoZSBoYXJtb25pY1xyXG5cclxuICAvLyBvcHRpb25hbFxyXG4gIGFtcGxpdHVkZT86IG51bWJlcjsgLy8gaW5pdGlhbCBhbXBsaXR1ZGUgb2YgdGhlIGhhcm1vbmljLCBubyB1bml0c1xyXG59O1xyXG5cclxudHlwZSBIYXJtb25pY09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxQaGV0aW9PYmplY3RPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIYXJtb25pYyBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcblxyXG4gIC8vIFNlZSBTZWxmT3B0aW9uc1xyXG4gIHB1YmxpYyByZWFkb25seSBvcmRlcjogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBmcmVxdWVuY3k6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgd2F2ZWxlbmd0aDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBhbXBsaXR1ZGVSYW5nZTogUmFuZ2U7XHJcbiAgcHVibGljIHJlYWRvbmx5IGNvbG9yUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFRDb2xvcj47XHJcblxyXG4gIC8vIHBlcmlvZCBvZiB0aGUgaGFybW9uaWMsIGluIG1pbGxpc2Vjb25kc1xyXG4gIHB1YmxpYyByZWFkb25seSBwZXJpb2Q6IG51bWJlcjtcclxuXHJcbiAgLy8gYW1wbGl0dWRlIG9mIHRoZSBoYXJtb25pYywgbm8gdW5pdHNcclxuICBwdWJsaWMgcmVhZG9ubHkgYW1wbGl0dWRlUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogSGFybW9uaWNPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8SGFybW9uaWNPcHRpb25zLCBTZWxmT3B0aW9ucywgUGhldGlvT2JqZWN0T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gSGFybW9uaWNPcHRpb25zXHJcbiAgICAgIGFtcGxpdHVkZTogMCxcclxuXHJcbiAgICAgIC8vIFBoZXRpb09iamVjdE9wdGlvbnNcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBvcHRpb25zLm9yZGVyICkgJiYgb3B0aW9ucy5vcmRlciA+IDAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuZnJlcXVlbmN5ID4gMCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy53YXZlbGVuZ3RoID4gMCApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5vcmRlciA9IG9wdGlvbnMub3JkZXI7XHJcbiAgICB0aGlzLmZyZXF1ZW5jeSA9IG9wdGlvbnMuZnJlcXVlbmN5O1xyXG4gICAgdGhpcy53YXZlbGVuZ3RoID0gb3B0aW9ucy53YXZlbGVuZ3RoO1xyXG4gICAgdGhpcy5hbXBsaXR1ZGVSYW5nZSA9IG9wdGlvbnMuYW1wbGl0dWRlUmFuZ2U7XHJcbiAgICB0aGlzLmNvbG9yUHJvcGVydHkgPSBvcHRpb25zLmNvbG9yUHJvcGVydHk7XHJcbiAgICB0aGlzLnBlcmlvZCA9IDEwMDAgLyB0aGlzLmZyZXF1ZW5jeTtcclxuXHJcbiAgICB0aGlzLmFtcGxpdHVkZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBvcHRpb25zLmFtcGxpdHVkZSwge1xyXG4gICAgICByYW5nZTogdGhpcy5hbXBsaXR1ZGVSYW5nZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBhbXBsaXR1ZGUgb2YgdGhpcyBoYXJtb25pYycsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYW1wbGl0dWRlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmFtcGxpdHVkZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBkYXRhIHNldCB0byBhcHByb3hpbWF0ZSB0aGlzIGhhcm1vbmljLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjcmVhdGVEYXRhU2V0KCBudW1iZXJPZlBvaW50czogbnVtYmVyLCBMOiBudW1iZXIsIFQ6IG51bWJlciwgeEF4aXNEZXNjcmlwdGlvbjogQXhpc0Rlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb21haW46IERvbWFpbiwgc2VyaWVzVHlwZTogU2VyaWVzVHlwZSwgdDogbnVtYmVyICk6IFZlY3RvcjJbXSB7XHJcbiAgICBjb25zdCBvcmRlciA9IHRoaXMub3JkZXI7XHJcbiAgICBjb25zdCBhbXBsaXR1ZGUgPSB0aGlzLmFtcGxpdHVkZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgY29uc3QgeFJhbmdlID0geEF4aXNEZXNjcmlwdGlvbi5jcmVhdGVSYW5nZUZvckRvbWFpbiggZG9tYWluLCBMLCBUICk7XHJcbiAgICByZXR1cm4gSGFybW9uaWMuY3JlYXRlRGF0YVNldFN0YXRpYyggb3JkZXIsIGFtcGxpdHVkZSwgbnVtYmVyT2ZQb2ludHMsIEwsIFQsIHhSYW5nZSwgZG9tYWluLCBzZXJpZXNUeXBlLCB0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgZGF0YSBzZXQgZm9yIGFueSBoYXJtb25pYy4gVGhpcyBpcyB1c2VkIGluIHRoZSBXYXZlIFBhY2tldCBzY3JlZW4sIHdoaWNoIGRvZXMgbm90IGNyZWF0ZSBIYXJtb25pY1xyXG4gICAqIGluc3RhbmNlcyBkdWUgdG8gdGhlIGxhcmdlIG51bWJlciBvZiBGb3VyaWVyIGNvbXBvbmVudHMgaW52b2x2ZWQuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVEYXRhU2V0U3RhdGljKCBvcmRlcjogbnVtYmVyLCBhbXBsaXR1ZGU6IG51bWJlciwgbnVtYmVyT2ZQb2ludHM6IG51bWJlciwgTDogbnVtYmVyLCBUOiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4UmFuZ2U6IFJhbmdlLCBkb21haW46IERvbWFpbiwgc2VyaWVzVHlwZTogU2VyaWVzVHlwZSwgdDogbnVtYmVyICk6IFZlY3RvcjJbXSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggb3JkZXIgKSAmJiBvcmRlciA+IDAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIG51bWJlck9mUG9pbnRzICkgJiYgbnVtYmVyT2ZQb2ludHMgPiAwICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBMID4gMCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggVCA+IDAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHQgPj0gMCApO1xyXG5cclxuICAgIGNvbnN0IGRhdGFTZXQgPSBbXTtcclxuICAgIGNvbnN0IGFtcGxpdHVkZUZ1bmN0aW9uID0gZ2V0QW1wbGl0dWRlRnVuY3Rpb24oIGRvbWFpbiwgc2VyaWVzVHlwZSApO1xyXG5cclxuICAgIC8vIE1ha2UgZHggYSBiaXQgbGFyZ2VyIHRoYW4gbmVjZXNzYXJ5LCBzbyB0aGF0IHdlIGNvdmVyIHRoZSBlbnRpcmUgeFJhbmdlIGJ5IHNsaWdodGx5IGV4Y2VlZGluZyB4UmFuZ2UubWF4LlxyXG4gICAgY29uc3QgZHggPSB4UmFuZ2UuZ2V0TGVuZ3RoKCkgLyAoIG51bWJlck9mUG9pbnRzIC0gMSApO1xyXG5cclxuICAgIGxldCB4ID0geFJhbmdlLm1pbjtcclxuICAgIGxldCB5O1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZQb2ludHM7IGkrKyApIHtcclxuICAgICAgeSA9IGFtcGxpdHVkZUZ1bmN0aW9uKCBhbXBsaXR1ZGUsIG9yZGVyLCB4LCB0LCBMLCBUICk7XHJcbiAgICAgIGRhdGFTZXQucHVzaCggbmV3IFZlY3RvcjIoIHgsIHkgKSApO1xyXG4gICAgICB4ICs9IGR4O1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZGF0YVNldC5sZW5ndGggPT09IG51bWJlck9mUG9pbnRzLCAnaW5jb3JyZWN0IG51bWJlciBvZiBwb2ludHMgaW4gZGF0YVNldCcgKTtcclxuXHJcbiAgICByZXR1cm4gZGF0YVNldDtcclxuICB9XHJcbn1cclxuXHJcbmZvdXJpZXJNYWtpbmdXYXZlcy5yZWdpc3RlciggJ0hhcm1vbmljJywgSGFybW9uaWMgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FB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