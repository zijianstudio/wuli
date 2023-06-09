// Copyright 2015-2023, University of Colorado Boulder

/**
 * Creates a grayscale image.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Image } from '../../../../../scenery/js/imports.js';
import grayscale_png from '../../../../mipmaps/functions/grayscale_png.js';
import FBConstants from '../../../common/FBConstants.js';
import ImageFunction from '../../../common/model/functions/ImageFunction.js';
import functionBuilder from '../../../functionBuilder.js';
import FBCanvasUtils from '../FBCanvasUtils.js';
export default class Grayscale extends ImageFunction {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = options || {};
    options.name = 'Grayscale';
    options.fill = 'rgb( 232, 232, 232 )';
    options.invertible = false; // converting to grayscale is lossy

    const iconNode = new Image(grayscale_png, {
      scale: FBConstants.PATTERNS_FUNCTION_ICON_SCALE
    });
    super(iconNode, options);
  }

  /**
   * Applies this function.
   *
   * @param {HTMLCanvasElement} inputCanvas
   * @returns {HTMLCanvasElement}
   * @public
   * @override
   */
  applyFunction(inputCanvas) {
    const imageData = FBCanvasUtils.getImageData(inputCanvas);

    // Average the red, green and blue values of each pixel. This drains the color from the image.
    const data = imageData.data;
    for (let i = 0; i < data.length - 4; i += 4) {
      const average = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = average;
      data[i + 1] = average;
      data[i + 2] = average;
    }
    return FBCanvasUtils.createCanvasWithImageData(imageData);
  }
}
functionBuilder.register('Grayscale', Grayscale);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbWFnZSIsImdyYXlzY2FsZV9wbmciLCJGQkNvbnN0YW50cyIsIkltYWdlRnVuY3Rpb24iLCJmdW5jdGlvbkJ1aWxkZXIiLCJGQkNhbnZhc1V0aWxzIiwiR3JheXNjYWxlIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwibmFtZSIsImZpbGwiLCJpbnZlcnRpYmxlIiwiaWNvbk5vZGUiLCJzY2FsZSIsIlBBVFRFUk5TX0ZVTkNUSU9OX0lDT05fU0NBTEUiLCJhcHBseUZ1bmN0aW9uIiwiaW5wdXRDYW52YXMiLCJpbWFnZURhdGEiLCJnZXRJbWFnZURhdGEiLCJkYXRhIiwiaSIsImxlbmd0aCIsImF2ZXJhZ2UiLCJjcmVhdGVDYW52YXNXaXRoSW1hZ2VEYXRhIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHcmF5c2NhbGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIGdyYXlzY2FsZSBpbWFnZS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgeyBJbWFnZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBncmF5c2NhbGVfcG5nIGZyb20gJy4uLy4uLy4uLy4uL21pcG1hcHMvZnVuY3Rpb25zL2dyYXlzY2FsZV9wbmcuanMnO1xyXG5pbXBvcnQgRkJDb25zdGFudHMgZnJvbSAnLi4vLi4vLi4vY29tbW9uL0ZCQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEltYWdlRnVuY3Rpb24gZnJvbSAnLi4vLi4vLi4vY29tbW9uL21vZGVsL2Z1bmN0aW9ucy9JbWFnZUZ1bmN0aW9uLmpzJztcclxuaW1wb3J0IGZ1bmN0aW9uQnVpbGRlciBmcm9tICcuLi8uLi8uLi9mdW5jdGlvbkJ1aWxkZXIuanMnO1xyXG5pbXBvcnQgRkJDYW52YXNVdGlscyBmcm9tICcuLi9GQkNhbnZhc1V0aWxzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyYXlzY2FsZSBleHRlbmRzIEltYWdlRnVuY3Rpb24ge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcbiAgICBvcHRpb25zLm5hbWUgPSAnR3JheXNjYWxlJztcclxuICAgIG9wdGlvbnMuZmlsbCA9ICdyZ2IoIDIzMiwgMjMyLCAyMzIgKSc7XHJcbiAgICBvcHRpb25zLmludmVydGlibGUgPSBmYWxzZTsgLy8gY29udmVydGluZyB0byBncmF5c2NhbGUgaXMgbG9zc3lcclxuXHJcbiAgICBjb25zdCBpY29uTm9kZSA9IG5ldyBJbWFnZSggZ3JheXNjYWxlX3BuZywgeyBzY2FsZTogRkJDb25zdGFudHMuUEFUVEVSTlNfRlVOQ1RJT05fSUNPTl9TQ0FMRSB9ICk7XHJcblxyXG4gICAgc3VwZXIoIGljb25Ob2RlLCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBsaWVzIHRoaXMgZnVuY3Rpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0hUTUxDYW52YXNFbGVtZW50fSBpbnB1dENhbnZhc1xyXG4gICAqIEByZXR1cm5zIHtIVE1MQ2FudmFzRWxlbWVudH1cclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgYXBwbHlGdW5jdGlvbiggaW5wdXRDYW52YXMgKSB7XHJcblxyXG4gICAgY29uc3QgaW1hZ2VEYXRhID0gRkJDYW52YXNVdGlscy5nZXRJbWFnZURhdGEoIGlucHV0Q2FudmFzICk7XHJcblxyXG4gICAgLy8gQXZlcmFnZSB0aGUgcmVkLCBncmVlbiBhbmQgYmx1ZSB2YWx1ZXMgb2YgZWFjaCBwaXhlbC4gVGhpcyBkcmFpbnMgdGhlIGNvbG9yIGZyb20gdGhlIGltYWdlLlxyXG4gICAgY29uc3QgZGF0YSA9IGltYWdlRGF0YS5kYXRhO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGggLSA0OyBpICs9IDQgKSB7XHJcbiAgICAgIGNvbnN0IGF2ZXJhZ2UgPSAoIGRhdGFbIGkgXSArIGRhdGFbIGkgKyAxIF0gKyBkYXRhWyBpICsgMiBdICkgLyAzO1xyXG4gICAgICBkYXRhWyBpIF0gPSBhdmVyYWdlO1xyXG4gICAgICBkYXRhWyBpICsgMSBdID0gYXZlcmFnZTtcclxuICAgICAgZGF0YVsgaSArIDIgXSA9IGF2ZXJhZ2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIEZCQ2FudmFzVXRpbHMuY3JlYXRlQ2FudmFzV2l0aEltYWdlRGF0YSggaW1hZ2VEYXRhICk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbkJ1aWxkZXIucmVnaXN0ZXIoICdHcmF5c2NhbGUnLCBHcmF5c2NhbGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsS0FBSyxRQUFRLHNDQUFzQztBQUM1RCxPQUFPQyxhQUFhLE1BQU0sZ0RBQWdEO0FBQzFFLE9BQU9DLFdBQVcsTUFBTSxnQ0FBZ0M7QUFDeEQsT0FBT0MsYUFBYSxNQUFNLGtEQUFrRDtBQUM1RSxPQUFPQyxlQUFlLE1BQU0sNkJBQTZCO0FBQ3pELE9BQU9DLGFBQWEsTUFBTSxxQkFBcUI7QUFFL0MsZUFBZSxNQUFNQyxTQUFTLFNBQVNILGFBQWEsQ0FBQztFQUVuRDtBQUNGO0FBQ0E7RUFDRUksV0FBV0EsQ0FBRUMsT0FBTyxFQUFHO0lBRXJCQSxPQUFPLEdBQUdBLE9BQU8sSUFBSSxDQUFDLENBQUM7SUFDdkJBLE9BQU8sQ0FBQ0MsSUFBSSxHQUFHLFdBQVc7SUFDMUJELE9BQU8sQ0FBQ0UsSUFBSSxHQUFHLHNCQUFzQjtJQUNyQ0YsT0FBTyxDQUFDRyxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUM7O0lBRTVCLE1BQU1DLFFBQVEsR0FBRyxJQUFJWixLQUFLLENBQUVDLGFBQWEsRUFBRTtNQUFFWSxLQUFLLEVBQUVYLFdBQVcsQ0FBQ1k7SUFBNkIsQ0FBRSxDQUFDO0lBRWhHLEtBQUssQ0FBRUYsUUFBUSxFQUFFSixPQUFRLENBQUM7RUFDNUI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFTyxhQUFhQSxDQUFFQyxXQUFXLEVBQUc7SUFFM0IsTUFBTUMsU0FBUyxHQUFHWixhQUFhLENBQUNhLFlBQVksQ0FBRUYsV0FBWSxDQUFDOztJQUUzRDtJQUNBLE1BQU1HLElBQUksR0FBR0YsU0FBUyxDQUFDRSxJQUFJO0lBQzNCLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRCxJQUFJLENBQUNFLE1BQU0sR0FBRyxDQUFDLEVBQUVELENBQUMsSUFBSSxDQUFDLEVBQUc7TUFDN0MsTUFBTUUsT0FBTyxHQUFHLENBQUVILElBQUksQ0FBRUMsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRUMsQ0FBQyxHQUFHLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUVDLENBQUMsR0FBRyxDQUFDLENBQUUsSUFBSyxDQUFDO01BQ2pFRCxJQUFJLENBQUVDLENBQUMsQ0FBRSxHQUFHRSxPQUFPO01BQ25CSCxJQUFJLENBQUVDLENBQUMsR0FBRyxDQUFDLENBQUUsR0FBR0UsT0FBTztNQUN2QkgsSUFBSSxDQUFFQyxDQUFDLEdBQUcsQ0FBQyxDQUFFLEdBQUdFLE9BQU87SUFDekI7SUFFQSxPQUFPakIsYUFBYSxDQUFDa0IseUJBQXlCLENBQUVOLFNBQVUsQ0FBQztFQUM3RDtBQUNGO0FBRUFiLGVBQWUsQ0FBQ29CLFFBQVEsQ0FBRSxXQUFXLEVBQUVsQixTQUFVLENBQUMifQ==