// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Martin Veillette (Berea College)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import LeastSquaresRegressionScreen from './least-squares-regression/LeastSquaresRegressionScreen.js';
import LeastSquaresRegressionStrings from './LeastSquaresRegressionStrings.js';

const leastSquaresRegressionTitleStringProperty = LeastSquaresRegressionStrings[ 'least-squares-regression' ].titleStringProperty;

const simOptions = {
  credits: {
    leadDesign: 'Amanda McGarry',
    softwareDevelopment: 'Martin Veillette',
    team: 'Trish Loeblein, Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Steele Dalton, Bryan Yoelin'
  }
};

simLauncher.launch( () => {
  const sim = new Sim( leastSquaresRegressionTitleStringProperty, [ new LeastSquaresRegressionScreen() ], simOptions );
  sim.start();
} );