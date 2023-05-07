// Copyright 2020-2022, University of Colorado Boulder

/**
 * @author John Blanco (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import numberLineOperations from '../numberLineOperations.js';
import NumberLineOperationsStrings from '../NumberLineOperationsStrings.js';
import NLONetWorthModel from './model/NLONetWorthModel.js';
import NetWorthIcon from './view/NetWorthIcon.js';
import NLONetWorthScreenView from './view/NLONetWorthScreenView.js';
class NLONetWorthScreen extends Screen {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    const options = {
      name: NumberLineOperationsStrings.screen.netWorthStringProperty,
      backgroundColorProperty: new Property('#f8f6fe'),
      homeScreenIcon: new NetWorthIcon(),
      tandem: tandem
    };
    super(() => new NLONetWorthModel(tandem.createTandem('model')), model => new NLONetWorthScreenView(model, tandem.createTandem('view')), options);
  }
}
numberLineOperations.register('NLONetWorthScreen', NLONetWorthScreen);
export default NLONetWorthScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIm51bWJlckxpbmVPcGVyYXRpb25zIiwiTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzIiwiTkxPTmV0V29ydGhNb2RlbCIsIk5ldFdvcnRoSWNvbiIsIk5MT05ldFdvcnRoU2NyZWVuVmlldyIsIk5MT05ldFdvcnRoU2NyZWVuIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJvcHRpb25zIiwibmFtZSIsInNjcmVlbiIsIm5ldFdvcnRoU3RyaW5nUHJvcGVydHkiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsImhvbWVTY3JlZW5JY29uIiwiY3JlYXRlVGFuZGVtIiwibW9kZWwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk5MT05ldFdvcnRoU2NyZWVuLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU2NyZWVuIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBudW1iZXJMaW5lT3BlcmF0aW9ucyBmcm9tICcuLi9udW1iZXJMaW5lT3BlcmF0aW9ucy5qcyc7XHJcbmltcG9ydCBOdW1iZXJMaW5lT3BlcmF0aW9uc1N0cmluZ3MgZnJvbSAnLi4vTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLmpzJztcclxuaW1wb3J0IE5MT05ldFdvcnRoTW9kZWwgZnJvbSAnLi9tb2RlbC9OTE9OZXRXb3J0aE1vZGVsLmpzJztcclxuaW1wb3J0IE5ldFdvcnRoSWNvbiBmcm9tICcuL3ZpZXcvTmV0V29ydGhJY29uLmpzJztcclxuaW1wb3J0IE5MT05ldFdvcnRoU2NyZWVuVmlldyBmcm9tICcuL3ZpZXcvTkxPTmV0V29ydGhTY3JlZW5WaWV3LmpzJztcclxuXHJcbmNsYXNzIE5MT05ldFdvcnRoU2NyZWVuIGV4dGVuZHMgU2NyZWVuIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0YW5kZW0gKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcclxuICAgICAgbmFtZTogTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLnNjcmVlbi5uZXRXb3J0aFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCAnI2Y4ZjZmZScgKSxcclxuICAgICAgaG9tZVNjcmVlbkljb246IG5ldyBOZXRXb3J0aEljb24oKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH07XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgICgpID0+IG5ldyBOTE9OZXRXb3J0aE1vZGVsKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbW9kZWwnICkgKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IE5MT05ldFdvcnRoU2NyZWVuVmlldyggbW9kZWwsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aWV3JyApICksXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5udW1iZXJMaW5lT3BlcmF0aW9ucy5yZWdpc3RlciggJ05MT05ldFdvcnRoU2NyZWVuJywgTkxPTmV0V29ydGhTY3JlZW4gKTtcclxuZXhwb3J0IGRlZmF1bHQgTkxPTmV0V29ydGhTY3JlZW47Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLDhCQUE4QjtBQUNuRCxPQUFPQyxNQUFNLE1BQU0sNkJBQTZCO0FBQ2hELE9BQU9DLG9CQUFvQixNQUFNLDRCQUE0QjtBQUM3RCxPQUFPQywyQkFBMkIsTUFBTSxtQ0FBbUM7QUFDM0UsT0FBT0MsZ0JBQWdCLE1BQU0sNkJBQTZCO0FBQzFELE9BQU9DLFlBQVksTUFBTSx3QkFBd0I7QUFDakQsT0FBT0MscUJBQXFCLE1BQU0saUNBQWlDO0FBRW5FLE1BQU1DLGlCQUFpQixTQUFTTixNQUFNLENBQUM7RUFFckM7QUFDRjtBQUNBO0VBQ0VPLFdBQVdBLENBQUVDLE1BQU0sRUFBRztJQUVwQixNQUFNQyxPQUFPLEdBQUc7TUFDZEMsSUFBSSxFQUFFUiwyQkFBMkIsQ0FBQ1MsTUFBTSxDQUFDQyxzQkFBc0I7TUFDL0RDLHVCQUF1QixFQUFFLElBQUlkLFFBQVEsQ0FBRSxTQUFVLENBQUM7TUFDbERlLGNBQWMsRUFBRSxJQUFJVixZQUFZLENBQUMsQ0FBQztNQUNsQ0ksTUFBTSxFQUFFQTtJQUNWLENBQUM7SUFFRCxLQUFLLENBQ0gsTUFBTSxJQUFJTCxnQkFBZ0IsQ0FBRUssTUFBTSxDQUFDTyxZQUFZLENBQUUsT0FBUSxDQUFFLENBQUMsRUFDNURDLEtBQUssSUFBSSxJQUFJWCxxQkFBcUIsQ0FBRVcsS0FBSyxFQUFFUixNQUFNLENBQUNPLFlBQVksQ0FBRSxNQUFPLENBQUUsQ0FBQyxFQUMxRU4sT0FDRixDQUFDO0VBQ0g7QUFDRjtBQUVBUixvQkFBb0IsQ0FBQ2dCLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRVgsaUJBQWtCLENBQUM7QUFDdkUsZUFBZUEsaUJBQWlCIn0=