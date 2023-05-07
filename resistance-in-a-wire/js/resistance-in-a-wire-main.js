// Copyright 2013-2022, University of Colorado Boulder

/**
 * Main entry point for the "resistance in a wire" sim.
 * @author Vasily Shakhov (Mlearner)
 * @author Anton Ulyanov (Mlearner)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import ResistanceInAWireScreen from './resistance-in-a-wire/ResistanceInAWireScreen.js';
import ResistanceInAWireStrings from './ResistanceInAWireStrings.js';

// constants
const tandem = Tandem.ROOT;

const resistanceInAWireTitleStringProperty = ResistanceInAWireStrings[ 'resistance-in-a-wire' ].titleStringProperty;

const simOptions = {
  credits: {
    leadDesign: 'Michael Dubson',
    softwareDevelopment: 'Michael Dubson, John Blanco, Jesse Greenberg, Michael Kauzmann',
    team: 'Wendy Adams, Mindy Gratny, Emily B. Moore, Ariel Paul, Taliesin Smith, Brianna Tomlinson',
    qualityAssurance: 'Steele Dalton, Kerrie Dochen, Alex Dornan, Bryce Griebenow, Ethan Johnson, Megan Lai, ' +
                      'Elise Morgan, Liam Mulhall, Oliver Orejola, Arnab Purkayastha, Laura Rea, Benjamin Roberts, ' +
                      'Jacob Romero, Clara Wilson, Kathryn Woessner, Kelly Wurtz, Bryan Yoelin',
    thanks: 'Thanks to Mobile Learner Labs for working with the PhET development team to convert this ' +
            'simulation to HTML5.',
    soundDesign: 'Ashton Morris, Mike Winters'
  }
};

simLauncher.launch( () => {

  // Create and start the sim
  const sim = new Sim( resistanceInAWireTitleStringProperty,
    [ new ResistanceInAWireScreen( tandem.createTandem( 'resistanceInAWireScreen' ) ) ], simOptions );
  sim.start();
} );