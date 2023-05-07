// Copyright 2015-2022, University of Colorado Boulder

/**
 * Failure message displayed when a WebGL context loss is experienced and we can't recover. Offers a button to reload
 * the simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import optionize from '../../phet-core/js/optionize.js';
import { HBox, Path, Text } from '../../scenery/js/imports.js';
import exclamationTriangleSolidShape from '../../sherpa/js/fontawesome-5/exclamationTriangleSolidShape.js';
import TextPushButton from '../../sun/js/buttons/TextPushButton.js';
import Dialog from '../../sun/js/Dialog.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
import SceneryPhetStrings from './SceneryPhetStrings.js';
export default class ContextLossFailureDialog extends Dialog {
  // see SelfOptions.reload

  constructor(providedOptions) {
    const options = optionize()({
      // ContextLossFailureDialogOptions
      reload: () => window.location.reload(),
      // Dialog options
      xSpacing: 30,
      topMargin: 30,
      bottomMargin: 30,
      leftMargin: 30
    }, providedOptions);
    const warningSign = new Path(exclamationTriangleSolidShape, {
      fill: '#E87600',
      // "safety orange", according to Wikipedia
      scale: 0.048
    });
    const text = new Text(SceneryPhetStrings.webglWarning.contextLossFailureStringProperty, {
      font: new PhetFont(12)
    });
    const button = new TextPushButton(SceneryPhetStrings.webglWarning.contextLossReloadStringProperty, {
      font: new PhetFont(12),
      baseColor: '#E87600',
      listener: () => this.hide()
    });
    const content = new HBox({
      children: [warningSign, text, button],
      spacing: 10
    });
    super(content, options);
    this.reload = options.reload;
    this.disposeContextLossFailureDialog = () => {
      text.dispose();
      button.dispose();
    };
  }
  dispose() {
    this.disposeContextLossFailureDialog();
    super.dispose();
  }

  /**
   * Invokes the reload callback when the dialog is hidden.
   * See https://github.com/phetsims/scenery-phet/issues/373.
   */
  hide() {
    this.reload();
    super.hide();
  }

  /**
   * Hides the dialog without invoking the reload callback.
   */
  hideWithoutReload() {
    super.hide();
  }
}
sceneryPhet.register('ContextLossFailureDialog', ContextLossFailureDialog);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJIQm94IiwiUGF0aCIsIlRleHQiLCJleGNsYW1hdGlvblRyaWFuZ2xlU29saWRTaGFwZSIsIlRleHRQdXNoQnV0dG9uIiwiRGlhbG9nIiwiUGhldEZvbnQiLCJzY2VuZXJ5UGhldCIsIlNjZW5lcnlQaGV0U3RyaW5ncyIsIkNvbnRleHRMb3NzRmFpbHVyZURpYWxvZyIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInJlbG9hZCIsIndpbmRvdyIsImxvY2F0aW9uIiwieFNwYWNpbmciLCJ0b3BNYXJnaW4iLCJib3R0b21NYXJnaW4iLCJsZWZ0TWFyZ2luIiwid2FybmluZ1NpZ24iLCJmaWxsIiwic2NhbGUiLCJ0ZXh0Iiwid2ViZ2xXYXJuaW5nIiwiY29udGV4dExvc3NGYWlsdXJlU3RyaW5nUHJvcGVydHkiLCJmb250IiwiYnV0dG9uIiwiY29udGV4dExvc3NSZWxvYWRTdHJpbmdQcm9wZXJ0eSIsImJhc2VDb2xvciIsImxpc3RlbmVyIiwiaGlkZSIsImNvbnRlbnQiLCJjaGlsZHJlbiIsInNwYWNpbmciLCJkaXNwb3NlQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nIiwiZGlzcG9zZSIsImhpZGVXaXRob3V0UmVsb2FkIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb250ZXh0TG9zc0ZhaWx1cmVEaWFsb2cudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRmFpbHVyZSBtZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgV2ViR0wgY29udGV4dCBsb3NzIGlzIGV4cGVyaWVuY2VkIGFuZCB3ZSBjYW4ndCByZWNvdmVyLiBPZmZlcnMgYSBidXR0b24gdG8gcmVsb2FkXHJcbiAqIHRoZSBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgSEJveCwgUGF0aCwgVGV4dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBleGNsYW1hdGlvblRyaWFuZ2xlU29saWRTaGFwZSBmcm9tICcuLi8uLi9zaGVycGEvanMvZm9udGF3ZXNvbWUtNS9leGNsYW1hdGlvblRyaWFuZ2xlU29saWRTaGFwZS5qcyc7XHJcbmltcG9ydCBUZXh0UHVzaEJ1dHRvbiBmcm9tICcuLi8uLi9zdW4vanMvYnV0dG9ucy9UZXh0UHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBEaWFsb2csIHsgRGlhbG9nT3B0aW9ucyB9IGZyb20gJy4uLy4uL3N1bi9qcy9EaWFsb2cuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcclxuaW1wb3J0IFNjZW5lcnlQaGV0U3RyaW5ncyBmcm9tICcuL1NjZW5lcnlQaGV0U3RyaW5ncy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG5cclxuICAvLyBCeSBkZWZhdWx0LCBwcmVzc2luZyB0aGUgUmVsb2FkIGJ1dHRvbiByZWxvYWRzIHRoZSBzaW11bGF0aW9uIGluIHRoZSBicm93c2VyLlxyXG4gIC8vIFByb3ZpZGVkIGFzIGFuIG9wdGlvbiBzbyB0aGF0IHNjZW5lcnktcGhldCBkZW1vIGFwcCBjYW4gdGVzdCB3aXRob3V0IGNhdXNpbmcgYXV0b21hdGVkLXRlc3RpbmcgZmFpbHVyZXMuXHJcbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzM3NVxyXG4gIHJlbG9hZD86ICgpID0+IHZvaWQ7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBDb250ZXh0TG9zc0ZhaWx1cmVEaWFsb2dPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBEaWFsb2dPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nIGV4dGVuZHMgRGlhbG9nIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSByZWxvYWQ6ICgpID0+IHZvaWQ7IC8vIHNlZSBTZWxmT3B0aW9ucy5yZWxvYWRcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nOiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IENvbnRleHRMb3NzRmFpbHVyZURpYWxvZ09wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDb250ZXh0TG9zc0ZhaWx1cmVEaWFsb2dPcHRpb25zLCBTZWxmT3B0aW9ucywgRGlhbG9nT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nT3B0aW9uc1xyXG4gICAgICByZWxvYWQ6ICgpID0+IHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKSxcclxuXHJcbiAgICAgIC8vIERpYWxvZyBvcHRpb25zXHJcbiAgICAgIHhTcGFjaW5nOiAzMCxcclxuICAgICAgdG9wTWFyZ2luOiAzMCxcclxuICAgICAgYm90dG9tTWFyZ2luOiAzMCxcclxuICAgICAgbGVmdE1hcmdpbjogMzBcclxuXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCB3YXJuaW5nU2lnbiA9IG5ldyBQYXRoKCBleGNsYW1hdGlvblRyaWFuZ2xlU29saWRTaGFwZSwge1xyXG4gICAgICBmaWxsOiAnI0U4NzYwMCcsIC8vIFwic2FmZXR5IG9yYW5nZVwiLCBhY2NvcmRpbmcgdG8gV2lraXBlZGlhXHJcbiAgICAgIHNjYWxlOiAwLjA0OFxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHRleHQgPSBuZXcgVGV4dCggU2NlbmVyeVBoZXRTdHJpbmdzLndlYmdsV2FybmluZy5jb250ZXh0TG9zc0ZhaWx1cmVTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDEyIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBidXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oIFNjZW5lcnlQaGV0U3RyaW5ncy53ZWJnbFdhcm5pbmcuY29udGV4dExvc3NSZWxvYWRTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDEyICksXHJcbiAgICAgIGJhc2VDb2xvcjogJyNFODc2MDAnLFxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4gdGhpcy5oaWRlKClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgd2FybmluZ1NpZ24sIHRleHQsIGJ1dHRvbiBdLFxyXG4gICAgICBzcGFjaW5nOiAxMFxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBjb250ZW50LCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5yZWxvYWQgPSBvcHRpb25zLnJlbG9hZDtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VDb250ZXh0TG9zc0ZhaWx1cmVEaWFsb2cgPSAoKSA9PiB7XHJcbiAgICAgIHRleHQuZGlzcG9zZSgpO1xyXG4gICAgICBidXR0b24uZGlzcG9zZSgpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnZva2VzIHRoZSByZWxvYWQgY2FsbGJhY2sgd2hlbiB0aGUgZGlhbG9nIGlzIGhpZGRlbi5cclxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvMzczLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBoaWRlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5yZWxvYWQoKTtcclxuICAgIHN1cGVyLmhpZGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhpZGVzIHRoZSBkaWFsb2cgd2l0aG91dCBpbnZva2luZyB0aGUgcmVsb2FkIGNhbGxiYWNrLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBoaWRlV2l0aG91dFJlbG9hZCgpOiB2b2lkIHtcclxuICAgIHN1cGVyLmhpZGUoKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nJywgQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLDZCQUE2QjtBQUM5RCxPQUFPQyw2QkFBNkIsTUFBTSxnRUFBZ0U7QUFDMUcsT0FBT0MsY0FBYyxNQUFNLHdDQUF3QztBQUNuRSxPQUFPQyxNQUFNLE1BQXlCLHdCQUF3QjtBQUM5RCxPQUFPQyxRQUFRLE1BQU0sZUFBZTtBQUNwQyxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBQzFDLE9BQU9DLGtCQUFrQixNQUFNLHlCQUF5QjtBQVl4RCxlQUFlLE1BQU1DLHdCQUF3QixTQUFTSixNQUFNLENBQUM7RUFFdEI7O0VBSTlCSyxXQUFXQSxDQUFFQyxlQUFpRCxFQUFHO0lBRXRFLE1BQU1DLE9BQU8sR0FBR2IsU0FBUyxDQUE4RCxDQUFDLENBQUU7TUFFeEY7TUFDQWMsTUFBTSxFQUFFQSxDQUFBLEtBQU1DLE1BQU0sQ0FBQ0MsUUFBUSxDQUFDRixNQUFNLENBQUMsQ0FBQztNQUV0QztNQUNBRyxRQUFRLEVBQUUsRUFBRTtNQUNaQyxTQUFTLEVBQUUsRUFBRTtNQUNiQyxZQUFZLEVBQUUsRUFBRTtNQUNoQkMsVUFBVSxFQUFFO0lBRWQsQ0FBQyxFQUFFUixlQUFnQixDQUFDO0lBRXBCLE1BQU1TLFdBQVcsR0FBRyxJQUFJbkIsSUFBSSxDQUFFRSw2QkFBNkIsRUFBRTtNQUMzRGtCLElBQUksRUFBRSxTQUFTO01BQUU7TUFDakJDLEtBQUssRUFBRTtJQUNULENBQUUsQ0FBQztJQUVILE1BQU1DLElBQUksR0FBRyxJQUFJckIsSUFBSSxDQUFFTSxrQkFBa0IsQ0FBQ2dCLFlBQVksQ0FBQ0MsZ0NBQWdDLEVBQUU7TUFDdkZDLElBQUksRUFBRSxJQUFJcEIsUUFBUSxDQUFFLEVBQUc7SUFDekIsQ0FBRSxDQUFDO0lBRUgsTUFBTXFCLE1BQU0sR0FBRyxJQUFJdkIsY0FBYyxDQUFFSSxrQkFBa0IsQ0FBQ2dCLFlBQVksQ0FBQ0ksK0JBQStCLEVBQUU7TUFDbEdGLElBQUksRUFBRSxJQUFJcEIsUUFBUSxDQUFFLEVBQUcsQ0FBQztNQUN4QnVCLFNBQVMsRUFBRSxTQUFTO01BQ3BCQyxRQUFRLEVBQUVBLENBQUEsS0FBTSxJQUFJLENBQUNDLElBQUksQ0FBQztJQUM1QixDQUFFLENBQUM7SUFFSCxNQUFNQyxPQUFPLEdBQUcsSUFBSWhDLElBQUksQ0FBRTtNQUN4QmlDLFFBQVEsRUFBRSxDQUFFYixXQUFXLEVBQUVHLElBQUksRUFBRUksTUFBTSxDQUFFO01BQ3ZDTyxPQUFPLEVBQUU7SUFDWCxDQUFFLENBQUM7SUFFSCxLQUFLLENBQUVGLE9BQU8sRUFBRXBCLE9BQVEsQ0FBQztJQUV6QixJQUFJLENBQUNDLE1BQU0sR0FBR0QsT0FBTyxDQUFDQyxNQUFNO0lBRTVCLElBQUksQ0FBQ3NCLCtCQUErQixHQUFHLE1BQU07TUFDM0NaLElBQUksQ0FBQ2EsT0FBTyxDQUFDLENBQUM7TUFDZFQsTUFBTSxDQUFDUyxPQUFPLENBQUMsQ0FBQztJQUNsQixDQUFDO0VBQ0g7RUFFZ0JBLE9BQU9BLENBQUEsRUFBUztJQUM5QixJQUFJLENBQUNELCtCQUErQixDQUFDLENBQUM7SUFDdEMsS0FBSyxDQUFDQyxPQUFPLENBQUMsQ0FBQztFQUNqQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNrQkwsSUFBSUEsQ0FBQSxFQUFTO0lBQzNCLElBQUksQ0FBQ2xCLE1BQU0sQ0FBQyxDQUFDO0lBQ2IsS0FBSyxDQUFDa0IsSUFBSSxDQUFDLENBQUM7RUFDZDs7RUFFQTtBQUNGO0FBQ0E7RUFDU00saUJBQWlCQSxDQUFBLEVBQVM7SUFDL0IsS0FBSyxDQUFDTixJQUFJLENBQUMsQ0FBQztFQUNkO0FBQ0Y7QUFFQXhCLFdBQVcsQ0FBQytCLFFBQVEsQ0FBRSwwQkFBMEIsRUFBRTdCLHdCQUF5QixDQUFDIn0=