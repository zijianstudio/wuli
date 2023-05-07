// Copyright 2018-2022, University of Colorado Boulder

/**
 * A nonoverlapping partition of a larger "shape" into smaller shapes, that can be rescaled or used to display a
 * fractional representation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import fractionsCommon from '../../fractionsCommon.js';

class ShapePartition {
  /**
   * @param {Array.<Shape>} shapes
   */
  constructor( shapes ) {
    // @public {Array.<Shape>}
    this.shapes = shapes;

    // @public {number}
    this.length = shapes.length;

    // @public {Shape}
    this.outlineShape = Shape.union( shapes );

    // Make the shapes immutable, so it minimizes the number of listeners added later
    [ ...this.shapes, this.outlineShape ].forEach( shape => shape.makeImmutable() );
  }

  /**
   * Conditionally rescales a ShapePartition to have a given area.
   * @public
   *
   * @param {number} totalArea
   * @returns {ShapePartition}
   */
  rescaled( totalArea ) {
    const area = this.outlineShape.getArea();
    if ( Math.abs( area - totalArea ) < 1e-5 ) {
      return this;
    }
    else {
      const matrix = Matrix3.scale( Math.sqrt( totalArea / area ) );
      return new ShapePartition( this.shapes.map( shape => shape.transformed( matrix ) ), this.type );
    }
  }

  /**
   * Returns a filtered list of all ShapePartitions that have the same number of shapes as the given denominator.
   * @public
   *
   * @param {Array.<ShapePartition>} shapePartitions
   * @param {number} denominator
   * @returns {Array.<ShapePartition>}
   */
  static supportsDenominator( shapePartitions, denominator ) {
    return shapePartitions.filter( shapePartition => shapePartition.length === denominator );
  }

  /**
   * Returns a filtered list of all ShapePartitions whose number of shapes is divisible by the denominator.
   * @public
   *
   * @param {Array.<ShapePartition>} shapePartitions
   * @param {number} denominator
   * @returns {Array.<ShapePartition>}
   */
  static supportsDivisibleDenominator( shapePartitions, denominator ) {
    return shapePartitions.filter( shapePartition => shapePartition.length % denominator === 0 );
  }

  /**
   * Returns a pie-shaped partition.
   * @public
   *
   * @param {number} quantity - Number of pie pieces
   * @returns {ShapePartition}
   */
  static createPie( quantity ) {
    assert && assert( quantity >= 1 && quantity % 1 === 0 );

    const radius = 1;

    const shapes = [];
    if ( quantity > 1 ) {
      for ( let i = 0; i < quantity; i++ ) {
        const startAngle = -2 * Math.PI * i / quantity;
        const endAngle = -2 * Math.PI * ( i + 1 ) / quantity;
        const shape = new Shape()
          .moveTo( 0, 0 )
          .arc( 0, 0, radius, startAngle, endAngle, true )
          .close();
        shapes.push( shape );
      }
    }
    else {
      shapes.push( Shape.circle( 0, 0, radius ) );
    }
    return new ShapePartition( shapes );
  }

  /**
   * Returns a regular polygon-shaped partition, sliced like a pizza
   * @public
   *
   * @param {number} quantity - Number of triangles
   * @returns {ShapePartition}
   */
  static createPolygon( quantity ) {
    assert && assert( quantity >= 3 && quantity % 1 === 0 );

    const initialPoints = _.range( 0, quantity ).map( i => Vector2.createPolar( 1, -2 * Math.PI * i / quantity ) );
    const sorted = _.sortBy( initialPoints, 'y' );
    const bottomPoint = sorted[ sorted.length - 1 ];
    const nextToBottomPoint = sorted[ sorted.length - 2 ];
    let offset = 0;

    // Ignore it if our "base" is already horizontal
    if ( Math.abs( bottomPoint.y - nextToBottomPoint.y ) > 1e-6 ) {

      // If it's straight down
      if ( Math.abs( bottomPoint.x ) < 1e-6 ) {
        offset = Math.PI / quantity;
      }
      else {
        offset = -bottomPoint.plus( nextToBottomPoint ).angle + Math.PI / 2;
      }
    }

    return new ShapePartition(
      _.range( 0, quantity ).map( i => Shape.polygon( [
        Vector2.ZERO,
        Vector2.createPolar( 1, -2 * Math.PI * i / quantity + offset ),
        Vector2.createPolar( 1, -2 * Math.PI * ( i + 1 ) / quantity + offset )
      ] ) ) );
  }

  /**
   * Returns a stack of horizontal bars.
   * @public
   *
   * @param {number} quantity - Number of bars
   * @returns {ShapePartition}
   */
  static createHorizontalBars( quantity ) {
    assert && assert( quantity >= 1 && quantity % 1 === 0 );

    return new ShapePartition(
      _.range( 0, quantity ).map( i => Shape.rect( -1, 2 * i / quantity - 1, 2, 2 / quantity ) )
    );
  }

  /**
   * Returns a stack of vertical bars.
   * @public
   *
   * @param {number} quantity - Number of bars
   * @returns {ShapePartition}
   */
  static createVerticalBars( quantity ) {
    assert && assert( quantity >= 1 && quantity % 1 === 0 );

    return new ShapePartition(
      _.range( 0, quantity ).map( i => Shape.rect( 2 * i / quantity - 1, -1, 2 / quantity, 2 ) )
    );
  }

  /**
   * Returns a stack of rectangular bars.
   * @public
   *
   * @param {number} quantity - Number of bars
   * @returns {ShapePartition}
   */
  static createRectangularBars( quantity ) {
    assert && assert( quantity >= 1 && quantity % 1 === 0 );

    const yMultiplier = 1.25;

    return new ShapePartition(
      _.range( 0, quantity ).map( i => Shape.rect( -1, yMultiplier * 2 * i / quantity - 1, 2, yMultiplier * 2 / quantity ) )
    );
  }

  /**
   * Returns a pattern of interleaved L-like pieces.
   * @public
   *
   * @param {number} numPairColumns
   * @param {number} numPairRows
   * @returns {ShapePartition}
   */
  static createInterleavedL( numPairColumns, numPairRows ) {
    const shapes = [];

    const leftSideShape = Shape.polygon( [
      new Vector2( 0, 0 ),
      new Vector2( 1 / 3, 0 ),
      new Vector2( 1 / 3, 0.5 ),
      new Vector2( 2 / 3, 0.5 ),
      new Vector2( 2 / 3, 1 ),
      new Vector2( 0, 1 )
    ] );
    const rightSideShape = Shape.polygon( [
      new Vector2( 1, 0 ),
      new Vector2( 1, 1 ),
      new Vector2( 2 / 3, 1 ),
      new Vector2( 2 / 3, 0.5 ),
      new Vector2( 1 / 3, 0.5 ),
      new Vector2( 1 / 3, 0 )
    ] );

    for ( let i = 0; i < numPairColumns; i++ ) {
      for ( let j = 0; j < numPairRows; j++ ) {
        const matrix = Matrix3.translation( i, j );
        shapes.push( leftSideShape.transformed( matrix ) );
        shapes.push( rightSideShape.transformed( matrix ) );
      }
    }

    return new ShapePartition( shapes );
  }

  /**
   * Returns a diagonal pattern of interlocking L pieces
   * @public
   *
   * @param {number} numPairs
   * @returns {ShapePartition}
   */
  static createDiagonalL( numPairs ) {
    const shapes = [];

    const topShape = Shape.polygon( [
      new Vector2( 0, 0 ),
      new Vector2( 2, 0 ),
      new Vector2( 2, 3 ),
      new Vector2( 1, 3 ),
      new Vector2( 1, 1 ),
      new Vector2( 0, 1 )
    ] );
    const bottomShape = Shape.polygon( [
      new Vector2( 0, 1 ),
      new Vector2( 1, 1 ),
      new Vector2( 1, 3 ),
      new Vector2( 2, 3 ),
      new Vector2( 2, 4 ),
      new Vector2( 0, 4 )
    ] );

    for ( let i = 0; i < numPairs; i++ ) {
      const matrix = Matrix3.translation( i * 2, i );
      shapes.push( topShape.transformed( matrix ) );
      shapes.push( bottomShape.transformed( matrix ) );
    }

    return new ShapePartition( shapes );
  }

  /**
   * Returns a tetris piece shape
   * @public
   *
   * @returns {ShapePartition}
   */
  static createTetris() {
    return new ShapePartition( [
      Shape.polygon( [
        new Vector2( 3, 0 ),
        new Vector2( 4, 0 ),
        new Vector2( 4, 3 ),
        new Vector2( 3, 3 ),
        new Vector2( 3, 2 ),
        new Vector2( 2, 2 ),
        new Vector2( 2, 1 ),
        new Vector2( 3, 1 )
      ] ),
      Shape.polygon( [
        new Vector2( 0, 0 ),
        new Vector2( 3, 0 ),
        new Vector2( 3, 1 ),
        new Vector2( 2, 1 ),
        new Vector2( 2, 2 ),
        new Vector2( 1, 2 ),
        new Vector2( 1, 1 ),
        new Vector2( 0, 1 )
      ] ),
      Shape.polygon( [
        new Vector2( 0, 4 ),
        new Vector2( 0, 1 ),
        new Vector2( 1, 1 ),
        new Vector2( 1, 2 ),
        new Vector2( 2, 2 ),
        new Vector2( 2, 3 ),
        new Vector2( 1, 3 ),
        new Vector2( 1, 4 )
      ] ),
      Shape.polygon( [
        new Vector2( 4, 3 ),
        new Vector2( 4, 4 ),
        new Vector2( 1, 4 ),
        new Vector2( 1, 3 ),
        new Vector2( 2, 3 ),
        new Vector2( 2, 2 ),
        new Vector2( 3, 2 ),
        new Vector2( 3, 3 )
      ] )
    ] );
  }

  /**
   * Creates a flower-like shape composed of (by default) rhombi around a center.
   * @public
   *
   * @param {number} numPetals
   * @param {boolean} [split] - Whether each petal should be split into two shapes (or left as one)
   * @param {number} [tipDistance] - How far the petal tips are from the center.
   * @returns {ShapePartition}
   */
  static createFlower( numPetals, split = false, tipDistance = Vector2.createPolar( 1, 2 * Math.PI / numPetals ).plus( Vector2.X_UNIT ).magnitude ) {
    assert && assert( numPetals >= 3 && numPetals % 1 === 0 );
    assert && assert( typeof split === 'boolean' );

    function polar( magnitude, angle ) {
      return Vector2.createPolar( magnitude, -angle - Math.PI / 2 + ( split ? 0 : ( -Math.PI / numPetals ) ) );
    }

    const halfAngle = Math.PI / numPetals;
    return new ShapePartition( _.flatten( _.range( 0, numPetals ).map( i => {
      const baseAngle = 2 * Math.PI * i / numPetals - Math.PI / 2;
      if ( split ) {
        return [
          Shape.polygon( [
            Vector2.ZERO,
            polar( tipDistance, baseAngle ),
            polar( 1, baseAngle + halfAngle )
          ] ),
          Shape.polygon( [
            Vector2.ZERO,
            polar( 1, baseAngle + halfAngle ),
            polar( tipDistance, baseAngle + 2 * halfAngle )
          ] )
        ];
      }
      else {
        return [ Shape.polygon( [
          Vector2.ZERO,
          polar( 1, baseAngle - halfAngle ),
          polar( tipDistance, baseAngle ),
          polar( 1, baseAngle + halfAngle )
        ] ) ];
      }
    } ) ) );
  }

  /**
   * Creates a grouping of plus signs.
   * @public
   *
   * @param {number} quantity
   * @returns {ShapePartition}
   */
  static createPlusSigns( quantity ) {
    assert && assert( quantity >= 1 && quantity <= 6 );

    const plusShape = Shape.union( [
      Shape.rect( 0, 1, 3, 1 ),
      Shape.rect( 1, 0, 1, 3 )
    ] );
    return new ShapePartition( [
      new Vector2( 1, 0 ),
      new Vector2( 3, 1 ),
      new Vector2( 0, 2 ),
      new Vector2( 2, 3 ),
      new Vector2( -1, 4 ),
      new Vector2( 1, 5 )
    ].slice( 0, quantity ).map( offset => {
      return plusShape.transformed( Matrix3.translation( offset.x, offset.y ) );
    } ) );
  }

  /**
   * Creates a rectangular grid of shapes.
   * @public
   *
   * @param {number} rows
   * @param {number} columns
   * @returns {ShapePartition}
   */
  static createGrid( rows, columns ) {
    assert && assert( rows >= 1 && rows % 1 === 0 );
    assert && assert( columns >= 1 && columns % 1 === 0 );

    return new ShapePartition( _.flatten( _.range( 0, rows ).map( row => {
      return _.range( 0, columns ).map( column => {
        return Shape.rect( column / columns, row / rows, 1 / columns, 1 / rows );
      } );
    } ) ) );
  }

  /**
   * Creates a pyramidal grid of equilateral triangles.
   * @public
   *
   * @param {number} rows
   * @returns {ShapePartition}
   */
  static createPyramid( rows ) {
    assert && assert( rows >= 1 && rows % 1 === 0 );

    const height = Math.sqrt( 3 ) / 2;
    const shapes = [];

    const UPPER_LEFT = new Vector2( -0.5, -height );
    const UPPER_RIGHT = new Vector2( 0.5, -height );
    const RIGHT = Vector2.X_UNIT;

    for ( let row = 0; row < rows; row++ ) {
      for ( let column = 0; column <= row; column++ ) {
        const corner = new Vector2( -row / 2 + column, row * height );
        if ( column !== 0 ) {
          shapes.push( Shape.polygon( [
            corner,
            corner.plus( UPPER_LEFT ),
            corner.plus( UPPER_RIGHT )
          ] ) );
        }
        shapes.push( Shape.polygon( [
          corner,
          corner.plus( UPPER_RIGHT ),
          corner.plus( RIGHT )
        ] ) );
      }
    }

    return new ShapePartition( shapes );
  }

  /**
   * Creates a honeycomb-like grid of hexagons
   * @public
   *
   * @param {number} radius
   * @returns {ShapePartition}
   */
  static createHoneycomb( radius ) {
    assert && assert( radius >= 1 && radius % 1 === 0 );

    const hexShape = Shape.regularPolygon( 6, 1 );
    const shapes = [];
    const x = 3 / 2;
    const y = Math.sqrt( 3 );
    const directions = [
      new Vector2( 0, -y ),
      new Vector2( x, -y / 2 ),
      new Vector2( x, y / 2 ),
      new Vector2( 0, y ),
      new Vector2( -x, y / 2 ),
      new Vector2( -x, -y / 2 )
    ].map( v => v.rotated( -Math.PI / 3 ).componentTimes( new Vector2( -1, 1 ) ) );

    for ( let ring = radius; ring >= 1; ring-- ) {
      for ( let dir = 0; dir < 6; dir++ ) {
        let coord = directions[ dir ].timesScalar( ring );
        for ( let i = 0; i < ring; i++ ) {
          shapes.push( hexShape.transformed( Matrix3.translation( coord.x, coord.y ) ) );
          coord = coord.plus( directions[ ( dir + 2 ) % 6 ] );
        }
      }
    }

    shapes.push( hexShape );

    return new ShapePartition( shapes );
  }
}

