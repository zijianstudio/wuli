// Copyright 2018-2022, University of Colorado Boulder

/**
 * @author AUTHOR
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import Tandem from '../../../tandem/js/Tandem.js';
import wilder from '../wilder.js';
import WilderModel from './model/WilderModel.js';
import WilderScreenView from './view/WilderScreenView.js';

type WilderScreenOptions = {
  tandem: Tandem;
};

class WilderScreen extends Screen<WilderModel, WilderScreenView> {
  public constructor( providedOptions: WilderScreenOptions ) {

    const options = {
      backgroundColorProperty: new Property( 'white' ),
      tandem: providedOptions.tandem
    };

    super( () => new WilderModel( {
        tandem: providedOptions.tandem.createTandem( 'model' )
      } ),
      model => new WilderScreenView( model, {
        tandem: providedOptions.tandem.createTandem( 'view' )
      } ),
      options
    );
  }
}

wilder.register( 'WilderScreen', WilderScreen );
export default WilderScreen;