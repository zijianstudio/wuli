// Copyright 2018-2023, University of Colorado Boulder
// @ts-nocheck
/**
 * Model for the "Waves" screen and other derivative screens.  This model supports two sources, even though the waves
 * screen only uses one.  The controls are in a metric coordinate frame, and there is a transformation to convert
 * metric coordinates to lattice coordinates.  On the view side there is another transformation to convert lattice or
 * metric coordinates to view coordinates.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import EventTimer from '../../../../phet-core/js/EventTimer.js';
import merge from '../../../../phet-core/js/merge.js';
import Stopwatch from '../../../../scenery-phet/js/Stopwatch.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import LightScene from '../../common/model/LightScene.js';
import Scene from '../../common/model/Scene.js';
import SoundScene from '../../common/model/SoundScene.js';
import WaterScene from '../../common/model/WaterScene.js';
import WaveInterferenceConstants from '../../common/WaveInterferenceConstants.js';
import WaveInterferenceUtils from '../../common/WaveInterferenceUtils.js';
import waveInterference from '../../waveInterference.js';
import WaveInterferenceStrings from '../../WaveInterferenceStrings.js';
const centimetersUnitsString = WaveInterferenceStrings.centimetersUnits;
const electricFieldAtCenterString = WaveInterferenceStrings.electricFieldAtCenter;
const electricFieldString = WaveInterferenceStrings.electricField;
const femtosecondConversionString = WaveInterferenceStrings.femtosecondConversion;
const femtosecondsUnitsString = WaveInterferenceStrings.femtosecondsUnits;
const lightGeneratorString = WaveInterferenceStrings.lightGenerator;
const millisecondConversionString = WaveInterferenceStrings.millisecondConversion;
const millisecondsUnitsString = WaveInterferenceStrings.millisecondsUnits;
const nanometersUnitsString = WaveInterferenceStrings.nanometersUnits;
const positionCMString = WaveInterferenceStrings.positionCM;
const positionNMString = WaveInterferenceStrings.positionNM;
const pressureAtCenterString = WaveInterferenceStrings.pressureAtCenter;
const pressureString = WaveInterferenceStrings.pressure;
const secondsUnitsString = WaveInterferenceStrings.secondsUnits;
const soundGeneratorString = WaveInterferenceStrings.soundGenerator;
const waterLevelAtCenterString = WaveInterferenceStrings.waterLevelAtCenter;
const waterLevelString = WaveInterferenceStrings.waterLevel;
const waterWaveGeneratorString = WaveInterferenceStrings.waterWaveGenerator;

// This simulation uses EventTimer, which provides exactly the same model behavior on very slow and very fast
// platforms.  Here we define the frequency of events in Hz, which has been tuned so that our slowest platform has
// an acceptable frame rate
const EVENT_RATE = 20 * WaveInterferenceConstants.CALIBRATION_SCALE;
const toFemto = WaveInterferenceUtils.toFemto;
class WavesModel {
  // the Scene instances as an array
  scenes = [];
  stopwatch = new Stopwatch({
    timePropertyOptions: {
      range: new Range(0, 999.99)
    }
  });

  /**
   * @param [options]
   */
  constructor(options) {
    options = merge({
      // This model supports one or two sources.  If the sources are initially separated, there are two sources
      numberOfSources: 1,
      // Initial amplitude of the oscillator, which is unitless and reflects the amount of disturbance at a specified
      // point in the medium. See WaveInterferenceConstants.AMPLITUDE_RANGE.  We optimize the view for the max, but
      // starting the value at the extreme may prevent the user from exploring the range, so we start closer to the
      // max but not at the max.  I chose 8 so it would match up directly with a tickmark (when it was at 7.5, it
      // covered 2 tickmarks and looked odd)
      initialAmplitude: 8,
      // True if SoundParticles should be created and displayed, and if the user can select to view them
      showSoundParticles: true,
      waveSpatialType: Scene.WaveSpatialType.POINT,
      // Array of scenes to be created
      scenes: ['waterScene', 'soundScene', 'lightScene']
    }, options);
    assert && assert(WaveInterferenceConstants.AMPLITUDE_RANGE.contains(options.initialAmplitude), `initialAmplitude is out of range: ${options.initialAmplitude}`);
    assert && assert(options.numberOfSources === 1 || options.numberOfSources === 2, 'Model only supports 1 or 2 sources');

    // Instantiate the Scenes.  Scene options are specified here to make it easier to compare options between scenes.
    // Scenes are only created if specified in the options.  For example, Wave Interference creates waterScene,
    // soundScene and lightScene whereas Waves Intro's Water screen only creates the waterScene.  This allows
    // pieces from different scenes to (such as showing a swappable frequency control in the same control panel)
    // but unfortunately leads to a lot of checks like if (model.waterScene){...} etc.  If implemented from scratch,
    // this may have been done differently, but this sim initially developed for Wave Interference only (all scenes)
    // and was later retrofitted to have a subset of scenes.  More discussion on this point appears in https://github.com/phetsims/wave-interference/issues/414#issuecomment-516079304

    // @public (read-only) {WaterScene|null}
    this.waterScene = null;

    // @public (read-only) {SoundScene|null}
    this.soundScene = null;

    // @public (read-only) {LightScene|null}
    this.lightScene = null;
    if (options.scenes.includes('waterScene')) {
      this.waterScene = new WaterScene({
        waveSpatialType: options.waveSpatialType,
        positionUnits: 'cm',
        translatedPositionUnits: centimetersUnitsString,
        timeUnits: secondsUnitsString,
        timeScaleString: '',
        graphVerticalAxisLabel: waterLevelString,
        graphTitle: waterLevelAtCenterString,
        graphHorizontalAxisLabel: positionCMString,
        waveAreaWidth: 10,
        // 10 centimeters
        frequencyRange: new Range(0.25, 1),
        // cycles per second
        scaleIndicatorLength: 1,
        // 1 centimeter
        numberOfSources: options.numberOfSources,
        // Calibration for water is done by measuring the empirical wave speed, since we want the timeScaleFactor to
        // remain as 1.0
        // in position units/time units, measured empirically as 5.4 seconds to cross the 10cm lattice
        waveSpeed: 1.65,
        timeScaleFactor: 1,
        // 1 second in real time = 1 second on the simulation timer

        initialSlitWidth: 1.5,
        // cm
        initialSlitSeparation: 3,
        // cm

        sourceSeparationRange: new Range(1, 5),
        // cm
        slitSeparationRange: new Range(1, 5),
        // cm
        slitWidthRange: new Range(0.5, 2.5),
        // cm

        initialAmplitude: options.initialAmplitude,
        linkDesiredAmplitudeToAmplitude: false,
        planeWaveGeneratorNodeText: waterWaveGeneratorString
      });
      this.scenes.push(this.waterScene);
    }

    // @public - Sound scene
    if (options.scenes.includes('soundScene')) {
      this.soundScene = new SoundScene(options.showSoundParticles, {
        waveSpatialType: options.waveSpatialType,
        positionUnits: 'cm',
        translatedPositionUnits: centimetersUnitsString,
        timeUnits: millisecondsUnitsString,
        timeScaleString: millisecondConversionString,
        graphVerticalAxisLabel: pressureString,
        graphTitle: pressureAtCenterString,
        graphHorizontalAxisLabel: positionCMString,
        waveAreaWidth: 500,
        // in cm

        // See https://pages.mtu.edu/~suits/notefreqs.html
        frequencyRange: new Range(
        // A3 in cycles per ms, wavelength is 156.8cm
        220 / 1000,
        // A4 in cycles per ms, wavelength is  78.4cm
        440 / 1000),
        scaleIndicatorLength: 50,
        // cm
        numberOfSources: options.numberOfSources,
        waveSpeed: 34.3,
        // in cm/ms

        // Determined empirically by setting timeScaleFactor to 1, then checking the displayed wavelength of maximum
        // frequency sound on the lattice and dividing by the desired wavelength.  ?log can be useful.  Can check/fine
        // tune by measuring the speed of sound.
        timeScaleFactor: 244.7 / 103.939 * 35.24 / 34.3,
        initialSlitWidth: 90,
        // cm
        initialSlitSeparation: 200,
        // cm
        sourceSeparationRange: new Range(100, 400),
        // cm
        slitWidthRange: new Range(20, 160),
        // cm
        slitSeparationRange: new Range(40, 320),
        // cm

        initialAmplitude: options.initialAmplitude,
        linkDesiredAmplitudeToAmplitude: true,
        planeWaveGeneratorNodeText: soundGeneratorString
      });
      this.scenes.push(this.soundScene);
    }

    // @public - Light scene.
    if (options.scenes.includes('lightScene')) {
      this.lightScene = new LightScene({
        waveSpatialType: options.waveSpatialType,
        positionUnits: 'nm',
        translatedPositionUnits: nanometersUnitsString,
        timeUnits: femtosecondsUnitsString,
        timeScaleString: femtosecondConversionString,
        graphVerticalAxisLabel: electricFieldString,
        graphTitle: electricFieldAtCenterString,
        graphHorizontalAxisLabel: positionNMString,
        waveAreaWidth: 5000,
        // nm

        // in cycles per femtosecond
        frequencyRange: new Range(toFemto(VisibleColor.MIN_FREQUENCY), toFemto(VisibleColor.MAX_FREQUENCY)),
        scaleIndicatorLength: 500,
        // nm

        numberOfSources: options.numberOfSources,
        // in nm/fs
        waveSpeed: 299.792458,
        // Determined empirically by setting timeScaleFactor to 1, then checking the displayed wavelength of maximum
        // frequency wave on the lattice and dividing by the desired wavelength.  Can check by measuring the speed of
        // light
        timeScaleFactor: 1416.5 / 511.034,
        // nm - if this value is too high, the light screen will oversaturate,
        // see https://github.com/phetsims/wave-interference/issues/209
        initialSlitWidth: 500,
        // nm
        initialSlitSeparation: 1500,
        // nm
        sourceSeparationRange: new Range(500, 4000),
        // nm
        slitWidthRange: new Range(200, 1600),
        // nm
        slitSeparationRange: new Range(400, 3200),
        // nm

        initialAmplitude: options.initialAmplitude,
        linkDesiredAmplitudeToAmplitude: true,
        planeWaveGeneratorNodeText: lightGeneratorString
      });
      this.scenes.push(this.lightScene);
    }

    // @public (read-only) {number} - number of sources that can emit
    this.numberOfSources = options.numberOfSources;

    // @public - indicates the user selection for side view or top view
    this.viewpointProperty = new Property(WavesModel.Viewpoint.TOP, {
      validValues: WavesModel.Viewpoint.VALUES
    });

    // @public - the speed at which the simulation is playing
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);
    const eventTimerModel = {
      // @public
      getPeriodBeforeNextEvent: () => {
        const scaleFactor = this.timeSpeedProperty.value === TimeSpeed.NORMAL ? 1.0 : 0.5;
        return 1 / EVENT_RATE / scaleFactor;
      }
    };

    // @private - In order to have exactly the same model behavior on very fast and very slow platforms, we use
    // EventTimer, which updates the model at regular intervals, and we can interpolate between states for additional
    // fidelity.
    this.eventTimer = new EventTimer(eventTimerModel, timeElapsed => this.advanceTime(1 / EVENT_RATE, false));
    this.sceneProperty = new Property(this[options.scenes[0]], {
      validValues: this.scenes
    });

    // @public - whether the wave area should be displayed
    this.showWavesProperty = new BooleanProperty(true);

    // @public - whether the wave area graph should be displayed
    this.showGraphProperty = new BooleanProperty(false);

    // @public - whether the screen (on the right of the lattice) should be shown.
    this.showScreenProperty = new BooleanProperty(false);

    // @public - whether the intensity graph (on the right of the lattice) should be shown.
    this.showIntensityGraphProperty = new BooleanProperty(false);

    // @public - whether the model is moving forward in time
    this.isRunningProperty = new BooleanProperty(true);

    // @public - whether the measuring tape has been dragged out of the toolbox into the play area
    this.isMeasuringTapeInPlayAreaProperty = new BooleanProperty(false);

    // @public
    this.isWaveMeterInPlayAreaProperty = new BooleanProperty(false);
    const rotationAmountRange = new Range(0, 1);

    // @public - Linear interpolation between WavesModel.Viewpoint.TOP (0) and Viewpoint.SIDE (1).  This linear
    // interpolate in the model is mapped through a CUBIC_IN_OUT in the view to obtain the desired look.
    this.rotationAmountProperty = new NumberProperty(0, {
      range: rotationAmountRange
    });

    // @public {DerivedProperty.<boolean>} - true if the system is rotating
    this.isRotatingProperty = new DerivedProperty([this.rotationAmountProperty], rotationAmount => rotationAmount !== rotationAmountRange.min && rotationAmount !== rotationAmountRange.max);

    // @public - emits once per step
    this.stepEmitter = new Emitter();

    // @public - model for the view coordinates of the base of the measuring tape
    // We use view coordinates so that nothing needs to be done when switching scenes and coordinate frames.
    this.measuringTapeBasePositionProperty = new Vector2Property(new Vector2(200, 200));

    // @public - model for the view coordinates of the tip of the measuring tape
    // This position sets reasonable model defaults for each scene: 1.0cm, 50cm, 500nm
    this.measuringTapeTipPositionProperty = new Vector2Property(new Vector2(250, 200));

    // @public - Notifies listeners when the model reset is complete
    this.resetEmitter = new Emitter();

    // @public - Notifies when reset in in progress, used to mute sounds while reset is in progress
    this.isResettingProperty = new BooleanProperty(false);

    // Reset the stopwatch time when changing scenes, and pause it.
    this.sceneProperty.link(() => {
      this.stopwatch.isRunningProperty.reset();
      this.stopwatch.isVisibleProperty.reset();
    });
  }

  /**
   * Clears the wave and the Intensity Sample
   */
  clear() {
    this.sceneProperty.value.clear();
  }

  /**
   * Advance time by the specified amount
   * @param dt - amount of time in seconds to move the model forward
   */
  step(dt) {
    // Feed the real time to the eventTimer and it will trigger advanceTime at the appropriate rate
    this.eventTimer.step(dt);
  }

  /**
   * Additionally called from the "step" button
   * @param wallDT - amount of wall time that passed, will be scaled by time scaling value
   * @param manualStep - true if the step button is being pressed
   */
  advanceTime(wallDT, manualStep) {
    // Animate the rotation, if it needs to rotate.  This is not subject to being paused, because we would like
    // students to be able to see the side view, pause it, then switch to the corresponding top view, and vice versa.
    const sign = this.viewpointProperty.get() === WavesModel.Viewpoint.TOP ? -1 : +1;
    this.rotationAmountProperty.value = Utils.clamp(this.rotationAmountProperty.value + wallDT * sign * 1.4, 0, 1);
    if (this.isRunningProperty.get() || manualStep) {
      const dt = wallDT * this.sceneProperty.value.timeScaleFactor;
      this.stopwatch.step(dt);

      // Notify listeners that a frame has advanced
      this.stepEmitter.emit();
      this.sceneProperty.value.lattice.interpolationRatio = this.eventTimer.getRatio();
      this.sceneProperty.value.advanceTime(wallDT, manualStep);
    }
  }

  /**
   * Restores the initial conditions
   */
  reset() {
    this.isResettingProperty.value = true;

    // Reset frequencyProperty first because it changes the time and phase.  This is done by resetting each of the
    // frequencyProperties in the scenes
    this.waterScene && this.waterScene.reset();
    this.soundScene && this.soundScene.reset();
    this.lightScene && this.lightScene.reset();
    this.sceneProperty.reset();
    this.viewpointProperty.reset();
    this.showGraphProperty.reset();
    this.timeSpeedProperty.reset();
    this.isRunningProperty.reset();
    this.showScreenProperty.reset();
    this.rotationAmountProperty.reset();
    this.stopwatch.reset();
    this.showIntensityGraphProperty.reset();
    this.isWaveMeterInPlayAreaProperty.reset();
    this.measuringTapeTipPositionProperty.reset();
    this.measuringTapeBasePositionProperty.reset();
    this.isMeasuringTapeInPlayAreaProperty.reset();

    // Signify to listeners that the model reset is complete
    this.resetEmitter.emit();
    this.isResettingProperty.value = false;
  }

  /**
   * When using water drops, the slider controls the desired frequency.  The actual frequency on the lattice is not
   * set until the water drop hits.
   */
  getWaterFrequencySliderProperty() {
    return this.waterScene.desiredFrequencyProperty;
  }
}

