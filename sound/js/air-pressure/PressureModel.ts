// Copyright 2022, University of Colorado Boulder
/**
 * Model for the pressure screen.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import SoundConstants from '../common/SoundConstants.js';
import sound from '../sound.js';
import SoundModel from '../common/model/SoundModel.js';

export default class PressureModel extends SoundModel {

  // controls the air pressure in the box.
  public readonly pressureProperty: NumberProperty;

  // indicates the user selection for the audio control setting
  public readonly audioControlSettingProperty: Property<'SPEAKER' | 'LISTENER'>;

  public readonly listenerPositionProperty: Vector2Property;

  public constructor() {
    super();

    this.pressureProperty = new NumberProperty( 1, {
      range: new Range( 0, 1 )
    } );

    this.audioControlSettingProperty = new Property( 'SPEAKER', {
      validValues: [ 'SPEAKER', 'LISTENER' ]
    } );

    this.listenerPositionProperty = new Vector2Property( new Vector2( SoundConstants.WAVE_AREA_WIDTH / 2, SoundConstants.WAVE_AREA_WIDTH / 2 ) );
  }

  /**
   * Resets the model.
   */
  public override reset(): void {
    super.reset();

    this.pressureProperty.reset();
    this.audioControlSettingProperty.reset();
    this.listenerPositionProperty.reset();
  }
}

sound.register( 'PressureModel', PressureModel );