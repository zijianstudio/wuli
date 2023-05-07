// Copyright 2020-2022, University of Colorado Boulder

/**
 * A short but sustained note that plays when the ratio becomes "in proportion". This type has built-in functionality to allow the
 * note to sustain if in-proportion, but will quickly quiet when no longer "in proportion".
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import SoundClip, { SoundClipOptions } from '../../../../../tambo/js/sound-generators/SoundClip.js';
import inProportion_mp3 from '../../../../sounds/in-proportion/inProportion_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import RAPModel from '../../model/RAPModel.js';
import Property from '../../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import optionize, { EmptySelfOptions } from '../../../../../phet-core/js/optionize.js';

const SUCCESS_OUTPUT_LEVEL = 0.8;
const SILENT_LEVEL = 0;

// The distance that you must move away from being in Proportion until you can then come back in proportion and get a
// success sound to play. See InProportionSoundGenerator. In "fitness" units, so the default value is a space of 10%
// of the fitness range.
const HYSTERESIS_THRESHOLD = 0.1;

// The minimum time, in seconds, that this SoundClip will play, even if outside control Properties try to turn it off.
// NOTE: This is a hardcoded time within the `in-proportion_mp3.js` sound, do not change the sound without changing this.
const MANDATORY_PLAY_TIME = 0.4;

class InProportionSoundGenerator extends SoundClip {

  private model: RAPModel;
  private targetRatioProperty: Property<number>;
  private fitnessProperty: TReadOnlyProperty<number>;

  // keep track of if the success sound has already played. This will be set back to false when the fitness
  // goes back out of range for the success sound.
  private playedSuccessYetProperty: Property<boolean>;

  // keep track of how long the sound has already played for. This is used to make sure that the beginning
  // of this sound is always played, even when the outside enabledControlProperty is set to false.
  private timePlayedSoFarProperty: Property<number>;

  // True when, in the previous step, the current ratio (calculated from currentRatio) is larger than the target ratio.
  private previousRatioWasLargerThanTarget: boolean;

  // true when, in the previous step, either term of the ratio was too small to indicate success.
  private previousRatioWasTooSmallForSuccess: boolean;

  // in certain cases ratio hand positions can move so quickly "through" the in-proportion range that an
  // actual "in proportion" value is never set. When this boolean is true, then this SoundGenerator will note when
  // this "jump over in proportion" occurs, and still play the sound. This is useful for mouse interaction, but not
  // so much for keyboard interaction. See https://github.com/phetsims/ratio-and-proportion/issues/162
  private jumpingOverShouldSound: boolean;

  /**
   * @param model
   * @param enabledControlProperty - not supposed to be settable, just listened to. NOTE: this is not simply
   *                                            an on/off Property for the SoundGenerator, see below.
   * @param providedOptions
   */
  public constructor( model: RAPModel, enabledControlProperty: TReadOnlyProperty<boolean>, providedOptions?: SoundClipOptions ) {

    const options = optionize<SoundClipOptions, EmptySelfOptions>()( {
      initialOutputLevel: 0.5
    }, providedOptions );

    assert && assert( !options.enableControlProperties, 'use the parameter instead, and note doc for difference in implementation' );

    super( inProportion_mp3, options );

    this.model = model;
    this.targetRatioProperty = model.targetRatioProperty;
    this.fitnessProperty = model.ratioFitnessProperty;

    this.playedSuccessYetProperty = new BooleanProperty( model.inProportionProperty.value );
    this.timePlayedSoFarProperty = new NumberProperty( MANDATORY_PLAY_TIME );

    const playedMandatoryPortionYetProperty: TReadOnlyProperty<boolean> = new DerivedProperty( [ this.timePlayedSoFarProperty, this.playedSuccessYetProperty ],
      ( timePlayed, playedSuccessYet ) => playedSuccessYet && timePlayed <= MANDATORY_PLAY_TIME );

    // In addition to any supplemental enabledControlProperty that the client wants to pass in, make sure to set up
    // an override to ensure that there is always a minimum, "mandatory" time that this sound occurs, even if it doesn't
    // stay in proportion for as long as that ding sound occurs.
    this.addEnableControlProperty( DerivedProperty.or( [ playedMandatoryPortionYetProperty, enabledControlProperty ] ) );

    // Whenever the inProportionProperty changes, we want to run step eagerly. This is in-part hacky, as perhaps this
    // whole sound generator should run on inProportionProperty, but there are enough time-based parts of this sound
    // generator that it makes sense to just call the step function here instead.
    model.inProportionProperty.lazyLink( ( inProportion: boolean ) => {
      inProportion && this.step( 0 );
    } );

    this.previousRatioWasLargerThanTarget = this.calculateCurrentRatioLargerThanTarget();
    this.previousRatioWasTooSmallForSuccess = this.model.valuesTooSmallForInProportion();
    this.jumpingOverShouldSound = false;
  }

  private calculateCurrentRatioLargerThanTarget(): boolean {
    return this.model.ratio.currentRatio > this.model.targetRatioProperty.value;
  }

  /**
   * When true, the InProportionSoundGenerator will play when the ratio "jumps" over in proportion in two consecutive
   * values of the current ratio.
   */
  public setJumpingOverProportionShouldTriggerSound( jumpingOverShouldSound: boolean ): void {
    this.jumpingOverShouldSound = jumpingOverShouldSound;
  }

  /**
   * True when the ratio jumped over being in proportion, but it should still sound that it was in proportion. This can
   * only occur when current and previous ratio terms were not in the "too small for success" region.
   */
  private jumpedOverInProportionAndShouldSound(): boolean {
    return this.jumpingOverShouldSound &&
           !this.model.valuesTooSmallForInProportion() && !this.previousRatioWasTooSmallForSuccess &&
           this.calculateCurrentRatioLargerThanTarget() !== this.previousRatioWasLargerThanTarget;
  }

  /**
   * Step this sound generator, used for fading out the sound in the absence change.
   */
  public step( dt: number ): void {
    const newFitness = this.fitnessProperty.value;

    const isInRatio = this.model.inProportion();

    // Only use hysteresis when both hands are moving.
    const hysteresisThreshold = this.model.ratio.movingInDirectionProperty.value ? HYSTERESIS_THRESHOLD : 0;

    // Increment only when Playing, since fullEnabledProperty sets things to stop() playing.
    if ( this.isPlaying ) {
      this.timePlayedSoFarProperty.value += dt;
    }

    if ( !this.playedSuccessYetProperty.value &&
         ( isInRatio || this.jumpedOverInProportionAndShouldSound() ) &&
         !this.model.ratioEvenButNotAtTarget()  // don't allow this sound if target isn't 1 but both values are 1
    ) {
      this.setOutputLevel( SUCCESS_OUTPUT_LEVEL, 0 );
      this.play();
      this.playedSuccessYetProperty.value = true;
      this.timePlayedSoFarProperty.value = 0;
    }
    else if ( this.playedSuccessYetProperty.value && newFitness < 1 - this.model.getInProportionThreshold() - hysteresisThreshold ) {

      // The fitness has gone away from being in proportion enough that you can now get the sound again
      this.playedSuccessYetProperty.value = false;
    }

    // if we were in ratio, but now we are not, then fade out the clip, but only fade out if the full mandatory portion
    // of the clip has played.
    if ( this.timePlayedSoFarProperty.value > MANDATORY_PLAY_TIME &&
         !isInRatio && this.outputLevel !== SILENT_LEVEL ) {
      this.setOutputLevel( SILENT_LEVEL, 0.1 );
    }

    // for testing during next step()
    this.previousRatioWasLargerThanTarget = this.calculateCurrentRatioLargerThanTarget();
    this.previousRatioWasTooSmallForSuccess = this.model.valuesTooSmallForInProportion();
  }

  /**
   * stop any in-progress sound generation
   */
  public reset(): void {
    this.stop( 0 );
    this.playedSuccessYetProperty.reset();
    this.timePlayedSoFarProperty.reset();
    this.previousRatioWasLargerThanTarget = this.calculateCurrentRatioLargerThanTarget();
    this.previousRatioWasTooSmallForSuccess = this.model.valuesTooSmallForInProportion();
    this.jumpingOverShouldSound = false;
  }
}

ratioAndProportion.register( 'InProportionSoundGenerator', InProportionSoundGenerator );

export default InProportionSoundGenerator;