// Copyright 2017-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import FractionsIntroStrings from './FractionsIntroStrings.js';
import GameScreen from './view/GameScreen.js';
import IntroScreen from './view/IntroScreen.js';
import LabScreen from './view/LabScreen.js';

const fractionsIntroTitleStringProperty = FractionsIntroStrings[ 'fractions-intro' ].titleStringProperty;

const simOptions = {
  credits: {
    leadDesign: 'Ariel Paul',
    softwareDevelopment: 'Jonathan Olson, Sam Reid, Martin Veillette',
    team: 'Mike Dubson, Trish Loeblein, Amanda McGarry, Kathy Perkins, Vincent Davis, Michael Moorer, Dusty Cole',
    qualityAssurance: 'Steele Dalton, Megan Lai, Liam Mulhall, Laura Rea, Jacob Romero, Kathryn Woessner, and Kelly Wurtz',
    graphicArts: '',
    thanks: ''
  }
};

simLauncher.launch( () => {
  const sim = new Sim( fractionsIntroTitleStringProperty, [
    new IntroScreen(),
    new GameScreen(),
    new LabScreen()
  ], simOptions );
  sim.start();
} );