// Copyright 2020-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 * @author Saurabh Totey
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import NLDExploreScreen from './explore/NLDExploreScreen.js';
import NLDGenericScreen from './generic/NLDGenericScreen.js';
import NumberLineDistanceStrings from './NumberLineDistanceStrings.js';

const numberLineDistanceTitleStringProperty = NumberLineDistanceStrings[ 'number-line-distance' ].titleStringProperty;

const simOptions = {
  credits: {
    leadDesign: 'Amanda McGarry',
    softwareDevelopment: 'John Blanco, Saurabh Totey',
    team: 'Kathy Perkins, Ian Whitacre',
    qualityAssurance: 'Steele Dalton, Emily Miller, Devon Quispe, Nancy Salpepi, Kathryn Woessner',
    graphicArts: 'Mariah Hermsmeyer, Megan Lai'
  }
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {
  const screens = [
    new NLDExploreScreen( Tandem.ROOT.createTandem( 'exploreScreen' ) ),
    new NLDGenericScreen( Tandem.ROOT.createTandem( 'genericScreen' ) )
  ];
  const sim = new Sim( numberLineDistanceTitleStringProperty, screens, simOptions );
  sim.start();
} );
