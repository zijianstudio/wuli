// Copyright 2018-2023, University of Colorado Boulder

/**
 * Creates an HBox that can have the sound toggle button, a11y button, or be empty
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import platform from '../../phet-core/js/platform.js';
import { HBox } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import audioManager from './audioManager.js';
import joist from './joist.js';
import KeyboardHelpButton from './KeyboardHelpButton.js';
import NavigationBarAudioToggleButton from './NavigationBarAudioToggleButton.js';
import NavigationBarPreferencesButton from './preferences/NavigationBarPreferencesButton.js';
import optionize from '../../phet-core/js/optionize.js';
class A11yButtonsHBox extends HBox {
  constructor(sim, backgroundColorProperty, providedOptions) {
    const options = optionize()({
      align: 'center',
      spacing: 2,
      // This Node is not instrumented! This tandem is instead just used to instrument child elements.
      tandem: Tandem.REQUIRED
    }, providedOptions);

    // list of optional buttons added for a11y
    const a11yButtons = [];
    if (sim.preferencesModel.shouldShowDialog()) {
      const preferencesButton = new NavigationBarPreferencesButton(sim.preferencesModel, backgroundColorProperty, {
        tandem: options.tandem.createTandem('preferencesButton'),
        pointerAreaDilationX: 1,
        pointerAreaDilationY: 1
      });
      a11yButtons.push(preferencesButton);
    }
    const supportsAudioPreferences = sim.preferencesModel.supportsAudioPreferences();

    // only put the audio on/off button on the nav bar if audio features are enabled
    if (supportsAudioPreferences) {
      a11yButtons.push(new NavigationBarAudioToggleButton(audioManager.audioEnabledProperty, backgroundColorProperty, {
        tandem: options.tandem.createTandem('audioToggleButton'),
        pointerAreaDilationX: 1,
        pointerAreaDilationY: 0.15,
        supportsAudioPreferences: supportsAudioPreferences
      }));
    }

    // Create a keyboard help button/dialog if there is keyboard help content.
    if (sim.hasKeyboardHelpContent) {
      // Create the KeyboardHelpButton (pops open a dialog with information about keyboard navigation) if there is content
      // and the sim has supports Interactive Description. Eagerly create this to support a consistent PhET-iO API, but
      // only conditionally add it to the nav bar if in the proper runtime.
      const keyboardHelpButton = new KeyboardHelpButton(sim.screens, sim.selectedScreenProperty, backgroundColorProperty, {
        tandem: options.tandem.createTandem('keyboardHelpButton'),
        pointerAreaDilationX: 1,
        pointerAreaDilationY: 1
      });

      // only show the keyboard help button if the sim supports interactive description and we are not in mobile safari
      if (phet.chipper.queryParameters.supportsInteractiveDescription && !platform.mobileSafari) {
        a11yButtons.push(keyboardHelpButton);
      }
    }
    options.children = a11yButtons;

    // Don't instrument this Node, only its child elements.
    super(_.omit(options, 'tandem'));
  }
}
joist.register('A11yButtonsHBox', A11yButtonsHBox);
export default A11yButtonsHBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwbGF0Zm9ybSIsIkhCb3giLCJUYW5kZW0iLCJhdWRpb01hbmFnZXIiLCJqb2lzdCIsIktleWJvYXJkSGVscEJ1dHRvbiIsIk5hdmlnYXRpb25CYXJBdWRpb1RvZ2dsZUJ1dHRvbiIsIk5hdmlnYXRpb25CYXJQcmVmZXJlbmNlc0J1dHRvbiIsIm9wdGlvbml6ZSIsIkExMXlCdXR0b25zSEJveCIsImNvbnN0cnVjdG9yIiwic2ltIiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiYWxpZ24iLCJzcGFjaW5nIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJhMTF5QnV0dG9ucyIsInByZWZlcmVuY2VzTW9kZWwiLCJzaG91bGRTaG93RGlhbG9nIiwicHJlZmVyZW5jZXNCdXR0b24iLCJjcmVhdGVUYW5kZW0iLCJwb2ludGVyQXJlYURpbGF0aW9uWCIsInBvaW50ZXJBcmVhRGlsYXRpb25ZIiwicHVzaCIsInN1cHBvcnRzQXVkaW9QcmVmZXJlbmNlcyIsImF1ZGlvRW5hYmxlZFByb3BlcnR5IiwiaGFzS2V5Ym9hcmRIZWxwQ29udGVudCIsImtleWJvYXJkSGVscEJ1dHRvbiIsInNjcmVlbnMiLCJzZWxlY3RlZFNjcmVlblByb3BlcnR5IiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJzdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb24iLCJtb2JpbGVTYWZhcmkiLCJjaGlsZHJlbiIsIl8iLCJvbWl0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBMTF5QnV0dG9uc0hCb3gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhbiBIQm94IHRoYXQgY2FuIGhhdmUgdGhlIHNvdW5kIHRvZ2dsZSBidXR0b24sIGExMXkgYnV0dG9uLCBvciBiZSBlbXB0eVxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHBsYXRmb3JtIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9wbGF0Zm9ybS5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBIQm94LCBIQm94T3B0aW9ucyB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBhdWRpb01hbmFnZXIgZnJvbSAnLi9hdWRpb01hbmFnZXIuanMnO1xyXG5pbXBvcnQgam9pc3QgZnJvbSAnLi9qb2lzdC5qcyc7XHJcbmltcG9ydCBLZXlib2FyZEhlbHBCdXR0b24gZnJvbSAnLi9LZXlib2FyZEhlbHBCdXR0b24uanMnO1xyXG5pbXBvcnQgTmF2aWdhdGlvbkJhckF1ZGlvVG9nZ2xlQnV0dG9uIGZyb20gJy4vTmF2aWdhdGlvbkJhckF1ZGlvVG9nZ2xlQnV0dG9uLmpzJztcclxuaW1wb3J0IE5hdmlnYXRpb25CYXJQcmVmZXJlbmNlc0J1dHRvbiBmcm9tICcuL3ByZWZlcmVuY2VzL05hdmlnYXRpb25CYXJQcmVmZXJlbmNlc0J1dHRvbi5qcyc7XHJcbmltcG9ydCBTaW0gZnJvbSAnLi9TaW0uanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuZXhwb3J0IHR5cGUgQTExeUJ1dHRvbnNIQm94T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxIQm94T3B0aW9ucywgJ2NoaWxkcmVuJz47XHJcblxyXG5jbGFzcyBBMTF5QnV0dG9uc0hCb3ggZXh0ZW5kcyBIQm94IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzaW06IFNpbSwgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PENvbG9yPiwgcHJvdmlkZWRPcHRpb25zPzogQTExeUJ1dHRvbnNIQm94T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEExMXlCdXR0b25zSEJveE9wdGlvbnMsIFNlbGZPcHRpb25zLCBIQm94T3B0aW9ucz4oKSgge1xyXG4gICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgIHNwYWNpbmc6IDIsXHJcblxyXG4gICAgICAvLyBUaGlzIE5vZGUgaXMgbm90IGluc3RydW1lbnRlZCEgVGhpcyB0YW5kZW0gaXMgaW5zdGVhZCBqdXN0IHVzZWQgdG8gaW5zdHJ1bWVudCBjaGlsZCBlbGVtZW50cy5cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGxpc3Qgb2Ygb3B0aW9uYWwgYnV0dG9ucyBhZGRlZCBmb3IgYTExeVxyXG4gICAgY29uc3QgYTExeUJ1dHRvbnMgPSBbXTtcclxuXHJcbiAgICBpZiAoIHNpbS5wcmVmZXJlbmNlc01vZGVsLnNob3VsZFNob3dEaWFsb2coKSApIHtcclxuXHJcbiAgICAgIGNvbnN0IHByZWZlcmVuY2VzQnV0dG9uID0gbmV3IE5hdmlnYXRpb25CYXJQcmVmZXJlbmNlc0J1dHRvbiggc2ltLnByZWZlcmVuY2VzTW9kZWwsIGJhY2tncm91bmRDb2xvclByb3BlcnR5LCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwcmVmZXJlbmNlc0J1dHRvbicgKSxcclxuICAgICAgICBwb2ludGVyQXJlYURpbGF0aW9uWDogMSxcclxuICAgICAgICBwb2ludGVyQXJlYURpbGF0aW9uWTogMVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBhMTF5QnV0dG9ucy5wdXNoKCBwcmVmZXJlbmNlc0J1dHRvbiApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN1cHBvcnRzQXVkaW9QcmVmZXJlbmNlcyA9IHNpbS5wcmVmZXJlbmNlc01vZGVsLnN1cHBvcnRzQXVkaW9QcmVmZXJlbmNlcygpO1xyXG5cclxuICAgIC8vIG9ubHkgcHV0IHRoZSBhdWRpbyBvbi9vZmYgYnV0dG9uIG9uIHRoZSBuYXYgYmFyIGlmIGF1ZGlvIGZlYXR1cmVzIGFyZSBlbmFibGVkXHJcbiAgICBpZiAoIHN1cHBvcnRzQXVkaW9QcmVmZXJlbmNlcyApIHtcclxuICAgICAgYTExeUJ1dHRvbnMucHVzaCggbmV3IE5hdmlnYXRpb25CYXJBdWRpb1RvZ2dsZUJ1dHRvbiggYXVkaW9NYW5hZ2VyLmF1ZGlvRW5hYmxlZFByb3BlcnR5LCBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSwge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYXVkaW9Ub2dnbGVCdXR0b24nICksXHJcbiAgICAgICAgcG9pbnRlckFyZWFEaWxhdGlvblg6IDEsXHJcbiAgICAgICAgcG9pbnRlckFyZWFEaWxhdGlvblk6IDAuMTUsXHJcbiAgICAgICAgc3VwcG9ydHNBdWRpb1ByZWZlcmVuY2VzOiBzdXBwb3J0c0F1ZGlvUHJlZmVyZW5jZXNcclxuICAgICAgfSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEga2V5Ym9hcmQgaGVscCBidXR0b24vZGlhbG9nIGlmIHRoZXJlIGlzIGtleWJvYXJkIGhlbHAgY29udGVudC5cclxuICAgIGlmICggc2ltLmhhc0tleWJvYXJkSGVscENvbnRlbnQgKSB7XHJcblxyXG4gICAgICAvLyBDcmVhdGUgdGhlIEtleWJvYXJkSGVscEJ1dHRvbiAocG9wcyBvcGVuIGEgZGlhbG9nIHdpdGggaW5mb3JtYXRpb24gYWJvdXQga2V5Ym9hcmQgbmF2aWdhdGlvbikgaWYgdGhlcmUgaXMgY29udGVudFxyXG4gICAgICAvLyBhbmQgdGhlIHNpbSBoYXMgc3VwcG9ydHMgSW50ZXJhY3RpdmUgRGVzY3JpcHRpb24uIEVhZ2VybHkgY3JlYXRlIHRoaXMgdG8gc3VwcG9ydCBhIGNvbnNpc3RlbnQgUGhFVC1pTyBBUEksIGJ1dFxyXG4gICAgICAvLyBvbmx5IGNvbmRpdGlvbmFsbHkgYWRkIGl0IHRvIHRoZSBuYXYgYmFyIGlmIGluIHRoZSBwcm9wZXIgcnVudGltZS5cclxuICAgICAgY29uc3Qga2V5Ym9hcmRIZWxwQnV0dG9uID0gbmV3IEtleWJvYXJkSGVscEJ1dHRvbiggc2ltLnNjcmVlbnMsIHNpbS5zZWxlY3RlZFNjcmVlblByb3BlcnR5LCBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSwge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAna2V5Ym9hcmRIZWxwQnV0dG9uJyApLFxyXG4gICAgICAgIHBvaW50ZXJBcmVhRGlsYXRpb25YOiAxLFxyXG4gICAgICAgIHBvaW50ZXJBcmVhRGlsYXRpb25ZOiAxXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIG9ubHkgc2hvdyB0aGUga2V5Ym9hcmQgaGVscCBidXR0b24gaWYgdGhlIHNpbSBzdXBwb3J0cyBpbnRlcmFjdGl2ZSBkZXNjcmlwdGlvbiBhbmQgd2UgYXJlIG5vdCBpbiBtb2JpbGUgc2FmYXJpXHJcbiAgICAgIGlmICggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5zdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb24gJiYgIXBsYXRmb3JtLm1vYmlsZVNhZmFyaSApIHtcclxuICAgICAgICBhMTF5QnV0dG9ucy5wdXNoKCBrZXlib2FyZEhlbHBCdXR0b24gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBhMTF5QnV0dG9ucztcclxuXHJcbiAgICAvLyBEb24ndCBpbnN0cnVtZW50IHRoaXMgTm9kZSwgb25seSBpdHMgY2hpbGQgZWxlbWVudHMuXHJcbiAgICBzdXBlciggXy5vbWl0KCBvcHRpb25zLCAndGFuZGVtJyApICk7XHJcbiAgfVxyXG59XHJcblxyXG5qb2lzdC5yZWdpc3RlciggJ0ExMXlCdXR0b25zSEJveCcsIEExMXlCdXR0b25zSEJveCApO1xyXG5leHBvcnQgZGVmYXVsdCBBMTF5QnV0dG9uc0hCb3g7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxnQ0FBZ0M7QUFDckQsU0FBZ0JDLElBQUksUUFBcUIsNkJBQTZCO0FBQ3RFLE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQUM1QyxPQUFPQyxLQUFLLE1BQU0sWUFBWTtBQUM5QixPQUFPQyxrQkFBa0IsTUFBTSx5QkFBeUI7QUFDeEQsT0FBT0MsOEJBQThCLE1BQU0scUNBQXFDO0FBQ2hGLE9BQU9DLDhCQUE4QixNQUFNLGlEQUFpRDtBQUc1RixPQUFPQyxTQUFTLE1BQTRCLGlDQUFpQztBQU03RSxNQUFNQyxlQUFlLFNBQVNSLElBQUksQ0FBQztFQUUxQlMsV0FBV0EsQ0FBRUMsR0FBUSxFQUFFQyx1QkFBaUQsRUFBRUMsZUFBd0MsRUFBRztJQUUxSCxNQUFNQyxPQUFPLEdBQUdOLFNBQVMsQ0FBbUQsQ0FBQyxDQUFFO01BQzdFTyxLQUFLLEVBQUUsUUFBUTtNQUNmQyxPQUFPLEVBQUUsQ0FBQztNQUVWO01BQ0FDLE1BQU0sRUFBRWYsTUFBTSxDQUFDZ0I7SUFDakIsQ0FBQyxFQUFFTCxlQUFnQixDQUFDOztJQUVwQjtJQUNBLE1BQU1NLFdBQVcsR0FBRyxFQUFFO0lBRXRCLElBQUtSLEdBQUcsQ0FBQ1MsZ0JBQWdCLENBQUNDLGdCQUFnQixDQUFDLENBQUMsRUFBRztNQUU3QyxNQUFNQyxpQkFBaUIsR0FBRyxJQUFJZiw4QkFBOEIsQ0FBRUksR0FBRyxDQUFDUyxnQkFBZ0IsRUFBRVIsdUJBQXVCLEVBQUU7UUFDM0dLLE1BQU0sRUFBRUgsT0FBTyxDQUFDRyxNQUFNLENBQUNNLFlBQVksQ0FBRSxtQkFBb0IsQ0FBQztRQUMxREMsb0JBQW9CLEVBQUUsQ0FBQztRQUN2QkMsb0JBQW9CLEVBQUU7TUFDeEIsQ0FBRSxDQUFDO01BRUhOLFdBQVcsQ0FBQ08sSUFBSSxDQUFFSixpQkFBa0IsQ0FBQztJQUN2QztJQUVBLE1BQU1LLHdCQUF3QixHQUFHaEIsR0FBRyxDQUFDUyxnQkFBZ0IsQ0FBQ08sd0JBQXdCLENBQUMsQ0FBQzs7SUFFaEY7SUFDQSxJQUFLQSx3QkFBd0IsRUFBRztNQUM5QlIsV0FBVyxDQUFDTyxJQUFJLENBQUUsSUFBSXBCLDhCQUE4QixDQUFFSCxZQUFZLENBQUN5QixvQkFBb0IsRUFBRWhCLHVCQUF1QixFQUFFO1FBQ2hISyxNQUFNLEVBQUVILE9BQU8sQ0FBQ0csTUFBTSxDQUFDTSxZQUFZLENBQUUsbUJBQW9CLENBQUM7UUFDMURDLG9CQUFvQixFQUFFLENBQUM7UUFDdkJDLG9CQUFvQixFQUFFLElBQUk7UUFDMUJFLHdCQUF3QixFQUFFQTtNQUM1QixDQUFFLENBQUUsQ0FBQztJQUNQOztJQUVBO0lBQ0EsSUFBS2hCLEdBQUcsQ0FBQ2tCLHNCQUFzQixFQUFHO01BRWhDO01BQ0E7TUFDQTtNQUNBLE1BQU1DLGtCQUFrQixHQUFHLElBQUl6QixrQkFBa0IsQ0FBRU0sR0FBRyxDQUFDb0IsT0FBTyxFQUFFcEIsR0FBRyxDQUFDcUIsc0JBQXNCLEVBQUVwQix1QkFBdUIsRUFBRTtRQUNuSEssTUFBTSxFQUFFSCxPQUFPLENBQUNHLE1BQU0sQ0FBQ00sWUFBWSxDQUFFLG9CQUFxQixDQUFDO1FBQzNEQyxvQkFBb0IsRUFBRSxDQUFDO1FBQ3ZCQyxvQkFBb0IsRUFBRTtNQUN4QixDQUFFLENBQUM7O01BRUg7TUFDQSxJQUFLUSxJQUFJLENBQUNDLE9BQU8sQ0FBQ0MsZUFBZSxDQUFDQyw4QkFBOEIsSUFBSSxDQUFDcEMsUUFBUSxDQUFDcUMsWUFBWSxFQUFHO1FBQzNGbEIsV0FBVyxDQUFDTyxJQUFJLENBQUVJLGtCQUFtQixDQUFDO01BQ3hDO0lBQ0Y7SUFFQWhCLE9BQU8sQ0FBQ3dCLFFBQVEsR0FBR25CLFdBQVc7O0lBRTlCO0lBQ0EsS0FBSyxDQUFFb0IsQ0FBQyxDQUFDQyxJQUFJLENBQUUxQixPQUFPLEVBQUUsUUFBUyxDQUFFLENBQUM7RUFDdEM7QUFDRjtBQUVBVixLQUFLLENBQUNxQyxRQUFRLENBQUUsaUJBQWlCLEVBQUVoQyxlQUFnQixDQUFDO0FBQ3BELGVBQWVBLGVBQWUifQ==