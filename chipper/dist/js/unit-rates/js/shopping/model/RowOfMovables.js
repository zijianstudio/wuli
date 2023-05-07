// Copyright 2017-2023, University of Colorado Boulder

/**
 * RowOfMovables manages a row of URMovables (movable model elements).
 * Used to manage the position of bags and items on the scale and shelf.
 *
 * - Each row has N cells.
 * - Cells are indexed from left to right.
 * - At most 1 movable can occupy a cell.
 * - A movable cannot occupy more than 1 cell.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import unitRates from '../../unitRates.js';
export default class RowOfMovables {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      position: new Vector2(0, 0),
      // {number} bottom center of the row
      numberOfCells: 4,
      // {number} number of cells in the row
      cellSize: new Dimension2(100, 100),
      // {number} dimensions of each cell
      cellSpacing: 0 // {number} horizontal space between cells
    }, options);

    // @public (read-only)
    this.cellSize = options.cellSize;

    // @public (read-only) bottom center of the row
    this.position = options.position;

    // @private the container's cells.
    this.cells = createCells(options.numberOfCells, options.position, options.cellSize, options.cellSpacing);

    // @public (read-only) number of movables in the row (number of occupied cells)
    this.numberOfMovablesProperty = new NumberProperty(0);
  }

  // @public
  reset() {
    // empty all cells
    this.cells.forEach(cell => {
      cell.movable = null;
    });
    this.numberOfMovablesProperty.reset();
  }

  /**
   * Gets the index of the first unoccupied cell. Cells are visited left to right.
   * @returns {number} - cell index, -1 if all cells are occupied
   * @public
   */
  getFirstUnoccupiedCell() {
    let index = -1;
    for (let i = 0; i < this.cells.length; i++) {
      if (this.isEmptyCell(i)) {
        index = i;
        break;
      }
    }
    return index;
  }

  /**
   * Gets the index of the closest unoccupied cell.
   * @param {Vector2} position
   * @returns {number} - cell index, -1 if all cells are occupied
   * @public
   */
  getClosestUnoccupiedCell(position) {
    let index = this.getFirstUnoccupiedCell();
    if (index !== -1) {
      for (let i = index + 1; i < this.cells.length; i++) {
        if (this.isEmptyCell(i)) {
          if (this.getDistanceFromCell(i, position) < this.getDistanceFromCell(index, position)) {
            index = i;
          } else {
            break;
          }
        }
      }
    }
    return index;
  }

  /**
   * Puts a movable in the specified cell.
   * The cell must be empty, and the movable cannot occupy more than 1 cell.
   * @param {URMovable} movable
   * @param {number} index - the cell index
   * @public
   */
  put(movable, index) {
    assert && assert(!this.contains(movable), `movable is already in row at index ${this.indexOf(movable)}`);
    assert && assert(this.isValidCellIndex(index), `invalid index: ${index}`);
    assert && assert(this.isEmptyCell(index), `cell is occupied: ${index}`);

    // put in cell
    this.cells[index].movable = movable;
    this.numberOfMovablesProperty.value++;

    // move immediately to cell
    movable.moveTo(this.getCellPosition(index));
  }

  /**
   * Removes a movable from the container.
   * @param {URMovable} movable
   * @public
   */
  remove(movable) {
    const index = this.indexOf(movable);
    assert && assert(this.isValidCellIndex(index), `invalid index: ${index}`);
    this.cells[index].movable = null;
    this.numberOfMovablesProperty.value--;
  }

  /**
   * Does the row contain a specified movable?
   * @param {URMovable} movable
   * @returns {boolean}
   * @public
   */
  contains(movable) {
    return this.indexOf(movable) !== -1;
  }

  /**
   * Is a cell empty?
   * @param {number} index - the cell index
   * @returns {boolean}
   * @public
   */
  isEmptyCell(index) {
    assert && assert(this.isValidCellIndex(index), `invalid index: ${index}`);
    return this.cells[index].movable === null;
  }

  /**
   * Gets the position of a cell.
   * @param {number} index - the cell index
   * @returns {Vector2}
   * @public
   */
  getCellPosition(index) {
    assert && assert(this.isValidCellIndex(index), `invalid index: ${index}`);
    return this.cells[index].position;
  }

  /**
   * Gets the number of cells in the row.
   * @returns {number}
   * @public
   */
  getNumberOfCells() {
    return this.cells.length;
  }

  /**
   * Gets the index of the cell that is occupied by a specified movable.
   * @param {URMovable} movable
   * @returns {number} -1 if the movable is not found
   * @private
   */
  indexOf(movable) {
    let index = -1;
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i].movable === movable) {
        index = i;
        break;
      }
    }
    return index;
  }

  /**
   * Gets the distance between a cell and a position.
   * @param {number} index - the cell index
   * @param {Vector2} position
   * @returns {number}
   * @private
   */
  getDistanceFromCell(index, position) {
    assert && assert(this.isValidCellIndex(index), `invalid index: ${index}`);
    return this.getCellPosition(index).distance(position);
  }

  /**
   * Is the cell index valid?
   * @param {number} index - the cell index
   * @returns {boolean}
   * @private
   */
  isValidCellIndex(index) {
    return typeof index === 'number' && !isNaN(index) && index >= 0 && index < this.cells.length;
  }

  /**
   * For use only by debug code in RowOfMovablesNode.
   * @returns {*[]}
   * @private
   */
  getCells() {
    return this.cells;
  }
}

