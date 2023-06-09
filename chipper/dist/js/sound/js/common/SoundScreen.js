// Copyright 2022, University of Colorado Boulder
/**
 * Screen for the sound application
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dimension2 from '../../../dot/js/Dimension2.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import SoundColors from '../common/SoundColors.js';
import sound from '../sound.js';
import Tandem from '../../../tandem/js/Tandem.js';
export default class SoundScreen extends Screen {
  constructor(title, createModel, createView, iconImage) {
    const options = {
      backgroundColorProperty: SoundColors.SCREEN_VIEW_BACKGROUND,
      name: title,
      homeScreenIcon: new ScreenIcon(iconImage, {
        size: new Dimension2(Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height),
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      // showPlaySoundControl: true,
      // audioEnabled: true,
      tandem: Tandem.OPT_OUT
    };
    super(createModel, createView, options);
  }
}
sound.register('SoundScreen', SoundScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiU2NyZWVuIiwiU2NyZWVuSWNvbiIsIlNvdW5kQ29sb3JzIiwic291bmQiLCJUYW5kZW0iLCJTb3VuZFNjcmVlbiIsImNvbnN0cnVjdG9yIiwidGl0bGUiLCJjcmVhdGVNb2RlbCIsImNyZWF0ZVZpZXciLCJpY29uSW1hZ2UiLCJvcHRpb25zIiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJTQ1JFRU5fVklFV19CQUNLR1JPVU5EIiwibmFtZSIsImhvbWVTY3JlZW5JY29uIiwic2l6ZSIsIk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFIiwid2lkdGgiLCJoZWlnaHQiLCJtYXhJY29uV2lkdGhQcm9wb3J0aW9uIiwibWF4SWNvbkhlaWdodFByb3BvcnRpb24iLCJ0YW5kZW0iLCJPUFRfT1VUIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTb3VuZFNjcmVlbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcbi8qKlxyXG4gKiBTY3JlZW4gZm9yIHRoZSBzb3VuZCBhcHBsaWNhdGlvblxyXG4gKlxyXG4gKiBAYXV0aG9yIFBpZXQgR29yaXMgKFVuaXZlcnNpdHkgb2YgTGV1dmVuKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFNjcmVlbiwgeyBTY3JlZW5PcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuSWNvbi5qcyc7XHJcbmltcG9ydCBTb3VuZENvbG9ycyBmcm9tICcuLi9jb21tb24vU291bmRDb2xvcnMuanMnO1xyXG5pbXBvcnQgc291bmQgZnJvbSAnLi4vc291bmQuanMnO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFNvdW5kTW9kZWwgZnJvbSAnLi9tb2RlbC9Tb3VuZE1vZGVsLmpzJztcclxuaW1wb3J0IFNvdW5kU2NyZWVuVmlldyBmcm9tICcuL3ZpZXcvU291bmRTY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IExpbmthYmxlUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9MaW5rYWJsZVByb3BlcnR5LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvdW5kU2NyZWVuPFQgZXh0ZW5kcyBTb3VuZE1vZGVsPiBleHRlbmRzIFNjcmVlbjxULCBTb3VuZFNjcmVlblZpZXc+IHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRpdGxlOiBMaW5rYWJsZVByb3BlcnR5PHN0cmluZz4sIGNyZWF0ZU1vZGVsOiAoKSA9PiBULCBjcmVhdGVWaWV3OiAoIG1vZGVsOiBUICkgPT4gU291bmRTY3JlZW5WaWV3LCBpY29uSW1hZ2U6IE5vZGUgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9uczogU2NyZWVuT3B0aW9ucyA9IHtcclxuICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IFNvdW5kQ29sb3JzLlNDUkVFTl9WSUVXX0JBQ0tHUk9VTkQsXHJcbiAgICAgIG5hbWU6IHRpdGxlLFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogbmV3IFNjcmVlbkljb24oIGljb25JbWFnZSwge1xyXG4gICAgICAgIHNpemU6IG5ldyBEaW1lbnNpb24yKCBTY3JlZW4uTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUud2lkdGgsIFNjcmVlbi5NSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRS5oZWlnaHQgKSxcclxuICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAxXHJcbiAgICAgIH0gKSxcclxuICAgICAgLy8gc2hvd1BsYXlTb3VuZENvbnRyb2w6IHRydWUsXHJcbiAgICAgIC8vIGF1ZGlvRW5hYmxlZDogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgY3JlYXRlTW9kZWwsXHJcbiAgICAgIGNyZWF0ZVZpZXcsXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5zb3VuZC5yZWdpc3RlciggJ1NvdW5kU2NyZWVuJywgU291bmRTY3JlZW4gKTsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSwrQkFBK0I7QUFDdEQsT0FBT0MsTUFBTSxNQUF5Qiw2QkFBNkI7QUFDbkUsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxPQUFPQyxXQUFXLE1BQU0sMEJBQTBCO0FBQ2xELE9BQU9DLEtBQUssTUFBTSxhQUFhO0FBSS9CLE9BQU9DLE1BQU0sTUFBTSw4QkFBOEI7QUFHakQsZUFBZSxNQUFNQyxXQUFXLFNBQStCTCxNQUFNLENBQXFCO0VBQ2pGTSxXQUFXQSxDQUFFQyxLQUErQixFQUFFQyxXQUFvQixFQUFFQyxVQUEyQyxFQUFFQyxTQUFlLEVBQUc7SUFFeEksTUFBTUMsT0FBc0IsR0FBRztNQUM3QkMsdUJBQXVCLEVBQUVWLFdBQVcsQ0FBQ1csc0JBQXNCO01BQzNEQyxJQUFJLEVBQUVQLEtBQUs7TUFDWFEsY0FBYyxFQUFFLElBQUlkLFVBQVUsQ0FBRVMsU0FBUyxFQUFFO1FBQ3pDTSxJQUFJLEVBQUUsSUFBSWpCLFVBQVUsQ0FBRUMsTUFBTSxDQUFDaUIsNkJBQTZCLENBQUNDLEtBQUssRUFBRWxCLE1BQU0sQ0FBQ2lCLDZCQUE2QixDQUFDRSxNQUFPLENBQUM7UUFDL0dDLHNCQUFzQixFQUFFLENBQUM7UUFDekJDLHVCQUF1QixFQUFFO01BQzNCLENBQUUsQ0FBQztNQUNIO01BQ0E7TUFDQUMsTUFBTSxFQUFFbEIsTUFBTSxDQUFDbUI7SUFDakIsQ0FBQztJQUVELEtBQUssQ0FDSGYsV0FBVyxFQUNYQyxVQUFVLEVBQ1ZFLE9BQ0YsQ0FBQztFQUNIO0FBQ0Y7QUFFQVIsS0FBSyxDQUFDcUIsUUFBUSxDQUFFLGFBQWEsRUFBRW5CLFdBQVksQ0FBQyJ9