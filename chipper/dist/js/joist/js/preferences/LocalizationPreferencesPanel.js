// Copyright 2022-2023, University of Colorado Boulder

/**
 * The content for the "Localization" tab in the PreferencesDialog.
 *
 * This is still being designed and developed. We expect it to contain a UI component to change the
 * language on the fly when running in the "_all" file. There may also be controls to change out
 * a character set or other artwork to match certain cultures or regions.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { HBox, Node, Text, VBox } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import RegionAndCultureComboBox from './RegionAndCultureComboBox.js';
import LocalePanel from './LocalePanel.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanel from './PreferencesPanel.js';
import PreferencesType from './PreferencesType.js';
import JoistStrings from '../JoistStrings.js';
import optionize from '../../../phet-core/js/optionize.js';

// constants
const localizationTitleStringProperty = JoistStrings.preferences.tabs.localization.titleStringProperty;
const regionAndCultureStringProperty = JoistStrings.preferences.tabs.localization.regionAndCulture.titleStringProperty;
class LocalizationPreferencesPanel extends PreferencesPanel {
  constructor(localizationModel, selectedTabProperty, tabVisibleProperty, providedOptions) {
    const options = optionize()({
      labelContent: localizationTitleStringProperty,
      phetioVisiblePropertyInstrumented: false
    }, providedOptions);
    super(PreferencesType.LOCALIZATION, selectedTabProperty, tabVisibleProperty, options);
    const contentNode = new VBox({
      spacing: PreferencesDialog.CONTENT_SPACING
    });

    // regionAndCultureProperty value only gets set in PreferencesModel if there is at least one descriptor.
    if (localizationModel.regionAndCultureProperty.value) {
      const comboBox = new RegionAndCultureComboBox(localizationModel.regionAndCultureProperty, localizationModel.characterSets);
      contentNode.addChild(new HBox({
        spacing: 10,
        children: [new Text(regionAndCultureStringProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS), comboBox]
      }));
      this.disposeEmitter.addListener(() => comboBox.dispose());
    }
    if (localizationModel.supportsDynamicLocales && localizationModel.includeLocalePanel) {
      const localePanel = new LocalePanel(localizationModel.localeProperty);
      contentNode.addChild(localePanel);
      this.disposeEmitter.addListener(() => localePanel.dispose());
    }
    localizationModel.customPreferences.forEach(customPreference => {
      const customContent = customPreference.createContent(providedOptions.tandem);
      this.disposeEmitter.addListener(() => customContent.dispose());
      contentNode.addChild(new Node({
        children: [customContent]
      }));
    });

    // center align within this content if there is only one item, otherwise left align all items
    contentNode.align = contentNode.children.length > 1 ? 'left' : 'center';
    const panelSection = new PreferencesPanelSection({
      contentNode: contentNode,
      // Without a title no indentation is necessary
      contentLeftMargin: 0
    });
    this.addChild(panelSection);
  }
}
joist.register('LocalizationPreferencesPanel', LocalizationPreferencesPanel);
export default LocalizationPreferencesPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJIQm94IiwiTm9kZSIsIlRleHQiLCJWQm94Iiwiam9pc3QiLCJQcmVmZXJlbmNlc1BhbmVsU2VjdGlvbiIsIlJlZ2lvbkFuZEN1bHR1cmVDb21ib0JveCIsIkxvY2FsZVBhbmVsIiwiUHJlZmVyZW5jZXNEaWFsb2ciLCJQcmVmZXJlbmNlc1BhbmVsIiwiUHJlZmVyZW5jZXNUeXBlIiwiSm9pc3RTdHJpbmdzIiwib3B0aW9uaXplIiwibG9jYWxpemF0aW9uVGl0bGVTdHJpbmdQcm9wZXJ0eSIsInByZWZlcmVuY2VzIiwidGFicyIsImxvY2FsaXphdGlvbiIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJyZWdpb25BbmRDdWx0dXJlU3RyaW5nUHJvcGVydHkiLCJyZWdpb25BbmRDdWx0dXJlIiwiTG9jYWxpemF0aW9uUHJlZmVyZW5jZXNQYW5lbCIsImNvbnN0cnVjdG9yIiwibG9jYWxpemF0aW9uTW9kZWwiLCJzZWxlY3RlZFRhYlByb3BlcnR5IiwidGFiVmlzaWJsZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImxhYmVsQ29udGVudCIsInBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCIsIkxPQ0FMSVpBVElPTiIsImNvbnRlbnROb2RlIiwic3BhY2luZyIsIkNPTlRFTlRfU1BBQ0lORyIsInJlZ2lvbkFuZEN1bHR1cmVQcm9wZXJ0eSIsInZhbHVlIiwiY29tYm9Cb3giLCJjaGFyYWN0ZXJTZXRzIiwiYWRkQ2hpbGQiLCJjaGlsZHJlbiIsIlBBTkVMX1NFQ1RJT05fQ09OVEVOVF9PUFRJT05TIiwiZGlzcG9zZUVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImRpc3Bvc2UiLCJzdXBwb3J0c0R5bmFtaWNMb2NhbGVzIiwiaW5jbHVkZUxvY2FsZVBhbmVsIiwibG9jYWxlUGFuZWwiLCJsb2NhbGVQcm9wZXJ0eSIsImN1c3RvbVByZWZlcmVuY2VzIiwiZm9yRWFjaCIsImN1c3RvbVByZWZlcmVuY2UiLCJjdXN0b21Db250ZW50IiwiY3JlYXRlQ29udGVudCIsInRhbmRlbSIsImFsaWduIiwibGVuZ3RoIiwicGFuZWxTZWN0aW9uIiwiY29udGVudExlZnRNYXJnaW4iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxvY2FsaXphdGlvblByZWZlcmVuY2VzUGFuZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIGNvbnRlbnQgZm9yIHRoZSBcIkxvY2FsaXphdGlvblwiIHRhYiBpbiB0aGUgUHJlZmVyZW5jZXNEaWFsb2cuXHJcbiAqXHJcbiAqIFRoaXMgaXMgc3RpbGwgYmVpbmcgZGVzaWduZWQgYW5kIGRldmVsb3BlZC4gV2UgZXhwZWN0IGl0IHRvIGNvbnRhaW4gYSBVSSBjb21wb25lbnQgdG8gY2hhbmdlIHRoZVxyXG4gKiBsYW5ndWFnZSBvbiB0aGUgZmx5IHdoZW4gcnVubmluZyBpbiB0aGUgXCJfYWxsXCIgZmlsZS4gVGhlcmUgbWF5IGFsc28gYmUgY29udHJvbHMgdG8gY2hhbmdlIG91dFxyXG4gKiBhIGNoYXJhY3RlciBzZXQgb3Igb3RoZXIgYXJ0d29yayB0byBtYXRjaCBjZXJ0YWluIGN1bHR1cmVzIG9yIHJlZ2lvbnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IEhCb3gsIE5vZGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgam9pc3QgZnJvbSAnLi4vam9pc3QuanMnO1xyXG5pbXBvcnQgeyBMb2NhbGl6YXRpb25Nb2RlbCB9IGZyb20gJy4vUHJlZmVyZW5jZXNNb2RlbC5qcyc7XHJcbmltcG9ydCBQcmVmZXJlbmNlc1BhbmVsU2VjdGlvbiBmcm9tICcuL1ByZWZlcmVuY2VzUGFuZWxTZWN0aW9uLmpzJztcclxuaW1wb3J0IFJlZ2lvbkFuZEN1bHR1cmVDb21ib0JveCBmcm9tICcuL1JlZ2lvbkFuZEN1bHR1cmVDb21ib0JveC5qcyc7XHJcbmltcG9ydCBMb2NhbGVQYW5lbCBmcm9tICcuL0xvY2FsZVBhbmVsLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFByZWZlcmVuY2VzRGlhbG9nIGZyb20gJy4vUHJlZmVyZW5jZXNEaWFsb2cuanMnO1xyXG5pbXBvcnQgUHJlZmVyZW5jZXNQYW5lbCwgeyBQcmVmZXJlbmNlc1BhbmVsT3B0aW9ucyB9IGZyb20gJy4vUHJlZmVyZW5jZXNQYW5lbC5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByZWZlcmVuY2VzVHlwZSBmcm9tICcuL1ByZWZlcmVuY2VzVHlwZS5qcyc7XHJcbmltcG9ydCBKb2lzdFN0cmluZ3MgZnJvbSAnLi4vSm9pc3RTdHJpbmdzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgbG9jYWxpemF0aW9uVGl0bGVTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5wcmVmZXJlbmNlcy50YWJzLmxvY2FsaXphdGlvbi50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCByZWdpb25BbmRDdWx0dXJlU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MucHJlZmVyZW5jZXMudGFicy5sb2NhbGl6YXRpb24ucmVnaW9uQW5kQ3VsdHVyZS50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIExvY2FsaXphdGlvblByZWZlcmVuY2VzUGFuZWxPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8UHJlZmVyZW5jZXNQYW5lbE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmNsYXNzIExvY2FsaXphdGlvblByZWZlcmVuY2VzUGFuZWwgZXh0ZW5kcyBQcmVmZXJlbmNlc1BhbmVsIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsb2NhbGl6YXRpb25Nb2RlbDogTG9jYWxpemF0aW9uTW9kZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFRhYlByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxQcmVmZXJlbmNlc1R5cGU+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgdGFiVmlzaWJsZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9uczogTG9jYWxpemF0aW9uUHJlZmVyZW5jZXNQYW5lbE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxMb2NhbGl6YXRpb25QcmVmZXJlbmNlc1BhbmVsT3B0aW9ucywgU2VsZk9wdGlvbnMsIFByZWZlcmVuY2VzUGFuZWxPcHRpb25zPigpKCB7XHJcbiAgICAgIGxhYmVsQ29udGVudDogbG9jYWxpemF0aW9uVGl0bGVTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgcGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIFByZWZlcmVuY2VzVHlwZS5MT0NBTElaQVRJT04sIHNlbGVjdGVkVGFiUHJvcGVydHksIHRhYlZpc2libGVQcm9wZXJ0eSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IGNvbnRlbnROb2RlID0gbmV3IFZCb3goIHtcclxuICAgICAgc3BhY2luZzogUHJlZmVyZW5jZXNEaWFsb2cuQ09OVEVOVF9TUEFDSU5HXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcmVnaW9uQW5kQ3VsdHVyZVByb3BlcnR5IHZhbHVlIG9ubHkgZ2V0cyBzZXQgaW4gUHJlZmVyZW5jZXNNb2RlbCBpZiB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgZGVzY3JpcHRvci5cclxuICAgIGlmICggbG9jYWxpemF0aW9uTW9kZWwucmVnaW9uQW5kQ3VsdHVyZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICBjb25zdCBjb21ib0JveCA9IG5ldyBSZWdpb25BbmRDdWx0dXJlQ29tYm9Cb3goIGxvY2FsaXphdGlvbk1vZGVsLnJlZ2lvbkFuZEN1bHR1cmVQcm9wZXJ0eSwgbG9jYWxpemF0aW9uTW9kZWwuY2hhcmFjdGVyU2V0cyApO1xyXG4gICAgICBjb250ZW50Tm9kZS5hZGRDaGlsZCggbmV3IEhCb3goIHtcclxuICAgICAgICBzcGFjaW5nOiAxMCxcclxuICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgbmV3IFRleHQoIHJlZ2lvbkFuZEN1bHR1cmVTdHJpbmdQcm9wZXJ0eSwgUHJlZmVyZW5jZXNEaWFsb2cuUEFORUxfU0VDVElPTl9DT05URU5UX09QVElPTlMgKSxcclxuICAgICAgICAgIGNvbWJvQm94XHJcbiAgICAgICAgXVxyXG4gICAgICB9ICkgKTtcclxuICAgICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gY29tYm9Cb3guZGlzcG9zZSgpICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBsb2NhbGl6YXRpb25Nb2RlbC5zdXBwb3J0c0R5bmFtaWNMb2NhbGVzICYmIGxvY2FsaXphdGlvbk1vZGVsLmluY2x1ZGVMb2NhbGVQYW5lbCApIHtcclxuICAgICAgY29uc3QgbG9jYWxlUGFuZWwgPSBuZXcgTG9jYWxlUGFuZWwoIGxvY2FsaXphdGlvbk1vZGVsLmxvY2FsZVByb3BlcnR5ICk7XHJcbiAgICAgIGNvbnRlbnROb2RlLmFkZENoaWxkKCBsb2NhbGVQYW5lbCApO1xyXG4gICAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiBsb2NhbGVQYW5lbC5kaXNwb3NlKCkgKTtcclxuICAgIH1cclxuXHJcbiAgICBsb2NhbGl6YXRpb25Nb2RlbC5jdXN0b21QcmVmZXJlbmNlcy5mb3JFYWNoKCBjdXN0b21QcmVmZXJlbmNlID0+IHtcclxuICAgICAgY29uc3QgY3VzdG9tQ29udGVudCA9IGN1c3RvbVByZWZlcmVuY2UuY3JlYXRlQ29udGVudCggcHJvdmlkZWRPcHRpb25zLnRhbmRlbSApO1xyXG4gICAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiBjdXN0b21Db250ZW50LmRpc3Bvc2UoKSApO1xyXG4gICAgICBjb250ZW50Tm9kZS5hZGRDaGlsZCggbmV3IE5vZGUoIHtcclxuICAgICAgICBjaGlsZHJlbjogWyBjdXN0b21Db250ZW50IF1cclxuICAgICAgfSApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY2VudGVyIGFsaWduIHdpdGhpbiB0aGlzIGNvbnRlbnQgaWYgdGhlcmUgaXMgb25seSBvbmUgaXRlbSwgb3RoZXJ3aXNlIGxlZnQgYWxpZ24gYWxsIGl0ZW1zXHJcbiAgICBjb250ZW50Tm9kZS5hbGlnbiA9IGNvbnRlbnROb2RlLmNoaWxkcmVuLmxlbmd0aCA+IDEgPyAnbGVmdCcgOiAnY2VudGVyJztcclxuXHJcbiAgICBjb25zdCBwYW5lbFNlY3Rpb24gPSBuZXcgUHJlZmVyZW5jZXNQYW5lbFNlY3Rpb24oIHtcclxuICAgICAgY29udGVudE5vZGU6IGNvbnRlbnROb2RlLFxyXG5cclxuICAgICAgLy8gV2l0aG91dCBhIHRpdGxlIG5vIGluZGVudGF0aW9uIGlzIG5lY2Vzc2FyeVxyXG4gICAgICBjb250ZW50TGVmdE1hcmdpbjogMFxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHBhbmVsU2VjdGlvbiApO1xyXG4gIH1cclxufVxyXG5cclxuam9pc3QucmVnaXN0ZXIoICdMb2NhbGl6YXRpb25QcmVmZXJlbmNlc1BhbmVsJywgTG9jYWxpemF0aW9uUHJlZmVyZW5jZXNQYW5lbCApO1xyXG5leHBvcnQgZGVmYXVsdCBMb2NhbGl6YXRpb25QcmVmZXJlbmNlc1BhbmVsO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsZ0NBQWdDO0FBQ3ZFLE9BQU9DLEtBQUssTUFBTSxhQUFhO0FBRS9CLE9BQU9DLHVCQUF1QixNQUFNLDhCQUE4QjtBQUNsRSxPQUFPQyx3QkFBd0IsTUFBTSwrQkFBK0I7QUFDcEUsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjtBQUUxQyxPQUFPQyxpQkFBaUIsTUFBTSx3QkFBd0I7QUFDdEQsT0FBT0MsZ0JBQWdCLE1BQW1DLHVCQUF1QjtBQUVqRixPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBQ2xELE9BQU9DLFlBQVksTUFBTSxvQkFBb0I7QUFDN0MsT0FBT0MsU0FBUyxNQUE0QixvQ0FBb0M7O0FBRWhGO0FBQ0EsTUFBTUMsK0JBQStCLEdBQUdGLFlBQVksQ0FBQ0csV0FBVyxDQUFDQyxJQUFJLENBQUNDLFlBQVksQ0FBQ0MsbUJBQW1CO0FBQ3RHLE1BQU1DLDhCQUE4QixHQUFHUCxZQUFZLENBQUNHLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxZQUFZLENBQUNHLGdCQUFnQixDQUFDRixtQkFBbUI7QUFNdEgsTUFBTUcsNEJBQTRCLFNBQVNYLGdCQUFnQixDQUFDO0VBRW5EWSxXQUFXQSxDQUFFQyxpQkFBb0MsRUFDcENDLG1CQUF1RCxFQUN2REMsa0JBQThDLEVBQzlDQyxlQUFvRCxFQUFHO0lBRXpFLE1BQU1DLE9BQU8sR0FBR2QsU0FBUyxDQUE0RSxDQUFDLENBQUU7TUFDdEdlLFlBQVksRUFBRWQsK0JBQStCO01BQzdDZSxpQ0FBaUMsRUFBRTtJQUNyQyxDQUFDLEVBQUVILGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUFFZixlQUFlLENBQUNtQixZQUFZLEVBQUVOLG1CQUFtQixFQUFFQyxrQkFBa0IsRUFBRUUsT0FBUSxDQUFDO0lBRXZGLE1BQU1JLFdBQVcsR0FBRyxJQUFJM0IsSUFBSSxDQUFFO01BQzVCNEIsT0FBTyxFQUFFdkIsaUJBQWlCLENBQUN3QjtJQUM3QixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFLVixpQkFBaUIsQ0FBQ1csd0JBQXdCLENBQUNDLEtBQUssRUFBRztNQUN0RCxNQUFNQyxRQUFRLEdBQUcsSUFBSTdCLHdCQUF3QixDQUFFZ0IsaUJBQWlCLENBQUNXLHdCQUF3QixFQUFFWCxpQkFBaUIsQ0FBQ2MsYUFBYyxDQUFDO01BQzVITixXQUFXLENBQUNPLFFBQVEsQ0FBRSxJQUFJckMsSUFBSSxDQUFFO1FBQzlCK0IsT0FBTyxFQUFFLEVBQUU7UUFDWE8sUUFBUSxFQUFFLENBQ1IsSUFBSXBDLElBQUksQ0FBRWdCLDhCQUE4QixFQUFFVixpQkFBaUIsQ0FBQytCLDZCQUE4QixDQUFDLEVBQzNGSixRQUFRO01BRVosQ0FBRSxDQUFFLENBQUM7TUFDTCxJQUFJLENBQUNLLGNBQWMsQ0FBQ0MsV0FBVyxDQUFFLE1BQU1OLFFBQVEsQ0FBQ08sT0FBTyxDQUFDLENBQUUsQ0FBQztJQUM3RDtJQUVBLElBQUtwQixpQkFBaUIsQ0FBQ3FCLHNCQUFzQixJQUFJckIsaUJBQWlCLENBQUNzQixrQkFBa0IsRUFBRztNQUN0RixNQUFNQyxXQUFXLEdBQUcsSUFBSXRDLFdBQVcsQ0FBRWUsaUJBQWlCLENBQUN3QixjQUFlLENBQUM7TUFDdkVoQixXQUFXLENBQUNPLFFBQVEsQ0FBRVEsV0FBWSxDQUFDO01BQ25DLElBQUksQ0FBQ0wsY0FBYyxDQUFDQyxXQUFXLENBQUUsTUFBTUksV0FBVyxDQUFDSCxPQUFPLENBQUMsQ0FBRSxDQUFDO0lBQ2hFO0lBRUFwQixpQkFBaUIsQ0FBQ3lCLGlCQUFpQixDQUFDQyxPQUFPLENBQUVDLGdCQUFnQixJQUFJO01BQy9ELE1BQU1DLGFBQWEsR0FBR0QsZ0JBQWdCLENBQUNFLGFBQWEsQ0FBRTFCLGVBQWUsQ0FBQzJCLE1BQU8sQ0FBQztNQUM5RSxJQUFJLENBQUNaLGNBQWMsQ0FBQ0MsV0FBVyxDQUFFLE1BQU1TLGFBQWEsQ0FBQ1IsT0FBTyxDQUFDLENBQUUsQ0FBQztNQUNoRVosV0FBVyxDQUFDTyxRQUFRLENBQUUsSUFBSXBDLElBQUksQ0FBRTtRQUM5QnFDLFFBQVEsRUFBRSxDQUFFWSxhQUFhO01BQzNCLENBQUUsQ0FBRSxDQUFDO0lBQ1AsQ0FBRSxDQUFDOztJQUVIO0lBQ0FwQixXQUFXLENBQUN1QixLQUFLLEdBQUd2QixXQUFXLENBQUNRLFFBQVEsQ0FBQ2dCLE1BQU0sR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLFFBQVE7SUFFdkUsTUFBTUMsWUFBWSxHQUFHLElBQUlsRCx1QkFBdUIsQ0FBRTtNQUNoRHlCLFdBQVcsRUFBRUEsV0FBVztNQUV4QjtNQUNBMEIsaUJBQWlCLEVBQUU7SUFDckIsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDbkIsUUFBUSxDQUFFa0IsWUFBYSxDQUFDO0VBQy9CO0FBQ0Y7QUFFQW5ELEtBQUssQ0FBQ3FELFFBQVEsQ0FBRSw4QkFBOEIsRUFBRXJDLDRCQUE2QixDQUFDO0FBQzlFLGVBQWVBLDRCQUE0QiJ9