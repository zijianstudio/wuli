// Copyright 2013-2022, University of Colorado Boulder

/**
 * Main entry point for the 'pH Scale: Basics' sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import PHScaleConstants from '../../ph-scale/js/common/PHScaleConstants.js';
import PHScaleQueryParameters from '../../ph-scale/js/common/PHScaleQueryParameters.js';
import MacroScreen from '../../ph-scale/js/macro/MacroScreen.js';
import Tandem from '../../tandem/js/Tandem.js';
import PhScaleBasicsStrings from './PhScaleBasicsStrings.js';

// If autofill query parameter was not in the URL, change the default.
if ( !QueryStringMachine.containsKey( 'autofill' ) ) {
  PHScaleQueryParameters.autofill = false;
}

simLauncher.launch( () => {

  const screens = [
    new MacroScreen( {
      tandem: Tandem.ROOT.createTandem( 'macroScreen' )
    } )
  ];

  const sim = new Sim( PhScaleBasicsStrings[ 'ph-scale-basics' ].titleStringProperty, screens, {
    credits: PHScaleConstants.CREDITS,
    phetioDesigned: true
  } );

  sim.start();
} );