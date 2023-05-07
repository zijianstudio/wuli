// Copyright 2013-2022, University of Colorado Boulder

/**
 * Main entry point for the 'Concentration' sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BLLSim from '../../beers-law-lab/js/common/view/BLLSim.js';
import ConcentrationScreen from '../../beers-law-lab/js/concentration/ConcentrationScreen.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import ConcentrationStrings from './ConcentrationStrings.js';

simLauncher.launch( () => {
  const screens = [
    new ConcentrationScreen( Tandem.ROOT.createTandem( 'concentrationScreen' ) )
  ];
  const sim = new BLLSim( ConcentrationStrings.concentration.titleStringProperty, screens );
  sim.start();
} );