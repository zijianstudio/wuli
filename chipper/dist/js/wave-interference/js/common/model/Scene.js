// Copyright 2018-2022, University of Colorado Boulder
// @ts-nocheck
/**
 * The scene determines the medium and wave generator types, coordinate frames, relative scale, etc.  For a description
 * of which features are independent or shared across scenes, please see
 * https://github.com/phetsims/wave-interference/issues/179#issuecomment-437176489
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import validate from '../../../../axon/js/validate.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import squishierButtonV3_007_mp3 from '../../../sounds/squishierButtonV3_007_mp3.js';
import waveInterference from '../../waveInterference.js';
import WaveInterferenceStrings from '../../WaveInterferenceStrings.js';
import WaveInterferenceConstants from '../WaveInterferenceConstants.js';
import Lattice from '../../../../scenery-phet/js/Lattice.js';
import TemporalMask from './TemporalMask.js';

// sound clip to use for the wave generator button
const WAVE_GENERATOR_BUTTON_SOUND_CLIP = new SoundClip(squishierButtonV3_007_mp3, {
  initialOutputLevel: 0.3,
  rateChangesAffectPlayingSounds: false
});
soundManager.addSoundGenerator(WAVE_GENERATOR_BUTTON_SOUND_CLIP);
const distanceUnitsString = WaveInterferenceStrings.distanceUnits;
const timeUnitsString = WaveInterferenceStrings.timeUnits;

// constants
const PLANE_WAVE_MAGNITUDE = 0.21;
const POSITIVE_NUMBER = {
  valueType: 'number',
  isValidValue: v => v > 0
};
const VALID_STRING = {
  valueType: 'string',
  isValidValue: s => s.length > 0
};
const VALID_RANGE = {
  valueType: Range,
  isValidValue: range => range.min > 0 && range.max > 0
};
class Scene {
  // transforms from lattice coordinates to view coordinates, filled in after the view area is initialized, see setViewBounds
  latticeToViewTransform = null;

  // the grid that contains the wave values
  lattice = new Lattice(WaveInterferenceConstants.LATTICE_DIMENSION, WaveInterferenceConstants.LATTICE_DIMENSION, WaveInterferenceConstants.LATTICE_PADDING, WaveInterferenceConstants.LATTICE_PADDING);

  // horizontal position of the barrier in lattice coordinates (includes damping region)
  // note: this is a floating point representation in 2D to work seamlessly with DragListener
  // lattice computations using this floating point value should use Utils.roundSymmetric()
  // start slightly left of 50.5 so it will round to 50 instead of 51
  barrierPositionProperty = new Vector2Property(new Vector2(this.lattice.width / 2 - 1E-6, 0));

  // elapsed time in seconds
  timeProperty = new NumberProperty(0);

  // phase of the wave generator
  phase = 0;

  // indicates the time when the pulse began, or 0 if there is no pulse.
  pulseStartTime = 0;

  // whether the button for the first source is pressed.  This is also used for the slits screen plane wave source.
  button1PressedProperty = new BooleanProperty(false);

  // whether the button for the second source is pressed
  button2PressedProperty = new BooleanProperty(false);

  // the frequency in the appropriate units for the scene

  // controls the amplitude of the wave.

  // units for time, shown in the timer and optionally top right of the lattice

  /**
   * @param config - see below for required properties
   */
  constructor(config) {
    config = merge({
      // Wave type
      numberOfSources: null,
      // {number} - 1 or 2
      waveSpatialType: null,
      // {WaveSpatialType}

      // Values and units for indicators
      scaleIndicatorLength: null,
      // {number} - length that depicts indicate relative scale, see LengthScaleIndicatorNode
      timeScaleString: null,
      // {string} - displayed at the top right of the wave area
      translatedPositionUnits: null,
      // {string} - units for this scene
      positionUnits: null,
      // {string} - the units (in English and for the PhET-iO data stream)
      timeUnits: null,
      // {string} - units for time, shown in the timer and optionally top right of the lattice

      // Dimensions, ranges and physical attributes
      waveAreaWidth: null,
      // {number} - width of the visible part of the lattice in the scene's units
      timeScaleFactor: null,
      // {number} - scale factor to convert seconds of wall time to time for the given scene
      waveSpeed: null,
      // {number}
      planeWaveGeneratorNodeText: null,
      // {string} - shown on the PlaneWaveGeneratorNode
      frequencyRange: null,
      // {Range}
      initialAmplitude: null,
      // {number}
      sourceSeparationRange: null,
      // {Range}

      // Slits configuration
      initialSlitSeparation: null,
      // {number}
      initialSlitWidth: null,
      // {number}
      slitWidthRange: null,
      // {number}
      slitSeparationRange: null,
      // {Range}

      // Graph properties
      graphTitle: null,
      // {string} - the title to the shown on the wave-area graph
      graphVerticalAxisLabel: null,
      // {string} text to show on the vertical axis on the wave-area graph
      graphHorizontalAxisLabel: null // {string} - text that describes the horizontal spatial axis
    }, config);

    // Validation
    validate(config.waveSpatialType, {
      validValues: Scene.WaveSpatialType.VALUES
    });
    validate(config.translatedPositionUnits, VALID_STRING);
    validate(config.waveAreaWidth, POSITIVE_NUMBER);
    validate(config.graphHorizontalAxisLabel, VALID_STRING);
    validate(config.scaleIndicatorLength, POSITIVE_NUMBER);
    validate(config.positionUnits, VALID_STRING);
    validate(config.timeScaleFactor, POSITIVE_NUMBER);
    validate(config.timeUnits, VALID_STRING);
    validate(config.graphVerticalAxisLabel, VALID_STRING);
    validate(config.graphTitle, VALID_STRING);
    validate(config.numberOfSources, {
      validValues: [1, 2]
    });
    validate(config.waveSpeed, POSITIVE_NUMBER);
    validate(config.timeScaleString, {
      valueType: 'string'
    });
    validate(config.planeWaveGeneratorNodeText, VALID_STRING);
    validate(config.frequencyRange, VALID_RANGE);
    validate(config.initialSlitSeparation, POSITIVE_NUMBER);
    validate(config.sourceSeparationRange, VALID_RANGE);
    validate(config.initialSlitWidth, POSITIVE_NUMBER);
    validate(config.slitWidthRange, VALID_RANGE);
    validate(config.slitSeparationRange, VALID_RANGE);
    validate(config.initialAmplitude, POSITIVE_NUMBER);

    // @public (read-only) {WaveSpatialType}
    this.waveSpatialType = config.waveSpatialType;

    // @public (read-only) {string} - units for this scene
    this.translatedPositionUnits = config.translatedPositionUnits;

    // @public (read-only) {number} - width of the visible part of the lattice in the scene's units
    this.waveAreaWidth = config.waveAreaWidth;

    // @public (read-only) {string} - text that describes the horizontal spatial axis
    this.graphHorizontalAxisLabel = config.graphHorizontalAxisLabel;

    // @public (read-only) {number} - length that depicts indicate relative scale, see LengthScaleIndicatorNode
    this.scaleIndicatorLength = config.scaleIndicatorLength;

    // @public (read-only) {string} - the units (in English and for the PhET-iO data stream)
    this.positionUnits = config.positionUnits;

    // @public (read-only) {number} - scale factor to convert seconds of wall time to time for the given scene
    this.timeScaleFactor = config.timeScaleFactor;
    this.timeUnits = config.timeUnits;

    // @public (read-only) {string} text to show on the vertical axis on the wave-area graph
    this.graphVerticalAxisLabel = config.graphVerticalAxisLabel;

    // @public (read-only) {string} - the title to the shown on the wave-area graph
    this.graphTitle = config.graphTitle;

    // @public (read-only) {number}
    this.numberOfSources = config.numberOfSources;

    // @public (read-only) {number}
    this.waveSpeed = config.waveSpeed;

    // @public (read-only) {string} - displayed at the top right of the wave area
    this.timeScaleString = config.timeScaleString;

    // @public (read-only) {string} - shown on the PlaneWaveGeneratorNode
    this.planeWaveGeneratorNodeText = config.planeWaveGeneratorNodeText;

    // These config values are used to create Property instances.
    const frequencyRange = config.frequencyRange;
    const initialSlitSeparation = config.initialSlitSeparation;
    const sourceSeparationRange = config.sourceSeparationRange;
    const initialSlitWidth = config.initialSlitWidth;
    const slitWidthRange = config.slitWidthRange;
    const slitSeparationRange = config.slitSeparationRange;
    const initialAmplitude = config.initialAmplitude;
    this.frequencyProperty = new NumberProperty(frequencyRange.getCenter(), {
      range: frequencyRange
    });

    // @private - point source wave generation is suppressed when changing the source separation
    this.muted = false;

    // @private - the model must be updated once more at the end of a cycle
    this.pulseJustCompleted = false;

    // @public distance between the sources in the units of the scene, or 0 if there is only one
    // source initialized to match the initial slit separation,
    // see https://github.com/phetsims/wave-interference/issues/87
    this.sourceSeparationProperty = new NumberProperty(initialSlitSeparation, {
      units: this.positionUnits,
      range: sourceSeparationRange
    });

    // @public - width of the slit(s) opening in the units for this scene
    this.slitWidthProperty = new NumberProperty(initialSlitWidth, {
      units: this.positionUnits,
      range: slitWidthRange
    });

    // @public distance between the center of the slits, in the units for this scene
    this.slitSeparationProperty = new NumberProperty(initialSlitSeparation, {
      units: this.positionUnits,
      range: slitSeparationRange
    });
    this.amplitudeProperty = new NumberProperty(initialAmplitude, {
      range: WaveInterferenceConstants.AMPLITUDE_RANGE
    });

    // @public (read-only) {string} - text to show to indicate the relative scale, see LengthScaleIndicatorNode
    this.scaleIndicatorText = StringUtils.fillIn(distanceUnitsString, {
      distance: this.scaleIndicatorLength,
      units: this.positionUnits
    });

    // wavelength*frequency=wave speed
    phet.log && this.frequencyProperty.link(frequency => phet.log(`f = ${frequency}/${this.timeUnits}, w = ${this.waveSpeed / frequency} ${this.positionUnits}, v= ${this.waveSpeed} ${this.positionUnits}/${this.timeUnits}`));

    // @public (read-only) {string} - the unit to display on the WaveMeterNode, like "1 s"
    this.oneTimerUnit = StringUtils.fillIn(timeUnitsString, {
      time: 1,
      units: this.timeUnits
    });

    // @public {ModelViewTransform2} - converts the model coordinates (in the units for this scene) to lattice
    // coordinates, does not include damping regions
    this.modelToLatticeTransform = ModelViewTransform2.createRectangleMapping(new Rectangle(0, 0, this.waveAreaWidth, this.waveAreaWidth), this.lattice.visibleBounds);

    // @public {ModelViewTransform2|null} - transforms from the physical units for this scene to view coordinates,
    // filled in after the view area is initialized, see setViewBounds
    this.modelViewTransform = null;

    // @public {DerivedProperty.<number>} - lattice cell index of the continuous barrier position (x coordinate only)
    this.barrierLatticeCoordinateProperty = new DerivedProperty([this.barrierPositionProperty], barrierPosition => Utils.roundSymmetric(barrierPosition.x));

    // @public - pulse or continuous
    this.disturbanceTypeProperty = new Property(Scene.DisturbanceType.CONTINUOUS, {
      validValues: Scene.DisturbanceType.VALUES
    });

    // The first button can trigger a pulse, or continuous wave, depending on the disturbanceTypeProperty
    this.button1PressedProperty.lazyLink(isPressed => {
      this.handleButton1Toggled(isPressed);

      // Clear plane waves if the red button is deselected when paused.
      if (this.waveSpatialType === Scene.WaveSpatialType.PLANE && !isPressed) {
        this.setSourceValues();
        this.lattice.changedEmitter.emit();
      }
    });

    // The 2nd button starts the second continuous wave
    this.button2PressedProperty.lazyLink(isPressed => this.handleButton2Toggled(isPressed));

    // @public - true while a single pulse is being generated
    this.pulseFiringProperty = new BooleanProperty(false);

    // @public (read-only) - signify if a wave is about to start oscillating, see WaterScene
    this.isAboutToFireProperty = new BooleanProperty(false);

    // When the pulse ends, the button pops out
    this.pulseFiringProperty.lazyLink(pulseFiring => {
      if (!pulseFiring) {
        this.button1PressedProperty.value = false;
      }
    });

    // @public (read-only) - the value of the wave at the oscillation point
    this.oscillator1Property = new NumberProperty(0);

    // @public (read-only) - the value of the wave at the oscillation point
    this.oscillator2Property = new NumberProperty(0);

    // @public - true when the first source is continuously oscillating
    this.continuousWave1OscillatingProperty = new BooleanProperty(false);

    // @public - true when the second source is continuously oscillating
    this.continuousWave2OscillatingProperty = new BooleanProperty(false);

    // @private
    this.temporalMask1 = new TemporalMask();

    // @private
    this.temporalMask2 = new TemporalMask();

    // @private - used for temporal masking
    this.stepIndex = 0;

    // @private - when the plane wave frequency is changed, don't update the wave area for a few frames so there is no
    // flicker, see https://github.com/phetsims/wave-interference/issues/309
    this.stepsToSkipForPlaneWaveSources = 0;

    // When the user changes disturbance type, the button pops out and waves stop
    this.disturbanceTypeProperty.link(() => {
      this.button1PressedProperty.value = false;
      this.continuousWave1OscillatingProperty.value = false;
      this.continuousWave2OscillatingProperty.value = false;
      this.pulseFiringProperty.value = false;
    });

    // When frequency changes, choose a new phase such that the new sine curve has the same value and direction
    // for continuity
    const phaseUpdate = (newFrequency, oldFrequency) => {
      // For the main model, Math.sin is performed on angular frequency, so to match the phase, that computation
      // should also be based on angular frequencies
      const oldAngularFrequency = oldFrequency * Math.PI * 2;
      const newAngularFrequency = newFrequency * Math.PI * 2;
      const time = this.timeProperty.value;
      const oldValue = Math.sin(time * oldAngularFrequency + this.phase);
      let proposedPhase = Math.asin(oldValue) - time * newAngularFrequency;
      const oldDerivative = Math.cos(time * oldAngularFrequency + this.phase);
      const newDerivative = Math.cos(time * newAngularFrequency + proposedPhase);

      // If wrong phase, take the sin value from the opposite side and move forward by half a cycle
      if (oldDerivative * newDerivative < 0) {
        proposedPhase = Math.asin(-oldValue) - time * newAngularFrequency + Math.PI;
      }
      this.phase = proposedPhase;

      // When changing the plane wave frequency, clear the wave area to the right of the wave
      if (this.waveSpatialType === Scene.WaveSpatialType.PLANE) {
        this.clear();

        // when the plane wave frequency is changed, don't update the wave area for a few frames so there is no
        // flicker, see https://github.com/phetsims/wave-interference/issues/309
        this.stepsToSkipForPlaneWaveSources = 2;
      } else {
        this.handlePhaseChanged();
      }
    };
    this.frequencyProperty.lazyLink(phaseUpdate);

    // Everything below here is just for plane wave screen.
    if (this.waveSpatialType === Scene.WaveSpatialType.PLANE) {
      // @public - type of the barrier in the lattice
      this.barrierTypeProperty = new Property(Scene.BarrierType.ONE_SLIT, {
        validValues: Scene.BarrierType.VALUES
      });

      // When the barrier moves it creates a lot of artifacts, so clear the wave right of the barrier when it moves
      this.barrierLatticeCoordinateProperty.link(barrierLatticeCoordinate => {
        this.lattice.clearRight(barrierLatticeCoordinate);
      });

      // @private {number} - phase of the wave so it doesn't start halfway through a cycle
      this.planeWavePhase = 0;

      // @protected {number} - record the time the button was pressed, so the SlitsModel can propagate the right
      // distance
      this.button1PressTime = 0;
      this.button1PressedProperty.link(pressed => {
        if (pressed) {
          this.button1PressTime = this.timeProperty.value;

          // See setSourceValues
          const frequency = this.frequencyProperty.get();
          const angularFrequency = frequency * Math.PI * 2;

          // Solve for - angularFrequency * this.timeProperty.value + phase = 0, making sure the phase matches 0 at
          // the edge, see https://github.com/phetsims/wave-interference/issues/207
          this.planeWavePhase = angularFrequency * this.timeProperty.value + Math.PI;
        } else {
          this.clear();
        }
      });

      // When a barrier is added, clear the waves to the right instead of letting them dissipate,
      // see https://github.com/phetsims/wave-interference/issues/176
      this.barrierTypeProperty.link(barrierType => {
        this.clear();
        const frontTime = this.timeProperty.value - this.button1PressTime;
        const frontPosition = this.modelToLatticeTransform.modelToViewX(this.waveSpeed * frontTime);

        // if the wave had passed by the barrier, then repropagate from the barrier.  This requires back-computing the
        // time the button would have been pressed to propagate the wave to the barrier.  Hence this is the inverse of
        // the logic in setSourceValues
        const barrierLatticeX = this.barrierLatticeCoordinateProperty.value;
        if (frontPosition > barrierLatticeX) {
          const barrierModelX = this.modelToLatticeTransform.viewToModelX(barrierLatticeX);
          this.button1PressTime = this.timeProperty.value - barrierModelX / this.waveSpeed;
        }
      });
    }
  }

  /**
   * The user pressed the wave generator button. The default is to always play a sound, but this can be overridden
   * for scenes than have their own sound generation.
   * @param [pressed] - true if button pressed, false if released
   */
  waveGeneratorButtonSound(pressed = true) {
    const playbackRate = pressed ? 1 : 0.891; // one whole step lower for the released sound
    WAVE_GENERATOR_BUTTON_SOUND_CLIP.setPlaybackRate(playbackRate);
    WAVE_GENERATOR_BUTTON_SOUND_CLIP.play();
  }

  /**
   * Generate a wave from a point source
   * @param amplitude
   * @param time
   */
  setPointSourceValues(amplitude, time) {
    const frequency = this.frequencyProperty.get();
    const period = 1 / frequency;
    const timeSincePulseStarted = time - this.pulseStartTime;
    const lattice = this.lattice;
    const isContinuous = this.disturbanceTypeProperty.get() === Scene.DisturbanceType.CONTINUOUS;
    const continuous1 = isContinuous && this.continuousWave1OscillatingProperty.get();
    const continuous2 = isContinuous && this.continuousWave2OscillatingProperty.get();

    // Used to compute whether a delta appears in either mask
    let temporalMask1Empty = true;
    let temporalMask2Empty = true;
    if (continuous1 || continuous2 || this.pulseFiringProperty.get() || this.pulseJustCompleted) {
      // The simulation is designed to start with a downward wave, corresponding to water splashing in
      const frequency = this.frequencyProperty.value;
      const angularFrequency = Math.PI * 2 * frequency;

      // Compute the wave value as a function of time, or set to zero if no longer generating a wave.
      const waveValue = this.pulseFiringProperty.get() && timeSincePulseStarted > period ? 0 : -Math.sin(time * angularFrequency + this.phase) * amplitude * WaveInterferenceConstants.AMPLITUDE_CALIBRATION_SCALE;

      // Distance between the sources, or 0 if there is only 1 source
      const sourceSeparation = this.numberOfSources === 2 ? this.sourceSeparationProperty.get() : 0;

      // assumes a square lattice
      const separationInLatticeUnits = this.modelToLatticeTransform.modelToViewDeltaY(sourceSeparation / 2);
      const distanceFromCenter = Utils.roundSymmetric(separationInLatticeUnits);

      // Named with a "J" suffix instead of "Y" to remind us we are working in integral (i,j) lattice coordinates.
      // Use floor to get 50.5 => 50 instead of 51
      const latticeCenterJ = Math.floor(this.lattice.height / 2);

      // Point source
      if (this.continuousWave1OscillatingProperty.get() || this.pulseFiringProperty.get() || this.pulseJustCompleted) {
        const j = latticeCenterJ + distanceFromCenter;
        lattice.setCurrentValue(WaveInterferenceConstants.POINT_SOURCE_HORIZONTAL_COORDINATE, j, waveValue);
        this.oscillator1Property.value = waveValue;
        if (amplitude > 0) {
          this.temporalMask1.set(true, this.stepIndex, j);
          temporalMask1Empty = false;
        }
      }
      this.pulseJustCompleted = false;

      // Secondary source (note if there is only one source, this sets the same value as above)
      if (this.continuousWave2OscillatingProperty.get()) {
        const j = latticeCenterJ - distanceFromCenter;
        lattice.setCurrentValue(WaveInterferenceConstants.POINT_SOURCE_HORIZONTAL_COORDINATE, j, waveValue);
        this.oscillator2Property.value = waveValue;
        if (amplitude > 0) {
          amplitude > 0 && this.temporalMask2.set(true, this.stepIndex, j);
          temporalMask2Empty = false;
        }
      }
    }
    temporalMask1Empty && this.temporalMask1.set(false, this.stepIndex, 0);
    temporalMask2Empty && this.temporalMask2.set(false, this.stepIndex, 0);
  }

  /**
   * Generate a plane wave
   * @param amplitude
   * @param time
   */
  setPlaneSourceValues(amplitude, time) {
    // When the plane wave frequency is changed, don't update the wave area for a few frames so there is no flicker,
    // see https://github.com/phetsims/wave-interference/issues/309
    if (this.stepsToSkipForPlaneWaveSources > 0) {
      this.stepsToSkipForPlaneWaveSources--;
      return;
    }
    const lattice = this.lattice;
    const barrierLatticeX = this.barrierTypeProperty.value === Scene.BarrierType.NO_BARRIER ? lattice.width - lattice.dampX : this.barrierLatticeCoordinateProperty.value;
    const slitSeparationModel = this.slitSeparationProperty.get();
    const frontTime = time - this.button1PressTime;
    const frontPosition = this.modelToLatticeTransform.modelToViewX(this.waveSpeed * frontTime); // in lattice coordinates

    const slitWidthModel = this.slitWidthProperty.get();
    const slitWidth = Utils.roundSymmetric(this.modelToLatticeTransform.modelToViewDeltaY(slitWidthModel));
    const latticeCenterY = this.lattice.height / 2;

    // Take the desired frequency for the water scene, or the specified frequency of any other scene
    const frequency = this.frequencyProperty.get();
    const wavelength = this.getWavelength();

    // Solve for the wave number
    // lambda * k = 2 * pi
    // k = 2pi/lambda
    const k = Math.PI * 2 / wavelength;

    // Scale the amplitude because it is calibrated for a point source, not a plane wave
    const angularFrequency = frequency * Math.PI * 2;

    // Split into 2 regions.
    // 1. The region where there could be a wave (if it matches the button press and isn't in the barrier)
    // 2. The empirical part beyond the barrier

    // In the incoming region, set all lattice values to be an incoming plane wave.  This prevents any reflections
    // and unwanted artifacts, see https://github.com/phetsims/wave-interference/issues/47
    for (let i = lattice.dampX; i <= barrierLatticeX; i++) {
      // Find the physical model coordinate corresponding to the lattice coordinate
      const x = this.modelToLatticeTransform.viewToModelX(i);
      for (let j = 0; j < lattice.height; j++) {
        const y = this.modelToLatticeTransform.viewToModelY(j);

        // Zero out values in the barrier
        let isCellInBarrier = false;
        if (i === barrierLatticeX) {
          if (this.barrierTypeProperty.value === Scene.BarrierType.ONE_SLIT) {
            const low = j > latticeCenterY + slitWidth / 2 - 0.5;
            const high = j < latticeCenterY - slitWidth / 2 - 0.5;
            isCellInBarrier = low || high;
          } else if (this.barrierTypeProperty.value === Scene.BarrierType.TWO_SLITS) {
            // Spacing is between center of slits.  This computation is done in model coordinates
            const topBarrierWidth = (this.waveAreaWidth - slitWidthModel - slitSeparationModel) / 2;
            const centralBarrierWidth = this.waveAreaWidth - 2 * topBarrierWidth - 2 * slitWidthModel;
            const inTop = y <= topBarrierWidth;
            const inBottom = y >= this.waveAreaWidth - topBarrierWidth;
            const inCenter = y >= topBarrierWidth + slitWidthModel && y <= topBarrierWidth + slitWidthModel + centralBarrierWidth;
            isCellInBarrier = inTop || inBottom || inCenter;
          }
        }
        if (this.button1PressedProperty.get() && !isCellInBarrier) {
          // If the coordinate is past where the front of the wave would be, then zero it out.
          if (i >= frontPosition) {
            lattice.setCurrentValue(i, j, 0);
            lattice.setLastValue(i, j, 0);
          } else {
            const value = amplitude * PLANE_WAVE_MAGNITUDE * Math.sin(k * x - angularFrequency * time + this.planeWavePhase);
            lattice.setCurrentValue(i, j, value);
            lattice.setLastValue(i, j, value);
          }
        } else {
          // Instantly clear the incoming wave, otherwise there are too many reflections
          lattice.setCurrentValue(i, j, 0);
          lattice.setLastValue(i, j, 0);
        }
      }
    }
  }

  /**
   * Set the incoming source values, in this case it is a point source near the left side of the lattice (outside of
   * the damping region).
   */
  setSourceValues() {
    // Get the desired amplitude.  For water, this is set through the desiredAmplitudeProperty.  For other
    // scenes, this is set through the amplitudeProperty.
    const amplitude = this.desiredAmplitudeProperty ? this.desiredAmplitudeProperty.get() : this.amplitudeProperty.get();
    const time = this.timeProperty.value;
    if (this.waveSpatialType === Scene.WaveSpatialType.POINT) {
      this.setPointSourceValues(amplitude, time);
    } else {
      this.setPlaneSourceValues(amplitude, time);
    }
  }

  /**
   * Additionally called from the "step" button
   * @param wallDT - amount of wall time that passed, will be scaled by time scaling value
   * @param manualStep - true if the step button is being pressed
   */
  advanceTime(wallDT, manualStep) {
    const frequency = this.frequencyProperty.get();
    const period = 1 / frequency;

    // Compute a standard dt
    let dt = wallDT * this.timeScaleFactor;

    // Truncate dt if a pulse would end partway through a timestep
    const exceededPulse = this.pulseFiringProperty.get() && this.timeProperty.value + dt - this.pulseStartTime >= period;
    if (exceededPulse) {
      dt = this.pulseStartTime + period - this.timeProperty.value;
    }

    // Update the time
    this.timeProperty.value += dt;

    // If the pulse is running, end the pulse after one period
    if (exceededPulse) {
      this.pulseFiringProperty.set(false);
      this.pulseStartTime = 0;
      this.pulseJustCompleted = true;
    }
    if (!this.muted) {
      // Update the lattice
      this.lattice.step();

      // Apply values on top of the computed lattice values so there is no noise at the point sources
      this.setSourceValues();
    }

    // Scene-specific physics updates happens even when muted, so sound particles will go back to their initial
    // positions
    this.step(dt);
    if (!this.muted) {
      // Apply temporal masking, but only for point sources.  Plane waves already clear the wave area when changing
      // parameters
      if (this.waveSpatialType === Scene.WaveSpatialType.POINT) {
        this.applyTemporalMask();
      }

      // Notify listeners about changes
      this.lattice.changedEmitter.emit();
      this.stepIndex++;
    }
  }

  /**
   * By recording the times and positions of the wave disturbances, and knowing the wave propagation speed,
   * we can apply a masking function across the wave area, zeroing out any cell that could note have been generated
   * from the source disturbance.  This filters out spurious noise and restores "black" for the light scene.
   */
  applyTemporalMask() {
    // zero out values that are outside of the mask
    for (let i = 0; i < this.lattice.width; i++) {
      for (let j = 0; j < this.lattice.height; j++) {
        const cameFrom1 = this.temporalMask1.matches(i, j, this.stepIndex);
        const cameFrom2 = this.temporalMask2.matches(i, j, this.stepIndex);
        this.lattice.setAllowed(i, j, cameFrom1 || cameFrom2);
      }
    }

    // Prune entries.  Elements that are too far out of range are eliminated.  Use the diagonal of the lattice for the
    // max distance
    this.temporalMask1.prune(Math.sqrt(2) * this.lattice.width, this.stepIndex);
    this.temporalMask2.prune(Math.sqrt(2) * this.lattice.width, this.stepIndex);
  }

  /**
   * Clears the wave values
   */
  clear() {
    this.lattice.clear();
    this.temporalMask1.clear();
    this.temporalMask2.clear();
  }

  /**
   * Start the sine argument at 0 so it will smoothly form the first wave.
   */
  resetPhase() {
    const frequency = this.frequencyProperty.get();
    const angularFrequency = Math.PI * 2 * frequency;

    // Solve for the sin arg = 0 in Math.sin( this.time * angularFrequency + this.phase )
    this.phase = -this.timeProperty.value * angularFrequency;
  }

  /**
   * Returns the wavelength in the units of the scene
   */
  getWavelength() {
    return this.waveSpeed / this.frequencyProperty.get();
  }

  /**
   * Returns a Bounds2 for the visible part of the wave area, in the coordinates of the scene.
   * @returns the lattice model bounds, in the coordinates of this scene.
   */
  getWaveAreaBounds() {
    return new Bounds2(0, 0, this.waveAreaWidth, this.waveAreaWidth);
  }

  /**
   * Mute or unmute the model.
   */
  setMuted(muted) {
    this.muted = muted;
    muted && this.clear();
  }

  /**
   * The user has initiated a single pulse.
   * @public
   */
  startPulse() {
    assert && assert(!this.pulseFiringProperty.value, 'Cannot fire a pulse while a pulse is already being fired');
    this.resetPhase();
    this.pulseFiringProperty.value = true;
    this.pulseStartTime = this.timeProperty.value;
  }

  /**
   * Called when the primary button is toggled.  Can be overridden for scene-specific behavior.
   */
  handleButton1Toggled(isPressed) {
    if (isPressed && !this.button2PressedProperty.value) {
      this.resetPhase();
    }
    if (isPressed && this.disturbanceTypeProperty.value === Scene.DisturbanceType.PULSE) {
      this.startPulse();
    } else {
      // Water propagates via the water drop
      this.continuousWave1OscillatingProperty.value = isPressed;
    }
  }

  /**
   * Called when the secondary button is toggled.  Can be overridden for scene-specific behavior.
   */
  handleButton2Toggled(isPressed) {
    if (isPressed && !this.button1PressedProperty.value) {
      this.resetPhase();
    }
    this.continuousWave2OscillatingProperty.value = isPressed;
  }
  handlePhaseChanged() {

    // No-op which may be overridden for scene-specific behavior.  Called when the phase changes.
  }

  /**
   * Restores the initial conditions of this scene.
   */
  reset() {
    this.clear();
    this.muted = false;
    this.frequencyProperty.reset();
    this.slitWidthProperty.reset();
    this.barrierPositionProperty.reset();
    this.slitSeparationProperty.reset();
    this.sourceSeparationProperty.reset();
    this.amplitudeProperty.reset();
    this.disturbanceTypeProperty.reset();
    this.button1PressedProperty.reset();
    this.button2PressedProperty.reset();
    this.oscillator1Property.reset();
    this.oscillator2Property.reset();
    this.continuousWave1OscillatingProperty.reset();
    this.continuousWave2OscillatingProperty.reset();
    this.isAboutToFireProperty.reset();
    this.barrierTypeProperty && this.barrierTypeProperty.reset();
    this.stepsToSkipForPlaneWaveSources = 0;
  }

  /**
   * Move forward in time by the specified amount
   * @param dt - amount of time to move forward, in the units of the scene
   */
  step(dt) {

    // No-op here, subclasses can override to provide behavior.
  }

  /**
   * After the view is initialized, determine the coordinate transformations that map to view coordinates.
   */
  setViewBounds(viewBounds) {
    assert && assert(this.modelViewTransform === null, 'setViewBounds cannot be called twice');
    this.modelViewTransform = ModelViewTransform2.createRectangleMapping(this.getWaveAreaBounds(), viewBounds);
    const latticeBounds = new Bounds2(0, 0, 1, 1);
    const modelBounds = this.modelToLatticeTransform.viewToModelBounds(latticeBounds);
    const tempViewBounds = this.modelViewTransform.modelToViewBounds(modelBounds);
    this.latticeToViewTransform = ModelViewTransform2.createRectangleMapping(latticeBounds, tempViewBounds);
  }
}

