// Copyright 2015-2023, University of Colorado Boulder

/**
 * View for demonstrating dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import BasicActionsKeyboardHelpSection from '../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import { HBox, VBox } from '../../../scenery/js/imports.js';
import Panel from '../../../sun/js/Panel.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import KeyboardHelpButton from '../KeyboardHelpButton.js';
import ScreenView from '../ScreenView.js';
import NavigationBarPreferencesButton from '../preferences/NavigationBarPreferencesButton.js';
import PreferencesModel from '../preferences/PreferencesModel.js';
import PreferencesDialogDemoSection from './PreferencesDialogDemoSection.js';
class DialogsScreenView extends ScreenView {
  constructor(providedOptions) {
    super(providedOptions);
    const sim = phet.joist.sim;
    const keyboardHelpDialogContent = new BasicActionsKeyboardHelpSection();
    const fakeScreen = {
      createKeyboardHelpNode: () => keyboardHelpDialogContent,
      tandem: Tandem.OPTIONAL
    };
    const keyboardHelpButton = new KeyboardHelpButton([fakeScreen], new Property(fakeScreen), sim.lookAndFeel.navigationBarFillProperty, {
      tandem: Tandem.GENERAL_VIEW.createTandem('keyboardHelpButton')
    });
    const preferencesModel = new PreferencesModel({
      simulationOptions: {
        customPreferences: [{
          createContent: tandem => new PreferencesDialogDemoSection()
        }]
      }
    });
    const preferencesButton = new NavigationBarPreferencesButton(preferencesModel, sim.lookAndFeel.navigationBarFillProperty, {
      tandem: Tandem.GENERAL_VIEW.createTandem('preferencesButton')
    });
    const buttonsHBox = new HBox({
      children: [keyboardHelpButton, preferencesButton]
    });
    buttonsHBox.setScaleMagnitude(2);
    // Since KeyboardHelpButton adapts its color to the navigation bar, put the button in a panel that's the same
    // color as the navigation bar. You can test this by toggling sim.lookAndFeel.backgroundColorProperty
    // between 'white' and 'black' is the browser console.
    const keyboardHelpPanel = new Panel(buttonsHBox, {
      fill: sim.lookAndFeel.navigationBarFillProperty.value
    });
    sim.lookAndFeel.navigationBarFillProperty.link(navigationBarFill => {
      keyboardHelpPanel.setFill(navigationBarFill);
    });
    this.addChild(new VBox({
      children: [keyboardHelpPanel],
      spacing: 20,
      center: this.layoutBounds.center
    }));
  }
}
joist.register('DialogsScreenView', DialogsScreenView);
export default DialogsScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkJhc2ljQWN0aW9uc0tleWJvYXJkSGVscFNlY3Rpb24iLCJIQm94IiwiVkJveCIsIlBhbmVsIiwiVGFuZGVtIiwiam9pc3QiLCJLZXlib2FyZEhlbHBCdXR0b24iLCJTY3JlZW5WaWV3IiwiTmF2aWdhdGlvbkJhclByZWZlcmVuY2VzQnV0dG9uIiwiUHJlZmVyZW5jZXNNb2RlbCIsIlByZWZlcmVuY2VzRGlhbG9nRGVtb1NlY3Rpb24iLCJEaWFsb2dzU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwic2ltIiwicGhldCIsImtleWJvYXJkSGVscERpYWxvZ0NvbnRlbnQiLCJmYWtlU2NyZWVuIiwiY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZSIsInRhbmRlbSIsIk9QVElPTkFMIiwia2V5Ym9hcmRIZWxwQnV0dG9uIiwibG9va0FuZEZlZWwiLCJuYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5IiwiR0VORVJBTF9WSUVXIiwiY3JlYXRlVGFuZGVtIiwicHJlZmVyZW5jZXNNb2RlbCIsInNpbXVsYXRpb25PcHRpb25zIiwiY3VzdG9tUHJlZmVyZW5jZXMiLCJjcmVhdGVDb250ZW50IiwicHJlZmVyZW5jZXNCdXR0b24iLCJidXR0b25zSEJveCIsImNoaWxkcmVuIiwic2V0U2NhbGVNYWduaXR1ZGUiLCJrZXlib2FyZEhlbHBQYW5lbCIsImZpbGwiLCJ2YWx1ZSIsImxpbmsiLCJuYXZpZ2F0aW9uQmFyRmlsbCIsInNldEZpbGwiLCJhZGRDaGlsZCIsInNwYWNpbmciLCJjZW50ZXIiLCJsYXlvdXRCb3VuZHMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkRpYWxvZ3NTY3JlZW5WaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZpZXcgZm9yIGRlbW9uc3RyYXRpbmcgZGlhbG9ncy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCYXNpY0FjdGlvbnNLZXlib2FyZEhlbHBTZWN0aW9uIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9oZWxwL0Jhc2ljQWN0aW9uc0tleWJvYXJkSGVscFNlY3Rpb24uanMnO1xyXG5pbXBvcnQgeyBIQm94LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBqb2lzdCBmcm9tICcuLi9qb2lzdC5qcyc7XHJcbmltcG9ydCBLZXlib2FyZEhlbHBCdXR0b24gZnJvbSAnLi4vS2V5Ym9hcmRIZWxwQnV0dG9uLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcsIHsgU2NyZWVuVmlld09wdGlvbnMgfSBmcm9tICcuLi9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IHsgQW55U2NyZWVuIH0gZnJvbSAnLi4vU2NyZWVuLmpzJztcclxuaW1wb3J0IFNpbSBmcm9tICcuLi9TaW0uanMnO1xyXG5pbXBvcnQgTmF2aWdhdGlvbkJhclByZWZlcmVuY2VzQnV0dG9uIGZyb20gJy4uL3ByZWZlcmVuY2VzL05hdmlnYXRpb25CYXJQcmVmZXJlbmNlc0J1dHRvbi5qcyc7XHJcbmltcG9ydCBQcmVmZXJlbmNlc01vZGVsIGZyb20gJy4uL3ByZWZlcmVuY2VzL1ByZWZlcmVuY2VzTW9kZWwuanMnO1xyXG5pbXBvcnQgUHJlZmVyZW5jZXNEaWFsb2dEZW1vU2VjdGlvbiBmcm9tICcuL1ByZWZlcmVuY2VzRGlhbG9nRGVtb1NlY3Rpb24uanMnO1xyXG5cclxuY2xhc3MgRGlhbG9nc1NjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogU2NyZWVuVmlld09wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHNpbSA9IHBoZXQuam9pc3Quc2ltIGFzIFNpbTtcclxuXHJcbiAgICBjb25zdCBrZXlib2FyZEhlbHBEaWFsb2dDb250ZW50ID0gbmV3IEJhc2ljQWN0aW9uc0tleWJvYXJkSGVscFNlY3Rpb24oKTtcclxuXHJcbiAgICBjb25zdCBmYWtlU2NyZWVuID0geyBjcmVhdGVLZXlib2FyZEhlbHBOb2RlOiAoKSA9PiBrZXlib2FyZEhlbHBEaWFsb2dDb250ZW50LCB0YW5kZW06IFRhbmRlbS5PUFRJT05BTCB9IGFzIHVua25vd24gYXMgQW55U2NyZWVuO1xyXG4gICAgY29uc3Qga2V5Ym9hcmRIZWxwQnV0dG9uID0gbmV3IEtleWJvYXJkSGVscEJ1dHRvbihcclxuICAgICAgWyBmYWtlU2NyZWVuIF0sXHJcbiAgICAgIG5ldyBQcm9wZXJ0eSggZmFrZVNjcmVlbiApLFxyXG4gICAgICBzaW0ubG9va0FuZEZlZWwubmF2aWdhdGlvbkJhckZpbGxQcm9wZXJ0eSwge1xyXG4gICAgICAgIHRhbmRlbTogVGFuZGVtLkdFTkVSQUxfVklFVy5jcmVhdGVUYW5kZW0oICdrZXlib2FyZEhlbHBCdXR0b24nIClcclxuICAgICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHByZWZlcmVuY2VzTW9kZWwgPSBuZXcgUHJlZmVyZW5jZXNNb2RlbCgge1xyXG4gICAgICBzaW11bGF0aW9uT3B0aW9uczoge1xyXG4gICAgICAgIGN1c3RvbVByZWZlcmVuY2VzOiBbIHtcclxuICAgICAgICAgIGNyZWF0ZUNvbnRlbnQ6IHRhbmRlbSA9PiBuZXcgUHJlZmVyZW5jZXNEaWFsb2dEZW1vU2VjdGlvbigpXHJcbiAgICAgICAgfSBdXHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHByZWZlcmVuY2VzQnV0dG9uID0gbmV3IE5hdmlnYXRpb25CYXJQcmVmZXJlbmNlc0J1dHRvbihcclxuICAgICAgcHJlZmVyZW5jZXNNb2RlbCxcclxuICAgICAgc2ltLmxvb2tBbmRGZWVsLm5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHksIHtcclxuICAgICAgICB0YW5kZW06IFRhbmRlbS5HRU5FUkFMX1ZJRVcuY3JlYXRlVGFuZGVtKCAncHJlZmVyZW5jZXNCdXR0b24nIClcclxuICAgICAgfSApO1xyXG5cclxuXHJcbiAgICBjb25zdCBidXR0b25zSEJveCA9IG5ldyBIQm94KCB7IGNoaWxkcmVuOiBbIGtleWJvYXJkSGVscEJ1dHRvbiwgcHJlZmVyZW5jZXNCdXR0b24gXSB9ICk7XHJcbiAgICBidXR0b25zSEJveC5zZXRTY2FsZU1hZ25pdHVkZSggMiApO1xyXG4gICAgLy8gU2luY2UgS2V5Ym9hcmRIZWxwQnV0dG9uIGFkYXB0cyBpdHMgY29sb3IgdG8gdGhlIG5hdmlnYXRpb24gYmFyLCBwdXQgdGhlIGJ1dHRvbiBpbiBhIHBhbmVsIHRoYXQncyB0aGUgc2FtZVxyXG4gICAgLy8gY29sb3IgYXMgdGhlIG5hdmlnYXRpb24gYmFyLiBZb3UgY2FuIHRlc3QgdGhpcyBieSB0b2dnbGluZyBzaW0ubG9va0FuZEZlZWwuYmFja2dyb3VuZENvbG9yUHJvcGVydHlcclxuICAgIC8vIGJldHdlZW4gJ3doaXRlJyBhbmQgJ2JsYWNrJyBpcyB0aGUgYnJvd3NlciBjb25zb2xlLlxyXG4gICAgY29uc3Qga2V5Ym9hcmRIZWxwUGFuZWwgPSBuZXcgUGFuZWwoIGJ1dHRvbnNIQm94LCB7XHJcbiAgICAgIGZpbGw6IHNpbS5sb29rQW5kRmVlbC5uYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5LnZhbHVlXHJcbiAgICB9ICk7XHJcbiAgICBzaW0ubG9va0FuZEZlZWwubmF2aWdhdGlvbkJhckZpbGxQcm9wZXJ0eS5saW5rKCBuYXZpZ2F0aW9uQmFyRmlsbCA9PiB7XHJcbiAgICAgIGtleWJvYXJkSGVscFBhbmVsLnNldEZpbGwoIG5hdmlnYXRpb25CYXJGaWxsICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFZCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBrZXlib2FyZEhlbHBQYW5lbFxyXG4gICAgICBdLFxyXG4gICAgICBzcGFjaW5nOiAyMCxcclxuICAgICAgY2VudGVyOiB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJcclxuICAgIH0gKSApO1xyXG4gIH1cclxufVxyXG5cclxuam9pc3QucmVnaXN0ZXIoICdEaWFsb2dzU2NyZWVuVmlldycsIERpYWxvZ3NTY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IERpYWxvZ3NTY3JlZW5WaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLCtCQUErQixNQUFNLDJFQUEyRTtBQUN2SCxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxnQ0FBZ0M7QUFDM0QsT0FBT0MsS0FBSyxNQUFNLDBCQUEwQjtBQUM1QyxPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLEtBQUssTUFBTSxhQUFhO0FBQy9CLE9BQU9DLGtCQUFrQixNQUFNLDBCQUEwQjtBQUN6RCxPQUFPQyxVQUFVLE1BQTZCLGtCQUFrQjtBQUdoRSxPQUFPQyw4QkFBOEIsTUFBTSxrREFBa0Q7QUFDN0YsT0FBT0MsZ0JBQWdCLE1BQU0sb0NBQW9DO0FBQ2pFLE9BQU9DLDRCQUE0QixNQUFNLG1DQUFtQztBQUU1RSxNQUFNQyxpQkFBaUIsU0FBU0osVUFBVSxDQUFDO0VBQ2xDSyxXQUFXQSxDQUFFQyxlQUFrQyxFQUFHO0lBRXZELEtBQUssQ0FBRUEsZUFBZ0IsQ0FBQztJQUV4QixNQUFNQyxHQUFHLEdBQUdDLElBQUksQ0FBQ1YsS0FBSyxDQUFDUyxHQUFVO0lBRWpDLE1BQU1FLHlCQUF5QixHQUFHLElBQUloQiwrQkFBK0IsQ0FBQyxDQUFDO0lBRXZFLE1BQU1pQixVQUFVLEdBQUc7TUFBRUMsc0JBQXNCLEVBQUVBLENBQUEsS0FBTUYseUJBQXlCO01BQUVHLE1BQU0sRUFBRWYsTUFBTSxDQUFDZ0I7SUFBUyxDQUF5QjtJQUMvSCxNQUFNQyxrQkFBa0IsR0FBRyxJQUFJZixrQkFBa0IsQ0FDL0MsQ0FBRVcsVUFBVSxDQUFFLEVBQ2QsSUFBSWxCLFFBQVEsQ0FBRWtCLFVBQVcsQ0FBQyxFQUMxQkgsR0FBRyxDQUFDUSxXQUFXLENBQUNDLHlCQUF5QixFQUFFO01BQ3pDSixNQUFNLEVBQUVmLE1BQU0sQ0FBQ29CLFlBQVksQ0FBQ0MsWUFBWSxDQUFFLG9CQUFxQjtJQUNqRSxDQUFFLENBQUM7SUFFTCxNQUFNQyxnQkFBZ0IsR0FBRyxJQUFJakIsZ0JBQWdCLENBQUU7TUFDN0NrQixpQkFBaUIsRUFBRTtRQUNqQkMsaUJBQWlCLEVBQUUsQ0FBRTtVQUNuQkMsYUFBYSxFQUFFVixNQUFNLElBQUksSUFBSVQsNEJBQTRCLENBQUM7UUFDNUQsQ0FBQztNQUNIO0lBQ0YsQ0FBRSxDQUFDO0lBQ0gsTUFBTW9CLGlCQUFpQixHQUFHLElBQUl0Qiw4QkFBOEIsQ0FDMURrQixnQkFBZ0IsRUFDaEJaLEdBQUcsQ0FBQ1EsV0FBVyxDQUFDQyx5QkFBeUIsRUFBRTtNQUN6Q0osTUFBTSxFQUFFZixNQUFNLENBQUNvQixZQUFZLENBQUNDLFlBQVksQ0FBRSxtQkFBb0I7SUFDaEUsQ0FBRSxDQUFDO0lBR0wsTUFBTU0sV0FBVyxHQUFHLElBQUk5QixJQUFJLENBQUU7TUFBRStCLFFBQVEsRUFBRSxDQUFFWCxrQkFBa0IsRUFBRVMsaUJBQWlCO0lBQUcsQ0FBRSxDQUFDO0lBQ3ZGQyxXQUFXLENBQUNFLGlCQUFpQixDQUFFLENBQUUsQ0FBQztJQUNsQztJQUNBO0lBQ0E7SUFDQSxNQUFNQyxpQkFBaUIsR0FBRyxJQUFJL0IsS0FBSyxDQUFFNEIsV0FBVyxFQUFFO01BQ2hESSxJQUFJLEVBQUVyQixHQUFHLENBQUNRLFdBQVcsQ0FBQ0MseUJBQXlCLENBQUNhO0lBQ2xELENBQUUsQ0FBQztJQUNIdEIsR0FBRyxDQUFDUSxXQUFXLENBQUNDLHlCQUF5QixDQUFDYyxJQUFJLENBQUVDLGlCQUFpQixJQUFJO01BQ25FSixpQkFBaUIsQ0FBQ0ssT0FBTyxDQUFFRCxpQkFBa0IsQ0FBQztJQUNoRCxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNFLFFBQVEsQ0FBRSxJQUFJdEMsSUFBSSxDQUFFO01BQ3ZCOEIsUUFBUSxFQUFFLENBQ1JFLGlCQUFpQixDQUNsQjtNQUNETyxPQUFPLEVBQUUsRUFBRTtNQUNYQyxNQUFNLEVBQUUsSUFBSSxDQUFDQyxZQUFZLENBQUNEO0lBQzVCLENBQUUsQ0FBRSxDQUFDO0VBQ1A7QUFDRjtBQUVBckMsS0FBSyxDQUFDdUMsUUFBUSxDQUFFLG1CQUFtQixFQUFFakMsaUJBQWtCLENBQUM7QUFDeEQsZUFBZUEsaUJBQWlCIn0=