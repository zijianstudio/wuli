// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model object for Wave on a String
 *
 * @author Anton Ulyanov (Mlearner)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import Stopwatch from '../../../../scenery-phet/js/Stopwatch.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Float64ArrayIO from '../../../../tandem/js/types/Float64ArrayIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import waveOnAString from '../../waveOnAString.js';

// constants
const NUMBER_OF_SEGMENTS = 61;
const LAST_INDEX = NUMBER_OF_SEGMENTS - 1;
const NEXT_TO_LAST_INDEX = NUMBER_OF_SEGMENTS - 2;
const AMPLITUDE_MULTIPLIER = 80; // the number of model units (vertically) per cm
const FRAMES_PER_SECOND = 50;
class WOASModel extends PhetioObject {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    super({
      tandem: tandem,
      phetioType: WOASModel.WOASModelIO
    });

    // @public {Float64Array}
    this.yDraw = new Float64Array(NUMBER_OF_SEGMENTS);
    this.yNow = new Float64Array(NUMBER_OF_SEGMENTS);
    this.yLast = new Float64Array(NUMBER_OF_SEGMENTS);
    this.yNext = new Float64Array(NUMBER_OF_SEGMENTS);

    // @public {Property.<WOASModel.Mode>}
    this.waveModeProperty = new EnumerationDeprecatedProperty(WOASModel.Mode, WOASModel.Mode.MANUAL, {
      tandem: tandem.createTandem('waveModeProperty'),
      phetioDocumentation: 'what is on the left side of the string, controlling its motion'
    });

    // @public {Property.<WOASModel.EndType}
    this.endTypeProperty = new EnumerationDeprecatedProperty(WOASModel.EndType, WOASModel.EndType.FIXED_END, {
      tandem: tandem.createTandem('endTypeProperty'),
      phetioDocumentation: 'what is on the right side of the string'
    });

