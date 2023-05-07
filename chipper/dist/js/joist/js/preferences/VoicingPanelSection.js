// Copyright 2021-2023, University of Colorado Boulder

/**
 * The section of PreferencesDialog content in the "Audio" panel related to voicing.
 *
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import merge from '../../../phet-core/js/merge.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import NumberControl from '../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { FocusHighlightFromNode, Node, PressListener, Text, VBox, voicingManager, VoicingText } from '../../../scenery/js/imports.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import ComboBox from '../../../sun/js/ComboBox.js';
import ExpandCollapseButton from '../../../sun/js/ExpandCollapseButton.js';
import HSlider from '../../../sun/js/HSlider.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesControl from './PreferencesControl.js';
import localeProperty from '../i18n/localeProperty.js';
import ToggleSwitch from '../../../sun/js/ToggleSwitch.js';
import PreferencesDialogConstants from './PreferencesDialogConstants.js';
import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
// constants
// none of the Voicing strings or feature is translatable yet, all strings in this file
// are nested under the 'a11y' section to make sure that they are not translatable
const voicingLabelStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.titleStringProperty;
const toolbarLabelStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.toolbar.titleStringProperty;
const rateStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.titleStringProperty;
const rateLabelStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.labelStringStringProperty;
const pitchStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.pitch.titleStringProperty;
const voicingEnabledStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.voicingOnStringProperty;
const voicingDisabledStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.voicingOffStringProperty;
const voicingOffOnlyAvailableInEnglishStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.voicingOffOnlyAvailableInEnglishStringProperty;
const voiceVariablesPatternStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.variablesPatternStringProperty;
const customizeVoiceStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.titleStringProperty;
const toolbarRemovedStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.toolbar.toolbarRemovedStringProperty;
const toolbarAddedStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.toolbar.toolbarAddedStringProperty;
const simVoicingOptionsStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.titleStringProperty;
const simVoicingDescriptionStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.descriptionStringProperty;
const objectDetailsLabelStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.labelStringProperty;
const contextChangesLabelStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.labelStringProperty;
const helpfulHintsLabelStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.labelStringProperty;
const voicingObjectChangesStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.enabledAlertStringProperty;
const objectChangesMutedStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.disabledAlertStringProperty;
const voicingContextChangesStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.enabledAlertStringProperty;
const contextChangesMutedStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.disabledAlertStringProperty;
const voicingHintsStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.enabledAlertStringProperty;
const hintsMutedStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.disabledAlertStringProperty;
const voiceLabelStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.voice.titleStringProperty;
const voiceTitlePatternLabelStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.voice.titlePatternStringProperty;
const noVoicesAvailableStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.voice.noVoicesAvailableStringProperty;
const customizeVoiceExpandedStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.expandedAlertStringProperty;
const customizeVoiceCollapsedStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.collapsedAlertStringProperty;
const voiceRateDescriptionPatternStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.writtenVariablesPatternStringProperty;
const labelledDescriptionPatternStringProperty = JoistStrings.a11y.preferences.tabs.labelledDescriptionPatternStringProperty;
const voiceRateNormalStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.voiceRateNormalStringProperty;
const inLowRangeStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.lowStringProperty;
const inNormalRangeStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.normalStringProperty;
const aboveNormalRangeStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.aboveNormalStringProperty;
const inHighRangeStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.highStringProperty;

// Voicing can appear but become disabled when running with multiple locales. This translatable label is present for
// translated sims in this case.
const voicingEnglishOnlyLabelStringProperty = JoistStrings.preferences.tabs.audio.voicing.titleEnglishOnlyStringProperty;
const voicingDescriptionStringProperty = JoistStrings.preferences.tabs.audio.voicing.descriptionStringProperty;
const VOICE_PITCH_DESCRIPTION_MAP = new Map();
VOICE_PITCH_DESCRIPTION_MAP.set(new Range(0.5, 0.75), inLowRangeStringProperty);
VOICE_PITCH_DESCRIPTION_MAP.set(new Range(0.75, 1.25), inNormalRangeStringProperty);
VOICE_PITCH_DESCRIPTION_MAP.set(new Range(1.25, 1.5), aboveNormalRangeStringProperty);
VOICE_PITCH_DESCRIPTION_MAP.set(new Range(1.5, 2), inHighRangeStringProperty);
const THUMB_SIZE = new Dimension2(13, 26);
const TRACK_SIZE = new Dimension2(100, 5);
class VoicingPanelSection extends PreferencesPanelSection {
  /**
   * @param audioModel - configuration for audio settings, see PreferencesModel
   * @param [providedOptions]
   */
  constructor(audioModel, providedOptions) {
    // Voicing feature only works when running in English. If running in a version where you can change locale,
    // indicate through the title that the feature will only work in English.
    const titleStringProperty = localeProperty.validValues && localeProperty.validValues.length > 1 ? voicingEnglishOnlyLabelStringProperty : voicingLabelStringProperty;

    // the checkbox is the title for the section and totally enables/disables the feature
    const voicingLabel = new Text(titleStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS);
    const voicingEnabledReadingBlockNameResponsePatternStringProperty = new PatternStringProperty(labelledDescriptionPatternStringProperty, {
      label: titleStringProperty,
      description: voicingDescriptionStringProperty
    });
    const voicingEnabledSwitchVoicingText = new VoicingText(voicingDescriptionStringProperty, merge({}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
      readingBlockNameResponse: voicingEnabledReadingBlockNameResponsePatternStringProperty
    }));
    const voicingToggleSwitch = new ToggleSwitch(audioModel.voicingEnabledProperty, false, true, combineOptions({
      a11yName: titleStringProperty
    }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS));
    const voicingEnabledSwitch = new PreferencesControl({
      labelNode: voicingLabel,
      descriptionNode: voicingEnabledSwitchVoicingText,
      controlNode: voicingToggleSwitch
    });

    // checkbox for the toolbar
    const quickAccessLabel = new Text(toolbarLabelStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS);
    const toolbarToggleSwitch = new ToggleSwitch(audioModel.toolbarEnabledProperty, false, true, combineOptions({
      a11yName: toolbarLabelStringProperty,
      leftValueContextResponse: toolbarRemovedStringProperty,
      rightValueContextResponse: toolbarAddedStringProperty
    }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS));
    const toolbarEnabledSwitch = new PreferencesControl({
      labelNode: quickAccessLabel,
      controlNode: toolbarToggleSwitch
    });

    // Speech output levels
    const speechOutputLabel = new Text(simVoicingOptionsStringProperty, merge({}, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS, {
      // pdom
      tagName: 'h3',
      innerContent: simVoicingOptionsStringProperty
    }));
    const speechOutputReadingBlockNameResponsePatternStringProperty = new PatternStringProperty(labelledDescriptionPatternStringProperty, {
      label: simVoicingOptionsStringProperty,
      description: simVoicingDescriptionStringProperty
    });
    const speechOutputDescription = new VoicingText(simVoicingDescriptionStringProperty, merge({}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
      readingBlockNameResponse: speechOutputReadingBlockNameResponsePatternStringProperty
    }));

    /**
     * Create a checkbox for the features of voicing content with a label.
     */
    const createCheckbox = (labelString, property, checkedContextResponse, uncheckedContextResponse, disposable) => {
      const labelNode = new Text(labelString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS);
      const checkbox = new Checkbox(property, labelNode, {
        // pdom
        labelTagName: 'label',
        labelContent: labelString,
        // voicing
        voicingNameResponse: labelString,
        voicingIgnoreVoicingManagerProperties: true,
        voiceNameResponseOnSelection: false,
        // both pdom and voicing
        checkedContextResponse: checkedContextResponse,
        uncheckedContextResponse: uncheckedContextResponse,
        // phet-io
        tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
      });

      disposable.disposeEmitter.addListener(() => {
        labelNode.dispose();
        checkbox.dispose();
      });
      return checkbox;
    };
    const speechOutputContent = new Node();
    const speechOutputCheckboxes = new VBox({
      align: 'left',
      spacing: PreferencesDialog.VERTICAL_CONTENT_SPACING,
      children: [createCheckbox(objectDetailsLabelStringProperty, audioModel.voicingObjectResponsesEnabledProperty, voicingObjectChangesStringProperty, objectChangesMutedStringProperty, speechOutputLabel), createCheckbox(contextChangesLabelStringProperty, audioModel.voicingContextResponsesEnabledProperty, voicingContextChangesStringProperty, contextChangesMutedStringProperty, speechOutputLabel), createCheckbox(helpfulHintsLabelStringProperty, audioModel.voicingHintResponsesEnabledProperty, voicingHintsStringProperty, hintsMutedStringProperty, speechOutputLabel)]
    });
    speechOutputContent.children = [speechOutputLabel, speechOutputDescription, speechOutputCheckboxes];
    speechOutputDescription.leftTop = speechOutputLabel.leftBottom.plusXY(0, PreferencesDialog.VERTICAL_CONTENT_SPACING);
    speechOutputCheckboxes.leftTop = speechOutputDescription.leftBottom.plusXY(PreferencesDialog.CONTENT_INDENTATION_SPACING, PreferencesDialog.VERTICAL_CONTENT_SPACING);
    const rateSlider = new VoiceRateNumberControl(rateStringProperty, rateLabelStringProperty, audioModel.voiceRateProperty);
    const pitchSlider = new VoicingPitchSlider(pitchStringProperty, audioModel.voicePitchProperty);
    const voiceOptionsContent = new VBox({
      spacing: PreferencesDialog.VERTICAL_CONTENT_SPACING,
      align: 'left',
      children: [rateSlider, pitchSlider]
    });

    // voice options
    const voiceOptionsLabel = new Text(customizeVoiceStringProperty, merge({}, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS, {
      cursor: 'pointer'
    }));
    const voiceOptionsOpenProperty = new BooleanProperty(false);
    const expandCollapseButton = new ExpandCollapseButton(voiceOptionsOpenProperty, {
      sideLength: 16,
      // pdom
      innerContent: customizeVoiceStringProperty,
      // voicing
      voicingNameResponse: customizeVoiceStringProperty,
      voicingIgnoreVoicingManagerProperties: true,
      // Controls need to always speak responses so UI functions are clear

      // phet-io
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    });

    const voiceOptionsContainer = new Node({
      children: [voiceOptionsLabel, expandCollapseButton]
    });

    // the visual title of the ExpandCollapseButton needs to be clickable
    const voiceOptionsPressListener = new PressListener({
      press: () => {
        voiceOptionsOpenProperty.toggle();
      },
      // phet-io
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    });

    voiceOptionsLabel.addInputListener(voiceOptionsPressListener);
    const content = new Node({
      children: [speechOutputContent, toolbarEnabledSwitch, voiceOptionsContainer, voiceOptionsContent]
    });

    // layout for section content, custom rather than using a FlowBox because the voice options label needs
    // to be left aligned with other labels, while the ExpandCollapseButton extends to the left
    toolbarEnabledSwitch.leftTop = speechOutputContent.leftBottom.plusXY(0, 20);
    voiceOptionsLabel.leftTop = toolbarEnabledSwitch.leftBottom.plusXY(0, 20);
    expandCollapseButton.leftCenter = voiceOptionsLabel.rightCenter.plusXY(10, 0);
    voiceOptionsContent.leftTop = voiceOptionsLabel.leftBottom.plusXY(0, 10);
    voiceOptionsOpenProperty.link(open => {
      voiceOptionsContent.visible = open;
    });

    // the focus highlight for the voice options expand collapse button should surround the label
    expandCollapseButton.focusHighlight = new FocusHighlightFromNode(voiceOptionsContainer);
    super({
      titleNode: voicingEnabledSwitch,
      contentNode: content
    });
    const contentVisibilityListener = enabled => {
      content.visible = enabled;
    };
    audioModel.voicingEnabledProperty.link(contentVisibilityListener);
    const localeListener = locale => {
      voicingEnabledSwitch.enabledProperty.value = locale.startsWith('en');
    };
    localeProperty.link(localeListener);

    // Speak when voicing becomes initially enabled. First speech is done synchronously (not using utterance-queue)
    // in response to user input, otherwise all speech will be blocked on many platforms
    const voicingEnabledUtterance = new Utterance();
    const voicingEnabledPropertyListener = enabled => {
      // only speak if "Sim Voicing" is on, all voicing should be disabled except for the Toolbar
      // buttons in this case
      if (audioModel.voicingMainWindowVoicingEnabledProperty.value) {
        // If locale changes, make sure to describe that Voicing has become disabled because Voicing is only available
        // in the English locale.
        voicingEnabledUtterance.alert = enabled ? voicingEnabledStringProperty : localeProperty.value.startsWith('en') ? voicingDisabledStringProperty : voicingOffOnlyAvailableInEnglishStringProperty;

        // PhET-iO Archetypes should never voice responses.
        if (!this.isInsidePhetioArchetype()) {
          voicingManager.speakIgnoringEnabled(voicingEnabledUtterance);
        }
        this.alertDescriptionUtterance(voicingEnabledUtterance);
      }
    };
    audioModel.voicingEnabledProperty.lazyLink(voicingEnabledPropertyListener);

    // when the list of voices for the ComboBox changes, create a new ComboBox that includes the supported
    // voices. Eagerly create the first ComboBox, even if no voices are available.
    let voiceComboBox = null;
    const voicesChangedListener = voices => {
      if (voiceComboBox) {
        voiceOptionsContent.removeChild(voiceComboBox);
        voiceComboBox.dispose();
      }
      let voiceList = [];

      // Only get the prioritized and pruned list of voices if the VoicingManager has voices
      // available, otherwise wait until they are available. If there are no voices available VoiceComboBox will handle
      // that gracefully.
      // Voice changing is not (as of this writing) available on MacOS or iOS, but we hope they fix that bug soon. Perhaps
      // next time someone is working in this area, they can check and see if it is working, https://github.com/phetsims/utterance-queue/issues/74
      if (voices.length > 0) {
        // For now, only English voices are available because the Voicing feature is not translatable.
        const prioritizedVoices = voicingManager.getEnglishPrioritizedVoices();

        // limit the voices for now to keep the size of the ComboBox manageable
        voiceList = prioritizedVoices.slice(0, 12);
      }

      // phet-io - for when creating the Archetype for the Capsule housing the preferencesDialog, we don't have a sim global.
      // TODO: topLayer should be private, see https://github.com/phetsims/joist/issues/841
      const parent = phet.joist.sim.topLayer || new Node();
      voiceComboBox = new VoiceComboBox(audioModel.voiceProperty, voiceList, parent);
      voiceOptionsContent.addChild(voiceComboBox);
    };
    voicingManager.voicesProperty.link(voicesChangedListener);
    voiceOptionsOpenProperty.lazyLink(open => {
      const alertStringProperty = open ? customizeVoiceExpandedStringProperty : customizeVoiceCollapsedStringProperty;
      expandCollapseButton.voicingSpeakContextResponse({
        contextResponse: alertStringProperty
      });
      this.alertDescriptionUtterance(alertStringProperty);
    });
    this.disposeVoicingPanelSection = () => {
      quickAccessLabel.dispose();
      speechOutputLabel.dispose();
      voiceOptionsLabel.dispose();
      voicingLabel.dispose();
      pitchSlider.dispose();
      rateSlider.dispose();
      audioModel.voicingEnabledProperty.unlink(voicingEnabledPropertyListener);
      audioModel.voicingEnabledProperty.unlink(contentVisibilityListener);
      voicingManager.voicesProperty.unlink(voicesChangedListener);
      localeProperty.unlink(localeListener);
      voicingEnabledSwitch.dispose();
      voiceOptionsOpenProperty.dispose();
      expandCollapseButton.dispose();
      toolbarEnabledSwitch.dispose();
      toolbarToggleSwitch.dispose();
      voicingEnabledUtterance.dispose();
      voicingToggleSwitch.dispose();
      voicingEnabledSwitchVoicingText.dispose();
      speechOutputDescription.dispose();
      voicingEnabledReadingBlockNameResponsePatternStringProperty.dispose();
      speechOutputReadingBlockNameResponsePatternStringProperty.dispose();
      voiceComboBox && voiceComboBox.dispose();
    };
  }
  dispose() {
    this.disposeVoicingPanelSection();
    super.dispose();
  }
}

