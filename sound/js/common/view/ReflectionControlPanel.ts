// Copyright 2022, University of Colorado Boulder
/**
 * Shows the controls for the reflection wall, its position and rotation.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import { AlignGroup, Node } from '../../../../scenery/js/imports.js';
import SoundConstants from '../../common/SoundConstants.js';
import sound from '../../sound.js';
import ReflectionModel from '../../reflection/ReflectionModel.js';
import SoundStrings from '../../SoundStrings.js';
import PropertyControlSlider from './PropertyControlSlider.js';
import SoundPanel, { SoundPanelOptions } from './SoundPanel.js';

type SelfOptions = EmptySelfOptions;
type ReflectionControlPanelOptions = SelfOptions & SoundPanelOptions;

export default class ReflectionControlPanel extends SoundPanel {

  public constructor( model: ReflectionModel, alignGroup: AlignGroup, providedOptions?: ReflectionControlPanelOptions ) {

    const options = optionize<ReflectionControlPanelOptions, SelfOptions, SoundPanelOptions>()( {
      maxWidth: SoundConstants.PANEL_MAX_WIDTH,
      yMargin: 4
    }, providedOptions );

    const wallPositionXControl = new PropertyControlSlider( SoundStrings.reflectionControlPanel.positionSliderStringProperty, model.wallPositionXProperty );
    const wallAngleControl = new PropertyControlSlider( SoundStrings.reflectionControlPanel.rotationSliderStringProperty, model.wallAngleProperty );

    const centerX = wallPositionXControl.centerX;
    wallAngleControl.centerX = centerX;

    // Vertical layout
    wallAngleControl.top = wallPositionXControl.bottom + options.yMargin;

    const container = new Node();

    container.children = [
      wallPositionXControl,
      wallAngleControl
    ];

    const content = alignGroup.createBox( container );

    super( content, options );
  }
}

sound.register( 'ReflectionControlPanel', ReflectionControlPanel );