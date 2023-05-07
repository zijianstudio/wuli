// Copyright 2020-2023, University of Colorado Boulder

/**
 * content for the "Keyboard Help" dialog that can be brought up from the sim's navigation bar
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BasicActionsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import GrabReleaseKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/GrabReleaseKeyboardHelpSection.js';
import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import KeyboardHelpSectionRow from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import TwoColumnKeyboardHelpContent from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import LetterKeyNode from '../../../../scenery-phet/js/keyboard/LetterKeyNode.js';
import { HBox } from '../../../../scenery/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawStrings from '../../FaradaysLawStrings.js';
class FaradaysLawKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  constructor() {
    // make all the KeyboardHelpSection consistent in layout
    const maxWidth = 175; // empirically determined
    const grabReleaseHelpSection = new GrabReleaseKeyboardHelpSection(FaradaysLawStrings.keyboardHelpDialog.barMagnetStringProperty, FaradaysLawStrings.keyboardHelpDialog.magnetStringProperty, {
      textMaxWidth: maxWidth
    });
    const basicActionsHelpSection = new BasicActionsKeyboardHelpSection({
      withCheckboxContent: true
    });
    const moveMagnetHelpSection = new MoveMagnetHelpSection({
      textMaxWidth: maxWidth
    });
    const autoSlideMagnetHelpSection = new AutoSlideMagnetHelpSection({
      textMaxWidth: maxWidth
    });
    KeyboardHelpSection.alignHelpSectionIcons([grabReleaseHelpSection, moveMagnetHelpSection, autoSlideMagnetHelpSection]);
    const leftContent = [grabReleaseHelpSection, moveMagnetHelpSection, autoSlideMagnetHelpSection];
    const rightContent = [basicActionsHelpSection];
    super(leftContent, rightContent, {
      sectionSpacing: 10
    });
  }
}

/**
 * @param {Object} [options]
 * @constructor
 */
class MoveMagnetHelpSection extends KeyboardHelpSection {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    // move grabbed magnet row
    const moveMagnetIcon = KeyboardHelpIconFactory.arrowOrWasdKeysRowIcon();
    const moveMagnetRow = KeyboardHelpSectionRow.labelWithIcon(FaradaysLawStrings.keyboardHelpDialog.moveGrabbedMagnet, moveMagnetIcon, {
      labelInnerContent: FaradaysLawStrings.keyboardHelpDialog.moveGrabbedMagnetWith
    });

    // move magnet slower row
    const shiftPlusArrowKeys = KeyboardHelpIconFactory.shiftPlusIcon(KeyboardHelpIconFactory.arrowKeysRowIcon());
    const shiftPlusWASDKeys = KeyboardHelpIconFactory.shiftPlusIcon(KeyboardHelpIconFactory.wasdRowIcon());
    const moveMagnetSlowerRow = KeyboardHelpSectionRow.labelWithIconList(FaradaysLawStrings.keyboardHelpDialog.moveGrabbedMagnetSlower, [shiftPlusArrowKeys, shiftPlusWASDKeys], {
      labelInnerContent: FaradaysLawStrings.keyboardHelpDialog.moveGrabbedMagnetSlowerWith
    });
    const rows = [moveMagnetRow, moveMagnetSlowerRow];
    super(FaradaysLawStrings.keyboardHelpDialog.moveGrabbedBarMagnet, rows, options);
    this.disposeEmitter.addListener(() => rows.forEach(row => row.dispose()));
  }
}

/**
 * @param {Object} [options]
 * @constructor
 */
