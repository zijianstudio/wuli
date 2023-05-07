// Copyright 2021-2022, University of Colorado Boulder

/**
 * GORuler is the model for a movable ruler, with option for orientation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sarah Chang (Swarthmore College)
 */

import geometricOptics from '../../../geometricOptics.js';
import GOTool from './GOTool.js';
class GORuler extends GOTool {
  // orientation of the ruler

  // length of the ruler, in cm

  // original (unscaled) length of the ruler, in cm

  constructor(providedOptions) {
    assert && assert(isFinite(providedOptions.length) && providedOptions.length > 0);
    super(providedOptions);
    this.orientation = providedOptions.orientation;
    this.length = providedOptions.length;
    this.nominalLength = providedOptions.length;
  }

  /**
   * Scales the length of the ruler based on zoomScale.
   */
  scaleLength(zoomScale) {
    assert && assert(isFinite(zoomScale) && zoomScale > 0);
    this.length = this.nominalLength / zoomScale;
  }
}
geometricOptics.register('GORuler', GORuler);
export { GORuler as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZW9tZXRyaWNPcHRpY3MiLCJHT1Rvb2wiLCJHT1J1bGVyIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJhc3NlcnQiLCJpc0Zpbml0ZSIsImxlbmd0aCIsIm9yaWVudGF0aW9uIiwibm9taW5hbExlbmd0aCIsInNjYWxlTGVuZ3RoIiwiem9vbVNjYWxlIiwicmVnaXN0ZXIiLCJkZWZhdWx0Il0sInNvdXJjZXMiOlsiR09SdWxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBHT1J1bGVyIGlzIHRoZSBtb2RlbCBmb3IgYSBtb3ZhYmxlIHJ1bGVyLCB3aXRoIG9wdGlvbiBmb3Igb3JpZW50YXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqIEBhdXRob3IgU2FyYWggQ2hhbmcgKFN3YXJ0aG1vcmUgQ29sbGVnZSlcclxuICovXHJcblxyXG5pbXBvcnQgZ2VvbWV0cmljT3B0aWNzIGZyb20gJy4uLy4uLy4uL2dlb21ldHJpY09wdGljcy5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBHT1Rvb2wsIHsgR09Ub29sT3B0aW9ucyB9IGZyb20gJy4vR09Ub29sLmpzJztcclxuXHJcbnR5cGUgUnVsZXJPcmllbnRhdGlvbiA9ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIG9yaWVudGF0aW9uOiBSdWxlck9yaWVudGF0aW9uO1xyXG4gIGxlbmd0aDogbnVtYmVyO1xyXG59O1xyXG5cclxudHlwZSBHT1J1bGVyT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPEdPVG9vbE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmNsYXNzIEdPUnVsZXIgZXh0ZW5kcyBHT1Rvb2wge1xyXG5cclxuICAvLyBvcmllbnRhdGlvbiBvZiB0aGUgcnVsZXJcclxuICBwdWJsaWMgcmVhZG9ubHkgb3JpZW50YXRpb246IFJ1bGVyT3JpZW50YXRpb247XHJcblxyXG4gIC8vIGxlbmd0aCBvZiB0aGUgcnVsZXIsIGluIGNtXHJcbiAgcHVibGljIGxlbmd0aDogbnVtYmVyO1xyXG5cclxuICAvLyBvcmlnaW5hbCAodW5zY2FsZWQpIGxlbmd0aCBvZiB0aGUgcnVsZXIsIGluIGNtXHJcbiAgcHJpdmF0ZSByZWFkb25seSBub21pbmFsTGVuZ3RoOiBudW1iZXI7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBHT1J1bGVyT3B0aW9ucyApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggcHJvdmlkZWRPcHRpb25zLmxlbmd0aCApICYmIHByb3ZpZGVkT3B0aW9ucy5sZW5ndGggPiAwICk7XHJcblxyXG4gICAgc3VwZXIoIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMub3JpZW50YXRpb24gPSBwcm92aWRlZE9wdGlvbnMub3JpZW50YXRpb247XHJcbiAgICB0aGlzLmxlbmd0aCA9IHByb3ZpZGVkT3B0aW9ucy5sZW5ndGg7XHJcbiAgICB0aGlzLm5vbWluYWxMZW5ndGggPSBwcm92aWRlZE9wdGlvbnMubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2NhbGVzIHRoZSBsZW5ndGggb2YgdGhlIHJ1bGVyIGJhc2VkIG9uIHpvb21TY2FsZS5cclxuICAgKi9cclxuICBwdWJsaWMgc2NhbGVMZW5ndGgoIHpvb21TY2FsZTogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHpvb21TY2FsZSApICYmIHpvb21TY2FsZSA+IDAgKTtcclxuICAgIHRoaXMubGVuZ3RoID0gdGhpcy5ub21pbmFsTGVuZ3RoIC8gem9vbVNjYWxlO1xyXG4gIH1cclxufVxyXG5cclxuZ2VvbWV0cmljT3B0aWNzLnJlZ2lzdGVyKCAnR09SdWxlcicsIEdPUnVsZXIgKTtcclxuZXhwb3J0IHsgR09SdWxlciBhcyBkZWZhdWx0IH07Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLDZCQUE2QjtBQUV6RCxPQUFPQyxNQUFNLE1BQXlCLGFBQWE7QUFXbkQsTUFBTUMsT0FBTyxTQUFTRCxNQUFNLENBQUM7RUFFM0I7O0VBR0E7O0VBR0E7O0VBR09FLFdBQVdBLENBQUVDLGVBQStCLEVBQUc7SUFFcERDLE1BQU0sSUFBSUEsTUFBTSxDQUFFQyxRQUFRLENBQUVGLGVBQWUsQ0FBQ0csTUFBTyxDQUFDLElBQUlILGVBQWUsQ0FBQ0csTUFBTSxHQUFHLENBQUUsQ0FBQztJQUVwRixLQUFLLENBQUVILGVBQWdCLENBQUM7SUFFeEIsSUFBSSxDQUFDSSxXQUFXLEdBQUdKLGVBQWUsQ0FBQ0ksV0FBVztJQUM5QyxJQUFJLENBQUNELE1BQU0sR0FBR0gsZUFBZSxDQUFDRyxNQUFNO0lBQ3BDLElBQUksQ0FBQ0UsYUFBYSxHQUFHTCxlQUFlLENBQUNHLE1BQU07RUFDN0M7O0VBRUE7QUFDRjtBQUNBO0VBQ1NHLFdBQVdBLENBQUVDLFNBQWlCLEVBQVM7SUFDNUNOLE1BQU0sSUFBSUEsTUFBTSxDQUFFQyxRQUFRLENBQUVLLFNBQVUsQ0FBQyxJQUFJQSxTQUFTLEdBQUcsQ0FBRSxDQUFDO0lBQzFELElBQUksQ0FBQ0osTUFBTSxHQUFHLElBQUksQ0FBQ0UsYUFBYSxHQUFHRSxTQUFTO0VBQzlDO0FBQ0Y7QUFFQVgsZUFBZSxDQUFDWSxRQUFRLENBQUUsU0FBUyxFQUFFVixPQUFRLENBQUM7QUFDOUMsU0FBU0EsT0FBTyxJQUFJVyxPQUFPIn0=