// Copyright 2021-2023, University of Colorado Boulder

/**
 * The panel for the PreferencesDialog containing preferences related to audio.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { HBox, Text, VBox } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesControl from './PreferencesControl.js';
import SoundPanelSection from './SoundPanelSection.js';
import VoicingPanelSection from './VoicingPanelSection.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesPanel from './PreferencesPanel.js';
import PreferencesType from './PreferencesType.js';
import ToggleSwitch from '../../../sun/js/ToggleSwitch.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import PreferencesDialogConstants from './PreferencesDialogConstants.js';

// constants
const audioFeaturesStringProperty = JoistStrings.preferences.tabs.audio.audioFeatures.titleStringProperty;
class AudioPreferencesTabPanel extends PreferencesPanel {
  /**
   * @param audioModel - configuration for audio settings, see PreferencesModel
   * @param selectedTabProperty
   * @param tabVisibleProperty
   * @param providedOptions
   */
  constructor(audioModel, selectedTabProperty, tabVisibleProperty, providedOptions) {
    super(PreferencesType.AUDIO, selectedTabProperty, tabVisibleProperty, {
      labelContent: audioFeaturesStringProperty
    });

    // Some contents of this Dialog will be dynamically removed. Dont resize when this happens because we don't want
    // to shift contents of the entire Preferences dialog.
    const contentOptions = {
      align: 'left',
      spacing: PreferencesDialog.CONTENT_SPACING,
      excludeInvisibleChildrenFromBounds: false
    };
    const leftContent = new VBox(contentOptions);
    const rightContent = new VBox(contentOptions);
    if (audioModel.supportsVoicing) {
      const voicingPanelSection = new VoicingPanelSection(audioModel);
      leftContent.addChild(voicingPanelSection);
      this.disposeEmitter.addListener(() => voicingPanelSection.dispose());
    }
    if (audioModel.supportsSound) {
      // If only one of the audio features are in use, do not include the toggle switch to
      // enable/disable that feature because the control is redundant. The audio output should go
      // through the "Audio Features" toggle only.
      const hideSoundToggle = audioModel.supportsVoicing !== audioModel.supportsSound;
      const soundPanelSection = new SoundPanelSection(audioModel, {
        includeTitleToggleSwitch: !hideSoundToggle
      });
      rightContent.addChild(soundPanelSection);
      this.disposeEmitter.addListener(() => soundPanelSection.dispose());
    }
    const sections = new HBox({
      align: 'top',
      spacing: 10,
      children: [leftContent, rightContent],
      tagName: 'div' // Must have PDOM content to support toggling enabled in the PDOM. Could be removed after https://github.com/phetsims/scenery/issues/1514
    });

    audioModel.customPreferences.forEach((customPreference, i) => {
      const container = i % 2 === 0 ? leftContent : rightContent;
      const customContent = customPreference.createContent(providedOptions.tandem);
      const preferencesPanelSection = new PreferencesPanelSection({
        contentNode: customContent,
        contentNodeOptions: {
          excludeInvisibleChildrenFromBounds: true
        },
        contentLeftMargin: 0
      });
      container.addChild(preferencesPanelSection);
      this.disposeEmitter.addListener(() => {
        customContent.dispose();
        preferencesPanelSection.dispose();
      });
    });
    const audioFeaturesText = new Text(audioFeaturesStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS);
    const audioFeaturesSwitch = new ToggleSwitch(audioModel.audioEnabledProperty, false, true, combineOptions({
      a11yName: audioFeaturesStringProperty
    }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS));
    const allAudioSwitch = new PreferencesControl({
      labelNode: audioFeaturesText,
      controlNode: audioFeaturesSwitch,
      headingControl: true
    });
    this.disposeEmitter.addListener(() => audioFeaturesSwitch.dispose());
    const audioEnabledListener = enabled => {
      sections.enabled = enabled;
    };
    audioModel.audioEnabledProperty.link(audioEnabledListener);
    const panelContent = new VBox({
      align: 'center',
      spacing: 25,
      children: [allAudioSwitch, sections]
    });
    this.addChild(panelContent);
    this.disposeAudioPreferencesPanel = () => {
      leftContent.dispose();
      rightContent.dispose();
      allAudioSwitch.dispose();
      audioFeaturesText.dispose();
      sections.dispose();
      panelContent.dispose();
      audioModel.audioEnabledProperty.unlink(audioEnabledListener);
    };
  }
  dispose() {
    this.disposeAudioPreferencesPanel();
    super.dispose();
  }
}
joist.register('AudioPreferencesTabPanel', AudioPreferencesTabPanel);
export default AudioPreferencesTabPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJIQm94IiwiVGV4dCIsIlZCb3giLCJqb2lzdCIsIkpvaXN0U3RyaW5ncyIsIlByZWZlcmVuY2VzRGlhbG9nIiwiUHJlZmVyZW5jZXNDb250cm9sIiwiU291bmRQYW5lbFNlY3Rpb24iLCJWb2ljaW5nUGFuZWxTZWN0aW9uIiwiUHJlZmVyZW5jZXNQYW5lbFNlY3Rpb24iLCJQcmVmZXJlbmNlc1BhbmVsIiwiUHJlZmVyZW5jZXNUeXBlIiwiVG9nZ2xlU3dpdGNoIiwiY29tYmluZU9wdGlvbnMiLCJQcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cyIsImF1ZGlvRmVhdHVyZXNTdHJpbmdQcm9wZXJ0eSIsInByZWZlcmVuY2VzIiwidGFicyIsImF1ZGlvIiwiYXVkaW9GZWF0dXJlcyIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJBdWRpb1ByZWZlcmVuY2VzVGFiUGFuZWwiLCJjb25zdHJ1Y3RvciIsImF1ZGlvTW9kZWwiLCJzZWxlY3RlZFRhYlByb3BlcnR5IiwidGFiVmlzaWJsZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwiQVVESU8iLCJsYWJlbENvbnRlbnQiLCJjb250ZW50T3B0aW9ucyIsImFsaWduIiwic3BhY2luZyIsIkNPTlRFTlRfU1BBQ0lORyIsImV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMiLCJsZWZ0Q29udGVudCIsInJpZ2h0Q29udGVudCIsInN1cHBvcnRzVm9pY2luZyIsInZvaWNpbmdQYW5lbFNlY3Rpb24iLCJhZGRDaGlsZCIsImRpc3Bvc2VFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJkaXNwb3NlIiwic3VwcG9ydHNTb3VuZCIsImhpZGVTb3VuZFRvZ2dsZSIsInNvdW5kUGFuZWxTZWN0aW9uIiwiaW5jbHVkZVRpdGxlVG9nZ2xlU3dpdGNoIiwic2VjdGlvbnMiLCJjaGlsZHJlbiIsInRhZ05hbWUiLCJjdXN0b21QcmVmZXJlbmNlcyIsImZvckVhY2giLCJjdXN0b21QcmVmZXJlbmNlIiwiaSIsImNvbnRhaW5lciIsImN1c3RvbUNvbnRlbnQiLCJjcmVhdGVDb250ZW50IiwidGFuZGVtIiwicHJlZmVyZW5jZXNQYW5lbFNlY3Rpb24iLCJjb250ZW50Tm9kZSIsImNvbnRlbnROb2RlT3B0aW9ucyIsImNvbnRlbnRMZWZ0TWFyZ2luIiwiYXVkaW9GZWF0dXJlc1RleHQiLCJQQU5FTF9TRUNUSU9OX0xBQkVMX09QVElPTlMiLCJhdWRpb0ZlYXR1cmVzU3dpdGNoIiwiYXVkaW9FbmFibGVkUHJvcGVydHkiLCJhMTF5TmFtZSIsIlRPR0dMRV9TV0lUQ0hfT1BUSU9OUyIsImFsbEF1ZGlvU3dpdGNoIiwibGFiZWxOb2RlIiwiY29udHJvbE5vZGUiLCJoZWFkaW5nQ29udHJvbCIsImF1ZGlvRW5hYmxlZExpc3RlbmVyIiwiZW5hYmxlZCIsImxpbmsiLCJwYW5lbENvbnRlbnQiLCJkaXNwb3NlQXVkaW9QcmVmZXJlbmNlc1BhbmVsIiwidW5saW5rIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBdWRpb1ByZWZlcmVuY2VzUGFuZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIHBhbmVsIGZvciB0aGUgUHJlZmVyZW5jZXNEaWFsb2cgY29udGFpbmluZyBwcmVmZXJlbmNlcyByZWxhdGVkIHRvIGF1ZGlvLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgeyBIQm94LCBUZXh0LCBWQm94LCBWQm94T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBqb2lzdCBmcm9tICcuLi9qb2lzdC5qcyc7XHJcbmltcG9ydCBKb2lzdFN0cmluZ3MgZnJvbSAnLi4vSm9pc3RTdHJpbmdzLmpzJztcclxuaW1wb3J0IFByZWZlcmVuY2VzRGlhbG9nIGZyb20gJy4vUHJlZmVyZW5jZXNEaWFsb2cuanMnO1xyXG5pbXBvcnQgeyBBdWRpb01vZGVsIH0gZnJvbSAnLi9QcmVmZXJlbmNlc01vZGVsLmpzJztcclxuaW1wb3J0IFByZWZlcmVuY2VzQ29udHJvbCBmcm9tICcuL1ByZWZlcmVuY2VzQ29udHJvbC5qcyc7XHJcbmltcG9ydCBTb3VuZFBhbmVsU2VjdGlvbiBmcm9tICcuL1NvdW5kUGFuZWxTZWN0aW9uLmpzJztcclxuaW1wb3J0IFZvaWNpbmdQYW5lbFNlY3Rpb24gZnJvbSAnLi9Wb2ljaW5nUGFuZWxTZWN0aW9uLmpzJztcclxuaW1wb3J0IFByZWZlcmVuY2VzUGFuZWxTZWN0aW9uIGZyb20gJy4vUHJlZmVyZW5jZXNQYW5lbFNlY3Rpb24uanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgUHJlZmVyZW5jZXNQYW5lbCwgeyBQcmVmZXJlbmNlc1BhbmVsT3B0aW9ucyB9IGZyb20gJy4vUHJlZmVyZW5jZXNQYW5lbC5qcyc7XHJcbmltcG9ydCBQcmVmZXJlbmNlc1R5cGUgZnJvbSAnLi9QcmVmZXJlbmNlc1R5cGUuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUb2dnbGVTd2l0Y2gsIHsgVG9nZ2xlU3dpdGNoT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3N1bi9qcy9Ub2dnbGVTd2l0Y2guanMnO1xyXG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUHJlZmVyZW5jZXNEaWFsb2dDb25zdGFudHMgZnJvbSAnLi9QcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgYXVkaW9GZWF0dXJlc1N0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLnByZWZlcmVuY2VzLnRhYnMuYXVkaW8uYXVkaW9GZWF0dXJlcy50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxudHlwZSBBdWRpb1ByZWZlcmVuY2VzUGFuZWxPcHRpb25zID0gUGlja1JlcXVpcmVkPFByZWZlcmVuY2VzUGFuZWxPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5jbGFzcyBBdWRpb1ByZWZlcmVuY2VzVGFiUGFuZWwgZXh0ZW5kcyBQcmVmZXJlbmNlc1BhbmVsIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VBdWRpb1ByZWZlcmVuY2VzUGFuZWw6ICgpID0+IHZvaWQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBhdWRpb01vZGVsIC0gY29uZmlndXJhdGlvbiBmb3IgYXVkaW8gc2V0dGluZ3MsIHNlZSBQcmVmZXJlbmNlc01vZGVsXHJcbiAgICogQHBhcmFtIHNlbGVjdGVkVGFiUHJvcGVydHlcclxuICAgKiBAcGFyYW0gdGFiVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYXVkaW9Nb2RlbDogQXVkaW9Nb2RlbCwgc2VsZWN0ZWRUYWJQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8UHJlZmVyZW5jZXNUeXBlPiwgdGFiVmlzaWJsZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiwgcHJvdmlkZWRPcHRpb25zOiBBdWRpb1ByZWZlcmVuY2VzUGFuZWxPcHRpb25zICkge1xyXG4gICAgc3VwZXIoIFByZWZlcmVuY2VzVHlwZS5BVURJTywgc2VsZWN0ZWRUYWJQcm9wZXJ0eSwgdGFiVmlzaWJsZVByb3BlcnR5LCB7XHJcbiAgICAgIGxhYmVsQ29udGVudDogYXVkaW9GZWF0dXJlc1N0cmluZ1Byb3BlcnR5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU29tZSBjb250ZW50cyBvZiB0aGlzIERpYWxvZyB3aWxsIGJlIGR5bmFtaWNhbGx5IHJlbW92ZWQuIERvbnQgcmVzaXplIHdoZW4gdGhpcyBoYXBwZW5zIGJlY2F1c2Ugd2UgZG9uJ3Qgd2FudFxyXG4gICAgLy8gdG8gc2hpZnQgY29udGVudHMgb2YgdGhlIGVudGlyZSBQcmVmZXJlbmNlcyBkaWFsb2cuXHJcbiAgICBjb25zdCBjb250ZW50T3B0aW9uczogVkJveE9wdGlvbnMgPSB7XHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIHNwYWNpbmc6IFByZWZlcmVuY2VzRGlhbG9nLkNPTlRFTlRfU1BBQ0lORyxcclxuICAgICAgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kczogZmFsc2VcclxuICAgIH07XHJcbiAgICBjb25zdCBsZWZ0Q29udGVudCA9IG5ldyBWQm94KCBjb250ZW50T3B0aW9ucyApO1xyXG4gICAgY29uc3QgcmlnaHRDb250ZW50ID0gbmV3IFZCb3goIGNvbnRlbnRPcHRpb25zICk7XHJcblxyXG4gICAgaWYgKCBhdWRpb01vZGVsLnN1cHBvcnRzVm9pY2luZyApIHtcclxuICAgICAgY29uc3Qgdm9pY2luZ1BhbmVsU2VjdGlvbiA9IG5ldyBWb2ljaW5nUGFuZWxTZWN0aW9uKCBhdWRpb01vZGVsICk7XHJcbiAgICAgIGxlZnRDb250ZW50LmFkZENoaWxkKCB2b2ljaW5nUGFuZWxTZWN0aW9uICk7XHJcbiAgICAgIHRoaXMuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHZvaWNpbmdQYW5lbFNlY3Rpb24uZGlzcG9zZSgpICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBhdWRpb01vZGVsLnN1cHBvcnRzU291bmQgKSB7XHJcblxyXG4gICAgICAvLyBJZiBvbmx5IG9uZSBvZiB0aGUgYXVkaW8gZmVhdHVyZXMgYXJlIGluIHVzZSwgZG8gbm90IGluY2x1ZGUgdGhlIHRvZ2dsZSBzd2l0Y2ggdG9cclxuICAgICAgLy8gZW5hYmxlL2Rpc2FibGUgdGhhdCBmZWF0dXJlIGJlY2F1c2UgdGhlIGNvbnRyb2wgaXMgcmVkdW5kYW50LiBUaGUgYXVkaW8gb3V0cHV0IHNob3VsZCBnb1xyXG4gICAgICAvLyB0aHJvdWdoIHRoZSBcIkF1ZGlvIEZlYXR1cmVzXCIgdG9nZ2xlIG9ubHkuXHJcbiAgICAgIGNvbnN0IGhpZGVTb3VuZFRvZ2dsZSA9IGF1ZGlvTW9kZWwuc3VwcG9ydHNWb2ljaW5nICE9PSBhdWRpb01vZGVsLnN1cHBvcnRzU291bmQ7XHJcblxyXG4gICAgICBjb25zdCBzb3VuZFBhbmVsU2VjdGlvbiA9IG5ldyBTb3VuZFBhbmVsU2VjdGlvbiggYXVkaW9Nb2RlbCwge1xyXG4gICAgICAgIGluY2x1ZGVUaXRsZVRvZ2dsZVN3aXRjaDogIWhpZGVTb3VuZFRvZ2dsZVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHJpZ2h0Q29udGVudC5hZGRDaGlsZCggc291bmRQYW5lbFNlY3Rpb24gKTtcclxuICAgICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gc291bmRQYW5lbFNlY3Rpb24uZGlzcG9zZSgpICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc2VjdGlvbnMgPSBuZXcgSEJveCgge1xyXG4gICAgICBhbGlnbjogJ3RvcCcsXHJcbiAgICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgICBjaGlsZHJlbjogWyBsZWZ0Q29udGVudCwgcmlnaHRDb250ZW50IF0sXHJcbiAgICAgIHRhZ05hbWU6ICdkaXYnIC8vIE11c3QgaGF2ZSBQRE9NIGNvbnRlbnQgdG8gc3VwcG9ydCB0b2dnbGluZyBlbmFibGVkIGluIHRoZSBQRE9NLiBDb3VsZCBiZSByZW1vdmVkIGFmdGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTE0XHJcbiAgICB9ICk7XHJcblxyXG4gICAgYXVkaW9Nb2RlbC5jdXN0b21QcmVmZXJlbmNlcy5mb3JFYWNoKCAoIGN1c3RvbVByZWZlcmVuY2UsIGkgKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGkgJSAyID09PSAwID8gbGVmdENvbnRlbnQgOiByaWdodENvbnRlbnQ7XHJcbiAgICAgIGNvbnN0IGN1c3RvbUNvbnRlbnQgPSBjdXN0b21QcmVmZXJlbmNlLmNyZWF0ZUNvbnRlbnQoIHByb3ZpZGVkT3B0aW9ucy50YW5kZW0gKTtcclxuICAgICAgY29uc3QgcHJlZmVyZW5jZXNQYW5lbFNlY3Rpb24gPSBuZXcgUHJlZmVyZW5jZXNQYW5lbFNlY3Rpb24oIHtcclxuICAgICAgICBjb250ZW50Tm9kZTogY3VzdG9tQ29udGVudCxcclxuICAgICAgICBjb250ZW50Tm9kZU9wdGlvbnM6IHtcclxuICAgICAgICAgIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbnRlbnRMZWZ0TWFyZ2luOiAwXHJcbiAgICAgIH0gKTtcclxuICAgICAgY29udGFpbmVyLmFkZENoaWxkKCBwcmVmZXJlbmNlc1BhbmVsU2VjdGlvbiApO1xyXG4gICAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgICAgY3VzdG9tQ29udGVudC5kaXNwb3NlKCk7XHJcbiAgICAgICAgcHJlZmVyZW5jZXNQYW5lbFNlY3Rpb24uZGlzcG9zZSgpO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGF1ZGlvRmVhdHVyZXNUZXh0ID0gbmV3IFRleHQoIGF1ZGlvRmVhdHVyZXNTdHJpbmdQcm9wZXJ0eSwgUHJlZmVyZW5jZXNEaWFsb2cuUEFORUxfU0VDVElPTl9MQUJFTF9PUFRJT05TICk7XHJcbiAgICBjb25zdCBhdWRpb0ZlYXR1cmVzU3dpdGNoID0gbmV3IFRvZ2dsZVN3aXRjaCggYXVkaW9Nb2RlbC5hdWRpb0VuYWJsZWRQcm9wZXJ0eSwgZmFsc2UsIHRydWUsIGNvbWJpbmVPcHRpb25zPFRvZ2dsZVN3aXRjaE9wdGlvbnM+KCB7XHJcbiAgICAgIGExMXlOYW1lOiBhdWRpb0ZlYXR1cmVzU3RyaW5nUHJvcGVydHlcclxuICAgIH0sIFByZWZlcmVuY2VzRGlhbG9nQ29uc3RhbnRzLlRPR0dMRV9TV0lUQ0hfT1BUSU9OUyApICk7XHJcbiAgICBjb25zdCBhbGxBdWRpb1N3aXRjaCA9IG5ldyBQcmVmZXJlbmNlc0NvbnRyb2woIHtcclxuICAgICAgbGFiZWxOb2RlOiBhdWRpb0ZlYXR1cmVzVGV4dCxcclxuICAgICAgY29udHJvbE5vZGU6IGF1ZGlvRmVhdHVyZXNTd2l0Y2gsXHJcbiAgICAgIGhlYWRpbmdDb250cm9sOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gYXVkaW9GZWF0dXJlc1N3aXRjaC5kaXNwb3NlKCkgKTtcclxuXHJcbiAgICBjb25zdCBhdWRpb0VuYWJsZWRMaXN0ZW5lciA9ICggZW5hYmxlZDogYm9vbGVhbiApID0+IHtcclxuICAgICAgc2VjdGlvbnMuZW5hYmxlZCA9IGVuYWJsZWQ7XHJcbiAgICB9O1xyXG5cclxuICAgIGF1ZGlvTW9kZWwuYXVkaW9FbmFibGVkUHJvcGVydHkubGluayggYXVkaW9FbmFibGVkTGlzdGVuZXIgKTtcclxuXHJcbiAgICBjb25zdCBwYW5lbENvbnRlbnQgPSBuZXcgVkJveCgge1xyXG4gICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgIHNwYWNpbmc6IDI1LFxyXG4gICAgICBjaGlsZHJlbjogWyBhbGxBdWRpb1N3aXRjaCwgc2VjdGlvbnMgXVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcGFuZWxDb250ZW50ICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlQXVkaW9QcmVmZXJlbmNlc1BhbmVsID0gKCkgPT4ge1xyXG4gICAgICBsZWZ0Q29udGVudC5kaXNwb3NlKCk7XHJcbiAgICAgIHJpZ2h0Q29udGVudC5kaXNwb3NlKCk7XHJcbiAgICAgIGFsbEF1ZGlvU3dpdGNoLmRpc3Bvc2UoKTtcclxuICAgICAgYXVkaW9GZWF0dXJlc1RleHQuZGlzcG9zZSgpO1xyXG4gICAgICBzZWN0aW9ucy5kaXNwb3NlKCk7XHJcbiAgICAgIHBhbmVsQ29udGVudC5kaXNwb3NlKCk7XHJcbiAgICAgIGF1ZGlvTW9kZWwuYXVkaW9FbmFibGVkUHJvcGVydHkudW5saW5rKCBhdWRpb0VuYWJsZWRMaXN0ZW5lciApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlQXVkaW9QcmVmZXJlbmNlc1BhbmVsKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5qb2lzdC5yZWdpc3RlciggJ0F1ZGlvUHJlZmVyZW5jZXNUYWJQYW5lbCcsIEF1ZGlvUHJlZmVyZW5jZXNUYWJQYW5lbCApO1xyXG5leHBvcnQgZGVmYXVsdCBBdWRpb1ByZWZlcmVuY2VzVGFiUGFuZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQXFCLGdDQUFnQztBQUM5RSxPQUFPQyxLQUFLLE1BQU0sYUFBYTtBQUMvQixPQUFPQyxZQUFZLE1BQU0sb0JBQW9CO0FBQzdDLE9BQU9DLGlCQUFpQixNQUFNLHdCQUF3QjtBQUV0RCxPQUFPQyxrQkFBa0IsTUFBTSx5QkFBeUI7QUFDeEQsT0FBT0MsaUJBQWlCLE1BQU0sd0JBQXdCO0FBQ3RELE9BQU9DLG1CQUFtQixNQUFNLDBCQUEwQjtBQUMxRCxPQUFPQyx1QkFBdUIsTUFBTSw4QkFBOEI7QUFFbEUsT0FBT0MsZ0JBQWdCLE1BQW1DLHVCQUF1QjtBQUNqRixPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBRWxELE9BQU9DLFlBQVksTUFBK0IsaUNBQWlDO0FBQ25GLFNBQVNDLGNBQWMsUUFBUSxvQ0FBb0M7QUFDbkUsT0FBT0MsMEJBQTBCLE1BQU0saUNBQWlDOztBQUV4RTtBQUNBLE1BQU1DLDJCQUEyQixH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