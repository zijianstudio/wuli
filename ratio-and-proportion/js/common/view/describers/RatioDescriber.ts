// Copyright 2020-2022, University of Colorado Boulder

/**
 * Class responsible for formulating description strings about the state of the ratio and its fitness.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import LinearFunction from '../../../../../dot/js/LinearFunction.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import SceneryPhetStrings from '../../../../../scenery-phet/js/SceneryPhetStrings.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../../RatioAndProportionStrings.js';
import rapConstants from '../../rapConstants.js';
import RAPModel from '../../model/RAPModel.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';

const RATIO_FITNESS_STRINGS_CAPITALIZED = [
  RatioAndProportionStrings.a11y.ratio.capitalized.extremelyFarFromStringProperty.value,
  RatioAndProportionStrings.a11y.ratio.capitalized.veryFarFromStringProperty.value,
  RatioAndProportionStrings.a11y.ratio.capitalized.farFromStringProperty.value,
  RatioAndProportionStrings.a11y.ratio.capitalized.notSoCloseToStringProperty.value,
  RatioAndProportionStrings.a11y.ratio.capitalized.somewhatCloseToStringProperty.value,
  RatioAndProportionStrings.a11y.ratio.capitalized.veryCloseToStringProperty.value,
  RatioAndProportionStrings.a11y.ratio.capitalized.extremelyCloseToStringProperty.value,
  RatioAndProportionStrings.a11y.ratio.capitalized.atStringProperty.value
];

const atInitialValue = RatioAndProportionStrings.a11y.ratio.lowercase.atStringProperty.value;

const RATIO_FITNESS_STRINGS_LOWERCASE = [
  RatioAndProportionStrings.a11y.ratio.lowercase.extremelyFarFromStringProperty.value,
  RatioAndProportionStrings.a11y.ratio.lowercase.veryFarFromStringProperty.value,
  RatioAndProportionStrings.a11y.ratio.lowercase.farFromStringProperty.value,
  RatioAndProportionStrings.a11y.ratio.lowercase.notSoCloseToStringProperty.value,
  RatioAndProportionStrings.a11y.ratio.lowercase.somewhatCloseToStringProperty.value,
  RatioAndProportionStrings.a11y.ratio.lowercase.veryCloseToStringProperty.value,
  RatioAndProportionStrings.a11y.ratio.lowercase.extremelyCloseToStringProperty.value,
  atInitialValue
];

const NUMBER_TO_WORD = [
  SceneryPhetStrings.zeroStringProperty.value,
  SceneryPhetStrings.oneStringProperty.value,
  SceneryPhetStrings.twoStringProperty.value,
  SceneryPhetStrings.threeStringProperty.value,
  SceneryPhetStrings.fourStringProperty.value,
  SceneryPhetStrings.fiveStringProperty.value,
  SceneryPhetStrings.sixStringProperty.value,
  SceneryPhetStrings.sevenStringProperty.value,
  SceneryPhetStrings.eightStringProperty.value,
  SceneryPhetStrings.nineStringProperty.value,
  SceneryPhetStrings.tenStringProperty.value
];

// an unclamped fitness of 0 should map to "somewhatCloseTo" region
const ZERO_FITNESS_REGION_INDEX = 4;

assert && assert( RATIO_FITNESS_STRINGS_LOWERCASE.length === RATIO_FITNESS_STRINGS_CAPITALIZED.length, 'should be the same length' );

class RatioDescriber {

  private ratioFitnessProperty: TReadOnlyProperty<number>;
  private unclampedFitnessProperty: TReadOnlyProperty<number>;
  private model: RAPModel;

  public constructor( model: RAPModel ) {

    this.ratioFitnessProperty = model.ratioFitnessProperty;
    this.unclampedFitnessProperty = model.unclampedFitnessProperty;
    this.model = model;

    phet.log && model.unclampedFitnessProperty.link( () => {
      phet.log( this.getRatioFitness( false ) );
    } );
  }

  public getRatioFitness( capitalized = true ): string {

    const lastIndex = RATIO_FITNESS_STRINGS_CAPITALIZED.length - 1;
    assert && assert( RATIO_FITNESS_STRINGS_LOWERCASE[ lastIndex ] === atInitialValue, 'There are assumptions made about the order of these regions, likely this should not change.' );

    const ratioRegions = capitalized ? RATIO_FITNESS_STRINGS_CAPITALIZED : RATIO_FITNESS_STRINGS_LOWERCASE;

    // hard coded region for in proportion
    if ( this.model.inProportionProperty.value ) {
      return ratioRegions[ lastIndex ];
    }

    // normalize based on the fitness that is not in proportion
    const normalizedMax = rapConstants.RATIO_FITNESS_RANGE.max - this.model.getInProportionThreshold();

    const lessThanZeroMapping = new LinearFunction( this.model.getMinFitness(), rapConstants.RATIO_FITNESS_RANGE.min, 0, ZERO_FITNESS_REGION_INDEX - 1, true );
    const greaterThanZeroMapping = new LinearFunction( rapConstants.RATIO_FITNESS_RANGE.min, normalizedMax,
      ZERO_FITNESS_REGION_INDEX, lastIndex, true );

    const unclampedFitness = this.unclampedFitnessProperty.value;

    const mappingFunction = unclampedFitness > 0 ? greaterThanZeroMapping : lessThanZeroMapping;

    return ratioRegions[ Math.floor( mappingFunction.evaluate( unclampedFitness ) ) ];
  }

  public getProximityToChallengeRatio(): string {
    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn( RatioAndProportionStrings.a11y.ratio.proximityToRatioObjectResponseStringProperty, {
      proximityToRatio: this.getRatioFitness( false )
    } );
  }

  public getProximityToNewChallengeRatioSentence(): string {
    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn( RatioAndProportionStrings.a11y.ratio.proximityToNewRatioPatternStringProperty, {
      proximity: this.getRatioFitness( false )
    } );
  }

  public getCurrentChallengeSentence( antecedent: number, consequent: number ): string {
    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn( RatioAndProportionStrings.a11y.ratio.currentChallengeStringProperty, {

      // for consistency with all values, see https://github.com/phetsims/ratio-and-proportion/issues/283
      targetAntecedent: this.getWordFromNumber( antecedent ),
      targetConsequent: this.getWordFromNumber( consequent )
    } );
  }

  public getTargetRatioChangeAlert( antecedent: number, consequent: number ): string {
    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn( RatioAndProportionStrings.a11y.ratio.targetRatioChangedContextResponseStringProperty, {
      proximityToRatio: this.getProximityToNewChallengeRatioSentence(),
      currentChallenge: this.getCurrentChallengeSentence( antecedent, consequent )
    } );
  }

  public getWordFromNumber( number: number ): string {
    assert && assert( Number.isInteger( number ) );
    assert && assert( NUMBER_TO_WORD.length > number );
    return NUMBER_TO_WORD[ number ];
  }
}

ratioAndProportion.register( 'RatioDescriber', RatioDescriber );
export default RatioDescriber;