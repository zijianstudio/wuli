// Copyright 2014-2021, University of Colorado Boulder


import barrel_png from '../../../../images/barrel_png.js';
import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

// constants
const MASS = 90; // In kg
const HEIGHT = 0.75; // In meters

class Barrel extends ImageMass {

  /**
   * @param initialPosition
   * @param isMystery
   */
  constructor( initialPosition, isMystery ) {
    super( MASS, barrel_png, HEIGHT, initialPosition, isMystery );
  }
}

balancingAct.register( 'Barrel', Barrel );

export default Barrel;