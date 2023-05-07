// Copyright 2013-2022, University of Colorado Boulder

/**
 * Main entry point for the 'pH Scale' sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import PHScaleConstants from './common/PHScaleConstants.js';
import MacroScreen from './macro/MacroScreen.js';
import MicroScreen from './micro/MicroScreen.js';
import MySolutionScreen from './mysolution/MySolutionScreen.js';
import PhScaleStrings from './PhScaleStrings.js';

simLauncher.launch( () => {

  const screens = [
    new MacroScreen( {
      tandem: Tandem.ROOT.createTandem( 'macroScreen' )
    } ),
    new MicroScreen( {
      tandem: Tandem.ROOT.createTandem( 'microScreen' )
    } ),
    new MySolutionScreen( {
      tandem: Tandem.ROOT.createTandem( 'mySolutionScreen' )
    } )
  ];

  const sim = new Sim( PhScaleStrings[ 'ph-scale' ].titleStringProperty, screens, {
    credits: PHScaleConstants.CREDITS,
    phetioDesigned: true
  } );

  sim.start();
} );