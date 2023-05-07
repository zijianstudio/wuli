// Copyright 2020-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Franco Barpp Gomes (UTFPR)
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import NormalModesStrings from './NormalModesStrings.js';
import OneDimensionScreen from './one-dimension/OneDimensionScreen.js';
import TwoDimensionsScreen from './two-dimensions/TwoDimensionsScreen.js';

const normalModesTitleStringProperty = NormalModesStrings[ 'normal-modes' ].titleStringProperty;

const simOptions = {
  credits: {
    leadDesign: 'Mike Dubson',
    softwareDevelopment: 'Franco Barpp Gomes (UTFPR), Thiago de Mendon\u00e7a Mildemberger (UTFPR)',
    team: 'Mindy Gratny, Isam Hasan, Patricia Loeblein, Diana L\u00f3pez Tavares, Chris Malley (PixelZoom, Inc.), Jonathan Olson, Ariel Paul, Kathy Perkins, Amy Rouinfar',
    qualityAssurance: 'Emily Miller, Nancy Salpepi, Kathryn Woessner'
  }
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {
  const sim = new Sim( normalModesTitleStringProperty, [
    new OneDimensionScreen( Tandem.ROOT.createTandem( 'oneDimensionScreen' ) ),
    new TwoDimensionsScreen( Tandem.ROOT.createTandem( 'twoDimensionsScreen' ) )
  ], simOptions );
  sim.start();
} );