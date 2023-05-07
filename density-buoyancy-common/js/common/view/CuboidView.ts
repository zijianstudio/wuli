// Copyright 2019-2022, University of Colorado Boulder

/**
 * The 3D view for a Cuboid.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import TriangleArrayWriter from '../../../../mobius/js/TriangleArrayWriter.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import MassView, { TAG_OFFSET } from './MassView.js';
import Cuboid from '../model/Cuboid.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';

// constants
const numElements = 18 * 3;

export default class CuboidView extends MassView {

  public readonly cuboid: Cuboid;
  private readonly cuboidGeometry: THREE.BufferGeometry;
  private readonly updateListener: ( size: Bounds3 ) => void;

  public constructor( cuboid: Cuboid ) {
    const size = cuboid.sizeProperty.value;

    const positionArray = new Float32Array( numElements * 3 );
    const normalArray = new Float32Array( numElements * 3 );
    const uvArray = new Float32Array( numElements * 2 );

    CuboidView.updateArrays( positionArray, normalArray, uvArray, size );

    const cuboidGeometry = new THREE.BufferGeometry();
    cuboidGeometry.addAttribute( 'position', new THREE.BufferAttribute( positionArray, 3 ) );
    cuboidGeometry.addAttribute( 'normal', new THREE.BufferAttribute( normalArray, 3 ) );
    cuboidGeometry.addAttribute( 'uv', new THREE.BufferAttribute( uvArray, 2 ) );

    super( cuboid, cuboidGeometry );

    this.cuboid = cuboid;
    this.cuboidGeometry = cuboidGeometry;

    const positionTag = () => {
      const size = cuboid.sizeProperty.value;
      this.tagOffsetProperty.value = new Vector3( size.minX + TAG_OFFSET, size.maxY - this.tagHeight! - TAG_OFFSET, size.maxZ );
    };
    positionTag();

    this.updateListener = ( size: Bounds3 ) => {
      positionTag();
      CuboidView.updateArrays( cuboidGeometry.attributes.position.array as Float32Array, null, cuboidGeometry.attributes.uv.array as Float32Array, size );
      cuboidGeometry.attributes.position.needsUpdate = true;
      cuboidGeometry.attributes.uv.needsUpdate = true;
      cuboidGeometry.computeBoundingSphere();
    };
    this.cuboid.sizeProperty.lazyLink( this.updateListener );
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    this.cuboid.sizeProperty.unlink( this.updateListener );

    this.cuboidGeometry.dispose();

    super.dispose();
  }

  /**
   * Updates provided geometry arrays given the specific size.
   *
   * @param positionArray
   * @param normalArray
   * @param uvArray
   * @param size
   * @param offset - How many vertices have been specified so far?
   * @param offsetPosition - How to transform all of the points
   * @returns - The offset after the specified vertices have been written
   */
  public static updateArrays( positionArray: Float32Array | null, normalArray: Float32Array | null, uvArray: Float32Array | null, size: Bounds3, offset = 0, offsetPosition: Vector3 = Vector3.ZERO ): number {
    const writer = new TriangleArrayWriter( positionArray, normalArray, uvArray, offset, offsetPosition );

    function quad( p0x: number, p0y: number, p0z: number, p1x: number, p1y: number, p1z: number, p2x: number, p2y: number, p2z: number, p3x: number, p3y: number, p3z: number ): void {
      writer.position( p0x, p0y, p0z );
      writer.position( p1x, p1y, p1z );
      writer.position( p2x, p2y, p2z );

      writer.position( p0x, p0y, p0z );
      writer.position( p2x, p2y, p2z );
      writer.position( p3x, p3y, p3z );

      const du = 2.5 * ( Math.abs( p1x - p0x ) + Math.abs( p1y - p0y ) + Math.abs( p1z - p0z ) );
      const dv = 2.5 * ( Math.abs( p1x - p2x ) + Math.abs( p1y - p2y ) + Math.abs( p1z - p2z ) );
      const uMin = 0.5 - du;
      const uMax = 0.5 + du;
      const vMin = 0.5 - dv;
      const vMax = 0.5 + dv;

      writer.uv( uMax, vMin );
      writer.uv( uMin, vMin );
      writer.uv( uMin, vMax );

      writer.uv( uMax, vMin );
      writer.uv( uMin, vMax );
      writer.uv( uMax, vMax );
    }

    // Bottom
    quad(
      size.minX, size.minY, size.minZ,
      size.maxX, size.minY, size.minZ,
      size.maxX, size.minY, size.maxZ,
      size.minX, size.minY, size.maxZ
    );
    for ( let i = 0; i < 6; i++ ) { writer.normal( 0, -1, 0 ); }

    // Top
    quad(
      size.minX, size.maxY, size.minZ,
      size.minX, size.maxY, size.maxZ,
      size.maxX, size.maxY, size.maxZ,
      size.maxX, size.maxY, size.minZ
    );
    for ( let i = 0; i < 6; i++ ) { writer.normal( 0, 1, 0 ); }

    // Left
    quad(
      size.minX, size.minY, size.minZ,
      size.minX, size.minY, size.maxZ,
      size.minX, size.maxY, size.maxZ,
      size.minX, size.maxY, size.minZ
    );
    for ( let i = 0; i < 6; i++ ) { writer.normal( -1, 0, 0 ); }

    // Right
    quad(
      size.maxX, size.minY, size.minZ,
      size.maxX, size.maxY, size.minZ,
      size.maxX, size.maxY, size.maxZ,
      size.maxX, size.minY, size.maxZ
    );
    for ( let i = 0; i < 6; i++ ) { writer.normal( 1, 0, 0 ); }

    // Back
    quad(
      size.minX, size.minY, size.minZ,
      size.minX, size.maxY, size.minZ,
      size.maxX, size.maxY, size.minZ,
      size.maxX, size.minY, size.minZ
    );
    for ( let i = 0; i < 6; i++ ) { writer.normal( 0, 0, -1 ); }

    // Front
    quad(
      size.minX, size.minY, size.maxZ,
      size.maxX, size.minY, size.maxZ,
      size.maxX, size.maxY, size.maxZ,
      size.minX, size.maxY, size.maxZ
    );
    for ( let i = 0; i < 6; i++ ) { writer.normal( 0, 0, 1 ); }

    return writer.getOffset();
  }
}

densityBuoyancyCommon.register( 'CuboidView', CuboidView );
