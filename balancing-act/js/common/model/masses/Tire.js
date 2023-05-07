// Copyright 2014-2021, University of Colorado Boulder


import tire_png from '../../../../images/tire_png.js';
import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

// constants
const MASS = 15; // In kg
const HEIGHT = 0.13; // In meters

class Tire extends ImageMass {

  /**
   * @param initialPosition
   * @param isMystery
   */
  constructor( initialPosition, isMystery ) {
    super( MASS, tire_png, HEIGHT, initialPosition, isMystery );
  }
}

balancingAct.register( 'Tire', Tire );

export default Tire;