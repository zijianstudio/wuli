// Copyright 2014-2021, University of Colorado Boulder


import woodCrateTall_png from '../../../../images/woodCrateTall_png.js';
import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

// constants
const MASS = 45; // In kg
const HEIGHT = 0.6; // In meters

class Crate extends ImageMass {

  /**
   * @param initialPosition
   * @param isMystery
   */
  constructor( initialPosition, isMystery ) {
    super( MASS, woodCrateTall_png, HEIGHT, initialPosition, isMystery );
  }
}

balancingAct.register( 'Crate', Crate );

export default Crate;