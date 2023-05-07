// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main entry point for the 'Estimation' sim.
 *
 * @author John Blanco
 */

import Property from '../../axon/js/Property.js';
import Screen from '../../joist/js/Screen.js';
import ScreenIcon from '../../joist/js/ScreenIcon.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import { Image } from '../../scenery/js/imports.js';
import exploreScreenIcon_png from '../images/exploreScreenIcon_png.js';
import gameScreenIcon_png from '../images/gameScreenIcon_png.js';
import EstimationStrings from './EstimationStrings.js';
import ExploreModel from './explore/model/ExploreModel.js';
import ExploreScreenView from './explore/view/ExploreScreenView.js';
import EstimationGameModel from './game/model/EstimationGameModel.js';
import EstimationGameScreenView from './game/view/EstimationGameScreenView.js';

// strings and images
const estimationTitleStringProperty = EstimationStrings.estimation.titleStringProperty;

const simOptions = {
  credits: {
    leadDesign: 'Bryce Gruneich',
    softwareDevelopment: 'John Blanco',
    team: 'Michael Dubson, Karina K. R. Hensberry, Ariel Paul, Kathy Perkins'
  }
};

simLauncher.launch( () => {

  //Create and start the sim
  new Sim( estimationTitleStringProperty, [

    // Explore screen
    new Screen(
      () => new ExploreModel(),
      model => new ExploreScreenView( model ),
      {
        name: EstimationStrings.exploreStringProperty,
        backgroundColorProperty: new Property( 'rgb( 255, 248, 186 )' ),
        homeScreenIcon: new ScreenIcon( new Image( exploreScreenIcon_png ), {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } )
      }
    ),

    // Game screen
    new Screen(
      () => new EstimationGameModel(),
      model => new EstimationGameScreenView( model ),
      {
        name: EstimationStrings.gameStringProperty,
        backgroundColorProperty: new Property( 'rgb( 255, 248, 186 )' ),
        homeScreenIcon: new ScreenIcon( new Image( gameScreenIcon_png ), {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } )
      }
    )
  ], simOptions ).start();
} );