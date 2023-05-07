// Copyright 2019-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import NLIExploreScreen from './explore/NLIExploreScreen.js';
import NLIGenericScreen from './generic/NLIGenericScreen.js';
import NumberLineIntegersStrings from './NumberLineIntegersStrings.js';

const numberLineIntegersTitleStringProperty = NumberLineIntegersStrings[ 'number-line-integers' ].titleStringProperty;

const simOptions = {
  credits: {
    leadDesign: 'Amanda McGarry',
    softwareDevelopment: 'John Blanco, Chris Klusendorf, Saurabh Totey',
    team: 'Ariel Paul, Kathy Perkins, and in cooperation with the Next-Lab project',
    qualityAssurance: 'Logan Bray, Liam Mulhall, Jacob Romero, Kathryn Woessner',
    graphicArts: 'Megan Lai',
    soundDesign: '',
    thanks: ''
  }
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {
  const screens = [
    new NLIExploreScreen( Tandem.ROOT.createTandem( 'exploreScreen' ) ),
    new NLIGenericScreen( Tandem.ROOT.createTandem( 'genericScreen' ) )
  ];
  const sim = new Sim( numberLineIntegersTitleStringProperty, screens, simOptions );
  sim.start();
} );