// Copyright 2022-2023, University of Colorado Boulder

/**
 * Manages description strings related to the QuadrilateralVertex.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import quadrilateral from '../../quadrilateral.js';
import QuadrilateralStrings from '../../QuadrilateralStrings.js';
import QuadrilateralShapeModel from '../model/QuadrilateralShapeModel.js';
import QuadrilateralVertex from '../model/QuadrilateralVertex.js';
import QuadrilateralVertexLabel from '../model/QuadrilateralVertexLabel.js';
import Range from '../../../../dot/js/Range.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import CornerGuideNode from './CornerGuideNode.js';
import NamedQuadrilateral from '../model/NamedQuadrilateral.js';
import { PDOMValueType } from '../../../../scenery/js/imports.js';

// constants
const cornerAStringProperty = QuadrilateralStrings.a11y.cornerAStringProperty;
const cornerBStringProperty = QuadrilateralStrings.a11y.cornerBStringProperty;
const cornerCStringProperty = QuadrilateralStrings.a11y.cornerCStringProperty;
const cornerDStringProperty = QuadrilateralStrings.a11y.cornerDStringProperty;
const vertexObjectResponsePatternStringProperty = QuadrilateralStrings.a11y.voicing.vertexObjectResponsePatternStringProperty;
const farSmallerThanStringProperty = QuadrilateralStrings.a11y.voicing.farSmallerThanStringProperty;
const aboutHalfAsWideAsStringProperty = QuadrilateralStrings.a11y.voicing.aboutHalfAsWideAsStringProperty;
const halfAsWideAsStringProperty = QuadrilateralStrings.a11y.voicing.halfAsWideAsStringProperty;
const aLittleSmallerThanStringProperty = QuadrilateralStrings.a11y.voicing.aLittleSmallerThanStringProperty;
const muchSmallerThanStringProperty = QuadrilateralStrings.a11y.voicing.muchSmallerThanStringProperty;
const similarButSmallerThanStringProperty = QuadrilateralStrings.a11y.voicing.similarButSmallerThanStringProperty;
const equalToStringProperty = QuadrilateralStrings.a11y.voicing.equalToStringProperty;
const similarButWiderThanStringProperty = QuadrilateralStrings.a11y.voicing.similarButWiderThanStringProperty;
const muchWiderThanStringProperty = QuadrilateralStrings.a11y.voicing.muchWiderThanStringProperty;
const aboutTwiceAsWideAsStringProperty = QuadrilateralStrings.a11y.voicing.aboutTwiceAsWideAsStringProperty;
const twiceAsWideAsStringProperty = QuadrilateralStrings.a11y.voicing.twiceAsWideAsStringProperty;
const aLittleWiderThanStringProperty = QuadrilateralStrings.a11y.voicing.aLittleWiderThanStringProperty;
const farWiderThanStringProperty = QuadrilateralStrings.a11y.voicing.farWiderThanStringProperty;
const equalToAdjacentCornersStringProperty = QuadrilateralStrings.a11y.voicing.equalToAdjacentCornersStringProperty;
const equalToOneAdjacentCornerStringProperty = QuadrilateralStrings.a11y.voicing.equalToOneAdjacentCornerStringProperty;
const equalAdjacentCornersPatternStringProperty = QuadrilateralStrings.a11y.voicing.equalAdjacentCornersPatternStringProperty;
const smallerThanAdjacentCornersStringProperty = QuadrilateralStrings.a11y.voicing.smallerThanAdjacentCornersStringProperty;
const widerThanAdjacentCornersStringProperty = QuadrilateralStrings.a11y.voicing.widerThanAdjacentCornersStringProperty;
const notEqualToAdjacentCornersStringProperty = QuadrilateralStrings.a11y.voicing.notEqualToAdjacentCornersStringProperty;
const vertexObjectResponseWithWedgesPatternStringProperty = QuadrilateralStrings.a11y.voicing.vertexObjectResponseWithWedgesPatternStringProperty;
const rightAngleStringProperty = QuadrilateralStrings.a11y.voicing.rightAngleStringProperty;
const angleFlatStringProperty = QuadrilateralStrings.a11y.voicing.angleFlatStringProperty;
const oneWedgeStringProperty = QuadrilateralStrings.a11y.voicing.oneWedgeStringProperty;
const halfOneWedgeStringProperty = QuadrilateralStrings.a11y.voicing.halfOneWedgeStringProperty;
const lessThanHalfOneWedgeStringProperty = QuadrilateralStrings.a11y.voicing.lessThanHalfOneWedgeStringProperty;
const justOverOneWedgeStringProperty = QuadrilateralStrings.a11y.voicing.justOverOneWedgeStringProperty;
const justUnderOneWedgeStringProperty = QuadrilateralStrings.a11y.voicing.justUnderOneWedgeStringProperty;
const numberOfWedgesPatternStringProperty = QuadrilateralStrings.a11y.voicing.numberOfWedgesPatternStringProperty;
const numberOfWedgesAndAHalfPatternStringProperty = QuadrilateralStrings.a11y.voicing.numberOfWedgesAndAHalfPatternStringProperty;
const justOverNumberOfWedgesPatternStringProperty = QuadrilateralStrings.a11y.voicing.justOverNumberOfWedgesPatternStringProperty;
const justUnderNumberOfWedgesPatternStringProperty = QuadrilateralStrings.a11y.voicing.justUnderNumberOfWedgesPatternStringProperty;
const blockedByEdgeStringProperty = QuadrilateralStrings.a11y.voicing.blockedByEdgeStringProperty;

// Maps a vertex to its accessible name, like "Corner A".
const VERTEX_CORNER_LABEL_MAP = new Map<QuadrilateralVertexLabel, TReadOnlyProperty<string>>( [
  [ QuadrilateralVertexLabel.VERTEX_A, cornerAStringProperty ],
  [ QuadrilateralVertexLabel.VERTEX_B, cornerBStringProperty ],
  [ QuadrilateralVertexLabel.VERTEX_C, cornerCStringProperty ],
  [ QuadrilateralVertexLabel.VERTEX_D, cornerDStringProperty ]
] );

// If ratio of an angle to another is within this range it is 'about half as large as the other'.
const ABOUT_HALF_RANGE = new Range( 0.4, 0.6 );

// If ratio of angle to another is within this range it is 'about twice as large as the other'. Note that this
// range is twice as wide as the 'about half' range because the ratios around larger values will have a bigger
// variance. See https://github.com/phetsims/quadrilateral/issues/262.
const ABOUT_TWICE_RANGE = new Range( 1.8, 2.2 );

// Maps the difference in angles between two vertices to a description string.
const ANGLE_COMPARISON_DESCRIPTION_MAP = new Map<Range, TReadOnlyProperty<string>>();
ANGLE_COMPARISON_DESCRIPTION_MAP.set( new Range( 0, 0.1 ), farSmallerThanStringProperty );
ANGLE_COMPARISON_DESCRIPTION_MAP.set( new Range( 0.1, 0.4 ), muchSmallerThanStringProperty );
ANGLE_COMPARISON_DESCRIPTION_MAP.set( ABOUT_HALF_RANGE, aboutHalfAsWideAsStringProperty );
ANGLE_COMPARISON_DESCRIPTION_MAP.set( new Range( 0.6, 0.8 ), aLittleSmallerThanStringProperty );
ANGLE_COMPARISON_DESCRIPTION_MAP.set( new Range( 0.8, 1 ), similarButSmallerThanStringProperty );
ANGLE_COMPARISON_DESCRIPTION_MAP.set( new Range( 1, 1.3 ), similarButWiderThanStringProperty );
ANGLE_COMPARISON_DESCRIPTION_MAP.set( new Range( 1.3, 1.6 ), aLittleWiderThanStringProperty );
ANGLE_COMPARISON_DESCRIPTION_MAP.set( new Range( 1.6, 1.8 ), muchWiderThanStringProperty );
ANGLE_COMPARISON_DESCRIPTION_MAP.set( ABOUT_TWICE_RANGE, aboutTwiceAsWideAsStringProperty );
ANGLE_COMPARISON_DESCRIPTION_MAP.set( new Range( 2.2, Number.POSITIVE_INFINITY ), farWiderThanStringProperty );

export default class QuadrilateralVertexDescriber {

  // A reference to the model components that drive description.
  private readonly vertex: QuadrilateralVertex;
  private readonly quadrilateralShapeModel: QuadrilateralShapeModel;
  private readonly markersVisibleProperty: TReadOnlyProperty<boolean>;

  // See documentation at definition.
  public static readonly VERTEX_CORNER_LABEL_MAP = VERTEX_CORNER_LABEL_MAP;

  public constructor( vertex: QuadrilateralVertex, quadrilateralShapeModel: QuadrilateralShapeModel, markersVisibleProperty: TReadOnlyProperty<boolean> ) {
    this.vertex = vertex;
    this.quadrilateralShapeModel = quadrilateralShapeModel;
    this.markersVisibleProperty = markersVisibleProperty;
  }

  /**
   * Returns the Object response for the vertex. Will return something like
   *
   * "right angle, equal to opposite corner, equal to adjacent corners" or
   * "somewhat wider than opposite corner, much smaller than adjacent equal corners." or
   * "1 wedge, far smaller than opposite corner, smaller than adjacent corners."
   */
  public getVertexObjectResponse(): string {
    let response = '';

    const oppositeVertex = this.quadrilateralShapeModel.oppositeVertexMap.get( this.vertex )!;

    const shapeName = this.quadrilateralShapeModel.shapeNameProperty.value;
    const oppositeComparisonString = this.getAngleComparisonDescription( oppositeVertex, shapeName );
    const adjacentVertexDescriptionString = this.getAdjacentVertexObjectDescription();

    // if corner guides are visible, a description of the number of wedges is included
    if ( this.markersVisibleProperty.value ) {
      response = StringUtils.fillIn( vertexObjectResponseWithWedgesPatternStringProperty, {
        wedgeDescription: QuadrilateralVertexDescriber.getWedgesDescription( this.vertex.angleProperty.value!, this.quadrilateralShapeModel ),
        oppositeComparison: oppositeComparisonString,
        adjacentVertexDescription: adjacentVertexDescriptionString
      } );
    }
    else {
      response = StringUtils.fillIn( vertexObjectResponsePatternStringProperty, {
        oppositeComparison: oppositeComparisonString,
        adjacentVertexDescription: adjacentVertexDescriptionString
      } );
    }

    return response;
  }

  /**
   * Returns a description for the number of wedges, to be used when corner guides are shown. Returns something like
   * "just under 1 wedge" or
   * "just over 3 wedges" or
   * "1 wedge" or
   * "right angle" or
   * "3 and a half wedges" or
   * "half one wedge"
   *
   * For the design request of this feature please see https://github.com/phetsims/quadrilateral/issues/231
   */
  public static getWedgesDescription( vertexAngle: number, shapeModel: QuadrilateralShapeModel ): PDOMValueType | null {
    const numberOfFullWedges = Math.floor( vertexAngle / CornerGuideNode.WEDGE_SIZE_RADIANS );
    const remainder = vertexAngle % CornerGuideNode.WEDGE_SIZE_RADIANS;

    if ( shapeModel.isRightAngle( vertexAngle ) ) {
      return rightAngleStringProperty;
    }
    else if ( shapeModel.isFlatAngle( vertexAngle ) ) {
      return angleFlatStringProperty;
    }
    else if ( shapeModel.isStaticAngleEqualToOther( remainder, 0 ) ) {
      if ( numberOfFullWedges === 1 ) {
        return oneWedgeStringProperty;
      }
      else {
        return StringUtils.fillIn( numberOfWedgesPatternStringProperty, {
          numberOfWedges: numberOfFullWedges
        } );
      }
    }
    else if ( shapeModel.isStaticAngleEqualToOther( remainder, CornerGuideNode.WEDGE_SIZE_RADIANS / 2 ) ) {
      if ( numberOfFullWedges === 0 ) {
        return halfOneWedgeStringProperty;
      }
      else {
        return StringUtils.fillIn( numberOfWedgesAndAHalfPatternStringProperty, {
          numberOfWedges: numberOfFullWedges
        } );
      }
    }
    else if ( remainder < CornerGuideNode.WEDGE_SIZE_RADIANS / 2 ) {
      if ( numberOfFullWedges === 0 ) {
        return lessThanHalfOneWedgeStringProperty;
      }
      else if ( numberOfFullWedges === 1 ) {
        return justOverOneWedgeStringProperty;
      }
      else {
        return StringUtils.fillIn( justOverNumberOfWedgesPatternStringProperty, {
          numberOfWedges: numberOfFullWedges
        } );
      }
    }
    else if ( remainder > CornerGuideNode.WEDGE_SIZE_RADIANS / 2 ) {
      if ( numberOfFullWedges === 0 ) {
        return justUnderOneWedgeStringProperty;
      }
      else {
        return StringUtils.fillIn( justUnderNumberOfWedgesPatternStringProperty, {
          numberOfWedges: numberOfFullWedges + 1
        } );
      }
    }

    assert && assert( false, `did not find a wedge description for the provided angle: ${vertexAngle}` );
    return '';
  }

  /**
   * Get a description of the angle of this vertex and how it compares to its adjacent vertices. Will return something
   * like:
   *
   * "much smaller than adjacent equal corners." or
   * "equal to adjacent corners."
   */
  public getAdjacentVertexObjectDescription(): PDOMValueType {
    const adjacentCorners = this.quadrilateralShapeModel.adjacentVertexMap.get( this.vertex )!;
    const adjacentCornersEqual = this.quadrilateralShapeModel.isInterAngleEqualToOther(
      adjacentCorners[ 0 ].angleProperty.value!,
      adjacentCorners[ 1 ].angleProperty.value!
    );

    let numberOfEqualAdjacentVertexPairs = 0;
    const adjacentVertexPairs = this.quadrilateralShapeModel.adjacentEqualVertexPairsProperty.value;
    adjacentVertexPairs.forEach( vertexPair => {
      if ( vertexPair.component1 === this.vertex || vertexPair.component2 === this.vertex ) {
        numberOfEqualAdjacentVertexPairs++;
      }
    } );
    if ( numberOfEqualAdjacentVertexPairs === 2 ) {

      // This vertex and both adjacent angles are all equal
      return equalToAdjacentCornersStringProperty;
    }
    else if ( numberOfEqualAdjacentVertexPairs === 1 ) {

      // just say "equal to one adjacent corner
      return equalToOneAdjacentCornerStringProperty;
    }
    else if ( adjacentCornersEqual ) {

      // the adjacent corners are equal but not equal to provided vertex, combine their description and use either
      // to describe the relative description
      const shapeName = this.quadrilateralShapeModel.shapeNameProperty.value;
      return StringUtils.fillIn( equalAdjacentCornersPatternStringProperty, {
        comparison: this.getAngleComparisonDescription( adjacentCorners[ 0 ], shapeName )
      } );
    }
    else {

      // None of the vertex angles are equal. Describe how this vertex is smaller than both, larger than both, or
      // simply equal to neither.
      const vertexAngle = this.vertex.angleProperty.value!;
      const firstAdjacentAngle = adjacentCorners[ 0 ].angleProperty.value!;
      const secondAdjacentAngle = adjacentCorners[ 1 ].angleProperty.value!;

      if ( firstAdjacentAngle > vertexAngle && secondAdjacentAngle > vertexAngle ) {
        return smallerThanAdjacentCornersStringProperty;
      }
      else if ( firstAdjacentAngle < vertexAngle && secondAdjacentAngle < vertexAngle ) {
        return widerThanAdjacentCornersStringProperty;
      }
      else {
        return notEqualToAdjacentCornersStringProperty;
      }
    }
  }

  /**
   * Returns a context response for when the QuadrilateralVertex can not move because it is blocked by a boundary edge.
   */
  public getBlockedByEdgeResponse(): TReadOnlyProperty<string> {
    return blockedByEdgeStringProperty;
  }

  /**
   * Returns the description of comparison between this angle and another, using the entries of
   * ANGLE_COMPARISON_DESCRIPTION_MAP. Description compares this vertex to otherVertex. So if this vertex has a larger
   * angle than otherVertex the output will be something like:
   * "much much wider than" or
   * "a little wider than"
   *
   * or if this QuadrilateralVertex angle is smaller than otherVertex, returns something like
   * "much much smaller than" or
   * "a little smaller than"
   */
  public getAngleComparisonDescription( otherVertex: QuadrilateralVertex, shapeName: NamedQuadrilateral ): TReadOnlyProperty<string> | null {
    assert && assert( this.vertex.angleProperty.value !== null, 'angles need to be initialized for descriptions' );
    assert && assert( otherVertex.angleProperty.value !== null, 'angles need to be initialized for descriptions' );

    const angle1 = this.vertex.angleProperty.value!;
    const angle2 = otherVertex.angleProperty.value!;

    // If we are a trapezoid, only describe angles as equal when they are EXACTLY equal, otherwise we may run into
    // cases where we move out of isoceles trapezoid while the angles are still described as "equal".
    const usableToleranceInterval = shapeName === NamedQuadrilateral.TRAPEZOID ? 0 : this.quadrilateralShapeModel.interAngleToleranceInterval;
    if ( QuadrilateralShapeModel.isAngleEqualToOther( angle1, angle2, usableToleranceInterval ) ) {
      return equalToStringProperty;
    }
    else if ( QuadrilateralShapeModel.isAngleEqualToOther( angle1, angle2 * 2, usableToleranceInterval ) ) {
      return twiceAsWideAsStringProperty;
    }
    else if ( QuadrilateralShapeModel.isAngleEqualToOther( angle1, angle2 * 0.5, usableToleranceInterval ) ) {
      return halfAsWideAsStringProperty;
    }
    else {
      let description: TReadOnlyProperty<string> | null = null;

      const angleRatio = angle1 / angle2;
      ANGLE_COMPARISON_DESCRIPTION_MAP.forEach( ( value, key ) => {
        if ( key.contains( angleRatio ) ) {
          description = value;
        }
      } );

      assert && assert( description, `Description not found for angle difference ${angleRatio}` );
      return description!;
    }
  }

  /**
   * Returns true if value of angle is "about" half of value of other, within defined ranges.
   */
  public static isAngleAboutHalfOther( angle: number, other: number ): boolean {
    return ABOUT_HALF_RANGE.contains( angle / other );
  }

  /**
   * Returns true if value of angle is "about" twice value of other, within defined ranges.
   */
  public static isAngleAboutTwiceOther( angle: number, other: number ): boolean {
    return ABOUT_TWICE_RANGE.contains( angle / other );
  }
}

quadrilateral.register( 'QuadrilateralVertexDescriber', QuadrilateralVertexDescriber );
