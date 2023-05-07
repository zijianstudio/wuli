// Copyright 2020-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import NLOChipsScreen from './chips/NLOChipsScreen.js';
import NLOGenericScreen from './generic/NLOGenericScreen.js';
import NLONetWorthScreen from './net-worth/NLONetWorthScreen.js';
import NumberLineOperationsStrings from './NumberLineOperationsStrings.js';
import NLOOperationsScreen from './operations/NLOOperationsScreen.js';

const numberLineOperationsTitleStringProperty = NumberLineOperationsStrings[ 'number-line-operations' ].titleStringProperty;

const simOptions = {
  credits: {
    leadDesign: 'Amanda McGarry',
    softwareDevelopment: 'John Blanco',
    team: 'Kathy Perkins',
    qualityAssurance: 'Logan Bray, Brooklyn Lash, Liam Mulhall, Devon Quispe, Kathryn Woessner',
    graphicArts: 'Megan Lai'
  }
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {
  const screens = [
    new NLOChipsScreen( Tandem.ROOT.createTandem( 'chipsScreen' ) ),
    new NLONetWorthScreen( Tandem.ROOT.createTandem( 'netWorthScreen' ) ),
    new NLOOperationsScreen( Tandem.ROOT.createTandem( 'operationsScreen' ) ),
    new NLOGenericScreen( Tandem.ROOT.createTandem( 'genericScreen' ) )
  ];
  const sim = new Sim( numberLineOperationsTitleStringProperty, screens, simOptions );
  sim.start();
} );
