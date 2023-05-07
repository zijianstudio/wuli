// Copyright 2022, University of Colorado Boulder

/**
 * Shows the controls for the pressure box.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { AlignGroup, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import SoundConstants from '../../common/SoundConstants.js';
import sound from '../../sound.js';
import SoundStrings from '../../SoundStrings.js';
import PropertyControlSlider from './PropertyControlSlider.js';
import SoundPanel, { SoundPanelOptions } from './SoundPanel.js';
import PressureModel from '../../air-pressure/PressureModel.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';

type SelfOptions = EmptySelfOptions;
export type AirDensityControlPanelOptions = SoundPanelOptions & SelfOptions;

export default class AirDensityControlPanel extends SoundPanel {

  public constructor( model: PressureModel, alignGroup: AlignGroup, providedOptions?: AirDensityControlPanelOptions ) {
    const options = optionize<AirDensityControlPanelOptions, SelfOptions, SoundPanelOptions>()( {
      maxWidth: SoundConstants.PANEL_MAX_WIDTH,
      yMargin: 4
    }, providedOptions );

    const resetButton = new RectangularPushButton( {
      content: new Text( SoundStrings.airDensityControlPanel.resetStringProperty ),
      listener: () => {
        model.pressureProperty.set( 1 );
      }
    } );

    const airPressureContol = new PropertyControlSlider( SoundStrings.airDensityControlPanel.titleStringProperty, model.pressureProperty );

    const container = new VBox( {
      spacing: 6,
      children: [
        airPressureContol,
        resetButton
      ]
    } );

    const content = alignGroup.createBox( container );
    content.setXAlign( 'center' );

    super( content, options );
  }
}

sound.register( 'AirDensityControlPanel', AirDensityControlPanel );