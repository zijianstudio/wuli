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
  constructor(shapes) {
    // @public {Array.<Shape>}
    this.shapes = shapes;

    // @public {number}
    this.length = shapes.length;

    // @public {Shape}
    this.outlineShape = Shape.union(shapes);

    // Make the shapes immutable, so it minimizes the number of listeners added later
    [...this.shapes, this.outlineShape].forEach(shape => shape.makeImmutable());
  }

  /**
   * Conditionally rescales a ShapePartition to have a given area.
   * @public
   *
   * @param {number} totalArea
   * @returns {ShapePartition}
   */
  rescaled(totalArea) {
    const area = this.outlineShape.getArea();
    if (Math.abs(area - totalArea) < 1e-5) {
      return this;
    } else {
      const matrix = Matrix3.scale(Math.sqrt(totalArea / area));
      return new ShapePartition(this.shapes.map(shape => shape.transformed(matrix)), this.type);
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
  static supportsDenominator(shapePartitions, denominator) {
    return shapePartitions.filter(shapePartition => shapePartition.length === denominator);
  }

  /**
   * Returns a filtered list of all ShapePartitions whose number of shapes is divisible by the denominator.
   * @public
   *
   * @param {Array.<ShapePartition>} shapePartitions
   * @param {number} denominator
   * @returns {Array.<ShapePartition>}
   */
  static supportsDivisibleDenominator(shapePartitions, denominator) {
    return shapePartitions.filter(shapePartition => shapePartition.length % denominator === 0);
  }

  /**
   * Returns a pie-shaped partition.
   * @public
   *
   * @param {number} quantity - Number of pie pieces
   * @returns {ShapePartition}
   */
  static createPie(quantity) {
    assert && assert(quantity >= 1 && quantity % 1 === 0);
    const radius = 1;
    const shapes = [];
    if (quantity > 1) {
      for (let i = 0; i < quantity; i++) {
        const startAngle = -2 * Math.PI * i / quantity;
        const endAngle = -2 * Math.PI * (i + 1) / quantity;
        const shape = new Shape().moveTo(0, 0).arc(0, 0, radius, startAngle, endAngle, true).close();
        shapes.push(shape);
      }
    } else {
      shapes.push(Shape.circle(0, 0, radius));
    }
    return new ShapePartition(shapes);
  }

  /**
   * Returns a regular polygon-shaped partition, sliced like a pizza
   * @public
   *
   * @param {number} quantity - Number of triangles
   * @returns {ShapePartition}
   */
  static createPolygon(quantity) {
    assert && assert(quantity >= 3 && quantity % 1 === 0);
    const initialPoints = _.range(0, quantity).map(i => Vector2.createPolar(1, -2 * Math.PI * i / quantity));
    const sorted = _.sortBy(initialPoints, 'y');
    const bottomPoint = sorted[sorted.length - 1];
    const nextToBottomPoint = sorted[sorted.length - 2];
    let offset = 0;

    // Ignore it if our "base" is already horizontal
    if (Math.abs(bottomPoint.y - nextToBottomPoint.y) > 1e-6) {
      // If it's straight down
      if (Math.abs(bottomPoint.x) < 1e-6) {
        offset = Math.PI / quantity;
      } else {
        offset = -bottomPoint.plus(nextToBottomPoint).angle + Math.PI / 2;
      }
    }
    return new ShapePartition(_.range(0, quantity).map(i => Shape.polygon([Vector2.ZERO, Vector2.createPolar(1, -2 * Math.PI * i / quantity + offset), Vector2.createPolar(1, -2 * Math.PI * (i + 1) / quantity + offset)])));
  }

  /**
   * Returns a stack of horizontal bars.
   * @public
   *
   * @param {number} quantity - Number of bars
   * @returns {ShapePartition}
   */
  static createHorizontalBars(quantity) {
    assert && assert(quantity >= 1 && quantity % 1 === 0);
    return new ShapePartition(_.range(0, quantity).map(i => Shape.rect(-1, 2 * i / quantity - 1, 2, 2 / quantity)));
  }

  /**
   * Returns a stack of vertical bars.
   * @public
   *
   * @param {number} quantity - Number of bars
   * @returns {ShapePartition}
   */
  static createVerticalBars(quantity) {
    assert && assert(quantity >= 1 && quantity % 1 === 0);
    return new ShapePartition(_.range(0, quantity).map(i => Shape.rect(2 * i / quantity - 1, -1, 2 / quantity, 2)));
  }

  /**
   * Returns a stack of rectangular bars.
   * @public
   *
   * @param {number} quantity - Number of bars
   * @returns {ShapePartition}
   */
  static createRectangularBars(quantity) {
    assert && assert(quantity >= 1 && quantity % 1 === 0);
    const yMultiplier = 1.25;
    return new ShapePartition(_.range(0, quantity).map(i => Shape.rect(-1, yMultiplier * 2 * i / quantity - 1, 2, yMultiplier * 2 / quantity)));
  }

  /**
   * Returns a pattern of interleaved L-like pieces.
   * @public
   *
   * @param {number} numPairColumns
   * @param {number} numPairRows
   * @returns {ShapePartition}
   */
  static createInterleavedL(numPairColumns, numPairRows) {
    const shapes = [];
    const leftSideShape = Shape.polygon([new Vector2(0, 0), new Vector2(1 / 3, 0), new Vector2(1 / 3, 0.5), new Vector2(2 / 3, 0.5), new Vector2(2 / 3, 1), new Vector2(0, 1)]);
    const rightSideShape = Shape.polygon([new Vector2(1, 0), new Vector2(1, 1), new Vector2(2 / 3, 1), new Vector2(2 / 3, 0.5), new Vector2(1 / 3, 0.5), new Vector2(1 / 3, 0)]);
    for (let i = 0; i < numPairColumns; i++) {
      for (let j = 0; j < numPairRows; j++) {
        const matrix = Matrix3.translation(i, j);
        shapes.push(leftSideShape.transformed(matrix));
        shapes.push(rightSideShape.transformed(matrix));
      }
    }
    return new ShapePartition(shapes);
  }

  /**
   * Returns a diagonal pattern of interlocking L pieces
   * @public
   *
   * @param {number} numPairs
   * @returns {ShapePartition}
   */
  static createDiagonalL(numPairs) {
    const shapes = [];
    const topShape = Shape.polygon([new Vector2(0, 0), new Vector2(2, 0), new Vector2(2, 3), new Vector2(1, 3), new Vector2(1, 1), new Vector2(0, 1)]);
    const bottomShape = Shape.polygon([new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 3), new Vector2(2, 3), new Vector2(2, 4), new Vector2(0, 4)]);
    for (let i = 0; i < numPairs; i++) {
      const matrix = Matrix3.translation(i * 2, i);
      shapes.push(topShape.transformed(matrix));
      shapes.push(bottomShape.transformed(matrix));
    }
    return new ShapePartition(shapes);
  }

  /**
   * Returns a tetris piece shape
   * @public
   *
   * @returns {ShapePartition}
   */
  static createTetris() {
    return new ShapePartition([Shape.polygon([new Vector2(3, 0), new Vector2(4, 0), new Vector2(4, 3), new Vector2(3, 3), new Vector2(3, 2), new Vector2(2, 2), new Vector2(2, 1), new Vector2(3, 1)]), Shape.polygon([new Vector2(0, 0), new Vector2(3, 0), new Vector2(3, 1), new Vector2(2, 1), new Vector2(2, 2), new Vector2(1, 2), new Vector2(1, 1), new Vector2(0, 1)]), Shape.polygon([new Vector2(0, 4), new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 2), new Vector2(2, 2), new Vector2(2, 3), new Vector2(1, 3), new Vector2(1, 4)]), Shape.polygon([new Vector2(4, 3), new Vector2(4, 4), new Vector2(1, 4), new Vector2(1, 3), new Vector2(2, 3), new Vector2(2, 2), new Vector2(3, 2), new Vector2(3, 3)])]);
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
  static createFlower(numPetals, split = false, tipDistance = Vector2.createPolar(1, 2 * Math.PI / numPetals).plus(Vector2.X_UNIT).magnitude) {
    assert && assert(numPetals >= 3 && numPetals % 1 === 0);
    assert && assert(typeof split === 'boolean');
    function polar(magnitude, angle) {
      return Vector2.createPolar(magnitude, -angle - Math.PI / 2 + (split ? 0 : -Math.PI / numPetals));
    }
    const halfAngle = Math.PI / numPetals;
    return new ShapePartition(_.flatten(_.range(0, numPetals).map(i => {
      const baseAngle = 2 * Math.PI * i / numPetals - Math.PI / 2;
      if (split) {
        return [Shape.polygon([Vector2.ZERO, polar(tipDistance, baseAngle), polar(1, baseAngle + halfAngle)]), Shape.polygon([Vector2.ZERO, polar(1, baseAngle + halfAngle), polar(tipDistance, baseAngle + 2 * halfAngle)])];
      } else {
        return [Shape.polygon([Vector2.ZERO, polar(1, baseAngle - halfAngle), polar(tipDistance, baseAngle), polar(1, baseAngle + halfAngle)])];
      }
    })));
  }

  /**
   * Creates a grouping of plus signs.
   * @public
   *
   * @param {number} quantity
   * @returns {ShapePartition}
   */
  static createPlusSigns(quantity) {
    assert && assert(quantity >= 1 && quantity <= 6);
    const plusShape = Shape.union([Shape.rect(0, 1, 3, 1), Shape.rect(1, 0, 1, 3)]);
    return new ShapePartition([new Vector2(1, 0), new Vector2(3, 1), new Vector2(0, 2), new Vector2(2, 3), new Vector2(-1, 4), new Vector2(1, 5)].slice(0, quantity).map(offset => {
      return plusShape.transformed(Matrix3.translation(offset.x, offset.y));
    }));
  }

  /**
   * Creates a rectangular grid of shapes.
   * @public
   *
   * @param {number} rows
   * @param {number} columns
   * @returns {ShapePartition}
   */
  static createGrid(rows, columns) {
    assert && assert(rows >= 1 && rows % 1 === 0);
    assert && assert(columns >= 1 && columns % 1 === 0);
    return new ShapePartition(_.flatten(_.range(0, rows).map(row => {
      return _.range(0, columns).map(column => {
        return Shape.rect(column / columns, row / rows, 1 / columns, 1 / rows);
      });
    })));
  }

  /**
   * Creates a pyramidal grid of equilateral triangles.
   * @public
   *
   * @param {number} rows
   * @returns {ShapePartition}
   */
  static createPyramid(rows) {
    assert && assert(rows >= 1 && rows % 1 === 0);
    const height = Math.sqrt(3) / 2;
    const shapes = [];
    const UPPER_LEFT = new Vector2(-0.5, -height);
    const UPPER_RIGHT = new Vector2(0.5, -height);
    const RIGHT = Vector2.X_UNIT;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column <= row; column++) {
        const corner = new Vector2(-row / 2 + column, row * height);
        if (column !== 0) {
          shapes.push(Shape.polygon([corner, corner.plus(UPPER_LEFT), corner.plus(UPPER_RIGHT)]));
        }
        shapes.push(Shape.polygon([corner, corner.plus(UPPER_RIGHT), corner.plus(RIGHT)]));
      }
    }
    return new ShapePartition(shapes);
  }

  /**
   * Creates a honeycomb-like grid of hexagons
   * @public
   *
   * @param {number} radius
   * @returns {ShapePartition}
   */
  static createHoneycomb(radius) {
    assert && assert(radius >= 1 && radius % 1 === 0);
    const hexShape = Shape.regularPolygon(6, 1);
    const shapes = [];
    const x = 3 / 2;
    const y = Math.sqrt(3);
    const directions = [new Vector2(0, -y), new Vector2(x, -y / 2), new Vector2(x, y / 2), new Vector2(0, y), new Vector2(-x, y / 2), new Vector2(-x, -y / 2)].map(v => v.rotated(-Math.PI / 3).componentTimes(new Vector2(-1, 1)));
    for (let ring = radius; ring >= 1; ring--) {
      for (let dir = 0; dir < 6; dir++) {
        let coord = directions[dir].timesScalar(ring);
        for (let i = 0; i < ring; i++) {
          shapes.push(hexShape.transformed(Matrix3.translation(coord.x, coord.y)));
          coord = coord.plus(directions[(dir + 2) % 6]);
        }
      }
    }
    shapes.push(hexShape);
    return new ShapePartition(shapes);
  }
}
fractionsCommon.register('ShapePartition', ShapePartition);
const RESCALE_SIZE = 4000;
const MAX_PIECES = 12;
const LIMITED_MAX_PIECES = 6; // For certain types, we want to limit the quantity for visibility

