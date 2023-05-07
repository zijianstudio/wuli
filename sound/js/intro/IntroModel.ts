// Copyright 2022, University of Colorado Boulder
/**
 * Model for the single source scene.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import SoundConstants from '../common/SoundConstants.js';
import sound from '../sound.js';
import SoundModel from '../common/model/SoundModel.js';

export default class IntroModel extends SoundModel {

  // indicates the user selection for the audio control setting
  public readonly audioControlSettingProperty: Property<'SPEAKER' | 'LISTENER'>;
  public readonly listenerPositionProperty: Vector2Property;

  public constructor() {
    super();

    this.audioControlSettingProperty = new Property( 'SPEAKER', {
      validValues: [ 'SPEAKER', 'LISTENER' ]
    } );

    this.listenerPositionProperty = new Vector2Property( new Vector2( 1 / 2 * SoundConstants.WAVE_AREA_WIDTH, SoundConstants.WAVE_AREA_WIDTH / 2 ) );
  }

  public override reset(): void {
    super.reset();

    this.isAudioEnabledProperty.reset();
    this.audioControlSettingProperty.reset();
    this.listenerPositionProperty.reset();
  }
}

sound.register( 'IntroModel', IntroModel );