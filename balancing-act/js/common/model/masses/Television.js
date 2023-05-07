// Copyright 2014-2021, University of Colorado Boulder


import oldTelevision_png from '../../../../images/oldTelevision_png.js';
import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

// constants
const MASS = 10; // In kg
const HEIGHT = 0.5; // In meters

class Television extends ImageMass {

  /**
   * @param initialPosition
   * @param isMystery
   */
  constructor( initialPosition, isMystery ) {
    super( MASS, oldTelevision_png, HEIGHT, initialPosition, isMystery );
  }
}

balancingAct.register( 'Television', Television );

export default Television;