// Copyright 2013-2021, University of Colorado Boulder

/**
 * Model element that represents a boy who is roughly 6 years old.  The data
 * for his height and weight came from:
 * http://www.disabled-world.com/artman/publish/height-weight-teens.shtml
 *
 * @author John Blanco
 */

import Vector2 from '../../../../../dot/js/Vector2.js';
import boySitting_png from '../../../../mipmaps/boySitting_png.js';
import boyStanding_png from '../../../../mipmaps/boyStanding_png.js';
import balancingAct from '../../../balancingAct.js';
import HumanMass from './HumanMass.js';

// constants
const MASS = 20; // in kg
const STANDING_HEIGHT = 1.1; // In meters.
const SITTING_HEIGHT = 0.65; // In meters.
const SITTING_CENTER_OF_MASS_X_OFFSET = 0.1; // In meters, determined visually.  Update if image changes.

class Boy extends HumanMass {

  constructor() {
    super( MASS, boyStanding_png, STANDING_HEIGHT, boySitting_png, SITTING_HEIGHT,
      Vector2.ZERO, SITTING_CENTER_OF_MASS_X_OFFSET, false );
    this.centerOfMassXOffset = 0.03; // Empirically determined.
  }
}

balancingAct.register( 'Boy', Boy );

export default Boy;