/**
 * @static
 * @public
 */
WavesModel.EVENT_RATE = EVENT_RATE;

/**
 * The wave area can be viewed from the TOP or from the SIDE. The view animates between the selections.
 * @public
 */
WavesModel.Viewpoint = EnumerationDeprecated.byKeys(['TOP', 'SIDE']);
waveInterference.register('WavesModel', WavesModel);
export default WavesModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiRW51bWVyYXRpb25Qcm9wZXJ0eSIsIk51bWJlclByb3BlcnR5IiwiUHJvcGVydHkiLCJSYW5nZSIsIlV0aWxzIiwiVmVjdG9yMiIsIlZlY3RvcjJQcm9wZXJ0eSIsIkVudW1lcmF0aW9uRGVwcmVjYXRlZCIsIkV2ZW50VGltZXIiLCJtZXJnZSIsIlN0b3B3YXRjaCIsIlRpbWVTcGVlZCIsIlZpc2libGVDb2xvciIsIkxpZ2h0U2NlbmUiLCJTY2VuZSIsIlNvdW5kU2NlbmUiLCJXYXRlclNjZW5lIiwiV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cyIsIldhdmVJbnRlcmZlcmVuY2VVdGlscyIsIndhdmVJbnRlcmZlcmVuY2UiLCJXYXZlSW50ZXJmZXJlbmNlU3RyaW5ncyIsImNlbnRpbWV0ZXJzVW5pdHNTdHJpbmciLCJjZW50aW1ldGVyc1VuaXRzIiwiZWxlY3RyaWNGaWVsZEF0Q2VudGVyU3RyaW5nIiwiZWxlY3RyaWNGaWVsZEF0Q2VudGVyIiwiZWxlY3RyaWNGaWVsZFN0cmluZyIsImVsZWN0cmljRmllbGQiLCJmZW10b3NlY29uZENvbnZlcnNpb25TdHJpbmciLCJmZW10b3NlY29uZENvbnZlcnNpb24iLCJmZW10b3NlY29uZHNVbml0c1N0cmluZyIsImZlbXRvc2Vjb25kc1VuaXRzIiwibGlnaHRHZW5lcmF0b3JTdHJpbmciLCJsaWdodEdlbmVyYXRvciIsIm1pbGxpc2Vjb25kQ29udmVyc2lvblN0cmluZyIsIm1pbGxpc2Vjb25kQ29udmVyc2lvbiIsIm1pbGxpc2Vjb25kc1VuaXRzU3RyaW5nIiwibWlsbGlzZWNvbmRzVW5pdHMiLCJuYW5vbWV0ZXJzVW5pdHNTdHJpbmciLCJuYW5vbWV0ZXJzVW5pdHMiLCJwb3NpdGlvbkNNU3RyaW5nIiwicG9zaXRpb25DTSIsInBvc2l0aW9uTk1TdHJpbmciLCJwb3NpdGlvbk5NIiwicHJlc3N1cmVBdENlbnRlclN0cmluZyIsInByZXNzdXJlQXRDZW50ZXIiLCJwcmVzc3VyZVN0cmluZyIsInByZXNzdXJlIiwic2Vjb25kc1VuaXRzU3RyaW5nIiwic2Vjb25kc1VuaXRzIiwic291bmRHZW5lcmF0b3JTdHJpbmciLCJzb3VuZEdlbmVyYXRvciIsIndhdGVyTGV2ZWxBdENlbnRlclN0cmluZyIsIndhdGVyTGV2ZWxBdENlbnRlciIsIndhdGVyTGV2ZWxTdHJpbmciLCJ3YXRlckxldmVsIiwid2F0ZXJXYXZlR2VuZXJhdG9yU3RyaW5nIiwid2F0ZXJXYXZlR2VuZXJhdG9yIiwiRVZFTlRfUkFURSIsIkNBTElCUkFUSU9OX1NDQUxFIiwidG9GZW10byIsIldhdmVzTW9kZWwiLCJzY2VuZXMiLCJzdG9wd2F0Y2giLCJ0aW1lUHJvcGVydHlPcHRpb25zIiwicmFuZ2UiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJudW1iZXJPZlNvdXJjZXMiLCJpbml0aWFsQW1wbGl0dWRlIiwic2hvd1NvdW5kUGFydGljbGVzIiwid2F2ZVNwYXRpYWxUeXBlIiwiV2F2ZVNwYXRpYWxUeXBlIiwiUE9JTlQiLCJhc3NlcnQiLCJBTVBMSVRVREVfUkFOR0UiLCJjb250YWlucyIsIndhdGVyU2NlbmUiLCJzb3VuZFNjZW5lIiwibGlnaHRTY2VuZSIsImluY2x1ZGVzIiwicG9zaXRpb25Vbml0cyIsInRyYW5zbGF0ZWRQb3NpdGlvblVuaXRzIiwidGltZVVuaXRzIiwidGltZVNjYWxlU3RyaW5nIiwiZ3JhcGhWZXJ0aWNhbEF4aXNMYWJlbCIsImdyYXBoVGl0bGUiLCJncmFwaEhvcml6b250YWxBeGlzTGFiZWwiLCJ3YXZlQXJlYVdpZHRoIiwiZnJlcXVlbmN5UmFuZ2UiLCJzY2FsZUluZGljYXRvckxlbmd0aCIsIndhdmVTcGVlZCIsInRpbWVTY2FsZUZhY3RvciIsImluaXRpYWxTbGl0V2lkdGgiLCJpbml0aWFsU2xpdFNlcGFyYXRpb24iLCJzb3VyY2VTZXBhcmF0aW9uUmFuZ2UiLCJzbGl0U2VwYXJhdGlvblJhbmdlIiwic2xpdFdpZHRoUmFuZ2UiLCJsaW5rRGVzaXJlZEFtcGxpdHVkZVRvQW1wbGl0dWRlIiwicGxhbmVXYXZlR2VuZXJhdG9yTm9kZVRleHQiLCJwdXNoIiwiTUlOX0ZSRVFVRU5DWSIsIk1BWF9GUkVRVUVOQ1kiLCJ2aWV3cG9pbnRQcm9wZXJ0eSIsIlZpZXdwb2ludCIsIlRPUCIsInZhbGlkVmFsdWVzIiwiVkFMVUVTIiwidGltZVNwZWVkUHJvcGVydHkiLCJOT1JNQUwiLCJldmVudFRpbWVyTW9kZWwiLCJnZXRQZXJpb2RCZWZvcmVOZXh0RXZlbnQiLCJzY2FsZUZhY3RvciIsInZhbHVlIiwiZXZlbnRUaW1lciIsInRpbWVFbGFwc2VkIiwiYWR2YW5jZVRpbWUiLCJzY2VuZVByb3BlcnR5Iiwic2hvd1dhdmVzUHJvcGVydHkiLCJzaG93R3JhcGhQcm9wZXJ0eSIsInNob3dTY3JlZW5Qcm9wZXJ0eSIsInNob3dJbnRlbnNpdHlHcmFwaFByb3BlcnR5IiwiaXNSdW5uaW5nUHJvcGVydHkiLCJpc01lYXN1cmluZ1RhcGVJblBsYXlBcmVhUHJvcGVydHkiLCJpc1dhdmVNZXRlckluUGxheUFyZWFQcm9wZXJ0eSIsInJvdGF0aW9uQW1vdW50UmFuZ2UiLCJyb3RhdGlvbkFtb3VudFByb3BlcnR5IiwiaXNSb3RhdGluZ1Byb3BlcnR5Iiwicm90YXRpb25BbW91bnQiLCJtaW4iLCJtYXgiLCJzdGVwRW1pdHRlciIsIm1lYXN1cmluZ1RhcGVCYXNlUG9zaXRpb25Qcm9wZXJ0eSIsIm1lYXN1cmluZ1RhcGVUaXBQb3NpdGlvblByb3BlcnR5IiwicmVzZXRFbWl0dGVyIiwiaXNSZXNldHRpbmdQcm9wZXJ0eSIsImxpbmsiLCJyZXNldCIsImlzVmlzaWJsZVByb3BlcnR5IiwiY2xlYXIiLCJzdGVwIiwiZHQiLCJ3YWxsRFQiLCJtYW51YWxTdGVwIiwic2lnbiIsImdldCIsImNsYW1wIiwiZW1pdCIsImxhdHRpY2UiLCJpbnRlcnBvbGF0aW9uUmF0aW8iLCJnZXRSYXRpbyIsImdldFdhdGVyRnJlcXVlbmN5U2xpZGVyUHJvcGVydHkiLCJkZXNpcmVkRnJlcXVlbmN5UHJvcGVydHkiLCJieUtleXMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIldhdmVzTW9kZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcbi8vIEB0cy1ub2NoZWNrXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3IgdGhlIFwiV2F2ZXNcIiBzY3JlZW4gYW5kIG90aGVyIGRlcml2YXRpdmUgc2NyZWVucy4gIFRoaXMgbW9kZWwgc3VwcG9ydHMgdHdvIHNvdXJjZXMsIGV2ZW4gdGhvdWdoIHRoZSB3YXZlc1xyXG4gKiBzY3JlZW4gb25seSB1c2VzIG9uZS4gIFRoZSBjb250cm9scyBhcmUgaW4gYSBtZXRyaWMgY29vcmRpbmF0ZSBmcmFtZSwgYW5kIHRoZXJlIGlzIGEgdHJhbnNmb3JtYXRpb24gdG8gY29udmVydFxyXG4gKiBtZXRyaWMgY29vcmRpbmF0ZXMgdG8gbGF0dGljZSBjb29yZGluYXRlcy4gIE9uIHRoZSB2aWV3IHNpZGUgdGhlcmUgaXMgYW5vdGhlciB0cmFuc2Zvcm1hdGlvbiB0byBjb252ZXJ0IGxhdHRpY2Ugb3JcclxuICogbWV0cmljIGNvb3JkaW5hdGVzIHRvIHZpZXcgY29vcmRpbmF0ZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUTW9kZWwgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvVE1vZGVsLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25EZXByZWNhdGVkLmpzJztcclxuaW1wb3J0IEV2ZW50VGltZXIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0V2ZW50VGltZXIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFN0b3B3YXRjaCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU3RvcHdhdGNoLmpzJztcclxuaW1wb3J0IFRpbWVTcGVlZCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVGltZVNwZWVkLmpzJztcclxuaW1wb3J0IFZpc2libGVDb2xvciBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVmlzaWJsZUNvbG9yLmpzJztcclxuaW1wb3J0IExpZ2h0U2NlbmUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0xpZ2h0U2NlbmUuanMnO1xyXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1NjZW5lLmpzJztcclxuaW1wb3J0IFNvdW5kU2NlbmUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1NvdW5kU2NlbmUuanMnO1xyXG5pbXBvcnQgV2F0ZXJTY2VuZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvV2F0ZXJTY2VuZS5qcyc7XHJcbmltcG9ydCBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9XYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFdhdmVJbnRlcmZlcmVuY2VVdGlscyBmcm9tICcuLi8uLi9jb21tb24vV2F2ZUludGVyZmVyZW5jZVV0aWxzLmpzJztcclxuaW1wb3J0IHdhdmVJbnRlcmZlcmVuY2UgZnJvbSAnLi4vLi4vd2F2ZUludGVyZmVyZW5jZS5qcyc7XHJcbmltcG9ydCBXYXZlSW50ZXJmZXJlbmNlU3RyaW5ncyBmcm9tICcuLi8uLi9XYXZlSW50ZXJmZXJlbmNlU3RyaW5ncy5qcyc7XHJcblxyXG5jb25zdCBjZW50aW1ldGVyc1VuaXRzU3RyaW5nID0gV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MuY2VudGltZXRlcnNVbml0cztcclxuY29uc3QgZWxlY3RyaWNGaWVsZEF0Q2VudGVyU3RyaW5nID0gV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MuZWxlY3RyaWNGaWVsZEF0Q2VudGVyO1xyXG5jb25zdCBlbGVjdHJpY0ZpZWxkU3RyaW5nID0gV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MuZWxlY3RyaWNGaWVsZDtcclxuY29uc3QgZmVtdG9zZWNvbmRDb252ZXJzaW9uU3RyaW5nID0gV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MuZmVtdG9zZWNvbmRDb252ZXJzaW9uO1xyXG5jb25zdCBmZW10b3NlY29uZHNVbml0c1N0cmluZyA9IFdhdmVJbnRlcmZlcmVuY2VTdHJpbmdzLmZlbXRvc2Vjb25kc1VuaXRzO1xyXG5jb25zdCBsaWdodEdlbmVyYXRvclN0cmluZyA9IFdhdmVJbnRlcmZlcmVuY2VTdHJpbmdzLmxpZ2h0R2VuZXJhdG9yO1xyXG5jb25zdCBtaWxsaXNlY29uZENvbnZlcnNpb25TdHJpbmcgPSBXYXZlSW50ZXJmZXJlbmNlU3RyaW5ncy5taWxsaXNlY29uZENvbnZlcnNpb247XHJcbmNvbnN0IG1pbGxpc2Vjb25kc1VuaXRzU3RyaW5nID0gV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MubWlsbGlzZWNvbmRzVW5pdHM7XHJcbmNvbnN0IG5hbm9tZXRlcnNVbml0c1N0cmluZyA9IFdhdmVJbnRlcmZlcmVuY2VTdHJpbmdzLm5hbm9tZXRlcnNVbml0cztcclxuY29uc3QgcG9zaXRpb25DTVN0cmluZyA9IFdhdmVJbnRlcmZlcmVuY2VTdHJpbmdzLnBvc2l0aW9uQ007XHJcbmNvbnN0IHBvc2l0aW9uTk1TdHJpbmcgPSBXYXZlSW50ZXJmZXJlbmNlU3RyaW5ncy5wb3NpdGlvbk5NO1xyXG5jb25zdCBwcmVzc3VyZUF0Q2VudGVyU3RyaW5nID0gV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MucHJlc3N1cmVBdENlbnRlcjtcclxuY29uc3QgcHJlc3N1cmVTdHJpbmcgPSBXYXZlSW50ZXJmZXJlbmNlU3RyaW5ncy5wcmVzc3VyZTtcclxuY29uc3Qgc2Vjb25kc1VuaXRzU3RyaW5nID0gV2F2ZUludGVyZmVyZW5jZVN0cmluZ3Muc2Vjb25kc1VuaXRzO1xyXG5jb25zdCBzb3VuZEdlbmVyYXRvclN0cmluZyA9IFdhdmVJbnRlcmZlcmVuY2VTdHJpbmdzLnNvdW5kR2VuZXJhdG9yO1xyXG5jb25zdCB3YXRlckxldmVsQXRDZW50ZXJTdHJpbmcgPSBXYXZlSW50ZXJmZXJlbmNlU3RyaW5ncy53YXRlckxldmVsQXRDZW50ZXI7XHJcbmNvbnN0IHdhdGVyTGV2ZWxTdHJpbmcgPSBXYXZlSW50ZXJmZXJlbmNlU3RyaW5ncy53YXRlckxldmVsO1xyXG5jb25zdCB3YXRlcldhdmVHZW5lcmF0b3JTdHJpbmcgPSBXYXZlSW50ZXJmZXJlbmNlU3RyaW5ncy53YXRlcldhdmVHZW5lcmF0b3I7XHJcblxyXG4vLyBUaGlzIHNpbXVsYXRpb24gdXNlcyBFdmVudFRpbWVyLCB3aGljaCBwcm92aWRlcyBleGFjdGx5IHRoZSBzYW1lIG1vZGVsIGJlaGF2aW9yIG9uIHZlcnkgc2xvdyBhbmQgdmVyeSBmYXN0XHJcbi8vIHBsYXRmb3Jtcy4gIEhlcmUgd2UgZGVmaW5lIHRoZSBmcmVxdWVuY3kgb2YgZXZlbnRzIGluIEh6LCB3aGljaCBoYXMgYmVlbiB0dW5lZCBzbyB0aGF0IG91ciBzbG93ZXN0IHBsYXRmb3JtIGhhc1xyXG4vLyBhbiBhY2NlcHRhYmxlIGZyYW1lIHJhdGVcclxuY29uc3QgRVZFTlRfUkFURSA9IDIwICogV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5DQUxJQlJBVElPTl9TQ0FMRTtcclxuY29uc3QgdG9GZW10byA9IFdhdmVJbnRlcmZlcmVuY2VVdGlscy50b0ZlbXRvO1xyXG5cclxudHlwZSBXYXZlc01vZGVsT3B0aW9ucyA9IHtcclxuICBzY2VuZXM/OiAoICd3YXRlclNjZW5lJyB8ICdzb3VuZFNjZW5lJyB8ICdsaWdodFNjZW5lJyApW107XHJcbn07XHJcblxyXG5jbGFzcyBXYXZlc01vZGVsIGltcGxlbWVudHMgVE1vZGVsIHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IHNjZW5lUHJvcGVydHk6IFByb3BlcnR5PFNjZW5lPjtcclxuXHJcbiAgLy8gdGhlIFNjZW5lIGluc3RhbmNlcyBhcyBhbiBhcnJheVxyXG4gIHB1YmxpYyByZWFkb25seSBzY2VuZXM6IFNjZW5lW10gPSBbXTtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IHN0b3B3YXRjaCA9IG5ldyBTdG9wd2F0Y2goIHtcclxuICAgIHRpbWVQcm9wZXJ0eU9wdGlvbnM6IHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgOTk5Ljk5IClcclxuICAgIH1cclxuICB9ICk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBbb3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG9wdGlvbnM/OiBXYXZlc01vZGVsT3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIFRoaXMgbW9kZWwgc3VwcG9ydHMgb25lIG9yIHR3byBzb3VyY2VzLiAgSWYgdGhlIHNvdXJjZXMgYXJlIGluaXRpYWxseSBzZXBhcmF0ZWQsIHRoZXJlIGFyZSB0d28gc291cmNlc1xyXG4gICAgICBudW1iZXJPZlNvdXJjZXM6IDEsXHJcblxyXG4gICAgICAvLyBJbml0aWFsIGFtcGxpdHVkZSBvZiB0aGUgb3NjaWxsYXRvciwgd2hpY2ggaXMgdW5pdGxlc3MgYW5kIHJlZmxlY3RzIHRoZSBhbW91bnQgb2YgZGlzdHVyYmFuY2UgYXQgYSBzcGVjaWZpZWRcclxuICAgICAgLy8gcG9pbnQgaW4gdGhlIG1lZGl1bS4gU2VlIFdhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMuQU1QTElUVURFX1JBTkdFLiAgV2Ugb3B0aW1pemUgdGhlIHZpZXcgZm9yIHRoZSBtYXgsIGJ1dFxyXG4gICAgICAvLyBzdGFydGluZyB0aGUgdmFsdWUgYXQgdGhlIGV4dHJlbWUgbWF5IHByZXZlbnQgdGhlIHVzZXIgZnJvbSBleHBsb3JpbmcgdGhlIHJhbmdlLCBzbyB3ZSBzdGFydCBjbG9zZXIgdG8gdGhlXHJcbiAgICAgIC8vIG1heCBidXQgbm90IGF0IHRoZSBtYXguICBJIGNob3NlIDggc28gaXQgd291bGQgbWF0Y2ggdXAgZGlyZWN0bHkgd2l0aCBhIHRpY2ttYXJrICh3aGVuIGl0IHdhcyBhdCA3LjUsIGl0XHJcbiAgICAgIC8vIGNvdmVyZWQgMiB0aWNrbWFya3MgYW5kIGxvb2tlZCBvZGQpXHJcbiAgICAgIGluaXRpYWxBbXBsaXR1ZGU6IDgsXHJcblxyXG4gICAgICAvLyBUcnVlIGlmIFNvdW5kUGFydGljbGVzIHNob3VsZCBiZSBjcmVhdGVkIGFuZCBkaXNwbGF5ZWQsIGFuZCBpZiB0aGUgdXNlciBjYW4gc2VsZWN0IHRvIHZpZXcgdGhlbVxyXG4gICAgICBzaG93U291bmRQYXJ0aWNsZXM6IHRydWUsXHJcblxyXG4gICAgICB3YXZlU3BhdGlhbFR5cGU6IFNjZW5lLldhdmVTcGF0aWFsVHlwZS5QT0lOVCxcclxuXHJcbiAgICAgIC8vIEFycmF5IG9mIHNjZW5lcyB0byBiZSBjcmVhdGVkXHJcbiAgICAgIHNjZW5lczogWyAnd2F0ZXJTY2VuZScsICdzb3VuZFNjZW5lJywgJ2xpZ2h0U2NlbmUnIF1cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLkFNUExJVFVERV9SQU5HRS5jb250YWlucyggb3B0aW9ucy5pbml0aWFsQW1wbGl0dWRlICksXHJcbiAgICAgIGBpbml0aWFsQW1wbGl0dWRlIGlzIG91dCBvZiByYW5nZTogJHtvcHRpb25zLmluaXRpYWxBbXBsaXR1ZGV9YCApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgIG9wdGlvbnMubnVtYmVyT2ZTb3VyY2VzID09PSAxIHx8IG9wdGlvbnMubnVtYmVyT2ZTb3VyY2VzID09PSAyLFxyXG4gICAgICAnTW9kZWwgb25seSBzdXBwb3J0cyAxIG9yIDIgc291cmNlcydcclxuICAgICk7XHJcblxyXG4gICAgLy8gSW5zdGFudGlhdGUgdGhlIFNjZW5lcy4gIFNjZW5lIG9wdGlvbnMgYXJlIHNwZWNpZmllZCBoZXJlIHRvIG1ha2UgaXQgZWFzaWVyIHRvIGNvbXBhcmUgb3B0aW9ucyBiZXR3ZWVuIHNjZW5lcy5cclxuICAgIC8vIFNjZW5lcyBhcmUgb25seSBjcmVhdGVkIGlmIHNwZWNpZmllZCBpbiB0aGUgb3B0aW9ucy4gIEZvciBleGFtcGxlLCBXYXZlIEludGVyZmVyZW5jZSBjcmVhdGVzIHdhdGVyU2NlbmUsXHJcbiAgICAvLyBzb3VuZFNjZW5lIGFuZCBsaWdodFNjZW5lIHdoZXJlYXMgV2F2ZXMgSW50cm8ncyBXYXRlciBzY3JlZW4gb25seSBjcmVhdGVzIHRoZSB3YXRlclNjZW5lLiAgVGhpcyBhbGxvd3NcclxuICAgIC8vIHBpZWNlcyBmcm9tIGRpZmZlcmVudCBzY2VuZXMgdG8gKHN1Y2ggYXMgc2hvd2luZyBhIHN3YXBwYWJsZSBmcmVxdWVuY3kgY29udHJvbCBpbiB0aGUgc2FtZSBjb250cm9sIHBhbmVsKVxyXG4gICAgLy8gYnV0IHVuZm9ydHVuYXRlbHkgbGVhZHMgdG8gYSBsb3Qgb2YgY2hlY2tzIGxpa2UgaWYgKG1vZGVsLndhdGVyU2NlbmUpey4uLn0gZXRjLiAgSWYgaW1wbGVtZW50ZWQgZnJvbSBzY3JhdGNoLFxyXG4gICAgLy8gdGhpcyBtYXkgaGF2ZSBiZWVuIGRvbmUgZGlmZmVyZW50bHksIGJ1dCB0aGlzIHNpbSBpbml0aWFsbHkgZGV2ZWxvcGVkIGZvciBXYXZlIEludGVyZmVyZW5jZSBvbmx5IChhbGwgc2NlbmVzKVxyXG4gICAgLy8gYW5kIHdhcyBsYXRlciByZXRyb2ZpdHRlZCB0byBoYXZlIGEgc3Vic2V0IG9mIHNjZW5lcy4gIE1vcmUgZGlzY3Vzc2lvbiBvbiB0aGlzIHBvaW50IGFwcGVhcnMgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3dhdmUtaW50ZXJmZXJlbmNlL2lzc3Vlcy80MTQjaXNzdWVjb21tZW50LTUxNjA3OTMwNFxyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1dhdGVyU2NlbmV8bnVsbH1cclxuICAgIHRoaXMud2F0ZXJTY2VuZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7U291bmRTY2VuZXxudWxsfVxyXG4gICAgdGhpcy5zb3VuZFNjZW5lID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtMaWdodFNjZW5lfG51bGx9XHJcbiAgICB0aGlzLmxpZ2h0U2NlbmUgPSBudWxsO1xyXG5cclxuICAgIGlmICggb3B0aW9ucy5zY2VuZXMuaW5jbHVkZXMoICd3YXRlclNjZW5lJyApICkge1xyXG4gICAgICB0aGlzLndhdGVyU2NlbmUgPSBuZXcgV2F0ZXJTY2VuZSgge1xyXG4gICAgICAgIHdhdmVTcGF0aWFsVHlwZTogb3B0aW9ucy53YXZlU3BhdGlhbFR5cGUsXHJcblxyXG4gICAgICAgIHBvc2l0aW9uVW5pdHM6ICdjbScsXHJcbiAgICAgICAgdHJhbnNsYXRlZFBvc2l0aW9uVW5pdHM6IGNlbnRpbWV0ZXJzVW5pdHNTdHJpbmcsXHJcbiAgICAgICAgdGltZVVuaXRzOiBzZWNvbmRzVW5pdHNTdHJpbmcsXHJcbiAgICAgICAgdGltZVNjYWxlU3RyaW5nOiAnJyxcclxuXHJcbiAgICAgICAgZ3JhcGhWZXJ0aWNhbEF4aXNMYWJlbDogd2F0ZXJMZXZlbFN0cmluZyxcclxuICAgICAgICBncmFwaFRpdGxlOiB3YXRlckxldmVsQXRDZW50ZXJTdHJpbmcsXHJcbiAgICAgICAgZ3JhcGhIb3Jpem9udGFsQXhpc0xhYmVsOiBwb3NpdGlvbkNNU3RyaW5nLFxyXG4gICAgICAgIHdhdmVBcmVhV2lkdGg6IDEwLCAvLyAxMCBjZW50aW1ldGVyc1xyXG4gICAgICAgIGZyZXF1ZW5jeVJhbmdlOiBuZXcgUmFuZ2UoIDAuMjUsIDEgKSwgLy8gY3ljbGVzIHBlciBzZWNvbmRcclxuICAgICAgICBzY2FsZUluZGljYXRvckxlbmd0aDogMSwgLy8gMSBjZW50aW1ldGVyXHJcbiAgICAgICAgbnVtYmVyT2ZTb3VyY2VzOiBvcHRpb25zLm51bWJlck9mU291cmNlcyxcclxuXHJcbiAgICAgICAgLy8gQ2FsaWJyYXRpb24gZm9yIHdhdGVyIGlzIGRvbmUgYnkgbWVhc3VyaW5nIHRoZSBlbXBpcmljYWwgd2F2ZSBzcGVlZCwgc2luY2Ugd2Ugd2FudCB0aGUgdGltZVNjYWxlRmFjdG9yIHRvXHJcbiAgICAgICAgLy8gcmVtYWluIGFzIDEuMFxyXG4gICAgICAgIC8vIGluIHBvc2l0aW9uIHVuaXRzL3RpbWUgdW5pdHMsIG1lYXN1cmVkIGVtcGlyaWNhbGx5IGFzIDUuNCBzZWNvbmRzIHRvIGNyb3NzIHRoZSAxMGNtIGxhdHRpY2VcclxuICAgICAgICB3YXZlU3BlZWQ6IDEuNjUsXHJcblxyXG4gICAgICAgIHRpbWVTY2FsZUZhY3RvcjogMSwgLy8gMSBzZWNvbmQgaW4gcmVhbCB0aW1lID0gMSBzZWNvbmQgb24gdGhlIHNpbXVsYXRpb24gdGltZXJcclxuXHJcbiAgICAgICAgaW5pdGlhbFNsaXRXaWR0aDogMS41LCAvLyBjbVxyXG4gICAgICAgIGluaXRpYWxTbGl0U2VwYXJhdGlvbjogMywgLy8gY21cclxuXHJcbiAgICAgICAgc291cmNlU2VwYXJhdGlvblJhbmdlOiBuZXcgUmFuZ2UoIDEsIDUgKSwgLy8gY21cclxuICAgICAgICBzbGl0U2VwYXJhdGlvblJhbmdlOiBuZXcgUmFuZ2UoIDEsIDUgKSwgLy8gY21cclxuICAgICAgICBzbGl0V2lkdGhSYW5nZTogbmV3IFJhbmdlKCAwLjUsIDIuNSApLCAvLyBjbVxyXG5cclxuICAgICAgICBpbml0aWFsQW1wbGl0dWRlOiBvcHRpb25zLmluaXRpYWxBbXBsaXR1ZGUsXHJcbiAgICAgICAgbGlua0Rlc2lyZWRBbXBsaXR1ZGVUb0FtcGxpdHVkZTogZmFsc2UsXHJcbiAgICAgICAgcGxhbmVXYXZlR2VuZXJhdG9yTm9kZVRleHQ6IHdhdGVyV2F2ZUdlbmVyYXRvclN0cmluZ1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuc2NlbmVzLnB1c2goIHRoaXMud2F0ZXJTY2VuZSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBTb3VuZCBzY2VuZVxyXG4gICAgaWYgKCBvcHRpb25zLnNjZW5lcy5pbmNsdWRlcyggJ3NvdW5kU2NlbmUnICkgKSB7XHJcbiAgICAgIHRoaXMuc291bmRTY2VuZSA9IG5ldyBTb3VuZFNjZW5lKCBvcHRpb25zLnNob3dTb3VuZFBhcnRpY2xlcywge1xyXG4gICAgICAgIHdhdmVTcGF0aWFsVHlwZTogb3B0aW9ucy53YXZlU3BhdGlhbFR5cGUsXHJcbiAgICAgICAgcG9zaXRpb25Vbml0czogJ2NtJyxcclxuICAgICAgICB0cmFuc2xhdGVkUG9zaXRpb25Vbml0czogY2VudGltZXRlcnNVbml0c1N0cmluZyxcclxuICAgICAgICB0aW1lVW5pdHM6IG1pbGxpc2Vjb25kc1VuaXRzU3RyaW5nLFxyXG4gICAgICAgIHRpbWVTY2FsZVN0cmluZzogbWlsbGlzZWNvbmRDb252ZXJzaW9uU3RyaW5nLFxyXG5cclxuICAgICAgICBncmFwaFZlcnRpY2FsQXhpc0xhYmVsOiBwcmVzc3VyZVN0cmluZyxcclxuICAgICAgICBncmFwaFRpdGxlOiBwcmVzc3VyZUF0Q2VudGVyU3RyaW5nLFxyXG4gICAgICAgIGdyYXBoSG9yaXpvbnRhbEF4aXNMYWJlbDogcG9zaXRpb25DTVN0cmluZyxcclxuICAgICAgICB3YXZlQXJlYVdpZHRoOiA1MDAsIC8vIGluIGNtXHJcblxyXG4gICAgICAgIC8vIFNlZSBodHRwczovL3BhZ2VzLm10dS5lZHUvfnN1aXRzL25vdGVmcmVxcy5odG1sXHJcbiAgICAgICAgZnJlcXVlbmN5UmFuZ2U6IG5ldyBSYW5nZShcclxuICAgICAgICAgIC8vIEEzIGluIGN5Y2xlcyBwZXIgbXMsIHdhdmVsZW5ndGggaXMgMTU2LjhjbVxyXG4gICAgICAgICAgMjIwIC8gMTAwMCxcclxuXHJcbiAgICAgICAgICAvLyBBNCBpbiBjeWNsZXMgcGVyIG1zLCB3YXZlbGVuZ3RoIGlzICA3OC40Y21cclxuICAgICAgICAgIDQ0MCAvIDEwMDBcclxuICAgICAgICApLFxyXG4gICAgICAgIHNjYWxlSW5kaWNhdG9yTGVuZ3RoOiA1MCwgLy8gY21cclxuICAgICAgICBudW1iZXJPZlNvdXJjZXM6IG9wdGlvbnMubnVtYmVyT2ZTb3VyY2VzLFxyXG4gICAgICAgIHdhdmVTcGVlZDogMzQuMywgLy8gaW4gY20vbXNcclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lZCBlbXBpcmljYWxseSBieSBzZXR0aW5nIHRpbWVTY2FsZUZhY3RvciB0byAxLCB0aGVuIGNoZWNraW5nIHRoZSBkaXNwbGF5ZWQgd2F2ZWxlbmd0aCBvZiBtYXhpbXVtXHJcbiAgICAgICAgLy8gZnJlcXVlbmN5IHNvdW5kIG9uIHRoZSBsYXR0aWNlIGFuZCBkaXZpZGluZyBieSB0aGUgZGVzaXJlZCB3YXZlbGVuZ3RoLiAgP2xvZyBjYW4gYmUgdXNlZnVsLiAgQ2FuIGNoZWNrL2ZpbmVcclxuICAgICAgICAvLyB0dW5lIGJ5IG1lYXN1cmluZyB0aGUgc3BlZWQgb2Ygc291bmQuXHJcbiAgICAgICAgdGltZVNjYWxlRmFjdG9yOiAyNDQuNyAvIDEwMy45MzkgKiAzNS4yNCAvIDM0LjMsXHJcblxyXG4gICAgICAgIGluaXRpYWxTbGl0V2lkdGg6IDkwLCAvLyBjbVxyXG4gICAgICAgIGluaXRpYWxTbGl0U2VwYXJhdGlvbjogMjAwLCAvLyBjbVxyXG4gICAgICAgIHNvdXJjZVNlcGFyYXRpb25SYW5nZTogbmV3IFJhbmdlKCAxMDAsIDQwMCApLCAvLyBjbVxyXG4gICAgICAgIHNsaXRXaWR0aFJhbmdlOiBuZXcgUmFuZ2UoIDIwLCAxNjAgKSwgLy8gY21cclxuICAgICAgICBzbGl0U2VwYXJhdGlvblJhbmdlOiBuZXcgUmFuZ2UoIDQwLCAzMjAgKSwgLy8gY21cclxuXHJcbiAgICAgICAgaW5pdGlhbEFtcGxpdHVkZTogb3B0aW9ucy5pbml0aWFsQW1wbGl0dWRlLFxyXG4gICAgICAgIGxpbmtEZXNpcmVkQW1wbGl0dWRlVG9BbXBsaXR1ZGU6IHRydWUsXHJcbiAgICAgICAgcGxhbmVXYXZlR2VuZXJhdG9yTm9kZVRleHQ6IHNvdW5kR2VuZXJhdG9yU3RyaW5nXHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5zY2VuZXMucHVzaCggdGhpcy5zb3VuZFNjZW5lICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIExpZ2h0IHNjZW5lLlxyXG4gICAgaWYgKCBvcHRpb25zLnNjZW5lcy5pbmNsdWRlcyggJ2xpZ2h0U2NlbmUnICkgKSB7XHJcbiAgICAgIHRoaXMubGlnaHRTY2VuZSA9IG5ldyBMaWdodFNjZW5lKCB7XHJcbiAgICAgICAgd2F2ZVNwYXRpYWxUeXBlOiBvcHRpb25zLndhdmVTcGF0aWFsVHlwZSxcclxuICAgICAgICBwb3NpdGlvblVuaXRzOiAnbm0nLFxyXG4gICAgICAgIHRyYW5zbGF0ZWRQb3NpdGlvblVuaXRzOiBuYW5vbWV0ZXJzVW5pdHNTdHJpbmcsXHJcbiAgICAgICAgdGltZVVuaXRzOiBmZW10b3NlY29uZHNVbml0c1N0cmluZyxcclxuICAgICAgICB0aW1lU2NhbGVTdHJpbmc6IGZlbXRvc2Vjb25kQ29udmVyc2lvblN0cmluZyxcclxuICAgICAgICBncmFwaFZlcnRpY2FsQXhpc0xhYmVsOiBlbGVjdHJpY0ZpZWxkU3RyaW5nLFxyXG4gICAgICAgIGdyYXBoVGl0bGU6IGVsZWN0cmljRmllbGRBdENlbnRlclN0cmluZyxcclxuICAgICAgICBncmFwaEhvcml6b250YWxBeGlzTGFiZWw6IHBvc2l0aW9uTk1TdHJpbmcsXHJcbiAgICAgICAgd2F2ZUFyZWFXaWR0aDogNTAwMCwgLy8gbm1cclxuXHJcbiAgICAgICAgLy8gaW4gY3ljbGVzIHBlciBmZW10b3NlY29uZFxyXG4gICAgICAgIGZyZXF1ZW5jeVJhbmdlOiBuZXcgUmFuZ2UoIHRvRmVtdG8oIFZpc2libGVDb2xvci5NSU5fRlJFUVVFTkNZICksIHRvRmVtdG8oIFZpc2libGVDb2xvci5NQVhfRlJFUVVFTkNZICkgKSxcclxuICAgICAgICBzY2FsZUluZGljYXRvckxlbmd0aDogNTAwLCAvLyBubVxyXG5cclxuICAgICAgICBudW1iZXJPZlNvdXJjZXM6IG9wdGlvbnMubnVtYmVyT2ZTb3VyY2VzLFxyXG5cclxuICAgICAgICAvLyBpbiBubS9mc1xyXG4gICAgICAgIHdhdmVTcGVlZDogMjk5Ljc5MjQ1OCxcclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lZCBlbXBpcmljYWxseSBieSBzZXR0aW5nIHRpbWVTY2FsZUZhY3RvciB0byAxLCB0aGVuIGNoZWNraW5nIHRoZSBkaXNwbGF5ZWQgd2F2ZWxlbmd0aCBvZiBtYXhpbXVtXHJcbiAgICAgICAgLy8gZnJlcXVlbmN5IHdhdmUgb24gdGhlIGxhdHRpY2UgYW5kIGRpdmlkaW5nIGJ5IHRoZSBkZXNpcmVkIHdhdmVsZW5ndGguICBDYW4gY2hlY2sgYnkgbWVhc3VyaW5nIHRoZSBzcGVlZCBvZlxyXG4gICAgICAgIC8vIGxpZ2h0XHJcbiAgICAgICAgdGltZVNjYWxlRmFjdG9yOiAxNDE2LjUgLyA1MTEuMDM0LFxyXG5cclxuICAgICAgICAvLyBubSAtIGlmIHRoaXMgdmFsdWUgaXMgdG9vIGhpZ2gsIHRoZSBsaWdodCBzY3JlZW4gd2lsbCBvdmVyc2F0dXJhdGUsXHJcbiAgICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy93YXZlLWludGVyZmVyZW5jZS9pc3N1ZXMvMjA5XHJcbiAgICAgICAgaW5pdGlhbFNsaXRXaWR0aDogNTAwLCAvLyBubVxyXG4gICAgICAgIGluaXRpYWxTbGl0U2VwYXJhdGlvbjogMTUwMCwgLy8gbm1cclxuICAgICAgICBzb3VyY2VTZXBhcmF0aW9uUmFuZ2U6IG5ldyBSYW5nZSggNTAwLCA0MDAwICksIC8vIG5tXHJcbiAgICAgICAgc2xpdFdpZHRoUmFuZ2U6IG5ldyBSYW5nZSggMjAwLCAxNjAwICksIC8vIG5tXHJcbiAgICAgICAgc2xpdFNlcGFyYXRpb25SYW5nZTogbmV3IFJhbmdlKCA0MDAsIDMyMDAgKSwgLy8gbm1cclxuXHJcbiAgICAgICAgaW5pdGlhbEFtcGxpdHVkZTogb3B0aW9ucy5pbml0aWFsQW1wbGl0dWRlLFxyXG4gICAgICAgIGxpbmtEZXNpcmVkQW1wbGl0dWRlVG9BbXBsaXR1ZGU6IHRydWUsXHJcbiAgICAgICAgcGxhbmVXYXZlR2VuZXJhdG9yTm9kZVRleHQ6IGxpZ2h0R2VuZXJhdG9yU3RyaW5nXHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5zY2VuZXMucHVzaCggdGhpcy5saWdodFNjZW5lICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7bnVtYmVyfSAtIG51bWJlciBvZiBzb3VyY2VzIHRoYXQgY2FuIGVtaXRcclxuICAgIHRoaXMubnVtYmVyT2ZTb3VyY2VzID0gb3B0aW9ucy5udW1iZXJPZlNvdXJjZXM7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIGluZGljYXRlcyB0aGUgdXNlciBzZWxlY3Rpb24gZm9yIHNpZGUgdmlldyBvciB0b3Agdmlld1xyXG4gICAgdGhpcy52aWV3cG9pbnRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggV2F2ZXNNb2RlbC5WaWV3cG9pbnQuVE9QLCB7XHJcbiAgICAgIHZhbGlkVmFsdWVzOiBXYXZlc01vZGVsLlZpZXdwb2ludC5WQUxVRVNcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gdGhlIHNwZWVkIGF0IHdoaWNoIHRoZSBzaW11bGF0aW9uIGlzIHBsYXlpbmdcclxuICAgIHRoaXMudGltZVNwZWVkUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25Qcm9wZXJ0eSggVGltZVNwZWVkLk5PUk1BTCApO1xyXG5cclxuICAgIGNvbnN0IGV2ZW50VGltZXJNb2RlbCA9IHtcclxuXHJcbiAgICAgIC8vIEBwdWJsaWNcclxuICAgICAgZ2V0UGVyaW9kQmVmb3JlTmV4dEV2ZW50OiAoKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc2NhbGVGYWN0b3IgPSB0aGlzLnRpbWVTcGVlZFByb3BlcnR5LnZhbHVlID09PSBUaW1lU3BlZWQuTk9STUFMID8gMS4wIDogMC41O1xyXG4gICAgICAgIHJldHVybiAxIC8gRVZFTlRfUkFURSAvIHNjYWxlRmFjdG9yO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gSW4gb3JkZXIgdG8gaGF2ZSBleGFjdGx5IHRoZSBzYW1lIG1vZGVsIGJlaGF2aW9yIG9uIHZlcnkgZmFzdCBhbmQgdmVyeSBzbG93IHBsYXRmb3Jtcywgd2UgdXNlXHJcbiAgICAvLyBFdmVudFRpbWVyLCB3aGljaCB1cGRhdGVzIHRoZSBtb2RlbCBhdCByZWd1bGFyIGludGVydmFscywgYW5kIHdlIGNhbiBpbnRlcnBvbGF0ZSBiZXR3ZWVuIHN0YXRlcyBmb3IgYWRkaXRpb25hbFxyXG4gICAgLy8gZmlkZWxpdHkuXHJcbiAgICB0aGlzLmV2ZW50VGltZXIgPSBuZXcgRXZlbnRUaW1lciggZXZlbnRUaW1lck1vZGVsLCB0aW1lRWxhcHNlZCA9PlxyXG4gICAgICB0aGlzLmFkdmFuY2VUaW1lKCAxIC8gRVZFTlRfUkFURSwgZmFsc2UgKVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLnNjZW5lUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHRoaXNbIG9wdGlvbnMuc2NlbmVzWyAwIF0gXSwge1xyXG4gICAgICB2YWxpZFZhbHVlczogdGhpcy5zY2VuZXNcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gd2hldGhlciB0aGUgd2F2ZSBhcmVhIHNob3VsZCBiZSBkaXNwbGF5ZWRcclxuICAgIHRoaXMuc2hvd1dhdmVzUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIHdoZXRoZXIgdGhlIHdhdmUgYXJlYSBncmFwaCBzaG91bGQgYmUgZGlzcGxheWVkXHJcbiAgICB0aGlzLnNob3dHcmFwaFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gd2hldGhlciB0aGUgc2NyZWVuIChvbiB0aGUgcmlnaHQgb2YgdGhlIGxhdHRpY2UpIHNob3VsZCBiZSBzaG93bi5cclxuICAgIHRoaXMuc2hvd1NjcmVlblByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gd2hldGhlciB0aGUgaW50ZW5zaXR5IGdyYXBoIChvbiB0aGUgcmlnaHQgb2YgdGhlIGxhdHRpY2UpIHNob3VsZCBiZSBzaG93bi5cclxuICAgIHRoaXMuc2hvd0ludGVuc2l0eUdyYXBoUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSB3aGV0aGVyIHRoZSBtb2RlbCBpcyBtb3ZpbmcgZm9yd2FyZCBpbiB0aW1lXHJcbiAgICB0aGlzLmlzUnVubmluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSB3aGV0aGVyIHRoZSBtZWFzdXJpbmcgdGFwZSBoYXMgYmVlbiBkcmFnZ2VkIG91dCBvZiB0aGUgdG9vbGJveCBpbnRvIHRoZSBwbGF5IGFyZWFcclxuICAgIHRoaXMuaXNNZWFzdXJpbmdUYXBlSW5QbGF5QXJlYVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLmlzV2F2ZU1ldGVySW5QbGF5QXJlYVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICBjb25zdCByb3RhdGlvbkFtb3VudFJhbmdlID0gbmV3IFJhbmdlKCAwLCAxICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIExpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gV2F2ZXNNb2RlbC5WaWV3cG9pbnQuVE9QICgwKSBhbmQgVmlld3BvaW50LlNJREUgKDEpLiAgVGhpcyBsaW5lYXJcclxuICAgIC8vIGludGVycG9sYXRlIGluIHRoZSBtb2RlbCBpcyBtYXBwZWQgdGhyb3VnaCBhIENVQklDX0lOX09VVCBpbiB0aGUgdmlldyB0byBvYnRhaW4gdGhlIGRlc2lyZWQgbG9vay5cclxuICAgIHRoaXMucm90YXRpb25BbW91bnRQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICByYW5nZTogcm90YXRpb25BbW91bnRSYW5nZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0Rlcml2ZWRQcm9wZXJ0eS48Ym9vbGVhbj59IC0gdHJ1ZSBpZiB0aGUgc3lzdGVtIGlzIHJvdGF0aW5nXHJcbiAgICB0aGlzLmlzUm90YXRpbmdQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5yb3RhdGlvbkFtb3VudFByb3BlcnR5IF0sXHJcbiAgICAgIHJvdGF0aW9uQW1vdW50ID0+IHJvdGF0aW9uQW1vdW50ICE9PSByb3RhdGlvbkFtb3VudFJhbmdlLm1pbiAmJiByb3RhdGlvbkFtb3VudCAhPT0gcm90YXRpb25BbW91bnRSYW5nZS5tYXhcclxuICAgICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIGVtaXRzIG9uY2UgcGVyIHN0ZXBcclxuICAgIHRoaXMuc3RlcEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBtb2RlbCBmb3IgdGhlIHZpZXcgY29vcmRpbmF0ZXMgb2YgdGhlIGJhc2Ugb2YgdGhlIG1lYXN1cmluZyB0YXBlXHJcbiAgICAvLyBXZSB1c2UgdmlldyBjb29yZGluYXRlcyBzbyB0aGF0IG5vdGhpbmcgbmVlZHMgdG8gYmUgZG9uZSB3aGVuIHN3aXRjaGluZyBzY2VuZXMgYW5kIGNvb3JkaW5hdGUgZnJhbWVzLlxyXG4gICAgdGhpcy5tZWFzdXJpbmdUYXBlQmFzZVBvc2l0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggMjAwLCAyMDAgKSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBtb2RlbCBmb3IgdGhlIHZpZXcgY29vcmRpbmF0ZXMgb2YgdGhlIHRpcCBvZiB0aGUgbWVhc3VyaW5nIHRhcGVcclxuICAgIC8vIFRoaXMgcG9zaXRpb24gc2V0cyByZWFzb25hYmxlIG1vZGVsIGRlZmF1bHRzIGZvciBlYWNoIHNjZW5lOiAxLjBjbSwgNTBjbSwgNTAwbm1cclxuICAgIHRoaXMubWVhc3VyaW5nVGFwZVRpcFBvc2l0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggMjUwLCAyMDAgKSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBOb3RpZmllcyBsaXN0ZW5lcnMgd2hlbiB0aGUgbW9kZWwgcmVzZXQgaXMgY29tcGxldGVcclxuICAgIHRoaXMucmVzZXRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gTm90aWZpZXMgd2hlbiByZXNldCBpbiBpbiBwcm9ncmVzcywgdXNlZCB0byBtdXRlIHNvdW5kcyB3aGlsZSByZXNldCBpcyBpbiBwcm9ncmVzc1xyXG4gICAgdGhpcy5pc1Jlc2V0dGluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBSZXNldCB0aGUgc3RvcHdhdGNoIHRpbWUgd2hlbiBjaGFuZ2luZyBzY2VuZXMsIGFuZCBwYXVzZSBpdC5cclxuICAgIHRoaXMuc2NlbmVQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuc3RvcHdhdGNoLmlzUnVubmluZ1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICAgIHRoaXMuc3RvcHdhdGNoLmlzVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhcnMgdGhlIHdhdmUgYW5kIHRoZSBJbnRlbnNpdHkgU2FtcGxlXHJcbiAgICovXHJcbiAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgdGhpcy5zY2VuZVByb3BlcnR5LnZhbHVlLmNsZWFyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZHZhbmNlIHRpbWUgYnkgdGhlIHNwZWNpZmllZCBhbW91bnRcclxuICAgKiBAcGFyYW0gZHQgLSBhbW91bnQgb2YgdGltZSBpbiBzZWNvbmRzIHRvIG1vdmUgdGhlIG1vZGVsIGZvcndhcmRcclxuICAgKi9cclxuICBwdWJsaWMgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBGZWVkIHRoZSByZWFsIHRpbWUgdG8gdGhlIGV2ZW50VGltZXIgYW5kIGl0IHdpbGwgdHJpZ2dlciBhZHZhbmNlVGltZSBhdCB0aGUgYXBwcm9wcmlhdGUgcmF0ZVxyXG4gICAgdGhpcy5ldmVudFRpbWVyLnN0ZXAoIGR0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRpdGlvbmFsbHkgY2FsbGVkIGZyb20gdGhlIFwic3RlcFwiIGJ1dHRvblxyXG4gICAqIEBwYXJhbSB3YWxsRFQgLSBhbW91bnQgb2Ygd2FsbCB0aW1lIHRoYXQgcGFzc2VkLCB3aWxsIGJlIHNjYWxlZCBieSB0aW1lIHNjYWxpbmcgdmFsdWVcclxuICAgKiBAcGFyYW0gbWFudWFsU3RlcCAtIHRydWUgaWYgdGhlIHN0ZXAgYnV0dG9uIGlzIGJlaW5nIHByZXNzZWRcclxuICAgKi9cclxuICBwdWJsaWMgYWR2YW5jZVRpbWUoIHdhbGxEVDogbnVtYmVyLCBtYW51YWxTdGVwOiBib29sZWFuICk6IHZvaWQge1xyXG5cclxuICAgIC8vIEFuaW1hdGUgdGhlIHJvdGF0aW9uLCBpZiBpdCBuZWVkcyB0byByb3RhdGUuICBUaGlzIGlzIG5vdCBzdWJqZWN0IHRvIGJlaW5nIHBhdXNlZCwgYmVjYXVzZSB3ZSB3b3VsZCBsaWtlXHJcbiAgICAvLyBzdHVkZW50cyB0byBiZSBhYmxlIHRvIHNlZSB0aGUgc2lkZSB2aWV3LCBwYXVzZSBpdCwgdGhlbiBzd2l0Y2ggdG8gdGhlIGNvcnJlc3BvbmRpbmcgdG9wIHZpZXcsIGFuZCB2aWNlIHZlcnNhLlxyXG4gICAgY29uc3Qgc2lnbiA9IHRoaXMudmlld3BvaW50UHJvcGVydHkuZ2V0KCkgPT09IFdhdmVzTW9kZWwuVmlld3BvaW50LlRPUCA/IC0xIDogKzE7XHJcbiAgICB0aGlzLnJvdGF0aW9uQW1vdW50UHJvcGVydHkudmFsdWUgPSBVdGlscy5jbGFtcCggdGhpcy5yb3RhdGlvbkFtb3VudFByb3BlcnR5LnZhbHVlICsgd2FsbERUICogc2lnbiAqIDEuNCwgMCwgMSApO1xyXG5cclxuICAgIGlmICggdGhpcy5pc1J1bm5pbmdQcm9wZXJ0eS5nZXQoKSB8fCBtYW51YWxTdGVwICkge1xyXG4gICAgICBjb25zdCBkdCA9IHdhbGxEVCAqIHRoaXMuc2NlbmVQcm9wZXJ0eS52YWx1ZS50aW1lU2NhbGVGYWN0b3I7XHJcbiAgICAgIHRoaXMuc3RvcHdhdGNoLnN0ZXAoIGR0ICk7XHJcblxyXG4gICAgICAvLyBOb3RpZnkgbGlzdGVuZXJzIHRoYXQgYSBmcmFtZSBoYXMgYWR2YW5jZWRcclxuICAgICAgdGhpcy5zdGVwRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgIHRoaXMuc2NlbmVQcm9wZXJ0eS52YWx1ZS5sYXR0aWNlLmludGVycG9sYXRpb25SYXRpbyA9IHRoaXMuZXZlbnRUaW1lci5nZXRSYXRpbygpO1xyXG4gICAgICB0aGlzLnNjZW5lUHJvcGVydHkudmFsdWUuYWR2YW5jZVRpbWUoIHdhbGxEVCwgbWFudWFsU3RlcCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzdG9yZXMgdGhlIGluaXRpYWwgY29uZGl0aW9uc1xyXG4gICAqL1xyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuaXNSZXNldHRpbmdQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcblxyXG4gICAgLy8gUmVzZXQgZnJlcXVlbmN5UHJvcGVydHkgZmlyc3QgYmVjYXVzZSBpdCBjaGFuZ2VzIHRoZSB0aW1lIGFuZCBwaGFzZS4gIFRoaXMgaXMgZG9uZSBieSByZXNldHRpbmcgZWFjaCBvZiB0aGVcclxuICAgIC8vIGZyZXF1ZW5jeVByb3BlcnRpZXMgaW4gdGhlIHNjZW5lc1xyXG4gICAgdGhpcy53YXRlclNjZW5lICYmIHRoaXMud2F0ZXJTY2VuZS5yZXNldCgpO1xyXG4gICAgdGhpcy5zb3VuZFNjZW5lICYmIHRoaXMuc291bmRTY2VuZS5yZXNldCgpO1xyXG4gICAgdGhpcy5saWdodFNjZW5lICYmIHRoaXMubGlnaHRTY2VuZS5yZXNldCgpO1xyXG5cclxuICAgIHRoaXMuc2NlbmVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy52aWV3cG9pbnRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zaG93R3JhcGhQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy50aW1lU3BlZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5pc1J1bm5pbmdQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zaG93U2NyZWVuUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucm90YXRpb25BbW91bnRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zdG9wd2F0Y2gucmVzZXQoKTtcclxuICAgIHRoaXMuc2hvd0ludGVuc2l0eUdyYXBoUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaXNXYXZlTWV0ZXJJblBsYXlBcmVhUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubWVhc3VyaW5nVGFwZVRpcFBvc2l0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubWVhc3VyaW5nVGFwZUJhc2VQb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmlzTWVhc3VyaW5nVGFwZUluUGxheUFyZWFQcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIC8vIFNpZ25pZnkgdG8gbGlzdGVuZXJzIHRoYXQgdGhlIG1vZGVsIHJlc2V0IGlzIGNvbXBsZXRlXHJcbiAgICB0aGlzLnJlc2V0RW1pdHRlci5lbWl0KCk7XHJcblxyXG4gICAgdGhpcy5pc1Jlc2V0dGluZ1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGVuIHVzaW5nIHdhdGVyIGRyb3BzLCB0aGUgc2xpZGVyIGNvbnRyb2xzIHRoZSBkZXNpcmVkIGZyZXF1ZW5jeS4gIFRoZSBhY3R1YWwgZnJlcXVlbmN5IG9uIHRoZSBsYXR0aWNlIGlzIG5vdFxyXG4gICAqIHNldCB1bnRpbCB0aGUgd2F0ZXIgZHJvcCBoaXRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRXYXRlckZyZXF1ZW5jeVNsaWRlclByb3BlcnR5KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy53YXRlclNjZW5lLmRlc2lyZWRGcmVxdWVuY3lQcm9wZXJ0eTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAc3RhdGljXHJcbiAqIEBwdWJsaWNcclxuICovXHJcbldhdmVzTW9kZWwuRVZFTlRfUkFURSA9IEVWRU5UX1JBVEU7XHJcblxyXG4vKipcclxuICogVGhlIHdhdmUgYXJlYSBjYW4gYmUgdmlld2VkIGZyb20gdGhlIFRPUCBvciBmcm9tIHRoZSBTSURFLiBUaGUgdmlldyBhbmltYXRlcyBiZXR3ZWVuIHRoZSBzZWxlY3Rpb25zLlxyXG4gKiBAcHVibGljXHJcbiAqL1xyXG5XYXZlc01vZGVsLlZpZXdwb2ludCA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ1RPUCcsICdTSURFJyBdICk7XHJcblxyXG53YXZlSW50ZXJmZXJlbmNlLnJlZ2lzdGVyKCAnV2F2ZXNNb2RlbCcsIFdhdmVzTW9kZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgV2F2ZXNNb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLG1CQUFtQixNQUFNLDRDQUE0QztBQUM1RSxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUVuRSxPQUFPQyxxQkFBcUIsTUFBTSxtREFBbUQ7QUFDckYsT0FBT0MsVUFBVSxNQUFNLHdDQUF3QztBQUMvRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUs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