/**
 * Create a NumberControl for one of the voice parameters of voicing (pitch/rate).
 *
 * @param labelString - label for the NumberControl
 * @param a11yNameString - label for both PDOM and Voicing content
 * @param voiceRateProperty
 */
class VoiceRateNumberControl extends NumberControl {
  constructor(labelString, a11yNameString, voiceRateProperty) {
    super(labelString, voiceRateProperty, voiceRateProperty.range, {
      includeArrowButtons: false,
      layoutFunction: NumberControl.createLayoutFunction4(),
      delta: 0.25,
      titleNodeOptions: merge({}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
        maxWidth: 45
      }),
      numberDisplayOptions: {
        decimalPlaces: 2,
        valuePattern: voiceVariablesPatternStringProperty,
        textOptions: merge({}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
          maxWidth: 45
        })
      },
      sliderOptions: {
        thumbSize: THUMB_SIZE,
        trackSize: TRACK_SIZE,
        keyboardStep: 0.25,
        minorTickSpacing: 0.25,
        // pdom
        labelTagName: 'label',
        labelContent: a11yNameString,
        // voicing
        voicingOnEndResponseOptions: {
          withNameResponse: true
        }
      },
      // phet-io
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    });

    // Voicing goes through the NumberControl slider through AccessibleValueHandler
    this.slider.voicingNameResponse = a11yNameString;

    // ignore the selections of the PreferencesDialog, we always want to hear all responses
    // that happen when changing the voice attributes
    this.slider.voicingIgnoreVoicingManagerProperties = true;
    const voiceRateNonNormalPatternStringProperty = new PatternStringProperty(voiceRateDescriptionPatternStringProperty, {
      value: voiceRateProperty
    });
    const voiceRateResponseProperty = new DerivedProperty([voiceRateProperty, voiceRateNormalStringProperty, voiceRateNonNormalPatternStringProperty], (rate, normal, nonNormal) => {
      return rate === 1 ? normal : nonNormal;
    });
    this.slider.voicingObjectResponse = voiceRateResponseProperty;
    this.disposeVoiceRateNumberControl = () => {
      voiceRateResponseProperty.dispose();
      voiceRateNonNormalPatternStringProperty.dispose();
    };
  }
  dispose() {
    this.disposeVoiceRateNumberControl();
    super.dispose();
  }
}
/**
 * Inner class for the ComboBox that selects the voice for the voicingManager. This ComboBox can be created and destroyed
 * a few times as the browser list of supported voices may change while the SpeechSynthesis is first getting put to
 * use.
 */
class VoiceComboBox extends ComboBox {
  /**
   * @param  voiceProperty
   * @param voices - list of voices to include from the voicingManager
   * @param parentNode - node that acts as a parent for the ComboBox list
   * @param [providedOptions]
   */
  constructor(voiceProperty, voices, parentNode, providedOptions) {
    const options = optionize()({
      listPosition: 'above',
      accessibleName: voiceLabelStringProperty,
      comboBoxVoicingNameResponsePattern: voiceTitlePatternLabelStringProperty.value,
      // phet-io
      // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
      // Furthermore, opt out because we would need to instrument voices, but those could change between runtimes.
      tandem: Tandem.OPT_OUT
    }, providedOptions);
    const items = [];
    if (voices.length === 0) {
      items.push({
        value: null,
        createNode: tandem => new Text(noVoicesAvailableStringProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS),
        a11yName: noVoicesAvailableStringProperty
      });
    }
    voices.forEach(voice => {
      items.push({
        value: voice,
        createNode: tandem => new Text(voice.name, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS),
        a11yName: voice.name
      });
    });

    // since we are updating the list, set the VoiceProperty to the first available value, or null if there are
    // voices
    voiceProperty.set(items[0].value);
    super(voiceProperty, items, parentNode, options);

    // voicing -  responses for the button should always come through, regardless of user selection of
    // responses. As of 10/29/21, ComboBox will only read the name response (which are always read regardless)
    // so this isn't really necessary but it is prudent to include it anyway.
    this.button.voicingIgnoreVoicingManagerProperties = true;
    this.disposeVoiceComboBox = () => {
      items.forEach(item => {
        item.value = null;
      });
    };
  }
  dispose() {
    this.disposeVoiceComboBox();
    super.dispose();
  }
}

/**
 * A slider with labels and tick marks used to control voice rate of web speech synthesis.
 */
class VoicingPitchSlider extends VBox {
  constructor(labelString, voicePitchProperty) {
    const label = new Text(labelString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS);
    const voicePitchRange = voicePitchProperty.range;
    const slider = new HSlider(voicePitchProperty, voicePitchRange, {
      majorTickLength: 10,
      thumbSize: THUMB_SIZE,
      trackSize: TRACK_SIZE,
      keyboardStep: 0.25,
      shiftKeyboardStep: 0.1,
      // constrain the value to the nearest hundredths place so there is no overlap in described ranges in
      // VOICE_PITCH_DESCRIPTION_MAP
      constrainValue: value => Utils.roundToInterval(value, 0.01),
      // pdom
      labelTagName: 'label',
      labelContent: labelString,
      // voicing
      voicingNameResponse: labelString,
      // Voicing controls should not respect voicing response controls so user always hears information about them
      voicingIgnoreVoicingManagerProperties: true,
      // phet-io
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    });

    const lowLabel = new Text('Low', {
      font: new PhetFont(14)
    });
    slider.addMajorTick(voicePitchRange.min, lowLabel);
    const highLabel = new Text('High', {
      font: new PhetFont(14)
    });
    slider.addMajorTick(voicePitchRange.max, highLabel);
    super();

    // voicing
    const voicePitchListener = (pitch, previousValue) => {
      slider.voicingObjectResponse = this.getPitchDescriptionString(pitch);
    };
    voicePitchProperty.link(voicePitchListener);
    this.mutate({
      children: [label, slider],
      // see https://github.com/phetsims/scenery/issues/1433
      spacing: 5
    });
    this.disposeVoicePitchSlider = () => {
      label.dispose();
      slider.dispose();
      lowLabel.dispose();
      highLabel.dispose();
      voicePitchProperty.unlink(voicePitchListener);
    };
  }
  dispose() {
    this.disposeVoicePitchSlider();
    super.dispose();
  }

