// Copyright 2020-2022, University of Colorado Boulder

/**
 * The main shape and mathematics for the boat's shape. Due to its variable size in the sim, we normalize it so that
 * we export a "one-liter" version (in maximum displacement) for the simulation to resize.
 *
 * Coordinate frames:
 *
 * Vertical:
 * - heightRatio: 0 (bottom) to 1 (top)
 * - Design: -BoatDesign.DESIGN_BOAT_HEIGHT (bottom) to 0 (top)
 *
 * At each height, we define 4 control points to determine a cubic bezier curve for the shape of the cross-section of
 * the boat (both inside and outside).
 *
 * Additionally, we'll need to compute different "intersection" geometries for a given block size. It's possible to
 * compute a shape (for a given block size) such that in 2D it "acts" as the proper 3d shape. This is mainly due to
 * the block corners pressing against the inside of the boat's hull.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { Cubic, Line, Segment } from '../../../../kite/js/imports.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import { Color } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

// constants
const CROSS_SECTION_SAMPLES = 30;

export default class BoatDesign {
  /**
   * Given a design y-value, returns the height ratio (0 being the bottom of the boat, 1 being the top)
   */
  private static getHeightRatioFromDesignY( y: number ): number {
    return Utils.linear( -BoatDesign.DESIGN_BOAT_HEIGHT, 0, 0, 1, y );
  }

  /**
   * Returns the control point net for a cubic bezier curve for a given height ratio (0=top, 1=bottom) and whether it
   * is on the inside or outside surface of the boat.
   */
  private static getControlPoints( heightRatio: number, isInside: boolean ): [ Vector2, Vector2, Vector2, Vector2 ] {
    const v0 = new Vector2( 0, 0 );
    const v1 = new Vector2( 50, 50 );
    const v2 = new Vector2( 150, 50 );
    const v3 = new Vector2( 200, 40 );

    const ratio = Math.pow( heightRatio, 1 / 2 );
    const oppositeRatio = 1 - ratio;

    v0.x += 50 * oppositeRatio;
    v1.x += 60 * oppositeRatio;

    v1.y += -20 * oppositeRatio;
    v2.y += -15 * oppositeRatio;
    v3.y += -5 * oppositeRatio;

    if ( !isInside ) {
      v0.x += -( 1.4 + 0.5 * oppositeRatio ) * BoatDesign.DESIGN_WALL_THICKNESS;

      v1.x += -0.9 * BoatDesign.DESIGN_WALL_THICKNESS;
      v1.y += 0.9 * BoatDesign.DESIGN_WALL_THICKNESS;

      v2.y += BoatDesign.DESIGN_WALL_THICKNESS;

      v3.x += BoatDesign.DESIGN_WALL_THICKNESS;
      v3.y += ( 0.9 - 0.1 * ratio ) * BoatDesign.DESIGN_WALL_THICKNESS;
    }

    return [ v0, v1, v2, v3 ];
  }

  /**
   * Returns the XY model coordinates for intersection with a cuboid block with the given half-width.
   *
   * @param blockHalfWidth - in model coordinates
   * @param liters - the number of liters of the boat's displacement
   */
  public static getIntersectionVertices( blockHalfWidth = 0, liters = 1 ): Vector2[] {
    const scale = Math.pow( liters, 1 / 3 ) * BoatDesign.ONE_LITER_SCALE_MULTIPLIER;
    const frontSamples = 30;
    const insideSamples = 40;

    const outsideBottomY = -BoatDesign.DESIGN_BOAT_HEIGHT;
    const insideBottomY = -BoatDesign.DESIGN_BOAT_HEIGHT + BoatDesign.DESIGN_WALL_THICKNESS;

    const outsideBottomPoints = BoatDesign.getControlPoints( 1, false );
    const outsideTopPoints = BoatDesign.getControlPoints( 0, false );
    const insideTopPoints = BoatDesign.getControlPoints( 1, true );
    const insideBottomPoints = BoatDesign.getControlPoints( BoatDesign.getHeightRatioFromDesignY( insideBottomY ), true );

    const points = [];

    if ( blockHalfWidth < insideTopPoints[ 3 ].y * scale ) {
      points.push( new Vector2( insideBottomPoints[ 3 ].x, insideBottomY ) );
    }
    points.push( new Vector2( insideTopPoints[ 3 ].x, 0 ) );
    points.push( new Vector2( outsideTopPoints[ 3 ].x, 0 ) );
    points.push( new Vector2( outsideBottomPoints[ 3 ].x, outsideBottomY ) );
    _.range( 0, frontSamples ).forEach( sample => {
      const y = outsideBottomY + BoatDesign.DESIGN_BOAT_HEIGHT * sample / ( frontSamples - 1 );
      const x = BoatDesign.getControlPoints( BoatDesign.getHeightRatioFromDesignY( y ), false )[ 0 ].x;
      points.push( new Vector2( x, y ) );
    } );

    const interiorPoints: Vector2[] = [];

    _.range( 0, insideSamples ).forEach( sample => {
      const y = ( -BoatDesign.DESIGN_BOAT_HEIGHT + BoatDesign.DESIGN_WALL_THICKNESS ) * sample / ( insideSamples - 1 );
      const controlPoints = BoatDesign.getControlPoints( BoatDesign.getHeightRatioFromDesignY( y ), true );

      const cubic = new phet.kite.Cubic( ...controlPoints );

      const p0 = controlPoints[ 0 ];
      const p1 = controlPoints[ 1 ];
      const p2 = controlPoints[ 2 ];
      const p3 = controlPoints[ 3 ];

      const a = -p0.y + 3 * p1.y - 3 * p2.y + p3.y;
      const b = 3 * p0.y - 6 * p1.y + 3 * p2.y;
      const c = -3 * p0.y + 3 * p1.y;
      const d = p0.y - blockHalfWidth / scale;

      const ts = phet.dot.Utils.solveCubicRootsReal( a, b, c, d );
      ts.forEach( ( t: number ) => {
        if ( t >= 0 && t <= 1 ) {
          const xz = cubic.positionAt( t );
          interiorPoints.push( new Vector2( xz.x, y ) );
        }
      } );
    } );

    const fullPoints = points.concat( _.sortBy( interiorPoints, point => point.x ) );

    // TODO: Don't require a reverse here
    return _.reverse( fullPoints.map( designPoint => BoatDesign.designToModel( designPoint.toVector3(), liters ).toVector2() ) );
  }

  /**
   * Returns the XY model coordinates for the interior cross-section of the boat (the section of air underneath the top)
   */
  public static getBasinOneLiterVertices(): Vector2[] {

    const insideBottomY = -BoatDesign.DESIGN_BOAT_HEIGHT + BoatDesign.DESIGN_WALL_THICKNESS;

    const insideTopPoints = BoatDesign.getControlPoints( 1, true );
    const insideBottomPoints = BoatDesign.getControlPoints( BoatDesign.getHeightRatioFromDesignY( insideBottomY ), true );

    const insideSamples = 20;
    const frontPoints = _.sortBy( _.range( 0, insideSamples ).map( sample => {
      const y = insideBottomY * sample / ( insideSamples - 1 );
      const controlPoints = BoatDesign.getControlPoints( BoatDesign.getHeightRatioFromDesignY( y ), true );

      return new Vector2( controlPoints[ 0 ].x, y );
    } ), point => point.x );

    return [
      ...frontPoints,
      new Vector2( insideBottomPoints[ 3 ].x, insideBottomY ),
      new Vector2( insideTopPoints[ 3 ].x, 0 )
    ].map( designPoint => BoatDesign.designToModel( designPoint.toVector3(), 1 ).toVector2() );
  }

  /**
   * Given a net of control points, this returns the segments necessary to describe the y-slice of a boat in the X,Z
   * plane.
   */
  private static getSegmentsFromControlPoints( points: Vector2[] ): Segment[] {
    assert && assert( points.length === 4 );

    const flip = ( p: Vector2 ) => p.componentTimes( new Vector2( 1, -1 ) );

    return [
      // @ts-expect-error See assertion above, even if we tuple-type it, the below one with the reverse and map won't typecheck
      new Cubic( ...points ),
      new Line( points[ 3 ], flip( points[ 3 ] ) ),
      // @ts-expect-error
      new Cubic( ...points.slice().reverse().map( flip ) )
    ];
  }

  /**
   * Returns the area contained in a given X,Z cross-section of the boat defined by the given control points.
   */
  private static getAreaFromControlPoints( points: Vector2[] ): number {
    return Math.abs( _.sum( BoatDesign.getSegmentsFromControlPoints( points ).map( segment => segment.getSignedAreaFragment() ) ) );
  }

  /**
   * Returns a discretized form of the cross-section defined by the control points.
   */
  private static getDiscretizationFromControlPoints( points: Vector2[], quantity: number ): Vector2[] {
    return _.flatten( BoatDesign.getSegmentsFromControlPoints( points ).map( segment => {
      return (
        segment instanceof Line ? [ 0 ] : _.range( 0, quantity ).map( n => n / quantity )
      ).map( t => segment.positionAt( t ) );
    } ) );
  }

  /**
   * Meant for mapping a raw number-based array of x,y,z position data from the construction coordinates to model
   * coordinates.
   */
  private static positionArrayMap( point: number, index: number ): number {
    const mod = index % 3;

    // x
    if ( mod === 0 ) {
      point -= BoatDesign.DESIGN_CENTROID.x;
    }

    // y
    if ( mod === 1 ) {
      point -= BoatDesign.DESIGN_CENTROID.y;
    }

    return point * BoatDesign.ONE_LITER_SCALE_MULTIPLIER;
  }

  /**
   * Returns the model-space local coordinate for the boat, given a design-space point and number of liters.
   */
  private static designToModel( point: Vector3, liters = 1 ): Vector3 {
    const scale = Math.pow( liters, 1 / 3 ) * BoatDesign.ONE_LITER_SCALE_MULTIPLIER;
    return new Vector3(
      ( point.x - BoatDesign.DESIGN_CENTROID.x ) * scale,
      ( point.y - BoatDesign.DESIGN_CENTROID.y ) * scale,
      point.z * scale
    );
  }

  /**
   * Creates a coordinate float array to be used with fillWaterVertexArray, for three.js purposes.
   */
  public static createWaterVertexArray(): Float32Array {
    return new Float32Array( ( CROSS_SECTION_SAMPLES + 1.5 ) * 3 * 3 * 4 );
  }

  /**
   * Creates a coordinate float array to be used with fillWaterVertexArray, for three.js purposes.
   */
  public static createWaterNormalArray(): Float32Array {
    const array = BoatDesign.createWaterVertexArray();

    for ( let i = 0; i < array.length / 3; i++ ) {
      // The first 6 normals should be 0,0,1 (front). After that, 0,1,0 (up)
      array[ i * 3 + ( i < 6 ? 2 : 1 ) ] = 1;
    }

    return array;
  }

  public static shouldBoatWaterDisplayIfFull( boatY: number, liters: number ): boolean {
    const scale = Math.pow( liters, 1 / 3 ) * BoatDesign.ONE_LITER_SCALE_MULTIPLIER;
    const designY = boatY / scale + BoatDesign.DESIGN_CENTROID.y;

    return designY <= 1e-3 && scale > 0;
  }

  /**
   * Fills the positionArray with a X,Z cross-section of the water around a boat at a given y value (for a given liters
   * value).
   *
   * @returns - Whether the water is completely filled
   */
  public static fillWaterVertexArray( waterY: number, boatX: number, boatY: number, liters: number, poolBounds: Bounds3, positionArray: Float32Array, wasFilled: boolean ): boolean {
    // TODO: reduce duplication with below
    const outsideBottomY = -BoatDesign.DESIGN_BOAT_HEIGHT;
    const scale = Math.pow( liters, 1 / 3 ) * BoatDesign.ONE_LITER_SCALE_MULTIPLIER;
    const designY = boatY / scale + BoatDesign.DESIGN_CENTROID.y;

    let index = 0;

    // Front
    index = ThreeUtils.writeFrontVertices( positionArray, index, new Bounds2(
      poolBounds.minX, poolBounds.minY,
      poolBounds.maxX, waterY
    ), poolBounds.maxZ );

    // If we have a low enough value, just zero things out (won't show anything)
    const isFilled = designY < outsideBottomY || designY > 1e-3 || scale === 0;
    if ( isFilled ) {

      // Top
      index = ThreeUtils.writeTopVertices( positionArray, index, new Bounds2(
        poolBounds.minX, poolBounds.minZ,
        poolBounds.maxX, poolBounds.maxZ
      ), waterY );
    }
    else {
      const controlPoints = BoatDesign.getControlPoints( BoatDesign.getHeightRatioFromDesignY( designY ), false );
      const cubic = new Cubic( ...controlPoints );

      const x0 = ( cubic.positionAt( 0 ).x - BoatDesign.DESIGN_CENTROID.x ) * scale + boatX;
      const x1 = ( cubic.positionAt( 1 ).x - BoatDesign.DESIGN_CENTROID.x ) * scale + boatX;

      // TODO: reduce these allocations?

      // Left top
      index = ThreeUtils.writeTopVertices( positionArray, index, new Bounds2(
        poolBounds.minX, poolBounds.minZ,
        x0, poolBounds.maxZ
      ), waterY );

      // Right top
      index = ThreeUtils.writeTopVertices( positionArray, index, new Bounds2(
        x1, poolBounds.minZ,
        poolBounds.maxX, poolBounds.maxZ
      ), waterY );

      for ( let i = 0; i < CROSS_SECTION_SAMPLES; i++ ) {
        const t0 = i / CROSS_SECTION_SAMPLES;
        const t1 = ( i + 1 ) / CROSS_SECTION_SAMPLES;

        const p0 = cubic.positionAt( t0 );
        const p1 = cubic.positionAt( t1 );

        const p0x = ( p0.x - BoatDesign.DESIGN_CENTROID.x ) * scale + boatX;
        const p0z = p0.y * scale;
        const p1x = ( p1.x - BoatDesign.DESIGN_CENTROID.x ) * scale + boatX;
        const p1z = p1.y * scale;

        // Behind the boat
        index = ThreeUtils.writeQuad(
          positionArray, index,
          p0x, waterY, poolBounds.minZ,
          p0x, waterY, -p0z,
          p1x, waterY, -p1z,
          p1x, waterY, poolBounds.minZ
        );

        // In front of the boat
        index = ThreeUtils.writeQuad(
          positionArray, index,
          p1x, waterY, poolBounds.maxZ,
          p1x, waterY, p1z,
          p0x, waterY, p0z,
          p0x, waterY, poolBounds.maxZ
        );
      }
    }

    // If we were not filled before, we'll zero out the rest of the buffer
    if ( !wasFilled || !isFilled ) {
      positionArray.fill( 0, index );
    }

    return isFilled;
  }

  /**
   * Creates a coordinate float array to be used with fillCrossSectionVertexArray, for three.js purposes.
   */
  public static createCrossSectionVertexArray(): Float32Array {
    return new Float32Array( CROSS_SECTION_SAMPLES * 3 * 3 * 2 );
  }

  /**
   * Fills the positionArray with a X,Z cross-section of the boat at a given y value (for a given liters value).
   */
  public static fillCrossSectionVertexArray( y: number, liters: number, positionArray: Float32Array ): void {
    const insideBottomY = -BoatDesign.DESIGN_BOAT_HEIGHT + BoatDesign.DESIGN_WALL_THICKNESS;
    const scale = Math.pow( liters, 1 / 3 ) * BoatDesign.ONE_LITER_SCALE_MULTIPLIER;
    const designY = y / scale + BoatDesign.DESIGN_CENTROID.y;

    // If we have a low enough value, just zero things out (won't show anything)
    if ( designY < insideBottomY || scale === 0 ) {
      for ( let i = 0; i < positionArray.length; i++ ) {
        positionArray[ i ] = 0;
      }
      return;
    }

    const controlPoints = BoatDesign.getControlPoints( BoatDesign.getHeightRatioFromDesignY( designY ), true );
    const cubic = new Cubic( ...controlPoints );

    for ( let i = 0; i < CROSS_SECTION_SAMPLES; i++ ) {
      const t0 = i / CROSS_SECTION_SAMPLES;
      const t1 = ( i + 1 ) / CROSS_SECTION_SAMPLES;

      const p0 = cubic.positionAt( t0 );
      const p1 = cubic.positionAt( t1 );

      const p0x = ( p0.x - BoatDesign.DESIGN_CENTROID.x ) * scale;
      const p0z = p0.y * scale;
      const p1x = ( p1.x - BoatDesign.DESIGN_CENTROID.x ) * scale;
      const p1z = p1.y * scale;

      ThreeUtils.writeQuad(
        positionArray, 6 * 3 * i,
        p0x, y, p0z,
        p1x, y, p1z,
        p1x, y, -p1z,
        p0x, y, -p0z
      );
    }
  }

  /**
   * Returns the one-liter model-coordinate main geometry for the bulk of the boat.
   */
  public static getPrimaryGeometry( liters = 1, includeExterior = true, includeGunwale = true, includeInterior = true, invertNormals = false ): THREE.BufferGeometry {
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    const parametricSamples = 50;
    const heightSamples = 30;

    const getRows = ( isInside: boolean ): Vector3[][] => _.range( 0, heightSamples ).map( sample => {
      const designY = ( -BoatDesign.DESIGN_BOAT_HEIGHT + ( isInside ? BoatDesign.DESIGN_WALL_THICKNESS : 0 ) ) * sample / ( heightSamples - 1 );
      const controlPoints = BoatDesign.getControlPoints( BoatDesign.getHeightRatioFromDesignY( designY ), isInside );
      const cubic = new Cubic( ...controlPoints );
      return _.range( 0, parametricSamples ).map( pSample => {
        const t = pSample / ( parametricSamples - 1 );
        const point = cubic.positionAt( t );
        return BoatDesign.designToModel( new Vector3( point.x, designY, point.y ), liters );
      } );
    } );
    const exteriorRows = getRows( false );
    const interiorRows = getRows( true );

    const normalizeRows = ( rows: Vector3[][] ) => rows.map( ( row, i ) => row.map( ( position, j ) => {
      // these will be null if they are not available
      const west = j > 0 ? row[ j - 1 ].minus( position ) : null;
      const east = j < row.length - 1 ? row[ j + 1 ].minus( position ) : null;
      const north = i > 0 ? rows[ i - 1 ][ j ].minus( position ) : null;
      const south = i < rows.length - 1 ? rows[ i + 1 ][ j ].minus( position ) : null;

      const cumulativeNormal = new Vector3( 0, 0, 0 );
      north && east && cumulativeNormal.add( north.cross( east ).normalize() );
      east && south && cumulativeNormal.add( east.cross( south ).normalize() );
      south && west && cumulativeNormal.add( south.cross( west ).normalize() );
      west && north && cumulativeNormal.add( west.cross( north ).normalize() );
      cumulativeNormal.normalize();
      return cumulativeNormal;
    } ) );

    const writeFlat = ( frontCurve: Vector3[], backCurve: Vector3[], normal: Vector3 ) => {
      assert && assert( frontCurve.length === backCurve.length );

      for ( let i = 0; i < frontCurve.length - 1; i++ ) {
        // Positions for our quad
        const pA = backCurve[ i ];
        const pB = backCurve[ i + 1 ];
        const pC = frontCurve[ i ];
        const pD = frontCurve[ i + 1 ];

        // UV coordinates for each side
        const uL = i / ( frontCurve.length - 1 );
        const uR = ( i + 1 ) / ( frontCurve.length - 1 );
        const vL = 0;
        const vR = 1; // TODO: better mapping for the boat bottom presumably?

        positions.push(
          pA.x, pA.y, pA.z,
          pC.x, pC.y, pC.z,
          pB.x, pB.y, pB.z,
          pC.x, pC.y, pC.z,
          pD.x, pD.y, pD.z,
          pB.x, pB.y, pB.z
        );
        normals.push(
          normal.x, normal.y, normal.z,
          normal.x, normal.y, normal.z,
          normal.x, normal.y, normal.z,
          normal.x, normal.y, normal.z,
          normal.x, normal.y, normal.z,
          normal.x, normal.y, normal.z
        );
        uvs.push(
          uL, vL,
          uL, vL,
          uR, vR,
          uL, vL,
          uR, vR,
          uR, vR
        );
      }
    };

    const writeGrid = ( rows: Vector3[][], normalRows: Vector3[][], reverse: boolean ) => _.range( 0, rows.length - 1 ).forEach( i => _.range( 0, rows[ i ].length - 1 ).forEach( j => {
      // Positions for our quad
      const pA = rows[ i ][ j ];
      const pB = rows[ i + 1 ][ j ];
      const pC = rows[ i ][ j + 1 ];
      const pD = rows[ i + 1 ][ j + 1 ];

      // Normals for our quad
      const nA = normalRows[ i ][ j ];
      const nB = normalRows[ i + 1 ][ j ];
      const nC = normalRows[ i ][ j + 1 ];
      const nD = normalRows[ i + 1 ][ j + 1 ];

      // UV coordinates for each side
      const uL = j / ( rows[ i ].length - 1 );
      const uR = ( j + 1 ) / ( rows[ i ].length - 1 );
      const vL = i / ( rows.length - 1 );
      const vR = ( i + 1 ) / ( rows.length - 1 );

      // TODO: better way to factor this out?
      if ( reverse ) {
        positions.push(
          pA.x, pA.y, pA.z,
          pB.x, pB.y, pB.z,
          pC.x, pC.y, pC.z,
          pC.x, pC.y, pC.z,
          pB.x, pB.y, pB.z,
          pD.x, pD.y, pD.z
        );
        normals.push(
          nA.x, nA.y, nA.z,
          nB.x, nB.y, nB.z,
          nC.x, nC.y, nC.z,
          nC.x, nC.y, nC.z,
          nB.x, nB.y, nB.z,
          nD.x, nD.y, nD.z
        );
        uvs.push(
          uL, vL,
          uR, vR,
          uL, vL,
          uL, vL,
          uR, vR,
          uR, vR
        );
      }
      else {
        positions.push(
          pA.x, pA.y, pA.z,
          pC.x, pC.y, pC.z,
          pB.x, pB.y, pB.z,
          pC.x, pC.y, pC.z,
          pD.x, pD.y, pD.z,
          pB.x, pB.y, pB.z
        );
        normals.push(
          nA.x, nA.y, nA.z,
          nC.x, nC.y, nC.z,
          nB.x, nB.y, nB.z,
          nC.x, nC.y, nC.z,
          nD.x, nD.y, nD.z,
          nB.x, nB.y, nB.z
        );
        uvs.push(
          uL, vL,
          uL, vL,
          uR, vR,
          uL, vL,
          uR, vR,
          uR, vR
        );
      }
    } ) );

    const flipZVector = new Vector3( 1, 1, -1 );
    const flipRow = ( row: Vector3[] ) => row.map( v => v.componentTimes( flipZVector ) );
    const negateRows = ( rows: Vector3[][] ) => rows.map( row => row.map( v => v.negated() ) );
    const flipRows = ( rows: Vector3[][] ) => rows.map( flipRow );

    const exteriorNormalRows = normalizeRows( exteriorRows );
    const interiorNormalRows = normalizeRows( interiorRows ); // TODO: we'll presumably need to reverse these

    // Z+ exterior side
    includeExterior && writeGrid( exteriorRows, negateRows( exteriorNormalRows ), true );

    // Z+ interior side
    includeInterior && writeGrid( interiorRows, interiorNormalRows, false );

    // Z- exterior side
    includeExterior && writeGrid( flipRows( exteriorRows ), flipRows( negateRows( exteriorNormalRows ) ), false );

    // Z- interior side
    includeInterior && writeGrid( flipRows( interiorRows ), flipRows( interiorNormalRows ), true );

    // Top of the boat bottom
    includeInterior && writeFlat( interiorRows[ interiorRows.length - 1 ], flipRow( interiorRows[ interiorRows.length - 1 ] ), new Vector3( 0, 1, 0 ) );

    // Bottom of the boat bottom
    includeExterior && writeFlat( flipRow( exteriorRows[ exteriorRows.length - 1 ] ), exteriorRows[ exteriorRows.length - 1 ], new Vector3( 0, -1, 0 ) );

    // Z+ gunwale
    includeGunwale && writeFlat( exteriorRows[ 0 ], interiorRows[ 0 ], new Vector3( 0, 1, 0 ) );

    // Z- gunwale
    includeGunwale && writeFlat( flipRow( interiorRows[ 0 ] ), flipRow( exteriorRows[ 0 ] ), new Vector3( 0, 1, 0 ) );

    // Stern gunwale
    const sternGunwaleRow = [
      interiorRows[ 0 ][ interiorRows[ 0 ].length - 1 ],
      exteriorRows[ 0 ][ exteriorRows[ 0 ].length - 1 ]
    ];
    includeGunwale && writeFlat( sternGunwaleRow, flipRow( sternGunwaleRow ), new Vector3( 0, 1, 0 ) );

    // Stern interior
    const sternInteriorRow = interiorRows.map( row => row[ row.length - 1 ] );
    includeInterior && writeFlat( flipRow( sternInteriorRow ), sternInteriorRow, new Vector3( -1, 0, 0 ) );

    // Stern exterior
    const sternExteriorRow = exteriorRows.map( row => row[ row.length - 1 ] );
    includeExterior && writeFlat( sternExteriorRow, flipRow( sternExteriorRow ), new Vector3( 1, 0, 0 ) );

    const boatGeometry = new THREE.BufferGeometry();
    boatGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );
    boatGeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( invertNormals ? normals.map( n => -n ) : normals ), 3 ) );
    boatGeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( uvs ), 2 ) );
    return boatGeometry;
  }

  /**
   * Returns a string that should be placed below in BoatDesign.js.
   */
  public static computeBoatData( samples = 1000 ): string {
    const desiredVolume = 0.001; // one liter

    const discretizationPoints = 1000;

    let externalAreaSum = 0;
    let areaSum = 0;
    let weightedCentroidSum = new Vector3( 0, 0, 0 );
    const sliceAreas: number[] = [];
    const externalSliceAreas: number[] = [];
    const internalSliceAreas: number[] = [];
    const designBounds = Bounds3.NOTHING;
    const designInteriorBottom = -BoatDesign.DESIGN_BOAT_HEIGHT + BoatDesign.DESIGN_WALL_THICKNESS;
    _.range( 0, samples ).forEach( i => {
      // unit area times the multiplier
      const y = ( i / ( samples - 1 ) - 1 ) * BoatDesign.DESIGN_BOAT_HEIGHT;
      const heightRatio = BoatDesign.getHeightRatioFromDesignY( y );
      const externalControlPoints = BoatDesign.getControlPoints( heightRatio, false );
      const internalControlPoints = BoatDesign.getControlPoints( heightRatio, true );
      const externalArea = BoatDesign.getAreaFromControlPoints( externalControlPoints );
      const internalArea = BoatDesign.getAreaFromControlPoints( internalControlPoints );
      const externalCentroid = Utils.centroidOfPolygon( BoatDesign.getDiscretizationFromControlPoints( externalControlPoints, discretizationPoints ) );
      const internalCentroid = Utils.centroidOfPolygon( BoatDesign.getDiscretizationFromControlPoints( internalControlPoints, discretizationPoints ) );

      externalControlPoints.forEach( point => {
        designBounds.addCoordinates( point.x, y, point.y );
        designBounds.addCoordinates( point.x, y, -point.y );
      } );

      const hasInside = y > designInteriorBottom;

      let area = externalArea;
      let weightedCentroid = externalCentroid.timesScalar( externalArea );

      if ( hasInside ) {
        area -= internalArea;
        weightedCentroid = weightedCentroid.minus( internalCentroid.timesScalar( internalArea ) );
      }

      sliceAreas.push( area );
      externalSliceAreas.push( externalArea );
      if ( hasInside ) {
        internalSliceAreas.push( internalArea );
      }
      else {
        internalSliceAreas.push( 0 );
      }

      areaSum += area;
      externalAreaSum += externalArea;

      weightedCentroidSum = weightedCentroidSum.plus( new Vector3( weightedCentroid.x, y * area, 0 ) );
    } );
    const displacedVolume = externalAreaSum / samples * BoatDesign.DESIGN_BOAT_HEIGHT;
    const actualVolume = areaSum / samples * BoatDesign.DESIGN_BOAT_HEIGHT;
    const oneLiterMultiplier = Math.pow( displacedVolume / desiredVolume, -1 / 3 );

    const centroid = weightedCentroidSum.timesScalar( 1 / areaSum );

    const oneLiterBounds = new Bounds3(
      ( designBounds.minX - centroid.x ) * oneLiterMultiplier,
      ( designBounds.minY - centroid.y ) * oneLiterMultiplier,
      ( designBounds.minZ - centroid.z ) * oneLiterMultiplier,
      ( designBounds.maxX - centroid.x ) * oneLiterMultiplier,
      ( designBounds.maxY - centroid.y ) * oneLiterMultiplier,
      ( designBounds.maxZ - centroid.z ) * oneLiterMultiplier
    );
    const oneLiterInteriorBottom = ( designInteriorBottom - centroid.y ) * oneLiterMultiplier;

    const oneLiterHeight = BoatDesign.DESIGN_BOAT_HEIGHT * oneLiterMultiplier;

    const oneLiterDisplacedAreas = externalSliceAreas.map( designArea => designArea * oneLiterMultiplier * oneLiterMultiplier );
    const oneLiterInternalAreas = internalSliceAreas.map( designArea => designArea * oneLiterMultiplier * oneLiterMultiplier );
    const oneLiterDisplacedCumulativeVolumes: number[] = [];
    const oneLiterInternalCumulativeVolumes: number[] = [];
    let cumulativeDisplacedArea = 0;
    oneLiterDisplacedAreas.forEach( area => {
      cumulativeDisplacedArea += area * oneLiterHeight / samples;
      oneLiterDisplacedCumulativeVolumes.push( cumulativeDisplacedArea );
    } );
    let cumulativeInternalArea = 0;
    oneLiterInternalAreas.forEach( area => {
      cumulativeInternalArea += area * oneLiterHeight / samples;
      oneLiterInternalCumulativeVolumes.push( cumulativeInternalArea );
    } );

    return `
// NOTE: machine generated by copy( phet.densityBuoyancyCommon.BoatDesign.computeBoatData() );
// If any parameters about the bottle shape changes, this should be recomputed.

BoatDesign.ONE_LITER_SCALE_MULTIPLIER = ${oneLiterMultiplier};
BoatDesign.DESIGN_CENTROID = new Vector3( ${centroid.x}, ${centroid.y}, ${centroid.z} );
BoatDesign.DESIGN_DISPLACED_VOLUME = ${displacedVolume};
BoatDesign.DESIGN_HULL_VOLUME = ${actualVolume};
BoatDesign.ONE_LITER_HEIGHT = ${oneLiterHeight};
BoatDesign.ONE_LITER_DISPLACED_AREAS = [ ${oneLiterDisplacedAreas.join( ', ' )} ];
BoatDesign.ONE_LITER_DISPLACED_VOLUMES = [ ${oneLiterDisplacedCumulativeVolumes.join( ', ' )} ];
BoatDesign.ONE_LITER_INTERNAL_AREAS = [ ${oneLiterInternalAreas.join( ', ' )} ];
BoatDesign.ONE_LITER_INTERNAL_VOLUMES = [ ${oneLiterInternalCumulativeVolumes.join( ', ' )} ];
BoatDesign.DESIGN_BOUNDS = new Bounds3( ${designBounds.minX}, ${designBounds.minY}, ${designBounds.minZ}, ${designBounds.maxX}, ${designBounds.maxY}, ${designBounds.maxZ} );
BoatDesign.ONE_LITER_BOUNDS = new Bounds3( ${oneLiterBounds.minX}, ${oneLiterBounds.minY}, ${oneLiterBounds.minZ}, ${oneLiterBounds.maxX}, ${oneLiterBounds.maxY}, ${oneLiterBounds.maxZ} );
BoatDesign.ONE_LITER_INTERIOR_BOTTOM = ${oneLiterInteriorBottom};
BoatDesign.ONE_LITER_HULL_VOLUME = BoatDesign.DESIGN_HULL_VOLUME * BoatDesign.ONE_LITER_SCALE_MULTIPLIER * BoatDesign.ONE_LITER_SCALE_MULTIPLIER * BoatDesign.ONE_LITER_SCALE_MULTIPLIER;
`;
  }

  /**
   * Replaces the main page with a debug view of the bottle, for debugging various curves and properties.
   *
   * phet.densityBuoyancyCommon.BoatDesign.getDebugCanvas()
   */
  public static getDebugCanvas(): HTMLCanvasElement {
    const canvas = document.createElement( 'canvas' );
    const context = canvas.getContext( '2d' )!;

    const width = 800;
    const height = 400;

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.scale( pixelRatio, pixelRatio );

    const scale = width / 210;

    const mapX = ( x: number ) => ( x + 5 ) * scale;
    const mapY = ( y: number ) => -y * scale + height / 2;

    const cubic = ( points: Vector2[] ) => {
      context.moveTo( mapX( points[ 0 ].x ), mapY( points[ 0 ].y ) );
      context.bezierCurveTo(
        mapX( points[ 1 ].x ), mapY( points[ 1 ].y ),
        mapX( points[ 2 ].x ), mapY( points[ 2 ].y ),
        mapX( points[ 3 ].x ), mapY( points[ 3 ].y )
      );
      context.moveTo( mapX( points[ 0 ].x ), mapY( -points[ 0 ].y ) );
      context.bezierCurveTo(
        mapX( points[ 1 ].x ), mapY( -points[ 1 ].y ),
        mapX( points[ 2 ].x ), mapY( -points[ 2 ].y ),
        mapX( points[ 3 ].x ), mapY( -points[ 3 ].y )
      );
    };

    const boatProfile = ( points: Vector2[] ) => {
      cubic( points );
      context.moveTo( mapX( points[ 3 ].x ), mapY( points[ 3 ].y ) );
      context.lineTo( mapX( points[ 3 ].x ), mapY( -points[ 3 ].y ) );
    };

    context.strokeStyle = 'red';
    context.beginPath();
    boatProfile( BoatDesign.getControlPoints( 1, false ) );
    context.stroke();

    context.strokeStyle = 'blue';
    context.beginPath();
    boatProfile( BoatDesign.getControlPoints( 1, true ) );
    context.stroke();

    context.strokeStyle = 'green';
    context.beginPath();
    boatProfile( BoatDesign.getControlPoints( 0, false ) );
    context.stroke();

    context.strokeStyle = 'magenta';
    context.beginPath();
    boatProfile( BoatDesign.getControlPoints( 0, true ) );
    context.stroke();

    const numSections = 20;
    _.range( 0, numSections ).forEach( i => {
      const ix = 1 - i / ( numSections - 1 );
      const z = 0.06 * ix;

      context.strokeStyle = Color.MAGENTA.blend( Color.ORANGE, ix ).toCSS();
      context.beginPath();
      BoatDesign.getIntersectionVertices( z ).forEach( ( point, index ) => {
        const method = index > 0 ? 'lineTo' : 'moveTo';
        context[ method ]( 600 + 1000 * point.x, 230 - 1000 * point.y );
      } );
      context.closePath();
      context.stroke();
    } );

    while ( document.body.childNodes[ 0 ] ) {
      document.body.removeChild( document.body.childNodes[ 0 ] );
    }
    document.body.appendChild( canvas );
    document.body.style.background = 'white';

    return canvas;
  }

  // NOTE: machine generated by copy( phet.densityBuoyancyCommon.BoatDesign.computeBoatData() );
  // If any parameters about the bottle shape changes, this should be recomputed.

  public static readonly DESIGN_WALL_THICKNESS = 3;
  public static readonly DESIGN_BOAT_HEIGHT = 50;

  // Multiplying the design coordinates by this value will result in a boat whose displaced volume
  // is equal to one liter.
  public static readonly ONE_LITER_SCALE_MULTIPLIER = 0.0011528037167371562;

  // The centroid of the hull of the boat, in design coordinates
  public static readonly DESIGN_CENTROID = new Vector3( 126.88244020948837, -30.94499592502117, 0 );

  public static readonly DESIGN_DISPLACED_VOLUME = 652730.4843871365;
  public static readonly DESIGN_HULL_VOLUME = 89480.00833710891;
  public static readonly ONE_LITER_HEIGHT = 0.05764018583685781;
  public static readonly ONE_LITER_DISPLACED_AREAS = [ 0.011127950045645688, 0.011387685302992168, 0.011496188865452587, 0.011579811084035108, 0.011650553771290935, 0.011713065728267948, 0.011769731143167084, 0.01182196633314039, 0.011870694107164024, 0.011916555450541962, 0.011960017060772437, 0.012001431256769009, 0.012041071755281327, 0.012079156228871407, 0.012115861165615744, 0.0121513320169944, 0.012185690340745247, 0.012219038959624746, 0.012251465770779995, 0.012283046613585239, 0.012313847465651546, 0.012343926149905093, 0.012373333679545708, 0.012402115330567757, 0.012430311506402086, 0.012457958441900804, 0.012485088781710046, 0.012511732059384342, 0.012537915097300963, 0.01256366234281116, 0.012588996152630611, 0.012613937034889458, 0.0126385038563005, 0.012662714020399621, 0.012686583621647332, 0.012710127579270652, 0.012733359754008628, 0.012756293050357229, 0.012778939506456003, 0.012801310373394478, 0.01282341618542185, 0.0128452668223036, 0.012866871564872595, 0.012888239144661208, 0.012909377788367267, 0.012930295257796475, 0.012950998885831165, 0.0129714956088983, 0.012991791996344162, 0.013011894277068716, 0.013031808363725536, 0.013051539874754034, 0.013071094154476584, 0.013090476291464358, 0.013109691135350683, 0.013128743312249487, 0.013147637238917532, 0.013166377135783534, 0.01318496703895282, 0.013203410811284514, 0.013221712152627109, 0.01323987460928953, 0.013257901582816155, 0.013275796338127407, 0.013293562011081075, 0.013311201615503926, 0.013328718049738354, 0.01334611410274422, 0.013363392459792341, 0.013380555707782581, 0.01339760634021621, 0.013414546761849807, 0.013431379293055106, 0.013448106173907327, 0.013464729568022256, 0.013481251566160783, 0.013497674189617857, 0.013513999393411368, 0.013530229069285322, 0.013546365048540213, 0.013562409104702734, 0.013578362956045696, 0.013594228267968422, 0.013610006655246865, 0.01362569968416211, 0.013641308874515144, 0.013656835701535282, 0.013672281597689028, 0.013687647954395598, 0.013702936123654986, 0.01371814741959393, 0.013733283119934794, 0.013748344467391958, 0.01376333267100018, 0.013778248907378731, 0.013793094321935297, 0.013807870030012886, 0.013822577117983167, 0.013837216644289208, 0.01385178964044046, 0.013866297111962585, 0.013880740039304696, 0.013895119378706232, 0.01390943606302571, 0.013923691002533337, 0.013937885085669394, 0.013952019179770245, 0.013966094131763522, 0.013980110768834202, 0.013994069899062964, 0.014007972312038246, 0.014021818779443343, 0.014035610055619716, 0.014049346878107771, 0.014063029968166116, 0.014076660031270331, 0.01409023775759236, 0.014103763822461235, 0.014117238886806188, 0.014130663597582882, 0.014144038588183534, 0.014157364478831744, 0.01417064187696258, 0.014183871377588779, 0.014197053563653503, 0.01421018900637033, 0.01422327826555106, 0.014236321889921785, 0.014249320417427845, 0.014262274375528034, 0.014275184281478571, 0.014288050642607283, 0.014300873956578345, 0.014313654711648081, 0.014326393386912032, 0.01433909045254382, 0.014351746370026048, 0.014364361592373524, 0.01437693656434924, 0.01438947172267328, 0.014401967496224953, 0.014414424306238504, 0.014426842566492527, 0.01443922268349345, 0.014451565056653161, 0.014463870078461222, 0.014476138134651605, 0.014488369604364422, 0.01450056486030264, 0.014512724268884053, 0.014524848190388684, 0.014536936979101764, 0.014548990983452451, 0.014561010546148471, 0.014572996004306773, 0.014584947689580397, 0.014596865928281666, 0.014608751041501798, 0.014620603345227141, 0.014632423150452068, 0.014644210763288685, 0.014655966485073493, 0.014667690612471014, 0.014679383437574606, 0.01469104524800444, 0.014702676327002848, 0.014714276953527023, 0.01472584740233926, 0.014737387944094706, 0.014748898845426855, 0.014760380369030662, 0.014771832773743538, 0.014783256314624193, 0.01479465124302942, 0.014806017806688858, 0.01481735624977789, 0.014828666812988585, 0.014839949733598902, 0.014851205245540096, 0.014862433579462436, 0.014873634962799257, 0.014884809619829456, 0.014895957771738348, 0.01490707963667716, 0.01491817542982092, 0.014929245363424994, 0.014940289646880295, 0.01495130848676707, 0.014962302086907447, 0.014973270648416722, 0.014984214369753423, 0.014995133446768179, 0.01500602807275144, 0.015016898438480114, 0.015027744732263055, 0.015038567139985566, 0.015049365845152814, 0.015060141028932305, 0.015070892870195352, 0.015081621545557615, 0.01509232722941872, 0.015103010094000988, 0.015113670309387327, 0.015124308043558235, 0.015134923462427981, 0.015145516729880073, 0.015156088007801832, 0.015166637456118294, 0.015177165232825349, 0.015187671494022151, 0.015198156393942848, 0.015208620084987641, 0.015219062717753156, 0.015229484441062197, 0.015239885401992831, 0.015250265745906943, 0.015260625616478085, 0.015270965155718838, 0.01528128450400756, 0.015291583800114604, 0.01530186318122795, 0.01531212278297841, 0.015322362739464223, 0.015332583183275178, 0.015342784245516312, 0.015352966055831039, 0.015363128742423869, 0.015373272432082695, 0.015383397250200576, 0.015393503320797152, 0.015403590766539594, 0.015413659708763176, 0.015423710267491423, 0.015433742561455894, 0.01544375670811556, 0.015453752823675792, 0.015463731023107073, 0.015473691420163234, 0.01548363412739944, 0.015493559256189775, 0.015503466916744528, 0.015513357218127173, 0.015523230268270955, 0.015533086173995264, 0.015542925041021637, 0.015552746973989524, 0.015562552076471671, 0.015572340450989337, 0.015582112199027155, 0.015591867421047756, 0.015601606216506102, 0.015611328683863598, 0.015621034920601929, 0.01563072502323665, 0.01564039908733054, 0.01565005720750672, 0.015659699477461524, 0.01566932598997719, 0.015678936836934255, 0.015688532109323815, 0.0156981118972595, 0.015707676289989297, 0.01571722537590714, 0.01572675924256431, 0.01573627797668062, 0.015745781664155474, 0.015755270390078638, 0.015764744238740917, 0.01577420329364461, 0.0157836476375138, 0.015793077352304466, 0.015802492519214423, 0.01581189321869313, 0.01582127953045129, 0.015830651533470314, 0.015840009306011642, 0.01584935292562587, 0.015858682469161802, 0.01586799801277525, 0.01587729963193781, 0.015886587401445402, 0.01589586139542671, 0.015905121687351496, 0.01591436835003878, 0.015923601455664856, 0.015932821075771215, 0.01594202728127235, 0.015951220142463408, 0.015960399729027724, 0.015969566110044277, 0.015978719353995006, 0.015987859528771953, 0.015996986701684427, 0.01600610093946594, 0.016015202308281084, 0.0160242908737323, 0.016033366700866556, 0.01604242985418188, 0.016051480397633856, 0.016060518394641964, 0.016069543908095882, 0.01607855700036161, 0.01608755773328761, 0.01609654616821076, 0.016105522365962292, 0.016114486386873555, 0.016123438290781826, 0.016132378137035875, 0.01614130598450158, 0.01615022189156741, 0.016159125916149784, 0.01616801811569847, 0.016176898547201755, 0.016185767267191654, 0.016194624331749036, 0.016203469796508586, 0.016212303716663806, 0.0162211261469719, 0.01622993714175854, 0.01623873675492266, 0.01624752503994112, 0.01625630204987331, 0.016265067837365706, 0.016273822454656358, 0.016282565953579305, 0.016291298385568934, 0.01630001980166429, 0.016308730252513313, 0.016317429788377014, 0.016326118459133624, 0.016334796314282626, 0.016343463402948805, 0.01635211977388617, 0.016360765475481917, 0.01636940055576021, 0.016378025062386035, 0.016386639042668932, 0.016395242543566696, 0.01640383561168902, 0.016412418293301125, 0.016420990634327264, 0.01642955268035428, 0.016438104476635036, 0.016446646068091833, 0.016455177499319813, 0.01646369881459023, 0.016472210057853782, 0.016480711272743823, 0.016489202502579566, 0.016497683790369273, 0.016506155178813302, 0.016514616710307253, 0.016523068426944974, 0.016531510370521557, 0.016539942582536295, 0.016548365104195637, 0.01655677797641602, 0.016565181239826768, 0.016573574934772874, 0.016581959101317798, 0.016590333779246184, 0.01659869900806659, 0.016607054827014175, 0.016615401275053298, 0.01662373839088017, 0.016632066212925394, 0.016640384779356546, 0.016648694128080677, 0.016656994296746767, 0.01666528532274822, 0.01667356724322525, 0.016681840095067325, 0.016690103914915464, 0.016698358739164622, 0.01670660460396598, 0.01671484154522924, 0.016723069598624844, 0.016731288799586224, 0.016739499183312016, 0.016747700784768192, 0.016755893638690247, 0.016764077779585277, 0.016772253241734137, 0.016780420059193446, 0.01678857826579768, 0.016796727895161186, 0.01680486898068016, 0.01681300155553465, 0.016821125652690505, 0.0168292413049013, 0.01683734854471024, 0.01684544740445205, 0.01685353791625486, 0.016861620112042012, 0.016869694023533915, 0.01687775968224982, 0.01688581711950963, 0.016893866366435636, 0.016901907453954274, 0.016909940412797825, 0.01691796527350615, 0.01692598206642835, 0.016933990821724424, 0.01694199156936694, 0.016949984339142635, 0.016957969160654045, 0.016965946063321077, 0.016973915076382597, 0.01698187622889798, 0.016989829549748647, 0.016997775067639605, 0.017005712811100908, 0.0170136428084892, 0.017021565087989153, 0.017029479677614933, 0.017037386605211632, 0.017045285898456712, 0.017053177584861405, 0.017061061691772093, 0.01706893824637171, 0.0170768072756811, 0.017084668806560354, 0.01709252286571016, 0.01710036947967312, 0.017108208674835063, 0.017116040477426327, 0.017123864913523034, 0.017131682009048386, 0.017139491789773892, 0.017147294281320596, 0.017155089509160348, 0.01716287749861698, 0.01717065827486752, 0.01717843186294337, 0.017186198287731512, 0.017193957573975634, 0.01720170974627731, 0.017209454829097123, 0.01721719284675581, 0.01722492382343536, 0.017232647783180143, 0.017240364749897975, 0.017248074747361224, 0.017255777799207877, 0.017263473928942594, 0.017271163159937767, 0.017278845515434554, 0.017286521018543912, 0.01729418969224761, 0.017301851559399242, 0.017309506642725233, 0.017317154964825804, 0.017324796548175994, 0.01733243141512657, 0.017340059587905042, 0.01734768108861657, 0.01735529593924494, 0.01736290416165347, 0.017370505777585945, 0.017378100808667522, 0.017385689276405644, 0.017393271202190915, 0.017400846607298015, 0.01740841551288656, 0.017415977940001964, 0.017423533909576332, 0.01743108344242927, 0.01743862655926876, 0.01744616328069198, 0.017453693627186153, 0.01746121761912935, 0.01746873527679128, 0.01747624662033416, 0.017483751669813436, 0.01749125044517863, 0.017498742966274104, 0.01750622925283981, 0.017513709324512093, 0.01752118320082443, 0.017528650901208195, 0.01753611244499339, 0.017543567851409397, 0.017551017139585703, 0.01755846032855264, 0.017565897437242062, 0.01757332848448811, 0.01758075348902788, 0.017588172469502138, 0.017595585444456004, 0.017602992432339638, 0.017610393451508933, 0.017617788520226163, 0.017625177656660673, 0.017632560878889526, 0.017639938204898172, 0.01764730965258108, 0.017654675239742384, 0.017662034984096533, 0.017669388903268902, 0.017676737014796454, 0.017684079336128304, 0.01769141588462639, 0.017698746677566043, 0.017706071732136598, 0.017713391065442022, 0.017720704694501464, 0.017728012636249867, 0.01773531490753854, 0.017742611525135742, 0.017749902505727257, 0.01775718786591695, 0.017764467622227338, 0.01777174179110013, 0.017779010388896815, 0.01778627343189917, 0.01779353093630982, 0.017800782918252777, 0.01780802939377397, 0.01781527037884179, 0.01782250588934756, 0.017829735941106123, 0.017836960549856316, 0.017844179731261494, 0.01785139350091003, 0.017858601874315806, 0.01786580486691874, 0.017873002494085258, 0.017880194771108776, 0.017887381713210207, 0.01789456333553842, 0.01790173965317073, 0.017908910681113364, 0.017916076434301938, 0.017923236927601907, 0.017930392175809034, 0.01793754219364985, 0.017944686995782104, 0.017951826596795197, 0.017958961011210656, 0.017966090253482555, 0.017973214337997954, 0.017980333279077332, 0.01798744709097505, 0.017994555787879722, 0.018001659383914667, 0.018008757893138348, 0.01801585132954475, 0.018022939707063826, 0.018030023039561888, 0.018037101340842014, 0.018044174624644457, 0.018051242904647057, 0.018058306194465593, 0.018065364507654235, 0.018072417857705882, 0.018079466258052596, 0.018086509722065935, 0.018093548263057382, 0.01810058189427869, 0.018107610628922265, 0.018114634480121548, 0.018121653460951365, 0.018128667584428312, 0.018135676863511096, 0.01814268131110092, 0.018149680940041803, 0.018156675763120987, 0.018163665793069248, 0.018170651042561235, 0.018177631524215865, 0.01818460725059661, 0.018191578234211886, 0.01819854448751534, 0.018205506022906246, 0.018212462852729778, 0.018219414989277368, 0.018226362444787036, 0.018233305231443724, 0.01824024336137957, 0.01824717684667428, 0.018254105699355417, 0.01826102993139874, 0.01826794955472847, 0.01827486458121766, 0.018281775022688452, 0.018288680890912404, 0.01829558219761079, 0.018302478954454908, 0.01830937117306636, 0.018316258865017355, 0.018323142041831008, 0.01833002071498165, 0.01833689489589506, 0.0183437645959488, 0.018350629826472488, 0.018357490598748083, 0.01836434692401015, 0.018371198813446156, 0.018378046278196742, 0.018384889329355985, 0.018391727977971683, 0.01839856223504561, 0.018405392111533827, 0.018412217618346872, 0.0184190387663501, 0.018425855566363898, 0.018432668029163962, 0.018439476165481552, 0.018446279986003743, 0.018453079501373697, 0.018459874722190888, 0.018466665659011377, 0.01847345232234805, 0.018480234722670862, 0.01848701287040709, 0.018493786775941563, 0.018500556449616918, 0.018507321901733848, 0.018514083142551305, 0.018520840182286755, 0.01852759303111644, 0.018534341699175564, 0.018541086196558546, 0.01854782653331926, 0.01855456271947124, 0.01856129476498793, 0.01856802267980288, 0.018574746473810008, 0.018581466156863777, 0.018588181738779436, 0.018594893229333255, 0.01860160063826271, 0.018608303975266725, 0.01861500325000586, 0.018621698472102547, 0.01862838965114128, 0.01863507679666884, 0.018641759918194493, 0.018648439025190207, 0.01865511412709084, 0.018661785233294342, 0.018668452353161998, 0.018675115496018562, 0.018681774671152514, 0.018688429887816223, 0.01869508115522616, 0.01870172848256308, 0.018708371878972237, 0.018715011353563543, 0.018721646915411783, 0.018728278573556804, 0.0187349063370037, 0.01874153021472299, 0.018748150215650804, 0.018754766348689087, 0.018761378622705764, 0.01876798704653493, 0.018774591628976992, 0.018781192378798946, 0.01878778930473443, 0.018794382415484003, 0.01880097171971526, 0.018807557226063032, 0.018814138943129548, 0.018820716879484625, 0.018827291043665807, 0.018833861444178583, 0.018840428089496496, 0.018846990988061352, 0.01885355014828339, 0.018860105578541408, 0.01886665728718296, 0.018873205282524525, 0.018879749572851632, 0.01888629016641906, 0.01889282707145098, 0.018899360296141088, 0.018905889848652827, 0.018912415737119482, 0.01891893796964436, 0.018925456554300963, 0.018931971499133098, 0.01893848281215506, 0.018944990501351785, 0.018951494574678988, 0.01895799504006331, 0.018964491905402475, 0.018970985178565457, 0.01897747486739257, 0.01898396097969567, 0.01899044352325828, 0.018996922505835723, 0.019003397935155285, 0.019009869818916322, 0.019016338164790456, 0.01902280298042166, 0.01902926427342643, 0.01903572205139391, 0.019042176321886047, 0.019048627092437685, 0.01905507437055675, 0.019061518163724367, 0.01906795847939498, 0.019074395324996492, 0.019080828707930413, 0.01908725863557196, 0.01909368511527023, 0.019100108154348285, 0.019106527760103312, 0.01911294393980674, 0.019119356700704353, 0.01912576605001647, 0.01913217199493797, 0.01913857454263853, 0.019144973700262677, 0.019151369474929927, 0.019157761873734917, 0.01916415090374752, 0.01917053657201297, 0.019176918885551973, 0.019183297851360828, 0.019189673476411564, 0.019196045767652038, 0.019202414732006047, 0.019208780376373483, 0.01921514270763037, 0.01922150173262908, 0.019227857458198373, 0.019234209891143536, 0.01924055903824651, 0.019246904906265957, 0.01925324750193743, 0.019259586831973433, 0.019265922903063563, 0.019272255721874614, 0.019278585295050662, 0.019284911629213215, 0.019291234730961268, 0.01929755460687148, 0.019303871263498203, 0.019310184707373636, 0.019316494945007916, 0.019322801982889225, 0.019329105827483893, 0.019335406485236503, 0.019341703962569977, 0.019347998265885704, 0.019354289401563616, 0.01936057737596231, 0.019366862195419145, 0.019373143866250313, 0.019379422394750972, 0.019385697787195327, 0.019391970049836747, 0.01939823918890782, 0.019404505210620496, 0.019410768121166152, 0.019417027926715697, 0.019423284633419687, 0.019429538247408368, 0.019435788774791823, 0.01944203622166003, 0.019448280594082986, 0.01945452189811075, 0.0194607601397736, 0.01946699532508205, 0.01947322746002701, 0.019479456550579827, 0.01948568260269239, 0.019491905622297235, 0.019498125615307598, 0.019504342587617542, 0.019510556545102004, 0.019516767493616916, 0.019522975438999272, 0.019529180387067222, 0.019535382343620154, 0.019541581314438772, 0.019547777305285195, 0.019553970321903022, 0.019560160370017437, 0.01956634745533527, 0.019572531583545095, 0.01957871276031731, 0.019584890991304196, 0.01959106628214004, 0.019597238638441178, 0.01960340806580608, 0.01960957456981545, 0.0196157381560323, 0.019621898830001993, 0.019628056597252374, 0.01963421146329382, 0.0196403634336193, 0.019646512513704494, 0.01965265870900784, 0.019658802024970605, 0.01966494246701699, 0.01967108004055417, 0.0196772147509724, 0.01968334660364507, 0.019689475603928787, 0.019695601757163415, 0.01970172506867222, 0.019707845543761888, 0.01971396318772259, 0.019720078005828087, 0.019726190003335795, 0.019732299185486836, 0.019738405557506125, 0.019744509124602422, 0.019750609891968453, 0.0197567078647809, 0.019762803048200536, 0.019768895447372266, 0.019774985067425182, 0.01978107191347267, 0.01978715599061244, 0.019793237303926625, 0.019799315858481808, 0.019805391659329118, 0.0198114647115043, 0.019817535020027765, 0.019823602589904652, 0.019829667426124905, 0.019835729533663336, 0.019841788917479678, 0.019847845582518675, 0.019853899533710098, 0.019859950775968874, 0.019865999314195092, 0.01987204515327407, 0.019878088298076475, 0.019884128753458307, 0.01989016652426101, 0.01989620161531153, 0.01990223403142234, 0.019908263777391546, 0.019914290858002927, 0.019920315278025978, 0.019926337042216007, 0.019932356155314152, 0.01993837262204749, 0.019944386447129033, 0.019950397635257862, 0.019956406191119092, 0.01996241211938402, 0.019968415424710124, 0.01997441611174116, 0.01998041418510717, 0.01998640964942458, 0.019992402509296243, 0.019998392769311497, 0.02000438043404621, 0.020010365508062844, 0.020016347995910514, 0.020022327902125034, 0.020028305231228977, 0.020034279987731725, 0.02004025217612952, 0.020046221800905522, 0.02005218886652988, 0.020058153377459746, 0.020064115338139354, 0.020070074753000076, 0.02007603162646045, 0.02008198596292628, 0.02008793776679061, 0.020093887042433853, 0.02009983379422379, 0.020105778026515652, 0.020111719743652164, 0.020117658949963566, 0.020123595649767713, 0.02012952984737008, 0.020135461547063846, 0.02014139075312991, 0.020147317469836966, 0.020153241701441553, 0.020159163452188072, 0.02016508272630887, 0.020170999528024283, 0.020176913861542644, 0.020182825731060394, 0.020188735140762065, 0.020194642094820386, 0.0202005465973963, 0.02020644865263898, 0.02021234826468595, 0.020218245437663058, 0.020224140175684576, 0.0202300324828532, 0.020235922363260137, 0.020241809820985106, 0.020247694860096456, 0.0202535774846511, 0.020259457698694663, 0.020265335506261483, 0.020271210911374637, 0.020277083918046022, 0.020282954530276377, 0.020288822752055326, 0.02029468858736144, 0.02030055204016225, 0.02030641311441431, 0.020312271814063237, 0.020318128143043762, 0.020323982105279734, 0.020329833704684226, 0.020335682945159507, 0.020341529830597137, 0.020347374364877987, 0.020353216551872253, 0.020359056395439577, 0.020364893899428985, 0.020370729067679005, 0.02037656190401767, 0.020382392412262584, 0.02038822059622092, 0.0203940464596895, 0.02039987000645483, 0.020405691240293105, 0.02041151016497029, 0.020417326784242153, 0.020423141101854263, 0.020428953121542064, 0.020434762847030934, 0.02044057028203615, 0.020446375430263026, 0.020452178295406857, 0.020457978881153, 0.020463777191176934, 0.020469573229144236, 0.020475366998710685, 0.02048115850352224, 0.02048694774721512, 0.02049273473341582, 0.020498519465741157, 0.02050430194779829, 0.02051008218318476, 0.02051586017548856, 0.020521635928288127, 0.020527409445152377, 0.020533180729640794, 0.02053894978530339, 0.020544716615680803, 0.0205504812243043, 0.020556243614695806, 0.02056200379036798, 0.020567761754824193, 0.02057351751155859, 0.02057927106405615, 0.020585022415792655, 0.020590771570234798, 0.020596518530840147, 0.020602263301057244, 0.02060800588432559, 0.020613746284075675, 0.020619484503729076, 0.020625220546698398, 0.020630954416387366, 0.020636686116190864, 0.020642415649494927, 0.020648143019676782, 0.02065386823010492, 0.02065959128413908, 0.020665312185130288, 0.020671030936420934, 0.02067674754134475, 0.020682462003226845, 0.020688174325383772, 0.020693884511123535, 0.020699592563745626, 0.020705298486541047, 0.020711002282792334, 0.02071670395577363, 0.020722403508750653, 0.020728100944980784, 0.020733796267713055, 0.0207394894801882, 0.020745180585638685, 0.020750869587288712, 0.0207565564883543, 0.020762241292043255, 0.020767924001555242, 0.020773604620081793, 0.02077928315080634, 0.020784959596904247, 0.020790633961542848, 0.02079630624788144, 0.020801976459071368, 0.020807644598255987, 0.020813310668570756, 0.020818974673143205, 0.020824636615093015, 0.02083029649753202, 0.020835954323564214, 0.020841610096285833, 0.020847263818785336, 0.020852915494143445 ];
  public static readonly ONE_LITER_DISPLACED_VOLUMES = [ 6.414171086142878e-7, 0.0000012978054057304108, 0.0000019604478683507135, 0.000002627910331190203, 0.0000032994504156697173, 0.000003974593700966412, 0.000004653003191308415, 0.000005334423527707704, 0.000006018652542057131, 0.00000670552501276159, 0.000007394902618756504, 0.000008086667346704944, 0.0000087807169603543, 0.000009476961770138886, 0.000010175322259298546, 0.000010875727294923464, 0.000011578112750714423, 0.000012282420427094999, 0.00001298859719089666, 0.0000136965942803465, 0.000014406366736633375, 0.000015117872933870353, 0.00001583107418658082, 0.000016545934419004888, 0.000017262419884243936, 0.00001798049892398295, 0.000018700141761550385, 0.00001942132032259427, 0.000020144008078809444, 0.000020868179911040612, 0.000021593811988777728, 0.000022320881663603178, 0.00002304936737458018, 0.000023779248563915, 0.000024510505601501588, 0.00002524311971718092, 0.000025977072939729545, 0.000026712348041741553, 0.00002744892848969164, 0.000028186798398569395, 0.000028925942490560482, 0.000029666346057322084, 0.000030407994925460322, 0.00003115087542486846, 0.000031894974359628154, 0.00003264027898121298, 0.000033386776963765225, 0.00003413445638124411, 0.00003488330568626719, 0.00003563331369048698, 0.00003638446954636244, 0.00003713676273020042, 0.00003789018302635552, 0.000038644720512488504, 0.00003940036554579393, 0.00004015710875011639, 0.00004091494100388319, 0.000041673853428787904, 0.00004243383737916599, 0.00004319488443200881, 0.00004395698637756768, 0.00004472013521050382, 0.000045484323121544116, 0.000046249542489606057, 0.000047015785874358566, 0.0000477830460091881, 0.0000485513157945421, 0.000049320588291624185, 0.000050090856716417477, 0.00005086211443401449, 0.00005163435495323362, 0.000052407571921503864, 0.000053181759120000886, 0.0000539569104590187, 0.00005473301997356254, 0.000055510081819149473, 0.00005628809026780441, 0.00005706703970423982, 0.00005784692462220868, 0.000058627739621020455, 0.00005940947940221101, 0.00006019213876635779, 0.00006097571261003215, 0.00006176019592288145, 0.00006254558378483377, 0.00006333187136341879, 0.00006411905391119872, 0.00006490712676330337, 0.00006569608533506421, 0.00006648592511974228, 0.00006727664168634509, 0.00006806823067752831, 0.00006886068780757792, 0.00006965400886046886, 0.00007044818968799665, 0.0000712432262079783, 0.00007203911440251942, 0.00007283585031634426, 0.00007363343005518595, 0.00007443184978423401, 0.00007523110572663662, 0.00007603119416205525, 0.00007683211142526921, 0.0000776338539048279, 0.00007843641804174891, 0.00007923980032825967, 0.00008004399730658103, 0.00008084900556775093, 0.00008165482175048638, 0.00008246144254008235, 0.0000832688646673458, 0.00008407708490756365, 0.00008488610007950324, 0.00008569590704444385, 0.00008650650270523825, 0.00008731788400540294, 0.00008813004792823607, 0.00008894299149596189, 0.00008975671176890071, 0.00009057120584466351, 0.0000913864708573701, 0.00009220250397689008, 0.00009301930240810577, 0.00009383686339019608, 0.00009465518419594088, 0.00009547426213104494, 0.00009629409453348065, 0.00009711467877284906, 0.00009793601224975853, 0.00009875809239522022, 0.00009958091667006004, 0.00010040448256434636, 0.00010122878759683302, 0.00010205382931441703, 0.00010287960529161058, 0.00010370611313002672, 0.00010453335045787847, 0.0001053613149294907, 0.00010619000422482451, 0.00010701941604901361, 0.00010784954813191241, 0.00010868039822765532, 0.00010951196411422704, 0.00011034424359304337, 0.00011117723448854231, 0.00011201093464778498, 0.00011284534194006633, 0.00011368045425653498, 0.00011451626950982224, 0.00011535278563367979, 0.00011619000058262594, 0.00011702791233160007, 0.00011786651887562504, 0.00011870581822947748, 0.0001195458084273655, 0.00012038648752261377, 0.00012122785358735562, 0.00012206990471223217, 0.00012291263900609804, 0.00012375605459573363, 0.0001246001496255637, 0.0001254449222573821, 0.00012629037067008245, 0.00012713649305939474, 0.0001279832876376274, 0.000128830752633415, 0.0001296788862914713, 0.00013052768687234735, 0.00013137715265219483, 0.00013222728192253423, 0.00013307807299002786, 0.0001339295241762574, 0.00013478163381750626, 0.00013563440026454596, 0.00013648782188242735, 0.00013734189705027548, 0.000138196624161089, 0.00013905200162154325, 0.0001399080278517975, 0.0001407647012853057, 0.000141622020368631, 0.00014247998356126424, 0.00014333858933544523, 0.00014419783617598814, 0.00014505772258010987, 0.00014591824705726173, 0.0001467794081289644, 0.00014764120432864583, 0.00014850363420148237, 0.00014936669630424268, 0.00015023038920513457, 0.00015109471148365476, 0.00015195966173044126, 0.00015282523854712846, 0.00015369144054620497, 0.00015455826635087382, 0.00015542571459491527, 0.00015629378392255223, 0.00015716247298831767, 0.00015803178045692477, 0.00015890170500313915, 0.00015977224531165332, 0.0001606434000769634, 0.00016151516800324797, 0.00016238754780424893, 0.00016326053820315447, 0.00016413413793248393, 0.00016500834573397483, 0.0001658831603584716, 0.00016675858056581618, 0.00016763460512474068, 0.00016851123281276154, 0.00016938846241607562, 0.00017026629272945797, 0.00017114472255616125, 0.0001720237507078168, 0.0001729033760043373, 0.0001737835972738211, 0.000174664413352458, 0.00017554582308443648, 0.00017642782532185263, 0.0001773104189246203, 0.00017819360276038278, 0.00017907737570442583, 0.0001799617366395922, 0.00018084668445619728, 0.00018173221805194617, 0.00018261833633185205, 0.0001835050382081558, 0.00018439232260024686, 0.00018528018843458512, 0.00018616863464462433, 0.00018705766017073638, 0.00018794726396013692, 0.00018883744496681193, 0.00018972820215144547, 0.00019061953448134856, 0.00019151144093038897, 0.00019240392047892218, 0.00019329697211372331, 0.00019419059482792006, 0.00019508478762092648, 0.00019597954949837794, 0.00019687487947206696, 0.0001977707765598798, 0.00019866723978573418, 0.0001995642681795178, 0.00020046186077702765, 0.00020136001661991035, 0.00020225873475560318, 0.00020315801423727607, 0.00020405785412377423, 0.00020495825347956176, 0.00020585921137466595, 0.0002067607268846223, 0.00020766279909042044, 0.00020856542707845067, 0.00020946860994045126, 0.0002103723467734565, 0.00021127663667974545, 0.00021218147876679127, 0.00021308687214721146, 0.00021399281593871853, 0.00021489930926407147, 0.0002158063512510278, 0.0002167139410322963, 0.00021762207774549038, 0.00021853076053308194, 0.000219439988542356, 0.00022034976092536577, 0.00022126007683888848, 0.00022217093544438154, 0.00022308233590793956, 0.00022399427740025165, 0.0002249067590965594, 0.00022581978017661546, 0.00022673333982464248, 0.00022764743722929269, 0.00022856207158360794, 0.0002294772420849803, 0.0002303929479351131, 0.00023130918833998243, 0.0002322259625097992, 0.00023314326965897164, 0.00023406110900606823, 0.00023497947977378108, 0.00023589838118888987, 0.0002368178124822261, 0.0002377377728886378, 0.00023865826164695474, 0.00023957927799995402, 0.00024050082119432602, 0.00024142289048064087, 0.0002423454851133152, 0.0002432686043505794, 0.0002441922474544452, 0.0002451164136906736, 0.0002460411023287434, 0.0002469663126418197, 0.00024789204390672314, 0.00024881829540389936, 0.00024974506641738873, 0.0002506723562347966, 0.00025160016414726386, 0.0002525284894494376, 0.0002534573314394425, 0.0002543866894188523, 0.0002553165626926615, 0.00025624695056925776, 0.0002571778523603942, 0.00025810926738116226, 0.0002590411949499648, 0.00025997363438848953, 0.0002609065850216826, 0.0002618400461777227, 0.0002627740171879954, 0.0002637084973870675, 0.00026464348611266207, 0.00026557898270563354, 0.0002665149865099431, 0.00026745149687263433, 0.0002683885131438091, 0.000269326034676604, 0.0002702640608271664, 0.00027120259095463165, 0.00027214162442109957, 0.00027308116059161195, 0.00027402119883413, 0.00027496173851951193, 0.00027590277902149094, 0.00027684431971665343, 0.0002777863599844173, 0.00027872889920701067, 0.0002796719367694507, 0.00028061547205952267, 0.0002815595044677593, 0.00028250403338742026, 0.0002834490582144718, 0.0002843945783475668, 0.00028534059318802493, 0.00028628710213981286, 0.0002872341046095249, 0.00028818160000636386, 0.0002891295877421217, 0.00029007806723116094, 0.00029102703789039597, 0.0002919764991392744, 0.00029292645039975893, 0.0002938768910963092, 0.0002948278206558638, 0.0002957792385078226, 0.0002967311440840292, 0.00029768353681875343, 0.00029863641614867424, 0.00029958978151286257, 0.00030054363235276456, 0.0003014979681121848, 0.0003024527882372696, 0.000303408092176491, 0.00030436387938063015, 0.0003053201493027614, 0.0003062769013982364, 0.0003072341351246684, 0.0003081918499419164, 0.0003091500453120701, 0.000310108720699434, 0.00031106787557051295, 0.00031202750939399653, 0.0003129876216407445, 0.000313948211783772, 0.0003149092792982348, 0.0003158708236614152, 0.0003168328443527074, 0.0003177953408536034, 0.0003187583126476789, 0.00031972175922057955, 0.000320685680060007, 0.00032165007465570527, 0.0003226149424994473, 0.0003235802830850214, 0.00032454609590821815, 0.000325512380466817, 0.00032647913626057337, 0.00032744636279120583, 0.00032841405956238304, 0.00032938222607971124, 0.0003303508618507217, 0.0003313199663848581, 0.00033228953919346433, 0.00033325957978977216, 0.0003342300876888892, 0.00033520106240778687, 0.0003361725034652883, 0.00033714441038205695, 0.00033811678268058437, 0.0003390896198851791, 0.00034006292152195485, 0.0003410366871188192, 0.00034201091620546253, 0.0003429856083133464, 0.0003439607629756928, 0.00034493637972747305, 0.0003459124581053969, 0.0003468889976479017, 0.00034786599789514167, 0.0003488434583889775, 0.00034982137867296543, 0.00035079975829234715, 0.00035177859679403934, 0.0003527578937266234, 0.00035373764864033526, 0.00035471786108705534, 0.00035569853062029856, 0.0003566796567952044, 0.00035766123916852716, 0.00035864327729862597, 0.0003596257707454554, 0.00036060871907055576, 0.0003615921218370436, 0.0003625759786096023, 0.00036356028895447273, 0.00036454505243944404, 0.0003655302686338443, 0.0003665159371085316, 0.00036750205743588484, 0.00036848862918979487, 0.0003694756519456556, 0.00037046312528035507, 0.00037145104877226695, 0.0003724394220012416, 0.0003734282445485975, 0.00037441751599711303, 0.0003754072359310176, 0.00037639740393598345, 0.0003773880195991174, 0.0003783790825089524, 0.0003793705922554395, 0.0003803625484299397, 0.0003813549506252157, 0.0003823477984354242, 0.00038334109145610787, 0.0003843348292841872, 0.0003853290115179531, 0.00038632363775705896, 0.000387318707602513, 0.00038831422065667046, 0.00038931017652322645, 0.00039030657480720806, 0.0003913034151149671, 0.0003923006970541726, 0.00039329842023380363, 0.0003942965842641419, 0.0003952951887567645, 0.000396294233324537, 0.000397293717581606, 0.0003982936411433924, 0.0003992940036265842, 0.00040029480464912943, 0.0004012960438302297, 0.00040229772079033294, 0.00040329983515112683, 0.000404302386535532, 0.0004053053745676953, 0.0004063087988729833, 0.00040731265907797563, 0.0004083169548104584, 0.0004093216856994178, 0.0004103268513750336, 0.00041133245146867287, 0.00041233848561288345, 0.00041334495344138786, 0.000414351854589077, 0.0004153591886920038, 0.00041636695538737733, 0.00041737515431355645, 0.0004183837851100439, 0.00041939284741748025, 0.00042040234087763786, 0.00042141226513341503, 0.00042242261982883007, 0.00042343340460901553, 0.0004244446191202123, 0.00042545626300976387, 0.00042646833592611076, 0.00042748083751878457, 0.0004284937674384026, 0.00042950712533666214, 0.00043052091086633493, 0.00043153512368126166, 0.00043254976343634654, 0.0004335648297875517, 0.000434580322391892, 0.00043559624090742954, 0.0004366125849932684, 0.00043762935430954945, 0.0004386465485174448, 0.0004396641672791529, 0.0004406822102578933, 0.00044170067711790146, 0.0004427195675244236, 0.0004437388811437118, 0.00044475861764301883, 0.0004457787766905932, 0.00044679935795567433, 0.00044782036110848733, 0.0004488417858202385, 0.0004498636317631101, 0.0004508858986102558, 0.0004519085860357958, 0.000452931693714812, 0.00045395522132334347, 0.0004549791685383815, 0.00045600353503786516, 0.0004570283205006766, 0.00045805352460663644, 0.00045907914703649923, 0.00046010518747194887, 0.0004611316455955942, 0.00046215852109096454, 0.000463185813642505, 0.00046421352293557244, 0.00046524164865643084, 0.00046627019049224705, 0.0004672991481310864, 0.0004683285212619084, 0.00046935830957456267, 0.00047038851275978436, 0.0004714191305091903, 0.00047245016251527453, 0.0004734816084714044, 0.0004745134680718162, 0.00047554574101161124, 0.00047657842698675175, 0.00047761152569405677, 0.0004786450368311981, 0.0004796789600966966, 0.0004807132951899177, 0.00048174804181106806, 0.00048278319966119115, 0.00048381876844216364, 0.0004848547478566915, 0.00048589113760830617, 0.0004869279374013606, 0.0004879651469410257, 0.0004890027659332863, 0.0004900407940849377, 0.0004910792311035819, 0.0004921180766976235, 0.0004931573305762666, 0.0004941969924495109, 0.0004952370620281482, 0.0004962775390237583, 0.0004973184231487061, 0.0004983597141161379, 0.0004994014116399774, 0.0005004435154349228, 0.0005014860252164427, 0.0005025289407007735, 0.000503572261604915, 0.0005046159876466276, 0.0005056601185444285, 0.0005067046540175889, 0.0005077495937861299, 0.0005087949375708199, 0.0005098406850931707, 0.0005108868360754344, 0.0005119333902406003, 0.0005129803473123913, 0.0005140277070152612, 0.000515075469074391, 0.0005161236332156857, 0.0005171721991657714, 0.0005182211666519921, 0.0005192705354024065, 0.0005203203051457847, 0.0005213704756116055, 0.0005224210465300529, 0.0005234720176320136, 0.000524523388649073, 0.0005255751593135134, 0.0005266273293583098, 0.0005276798985171281, 0.000528732866524321, 0.0005297862331149258, 0.0005308399980246611, 0.0005318941609899243, 0.000532948721747788, 0.000534003680035998, 0.0005350590355929696, 0.0005361147881577852, 0.0005371709374701914, 0.0005382274832705965, 0.0005392844253000668, 0.0005403417633003248, 0.000541399497013746, 0.0005424576261833562, 0.0005435161505528287, 0.0005445750698664817, 0.0005456343838692753, 0.0005466940923068094, 0.0005477541949253206, 0.0005488146914716796, 0.0005498755816933887, 0.0005509368653385788, 0.0005519985421560075, 0.0005530606118950559, 0.000554123074305726, 0.0005551859291386387, 0.0005562491761450306, 0.0005573128150767521, 0.0005583768456862643, 0.0005594412677266368, 0.0005605060809515453, 0.0005615712851152688, 0.0005626368799726874, 0.0005637028652792799, 0.0005647692407911211, 0.0005658360062648796, 0.0005669031614578152, 0.000567970706127777, 0.0005690386400332003, 0.0005701069629331046, 0.0005711756745870914, 0.0005722447747553418, 0.0005733142631986137, 0.0005743841396782404, 0.0005754544039561272, 0.0005765250557947502, 0.000577596094957153, 0.0005786675212069456, 0.0005797393343083009, 0.0005808115340259533, 0.0005818841201251964, 0.0005829570923718805, 0.0005840304505324105, 0.0005851041943737437, 0.0005861783236633878, 0.0005872528381693986, 0.0005883277376603779, 0.0005894030219054712, 0.0005904786906743659, 0.0005915547437372887, 0.000592631180865004, 0.0005937080018288115, 0.0005947852064005444, 0.0005958627943525668, 0.0005969407654577722, 0.0005980191194895812, 0.0005990978562219395, 0.0006001769754293159, 0.0006012564768867002, 0.0006023363603696012, 0.0006034166256540449, 0.0006044972725165723, 0.0006055783007342376, 0.000606659710084606, 0.000607741500345752, 0.0006088236712962574, 0.0006099062227152091, 0.0006109891543821977, 0.0006120724660773152, 0.0006131561575811531, 0.0006142402286748007, 0.0006153246791398432, 0.0006164095087583596, 0.0006174947173129211, 0.0006185803045865892, 0.0006196662703629138, 0.0006207526144259312, 0.0006218393365601628, 0.0006229264365506127, 0.0006240139141827662, 0.0006251017692425881, 0.0006261900015165206, 0.0006272786107914818, 0.0006283675968548639, 0.0006294569594945313, 0.0006305466984988187, 0.0006316368136565303, 0.0006327273047569365, 0.0006338181715897738, 0.0006349094139452419, 0.0006360010316140027, 0.0006370930243871782, 0.0006381853920563489, 0.0006392781344135523, 0.0006403712512512813, 0.0006414647423624822, 0.0006425586075405529, 0.0006436528465793422, 0.0006447474592731472, 0.000645842445416712, 0.000646937804805226, 0.0006480335372343228, 0.0006491296425000778, 0.0006502261203990072, 0.0006513229707280663, 0.0006524201932846474, 0.0006535177878665791, 0.0006546157542721242, 0.0006557140922999783, 0.000656812801749268, 0.0006579118824195498, 0.0006590113341108083, 0.0006601111566234547, 0.0006612113497583253, 0.0006623119133166798, 0.0006634128471002006, 0.00066451415091099, 0.00066561582455157, 0.0006667178678248797, 0.0006678202805342749, 0.0006689230624835258, 0.0006700262134768161, 0.0006711297333187409, 0.0006722336218143063, 0.0006733378787689266, 0.0006744425039884243, 0.0006755474972790274, 0.000676652858447369, 0.0006777585873004852, 0.0006788646836458143, 0.0006799711472911946, 0.0006810779780448638, 0.0006821851757154574, 0.0006832927401120069, 0.0006844006710439391, 0.0006855089683210743, 0.0006866176317536249, 0.0006877266611521945, 0.000688836056327776, 0.0006899458170917507, 0.0006910559432558867, 0.0006921664346323379, 0.0006932772910336421, 0.0006943885122727205, 0.0006955000981628758, 0.0006966120485177908, 0.0006977243631515278, 0.0006988370418785266, 0.0006999500845136037, 0.0007010634908719507, 0.0007021772607691332, 0.0007032913940210896, 0.0007044058904441299, 0.0007055207498549339, 0.0007066359720705507, 0.0007077515569083972, 0.0007088675041862565, 0.0007099838137222772, 0.0007111004853349721, 0.0007122175188432165, 0.0007133349140662475, 0.0007144526708236629, 0.0007155707889354193, 0.0007166892682218317, 0.0007178081085035719, 0.0007189273096016673, 0.0007200468713374998, 0.0007211667935328048, 0.0007222870760096696, 0.000723407718590533, 0.0007245287210981833, 0.0007256500833557576, 0.0007267718051867407, 0.0007278938864149636, 0.000729016326864603, 0.0007301391263601794, 0.0007312622847265566, 0.0007323858017889403, 0.000733509677372877, 0.000734633911304253, 0.0007357585034092932, 0.00073688345351456, 0.0007380087614469523, 0.0007391344270337044, 0.0007402604501023848, 0.0007413868304808951, 0.0007425135679974692, 0.0007436406624806722, 0.0007447681137593987, 0.0007458959216628728, 0.0007470240860206461, 0.0007481526066625973, 0.0007492814834189307, 0.0007504107161201755, 0.0007515403045971845, 0.0007526702486811333, 0.0007538005482035191, 0.00075493120299616, 0.0007560622128911933, 0.0007571935777210754, 0.0007583252973185798, 0.0007594573715167971, 0.0007605898001491331, 0.0007617225830493086, 0.000762855720051358, 0.000763989210989628, 0.0007651230556987772, 0.0007662572540137751, 0.0007673918057699004, 0.0007685267108027412, 0.0007696619689481928, 0.0007707975800424577, 0.0007719335439220442, 0.0007730698604237655, 0.0007742065293847388, 0.0007753435506423842, 0.0007764809240344241, 0.0007776186493988821, 0.0007787567265740817, 0.0007798951553986461, 0.0007810339357114966, 0.000782173067351852, 0.0007833125501592279, 0.0007844523839734354, 0.0007855925686345803, 0.000786733103983062, 0.0007878739898595733, 0.0007890152261050988, 0.0007901568125609144, 0.0007912987490685859, 0.0007924410354699687, 0.0007935836716072069, 0.0007947266573227318, 0.0007958699924592617, 0.000797013676859801, 0.0007981577103676387, 0.0007993020928263481, 0.0008004468240797858, 0.0008015919039720908, 0.000802737332347684, 0.0008038831090512665, 0.0008050292339278199, 0.0008061757068226044, 0.0008073225275811585, 0.0008084696960492983, 0.0008096172120731163, 0.0008107650754989808, 0.0008119132861735351, 0.0008130618439436963, 0.000814210748656655, 0.0008153600001598744, 0.000816509598301089, 0.0008176595429283045, 0.0008188098338897964, 0.0008199604710341096, 0.0008211114542100575, 0.0008222627832667209, 0.0008234144580534479, 0.0008245664784198523, 0.0008257188442158134, 0.000826871555291475, 0.0008280246114972446, 0.0008291780126837928, 0.0008303317587020523, 0.0008314858494032172, 0.0008326402846387425, 0.0008337950642603431, 0.0008349501881199927, 0.0008361056560699237, 0.0008372614679626263, 0.0008384176236508473, 0.0008395741229875898, 0.0008407309658261124, 0.0008418881520199282, 0.0008430456814228044, 0.0008442035538887614, 0.0008453617692720721, 0.0008465203274272611, 0.0008476792282091041, 0.0008488384714726271, 0.0008499980570731055, 0.0008511579848660639, 0.0008523182547072748, 0.0008534788664527585, 0.0008546398199587817, 0.0008558011150818572, 0.0008569627516787434, 0.0008581247296064431, 0.0008592870487222032, 0.0008604497088835136, 0.0008616127099481072, 0.0008627760517739585, 0.0008639397342192831, 0.0008651037571425373, 0.0008662681204024174, 0.0008674328238578585, 0.0008685978673680342, 0.0008697632507923564, 0.0008709289739904734, 0.0008720950368222707, 0.0008732614391478693, 0.0008744281808276252, 0.0008755952617221292, 0.0008767626816922056, 0.0008779304405989124, 0.0008790985383035396, 0.0008802669746676093, 0.000881435749552875, 0.0008826048628213207, 0.0008837743143351603, 0.000884944103956837, 0.0008861142315490227, 0.0008872846969746176, 0.000888455500096749, 0.0008896266407787711, 0.0008907981188842643, 0.0008919699342770348, 0.0008931420868211132, 0.0008943145763807549, 0.0008954874028204385, 0.0008966605660048662, 0.0008978340657989624, 0.0008990079020678734, 0.0009001820746769667, 0.0009013565834918304, 0.000902531428378273, 0.000903706609202322, 0.000904882125830224, 0.0009060579781284438, 0.0009072341659636639, 0.0009084106892027836, 0.0009095875477129192, 0.0009107647413614024, 0.0009119422700157806, 0.0009131201335438156, 0.0009142983318134835, 0.000915476864692974, 0.0009166557320506899, 0.000917834933755246, 0.0009190144696754695, 0.0009201943396803985, 0.0009213745436392821, 0.0009225550814215793, 0.0009237359528969587, 0.0009249171579352982, 0.000926098696406684, 0.0009272805681814102, 0.0009284627731299781, 0.0009296453111230962, 0.0009308281820316791, 0.0009320113857268469, 0.0009331949220799251, 0.0009343787909624439, 0.0009355629922461373, 0.000936747525802943, 0.0009379323915050017, 0.0009391175892246568, 0.000940303118834453, 0.0009414889802071371, 0.0009426751732156564, 0.0009438616977331585, 0.0009450485536329911, 0.000946235740788701, 0.0009474232590740338, 0.0009486111083629333, 0.0009497992885295413, 0.0009509877994481965, 0.0009521766409934343, 0.0009533658130399866, 0.0009545553154627808, 0.0009557451481369394, 0.0009569353109377796, 0.0009581258037408127, 0.000959316626421744, 0.0009605077788564716, 0.0009616992609210864, 0.0009628910724918712, 0.000964083213445301, 0.0009652756836580413, 0.000966468483006949, 0.0009676616113690705, 0.0009688550686216424, 0.0009700488546420901, 0.000971242969308028, 0.0009724374124972587, 0.0009736321840877726, 0.0009748272839577471, 0.0009760227119855467, 0.000977218468049722, 0.0009784145520290097, 0.0009796109638023317, 0.0009808077032487947, 0.0009820047702476901, 0.0009832021646784931, 0.0009843998864208622, 0.0009855979353546394, 0.0009867963113598488, 0.000987995014316697, 0.0009891940441055717, 0.0009903934006070426, 0.0009915930837018593, 0.000992793093270952, 0.000993993429195431, 0.0009951940913565855, 0.000996395079635884, 0.0009975963939149732, 0.000998798034075678, 0.0010000000000000007 ];
  public static readonly ONE_LITER_INTERNAL_AREAS = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.011673669527664132, 0.01169095577937794, 0.011708114052384623, 0.011725147430760226, 0.011742058876666964, 0.011758851236995356, 0.011775527249548225, 0.011792089548804566, 0.011808540671297713, 0.011824883060638792, 0.01184111907221372, 0.011857250977579283, 0.011873280968581538, 0.011889211161217625, 0.011905043599260378, 0.011920780257663171, 0.01193642304576115, 0.011951973810283513, 0.011967434338190315, 0.011982806359346088, 0.011998091549041625, 0.012013291530374401, 0.012028407876497036, 0.012043442112742855, 0.0120583957186364, 0.012073270129796696, 0.012088066739739924, 0.012102786901588055, 0.01211743192968943, 0.012132003101156582, 0.012146501657326591, 0.012160928805148618, 0.01217528571850293, 0.012189573539455687, 0.012203793379453069, 0.01221794632045848, 0.012232033416035924, 0.012246055692382811, 0.012260014149314909, 0.012273909761206212, 0.012287743477886196, 0.012301516225496769, 0.01231522890731114, 0.012328882404516659, 0.012342477576963563, 0.012356015263881302, 0.01236949628456437, 0.012382921439028957, 0.012396291508642163, 0.012409607256724969, 0.012422869429130408, 0.01243607875479813, 0.012449235946286531, 0.012462341700283562, 0.012475396698097203, 0.012488401606126671, 0.012501357076315181, 0.012514263746585203, 0.012527122241257018, 0.012539933171451323, 0.012552697135476663, 0.012565414719202367, 0.012578086496417597, 0.012590713029177258, 0.012603294868135214, 0.01261583255286544, 0.012628326612171696, 0.012640777564386056, 0.012653185917657008, 0.012665552170227329, 0.012677876810702343, 0.012690160318308925, 0.012702403163145573, 0.012714605806424018, 0.012726768700702643, 0.012738892290112094, 0.012750977010573383, 0.012763023290008777, 0.012775031548545783, 0.012787002198714497, 0.012798935645638559, 0.012810832287219987, 0.012822692514318125, 0.012834516710922958, 0.012846305254322897, 0.012858058515267445, 0.012869776858124736, 0.012881460641034253, 0.012893110216054894, 0.012904725929308532, 0.012916308121119225, 0.012927857126148298, 0.012939373273525382, 0.012950856886975564, 0.012962308284942848, 0.012973727780709968, 0.012985115682514764, 0.012996472293663169, 0.013007797912639004, 0.01301909283321063, 0.01303035734453455, 0.013041591731256215, 0.013052796273607847, 0.013063971247503713, 0.01307511692463267, 0.013086233572548225, 0.013097321454756092, 0.013108380830799437, 0.013119411956341798, 0.013130415083247794, 0.013141390459661673, 0.013152338330083812, 0.013163258935445185, 0.0131741525131799, 0.013185019297295812, 0.013195859518443402, 0.01320667340398278, 0.013217461178049035, 0.013228223061615951, 0.013238959272558045, 0.01324967002571108, 0.013260355532931123, 0.013271016003152015, 0.013281651642441546, 0.013292262654056171, 0.013302849238494407, 0.013313411593548981, 0.013323949914357617, 0.013334464393452723, 0.013344955220809793, 0.013355422583894704, 0.013365866667709902, 0.013376287654839442, 0.01338668572549308, 0.013397061057549219, 0.013407413826596942, 0.013417744205977057, 0.013428052366822167, 0.013438338478095882, 0.013448602706631096, 0.013458845217167415, 0.013469066172387752, 0.013479265732954087, 0.013489444057542462, 0.013499601302877142, 0.013509737623764095, 0.013519853173123689, 0.013529948102022684, 0.013540022559705562, 0.013550076693625119, 0.01356011064947246, 0.013570124571206313, 0.013580118601081742, 0.013590092879678236, 0.013600047545927186, 0.013609982737138863, 0.013619898589028725, 0.013629795235743258, 0.013639672809885237, 0.013649531442538512, 0.01365937126329221, 0.013669192400264525, 0.013678994980125972, 0.01368877912812219, 0.01369854496809628, 0.013708292622510687, 0.013718022212468668, 0.013727733857735309, 0.013737427676758139, 0.013747103786687325, 0.013756762303395498, 0.013766403341497134, 0.013776027014367666, 0.013785633434162082, 0.013795222711833281, 0.013804794957150014, 0.013814350278714528, 0.013823888783979818, 0.013833410579266599, 0.013842915769779926, 0.013852404459625545, 0.013861876751825868, 0.013871332748335715, 0.013880772550057728, 0.013890196256857529, 0.013899603967578557, 0.013908995780056662, 0.01391837179113443, 0.013927732096675256, 0.013937076791577121, 0.013946405969786172, 0.013955719724310025, 0.013965018147230833, 0.013974301329718152, 0.01398356936204152, 0.013992822333582861, 0.014002060332848681, 0.01401128344748198, 0.014020491764274022, 0.0140296853691759, 0.01403886434730983, 0.014048028782980351, 0.014057178759685237, 0.014066314360126295, 0.014075435666219929, 0.014084542759107534, 0.014093635719165774, 0.014102714626016553, 0.014111779558536973, 0.014120830594869025, 0.01412986781242913, 0.014138891287917553, 0.014147901097327636, 0.014156897315954903, 0.014165880018405973, 0.014174849278607366, 0.014183805169814163, 0.014192747764618471, 0.014201677134957845, 0.014210593352123494, 0.014219496486768379, 0.014228386608915192, 0.01423726378796419, 0.01424612809270094, 0.014254979591303878, 0.014263818351351808, 0.014272644439831257, 0.014281457923143712, 0.014290258867112741, 0.014299047336991043, 0.014307823397467303, 0.014316587112673043, 0.014325338546189288, 0.01433407776105317, 0.014342804819764418, 0.014351519784291748, 0.014360222716079165, 0.014368913676052144, 0.014377592724623758, 0.014386259921700685, 0.014394915326689113, 0.014403558998500604, 0.014412190995557812, 0.014420811375800164, 0.014429420196689434, 0.014438017515215224, 0.0144466033879004, 0.014455177870806407, 0.014463741019538531, 0.01447229288925109, 0.014480833534652524, 0.014489363010010426, 0.014497881369156505, 0.01450638866549147, 0.014514884951989842, 0.014523370281204715, 0.014531844705272409, 0.014540308275917109, 0.01454876104445539, 0.014557203061800713, 0.01456563437846786, 0.01457405504457724, 0.014582465109859236, 0.014590864623658436, 0.01459925363493777, 0.014607632192282676, 0.01461600034390514, 0.014624358137647703, 0.01463270562098741, 0.014641042841039738, 0.01464936984456238, 0.014657686677959095, 0.014665993387283402, 0.014674290018242322, 0.014682576616199953, 0.014690853226181121, 0.01469911989287487, 0.014707376660638009, 0.014715623573498508, 0.014723860675158943, 0.014732088008999838, 0.01474030561808295, 0.0147485135451546, 0.014756711832648829, 0.01476490052269064, 0.014773079657099111, 0.014781249277390501, 0.014789409424781302, 0.014797560140191277, 0.01480570146424644, 0.014813833437281983, 0.014821956099345219, 0.014830069490198387, 0.014838173649321558, 0.014846268615915375, 0.014854354428903847, 0.014862431126937059, 0.014870498748393855, 0.014878557331384523, 0.014886606913753396, 0.014894647533081453, 0.014902679226688862, 0.014910702031637533, 0.014918715984733596, 0.014926721122529863, 0.014934717481328276, 0.01494270509718229, 0.014950684005899282, 0.014958654243042855, 0.014966615843935183, 0.014974568843659292, 0.014982513277061309, 0.014990449178752727, 0.014998376583112573, 0.015006295524289613, 0.01501420603620449, 0.015022108152551866, 0.015030001906802525, 0.015037887332205416, 0.015045764461789768, 0.015053633328367053, 0.015061493964533034, 0.015069346402669725, 0.015077190674947357, 0.015085026813326307, 0.015092854849559018, 0.015100674815191865, 0.015108486741567052, 0.015116290659824448, 0.01512408660090339, 0.015131874595544522, 0.015139654674291547, 0.015147426867493005, 0.015155191205304003, 0.015162947717687952, 0.01517069643441825, 0.015178437385079983, 0.015186170599071576, 0.015193896105606447, 0.015201613933714608, 0.015209324112244323, 0.015217026669863637, 0.015224721635061998, 0.015232409036151775, 0.015240088901269828, 0.015247761258378994, 0.015255426135269609, 0.015263083559560995, 0.015270733558702931, 0.015278376159977087, 0.015286011390498492, 0.015293639277216924, 0.015301259846918346, 0.015308873126226277, 0.01531647914160317, 0.01532407791935178, 0.015331669485616511, 0.015339253866384739, 0.015346831087488131, 0.015354401174603956, 0.015361964153256363, 0.015369520048817663, 0.015377068886509587, 0.01538461069140455, 0.015392145488426849, 0.015399673302353934, 0.015407194157817558, 0.015414708079305041, 0.015422215091160393, 0.015429715217585526, 0.015437208482641386, 0.01544469491024911, 0.015452174524191179, 0.015459647348112495, 0.015467113405521548, 0.015474572719791475, 0.015482025314161155, 0.015489471211736312, 0.015496910435490532, 0.015504343008266384, 0.015511768952776403, 0.015519188291604149, 0.015526601047205239, 0.015534007241908348, 0.01554140689791621, 0.01554880003730662, 0.015556186682033396, 0.015563566853927381, 0.015570940574697385, 0.015578307865931134, 0.015585668749096233, 0.015593023245541082, 0.015600371376495807, 0.015607713163073182, 0.015615048626269517, 0.015622377786965576, 0.015629700665927452, 0.015637017283807463, 0.01564432766114499, 0.015651631818367377, 0.015658929775790753, 0.015666221553620914, 0.01567350717195412, 0.01568078665077796, 0.015688060009972138, 0.015695327269309316, 0.015702588448455915, 0.015709843566972893, 0.01571709264431655, 0.015724335699839314, 0.015731572752790506, 0.015738803822317113, 0.01574602892746455, 0.015753248087177388, 0.015760461320300147, 0.01576766864557801, 0.015774870081657524, 0.015782065647087378, 0.015789255360319082, 0.015796439239707714, 0.015803617303512575, 0.01581078956989793, 0.015817956056933695, 0.015825116782596092, 0.01583227176476834, 0.01583942102124136, 0.015846564569714394, 0.015853702427795695, 0.015860834613003166, 0.01586796114276502, 0.01587508203442039, 0.015882197305220027, 0.01588930697232686, 0.015896411052816663, 0.01590350956367867, 0.015910602521816173, 0.01591768994404713, 0.015924771847104786, 0.015931848247638252, 0.015938919162213103, 0.015945984607311954, 0.015953044599335057, 0.015960099154600865, 0.0159671482893466, 0.01597419201972882, 0.015981230361823997, 0.015988263331629036, 0.015995290945061854, 0.016002313217961923, 0.016009330166090782, 0.016016341805132606, 0.016023348150694745, 0.016030349218308194, 0.016037345023428164, 0.01604433558143459, 0.016051320907632633, 0.016058301017253196, 0.01606527592545342, 0.016072245647317192, 0.01607921019785563, 0.016086169592007593, 0.016093123844640133, 0.016100072970549006, 0.016107016984459144, 0.016113955901025122, 0.016120889734831636, 0.016127818500393954, 0.0161347422121584, 0.016141660884502786, 0.016148574531736896, 0.016155483168102905, 0.016162386807775847, 0.016169285464864045, 0.016176179153409555, 0.01618306788738861, 0.016189951680712023, 0.016196830547225656, 0.016203704500710805, 0.01621057355488464, 0.01621743772340063, 0.016224297019848923, 0.016231151457756797, 0.016238001050589056, 0.0162448458117484, 0.016251685754575865, 0.016258520892351202, 0.016265351238293282, 0.01627217680556047, 0.016278997607251013, 0.01628581365640345, 0.016292624965996948, 0.016299431548951727, 0.016306233418129396, 0.016313030586333353, 0.01631982306630913, 0.016326610870744766, 0.016333394012271196, 0.016340172503462553, 0.016346946356836586, 0.016353715584854975, 0.016360480199923682, 0.016367240214393335, 0.016373995640559524, 0.01638074649066318, 0.016387492776890902, 0.016394234511375286, 0.016400971706195287, 0.0164077043733765, 0.01641443252489155, 0.016421156172660375, 0.016427875328550563, 0.01643459000437768, 0.016441300211905572, 0.016448005962846703, 0.016454707268862463, 0.016461404141563447, 0.016468096592509817, 0.01647478463321158, 0.01648146827512888, 0.016488147529672332, 0.016494822408203286, 0.016501492922034157, 0.016508159082428683, 0.01651482090060227, 0.016521478387722232, 0.016528131554908097, 0.016534780413231896, 0.016541424973718445, 0.016548065247345634, 0.01655470124504469, 0.016561332977700453, 0.016567960456151682, 0.01657458369119129, 0.01658120269356663, 0.016587817473979787, 0.016594428043087788, 0.016601034411502926, 0.01660763658979299, 0.016614234588481543, 0.016620828418048152, 0.01662741808892868, 0.016634003611515517, 0.016640584996157854, 0.016647162253161908, 0.016653735392791195, 0.016660304425266746, 0.016666869360767406, 0.016673430209430025, 0.016679986981349714, 0.016686539686580123, 0.016693088335133603, 0.016699632936981523, 0.01670617350205445, 0.016712710040242412, 0.016719242561395124, 0.016725771075322193, 0.016732295591793383, 0.01673881612053881, 0.0167453326712492, 0.01675184525357607, 0.016758353877131992, 0.01676485855149078, 0.01677135928618773, 0.01677785609071982, 0.01678434897454595, 0.016790837947087113, 0.016797323017726653, 0.016803804195810443, 0.016810281490647123, 0.016816754911508282, 0.016823224467628663, 0.016829690168206395, 0.016836152022403166, 0.016842610039344442, 0.016849064228119666, 0.016855514597782447, 0.016861961157350773, 0.01686840391580718, 0.01687484288209899, 0.01688127806513846, 0.016887709473802994, 0.016894137116935336, 0.01690056100334376, 0.016906981141802245, 0.016913397541050673, 0.01691981020979502, 0.016926219156707504, 0.016932624390426827, 0.016939025919558308, 0.01694542375267408, 0.016951817898313258, 0.016958208364982158, 0.01696459516115441, 0.01697097829527118, 0.016977357775741327, 0.01698373361094158, 0.016990105809216702, 0.016996474378879668, 0.017002839328211852, 0.017009200665463145, 0.017015558398852167, 0.017021912536566427, 0.017028263086762464, 0.017034610057566034, 0.017040953457072263, 0.017047293293345814, 0.017053629574421032, 0.017059962308302132, 0.017066291502963318, 0.01707261716634898, 0.01707893930637382, 0.017085257930923026, 0.017091573047852412, 0.01709788466498858, 0.017104192790129067, 0.017110497431042513, 0.017116798595468767, 0.01712309629111909, 0.017129390525676268, 0.01713568130679477, 0.01714196864210089, 0.0171482525391929, 0.017154533005641185, 0.017160810048988374, 0.017167083676749538, 0.01717335389641225, 0.017179620715436786, 0.017185884141256234, 0.017192144181276653, 0.017198400842877198, 0.017204654133410255, 0.017210904060201575, 0.01721715063055044, 0.017223393851729735, 0.017229633730986137, 0.017235870275540233, 0.01724210349258664, 0.01724833338929413, 0.017254559972805786, 0.017260783250239123, 0.017267003228686184, 0.017273219915213703, 0.017279433316863237, 0.017285643440651262, 0.017291850293569295, 0.017298053882584066, 0.01730425421463758, 0.017310451296647288, 0.017316645135506178, 0.01732283573808292, 0.017329023111221958, 0.017335207261743646, 0.017341388196444374, 0.01734756592209668, 0.01735374044544934, 0.017359911773227533, 0.017366079912132924, 0.017372244868843777, 0.01737840665001509, 0.017384565262278696, 0.017390720712243374, 0.017396873006494958, 0.017403022151596465, 0.017409168154088193, 0.01741531102048782, 0.01742145075729054, 0.017427587370969156, 0.01743372086797419, 0.01743985125473397, 0.01744597853765479, 0.01745210272312095, 0.01745822381749492, 0.017464341827117397, 0.01747045675830744, 0.01747656861736257, 0.017482677410558846, 0.017488783144151008, 0.017494885824372537, 0.017500985457435805, 0.017507082049532115, 0.017513175606831854, 0.01751926613548456, 0.017525353641619026, 0.017531438131343426, 0.01753751961074536, 0.01754359808589199, 0.017549673562830128, 0.017555746047586338, 0.017561815546167, 0.01756788206455844, 0.017573945608727, 0.017580006184619152, 0.017586063798161584, 0.01759211845526126, 0.017598170161805565, 0.01760421892366236, 0.01761026474668009, 0.01761630763668785, 0.017622347599495512, 0.017628384640893772, 0.017634418766654284, 0.01764044998252969, 0.017646478294253757, 0.017652503707541452, 0.01765852622808903, 0.017664545861574076, 0.01767056261365567, 0.017676576489974397, 0.017682587496152483, 0.01768859563779384, 0.017694600920484187, 0.017700603349791108, 0.01770660293126412, 0.017712599670434807, 0.017718593572816847, 0.017724584643906104, 0.017730572889180767, 0.017736558314101324, 0.017742540924110737, 0.01774852072463447, 0.017754497721080585, 0.01776047191883981, 0.017766443323285627, 0.017772411939774344, 0.017778377773645174, 0.017784340830220312, 0.017790301114805004, 0.017796258632687623, 0.017802213389139763, 0.01780816538941628, 0.017814114638755405, 0.017820061142378784, 0.017826004905491563, 0.017831945933282464, 0.017837884230923872, 0.017843819803571873, 0.01784975265636635, 0.017855682794431046, 0.017861610222873647, 0.017867534946785835, 0.01787345697124335, 0.01787937630130611, 0.017885292942018217, 0.017891206898408063, 0.01789711817548839, 0.017903026778256365, 0.017908932711693627, 0.01791483598076638, 0.01792073659042544, 0.01792663454560631, 0.017932529851229253, 0.017938422512199348, 0.017944312533406545, 0.01795019991972577, 0.01795608467601694, 0.01796196680712506, 0.017967846317880277, 0.01797372321309794, 0.017979597497578666, 0.01798546917610842, 0.01799133825345855, 0.017997204734385853, 0.018003068623632667, 0.0180089299259269, 0.018014788645982095, 0.018020644788497513, 0.018026498358158168, 0.018032349359634908, 0.018038197797584452, 0.018044043676649486, 0.01804988700145867, 0.018055727776626746, 0.018061566006754574, 0.01806740169642919, 0.01807323485022387, 0.018079065472698184, 0.018084893568398052, 0.018090719141855813, 0.018096542197590264, 0.018102362740106723, 0.0181081807738971, 0.018113996303439933, 0.018119809333200433, 0.018125619867630588, 0.018131427911169177, 0.018137233468241823, 0.01814303654326107, 0.018148837140626425, 0.018154635264724408, 0.018160430919928614, 0.01816622411059977, 0.018172014841085774, 0.01817780311572175, 0.018183588938830115, 0.01818937231472062, 0.018195153247690398, 0.018200931742024026, 0.01820670780199356, 0.018212481431858624, 0.018218252635866405, 0.018224021418251742, 0.018229787783237174, 0.01823555173503298, 0.018241313277837228, 0.01824707241583583, 0.01825282915320259, 0.018258583494099253, 0.018264335442675556, 0.018270085003069262, 0.018275832179406235, 0.01828157697580046, 0.018287319396354113, 0.018293059445157595, 0.01829879712628959, 0.018304532443817086, 0.01831026540179546, 0.018315996004268503, 0.018321724255268467, 0.0183274501588161, 0.01833317371892073, 0.018338894939580266, 0.01834461382478126, 0.018350330378498973, 0.018356044604697384, 0.018361756507329262, 0.018367466090336192, 0.018373173357648643, 0.01837887831318597, 0.018384580960856524, 0.018390281304557613, 0.018395979348175613, 0.018401675095585993, 0.018407368550653325, 0.018413059717231374, 0.018418748599163114, 0.018424435200280764, 0.018430119524405868, 0.01843580157534928, 0.018441481356911253, 0.018447158872881467, 0.01845283412703905, 0.018458507123152647, 0.01846417786498044, 0.018469846356270223, 0.01847551260075938, 0.018481176602174985, 0.018486838364233815, 0.01849249789064239, 0.01849815518509703, 0.018503810251283854, 0.01850946309287887, 0.01851511371354799, 0.01852076211694705, 0.018526408306721878, 0.018532052286508324, 0.018537694059932292, 0.018543333630609785, 0.01854897100214694, 0.018554606178140056, 0.01856023916217565, 0.01856586995783049, 0.018571498568671612, 0.018577124998256384, 0.01858274925013252, 0.01858837132783815, 0.018593991234901797, 0.018599608974842488, 0.01860522455116973, 0.018610837967383574, 0.01861644922697464, 0.018622058333424164, 0.018627665290204022, 0.018633270100776766, 0.01863887276859568, 0.018644473297104766, 0.018650071689738843, 0.018655667949923533, 0.018661262081075297, 0.018666854086601514, 0.018672443969900455, 0.01867803173436137, 0.01868361738336447, 0.018689200920281025, 0.01869478234847332, 0.018700361671294758, 0.01870593889208985, 0.018711514014194266, 0.018717087040934853, 0.018722657975629706, 0.018728226821588128, 0.01873379358211075, 0.018739358260489492, 0.018744920860007626, 0.01875048138393982, 0.01875603983555214, 0.018761596218102087, 0.01876715053483866, 0.018772702789002345, 0.018778252983825176, 0.018783801122530745, 0.018789347208334257, 0.01879489124444254, 0.018800433234054056, 0.018805973180359002, 0.018811511086539265, 0.018817046955768496, 0.01882258079121212, 0.01882811259602737, 0.018833642373363327, 0.018839170126360927, 0.01884469585815302, 0.018850219571864377, 0.01885574127061172, 0.018861260957503775, 0.018866778635641263, 0.01887229430811695, 0.018877807978015693, 0.018883319648414422, 0.01888882932238222, 0.01889433700298031, 0.018899842693262104, 0.018905346396273243, 0.018910848115051577, 0.018916347852627247, 0.018921845612022682, 0.01892734139625264, 0.018932835208324224, 0.01893832705123691, 0.018943816927982592, 0.018949304841545583, 0.01895479079490266, 0.018960274791023076, 0.018965756832868608, 0.018971236923393572, 0.018976715065544828, 0.018982191262261847, 0.018987665516476702, 0.018993137831114133, 0.018998608209091505, 0.019004076653318918 ];
  public static readonly ONE_LITER_INTERNAL_VOLUMES = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6.728724809726247e-7, 0.000001346741344706456, 0.000002021599214485032, 0.0000026974388913586074, 0.000003374253347117017, 0.000004052035717645394, 0.000004730779296636337, 0.000005410477529634301, 0.000006091124008389995, 0.000006772712465504327, 0.000007455236769343087, 0.000008138690919205021, 0.000008823069040727288, 0.000009508365381513515, 0.000010194574306970779, 0.000010881690296342829, 0.000011569707938927854, 0.000012258621930469854, 0.000012948427069713537, 0.000013639118255113327, 0.000014330690481687719, 0.00001502313883801085, 0.00001571645850333366, 0.0000164106447448276, 0.000017105692914944172, 0.00001780159844888424, 0.00001849835686217119, 0.000019195963748322614, 0.000019894414776615387, 0.000020593705689939387, 0.000021293832302735393, 0.000021994790499012955, 0.000022696576230444305, 0.000023399185514530577, 0.00002410261443283687, 0.00002480685912929285, 0.000025511915808555815, 0.00002621778073443327, 0.000026924450228362288, 0.000027631920667943037, 0.000028340188485524036, 0.000029049250166836793, 0.000029759102249677652, 0.000030469741322634758, 0.00003118116402385819, 0.00003189336703987136, 0.00003260634710442197, 0.00003332010099737081, 0.00003403462554361681, 0.00003474991761205686, 0.00003546597411457895, 0.000036182792005087314, 0.00003690036827855816, 0.000037618699970124924, 0.00003833778415419177, 0.00003905761794357423, 0.00003977819848866595, 0.000040499522976630575, 0.00004122158863061766, 0.00004194439270900189, 0.00004266793250464456, 0.00004339220534417657, 0.00004411720858730215, 0.000044842939626122476, 0.0000455693958844785, 0.000046296574817312345, 0.00004702447391004646, 0.00004775309067798006, 0.00004848242266570212, 0.000049212467446520445, 0.00004994322262190612, 0.00005067468582095296, 0.00005140685469985136, 0.000052139726941376035, 0.000052873300254387244, 0.00005360757237334502, 0.000054342541057835974, 0.000055078204092112226, 0.00005581455928464213, 0.00005655160446767234, 0.00005728933749680093, 0.00005802775625056111, 0.00005876685863001529, 0.00005950664255835915, 0.00006024710598053532, 0.00006098824686285653, 0.00006173006319263773, 0.00006247255297783711, 0.0000632157142467056, 0.00006395954504744467, 0.0000647040434478721, 0.00006544920753509564, 0.00006619503541519412, 0.00006694152521290594, 0.0000676886750713247, 0.00006843648315160162, 0.00006918494763265486, 0.00006993406671088519, 0.00007068383859989799, 0.00007143426153023156, 0.0000721853337490912, 0.00007293705352008924, 0.00007368941912299063, 0.00007444242885346411, 0.00007519608102283859, 0.0000759503739578648, 0.00007670530600048201, 0.0000774608755075896, 0.00007821708085082343, 0.00007897392041633691, 0.00007973139260458652, 0.00008048949583012179, 0.00008124822852137953, 0.00008200758912048233, 0.00008276757608304101, 0.00008352818787796116, 0.00008428942298725341, 0.00008505127990584761, 0.00008581375714141056, 0.0000865768532141674, 0.00008734056665672644, 0.00008810489601390739, 0.00008886983984257299, 0.00008963539671146372, 0.00009040156520103584, 0.00009116834390330237, 0.00009193573142167711, 0.00009270372637082167, 0.00009347232737649525, 0.00009424153307540727, 0.00009501134211507272, 0.00009578175315367019, 0.0000965527648599024, 0.00009732437591285944, 0.00009809658500188431, 0.00009886939082644101, 0.00009964279209598495, 0.00010041678752983564, 0.00010119137585705169, 0.00010196655581630797, 0.00010274232615577501, 0.00010351868563300037, 0.00010429563301479224, 0.00010507316707710488, 0.00010585128660492621, 0.00010662999039216716, 0.00010740927724155304, 0.00010818914596451667, 0.00010896959538109334, 0.00010975062431981756, 0.0001105322316176215, 0.00011131441611973514, 0.00011209717667958807, 0.00011288051215871288, 0.00011366442142665022, 0.00011444890336085533, 0.0001152339568466061, 0.00011601958077691266, 0.00011680577405242839, 0.00011759253558136234, 0.00011837986427939313, 0.00011916775906958415, 0.00011995621888230005, 0.00012074524265512471, 0.00012153482933278034, 0.00012232497786704788, 0.00012311568721668872, 0.0001239069563473675, 0.00012469878423157624, 0.00012549116984855946, 0.00012628411218424066, 0.0001270776102311497, 0.00012787166298835142, 0.00012866626946137532, 0.00012946142866214624, 0.00013025713960891609, 0.00013105340132619665, 0.0001318502128446933, 0.00013264757320123976, 0.00013344548143873384, 0.00013424393660607398, 0.00013504293775809685, 0.0001358424839555158, 0.0001366425742648603, 0.000137443207758416, 0.00013824438351416594, 0.00013904610061573247, 0.00013984835815231993, 0.00014065115521865826, 0.00014145449091494732, 0.00014225836434680206, 0.00014306277462519838, 0.00014386772086641986, 0.00014467320219200506, 0.00014547921772869573, 0.0001462857666083856, 0.00014709284796806987, 0.00014790046094979563, 0.00014870860470061253, 0.00014951727837252447, 0.00015032648112244185, 0.00015113621211213437, 0.00015194647050818455, 0.0001527572554819419, 0.00015356856620947756, 0.00015438040187153968, 0.00015519276165350937, 0.00015600564474535714, 0.0001568190503416, 0.00015763297764125904, 0.00015844742584781768, 0.0001592623941691804, 0.00016007788181763183, 0.00016089388800979678, 0.00016171041196660034, 0.00016252745291322872, 0.0001633450100790906, 0.00016416308269777885, 0.00016498167000703287, 0.0001658007712487013, 0.00016662038566870517, 0.0001674405125170017, 0.0001682611510475483, 0.00016908230051826729, 0.00016990396019101066, 0.00017072612933152577, 0.00017154880720942104, 0.00017237199309813231, 0.0001731956862748895, 0.0001740198860206837, 0.00017484459162023464, 0.00017566980236195868, 0.00017649551753793694, 0.00017732173644388402, 0.00017814845837911701, 0.00017897568264652492, 0.0001798034085525384, 0.00018063163540709982, 0.0001814603625236338, 0.00018228958921901795, 0.00018311931481355414, 0.00018394953863093986, 0.0001847802599982401, 0.0001856114782458595, 0.00018644319270751477, 0.0001872754027202076, 0.00018810810762419754, 0.00018894130676297565, 0.00018977499948323804, 0.0001906091851348599, 0.00019144386307086986, 0.00019227903264742457, 0.00019311469322378345, 0.00019395084416228407, 0.0001947874848283174, 0.00019562461459030352, 0.00019646223281966776, 0.00019730033889081683, 0.00019813893218111528, 0.00019897801207086234, 0.00019981757794326895, 0.000200657629184435, 0.00020149816518332678, 0.00020233918533175488, 0.0002031806890243521, 0.00020402267565855175, 0.00020486514463456603, 0.0002057080953553648, 0.00020655152722665455, 0.00020739543965685747, 0.0002082398320570909, 0.0002090847038411469, 0.00020993005442547204, 0.00021077588322914747, 0.00021162218967386913, 0.00021246897318392822, 0.00021331623318619178, 0.00021416396911008362, 0.0002150121803875653, 0.0002158608664531175, 0.00021671002674372117, 0.00021755966069883956, 0.0002184097677603997, 0.00021926034737277452, 0.00022011139898276511, 0.000220962922039583, 0.00022181491599483272, 0.00022266738030249448, 0.0002235203144189072, 0.0002243737178027514, 0.00022522758991503258, 0.00022608193021906458, 0.00022693673818045313, 0.0002277920132670796, 0.00022864775494908486, 0.00022950396269885343, 0.0002303606359909976, 0.00023121777430234176, 0.0002320753771119071, 0.0002329334439008961, 0.00023379197415267743, 0.00023465096735277084, 0.00023551042298883244, 0.0002363703405506398, 0.00023723071953007737, 0.0002380915594211221, 0.00023895285971982903, 0.0002398146199243172, 0.0002406768395347555, 0.00024153951805334876, 0.00024240265498432412, 0.00024326624983391713, 0.0002441303021103584, 0.0002449948113238602, 0.00024585977698660306, 0.0002467251986127228, 0.00024759107571829727, 0.00024845740782133367, 0.0002493241944417557, 0.0002501914351013909, 0.0002510591293239579, 0.00025192727663505426, 0.00025279587656214415, 0.00025366492863454585, 0.00025453443238342, 0.0002554043873417573, 0.0002562747930443669, 0.0002571456490278645, 0.00025801695483066074, 0.00025888870999294956, 0.00025976091405669675, 0.00026063356656562875, 0.00026150666706522126, 0.0002623802151026881, 0.0002632542102269702, 0.00026412865198872465, 0.00026500353994031374, 0.00026587887363579445, 0.0002667546526309075, 0.000267630876483067, 0.00026850754475134974, 0.0002693846569964851, 0.0002702622127808445, 0.00027114021166843133, 0.00027201865322487074, 0.00027289753701739976, 0.00027377686261485714, 0.00027465662958767374, 0.00027553683750786254, 0.00027641748594900905, 0.0002772985744862617, 0.00027818010269632236, 0.0002790620701574368, 0.00027994447644938533, 0.0002808273211534737, 0.0002817106038525236, 0.0002825943241308638, 0.00028347848157432093, 0.0002843630757702106, 0.00028524810630732844, 0.0002861335727759413, 0.0002870194747677785, 0.0002879058118760231, 0.00028879258369530336, 0.0002896797898216842, 0.0002905674298526588, 0.00029145550338714, 0.0002923440100254521, 0.00029323294936932256, 0.000294122321021874, 0.00029501212458761576, 0.0002959023596724361, 0.00029679302588359404, 0.0002976841228297115, 0.0002985756501207655, 0.0002994676073680803, 0.0003003599941843195, 0.00030125281018347864, 0.0003021460549808774, 0.00030303972819315227, 0.0003039338294382487, 0.00030482835833541396, 0.0003057233145051896, 0.0003066186975694043, 0.00030751450715116644, 0.0003084107428748569, 0.00030930740436612217, 0.0003102044912518669, 0.00031110200316024713, 0.0003119999397206632, 0.0003128983005637528, 0.0003137970853213842, 0.00031469629362664947, 0.0003155959251138574, 0.0003164959794185271, 0.0003173964561773814, 0.00031829735502833994, 0.00031919867561051277, 0.00032010041756419386, 0.00032100258053085464, 0.0003219051641531375, 0.0003228081680748496, 0.0003237115919409564, 0.00032461543539757536, 0.00032551969809196994, 0.00032642437967254326, 0.00032732947978883194, 0.00032823499809150024, 0.00032914093423233376, 0.0003300472878642336, 0.00033095405864121054, 0.0003318612462183788, 0.0003327688502519504, 0.0003336768703992294, 0.0003345853063186061, 0.0003354941576695512, 0.00033640342411261025, 0.00033731310530939787, 0.0003382232009225923, 0.0003391337106159297, 0.00034004463405419875, 0.00034095597090323513, 0.00034186772082991603, 0.0003427798835021548, 0.0003436924585888957, 0.0003446054457601083, 0.0003455188446867824, 0.0003464326550409228, 0.00034734687649554395, 0.000348261508724665, 0.00034917655140330434, 0.00035009200420747484, 0.00035100786681417867, 0.0003519241389014021, 0.00035284082014811076, 0.00035375791023424465, 0.000354675408840713, 0.0003555933156493897, 0.00035651163034310817, 0.0003574303526056568, 0.0003583494821217739, 0.0003592690185771433, 0.00036018896165838915, 0.0003611093110530718, 0.0003620300664496826, 0.0003629512275376398, 0.00036387279400728354, 0.00036479476554987153, 0.00036571714185757446, 0.00036663992262347153, 0.000367563107541546, 0.0003684866963066807, 0.0003694106886146537, 0.0003703350841621339, 0.0003712598826466767, 0.00037218508376671966, 0.0003731106872215783, 0.00037403669271144187, 0.00037496309993736884, 0.00037588990860128315, 0.0003768171184059697, 0.00037774472905507034, 0.00037867274025307974, 0.0003796011517053414, 0.00038052996311804344, 0.0003814591741982146, 0.0003823887846537204, 0.000383318794193259, 0.0003842492025263573, 0.00038518000936336696, 0.0003861112144154606, 0.000387042817394628, 0.00038797481801367196, 0.0003889072159862048, 0.00038984001102664435, 0.00039077320285021034, 0.0003917067911729205, 0.000392640775711587, 0.00039357515618381264, 0.00039450993230798713, 0.0003954451038032836, 0.00039638067038965486, 0.0003973166317878299, 0.0003982529877193102, 0.00039918973790636615, 0.00040012688207203374, 0.00040106441994011076, 0.0004020023512351535, 0.0004029406756824732, 0.0004038793930081327, 0.00040481850293894303, 0.00040575800520245976, 0.0004066978995269799, 0.0004076381856415385, 0.0004085788632759052, 0.000409519932160581, 0.0004104613920267949, 0.0004114032426065008, 0.00041234548363237405, 0.0004132881148378082, 0.00041423113595691205, 0.0004151745467245062, 0.00041611834687611994, 0.0004170625361479882, 0.00041800711427704835, 0.0004189520810009371, 0.0004198974360579872, 0.00042084317918722485, 0.0004217893101283662, 0.0004227358286218144, 0.00042368273440865676, 0.00042463002723066163, 0.0004255777068302754, 0.00042652577295061966, 0.000427474225335488, 0.00042842306372934335, 0.00042937228787731494, 0.00043032189752519544, 0.00043127189241943815, 0.000432222272307154, 0.0004331730369361088, 0.00043412418605472044, 0.000435075719412056, 0.00043602763675782915, 0.0004369799378423971, 0.00043793262241675803, 0.00043888569023254833, 0.0004398391410420399, 0.00044079297459813735, 0.0004417471906543754, 0.0004427017889649161, 0.0004436567692845464, 0.0004446121313686752, 0.000445567874973331, 0.00044652399985515906, 0.000447480505771419, 0.0004484373924799821, 0.00044939465973932875, 0.00045035230730854596, 0.0004513103349473248, 0.00045226874241595773, 0.00045322752947533646, 0.000454186695886949, 0.00045514624141287756, 0.0004561061658157959, 0.0004570664688589669, 0.0004580271503062402, 0.0004589882099220496, 0.000459949647471411, 0.00046091146271991956, 0.00046187365543374776, 0.0004628362253796427, 0.0004637991723249239, 0.00046476249603748097, 0.0004657261962857713, 0.0004666902728388176, 0.0004676547254662058, 0.0004686195539380826, 0.00046958475802515344, 0.00047055033749867985, 0.0004715162921304776, 0.00047248262169291414, 0.0004734493259589067, 0.00047441640470191984, 0.00047538385769596336, 0.00047635168471559, 0.0004773198855358935, 0.0004782884599325062, 0.000479257407681597, 0.0004802267285598692, 0.0004811964223445585, 0.00048216648881343067, 0.00048313692774477955, 0.0004841077389174251, 0.00048507892211071104, 0.00048605047710450306, 0.00048702240367918664, 0.00048799470161566493, 0.0004889673706953569, 0.0004899404107001951, 0.000490913821412624, 0.0004918876026155975, 0.0004928617540925774, 0.0004938362756275311, 0.0004948111670049299, 0.0004957864280097469, 0.0004967620584274549, 0.0004977380580440248, 0.0004987144266459235, 0.000499691164020112, 0.0005006682699540433, 0.000501645744235661, 0.0005026235866533971, 0.0005036017969961698, 0.0005045803750533824, 0.0005055593206149207, 0.0005065386334711519, 0.0005075183134129219, 0.0005084983602315542, 0.000509478773718848, 0.0005104595536670757, 0.0005114406998689822, 0.000512422212117782, 0.0005134040902071585, 0.0005143863339312615, 0.0005153689430847054, 0.0005163519174625679, 0.0005173352568603883, 0.0005183189610741651, 0.0005193030299003549, 0.0005202874631358707, 0.0005212722605780798, 0.0005222574220248022, 0.0005232429472743093, 0.0005242288361253217, 0.0005252150883770081, 0.000526201703828983, 0.0005271886822813055, 0.0005281760235344776, 0.0005291637273894424, 0.0005301517936475827, 0.0005311402221107192, 0.0005321290125811089, 0.0005331181648614436, 0.0005341076787548483, 0.0005350975540648796, 0.0005360877905955241, 0.0005370783881511968, 0.0005380693465367397, 0.0005390606655574199, 0.0005400523450189285, 0.0005410443847273789, 0.0005420367844893051, 0.0005430295441116602, 0.0005440226634018153, 0.0005450161421675574, 0.0005460099802170885, 0.0005470041773590234, 0.0005479987334023891, 0.0005489936481566227, 0.0005499889214315698, 0.0005509845530374836, 0.0005519805427850232, 0.000552976890485252, 0.0005539735959496365, 0.0005549706589900446, 0.0005559680794187446, 0.0005569658570484033, 0.0005579639916920848, 0.0005589624831632492, 0.0005599613312757512, 0.0005609605358438385, 0.0005619600966821506, 0.0005629600136057174, 0.0005639602864299577, 0.000564960914970678, 0.0005659618990440711, 0.0005669632384667147, 0.00056796493305557, 0.0005689669826279807, 0.0005699693870016713, 0.0005709721459947459, 0.0005719752594256868, 0.0005729787271133536, 0.0005739825488769812, 0.0005749867245361791, 0.0005759912539109298, 0.0005769961368215878, 0.0005780013730888778, 0.000579006962533894, 0.0005800129049780986, 0.0005810192002433205, 0.0005820258481517539, 0.0005830328485259575, 0.0005840402011888529, 0.0005850479059637233, 0.0005860559626742126, 0.000587064371144324, 0.0005880731311984188, 0.000589082242661215, 0.0005900917053577863, 0.0005911015191135611, 0.0005921116837543206, 0.0005931221991061986, 0.0005941330649956795, 0.0005951442812495974, 0.0005961558476951351, 0.0005971677641598227, 0.0005981800304715363, 0.0005991926464584975, 0.0006002056119492713, 0.0006012189267727659, 0.0006022325907582307, 0.000603246603735256, 0.0006042609655337711, 0.0006052756759840438, 0.0006062907349166786, 0.0006073061421626166, 0.0006083218975531333, 0.000609338000919838, 0.0006103544520946729, 0.0006113712509099118, 0.0006123883971981586, 0.0006134058907923471, 0.0006144237315257392, 0.000615441919231924, 0.0006164604537448169, 0.0006174793348986585, 0.0006184985625280132, 0.0006195181364677686, 0.0006205380565531344, 0.0006215583226196409, 0.0006225789345031384, 0.0006235998920397962, 0.0006246211950661011, 0.0006256428434188569, 0.0006266648369351832, 0.0006276871754525143, 0.0006287098588085981, 0.0006297328868414953, 0.0006307562593895785, 0.0006317799762915308, 0.0006328040373863449, 0.0006338284425133228, 0.0006348531915120736, 0.0006358782842225135, 0.0006369037204848644, 0.0006379295001396533, 0.0006389556230277107, 0.0006399820889901701, 0.0006410088978684671, 0.0006420360495043379, 0.0006430635437398192, 0.0006440913804172464, 0.0006451195593792532, 0.0006461480804687705, 0.0006471769435290254, 0.0006482061484035403, 0.0006492356949361323, 0.0006502655829709116, 0.0006512958123522811, 0.0006523263829249355, 0.0006533572945338601, 0.00065438854702433, 0.0006554201402419093, 0.0006564520740324503, 0.0006574843482420921, 0.0006585169627172603, 0.0006595499173046659, 0.000660583211851304, 0.0006616168462044539, 0.0006626508202116772, 0.0006636851337208174, 0.0006647197865799992, 0.0006657547786376272, 0.0006667901097423853, 0.000667825779743236, 0.0006688617884894192, 0.0006698981358304515, 0.0006709348216161255, 0.0006719718456965086, 0.0006730092079219426, 0.0006740469081430425, 0.0006750849462106959, 0.0006761233219760621, 0.0006771620352905711, 0.0006782010860059231, 0.0006792404739740876, 0.0006802801990473024, 0.0006813202610780729, 0.0006823606599191713, 0.0006834013954236358, 0.0006844424674447698, 0.0006854838758361411, 0.0006865256204515812, 0.0006875677011451843, 0.0006886101177713066, 0.0006896528701845656, 0.0006906959582398392, 0.0006917393817922651, 0.00069278314069724, 0.0006938272348104184, 0.0006948716639877126, 0.000695916428085291, 0.0006969615269595785, 0.0006980069604672544, 0.0006990527284652529, 0.0007000988308107615, 0.0007011452673612205, 0.0007021920379743226, 0.0007032391425080116, 0.0007042865808204819, 0.0007053343527701779, 0.0007063824582157931, 0.0007074308970162694, 0.0007084796690307964, 0.0007095287741188107, 0.0007105782121399949, 0.0007116279829542776, 0.0007126780864218317, 0.0007137285224030746, 0.000714779290758667, 0.0007158303913495119, 0.0007168818240367548, 0.0007179335886817822, 0.0007189856851462212, 0.0007200381132919389, 0.0007210908729810414, 0.0007221439640758735, 0.0007231973864390177, 0.0007242511399332937, 0.0007253052244217575, 0.000726359639767701, 0.0007274143858346513, 0.0007284694624863698, 0.0007295248695868515, 0.0007305806070003247, 0.00073163667459125, 0.0007326930722243199, 0.0007337497997644579, 0.0007348068570768179, 0.0007358642440267837, 0.0007369219604799681, 0.0007379800063022125, 0.0007390383813595861, 0.0007400970855183852, 0.0007411561186451329, 0.0007422154806065779, 0.0007432751712696944, 0.0007443351905016812, 0.000745395538169961, 0.0007464562141421801, 0.0007475172182862072, 0.0007485785504701336, 0.0007496402105622717, 0.000750702198431155, 0.0007517645139455372, 0.0007528271569743918, 0.0007538901273869111, 0.000754953425052506, 0.0007560170498408053, 0.0007570810016216548, 0.0007581452802651171, 0.0007592098856414707, 0.0007602748176212097, 0.0007613400760750429, 0.0007624056608738932, 0.0007634715718888975, 0.0007645378089914056, 0.0007656043720529795, 0.0007666712609453935, 0.0007677384755406329, 0.000768806015710894, 0.0007698738813285829, 0.0007709420722663157, 0.000772010588396917, 0.0007730794295934202, 0.0007741485957290664, 0.0007752180866773042, 0.0007762879023117885, 0.0007773580425063808, 0.000778428507135148, 0.000779499296072362, 0.0007805704091924993, 0.0007816418463702404, 0.000782713607480469, 0.0007837856923982718, 0.0007848581009989377, 0.0007859308331579573, 0.0007870038887510226, 0.000788077267654026, 0.0007891509697430601, 0.0007902249948944172, 0.0007912993429845886, 0.000792374013890264, 0.0007934490074883314, 0.0007945243236558757, 0.0007955999622701791, 0.0007966759232087204, 0.0007977522063491737, 0.000798828811569409, 0.0007999057387474909, 0.0008009829877616782, 0.0008020605584904238, 0.0008031384508123737, 0.0008042166646063666, 0.0008052951997514337, 0.0008063740561267979, 0.0008074532336118731, 0.0008085327320862643, 0.0008096125514297665, 0.0008106926915223646, 0.0008117731522442326, 0.0008128539334757334, 0.0008139350350974181, 0.0008150164569900257, 0.0008160981990344821, 0.0008171802611119003, 0.0008182626431035794, 0.0008193453448910047, 0.0008204283663558464, 0.0008215117073799595, 0.0008225953678453839, 0.0008236793476343428, 0.000824763646629243, 0.0008258482647126744, 0.0008269332017674092, 0.0008280184576764015, 0.000829104032322787, 0.0008301899255898827, 0.0008312761373611857, 0.0008323626675203735, 0.0008334495159513033, 0.0008345366825380112, 0.0008356241671647124, 0.0008367119697158001, 0.0008378000900758455, 0.0008388885281295969, 0.0008399772837619797, 0.0008410663568580957, 0.0008421557473032227, 0.0008432454549828141, 0.0008443354797824982, 0.0008454258215880783, 0.0008465164802855316, 0.0008476074557610092, 0.0008486987479008356, 0.0008497903565915081, 0.0008508822817196964, 0.0008519745231722423, 0.0008530670808361593, 0.0008541599545986318, 0.000855253144347015, 0.0008563466499688344, 0.0008574404713517855, 0.000858534608383733, 0.0008596290609527109, 0.0008607238289469213, 0.000861818912254735, 0.0008629143107646901 ];
  public static readonly DESIGN_BOUNDS = new Bounds3( -4.199999999999999, -50, -53, 203, 0, 53 );
  public static readonly ONE_LITER_BOUNDS = new Bounds3( -0.15111232427247423, -0.02196667952007725, -0.06109859698706928, 0.08774860583546452, 0.03567350631678056, 0.06109859698706928 );
  public static readonly ONE_LITER_INTERIOR_BOTTOM = -0.01850826836986578;
  public static readonly ONE_LITER_HULL_VOLUME = BoatDesign.DESIGN_HULL_VOLUME * BoatDesign.ONE_LITER_SCALE_MULTIPLIER * BoatDesign.ONE_LITER_SCALE_MULTIPLIER * BoatDesign.ONE_LITER_SCALE_MULTIPLIER;

}

densityBuoyancyCommon.register( 'BoatDesign', BoatDesign );
