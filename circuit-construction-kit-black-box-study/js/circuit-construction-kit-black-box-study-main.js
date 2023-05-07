// Copyright 2016-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import CircuitConstructionKitBlackBoxStudyStrings from './CircuitConstructionKitBlackBoxStudyStrings.js';
import ExploreScreen from './explore/ExploreScreen.js';

// constants
const TANDEM = Tandem.ROOT;

const circuitConstructionKitBlackBoxStudyTitleStringProperty = CircuitConstructionKitBlackBoxStudyStrings[ 'circuit-construction-kit-black-box-study' ].titleStringProperty;

const simOptions = {
  credits: {
    leadDesign: 'Amy Rouinfar',
    softwareDevelopment: 'Sam Reid',
    team: 'Michael Dubson, Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Steele Dalton, Bryce Griebenow, Elise Morgan, Ben Roberts',
    graphicArts: 'Bryce Gruneich'
  }
};

simLauncher.launch( () => {
  const sim = new Sim( circuitConstructionKitBlackBoxStudyTitleStringProperty, [
    new ExploreScreen( TANDEM.createTandem( 'exploreScreen' ) )
    // new BlackBoxScreen( TANDEM.createTandem( 'blackBoxScreen' ) )
  ], simOptions );
  sim.start();
} );