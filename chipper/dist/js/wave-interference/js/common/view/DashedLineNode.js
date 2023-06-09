// Copyright 2018-2022, University of Colorado Boulder

/**
 * When the graph is selected, this dashed line is shown in the center of the WaveAreaNode and in the graph's center.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { LineStyles, Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Path } from '../../../../scenery/js/imports.js';
import waveInterference from '../../waveInterference.js';
import WaveInterferenceConstants from '../WaveInterferenceConstants.js';
class DashedLineNode extends Path {
  constructor(options) {
    const line = Shape.lineSegment(0, 0, WaveInterferenceConstants.WAVE_AREA_WIDTH, 0);
    const dashedShape = line.getDashedShape([16], 0);
    const strokedShape = dashedShape.getStrokedShape(new LineStyles({
      lineWidth: 4,
      lineCap: 'round'
    }));
    super(strokedShape, merge({
      fill: 'white',
      stroke: 'black',
      lineWidth: 1
    }, options));
  }
}
waveInterference.register('DashedLineNode', DashedLineNode);
export default DashedLineNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaW5lU3R5bGVzIiwiU2hhcGUiLCJtZXJnZSIsIlBhdGgiLCJ3YXZlSW50ZXJmZXJlbmNlIiwiV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cyIsIkRhc2hlZExpbmVOb2RlIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwibGluZSIsImxpbmVTZWdtZW50IiwiV0FWRV9BUkVBX1dJRFRIIiwiZGFzaGVkU2hhcGUiLCJnZXREYXNoZWRTaGFwZSIsInN0cm9rZWRTaGFwZSIsImdldFN0cm9rZWRTaGFwZSIsImxpbmVXaWR0aCIsImxpbmVDYXAiLCJmaWxsIiwic3Ryb2tlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEYXNoZWRMaW5lTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBXaGVuIHRoZSBncmFwaCBpcyBzZWxlY3RlZCwgdGhpcyBkYXNoZWQgbGluZSBpcyBzaG93biBpbiB0aGUgY2VudGVyIG9mIHRoZSBXYXZlQXJlYU5vZGUgYW5kIGluIHRoZSBncmFwaCdzIGNlbnRlci5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgeyBMaW5lU3R5bGVzLCBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBQYXRoLCBQYXRoT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB3YXZlSW50ZXJmZXJlbmNlIGZyb20gJy4uLy4uL3dhdmVJbnRlcmZlcmVuY2UuanMnO1xyXG5pbXBvcnQgV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cyBmcm9tICcuLi9XYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLmpzJztcclxuXHJcbmNsYXNzIERhc2hlZExpbmVOb2RlIGV4dGVuZHMgUGF0aCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9ucz86IFBhdGhPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IGxpbmUgPSBTaGFwZS5saW5lU2VnbWVudCggMCwgMCwgV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5XQVZFX0FSRUFfV0lEVEgsIDAgKTtcclxuICAgIGNvbnN0IGRhc2hlZFNoYXBlID0gbGluZS5nZXREYXNoZWRTaGFwZSggWyAxNiBdLCAwICk7XHJcbiAgICBjb25zdCBzdHJva2VkU2hhcGUgPSBkYXNoZWRTaGFwZS5nZXRTdHJva2VkU2hhcGUoIG5ldyBMaW5lU3R5bGVzKCB7XHJcbiAgICAgIGxpbmVXaWR0aDogNCxcclxuICAgICAgbGluZUNhcDogJ3JvdW5kJ1xyXG4gICAgfSApICk7XHJcblxyXG4gICAgc3VwZXIoIHN0cm9rZWRTaGFwZSwgbWVyZ2UoIHtcclxuICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBsaW5lV2lkdGg6IDFcclxuICAgIH0sIG9wdGlvbnMgKSApO1xyXG4gIH1cclxufVxyXG5cclxud2F2ZUludGVyZmVyZW5jZS5yZWdpc3RlciggJ0Rhc2hlZExpbmVOb2RlJywgRGFzaGVkTGluZU5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgRGFzaGVkTGluZU5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLFVBQVUsRUFBRUMsS0FBSyxRQUFRLGdDQUFnQztBQUNsRSxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLElBQUksUUFBcUIsbUNBQW1DO0FBQ3JFLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyx5QkFBeUIsTUFBTSxpQ0FBaUM7QUFFdkUsTUFBTUMsY0FBYyxTQUFTSCxJQUFJLENBQUM7RUFFekJJLFdBQVdBLENBQUVDLE9BQXFCLEVBQUc7SUFFMUMsTUFBTUMsSUFBSSxHQUFHUixLQUFLLENBQUNTLFdBQVcsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFTCx5QkFBeUIsQ0FBQ00sZUFBZSxFQUFFLENBQUUsQ0FBQztJQUNwRixNQUFNQyxXQUFXLEdBQUdILElBQUksQ0FBQ0ksY0FBYyxDQUFFLENBQUUsRUFBRSxDQUFFLEVBQUUsQ0FBRSxDQUFDO0lBQ3BELE1BQU1DLFlBQVksR0FBR0YsV0FBVyxDQUFDRyxlQUFlLENBQUUsSUFBSWYsVUFBVSxDQUFFO01BQ2hFZ0IsU0FBUyxFQUFFLENBQUM7TUFDWkMsT0FBTyxFQUFFO0lBQ1gsQ0FBRSxDQUFFLENBQUM7SUFFTCxLQUFLLENBQUVILFlBQVksRUFBRVosS0FBSyxDQUFFO01BQzFCZ0IsSUFBSSxFQUFFLE9BQU87TUFDYkMsTUFBTSxFQUFFLE9BQU87TUFDZkgsU0FBUyxFQUFFO0lBQ2IsQ0FBQyxFQUFFUixPQUFRLENBQUUsQ0FBQztFQUNoQjtBQUNGO0FBRUFKLGdCQUFnQixDQUFDZ0IsUUFBUSxDQUFFLGdCQUFnQixFQUFFZCxjQUFlLENBQUM7QUFDN0QsZUFBZUEsY0FBYyJ9