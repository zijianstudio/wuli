// Copyright 2018-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import FractionsEqualityStrings from './FractionsEqualityStrings.js';
import EqualityLabScreen from './view/EqualityLabScreen.js';
import FractionsScreen from './view/FractionsScreen.js';

const fractionsEqualityTitleStringProperty = FractionsEqualityStrings[ 'fractions-equality' ].titleStringProperty;

// constants
const tandem = Tandem.ROOT;

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
  const sim = new Sim( fractionsEqualityTitleStringProperty, [
    new EqualityLabScreen(),
    new FractionsScreen( tandem.createTandem( 'fractionsScreen' ), {
      name: FractionsEqualityStrings.screen.gameStringProperty
    } )
  ], simOptions );
  sim.start();
} );