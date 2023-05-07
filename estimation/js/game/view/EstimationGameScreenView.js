// Copyright 2014-2021, University of Colorado Boulder

import ScreenView from '../../../../joist/js/ScreenView.js';
import { Image } from '../../../../scenery/js/imports.js';
import screenshot01Temp_jpg from '../../../images/screenshot01Temp_jpg.js';
import EstimationConstants from '../../common/EstimationConstants.js';
import estimation from '../../estimation.js';

class EstimationGameScreenView extends ScreenView {

  constructor() {
    super( { layoutBounds: EstimationConstants.LAYOUT_BOUNDS } );

    // TODO: Temp for quick demo
    this.addChild( new Image( screenshot01Temp_jpg, {
      scale: 0.75,
      centerX: this.layoutBounds.centerX,
      centerY: this.layoutBounds.centerY
    } ) );
  }
}

estimation.register( 'EstimationGameScreenView', EstimationGameScreenView );
export default EstimationGameScreenView;