// @public {Array.<ShapePartition>}
ShapePartition.PIES = _.range(1, MAX_PIECES + 1).map(quantity => ShapePartition.createPie(quantity).rescaled(RESCALE_SIZE));
ShapePartition.POLYGONS = _.range(3, MAX_PIECES + 1).map(quantity => ShapePartition.createPolygon(quantity).rescaled(RESCALE_SIZE));
ShapePartition.HORIZONTAL_BARS = _.range(1, LIMITED_MAX_PIECES + 1).map(quantity => ShapePartition.createHorizontalBars(quantity).rescaled(RESCALE_SIZE));
ShapePartition.VERTICAL_BARS = _.range(1, LIMITED_MAX_PIECES + 1).map(quantity => ShapePartition.createVerticalBars(quantity).rescaled(RESCALE_SIZE));
ShapePartition.INTERLEAVED_LS = [ShapePartition.createInterleavedL(1, 1), ShapePartition.createInterleavedL(2, 1), ShapePartition.createInterleavedL(2, 3)].map(partition => partition.rescaled(RESCALE_SIZE));
ShapePartition.DIAGONAL_LS = _.range(1, MAX_PIECES / 2 + 1).map(quantity => ShapePartition.createDiagonalL(quantity).rescaled(RESCALE_SIZE));
ShapePartition.PLUS_SIGNS = _.range(1, 7).map(quantity => ShapePartition.createPlusSigns(quantity).rescaled(RESCALE_SIZE));
ShapePartition.GRIDS = _.range(2, 4).map(quantity => ShapePartition.createGrid(quantity, quantity).rescaled(RESCALE_SIZE));
ShapePartition.PYRAMIDS = _.range(1, 4).map(quantity => ShapePartition.createPyramid(quantity).rescaled(RESCALE_SIZE));
ShapePartition.EXTENDED_HORIZONTAL_BARS = [..._.range(1, 9).map(quantity => ShapePartition.createHorizontalBars(quantity).rescaled(RESCALE_SIZE)), ShapePartition.createGrid(3, 3).rescaled(RESCALE_SIZE)];
ShapePartition.EXTENDED_VERTICAL_BARS = [..._.range(1, 9).map(quantity => ShapePartition.createVerticalBars(quantity).rescaled(RESCALE_SIZE)), ShapePartition.createGrid(3, 3).rescaled(RESCALE_SIZE)];
ShapePartition.EXTENDED_RECTANGULAR_BARS = _.range(1, 10).map(quantity => ShapePartition.createRectangularBars(quantity).rescaled(RESCALE_SIZE));

// @public {ShapePartition}
ShapePartition.TETRIS = ShapePartition.createTetris().rescaled(RESCALE_SIZE);
ShapePartition.NINJA_STAR = ShapePartition.createFlower(4, true, 1.8381770764635208).rescaled(RESCALE_SIZE);
ShapePartition.FIVE_POINT = ShapePartition.createFlower(5, true).rescaled(RESCALE_SIZE);
ShapePartition.SIX_FLOWER = ShapePartition.createFlower(6).rescaled(RESCALE_SIZE);
ShapePartition.HEX_RING = ShapePartition.createHoneycomb(1).rescaled(RESCALE_SIZE);

// @public {Array.<ShapePartition>}
ShapePartition.UNIVERSAL_PARTITIONS = [...ShapePartition.PIES, ...ShapePartition.HORIZONTAL_BARS, ...ShapePartition.VERTICAL_BARS];

// @public {Array.<ShapePartition>}
ShapePartition.GAME_PARTITIONS = [...ShapePartition.PIES, ...ShapePartition.HORIZONTAL_BARS, ...ShapePartition.VERTICAL_BARS, ...ShapePartition.GRIDS, ...ShapePartition.PYRAMIDS, ShapePartition.SIX_FLOWER, ShapePartition.HEX_RING, ShapePartition.FIVE_POINT, ...ShapePartition.POLYGONS];
ShapePartition.LIMITED_9_GAME_PARTITIONS = ShapePartition.GAME_PARTITIONS.filter(partition => partition.length <= 9);

// @public {number}
ShapePartition.GAME_PARTITIONS_MAX_WIDTH = Math.max(...ShapePartition.GAME_PARTITIONS.map(partition => {
  return partition.outlineShape.bounds.width;
}));