fractionsCommon.register( 'ShapePartition', ShapePartition );

const RESCALE_SIZE = 4000;
const MAX_PIECES = 12;
const LIMITED_MAX_PIECES = 6; // For certain types, we want to limit the quantity for visibility

// @public {Array.<ShapePartition>}
ShapePartition.PIES = _.range( 1, MAX_PIECES + 1 ).map( quantity => ShapePartition.createPie( quantity ).rescaled( RESCALE_SIZE ) );
ShapePartition.POLYGONS = _.range( 3, MAX_PIECES + 1 ).map( quantity => ShapePartition.createPolygon( quantity ).rescaled( RESCALE_SIZE ) );
ShapePartition.HORIZONTAL_BARS = _.range( 1, LIMITED_MAX_PIECES + 1 ).map( quantity => ShapePartition.createHorizontalBars( quantity ).rescaled( RESCALE_SIZE ) );
ShapePartition.VERTICAL_BARS = _.range( 1, LIMITED_MAX_PIECES + 1 ).map( quantity => ShapePartition.createVerticalBars( quantity ).rescaled( RESCALE_SIZE ) );
ShapePartition.INTERLEAVED_LS = [
  ShapePartition.createInterleavedL( 1, 1 ),
  ShapePartition.createInterleavedL( 2, 1 ),
  ShapePartition.createInterleavedL( 2, 3 )
].map( partition => partition.rescaled( RESCALE_SIZE ) );
ShapePartition.DIAGONAL_LS = _.range( 1, MAX_PIECES / 2 + 1 ).map( quantity => ShapePartition.createDiagonalL( quantity ).rescaled( RESCALE_SIZE ) );
ShapePartition.PLUS_SIGNS = _.range( 1, 7 ).map( quantity => ShapePartition.createPlusSigns( quantity ).rescaled( RESCALE_SIZE ) );
ShapePartition.GRIDS = _.range( 2, 4 ).map( quantity => ShapePartition.createGrid( quantity, quantity ).rescaled( RESCALE_SIZE ) );
ShapePartition.PYRAMIDS = _.range( 1, 4 ).map( quantity => ShapePartition.createPyramid( quantity ).rescaled( RESCALE_SIZE ) );
ShapePartition.EXTENDED_HORIZONTAL_BARS = [
  ..._.range( 1, 9 ).map( quantity => ShapePartition.createHorizontalBars( quantity ).rescaled( RESCALE_SIZE ) ),
  ShapePartition.createGrid( 3, 3 ).rescaled( RESCALE_SIZE )
];
ShapePartition.EXTENDED_VERTICAL_BARS = [
  ..._.range( 1, 9 ).map( quantity => ShapePartition.createVerticalBars( quantity ).rescaled( RESCALE_SIZE ) ),
  ShapePartition.createGrid( 3, 3 ).rescaled( RESCALE_SIZE )
];
ShapePartition.EXTENDED_RECTANGULAR_BARS = _.range( 1, 10 ).map( quantity => ShapePartition.createRectangularBars( quantity ).rescaled( RESCALE_SIZE ) );

