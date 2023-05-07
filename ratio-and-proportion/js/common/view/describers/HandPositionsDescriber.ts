// Copyright 2020-2022, University of Colorado Boulder

/**
 * Description for the positions of each hand, as well as their positional relationship like the distance between each
 * hand, and if they have gotten closer to or farther from each other ("distance progress").
 *
 * In general, responses are split into implementaiton based on the DistanceResponseType. Whether it be distance
 * region (qualitative regions), distance progress (closer/farther), or a combo algorithm to default to distance region,
 * but you distance progress to prevent repeating the same region many times.
 *
 * `getSingleHandContextResponse` and `getBothHandsDistance` use a similar algorithm to accomplish these variations, but
 * could not be factored out completely due to natural language requirements.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Range from '../../../../../dot/js/Range.js';
import StrictOmit from '../../../../../phet-core/js/types/StrictOmit.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../../RatioAndProportionStrings.js';
import RatioTerm from '../../model/RatioTerm.js';
import rapConstants from '../../rapConstants.js';
import TickMarkView from '../TickMarkView.js';
import Property from '../../../../../axon/js/Property.js';
import RAPRatioTuple from '../../model/RAPRatioTuple.js';
import TickMarkDescriber from './TickMarkDescriber.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import DistanceResponseType from './DistanceResponseType.js';
import optionize from '../../../../../phet-core/js/optionize.js';
import RatioInputModality from './RatioInputModality.js';

// TODO: Dynamic string support when time, https://github.com/phetsims/ratio-and-proportion/issues/499
const DISTANCE_REGIONS_CAPITALIZED = [
  RatioAndProportionStrings.a11y.handPosition.distance.capitalized.farthestFromStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.capitalized.extremelyFarFromStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.capitalized.veryFarFromStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.capitalized.farFromStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.capitalized.notSoCloseToStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.capitalized.somewhatCloseToStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.capitalized.veryCloseToStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.capitalized.extremelyCloseToStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.capitalized.almostEvenWithStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.capitalized.evenWithStringProperty.value
];

const DISTANCE_REGIONS_LOWERCASE = [
  RatioAndProportionStrings.a11y.handPosition.distance.lowercase.farthestFromStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.lowercase.extremelyFarFromStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.lowercase.veryFarFromStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.lowercase.farFromStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.lowercase.notSoCloseToStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.lowercase.somewhatCloseToStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.lowercase.veryCloseToStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.lowercase.extremelyCloseToStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.lowercase.almostEvenWithStringProperty.value,
  RatioAndProportionStrings.a11y.handPosition.distance.lowercase.evenWithStringProperty.value
];

assert && assert( DISTANCE_REGIONS_CAPITALIZED.length === DISTANCE_REGIONS_LOWERCASE.length, 'should be the same regions' );

const TOTAL_RANGE = rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE;

// Empirically determined to fix edge case described in https://github.com/phetsims/ratio-and-proportion/issues/437
const aroundMiddleRegionWidth = 0.0025;

class PositionRegionsData {
  public lowerBound: number;
  private inRegionPredicate: ( inputValue: number, lowerBound: number ) => boolean;
  public region: string;

  public constructor( lowerBound: number, inRegionPredicate: PositionRegionsData['inRegionPredicate'], region: TReadOnlyProperty<string> ) {
    this.lowerBound = lowerBound;
    this.inRegionPredicate = inRegionPredicate;
    this.region = region.value;
  }

  public positionInRegion( position: number ): boolean {
    return this.inRegionPredicate( position, this.lowerBound );
  }
}

// Order matters! The first predicate must be run before the second for each to work correctly at identifying their
// own region. This is because each PositionRegionsData works based solely on a lowerBound.
const POSITION_REGIONS_DATA: PositionRegionsData[] = [
  new PositionRegionsData( 1, ( position, lowerBound ) => position === lowerBound,
    RatioAndProportionStrings.a11y.handPosition.atTopStringProperty ),
  new PositionRegionsData( 0.9, ( position, lowerBound ) => position >= lowerBound,
    RatioAndProportionStrings.a11y.handPosition.nearTopStringProperty ),
  new PositionRegionsData( 0.65, ( position, lowerBound ) => position > lowerBound,
    RatioAndProportionStrings.a11y.handPosition.inUpperRegionStringProperty ),
  new PositionRegionsData( 0.5 + aroundMiddleRegionWidth, ( position, lowerBound ) => position > lowerBound,
    RatioAndProportionStrings.a11y.handPosition.inUpperMiddleRegionStringProperty ),
  new PositionRegionsData( 0.5, ( position, lowerBound ) => position > lowerBound,
    RatioAndProportionStrings.a11y.handPosition.aroundMiddleStringProperty ),
  new PositionRegionsData( 0.5, ( position, lowerBound ) => position === lowerBound,
    RatioAndProportionStrings.a11y.handPosition.atMiddleStringProperty ),
  new PositionRegionsData( 0.5 - aroundMiddleRegionWidth, ( position, lowerBound ) => position >= lowerBound,
    RatioAndProportionStrings.a11y.handPosition.aroundMiddleStringProperty ),
  new PositionRegionsData( 0.35, ( position, lowerBound ) => position >= lowerBound,
    RatioAndProportionStrings.a11y.handPosition.inLowerMiddleRegionStringProperty ),
  new PositionRegionsData( 0.1, ( position, lowerBound ) => position > lowerBound,
    RatioAndProportionStrings.a11y.handPosition.inLowerRegionStringProperty ),
  new PositionRegionsData( 0, ( position, lowerBound ) => position > lowerBound,
    RatioAndProportionStrings.a11y.handPosition.nearBottomStringProperty ),
  new PositionRegionsData( 0, ( position, lowerBound ) => position === lowerBound,
    RatioAndProportionStrings.a11y.handPosition.atBottomStringProperty )
];

type GetDistanceProgressStringOptions = {

  // set to false if it is desired to get distanceProgress even when in proportion
  inProportionOverridesDistanceProgress?: boolean;
  closerString?: string;
  fartherString?: string;
};

export type HandContextResponseOptions = {
  supportGoBeyondEdgeResponses?: boolean;
  distanceResponseType?: DistanceResponseType;
};

class HandPositionsDescriber {

  private ratioTupleProperty: Property<RAPRatioTuple>;
  private tickMarkDescriber: TickMarkDescriber;
  private inProportionProperty: TReadOnlyProperty<boolean>;
  private ratioLockedProperty: TReadOnlyProperty<boolean>;

  // keep track of previous distance regions to track repetition, and alter description accordingly. This
  // is used for any modality getting a distance region in a context response.
  private previousDistanceRegionSingle: null | string;
  private previousDistanceRegionBoth: null | string;

  private previousDistance: number;
  public static readonly POSITION_REGIONS_DATA = POSITION_REGIONS_DATA;
  private previousEdgeCheckTuple: RAPRatioTuple;
  public enabledRatioTermsRangeProperty: TReadOnlyProperty<Range>;

  public constructor( ratioTupleProperty: Property<RAPRatioTuple>, tickMarkDescriber: TickMarkDescriber,
                      inProportionProperty: TReadOnlyProperty<boolean>, enabledRatioTermsRangeProperty: TReadOnlyProperty<Range>,
                      ratioLockedProperty: TReadOnlyProperty<boolean> ) {

    this.ratioTupleProperty = ratioTupleProperty;
    this.ratioLockedProperty = ratioLockedProperty;
    this.tickMarkDescriber = tickMarkDescriber;
    this.inProportionProperty = inProportionProperty;
    this.enabledRatioTermsRangeProperty = enabledRatioTermsRangeProperty;

    this.previousDistanceRegionSingle = null;
    this.previousDistanceRegionBoth = null;

    this.previousDistance = ratioTupleProperty.value.getDistance();

    this.previousEdgeCheckTuple = ratioTupleProperty.value;
  }

  /**
   * only ends with "of Play Area" if qualitative
   */
  public getHandPositionDescription( position: number, tickMarkView: TickMarkView ): string {
    return TickMarkView.describeQualitative( tickMarkView ) ? HandPositionsDescriber.getQualitativePosition( position ) :
           this.getQuantitativeHandPosition( position, TickMarkView.describeSemiQualitative( tickMarkView ) );
  }

  private getQuantitativeHandPosition( handPosition: number, semiQuantitative = false ): string {
    const tickMarkData = this.tickMarkDescriber.getRelativePositionAndTickMarkNumberForPosition( handPosition );

    // semi quantitative description uses ordinal numbers instead of full numbers.
    if ( semiQuantitative && typeof tickMarkData.ordinalPosition === 'string' ) {
      // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
      return StringUtils.fillIn( RatioAndProportionStrings.a11y.tickMark.semiQuantitativeHandPositionPatternStringProperty, {
        relativePosition: tickMarkData.relativePosition,
        ordinal: tickMarkData.ordinalPosition
      } );
    }

    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn( RatioAndProportionStrings.a11y.tickMark.quantitativeHandPositionPatternStringProperty, {
      relativePosition: tickMarkData.relativePosition,
      tickMarkPosition: tickMarkData.tickMarkPosition
    } );
  }

  private static getQualitativePosition( position: number ): string {
    assert && assert( TOTAL_RANGE.contains( position ), 'position expected to be in position range' );

    const normalizedPosition = TOTAL_RANGE.getNormalizedValue( position );

    let region = null;

    for ( let i = 0; i < POSITION_REGIONS_DATA.length; i++ ) {
      const positionRegionDatum = POSITION_REGIONS_DATA[ i ];

      if ( positionRegionDatum.positionInRegion( normalizedPosition ) ) {
        region = positionRegionDatum.region;
        break;
      }
    }

    assert && assert( region !== null, 'should have been in one of these regions' );

    return region!;
  }

  /**
   * NOTE: These values are copied over in RAPPositionRegionsLayer, consult that Node before changing these values.
   */
  public getDistanceRegion( lowercase: boolean, distance: number = this.ratioTupleProperty.value.getDistance() ): string {

    assert && assert( TOTAL_RANGE.getLength() === 1, 'these hard coded values depend on a range of 1' );

    let index = null;
    if ( distance === TOTAL_RANGE.getLength() ) {
      index = 0;
    }
    else if ( distance >= 0.85 ) {
      index = 1;
    }
    else if ( distance >= 0.7 ) {
      index = 2;
    }
    else if ( distance >= 0.55 ) {
      index = 3;
    }
    else if ( distance >= 0.4 ) {
      index = 4;
    }
    else if ( distance >= 0.3 ) {
      index = 5;
    }
    else if ( distance >= 0.2 ) {
      index = 6;
    }
    else if ( distance >= 0.1 ) {
      index = 7;
    }
    else if ( distance > 0 ) {
      index = 8;
    }
    else if ( distance === 0 ) {
      index = 9;
    }
    assert && assert( index !== null, `index is still null, perhaps because distance is ${distance}` );
    index = index!;
    assert && assert( index < DISTANCE_REGIONS_CAPITALIZED.length, 'out of range' );
    return ( lowercase ? DISTANCE_REGIONS_LOWERCASE : DISTANCE_REGIONS_CAPITALIZED )[ index ];
  }

  public getSingleHandContextResponse( ratioTerm: RatioTerm, tickMarkView: TickMarkView, providedOptions?: HandContextResponseOptions ): string {

    const options = optionize<HandContextResponseOptions>()( {

      supportGoBeyondEdgeResponses: true,

      // By default, let the describer decide if we should have distance progress or region
      distanceResponseType: DistanceResponseType.COMBO
    }, providedOptions );

    if ( options.supportGoBeyondEdgeResponses ) {
      const ratioLockedEdgeResponse = this.getGoBeyondContextResponse( this.ratioTupleProperty.value, ratioTerm );
      if ( ratioLockedEdgeResponse ) {
        return ratioLockedEdgeResponse;
      }
    }

    let distanceClause = null;
    switch( options.distanceResponseType ) {
      case DistanceResponseType.COMBO:
        distanceClause = this.getSingleHandComboDistance( ratioTerm );
        break;
      case DistanceResponseType.DISTANCE_PROGRESS:
        distanceClause = this.getSingleHandDistanceProgressClause();
        break;
      case DistanceResponseType.DISTANCE_REGION:
        distanceClause = this.getDistanceRegion( false );
        break;
      default:
        assert && assert( false, 'This is not how enums work' );
    }

    assert && assert( distanceClause, 'Should be filled in by now' );
    const otherHandStringProperty = ratioTerm === RatioTerm.CONSEQUENT ?
                                    RatioAndProportionStrings.a11y.leftHandLowerStringProperty :
                                    RatioAndProportionStrings.a11y.rightHandLowerStringProperty;

    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    const distanceResponse = StringUtils.fillIn( RatioAndProportionStrings.a11y.handPosition.distanceOrDistanceProgressClauseStringProperty, {
      otherHand: otherHandStringProperty,
      distanceOrDistanceProgress: distanceClause
    } );

    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn( RatioAndProportionStrings.a11y.ratio.distancePositionContextResponseStringProperty, {
      distance: distanceResponse,
      position: this.getHandPositionDescription( this.ratioTupleProperty.value.getForTerm( ratioTerm ),
        tickMarkView )
    } );
  }

  /**
   * NOTE: if in-proportion, this will still return the distance region
   */
  private getSingleHandDistanceProgressClause(): string {

    // Fall back to distance region if there is no distance progress to deliver
    return this.getDistanceProgressString() || this.getDistanceRegion( false );
  }

  /**
   * This "combo" approach will conditionally provide distance-progress to make sure repetition is not heard within
   * distance regions.
   */
  public getSingleHandComboDistance( ratioTerm: RatioTerm ): string {

    const distanceRegion = this.getDistanceRegion( false );

    if ( distanceRegion === this.previousDistanceRegionSingle ) {
      const distanceProgressPhrase = this.getDistanceProgressString();
      const currentValue = this.ratioTupleProperty.value.getForTerm( ratioTerm );
      const handAtMinMax = TOTAL_RANGE.min === currentValue || TOTAL_RANGE.max === currentValue;

      // No distanceProgressPhrase means they are equal, don't give closer/farther at range extremities.
      if ( distanceProgressPhrase && !handAtMinMax ) {

        // Count closer/farther as a previous so that we don't ever get two of them at the same time
        this.previousDistanceRegionSingle = distanceProgressPhrase;
        return distanceProgressPhrase;
      }
    }

    this.previousDistanceRegionSingle = distanceRegion;

    return distanceRegion;
  }

  public getBothHandsDistance( capitalized: boolean, providedOptions?: HandContextResponseOptions ): string {
    const options = optionize<HandContextResponseOptions, StrictOmit<HandContextResponseOptions, 'supportGoBeyondEdgeResponses'>>()( {

      // By default, let the describer decide if we should have distance progress or region
      distanceResponseType: DistanceResponseType.COMBO
    }, providedOptions );

    switch( options.distanceResponseType ) {
      case DistanceResponseType.COMBO:
        return this.getBothHandsComboDistance( capitalized );
      case DistanceResponseType.DISTANCE_PROGRESS:
        return this.getBothHandsDistanceProgress( capitalized );
      case DistanceResponseType.DISTANCE_REGION:
        return this.getBothHandsDistanceRegion( capitalized );
      default:
        assert && assert( false, 'This is not how enums work' );
    }
    assert && assert( false, 'We should always have a distance case above' );
    return 'A serious logic error occurred';
  }

  public getBothHandsDistanceProgress( capitalized: boolean ): string {
    const distanceProgressPhrase = this.getDistanceProgressString( {
      inProportionOverridesDistanceProgress: false,
      closerString: RatioAndProportionStrings.a11y.handPosition.closerTogetherStringProperty.value,
      fartherString: RatioAndProportionStrings.a11y.handPosition.fartherApartStringProperty.value
    } );
    if ( distanceProgressPhrase ) {
      // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
      return StringUtils.fillIn( RatioAndProportionStrings.a11y.bothHands.handsDistanceProgressPatternStringProperty, {
        distanceProgress: distanceProgressPhrase
      } );
    }
    return this.getBothHandsDistanceRegion( capitalized );
  }

  public getBothHandsDistanceRegion( capitalized: boolean ): string {
    const distanceRegion = this.getDistanceRegion( true );

    const pattern = capitalized ? RatioAndProportionStrings.a11y.bothHands.handsDistancePatternCapitalizedStringProperty.value :
                    RatioAndProportionStrings.a11y.bothHands.handsDistancePatternStringProperty.value;

    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn( pattern, { distance: distanceRegion } );
  }

  public getBothHandsComboDistance( capitalized = false ): string {
    const distanceRegion = this.getDistanceRegion( true );

    if ( distanceRegion === this.previousDistanceRegionBoth ) {
      assert && assert( capitalized, 'overriding with distance-progress not supported for capitalized strings' );

      const distanceProgressPhrase = this.getDistanceProgressString( {
        inProportionOverridesDistanceProgress: false,
        closerString: RatioAndProportionStrings.a11y.handPosition.closerTogetherStringProperty.value,
        fartherString: RatioAndProportionStrings.a11y.handPosition.fartherApartStringProperty.value
      } );
      if ( distanceProgressPhrase ) {
        // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
        const distanceProgressDescription = StringUtils.fillIn( RatioAndProportionStrings.a11y.bothHands.handsDistanceProgressPatternStringProperty, {
          distanceProgress: distanceProgressPhrase
        } );

        // Count closer/farther as a previous so that we don't ever get two of them at the same time
        this.previousDistanceRegionBoth = distanceProgressDescription;
        return distanceProgressDescription;
      }
    }
    this.previousDistanceRegionBoth = distanceRegion;
    return this.getBothHandsDistanceRegion( capitalized );
  }

  private getDistanceProgressString( providedOptions?: GetDistanceProgressStringOptions ): null | string {

    const options = optionize<GetDistanceProgressStringOptions, GetDistanceProgressStringOptions>()( {
      inProportionOverridesDistanceProgress: true,
      closerString: RatioAndProportionStrings.a11y.handPosition.closerToStringProperty.value,
      fartherString: RatioAndProportionStrings.a11y.handPosition.fartherFromStringProperty.value
    }, providedOptions );

    // No distance progress if in proportion
    if ( options.inProportionOverridesDistanceProgress && this.inProportionProperty.value ) {
      return null;
    }

    const currentDistance = this.ratioTupleProperty.value.getDistance();
    let distanceProgressString = null;
    if ( currentDistance < this.previousDistance ) {
      distanceProgressString = options.closerString;
    }
    else if ( currentDistance > this.previousDistance ) {
      distanceProgressString = options.fartherString;
    }
    else {
      return null; // somehow positions are equal, same case as in proportion
    }

    this.previousDistance = currentDistance;

    return distanceProgressString;
  }

  /**
   * Create a response trigger when at an edge, and you try to move beyond it. This takes into consideration, what the
   * previous ratio value was, the current value, and what modality was most recently used. If just moving the antecedent
   * or consequent, then the response is simpler about what hand moved, but we need to hand the "both hands moved at the
   * same time" case as well.
   *
   * @param currentTuple
   * @param mostRecentlyMoved - By specifying the RatioTerm last moved, handle the case where both terms are at the edge
   * but only the changed one should reflect in the response. "Moved" is a misnomer because if at edge and trying to
   * "go beyond", the position won't change value.
   *
   * @returns - null if there is no go-beyond-edge response
   */
  public getGoBeyondContextResponse( currentTuple: RAPRatioTuple, mostRecentlyMoved: RatioInputModality ): string | null {

    // If ratio is locked, then respond as BOTH_HANDS (meaning moving either hand will trigger the edge response for
    // the hand at the edge).
    mostRecentlyMoved = this.ratioLockedProperty.value ? RatioInputModality.BOTH_HANDS : mostRecentlyMoved;

    const enabledRange = this.enabledRatioTermsRangeProperty.value;

    const previousAntecedentAtMin = this.previousEdgeCheckTuple.antecedent === enabledRange.min;
    const previousAntecedentAtMax = this.previousEdgeCheckTuple.antecedent === enabledRange.max;
    const previousConsequentAtMin = this.previousEdgeCheckTuple.consequent === enabledRange.min;
    const previousConsequentAtMax = this.previousEdgeCheckTuple.consequent === enabledRange.max;

    // If moved both terms, and either were previously at an extremity
    const movedEitherFromBothHandsAndPreviousAtEdge = mostRecentlyMoved === RatioInputModality.BOTH_HANDS && (
      previousAntecedentAtMin || previousAntecedentAtMax || previousConsequentAtMin || previousConsequentAtMax );

    // If moved the antecedent, and it was previously at an extremity.
    const movedAntecedentAndPreviousAtEdge = mostRecentlyMoved === RatioInputModality.ANTECEDENT &&
                                             ( previousAntecedentAtMin || previousAntecedentAtMax );

    // If moved the consequen, and it was previously at an extremity.
    const movedConsequentAndPreviousAtEdge = mostRecentlyMoved === RatioInputModality.CONSEQUENT &&
                                             ( previousConsequentAtMin || previousConsequentAtMax );

    // No previous value was at an extremity when moving that modality.
    if ( !( movedEitherFromBothHandsAndPreviousAtEdge || movedAntecedentAndPreviousAtEdge ||
            movedConsequentAndPreviousAtEdge ) ) {
      this.previousEdgeCheckTuple = currentTuple;
      return null;
    }

    let handAtEdge = null; // what hand?
    let extremityPosition = null; // where are we now?
    let direction = null; // where to go from here?

    // If we should look at the term as a possible "go beyond edge" case.
    const antecedentPossibleBeyond = movedAntecedentAndPreviousAtEdge || movedEitherFromBothHandsAndPreviousAtEdge;
    const consequentPossibleBeyond = movedConsequentAndPreviousAtEdge || movedEitherFromBothHandsAndPreviousAtEdge;

    if ( antecedentPossibleBeyond && previousAntecedentAtMin &&
         this.ratioTupleProperty.value.antecedent === enabledRange.min ) {
      handAtEdge = RatioAndProportionStrings.a11y.leftHandStringProperty.value;
      extremityPosition = enabledRange.min === rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE.min ?
                          RatioAndProportionStrings.a11y.handPosition.atBottomStringProperty.value :
                          RatioAndProportionStrings.a11y.handPosition.nearBottomStringProperty.value;
      direction = RatioAndProportionStrings.a11y.upStringProperty.value;
    }
    else if ( antecedentPossibleBeyond && previousAntecedentAtMax &&
              this.ratioTupleProperty.value.antecedent === enabledRange.max ) {
      handAtEdge = RatioAndProportionStrings.a11y.leftHandStringProperty.value;
      extremityPosition = RatioAndProportionStrings.a11y.handPosition.atTopStringProperty.value;
      direction = RatioAndProportionStrings.a11y.downStringProperty.value;
    }
    else if ( consequentPossibleBeyond && previousConsequentAtMin
              && this.ratioTupleProperty.value.consequent === enabledRange.min ) {
      handAtEdge = RatioAndProportionStrings.a11y.rightHandStringProperty.value;
      extremityPosition = enabledRange.min === rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE.min ?
                          RatioAndProportionStrings.a11y.handPosition.atBottomStringProperty.value :
                          RatioAndProportionStrings.a11y.handPosition.nearBottomStringProperty.value;
      direction = RatioAndProportionStrings.a11y.upStringProperty;
    }
    else if ( consequentPossibleBeyond && previousConsequentAtMax
              && this.ratioTupleProperty.value.consequent === enabledRange.max ) {
      handAtEdge = RatioAndProportionStrings.a11y.rightHandStringProperty.value;
      extremityPosition = RatioAndProportionStrings.a11y.handPosition.atTopStringProperty.value;
      direction = RatioAndProportionStrings.a11y.downStringProperty.value;
    }

    this.previousEdgeCheckTuple = currentTuple;

    // Detect if we are at the edge of the range
    if ( handAtEdge && extremityPosition && direction ) {

      // if hands move together, then the response will reflect both hands in the same direction
      const handsMoveTogether = this.ratioLockedProperty.value;

      // Basically the difference between "Move hands" and "Move hand"
      const patternStringProperty = handsMoveTogether ?
                                    RatioAndProportionStrings.a11y.ratio.bothHandsGoBeyondEdgeContextResponseStringProperty :
                                    RatioAndProportionStrings.a11y.ratio.singleHandGoBeyondEdgeContextResponseStringProperty;

      // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
      return StringUtils.fillIn( patternStringProperty, {
        position: extremityPosition,
        hand: handAtEdge,
        direction: direction
      } );
    }

    return null;
  }

  public reset(): void {
    this.previousDistanceRegionSingle = null;
    this.previousDistanceRegionBoth = null;

    this.previousDistance = this.ratioTupleProperty.value.getDistance();
    this.previousEdgeCheckTuple = this.ratioTupleProperty.value;
  }
}

ratioAndProportion.register( 'HandPositionsDescriber', HandPositionsDescriber );
export default HandPositionsDescriber;