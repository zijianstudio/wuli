// Copyright 2014-2021, University of Colorado Boulder


import pottedPlant_png from '../../../../images/pottedPlant_png.js';
import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

// constants
const MASS = 10; // In kg
const HEIGHT = 0.65; // In meters

class PottedPlant extends ImageMass {

  /**
   * @param initialPosition
   * @param isMystery
   */
  constructor( initialPosition, isMystery ) {
    super( MASS, pottedPlant_png, HEIGHT, initialPosition, isMystery );
  }
}

balancingAct.register( 'PottedPlant', PottedPlant );

export default PottedPlant;