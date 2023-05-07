// Copyright 2014-2023, University of Colorado Boulder

/**
 * 'Molecules' screen
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import H2ONode from '../../../nitroglycerin/js/nodes/H2ONode.js';
import Tandem from '../../../tandem/js/Tandem.js';
import RPALColors from '../common/RPALColors.js';
import reactantsProductsAndLeftovers from '../reactantsProductsAndLeftovers.js';
import ReactantsProductsAndLeftoversStrings from '../ReactantsProductsAndLeftoversStrings.js';
import MoleculesModel from './model/MoleculesModel.js';
import MoleculesScreenView from './view/MoleculesScreenView.js';

export default class MoleculesScreen extends Screen<MoleculesModel, MoleculesScreenView> {

  public constructor( tandem: Tandem ) {

    const options = {
      name: ReactantsProductsAndLeftoversStrings.screen.moleculesStringProperty,
      backgroundColorProperty: new Property( RPALColors.SCREEN_BACKGROUND ),
      homeScreenIcon: createScreenIcon( 0.1 ),
      navigationBarIcon: createScreenIcon( 0.5 ),
      tandem: tandem
    };

    super(
      () => new MoleculesModel( tandem.createTandem( 'model' ) ),
      model => new MoleculesScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

/**
 * Creates the ScreenIcon for this screen, an H2O molecule.
 */
function createScreenIcon( moleculeLineWidth: number ): ScreenIcon {

  const iconNode = new H2ONode( {
    atomNodeOptions: {
      stroke: 'black',
      lineWidth: moleculeLineWidth
    }
  } );

  return new ScreenIcon( iconNode, {
    fill: 'white'
  } );
}

reactantsProductsAndLeftovers.register( 'MoleculesScreen', MoleculesScreen );