/**
 * Creates a row of empty cells.
 * @param {number} numberOfCells
 * @param {Vector2} position - bottom center of the row
 * @param {Dimension2} cellSize
 * @param {number} cellSpacing
 * @returns {{movable:URMovable|null, position:Vector2}[]}
 */
function createCells(numberOfCells, position, cellSize, cellSpacing) {
  // distance between the centers of adjacent cells
  const deltaX = cellSize.width + cellSpacing;

  // distance between the centers of the left-most and right-most cells
  const leftToRightDistance = deltaX * (numberOfCells - 1);

  // center of the first (left-most) cell
  const firstCenterX = position.x - leftToRightDistance / 2;

  // Each cell contains a data structure with this format:
  // {URMovable|null} movable - the movable that occupies the cell, null if the cell is empty
  // {Vector} position - bottom center of the cell
  const cells = [];
  for (let i = 0; i < numberOfCells; i++) {
    cells.push({
      movable: null,
      position: new Vector2(firstCenterX + i * deltaX, position.y)
    });
  }
  return cells;
}
unitRates.register('RowOfMovables', RowOfMovables);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJWZWN0b3IyIiwibWVyZ2UiLCJ1bml0UmF0ZXMiLCJSb3dPZk1vdmFibGVzIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwicG9zaXRpb24iLCJudW1iZXJPZkNlbGxzIiwiY2VsbFNpemUiLCJjZWxsU3BhY2luZyIsImNlbGxzIiwiY3JlYXRlQ2VsbHMiLCJudW1iZXJPZk1vdmFibGVzUHJvcGVydHkiLCJyZXNldCIsImZvckVhY2giLCJjZWxsIiwibW92YWJsZSIsImdldEZpcnN0VW5vY2N1cGllZENlbGwiLCJpbmRleCIsImkiLCJsZW5ndGgiLCJpc0VtcHR5Q2VsbCIsImdldENsb3Nlc3RVbm9jY3VwaWVkQ2VsbCIsImdldERpc3RhbmNlRnJvbUNlbGwiLCJwdXQiLCJhc3NlcnQiLCJjb250YWlucyIsImluZGV4T2YiLCJpc1ZhbGlkQ2VsbEluZGV4IiwidmFsdWUiLCJtb3ZlVG8iLCJnZXRDZWxsUG9zaXRpb24iLCJyZW1vdmUiLCJnZXROdW1iZXJPZkNlbGxzIiwiZGlzdGFuY2UiLCJpc05hTiIsImdldENlbGxzIiwiZGVsdGFYIiwid2lkdGgiLCJsZWZ0VG9SaWdodERpc3RhbmNlIiwiZmlyc3RDZW50ZXJYIiwieCIsInB1c2giLCJ5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJSb3dPZk1vdmFibGVzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJvd09mTW92YWJsZXMgbWFuYWdlcyBhIHJvdyBvZiBVUk1vdmFibGVzIChtb3ZhYmxlIG1vZGVsIGVsZW1lbnRzKS5cclxuICogVXNlZCB0byBtYW5hZ2UgdGhlIHBvc2l0aW9uIG9mIGJhZ3MgYW5kIGl0ZW1zIG9uIHRoZSBzY2FsZSBhbmQgc2hlbGYuXHJcbiAqXHJcbiAqIC0gRWFjaCByb3cgaGFzIE4gY2VsbHMuXHJcbiAqIC0gQ2VsbHMgYXJlIGluZGV4ZWQgZnJvbSBsZWZ0IHRvIHJpZ2h0LlxyXG4gKiAtIEF0IG1vc3QgMSBtb3ZhYmxlIGNhbiBvY2N1cHkgYSBjZWxsLlxyXG4gKiAtIEEgbW92YWJsZSBjYW5ub3Qgb2NjdXB5IG1vcmUgdGhhbiAxIGNlbGwuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB1bml0UmF0ZXMgZnJvbSAnLi4vLi4vdW5pdFJhdGVzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvd09mTW92YWJsZXMge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHBvc2l0aW9uOiBuZXcgVmVjdG9yMiggMCwgMCApLCAvLyB7bnVtYmVyfSBib3R0b20gY2VudGVyIG9mIHRoZSByb3dcclxuICAgICAgbnVtYmVyT2ZDZWxsczogNCwgLy8ge251bWJlcn0gbnVtYmVyIG9mIGNlbGxzIGluIHRoZSByb3dcclxuICAgICAgY2VsbFNpemU6IG5ldyBEaW1lbnNpb24yKCAxMDAsIDEwMCApLCAvLyB7bnVtYmVyfSBkaW1lbnNpb25zIG9mIGVhY2ggY2VsbFxyXG4gICAgICBjZWxsU3BhY2luZzogMCAvLyB7bnVtYmVyfSBob3Jpem9udGFsIHNwYWNlIGJldHdlZW4gY2VsbHNcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpXHJcbiAgICB0aGlzLmNlbGxTaXplID0gb3B0aW9ucy5jZWxsU2l6ZTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIGJvdHRvbSBjZW50ZXIgb2YgdGhlIHJvd1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG9wdGlvbnMucG9zaXRpb247XHJcblxyXG4gICAgLy8gQHByaXZhdGUgdGhlIGNvbnRhaW5lcidzIGNlbGxzLlxyXG4gICAgdGhpcy5jZWxscyA9IGNyZWF0ZUNlbGxzKCBvcHRpb25zLm51bWJlck9mQ2VsbHMsIG9wdGlvbnMucG9zaXRpb24sIG9wdGlvbnMuY2VsbFNpemUsIG9wdGlvbnMuY2VsbFNwYWNpbmcgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIG51bWJlciBvZiBtb3ZhYmxlcyBpbiB0aGUgcm93IChudW1iZXIgb2Ygb2NjdXBpZWQgY2VsbHMpXHJcbiAgICB0aGlzLm51bWJlck9mTW92YWJsZXNQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHJlc2V0KCkge1xyXG5cclxuICAgIC8vIGVtcHR5IGFsbCBjZWxsc1xyXG4gICAgdGhpcy5jZWxscy5mb3JFYWNoKCBjZWxsID0+IHtcclxuICAgICAgY2VsbC5tb3ZhYmxlID0gbnVsbDtcclxuICAgIH0gKTtcclxuICAgIHRoaXMubnVtYmVyT2ZNb3ZhYmxlc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgdW5vY2N1cGllZCBjZWxsLiBDZWxscyBhcmUgdmlzaXRlZCBsZWZ0IHRvIHJpZ2h0LlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gY2VsbCBpbmRleCwgLTEgaWYgYWxsIGNlbGxzIGFyZSBvY2N1cGllZFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRGaXJzdFVub2NjdXBpZWRDZWxsKCkge1xyXG4gICAgbGV0IGluZGV4ID0gLTE7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNlbGxzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIHRoaXMuaXNFbXB0eUNlbGwoIGkgKSApIHtcclxuICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBpbmRleDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGluZGV4IG9mIHRoZSBjbG9zZXN0IHVub2NjdXBpZWQgY2VsbC5cclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXHJcbiAgICogQHJldHVybnMge251bWJlcn0gLSBjZWxsIGluZGV4LCAtMSBpZiBhbGwgY2VsbHMgYXJlIG9jY3VwaWVkXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldENsb3Nlc3RVbm9jY3VwaWVkQ2VsbCggcG9zaXRpb24gKSB7XHJcbiAgICBsZXQgaW5kZXggPSB0aGlzLmdldEZpcnN0VW5vY2N1cGllZENlbGwoKTtcclxuICAgIGlmICggaW5kZXggIT09IC0xICkge1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IGluZGV4ICsgMTsgaSA8IHRoaXMuY2VsbHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgaWYgKCB0aGlzLmlzRW1wdHlDZWxsKCBpICkgKSB7XHJcbiAgICAgICAgICBpZiAoIHRoaXMuZ2V0RGlzdGFuY2VGcm9tQ2VsbCggaSwgcG9zaXRpb24gKSA8IHRoaXMuZ2V0RGlzdGFuY2VGcm9tQ2VsbCggaW5kZXgsIHBvc2l0aW9uICkgKSB7XHJcbiAgICAgICAgICAgIGluZGV4ID0gaTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBpbmRleDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFB1dHMgYSBtb3ZhYmxlIGluIHRoZSBzcGVjaWZpZWQgY2VsbC5cclxuICAgKiBUaGUgY2VsbCBtdXN0IGJlIGVtcHR5LCBhbmQgdGhlIG1vdmFibGUgY2Fubm90IG9jY3VweSBtb3JlIHRoYW4gMSBjZWxsLlxyXG4gICAqIEBwYXJhbSB7VVJNb3ZhYmxlfSBtb3ZhYmxlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gdGhlIGNlbGwgaW5kZXhcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcHV0KCBtb3ZhYmxlLCBpbmRleCApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5jb250YWlucyggbW92YWJsZSApLFxyXG4gICAgICBgbW92YWJsZSBpcyBhbHJlYWR5IGluIHJvdyBhdCBpbmRleCAke3RoaXMuaW5kZXhPZiggbW92YWJsZSApfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNWYWxpZENlbGxJbmRleCggaW5kZXggKSwgYGludmFsaWQgaW5kZXg6ICR7aW5kZXh9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0VtcHR5Q2VsbCggaW5kZXggKSwgYGNlbGwgaXMgb2NjdXBpZWQ6ICR7aW5kZXh9YCApO1xyXG5cclxuICAgIC8vIHB1dCBpbiBjZWxsXHJcbiAgICB0aGlzLmNlbGxzWyBpbmRleCBdLm1vdmFibGUgPSBtb3ZhYmxlO1xyXG4gICAgdGhpcy5udW1iZXJPZk1vdmFibGVzUHJvcGVydHkudmFsdWUrKztcclxuXHJcbiAgICAvLyBtb3ZlIGltbWVkaWF0ZWx5IHRvIGNlbGxcclxuICAgIG1vdmFibGUubW92ZVRvKCB0aGlzLmdldENlbGxQb3NpdGlvbiggaW5kZXggKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhIG1vdmFibGUgZnJvbSB0aGUgY29udGFpbmVyLlxyXG4gICAqIEBwYXJhbSB7VVJNb3ZhYmxlfSBtb3ZhYmxlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlbW92ZSggbW92YWJsZSApIHtcclxuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5pbmRleE9mKCBtb3ZhYmxlICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzVmFsaWRDZWxsSW5kZXgoIGluZGV4ICksIGBpbnZhbGlkIGluZGV4OiAke2luZGV4fWAgKTtcclxuICAgIHRoaXMuY2VsbHNbIGluZGV4IF0ubW92YWJsZSA9IG51bGw7XHJcbiAgICB0aGlzLm51bWJlck9mTW92YWJsZXNQcm9wZXJ0eS52YWx1ZS0tO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRG9lcyB0aGUgcm93IGNvbnRhaW4gYSBzcGVjaWZpZWQgbW92YWJsZT9cclxuICAgKiBAcGFyYW0ge1VSTW92YWJsZX0gbW92YWJsZVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjb250YWlucyggbW92YWJsZSApIHtcclxuICAgIHJldHVybiAoIHRoaXMuaW5kZXhPZiggbW92YWJsZSApICE9PSAtMSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSXMgYSBjZWxsIGVtcHR5P1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIHRoZSBjZWxsIGluZGV4XHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGlzRW1wdHlDZWxsKCBpbmRleCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNWYWxpZENlbGxJbmRleCggaW5kZXggKSwgYGludmFsaWQgaW5kZXg6ICR7aW5kZXh9YCApO1xyXG4gICAgcmV0dXJuICggdGhpcy5jZWxsc1sgaW5kZXggXS5tb3ZhYmxlID09PSBudWxsICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBwb3NpdGlvbiBvZiBhIGNlbGwuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gdGhlIGNlbGwgaW5kZXhcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0Q2VsbFBvc2l0aW9uKCBpbmRleCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNWYWxpZENlbGxJbmRleCggaW5kZXggKSwgYGludmFsaWQgaW5kZXg6ICR7aW5kZXh9YCApO1xyXG4gICAgcmV0dXJuIHRoaXMuY2VsbHNbIGluZGV4IF0ucG9zaXRpb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgY2VsbHMgaW4gdGhlIHJvdy5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXROdW1iZXJPZkNlbGxzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY2VsbHMubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgaW5kZXggb2YgdGhlIGNlbGwgdGhhdCBpcyBvY2N1cGllZCBieSBhIHNwZWNpZmllZCBtb3ZhYmxlLlxyXG4gICAqIEBwYXJhbSB7VVJNb3ZhYmxlfSBtb3ZhYmxlXHJcbiAgICogQHJldHVybnMge251bWJlcn0gLTEgaWYgdGhlIG1vdmFibGUgaXMgbm90IGZvdW5kXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBpbmRleE9mKCBtb3ZhYmxlICkge1xyXG4gICAgbGV0IGluZGV4ID0gLTE7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNlbGxzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIHRoaXMuY2VsbHNbIGkgXS5tb3ZhYmxlID09PSBtb3ZhYmxlICkge1xyXG4gICAgICAgIGluZGV4ID0gaTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGluZGV4O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgZGlzdGFuY2UgYmV0d2VlbiBhIGNlbGwgYW5kIGEgcG9zaXRpb24uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gdGhlIGNlbGwgaW5kZXhcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldERpc3RhbmNlRnJvbUNlbGwoIGluZGV4LCBwb3NpdGlvbiApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNWYWxpZENlbGxJbmRleCggaW5kZXggKSwgYGludmFsaWQgaW5kZXg6ICR7aW5kZXh9YCApO1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2VsbFBvc2l0aW9uKCBpbmRleCApLmRpc3RhbmNlKCBwb3NpdGlvbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSXMgdGhlIGNlbGwgaW5kZXggdmFsaWQ/XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gdGhlIGNlbGwgaW5kZXhcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGlzVmFsaWRDZWxsSW5kZXgoIGluZGV4ICkge1xyXG4gICAgcmV0dXJuICggKCB0eXBlb2YgaW5kZXggPT09ICdudW1iZXInICkgJiYgIWlzTmFOKCBpbmRleCApICYmIGluZGV4ID49IDAgJiYgaW5kZXggPCB0aGlzLmNlbGxzLmxlbmd0aCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRm9yIHVzZSBvbmx5IGJ5IGRlYnVnIGNvZGUgaW4gUm93T2ZNb3ZhYmxlc05vZGUuXHJcbiAgICogQHJldHVybnMgeypbXX1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldENlbGxzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY2VsbHM7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIHJvdyBvZiBlbXB0eSBjZWxscy5cclxuICogQHBhcmFtIHtudW1iZXJ9IG51bWJlck9mQ2VsbHNcclxuICogQHBhcmFtIHtWZWN0b3IyfSBwb3NpdGlvbiAtIGJvdHRvbSBjZW50ZXIgb2YgdGhlIHJvd1xyXG4gKiBAcGFyYW0ge0RpbWVuc2lvbjJ9IGNlbGxTaXplXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBjZWxsU3BhY2luZ1xyXG4gKiBAcmV0dXJucyB7e21vdmFibGU6VVJNb3ZhYmxlfG51bGwsIHBvc2l0aW9uOlZlY3RvcjJ9W119XHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVDZWxscyggbnVtYmVyT2ZDZWxscywgcG9zaXRpb24sIGNlbGxTaXplLCBjZWxsU3BhY2luZyApIHtcclxuXHJcbiAgLy8gZGlzdGFuY2UgYmV0d2VlbiB0aGUgY2VudGVycyBvZiBhZGphY2VudCBjZWxsc1xyXG4gIGNvbnN0IGRlbHRhWCA9IGNlbGxTaXplLndpZHRoICsgY2VsbFNwYWNpbmc7XHJcblxyXG4gIC8vIGRpc3RhbmNlIGJldHdlZW4gdGhlIGNlbnRlcnMgb2YgdGhlIGxlZnQtbW9zdCBhbmQgcmlnaHQtbW9zdCBjZWxsc1xyXG4gIGNvbnN0IGxlZnRUb1JpZ2h0RGlzdGFuY2UgPSBkZWx0YVggKiAoIG51bWJlck9mQ2VsbHMgLSAxICk7XHJcblxyXG4gIC8vIGNlbnRlciBvZiB0aGUgZmlyc3QgKGxlZnQtbW9zdCkgY2VsbFxyXG4gIGNvbnN0IGZpcnN0Q2VudGVyWCA9IHBvc2l0aW9uLnggLSAoIGxlZnRUb1JpZ2h0RGlzdGFuY2UgLyAyICk7XHJcblxyXG4gIC8vIEVhY2ggY2VsbCBjb250YWlucyBhIGRhdGEgc3RydWN0dXJlIHdpdGggdGhpcyBmb3JtYXQ6XHJcbiAgLy8ge1VSTW92YWJsZXxudWxsfSBtb3ZhYmxlIC0gdGhlIG1vdmFibGUgdGhhdCBvY2N1cGllcyB0aGUgY2VsbCwgbnVsbCBpZiB0aGUgY2VsbCBpcyBlbXB0eVxyXG4gIC8vIHtWZWN0b3J9IHBvc2l0aW9uIC0gYm90dG9tIGNlbnRlciBvZiB0aGUgY2VsbFxyXG4gIGNvbnN0IGNlbGxzID0gW107XHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZDZWxsczsgaSsrICkge1xyXG4gICAgY2VsbHMucHVzaCgge1xyXG4gICAgICBtb3ZhYmxlOiBudWxsLFxyXG4gICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIGZpcnN0Q2VudGVyWCArICggaSAqIGRlbHRhWCApLCBwb3NpdGlvbi55IClcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBjZWxscztcclxufVxyXG5cclxudW5pdFJhdGVzLnJlZ2lzdGVyKCAnUm93T2ZNb3ZhYmxlcycsIFJvd09mTW92YWJsZXMgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxTQUFTLE1BQU0sb0JBQW9CO0FBRTFDLGVBQWUsTUFBTUMsYUFBYSxDQUFDO0VBRWpDO0FBQ0Y7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxPQUFPLEVBQUc7SUFFckJBLE9BQU8sR0FBR0osS0FBSyxDQUFFO01BQ2ZLLFFBQVEsRUFBRSxJQUFJTixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztNQUFFO01BQy9CTyxhQUFhLEVBQUUsQ0FBQztNQUFFO01BQ2xCQyxRQUFRLEVBQUUsSUFBSVQsVUFBVSxDQUFFLEdBQUcsRUFBRSxHQUFJLENBQUM7TUFBRTtNQUN0Q1UsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUNqQixDQUFDLEVBQUVKLE9BQVEsQ0FBQzs7SUFFWjtJQUNB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