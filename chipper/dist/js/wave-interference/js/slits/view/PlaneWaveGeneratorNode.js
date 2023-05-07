// Copyright 2018-2022, University of Colorado Boulder
// @ts-nocheck
/**
 * Vertical cylinder with a button that produces the plane wave along the left edge of the wave area.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { Image, Node, Rectangle } from '../../../../scenery/js/imports.js';
import RoundStickyToggleButton from '../../../../sun/js/buttons/RoundStickyToggleButton.js';
import ToggleNode from '../../../../sun/js/ToggleNode.js';
import plane_wave_source_png from '../../../images/plane_wave_source_png.js';
import SceneToggleNode from '../../common/view/SceneToggleNode.js';
import WaveInterferenceText from '../../common/view/WaveInterferenceText.js';
import WaveInterferenceConstants from '../../common/WaveInterferenceConstants.js';
import waveInterference from '../../waveInterference.js';
class PlaneWaveGeneratorNode extends Node {
  constructor(model, waveAreaBounds, options) {
    super();
    const verticalCylinderImageNode = new Image(plane_wave_source_png, {
      scale: waveAreaBounds.height / (plane_wave_source_png.height - 52),
      rightCenter: waveAreaBounds.leftCenter.plusXY(2, 0)
    });
    const button = new SceneToggleNode(model, scene => new RoundStickyToggleButton(scene.button1PressedProperty, false, true, {
      scale: 1.2,
      baseColor: WaveInterferenceConstants.WAVE_GENERATOR_BUTTON_COLOR,
      radius: WaveInterferenceConstants.WAVE_GENERATOR_BUTTON_RADIUS,
      touchAreaDilation: WaveInterferenceConstants.WAVE_GENERATOR_BUTTON_TOUCH_AREA_DILATION
    }), {
      center: verticalCylinderImageNode.center
    });
    assert && assert(!options || !options.children, 'children would be overwritten in PlaneWaveGeneratorNode');
    options = merge({
      children: [verticalCylinderImageNode, button]
    }, options);
    this.mutate(options);

    // Show descriptive text label
    this.addChild(new SceneToggleNode(model, scene => {
      const textNode = new WaveInterferenceText(scene.planeWaveGeneratorNodeText, {
        rotation: -Math.PI / 2,
        // About the same amount of space between the button and the text as between the text and the bottom
        maxWidth: 180
      });
      const backgroundNode = Rectangle.bounds(textNode.bounds.dilated(4), {
        fill: 'white',
        opacity: 0.2
      });
      return new Node({
        children: [backgroundNode, textNode]
      });
    }, {
      centerX: this.centerX,
      top: verticalCylinderImageNode.top + 42,
      alignChildren: ToggleNode.BOTTOM
    }));
  }
}
waveInterference.register('PlaneWaveGeneratorNode', PlaneWaveGeneratorNode);
export default PlaneWaveGeneratorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkltYWdlIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlJvdW5kU3RpY2t5VG9nZ2xlQnV0dG9uIiwiVG9nZ2xlTm9kZSIsInBsYW5lX3dhdmVfc291cmNlX3BuZyIsIlNjZW5lVG9nZ2xlTm9kZSIsIldhdmVJbnRlcmZlcmVuY2VUZXh0IiwiV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cyIsIndhdmVJbnRlcmZlcmVuY2UiLCJQbGFuZVdhdmVHZW5lcmF0b3JOb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsIndhdmVBcmVhQm91bmRzIiwib3B0aW9ucyIsInZlcnRpY2FsQ3lsaW5kZXJJbWFnZU5vZGUiLCJzY2FsZSIsImhlaWdodCIsInJpZ2h0Q2VudGVyIiwibGVmdENlbnRlciIsInBsdXNYWSIsImJ1dHRvbiIsInNjZW5lIiwiYnV0dG9uMVByZXNzZWRQcm9wZXJ0eSIsImJhc2VDb2xvciIsIldBVkVfR0VORVJBVE9SX0JVVFRPTl9DT0xPUiIsInJhZGl1cyIsIldBVkVfR0VORVJBVE9SX0JVVFRPTl9SQURJVVMiLCJ0b3VjaEFyZWFEaWxhdGlvbiIsIldBVkVfR0VORVJBVE9SX0JVVFRPTl9UT1VDSF9BUkVBX0RJTEFUSU9OIiwiY2VudGVyIiwiYXNzZXJ0IiwiY2hpbGRyZW4iLCJtdXRhdGUiLCJhZGRDaGlsZCIsInRleHROb2RlIiwicGxhbmVXYXZlR2VuZXJhdG9yTm9kZVRleHQiLCJyb3RhdGlvbiIsIk1hdGgiLCJQSSIsIm1heFdpZHRoIiwiYmFja2dyb3VuZE5vZGUiLCJib3VuZHMiLCJkaWxhdGVkIiwiZmlsbCIsIm9wYWNpdHkiLCJjZW50ZXJYIiwidG9wIiwiYWxpZ25DaGlsZHJlbiIsIkJPVFRPTSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGxhbmVXYXZlR2VuZXJhdG9yTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuLy8gQHRzLW5vY2hlY2tcclxuLyoqXHJcbiAqIFZlcnRpY2FsIGN5bGluZGVyIHdpdGggYSBidXR0b24gdGhhdCBwcm9kdWNlcyB0aGUgcGxhbmUgd2F2ZSBhbG9uZyB0aGUgbGVmdCBlZGdlIG9mIHRoZSB3YXZlIGFyZWEuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IEltYWdlLCBOb2RlLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUm91bmRTdGlja3lUb2dnbGVCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUm91bmRTdGlja3lUb2dnbGVCdXR0b24uanMnO1xyXG5pbXBvcnQgVG9nZ2xlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvVG9nZ2xlTm9kZS5qcyc7XHJcbmltcG9ydCBwbGFuZV93YXZlX3NvdXJjZV9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3BsYW5lX3dhdmVfc291cmNlX3BuZy5qcyc7XHJcbmltcG9ydCBTY2VuZVRvZ2dsZU5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU2NlbmVUb2dnbGVOb2RlLmpzJztcclxuaW1wb3J0IFdhdmVJbnRlcmZlcmVuY2VUZXh0IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1dhdmVJbnRlcmZlcmVuY2VUZXh0LmpzJztcclxuaW1wb3J0IFdhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL1dhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgd2F2ZUludGVyZmVyZW5jZSBmcm9tICcuLi8uLi93YXZlSW50ZXJmZXJlbmNlLmpzJztcclxuXHJcbmNsYXNzIFBsYW5lV2F2ZUdlbmVyYXRvck5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbCwgd2F2ZUFyZWFCb3VuZHMsIG9wdGlvbnMgKSB7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgY29uc3QgdmVydGljYWxDeWxpbmRlckltYWdlTm9kZSA9IG5ldyBJbWFnZSggcGxhbmVfd2F2ZV9zb3VyY2VfcG5nLCB7XHJcbiAgICAgIHNjYWxlOiB3YXZlQXJlYUJvdW5kcy5oZWlnaHQgLyAoIHBsYW5lX3dhdmVfc291cmNlX3BuZy5oZWlnaHQgLSA1MiApLFxyXG4gICAgICByaWdodENlbnRlcjogd2F2ZUFyZWFCb3VuZHMubGVmdENlbnRlci5wbHVzWFkoIDIsIDAgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGJ1dHRvbiA9IG5ldyBTY2VuZVRvZ2dsZU5vZGUoXHJcbiAgICAgIG1vZGVsLFxyXG4gICAgICBzY2VuZSA9PiBuZXcgUm91bmRTdGlja3lUb2dnbGVCdXR0b24oIHNjZW5lLmJ1dHRvbjFQcmVzc2VkUHJvcGVydHksIGZhbHNlLCB0cnVlLCB7XHJcbiAgICAgICAgc2NhbGU6IDEuMixcclxuICAgICAgICBiYXNlQ29sb3I6IFdhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMuV0FWRV9HRU5FUkFUT1JfQlVUVE9OX0NPTE9SLFxyXG4gICAgICAgIHJhZGl1czogV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5XQVZFX0dFTkVSQVRPUl9CVVRUT05fUkFESVVTLFxyXG4gICAgICAgIHRvdWNoQXJlYURpbGF0aW9uOiBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLldBVkVfR0VORVJBVE9SX0JVVFRPTl9UT1VDSF9BUkVBX0RJTEFUSU9OXHJcbiAgICAgIH0gKSwge1xyXG4gICAgICAgIGNlbnRlcjogdmVydGljYWxDeWxpbmRlckltYWdlTm9kZS5jZW50ZXJcclxuICAgICAgfSApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zIHx8ICFvcHRpb25zLmNoaWxkcmVuLCAnY2hpbGRyZW4gd291bGQgYmUgb3ZlcndyaXR0ZW4gaW4gUGxhbmVXYXZlR2VuZXJhdG9yTm9kZScgKTtcclxuICAgIG9wdGlvbnMgPSBtZXJnZSggeyBjaGlsZHJlbjogWyB2ZXJ0aWNhbEN5bGluZGVySW1hZ2VOb2RlLCBidXR0b24gXSB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBTaG93IGRlc2NyaXB0aXZlIHRleHQgbGFiZWxcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBTY2VuZVRvZ2dsZU5vZGUoIG1vZGVsLCBzY2VuZSA9PiB7XHJcbiAgICAgIGNvbnN0IHRleHROb2RlID0gbmV3IFdhdmVJbnRlcmZlcmVuY2VUZXh0KCBzY2VuZS5wbGFuZVdhdmVHZW5lcmF0b3JOb2RlVGV4dCwge1xyXG4gICAgICAgIHJvdGF0aW9uOiAtTWF0aC5QSSAvIDIsXHJcblxyXG4gICAgICAgIC8vIEFib3V0IHRoZSBzYW1lIGFtb3VudCBvZiBzcGFjZSBiZXR3ZWVuIHRoZSBidXR0b24gYW5kIHRoZSB0ZXh0IGFzIGJldHdlZW4gdGhlIHRleHQgYW5kIHRoZSBib3R0b21cclxuICAgICAgICBtYXhXaWR0aDogMTgwXHJcbiAgICAgIH0gKTtcclxuICAgICAgY29uc3QgYmFja2dyb3VuZE5vZGUgPSBSZWN0YW5nbGUuYm91bmRzKCB0ZXh0Tm9kZS5ib3VuZHMuZGlsYXRlZCggNCApLCB7XHJcbiAgICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgICBvcGFjaXR5OiAwLjJcclxuICAgICAgfSApO1xyXG4gICAgICByZXR1cm4gbmV3IE5vZGUoIHtcclxuICAgICAgICBjaGlsZHJlbjogWyBiYWNrZ3JvdW5kTm9kZSwgdGV4dE5vZGUgXVxyXG4gICAgICB9ICk7XHJcbiAgICB9LCB7XHJcbiAgICAgIGNlbnRlclg6IHRoaXMuY2VudGVyWCxcclxuICAgICAgdG9wOiB2ZXJ0aWNhbEN5bGluZGVySW1hZ2VOb2RlLnRvcCArIDQyLFxyXG4gICAgICBhbGlnbkNoaWxkcmVuOiBUb2dnbGVOb2RlLkJPVFRPTVxyXG4gICAgfSApICk7XHJcbiAgfVxyXG59XHJcblxyXG53YXZlSW50ZXJmZXJlbmNlLnJlZ2lzdGVyKCAnUGxhbmVXYXZlR2VuZXJhdG9yTm9kZScsIFBsYW5lV2F2ZUdlbmVyYXRvck5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgUGxhbmVXYXZlR2VuZXJhdG9yTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDMUUsT0FBT0MsdUJBQXVCLE1BQU0sdURBQXVEO0FBQzNGLE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MscUJBQXFCLE1BQU0sMENBQTBDO0FBQzVFLE9BQU9DLGVBQWUsTUFBTSxzQ0FBc0M7QUFDbEUsT0FBT0Msb0JBQW9CLE1BQU0sMkNBQTJDO0FBQzVFLE9BQU9DLHlCQUF5QixNQUFNLDJDQUEyQztBQUNqRixPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFFeEQsTUFBTUMsc0JBQXNCLFNBQVNULElBQUksQ0FBQztFQUVqQ1UsV0FBV0EsQ0FBRUMsS0FBSyxFQUFFQyxjQUFjLEVBQUVDLE9BQU8sRUFBRztJQUNuRCxLQUFLLENBQUMsQ0FBQztJQUNQLE1BQU1DLHlCQUF5QixHQUFHLElBQUlmLEtBQUssQ0FBRUsscUJBQXFCLEVBQUU7TUFDbEVXLEtBQUssRUFBRUgsY0FBYyxDQUFDSSxNQUFNLElBQUtaLHFCQUFxQixDQUFDWSxNQUFNLEdBQUcsRUFBRSxDQUFFO01BQ3BFQyxXQUFXLEVBQUVMLGNBQWMsQ0FBQ00sVUFBVSxDQUFDQyxNQUFNLENBQUUsQ0FBQyxFQUFFLENBQUU7SUFDdEQsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsTUFBTSxHQUFHLElBQUlmLGVBQWUsQ0FDaENNLEtBQUssRUFDTFUsS0FBSyxJQUFJLElBQUluQix1QkFBdUIsQ0FBRW1CLEtBQUssQ0FBQ0Msc0JBQXNCLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtNQUMvRVAsS0FBSyxFQUFFLEdBQUc7TUFDVlEsU0FBUyxFQUFFaEIseUJBQXlCLENBQUNpQiwyQkFBMkI7TUFDaEVDLE1BQU0sRUFBRWxCLHlCQUF5QixDQUFDbUIsNEJBQTRCO01BQzlEQyxpQkFBaUIsRUFBRXBCLHlCQUF5QixDQUFDcUI7SUFDL0MsQ0FBRSxDQUFDLEVBQUU7TUFDSEMsTUFBTSxFQUFFZix5QkFBeUIsQ0FBQ2U7SUFDcEMsQ0FBRSxDQUFDO0lBRUxDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUNqQixPQUFPLElBQUksQ0FBQ0EsT0FBTyxDQUFDa0IsUUFBUSxFQUFFLHlEQUEwRCxDQUFDO0lBQzVHbEIsT0FBTyxHQUFHZixLQUFLLENBQUU7TUFBRWlDLFFBQVEsRUFBRSxDQUFFakIseUJBQXlCLEVBQUVNLE1BQU07SUFBRyxDQUFDLEVBQUVQLE9BQVEsQ0FBQztJQUUvRSxJQUFJLENBQUNtQixNQUFNLENBQUVuQixPQUFRLENBQUM7O0lBRXRCO0lBQ0EsSUFBSSxDQUFDb0IsUUFBUSxDQUFFLElBQUk1QixlQUFlLENBQUVNLEtBQUssRUFBRVUsS0FBSyxJQUFJO01BQ2xELE1BQU1hLFFBQVEsR0FBRyxJQUFJNUIsb0JBQW9CLENBQUVlLEtBQUssQ0FBQ2MsMEJBQTBCLEVBQUU7UUFDM0VDLFFBQVEsRUFBRSxDQUFDQyxJQUFJLENBQUNDLEVBQUUsR0FBRyxDQUFDO1FBRXRCO1FBQ0FDLFFBQVEsRUFBRTtNQUNaLENBQUUsQ0FBQztNQUNILE1BQU1DLGNBQWMsR0FBR3ZDLFNBQVMsQ0FBQ3dDLE1BQU0sQ0FBRVAsUUFBUSxDQUFDTyxNQUFNLENBQUNDLE9BQU8sQ0FBRSxDQUFFLENBQUMsRUFBRTtRQUNyRUMsSUFBSSxFQUFFLE9BQU87UUFDYkMsT0FBTyxFQUFFO01BQ1gsQ0FBRSxDQUFDO01BQ0gsT0FBTyxJQUFJNUMsSUFBSSxDQUFFO1FBQ2YrQixRQUFRLEVBQUUsQ0FBRVMsY0FBYyxFQUFFTixRQUFRO01BQ3RDLENBQUUsQ0FBQztJQUNMLENBQUMsRUFBRTtNQUNEVyxPQUFPLEVBQUUsSUFBSSxDQUFDQSxPQUFPO01BQ3JCQyxHQUFHLEVBQUVoQyx5QkFBeUIsQ0FBQ2dDLEdBQUcsR0FBRyxFQUFFO01BQ3ZDQyxhQUFhLEVBQUU1QyxVQUFVLENBQUM2QztJQUM1QixDQUFFLENBQUUsQ0FBQztFQUNQO0FBQ0Y7QUFFQXhDLGdCQUFnQixDQUFDeUMsUUFBUSxDQUFFLHdCQUF3QixFQUFFeEMsc0JBQXVCLENBQUM7QUFDN0UsZUFBZUEsc0JBQXNCIn0=