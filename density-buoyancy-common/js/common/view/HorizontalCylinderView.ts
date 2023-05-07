// Copyright 2019-2022, University of Colorado Boulder

/**
 * The 3D view for a HorizontalCylinder.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import TriangleArrayWriter from '../../../../mobius/js/TriangleArrayWriter.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import MassView, { TAG_OFFSET } from './MassView.js';
import HorizontalCylinder from '../model/HorizontalCylinder.js';

// constants
const segments = 64;
const numElements = 12 * segments;

export default class HorizontalCylinderView extends MassView {

  public readonly horizontalCylinder: HorizontalCylinder;
  private readonly horizontalCylinderGeometry: THREE.BufferGeometry;
  private readonly updateListener: () => void;

  public constructor( horizontalCylinder: HorizontalCylinder ) {

    const positionArray = new Float32Array( numElements * 3 );
    const normalArray = new Float32Array( numElements * 3 );
    const uvArray = new Float32Array( numElements * 2 );

    HorizontalCylinderView.updateArrays( positionArray, normalArray, uvArray, horizontalCylinder.radiusProperty.value, horizontalCylinder.lengthProperty.value );

    const horizontalCylinderGeometry = new THREE.BufferGeometry();
    horizontalCylinderGeometry.addAttribute( 'position', new THREE.BufferAttribute( positionArray, 3 ) );
    horizontalCylinderGeometry.addAttribute( 'normal', new THREE.BufferAttribute( normalArray, 3 ) );
    horizontalCylinderGeometry.addAttribute( 'uv', new THREE.BufferAttribute( uvArray, 2 ) );

    super( horizontalCylinder, horizontalCylinderGeometry );

    const positionTag = () => {
      const radius = horizontalCylinder.radiusProperty.value;
      const length = horizontalCylinder.lengthProperty.value;
      this.tagOffsetProperty.value = new Vector3( -length / 2 + TAG_OFFSET, radius - this.tagHeight! - TAG_OFFSET, radius );
    };
    positionTag();

    this.horizontalCylinder = horizontalCylinder;
    this.horizontalCylinderGeometry = horizontalCylinderGeometry;
    this.updateListener = () => {
      positionTag();
      HorizontalCylinderView.updateArrays( horizontalCylinderGeometry.attributes.position.array as Float32Array, null, null, horizontalCylinder.radiusProperty.value, horizontalCylinder.lengthProperty.value );
      horizontalCylinderGeometry.attributes.position.needsUpdate = true;
      horizontalCylinderGeometry.computeBoundingSphere();
    };
    this.horizontalCylinder.radiusProperty.lazyLink( this.updateListener );
    this.horizontalCylinder.lengthProperty.lazyLink( this.updateListener );
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    this.horizontalCylinder.radiusProperty.unlink( this.updateListener );
    this.horizontalCylinder.lengthProperty.unlink( this.updateListener );
    this.horizontalCylinderGeometry.dispose();

    super.dispose();
  }

  /**
   * Updates provided geometry arrays given the specific size.
   *
   * @param positionArray
   * @param normalArray
   * @param uvArray
   * @param radius
   * @param length
   * @param offset - How many vertices have been specified so far?
   * @param offsetPosition - How to transform all of the points
   * @returns - The offset after the specified vertices have been written
   */
  public static updateArrays( positionArray: Float32Array | null, normalArray: Float32Array | null, uvArray: Float32Array | null, radius: number, length: number, offset = 0, offsetPosition: Vector3 = Vector3.ZERO ): number {
    const writer = new TriangleArrayWriter( positionArray, normalArray, uvArray, offset, offsetPosition );

    const leftX = -length / 2;
    const rightX = length / 2;

    const du = 2.5 * length;
    const dv = 5 * 2 * Math.PI * radius;
    const duCap = 2.5 * radius;
    const uMin = 0.5 - du;
    const uMax = 0.5 + du;
    const uCapMin = 0.5 - duCap;
    const uCapMax = 0.5 + duCap;

    const TWO_PI = 2 * Math.PI;
    const HALF_PI = 0.5 * Math.PI;

    for ( let i = 0; i < segments; i++ ) {
      const ratio0 = i / segments;
      const ratio1 = ( i + 1 ) / segments;
      const theta0 = TWO_PI * ratio0 - HALF_PI;
      const theta1 = TWO_PI * ratio1 - HALF_PI;

      // Normals
      const ny0 = Math.cos( theta0 );
      const ny1 = Math.cos( theta1 );
      const nz0 = Math.sin( theta0 );
      const nz1 = Math.sin( theta1 );

      // Positions
      const y0 = radius * ny0;
      const y1 = radius * ny1;
      const z0 = radius * nz0;
      const z1 = radius * nz1;

      // Left cap
      writer.position( leftX, 0, 0 );
      writer.position( leftX, y1, z1 );
      writer.position( leftX, y0, z0 );
      writer.normal( -1, 0, 0 );
      writer.normal( -1, 0, 0 );
      writer.normal( -1, 0, 0 );
      writer.uv( uCapMax, 0.5 );
      writer.uv( uCapMin, dv * ( ratio1 - 0.5 ) );
      writer.uv( uCapMin, dv * ( ratio0 - 0.5 ) );

      // Side
      writer.position( leftX, y0, z0 );
      writer.position( leftX, y1, z1 );
      writer.position( rightX, y0, z0 );
      writer.position( rightX, y0, z0 );
      writer.position( leftX, y1, z1 );
      writer.position( rightX, y1, z1 );
      writer.normal( 0, ny0, nz0 );
      writer.normal( 0, ny0, nz0 );
      writer.normal( 0, ny1, nz1 );
      writer.normal( 0, ny0, nz0 );
      writer.normal( 0, ny1, nz1 );
      writer.normal( 0, ny1, nz1 );
      writer.uv( uMax, dv * ( ratio0 - 0.5 ) );
      writer.uv( uMin, dv * ( ratio0 - 0.5 ) );
      writer.uv( uMin, dv * ( ratio1 - 0.5 ) );
      writer.uv( uMax, dv * ( ratio0 - 0.5 ) );
      writer.uv( uMin, dv * ( ratio1 - 0.5 ) );
      writer.uv( uMax, dv * ( ratio1 - 0.5 ) );

      // Right cap
      writer.position( rightX, 0, 0 );
      writer.position( rightX, y0, z0 );
      writer.position( rightX, y1, z1 );
      writer.normal( 1, 0, 0 );
      writer.normal( 1, 0, 0 );
      writer.normal( 1, 0, 0 );
      writer.uv( uCapMax, 0.5 );
      writer.uv( uCapMin, dv * ( ratio0 - 0.5 ) );
      writer.uv( uCapMin, dv * ( ratio1 - 0.5 ) );
    }

    return writer.getOffset();
  }
}

densityBuoyancyCommon.register( 'HorizontalCylinderView', HorizontalCylinderView );
