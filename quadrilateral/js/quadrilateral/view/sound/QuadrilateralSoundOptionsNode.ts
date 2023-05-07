// Copyright 2021-2023, University of Colorado Boulder

/**
 * Options for the Preferences Dialog that allow us to set the sound design and sub-options.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { Node, Text, VoicingText, VoicingTextOptions } from '../../../../../scenery/js/imports.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import quadrilateral from '../../../quadrilateral.js';
import QuadrilateralSoundOptionsModel, { SoundDesign } from '../../model/QuadrilateralSoundOptionsModel.js';
import PreferencesDialog from '../../../../../joist/js/preferences/PreferencesDialog.js';
import AquaRadioButtonGroup from '../../../../../sun/js/AquaRadioButtonGroup.js';
import PreferencesPanelSection from '../../../../../joist/js/preferences/PreferencesPanelSection.js';
import AquaRadioButton from '../../../../../sun/js/AquaRadioButton.js';
import QuadrilateralStrings from '../../../QuadrilateralStrings.js';
import soundManager from '../../../../../tambo/js/soundManager.js';
import ToggleSwitch, { ToggleSwitchOptions } from '../../../../../sun/js/ToggleSwitch.js';
import PreferencesDialogConstants from '../../../../../joist/js/preferences/PreferencesDialogConstants.js';
import PreferencesControl from '../../../../../joist/js/preferences/PreferencesControl.js';
import { combineOptions } from '../../../../../phet-core/js/optionize.js';
import PatternStringProperty from '../../../../../axon/js/PatternStringProperty.js';
import JoistStrings from '../../../../../joist/js/JoistStrings.js';

// constants
const shapeSoundsOptionsStringProperty = QuadrilateralStrings.preferencesDialog.shapeSoundOptionsStringProperty;
const shapeSoundsOptionsDescriptionStringProperty = QuadrilateralStrings.preferencesDialog.shapeSoundOptionsDescriptionStringProperty;
const preferencesDialogLayerSoundDesignDescriptionStringProperty = QuadrilateralStrings.preferencesDialog.layerSoundDesignDescriptionStringProperty;
const preferencesDialogUniqueSoundDesignDescriptionStringProperty = QuadrilateralStrings.preferencesDialog.uniqueSoundDesignDescriptionStringProperty;
const preferencesDialogPlayShapeSoundsForeverStringProperty = QuadrilateralStrings.preferencesDialog.playShapeSoundsForeverStringProperty;
const tracksPlayForeverCheckedContextResponseStringProperty = QuadrilateralStrings.a11y.preferencesDialog.tracksPlayForeverToggle.checkedContextResponseStringProperty;
const tracksPlayForeverUncheckedContextResponseStringProperty = QuadrilateralStrings.a11y.preferencesDialog.tracksPlayForeverToggle.uncheckedContextResponseStringProperty;
const labelledDescriptionPatternStringProperty = JoistStrings.a11y.preferences.tabs.labelledDescriptionPatternStringProperty;

export default class QuadrilateralSoundOptionsNode extends PreferencesPanelSection {

  // Necessary for PhET-iO state and disposal since these components become dynamic when they live in a phetio capsule
  private readonly disposeQuadrilateralSoundOptionsNode: () => void;

  public constructor( model: QuadrilateralSoundOptionsModel, tandem: Tandem ) {

    // Sounds play forever control
    const soundsPlayForeverLabel = new Text( preferencesDialogPlayShapeSoundsForeverStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
    const soundsPlayForeverToggleSwitch = new ToggleSwitch( model.tracksPlayForeverProperty, false, true, combineOptions<ToggleSwitchOptions>( {}, {
      a11yName: preferencesDialogPlayShapeSoundsForeverStringProperty,
      rightValueContextResponse: tracksPlayForeverCheckedContextResponseStringProperty,
      leftValueContextResponse: tracksPlayForeverUncheckedContextResponseStringProperty
    }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS ) );
    const soundsPlayForeverPreferencesControl = new PreferencesControl( {
      labelNode: soundsPlayForeverLabel,
      controlNode: soundsPlayForeverToggleSwitch
    } );

    // voicing - It was requested that the reading block for the shape sounds description combine the heading
    // and description strings and that the heading is NOT a reading block.
    const shapeSoundDescriptionReadingBlockContentStringProperty = new PatternStringProperty( labelledDescriptionPatternStringProperty, {
      label: shapeSoundsOptionsStringProperty,
      description: shapeSoundsOptionsDescriptionStringProperty
    } );

    // Shape Sound Options controls
    const shapeSoundOptionsLabelText = new Text( shapeSoundsOptionsStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
    const shapeSoundOptionsDescriptionText = new VoicingText( shapeSoundsOptionsDescriptionStringProperty, combineOptions<VoicingTextOptions>( {}, {
      readingBlockNameResponse: shapeSoundDescriptionReadingBlockContentStringProperty
    }, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS ) );

    const soundDesignRadioButtonGroup = new AquaRadioButtonGroup( model.soundDesignProperty, [
      {
        value: SoundDesign.TRACKS_LAYER,
        createNode: () => new Text( preferencesDialogLayerSoundDesignDescriptionStringProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS ),
        tandemName: `layersTracksSoundView${AquaRadioButton.TANDEM_NAME_SUFFIX}`,
        options: {
          voicingNameResponse: preferencesDialogLayerSoundDesignDescriptionStringProperty
        }
      },
      {
        value: SoundDesign.TRACKS_UNIQUE,
        createNode: () => new Text( preferencesDialogUniqueSoundDesignDescriptionStringProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS ),
        tandemName: `emphasisTracksSoundView${AquaRadioButton.TANDEM_NAME_SUFFIX}`,
        options: {
          voicingNameResponse: preferencesDialogUniqueSoundDesignDescriptionStringProperty
        }
      }
    ], {
      spacing: 4,
      radioButtonOptions: {
        radius: 9
      },
      tandem: tandem.createTandem( 'soundDesignRadioButtonGroup' )
    } );

    // Voice the radio button on selection. We considered putting this in AquaRadioButton, but the design
    // team indicated different radio buttons might voice different content (not just the name response).
    soundDesignRadioButtonGroup.onInputEmitter.addListener( () => {
      soundDesignRadioButtonGroup.getButton( model.soundDesignProperty.value ).voicingSpeakNameResponse();
    } );

    super( {
      contentNode: new Node( {
        children: [ soundsPlayForeverPreferencesControl, shapeSoundOptionsLabelText, shapeSoundOptionsDescriptionText, soundDesignRadioButtonGroup ]
      } ),

      // The shape sound options should only be available when sounds are enabled. joist disables all audio
      // options when Audio Features are disabled, so we use 'visible' instead of 'enabled' to avoid compounding
      // transparency when both sounds and audio are disabled.
      visibleProperty: soundManager.enabledProperty
    } );

    // layout
    shapeSoundOptionsLabelText.leftTop = soundsPlayForeverPreferencesControl.leftBottom.plusXY( 0, PreferencesDialog.CONTENT_SPACING );
    shapeSoundOptionsDescriptionText.leftTop = shapeSoundOptionsLabelText.leftBottom.plusXY( 0, PreferencesDialog.VERTICAL_CONTENT_SPACING );
    soundDesignRadioButtonGroup.leftTop = shapeSoundOptionsDescriptionText.leftBottom.plusXY( PreferencesDialog.CONTENT_INDENTATION_SPACING, PreferencesDialog.VERTICAL_CONTENT_SPACING );

    this.disposeQuadrilateralSoundOptionsNode = () => {
      soundDesignRadioButtonGroup.dispose();
      soundsPlayForeverToggleSwitch.dispose();
      soundsPlayForeverLabel.dispose();
      shapeSoundDescriptionReadingBlockContentStringProperty.dispose();
      shapeSoundOptionsLabelText.dispose();
      shapeSoundOptionsDescriptionText.dispose();
    };
  }

  public override dispose(): void {
    this.disposeQuadrilateralSoundOptionsNode();
    super.dispose();
  }
}

quadrilateral.register( 'QuadrilateralSoundOptionsNode', QuadrilateralSoundOptionsNode );
