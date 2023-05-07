// Copyright 2019-2022, University of Colorado Boulder

/**
 * The 3D view for a Cone.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import TriangleArrayWriter from '../../../../mobius/js/TriangleArrayWriter.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Cone from '../model/Cone.js';
import MassView, { TAG_OFFSET } from './MassView.js';

// constants
const segments = 64;
const numElements = 6 * segments;

export default class ConeView extends MassView {

  public readonly cone: Cone;
  private readonly coneGeometry: THREE.BufferGeometry;
  private readonly updateListener: () => void;

  public constructor( cone: Cone ) {

    const positionArray = new Float32Array( numElements * 3 );
    const normalArray = new Float32Array( numElements * 3 );
    const uvArray = new Float32Array( numElements * 2 );

    ConeView.updateArrays( positionArray, normalArray, uvArray, cone.radiusProperty.value, cone.heightProperty.value, cone.isVertexUp );

    const coneGeometry = new THREE.BufferGeometry();
    coneGeometry.addAttribute( 'position', new THREE.BufferAttribute( positionArray, 3 ) );
    coneGeometry.addAttribute( 'normal', new THREE.BufferAttribute( normalArray, 3 ) );
    coneGeometry.addAttribute( 'uv', new THREE.BufferAttribute( uvArray, 2 ) );

    super( cone, coneGeometry );

    this.cone = cone;
    this.coneGeometry = coneGeometry;

    const positionTag = () => {
      const radius = cone.radiusProperty.value;
      const height = cone.heightProperty.value;
      const vertexSign = cone.isVertexUp ? 1 : -1;
      const vertexY = vertexSign * 0.75 * height;
      const baseY = -vertexSign * 0.25 * height;
      const topY = Math.max( vertexY, baseY );

      this.tagOffsetProperty.value = new Vector3( -radius + TAG_OFFSET, topY - this.tagHeight! - TAG_OFFSET, radius );
    };
    positionTag();

    this.updateListener = () => {
      positionTag();
      ConeView.updateArrays( coneGeometry.attributes.position.array as Float32Array, coneGeometry.attributes.normal.array as Float32Array, null, cone.radiusProperty.value, cone.heightProperty.value, cone.isVertexUp );
      coneGeometry.attributes.position.needsUpdate = true;
      coneGeometry.attributes.normal.needsUpdate = true;
      coneGeometry.computeBoundingSphere();
    };
    this.cone.radiusProperty.lazyLink( this.updateListener );
    this.cone.heightProperty.lazyLink( this.updateListener );
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    this.cone.radiusProperty.unlink( this.updateListener );
    this.cone.heightProperty.unlink( this.updateListener );
    this.coneGeometry.dispose();

    super.dispose();
  }

  /**
   * Updates provided geometry arrays given the specific size.
   *
   * @param positionArray
   * @param normalArray
   * @param uvArray
   * @param radius
   * @param height
   * @param isVertexUp
   * @param offset - How many vertices have been specified so far?
   * @param offsetPosition - How to transform all of the points
   * @returns - The offset after the specified vertices have been written
   */
  public static updateArrays( positionArray: Float32Array | null, normalArray: Float32Array | null, uvArray: Float32Array | null, radius: number, height: number, isVertexUp: boolean, offset = 0, offsetPosition: Vector3 = Vector3.ZERO ): number {
    const writer = new TriangleArrayWriter( positionArray, normalArray, uvArray, offset, offsetPosition );

    const vertexSign = isVertexUp ? 1 : -1;
    const vertexY = vertexSign * 0.75 * height;
    const baseY = -vertexSign * 0.25 * height;

    const TWO_PI = 2 * Math.PI;
    const HALF_PI = 0.5 * Math.PI;

    for ( let i = 0; i < segments; i++ ) {
      const ratio0 = i / segments;
      const ratio1 = ( i + 1 ) / segments;
      const theta0 = TWO_PI * ratio0 - HALF_PI;
      const theta1 = TWO_PI * ratio1 - HALF_PI;

      const vertices = [
        new Vector3( 0, vertexY, 0 ),
        new Vector3(
          radius * Math.cos( isVertexUp ? theta1 : theta0 ),
          baseY,
          radius * Math.sin( isVertexUp ? theta1 : theta0 )
        ),
        new Vector3(
          radius * Math.cos( isVertexUp ? theta0 : theta1 ),
          baseY,
          radius * Math.sin( isVertexUp ? theta0 : theta1 )
        )
      ];

      const normalVector = vertices[ 2 ].minus( vertices[ 0 ] ).cross( vertices[ 1 ].minus( vertices[ 0 ] ) ).normalized().negated();

      // Side
      for ( let j = 0; j < vertices.length; j++ ) {
        writer.position( vertices[ j ].x, vertices[ j ].y, vertices[ j ].z );
        writer.normal( normalVector.x, normalVector.y, normalVector.z );
      }
      writer.uv( 0.5, 0 );
      writer.uv( ( isVertexUp ? theta1 : theta0 ) / TWO_PI, 1 );
      writer.uv( ( isVertexUp ? theta0 : theta1 ) / TWO_PI, 1 );

      // Top/Bottom
      writer.position( 0, baseY, 0 );
      writer.position( vertices[ 2 ].x, vertices[ 2 ].y, vertices[ 2 ].z );
      writer.position( vertices[ 1 ].x, vertices[ 1 ].y, vertices[ 1 ].z );
      writer.normal( 0, 0, -vertexSign );
      writer.normal( 0, 0, -vertexSign );
      writer.normal( 0, 0, -vertexSign );
      writer.uv( 0.5, 0 );
      writer.uv( ( isVertexUp ? theta0 : theta1 ) / TWO_PI, 1 );
      writer.uv( ( isVertexUp ? theta1 : theta0 ) / TWO_PI, 1 );
    }

    return writer.getOffset();
  }
}

densityBuoyancyCommon.register( 'ConeView', ConeView );
