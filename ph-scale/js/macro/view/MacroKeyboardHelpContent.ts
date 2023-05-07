// Copyright 2022-2023, University of Colorado Boulder

/**
 * MacroKeyboardHelpContent is the keyboard-help content for the 'Macro' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import phScale from '../../phScale.js';
import TwoColumnKeyboardHelpContent from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import BasicActionsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import ComboBoxKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/ComboBoxKeyboardHelpSection.js';
import PhScaleStrings from '../../PhScaleStrings.js';
import MoveKeyboardHelpContent from '../../common/view/MoveKeyboardHelpContent.js';
import FaucetControlsKeyboardHelpContent from '../../common/view/FaucetControlsKeyboardHelpContent.js';

export default class MacroKeyboardHelpContent extends TwoColumnKeyboardHelpContent {

  private readonly disposeMacroKeyboardHelpContent: () => void;

  public constructor() {

    // Sections in the left column. They need to be disposed.
    const leftSections = [

      // Move the pH Probe
      new MoveKeyboardHelpContent( PhScaleStrings.keyboardHelpDialog.moveThePHProbeStringProperty ),

      // Faucet Controls
      new FaucetControlsKeyboardHelpContent()
    ];

    // Sections in the right column. They need to be disposed.
    const rightSections = [

      // Choose a Solute
      new ComboBoxKeyboardHelpSection( {
        headingString: PhScaleStrings.keyboardHelpDialog.chooseASoluteStringProperty,
        thingAsLowerCaseSingular: PhScaleStrings.keyboardHelpDialog.soluteStringProperty,
        thingAsLowerCasePlural: PhScaleStrings.keyboardHelpDialog.solutesStringProperty
      } ),

      // Basic Actions
      new BasicActionsKeyboardHelpSection( {
        withCheckboxContent: true
      } )
    ];

    super( leftSections, rightSections );

    this.disposeMacroKeyboardHelpContent = () => {
      leftSections.forEach( section => section.dispose() );
      rightSections.forEach( section => section.dispose() );
    };
  }

  public override dispose(): void {
    this.disposeMacroKeyboardHelpContent();
    super.dispose();
  }
}

phScale.register( 'MacroKeyboardHelpContent', MacroKeyboardHelpContent );