// Copyright 2013-2021, University of Colorado Boulder

/**
 * Model class that represents an adult male.
 *
 * @author John Blanco
 */

import Vector2 from '../../../../../dot/js/Vector2.js';
import manSitting_png from '../../../../mipmaps/manSitting_png.js';
import manStanding_png from '../../../../mipmaps/manStanding_png.js';
import balancingAct from '../../../balancingAct.js';
import HumanMass from './HumanMass.js';

// constants
const MASS = 80; // in kg
const STANDING_HEIGHT = 1.8; // In meters.
const SITTING_HEIGHT = 0.9; // In meters.
const SITTING_CENTER_OF_MASS_X_OFFSET = 0.1; // In meters, determined visually.  Update if image changes.

class Man extends HumanMass {

  constructor() {
    super( MASS, manStanding_png, STANDING_HEIGHT, manSitting_png, SITTING_HEIGHT,
      Vector2.ZERO, SITTING_CENTER_OF_MASS_X_OFFSET, false );
  }
}

balancingAct.register( 'Man', Man );

export default Man;