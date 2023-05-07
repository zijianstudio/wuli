// Copyright 2013-2021, University of Colorado Boulder

/**
 * Base type for a model element that represents a person, a.k.a. a human, in
 * the model.  The human can be grabbed from a toolbox and placed on a
 * balance, so there needs to be a standing and sitting image representation.
 *
 * @author John Blanco
 */

import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

class HumanMass extends ImageMass {

  /**
   * @param {number} massValue
   * @param {image} standingImage
   * @param {number} standingHeight
   * @param {image} sittingImage
   * @param {number} sittingHeight
   * @param {Vector2} initialPosition
   * @param {number} sittingCenterOfMassXOffset
   * @param {boolean} isMystery
   */
  constructor( massValue, standingImage, standingHeight, sittingImage, sittingHeight, initialPosition, sittingCenterOfMassXOffset, isMystery ) {
    super( massValue, standingImage, standingHeight, initialPosition, isMystery );

    // Monitor the 'onPlank' property and update the image as changes occur.
    this.onPlankProperty.link( onPlank => {
      if ( onPlank ) {
        const xPosition = this.positionProperty.get().x;
        this.centerOfMassXOffset = sittingCenterOfMassXOffset * ( xPosition < 0 ? -1 : 1 );
        this.heightProperty.set( sittingHeight );
        this.reverseImage = xPosition < 0;
        this.imageProperty.set( sittingImage );
      }
      else {
        this.centerOfMassXOffset = 0;
        this.heightProperty.set( standingHeight );
        this.reverseImage = false;
        this.imageProperty.set( standingImage );
      }
    } );
  }
}

balancingAct.register( 'HumanMass', HumanMass );

export default HumanMass;