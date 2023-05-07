// Copyright 2018-2022, University of Colorado Boulder

/**
 * The "Playground" screen of Energy Skate Park: Basics.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import merge from '../../../phet-core/js/merge.js';
import { Image } from '../../../scenery/js/imports.js';
import iconPlaygroundHomescreen_png from '../../images/iconPlaygroundHomescreen_png.js';
import energySkateParkBasics from '../energySkateParkBasics.js';
import EnergySkateParkBasicsStrings from '../EnergySkateParkBasicsStrings.js';
import PlaygroundModel from './model/PlaygroundModel.js';
import PlaygroundScreenView from './view/PlaygroundScreenView.js';
class PlaygroundScreen extends Screen {
  /**
   * @param {EnergySkateParkPreferencesModel} preferencesModel
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(preferencesModel, tandem, options) {
    options = merge({
      name: EnergySkateParkBasicsStrings.screen.trackPlaygroundStringProperty,
      homeScreenIcon: new ScreenIcon(new Image(iconPlaygroundHomescreen_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      tandem: tandem
    }, options);
    super(() => new PlaygroundModel(preferencesModel, tandem.createTandem('model')), model => new PlaygroundScreenView(model, tandem.createTandem('view')), options);
  }
}
energySkateParkBasics.register('PlaygroundScreen', PlaygroundScreen);
export default PlaygroundScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJTY3JlZW5JY29uIiwibWVyZ2UiLCJJbWFnZSIsImljb25QbGF5Z3JvdW5kSG9tZXNjcmVlbl9wbmciLCJlbmVyZ3lTa2F0ZVBhcmtCYXNpY3MiLCJFbmVyZ3lTa2F0ZVBhcmtCYXNpY3NTdHJpbmdzIiwiUGxheWdyb3VuZE1vZGVsIiwiUGxheWdyb3VuZFNjcmVlblZpZXciLCJQbGF5Z3JvdW5kU2NyZWVuIiwiY29uc3RydWN0b3IiLCJwcmVmZXJlbmNlc01vZGVsIiwidGFuZGVtIiwib3B0aW9ucyIsIm5hbWUiLCJzY3JlZW4iLCJ0cmFja1BsYXlncm91bmRTdHJpbmdQcm9wZXJ0eSIsImhvbWVTY3JlZW5JY29uIiwibWF4SWNvbldpZHRoUHJvcG9ydGlvbiIsIm1heEljb25IZWlnaHRQcm9wb3J0aW9uIiwiY3JlYXRlVGFuZGVtIiwibW9kZWwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBsYXlncm91bmRTY3JlZW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIFwiUGxheWdyb3VuZFwiIHNjcmVlbiBvZiBFbmVyZ3kgU2thdGUgUGFyazogQmFzaWNzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgU2NyZWVuIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBTY3JlZW5JY29uIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbkljb24uanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgaWNvblBsYXlncm91bmRIb21lc2NyZWVuX3BuZyBmcm9tICcuLi8uLi9pbWFnZXMvaWNvblBsYXlncm91bmRIb21lc2NyZWVuX3BuZy5qcyc7XHJcbmltcG9ydCBlbmVyZ3lTa2F0ZVBhcmtCYXNpY3MgZnJvbSAnLi4vZW5lcmd5U2thdGVQYXJrQmFzaWNzLmpzJztcclxuaW1wb3J0IEVuZXJneVNrYXRlUGFya0Jhc2ljc1N0cmluZ3MgZnJvbSAnLi4vRW5lcmd5U2thdGVQYXJrQmFzaWNzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBQbGF5Z3JvdW5kTW9kZWwgZnJvbSAnLi9tb2RlbC9QbGF5Z3JvdW5kTW9kZWwuanMnO1xyXG5pbXBvcnQgUGxheWdyb3VuZFNjcmVlblZpZXcgZnJvbSAnLi92aWV3L1BsYXlncm91bmRTY3JlZW5WaWV3LmpzJztcclxuXHJcbmNsYXNzIFBsYXlncm91bmRTY3JlZW4gZXh0ZW5kcyBTY3JlZW4ge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0VuZXJneVNrYXRlUGFya1ByZWZlcmVuY2VzTW9kZWx9IHByZWZlcmVuY2VzTW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwcmVmZXJlbmNlc01vZGVsLCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgbmFtZTogRW5lcmd5U2thdGVQYXJrQmFzaWNzU3RyaW5ncy5zY3JlZW4udHJhY2tQbGF5Z3JvdW5kU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGhvbWVTY3JlZW5JY29uOiBuZXcgU2NyZWVuSWNvbiggbmV3IEltYWdlKCBpY29uUGxheWdyb3VuZEhvbWVzY3JlZW5fcG5nICksIHtcclxuICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAxXHJcbiAgICAgIH0gKSxcclxuXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgICgpID0+IG5ldyBQbGF5Z3JvdW5kTW9kZWwoIHByZWZlcmVuY2VzTW9kZWwsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb2RlbCcgKSApLFxyXG4gICAgICBtb2RlbCA9PiBuZXcgUGxheWdyb3VuZFNjcmVlblZpZXcoIG1vZGVsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlldycgKSApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuZW5lcmd5U2thdGVQYXJrQmFzaWNzLnJlZ2lzdGVyKCAnUGxheWdyb3VuZFNjcmVlbicsIFBsYXlncm91bmRTY3JlZW4gKTtcclxuZXhwb3J0IGRlZmF1bHQgUGxheWdyb3VuZFNjcmVlbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLDZCQUE2QjtBQUNoRCxPQUFPQyxVQUFVLE1BQU0saUNBQWlDO0FBQ3hELE9BQU9DLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyw0QkFBNEIsTUFBTSw4Q0FBOEM7QUFDdkYsT0FBT0MscUJBQXFCLE1BQU0sNkJBQTZCO0FBQy9ELE9BQU9DLDRCQUE0QixNQUFNLG9DQUFvQztBQUM3RSxPQUFPQyxlQUFlLE1BQU0sNEJBQTRCO0FBQ3hELE9BQU9DLG9CQUFvQixNQUFNLGdDQUFnQztBQUVqRSxNQUFNQyxnQkFBZ0IsU0FBU1QsTUFBTSxDQUFDO0VBRXBDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRVUsV0FBV0EsQ0FBRUMsZ0JBQWdCLEVBQUVDLE1BQU0sRUFBRUMsT0FBTyxFQUFHO0lBQy9DQSxPQUFPLEdBQUdYLEtBQUssQ0FBRTtNQUNmWSxJQUFJLEVBQUVSLDRCQUE0QixDQUFDUyxNQUFNLENBQUNDLDZCQUE2QjtNQUN2RUMsY0FBYyxFQUFFLElBQUloQixVQUFVLENBQUUsSUFBSUUsS0FBSyxDQUFFQyw0QkFBNkIsQ0FBQyxFQUFFO1FBQ3pFYyxzQkFBc0IsRUFBRSxDQUFDO1FBQ3pCQyx1QkFBdUIsRUFBRTtNQUMzQixDQUFFLENBQUM7TUFFSFAsTUFBTSxFQUFFQTtJQUNWLENBQUMsRUFBRUMsT0FBUSxDQUFDO0lBRVosS0FBSyxDQUNILE1BQU0sSUFBSU4sZUFBZSxDQUFFSSxnQkFBZ0IsRUFBRUMsTUFBTSxDQUFDUSxZQUFZLENBQUUsT0FBUSxDQUFFLENBQUMsRUFDN0VDLEtBQUssSUFBSSxJQUFJYixvQkFBb0IsQ0FBRWEsS0FBSyxFQUFFVCxNQUFNLENBQUNRLFlBQVksQ0FBRSxNQUFPLENBQUUsQ0FBQyxFQUN6RVAsT0FDRixDQUFDO0VBQ0g7QUFDRjtBQUVBUixxQkFBcUIsQ0FBQ2lCLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRWIsZ0JBQWlCLENBQUM7QUFDdEUsZUFBZUEsZ0JBQWdCIn0=