class AutoSlideMagnetHelpSection extends KeyboardHelpSection {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    // row with text label and number icons
    const numberKeysIcon = new HBox({
      children: [LetterKeyNode.one(), LetterKeyNode.two(), LetterKeyNode.three()],
      spacing: 1
    });
    const moveGrabbedMagnetRow = KeyboardHelpSectionRow.labelWithIcon(FaradaysLawStrings.keyboardHelpDialog.autoSlideGrabbedBarMagnetText, numberKeysIcon, {
      labelInnerContent: FaradaysLawStrings.keyboardHelpDialog.autoSlideGrabbedBarMagnetWith
    });
    super(FaradaysLawStrings.keyboardHelpDialog.autoSlideGrabbedBarMagnet, [moveGrabbedMagnetRow], options);
    this.disposeEmitter.addListener(() => moveGrabbedMagnetRow.dispose());
  }
}
faradaysLaw.register('FaradaysLawKeyboardHelpContent', FaradaysLawKeyboardHelpContent);
export default FaradaysLawKeyboardHelpContent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCYXNpY0FjdGlvbnNLZXlib2FyZEhlbHBTZWN0aW9uIiwiR3JhYlJlbGVhc2VLZXlib2FyZEhlbHBTZWN0aW9uIiwiS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkiLCJLZXlib2FyZEhlbHBTZWN0aW9uIiwiS2V5Ym9hcmRIZWxwU2VjdGlvblJvdyIsIlR3b0NvbHVtbktleWJvYXJkSGVscENvbnRlbnQiLCJMZXR0ZXJLZXlOb2RlIiwiSEJveCIsImZhcmFkYXlzTGF3IiwiRmFyYWRheXNMYXdTdHJpbmdzIiwiRmFyYWRheXNMYXdLZXlib2FyZEhlbHBDb250ZW50IiwiY29uc3RydWN0b3IiLCJtYXhXaWR0aCIsImdyYWJSZWxlYXNlSGVscFNlY3Rpb24iLCJrZXlib2FyZEhlbHBEaWFsb2ciLCJiYXJNYWduZXRTdHJpbmdQcm9wZXJ0eSIsIm1hZ25ldFN0cmluZ1Byb3BlcnR5IiwidGV4dE1heFdpZHRoIiwiYmFzaWNBY3Rpb25zSGVscFNlY3Rpb24iLCJ3aXRoQ2hlY2tib3hDb250ZW50IiwibW92ZU1hZ25ldEhlbHBTZWN0aW9uIiwiTW92ZU1hZ25ldEhlbHBTZWN0aW9uIiwiYXV0b1NsaWRlTWFnbmV0SGVscFNlY3Rpb24iLCJBdXRvU2xpZGVNYWduZXRIZWxwU2VjdGlvbiIsImFsaWduSGVscFNlY3Rpb25JY29ucyIsImxlZnRDb250ZW50IiwicmlnaHRDb250ZW50Iiwic2VjdGlvblNwYWNpbmciLCJvcHRpb25zIiwibW92ZU1hZ25ldEljb24iLCJhcnJvd09yV2FzZEtleXNSb3dJY29uIiwibW92ZU1hZ25ldFJvdyIsImxhYmVsV2l0aEljb24iLCJtb3ZlR3JhYmJlZE1hZ25ldCIsImxhYmVsSW5uZXJDb250ZW50IiwibW92ZUdyYWJiZWRNYWduZXRXaXRoIiwic2hpZnRQbHVzQXJyb3dLZXlzIiwic2hpZnRQbHVzSWNvbiIsImFycm93S2V5c1Jvd0ljb24iLCJzaGlmdFBsdXNXQVNES2V5cyIsIndhc2RSb3dJY29uIiwibW92ZU1hZ25ldFNsb3dlclJvdyIsImxhYmVsV2l0aEljb25MaXN0IiwibW92ZUdyYWJiZWRNYWduZXRTbG93ZXIiLCJtb3ZlR3JhYmJlZE1hZ25ldFNsb3dlcldpdGgiLCJyb3dzIiwibW92ZUdyYWJiZWRCYXJNYWduZXQiLCJkaXNwb3NlRW1pdHRlciIsImFkZExpc3RlbmVyIiwiZm9yRWFjaCIsInJvdyIsImRpc3Bvc2UiLCJudW1iZXJLZXlzSWNvbiIsImNoaWxkcmVuIiwib25lIiwidHdvIiwidGhyZWUiLCJzcGFjaW5nIiwibW92ZUdyYWJiZWRNYWduZXRSb3ciLCJhdXRvU2xpZGVHcmFiYmVkQmFyTWFnbmV0VGV4dCIsImF1dG9TbGlkZUdyYWJiZWRCYXJNYWduZXRXaXRoIiwiYXV0b1NsaWRlR3JhYmJlZEJhck1hZ25ldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRmFyYWRheXNMYXdLZXlib2FyZEhlbHBDb250ZW50LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIGNvbnRlbnQgZm9yIHRoZSBcIktleWJvYXJkIEhlbHBcIiBkaWFsb2cgdGhhdCBjYW4gYmUgYnJvdWdodCB1cCBmcm9tIHRoZSBzaW0ncyBuYXZpZ2F0aW9uIGJhclxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCYXNpY0FjdGlvbnNLZXlib2FyZEhlbHBTZWN0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9oZWxwL0Jhc2ljQWN0aW9uc0tleWJvYXJkSGVscFNlY3Rpb24uanMnO1xyXG5pbXBvcnQgR3JhYlJlbGVhc2VLZXlib2FyZEhlbHBTZWN0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9oZWxwL0dyYWJSZWxlYXNlS2V5Ym9hcmRIZWxwU2VjdGlvbi5qcyc7XHJcbmltcG9ydCBLZXlib2FyZEhlbHBJY29uRmFjdG9yeSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMva2V5Ym9hcmQvaGVscC9LZXlib2FyZEhlbHBJY29uRmFjdG9yeS5qcyc7XHJcbmltcG9ydCBLZXlib2FyZEhlbHBTZWN0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9oZWxwL0tleWJvYXJkSGVscFNlY3Rpb24uanMnO1xyXG5pbXBvcnQgS2V5Ym9hcmRIZWxwU2VjdGlvblJvdyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMva2V5Ym9hcmQvaGVscC9LZXlib2FyZEhlbHBTZWN0aW9uUm93LmpzJztcclxuaW1wb3J0IFR3b0NvbHVtbktleWJvYXJkSGVscENvbnRlbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2tleWJvYXJkL2hlbHAvVHdvQ29sdW1uS2V5Ym9hcmRIZWxwQ29udGVudC5qcyc7XHJcbmltcG9ydCBMZXR0ZXJLZXlOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9MZXR0ZXJLZXlOb2RlLmpzJztcclxuaW1wb3J0IHsgSEJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBmYXJhZGF5c0xhdyBmcm9tICcuLi8uLi9mYXJhZGF5c0xhdy5qcyc7XHJcbmltcG9ydCBGYXJhZGF5c0xhd1N0cmluZ3MgZnJvbSAnLi4vLi4vRmFyYWRheXNMYXdTdHJpbmdzLmpzJztcclxuXHJcbmNsYXNzIEZhcmFkYXlzTGF3S2V5Ym9hcmRIZWxwQ29udGVudCBleHRlbmRzIFR3b0NvbHVtbktleWJvYXJkSGVscENvbnRlbnQge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICAvLyBtYWtlIGFsbCB0aGUgS2V5Ym9hcmRIZWxwU2VjdGlvbiBjb25zaXN0ZW50IGluIGxheW91dFxyXG4gICAgY29uc3QgbWF4V2lkdGggPSAxNzU7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgIGNvbnN0IGdyYWJSZWxlYXNlSGVscFNlY3Rpb24gPSBuZXcgR3JhYlJlbGVhc2VLZXlib2FyZEhlbHBTZWN0aW9uKFxyXG4gICAgICBGYXJhZGF5c0xhd1N0cmluZ3Mua2V5Ym9hcmRIZWxwRGlhbG9nLmJhck1hZ25ldFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBGYXJhZGF5c0xhd1N0cmluZ3Mua2V5Ym9hcmRIZWxwRGlhbG9nLm1hZ25ldFN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgICAgdGV4dE1heFdpZHRoOiBtYXhXaWR0aFxyXG4gICAgICB9ICk7XHJcbiAgICBjb25zdCBiYXNpY0FjdGlvbnNIZWxwU2VjdGlvbiA9IG5ldyBCYXNpY0FjdGlvbnNLZXlib2FyZEhlbHBTZWN0aW9uKCB7XHJcbiAgICAgIHdpdGhDaGVja2JveENvbnRlbnQ6IHRydWVcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IG1vdmVNYWduZXRIZWxwU2VjdGlvbiA9IG5ldyBNb3ZlTWFnbmV0SGVscFNlY3Rpb24oIHtcclxuICAgICAgdGV4dE1heFdpZHRoOiBtYXhXaWR0aFxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgYXV0b1NsaWRlTWFnbmV0SGVscFNlY3Rpb24gPSBuZXcgQXV0b1NsaWRlTWFnbmV0SGVscFNlY3Rpb24oIHtcclxuICAgICAgdGV4dE1heFdpZHRoOiBtYXhXaWR0aFxyXG4gICAgfSApO1xyXG5cclxuICAgIEtleWJvYXJkSGVscFNlY3Rpb24uYWxpZ25IZWxwU2VjdGlvbkljb25zKCBbIGdyYWJSZWxlYXNlSGVscFNlY3Rpb24sIG1vdmVNYWduZXRIZWxwU2VjdGlvbiwgYXV0b1NsaWRlTWFnbmV0SGVscFNlY3Rpb24gXSApO1xyXG5cclxuICAgIGNvbnN0IGxlZnRDb250ZW50ID0gWyBncmFiUmVsZWFzZUhlbHBTZWN0aW9uLCBtb3ZlTWFnbmV0SGVscFNlY3Rpb24sIGF1dG9TbGlkZU1hZ25ldEhlbHBTZWN0aW9uIF07XHJcbiAgICBjb25zdCByaWdodENvbnRlbnQgPSBbIGJhc2ljQWN0aW9uc0hlbHBTZWN0aW9uIF07XHJcbiAgICBzdXBlciggbGVmdENvbnRlbnQsIHJpZ2h0Q29udGVudCwge1xyXG4gICAgICBzZWN0aW9uU3BhY2luZzogMTBcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuY2xhc3MgTW92ZU1hZ25ldEhlbHBTZWN0aW9uIGV4dGVuZHMgS2V5Ym9hcmRIZWxwU2VjdGlvbiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcclxuXHJcbiAgICAvLyBtb3ZlIGdyYWJiZWQgbWFnbmV0IHJvd1xyXG4gICAgY29uc3QgbW92ZU1hZ25ldEljb24gPSBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5hcnJvd09yV2FzZEtleXNSb3dJY29uKCk7XHJcbiAgICBjb25zdCBtb3ZlTWFnbmV0Um93ID0gS2V5Ym9hcmRIZWxwU2VjdGlvblJvdy5sYWJlbFdpdGhJY29uKFxyXG4gICAgICBGYXJhZGF5c0xhd1N0cmluZ3Mua2V5Ym9hcmRIZWxwRGlhbG9nLm1vdmVHcmFiYmVkTWFnbmV0LFxyXG4gICAgICBtb3ZlTWFnbmV0SWNvbiwge1xyXG4gICAgICAgIGxhYmVsSW5uZXJDb250ZW50OiBGYXJhZGF5c0xhd1N0cmluZ3Mua2V5Ym9hcmRIZWxwRGlhbG9nLm1vdmVHcmFiYmVkTWFnbmV0V2l0aFxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gbW92ZSBtYWduZXQgc2xvd2VyIHJvd1xyXG4gICAgY29uc3Qgc2hpZnRQbHVzQXJyb3dLZXlzID0gS2V5Ym9hcmRIZWxwSWNvbkZhY3Rvcnkuc2hpZnRQbHVzSWNvbiggS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkuYXJyb3dLZXlzUm93SWNvbigpICk7XHJcbiAgICBjb25zdCBzaGlmdFBsdXNXQVNES2V5cyA9IEtleWJvYXJkSGVscEljb25GYWN0b3J5LnNoaWZ0UGx1c0ljb24oIEtleWJvYXJkSGVscEljb25GYWN0b3J5Lndhc2RSb3dJY29uKCkgKTtcclxuICAgIGNvbnN0IG1vdmVNYWduZXRTbG93ZXJSb3cgPSBLZXlib2FyZEhlbHBTZWN0aW9uUm93LmxhYmVsV2l0aEljb25MaXN0KFxyXG4gICAgICBGYXJhZGF5c0xhd1N0cmluZ3Mua2V5Ym9hcmRIZWxwRGlhbG9nLm1vdmVHcmFiYmVkTWFnbmV0U2xvd2VyLFxyXG4gICAgICBbIHNoaWZ0UGx1c0Fycm93S2V5cywgc2hpZnRQbHVzV0FTREtleXMgXSwge1xyXG4gICAgICAgIGxhYmVsSW5uZXJDb250ZW50OiBGYXJhZGF5c0xhd1N0cmluZ3Mua2V5Ym9hcmRIZWxwRGlhbG9nLm1vdmVHcmFiYmVkTWFnbmV0U2xvd2VyV2l0aFxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgcm93cyA9IFsgbW92ZU1hZ25ldFJvdywgbW92ZU1hZ25ldFNsb3dlclJvdyBdO1xyXG4gICAgc3VwZXIoIEZhcmFkYXlzTGF3U3RyaW5ncy5rZXlib2FyZEhlbHBEaWFsb2cubW92ZUdyYWJiZWRCYXJNYWduZXQsIHJvd3MsIG9wdGlvbnMgKTtcclxuICAgIHRoaXMuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHJvd3MuZm9yRWFjaCggcm93ID0+IHJvdy5kaXNwb3NlKCkgKSApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5jbGFzcyBBdXRvU2xpZGVNYWduZXRIZWxwU2VjdGlvbiBleHRlbmRzIEtleWJvYXJkSGVscFNlY3Rpb24ge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gcm93IHdpdGggdGV4dCBsYWJlbCBhbmQgbnVtYmVyIGljb25zXHJcbiAgICBjb25zdCBudW1iZXJLZXlzSWNvbiA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgTGV0dGVyS2V5Tm9kZS5vbmUoKSxcclxuICAgICAgICBMZXR0ZXJLZXlOb2RlLnR3bygpLFxyXG4gICAgICAgIExldHRlcktleU5vZGUudGhyZWUoKVxyXG4gICAgICBdLFxyXG4gICAgICBzcGFjaW5nOiAxXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBtb3ZlR3JhYmJlZE1hZ25ldFJvdyA9IEtleWJvYXJkSGVscFNlY3Rpb25Sb3cubGFiZWxXaXRoSWNvbihcclxuICAgICAgRmFyYWRheXNMYXdTdHJpbmdzLmtleWJvYXJkSGVscERpYWxvZy5hdXRvU2xpZGVHcmFiYmVkQmFyTWFnbmV0VGV4dCxcclxuICAgICAgbnVtYmVyS2V5c0ljb24sIHtcclxuICAgICAgICBsYWJlbElubmVyQ29udGVudDogRmFyYWRheXNMYXdTdHJpbmdzLmtleWJvYXJkSGVscERpYWxvZy5hdXRvU2xpZGVHcmFiYmVkQmFyTWFnbmV0V2l0aFxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIEZhcmFkYXlzTGF3U3RyaW5ncy5rZXlib2FyZEhlbHBEaWFsb2cuYXV0b1NsaWRlR3JhYmJlZEJhck1hZ25ldCwgWyBtb3ZlR3JhYmJlZE1hZ25ldFJvdyBdLCBvcHRpb25zICk7XHJcbiAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiBtb3ZlR3JhYmJlZE1hZ25ldFJvdy5kaXNwb3NlKCkgKTtcclxuICB9XHJcbn1cclxuXHJcbmZhcmFkYXlzTGF3LnJlZ2lzdGVyKCAnRmFyYWRheXNMYXdLZXlib2FyZEhlbHBDb250ZW50JywgRmFyYWRheXNMYXdLZXlib2FyZEhlbHBDb250ZW50ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBGYXJh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