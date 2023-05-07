// Copyright 2019-2022, University of Colorado Boulder

/**
 * This scene shows a the iconic "waving girl" aperture shape.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import waving_girl_aperture_png from '../../../images/waving_girl_aperture_png.js';
import WaveInterferenceConstants from '../../common/WaveInterferenceConstants.js';
import waveInterference from '../../waveInterference.js';
import DiffractionScene from './DiffractionScene.js';
class WavingGirlScene extends DiffractionScene {
  // the height of the aperture in mm

  // the angle of rotation in degrees

  constructor() {
    const heightProperty = new NumberProperty(100 * 1E-3, {
      range: new Range(40 * 1E-3, 400 * 1E-3),
      units: 'mm'
    });
    const rotationProperty = new NumberProperty(0, {
      range: new Range(0, 360),
      units: '\u00B0' // degrees
    });

    super([heightProperty, rotationProperty]);
    this.heightProperty = heightProperty;
    this.rotationProperty = rotationProperty;
  }

  /**
   * Render the aperture shape(s) to the canvas context.
   */
  renderToContext(context) {
    const modelToMatrixScale = WaveInterferenceConstants.DIFFRACTION_MODEL_TO_MATRIX_SCALE;
    context.translate(waving_girl_aperture_png.width / 2, waving_girl_aperture_png.height * 0.1);
    context.translate(waving_girl_aperture_png.width / 2, waving_girl_aperture_png.height / 2);
    context.rotate(this.rotationProperty.value / 360 * 2 * Math.PI);
    const scale = modelToMatrixScale / waving_girl_aperture_png.height * this.heightProperty.value;
    context.scale(scale, scale);
    context.translate(-waving_girl_aperture_png.width / 2, -waving_girl_aperture_png.height / 2);
    context.drawImage(waving_girl_aperture_png, 0, 0);
  }
}
waveInterference.register('WavingGirlScene', WavingGirlScene);
export default WavingGirlScene;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwid2F2aW5nX2dpcmxfYXBlcnR1cmVfcG5nIiwiV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cyIsIndhdmVJbnRlcmZlcmVuY2UiLCJEaWZmcmFjdGlvblNjZW5lIiwiV2F2aW5nR2lybFNjZW5lIiwiY29uc3RydWN0b3IiLCJoZWlnaHRQcm9wZXJ0eSIsInJhbmdlIiwidW5pdHMiLCJyb3RhdGlvblByb3BlcnR5IiwicmVuZGVyVG9Db250ZXh0IiwiY29udGV4dCIsIm1vZGVsVG9NYXRyaXhTY2FsZSIsIkRJRkZSQUNUSU9OX01PREVMX1RPX01BVFJJWF9TQ0FMRSIsInRyYW5zbGF0ZSIsIndpZHRoIiwiaGVpZ2h0Iiwicm90YXRlIiwidmFsdWUiLCJNYXRoIiwiUEkiLCJzY2FsZSIsImRyYXdJbWFnZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2F2aW5nR2lybFNjZW5lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoaXMgc2NlbmUgc2hvd3MgYSB0aGUgaWNvbmljIFwid2F2aW5nIGdpcmxcIiBhcGVydHVyZSBzaGFwZS5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgd2F2aW5nX2dpcmxfYXBlcnR1cmVfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy93YXZpbmdfZ2lybF9hcGVydHVyZV9wbmcuanMnO1xyXG5pbXBvcnQgV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCB3YXZlSW50ZXJmZXJlbmNlIGZyb20gJy4uLy4uL3dhdmVJbnRlcmZlcmVuY2UuanMnO1xyXG5pbXBvcnQgRGlmZnJhY3Rpb25TY2VuZSBmcm9tICcuL0RpZmZyYWN0aW9uU2NlbmUuanMnO1xyXG5cclxuY2xhc3MgV2F2aW5nR2lybFNjZW5lIGV4dGVuZHMgRGlmZnJhY3Rpb25TY2VuZSB7XHJcblxyXG4gIC8vIHRoZSBoZWlnaHQgb2YgdGhlIGFwZXJ0dXJlIGluIG1tXHJcbiAgcHVibGljIHJlYWRvbmx5IGhlaWdodFByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuXHJcbiAgLy8gdGhlIGFuZ2xlIG9mIHJvdGF0aW9uIGluIGRlZ3JlZXNcclxuICBwdWJsaWMgcmVhZG9ubHkgcm90YXRpb25Qcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICBjb25zdCBoZWlnaHRQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMTAwICogMUUtMywge1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCA0MCAqIDFFLTMsIDQwMCAqIDFFLTMgKSxcclxuICAgICAgdW5pdHM6ICdtbSdcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHJvdGF0aW9uUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMzYwICksXHJcbiAgICAgIHVuaXRzOiAnXFx1MDBCMCcgLy8gZGVncmVlc1xyXG4gICAgfSApO1xyXG4gICAgc3VwZXIoIFsgaGVpZ2h0UHJvcGVydHksIHJvdGF0aW9uUHJvcGVydHkgXSApO1xyXG5cclxuICAgIHRoaXMuaGVpZ2h0UHJvcGVydHkgPSBoZWlnaHRQcm9wZXJ0eTtcclxuICAgIHRoaXMucm90YXRpb25Qcm9wZXJ0eSA9IHJvdGF0aW9uUHJvcGVydHk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW5kZXIgdGhlIGFwZXJ0dXJlIHNoYXBlKHMpIHRvIHRoZSBjYW52YXMgY29udGV4dC5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgcmVuZGVyVG9Db250ZXh0KCBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgKTogdm9pZCB7XHJcbiAgICBjb25zdCBtb2RlbFRvTWF0cml4U2NhbGUgPSBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLkRJRkZSQUNUSU9OX01PREVMX1RPX01BVFJJWF9TQ0FMRTtcclxuICAgIGNvbnRleHQudHJhbnNsYXRlKCB3YXZpbmdfZ2lybF9hcGVydHVyZV9wbmcud2lkdGggLyAyLCB3YXZpbmdfZ2lybF9hcGVydHVyZV9wbmcuaGVpZ2h0ICogMC4xICk7XHJcbiAgICBjb250ZXh0LnRyYW5zbGF0ZSggd2F2aW5nX2dpcmxfYXBlcnR1cmVfcG5nLndpZHRoIC8gMiwgd2F2aW5nX2dpcmxfYXBlcnR1cmVfcG5nLmhlaWdodCAvIDIgKTtcclxuICAgIGNvbnRleHQucm90YXRlKCB0aGlzLnJvdGF0aW9uUHJvcGVydHkudmFsdWUgLyAzNjAgKiAyICogTWF0aC5QSSApO1xyXG4gICAgY29uc3Qgc2NhbGUgPSBtb2RlbFRvTWF0cml4U2NhbGUgLyB3YXZpbmdfZ2lybF9hcGVydHVyZV9wbmcuaGVpZ2h0ICogdGhpcy5oZWlnaHRQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnRleHQuc2NhbGUoIHNjYWxlLCBzY2FsZSApO1xyXG4gICAgY29udGV4dC50cmFuc2xhdGUoIC13YXZpbmdfZ2lybF9hcGVydHVyZV9wbmcud2lkdGggLyAyLCAtd2F2aW5nX2dpcmxfYXBlcnR1cmVfcG5nLmhlaWdodCAvIDIgKTtcclxuICAgIGNvbnRleHQuZHJhd0ltYWdlKCB3YXZpbmdfZ2lybF9hcGVydHVyZV9wbmcsIDAsIDAgKTtcclxuICB9XHJcbn1cclxuXHJcbndhdmVJbnRlcmZlcmVuY2UucmVnaXN0ZXIoICdXYXZpbmdHaXJsU2NlbmUnLCBXYXZpbmdHaXJsU2NlbmUgKTtcclxuZXhwb3J0IGRlZmF1bHQgV2F2aW5nR2lybFNjZW5lOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0Msd0JBQXdCLE1BQU0sNkNBQTZDO0FBQ2xGLE9BQU9DLHlCQUF5QixNQUFNLDJDQUEyQztBQUNqRixPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MsZ0JBQWdCLE1BQU0sdUJBQXVCO0FBRXBELE1BQU1DLGVBQWUsU0FBU0QsZ0JBQWdCLENBQUM7RUFFN0M7O0VBR0E7O0VBR09FLFdBQVdBLENBQUEsRUFBRztJQUVuQixNQUFNQyxjQUFjLEdBQUcsSUFBSVIsY0FBYyxDQUFFLEdBQUcsR0FBRyxJQUFJLEVBQUU7TUFDckRTLEtBQUssRUFBRSxJQUFJUixLQUFLLENBQUUsRUFBRSxHQUFHLElBQUksRUFBRSxHQUFHLEdBQUcsSUFBSyxDQUFDO01BQ3pDUyxLQUFLLEVBQUU7SUFDVCxDQUFFLENBQUM7SUFDSCxNQUFNQyxnQkFBZ0IsR0FBRyxJQUFJWCxjQUFjLENBQUUsQ0FBQyxFQUFFO01BQzlDUyxLQUFLLEVBQUUsSUFBSVIsS0FBSyxDQUFFLENBQUMsRUFBRSxHQUFJLENBQUM7TUFDMUJTLEtBQUssRUFBRSxRQUFRLENBQUM7SUFDbEIsQ0FBRSxDQUFDOztJQUNILEtBQUssQ0FBRSxDQUFFRixjQUFjLEVBQUVHLGdCQUFnQixDQUFHLENBQUM7SUFFN0MsSUFBSSxDQUFDSCxjQUFjLEdBQUdBLGNBQWM7SUFDcEMsSUFBSSxDQUFDRyxnQkFBZ0IsR0FBR0EsZ0JBQWdCO0VBQzFDOztFQUVBO0FBQ0Y7QUFDQTtFQUNxQkMsZUFBZUEsQ0FBRUMsT0FBaUMsRUFBUztJQUM1RSxNQUFNQyxrQkFBa0IsR0FBR1gseUJBQXlCLENBQUNZLGlDQUFpQztJQUN0RkYsT0FBTyxDQUFDRyxTQUFTLENBQUVkLHdCQUF3QixDQUFDZSxLQUFLLEdBQUcsQ0FBQyxFQUFFZix3QkFBd0IsQ0FBQ2dCLE1BQU0sR0FBRyxHQUFJLENBQUM7SUFDOUZMLE9BQU8sQ0FBQ0csU0FBUyxDQUFFZCx3QkFBd0IsQ0FBQ2UsS0FBSyxHQUFHLENBQUMsRUFBRWYsd0JBQXdCLENBQUNnQixNQUFNLEdBQUcsQ0FBRSxDQUFDO0lBQzVGTCxPQUFPLENBQUNNLE1BQU0sQ0FBRSxJQUFJLENBQUNSLGdCQUFnQixDQUFDUyxLQUFLLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBR0MsSUFBSSxDQUFDQyxFQUFHLENBQUM7SUFDakUsTUFBTUMsS0FBSyxHQUFHVCxrQkFBa0IsR0FBR1osd0JBQXdCLENBQUNnQixNQUFNLEdBQUcsSUFBSSxDQUFDVixjQUFjLENBQUNZLEtBQUs7SUFDOUZQLE9BQU8sQ0FBQ1UsS0FBSyxDQUFFQSxLQUFLLEVBQUVBLEtBQU0sQ0FBQztJQUM3QlYsT0FBTyxDQUFDRyxTQUFTLENBQUUsQ0FBQ2Qsd0JBQXdCLENBQUNlLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQ2Ysd0JBQXdCLENBQUNnQixNQUFNLEdBQUcsQ0FBRSxDQUFDO0lBQzlGTCxPQUFPLENBQUNXLFNBQVMsQ0FBRXRCLHdCQUF3QixFQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7RUFDckQ7QUFDRjtBQUVBRSxnQkFBZ0IsQ0FBQ3FCLFFBQVEsQ0FBRSxpQkFBaUIsRUFBRW5CLGVBQWdCLENBQUM7QUFDL0QsZUFBZUEsZUFBZSJ9