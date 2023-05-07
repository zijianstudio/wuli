// Copyright 2022, University of Colorado Boulder

/**
 * PlatesNode is a single plate for the E-field creation device.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import PolarityIndicator from './PolarityIndicator.js';
import MPColors from '../MPColors.js';
import moleculePolarity from '../../moleculePolarity.js';
import { Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Shape } from '../../../../kite/js/imports.js';
export default class PlateNode extends Node {
  constructor(polarity, providedOptions) {
    const options = optionize()({
      perspective: 'left',
      plateWidth: 50,
      plateHeight: 430,
      plateThickness: 5,
      platePerspectiveYOffset: 35
    }, providedOptions);

    // polarity indicator
    const polarityIndicatorNode = new PolarityIndicator(polarity);

    // constants
    const plateOptions = {
      fill: MPColors.PLATE,
      stroke: 'black'
    };

    // face of a positive plate, drawn in perspective, starting at upper-left and going clockwise
    const faceNode = new Path(new Shape().moveTo(0, options.platePerspectiveYOffset).lineTo(options.plateWidth, 0).lineTo(options.plateWidth, options.plateHeight).lineTo(0, options.platePerspectiveYOffset + (options.plateHeight - 2 * options.platePerspectiveYOffset)).close(), plateOptions);

    // side edge of a positive plate
    const edgeNode = new Rectangle(options.plateWidth, 0, options.plateThickness, options.plateHeight, plateOptions);
    const plateNode = new Node({
      children: [edgeNode, faceNode]
    });

    // The plate is drawn in perspective for positive polarity.
    // If the polarity is negative, reflect about the y axis.
    if (polarity === 'negative') {
      plateNode.setScaleMagnitude(-1, 1);
    }

    // Put the polarity indicator at the top center of the plate's face.
    polarityIndicatorNode.centerX = plateNode.centerX;
    polarityIndicatorNode.bottom = plateNode.top + options.platePerspectiveYOffset / 2;
    options.children = [polarityIndicatorNode, plateNode];
    super(options);
    this.plateHeight = options.plateHeight;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
moleculePolarity.register('PlateNode', PlateNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQb2xhcml0eUluZGljYXRvciIsIk1QQ29sb3JzIiwibW9sZWN1bGVQb2xhcml0eSIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwib3B0aW9uaXplIiwiU2hhcGUiLCJQbGF0ZU5vZGUiLCJjb25zdHJ1Y3RvciIsInBvbGFyaXR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInBlcnNwZWN0aXZlIiwicGxhdGVXaWR0aCIsInBsYXRlSGVpZ2h0IiwicGxhdGVUaGlja25lc3MiLCJwbGF0ZVBlcnNwZWN0aXZlWU9mZnNldCIsInBvbGFyaXR5SW5kaWNhdG9yTm9kZSIsInBsYXRlT3B0aW9ucyIsImZpbGwiLCJQTEFURSIsInN0cm9rZSIsImZhY2VOb2RlIiwibW92ZVRvIiwibGluZVRvIiwiY2xvc2UiLCJlZGdlTm9kZSIsInBsYXRlTm9kZSIsImNoaWxkcmVuIiwic2V0U2NhbGVNYWduaXR1ZGUiLCJjZW50ZXJYIiwiYm90dG9tIiwidG9wIiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGxhdGVOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQbGF0ZXNOb2RlIGlzIGEgc2luZ2xlIHBsYXRlIGZvciB0aGUgRS1maWVsZCBjcmVhdGlvbiBkZXZpY2UuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFBvbGFyaXR5SW5kaWNhdG9yIGZyb20gJy4vUG9sYXJpdHlJbmRpY2F0b3IuanMnO1xyXG5pbXBvcnQgTVBDb2xvcnMgZnJvbSAnLi4vTVBDb2xvcnMuanMnO1xyXG5pbXBvcnQgbW9sZWN1bGVQb2xhcml0eSBmcm9tICcuLi8uLi9tb2xlY3VsZVBvbGFyaXR5LmpzJztcclxuaW1wb3J0IHsgUG9sYXJpdHkgfSBmcm9tICcuLi9tb2RlbC9Qb2xhcml0eS5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcblxyXG50eXBlIFBlcnNwZWN0aXZlID0gJ2xlZnQnIHwgJ3JpZ2h0JztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgcGVyc3BlY3RpdmU/OiBQZXJzcGVjdGl2ZTtcclxuICBwbGF0ZVdpZHRoPzogbnVtYmVyO1xyXG4gIHBsYXRlSGVpZ2h0PzogbnVtYmVyO1xyXG4gIHBsYXRlVGhpY2tuZXNzPzogbnVtYmVyO1xyXG4gIHBsYXRlUGVyc3BlY3RpdmVZT2Zmc2V0PzogbnVtYmVyOyAvLyB5IGRpZmZlcmVuY2UgYmV0d2VlbiBmb3JlZ3JvdW5kIGFuZCBiYWNrZ3JvdW5kIGVkZ2VzIG9mIHRoZSBwbGF0ZVxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgUGxhdGVOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxhdGVOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBwbGF0ZUhlaWdodDogbnVtYmVyO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHBvbGFyaXR5OiBQb2xhcml0eSwgcHJvdmlkZWRPcHRpb25zPzogUGxhdGVOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFBsYXRlTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG4gICAgICBwZXJzcGVjdGl2ZTogJ2xlZnQnLFxyXG4gICAgICBwbGF0ZVdpZHRoOiA1MCxcclxuICAgICAgcGxhdGVIZWlnaHQ6IDQzMCxcclxuICAgICAgcGxhdGVUaGlja25lc3M6IDUsXHJcbiAgICAgIHBsYXRlUGVyc3BlY3RpdmVZT2Zmc2V0OiAzNVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gcG9sYXJpdHkgaW5kaWNhdG9yXHJcbiAgICBjb25zdCBwb2xhcml0eUluZGljYXRvck5vZGUgPSBuZXcgUG9sYXJpdHlJbmRpY2F0b3IoIHBvbGFyaXR5ICk7XHJcblxyXG4gICAgLy8gY29uc3RhbnRzXHJcbiAgICBjb25zdCBwbGF0ZU9wdGlvbnMgPSB7XHJcbiAgICAgIGZpbGw6IE1QQ29sb3JzLlBMQVRFLFxyXG4gICAgICBzdHJva2U6ICdibGFjaydcclxuICAgIH07XHJcblxyXG4gICAgLy8gZmFjZSBvZiBhIHBvc2l0aXZlIHBsYXRlLCBkcmF3biBpbiBwZXJzcGVjdGl2ZSwgc3RhcnRpbmcgYXQgdXBwZXItbGVmdCBhbmQgZ29pbmcgY2xvY2t3aXNlXHJcbiAgICBjb25zdCBmYWNlTm9kZSA9IG5ldyBQYXRoKCBuZXcgU2hhcGUoKVxyXG4gICAgICAgIC5tb3ZlVG8oIDAsIG9wdGlvbnMucGxhdGVQZXJzcGVjdGl2ZVlPZmZzZXQgKVxyXG4gICAgICAgIC5saW5lVG8oIG9wdGlvbnMucGxhdGVXaWR0aCwgMCApXHJcbiAgICAgICAgLmxpbmVUbyggb3B0aW9ucy5wbGF0ZVdpZHRoLCBvcHRpb25zLnBsYXRlSGVpZ2h0IClcclxuICAgICAgICAubGluZVRvKCAwLCBvcHRpb25zLnBsYXRlUGVyc3BlY3RpdmVZT2Zmc2V0ICsgKCBvcHRpb25zLnBsYXRlSGVpZ2h0IC0gMiAqIG9wdGlvbnMucGxhdGVQZXJzcGVjdGl2ZVlPZmZzZXQgKSApXHJcbiAgICAgICAgLmNsb3NlKCksXHJcbiAgICAgIHBsYXRlT3B0aW9uc1xyXG4gICAgKTtcclxuXHJcbiAgICAvLyBzaWRlIGVkZ2Ugb2YgYSBwb3NpdGl2ZSBwbGF0ZVxyXG4gICAgY29uc3QgZWRnZU5vZGUgPSBuZXcgUmVjdGFuZ2xlKCBvcHRpb25zLnBsYXRlV2lkdGgsIDAsIG9wdGlvbnMucGxhdGVUaGlja25lc3MsIG9wdGlvbnMucGxhdGVIZWlnaHQsIHBsYXRlT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHBsYXRlTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgZWRnZU5vZGUsXHJcbiAgICAgICAgZmFjZU5vZGVcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRoZSBwbGF0ZSBpcyBkcmF3biBpbiBwZXJzcGVjdGl2ZSBmb3IgcG9zaXRpdmUgcG9sYXJpdHkuXHJcbiAgICAvLyBJZiB0aGUgcG9sYXJpdHkgaXMgbmVnYXRpdmUsIHJlZmxlY3QgYWJvdXQgdGhlIHkgYXhpcy5cclxuICAgIGlmICggcG9sYXJpdHkgPT09ICduZWdhdGl2ZScgKSB7XHJcbiAgICAgIHBsYXRlTm9kZS5zZXRTY2FsZU1hZ25pdHVkZSggLTEsIDEgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQdXQgdGhlIHBvbGFyaXR5IGluZGljYXRvciBhdCB0aGUgdG9wIGNlbnRlciBvZiB0aGUgcGxhdGUncyBmYWNlLlxyXG4gICAgcG9sYXJpdHlJbmRpY2F0b3JOb2RlLmNlbnRlclggPSBwbGF0ZU5vZGUuY2VudGVyWDtcclxuICAgIHBvbGFyaXR5SW5kaWNhdG9yTm9kZS5ib3R0b20gPSBwbGF0ZU5vZGUudG9wICsgKCBvcHRpb25zLnBsYXRlUGVyc3BlY3RpdmVZT2Zmc2V0IC8gMiApO1xyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIHBvbGFyaXR5SW5kaWNhdG9yTm9kZSwgcGxhdGVOb2RlIF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnBsYXRlSGVpZ2h0ID0gb3B0aW9ucy5wbGF0ZUhlaWdodDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5tb2xlY3VsZVBvbGFyaXR5LnJlZ2lzdGVyKCAnUGxhdGVOb2RlJywgUGxhdGVOb2RlICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxpQkFBaUIsTUFBTSx3QkFBd0I7QUFDdEQsT0FBT0MsUUFBUSxNQUFNLGdCQUFnQjtBQUNyQyxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFFeEQsU0FBU0MsSUFBSSxFQUFlQyxJQUFJLEVBQUVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDdEYsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQUM3RCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBY3RELGVBQWUsTUFBTUMsU0FBUyxTQUFTTCxJQUFJLENBQUM7RUFJbkNNLFdBQVdBLENBQUVDLFFBQWtCLEVBQUVDLGVBQWtDLEVBQUc7SUFFM0UsTUFBTUMsT0FBTyxHQUFHTixTQUFTLENBQTZDLENBQUMsQ0FBRTtNQUN2RU8sV0FBVyxFQUFFLE1BQU07TUFDbkJDLFVBQVUsRUFBRSxFQUFFO01BQ2RDLFdBQVcsRUFBRSxHQUFHO01BQ2hCQyxjQUFjLEVBQUUsQ0FBQztNQUNqQkMsdUJBQXVCLEVBQUU7SUFDM0IsQ0FBQyxFQUFFTixlQUFnQixDQUFDOztJQUVwQjtJQUNBLE1BQU1PLHFCQUFxQixHQUFHLElBQUlsQixpQkFBaUIsQ0FBRVUsUUFBUyxDQUFDOztJQUUvRDtJQUNBLE1BQU1TLFlBQVksR0FBRztNQUNuQkMsSUFBSSxFQUFFbkIsUUFBUSxDQUFDb0IsS0FBSztNQUNwQkMsTUFBTSxFQUFFO0lBQ1YsQ0FBQzs7SUFFRDtJQUNBLE1BQU1DLFFBQVEsR0FBRyxJQUFJbkIsSUFBSSxDQUFFLElBQUlHLEtBQUssQ0FBQyxDQUFDLENBQ2pDaUIsTUFBTSxDQUFFLENBQUMsRUFBRVosT0FBTyxDQUFDSyx1QkFBd0IsQ0FBQyxDQUM1Q1EsTUFBTSxDQUFFYixPQUFPLENBQUNFLFVBQVUsRUFBRSxDQUFFLENBQUMsQ0FDL0JXLE1BQU0sQ0FBRWIsT0FBTyxDQUFDRSxVQUFVLEVBQUVGLE9BQU8sQ0FBQ0csV0FBWSxDQUFDLENBQ2pEVSxNQUFNLENBQUUsQ0FBQyxFQUFFYixPQUFPLENBQUNLLHVCQUF1QixJQUFLTCxPQUFPLENBQUNHLFdBQVcsR0FBRyxDQUFDLEdBQUdILE9BQU8sQ0FBQ0ssdUJBQXVCLENBQUcsQ0FBQyxDQUM1R1MsS0FBSyxDQUFDLENBQUMsRUFDVlAsWUFDRixDQUFDOztJQUVEO0lBQ0EsTUFBTVEsUUFBUSxHQUFHLElBQUl0QixTQUFTLENBQUVPLE9BQU8sQ0FBQ0UsVUFBVSxFQUFFLENBQUMsRUFBRUYsT0FBTyxDQUFDSSxjQUFjLEVBQUVKLE9BQU8sQ0FBQ0csV0FBVyxFQUFFSSxZQUFhLENBQUM7SUFFbEgsTUFBTVMsU0FBUyxHQUFHLElBQUl6QixJQUFJLENBQUU7TUFDMUIwQixRQUFRLEVBQUUsQ0FDUkYsUUFBUSxFQUNSSixRQUFRO0lBRVosQ0FBRSxDQUFDOztJQUVIO0lBQ0E7SUFDQSxJQUFLYixRQUFRLEtBQUssVUFBVSxFQUFHO01BQzdCa0IsU0FBUyxDQUFDRSxpQkFBaUIsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFFLENBQUM7SUFDdEM7O0lBRUE7SUFDQVoscUJBQXFCLENBQUNhLE9BQU8sR0FBR0gsU0FBUyxDQUFDRyxPQUFPO0lBQ2pEYixxQkFBcUIsQ0FBQ2MsTUFBTSxHQUFHSixTQUFTLENBQUNLLEdBQUcsR0FBS3JCLE9BQU8sQ0FBQ0ssdUJBQXVCLEdBQUcsQ0FBRztJQUV0RkwsT0FBTyxDQUFDaUIsUUFBUSxHQUFHLENBQUVYLHFCQUFxQixFQUFFVSxTQUFTLENBQUU7SUFFdkQsS0FBSyxDQUFFaEIsT0FBUSxDQUFDO0lBRWhCLElBQUksQ0FBQ0csV0FBVyxHQUFHSCxPQUFPLENBQUNHLFdBQVc7RUFDeEM7RUFFZ0JtQixPQUFPQSxDQUFBLEVBQVM7SUFDOUJDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLEtBQUssRUFBRSw4REFBK0QsQ0FBQztJQUN6RixLQUFLLENBQUNELE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQWhDLGdCQUFnQixDQUFDa0MsUUFBUSxDQUFFLFdBQVcsRUFBRTVCLFNBQVUsQ0FBQyJ9