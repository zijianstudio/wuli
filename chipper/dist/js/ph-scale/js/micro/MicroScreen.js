// Copyright 2013-2023, University of Colorado Boulder

/**
 * The 'Micro' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../phet-core/js/optionize.js';
import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import { Image } from '../../../scenery/js/imports.js';
import microHomeScreenIcon_png from '../../images/microHomeScreenIcon_png.js';
import microNavbarIcon_png from '../../images/microNavbarIcon_png.js';
import PHScaleColors from '../common/PHScaleColors.js';
import phScale from '../phScale.js';
import PhScaleStrings from '../PhScaleStrings.js';
import MicroModel from './model/MicroModel.js';
import MicroScreenView from './view/MicroScreenView.js';
import MicroKeyboardHelpContent from './view/MicroKeyboardHelpContent.js';
export default class MicroScreen extends Screen {
  constructor(providedOptions) {
    const options = optionize()({
      // ScreenOptions
      name: PhScaleStrings.screen.microStringProperty,
      backgroundColorProperty: new Property(PHScaleColors.SCREEN_BACKGROUND),
      homeScreenIcon: new ScreenIcon(new Image(microHomeScreenIcon_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      navigationBarIcon: new ScreenIcon(new Image(microNavbarIcon_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      //TODO https://github.com/phetsims/ph-scale/issues/249 restore when work on alternative input resume
      createKeyboardHelpNode: () => new MicroKeyboardHelpContent()
    }, providedOptions);
    super(() => new MicroModel({
      tandem: options.tandem.createTandem('model')
    }), model => new MicroScreenView(model, ModelViewTransform2.createIdentity(), {
      tandem: options.tandem.createTandem('view')
    }), options);
  }
}
phScale.register('MicroScreen', MicroScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJNb2RlbFZpZXdUcmFuc2Zvcm0yIiwiSW1hZ2UiLCJtaWNyb0hvbWVTY3JlZW5JY29uX3BuZyIsIm1pY3JvTmF2YmFySWNvbl9wbmciLCJQSFNjYWxlQ29sb3JzIiwicGhTY2FsZSIsIlBoU2NhbGVTdHJpbmdzIiwiTWljcm9Nb2RlbCIsIk1pY3JvU2NyZWVuVmlldyIsIk1pY3JvS2V5Ym9hcmRIZWxwQ29udGVudCIsIk1pY3JvU2NyZWVuIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwibmFtZSIsInNjcmVlbiIsIm1pY3JvU3RyaW5nUHJvcGVydHkiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsIlNDUkVFTl9CQUNLR1JPVU5EIiwiaG9tZVNjcmVlbkljb24iLCJtYXhJY29uV2lkdGhQcm9wb3J0aW9uIiwibWF4SWNvbkhlaWdodFByb3BvcnRpb24iLCJuYXZpZ2F0aW9uQmFySWNvbiIsImNyZWF0ZUtleWJvYXJkSGVscE5vZGUiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJtb2RlbCIsImNyZWF0ZUlkZW50aXR5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNaWNyb1NjcmVlbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgJ01pY3JvJyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFNjcmVlbiwgeyBTY3JlZW5PcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuSWNvbi5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWljcm9Ib21lU2NyZWVuSWNvbl9wbmcgZnJvbSAnLi4vLi4vaW1hZ2VzL21pY3JvSG9tZVNjcmVlbkljb25fcG5nLmpzJztcclxuaW1wb3J0IG1pY3JvTmF2YmFySWNvbl9wbmcgZnJvbSAnLi4vLi4vaW1hZ2VzL21pY3JvTmF2YmFySWNvbl9wbmcuanMnO1xyXG5pbXBvcnQgUEhTY2FsZUNvbG9ycyBmcm9tICcuLi9jb21tb24vUEhTY2FsZUNvbG9ycy5qcyc7XHJcbmltcG9ydCBwaFNjYWxlIGZyb20gJy4uL3BoU2NhbGUuanMnO1xyXG5pbXBvcnQgUGhTY2FsZVN0cmluZ3MgZnJvbSAnLi4vUGhTY2FsZVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgTWljcm9Nb2RlbCBmcm9tICcuL21vZGVsL01pY3JvTW9kZWwuanMnO1xyXG5pbXBvcnQgTWljcm9TY3JlZW5WaWV3IGZyb20gJy4vdmlldy9NaWNyb1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgTWljcm9LZXlib2FyZEhlbHBDb250ZW50IGZyb20gJy4vdmlldy9NaWNyb0tleWJvYXJkSGVscENvbnRlbnQuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIE1pY3JvU2NyZWVuT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPFNjcmVlbk9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1pY3JvU2NyZWVuIGV4dGVuZHMgU2NyZWVuPE1pY3JvTW9kZWwsIE1pY3JvU2NyZWVuVmlldz4ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogTWljcm9TY3JlZW5PcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TWljcm9TY3JlZW5PcHRpb25zLCBTZWxmT3B0aW9ucywgU2NyZWVuT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2NyZWVuT3B0aW9uc1xyXG4gICAgICBuYW1lOiBQaFNjYWxlU3RyaW5ncy5zY3JlZW4ubWljcm9TdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggUEhTY2FsZUNvbG9ycy5TQ1JFRU5fQkFDS0dST1VORCApLFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogbmV3IFNjcmVlbkljb24oIG5ldyBJbWFnZSggbWljcm9Ib21lU2NyZWVuSWNvbl9wbmcgKSwge1xyXG4gICAgICAgIG1heEljb25XaWR0aFByb3BvcnRpb246IDEsXHJcbiAgICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcclxuICAgICAgfSApLFxyXG4gICAgICBuYXZpZ2F0aW9uQmFySWNvbjogbmV3IFNjcmVlbkljb24oIG5ldyBJbWFnZSggbWljcm9OYXZiYXJJY29uX3BuZyApLCB7XHJcbiAgICAgICAgbWF4SWNvbldpZHRoUHJvcG9ydGlvbjogMSxcclxuICAgICAgICBtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbjogMVxyXG4gICAgICB9ICksXHJcbiAgICAgIC8vVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGgtc2NhbGUvaXNzdWVzLzI0OSByZXN0b3JlIHdoZW4gd29yayBvbiBhbHRlcm5hdGl2ZSBpbnB1dCByZXN1bWVcclxuICAgICAgY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZTogKCkgPT4gbmV3IE1pY3JvS2V5Ym9hcmRIZWxwQ29udGVudCgpXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgKCkgPT4gbmV3IE1pY3JvTW9kZWwoIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21vZGVsJyApXHJcbiAgICAgIH0gKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IE1pY3JvU2NyZWVuVmlldyggbW9kZWwsIE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlSWRlbnRpdHkoKSwge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlldycgKVxyXG4gICAgICB9ICksXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5waFNjYWxlLnJlZ2lzdGVyKCAnTWljcm9TY3JlZW4nLCBNaWNyb1NjcmVlbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQTRCLG9DQUFvQztBQUNoRixPQUFPQyxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLE1BQU0sTUFBeUIsNkJBQTZCO0FBQ25FLE9BQU9DLFVBQVUsTUFBTSxpQ0FBaUM7QUFDeEQsT0FBT0MsbUJBQW1CLE1BQU0sb0RBQW9EO0FBQ3BGLFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsdUJBQXVCLE1BQU0seUNBQXlDO0FBQzdFLE9BQU9DLG1CQUFtQixNQUFNLHFDQUFxQztBQUNyRSxPQUFPQyxhQUFhLE1BQU0sNEJBQTRCO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSxlQUFlO0FBQ25DLE9BQU9DLGNBQWMsTUFBTSxzQkFBc0I7QUFDakQsT0FBT0MsVUFBVSxNQUFNLHVCQUF1QjtBQUM5QyxPQUFPQyxlQUFlLE1BQU0sMkJBQTJCO0FBRXZELE9BQU9DLHdCQUF3QixNQUFNLG9DQUFvQztBQU16RSxlQUFlLE1BQU1DLFdBQVcsU0FBU1osTUFBTSxDQUE4QjtFQUVwRWEsV0FBV0EsQ0FBRUMsZUFBbUMsRUFBRztJQUV4RCxNQUFNQyxPQUFPLEdBQUdqQixTQUFTLENBQWlELENBQUMsQ0FBRTtNQUUzRTtNQUNBa0IsSUFBSSxFQUFFUixjQUFjLENBQUNTLE1BQU0sQ0FBQ0MsbUJBQW1CO01BQy9DQyx1QkFBdUIsRUFBRSxJQUFJcEIsUUFBUSxDQUFFTyxhQUFhLENBQUNjLGlCQUFrQixDQUFDO01BQ3hFQyxjQUFjLEVBQUUsSUFBSXBCLFVBQVUsQ0FBRSxJQUFJRSxLQUFLLENBQUVDLHVCQUF3QixDQUFDLEVBQUU7UUFDcEVrQixzQkFBc0IsRUFBRSxDQUFDO1FBQ3pCQyx1QkFBdUIsRUFBRTtNQUMzQixDQUFFLENBQUM7TUFDSEMsaUJBQWlCLEVBQUUsSUFBSXZCLFVBQVUsQ0FBRSxJQUFJRSxLQUFLLENBQUVFLG1CQUFvQixDQUFDLEVBQUU7UUFDbkVpQixzQkFBc0IsRUFBRSxDQUFDO1FBQ3pCQyx1QkFBdUIsRUFBRTtNQUMzQixDQUFFLENBQUM7TUFDSDtNQUNBRSxzQkFBc0IsRUFBRUEsQ0FBQSxLQUFNLElBQUlkLHdCQUF3QixDQUFDO0lBQzdELENBQUMsRUFBRUcsZUFBZ0IsQ0FBQztJQUVwQixLQUFLLENBQ0gsTUFBTSxJQUFJTCxVQUFVLENBQUU7TUFDcEJpQixNQUFNLEVBQUVYLE9BQU8sQ0FBQ1csTUFBTSxDQUFDQyxZQUFZLENBQUUsT0FBUTtJQUMvQyxDQUFFLENBQUMsRUFDSEMsS0FBSyxJQUFJLElBQUlsQixlQUFlLENBQUVrQixLQUFLLEVBQUUxQixtQkFBbUIsQ0FBQzJCLGNBQWMsQ0FBQyxDQUFDLEVBQUU7TUFDekVILE1BQU0sRUFBRVgsT0FBTyxDQUFDVyxNQUFNLENBQUNDLFlBQVksQ0FBRSxNQUFPO0lBQzlDLENBQUUsQ0FBQyxFQUNIWixPQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFSLE9BQU8sQ0FBQ3VCLFFBQVEsQ0FBRSxhQUFhLEVBQUVsQixXQUFZLENBQUMifQ==