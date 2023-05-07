// Copyright 2015-2021, University of Colorado Boulder

/**
 * The 'Chains' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Screen from '../../../joist/js/Screen.js';
import chains from '../chains.js';
import ChainsView from './view/ChainsView.js';

class ChainsScreen extends Screen {
  constructor( tandem ) {
    super(
      () => {return {};},
      model => new ChainsView( model, tandem.createTandem( 'view' ) ), {
        tandem: tandem
      }
    );
  }
}

chains.register( 'ChainsScreen', ChainsScreen );
export default ChainsScreen;