    // @public {Property.<boolean>}
    this.isPlayingProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('isPlayingProperty'),
      phetioDocumentation: 'whether time is moving forward in the simulation (paused if false)'
    });

    // @public {Property.<TimeSpeed>}
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL, {
      tandem: tandem.createTandem('timeSpeedProperty'),
      phetioDocumentation: 'the play speed for the simulation as it moves through time'
    });

    // @public {Property.<boolean>} - Visibilities
    this.rulersVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('rulersVisibleProperty'),
      phetioDocumentation: 'whether the rulers are visible'
    });
    this.referenceLineVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('referenceLineVisibleProperty'),
      phetioDocumentation: 'whether the reference line is visible'
    });
    this.wrenchArrowsVisibleProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('wrenchArrowsVisibleProperty'),
      phetioDocumentation: 'whether the up/down arrows on the wrench are visible'
    });

    // @public {Property.<Vector2>}
    this.horizontalRulerPositionProperty = new Vector2Property(new Vector2(54, 117), {
      tandem: tandem.createTandem('horizontalRulerPositionProperty'),
      phetioDocumentation: 'position of the horizontal ruler in view coordinates (from the top-left of the ruler, initially 54,117)'
    });
    this.verticalRulerPositionProperty = new Vector2Property(new Vector2(13, 440), {
      tandem: tandem.createTandem('verticalRulerPositionProperty'),
      phetioDocumentation: 'position of the vertical ruler in view coordinates (from the bottom-left of the ruler, initially 13,440)'
    });
    this.referenceLinePositionProperty = new Vector2Property(new Vector2(-10, 120), {
      tandem: tandem.createTandem('referenceLinePositionProperty'),
      phetioDocumentation: 'position of the reference line in view coordinates (from the left of the line, initially -10,120)'
    });

    // @public {Property.<number>}
    this.tensionProperty = new NumberProperty(0.8, {
      range: new Range(0.2, 0.8),
      tandem: tandem.createTandem('tensionProperty'),
      phetioDocumentation: 'the relative amount of tension on the string'
    });

    // @public {Property.<number>}
    this.dampingProperty = new NumberProperty(20, {
      range: new Range(0, 100),
      tandem: tandem.createTandem('dampingProperty'),
      phetioDocumentation: 'the relative amount of damping (percentage) for the string'
    });

    // @public {Property.<number>}
    this.frequencyProperty = new NumberProperty(1.50, {
      range: new Range(0, 3),
      tandem: tandem.createTandem('frequencyProperty'),
      phetioDocumentation: 'the frequency of the oscillator, in hertz',
      units: 'Hz'
    });

    // @public {Property.<number>}
    this.pulseWidthProperty = new NumberProperty(0.5, {
      range: new Range(0.2, 1),
      tandem: tandem.createTandem('pulseWidthProperty'),
      phetioDocumentation: 'the width of a pulse (generated with the pulse mode) in seconds',
      units: 's'
    });

    // @public {Property.<number>}
    this.amplitudeProperty = new NumberProperty(0.75, {
      range: new Range(0, 1.3),
      tandem: tandem.createTandem('amplitudeProperty'),
      phetioDocumentation: 'the amplitude of the oscillation or pulses in centimeters',
      units: 'cm'
    });

    // @public {Property.<number>}
    this.lastDtProperty = new NumberProperty(0.03, {
      phetioReadOnly: true,
      tandem: tandem.createTandem('lastDtProperty'),
      phetioDocumentation: 'the amount of time since the last manual internal step, in seconds'
    });

    // @public {Property.<number>}
    this.timeElapsedProperty = new NumberProperty(0, {
      phetioReadOnly: true,
      tandem: tandem.createTandem('timeElapsedProperty'),
      phetioDocumentation: 'the amount of time elapsed since the last evolution of the physics model, in seconds'
    });

    // @public {Property.<number>}
    this.angleProperty = new NumberProperty(0, {
      phetioReadOnly: true,
      range: new Range(0, 2 * Math.PI),
      tandem: tandem.createTandem('angleProperty'),
      phetioDocumentation: 'the angle (in radians) of the oscillator or pulse',
      units: 'radians'
    });

    // @public {Property.<boolean>}
    this.pulsePendingProperty = new BooleanProperty(false, {
      phetioReadOnly: true,
      tandem: tandem.createTandem('pulsePendingProperty'),
      phetioDocumentation: 'whether a pulse will start at the next internal model step'
    });

    // @public {Property.<number>}
    this.pulseSignProperty = new NumberProperty(1, {
      phetioReadOnly: true,
      validValues: [-1, 1],
      tandem: tandem.createTandem('pulseSignProperty'),
      phetioDocumentation: 'which part of the pulse is being generated'
    });

    // @public {Property.<boolean>}
    this.pulseProperty = new BooleanProperty(false, {
      phetioReadOnly: true,
      tandem: tandem.createTandem('pulseProperty'),
      phetioDocumentation: 'whether a pulse is currently active'
    });

    // @public {Stopwatch}
    this.stopwatch = new Stopwatch({
      position: new Vector2(550, 330),
      tandem: tandem.createTandem('stopwatch'),
      timePropertyOptions: {
        range: Stopwatch.ZERO_TO_ALMOST_SIXTY
      }
    });

    // @public {Emitter} - Events emitted by instances of this type
    this.yNowChangedEmitter = new Emitter();

    // @public {Property.<number>}
    this.nextLeftYProperty = new NumberProperty(0, {
      phetioReadOnly: true,
      tandem: tandem.createTandem('nextLeftYProperty'),
      phetioDocumentation: 'internal property used to interpolate the left-most y value of the string while the wrench is moved in manual mode - for low-fps browsers'
    });

    // @public {Property.<number>}
    this.waveStartPositionProperty = new DynamicProperty(new Property(this.nextLeftYProperty), {
      bidirectional: true,
      map: y => -y / AMPLITUDE_MULTIPLIER,
      inverseMap: y => -y * AMPLITUDE_MULTIPLIER,
      tandem: tandem.createTandem('waveStartPositionProperty'),
      phetioDocumentation: 'the y-value of the 1st green dot measured with respect to the center line',
      units: 'cm',
      phetioValueType: NumberIO
    });
    // TODO: how to support range on dynamic properties? https://github.com/phetsims/wave-on-a-string/issues/147
    this.waveStartPositionProperty.range = new Range(-1.3, 1.3);

    // @private {Property.<number>}
    this.stepDtProperty = new NumberProperty(0, {
      phetioReadOnly: true,
      tandem: tandem.createTandem('stepDtProperty')
    });

    // @private {number}
    this.beta = 0.05;
    this.alpha = 1;
    this.reset();

    // set the string to 0 on mode changes
    this.waveModeProperty.lazyLink(() => {
      // Don't mess with phet-io, see https://github.com/phetsims/wave-on-a-string/issues/141
      if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
        this.manualRestart();
      }
    });
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step(dt) {
    const fixDt = 1 / FRAMES_PER_SECOND;

    // limit changes dt
    const lastDt = this.lastDtProperty.value;
    if (Math.abs(dt - lastDt) > lastDt * 0.3) {
      dt = lastDt + (dt - lastDt < 0 ? -1 : 1) * lastDt * 0.3;
    }
    this.lastDtProperty.value = dt;
    if (this.isPlayingProperty.value) {
      this.stepDtProperty.value += dt;

      // limit min dt
      if (this.stepDtProperty.value >= fixDt) {
        this.manualStep(this.stepDtProperty.value);
        this.stepDtProperty.value %= fixDt;
      }
    }
    this.nextLeftYProperty.value = this.yNow[0];
  }

  /**
   * This runs a fixed-timestep model step. Elsewhere we interpolate between these.
   * @public
   */
  evolve() {
    const dt = 1;
    const v = 1;
    const dx = dt * v;
    const b = this.dampingProperty.value * 0.002;
    this.beta = b * dt / 2;
    this.alpha = v * dt / dx;
    this.yNext[0] = this.yNow[0];
    switch (this.endTypeProperty.value) {
      case WOASModel.EndType.FIXED_END:
        this.yNow[LAST_INDEX] = 0;
        break;
      case WOASModel.EndType.LOOSE_END:
        this.yNow[LAST_INDEX] = this.yNow[NEXT_TO_LAST_INDEX];
        break;
      case WOASModel.EndType.NO_END:
        this.yNow[LAST_INDEX] = this.yLast[NEXT_TO_LAST_INDEX];
        break;
      default:
        throw new Error(`unknown end type: ${this.endTypeProperty.value}`);
    }

    // main formula for calculating
    const a = 1 / (this.beta + 1);
    const alphaSq = this.alpha * this.alpha;
    const c = 2 * (1 - alphaSq);
    for (let i = 1; i < LAST_INDEX; i++) {
      this.yNext[i] = a * ((this.beta - 1) * this.yLast[i] + c * this.yNow[i] + alphaSq * (this.yNow[i + 1] + this.yNow[i - 1]));
    }

    // store old values for the very last point
    const oldLast = this.yLast[LAST_INDEX];
    const oldNow = this.yNow[LAST_INDEX];
    const oldNext = this.yNext[LAST_INDEX];

    // rotate arrays instead of copying elements (for speed)
    const old = this.yLast;
    this.yLast = this.yNow;
    this.yNow = this.yNext;
    this.yNext = old;

    // restore the old values for the very last point for every array (potentially not needed for a few?)
    this.yLast[LAST_INDEX] = oldLast;
    this.yNow[LAST_INDEX] = oldNow;
    this.yNext[LAST_INDEX] = oldNext;
    switch (this.endTypeProperty.value) {
      case WOASModel.EndType.FIXED_END:
        this.yLast[LAST_INDEX] = 0;
        this.yNow[LAST_INDEX] = 0;
        break;
      case WOASModel.EndType.LOOSE_END:
        this.yLast[LAST_INDEX] = this.yNow[LAST_INDEX];
        this.yNow[LAST_INDEX] = this.yNow[NEXT_TO_LAST_INDEX];
        break;
      case WOASModel.EndType.NO_END:
        this.yLast[LAST_INDEX] = this.yNow[LAST_INDEX];
        this.yNow[LAST_INDEX] = this.yLast[NEXT_TO_LAST_INDEX]; // from a comment in the old model code?
        // from the Flash model: this.yNow[ LAST_INDEX ] = this.yNow[ LAST_INDEX ]; //this.yLast[ NEXT_TO_LAST_INDEX ];
        break;
      default:
        throw new Error(`unknown end type: ${this.endTypeProperty.value}`);
    }
  }

  /**
   * Manual step?
   * @public
   *
   * @param {number} dt
   */
  manualStep(dt) {
    let i;
    const fixDt = 1 / FRAMES_PER_SECOND;
    dt = dt !== undefined && dt > 0 ? dt : fixDt;
    const speedMultiplier = this.timeSpeedProperty.value === TimeSpeed.NORMAL ? 1 : this.timeSpeedProperty.value === TimeSpeed.SLOW ? 0.25 : null;
    assert && assert(speedMultiplier !== null, 'timeSpeedProperty has unsuported value');

    // preparation to interpolate the yNow across individual evolve() steps to smooth the string on slow-FPS browsers
    const startingLeftY = this.yNow[0];
    const numSteps = Math.floor(dt / fixDt);
    const perStepDelta = numSteps ? (this.nextLeftYProperty.value - startingLeftY) / numSteps : 0;

    //dt for tension effect
    const tensionFactor = Utils.linear(Math.sqrt(0.2), Math.sqrt(0.8), 0.2, 1, Math.sqrt(this.tensionProperty.value));
    const minDt = 1 / (FRAMES_PER_SECOND * tensionFactor * speedMultiplier);
    // limit max dt
    while (dt >= fixDt) {
      this.timeElapsedProperty.value = this.timeElapsedProperty.value + fixDt;
      this.stopwatch.step(fixDt * speedMultiplier);
      if (this.waveModeProperty.value === WOASModel.Mode.OSCILLATE) {
        this.angleProperty.value = (this.angleProperty.value + Math.PI * 2 * this.frequencyProperty.value * fixDt * speedMultiplier) % (Math.PI * 2);
        this.yDraw[0] = this.yNow[0] = this.amplitudeProperty.value * AMPLITUDE_MULTIPLIER * Math.sin(-this.angleProperty.value);
      }
      if (this.waveModeProperty.value === WOASModel.Mode.PULSE && this.pulsePendingProperty.value) {
        this.pulsePendingProperty.value = false;
        this.pulseProperty.value = true;
        this.yNow[0] = 0;
      }
      if (this.waveModeProperty.value === WOASModel.Mode.PULSE && this.pulseProperty.value) {
        const da = Math.PI * fixDt * speedMultiplier / this.pulseWidthProperty.value;
        if (this.angleProperty.value + da >= Math.PI / 2) {
          this.pulseSignProperty.value = -1;
        }
        if (this.angleProperty.value + da * this.pulseSignProperty.value > 0) {
          this.angleProperty.value = this.angleProperty.value + da * this.pulseSignProperty.value;
        } else {
          //end pulse and reset
          this.angleProperty.reset();
          this.pulseSignProperty.reset();
          this.pulseProperty.reset();
        }
        this.yDraw[0] = this.yNow[0] = this.amplitudeProperty.value * AMPLITUDE_MULTIPLIER * (-this.angleProperty.value / (Math.PI / 2));
      }
      if (this.waveModeProperty.value === WOASModel.Mode.MANUAL) {
        // interpolate the yNow across steps for manual (between frames)
        this.yNow[0] += perStepDelta;
      }
      if (this.timeElapsedProperty.value >= minDt) {
        this.timeElapsedProperty.value = this.timeElapsedProperty.value % minDt;
        this.evolve();
        for (i = 0; i < NUMBER_OF_SEGMENTS; i++) {
          this.yDraw[i] = this.yLast[i];
        }
      } else {
        for (i = 1; i < NUMBER_OF_SEGMENTS; i++) {
          this.yDraw[i] = this.yLast[i] + (this.yNow[i] - this.yLast[i]) * (this.timeElapsedProperty.value / minDt);
        }
      }
      dt -= fixDt;
    }
    if (this.waveModeProperty.value === WOASModel.Mode.MANUAL) {
      // sanity check for our yNow
      // this.yNow[0] = this.nextLeftYProperty.value;
    }
    this.yNowChangedEmitter.emit();
  }

  /**
   * Returns the y position for the end of the string (position for the ring).
   * @public
   *
   * @returns {number}
   */
  getRingY() {
    return this.yNow[LAST_INDEX] || 0;
  }

  /**
   * When we move to a fixed point, we want to zero out the very end.
   * @public
   */
  zeroOutEndPoint() {
    this.yNow[LAST_INDEX] = 0;
    this.yDraw[LAST_INDEX] = 0;
    this.yNowChangedEmitter.emit();
  }

  /**
   * Triggers the start of a pulse.
   * @public
   */
  manualPulse() {
    this.yNow[0] = 0;
    this.angleProperty.value = 0;
    this.pulseSignProperty.value = 1;
    this.pulsePendingProperty.value = true;
    this.pulseProperty.value = false;
  }

  /**
   * Triggers a reset (kind of a partial reset).
   * @public
   */
  manualRestart() {
    this.angleProperty.reset();
    this.timeElapsedProperty.reset();
    this.pulseProperty.reset();
    this.pulseSignProperty.reset();
    this.pulsePendingProperty.reset();
    this.customDt = 0;
    for (let i = 0; i < this.yNow.length; i++) {
      this.yDraw[i] = this.yNext[i] = this.yNow[i] = this.yLast[i] = 0;
    }
    this.nextLeftYProperty.value = 0;
    this.yNowChangedEmitter.emit();
  }

  /**
   * Resets everything in the model.
   * @public
   */
  reset() {
    this.waveModeProperty.reset();
    this.endTypeProperty.reset();
    this.timeSpeedProperty.reset();
    this.rulersVisibleProperty.reset();
    this.referenceLineVisibleProperty.reset();
    this.tensionProperty.reset();
    this.dampingProperty.reset();
    this.frequencyProperty.reset();
    this.pulseWidthProperty.reset();
    this.amplitudeProperty.reset();
    this.isPlayingProperty.reset();
    this.lastDtProperty.reset();
    this.horizontalRulerPositionProperty.reset();
    this.verticalRulerPositionProperty.reset();
    this.referenceLinePositionProperty.reset();
    this.stopwatch.reset();
    this.wrenchArrowsVisibleProperty.reset();
    this.manualRestart();
  }
}

