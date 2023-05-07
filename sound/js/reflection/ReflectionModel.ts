// Copyright 2022, University of Colorado Boulder
/**
 * Model for the reflection screen.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import SoundConstants from '../common/SoundConstants.js';
import sound from '../sound.js';
import SoundModel from '../common/model/SoundModel.js';

export default class ReflectionModel extends SoundModel {

  // x coordinate of the wall origin position
  public readonly wallPositionXProperty: NumberProperty;

  // angle of the wall in radians
  public readonly wallAngleProperty: NumberProperty;

  // indicates the user selection for the sound mode control setting
  public readonly soundModeProperty: Property<'CONTINUOUS' | 'PULSE'>;

  public constructor() {
    super( {
      hasReflection: true
    } );

    this.wallPositionXProperty = new NumberProperty( 1 / 3 * SoundConstants.WAVE_AREA_WIDTH, {
      range: new Range( 1 / 3 * SoundConstants.WAVE_AREA_WIDTH, 2 / 3 * SoundConstants.WAVE_AREA_WIDTH )
    } );

    this.wallAngleProperty = new NumberProperty( Math.PI / 4, {
      range: new Range( 1 / 10 * Math.PI, 1 / 2 * Math.PI )
    } );

    this.soundModeProperty = new Property<'CONTINUOUS' | 'PULSE'>( 'CONTINUOUS', {
      validValues: [ 'CONTINUOUS', 'PULSE' ]
    } );
  }

  public override reset(): void {
    this.wallPositionXProperty.reset();
    this.wallAngleProperty.reset();
    this.soundModeProperty.reset();

    super.reset();
  }
}

sound.register( 'ReflectionModel', ReflectionModel );