// Copyright 2021-2023, University of Colorado Boulder

/**
 * A class that generates many descriptions for the quadrilateral and simulation. It assembles strings that describe
 * (in natural english) the state of the simulation and the geometric properties of the quadrilateral.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../quadrilateral.js';
import QuadrilateralStrings from '../../QuadrilateralStrings.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NamedQuadrilateral from '../model/NamedQuadrilateral.js';
import QuadrilateralShapeModel from '../model/QuadrilateralShapeModel.js';
import QuadrilateralVertexLabel from '../model/QuadrilateralVertexLabel.js';
import QuadrilateralVertexDescriber from './QuadrilateralVertexDescriber.js';
import QuadrilateralSideDescriber from './QuadrilateralSideDescriber.js';
import QuadrilateralSideLabel from '../model/QuadrilateralSideLabel.js';
import QuadrilateralSidePair from '../model/QuadrilateralSidePair.js';
import QuadrilateralVertexPair from '../model/QuadrilateralVertexPair.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';
import ResponsePacket from '../../../../utterance-queue/js/ResponsePacket.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { PDOMValueType } from '../../../../scenery/js/imports.js';

// Alias for string types used in this sim - to support string Properties (dynamic locales), strings, and often
// null values for functions. Even though Voicing and Interactive Description do not support dynamic locales, code
// still uses Properties to reduce technical debt.
export type QuadrilateralStringType = PDOMValueType;
export type NullableQuadrilateralStringType = QuadrilateralStringType | null;

// constants
const firstDetailsStatementPatternStringProperty = QuadrilateralStrings.a11y.voicing.firstDetailsStatementPatternStringProperty;
const aBStringProperty = QuadrilateralStrings.a11y.aBStringProperty;
const bCStringProperty = QuadrilateralStrings.a11y.bCStringProperty;
const cDStringProperty = QuadrilateralStrings.a11y.cDStringProperty;
const dAStringProperty = QuadrilateralStrings.a11y.dAStringProperty;
const sideABStringProperty = QuadrilateralStrings.a11y.sideABStringProperty;
const sideBCStringProperty = QuadrilateralStrings.a11y.sideBCStringProperty;
const sideCDStringProperty = QuadrilateralStrings.a11y.sideCDStringProperty;
const sideDAStringProperty = QuadrilateralStrings.a11y.sideDAStringProperty;
const allStringProperty = QuadrilateralStrings.a11y.voicing.details.allStringProperty;
const oppositeStringProperty = QuadrilateralStrings.a11y.voicing.details.oppositeStringProperty;
const rightAnglesStringProperty = QuadrilateralStrings.a11y.voicing.details.rightAnglesStringProperty;
const equalStringProperty = QuadrilateralStrings.a11y.voicing.details.equalStringProperty;
const pairsOfAdjacentStringProperty = QuadrilateralStrings.a11y.voicing.details.pairsOfAdjacentStringProperty;
const onePairOfAdjacentStringProperty = QuadrilateralStrings.a11y.voicing.details.onePairOfAdjacentStringProperty;
const onePairOfOppositeStringProperty = QuadrilateralStrings.a11y.voicing.details.onePairOfOppositeStringProperty;
const noStringStringProperty = QuadrilateralStrings.a11y.voicing.details.noStringStringProperty;
const vertexAStringProperty = QuadrilateralStrings.vertexAStringProperty;
const vertexBStringProperty = QuadrilateralStrings.vertexBStringProperty;
const vertexCStringProperty = QuadrilateralStrings.vertexCStringProperty;
const vertexDStringProperty = QuadrilateralStrings.vertexDStringProperty;
const youHaveASizedNamedShapePatternStringProperty = QuadrilateralStrings.a11y.voicing.youHaveASizedNamedShapePatternStringProperty;
const youHaveASizedShapePatternStringProperty = QuadrilateralStrings.a11y.voicing.youHaveASizedShapePatternStringProperty;

const isoscelesTrapezoidDetailsPatternStringProperty = QuadrilateralStrings.a11y.voicing.isoscelesTrapezoidDetailsPatternStringProperty;
const allRightAnglesAllSidesEqualStringProperty = QuadrilateralStrings.a11y.voicing.allRightAnglesAllSidesEqualStringProperty;
const oppositeSidesInParallelStringProperty = QuadrilateralStrings.a11y.voicing.oppositeSidesInParallelStringProperty;
const trapezoidDetailsPatternStringProperty = QuadrilateralStrings.a11y.voicing.trapezoidDetailsPatternStringProperty;
const kiteDetailsShortPatternStringProperty = QuadrilateralStrings.a11y.voicing.kiteDetailsShortPatternStringProperty;
const dartDetailsShortPatternStringProperty = QuadrilateralStrings.a11y.voicing.dartDetailsShortPatternStringProperty;
const dartDetailsPatternStringProperty = QuadrilateralStrings.a11y.voicing.dartDetailsPatternStringProperty;
const kiteDetailsPatternStringProperty = QuadrilateralStrings.a11y.voicing.kiteDetailsPatternStringProperty;
const convexQuadrilateralDetailsStringProperty = QuadrilateralStrings.a11y.voicing.convexQuadrilateralDetailsStringProperty;
const concaveQuadrilateralDetailsPatternStringProperty = QuadrilateralStrings.a11y.voicing.concaveQuadrilateralDetailsPatternStringProperty;
const allSidesEqualStringProperty = QuadrilateralStrings.a11y.voicing.allSidesEqualStringProperty;
const allRightAnglesStringProperty = QuadrilateralStrings.a11y.voicing.allRightAnglesStringProperty;
const triangleDetailsPatternStringProperty = QuadrilateralStrings.a11y.voicing.triangleDetailsPatternStringProperty;

const sidesDescriptionPatternStringProperty = QuadrilateralStrings.a11y.voicing.sidesDescriptionPatternStringProperty;
const longestSidesDescriptionPatternStringProperty = QuadrilateralStrings.a11y.voicing.longestSidesDescriptionPatternStringProperty;
const longestSideDescriptionPatternStringProperty = QuadrilateralStrings.a11y.voicing.longestSideDescriptionPatternStringProperty;
const shortestSidesDescriptionPatternStringProperty = QuadrilateralStrings.a11y.voicing.shortestSidesDescriptionPatternStringProperty;
const shortestSideDescriptionPatternStringProperty = QuadrilateralStrings.a11y.voicing.shortestSideDescriptionPatternStringProperty;
const sideLengthDescriptionPatternStringProperty = QuadrilateralStrings.a11y.voicing.sideLengthDescriptionPatternStringProperty;

const cornersRightDescriptionStringProperty = QuadrilateralStrings.a11y.voicing.cornersRightDescriptionStringProperty;
const widestCornersDescriptionPatternStringProperty = QuadrilateralStrings.a11y.voicing.widestCornersDescriptionPatternStringProperty;
const widestCornerDescriptionPatternStringProperty = QuadrilateralStrings.a11y.voicing.widestCornerDescriptionPatternStringProperty;
const smallestCornersDescriptionPatternStringProperty = QuadrilateralStrings.a11y.voicing.smallestCornersDescriptionPatternStringProperty;
const smallestCornerDescriptionPatternStringProperty = QuadrilateralStrings.a11y.voicing.smallestCornerDescriptionPatternStringProperty;
const cornersDescriptionPatternStringProperty = QuadrilateralStrings.a11y.voicing.cornersDescriptionPatternStringProperty;
const numberOfWedgesPatternStringProperty = QuadrilateralStrings.a11y.voicing.numberOfWedgesPatternStringProperty;

const tinyStringProperty = QuadrilateralStrings.a11y.voicing.sizes.tinyStringProperty;
const verySmallStringProperty = QuadrilateralStrings.a11y.voicing.sizes.verySmallStringProperty;
const smallStringProperty = QuadrilateralStrings.a11y.voicing.sizes.smallStringProperty;
const mediumSizedStringProperty = QuadrilateralStrings.a11y.voicing.sizes.mediumSizedStringProperty;
const largeStringProperty = QuadrilateralStrings.a11y.voicing.sizes.largeStringProperty;

const youHaveAShapeHintPatternStringProperty = QuadrilateralStrings.a11y.voicing.youHaveAShapeHintPatternStringProperty;
const resetShapeStringProperty = QuadrilateralStrings.resetShapeStringProperty;
const resetShapeContextResponseStringProperty = QuadrilateralStrings.a11y.voicing.resetShape.contextResponseStringProperty;

const shapeNameWithArticlesMap = new Map<NamedQuadrilateral | null, TReadOnlyProperty<string>>();
shapeNameWithArticlesMap.set( NamedQuadrilateral.SQUARE, QuadrilateralStrings.a11y.voicing.shapeNames.withArticles.squareStringProperty );
shapeNameWithArticlesMap.set( NamedQuadrilateral.RECTANGLE, QuadrilateralStrings.a11y.voicing.shapeNames.withArticles.rectangleStringProperty );
shapeNameWithArticlesMap.set( NamedQuadrilateral.RHOMBUS, QuadrilateralStrings.a11y.voicing.shapeNames.withArticles.rhombusStringProperty );
shapeNameWithArticlesMap.set( NamedQuadrilateral.KITE, QuadrilateralStrings.a11y.voicing.shapeNames.withArticles.kiteStringProperty );
shapeNameWithArticlesMap.set( NamedQuadrilateral.ISOSCELES_TRAPEZOID, QuadrilateralStrings.a11y.voicing.shapeNames.withArticles.isoscelesTrapezoidStringProperty );
shapeNameWithArticlesMap.set( NamedQuadrilateral.TRAPEZOID, QuadrilateralStrings.a11y.voicing.shapeNames.withArticles.trapezoidStringProperty );
shapeNameWithArticlesMap.set( NamedQuadrilateral.CONCAVE_QUADRILATERAL, QuadrilateralStrings.a11y.voicing.shapeNames.withArticles.concaveQuadrilateralStringProperty );
shapeNameWithArticlesMap.set( NamedQuadrilateral.CONVEX_QUADRILATERAL, QuadrilateralStrings.a11y.voicing.shapeNames.withArticles.convexQuadrilateralStringProperty );
shapeNameWithArticlesMap.set( NamedQuadrilateral.PARALLELOGRAM, QuadrilateralStrings.a11y.voicing.shapeNames.withArticles.parallelogramStringProperty );
shapeNameWithArticlesMap.set( NamedQuadrilateral.DART, QuadrilateralStrings.a11y.voicing.shapeNames.withArticles.dartStringProperty );
shapeNameWithArticlesMap.set( NamedQuadrilateral.TRIANGLE, QuadrilateralStrings.a11y.voicing.shapeNames.withArticles.triangleStringProperty );

const shapeNameMap = new Map<NamedQuadrilateral, TReadOnlyProperty<string>>();
shapeNameMap.set( NamedQuadrilateral.SQUARE, QuadrilateralStrings.a11y.voicing.shapeNames.withoutArticles.squareStringProperty );
shapeNameMap.set( NamedQuadrilateral.RECTANGLE, QuadrilateralStrings.a11y.voicing.shapeNames.withoutArticles.rectangleStringProperty );
shapeNameMap.set( NamedQuadrilateral.RHOMBUS, QuadrilateralStrings.a11y.voicing.shapeNames.withoutArticles.rhombusStringProperty );
shapeNameMap.set( NamedQuadrilateral.KITE, QuadrilateralStrings.a11y.voicing.shapeNames.withoutArticles.kiteStringProperty );
shapeNameMap.set( NamedQuadrilateral.ISOSCELES_TRAPEZOID, QuadrilateralStrings.a11y.voicing.shapeNames.withoutArticles.isoscelesTrapezoidStringProperty );
shapeNameMap.set( NamedQuadrilateral.TRAPEZOID, QuadrilateralStrings.a11y.voicing.shapeNames.withoutArticles.trapezoidStringProperty );
shapeNameMap.set( NamedQuadrilateral.CONCAVE_QUADRILATERAL, QuadrilateralStrings.a11y.voicing.shapeNames.withoutArticles.concaveQuadrilateralStringProperty );
shapeNameMap.set( NamedQuadrilateral.CONVEX_QUADRILATERAL, QuadrilateralStrings.a11y.voicing.shapeNames.withoutArticles.convexQuadrilateralStringProperty );
shapeNameMap.set( NamedQuadrilateral.PARALLELOGRAM, QuadrilateralStrings.a11y.voicing.shapeNames.withoutArticles.parallelogramStringProperty );
shapeNameMap.set( NamedQuadrilateral.DART, QuadrilateralStrings.a11y.voicing.shapeNames.withoutArticles.dartStringProperty );
shapeNameMap.set( NamedQuadrilateral.TRIANGLE, QuadrilateralStrings.a11y.voicing.shapeNames.withoutArticles.triangleStringProperty );

// A map that goes from QuadrilateralVertexLabel -> letter label (like "A")
const vertexLabelMap = new Map<QuadrilateralVertexLabel, TReadOnlyProperty<string>>();
vertexLabelMap.set( QuadrilateralVertexLabel.VERTEX_A, vertexAStringProperty );
vertexLabelMap.set( QuadrilateralVertexLabel.VERTEX_B, vertexBStringProperty );
vertexLabelMap.set( QuadrilateralVertexLabel.VERTEX_C, vertexCStringProperty );
vertexLabelMap.set( QuadrilateralVertexLabel.VERTEX_D, vertexDStringProperty );

// A map that goes from QuadrilateralSideLabel -> "full" side label (like "Side AB")
const fullSideLabelMap = new Map<QuadrilateralSideLabel, TReadOnlyProperty<string>>();
fullSideLabelMap.set( QuadrilateralSideLabel.SIDE_AB, sideABStringProperty );
fullSideLabelMap.set( QuadrilateralSideLabel.SIDE_BC, sideBCStringProperty );
fullSideLabelMap.set( QuadrilateralSideLabel.SIDE_CD, sideCDStringProperty );
fullSideLabelMap.set( QuadrilateralSideLabel.SIDE_DA, sideDAStringProperty );

// A map that goes from QuadrilateralSideLabel -> letters label (like "AB")
const sideLabelMap = new Map<QuadrilateralSideLabel, TReadOnlyProperty<string>>();
sideLabelMap.set( QuadrilateralSideLabel.SIDE_AB, aBStringProperty );
sideLabelMap.set( QuadrilateralSideLabel.SIDE_BC, bCStringProperty );
sideLabelMap.set( QuadrilateralSideLabel.SIDE_CD, cDStringProperty );
sideLabelMap.set( QuadrilateralSideLabel.SIDE_DA, dAStringProperty );

// Thresholds that are used to describe the size of the current shape. All are relative to the displayed grid
// and the area of a grid cell.
const GRID_CELL_AREA = Math.pow( QuadrilateralConstants.GRID_SPACING, 2 );
const TINY_THRESHOLD = GRID_CELL_AREA * 4;
const VERY_SMALL_THRESHOLD = GRID_CELL_AREA * 12;
const SMALL_THRESHOLD = GRID_CELL_AREA * 24;
const MEDIUM_SIZED_THRESHOLD = GRID_CELL_AREA * 48;

export default class QuadrilateralDescriber {
  private readonly shapeModel: QuadrilateralShapeModel;
  private readonly shapeNameVisibleProperty: TReadOnlyProperty<boolean>;
  private readonly markersVisibleProperty: TReadOnlyProperty<boolean>;

  public readonly sideABDescriber: QuadrilateralSideDescriber;
  public readonly sideBCDescriber: QuadrilateralSideDescriber;
  public readonly sideCDDescriber: QuadrilateralSideDescriber;
  public readonly sideDADescriber: QuadrilateralSideDescriber;
  private readonly sideDescribers: readonly QuadrilateralSideDescriber[];

  public readonly vertexADescriber: QuadrilateralVertexDescriber;
  public readonly vertexBDescriber: QuadrilateralVertexDescriber;
  public readonly vertexCDescriber: QuadrilateralVertexDescriber;
  public readonly vertexDDescriber: QuadrilateralVertexDescriber;

  public constructor( shapeModel: QuadrilateralShapeModel, shapeNameVisibleProperty: TReadOnlyProperty<boolean>, markersVisibleProperty: TReadOnlyProperty<boolean>, modelViewTransform: ModelViewTransform2 ) {
    this.shapeModel = shapeModel;
    this.shapeNameVisibleProperty = shapeNameVisibleProperty;
    this.markersVisibleProperty = markersVisibleProperty;

    this.sideABDescriber = new QuadrilateralSideDescriber( shapeModel.sideAB, shapeModel, markersVisibleProperty, modelViewTransform );
    this.sideBCDescriber = new QuadrilateralSideDescriber( shapeModel.sideBC, shapeModel, markersVisibleProperty, modelViewTransform );
    this.sideCDDescriber = new QuadrilateralSideDescriber( shapeModel.sideCD, shapeModel, markersVisibleProperty, modelViewTransform );
    this.sideDADescriber = new QuadrilateralSideDescriber( shapeModel.sideDA, shapeModel, markersVisibleProperty, modelViewTransform );
    this.sideDescribers = [ this.sideABDescriber, this.sideBCDescriber, this.sideCDDescriber, this.sideDADescriber ];

    this.vertexADescriber = new QuadrilateralVertexDescriber( shapeModel.vertexA, shapeModel, markersVisibleProperty );
    this.vertexBDescriber = new QuadrilateralVertexDescriber( shapeModel.vertexB, shapeModel, markersVisibleProperty );
    this.vertexCDescriber = new QuadrilateralVertexDescriber( shapeModel.vertexC, shapeModel, markersVisibleProperty );
    this.vertexDDescriber = new QuadrilateralVertexDescriber( shapeModel.vertexD, shapeModel, markersVisibleProperty );
  }

  /**
   * Return the QuadrilateralVertexDescriber that can be used to describe a vertex of the provided QuadrilateralVertexLabel.
   */
  public getVertexDescriberForLabel( vertexLabel: QuadrilateralVertexLabel ): QuadrilateralVertexDescriber {
    return vertexLabel === QuadrilateralVertexLabel.VERTEX_A ? this.vertexADescriber :
           vertexLabel === QuadrilateralVertexLabel.VERTEX_B ? this.vertexBDescriber :
           vertexLabel === QuadrilateralVertexLabel.VERTEX_C ? this.vertexCDescriber :
           this.vertexDDescriber;
  }

  /**
   * Get a description of the quadrilateral shape, just including the shape name. Will return something like
   * "a rectangle" or
   * "a trapezoid" or
   * "a concave quadrilateral"
   */
  public getShapeDescription(): QuadrilateralStringType {

    // of type NamedQuadrilateral enumeration
    const shapeName = this.shapeModel.shapeNameProperty.value;
    return QuadrilateralDescriber.getShapeNameWithArticlesDescription( shapeName );
  }

  /**
   * Returns the actual name of the NamedQuadrilateral, with an article before the name for english
   * phrases.
   */
  public static getShapeNameWithArticlesDescription( shapeName: NamedQuadrilateral | null ): TReadOnlyProperty<string> {
    const shapeNameDescriptionProperty = shapeNameWithArticlesMap.get( shapeName );
    assert && assert( shapeNameDescriptionProperty, 'There must be shape name description for the current shape state.' );
    return shapeNameDescriptionProperty!;
  }

  /**
   * Get the shape name in isolation without any articles.
   */
  public static getShapeNameDescription( shapeName: NamedQuadrilateral ): TReadOnlyProperty<string> {
    const shapeNameDescriptionProperty = shapeNameMap.get( shapeName );
    assert && assert( shapeNameDescriptionProperty, 'There must be shape name description for the current shape state.' );
    return shapeNameDescriptionProperty!;
  }

  /**
   * Gets the label string for a side from its QuadrilateralSideLabel. Just the label without other context like
   * "AB" or
   * "DA"
   */
  public static getSideLabelString( sideLabel: QuadrilateralSideLabel ): TReadOnlyProperty<string> {
    const sideLabelStringProperty = sideLabelMap.get( sideLabel )!;
    assert && assert( sideLabelStringProperty, 'There must be a side label description.' );
    return sideLabelStringProperty;
  }

  /**
   * Gets a label string for the provided QuadrilateralVertexLabel. Returns something like
   * "A" or
   * "B"
   */
  public static getVertexLabelString( vertexLabel: QuadrilateralVertexLabel ): TReadOnlyProperty<string> {
    const vertexLabelStringProperty = vertexLabelMap.get( vertexLabel )!;
    assert && assert( vertexLabelStringProperty, 'There must be a label for the vertex.' );
    return vertexLabelStringProperty;
  }

  /**
   * Returns a string describing the shape that you have in a pattern like
   * "You have a square." or
   * "You have an isosceles trapezoid."
   */
  public getYouHaveAShapeDescription(): string {
    const shapeDescriptionString = this.getShapeDescription();
    return StringUtils.fillIn( youHaveAShapeHintPatternStringProperty, {
      shapeDescription: shapeDescriptionString
    } );
  }

  /**
   * Returns a description that is spoken when the user uses the "check shape" feature (global hotkey "ctrl + c").
   */
  public getCheckShapeDescription(): QuadrilateralStringType {
    let description: QuadrilateralStringType;
    if ( this.shapeNameVisibleProperty.value ) {
      description = this.getYouHaveAShapeDescription();
    }
    else {
      description = this.getShapePropertiesDescription();
    }

    return description;
  }

  /**
   * Returns a description of the current shape's geometric properties (without saying the shape name). Typically
   * this is used when the user hides the shape name in the user interface.
   */
  public getShapePropertiesDescription(): TReadOnlyProperty<string> | string {
    const currentShapeName = this.shapeModel.shapeNameProperty.value;
    if ( currentShapeName === NamedQuadrilateral.SQUARE ) {
      return this.getSquareDetailsString();
    }
    else if ( currentShapeName === NamedQuadrilateral.RECTANGLE ) {
      return this.getRectangleDetailsString();
    }
    else if ( currentShapeName === NamedQuadrilateral.RHOMBUS ) {
      return this.getRhombusDetailsString();
    }
    else if ( currentShapeName === NamedQuadrilateral.PARALLELOGRAM ) {
      return this.getParallelogramDetailsString();
    }
    else if ( currentShapeName === NamedQuadrilateral.TRAPEZOID ) {
      assert && assert( this.shapeModel.parallelSidePairsProperty.value.length === 1, 'A Trapezoid should have one parallel side pair' );
      const parallelSidePair = this.shapeModel.parallelSidePairsProperty.value[ 0 ];
      return this.getTrapezoidDetailsString( parallelSidePair );
    }
    else if ( currentShapeName === NamedQuadrilateral.ISOSCELES_TRAPEZOID ) {
      assert && assert( this.shapeModel.oppositeEqualSidePairsProperty.value.length === 1,
        'An Isosceles Trapezoid should have one pair of sides equal in length' );
      const oppositeEqualSidePair = this.shapeModel.oppositeEqualSidePairsProperty.value[ 0 ];

      assert && assert( this.shapeModel.parallelSidePairsProperty.value.length === 1,
        'A Trapezoid should have one parallel side pair.' );
      const parallelSidePair = this.shapeModel.parallelSidePairsProperty.value[ 0 ];

      return this.getIsoscelesTrapezoidDetailsString(
        oppositeEqualSidePair,
        parallelSidePair
      );
    }
    else if ( currentShapeName === NamedQuadrilateral.KITE ) {
      assert && assert( this.shapeModel.oppositeEqualVertexPairsProperty.value.length === 1,
        'A kite should have only one pair of opposite equal vertices' );
      const oppositeEqualVertexPair = this.shapeModel.oppositeEqualVertexPairsProperty.value[ 0 ];
      return this.getKiteDetailsString( oppositeEqualVertexPair, kiteDetailsPatternStringProperty );
    }
    else if ( currentShapeName === NamedQuadrilateral.DART ) {
      return this.getDartDetailsString( dartDetailsPatternStringProperty );
    }
    else if ( currentShapeName === NamedQuadrilateral.CONCAVE_QUADRILATERAL ) {
      return this.getConcaveQuadrilateralDetailsString();
    }
    else if ( currentShapeName === NamedQuadrilateral.CONVEX_QUADRILATERAL ) {
      return this.getConvexQuadrilateralDetailsString();
    }
    else if ( currentShapeName === NamedQuadrilateral.TRIANGLE ) {
      return this.getTriangleDetailsString();
    }

    assert && assert( false, 'Could not find shapePropertiesDescriptionProperty for shape.' );
    return '';
  }

  /**
   * Returns a description of the shape size. Something like
   * "tiny" or
   * "small" or
   * "large"
   */
  public getSizeDescription(): TReadOnlyProperty<string> {
    const area = this.shapeModel.areaProperty.value;
    if ( area < TINY_THRESHOLD ) {
      return tinyStringProperty;
    }
    else if ( area < VERY_SMALL_THRESHOLD ) {
      return verySmallStringProperty;
    }
    else if ( area < SMALL_THRESHOLD ) {
      return smallStringProperty;
    }
    else if ( area < MEDIUM_SIZED_THRESHOLD ) {
      return mediumSizedStringProperty;
    }
    else {
      return largeStringProperty;
    }
  }

  /**
   * Returns the first details statement for the Voicing toolbar. Details are broken up into numbered statements.
   * This first one provides the current named shape and its size.
   */
  public getFirstDetailsStatement(): string {
    const sizeDescriptionStringProperty = this.getSizeDescription();
    if ( this.shapeNameVisibleProperty.value ) {
      return StringUtils.fillIn( youHaveASizedNamedShapePatternStringProperty, {
        size: sizeDescriptionStringProperty,
        shapeName: QuadrilateralDescriber.getShapeNameDescription( this.shapeModel.shapeNameProperty.value )
      } );
    }
    else {
      return StringUtils.fillIn( youHaveASizedShapePatternStringProperty, {
        size: sizeDescriptionStringProperty
      } );
    }
  }

  /**
   * Returns the second "details" statement for the Voicing toolbar. Details are broken up into three numbered
   * statements. This one is a summary about equal corner angles and equal side lengths. Will return something like
   * "Right now, opposite corners are equal and opposite sides are equal." or
   * "Right now, on pair of opposite corners are equal and opposite sides are equal" or
   * "Right now, no corners are equal and no sides are equal."
   */
  public getSecondDetailsStatement(): string {

    const adjacentEqualVertexPairs = this.shapeModel.adjacentEqualVertexPairsProperty.value;
    const adjacentEqualSidePairs = this.shapeModel.adjacentEqualSidePairsProperty.value;

    let cornerTypeString;
    let angleEqualityString;
    let sideTypeString;
    if ( this.shapeModel.isParallelogram() ) {

      // If all adjacent vertices are equal then all are right angles. Otherwise, opposite angles must be equal.
      cornerTypeString = adjacentEqualVertexPairs.length === 4 ? allStringProperty : oppositeStringProperty;
      angleEqualityString = adjacentEqualVertexPairs.length === 4 ? rightAnglesStringProperty : equalStringProperty;

      // if all adjacent sides are equal in length, all sides are equal, otherwise only opposite sides are equal
      sideTypeString = adjacentEqualSidePairs.length === 4 ? allStringProperty : oppositeStringProperty;
    }
    else {
      const oppositeEqualVertexPairs = this.shapeModel.oppositeEqualVertexPairsProperty.value;
      const oppositeEqualSidePairs = this.shapeModel.oppositeEqualSidePairsProperty.value;

      cornerTypeString = adjacentEqualVertexPairs.length === 2 ? pairsOfAdjacentStringProperty :
                         adjacentEqualVertexPairs.length === 1 ? onePairOfAdjacentStringProperty :
                         oppositeEqualVertexPairs.length === 1 ? onePairOfOppositeStringProperty :
                         noStringStringProperty;

      angleEqualityString = adjacentEqualVertexPairs.length === 1 && this.shapeModel.isInterAngleEqualToOther( adjacentEqualVertexPairs[ 0 ].component1.angleProperty.value!, Math.PI / 2 ) ? rightAnglesStringProperty :
                            oppositeEqualVertexPairs.length === 1 && this.shapeModel.isInterAngleEqualToOther( oppositeEqualVertexPairs[ 0 ].component1.angleProperty.value!, Math.PI / 2 ) ? rightAnglesStringProperty :
                              // if two pairs of adjacent angles exist but we are not parallelogram, all cannot be
                              // right angles. OR, no angles are equal.
                            equalStringProperty;

      sideTypeString = adjacentEqualSidePairs.length === 2 ? pairsOfAdjacentStringProperty :
                       adjacentEqualSidePairs.length === 1 ? onePairOfAdjacentStringProperty :
                       oppositeEqualSidePairs.length === 1 ? onePairOfOppositeStringProperty :
                       noStringStringProperty;
    }

    return StringUtils.fillIn( firstDetailsStatementPatternStringProperty, {
      cornerType: cornerTypeString,
      angleEquality: angleEqualityString,
      sideType: sideTypeString
    } );
  }

  /**
   * Returns the third "details" statement for the Voicing toolbar. This is a qualitative description of the current
   * shape, that does not include shape name.
   */
  public getThirdDetailsStatement(): NullableQuadrilateralStringType {
    const shapeName = this.shapeModel.shapeNameProperty.value;

    let description = null;
    if ( shapeName === NamedQuadrilateral.SQUARE ||
         shapeName === NamedQuadrilateral.RHOMBUS ||
         shapeName === NamedQuadrilateral.RECTANGLE ) {

      // these shapes skip the shape details because it is duplicated with other details content
      description = null;
    }
    else if ( shapeName === NamedQuadrilateral.PARALLELOGRAM ) {
      description = this.getParallelogramDetailsString();
    }
    else if ( shapeName === NamedQuadrilateral.ISOSCELES_TRAPEZOID ) {

      assert && assert( this.shapeModel.oppositeEqualSidePairsProperty.value.length === 1,
        'An Isosceles Trapezoid should have one pair of sides equal in length' );
      const oppositeEqualSidePair = this.shapeModel.oppositeEqualSidePairsProperty.value[ 0 ];

      assert && assert( this.shapeModel.parallelSidePairsProperty.value.length === 1,
        'A Trapezoid should have one parallel side pair.' );
      const parallelSidePair = this.shapeModel.parallelSidePairsProperty.value[ 0 ];

      description = this.getIsoscelesTrapezoidDetailsString(
        oppositeEqualSidePair,
        parallelSidePair
      );
    }
    else if ( shapeName === NamedQuadrilateral.TRAPEZOID ) {
      assert && assert( this.shapeModel.parallelSidePairsProperty.value.length === 1, 'A Trapezoid should have one parallel side pair' );
      const parallelSidePair = this.shapeModel.parallelSidePairsProperty.value[ 0 ];
      description = this.getTrapezoidDetailsString( parallelSidePair );
    }
    else if ( shapeName === NamedQuadrilateral.KITE ) {

      assert && assert( this.shapeModel.oppositeEqualVertexPairsProperty.value.length === 1,
        'A kite should have only one pair of opposite equal vertices' );
      const oppositeEqualVertexPair = this.shapeModel.oppositeEqualVertexPairsProperty.value[ 0 ];
      description = this.getKiteDetailsString( oppositeEqualVertexPair );
    }
    else if ( shapeName === NamedQuadrilateral.DART ) {
      description = this.getDartDetailsString();
    }
    else if ( shapeName === NamedQuadrilateral.CONCAVE_QUADRILATERAL ) {
      description = this.getConcaveQuadrilateralDetailsString();
    }
    else if ( shapeName === NamedQuadrilateral.CONVEX_QUADRILATERAL ) {
      description = this.getConvexQuadrilateralDetailsString();
    }
    else if ( shapeName === NamedQuadrilateral.TRIANGLE ) {
      description = this.getTriangleDetailsString();
    }

    return description;
  }

  /**
   * The fourth description of the "details" button in the Voicing toolbar. Returns a description of the longest and
   * shortest sides of the shape. Only returns a string if shape "markers" are displayed - otherwise this more
   * quantitative content is skipped.
   */
  public getFourthDetailsStatement(): null | string {
    let description: null | string = null;

    // This description is only included if markers are visible
    if ( !this.markersVisibleProperty.value ) {
      return description;
    }

    const longestSideDescriber = _.maxBy( this.sideDescribers, sideDescriber => sideDescriber.side.lengthProperty.value )!;
    const shortestSideDescriber = _.minBy( this.sideDescribers, sideDescriber => sideDescriber.side.lengthProperty.value )!;
    const longestSide = _.maxBy( this.shapeModel.sides, side => side.lengthProperty.value )!;
    const shortestSide = _.minBy( this.shapeModel.sides, side => side.lengthProperty.value )!;

    const longestSideDescription = longestSideDescriber.getSideUnitsDescription();
    const shortestSideDescription = shortestSideDescriber.getSideUnitsDescription();

    if ( this.shapeModel.getAreAllLengthsEqual() ) {

      // All sides the same length, combine into a shorter string
      description = StringUtils.fillIn( sidesDescriptionPatternStringProperty, {
        description: longestSideDescription
      } );
    }
    else {

      let longestSubString;
      let shortestSubString;
      if ( _.some( this.shapeModel.oppositeEqualSidePairsProperty.value, oppositeEqualSidePair => oppositeEqualSidePair.includesComponent( longestSide ) ) ||
           _.some( this.shapeModel.adjacentEqualSidePairsProperty.value, adjacentEqualSidePair => adjacentEqualSidePair.includesComponent( longestSide ) ) ) {

        // multiple sides of the same "longest" length, pluralize
        longestSubString = StringUtils.fillIn( longestSidesDescriptionPatternStringProperty, {
          description: longestSideDescription
        } );
      }
      else {
        longestSubString = StringUtils.fillIn( longestSideDescriptionPatternStringProperty, {
          description: longestSideDescription
        } );
      }

      if ( _.some( this.shapeModel.oppositeEqualSidePairsProperty.value, oppositeEqualSidePair => oppositeEqualSidePair.includesComponent( shortestSide ) ) ||
           _.some( this.shapeModel.adjacentEqualSidePairsProperty.value, adjacentEqualSidePair => adjacentEqualSidePair.includesComponent( shortestSide ) ) ) {

        // multiple sides of the same "longest" length, pluralize
        shortestSubString = StringUtils.fillIn( shortestSidesDescriptionPatternStringProperty, {
          description: shortestSideDescription
        } );
      }
      else {
        shortestSubString = StringUtils.fillIn( shortestSideDescriptionPatternStringProperty, {
          description: shortestSideDescription
        } );
      }

      description = StringUtils.fillIn( sideLengthDescriptionPatternStringProperty, {
        longest: longestSubString,
        shortest: shortestSubString
      } );
    }

    return description;
  }

  /**
   * The fifth statement of the "details" button in the Voicing toolbar. Returns a description of the widest and
   * smallest angles of the shape. Only returns a string if corner guides are displayed - otherwise this more
   * quantitative content is skipped.
   */
  public getFifthDetailsStatement(): NullableQuadrilateralStringType {
    let description: NullableQuadrilateralStringType = null;

    if ( !this.markersVisibleProperty.value ) {
      return description;
    }
    else {
      const widestVertex = _.maxBy( this.shapeModel.vertices, vertex => vertex.angleProperty.value )!;
      const smallestVertex = _.minBy( this.shapeModel.vertices, vertex => vertex.angleProperty.value )!;

      const widestVertexDescription = this.getDetailsWedgesDescription( widestVertex.angleProperty.value! );
      const smallestVertexDescription = this.getDetailsWedgesDescription( smallestVertex.angleProperty.value! );

      if ( this.shapeModel.getAreAllAnglesRight() ) {

        // All corners the same angle, combine into a shorter string
        description = cornersRightDescriptionStringProperty;
      }
      else {

        let longestSubString;
        let shortestSubString;
        if ( _.some( this.shapeModel.oppositeEqualVertexPairsProperty.value, oppositeEQualVertexPair => oppositeEQualVertexPair.includesComponent( widestVertex ) ) ||
             _.some( this.shapeModel.adjacentEqualVertexPairsProperty.value, adjacentEqualVertexPair => adjacentEqualVertexPair.includesComponent( widestVertex ) ) ) {

          // multiple vertices of the same "widest" angle, pluralize
          longestSubString = StringUtils.fillIn( widestCornersDescriptionPatternStringProperty, {
            description: widestVertexDescription
          } );
        }
        else {
          longestSubString = StringUtils.fillIn( widestCornerDescriptionPatternStringProperty, {
            description: widestVertexDescription
          } );
        }

        if ( _.some( this.shapeModel.oppositeEqualVertexPairsProperty.value, oppositeEqualVertexPair => oppositeEqualVertexPair.includesComponent( smallestVertex ) ) ||
             _.some( this.shapeModel.adjacentEqualVertexPairsProperty.value, adjacentEqualVertexPair => adjacentEqualVertexPair.includesComponent( smallestVertex ) ) ) {

          // multiple sides of the same "longest" length, pluralize
          shortestSubString = StringUtils.fillIn( smallestCornersDescriptionPatternStringProperty, {
            description: smallestVertexDescription
          } );
        }
        else {
          shortestSubString = StringUtils.fillIn( smallestCornerDescriptionPatternStringProperty, {
            description: smallestVertexDescription
          } );
        }

        description = StringUtils.fillIn( cornersDescriptionPatternStringProperty, {
          longest: longestSubString,
          shortest: shortestSubString
        } );
      }

      return description;
    }
  }

  /**
   * For the details button, we are going to describe 'flat' angles as the number of wedges as a special case because
   * in english it sounds nicer when combined with other details content.
   */
  private getDetailsWedgesDescription( angle: number ): NullableQuadrilateralStringType {
    let descriptionString;
    if ( this.shapeModel.isFlatAngle( angle ) ) {
      descriptionString = StringUtils.fillIn( numberOfWedgesPatternStringProperty, {
        numberOfWedges: 6
      } );
    }
    else {
      descriptionString = QuadrilateralVertexDescriber.getWedgesDescription( angle, this.shapeModel );
    }

    return descriptionString;
  }

  /**
   * Returns a qualitative description for a square.
   */
  public getSquareDetailsString(): TReadOnlyProperty<string> {
    return allRightAnglesAllSidesEqualStringProperty;
  }

  /**
   * Returns a qualitative deqcription for a rectangle.
   */
  public getRectangleDetailsString(): TReadOnlyProperty<string> {
    return allRightAnglesStringProperty;
  }

  /**
   * Returns a qualitative description for a rhombus.
   */
  public getRhombusDetailsString(): TReadOnlyProperty<string> {
    return allSidesEqualStringProperty;
  }

  /**
   * Returns a qualitative description for a parallelogram.
   */
  public getParallelogramDetailsString(): TReadOnlyProperty<string> {
    return oppositeSidesInParallelStringProperty;
  }

  /**
   * Returns a qualitative description for a trapezoid.
   */
  public getTrapezoidDetailsString( parallelSidePair: QuadrilateralSidePair ): string {

    let firstSideLabel: QuadrilateralStringType;
    let secondSideLabel: QuadrilateralStringType;

    if ( parallelSidePair.includesComponent( this.shapeModel.sideAB ) ) {
      firstSideLabel = QuadrilateralDescriber.getSideLabelString( QuadrilateralSideLabel.SIDE_AB );
      secondSideLabel = QuadrilateralDescriber.getSideLabelString( QuadrilateralSideLabel.SIDE_CD );
    }
    else {
      firstSideLabel = QuadrilateralDescriber.getSideLabelString( QuadrilateralSideLabel.SIDE_BC );
      secondSideLabel = QuadrilateralDescriber.getSideLabelString( QuadrilateralSideLabel.SIDE_DA );
    }

    return StringUtils.fillIn( trapezoidDetailsPatternStringProperty, {
      firstSide: firstSideLabel,
      secondSide: secondSideLabel
    } );
  }

  /**
   * Returns a qualitative description for an isosceles trapezoid. Indicates which opposite/parallel side
   * pairs are equal.
   */
  public getIsoscelesTrapezoidDetailsString( oppositeEqualSidePair: QuadrilateralSidePair, parallelSidePair: QuadrilateralSidePair ): string {
    let equalFirstSideString: QuadrilateralStringType;
    let equalSecondSideString: QuadrilateralStringType;
    let parallelFirstSideString: QuadrilateralStringType;
    let parallelSecondSideString: QuadrilateralStringType;

    if ( oppositeEqualSidePair.includesComponent( this.shapeModel.sideAB ) ) {

      // top sides and bottom side are equal in length, left and right sides are parallel
      equalFirstSideString = QuadrilateralDescriber.getSideLabelString( QuadrilateralSideLabel.SIDE_AB );
      equalSecondSideString = QuadrilateralDescriber.getSideLabelString( QuadrilateralSideLabel.SIDE_CD );
      parallelFirstSideString = QuadrilateralDescriber.getSideLabelString( QuadrilateralSideLabel.SIDE_DA );
      parallelSecondSideString = QuadrilateralDescriber.getSideLabelString( QuadrilateralSideLabel.SIDE_BC );
    }
    else {

      // left and right sides are equal in length, top and bottom sides are parallel
      equalFirstSideString = QuadrilateralDescriber.getSideLabelString( QuadrilateralSideLabel.SIDE_DA );
      equalSecondSideString = QuadrilateralDescriber.getSideLabelString( QuadrilateralSideLabel.SIDE_BC );
      parallelFirstSideString = QuadrilateralDescriber.getSideLabelString( QuadrilateralSideLabel.SIDE_AB );
      parallelSecondSideString = QuadrilateralDescriber.getSideLabelString( QuadrilateralSideLabel.SIDE_CD );
    }

    return StringUtils.fillIn( isoscelesTrapezoidDetailsPatternStringProperty, {
      equalFirstSide: equalFirstSideString,
      equalSecondSide: equalSecondSideString,
      parallelFirstSide: parallelFirstSideString,
      parallelSecondSide: parallelSecondSideString
    } );
  }

  /**
   * Returns a qualitative description for a kite.
   * @param oppositeEqualVertexPair
   * @param patternString - Some contexts need a more verbose description around this pattern. Must include placeholders
   *                        `firstCorner` and `secondCorner`.
   */
  public getKiteDetailsString( oppositeEqualVertexPair: QuadrilateralVertexPair, patternString: TReadOnlyProperty<string> = kiteDetailsShortPatternStringProperty ): string {
    let firstCornerStringProperty: TReadOnlyProperty<string>;
    let secondCornerStringProperty: TReadOnlyProperty<string>;
    if ( oppositeEqualVertexPair.includesComponent( this.shapeModel.vertexA ) ) {

      // opposite equal vertices for the kite are A and C
      firstCornerStringProperty = QuadrilateralDescriber.getVertexLabelString( QuadrilateralVertexLabel.VERTEX_A );
      secondCornerStringProperty = QuadrilateralDescriber.getVertexLabelString( QuadrilateralVertexLabel.VERTEX_C );
    }
    else {
      firstCornerStringProperty = QuadrilateralDescriber.getVertexLabelString( QuadrilateralVertexLabel.VERTEX_B );
      secondCornerStringProperty = QuadrilateralDescriber.getVertexLabelString( QuadrilateralVertexLabel.VERTEX_D );
    }

    return StringUtils.fillIn( patternString, {
      firstCorner: firstCornerStringProperty,
      secondCorner: secondCornerStringProperty
    } );
  }

  /**
   * Returns a qualitative description for a dart.
   * @param patternString - Some contexts need a more verbose description around this pattern. Must include placeholders
   *                        `firstCorner` and `secondCorner`.
   */
  public getDartDetailsString( patternString: TReadOnlyProperty<string> = dartDetailsShortPatternStringProperty ): string {
    const concaveVertex = this.shapeModel.vertices.find( vertex => vertex.angleProperty.value! > Math.PI )!;
    assert && assert( concaveVertex, 'A dart has one vertex with angle greater than Math.PI.' );

    const inwardCornerLabel = concaveVertex.vertexLabel;

    // the vertices with equal angles for a dart will be the ones adjacent to the inward vertex
    let firstCornerLabel: QuadrilateralVertexLabel;
    let secondCornerLabel: QuadrilateralVertexLabel;
    if ( inwardCornerLabel === QuadrilateralVertexLabel.VERTEX_A || inwardCornerLabel === QuadrilateralVertexLabel.VERTEX_C ) {
      firstCornerLabel = QuadrilateralVertexLabel.VERTEX_B;
      secondCornerLabel = QuadrilateralVertexLabel.VERTEX_D;
    }
    else {
      firstCornerLabel = QuadrilateralVertexLabel.VERTEX_A;
      secondCornerLabel = QuadrilateralVertexLabel.VERTEX_C;
    }

    return StringUtils.fillIn( patternString, {
      inwardCorner: QuadrilateralDescriber.getVertexLabelString( inwardCornerLabel ),
      firstCorner: QuadrilateralDescriber.getVertexLabelString( firstCornerLabel ),
      secondCorner: QuadrilateralDescriber.getVertexLabelString( secondCornerLabel )
    } );
  }

  /**
   * Returns a qualitative description for a concave quadrilateral, describing which vertex is pointing in
   * toward the shape.
   */
  public getConcaveQuadrilateralDetailsString(): string {
    const concaveVertex = this.shapeModel.vertices.find( vertex => vertex.angleProperty.value! > Math.PI )!;
    assert && assert( concaveVertex, 'A convex quad has one vertex with angle greater than Math.PI.' );
    const inwardCornerLabel = concaveVertex.vertexLabel;

    return StringUtils.fillIn( concaveQuadrilateralDetailsPatternStringProperty, {
      inwardCorner: QuadrilateralDescriber.getVertexLabelString( inwardCornerLabel )
    } );
  }

  /**
   * Returns a qualitative description of the convex quadrilateral.
   */
  public getConvexQuadrilateralDetailsString(): TReadOnlyProperty<string> {
    return convexQuadrilateralDetailsStringProperty;
  }

  /**
   * Returns a qualitative description for a triangle, calling out which vertex looks "flat".
   */
  public getTriangleDetailsString(): string {

    const flatVertex = this.shapeModel.vertices.find(
      vertex => this.shapeModel.isStaticAngleEqualToOther( vertex.angleProperty.value!, Math.PI )
    )!;
    assert && assert( flatVertex, 'A triangle has one vertex with an angle equal to Math.PI.' );

    return StringUtils.fillIn( triangleDetailsPatternStringProperty, {
      flatCorner: QuadrilateralDescriber.getVertexLabelString( flatVertex.vertexLabel )
    } );
  }

  /**
   * Returns a ResponsePacket with the content for responses that should be included when the shape (and only the shape)
   * is reset.
   */
  public static readonly RESET_SHAPE_RESPONSE_PACKET = new ResponsePacket( {
    nameResponse: resetShapeStringProperty,
    contextResponse: resetShapeContextResponseStringProperty
  } );
}

quadrilateral.register( 'QuadrilateralDescriber', QuadrilateralDescriber );
