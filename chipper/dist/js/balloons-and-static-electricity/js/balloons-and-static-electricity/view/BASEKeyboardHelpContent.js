// Copyright 2015-2023, University of Colorado Boulder

/**
 * Content for the "Keyboard Shortcuts" dialog that can be brought up from the sim navigation bar.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import BasicActionsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import KeyboardHelpSectionRow from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import TwoColumnKeyboardHelpContent from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import TextKeyNode from '../../../../scenery-phet/js/keyboard/TextKeyNode.js';
import balloonsAndStaticElectricity from '../../balloonsAndStaticElectricity.js';
import BalloonsAndStaticElectricityStrings from '../../BalloonsAndStaticElectricityStrings.js';
import BASEA11yStrings from '../BASEA11yStrings.js';
const grabOrReleaseBalloonHeadingString = BalloonsAndStaticElectricityStrings.grabOrReleaseBalloonHeading;
const grabOrReleaseBalloonLabelString = BalloonsAndStaticElectricityStrings.grabOrReleaseBalloonLabel;
const jumpCloseToSweaterLabelString = BalloonsAndStaticElectricityStrings.jumpCloseToSweaterLabel;
const jumpCloseToWallLabelString = BalloonsAndStaticElectricityStrings.jumpCloseToWallLabel;
const jumpNearWallLabelString = BalloonsAndStaticElectricityStrings.jumpNearWallLabel;
const jumpToCenterLabelString = BalloonsAndStaticElectricityStrings.jumpToCenterLabel;
const moveGrabbedBalloonLabelString = BalloonsAndStaticElectricityStrings.moveGrabbedBalloonLabel;
const moveOrJumpGrabbedBalloonHeadingString = BalloonsAndStaticElectricityStrings.moveOrJumpGrabbedBalloonHeading;
const moveSlowerLabelString = BalloonsAndStaticElectricityStrings.moveSlowerLabel;
const grabOrReleaseBalloonDescriptionString = BASEA11yStrings.grabOrReleaseBalloonDescription.value;
const moveGrabbedBalloonDescriptionString = BASEA11yStrings.moveGrabbedBalloonDescription.value;
const moveSlowerDescriptionString = BASEA11yStrings.moveSlowerDescription.value;
const jumpsCloseToSweaterDescriptionString = BASEA11yStrings.jumpsCloseToSweaterDescription.value;
const jumpsCloseToWwallDescriptionString = BASEA11yStrings.jumpsCloseToWwallDescription.value;
const jumpsNearWallDescriptionString = BASEA11yStrings.jumpsNearWallDescription.value;
const jumpstoCenterDescriptionString = BASEA11yStrings.jumpstoCenterDescription.value;

// constants
// the english strings are shorter for the balloon help content, so we restrict that content width for i18n more
// so that the whole content will fit in dev bounds 
const BALLOON_CONTENT_MAX_WIDTH = 174;
const GENERAL_CONTENT_MAX_WIDTH = 214;

/**
 * Constructor.
 * @constructor
 */
class BASEKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  constructor() {
    //  the sections of help content
    const balloonGrabHelpSection = new BalloonGrabHelpSection({
      textMaxWidth: BALLOON_CONTENT_MAX_WIDTH
    });
    const basicActionsHelpSection = new BasicActionsKeyboardHelpSection({
      textMaxWidth: GENERAL_CONTENT_MAX_WIDTH
    });
    const moveBalloonHelpSection = new MoveBalloonHelpSection({
      textMaxWidth: BALLOON_CONTENT_MAX_WIDTH
    });

    // vertically align the left sections
    KeyboardHelpSection.alignHelpSectionIcons([balloonGrabHelpSection, moveBalloonHelpSection]);

    // left aligned sections, and section about how to move the grabbed balloon are horizontally aligned
    super([balloonGrabHelpSection, moveBalloonHelpSection], [basicActionsHelpSection], {
      columnSpacing: 27
    });

    // the reading order for screen readers
    this.pdomOrder = [balloonGrabHelpSection, moveBalloonHelpSection, basicActionsHelpSection];
  }
}
balloonsAndStaticElectricity.register('BASEKeyboardHelpContent', BASEKeyboardHelpContent);

