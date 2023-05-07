// Copyright 2020-2023, University of Colorado Boulder

/**
 * An AccordionBox with two NumberPickers in it that determines the targetRatioProperty in the model ("My Challenge" value).
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, HBox, Node, NodeOptions, ReadingBlock, ReadingBlockOptions, RichText, VBox, Voicing } from '../../../../scenery/js/imports.js';
import ActivationUtterance from '../../../../utterance-queue/js/ActivationUtterance.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import RatioHandNode from '../../common/view/RatioHandNode.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../RatioAndProportionStrings.js';
import RatioDescriber from '../../common/view/describers/RatioDescriber.js';
import TickMarkView from '../../common/view/TickMarkView.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import ResponsePatternCollection from '../../../../utterance-queue/js/ResponsePatternCollection.js';
import ResponsePacket from '../../../../utterance-queue/js/ResponsePacket.js';
import Multilink from '../../../../axon/js/Multilink.js';

const PICKER_SCALE = 1.5;
const ICON_SCALE = 0.9;
const DEFAULT_EXPANDED = false;

type MyChallengeAccordionBoxOptions = StrictOmit<AccordionBoxOptions, 'pdomOrder'> & PickRequired<AccordionBoxOptions, 'tandem'>;

class MyChallengeAccordionBox extends AccordionBox {

  public targetAntecedentProperty: Property<number>;
  public targetConsequentProperty: Property<number>;
  private resetMyChallengeAccordionBox: () => void;

  public constructor( targetRatioProperty: Property<number>, ratioLockedProperty: Property<boolean>,
                      handColorProperty: Property<Color>, tickMarkViewProperty: EnumerationProperty<TickMarkView>,
                      ratioDescriber: RatioDescriber, providedOptions: MyChallengeAccordionBoxOptions ) {


    // Allow us to get the reduced fraction as the initial value of the custom "My Challenge"
    const initialRatioFraction = Fraction.fromDecimal( targetRatioProperty.value );
    const rangeProperty = new Property( new Range( 1, 10 ) );
    assert && assert( rangeProperty.value.contains( initialRatioFraction.numerator ), 'unsupported numerator' );
    assert && assert( rangeProperty.value.contains( initialRatioFraction.denominator ), 'unsupported denominator' );

    const targetAntecedentProperty = new NumberProperty( initialRatioFraction.numerator, {
      tandem: providedOptions.tandem.createTandem( 'targetAntecedentProperty' )
    } );
    const targetConsequentProperty = new NumberProperty( initialRatioFraction.denominator, {
      tandem: providedOptions.tandem.createTandem( 'targetConsequentProperty' )
    } );

    const expandedProperty = new BooleanProperty( DEFAULT_EXPANDED, {
      tandem: providedOptions.tandem.createTandem( 'expandedProperty' )
    } );

    const createAccordionBoxContextResponse = () => {
      return expandedProperty.value ?
             ratioDescriber.getCurrentChallengeSentence( targetAntecedentProperty.value, targetConsequentProperty.value ) :
             RatioAndProportionStrings.a11y.ratio.currentChallengeHiddenStringProperty.value;
    };

    const options = optionize<MyChallengeAccordionBoxOptions, EmptySelfOptions, AccordionBoxOptions>()( {
      titleNode: new RichText( RatioAndProportionStrings.myChallengeStringProperty, {
        font: new PhetFont( 20 ),
        maxWidth: 200 // empirically determined
      } ),
      accessibleName: RatioAndProportionStrings.myChallengeStringProperty,
      titleAlignX: 'left',
      contentXMargin: 26,
      contentYMargin: 15,
      contentYSpacing: 15,

      maxWidth: 220,

      // Copied from NLCConstants.js, see https://github.com/phetsims/ratio-and-proportion/issues/58#issuecomment-646377333
      cornerRadius: 5,
      buttonXMargin: 10,
      buttonYMargin: 10,
      expandCollapseButtonOptions: {
        touchAreaXDilation: 15,
        touchAreaYDilation: 15,
        mouseAreaXDilation: 5,
        mouseAreaYDilation: 5
      },
      expandedProperty: expandedProperty,

      // voicing
      voicingNameResponse: RatioAndProportionStrings.myChallengeStringProperty,
      voicingContextResponse: createAccordionBoxContextResponse,

      // Only deliver the hint if not expanded; since in a closure, use the current value of the Property.
      voicingHintResponse: () => expandedProperty.value ? null : RatioAndProportionStrings.a11y.create.myChallengeHintTextStringProperty.value
    }, providedOptions );

    const ratioUnlockedFromMyChallenge = new Utterance( {
      alert: new ResponsePacket( {
        contextResponse: RatioAndProportionStrings.a11y.ratioNoLongerLockedStringProperty
      } ),
      priority: Utterance.MEDIUM_PRIORITY
    } );

    const createNumberPickerContextResponse = () => ratioDescriber.getTargetRatioChangeAlert( targetAntecedentProperty.value, targetConsequentProperty.value );

    const antecedentNumberPicker = new NumberPicker( targetAntecedentProperty, rangeProperty, {
      scale: PICKER_SCALE,
      color: handColorProperty.value,
      center: Vector2.ZERO,
      accessibleName: RatioAndProportionStrings.a11y.leftValueStringProperty,
      a11yDependencies: [ targetConsequentProperty ],
      a11yCreateAriaValueText: ratioDescriber.getWordFromNumber,
      a11yCreateContextResponseAlert: createNumberPickerContextResponse,

      // voicing
      voicingNameResponse: RatioAndProportionStrings.a11y.leftValueStringProperty,
      voicingObjectResponse: () => ratioDescriber.getWordFromNumber( targetAntecedentProperty.value ),
      voicingContextResponse: createNumberPickerContextResponse,

      // phet-io
      tandem: options.tandem.createTandem( 'antecedentNumberPicker' )
    } );
    const leftRatioSelector = new VBox( {
      align: 'origin',
      spacing: 10,
      children: [
        RatioHandNode.createIcon( false, tickMarkViewProperty, {
          handColor: handColorProperty.value, handNodeOptions: { scale: ICON_SCALE }
        } ),
        new Node( { children: [ antecedentNumberPicker ] } ) ]
    } );

    Voicing.registerUtteranceToVoicingNode( ratioUnlockedFromMyChallenge, antecedentNumberPicker );

    const consequentNumberPicker = new NumberPicker( targetConsequentProperty, rangeProperty, {
      scale: PICKER_SCALE,
      color: handColorProperty.value,
      center: Vector2.ZERO,
      accessibleName: RatioAndProportionStrings.a11y.rightValueStringProperty,
      a11yDependencies: [ targetAntecedentProperty ],
      a11yCreateAriaValueText: ratioDescriber.getWordFromNumber,
      a11yCreateContextResponseAlert: createNumberPickerContextResponse,

      // voicing
      voicingNameResponse: RatioAndProportionStrings.a11y.rightValueStringProperty,
      voicingObjectResponse: () => ratioDescriber.getWordFromNumber( targetConsequentProperty.value ),
      voicingContextResponse: createNumberPickerContextResponse,

      // phet-io
      tandem: options.tandem.createTandem( 'consequentNumberPicker' )
    } );
    const rightRatioSelector = new VBox( {
      align: 'origin',
      spacing: 10,
      children: [
        RatioHandNode.createIcon( true, tickMarkViewProperty, {
          handColor: handColorProperty.value, handNodeOptions: { scale: ICON_SCALE }
        } ),
        new Node( { children: [ consequentNumberPicker ] } ) ]
    } );

    const myChallengeContent = new HBox( {
      spacing: 40,
      tagName: 'div',
      descriptionContent: RatioAndProportionStrings.a11y.create.myChallengeHelpTextStringProperty, // help text for the content
      children: [ leftRatioSelector, rightRatioSelector ]
    } );

    // At this time, mixed in Nodes can't take mixin options passed via object literal, it assumes that the Object
    // type is NodeOptions.
    const readingBlockOptions: ReadingBlockOptions & NodeOptions = {
      children: [ myChallengeContent ],
      readingBlockHintResponse: RatioAndProportionStrings.a11y.create.myChallengeReadingBlockHintTextStringProperty,
      readingBlockNameResponse: createAccordionBoxContextResponse,
      readingBlockResponsePatternCollection: new ResponsePatternCollection( {
        nameHint: '{{NAME}} {{HINT}}'
      } )
    };

    const readingBlockNode = new ReadingBlockNode( readingBlockOptions );

    // We need an extra node here in order to set PDOMOrder because AccordiongBox set's PDOM order for it's content
    super( new Node( {
      children: [ readingBlockNode ],
      pdomOrder: [ myChallengeContent, readingBlockNode ]
    } ), options );

    this.targetAntecedentProperty = targetAntecedentProperty;
    this.targetConsequentProperty = targetConsequentProperty;

    const accordionBoxUtterance = new ActivationUtterance();
    this.expandedProperty.lazyLink( () => {
      accordionBoxUtterance.alert = createAccordionBoxContextResponse();
      this.alertDescriptionUtterance( accordionBoxUtterance );
    } );

    Multilink.multilink( [ targetAntecedentProperty, targetConsequentProperty ],
      ( targetAntecedent, targetConsequent ) => {

        const wasLocked = ratioLockedProperty.value;

        targetRatioProperty.value = targetAntecedent / targetConsequent;

        // if currently locked, then it is about to be unlocked
        if ( wasLocked && !ratioLockedProperty.value ) {
          this.alertDescriptionUtterance( ratioUnlockedFromMyChallenge );
          Voicing.alertUtterance( ratioUnlockedFromMyChallenge );
        }
      } );

    this.resetMyChallengeAccordionBox = () => {
      this.expandedProperty.value = DEFAULT_EXPANDED;

      this.targetAntecedentProperty.reset();
      this.targetConsequentProperty.reset();

      ratioUnlockedFromMyChallenge.reset();
    };
  }

  public override reset(): void {
    super.reset();
    this.resetMyChallengeAccordionBox();
  }
}

class ReadingBlockNode extends ReadingBlock( Node ) {}

ratioAndProportion.register( 'MyChallengeAccordionBox', MyChallengeAccordionBox );
export default MyChallengeAccordionBox;