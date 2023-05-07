// Copyright 2022, University of Colorado Boulder
/**
 * Shows the main controls, including frequency/wavelength and amplitude.
 * Also displays a clear wave button when in the measure model.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import SoundConstants from '../../common/SoundConstants.js';
import sound from '../../sound.js';
import SoundStrings from '../../SoundStrings.js';
import PropertyControlSlider from './PropertyControlSlider.js';
import SoundPanel from './SoundPanel.js';
export default class SoundControlPanel extends SoundPanel {
  constructor(model, alignGroup, providedOptions) {
    const options = optionize()({
      maxWidth: SoundConstants.PANEL_MAX_WIDTH,
      yMargin: 4
    }, providedOptions);
    const frequencyControl = new PropertyControlSlider(SoundStrings.frequencyStringProperty, model.frequencyProperty, {
      // TODO: Trigger when SoundStrings.hzStringProperty changes
      valueToText: value => Utils.roundSymmetric(value * 1000).toString() + SoundStrings.hzStringProperty.value
    });
    const amplitudeControl = new PropertyControlSlider(SoundStrings.amplitudeStringProperty, model.amplitudeProperty);
    const centerX = frequencyControl.centerX;
    frequencyControl.centerX = centerX;
    amplitudeControl.centerX = centerX;

    // Vertical layout
    amplitudeControl.top = frequencyControl.bottom + SoundConstants.CONTROL_PANEL_SPACING;
    const clearButton = new RectangularPushButton({
      listener: () => {
        model.clearWaves();
      },
      content: new Text(SoundStrings.measure.clearWavesStringProperty)
    });
    const container = new VBox({
      spacing: 6,
      children: [frequencyControl, amplitudeControl, ...(model.stopwatch ? [clearButton] : [])]
    });
    const content = alignGroup.createBox(container);
    super(content, options);
  }
}
sound.register('SoundControlPanel', SoundControlPanel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIm9wdGlvbml6ZSIsIlRleHQiLCJWQm94IiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwiU291bmRDb25zdGFudHMiLCJzb3VuZCIsIlNvdW5kU3RyaW5ncyIsIlByb3BlcnR5Q29udHJvbFNsaWRlciIsIlNvdW5kUGFuZWwiLCJTb3VuZENvbnRyb2xQYW5lbCIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJhbGlnbkdyb3VwIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIm1heFdpZHRoIiwiUEFORUxfTUFYX1dJRFRIIiwieU1hcmdpbiIsImZyZXF1ZW5jeUNvbnRyb2wiLCJmcmVxdWVuY3lTdHJpbmdQcm9wZXJ0eSIsImZyZXF1ZW5jeVByb3BlcnR5IiwidmFsdWVUb1RleHQiLCJ2YWx1ZSIsInJvdW5kU3ltbWV0cmljIiwidG9TdHJpbmciLCJoelN0cmluZ1Byb3BlcnR5IiwiYW1wbGl0dWRlQ29udHJvbCIsImFtcGxpdHVkZVN0cmluZ1Byb3BlcnR5IiwiYW1wbGl0dWRlUHJvcGVydHkiLCJjZW50ZXJYIiwidG9wIiwiYm90dG9tIiwiQ09OVFJPTF9QQU5FTF9TUEFDSU5HIiwiY2xlYXJCdXR0b24iLCJsaXN0ZW5lciIsImNsZWFyV2F2ZXMiLCJjb250ZW50IiwibWVhc3VyZSIsImNsZWFyV2F2ZXNTdHJpbmdQcm9wZXJ0eSIsImNvbnRhaW5lciIsInNwYWNpbmciLCJjaGlsZHJlbiIsInN0b3B3YXRjaCIsImNyZWF0ZUJveCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU291bmRDb250cm9sUGFuZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vKipcclxuICogU2hvd3MgdGhlIG1haW4gY29udHJvbHMsIGluY2x1ZGluZyBmcmVxdWVuY3kvd2F2ZWxlbmd0aCBhbmQgYW1wbGl0dWRlLlxyXG4gKiBBbHNvIGRpc3BsYXlzIGEgY2xlYXIgd2F2ZSBidXR0b24gd2hlbiBpbiB0aGUgbWVhc3VyZSBtb2RlbC5cclxuICpcclxuICogQGF1dGhvciBQaWV0IEdvcmlzIChVbml2ZXJzaXR5IG9mIExldXZlbilcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdG9wd2F0Y2ggZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1N0b3B3YXRjaC5qcyc7XHJcbmltcG9ydCB7IFRleHQsIEFsaWduR3JvdXAsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBTb3VuZENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vU291bmRDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgc291bmQgZnJvbSAnLi4vLi4vc291bmQuanMnO1xyXG5pbXBvcnQgU291bmRNb2RlbCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvU291bmRNb2RlbC5qcyc7XHJcbmltcG9ydCBTb3VuZFN0cmluZ3MgZnJvbSAnLi4vLi4vU291bmRTdHJpbmdzLmpzJztcclxuaW1wb3J0IFByb3BlcnR5Q29udHJvbFNsaWRlciBmcm9tICcuL1Byb3BlcnR5Q29udHJvbFNsaWRlci5qcyc7XHJcbmltcG9ydCBTb3VuZFBhbmVsLCB7IFNvdW5kUGFuZWxPcHRpb25zIH0gZnJvbSAnLi9Tb3VuZFBhbmVsLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG50eXBlIFNvdW5kQ29udHJvbFBhbmVsT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU291bmRQYW5lbE9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb3VuZENvbnRyb2xQYW5lbCBleHRlbmRzIFNvdW5kUGFuZWwge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsOiBTb3VuZE1vZGVsICYgeyBzdG9wd2F0Y2g/OiBTdG9wd2F0Y2ggfSwgYWxpZ25Hcm91cDogQWxpZ25Hcm91cCwgcHJvdmlkZWRPcHRpb25zPzogU291bmRDb250cm9sUGFuZWxPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U291bmRDb250cm9sUGFuZWxPcHRpb25zLCBTZWxmT3B0aW9ucywgU291bmRQYW5lbE9wdGlvbnM+KCkoIHtcclxuICAgICAgbWF4V2lkdGg6IFNvdW5kQ29uc3RhbnRzLlBBTkVMX01BWF9XSURUSCxcclxuICAgICAgeU1hcmdpbjogNFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgZnJlcXVlbmN5Q29udHJvbCA9IG5ldyBQcm9wZXJ0eUNvbnRyb2xTbGlkZXIoIFNvdW5kU3RyaW5ncy5mcmVxdWVuY3lTdHJpbmdQcm9wZXJ0eSwgbW9kZWwuZnJlcXVlbmN5UHJvcGVydHksIHtcclxuXHJcbiAgICAgIC8vIFRPRE86IFRyaWdnZXIgd2hlbiBTb3VuZFN0cmluZ3MuaHpTdHJpbmdQcm9wZXJ0eSBjaGFuZ2VzXHJcbiAgICAgIHZhbHVlVG9UZXh0OiB2YWx1ZSA9PiAoIFV0aWxzLnJvdW5kU3ltbWV0cmljKCB2YWx1ZSAqIDEwMDAgKSApLnRvU3RyaW5nKCkgKyBTb3VuZFN0cmluZ3MuaHpTdHJpbmdQcm9wZXJ0eS52YWx1ZVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgYW1wbGl0dWRlQ29udHJvbCA9IG5ldyBQcm9wZXJ0eUNvbnRyb2xTbGlkZXIoIFNvdW5kU3RyaW5ncy5hbXBsaXR1ZGVTdHJpbmdQcm9wZXJ0eSwgbW9kZWwuYW1wbGl0dWRlUHJvcGVydHkgKTtcclxuXHJcbiAgICBjb25zdCBjZW50ZXJYID0gZnJlcXVlbmN5Q29udHJvbC5jZW50ZXJYO1xyXG4gICAgZnJlcXVlbmN5Q29udHJvbC5jZW50ZXJYID0gY2VudGVyWDtcclxuICAgIGFtcGxpdHVkZUNvbnRyb2wuY2VudGVyWCA9IGNlbnRlclg7XHJcblxyXG4gICAgLy8gVmVydGljYWwgbGF5b3V0XHJcbiAgICBhbXBsaXR1ZGVDb250cm9sLnRvcCA9IGZyZXF1ZW5jeUNvbnRyb2wuYm90dG9tICsgU291bmRDb25zdGFudHMuQ09OVFJPTF9QQU5FTF9TUEFDSU5HO1xyXG5cclxuICAgIGNvbnN0IGNsZWFyQnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIG1vZGVsLmNsZWFyV2F2ZXMoKTtcclxuICAgICAgfSxcclxuICAgICAgY29udGVudDogbmV3IFRleHQoIFNvdW5kU3RyaW5ncy5tZWFzdXJlLmNsZWFyV2F2ZXNTdHJpbmdQcm9wZXJ0eSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY29udGFpbmVyID0gbmV3IFZCb3goIHtcclxuICAgICAgc3BhY2luZzogNixcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBmcmVxdWVuY3lDb250cm9sLFxyXG4gICAgICAgIGFtcGxpdHVkZUNvbnRyb2wsXHJcbiAgICAgICAgLi4uKCBtb2RlbC5zdG9wd2F0Y2ggPyBbIGNsZWFyQnV0dG9uIF0gOiBbXSApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50ID0gYWxpZ25Hcm91cC5jcmVhdGVCb3goIGNvbnRhaW5lciApO1xyXG5cclxuICAgIHN1cGVyKCBjb250ZW50LCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5zb3VuZC5y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