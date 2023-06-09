// Copyright 2020-2022, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import RAPModel from '../common/model/RAPModel.js';
import ratioAndProportion from '../ratioAndProportion.js';
import RatioAndProportionStrings from '../RatioAndProportionStrings.js';
import DiscoverScreenIcon from './view/DiscoverScreenIcon.js';
import DiscoverScreenKeyboardHelpContent from './view/DiscoverScreenKeyboardHelpContent.js';
import DiscoverScreenView from './view/DiscoverScreenView.js';
import { Color } from '../../../scenery/js/imports.js';
class DiscoverScreen extends Screen {
  constructor(tandem) {
    const backgroundColorProperty = new Property(Color.WHITE);
    const options = {
      backgroundColorProperty: backgroundColorProperty,
      tandem: tandem,
      homeScreenIcon: new DiscoverScreenIcon(),
      name: RatioAndProportionStrings.screen.discoverStringProperty,
      descriptionContent: RatioAndProportionStrings.a11y.discover.homeScreenDescriptionStringProperty,
      createKeyboardHelpNode: () => new DiscoverScreenKeyboardHelpContent()
    };
    super(() => new RAPModel(tandem.createTandem('model')), model => new DiscoverScreenView(model, backgroundColorProperty, tandem.createTandem('view')), options);
  }
}
ratioAndProportion.register('DiscoverScreen', DiscoverScreen);
export default DiscoverScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlJBUE1vZGVsIiwicmF0aW9BbmRQcm9wb3J0aW9uIiwiUmF0aW9BbmRQcm9wb3J0aW9uU3RyaW5ncyIsIkRpc2NvdmVyU2NyZWVuSWNvbiIsIkRpc2NvdmVyU2NyZWVuS2V5Ym9hcmRIZWxwQ29udGVudCIsIkRpc2NvdmVyU2NyZWVuVmlldyIsIkNvbG9yIiwiRGlzY292ZXJTY3JlZW4iLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsImJhY2tncm91bmRDb2xvclByb3BlcnR5IiwiV0hJVEUiLCJvcHRpb25zIiwiaG9tZVNjcmVlbkljb24iLCJuYW1lIiwic2NyZWVuIiwiZGlzY292ZXJTdHJpbmdQcm9wZXJ0eSIsImRlc2NyaXB0aW9uQ29udGVudCIsImExMXkiLCJkaXNjb3ZlciIsImhvbWVTY3JlZW5EZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5IiwiY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZSIsImNyZWF0ZVRhbmRlbSIsIm1vZGVsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEaXNjb3ZlclNjcmVlbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU2NyZWVuIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBSQVBNb2RlbCBmcm9tICcuLi9jb21tb24vbW9kZWwvUkFQTW9kZWwuanMnO1xyXG5pbXBvcnQgcmF0aW9BbmRQcm9wb3J0aW9uIGZyb20gJy4uL3JhdGlvQW5kUHJvcG9ydGlvbi5qcyc7XHJcbmltcG9ydCBSYXRpb0FuZFByb3BvcnRpb25TdHJpbmdzIGZyb20gJy4uL1JhdGlvQW5kUHJvcG9ydGlvblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgRGlzY292ZXJTY3JlZW5JY29uIGZyb20gJy4vdmlldy9EaXNjb3ZlclNjcmVlbkljb24uanMnO1xyXG5pbXBvcnQgRGlzY292ZXJTY3JlZW5LZXlib2FyZEhlbHBDb250ZW50IGZyb20gJy4vdmlldy9EaXNjb3ZlclNjcmVlbktleWJvYXJkSGVscENvbnRlbnQuanMnO1xyXG5pbXBvcnQgRGlzY292ZXJTY3JlZW5WaWV3IGZyb20gJy4vdmlldy9EaXNjb3ZlclNjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcblxyXG5jbGFzcyBEaXNjb3ZlclNjcmVlbiBleHRlbmRzIFNjcmVlbjxSQVBNb2RlbCwgRGlzY292ZXJTY3JlZW5WaWV3PiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgY29uc3QgYmFja2dyb3VuZENvbG9yUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIENvbG9yLldISVRFICk7XHJcbiAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogYmFja2dyb3VuZENvbG9yUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogbmV3IERpc2NvdmVyU2NyZWVuSWNvbigpLFxyXG4gICAgICBuYW1lOiBSYXRpb0FuZFByb3BvcnRpb25TdHJpbmdzLnNjcmVlbi5kaXNjb3ZlclN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBkZXNjcmlwdGlvbkNvbnRlbnQ6IFJhdGlvQW5kUHJvcG9ydGlvblN0cmluZ3MuYTExeS5kaXNjb3Zlci5ob21lU2NyZWVuRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZTogKCkgPT4gbmV3IERpc2NvdmVyU2NyZWVuS2V5Ym9hcmRIZWxwQ29udGVudCgpXHJcbiAgICB9O1xyXG5cclxuICAgIHN1cGVyKFxyXG4gICAgICAoKSA9PiBuZXcgUkFQTW9kZWwoIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb2RlbCcgKSApLFxyXG4gICAgICBtb2RlbCA9PiBuZXcgRGlzY292ZXJTY3JlZW5WaWV3KCBtb2RlbCwgYmFja2dyb3VuZENvbG9yUHJvcGVydHksIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aWV3JyApICksXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5yYXRpb0FuZFByb3BvcnRpb24ucmVnaXN0ZXIoICdEaXNjb3ZlclNjcmVlbicsIERpc2NvdmVyU2NyZWVuICk7XHJcbmV4cG9ydCBkZWZhdWx0IERpc2NvdmVyU2NyZWVuOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSw4QkFBOEI7QUFDbkQsT0FBT0MsTUFBTSxNQUFNLDZCQUE2QjtBQUNoRCxPQUFPQyxRQUFRLE1BQU0sNkJBQTZCO0FBQ2xELE9BQU9DLGtCQUFrQixNQUFNLDBCQUEwQjtBQUN6RCxPQUFPQyx5QkFBeUIsTUFBTSxpQ0FBaUM7QUFDdkUsT0FBT0Msa0JBQWtCLE1BQU0sOEJBQThCO0FBQzdELE9BQU9DLGlDQUFpQyxNQUFNLDZDQUE2QztBQUMzRixPQUFPQyxrQkFBa0IsTUFBTSw4QkFBOEI7QUFFN0QsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUV0RCxNQUFNQyxjQUFjLFNBQVNSLE1BQU0sQ0FBK0I7RUFFekRTLFdBQVdBLENBQUVDLE1BQWMsRUFBRztJQUVuQyxNQUFNQyx1QkFBdUIsR0FBRyxJQUFJWixRQUFRLENBQUVRLEtBQUssQ0FBQ0ssS0FBTSxDQUFDO0lBQzNELE1BQU1DLE9BQU8sR0FBRztNQUNkRix1QkFBdUIsRUFBRUEsdUJBQXVCO01BQ2hERCxNQUFNLEVBQUVBLE1BQU07TUFDZEksY0FBYyxFQUFFLElBQUlWLGtCQUFrQixDQUFDLENBQUM7TUFDeENXLElBQUksRUFBRVoseUJBQXlCLENBQUNhLE1BQU0sQ0FBQ0Msc0JBQXNCO01BQzdEQyxrQkFBa0IsRUFBRWYseUJBQXlCLENBQUNnQixJQUFJLENBQUNDLFFBQVEsQ0FBQ0MsbUNBQW1DO01BQy9GQyxzQkFBc0IsRUFBRUEsQ0FBQSxLQUFNLElBQUlqQixpQ0FBaUMsQ0FBQztJQUN0RSxDQUFDO0lBRUQsS0FBSyxDQUNILE1BQU0sSUFBSUosUUFBUSxDQUFFUyxNQUFNLENBQUNhLFlBQVksQ0FBRSxPQUFRLENBQUUsQ0FBQyxFQUNwREMsS0FBSyxJQUFJLElBQUlsQixrQkFBa0IsQ0FBRWtCLEtBQUssRUFBRWIsdUJBQXVCLEVBQUVELE1BQU0sQ0FBQ2EsWUFBWSxDQUFFLE1BQU8sQ0FBRSxDQUFDLEVBQ2hHVixPQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFYLGtCQUFrQixDQUFDdUIsUUFBUSxDQUFFLGdCQUFnQixFQUFFakIsY0FBZSxDQUFDO0FBQy9ELGVBQWVBLGNBQWMifQ==