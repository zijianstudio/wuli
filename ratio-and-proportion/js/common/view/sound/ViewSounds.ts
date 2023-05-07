// Copyright 2020-2022, University of Colorado Boulder

/**
 * A collection of the sounds associated with sim-specific view components making sounds. In general these have nothing
 * to do with model values, or the state of the model, but instead supply supplemental sound based on interaction input.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import merge from '../../../../../phet-core/js/merge.js';
import SoundClip, { SoundClipOptions } from '../../../../../tambo/js/sound-generators/SoundClip.js';
import SoundLevelEnum from '../../../../../tambo/js/SoundLevelEnum.js';
import soundManager, { SoundGeneratorAddOptions } from '../../../../../tambo/js/soundManager.js';
import grab_mp3 from '../../../../../tambo/sounds/grab_mp3.js';
import release_mp3 from '../../../../../tambo/sounds/release_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import rapConstants from '../../rapConstants.js';
import TickMarkView from '../TickMarkView.js';
import BoundarySoundClip from './BoundarySoundClip.js';
import TickMarkBumpSoundClip from './TickMarkBumpSoundClip.js';
import Property from '../../../../../axon/js/Property.js';
import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import optionize from '../../../../../phet-core/js/optionize.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';

const TOTAL_RANGE = rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE;

type SelfOptions = {

  addSoundOptions?: SoundGeneratorAddOptions;
  soundClipOptions?: SoundClipOptions;
};

type ViewSoundsOptions = SelfOptions;

class ViewSounds {

  public readonly grabSoundClip: SoundClip;
  public readonly releaseSoundClip: SoundClip;
  public readonly boundarySoundClip: BoundarySoundClip;
  public readonly tickMarkBumpSoundClip: TickMarkBumpSoundClip;

  public constructor( tickMarkRangeProperty: Property<number>, tickMarkViewProperty: EnumerationProperty<TickMarkView>,
                      playTickMarkBumpSoundProperty: TReadOnlyProperty<boolean>, providedOptions?: ViewSoundsOptions ) {

    const options = optionize<ViewSoundsOptions>()( {
      addSoundOptions: {
        categoryName: 'user-interface'
      },
      soundClipOptions: {
        initialOutputLevel: 0.15
      }
    }, providedOptions );

    this.grabSoundClip = new SoundClip( grab_mp3, options.soundClipOptions );
    this.releaseSoundClip = new SoundClip( release_mp3, options.soundClipOptions );
    this.boundarySoundClip = new BoundarySoundClip( TOTAL_RANGE, merge( {}, options.soundClipOptions, {
      initialOutputLevel: 0.3 // increased from feedback in https://github.com/phetsims/ratio-and-proportion/issues/246
    } ) );
    this.tickMarkBumpSoundClip = new TickMarkBumpSoundClip( tickMarkRangeProperty, TOTAL_RANGE, merge( {}, options.soundClipOptions, {
      initialOutputLevel: 0.3, // increased from feedback in https://github.com/phetsims/ratio-and-proportion/issues/246
      enableControlProperties: [
        playTickMarkBumpSoundProperty,
        new DerivedProperty( [ tickMarkViewProperty ], tickMarkView => tickMarkView !== TickMarkView.NONE )
      ]
    } ) );

    soundManager.addSoundGenerator( this.grabSoundClip, options.addSoundOptions );
    soundManager.addSoundGenerator( this.releaseSoundClip, options.addSoundOptions );
    soundManager.addSoundGenerator( this.boundarySoundClip, options.addSoundOptions );
    soundManager.addSoundGenerator( this.tickMarkBumpSoundClip, merge( {
      sonificationLevel: SoundLevelEnum.EXTRA
    }, options.addSoundOptions ) );
  }

  public reset(): void {
    this.boundarySoundClip.reset();
    this.tickMarkBumpSoundClip.reset();
  }
}

ratioAndProportion.register( 'ViewSounds', ViewSounds );

export default ViewSounds;