// Copyright 2018-2023, University of Colorado Boulder

/**
 * main file for the tambo library demo and test harness
 */

import Property from '../../axon/js/Property.js';
import Screen from '../../joist/js/Screen.js';
import ScreenIcon from '../../joist/js/ScreenIcon.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import { LinearGradient, RadialGradient, Rectangle } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import SimLikeComponentsModel from './demo/sim-like-components/model/SimLikeComponentsModel.js';
import SimLikeComponentsScreenView from './demo/sim-like-components/view/SimLikeComponentsScreenView.js';
import AudioCustomPreferencesContent from './demo/AudioCustomPreferencesContent.js';
import TamboKeyboardHelpContent from './demo/TamboKeyboardHelpContent.js';
import TestingScreenView from './demo/testing/view/TestingScreenView.js';
import UIComponentsModel from './demo/ui-components/model/UIComponentsModel.js';
import UIComponentsScreenView from './demo/ui-components/view/UIComponentsScreenView.js';
import TamboStrings from './TamboStrings.js';
import PreferencesModel from '../../joist/js/preferences/PreferencesModel.js';
// constants
const SOUND_OPTIONS_DIALOG_CONTENT = new AudioCustomPreferencesContent();
class Model {
  reset() {/* nothing to do */}
}
const simOptions = {
  credits: {
    leadDesign: 'John Blanco'
  },
  preferencesModel: new PreferencesModel({
    simulationOptions: {
      customPreferences: [{
        // In this demo they get added to the "General" tab since there are lots of contents already in the Audio tab.
        // For development purposes there is more space for custom controls in the "General" tab.
        createContent: () => SOUND_OPTIONS_DIALOG_CONTENT
      }]
    }
  })
};

