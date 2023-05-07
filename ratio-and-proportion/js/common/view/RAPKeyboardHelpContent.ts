// Copyright 2020-2023, University of Colorado Boulder

/**
 * Content for the keyboard help dialog in Ratio and Proportion
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BasicActionsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection, { KeyboardHelpSectionOptions } from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import SliderControlsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/SliderControlsKeyboardHelpSection.js';
import TwoColumnKeyboardHelpContent, { TwoColumnKeyboardHelpContentOptions } from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import LetterKeyNode from '../../../../scenery-phet/js/keyboard/LetterKeyNode.js';
import NumberKeyNode from '../../../../scenery-phet/js/keyboard/NumberKeyNode.js';
import TextKeyNode from '../../../../scenery-phet/js/keyboard/TextKeyNode.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../RatioAndProportionStrings.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import KeyboardHelpSectionRow from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';

type SelfOptions = EmptySelfOptions;
export type RAPKeyboardHelpContentOptions = SelfOptions & TwoColumnKeyboardHelpContentOptions;

class RAPKeyboardHelpContent extends TwoColumnKeyboardHelpContent {

  private readonly disposeRAPKeyboardHelpContent: () => void;

  /**
   * @param challengeHelpSection - keyboard help section for determining how to change the target ratio. We will dispose this!
   * @param [providedOptions]
   */
  public constructor( challengeHelpSection: KeyboardHelpSection, providedOptions?: RAPKeyboardHelpContentOptions ) {

    const moveLeftOrRightHandHelpSection = new SliderControlsKeyboardHelpSection( {
      headingStringProperty: RatioAndProportionStrings.moveHandsIndividuallyStringProperty,
      verbStringProperty: RatioAndProportionStrings.moveStringProperty,
      sliderStringProperty: RatioAndProportionStrings.leftOrRightHandStringProperty,
      maximumStringProperty: RatioAndProportionStrings.topStringProperty,
      minimumStringProperty: RatioAndProportionStrings.bottomStringProperty,
      arrowKeyIconDisplay: SliderControlsKeyboardHelpSection.ArrowKeyIconDisplay.UP_DOWN // on cue up/down arrows, not left/right also.
    } );

    const basicActionsHelpSection = new BasicActionsKeyboardHelpSection( {
      withCheckboxContent: true
    } );

    const bothHandsHelpSection = new BothHandsHelpSection();
    const leftContent = [ moveLeftOrRightHandHelpSection, bothHandsHelpSection ];
    const rightContent = [ challengeHelpSection, basicActionsHelpSection ];

    super( leftContent, rightContent, providedOptions );

    this.disposeRAPKeyboardHelpContent = () => {
      moveLeftOrRightHandHelpSection.dispose();
      bothHandsHelpSection.dispose();
      challengeHelpSection.dispose();
      basicActionsHelpSection.dispose();
    };
  }

  public override dispose(): void {
    this.disposeRAPKeyboardHelpContent();
    super.dispose();
  }
}

class BothHandsHelpSection extends KeyboardHelpSection {
  private readonly disposeBothHandsHelpSection: () => void;

  public constructor( options?: KeyboardHelpSectionOptions ) {

    const wKeyNode = LetterKeyNode.w();
    const sKeyNode = LetterKeyNode.s();
    const wOrSIcon = KeyboardHelpIconFactory.iconRow( [ wKeyNode, sKeyNode ] );
    const moveLeftHand = KeyboardHelpSectionRow.labelWithIcon( RatioAndProportionStrings.moveLeftHandStringProperty,
      wOrSIcon, {
        labelInnerContent: RatioAndProportionStrings.a11y.keyboardHelp.leftHandDescriptionStringProperty
      } );

    const arrowKeysRow = KeyboardHelpIconFactory.upDownArrowKeysRowIcon();
    const moveRightHand = KeyboardHelpSectionRow.labelWithIcon( RatioAndProportionStrings.moveRightHandStringProperty,
      arrowKeysRow, {
        labelInnerContent: RatioAndProportionStrings.a11y.keyboardHelp.rightHandDescriptionStringProperty
      } );

    const shiftIcon = TextKeyNode.shift();
    const moveInSmallerSteps = KeyboardHelpSectionRow.labelWithIcon( RatioAndProportionStrings.moveHandsInSmallerStepsStringProperty,
      shiftIcon, {
        labelInnerContent: RatioAndProportionStrings.a11y.keyboardHelp.handsInSmallerStepsDescriptionStringProperty
      } );

    const numberToNumberIcon = KeyboardHelpIconFactory.iconToIcon( new NumberKeyNode( 0 ), new NumberKeyNode( 9 ) );
    const jumpBothHands = KeyboardHelpSectionRow.labelWithIcon( RatioAndProportionStrings.jumpBothHandsStringProperty,
      numberToNumberIcon, {
        labelInnerContent: RatioAndProportionStrings.a11y.keyboardHelp.jumpBothHandsDescriptionStringProperty
      } );

    const rows = [ moveLeftHand, moveRightHand, moveInSmallerSteps, jumpBothHands ];
    super( RatioAndProportionStrings.moveBothHandsSimultaneouslyStringProperty,
      rows, options );

    this.disposeBothHandsHelpSection = () => {
      rows.forEach( row => row.dispose() );
      wOrSIcon.dispose();
      wKeyNode.dispose();
      sKeyNode.dispose();
      numberToNumberIcon.dispose();
      arrowKeysRow.dispose();
      shiftIcon.dispose();
    };
  }

  public override dispose(): void {
    this.disposeBothHandsHelpSection();
    super.dispose();
  }
}

ratioAndProportion.register( 'RAPKeyboardHelpContent', RAPKeyboardHelpContent );
export default RAPKeyboardHelpContent;