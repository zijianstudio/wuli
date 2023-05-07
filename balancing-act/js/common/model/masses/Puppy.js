// Copyright 2014-2021, University of Colorado Boulder


import puppy_png from '../../../../images/puppy_png.js';
import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

// constants
const MASS = 6; // In kg
const HEIGHT = 0.6; // In meters

class Puppy extends ImageMass {

  /**
   * @param initialPosition
   * @param isMystery
   */
  constructor( initialPosition, isMystery ) {
    super( MASS, puppy_png, HEIGHT, initialPosition, isMystery );
    this.centerOfMassXOffset = 0.03; // Empirically determined.
  }
}

balancingAct.register( 'Puppy', Puppy );

export default Puppy;