// Copyright 2013-2021, University of Colorado Boulder


import trashCan_png from '../../../../images/trashCan_png.js';
import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

// constants
const MASS = 30; // In kg
const HEIGHT = 0.65; // In meters

class MediumTrashCan extends ImageMass {

  /**
   * @param initialPosition
   * @param isMystery
   */
  constructor( initialPosition, isMystery ) {
    super( MASS, trashCan_png, HEIGHT, initialPosition, isMystery );
  }
}

balancingAct.register( 'MediumTrashCan', MediumTrashCan );

export default MediumTrashCan;