// @public {EnumerationDeprecated}
WOASModel.Mode = EnumerationDeprecated.byKeys(['MANUAL', 'OSCILLATE', 'PULSE']);

// @public {EnumerationDeprecated}
WOASModel.EndType = EnumerationDeprecated.byKeys(['FIXED_END', 'LOOSE_END', 'NO_END']);
WOASModel.WOASModelIO = new IOType('WOASModelIO', {
  valueType: WOASModel,
  documentation: 'The main model for Wave on a String',
  toStateObject: model => ({
    _yDraw: Float64ArrayIO.toStateObject(model.yDraw),
    _yNow: Float64ArrayIO.toStateObject(model.yNow),
    _yLast: Float64ArrayIO.toStateObject(model.yLast),
    _yNext: Float64ArrayIO.toStateObject(model.yNext)
  }),
  stateSchema: {
    _yDraw: Float64ArrayIO,
    _yNow: Float64ArrayIO,
    _yLast: Float64ArrayIO,
    _yNext: Float64ArrayIO
  },
  applyState: (model, stateObject) => {
    // We make an assumption about Float64ArrayIO's serialization here, so that we don't create temporary garbage
    // Float64Arrays. Instead we set the array values directly.
    model.yDraw.set(stateObject._yDraw);
    model.yNow.set(stateObject._yNow);
    model.yLast.set(stateObject._yLast);
    model.yNext.set(stateObject._yNext);
    model.yNowChangedEmitter.emit();
  }
});
waveOnAString.register('WOASModel', WOASModel);
export default WOASModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEeW5hbWljUHJvcGVydHkiLCJFbWl0dGVyIiwiRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkiLCJFbnVtZXJhdGlvblByb3BlcnR5IiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlJhbmdlIiwiVXRpbHMiLCJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5IiwiRW51bWVyYXRpb25EZXByZWNhdGVkIiwiU3RvcHdhdGNoIiwiVGltZVNwZWVkIiwiUGhldGlvT2JqZWN0IiwiRmxvYXQ2NEFycmF5SU8iLCJJT1R5cGUiLCJOdW1iZXJJTyIsIndhdmVPbkFTdHJpbmciLCJOVU1CRVJfT0ZfU0VHTUVOVFMiLCJMQVNUX0lOREVYIiwiTkVYVF9UT19MQVNUX0lOREVYIiwiQU1QTElUVURFX01VTFRJUExJRVIiLCJGUkFNRVNfUEVSX1NFQ09ORCIsIldPQVNNb2RlbCIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwicGhldGlvVHlwZSIsIldPQVNNb2RlbElPIiwieURyYXciLCJGbG9hdDY0QXJyYXkiLCJ5Tm93IiwieUxhc3QiLCJ5TmV4dCIsIndhdmVNb2RlUHJvcGVydHkiLCJNb2RlIiwiTUFOVUFMIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImVuZFR5cGVQcm9wZXJ0eSIsIkVuZFR5cGUiLCJGSVhFRF9FTkQiLCJpc1BsYXlpbmdQcm9wZXJ0eSIsInRpbWVTcGVlZFByb3BlcnR5IiwiTk9STUFMIiwicnVsZXJzVmlzaWJsZVByb3BlcnR5IiwicmVmZXJlbmNlTGluZVZpc2libGVQcm9wZXJ0eSIsIndyZW5jaEFycm93c1Zpc2libGVQcm9wZXJ0eSIsImhvcml6b250YWxSdWxlclBvc2l0aW9uUHJvcGVydHkiLCJ2ZXJ0aWNhbFJ1bGVyUG9zaXRpb25Qcm9wZXJ0eSIsInJlZmVyZW5jZUxpbmVQb3NpdGlvblByb3BlcnR5IiwidGVuc2lvblByb3BlcnR5IiwicmFuZ2UiLCJkYW1waW5nUHJvcGVydHkiLCJmcmVxdWVuY3lQcm9wZXJ0eSIsInVuaXRzIiwicHVsc2VXaWR0aFByb3BlcnR5IiwiYW1wbGl0dWRlUHJvcGVydHkiLCJsYXN0RHRQcm9wZXJ0eSIsInBoZXRpb1JlYWRPbmx5IiwidGltZUVsYXBzZWRQcm9wZXJ0eSIsImFuZ2xlUHJvcGVydHkiLCJNYXRoIiwiUEkiLCJwdWxzZVBlbmRpbmdQcm9wZXJ0eSIsInB1bHNlU2lnblByb3BlcnR5IiwidmFsaWRWYWx1ZXMiLCJwdWxzZVByb3BlcnR5Iiwic3RvcHdhdGNoIiwicG9zaXRpb24iLCJ0aW1lUHJvcGVydHlPcHRpb25zIiwiWkVST19UT19BTE1PU1RfU0lYVFkiLCJ5Tm93Q2hhbmdlZEVtaXR0ZXIiLCJuZXh0TGVmdFlQcm9wZXJ0eSIsIndhdmVTdGFydFBvc2l0aW9uUHJvcGVydHkiLCJiaWRpcmVjdGlvbmFsIiwibWFwIiwieSIsImludmVyc2VNYXAiLCJwaGV0aW9WYWx1ZVR5cGUiLCJzdGVwRHRQcm9wZXJ0eSIsImJldGEiLCJhbHBoYSIsInJlc2V0IiwibGF6eUxpbmsiLCJwaGV0Iiwiam9pc3QiLCJzaW0iLCJpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5IiwidmFsdWUiLCJtYW51YWxSZXN0YXJ0Iiwic3RlcCIsImR0IiwiZml4RHQiLCJsYXN0RHQiLCJhYnMiLCJtYW51YWxTdGVwIiwiZXZvbHZlIiwidiIsImR4IiwiYiIsIkxPT1NFX0VORCIsIk5PX0VORCIsIkVycm9yIiwiYSIsImFscGhhU3EiLCJjIiwiaSIsIm9sZExhc3QiLCJvbGROb3ciLCJvbGROZXh0Iiwib2xkIiwidW5kZWZpbmVkIiwic3BlZWRNdWx0aXBsaWVyIiwiU0xPVyIsImFzc2VydCIsInN0YXJ0aW5nTGVmdFkiLCJudW1TdGVwcyIsImZsb29yIiwicGVyU3RlcERlbHRhIiwidGVuc2lvbkZhY3RvciIsImxpbmVhciIsInNxcnQiLCJtaW5EdCIsIk9TQ0lMTEFURSIsInNpbiIsIlBVTFNFIiwiZGEiLCJlbWl0IiwiZ2V0UmluZ1kiLCJ6ZXJvT3V0RW5kUG9pbnQiLCJtYW51YWxQdWxzZSIsImN1c3RvbUR0IiwibGVuZ3RoIiwiYnlLZXlzIiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsInRvU3RhdGVPYmplY3QiLCJtb2RlbCIsIl95RHJhdyIsIl95Tm93IiwiX3lMYXN0IiwiX3lOZXh0Iiwic3RhdGVTY2hlbWEiLCJhcHBseVN0YXRlIiwic3RhdGVPYmplY3QiLCJzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIldPQVNNb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBvYmplY3QgZm9yIFdhdmUgb24gYSBTdHJpbmdcclxuICpcclxuICogQGF1dGhvciBBbnRvbiBVbHlhbm92IChNbGVhcm5lcilcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IER5bmFtaWNQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0R5bmFtaWNQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25EZXByZWNhdGVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbkRlcHJlY2F0ZWQuanMnO1xyXG5pbXBvcnQgU3RvcHdhdGNoIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdG9wd2F0Y2guanMnO1xyXG5pbXBvcnQgVGltZVNwZWVkIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9UaW1lU3BlZWQuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0IGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgRmxvYXQ2NEFycmF5SU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0Zsb2F0NjRBcnJheUlPLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCB3YXZlT25BU3RyaW5nIGZyb20gJy4uLy4uL3dhdmVPbkFTdHJpbmcuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE5VTUJFUl9PRl9TRUdNRU5UUyA9IDYxO1xyXG5jb25zdCBMQVNUX0lOREVYID0gTlVNQkVSX09GX1NFR01FTlRTIC0gMTtcclxuY29uc3QgTkVYVF9UT19MQVNUX0lOREVYID0gTlVNQkVSX09GX1NFR01FTlRTIC0gMjtcclxuY29uc3QgQU1QTElUVURFX01VTFRJUExJRVIgPSA4MDsgLy8gdGhlIG51bWJlciBvZiBtb2RlbCB1bml0cyAodmVydGljYWxseSkgcGVyIGNtXHJcbmNvbnN0IEZSQU1FU19QRVJfU0VDT05EID0gNTA7XHJcblxyXG5jbGFzcyBXT0FTTW9kZWwgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtICkge1xyXG4gICAgc3VwZXIoIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHBoZXRpb1R5cGU6IFdPQVNNb2RlbC5XT0FTTW9kZWxJT1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0Zsb2F0NjRBcnJheX1cclxuICAgIHRoaXMueURyYXcgPSBuZXcgRmxvYXQ2NEFycmF5KCBOVU1CRVJfT0ZfU0VHTUVOVFMgKTtcclxuICAgIHRoaXMueU5vdyA9IG5ldyBGbG9hdDY0QXJyYXkoIE5VTUJFUl9PRl9TRUdNRU5UUyApO1xyXG4gICAgdGhpcy55TGFzdCA9IG5ldyBGbG9hdDY0QXJyYXkoIE5VTUJFUl9PRl9TRUdNRU5UUyApO1xyXG4gICAgdGhpcy55TmV4dCA9IG5ldyBGbG9hdDY0QXJyYXkoIE5VTUJFUl9PRl9TRUdNRU5UUyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxXT0FTTW9kZWwuTW9kZT59XHJcbiAgICB0aGlzLndhdmVNb2RlUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkoIFdPQVNNb2RlbC5Nb2RlLCBXT0FTTW9kZWwuTW9kZS5NQU5VQUwsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnd2F2ZU1vZGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3doYXQgaXMgb24gdGhlIGxlZnQgc2lkZSBvZiB0aGUgc3RyaW5nLCBjb250cm9sbGluZyBpdHMgbW90aW9uJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxXT0FTTW9kZWwuRW5kVHlwZX1cclxuICAgIHRoaXMuZW5kVHlwZVByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5KCBXT0FTTW9kZWwuRW5kVHlwZSwgV09BU01vZGVsLkVuZFR5cGUuRklYRURfRU5ELCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VuZFR5cGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3doYXQgaXMgb24gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIHN0cmluZydcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59XHJcbiAgICB0aGlzLmlzUGxheWluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdpc1BsYXlpbmdQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3doZXRoZXIgdGltZSBpcyBtb3ZpbmcgZm9yd2FyZCBpbiB0aGUgc2ltdWxhdGlvbiAocGF1c2VkIGlmIGZhbHNlKSdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48VGltZVNwZWVkPn1cclxuICAgIHRoaXMudGltZVNwZWVkUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25Qcm9wZXJ0eSggVGltZVNwZWVkLk5PUk1BTCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aW1lU3BlZWRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBwbGF5IHNwZWVkIGZvciB0aGUgc2ltdWxhdGlvbiBhcyBpdCBtb3ZlcyB0aHJvdWdoIHRpbWUnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSAtIFZpc2liaWxpdGllc1xyXG4gICAgdGhpcy5ydWxlcnNWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdydWxlcnNWaXNpYmxlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd3aGV0aGVyIHRoZSBydWxlcnMgYXJlIHZpc2libGUnXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnJlZmVyZW5jZUxpbmVWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZWZlcmVuY2VMaW5lVmlzaWJsZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnd2hldGhlciB0aGUgcmVmZXJlbmNlIGxpbmUgaXMgdmlzaWJsZSdcclxuICAgIH0gKTtcclxuICAgIHRoaXMud3JlbmNoQXJyb3dzVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd3cmVuY2hBcnJvd3NWaXNpYmxlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd3aGV0aGVyIHRoZSB1cC9kb3duIGFycm93cyBvbiB0aGUgd3JlbmNoIGFyZSB2aXNpYmxlJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxWZWN0b3IyPn1cclxuICAgIHRoaXMuaG9yaXpvbnRhbFJ1bGVyUG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIG5ldyBWZWN0b3IyKCA1NCwgMTE3ICksIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaG9yaXpvbnRhbFJ1bGVyUG9zaXRpb25Qcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3Bvc2l0aW9uIG9mIHRoZSBob3Jpem9udGFsIHJ1bGVyIGluIHZpZXcgY29vcmRpbmF0ZXMgKGZyb20gdGhlIHRvcC1sZWZ0IG9mIHRoZSBydWxlciwgaW5pdGlhbGx5IDU0LDExNyknXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnZlcnRpY2FsUnVsZXJQb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIDEzLCA0NDAgKSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2ZXJ0aWNhbFJ1bGVyUG9zaXRpb25Qcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3Bvc2l0aW9uIG9mIHRoZSB2ZXJ0aWNhbCBydWxlciBpbiB2aWV3IGNvb3JkaW5hdGVzIChmcm9tIHRoZSBib3R0b20tbGVmdCBvZiB0aGUgcnVsZXIsIGluaXRpYWxseSAxMyw0NDApJ1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5yZWZlcmVuY2VMaW5lUG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIG5ldyBWZWN0b3IyKCAtMTAsIDEyMCApLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JlZmVyZW5jZUxpbmVQb3NpdGlvblByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAncG9zaXRpb24gb2YgdGhlIHJlZmVyZW5jZSBsaW5lIGluIHZpZXcgY29vcmRpbmF0ZXMgKGZyb20gdGhlIGxlZnQgb2YgdGhlIGxpbmUsIGluaXRpYWxseSAtMTAsMTIwKSdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn1cclxuICAgIHRoaXMudGVuc2lvblByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLjgsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMC4yLCAwLjggKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGVuc2lvblByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndGhlIHJlbGF0aXZlIGFtb3VudCBvZiB0ZW5zaW9uIG9uIHRoZSBzdHJpbmcnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59XHJcbiAgICB0aGlzLmRhbXBpbmdQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMjAsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMTAwICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RhbXBpbmdQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSByZWxhdGl2ZSBhbW91bnQgb2YgZGFtcGluZyAocGVyY2VudGFnZSkgZm9yIHRoZSBzdHJpbmcnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59XHJcbiAgICB0aGlzLmZyZXF1ZW5jeVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxLjUwLCB7XHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDMgKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZnJlcXVlbmN5UHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0aGUgZnJlcXVlbmN5IG9mIHRoZSBvc2NpbGxhdG9yLCBpbiBoZXJ0eicsXHJcbiAgICAgIHVuaXRzOiAnSHonXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59XHJcbiAgICB0aGlzLnB1bHNlV2lkdGhQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMC41LCB7XHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAuMiwgMSApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwdWxzZVdpZHRoUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0aGUgd2lkdGggb2YgYSBwdWxzZSAoZ2VuZXJhdGVkIHdpdGggdGhlIHB1bHNlIG1vZGUpIGluIHNlY29uZHMnLFxyXG4gICAgICB1bml0czogJ3MnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59XHJcbiAgICB0aGlzLmFtcGxpdHVkZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLjc1LCB7XHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDEuMyApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhbXBsaXR1ZGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBhbXBsaXR1ZGUgb2YgdGhlIG9zY2lsbGF0aW9uIG9yIHB1bHNlcyBpbiBjZW50aW1ldGVycycsXHJcbiAgICAgIHVuaXRzOiAnY20nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59XHJcbiAgICB0aGlzLmxhc3REdFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLjAzLCB7XHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYXN0RHRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBhbW91bnQgb2YgdGltZSBzaW5jZSB0aGUgbGFzdCBtYW51YWwgaW50ZXJuYWwgc3RlcCwgaW4gc2Vjb25kcydcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn1cclxuICAgIHRoaXMudGltZUVsYXBzZWRQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGltZUVsYXBzZWRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBhbW91bnQgb2YgdGltZSBlbGFwc2VkIHNpbmNlIHRoZSBsYXN0IGV2b2x1dGlvbiBvZiB0aGUgcGh5c2ljcyBtb2RlbCwgaW4gc2Vjb25kcydcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn1cclxuICAgIHRoaXMuYW5nbGVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMiAqIE1hdGguUEkgKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYW5nbGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBhbmdsZSAoaW4gcmFkaWFucykgb2YgdGhlIG9zY2lsbGF0b3Igb3IgcHVsc2UnLFxyXG4gICAgICB1bml0czogJ3JhZGlhbnMnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fVxyXG4gICAgdGhpcy5wdWxzZVBlbmRpbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwdWxzZVBlbmRpbmdQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3doZXRoZXIgYSBwdWxzZSB3aWxsIHN0YXJ0IGF0IHRoZSBuZXh0IGludGVybmFsIG1vZGVsIHN0ZXAnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59XHJcbiAgICB0aGlzLnB1bHNlU2lnblByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxLCB7XHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICB2YWxpZFZhbHVlczogWyAtMSwgMSBdLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwdWxzZVNpZ25Qcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3doaWNoIHBhcnQgb2YgdGhlIHB1bHNlIGlzIGJlaW5nIGdlbmVyYXRlZCdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59XHJcbiAgICB0aGlzLnB1bHNlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncHVsc2VQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3doZXRoZXIgYSBwdWxzZSBpcyBjdXJyZW50bHkgYWN0aXZlJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1N0b3B3YXRjaH1cclxuICAgIHRoaXMuc3RvcHdhdGNoID0gbmV3IFN0b3B3YXRjaCgge1xyXG4gICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDU1MCwgMzMwICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N0b3B3YXRjaCcgKSxcclxuICAgICAgdGltZVByb3BlcnR5T3B0aW9uczoge1xyXG4gICAgICAgIHJhbmdlOiBTdG9wd2F0Y2guWkVST19UT19BTE1PU1RfU0lYVFlcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0VtaXR0ZXJ9IC0gRXZlbnRzIGVtaXR0ZWQgYnkgaW5zdGFuY2VzIG9mIHRoaXMgdHlwZVxyXG4gICAgdGhpcy55Tm93Q2hhbmdlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fVxyXG4gICAgdGhpcy5uZXh0TGVmdFlQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbmV4dExlZnRZUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdpbnRlcm5hbCBwcm9wZXJ0eSB1c2VkIHRvIGludGVycG9sYXRlIHRoZSBsZWZ0LW1vc3QgeSB2YWx1ZSBvZiB0aGUgc3RyaW5nIHdoaWxlIHRoZSB3cmVuY2ggaXMgbW92ZWQgaW4gbWFudWFsIG1vZGUgLSBmb3IgbG93LWZwcyBicm93c2VycydcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn1cclxuICAgIHRoaXMud2F2ZVN0YXJ0UG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBEeW5hbWljUHJvcGVydHkoIG5ldyBQcm9wZXJ0eSggdGhpcy5uZXh0TGVmdFlQcm9wZXJ0eSApLCB7XHJcbiAgICAgIGJpZGlyZWN0aW9uYWw6IHRydWUsXHJcbiAgICAgIG1hcDogeSA9PiAteSAvIEFNUExJVFVERV9NVUxUSVBMSUVSLFxyXG4gICAgICBpbnZlcnNlTWFwOiB5ID0+IC15ICogQU1QTElUVURFX01VTFRJUExJRVIsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3dhdmVTdGFydFBvc2l0aW9uUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0aGUgeS12YWx1ZSBvZiB0aGUgMXN0IGdyZWVuIGRvdCBtZWFzdXJlZCB3aXRoIHJlc3BlY3QgdG8gdGhlIGNlbnRlciBsaW5lJyxcclxuICAgICAgdW5pdHM6ICdjbScsXHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTnVtYmVySU9cclxuICAgIH0gKTtcclxuICAgIC8vIFRPRE86IGhvdyB0byBzdXBwb3J0IHJhbmdlIG9uIGR5bmFtaWMgcHJvcGVydGllcz8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3dhdmUtb24tYS1zdHJpbmcvaXNzdWVzLzE0N1xyXG4gICAgdGhpcy53YXZlU3RhcnRQb3NpdGlvblByb3BlcnR5LnJhbmdlID0gbmV3IFJhbmdlKCAtMS4zLCAxLjMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7UHJvcGVydHkuPG51bWJlcj59XHJcbiAgICB0aGlzLnN0ZXBEdFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzdGVwRHRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9XHJcbiAgICB0aGlzLmJldGEgPSAwLjA1O1xyXG4gICAgdGhpcy5hbHBoYSA9IDE7XHJcblxyXG4gICAgdGhpcy5yZXNldCgpO1xyXG5cclxuICAgIC8vIHNldCB0aGUgc3RyaW5nIHRvIDAgb24gbW9kZSBjaGFuZ2VzXHJcbiAgICB0aGlzLndhdmVNb2RlUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgICAgLy8gRG9uJ3QgbWVzcyB3aXRoIHBoZXQtaW8sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvd2F2ZS1vbi1hLXN0cmluZy9pc3N1ZXMvMTQxXHJcbiAgICAgIGlmICggIXBoZXQuam9pc3Quc2ltLmlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgdGhpcy5tYW51YWxSZXN0YXJ0KCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIGZvcndhcmQgaW4gdGltZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIGNvbnN0IGZpeER0ID0gMSAvIEZSQU1FU19QRVJfU0VDT05EO1xyXG5cclxuICAgIC8vIGxpbWl0IGNoYW5nZXMgZHRcclxuICAgIGNvbnN0IGxhc3REdCA9IHRoaXMubGFzdER0UHJvcGVydHkudmFsdWU7XHJcbiAgICBpZiAoIE1hdGguYWJzKCBkdCAtIGxhc3REdCApID4gbGFzdER0ICogMC4zICkge1xyXG4gICAgICBkdCA9IGxhc3REdCArICggKCBkdCAtIGxhc3REdCApIDwgMCA/IC0xIDogMSApICogbGFzdER0ICogMC4zO1xyXG4gICAgfVxyXG4gICAgdGhpcy5sYXN0RHRQcm9wZXJ0eS52YWx1ZSA9IGR0O1xyXG5cclxuICAgIGlmICggdGhpcy5pc1BsYXlpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgdGhpcy5zdGVwRHRQcm9wZXJ0eS52YWx1ZSArPSBkdDtcclxuXHJcbiAgICAgIC8vIGxpbWl0IG1pbiBkdFxyXG4gICAgICBpZiAoIHRoaXMuc3RlcER0UHJvcGVydHkudmFsdWUgPj0gZml4RHQgKSB7XHJcbiAgICAgICAgdGhpcy5tYW51YWxTdGVwKCB0aGlzLnN0ZXBEdFByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgICAgdGhpcy5zdGVwRHRQcm9wZXJ0eS52YWx1ZSAlPSBmaXhEdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5uZXh0TGVmdFlQcm9wZXJ0eS52YWx1ZSA9IHRoaXMueU5vd1sgMCBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhpcyBydW5zIGEgZml4ZWQtdGltZXN0ZXAgbW9kZWwgc3RlcC4gRWxzZXdoZXJlIHdlIGludGVycG9sYXRlIGJldHdlZW4gdGhlc2UuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGV2b2x2ZSgpIHtcclxuICAgIGNvbnN0IGR0ID0gMTtcclxuICAgIGNvbnN0IHYgPSAxO1xyXG4gICAgY29uc3QgZHggPSBkdCAqIHY7XHJcbiAgICBjb25zdCBiID0gdGhpcy5kYW1waW5nUHJvcGVydHkudmFsdWUgKiAwLjAwMjtcclxuXHJcbiAgICB0aGlzLmJldGEgPSBiICogZHQgLyAyO1xyXG4gICAgdGhpcy5hbHBoYSA9IHYgKiBkdCAvIGR4O1xyXG5cclxuICAgIHRoaXMueU5leHRbIDAgXSA9IHRoaXMueU5vd1sgMCBdO1xyXG5cclxuICAgIHN3aXRjaCggdGhpcy5lbmRUeXBlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIGNhc2UgV09BU01vZGVsLkVuZFR5cGUuRklYRURfRU5EOlxyXG4gICAgICAgIHRoaXMueU5vd1sgTEFTVF9JTkRFWCBdID0gMDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBXT0FTTW9kZWwuRW5kVHlwZS5MT09TRV9FTkQ6XHJcbiAgICAgICAgdGhpcy55Tm93WyBMQVNUX0lOREVYIF0gPSB0aGlzLnlOb3dbIE5FWFRfVE9fTEFTVF9JTkRFWCBdO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFdPQVNNb2RlbC5FbmRUeXBlLk5PX0VORDpcclxuICAgICAgICB0aGlzLnlOb3dbIExBU1RfSU5ERVggXSA9IHRoaXMueUxhc3RbIE5FWFRfVE9fTEFTVF9JTkRFWCBdO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvciggYHVua25vd24gZW5kIHR5cGU6ICR7dGhpcy5lbmRUeXBlUHJvcGVydHkudmFsdWV9YCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1haW4gZm9ybXVsYSBmb3IgY2FsY3VsYXRpbmdcclxuICAgIGNvbnN0IGEgPSAxIC8gKCB0aGlzLmJldGEgKyAxICk7XHJcbiAgICBjb25zdCBhbHBoYVNxID0gdGhpcy5hbHBoYSAqIHRoaXMuYWxwaGE7XHJcbiAgICBjb25zdCBjID0gMiAqICggMSAtIGFscGhhU3EgKTtcclxuICAgIGZvciAoIGxldCBpID0gMTsgaSA8IExBU1RfSU5ERVg7IGkrKyApIHtcclxuICAgICAgdGhpcy55TmV4dFsgaSBdID0gYSAqICggKCB0aGlzLmJldGEgLSAxICkgKiB0aGlzLnlMYXN0WyBpIF0gKyBjICogdGhpcy55Tm93WyBpIF0gKyBhbHBoYVNxICogKCB0aGlzLnlOb3dbIGkgKyAxIF0gKyB0aGlzLnlOb3dbIGkgLSAxIF0gKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHN0b3JlIG9sZCB2YWx1ZXMgZm9yIHRoZSB2ZXJ5IGxhc3QgcG9pbnRcclxuICAgIGNvbnN0IG9sZExhc3QgPSB0aGlzLnlMYXN0WyBMQVNUX0lOREVYIF07XHJcbiAgICBjb25zdCBvbGROb3cgPSB0aGlzLnlOb3dbIExBU1RfSU5ERVggXTtcclxuICAgIGNvbnN0IG9sZE5leHQgPSB0aGlzLnlOZXh0WyBMQVNUX0lOREVYIF07XHJcblxyXG4gICAgLy8gcm90YXRlIGFycmF5cyBpbnN0ZWFkIG9mIGNvcHlpbmcgZWxlbWVudHMgKGZvciBzcGVlZClcclxuICAgIGNvbnN0IG9sZCA9IHRoaXMueUxhc3Q7XHJcbiAgICB0aGlzLnlMYXN0ID0gdGhpcy55Tm93O1xyXG4gICAgdGhpcy55Tm93ID0gdGhpcy55TmV4dDtcclxuICAgIHRoaXMueU5leHQgPSBvbGQ7XHJcblxyXG4gICAgLy8gcmVzdG9yZSB0aGUgb2xkIHZhbHVlcyBmb3IgdGhlIHZlcnkgbGFzdCBwb2ludCBmb3IgZXZlcnkgYXJyYXkgKHBvdGVudGlhbGx5IG5vdCBuZWVkZWQgZm9yIGEgZmV3PylcclxuICAgIHRoaXMueUxhc3RbIExBU1RfSU5ERVggXSA9IG9sZExhc3Q7XHJcbiAgICB0aGlzLnlOb3dbIExBU1RfSU5ERVggXSA9IG9sZE5vdztcclxuICAgIHRoaXMueU5leHRbIExBU1RfSU5ERVggXSA9IG9sZE5leHQ7XHJcblxyXG4gICAgc3dpdGNoKCB0aGlzLmVuZFR5cGVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgY2FzZSBXT0FTTW9kZWwuRW5kVHlwZS5GSVhFRF9FTkQ6XHJcbiAgICAgICAgdGhpcy55TGFzdFsgTEFTVF9JTkRFWCBdID0gMDtcclxuICAgICAgICB0aGlzLnlOb3dbIExBU1RfSU5ERVggXSA9IDA7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgV09BU01vZGVsLkVuZFR5cGUuTE9PU0VfRU5EOlxyXG4gICAgICAgIHRoaXMueUxhc3RbIExBU1RfSU5ERVggXSA9IHRoaXMueU5vd1sgTEFTVF9JTkRFWCBdO1xyXG4gICAgICAgIHRoaXMueU5vd1sgTEFTVF9JTkRFWCBdID0gdGhpcy55Tm93WyBORVhUX1RPX0xBU1RfSU5ERVggXTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBXT0FTTW9kZWwuRW5kVHlwZS5OT19FTkQ6XHJcbiAgICAgICAgdGhpcy55TGFzdFsgTEFTVF9JTkRFWCBdID0gdGhpcy55Tm93WyBMQVNUX0lOREVYIF07XHJcbiAgICAgICAgdGhpcy55Tm93WyBMQVNUX0lOREVYIF0gPSB0aGlzLnlMYXN0WyBORVhUX1RPX0xBU1RfSU5ERVggXTsgLy8gZnJvbSBhIGNvbW1lbnQgaW4gdGhlIG9sZCBtb2RlbCBjb2RlP1xyXG4gICAgICAgIC8vIGZyb20gdGhlIEZsYXNoIG1vZGVsOiB0aGlzLnlOb3dbIExBU1RfSU5ERVggXSA9IHRoaXMueU5vd1sgTEFTVF9JTkRFWCBdOyAvL3RoaXMueUxhc3RbIE5FWFRfVE9fTEFTVF9JTkRFWCBdO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvciggYHVua25vd24gZW5kIHR5cGU6ICR7dGhpcy5lbmRUeXBlUHJvcGVydHkudmFsdWV9YCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFudWFsIHN0ZXA/XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICovXHJcbiAgbWFudWFsU3RlcCggZHQgKSB7XHJcbiAgICBsZXQgaTtcclxuICAgIGNvbnN0IGZpeER0ID0gMSAvIEZSQU1FU19QRVJfU0VDT05EO1xyXG4gICAgZHQgPSAoIGR0ICE9PSB1bmRlZmluZWQgJiYgZHQgPiAwICkgPyBkdCA6IGZpeER0O1xyXG5cclxuICAgIGNvbnN0IHNwZWVkTXVsdGlwbGllciA9IHRoaXMudGltZVNwZWVkUHJvcGVydHkudmFsdWUgPT09IFRpbWVTcGVlZC5OT1JNQUwgPyAxIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGltZVNwZWVkUHJvcGVydHkudmFsdWUgPT09IFRpbWVTcGVlZC5TTE9XID8gMC4yNSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3BlZWRNdWx0aXBsaWVyICE9PSBudWxsLCAndGltZVNwZWVkUHJvcGVydHkgaGFzIHVuc3Vwb3J0ZWQgdmFsdWUnICk7XHJcblxyXG4gICAgLy8gcHJlcGFyYXRpb24gdG8gaW50ZXJwb2xhdGUgdGhlIHlOb3cgYWNyb3NzIGluZGl2aWR1YWwgZXZvbHZlKCkgc3RlcHMgdG8gc21vb3RoIHRoZSBzdHJpbmcgb24gc2xvdy1GUFMgYnJvd3NlcnNcclxuICAgIGNvbnN0IHN0YXJ0aW5nTGVmdFkgPSB0aGlzLnlOb3dbIDAgXTtcclxuICAgIGNvbnN0IG51bVN0ZXBzID0gTWF0aC5mbG9vciggZHQgLyBmaXhEdCApO1xyXG4gICAgY29uc3QgcGVyU3RlcERlbHRhID0gbnVtU3RlcHMgPyAoICggdGhpcy5uZXh0TGVmdFlQcm9wZXJ0eS52YWx1ZSAtIHN0YXJ0aW5nTGVmdFkgKSAvIG51bVN0ZXBzICkgOiAwO1xyXG5cclxuICAgIC8vZHQgZm9yIHRlbnNpb24gZWZmZWN0XHJcbiAgICBjb25zdCB0ZW5zaW9uRmFjdG9yID0gVXRpbHMubGluZWFyKFxyXG4gICAgICBNYXRoLnNxcnQoIDAuMiApLCBNYXRoLnNxcnQoIDAuOCApLFxyXG4gICAgICAwLjIsIDEsXHJcbiAgICAgIE1hdGguc3FydCggdGhpcy50ZW5zaW9uUHJvcGVydHkudmFsdWUgKVxyXG4gICAgKTtcclxuICAgIGNvbnN0IG1pbkR0ID0gKCAxIC8gKCBGUkFNRVNfUEVSX1NFQ09ORCAqIHRlbnNpb25GYWN0b3IgKiBzcGVlZE11bHRpcGxpZXIgKSApO1xyXG4gICAgLy8gbGltaXQgbWF4IGR0XHJcbiAgICB3aGlsZSAoIGR0ID49IGZpeER0ICkge1xyXG4gICAgICB0aGlzLnRpbWVFbGFwc2VkUHJvcGVydHkudmFsdWUgPSB0aGlzLnRpbWVFbGFwc2VkUHJvcGVydHkudmFsdWUgKyBmaXhEdDtcclxuICAgICAgdGhpcy5zdG9wd2F0Y2guc3RlcCggZml4RHQgKiBzcGVlZE11bHRpcGxpZXIgKTtcclxuXHJcbiAgICAgIGlmICggdGhpcy53YXZlTW9kZVByb3BlcnR5LnZhbHVlID09PSBXT0FTTW9kZWwuTW9kZS5PU0NJTExBVEUgKSB7XHJcbiAgICAgICAgdGhpcy5hbmdsZVByb3BlcnR5LnZhbHVlID0gKCB0aGlzLmFuZ2xlUHJvcGVydHkudmFsdWUgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5QSSAqIDIgKiB0aGlzLmZyZXF1ZW5jeVByb3BlcnR5LnZhbHVlICogZml4RHQgKiBzcGVlZE11bHRpcGxpZXIgKSAlICggTWF0aC5QSSAqIDIgKTtcclxuICAgICAgICB0aGlzLnlEcmF3WyAwIF0gPSB0aGlzLnlOb3dbIDAgXSA9IHRoaXMuYW1wbGl0dWRlUHJvcGVydHkudmFsdWUgKiBBTVBMSVRVREVfTVVMVElQTElFUiAqIE1hdGguc2luKCAtdGhpcy5hbmdsZVByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCB0aGlzLndhdmVNb2RlUHJvcGVydHkudmFsdWUgPT09IFdPQVNNb2RlbC5Nb2RlLlBVTFNFICYmIHRoaXMucHVsc2VQZW5kaW5nUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgdGhpcy5wdWxzZVBlbmRpbmdQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucHVsc2VQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy55Tm93WyAwIF0gPSAwO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggdGhpcy53YXZlTW9kZVByb3BlcnR5LnZhbHVlID09PSBXT0FTTW9kZWwuTW9kZS5QVUxTRSAmJiB0aGlzLnB1bHNlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgY29uc3QgZGEgPSBNYXRoLlBJICogZml4RHQgKiBzcGVlZE11bHRpcGxpZXIgLyB0aGlzLnB1bHNlV2lkdGhQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICBpZiAoIHRoaXMuYW5nbGVQcm9wZXJ0eS52YWx1ZSArIGRhID49IE1hdGguUEkgLyAyICkge1xyXG4gICAgICAgICAgdGhpcy5wdWxzZVNpZ25Qcm9wZXJ0eS52YWx1ZSA9IC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHRoaXMuYW5nbGVQcm9wZXJ0eS52YWx1ZSArIGRhICogdGhpcy5wdWxzZVNpZ25Qcm9wZXJ0eS52YWx1ZSA+IDAgKSB7XHJcbiAgICAgICAgICB0aGlzLmFuZ2xlUHJvcGVydHkudmFsdWUgPSB0aGlzLmFuZ2xlUHJvcGVydHkudmFsdWUgKyBkYSAqIHRoaXMucHVsc2VTaWduUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgLy9lbmQgcHVsc2UgYW5kIHJlc2V0XHJcbiAgICAgICAgICB0aGlzLmFuZ2xlUHJvcGVydHkucmVzZXQoKTtcclxuICAgICAgICAgIHRoaXMucHVsc2VTaWduUHJvcGVydHkucmVzZXQoKTtcclxuICAgICAgICAgIHRoaXMucHVsc2VQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnlEcmF3WyAwIF0gPSB0aGlzLnlOb3dbIDAgXSA9IHRoaXMuYW1wbGl0dWRlUHJvcGVydHkudmFsdWUgKiBBTVBMSVRVREVfTVVMVElQTElFUiAqICggLXRoaXMuYW5nbGVQcm9wZXJ0eS52YWx1ZSAvICggTWF0aC5QSSAvIDIgKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggdGhpcy53YXZlTW9kZVByb3BlcnR5LnZhbHVlID09PSBXT0FTTW9kZWwuTW9kZS5NQU5VQUwgKSB7XHJcbiAgICAgICAgLy8gaW50ZXJwb2xhdGUgdGhlIHlOb3cgYWNyb3NzIHN0ZXBzIGZvciBtYW51YWwgKGJldHdlZW4gZnJhbWVzKVxyXG4gICAgICAgIHRoaXMueU5vd1sgMCBdICs9IHBlclN0ZXBEZWx0YTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHRoaXMudGltZUVsYXBzZWRQcm9wZXJ0eS52YWx1ZSA+PSBtaW5EdCApIHtcclxuICAgICAgICB0aGlzLnRpbWVFbGFwc2VkUHJvcGVydHkudmFsdWUgPSB0aGlzLnRpbWVFbGFwc2VkUHJvcGVydHkudmFsdWUgJSBtaW5EdDtcclxuICAgICAgICB0aGlzLmV2b2x2ZSgpO1xyXG4gICAgICAgIGZvciAoIGkgPSAwOyBpIDwgTlVNQkVSX09GX1NFR01FTlRTOyBpKysgKSB7XHJcbiAgICAgICAgICB0aGlzLnlEcmF3WyBpIF0gPSB0aGlzLnlMYXN0WyBpIF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGZvciAoIGkgPSAxOyBpIDwgTlVNQkVSX09GX1NFR01FTlRTOyBpKysgKSB7XHJcbiAgICAgICAgICB0aGlzLnlEcmF3WyBpIF0gPSB0aGlzLnlMYXN0WyBpIF0gKyAoICggdGhpcy55Tm93WyBpIF0gLSB0aGlzLnlMYXN0WyBpIF0gKSAqICggdGhpcy50aW1lRWxhcHNlZFByb3BlcnR5LnZhbHVlIC8gbWluRHQgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBkdCAtPSBmaXhEdDtcclxuICAgIH1cclxuICAgIGlmICggdGhpcy53YXZlTW9kZVByb3BlcnR5LnZhbHVlID09PSBXT0FTTW9kZWwuTW9kZS5NQU5VQUwgKSB7XHJcbiAgICAgIC8vIHNhbml0eSBjaGVjayBmb3Igb3VyIHlOb3dcclxuICAgICAgLy8gdGhpcy55Tm93WzBdID0gdGhpcy5uZXh0TGVmdFlQcm9wZXJ0eS52YWx1ZTtcclxuICAgIH1cclxuICAgIHRoaXMueU5vd0NoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHkgcG9zaXRpb24gZm9yIHRoZSBlbmQgb2YgdGhlIHN0cmluZyAocG9zaXRpb24gZm9yIHRoZSByaW5nKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldFJpbmdZKCkge1xyXG4gICAgcmV0dXJuIHRoaXMueU5vd1sgTEFTVF9JTkRFWCBdIHx8IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGVuIHdlIG1vdmUgdG8gYSBmaXhlZCBwb2ludCwgd2Ugd2FudCB0byB6ZXJvIG91dCB0aGUgdmVyeSBlbmQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHplcm9PdXRFbmRQb2ludCgpIHtcclxuICAgIHRoaXMueU5vd1sgTEFTVF9JTkRFWCBdID0gMDtcclxuICAgIHRoaXMueURyYXdbIExBU1RfSU5ERVggXSA9IDA7XHJcblxyXG4gICAgdGhpcy55Tm93Q2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZ2dlcnMgdGhlIHN0YXJ0IG9mIGEgcHVsc2UuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIG1hbnVhbFB1bHNlKCkge1xyXG4gICAgdGhpcy55Tm93WyAwIF0gPSAwO1xyXG4gICAgdGhpcy5hbmdsZVByb3BlcnR5LnZhbHVlID0gMDtcclxuICAgIHRoaXMucHVsc2VTaWduUHJvcGVydHkudmFsdWUgPSAxO1xyXG4gICAgdGhpcy5wdWxzZVBlbmRpbmdQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICB0aGlzLnB1bHNlUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWdnZXJzIGEgcmVzZXQgKGtpbmQgb2YgYSBwYXJ0aWFsIHJlc2V0KS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbWFudWFsUmVzdGFydCgpIHtcclxuICAgIHRoaXMuYW5nbGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy50aW1lRWxhcHNlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnB1bHNlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucHVsc2VTaWduUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucHVsc2VQZW5kaW5nUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuY3VzdG9tRHQgPSAwO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMueU5vdy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdGhpcy55RHJhd1sgaSBdID0gdGhpcy55TmV4dFsgaSBdID0gdGhpcy55Tm93WyBpIF0gPSB0aGlzLnlMYXN0WyBpIF0gPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubmV4dExlZnRZUHJvcGVydHkudmFsdWUgPSAwO1xyXG4gICAgdGhpcy55Tm93Q2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIGV2ZXJ5dGhpbmcgaW4gdGhlIG1vZGVsLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMud2F2ZU1vZGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5lbmRUeXBlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudGltZVNwZWVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucnVsZXJzVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnJlZmVyZW5jZUxpbmVWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudGVuc2lvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmRhbXBpbmdQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5mcmVxdWVuY3lQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wdWxzZVdpZHRoUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYW1wbGl0dWRlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaXNQbGF5aW5nUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubGFzdER0UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaG9yaXpvbnRhbFJ1bGVyUG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy52ZXJ0aWNhbFJ1bGVyUG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5yZWZlcmVuY2VMaW5lUG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zdG9wd2F0Y2gucmVzZXQoKTtcclxuICAgIHRoaXMud3JlbmNoQXJyb3dzVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLm1hbnVhbFJlc3RhcnQoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEBwdWJsaWMge0VudW1lcmF0aW9uRGVwcmVjYXRlZH1cclxuV09BU01vZGVsLk1vZGUgPSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuYnlLZXlzKCBbXHJcbiAgJ01BTlVBTCcsXHJcbiAgJ09TQ0lMTEFURScsXHJcbiAgJ1BVTFNFJ1xyXG5dICk7XHJcblxyXG4vLyBAcHVibGljIHtFbnVtZXJhdGlvbkRlcHJlY2F0ZWR9XHJcbldPQVNNb2RlbC5FbmRUeXBlID0gRW51bWVyYXRpb25EZXByZWNhdGVkLmJ5S2V5cyggW1xyXG4gICdGSVhFRF9FTkQnLFxyXG4gICdMT09TRV9FTkQnLFxyXG4gICdOT19FTkQnXHJcbl0gKTtcclxuXHJcbldPQVNNb2RlbC5XT0FTTW9kZWxJTyA9IG5ldyBJT1R5cGUoICdXT0FTTW9kZWxJTycsIHtcclxuICB2YWx1ZVR5cGU6IFdPQVNNb2RlbCxcclxuICBkb2N1bWVudGF0aW9uOiAnVGhlIG1haW4gbW9kZWwgZm9yIFdhdmUgb24gYSBTdHJpbmcnLFxyXG4gIHRvU3RhdGVPYmplY3Q6IG1vZGVsID0+ICgge1xyXG4gICAgX3lEcmF3OiBGbG9hdDY0QXJyYXlJTy50b1N0YXRlT2JqZWN0KCBtb2RlbC55RHJhdyApLFxyXG4gICAgX3lOb3c6IEZsb2F0NjRBcnJheUlPLnRvU3RhdGVPYmplY3QoIG1vZGVsLnlOb3cgKSxcclxuICAgIF95TGFzdDogRmxvYXQ2NEFycmF5SU8udG9TdGF0ZU9iamVjdCggbW9kZWwueUxhc3QgKSxcclxuICAgIF95TmV4dDogRmxvYXQ2NEFycmF5SU8udG9TdGF0ZU9iamVjdCggbW9kZWwueU5leHQgKVxyXG4gIH0gKSxcclxuICBzdGF0ZVNjaGVtYToge1xyXG4gICAgX3lEcmF3OiBGbG9hdDY0QXJyYXlJTyxcclxuICAgIF95Tm93OiBGbG9hdDY0QXJyYXlJTyxcclxuICAgIF95TGFzdDogRmxvYXQ2NEFycmF5SU8sXHJcbiAgICBfeU5leHQ6IEZsb2F0NjRBcnJheUlPXHJcbiAgfSxcclxuICBhcHBseVN0YXRlOiAoIG1vZGVsLCBzdGF0ZU9iamVjdCApID0+IHtcclxuXHJcbiAgICAvLyBXZSBtYWtlIGFuIGFzc3VtcHRpb24gYWJvdXQgRmxvYXQ2NEFycmF5SU8ncyBzZXJpYWxpemF0aW9uIGhlcmUsIHNvIHRoYXQgd2UgZG9uJ3QgY3JlYXRlIHRlbXBvcmFyeSBnYXJiYWdlXHJcbiAgICAvLyBGbG9hdDY0QXJyYXlzLiBJbnN0ZWFkIHdlIHNldCB0aGUgYXJyYXkgdmFsdWVzIGRpcmVjdGx5LlxyXG4gICAgbW9kZWwueURyYXcuc2V0KCBzdGF0ZU9iamVjdC5feURyYXcgKTtcclxuICAgIG1vZGVsLnlOb3cuc2V0KCBzdGF0ZU9iamVjdC5feU5vdyApO1xyXG4gICAgbW9kZWwueUxhc3Quc2V0KCBzdGF0ZU9iamVjdC5feUxhc3QgKTtcclxuICAgIG1vZGVsLnlOZXh0LnNldCggc3RhdGVPYmplY3QuX3lOZXh0ICk7XHJcblxyXG4gICAgbW9kZWwueU5vd0NoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcbn0gKTtcclxuXHJcbndhdmVPbkFTdHJpbmcucmVnaXN0ZXIoICdXT0FTTW9kZWwnLCBXT0FTTW9kZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgV09BU01vZGVsO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0MsNkJBQTZCLE1BQU0sc0RBQXNEO0FBQ2hHLE9BQU9DLG1CQUFtQixNQUFNLDRDQUE0QztBQUM1RSxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxPQUFPQyxxQkFBcUIsTUFBTSxtREFBbUQ7QUFDckYsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQUNoRSxPQUFPQyxTQUFTLE1BQU0sMENBQTBDO0FBQ2hFLE9BQU9DLFlBQVksTUFBTSx1Q0FBdUM7QUFDaEUsT0FBT0MsY0FBYyxNQUFNLCtDQUErQztBQUMxRSxPQUFPQyxNQUFNLE1BQU0sdUNBQXVDO0FBQzFELE9BQU9DLFFBQVEsTUFBTSx5Q0FB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