// Copyright 2020-2022, University of Colorado Boulder

/**
 * Class responsible for formulating description strings specific to the both-hands interaction and associated
 * description (like in the screen summary and PDOMNode).
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../../RatioAndProportionStrings.js';
import Property from '../../../../../axon/js/Property.js';
import RAPRatioTuple from '../../model/RAPRatioTuple.js';
import Range from '../../../../../dot/js/Range.js';
import RatioDescriber from './RatioDescriber.js';
import HandPositionsDescriber, { HandContextResponseOptions } from './HandPositionsDescriber.js';
import TickMarkView from '../TickMarkView.js';
import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import TickMarkDescriber from './TickMarkDescriber.js';
import DistanceResponseType from './DistanceResponseType.js';
import RatioInputModality from './RatioInputModality.js';
import optionize from '../../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../../phet-core/js/types/StrictOmit.js';

const ratioDistancePositionContextResponsePatternStringProperty = RatioAndProportionStrings.a11y.ratio.distancePositionContextResponseStringProperty;

class BothHandsDescriber {

  private ratioTupleProperty: Property<RAPRatioTuple>;
  private enabledRatioTermsRangeProperty: TReadOnlyProperty<Range>;
  private tickMarkViewProperty: EnumerationProperty<TickMarkView>;
  private ratioDescriber: RatioDescriber;
  private handPositionsDescriber: HandPositionsDescriber;
  private ratioLockedProperty: Property<boolean>;

  public constructor( ratioTupleProperty: Property<RAPRatioTuple>, enabledRatioTermsRangeProperty: TReadOnlyProperty<Range>,
                      ratioLockedProperty: Property<boolean>, tickMarkViewProperty: EnumerationProperty<TickMarkView>,
                      inProportionProperty: TReadOnlyProperty<boolean>,
                      ratioDescriber: RatioDescriber, tickMarkDescriber: TickMarkDescriber ) {

    this.ratioTupleProperty = ratioTupleProperty;
    this.enabledRatioTermsRangeProperty = enabledRatioTermsRangeProperty;
    this.tickMarkViewProperty = tickMarkViewProperty;
    this.ratioDescriber = ratioDescriber;
    this.ratioLockedProperty = ratioLockedProperty;
    this.handPositionsDescriber = new HandPositionsDescriber( ratioTupleProperty, tickMarkDescriber,
      inProportionProperty, enabledRatioTermsRangeProperty, this.ratioLockedProperty );
  }

  public getBothHandsContextResponse( recentlyMovedRatioTerm: RatioInputModality, providedOptions?: HandContextResponseOptions ): string {

    const options = optionize<HandContextResponseOptions, StrictOmit<HandContextResponseOptions, 'distanceResponseType'>>()( {
      supportGoBeyondEdgeResponses: true
    }, providedOptions );

    if ( options.supportGoBeyondEdgeResponses ) {
      const ratioLockedEdgeResponse = this.handPositionsDescriber.getGoBeyondContextResponse(
        this.ratioTupleProperty.value, recentlyMovedRatioTerm );

      if ( ratioLockedEdgeResponse ) {
        return ratioLockedEdgeResponse;
      }
    }

    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn( ratioDistancePositionContextResponsePatternStringProperty, {
      distance: this.handPositionsDescriber.getBothHandsDistance( true, options ),
      position: this.getBothHandsPosition()
    } );
  }

  /**
   * Similar to getBothHandsContextResponse, but without extra logic for edges and distance-progress.
   */
  public getBothHandsDynamicDescription(): string {
    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn( ratioDistancePositionContextResponsePatternStringProperty, {
      distance: this.handPositionsDescriber.getBothHandsDistance( true, {
        distanceResponseType: DistanceResponseType.DISTANCE_REGION
      } ),
      position: this.getBothHandsPosition()
    } );
  }

  /**
   * When each hand in different region, "left hand . . . , right hand . . ." otherwise "both hands . . ."
   * Used for both hands interaction, and with individual hands when the ratio is locked
   */
  public getBothHandsPosition(): string {
    const tickMarkView = this.tickMarkViewProperty.value;

    const currentTuple = this.ratioTupleProperty.value;
    const leftPosition = this.handPositionsDescriber.getHandPositionDescription( currentTuple.antecedent, tickMarkView );
    const rightPosition = this.handPositionsDescriber.getHandPositionDescription( currentTuple.consequent, tickMarkView );

    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    if ( leftPosition === rightPosition ) {
      return StringUtils.fillIn( RatioAndProportionStrings.a11y.bothHands.equalObjectResponseAlertStringProperty, {
        inPosition: leftPosition
      } );
    }
    else {
      return StringUtils.fillIn( RatioAndProportionStrings.a11y.bothHands.eachObjectResponseAlertStringProperty, {
        leftPosition: leftPosition,
        rightPosition: rightPosition
      } );
    }
  }

  public getBothHandsObjectResponse(): string {
    return this.ratioDescriber.getProximityToChallengeRatio();
  }

  public reset(): void {
    this.handPositionsDescriber.reset();
  }
}

ratioAndProportion.register( 'BothHandsDescriber', BothHandsDescriber );
export default BothHandsDescriber;