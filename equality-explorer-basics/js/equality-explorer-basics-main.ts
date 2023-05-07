// Copyright 2018-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BasicsScreen from '../../equality-explorer/js/basics/BasicsScreen.js';
import EqualityExplorerConstants from '../../equality-explorer/js/common/EqualityExplorerConstants.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import EqualityExplorerBasicsStrings from './EqualityExplorerBasicsStrings.js';
import LabScreen from './lab/LabScreen.js';

simLauncher.launch( () => {

  const screens = [
    new BasicsScreen( { tandem: Tandem.ROOT.createTandem( 'basicsScreen' ) } ),
    new LabScreen( { tandem: Tandem.ROOT.createTandem( 'labScreen' ) } )
  ];

  const sim = new Sim( EqualityExplorerBasicsStrings[ 'equality-explorer-basics' ].titleStringProperty, screens, {
    credits: EqualityExplorerConstants.CREDITS
  } );

  sim.start();
} );