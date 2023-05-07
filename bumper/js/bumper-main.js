// Copyright 2018-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson
 */

import ChainsScreen from '../../chains/js/chains/ChainsScreen.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import BumperStrings from './BumperStrings.js';

const bumperTitleStringProperty = BumperStrings.bumper.titleStringProperty;

const tandem = Tandem.ROOT;

const simOptions = {
  credits: {
    softwareDevelopment: 'PhET Interactive Simulations'
  }
};

simLauncher.launch( () => {
  const sim = new Sim( bumperTitleStringProperty, [ new ChainsScreen( tandem.createTandem( 'chainsScreen' ) ) ], simOptions );
  sim.start();
} );