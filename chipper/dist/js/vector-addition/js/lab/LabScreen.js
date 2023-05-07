// Copyright 2019-2023, University of Colorado Boulder

/**
 * The 'Lab' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Martin Veillette
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import VectorAdditionColors from '../common/VectorAdditionColors.js';
import VectorAdditionIconFactory from '../common/view/VectorAdditionIconFactory.js';
import vectorAddition from '../vectorAddition.js';
import VectorAdditionStrings from '../VectorAdditionStrings.js';
import LabModel from './model/LabModel.js';
import LabScreenView from './view/LabScreenView.js';
export default class LabScreen extends Screen {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    const options = {
      name: VectorAdditionStrings.screen.labStringProperty,
      backgroundColorProperty: new Property(VectorAdditionColors.SCREEN_BACKGROUND),
      homeScreenIcon: VectorAdditionIconFactory.createLabScreenIcon(),
      tandem: tandem
    };
    super(() => new LabModel(tandem.createTandem('model')), model => new LabScreenView(model, tandem.createTandem('view')), options);
  }
}
vectorAddition.register('LabScreen', LabScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlZlY3RvckFkZGl0aW9uQ29sb3JzIiwiVmVjdG9yQWRkaXRpb25JY29uRmFjdG9yeSIsInZlY3RvckFkZGl0aW9uIiwiVmVjdG9yQWRkaXRpb25TdHJpbmdzIiwiTGFiTW9kZWwiLCJMYWJTY3JlZW5WaWV3IiwiTGFiU2NyZWVuIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJvcHRpb25zIiwibmFtZSIsInNjcmVlbiIsImxhYlN0cmluZ1Byb3BlcnR5IiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJTQ1JFRU5fQkFDS0dST1VORCIsImhvbWVTY3JlZW5JY29uIiwiY3JlYXRlTGFiU2NyZWVuSWNvbiIsImNyZWF0ZVRhbmRlbSIsIm1vZGVsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMYWJTY3JlZW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlICdMYWInIHNjcmVlbi4gQ29uZm9ybXMgdG8gdGhlIGNvbnRyYWN0IHNwZWNpZmllZCBpbiBqb2lzdC9TY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgTWFydGluIFZlaWxsZXR0ZVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgVmVjdG9yQWRkaXRpb25Db2xvcnMgZnJvbSAnLi4vY29tbW9uL1ZlY3RvckFkZGl0aW9uQ29sb3JzLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uSWNvbkZhY3RvcnkgZnJvbSAnLi4vY29tbW9uL3ZpZXcvVmVjdG9yQWRkaXRpb25JY29uRmFjdG9yeS5qcyc7XHJcbmltcG9ydCB2ZWN0b3JBZGRpdGlvbiBmcm9tICcuLi92ZWN0b3JBZGRpdGlvbi5qcyc7XHJcbmltcG9ydCBWZWN0b3JBZGRpdGlvblN0cmluZ3MgZnJvbSAnLi4vVmVjdG9yQWRkaXRpb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IExhYk1vZGVsIGZyb20gJy4vbW9kZWwvTGFiTW9kZWwuanMnO1xyXG5pbXBvcnQgTGFiU2NyZWVuVmlldyBmcm9tICcuL3ZpZXcvTGFiU2NyZWVuVmlldy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYWJTY3JlZW4gZXh0ZW5kcyBTY3JlZW4ge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRhbmRlbSApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICBuYW1lOiBWZWN0b3JBZGRpdGlvblN0cmluZ3Muc2NyZWVuLmxhYlN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBWZWN0b3JBZGRpdGlvbkNvbG9ycy5TQ1JFRU5fQkFDS0dST1VORCApLFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogVmVjdG9yQWRkaXRpb25JY29uRmFjdG9yeS5jcmVhdGVMYWJTY3JlZW5JY29uKCksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9O1xyXG5cclxuICAgIHN1cGVyKCAoKSA9PiBuZXcgTGFiTW9kZWwoIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb2RlbCcgKSApLFxyXG4gICAgICBtb2RlbCA9PiBuZXcgTGFiU2NyZWVuVmlldyggbW9kZWwsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aWV3JyApICksXHJcbiAgICAgIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbnZlY3RvckFkZGl0aW9uLnJlZ2lzdGVyKCAnTGFiU2NyZWVuJywgTGFiU2NyZWVuICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSw4QkFBOEI7QUFDbkQsT0FBT0MsTUFBTSxNQUFNLDZCQUE2QjtBQUNoRCxPQUFPQyxvQkFBb0IsTUFBTSxtQ0FBbUM7QUFDcEUsT0FBT0MseUJBQXlCLE1BQU0sNkNBQTZDO0FBQ25GLE9BQU9DLGNBQWMsTUFBTSxzQkFBc0I7QUFDakQsT0FBT0MscUJBQXFCLE1BQU0sNkJBQTZCO0FBQy9ELE9BQU9DLFFBQVEsTUFBTSxxQkFBcUI7QUFDMUMsT0FBT0MsYUFBYSxNQUFNLHlCQUF5QjtBQUVuRCxlQUFlLE1BQU1DLFNBQVMsU0FBU1AsTUFBTSxDQUFDO0VBRTVDO0FBQ0Y7QUFDQTtFQUNFUSxXQUFXQSxDQUFFQyxNQUFNLEVBQUc7SUFFcEIsTUFBTUMsT0FBTyxHQUFHO01BQ2RDLElBQUksRUFBRVAscUJBQXFCLENBQUNRLE1BQU0sQ0FBQ0MsaUJBQWlCO01BQ3BEQyx1QkFBdUIsRUFBRSxJQUFJZixRQUFRLENBQUVFLG9CQUFvQixDQUFDYyxpQkFBa0IsQ0FBQztNQUMvRUMsY0FBYyxFQUFFZCx5QkFBeUIsQ0FBQ2UsbUJBQW1CLENBQUMsQ0FBQztNQUMvRFIsTUFBTSxFQUFFQTtJQUNWLENBQUM7SUFFRCxLQUFLLENBQUUsTUFBTSxJQUFJSixRQUFRLENBQUVJLE1BQU0sQ0FBQ1MsWUFBWSxDQUFFLE9BQVEsQ0FBRSxDQUFDLEVBQ3pEQyxLQUFLLElBQUksSUFBSWIsYUFBYSxDQUFFYSxLQUFLLEVBQUVWLE1BQU0sQ0FBQ1MsWUFBWSxDQUFFLE1BQU8sQ0FBRSxDQUFDLEVBQ2xFUixPQUFRLENBQUM7RUFDYjtBQUNGO0FBRUFQLGNBQWMsQ0FBQ2lCLFFBQVEsQ0FBRSxXQUFXLEVBQUViLFNBQVUsQ0FBQyJ9