// @public {Array.<ShapePartition>}
ShapePartition.SHAPE_PARTITIONS = [...ShapePartition.PIES, ...ShapePartition.POLYGONS, ...ShapePartition.HORIZONTAL_BARS, ...ShapePartition.VERTICAL_BARS, ...ShapePartition.INTERLEAVED_LS, ...ShapePartition.DIAGONAL_LS, ...ShapePartition.PLUS_SIGNS, ...ShapePartition.GRIDS, ...ShapePartition.PYRAMIDS, ShapePartition.TETRIS, ShapePartition.NINJA_STAR, ShapePartition.FIVE_POINT, ShapePartition.SIX_FLOWER, ShapePartition.HEX_RING];
export default ShapePartition;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXgzIiwiVmVjdG9yMiIsIlNoYXBlIiwiZnJhY3Rpb25zQ29tbW9uIiwiU2hhcGVQYXJ0aXRpb24iLCJjb25zdHJ1Y3RvciIsInNoYXBlcyIsImxlbmd0aCIsIm91dGxpbmVTaGFwZSIsInVuaW9uIiwiZm9yRWFjaCIsInNoYXBlIiwibWFrZUltbXV0YWJsZSIsInJlc2NhbGVkIiwidG90YWxBcmVhIiwiYXJlYSIsImdldEFyZWEiLCJNYXRoIiwiYWJzIiwibWF0cml4Iiwic2NhbGUiLCJzcXJ0IiwibWFwIiwidHJhbnNmb3JtZWQiLCJ0eXBlIiwic3VwcG9ydHNEZW5vbWluYXRvciIsInNoYXBlUGFydGl0aW9ucyIsImRlbm9taW5hdG9yIiwiZmlsdGVyIiwic2hhcGVQYXJ0aXRpb24iLCJzdXBwb3J0c0RpdmlzaWJsZURlbm9taW5hdG9yIiwiY3JlYXRlUGllIiwicXVhbnRpdHkiLCJhc3NlcnQiLCJyYWRpdXMiLCJpIiwic3RhcnRBbmdsZSIsIlBJIiwiZW5kQW5nbGUiLCJtb3ZlVG8iLCJhcmMiLCJjbG9zZSIsInB1c2giLCJjaXJjbGUiLCJjcmVhdGVQb2x5Z29uIiwiaW5pdGlhbFBvaW50cyIsIl8iLCJyYW5nZSIsImNyZWF0ZVBvbGFyIiwic29ydGVkIiwic29ydEJ5IiwiYm90dG9tUG9pbnQiLCJuZXh0VG9Cb3R0b21Qb2ludCIsIm9mZnNldCIsInkiLCJ4IiwicGx1cyIsImFuZ2xlIiwicG9seWdvbiIsIlpFUk8iLCJjcmVhdGVIb3Jpem9udGFsQmFycyIsInJlY3QiLCJjcmVhdGVWZXJ0aWNhbEJhcnMiLCJjcmVhdGVSZWN0YW5ndWxhckJhcnMiLCJ5TXVsdGlwbGllciIsImNyZWF0ZUludGVybGVhdmVkTCIsIm51bVBhaXJDb2x1bW5zIiwibnVtUGFpclJvd3MiLCJsZWZ0U2lkZVNoYXBlIiwicmlnaHRTaWRlU2hhcGUiLCJqIiwidHJhbnNsYXRpb24iLCJjcmVhdGVEaWFnb25hbEwiLCJudW1QYWlycyIsInRvcFNoYXBlIiwiYm90dG9tU2hhcGUiLCJjcmVhdGVUZXRyaXMiLCJjcmVhdGVGbG93ZXIiLCJudW1QZXRhbHMiLCJzcGxpdCIsInRpcERpc3RhbmNlIiwiWF9VTklUIiwibWFnbml0dWRlIiwicG9sYXIiLCJoYWxmQW5nbGUiLCJmbGF0dGVuIiwiYmFzZUFuZ2xlIiwiY3JlYXRlUGx1c1NpZ25zIiwicGx1c1NoYXBlIiwic2xpY2UiLCJjcmVhdGVHcmlkIiwicm93cyIsImNvbHVtbnMiLCJyb3ciLCJjb2x1bW4iLCJjcmVhdGVQeXJhbWlkIiwiaGVpZ2h0IiwiVVBQRVJfTEVGVCIsIlVQUEVSX1JJR0hUIiwiUklHSFQiLCJjb3JuZXIiLCJjcmVhdGVIb25leWNvbWIiLCJoZXhTaGFwZSIsInJlZ3VsYXJQb2x5Z29uIiwiZGlyZWN0aW9ucyIsInYiLCJyb3RhdGVkIiwiY29tcG9uZW50VGltZXMiLCJyaW5nIiwiZGlyIiwiY29vcmQiLCJ0aW1lc1NjYWxhciIsInJlZ2lzdGVyIiwiUkVTQ0FMRV9TSVpFIiwiTUFYX1BJRUNFUyIsIkxJTUlURURfTUFYX1BJRUNFUyIsIlBJRVMiLCJQT0xZR09OUyIsIkhPUklaT05UQUxfQkFSUyIsIlZFUlRJQ0FMX0JBUlMiLCJJTlRFUkxFQVZFRF9MUyIsInBhcnRpdGlvbiIsIkRJQUdPTkFMX0xTIiwiUExVU19TSUdOUyIsIkdSSURTIiwiUFlSQU1JRFMiLCJFWFRFTkRFRF9IT1JJWk9OVEFMX0JBUlMiLCJFWFRFTkRFRF9WRVJUSUNBTF9CQVJTIiwiRVhURU5ERURfUkVDVEFOR1VMQVJfQkFSUyIsIlRFVFJJUyIsIk5JTkpBX1NUQVIiLCJGSVZFX1BPSU5UIiwiU0lYX0ZMT1dFUiIsIkhFWF9SSU5HIiwiVU5JVkVSU0FMX1BBUlRJVElPTlMiLCJHQU1FX1BBUlRJVElPTlMiLCJMSU1JVEVEXzlfR0FNRV9QQVJUSVRJT05TIiwiR0FNRV9QQVJUSVRJT05TX01BWF9XSURUSCIsIm1heCIsImJvdW5kcyIsIndpZHRoIiwiU0hBUEVfUEFSVElUSU9OUyJdLCJzb3VyY2VzIjpbIlNoYXBlUGFydGl0aW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgbm9ub3ZlcmxhcHBpbmcgcGFydGl0aW9uIG9mIGEgbGFyZ2VyIFwic2hhcGVcIiBpbnRvIHNtYWxsZXIgc2hhcGVzLCB0aGF0IGNhbiBiZSByZXNjYWxlZCBvciB1c2VkIHRvIGRpc3BsYXkgYVxyXG4gKiBmcmFjdGlvbmFsIHJlcHJlc2VudGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGZyYWN0aW9uc0NvbW1vbiBmcm9tICcuLi8uLi9mcmFjdGlvbnNDb21tb24uanMnO1xyXG5cclxuY2xhc3MgU2hhcGVQYXJ0aXRpb24ge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFNoYXBlPn0gc2hhcGVzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHNoYXBlcyApIHtcclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxTaGFwZT59XHJcbiAgICB0aGlzLnNoYXBlcyA9IHNoYXBlcztcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9XHJcbiAgICB0aGlzLmxlbmd0aCA9IHNoYXBlcy5sZW5ndGg7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7U2hhcGV9XHJcbiAgICB0aGlzLm91dGxpbmVTaGFwZSA9IFNoYXBlLnVuaW9uKCBzaGFwZXMgKTtcclxuXHJcbiAgICAvLyBNYWtlIHRoZSBzaGFwZXMgaW1tdXRhYmxlLCBzbyBpdCBtaW5pbWl6ZXMgdGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgYWRkZWQgbGF0ZXJcclxuICAgIFsgLi4udGhpcy5zaGFwZXMsIHRoaXMub3V0bGluZVNoYXBlIF0uZm9yRWFjaCggc2hhcGUgPT4gc2hhcGUubWFrZUltbXV0YWJsZSgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb25kaXRpb25hbGx5IHJlc2NhbGVzIGEgU2hhcGVQYXJ0aXRpb24gdG8gaGF2ZSBhIGdpdmVuIGFyZWEuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRvdGFsQXJlYVxyXG4gICAqIEByZXR1cm5zIHtTaGFwZVBhcnRpdGlvbn1cclxuICAgKi9cclxuICByZXNjYWxlZCggdG90YWxBcmVhICkge1xyXG4gICAgY29uc3QgYXJlYSA9IHRoaXMub3V0bGluZVNoYXBlLmdldEFyZWEoKTtcclxuICAgIGlmICggTWF0aC5hYnMoIGFyZWEgLSB0b3RhbEFyZWEgKSA8IDFlLTUgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNvbnN0IG1hdHJpeCA9IE1hdHJpeDMuc2NhbGUoIE1hdGguc3FydCggdG90YWxBcmVhIC8gYXJlYSApICk7XHJcbiAgICAgIHJldHVybiBuZXcgU2hhcGVQYXJ0aXRpb24oIHRoaXMuc2hhcGVzLm1hcCggc2hhcGUgPT4gc2hhcGUudHJhbnNmb3JtZWQoIG1hdHJpeCApICksIHRoaXMudHlwZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGZpbHRlcmVkIGxpc3Qgb2YgYWxsIFNoYXBlUGFydGl0aW9ucyB0aGF0IGhhdmUgdGhlIHNhbWUgbnVtYmVyIG9mIHNoYXBlcyBhcyB0aGUgZ2l2ZW4gZGVub21pbmF0b3IuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48U2hhcGVQYXJ0aXRpb24+fSBzaGFwZVBhcnRpdGlvbnNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVub21pbmF0b3JcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPFNoYXBlUGFydGl0aW9uPn1cclxuICAgKi9cclxuICBzdGF0aWMgc3VwcG9ydHNEZW5vbWluYXRvciggc2hhcGVQYXJ0aXRpb25zLCBkZW5vbWluYXRvciApIHtcclxuICAgIHJldHVybiBzaGFwZVBhcnRpdGlvbnMuZmlsdGVyKCBzaGFwZVBhcnRpdGlvbiA9PiBzaGFwZVBhcnRpdGlvbi5sZW5ndGggPT09IGRlbm9taW5hdG9yICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgZmlsdGVyZWQgbGlzdCBvZiBhbGwgU2hhcGVQYXJ0aXRpb25zIHdob3NlIG51bWJlciBvZiBzaGFwZXMgaXMgZGl2aXNpYmxlIGJ5IHRoZSBkZW5vbWluYXRvci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxTaGFwZVBhcnRpdGlvbj59IHNoYXBlUGFydGl0aW9uc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkZW5vbWluYXRvclxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48U2hhcGVQYXJ0aXRpb24+fVxyXG4gICAqL1xyXG4gIHN0YXRpYyBzdXBwb3J0c0RpdmlzaWJsZURlbm9taW5hdG9yKCBzaGFwZVBhcnRpdGlvbnMsIGRlbm9taW5hdG9yICkge1xyXG4gICAgcmV0dXJuIHNoYXBlUGFydGl0aW9ucy5maWx0ZXIoIHNoYXBlUGFydGl0aW9uID0+IHNoYXBlUGFydGl0aW9uLmxlbmd0aCAlIGRlbm9taW5hdG9yID09PSAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgcGllLXNoYXBlZCBwYXJ0aXRpb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHF1YW50aXR5IC0gTnVtYmVyIG9mIHBpZSBwaWVjZXNcclxuICAgKiBAcmV0dXJucyB7U2hhcGVQYXJ0aXRpb259XHJcbiAgICovXHJcbiAgc3RhdGljIGNyZWF0ZVBpZSggcXVhbnRpdHkgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBxdWFudGl0eSA+PSAxICYmIHF1YW50aXR5ICUgMSA9PT0gMCApO1xyXG5cclxuICAgIGNvbnN0IHJhZGl1cyA9IDE7XHJcblxyXG4gICAgY29uc3Qgc2hhcGVzID0gW107XHJcbiAgICBpZiAoIHF1YW50aXR5ID4gMSApIHtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcXVhbnRpdHk7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBzdGFydEFuZ2xlID0gLTIgKiBNYXRoLlBJICogaSAvIHF1YW50aXR5O1xyXG4gICAgICAgIGNvbnN0IGVuZEFuZ2xlID0gLTIgKiBNYXRoLlBJICogKCBpICsgMSApIC8gcXVhbnRpdHk7XHJcbiAgICAgICAgY29uc3Qgc2hhcGUgPSBuZXcgU2hhcGUoKVxyXG4gICAgICAgICAgLm1vdmVUbyggMCwgMCApXHJcbiAgICAgICAgICAuYXJjKCAwLCAwLCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCB0cnVlIClcclxuICAgICAgICAgIC5jbG9zZSgpO1xyXG4gICAgICAgIHNoYXBlcy5wdXNoKCBzaGFwZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgc2hhcGVzLnB1c2goIFNoYXBlLmNpcmNsZSggMCwgMCwgcmFkaXVzICkgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgU2hhcGVQYXJ0aXRpb24oIHNoYXBlcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHJlZ3VsYXIgcG9seWdvbi1zaGFwZWQgcGFydGl0aW9uLCBzbGljZWQgbGlrZSBhIHBpenphXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHF1YW50aXR5IC0gTnVtYmVyIG9mIHRyaWFuZ2xlc1xyXG4gICAqIEByZXR1cm5zIHtTaGFwZVBhcnRpdGlvbn1cclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlUG9seWdvbiggcXVhbnRpdHkgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBxdWFudGl0eSA+PSAzICYmIHF1YW50aXR5ICUgMSA9PT0gMCApO1xyXG5cclxuICAgIGNvbnN0IGluaXRpYWxQb2ludHMgPSBfLnJhbmdlKCAwLCBxdWFudGl0eSApLm1hcCggaSA9PiBWZWN0b3IyLmNyZWF0ZVBvbGFyKCAxLCAtMiAqIE1hdGguUEkgKiBpIC8gcXVhbnRpdHkgKSApO1xyXG4gICAgY29uc3Qgc29ydGVkID0gXy5zb3J0QnkoIGluaXRpYWxQb2ludHMsICd5JyApO1xyXG4gICAgY29uc3QgYm90dG9tUG9pbnQgPSBzb3J0ZWRbIHNvcnRlZC5sZW5ndGggLSAxIF07XHJcbiAgICBjb25zdCBuZXh0VG9Cb3R0b21Qb2ludCA9IHNvcnRlZFsgc29ydGVkLmxlbmd0aCAtIDIgXTtcclxuICAgIGxldCBvZmZzZXQgPSAwO1xyXG5cclxuICAgIC8vIElnbm9yZSBpdCBpZiBvdXIgXCJiYXNlXCIgaXMgYWxyZWFkeSBob3Jpem9udGFsXHJcbiAgICBpZiAoIE1hdGguYWJzKCBib3R0b21Qb2ludC55IC0gbmV4dFRvQm90dG9tUG9pbnQueSApID4gMWUtNiApIHtcclxuXHJcbiAgICAgIC8vIElmIGl0J3Mgc3RyYWlnaHQgZG93blxyXG4gICAgICBpZiAoIE1hdGguYWJzKCBib3R0b21Qb2ludC54ICkgPCAxZS02ICkge1xyXG4gICAgICAgIG9mZnNldCA9IE1hdGguUEkgLyBxdWFudGl0eTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBvZmZzZXQgPSAtYm90dG9tUG9pbnQucGx1cyggbmV4dFRvQm90dG9tUG9pbnQgKS5hbmdsZSArIE1hdGguUEkgLyAyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ldyBTaGFwZVBhcnRpdGlvbihcclxuICAgICAgXy5yYW5nZSggMCwgcXVhbnRpdHkgKS5tYXAoIGkgPT4gU2hhcGUucG9seWdvbiggW1xyXG4gICAgICAgIFZlY3RvcjIuWkVSTyxcclxuICAgICAgICBWZWN0b3IyLmNyZWF0ZVBvbGFyKCAxLCAtMiAqIE1hdGguUEkgKiBpIC8gcXVhbnRpdHkgKyBvZmZzZXQgKSxcclxuICAgICAgICBWZWN0b3IyLmNyZWF0ZVBvbGFyKCAxLCAtMiAqIE1hdGguUEkgKiAoIGkgKyAxICkgLyBxdWFudGl0eSArIG9mZnNldCApXHJcbiAgICAgIF0gKSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3RhY2sgb2YgaG9yaXpvbnRhbCBiYXJzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBxdWFudGl0eSAtIE51bWJlciBvZiBiYXJzXHJcbiAgICogQHJldHVybnMge1NoYXBlUGFydGl0aW9ufVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjcmVhdGVIb3Jpem9udGFsQmFycyggcXVhbnRpdHkgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBxdWFudGl0eSA+PSAxICYmIHF1YW50aXR5ICUgMSA9PT0gMCApO1xyXG5cclxuICAgIHJldHVybiBuZXcgU2hhcGVQYXJ0aXRpb24oXHJcbiAgICAgIF8ucmFuZ2UoIDAsIHF1YW50aXR5ICkubWFwKCBpID0+IFNoYXBlLnJlY3QoIC0xLCAyICogaSAvIHF1YW50aXR5IC0gMSwgMiwgMiAvIHF1YW50aXR5ICkgKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzdGFjayBvZiB2ZXJ0aWNhbCBiYXJzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBxdWFudGl0eSAtIE51bWJlciBvZiBiYXJzXHJcbiAgICogQHJldHVybnMge1NoYXBlUGFydGl0aW9ufVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjcmVhdGVWZXJ0aWNhbEJhcnMoIHF1YW50aXR5ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcXVhbnRpdHkgPj0gMSAmJiBxdWFudGl0eSAlIDEgPT09IDAgKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFNoYXBlUGFydGl0aW9uKFxyXG4gICAgICBfLnJhbmdlKCAwLCBxdWFudGl0eSApLm1hcCggaSA9PiBTaGFwZS5yZWN0KCAyICogaSAvIHF1YW50aXR5IC0gMSwgLTEsIDIgLyBxdWFudGl0eSwgMiApIClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3RhY2sgb2YgcmVjdGFuZ3VsYXIgYmFycy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcXVhbnRpdHkgLSBOdW1iZXIgb2YgYmFyc1xyXG4gICAqIEByZXR1cm5zIHtTaGFwZVBhcnRpdGlvbn1cclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlUmVjdGFuZ3VsYXJCYXJzKCBxdWFudGl0eSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHF1YW50aXR5ID49IDEgJiYgcXVhbnRpdHkgJSAxID09PSAwICk7XHJcblxyXG4gICAgY29uc3QgeU11bHRpcGxpZXIgPSAxLjI1O1xyXG5cclxuICAgIHJldHVybiBuZXcgU2hhcGVQYXJ0aXRpb24oXHJcbiAgICAgIF8ucmFuZ2UoIDAsIHF1YW50aXR5ICkubWFwKCBpID0+IFNoYXBlLnJlY3QoIC0xLCB5TXVsdGlwbGllciAqIDIgKiBpIC8gcXVhbnRpdHkgLSAxLCAyLCB5TXVsdGlwbGllciAqIDIgLyBxdWFudGl0eSApIClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgcGF0dGVybiBvZiBpbnRlcmxlYXZlZCBMLWxpa2UgcGllY2VzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1QYWlyQ29sdW1uc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1QYWlyUm93c1xyXG4gICAqIEByZXR1cm5zIHtTaGFwZVBhcnRpdGlvbn1cclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlSW50ZXJsZWF2ZWRMKCBudW1QYWlyQ29sdW1ucywgbnVtUGFpclJvd3MgKSB7XHJcbiAgICBjb25zdCBzaGFwZXMgPSBbXTtcclxuXHJcbiAgICBjb25zdCBsZWZ0U2lkZVNoYXBlID0gU2hhcGUucG9seWdvbiggW1xyXG4gICAgICBuZXcgVmVjdG9yMiggMCwgMCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMSAvIDMsIDAgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDEgLyAzLCAwLjUgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDIgLyAzLCAwLjUgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDIgLyAzLCAxICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAwLCAxIClcclxuICAgIF0gKTtcclxuICAgIGNvbnN0IHJpZ2h0U2lkZVNoYXBlID0gU2hhcGUucG9seWdvbiggW1xyXG4gICAgICBuZXcgVmVjdG9yMiggMSwgMCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMSwgMSApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMiAvIDMsIDEgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDIgLyAzLCAwLjUgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDEgLyAzLCAwLjUgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDEgLyAzLCAwIClcclxuICAgIF0gKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1QYWlyQ29sdW1uczsgaSsrICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBudW1QYWlyUm93czsgaisrICkge1xyXG4gICAgICAgIGNvbnN0IG1hdHJpeCA9IE1hdHJpeDMudHJhbnNsYXRpb24oIGksIGogKTtcclxuICAgICAgICBzaGFwZXMucHVzaCggbGVmdFNpZGVTaGFwZS50cmFuc2Zvcm1lZCggbWF0cml4ICkgKTtcclxuICAgICAgICBzaGFwZXMucHVzaCggcmlnaHRTaWRlU2hhcGUudHJhbnNmb3JtZWQoIG1hdHJpeCApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IFNoYXBlUGFydGl0aW9uKCBzaGFwZXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBkaWFnb25hbCBwYXR0ZXJuIG9mIGludGVybG9ja2luZyBMIHBpZWNlc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1QYWlyc1xyXG4gICAqIEByZXR1cm5zIHtTaGFwZVBhcnRpdGlvbn1cclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlRGlhZ29uYWxMKCBudW1QYWlycyApIHtcclxuICAgIGNvbnN0IHNoYXBlcyA9IFtdO1xyXG5cclxuICAgIGNvbnN0IHRvcFNoYXBlID0gU2hhcGUucG9seWdvbiggW1xyXG4gICAgICBuZXcgVmVjdG9yMiggMCwgMCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMiwgMCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMiwgMyApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMSwgMyApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMSwgMSApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMCwgMSApXHJcbiAgICBdICk7XHJcbiAgICBjb25zdCBib3R0b21TaGFwZSA9IFNoYXBlLnBvbHlnb24oIFtcclxuICAgICAgbmV3IFZlY3RvcjIoIDAsIDEgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDEsIDEgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDEsIDMgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDIsIDMgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDIsIDQgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDAsIDQgKVxyXG4gICAgXSApO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bVBhaXJzOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IG1hdHJpeCA9IE1hdHJpeDMudHJhbnNsYXRpb24oIGkgKiAyLCBpICk7XHJcbiAgICAgIHNoYXBlcy5wdXNoKCB0b3BTaGFwZS50cmFuc2Zvcm1lZCggbWF0cml4ICkgKTtcclxuICAgICAgc2hhcGVzLnB1c2goIGJvdHRvbVNoYXBlLnRyYW5zZm9ybWVkKCBtYXRyaXggKSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgU2hhcGVQYXJ0aXRpb24oIHNoYXBlcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHRldHJpcyBwaWVjZSBzaGFwZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtTaGFwZVBhcnRpdGlvbn1cclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlVGV0cmlzKCkge1xyXG4gICAgcmV0dXJuIG5ldyBTaGFwZVBhcnRpdGlvbiggW1xyXG4gICAgICBTaGFwZS5wb2x5Z29uKCBbXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIDMsIDAgKSxcclxuICAgICAgICBuZXcgVmVjdG9yMiggNCwgMCApLFxyXG4gICAgICAgIG5ldyBWZWN0b3IyKCA0LCAzICksXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIDMsIDMgKSxcclxuICAgICAgICBuZXcgVmVjdG9yMiggMywgMiApLFxyXG4gICAgICAgIG5ldyBWZWN0b3IyKCAyLCAyICksXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIDIsIDEgKSxcclxuICAgICAgICBuZXcgVmVjdG9yMiggMywgMSApXHJcbiAgICAgIF0gKSxcclxuICAgICAgU2hhcGUucG9seWdvbiggW1xyXG4gICAgICAgIG5ldyBWZWN0b3IyKCAwLCAwICksXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIDMsIDAgKSxcclxuICAgICAgICBuZXcgVmVjdG9yMiggMywgMSApLFxyXG4gICAgICAgIG5ldyBWZWN0b3IyKCAyLCAxICksXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIDIsIDIgKSxcclxuICAgICAgICBuZXcgVmVjdG9yMiggMSwgMiApLFxyXG4gICAgICAgIG5ldyBWZWN0b3IyKCAxLCAxICksXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIDAsIDEgKVxyXG4gICAgICBdICksXHJcbiAgICAgIFNoYXBlLnBvbHlnb24oIFtcclxuICAgICAgICBuZXcgVmVjdG9yMiggMCwgNCApLFxyXG4gICAgICAgIG5ldyBWZWN0b3IyKCAwLCAxICksXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIDEsIDEgKSxcclxuICAgICAgICBuZXcgVmVjdG9yMiggMSwgMiApLFxyXG4gICAgICAgIG5ldyBWZWN0b3IyKCAyLCAyICksXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIDIsIDMgKSxcclxuICAgICAgICBuZXcgVmVjdG9yMiggMSwgMyApLFxyXG4gICAgICAgIG5ldyBWZWN0b3IyKCAxLCA0IClcclxuICAgICAgXSApLFxyXG4gICAgICBTaGFwZS5wb2x5Z29uKCBbXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIDQsIDMgKSxcclxuICAgICAgICBuZXcgVmVjdG9yMiggNCwgNCApLFxyXG4gICAgICAgIG5ldyBWZWN0b3IyKCAxLCA0ICksXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIDEsIDMgKSxcclxuICAgICAgICBuZXcgVmVjdG9yMiggMiwgMyApLFxyXG4gICAgICAgIG5ldyBWZWN0b3IyKCAyLCAyICksXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIDMsIDIgKSxcclxuICAgICAgICBuZXcgVmVjdG9yMiggMywgMyApXHJcbiAgICAgIF0gKVxyXG4gICAgXSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGZsb3dlci1saWtlIHNoYXBlIGNvbXBvc2VkIG9mIChieSBkZWZhdWx0KSByaG9tYmkgYXJvdW5kIGEgY2VudGVyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1QZXRhbHNcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtzcGxpdF0gLSBXaGV0aGVyIGVhY2ggcGV0YWwgc2hvdWxkIGJlIHNwbGl0IGludG8gdHdvIHNoYXBlcyAob3IgbGVmdCBhcyBvbmUpXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt0aXBEaXN0YW5jZV0gLSBIb3cgZmFyIHRoZSBwZXRhbCB0aXBzIGFyZSBmcm9tIHRoZSBjZW50ZXIuXHJcbiAgICogQHJldHVybnMge1NoYXBlUGFydGl0aW9ufVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjcmVhdGVGbG93ZXIoIG51bVBldGFscywgc3BsaXQgPSBmYWxzZSwgdGlwRGlzdGFuY2UgPSBWZWN0b3IyLmNyZWF0ZVBvbGFyKCAxLCAyICogTWF0aC5QSSAvIG51bVBldGFscyApLnBsdXMoIFZlY3RvcjIuWF9VTklUICkubWFnbml0dWRlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbnVtUGV0YWxzID49IDMgJiYgbnVtUGV0YWxzICUgMSA9PT0gMCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHNwbGl0ID09PSAnYm9vbGVhbicgKTtcclxuXHJcbiAgICBmdW5jdGlvbiBwb2xhciggbWFnbml0dWRlLCBhbmdsZSApIHtcclxuICAgICAgcmV0dXJuIFZlY3RvcjIuY3JlYXRlUG9sYXIoIG1hZ25pdHVkZSwgLWFuZ2xlIC0gTWF0aC5QSSAvIDIgKyAoIHNwbGl0ID8gMCA6ICggLU1hdGguUEkgLyBudW1QZXRhbHMgKSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaGFsZkFuZ2xlID0gTWF0aC5QSSAvIG51bVBldGFscztcclxuICAgIHJldHVybiBuZXcgU2hhcGVQYXJ0aXRpb24oIF8uZmxhdHRlbiggXy5yYW5nZSggMCwgbnVtUGV0YWxzICkubWFwKCBpID0+IHtcclxuICAgICAgY29uc3QgYmFzZUFuZ2xlID0gMiAqIE1hdGguUEkgKiBpIC8gbnVtUGV0YWxzIC0gTWF0aC5QSSAvIDI7XHJcbiAgICAgIGlmICggc3BsaXQgKSB7XHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIFNoYXBlLnBvbHlnb24oIFtcclxuICAgICAgICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICAgICAgICBwb2xhciggdGlwRGlzdGFuY2UsIGJhc2VBbmdsZSApLFxyXG4gICAgICAgICAgICBwb2xhciggMSwgYmFzZUFuZ2xlICsgaGFsZkFuZ2xlIClcclxuICAgICAgICAgIF0gKSxcclxuICAgICAgICAgIFNoYXBlLnBvbHlnb24oIFtcclxuICAgICAgICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICAgICAgICBwb2xhciggMSwgYmFzZUFuZ2xlICsgaGFsZkFuZ2xlICksXHJcbiAgICAgICAgICAgIHBvbGFyKCB0aXBEaXN0YW5jZSwgYmFzZUFuZ2xlICsgMiAqIGhhbGZBbmdsZSApXHJcbiAgICAgICAgICBdIClcclxuICAgICAgICBdO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBbIFNoYXBlLnBvbHlnb24oIFtcclxuICAgICAgICAgIFZlY3RvcjIuWkVSTyxcclxuICAgICAgICAgIHBvbGFyKCAxLCBiYXNlQW5nbGUgLSBoYWxmQW5nbGUgKSxcclxuICAgICAgICAgIHBvbGFyKCB0aXBEaXN0YW5jZSwgYmFzZUFuZ2xlICksXHJcbiAgICAgICAgICBwb2xhciggMSwgYmFzZUFuZ2xlICsgaGFsZkFuZ2xlIClcclxuICAgICAgICBdICkgXTtcclxuICAgICAgfVxyXG4gICAgfSApICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBncm91cGluZyBvZiBwbHVzIHNpZ25zLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBxdWFudGl0eVxyXG4gICAqIEByZXR1cm5zIHtTaGFwZVBhcnRpdGlvbn1cclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlUGx1c1NpZ25zKCBxdWFudGl0eSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHF1YW50aXR5ID49IDEgJiYgcXVhbnRpdHkgPD0gNiApO1xyXG5cclxuICAgIGNvbnN0IHBsdXNTaGFwZSA9IFNoYXBlLnVuaW9uKCBbXHJcbiAgICAgIFNoYXBlLnJlY3QoIDAsIDEsIDMsIDEgKSxcclxuICAgICAgU2hhcGUucmVjdCggMSwgMCwgMSwgMyApXHJcbiAgICBdICk7XHJcbiAgICByZXR1cm4gbmV3IFNoYXBlUGFydGl0aW9uKCBbXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAxLCAwICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAzLCAxICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAwLCAyICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAyLCAzICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAtMSwgNCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMSwgNSApXHJcbiAgICBdLnNsaWNlKCAwLCBxdWFudGl0eSApLm1hcCggb2Zmc2V0ID0+IHtcclxuICAgICAgcmV0dXJuIHBsdXNTaGFwZS50cmFuc2Zvcm1lZCggTWF0cml4My50cmFuc2xhdGlvbiggb2Zmc2V0LngsIG9mZnNldC55ICkgKTtcclxuICAgIH0gKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHJlY3Rhbmd1bGFyIGdyaWQgb2Ygc2hhcGVzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByb3dzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvbHVtbnNcclxuICAgKiBAcmV0dXJucyB7U2hhcGVQYXJ0aXRpb259XHJcbiAgICovXHJcbiAgc3RhdGljIGNyZWF0ZUdyaWQoIHJvd3MsIGNvbHVtbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByb3dzID49IDEgJiYgcm93cyAlIDEgPT09IDAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbHVtbnMgPj0gMSAmJiBjb2x1bW5zICUgMSA9PT0gMCApO1xyXG5cclxuICAgIHJldHVybiBuZXcgU2hhcGVQYXJ0aXRpb24oIF8uZmxhdHRlbiggXy5yYW5nZSggMCwgcm93cyApLm1hcCggcm93ID0+IHtcclxuICAgICAgcmV0dXJuIF8ucmFuZ2UoIDAsIGNvbHVtbnMgKS5tYXAoIGNvbHVtbiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIFNoYXBlLnJlY3QoIGNvbHVtbiAvIGNvbHVtbnMsIHJvdyAvIHJvd3MsIDEgLyBjb2x1bW5zLCAxIC8gcm93cyApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHB5cmFtaWRhbCBncmlkIG9mIGVxdWlsYXRlcmFsIHRyaWFuZ2xlcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcm93c1xyXG4gICAqIEByZXR1cm5zIHtTaGFwZVBhcnRpdGlvbn1cclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlUHlyYW1pZCggcm93cyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJvd3MgPj0gMSAmJiByb3dzICUgMSA9PT0gMCApO1xyXG5cclxuICAgIGNvbnN0IGhlaWdodCA9IE1hdGguc3FydCggMyApIC8gMjtcclxuICAgIGNvbnN0IHNoYXBlcyA9IFtdO1xyXG5cclxuICAgIGNvbnN0IFVQUEVSX0xFRlQgPSBuZXcgVmVjdG9yMiggLTAuNSwgLWhlaWdodCApO1xyXG4gICAgY29uc3QgVVBQRVJfUklHSFQgPSBuZXcgVmVjdG9yMiggMC41LCAtaGVpZ2h0ICk7XHJcbiAgICBjb25zdCBSSUdIVCA9IFZlY3RvcjIuWF9VTklUO1xyXG5cclxuICAgIGZvciAoIGxldCByb3cgPSAwOyByb3cgPCByb3dzOyByb3crKyApIHtcclxuICAgICAgZm9yICggbGV0IGNvbHVtbiA9IDA7IGNvbHVtbiA8PSByb3c7IGNvbHVtbisrICkge1xyXG4gICAgICAgIGNvbnN0IGNvcm5lciA9IG5ldyBWZWN0b3IyKCAtcm93IC8gMiArIGNvbHVtbiwgcm93ICogaGVpZ2h0ICk7XHJcbiAgICAgICAgaWYgKCBjb2x1bW4gIT09IDAgKSB7XHJcbiAgICAgICAgICBzaGFwZXMucHVzaCggU2hhcGUucG9seWdvbiggW1xyXG4gICAgICAgICAgICBjb3JuZXIsXHJcbiAgICAgICAgICAgIGNvcm5lci5wbHVzKCBVUFBFUl9MRUZUICksXHJcbiAgICAgICAgICAgIGNvcm5lci5wbHVzKCBVUFBFUl9SSUdIVCApXHJcbiAgICAgICAgICBdICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2hhcGVzLnB1c2goIFNoYXBlLnBvbHlnb24oIFtcclxuICAgICAgICAgIGNvcm5lcixcclxuICAgICAgICAgIGNvcm5lci5wbHVzKCBVUFBFUl9SSUdIVCApLFxyXG4gICAgICAgICAgY29ybmVyLnBsdXMoIFJJR0hUIClcclxuICAgICAgICBdICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgU2hhcGVQYXJ0aXRpb24oIHNoYXBlcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGhvbmV5Y29tYi1saWtlIGdyaWQgb2YgaGV4YWdvbnNcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzXHJcbiAgICogQHJldHVybnMge1NoYXBlUGFydGl0aW9ufVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjcmVhdGVIb25leWNvbWIoIHJhZGl1cyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJhZGl1cyA+PSAxICYmIHJhZGl1cyAlIDEgPT09IDAgKTtcclxuXHJcbiAgICBjb25zdCBoZXhTaGFwZSA9IFNoYXBlLnJlZ3VsYXJQb2x5Z29uKCA2LCAxICk7XHJcbiAgICBjb25zdCBzaGFwZXMgPSBbXTtcclxuICAgIGNvbnN0IHggPSAzIC8gMjtcclxuICAgIGNvbnN0IHkgPSBNYXRoLnNxcnQoIDMgKTtcclxuICAgIGNvbnN0IGRpcmVjdGlvbnMgPSBbXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAwLCAteSApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggeCwgLXkgLyAyICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCB4LCB5IC8gMiApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMCwgeSApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggLXgsIHkgLyAyICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAteCwgLXkgLyAyIClcclxuICAgIF0ubWFwKCB2ID0+IHYucm90YXRlZCggLU1hdGguUEkgLyAzICkuY29tcG9uZW50VGltZXMoIG5ldyBWZWN0b3IyKCAtMSwgMSApICkgKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgcmluZyA9IHJhZGl1czsgcmluZyA+PSAxOyByaW5nLS0gKSB7XHJcbiAgICAgIGZvciAoIGxldCBkaXIgPSAwOyBkaXIgPCA2OyBkaXIrKyApIHtcclxuICAgICAgICBsZXQgY29vcmQgPSBkaXJlY3Rpb25zWyBkaXIgXS50aW1lc1NjYWxhciggcmluZyApO1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHJpbmc7IGkrKyApIHtcclxuICAgICAgICAgIHNoYXBlcy5wdXNoKCBoZXhTaGFwZS50cmFuc2Zvcm1lZCggTWF0cml4My50cmFuc2xhdGlvbiggY29vcmQueCwgY29vcmQueSApICkgKTtcclxuICAgICAgICAgIGNvb3JkID0gY29vcmQucGx1cyggZGlyZWN0aW9uc1sgKCBkaXIgKyAyICkgJSA2IF0gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaGFwZXMucHVzaCggaGV4U2hhcGUgKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFNoYXBlUGFydGl0aW9uKCBzaGFwZXMgKTtcclxuICB9XHJcbn1cclxuXHJcbmZyYWN0aW9uc0NvbW1vbi5yZWdpc3RlciggJ1NoYXBlUGFydGl0aW9uJywgU2hhcGVQYXJ0aXRpb24gKTtcclxuXHJcbmNvbnN0IFJFU0NBTEVfU0laRSA9IDQwMDA7XHJcbmNvbnN0IE1BWF9QSUVDRVMgPSAxMjtcclxuY29uc3QgTElNSVRFRF9NQVhfUElFQ0VTID0gNjsgLy8gRm9yIGNlcnRhaW4gdHlwZXMsIHdlIHdhbnQgdG8gbGltaXQgdGhlIHF1YW50aXR5IGZvciB2aXNpYmlsaXR5XHJcblxyXG4vLyBAcHVibGljIHtBcnJheS48U2hhcGVQYXJ0aXRpb24+fVxyXG5TaGFwZVBhcnRpdGlvbi5QSUVTID0gXy5yYW5nZSggMSwgTUFYX1BJRUNFUyArIDEgKS5tYXAoIHF1YW50aXR5ID0+IFNoYXBlUGFydGl0aW9uLmNyZWF0ZVBpZSggcXVhbnRpdHkgKS5yZXNjYWxlZCggUkVTQ0FMRV9TSVpFICkgKTtcclxuU2hhcGVQYXJ0aXRpb24uUE9MWUdPTlMgPSBfLnJhbmdlKCAzLCBNQVhfUElFQ0VTICsgMSApLm1hcCggcXVhbnRpdHkgPT4gU2hhcGVQYXJ0aXRpb24uY3JlYXRlUG9seWdvbiggcXVhbnRpdHkgKS5yZXNjYWxlZCggUkVTQ0FMRV9TSVpFICkgKTtcclxuU2hhcGVQYXJ0aXRpb24uSE9SSVpPTlRBTF9CQVJTID0gXy5yYW5nZSggMSwgTElNSVRFRF9NQVhfUElFQ0VTICsgMSApLm1hcCggcXVhbnRpdHkgPT4gU2hhcGVQYXJ0aXRpb24uY3JlYXRlSG9yaXpvbnRhbEJhcnMoIHF1YW50aXR5ICkucmVzY2FsZWQoIFJFU0NBTEVfU0laRSApICk7XHJcblNoYXBlUGFydGl0aW9uLlZFUlRJQ0FMX0JBUlMgPSBfLnJhbmdlKCAxLCBMSU1JVEVEX01BWF9QSUVDRVMgKyAxICkubWFwKCBxdWFudGl0eSA9PiBTaGFwZVBhcnRpdGlvbi5jcmVhdGVWZXJ0aWNhbEJhcnMoIHF1YW50aXR5ICkucmVzY2FsZWQoIFJFU0NBTEVfU0laRSApICk7XHJcblNoYXBlUGFydGl0aW9uLklOVEVSTEVBVkVEX0xTID0gW1xyXG4gIFNoYXBlUGFydGl0aW9uLmNyZWF0ZUludGVybGVhdmVkTCggMSwgMSApLFxyXG4gIFNoYXBlUGFydGl0aW9uLmNyZWF0ZUludGVybGVhdmVkTCggMiwgMSApLFxyXG4gIFNoYXBlUGFydGl0aW9uLmNyZWF0ZUludGVybGVhdmVkTCggMiwgMyApXHJcbl0ubWFwKCBwYXJ0aXRpb24gPT4gcGFydGl0aW9uLnJlc2NhbGVkKCBSRVNDQUxFX1NJWkUgKSApO1xyXG5TaGFwZVBhcnRpdGlvbi5ESUFHT05BTF9MUyA9IF8ucmFuZ2UoIDEsIE1BWF9QSUVDRVMgLyAyICsgMSApLm1hcCggcXVhbnRpdHkgPT4gU2hhcGVQYXJ0aXRpb24uY3JlYXRlRGlhZ29uYWxMKCBxdWFudGl0eSApLnJlc2NhbGVkKCBSRVNDQUxFX1NJWkUgKSApO1xyXG5TaGFwZVBhcnRpdGlvbi5QTFVTX1NJR05TID0gXy5yYW5nZSggMSwgNyApLm1hcCggcXVhbnRpdHkgPT4gU2hhcGVQYXJ0aXRpb24uY3JlYXRlUGx1c1NpZ25zKCBxdWFudGl0eSApLnJlc2NhbGVkKCBSRVNDQUxFX1NJWkUgKSApO1xyXG5TaGFwZVBhcnRpdGlvbi5HUklEUyA9IF8ucmFuZ2UoIDIsIDQgKS5tYXAoIHF1YW50aXR5ID0+IFNoYXBlUGFydGl0aW9uLmNyZWF0ZUdyaWQoIHF1YW50aXR5LCBxdWFudGl0eSApLnJlc2NhbGVkKCBSRVNDQUxFX1NJWkUgKSApO1xyXG5TaGFwZVBhcnRpdGlvbi5QWVJBTUlEUyA9IF8ucmFuZ2UoIDEsIDQgKS5tYXAoIHF1YW50aXR5ID0+IFNoYXBlUGFydGl0aW9uLmNyZWF0ZVB5cmFtaWQoIHF1YW50aXR5ICkucmVzY2FsZWQoIFJFU0NBTEVfU0laRSApICk7XHJcblNoYXBlUGFydGl0aW9uLkVYVEVOREVEX0hPUklaT05UQUxfQkFSUyA9IFtcclxuICAuLi5fLnJhbmdlKCAxLCA5ICkubWFwKCBxdWFudGl0eSA9PiBTaGFwZVBhcnRpdGlvbi5jcmVhdGVIb3Jpem9udGFsQmFycyggcXVhbnRpdHkgKS5yZXNjYWxlZCggUkVTQ0FMRV9TSVpFICkgKSxcclxuICBTaGFwZVBhcnRpdGlvbi5jcmVhdGVHcmlkKCAzLCAzICkucmVzY2FsZWQoIFJFU0NBTEVfU0laRSApXHJcbl07XHJcblNoYXBlUGFydGl0aW9uLkVYVEVOREVEX1ZFUlRJQ0FMX0JBUlMgPSBbXHJcbiAgLi4uXy5yYW5nZSggMSwgOSApLm1hcCggcXVhbnRpdHkgPT4gU2hhcGVQYXJ0aXRpb24uY3JlYXRlVmVydGljYWxCYXJzKCBxdWFudGl0eSApLnJlc2NhbGVkKCBSRVNDQUxFX1NJWkUgKSApLFxyXG4gIFNoYXBlUGFydGl0aW9uLmNyZWF0ZUdyaWQoIDMsIDMgKS5yZXNjYWxlZCggUkVTQ0FMRV9TSVpFIClcclxuXTtcclxuU2hhcGVQYXJ0aXRpb24uRVhURU5ERURfUkVDVEFOR1VMQVJfQkFSUyA9IF8ucmFuZ2UoIDEsIDEwICkubWFwKCBxdWFudGl0eSA9PiBTaGFwZVBhcnRpdGlvbi5jcmVhdGVSZWN0YW5ndWxhckJhcnMoIHF1YW50aXR5ICkucmVzY2FsZWQoIFJFU0NBTEVfU0laRSApICk7XHJcblxyXG4vLyBAcHVibGljIHtTaGFwZVBhcnRpdGlvbn1cclxuU2hhcGVQYXJ0aXRpb24uVEVUUklTID0gU2hhcGVQYXJ0aXRpb24uY3JlYXRlVGV0cmlzKCkucmVzY2FsZWQoIFJFU0NBTEVfU0laRSApO1xyXG5TaGFwZVBhcnRpdGlvbi5OSU5KQV9TVEFSID0gU2hhcGVQYXJ0aXRpb24uY3JlYXRlRmxvd2VyKCA0LCB0cnVlLCAxLjgzODE3NzA3NjQ2MzUyMDggKS5yZXNjYWxlZCggUkVTQ0FMRV9TSVpFICk7XHJcblNoYXBlUGFydGl0aW9uLkZJVkVfUE9JTlQgPSBTaGFwZVBhcnRpdGlvbi5jcmVhdGVGbG93ZXIoIDUsIHRydWUgKS5yZXNjYWxlZCggUkVTQ0FMRV9TSVpFICk7XHJcblNoYXBlUGFydGl0aW9uLlNJWF9GTE9XRVIgPSBTaGFwZVBhcnRpdGlvbi5jcmVhdGVGbG93ZXIoIDYgKS5yZXNjYWxlZCggUkVTQ0FMRV9TSVpFICk7XHJcblNoYXBlUGFydGl0aW9uLkhFWF9SSU5HID0gU2hhcGVQYXJ0aXRpb24uY3JlYXRlSG9uZXljb21iKCAxICkucmVzY2FsZWQoIFJFU0NBTEVfU0laRSApO1xyXG5cclxuLy8gQHB1YmxpYyB7QXJyYXkuPFNoYXBlUGFydGl0aW9uPn1cclxuU2hhcGVQYXJ0aXRpb24uVU5JVkVSU0FMX1BBUlRJVElPTlMgPSBbXHJcbiAgLi4uU2hhcGVQYXJ0aXRpb24uUElFUyxcclxuICAuLi5TaGFwZVBhcnRpdGlvbi5IT1JJWk9OVEFMX0JBUlMsXHJcbiAgLi4uU2hhcGVQYXJ0aXRpb24uVkVSVElDQUxfQkFSU1xyXG5dO1xyXG5cclxuLy8gQHB1YmxpYyB7QXJyYXkuPFNoYXBlUGFydGl0aW9uPn1cclxuU2hhcGVQYXJ0aXRpb24uR0FNRV9QQVJUSVRJT05TID0gW1xyXG4gIC4uLlNoYXBlUGFydGl0aW9uLlBJRVMsXHJcbiAgLi4uU2hhcGVQYXJ0aXRpb24uSE9SSVpPTlRBTF9CQVJTLFxyXG4gIC4uLlNoYXBlUGFydGl0aW9uLlZFUlRJQ0FMX0JBUlMsXHJcbiAgLi4uU2hhcGVQYXJ0aXRpb24uR1JJRFMsXHJcbiAgLi4uU2hhcGVQYXJ0aXRpb24uUFlSQU1JRFMsXHJcbiAgU2hhcGVQYXJ0aXRpb24uU0lYX0ZMT1dFUixcclxuICBTaGFwZVBhcnRpdGlvbi5IRVhfUklORyxcclxuICBTaGFwZVBhcnRpdGlvbi5GSVZFX1BPSU5ULFxyXG4gIC4uLlNoYXBlUGFydGl0aW9uLlBPTFlHT05TXHJcbl07XHJcblNoYXBlUGFydGl0aW9uLkxJTUlURURfOV9HQU1FX1BBUlRJVElPTlMgPSBTaGFwZVBhcnRpdGlvbi5HQU1FX1BBUlRJVElPTlMuZmlsdGVyKCBwYXJ0aXRpb24gPT4gcGFydGl0aW9uLmxlbmd0aCA8PSA5ICk7XHJcblxyXG4vLyBAcHVibGljIHtudW1iZXJ9XHJcblNoYXBlUGFydGl0aW9uLkdBTUVfUEFSVElUSU9OU19NQVhfV0lEVEggPSBNYXRoLm1heCggLi4uU2hhcGVQYXJ0aXRpb24uR0FNRV9QQVJUSVRJT05TLm1hcCggcGFydGl0aW9uID0+IHtcclxuICByZXR1cm4gcGFydGl0aW9uLm91dGxpbmVTaGFwZS5ib3VuZHMud2lkdGg7XHJcbn0gKSApO1xyXG5cclxuLy8gQHB1YmxpYyB7QXJyYXkuPFNoYXBlUGFydGl0aW9uPn1cclxuU2hhcGVQYXJ0aXRpb24uU0hBUEVfUEFSVElUSU9OUyA9IFtcclxuICAuLi5TaGFwZVBhcnRpdGlvbi5QSUVTLFxyXG4gIC4uLlNoYXBlUGFydGl0aW9uLlBPTFlHT05TLFxyXG4gIC4uLlNoYXBlUGFydGl0aW9uLkhPUklaT05UQUxfQkFSUyxcclxuICAuLi5TaGFwZVBhcnRpdGlvbi5WRVJUSUNBTF9CQVJTLFxyXG4gIC4uLlNoYXBlUGFydGl0aW9uLklOVEVSTEVBVkVEX0xTLFxyXG4gIC4uLlNoYXBlUGFydGl0aW9uLkRJQUdPTkFMX0xTLFxyXG4gIC4uLlNoYXBlUGFydGl0aW9uLlBMVVNfU0lHTlMsXHJcbiAgLi4uU2hhcGVQYXJ0aXRpb24uR1JJRFMsXHJcbiAgLi4uU2hhcGVQYXJ0aXRpb24uUFlSQU1JRFMsXHJcbiAgU2hhcGVQYXJ0aXRpb24uVEVUUklTLFxyXG4gIFNoYXBlUGFydGl0aW9uLk5JTkpBX1NUQVIsXHJcbiAgU2hhcGVQYXJ0aXRpb24uRklWRV9QT0lOVCxcclxuICBTaGFwZVBhcnRpdGlvbi5TSVhfRkxPV0VSLFxyXG4gIFNoYXBlUGFydGl0aW9uLkhFWF9SSU5HXHJcbl07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTaGFwZVBhcnRpdGlvbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBRXRELE1BQU1DLGNBQWMsQ0FBQztFQUNuQjtBQUNGO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsTUFBTSxFQUFHO0lBQ3BCO0lBQ0EsSUFBSSxDQUFDQSxNQUFNLEdBQUdBLE1BQU07O0lBRXBCO0lBQ0EsSUFBSSxDQUFDQyxNQUFNLEdBQUdELE1BQU0sQ0FBQ0MsTUFBTTs7SUFFM0I7SUFDQSxJQUFJLENBQUNDLFlBQVksR0FBR04sS0FBSyxDQUFDTyxLQUFLLENBQUVILE1BQU8s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TyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsQ0FDbkIsQ0FBQyxFQUNIQyxLQUFLLENBQUN3RCxPQUFPLENBQUUsQ0FDYixJQUFJekQsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsQ0FDbkIsQ0FBQyxFQUNIQyxLQUFLLENBQUN3RCxPQUFPLENBQUUsQ0FDYixJQUFJekQsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENB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