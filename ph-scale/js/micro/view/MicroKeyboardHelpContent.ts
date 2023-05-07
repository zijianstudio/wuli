// Copyright 2022-2023, University of Colorado Boulder

/**
 * MicroKeyboardHelpContent is the keyboard-help content for the 'Micro' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import TwoColumnKeyboardHelpContent from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import phScale from '../../phScale.js';
import PhScaleStrings from '../../PhScaleStrings.js';
import ComboBoxKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/ComboBoxKeyboardHelpSection.js';
import BasicActionsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import FaucetControlsKeyboardHelpContent from '../../common/view/FaucetControlsKeyboardHelpContent.js';

export default class MicroKeyboardHelpContent extends TwoColumnKeyboardHelpContent {

  private readonly disposeMicroKeyboardHelpContent: () => void;

  public constructor() {

    // Sections in the left column. They need to be disposed.
    const leftSections = [

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

    this.disposeMicroKeyboardHelpContent = () => {
      leftSections.forEach( section => section.dispose() );
      rightSections.forEach( section => section.dispose() );
    };
  }

  public override dispose(): void {
    this.disposeMicroKeyboardHelpContent();
    super.dispose();
  }
}

phScale.register( 'MicroKeyboardHelpContent', MicroKeyboardHelpContent );