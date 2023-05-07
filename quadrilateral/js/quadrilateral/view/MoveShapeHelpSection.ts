// Copyright 2023, University of Colorado Boulder

/**
 * Help content for the KeyboardHelpDialog describing how to change the shape by moving sides and vertices.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import KeyboardHelpSectionRow from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import quadrilateral from '../../quadrilateral.js';
import QuadrilateralStrings from '../../QuadrilateralStrings.js';
import { Text } from '../../../../scenery/js/imports.js';
import QuadrilateralKeyboardHelpContent from './QuadrilateralKeyboardHelpContent.js';

// constants - Voicing strings not translatable
const moveShapeDescriptionStringProperty = QuadrilateralStrings.a11y.keyboardHelpDialog.moveShapeDescriptionStringProperty;
const smallerStepsDescriptionStringProperty = QuadrilateralStrings.a11y.keyboardHelpDialog.smallerStepsDescriptionStringProperty;
const moveACornerOrSideStringProperty = QuadrilateralStrings.keyboardHelpDialog.moveCornerOrSideStringProperty;
const moveInSmallerStepsStringProperty = QuadrilateralStrings.keyboardHelpDialog.moveInSmallerStepsStringProperty;
const mouseStringProperty = QuadrilateralStrings.keyboardHelpDialog.mouseStringProperty;
const moveCornersOrSidesStringProperty = QuadrilateralStrings.keyboardHelpDialog.moveCornersOrSidesStringProperty;

export default class MoveShapeHelpSection extends KeyboardHelpSection {
  public constructor() {

    // basic movement
    const basicMovementRow = KeyboardHelpSectionRow.labelWithIcon(
      moveACornerOrSideStringProperty,
      KeyboardHelpIconFactory.arrowOrWasdKeysRowIcon(),
      {
        labelInnerContent: moveShapeDescriptionStringProperty
      }
    );

    // fine-grained movement
    const fineMovementRow = KeyboardHelpSectionRow.labelWithIconList(
      moveInSmallerStepsStringProperty,
      [
        KeyboardHelpIconFactory.shiftPlusIcon( KeyboardHelpIconFactory.arrowKeysRowIcon() ),
        KeyboardHelpIconFactory.shiftPlusIcon( KeyboardHelpIconFactory.wasdRowIcon() ),
        KeyboardHelpIconFactory.shiftPlusIcon( new Text( mouseStringProperty, {
          font: KeyboardHelpSectionRow.LABEL_FONT,
          maxWidth: 100 // by inspection
        } ) )
      ], {
        labelOptions: {
          lineWrap: QuadrilateralKeyboardHelpContent.LABEL_LINE_WRAP
        },
        labelInnerContent: smallerStepsDescriptionStringProperty
      }
    );

    const rows = [ basicMovementRow, fineMovementRow ];
    super( moveCornersOrSidesStringProperty, rows );
    this.disposeEmitter.addListener( () => rows.forEach( row => row.dispose() ) );

  }
}

quadrilateral.register( 'MoveShapeHelpSection', MoveShapeHelpSection );