/**
 * A wave can be ongoing (CONTINUOUS) or a single wavelength (PULSE)
 * @public
 */
Scene.DisturbanceType = EnumerationDeprecated.byKeys(['PULSE', 'CONTINUOUS']);

/**
 * A wave can either be generated by a point source (POINT) or by a plane wave (PLANE).
 * @public
 */
Scene.WaveSpatialType = EnumerationDeprecated.byKeys(['POINT', 'PLANE']);

/**
 * The wave area can contain a barrier with ONE_SLIT, TWO_SLITS or NO_BARRIER at all.
 * @public
 */
Scene.BarrierType = EnumerationDeprecated.byKeys(['NO_BARRIER', 'ONE_SLIT', 'TWO_SLITS']);
waveInterference.register('Scene', Scene);
export default Scene;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwidmFsaWRhdGUiLCJCb3VuZHMyIiwiUmFuZ2UiLCJSZWN0YW5nbGUiLCJVdGlscyIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJtZXJnZSIsIlN0cmluZ1V0aWxzIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIlNvdW5kQ2xpcCIsInNvdW5kTWFuYWdlciIsInNxdWlzaGllckJ1dHRvblYzXzAwN19tcDMiLCJ3YXZlSW50ZXJmZXJlbmNlIiwiV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MiLCJXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzIiwiTGF0dGljZSIsIlRlbXBvcmFsTWFzayIsIldBVkVfR0VORVJBVE9SX0JVVFRPTl9TT1VORF9DTElQIiwiaW5pdGlhbE91dHB1dExldmVsIiwicmF0ZUNoYW5nZXNBZmZlY3RQbGF5aW5nU291bmRzIiwiYWRkU291bmRHZW5lcmF0b3IiLCJkaXN0YW5jZVVuaXRzU3RyaW5nIiwiZGlzdGFuY2VVbml0cyIsInRpbWVVbml0c1N0cmluZyIsInRpbWVVbml0cyIsIlBMQU5FX1dBVkVfTUFHTklUVURFIiwiUE9TSVRJVkVfTlVNQkVSIiwidmFsdWVUeXBlIiwiaXNWYWxpZFZhbHVlIiwidiIsIlZBTElEX1NUUklORyIsInMiLCJsZW5ndGgiLCJWQUxJRF9SQU5HRSIsInJhbmdlIiwibWluIiwibWF4IiwiU2NlbmUiLCJsYXR0aWNlVG9WaWV3VHJhbnNmb3JtIiwibGF0dGljZSIsIkxBVFRJQ0VfRElNRU5TSU9OIiwiTEFUVElDRV9QQURESU5HIiwiYmFycmllclBvc2l0aW9uUHJvcGVydHkiLCJ3aWR0aCIsInRpbWVQcm9wZXJ0eSIsInBoYXNlIiwicHVsc2VTdGFydFRpbWUiLCJidXR0b24xUHJlc3NlZFByb3BlcnR5IiwiYnV0dG9uMlByZXNzZWRQcm9wZXJ0eSIsImNvbnN0cnVjdG9yIiwiY29uZmlnIiwibnVtYmVyT2ZTb3VyY2VzIiwid2F2ZVNwYXRpYWxUeXBlIiwic2NhbGVJbmRpY2F0b3JMZW5ndGgiLCJ0aW1lU2NhbGVTdHJpbmciLCJ0cmFuc2xhdGVkUG9zaXRpb25Vbml0cyIsInBvc2l0aW9uVW5pdHMiLCJ3YXZlQXJlYVdpZHRoIiwidGltZVNjYWxlRmFjdG9yIiwid2F2ZVNwZWVkIiwicGxhbmVXYXZlR2VuZXJhdG9yTm9kZVRleHQiLCJmcmVxdWVuY3lSYW5nZSIsImluaXRpYWxBbXBsaXR1ZGUiLCJzb3VyY2VTZXBhcmF0aW9uUmFuZ2UiLCJpbml0aWFsU2xpdFNlcGFyYXRpb24iLCJpbml0aWFsU2xpdFdpZHRoIiwic2xpdFdpZHRoUmFuZ2UiLCJzbGl0U2VwYXJhdGlvblJhbmdlIiwiZ3JhcGhUaXRsZSIsImdyYXBoVmVydGljYWxBeGlzTGFiZWwiLCJncmFwaEhvcml6b250YWxBeGlzTGFiZWwiLCJ2YWxpZFZhbHVlcyIsIldhdmVTcGF0aWFsVHlwZSIsIlZBTFVFUyIsImZyZXF1ZW5jeVByb3BlcnR5IiwiZ2V0Q2VudGVyIiwibXV0ZWQiLCJwdWxzZUp1c3RDb21wbGV0ZWQiLCJzb3VyY2VTZXBhcmF0aW9uUHJvcGVydHkiLCJ1bml0cyIsInNsaXRXaWR0aFByb3BlcnR5Iiwic2xpdFNlcGFyYXRpb25Qcm9wZXJ0eSIsImFtcGxpdHVkZVByb3BlcnR5IiwiQU1QTElUVURFX1JBTkdFIiwic2NhbGVJbmRpY2F0b3JUZXh0IiwiZmlsbEluIiwiZGlzdGFuY2UiLCJwaGV0IiwibG9nIiwibGluayIsImZyZXF1ZW5jeSIsIm9uZVRpbWVyVW5pdCIsInRpbWUiLCJtb2RlbFRvTGF0dGljZVRyYW5zZm9ybSIsImNyZWF0ZVJlY3RhbmdsZU1hcHBpbmciLCJ2aXNpYmxlQm91bmRzIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiYmFycmllckxhdHRpY2VDb29yZGluYXRlUHJvcGVydHkiLCJiYXJyaWVyUG9zaXRpb24iLCJyb3VuZFN5bW1ldHJpYyIsIngiLCJkaXN0dXJiYW5jZVR5cGVQcm9wZXJ0eSIsIkRpc3R1cmJhbmNlVHlwZSIsIkNPTlRJTlVPVVMiLCJsYXp5TGluayIsImlzUHJlc3NlZCIsImhhbmRsZUJ1dHRvbjFUb2dnbGVkIiwiUExBTkUiLCJzZXRTb3VyY2VWYWx1ZXMiLCJjaGFuZ2VkRW1pdHRlciIsImVtaXQiLCJoYW5kbGVCdXR0b24yVG9nZ2xlZCIsInB1bHNlRmlyaW5nUHJvcGVydHkiLCJpc0Fib3V0VG9GaXJlUHJvcGVydHkiLCJwdWxzZUZpcmluZyIsInZhbHVlIiwib3NjaWxsYXRvcjFQcm9wZXJ0eSIsIm9zY2lsbGF0b3IyUHJvcGVydHkiLCJjb250aW51b3VzV2F2ZTFPc2NpbGxhdGluZ1Byb3BlcnR5IiwiY29udGludW91c1dhdmUyT3NjaWxsYXRpbmdQcm9wZXJ0eSIsInRlbXBvcmFsTWFzazEiLCJ0ZW1wb3JhbE1hc2syIiwic3RlcEluZGV4Iiwic3RlcHNUb1NraXBGb3JQbGFuZVdhdmVTb3VyY2VzIiwicGhhc2VVcGRhdGUiLCJuZXdGcmVxdWVuY3kiLCJvbGRGcmVxdWVuY3kiLCJvbGRBbmd1bGFyRnJlcXVlbmN5IiwiTWF0aCIsIlBJIiwibmV3QW5ndWxhckZyZXF1ZW5jeSIsIm9sZFZhbHVlIiwic2luIiwicHJvcG9zZWRQaGFzZSIsImFzaW4iLCJvbGREZXJpdmF0aXZlIiwiY29zIiwibmV3RGVyaXZhdGl2ZSIsImNsZWFyIiwiaGFuZGxlUGhhc2VDaGFuZ2VkIiwiYmFycmllclR5cGVQcm9wZXJ0eSIsIkJhcnJpZXJUeXBlIiwiT05FX1NMSVQiLCJiYXJyaWVyTGF0dGljZUNvb3JkaW5hdGUiLCJjbGVhclJpZ2h0IiwicGxhbmVXYXZlUGhhc2UiLCJidXR0b24xUHJlc3NUaW1lIiwicHJlc3NlZCIsImdldCIsImFuZ3VsYXJGcmVxdWVuY3kiLCJiYXJyaWVyVHlwZSIsImZyb250VGltZSIsImZyb250UG9zaXRpb24iLCJtb2RlbFRvVmlld1giLCJiYXJyaWVyTGF0dGljZVgiLCJiYXJyaWVyTW9kZWxYIiwidmlld1RvTW9kZWxYIiwid2F2ZUdlbmVyYXRvckJ1dHRvblNvdW5kIiwicGxheWJhY2tSYXRlIiwic2V0UGxheWJhY2tSYXRlIiwicGxheSIsInNldFBvaW50U291cmNlVmFsdWVzIiwiYW1wbGl0dWRlIiwicGVyaW9kIiwidGltZVNpbmNlUHVsc2VTdGFydGVkIiwiaXNDb250aW51b3VzIiwiY29udGludW91czEiLCJjb250aW51b3VzMiIsInRlbXBvcmFsTWFzazFFbXB0eSIsInRlbXBvcmFsTWFzazJFbXB0eSIsIndhdmVWYWx1ZSIsIkFNUExJVFVERV9DQUxJQlJBVElPTl9TQ0FMRSIsInNvdXJjZVNlcGFyYXRpb24iLCJzZXBhcmF0aW9uSW5MYXR0aWNlVW5pdHMiLCJtb2RlbFRvVmlld0RlbHRhWSIsImRpc3RhbmNlRnJvbUNlbnRlciIsImxhdHRpY2VDZW50ZXJKIiwiZmxvb3IiLCJoZWlnaHQiLCJqIiwic2V0Q3VycmVudFZhbHVlIiwiUE9JTlRfU09VUkNFX0hPUklaT05UQUxfQ09PUkRJTkFURSIsInNldCIsInNldFBsYW5lU291cmNlVmFsdWVzIiwiTk9fQkFSUklFUiIsImRhbXBYIiwic2xpdFNlcGFyYXRpb25Nb2RlbCIsInNsaXRXaWR0aE1vZGVsIiwic2xpdFdpZHRoIiwibGF0dGljZUNlbnRlclkiLCJ3YXZlbGVuZ3RoIiwiZ2V0V2F2ZWxlbmd0aCIsImsiLCJpIiwieSIsInZpZXdUb01vZGVsWSIsImlzQ2VsbEluQmFycmllciIsImxvdyIsImhpZ2giLCJUV09fU0xJVFMiLCJ0b3BCYXJyaWVyV2lkdGgiLCJjZW50cmFsQmFycmllcldpZHRoIiwiaW5Ub3AiLCJpbkJvdHRvbSIsImluQ2VudGVyIiwic2V0TGFzdFZhbHVlIiwiZGVzaXJlZEFtcGxpdHVkZVByb3BlcnR5IiwiUE9JTlQiLCJhZHZhbmNlVGltZSIsIndhbGxEVCIsIm1hbnVhbFN0ZXAiLCJkdCIsImV4Y2VlZGVkUHVsc2UiLCJzdGVwIiwiYXBwbHlUZW1wb3JhbE1hc2siLCJjYW1lRnJvbTEiLCJtYXRjaGVzIiwiY2FtZUZyb20yIiwic2V0QWxsb3dlZCIsInBydW5lIiwic3FydCIsInJlc2V0UGhhc2UiLCJnZXRXYXZlQXJlYUJvdW5kcyIsInNldE11dGVkIiwic3RhcnRQdWxzZSIsImFzc2VydCIsIlBVTFNFIiwicmVzZXQiLCJzZXRWaWV3Qm91bmRzIiwidmlld0JvdW5kcyIsImxhdHRpY2VCb3VuZHMiLCJtb2RlbEJvdW5kcyIsInZpZXdUb01vZGVsQm91bmRzIiwidGVtcFZpZXdCb3VuZHMiLCJtb2RlbFRvVmlld0JvdW5kcyIsImJ5S2V5cyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2NlbmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcbi8vIEB0cy1ub2NoZWNrXHJcbi8qKlxyXG4gKiBUaGUgc2NlbmUgZGV0ZXJtaW5lcyB0aGUgbWVkaXVtIGFuZCB3YXZlIGdlbmVyYXRvciB0eXBlcywgY29vcmRpbmF0ZSBmcmFtZXMsIHJlbGF0aXZlIHNjYWxlLCBldGMuICBGb3IgYSBkZXNjcmlwdGlvblxyXG4gKiBvZiB3aGljaCBmZWF0dXJlcyBhcmUgaW5kZXBlbmRlbnQgb3Igc2hhcmVkIGFjcm9zcyBzY2VuZXMsIHBsZWFzZSBzZWVcclxuICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3dhdmUtaW50ZXJmZXJlbmNlL2lzc3Vlcy8xNzkjaXNzdWVjb21tZW50LTQzNzE3NjQ4OVxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB2YWxpZGF0ZSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL3ZhbGlkYXRlLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFJlY3RhbmdsZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmVjdGFuZ2xlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25EZXByZWNhdGVkLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IFNvdW5kQ2xpcCBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9zb3VuZC1nZW5lcmF0b3JzL1NvdW5kQ2xpcC5qcyc7XHJcbmltcG9ydCBzb3VuZE1hbmFnZXIgZnJvbSAnLi4vLi4vLi4vLi4vdGFtYm8vanMvc291bmRNYW5hZ2VyLmpzJztcclxuaW1wb3J0IHNxdWlzaGllckJ1dHRvblYzXzAwN19tcDMgZnJvbSAnLi4vLi4vLi4vc291bmRzL3NxdWlzaGllckJ1dHRvblYzXzAwN19tcDMuanMnO1xyXG5pbXBvcnQgd2F2ZUludGVyZmVyZW5jZSBmcm9tICcuLi8uLi93YXZlSW50ZXJmZXJlbmNlLmpzJztcclxuaW1wb3J0IFdhdmVJbnRlcmZlcmVuY2VTdHJpbmdzIGZyb20gJy4uLy4uL1dhdmVJbnRlcmZlcmVuY2VTdHJpbmdzLmpzJztcclxuaW1wb3J0IFdhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMgZnJvbSAnLi4vV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBMYXR0aWNlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9MYXR0aWNlLmpzJztcclxuaW1wb3J0IFRlbXBvcmFsTWFzayBmcm9tICcuL1RlbXBvcmFsTWFzay5qcyc7XHJcblxyXG4vLyBzb3VuZCBjbGlwIHRvIHVzZSBmb3IgdGhlIHdhdmUgZ2VuZXJhdG9yIGJ1dHRvblxyXG5jb25zdCBXQVZFX0dFTkVSQVRPUl9CVVRUT05fU09VTkRfQ0xJUCA9IG5ldyBTb3VuZENsaXAoIHNxdWlzaGllckJ1dHRvblYzXzAwN19tcDMsIHtcclxuICBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuMyxcclxuICByYXRlQ2hhbmdlc0FmZmVjdFBsYXlpbmdTb3VuZHM6IGZhbHNlXHJcbn0gKTtcclxuc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBXQVZFX0dFTkVSQVRPUl9CVVRUT05fU09VTkRfQ0xJUCApO1xyXG5cclxuY29uc3QgZGlzdGFuY2VVbml0c1N0cmluZyA9IFdhdmVJbnRlcmZlcmVuY2VTdHJpbmdzLmRpc3RhbmNlVW5pdHM7XHJcbmNvbnN0IHRpbWVVbml0c1N0cmluZyA9IFdhdmVJbnRlcmZlcmVuY2VTdHJpbmdzLnRpbWVVbml0cztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBQTEFORV9XQVZFX01BR05JVFVERSA9IDAuMjE7XHJcbmNvbnN0IFBPU0lUSVZFX05VTUJFUiA9IHtcclxuICB2YWx1ZVR5cGU6ICdudW1iZXInLFxyXG4gIGlzVmFsaWRWYWx1ZTogdiA9PiB2ID4gMFxyXG59O1xyXG5jb25zdCBWQUxJRF9TVFJJTkcgPSB7XHJcbiAgdmFsdWVUeXBlOiAnc3RyaW5nJyxcclxuICBpc1ZhbGlkVmFsdWU6IHMgPT4gcy5sZW5ndGggPiAwXHJcbn07XHJcbmNvbnN0IFZBTElEX1JBTkdFID0ge1xyXG4gIHZhbHVlVHlwZTogUmFuZ2UsXHJcbiAgaXNWYWxpZFZhbHVlOiAoIHJhbmdlOiBSYW5nZSApID0+IHJhbmdlLm1pbiA+IDAgJiYgcmFuZ2UubWF4ID4gMFxyXG59O1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcbmV4cG9ydCB0eXBlIFNjZW5lT3B0aW9ucyA9IFNlbGZPcHRpb25zO1xyXG5cclxuY2xhc3MgU2NlbmUge1xyXG5cclxuICAvLyB0cmFuc2Zvcm1zIGZyb20gbGF0dGljZSBjb29yZGluYXRlcyB0byB2aWV3IGNvb3JkaW5hdGVzLCBmaWxsZWQgaW4gYWZ0ZXIgdGhlIHZpZXcgYXJlYSBpcyBpbml0aWFsaXplZCwgc2VlIHNldFZpZXdCb3VuZHNcclxuICBwdWJsaWMgcmVhZG9ubHkgbGF0dGljZVRvVmlld1RyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMiB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvLyB0aGUgZ3JpZCB0aGF0IGNvbnRhaW5zIHRoZSB3YXZlIHZhbHVlc1xyXG4gIHB1YmxpYyByZWFkb25seSBsYXR0aWNlID0gbmV3IExhdHRpY2UoXHJcbiAgICBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLkxBVFRJQ0VfRElNRU5TSU9OLFxyXG4gICAgV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5MQVRUSUNFX0RJTUVOU0lPTixcclxuICAgIFdhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMuTEFUVElDRV9QQURESU5HLFxyXG4gICAgV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5MQVRUSUNFX1BBRERJTkdcclxuICApO1xyXG5cclxuICAvLyBob3Jpem9udGFsIHBvc2l0aW9uIG9mIHRoZSBiYXJyaWVyIGluIGxhdHRpY2UgY29vcmRpbmF0ZXMgKGluY2x1ZGVzIGRhbXBpbmcgcmVnaW9uKVxyXG4gIC8vIG5vdGU6IHRoaXMgaXMgYSBmbG9hdGluZyBwb2ludCByZXByZXNlbnRhdGlvbiBpbiAyRCB0byB3b3JrIHNlYW1sZXNzbHkgd2l0aCBEcmFnTGlzdGVuZXJcclxuICAvLyBsYXR0aWNlIGNvbXB1dGF0aW9ucyB1c2luZyB0aGlzIGZsb2F0aW5nIHBvaW50IHZhbHVlIHNob3VsZCB1c2UgVXRpbHMucm91bmRTeW1tZXRyaWMoKVxyXG4gIC8vIHN0YXJ0IHNsaWdodGx5IGxlZnQgb2YgNTAuNSBzbyBpdCB3aWxsIHJvdW5kIHRvIDUwIGluc3RlYWQgb2YgNTFcclxuICBwdWJsaWMgcmVhZG9ubHkgYmFycmllclBvc2l0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggdGhpcy5sYXR0aWNlLndpZHRoIC8gMiAtIDFFLTYsIDAgKSApO1xyXG5cclxuICAvLyBlbGFwc2VkIHRpbWUgaW4gc2Vjb25kc1xyXG4gIHB1YmxpYyByZWFkb25seSB0aW1lUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcclxuXHJcbiAgLy8gcGhhc2Ugb2YgdGhlIHdhdmUgZ2VuZXJhdG9yXHJcbiAgcHVibGljIHJlYWRvbmx5IHBoYXNlID0gMDtcclxuXHJcbiAgLy8gaW5kaWNhdGVzIHRoZSB0aW1lIHdoZW4gdGhlIHB1bHNlIGJlZ2FuLCBvciAwIGlmIHRoZXJlIGlzIG5vIHB1bHNlLlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcHVsc2VTdGFydFRpbWUgPSAwO1xyXG5cclxuICAvLyB3aGV0aGVyIHRoZSBidXR0b24gZm9yIHRoZSBmaXJzdCBzb3VyY2UgaXMgcHJlc3NlZC4gIFRoaXMgaXMgYWxzbyB1c2VkIGZvciB0aGUgc2xpdHMgc2NyZWVuIHBsYW5lIHdhdmUgc291cmNlLlxyXG4gIHB1YmxpYyByZWFkb25seSBidXR0b24xUHJlc3NlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgLy8gd2hldGhlciB0aGUgYnV0dG9uIGZvciB0aGUgc2Vjb25kIHNvdXJjZSBpcyBwcmVzc2VkXHJcbiAgcHVibGljIHJlYWRvbmx5IGJ1dHRvbjJQcmVzc2VkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAvLyB0aGUgZnJlcXVlbmN5IGluIHRoZSBhcHByb3ByaWF0ZSB1bml0cyBmb3IgdGhlIHNjZW5lXHJcbiAgcHVibGljIHJlYWRvbmx5IGZyZXF1ZW5jeVByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuXHJcbiAgLy8gY29udHJvbHMgdGhlIGFtcGxpdHVkZSBvZiB0aGUgd2F2ZS5cclxuICBwdWJsaWMgcmVhZG9ubHkgYW1wbGl0dWRlUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG5cclxuICAvLyB1bml0cyBmb3IgdGltZSwgc2hvd24gaW4gdGhlIHRpbWVyIGFuZCBvcHRpb25hbGx5IHRvcCByaWdodCBvZiB0aGUgbGF0dGljZVxyXG4gIHB1YmxpYyByZWFkb25seSB0aW1lVW5pdHM6IHN0cmluZztcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGNvbmZpZyAtIHNlZSBiZWxvdyBmb3IgcmVxdWlyZWQgcHJvcGVydGllc1xyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvciggY29uZmlnOiBTY2VuZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uZmlnID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIFdhdmUgdHlwZVxyXG4gICAgICBudW1iZXJPZlNvdXJjZXM6IG51bGwsIC8vIHtudW1iZXJ9IC0gMSBvciAyXHJcbiAgICAgIHdhdmVTcGF0aWFsVHlwZTogbnVsbCwgLy8ge1dhdmVTcGF0aWFsVHlwZX1cclxuXHJcbiAgICAgIC8vIFZhbHVlcyBhbmQgdW5pdHMgZm9yIGluZGljYXRvcnNcclxuICAgICAgc2NhbGVJbmRpY2F0b3JMZW5ndGg6IG51bGwsIC8vIHtudW1iZXJ9IC0gbGVuZ3RoIHRoYXQgZGVwaWN0cyBpbmRpY2F0ZSByZWxhdGl2ZSBzY2FsZSwgc2VlIExlbmd0aFNjYWxlSW5kaWNhdG9yTm9kZVxyXG4gICAgICB0aW1lU2NhbGVTdHJpbmc6IG51bGwsIC8vIHtzdHJpbmd9IC0gZGlzcGxheWVkIGF0IHRoZSB0b3AgcmlnaHQgb2YgdGhlIHdhdmUgYXJlYVxyXG4gICAgICB0cmFuc2xhdGVkUG9zaXRpb25Vbml0czogbnVsbCwgLy8ge3N0cmluZ30gLSB1bml0cyBmb3IgdGhpcyBzY2VuZVxyXG4gICAgICBwb3NpdGlvblVuaXRzOiBudWxsLCAvLyB7c3RyaW5nfSAtIHRoZSB1bml0cyAoaW4gRW5nbGlzaCBhbmQgZm9yIHRoZSBQaEVULWlPIGRhdGEgc3RyZWFtKVxyXG4gICAgICB0aW1lVW5pdHM6IG51bGwsIC8vIHtzdHJpbmd9IC0gdW5pdHMgZm9yIHRpbWUsIHNob3duIGluIHRoZSB0aW1lciBhbmQgb3B0aW9uYWxseSB0b3AgcmlnaHQgb2YgdGhlIGxhdHRpY2VcclxuXHJcbiAgICAgIC8vIERpbWVuc2lvbnMsIHJhbmdlcyBhbmQgcGh5c2ljYWwgYXR0cmlidXRlc1xyXG4gICAgICB3YXZlQXJlYVdpZHRoOiBudWxsLCAvLyB7bnVtYmVyfSAtIHdpZHRoIG9mIHRoZSB2aXNpYmxlIHBhcnQgb2YgdGhlIGxhdHRpY2UgaW4gdGhlIHNjZW5lJ3MgdW5pdHNcclxuICAgICAgdGltZVNjYWxlRmFjdG9yOiBudWxsLCAvLyB7bnVtYmVyfSAtIHNjYWxlIGZhY3RvciB0byBjb252ZXJ0IHNlY29uZHMgb2Ygd2FsbCB0aW1lIHRvIHRpbWUgZm9yIHRoZSBnaXZlbiBzY2VuZVxyXG4gICAgICB3YXZlU3BlZWQ6IG51bGwsIC8vIHtudW1iZXJ9XHJcbiAgICAgIHBsYW5lV2F2ZUdlbmVyYXRvck5vZGVUZXh0OiBudWxsLCAvLyB7c3RyaW5nfSAtIHNob3duIG9uIHRoZSBQbGFuZVdhdmVHZW5lcmF0b3JOb2RlXHJcbiAgICAgIGZyZXF1ZW5jeVJhbmdlOiBudWxsLCAvLyB7UmFuZ2V9XHJcbiAgICAgIGluaXRpYWxBbXBsaXR1ZGU6IG51bGwsIC8vIHtudW1iZXJ9XHJcbiAgICAgIHNvdXJjZVNlcGFyYXRpb25SYW5nZTogbnVsbCwgLy8ge1JhbmdlfVxyXG5cclxuICAgICAgLy8gU2xpdHMgY29uZmlndXJhdGlvblxyXG4gICAgICBpbml0aWFsU2xpdFNlcGFyYXRpb246IG51bGwsIC8vIHtudW1iZXJ9XHJcbiAgICAgIGluaXRpYWxTbGl0V2lkdGg6IG51bGwsIC8vIHtudW1iZXJ9XHJcbiAgICAgIHNsaXRXaWR0aFJhbmdlOiBudWxsLCAvLyB7bnVtYmVyfVxyXG4gICAgICBzbGl0U2VwYXJhdGlvblJhbmdlOiBudWxsLCAvLyB7UmFuZ2V9XHJcblxyXG4gICAgICAvLyBHcmFwaCBwcm9wZXJ0aWVzXHJcbiAgICAgIGdyYXBoVGl0bGU6IG51bGwsIC8vIHtzdHJpbmd9IC0gdGhlIHRpdGxlIHRvIHRoZSBzaG93biBvbiB0aGUgd2F2ZS1hcmVhIGdyYXBoXHJcbiAgICAgIGdyYXBoVmVydGljYWxBeGlzTGFiZWw6IG51bGwsIC8vIHtzdHJpbmd9IHRleHQgdG8gc2hvdyBvbiB0aGUgdmVydGljYWwgYXhpcyBvbiB0aGUgd2F2ZS1hcmVhIGdyYXBoXHJcbiAgICAgIGdyYXBoSG9yaXpvbnRhbEF4aXNMYWJlbDogbnVsbCAvLyB7c3RyaW5nfSAtIHRleHQgdGhhdCBkZXNjcmliZXMgdGhlIGhvcml6b250YWwgc3BhdGlhbCBheGlzXHJcbiAgICB9LCBjb25maWcgKTtcclxuXHJcbiAgICAvLyBWYWxpZGF0aW9uXHJcbiAgICB2YWxpZGF0ZSggY29uZmlnLndhdmVTcGF0aWFsVHlwZSwgeyB2YWxpZFZhbHVlczogU2NlbmUuV2F2ZVNwYXRpYWxUeXBlLlZBTFVFUyB9ICk7XHJcbiAgICB2YWxpZGF0ZSggY29uZmlnLnRyYW5zbGF0ZWRQb3NpdGlvblVuaXRzLCBWQUxJRF9TVFJJTkcgKTtcclxuICAgIHZhbGlkYXRlKCBjb25maWcud2F2ZUFyZWFXaWR0aCwgUE9TSVRJVkVfTlVNQkVSICk7XHJcbiAgICB2YWxpZGF0ZSggY29uZmlnLmdyYXBoSG9yaXpvbnRhbEF4aXNMYWJlbCwgVkFMSURfU1RSSU5HICk7XHJcbiAgICB2YWxpZGF0ZSggY29uZmlnLnNjYWxlSW5kaWNhdG9yTGVuZ3RoLCBQT1NJVElWRV9OVU1CRVIgKTtcclxuICAgIHZhbGlkYXRlKCBjb25maWcucG9zaXRpb25Vbml0cywgVkFMSURfU1RSSU5HICk7XHJcbiAgICB2YWxpZGF0ZSggY29uZmlnLnRpbWVTY2FsZUZhY3RvciwgUE9TSVRJVkVfTlVNQkVSICk7XHJcbiAgICB2YWxpZGF0ZSggY29uZmlnLnRpbWVVbml0cywgVkFMSURfU1RSSU5HICk7XHJcbiAgICB2YWxpZGF0ZSggY29uZmlnLmdyYXBoVmVydGljYWxBeGlzTGFiZWwsIFZBTElEX1NUUklORyApO1xyXG4gICAgdmFsaWRhdGUoIGNvbmZpZy5ncmFwaFRpdGxlLCBWQUxJRF9TVFJJTkcgKTtcclxuICAgIHZhbGlkYXRlKCBjb25maWcubnVtYmVyT2ZTb3VyY2VzLCB7IHZhbGlkVmFsdWVzOiBbIDEsIDIgXSB9ICk7XHJcbiAgICB2YWxpZGF0ZSggY29uZmlnLndhdmVTcGVlZCwgUE9TSVRJVkVfTlVNQkVSICk7XHJcbiAgICB2YWxpZGF0ZSggY29uZmlnLnRpbWVTY2FsZVN0cmluZywgeyB2YWx1ZVR5cGU6ICdzdHJpbmcnIH0gKTtcclxuICAgIHZhbGlkYXRlKCBjb25maWcucGxhbmVXYXZlR2VuZXJhdG9yTm9kZVRleHQsIFZBTElEX1NUUklORyApO1xyXG4gICAgdmFsaWRhdGUoIGNvbmZpZy5mcmVxdWVuY3lSYW5nZSwgVkFMSURfUkFOR0UgKTtcclxuICAgIHZhbGlkYXRlKCBjb25maWcuaW5pdGlhbFNsaXRTZXBhcmF0aW9uLCBQT1NJVElWRV9OVU1CRVIgKTtcclxuICAgIHZhbGlkYXRlKCBjb25maWcuc291cmNlU2VwYXJhdGlvblJhbmdlLCBWQUxJRF9SQU5HRSApO1xyXG4gICAgdmFsaWRhdGUoIGNvbmZpZy5pbml0aWFsU2xpdFdpZHRoLCBQT1NJVElWRV9OVU1CRVIgKTtcclxuICAgIHZhbGlkYXRlKCBjb25maWcuc2xpdFdpZHRoUmFuZ2UsIFZBTElEX1JBTkdFICk7XHJcbiAgICB2YWxpZGF0ZSggY29uZmlnLnNsaXRTZXBhcmF0aW9uUmFuZ2UsIFZBTElEX1JBTkdFICk7XHJcbiAgICB2YWxpZGF0ZSggY29uZmlnLmluaXRpYWxBbXBsaXR1ZGUsIFBPU0lUSVZFX05VTUJFUiApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1dhdmVTcGF0aWFsVHlwZX1cclxuICAgIHRoaXMud2F2ZVNwYXRpYWxUeXBlID0gY29uZmlnLndhdmVTcGF0aWFsVHlwZTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtzdHJpbmd9IC0gdW5pdHMgZm9yIHRoaXMgc2NlbmVcclxuICAgIHRoaXMudHJhbnNsYXRlZFBvc2l0aW9uVW5pdHMgPSBjb25maWcudHJhbnNsYXRlZFBvc2l0aW9uVW5pdHM7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7bnVtYmVyfSAtIHdpZHRoIG9mIHRoZSB2aXNpYmxlIHBhcnQgb2YgdGhlIGxhdHRpY2UgaW4gdGhlIHNjZW5lJ3MgdW5pdHNcclxuICAgIHRoaXMud2F2ZUFyZWFXaWR0aCA9IGNvbmZpZy53YXZlQXJlYVdpZHRoO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge3N0cmluZ30gLSB0ZXh0IHRoYXQgZGVzY3JpYmVzIHRoZSBob3Jpem9udGFsIHNwYXRpYWwgYXhpc1xyXG4gICAgdGhpcy5ncmFwaEhvcml6b250YWxBeGlzTGFiZWwgPSBjb25maWcuZ3JhcGhIb3Jpem9udGFsQXhpc0xhYmVsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge251bWJlcn0gLSBsZW5ndGggdGhhdCBkZXBpY3RzIGluZGljYXRlIHJlbGF0aXZlIHNjYWxlLCBzZWUgTGVuZ3RoU2NhbGVJbmRpY2F0b3JOb2RlXHJcbiAgICB0aGlzLnNjYWxlSW5kaWNhdG9yTGVuZ3RoID0gY29uZmlnLnNjYWxlSW5kaWNhdG9yTGVuZ3RoO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge3N0cmluZ30gLSB0aGUgdW5pdHMgKGluIEVuZ2xpc2ggYW5kIGZvciB0aGUgUGhFVC1pTyBkYXRhIHN0cmVhbSlcclxuICAgIHRoaXMucG9zaXRpb25Vbml0cyA9IGNvbmZpZy5wb3NpdGlvblVuaXRzO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge251bWJlcn0gLSBzY2FsZSBmYWN0b3IgdG8gY29udmVydCBzZWNvbmRzIG9mIHdhbGwgdGltZSB0byB0aW1lIGZvciB0aGUgZ2l2ZW4gc2NlbmVcclxuICAgIHRoaXMudGltZVNjYWxlRmFjdG9yID0gY29uZmlnLnRpbWVTY2FsZUZhY3RvcjtcclxuXHJcbiAgICB0aGlzLnRpbWVVbml0cyA9IGNvbmZpZy50aW1lVW5pdHM7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7c3RyaW5nfSB0ZXh0IHRvIHNob3cgb24gdGhlIHZlcnRpY2FsIGF4aXMgb24gdGhlIHdhdmUtYXJlYSBncmFwaFxyXG4gICAgdGhpcy5ncmFwaFZlcnRpY2FsQXhpc0xhYmVsID0gY29uZmlnLmdyYXBoVmVydGljYWxBeGlzTGFiZWw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7c3RyaW5nfSAtIHRoZSB0aXRsZSB0byB0aGUgc2hvd24gb24gdGhlIHdhdmUtYXJlYSBncmFwaFxyXG4gICAgdGhpcy5ncmFwaFRpdGxlID0gY29uZmlnLmdyYXBoVGl0bGU7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7bnVtYmVyfVxyXG4gICAgdGhpcy5udW1iZXJPZlNvdXJjZXMgPSBjb25maWcubnVtYmVyT2ZTb3VyY2VzO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge251bWJlcn1cclxuICAgIHRoaXMud2F2ZVNwZWVkID0gY29uZmlnLndhdmVTcGVlZDtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtzdHJpbmd9IC0gZGlzcGxheWVkIGF0IHRoZSB0b3AgcmlnaHQgb2YgdGhlIHdhdmUgYXJlYVxyXG4gICAgdGhpcy50aW1lU2NhbGVTdHJpbmcgPSBjb25maWcudGltZVNjYWxlU3RyaW5nO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge3N0cmluZ30gLSBzaG93biBvbiB0aGUgUGxhbmVXYXZlR2VuZXJhdG9yTm9kZVxyXG4gICAgdGhpcy5wbGFuZVdhdmVHZW5lcmF0b3JOb2RlVGV4dCA9IGNvbmZpZy5wbGFuZVdhdmVHZW5lcmF0b3JOb2RlVGV4dDtcclxuXHJcbiAgICAvLyBUaGVzZSBjb25maWcgdmFsdWVzIGFyZSB1c2VkIHRvIGNyZWF0ZSBQcm9wZXJ0eSBpbnN0YW5jZXMuXHJcbiAgICBjb25zdCBmcmVxdWVuY3lSYW5nZSA9IGNvbmZpZy5mcmVxdWVuY3lSYW5nZTtcclxuICAgIGNvbnN0IGluaXRpYWxTbGl0U2VwYXJhdGlvbiA9IGNvbmZpZy5pbml0aWFsU2xpdFNlcGFyYXRpb247XHJcbiAgICBjb25zdCBzb3VyY2VTZXBhcmF0aW9uUmFuZ2UgPSBjb25maWcuc291cmNlU2VwYXJhdGlvblJhbmdlO1xyXG4gICAgY29uc3QgaW5pdGlhbFNsaXRXaWR0aCA9IGNvbmZpZy5pbml0aWFsU2xpdFdpZHRoO1xyXG4gICAgY29uc3Qgc2xpdFdpZHRoUmFuZ2UgPSBjb25maWcuc2xpdFdpZHRoUmFuZ2U7XHJcbiAgICBjb25zdCBzbGl0U2VwYXJhdGlvblJhbmdlID0gY29uZmlnLnNsaXRTZXBhcmF0aW9uUmFuZ2U7XHJcbiAgICBjb25zdCBpbml0aWFsQW1wbGl0dWRlID0gY29uZmlnLmluaXRpYWxBbXBsaXR1ZGU7XHJcblxyXG4gICAgdGhpcy5mcmVxdWVuY3lQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggZnJlcXVlbmN5UmFuZ2UuZ2V0Q2VudGVyKCksIHsgcmFuZ2U6IGZyZXF1ZW5jeVJhbmdlIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHBvaW50IHNvdXJjZSB3YXZlIGdlbmVyYXRpb24gaXMgc3VwcHJlc3NlZCB3aGVuIGNoYW5naW5nIHRoZSBzb3VyY2Ugc2VwYXJhdGlvblxyXG4gICAgdGhpcy5tdXRlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gdGhlIG1vZGVsIG11c3QgYmUgdXBkYXRlZCBvbmNlIG1vcmUgYXQgdGhlIGVuZCBvZiBhIGN5Y2xlXHJcbiAgICB0aGlzLnB1bHNlSnVzdENvbXBsZXRlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgZGlzdGFuY2UgYmV0d2VlbiB0aGUgc291cmNlcyBpbiB0aGUgdW5pdHMgb2YgdGhlIHNjZW5lLCBvciAwIGlmIHRoZXJlIGlzIG9ubHkgb25lXHJcbiAgICAvLyBzb3VyY2UgaW5pdGlhbGl6ZWQgdG8gbWF0Y2ggdGhlIGluaXRpYWwgc2xpdCBzZXBhcmF0aW9uLFxyXG4gICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy93YXZlLWludGVyZmVyZW5jZS9pc3N1ZXMvODdcclxuICAgIHRoaXMuc291cmNlU2VwYXJhdGlvblByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBpbml0aWFsU2xpdFNlcGFyYXRpb24sIHtcclxuICAgICAgdW5pdHM6IHRoaXMucG9zaXRpb25Vbml0cyxcclxuICAgICAgcmFuZ2U6IHNvdXJjZVNlcGFyYXRpb25SYW5nZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSB3aWR0aCBvZiB0aGUgc2xpdChzKSBvcGVuaW5nIGluIHRoZSB1bml0cyBmb3IgdGhpcyBzY2VuZVxyXG4gICAgdGhpcy5zbGl0V2lkdGhQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggaW5pdGlhbFNsaXRXaWR0aCwge1xyXG4gICAgICB1bml0czogdGhpcy5wb3NpdGlvblVuaXRzLFxyXG4gICAgICByYW5nZTogc2xpdFdpZHRoUmFuZ2VcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIGRpc3RhbmNlIGJldHdlZW4gdGhlIGNlbnRlciBvZiB0aGUgc2xpdHMsIGluIHRoZSB1bml0cyBmb3IgdGhpcyBzY2VuZVxyXG4gICAgdGhpcy5zbGl0U2VwYXJhdGlvblByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBpbml0aWFsU2xpdFNlcGFyYXRpb24sIHtcclxuICAgICAgdW5pdHM6IHRoaXMucG9zaXRpb25Vbml0cyxcclxuICAgICAgcmFuZ2U6IHNsaXRTZXBhcmF0aW9uUmFuZ2VcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFtcGxpdHVkZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBpbml0aWFsQW1wbGl0dWRlLCB7XHJcbiAgICAgIHJhbmdlOiBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLkFNUExJVFVERV9SQU5HRVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge3N0cmluZ30gLSB0ZXh0IHRvIHNob3cgdG8gaW5kaWNhdGUgdGhlIHJlbGF0aXZlIHNjYWxlLCBzZWUgTGVuZ3RoU2NhbGVJbmRpY2F0b3JOb2RlXHJcbiAgICB0aGlzLnNjYWxlSW5kaWNhdG9yVGV4dCA9IFN0cmluZ1V0aWxzLmZpbGxJbiggZGlzdGFuY2VVbml0c1N0cmluZywge1xyXG4gICAgICBkaXN0YW5jZTogdGhpcy5zY2FsZUluZGljYXRvckxlbmd0aCxcclxuICAgICAgdW5pdHM6IHRoaXMucG9zaXRpb25Vbml0c1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHdhdmVsZW5ndGgqZnJlcXVlbmN5PXdhdmUgc3BlZWRcclxuICAgIHBoZXQubG9nICYmIHRoaXMuZnJlcXVlbmN5UHJvcGVydHkubGluayggZnJlcXVlbmN5ID0+XHJcbiAgICAgIHBoZXQubG9nKCBgZiA9ICR7ZnJlcXVlbmN5fS8ke3RoaXMudGltZVVuaXRzfSwgdyA9ICR7dGhpcy53YXZlU3BlZWQgLyBmcmVxdWVuY3l9ICR7dGhpcy5wb3NpdGlvblVuaXRzfSwgdj0gJHt0aGlzLndhdmVTcGVlZH0gJHt0aGlzLnBvc2l0aW9uVW5pdHN9LyR7dGhpcy50aW1lVW5pdHN9YCApXHJcbiAgICApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge3N0cmluZ30gLSB0aGUgdW5pdCB0byBkaXNwbGF5IG9uIHRoZSBXYXZlTWV0ZXJOb2RlLCBsaWtlIFwiMSBzXCJcclxuICAgIHRoaXMub25lVGltZXJVbml0ID0gU3RyaW5nVXRpbHMuZmlsbEluKCB0aW1lVW5pdHNTdHJpbmcsIHtcclxuICAgICAgdGltZTogMSxcclxuICAgICAgdW5pdHM6IHRoaXMudGltZVVuaXRzXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gLSBjb252ZXJ0cyB0aGUgbW9kZWwgY29vcmRpbmF0ZXMgKGluIHRoZSB1bml0cyBmb3IgdGhpcyBzY2VuZSkgdG8gbGF0dGljZVxyXG4gICAgLy8gY29vcmRpbmF0ZXMsIGRvZXMgbm90IGluY2x1ZGUgZGFtcGluZyByZWdpb25zXHJcbiAgICB0aGlzLm1vZGVsVG9MYXR0aWNlVHJhbnNmb3JtID0gTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVSZWN0YW5nbGVNYXBwaW5nKFxyXG4gICAgICBuZXcgUmVjdGFuZ2xlKCAwLCAwLCB0aGlzLndhdmVBcmVhV2lkdGgsIHRoaXMud2F2ZUFyZWFXaWR0aCApLFxyXG4gICAgICB0aGlzLmxhdHRpY2UudmlzaWJsZUJvdW5kc1xyXG4gICAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfG51bGx9IC0gdHJhbnNmb3JtcyBmcm9tIHRoZSBwaHlzaWNhbCB1bml0cyBmb3IgdGhpcyBzY2VuZSB0byB2aWV3IGNvb3JkaW5hdGVzLFxyXG4gICAgLy8gZmlsbGVkIGluIGFmdGVyIHRoZSB2aWV3IGFyZWEgaXMgaW5pdGlhbGl6ZWQsIHNlZSBzZXRWaWV3Qm91bmRzXHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IG51bGw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RGVyaXZlZFByb3BlcnR5LjxudW1iZXI+fSAtIGxhdHRpY2UgY2VsbCBpbmRleCBvZiB0aGUgY29udGludW91cyBiYXJyaWVyIHBvc2l0aW9uICh4IGNvb3JkaW5hdGUgb25seSlcclxuICAgIHRoaXMuYmFycmllckxhdHRpY2VDb29yZGluYXRlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHRoaXMuYmFycmllclBvc2l0aW9uUHJvcGVydHkgXSxcclxuICAgICAgYmFycmllclBvc2l0aW9uID0+IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBiYXJyaWVyUG9zaXRpb24ueCApXHJcbiAgICApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBwdWxzZSBvciBjb250aW51b3VzXHJcbiAgICB0aGlzLmRpc3R1cmJhbmNlVHlwZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBTY2VuZS5EaXN0dXJiYW5jZVR5cGUuQ09OVElOVU9VUywge1xyXG4gICAgICB2YWxpZFZhbHVlczogU2NlbmUuRGlzdHVyYmFuY2VUeXBlLlZBTFVFU1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRoZSBmaXJzdCBidXR0b24gY2FuIHRyaWdnZXIgYSBwdWxzZSwgb3IgY29udGludW91cyB3YXZlLCBkZXBlbmRpbmcgb24gdGhlIGRpc3R1cmJhbmNlVHlwZVByb3BlcnR5XHJcbiAgICB0aGlzLmJ1dHRvbjFQcmVzc2VkUHJvcGVydHkubGF6eUxpbmsoIGlzUHJlc3NlZCA9PiB7XHJcbiAgICAgIHRoaXMuaGFuZGxlQnV0dG9uMVRvZ2dsZWQoIGlzUHJlc3NlZCApO1xyXG5cclxuICAgICAgLy8gQ2xlYXIgcGxhbmUgd2F2ZXMgaWYgdGhlIHJlZCBidXR0b24gaXMgZGVzZWxlY3RlZCB3aGVuIHBhdXNlZC5cclxuICAgICAgaWYgKCB0aGlzLndhdmVTcGF0aWFsVHlwZSA9PT0gU2NlbmUuV2F2ZVNwYXRpYWxUeXBlLlBMQU5FICYmICFpc1ByZXNzZWQgKSB7XHJcbiAgICAgICAgdGhpcy5zZXRTb3VyY2VWYWx1ZXMoKTtcclxuICAgICAgICB0aGlzLmxhdHRpY2UuY2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVGhlIDJuZCBidXR0b24gc3RhcnRzIHRoZSBzZWNvbmQgY29udGludW91cyB3YXZlXHJcbiAgICB0aGlzLmJ1dHRvbjJQcmVzc2VkUHJvcGVydHkubGF6eUxpbmsoIGlzUHJlc3NlZCA9PiB0aGlzLmhhbmRsZUJ1dHRvbjJUb2dnbGVkKCBpc1ByZXNzZWQgKSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSB0cnVlIHdoaWxlIGEgc2luZ2xlIHB1bHNlIGlzIGJlaW5nIGdlbmVyYXRlZFxyXG4gICAgdGhpcy5wdWxzZUZpcmluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gc2lnbmlmeSBpZiBhIHdhdmUgaXMgYWJvdXQgdG8gc3RhcnQgb3NjaWxsYXRpbmcsIHNlZSBXYXRlclNjZW5lXHJcbiAgICB0aGlzLmlzQWJvdXRUb0ZpcmVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgcHVsc2UgZW5kcywgdGhlIGJ1dHRvbiBwb3BzIG91dFxyXG4gICAgdGhpcy5wdWxzZUZpcmluZ1Byb3BlcnR5LmxhenlMaW5rKCBwdWxzZUZpcmluZyA9PiB7XHJcbiAgICAgIGlmICggIXB1bHNlRmlyaW5nICkge1xyXG4gICAgICAgIHRoaXMuYnV0dG9uMVByZXNzZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSAtIHRoZSB2YWx1ZSBvZiB0aGUgd2F2ZSBhdCB0aGUgb3NjaWxsYXRpb24gcG9pbnRcclxuICAgIHRoaXMub3NjaWxsYXRvcjFQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgLSB0aGUgdmFsdWUgb2YgdGhlIHdhdmUgYXQgdGhlIG9zY2lsbGF0aW9uIHBvaW50XHJcbiAgICB0aGlzLm9zY2lsbGF0b3IyUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gdHJ1ZSB3aGVuIHRoZSBmaXJzdCBzb3VyY2UgaXMgY29udGludW91c2x5IG9zY2lsbGF0aW5nXHJcbiAgICB0aGlzLmNvbnRpbnVvdXNXYXZlMU9zY2lsbGF0aW5nUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSB0cnVlIHdoZW4gdGhlIHNlY29uZCBzb3VyY2UgaXMgY29udGludW91c2x5IG9zY2lsbGF0aW5nXHJcbiAgICB0aGlzLmNvbnRpbnVvdXNXYXZlMk9zY2lsbGF0aW5nUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnRlbXBvcmFsTWFzazEgPSBuZXcgVGVtcG9yYWxNYXNrKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMudGVtcG9yYWxNYXNrMiA9IG5ldyBUZW1wb3JhbE1hc2soKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHVzZWQgZm9yIHRlbXBvcmFsIG1hc2tpbmdcclxuICAgIHRoaXMuc3RlcEluZGV4ID0gMDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHdoZW4gdGhlIHBsYW5lIHdhdmUgZnJlcXVlbmN5IGlzIGNoYW5nZWQsIGRvbid0IHVwZGF0ZSB0aGUgd2F2ZSBhcmVhIGZvciBhIGZldyBmcmFtZXMgc28gdGhlcmUgaXMgbm9cclxuICAgIC8vIGZsaWNrZXIsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvd2F2ZS1pbnRlcmZlcmVuY2UvaXNzdWVzLzMwOVxyXG4gICAgdGhpcy5zdGVwc1RvU2tpcEZvclBsYW5lV2F2ZVNvdXJjZXMgPSAwO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIHVzZXIgY2hhbmdlcyBkaXN0dXJiYW5jZSB0eXBlLCB0aGUgYnV0dG9uIHBvcHMgb3V0IGFuZCB3YXZlcyBzdG9wXHJcbiAgICB0aGlzLmRpc3R1cmJhbmNlVHlwZVByb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgdGhpcy5idXR0b24xUHJlc3NlZFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuY29udGludW91c1dhdmUxT3NjaWxsYXRpbmdQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmNvbnRpbnVvdXNXYXZlMk9zY2lsbGF0aW5nUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5wdWxzZUZpcmluZ1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gV2hlbiBmcmVxdWVuY3kgY2hhbmdlcywgY2hvb3NlIGEgbmV3IHBoYXNlIHN1Y2ggdGhhdCB0aGUgbmV3IHNpbmUgY3VydmUgaGFzIHRoZSBzYW1lIHZhbHVlIGFuZCBkaXJlY3Rpb25cclxuICAgIC8vIGZvciBjb250aW51aXR5XHJcbiAgICBjb25zdCBwaGFzZVVwZGF0ZSA9ICggbmV3RnJlcXVlbmN5LCBvbGRGcmVxdWVuY3kgKSA9PiB7XHJcblxyXG4gICAgICAvLyBGb3IgdGhlIG1haW4gbW9kZWwsIE1hdGguc2luIGlzIHBlcmZvcm1lZCBvbiBhbmd1bGFyIGZyZXF1ZW5jeSwgc28gdG8gbWF0Y2ggdGhlIHBoYXNlLCB0aGF0IGNvbXB1dGF0aW9uXHJcbiAgICAgIC8vIHNob3VsZCBhbHNvIGJlIGJhc2VkIG9uIGFuZ3VsYXIgZnJlcXVlbmNpZXNcclxuICAgICAgY29uc3Qgb2xkQW5ndWxhckZyZXF1ZW5jeSA9IG9sZEZyZXF1ZW5jeSAqIE1hdGguUEkgKiAyO1xyXG4gICAgICBjb25zdCBuZXdBbmd1bGFyRnJlcXVlbmN5ID0gbmV3RnJlcXVlbmN5ICogTWF0aC5QSSAqIDI7XHJcbiAgICAgIGNvbnN0IHRpbWUgPSB0aGlzLnRpbWVQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gTWF0aC5zaW4oIHRpbWUgKiBvbGRBbmd1bGFyRnJlcXVlbmN5ICsgdGhpcy5waGFzZSApO1xyXG4gICAgICBsZXQgcHJvcG9zZWRQaGFzZSA9IE1hdGguYXNpbiggb2xkVmFsdWUgKSAtIHRpbWUgKiBuZXdBbmd1bGFyRnJlcXVlbmN5O1xyXG4gICAgICBjb25zdCBvbGREZXJpdmF0aXZlID0gTWF0aC5jb3MoIHRpbWUgKiBvbGRBbmd1bGFyRnJlcXVlbmN5ICsgdGhpcy5waGFzZSApO1xyXG4gICAgICBjb25zdCBuZXdEZXJpdmF0aXZlID0gTWF0aC5jb3MoIHRpbWUgKiBuZXdBbmd1bGFyRnJlcXVlbmN5ICsgcHJvcG9zZWRQaGFzZSApO1xyXG5cclxuICAgICAgLy8gSWYgd3JvbmcgcGhhc2UsIHRha2UgdGhlIHNpbiB2YWx1ZSBmcm9tIHRoZSBvcHBvc2l0ZSBzaWRlIGFuZCBtb3ZlIGZvcndhcmQgYnkgaGFsZiBhIGN5Y2xlXHJcbiAgICAgIGlmICggb2xkRGVyaXZhdGl2ZSAqIG5ld0Rlcml2YXRpdmUgPCAwICkge1xyXG4gICAgICAgIHByb3Bvc2VkUGhhc2UgPSBNYXRoLmFzaW4oIC1vbGRWYWx1ZSApIC0gdGltZSAqIG5ld0FuZ3VsYXJGcmVxdWVuY3kgKyBNYXRoLlBJO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnBoYXNlID0gcHJvcG9zZWRQaGFzZTtcclxuXHJcbiAgICAgIC8vIFdoZW4gY2hhbmdpbmcgdGhlIHBsYW5lIHdhdmUgZnJlcXVlbmN5LCBjbGVhciB0aGUgd2F2ZSBhcmVhIHRvIHRoZSByaWdodCBvZiB0aGUgd2F2ZVxyXG4gICAgICBpZiAoIHRoaXMud2F2ZVNwYXRpYWxUeXBlID09PSBTY2VuZS5XYXZlU3BhdGlhbFR5cGUuUExBTkUgKSB7XHJcbiAgICAgICAgdGhpcy5jbGVhcigpO1xyXG5cclxuICAgICAgICAvLyB3aGVuIHRoZSBwbGFuZSB3YXZlIGZyZXF1ZW5jeSBpcyBjaGFuZ2VkLCBkb24ndCB1cGRhdGUgdGhlIHdhdmUgYXJlYSBmb3IgYSBmZXcgZnJhbWVzIHNvIHRoZXJlIGlzIG5vXHJcbiAgICAgICAgLy8gZmxpY2tlciwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy93YXZlLWludGVyZmVyZW5jZS9pc3N1ZXMvMzA5XHJcbiAgICAgICAgdGhpcy5zdGVwc1RvU2tpcEZvclBsYW5lV2F2ZVNvdXJjZXMgPSAyO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuaGFuZGxlUGhhc2VDaGFuZ2VkKCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGlzLmZyZXF1ZW5jeVByb3BlcnR5LmxhenlMaW5rKCBwaGFzZVVwZGF0ZSApO1xyXG5cclxuICAgIC8vIEV2ZXJ5dGhpbmcgYmVsb3cgaGVyZSBpcyBqdXN0IGZvciBwbGFuZSB3YXZlIHNjcmVlbi5cclxuICAgIGlmICggdGhpcy53YXZlU3BhdGlhbFR5cGUgPT09IFNjZW5lLldhdmVTcGF0aWFsVHlwZS5QTEFORSApIHtcclxuXHJcbiAgICAgIC8vIEBwdWJsaWMgLSB0eXBlIG9mIHRoZSBiYXJyaWVyIGluIHRoZSBsYXR0aWNlXHJcbiAgICAgIHRoaXMuYmFycmllclR5cGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggU2NlbmUuQmFycmllclR5cGUuT05FX1NMSVQsIHtcclxuICAgICAgICB2YWxpZFZhbHVlczogU2NlbmUuQmFycmllclR5cGUuVkFMVUVTXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIFdoZW4gdGhlIGJhcnJpZXIgbW92ZXMgaXQgY3JlYXRlcyBhIGxvdCBvZiBhcnRpZmFjdHMsIHNvIGNsZWFyIHRoZSB3YXZlIHJpZ2h0IG9mIHRoZSBiYXJyaWVyIHdoZW4gaXQgbW92ZXNcclxuICAgICAgdGhpcy5iYXJyaWVyTGF0dGljZUNvb3JkaW5hdGVQcm9wZXJ0eS5saW5rKCBiYXJyaWVyTGF0dGljZUNvb3JkaW5hdGUgPT4ge1xyXG4gICAgICAgIHRoaXMubGF0dGljZS5jbGVhclJpZ2h0KCBiYXJyaWVyTGF0dGljZUNvb3JkaW5hdGUgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBwaGFzZSBvZiB0aGUgd2F2ZSBzbyBpdCBkb2Vzbid0IHN0YXJ0IGhhbGZ3YXkgdGhyb3VnaCBhIGN5Y2xlXHJcbiAgICAgIHRoaXMucGxhbmVXYXZlUGhhc2UgPSAwO1xyXG5cclxuICAgICAgLy8gQHByb3RlY3RlZCB7bnVtYmVyfSAtIHJlY29yZCB0aGUgdGltZSB0aGUgYnV0dG9uIHdhcyBwcmVzc2VkLCBzbyB0aGUgU2xpdHNNb2RlbCBjYW4gcHJvcGFnYXRlIHRoZSByaWdodFxyXG4gICAgICAvLyBkaXN0YW5jZVxyXG4gICAgICB0aGlzLmJ1dHRvbjFQcmVzc1RpbWUgPSAwO1xyXG4gICAgICB0aGlzLmJ1dHRvbjFQcmVzc2VkUHJvcGVydHkubGluayggcHJlc3NlZCA9PiB7XHJcbiAgICAgICAgaWYgKCBwcmVzc2VkICkge1xyXG4gICAgICAgICAgdGhpcy5idXR0b24xUHJlc3NUaW1lID0gdGhpcy50aW1lUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgICAgICAgLy8gU2VlIHNldFNvdXJjZVZhbHVlc1xyXG4gICAgICAgICAgY29uc3QgZnJlcXVlbmN5ID0gdGhpcy5mcmVxdWVuY3lQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICAgIGNvbnN0IGFuZ3VsYXJGcmVxdWVuY3kgPSBmcmVxdWVuY3kgKiBNYXRoLlBJICogMjtcclxuXHJcbiAgICAgICAgICAvLyBTb2x2ZSBmb3IgLSBhbmd1bGFyRnJlcXVlbmN5ICogdGhpcy50aW1lUHJvcGVydHkudmFsdWUgKyBwaGFzZSA9IDAsIG1ha2luZyBzdXJlIHRoZSBwaGFzZSBtYXRjaGVzIDAgYXRcclxuICAgICAgICAgIC8vIHRoZSBlZGdlLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3dhdmUtaW50ZXJmZXJlbmNlL2lzc3Vlcy8yMDdcclxuICAgICAgICAgIHRoaXMucGxhbmVXYXZlUGhhc2UgPSBhbmd1bGFyRnJlcXVlbmN5ICogdGhpcy50aW1lUHJvcGVydHkudmFsdWUgKyBNYXRoLlBJO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuY2xlYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIFdoZW4gYSBiYXJyaWVyIGlzIGFkZGVkLCBjbGVhciB0aGUgd2F2ZXMgdG8gdGhlIHJpZ2h0IGluc3RlYWQgb2YgbGV0dGluZyB0aGVtIGRpc3NpcGF0ZSxcclxuICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy93YXZlLWludGVyZmVyZW5jZS9pc3N1ZXMvMTc2XHJcbiAgICAgIHRoaXMuYmFycmllclR5cGVQcm9wZXJ0eS5saW5rKCBiYXJyaWVyVHlwZSA9PiB7XHJcbiAgICAgICAgdGhpcy5jbGVhcigpO1xyXG5cclxuICAgICAgICBjb25zdCBmcm9udFRpbWUgPSB0aGlzLnRpbWVQcm9wZXJ0eS52YWx1ZSAtIHRoaXMuYnV0dG9uMVByZXNzVGltZTtcclxuICAgICAgICBjb25zdCBmcm9udFBvc2l0aW9uID0gdGhpcy5tb2RlbFRvTGF0dGljZVRyYW5zZm9ybS5tb2RlbFRvVmlld1goIHRoaXMud2F2ZVNwZWVkICogZnJvbnRUaW1lICk7XHJcblxyXG4gICAgICAgIC8vIGlmIHRoZSB3YXZlIGhhZCBwYXNzZWQgYnkgdGhlIGJhcnJpZXIsIHRoZW4gcmVwcm9wYWdhdGUgZnJvbSB0aGUgYmFycmllci4gIFRoaXMgcmVxdWlyZXMgYmFjay1jb21wdXRpbmcgdGhlXHJcbiAgICAgICAgLy8gdGltZSB0aGUgYnV0dG9uIHdvdWxkIGhhdmUgYmVlbiBwcmVzc2VkIHRvIHByb3BhZ2F0ZSB0aGUgd2F2ZSB0byB0aGUgYmFycmllci4gIEhlbmNlIHRoaXMgaXMgdGhlIGludmVyc2Ugb2ZcclxuICAgICAgICAvLyB0aGUgbG9naWMgaW4gc2V0U291cmNlVmFsdWVzXHJcbiAgICAgICAgY29uc3QgYmFycmllckxhdHRpY2VYID0gdGhpcy5iYXJyaWVyTGF0dGljZUNvb3JkaW5hdGVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICBpZiAoIGZyb250UG9zaXRpb24gPiBiYXJyaWVyTGF0dGljZVggKSB7XHJcbiAgICAgICAgICBjb25zdCBiYXJyaWVyTW9kZWxYID0gdGhpcy5tb2RlbFRvTGF0dGljZVRyYW5zZm9ybS52aWV3VG9Nb2RlbFgoIGJhcnJpZXJMYXR0aWNlWCApO1xyXG4gICAgICAgICAgdGhpcy5idXR0b24xUHJlc3NUaW1lID0gdGhpcy50aW1lUHJvcGVydHkudmFsdWUgLSBiYXJyaWVyTW9kZWxYIC8gdGhpcy53YXZlU3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgdXNlciBwcmVzc2VkIHRoZSB3YXZlIGdlbmVyYXRvciBidXR0b24uIFRoZSBkZWZhdWx0IGlzIHRvIGFsd2F5cyBwbGF5IGEgc291bmQsIGJ1dCB0aGlzIGNhbiBiZSBvdmVycmlkZGVuXHJcbiAgICogZm9yIHNjZW5lcyB0aGFuIGhhdmUgdGhlaXIgb3duIHNvdW5kIGdlbmVyYXRpb24uXHJcbiAgICogQHBhcmFtIFtwcmVzc2VkXSAtIHRydWUgaWYgYnV0dG9uIHByZXNzZWQsIGZhbHNlIGlmIHJlbGVhc2VkXHJcbiAgICovXHJcbiAgcHVibGljIHdhdmVHZW5lcmF0b3JCdXR0b25Tb3VuZCggcHJlc3NlZCA9IHRydWUgKTogdm9pZCB7XHJcbiAgICBjb25zdCBwbGF5YmFja1JhdGUgPSBwcmVzc2VkID8gMSA6IDAuODkxOyAgLy8gb25lIHdob2xlIHN0ZXAgbG93ZXIgZm9yIHRoZSByZWxlYXNlZCBzb3VuZFxyXG4gICAgV0FWRV9HRU5FUkFUT1JfQlVUVE9OX1NPVU5EX0NMSVAuc2V0UGxheWJhY2tSYXRlKCBwbGF5YmFja1JhdGUgKTtcclxuICAgIFdBVkVfR0VORVJBVE9SX0JVVFRPTl9TT1VORF9DTElQLnBsYXkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdlbmVyYXRlIGEgd2F2ZSBmcm9tIGEgcG9pbnQgc291cmNlXHJcbiAgICogQHBhcmFtIGFtcGxpdHVkZVxyXG4gICAqIEBwYXJhbSB0aW1lXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzZXRQb2ludFNvdXJjZVZhbHVlcyggYW1wbGl0dWRlLCB0aW1lICk6IHZvaWQge1xyXG5cclxuICAgIGNvbnN0IGZyZXF1ZW5jeSA9IHRoaXMuZnJlcXVlbmN5UHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCBwZXJpb2QgPSAxIC8gZnJlcXVlbmN5O1xyXG4gICAgY29uc3QgdGltZVNpbmNlUHVsc2VTdGFydGVkID0gdGltZSAtIHRoaXMucHVsc2VTdGFydFRpbWU7XHJcbiAgICBjb25zdCBsYXR0aWNlID0gdGhpcy5sYXR0aWNlO1xyXG4gICAgY29uc3QgaXNDb250aW51b3VzID0gKCB0aGlzLmRpc3R1cmJhbmNlVHlwZVByb3BlcnR5LmdldCgpID09PSBTY2VuZS5EaXN0dXJiYW5jZVR5cGUuQ09OVElOVU9VUyApO1xyXG4gICAgY29uc3QgY29udGludW91czEgPSBpc0NvbnRpbnVvdXMgJiYgdGhpcy5jb250aW51b3VzV2F2ZTFPc2NpbGxhdGluZ1Byb3BlcnR5LmdldCgpO1xyXG4gICAgY29uc3QgY29udGludW91czIgPSBpc0NvbnRpbnVvdXMgJiYgdGhpcy5jb250aW51b3VzV2F2ZTJPc2NpbGxhdGluZ1Byb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIC8vIFVzZWQgdG8gY29tcHV0ZSB3aGV0aGVyIGEgZGVsdGEgYXBwZWFycyBpbiBlaXRoZXIgbWFza1xyXG4gICAgbGV0IHRlbXBvcmFsTWFzazFFbXB0eSA9IHRydWU7XHJcbiAgICBsZXQgdGVtcG9yYWxNYXNrMkVtcHR5ID0gdHJ1ZTtcclxuXHJcbiAgICBpZiAoIGNvbnRpbnVvdXMxIHx8IGNvbnRpbnVvdXMyIHx8IHRoaXMucHVsc2VGaXJpbmdQcm9wZXJ0eS5nZXQoKSB8fCB0aGlzLnB1bHNlSnVzdENvbXBsZXRlZCApIHtcclxuXHJcbiAgICAgIC8vIFRoZSBzaW11bGF0aW9uIGlzIGRlc2lnbmVkIHRvIHN0YXJ0IHdpdGggYSBkb3dud2FyZCB3YXZlLCBjb3JyZXNwb25kaW5nIHRvIHdhdGVyIHNwbGFzaGluZyBpblxyXG4gICAgICBjb25zdCBmcmVxdWVuY3kgPSB0aGlzLmZyZXF1ZW5jeVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICBjb25zdCBhbmd1bGFyRnJlcXVlbmN5ID0gTWF0aC5QSSAqIDIgKiBmcmVxdWVuY3k7XHJcblxyXG4gICAgICAvLyBDb21wdXRlIHRoZSB3YXZlIHZhbHVlIGFzIGEgZnVuY3Rpb24gb2YgdGltZSwgb3Igc2V0IHRvIHplcm8gaWYgbm8gbG9uZ2VyIGdlbmVyYXRpbmcgYSB3YXZlLlxyXG4gICAgICBjb25zdCB3YXZlVmFsdWUgPSAoIHRoaXMucHVsc2VGaXJpbmdQcm9wZXJ0eS5nZXQoKSAmJiB0aW1lU2luY2VQdWxzZVN0YXJ0ZWQgPiBwZXJpb2QgKSA/IDAgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAtTWF0aC5zaW4oIHRpbWUgKiBhbmd1bGFyRnJlcXVlbmN5ICsgdGhpcy5waGFzZSApICogYW1wbGl0dWRlICpcclxuICAgICAgICAgICAgICAgICAgICAgICAgV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5BTVBMSVRVREVfQ0FMSUJSQVRJT05fU0NBTEU7XHJcblxyXG4gICAgICAvLyBEaXN0YW5jZSBiZXR3ZWVuIHRoZSBzb3VyY2VzLCBvciAwIGlmIHRoZXJlIGlzIG9ubHkgMSBzb3VyY2VcclxuICAgICAgY29uc3Qgc291cmNlU2VwYXJhdGlvbiA9IHRoaXMubnVtYmVyT2ZTb3VyY2VzID09PSAyID8gdGhpcy5zb3VyY2VTZXBhcmF0aW9uUHJvcGVydHkuZ2V0KCkgOiAwO1xyXG5cclxuICAgICAgLy8gYXNzdW1lcyBhIHNxdWFyZSBsYXR0aWNlXHJcbiAgICAgIGNvbnN0IHNlcGFyYXRpb25JbkxhdHRpY2VVbml0cyA9IHRoaXMubW9kZWxUb0xhdHRpY2VUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVkoIHNvdXJjZVNlcGFyYXRpb24gLyAyICk7XHJcbiAgICAgIGNvbnN0IGRpc3RhbmNlRnJvbUNlbnRlciA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBzZXBhcmF0aW9uSW5MYXR0aWNlVW5pdHMgKTtcclxuXHJcbiAgICAgIC8vIE5hbWVkIHdpdGggYSBcIkpcIiBzdWZmaXggaW5zdGVhZCBvZiBcIllcIiB0byByZW1pbmQgdXMgd2UgYXJlIHdvcmtpbmcgaW4gaW50ZWdyYWwgKGksaikgbGF0dGljZSBjb29yZGluYXRlcy5cclxuICAgICAgLy8gVXNlIGZsb29yIHRvIGdldCA1MC41ID0+IDUwIGluc3RlYWQgb2YgNTFcclxuICAgICAgY29uc3QgbGF0dGljZUNlbnRlckogPSBNYXRoLmZsb29yKCB0aGlzLmxhdHRpY2UuaGVpZ2h0IC8gMiApO1xyXG5cclxuICAgICAgLy8gUG9pbnQgc291cmNlXHJcbiAgICAgIGlmICggdGhpcy5jb250aW51b3VzV2F2ZTFPc2NpbGxhdGluZ1Byb3BlcnR5LmdldCgpIHx8IHRoaXMucHVsc2VGaXJpbmdQcm9wZXJ0eS5nZXQoKSB8fCB0aGlzLnB1bHNlSnVzdENvbXBsZXRlZCApIHtcclxuICAgICAgICBjb25zdCBqID0gbGF0dGljZUNlbnRlckogKyBkaXN0YW5jZUZyb21DZW50ZXI7XHJcbiAgICAgICAgbGF0dGljZS5zZXRDdXJyZW50VmFsdWUoIFdhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMuUE9JTlRfU09VUkNFX0hPUklaT05UQUxfQ09PUkRJTkFURSwgaiwgd2F2ZVZhbHVlICk7XHJcbiAgICAgICAgdGhpcy5vc2NpbGxhdG9yMVByb3BlcnR5LnZhbHVlID0gd2F2ZVZhbHVlO1xyXG4gICAgICAgIGlmICggYW1wbGl0dWRlID4gMCApIHtcclxuICAgICAgICAgIHRoaXMudGVtcG9yYWxNYXNrMS5zZXQoIHRydWUsIHRoaXMuc3RlcEluZGV4LCBqICk7XHJcbiAgICAgICAgICB0ZW1wb3JhbE1hc2sxRW1wdHkgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5wdWxzZUp1c3RDb21wbGV0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIFNlY29uZGFyeSBzb3VyY2UgKG5vdGUgaWYgdGhlcmUgaXMgb25seSBvbmUgc291cmNlLCB0aGlzIHNldHMgdGhlIHNhbWUgdmFsdWUgYXMgYWJvdmUpXHJcbiAgICAgIGlmICggdGhpcy5jb250aW51b3VzV2F2ZTJPc2NpbGxhdGluZ1Byb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgIGNvbnN0IGogPSBsYXR0aWNlQ2VudGVySiAtIGRpc3RhbmNlRnJvbUNlbnRlcjtcclxuICAgICAgICBsYXR0aWNlLnNldEN1cnJlbnRWYWx1ZSggV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5QT0lOVF9TT1VSQ0VfSE9SSVpPTlRBTF9DT09SRElOQVRFLCBqLCB3YXZlVmFsdWUgKTtcclxuICAgICAgICB0aGlzLm9zY2lsbGF0b3IyUHJvcGVydHkudmFsdWUgPSB3YXZlVmFsdWU7XHJcbiAgICAgICAgaWYgKCBhbXBsaXR1ZGUgPiAwICkge1xyXG4gICAgICAgICAgYW1wbGl0dWRlID4gMCAmJiB0aGlzLnRlbXBvcmFsTWFzazIuc2V0KCB0cnVlLCB0aGlzLnN0ZXBJbmRleCwgaiApO1xyXG4gICAgICAgICAgdGVtcG9yYWxNYXNrMkVtcHR5ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGVtcG9yYWxNYXNrMUVtcHR5ICYmIHRoaXMudGVtcG9yYWxNYXNrMS5zZXQoIGZhbHNlLCB0aGlzLnN0ZXBJbmRleCwgMCApO1xyXG4gICAgdGVtcG9yYWxNYXNrMkVtcHR5ICYmIHRoaXMudGVtcG9yYWxNYXNrMi5zZXQoIGZhbHNlLCB0aGlzLnN0ZXBJbmRleCwgMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2VuZXJhdGUgYSBwbGFuZSB3YXZlXHJcbiAgICogQHBhcmFtIGFtcGxpdHVkZVxyXG4gICAqIEBwYXJhbSB0aW1lXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzZXRQbGFuZVNvdXJjZVZhbHVlcyggYW1wbGl0dWRlLCB0aW1lICk6IHZvaWQge1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIHBsYW5lIHdhdmUgZnJlcXVlbmN5IGlzIGNoYW5nZWQsIGRvbid0IHVwZGF0ZSB0aGUgd2F2ZSBhcmVhIGZvciBhIGZldyBmcmFtZXMgc28gdGhlcmUgaXMgbm8gZmxpY2tlcixcclxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvd2F2ZS1pbnRlcmZlcmVuY2UvaXNzdWVzLzMwOVxyXG4gICAgaWYgKCB0aGlzLnN0ZXBzVG9Ta2lwRm9yUGxhbmVXYXZlU291cmNlcyA+IDAgKSB7XHJcbiAgICAgIHRoaXMuc3RlcHNUb1NraXBGb3JQbGFuZVdhdmVTb3VyY2VzLS07XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IGxhdHRpY2UgPSB0aGlzLmxhdHRpY2U7XHJcblxyXG4gICAgY29uc3QgYmFycmllckxhdHRpY2VYID0gdGhpcy5iYXJyaWVyVHlwZVByb3BlcnR5LnZhbHVlID09PSBTY2VuZS5CYXJyaWVyVHlwZS5OT19CQVJSSUVSID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdHRpY2Uud2lkdGggLSBsYXR0aWNlLmRhbXBYIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYmFycmllckxhdHRpY2VDb29yZGluYXRlUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBzbGl0U2VwYXJhdGlvbk1vZGVsID0gdGhpcy5zbGl0U2VwYXJhdGlvblByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIGNvbnN0IGZyb250VGltZSA9IHRpbWUgLSB0aGlzLmJ1dHRvbjFQcmVzc1RpbWU7XHJcbiAgICBjb25zdCBmcm9udFBvc2l0aW9uID0gdGhpcy5tb2RlbFRvTGF0dGljZVRyYW5zZm9ybS5tb2RlbFRvVmlld1goIHRoaXMud2F2ZVNwZWVkICogZnJvbnRUaW1lICk7IC8vIGluIGxhdHRpY2UgY29vcmRpbmF0ZXNcclxuXHJcbiAgICBjb25zdCBzbGl0V2lkdGhNb2RlbCA9IHRoaXMuc2xpdFdpZHRoUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCBzbGl0V2lkdGggPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggdGhpcy5tb2RlbFRvTGF0dGljZVRyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWSggc2xpdFdpZHRoTW9kZWwgKSApO1xyXG4gICAgY29uc3QgbGF0dGljZUNlbnRlclkgPSB0aGlzLmxhdHRpY2UuaGVpZ2h0IC8gMjtcclxuXHJcbiAgICAvLyBUYWtlIHRoZSBkZXNpcmVkIGZyZXF1ZW5jeSBmb3IgdGhlIHdhdGVyIHNjZW5lLCBvciB0aGUgc3BlY2lmaWVkIGZyZXF1ZW5jeSBvZiBhbnkgb3RoZXIgc2NlbmVcclxuICAgIGNvbnN0IGZyZXF1ZW5jeSA9IHRoaXMuZnJlcXVlbmN5UHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCB3YXZlbGVuZ3RoID0gdGhpcy5nZXRXYXZlbGVuZ3RoKCk7XHJcblxyXG4gICAgLy8gU29sdmUgZm9yIHRoZSB3YXZlIG51bWJlclxyXG4gICAgLy8gbGFtYmRhICogayA9IDIgKiBwaVxyXG4gICAgLy8gayA9IDJwaS9sYW1iZGFcclxuICAgIGNvbnN0IGsgPSBNYXRoLlBJICogMiAvIHdhdmVsZW5ndGg7XHJcblxyXG4gICAgLy8gU2NhbGUgdGhlIGFtcGxpdHVkZSBiZWNhdXNlIGl0IGlzIGNhbGlicmF0ZWQgZm9yIGEgcG9pbnQgc291cmNlLCBub3QgYSBwbGFuZSB3YXZlXHJcbiAgICBjb25zdCBhbmd1bGFyRnJlcXVlbmN5ID0gZnJlcXVlbmN5ICogTWF0aC5QSSAqIDI7XHJcblxyXG4gICAgLy8gU3BsaXQgaW50byAyIHJlZ2lvbnMuXHJcbiAgICAvLyAxLiBUaGUgcmVnaW9uIHdoZXJlIHRoZXJlIGNvdWxkIGJlIGEgd2F2ZSAoaWYgaXQgbWF0Y2hlcyB0aGUgYnV0dG9uIHByZXNzIGFuZCBpc24ndCBpbiB0aGUgYmFycmllcilcclxuICAgIC8vIDIuIFRoZSBlbXBpcmljYWwgcGFydCBiZXlvbmQgdGhlIGJhcnJpZXJcclxuXHJcbiAgICAvLyBJbiB0aGUgaW5jb21pbmcgcmVnaW9uLCBzZXQgYWxsIGxhdHRpY2UgdmFsdWVzIHRvIGJlIGFuIGluY29taW5nIHBsYW5lIHdhdmUuICBUaGlzIHByZXZlbnRzIGFueSByZWZsZWN0aW9uc1xyXG4gICAgLy8gYW5kIHVud2FudGVkIGFydGlmYWN0cywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy93YXZlLWludGVyZmVyZW5jZS9pc3N1ZXMvNDdcclxuICAgIGZvciAoIGxldCBpID0gbGF0dGljZS5kYW1wWDsgaSA8PSBiYXJyaWVyTGF0dGljZVg7IGkrKyApIHtcclxuXHJcbiAgICAgIC8vIEZpbmQgdGhlIHBoeXNpY2FsIG1vZGVsIGNvb3JkaW5hdGUgY29ycmVzcG9uZGluZyB0byB0aGUgbGF0dGljZSBjb29yZGluYXRlXHJcbiAgICAgIGNvbnN0IHggPSB0aGlzLm1vZGVsVG9MYXR0aWNlVHJhbnNmb3JtLnZpZXdUb01vZGVsWCggaSApO1xyXG5cclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgbGF0dGljZS5oZWlnaHQ7IGorKyApIHtcclxuICAgICAgICBjb25zdCB5ID0gdGhpcy5tb2RlbFRvTGF0dGljZVRyYW5zZm9ybS52aWV3VG9Nb2RlbFkoIGogKTtcclxuXHJcbiAgICAgICAgLy8gWmVybyBvdXQgdmFsdWVzIGluIHRoZSBiYXJyaWVyXHJcbiAgICAgICAgbGV0IGlzQ2VsbEluQmFycmllciA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoIGkgPT09IGJhcnJpZXJMYXR0aWNlWCApIHtcclxuICAgICAgICAgIGlmICggdGhpcy5iYXJyaWVyVHlwZVByb3BlcnR5LnZhbHVlID09PSBTY2VuZS5CYXJyaWVyVHlwZS5PTkVfU0xJVCApIHtcclxuICAgICAgICAgICAgY29uc3QgbG93ID0gaiA+IGxhdHRpY2VDZW50ZXJZICsgc2xpdFdpZHRoIC8gMiAtIDAuNTtcclxuICAgICAgICAgICAgY29uc3QgaGlnaCA9IGogPCBsYXR0aWNlQ2VudGVyWSAtIHNsaXRXaWR0aCAvIDIgLSAwLjU7XHJcbiAgICAgICAgICAgIGlzQ2VsbEluQmFycmllciA9IGxvdyB8fCBoaWdoO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoIHRoaXMuYmFycmllclR5cGVQcm9wZXJ0eS52YWx1ZSA9PT0gU2NlbmUuQmFycmllclR5cGUuVFdPX1NMSVRTICkge1xyXG5cclxuICAgICAgICAgICAgLy8gU3BhY2luZyBpcyBiZXR3ZWVuIGNlbnRlciBvZiBzbGl0cy4gIFRoaXMgY29tcHV0YXRpb24gaXMgZG9uZSBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICBjb25zdCB0b3BCYXJyaWVyV2lkdGggPSAoIHRoaXMud2F2ZUFyZWFXaWR0aCAtIHNsaXRXaWR0aE1vZGVsIC0gc2xpdFNlcGFyYXRpb25Nb2RlbCApIC8gMjtcclxuICAgICAgICAgICAgY29uc3QgY2VudHJhbEJhcnJpZXJXaWR0aCA9IHRoaXMud2F2ZUFyZWFXaWR0aCAtIDIgKiB0b3BCYXJyaWVyV2lkdGggLSAyICogc2xpdFdpZHRoTW9kZWw7XHJcbiAgICAgICAgICAgIGNvbnN0IGluVG9wID0geSA8PSB0b3BCYXJyaWVyV2lkdGg7XHJcbiAgICAgICAgICAgIGNvbnN0IGluQm90dG9tID0geSA+PSB0aGlzLndhdmVBcmVhV2lkdGggLSB0b3BCYXJyaWVyV2lkdGg7XHJcbiAgICAgICAgICAgIGNvbnN0IGluQ2VudGVyID0gKCB5ID49IHRvcEJhcnJpZXJXaWR0aCArIHNsaXRXaWR0aE1vZGVsICkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIHkgPD0gdG9wQmFycmllcldpZHRoICsgc2xpdFdpZHRoTW9kZWwgKyBjZW50cmFsQmFycmllcldpZHRoICk7XHJcbiAgICAgICAgICAgIGlzQ2VsbEluQmFycmllciA9IGluVG9wIHx8IGluQm90dG9tIHx8IGluQ2VudGVyO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHRoaXMuYnV0dG9uMVByZXNzZWRQcm9wZXJ0eS5nZXQoKSAmJiAhaXNDZWxsSW5CYXJyaWVyICkge1xyXG5cclxuICAgICAgICAgIC8vIElmIHRoZSBjb29yZGluYXRlIGlzIHBhc3Qgd2hlcmUgdGhlIGZyb250IG9mIHRoZSB3YXZlIHdvdWxkIGJlLCB0aGVuIHplcm8gaXQgb3V0LlxyXG4gICAgICAgICAgaWYgKCBpID49IGZyb250UG9zaXRpb24gKSB7XHJcbiAgICAgICAgICAgIGxhdHRpY2Uuc2V0Q3VycmVudFZhbHVlKCBpLCBqLCAwICk7XHJcbiAgICAgICAgICAgIGxhdHRpY2Uuc2V0TGFzdFZhbHVlKCBpLCBqLCAwICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBhbXBsaXR1ZGUgKiBQTEFORV9XQVZFX01BR05JVFVERVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICogTWF0aC5zaW4oIGsgKiB4IC0gYW5ndWxhckZyZXF1ZW5jeSAqIHRpbWUgKyB0aGlzLnBsYW5lV2F2ZVBoYXNlICk7XHJcbiAgICAgICAgICAgIGxhdHRpY2Uuc2V0Q3VycmVudFZhbHVlKCBpLCBqLCB2YWx1ZSApO1xyXG4gICAgICAgICAgICBsYXR0aWNlLnNldExhc3RWYWx1ZSggaSwgaiwgdmFsdWUgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gSW5zdGFudGx5IGNsZWFyIHRoZSBpbmNvbWluZyB3YXZlLCBvdGhlcndpc2UgdGhlcmUgYXJlIHRvbyBtYW55IHJlZmxlY3Rpb25zXHJcbiAgICAgICAgICBsYXR0aWNlLnNldEN1cnJlbnRWYWx1ZSggaSwgaiwgMCApO1xyXG4gICAgICAgICAgbGF0dGljZS5zZXRMYXN0VmFsdWUoIGksIGosIDAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgaW5jb21pbmcgc291cmNlIHZhbHVlcywgaW4gdGhpcyBjYXNlIGl0IGlzIGEgcG9pbnQgc291cmNlIG5lYXIgdGhlIGxlZnQgc2lkZSBvZiB0aGUgbGF0dGljZSAob3V0c2lkZSBvZlxyXG4gICAqIHRoZSBkYW1waW5nIHJlZ2lvbikuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzZXRTb3VyY2VWYWx1ZXMoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gR2V0IHRoZSBkZXNpcmVkIGFtcGxpdHVkZS4gIEZvciB3YXRlciwgdGhpcyBpcyBzZXQgdGhyb3VnaCB0aGUgZGVzaXJlZEFtcGxpdHVkZVByb3BlcnR5LiAgRm9yIG90aGVyXHJcbiAgICAvLyBzY2VuZXMsIHRoaXMgaXMgc2V0IHRocm91Z2ggdGhlIGFtcGxpdHVkZVByb3BlcnR5LlxyXG4gICAgY29uc3QgYW1wbGl0dWRlID0gdGhpcy5kZXNpcmVkQW1wbGl0dWRlUHJvcGVydHkgPyB0aGlzLmRlc2lyZWRBbXBsaXR1ZGVQcm9wZXJ0eS5nZXQoKSA6IHRoaXMuYW1wbGl0dWRlUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCB0aW1lID0gdGhpcy50aW1lUHJvcGVydHkudmFsdWU7XHJcbiAgICBpZiAoIHRoaXMud2F2ZVNwYXRpYWxUeXBlID09PSBTY2VuZS5XYXZlU3BhdGlhbFR5cGUuUE9JTlQgKSB7XHJcbiAgICAgIHRoaXMuc2V0UG9pbnRTb3VyY2VWYWx1ZXMoIGFtcGxpdHVkZSwgdGltZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuc2V0UGxhbmVTb3VyY2VWYWx1ZXMoIGFtcGxpdHVkZSwgdGltZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkaXRpb25hbGx5IGNhbGxlZCBmcm9tIHRoZSBcInN0ZXBcIiBidXR0b25cclxuICAgKiBAcGFyYW0gd2FsbERUIC0gYW1vdW50IG9mIHdhbGwgdGltZSB0aGF0IHBhc3NlZCwgd2lsbCBiZSBzY2FsZWQgYnkgdGltZSBzY2FsaW5nIHZhbHVlXHJcbiAgICogQHBhcmFtIG1hbnVhbFN0ZXAgLSB0cnVlIGlmIHRoZSBzdGVwIGJ1dHRvbiBpcyBiZWluZyBwcmVzc2VkXHJcbiAgICovXHJcbiAgcHVibGljIGFkdmFuY2VUaW1lKCB3YWxsRFQ6IG51bWJlciwgbWFudWFsU3RlcDogYm9vbGVhbiApOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBmcmVxdWVuY3kgPSB0aGlzLmZyZXF1ZW5jeVByb3BlcnR5LmdldCgpO1xyXG4gICAgY29uc3QgcGVyaW9kID0gMSAvIGZyZXF1ZW5jeTtcclxuXHJcbiAgICAvLyBDb21wdXRlIGEgc3RhbmRhcmQgZHRcclxuICAgIGxldCBkdCA9IHdhbGxEVCAqIHRoaXMudGltZVNjYWxlRmFjdG9yO1xyXG5cclxuICAgIC8vIFRydW5jYXRlIGR0IGlmIGEgcHVsc2Ugd291bGQgZW5kIHBhcnR3YXkgdGhyb3VnaCBhIHRpbWVzdGVwXHJcbiAgICBjb25zdCBleGNlZWRlZFB1bHNlID0gdGhpcy5wdWxzZUZpcmluZ1Byb3BlcnR5LmdldCgpICYmICggdGhpcy50aW1lUHJvcGVydHkudmFsdWUgKyBkdCAtIHRoaXMucHVsc2VTdGFydFRpbWUgPj0gcGVyaW9kICk7XHJcbiAgICBpZiAoIGV4Y2VlZGVkUHVsc2UgKSB7XHJcbiAgICAgIGR0ID0gdGhpcy5wdWxzZVN0YXJ0VGltZSArIHBlcmlvZCAtIHRoaXMudGltZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgdGltZVxyXG4gICAgdGhpcy50aW1lUHJvcGVydHkudmFsdWUgKz0gZHQ7XHJcblxyXG4gICAgLy8gSWYgdGhlIHB1bHNlIGlzIHJ1bm5pbmcsIGVuZCB0aGUgcHVsc2UgYWZ0ZXIgb25lIHBlcmlvZFxyXG4gICAgaWYgKCBleGNlZWRlZFB1bHNlICkge1xyXG4gICAgICB0aGlzLnB1bHNlRmlyaW5nUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgICB0aGlzLnB1bHNlU3RhcnRUaW1lID0gMDtcclxuICAgICAgdGhpcy5wdWxzZUp1c3RDb21wbGV0ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKCAhdGhpcy5tdXRlZCApIHtcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0aGUgbGF0dGljZVxyXG4gICAgICB0aGlzLmxhdHRpY2Uuc3RlcCgpO1xyXG5cclxuICAgICAgLy8gQXBwbHkgdmFsdWVzIG9uIHRvcCBvZiB0aGUgY29tcHV0ZWQgbGF0dGljZSB2YWx1ZXMgc28gdGhlcmUgaXMgbm8gbm9pc2UgYXQgdGhlIHBvaW50IHNvdXJjZXNcclxuICAgICAgdGhpcy5zZXRTb3VyY2VWYWx1ZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTY2VuZS1zcGVjaWZpYyBwaHlzaWNzIHVwZGF0ZXMgaGFwcGVucyBldmVuIHdoZW4gbXV0ZWQsIHNvIHNvdW5kIHBhcnRpY2xlcyB3aWxsIGdvIGJhY2sgdG8gdGhlaXIgaW5pdGlhbFxyXG4gICAgLy8gcG9zaXRpb25zXHJcbiAgICB0aGlzLnN0ZXAoIGR0ICk7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5tdXRlZCApIHtcclxuXHJcbiAgICAgIC8vIEFwcGx5IHRlbXBvcmFsIG1hc2tpbmcsIGJ1dCBvbmx5IGZvciBwb2ludCBzb3VyY2VzLiAgUGxhbmUgd2F2ZXMgYWxyZWFkeSBjbGVhciB0aGUgd2F2ZSBhcmVhIHdoZW4gY2hhbmdpbmdcclxuICAgICAgLy8gcGFyYW1ldGVyc1xyXG4gICAgICBpZiAoIHRoaXMud2F2ZVNwYXRpYWxUeXBlID09PSBTY2VuZS5XYXZlU3BhdGlhbFR5cGUuUE9JTlQgKSB7XHJcbiAgICAgICAgdGhpcy5hcHBseVRlbXBvcmFsTWFzaygpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBOb3RpZnkgbGlzdGVuZXJzIGFib3V0IGNoYW5nZXNcclxuICAgICAgdGhpcy5sYXR0aWNlLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuXHJcbiAgICAgIHRoaXMuc3RlcEluZGV4Kys7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBCeSByZWNvcmRpbmcgdGhlIHRpbWVzIGFuZCBwb3NpdGlvbnMgb2YgdGhlIHdhdmUgZGlzdHVyYmFuY2VzLCBhbmQga25vd2luZyB0aGUgd2F2ZSBwcm9wYWdhdGlvbiBzcGVlZCxcclxuICAgKiB3ZSBjYW4gYXBwbHkgYSBtYXNraW5nIGZ1bmN0aW9uIGFjcm9zcyB0aGUgd2F2ZSBhcmVhLCB6ZXJvaW5nIG91dCBhbnkgY2VsbCB0aGF0IGNvdWxkIG5vdGUgaGF2ZSBiZWVuIGdlbmVyYXRlZFxyXG4gICAqIGZyb20gdGhlIHNvdXJjZSBkaXN0dXJiYW5jZS4gIFRoaXMgZmlsdGVycyBvdXQgc3B1cmlvdXMgbm9pc2UgYW5kIHJlc3RvcmVzIFwiYmxhY2tcIiBmb3IgdGhlIGxpZ2h0IHNjZW5lLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXBwbHlUZW1wb3JhbE1hc2soKTogdm9pZCB7XHJcblxyXG4gICAgLy8gemVybyBvdXQgdmFsdWVzIHRoYXQgYXJlIG91dHNpZGUgb2YgdGhlIG1hc2tcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubGF0dGljZS53aWR0aDsgaSsrICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLmxhdHRpY2UuaGVpZ2h0OyBqKysgKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGNhbWVGcm9tMSA9IHRoaXMudGVtcG9yYWxNYXNrMS5tYXRjaGVzKCBpLCBqLCB0aGlzLnN0ZXBJbmRleCApO1xyXG4gICAgICAgIGNvbnN0IGNhbWVGcm9tMiA9IHRoaXMudGVtcG9yYWxNYXNrMi5tYXRjaGVzKCBpLCBqLCB0aGlzLnN0ZXBJbmRleCApO1xyXG5cclxuICAgICAgICB0aGlzLmxhdHRpY2Uuc2V0QWxsb3dlZCggaSwgaiwgY2FtZUZyb20xIHx8IGNhbWVGcm9tMiApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUHJ1bmUgZW50cmllcy4gIEVsZW1lbnRzIHRoYXQgYXJlIHRvbyBmYXIgb3V0IG9mIHJhbmdlIGFyZSBlbGltaW5hdGVkLiAgVXNlIHRoZSBkaWFnb25hbCBvZiB0aGUgbGF0dGljZSBmb3IgdGhlXHJcbiAgICAvLyBtYXggZGlzdGFuY2VcclxuICAgIHRoaXMudGVtcG9yYWxNYXNrMS5wcnVuZSggTWF0aC5zcXJ0KCAyICkgKiB0aGlzLmxhdHRpY2Uud2lkdGgsIHRoaXMuc3RlcEluZGV4ICk7XHJcbiAgICB0aGlzLnRlbXBvcmFsTWFzazIucHJ1bmUoIE1hdGguc3FydCggMiApICogdGhpcy5sYXR0aWNlLndpZHRoLCB0aGlzLnN0ZXBJbmRleCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXJzIHRoZSB3YXZlIHZhbHVlc1xyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBjbGVhcigpOiB2b2lkIHtcclxuICAgIHRoaXMubGF0dGljZS5jbGVhcigpO1xyXG4gICAgdGhpcy50ZW1wb3JhbE1hc2sxLmNsZWFyKCk7XHJcbiAgICB0aGlzLnRlbXBvcmFsTWFzazIuY2xlYXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0YXJ0IHRoZSBzaW5lIGFyZ3VtZW50IGF0IDAgc28gaXQgd2lsbCBzbW9vdGhseSBmb3JtIHRoZSBmaXJzdCB3YXZlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgcmVzZXRQaGFzZSgpOiB2b2lkIHtcclxuICAgIGNvbnN0IGZyZXF1ZW5jeSA9IHRoaXMuZnJlcXVlbmN5UHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCBhbmd1bGFyRnJlcXVlbmN5ID0gTWF0aC5QSSAqIDIgKiBmcmVxdWVuY3k7XHJcblxyXG4gICAgLy8gU29sdmUgZm9yIHRoZSBzaW4gYXJnID0gMCBpbiBNYXRoLnNpbiggdGhpcy50aW1lICogYW5ndWxhckZyZXF1ZW5jeSArIHRoaXMucGhhc2UgKVxyXG4gICAgdGhpcy5waGFzZSA9IC10aGlzLnRpbWVQcm9wZXJ0eS52YWx1ZSAqIGFuZ3VsYXJGcmVxdWVuY3k7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB3YXZlbGVuZ3RoIGluIHRoZSB1bml0cyBvZiB0aGUgc2NlbmVcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0V2F2ZWxlbmd0aCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMud2F2ZVNwZWVkIC8gdGhpcy5mcmVxdWVuY3lQcm9wZXJ0eS5nZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBCb3VuZHMyIGZvciB0aGUgdmlzaWJsZSBwYXJ0IG9mIHRoZSB3YXZlIGFyZWEsIGluIHRoZSBjb29yZGluYXRlcyBvZiB0aGUgc2NlbmUuXHJcbiAgICogQHJldHVybnMgdGhlIGxhdHRpY2UgbW9kZWwgYm91bmRzLCBpbiB0aGUgY29vcmRpbmF0ZXMgb2YgdGhpcyBzY2VuZS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0V2F2ZUFyZWFCb3VuZHMoKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gbmV3IEJvdW5kczIoIDAsIDAsIHRoaXMud2F2ZUFyZWFXaWR0aCwgdGhpcy53YXZlQXJlYVdpZHRoICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNdXRlIG9yIHVubXV0ZSB0aGUgbW9kZWwuXHJcbiAgICovXHJcbiAgcHVibGljIHNldE11dGVkKCBtdXRlZCApOiB2b2lkIHtcclxuICAgIHRoaXMubXV0ZWQgPSBtdXRlZDtcclxuICAgIG11dGVkICYmIHRoaXMuY2xlYXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSB1c2VyIGhhcyBpbml0aWF0ZWQgYSBzaW5nbGUgcHVsc2UuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGFydFB1bHNlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMucHVsc2VGaXJpbmdQcm9wZXJ0eS52YWx1ZSwgJ0Nhbm5vdCBmaXJlIGEgcHVsc2Ugd2hpbGUgYSBwdWxzZSBpcyBhbHJlYWR5IGJlaW5nIGZpcmVkJyApO1xyXG4gICAgdGhpcy5yZXNldFBoYXNlKCk7XHJcbiAgICB0aGlzLnB1bHNlRmlyaW5nUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgdGhpcy5wdWxzZVN0YXJ0VGltZSA9IHRoaXMudGltZVByb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHByaW1hcnkgYnV0dG9uIGlzIHRvZ2dsZWQuICBDYW4gYmUgb3ZlcnJpZGRlbiBmb3Igc2NlbmUtc3BlY2lmaWMgYmVoYXZpb3IuXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGhhbmRsZUJ1dHRvbjFUb2dnbGVkKCBpc1ByZXNzZWQ6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBpZiAoIGlzUHJlc3NlZCAmJiAhdGhpcy5idXR0b24yUHJlc3NlZFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLnJlc2V0UGhhc2UoKTtcclxuICAgIH1cclxuICAgIGlmICggaXNQcmVzc2VkICYmIHRoaXMuZGlzdHVyYmFuY2VUeXBlUHJvcGVydHkudmFsdWUgPT09IFNjZW5lLkRpc3R1cmJhbmNlVHlwZS5QVUxTRSApIHtcclxuICAgICAgdGhpcy5zdGFydFB1bHNlKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFdhdGVyIHByb3BhZ2F0ZXMgdmlhIHRoZSB3YXRlciBkcm9wXHJcbiAgICAgIHRoaXMuY29udGludW91c1dhdmUxT3NjaWxsYXRpbmdQcm9wZXJ0eS52YWx1ZSA9IGlzUHJlc3NlZDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIHRoZSBzZWNvbmRhcnkgYnV0dG9uIGlzIHRvZ2dsZWQuICBDYW4gYmUgb3ZlcnJpZGRlbiBmb3Igc2NlbmUtc3BlY2lmaWMgYmVoYXZpb3IuXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGhhbmRsZUJ1dHRvbjJUb2dnbGVkKCBpc1ByZXNzZWQ6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBpZiAoIGlzUHJlc3NlZCAmJiAhdGhpcy5idXR0b24xUHJlc3NlZFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLnJlc2V0UGhhc2UoKTtcclxuICAgIH1cclxuICAgIHRoaXMuY29udGludW91c1dhdmUyT3NjaWxsYXRpbmdQcm9wZXJ0eS52YWx1ZSA9IGlzUHJlc3NlZDtcclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBoYW5kbGVQaGFzZUNoYW5nZWQoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gTm8tb3Agd2hpY2ggbWF5IGJlIG92ZXJyaWRkZW4gZm9yIHNjZW5lLXNwZWNpZmljIGJlaGF2aW9yLiAgQ2FsbGVkIHdoZW4gdGhlIHBoYXNlIGNoYW5nZXMuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXN0b3JlcyB0aGUgaW5pdGlhbCBjb25kaXRpb25zIG9mIHRoaXMgc2NlbmUuXHJcbiAgICovXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5jbGVhcigpO1xyXG4gICAgdGhpcy5tdXRlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5mcmVxdWVuY3lQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zbGl0V2lkdGhQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5iYXJyaWVyUG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zbGl0U2VwYXJhdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNvdXJjZVNlcGFyYXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5hbXBsaXR1ZGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5kaXN0dXJiYW5jZVR5cGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5idXR0b24xUHJlc3NlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmJ1dHRvbjJQcmVzc2VkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMub3NjaWxsYXRvcjFQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5vc2NpbGxhdG9yMlByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmNvbnRpbnVvdXNXYXZlMU9zY2lsbGF0aW5nUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuY29udGludW91c1dhdmUyT3NjaWxsYXRpbmdQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5pc0Fib3V0VG9GaXJlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYmFycmllclR5cGVQcm9wZXJ0eSAmJiB0aGlzLmJhcnJpZXJUeXBlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc3RlcHNUb1NraXBGb3JQbGFuZVdhdmVTb3VyY2VzID0gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmUgZm9yd2FyZCBpbiB0aW1lIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50XHJcbiAgICogQHBhcmFtIGR0IC0gYW1vdW50IG9mIHRpbWUgdG8gbW92ZSBmb3J3YXJkLCBpbiB0aGUgdW5pdHMgb2YgdGhlIHNjZW5lXHJcbiAgICovXHJcbiAgcHVibGljIHN0ZXAoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gTm8tb3AgaGVyZSwgc3ViY2xhc3NlcyBjYW4gb3ZlcnJpZGUgdG8gcHJvdmlkZSBiZWhhdmlvci5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFmdGVyIHRoZSB2aWV3IGlzIGluaXRpYWxpemVkLCBkZXRlcm1pbmUgdGhlIGNvb3JkaW5hdGUgdHJhbnNmb3JtYXRpb25zIHRoYXQgbWFwIHRvIHZpZXcgY29vcmRpbmF0ZXMuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFZpZXdCb3VuZHMoIHZpZXdCb3VuZHM6IEJvdW5kczIgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9PT0gbnVsbCwgJ3NldFZpZXdCb3VuZHMgY2Fubm90IGJlIGNhbGxlZCB0d2ljZScgKTtcclxuXHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlUmVjdGFuZ2xlTWFwcGluZyhcclxuICAgICAgdGhpcy5nZXRXYXZlQXJlYUJvdW5kcygpLFxyXG4gICAgICB2aWV3Qm91bmRzXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGxhdHRpY2VCb3VuZHMgPSBuZXcgQm91bmRzMiggMCwgMCwgMSwgMSApO1xyXG4gICAgY29uc3QgbW9kZWxCb3VuZHMgPSB0aGlzLm1vZGVsVG9MYXR0aWNlVHJhbnNmb3JtLnZpZXdUb01vZGVsQm91bmRzKCBsYXR0aWNlQm91bmRzICk7XHJcbiAgICBjb25zdCB0ZW1wVmlld0JvdW5kcyA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3Qm91bmRzKCBtb2RlbEJvdW5kcyApO1xyXG5cclxuICAgIHRoaXMubGF0dGljZVRvVmlld1RyYW5zZm9ybSA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlUmVjdGFuZ2xlTWFwcGluZyggbGF0dGljZUJvdW5kcywgdGVtcFZpZXdCb3VuZHMgKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIHdhdmUgY2FuIGJlIG9uZ29pbmcgKENPTlRJTlVPVVMpIG9yIGEgc2luZ2xlIHdhdmVsZW5ndGggKFBVTFNFKVxyXG4gKiBAcHVibGljXHJcbiAqL1xyXG5TY2VuZS5EaXN0dXJiYW5jZVR5cGUgPSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuYnlLZXlzKCBbICdQVUxTRScsICdDT05USU5VT1VTJyBdICk7XHJcblxyXG4vKipcclxuICogQSB3YXZlIGNhbiBlaXRoZXIgYmUgZ2VuZXJhdGVkIGJ5IGEgcG9pbnQgc291cmNlIChQT0lOVCkgb3IgYnkgYSBwbGFuZSB3YXZlIChQTEFORSkuXHJcbiAqIEBwdWJsaWNcclxuICovXHJcblNjZW5lLldhdmVTcGF0aWFsVHlwZSA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ1BPSU5UJywgJ1BMQU5FJyBdICk7XHJcblxyXG4vKipcclxuICogVGhlIHdhdmUgYXJlYSBjYW4gY29udGFpbiBhIGJhcnJpZXIgd2l0aCBPTkVfU0xJVCwgVFdPX1NMSVRTIG9yIE5PX0JBUlJJRVIgYXQgYWxsLlxyXG4gKiBAcHVibGljXHJcbiAqL1xyXG5TY2VuZS5CYXJyaWVyVHlwZSA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ05PX0JBUlJJRVInLCAnT05FX1NMSVQnLCAnVFdPX1NMSVRTJyBdICk7XHJcblxyXG53YXZlSW50ZXJmZXJlbmNlLnJlZ2lzdGVyKCAnU2NlbmUnLCBTY2VuZSApO1xyXG5leHBvcnQgZGVmYXVsdCBTY2VuZTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7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