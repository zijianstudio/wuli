// Copyright 2018-2022, University of Colorado Boulder

/**
 * The Bounce screen for Masses and Springs: Basics.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import MassesAndSpringsModel from '../../../masses-and-springs/js/common/model/MassesAndSpringsModel.js';
import MassesAndSpringsColors from '../../../masses-and-springs/js/common/view/MassesAndSpringsColors.js';
import merge from '../../../phet-core/js/merge.js';
import { Image } from '../../../scenery/js/imports.js';
import bounceScreenIcon_png from '../../images/bounceScreenIcon_png.js';
import massesAndSpringsBasics from '../massesAndSpringsBasics.js';
import MassesAndSpringsBasicsStrings from '../MassesAndSpringsBasicsStrings.js';
import BounceScreenView from './view/BounceScreenView.js';
class BounceScreen extends Screen {
  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(tandem, options) {
    options = merge({
      name: MassesAndSpringsBasicsStrings.screen.bounceStringProperty,
      backgroundColorProperty: MassesAndSpringsColors.backgroundProperty,
      homeScreenIcon: new ScreenIcon(new Image(bounceScreenIcon_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      tandem: tandem
    }, options);
    super(() => {
      //tandem reference for model
      const modelTandem = tandem.createTandem('model');

      // model reference used for spring and mass creation
      const model = new MassesAndSpringsModel(modelTandem, options);
      model.basicsVersion = true;
      model.addDefaultSprings(modelTandem);
      model.addDefaultMasses(modelTandem);
      return model;
    }, model => new BounceScreenView(model, tandem.createTandem('view')), options);
  }
}
massesAndSpringsBasics.register('BounceScreen', BounceScreen);
export default BounceScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJTY3JlZW5JY29uIiwiTWFzc2VzQW5kU3ByaW5nc01vZGVsIiwiTWFzc2VzQW5kU3ByaW5nc0NvbG9ycyIsIm1lcmdlIiwiSW1hZ2UiLCJib3VuY2VTY3JlZW5JY29uX3BuZyIsIm1hc3Nlc0FuZFNwcmluZ3NCYXNpY3MiLCJNYXNzZXNBbmRTcHJpbmdzQmFzaWNzU3RyaW5ncyIsIkJvdW5jZVNjcmVlblZpZXciLCJCb3VuY2VTY3JlZW4iLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsIm9wdGlvbnMiLCJuYW1lIiwic2NyZWVuIiwiYm91bmNlU3RyaW5nUHJvcGVydHkiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsImJhY2tncm91bmRQcm9wZXJ0eSIsImhvbWVTY3JlZW5JY29uIiwibWF4SWNvbldpZHRoUHJvcG9ydGlvbiIsIm1heEljb25IZWlnaHRQcm9wb3J0aW9uIiwibW9kZWxUYW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJtb2RlbCIsImJhc2ljc1ZlcnNpb24iLCJhZGREZWZhdWx0U3ByaW5ncyIsImFkZERlZmF1bHRNYXNzZXMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJvdW5jZVNjcmVlbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgQm91bmNlIHNjcmVlbiBmb3IgTWFzc2VzIGFuZCBTcHJpbmdzOiBCYXNpY3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgRGVuemVsbCBCYXJuZXR0IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTY3JlZW4gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuSWNvbi5qcyc7XHJcbmltcG9ydCBNYXNzZXNBbmRTcHJpbmdzTW9kZWwgZnJvbSAnLi4vLi4vLi4vbWFzc2VzLWFuZC1zcHJpbmdzL2pzL2NvbW1vbi9tb2RlbC9NYXNzZXNBbmRTcHJpbmdzTW9kZWwuanMnO1xyXG5pbXBvcnQgTWFzc2VzQW5kU3ByaW5nc0NvbG9ycyBmcm9tICcuLi8uLi8uLi9tYXNzZXMtYW5kLXNwcmluZ3MvanMvY29tbW9uL3ZpZXcvTWFzc2VzQW5kU3ByaW5nc0NvbG9ycy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBJbWFnZSB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBib3VuY2VTY3JlZW5JY29uX3BuZyBmcm9tICcuLi8uLi9pbWFnZXMvYm91bmNlU2NyZWVuSWNvbl9wbmcuanMnO1xyXG5pbXBvcnQgbWFzc2VzQW5kU3ByaW5nc0Jhc2ljcyBmcm9tICcuLi9tYXNzZXNBbmRTcHJpbmdzQmFzaWNzLmpzJztcclxuaW1wb3J0IE1hc3Nlc0FuZFNwcmluZ3NCYXNpY3NTdHJpbmdzIGZyb20gJy4uL01hc3Nlc0FuZFNwcmluZ3NCYXNpY3NTdHJpbmdzLmpzJztcclxuaW1wb3J0IEJvdW5jZVNjcmVlblZpZXcgZnJvbSAnLi92aWV3L0JvdW5jZVNjcmVlblZpZXcuanMnO1xyXG5cclxuY2xhc3MgQm91bmNlU2NyZWVuIGV4dGVuZHMgU2NyZWVuIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBuYW1lOiBNYXNzZXNBbmRTcHJpbmdzQmFzaWNzU3RyaW5ncy5zY3JlZW4uYm91bmNlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBNYXNzZXNBbmRTcHJpbmdzQ29sb3JzLmJhY2tncm91bmRQcm9wZXJ0eSxcclxuICAgICAgaG9tZVNjcmVlbkljb246IG5ldyBTY3JlZW5JY29uKCBuZXcgSW1hZ2UoIGJvdW5jZVNjcmVlbkljb25fcG5nICksIHtcclxuICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAxXHJcbiAgICAgIH0gKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggKCkgPT4ge1xyXG5cclxuICAgICAgICAvL3RhbmRlbSByZWZlcmVuY2UgZm9yIG1vZGVsXHJcbiAgICAgICAgY29uc3QgbW9kZWxUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbW9kZWwnICk7XHJcblxyXG4gICAgICAgIC8vIG1vZGVsIHJlZmVyZW5jZSB1c2VkIGZvciBzcHJpbmcgYW5kIG1hc3MgY3JlYXRpb25cclxuICAgICAgICBjb25zdCBtb2RlbCA9IG5ldyBNYXNzZXNBbmRTcHJpbmdzTW9kZWwoIG1vZGVsVGFuZGVtLCBvcHRpb25zICk7XHJcbiAgICAgICAgbW9kZWwuYmFzaWNzVmVyc2lvbiA9IHRydWU7XHJcbiAgICAgICAgbW9kZWwuYWRkRGVmYXVsdFNwcmluZ3MoIG1vZGVsVGFuZGVtICk7XHJcbiAgICAgICAgbW9kZWwuYWRkRGVmYXVsdE1hc3NlcyggbW9kZWxUYW5kZW0gKTtcclxuICAgICAgICByZXR1cm4gbW9kZWw7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1vZGVsID0+IG5ldyBCb3VuY2VTY3JlZW5WaWV3KCBtb2RlbCwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZpZXcnICkgKSxcclxuICAgICAgb3B0aW9uc1xyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbm1hc3Nlc0FuZFNwcmluZ3NCYXNpY3MucmVnaXN0ZXIoICdCb3VuY2VTY3JlZW4nLCBCb3VuY2VTY3JlZW4gKTtcclxuZXhwb3J0IGRlZmF1bHQgQm91bmNlU2NyZWVuOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0sNkJBQTZCO0FBQ2hELE9BQU9DLFVBQVUsTUFBTSxpQ0FBaUM7QUFDeEQsT0FBT0MscUJBQXFCLE1BQU0sc0VBQXNFO0FBQ3hHLE9BQU9DLHNCQUFzQixNQUFNLHNFQUFzRTtBQUN6RyxPQUFPQyxLQUFLLE1BQU0sZ0NBQWdDO0FBQ2xELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0Msb0JBQW9CLE1BQU0sc0NBQXNDO0FBQ3ZFLE9BQU9DLHNCQUFzQixNQUFNLDhCQUE4QjtBQUNqRSxPQUFPQyw2QkFBNkIsTUFBTSxxQ0FBcUM7QUFDL0UsT0FBT0MsZ0JBQWdCLE1BQU0sNEJBQTRCO0FBRXpELE1BQU1DLFlBQVksU0FBU1YsTUFBTSxDQUFDO0VBRWhDO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VXLFdBQVdBLENBQUVDLE1BQU0sRUFBRUMsT0FBTyxFQUFHO0lBRTdCQSxPQUFPLEdBQUdULEtBQUssQ0FBRTtNQUNmVSxJQUFJLEVBQUVOLDZCQUE2QixDQUFDTyxNQUFNLENBQUNDLG9CQUFvQjtNQUMvREMsdUJBQXVCLEVBQUVkLHNCQUFzQixDQUFDZSxrQkFBa0I7TUFDbEVDLGNBQWMsRUFBRSxJQUFJbEIsVUFBVSxDQUFFLElBQUlJLEtBQUssQ0FBRUMsb0JBQXFCLENBQUMsRUFBRTtRQUNqRWMsc0JBQXNCLEVBQUUsQ0FBQztRQUN6QkMsdUJBQXVCLEVBQUU7TUFDM0IsQ0FBRSxDQUFDO01BQ0hULE1BQU0sRUFBRUE7SUFDVixDQUFDLEVBQUVDLE9BQVEsQ0FBQztJQUVaLEtBQUssQ0FBRSxNQUFNO01BRVQ7TUFDQSxNQUFNUyxXQUFXLEdBQUdWLE1BQU0sQ0FBQ1csWUFBWSxDQUFFLE9BQVEsQ0FBQzs7TUFFbEQ7TUFDQSxNQUFNQyxLQUFLLEdBQUcsSUFBSXRCLHFCQUFxQixDQUFFb0IsV0FBVyxFQUFFVCxPQUFRLENBQUM7TUFDL0RXLEtBQUssQ0FBQ0MsYUFBYSxHQUFHLElBQUk7TUFDMUJELEtBQUssQ0FBQ0UsaUJBQWlCLENBQUVKLFdBQVksQ0FBQztNQUN0Q0UsS0FBSyxDQUFDRyxnQkFBZ0IsQ0FBRUwsV0FBWSxDQUFDO01BQ3JDLE9BQU9FLEtBQUs7SUFDZCxDQUFDLEVBQ0RBLEtBQUssSUFBSSxJQUFJZixnQkFBZ0IsQ0FBRWUsS0FBSyxFQUFFWixNQUFNLENBQUNXLFlBQVksQ0FBRSxNQUFPLENBQUUsQ0FBQyxFQUNyRVYsT0FDRixDQUFDO0VBQ0g7QUFDRjtBQUVBTixzQkFBc0IsQ0FBQ3FCLFFBQVEsQ0FBRSxjQUFjLEVBQUVsQixZQUFhLENBQUM7QUFDL0QsZUFBZUEsWUFBWSJ9