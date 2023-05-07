// Copyright 2021-2023, University of Colorado Boulder

/**
 * A model component for the components of the actual quadrilateral geometry/shape. This includes subcomponents
 * for vertices and sides. It also holds state for geometric properties such as shape area, pairs of equal side
 * lengths, vertex angles, and parallel sides.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import quadrilateral from '../../quadrilateral.js';
import NamedQuadrilateral from './NamedQuadrilateral.js';
import QuadrilateralSide from './QuadrilateralSide.js';
import QuadrilateralVertex from './QuadrilateralVertex.js';
import Utils from '../../../../dot/js/Utils.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import QuadrilateralQueryParameters from '../QuadrilateralQueryParameters.js';
import QuadrilateralVertexLabel from './QuadrilateralVertexLabel.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ParallelSideChecker from './ParallelSideChecker.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import TProperty from '../../../../axon/js/TProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import TEmitter from '../../../../axon/js/TEmitter.js';
import QuadrilateralShapeDetector from './QuadrilateralShapeDetector.js';
import QuadrilateralSidePair from './QuadrilateralSidePair.js';
import QuadrilateralVertexPair from './QuadrilateralVertexPair.js';
import QuadrilateralUtils from './QuadrilateralUtils.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import QuadrilateralSideLabel from './QuadrilateralSideLabel.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';

// Used when verifying that QuadrilateralVertex positions are valid before setting to the model.
export type VertexLabelToProposedPositionMap = Map<QuadrilateralVertexLabel, Vector2>;

type QuadrilateralShapeModelOptions = {

  // If true, the shape gets tested to make sure it is valid. This means no overlapping vertices and no crossed
  // sides.
  validateShape?: boolean;
  tandem?: Tandem;
};

export default class QuadrilateralShapeModel {

  // Vertices of the quadrilateral.
  public readonly vertexA: QuadrilateralVertex;
  public readonly vertexB: QuadrilateralVertex;
  public readonly vertexC: QuadrilateralVertex;
  public readonly vertexD: QuadrilateralVertex;
  public readonly vertices: readonly QuadrilateralVertex[];

  // Sides of the quadrilateral.
  public readonly sideAB: QuadrilateralSide;
  public readonly sideBC: QuadrilateralSide;
  public readonly sideCD: QuadrilateralSide;
  public readonly sideDA: QuadrilateralSide;
  public readonly sides: readonly QuadrilateralSide[];

  // Monitors angles of the shape to determine when pairs of opposite sides are parallel.
  public readonly sideABSideCDParallelSideChecker: ParallelSideChecker;
  public readonly sideBCSideDAParallelSideChecker: ParallelSideChecker;
  public readonly parallelSideCheckers: readonly ParallelSideChecker[];

  // Whether the quadrilateral is a parallelogram.
  private _isParallelogram: boolean;

  // True when all angles of the quadrilateral are right angles within interAngleToleranceInterval.
  private _areAllAnglesRight: boolean;

  // True when all lengths of the quadrilateral are equal within the lengthToleranceInterval.
  private _areAllLengthsEqual: boolean;

  // The area of the quadrilateral. Updated in "deferred" Properties, only after positions of all four vertices are
  // determined.
  public readonly areaProperty: TProperty<number>;

  // The tolerance intervals for angle and length comparisons when comparing two angle/lengths with one another.
  // These values are generally larger than "static" angle tolerance intervals to account for compounding error
  // when comparing angles. For example, we want a bit more flexibility when comparing angles of a trapezoid or else
  // it would be incredibly difficult to find that shape.
  public readonly interAngleToleranceInterval: number;
  public readonly interLengthToleranceInterval: number;

  // The tolerance interval for angle comparisons when comparing a vertex angle with a static value. This
  // tolerance interval will generally be smaller than the "inter" intervals because we don't want much wiggle room
  // when detecting critical angles. For example, the angle needs to be very close to Math.PI / 2 to be considered
  // a "right angle" and make the "right angle indicators" appear.
  public readonly staticAngleToleranceInterval: number;

  // Emits an event whenever the shape of the Quadrilateral changes
  public readonly shapeChangedEmitter: TEmitter;

  // The name of the quadrilateral (like square/rhombus/trapezoid, etc). Will be null if it is a random
  // unnamed shape.
  public readonly shapeNameProperty: EnumerationProperty<NamedQuadrilateral>;

  // A map that provides the adjacent vertices to the provided QuadrilateralVertex.
  public readonly adjacentVertexMap: Map<QuadrilateralVertex, QuadrilateralVertex[]>;

  // A map that provides the opposite vertex from a give vertex.
  public readonly oppositeVertexMap: Map<QuadrilateralVertex, QuadrilateralVertex>;

  // A map that provides the adjacent sides to the provided QuadrilateralSide.
  public readonly adjacentSideMap: Map<QuadrilateralSide, QuadrilateralSide[]>;

  // A map that provides the opposite side from the provided QuadrilateralSide.
  public readonly oppositeSideMap: Map<QuadrilateralSide, QuadrilateralSide>;

  // An array of all the adjacent VertexPairs that currently have equal angles.
  public readonly adjacentEqualVertexPairsProperty: Property<QuadrilateralVertexPair[]>;

  // An array of all the opposite VertexPairs that currently have equal angles.
  public readonly oppositeEqualVertexPairsProperty: Property<QuadrilateralVertexPair[]>;

  // An array of all the adjacent SidePairs that have equal lengths.
  public readonly adjacentEqualSidePairsProperty: Property<QuadrilateralSidePair[]>;

  // An array of all the opposite SidePairs that have equal side lengths.
  public readonly oppositeEqualSidePairsProperty: Property<QuadrilateralSidePair[]>;

  // An array of all the (opposite) SidePairs that currently parallel with each other.
  public readonly parallelSidePairsProperty: Property<QuadrilateralSidePair[]>;

  // Is the simulation *not* being reset?
  private readonly resetNotInProgressProperty: TProperty<boolean>;

  // True when the Properties of the shape are currently being deferred, preventing listeners from being called and
  // new values from being set.
  private propertiesDeferred: boolean;

  // If true, the shape is tested to make sure it is valid (no overlapping vertices or crossed sides).
  private readonly validateShape: boolean;

  public constructor( resetNotInProgressProperty: TProperty<boolean>, smoothingLengthProperty: TReadOnlyProperty<number>, providedOptions?: QuadrilateralShapeModelOptions ) {

    const options = optionize<QuadrilateralShapeModelOptions, QuadrilateralShapeModelOptions>()( {
      validateShape: true,
      tandem: Tandem.OPTIONAL
    }, providedOptions );

    this.validateShape = options.validateShape;

    this._isParallelogram = false;
    this._areAllAnglesRight = false;
    this._areAllLengthsEqual = false;

    this.vertexA = new QuadrilateralVertex( new Vector2( -0.25, 0.25 ), QuadrilateralVertexLabel.VERTEX_A, smoothingLengthProperty, options.tandem.createTandem( 'vertexA' ) );
    this.vertexB = new QuadrilateralVertex( new Vector2( 0.25, 0.25 ), QuadrilateralVertexLabel.VERTEX_B, smoothingLengthProperty, options.tandem.createTandem( 'vertexB' ) );
    this.vertexC = new QuadrilateralVertex( new Vector2( 0.25, -0.25 ), QuadrilateralVertexLabel.VERTEX_C, smoothingLengthProperty, options.tandem.createTandem( 'vertexC' ) );
    this.vertexD = new QuadrilateralVertex( new Vector2( -0.25, -0.25 ), QuadrilateralVertexLabel.VERTEX_D, smoothingLengthProperty, options.tandem.createTandem( 'vertexD' ) );
    this.vertices = [ this.vertexA, this.vertexB, this.vertexC, this.vertexD ];

    this.oppositeVertexMap = new Map( [
      [ this.vertexA, this.vertexC ],
      [ this.vertexB, this.vertexD ],
      [ this.vertexC, this.vertexA ],
      [ this.vertexD, this.vertexB ]
    ] );

    this.adjacentVertexMap = new Map( [
      [ this.vertexA, [ this.vertexB, this.vertexD ] ],
      [ this.vertexB, [ this.vertexA, this.vertexC ] ],
      [ this.vertexC, [ this.vertexB, this.vertexD ] ],
      [ this.vertexD, [ this.vertexA, this.vertexC ] ]
    ] );

    this.sideAB = new QuadrilateralSide( this.vertexA, this.vertexB, QuadrilateralSideLabel.SIDE_AB, options.tandem.createTandem( 'sideAB' ) );
    this.sideBC = new QuadrilateralSide( this.vertexB, this.vertexC, QuadrilateralSideLabel.SIDE_BC, options.tandem.createTandem( 'sideBC' ) );
    this.sideCD = new QuadrilateralSide( this.vertexC, this.vertexD, QuadrilateralSideLabel.SIDE_CD, options.tandem.createTandem( 'sideCD' ) );
    this.sideDA = new QuadrilateralSide( this.vertexD, this.vertexA, QuadrilateralSideLabel.SIDE_DA, options.tandem.createTandem( 'sideDA' ) );
    this.sides = [ this.sideAB, this.sideBC, this.sideCD, this.sideDA ];

    this.oppositeSideMap = new Map( [
      [ this.sideAB, this.sideCD ],
      [ this.sideBC, this.sideDA ],
      [ this.sideCD, this.sideAB ],
      [ this.sideDA, this.sideBC ]
    ] );

    this.adjacentSideMap = new Map( [
      [ this.sideAB, [ this.sideDA, this.sideBC ] ],
      [ this.sideBC, [ this.sideAB, this.sideCD ] ],
      [ this.sideCD, [ this.sideBC, this.sideDA ] ],
      [ this.sideDA, [ this.sideCD, this.sideAB ] ]
    ] );

    this.adjacentEqualVertexPairsProperty = new Property<QuadrilateralVertexPair[]>( [] );
    this.oppositeEqualVertexPairsProperty = new Property<QuadrilateralVertexPair[]>( [] );
    this.adjacentEqualSidePairsProperty = new Property<QuadrilateralSidePair[]>( [] );
    this.oppositeEqualSidePairsProperty = new Property<QuadrilateralSidePair[]>( [] );
    this.parallelSidePairsProperty = new Property<QuadrilateralSidePair[]>( [] );

    // Connect the sides, creating the shape and giving vertices the information they need to calculate angles.
    this.sideBC.connectToSide( this.sideAB );
    this.sideCD.connectToSide( this.sideBC );
    this.sideDA.connectToSide( this.sideCD );
    this.sideAB.connectToSide( this.sideDA );

    this.shapeNameProperty = new EnumerationProperty( NamedQuadrilateral.CONVEX_QUADRILATERAL, {
      tandem: options.tandem.createTandem( 'shapeNameProperty' )
    } );

    this.areaProperty = new NumberProperty( 0, {
      tandem: options.tandem.createTandem( 'areaProperty' )
    } );

    this.shapeChangedEmitter = new Emitter<[]>( {
      tandem: options.tandem.createTandem( 'shapeChangedEmitter' )
    } );

    this.interAngleToleranceInterval = QuadrilateralShapeModel.getWidenedToleranceInterval( QuadrilateralQueryParameters.interAngleToleranceInterval );
    this.staticAngleToleranceInterval = QuadrilateralShapeModel.getWidenedToleranceInterval( QuadrilateralQueryParameters.staticAngleToleranceInterval );
    this.interLengthToleranceInterval = QuadrilateralShapeModel.getWidenedToleranceInterval( QuadrilateralQueryParameters.interLengthToleranceInterval );

    this.sideABSideCDParallelSideChecker = new ParallelSideChecker(
      new QuadrilateralSidePair( this.sideAB, this.sideCD ),
      this.shapeChangedEmitter,
      options.tandem.createTandem( 'sideABSideCDParallelSideChecker' )
    );

    this.sideBCSideDAParallelSideChecker = new ParallelSideChecker(
      new QuadrilateralSidePair( this.sideBC, this.sideDA ),
      this.shapeChangedEmitter,
      options.tandem.createTandem( 'sideBCSideDAParallelSideChecker' )
    );

    this.parallelSideCheckers = [
      this.sideABSideCDParallelSideChecker,
      this.sideBCSideDAParallelSideChecker
    ];

    this.resetNotInProgressProperty = resetNotInProgressProperty;

    this.propertiesDeferred = false;

    Multilink.multilink( [
        this.vertexA.positionProperty,
        this.vertexB.positionProperty,
        this.vertexC.positionProperty,
        this.vertexD.positionProperty ],
      ( position1, position2, position3, position4 ) => {

        // Update geometric attributes after QuadrilateralVertex positions have changed.
        this.updateOrderDependentProperties();

        // notify a change in shape, after updating geometric attributes
        this.shapeChangedEmitter.emit();

        // After the shape has changed, update the areas of allowed motion for each QuadrilateralVertex.
        this.setVertexDragAreas();
      }
    );

    this.vertices.forEach( vertex => {
      vertex.modelBoundsProperty.link( vertexBounds => {

        // smallest possible interval for controlling the vertex positions, over two so that we know when the vertex
        // touches model bounds.
        const halfSmallestInterval = QuadrilateralConstants.MINOR_REDUCED_SIZE_VERTEX_INTERVAL / 2;
        vertex.topConstrainedProperty.value = Utils.equalsEpsilon( vertexBounds.maxY, QuadrilateralConstants.MODEL_BOUNDS.maxY, halfSmallestInterval );
        vertex.rightConstrainedProperty.value = Utils.equalsEpsilon( vertexBounds.maxX, QuadrilateralConstants.MODEL_BOUNDS.maxX, halfSmallestInterval );
        vertex.bottomConstrainedProperty.value = Utils.equalsEpsilon( vertexBounds.minY, QuadrilateralConstants.MODEL_BOUNDS.minY, halfSmallestInterval );
        vertex.leftConstrainedProperty.value = Utils.equalsEpsilon( vertexBounds.minX, QuadrilateralConstants.MODEL_BOUNDS.minX, halfSmallestInterval );
      } );
    } );
  }

  /**
   * Returns true when all angles are right (within staticAngleToleranceInterval).
   */
  public getAreAllAnglesRight(): boolean {
    return this._areAllAnglesRight;
  }

  /**
   * Update value tracking when all angles are equal. To be called in updateOrderDependentProperties.
   */
  private updateAreAllAnglesRight(): void {
    this._areAllAnglesRight = _.every( this.vertices, vertex => this.isRightAngle( vertex.angleProperty.value! ) );
  }

  /**
   * Returns true when all lengths are equal.
   */
  public getAreAllLengthsEqual(): boolean {
    return this._areAllLengthsEqual;
  }

  /**
   * Update value tracking all equal side lengths. To be called in updateOrderDependentProperties.
   */
  private updateAreAllLengthsEqual(): void {
    this._areAllLengthsEqual = this.isInterLengthEqualToOther( this.sideAB.lengthProperty.value, this.sideBC.lengthProperty.value ) &&
                               this.isInterLengthEqualToOther( this.sideBC.lengthProperty.value, this.sideCD.lengthProperty.value ) &&
                               this.isInterLengthEqualToOther( this.sideCD.lengthProperty.value, this.sideDA.lengthProperty.value ) &&
                               this.isInterLengthEqualToOther( this.sideDA.lengthProperty.value, this.sideAB.lengthProperty.value );
  }

  /**
   * Returns the area of the quadrilateral. Uses Bretschneider's formula for the area of a general quadrilateral,
   * see https://en.wikipedia.org/wiki/Bretschneider%27s_formula.
   *
   * Requires side lengths and vertex angles to be up-to-date, must be used in updateOrderDependentProperties.
   */
  private getArea(): number {
    const a = this.sideAB.lengthProperty.value;
    const b = this.sideBC.lengthProperty.value;
    const c = this.sideCD.lengthProperty.value;
    const d = this.sideDA.lengthProperty.value;

    // can be any two opposite angles
    const firstAngle = this.vertexA.angleProperty.value!;
    const secondAngle = this.vertexC.angleProperty.value!;

    // semiperimeter
    const s = ( a + b + c + d ) / 2;

    const cosArg = Math.cos( ( firstAngle + secondAngle ) / 2 );
    const area = Math.sqrt( ( s - a ) * ( s - b ) * ( s - c ) * ( s - d ) - ( a * b * c * d ) * cosArg * cosArg );

    const isAreaNaN = isNaN( area );

    // A vertex might be overlapped with a side or another QuadrilateralVertex in the "test" shape while we are trying to find
    // a good vertex position. Gracefully handle this by returning an area of zero (area is NaN/undefined otherwise).
    if ( this.validateShape ) {
      assert && assert( !isAreaNaN, 'Area is not defined for the quadrilateral shape' );
    }
    return isAreaNaN ? 0 : area;
  }

  /**
   * Returns true if the two angles are equal withing angleToleranceInterval.
   */
  public isInterAngleEqualToOther( angle1: number, angle2: number ): boolean {
    return Utils.equalsEpsilon( angle1, angle2, this.interAngleToleranceInterval );
  }

  /**
   * Returns true if the lengths are equal to each other within interLengthToleranceInterval.
   */
  public isInterLengthEqualToOther( length1: number, length2: number ): boolean {
    return Utils.equalsEpsilon( length1, length2, this.interLengthToleranceInterval );
  }

  /**
   * Returns true if the angle is a right angle, within staticAngleToleranceInterval.
   */
  public isRightAngle( angle: number ): boolean {
    return Utils.equalsEpsilon( angle, Math.PI / 2, this.staticAngleToleranceInterval );
  }

  /**
   * Returns true when the shape is a parallelogram.
   */
  public isParallelogram(): boolean {
    return this._isParallelogram;
  }

  /**
   * Returns true if two angles are equal within staticAngleToleranceInterval. See that value for more
   * information.
   */
  public isStaticAngleEqualToOther( angle: number, otherAngle: number ): boolean {
    return Utils.equalsEpsilon( angle, otherAngle, this.staticAngleToleranceInterval );
  }

  /**
   * Returns true if the angle is equal to PI within staticAngleToleranceInterval.
   */
  public isFlatAngle( angle: number ): boolean {
    return this.isStaticAngleEqualToOther( angle, Math.PI );
  }

  /**
   * Set multiple vertex positions at once, updating each and then calling relevant Property listeners after
   * all are set. This way you can safely set multiple at a time without transient states where the shape is
   * not valid.
   */
  public setVertexPositions( labelToPositionMap: VertexLabelToProposedPositionMap ): void {

    this.setPropertiesDeferred( true );

    labelToPositionMap.forEach( ( positionValue, labelKey ) => {
      const vertex = this.getLabelledVertex( labelKey );

      // this is a new Vector2 instance so even if x,y values are the same as the old value it will trigger
      // listeners without this check
      if ( !positionValue.equals( vertex.positionProperty.value ) ) {
        vertex.positionProperty.value = positionValue;
      }
    } );

    // un-defer all so that all Properties and calls callbacks
    this.setPropertiesDeferred( false );
  }

  /**
   * Update Properties that need to be calculated in sequence to have correct values. Positions need to update,
   * then angles and lengths, then Properties tracking pairs of equal lengths and angles, then parallelogram state,
   * and finally shape name. If shape name or parallelogram state is calculated before shape properties, their values
   * will be incorrect.
   */
  public updateOrderDependentProperties(): void {

    // update angles
    this.vertices.forEach( vertex => {
      vertex.updateAngle();
    } );

    // update lengths
    this.sides.forEach( side => {
      side.updateLengthAndShape();
    } );

    // pairs of parallel sides
    this.updateParallelSideProperties();

    // pairs of equal vertex angles and side lengths
    this.updateVertexAngleComparisons();
    this.updateSideLengthComparisons();

    // other shape attributes
    this.areaProperty.set( this.getArea() );
    this.updateAreAllAnglesRight();
    this.updateAreAllLengthsEqual();

    // the detected shape name
    this.shapeNameProperty.set( QuadrilateralShapeDetector.getShapeName( this ) );
  }

  /**
   * Update Properties for angle comparisons - pairs of equal opposite and equal adjacent angles.
   */
  private updateVertexAngleComparisons(): void {
    this.updateEqualVertexPairs( this.adjacentEqualVertexPairsProperty, this.adjacentVertexMap );
    this.updateEqualVertexPairs( this.oppositeEqualVertexPairsProperty, this.oppositeVertexMap );
  }

  /**
   * Update a provided Property that holds a list of equal angles (either opposite or adjacent).
   */
  private updateEqualVertexPairs( equalVertexPairsProperty: Property<QuadrilateralVertexPair[]>, vertexMap: Map<QuadrilateralVertex, QuadrilateralVertex[] | QuadrilateralVertex> ): void {
    const currentVertexPairs = equalVertexPairsProperty.value;
    vertexMap.forEach( ( relatedVertices, keyVertex, map ) => {

      const relatedVerticesArray = Array.isArray( relatedVertices ) ? relatedVertices : [ relatedVertices ];
      relatedVerticesArray.forEach( relatedVertex => {
        const vertexPair = new QuadrilateralVertexPair( keyVertex, relatedVertex );

        const firstAngle = vertexPair.component1.angleProperty.value!;
        const secondAngle = vertexPair.component2.angleProperty.value!;
        const areAnglesEqual = this.isInterAngleEqualToOther( firstAngle, secondAngle );
        const indexOfVertexPair = _.findIndex( currentVertexPairs, currentVertexPair => currentVertexPair.equals( vertexPair ) );
        const currentlyIncludesVertexPair = indexOfVertexPair > -1;

        if ( currentlyIncludesVertexPair && !areAnglesEqual ) {

          // the QuadrilateralVertexPair needs to be removed because angles are no longer equal
          currentVertexPairs.splice( indexOfVertexPair, 1 );
          equalVertexPairsProperty.notifyListenersStatic();
        }
        else if ( !currentlyIncludesVertexPair && areAnglesEqual ) {

          // the QuadrilateralVertexPair needs to be added because they just became equal
          currentVertexPairs.push( vertexPair );
          equalVertexPairsProperty.notifyListenersStatic();
        }
      } );
    } );
  }

  /**
   * Update Properties for side length comparisons - either opposite or adjacent sides.
   */
  private updateSideLengthComparisons(): void {
    this.updateEqualSidePairs( this.adjacentEqualSidePairsProperty, this.adjacentSideMap );
    this.updateEqualSidePairs( this.oppositeEqualSidePairsProperty, this.oppositeSideMap );
  }

  /**
   * Update a provided Property holding a list of sides that are equal in length (either opposite or adjacent).
   */
  private updateEqualSidePairs( equalSidePairsProperty: Property<QuadrilateralSidePair[]>, sideMap: Map<QuadrilateralSide, QuadrilateralSide[] | QuadrilateralSide> ): void {
    const currentSidePairs = equalSidePairsProperty.value;

    sideMap.forEach( ( relatedSides, keySide ) => {

      const relatedSidesArray = Array.isArray( relatedSides ) ? relatedSides : [ relatedSides ];
      relatedSidesArray.forEach( relatedSide => {
        const sidePair = new QuadrilateralSidePair( keySide, relatedSide );

        const firstLength = sidePair.component1.lengthProperty.value;
        const secondLength = sidePair.component2.lengthProperty.value;
        const areLengthsEqual = this.isInterLengthEqualToOther( firstLength, secondLength );
        const indexOfSidePair = _.findIndex( currentSidePairs, currentSidePair => currentSidePair.equals( sidePair ) );
        const currentlyIncludesSidePair = indexOfSidePair > -1;

        if ( currentlyIncludesSidePair && !areLengthsEqual ) {

          // the QuadrilateralVertexPair needs to be removed because angles are no longer equal
          currentSidePairs.splice( indexOfSidePair, 1 );
          equalSidePairsProperty.notifyListenersStatic();
        }
        else if ( !currentlyIncludesSidePair && areLengthsEqual ) {

          // the QuadrilateralVertexPair needs to be added because they just became equal
          currentSidePairs.push( sidePair );
          equalSidePairsProperty.notifyListenersStatic();
        }
      } );
    } );
  }

  /**
   * Updates Properties related to opposite sides that are parallel, and whether this shape is a parallelogram. To be
   * used in updateOrderDependentProperties.
   */
  private updateParallelSideProperties(): void {
    const sideABSideCDParallel = this.sideABSideCDParallelSideChecker.areSidesParallel();
    const sideBCSideDAParallel = this.sideBCSideDAParallelSideChecker.areSidesParallel();

    this._isParallelogram = sideABSideCDParallel && sideBCSideDAParallel;

    const previousParallelSidePairs = this.parallelSidePairsProperty.value;
    const currentParallelSidePairs = [];
    if ( sideABSideCDParallel ) {
      currentParallelSidePairs.push( this.sideABSideCDParallelSideChecker.sidePair );
    }
    if ( sideBCSideDAParallel ) {
      currentParallelSidePairs.push( this.sideBCSideDAParallelSideChecker.sidePair );
    }

    if ( !_.isEqual( previousParallelSidePairs, currentParallelSidePairs ) ) {
      this.parallelSidePairsProperty.value = currentParallelSidePairs;
    }
  }

  /**
   * Sets this model to be the same as the provided QuadrilateralShapeModel by setting QuadrilateralVertex positions.
   */
  public setFromShape( other: QuadrilateralShapeModel ): void {

    // Since we are updating many vertices at once, we need to defer callbacks until all positions are set. Otherwise,
    // callbacks will be called for a potentially disallowed shape.
    this.setPropertiesDeferred( true );

    this.vertexA.positionProperty.set( other.vertexA.positionProperty.value );
    this.vertexB.positionProperty.set( other.vertexB.positionProperty.value );
    this.vertexC.positionProperty.set( other.vertexC.positionProperty.value );
    this.vertexD.positionProperty.set( other.vertexD.positionProperty.value );

    this.setPropertiesDeferred( false );
  }

  /**
   * Get the vertex of this shape model with the provided vertexLabel.
   */
  public getLabelledVertex( vertexLabel: QuadrilateralVertexLabel ): QuadrilateralVertex {
    const labelledVertex = _.find( this.vertices, vertex => vertex.vertexLabel === vertexLabel );

    assert && assert( labelledVertex, 'Could not find labelled vertex' );
    return labelledVertex!;
  }

  /**
   * Update the drag areas for all vertices.
   */
  private setVertexDragAreas(): void {

    // available drag areas go way outside of model bounds, constraint within model bounds is implemented by
    // a bounds.closestPointTo check to support smooth movement around the edge of bounds
    const dilatedBounds = QuadrilateralConstants.MODEL_BOUNDS.dilated( 1 );

    this.vertexA.dragAreaProperty.set( QuadrilateralUtils.createVertexArea( dilatedBounds, this.vertexA, this.vertexB, this.vertexC, this.vertexD, this.validateShape ) );
    this.vertexB.dragAreaProperty.set( QuadrilateralUtils.createVertexArea( dilatedBounds, this.vertexB, this.vertexC, this.vertexD, this.vertexA, this.validateShape ) );
    this.vertexC.dragAreaProperty.set( QuadrilateralUtils.createVertexArea( dilatedBounds, this.vertexC, this.vertexD, this.vertexA, this.vertexB, this.validateShape ) );
    this.vertexD.dragAreaProperty.set( QuadrilateralUtils.createVertexArea( dilatedBounds, this.vertexD, this.vertexA, this.vertexB, this.vertexC, this.validateShape ) );
  }

  /**
   * Set Properties deferred so that callbacks are not invoked while the QuadrilateralShapeModel has bad transient
   * state while other Property values are being calculated.
   */
  public setPropertiesDeferred( deferred: boolean ): void {
    assert && assert( deferred !== this.propertiesDeferred, 'deferred state must be changing, you may have not un-deferred Properties' );
    this.propertiesDeferred = deferred;

    // set deferred for all Properties first so that their values are up-to-date by the time we call listeners
    const deferredVertexListeners = this.vertices.map( vertex => vertex.setPropertiesDeferred( deferred ) );

    // call any deferred callbacks if no longer deferred
    deferredVertexListeners.forEach( deferredListener => deferredListener && deferredListener() );
  }

  /**
   * Reset the shape by resetting vertices. Defer update of Properties so that Properties do not
   * call listeners until all Vertices have been repositioned.
   */
  public reset(): void {

    // set necessary Properties deferred so that we can update everything together
    this.setPropertiesDeferred( true );

    this.vertexA.reset();
    this.vertexB.reset();
    this.vertexC.reset();
    this.vertexD.reset();

    // no longer deferred, invoke callbacks and update order dependent Properties
    this.setPropertiesDeferred( false );

    this.updateOrderDependentProperties();
  }

  /**
   * Reset the shape AND indicate that a reset is in progress (which will disable certain view feedback.
   * Use this when just resetting the QuadrilateralShapeModel without resetting the full QuadrilateralShapeModel.
   */
  public isolatedReset(): void {
    this.resetNotInProgressProperty.value = false;
    this.reset();
    this.resetNotInProgressProperty.value = true;
  }

  /**
   * Returns true when the provided QuadrilateralShapeModel has every vertex contained within model bounds.
   * @param shapeModel
   */
  private static areQuadrilateralVerticesInBounds( shapeModel: QuadrilateralShapeModel ): boolean {
    return _.every( shapeModel.vertices, vertex => {
      return QuadrilateralConstants.MODEL_BOUNDS.containsBounds( vertex.modelBoundsProperty.value );
    } );
  }

  /**
   * Returns true if the quadrilateral shape is NOT crossed. The quadrilateral shape is usually valid when not crossed,
   * so returning this value makes logic easier at usage sites.
   */
  public static isQuadrilateralShapeNotCrossed( shapeModel: QuadrilateralShapeModel ): boolean {
    let shapeCrossed = true;

    for ( let i = 0; i < shapeModel.vertices.length; i++ ) {
      const testVertex = shapeModel.vertices[ i ];

      // Make sure that no vertices overlap any other.
      if ( shapeCrossed ) {
        for ( let j = 0; j < shapeModel.vertices.length; j++ ) {
          const otherVertex = shapeModel.vertices[ j ];

          if ( testVertex !== otherVertex ) {
            shapeCrossed = !testVertex.overlapsOther( otherVertex );

            if ( !shapeCrossed ) {
              break;
            }
          }
        }
      }

      // Make sure that no vertices overlap a side.
      if ( shapeCrossed ) {
        for ( let j = 0; j < shapeModel.sides.length; j++ ) {
          const side = shapeModel.sides[ j ];
          if ( !side.includesVertex( testVertex ) ) {
            shapeCrossed = !side.shapeProperty.value.intersectsBounds( testVertex.modelBoundsProperty.value );

            if ( !shapeCrossed ) {
              break;
            }
          }
        }
      }

      // Make sure the QuadrilateralVertex is within the drag area Shape.
      if ( shapeCrossed ) {
        assert && assert( testVertex.dragAreaProperty.value, 'Drag area must be defined for the QuadrilateralVertex' );
        shapeCrossed = QuadrilateralUtils.customShapeContainsPoint( testVertex.dragAreaProperty.value!, testVertex.positionProperty.value );
      }

      // Quadrilateral is not allowed, no need to keep testing
      if ( !shapeCrossed ) {
        break;
      }
    }

    return shapeCrossed;
  }

  /**
   * Returns true if the current quadrilateral shape is allowed based on the rules of this model.
   *
   * A QuadrilateralVertex cannot overlap any other.
   * A QuadrilateralVertex cannot overlap any QuadrilateralSide.
   * A QuadrilateralVertex cannot go outside model bounds.
   * A QuadrilateralVertex cannot to outside its defined drag Shape (which prevents crossed Quadrilaterals).
   *
   * As soon as the quadrilateral is found to be disallowed, we break out of testing.
   */
  public static isQuadrilateralShapeAllowed( shapeModel: QuadrilateralShapeModel ): boolean {
    let shapeAllowed = true;

    // All vertices must be completely within model bounds.
    shapeAllowed = QuadrilateralShapeModel.areQuadrilateralVerticesInBounds( shapeModel );

    // If all vertices are in bounds, look for crossed shapes (more computationally expensive).
    if ( shapeAllowed ) {
      shapeAllowed = QuadrilateralShapeModel.isQuadrilateralShapeNotCrossed( shapeModel );
    }
    return shapeAllowed;
  }

  /**
   * Returns the tolerance interval to use for a value. Generally, the default value will be returned. If the sim is
   * running while connected to a prototype device (?deviceConnection) or in a mode where all step sizes are reduced,
   * the value will be further reduced by scale factors provided by query parameter.
   */
  public static getWidenedToleranceInterval( defaultValue: number ): number {
    let interval = defaultValue;

    // Note that both cases are possible and the scale factors compound!
    if ( QuadrilateralQueryParameters.reducedStepSize ) {
      interval = interval * QuadrilateralQueryParameters.reducedStepSizeToleranceIntervalScaleFactor;
    }
    if ( QuadrilateralQueryParameters.deviceConnection ) {
      interval = interval * QuadrilateralQueryParameters.connectedToleranceIntervalScaleFactor;
    }

    return interval;
  }

  /**
   * Returns true if two angles are equal within the provided tolerance interval.
   */
  public static isAngleEqualToOther( angle1: number, angle2: number, toleranceInterval: number ): boolean {
    return Utils.equalsEpsilon( angle1, angle2, toleranceInterval );
  }
}

quadrilateral.register( 'QuadrilateralShapeModel', QuadrilateralShapeModel );
