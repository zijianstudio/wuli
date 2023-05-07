// Copyright 2018-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import BuildAFractionStrings from './BuildAFractionStrings.js';
import BuildAFractionScreen from './view/BuildAFractionScreen.js';
import LabScreen from './view/LabScreen.js';
import MixedNumbersScreen from './view/MixedNumbersScreen.js';

const buildAFractionTitleStringProperty = BuildAFractionStrings[ 'build-a-fraction' ].titleStringProperty;

const simOptions = {
  credits: {
    leadDesign: 'Ariel Paul',
    softwareDevelopment: 'Jonathan Olson, Sam Reid',
    team: 'Mike Dubson, Karina K. R. Hensberry, Trish Loeblein, Amanda McGarry, Kathy Perkins',
    qualityAssurance: 'Steele Dalton, Megan Lai, Liam Mulhall, Laura Rea, Jacob Romero, Kathryn Woessner, and Kelly Wurtz',
    graphicArts: '',
    thanks: ''
  }
};

simLauncher.launch( () => {
  const sim = new Sim( buildAFractionTitleStringProperty, [
    new BuildAFractionScreen(),
    new MixedNumbersScreen(),
    new LabScreen()
  ], simOptions );
  sim.start();
} );