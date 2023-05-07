// Copyright 2023, University of Colorado Boulder

/**
 * Help content for the KeyboardHelpDialog, describing how to reset the shape and get information about the shape
 * (when Voicing is enabled).
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import KeyboardHelpSectionRow from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import LetterKeyNode from '../../../../scenery-phet/js/keyboard/LetterKeyNode.js';
import TextKeyNode from '../../../../scenery-phet/js/keyboard/TextKeyNode.js';
import { voicingManager } from '../../../../scenery/js/imports.js';
import quadrilateral from '../../quadrilateral.js';
import QuadrilateralStrings from '../../QuadrilateralStrings.js';
import QuadrilateralKeyboardHelpContent from './QuadrilateralKeyboardHelpContent.js';

// Voicing is NOT translatable and won't be for a very long time. This content is invisible in non-english locales and
// when Voicing is not supported.
const checkShapeWithVoicingString = 'With Voicing enabled, check shape name or properties';
const checkShapeDescriptionStringProperty = QuadrilateralStrings.a11y.keyboardHelpDialog.checkShapeDescriptionPatternStringProperty;
const resetShapeDescriptionStringProperty = QuadrilateralStrings.a11y.keyboardHelpDialog.resetShapeDescriptionPatternStringProperty;

export default class ShapeShortcutsHelpSection extends KeyboardHelpSection {
  public constructor() {

    // command to check current shape with Voicing
    const checkShapeRow = KeyboardHelpSectionRow.labelWithIcon(
      checkShapeWithVoicingString,
      KeyboardHelpIconFactory.altPlusIcon( LetterKeyNode.c() ), {
        labelOptions: {
          lineWrap: QuadrilateralKeyboardHelpContent.LABEL_LINE_WRAP
        },
        labelInnerContent: StringUtils.fillIn( checkShapeDescriptionStringProperty, {
          altOrOption: TextKeyNode.getAltKeyString()
        } )
      }
    );

    // command to reset the shape
    const resetShapeRow = KeyboardHelpSectionRow.labelWithIcon(
      QuadrilateralStrings.keyboardHelpDialog.resetShapeStringProperty,
      KeyboardHelpIconFactory.iconPlusIconRow(
        [
          TextKeyNode.altOrOption(),
          TextKeyNode.shift(),
          LetterKeyNode.r()
        ]
      ),
      {
        labelInnerContent: StringUtils.fillIn( resetShapeDescriptionStringProperty, {
          altOrOption: TextKeyNode.getAltKeyString()
        } )
      }
    );

    const contents: KeyboardHelpSectionRow[] = [];
    if ( voicingManager.initialized ) {
      contents.push( checkShapeRow );
    }
    contents.push( resetShapeRow );

    super( QuadrilateralStrings.keyboardHelpDialog.shapeShortcutsStringProperty, contents );
    this.disposeEmitter.addListener( () => contents.forEach( row => row.dispose() ) );
  }
}

quadrilateral.register( 'ShapeShortcutsHelpSection', ShapeShortcutsHelpSection );
