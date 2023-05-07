// Copyright 2014-2021, University of Colorado Boulder


import blueBucket_png from '../../../../images/blueBucket_png.js';
import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

// constants
const MASS = 3; // In kg
const HEIGHT = 0.3; // In meters

class SmallBucket extends ImageMass {

  /**
   * @param initialPosition
   * @param isMystery
   */
  constructor( initialPosition, isMystery ) {
    super( MASS, blueBucket_png, HEIGHT, initialPosition, isMystery );
  }
}

balancingAct.register( 'SmallBucket', SmallBucket );

export default SmallBucket;