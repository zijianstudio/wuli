// Copyright 2015-2023, University of Colorado Boulder

/**
 * Radio button group for choosing between 1x monochromatic, 5x monochromatic or 1x white light.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Shape } from '../../../../kite/js/imports.js';
import { Image, Line, Node, Rectangle } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import laser_png from '../../../images/laser_png.js';
import bendingLight from '../../bendingLight.js';
import LightType from '../model/LightType.js';
class LaserTypeRadioButtonGroup extends RectangularRadioButtonGroup {
  /**
   * @param radioButtonAdapterProperty
   * @param [providedOptions]
   */
  constructor(radioButtonAdapterProperty, providedOptions) {
    const laserImageNode = new Image(laser_png, {
      scale: 0.6,
      clipArea: Shape.rectangle(100, 0, 44, 100)
    });
    const lineWidth = 37;
    const redLineAt = y => new Line(0, 0, lineWidth, 0, {
      stroke: 'red',
      lineWidth: 2,
      centerY: laserImageNode.centerY + y,
      left: laserImageNode.centerX
    });
    const dy = 6.25;
    const padding = 2; // vertical padding above the laser in the white light radio button
    const overallScale = 0.875;
    super(radioButtonAdapterProperty, [{
      value: LightType.SINGLE_COLOR,
      createNode: () => new Node({
        scale: overallScale,
        children: [redLineAt(0), laserImageNode]
      })
    }, {
      value: LightType.SINGLE_COLOR_5X,
      createNode: () => new Node({
        scale: overallScale,
        children: [redLineAt(0), redLineAt(-dy), redLineAt(-dy * 2), redLineAt(+dy), redLineAt(+dy * 2), laserImageNode]
      })
    }, {
      value: LightType.WHITE,
      createNode: () => new Node({
        scale: overallScale,
        children: [new Rectangle(60, -padding, 50, laserImageNode.height + padding * 2, {
          fill: '#261f21'
        }), new Line(0, 0, lineWidth, 0, {
          stroke: 'white',
          lineWidth: 2,
          centerY: laserImageNode.centerY,
          left: laserImageNode.centerX
        }), laserImageNode]
      })
    }], {
      orientation: 'horizontal',
      radioButtonOptions: {
        baseColor: 'white',
        buttonAppearanceStrategyOptions: {
          selectedStroke: '#3291b8',
          selectedLineWidth: 2.5
        }
      }
    });
    this.mutate(providedOptions);
  }
}
bendingLight.register('LaserTypeRadioButtonGroup', LaserTypeRadioButtonGroup);
export default LaserTypeRadioButtonGroup;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIkltYWdlIiwiTGluZSIsIk5vZGUiLCJSZWN0YW5nbGUiLCJSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAiLCJsYXNlcl9wbmciLCJiZW5kaW5nTGlnaHQiLCJMaWdodFR5cGUiLCJMYXNlclR5cGVSYWRpb0J1dHRvbkdyb3VwIiwiY29uc3RydWN0b3IiLCJyYWRpb0J1dHRvbkFkYXB0ZXJQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsImxhc2VySW1hZ2VOb2RlIiwic2NhbGUiLCJjbGlwQXJlYSIsInJlY3RhbmdsZSIsImxpbmVXaWR0aCIsInJlZExpbmVBdCIsInkiLCJzdHJva2UiLCJjZW50ZXJZIiwibGVmdCIsImNlbnRlclgiLCJkeSIsInBhZGRpbmciLCJvdmVyYWxsU2NhbGUiLCJ2YWx1ZSIsIlNJTkdMRV9DT0xPUiIsImNyZWF0ZU5vZGUiLCJjaGlsZHJlbiIsIlNJTkdMRV9DT0xPUl81WCIsIldISVRFIiwiaGVpZ2h0IiwiZmlsbCIsIm9yaWVudGF0aW9uIiwicmFkaW9CdXR0b25PcHRpb25zIiwiYmFzZUNvbG9yIiwiYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9ucyIsInNlbGVjdGVkU3Ryb2tlIiwic2VsZWN0ZWRMaW5lV2lkdGgiLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxhc2VyVHlwZVJhZGlvQnV0dG9uR3JvdXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmFkaW8gYnV0dG9uIGdyb3VwIGZvciBjaG9vc2luZyBiZXR3ZWVuIDF4IG1vbm9jaHJvbWF0aWMsIDV4IG1vbm9jaHJvbWF0aWMgb3IgMXggd2hpdGUgbGlnaHQuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB7IEltYWdlLCBMaW5lLCBOb2RlLCBOb2RlT3B0aW9ucywgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgbGFzZXJfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9sYXNlcl9wbmcuanMnO1xyXG5pbXBvcnQgYmVuZGluZ0xpZ2h0IGZyb20gJy4uLy4uL2JlbmRpbmdMaWdodC5qcyc7XHJcbmltcG9ydCBMaWdodFR5cGUgZnJvbSAnLi4vbW9kZWwvTGlnaHRUeXBlLmpzJztcclxuXHJcbmNsYXNzIExhc2VyVHlwZVJhZGlvQnV0dG9uR3JvdXAgZXh0ZW5kcyBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXA8TGlnaHRUeXBlPiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSByYWRpb0J1dHRvbkFkYXB0ZXJQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcmFkaW9CdXR0b25BZGFwdGVyUHJvcGVydHk6IFByb3BlcnR5PExpZ2h0VHlwZT4sIHByb3ZpZGVkT3B0aW9ucz86IE5vZGVPcHRpb25zICkge1xyXG4gICAgY29uc3QgbGFzZXJJbWFnZU5vZGUgPSBuZXcgSW1hZ2UoIGxhc2VyX3BuZywge1xyXG4gICAgICBzY2FsZTogMC42LFxyXG4gICAgICBjbGlwQXJlYTogU2hhcGUucmVjdGFuZ2xlKCAxMDAsIDAsIDQ0LCAxMDAgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGxpbmVXaWR0aCA9IDM3O1xyXG4gICAgY29uc3QgcmVkTGluZUF0ID0gKCB5OiBudW1iZXIgKSA9PiBuZXcgTGluZSggMCwgMCwgbGluZVdpZHRoLCAwLCB7XHJcbiAgICAgIHN0cm9rZTogJ3JlZCcsXHJcbiAgICAgIGxpbmVXaWR0aDogMixcclxuICAgICAgY2VudGVyWTogbGFzZXJJbWFnZU5vZGUuY2VudGVyWSArIHksXHJcbiAgICAgIGxlZnQ6IGxhc2VySW1hZ2VOb2RlLmNlbnRlclhcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBkeSA9IDYuMjU7XHJcbiAgICBjb25zdCBwYWRkaW5nID0gMjsvLyB2ZXJ0aWNhbCBwYWRkaW5nIGFib3ZlIHRoZSBsYXNlciBpbiB0aGUgd2hpdGUgbGlnaHQgcmFkaW8gYnV0dG9uXHJcbiAgICBjb25zdCBvdmVyYWxsU2NhbGUgPSAwLjg3NTtcclxuICAgIHN1cGVyKCByYWRpb0J1dHRvbkFkYXB0ZXJQcm9wZXJ0eSwgWyB7XHJcbiAgICAgIHZhbHVlOiBMaWdodFR5cGUuU0lOR0xFX0NPTE9SLFxyXG4gICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgTm9kZSgge1xyXG4gICAgICAgIHNjYWxlOiBvdmVyYWxsU2NhbGUsXHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgIHJlZExpbmVBdCggMCApLFxyXG4gICAgICAgICAgbGFzZXJJbWFnZU5vZGVcclxuICAgICAgICBdXHJcbiAgICAgIH0gKVxyXG4gICAgfSwge1xyXG4gICAgICB2YWx1ZTogTGlnaHRUeXBlLlNJTkdMRV9DT0xPUl81WCxcclxuICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IE5vZGUoIHtcclxuICAgICAgICBzY2FsZTogb3ZlcmFsbFNjYWxlLFxyXG4gICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICByZWRMaW5lQXQoIDAgKSxcclxuICAgICAgICAgIHJlZExpbmVBdCggLWR5ICksXHJcbiAgICAgICAgICByZWRMaW5lQXQoIC1keSAqIDIgKSxcclxuICAgICAgICAgIHJlZExpbmVBdCggK2R5ICksXHJcbiAgICAgICAgICByZWRMaW5lQXQoICtkeSAqIDIgKSxcclxuICAgICAgICAgIGxhc2VySW1hZ2VOb2RlXHJcbiAgICAgICAgXVxyXG4gICAgICB9IClcclxuICAgIH0sIHtcclxuICAgICAgdmFsdWU6IExpZ2h0VHlwZS5XSElURSxcclxuICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IE5vZGUoIHtcclxuICAgICAgICBzY2FsZTogb3ZlcmFsbFNjYWxlLFxyXG4gICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICBuZXcgUmVjdGFuZ2xlKCA2MCwgLXBhZGRpbmcsIDUwLCBsYXNlckltYWdlTm9kZS5oZWlnaHQgKyBwYWRkaW5nICogMiwgeyBmaWxsOiAnIzI2MWYyMScgfSApLFxyXG4gICAgICAgICAgbmV3IExpbmUoIDAsIDAsIGxpbmVXaWR0aCwgMCwge1xyXG4gICAgICAgICAgICBzdHJva2U6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgIGxpbmVXaWR0aDogMixcclxuICAgICAgICAgICAgY2VudGVyWTogbGFzZXJJbWFnZU5vZGUuY2VudGVyWSxcclxuICAgICAgICAgICAgbGVmdDogbGFzZXJJbWFnZU5vZGUuY2VudGVyWFxyXG4gICAgICAgICAgfSApLFxyXG4gICAgICAgICAgbGFzZXJJbWFnZU5vZGVcclxuICAgICAgICBdXHJcbiAgICAgIH0gKVxyXG4gICAgfSBdLCB7XHJcbiAgICAgIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcsXHJcbiAgICAgIHJhZGlvQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIGJhc2VDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zOiB7XHJcbiAgICAgICAgICBzZWxlY3RlZFN0cm9rZTogJyMzMjkxYjgnLFxyXG4gICAgICAgICAgc2VsZWN0ZWRMaW5lV2lkdGg6IDIuNVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5tdXRhdGUoIHByb3ZpZGVkT3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuYmVuZGluZ0xpZ2h0LnJlZ2lzdGVyKCAnTGFzZXJUeXBlUmFkaW9CdXR0b25Hcm91cCcsIExhc2VyVHlwZVJhZGlvQnV0dG9uR3JvdXAgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IExhc2VyVHlwZVJhZGlvQnV0dG9uR3JvdXA7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLFNBQVNBLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBZUMsU0FBUyxRQUFRLG1DQUFtQztBQUM3RixPQUFPQywyQkFBMkIsTUFBTSwyREFBMkQ7QUFDbkcsT0FBT0MsU0FBUyxNQUFNLDhCQUE4QjtBQUNwRCxPQUFPQyxZQUFZLE1BQU0sdUJBQXVCO0FBQ2hELE9BQU9DLFNBQVMsTUFBTSx1QkFBdUI7QUFFN0MsTUFBTUMseUJBQXlCLFNBQVNKLDJCQUEyQixDQUFZO0VBRTdFO0FBQ0Y7QUFDQTtBQUNBO0VBQ1NLLFdBQVdBLENBQUVDLDBCQUErQyxFQUFFQyxlQUE2QixFQUFHO0lBQ25HLE1BQU1DLGNBQWMsR0FBRyxJQUFJWixLQUFLLENBQUVLLFNBQVMsRUFBRTtNQUMzQ1EsS0FBSyxFQUFFLEdBQUc7TUFDVkMsUUFBUSxFQUFFZixLQUFLLENBQUNnQixTQUFTLENBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBSTtJQUM3QyxDQUFFLENBQUM7SUFFSCxNQUFNQyxTQUFTLEdBQUcsRUFBRTtJQUNwQixNQUFNQyxTQUFTLEdBQUtDLENBQVMsSUFBTSxJQUFJakIsSUFBSSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVlLFNBQVMsRUFBRSxDQUFDLEVBQUU7TUFDL0RHLE1BQU0sRUFBRSxLQUFLO01BQ2JILFNBQVMsRUFBRSxDQUFDO01BQ1pJLE9BQU8sRUFBRVIsY0FBYyxDQUFDUSxPQUFPLEdBQUdGLENBQUM7TUFDbkNHLElBQUksRUFBRVQsY0FBYyxDQUFDVTtJQUN2QixDQUFFLENBQUM7SUFFSCxNQUFNQyxFQUFFLEdBQUcsSUFBSTtJQUNmLE1BQU1DLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDbEIsTUFBTUMsWUFBWSxHQUFHLEtBQUs7SUFDMUIsS0FBSyxDQUFFZiwwQkFBMEIsRUFBRSxDQUFFO01BQ25DZ0IsS0FBSyxFQUFFbkIsU0FBUyxDQUFDb0IsWUFBWTtNQUM3QkMsVUFBVSxFQUFFQSxDQUFBLEtBQU0sSUFBSTFCLElBQUksQ0FBRTtRQUMxQlcsS0FBSyxFQUFFWSxZQUFZO1FBQ25CSSxRQUFRLEVBQUUsQ0FDUlosU0FBUyxDQUFFLENBQUUsQ0FBQyxFQUNkTCxjQUFjO01BRWxCLENBQUU7SUFDSixDQUFDLEVBQUU7TUFDRGMsS0FBSyxFQUFFbkIsU0FBUyxDQUFDdUIsZUFBZTtNQUNoQ0YsVUFBVSxFQUFFQSxDQUFBLEtBQU0sSUFBSTFCLElBQUksQ0FBRTtRQUMxQlcsS0FBSyxFQUFFWSxZQUFZO1FBQ25CSSxRQUFRLEVBQUUsQ0FDUlosU0FBUyxDQUFFLENBQUUsQ0FBQyxFQUNkQSxTQUFTLENBQUUsQ0FBQ00sRUFBRyxDQUFDLEVBQ2hCTixTQUFTLENBQUUsQ0FBQ00sRUFBRSxHQUFHLENBQUUsQ0FBQyxFQUNwQk4sU0FBUyxDQUFFLENBQUNNLEVBQUcsQ0FBQyxFQUNoQk4sU0FBUyxDQUFFLENBQUNNLEVBQUUsR0FBRyxDQUFFLENBQUMsRUFDcEJYLGNBQWM7TUFFbEIsQ0FBRTtJQUNKLENBQUMsRUFBRTtNQUNEYyxLQUFLLEVBQUVuQixTQUFTLENBQUN3QixLQUFLO01BQ3RCSCxVQUFVLEVBQUVBLENBQUEsS0FBTSxJQUFJMUIsSUFBSSxDQUFFO1FBQzFCVyxLQUFLLEVBQUVZLFlBQVk7UUFDbkJJLFFBQVEsRUFBRSxDQUNSLElBQUkxQixTQUFTLENBQUUsRUFBRSxFQUFFLENBQUNxQixPQUFPLEVBQUUsRUFBRSxFQUFFWixjQUFjLENBQUNvQixNQUFNLEdBQUdSLE9BQU8sR0FBRyxDQUFDLEVBQUU7VUFBRVMsSUFBSSxFQUFFO1FBQVUsQ0FBRSxDQUFDLEVBQzNGLElBQUloQyxJQUFJLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRWUsU0FBUyxFQUFFLENBQUMsRUFBRTtVQUM1QkcsTUFBTSxFQUFFLE9BQU87VUFDZkgsU0FBUyxFQUFFLENBQUM7VUFDWkksT0FBTyxFQUFFUixjQUFjLENBQUNRLE9BQU87VUFDL0JDLElBQUksRUFBRVQsY0FBYyxDQUFDVTtRQUN2QixDQUFFLENBQUMsRUFDSFYsY0FBYztNQUVsQixDQUFFO0lBQ0osQ0FBQyxDQUFFLEVBQUU7TUFDSHNCLFdBQVcsRUFBRSxZQUFZO01BQ3pCQyxrQkFBa0IsRUFBRTtRQUNsQkMsU0FBUyxFQUFFLE9BQU87UUFDbEJDLCtCQUErQixFQUFFO1VBQy9CQyxjQUFjLEVBQUUsU0FBUztVQUN6QkMsaUJBQWlCLEVBQUU7UUFDckI7TUFDRjtJQUNGLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ0MsTUFBTSxDQUFFN0IsZUFBZ0IsQ0FBQztFQUNoQztBQUNGO0FBRUFMLFlBQVksQ0FBQ21DLFFBQVEsQ0FBRSwyQkFBMkIsRUFBRWpDLHlCQUEwQixDQUFDO0FBRS9FLGVBQWVBLHlCQUF5QiJ9