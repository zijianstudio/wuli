// Copyright 2022-2023, University of Colorado Boulder

/**
 * Responsible for generating descriptions related to Sides.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../quadrilateral.js';
import QuadrilateralSide from '../model/QuadrilateralSide.js';
import Range from '../../../../dot/js/Range.js';
import QuadrilateralShapeModel from '../model/QuadrilateralShapeModel.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import QuadrilateralStrings from '../../QuadrilateralStrings.js';
import NamedQuadrilateral from '../model/NamedQuadrilateral.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import { NullableQuadrilateralStringType } from './QuadrilateralDescriber.js';

// constants
const farShorterThanStringProperty = QuadrilateralStrings.a11y.voicing.farShorterThanStringProperty;
const aboutHalfAsLongAsStringProperty = QuadrilateralStrings.a11y.voicing.aboutHalfAsLongAsStringProperty;
const aLittleShorterThanStringProperty = QuadrilateralStrings.a11y.voicing.aLittleShorterThanStringProperty;
const muchShorterThanStringProperty = QuadrilateralStrings.a11y.voicing.muchShorterThanStringProperty;
const similarButShorterThanStringProperty = QuadrilateralStrings.a11y.voicing.similarButShorterThanStringProperty;
const similarButLongerThanStringProperty = QuadrilateralStrings.a11y.voicing.similarButLongerThanStringProperty;
const aLittleLongerThanStringProperty = QuadrilateralStrings.a11y.voicing.aLittleLongerThanStringProperty;
const muchLongerThanStringProperty = QuadrilateralStrings.a11y.voicing.muchLongerThanStringProperty;
const aboutTwiceAsLongAsStringProperty = QuadrilateralStrings.a11y.voicing.aboutTwiceAsLongAsStringProperty;
const farLongerThanStringProperty = QuadrilateralStrings.a11y.voicing.farLongerThanStringProperty;
const equalToStringProperty = QuadrilateralStrings.a11y.voicing.equalToStringProperty;
const twiceAsLongAsStringProperty = QuadrilateralStrings.a11y.voicing.twiceAsLongAsStringProperty;
const halfAsLongAsStringProperty = QuadrilateralStrings.a11y.voicing.halfAsLongAsStringProperty;
const parallelSideObjectResponsePatternStringProperty = QuadrilateralStrings.a11y.voicing.parallelSideObjectResponsePatternStringProperty;
const parallelEqualSideObjectResponsePatternStringProperty = QuadrilateralStrings.a11y.voicing.parallelEqualSideObjectResponsePatternStringProperty;
const sideObjectResponsePatternStringProperty = QuadrilateralStrings.a11y.voicing.sideObjectResponsePatternStringProperty;
const equalToAdjacentSidesStringProperty = QuadrilateralStrings.a11y.voicing.equalToAdjacentSidesStringProperty;
const equalToOneAdjacentSideStringProperty = QuadrilateralStrings.a11y.voicing.equalToOneAdjacentSideStringProperty;
const equalAdjacentSidesPatternStringProperty = QuadrilateralStrings.a11y.voicing.equalAdjacentSidesPatternStringProperty;
const equalAdjacentParallelSidesPatternStringProperty = QuadrilateralStrings.a11y.voicing.equalAdjacentParallelSidesPatternStringProperty;
const shorterThanAdjacentSidesStringProperty = QuadrilateralStrings.a11y.voicing.shorterThanAdjacentSidesStringProperty;
const longerThanAdjacentSidesStringProperty = QuadrilateralStrings.a11y.voicing.longerThanAdjacentSidesStringProperty;
const notEqualToAdjacentSidesStringProperty = QuadrilateralStrings.a11y.voicing.notEqualToAdjacentSidesStringProperty;
const shorterThanParallelAdjacentSidesStringProperty = QuadrilateralStrings.a11y.voicing.shorterThanParallelAdjacentSidesStringProperty;
const longerThanParallelAdjacentSidesStringProperty = QuadrilateralStrings.a11y.voicing.longerThanParallelAdjacentSidesStringProperty;
const notEqualToParallelAdjacentSidesStringProperty = QuadrilateralStrings.a11y.voicing.notEqualToParallelAdjacentSidesStringProperty;
const oneUnitStringProperty = QuadrilateralStrings.a11y.voicing.oneUnitStringProperty;
const numberOfUnitsPatternStringProperty = QuadrilateralStrings.a11y.voicing.numberOfUnitsPatternStringProperty;
const numberOfUnitsAndAHalfPatternStringProperty = QuadrilateralStrings.a11y.voicing.numberOfUnitsAndAHalfPatternStringProperty;
const sideUnitsObjectResponsePatternStringProperty = QuadrilateralStrings.a11y.voicing.sideUnitsObjectResponsePatternStringProperty;
const oneQuarterUnitStringProperty = QuadrilateralStrings.a11y.voicing.oneQuarterUnitStringProperty;
const numberAndOneQuarterUnitsPatternStringProperty = QuadrilateralStrings.a11y.voicing.numberAndOneQuarterUnitsPatternStringProperty;
const threeQuarterUnitsStringProperty = QuadrilateralStrings.a11y.voicing.threeQuarterUnitsStringProperty;
const numberAndThreeQuarterUnitsPatternStringProperty = QuadrilateralStrings.a11y.voicing.numberAndThreeQuarterUnitsPatternStringProperty;
const aboutOneUnitStringProperty = QuadrilateralStrings.a11y.voicing.aboutOneUnitStringProperty;
const aboutNumberUnitsPatternStringProperty = QuadrilateralStrings.a11y.voicing.aboutNumberUnitsPatternStringProperty;
const aboutOneHalfUnitsStringProperty = QuadrilateralStrings.a11y.voicing.aboutOneHalfUnitsStringProperty;
const aboutNumberAndAHalfUnitsPatternStringProperty = QuadrilateralStrings.a11y.voicing.aboutNumberAndAHalfUnitsPatternStringProperty;
const aboutNumberQuarterUnitsPatternStringProperty = QuadrilateralStrings.a11y.voicing.aboutNumberQuarterUnitsPatternStringProperty;
const aboutFullNumberAndNumberQuarterUnitsPatternStringProperty = QuadrilateralStrings.a11y.voicing.aboutFullNumberAndNumberQuarterUnitsPatternStringProperty;
const oneHalfUnitsStringProperty = QuadrilateralStrings.a11y.voicing.oneHalfUnitsStringProperty;

// A map that will provide comparison descriptions for side lengths. Range values are the ratio between lengths
// of different sides.
const LENGTH_COMPARISON_DESCRIPTION_MAP = new Map<Range, TReadOnlyProperty<string>>();
LENGTH_COMPARISON_DESCRIPTION_MAP.set( new Range( 0, 0.1 ), farShorterThanStringProperty );
LENGTH_COMPARISON_DESCRIPTION_MAP.set( new Range( 0.1, 0.4 ), muchShorterThanStringProperty );
LENGTH_COMPARISON_DESCRIPTION_MAP.set( new Range( 0.4, 0.6 ), aboutHalfAsLongAsStringProperty );
LENGTH_COMPARISON_DESCRIPTION_MAP.set( new Range( 0.6, 0.8 ), aLittleShorterThanStringProperty );
LENGTH_COMPARISON_DESCRIPTION_MAP.set( new Range( 0.8, 1 ), similarButShorterThanStringProperty );
LENGTH_COMPARISON_DESCRIPTION_MAP.set( new Range( 1, 1.3 ), similarButLongerThanStringProperty );
LENGTH_COMPARISON_DESCRIPTION_MAP.set( new Range( 1.3, 1.6 ), aLittleLongerThanStringProperty );
LENGTH_COMPARISON_DESCRIPTION_MAP.set( new Range( 1.6, 1.8 ), muchLongerThanStringProperty );
LENGTH_COMPARISON_DESCRIPTION_MAP.set( new Range( 1.8, 2.2 ), aboutTwiceAsLongAsStringProperty );
LENGTH_COMPARISON_DESCRIPTION_MAP.set( new Range( 2.2, Number.POSITIVE_INFINITY ), farLongerThanStringProperty );

export default class QuadrilateralSideDescriber {
  public readonly side: QuadrilateralSide;
  private readonly quadrilateralShapeModel: QuadrilateralShapeModel;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly markersVisibleProperty: TReadOnlyProperty<boolean>;

  public constructor( side: QuadrilateralSide, quadrilateralShapeModel: QuadrilateralShapeModel, markersVisibleProperty: TReadOnlyProperty<boolean>, modelViewTransform: ModelViewTransform2 ) {
    this.side = side;
    this.quadrilateralShapeModel = quadrilateralShapeModel;
    this.modelViewTransform = modelViewTransform;
    this.markersVisibleProperty = markersVisibleProperty;
  }

  /**
   * Returns the Object response for the QuadrilateralSide for Voicing. Returns something like
   *
   * "equal to opposite side, equal to adjacent sides." or
   * "parallel and a little longer than opposite, shorter than adjacent sides"
   */
  public getSideObjectResponse(): string {
    let response = '';
    const oppositeSide = this.quadrilateralShapeModel.oppositeSideMap.get( this.side )!;

    const parallelSidePairs = this.quadrilateralShapeModel.parallelSidePairsProperty.value;
    const thisSideIsParallel = _.some( parallelSidePairs, sidePair => sidePair.component1 === this.side || sidePair.component2 === this.side );

    const thisSideEqualToOppositeSide = this.quadrilateralShapeModel.isInterLengthEqualToOther( oppositeSide.lengthProperty.value, this.side.lengthProperty.value );

    // Unique string patterns to support more natural english when opposite sides are both parallel AND equal in length.
    const patternStringProperty = thisSideIsParallel && thisSideEqualToOppositeSide ? parallelEqualSideObjectResponsePatternStringProperty :
                                  thisSideIsParallel ? parallelSideObjectResponsePatternStringProperty :
                                  sideObjectResponsePatternStringProperty;

    // If the quadrilateral is a rhombus or a square, always describe that the opposite side is equal in length to the
    // other. This may not happen naturally by comparing side lengths because a rhombus and square may be detected
    // when sides are not perfectly equal due to the angle tolerance interval.
    const shapeName = this.quadrilateralShapeModel.shapeNameProperty.value;
    const oppositeComparison = shapeName === NamedQuadrilateral.SQUARE || shapeName === NamedQuadrilateral.RHOMBUS ?
                               equalToStringProperty : this.getLengthComparisonDescription( oppositeSide );

    response = StringUtils.fillIn( patternStringProperty, {
      oppositeComparison: oppositeComparison,
      adjacentSideDescription: this.getAdjacentSideDescription()
    } );

    // if 'markers' are visible describe the side length units by appending that information to the object response
    if ( this.markersVisibleProperty.value ) {
      const unitsDescription = this.getSideUnitsDescription();
      response = StringUtils.fillIn( sideUnitsObjectResponsePatternStringProperty, {
        unitsDescription: unitsDescription,
        objectResponse: response
      } );
    }

    return response;
  }

  /**
   * Returns a description of the number of length units for this side. Returns something like
   *
   * "1 unit" or
   * "just over 3 units" or
   * "2 and a half units" or
   * "2 and a quarter units" or
   * "2 and three-quarter units".
   */
  public getSideUnitsDescription(): NullableQuadrilateralStringType {
    const shapeModel = this.quadrilateralShapeModel;
    const sideLength = this.side.lengthProperty.value;

    const numberOfFullUnits = Math.floor( sideLength / QuadrilateralSide.SIDE_SEGMENT_LENGTH );
    const remainder = sideLength % QuadrilateralSide.SIDE_SEGMENT_LENGTH;

    if ( shapeModel.isInterLengthEqualToOther( remainder, 0 ) ) {
      if ( numberOfFullUnits === 1 ) {

        // "one unit"
        return oneUnitStringProperty;
      }
      else {

        // "3 units"
        return StringUtils.fillIn( numberOfUnitsPatternStringProperty, {
          numberOfUnits: numberOfFullUnits
        } );
      }
    }
    else if ( shapeModel.isInterLengthEqualToOther( remainder, QuadrilateralSide.SIDE_SEGMENT_LENGTH / 2 ) ) {
      if ( numberOfFullUnits === 0 ) {
        return oneHalfUnitsStringProperty;
      }
      else {

        // three and a half units
        return StringUtils.fillIn( numberOfUnitsAndAHalfPatternStringProperty, {
          numberOfUnits: numberOfFullUnits
        } );
      }
    }
    else if ( shapeModel.isInterLengthEqualToOther( remainder, QuadrilateralSide.SIDE_SEGMENT_LENGTH / 4 ) ) {
      if ( numberOfFullUnits === 0 ) {

        // "one quarter units"
        return oneQuarterUnitStringProperty;
      }
      else {

        // 2 and three-quarter units
        return StringUtils.fillIn( numberAndOneQuarterUnitsPatternStringProperty, {
          fullNumber: numberOfFullUnits
        } );
      }
    }
    else if ( shapeModel.isInterLengthEqualToOther( remainder, 3 * QuadrilateralSide.SIDE_SEGMENT_LENGTH / 4 ) ) {
      if ( numberOfFullUnits === 0 ) {

        // "one quarter units"
        return threeQuarterUnitsStringProperty;
      }
      else {

        // 2 and three-quarter units
        return StringUtils.fillIn( numberAndThreeQuarterUnitsPatternStringProperty, {
          fullNumber: numberOfFullUnits
        } );
      }
    }
    else {

      const numberOfQuarterUnits = Math.ceil( ( sideLength / QuadrilateralSide.SIDE_SEGMENT_LENGTH ) * 4 );
      const numberOfExtraCornerUnits = numberOfQuarterUnits % 4;
      if ( numberOfExtraCornerUnits === 0 ) {
        if ( numberOfFullUnits === 0 ) {
          return aboutOneUnitStringProperty;
        }
        else {
          // about 3 units (just under, currently)
          return StringUtils.fillIn( aboutNumberUnitsPatternStringProperty, {
            number: numberOfFullUnits + 1
          } );
        }
      }
      else if ( numberOfExtraCornerUnits === 2 ) {
        if ( numberOfFullUnits === 0 ) {
          // about one-half units
          return aboutOneHalfUnitsStringProperty;
        }
        else {
          // about 1 and a half units
          return StringUtils.fillIn( aboutNumberAndAHalfUnitsPatternStringProperty, {
            number: numberOfFullUnits
          } );
        }
      }
      else {

        if ( numberOfFullUnits === 0 ) {

          // about three-quarter units
          // about one-quarter units
          return StringUtils.fillIn( aboutNumberQuarterUnitsPatternStringProperty, {
            number: numberOfExtraCornerUnits
          } );
        }
        else {

          // about 2 and one quarter units
          // about 3 and three-quarter units
          return StringUtils.fillIn( aboutFullNumberAndNumberQuarterUnitsPatternStringProperty, {
            fullNumber: numberOfFullUnits,
            number: numberOfExtraCornerUnits
          } );
        }
      }
    }
  }

  /**
   * Get a description of the adjacent sides and how this side compares to them in length. Also includes information
   * about them if they are parallel. Used for the Object response of this vertex. Will return something like
   *
   * "much smaller than adjacent equal sides" or
   * "equal to adjacent sides" or
   * "not equal to parallel adjacent sides"
   */
  private getAdjacentSideDescription(): NullableQuadrilateralStringType {
    let description: NullableQuadrilateralStringType = null;

    const adjacentSides = this.quadrilateralShapeModel.adjacentSideMap.get( this.side )!;
    const adjacentSidesEqual = this.quadrilateralShapeModel.isInterLengthEqualToOther(
      adjacentSides[ 0 ].lengthProperty.value,
      adjacentSides[ 1 ].lengthProperty.value
    );

    let numberOfEqualAdjacentSidePairs = 0;
    const adjacentSidePairs = this.quadrilateralShapeModel.adjacentEqualSidePairsProperty.value;
    adjacentSidePairs.forEach( sidePair => {
      if ( sidePair.component1 === this.side || sidePair.component2 === this.side ) {
        numberOfEqualAdjacentSidePairs++;
      }
    } );

    const parallelSideChecker = _.find( this.quadrilateralShapeModel.parallelSideCheckers, checker => {
      return checker.sidePair.component1 === adjacentSides[ 0 ] || checker.sidePair.component1 === adjacentSides[ 1 ];
    } );
    assert && assert( parallelSideChecker, 'did not find ParallelSideChecker' );
    const adjacentSidesParallel = parallelSideChecker!.areSidesParallel();

    if ( numberOfEqualAdjacentSidePairs === 2 ) {

      // This side and both adjacent sides are all equal
      if ( adjacentSidesParallel ) {
        description = 'equal to parallel adjacent sides';
      }
      else {
        description = equalToAdjacentSidesStringProperty;
      }
    }
    else if ( numberOfEqualAdjacentSidePairs === 1 ) {

      // Just one 'equal' side, that is all we need to describe
      description = equalToOneAdjacentSideStringProperty;
    }
    else if ( adjacentSidesEqual ) {

      const patternStringProperty = adjacentSidesParallel ? equalAdjacentParallelSidesPatternStringProperty : equalAdjacentSidesPatternStringProperty;

      // the adjacent sides are equal in length but not equal to this side, describe the length of
      // this side relative to the other sides but we can use either side since they are equal in length
      description = StringUtils.fillIn( patternStringProperty, {
        comparison: this.getLengthComparisonDescription( adjacentSides[ 0 ] )
      } );
    }
    else {

      // None of this side or adjacent sides are equal. Describe how this side is shorter than both, longer
      // than both, or simply equal to neither.
      const sideLength = this.side.lengthProperty.value;
      const firstAdjacentLength = adjacentSides[ 0 ].lengthProperty.value;
      const secondAdjacentLength = adjacentSides[ 1 ].lengthProperty.value;
      if ( firstAdjacentLength > sideLength && secondAdjacentLength > sideLength ) {
        description = adjacentSidesParallel ? shorterThanParallelAdjacentSidesStringProperty : shorterThanAdjacentSidesStringProperty;
      }
      else if ( firstAdjacentLength < sideLength && secondAdjacentLength < sideLength ) {
        description = adjacentSidesParallel ? longerThanParallelAdjacentSidesStringProperty : longerThanAdjacentSidesStringProperty;
      }
      else {
        description = adjacentSidesParallel ? notEqualToParallelAdjacentSidesStringProperty : notEqualToAdjacentSidesStringProperty;
      }
    }

    return description;
  }

  /**
   * Returns a description of comparison between two sides, using entries of LENGTH_COMPARISON_DESCRIPTION_MAP.
   * Description compares this side to otherSide. For example, if this side (SideAB) is longer than (sideCD) the output
   * will be something like:
   * "SideAB is much longer than sideCD."
   */
  private getLengthComparisonDescription( otherSide: QuadrilateralSide ): NullableQuadrilateralStringType {

    const shapeModel = this.quadrilateralShapeModel;
    const length1 = this.side.lengthProperty.value;
    const length2 = otherSide.lengthProperty.value;

    if ( shapeModel.isInterLengthEqualToOther( length1, length2 ) ) {
      return equalToStringProperty;
    }
    else if ( shapeModel.isInterLengthEqualToOther( length1, length2 * 2 ) ) {
      return twiceAsLongAsStringProperty;
    }
    else if ( shapeModel.isInterLengthEqualToOther( length1, length2 / 2 ) ) {
      return halfAsLongAsStringProperty;
    }
    else {
      let description: NullableQuadrilateralStringType = null;
      const lengthRatio = length1 / length2;
      LENGTH_COMPARISON_DESCRIPTION_MAP.forEach( ( value, key ) => {
        if ( key.contains( lengthRatio ) ) {
          description = value;
        }
      } );

      assert && assert( description, 'No description found for length ratio' );
      return description;
    }
  }
}

quadrilateral.register( 'QuadrilateralSideDescriber', QuadrilateralSideDescriber );
