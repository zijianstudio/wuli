// Copyright 2022, University of Colorado Boulder

/**
 * Main file for the nitroglycerin library demo.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../axon/js/Property.js';
import Screen from '../../joist/js/Screen.js';
import Sim, { SimOptions } from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import { Color } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import MoleculesScreenView from './demo/MoleculesScreenView.js';
import NitroglycerinStrings from './NitroglycerinStrings.js';

const titleStringProperty = NitroglycerinStrings.nitroglycerin.titleStringProperty;

class Model {
  public reset(): void { /* nothing to do */ }
}

simLauncher.launch( () => {

  const screens = [
    new Screen(
      () => new Model(),
      () => new MoleculesScreenView(), {
        name: new Property( 'Molecules' ),
        backgroundColorProperty: new Property( Color.grayColor( 90 ) ),
        tandem: Tandem.OPT_OUT
      } ) ];

  const simOptions: SimOptions = {
    credits: {
      leadDesign: 'PhET'
    }
  };

  const sim = new Sim( titleStringProperty, screens, simOptions );
  sim.start();
} );