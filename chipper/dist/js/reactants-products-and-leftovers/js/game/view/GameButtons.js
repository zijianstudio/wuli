// Copyright 2014-2023, University of Colorado Boulder

/**
 * Group of mutually-exclusive buttons that are used to advance a challenge through its states.
 * The buttons are 'Check', 'Try Again', 'Show Answer' and 'Next'.
 * Buttons are created on demand to improve overall performance of creating a game challenge.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { VBox } from '../../../../scenery/js/imports.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import PlayState from '../model/PlayState.js';
export default class GameButtons extends VBox {
  constructor(model, checkButtonEnabledProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      maxTextWidth: 100
    }, providedOptions);
    const textPushButtonOptions = {
      maxTextWidth: options.maxTextWidth,
      font: new PhetFont({
        size: 20,
        weight: 'bold'
      }),
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      opacity: 0.65,
      xMargin: 20,
      yMargin: 5,
      centerX: 0 // so that all buttons are center aligned
    };

    const checkButton = new TextPushButton(VegasStrings.checkStringProperty, combineOptions({
      listener: () => model.check()
    }, textPushButtonOptions));
    const tryAgainButton = new TextPushButton(VegasStrings.tryAgainStringProperty, combineOptions({
      listener: () => model.tryAgain()
    }, textPushButtonOptions));
    const showAnswerButton = new TextPushButton(VegasStrings.showAnswerStringProperty, combineOptions({
      listener: () => model.showAnswer()
    }, textPushButtonOptions));
    const nextButton = new TextPushButton(VegasStrings.nextStringProperty, combineOptions({
      listener: () => model.next()
    }, textPushButtonOptions));
    options.children = [checkButton, tryAgainButton, showAnswerButton, nextButton];
    super(options);

    // enable/disable the check button
    const checkButtonEnabledObserver = enabled => {
      checkButton.enabled = enabled;
    };
    checkButtonEnabledProperty.link(checkButtonEnabledObserver); // must be unlinked in dispose

    // Show the button that corresponds to the PlayState.
    const playStateObserver = state => {
      checkButton && (checkButton.visible = state === PlayState.FIRST_CHECK || state === PlayState.SECOND_CHECK);
      tryAgainButton && (tryAgainButton.visible = state === PlayState.TRY_AGAIN);
      showAnswerButton && (showAnswerButton.visible = state === PlayState.SHOW_ANSWER);
      nextButton && (nextButton.visible = state === PlayState.NEXT);
    };
    model.playStateProperty.link(playStateObserver);
    this.disposeGameButtons = () => {
      checkButton.dispose();
      tryAgainButton.dispose();
      showAnswerButton.dispose();
      nextButton.dispose();
      if (checkButtonEnabledProperty.hasListener(checkButtonEnabledObserver)) {
        checkButtonEnabledProperty.unlink(checkButtonEnabledObserver);
      }
      if (model.playStateProperty.hasListener(playStateObserver)) {
        model.playStateProperty.unlink(playStateObserver);
      }
    };
  }
  dispose() {
    this.disposeGameButtons();
    super.dispose();
  }
}
reactantsProductsAndLeftovers.register('GameButtons', GameButtons);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIlBoZXRDb2xvclNjaGVtZSIsIlBoZXRGb250IiwiVkJveCIsIlRleHRQdXNoQnV0dG9uIiwiVmVnYXNTdHJpbmdzIiwicmVhY3RhbnRzUHJvZHVjdHNBbmRMZWZ0b3ZlcnMiLCJQbGF5U3RhdGUiLCJHYW1lQnV0dG9ucyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJjaGVja0J1dHRvbkVuYWJsZWRQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJtYXhUZXh0V2lkdGgiLCJ0ZXh0UHVzaEJ1dHRvbk9wdGlvbnMiLCJmb250Iiwic2l6ZSIsIndlaWdodCIsImJhc2VDb2xvciIsIkJVVFRPTl9ZRUxMT1ciLCJvcGFjaXR5IiwieE1hcmdpbiIsInlNYXJnaW4iLCJjZW50ZXJYIiwiY2hlY2tCdXR0b24iLCJjaGVja1N0cmluZ1Byb3BlcnR5IiwibGlzdGVuZXIiLCJjaGVjayIsInRyeUFnYWluQnV0dG9uIiwidHJ5QWdhaW5TdHJpbmdQcm9wZXJ0eSIsInRyeUFnYWluIiwic2hvd0Fuc3dlckJ1dHRvbiIsInNob3dBbnN3ZXJTdHJpbmdQcm9wZXJ0eSIsInNob3dBbnN3ZXIiLCJuZXh0QnV0dG9uIiwibmV4dFN0cmluZ1Byb3BlcnR5IiwibmV4dCIsImNoaWxkcmVuIiwiY2hlY2tCdXR0b25FbmFibGVkT2JzZXJ2ZXIiLCJlbmFibGVkIiwibGluayIsInBsYXlTdGF0ZU9ic2VydmVyIiwic3RhdGUiLCJ2aXNpYmxlIiwiRklSU1RfQ0hFQ0siLCJTRUNPTkRfQ0hFQ0siLCJUUllfQUdBSU4iLCJTSE9XX0FOU1dFUiIsIk5FWFQiLCJwbGF5U3RhdGVQcm9wZXJ0eSIsImRpc3Bvc2VHYW1lQnV0dG9ucyIsImRpc3Bvc2UiLCJoYXNMaXN0ZW5lciIsInVubGluayIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR2FtZUJ1dHRvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR3JvdXAgb2YgbXV0dWFsbHktZXhjbHVzaXZlIGJ1dHRvbnMgdGhhdCBhcmUgdXNlZCB0byBhZHZhbmNlIGEgY2hhbGxlbmdlIHRocm91Z2ggaXRzIHN0YXRlcy5cclxuICogVGhlIGJ1dHRvbnMgYXJlICdDaGVjaycsICdUcnkgQWdhaW4nLCAnU2hvdyBBbnN3ZXInIGFuZCAnTmV4dCcuXHJcbiAqIEJ1dHRvbnMgYXJlIGNyZWF0ZWQgb24gZGVtYW5kIHRvIGltcHJvdmUgb3ZlcmFsbCBwZXJmb3JtYW5jZSBvZiBjcmVhdGluZyBhIGdhbWUgY2hhbGxlbmdlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgVkJveCwgVkJveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGV4dFB1c2hCdXR0b24sIHsgVGV4dFB1c2hCdXR0b25PcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvVGV4dFB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgVmVnYXNTdHJpbmdzIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL1ZlZ2FzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCByZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVycyBmcm9tICcuLi8uLi9yZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVycy5qcyc7XHJcbmltcG9ydCBHYW1lTW9kZWwgZnJvbSAnLi4vbW9kZWwvR2FtZU1vZGVsLmpzJztcclxuaW1wb3J0IFBsYXlTdGF0ZSBmcm9tICcuLi9tb2RlbC9QbGF5U3RhdGUuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBtYXhUZXh0V2lkdGg/OiBudW1iZXI7XHJcbn07XHJcblxyXG50eXBlIEdhbWVCdXR0b25PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrT3B0aW9uYWw8VkJveE9wdGlvbnMsICdtYXhXaWR0aCc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZUJ1dHRvbnMgZXh0ZW5kcyBWQm94IHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlR2FtZUJ1dHRvbnM6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IEdhbWVNb2RlbCwgY2hlY2tCdXR0b25FbmFibGVkUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LCBwcm92aWRlZE9wdGlvbnM/OiBHYW1lQnV0dG9uT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEdhbWVCdXR0b25PcHRpb25zLCBTZWxmT3B0aW9ucywgVkJveE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIG1heFRleHRXaWR0aDogMTAwXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCB0ZXh0UHVzaEJ1dHRvbk9wdGlvbnM6IFRleHRQdXNoQnV0dG9uT3B0aW9ucyA9IHtcclxuICAgICAgbWF4VGV4dFdpZHRoOiBvcHRpb25zLm1heFRleHRXaWR0aCxcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDIwLCB3ZWlnaHQ6ICdib2xkJyB9ICksXHJcbiAgICAgIGJhc2VDb2xvcjogUGhldENvbG9yU2NoZW1lLkJVVFRPTl9ZRUxMT1csXHJcbiAgICAgIG9wYWNpdHk6IDAuNjUsXHJcbiAgICAgIHhNYXJnaW46IDIwLFxyXG4gICAgICB5TWFyZ2luOiA1LFxyXG4gICAgICBjZW50ZXJYOiAwIC8vIHNvIHRoYXQgYWxsIGJ1dHRvbnMgYXJlIGNlbnRlciBhbGlnbmVkXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGNoZWNrQnV0dG9uID0gbmV3IFRleHRQdXNoQnV0dG9uKCBWZWdhc1N0cmluZ3MuY2hlY2tTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgY29tYmluZU9wdGlvbnM8VGV4dFB1c2hCdXR0b25PcHRpb25zPigge1xyXG4gICAgICAgIGxpc3RlbmVyOiAoKSA9PiBtb2RlbC5jaGVjaygpXHJcbiAgICAgIH0sIHRleHRQdXNoQnV0dG9uT3B0aW9ucyApICk7XHJcblxyXG4gICAgY29uc3QgdHJ5QWdhaW5CdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oIFZlZ2FzU3RyaW5ncy50cnlBZ2FpblN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBjb21iaW5lT3B0aW9uczxUZXh0UHVzaEJ1dHRvbk9wdGlvbnM+KCB7XHJcbiAgICAgICAgbGlzdGVuZXI6ICgpID0+IG1vZGVsLnRyeUFnYWluKClcclxuICAgICAgfSwgdGV4dFB1c2hCdXR0b25PcHRpb25zICkgKTtcclxuXHJcbiAgICBjb25zdCBzaG93QW5zd2VyQnV0dG9uID0gbmV3IFRleHRQdXNoQnV0dG9uKCBWZWdhc1N0cmluZ3Muc2hvd0Fuc3dlclN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBjb21iaW5lT3B0aW9uczxUZXh0UHVzaEJ1dHRvbk9wdGlvbnM+KCB7XHJcbiAgICAgICAgbGlzdGVuZXI6ICgpID0+IG1vZGVsLnNob3dBbnN3ZXIoKVxyXG4gICAgICB9LCB0ZXh0UHVzaEJ1dHRvbk9wdGlvbnMgKSApO1xyXG5cclxuICAgIGNvbnN0IG5leHRCdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oIFZlZ2FzU3RyaW5ncy5uZXh0U3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGNvbWJpbmVPcHRpb25zPFRleHRQdXNoQnV0dG9uT3B0aW9ucz4oIHtcclxuICAgICAgICBsaXN0ZW5lcjogKCkgPT4gbW9kZWwubmV4dCgpXHJcbiAgICAgIH0sIHRleHRQdXNoQnV0dG9uT3B0aW9ucyApICk7XHJcblxyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgY2hlY2tCdXR0b24sIHRyeUFnYWluQnV0dG9uLCBzaG93QW5zd2VyQnV0dG9uLCBuZXh0QnV0dG9uIF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBlbmFibGUvZGlzYWJsZSB0aGUgY2hlY2sgYnV0dG9uXHJcbiAgICBjb25zdCBjaGVja0J1dHRvbkVuYWJsZWRPYnNlcnZlciA9ICggZW5hYmxlZDogYm9vbGVhbiApID0+IHtcclxuICAgICAgY2hlY2tCdXR0b24uZW5hYmxlZCA9IGVuYWJsZWQ7XHJcbiAgICB9O1xyXG4gICAgY2hlY2tCdXR0b25FbmFibGVkUHJvcGVydHkubGluayggY2hlY2tCdXR0b25FbmFibGVkT2JzZXJ2ZXIgKTsgLy8gbXVzdCBiZSB1bmxpbmtlZCBpbiBkaXNwb3NlXHJcblxyXG4gICAgLy8gU2hvdyB0aGUgYnV0dG9uIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIFBsYXlTdGF0ZS5cclxuICAgIGNvbnN0IHBsYXlTdGF0ZU9ic2VydmVyID0gKCBzdGF0ZTogUGxheVN0YXRlICkgPT4ge1xyXG4gICAgICBjaGVja0J1dHRvbiAmJiAoIGNoZWNrQnV0dG9uLnZpc2libGUgPSAoIHN0YXRlID09PSBQbGF5U3RhdGUuRklSU1RfQ0hFQ0sgfHwgc3RhdGUgPT09IFBsYXlTdGF0ZS5TRUNPTkRfQ0hFQ0sgKSApO1xyXG4gICAgICB0cnlBZ2FpbkJ1dHRvbiAmJiAoIHRyeUFnYWluQnV0dG9uLnZpc2libGUgPSAoIHN0YXRlID09PSBQbGF5U3RhdGUuVFJZX0FHQUlOICkgKTtcclxuICAgICAgc2hvd0Fuc3dlckJ1dHRvbiAmJiAoIHNob3dBbnN3ZXJCdXR0b24udmlzaWJsZSA9ICggc3RhdGUgPT09IFBsYXlTdGF0ZS5TSE9XX0FOU1dFUiApICk7XHJcbiAgICAgIG5leHRCdXR0b24gJiYgKCBuZXh0QnV0dG9uLnZpc2libGUgPSAoIHN0YXRlID09PSBQbGF5U3RhdGUuTkVYVCApICk7XHJcbiAgICB9O1xyXG4gICAgbW9kZWwucGxheVN0YXRlUHJvcGVydHkubGluayggcGxheVN0YXRlT2JzZXJ2ZXIgKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VHYW1lQnV0dG9ucyA9ICgpID0+IHtcclxuICAgICAgY2hlY2tCdXR0b24uZGlzcG9zZSgpO1xyXG4gICAgICB0cnlBZ2FpbkJ1dHRvbi5kaXNwb3NlKCk7XHJcbiAgICAgIHNob3dBbnN3ZXJCdXR0b24uZGlzcG9zZSgpO1xyXG4gICAgICBuZXh0QnV0dG9uLmRpc3Bvc2UoKTtcclxuICAgICAgaWYgKCBjaGVja0J1dHRvbkVuYWJsZWRQcm9wZXJ0eS5oYXNMaXN0ZW5lciggY2hlY2tCdXR0b25FbmFibGVkT2JzZXJ2ZXIgKSApIHtcclxuICAgICAgICBjaGVja0J1dHRvbkVuYWJsZWRQcm9wZXJ0eS51bmxpbmsoIGNoZWNrQnV0dG9uRW5hYmxlZE9ic2VydmVyICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBtb2RlbC5wbGF5U3RhdGVQcm9wZXJ0eS5oYXNMaXN0ZW5lciggcGxheVN0YXRlT2JzZXJ2ZXIgKSApIHtcclxuICAgICAgICBtb2RlbC5wbGF5U3RhdGVQcm9wZXJ0eS51bmxpbmsoIHBsYXlTdGF0ZU9ic2VydmVyICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZUdhbWVCdXR0b25zKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5yZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVycy5yZWdpc3RlciggJ0dhbWVCdXR0b25zJywgR2FtZUJ1dHRvbnMgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLFNBQVMsSUFBSUMsY0FBYyxRQUFRLHVDQUF1QztBQUVqRixPQUFPQyxlQUFlLE1BQU0sZ0RBQWdEO0FBQzVFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxRQUFxQixtQ0FBbUM7QUFDckUsT0FBT0MsY0FBYyxNQUFpQyw4Q0FBOEM7QUFDcEcsT0FBT0MsWUFBWSxNQUFNLHNDQUFzQztBQUMvRCxPQUFPQyw2QkFBNkIsTUFBTSx3Q0FBd0M7QUFFbEYsT0FBT0MsU0FBUyxNQUFNLHVCQUF1QjtBQVE3QyxlQUFlLE1BQU1DLFdBQVcsU0FBU0wsSUFBSSxDQUFDO0VBSXJDTSxXQUFXQSxDQUFFQyxLQUFnQixFQUFFQywwQkFBc0QsRUFBRUMsZUFBbUMsRUFBRztJQUVsSSxNQUFNQyxPQUFPLEdBQUdkLFNBQVMsQ0FBOEMsQ0FBQyxDQUFFO01BRXhFO01BQ0FlLFlBQVksRUFBRTtJQUNoQixDQUFDLEVBQUVGLGVBQWdCLENBQUM7SUFFcEIsTUFBTUcscUJBQTRDLEdBQUc7TUFDbkRELFlBQVksRUFBRUQsT0FBTyxDQUFDQyxZQUFZO01BQ2xDRSxJQUFJLEVBQUUsSUFBSWQsUUFBUSxDQUFFO1FBQUVlLElBQUksRUFBRSxFQUFFO1FBQUVDLE1BQU0sRUFBRTtNQUFPLENBQUUsQ0FBQztNQUNsREMsU0FBUyxFQUFFbEIsZUFBZSxDQUFDbUIsYUFBYTtNQUN4Q0MsT0FBTyxFQUFFLElBQUk7TUFDYkMsT0FBTyxF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