/**
 * Inner class. Help section for how to grab and release the balloon.
 */
class BalloonGrabHelpSection extends KeyboardHelpSection {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    const spaceKeyNode = TextKeyNode.space();
    const enterKeyNode = TextKeyNode.enter();
    const icons = KeyboardHelpIconFactory.iconOrIcon(spaceKeyNode, enterKeyNode);
    const labelWithContent = KeyboardHelpSectionRow.labelWithIcon(grabOrReleaseBalloonLabelString, icons, {
      labelInnerContent: grabOrReleaseBalloonDescriptionString,
      iconOptions: {
        tagName: 'p' // it is the only item so it is a p rather than a li
      }
    });

    super(grabOrReleaseBalloonHeadingString, [labelWithContent], merge({
      a11yContentTagName: null // just a paragraph for this section, no list
    }, options));
    this.disposeEmitter.addListener(() => {
      labelWithContent.dispose();
      icons.dispose();
      spaceKeyNode.dispose();
      enterKeyNode.dispose();
    });
  }
}

/**
 * Help section for how to move the balloon or use hotkeys to make the balloon jump to positions.
 */
class MoveBalloonHelpSection extends KeyboardHelpSection {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    const arrowOrWasdKeysIcon = KeyboardHelpIconFactory.arrowOrWasdKeysRowIcon();
    const labelWithContent = KeyboardHelpSectionRow.labelWithIcon(moveGrabbedBalloonLabelString, arrowOrWasdKeysIcon, {
      labelInnerContent: moveGrabbedBalloonDescriptionString
    });
    const arrowKeysIcon = KeyboardHelpIconFactory.arrowKeysRowIcon();
    const shiftAndArrowKeysIcon = KeyboardHelpIconFactory.shiftPlusIcon(arrowKeysIcon);
    const wasdRowIcon = KeyboardHelpIconFactory.wasdRowIcon();
    const shiftAndWasdRowIcon = KeyboardHelpIconFactory.shiftPlusIcon(wasdRowIcon);
    const labelWithIconList = KeyboardHelpSectionRow.labelWithIconList(moveSlowerLabelString, [shiftAndArrowKeysIcon, shiftAndWasdRowIcon], {
      labelInnerContent: moveSlowerDescriptionString
    });

    // hotkey rows for how to jump the balloon
    const jumpToSweaterRow = KeyboardHelpSectionRow.createJumpKeyRow('S', jumpCloseToSweaterLabelString, {
      labelInnerContent: jumpsCloseToSweaterDescriptionString
    });
    const jumpToWallRow = KeyboardHelpSectionRow.createJumpKeyRow('W', jumpCloseToWallLabelString, {
      labelInnerContent: jumpsCloseToWwallDescriptionString
    });
    const jumpNearWallRow = KeyboardHelpSectionRow.createJumpKeyRow('N', jumpNearWallLabelString, {
      labelInnerContent: jumpsNearWallDescriptionString
    });
    const jumpToCenterRow = KeyboardHelpSectionRow.createJumpKeyRow('C', jumpToCenterLabelString, {
      labelInnerContent: jumpstoCenterDescriptionString
    });

