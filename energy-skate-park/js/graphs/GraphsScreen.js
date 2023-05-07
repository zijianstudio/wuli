// Copyright 2018-2022, University of Colorado Boulder

/**
 * The "Graphs" screen.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import graphsScreenIcon_png from '../../images/graphsScreenIcon_png.js';
import energySkatePark from '../energySkatePark.js';
import EnergySkateParkStrings from '../EnergySkateParkStrings.js';
import GraphsModel from './model/GraphsModel.js';
import GraphsScreenView from './view/GraphsScreenView.js';

class GraphsScreen extends Screen {

  /**
   * @param {EnergySkateParkPreferencesModel} preferencesModel
   * @param {Tandem} tandem
   */
  constructor( preferencesModel, tandem ) {
    super(
      () => new GraphsModel( preferencesModel, tandem.createTandem( 'model' ) ),
      model => new GraphsScreenView( model, tandem.createTandem( 'view' ) ),
      {
        name: EnergySkateParkStrings.screens.graphsStringProperty,
        homeScreenIcon: new ScreenIcon( new Image( graphsScreenIcon_png ), {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } ),
        tandem: tandem
      }
    );
  }
}

energySkatePark.register( 'GraphsScreen', GraphsScreen );
export default GraphsScreen;