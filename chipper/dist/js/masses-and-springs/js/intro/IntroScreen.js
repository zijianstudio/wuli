// Copyright 2016-2022, University of Colorado Boulder

/**
 * The Intro screen for Masses and Springs.
 *
 * @author Matt Pennington (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import introScreenIcon_png from '../../images/introScreenIcon_png.js';
import MassesAndSpringsColors from '../common/view/MassesAndSpringsColors.js';
import massesAndSprings from '../massesAndSprings.js';
import MassesAndSpringsStrings from '../MassesAndSpringsStrings.js';
import IntroModel from './model/IntroModel.js';
import IntroScreenView from './view/IntroScreenView.js';
class IntroScreen extends Screen {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    const options = {
      name: MassesAndSpringsStrings.screen.introStringProperty,
      backgroundColorProperty: MassesAndSpringsColors.backgroundProperty,
      homeScreenIcon: new ScreenIcon(new Image(introScreenIcon_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      tandem: tandem
    };
    super(() => new IntroModel(tandem.createTandem('model')), model => new IntroScreenView(model, tandem.createTandem('view')), options);
  }
}
massesAndSprings.register('IntroScreen', IntroScreen);
export default IntroScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJTY3JlZW5JY29uIiwiSW1hZ2UiLCJpbnRyb1NjcmVlbkljb25fcG5nIiwiTWFzc2VzQW5kU3ByaW5nc0NvbG9ycyIsIm1hc3Nlc0FuZFNwcmluZ3MiLCJNYXNzZXNBbmRTcHJpbmdzU3RyaW5ncyIsIkludHJvTW9kZWwiLCJJbnRyb1NjcmVlblZpZXciLCJJbnRyb1NjcmVlbiIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwib3B0aW9ucyIsIm5hbWUiLCJzY3JlZW4iLCJpbnRyb1N0cmluZ1Byb3BlcnR5IiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJiYWNrZ3JvdW5kUHJvcGVydHkiLCJob21lU2NyZWVuSWNvbiIsIm1heEljb25XaWR0aFByb3BvcnRpb24iLCJtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbiIsImNyZWF0ZVRhbmRlbSIsIm1vZGVsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbnRyb1NjcmVlbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgSW50cm8gc2NyZWVuIGZvciBNYXNzZXMgYW5kIFNwcmluZ3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgTWF0dCBQZW5uaW5ndG9uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIERlbnplbGwgQmFybmV0dCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgU2NyZWVuIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBTY3JlZW5JY29uIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbkljb24uanMnO1xyXG5pbXBvcnQgeyBJbWFnZSB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBpbnRyb1NjcmVlbkljb25fcG5nIGZyb20gJy4uLy4uL2ltYWdlcy9pbnRyb1NjcmVlbkljb25fcG5nLmpzJztcclxuaW1wb3J0IE1hc3Nlc0FuZFNwcmluZ3NDb2xvcnMgZnJvbSAnLi4vY29tbW9uL3ZpZXcvTWFzc2VzQW5kU3ByaW5nc0NvbG9ycy5qcyc7XHJcbmltcG9ydCBtYXNzZXNBbmRTcHJpbmdzIGZyb20gJy4uL21hc3Nlc0FuZFNwcmluZ3MuanMnO1xyXG5pbXBvcnQgTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3MgZnJvbSAnLi4vTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgSW50cm9Nb2RlbCBmcm9tICcuL21vZGVsL0ludHJvTW9kZWwuanMnO1xyXG5pbXBvcnQgSW50cm9TY3JlZW5WaWV3IGZyb20gJy4vdmlldy9JbnRyb1NjcmVlblZpZXcuanMnO1xyXG5cclxuY2xhc3MgSW50cm9TY3JlZW4gZXh0ZW5kcyBTY3JlZW4ge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRhbmRlbSApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICBuYW1lOiBNYXNzZXNBbmRTcHJpbmdzU3RyaW5ncy5zY3JlZW4uaW50cm9TdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IE1hc3Nlc0FuZFNwcmluZ3NDb2xvcnMuYmFja2dyb3VuZFByb3BlcnR5LFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogbmV3IFNjcmVlbkljb24oIG5ldyBJbWFnZSggaW50cm9TY3JlZW5JY29uX3BuZyApLCB7XHJcbiAgICAgICAgbWF4SWNvbldpZHRoUHJvcG9ydGlvbjogMSxcclxuICAgICAgICBtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbjogMVxyXG4gICAgICB9ICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9O1xyXG5cclxuICAgIHN1cGVyKFxyXG4gICAgICAoKSA9PiBuZXcgSW50cm9Nb2RlbCggdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21vZGVsJyApICksXHJcbiAgICAgIG1vZGVsID0+IG5ldyBJbnRyb1NjcmVlblZpZXcoIG1vZGVsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlldycgKSApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxubWFzc2VzQW5kU3ByaW5ncy5yZWdpc3RlciggJ0ludHJvU2NyZWVuJywgSW50cm9TY3JlZW4gKTtcclxuZXhwb3J0IGRlZmF1bHQgSW50cm9TY3JlZW47Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLDZCQUE2QjtBQUNoRCxPQUFPQyxVQUFVLE1BQU0saUNBQWlDO0FBQ3hELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsbUJBQW1CLE1BQU0scUNBQXFDO0FBQ3JFLE9BQU9DLHNCQUFzQixNQUFNLDBDQUEwQztBQUM3RSxPQUFPQyxnQkFBZ0IsTUFBTSx3QkFBd0I7QUFDckQsT0FBT0MsdUJBQXVCLE1BQU0sK0JBQStCO0FBQ25FLE9BQU9DLFVBQVUsTUFBTSx1QkFBdUI7QUFDOUMsT0FBT0MsZUFBZSxNQUFNLDJCQUEyQjtBQUV2RCxNQUFNQyxXQUFXLFNBQVNULE1BQU0sQ0FBQztFQUUvQjtBQUNGO0FBQ0E7RUFDRVUsV0FBV0EsQ0FBRUMsTUFBTSxFQUFHO0lBRXBCLE1BQU1DLE9BQU8sR0FBRztNQUNkQyxJQUFJLEVBQUVQLHVCQUF1QixDQUFDUSxNQUFNLENBQUNDLG1CQUFtQjtNQUN4REMsdUJBQXVCLEVBQUVaLHNCQUFzQixDQUFDYSxrQkFBa0I7TUFDbEVDLGNBQWMsRUFBRSxJQUFJakIsVUFBVSxDQUFFLElBQUlDLEtBQUssQ0FBRUMsbUJBQW9CLENBQUMsRUFBRTtRQUNoRWdCLHNCQUFzQixFQUFFLENBQUM7UUFDekJDLHVCQUF1QixFQUFFO01BQzNCLENBQUUsQ0FBQztNQUNIVCxNQUFNLEVBQUVBO0lBQ1YsQ0FBQztJQUVELEtBQUssQ0FDSCxNQUFNLElBQUlKLFVBQVUsQ0FBRUksTUFBTSxDQUFDVSxZQUFZLENBQUUsT0FBUSxDQUFFLENBQUMsRUFDdERDLEtBQUssSUFBSSxJQUFJZCxlQUFlLENBQUVjLEtBQUssRUFBRVgsTUFBTSxDQUFDVSxZQUFZLENBQUUsTUFBTyxDQUFFLENBQUMsRUFDcEVULE9BQ0YsQ0FBQztFQUNIO0FBQ0Y7QUFFQVAsZ0JBQWdCLENBQUNrQixRQUFRLENBQUUsYUFBYSxFQUFFZCxXQUFZLENBQUM7QUFDdkQsZUFBZUEsV0FBVyJ9