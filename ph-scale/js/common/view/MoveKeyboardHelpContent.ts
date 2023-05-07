// Copyright 2022-2023, University of Colorado Boulder

/**
 * MoveKeyboardHelpContent is the keyboard-help section that describes how to move things that are draggable.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import KeyboardHelpSectionRow from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import PhScaleStrings from '../../PhScaleStrings.js';
import phScale from '../../phScale.js';

export default class MoveKeyboardHelpContent extends KeyboardHelpSection {

  private readonly disposeMoveKeyboardHelpContent: () => void;

  public constructor( titleProperty: TReadOnlyProperty<string> ) {

    // Icons, which must be disposed
    const arrowOrWasdKeysIcon = KeyboardHelpIconFactory.arrowOrWasdKeysRowIcon();
    const arrowKeysIcon = KeyboardHelpIconFactory.arrowKeysRowIcon();
    const wasdKeysIcon = KeyboardHelpIconFactory.wasdRowIcon();
    const shiftPlusArrowKeysIcon = KeyboardHelpIconFactory.shiftPlusIcon( arrowKeysIcon );
    const shiftPlusWASDKeysIcon = KeyboardHelpIconFactory.shiftPlusIcon( wasdKeysIcon );
    const icons = [ arrowOrWasdKeysIcon, arrowKeysIcon, wasdKeysIcon, shiftPlusArrowKeysIcon, shiftPlusWASDKeysIcon ];

    // Rows, which must be disposed
    const rows = [

      // arrows or WASD, for normal speed
      KeyboardHelpSectionRow.labelWithIcon( PhScaleStrings.keyboardHelpDialog.moveStringProperty,
        arrowOrWasdKeysIcon ),

      // Shift+arrows or Shift+WASD, for slower speed
      KeyboardHelpSectionRow.labelWithIconList( PhScaleStrings.keyboardHelpDialog.moveSlowerStringProperty,
        [ shiftPlusArrowKeysIcon, shiftPlusWASDKeysIcon ] )
    ];

    super( titleProperty, rows );

    this.disposeMoveKeyboardHelpContent = () => {
      icons.forEach( icon => icon.dispose() );
      rows.forEach( row => row.dispose() );
    };
  }

  public override dispose(): void {
    this.disposeMoveKeyboardHelpContent();
    super.dispose();
  }
}

phScale.register( 'MoveKeyboardHelpContent', MoveKeyboardHelpContent );