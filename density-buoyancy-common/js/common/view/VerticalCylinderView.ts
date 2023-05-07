// Copyright 2019-2022, University of Colorado Boulder

/**
 * The 3D view for a VerticalCylinder.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import TriangleArrayWriter from '../../../../mobius/js/TriangleArrayWriter.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import VerticalCylinder from '../model/VerticalCylinder.js';
import MassView, { TAG_OFFSET } from './MassView.js';

// constants
const segments = 64;
const numElements = 12 * segments;

export default class VerticalCylinderView extends MassView {

  public readonly verticalCylinder: VerticalCylinder;
  private readonly verticalCylinderGeometry: THREE.BufferGeometry;
  private readonly updateListener: () => void;

  public constructor( verticalCylinder: VerticalCylinder ) {

    const positionArray = new Float32Array( numElements * 3 );
    const normalArray = new Float32Array( numElements * 3 );
    const uvArray = new Float32Array( numElements * 2 );

    VerticalCylinderView.updateArrays( positionArray, normalArray, uvArray, verticalCylinder.radiusProperty.value, verticalCylinder.heightProperty.value );

    const verticalCylinderGeometry = new THREE.BufferGeometry();
    verticalCylinderGeometry.addAttribute( 'position', new THREE.BufferAttribute( positionArray, 3 ) );
    verticalCylinderGeometry.addAttribute( 'normal', new THREE.BufferAttribute( normalArray, 3 ) );
    verticalCylinderGeometry.addAttribute( 'uv', new THREE.BufferAttribute( uvArray, 2 ) );

    super( verticalCylinder, verticalCylinderGeometry );

    const positionTag = () => {
      const radius = verticalCylinder.radiusProperty.value;
      const height = verticalCylinder.heightProperty.value;
      this.tagOffsetProperty.value = new Vector3( -radius + TAG_OFFSET, height / 2 - this.tagHeight! - TAG_OFFSET, radius );
    };
    positionTag();

    this.verticalCylinder = verticalCylinder;
    this.verticalCylinderGeometry = verticalCylinderGeometry;
    this.updateListener = () => {
      positionTag();
      VerticalCylinderView.updateArrays( verticalCylinderGeometry.attributes.position.array as Float32Array, null, verticalCylinderGeometry.attributes.uv.array as Float32Array, verticalCylinder.radiusProperty.value, verticalCylinder.heightProperty.value );
      verticalCylinderGeometry.attributes.position.needsUpdate = true;
      verticalCylinderGeometry.attributes.uv.needsUpdate = true;
      verticalCylinderGeometry.computeBoundingSphere();
    };
    this.verticalCylinder.radiusProperty.lazyLink( this.updateListener );
    this.verticalCylinder.heightProperty.lazyLink( this.updateListener );
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    this.verticalCylinder.radiusProperty.unlink( this.updateListener );
    this.verticalCylinder.heightProperty.unlink( this.updateListener );
    this.verticalCylinderGeometry.dispose();

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
   * @param offset - How many vertices have been specified so far?
   * @param offsetPosition - How to transform all of the points
   * @returns - The offset after the specified vertices have been written
   */
  public static updateArrays( positionArray: Float32Array | null, normalArray: Float32Array | null, uvArray: Float32Array | null, radius: number, height: number, offset = 0, offsetPosition: Vector3 = Vector3.ZERO ): number {
    const writer = new TriangleArrayWriter( positionArray, normalArray, uvArray, offset, offsetPosition );

    const baseY = -height / 2;
    const topY = height / 2;

    const du = 5 * 2 * Math.PI * radius;
    const dv = 2.5 * height;
    const dvCap = 2.5 * radius;
    const vMin = 0.5 - dv;
    const vMax = 0.5 + dv;
    const vCapMin = 0.5 - dvCap;
    const vCapMax = 0.5 + dvCap;

    const TWO_PI = 2 * Math.PI;
    const HALF_PI = 0.5 * Math.PI;

    for ( let i = 0; i < segments; i++ ) {
      const ratio0 = i / segments;
      const ratio1 = ( i + 1 ) / segments;
      const theta0 = TWO_PI * ratio0 - HALF_PI;
      const theta1 = TWO_PI * ratio1 - HALF_PI;

      // Normals
      const nx0 = Math.cos( theta0 );
      const nx1 = Math.cos( theta1 );
      const nz0 = Math.sin( theta0 );
      const nz1 = Math.sin( theta1 );

      // Positions
      const x0 = radius * nx0;
      const x1 = radius * nx1;
      const z0 = radius * nz0;
      const z1 = radius * nz1;

      // Base
      writer.position( 0, baseY, 0 );
      writer.position( x0, baseY, z0 );
      writer.position( x1, baseY, z1 );
      writer.normal( 0, -1, 0 );
      writer.normal( 0, -1, 0 );
      writer.normal( 0, -1, 0 );
      writer.uv( 0.5, vCapMax );
      writer.uv( du * ( ratio0 - 0.5 ), vCapMin );
      writer.uv( du * ( ratio1 - 0.5 ), vCapMin );

      // Side
      writer.position( x0, baseY, z0 );
      writer.position( x0, topY, z0 );
      writer.position( x1, baseY, z1 );
      writer.position( x1, baseY, z1 );
      writer.position( x0, topY, z0 );
      writer.position( x1, topY, z1 );
      writer.normal( nx0, 0, nz0 );
      writer.normal( nx0, 0, nz0 );
      writer.normal( nx1, 0, nz1 );
      writer.normal( nx1, 0, nz1 );
      writer.normal( nx0, 0, nz0 );
      writer.normal( nx1, 0, nz1 );
      writer.uv( du * ( ratio0 - 0.5 ), vMin );
      writer.uv( du * ( ratio0 - 0.5 ), vMax );
      writer.uv( du * ( ratio1 - 0.5 ), vMin );
      writer.uv( du * ( ratio1 - 0.5 ), vMin );
      writer.uv( du * ( ratio0 - 0.5 ), vMax );
      writer.uv( du * ( ratio1 - 0.5 ), vMax );

      // Top
      writer.position( 0, topY, 0 );
      writer.position( x1, topY, z1 );
      writer.position( x0, topY, z0 );
      writer.normal( 0, 1, 0 );
      writer.normal( 0, 1, 0 );
      writer.normal( 0, 1, 0 );
      writer.uv( 0.5, vCapMax );
      writer.uv( du * ( ratio1 - 0.5 ), vCapMin );
      writer.uv( du * ( ratio0 - 0.5 ), vCapMin );
    }

    return writer.getOffset();
  }
}

densityBuoyancyCommon.register( 'VerticalCylinderView', VerticalCylinderView );
