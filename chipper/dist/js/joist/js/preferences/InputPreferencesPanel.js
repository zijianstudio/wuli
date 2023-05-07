// Copyright 2021-2023, University of Colorado Boulder

/**
 * The panel of the PreferencesDialog related to options related to user input.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { Node, Text, VBox, VoicingRichText } from '../../../scenery/js/imports.js';
import ToggleSwitch from '../../../sun/js/ToggleSwitch.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanel from './PreferencesPanel.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesControl from './PreferencesControl.js';
import PreferencesType from './PreferencesType.js';
import PreferencesDialogConstants from './PreferencesDialogConstants.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';

// constants
const gestureControlEnabledAlertStringProperty = JoistStrings.a11y.preferences.tabs.input.gestureControl.enabledAlertStringProperty;
const gestureControlDisabledAlertStringProperty = JoistStrings.a11y.preferences.tabs.input.gestureControl.disabledAlertStringProperty;
const labelledDescriptionPatternStringProperty = JoistStrings.a11y.preferences.tabs.labelledDescriptionPatternStringProperty;

// NOT translatable yet because this tab does not appear in any published simulation.
const inputTitleString = 'Input';
const gestureControlsString = 'Gesture Control';
const gestureControlsDescriptionString = 'Use touch with custom swipes and taps instead. No direct touch with gesture control enabled.';
class InputPreferencesPanel extends PreferencesPanel {
  constructor(inputModel, selectedTabProperty, tabVisibleProperty, providedOptions) {
    super(PreferencesType.INPUT, selectedTabProperty, tabVisibleProperty, {
      labelContent: inputTitleString
    });

    // children are filled in later depending on what is supported in the InputModel
    const contentVBox = new VBox({
      spacing: PreferencesDialog.CONTENT_SPACING,
      align: 'left'
    });
    this.addChild(contentVBox);
    if (inputModel.supportsGestureControl) {
      const gestureControlText = new Text(gestureControlsString, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS);
      const gestureControlDescriptionNode = new VoicingRichText(gestureControlsDescriptionString, merge({}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
        lineWrap: 350,
        maxHeight: 100,
        readingBlockNameResponse: StringUtils.fillIn(labelledDescriptionPatternStringProperty, {
          label: gestureControlsString,
          description: gestureControlsDescriptionString
        })
      }));
      const gestureControlsEnabledSwitch = new ToggleSwitch(inputModel.gestureControlsEnabledProperty, false, true, combineOptions({
        a11yName: gestureControlsString,
        leftValueContextResponse: gestureControlDisabledAlertStringProperty,
        rightValueContextResponse: gestureControlEnabledAlertStringProperty
      }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS));
      const gestureControlsControl = new PreferencesControl({
        labelNode: gestureControlText,
        descriptionNode: gestureControlDescriptionNode,
        controlNode: gestureControlsEnabledSwitch
      });
      const gesturePanelSection = new PreferencesPanelSection({
        titleNode: gestureControlsControl,
        contentLeftMargin: 0
      });
      contentVBox.addChild(gesturePanelSection);
      this.disposeEmitter.addListener(() => {
        gesturePanelSection.dispose();
        gestureControlsControl.dispose();
        gestureControlsEnabledSwitch.dispose();
        gestureControlDescriptionNode.dispose();
        gestureControlText.dispose();
      });
    }
    const contentNode = new VBox({
      spacing: PreferencesDialog.CONTENT_SPACING,
      align: 'left'
    });
    inputModel.customPreferences.forEach(customPreference => {
      const customContent = customPreference.createContent(providedOptions.tandem);
      this.disposeEmitter.addListener(() => customContent.dispose());
      contentNode.addChild(new Node({
        children: [customContent]
      }));
    });
    const customPanelSection = new PreferencesPanelSection({
      contentNode: contentNode,
      contentLeftMargin: 0
    });
    contentVBox.addChild(customPanelSection);
    this.disposeInputPreferencesPanel = () => {
      contentVBox.dispose();
      customPanelSection.dispose();
      contentNode.children.forEach(child => child.dispose());
      contentNode.dispose();
    };
  }
  dispose() {
    this.disposeInputPreferencesPanel();
    super.dispose();
  }
}
joist.register('InputPreferencesPanel', InputPreferencesPanel);
export default InputPreferencesPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlN0cmluZ1V0aWxzIiwiTm9kZSIsIlRleHQiLCJWQm94IiwiVm9pY2luZ1JpY2hUZXh0IiwiVG9nZ2xlU3dpdGNoIiwiam9pc3QiLCJKb2lzdFN0cmluZ3MiLCJQcmVmZXJlbmNlc0RpYWxvZyIsIlByZWZlcmVuY2VzUGFuZWwiLCJQcmVmZXJlbmNlc1BhbmVsU2VjdGlvbiIsIlByZWZlcmVuY2VzQ29udHJvbCIsIlByZWZlcmVuY2VzVHlwZSIsIlByZWZlcmVuY2VzRGlhbG9nQ29uc3RhbnRzIiwiY29tYmluZU9wdGlvbnMiLCJnZXN0dXJlQ29udHJvbEVuYWJsZWRBbGVydFN0cmluZ1Byb3BlcnR5IiwiYTExeSIsInByZWZlcmVuY2VzIiwidGFicyIsImlucHV0IiwiZ2VzdHVyZUNvbnRyb2wiLCJlbmFibGVkQWxlcnRTdHJpbmdQcm9wZXJ0eSIsImdlc3R1cmVDb250cm9sRGlzYWJsZWRBbGVydFN0cmluZ1Byb3BlcnR5IiwiZGlzYWJsZWRBbGVydFN0cmluZ1Byb3BlcnR5IiwibGFiZWxsZWREZXNjcmlwdGlvblBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsImlucHV0VGl0bGVTdHJpbmciLCJnZXN0dXJlQ29udHJvbHNTdHJpbmciLCJnZXN0dXJlQ29udHJvbHNEZXNjcmlwdGlvblN0cmluZyIsIklucHV0UHJlZmVyZW5jZXNQYW5lbCIsImNvbnN0cnVjdG9yIiwiaW5wdXRNb2RlbCIsInNlbGVjdGVkVGFiUHJvcGVydHkiLCJ0YWJWaXNpYmxlUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJJTlBVVCIsImxhYmVsQ29udGVudCIsImNvbnRlbnRWQm94Iiwic3BhY2luZyIsIkNPTlRFTlRfU1BBQ0lORyIsImFsaWduIiwiYWRkQ2hpbGQiLCJzdXBwb3J0c0dlc3R1cmVDb250cm9sIiwiZ2VzdHVyZUNvbnRyb2xUZXh0IiwiUEFORUxfU0VDVElPTl9MQUJFTF9PUFRJT05TIiwiZ2VzdHVyZUNvbnRyb2xEZXNjcmlwdGlvbk5vZGUiLCJQQU5FTF9TRUNUSU9OX0NPTlRFTlRfT1BUSU9OUyIsImxpbmVXcmFwIiwibWF4SGVpZ2h0IiwicmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlIiwiZmlsbEluIiwibGFiZWwiLCJkZXNjcmlwdGlvbiIsImdlc3R1cmVDb250cm9sc0VuYWJsZWRTd2l0Y2giLCJnZXN0dXJlQ29udHJvbHNFbmFibGVkUHJvcGVydHkiLCJhMTF5TmFtZSIsImxlZnRWYWx1ZUNvbnRleHRSZXNwb25zZSIsInJpZ2h0VmFsdWVDb250ZXh0UmVzcG9uc2UiLCJUT0dHTEVfU1dJVENIX09QVElPTlMiLCJnZXN0dXJlQ29udHJvbHNDb250cm9sIiwibGFiZWxOb2RlIiwiZGVzY3JpcHRpb25Ob2RlIiwiY29udHJvbE5vZGUiLCJnZXN0dXJlUGFuZWxTZWN0aW9uIiwidGl0bGVOb2RlIiwiY29udGVudExlZnRNYXJnaW4iLCJkaXNwb3NlRW1pdHRlciIsImFkZExpc3RlbmVyIiwiZGlzcG9zZSIsImNvbnRlbnROb2RlIiwiY3VzdG9tUHJlZmVyZW5jZXMiLCJmb3JFYWNoIiwiY3VzdG9tUHJlZmVyZW5jZSIsImN1c3RvbUNvbnRlbnQiLCJjcmVhdGVDb250ZW50IiwidGFuZGVtIiwiY2hpbGRyZW4iLCJjdXN0b21QYW5lbFNlY3Rpb24iLCJkaXNwb3NlSW5wdXRQcmVmZXJlbmNlc1BhbmVsIiwiY2hpbGQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIklucHV0UHJlZmVyZW5jZXNQYW5lbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgcGFuZWwgb2YgdGhlIFByZWZlcmVuY2VzRGlhbG9nIHJlbGF0ZWQgdG8gb3B0aW9ucyByZWxhdGVkIHRvIHVzZXIgaW5wdXQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBUZXh0LCBWQm94LCBWb2ljaW5nUmljaFRleHQgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVG9nZ2xlU3dpdGNoLCB7IFRvZ2dsZVN3aXRjaE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9zdW4vanMvVG9nZ2xlU3dpdGNoLmpzJztcclxuaW1wb3J0IGpvaXN0IGZyb20gJy4uL2pvaXN0LmpzJztcclxuaW1wb3J0IEpvaXN0U3RyaW5ncyBmcm9tICcuLi9Kb2lzdFN0cmluZ3MuanMnO1xyXG5pbXBvcnQgUHJlZmVyZW5jZXNEaWFsb2cgZnJvbSAnLi9QcmVmZXJlbmNlc0RpYWxvZy5qcyc7XHJcbmltcG9ydCB7IElucHV0TW9kZWwgfSBmcm9tICcuL1ByZWZlcmVuY2VzTW9kZWwuanMnO1xyXG5pbXBvcnQgUHJlZmVyZW5jZXNQYW5lbCwgeyBQcmVmZXJlbmNlc1BhbmVsT3B0aW9ucyB9IGZyb20gJy4vUHJlZmVyZW5jZXNQYW5lbC5qcyc7XHJcbmltcG9ydCBQcmVmZXJlbmNlc1BhbmVsU2VjdGlvbiBmcm9tICcuL1ByZWZlcmVuY2VzUGFuZWxTZWN0aW9uLmpzJztcclxuaW1wb3J0IFByZWZlcmVuY2VzQ29udHJvbCBmcm9tICcuL1ByZWZlcmVuY2VzQ29udHJvbC5qcyc7XHJcbmltcG9ydCBQcmVmZXJlbmNlc1R5cGUgZnJvbSAnLi9QcmVmZXJlbmNlc1R5cGUuanMnO1xyXG5pbXBvcnQgUHJlZmVyZW5jZXNEaWFsb2dDb25zdGFudHMgZnJvbSAnLi9QcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgZ2VzdHVyZUNvbnRyb2xFbmFibGVkQWxlcnRTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuaW5wdXQuZ2VzdHVyZUNvbnRyb2wuZW5hYmxlZEFsZXJ0U3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IGdlc3R1cmVDb250cm9sRGlzYWJsZWRBbGVydFN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5pbnB1dC5nZXN0dXJlQ29udHJvbC5kaXNhYmxlZEFsZXJ0U3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IGxhYmVsbGVkRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmxhYmVsbGVkRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHk7XHJcblxyXG4vLyBOT1QgdHJhbnNsYXRhYmxlIHlldCBiZWNhdXNlIHRoaXMgdGFiIGRvZXMgbm90IGFwcGVhciBpbiBhbnkgcHVibGlzaGVkIHNpbXVsYXRpb24uXHJcbmNvbnN0IGlucHV0VGl0bGVTdHJpbmcgPSAnSW5wdXQnO1xyXG5jb25zdCBnZXN0dXJlQ29udHJvbHNTdHJpbmcgPSAnR2VzdHVyZSBDb250cm9sJztcclxuY29uc3QgZ2VzdHVyZUNvbnRyb2xzRGVzY3JpcHRpb25TdHJpbmcgPSAnVXNlIHRvdWNoIHdpdGggY3VzdG9tIHN3aXBlcyBhbmQgdGFwcyBpbnN0ZWFkLiBObyBkaXJlY3QgdG91Y2ggd2l0aCBnZXN0dXJlIGNvbnRyb2wgZW5hYmxlZC4nO1xyXG5cclxudHlwZSBJbnB1dFByZWZlcmVuY2VzUGFuZWxPcHRpb25zID0gUGlja1JlcXVpcmVkPFByZWZlcmVuY2VzUGFuZWxPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5jbGFzcyBJbnB1dFByZWZlcmVuY2VzUGFuZWwgZXh0ZW5kcyBQcmVmZXJlbmNlc1BhbmVsIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VJbnB1dFByZWZlcmVuY2VzUGFuZWw6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaW5wdXRNb2RlbDogSW5wdXRNb2RlbCwgc2VsZWN0ZWRUYWJQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8UHJlZmVyZW5jZXNUeXBlPiwgdGFiVmlzaWJsZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiwgcHJvdmlkZWRPcHRpb25zOiBJbnB1dFByZWZlcmVuY2VzUGFuZWxPcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCBQcmVmZXJlbmNlc1R5cGUuSU5QVVQsIHNlbGVjdGVkVGFiUHJvcGVydHksIHRhYlZpc2libGVQcm9wZXJ0eSwge1xyXG4gICAgICBsYWJlbENvbnRlbnQ6IGlucHV0VGl0bGVTdHJpbmdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjaGlsZHJlbiBhcmUgZmlsbGVkIGluIGxhdGVyIGRlcGVuZGluZyBvbiB3aGF0IGlzIHN1cHBvcnRlZCBpbiB0aGUgSW5wdXRNb2RlbFxyXG4gICAgY29uc3QgY29udGVudFZCb3ggPSBuZXcgVkJveCgge1xyXG4gICAgICBzcGFjaW5nOiBQcmVmZXJlbmNlc0RpYWxvZy5DT05URU5UX1NQQUNJTkcsXHJcbiAgICAgIGFsaWduOiAnbGVmdCdcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNvbnRlbnRWQm94ICk7XHJcblxyXG4gICAgaWYgKCBpbnB1dE1vZGVsLnN1cHBvcnRzR2VzdHVyZUNvbnRyb2wgKSB7XHJcblxyXG4gICAgICBjb25zdCBnZXN0dXJlQ29udHJvbFRleHQgPSBuZXcgVGV4dCggZ2VzdHVyZUNvbnRyb2xzU3RyaW5nLCBQcmVmZXJlbmNlc0RpYWxvZy5QQU5FTF9TRUNUSU9OX0xBQkVMX09QVElPTlMgKTtcclxuICAgICAgY29uc3QgZ2VzdHVyZUNvbnRyb2xEZXNjcmlwdGlvbk5vZGUgPSBuZXcgVm9pY2luZ1JpY2hUZXh0KCBnZXN0dXJlQ29udHJvbHNEZXNjcmlwdGlvblN0cmluZywgbWVyZ2UoIHt9LCBQcmVmZXJlbmNlc0RpYWxvZy5QQU5FTF9TRUNUSU9OX0NPTlRFTlRfT1BUSU9OUywge1xyXG4gICAgICAgIGxpbmVXcmFwOiAzNTAsXHJcbiAgICAgICAgbWF4SGVpZ2h0OiAxMDAsXHJcblxyXG4gICAgICAgIHJlYWRpbmdCbG9ja05hbWVSZXNwb25zZTogU3RyaW5nVXRpbHMuZmlsbEluKCBsYWJlbGxlZERlc2NyaXB0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgICAgICBsYWJlbDogZ2VzdHVyZUNvbnRyb2xzU3RyaW5nLFxyXG4gICAgICAgICAgZGVzY3JpcHRpb246IGdlc3R1cmVDb250cm9sc0Rlc2NyaXB0aW9uU3RyaW5nXHJcbiAgICAgICAgfSApXHJcbiAgICAgIH0gKSApO1xyXG4gICAgICBjb25zdCBnZXN0dXJlQ29udHJvbHNFbmFibGVkU3dpdGNoID0gbmV3IFRvZ2dsZVN3aXRjaCggaW5wdXRNb2RlbC5nZXN0dXJlQ29udHJvbHNFbmFibGVkUHJvcGVydHksIGZhbHNlLCB0cnVlLCBjb21iaW5lT3B0aW9uczxUb2dnbGVTd2l0Y2hPcHRpb25zPigge1xyXG4gICAgICAgIGExMXlOYW1lOiBnZXN0dXJlQ29udHJvbHNTdHJpbmcsXHJcbiAgICAgICAgbGVmdFZhbHVlQ29udGV4dFJlc3BvbnNlOiBnZXN0dXJlQ29udHJvbERpc2FibGVkQWxlcnRTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgICByaWdodFZhbHVlQ29udGV4dFJlc3BvbnNlOiBnZXN0dXJlQ29udHJvbEVuYWJsZWRBbGVydFN0cmluZ1Byb3BlcnR5XHJcbiAgICAgIH0sIFByZWZlcmVuY2VzRGlhbG9nQ29uc3RhbnRzLlRPR0dMRV9TV0lUQ0hfT1BUSU9OUyApICk7XHJcbiAgICAgIGNvbnN0IGdlc3R1cmVDb250cm9sc0NvbnRyb2wgPSBuZXcgUHJlZmVyZW5jZXNDb250cm9sKCB7XHJcbiAgICAgICAgbGFiZWxOb2RlOiBnZXN0dXJlQ29udHJvbFRleHQsXHJcbiAgICAgICAgZGVzY3JpcHRpb25Ob2RlOiBnZXN0dXJlQ29udHJvbERlc2NyaXB0aW9uTm9kZSxcclxuICAgICAgICBjb250cm9sTm9kZTogZ2VzdHVyZUNvbnRyb2xzRW5hYmxlZFN3aXRjaFxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBjb25zdCBnZXN0dXJlUGFuZWxTZWN0aW9uID0gbmV3IFByZWZlcmVuY2VzUGFuZWxTZWN0aW9uKCB7XHJcbiAgICAgICAgdGl0bGVOb2RlOiBnZXN0dXJlQ29udHJvbHNDb250cm9sLFxyXG4gICAgICAgIGNvbnRlbnRMZWZ0TWFyZ2luOiAwXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGNvbnRlbnRWQm94LmFkZENoaWxkKCBnZXN0dXJlUGFuZWxTZWN0aW9uICk7XHJcblxyXG4gICAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgICAgZ2VzdHVyZVBhbmVsU2VjdGlvbi5kaXNwb3NlKCk7XHJcbiAgICAgICAgZ2VzdHVyZUNvbnRyb2xzQ29udHJvbC5kaXNwb3NlKCk7XHJcbiAgICAgICAgZ2VzdHVyZUNvbnRyb2xzRW5hYmxlZFN3aXRjaC5kaXNwb3NlKCk7XHJcbiAgICAgICAgZ2VzdHVyZUNvbnRyb2xEZXNjcmlwdGlvbk5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICAgIGdlc3R1cmVDb250cm9sVGV4dC5kaXNwb3NlKCk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb250ZW50Tm9kZSA9IG5ldyBWQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IFByZWZlcmVuY2VzRGlhbG9nLkNPTlRFTlRfU1BBQ0lORyxcclxuICAgICAgYWxpZ246ICdsZWZ0J1xyXG4gICAgfSApO1xyXG5cclxuICAgIGlucHV0TW9kZWwuY3VzdG9tUHJlZmVyZW5jZXMuZm9yRWFjaCggY3VzdG9tUHJlZmVyZW5jZSA9PiB7XHJcbiAgICAgIGNvbnN0IGN1c3RvbUNvbnRlbnQgPSBjdXN0b21QcmVmZXJlbmNlLmNyZWF0ZUNvbnRlbnQoIHByb3ZpZGVkT3B0aW9ucy50YW5kZW0gKTtcclxuICAgICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gY3VzdG9tQ29udGVudC5kaXNwb3NlKCkgKTtcclxuICAgICAgY29udGVudE5vZGUuYWRkQ2hpbGQoXHJcbiAgICAgICAgbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgY3VzdG9tQ29udGVudCBdIH0gKVxyXG4gICAgICApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGN1c3RvbVBhbmVsU2VjdGlvbiA9IG5ldyBQcmVmZXJlbmNlc1BhbmVsU2VjdGlvbigge1xyXG4gICAgICBjb250ZW50Tm9kZTogY29udGVudE5vZGUsXHJcbiAgICAgIGNvbnRlbnRMZWZ0TWFyZ2luOiAwXHJcbiAgICB9ICk7XHJcbiAgICBjb250ZW50VkJveC5hZGRDaGlsZCggY3VzdG9tUGFuZWxTZWN0aW9uICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlSW5wdXRQcmVmZXJlbmNlc1BhbmVsID0gKCkgPT4ge1xyXG4gICAgICBjb250ZW50VkJveC5kaXNwb3NlKCk7XHJcbiAgICAgIGN1c3RvbVBhbmVsU2VjdGlvbi5kaXNwb3NlKCk7XHJcbiAgICAgIGNvbnRlbnROb2RlLmNoaWxkcmVuLmZvckVhY2goIGNoaWxkID0+IGNoaWxkLmRpc3Bvc2UoKSApO1xyXG4gICAgICBjb250ZW50Tm9kZS5kaXNwb3NlKCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VJbnB1dFByZWZlcmVuY2VzUGFuZWwoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmpvaXN0LnJlZ2lzdGVyKCAnSW5wdXRQcmVmZXJlbmNlc1BhbmVsJywgSW5wdXRQcmVmZXJlbmNlc1BhbmVsICk7XHJcbmV4cG9ydCBkZWZhdWx0IElucHV0UHJlZmVyZW5jZXNQYW5lbDtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLEtBQUssTUFBTSxnQ0FBZ0M7QUFFbEQsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxlQUFlLFFBQVEsZ0NBQWdDO0FBQ2xGLE9BQU9DLFlBQVksTUFBK0IsaUNBQWlDO0FBQ25GLE9BQU9DLEtBQUssTUFBTSxhQUFhO0FBQy9CLE9BQU9DLFlBQVksTUFBTSxvQkFBb0I7QUFDN0MsT0FBT0MsaUJBQWlCLE1BQU0sd0JBQXdCO0FBRXRELE9BQU9DLGdCQUFnQixNQUFtQyx1QkFBdUI7QUFDakYsT0FBT0MsdUJBQXVCLE1BQU0sOEJBQThCO0FBQ2xFLE9BQU9DLGtCQUFrQixNQUFNLHlCQUF5QjtBQUN4RCxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBQ2xELE9BQU9DLDBCQUEwQixNQUFNLGlDQUFpQztBQUN4RSxTQUFTQyxjQUFjLFFBQVEsb0NBQW9DOztBQUVuRTtBQUNBLE1BQU1DLHdDQUF3QyxHQUFHUixZQUFZLENBQUNTLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxJQUFJLENBQUNDLEtBQUssQ0FBQ0MsY0FBYyxDQUFDQywwQkFBMEI7QUFDbkksTUFBTUMseUNBQXlDLEdBQUdmLFlBQVksQ0FBQ1MsSUFBSSxDQUFDQyxXQUFXLENBQUNDLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxjQUFjLENBQUNHLDJCQUEyQjtBQUNySSxNQUFNQyx3Q0FBd0Ms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