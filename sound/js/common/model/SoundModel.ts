// Copyright 2022-2023, University of Colorado Boulder
/**
 * Base model for a sound scene.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import TModel from '../../../../joist/js/TModel.js';
import EventTimer from '../../../../phet-core/js/EventTimer.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Lattice from '../../../../scenery-phet/js/Lattice.js';
import TemporalMask from '../../common/model/TemporalMask.js';
import SoundConstants from '../../common/SoundConstants.js';
import sound from '../../sound.js';

// This simulation uses EventTimer, which provides exactly the same model behavior on very slow and very fast
// platforms.  Here we define the frequency of events in Hz, which has been tuned so that our slowest platform has
// an acceptable frame rate
const eventTimerPeriod = 1 / SoundConstants.EVENT_RATE;
const frequencyRange = new Range( 0, 1 );
const INITIAL_FREQUENCY = 0.5;

type SoundModelOptions = {
  hasReflection?: boolean;
  hasSecondSource?: boolean;
  initialAmplitude?: number;
  speaker1PositionY?: number;
};

export default class SoundModel implements TModel {

  // whether audio is enabled
  public readonly isAudioEnabledProperty: Property<boolean>;
  public readonly modelToLatticeTransform: ModelViewTransform2;
  public modelViewTransform: ModelViewTransform2 | null;

  // position of the non-moving first speaker.
  public readonly speaker1Position: Vector2;

  // the value of the wave at the oscillation point
  public readonly oscillatorProperty: NumberProperty;

  // propery that shows that a pulse is firing
  public readonly isPulseFiringProperty: BooleanProperty;

  // the frequency in the appropriate units for the scene
  public readonly frequencyProperty: NumberProperty;

  // controls the amplitude of the wave.
  public readonly amplitudeProperty: NumberProperty;

  public readonly hasSecondSource: boolean;

  // whether this model has a reflection wall.
  public readonly hasReflection: boolean;

  // propery that shows if the simulation in running.
  public readonly isRunningProperty: BooleanProperty;

  //  phase of the sound wave.
  private phase = 0;

  // number of steps since launch of the simulation.
  private stepIndex = 0;

  private readonly temporalMask: TemporalMask;

  // In order to have exactly the same model behavior on very fast and very slow platforms, we use
  // EventTimer, which updates the model at regular intervals, and we can interpolate between states for additional
  // fidelity.
  private readonly eventTimer: EventTimer;

  // elapsed time in seconds
  private readonly timeProperty: NumberProperty;

  // the grid that contains the wave values of the first speaker
  public readonly lattice: Lattice;
  private latticeToViewTransform: ModelViewTransform2 | null;
  private pulseStartTime: number | null = null;

  public constructor( providedOptions?: SoundModelOptions ) {
    const options = optionize<SoundModelOptions>()( {
      initialAmplitude: 5,
      speaker1PositionY: SoundConstants.WAVE_AREA_WIDTH / 2,
      hasReflection: false,
      hasSecondSource: false
    }, providedOptions );

    this.hasSecondSource = options.hasSecondSource;
    this.hasReflection = options.hasReflection;
    this.isRunningProperty = new BooleanProperty( true );
    this.isPulseFiringProperty = new BooleanProperty( false );
    this.phase = 0;
    this.stepIndex = 0;

    this.temporalMask = new TemporalMask();
    this.oscillatorProperty = new NumberProperty( 0 );

    const eventTimerModel = {
      getPeriodBeforeNextEvent: () => eventTimerPeriod
    };

    this.eventTimer = new EventTimer( eventTimerModel, timeElapsed => this.advanceTime( eventTimerPeriod, false ) );

    // When frequency changes, choose a new phase such that the new sine curve has the same value and direction
    // for continuity
    const phaseUpdate = ( newFrequency: number, oldFrequency: number ) => {

      // For the main model, Math.sin is performed on angular frequency, so to match the phase, that computation
      // should also be based on angular frequencies
      const oldAngularFrequency = oldFrequency * Math.PI * 2;
      const newAngularFrequency = newFrequency * Math.PI * 2;
      const time = this.timeProperty.value;

      const oldValue = Math.sin( time * oldAngularFrequency + this.phase );
      let proposedPhase = Math.asin( oldValue ) - time * newAngularFrequency;
      const oldDerivative = Math.cos( time * oldAngularFrequency + this.phase );
      const newDerivative = Math.cos( time * newAngularFrequency + proposedPhase );

      // If wrong phase, take the sin value from the opposite side and move forward by half a cycle
      if ( oldDerivative * newDerivative < 0 ) {
        proposedPhase = Math.asin( -oldValue ) - time * newAngularFrequency + Math.PI;
      }

      this.phase = proposedPhase;
    };

    this.frequencyProperty = new NumberProperty( INITIAL_FREQUENCY, { range: frequencyRange } );
    this.frequencyProperty.lazyLink( phaseUpdate );

    this.amplitudeProperty = new NumberProperty( options.initialAmplitude, {
      range: SoundConstants.AMPLITUDE_RANGE
    } );

    this.timeProperty = new NumberProperty( 0 );

    this.lattice = new Lattice(
      SoundConstants.LATTICE_DIMENSION,
      SoundConstants.LATTICE_DIMENSION,
      SoundConstants.LATTICE_PADDING,
      SoundConstants.LATTICE_PADDING
    );

    this.modelToLatticeTransform = ModelViewTransform2.createRectangleMapping(
      new Rectangle( 0, 0, SoundConstants.WAVE_AREA_WIDTH, SoundConstants.WAVE_AREA_WIDTH ),
      this.lattice.visibleBounds
    );

    this.modelViewTransform = null;
    this.latticeToViewTransform = null;

    this.speaker1Position = new Vector2( this.modelToLatticeTransform.viewToModelX( SoundConstants.SOURCE_POSITION_X ), options.speaker1PositionY );

    this.isAudioEnabledProperty = new BooleanProperty( false );
  }

  /**
   * After the view is initialized, determine the coordinate transformations that map to view coordinates.
   */
  public setViewBounds( viewBounds: Bounds2 ): void {
    assert && assert( this.modelViewTransform === null, 'setViewBounds cannot be called twice' );

    this.modelViewTransform = ModelViewTransform2.createRectangleMapping(
      this.getWaveAreaBounds(),
      viewBounds
    );

    const latticeBounds = new Bounds2( 0, 0, 1, 1 );
    const modelBounds = this.modelToLatticeTransform.viewToModelBounds( latticeBounds );
    const tempViewBounds = this.modelViewTransform.modelToViewBounds( modelBounds );

    this.latticeToViewTransform = ModelViewTransform2.createRectangleMapping( latticeBounds, tempViewBounds );
  }

  /**
   * Returns a Bounds2 for the visible part of the wave area, in the coordinates of the scene.
   * @returns - the lattice model bounds, in the coordinates of this scene.
   */
  public getWaveAreaBounds(): Bounds2 {
    return new Bounds2( 0, 0, SoundConstants.WAVE_AREA_WIDTH, SoundConstants.WAVE_AREA_WIDTH );
  }

  /**
   * Generate a wave from the point sources
   */
  private generateWaves(): void {
    const amplitude = this.amplitudeProperty.get();
    const time = this.timeProperty.get();
    const frequency = this.frequencyProperty.get();
    const period = 1 / frequency;
    const timeSincePulseStarted = time - this.pulseStartTime!;

    // @ts-expect-error
    const isContinuous = ( !this.soundModeProperty || this.soundModeProperty.get() === 'CONTINUOUS' );

    // Used to compute whether a delta appears in either mask
    let temporalMaskEmpty = true;

    // If the pulse is running, end the pulse after one period
    if ( this.isPulseFiringProperty.get() ) {
      const timeSincePulseStarted = this.timeProperty.value - this.pulseStartTime!;

      if ( timeSincePulseStarted > period ) {
        this.isPulseFiringProperty.set( false );
        this.pulseStartTime = 0;
      }
    }

    if ( isContinuous || this.isPulseFiringProperty.get() ) {

      // The simulation is designed to start with a downward wave, corresponding to water splashing in
      const angularFrequency = Math.PI * 2 * frequency;

      // Value to be multiplied with the final wave value.
      // @ts-expect-error
      const dampingByPressure = this.pressureProperty ? this.pressureProperty.value : 1;

      // Compute the wave value as a function of time, or set to zero if no longer generating a wave.
      const waveValue = ( this.isPulseFiringProperty.get() && timeSincePulseStarted > period ) ? 0 :
                        -Math.sin( time * angularFrequency + this.phase ) * amplitude *
                        1.2 * dampingByPressure;

      // Point source
      if ( isContinuous || this.isPulseFiringProperty.get() ) {

        const j = Math.floor( this.modelToLatticeTransform.modelToViewY( this.speaker1Position.y ) );
        this.lattice.setCurrentValue( SoundConstants.SOURCE_POSITION_X, j, waveValue );
        this.oscillatorProperty.value = waveValue;
        if ( amplitude > 0 && frequency > 0 ) {
          this.temporalMask.set( true, this.stepIndex, j );
          temporalMaskEmpty = false;
        }
      }
    }

    temporalMaskEmpty && this.temporalMask.set( false, this.stepIndex, 0 );
  }

  /**
   * The user has initiated a single pulse.
   */
  public startPulse(): void {
    assert && assert( !this.isPulseFiringProperty.value, 'Cannot fire a pulse while a pulse is already being fired' );
    this.resetPhase();
    this.isPulseFiringProperty.value = true;
    this.pulseStartTime = this.timeProperty.value;
  }

  /**
   * Start the sine argument at 0 so it will smoothly form the first wave.
   */
  private resetPhase(): void {
    const frequency = this.frequencyProperty.get();
    const angularFrequency = Math.PI * 2 * frequency;

    // Solve for the sin arg = 0 in Math.sin( this.time * angularFrequency + this.phase )
    this.phase = -this.timeProperty.value * angularFrequency;
  }

  /**
   * Resets the model.
   */
  public reset(): void {
    this.isAudioEnabledProperty.reset();
    this.isRunningProperty.reset();
    this.timeProperty.reset();
    this.frequencyProperty.reset();
    this.amplitudeProperty.reset();
    this.timeProperty.reset();
    this.oscillatorProperty.reset();

    this.phase = 0;
    this.stepIndex = 0;
    this.lattice.clear();
  }

  /**
   * Clears the waves from the screen.
   */
  public clearWaves(): void {
    this.lattice.clear();
  }

  /**
   * Steps the model.
   * @param dt - time step, in seconds
   */
  public step( dt: number ): void {

    // Feed the real time to the eventTimer and it will trigger advanceTime at the appropriate rate
    this.eventTimer.step( dt );
  }

  /**
   * By recording the times and positions of the wave disturbances, and knowing the wave propagation speed,
   * we can apply a masking function across the wave area, zeroing out any cell that could note have been generated
   * from the source disturbance.  This filters out spurious noise and restores "black" for the light scene.
   */
  private applyTemporalMask(): void {

    // zero out values that are outside of the mask
    for ( let i = 0; i < this.lattice.width; i++ ) {
      for ( let j = 0; j < this.lattice.height; j++ ) {

        const distanceWithinBounds = this.temporalMask.matches( SoundConstants.SOURCE_POSITION_X, i, j, this.stepIndex ) >= 0;

        this.lattice.setAllowed( i, j, distanceWithinBounds );
      }
    }

    // Prune entries.  Elements that are too far out of range are eliminated.  Use the diagonal of the lattice for the
    // max distance
    this.temporalMask.prune( Math.sqrt( 2 ) * this.lattice.width, this.stepIndex );
  }

  /**
   * Additionally called from the "step" button
   * @param dt - amount of time that passed
   * @param manualStep - true if the step button is being pressed
   */
  public advanceTime( dt: number, manualStep: boolean ): void {
    if ( this.isRunningProperty.get() || manualStep ) {
      // Correction constant taken from wave-interference
      const correction = 2.4187847116091334 * SoundConstants.WAVE_AREA_WIDTH / 500;

      // @ts-expect-error
      if ( this.stopwatch ) {

        // @ts-expect-error
        this.stopwatch.step( dt * correction );
      }

      this.lattice.interpolationRatio = this.eventTimer.getRatio();

      this.timeProperty.value += dt * correction;

      // Update the lattice
      this.lattice.step();

      // Apply values on top of the computed lattice values so there is no noise at the point sources
      this.generateWaves();

      this.applyTemporalMask();

      // Notify listeners about changes
      this.lattice.changedEmitter.emit();

      this.stepIndex++;
    }
  }
}

sound.register( 'SoundModel', SoundModel );