// Copyright 2018-2022, University of Colorado Boulder

/**
 * The main screen of the "Area Model: Decimals" simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import merge from '../../../phet-core/js/merge.js';
import areaModelCommon from '../areaModelCommon.js';
import AreaModelCommonStrings from '../AreaModelCommonStrings.js';
import AreaModelCommonColors from '../common/view/AreaModelCommonColors.js';
import ProportionalAreaModel from '../proportional/model/ProportionalAreaModel.js';
import ProportionalAreaScreenView from '../proportional/view/ProportionalAreaScreenView.js';
class DecimalsScreen extends Screen {
  constructor() {
    const options = {
      name: AreaModelCommonStrings.screen.decimalsStringProperty,
      backgroundColorProperty: AreaModelCommonColors.backgroundProperty
    };
    const commonAreaOptions = {
      eraseWidth: 0.1,
      eraseHeight: 0.1,
      snapSize: 0.1,
      gridSpacing: 0.1,
      smallTileSize: 0.1,
      largeTileSize: 1
    };
    super(() => {
      return new ProportionalAreaModel([merge({
        maximumSize: 1,
        minimumSize: 0.1,
        initialWidth: 0.5,
        initialHeight: 0.5,
        initialVerticalSplit: 0.2,
        partitionSnapSize: 0.1
      }, commonAreaOptions), merge({
        maximumSize: 2,
        minimumSize: 0.1,
        initialWidth: 1,
        initialHeight: 1,
        initialVerticalSplit: 0.5,
        partitionSnapSize: 0.1
      }, commonAreaOptions), merge({
        maximumSize: 3,
        minimumSize: 0.1,
        initialWidth: 1,
        initialHeight: 1,
        initialVerticalSplit: 0.5,
        partitionSnapSize: 0.1
      }, commonAreaOptions)]);
    }, model => {
      return new ProportionalAreaScreenView(model, {
        decimalPlaces: 1
      });
    }, options);
  }
}
areaModelCommon.register('DecimalsScreen', DecimalsScreen);
export default DecimalsScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJtZXJnZSIsImFyZWFNb2RlbENvbW1vbiIsIkFyZWFNb2RlbENvbW1vblN0cmluZ3MiLCJBcmVhTW9kZWxDb21tb25Db2xvcnMiLCJQcm9wb3J0aW9uYWxBcmVhTW9kZWwiLCJQcm9wb3J0aW9uYWxBcmVhU2NyZWVuVmlldyIsIkRlY2ltYWxzU2NyZWVuIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwibmFtZSIsInNjcmVlbiIsImRlY2ltYWxzU3RyaW5nUHJvcGVydHkiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsImJhY2tncm91bmRQcm9wZXJ0eSIsImNvbW1vbkFyZWFPcHRpb25zIiwiZXJhc2VXaWR0aCIsImVyYXNlSGVpZ2h0Iiwic25hcFNpemUiLCJncmlkU3BhY2luZyIsInNtYWxsVGlsZVNpemUiLCJsYXJnZVRpbGVTaXplIiwibWF4aW11bVNpemUiLCJtaW5pbXVtU2l6ZSIsImluaXRpYWxXaWR0aCIsImluaXRpYWxIZWlnaHQiLCJpbml0aWFsVmVydGljYWxTcGxpdCIsInBhcnRpdGlvblNuYXBTaXplIiwibW9kZWwiLCJkZWNpbWFsUGxhY2VzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEZWNpbWFsc1NjcmVlbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgbWFpbiBzY3JlZW4gb2YgdGhlIFwiQXJlYSBNb2RlbDogRGVjaW1hbHNcIiBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IGFyZWFNb2RlbENvbW1vbiBmcm9tICcuLi9hcmVhTW9kZWxDb21tb24uanMnO1xyXG5pbXBvcnQgQXJlYU1vZGVsQ29tbW9uU3RyaW5ncyBmcm9tICcuLi9BcmVhTW9kZWxDb21tb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IEFyZWFNb2RlbENvbW1vbkNvbG9ycyBmcm9tICcuLi9jb21tb24vdmlldy9BcmVhTW9kZWxDb21tb25Db2xvcnMuanMnO1xyXG5pbXBvcnQgUHJvcG9ydGlvbmFsQXJlYU1vZGVsIGZyb20gJy4uL3Byb3BvcnRpb25hbC9tb2RlbC9Qcm9wb3J0aW9uYWxBcmVhTW9kZWwuanMnO1xyXG5pbXBvcnQgUHJvcG9ydGlvbmFsQXJlYVNjcmVlblZpZXcgZnJvbSAnLi4vcHJvcG9ydGlvbmFsL3ZpZXcvUHJvcG9ydGlvbmFsQXJlYVNjcmVlblZpZXcuanMnO1xyXG5cclxuY2xhc3MgRGVjaW1hbHNTY3JlZW4gZXh0ZW5kcyBTY3JlZW4ge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgIG5hbWU6IEFyZWFNb2RlbENvbW1vblN0cmluZ3Muc2NyZWVuLmRlY2ltYWxzU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBBcmVhTW9kZWxDb21tb25Db2xvcnMuYmFja2dyb3VuZFByb3BlcnR5XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGNvbW1vbkFyZWFPcHRpb25zID0ge1xyXG4gICAgICBlcmFzZVdpZHRoOiAwLjEsXHJcbiAgICAgIGVyYXNlSGVpZ2h0OiAwLjEsXHJcbiAgICAgIHNuYXBTaXplOiAwLjEsXHJcbiAgICAgIGdyaWRTcGFjaW5nOiAwLjEsXHJcbiAgICAgIHNtYWxsVGlsZVNpemU6IDAuMSxcclxuICAgICAgbGFyZ2VUaWxlU2l6ZTogMVxyXG4gICAgfTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvcG9ydGlvbmFsQXJlYU1vZGVsKCBbXHJcbiAgICAgICAgICBtZXJnZSgge1xyXG4gICAgICAgICAgICBtYXhpbXVtU2l6ZTogMSxcclxuICAgICAgICAgICAgbWluaW11bVNpemU6IDAuMSxcclxuICAgICAgICAgICAgaW5pdGlhbFdpZHRoOiAwLjUsXHJcbiAgICAgICAgICAgIGluaXRpYWxIZWlnaHQ6IDAuNSxcclxuICAgICAgICAgICAgaW5pdGlhbFZlcnRpY2FsU3BsaXQ6IDAuMixcclxuICAgICAgICAgICAgcGFydGl0aW9uU25hcFNpemU6IDAuMVxyXG4gICAgICAgICAgfSwgY29tbW9uQXJlYU9wdGlvbnMgKSxcclxuICAgICAgICAgIG1lcmdlKCB7XHJcbiAgICAgICAgICAgIG1heGltdW1TaXplOiAyLFxyXG4gICAgICAgICAgICBtaW5pbXVtU2l6ZTogMC4xLFxyXG4gICAgICAgICAgICBpbml0aWFsV2lkdGg6IDEsXHJcbiAgICAgICAgICAgIGluaXRpYWxIZWlnaHQ6IDEsXHJcbiAgICAgICAgICAgIGluaXRpYWxWZXJ0aWNhbFNwbGl0OiAwLjUsXHJcbiAgICAgICAgICAgIHBhcnRpdGlvblNuYXBTaXplOiAwLjFcclxuICAgICAgICAgIH0sIGNvbW1vbkFyZWFPcHRpb25zICksXHJcbiAgICAgICAgICBtZXJnZSgge1xyXG4gICAgICAgICAgICBtYXhpbXVtU2l6ZTogMyxcclxuICAgICAgICAgICAgbWluaW11bVNpemU6IDAuMSxcclxuICAgICAgICAgICAgaW5pdGlhbFdpZHRoOiAxLFxyXG4gICAgICAgICAgICBpbml0aWFsSGVpZ2h0OiAxLFxyXG4gICAgICAgICAgICBpbml0aWFsVmVydGljYWxTcGxpdDogMC41LFxyXG4gICAgICAgICAgICBwYXJ0aXRpb25TbmFwU2l6ZTogMC4xXHJcbiAgICAgICAgICB9LCBjb21tb25BcmVhT3B0aW9ucyApXHJcbiAgICAgICAgXSApO1xyXG4gICAgICB9LFxyXG4gICAgICBtb2RlbCA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wb3J0aW9uYWxBcmVhU2NyZWVuVmlldyggbW9kZWwsIHtcclxuICAgICAgICAgIGRlY2ltYWxQbGFjZXM6IDFcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5hcmVhTW9kZWxDb21tb24ucmVnaXN0ZXIoICdEZWNpbWFsc1NjcmVlbicsIERlY2ltYWxzU2NyZWVuICk7XHJcbmV4cG9ydCBkZWZhdWx0IERlY2ltYWxzU2NyZWVuOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0sNkJBQTZCO0FBQ2hELE9BQU9DLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsT0FBT0MsZUFBZSxNQUFNLHVCQUF1QjtBQUNuRCxPQUFPQyxzQkFBc0IsTUFBTSw4QkFBOEI7QUFDakUsT0FBT0MscUJBQXFCLE1BQU0seUNBQXlDO0FBQzNFLE9BQU9DLHFCQUFxQixNQUFNLGdEQUFnRDtBQUNsRixPQUFPQywwQkFBMEIsTUFBTSxvREFBb0Q7QUFFM0YsTUFBTUMsY0FBYyxTQUFTUCxNQUFNLENBQUM7RUFDbENRLFdBQVdBLENBQUEsRUFBRztJQUVaLE1BQU1DLE9BQU8sR0FBRztNQUNkQyxJQUFJLEVBQUVQLHNCQUFzQixDQUFDUSxNQUFNLENBQUNDLHNCQUFzQjtNQUMxREMsdUJBQXVCLEVBQUVULHFCQUFxQixDQUFDVTtJQUNqRCxDQUFDO0lBRUQsTUFBTUMsaUJBQWlCLEdBQUc7TUFDeEJDLFVBQVUsRUFBRSxHQUFHO01BQ2ZDLFdBQVcsRUFBRSxHQUFHO01BQ2hCQyxRQUFRLEVBQUUsR0FBRztNQUNiQyxXQUFXLEVBQUUsR0FBRztNQUNoQkMsYUFBYSxFQUFFLEdBQUc7TUFDbEJDLGFBQWEsRUFBRTtJQUNqQixDQUFDO0lBRUQsS0FBSyxDQUNILE1BQU07TUFDSixPQUFPLElBQUloQixxQkFBcUIsQ0FBRSxDQUNoQ0osS0FBSyxDQUFFO1FBQ0xxQixXQUFXLEVBQUUsQ0FBQztRQUNkQyxXQUFXLEVBQUUsR0FBRztRQUNoQkMsWUFBWSxFQUFFLEdBQUc7UUFDakJDLGFBQWEsRUFBRSxHQUFHO1FBQ2xCQyxvQkFBb0IsRUFBRSxHQUFHO1FBQ3pCQyxpQkFBaUIsRUFBRTtNQUNyQixDQUFDLEVBQUVaLGlCQUFrQixDQUFDLEVBQ3RCZCxLQUFLLENBQUU7UUFDTHFCLFdBQVcsRUFBRSxDQUFDO1FBQ2RDLFdBQVcsRUFBRSxHQUFHO1FBQ2hCQyxZQUFZLEVBQUUsQ0FBQztRQUNmQyxhQUFhLEVBQUUsQ0FBQztRQUNoQkMsb0JBQW9CLEVBQUUsR0FBRztRQUN6QkMsaUJBQWlCLEVBQUU7TUFDckIsQ0FBQyxFQUFFWixpQkFBa0IsQ0FBQyxFQUN0QmQsS0FBSyxDQUFFO1FBQ0xxQixXQUFXLEVBQUUsQ0FBQztRQUNkQyxXQUFXLEVBQUUsR0FBRztRQUNoQkMsWUFBWSxFQUFFLENBQUM7UUFDZkMsYUFBYSxFQUFFLENBQUM7UUFDaEJDLG9CQUFvQixFQUFFLEdBQUc7UUFDekJDLGlCQUFpQixFQUFFO01BQ3JCLENBQUMsRUFBRVosaUJBQWtCLENBQUMsQ0FDdEIsQ0FBQztJQUNMLENBQUMsRUFDRGEsS0FBSyxJQUFJO01BQ1AsT0FBTyxJQUFJdEIsMEJBQTBCLENBQUVzQixLQUFLLEVBQUU7UUFDNUNDLGFBQWEsRUFBRTtNQUNqQixDQUFFLENBQUM7SUFDTCxDQUFDLEVBQ0RwQixPQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFQLGVBQWUsQ0FBQzRCLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRXZCLGNBQWUsQ0FBQztBQUM1RCxlQUFlQSxjQUFjIn0=