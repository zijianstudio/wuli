// Copyright 2020-2023, University of Colorado Boulder

/**
 * HarmonicsSpinner is the spinner used to set the number of harmonics in the Fourier series. It appears in the
 * 'Discrete' screen's control panel.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import NumberSpinner from '../../../../sun/js/NumberSpinner.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
export default class HarmonicsSpinner extends NumberSpinner {
  /**
   * @param {NumberProperty} numberOfHarmonicsProperty
   * @param {Object} [options]
   */
  constructor(numberOfHarmonicsProperty, options) {
    assert && assert(numberOfHarmonicsProperty instanceof NumberProperty);
    options = merge({
      // NumberSpinner options
      arrowsPosition: 'leftRight',
      numberDisplayOptions: {
        align: 'center',
        xMargin: 8,
        yMargin: 2,
        cornerRadius: 3,
        textOptions: {
          font: new PhetFont(14)
        }
      },
      touchAreaXDilation: 25,
      touchAreaYDilation: 12,
      mouseAreaXDilation: 5,
      mouseAreaYDilation: 5
    }, options);
    super(numberOfHarmonicsProperty, numberOfHarmonicsProperty.rangeProperty, options);
  }
}
fourierMakingWaves.register('HarmonicsSpinner', HarmonicsSpinner);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIm1lcmdlIiwiUGhldEZvbnQiLCJOdW1iZXJTcGlubmVyIiwiZm91cmllck1ha2luZ1dhdmVzIiwiSGFybW9uaWNzU3Bpbm5lciIsImNvbnN0cnVjdG9yIiwibnVtYmVyT2ZIYXJtb25pY3NQcm9wZXJ0eSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJhcnJvd3NQb3NpdGlvbiIsIm51bWJlckRpc3BsYXlPcHRpb25zIiwiYWxpZ24iLCJ4TWFyZ2luIiwieU1hcmdpbiIsImNvcm5lclJhZGl1cyIsInRleHRPcHRpb25zIiwiZm9udCIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsIm1vdXNlQXJlYVhEaWxhdGlvbiIsIm1vdXNlQXJlYVlEaWxhdGlvbiIsInJhbmdlUHJvcGVydHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkhhcm1vbmljc1NwaW5uZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSGFybW9uaWNzU3Bpbm5lciBpcyB0aGUgc3Bpbm5lciB1c2VkIHRvIHNldCB0aGUgbnVtYmVyIG9mIGhhcm1vbmljcyBpbiB0aGUgRm91cmllciBzZXJpZXMuIEl0IGFwcGVhcnMgaW4gdGhlXHJcbiAqICdEaXNjcmV0ZScgc2NyZWVuJ3MgY29udHJvbCBwYW5lbC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IE51bWJlclNwaW5uZXIgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL051bWJlclNwaW5uZXIuanMnO1xyXG5pbXBvcnQgZm91cmllck1ha2luZ1dhdmVzIGZyb20gJy4uLy4uL2ZvdXJpZXJNYWtpbmdXYXZlcy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIYXJtb25pY3NTcGlubmVyIGV4dGVuZHMgTnVtYmVyU3Bpbm5lciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyUHJvcGVydHl9IG51bWJlck9mSGFybW9uaWNzUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG51bWJlck9mSGFybW9uaWNzUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbnVtYmVyT2ZIYXJtb25pY3NQcm9wZXJ0eSBpbnN0YW5jZW9mIE51bWJlclByb3BlcnR5ICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBOdW1iZXJTcGlubmVyIG9wdGlvbnNcclxuICAgICAgYXJyb3dzUG9zaXRpb246ICdsZWZ0UmlnaHQnLFxyXG4gICAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xyXG4gICAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICB4TWFyZ2luOiA4LFxyXG4gICAgICAgIHlNYXJnaW46IDIsXHJcbiAgICAgICAgY29ybmVyUmFkaXVzOiAzLFxyXG4gICAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE0IClcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMjUsXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMTIsXHJcbiAgICAgIG1vdXNlQXJlYVhEaWxhdGlvbjogNSxcclxuICAgICAgbW91c2VBcmVhWURpbGF0aW9uOiA1XHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG51bWJlck9mSGFybW9uaWNzUHJvcGVydHksIG51bWJlck9mSGFybW9uaWNzUHJvcGVydHkucmFuZ2VQcm9wZXJ0eSwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuZm91cmllck1ha2luZ1dhdmVzLnJlZ2lzdGVyKCAnSGFybW9uaWNzU3Bpbm5lcicsIEhhcm1vbmljc1NwaW5uZXIgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxhQUFhLE1BQU0scUNBQXFDO0FBQy9ELE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUU1RCxlQUFlLE1BQU1DLGdCQUFnQixTQUFTRixhQUFhLENBQUM7RUFFMUQ7QUFDRjtBQUNBO0FBQ0E7RUFDRUcsV0FBV0EsQ0FBRUMseUJBQXlCLEVBQUVDLE9BQU8sRUFBRztJQUVoREMsTUFBTSxJQUFJQSxNQUFNLENBQUVGLHlCQUF5QixZQUFZUCxjQUFlLENBQUM7SUFFdkVRLE9BQU8sR0FBR1AsS0FBSyxDQUFFO01BRWY7TUFDQVMsY0FBYyxFQUFFLFdBQVc7TUFDM0JDLG9CQUFvQixFQUFFO1FBQ3BCQyxLQUFLLEVBQUUsUUFBUTtRQUNmQyxPQUFPLEVBQUUsQ0FBQztRQUNWQyxPQUFPLEVBQUUsQ0FBQztRQUNWQyxZQUFZLEVBQUUsQ0FBQztRQUNmQyxXQUFXLEVBQUU7VUFDWEMsSUFBSSxFQUFFLElBQUlmLFFBQVEsQ0FBRSxFQUFHO1FBQ3pCO01BQ0YsQ0FBQztNQUNEZ0Isa0JBQWtCLEVBQUUsRUFBRTtNQUN0QkMsa0JBQWtCLEVBQUUsRUFBRTtNQUN0QkMsa0JBQWtCLEVBQUUsQ0FBQztNQUNyQkMsa0JBQWtCLEVBQUU7SUFDdEIsQ0FBQyxFQUFFYixPQUFRLENBQUM7SUFFWixLQUFLLENBQUVELHlCQUF5QixFQUFFQSx5QkFBeUIsQ0FBQ2UsYUFBYSxFQUFFZCxPQUFRLENBQUM7RUFDdEY7QUFDRjtBQUVBSixrQkFBa0IsQ0FBQ21CLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRWxCLGdCQUFpQixDQUFDIn0=