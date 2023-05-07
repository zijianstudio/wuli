// Copyright 2018-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import BounceScreen from './bounce/BounceScreen.js';
import LabScreen from './lab/LabScreen.js';
import MassesAndSpringsBasicsStrings from './MassesAndSpringsBasicsStrings.js';
import StretchScreen from './stretch/StretchScreen.js';

const massesAndSpringsBasicsTitleStringProperty = MassesAndSpringsBasicsStrings[ 'masses-and-springs-basics' ].titleStringProperty;

// constants
const tandem = Tandem.ROOT;
const simOptions = {
  credits: {
    leadDesign: 'Amy Rouinfar, Mike Dubson',
    softwareDevelopment: 'Denzell Barnett',
    team: 'Wendy Adams, Ariel Paul, Kathy Perkins in cooperation with the Next-Lab project',
    qualityAssurance: 'Megan Lai, Liam Mulhall, Laura Rea, Jacob Romero, Kathryn Woessner'
  }
};

simLauncher.launch( () => {
  const sim = new Sim( massesAndSpringsBasicsTitleStringProperty, [
    new StretchScreen( tandem.createTandem( 'stretchScreen' ) ),
    new BounceScreen( tandem.createTandem( 'bounceScreen' ) ),
    new LabScreen( tandem.createTandem( 'labScreen' ) )
  ], simOptions );
  sim.start();
} );