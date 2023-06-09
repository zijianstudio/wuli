// Copyright 2013-2022, University of Colorado Boulder

/**
 * Color scheme for relating concentration to color.
 * The scheme also defines the concentration range for the solute, where maxConcentration
 * is synonymous with 'saturated'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Color } from '../../../../scenery/js/imports.js';
import beersLawLab from '../../beersLawLab.js';
export default class SoluteColorScheme {
  constructor(minConcentration,
  // mol/L
  minColor, midConcentration,
  // mol/L
  midColor, maxConcentration,
  // mol/L (saturation point)
  maxColor) {
    this.minConcentration = minConcentration;
    this.minColor = minColor;
    this.midConcentration = midConcentration;
    this.midColor = midColor;
    this.maxConcentration = maxConcentration;
    this.maxColor = maxColor;
  }

  /**
   * Converts a concentration value (in mol/L) to a Color, using a linear interpolation of RGB colors.
   */
  concentrationToColor(concentration) {
    if (concentration >= this.maxConcentration) {
      return this.maxColor;
    } else if (concentration <= this.minConcentration) {
      return this.minColor;
    } else if (concentration <= this.midConcentration) {
      return Color.interpolateRGBA(this.minColor, this.midColor, (concentration - this.minConcentration) / (this.midConcentration - this.minConcentration));
    } else {
      return Color.interpolateRGBA(this.midColor, this.maxColor, (concentration - this.midConcentration) / (this.maxConcentration - this.midConcentration));
    }
  }
}
beersLawLab.register('SoluteColorScheme', SoluteColorScheme);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb2xvciIsImJlZXJzTGF3TGFiIiwiU29sdXRlQ29sb3JTY2hlbWUiLCJjb25zdHJ1Y3RvciIsIm1pbkNvbmNlbnRyYXRpb24iLCJtaW5Db2xvciIsIm1pZENvbmNlbnRyYXRpb24iLCJtaWRDb2xvciIsIm1heENvbmNlbnRyYXRpb24iLCJtYXhDb2xvciIsImNvbmNlbnRyYXRpb25Ub0NvbG9yIiwiY29uY2VudHJhdGlvbiIsImludGVycG9sYXRlUkdCQSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU29sdXRlQ29sb3JTY2hlbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29sb3Igc2NoZW1lIGZvciByZWxhdGluZyBjb25jZW50cmF0aW9uIHRvIGNvbG9yLlxyXG4gKiBUaGUgc2NoZW1lIGFsc28gZGVmaW5lcyB0aGUgY29uY2VudHJhdGlvbiByYW5nZSBmb3IgdGhlIHNvbHV0ZSwgd2hlcmUgbWF4Q29uY2VudHJhdGlvblxyXG4gKiBpcyBzeW5vbnltb3VzIHdpdGggJ3NhdHVyYXRlZCcuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgYmVlcnNMYXdMYWIgZnJvbSAnLi4vLi4vYmVlcnNMYXdMYWIuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU29sdXRlQ29sb3JTY2hlbWUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgbWluQ29uY2VudHJhdGlvbjogbnVtYmVyLCAvLyBtb2wvTFxyXG4gICAgcHVibGljIHJlYWRvbmx5IG1pbkNvbG9yOiBDb2xvcixcclxuICAgIHB1YmxpYyByZWFkb25seSBtaWRDb25jZW50cmF0aW9uOiBudW1iZXIsIC8vIG1vbC9MXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgbWlkQ29sb3I6IENvbG9yLFxyXG4gICAgcHVibGljIHJlYWRvbmx5IG1heENvbmNlbnRyYXRpb246IG51bWJlciwgLy8gbW9sL0wgKHNhdHVyYXRpb24gcG9pbnQpXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgbWF4Q29sb3I6IENvbG9yXHJcbiAgKSB7fVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0cyBhIGNvbmNlbnRyYXRpb24gdmFsdWUgKGluIG1vbC9MKSB0byBhIENvbG9yLCB1c2luZyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIG9mIFJHQiBjb2xvcnMuXHJcbiAgICovXHJcbiAgcHVibGljIGNvbmNlbnRyYXRpb25Ub0NvbG9yKCBjb25jZW50cmF0aW9uOiBudW1iZXIgKTogQ29sb3Ige1xyXG4gICAgaWYgKCBjb25jZW50cmF0aW9uID49IHRoaXMubWF4Q29uY2VudHJhdGlvbiApIHtcclxuICAgICAgcmV0dXJuIHRoaXMubWF4Q29sb3I7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggY29uY2VudHJhdGlvbiA8PSB0aGlzLm1pbkNvbmNlbnRyYXRpb24gKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm1pbkNvbG9yO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGNvbmNlbnRyYXRpb24gPD0gdGhpcy5taWRDb25jZW50cmF0aW9uICkge1xyXG4gICAgICByZXR1cm4gQ29sb3IuaW50ZXJwb2xhdGVSR0JBKCB0aGlzLm1pbkNvbG9yLCB0aGlzLm1pZENvbG9yLFxyXG4gICAgICAgICggY29uY2VudHJhdGlvbiAtIHRoaXMubWluQ29uY2VudHJhdGlvbiApIC8gKCB0aGlzLm1pZENvbmNlbnRyYXRpb24gLSB0aGlzLm1pbkNvbmNlbnRyYXRpb24gKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBDb2xvci5pbnRlcnBvbGF0ZVJHQkEoIHRoaXMubWlkQ29sb3IsIHRoaXMubWF4Q29sb3IsXHJcbiAgICAgICAgKCBjb25jZW50cmF0aW9uIC0gdGhpcy5taWRDb25jZW50cmF0aW9uICkgLyAoIHRoaXMubWF4Q29uY2VudHJhdGlvbiAtIHRoaXMubWlkQ29uY2VudHJhdGlvbiApICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5iZWVyc0xhd0xhYi5yZWdpc3RlciggJ1NvbHV0ZUNvbG9yU2NoZW1lJywgU29sdXRlQ29sb3JTY2hlbWUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLEtBQUssUUFBUSxtQ0FBbUM7QUFDekQsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUU5QyxlQUFlLE1BQU1DLGlCQUFpQixDQUFDO0VBRTlCQyxXQUFXQSxDQUNBQyxnQkFBd0I7RUFBRTtFQUMxQkMsUUFBZSxFQUNmQyxnQkFBd0I7RUFBRTtFQUMxQkMsUUFBZSxFQUNmQyxnQkFBd0I7RUFBRTtFQUMxQkMsUUFBZSxFQUMvQjtJQUFBLEtBTmdCTCxnQkFBd0IsR0FBeEJBLGdCQUF3QjtJQUFBLEtBQ3hCQyxRQUFlLEdBQWZBLFFBQWU7SUFBQSxLQUNmQyxnQkFBd0IsR0FBeEJBLGdCQUF3QjtJQUFBLEtBQ3hCQyxRQUFlLEdBQWZBLFFBQWU7SUFBQSxLQUNmQyxnQkFBd0IsR0FBeEJBLGdCQUF3QjtJQUFBLEtBQ3hCQyxRQUFlLEdBQWZBLFFBQWU7RUFDOUI7O0VBRUg7QUFDRjtBQUNBO0VBQ1NDLG9CQUFvQkEsQ0FBRUMsYUFBcUIsRUFBVTtJQUMxRCxJQUFLQSxhQUFhLElBQUksSUFBSSxDQUFDSCxnQkFBZ0IsRUFBRztNQUM1QyxPQUFPLElBQUksQ0FBQ0MsUUFBUTtJQUN0QixDQUFDLE1BQ0ksSUFBS0UsYUFBYSxJQUFJLElBQUksQ0FBQ1AsZ0JBQWdCLEVBQUc7TUFDakQsT0FBTyxJQUFJLENBQUNDLFFBQVE7SUFDdEIsQ0FBQyxNQUNJLElBQUtNLGFBQWEsSUFBSSxJQUFJLENBQUNMLGdCQUFnQixFQUFHO01BQ2pELE9BQU9OLEtBQUssQ0FBQ1ksZUFBZSxDQUFFLElBQUksQ0FBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQ0UsUUFBUSxFQUN4RCxDQUFFSSxhQUFhLEdBQUcsSUFBSSxDQUFDUCxnQkFBZ0IsS0FBTyxJQUFJLENBQUNFLGdCQUFnQixHQUFHLElBQUksQ0FBQ0YsZ0JBQWdCLENBQUcsQ0FBQztJQUNuRyxDQUFDLE1BQ0k7TUFDSCxPQUFPSixLQUFLLENBQUNZLGVBQWUsQ0FBRSxJQUFJLENBQUNMLFFBQVEsRUFBRSxJQUFJLENBQUNFLFFBQVEsRUFDeEQsQ0FBRUUsYUFBYSxHQUFHLElBQUksQ0FBQ0wsZ0JBQWdCLEtBQU8sSUFBSSxDQUFDRSxnQkFBZ0IsR0FBRyxJQUFJLENBQUNGLGdCQUFnQixDQUFHLENBQUM7SUFDbkc7RUFDRjtBQUNGO0FBRUFMLFdBQVcsQ0FBQ1ksUUFBUSxDQUFFLG1CQUFtQixFQUFFWCxpQkFBa0IsQ0FBQyJ9