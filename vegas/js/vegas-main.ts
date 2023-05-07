// Copyright 2014-2023, University of Colorado Boulder

/**
 * Main file for the vegas library demo.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import Screen from '../../joist/js/Screen.js';
import Sim, { SimOptions } from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import FiniteChallengesScreenView from './demo/FiniteChallengesScreenView.js';
import InfiniteChallengesScreenView from './demo/InfiniteChallengesScreenView.js';
import VegasStrings from './VegasStrings.js';
import ComponentsScreenView from './demo/components/ComponentsScreenView.js';
import TModel from '../../joist/js/TModel.js';

// constants
const vegasTitleStringProperty = VegasStrings.vegas.titleStringProperty;

const simOptions: SimOptions = {
  credits: {
    leadDesign: 'PhET'
  }
};

class VegasModel implements TModel {
  public reset(): void { /* nothing to do */ }
}

function createEmptyModel(): VegasModel {
  return new VegasModel();
}

simLauncher.launch( () => {
  new Sim( vegasTitleStringProperty, [

    new Screen(
      createEmptyModel,
      () => new ComponentsScreenView(), {
        name: new Property( 'Components' ),
        backgroundColorProperty: new Property( 'white' ),
        tandem: Tandem.OPT_OUT
      } ),

    new Screen(
      createEmptyModel,
      () => new FiniteChallengesScreenView(), {
        name: new Property( 'Finite Challenges' ),
        backgroundColorProperty: new Property( 'white' ),
        tandem: Tandem.OPT_OUT
      } ),

    new Screen(
      createEmptyModel,
      () => new InfiniteChallengesScreenView(), {
        name: new Property( 'Infinite Challenges' ),
        backgroundColorProperty: new Property( 'white' ),
        tandem: Tandem.OPT_OUT
      } )
  ], simOptions ).start();
} );