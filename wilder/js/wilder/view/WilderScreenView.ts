// Copyright 2018-2022, University of Colorado Boulder

/**
 * @author AUTHOR
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import wilder from '../../wilder.js';
import WilderNode from './WilderNode.js';
import WilderModel from '../model/WilderModel.js';
import Tandem from '../../../../tandem/js/Tandem.js';

type WilderScreenViewOptions = {
  tandem: Tandem;
};

class WilderScreenView extends ScreenView {
  public constructor( wilderModel: WilderModel, providedOptions: WilderScreenViewOptions ) {
    super( providedOptions );

    const wilderNode = new WilderNode( { x: 100, y: 100 } );
    wilderNode.flipOver();
    this.addChild( wilderNode );

    // Reset All button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        wilderModel.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
      tandem: providedOptions.tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );
  }
}

wilder.register( 'WilderScreenView', WilderScreenView );
export default WilderScreenView;