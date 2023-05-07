// Copyright 2018-2023, University of Colorado Boulder
// @ts-nocheck
/**
 * Provides simulation-specific values and customizations to display a SeismographNode in a chart.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import DynamicSeries from '../../../../griddle/js/DynamicSeries.js';
import SeismographNode from '../../../../griddle/js/SeismographNode.js';
import isHMR from '../../../../phet-core/js/isHMR.js';
import merge from '../../../../phet-core/js/merge.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import ShadedRectangle from '../../../../scenery-phet/js/ShadedRectangle.js';
import WireNode from '../../../../scenery-phet/js/WireNode.js';
import { Color, HBox, InteractiveHighlightingNode, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import waveMeterSawTone_mp3 from '../../../sounds/waveMeterSawTone_mp3.js';
import waveMeterSmoothTone_mp3 from '../../../sounds/waveMeterSmoothTone_mp3.js';
import waveInterference from '../../waveInterference.js';
import WaveInterferenceStrings from '../../WaveInterferenceStrings.js';
import getWaveMeterNodeOutputLevel from './getWaveMeterNodeOutputLevel.js';
import SceneToggleNode from './SceneToggleNode.js';
import WaveInterferenceText from './WaveInterferenceText.js';
import WaveMeterProbeNode from './WaveMeterProbeNode.js';
isHMR && module.hot.accept('./getWaveMeterNodeOutputLevel.js', _.noop);
const timeString = WaveInterferenceStrings.time;

// sounds
const sounds = [waveMeterSawTone_mp3, waveMeterSmoothTone_mp3];

// constants
const SERIES_1_COLOR = '#191919';
const SERIES_2_COLOR = '#808080';
const WIRE_1_COLOR = SERIES_1_COLOR;
const WIRE_2_COLOR = new Color(SERIES_2_COLOR).darkerColor(0.7);
const NUMBER_OF_TIME_DIVISIONS = 4;
const AXIS_LABEL_FILL = 'white';
const LABEL_FONT_SIZE = 14;

// For the wires
const NORMAL_DISTANCE = 25;
const WIRE_LINE_WIDTH = 3;
class WaveMeterNode extends Node {
  /**
   * @param model - model for reading values
   * @param view - for getting coordinates for model
   * @param [options]
   */
  constructor(model, view, options) {
    options = merge({
      timeDivisions: NUMBER_OF_TIME_DIVISIONS,
      // Prevent adjustment of the control panel rendering while dragging,
      // see https://github.com/phetsims/wave-interference/issues/212
      preventFit: true
    }, options);

    // interactive highlighting - highlights will surround the draggable background on mouse and touch
    const backgroundNode = new InteractiveHighlightingNode({
      cursor: 'pointer'
    });
    super();

    // @public (read-only) {Node} - shows the background for the chart.  Any attached probes or other
    // supplemental nodes should not be children of the backgroundNode if they need to translate independently.
    this.backgroundNode = backgroundNode;

    // @private {DragListener} - set by setDragListener
    this.backgroundDragListener = null;
    this.addChild(this.backgroundNode);

    // Mutate after backgroundNode is added as a child
    this.mutate(options);

    // @public {boolean} - true if dragging the chart also causes attached probes to translate.
    // This is accomplished by calling alignProbes() on drag start and each drag event.
    this.synchronizeProbePositions = false;

    // @public - emits when the probes should be put in standard relative position to the body
    this.alignProbesEmitter = new Emitter();

    // @private - triggered when the probe is reset
    this.resetEmitter = new Emitter();

    // These do not need to be disposed because there is no connection to the "outside world"
    const leftBottomProperty = new DerivedProperty([this.backgroundNode.boundsProperty], bounds => bounds.leftBottom);

    // @public - emits when the WaveMeterNode has been dropped
    this.droppedEmitter = new Emitter();
    const droppedEmitter = this.droppedEmitter;

    /**
     * @param color
     * @param wireColor
     * @param dx - initial relative x coordinate for the probe
     * @param dy - initial relative y coordinate for the probe
     * @param connectionProperty
     * @param sounds
     * @param soundIndexProperty
     * @param playbackRateProperty
     * @param volumeProperty
     * @param isPlayingProperty
     * @param seriesVolume
     */
    const initializeSeries = (color, wireColor, dx, dy, connectionProperty, sounds, soundIndexProperty, playbackRateProperty, volumeProperty, isPlayingProperty, seriesVolume) => {
      const snapToCenter = () => {
        if (model.rotationAmountProperty.value !== 0 && model.sceneProperty.value === model.waterScene) {
          const point = view.waveAreaNode.center;
          const global = view.waveAreaNode.parentToGlobalPoint(point);
          const local = probeNode.globalToParentPoint(global);
          probeNode.setY(local.y);
        }
      };
      const probeNode = new WaveMeterProbeNode(view.visibleBoundsProperty, {
        color: color,
        dragStart: () => this.moveToFront(),
        drag: snapToCenter
      });
      const lowProperty = new Property(0.75);
      if (phet.chipper.queryParameters.dev) {
        probeNode.addChild(new VBox({
          centerX: 0,
          top: 100,
          children: [new HBox({
            spacing: 5,
            children: [new RectangularPushButton({
              content: new Text('-', {
                fontSize: 20
              }),
              listener: () => {
                soundIndexProperty.value = Math.max(soundIndexProperty.value - 1, 0);
              }
            }), new RectangularPushButton({
              content: new Text('+', {
                fontSize: 20
              }),
              listener: () => {
                soundIndexProperty.value = Math.min(soundIndexProperty.value + 1, sounds.length - 1);
              }
            })]
          }), new NumberControl('low', lowProperty, new Range(0.25, 2.5), {
            delta: 0.05
          })]
        }));
      }

      // Move probes to centerline when the meter body is dropped
      droppedEmitter.addListener(snapToCenter);

      // Move probes when rotation is changed
      model.rotationAmountProperty.link(snapToCenter);

      // Add the wire behind the probe.
      this.addChild(new WireNode(connectionProperty, new Vector2Property(new Vector2(-NORMAL_DISTANCE, 0)), new DerivedProperty([probeNode.boundsProperty], bounds => bounds.centerBottom), new Vector2Property(new Vector2(0, NORMAL_DISTANCE)), {
        lineWidth: WIRE_LINE_WIDTH,
        stroke: wireColor
      }));
      this.addChild(probeNode);

      // Standard position in toolbox and when dragging out of toolbox.
      const alignProbes = () => {
        probeNode.mutate({
          right: backgroundNode.left - dx,
          top: backgroundNode.top + dy
        });

        // Prevent the probes from going out of the visible bounds when tagging along with the dragged WaveMeterNode
        probeNode.translation = view.visibleBoundsProperty.value.closestPointTo(probeNode.translation);
      };
      this.visibleProperty.lazyLink(alignProbes);
      this.alignProbesEmitter.addListener(alignProbes);
      const dynamicSeries = new DynamicSeries({
        color: color
      });
      dynamicSeries.probeNode = probeNode;
      const updateSamples = () => {
        // Set the range by incorporating the model's time units, so it will match with the timer.
        const maxSeconds = NUMBER_OF_TIME_DIVISIONS;
        const scene = model.sceneProperty.value;
        if (model.isWaveMeterInPlayAreaProperty.get()) {
          // Look up the coordinates of the cell. The probe node has the cross-hairs at 0,0, so we can use the
          // translation itself as the sensor hot spot.  This doesn't include the damping regions
          const latticeCoordinates = view.globalToLatticeCoordinate(probeNode.parentToGlobalPoint(probeNode.getTranslation()));
          const sampleI = latticeCoordinates.x + scene.lattice.dampX;
          const sampleJ = latticeCoordinates.y + scene.lattice.dampY;
          const soundClip = sounds[soundIndexProperty.value];
          if (scene.lattice.visibleBoundsContains(sampleI, sampleJ)) {
            const value = scene.lattice.getCurrentValue(sampleI, sampleJ);
            dynamicSeries.addXYDataPoint(scene.timeProperty.value, value);
            if (!soundManager.hasSoundGenerator(soundClip)) {
              soundManager.addSoundGenerator(soundClip, {
                associatedViewNode: this
              });
            }

            // 19dB (the amount the audio file was decreased by) corresponds to this amplitude scale, see
            // https://github.com/phetsims/wave-interference/issues/485#issuecomment-634295284
            const amplitudeScale = 8.912509381337454;
            const outputLevel = getWaveMeterNodeOutputLevel(value) * amplitudeScale * seriesVolume;

            // "Play Tone" takes precedence over the wave meter node sounds, because it is meant to be used briefly
            const isDucking = model.sceneProperty.value === model.soundScene && model.soundScene.isTonePlayingProperty.value;
            const duckFactor = isDucking ? 0.1 : 1;

            // Set the main volume.  If the sound clip wasn't playing, set the sound immediately to correct an audio
            // blip when the probe enters the play area.  If the sound clip was playing, use a longer time constant
            // to eliminate clipping, scratching sounds when dragging the probes quickly
            const amplitudeValue = model.isRunningProperty.value ? outputLevel * volumeProperty.value : 0;
            soundClip.setOutputLevel(duckFactor * amplitudeValue, soundClip.isPlaying ? 0.03 : 0.0);
            if (!soundClip.isPlaying) {
              soundClip.play();
              isPlayingProperty.value = true;
            }
            const basePlaybackRate = lowProperty.value * playbackRateProperty.value;
            if (value > 0) {
              soundClip.setPlaybackRate(basePlaybackRate * 4 / 3); // Perfect 4th
            } else {
              soundClip.setPlaybackRate(basePlaybackRate);
            }
          } else {
            soundClip.stop();
            isPlayingProperty.value = false;
          }
        } else {
          dynamicSeries.addXYDataPoint(scene.timeProperty.value, NaN);
        }
        while (dynamicSeries.hasData() && dynamicSeries.getDataPoint(0).x < scene.timeProperty.value - maxSeconds) {
          dynamicSeries.shiftData();
        }
      };

      // Redraw the probe data when the scene changes
      const clear = () => {
        dynamicSeries.clear();
        updateSamples();
      };
      model.sceneProperty.link(clear);
      model.resetEmitter.addListener(clear);

      // The probe is also reset when dropped back in the toolbox.
      this.resetEmitter.addListener(clear);

      // When the wave is paused and the user is dragging the entire chart with the probes aligned, they
      // need to sample their new positions.
      probeNode.transformEmitter.addListener(updateSamples);
      model.isRunningProperty.link(updateSamples);

      // When a Scene's lattice changes, update the samples
      model.scenes.forEach(scene => scene.lattice.changedEmitter.addListener(updateSamples));
      return dynamicSeries;
    };
    const aboveBottomLeft1Property = new DerivedProperty([leftBottomProperty], position => position.isFinite() ? position.plusXY(0, -20) : Vector2.ZERO);
    const aboveBottomLeft2Property = new DerivedProperty([leftBottomProperty], position => position.isFinite() ? position.plusXY(0, -10) : Vector2.ZERO);

    // Hooks for customization in the dev tools
    const waveMeterSound1Property = new Property(0);
    const waveMeterSound2Property = new Property(1);
    const waveMeterSound1PlaybackRateProperty = new Property(1);
    const waveMeterSound2PlaybackRateProperty = new Property(1.01);
    const waveMeterSound1VolumeProperty = new Property(0.1);
    const waveMeterSound2VolumeProperty = new Property(0.05);
    const sounds1 = sounds.map(sound => {
      return new SoundClip(sound, {
        loop: true,
        trimSilence: false
      });
    });
    const sounds2 = sounds.map(sound => {
      return new SoundClip(sound, {
        loop: true,
        trimSilence: false
      });
    });
    const series1PlayingProperty = new BooleanProperty(false);
    const series2PlayingProperty = new BooleanProperty(false);
    const series1 = initializeSeries(SERIES_1_COLOR, WIRE_1_COLOR, 5, 10, aboveBottomLeft1Property, sounds1, waveMeterSound1Property, waveMeterSound1PlaybackRateProperty, waveMeterSound1VolumeProperty, series1PlayingProperty, 1.0);
    const series2 = initializeSeries(SERIES_2_COLOR, WIRE_2_COLOR, 42, 54, aboveBottomLeft2Property, sounds2, waveMeterSound2Property, waveMeterSound2PlaybackRateProperty, waveMeterSound2VolumeProperty, series2PlayingProperty, 0.42);

    // @public {DerivedProperty.<number>} - Turn down the water drops, speaker or light sound when the wave meter is being used.
    this.duckingProperty = new DerivedProperty([series1PlayingProperty, series2PlayingProperty], (a, b) => {
      if (a || b) {
        return 0.3;
      } else {
        return 1;
      }
    });
    const verticalAxisTitleNode = new SceneToggleNode(model, scene => new WaveInterferenceText(scene.graphVerticalAxisLabel, {
      fontSize: LABEL_FONT_SIZE,
      rotation: -Math.PI / 2,
      fill: AXIS_LABEL_FILL
    }));
    const horizontalAxisTitleNode = new WaveInterferenceText(timeString, {
      fontSize: LABEL_FONT_SIZE,
      fill: AXIS_LABEL_FILL
    });
    const scaleIndicatorText = new SceneToggleNode(model, scene => new WaveInterferenceText(scene.oneTimerUnit, {
      fontSize: 11,
      fill: 'white'
    }));

    // Create the scrolling chart content and add it to the background.  There is an order-of-creation cycle which
    // prevents the scrolling node from being added to the background before the super() call, so this will have to
    // suffice.
    //
    // Select the time for the selected scene.
    const timeProperty = new DynamicProperty(model.sceneProperty, {
      derive: 'timeProperty'
    });
    const seismographNode = new SeismographNode(timeProperty, [series1, series2], scaleIndicatorText, {
      width: 150,
      height: 110,
      verticalAxisLabelNode: verticalAxisTitleNode,
      horizontalAxisLabelNode: horizontalAxisTitleNode,
      showVerticalGridLabels: false
    });
    const shadedRectangle = new ShadedRectangle(seismographNode.bounds.dilated(7));
    shadedRectangle.addChild(seismographNode);
    backgroundNode.addChild(shadedRectangle);
    this.alignProbesEmitter.emit();
  }

  /**
   * Reset the probe when dropped back in the toolbox.
   */
  reset() {
    this.resetEmitter.emit();
    this.alignProbesEmitter.emit();
  }

  /**
   * Gets the region of the background in global coordinates.  This can be used to determine if the chart
   * should be dropped back in a toolbox.
   */
  getBackgroundNodeGlobalBounds() {
    return this.localToGlobalBounds(this.backgroundNode.bounds);
  }

  /**
   * Forward an event from the toolbox to start dragging the node in the play area.  This triggers the probes (if any)
   * to drag together with the chart.  This is accomplished by calling this.alignProbes() at each drag event.
   */
  startDrag(event) {
    // Forward the event to the drag listener
    this.backgroundDragListener.press(event, this.backgroundNode);
  }

  /**
   * Set the drag listener, wires it up and uses it for forwarding events from the toolbox icon.
   */
  setDragListener(dragListener) {
    assert && assert(this.backgroundDragListener === null, 'setDragListener must be called no more than once');
    this.backgroundDragListener = dragListener;
    this.backgroundNode.addInputListener(dragListener);
  }
}
waveInterference.register('WaveMeterNode', WaveMeterNode);
export default WaveMeterNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJEeW5hbWljUHJvcGVydHkiLCJFbWl0dGVyIiwiUHJvcGVydHkiLCJSYW5nZSIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJEeW5hbWljU2VyaWVzIiwiU2Vpc21vZ3JhcGhOb2RlIiwiaXNITVIiLCJtZXJnZSIsIk51bWJlckNvbnRyb2wiLCJTaGFkZWRSZWN0YW5nbGUiLCJXaXJlTm9kZSIsIkNvbG9yIiwiSEJveCIsIkludGVyYWN0aXZlSGlnaGxpZ2h0aW5nTm9kZSIsIk5vZGUiLCJUZXh0IiwiVkJveCIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIlNvdW5kQ2xpcCIsInNvdW5kTWFuYWdlciIsIndhdmVNZXRlclNhd1RvbmVfbXAzIiwid2F2ZU1ldGVyU21vb3RoVG9uZV9tcDMiLCJ3YXZlSW50ZXJmZXJlbmNlIiwiV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MiLCJnZXRXYXZlTWV0ZXJOb2RlT3V0cHV0TGV2ZWwiLCJTY2VuZVRvZ2dsZU5vZGUiLCJXYXZlSW50ZXJmZXJlbmNlVGV4dCIsIldhdmVNZXRlclByb2JlTm9kZSIsIm1vZHVsZSIsImhvdCIsImFjY2VwdCIsIl8iLCJub29wIiwidGltZVN0cmluZyIsInRpbWUiLCJzb3VuZHMiLCJTRVJJRVNfMV9DT0xPUiIsIlNFUklFU18yX0NPTE9SIiwiV0lSRV8xX0NPTE9SIiwiV0lSRV8yX0NPTE9SIiwiZGFya2VyQ29sb3IiLCJOVU1CRVJfT0ZfVElNRV9ESVZJU0lPTlMiLCJBWElTX0xBQkVMX0ZJTEwiLCJMQUJFTF9GT05UX1NJWkUiLCJOT1JNQUxfRElTVEFOQ0UiLCJXSVJFX0xJTkVfV0lEVEgiLCJXYXZlTWV0ZXJOb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInZpZXciLCJvcHRpb25zIiwidGltZURpdmlzaW9ucyIsInByZXZlbnRGaXQiLCJiYWNrZ3JvdW5kTm9kZSIsImN1cnNvciIsImJhY2tncm91bmREcmFnTGlzdGVuZXIiLCJhZGRDaGlsZCIsIm11dGF0ZSIsInN5bmNocm9uaXplUHJvYmVQb3NpdGlvbnMiLCJhbGlnblByb2Jlc0VtaXR0ZXIiLCJyZXNldEVtaXR0ZXIiLCJsZWZ0Qm90dG9tUHJvcGVydHkiLCJib3VuZHNQcm9wZXJ0eSIsImJvdW5kcyIsImxlZnRCb3R0b20iLCJkcm9wcGVkRW1pdHRlciIsImluaXRpYWxpemVTZXJpZXMiLCJjb2xvciIsIndpcmVDb2xvciIsImR4IiwiZHkiLCJjb25uZWN0aW9uUHJvcGVydHkiLCJzb3VuZEluZGV4UHJvcGVydHkiLCJwbGF5YmFja1JhdGVQcm9wZXJ0eSIsInZvbHVtZVByb3BlcnR5IiwiaXNQbGF5aW5nUHJvcGVydHkiLCJzZXJpZXNWb2x1bWUiLCJzbmFwVG9DZW50ZXIiLCJyb3RhdGlvbkFtb3VudFByb3BlcnR5IiwidmFsdWUiLCJzY2VuZVByb3BlcnR5Iiwid2F0ZXJTY2VuZSIsInBvaW50Iiwid2F2ZUFyZWFOb2RlIiwiY2VudGVyIiwiZ2xvYmFsIiwicGFyZW50VG9HbG9iYWxQb2ludCIsImxvY2FsIiwicHJvYmVOb2RlIiwiZ2xvYmFsVG9QYXJlbnRQb2ludCIsInNldFkiLCJ5IiwidmlzaWJsZUJvdW5kc1Byb3BlcnR5IiwiZHJhZ1N0YXJ0IiwibW92ZVRvRnJvbnQiLCJkcmFnIiwibG93UHJvcGVydHkiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImRldiIsImNlbnRlclgiLCJ0b3AiLCJjaGlsZHJlbiIsInNwYWNpbmciLCJjb250ZW50IiwiZm9udFNpemUiLCJsaXN0ZW5lciIsIk1hdGgiLCJtYXgiLCJtaW4iLCJsZW5ndGgiLCJkZWx0YSIsImFkZExpc3RlbmVyIiwibGluayIsImNlbnRlckJvdHRvbSIsImxpbmVXaWR0aCIsInN0cm9rZSIsImFsaWduUHJvYmVzIiwicmlnaHQiLCJsZWZ0IiwidHJhbnNsYXRpb24iLCJjbG9zZXN0UG9pbnRUbyIsInZpc2libGVQcm9wZXJ0eSIsImxhenlMaW5rIiwiZHluYW1pY1NlcmllcyIsInVwZGF0ZVNhbXBsZXMiLCJtYXhTZWNvbmRzIiwic2NlbmUiLCJpc1dhdmVNZXRlckluUGxheUFyZWFQcm9wZXJ0eSIsImdldCIsImxhdHRpY2VDb29yZGluYXRlcyIsImdsb2JhbFRvTGF0dGljZUNvb3JkaW5hdGUiLCJnZXRUcmFuc2xhdGlvbiIsInNhbXBsZUkiLCJ4IiwibGF0dGljZSIsImRhbXBYIiwic2FtcGxlSiIsImRhbXBZIiwic291bmRDbGlwIiwidmlzaWJsZUJvdW5kc0NvbnRhaW5zIiwiZ2V0Q3VycmVudFZhbHVlIiwiYWRkWFlEYXRhUG9pbnQiLCJ0aW1lUHJvcGVydHkiLCJoYXNTb3VuZEdlbmVyYXRvciIsImFkZFNvdW5kR2VuZXJhdG9yIiwiYXNzb2NpYXRlZFZpZXdOb2RlIiwiYW1wbGl0dWRlU2NhbGUiLCJvdXRwdXRMZXZlbCIsImlzRHVja2luZyIsInNvdW5kU2NlbmUiLCJpc1RvbmVQbGF5aW5nUHJvcGVydHkiLCJkdWNrRmFjdG9yIiwiYW1wbGl0dWRlVmFsdWUiLCJpc1J1bm5pbmdQcm9wZXJ0eSIsInNldE91dHB1dExldmVsIiwiaXNQbGF5aW5nIiwicGxheSIsImJhc2VQbGF5YmFja1JhdGUiLCJzZXRQbGF5YmFja1JhdGUiLCJzdG9wIiwiTmFOIiwiaGFzRGF0YSIsImdldERhdGFQb2ludCIsInNoaWZ0RGF0YSIsImNsZWFyIiwidHJhbnNmb3JtRW1pdHRlciIsInNjZW5lcyIsImZvckVhY2giLCJjaGFuZ2VkRW1pdHRlciIsImFib3ZlQm90dG9tTGVmdDFQcm9wZXJ0eSIsInBvc2l0aW9uIiwiaXNGaW5pdGUiLCJwbHVzWFkiLCJaRVJPIiwiYWJvdmVCb3R0b21MZWZ0MlByb3BlcnR5Iiwid2F2ZU1ldGVyU291bmQxUHJvcGVydHkiLCJ3YXZlTWV0ZXJTb3VuZDJQcm9wZXJ0eSIsIndhdmVNZXRlclNvdW5kMVBsYXliYWNrUmF0ZVByb3BlcnR5Iiwid2F2ZU1ldGVyU291bmQyUGxheWJhY2tSYXRlUHJvcGVydHkiLCJ3YXZlTWV0ZXJTb3VuZDFWb2x1bWVQcm9wZXJ0eSIsIndhdmVNZXRlclNvdW5kMlZvbHVtZVByb3BlcnR5Iiwic291bmRzMSIsIm1hcCIsInNvdW5kIiwibG9vcCIsInRyaW1TaWxlbmNlIiwic291bmRzMiIsInNlcmllczFQbGF5aW5nUHJvcGVydHkiLCJzZXJpZXMyUGxheWluZ1Byb3BlcnR5Iiwic2VyaWVzMSIsInNlcmllczIiLCJkdWNraW5nUHJvcGVydHkiLCJhIiwiYiIsInZlcnRpY2FsQXhpc1RpdGxlTm9kZSIsImdyYXBoVmVydGljYWxBeGlzTGFiZWwiLCJyb3RhdGlvbiIsIlBJIiwiZmlsbCIsImhvcml6b250YWxBeGlzVGl0bGVOb2RlIiwic2NhbGVJbmRpY2F0b3JUZXh0Iiwib25lVGltZXJVbml0IiwiZGVyaXZlIiwic2Vpc21vZ3JhcGhOb2RlIiwid2lkdGgiLCJoZWlnaHQiLCJ2ZXJ0aWNhbEF4aXNMYWJlbE5vZGUiLCJob3Jpem9udGFsQXhpc0xhYmVsTm9kZSIsInNob3dWZXJ0aWNhbEdyaWRMYWJlbHMiLCJzaGFkZWRSZWN0YW5nbGUiLCJkaWxhdGVkIiwiZW1pdCIsInJlc2V0IiwiZ2V0QmFja2dyb3VuZE5vZGVHbG9iYWxCb3VuZHMiLCJsb2NhbFRvR2xvYmFsQm91bmRzIiwic3RhcnREcmFnIiwiZXZlbnQiLCJwcmVzcyIsInNldERyYWdMaXN0ZW5lciIsImRyYWdMaXN0ZW5lciIsImFzc2VydCIsImFkZElucHV0TGlzdGVuZXIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIldhdmVNZXRlck5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcbi8vIEB0cy1ub2NoZWNrXHJcbi8qKlxyXG4gKiBQcm92aWRlcyBzaW11bGF0aW9uLXNwZWNpZmljIHZhbHVlcyBhbmQgY3VzdG9taXphdGlvbnMgdG8gZGlzcGxheSBhIFNlaXNtb2dyYXBoTm9kZSBpbiBhIGNoYXJ0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IER5bmFtaWNQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0R5bmFtaWNQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRHluYW1pY1NlcmllcyBmcm9tICcuLi8uLi8uLi8uLi9ncmlkZGxlL2pzL0R5bmFtaWNTZXJpZXMuanMnO1xyXG5pbXBvcnQgU2Vpc21vZ3JhcGhOb2RlIGZyb20gJy4uLy4uLy4uLy4uL2dyaWRkbGUvanMvU2Vpc21vZ3JhcGhOb2RlLmpzJztcclxuaW1wb3J0IGlzSE1SIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9pc0hNUi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgTnVtYmVyQ29udHJvbCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTnVtYmVyQ29udHJvbC5qcyc7XHJcbmltcG9ydCBTaGFkZWRSZWN0YW5nbGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1NoYWRlZFJlY3RhbmdsZS5qcyc7XHJcbmltcG9ydCBXaXJlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvV2lyZU5vZGUuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgSEJveCwgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmdOb2RlLCBOb2RlLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgU291bmRDbGlwIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvU291bmRDbGlwLmpzJztcclxuaW1wb3J0IHNvdW5kTWFuYWdlciBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9zb3VuZE1hbmFnZXIuanMnO1xyXG5pbXBvcnQgd2F2ZU1ldGVyU2F3VG9uZV9tcDMgZnJvbSAnLi4vLi4vLi4vc291bmRzL3dhdmVNZXRlclNhd1RvbmVfbXAzLmpzJztcclxuaW1wb3J0IHdhdmVNZXRlclNtb290aFRvbmVfbXAzIGZyb20gJy4uLy4uLy4uL3NvdW5kcy93YXZlTWV0ZXJTbW9vdGhUb25lX21wMy5qcyc7XHJcbmltcG9ydCB3YXZlSW50ZXJmZXJlbmNlIGZyb20gJy4uLy4uL3dhdmVJbnRlcmZlcmVuY2UuanMnO1xyXG5pbXBvcnQgV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MgZnJvbSAnLi4vLi4vV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgZ2V0V2F2ZU1ldGVyTm9kZU91dHB1dExldmVsIGZyb20gJy4vZ2V0V2F2ZU1ldGVyTm9kZU91dHB1dExldmVsLmpzJztcclxuaW1wb3J0IFNjZW5lVG9nZ2xlTm9kZSBmcm9tICcuL1NjZW5lVG9nZ2xlTm9kZS5qcyc7XHJcbmltcG9ydCBXYXZlSW50ZXJmZXJlbmNlVGV4dCBmcm9tICcuL1dhdmVJbnRlcmZlcmVuY2VUZXh0LmpzJztcclxuaW1wb3J0IFdhdmVNZXRlclByb2JlTm9kZSBmcm9tICcuL1dhdmVNZXRlclByb2JlTm9kZS5qcyc7XHJcblxyXG5pc0hNUiAmJiBtb2R1bGUuaG90LmFjY2VwdCggJy4vZ2V0V2F2ZU1ldGVyTm9kZU91dHB1dExldmVsLmpzJywgXy5ub29wICk7XHJcblxyXG5jb25zdCB0aW1lU3RyaW5nID0gV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MudGltZTtcclxuXHJcbi8vIHNvdW5kc1xyXG5jb25zdCBzb3VuZHMgPSBbIHdhdmVNZXRlclNhd1RvbmVfbXAzLCB3YXZlTWV0ZXJTbW9vdGhUb25lX21wMyBdO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFNFUklFU18xX0NPTE9SID0gJyMxOTE5MTknO1xyXG5jb25zdCBTRVJJRVNfMl9DT0xPUiA9ICcjODA4MDgwJztcclxuY29uc3QgV0lSRV8xX0NPTE9SID0gU0VSSUVTXzFfQ09MT1I7XHJcbmNvbnN0IFdJUkVfMl9DT0xPUiA9IG5ldyBDb2xvciggU0VSSUVTXzJfQ09MT1IgKS5kYXJrZXJDb2xvciggMC43ICk7XHJcbmNvbnN0IE5VTUJFUl9PRl9USU1FX0RJVklTSU9OUyA9IDQ7XHJcbmNvbnN0IEFYSVNfTEFCRUxfRklMTCA9ICd3aGl0ZSc7XHJcbmNvbnN0IExBQkVMX0ZPTlRfU0laRSA9IDE0O1xyXG5cclxuLy8gRm9yIHRoZSB3aXJlc1xyXG5jb25zdCBOT1JNQUxfRElTVEFOQ0UgPSAyNTtcclxuY29uc3QgV0lSRV9MSU5FX1dJRFRIID0gMztcclxuXHJcbmNsYXNzIFdhdmVNZXRlck5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIG1vZGVsIC0gbW9kZWwgZm9yIHJlYWRpbmcgdmFsdWVzXHJcbiAgICogQHBhcmFtIHZpZXcgLSBmb3IgZ2V0dGluZyBjb29yZGluYXRlcyBmb3IgbW9kZWxcclxuICAgKiBAcGFyYW0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbCwgdmlldywgb3B0aW9ucyApIHtcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICB0aW1lRGl2aXNpb25zOiBOVU1CRVJfT0ZfVElNRV9ESVZJU0lPTlMsXHJcblxyXG4gICAgICAvLyBQcmV2ZW50IGFkanVzdG1lbnQgb2YgdGhlIGNvbnRyb2wgcGFuZWwgcmVuZGVyaW5nIHdoaWxlIGRyYWdnaW5nLFxyXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3dhdmUtaW50ZXJmZXJlbmNlL2lzc3Vlcy8yMTJcclxuICAgICAgcHJldmVudEZpdDogdHJ1ZVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGludGVyYWN0aXZlIGhpZ2hsaWdodGluZyAtIGhpZ2hsaWdodHMgd2lsbCBzdXJyb3VuZCB0aGUgZHJhZ2dhYmxlIGJhY2tncm91bmQgb24gbW91c2UgYW5kIHRvdWNoXHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kTm9kZSA9IG5ldyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ05vZGUoIHsgY3Vyc29yOiAncG9pbnRlcicgfSApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7Tm9kZX0gLSBzaG93cyB0aGUgYmFja2dyb3VuZCBmb3IgdGhlIGNoYXJ0LiAgQW55IGF0dGFjaGVkIHByb2JlcyBvciBvdGhlclxyXG4gICAgLy8gc3VwcGxlbWVudGFsIG5vZGVzIHNob3VsZCBub3QgYmUgY2hpbGRyZW4gb2YgdGhlIGJhY2tncm91bmROb2RlIGlmIHRoZXkgbmVlZCB0byB0cmFuc2xhdGUgaW5kZXBlbmRlbnRseS5cclxuICAgIHRoaXMuYmFja2dyb3VuZE5vZGUgPSBiYWNrZ3JvdW5kTm9kZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7RHJhZ0xpc3RlbmVyfSAtIHNldCBieSBzZXREcmFnTGlzdGVuZXJcclxuICAgIHRoaXMuYmFja2dyb3VuZERyYWdMaXN0ZW5lciA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5iYWNrZ3JvdW5kTm9kZSApO1xyXG5cclxuICAgIC8vIE11dGF0ZSBhZnRlciBiYWNrZ3JvdW5kTm9kZSBpcyBhZGRlZCBhcyBhIGNoaWxkXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gdHJ1ZSBpZiBkcmFnZ2luZyB0aGUgY2hhcnQgYWxzbyBjYXVzZXMgYXR0YWNoZWQgcHJvYmVzIHRvIHRyYW5zbGF0ZS5cclxuICAgIC8vIFRoaXMgaXMgYWNjb21wbGlzaGVkIGJ5IGNhbGxpbmcgYWxpZ25Qcm9iZXMoKSBvbiBkcmFnIHN0YXJ0IGFuZCBlYWNoIGRyYWcgZXZlbnQuXHJcbiAgICB0aGlzLnN5bmNocm9uaXplUHJvYmVQb3NpdGlvbnMgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gZW1pdHMgd2hlbiB0aGUgcHJvYmVzIHNob3VsZCBiZSBwdXQgaW4gc3RhbmRhcmQgcmVsYXRpdmUgcG9zaXRpb24gdG8gdGhlIGJvZHlcclxuICAgIHRoaXMuYWxpZ25Qcm9iZXNFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHRyaWdnZXJlZCB3aGVuIHRoZSBwcm9iZSBpcyByZXNldFxyXG4gICAgdGhpcy5yZXNldEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIC8vIFRoZXNlIGRvIG5vdCBuZWVkIHRvIGJlIGRpc3Bvc2VkIGJlY2F1c2UgdGhlcmUgaXMgbm8gY29ubmVjdGlvbiB0byB0aGUgXCJvdXRzaWRlIHdvcmxkXCJcclxuICAgIGNvbnN0IGxlZnRCb3R0b21Qcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5iYWNrZ3JvdW5kTm9kZS5ib3VuZHNQcm9wZXJ0eSBdLCBib3VuZHMgPT4gYm91bmRzLmxlZnRCb3R0b20gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gZW1pdHMgd2hlbiB0aGUgV2F2ZU1ldGVyTm9kZSBoYXMgYmVlbiBkcm9wcGVkXHJcbiAgICB0aGlzLmRyb3BwZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgIGNvbnN0IGRyb3BwZWRFbWl0dGVyID0gdGhpcy5kcm9wcGVkRW1pdHRlcjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSBjb2xvclxyXG4gICAgICogQHBhcmFtIHdpcmVDb2xvclxyXG4gICAgICogQHBhcmFtIGR4IC0gaW5pdGlhbCByZWxhdGl2ZSB4IGNvb3JkaW5hdGUgZm9yIHRoZSBwcm9iZVxyXG4gICAgICogQHBhcmFtIGR5IC0gaW5pdGlhbCByZWxhdGl2ZSB5IGNvb3JkaW5hdGUgZm9yIHRoZSBwcm9iZVxyXG4gICAgICogQHBhcmFtIGNvbm5lY3Rpb25Qcm9wZXJ0eVxyXG4gICAgICogQHBhcmFtIHNvdW5kc1xyXG4gICAgICogQHBhcmFtIHNvdW5kSW5kZXhQcm9wZXJ0eVxyXG4gICAgICogQHBhcmFtIHBsYXliYWNrUmF0ZVByb3BlcnR5XHJcbiAgICAgKiBAcGFyYW0gdm9sdW1lUHJvcGVydHlcclxuICAgICAqIEBwYXJhbSBpc1BsYXlpbmdQcm9wZXJ0eVxyXG4gICAgICogQHBhcmFtIHNlcmllc1ZvbHVtZVxyXG4gICAgICovXHJcbiAgICBjb25zdCBpbml0aWFsaXplU2VyaWVzID0gKCBjb2xvciwgd2lyZUNvbG9yLCBkeCwgZHksIGNvbm5lY3Rpb25Qcm9wZXJ0eSwgc291bmRzLCBzb3VuZEluZGV4UHJvcGVydHksIHBsYXliYWNrUmF0ZVByb3BlcnR5LCB2b2x1bWVQcm9wZXJ0eSwgaXNQbGF5aW5nUHJvcGVydHksIHNlcmllc1ZvbHVtZSApOiBEeW5hbWljU2VyaWVzID0+IHtcclxuICAgICAgY29uc3Qgc25hcFRvQ2VudGVyID0gKCkgPT4ge1xyXG4gICAgICAgIGlmICggbW9kZWwucm90YXRpb25BbW91bnRQcm9wZXJ0eS52YWx1ZSAhPT0gMCAmJiBtb2RlbC5zY2VuZVByb3BlcnR5LnZhbHVlID09PSBtb2RlbC53YXRlclNjZW5lICkge1xyXG4gICAgICAgICAgY29uc3QgcG9pbnQgPSB2aWV3LndhdmVBcmVhTm9kZS5jZW50ZXI7XHJcbiAgICAgICAgICBjb25zdCBnbG9iYWwgPSB2aWV3LndhdmVBcmVhTm9kZS5wYXJlbnRUb0dsb2JhbFBvaW50KCBwb2ludCApO1xyXG4gICAgICAgICAgY29uc3QgbG9jYWwgPSBwcm9iZU5vZGUuZ2xvYmFsVG9QYXJlbnRQb2ludCggZ2xvYmFsICk7XHJcbiAgICAgICAgICBwcm9iZU5vZGUuc2V0WSggbG9jYWwueSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgY29uc3QgcHJvYmVOb2RlID0gbmV3IFdhdmVNZXRlclByb2JlTm9kZSggdmlldy52aXNpYmxlQm91bmRzUHJvcGVydHksIHtcclxuICAgICAgICBjb2xvcjogY29sb3IsXHJcbiAgICAgICAgZHJhZ1N0YXJ0OiAoKSA9PiB0aGlzLm1vdmVUb0Zyb250KCksXHJcbiAgICAgICAgZHJhZzogc25hcFRvQ2VudGVyXHJcbiAgICAgIH0gKTtcclxuICAgICAgY29uc3QgbG93UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAuNzUgKTtcclxuICAgICAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmRldiApIHtcclxuICAgICAgICBwcm9iZU5vZGUuYWRkQ2hpbGQoIG5ldyBWQm94KCB7XHJcbiAgICAgICAgICBjZW50ZXJYOiAwLFxyXG4gICAgICAgICAgdG9wOiAxMDAsXHJcbiAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICBuZXcgSEJveCgge1xyXG4gICAgICAgICAgICAgIHNwYWNpbmc6IDUsXHJcbiAgICAgICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgICAgIG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgICAgICAgICAgICAgICAgY29udGVudDogbmV3IFRleHQoICctJywgeyBmb250U2l6ZTogMjAgfSApLFxyXG4gICAgICAgICAgICAgICAgICBsaXN0ZW5lcjogKCkgPT4ge3NvdW5kSW5kZXhQcm9wZXJ0eS52YWx1ZSA9IE1hdGgubWF4KCBzb3VuZEluZGV4UHJvcGVydHkudmFsdWUgLSAxLCAwICk7fVxyXG4gICAgICAgICAgICAgICAgfSApLFxyXG4gICAgICAgICAgICAgICAgbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xyXG4gICAgICAgICAgICAgICAgICBjb250ZW50OiBuZXcgVGV4dCggJysnLCB7IGZvbnRTaXplOiAyMCB9ICksXHJcbiAgICAgICAgICAgICAgICAgIGxpc3RlbmVyOiAoKSA9PiB7c291bmRJbmRleFByb3BlcnR5LnZhbHVlID0gTWF0aC5taW4oIHNvdW5kSW5kZXhQcm9wZXJ0eS52YWx1ZSArIDEsIHNvdW5kcy5sZW5ndGggLSAxICk7fVxyXG4gICAgICAgICAgICAgICAgfSApXHJcbiAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9ICksXHJcbiAgICAgICAgICAgIG5ldyBOdW1iZXJDb250cm9sKCAnbG93JywgbG93UHJvcGVydHksIG5ldyBSYW5nZSggMC4yNSwgMi41ICksIHsgZGVsdGE6IDAuMDUgfSApXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfSApICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE1vdmUgcHJvYmVzIHRvIGNlbnRlcmxpbmUgd2hlbiB0aGUgbWV0ZXIgYm9keSBpcyBkcm9wcGVkXHJcbiAgICAgIGRyb3BwZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBzbmFwVG9DZW50ZXIgKTtcclxuXHJcbiAgICAgIC8vIE1vdmUgcHJvYmVzIHdoZW4gcm90YXRpb24gaXMgY2hhbmdlZFxyXG4gICAgICBtb2RlbC5yb3RhdGlvbkFtb3VudFByb3BlcnR5LmxpbmsoIHNuYXBUb0NlbnRlciApO1xyXG5cclxuICAgICAgLy8gQWRkIHRoZSB3aXJlIGJlaGluZCB0aGUgcHJvYmUuXHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBXaXJlTm9kZSggY29ubmVjdGlvblByb3BlcnR5LCBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggLU5PUk1BTF9ESVNUQU5DRSwgMCApICksXHJcbiAgICAgICAgbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBwcm9iZU5vZGUuYm91bmRzUHJvcGVydHkgXSwgYm91bmRzID0+IGJvdW5kcy5jZW50ZXJCb3R0b20gKSxcclxuICAgICAgICBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggMCwgTk9STUFMX0RJU1RBTkNFICkgKSwge1xyXG4gICAgICAgICAgbGluZVdpZHRoOiBXSVJFX0xJTkVfV0lEVEgsXHJcbiAgICAgICAgICBzdHJva2U6IHdpcmVDb2xvclxyXG4gICAgICAgIH1cclxuICAgICAgKSApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBwcm9iZU5vZGUgKTtcclxuXHJcbiAgICAgIC8vIFN0YW5kYXJkIHBvc2l0aW9uIGluIHRvb2xib3ggYW5kIHdoZW4gZHJhZ2dpbmcgb3V0IG9mIHRvb2xib3guXHJcbiAgICAgIGNvbnN0IGFsaWduUHJvYmVzID0gKCkgPT4ge1xyXG4gICAgICAgIHByb2JlTm9kZS5tdXRhdGUoIHtcclxuICAgICAgICAgIHJpZ2h0OiBiYWNrZ3JvdW5kTm9kZS5sZWZ0IC0gZHgsXHJcbiAgICAgICAgICB0b3A6IGJhY2tncm91bmROb2RlLnRvcCArIGR5XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAvLyBQcmV2ZW50IHRoZSBwcm9iZXMgZnJvbSBnb2luZyBvdXQgb2YgdGhlIHZpc2libGUgYm91bmRzIHdoZW4gdGFnZ2luZyBhbG9uZyB3aXRoIHRoZSBkcmFnZ2VkIFdhdmVNZXRlck5vZGVcclxuICAgICAgICBwcm9iZU5vZGUudHJhbnNsYXRpb24gPSB2aWV3LnZpc2libGVCb3VuZHNQcm9wZXJ0eS52YWx1ZS5jbG9zZXN0UG9pbnRUbyggcHJvYmVOb2RlLnRyYW5zbGF0aW9uICk7XHJcbiAgICAgIH07XHJcbiAgICAgIHRoaXMudmlzaWJsZVByb3BlcnR5LmxhenlMaW5rKCBhbGlnblByb2JlcyApO1xyXG4gICAgICB0aGlzLmFsaWduUHJvYmVzRW1pdHRlci5hZGRMaXN0ZW5lciggYWxpZ25Qcm9iZXMgKTtcclxuXHJcbiAgICAgIGNvbnN0IGR5bmFtaWNTZXJpZXMgPSBuZXcgRHluYW1pY1NlcmllcyggeyBjb2xvcjogY29sb3IgfSApO1xyXG4gICAgICBkeW5hbWljU2VyaWVzLnByb2JlTm9kZSA9IHByb2JlTm9kZTtcclxuXHJcbiAgICAgIGNvbnN0IHVwZGF0ZVNhbXBsZXMgPSAoKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIFNldCB0aGUgcmFuZ2UgYnkgaW5jb3Jwb3JhdGluZyB0aGUgbW9kZWwncyB0aW1lIHVuaXRzLCBzbyBpdCB3aWxsIG1hdGNoIHdpdGggdGhlIHRpbWVyLlxyXG4gICAgICAgIGNvbnN0IG1heFNlY29uZHMgPSBOVU1CRVJfT0ZfVElNRV9ESVZJU0lPTlM7XHJcblxyXG4gICAgICAgIGNvbnN0IHNjZW5lID0gbW9kZWwuc2NlbmVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICBpZiAoIG1vZGVsLmlzV2F2ZU1ldGVySW5QbGF5QXJlYVByb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgICAgIC8vIExvb2sgdXAgdGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBjZWxsLiBUaGUgcHJvYmUgbm9kZSBoYXMgdGhlIGNyb3NzLWhhaXJzIGF0IDAsMCwgc28gd2UgY2FuIHVzZSB0aGVcclxuICAgICAgICAgIC8vIHRyYW5zbGF0aW9uIGl0c2VsZiBhcyB0aGUgc2Vuc29yIGhvdCBzcG90LiAgVGhpcyBkb2Vzbid0IGluY2x1ZGUgdGhlIGRhbXBpbmcgcmVnaW9uc1xyXG4gICAgICAgICAgY29uc3QgbGF0dGljZUNvb3JkaW5hdGVzID0gdmlldy5nbG9iYWxUb0xhdHRpY2VDb29yZGluYXRlKFxyXG4gICAgICAgICAgICBwcm9iZU5vZGUucGFyZW50VG9HbG9iYWxQb2ludCggcHJvYmVOb2RlLmdldFRyYW5zbGF0aW9uKCkgKVxyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBzYW1wbGVJID0gbGF0dGljZUNvb3JkaW5hdGVzLnggKyBzY2VuZS5sYXR0aWNlLmRhbXBYO1xyXG4gICAgICAgICAgY29uc3Qgc2FtcGxlSiA9IGxhdHRpY2VDb29yZGluYXRlcy55ICsgc2NlbmUubGF0dGljZS5kYW1wWTtcclxuXHJcbiAgICAgICAgICBjb25zdCBzb3VuZENsaXAgPSBzb3VuZHNbIHNvdW5kSW5kZXhQcm9wZXJ0eS52YWx1ZSBdO1xyXG5cclxuICAgICAgICAgIGlmICggc2NlbmUubGF0dGljZS52aXNpYmxlQm91bmRzQ29udGFpbnMoIHNhbXBsZUksIHNhbXBsZUogKSApIHtcclxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzY2VuZS5sYXR0aWNlLmdldEN1cnJlbnRWYWx1ZSggc2FtcGxlSSwgc2FtcGxlSiApO1xyXG4gICAgICAgICAgICBkeW5hbWljU2VyaWVzLmFkZFhZRGF0YVBvaW50KCBzY2VuZS50aW1lUHJvcGVydHkudmFsdWUsIHZhbHVlICk7XHJcblxyXG4gICAgICAgICAgICBpZiAoICFzb3VuZE1hbmFnZXIuaGFzU291bmRHZW5lcmF0b3IoIHNvdW5kQ2xpcCApICkge1xyXG4gICAgICAgICAgICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvciggc291bmRDbGlwLCB7IGFzc29jaWF0ZWRWaWV3Tm9kZTogdGhpcyB9ICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIDE5ZEIgKHRoZSBhbW91bnQgdGhlIGF1ZGlvIGZpbGUgd2FzIGRlY3JlYXNlZCBieSkgY29ycmVzcG9uZHMgdG8gdGhpcyBhbXBsaXR1ZGUgc2NhbGUsIHNlZVxyXG4gICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvd2F2ZS1pbnRlcmZlcmVuY2UvaXNzdWVzLzQ4NSNpc3N1ZWNvbW1lbnQtNjM0Mjk1Mjg0XHJcbiAgICAgICAgICAgIGNvbnN0IGFtcGxpdHVkZVNjYWxlID0gOC45MTI1MDkzODEzMzc0NTQ7XHJcbiAgICAgICAgICAgIGNvbnN0IG91dHB1dExldmVsID0gZ2V0V2F2ZU1ldGVyTm9kZU91dHB1dExldmVsKCB2YWx1ZSApICogYW1wbGl0dWRlU2NhbGUgKiBzZXJpZXNWb2x1bWU7XHJcblxyXG4gICAgICAgICAgICAvLyBcIlBsYXkgVG9uZVwiIHRha2VzIHByZWNlZGVuY2Ugb3ZlciB0aGUgd2F2ZSBtZXRlciBub2RlIHNvdW5kcywgYmVjYXVzZSBpdCBpcyBtZWFudCB0byBiZSB1c2VkIGJyaWVmbHlcclxuICAgICAgICAgICAgY29uc3QgaXNEdWNraW5nID0gbW9kZWwuc2NlbmVQcm9wZXJ0eS52YWx1ZSA9PT0gbW9kZWwuc291bmRTY2VuZSAmJiBtb2RlbC5zb3VuZFNjZW5lLmlzVG9uZVBsYXlpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICAgICAgY29uc3QgZHVja0ZhY3RvciA9IGlzRHVja2luZyA/IDAuMSA6IDE7XHJcblxyXG4gICAgICAgICAgICAvLyBTZXQgdGhlIG1haW4gdm9sdW1lLiAgSWYgdGhlIHNvdW5kIGNsaXAgd2Fzbid0IHBsYXlpbmcsIHNldCB0aGUgc291bmQgaW1tZWRpYXRlbHkgdG8gY29ycmVjdCBhbiBhdWRpb1xyXG4gICAgICAgICAgICAvLyBibGlwIHdoZW4gdGhlIHByb2JlIGVudGVycyB0aGUgcGxheSBhcmVhLiAgSWYgdGhlIHNvdW5kIGNsaXAgd2FzIHBsYXlpbmcsIHVzZSBhIGxvbmdlciB0aW1lIGNvbnN0YW50XHJcbiAgICAgICAgICAgIC8vIHRvIGVsaW1pbmF0ZSBjbGlwcGluZywgc2NyYXRjaGluZyBzb3VuZHMgd2hlbiBkcmFnZ2luZyB0aGUgcHJvYmVzIHF1aWNrbHlcclxuICAgICAgICAgICAgY29uc3QgYW1wbGl0dWRlVmFsdWUgPSBtb2RlbC5pc1J1bm5pbmdQcm9wZXJ0eS52YWx1ZSA/IG91dHB1dExldmVsICogdm9sdW1lUHJvcGVydHkudmFsdWUgOiAwO1xyXG4gICAgICAgICAgICBzb3VuZENsaXAuc2V0T3V0cHV0TGV2ZWwoIGR1Y2tGYWN0b3IgKiBhbXBsaXR1ZGVWYWx1ZSwgc291bmRDbGlwLmlzUGxheWluZyA/IDAuMDMgOiAwLjAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmICggIXNvdW5kQ2xpcC5pc1BsYXlpbmcgKSB7XHJcbiAgICAgICAgICAgICAgc291bmRDbGlwLnBsYXkoKTtcclxuICAgICAgICAgICAgICBpc1BsYXlpbmdQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGJhc2VQbGF5YmFja1JhdGUgPSBsb3dQcm9wZXJ0eS52YWx1ZSAqIHBsYXliYWNrUmF0ZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgICAgICBpZiAoIHZhbHVlID4gMCApIHtcclxuICAgICAgICAgICAgICBzb3VuZENsaXAuc2V0UGxheWJhY2tSYXRlKCBiYXNlUGxheWJhY2tSYXRlICogNCAvIDMgKTsgLy8gUGVyZmVjdCA0dGhcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICBzb3VuZENsaXAuc2V0UGxheWJhY2tSYXRlKCBiYXNlUGxheWJhY2tSYXRlICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzb3VuZENsaXAuc3RvcCgpO1xyXG4gICAgICAgICAgICBpc1BsYXlpbmdQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGR5bmFtaWNTZXJpZXMuYWRkWFlEYXRhUG9pbnQoIHNjZW5lLnRpbWVQcm9wZXJ0eS52YWx1ZSwgTmFOICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlICggZHluYW1pY1Nlcmllcy5oYXNEYXRhKCkgJiYgZHluYW1pY1Nlcmllcy5nZXREYXRhUG9pbnQoIDAgKS54IDwgc2NlbmUudGltZVByb3BlcnR5LnZhbHVlIC0gbWF4U2Vjb25kcyApIHtcclxuICAgICAgICAgIGR5bmFtaWNTZXJpZXMuc2hpZnREYXRhKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gUmVkcmF3IHRoZSBwcm9iZSBkYXRhIHdoZW4gdGhlIHNjZW5lIGNoYW5nZXNcclxuICAgICAgY29uc3QgY2xlYXIgPSAoKSA9PiB7XHJcbiAgICAgICAgZHluYW1pY1Nlcmllcy5jbGVhcigpO1xyXG4gICAgICAgIHVwZGF0ZVNhbXBsZXMoKTtcclxuICAgICAgfTtcclxuICAgICAgbW9kZWwuc2NlbmVQcm9wZXJ0eS5saW5rKCBjbGVhciApO1xyXG4gICAgICBtb2RlbC5yZXNldEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGNsZWFyICk7XHJcblxyXG4gICAgICAvLyBUaGUgcHJvYmUgaXMgYWxzbyByZXNldCB3aGVuIGRyb3BwZWQgYmFjayBpbiB0aGUgdG9vbGJveC5cclxuICAgICAgdGhpcy5yZXNldEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGNsZWFyICk7XHJcblxyXG4gICAgICAvLyBXaGVuIHRoZSB3YXZlIGlzIHBhdXNlZCBhbmQgdGhlIHVzZXIgaXMgZHJhZ2dpbmcgdGhlIGVudGlyZSBjaGFydCB3aXRoIHRoZSBwcm9iZXMgYWxpZ25lZCwgdGhleVxyXG4gICAgICAvLyBuZWVkIHRvIHNhbXBsZSB0aGVpciBuZXcgcG9zaXRpb25zLlxyXG4gICAgICBwcm9iZU5vZGUudHJhbnNmb3JtRW1pdHRlci5hZGRMaXN0ZW5lciggdXBkYXRlU2FtcGxlcyApO1xyXG5cclxuICAgICAgbW9kZWwuaXNSdW5uaW5nUHJvcGVydHkubGluayggdXBkYXRlU2FtcGxlcyApO1xyXG5cclxuICAgICAgLy8gV2hlbiBhIFNjZW5lJ3MgbGF0dGljZSBjaGFuZ2VzLCB1cGRhdGUgdGhlIHNhbXBsZXNcclxuICAgICAgbW9kZWwuc2NlbmVzLmZvckVhY2goIHNjZW5lID0+IHNjZW5lLmxhdHRpY2UuY2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHVwZGF0ZVNhbXBsZXMgKSApO1xyXG4gICAgICByZXR1cm4gZHluYW1pY1NlcmllcztcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgYWJvdmVCb3R0b21MZWZ0MVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyBsZWZ0Qm90dG9tUHJvcGVydHkgXSxcclxuICAgICAgcG9zaXRpb24gPT4gcG9zaXRpb24uaXNGaW5pdGUoKSA/IHBvc2l0aW9uLnBsdXNYWSggMCwgLTIwICkgOiBWZWN0b3IyLlpFUk9cclxuICAgICk7XHJcbiAgICBjb25zdCBhYm92ZUJvdHRvbUxlZnQyUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIGxlZnRCb3R0b21Qcm9wZXJ0eSBdLFxyXG4gICAgICBwb3NpdGlvbiA9PiBwb3NpdGlvbi5pc0Zpbml0ZSgpID8gcG9zaXRpb24ucGx1c1hZKCAwLCAtMTAgKSA6IFZlY3RvcjIuWkVST1xyXG4gICAgKTtcclxuXHJcbiAgICAvLyBIb29rcyBmb3IgY3VzdG9taXphdGlvbiBpbiB0aGUgZGV2IHRvb2xzXHJcbiAgICBjb25zdCB3YXZlTWV0ZXJTb3VuZDFQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMCApO1xyXG4gICAgY29uc3Qgd2F2ZU1ldGVyU291bmQyUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDEgKTtcclxuXHJcbiAgICBjb25zdCB3YXZlTWV0ZXJTb3VuZDFQbGF5YmFja1JhdGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMSApO1xyXG4gICAgY29uc3Qgd2F2ZU1ldGVyU291bmQyUGxheWJhY2tSYXRlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDEuMDEgKTtcclxuXHJcbiAgICBjb25zdCB3YXZlTWV0ZXJTb3VuZDFWb2x1bWVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMC4xICk7XHJcbiAgICBjb25zdCB3YXZlTWV0ZXJTb3VuZDJWb2x1bWVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMC4wNSApO1xyXG5cclxuICAgIGNvbnN0IHNvdW5kczEgPSBzb3VuZHMubWFwKCBzb3VuZCA9PiB7XHJcbiAgICAgIHJldHVybiBuZXcgU291bmRDbGlwKCBzb3VuZCwge1xyXG4gICAgICAgIGxvb3A6IHRydWUsXHJcbiAgICAgICAgdHJpbVNpbGVuY2U6IGZhbHNlXHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBzb3VuZHMyID0gc291bmRzLm1hcCggc291bmQgPT4ge1xyXG4gICAgICByZXR1cm4gbmV3IFNvdW5kQ2xpcCggc291bmQsIHtcclxuICAgICAgICBsb29wOiB0cnVlLFxyXG4gICAgICAgIHRyaW1TaWxlbmNlOiBmYWxzZVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc2VyaWVzMVBsYXlpbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICBjb25zdCBzZXJpZXMyUGxheWluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICBjb25zdCBzZXJpZXMxID0gaW5pdGlhbGl6ZVNlcmllcyggU0VSSUVTXzFfQ09MT1IsIFdJUkVfMV9DT0xPUiwgNSwgMTAsIGFib3ZlQm90dG9tTGVmdDFQcm9wZXJ0eSwgc291bmRzMSxcclxuICAgICAgd2F2ZU1ldGVyU291bmQxUHJvcGVydHksIHdhdmVNZXRlclNvdW5kMVBsYXliYWNrUmF0ZVByb3BlcnR5LCB3YXZlTWV0ZXJTb3VuZDFWb2x1bWVQcm9wZXJ0eSwgc2VyaWVzMVBsYXlpbmdQcm9wZXJ0eSxcclxuICAgICAgMS4wICk7XHJcblxyXG4gICAgY29uc3Qgc2VyaWVzMiA9IGluaXRpYWxpemVTZXJpZXMoIFNFUklFU18yX0NPTE9SLCBXSVJFXzJfQ09MT1IsIDQyLCA1NCwgYWJvdmVCb3R0b21MZWZ0MlByb3BlcnR5LCBzb3VuZHMyLFxyXG4gICAgICB3YXZlTWV0ZXJTb3VuZDJQcm9wZXJ0eSwgd2F2ZU1ldGVyU291bmQyUGxheWJhY2tSYXRlUHJvcGVydHksIHdhdmVNZXRlclNvdW5kMlZvbHVtZVByb3BlcnR5LCBzZXJpZXMyUGxheWluZ1Byb3BlcnR5LFxyXG4gICAgICAwLjQyICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RGVyaXZlZFByb3BlcnR5LjxudW1iZXI+fSAtIFR1cm4gZG93biB0aGUgd2F0ZXIgZHJvcHMsIHNwZWFrZXIgb3IgbGlnaHQgc291bmQgd2hlbiB0aGUgd2F2ZSBtZXRlciBpcyBiZWluZyB1c2VkLlxyXG4gICAgdGhpcy5kdWNraW5nUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHNlcmllczFQbGF5aW5nUHJvcGVydHksIHNlcmllczJQbGF5aW5nUHJvcGVydHkgXSwgKCBhLCBiICkgPT4ge1xyXG4gICAgICBpZiAoIGEgfHwgYiApIHtcclxuICAgICAgICByZXR1cm4gMC4zO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgdmVydGljYWxBeGlzVGl0bGVOb2RlID0gbmV3IFNjZW5lVG9nZ2xlTm9kZShcclxuICAgICAgbW9kZWwsXHJcbiAgICAgIHNjZW5lID0+IG5ldyBXYXZlSW50ZXJmZXJlbmNlVGV4dCggc2NlbmUuZ3JhcGhWZXJ0aWNhbEF4aXNMYWJlbCwge1xyXG4gICAgICAgIGZvbnRTaXplOiBMQUJFTF9GT05UX1NJWkUsXHJcbiAgICAgICAgcm90YXRpb246IC1NYXRoLlBJIC8gMixcclxuICAgICAgICBmaWxsOiBBWElTX0xBQkVMX0ZJTExcclxuICAgICAgfSApXHJcbiAgICApO1xyXG4gICAgY29uc3QgaG9yaXpvbnRhbEF4aXNUaXRsZU5vZGUgPSBuZXcgV2F2ZUludGVyZmVyZW5jZVRleHQoIHRpbWVTdHJpbmcsIHtcclxuICAgICAgZm9udFNpemU6IExBQkVMX0ZPTlRfU0laRSxcclxuICAgICAgZmlsbDogQVhJU19MQUJFTF9GSUxMXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBzY2FsZUluZGljYXRvclRleHQgPSBuZXcgU2NlbmVUb2dnbGVOb2RlKFxyXG4gICAgICBtb2RlbCxcclxuICAgICAgc2NlbmUgPT4gbmV3IFdhdmVJbnRlcmZlcmVuY2VUZXh0KCBzY2VuZS5vbmVUaW1lclVuaXQsIHtcclxuICAgICAgICBmb250U2l6ZTogMTEsXHJcbiAgICAgICAgZmlsbDogJ3doaXRlJ1xyXG4gICAgICB9IClcclxuICAgICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBzY3JvbGxpbmcgY2hhcnQgY29udGVudCBhbmQgYWRkIGl0IHRvIHRoZSBiYWNrZ3JvdW5kLiAgVGhlcmUgaXMgYW4gb3JkZXItb2YtY3JlYXRpb24gY3ljbGUgd2hpY2hcclxuICAgIC8vIHByZXZlbnRzIHRoZSBzY3JvbGxpbmcgbm9kZSBmcm9tIGJlaW5nIGFkZGVkIHRvIHRoZSBiYWNrZ3JvdW5kIGJlZm9yZSB0aGUgc3VwZXIoKSBjYWxsLCBzbyB0aGlzIHdpbGwgaGF2ZSB0b1xyXG4gICAgLy8gc3VmZmljZS5cclxuICAgIC8vXHJcbiAgICAvLyBTZWxlY3QgdGhlIHRpbWUgZm9yIHRoZSBzZWxlY3RlZCBzY2VuZS5cclxuICAgIGNvbnN0IHRpbWVQcm9wZXJ0eSA9IG5ldyBEeW5hbWljUHJvcGVydHkoIG1vZGVsLnNjZW5lUHJvcGVydHksIHtcclxuICAgICAgZGVyaXZlOiAndGltZVByb3BlcnR5J1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHNlaXNtb2dyYXBoTm9kZSA9IG5ldyBTZWlzbW9ncmFwaE5vZGUoIHRpbWVQcm9wZXJ0eSwgWyBzZXJpZXMxLCBzZXJpZXMyIF0sIHNjYWxlSW5kaWNhdG9yVGV4dCwge1xyXG4gICAgICB3aWR0aDogMTUwLFxyXG4gICAgICBoZWlnaHQ6IDExMCxcclxuICAgICAgdmVydGljYWxBeGlzTGFiZWxOb2RlOiB2ZXJ0aWNhbEF4aXNUaXRsZU5vZGUsXHJcbiAgICAgIGhvcml6b250YWxBeGlzTGFiZWxOb2RlOiBob3Jpem9udGFsQXhpc1RpdGxlTm9kZSxcclxuICAgICAgc2hvd1ZlcnRpY2FsR3JpZExhYmVsczogZmFsc2VcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHNoYWRlZFJlY3RhbmdsZSA9IG5ldyBTaGFkZWRSZWN0YW5nbGUoIHNlaXNtb2dyYXBoTm9kZS5ib3VuZHMuZGlsYXRlZCggNyApICk7XHJcbiAgICBzaGFkZWRSZWN0YW5nbGUuYWRkQ2hpbGQoIHNlaXNtb2dyYXBoTm9kZSApO1xyXG4gICAgYmFja2dyb3VuZE5vZGUuYWRkQ2hpbGQoIHNoYWRlZFJlY3RhbmdsZSApO1xyXG5cclxuICAgIHRoaXMuYWxpZ25Qcm9iZXNFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IHRoZSBwcm9iZSB3aGVuIGRyb3BwZWQgYmFjayBpbiB0aGUgdG9vbGJveC5cclxuICAgKi9cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlc2V0RW1pdHRlci5lbWl0KCk7XHJcbiAgICB0aGlzLmFsaWduUHJvYmVzRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSByZWdpb24gb2YgdGhlIGJhY2tncm91bmQgaW4gZ2xvYmFsIGNvb3JkaW5hdGVzLiAgVGhpcyBjYW4gYmUgdXNlZCB0byBkZXRlcm1pbmUgaWYgdGhlIGNoYXJ0XHJcbiAgICogc2hvdWxkIGJlIGRyb3BwZWQgYmFjayBpbiBhIHRvb2xib3guXHJcbiAgICovXHJcbiAgcHVibGljIGdldEJhY2tncm91bmROb2RlR2xvYmFsQm91bmRzKCk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMubG9jYWxUb0dsb2JhbEJvdW5kcyggdGhpcy5iYWNrZ3JvdW5kTm9kZS5ib3VuZHMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZvcndhcmQgYW4gZXZlbnQgZnJvbSB0aGUgdG9vbGJveCB0byBzdGFydCBkcmFnZ2luZyB0aGUgbm9kZSBpbiB0aGUgcGxheSBhcmVhLiAgVGhpcyB0cmlnZ2VycyB0aGUgcHJvYmVzIChpZiBhbnkpXHJcbiAgICogdG8gZHJhZyB0b2dldGhlciB3aXRoIHRoZSBjaGFydC4gIFRoaXMgaXMgYWNjb21wbGlzaGVkIGJ5IGNhbGxpbmcgdGhpcy5hbGlnblByb2JlcygpIGF0IGVhY2ggZHJhZyBldmVudC5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhcnREcmFnKCBldmVudCApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBGb3J3YXJkIHRoZSBldmVudCB0byB0aGUgZHJhZyBsaXN0ZW5lclxyXG4gICAgdGhpcy5iYWNrZ3JvdW5kRHJhZ0xpc3RlbmVyLnByZXNzKCBldmVudCwgdGhpcy5iYWNrZ3JvdW5kTm9kZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBkcmFnIGxpc3RlbmVyLCB3aXJlcyBpdCB1cCBhbmQgdXNlcyBpdCBmb3IgZm9yd2FyZGluZyBldmVudHMgZnJvbSB0aGUgdG9vbGJveCBpY29uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXREcmFnTGlzdGVuZXIoIGRyYWdMaXN0ZW5lciApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYmFja2dyb3VuZERyYWdMaXN0ZW5lciA9PT0gbnVsbCwgJ3NldERyYWdMaXN0ZW5lciBtdXN0IGJlIGNhbGxlZCBubyBtb3JlIHRoYW4gb25jZScgKTtcclxuICAgIHRoaXMuYmFja2dyb3VuZERyYWdMaXN0ZW5lciA9IGRyYWdMaXN0ZW5lcjtcclxuICAgIHRoaXMuYmFja2dyb3VuZE5vZGUuYWRkSW5wdXRMaXN0ZW5lciggZHJhZ0xpc3RlbmVyICk7XHJcbiAgfVxyXG59XHJcblxyXG53YXZlSW50ZXJmZXJlbmNlLnJlZ2lzdGVyKCAnV2F2ZU1ldGVyTm9kZScsIFdhdmVNZXRlck5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgV2F2ZU1ldGVyTm9kZTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFFdEQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsT0FBT0MsYUFBYSxNQUFNLHlDQUF5QztBQUNuRSxPQUFPQyxlQUFlLE1BQU0sMkNBQTJDO0FBQ3ZFLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxhQUFhLE1BQU0sOENBQThDO0FBQ3hFLE9BQU9DLGVBQWUsTUFBTSxnREFBZ0Q7QUFDNUUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsMkJBQTJCLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzlHLE9BQU9DLHFCQUFxQixNQUFNLHFEQUFxRDtBQUN2RixPQUFPQyxTQUFTLE1BQU0sb0RBQW9EO0FBQzFFLE9BQU9DLFlBQVksTUFBTSxzQ0FBc0M7QUFDL0QsT0FBT0Msb0JBQW9CLE1BQU0seUNBQXlDO0FBQzFFLE9BQU9DLHVCQUF1QixNQUFNLDRDQUE0QztBQUNoRixPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7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