  /**
   * Gets a description of the pitch at the provided value from VOICE_PITCH_DESCRIPTION_MAP.
   */
  getPitchDescriptionString(pitchValue) {
    let pitchDescription = '';
    VOICE_PITCH_DESCRIPTION_MAP.forEach((description, range) => {
      if (range.contains(pitchValue)) {
        pitchDescription = description;
      }
    });
    assert && assert(pitchDescription, `no description found for pitch at value: ${pitchValue}`);
    return pitchDescription;
  }
}
joist.register('VoicingPanelSection', VoicingPanelSection);
export default VoicingPanelSection;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEaW1lbnNpb24yIiwiUmFuZ2UiLCJVdGlscyIsIm1lcmdlIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJOdW1iZXJDb250cm9sIiwiUGhldEZvbnQiLCJGb2N1c0hpZ2hsaWdodEZyb21Ob2RlIiwiTm9kZSIsIlByZXNzTGlzdGVuZXIiLCJUZXh0IiwiVkJveCIsInZvaWNpbmdNYW5hZ2VyIiwiVm9pY2luZ1RleHQiLCJDaGVja2JveCIsIkNvbWJvQm94IiwiRXhwYW5kQ29sbGFwc2VCdXR0b24iLCJIU2xpZGVyIiwiVGFuZGVtIiwiVXR0ZXJhbmNlIiwiam9pc3QiLCJKb2lzdFN0cmluZ3MiLCJQcmVmZXJlbmNlc0RpYWxvZyIsIlByZWZlcmVuY2VzUGFuZWxTZWN0aW9uIiwiUHJlZmVyZW5jZXNDb250cm9sIiwibG9jYWxlUHJvcGVydHkiLCJUb2dnbGVTd2l0Y2giLCJQcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cyIsIlBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsIkRlcml2ZWRQcm9wZXJ0eSIsInZvaWNpbmdMYWJlbFN0cmluZ1Byb3BlcnR5IiwiYTExeSIsInByZWZlcmVuY2VzIiwidGFicyIsImF1ZGlvIiwidm9pY2luZyIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJ0b29sYmFyTGFiZWxTdHJpbmdQcm9wZXJ0eSIsInRvb2xiYXIiLCJyYXRlU3RyaW5nUHJvcGVydHkiLCJjdXN0b21pemVWb2ljZSIsInJhdGUiLCJyYXRlTGFiZWxTdHJpbmdQcm9wZXJ0eSIsImxhYmVsU3RyaW5nU3RyaW5nUHJvcGVydHkiLCJwaXRjaFN0cmluZ1Byb3BlcnR5IiwicGl0Y2giLCJ2b2ljaW5nRW5hYmxlZFN0cmluZ1Byb3BlcnR5Iiwidm9pY2luZ09uU3RyaW5nUHJvcGVydHkiLCJ2b2ljaW5nRGlzYWJsZWRTdHJpbmdQcm9wZXJ0eSIsInZvaWNpbmdPZmZTdHJpbmdQcm9wZXJ0eSIsInZvaWNpbmdPZmZPbmx5QXZhaWxhYmxlSW5FbmdsaXNoU3RyaW5nUHJvcGVydHkiLCJ2b2ljZVZhcmlhYmxlc1BhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsInZhcmlhYmxlc1BhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsImN1c3RvbWl6ZVZvaWNlU3RyaW5nUHJvcGVydHkiLCJ0b29sYmFyUmVtb3ZlZFN0cmluZ1Byb3BlcnR5IiwidG9vbGJhckFkZGVkU3RyaW5nUHJvcGVydHkiLCJzaW1Wb2ljaW5nT3B0aW9uc1N0cmluZ1Byb3BlcnR5Iiwic2ltVm9pY2luZ09wdGlvbnMiLCJzaW1Wb2ljaW5nRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSIsImRlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJvYmplY3REZXRhaWxzTGFiZWxTdHJpbmdQcm9wZXJ0eSIsIm9iamVjdERldGFpbHMiLCJsYWJlbFN0cmluZ1Byb3BlcnR5IiwiY29udGV4dENoYW5nZXNMYWJlbFN0cmluZ1Byb3BlcnR5IiwiY29udGV4dENoYW5nZXMiLCJoZWxwZnVsSGludHNMYWJlbFN0cmluZ1Byb3BlcnR5IiwiaGVscGZ1bEhpbnRzIiwidm9pY2luZ09iamVjdENoYW5nZXNTdHJpbmdQcm9wZXJ0eSIsImVuYWJsZWRBbGVydFN0cmluZ1Byb3BlcnR5Iiwib2JqZWN0Q2hhbmdlc011dGVkU3RyaW5nUHJvcGVydHkiLCJkaXNhYmxlZEFsZXJ0U3RyaW5nUHJvcGVydHkiLCJ2b2ljaW5nQ29udGV4dENoYW5nZXNTdHJpbmdQcm9wZXJ0eSIsImNvbnRleHRDaGFuZ2VzTXV0ZWRTdHJpbmdQcm9wZXJ0eSIsInZvaWNpbmdIaW50c1N0cmluZ1Byb3BlcnR5IiwiaGludHNNdXRlZFN0cmluZ1Byb3BlcnR5Iiwidm9pY2VMYWJlbFN0cmluZ1Byb3BlcnR5Iiwidm9pY2UiLCJ2b2ljZVRpdGxlUGF0dGVybkxhYmVsU3RyaW5nUHJvcGVydHkiLCJ0aXRsZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsIm5vVm9pY2VzQXZhaWxhYmxlU3RyaW5nUHJvcGVydHkiLCJjdXN0b21pemVWb2ljZUV4cGFuZGVkU3RyaW5nUHJvcGVydHkiLCJleHBhbmRlZEFsZXJ0U3RyaW5nUHJvcGVydHkiLCJjdXN0b21pemVWb2ljZUNvbGxhcHNlZFN0cmluZ1Byb3BlcnR5IiwiY29sbGFwc2VkQWxlcnRTdHJpbmdQcm9wZXJ0eSIsInZvaWNlUmF0ZURlc2NyaXB0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5Iiwid3JpdHRlblZhcmlhYmxlc1BhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsImxhYmVsbGVkRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJ2b2ljZVJhdGVOb3JtYWxTdHJpbmdQcm9wZXJ0eSIsInJhbmdlRGVzY3JpcHRpb25zIiwiaW5Mb3dSYW5nZVN0cmluZ1Byb3BlcnR5IiwibG93U3RyaW5nUHJvcGVydHkiLCJpbk5vcm1hbFJhbmdlU3RyaW5nUHJvcGVydHkiLCJub3JtYWxTdHJpbmdQcm9wZXJ0eSIsImFib3ZlTm9ybWFsUmFuZ2VTdHJpbmdQcm9wZXJ0eSIsImFib3ZlTm9ybWFsU3RyaW5nUHJvcGVydHkiLCJpbkhpZ2hSYW5nZVN0cmluZ1Byb3BlcnR5IiwiaGlnaFN0cmluZ1Byb3BlcnR5Iiwidm9pY2luZ0VuZ2xpc2hPbmx5TGFiZWxTdHJpbmdQcm9wZXJ0eSIsInRpdGxlRW5nbGlzaE9ubHlTdHJpbmdQcm9wZXJ0eSIsInZvaWNpbmdEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5IiwiVk9JQ0VfUElUQ0hfREVTQ1JJUFRJT05fTUFQIiwiTWFwIiwic2V0IiwiVEhVTUJfU0laRSIsIlRSQUNLX1NJWkUiLCJWb2ljaW5nUGFuZWxTZWN0aW9uIiwiY29uc3RydWN0b3IiLCJhdWRpb01vZGVsIiwicHJvdmlkZWRPcHRpb25zIiwidmFsaWRWYWx1ZXMiLCJsZW5ndGgiLCJ2b2ljaW5nTGFiZWwiLCJQQU5FTF9TRUNUSU9OX0xBQkVMX09QVElPTlMiLCJ2b2ljaW5nRW5hYmxlZFJlYWRpbmdCbG9ja05hbWVSZXNwb25zZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsImxhYmVsIiwiZGVzY3JpcHRpb24iLCJ2b2ljaW5nRW5hYmxlZFN3aXRjaFZvaWNpbmdUZXh0IiwiUEFORUxfU0VDVElPTl9DT05URU5UX09QVElPTlMiLCJyZWFkaW5nQmxvY2tOYW1lUmVzcG9uc2UiLCJ2b2ljaW5nVG9nZ2xlU3dpdGNoIiwidm9pY2luZ0VuYWJsZWRQcm9wZXJ0eSIsImExMXlOYW1lIiwiVE9HR0xFX1NXSVRDSF9PUFRJT05TIiwidm9pY2luZ0VuYWJsZWRTd2l0Y2giLCJsYWJlbE5vZGUiLCJkZXNjcmlwdGlvbk5vZGUiLCJjb250cm9sTm9kZSIsInF1aWNrQWNjZXNzTGFiZWwiLCJ0b29sYmFyVG9nZ2xlU3dpdGNoIiwidG9vbGJhckVuYWJsZWRQcm9wZXJ0eSIsImxlZnRWYWx1ZUNvbnRleHRSZXNwb25zZSIsInJpZ2h0VmFsdWVDb250ZXh0UmVzcG9uc2UiLCJ0b29sYmFyRW5hYmxlZFN3aXRjaCIsInNwZWVjaE91dHB1dExhYmVsIiwidGFnTmFtZSIsImlubmVyQ29udGVudCIsInNwZWVjaE91dHB1dFJlYWRpbmdCbG9ja05hbWVSZXNwb25zZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsInNwZWVjaE91dHB1dERlc2NyaXB0aW9uIiwiY3JlYXRlQ2hlY2tib3giLCJsYWJlbFN0cmluZyIsInByb3BlcnR5IiwiY2hlY2tlZENvbnRleHRSZXNwb25zZSIsInVuY2hlY2tlZENvbnRleHRSZXNwb25zZSIsImRpc3Bvc2FibGUiLCJjaGVja2JveCIsImxhYmVsVGFnTmFtZSIsImxhYmVsQ29udGVudCIsInZvaWNpbmdOYW1lUmVzcG9uc2UiLCJ2b2ljaW5nSWdub3JlVm9pY2luZ01hbmFnZXJQcm9wZXJ0aWVzIiwidm9pY2VOYW1lUmVzcG9uc2VPblNlbGVjdGlvbiIsInRhbmRlbSIsIk9QVF9PVVQiLCJkaXNwb3NlRW1pdHRlciIsImFkZExpc3RlbmVyIiwiZGlzcG9zZSIsInNwZWVjaE91dHB1dENvbnRlbnQiLCJzcGVlY2hPdXRwdXRDaGVja2JveGVzIiwiYWxpZ24iLCJzcGFjaW5nIiwiVkVSVElDQUxfQ09OVEVOVF9TUEFDSU5HIiwiY2hpbGRyZW4iLCJ2b2ljaW5nT2JqZWN0UmVzcG9uc2VzRW5hYmxlZFByb3BlcnR5Iiwidm9pY2luZ0NvbnRleHRSZXNwb25zZXNFbmFibGVkUHJvcGVydHkiLCJ2b2ljaW5nSGludFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eSIsImxlZnRUb3AiLCJsZWZ0Qm90dG9tIiwicGx1c1hZIiwiQ09OVEVOVF9JTkRFTlRBVElPTl9TUEFDSU5HIiwicmF0ZVNsaWRlciIsIlZvaWNlUmF0ZU51bWJlckNvbnRyb2wiLCJ2b2ljZVJhdGVQcm9wZXJ0eSIsInBpdGNoU2xpZGVyIiwiVm9pY2luZ1BpdGNoU2xpZGVyIiwidm9pY2VQaXRjaFByb3BlcnR5Iiwidm9pY2VPcHRpb25zQ29udGVudCIsInZvaWNlT3B0aW9uc0xhYmVsIiwiY3Vyc29yIiwidm9pY2VPcHRpb25zT3BlblByb3BlcnR5IiwiZXhwYW5kQ29sbGFwc2VCdXR0b24iLCJzaWRlTGVuZ3RoIiwidm9pY2VPcHRpb25zQ29udGFpbmVyIiwidm9pY2VPcHRpb25zUHJlc3NMaXN0ZW5lciIsInByZXNzIiwidG9nZ2xlIiwiYWRkSW5wdXRMaXN0ZW5lciIsImNvbnRlbnQiLCJsZWZ0Q2VudGVyIiwicmlnaHRDZW50ZXIiLCJsaW5rIiwib3BlbiIsInZpc2libGUiLCJmb2N1c0hpZ2hsaWdodCIsInRpdGxlTm9kZSIsImNvbnRlbnROb2RlIiwiY29udGVudFZpc2liaWxpdHlMaXN0ZW5lciIsImVuYWJsZWQiLCJsb2NhbGVMaXN0ZW5lciIsImxvY2FsZSIsImVuYWJsZWRQcm9wZXJ0eSIsInZhbHVlIiwic3RhcnRzV2l0aCIsInZvaWNpbmdFbmFibGVkVXR0ZXJhbmNlIiwidm9pY2luZ0VuYWJsZWRQcm9wZXJ0eUxpc3RlbmVyIiwidm9pY2luZ01haW5XaW5kb3dWb2ljaW5nRW5hYmxlZFByb3BlcnR5IiwiYWxlcnQiLCJpc0luc2lkZVBoZXRpb0FyY2hldHlwZSIsInNwZWFrSWdub3JpbmdFbmFibGVkIiwiYWxlcnREZXNjcmlwdGlvblV0dGVyYW5jZSIsImxhenlMaW5rIiwidm9pY2VDb21ib0JveCIsInZvaWNlc0NoYW5nZWRMaXN0ZW5lciIsInZvaWNlcyIsInJlbW92ZUNoaWxkIiwidm9pY2VMaXN0IiwicHJpb3JpdGl6ZWRWb2ljZXMiLCJnZXRFbmdsaXNoUHJpb3JpdGl6ZWRWb2ljZXMiLCJzbGljZSIsInBhcmVudCIsInBoZXQiLCJzaW0iLCJ0b3BMYXllciIsIlZvaWNlQ29tYm9Cb3giLCJ2b2ljZVByb3BlcnR5IiwiYWRkQ2hpbGQiLCJ2b2ljZXNQcm9wZXJ0eSIsImFsZXJ0U3RyaW5nUHJvcGVydHkiLCJ2b2ljaW5nU3BlYWtDb250ZXh0UmVzcG9uc2UiLCJjb250ZXh0UmVzcG9uc2UiLCJkaXNwb3NlVm9pY2luZ1BhbmVsU2VjdGlvbiIsInVubGluayIsImExMXlOYW1lU3RyaW5nIiwicmFuZ2UiLCJpbmNsdWRlQXJyb3dCdXR0b25zIiwibGF5b3V0RnVuY3Rpb24iLCJjcmVhdGVMYXlvdXRGdW5jdGlvbjQiLCJkZWx0YSIsInRpdGxlTm9kZU9wdGlvbnMiLCJtYXhXaWR0aCIsIm51bWJlckRpc3BsYXlPcHRpb25zIiwiZGVjaW1hbFBsYWNlcyIsInZhbHVlUGF0dGVybiIsInRleHRPcHRpb25zIiwic2xpZGVyT3B0aW9ucyIsInRodW1iU2l6ZSIsInRyYWNrU2l6ZSIsImtleWJvYXJkU3RlcCIsIm1pbm9yVGlja1NwYWNpbmciLCJ2b2ljaW5nT25FbmRSZXNwb25zZU9wdGlvbnMiLCJ3aXRoTmFtZVJlc3BvbnNlIiwic2xpZGVyIiwidm9pY2VSYXRlTm9uTm9ybWFsUGF0dGVyblN0cmluZ1Byb3BlcnR5Iiwidm9pY2VSYXRlUmVzcG9uc2VQcm9wZXJ0eSIsIm5vcm1hbCIsIm5vbk5vcm1hbCIsInZvaWNpbmdPYmplY3RSZXNwb25zZSIsImRpc3Bvc2VWb2ljZVJhdGVOdW1iZXJDb250cm9sIiwicGFyZW50Tm9kZSIsIm9wdGlvbnMiLCJsaXN0UG9zaXRpb24iLCJhY2Nlc3NpYmxlTmFtZSIsImNvbWJvQm94Vm9pY2luZ05hbWVSZXNwb25zZVBhdHRlcm4iLCJpdGVtcyIsInB1c2giLCJjcmVhdGVOb2RlIiwiZm9yRWFjaCIsIm5hbWUiLCJidXR0b24iLCJkaXNwb3NlVm9pY2VDb21ib0JveCIsIml0ZW0iLCJ2b2ljZVBpdGNoUmFuZ2UiLCJtYWpvclRpY2tMZW5ndGgiLCJzaGlmdEtleWJvYXJkU3RlcCIsImNvbnN0cmFpblZhbHVlIiwicm91bmRUb0ludGVydmFsIiwibG93TGFiZWwiLCJmb250IiwiYWRkTWFqb3JUaWNrIiwibWluIiwiaGlnaExhYmVsIiwibWF4Iiwidm9pY2VQaXRjaExpc3RlbmVyIiwicHJldmlvdXNWYWx1ZSIsImdldFBpdGNoRGVzY3JpcHRpb25TdHJpbmciLCJtdXRhdGUiLCJkaXNwb3NlVm9pY2VQaXRjaFNsaWRlciIsInBpdGNoVmFsdWUiLCJwaXRjaERlc2NyaXB0aW9uIiwiY29udGFpbnMiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZvaWNpbmdQYW5lbFNlY3Rpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIHNlY3Rpb24gb2YgUHJlZmVyZW5jZXNEaWFsb2cgY29udGVudCBpbiB0aGUgXCJBdWRpb1wiIHBhbmVsIHJlbGF0ZWQgdG8gdm9pY2luZy5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBOdW1iZXJDb250cm9sIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OdW1iZXJDb250cm9sLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IEZvY3VzSGlnaGxpZ2h0RnJvbU5vZGUsIE5vZGUsIFByZXNzTGlzdGVuZXIsIFRleHQsIFZCb3gsIHZvaWNpbmdNYW5hZ2VyLCBWb2ljaW5nVGV4dCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDaGVja2JveCBmcm9tICcuLi8uLi8uLi9zdW4vanMvQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgQ29tYm9Cb3gsIHsgQ29tYm9Cb3hJdGVtLCBDb21ib0JveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9zdW4vanMvQ29tYm9Cb3guanMnO1xyXG5pbXBvcnQgRXhwYW5kQ29sbGFwc2VCdXR0b24gZnJvbSAnLi4vLi4vLi4vc3VuL2pzL0V4cGFuZENvbGxhcHNlQnV0dG9uLmpzJztcclxuaW1wb3J0IEhTbGlkZXIgZnJvbSAnLi4vLi4vLi4vc3VuL2pzL0hTbGlkZXIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgVXR0ZXJhbmNlIGZyb20gJy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2UuanMnO1xyXG5pbXBvcnQgam9pc3QgZnJvbSAnLi4vam9pc3QuanMnO1xyXG5pbXBvcnQgSm9pc3RTdHJpbmdzIGZyb20gJy4uL0pvaXN0U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBQcmVmZXJlbmNlc0RpYWxvZyBmcm9tICcuL1ByZWZlcmVuY2VzRGlhbG9nLmpzJztcclxuaW1wb3J0IHsgQXVkaW9Nb2RlbCB9IGZyb20gJy4vUHJlZmVyZW5jZXNNb2RlbC5qcyc7XHJcbmltcG9ydCBQcmVmZXJlbmNlc1BhbmVsU2VjdGlvbiwgeyBQcmVmZXJlbmNlc1BhbmVsU2VjdGlvbk9wdGlvbnMgfSBmcm9tICcuL1ByZWZlcmVuY2VzUGFuZWxTZWN0aW9uLmpzJztcclxuaW1wb3J0IFByZWZlcmVuY2VzQ29udHJvbCBmcm9tICcuL1ByZWZlcmVuY2VzQ29udHJvbC5qcyc7XHJcbmltcG9ydCBsb2NhbGVQcm9wZXJ0eSwgeyBMb2NhbGUgfSBmcm9tICcuLi9pMThuL2xvY2FsZVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRvZ2dsZVN3aXRjaCwgeyBUb2dnbGVTd2l0Y2hPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vc3VuL2pzL1RvZ2dsZVN3aXRjaC5qcyc7XHJcbmltcG9ydCBQcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cyBmcm9tICcuL1ByZWZlcmVuY2VzRGlhbG9nQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1BhdHRlcm5TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgdHlwZSBEaXNwb3NhYmxlIGZyb20gJy4uLy4uLy4uL2F4b24vanMvRGlzcG9zYWJsZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuLy8gbm9uZSBvZiB0aGUgVm9pY2luZyBzdHJpbmdzIG9yIGZlYXR1cmUgaXMgdHJhbnNsYXRhYmxlIHlldCwgYWxsIHN0cmluZ3MgaW4gdGhpcyBmaWxlXHJcbi8vIGFyZSBuZXN0ZWQgdW5kZXIgdGhlICdhMTF5JyBzZWN0aW9uIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZXkgYXJlIG5vdCB0cmFuc2xhdGFibGVcclxuY29uc3Qgdm9pY2luZ0xhYmVsU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcudGl0bGVTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgdG9vbGJhckxhYmVsU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcudG9vbGJhci50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCByYXRlU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuY3VzdG9taXplVm9pY2UucmF0ZS50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCByYXRlTGFiZWxTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5jdXN0b21pemVWb2ljZS5yYXRlLmxhYmVsU3RyaW5nU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHBpdGNoU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuY3VzdG9taXplVm9pY2UucGl0Y2gudGl0bGVTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgdm9pY2luZ0VuYWJsZWRTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy52b2ljaW5nT25TdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgdm9pY2luZ0Rpc2FibGVkU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcudm9pY2luZ09mZlN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCB2b2ljaW5nT2ZmT25seUF2YWlsYWJsZUluRW5nbGlzaFN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLnZvaWNpbmdPZmZPbmx5QXZhaWxhYmxlSW5FbmdsaXNoU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHZvaWNlVmFyaWFibGVzUGF0dGVyblN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLmN1c3RvbWl6ZVZvaWNlLnZhcmlhYmxlc1BhdHRlcm5TdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgY3VzdG9taXplVm9pY2VTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5jdXN0b21pemVWb2ljZS50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuY29uc3QgdG9vbGJhclJlbW92ZWRTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy50b29sYmFyLnRvb2xiYXJSZW1vdmVkU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHRvb2xiYXJBZGRlZFN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLnRvb2xiYXIudG9vbGJhckFkZGVkU3RyaW5nUHJvcGVydHk7XHJcblxyXG5jb25zdCBzaW1Wb2ljaW5nT3B0aW9uc1N0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLnNpbVZvaWNpbmdPcHRpb25zLnRpdGxlU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNpbVZvaWNpbmdEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLnNpbVZvaWNpbmdPcHRpb25zLmRlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHk7XHJcblxyXG5jb25zdCBvYmplY3REZXRhaWxzTGFiZWxTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5zaW1Wb2ljaW5nT3B0aW9ucy5vYmplY3REZXRhaWxzLmxhYmVsU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IGNvbnRleHRDaGFuZ2VzTGFiZWxTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5zaW1Wb2ljaW5nT3B0aW9ucy5jb250ZXh0Q2hhbmdlcy5sYWJlbFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBoZWxwZnVsSGludHNMYWJlbFN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLnNpbVZvaWNpbmdPcHRpb25zLmhlbHBmdWxIaW50cy5sYWJlbFN0cmluZ1Byb3BlcnR5O1xyXG5cclxuY29uc3Qgdm9pY2luZ09iamVjdENoYW5nZXNTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5zaW1Wb2ljaW5nT3B0aW9ucy5vYmplY3REZXRhaWxzLmVuYWJsZWRBbGVydFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBvYmplY3RDaGFuZ2VzTXV0ZWRTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5zaW1Wb2ljaW5nT3B0aW9ucy5vYmplY3REZXRhaWxzLmRpc2FibGVkQWxlcnRTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgdm9pY2luZ0NvbnRleHRDaGFuZ2VzU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuc2ltVm9pY2luZ09wdGlvbnMuY29udGV4dENoYW5nZXMuZW5hYmxlZEFsZXJ0U3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IGNvbnRleHRDaGFuZ2VzTXV0ZWRTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5zaW1Wb2ljaW5nT3B0aW9ucy5jb250ZXh0Q2hhbmdlcy5kaXNhYmxlZEFsZXJ0U3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHZvaWNpbmdIaW50c1N0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLnNpbVZvaWNpbmdPcHRpb25zLmhlbHBmdWxIaW50cy5lbmFibGVkQWxlcnRTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgaGludHNNdXRlZFN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLnNpbVZvaWNpbmdPcHRpb25zLmhlbHBmdWxIaW50cy5kaXNhYmxlZEFsZXJ0U3RyaW5nUHJvcGVydHk7XHJcblxyXG5jb25zdCB2b2ljZUxhYmVsU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuY3VzdG9taXplVm9pY2Uudm9pY2UudGl0bGVTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgdm9pY2VUaXRsZVBhdHRlcm5MYWJlbFN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLmN1c3RvbWl6ZVZvaWNlLnZvaWNlLnRpdGxlUGF0dGVyblN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBub1ZvaWNlc0F2YWlsYWJsZVN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLmN1c3RvbWl6ZVZvaWNlLnZvaWNlLm5vVm9pY2VzQXZhaWxhYmxlU3RyaW5nUHJvcGVydHk7XHJcblxyXG5jb25zdCBjdXN0b21pemVWb2ljZUV4cGFuZGVkU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuY3VzdG9taXplVm9pY2UuZXhwYW5kZWRBbGVydFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBjdXN0b21pemVWb2ljZUNvbGxhcHNlZFN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLmN1c3RvbWl6ZVZvaWNlLmNvbGxhcHNlZEFsZXJ0U3RyaW5nUHJvcGVydHk7XHJcblxyXG5jb25zdCB2b2ljZVJhdGVEZXNjcmlwdGlvblBhdHRlcm5TdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5jdXN0b21pemVWb2ljZS53cml0dGVuVmFyaWFibGVzUGF0dGVyblN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBsYWJlbGxlZERlc2NyaXB0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5sYWJlbGxlZERlc2NyaXB0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5O1xyXG5cclxuY29uc3Qgdm9pY2VSYXRlTm9ybWFsU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuY3VzdG9taXplVm9pY2UucmF0ZS5yYW5nZURlc2NyaXB0aW9ucy52b2ljZVJhdGVOb3JtYWxTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgaW5Mb3dSYW5nZVN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLmN1c3RvbWl6ZVZvaWNlLnJhdGUucmFuZ2VEZXNjcmlwdGlvbnMubG93U3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IGluTm9ybWFsUmFuZ2VTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5jdXN0b21pemVWb2ljZS5yYXRlLnJhbmdlRGVzY3JpcHRpb25zLm5vcm1hbFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBhYm92ZU5vcm1hbFJhbmdlU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuY3VzdG9taXplVm9pY2UucmF0ZS5yYW5nZURlc2NyaXB0aW9ucy5hYm92ZU5vcm1hbFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBpbkhpZ2hSYW5nZVN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLmN1c3RvbWl6ZVZvaWNlLnJhdGUucmFuZ2VEZXNjcmlwdGlvbnMuaGlnaFN0cmluZ1Byb3BlcnR5O1xyXG5cclxuLy8gVm9pY2luZyBjYW4gYXBwZWFyIGJ1dCBiZWNvbWUgZGlzYWJsZWQgd2hlbiBydW5uaW5nIHdpdGggbXVsdGlwbGUgbG9jYWxlcy4gVGhpcyB0cmFuc2xhdGFibGUgbGFiZWwgaXMgcHJlc2VudCBmb3JcclxuLy8gdHJhbnNsYXRlZCBzaW1zIGluIHRoaXMgY2FzZS5cclxuY29uc3Qgdm9pY2luZ0VuZ2xpc2hPbmx5TGFiZWxTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcudGl0bGVFbmdsaXNoT25seVN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCB2b2ljaW5nRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuZGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eTtcclxuXHJcbmNvbnN0IFZPSUNFX1BJVENIX0RFU0NSSVBUSU9OX01BUCA9IG5ldyBNYXAoKTtcclxuVk9JQ0VfUElUQ0hfREVTQ1JJUFRJT05fTUFQLnNldCggbmV3IFJhbmdlKCAwLjUsIDAuNzUgKSwgaW5Mb3dSYW5nZVN0cmluZ1Byb3BlcnR5ICk7XHJcblZPSUNFX1BJVENIX0RFU0NSSVBUSU9OX01BUC5zZXQoIG5ldyBSYW5nZSggMC43NSwgMS4yNSApLCBpbk5vcm1hbFJhbmdlU3RyaW5nUHJvcGVydHkgKTtcclxuVk9JQ0VfUElUQ0hfREVTQ1JJUFRJT05fTUFQLnNldCggbmV3IFJhbmdlKCAxLjI1LCAxLjUgKSwgYWJvdmVOb3JtYWxSYW5nZVN0cmluZ1Byb3BlcnR5ICk7XHJcblZPSUNFX1BJVENIX0RFU0NSSVBUSU9OX01BUC5zZXQoIG5ldyBSYW5nZSggMS41LCAyICksIGluSGlnaFJhbmdlU3RyaW5nUHJvcGVydHkgKTtcclxuXHJcbmNvbnN0IFRIVU1CX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggMTMsIDI2ICk7XHJcbmNvbnN0IFRSQUNLX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggMTAwLCA1ICk7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxudHlwZSBWb2ljaW5nUGFuZWxTZWN0aW9uT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUHJlZmVyZW5jZXNQYW5lbFNlY3Rpb25PcHRpb25zO1xyXG5cclxuY2xhc3MgVm9pY2luZ1BhbmVsU2VjdGlvbiBleHRlbmRzIFByZWZlcmVuY2VzUGFuZWxTZWN0aW9uIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VWb2ljaW5nUGFuZWxTZWN0aW9uOiAoKSA9PiB2b2lkO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gYXVkaW9Nb2RlbCAtIGNvbmZpZ3VyYXRpb24gZm9yIGF1ZGlvIHNldHRpbmdzLCBzZWUgUHJlZmVyZW5jZXNNb2RlbFxyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYXVkaW9Nb2RlbDogQXVkaW9Nb2RlbCwgcHJvdmlkZWRPcHRpb25zPzogVm9pY2luZ1BhbmVsU2VjdGlvbk9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gVm9pY2luZyBmZWF0dXJlIG9ubHkgd29ya3Mgd2hlbiBydW5uaW5nIGluIEVuZ2xpc2guIElmIHJ1bm5pbmcgaW4gYSB2ZXJzaW9uIHdoZXJlIHlvdSBjYW4gY2hhbmdlIGxvY2FsZSxcclxuICAgIC8vIGluZGljYXRlIHRocm91Z2ggdGhlIHRpdGxlIHRoYXQgdGhlIGZlYXR1cmUgd2lsbCBvbmx5IHdvcmsgaW4gRW5nbGlzaC5cclxuICAgIGNvbnN0IHRpdGxlU3RyaW5nUHJvcGVydHkgPSAoIGxvY2FsZVByb3BlcnR5LnZhbGlkVmFsdWVzICYmIGxvY2FsZVByb3BlcnR5LnZhbGlkVmFsdWVzLmxlbmd0aCA+IDEgKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pY2luZ0VuZ2xpc2hPbmx5TGFiZWxTdHJpbmdQcm9wZXJ0eSA6IHZvaWNpbmdMYWJlbFN0cmluZ1Byb3BlcnR5O1xyXG5cclxuICAgIC8vIHRoZSBjaGVja2JveCBpcyB0aGUgdGl0bGUgZm9yIHRoZSBzZWN0aW9uIGFuZCB0b3RhbGx5IGVuYWJsZXMvZGlzYWJsZXMgdGhlIGZlYXR1cmVcclxuICAgIGNvbnN0IHZvaWNpbmdMYWJlbCA9IG5ldyBUZXh0KCB0aXRsZVN0cmluZ1Byb3BlcnR5LCBQcmVmZXJlbmNlc0RpYWxvZy5QQU5FTF9TRUNUSU9OX0xBQkVMX09QVElPTlMgKTtcclxuICAgIGNvbnN0IHZvaWNpbmdFbmFibGVkUmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlUGF0dGVyblN0cmluZ1Byb3BlcnR5ID0gbmV3IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggbGFiZWxsZWREZXNjcmlwdGlvblBhdHRlcm5TdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBsYWJlbDogdGl0bGVTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgZGVzY3JpcHRpb246IHZvaWNpbmdEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCB2b2ljaW5nRW5hYmxlZFN3aXRjaFZvaWNpbmdUZXh0ID0gbmV3IFZvaWNpbmdUZXh0KCB2b2ljaW5nRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSwgbWVyZ2UoIHt9LCBQcmVmZXJlbmNlc0RpYWxvZy5QQU5FTF9TRUNUSU9OX0NPTlRFTlRfT1BUSU9OUywge1xyXG4gICAgICByZWFkaW5nQmxvY2tOYW1lUmVzcG9uc2U6IHZvaWNpbmdFbmFibGVkUmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlUGF0dGVyblN0cmluZ1Byb3BlcnR5XHJcbiAgICB9ICkgKTtcclxuICAgIGNvbnN0IHZvaWNpbmdUb2dnbGVTd2l0Y2ggPSBuZXcgVG9nZ2xlU3dpdGNoKCBhdWRpb01vZGVsLnZvaWNpbmdFbmFibGVkUHJvcGVydHksIGZhbHNlLCB0cnVlLCBjb21iaW5lT3B0aW9uczxUb2dnbGVTd2l0Y2hPcHRpb25zPigge1xyXG4gICAgICBhMTF5TmFtZTogdGl0bGVTdHJpbmdQcm9wZXJ0eVxyXG4gICAgfSwgUHJlZmVyZW5jZXNEaWFsb2dDb25zdGFudHMuVE9HR0xFX1NXSVRDSF9PUFRJT05TICkgKTtcclxuICAgIGNvbnN0IHZvaWNpbmdFbmFibGVkU3dpdGNoID0gbmV3IFByZWZlcmVuY2VzQ29udHJvbCgge1xyXG4gICAgICBsYWJlbE5vZGU6IHZvaWNpbmdMYWJlbCxcclxuICAgICAgZGVzY3JpcHRpb25Ob2RlOiB2b2ljaW5nRW5hYmxlZFN3aXRjaFZvaWNpbmdUZXh0LFxyXG4gICAgICBjb250cm9sTm9kZTogdm9pY2luZ1RvZ2dsZVN3aXRjaFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNoZWNrYm94IGZvciB0aGUgdG9vbGJhclxyXG4gICAgY29uc3QgcXVpY2tBY2Nlc3NMYWJlbCA9IG5ldyBUZXh0KCB0b29sYmFyTGFiZWxTdHJpbmdQcm9wZXJ0eSwgUHJlZmVyZW5jZXNEaWFsb2cuUEFORUxfU0VDVElPTl9MQUJFTF9PUFRJT05TICk7XHJcbiAgICBjb25zdCB0b29sYmFyVG9nZ2xlU3dpdGNoID0gbmV3IFRvZ2dsZVN3aXRjaCggYXVkaW9Nb2RlbC50b29sYmFyRW5hYmxlZFByb3BlcnR5LCBmYWxzZSwgdHJ1ZSwgY29tYmluZU9wdGlvbnM8VG9nZ2xlU3dpdGNoT3B0aW9ucz4oIHtcclxuICAgICAgYTExeU5hbWU6IHRvb2xiYXJMYWJlbFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBsZWZ0VmFsdWVDb250ZXh0UmVzcG9uc2U6IHRvb2xiYXJSZW1vdmVkU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIHJpZ2h0VmFsdWVDb250ZXh0UmVzcG9uc2U6IHRvb2xiYXJBZGRlZFN0cmluZ1Byb3BlcnR5XHJcbiAgICB9LCBQcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cy5UT0dHTEVfU1dJVENIX09QVElPTlMgKSApO1xyXG4gICAgY29uc3QgdG9vbGJhckVuYWJsZWRTd2l0Y2ggPSBuZXcgUHJlZmVyZW5jZXNDb250cm9sKCB7XHJcbiAgICAgIGxhYmVsTm9kZTogcXVpY2tBY2Nlc3NMYWJlbCxcclxuICAgICAgY29udHJvbE5vZGU6IHRvb2xiYXJUb2dnbGVTd2l0Y2hcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTcGVlY2ggb3V0cHV0IGxldmVsc1xyXG4gICAgY29uc3Qgc3BlZWNoT3V0cHV0TGFiZWwgPSBuZXcgVGV4dCggc2ltVm9pY2luZ09wdGlvbnNTdHJpbmdQcm9wZXJ0eSwgbWVyZ2UoIHt9LCBQcmVmZXJlbmNlc0RpYWxvZy5QQU5FTF9TRUNUSU9OX0xBQkVMX09QVElPTlMsIHtcclxuXHJcbiAgICAgIC8vIHBkb21cclxuICAgICAgdGFnTmFtZTogJ2gzJyxcclxuICAgICAgaW5uZXJDb250ZW50OiBzaW1Wb2ljaW5nT3B0aW9uc1N0cmluZ1Byb3BlcnR5XHJcbiAgICB9ICkgKTtcclxuICAgIGNvbnN0IHNwZWVjaE91dHB1dFJlYWRpbmdCbG9ja05hbWVSZXNwb25zZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSA9IG5ldyBQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIGxhYmVsbGVkRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgbGFiZWw6IHNpbVZvaWNpbmdPcHRpb25zU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBzaW1Wb2ljaW5nRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG4gICAgY29uc3Qgc3BlZWNoT3V0cHV0RGVzY3JpcHRpb24gPSBuZXcgVm9pY2luZ1RleHQoIHNpbVZvaWNpbmdEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5LCBtZXJnZSgge30sIFByZWZlcmVuY2VzRGlhbG9nLlBBTkVMX1NFQ1RJT05fQ09OVEVOVF9PUFRJT05TLCB7XHJcbiAgICAgIHJlYWRpbmdCbG9ja05hbWVSZXNwb25zZTogc3BlZWNoT3V0cHV0UmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlUGF0dGVyblN0cmluZ1Byb3BlcnR5XHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIGNoZWNrYm94IGZvciB0aGUgZmVhdHVyZXMgb2Ygdm9pY2luZyBjb250ZW50IHdpdGggYSBsYWJlbC5cclxuICAgICAqL1xyXG4gICAgY29uc3QgY3JlYXRlQ2hlY2tib3ggPSAoIGxhYmVsU3RyaW5nOiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCBwcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZENvbnRleHRSZXNwb25zZTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmNoZWNrZWRDb250ZXh0UmVzcG9uc2U6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4sIGRpc3Bvc2FibGU6IERpc3Bvc2FibGUgKTogQ2hlY2tib3ggPT4ge1xyXG4gICAgICBjb25zdCBsYWJlbE5vZGUgPSBuZXcgVGV4dCggbGFiZWxTdHJpbmcsIFByZWZlcmVuY2VzRGlhbG9nLlBBTkVMX1NFQ1RJT05fQ09OVEVOVF9PUFRJT05TICk7XHJcbiAgICAgIGNvbnN0IGNoZWNrYm94ID0gbmV3IENoZWNrYm94KCBwcm9wZXJ0eSwgbGFiZWxOb2RlLCB7XHJcblxyXG4gICAgICAgIC8vIHBkb21cclxuICAgICAgICBsYWJlbFRhZ05hbWU6ICdsYWJlbCcsXHJcbiAgICAgICAgbGFiZWxDb250ZW50OiBsYWJlbFN0cmluZyxcclxuXHJcbiAgICAgICAgLy8gdm9pY2luZ1xyXG4gICAgICAgIHZvaWNpbmdOYW1lUmVzcG9uc2U6IGxhYmVsU3RyaW5nLFxyXG4gICAgICAgIHZvaWNpbmdJZ25vcmVWb2ljaW5nTWFuYWdlclByb3BlcnRpZXM6IHRydWUsXHJcbiAgICAgICAgdm9pY2VOYW1lUmVzcG9uc2VPblNlbGVjdGlvbjogZmFsc2UsXHJcblxyXG4gICAgICAgIC8vIGJvdGggcGRvbSBhbmQgdm9pY2luZ1xyXG4gICAgICAgIGNoZWNrZWRDb250ZXh0UmVzcG9uc2U6IGNoZWNrZWRDb250ZXh0UmVzcG9uc2UsXHJcbiAgICAgICAgdW5jaGVja2VkQ29udGV4dFJlc3BvbnNlOiB1bmNoZWNrZWRDb250ZXh0UmVzcG9uc2UsXHJcblxyXG4gICAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIC8vIFdlIGRvbid0IHdhbnQgdG8gaW5zdHJ1bWVudCBjb21wb25lbnRzIGZvciBwcmVmZXJlbmNlcywgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy83NDQjaXNzdWVjb21tZW50LTExOTYwMjgzNjJcclxuICAgICAgfSApO1xyXG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgICAgbGFiZWxOb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgICBjaGVja2JveC5kaXNwb3NlKCk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHJldHVybiBjaGVja2JveDtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3Qgc3BlZWNoT3V0cHV0Q29udGVudCA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgY29uc3Qgc3BlZWNoT3V0cHV0Q2hlY2tib3hlcyA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIHNwYWNpbmc6IFByZWZlcmVuY2VzRGlhbG9nLlZFUlRJQ0FMX0NPTlRFTlRfU1BBQ0lORyxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBjcmVhdGVDaGVja2JveCggb2JqZWN0RGV0YWlsc0xhYmVsU3RyaW5nUHJvcGVydHksIGF1ZGlvTW9kZWwudm9pY2luZ09iamVjdFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eSxcclxuICAgICAgICAgIHZvaWNpbmdPYmplY3RDaGFuZ2VzU3RyaW5nUHJvcGVydHksIG9iamVjdENoYW5nZXNNdXRlZFN0cmluZ1Byb3BlcnR5LCBzcGVlY2hPdXRwdXRMYWJlbFxyXG4gICAgICAgICksXHJcbiAgICAgICAgY3JlYXRlQ2hlY2tib3goIGNvbnRleHRDaGFuZ2VzTGFiZWxTdHJpbmdQcm9wZXJ0eSwgYXVkaW9Nb2RlbC52b2ljaW5nQ29udGV4dFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eSxcclxuICAgICAgICAgIHZvaWNpbmdDb250ZXh0Q2hhbmdlc1N0cmluZ1Byb3BlcnR5LCBjb250ZXh0Q2hhbmdlc011dGVkU3RyaW5nUHJvcGVydHksIHNwZWVjaE91dHB1dExhYmVsXHJcbiAgICAgICAgKSxcclxuICAgICAgICBjcmVhdGVDaGVja2JveCggaGVscGZ1bEhpbnRzTGFiZWxTdHJpbmdQcm9wZXJ0eSwgYXVkaW9Nb2RlbC52b2ljaW5nSGludFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eSxcclxuICAgICAgICAgIHZvaWNpbmdIaW50c1N0cmluZ1Byb3BlcnR5LCBoaW50c011dGVkU3RyaW5nUHJvcGVydHksIHNwZWVjaE91dHB1dExhYmVsXHJcbiAgICAgICAgKVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3BlZWNoT3V0cHV0Q29udGVudC5jaGlsZHJlbiA9IFsgc3BlZWNoT3V0cHV0TGFiZWwsIHNwZWVjaE91dHB1dERlc2NyaXB0aW9uLCBzcGVlY2hPdXRwdXRDaGVja2JveGVzIF07XHJcbiAgICBzcGVlY2hPdXRwdXREZXNjcmlwdGlvbi5sZWZ0VG9wID0gc3BlZWNoT3V0cHV0TGFiZWwubGVmdEJvdHRvbS5wbHVzWFkoIDAsIFByZWZlcmVuY2VzRGlhbG9nLlZFUlRJQ0FMX0NPTlRFTlRfU1BBQ0lORyApO1xyXG4gICAgc3BlZWNoT3V0cHV0Q2hlY2tib3hlcy5sZWZ0VG9wID0gc3BlZWNoT3V0cHV0RGVzY3JpcHRpb24ubGVmdEJvdHRvbS5wbHVzWFkoIFByZWZlcmVuY2VzRGlhbG9nLkNPTlRFTlRfSU5ERU5UQVRJT05fU1BBQ0lORywgUHJlZmVyZW5jZXNEaWFsb2cuVkVSVElDQUxfQ09OVEVOVF9TUEFDSU5HICk7XHJcblxyXG4gICAgY29uc3QgcmF0ZVNsaWRlciA9IG5ldyBWb2ljZVJhdGVOdW1iZXJDb250cm9sKCByYXRlU3RyaW5nUHJvcGVydHksIHJhdGVMYWJlbFN0cmluZ1Byb3BlcnR5LCBhdWRpb01vZGVsLnZvaWNlUmF0ZVByb3BlcnR5ICk7XHJcbiAgICBjb25zdCBwaXRjaFNsaWRlciA9IG5ldyBWb2ljaW5nUGl0Y2hTbGlkZXIoIHBpdGNoU3RyaW5nUHJvcGVydHksIGF1ZGlvTW9kZWwudm9pY2VQaXRjaFByb3BlcnR5ICk7XHJcbiAgICBjb25zdCB2b2ljZU9wdGlvbnNDb250ZW50ID0gbmV3IFZCb3goIHtcclxuICAgICAgc3BhY2luZzogUHJlZmVyZW5jZXNEaWFsb2cuVkVSVElDQUxfQ09OVEVOVF9TUEFDSU5HLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIHJhdGVTbGlkZXIsXHJcbiAgICAgICAgcGl0Y2hTbGlkZXJcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHZvaWNlIG9wdGlvbnNcclxuICAgIGNvbnN0IHZvaWNlT3B0aW9uc0xhYmVsID0gbmV3IFRleHQoIGN1c3RvbWl6ZVZvaWNlU3RyaW5nUHJvcGVydHksIG1lcmdlKCB7fSwgUHJlZmVyZW5jZXNEaWFsb2cuUEFORUxfU0VDVElPTl9MQUJFTF9PUFRJT05TLCB7XHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInXHJcbiAgICB9ICkgKTtcclxuICAgIGNvbnN0IHZvaWNlT3B0aW9uc09wZW5Qcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICBjb25zdCBleHBhbmRDb2xsYXBzZUJ1dHRvbiA9IG5ldyBFeHBhbmRDb2xsYXBzZUJ1dHRvbiggdm9pY2VPcHRpb25zT3BlblByb3BlcnR5LCB7XHJcbiAgICAgIHNpZGVMZW5ndGg6IDE2LFxyXG5cclxuICAgICAgLy8gcGRvbVxyXG4gICAgICBpbm5lckNvbnRlbnQ6IGN1c3RvbWl6ZVZvaWNlU3RyaW5nUHJvcGVydHksXHJcblxyXG4gICAgICAvLyB2b2ljaW5nXHJcbiAgICAgIHZvaWNpbmdOYW1lUmVzcG9uc2U6IGN1c3RvbWl6ZVZvaWNlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIHZvaWNpbmdJZ25vcmVWb2ljaW5nTWFuYWdlclByb3BlcnRpZXM6IHRydWUsIC8vIENvbnRyb2xzIG5lZWQgdG8gYWx3YXlzIHNwZWFrIHJlc3BvbnNlcyBzbyBVSSBmdW5jdGlvbnMgYXJlIGNsZWFyXHJcblxyXG4gICAgICAvLyBwaGV0LWlvXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgLy8gV2UgZG9uJ3Qgd2FudCB0byBpbnN0cnVtZW50IGNvbXBvbmVudHMgZm9yIHByZWZlcmVuY2VzLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzc0NCNpc3N1ZWNvbW1lbnQtMTE5NjAyODM2MlxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHZvaWNlT3B0aW9uc0NvbnRhaW5lciA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHZvaWNlT3B0aW9uc0xhYmVsLCBleHBhbmRDb2xsYXBzZUJ1dHRvbiBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdGhlIHZpc3VhbCB0aXRsZSBvZiB0aGUgRXhwYW5kQ29sbGFwc2VCdXR0b24gbmVlZHMgdG8gYmUgY2xpY2thYmxlXHJcbiAgICBjb25zdCB2b2ljZU9wdGlvbnNQcmVzc0xpc3RlbmVyID0gbmV3IFByZXNzTGlzdGVuZXIoIHtcclxuICAgICAgcHJlc3M6ICgpID0+IHtcclxuICAgICAgICB2b2ljZU9wdGlvbnNPcGVuUHJvcGVydHkudG9nZ2xlKCk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBwaGV0LWlvXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgLy8gV2UgZG9uJ3Qgd2FudCB0byBpbnN0cnVtZW50IGNvbXBvbmVudHMgZm9yIHByZWZlcmVuY2VzLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzc0NCNpc3N1ZWNvbW1lbnQtMTE5NjAyODM2MlxyXG4gICAgfSApO1xyXG4gICAgdm9pY2VPcHRpb25zTGFiZWwuYWRkSW5wdXRMaXN0ZW5lciggdm9pY2VPcHRpb25zUHJlc3NMaXN0ZW5lciApO1xyXG5cclxuICAgIGNvbnN0IGNvbnRlbnQgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyBzcGVlY2hPdXRwdXRDb250ZW50LCB0b29sYmFyRW5hYmxlZFN3aXRjaCwgdm9pY2VPcHRpb25zQ29udGFpbmVyLCB2b2ljZU9wdGlvbnNDb250ZW50IF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBsYXlvdXQgZm9yIHNlY3Rpb24gY29udGVudCwgY3VzdG9tIHJhdGhlciB0aGFuIHVzaW5nIGEgRmxvd0JveCBiZWNhdXNlIHRoZSB2b2ljZSBvcHRpb25zIGxhYmVsIG5lZWRzXHJcbiAgICAvLyB0byBiZSBsZWZ0IGFsaWduZWQgd2l0aCBvdGhlciBsYWJlbHMsIHdoaWxlIHRoZSBFeHBhbmRDb2xsYXBzZUJ1dHRvbiBleHRlbmRzIHRvIHRoZSBsZWZ0XHJcbiAgICB0b29sYmFyRW5hYmxlZFN3aXRjaC5sZWZ0VG9wID0gc3BlZWNoT3V0cHV0Q29udGVudC5sZWZ0Qm90dG9tLnBsdXNYWSggMCwgMjAgKTtcclxuICAgIHZvaWNlT3B0aW9uc0xhYmVsLmxlZnRUb3AgPSB0b29sYmFyRW5hYmxlZFN3aXRjaC5sZWZ0Qm90dG9tLnBsdXNYWSggMCwgMjAgKTtcclxuICAgIGV4cGFuZENvbGxhcHNlQnV0dG9uLmxlZnRDZW50ZXIgPSB2b2ljZU9wdGlvbnNMYWJlbC5yaWdodENlbnRlci5wbHVzWFkoIDEwLCAwICk7XHJcbiAgICB2b2ljZU9wdGlvbnNDb250ZW50LmxlZnRUb3AgPSB2b2ljZU9wdGlvbnNMYWJlbC5sZWZ0Qm90dG9tLnBsdXNYWSggMCwgMTAgKTtcclxuICAgIHZvaWNlT3B0aW9uc09wZW5Qcm9wZXJ0eS5saW5rKCBvcGVuID0+IHsgdm9pY2VPcHRpb25zQ29udGVudC52aXNpYmxlID0gb3BlbjsgfSApO1xyXG5cclxuICAgIC8vIHRoZSBmb2N1cyBoaWdobGlnaHQgZm9yIHRoZSB2b2ljZSBvcHRpb25zIGV4cGFuZCBjb2xsYXBzZSBidXR0b24gc2hvdWxkIHN1cnJvdW5kIHRoZSBsYWJlbFxyXG4gICAgZXhwYW5kQ29sbGFwc2VCdXR0b24uZm9jdXNIaWdobGlnaHQgPSBuZXcgRm9jdXNIaWdobGlnaHRGcm9tTm9kZSggdm9pY2VPcHRpb25zQ29udGFpbmVyICk7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgdGl0bGVOb2RlOiB2b2ljaW5nRW5hYmxlZFN3aXRjaCxcclxuICAgICAgY29udGVudE5vZGU6IGNvbnRlbnRcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50VmlzaWJpbGl0eUxpc3RlbmVyID0gKCBlbmFibGVkOiBib29sZWFuICkgPT4ge1xyXG4gICAgICBjb250ZW50LnZpc2libGUgPSBlbmFibGVkO1xyXG4gICAgfTtcclxuICAgIGF1ZGlvTW9kZWwudm9pY2luZ0VuYWJsZWRQcm9wZXJ0eS5saW5rKCBjb250ZW50VmlzaWJpbGl0eUxpc3RlbmVyICk7XHJcblxyXG4gICAgY29uc3QgbG9jYWxlTGlzdGVuZXIgPSAoIGxvY2FsZTogTG9jYWxlICkgPT4ge1xyXG4gICAgICB2b2ljaW5nRW5hYmxlZFN3aXRjaC5lbmFibGVkUHJvcGVydHkudmFsdWUgPSBsb2NhbGUuc3RhcnRzV2l0aCggJ2VuJyApO1xyXG4gICAgfTtcclxuICAgIGxvY2FsZVByb3BlcnR5LmxpbmsoIGxvY2FsZUxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gU3BlYWsgd2hlbiB2b2ljaW5nIGJlY29tZXMgaW5pdGlhbGx5IGVuYWJsZWQuIEZpcnN0IHNwZWVjaCBpcyBkb25lIHN5bmNocm9ub3VzbHkgKG5vdCB1c2luZyB1dHRlcmFuY2UtcXVldWUpXHJcbiAgICAvLyBpbiByZXNwb25zZSB0byB1c2VyIGlucHV0LCBvdGhlcndpc2UgYWxsIHNwZWVjaCB3aWxsIGJlIGJsb2NrZWQgb24gbWFueSBwbGF0Zm9ybXNcclxuICAgIGNvbnN0IHZvaWNpbmdFbmFibGVkVXR0ZXJhbmNlID0gbmV3IFV0dGVyYW5jZSgpO1xyXG4gICAgY29uc3Qgdm9pY2luZ0VuYWJsZWRQcm9wZXJ0eUxpc3RlbmVyID0gKCBlbmFibGVkOiBib29sZWFuICkgPT4ge1xyXG5cclxuICAgICAgLy8gb25seSBzcGVhayBpZiBcIlNpbSBWb2ljaW5nXCIgaXMgb24sIGFsbCB2b2ljaW5nIHNob3VsZCBiZSBkaXNhYmxlZCBleGNlcHQgZm9yIHRoZSBUb29sYmFyXHJcbiAgICAgIC8vIGJ1dHRvbnMgaW4gdGhpcyBjYXNlXHJcbiAgICAgIGlmICggYXVkaW9Nb2RlbC52b2ljaW5nTWFpbldpbmRvd1ZvaWNpbmdFbmFibGVkUHJvcGVydHkudmFsdWUgKSB7XHJcblxyXG4gICAgICAgIC8vIElmIGxvY2FsZSBjaGFuZ2VzLCBtYWtlIHN1cmUgdG8gZGVzY3JpYmUgdGhhdCBWb2ljaW5nIGhhcyBiZWNvbWUgZGlzYWJsZWQgYmVjYXVzZSBWb2ljaW5nIGlzIG9ubHkgYXZhaWxhYmxlXHJcbiAgICAgICAgLy8gaW4gdGhlIEVuZ2xpc2ggbG9jYWxlLlxyXG4gICAgICAgIHZvaWNpbmdFbmFibGVkVXR0ZXJhbmNlLmFsZXJ0ID0gZW5hYmxlZCA/IHZvaWNpbmdFbmFibGVkU3RyaW5nUHJvcGVydHkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBsb2NhbGVQcm9wZXJ0eS52YWx1ZS5zdGFydHNXaXRoKCAnZW4nICkgPyB2b2ljaW5nRGlzYWJsZWRTdHJpbmdQcm9wZXJ0eSA6IHZvaWNpbmdPZmZPbmx5QXZhaWxhYmxlSW5FbmdsaXNoU3RyaW5nUHJvcGVydHkgKTtcclxuXHJcbiAgICAgICAgLy8gUGhFVC1pTyBBcmNoZXR5cGVzIHNob3VsZCBuZXZlciB2b2ljZSByZXNwb25zZXMuXHJcbiAgICAgICAgaWYgKCAhdGhpcy5pc0luc2lkZVBoZXRpb0FyY2hldHlwZSgpICkge1xyXG4gICAgICAgICAgdm9pY2luZ01hbmFnZXIuc3BlYWtJZ25vcmluZ0VuYWJsZWQoIHZvaWNpbmdFbmFibGVkVXR0ZXJhbmNlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYWxlcnREZXNjcmlwdGlvblV0dGVyYW5jZSggdm9pY2luZ0VuYWJsZWRVdHRlcmFuY2UgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGF1ZGlvTW9kZWwudm9pY2luZ0VuYWJsZWRQcm9wZXJ0eS5sYXp5TGluayggdm9pY2luZ0VuYWJsZWRQcm9wZXJ0eUxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gd2hlbiB0aGUgbGlzdCBvZiB2b2ljZXMgZm9yIHRoZSBDb21ib0JveCBjaGFuZ2VzLCBjcmVhdGUgYSBuZXcgQ29tYm9Cb3ggdGhhdCBpbmNsdWRlcyB0aGUgc3VwcG9ydGVkXHJcbiAgICAvLyB2b2ljZXMuIEVhZ2VybHkgY3JlYXRlIHRoZSBmaXJzdCBDb21ib0JveCwgZXZlbiBpZiBubyB2b2ljZXMgYXJlIGF2YWlsYWJsZS5cclxuICAgIGxldCB2b2ljZUNvbWJvQm94OiBWb2ljZUNvbWJvQm94IHwgbnVsbCA9IG51bGw7XHJcbiAgICBjb25zdCB2b2ljZXNDaGFuZ2VkTGlzdGVuZXIgPSAoIHZvaWNlczogU3BlZWNoU3ludGhlc2lzVm9pY2VbXSApID0+IHtcclxuICAgICAgaWYgKCB2b2ljZUNvbWJvQm94ICkge1xyXG4gICAgICAgIHZvaWNlT3B0aW9uc0NvbnRlbnQucmVtb3ZlQ2hpbGQoIHZvaWNlQ29tYm9Cb3ggKTtcclxuICAgICAgICB2b2ljZUNvbWJvQm94LmRpc3Bvc2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IHZvaWNlTGlzdDogU3BlZWNoU3ludGhlc2lzVm9pY2VbXSA9IFtdO1xyXG5cclxuICAgICAgLy8gT25seSBnZXQgdGhlIHByaW9yaXRpemVkIGFuZCBwcnVuZWQgbGlzdCBvZiB2b2ljZXMgaWYgdGhlIFZvaWNpbmdNYW5hZ2VyIGhhcyB2b2ljZXNcclxuICAgICAgLy8gYXZhaWxhYmxlLCBvdGhlcndpc2Ugd2FpdCB1bnRpbCB0aGV5IGFyZSBhdmFpbGFibGUuIElmIHRoZXJlIGFyZSBubyB2b2ljZXMgYXZhaWxhYmxlIFZvaWNlQ29tYm9Cb3ggd2lsbCBoYW5kbGVcclxuICAgICAgLy8gdGhhdCBncmFjZWZ1bGx5LlxyXG4gICAgICAvLyBWb2ljZSBjaGFuZ2luZyBpcyBub3QgKGFzIG9mIHRoaXMgd3JpdGluZykgYXZhaWxhYmxlIG9uIE1hY09TIG9yIGlPUywgYnV0IHdlIGhvcGUgdGhleSBmaXggdGhhdCBidWcgc29vbi4gUGVyaGFwc1xyXG4gICAgICAvLyBuZXh0IHRpbWUgc29tZW9uZSBpcyB3b3JraW5nIGluIHRoaXMgYXJlYSwgdGhleSBjYW4gY2hlY2sgYW5kIHNlZSBpZiBpdCBpcyB3b3JraW5nLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdXR0ZXJhbmNlLXF1ZXVlL2lzc3Vlcy83NFxyXG4gICAgICBpZiAoIHZvaWNlcy5sZW5ndGggPiAwICkge1xyXG5cclxuICAgICAgICAvLyBGb3Igbm93LCBvbmx5IEVuZ2xpc2ggdm9pY2VzIGFyZSBhdmFpbGFibGUgYmVjYXVzZSB0aGUgVm9pY2luZyBmZWF0dXJlIGlzIG5vdCB0cmFuc2xhdGFibGUuXHJcbiAgICAgICAgY29uc3QgcHJpb3JpdGl6ZWRWb2ljZXMgPSB2b2ljaW5nTWFuYWdlci5nZXRFbmdsaXNoUHJpb3JpdGl6ZWRWb2ljZXMoKTtcclxuXHJcbiAgICAgICAgLy8gbGltaXQgdGhlIHZvaWNlcyBmb3Igbm93IHRvIGtlZXAgdGhlIHNpemUgb2YgdGhlIENvbWJvQm94IG1hbmFnZWFibGVcclxuICAgICAgICB2b2ljZUxpc3QgPSBwcmlvcml0aXplZFZvaWNlcy5zbGljZSggMCwgMTIgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcGhldC1pbyAtIGZvciB3aGVuIGNyZWF0aW5nIHRoZSBBcmNoZXR5cGUgZm9yIHRoZSBDYXBzdWxlIGhvdXNpbmcgdGhlIHByZWZlcmVuY2VzRGlhbG9nLCB3ZSBkb24ndCBoYXZlIGEgc2ltIGdsb2JhbC5cclxuICAgICAgLy8gVE9ETzogdG9wTGF5ZXIgc2hvdWxkIGJlIHByaXZhdGUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzg0MVxyXG4gICAgICBjb25zdCBwYXJlbnQgPSBwaGV0LmpvaXN0LnNpbS50b3BMYXllciB8fCBuZXcgTm9kZSgpO1xyXG5cclxuICAgICAgdm9pY2VDb21ib0JveCA9IG5ldyBWb2ljZUNvbWJvQm94KCBhdWRpb01vZGVsLnZvaWNlUHJvcGVydHksIHZvaWNlTGlzdCwgcGFyZW50ICk7XHJcbiAgICAgIHZvaWNlT3B0aW9uc0NvbnRlbnQuYWRkQ2hpbGQoIHZvaWNlQ29tYm9Cb3ggKTtcclxuICAgIH07XHJcbiAgICB2b2ljaW5nTWFuYWdlci52b2ljZXNQcm9wZXJ0eS5saW5rKCB2b2ljZXNDaGFuZ2VkTGlzdGVuZXIgKTtcclxuXHJcbiAgICB2b2ljZU9wdGlvbnNPcGVuUHJvcGVydHkubGF6eUxpbmsoIG9wZW4gPT4ge1xyXG4gICAgICBjb25zdCBhbGVydFN0cmluZ1Byb3BlcnR5ID0gb3BlbiA/IGN1c3RvbWl6ZVZvaWNlRXhwYW5kZWRTdHJpbmdQcm9wZXJ0eSA6IGN1c3RvbWl6ZVZvaWNlQ29sbGFwc2VkU3RyaW5nUHJvcGVydHk7XHJcbiAgICAgIGV4cGFuZENvbGxhcHNlQnV0dG9uLnZvaWNpbmdTcGVha0NvbnRleHRSZXNwb25zZSgge1xyXG4gICAgICAgIGNvbnRleHRSZXNwb25zZTogYWxlcnRTdHJpbmdQcm9wZXJ0eVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuYWxlcnREZXNjcmlwdGlvblV0dGVyYW5jZSggYWxlcnRTdHJpbmdQcm9wZXJ0eSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZVZvaWNpbmdQYW5lbFNlY3Rpb24gPSAoKSA9PiB7XHJcbiAgICAgIHF1aWNrQWNjZXNzTGFiZWwuZGlzcG9zZSgpO1xyXG4gICAgICBzcGVlY2hPdXRwdXRMYWJlbC5kaXNwb3NlKCk7XHJcbiAgICAgIHZvaWNlT3B0aW9uc0xhYmVsLmRpc3Bvc2UoKTtcclxuICAgICAgdm9pY2luZ0xhYmVsLmRpc3Bvc2UoKTtcclxuICAgICAgcGl0Y2hTbGlkZXIuZGlzcG9zZSgpO1xyXG4gICAgICByYXRlU2xpZGVyLmRpc3Bvc2UoKTtcclxuICAgICAgYXVkaW9Nb2RlbC52b2ljaW5nRW5hYmxlZFByb3BlcnR5LnVubGluayggdm9pY2luZ0VuYWJsZWRQcm9wZXJ0eUxpc3RlbmVyICk7XHJcbiAgICAgIGF1ZGlvTW9kZWwudm9pY2luZ0VuYWJsZWRQcm9wZXJ0eS51bmxpbmsoIGNvbnRlbnRWaXNpYmlsaXR5TGlzdGVuZXIgKTtcclxuICAgICAgdm9pY2luZ01hbmFnZXIudm9pY2VzUHJvcGVydHkudW5saW5rKCB2b2ljZXNDaGFuZ2VkTGlzdGVuZXIgKTtcclxuICAgICAgbG9jYWxlUHJvcGVydHkudW5saW5rKCBsb2NhbGVMaXN0ZW5lciApO1xyXG4gICAgICB2b2ljaW5nRW5hYmxlZFN3aXRjaC5kaXNwb3NlKCk7XHJcbiAgICAgIHZvaWNlT3B0aW9uc09wZW5Qcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICAgIGV4cGFuZENvbGxhcHNlQnV0dG9uLmRpc3Bvc2UoKTtcclxuICAgICAgdG9vbGJhckVuYWJsZWRTd2l0Y2guZGlzcG9zZSgpO1xyXG4gICAgICB0b29sYmFyVG9nZ2xlU3dpdGNoLmRpc3Bvc2UoKTtcclxuICAgICAgdm9pY2luZ0VuYWJsZWRVdHRlcmFuY2UuZGlzcG9zZSgpO1xyXG5cclxuICAgICAgdm9pY2luZ1RvZ2dsZVN3aXRjaC5kaXNwb3NlKCk7XHJcbiAgICAgIHZvaWNpbmdFbmFibGVkU3dpdGNoVm9pY2luZ1RleHQuZGlzcG9zZSgpO1xyXG4gICAgICBzcGVlY2hPdXRwdXREZXNjcmlwdGlvbi5kaXNwb3NlKCk7XHJcblxyXG4gICAgICB2b2ljaW5nRW5hYmxlZFJlYWRpbmdCbG9ja05hbWVSZXNwb25zZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICAgIHNwZWVjaE91dHB1dFJlYWRpbmdCbG9ja05hbWVSZXNwb25zZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcblxyXG4gICAgICB2b2ljZUNvbWJvQm94ICYmIHZvaWNlQ29tYm9Cb3guZGlzcG9zZSgpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlVm9pY2luZ1BhbmVsU2VjdGlvbigpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhIE51bWJlckNvbnRyb2wgZm9yIG9uZSBvZiB0aGUgdm9pY2UgcGFyYW1ldGVycyBvZiB2b2ljaW5nIChwaXRjaC9yYXRlKS5cclxuICpcclxuICogQHBhcmFtIGxhYmVsU3RyaW5nIC0gbGFiZWwgZm9yIHRoZSBOdW1iZXJDb250cm9sXHJcbiAqIEBwYXJhbSBhMTF5TmFtZVN0cmluZyAtIGxhYmVsIGZvciBib3RoIFBET00gYW5kIFZvaWNpbmcgY29udGVudFxyXG4gKiBAcGFyYW0gdm9pY2VSYXRlUHJvcGVydHlcclxuICovXHJcbmNsYXNzIFZvaWNlUmF0ZU51bWJlckNvbnRyb2wgZXh0ZW5kcyBOdW1iZXJDb250cm9sIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VWb2ljZVJhdGVOdW1iZXJDb250cm9sOiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxhYmVsU3RyaW5nOiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCBhMTF5TmFtZVN0cmluZzogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiwgdm9pY2VSYXRlUHJvcGVydHk6IE51bWJlclByb3BlcnR5ICkge1xyXG5cclxuICAgIHN1cGVyKCBsYWJlbFN0cmluZywgdm9pY2VSYXRlUHJvcGVydHksIHZvaWNlUmF0ZVByb3BlcnR5LnJhbmdlLCB7XHJcbiAgICAgIGluY2x1ZGVBcnJvd0J1dHRvbnM6IGZhbHNlLFxyXG4gICAgICBsYXlvdXRGdW5jdGlvbjogTnVtYmVyQ29udHJvbC5jcmVhdGVMYXlvdXRGdW5jdGlvbjQoKSxcclxuICAgICAgZGVsdGE6IDAuMjUsXHJcbiAgICAgIHRpdGxlTm9kZU9wdGlvbnM6IG1lcmdlKCB7fSwgUHJlZmVyZW5jZXNEaWFsb2cuUEFORUxfU0VDVElPTl9DT05URU5UX09QVElPTlMsIHtcclxuICAgICAgICBtYXhXaWR0aDogNDVcclxuICAgICAgfSApLFxyXG4gICAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xyXG4gICAgICAgIGRlY2ltYWxQbGFjZXM6IDIsXHJcbiAgICAgICAgdmFsdWVQYXR0ZXJuOiB2b2ljZVZhcmlhYmxlc1BhdHRlcm5TdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgICB0ZXh0T3B0aW9uczogbWVyZ2UoIHt9LCBQcmVmZXJlbmNlc0RpYWxvZy5QQU5FTF9TRUNUSU9OX0NPTlRFTlRfT1BUSU9OUywge1xyXG4gICAgICAgICAgbWF4V2lkdGg6IDQ1XHJcbiAgICAgICAgfSApXHJcbiAgICAgIH0sXHJcbiAgICAgIHNsaWRlck9wdGlvbnM6IHtcclxuICAgICAgICB0aHVtYlNpemU6IFRIVU1CX1NJWkUsXHJcbiAgICAgICAgdHJhY2tTaXplOiBUUkFDS19TSVpFLFxyXG4gICAgICAgIGtleWJvYXJkU3RlcDogMC4yNSxcclxuICAgICAgICBtaW5vclRpY2tTcGFjaW5nOiAwLjI1LFxyXG5cclxuICAgICAgICAvLyBwZG9tXHJcbiAgICAgICAgbGFiZWxUYWdOYW1lOiAnbGFiZWwnLFxyXG4gICAgICAgIGxhYmVsQ29udGVudDogYTExeU5hbWVTdHJpbmcsXHJcblxyXG4gICAgICAgIC8vIHZvaWNpbmdcclxuICAgICAgICB2b2ljaW5nT25FbmRSZXNwb25zZU9wdGlvbnM6IHtcclxuICAgICAgICAgIHdpdGhOYW1lUmVzcG9uc2U6IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBwaGV0LWlvXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgLy8gV2UgZG9uJ3Qgd2FudCB0byBpbnN0cnVtZW50IGNvbXBvbmVudHMgZm9yIHByZWZlcmVuY2VzLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzc0NCNpc3N1ZWNvbW1lbnQtMTE5NjAyODM2MlxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFZvaWNpbmcgZ29lcyB0aHJvdWdoIHRoZSBOdW1iZXJDb250cm9sIHNsaWRlciB0aHJvdWdoIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJcclxuICAgIHRoaXMuc2xpZGVyLnZvaWNpbmdOYW1lUmVzcG9uc2UgPSBhMTF5TmFtZVN0cmluZztcclxuXHJcbiAgICAvLyBpZ25vcmUgdGhlIHNlbGVjdGlvbnMgb2YgdGhlIFByZWZlcmVuY2VzRGlhbG9nLCB3ZSBhbHdheXMgd2FudCB0byBoZWFyIGFsbCByZXNwb25zZXNcclxuICAgIC8vIHRoYXQgaGFwcGVuIHdoZW4gY2hhbmdpbmcgdGhlIHZvaWNlIGF0dHJpYnV0ZXNcclxuICAgIHRoaXMuc2xpZGVyLnZvaWNpbmdJZ25vcmVWb2ljaW5nTWFuYWdlclByb3BlcnRpZXMgPSB0cnVlO1xyXG5cclxuICAgIGNvbnN0IHZvaWNlUmF0ZU5vbk5vcm1hbFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSA9IG5ldyBQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIHZvaWNlUmF0ZURlc2NyaXB0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIHZhbHVlOiB2b2ljZVJhdGVQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHZvaWNlUmF0ZVJlc3BvbnNlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbXHJcbiAgICAgIHZvaWNlUmF0ZVByb3BlcnR5LCB2b2ljZVJhdGVOb3JtYWxTdHJpbmdQcm9wZXJ0eSwgdm9pY2VSYXRlTm9uTm9ybWFsUGF0dGVyblN0cmluZ1Byb3BlcnR5XHJcbiAgICBdLCAoIHJhdGUsIG5vcm1hbCwgbm9uTm9ybWFsICkgPT4ge1xyXG4gICAgICByZXR1cm4gcmF0ZSA9PT0gMSA/IG5vcm1hbCA6IG5vbk5vcm1hbDtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNsaWRlci52b2ljaW5nT2JqZWN0UmVzcG9uc2UgPSB2b2ljZVJhdGVSZXNwb25zZVByb3BlcnR5O1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZVZvaWNlUmF0ZU51bWJlckNvbnRyb2wgPSAoKSA9PiB7XHJcbiAgICAgIHZvaWNlUmF0ZVJlc3BvbnNlUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgICB2b2ljZVJhdGVOb25Ob3JtYWxQYXR0ZXJuU3RyaW5nUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlVm9pY2VSYXRlTnVtYmVyQ29udHJvbCgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxudHlwZSBWb2ljZUNvbWJvQm94U2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG50eXBlIFZvaWNlQ29tYm9Cb3hPcHRpb25zID0gVm9pY2VDb21ib0JveFNlbGZPcHRpb25zICYgQ29tYm9Cb3hPcHRpb25zO1xyXG5cclxuLyoqXHJcbiAqIElubmVyIGNsYXNzIGZvciB0aGUgQ29tYm9Cb3ggdGhhdCBzZWxlY3RzIHRoZSB2b2ljZSBmb3IgdGhlIHZvaWNpbmdNYW5hZ2VyLiBUaGlzIENvbWJvQm94IGNhbiBiZSBjcmVhdGVkIGFuZCBkZXN0cm95ZWRcclxuICogYSBmZXcgdGltZXMgYXMgdGhlIGJyb3dzZXIgbGlzdCBvZiBzdXBwb3J0ZWQgdm9pY2VzIG1heSBjaGFuZ2Ugd2hpbGUgdGhlIFNwZWVjaFN5bnRoZXNpcyBpcyBmaXJzdCBnZXR0aW5nIHB1dCB0b1xyXG4gKiB1c2UuXHJcbiAqL1xyXG5jbGFzcyBWb2ljZUNvbWJvQm94IGV4dGVuZHMgQ29tYm9Cb3g8U3BlZWNoU3ludGhlc2lzVm9pY2UgfCBudWxsPiB7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlVm9pY2VDb21ib0JveDogKCkgPT4gdm9pZDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtICB2b2ljZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHZvaWNlcyAtIGxpc3Qgb2Ygdm9pY2VzIHRvIGluY2x1ZGUgZnJvbSB0aGUgdm9pY2luZ01hbmFnZXJcclxuICAgKiBAcGFyYW0gcGFyZW50Tm9kZSAtIG5vZGUgdGhhdCBhY3RzIGFzIGEgcGFyZW50IGZvciB0aGUgQ29tYm9Cb3ggbGlzdFxyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggdm9pY2VQcm9wZXJ0eTogUHJvcGVydHk8U3BlZWNoU3ludGhlc2lzVm9pY2UgfCBudWxsPiwgdm9pY2VzOiBTcGVlY2hTeW50aGVzaXNWb2ljZVtdLCBwYXJlbnROb2RlOiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBDb21ib0JveE9wdGlvbnMgKSB7XHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFZvaWNlQ29tYm9Cb3hPcHRpb25zLCBWb2ljZUNvbWJvQm94U2VsZk9wdGlvbnMsIENvbWJvQm94T3B0aW9ucz4oKSgge1xyXG4gICAgICBsaXN0UG9zaXRpb246ICdhYm92ZScsXHJcbiAgICAgIGFjY2Vzc2libGVOYW1lOiB2b2ljZUxhYmVsU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGNvbWJvQm94Vm9pY2luZ05hbWVSZXNwb25zZVBhdHRlcm46IHZvaWNlVGl0bGVQYXR0ZXJuTGFiZWxTdHJpbmdQcm9wZXJ0eS52YWx1ZSxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgLy8gV2UgZG9uJ3Qgd2FudCB0byBpbnN0cnVtZW50IGNvbXBvbmVudHMgZm9yIHByZWZlcmVuY2VzLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzc0NCNpc3N1ZWNvbW1lbnQtMTE5NjAyODM2MlxyXG4gICAgICAvLyBGdXJ0aGVybW9yZSwgb3B0IG91dCBiZWNhdXNlIHdlIHdvdWxkIG5lZWQgdG8gaW5zdHJ1bWVudCB2b2ljZXMsIGJ1dCB0aG9zZSBjb3VsZCBjaGFuZ2UgYmV0d2VlbiBydW50aW1lcy5cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgaXRlbXM6IENvbWJvQm94SXRlbTxTcGVlY2hTeW50aGVzaXNWb2ljZSB8IG51bGw+W10gPSBbXTtcclxuXHJcbiAgICBpZiAoIHZvaWNlcy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgIGl0ZW1zLnB1c2goIHtcclxuICAgICAgICB2YWx1ZTogbnVsbCxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoIG5vVm9pY2VzQXZhaWxhYmxlU3RyaW5nUHJvcGVydHksIFByZWZlcmVuY2VzRGlhbG9nLlBBTkVMX1NFQ1RJT05fQ09OVEVOVF9PUFRJT05TICksXHJcbiAgICAgICAgYTExeU5hbWU6IG5vVm9pY2VzQXZhaWxhYmxlU3RyaW5nUHJvcGVydHlcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHZvaWNlcy5mb3JFYWNoKCB2b2ljZSA9PiB7XHJcbiAgICAgIGl0ZW1zLnB1c2goIHtcclxuICAgICAgICB2YWx1ZTogdm9pY2UsXHJcbiAgICAgICAgY3JlYXRlTm9kZTogKCB0YW5kZW06IFRhbmRlbSApID0+IG5ldyBUZXh0KCB2b2ljZS5uYW1lLCBQcmVmZXJlbmNlc0RpYWxvZy5QQU5FTF9TRUNUSU9OX0NPTlRFTlRfT1BUSU9OUyApLFxyXG4gICAgICAgIGExMXlOYW1lOiB2b2ljZS5uYW1lXHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBzaW5jZSB3ZSBhcmUgdXBkYXRpbmcgdGhlIGxpc3QsIHNldCB0aGUgVm9pY2VQcm9wZXJ0eSB0byB0aGUgZmlyc3QgYXZhaWxhYmxlIHZhbHVlLCBvciBudWxsIGlmIHRoZXJlIGFyZVxyXG4gICAgLy8gdm9pY2VzXHJcbiAgICB2b2ljZVByb3BlcnR5LnNldCggaXRlbXNbIDAgXS52YWx1ZSApO1xyXG5cclxuICAgIHN1cGVyKCB2b2ljZVByb3BlcnR5LCBpdGVtcywgcGFyZW50Tm9kZSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHZvaWNpbmcgLSAgcmVzcG9uc2VzIGZvciB0aGUgYnV0dG9uIHNob3VsZCBhbHdheXMgY29tZSB0aHJvdWdoLCByZWdhcmRsZXNzIG9mIHVzZXIgc2VsZWN0aW9uIG9mXHJcbiAgICAvLyByZXNwb25zZXMuIEFzIG9mIDEwLzI5LzIxLCBDb21ib0JveCB3aWxsIG9ubHkgcmVhZCB0aGUgbmFtZSByZXNwb25zZSAod2hpY2ggYXJlIGFsd2F5cyByZWFkIHJlZ2FyZGxlc3MpXHJcbiAgICAvLyBzbyB0aGlzIGlzbid0IHJlYWxseSBuZWNlc3NhcnkgYnV0IGl0IGlzIHBydWRlbnQgdG8gaW5jbHVkZSBpdCBhbnl3YXkuXHJcbiAgICB0aGlzLmJ1dHRvbi52b2ljaW5nSWdub3JlVm9pY2luZ01hbmFnZXJQcm9wZXJ0aWVzID0gdHJ1ZTtcclxuICAgIHRoaXMuZGlzcG9zZVZvaWNlQ29tYm9Cb3ggPSAoKSA9PiB7XHJcbiAgICAgIGl0ZW1zLmZvckVhY2goIGl0ZW0gPT4ge1xyXG4gICAgICAgIGl0ZW0udmFsdWUgPSBudWxsO1xyXG4gICAgICB9ICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VWb2ljZUNvbWJvQm94KCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQSBzbGlkZXIgd2l0aCBsYWJlbHMgYW5kIHRpY2sgbWFya3MgdXNlZCB0byBjb250cm9sIHZvaWNlIHJhdGUgb2Ygd2ViIHNwZWVjaCBzeW50aGVzaXMuXHJcbiAqL1xyXG5jbGFzcyBWb2ljaW5nUGl0Y2hTbGlkZXIgZXh0ZW5kcyBWQm94IHtcclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VWb2ljZVBpdGNoU2xpZGVyOiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxhYmVsU3RyaW5nOiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCB2b2ljZVBpdGNoUHJvcGVydHk6IE51bWJlclByb3BlcnR5ICkge1xyXG4gICAgY29uc3QgbGFiZWwgPSBuZXcgVGV4dCggbGFiZWxTdHJpbmcsIFByZWZlcmVuY2VzRGlhbG9nLlBBTkVMX1NFQ1RJT05fQ09OVEVOVF9PUFRJT05TICk7XHJcblxyXG4gICAgY29uc3Qgdm9pY2VQaXRjaFJhbmdlID0gdm9pY2VQaXRjaFByb3BlcnR5LnJhbmdlO1xyXG5cclxuICAgIGNvbnN0IHNsaWRlciA9IG5ldyBIU2xpZGVyKCB2b2ljZVBpdGNoUHJvcGVydHksIHZvaWNlUGl0Y2hSYW5nZSwge1xyXG4gICAgICBtYWpvclRpY2tMZW5ndGg6IDEwLFxyXG4gICAgICB0aHVtYlNpemU6IFRIVU1CX1NJWkUsXHJcbiAgICAgIHRyYWNrU2l6ZTogVFJBQ0tfU0laRSxcclxuICAgICAga2V5Ym9hcmRTdGVwOiAwLjI1LFxyXG4gICAgICBzaGlmdEtleWJvYXJkU3RlcDogMC4xLFxyXG5cclxuICAgICAgLy8gY29uc3RyYWluIHRoZSB2YWx1ZSB0byB0aGUgbmVhcmVzdCBodW5kcmVkdGhzIHBsYWNlIHNvIHRoZXJlIGlzIG5vIG92ZXJsYXAgaW4gZGVzY3JpYmVkIHJhbmdlcyBpblxyXG4gICAgICAvLyBWT0lDRV9QSVRDSF9ERVNDUklQVElPTl9NQVBcclxuICAgICAgY29uc3RyYWluVmFsdWU6IHZhbHVlID0+IFV0aWxzLnJvdW5kVG9JbnRlcnZhbCggdmFsdWUsIDAuMDEgKSxcclxuXHJcbiAgICAgIC8vIHBkb21cclxuICAgICAgbGFiZWxUYWdOYW1lOiAnbGFiZWwnLFxyXG4gICAgICBsYWJlbENvbnRlbnQ6IGxhYmVsU3RyaW5nLFxyXG5cclxuICAgICAgLy8gdm9pY2luZ1xyXG4gICAgICB2b2ljaW5nTmFtZVJlc3BvbnNlOiBsYWJlbFN0cmluZyxcclxuXHJcbiAgICAgIC8vIFZvaWNpbmcgY29udHJvbHMgc2hvdWxkIG5vdCByZXNwZWN0IHZvaWNpbmcgcmVzcG9uc2UgY29udHJvbHMgc28gdXNlciBhbHdheXMgaGVhcnMgaW5mb3JtYXRpb24gYWJvdXQgdGhlbVxyXG4gICAgICB2b2ljaW5nSWdub3JlVm9pY2luZ01hbmFnZXJQcm9wZXJ0aWVzOiB0cnVlLFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIC8vIFdlIGRvbid0IHdhbnQgdG8gaW5zdHJ1bWVudCBjb21wb25lbnRzIGZvciBwcmVmZXJlbmNlcywgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy83NDQjaXNzdWVjb21tZW50LTExOTYwMjgzNjJcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBsb3dMYWJlbCA9IG5ldyBUZXh0KCAnTG93JywgeyBmb250OiBuZXcgUGhldEZvbnQoIDE0ICkgfSApO1xyXG4gICAgc2xpZGVyLmFkZE1ham9yVGljayggdm9pY2VQaXRjaFJhbmdlLm1pbiwgbG93TGFiZWwgKTtcclxuXHJcbiAgICBjb25zdCBoaWdoTGFiZWwgPSBuZXcgVGV4dCggJ0hpZ2gnLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMTQgKSB9ICk7XHJcbiAgICBzbGlkZXIuYWRkTWFqb3JUaWNrKCB2b2ljZVBpdGNoUmFuZ2UubWF4LCBoaWdoTGFiZWwgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIHZvaWNpbmdcclxuICAgIGNvbnN0IHZvaWNlUGl0Y2hMaXN0ZW5lciA9ICggcGl0Y2g6IG51bWJlciwgcHJldmlvdXNWYWx1ZTogbnVtYmVyIHwgbnVsbCApID0+IHtcclxuICAgICAgc2xpZGVyLnZvaWNpbmdPYmplY3RSZXNwb25zZSA9IHRoaXMuZ2V0UGl0Y2hEZXNjcmlwdGlvblN0cmluZyggcGl0Y2ggKTtcclxuICAgIH07XHJcbiAgICB2b2ljZVBpdGNoUHJvcGVydHkubGluayggdm9pY2VQaXRjaExpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgbGFiZWwsIHNsaWRlciBdLFxyXG5cclxuICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNDMzXHJcbiAgICAgIHNwYWNpbmc6IDVcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VWb2ljZVBpdGNoU2xpZGVyID0gKCkgPT4ge1xyXG4gICAgICBsYWJlbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNsaWRlci5kaXNwb3NlKCk7XHJcbiAgICAgIGxvd0xhYmVsLmRpc3Bvc2UoKTtcclxuICAgICAgaGlnaExhYmVsLmRpc3Bvc2UoKTtcclxuICAgICAgdm9pY2VQaXRjaFByb3BlcnR5LnVubGluayggdm9pY2VQaXRjaExpc3RlbmVyICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VWb2ljZVBpdGNoU2xpZGVyKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIGEgZGVzY3JpcHRpb24gb2YgdGhlIHBpdGNoIGF0IHRoZSBwcm92aWRlZCB2YWx1ZSBmcm9tIFZPSUNFX1BJVENIX0RFU0NSSVBUSU9OX01BUC5cclxuICAgKi9cclxuICBwcml2YXRlIGdldFBpdGNoRGVzY3JpcHRpb25TdHJpbmcoIHBpdGNoVmFsdWU6IG51bWJlciApOiBzdHJpbmcge1xyXG4gICAgbGV0IHBpdGNoRGVzY3JpcHRpb24gPSAnJztcclxuICAgIFZPSUNFX1BJVENIX0RFU0NSSVBUSU9OX01BUC5mb3JFYWNoKCAoIGRlc2NyaXB0aW9uLCByYW5nZSApID0+IHtcclxuICAgICAgaWYgKCByYW5nZS5jb250YWlucyggcGl0Y2hWYWx1ZSApICkge1xyXG4gICAgICAgIHBpdGNoRGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcGl0Y2hEZXNjcmlwdGlvbiwgYG5vIGRlc2NyaXB0aW9uIGZvdW5kIGZvciBwaXRjaCBhdCB2YWx1ZTogJHtwaXRjaFZhbHVlfWAgKTtcclxuICAgIHJldHVybiBwaXRjaERlc2NyaXB0aW9uO1xyXG4gIH1cclxufVxyXG5cclxuam9pc3QucmVnaXN0ZXIoICdWb2ljaW5nUGFuZWxTZWN0aW9uJywgVm9pY2luZ1BhbmVsU2VjdGlvbiApO1xyXG5leHBvcnQgZGVmYXVsdCBWb2ljaW5nUGFuZWxTZWN0aW9uOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0scUNBQXFDO0FBSWpFLE9BQU9DLFVBQVUsTUFBTSwrQkFBK0I7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLDBCQUEwQjtBQUM1QyxPQUFPQyxLQUFLLE1BQU0sMEJBQTBCO0FBQzVDLE9BQU9DLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsT0FBT0MsU0FBUyxJQUFJQyxjQUFjLFFBQTBCLG9DQUFvQztBQUNoRyxPQUFPQyxhQUFhLE1BQU0sMkNBQTJDO0FBQ3JFLE9BQU9DLFFBQVEsTUFBTSxzQ0FBc0M7QUFDM0QsU0FBU0Msc0JBQXNCLEVBQUVDLElBQUksRUFBRUMsYUFBYSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsY0FBYyxFQUFFQyxXQUFXLFFBQVEsZ0NBQWdDO0FBQ3JJLE9BQU9DLFFBQVEsTUFBTSw2QkFBNkI7QUFDbEQsT0FBT0MsUUFBUSxNQUF5Qyw2QkFBNkI7QUFDckYsT0FBT0Msb0JBQW9CLE1BQU0seUNBQXlDO0FBQzFFLE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxTQUFTLE1BQU0sMENBQTBDO0FBQ2hFLE9BQU9DLEtBQUssTUFBTSxhQUFhO0FBQy9CLE9BQU9DLFlBQVksTUFBTSxvQkFBb0I7QUFDN0MsT0FBT0MsaUJBQWlCLE1BQU0sd0JBQXdCO0FBRXRELE9BQU9DLHVC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