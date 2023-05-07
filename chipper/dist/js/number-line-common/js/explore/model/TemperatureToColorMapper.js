// Copyright 2021, University of Colorado Boulder

/**
 * an object that implement the color mapping algorithms used in this sim
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import { Color } from '../../../../scenery/js/imports.js';
import numberLineCommon from '../../numberLineCommon.js';

// constants

// data for the red-yellow-blue (RdYlBu) color mapping algorithm
const RdYlBu_data = [[0.6470588235294118, 0.0, 0.14901960784313725], [0.84313725490196079, 0.18823529411764706, 0.15294117647058825], [0.95686274509803926, 0.42745098039215684, 0.2627450980392157], [0.99215686274509807, 0.68235294117647061, 0.38039215686274508], [0.99607843137254903, 0.8784313725490196, 0.56470588235294117], [1.0, 1.0, 0.74901960784313726], [0.8784313725490196, 0.95294117647058818, 0.97254901960784312], [0.6705882352941176, 0.85098039215686272, 0.9137254901960784], [0.45490196078431372, 0.67843137254901964, 0.81960784313725488], [0.27058823529411763, 0.45882352941176469, 0.70588235294117652], [0.19215686274509805, 0.21176470588235294, 0.58431372549019611]];
class TemperatureToColorMapper {
  /**
   * @param {Range} temperatureRange - the temperature range that will be mapped, units don't matter
   * @public
   */
  constructor(temperatureRange) {
    // @private
    this.temperatureRange = temperatureRange;
  }

  /**
   * Map a celsius temperature to a color value.  The temperature range and the color mapping algorithm must match
   * those used to create the maps used in the simulation for things to work out correctly.
   * @param {number} temperature
   * @returns {Color}
   * @public
   */
  mapTemperatureToColor(temperature) {
    // Calculate a normalized temperature value.
    const normalizedTemperature = this.temperatureRange.getNormalizedValue(temperature);

    // Clamp the value.  While it would be possible to create and use a linear function for out-of-bounds values, so far
    // this has not been necessary, so it doesn't seem worth it.  Add it if you need it.
    const clampedNormalizedTemperature = Utils.clamp(normalizedTemperature, 0, 1);

    // Return the mapped color.
    return this.redYellowBlueReverse(clampedNormalizedTemperature);
  }

  /**
   * Map a number to a color value based on the red-yellow-blue (RdYlBu) mapping used in Matplotlib.
   * @param {number} value - a number in the range 0 to 1
   * @returns {Color}
   * @private
   */
  redYellowBlue(value) {
    let red = 0;
    let green = 0;
    let blue = 0;
    const numberOfColors = RdYlBu_data.length;
    const scaledValue = value * (numberOfColors - 1);
    const lowerEntryIndex = Math.floor(scaledValue);
    const upperEntryIndex = Math.ceil(scaledValue);
    if (lowerEntryIndex === upperEntryIndex) {
      // The scaled value matches an entry precisely.
      const rgbValues = RdYlBu_data[lowerEntryIndex];
      red = rgbValues[0];
      green = rgbValues[1];
      blue = rgbValues[2];
    } else {
      // We need to interpolate between the closest RGB values.
      const lowerWeighting = 1 - scaledValue + lowerEntryIndex;
      const upperWeighting = 1 - lowerWeighting;
      const lowerRgbValues = RdYlBu_data[lowerEntryIndex];
      const upperRgbValues = RdYlBu_data[upperEntryIndex];
      red = lowerWeighting * lowerRgbValues[0] + upperWeighting * upperRgbValues[0];
      green = lowerWeighting * lowerRgbValues[1] + upperWeighting * upperRgbValues[1];
      blue = lowerWeighting * lowerRgbValues[2] + upperWeighting * upperRgbValues[2];
    }
    return new Color(Utils.roundSymmetric(red * 255), Utils.roundSymmetric(green * 255), Utils.roundSymmetric(blue * 255));
  }

  /**
   * Map a number to a color value based on the red-yellow-blue-reverse (RdYlBu_r) mapping used in Matplotlib.
   * @param {number} value - a number in the range 0 to 1
   * @returns {Color}
   * @private
   */
  redYellowBlueReverse(value) {
    return this.redYellowBlue(1 - value);
  }
}
numberLineCommon.register('TemperatureToColorMapper', TemperatureToColorMapper);
export default TemperatureToColorMapper;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIkNvbG9yIiwibnVtYmVyTGluZUNvbW1vbiIsIlJkWWxCdV9kYXRhIiwiVGVtcGVyYXR1cmVUb0NvbG9yTWFwcGVyIiwiY29uc3RydWN0b3IiLCJ0ZW1wZXJhdHVyZVJhbmdlIiwibWFwVGVtcGVyYXR1cmVUb0NvbG9yIiwidGVtcGVyYXR1cmUiLCJub3JtYWxpemVkVGVtcGVyYXR1cmUiLCJnZXROb3JtYWxpemVkVmFsdWUiLCJjbGFtcGVkTm9ybWFsaXplZFRlbXBlcmF0dXJlIiwiY2xhbXAiLCJyZWRZZWxsb3dCbHVlUmV2ZXJzZSIsInJlZFllbGxvd0JsdWUiLCJ2YWx1ZSIsInJlZCIsImdyZWVuIiwiYmx1ZSIsIm51bWJlck9mQ29sb3JzIiwibGVuZ3RoIiwic2NhbGVkVmFsdWUiLCJsb3dlckVudHJ5SW5kZXgiLCJNYXRoIiwiZmxvb3IiLCJ1cHBlckVudHJ5SW5kZXgiLCJjZWlsIiwicmdiVmFsdWVzIiwibG93ZXJXZWlnaHRpbmciLCJ1cHBlcldlaWdodGluZyIsImxvd2VyUmdiVmFsdWVzIiwidXBwZXJSZ2JWYWx1ZXMiLCJyb3VuZFN5bW1ldHJpYyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVGVtcGVyYXR1cmVUb0NvbG9yTWFwcGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBhbiBvYmplY3QgdGhhdCBpbXBsZW1lbnQgdGhlIGNvbG9yIG1hcHBpbmcgYWxnb3JpdGhtcyB1c2VkIGluIHRoaXMgc2ltXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG51bWJlckxpbmVDb21tb24gZnJvbSAnLi4vLi4vbnVtYmVyTGluZUNvbW1vbi5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuXHJcbi8vIGRhdGEgZm9yIHRoZSByZWQteWVsbG93LWJsdWUgKFJkWWxCdSkgY29sb3IgbWFwcGluZyBhbGdvcml0aG1cclxuY29uc3QgUmRZbEJ1X2RhdGEgPSBbXHJcbiAgWyAwLjY0NzA1ODgyMzUyOTQxMTgsIDAuMCwgMC4xNDkwMTk2MDc4NDMxMzcyNSBdLFxyXG4gIFsgMC44NDMxMzcyNTQ5MDE5NjA3OSwgMC4xODgyMzUyOTQxMTc2NDcwNiwgMC4xNTI5NDExNzY0NzA1ODgyNSBdLFxyXG4gIFsgMC45NTY4NjI3NDUwOTgwMzkyNiwgMC40Mjc0NTA5ODAzOTIxNTY4NCwgMC4yNjI3NDUwOTgwMzkyMTU3IF0sXHJcbiAgWyAwLjk5MjE1Njg2Mjc0NTA5ODA3LCAwLjY4MjM1Mjk0MTE3NjQ3MDYxLCAwLjM4MDM5MjE1Njg2Mjc0NTA4IF0sXHJcbiAgWyAwLjk5NjA3ODQzMTM3MjU0OTAzLCAwLjg3ODQzMTM3MjU0OTAxOTYsIDAuNTY0NzA1ODgyMzUyOTQxMTcgXSxcclxuICBbIDEuMCwgMS4wLCAwLjc0OTAxOTYwNzg0MzEzNzI2IF0sXHJcbiAgWyAwLjg3ODQzMTM3MjU0OTAxOTYsIDAuOTUyOTQxMTc2NDcwNTg4MTgsIDAuOTcyNTQ5MDE5NjA3ODQzMTIgXSxcclxuICBbIDAuNjcwNTg4MjM1Mjk0MTE3NiwgMC44NTA5ODAzOTIxNTY4NjI3MiwgMC45MTM3MjU0OTAxOTYwNzg0IF0sXHJcbiAgWyAwLjQ1NDkwMTk2MDc4NDMxMzcyLCAwLjY3ODQzMTM3MjU0OTAxOTY0LCAwLjgxOTYwNzg0MzEzNzI1NDg4IF0sXHJcbiAgWyAwLjI3MDU4ODIzNTI5NDExNzYzLCAwLjQ1ODgyMzUyOTQxMTc2NDY5LCAwLjcwNTg4MjM1Mjk0MTE3NjUyIF0sXHJcbiAgWyAwLjE5MjE1Njg2Mjc0NTA5ODA1LCAwLjIxMTc2NDcwNTg4MjM1Mjk0LCAwLjU4NDMxMzcyNTQ5MDE5NjExIF1cclxuXTtcclxuXHJcbmNsYXNzIFRlbXBlcmF0dXJlVG9Db2xvck1hcHBlciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHRlbXBlcmF0dXJlUmFuZ2UgLSB0aGUgdGVtcGVyYXR1cmUgcmFuZ2UgdGhhdCB3aWxsIGJlIG1hcHBlZCwgdW5pdHMgZG9uJ3QgbWF0dGVyXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0ZW1wZXJhdHVyZVJhbmdlICkge1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnRlbXBlcmF0dXJlUmFuZ2UgPSB0ZW1wZXJhdHVyZVJhbmdlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFwIGEgY2Vsc2l1cyB0ZW1wZXJhdHVyZSB0byBhIGNvbG9yIHZhbHVlLiAgVGhlIHRlbXBlcmF0dXJlIHJhbmdlIGFuZCB0aGUgY29sb3IgbWFwcGluZyBhbGdvcml0aG0gbXVzdCBtYXRjaFxyXG4gICAqIHRob3NlIHVzZWQgdG8gY3JlYXRlIHRoZSBtYXBzIHVzZWQgaW4gdGhlIHNpbXVsYXRpb24gZm9yIHRoaW5ncyB0byB3b3JrIG91dCBjb3JyZWN0bHkuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRlbXBlcmF0dXJlXHJcbiAgICogQHJldHVybnMge0NvbG9yfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBtYXBUZW1wZXJhdHVyZVRvQ29sb3IoIHRlbXBlcmF0dXJlICkge1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSBhIG5vcm1hbGl6ZWQgdGVtcGVyYXR1cmUgdmFsdWUuXHJcbiAgICBjb25zdCBub3JtYWxpemVkVGVtcGVyYXR1cmUgPSB0aGlzLnRlbXBlcmF0dXJlUmFuZ2UuZ2V0Tm9ybWFsaXplZFZhbHVlKCB0ZW1wZXJhdHVyZSApO1xyXG5cclxuICAgIC8vIENsYW1wIHRoZSB2YWx1ZS4gIFdoaWxlIGl0IHdvdWxkIGJlIHBvc3NpYmxlIHRvIGNyZWF0ZSBhbmQgdXNlIGEgbGluZWFyIGZ1bmN0aW9uIGZvciBvdXQtb2YtYm91bmRzIHZhbHVlcywgc28gZmFyXHJcbiAgICAvLyB0aGlzIGhhcyBub3QgYmVlbiBuZWNlc3NhcnksIHNvIGl0IGRvZXNuJ3Qgc2VlbSB3b3J0aCBpdC4gIEFkZCBpdCBpZiB5b3UgbmVlZCBpdC5cclxuICAgIGNvbnN0IGNsYW1wZWROb3JtYWxpemVkVGVtcGVyYXR1cmUgPSBVdGlscy5jbGFtcCggbm9ybWFsaXplZFRlbXBlcmF0dXJlLCAwLCAxICk7XHJcblxyXG4gICAgLy8gUmV0dXJuIHRoZSBtYXBwZWQgY29sb3IuXHJcbiAgICByZXR1cm4gdGhpcy5yZWRZZWxsb3dCbHVlUmV2ZXJzZSggY2xhbXBlZE5vcm1hbGl6ZWRUZW1wZXJhdHVyZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFwIGEgbnVtYmVyIHRvIGEgY29sb3IgdmFsdWUgYmFzZWQgb24gdGhlIHJlZC15ZWxsb3ctYmx1ZSAoUmRZbEJ1KSBtYXBwaW5nIHVzZWQgaW4gTWF0cGxvdGxpYi5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBhIG51bWJlciBpbiB0aGUgcmFuZ2UgMCB0byAxXHJcbiAgICogQHJldHVybnMge0NvbG9yfVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcmVkWWVsbG93Qmx1ZSggdmFsdWUgKSB7XHJcblxyXG4gICAgbGV0IHJlZCA9IDA7XHJcbiAgICBsZXQgZ3JlZW4gPSAwO1xyXG4gICAgbGV0IGJsdWUgPSAwO1xyXG5cclxuICAgIGNvbnN0IG51bWJlck9mQ29sb3JzID0gUmRZbEJ1X2RhdGEubGVuZ3RoO1xyXG4gICAgY29uc3Qgc2NhbGVkVmFsdWUgPSB2YWx1ZSAqICggbnVtYmVyT2ZDb2xvcnMgLSAxICk7XHJcbiAgICBjb25zdCBsb3dlckVudHJ5SW5kZXggPSBNYXRoLmZsb29yKCBzY2FsZWRWYWx1ZSApO1xyXG4gICAgY29uc3QgdXBwZXJFbnRyeUluZGV4ID0gTWF0aC5jZWlsKCBzY2FsZWRWYWx1ZSApO1xyXG4gICAgaWYgKCBsb3dlckVudHJ5SW5kZXggPT09IHVwcGVyRW50cnlJbmRleCApIHtcclxuXHJcbiAgICAgIC8vIFRoZSBzY2FsZWQgdmFsdWUgbWF0Y2hlcyBhbiBlbnRyeSBwcmVjaXNlbHkuXHJcbiAgICAgIGNvbnN0IHJnYlZhbHVlcyA9IFJkWWxCdV9kYXRhWyBsb3dlckVudHJ5SW5kZXggXTtcclxuICAgICAgcmVkID0gcmdiVmFsdWVzWyAwIF07XHJcbiAgICAgIGdyZWVuID0gcmdiVmFsdWVzWyAxIF07XHJcbiAgICAgIGJsdWUgPSByZ2JWYWx1ZXNbIDIgXTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gV2UgbmVlZCB0byBpbnRlcnBvbGF0ZSBiZXR3ZWVuIHRoZSBjbG9zZXN0IFJHQiB2YWx1ZXMuXHJcbiAgICAgIGNvbnN0IGxvd2VyV2VpZ2h0aW5nID0gMSAtIHNjYWxlZFZhbHVlICsgbG93ZXJFbnRyeUluZGV4O1xyXG4gICAgICBjb25zdCB1cHBlcldlaWdodGluZyA9IDEgLSBsb3dlcldlaWdodGluZztcclxuICAgICAgY29uc3QgbG93ZXJSZ2JWYWx1ZXMgPSBSZFlsQnVfZGF0YVsgbG93ZXJFbnRyeUluZGV4IF07XHJcbiAgICAgIGNvbnN0IHVwcGVyUmdiVmFsdWVzID0gUmRZbEJ1X2RhdGFbIHVwcGVyRW50cnlJbmRleCBdO1xyXG4gICAgICByZWQgPSBsb3dlcldlaWdodGluZyAqIGxvd2VyUmdiVmFsdWVzWyAwIF0gKyB1cHBlcldlaWdodGluZyAqIHVwcGVyUmdiVmFsdWVzWyAwIF07XHJcbiAgICAgIGdyZWVuID0gbG93ZXJXZWlnaHRpbmcgKiBsb3dlclJnYlZhbHVlc1sgMSBdICsgdXBwZXJXZWlnaHRpbmcgKiB1cHBlclJnYlZhbHVlc1sgMSBdO1xyXG4gICAgICBibHVlID0gbG93ZXJXZWlnaHRpbmcgKiBsb3dlclJnYlZhbHVlc1sgMiBdICsgdXBwZXJXZWlnaHRpbmcgKiB1cHBlclJnYlZhbHVlc1sgMiBdO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgQ29sb3IoXHJcbiAgICAgIFV0aWxzLnJvdW5kU3ltbWV0cmljKCByZWQgKiAyNTUgKSxcclxuICAgICAgVXRpbHMucm91bmRTeW1tZXRyaWMoIGdyZWVuICogMjU1ICksXHJcbiAgICAgIFV0aWxzLnJvdW5kU3ltbWV0cmljKCBibHVlICogMjU1IClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXAgYSBudW1iZXIgdG8gYSBjb2xvciB2YWx1ZSBiYXNlZCBvbiB0aGUgcmVkLXllbGxvdy1ibHVlLXJldmVyc2UgKFJkWWxCdV9yKSBtYXBwaW5nIHVzZWQgaW4gTWF0cGxvdGxpYi5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBhIG51bWJlciBpbiB0aGUgcmFuZ2UgMCB0byAxXHJcbiAgICogQHJldHVybnMge0NvbG9yfVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcmVkWWVsbG93Qmx1ZVJldmVyc2UoIHZhbHVlICkge1xyXG4gICAgcmV0dXJuIHRoaXMucmVkWWVsbG93Qmx1ZSggMSAtIHZhbHVlICk7XHJcbiAgfVxyXG59XHJcblxyXG5udW1iZXJMaW5lQ29tbW9uLnJlZ2lzdGVyKCAnVGVtcGVyYXR1cmVUb0NvbG9yTWFwcGVyJywgVGVtcGVyYXR1cmVUb0NvbG9yTWFwcGVyICk7XHJcbmV4cG9ydCBkZWZhdWx0IFRlbXBlcmF0dXJlVG9Db2xvck1hcHBlcjtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsU0FBU0MsS0FBSyxRQUFRLG1DQUFtQztBQUN6RCxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7O0FBRXhEOztBQUVBO0FBQ0EsTUFBTUMsV0FBVyxHQUFHLENBQ2xCLENBQUUsa0JBQWtCLEVBQUUsR0FBRyxFQUFFLG1CQUFtQixDQUFFLEVBQ2hELENBQUUsbUJB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