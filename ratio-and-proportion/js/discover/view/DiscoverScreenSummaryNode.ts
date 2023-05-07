// Copyright 2020-2022, University of Colorado Boulder

/**
 * Node that holds the PDOM content for the screen summary in Ratio and Proportion. It also creates content for the voicing
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
import HandPositionsDescriber from '../../common/view/describers/HandPositionsDescriber.js';
import TickMarkView from '../../common/view/TickMarkView.js';
import BackgroundColorHandler from '../../common/view/BackgroundColorHandler.js';
import RatioDescriber from '../../common/view/describers/RatioDescriber.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import { RatioToChallengeInfoMap } from './ChallengeRatioComboBoxNode.js';

class DiscoverScreenSummaryNode extends Node {
  private ratioDescriber: RatioDescriber;
  private handPositionsDescriber: HandPositionsDescriber;
  private ratioFitnessProperty: TReadOnlyProperty<number>;
  private ratioTupleProperty: Property<RAPRatioTuple>;
  private targetRatioProperty: Property<number>;
  private tickMarkViewProperty: EnumerationProperty<TickMarkView>;
  private inProportionProperty: TReadOnlyProperty<boolean>;
  private ratioToChallengeInfoMap: RatioToChallengeInfoMap;

  public constructor( ratioFitnessProperty: TReadOnlyProperty<number>, ratioTupleProperty: Property<RAPRatioTuple>,
                      targetRatioProperty: Property<number>, tickMarkViewProperty: EnumerationProperty<TickMarkView>,
                      ratioDescriber: RatioDescriber, inProportionProperty: TReadOnlyProperty<boolean>, handPositionsDescriber: HandPositionsDescriber,
                      ratioToChallengeInfoMap: RatioToChallengeInfoMap ) {

    const stateOfSimNode = new Node( {
      tagName: 'p'
    } );

    const leftHandBullet = new Node( { tagName: 'li' } );
    const rightHandBullet = new Node( { tagName: 'li' } );
    const descriptionBullets = new Node( {
      tagName: 'ul',
      children: [ leftHandBullet, rightHandBullet ]
    } );

    super( {
      children: [
        new Node( {
          tagName: 'p',
          innerContent: RatioAndProportionStrings.a11y.discover.screenSummary.paragraph1StringProperty
        } ),
        new Node( {
          tagName: 'p',
          innerContent: RatioAndProportionStrings.a11y.discover.screenSummary.paragraph2StringProperty
        } ),
        new Node( {
          tagName: 'p',
          innerContent: RatioAndProportionStrings.a11y.discover.screenSummary.paragraph3StringProperty
        } ),
        stateOfSimNode,
        descriptionBullets,
        new Node( {
          tagName: 'p',
          innerContent: RatioAndProportionStrings.a11y.discover.screenSummary.interactionHintStringProperty
        } )
      ]
    } );

    this.handPositionsDescriber = handPositionsDescriber;
    this.ratioDescriber = ratioDescriber;
    this.targetRatioProperty = targetRatioProperty;
    this.tickMarkViewProperty = tickMarkViewProperty;
    this.ratioTupleProperty = ratioTupleProperty;
    this.ratioFitnessProperty = ratioFitnessProperty;
    this.inProportionProperty = inProportionProperty;
    this.ratioToChallengeInfoMap = ratioToChallengeInfoMap;

    // This derivedProperty is already dependent on all other dependencies for getStateOfSimString
    Multilink.multilink( [
      targetRatioProperty,
      tickMarkViewProperty,
      ratioTupleProperty,
      ratioFitnessProperty,
      inProportionProperty
    ], ( targetRatio, tickMarkView ) => {

      stateOfSimNode.innerContent = this.getStateOfSim();
      leftHandBullet.innerContent = this.getLeftHandState();
      rightHandBullet.innerContent = this.getRightHandState();
    } );
  }

  private getStateOfSim(): string {
    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn( RatioAndProportionStrings.a11y.screenSummaryQualitativeStateOfSimStringProperty, {
      color: BackgroundColorHandler.getCurrentColorRegion( this.ratioFitnessProperty.value, this.inProportionProperty.value ),
      ratioFitness: this.ratioDescriber.getRatioFitness( false ),
      currentChallenge: this.ratioToChallengeInfoMap.get( this.targetRatioProperty.value )!.lowercaseStringProperty,
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

  public getDetailsButtonState(): string {
    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn( RatioAndProportionStrings.a11y.detailsButtonPatternStringProperty, {
      stateOfSim: this.getStateOfSim(),
      leftHand: this.getLeftHandState(),
      rightHand: this.getRightHandState()
    } );
  }
}

ratioAndProportion.register( 'DiscoverScreenSummaryNode', DiscoverScreenSummaryNode );
export default DiscoverScreenSummaryNode;