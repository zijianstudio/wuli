// Copyright 2013-2021, University of Colorado Boulder

/**
 * View for the 'Blast' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import blast from '../../blast.js';
import ParticleNode from './ParticleNode.js';

class BlastScreenView extends ScreenView {

  /**
   * @param {BlastModel} model
   * @param {Color|string} particleColor
   * @param {Tandem} tandem
   */
  constructor( model, particleColor, tandem ) {
    super( { cssTransform: true, tandem: tandem } );
    this.addChild( new ParticleNode( model.particle, particleColor, tandem.createTandem( 'particleNode' ) ) );
  }
}

blast.register( 'BlastScreenView', BlastScreenView );
export default BlastScreenView;