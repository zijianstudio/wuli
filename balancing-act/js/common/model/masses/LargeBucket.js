// Copyright 2014-2021, University of Colorado Boulder


import metalBucket_png from '../../../../images/metalBucket_png.js';
import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

// constants
const MASS = 15; // In kg
const HEIGHT = 0.5; // In meters

class LargeBucket extends ImageMass {

  /**
   * @param initialPosition
   * @param isMystery
   */
  constructor( initialPosition, isMystery ) {
    super( MASS, metalBucket_png, HEIGHT, initialPosition, isMystery );
  }
}

balancingAct.register( 'LargeBucket', LargeBucket );

export default LargeBucket;