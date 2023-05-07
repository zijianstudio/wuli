// Copyright 2021-2023, University of Colorado Boulder

/**
 * Models a vertex of the quadrilateral.
 *
 * @author Jesse Greenberg
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import quadrilateral from '../../quadrilateral.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import QuadrilateralVertexLabel from './QuadrilateralVertexLabel.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import QuadrilateralMovable from './QuadrilateralMovable.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';

const VERTEX_BOUNDS = new Bounds2( 0, 0, QuadrilateralConstants.VERTEX_WIDTH, QuadrilateralConstants.VERTEX_WIDTH );
const HALF_WIDTH = VERTEX_BOUNDS.width / 2;
const HALF_HEIGHT = VERTEX_BOUNDS.height / 2;

export default class QuadrilateralVertex extends QuadrilateralMovable {

  // The position of the vertex in model coordinates.
  public readonly positionProperty: Property<Vector2>;

  // The angle at this vertex of the quadrilateral, null until this vertex is connected to two others because we
  // need three points to form the angle.
  public readonly angleProperty: Property<number | null>;

  // Identification of this QuadrilateralVertex within the QuadrilateralShape.
  public readonly vertexLabel: QuadrilateralVertexLabel;

  // The Shape in model coordinates that defines where this QuadrilateralVertex can move. It can never
  // go outside this area. The dragAreaProperty is determined by other vertices of the quadrilateral
  // and constraints movement so the quadrilateral can never become crossed or "complex". It is null until
  // the model bounds are defined and this QuadrilateralVertex is connected to others to form the quadrilateral shape.
  public readonly dragAreaProperty: Property<null | Shape>;

  // The bounds in model coordinates of this vertex, with dimensions VERTEX_BOUNDS, centered at the value of the
  // positionProperty.
  public readonly modelBoundsProperty: TReadOnlyProperty<Bounds2>;

  // Referenced so that we can pass the tandem to Properties as they are dynamically created in the methods below.
  private readonly tandem: Tandem;

  // Properties tracking when a QuadrilateralVertex becomes blocked by ony of the individual sides of model bounds.
  // So that we can trigger some feedback as a QuadrilateralVertex is blocked by new edges of bounds.
  public readonly leftConstrainedProperty = new BooleanProperty( false );
  public readonly rightConstrainedProperty = new BooleanProperty( false );
  public readonly topConstrainedProperty = new BooleanProperty( false );
  public readonly bottomConstrainedProperty = new BooleanProperty( false );
  public readonly numberOfConstrainingEdgesProperty = new DerivedProperty( [
    this.topConstrainedProperty,
    this.rightConstrainedProperty,
    this.bottomConstrainedProperty,
    this.leftConstrainedProperty
  ], ( topConstrained, rightConstrained, bottomConstrained, leftConstrained ) => {
    const topVal = topConstrained ? 1 : 0;
    const rightVal = rightConstrained ? 1 : 0;
    const bottomVal = bottomConstrained ? 1 : 0;
    const leftVal = leftConstrained ? 1 : 0;
    return topVal + rightVal + bottomVal + leftVal;
  } );

  // A reference to vertices connected to this vertex for so we can calculate the angle at this vertex.
  // The orientation of vertex1 and vertex2 for angle calculations are as shown in the following diagram:
  //        thisVertex
  //          /       \
  //   sideA /         \ sideB
  //        /           \
  // vertex1 --------- vertex2
  private vertex1: QuadrilateralVertex | null;
  private vertex2: QuadrilateralVertex | null;

  // Property that controls how many values to include in the "smoothing" of potential positions when being
  // controlled by a prototype tangible. See smoothPosition().
  private readonly smoothingLengthProperty: TReadOnlyProperty<number>;

  // The collection of n <= SMOOTHING_LENGTH number of positions for prototype tangible control. See smoothPosition().
  private readonly smoothingPositions: Vector2[] = [];

  /**
   * @param initialPosition - The initial position for the QuadrilateralVertex in model coordinates.
   * @param vertexLabel - A label tagging the vertex, so we can look up the equivalent vertex on another shape model
   * @param smoothingLengthProperty - Controlling how many values to use in the position smoothing when connected to
   *                                  a tangible device (prototype).
   * @param tandem
   */
  public constructor( initialPosition: Vector2, vertexLabel: QuadrilateralVertexLabel, smoothingLengthProperty: TReadOnlyProperty<number>, tandem: Tandem ) {
    super( tandem );

    this.smoothingLengthProperty = smoothingLengthProperty;
    this.positionProperty = new Vector2Property( initialPosition, {
      tandem: tandem.createTandem( 'positionProperty' )
    } );

    this.angleProperty = new Property<null | number>( null, {
      tandem: tandem.createTandem( 'angleProperty' ),
      phetioValueType: NullableIO( NumberIO )
    } );

    // The label for this vertex so we can get the same vertex on another QuadrilateralShapeModel.
    this.vertexLabel = vertexLabel;

    this.vertex1 = null;
    this.vertex2 = null;

    this.dragAreaProperty = new Property<Shape | null>( null );

    this.modelBoundsProperty = new DerivedProperty( [ this.positionProperty ], position => {
      return new Bounds2( position.x - HALF_WIDTH, position.y - HALF_HEIGHT, position.x + HALF_WIDTH, position.y + HALF_HEIGHT );
    } );

    this.tandem = tandem;
  }

  /**
   * Returns true if this QuadrilateralVertex intersects another.
   */
  public overlapsOther( other: QuadrilateralVertex ): boolean {
    assert && assert( other !== this, 'You are trying to see if this vertex overlaps self?' );
    return other.modelBoundsProperty.value.intersectsBounds( this.modelBoundsProperty.value );
  }


  /**
   * Set Properties that need to be updated all at once for the quadrilateral shape to a deferred state so that
   * they can be updated together without calling listeners with bad transient states during updates.
   */
  public setPropertiesDeferred( deferred: boolean ): ( () => void ) | null {
    return this.positionProperty.setDeferred( deferred );
  }

  /**
   * Reset this vertex.
   */
  public reset(): void {
    this.positionProperty.reset();
    this.smoothingPositions.length = 0;
  }

  /**
   * Update the angle at this vertex. Uses atan2 to get the angle at this vertex counter-clockwise
   * between 0 and 2 * Math.PI. See
   * https://math.stackexchange.com/questions/878785/how-to-find-an-angle-in-range0-360-between-2-vectors
   *
   * Custom angle claculation used instead of Vector2.angleBetween because we need the angle to span from
   * 0 to 2PI instead of 0 to PI.
   *
   * Assumes the following arrangement of vertices:
   *
   *        thisVertex
   *          /       \
   *   sideA /         \ sideB
   *        /           \
   * vertex1 --------- vertex2
   *
   * This should only be used after all vertex positions have been updated to make sure that the quadrilateral does
   * not appear to exist in incorrect states as positions are updated in the natural listener order. See
   * QuadrilateralShapeModel.updateOrderDependentProperties for more information.
   */
  public updateAngle(): void {
    assert && assert( this.vertex1 && this.vertex2, 'Need connected vertices to determine an angle' );

    const vector1 = this.vertex1!.positionProperty.value.minus( this.positionProperty.value );
    const vector2 = this.vertex2!.positionProperty.value.minus( this.positionProperty.value );

    const dot = vector1.x * vector2.x + vector1.y * vector2.y;
    const det = vector1.x * vector2.y - vector2.x * vector1.y;
    let angle = Math.atan2( det, dot );

    // if the angle is less than zero, we have wrapped around Math.PI and formed a concave shape - the actual
    // angle should be greater than PI
    if ( angle < 0 ) {
      angle = angle + 2 * Math.PI;
    }

    this.angleProperty.value = angle;
  }

  /**
   * Connect this vertex to two others to form an angle and sides of the quadrilateral.
   */
  public connectToOthers( vertex1: QuadrilateralVertex, vertex2: QuadrilateralVertex ): void {
    this.vertex1 = vertex1;
    this.vertex2 = vertex2;
  }

  /**
   * "Smooth" the provided position for the vertex by saving it in a collection of positions of max length
   * and returning the average position. Only used for prototype tangible connection.
   */
  public smoothPosition( position: Vector2 ): Vector2 {
    this.smoothingPositions.push( position );

    while ( this.smoothingPositions.length > this.smoothingLengthProperty.value ) {
      this.smoothingPositions.shift();
    }

    return Vector2.average( this.smoothingPositions );
  }
}

quadrilateral.register( 'QuadrilateralVertex', QuadrilateralVertex );
