// Copyright 2014-2021, University of Colorado Boulder

/**
 * Photon beam for single bulb view
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import { CanvasNode } from '../../../../scenery/js/imports.js';
import colorVision from '../../colorVision.js';

class SingleBulbPhotonBeamNode extends CanvasNode {

  /**
   * @param {SingleBulbModel} model
   * @param {Tandem} tandem
   * @param {Object} [options], must contain a canvasBounds attribute of type Bounds2
   */
  constructor( model, tandem, options ) {
    options.tandem = tandem;

    super( options );

    this.photons = model.photonBeam.photons;

    model.beamTypeProperty.link( beamType => {
      this.visible = ( beamType === 'photon' );
    } );

    this.invalidatePaint();

    model.photonBeam.repaintEmitter.addListener( () => {
      this.invalidatePaint();
    } );
  }


  /**
   * @param {CanvasRenderingContext2D} context
   * @private
   */
  paintCanvas( context ) {

    for ( let i = 0; i < this.photons.length; i++ ) {
      context.fillStyle = this.photons[ i ].color.toCSS();
      context.fillRect( this.photons[ i ].position.x, this.photons[ i ].position.y, 3, 2 );
    }
  }

  // @public
  step( dt ) {
    this.invalidatePaint();
  }
}

colorVision.register( 'SingleBulbPhotonBeamNode', SingleBulbPhotonBeamNode );

export default SingleBulbPhotonBeamNode;
