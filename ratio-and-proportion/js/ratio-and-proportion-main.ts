// Copyright 2020-2023, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Sim, { SimOptions } from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import CreateScreen from './create/CreateScreen.js';
import DiscoverScreen from './discover/DiscoverScreen.js';
import RatioAndProportionStrings from './RatioAndProportionStrings.js';
import RAPPreferencesModel from './common/view/RAPPreferencesModel.js';

const ratioAndProportionTitleStringProperty = RatioAndProportionStrings[ 'ratio-and-proportion' ].titleStringProperty;

const simOptions: SimOptions = {
  credits: {
    softwareDevelopment: 'John Blanco, Michael Kauzmann',
    team: 'Brett Fiedler, Amanda McGarry, Emily B. Moore, Matthew Moore, Taliesin Smith',
    contributors: 'Dor Abrahamson and the Embodied Design Research Laboratory (UC Berkeley); Clement Zheng, Peter Gyory, and Ellen Do from the ACME Lab (CU Boulder ATLAS Institute)',
    qualityAssurance: 'Logan Bray, Steele Dalton, Jaron Droder, Clifford Hardin, Megan Lai, Brooklyn Lash, Emily Miller, ' +
                      'Liam Mulhall, Devon Quispe, Nancy Salpepi, Kathryn Woessner',
    soundDesign: 'Ashton Morris'
  },
  preferencesModel: new RAPPreferencesModel()
};

// launch the sim - beware that scenery Image nodes created outside simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {
  const sim = new Sim( ratioAndProportionTitleStringProperty, [
    new DiscoverScreen( Tandem.ROOT.createTandem( 'discoverScreen' ) ),
    new CreateScreen( Tandem.ROOT.createTandem( 'createScreen' ) )
  ], simOptions );
  sim.start();
} );