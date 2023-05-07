// Copyright 2022-2023, University of Colorado Boulder
/**
 * Shows the controls of the audio, wheter the audio is enabled and if the source is sampled at the source or at the listener.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import { AlignGroup, Node, Text } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import SoundConstants from '../../common/SoundConstants.js';
import sound from '../../sound.js';
import SoundModel from '../../common/model/SoundModel.js';
import SoundStrings from '../../SoundStrings.js';
import SoundPanel, { SoundPanelOptions } from './SoundPanel.js';

type SelfOptions = EmptySelfOptions;
type AudioControlPanelOptions = SelfOptions & SoundPanelOptions;

export default class AudioControlPanel extends SoundPanel {

  public constructor( model: SoundModel & { audioControlSettingProperty?: Property<'SPEAKER' | 'LISTENER'> }, alignGroup: AlignGroup, providedOptions?: AudioControlPanelOptions ) {
    const options = optionize<AudioControlPanelOptions, SelfOptions, SoundPanelOptions>()( {
      maxWidth: SoundConstants.PANEL_MAX_WIDTH,
      yMargin: 4
    }, providedOptions );

    const boxText = new Text( SoundStrings.audioControlPanel.titleStringProperty );
    const graphCheckbox = new Checkbox(
      model.isAudioEnabledProperty,
      new Text( SoundStrings.audioControlPanel.audioEnabledStringProperty, SoundConstants.CONTROL_PANEL_TEXT_MAX_WIDTH_OPTIONS ),
      {
        boxWidth: 15
      } );

    graphCheckbox.top = boxText.bottom + SoundConstants.CONTROL_PANEL_SPACING;


    const children: Node[] = [ boxText, graphCheckbox ];
    let radioButtons;
    if ( model.audioControlSettingProperty ) {
      radioButtons = new VerticalAquaRadioButtonGroup<'SPEAKER' | 'LISTENER'>( model.audioControlSettingProperty, [ {
        createNode: () => new Text( SoundStrings.audioControlPanel.speakerStringProperty, SoundConstants.CONTROL_PANEL_TEXT_MAX_WIDTH_OPTIONS ),
        value: 'SPEAKER'
      }, {
        createNode: () => new Text( SoundStrings.audioControlPanel.listenerStringProperty, SoundConstants.CONTROL_PANEL_TEXT_MAX_WIDTH_OPTIONS ),
        value: 'LISTENER'
      } ], {
        spacing: options.yMargin
      } );

      radioButtons.top = graphCheckbox.bottom + SoundConstants.CONTROL_PANEL_SPACING;

      children.push( radioButtons );
    }

    const container = new Node( {
      children: children
    } );

    const content = alignGroup.createBox( container );
    content.setXAlign( 'left' );

    super( content, options );
  }
}

sound.register( 'AudioControlPanel', AudioControlPanel );