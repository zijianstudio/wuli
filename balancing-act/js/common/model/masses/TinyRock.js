// Copyright 2013-2021, University of Colorado Boulder


import tinyRock_png from '../../../../images/tinyRock_png.js';
import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

// constants
const MASS = 4; // In kg
const HEIGHT = 0.09; // In meters

class TinyRock extends ImageMass {

  /**
   * @param initialPosition
   * @param isMystery
   */
  constructor( initialPosition, isMystery ) {
    super( MASS, tinyRock_png, HEIGHT, initialPosition, isMystery );
  }
}

balancingAct.register( 'TinyRock', TinyRock );

export default TinyRock;