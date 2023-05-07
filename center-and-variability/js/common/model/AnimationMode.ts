// Copyright 2022-2023, University of Colorado Boulder

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import centerAndVariability from '../../centerAndVariability.js';

/**
 * AnimationMode is used to identify what type of animation a SoccerBall is undergoing.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

export class AnimationMode extends EnumerationValue {
  public static readonly FLYING = new AnimationMode();
  public static readonly STACKING = new AnimationMode();
  public static readonly NONE = new AnimationMode();
  private static readonly enumeration = new Enumeration( AnimationMode );
}

centerAndVariability.register( 'AnimationMode', AnimationMode );