// @public {ShapePartition}
ShapePartition.TETRIS = ShapePartition.createTetris().rescaled( RESCALE_SIZE );
ShapePartition.NINJA_STAR = ShapePartition.createFlower( 4, true, 1.8381770764635208 ).rescaled( RESCALE_SIZE );
ShapePartition.FIVE_POINT = ShapePartition.createFlower( 5, true ).rescaled( RESCALE_SIZE );
ShapePartition.SIX_FLOWER = ShapePartition.createFlower( 6 ).rescaled( RESCALE_SIZE );
ShapePartition.HEX_RING = ShapePartition.createHoneycomb( 1 ).rescaled( RESCALE_SIZE );

// @public {Array.<ShapePartition>}
ShapePartition.UNIVERSAL_PARTITIONS = [
  ...ShapePartition.PIES,
  ...ShapePartition.HORIZONTAL_BARS,
  ...ShapePartition.VERTICAL_BARS
];

// @public {Array.<ShapePartition>}
ShapePartition.GAME_PARTITIONS = [
  ...ShapePartition.PIES,
  ...ShapePartition.HORIZONTAL_BARS,
  ...ShapePartition.VERTICAL_BARS,
  ...ShapePartition.GRIDS,
  ...ShapePartition.PYRAMIDS,
  ShapePartition.SIX_FLOWER,
  ShapePartition.HEX_RING,
  ShapePartition.FIVE_POINT,
  ...ShapePartition.POLYGONS
];
ShapePartition.LIMITED_9_GAME_PARTITIONS = ShapePartition.GAME_PARTITIONS.filter( partition => partition.length <= 9 );

// @public {number}
ShapePartition.GAME_PARTITIONS_MAX_WIDTH = Math.max( ...ShapePartition.GAME_PARTITIONS.map( partition => {
  return partition.outlineShape.bounds.width;
} ) );

// @public {Array.<ShapePartition>}
ShapePartition.SHAPE_PARTITIONS = [
  ...ShapePartition.PIES,
  ...ShapePartition.POLYGONS,
  ...ShapePartition.HORIZONTAL_BARS,
  ...ShapePartition.VERTICAL_BARS,
  ...ShapePartition.INTERLEAVED_LS,
  ...ShapePartition.DIAGONAL_LS,
  ...ShapePartition.PLUS_SIGNS,
  ...ShapePartition.GRIDS,
  ...ShapePartition.PYRAMIDS,
  ShapePartition.TETRIS,
  ShapePartition.NINJA_STAR,
  ShapePartition.FIVE_POINT,
  ShapePartition.SIX_FLOWER,
  ShapePartition.HEX_RING
];

export default ShapePartition;