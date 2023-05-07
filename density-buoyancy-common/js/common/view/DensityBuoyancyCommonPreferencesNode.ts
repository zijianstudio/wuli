// Copyright 2023, University of Colorado Boulder

/**
 * DensityBuoyancyCommonPreferencesNode is the user interface for sim-specific preferences, accessed via the Preferences dialog.
 * These preferences are global, and affect all screens.
 *
 * The Preferences dialog is created on demand by joist, using a PhetioCapsule. So DensityBuoyancyCommonPreferencesNode and its
 * subcomponents must implement dispose.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonPreferences from '../model/DensityBuoyancyCommonPreferences.js';
import VolumeUnitsControl from './VolumeUnitsControl.js';

type SelfOptions = EmptySelfOptions;

export type DensityBuoyancyCommonPreferencesNodeOptions = SelfOptions & PickRequired<VBoxOptions, 'tandem'>;

export default class DensityBuoyancyCommonPreferencesNode extends VBox {

  private readonly disposeDensityBuoyancyCommonPreferencesNode: () => void;

  public constructor( providedOptions: DensityBuoyancyCommonPreferencesNodeOptions ) {

    const options = optionize<DensityBuoyancyCommonPreferencesNodeOptions, SelfOptions, VBoxOptions>()( {
      align: 'left',
      spacing: 20,
      phetioVisiblePropertyInstrumented: false
    }, providedOptions );

    const beakerUnitsControl = new VolumeUnitsControl( DensityBuoyancyCommonPreferences.volumeUnitsProperty, {
      tandem: options.tandem.createTandem( 'beakerUnitsControl' )
    } );

    options.children = [
      beakerUnitsControl
    ];

    super( options );

    this.disposeDensityBuoyancyCommonPreferencesNode = () => {
      beakerUnitsControl.dispose();
    };
  }

  public override dispose(): void {
    this.disposeDensityBuoyancyCommonPreferencesNode();
    super.dispose();
  }
}

densityBuoyancyCommon.register( 'DensityBuoyancyCommonPreferencesNode', DensityBuoyancyCommonPreferencesNode );