// helper function to create screen icons that aren't too bland
function createScreenIcon(color1, color2, gradientType) {
  let colorGradient;
  if (gradientType === 'radial') {
    colorGradient = new RadialGradient(Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width / 2, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height / 2, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width / 2, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height / 2, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width * 0.67).addColorStop(0, color1).addColorStop(1, color2);
  } else {
    colorGradient = new LinearGradient(0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, 0).addColorStop(0, color1).addColorStop(1, color2);
  }
  return new Rectangle(0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
    fill: colorGradient
  });
}
simLauncher.launch(() => {
  new Sim(TamboStrings.tambo.titleStringProperty, [
  // sim-like components screen
  new Screen(() => new SimLikeComponentsModel(), model => new SimLikeComponentsScreenView(model), {
    name: new Property('Sim-Like Components'),
    backgroundColorProperty: new Property('#f3fff3'),
    homeScreenIcon: new ScreenIcon(createScreenIcon('#a31515', '#b75e2a', 'radial'), {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1
    }),
    createKeyboardHelpNode: () => new TamboKeyboardHelpContent(),
    tandem: Tandem.OPT_OUT
  }),
  // UI-components screen
  new Screen(() => new UIComponentsModel(), model => new UIComponentsScreenView(model), {
    name: new Property('UI Components'),
    backgroundColorProperty: new Property('#fff5ba'),
    homeScreenIcon: new ScreenIcon(createScreenIcon('#71ddbf', '#8d49e5', 'linear'), {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1
    }),
    createKeyboardHelpNode: () => new TamboKeyboardHelpContent(),
    tandem: Tandem.OPT_OUT
  }),
  // screen to test and demonstrate more unusual and complex sound generators
  new Screen(() => new Model(),
  // no model needed, return a stub
  () => new TestingScreenView(), {
    name: new Property('Testing'),
    backgroundColorProperty: new Property('#F0F8FF'),
    homeScreenIcon: new ScreenIcon(createScreenIcon('#ADFF2F', '#FFDAB9', 'radial'), {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1
    }),
    createKeyboardHelpNode: () => new TamboKeyboardHelpContent(),
    tandem: Tandem.OPT_OUT
  })], simOptions).start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJTaW0iLCJzaW1MYXVuY2hlciIsIkxpbmVhckdyYWRpZW50IiwiUmFkaWFsR3JhZGllbnQiLCJSZWN0YW5nbGUiLCJUYW5kZW0iLCJTaW1MaWtlQ29tcG9uZW50c01vZGVsIiwiU2ltTGlrZUNvbXBvbmVudHNTY3JlZW5WaWV3IiwiQXVkaW9DdXN0b21QcmVmZXJlbmNlc0NvbnRlbnQiLCJUYW1ib0tleWJvYXJkSGVscENvbnRlbnQiLCJUZXN0aW5nU2NyZWVuVmlldyIsIlVJQ29tcG9uZW50c01vZGVsIiwiVUlDb21wb25lbnRzU2NyZWVuVmlldyIsIlRhbWJvU3RyaW5ncyIsIlByZWZlcmVuY2VzTW9kZWwiLCJTT1VORF9PUFRJT05TX0RJQUxPR19DT05URU5UIiwiTW9kZWwiLCJyZXNldCIsInNpbU9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInByZWZlcmVuY2VzTW9kZWwiLCJzaW11bGF0aW9uT3B0aW9ucyIsImN1c3RvbVByZWZlcmVuY2VzIiwiY3JlYXRlQ29udGVudCIsImNyZWF0ZVNjcmVlbkljb24iLCJjb2xvcjEiLCJjb2xvcjIiLCJncmFkaWVudFR5cGUiLCJjb2xvckdyYWRpZW50IiwiTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUiLCJ3aWR0aCIsImhlaWdodCIsImFkZENvbG9yU3RvcCIsImZpbGwiLCJsYXVuY2giLCJ0YW1ibyIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJtb2RlbCIsIm5hbWUiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsImhvbWVTY3JlZW5JY29uIiwibWF4SWNvbldpZHRoUHJvcG9ydGlvbiIsIm1heEljb25IZWlnaHRQcm9wb3J0aW9uIiwiY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZSIsInRhbmRlbSIsIk9QVF9PVVQiLCJzdGFydCJdLCJzb3VyY2VzIjpbInRhbWJvLW1haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogbWFpbiBmaWxlIGZvciB0aGUgdGFtYm8gbGlicmFyeSBkZW1vIGFuZCB0ZXN0IGhhcm5lc3NcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTY3JlZW4gZnJvbSAnLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi4vLi4vam9pc3QvanMvU2NyZWVuSWNvbi5qcyc7XHJcbmltcG9ydCBTaW0sIHsgU2ltT3B0aW9ucyB9IGZyb20gJy4uLy4uL2pvaXN0L2pzL1NpbS5qcyc7XHJcbmltcG9ydCBzaW1MYXVuY2hlciBmcm9tICcuLi8uLi9qb2lzdC9qcy9zaW1MYXVuY2hlci5qcyc7XHJcbmltcG9ydCB7IExpbmVhckdyYWRpZW50LCBSYWRpYWxHcmFkaWVudCwgUmVjdGFuZ2xlLCBUQ29sb3IgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgU2ltTGlrZUNvbXBvbmVudHNNb2RlbCBmcm9tICcuL2RlbW8vc2ltLWxpa2UtY29tcG9uZW50cy9tb2RlbC9TaW1MaWtlQ29tcG9uZW50c01vZGVsLmpzJztcclxuaW1wb3J0IFNpbUxpa2VDb21wb25lbnRzU2NyZWVuVmlldyBmcm9tICcuL2RlbW8vc2ltLWxpa2UtY29tcG9uZW50cy92aWV3L1NpbUxpa2VDb21wb25lbnRzU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBBdWRpb0N1c3RvbVByZWZlcmVuY2VzQ29udGVudCBmcm9tICcuL2RlbW8vQXVkaW9DdXN0b21QcmVmZXJlbmNlc0NvbnRlbnQuanMnO1xyXG5pbXBvcnQgVGFtYm9LZXlib2FyZEhlbHBDb250ZW50IGZyb20gJy4vZGVtby9UYW1ib0tleWJvYXJkSGVscENvbnRlbnQuanMnO1xyXG5pbXBvcnQgVGVzdGluZ1NjcmVlblZpZXcgZnJvbSAnLi9kZW1vL3Rlc3Rpbmcvdmlldy9UZXN0aW5nU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBVSUNvbXBvbmVudHNNb2RlbCBmcm9tICcuL2RlbW8vdWktY29tcG9uZW50cy9tb2RlbC9VSUNvbXBvbmVudHNNb2RlbC5qcyc7XHJcbmltcG9ydCBVSUNvbXBvbmVudHNTY3JlZW5WaWV3IGZyb20gJy4vZGVtby91aS1jb21wb25lbnRzL3ZpZXcvVUlDb21wb25lbnRzU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBUYW1ib1N0cmluZ3MgZnJvbSAnLi9UYW1ib1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgUHJlZmVyZW5jZXNNb2RlbCBmcm9tICcuLi8uLi9qb2lzdC9qcy9wcmVmZXJlbmNlcy9QcmVmZXJlbmNlc01vZGVsLmpzJztcclxuaW1wb3J0IFRNb2RlbCBmcm9tICcuLi8uLi9qb2lzdC9qcy9UTW9kZWwuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFNPVU5EX09QVElPTlNfRElBTE9HX0NPTlRFTlQgPSBuZXcgQXVkaW9DdXN0b21QcmVmZXJlbmNlc0NvbnRlbnQoKTtcclxuXHJcbmNsYXNzIE1vZGVsIGltcGxlbWVudHMgVE1vZGVsIHtcclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7IC8qIG5vdGhpbmcgdG8gZG8gKi8gfVxyXG59XHJcblxyXG5jb25zdCBzaW1PcHRpb25zOiBTaW1PcHRpb25zID0ge1xyXG4gIGNyZWRpdHM6IHtcclxuICAgIGxlYWREZXNpZ246ICdKb2huIEJsYW5jbydcclxuICB9LFxyXG4gIHByZWZlcmVuY2VzTW9kZWw6IG5ldyBQcmVmZXJlbmNlc01vZGVsKCB7XHJcbiAgICBzaW11bGF0aW9uT3B0aW9uczoge1xyXG4gICAgICBjdXN0b21QcmVmZXJlbmNlczogWyB7XHJcblxyXG4gICAgICAgIC8vIEluIHRoaXMgZGVtbyB0aGV5IGdldCBhZGRlZCB0byB0aGUgXCJHZW5lcmFsXCIgdGFiIHNpbmNlIHRoZXJlIGFyZSBsb3RzIG9mIGNvbnRlbnRzIGFscmVhZHkgaW4gdGhlIEF1ZGlvIHRhYi5cclxuICAgICAgICAvLyBGb3IgZGV2ZWxvcG1lbnQgcHVycG9zZXMgdGhlcmUgaXMgbW9yZSBzcGFjZSBmb3IgY3VzdG9tIGNvbnRyb2xzIGluIHRoZSBcIkdlbmVyYWxcIiB0YWIuXHJcbiAgICAgICAgY3JlYXRlQ29udGVudDogKCkgPT4gU09VTkRfT1BUSU9OU19ESUFMT0dfQ09OVEVOVFxyXG4gICAgICB9IF1cclxuICAgIH1cclxuICB9IClcclxufTtcclxuXHJcbi8vIGhlbHBlciBmdW5jdGlvbiB0byBjcmVhdGUgc2NyZWVuIGljb25zIHRoYXQgYXJlbid0IHRvbyBibGFuZFxyXG5mdW5jdGlvbiBjcmVhdGVTY3JlZW5JY29uKCBjb2xvcjE6IFRDb2xvciwgY29sb3IyOiBUQ29sb3IsIGdyYWRpZW50VHlwZTogc3RyaW5nICk6IFJlY3RhbmdsZSB7XHJcblxyXG4gIGxldCBjb2xvckdyYWRpZW50O1xyXG4gIGlmICggZ3JhZGllbnRUeXBlID09PSAncmFkaWFsJyApIHtcclxuICAgIGNvbG9yR3JhZGllbnQgPSBuZXcgUmFkaWFsR3JhZGllbnQoXHJcbiAgICAgIFNjcmVlbi5NSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRS53aWR0aCAvIDIsXHJcbiAgICAgIFNjcmVlbi5NSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRS5oZWlnaHQgLyAyLFxyXG4gICAgICAwLFxyXG4gICAgICBTY3JlZW4uTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUud2lkdGggLyAyLFxyXG4gICAgICBTY3JlZW4uTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUuaGVpZ2h0IC8gMixcclxuICAgICAgU2NyZWVuLk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLndpZHRoICogMC42N1xyXG4gICAgKS5hZGRDb2xvclN0b3AoIDAsIGNvbG9yMSApLmFkZENvbG9yU3RvcCggMSwgY29sb3IyICk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgY29sb3JHcmFkaWVudCA9IG5ldyBMaW5lYXJHcmFkaWVudCggMCwgMCwgU2NyZWVuLk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLndpZHRoLCAwIClcclxuICAgICAgLmFkZENvbG9yU3RvcCggMCwgY29sb3IxIClcclxuICAgICAgLmFkZENvbG9yU3RvcCggMSwgY29sb3IyICk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbmV3IFJlY3RhbmdsZShcclxuICAgIDAsXHJcbiAgICAwLFxyXG4gICAgU2NyZWVuLk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLndpZHRoLFxyXG4gICAgU2NyZWVuLk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLmhlaWdodCxcclxuICAgIHsgZmlsbDogY29sb3JHcmFkaWVudCB9XHJcbiAgKTtcclxufVxyXG5cclxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XHJcbiAgbmV3IFNpbSggVGFtYm9TdHJpbmdzLnRhbWJvLnRpdGxlU3RyaW5nUHJvcGVydHksIFtcclxuXHJcbiAgICAvLyBzaW0tbGlrZSBjb21wb25lbnRzIHNjcmVlblxyXG4gICAgbmV3IFNjcmVlbihcclxuICAgICAgKCAoKSA9PiBuZXcgU2ltTGlrZUNvbXBvbmVudHNNb2RlbCgpICksXHJcbiAgICAgICggbW9kZWwgPT4gbmV3IFNpbUxpa2VDb21wb25lbnRzU2NyZWVuVmlldyggbW9kZWwgKSApLFxyXG4gICAgICB7XHJcbiAgICAgICAgbmFtZTogbmV3IFByb3BlcnR5KCAnU2ltLUxpa2UgQ29tcG9uZW50cycgKSxcclxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCAnI2YzZmZmMycgKSxcclxuICAgICAgICBob21lU2NyZWVuSWNvbjogbmV3IFNjcmVlbkljb24oIGNyZWF0ZVNjcmVlbkljb24oICcjYTMxNTE1JywgJyNiNzVlMmEnLCAncmFkaWFsJyApLCB7XHJcbiAgICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZTogKCkgPT4gbmV3IFRhbWJvS2V5Ym9hcmRIZWxwQ29udGVudCgpLFxyXG4gICAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgICAgfVxyXG4gICAgKSxcclxuXHJcbiAgICAvLyBVSS1jb21wb25lbnRzIHNjcmVlblxyXG4gICAgbmV3IFNjcmVlbihcclxuICAgICAgKCAoKSA9PiBuZXcgVUlDb21wb25lbnRzTW9kZWwoKSApLFxyXG4gICAgICAoIG1vZGVsID0+IG5ldyBVSUNvbXBvbmVudHNTY3JlZW5WaWV3KCBtb2RlbCApICksXHJcbiAgICAgIHtcclxuICAgICAgICBuYW1lOiBuZXcgUHJvcGVydHkoICdVSSBDb21wb25lbnRzJyApLFxyXG4gICAgICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBuZXcgUHJvcGVydHkoICcjZmZmNWJhJyApLFxyXG4gICAgICAgIGhvbWVTY3JlZW5JY29uOiBuZXcgU2NyZWVuSWNvbiggY3JlYXRlU2NyZWVuSWNvbiggJyM3MWRkYmYnLCAnIzhkNDllNScsICdsaW5lYXInICksIHtcclxuICAgICAgICAgIG1heEljb25XaWR0aFByb3BvcnRpb246IDEsXHJcbiAgICAgICAgICBtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbjogMVxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICBjcmVhdGVLZXlib2FyZEhlbHBOb2RlOiAoKSA9PiBuZXcgVGFtYm9LZXlib2FyZEhlbHBDb250ZW50KCksXHJcbiAgICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgICB9XHJcbiAgICApLFxyXG5cclxuICAgIC8vIHNjcmVlbiB0byB0ZXN0IGFuZCBkZW1vbnN0cmF0ZSBtb3JlIHVudXN1YWwgYW5kIGNvbXBsZXggc291bmQgZ2VuZXJhdG9yc1xyXG4gICAgbmV3IFNjcmVlbihcclxuICAgICAgKCAoKSA9PiBuZXcgTW9kZWwoKSApLCAvLyBubyBtb2RlbCBuZWVkZWQsIHJldHVybiBhIHN0dWJcclxuICAgICAgKCAoKSA9PiBuZXcgVGVzdGluZ1NjcmVlblZpZXcoKSApLFxyXG4gICAgICB7XHJcbiAgICAgICAgbmFtZTogbmV3IFByb3BlcnR5KCAnVGVzdGluZycgKSxcclxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCAnI0YwRjhGRicgKSxcclxuICAgICAgICBob21lU2NyZWVuSWNvbjogbmV3IFNjcmVlbkljb24oIGNyZWF0ZVNjcmVlbkljb24oICcjQURGRjJGJywgJyNGRkRBQjknLCAncmFkaWFsJyApLCB7XHJcbiAgICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZTogKCkgPT4gbmV3IFRhbWJvS2V5Ym9hcmRIZWxwQ29udGVudCgpLFxyXG4gICAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgICAgfVxyXG4gICAgKVxyXG5cclxuICBdLCBzaW1PcHRpb25zICkuc3RhcnQoKTtcclxuXHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sMkJBQTJCO0FBQ2hELE9BQU9DLE1BQU0sTUFBTSwwQkFBMEI7QUFDN0MsT0FBT0MsVUFBVSxNQUFNLDhCQUE4QjtBQUNyRCxPQUFPQyxHQUFHLE1BQXNCLHVCQUF1QjtBQUN2RCxPQUFPQyxXQUFXLE1BQU0sK0JBQStCO0FBQ3ZELFNBQVNDLGNBQWMsRUFBRUMsY0FBYyxFQUFFQyxTQUFTLFFBQWdCLDZCQUE2QjtBQUMvRixPQUFPQyxNQUFNLE1BQU0s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