    // all rows contained in a left aligned vbox
    const rows = [labelWithContent, labelWithIconList, jumpToSweaterRow, jumpToWallRow, jumpNearWallRow, jumpToCenterRow];
    super(moveOrJumpGrabbedBalloonHeadingString, rows, options);
    this.disposeEmitter.addListener(() => rows.forEach(row => row.dispose()));
  }
}
export default BASEKeyboardHelpContent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkJhc2ljQWN0aW9uc0tleWJvYXJkSGVscFNlY3Rpb24iLCJLZXlib2FyZEhlbHBJY29uRmFjdG9yeSIsIktleWJvYXJkSGVscFNlY3Rpb24iLCJLZXlib2FyZEhlbHBTZWN0aW9uUm93IiwiVHdvQ29sdW1uS2V5Ym9hcmRIZWxwQ29udGVudCIsIlRleHRLZXlOb2RlIiwiYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eSIsIkJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHlTdHJpbmdzIiwiQkFTRUExMXlTdHJpbmdzIiwiZ3JhYk9yUmVsZWFzZUJhbGxvb25IZWFkaW5nU3RyaW5nIiwiZ3JhYk9yUmVsZWFzZUJhbGxvb25IZWFkaW5nIiwiZ3JhYk9yUmVsZWFzZUJhbGxvb25MYWJlbFN0cmluZyIsImdyYWJPclJlbGVhc2VCYWxsb29uTGFiZWwiLCJqdW1wQ2xvc2VUb1N3ZWF0ZXJMYWJlbFN0cmluZyIsImp1bXBDbG9zZVRvU3dlYXRlckxhYmVsIiwianVtcENsb3NlVG9XYWxsTGFiZWxTdHJpbmciLCJqdW1wQ2xvc2VUb1dhbGxMYWJlbCIsImp1bXBOZWFyV2FsbExhYmVsU3RyaW5nIiwianVtcE5lYXJXYWxsTGFiZWwiLCJqdW1wVG9DZW50ZXJMYWJlbFN0cmluZyIsImp1bXBUb0NlbnRlckxhYmVsIiwibW92ZUdyYWJiZWRCYWxsb29uTGFiZWxTdHJpbmciLCJtb3ZlR3JhYmJlZEJhbGxvb25MYWJlbCIsIm1vdmVPckp1bXBHcmFiYmVkQmFsbG9vbkhlYWRpbmdTdHJpbmciLCJtb3ZlT3JKdW1wR3JhYmJlZEJhbGxvb25IZWFkaW5nIiwibW92ZVNsb3dlckxhYmVsU3RyaW5nIiwibW92ZVNsb3dlckxhYmVsIiwiZ3JhYk9yUmVsZWFzZUJhbGxvb25EZXNjcmlwdGlvblN0cmluZyIsImdyYWJPclJlbGVhc2VCYWxsb29uRGVzY3JpcHRpb24iLCJ2YWx1ZSIsIm1vdmVHcmFiYmVkQmFsbG9vbkRlc2NyaXB0aW9uU3RyaW5nIiwibW92ZUdyYWJiZWRCYWxsb29uRGVzY3JpcHRpb24iLCJtb3ZlU2xvd2VyRGVzY3JpcHRpb25TdHJpbmciLCJtb3ZlU2xvd2VyRGVzY3JpcHRpb24iLCJqdW1wc0Nsb3NlVG9Td2VhdGVyRGVzY3JpcHRpb25TdHJpbmciLCJqdW1wc0Nsb3NlVG9Td2VhdGVyRGVzY3JpcHRpb24iLCJqdW1wc0Nsb3NlVG9Xd2FsbERlc2NyaXB0aW9uU3RyaW5nIiwianVtcHNDbG9zZVRvV3dhbGxEZXNjcmlwdGlvbiIsImp1bXBzTmVhcldhbGxEZXNjcmlwdGlvblN0cmluZyIsImp1bXBzTmVhcldhbGxEZXNjcmlwdGlvbiIsImp1bXBzdG9DZW50ZXJEZXNjcmlwdGlvblN0cmluZyIsImp1bXBzdG9DZW50ZXJEZXNjcmlwdGlvbiIsIkJBTExPT05fQ09OVEVOVF9NQVhfV0lEVEgiLCJHRU5FUkFMX0NPTlRFTlRfTUFYX1dJRFRIIiwiQkFTRUtleWJvYXJkSGVscENvbnRlbnQiLCJjb25zdHJ1Y3RvciIsImJhbGxvb25HcmFiSGVscFNlY3Rpb24iLCJCYWxsb29uR3JhYkhlbHBTZWN0aW9uIiwidGV4dE1heFdpZHRoIiwiYmFzaWNBY3Rpb25zSGVscFNlY3Rpb24iLCJtb3ZlQmFsbG9vbkhlbHBTZWN0aW9uIiwiTW92ZUJhbGxvb25IZWxwU2VjdGlvbiIsImFsaWduSGVscFNlY3Rpb25JY29ucyIsImNvbHVtblNwYWNpbmciLCJwZG9tT3JkZXIiLCJyZWdpc3RlciIsIm9wdGlvbnMiLCJzcGFjZUtleU5vZGUiLCJzcGFjZSIsImVudGVyS2V5Tm9kZSIsImVudGVyIiwiaWNvbnMiLCJpY29uT3JJY29uIiwibGFiZWxXaXRoQ29udGVudCIsImxhYmVsV2l0aEljb24iLCJsYWJlbElubmVyQ29udGVudCIsImljb25PcHRpb25zIiwidGFnTmFtZSIsImExMXlDb250ZW50VGFnTmFtZSIsImRpc3Bvc2VFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJkaXNwb3NlIiwiYXJyb3dPcldhc2RLZXlzSWNvbiIsImFycm93T3JXYXNkS2V5c1Jvd0ljb24iLCJhcnJvd0tleXNJY29uIiwiYXJyb3dLZXlzUm93SWNvbiIsInNoaWZ0QW5kQXJyb3dLZXlzSWNvbiIsInNoaWZ0UGx1c0ljb24iLCJ3YXNkUm93SWNvbiIsInNoaWZ0QW5kV2FzZFJvd0ljb24iLCJsYWJlbFdpdGhJY29uTGlzdCIsImp1bXBUb1N3ZWF0ZXJSb3ciLCJjcmVhdGVKdW1wS2V5Um93IiwianVtcFRvV2FsbFJvdyIsImp1bXBOZWFyV2FsbFJvdyIsImp1bXBUb0NlbnRlclJvdyIsInJvd3MiLCJmb3JFYWNoIiwicm93Il0sInNvdXJjZXMiOlsiQkFTRUtleWJvYXJkSGVscENvbnRlbnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29udGVudCBmb3IgdGhlIFwiS2V5Ym9hcmQgU2hvcnRjdXRzXCIgZGlhbG9nIHRoYXQgY2FuIGJlIGJyb3VnaHQgdXAgZnJvbSB0aGUgc2ltIG5hdmlnYXRpb24gYmFyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEJhc2ljQWN0aW9uc0tleWJvYXJkSGVscFNlY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2tleWJvYXJkL2hlbHAvQmFzaWNBY3Rpb25zS2V5Ym9hcmRIZWxwU2VjdGlvbi5qcyc7XHJcbmltcG9ydCBLZXlib2FyZEhlbHBJY29uRmFjdG9yeSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMva2V5Ym9hcmQvaGVscC9LZXlib2FyZEhlbHBJY29uRmFjdG9yeS5qcyc7XHJcbmltcG9ydCBLZXlib2FyZEhlbHBTZWN0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9oZWxwL0tleWJvYXJkSGVscFNlY3Rpb24uanMnO1xyXG5pbXBvcnQgS2V5Ym9hcmRIZWxwU2VjdGlvblJvdyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMva2V5Ym9hcmQvaGVscC9LZXlib2FyZEhlbHBTZWN0aW9uUm93LmpzJztcclxuaW1wb3J0IFR3b0NvbHVtbktleWJvYXJkSGVscENvbnRlbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2tleWJvYXJkL2hlbHAvVHdvQ29sdW1uS2V5Ym9hcmRIZWxwQ29udGVudC5qcyc7XHJcbmltcG9ydCBUZXh0S2V5Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMva2V5Ym9hcmQvVGV4dEtleU5vZGUuanMnO1xyXG5pbXBvcnQgYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eSBmcm9tICcuLi8uLi9iYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5LmpzJztcclxuaW1wb3J0IEJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHlTdHJpbmdzIGZyb20gJy4uLy4uL0JhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHlTdHJpbmdzLmpzJztcclxuaW1wb3J0IEJBU0VBMTF5U3RyaW5ncyBmcm9tICcuLi9CQVNFQTExeVN0cmluZ3MuanMnO1xyXG5cclxuY29uc3QgZ3JhYk9yUmVsZWFzZUJhbGxvb25IZWFkaW5nU3RyaW5nID0gQmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eVN0cmluZ3MuZ3JhYk9yUmVsZWFzZUJhbGxvb25IZWFkaW5nO1xyXG5jb25zdCBncmFiT3JSZWxlYXNlQmFsbG9vbkxhYmVsU3RyaW5nID0gQmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eVN0cmluZ3MuZ3JhYk9yUmVsZWFzZUJhbGxvb25MYWJlbDtcclxuY29uc3QganVtcENsb3NlVG9Td2VhdGVyTGFiZWxTdHJpbmcgPSBCYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5U3RyaW5ncy5qdW1wQ2xvc2VUb1N3ZWF0ZXJMYWJlbDtcclxuY29uc3QganVtcENsb3NlVG9XYWxsTGFiZWxTdHJpbmcgPSBCYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5U3RyaW5ncy5qdW1wQ2xvc2VUb1dhbGxMYWJlbDtcclxuY29uc3QganVtcE5lYXJXYWxsTGFiZWxTdHJpbmcgPSBCYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5U3RyaW5ncy5qdW1wTmVhcldhbGxMYWJlbDtcclxuY29uc3QganVtcFRvQ2VudGVyTGFiZWxTdHJpbmcgPSBCYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5U3RyaW5ncy5qdW1wVG9DZW50ZXJMYWJlbDtcclxuY29uc3QgbW92ZUdyYWJiZWRCYWxsb29uTGFiZWxTdHJpbmcgPSBCYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5U3RyaW5ncy5tb3ZlR3JhYmJlZEJhbGxvb25MYWJlbDtcclxuY29uc3QgbW92ZU9ySnVtcEdyYWJiZWRCYWxsb29uSGVhZGluZ1N0cmluZyA9IEJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHlTdHJpbmdzLm1vdmVPckp1bXBHcmFiYmVkQmFsbG9vbkhlYWRpbmc7XHJcbmNvbnN0IG1vdmVTbG93ZXJMYWJlbFN0cmluZyA9IEJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHlTdHJpbmdzLm1vdmVTbG93ZXJMYWJlbDtcclxuXHJcbmNvbnN0IGdyYWJPclJlbGVhc2VCYWxsb29uRGVzY3JpcHRpb25TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuZ3JhYk9yUmVsZWFzZUJhbGxvb25EZXNjcmlwdGlvbi52YWx1ZTtcclxuY29uc3QgbW92ZUdyYWJiZWRCYWxsb29uRGVzY3JpcHRpb25TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MubW92ZUdyYWJiZWRCYWxsb29uRGVzY3JpcHRpb24udmFsdWU7XHJcbmNvbnN0IG1vdmVTbG93ZXJEZXNjcmlwdGlvblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5tb3ZlU2xvd2VyRGVzY3JpcHRpb24udmFsdWU7XHJcbmNvbnN0IGp1bXBzQ2xvc2VUb1N3ZWF0ZXJEZXNjcmlwdGlvblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5qdW1wc0Nsb3NlVG9Td2VhdGVyRGVzY3JpcHRpb24udmFsdWU7XHJcbmNvbnN0IGp1bXBzQ2xvc2VUb1d3YWxsRGVzY3JpcHRpb25TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuanVtcHNDbG9zZVRvV3dhbGxEZXNjcmlwdGlvbi52YWx1ZTtcclxuY29uc3QganVtcHNOZWFyV2FsbERlc2NyaXB0aW9uU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmp1bXBzTmVhcldhbGxEZXNjcmlwdGlvbi52YWx1ZTtcclxuY29uc3QganVtcHN0b0NlbnRlckRlc2NyaXB0aW9uU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmp1bXBzdG9DZW50ZXJEZXNjcmlwdGlvbi52YWx1ZTtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG4vLyB0aGUgZW5nbGlzaCBzdHJpbmdzIGFyZSBzaG9ydGVyIGZvciB0aGUgYmFsbG9vbiBoZWxwIGNvbnRlbnQsIHNvIHdlIHJlc3RyaWN0IHRoYXQgY29udGVudCB3aWR0aCBmb3IgaTE4biBtb3JlXHJcbi8vIHNvIHRoYXQgdGhlIHdob2xlIGNvbnRlbnQgd2lsbCBmaXQgaW4gZGV2IGJvdW5kcyBcclxuY29uc3QgQkFMTE9PTl9DT05URU5UX01BWF9XSURUSCA9IDE3NDtcclxuY29uc3QgR0VORVJBTF9DT05URU5UX01BWF9XSURUSCA9IDIxNDtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3Rvci5cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5jbGFzcyBCQVNFS2V5Ym9hcmRIZWxwQ29udGVudCBleHRlbmRzIFR3b0NvbHVtbktleWJvYXJkSGVscENvbnRlbnQge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIC8vICB0aGUgc2VjdGlvbnMgb2YgaGVscCBjb250ZW50XHJcbiAgICBjb25zdCBiYWxsb29uR3JhYkhlbHBTZWN0aW9uID0gbmV3IEJhbGxvb25HcmFiSGVscFNlY3Rpb24oIHtcclxuICAgICAgdGV4dE1heFdpZHRoOiBCQUxMT09OX0NPTlRFTlRfTUFYX1dJRFRIXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBiYXNpY0FjdGlvbnNIZWxwU2VjdGlvbiA9IG5ldyBCYXNpY0FjdGlvbnNLZXlib2FyZEhlbHBTZWN0aW9uKCB7XHJcbiAgICAgIHRleHRNYXhXaWR0aDogR0VORVJBTF9DT05URU5UX01BWF9XSURUSFxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgbW92ZUJhbGxvb25IZWxwU2VjdGlvbiA9IG5ldyBNb3ZlQmFsbG9vbkhlbHBTZWN0aW9uKCB7XHJcbiAgICAgIHRleHRNYXhXaWR0aDogQkFMTE9PTl9DT05URU5UX01BWF9XSURUSFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHZlcnRpY2FsbHkgYWxpZ24gdGhlIGxlZnQgc2VjdGlvbnNcclxuICAgIEtleWJvYXJkSGVscFNlY3Rpb24uYWxpZ25IZWxwU2VjdGlvbkljb25zKCBbIGJhbGxvb25HcmFiSGVscFNlY3Rpb24sIG1vdmVCYWxsb29uSGVscFNlY3Rpb24gXSApO1xyXG5cclxuICAgIC8vIGxlZnQgYWxpZ25lZCBzZWN0aW9ucywgYW5kIHNlY3Rpb24gYWJvdXQgaG93IHRvIG1vdmUgdGhlIGdyYWJiZWQgYmFsbG9vbiBhcmUgaG9yaXpvbnRhbGx5IGFsaWduZWRcclxuICAgIHN1cGVyKCBbIGJhbGxvb25HcmFiSGVscFNlY3Rpb24sIG1vdmVCYWxsb29uSGVscFNlY3Rpb24gXSwgWyBiYXNpY0FjdGlvbnNIZWxwU2VjdGlvbiBdLCB7XHJcbiAgICAgIGNvbHVtblNwYWNpbmc6IDI3XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdGhlIHJlYWRpbmcgb3JkZXIgZm9yIHNjcmVlbiByZWFkZXJzXHJcbiAgICB0aGlzLnBkb21PcmRlciA9IFsgYmFsbG9vbkdyYWJIZWxwU2VjdGlvbiwgbW92ZUJhbGxvb25IZWxwU2VjdGlvbiwgYmFzaWNBY3Rpb25zSGVscFNlY3Rpb24gXTtcclxuICB9XHJcbn1cclxuXHJcbmJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkucmVnaXN0ZXIoICdCQVNFS2V5Ym9hcmRIZWxwQ29udGVudCcsIEJBU0VLZXlib2FyZEhlbHBDb250ZW50ICk7XHJcblxyXG4vKipcclxuICogSW5uZXIgY2xhc3MuIEhlbHAgc2VjdGlvbiBmb3IgaG93IHRvIGdyYWIgYW5kIHJlbGVhc2UgdGhlIGJhbGxvb24uXHJcbiAqL1xyXG5jbGFzcyBCYWxsb29uR3JhYkhlbHBTZWN0aW9uIGV4dGVuZHMgS2V5Ym9hcmRIZWxwU2VjdGlvbiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcclxuICAgIGNvbnN0IHNwYWNlS2V5Tm9kZSA9IFRleHRLZXlOb2RlLnNwYWNlKCk7XHJcbiAgICBjb25zdCBlbnRlcktleU5vZGUgPSBUZXh0S2V5Tm9kZS5lbnRlcigpO1xyXG4gICAgY29uc3QgaWNvbnMgPSBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5pY29uT3JJY29uKCBzcGFjZUtleU5vZGUsIGVudGVyS2V5Tm9kZSApO1xyXG4gICAgY29uc3QgbGFiZWxXaXRoQ29udGVudCA9IEtleWJvYXJkSGVscFNlY3Rpb25Sb3cubGFiZWxXaXRoSWNvbiggZ3JhYk9yUmVsZWFzZUJhbGxvb25MYWJlbFN0cmluZywgaWNvbnMsIHtcclxuICAgICAgbGFiZWxJbm5lckNvbnRlbnQ6IGdyYWJPclJlbGVhc2VCYWxsb29uRGVzY3JpcHRpb25TdHJpbmcsXHJcbiAgICAgIGljb25PcHRpb25zOiB7XHJcbiAgICAgICAgdGFnTmFtZTogJ3AnIC8vIGl0IGlzIHRoZSBvbmx5IGl0ZW0gc28gaXQgaXMgYSBwIHJhdGhlciB0aGFuIGEgbGlcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBncmFiT3JSZWxlYXNlQmFsbG9vbkhlYWRpbmdTdHJpbmcsIFsgbGFiZWxXaXRoQ29udGVudCBdLCBtZXJnZSgge1xyXG4gICAgICBhMTF5Q29udGVudFRhZ05hbWU6IG51bGwgLy8ganVzdCBhIHBhcmFncmFwaCBmb3IgdGhpcyBzZWN0aW9uLCBubyBsaXN0XHJcbiAgICB9LCBvcHRpb25zICkgKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIGxhYmVsV2l0aENvbnRlbnQuZGlzcG9zZSgpO1xyXG4gICAgICBpY29ucy5kaXNwb3NlKCk7XHJcbiAgICAgIHNwYWNlS2V5Tm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIGVudGVyS2V5Tm9kZS5kaXNwb3NlKCk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogSGVscCBzZWN0aW9uIGZvciBob3cgdG8gbW92ZSB0aGUgYmFsbG9vbiBvciB1c2UgaG90a2V5cyB0byBtYWtlIHRoZSBiYWxsb29uIGp1bXAgdG8gcG9zaXRpb25zLlxyXG4gKi9cclxuY2xhc3MgTW92ZUJhbGxvb25IZWxwU2VjdGlvbiBleHRlbmRzIEtleWJvYXJkSGVscFNlY3Rpb24ge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3QgYXJyb3dPcldhc2RLZXlzSWNvbiA9IEtleWJvYXJkSGVscEljb25GYWN0b3J5LmFycm93T3JXYXNkS2V5c1Jvd0ljb24oKTtcclxuICAgIGNvbnN0IGxhYmVsV2l0aENvbnRlbnQgPSBLZXlib2FyZEhlbHBTZWN0aW9uUm93LmxhYmVsV2l0aEljb24oIG1vdmVHcmFiYmVkQmFsbG9vbkxhYmVsU3RyaW5nLCBhcnJvd09yV2FzZEtleXNJY29uLCB7XHJcbiAgICAgIGxhYmVsSW5uZXJDb250ZW50OiBtb3ZlR3JhYmJlZEJhbGxvb25EZXNjcmlwdGlvblN0cmluZ1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGFycm93S2V5c0ljb24gPSBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5hcnJvd0tleXNSb3dJY29uKCk7XHJcbiAgICBjb25zdCBzaGlmdEFuZEFycm93S2V5c0ljb24gPSBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5zaGlmdFBsdXNJY29uKCBhcnJvd0tleXNJY29uICk7XHJcbiAgICBjb25zdCB3YXNkUm93SWNvbiA9IEtleWJvYXJkSGVscEljb25GYWN0b3J5Lndhc2RSb3dJY29uKCk7XHJcbiAgICBjb25zdCBzaGlmdEFuZFdhc2RSb3dJY29uID0gS2V5Ym9hcmRIZWxwSWNvbkZhY3Rvcnkuc2hpZnRQbHVzSWNvbiggd2FzZFJvd0ljb24gKTtcclxuICAgIGNvbnN0IGxhYmVsV2l0aEljb25MaXN0ID0gS2V5Ym9hcmRIZWxwU2VjdGlvblJvdy5sYWJlbFdpdGhJY29uTGlzdCggbW92ZVNsb3dlckxhYmVsU3RyaW5nLCBbIHNoaWZ0QW5kQXJyb3dLZXlzSWNvbiwgc2hpZnRBbmRXYXNkUm93SWNvbiBdLCB7XHJcbiAgICAgIGxhYmVsSW5uZXJDb250ZW50OiBtb3ZlU2xvd2VyRGVzY3JpcHRpb25TdHJpbmdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBob3RrZXkgcm93cyBmb3IgaG93IHRvIGp1bXAgdGhlIGJhbGxvb25cclxuICAgIGNvbnN0IGp1bXBUb1N3ZWF0ZXJSb3cgPSBLZXlib2FyZEhlbHBTZWN0aW9uUm93LmNyZWF0ZUp1bXBLZXlSb3coICdTJywganVtcENsb3NlVG9Td2VhdGVyTGFiZWxTdHJpbmcsIHtcclxuICAgICAgbGFiZWxJbm5lckNvbnRlbnQ6IGp1bXBzQ2xvc2VUb1N3ZWF0ZXJEZXNjcmlwdGlvblN0cmluZ1xyXG4gICAgfSApO1xyXG4gICAgY29uc3QganVtcFRvV2FsbFJvdyA9IEtleWJvYXJkSGVscFNlY3Rpb25Sb3cuY3JlYXRlSnVtcEtleVJvdyggJ1cnLCBqdW1wQ2xvc2VUb1dhbGxMYWJlbFN0cmluZywge1xyXG4gICAgICBsYWJlbElubmVyQ29udGVudDoganVtcHNDbG9zZVRvV3dhbGxEZXNjcmlwdGlvblN0cmluZ1xyXG4gICAgfSApO1xyXG4gICAgY29uc3QganVtcE5lYXJXYWxsUm93ID0gS2V5Ym9hcmRIZWxwU2VjdGlvblJvdy5jcmVhdGVKdW1wS2V5Um93KCAnTicsIGp1bXBOZWFyV2FsbExhYmVsU3RyaW5nLCB7XHJcbiAgICAgIGxhYmVsSW5uZXJDb250ZW50OiBqdW1wc05lYXJXYWxsRGVzY3JpcHRpb25TdHJpbmdcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGp1bXBUb0NlbnRlclJvdyA9IEtleWJvYXJkSGVscFNlY3Rpb25Sb3cuY3JlYXRlSnVtcEtleVJvdyggJ0MnLCBqdW1wVG9DZW50ZXJMYWJlbFN0cmluZywge1xyXG4gICAgICBsYWJlbElubmVyQ29udGVudDoganVtcHN0b0NlbnRlckRlc2NyaXB0aW9uU3RyaW5nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWxsIHJvd3MgY29udGFpbmVkIGluIGEgbGVmdCBhbGlnbmVkIHZib3hcclxuICAgIGNvbnN0IHJvd3MgPSBbIGxhYmVsV2l0aENvbnRlbnQsIGxhYmVsV2l0aEljb25MaXN0LCBqdW1wVG9Td2VhdGVyUm93LCBqdW1wVG9XYWxsUm93LCBqdW1wTmVhcldhbGxSb3csIGp1bXBUb0NlbnRlclJvdyBdO1xyXG5cclxuICAgIHN1cGVyKCBtb3ZlT3JKdW1wR3JhYmJlZEJhbGxvb25IZWFkaW5nU3RyaW5nLCByb3dzLCBvcHRpb25zICk7XHJcbiAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiByb3dzLmZvckVhY2goIHJvdyA9PiByb3cuZGlzcG9zZSgpICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJBU0VLZXlib2FyZEhlbHBDb250ZW50OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLCtCQUErQixN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