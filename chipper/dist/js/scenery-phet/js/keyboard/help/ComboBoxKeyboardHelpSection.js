// Copyright 2020-2023, University of Colorado Boulder

/**
 * Help section for explaining how to use a keyboard to interact with a ComboBox.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import sceneryPhet from '../../sceneryPhet.js';
import SceneryPhetStrings from '../../SceneryPhetStrings.js';
import TextKeyNode from '../TextKeyNode.js';
import KeyboardHelpIconFactory from './KeyboardHelpIconFactory.js';
import KeyboardHelpSection from './KeyboardHelpSection.js';
import KeyboardHelpSectionRow from './KeyboardHelpSectionRow.js';
export default class ComboBoxKeyboardHelpSection extends KeyboardHelpSection {
  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      headingString: SceneryPhetStrings.keyboardHelpDialog.comboBox.headingStringStringProperty,
      thingAsLowerCaseSingular: SceneryPhetStrings.keyboardHelpDialog.comboBox.optionStringProperty,
      thingAsLowerCasePlural: SceneryPhetStrings.keyboardHelpDialog.comboBox.optionsStringProperty,
      // KeyboardHelpSectionOptions
      a11yContentTagName: 'ol',
      // ordered list
      vBoxOptions: {
        spacing: 8 // A bit tighter so that it looks like one set of instructions
      }
    }, providedOptions);

    // options may be string or TReadOnlyProperty<string>, so ensure that we have a TReadOnlyProperty<string>.
    const thingAsLowerCasePluralStringProperty = typeof options.thingAsLowerCasePlural === 'string' ? new StringProperty(options.thingAsLowerCasePlural) : options.thingAsLowerCasePlural;
    const thingAsLowerCaseSingularStringProperty = typeof options.thingAsLowerCaseSingular === 'string' ? new StringProperty(options.thingAsLowerCaseSingular) : options.thingAsLowerCaseSingular;
    const ourPatternStringsToDispose = [];

    // Create a DerivedProperty that fills in a plural/singular pattern, and support dynamic locale.
    const createPatternStringProperty = providedStringProperty => {
      const patternStringProperty = new PatternStringProperty(providedStringProperty, {
        thingPlural: thingAsLowerCasePluralStringProperty,
        thingSingular: thingAsLowerCaseSingularStringProperty
      });
      ourPatternStringsToDispose.push(patternStringProperty);
      return patternStringProperty;
    };
    const spaceKeyNode = TextKeyNode.space();
    const enterKeyNode = TextKeyNode.enter();
    const spaceOrEnterIcon = KeyboardHelpIconFactory.iconOrIcon(spaceKeyNode, enterKeyNode);
    const popUpList = KeyboardHelpSectionRow.labelWithIcon(createPatternStringProperty(SceneryPhetStrings.keyboardHelpDialog.comboBox.popUpListPatternStringProperty), spaceOrEnterIcon, {
      labelInnerContent: createPatternStringProperty(SceneryPhetStrings.a11y.keyboardHelpDialog.comboBox.popUpListPatternDescriptionStringProperty)
    });
    const moveThrough = KeyboardHelpSectionRow.labelWithIcon(createPatternStringProperty(SceneryPhetStrings.keyboardHelpDialog.comboBox.moveThroughPatternStringProperty), KeyboardHelpIconFactory.upDownArrowKeysRowIcon(), {
      labelInnerContent: createPatternStringProperty(SceneryPhetStrings.a11y.keyboardHelpDialog.comboBox.moveThroughPatternDescriptionStringProperty)
    });
    const chooseNew = KeyboardHelpSectionRow.labelWithIcon(createPatternStringProperty(SceneryPhetStrings.keyboardHelpDialog.comboBox.chooseNewPatternStringProperty), enterKeyNode, {
      labelInnerContent: createPatternStringProperty(SceneryPhetStrings.a11y.keyboardHelpDialog.comboBox.chooseNewPatternDescriptionStringProperty)
    });
    const escapeKeyNode = TextKeyNode.esc();
    const closeWithoutChanging = KeyboardHelpSectionRow.labelWithIcon(SceneryPhetStrings.keyboardHelpDialog.comboBox.closeWithoutChangingStringProperty, escapeKeyNode, {
      labelInnerContent: SceneryPhetStrings.a11y.keyboardHelpDialog.comboBox.closeWithoutChangingDescriptionStringProperty
    });

    // order the rows of content
    const rows = [popUpList, moveThrough, chooseNew, closeWithoutChanging];
    super(options.headingString, rows, options);
    this.disposeEmitter.addListener(() => {
      rows.forEach(row => row.dispose());
      escapeKeyNode.dispose();
      spaceOrEnterIcon.dispose();
      enterKeyNode.dispose();
      spaceKeyNode.dispose();
      ourPatternStringsToDispose.forEach(pattern => pattern.dispose());
    });
  }
}
sceneryPhet.register('ComboBoxKeyboardHelpSection', ComboBoxKeyboardHelpSection);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJTdHJpbmdQcm9wZXJ0eSIsIm9wdGlvbml6ZSIsInNjZW5lcnlQaGV0IiwiU2NlbmVyeVBoZXRTdHJpbmdzIiwiVGV4dEtleU5vZGUiLCJLZXlib2FyZEhlbHBJY29uRmFjdG9yeSIsIktleWJvYXJkSGVscFNlY3Rpb24iLCJLZXlib2FyZEhlbHBTZWN0aW9uUm93IiwiQ29tYm9Cb3hLZXlib2FyZEhlbHBTZWN0aW9uIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiaGVhZGluZ1N0cmluZyIsImtleWJvYXJkSGVscERpYWxvZyIsImNvbWJvQm94IiwiaGVhZGluZ1N0cmluZ1N0cmluZ1Byb3BlcnR5IiwidGhpbmdBc0xvd2VyQ2FzZVNpbmd1bGFyIiwib3B0aW9uU3RyaW5nUHJvcGVydHkiLCJ0aGluZ0FzTG93ZXJDYXNlUGx1cmFsIiwib3B0aW9uc1N0cmluZ1Byb3BlcnR5IiwiYTExeUNvbnRlbnRUYWdOYW1lIiwidkJveE9wdGlvbnMiLCJzcGFjaW5nIiwidGhpbmdBc0xvd2VyQ2FzZVBsdXJhbFN0cmluZ1Byb3BlcnR5IiwidGhpbmdBc0xvd2VyQ2FzZVNpbmd1bGFyU3RyaW5nUHJvcGVydHkiLCJvdXJQYXR0ZXJuU3RyaW5nc1RvRGlzcG9zZSIsImNyZWF0ZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsInByb3ZpZGVkU3RyaW5nUHJvcGVydHkiLCJwYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJ0aGluZ1BsdXJhbCIsInRoaW5nU2luZ3VsYXIiLCJwdXNoIiwic3BhY2VLZXlOb2RlIiwic3BhY2UiLCJlbnRlcktleU5vZGUiLCJlbnRlciIsInNwYWNlT3JFbnRlckljb24iLCJpY29uT3JJY29uIiwicG9wVXBMaXN0IiwibGFiZWxXaXRoSWNvbiIsInBvcFVwTGlzdFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsImxhYmVsSW5uZXJDb250ZW50IiwiYTExeSIsInBvcFVwTGlzdFBhdHRlcm5EZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5IiwibW92ZVRocm91Z2giLCJtb3ZlVGhyb3VnaFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsInVwRG93bkFycm93S2V5c1Jvd0ljb24iLCJtb3ZlVGhyb3VnaFBhdHRlcm5EZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5IiwiY2hvb3NlTmV3IiwiY2hvb3NlTmV3UGF0dGVyblN0cmluZ1Byb3BlcnR5IiwiY2hvb3NlTmV3UGF0dGVybkRlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJlc2NhcGVLZXlOb2RlIiwiZXNjIiwiY2xvc2VXaXRob3V0Q2hhbmdpbmciLCJjbG9zZVdpdGhvdXRDaGFuZ2luZ1N0cmluZ1Byb3BlcnR5IiwiY2xvc2VXaXRob3V0Q2hhbmdpbmdEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5Iiwicm93cyIsImRpc3Bvc2VFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJmb3JFYWNoIiwicm93IiwiZGlzcG9zZSIsInBhdHRlcm4iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvbWJvQm94S2V5Ym9hcmRIZWxwU2VjdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBIZWxwIHNlY3Rpb24gZm9yIGV4cGxhaW5pbmcgaG93IHRvIHVzZSBhIGtleWJvYXJkIHRvIGludGVyYWN0IHdpdGggYSBDb21ib0JveC5cclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQYXR0ZXJuU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9QYXR0ZXJuU3RyaW5nUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4uLy4uL3NjZW5lcnlQaGV0LmpzJztcclxuaW1wb3J0IFNjZW5lcnlQaGV0U3RyaW5ncyBmcm9tICcuLi8uLi9TY2VuZXJ5UGhldFN0cmluZ3MuanMnO1xyXG5pbXBvcnQgVGV4dEtleU5vZGUgZnJvbSAnLi4vVGV4dEtleU5vZGUuanMnO1xyXG5pbXBvcnQgS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkgZnJvbSAnLi9LZXlib2FyZEhlbHBJY29uRmFjdG9yeS5qcyc7XHJcbmltcG9ydCBLZXlib2FyZEhlbHBTZWN0aW9uLCB7IEtleWJvYXJkSGVscFNlY3Rpb25PcHRpb25zIH0gZnJvbSAnLi9LZXlib2FyZEhlbHBTZWN0aW9uLmpzJztcclxuaW1wb3J0IEtleWJvYXJkSGVscFNlY3Rpb25Sb3cgZnJvbSAnLi9LZXlib2FyZEhlbHBTZWN0aW9uUm93LmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIEhlYWRpbmcgZm9yIHRoZSBzZWN0aW9uLCBzaG91bGQgYmUgY2FwaXRhbGl6ZWQgYXMgYSB0aXRsZVxyXG4gIGhlYWRpbmdTdHJpbmc/OiBzdHJpbmcgfCBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+O1xyXG5cclxuICAvLyB0aGUgaXRlbSBiZWluZyBjaGFuZ2VkIGJ5IHRoZSBjb21ibyBib3gsIGxvd2VyIGNhc2UgYXMgdXNlZCBpbiBhIHNlbnRlbmNlXHJcbiAgdGhpbmdBc0xvd2VyQ2FzZVNpbmd1bGFyPzogc3RyaW5nIHwgVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcclxuXHJcbiAgLy8gcGx1cmFsIHZlcnNpb24gb2YgdGhpbmdBc0xvd2VyQ2FzZVNpbmd1bGFyXHJcbiAgdGhpbmdBc0xvd2VyQ2FzZVBsdXJhbD86IHN0cmluZyB8IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz47XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBDb21ib0JveEtleWJvYXJkSGVscFNlY3Rpb25PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBLZXlib2FyZEhlbHBTZWN0aW9uT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbWJvQm94S2V5Ym9hcmRIZWxwU2VjdGlvbiBleHRlbmRzIEtleWJvYXJkSGVscFNlY3Rpb24ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IENvbWJvQm94S2V5Ym9hcmRIZWxwU2VjdGlvbk9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDb21ib0JveEtleWJvYXJkSGVscFNlY3Rpb25PcHRpb25zLCBTZWxmT3B0aW9ucywgS2V5Ym9hcmRIZWxwU2VjdGlvbk9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIGhlYWRpbmdTdHJpbmc6IFNjZW5lcnlQaGV0U3RyaW5ncy5rZXlib2FyZEhlbHBEaWFsb2cuY29tYm9Cb3guaGVhZGluZ1N0cmluZ1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgICB0aGluZ0FzTG93ZXJDYXNlU2luZ3VsYXI6IFNjZW5lcnlQaGV0U3RyaW5ncy5rZXlib2FyZEhlbHBEaWFsb2cuY29tYm9Cb3gub3B0aW9uU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIHRoaW5nQXNMb3dlckNhc2VQbHVyYWw6IFNjZW5lcnlQaGV0U3RyaW5ncy5rZXlib2FyZEhlbHBEaWFsb2cuY29tYm9Cb3gub3B0aW9uc1N0cmluZ1Byb3BlcnR5LFxyXG5cclxuICAgICAgLy8gS2V5Ym9hcmRIZWxwU2VjdGlvbk9wdGlvbnNcclxuICAgICAgYTExeUNvbnRlbnRUYWdOYW1lOiAnb2wnLCAvLyBvcmRlcmVkIGxpc3RcclxuICAgICAgdkJveE9wdGlvbnM6IHtcclxuICAgICAgICBzcGFjaW5nOiA4IC8vIEEgYml0IHRpZ2h0ZXIgc28gdGhhdCBpdCBsb29rcyBsaWtlIG9uZSBzZXQgb2YgaW5zdHJ1Y3Rpb25zXHJcbiAgICAgIH1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIG9wdGlvbnMgbWF5IGJlIHN0cmluZyBvciBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCBzbyBlbnN1cmUgdGhhdCB3ZSBoYXZlIGEgVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPi5cclxuICAgIGNvbnN0IHRoaW5nQXNMb3dlckNhc2VQbHVyYWxTdHJpbmdQcm9wZXJ0eSA9ICggdHlwZW9mIG9wdGlvbnMudGhpbmdBc0xvd2VyQ2FzZVBsdXJhbCA9PT0gJ3N0cmluZycgKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgU3RyaW5nUHJvcGVydHkoIG9wdGlvbnMudGhpbmdBc0xvd2VyQ2FzZVBsdXJhbCApIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudGhpbmdBc0xvd2VyQ2FzZVBsdXJhbDtcclxuICAgIGNvbnN0IHRoaW5nQXNMb3dlckNhc2VTaW5ndWxhclN0cmluZ1Byb3BlcnR5ID0gKCB0eXBlb2Ygb3B0aW9ucy50aGluZ0FzTG93ZXJDYXNlU2luZ3VsYXIgPT09ICdzdHJpbmcnICkgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgU3RyaW5nUHJvcGVydHkoIG9wdGlvbnMudGhpbmdBc0xvd2VyQ2FzZVNpbmd1bGFyICkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnRoaW5nQXNMb3dlckNhc2VTaW5ndWxhcjtcclxuXHJcbiAgICBjb25zdCBvdXJQYXR0ZXJuU3RyaW5nc1RvRGlzcG9zZTogUGF0dGVyblN0cmluZ1Byb3BlcnR5PG9iamVjdD5bXSA9IFtdO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIERlcml2ZWRQcm9wZXJ0eSB0aGF0IGZpbGxzIGluIGEgcGx1cmFsL3Npbmd1bGFyIHBhdHRlcm4sIGFuZCBzdXBwb3J0IGR5bmFtaWMgbG9jYWxlLlxyXG4gICAgY29uc3QgY3JlYXRlUGF0dGVyblN0cmluZ1Byb3BlcnR5ID0gKCBwcm92aWRlZFN0cmluZ1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+ICkgPT4ge1xyXG4gICAgICBjb25zdCBwYXR0ZXJuU3RyaW5nUHJvcGVydHkgPSBuZXcgUGF0dGVyblN0cmluZ1Byb3BlcnR5KFxyXG4gICAgICAgIHByb3ZpZGVkU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICAgIHRoaW5nUGx1cmFsOiB0aGluZ0FzTG93ZXJDYXNlUGx1cmFsU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgICB0aGluZ1Npbmd1bGFyOiB0aGluZ0FzTG93ZXJDYXNlU2luZ3VsYXJTdHJpbmdQcm9wZXJ0eVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgb3VyUGF0dGVyblN0cmluZ3NUb0Rpc3Bvc2UucHVzaCggcGF0dGVyblN0cmluZ1Byb3BlcnR5ICk7XHJcbiAgICAgIHJldHVybiBwYXR0ZXJuU3RyaW5nUHJvcGVydHk7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHNwYWNlS2V5Tm9kZSA9IFRleHRLZXlOb2RlLnNwYWNlKCk7XHJcbiAgICBjb25zdCBlbnRlcktleU5vZGUgPSBUZXh0S2V5Tm9kZS5lbnRlcigpO1xyXG4gICAgY29uc3Qgc3BhY2VPckVudGVySWNvbiA9IEtleWJvYXJkSGVscEljb25GYWN0b3J5Lmljb25Pckljb24oIHNwYWNlS2V5Tm9kZSwgZW50ZXJLZXlOb2RlICk7XHJcblxyXG4gICAgY29uc3QgcG9wVXBMaXN0ID0gS2V5Ym9hcmRIZWxwU2VjdGlvblJvdy5sYWJlbFdpdGhJY29uKFxyXG4gICAgICBjcmVhdGVQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIFNjZW5lcnlQaGV0U3RyaW5ncy5rZXlib2FyZEhlbHBEaWFsb2cuY29tYm9Cb3gucG9wVXBMaXN0UGF0dGVyblN0cmluZ1Byb3BlcnR5ICksXHJcbiAgICAgIHNwYWNlT3JFbnRlckljb24sIHtcclxuICAgICAgICBsYWJlbElubmVyQ29udGVudDogY3JlYXRlUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5rZXlib2FyZEhlbHBEaWFsb2cuY29tYm9Cb3gucG9wVXBMaXN0UGF0dGVybkRlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbW92ZVRocm91Z2ggPSBLZXlib2FyZEhlbHBTZWN0aW9uUm93LmxhYmVsV2l0aEljb24oXHJcbiAgICAgIGNyZWF0ZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggU2NlbmVyeVBoZXRTdHJpbmdzLmtleWJvYXJkSGVscERpYWxvZy5jb21ib0JveC5tb3ZlVGhyb3VnaFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSApLFxyXG4gICAgICBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS51cERvd25BcnJvd0tleXNSb3dJY29uKCksIHtcclxuICAgICAgICBsYWJlbElubmVyQ29udGVudDogY3JlYXRlUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5rZXlib2FyZEhlbHBEaWFsb2cuY29tYm9Cb3gubW92ZVRocm91Z2hQYXR0ZXJuRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjaG9vc2VOZXcgPSBLZXlib2FyZEhlbHBTZWN0aW9uUm93LmxhYmVsV2l0aEljb24oXHJcbiAgICAgIGNyZWF0ZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggU2NlbmVyeVBoZXRTdHJpbmdzLmtleWJvYXJkSGVscERpYWxvZy5jb21ib0JveC5jaG9vc2VOZXdQYXR0ZXJuU3RyaW5nUHJvcGVydHkgKSxcclxuICAgICAgZW50ZXJLZXlOb2RlLCB7XHJcbiAgICAgICAgbGFiZWxJbm5lckNvbnRlbnQ6IGNyZWF0ZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkua2V5Ym9hcmRIZWxwRGlhbG9nLmNvbWJvQm94LmNob29zZU5ld1BhdHRlcm5EZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5IClcclxuICAgICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGVzY2FwZUtleU5vZGUgPSBUZXh0S2V5Tm9kZS5lc2MoKTtcclxuICAgIGNvbnN0IGNsb3NlV2l0aG91dENoYW5naW5nID0gS2V5Ym9hcmRIZWxwU2VjdGlvblJvdy5sYWJlbFdpdGhJY29uKFxyXG4gICAgICBTY2VuZXJ5UGhldFN0cmluZ3Mua2V5Ym9hcmRIZWxwRGlhbG9nLmNvbWJvQm94LmNsb3NlV2l0aG91dENoYW5naW5nU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGVzY2FwZUtleU5vZGUsIHtcclxuICAgICAgICBsYWJlbElubmVyQ29udGVudDogU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkua2V5Ym9hcmRIZWxwRGlhbG9nLmNvbWJvQm94LmNsb3NlV2l0aG91dENoYW5naW5nRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gb3JkZXIgdGhlIHJvd3Mgb2YgY29udGVudFxyXG4gICAgY29uc3Qgcm93cyA9IFsgcG9wVXBMaXN0LCBtb3ZlVGhyb3VnaCwgY2hvb3NlTmV3LCBjbG9zZVdpdGhvdXRDaGFuZ2luZyBdO1xyXG4gICAgc3VwZXIoIG9wdGlvbnMuaGVhZGluZ1N0cmluZywgcm93cywgb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgcm93cy5mb3JFYWNoKCByb3cgPT4gcm93LmRpc3Bvc2UoKSApO1xyXG4gICAgICBlc2NhcGVLZXlOb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgc3BhY2VPckVudGVySWNvbi5kaXNwb3NlKCk7XHJcbiAgICAgIGVudGVyS2V5Tm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIHNwYWNlS2V5Tm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIG91clBhdHRlcm5TdHJpbmdzVG9EaXNwb3NlLmZvckVhY2goIHBhdHRlcm4gPT4gcGF0dGVybi5kaXNwb3NlKCkgKTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnQ29tYm9Cb3hLZXlib2FyZEhlbHBTZWN0aW9uJywgQ29tYm9Cb3hLZXlib2FyZEhlbHBTZWN0aW9uICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHFCQUFxQixNQUFNLDhDQUE4QztBQUNoRixPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBRWxFLE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFDN0QsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MsV0FBVyxNQUFNLG1CQUFtQjtBQUMzQyxPQUFPQyx1QkFBdUIsTUFBTSw4QkFBOEI7QUFDbEUsT0FBT0MsbUJBQW1CLE1BQXNDLDBCQUEwQjtBQUMxRixPQUFPQyxzQkFBc0IsTUFBTSw2QkFBNkI7QUFnQmhFLGVBQWUsTUFBTUMsMkJBQTJCLFNBQVNGLG1CQUFtQixDQUFDO0VBRXBFRyxXQUFXQSxDQUFFQyxlQUFvRCxFQUFHO0lBRXpFLE1BQU1DLE9BQU8sR0FBR1YsU0FBUyxDQUE4RSxDQUFDLENBQUU7TUFFeEc7TUFDQVcsYUFBYSxFQUFFVCxrQkFBa0IsQ0FBQ1Usa0JBQWtCLENBQUNDLFFBQVEsQ0FBQ0MsMkJBQTJCO01BQ3pGQyx3QkFBd0IsRUFBRWIsa0JBQWtCLENBQUNVLGtCQUFrQixDQUFDQyxRQUFRLENBQUNHLG9CQUFvQjtNQUM3RkMsc0JBQXNCLEVBQUVmLGtCQUFr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