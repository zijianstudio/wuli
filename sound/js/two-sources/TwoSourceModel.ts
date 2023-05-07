// Copyright 2022, University of Colorado Boulder
/**
 * Model for the twe source screen.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import SoundConstants from '../common/SoundConstants.js';
import sound from '../sound.js';
import SoundModel from '../common/model/SoundModel.js';

export default class TwoSourceModel extends SoundModel {

  // TODO: This appears elsewhere
  public readonly listenerPositionProperty: Vector2Property;
  public readonly speaker2PositionProperty: Vector2Property;

  public constructor() {
    super( {
      speaker1PositionY: 1 / 3 * SoundConstants.WAVE_AREA_WIDTH,
      hasSecondSource: true
    } );

    this.listenerPositionProperty = new Vector2Property( new Vector2( 1 / 2 * SoundConstants.WAVE_AREA_WIDTH, 1 / 2 * SoundConstants.WAVE_AREA_WIDTH ) );

    this.speaker2PositionProperty = new Vector2Property( new Vector2( this.modelToLatticeTransform.viewToModelX( SoundConstants.SOURCE_POSITION_X ), 2 / 3 * SoundConstants.WAVE_AREA_WIDTH ) );
  }

  /**
   * Resets the model.
   */
  public override reset(): void {
    super.reset();

    this.isAudioEnabledProperty.reset();
    this.listenerPositionProperty.reset();
    this.speaker2PositionProperty.reset();
  }
}

sound.register( 'TwoSourceModel', TwoSourceModel );