// Copyright 2020-2023, University of Colorado Boulder

/**
 * Content for the keyboard help dialog for the Create screen
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import TextKeyNode from '../../../../scenery-phet/js/keyboard/TextKeyNode.js';
import RAPKeyboardHelpContent, { RAPKeyboardHelpContentOptions } from '../../common/view/RAPKeyboardHelpContent.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../RatioAndProportionStrings.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import KeyboardHelpSectionRow from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';

type SelfOptions = EmptySelfOptions;
type CreateScreenKeyboardHelpContentOptions = SelfOptions & RAPKeyboardHelpContentOptions;

class CreateScreenKeyboardHelpContent extends RAPKeyboardHelpContent {
  public constructor() {
    super( new MyChallengeHelpSection() );
  }
}

class MyChallengeHelpSection extends KeyboardHelpSection {

  public constructor( options?: CreateScreenKeyboardHelpContentOptions ) {

    const setHandRatioValue = KeyboardHelpSectionRow.labelWithIcon( RatioAndProportionStrings.setHandRatioValueStringProperty,
      KeyboardHelpIconFactory.upDownArrowKeysRowIcon(), {
        labelInnerContent: RatioAndProportionStrings.a11y.keyboardHelp.setHandRatioValueDescriptionStringProperty
      } );

    const homeKeyNode = TextKeyNode.home();
    const jumpToMinimum = KeyboardHelpSectionRow.labelWithIcon( RatioAndProportionStrings.jumpToMinimumStringProperty,
      homeKeyNode, {
        labelInnerContent: RatioAndProportionStrings.a11y.keyboardHelp.jumpToMinimumDescriptionStringProperty
      } );

    const endKeyNode = TextKeyNode.end();
    const jumpToMaximum = KeyboardHelpSectionRow.labelWithIcon( RatioAndProportionStrings.jumpToMaximumStringProperty,
      endKeyNode, {
        labelInnerContent: RatioAndProportionStrings.a11y.keyboardHelp.jumpToMaximumDescriptionStringProperty
      } );

    const rows = [ setHandRatioValue, jumpToMinimum, jumpToMaximum ];
    super( RatioAndProportionStrings.setMyRatioChallengeStringProperty, rows, options );
    this.disposeEmitter.addListener( () => {
      rows.forEach( row => row.dispose() );
      homeKeyNode.dispose();
      endKeyNode.dispose();
    } );
  }
}

ratioAndProportion.register( 'CreateScreenKeyboardHelpContent', CreateScreenKeyboardHelpContent );
export default CreateScreenKeyboardHelpContent;