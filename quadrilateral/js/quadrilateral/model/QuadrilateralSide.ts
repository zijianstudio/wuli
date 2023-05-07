// Copyright 2021-2023, University of Colorado Boulder

/**
 * The model for a side of the quadrilateral. A QuadrilateralSide is defined by the line between two Vertices.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import quadrilateral from '../../quadrilateral.js';
import QuadrilateralVertex from './QuadrilateralVertex.js';
import { Line } from '../../../../scenery/js/imports.js';
import { Line as LineShape, Shape } from '../../../../kite/js/imports.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import QuadrilateralSideLabel from './QuadrilateralSideLabel.js';
import QuadrilateralMovable from './QuadrilateralMovable.js';
import Property from '../../../../axon/js/Property.js';
import TProperty from '../../../../axon/js/TProperty.js';

export default class QuadrilateralSide extends QuadrilateralMovable {

  // Reference to the vertices that compose this QuadrilateralSide.
  public readonly vertex1: QuadrilateralVertex;
  public readonly vertex2: QuadrilateralVertex;

  // Indicates that this side has been connected to another to form the shape.
  private isConnected = false;

  // Length of the side in model coordinates.
  public readonly lengthProperty: NumberProperty;

  // Identifies this side within the quadrilateral shape.
  public readonly sideLabel: QuadrilateralSideLabel;

  // The shape of the side - A Line determined by the distance between the vertices and model width.
  public readonly shapeProperty: TProperty<Shape>;

  // In model coordinates, the length of a side segment in model coordinates. The full side is divided into segments of
  // this length with the final segment length being the remainder.
  public static readonly SIDE_SEGMENT_LENGTH = 0.25;

  // in model coordinates, the width of a side - Sides exist in model space to apply rules that vertices and
  // sides can never overlap
  public static readonly SIDE_WIDTH = 0.1;

  // A Line between Vertex1 and Vertex2, which may be useful for calculations - Property value
  // is reused to avoid excessive allocations.
  public readonly modelLineProperty: Property<LineShape>;

  // Used to calculate the line shape (full stroked shape) - reused to avoid excessive allocations.
  private readonly scratchLineNode = new Line( 0, 0, 0, 0, {
    lineWidth: QuadrilateralSide.SIDE_WIDTH
  } );

  /**
   * @param vertex1 - The first vertex of this QuadrilateralSide.
   * @param vertex2 - The second vertex of this QuadrilateralSide.
   * @param sideLabel - To identify this QuadrilateralSide within the shape.
   * @param tandem
   */
  public constructor( vertex1: QuadrilateralVertex, vertex2: QuadrilateralVertex, sideLabel: QuadrilateralSideLabel, tandem: Tandem ) {
    super( tandem );

    this.vertex1 = vertex1;
    this.vertex2 = vertex2;
    this.sideLabel = sideLabel;

    this.modelLineProperty = new Property( new LineShape( vertex1.positionProperty.value, vertex2.positionProperty.value ) );

    this.lengthProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'lengthProperty' )
    } );

    this.shapeProperty = new Property( new Shape() );
  }

  /**
   * Update the length and model shape of this QuadrilateralSide from vertex positions. This must be calculated in order by the
   * model, after QuadrilateralVertex positions are changed and before these values are used to calculate other shape attributes.
   * See QuadrilateralShapeModel.updateOrderDependentProperties for more information.
   */
  public updateLengthAndShape(): void {
    const vertex1Position = this.vertex1.positionProperty.value;
    const vertex2Position = this.vertex2.positionProperty.value;

    this.lengthProperty.value = Vector2.getDistanceBetweenVectors( vertex2Position, vertex1Position );

    // Update the model Line shape and notify listeners (static to avoid excessive Line instances)
    const modelLine = this.modelLineProperty.value;
    modelLine.start = vertex1Position;
    modelLine.end = vertex2Position;
    this.modelLineProperty.notifyListenersStatic();

    this.scratchLineNode.setLine( vertex1Position.x, vertex1Position.y, vertex2Position.x, vertex2Position.y );
    this.shapeProperty.value = this.scratchLineNode.getStrokedShape();
  }

  /**
   * Returns true if this QuadrilateralSide includes the provided QuadrilateralVertex.
   */
  public includesVertex( vertex: QuadrilateralVertex ): boolean {
    return this.vertex1 === vertex || this.vertex2 === vertex;
  }

  /**
   * Returns the position in model coordinates between the two Vertices of this QuadrilateralSide.
   */
  public getMidpoint(): Vector2 {
    return this.vertex2.positionProperty.value.average( this.vertex1.positionProperty.value );
  }

  /**
   * Connect this side to another to form a shape. Connects this.vertex1 to otherSide.vertex2, illustrated like this.
   * This sets the relationship between sides and determines how angles are calculated.
   *
   *  otherSide.vertex1---------------otherSide.vertex2
   *                                  thisSide.vertex1
   *                                    |
   *                                    |
   *                                    |
   *                                    |
   *                                  this.vertex2
   *
   */
  public connectToSide( otherSide: QuadrilateralSide ): void {
    assert && assert( !this.isConnected, 'Cannot connect a side that is already connected to another.' );
    assert && assert( otherSide !== this, 'Cannot connect a side to itself.' );

    this.isConnected = true;
    this.vertex1.connectToOthers( otherSide.vertex1, this.vertex2 );
  }
}

quadrilateral.register( 'QuadrilateralSide', QuadrilateralSide );
