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
    const grabReleaseHelpSection = new GrabReleaseKeyboardHelpSection(
      FaradaysLawStrings.keyboardHelpDialog.barMagnetStringProperty,
      FaradaysLawStrings.keyboardHelpDialog.magnetStringProperty, {
        textMaxWidth: maxWidth
      } );
    const basicActionsHelpSection = new BasicActionsKeyboardHelpSection( {
      withCheckboxContent: true
    } );
    const moveMagnetHelpSection = new MoveMagnetHelpSection( {
      textMaxWidth: maxWidth
    } );
    const autoSlideMagnetHelpSection = new AutoSlideMagnetHelpSection( {
      textMaxWidth: maxWidth
    } );

    KeyboardHelpSection.alignHelpSectionIcons( [ grabReleaseHelpSection, moveMagnetHelpSection, autoSlideMagnetHelpSection ] );

    const leftContent = [ grabReleaseHelpSection, moveMagnetHelpSection, autoSlideMagnetHelpSection ];
    const rightContent = [ basicActionsHelpSection ];
    super( leftContent, rightContent, {
      sectionSpacing: 10
    } );
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
  constructor( options ) {

    // move grabbed magnet row
    const moveMagnetIcon = KeyboardHelpIconFactory.arrowOrWasdKeysRowIcon();
    const moveMagnetRow = KeyboardHelpSectionRow.labelWithIcon(
      FaradaysLawStrings.keyboardHelpDialog.moveGrabbedMagnet,
      moveMagnetIcon, {
        labelInnerContent: FaradaysLawStrings.keyboardHelpDialog.moveGrabbedMagnetWith
      } );

    // move magnet slower row
    const shiftPlusArrowKeys = KeyboardHelpIconFactory.shiftPlusIcon( KeyboardHelpIconFactory.arrowKeysRowIcon() );
    const shiftPlusWASDKeys = KeyboardHelpIconFactory.shiftPlusIcon( KeyboardHelpIconFactory.wasdRowIcon() );
    const moveMagnetSlowerRow = KeyboardHelpSectionRow.labelWithIconList(
      FaradaysLawStrings.keyboardHelpDialog.moveGrabbedMagnetSlower,
      [ shiftPlusArrowKeys, shiftPlusWASDKeys ], {
        labelInnerContent: FaradaysLawStrings.keyboardHelpDialog.moveGrabbedMagnetSlowerWith
      } );

    const rows = [ moveMagnetRow, moveMagnetSlowerRow ];
    super( FaradaysLawStrings.keyboardHelpDialog.moveGrabbedBarMagnet, rows, options );
    this.disposeEmitter.addListener( () => rows.forEach( row => row.dispose() ) );
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
  constructor( options ) {

    // row with text label and number icons
    const numberKeysIcon = new HBox( {
      children: [
        LetterKeyNode.one(),
        LetterKeyNode.two(),
        LetterKeyNode.three()
      ],
      spacing: 1
    } );
    const moveGrabbedMagnetRow = KeyboardHelpSectionRow.labelWithIcon(
      FaradaysLawStrings.keyboardHelpDialog.autoSlideGrabbedBarMagnetText,
      numberKeysIcon, {
        labelInnerContent: FaradaysLawStrings.keyboardHelpDialog.autoSlideGrabbedBarMagnetWith
      } );

    super( FaradaysLawStrings.keyboardHelpDialog.autoSlideGrabbedBarMagnet, [ moveGrabbedMagnetRow ], options );
    this.disposeEmitter.addListener( () => moveGrabbedMagnetRow.dispose() );
  }
}

faradaysLaw.register( 'FaradaysLawKeyboardHelpContent', FaradaysLawKeyboardHelpContent );

export default FaradaysLawKeyboardHelpContent;