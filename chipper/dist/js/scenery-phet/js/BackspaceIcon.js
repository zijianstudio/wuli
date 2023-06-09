// Copyright 2014-2022, University of Colorado Boulder

/**
 * BackspaceIcon draws a backspace icon.
 * This was originally created for use on keypads, but may have other applications.
 *
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../dot/js/Dimension2.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { Path } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
export default class BackspaceIcon extends Path {
  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      size: new Dimension2(15, 10),
      // PathOptions
      stroke: 'black',
      lineWidth: 1,
      lineJoin: 'round',
      lineCap: 'square'
    }, providedOptions);
    const iconShape = new Shape();

    // the outline, tip points left, described clockwise from the tip
    const tipWidth = options.size.width / 3;
    iconShape.moveTo(0, tipWidth).lineTo(tipWidth, 0).lineTo(options.size.width, 0).lineTo(options.size.width, options.size.height).lineTo(tipWidth, options.size.height).close();

    // the x in the middle, multipliers determined empirically
    const left = 0.47 * options.size.width;
    const right = 0.73 * options.size.width;
    const top = 0.3 * options.size.height;
    const bottom = 0.7 * options.size.height;
    iconShape.moveTo(left, top).lineTo(right, bottom).moveTo(right, top).lineTo(left, bottom);
    super(iconShape, options);
  }
}
sceneryPhet.register('BackspaceIcon', BackspaceIcon);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiU2hhcGUiLCJvcHRpb25pemUiLCJQYXRoIiwic2NlbmVyeVBoZXQiLCJCYWNrc3BhY2VJY29uIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwic2l6ZSIsInN0cm9rZSIsImxpbmVXaWR0aCIsImxpbmVKb2luIiwibGluZUNhcCIsImljb25TaGFwZSIsInRpcFdpZHRoIiwid2lkdGgiLCJtb3ZlVG8iLCJsaW5lVG8iLCJoZWlnaHQiLCJjbG9zZSIsImxlZnQiLCJyaWdodCIsInRvcCIsImJvdHRvbSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmFja3NwYWNlSWNvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYWNrc3BhY2VJY29uIGRyYXdzIGEgYmFja3NwYWNlIGljb24uXHJcbiAqIFRoaXMgd2FzIG9yaWdpbmFsbHkgY3JlYXRlZCBmb3IgdXNlIG9uIGtleXBhZHMsIGJ1dCBtYXkgaGF2ZSBvdGhlciBhcHBsaWNhdGlvbnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgUGF0aCwgUGF0aE9wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHNpemU/OiBEaW1lbnNpb24yO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgQmFja3NwYWNlSWNvbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhdGhPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFja3NwYWNlSWNvbiBleHRlbmRzIFBhdGgge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IEJhY2tzcGFjZUljb25PcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8QmFja3NwYWNlSWNvbk9wdGlvbnMsIFNlbGZPcHRpb25zLCBQYXRoT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgc2l6ZTogbmV3IERpbWVuc2lvbjIoIDE1LCAxMCApLFxyXG5cclxuICAgICAgLy8gUGF0aE9wdGlvbnNcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgIGxpbmVKb2luOiAncm91bmQnLFxyXG4gICAgICBsaW5lQ2FwOiAnc3F1YXJlJ1xyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgaWNvblNoYXBlID0gbmV3IFNoYXBlKCk7XHJcblxyXG4gICAgLy8gdGhlIG91dGxpbmUsIHRpcCBwb2ludHMgbGVmdCwgZGVzY3JpYmVkIGNsb2Nrd2lzZSBmcm9tIHRoZSB0aXBcclxuICAgIGNvbnN0IHRpcFdpZHRoID0gb3B0aW9ucy5zaXplLndpZHRoIC8gMztcclxuICAgIGljb25TaGFwZS5tb3ZlVG8oIDAsIHRpcFdpZHRoIClcclxuICAgICAgLmxpbmVUbyggdGlwV2lkdGgsIDAgKVxyXG4gICAgICAubGluZVRvKCBvcHRpb25zLnNpemUud2lkdGgsIDAgKVxyXG4gICAgICAubGluZVRvKCBvcHRpb25zLnNpemUud2lkdGgsIG9wdGlvbnMuc2l6ZS5oZWlnaHQgKVxyXG4gICAgICAubGluZVRvKCB0aXBXaWR0aCwgb3B0aW9ucy5zaXplLmhlaWdodCApXHJcbiAgICAgIC5jbG9zZSgpO1xyXG5cclxuICAgIC8vIHRoZSB4IGluIHRoZSBtaWRkbGUsIG11bHRpcGxpZXJzIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgIGNvbnN0IGxlZnQgPSAwLjQ3ICogb3B0aW9ucy5zaXplLndpZHRoO1xyXG4gICAgY29uc3QgcmlnaHQgPSAwLjczICogb3B0aW9ucy5zaXplLndpZHRoO1xyXG4gICAgY29uc3QgdG9wID0gMC4zICogb3B0aW9ucy5zaXplLmhlaWdodDtcclxuICAgIGNvbnN0IGJvdHRvbSA9IDAuNyAqIG9wdGlvbnMuc2l6ZS5oZWlnaHQ7XHJcbiAgICBpY29uU2hhcGUubW92ZVRvKCBsZWZ0LCB0b3AgKVxyXG4gICAgICAubGluZVRvKCByaWdodCwgYm90dG9tIClcclxuICAgICAgLm1vdmVUbyggcmlnaHQsIHRvcCApXHJcbiAgICAgIC5saW5lVG8oIGxlZnQsIGJvdHRvbSApO1xyXG5cclxuICAgIHN1cGVyKCBpY29uU2hhcGUsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnQmFja3NwYWNlSWNvbicsIEJhY2tzcGFjZUljb24gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSw0QkFBNEI7QUFDbkQsU0FBU0MsS0FBSyxRQUFRLDBCQUEwQjtBQUNoRCxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELFNBQVNDLElBQUksUUFBcUIsNkJBQTZCO0FBQy9ELE9BQU9DLFdBQVcsTUFBTSxrQkFBa0I7QUFRMUMsZUFBZSxNQUFNQyxhQUFhLFNBQVNGLElBQUksQ0FBQztFQUV2Q0csV0FBV0EsQ0FBRUMsZUFBc0MsRUFBRztJQUUzRCxNQUFNQyxPQUFPLEdBQUdOLFNBQVMsQ0FBaUQsQ0FBQyxDQUFFO01BRTNFO01BQ0FPLElBQUksRUFBRSxJQUFJVCxVQUFVLENBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQztNQUU5QjtNQUNBVSxNQUFNLEVBQUUsT0FBTztNQUNmQyxTQUFTLEVBQUUsQ0FBQztNQUNaQyxRQUFRLEVBQUUsT0FBTztNQUNqQkMsT0FBTyxFQUFFO0lBQ1gsQ0FBQyxFQUFFTixlQUFnQixDQUFDO0lBRXBCLE1BQU1PLFNBQVMsR0FBRyxJQUFJYixLQUFLLENBQUMsQ0FBQzs7SUFFN0I7SUFDQSxNQUFNYyxRQUFRLEdBQUdQLE9BQU8sQ0FBQ0MsSUFBSSxDQUFDTyxLQUFLLEdBQUcsQ0FBQztJQUN2Q0YsU0FBUyxDQUFDRyxNQUFNLENBQUUsQ0FBQyxFQUFFRixRQUFTLENBQUMsQ0FDNUJHLE1BQU0sQ0FBRUgsUUFBUSxFQUFFLENBQUUsQ0FBQyxDQUNyQkcsTUFBTSxDQUFFVixPQUFPLENBQUNDLElBQUksQ0FBQ08sS0FBSyxFQUFFLENBQUUsQ0FBQyxDQUMvQkUsTUFBTSxDQUFFVixPQUFPLENBQUNDLElBQUksQ0FBQ08sS0FBSyxFQUFFUixPQUFPLENBQUNDLElBQUksQ0FBQ1UsTUFBTyxDQUFDLENBQ2pERCxNQUFNLENBQUVILFFBQVEsRUFBRVAsT0FBTyxDQUFDQyxJQUFJLENBQUNVLE1BQU8sQ0FBQyxDQUN2Q0MsS0FBSyxDQUFDLENBQUM7O0lBRVY7SUFDQSxNQUFNQyxJQUFJLEdBQUcsSUFBSSxHQUFHYixPQUFPLENBQUNDLElBQUksQ0FBQ08sS0FBSztJQUN0QyxNQUFNTSxLQUFLLEdBQUcsSUFBSSxHQUFHZCxPQUFPLENBQUNDLElBQUksQ0FBQ08sS0FBSztJQUN2QyxNQUFNTyxHQUFHLEdBQUcsR0FBRyxHQUFHZixPQUFPLENBQUNDLElBQUksQ0FBQ1UsTUFBTTtJQUNyQyxNQUFNSyxNQUFNLEdBQUcsR0FBRyxHQUFHaEIsT0FBTyxDQUFDQyxJQUFJLENBQUNVLE1BQU07SUFDeENMLFNBQVMsQ0FBQ0csTUFBTSxDQUFFSSxJQUFJLEVBQUVFLEdBQUksQ0FBQyxDQUMxQkwsTUFBTSxDQUFFSSxLQUFLLEVBQUVFLE1BQU8sQ0FBQyxDQUN2QlAsTUFBTSxDQUFFSyxLQUFLLEVBQUVDLEdBQUksQ0FBQyxDQUNwQkwsTUFBTSxDQUFFRyxJQUFJLEVBQUVHLE1BQU8sQ0FBQztJQUV6QixLQUFLLENBQUVWLFNBQVMsRUFBRU4sT0FBUSxDQUFDO0VBQzdCO0FBQ0Y7QUFFQUosV0FBVyxDQUFDcUIsUUFBUSxDQUFFLGVBQWUsRUFBRXBCLGFBQWMsQ0FBQyJ9