// Copyright 2019-2022, University of Colorado Boulder

/**
 * Main entry point for the demo and test harness for this library.
 *
 * @author Jesse Greenberg
 */

import Sim, { SimOptions } from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import BasicsScreen from './demo/basics/BasicsScreen.js';
import PatternsScreen from './demo/patterns/PatternsScreen.js';
import TappiStrings from './TappiStrings.js';

const tappiTitleStringProperty = TappiStrings.tappi.titleStringProperty;

const simOptions: SimOptions = {
  credits: {
    //TODO fill in credits, all of these fields are optional, see joist.CreditsNode
    leadDesign: '',
    softwareDevelopment: '',
    team: '',
    qualityAssurance: '',
    graphicArts: '',
    soundDesign: '',
    thanks: ''
  }
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {
  const sim = new Sim( tappiTitleStringProperty, [
    new BasicsScreen( Tandem.ROOT.createTandem( 'basicsScreen' ) ),
    new PatternsScreen()
  ], simOptions );
  sim.start();
} );