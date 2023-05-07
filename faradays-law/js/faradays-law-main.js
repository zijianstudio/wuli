// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main entry point for the 'Faradays Law' sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import FaradaysLawScreen from './faradays-law/FaradaysLawScreen.js';
import FaradaysLawStrings from './FaradaysLawStrings.js';

// constants
const faradaysLawTitleStringProperty = FaradaysLawStrings[ 'faradays-law' ].titleStringProperty;

const simOptions = {
  credits: {
    leadDesign: 'Michael Dubson, Bryce Gruneich',
    softwareDevelopment: 'Michael Barlow, John Blanco, Jonathan Olson',
    team: 'Emily B. Moore, Ariel Paul, Kathy Perkins, Amy Rouinfar, Taliesin Smith',
    soundDesign: 'Ashton Morris, Mike Winters',
    qualityAssurance: 'Jaspe Arias, Steele Dalton, Brooklyn Lash, Elise Morgan, Liam Mulhall,<br>' +
                      'Oliver Orejola, Devon Quispe, Kathryn Woessner, Bryan Yoelin',
    contributors: 'Jonathan Hung & Caren Watkins (Inclusive Design Research Centre)',
    thanks: 'Thanks to Mobile Learner Labs for working with the PhET development team to convert this simulation ' +
            'to HTML5.'
  }
};

// Create and start the sim
simLauncher.launch( () => {
  const sim = new Sim( faradaysLawTitleStringProperty, [
    new FaradaysLawScreen( Tandem.ROOT.createTandem( 'faradaysLawScreen' ) )
  ], simOptions );
  sim.start();
} );