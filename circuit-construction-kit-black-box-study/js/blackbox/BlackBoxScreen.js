// Copyright 2016-2023, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * The 'Black Box' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Property from '../../../axon/js/Property.js';
import CCKCConstants from '../../../circuit-construction-kit-common/js/CCKCConstants.js';
import CCKCColors from '../../../circuit-construction-kit-common/js/view/CCKCColors.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Rectangle } from '../../../scenery/js/imports.js';
import circuitConstructionKitBlackBoxStudy from '../circuitConstructionKitBlackBoxStudy.js';
import BlackBoxModel from './model/BlackBoxModel.js';
import BlackBoxNode from './view/BlackBoxNode.js';
import BlackBoxScreenView from './view/BlackBoxScreenView.js';

// constants
const BACKGROUND_COLOR = CCKCColors.screenBackgroundColorProperty;

class BlackBoxScreen extends Screen {

  constructor( tandem ) {

    const icon = new Rectangle( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
      fill: BACKGROUND_COLOR
    } );
    const blackBoxNode = new BlackBoxNode( 220, 160, new BooleanProperty( true ) );
    blackBoxNode.mutate( {
      scale: icon.width / blackBoxNode.bounds.width / 2,
      centerX: icon.centerX,
      centerY: icon.centerY
    } );
    icon.addChild( blackBoxNode );

    const options = {
      name: new Property( 'Black Box' ), //TODO i18n
      homeScreenIcon: new ScreenIcon( icon, {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem,
      maxDT: CCKCConstants.MAX_DT
    };

    super(
      () => new BlackBoxModel( tandem.createTandem( 'model' ) ),
      model => new BlackBoxScreenView( model, tandem.createTandem( 'view' ) ),
      options );
  }
}

circuitConstructionKitBlackBoxStudy.register( 'BlackBoxScreen', BlackBoxScreen );
export default BlackBoxScreen;