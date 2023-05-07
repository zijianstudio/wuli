// Copyright 2020-2022, University of Colorado Boulder

/**
 * A looped sound that plays when both hands are moving in the same direction, and in proportion
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Multilink from '../../../../../axon/js/Multilink.js';
import optionize, { EmptySelfOptions } from '../../../../../phet-core/js/optionize.js';
import CompositeSoundClip from '../../../../../tambo/js/sound-generators/CompositeSoundClip.js';
import SoundGenerator, { SoundGeneratorOptions } from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import movingInProportionChoirLoop_mp3 from '../../../../sounds/moving-in-proportion/movingInProportionChoirLoop_mp3.js';
import movingInProportionOrganLoop_mp3 from '../../../../sounds/moving-in-proportion/movingInProportionOrganLoop_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import RAPModel from '../../model/RAPModel.js';

class MovingInProportionSoundGenerator extends SoundGenerator {

  private movingInProportionSoundClip: CompositeSoundClip;

  public constructor( model: RAPModel, providedOptions?: SoundGeneratorOptions ) {

    const options = optionize<SoundGeneratorOptions, EmptySelfOptions>()( {
      initialOutputLevel: 0.13
    }, providedOptions );

    super( options );

    this.movingInProportionSoundClip = new CompositeSoundClip( [
      {
        sound: movingInProportionChoirLoop_mp3,
        options: {
          loop: true,
          trimSilence: true
        }
      },
      {
        sound: movingInProportionOrganLoop_mp3,
        options: {
          loop: true,
          initialOutputLevel: 0.6,
          trimSilence: true
        }
      }
    ] );
    this.movingInProportionSoundClip.connect( this.soundSourceDestination );

    Multilink.multilink( [
      model.ratio.movingInDirectionProperty,
      model.inProportionProperty,
      model.ratio.tupleProperty,
      model.ratioFitnessProperty
    ], ( movingInDirection, inProportion, tuple, ratioFitness ) => {
      if ( movingInDirection && // only when moving
           !model.valuesTooSmallForInProportion() && // no moving in proportion success if too small
           inProportion && // must be fit enough to play the moving in proportion success
           !model.ratioEvenButNotAtTarget()  // don't allow this sound if target isn't 1 but both values are 1
      ) {
        this.movingInProportionSoundClip.setOutputLevel( 1, 0.1 );
        !this.movingInProportionSoundClip.isPlaying && this.movingInProportionSoundClip.play();
      }
      else {
        this.movingInProportionSoundClip.setOutputLevel( 0, 0.2 );
      }
    } );
  }

  /**
   * stop any in-progress sound generation
   */
  public reset(): void {
    this.movingInProportionSoundClip.stop();
  }
}

ratioAndProportion.register( 'MovingInProportionSoundGenerator', MovingInProportionSoundGenerator );

export default MovingInProportionSoundGenerator;