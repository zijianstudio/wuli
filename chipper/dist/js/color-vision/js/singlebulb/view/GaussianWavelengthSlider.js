// Copyright 2014-2022, University of Colorado Boulder

/**
 * GaussianWavelengthSlider acts the like WavelengthSlider from scenery-phet,
 * but with a Gaussian shape instead of the usual cursor.
 *
 * @author Aaron Davis
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import WavelengthSlider from '../../../../scenery-phet/js/WavelengthSlider.js';
import WavelengthSpectrumNode from '../../../../scenery-phet/js/WavelengthSpectrumNode.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import colorVision from '../../colorVision.js';
import ColorVisionConstants from '../../common/ColorVisionConstants.js';
import SingleBulbConstants from '../SingleBulbConstants.js';
class GaussianWavelengthSlider extends Node {
  /**
   * Wavelength slider with a gaussian
   * @param {Property.<number>} filterWavelengthProperty
   * @param {number} width the width of the track
   * @param {number} height the height of the track
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(filterWavelengthProperty, width, height, tandem, options) {
    super();

    // Add lower WavelengthSlider
    const slider = new WavelengthSlider(filterWavelengthProperty, {
      tandem: tandem,
      tweakersVisible: false,
      valueVisible: false,
      trackWidth: width,
      trackHeight: height,
      trackOpacity: 0.5,
      cursorVisible: false,
      thumbWidth: 30,
      thumbHeight: 40,
      thumbTouchAreaYDilation: 10,
      trackBorderStroke: ColorVisionConstants.SLIDER_BORDER_STROKE
    });
    this.addChild(slider);

    // Create an empty node for taking the gaussian clip area. This node will shift the opposite direction as the
    // wavelength track in order to create the effect of the gaussian moving without having to redraw the shape
    const containerNode = new Node();
    const spectrumTrack = new WavelengthSpectrumNode({
      size: new Dimension2(width, height)
    });
    containerNode.addChild(spectrumTrack);
    this.addChild(containerNode);

    // function for a gaussian with mean 0 and standard deviation 0.5
    const constant = 1 / (0.5 * Math.sqrt(2 * Math.PI));
    function gaussian(x) {
      const exponent = -Math.pow(x, 2);
      return constant * Math.pow(Math.E, exponent);
    }

    // this function is almost identical to the one in WavelengthSlider, perhaps it should be refactored out
    function wavelengthToPosition(wavelength) {
      return Math.floor(Utils.clamp(Utils.linear(VisibleColor.MIN_WAVELENGTH, VisibleColor.MAX_WAVELENGTH, 0, width, wavelength), 0, width));
    }

    // constants for determining the shape of the gaussian
    const gaussianWidth = wavelengthToPosition(VisibleColor.MIN_WAVELENGTH + SingleBulbConstants.GAUSSIAN_WIDTH) - wavelengthToPosition(VisibleColor.MIN_WAVELENGTH);
    const xOffset = width / 2 - gaussianWidth / 2;

    // use the domain [-3, 3] for calculating the gaussian to avoid long, flat stretches
    const domainLinearFunction = new LinearFunction(0, gaussianWidth, -3, 3);

    // create a gaussian shaped curve and set it as the clip area of the container node
    const gaussianCurve = new Shape().moveTo(xOffset, height);
    for (let i = 0; i <= gaussianWidth; i++) {
      const xCoord = domainLinearFunction.evaluate(i);
      gaussianCurve.lineTo(i + xOffset, height - gaussian(xCoord) * height * 1.2);
    }
    containerNode.setClipArea(gaussianCurve);

    // create a path for drawing the outline of the gaussian
    const gaussianPath = new Path(gaussianCurve, {
      lineWidth: 1,
      stroke: 'white'
    });
    this.addChild(gaussianPath);
    filterWavelengthProperty.link(wavelength => {
      const newPosition = wavelengthToPosition(wavelength);
      spectrumTrack.x = width / 2 - newPosition;
      containerNode.x = newPosition - width / 2;
      gaussianPath.centerX = newPosition;
    });
    this.mutate(options);
  }
}
colorVision.register('GaussianWavelengthSlider', GaussianWavelengthSlider);
export default GaussianWavelengthSlider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiTGluZWFyRnVuY3Rpb24iLCJVdGlscyIsIlNoYXBlIiwiVmlzaWJsZUNvbG9yIiwiV2F2ZWxlbmd0aFNsaWRlciIsIldhdmVsZW5ndGhTcGVjdHJ1bU5vZGUiLCJOb2RlIiwiUGF0aCIsImNvbG9yVmlzaW9uIiwiQ29sb3JWaXNpb25Db25zdGFudHMiLCJTaW5nbGVCdWxiQ29uc3RhbnRzIiwiR2F1c3NpYW5XYXZlbGVuZ3RoU2xpZGVyIiwiY29uc3RydWN0b3IiLCJmaWx0ZXJXYXZlbGVuZ3RoUHJvcGVydHkiLCJ3aWR0aCIsImhlaWdodCIsInRhbmRlbSIsIm9wdGlvbnMiLCJzbGlkZXIiLCJ0d2Vha2Vyc1Zpc2libGUiLCJ2YWx1ZVZpc2libGUiLCJ0cmFja1dpZHRoIiwidHJhY2tIZWlnaHQiLCJ0cmFja09wYWNpdHkiLCJjdXJzb3JWaXNpYmxlIiwidGh1bWJXaWR0aCIsInRodW1iSGVpZ2h0IiwidGh1bWJUb3VjaEFyZWFZRGlsYXRpb24iLCJ0cmFja0JvcmRlclN0cm9rZSIsIlNMSURFUl9CT1JERVJfU1RST0tFIiwiYWRkQ2hpbGQiLCJjb250YWluZXJOb2RlIiwic3BlY3RydW1UcmFjayIsInNpemUiLCJjb25zdGFudCIsIk1hdGgiLCJzcXJ0IiwiUEkiLCJnYXVzc2lhbiIsIngiLCJleHBvbmVudCIsInBvdyIsIkUiLCJ3YXZlbGVuZ3RoVG9Qb3NpdGlvbiIsIndhdmVsZW5ndGgiLCJmbG9vciIsImNsYW1wIiwibGluZWFyIiwiTUlOX1dBVkVMRU5HVEgiLCJNQVhfV0FWRUxFTkdUSCIsImdhdXNzaWFuV2lkdGgiLCJHQVVTU0lBTl9XSURUSCIsInhPZmZzZXQiLCJkb21haW5MaW5lYXJGdW5jdGlvbiIsImdhdXNzaWFuQ3VydmUiLCJtb3ZlVG8iLCJpIiwieENvb3JkIiwiZXZhbHVhdGUiLCJsaW5lVG8iLCJzZXRDbGlwQXJlYSIsImdhdXNzaWFuUGF0aCIsImxpbmVXaWR0aCIsInN0cm9rZSIsImxpbmsiLCJuZXdQb3NpdGlvbiIsImNlbnRlclgiLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdhdXNzaWFuV2F2ZWxlbmd0aFNsaWRlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBHYXVzc2lhbldhdmVsZW5ndGhTbGlkZXIgYWN0cyB0aGUgbGlrZSBXYXZlbGVuZ3RoU2xpZGVyIGZyb20gc2NlbmVyeS1waGV0LFxyXG4gKiBidXQgd2l0aCBhIEdhdXNzaWFuIHNoYXBlIGluc3RlYWQgb2YgdGhlIHVzdWFsIGN1cnNvci5cclxuICpcclxuICogQGF1dGhvciBBYXJvbiBEYXZpc1xyXG4gKi9cclxuXHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IExpbmVhckZ1bmN0aW9uIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9MaW5lYXJGdW5jdGlvbi5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBWaXNpYmxlQ29sb3IgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1Zpc2libGVDb2xvci5qcyc7XHJcbmltcG9ydCBXYXZlbGVuZ3RoU2xpZGVyIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9XYXZlbGVuZ3RoU2xpZGVyLmpzJztcclxuaW1wb3J0IFdhdmVsZW5ndGhTcGVjdHJ1bU5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1dhdmVsZW5ndGhTcGVjdHJ1bU5vZGUuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGNvbG9yVmlzaW9uIGZyb20gJy4uLy4uL2NvbG9yVmlzaW9uLmpzJztcclxuaW1wb3J0IENvbG9yVmlzaW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9Db2xvclZpc2lvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBTaW5nbGVCdWxiQ29uc3RhbnRzIGZyb20gJy4uL1NpbmdsZUJ1bGJDb25zdGFudHMuanMnO1xyXG5cclxuY2xhc3MgR2F1c3NpYW5XYXZlbGVuZ3RoU2xpZGVyIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIFdhdmVsZW5ndGggc2xpZGVyIHdpdGggYSBnYXVzc2lhblxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IGZpbHRlcldhdmVsZW5ndGhQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCB0aGUgd2lkdGggb2YgdGhlIHRyYWNrXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCB0aGUgaGVpZ2h0IG9mIHRoZSB0cmFja1xyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGZpbHRlcldhdmVsZW5ndGhQcm9wZXJ0eSwgd2lkdGgsIGhlaWdodCwgdGFuZGVtLCBvcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gQWRkIGxvd2VyIFdhdmVsZW5ndGhTbGlkZXJcclxuICAgIGNvbnN0IHNsaWRlciA9IG5ldyBXYXZlbGVuZ3RoU2xpZGVyKCBmaWx0ZXJXYXZlbGVuZ3RoUHJvcGVydHksIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHR3ZWFrZXJzVmlzaWJsZTogZmFsc2UsXHJcbiAgICAgIHZhbHVlVmlzaWJsZTogZmFsc2UsXHJcbiAgICAgIHRyYWNrV2lkdGg6IHdpZHRoLFxyXG4gICAgICB0cmFja0hlaWdodDogaGVpZ2h0LFxyXG4gICAgICB0cmFja09wYWNpdHk6IDAuNSxcclxuICAgICAgY3Vyc29yVmlzaWJsZTogZmFsc2UsXHJcbiAgICAgIHRodW1iV2lkdGg6IDMwLFxyXG4gICAgICB0aHVtYkhlaWdodDogNDAsXHJcbiAgICAgIHRodW1iVG91Y2hBcmVhWURpbGF0aW9uOiAxMCxcclxuICAgICAgdHJhY2tCb3JkZXJTdHJva2U6IENvbG9yVmlzaW9uQ29uc3RhbnRzLlNMSURFUl9CT1JERVJfU1RST0tFXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzbGlkZXIgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYW4gZW1wdHkgbm9kZSBmb3IgdGFraW5nIHRoZSBnYXVzc2lhbiBjbGlwIGFyZWEuIFRoaXMgbm9kZSB3aWxsIHNoaWZ0IHRoZSBvcHBvc2l0ZSBkaXJlY3Rpb24gYXMgdGhlXHJcbiAgICAvLyB3YXZlbGVuZ3RoIHRyYWNrIGluIG9yZGVyIHRvIGNyZWF0ZSB0aGUgZWZmZWN0IG9mIHRoZSBnYXVzc2lhbiBtb3Zpbmcgd2l0aG91dCBoYXZpbmcgdG8gcmVkcmF3IHRoZSBzaGFwZVxyXG4gICAgY29uc3QgY29udGFpbmVyTm9kZSA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgY29uc3Qgc3BlY3RydW1UcmFjayA9IG5ldyBXYXZlbGVuZ3RoU3BlY3RydW1Ob2RlKCB7IHNpemU6IG5ldyBEaW1lbnNpb24yKCB3aWR0aCwgaGVpZ2h0ICkgfSApO1xyXG4gICAgY29udGFpbmVyTm9kZS5hZGRDaGlsZCggc3BlY3RydW1UcmFjayApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggY29udGFpbmVyTm9kZSApO1xyXG5cclxuICAgIC8vIGZ1bmN0aW9uIGZvciBhIGdhdXNzaWFuIHdpdGggbWVhbiAwIGFuZCBzdGFuZGFyZCBkZXZpYXRpb24gMC41XHJcbiAgICBjb25zdCBjb25zdGFudCA9IDEgLyAoIDAuNSAqIE1hdGguc3FydCggMiAqIE1hdGguUEkgKSApO1xyXG5cclxuICAgIGZ1bmN0aW9uIGdhdXNzaWFuKCB4ICkge1xyXG4gICAgICBjb25zdCBleHBvbmVudCA9IC1NYXRoLnBvdyggeCwgMiApO1xyXG4gICAgICByZXR1cm4gY29uc3RhbnQgKiBNYXRoLnBvdyggTWF0aC5FLCBleHBvbmVudCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoaXMgZnVuY3Rpb24gaXMgYWxtb3N0IGlkZW50aWNhbCB0byB0aGUgb25lIGluIFdhdmVsZW5ndGhTbGlkZXIsIHBlcmhhcHMgaXQgc2hvdWxkIGJlIHJlZmFjdG9yZWQgb3V0XHJcbiAgICBmdW5jdGlvbiB3YXZlbGVuZ3RoVG9Qb3NpdGlvbiggd2F2ZWxlbmd0aCApIHtcclxuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoIFV0aWxzLmNsYW1wKCBVdGlscy5saW5lYXIoIFZpc2libGVDb2xvci5NSU5fV0FWRUxFTkdUSCwgVmlzaWJsZUNvbG9yLk1BWF9XQVZFTEVOR1RILCAwLCB3aWR0aCwgd2F2ZWxlbmd0aCApLCAwLCB3aWR0aCApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY29uc3RhbnRzIGZvciBkZXRlcm1pbmluZyB0aGUgc2hhcGUgb2YgdGhlIGdhdXNzaWFuXHJcbiAgICBjb25zdCBnYXVzc2lhbldpZHRoID0gd2F2ZWxlbmd0aFRvUG9zaXRpb24oIFZpc2libGVDb2xvci5NSU5fV0FWRUxFTkdUSCArIFNpbmdsZUJ1bGJDb25zdGFudHMuR0FVU1NJQU5fV0lEVEggKSAtIHdhdmVsZW5ndGhUb1Bvc2l0aW9uKCBWaXNpYmxlQ29sb3IuTUlOX1dBVkVMRU5HVEggKTtcclxuICAgIGNvbnN0IHhPZmZzZXQgPSB3aWR0aCAvIDIgLSBnYXVzc2lhbldpZHRoIC8gMjtcclxuXHJcbiAgICAvLyB1c2UgdGhlIGRvbWFpbiBbLTMsIDNdIGZvciBjYWxjdWxhdGluZyB0aGUgZ2F1c3NpYW4gdG8gYXZvaWQgbG9uZywgZmxhdCBzdHJldGNoZXNcclxuICAgIGNvbnN0IGRvbWFpbkxpbmVhckZ1bmN0aW9uID0gbmV3IExpbmVhckZ1bmN0aW9uKCAwLCBnYXVzc2lhbldpZHRoLCAtMywgMyApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhIGdhdXNzaWFuIHNoYXBlZCBjdXJ2ZSBhbmQgc2V0IGl0IGFzIHRoZSBjbGlwIGFyZWEgb2YgdGhlIGNvbnRhaW5lciBub2RlXHJcbiAgICBjb25zdCBnYXVzc2lhbkN1cnZlID0gbmV3IFNoYXBlKCkubW92ZVRvKCB4T2Zmc2V0LCBoZWlnaHQgKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8PSBnYXVzc2lhbldpZHRoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHhDb29yZCA9IGRvbWFpbkxpbmVhckZ1bmN0aW9uLmV2YWx1YXRlKCBpICk7XHJcbiAgICAgIGdhdXNzaWFuQ3VydmUubGluZVRvKCBpICsgeE9mZnNldCwgaGVpZ2h0IC0gZ2F1c3NpYW4oIHhDb29yZCApICogaGVpZ2h0ICogMS4yICk7XHJcbiAgICB9XHJcbiAgICBjb250YWluZXJOb2RlLnNldENsaXBBcmVhKCBnYXVzc2lhbkN1cnZlICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGEgcGF0aCBmb3IgZHJhd2luZyB0aGUgb3V0bGluZSBvZiB0aGUgZ2F1c3NpYW5cclxuICAgIGNvbnN0IGdhdXNzaWFuUGF0aCA9IG5ldyBQYXRoKCBnYXVzc2lhbkN1cnZlLCB7IGxpbmVXaWR0aDogMSwgc3Ryb2tlOiAnd2hpdGUnIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGdhdXNzaWFuUGF0aCApO1xyXG5cclxuICAgIGZpbHRlcldhdmVsZW5ndGhQcm9wZXJ0eS5saW5rKCB3YXZlbGVuZ3RoID0+IHtcclxuICAgICAgY29uc3QgbmV3UG9zaXRpb24gPSB3YXZlbGVuZ3RoVG9Qb3NpdGlvbiggd2F2ZWxlbmd0aCApO1xyXG4gICAgICBzcGVjdHJ1bVRyYWNrLnggPSB3aWR0aCAvIDIgLSBuZXdQb3NpdGlvbjtcclxuICAgICAgY29udGFpbmVyTm9kZS54ID0gbmV3UG9zaXRpb24gLSB3aWR0aCAvIDI7XHJcbiAgICAgIGdhdXNzaWFuUGF0aC5jZW50ZXJYID0gbmV3UG9zaXRpb247XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbG9yVmlzaW9uLnJlZ2lzdGVyKCAnR2F1c3NpYW5XYXZlbGVuZ3RoU2xpZGVyJywgR2F1c3NpYW5XYXZlbGVuZ3RoU2xpZGVyICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHYXVzc2lhbldhdmVsZW5ndGhTbGlkZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxjQUFjLE1BQU0sc0NBQXNDO0FBQ2pFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxZQUFZLE1BQU0sNkNBQTZDO0FBQ3RFLE9BQU9DLGdCQUFnQixNQUFNLGlEQUFpRDtBQUM5RSxPQUFPQyxzQkFBc0IsTUFBTSx1REFBdUQ7QUFDMUYsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzlELE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0Msb0JBQW9CLE1BQU0sc0NBQXNDO0FBQ3ZFLE9BQU9DLG1CQUFtQixNQUFNLDJCQUEyQjtBQUUzRCxNQUFNQyx3QkFBd0IsU0FBU0wsSUFBSSxDQUFDO0VBRTFDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU0sV0FBV0EsQ0FBRUMsd0JBQXdCLEVBQUVDLEtBQUssRUFBRUMsTUFBTSxFQUFFQyxNQUFNLEVBQUVDLE9BQU8sRUFBRztJQUV0RSxLQUFLLENBQUMsQ0FBQzs7SUFFUDtJQUNBLE1BQU1DLE1BQU0sR0FBRyxJQUFJZCxnQkFBZ0IsQ0FBRVMsd0JBQXdCLEVBQUU7TUFDN0RHLE1BQU0sRUFBRUEsTUFBTTtNQUNkRyxlQUFlLEVBQUUsS0FBSztNQUN0QkMsWUFBWSxFQUFFLEtBQUs7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