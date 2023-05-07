// Copyright 2020-2022, University of Colorado Boulder

/**
 * Node that holds the PDOM content for the screen summary in the Create screen. It also creates content for the voicing
 * overview buttons as appropriate.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Node } from '../../../../scenery/js/imports.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../RatioAndProportionStrings.js';
import RAPRatioTuple from '../../common/model/RAPRatioTuple.js';
import RatioDescriber from '../../common/view/describers/RatioDescriber.js';
import HandPositionsDescriber from '../../common/view/describers/HandPositionsDescriber.js';
import MyChallengeAccordionBox from './MyChallengeAccordionBox.js';
import BackgroundColorHandler from '../../common/view/BackgroundColorHandler.js';
import TickMarkView from '../../common/view/TickMarkView.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';

class CreateScreenSummaryNode extends Node {

  private ratioDescriber: RatioDescriber;
  private handPositionsDescriber: HandPositionsDescriber;
  private ratioFitnessProperty: TReadOnlyProperty<number>;
  private ratioTupleProperty: Property<RAPRatioTuple>;
  private tickMarkViewProperty: EnumerationProperty<TickMarkView>;
  private inProportionProperty: TReadOnlyProperty<boolean>;
  private myChallengeAccordionBox: MyChallengeAccordionBox;

  public constructor( ratioFitnessProperty: TReadOnlyProperty<number>,
                      ratioTupleProperty: Property<RAPRatioTuple>,
                      tickMarkViewProperty: EnumerationProperty<TickMarkView>,
                      ratioDescriber: RatioDescriber,
                      inProportionProperty: TReadOnlyProperty<boolean>,
                      handPositionsDescriber: HandPositionsDescriber,
                      tickMarkRangeProperty: Property<number>,
                      myChallengeAccordionBox: MyChallengeAccordionBox ) {

    const stateOfSimNode = new Node( { tagName: 'p' } );
    const leftHandBullet = new Node( { tagName: 'li' } );
    const rightHandBullet = new Node( { tagName: 'li' } );
    const currentChallengeBullet = new Node( { tagName: 'li' } );
    const descriptionBullets = new Node( {
      tagName: 'ul',
      children: [ leftHandBullet, rightHandBullet ]
    } );

    super( {
      children: [
        new Node( {
          tagName: 'p',
          innerContent: RatioAndProportionStrings.a11y.create.screenSummary.paragraph1StringProperty
        } ),
        new Node( {
          tagName: 'p',
          innerContent: RatioAndProportionStrings.a11y.create.screenSummary.paragraph2StringProperty
        } ),
        new Node( {
          tagName: 'p',
          innerContent: RatioAndProportionStrings.a11y.screenSummaryControlAreaParagraphStringProperty
        } ),
        stateOfSimNode,
        descriptionBullets,
        new Node( {
          tagName: 'p',
          innerContent: RatioAndProportionStrings.a11y.create.screenSummary.interactionHintStringProperty
        } )
      ]
    } );

    this.handPositionsDescriber = handPositionsDescriber;
    this.ratioDescriber = ratioDescriber;
    this.tickMarkViewProperty = tickMarkViewProperty;
    this.ratioTupleProperty = ratioTupleProperty;
    this.ratioFitnessProperty = ratioFitnessProperty;
    this.inProportionProperty = inProportionProperty;
    this.myChallengeAccordionBox = myChallengeAccordionBox;

    myChallengeAccordionBox.expandedProperty.link( ( expanded: boolean ) => {
      if ( expanded ) {
        descriptionBullets.addChild( currentChallengeBullet );
      }
      else if ( descriptionBullets.hasChild( currentChallengeBullet ) ) {
        descriptionBullets.removeChild( currentChallengeBullet );
      }
    } );

    Multilink.multilink( [
      tickMarkViewProperty,
      myChallengeAccordionBox.targetAntecedentProperty,
      myChallengeAccordionBox.targetConsequentProperty,
      ratioTupleProperty,
      ratioFitnessProperty,
      inProportionProperty,
      tickMarkRangeProperty
    ], () => {
      stateOfSimNode.innerContent = this.getStateOfSim();
      leftHandBullet.innerContent = this.getLeftHandState();
      rightHandBullet.innerContent = this.getRightHandState();
      currentChallengeBullet.innerContent = this.getCurrentChallengeState();
    } );
  }

  private getStateOfSim( currentChallenge: TReadOnlyProperty<string> = RatioAndProportionStrings.a11y.create.challengeStringProperty ): string {
    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn( RatioAndProportionStrings.a11y.screenSummaryQualitativeStateOfSimStringProperty, {
      color: BackgroundColorHandler.getCurrentColorRegion( this.ratioFitnessProperty.value, this.inProportionProperty.value ),
      ratioFitness: this.ratioDescriber.getRatioFitness( false ),
      currentChallenge: currentChallenge,
      distance: this.handPositionsDescriber.getDistanceRegion( true )
    } );
  }

  private getLeftHandState(): string {
    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn( RatioAndProportionStrings.a11y.leftHandBulletStringProperty, {
      position: this.handPositionsDescriber.getHandPositionDescription( this.ratioTupleProperty.value.antecedent, this.tickMarkViewProperty.value )
    } );
  }

  private getRightHandState(): string {
    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn( RatioAndProportionStrings.a11y.rightHandBulletStringProperty, {
      position: this.handPositionsDescriber.getHandPositionDescription( this.ratioTupleProperty.value.consequent, this.tickMarkViewProperty.value )
    } );
  }

  private getCurrentChallengeState(): string {
    return this.ratioDescriber.getCurrentChallengeSentence( this.myChallengeAccordionBox.targetAntecedentProperty.value,
      this.myChallengeAccordionBox.targetConsequentProperty.value
    );
  }

  public getDetailsButtonState(): string {
    const patternStringProperty = this.myChallengeAccordionBox.expandedProperty.value ?
                                  RatioAndProportionStrings.a11y.detailsButtonWithCurrentChallengePatternStringProperty :
                                  RatioAndProportionStrings.a11y.detailsButtonPatternStringProperty;
    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn( patternStringProperty, {
      stateOfSim: this.getStateOfSim(),
      leftHand: this.getLeftHandState(),
      rightHand: this.getRightHandState(),
      currentChallenge: this.getCurrentChallengeState()
    } );
  }
}

ratioAndProportion.register( 'CreateScreenSummaryNode', CreateScreenSummaryNode );
export default CreateScreenSummaryNode;