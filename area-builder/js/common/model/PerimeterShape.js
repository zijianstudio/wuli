// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model element that describes a shape in terms of 'perimeter points', both exterior and interior.  The interior
 * perimeters allow holes to be defined.  The shape is defined by straight lines drawn from each point to the next.
 *
 * @author John Blanco
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import areaBuilder from '../../areaBuilder.js';

// constants
const FLOATING_POINT_ERR_TOLERANCE = 1e-6;

class PerimeterShape {

  /**
   * @param {Array.<Array.<Vector2>>} exteriorPerimeters An array of perimeters, each of which is a sequential array of
   * points.
   * @param {Array.<Array.<Vector2>>} interiorPerimeters An array of perimeters, each of which is a sequential array of
   * points. Each interior perimeter must be fully contained within an exterior perimeter.
   * @param {number} unitLength The unit length (i.e. the width or height of a unit square) of the unit sizes that
   * this shape should be constructed from.
   * @param {Object} [options]
   */
  constructor( exteriorPerimeters, interiorPerimeters, unitLength, options ) {
    let i;

    options = merge( {
      fillColor: null,
      edgeColor: null
    }, options ); // Make sure options is defined.

    // @public, read only
    this.fillColor = options.fillColor;

    // @public, read only
    this.edgeColor = options.edgeColor;

    // @public, read only
    this.exteriorPerimeters = exteriorPerimeters;

    // @public, read only
    this.interiorPerimeters = interiorPerimeters;

    // @private
    this.unitLength = unitLength;

    // @private - a shape created from the points, useful in various situations.
    this.kiteShape = new Shape();
    exteriorPerimeters.forEach( exteriorPerimeter => {
      this.kiteShape.moveToPoint( exteriorPerimeter[ 0 ] );
      for ( i = 1; i < exteriorPerimeter.length; i++ ) {
        this.kiteShape.lineToPoint( exteriorPerimeter[ i ] );
      }
      this.kiteShape.lineToPoint( exteriorPerimeter[ 0 ] );
      this.kiteShape.close();
    } );

    // Only add interior spaces if there is a legitimate external perimeter.
    if ( !this.kiteShape.bounds.isEmpty() ) {
      interiorPerimeters.forEach( interiorPerimeter => {
        this.kiteShape.moveToPoint( interiorPerimeter[ 0 ] );
        for ( i = 1; i < interiorPerimeter.length; i++ ) {
          this.kiteShape.lineToPoint( interiorPerimeter[ i ] );
        }
        this.kiteShape.lineToPoint( interiorPerimeter[ 0 ] );
        this.kiteShape.close();
      } );
    }

    // @public, read only
    this.unitArea = calculateUnitArea( this.kiteShape, unitLength );
  }

  /**
   * Returns a linearly translated version of this perimeter shape.
   * @param {number} x
   * @param {number} y
   * @returns {PerimeterShape}
   * @public
   */
  translated( x, y ) {
    const exteriorPerimeters = [];
    const interiorPerimeters = [];
    this.exteriorPerimeters.forEach( ( exteriorPerimeter, index ) => {
      exteriorPerimeters.push( [] );
      exteriorPerimeter.forEach( point => {
        exteriorPerimeters[ index ].push( point.plusXY( x, y ) );
      } );
    } );
    this.interiorPerimeters.forEach( ( interiorPerimeter, index ) => {
      interiorPerimeters.push( [] );
      interiorPerimeter.forEach( point => {
        interiorPerimeters[ index ].push( point.plusXY( x, y ) );
      } );
    } );
    return new PerimeterShape( exteriorPerimeters, interiorPerimeters, this.unitLength, {
      fillColor: this.fillColor,
      edgeColor: this.edgeColor
    } );
  }

  /**
   * @returns {number}
   * @public
   */
  getWidth() {
    return this.kiteShape.bounds.width;
  }

  /**
   * @returns {number}
   * @public
   */
  getHeight() {
    return this.kiteShape.bounds.height;
  }
}

// Utility function to compute the unit area of a perimeter shape.
function calculateUnitArea( shape, unitLength ) {

  if ( !shape.bounds.isFinite() ) {
    return 0;
  }

  assert && assert( shape.bounds.width % unitLength < FLOATING_POINT_ERR_TOLERANCE &&
  shape.bounds.height % unitLength < FLOATING_POINT_ERR_TOLERANCE,
    'Error: This method will only work with shapes that have bounds of unit width and height.'
  );

  // Compute the unit area by testing whether or not points on a sub-grid are contained in the shape.
  let unitArea = 0;
  const testPoint = new Vector2( 0, 0 );
  for ( let row = 0; row * unitLength < shape.bounds.height; row++ ) {
    for ( let column = 0; column * unitLength < shape.bounds.width; column++ ) {
      // Scan four points in the unit square.  This allows support for triangular 1/2 unit square shapes.  This is
      // in-lined rather than looped for the sake of efficiency, since this approach avoids vector allocations.
      testPoint.setXY( shape.bounds.minX + ( column + 0.25 ) * unitLength, shape.bounds.minY + ( row + 0.5 ) * unitLength );
      if ( shape.containsPoint( testPoint ) ) {
        unitArea += 0.25;
      }
      testPoint.setXY( shape.bounds.minX + ( column + 0.5 ) * unitLength, shape.bounds.minY + ( row + 0.25 ) * unitLength );
      if ( shape.containsPoint( testPoint ) ) {
        unitArea += 0.25;
      }
      testPoint.setXY( shape.bounds.minX + ( column + 0.5 ) * unitLength, shape.bounds.minY + ( row + 0.75 ) * unitLength );
      if ( shape.containsPoint( testPoint ) ) {
        unitArea += 0.25;
      }
      testPoint.setXY( shape.bounds.minX + ( column + 0.75 ) * unitLength, shape.bounds.minY + ( row + 0.5 ) * unitLength );
      if ( shape.containsPoint( testPoint ) ) {
        unitArea += 0.25;
      }
    }
  }
  return unitArea;
}

areaBuilder.register( 'PerimeterShape', PerimeterShape );
export default PerimeterShape;