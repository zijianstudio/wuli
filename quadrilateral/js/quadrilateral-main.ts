// Copyright 2021-2023, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import PreferencesModel from '../../joist/js/preferences/PreferencesModel.js';
import Sim, { SimOptions } from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import { Node } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import QuadrilateralQueryParameters from './quadrilateral/QuadrilateralQueryParameters.js';
import QuadrilateralScreen from './quadrilateral/QuadrilateralScreen.js';
import QuadrilateralStrings from './QuadrilateralStrings.js';
import QuadrilateralOptionsModel from './quadrilateral/model/QuadrilateralOptionsModel.js';
import QuadrilateralInputPreferencesNode from './quadrilateral/view/prototype/QuadrilateralInputPreferencesNode.js';
import QuadrilateralSoundOptionsNode from './quadrilateral/view/sound/QuadrilateralSoundOptionsNode.js';

const quadrilateralTitleStringProperty = QuadrilateralStrings.quadrilateral.titleStringProperty;
const optionsModel = new QuadrilateralOptionsModel();

// "Input" options are related to connection to a tangible device, this tab should only be shown when running
// while connected to some external device.
const inputPreferencesOptions = QuadrilateralQueryParameters.deviceConnection ? {
  customPreferences: [ {
    createContent: () => new QuadrilateralInputPreferencesNode( optionsModel.tangibleOptionsModel )
  } ]
} : undefined;

const simOptions: SimOptions = {

  credits: {
    softwareDevelopment: 'Jesse Greenberg',
    team: 'Brett Fiedler, Emily B. Moore, Taliesin Smith',
    contributors: 'Sofia Tancredi, Dor Abrahamson (Embodied Design Research Lab, UC Berkeley), Scott Lambert, Jenna Gorlewicz (CHROME Lab, St. Louis University)',
    soundDesign: 'Ashton Morris',

    //TODO fill in credits with QA team
    qualityAssurance: ''
  },

  // preferences configuration with defaults from package.json
  preferencesModel: new PreferencesModel( {
    inputOptions: inputPreferencesOptions,
    audioOptions: {
      customPreferences: [
        {

          // Due to the layout considerations in the Preferences Dialog, it has 2 columns. Our entry for the left column
          // is blank
          createContent: () => new Node()
        },
        {
          createContent: tandem => new QuadrilateralSoundOptionsNode( optionsModel.soundOptionsModel, tandem.createTandem( 'quadrilateralSoundOptionsNode' ) )
        }
      ]
    }
  } )
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {
  const quadrilateralScreen = new QuadrilateralScreen( optionsModel, {
    tandem: Tandem.ROOT.createTandem( 'quadrilateralScreen' )
  } );

  const sim = new Sim( quadrilateralTitleStringProperty, [ quadrilateralScreen ], simOptions );
  sim.start();
} );