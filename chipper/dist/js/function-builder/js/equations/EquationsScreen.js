// Copyright 2015-2023, University of Colorado Boulder

/**
 * The 'Equations' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import FBColors from '../common/FBColors.js';
import FBIconFactory from '../common/view/FBIconFactory.js';
import functionBuilder from '../functionBuilder.js';
import FunctionBuilderStrings from '../FunctionBuilderStrings.js';
import EquationsModel from './model/EquationsModel.js';
import EquationsScreenView from './view/EquationsScreenView.js';
export default class EquationsScreen extends Screen {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    const options = {
      name: FunctionBuilderStrings.screen.equationsStringProperty,
      backgroundColorProperty: new Property(FBColors.EQUATIONS_SCREEN_BACKGROUND),
      // {Property.<Color|string>}
      homeScreenIcon: FBIconFactory.createEquationsScreenIcon(),
      tandem: tandem
    };
    super(() => new EquationsModel(), model => new EquationsScreenView(model), options);
  }
}
functionBuilder.register('EquationsScreen', EquationsScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIkZCQ29sb3JzIiwiRkJJY29uRmFjdG9yeSIsImZ1bmN0aW9uQnVpbGRlciIsIkZ1bmN0aW9uQnVpbGRlclN0cmluZ3MiLCJFcXVhdGlvbnNNb2RlbCIsIkVxdWF0aW9uc1NjcmVlblZpZXciLCJFcXVhdGlvbnNTY3JlZW4iLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsIm9wdGlvbnMiLCJuYW1lIiwic2NyZWVuIiwiZXF1YXRpb25zU3RyaW5nUHJvcGVydHkiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsIkVRVUFUSU9OU19TQ1JFRU5fQkFDS0dST1VORCIsImhvbWVTY3JlZW5JY29uIiwiY3JlYXRlRXF1YXRpb25zU2NyZWVuSWNvbiIsIm1vZGVsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFcXVhdGlvbnNTY3JlZW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlICdFcXVhdGlvbnMnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTY3JlZW4gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IEZCQ29sb3JzIGZyb20gJy4uL2NvbW1vbi9GQkNvbG9ycy5qcyc7XHJcbmltcG9ydCBGQkljb25GYWN0b3J5IGZyb20gJy4uL2NvbW1vbi92aWV3L0ZCSWNvbkZhY3RvcnkuanMnO1xyXG5pbXBvcnQgZnVuY3Rpb25CdWlsZGVyIGZyb20gJy4uL2Z1bmN0aW9uQnVpbGRlci5qcyc7XHJcbmltcG9ydCBGdW5jdGlvbkJ1aWxkZXJTdHJpbmdzIGZyb20gJy4uL0Z1bmN0aW9uQnVpbGRlclN0cmluZ3MuanMnO1xyXG5pbXBvcnQgRXF1YXRpb25zTW9kZWwgZnJvbSAnLi9tb2RlbC9FcXVhdGlvbnNNb2RlbC5qcyc7XHJcbmltcG9ydCBFcXVhdGlvbnNTY3JlZW5WaWV3IGZyb20gJy4vdmlldy9FcXVhdGlvbnNTY3JlZW5WaWV3LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVxdWF0aW9uc1NjcmVlbiBleHRlbmRzIFNjcmVlbiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgIG5hbWU6IEZ1bmN0aW9uQnVpbGRlclN0cmluZ3Muc2NyZWVuLmVxdWF0aW9uc1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBGQkNvbG9ycy5FUVVBVElPTlNfU0NSRUVOX0JBQ0tHUk9VTkQgKSwgLy8ge1Byb3BlcnR5LjxDb2xvcnxzdHJpbmc+fVxyXG4gICAgICBob21lU2NyZWVuSWNvbjogRkJJY29uRmFjdG9yeS5jcmVhdGVFcXVhdGlvbnNTY3JlZW5JY29uKCksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9O1xyXG5cclxuICAgIHN1cGVyKFxyXG4gICAgICAoKSA9PiBuZXcgRXF1YXRpb25zTW9kZWwoKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IEVxdWF0aW9uc1NjcmVlblZpZXcoIG1vZGVsICksXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbkJ1aWxkZXIucmVnaXN0ZXIoICdFcXVhdGlvbnNTY3JlZW4nLCBFcXVhdGlvbnNTY3JlZW4gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLDhCQUE4QjtBQUNuRCxPQUFPQyxNQUFNLE1BQU0sNkJBQTZCO0FBQ2hELE9BQU9DLFFBQVEsTUFBTSx1QkFBdUI7QUFDNUMsT0FBT0MsYUFBYSxNQUFNLGlDQUFpQztBQUMzRCxPQUFPQyxlQUFlLE1BQU0sdUJBQXVCO0FBQ25ELE9BQU9DLHNCQUFzQixNQUFNLDhCQUE4QjtBQUNqRSxPQUFPQyxjQUFjLE1BQU0sMkJBQTJCO0FBQ3RELE9BQU9DLG1CQUFtQixNQUFNLCtCQUErQjtBQUUvRCxlQUFlLE1BQU1DLGVBQWUsU0FBU1AsTUFBTSxDQUFDO0VBRWxEO0FBQ0Y7QUFDQTtFQUNFUSxXQUFXQSxDQUFFQyxNQUFNLEVBQUc7SUFFcEIsTUFBTUMsT0FBTyxHQUFHO01BQ2RDLElBQUksRUFBRVAsc0JBQXNCLENBQUNRLE1BQU0sQ0FBQ0MsdUJBQXVCO01BQzNEQyx1QkFBdUIsRUFBRSxJQUFJZixRQUFRLENBQUVFLFFBQVEsQ0FBQ2MsMkJBQTRCLENBQUM7TUFBRTtNQUMvRUMsY0FBYyxFQUFFZCxhQUFhLENBQUNlLHlCQUF5QixDQUFDLENBQUM7TUFDekRSLE1BQU0sRUFBRUE7SUFDVixDQUFDO0lBRUQsS0FBSyxDQUNILE1BQU0sSUFBSUosY0FBYyxDQUFDLENBQUMsRUFDMUJhLEtBQUssSUFBSSxJQUFJWixtQkFBbUIsQ0FBRVksS0FBTSxDQUFDLEVBQ3pDUixPQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFQLGVBQWUsQ0FBQ2dCLFFBQVEsQ0FBRSxpQkFBaUIsRUFBRVosZUFBZ0IsQ0FBQyJ9