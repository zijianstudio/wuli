// Copyright 2022, University of Colorado Boulder
/**
 * Base view for the screens.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import GaugeNode from '../../../../scenery-phet/js/GaugeNode.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import { AlignGroup, Rectangle, Text, Color } from '../../../../scenery/js/imports.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import WaveGenerator from '../../../../tambo/js/sound-generators/WaveGenerator.js';
import SoundConstants from '../../common/SoundConstants.js';
import AudioControlPanel from '../../common/view/AudioControlPanel.js';
import LatticeCanvasNode from '../../common/view/LatticeCanvasNode.js';
import SoundControlPanel from '../../common/view/SoundControlPanel.js';
import SpeakerNode from '../../common/view/SpeakerNode.js';
import sound from '../../sound.js';
import SoundStrings from '../../SoundStrings.js';
import Tandem from '../../../../tandem/js/Tandem.js';
// constants
const WAVE_MARGIN = 8; // Additional margin shown around the wave lattice
const GAUGE_SPACING_X = 8;
const GAUGE_SPACING_Y = 16;
export default class SoundScreenView extends ScreenView {
  // aligns the control panels

  // control panel responsible for the audio controls
  audioControlPanel = null;

  // control panel resposible for setting the frequency and amplitude

  constructor(model) {
    super({
      tandem: Tandem.OPT_OUT
    });
    this.waveAreaNode = new Rectangle(0, 0, 500, 500, {
      fill: '#4c4c4c',
      top: SoundConstants.CONTROL_PANEL_MARGIN + WAVE_MARGIN + 15,
      centerX: this.layoutBounds.centerX - 142
    });
    this.addChild(this.waveAreaNode);
    this.canvasNode = new LatticeCanvasNode(model.lattice, {
      baseColor: Color.white,
      hasReflection: model.hasReflection,
      sourcePosition: new Vector2(SoundConstants.SOURCE_POSITION_X, Math.floor(model.modelToLatticeTransform.modelToViewY(model.speaker1Position.y))),
      hasSecondSource: model.hasSecondSource
    });
    const latticeScale = this.waveAreaNode.width / this.canvasNode.width;
    this.canvasNode.mutate({
      scale: latticeScale,
      center: this.waveAreaNode.center,
      visible: true
    });
    this.addChild(this.canvasNode);
    this.contolPanelAlignGroup = new AlignGroup({
      matchVertical: false
    });
    this.controlPanel = new SoundControlPanel(model, this.contolPanelAlignGroup);
    this.controlPanel.mutate({
      right: this.layoutBounds.right - SoundConstants.CONTROL_PANEL_MARGIN,
      top: SoundConstants.CONTROL_PANEL_MARGIN + SoundConstants.CONTROL_PANEL_SPACING
    });
    this.addChild(this.controlPanel);
    if (model.isAudioEnabledProperty) {
      this.audioControlPanel = new AudioControlPanel(model, this.contolPanelAlignGroup);
      this.audioControlPanel.mutate({
        right: this.layoutBounds.right - SoundConstants.CONTROL_PANEL_MARGIN,
        top: this.controlPanel.bottom + SoundConstants.CONTROL_PANEL_SPACING
      });
      this.addChild(this.audioControlPanel);

      // Amplitude of the hearable tone
      const soundAmpitudeProperty = new NumberProperty(0);

      // Update the final amplitude of the sine wave tone
      const updateSoundAmplitude = () => {
        const amplitudeDampening = model.audioControlSettingProperty && model.audioControlSettingProperty.value === 'LISTENER' ? (SoundConstants.LISTENER_BOUNDS_X.max - model.listenerPositionProperty.value.x) / (SoundConstants.LISTENER_BOUNDS_X.max - SoundConstants.LISTENER_BOUNDS_X.min) : 1;
        const pressureDampening = model.pressureProperty ? model.pressureProperty.value : 1;
        soundAmpitudeProperty.set(model.amplitudeProperty.value / 1.5 * amplitudeDampening * pressureDampening);
      };
      model.amplitudeProperty.link(updateSoundAmplitude);
      if (model.pressureProperty) {
        model.pressureProperty.link(updateSoundAmplitude);
      }
      if (model.audioControlSettingProperty) {
        model.audioControlSettingProperty.link(updateSoundAmplitude);
        model.listenerPositionProperty.link(updateSoundAmplitude);
      }
      const sineWavePlayer = new WaveGenerator(model.frequencyProperty, soundAmpitudeProperty, {
        enableControlProperties: [model.isAudioEnabledProperty, model.isRunningProperty]
      });

      // Suppress the tone when another screen is selected
      soundManager.addSoundGenerator(sineWavePlayer, {
        associatedViewNode: this
      });
    }

    // Passes the bounds of the canvas to the model for use in its modelViewTranforms
    model.setViewBounds(this.waveAreaNode.bounds);
    if (model.pressureProperty) {
      const speakerCenter = model.modelViewTransform.modelToViewPosition(model.speaker1Position);
      const boxSizeX = 150;
      const boxSizeY = 200;

      // Pressure box.
      const box = new Rectangle(speakerCenter.x - boxSizeX / 2, speakerCenter.y - boxSizeY / 2, boxSizeX, boxSizeY, {
        stroke: '#f3d99b',
        lineWidth: 3
      });

      // Darken the pressure box in low pressures.
      model.pressureProperty.link(prop => {
        box.setFill(new Color(0, 0, 0, 1 - prop));
      });
      this.addChild(box);

      // Pressure gauge.
      const gauge = new GaugeNode(model.pressureProperty, SoundStrings.atmStringProperty, model.pressureProperty.range);
      gauge.centerX = speakerCenter.x;
      gauge.scale(0.4);
      gauge.bottom = speakerCenter.y - boxSizeY / 2;
      const oneText = new Text('1.0');
      const zeroText = new Text('0.0');
      oneText.centerY = gauge.centerY + GAUGE_SPACING_Y;
      zeroText.centerY = gauge.centerY + GAUGE_SPACING_Y;
      oneText.right = gauge.right - GAUGE_SPACING_X;
      zeroText.left = gauge.left + GAUGE_SPACING_X;
      this.addChild(gauge);
      this.addChild(oneText);
      this.addChild(zeroText);
    }

    // First speaker
    this.speakerNode1 = new SpeakerNode(model.oscillatorProperty);
    const viewPosition = model.modelViewTransform.modelToViewPosition(model.speaker1Position);
    viewPosition.setX(viewPosition.x + SoundConstants.SPEAKER_OFFSET);
    this.speakerNode1.setRightCenter(viewPosition);
    this.addChild(this.speakerNode1);

    // Pause/play/step buttons.
    const timeControlNode = new TimeControlNode(model.isRunningProperty, {
      bottom: this.layoutBounds.bottom - SoundConstants.CONTROL_PANEL_MARGIN,
      centerX: this.waveAreaNode.centerX,
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          // If we need to move forward further than one frame, call advanceTime several times rather than increasing the
          // dt, so the model will behave the same,
          // see https://github.com/phetsims/wave-interference/issues/254
          // and https://github.com/phetsims/wave-interference/issues/226
          listener: () => model.advanceTime(1 / SoundConstants.EVENT_RATE, true)
        }
      }
    });
    this.addChild(timeControlNode);
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
      },
      right: this.layoutBounds.maxX - SoundConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - SoundConstants.SCREEN_VIEW_Y_MARGIN
    });
    this.addChild(resetAllButton);
  }
}
sound.register('SoundScreenView', SoundScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJTY3JlZW5WaWV3IiwiUmVzZXRBbGxCdXR0b24iLCJHYXVnZU5vZGUiLCJUaW1lQ29udHJvbE5vZGUiLCJBbGlnbkdyb3VwIiwiUmVjdGFuZ2xlIiwiVGV4dCIsIkNvbG9yIiwic291bmRNYW5hZ2VyIiwiV2F2ZUdlbmVyYXRvciIsIlNvdW5kQ29uc3RhbnRzIiwiQXVkaW9Db250cm9sUGFuZWwiLCJMYXR0aWNlQ2FudmFzTm9kZSIsIlNvdW5kQ29udHJvbFBhbmVsIiwiU3BlYWtlck5vZGUiLCJzb3VuZCIsIlNvdW5kU3RyaW5ncyIsIlRhbmRlbSIsIldBVkVfTUFSR0lOIiwiR0FVR0VfU1BBQ0lOR19YIiwiR0FVR0VfU1BBQ0lOR19ZIiwiU291bmRTY3JlZW5WaWV3IiwiYXVkaW9Db250cm9sUGFuZWwiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwidGFuZGVtIiwiT1BUX09VVCIsIndhdmVBcmVhTm9kZSIsImZpbGwiLCJ0b3AiLCJDT05UUk9MX1BBTkVMX01BUkdJTiIsImNlbnRlclgiLCJsYXlvdXRCb3VuZHMiLCJhZGRDaGlsZCIsImNhbnZhc05vZGUiLCJsYXR0aWNlIiwiYmFzZUNvbG9yIiwid2hpdGUiLCJoYXNSZWZsZWN0aW9uIiwic291cmNlUG9zaXRpb24iLCJTT1VSQ0VfUE9TSVRJT05fWCIsIk1hdGgiLCJmbG9vciIsIm1vZGVsVG9MYXR0aWNlVHJhbnNmb3JtIiwibW9kZWxUb1ZpZXdZIiwic3BlYWtlcjFQb3NpdGlvbiIsInkiLCJoYXNTZWNvbmRTb3VyY2UiLCJsYXR0aWNlU2NhbGUiLCJ3aWR0aCIsIm11dGF0ZSIsInNjYWxlIiwiY2VudGVyIiwidmlzaWJsZSIsImNvbnRvbFBhbmVsQWxpZ25Hcm91cCIsIm1hdGNoVmVydGljYWwiLCJjb250cm9sUGFuZWwiLCJyaWdodCIsIkNPTlRST0xfUEFORUxfU1BBQ0lORyIsImlzQXVkaW9FbmFibGVkUHJvcGVydHkiLCJib3R0b20iLCJzb3VuZEFtcGl0dWRlUHJvcGVydHkiLCJ1cGRhdGVTb3VuZEFtcGxpdHVkZSIsImFtcGxpdHVkZURhbXBlbmluZyIsImF1ZGlvQ29udHJvbFNldHRpbmdQcm9wZXJ0eSIsInZhbHVlIiwiTElTVEVORVJfQk9VTkRTX1giLCJtYXgiLCJsaXN0ZW5lclBvc2l0aW9uUHJvcGVydHkiLCJ4IiwibWluIiwicHJlc3N1cmVEYW1wZW5pbmciLCJwcmVzc3VyZVByb3BlcnR5Iiwic2V0IiwiYW1wbGl0dWRlUHJvcGVydHkiLCJsaW5rIiwic2luZVdhdmVQbGF5ZXIiLCJmcmVxdWVuY3lQcm9wZXJ0eSIsImVuYWJsZUNvbnRyb2xQcm9wZXJ0aWVzIiwiaXNSdW5uaW5nUHJvcGVydHkiLCJhZGRTb3VuZEdlbmVyYXRvciIsImFzc29jaWF0ZWRWaWV3Tm9kZSIsInNldFZpZXdCb3VuZHMiLCJib3VuZHMiLCJzcGVha2VyQ2VudGVyIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsImJveFNpemVYIiwiYm94U2l6ZVkiLCJib3giLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJwcm9wIiwic2V0RmlsbCIsImdhdWdlIiwiYXRtU3RyaW5nUHJvcGVydHkiLCJyYW5nZSIsIm9uZVRleHQiLCJ6ZXJvVGV4dCIsImNlbnRlclkiLCJsZWZ0Iiwic3BlYWtlck5vZGUxIiwib3NjaWxsYXRvclByb3BlcnR5Iiwidmlld1Bvc2l0aW9uIiwic2V0WCIsIlNQRUFLRVJfT0ZGU0VUIiwic2V0UmlnaHRDZW50ZXIiLCJ0aW1lQ29udHJvbE5vZGUiLCJwbGF5UGF1c2VTdGVwQnV0dG9uT3B0aW9ucyIsInN0ZXBGb3J3YXJkQnV0dG9uT3B0aW9ucyIsImxpc3RlbmVyIiwiYWR2YW5jZVRpbWUiLCJFVkVOVF9SQVRFIiwicmVzZXRBbGxCdXR0b24iLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJyZXNldCIsIm1heFgiLCJTQ1JFRU5fVklFV19YX01BUkdJTiIsIm1heFkiLCJTQ1JFRU5fVklFV19ZX01BUkdJTiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU291bmRTY3JlZW5WaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuLyoqXHJcbiAqIEJhc2UgdmlldyBmb3IgdGhlIHNjcmVlbnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgUGlldCBHb3JpcyAoVW5pdmVyc2l0eSBvZiBMZXV2ZW4pXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXNldEFsbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBHYXVnZU5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0dhdWdlTm9kZS5qcyc7XHJcbmltcG9ydCBUaW1lQ29udHJvbE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1RpbWVDb250cm9sTm9kZS5qcyc7XHJcbmltcG9ydCB7IEFsaWduR3JvdXAsIFJlY3RhbmdsZSwgVGV4dCwgQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgc291bmRNYW5hZ2VyIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kTWFuYWdlci5qcyc7XHJcbmltcG9ydCBXYXZlR2VuZXJhdG9yIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvV2F2ZUdlbmVyYXRvci5qcyc7XHJcbmltcG9ydCBTb3VuZENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vU291bmRDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQXVkaW9Db250cm9sUGFuZWwgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQXVkaW9Db250cm9sUGFuZWwuanMnO1xyXG5pbXBvcnQgTGF0dGljZUNhbnZhc05vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvTGF0dGljZUNhbnZhc05vZGUuanMnO1xyXG5pbXBvcnQgU291bmRDb250cm9sUGFuZWwgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU291bmRDb250cm9sUGFuZWwuanMnO1xyXG5pbXBvcnQgU3BlYWtlck5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU3BlYWtlck5vZGUuanMnO1xyXG5pbXBvcnQgc291bmQgZnJvbSAnLi4vLi4vc291bmQuanMnO1xyXG5pbXBvcnQgU291bmRTdHJpbmdzIGZyb20gJy4uLy4uL1NvdW5kU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBTb3VuZE1vZGVsIGZyb20gJy4uL21vZGVsL1NvdW5kTW9kZWwuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgV0FWRV9NQVJHSU4gPSA4OyAvLyBBZGRpdGlvbmFsIG1hcmdpbiBzaG93biBhcm91bmQgdGhlIHdhdmUgbGF0dGljZVxyXG5jb25zdCBHQVVHRV9TUEFDSU5HX1ggPSA4O1xyXG5jb25zdCBHQVVHRV9TUEFDSU5HX1kgPSAxNjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvdW5kU2NyZWVuVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG5cclxuICAvLyBhbGlnbnMgdGhlIGNvbnRyb2wgcGFuZWxzXHJcbiAgcHVibGljIHJlYWRvbmx5IGNvbnRvbFBhbmVsQWxpZ25Hcm91cDogQWxpZ25Hcm91cDtcclxuXHJcbiAgLy8gY29udHJvbCBwYW5lbCByZXNwb25zaWJsZSBmb3IgdGhlIGF1ZGlvIGNvbnRyb2xzXHJcbiAgcHVibGljIHJlYWRvbmx5IGF1ZGlvQ29udHJvbFBhbmVsOiBBdWRpb0NvbnRyb2xQYW5lbCB8IG51bGwgPSBudWxsO1xyXG4gIHByb3RlY3RlZCByZWFkb25seSBjYW52YXNOb2RlOiBMYXR0aWNlQ2FudmFzTm9kZTtcclxuXHJcbiAgLy8gY29udHJvbCBwYW5lbCByZXNwb3NpYmxlIGZvciBzZXR0aW5nIHRoZSBmcmVxdWVuY3kgYW5kIGFtcGxpdHVkZVxyXG4gIHB1YmxpYyByZWFkb25seSBjb250cm9sUGFuZWw6IFNvdW5kQ29udHJvbFBhbmVsO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IHdhdmVBcmVhTm9kZTogUmVjdGFuZ2xlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc3BlYWtlck5vZGUxOiBTcGVha2VyTm9kZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogU291bmRNb2RlbCAmIHtcclxuICAgIGF1ZGlvQ29udHJvbFNldHRpbmdQcm9wZXJ0eT86IFByb3BlcnR5PCdTUEVBS0VSJyB8ICdMSVNURU5FUic+O1xyXG4gICAgbGlzdGVuZXJQb3NpdGlvblByb3BlcnR5PzogUHJvcGVydHk8VmVjdG9yMj47XHJcbiAgICBwcmVzc3VyZVByb3BlcnR5PzogTnVtYmVyUHJvcGVydHk7XHJcbiAgfSApIHtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy53YXZlQXJlYU5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCA1MDAsIDUwMCwge1xyXG4gICAgICBmaWxsOiAnIzRjNGM0YycsXHJcbiAgICAgIHRvcDogU291bmRDb25zdGFudHMuQ09OVFJPTF9QQU5FTF9NQVJHSU4gKyBXQVZFX01BUkdJTiArIDE1LFxyXG4gICAgICBjZW50ZXJYOiB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJYIC0gMTQyXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy53YXZlQXJlYU5vZGUgKTtcclxuXHJcbiAgICB0aGlzLmNhbnZhc05vZGUgPSBuZXcgTGF0dGljZUNhbnZhc05vZGUoIG1vZGVsLmxhdHRpY2UsIHtcclxuICAgICAgYmFzZUNvbG9yOiBDb2xvci53aGl0ZSxcclxuICAgICAgaGFzUmVmbGVjdGlvbjogbW9kZWwuaGFzUmVmbGVjdGlvbixcclxuICAgICAgc291cmNlUG9zaXRpb246IG5ldyBWZWN0b3IyKCBTb3VuZENvbnN0YW50cy5TT1VSQ0VfUE9TSVRJT05fWCwgTWF0aC5mbG9vciggbW9kZWwubW9kZWxUb0xhdHRpY2VUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBtb2RlbC5zcGVha2VyMVBvc2l0aW9uLnkgKSApICksXHJcbiAgICAgIGhhc1NlY29uZFNvdXJjZTogbW9kZWwuaGFzU2Vjb25kU291cmNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbGF0dGljZVNjYWxlID0gdGhpcy53YXZlQXJlYU5vZGUud2lkdGggLyB0aGlzLmNhbnZhc05vZGUud2lkdGg7XHJcbiAgICB0aGlzLmNhbnZhc05vZGUubXV0YXRlKCB7XHJcbiAgICAgIHNjYWxlOiBsYXR0aWNlU2NhbGUsXHJcbiAgICAgIGNlbnRlcjogdGhpcy53YXZlQXJlYU5vZGUuY2VudGVyLFxyXG4gICAgICB2aXNpYmxlOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5jYW52YXNOb2RlICk7XHJcblxyXG4gICAgdGhpcy5jb250b2xQYW5lbEFsaWduR3JvdXAgPSBuZXcgQWxpZ25Hcm91cCgge1xyXG4gICAgICBtYXRjaFZlcnRpY2FsOiBmYWxzZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY29udHJvbFBhbmVsID0gbmV3IFNvdW5kQ29udHJvbFBhbmVsKCBtb2RlbCwgdGhpcy5jb250b2xQYW5lbEFsaWduR3JvdXAgKTtcclxuXHJcbiAgICB0aGlzLmNvbnRyb2xQYW5lbC5tdXRhdGUoIHtcclxuICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gU291bmRDb25zdGFudHMuQ09OVFJPTF9QQU5FTF9NQVJHSU4sXHJcbiAgICAgIHRvcDogU291bmRDb25zdGFudHMuQ09OVFJPTF9QQU5FTF9NQVJHSU4gKyBTb3VuZENvbnN0YW50cy5DT05UUk9MX1BBTkVMX1NQQUNJTkdcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmNvbnRyb2xQYW5lbCApO1xyXG5cclxuICAgIGlmICggbW9kZWwuaXNBdWRpb0VuYWJsZWRQcm9wZXJ0eSApIHtcclxuICAgICAgdGhpcy5hdWRpb0NvbnRyb2xQYW5lbCA9IG5ldyBBdWRpb0NvbnRyb2xQYW5lbCggbW9kZWwsIHRoaXMuY29udG9sUGFuZWxBbGlnbkdyb3VwICk7XHJcblxyXG4gICAgICB0aGlzLmF1ZGlvQ29udHJvbFBhbmVsLm11dGF0ZSgge1xyXG4gICAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5yaWdodCAtIFNvdW5kQ29uc3RhbnRzLkNPTlRST0xfUEFORUxfTUFSR0lOLFxyXG4gICAgICAgIHRvcDogdGhpcy5jb250cm9sUGFuZWwuYm90dG9tICsgU291bmRDb25zdGFudHMuQ09OVFJPTF9QQU5FTF9TUEFDSU5HXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuYXVkaW9Db250cm9sUGFuZWwgKTtcclxuXHJcbiAgICAgIC8vIEFtcGxpdHVkZSBvZiB0aGUgaGVhcmFibGUgdG9uZVxyXG4gICAgICBjb25zdCBzb3VuZEFtcGl0dWRlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0aGUgZmluYWwgYW1wbGl0dWRlIG9mIHRoZSBzaW5lIHdhdmUgdG9uZVxyXG4gICAgICBjb25zdCB1cGRhdGVTb3VuZEFtcGxpdHVkZSA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCBhbXBsaXR1ZGVEYW1wZW5pbmcgPSBtb2RlbC5hdWRpb0NvbnRyb2xTZXR0aW5nUHJvcGVydHkgJiYgbW9kZWwuYXVkaW9Db250cm9sU2V0dGluZ1Byb3BlcnR5LnZhbHVlID09PSAnTElTVEVORVInID8gKCBTb3VuZENvbnN0YW50cy5MSVNURU5FUl9CT1VORFNfWC5tYXggLSBtb2RlbC5saXN0ZW5lclBvc2l0aW9uUHJvcGVydHkhLnZhbHVlLnggKSAvICggU291bmRDb25zdGFudHMuTElTVEVORVJfQk9VTkRTX1gubWF4IC0gU291bmRDb25zdGFudHMuTElTVEVORVJfQk9VTkRTX1gubWluICkgOiAxO1xyXG4gICAgICAgIGNvbnN0IHByZXNzdXJlRGFtcGVuaW5nID0gbW9kZWwucHJlc3N1cmVQcm9wZXJ0eSA/IG1vZGVsLnByZXNzdXJlUHJvcGVydHkudmFsdWUgOiAxO1xyXG4gICAgICAgIHNvdW5kQW1waXR1ZGVQcm9wZXJ0eS5zZXQoIG1vZGVsLmFtcGxpdHVkZVByb3BlcnR5LnZhbHVlIC8gMS41ICogYW1wbGl0dWRlRGFtcGVuaW5nICogcHJlc3N1cmVEYW1wZW5pbmcgKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIG1vZGVsLmFtcGxpdHVkZVByb3BlcnR5LmxpbmsoIHVwZGF0ZVNvdW5kQW1wbGl0dWRlICk7XHJcblxyXG4gICAgICBpZiAoIG1vZGVsLnByZXNzdXJlUHJvcGVydHkgKSB7XHJcbiAgICAgICAgbW9kZWwucHJlc3N1cmVQcm9wZXJ0eS5saW5rKCB1cGRhdGVTb3VuZEFtcGxpdHVkZSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIG1vZGVsLmF1ZGlvQ29udHJvbFNldHRpbmdQcm9wZXJ0eSApIHtcclxuICAgICAgICBtb2RlbC5hdWRpb0NvbnRyb2xTZXR0aW5nUHJvcGVydHkubGluayggdXBkYXRlU291bmRBbXBsaXR1ZGUgKTtcclxuICAgICAgICBtb2RlbC5saXN0ZW5lclBvc2l0aW9uUHJvcGVydHkhLmxpbmsoIHVwZGF0ZVNvdW5kQW1wbGl0dWRlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHNpbmVXYXZlUGxheWVyID0gbmV3IFdhdmVHZW5lcmF0b3IoXHJcbiAgICAgICAgbW9kZWwuZnJlcXVlbmN5UHJvcGVydHksXHJcbiAgICAgICAgc291bmRBbXBpdHVkZVByb3BlcnR5LCB7XHJcbiAgICAgICAgICBlbmFibGVDb250cm9sUHJvcGVydGllczogW1xyXG4gICAgICAgICAgICBtb2RlbC5pc0F1ZGlvRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgICAgICAgICBtb2RlbC5pc1J1bm5pbmdQcm9wZXJ0eVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIFN1cHByZXNzIHRoZSB0b25lIHdoZW4gYW5vdGhlciBzY3JlZW4gaXMgc2VsZWN0ZWRcclxuICAgICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBzaW5lV2F2ZVBsYXllciwge1xyXG4gICAgICAgIGFzc29jaWF0ZWRWaWV3Tm9kZTogdGhpc1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUGFzc2VzIHRoZSBib3VuZHMgb2YgdGhlIGNhbnZhcyB0byB0aGUgbW9kZWwgZm9yIHVzZSBpbiBpdHMgbW9kZWxWaWV3VHJhbmZvcm1zXHJcbiAgICBtb2RlbC5zZXRWaWV3Qm91bmRzKCB0aGlzLndhdmVBcmVhTm9kZS5ib3VuZHMgKTtcclxuXHJcbiAgICBpZiAoIG1vZGVsLnByZXNzdXJlUHJvcGVydHkgKSB7XHJcbiAgICAgIGNvbnN0IHNwZWFrZXJDZW50ZXIgPSBtb2RlbC5tb2RlbFZpZXdUcmFuc2Zvcm0hLm1vZGVsVG9WaWV3UG9zaXRpb24oIG1vZGVsLnNwZWFrZXIxUG9zaXRpb24gKTtcclxuICAgICAgY29uc3QgYm94U2l6ZVggPSAxNTA7XHJcbiAgICAgIGNvbnN0IGJveFNpemVZID0gMjAwO1xyXG5cclxuICAgICAgLy8gUHJlc3N1cmUgYm94LlxyXG4gICAgICBjb25zdCBib3ggPSBuZXcgUmVjdGFuZ2xlKCBzcGVha2VyQ2VudGVyLnggLSBib3hTaXplWCAvIDIsIHNwZWFrZXJDZW50ZXIueSAtIGJveFNpemVZIC8gMiwgYm94U2l6ZVgsIGJveFNpemVZLCB7XHJcbiAgICAgICAgc3Ryb2tlOiAnI2YzZDk5YicsXHJcbiAgICAgICAgbGluZVdpZHRoOiAzXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIERhcmtlbiB0aGUgcHJlc3N1cmUgYm94IGluIGxvdyBwcmVzc3VyZXMuXHJcbiAgICAgIG1vZGVsLnByZXNzdXJlUHJvcGVydHkubGluayggcHJvcCA9PiB7XHJcbiAgICAgICAgYm94LnNldEZpbGwoIG5ldyBDb2xvciggMCwgMCwgMCwgMSAtIHByb3AgKSApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICB0aGlzLmFkZENoaWxkKCBib3ggKTtcclxuXHJcbiAgICAgIC8vIFByZXNzdXJlIGdhdWdlLlxyXG4gICAgICBjb25zdCBnYXVnZSA9IG5ldyBHYXVnZU5vZGUoIG1vZGVsLnByZXNzdXJlUHJvcGVydHksIFNvdW5kU3RyaW5ncy5hdG1TdHJpbmdQcm9wZXJ0eSwgbW9kZWwucHJlc3N1cmVQcm9wZXJ0eS5yYW5nZSApO1xyXG4gICAgICBnYXVnZS5jZW50ZXJYID0gc3BlYWtlckNlbnRlci54O1xyXG4gICAgICBnYXVnZS5zY2FsZSggMC40ICk7XHJcbiAgICAgIGdhdWdlLmJvdHRvbSA9IHNwZWFrZXJDZW50ZXIueSAtIGJveFNpemVZIC8gMjtcclxuXHJcbiAgICAgIGNvbnN0IG9uZVRleHQgPSBuZXcgVGV4dCggJzEuMCcgKTtcclxuICAgICAgY29uc3QgemVyb1RleHQgPSBuZXcgVGV4dCggJzAuMCcgKTtcclxuXHJcbiAgICAgIG9uZVRleHQuY2VudGVyWSA9IGdhdWdlLmNlbnRlclkgKyBHQVVHRV9TUEFDSU5HX1k7XHJcbiAgICAgIHplcm9UZXh0LmNlbnRlclkgPSBnYXVnZS5jZW50ZXJZICsgR0FVR0VfU1BBQ0lOR19ZO1xyXG4gICAgICBvbmVUZXh0LnJpZ2h0ID0gZ2F1Z2UucmlnaHQgLSBHQVVHRV9TUEFDSU5HX1g7XHJcbiAgICAgIHplcm9UZXh0LmxlZnQgPSBnYXVnZS5sZWZ0ICsgR0FVR0VfU1BBQ0lOR19YO1xyXG5cclxuICAgICAgdGhpcy5hZGRDaGlsZCggZ2F1Z2UgKTtcclxuXHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG9uZVRleHQgKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggemVyb1RleHQgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gRmlyc3Qgc3BlYWtlclxyXG4gICAgdGhpcy5zcGVha2VyTm9kZTEgPSBuZXcgU3BlYWtlck5vZGUoIG1vZGVsLm9zY2lsbGF0b3JQcm9wZXJ0eSApO1xyXG4gICAgY29uc3Qgdmlld1Bvc2l0aW9uID0gbW9kZWwubW9kZWxWaWV3VHJhbnNmb3JtIS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBtb2RlbC5zcGVha2VyMVBvc2l0aW9uICk7XHJcbiAgICB2aWV3UG9zaXRpb24uc2V0WCggdmlld1Bvc2l0aW9uLnggKyBTb3VuZENvbnN0YW50cy5TUEVBS0VSX09GRlNFVCApO1xyXG4gICAgdGhpcy5zcGVha2VyTm9kZTEuc2V0UmlnaHRDZW50ZXIoIHZpZXdQb3NpdGlvbiApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5zcGVha2VyTm9kZTEgKTtcclxuXHJcbiAgICAvLyBQYXVzZS9wbGF5L3N0ZXAgYnV0dG9ucy5cclxuICAgIGNvbnN0IHRpbWVDb250cm9sTm9kZSA9IG5ldyBUaW1lQ29udHJvbE5vZGUoIG1vZGVsLmlzUnVubmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGJvdHRvbTogdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gU291bmRDb25zdGFudHMuQ09OVFJPTF9QQU5FTF9NQVJHSU4sXHJcbiAgICAgIGNlbnRlclg6IHRoaXMud2F2ZUFyZWFOb2RlLmNlbnRlclgsXHJcblxyXG4gICAgICBwbGF5UGF1c2VTdGVwQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIHN0ZXBGb3J3YXJkQnV0dG9uT3B0aW9uczoge1xyXG5cclxuICAgICAgICAgIC8vIElmIHdlIG5lZWQgdG8gbW92ZSBmb3J3YXJkIGZ1cnRoZXIgdGhhbiBvbmUgZnJhbWUsIGNhbGwgYWR2YW5jZVRpbWUgc2V2ZXJhbCB0aW1lcyByYXRoZXIgdGhhbiBpbmNyZWFzaW5nIHRoZVxyXG4gICAgICAgICAgLy8gZHQsIHNvIHRoZSBtb2RlbCB3aWxsIGJlaGF2ZSB0aGUgc2FtZSxcclxuICAgICAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvd2F2ZS1pbnRlcmZlcmVuY2UvaXNzdWVzLzI1NFxyXG4gICAgICAgICAgLy8gYW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy93YXZlLWludGVyZmVyZW5jZS9pc3N1ZXMvMjI2XHJcbiAgICAgICAgICBsaXN0ZW5lcjogKCkgPT4gbW9kZWwuYWR2YW5jZVRpbWUoIDEgLyBTb3VuZENvbnN0YW50cy5FVkVOVF9SQVRFLCB0cnVlIClcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aW1lQ29udHJvbE5vZGUgKTtcclxuXHJcbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7IC8vIGNhbmNlbCBpbnRlcmFjdGlvbnMgdGhhdCBtYXkgYmUgaW4gcHJvZ3Jlc3NcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIFNvdW5kQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1hfTUFSR0lOLFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLm1heFkgLSBTb3VuZENvbnN0YW50cy5TQ1JFRU5fVklFV19ZX01BUkdJTlxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJlc2V0QWxsQnV0dG9uICk7XHJcbiAgfVxyXG59XHJcblxyXG5zb3VuZC5yZWdpc3RlciggJ1NvdW5kU2NyZWVuVmlldycsIFNvdW5kU2NyZWVuVmlldyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPQSxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLG9DQUFvQztBQUMzRCxPQUFPQyxjQUFjLE1BQU0sdURBQXVEO0FBQ2xGLE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsT0FBT0MsZUFBZSxNQUFNLGdEQUFnRDtBQUM1RSxTQUFTQyxVQUFVLEVBQUVDLFNBQVMsRUFBRUMsSUFBSSxFQUFFQyxLQUFLLFFBQVEsbUNBQW1DO0FBQ3RGLE9BQU9DLFlBQVksTUFBTSxzQ0FBc0M7QUFDL0QsT0FBT0MsYUFBYSxNQUFNLHdEQUF3RDtBQUNsRixPQUFPQyxjQUFjLE1BQU0sZ0NBQWdDO0FBQzNELE9BQU9DLGlCQUFpQixNQUFNLHdDQUF3QztBQUN0RSxPQUFPQyxpQkFBaUIsTUFBTSx3Q0FBd0M7QUFDdEUsT0FBT0MsaUJBQWlCLE1BQU0sd0NBQXdDO0FBQ3RFLE9BQU9DLFdBQVcsTUFBTSxrQ0FBa0M7QUFDMUQsT0FBT0MsS0FBSyxNQUFNLGdCQUFnQjtBQUNsQyxPQUFPQyxZQUFZLE1BQU0sdUJBQXVCO0FBRWhELE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFHcEQ7QUFDQSxNQUFNQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkIsTUFBTUMsZUFBZSxHQUFHLENBQUM7QUFDekIsTUFBTUMsZUFBZSxHQUFHLEVBQUU7QUFFMUIsZUFBZSxNQUFNQyxl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