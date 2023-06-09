// Copyright 2016-2022, University of Colorado Boulder

/**
 * The 'Game' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import EESharedConstants from '../common/EESharedConstants.js';
import expressionExchange from '../expressionExchange.js';
import ExpressionExchangeStrings from '../ExpressionExchangeStrings.js';
import EEGameModel from './model/EEGameModel.js';
import EEGameIconNode from './view/EEGameIconNode.js';
import EEGameScreenView from './view/EEGameScreenView.js';
class EEGameScreen extends Screen {
  constructor() {
    const options = {
      name: ExpressionExchangeStrings.gameStringProperty,
      backgroundColorProperty: new Property(EESharedConstants.GAME_SCREEN_BACKGROUND_COLOR),
      homeScreenIcon: new ScreenIcon(new EEGameIconNode(), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      })
    };
    super(() => new EEGameModel(), model => new EEGameScreenView(model), options);
  }
}
expressionExchange.register('EEGameScreen', EEGameScreen);
export default EEGameScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJFRVNoYXJlZENvbnN0YW50cyIsImV4cHJlc3Npb25FeGNoYW5nZSIsIkV4cHJlc3Npb25FeGNoYW5nZVN0cmluZ3MiLCJFRUdhbWVNb2RlbCIsIkVFR2FtZUljb25Ob2RlIiwiRUVHYW1lU2NyZWVuVmlldyIsIkVFR2FtZVNjcmVlbiIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsIm5hbWUiLCJnYW1lU3RyaW5nUHJvcGVydHkiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsIkdBTUVfU0NSRUVOX0JBQ0tHUk9VTkRfQ09MT1IiLCJob21lU2NyZWVuSWNvbiIsIm1heEljb25XaWR0aFByb3BvcnRpb24iLCJtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbiIsIm1vZGVsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFRUdhbWVTY3JlZW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlICdHYW1lJyBzY3JlZW4gaW4gdGhlIEV4cHJlc3Npb24gRXhjaGFuZ2Ugc2ltdWxhdGlvbi4gQ29uZm9ybXMgdG8gdGhlIGNvbnRyYWN0IHNwZWNpZmllZCBpbiBqb2lzdC9TY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTY3JlZW4gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuSWNvbi5qcyc7XHJcbmltcG9ydCBFRVNoYXJlZENvbnN0YW50cyBmcm9tICcuLi9jb21tb24vRUVTaGFyZWRDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgZXhwcmVzc2lvbkV4Y2hhbmdlIGZyb20gJy4uL2V4cHJlc3Npb25FeGNoYW5nZS5qcyc7XHJcbmltcG9ydCBFeHByZXNzaW9uRXhjaGFuZ2VTdHJpbmdzIGZyb20gJy4uL0V4cHJlc3Npb25FeGNoYW5nZVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgRUVHYW1lTW9kZWwgZnJvbSAnLi9tb2RlbC9FRUdhbWVNb2RlbC5qcyc7XHJcbmltcG9ydCBFRUdhbWVJY29uTm9kZSBmcm9tICcuL3ZpZXcvRUVHYW1lSWNvbk5vZGUuanMnO1xyXG5pbXBvcnQgRUVHYW1lU2NyZWVuVmlldyBmcm9tICcuL3ZpZXcvRUVHYW1lU2NyZWVuVmlldy5qcyc7XHJcblxyXG5jbGFzcyBFRUdhbWVTY3JlZW4gZXh0ZW5kcyBTY3JlZW4ge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICBuYW1lOiBFeHByZXNzaW9uRXhjaGFuZ2VTdHJpbmdzLmdhbWVTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggRUVTaGFyZWRDb25zdGFudHMuR0FNRV9TQ1JFRU5fQkFDS0dST1VORF9DT0xPUiApLFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogbmV3IFNjcmVlbkljb24oIG5ldyBFRUdhbWVJY29uTm9kZSgpLCB7XHJcbiAgICAgICAgbWF4SWNvbldpZHRoUHJvcG9ydGlvbjogMSxcclxuICAgICAgICBtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbjogMVxyXG4gICAgICB9IClcclxuICAgIH07XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgICgpID0+IG5ldyBFRUdhbWVNb2RlbCgpLFxyXG4gICAgICBtb2RlbCA9PiBuZXcgRUVHYW1lU2NyZWVuVmlldyggbW9kZWwgKSxcclxuICAgICAgb3B0aW9uc1xyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cHJlc3Npb25FeGNoYW5nZS5yZWdpc3RlciggJ0VFR2FtZVNjcmVlbicsIEVFR2FtZVNjcmVlbiApO1xyXG5leHBvcnQgZGVmYXVsdCBFRUdhbWVTY3JlZW47Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSw4QkFBOEI7QUFDbkQsT0FBT0MsTUFBTSxNQUFNLDZCQUE2QjtBQUNoRCxPQUFPQyxVQUFVLE1BQU0saUNBQWlDO0FBQ3hELE9BQU9DLGlCQUFpQixNQUFNLGdDQUFnQztBQUM5RCxPQUFPQyxrQkFBa0IsTUFBTSwwQkFBMEI7QUFDekQsT0FBT0MseUJBQXlCLE1BQU0saUNBQWlDO0FBQ3ZFLE9BQU9DLFdBQVcsTUFBTSx3QkFBd0I7QUFDaEQsT0FBT0MsY0FBYyxNQUFNLDBCQUEwQjtBQUNyRCxPQUFPQyxnQkFBZ0IsTUFBTSw0QkFBNEI7QUFFekQsTUFBTUMsWUFBWSxTQUFTUixNQUFNLENBQUM7RUFFaENTLFdBQVdBLENBQUEsRUFBRztJQUVaLE1BQU1DLE9BQU8sR0FBRztNQUNkQyxJQUFJLEVBQUVQLHlCQUF5QixDQUFDUSxrQkFBa0I7TUFDbERDLHVCQUF1QixFQUFFLElBQUlkLFFBQVEsQ0FBRUcsaUJBQWlCLENBQUNZLDRCQUE2QixDQUFDO01BQ3ZGQyxjQUFjLEVBQUUsSUFBSWQsVUFBVSxDQUFFLElBQUlLLGNBQWMsQ0FBQyxDQUFDLEVBQUU7UUFDcERVLHNCQUFzQixFQUFFLENBQUM7UUFDekJDLHVCQUF1QixFQUFFO01BQzNCLENBQUU7SUFDSixDQUFDO0lBRUQsS0FBSyxDQUNILE1BQU0sSUFBSVosV0FBVyxDQUFDLENBQUMsRUFDdkJhLEtBQUssSUFBSSxJQUFJWCxnQkFBZ0IsQ0FBRVcsS0FBTSxDQUFDLEVBQ3RDUixPQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFQLGtCQUFrQixDQUFDZ0IsUUFBUSxDQUFFLGNBQWMsRUFBRVgsWUFBYSxDQUFDO0FBQzNELGVBQWVBLFlBQVkifQ==