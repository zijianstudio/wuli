// Copyright 2023, University of Colorado Boulder

/**
 * For the Preferences dialog, controls the volume units
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import { HBox, HBoxOptions, RichText, Text } from '../../../../scenery/js/imports.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem, AquaRadioButtonGroupOptions } from '../../../../sun/js/AquaRadioButtonGroup.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import PreferencesDialog from '../../../../joist/js/preferences/PreferencesDialog.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import { VolumeUnits } from '../DensityBuoyancyCommonQueryParameters.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';

type SelfOptions = EmptySelfOptions;

type VolumeUnitsControlOptions = SelfOptions & PickRequired<HBoxOptions, 'tandem'>;

export default class VolumeUnitsControl extends HBox {

  private readonly disposeVolumeUnitsControl: () => void;

  public constructor( beakerUnitsProperty: Property<VolumeUnits>, providedOptions: VolumeUnitsControlOptions ) {

    const options = optionize<VolumeUnitsControlOptions, SelfOptions, HBoxOptions>()( {
      spacing: 15
    }, providedOptions );

    const labelText = new Text( DensityBuoyancyCommonStrings.volumeUnitsStringProperty, {
      font: PreferencesDialog.CONTENT_FONT,
      tandem: options.tandem.createTandem( 'labelText' )
    } );

    const radioButtonGroup = new VolumeUnitsRadioButtonGroup( beakerUnitsProperty, {
      tandem: options.tandem.createTandem( 'radioButtonGroup' )
    } );

    options.children = [ labelText, radioButtonGroup ];

    super( options );

    this.addLinkedElement( beakerUnitsProperty, {
      tandem: options.tandem.createTandem( beakerUnitsProperty.tandem.name )
    } );

    this.disposeVolumeUnitsControl = (): void => {
      labelText.dispose();
      radioButtonGroup.dispose();
    };
  }

  public override dispose(): void {
    super.dispose();
    this.disposeVolumeUnitsControl();
  }
}

type VolumeUnitsRadioButtonGroupSelfOptions = EmptySelfOptions;

type VolumeUnitsRadioButtonGroupOptions = SelfOptions & PickRequired<AquaRadioButtonGroupOptions, 'tandem'>;

class VolumeUnitsRadioButtonGroup extends AquaRadioButtonGroup<VolumeUnits> {

  public constructor( beakerUnitsProperty: Property<VolumeUnits>, providedOptions: VolumeUnitsRadioButtonGroupOptions ) {

    const options = optionize<VolumeUnitsRadioButtonGroupOptions, VolumeUnitsRadioButtonGroupSelfOptions, AquaRadioButtonGroupOptions>()( {

      // AquaRadioButtonGroupOptions
      orientation: 'horizontal',
      spacing: 15
    }, providedOptions );

    const items: AquaRadioButtonGroupItem<VolumeUnits>[] = [
      createItem( 'liters', DensityBuoyancyCommonStrings.litersStringProperty ),
      createItem( 'decimetersCubed', DensityBuoyancyCommonStrings.decimetersCubedStringProperty )
    ];

    super( beakerUnitsProperty, items, options );
  }
}

function createItem( value: VolumeUnits, stringProperty: TReadOnlyProperty<string> ): AquaRadioButtonGroupItem<VolumeUnits> {
  return {
    value: value,
    createNode: tandem => new RichText( stringProperty, {
      font: PreferencesDialog.CONTENT_FONT,
      maxWidth: 200,
      tandem: tandem.createTandem( 'text' )
    } ),
    tandemName: `${value}${AquaRadioButton.TANDEM_NAME_SUFFIX}`
  };
}

densityBuoyancyCommon.register( 'VolumeUnitsControl', VolumeUnitsControl );