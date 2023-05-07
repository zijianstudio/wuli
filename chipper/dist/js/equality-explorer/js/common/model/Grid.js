// Copyright 2017-2022, University of Colorado Boulder

/**
 * 2D grid on a plate on the balance scale.
 *
 * A grid contains terms. The grid is filled from the bottom up, so that there are no empty cells
 * below an occupied cell. Origin is at the bottom center of the grid.
 *
 * A cell in the grid is identified by an integer index. This index acts as an opaque identifier for the cell.
 * The client doesn't need to know how to interpret this identifier. It gets a cell identifier from the grid,
 * and uses the identifier to refer to the cell. Using an integer index has a couple of advantages: fast lookup
 * of terms in the grid, and low memory footprint. The main disadvantage is the need to map between (row,column)
 * and index, but that need is totally internal to Grid.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import equalityExplorer from '../../equalityExplorer.js';
import optionize from '../../../../phet-core/js/optionize.js';
// constants
const NO_TERM = null; // occupies all empty cells in the grid

export default class Grid {
  // see documentation below

  /**
   * @param positionProperty
   * @param debugSide - which side of the scale, for debugging
   * @param [providedOptions]
   */
  constructor(positionProperty, debugSide, providedOptions) {
    const options = optionize()({
      // SelfOptions
      rows: 10,
      columns: 10,
      cellWidth: 5,
      cellHeight: 5
    }, providedOptions);
    this.rows = options.rows;
    this.columns = options.columns;
    this.cellWidth = options.cellWidth;
    this.cellHeight = options.cellHeight;
    this.positionProperty = positionProperty;
    this.debugSide = debugSide;

    // The 2D grid is stored as a 1D array, in row-major order (left-to-right, top-to-bottom).
    // Each entry in this array is a cell in the grid.  Empty cells contain NO_TERM.
    // Storing as a 1D array makes it easy for snapshots to save/restore the position of terms in the grid.
    // See rowColumnToCell, cellToRow, cellToColumn for mapping between index and (row,column).
    this.cells = [];
    const numberOfCells = options.rows * options.columns;
    for (let i = 0; i < numberOfCells; i++) {
      this.cells[i] = NO_TERM;
    }

    // bounds of the grid, initialized in positionProperty listener
    this.bounds = new Bounds2(0, 1, 0, 1);

    // When the grid moves ... unlink not required.
    this.positionProperty.link(position => {
      // recompute the grid's bounds, origin (x,y) is at bottom center
      this.bounds.setMinMax(position.x - this.columns * this.cellWidth / 2,
      // minX
      position.y - this.rows * this.cellHeight,
      // minY
      position.x + this.columns * this.cellWidth / 2,
      // maxX
      position.y // maxY
      );

      // move the terms
      for (let i = 0; i < this.cells.length; i++) {
        const cell = this.cells[i];
        if (cell !== NO_TERM) {
          cell.moveTo(this.getPositionOfCell(i));
        }
      }
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }

  /**
   * Gets the y coordinate of the top of the grid.
   */
  get top() {
    return this.positionProperty.value.y - this.rows * this.cellHeight;
  }

  /**
   * Is the grid full? That is, are all cells occupied?
   */
  isFull() {
    return !this.cells.includes(NO_TERM);
  }

  /**
   * Is the specified cell empty?
   */
  isEmptyCell(cell) {
    assert && assert(this.isValidCell(cell), `invalid cell: ${cell}`);
    return this.getTermInCell(cell) === NO_TERM;
  }

  /**
   * Clears the specified cell
   */
  clearCell(cell) {
    assert && assert(this.isValidCell(cell), `invalid v: ${cell}`);
    this.cells[cell] = NO_TERM;
  }

  /**
   * Clears all cells.
   */
  clearAllCells() {
    for (let i = 0; i < this.cells.length; i++) {
      this.clearCell(i);
    }
  }

  /**
   * Clears the specified column. Used by compactColumn.
   */
  clearColumn(column) {
    assert && assert(column >= 0 && column < this.columns, `invalid column: ${column}`);
    for (let row = 0; row < this.rows; row++) {
      this.clearCell(this.rowColumnToCell(row, column));
    }
  }

  /**
   * Gets the cell that corresponds to a position.
   * @param position
   * @returns the cell identifier, null if the position is outside the grid
   */
  getCellAtPosition(position) {
    let cell = null;
    if (this.containsPosition(position)) {
      // row and column of the cell that contains position
      // Math.min handles the case where position is exactly on bounds.maxX or maxY.
      // See https://github.com/phetsims/equality-explorer/issues/#39.
      const row = Math.min(this.rows - 1, Math.floor((position.y - this.bounds.minY) / this.cellHeight));
      const column = Math.min(this.columns - 1, Math.floor((position.x - this.bounds.minX) / this.cellWidth));
      cell = this.rowColumnToCell(row, column);
    }
    return cell;
  }

  /**
   * Is the specified position inside the grid?
   * This needs to be fast, since it's called during a drag cycle.
   */
  containsPosition(position) {
    return this.bounds.containsPoint(position);
  }

  /**
   * Gets the cell that a term occupies.
   * @param term
   * @returns the cell's identifier, null if the term doesn't occupy a cell
   */
  getCellForTerm(term) {
    const index = this.cells.indexOf(term);
    return index === -1 ? null : index;
  }

  /**
   * Gets the term that occupies a specified cell.
   * @param cell
   * @returns null if the cell is empty
   */
  getTermInCell(cell) {
    assert && assert(this.isValidCell(cell), `invalid cell: ${cell}`);
    return this.cells[cell];
  }

  /**
   * Gets the term at a specified position in the grid.
   * @param position
   * @returns null if position is outside the grid, or the cell at position is empty
   */
  getTermAtPosition(position) {
    let term = null;
    const cell = this.getCellAtPosition(position);
    if (cell !== null) {
      term = this.getTermInCell(cell);
    }
    return term;
  }

  /**
   * Gets an equivalent term from the grid that is closest to a specified cell.
   */
  getClosestEquivalentTerm(term, cell) {
    assert && assert(this.isValidCell(cell), `invalid cell: ${cell}`);
    const cellPosition = this.getPositionOfCell(cell);
    let equivalentTerm = null;
    let distance = null;

    // This is brute force, but straightforward, and not a performance issue because the number of cells is small.
    for (let i = 0; i < this.cells.length; i++) {
      const currentTerm = this.cells[i];
      if (currentTerm !== NO_TERM && term.isEquivalentTerm(currentTerm)) {
        const currentDistance = this.getPositionOfCell(i).distance(cellPosition);
        if (equivalentTerm === null || distance === null || currentDistance < distance) {
          equivalentTerm = currentTerm;
          distance = currentDistance;
        }
      }
    }
    return equivalentTerm;
  }

  /**
   * Puts a term in the specified cell. The cell must be empty.
   */
  putTerm(term, cell) {
    assert && assert(this.isValidCell(cell), `invalid cell: ${cell}`);
    assert && assert(this.isEmptyCell(cell), `cell is occupied, cell: ${cell}`);
    this.cells[cell] = term;
    term.moveTo(this.getPositionOfCell(cell));
  }

  /**
   * Removes a term from the grid. Any terms above it move down to fill the empty cell.
   * @param term
   * @returns the cell that the term was removed from
   */
  removeTerm(term) {
    const cell = this.getCellForTerm(term);
    assert && assert(cell !== null, `term not found: ${term}`);
    this.clearCell(cell);
    this.compactColumn(this.cellToColumn(cell));
    return cell;
  }

  /**
   * Compacts a column so that it contains no empty cells below terms.
   * If the column contains no holes, then the grid in not modified.
   */
  compactColumn(column) {
    assert && assert(column >= 0 && column < this.columns, `invalid column: ${column}`);
    let hasHoles = false; // does the column have one or more holes?
    const terms = []; // terms in the column

    let term; // the current term
    let cell; // the current cell identifier

    // Get all terms in the column, from top down
    for (let row = 0; row < this.rows; row++) {
      cell = this.rowColumnToCell(row, column);
      term = this.getTermInCell(cell);
      if (term) {
        terms.push(term);
      } else if (terms.length > 0) {
        hasHoles = true;
      }
    }

    // If the column has holes ...
    if (hasHoles) {
      phet.log && phet.log(`Grid: compacting holes identified in column ${column}`);

      // clear the column
      this.clearColumn(column);

      // Put terms back into the column, from bottom up.
      let row = this.rows - 1;
      for (let i = terms.length - 1; i >= 0; i--) {
        term = terms[i];
        cell = this.rowColumnToCell(row--, column);
        this.cells[cell] = term;
        term.moveTo(this.getPositionOfCell(cell));
      }
    }
  }

  /**
   * Gets the position of a specific cell. A cell's position is in the center of the cell.
   */
  getPositionOfCell(cell) {
    assert && assert(this.isValidCell(cell), `invalid cell: ${cell}`);
    const row = this.cellToRow(cell);
    const column = this.cellToColumn(cell);
    const x = this.bounds.minX + column * this.cellWidth + 0.5 * this.cellWidth;
    const y = this.bounds.minY + row * this.cellHeight + 0.5 * this.cellHeight;
    return new Vector2(x, y);
  }

  /**
   * Finds the last empty cell in the array.
   * @returns the cell's identifier, null if the grid is full
   */
  getLastEmptyCell() {
    const index = this.cells.lastIndexOf(NO_TERM);
    return index === -1 ? null : index;
  }

  /**
   * Gets the empty cell that would be the best fit for adding a term to the grid.
   * Start by identifying the closest empty cell.  If that cell is in a column with empty cells below it,
   * choose the empty cell that is closest to the bottom of the grid in that column.
   */
  getBestEmptyCell(position) {
    // Start with the last empty cell in the array
    let closestCell = this.getLastEmptyCell();

    // Careful! closestCell is {number|null}, and might be 0
    // If the grid is not full...
    if (closestCell !== null) {
      let closestDistance = this.getPositionOfCell(closestCell).distance(position);

      // Find the closest cell based on distance, working backwards from lastEmptyCell.
      // This is brute force, but straightforward, and not a performance issue because the number of cells is small.
      for (let i = closestCell - 1; i >= 0; i--) {
        if (this.isEmptyCell(i)) {
          const distance = this.getPositionOfCell(i).distance(position);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestCell = i;
          }
        }
      }

      // Now look below the closest cell to see if there are any empty cells in the same column.
      // This makes terms "fall" to the cell that is closest to the bottom of the grid.
      const closestRow = this.cellToRow(closestCell);
      const closestColumn = this.cellToColumn(closestCell);
      for (let row = this.rows - 1; row > closestRow; row--) {
        const cellBelow = this.rowColumnToCell(row, closestColumn);
        if (this.isEmptyCell(cellBelow)) {
          closestCell = cellBelow;
          break;
        }
      }
    }
    return closestCell;
  }

  /**
   * Is the specified cell identifier valid?
   */
  isValidCell(cell) {
    return Number.isInteger(cell) && cell >= 0 && cell < this.cells.length;
  }

  /**
   * Converts a cell identifier to a row number.
   */
  cellToRow(cell) {
    assert && assert(this.isValidCell(cell), `invalid cell: ${cell}`);
    const row = Math.ceil((cell + 1) / this.columns) - 1;
    assert && assert(row >= 0 && row < this.rows);
    return row;
  }

  /**
   * Converts a cell identifier to a column number.
   */
  cellToColumn(cell) {
    assert && assert(this.isValidCell(cell), `invalid cell: ${cell}`);
    const column = cell % this.columns;
    assert && assert(column >= 0 && column < this.columns);
    return column;
  }

  /**
   * Converts row and column to a cell identifier.
   */
  rowColumnToCell(row, column) {
    assert && assert(row >= 0 && row < this.rows, `row out of range: ${row}`);
    assert && assert(column >= 0 && column < this.columns, `column out of range: ${column}`);
    const cell = row * this.columns + column;
    assert && assert(this.isValidCell(cell), `invalid cell: ${cell}`);
    return cell;
  }
}
equalityExplorer.register('Grid', Grid);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVmVjdG9yMiIsImVxdWFsaXR5RXhwbG9yZXIiLCJvcHRpb25pemUiLCJOT19URVJNIiwiR3JpZCIsImNvbnN0cnVjdG9yIiwicG9zaXRpb25Qcm9wZXJ0eSIsImRlYnVnU2lkZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJyb3dzIiwiY29sdW1ucyIsImNlbGxXaWR0aCIsImNlbGxIZWlnaHQiLCJjZWxscyIsIm51bWJlck9mQ2VsbHMiLCJpIiwiYm91bmRzIiwibGluayIsInBvc2l0aW9uIiwic2V0TWluTWF4IiwieCIsInkiLCJsZW5ndGgiLCJjZWxsIiwibW92ZVRvIiwiZ2V0UG9zaXRpb25PZkNlbGwiLCJkaXNwb3NlIiwiYXNzZXJ0IiwidG9wIiwidmFsdWUiLCJpc0Z1bGwiLCJpbmNsdWRlcyIsImlzRW1wdHlDZWxsIiwiaXNWYWxpZENlbGwiLCJnZXRUZXJtSW5DZWxsIiwiY2xlYXJDZWxsIiwiY2xlYXJBbGxDZWxscyIsImNsZWFyQ29sdW1uIiwiY29sdW1uIiwicm93Iiwicm93Q29sdW1uVG9DZWxsIiwiZ2V0Q2VsbEF0UG9zaXRpb24iLCJjb250YWluc1Bvc2l0aW9uIiwiTWF0aCIsIm1pbiIsImZsb29yIiwibWluWSIsIm1pblgiLCJjb250YWluc1BvaW50IiwiZ2V0Q2VsbEZvclRlcm0iLCJ0ZXJtIiwiaW5kZXgiLCJpbmRleE9mIiwiZ2V0VGVybUF0UG9zaXRpb24iLCJnZXRDbG9zZXN0RXF1aXZhbGVudFRlcm0iLCJjZWxsUG9zaXRpb24iLCJlcXVpdmFsZW50VGVybSIsImRpc3RhbmNlIiwiY3VycmVudFRlcm0iLCJpc0VxdWl2YWxlbnRUZXJtIiwiY3VycmVudERpc3RhbmNlIiwicHV0VGVybSIsInJlbW92ZVRlcm0iLCJjb21wYWN0Q29sdW1uIiwiY2VsbFRvQ29sdW1uIiwiaGFzSG9sZXMiLCJ0ZXJtcyIsInB1c2giLCJwaGV0IiwibG9nIiwiY2VsbFRvUm93IiwiZ2V0TGFzdEVtcHR5Q2VsbCIsImxhc3RJbmRleE9mIiwiZ2V0QmVzdEVtcHR5Q2VsbCIsImNsb3Nlc3RDZWxsIiwiY2xvc2VzdERpc3RhbmNlIiwiY2xvc2VzdFJvdyIsImNsb3Nlc3RDb2x1bW4iLCJjZWxsQmVsb3ciLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJjZWlsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHcmlkLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIDJEIGdyaWQgb24gYSBwbGF0ZSBvbiB0aGUgYmFsYW5jZSBzY2FsZS5cclxuICpcclxuICogQSBncmlkIGNvbnRhaW5zIHRlcm1zLiBUaGUgZ3JpZCBpcyBmaWxsZWQgZnJvbSB0aGUgYm90dG9tIHVwLCBzbyB0aGF0IHRoZXJlIGFyZSBubyBlbXB0eSBjZWxsc1xyXG4gKiBiZWxvdyBhbiBvY2N1cGllZCBjZWxsLiBPcmlnaW4gaXMgYXQgdGhlIGJvdHRvbSBjZW50ZXIgb2YgdGhlIGdyaWQuXHJcbiAqXHJcbiAqIEEgY2VsbCBpbiB0aGUgZ3JpZCBpcyBpZGVudGlmaWVkIGJ5IGFuIGludGVnZXIgaW5kZXguIFRoaXMgaW5kZXggYWN0cyBhcyBhbiBvcGFxdWUgaWRlbnRpZmllciBmb3IgdGhlIGNlbGwuXHJcbiAqIFRoZSBjbGllbnQgZG9lc24ndCBuZWVkIHRvIGtub3cgaG93IHRvIGludGVycHJldCB0aGlzIGlkZW50aWZpZXIuIEl0IGdldHMgYSBjZWxsIGlkZW50aWZpZXIgZnJvbSB0aGUgZ3JpZCxcclxuICogYW5kIHVzZXMgdGhlIGlkZW50aWZpZXIgdG8gcmVmZXIgdG8gdGhlIGNlbGwuIFVzaW5nIGFuIGludGVnZXIgaW5kZXggaGFzIGEgY291cGxlIG9mIGFkdmFudGFnZXM6IGZhc3QgbG9va3VwXHJcbiAqIG9mIHRlcm1zIGluIHRoZSBncmlkLCBhbmQgbG93IG1lbW9yeSBmb290cHJpbnQuIFRoZSBtYWluIGRpc2FkdmFudGFnZSBpcyB0aGUgbmVlZCB0byBtYXAgYmV0d2VlbiAocm93LGNvbHVtbilcclxuICogYW5kIGluZGV4LCBidXQgdGhhdCBuZWVkIGlzIHRvdGFsbHkgaW50ZXJuYWwgdG8gR3JpZC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IGVxdWFsaXR5RXhwbG9yZXIgZnJvbSAnLi4vLi4vZXF1YWxpdHlFeHBsb3Jlci5qcyc7XHJcbmltcG9ydCBUZXJtIGZyb20gJy4vVGVybS5qcyc7XHJcbmltcG9ydCB7IEJhbGFuY2VTY2FsZVNpZGUgfSBmcm9tICcuL0JhbGFuY2VTY2FsZS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBOT19URVJNID0gbnVsbDsgLy8gb2NjdXBpZXMgYWxsIGVtcHR5IGNlbGxzIGluIHRoZSBncmlkXHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHJvd3M/OiBudW1iZXI7XHJcbiAgY29sdW1ucz86IG51bWJlcjtcclxuICBjZWxsV2lkdGg/OiBudW1iZXI7XHJcbiAgY2VsbEhlaWdodD86IG51bWJlcjtcclxufTtcclxuXHJcbnR5cGUgR3JpZE9wdGlvbnMgPSBTZWxmT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyaWQge1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgcm93czogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBjb2x1bW5zOiBudW1iZXI7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcG9zaXRpb25Qcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8VmVjdG9yMj47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBkZWJ1Z1NpZGU6IEJhbGFuY2VTY2FsZVNpZGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjZWxsV2lkdGg6IG51bWJlcjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGNlbGxIZWlnaHQ6IG51bWJlcjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGNlbGxzOiAoIFRlcm0gfCBudWxsIClbXTsgLy8gc2VlIGRvY3VtZW50YXRpb24gYmVsb3dcclxuICBwcml2YXRlIGJvdW5kczogQm91bmRzMjtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHBvc2l0aW9uUHJvcGVydHlcclxuICAgKiBAcGFyYW0gZGVidWdTaWRlIC0gd2hpY2ggc2lkZSBvZiB0aGUgc2NhbGUsIGZvciBkZWJ1Z2dpbmdcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHBvc2l0aW9uUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFZlY3RvcjI+LCBkZWJ1Z1NpZGU6IEJhbGFuY2VTY2FsZVNpZGUsIHByb3ZpZGVkT3B0aW9ucz86IEdyaWRPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8R3JpZE9wdGlvbnMsIFNlbGZPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICByb3dzOiAxMCxcclxuICAgICAgY29sdW1uczogMTAsXHJcbiAgICAgIGNlbGxXaWR0aDogNSxcclxuICAgICAgY2VsbEhlaWdodDogNVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5yb3dzID0gb3B0aW9ucy5yb3dzO1xyXG4gICAgdGhpcy5jb2x1bW5zID0gb3B0aW9ucy5jb2x1bW5zO1xyXG4gICAgdGhpcy5jZWxsV2lkdGggPSBvcHRpb25zLmNlbGxXaWR0aDtcclxuICAgIHRoaXMuY2VsbEhlaWdodCA9IG9wdGlvbnMuY2VsbEhlaWdodDtcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eSA9IHBvc2l0aW9uUHJvcGVydHk7XHJcbiAgICB0aGlzLmRlYnVnU2lkZSA9IGRlYnVnU2lkZTtcclxuXHJcbiAgICAvLyBUaGUgMkQgZ3JpZCBpcyBzdG9yZWQgYXMgYSAxRCBhcnJheSwgaW4gcm93LW1ham9yIG9yZGVyIChsZWZ0LXRvLXJpZ2h0LCB0b3AtdG8tYm90dG9tKS5cclxuICAgIC8vIEVhY2ggZW50cnkgaW4gdGhpcyBhcnJheSBpcyBhIGNlbGwgaW4gdGhlIGdyaWQuICBFbXB0eSBjZWxscyBjb250YWluIE5PX1RFUk0uXHJcbiAgICAvLyBTdG9yaW5nIGFzIGEgMUQgYXJyYXkgbWFrZXMgaXQgZWFzeSBmb3Igc25hcHNob3RzIHRvIHNhdmUvcmVzdG9yZSB0aGUgcG9zaXRpb24gb2YgdGVybXMgaW4gdGhlIGdyaWQuXHJcbiAgICAvLyBTZWUgcm93Q29sdW1uVG9DZWxsLCBjZWxsVG9Sb3csIGNlbGxUb0NvbHVtbiBmb3IgbWFwcGluZyBiZXR3ZWVuIGluZGV4IGFuZCAocm93LGNvbHVtbikuXHJcbiAgICB0aGlzLmNlbGxzID0gW107XHJcbiAgICBjb25zdCBudW1iZXJPZkNlbGxzID0gb3B0aW9ucy5yb3dzICogb3B0aW9ucy5jb2x1bW5zO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZDZWxsczsgaSsrICkge1xyXG4gICAgICB0aGlzLmNlbGxzWyBpIF0gPSBOT19URVJNO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGJvdW5kcyBvZiB0aGUgZ3JpZCwgaW5pdGlhbGl6ZWQgaW4gcG9zaXRpb25Qcm9wZXJ0eSBsaXN0ZW5lclxyXG4gICAgdGhpcy5ib3VuZHMgPSBuZXcgQm91bmRzMiggMCwgMSwgMCwgMSApO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIGdyaWQgbW92ZXMgLi4uIHVubGluayBub3QgcmVxdWlyZWQuXHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb24gPT4ge1xyXG5cclxuICAgICAgLy8gcmVjb21wdXRlIHRoZSBncmlkJ3MgYm91bmRzLCBvcmlnaW4gKHgseSkgaXMgYXQgYm90dG9tIGNlbnRlclxyXG4gICAgICB0aGlzLmJvdW5kcy5zZXRNaW5NYXgoXHJcbiAgICAgICAgcG9zaXRpb24ueCAtICggdGhpcy5jb2x1bW5zICogdGhpcy5jZWxsV2lkdGggLyAyICksIC8vIG1pblhcclxuICAgICAgICBwb3NpdGlvbi55IC0gKCB0aGlzLnJvd3MgKiB0aGlzLmNlbGxIZWlnaHQgKSwgLy8gbWluWVxyXG4gICAgICAgIHBvc2l0aW9uLnggKyAoIHRoaXMuY29sdW1ucyAqIHRoaXMuY2VsbFdpZHRoIC8gMiApLCAvLyBtYXhYXHJcbiAgICAgICAgcG9zaXRpb24ueSAvLyBtYXhZXHJcbiAgICAgICk7XHJcblxyXG4gICAgICAvLyBtb3ZlIHRoZSB0ZXJtc1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNlbGxzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IGNlbGwgPSB0aGlzLmNlbGxzWyBpIF07XHJcbiAgICAgICAgaWYgKCBjZWxsICE9PSBOT19URVJNICkge1xyXG4gICAgICAgICAgY2VsbC5tb3ZlVG8oIHRoaXMuZ2V0UG9zaXRpb25PZkNlbGwoIGkgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHkgY29vcmRpbmF0ZSBvZiB0aGUgdG9wIG9mIHRoZSBncmlkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgdG9wKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgLSAoIHRoaXMucm93cyAqIHRoaXMuY2VsbEhlaWdodCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSXMgdGhlIGdyaWQgZnVsbD8gVGhhdCBpcywgYXJlIGFsbCBjZWxscyBvY2N1cGllZD9cclxuICAgKi9cclxuICBwdWJsaWMgaXNGdWxsKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICF0aGlzLmNlbGxzLmluY2x1ZGVzKCBOT19URVJNICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJcyB0aGUgc3BlY2lmaWVkIGNlbGwgZW1wdHk/XHJcbiAgICovXHJcbiAgcHVibGljIGlzRW1wdHlDZWxsKCBjZWxsOiBudW1iZXIgKTogYm9vbGVhbiB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzVmFsaWRDZWxsKCBjZWxsICksIGBpbnZhbGlkIGNlbGw6ICR7Y2VsbH1gICk7XHJcbiAgICByZXR1cm4gKCB0aGlzLmdldFRlcm1JbkNlbGwoIGNlbGwgKSA9PT0gTk9fVEVSTSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXJzIHRoZSBzcGVjaWZpZWQgY2VsbFxyXG4gICAqL1xyXG4gIHB1YmxpYyBjbGVhckNlbGwoIGNlbGw6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNWYWxpZENlbGwoIGNlbGwgKSwgYGludmFsaWQgdjogJHtjZWxsfWAgKTtcclxuICAgIHRoaXMuY2VsbHNbIGNlbGwgXSA9IE5PX1RFUk07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhcnMgYWxsIGNlbGxzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjbGVhckFsbENlbGxzKCk6IHZvaWQge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5jZWxscy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdGhpcy5jbGVhckNlbGwoIGkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFycyB0aGUgc3BlY2lmaWVkIGNvbHVtbi4gVXNlZCBieSBjb21wYWN0Q29sdW1uLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY2xlYXJDb2x1bW4oIGNvbHVtbjogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29sdW1uID49IDAgJiYgY29sdW1uIDwgdGhpcy5jb2x1bW5zLCBgaW52YWxpZCBjb2x1bW46ICR7Y29sdW1ufWAgKTtcclxuICAgIGZvciAoIGxldCByb3cgPSAwOyByb3cgPCB0aGlzLnJvd3M7IHJvdysrICkge1xyXG4gICAgICB0aGlzLmNsZWFyQ2VsbCggdGhpcy5yb3dDb2x1bW5Ub0NlbGwoIHJvdywgY29sdW1uICkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGNlbGwgdGhhdCBjb3JyZXNwb25kcyB0byBhIHBvc2l0aW9uLlxyXG4gICAqIEBwYXJhbSBwb3NpdGlvblxyXG4gICAqIEByZXR1cm5zIHRoZSBjZWxsIGlkZW50aWZpZXIsIG51bGwgaWYgdGhlIHBvc2l0aW9uIGlzIG91dHNpZGUgdGhlIGdyaWRcclxuICAgKi9cclxuICBwcml2YXRlIGdldENlbGxBdFBvc2l0aW9uKCBwb3NpdGlvbjogVmVjdG9yMiApOiBudW1iZXIgfCBudWxsIHtcclxuICAgIGxldCBjZWxsID0gbnVsbDtcclxuICAgIGlmICggdGhpcy5jb250YWluc1Bvc2l0aW9uKCBwb3NpdGlvbiApICkge1xyXG5cclxuICAgICAgLy8gcm93IGFuZCBjb2x1bW4gb2YgdGhlIGNlbGwgdGhhdCBjb250YWlucyBwb3NpdGlvblxyXG4gICAgICAvLyBNYXRoLm1pbiBoYW5kbGVzIHRoZSBjYXNlIHdoZXJlIHBvc2l0aW9uIGlzIGV4YWN0bHkgb24gYm91bmRzLm1heFggb3IgbWF4WS5cclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lcXVhbGl0eS1leHBsb3Jlci9pc3N1ZXMvIzM5LlxyXG4gICAgICBjb25zdCByb3cgPSBNYXRoLm1pbiggdGhpcy5yb3dzIC0gMSwgTWF0aC5mbG9vciggKCBwb3NpdGlvbi55IC0gdGhpcy5ib3VuZHMubWluWSApIC8gdGhpcy5jZWxsSGVpZ2h0ICkgKTtcclxuICAgICAgY29uc3QgY29sdW1uID0gTWF0aC5taW4oIHRoaXMuY29sdW1ucyAtIDEsIE1hdGguZmxvb3IoICggcG9zaXRpb24ueCAtIHRoaXMuYm91bmRzLm1pblggKSAvIHRoaXMuY2VsbFdpZHRoICkgKTtcclxuXHJcbiAgICAgIGNlbGwgPSB0aGlzLnJvd0NvbHVtblRvQ2VsbCggcm93LCBjb2x1bW4gKTtcclxuICAgIH1cclxuICAgIHJldHVybiBjZWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSXMgdGhlIHNwZWNpZmllZCBwb3NpdGlvbiBpbnNpZGUgdGhlIGdyaWQ/XHJcbiAgICogVGhpcyBuZWVkcyB0byBiZSBmYXN0LCBzaW5jZSBpdCdzIGNhbGxlZCBkdXJpbmcgYSBkcmFnIGN5Y2xlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY29udGFpbnNQb3NpdGlvbiggcG9zaXRpb246IFZlY3RvcjIgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5ib3VuZHMuY29udGFpbnNQb2ludCggcG9zaXRpb24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGNlbGwgdGhhdCBhIHRlcm0gb2NjdXBpZXMuXHJcbiAgICogQHBhcmFtIHRlcm1cclxuICAgKiBAcmV0dXJucyB0aGUgY2VsbCdzIGlkZW50aWZpZXIsIG51bGwgaWYgdGhlIHRlcm0gZG9lc24ndCBvY2N1cHkgYSBjZWxsXHJcbiAgICovXHJcbiAgcHVibGljIGdldENlbGxGb3JUZXJtKCB0ZXJtOiBUZXJtICk6IG51bWJlciB8IG51bGwge1xyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmNlbGxzLmluZGV4T2YoIHRlcm0gKTtcclxuICAgIHJldHVybiAoIGluZGV4ID09PSAtMSApID8gbnVsbCA6IGluZGV4O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgdGVybSB0aGF0IG9jY3VwaWVzIGEgc3BlY2lmaWVkIGNlbGwuXHJcbiAgICogQHBhcmFtIGNlbGxcclxuICAgKiBAcmV0dXJucyBudWxsIGlmIHRoZSBjZWxsIGlzIGVtcHR5XHJcbiAgICovXHJcbiAgcHVibGljIGdldFRlcm1JbkNlbGwoIGNlbGw6IG51bWJlciApOiBUZXJtIHwgbnVsbCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzVmFsaWRDZWxsKCBjZWxsICksIGBpbnZhbGlkIGNlbGw6ICR7Y2VsbH1gICk7XHJcbiAgICByZXR1cm4gdGhpcy5jZWxsc1sgY2VsbCBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgdGVybSBhdCBhIHNwZWNpZmllZCBwb3NpdGlvbiBpbiB0aGUgZ3JpZC5cclxuICAgKiBAcGFyYW0gcG9zaXRpb25cclxuICAgKiBAcmV0dXJucyBudWxsIGlmIHBvc2l0aW9uIGlzIG91dHNpZGUgdGhlIGdyaWQsIG9yIHRoZSBjZWxsIGF0IHBvc2l0aW9uIGlzIGVtcHR5XHJcbiAgICovXHJcbiAgcHVibGljIGdldFRlcm1BdFBvc2l0aW9uKCBwb3NpdGlvbjogVmVjdG9yMiApOiBUZXJtIHwgbnVsbCB7XHJcbiAgICBsZXQgdGVybSA9IG51bGw7XHJcbiAgICBjb25zdCBjZWxsID0gdGhpcy5nZXRDZWxsQXRQb3NpdGlvbiggcG9zaXRpb24gKTtcclxuICAgIGlmICggY2VsbCAhPT0gbnVsbCApIHtcclxuICAgICAgdGVybSA9IHRoaXMuZ2V0VGVybUluQ2VsbCggY2VsbCApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRlcm07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIGFuIGVxdWl2YWxlbnQgdGVybSBmcm9tIHRoZSBncmlkIHRoYXQgaXMgY2xvc2VzdCB0byBhIHNwZWNpZmllZCBjZWxsLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDbG9zZXN0RXF1aXZhbGVudFRlcm0oIHRlcm06IFRlcm0sIGNlbGw6IG51bWJlciApOiBUZXJtIHwgbnVsbCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzVmFsaWRDZWxsKCBjZWxsICksIGBpbnZhbGlkIGNlbGw6ICR7Y2VsbH1gICk7XHJcblxyXG4gICAgY29uc3QgY2VsbFBvc2l0aW9uID0gdGhpcy5nZXRQb3NpdGlvbk9mQ2VsbCggY2VsbCApO1xyXG4gICAgbGV0IGVxdWl2YWxlbnRUZXJtID0gbnVsbDtcclxuICAgIGxldCBkaXN0YW5jZSA9IG51bGw7XHJcblxyXG4gICAgLy8gVGhpcyBpcyBicnV0ZSBmb3JjZSwgYnV0IHN0cmFpZ2h0Zm9yd2FyZCwgYW5kIG5vdCBhIHBlcmZvcm1hbmNlIGlzc3VlIGJlY2F1c2UgdGhlIG51bWJlciBvZiBjZWxscyBpcyBzbWFsbC5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY2VsbHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRUZXJtID0gdGhpcy5jZWxsc1sgaSBdO1xyXG4gICAgICBpZiAoICggY3VycmVudFRlcm0gIT09IE5PX1RFUk0gKSAmJiAoIHRlcm0uaXNFcXVpdmFsZW50VGVybSggY3VycmVudFRlcm0gKSApICkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnREaXN0YW5jZSA9IHRoaXMuZ2V0UG9zaXRpb25PZkNlbGwoIGkgKS5kaXN0YW5jZSggY2VsbFBvc2l0aW9uICk7XHJcbiAgICAgICAgaWYgKCBlcXVpdmFsZW50VGVybSA9PT0gbnVsbCB8fCBkaXN0YW5jZSA9PT0gbnVsbCB8fCBjdXJyZW50RGlzdGFuY2UgPCBkaXN0YW5jZSApIHtcclxuICAgICAgICAgIGVxdWl2YWxlbnRUZXJtID0gY3VycmVudFRlcm07XHJcbiAgICAgICAgICBkaXN0YW5jZSA9IGN1cnJlbnREaXN0YW5jZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZXF1aXZhbGVudFRlcm07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQdXRzIGEgdGVybSBpbiB0aGUgc3BlY2lmaWVkIGNlbGwuIFRoZSBjZWxsIG11c3QgYmUgZW1wdHkuXHJcbiAgICovXHJcbiAgcHVibGljIHB1dFRlcm0oIHRlcm06IFRlcm0sIGNlbGw6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNWYWxpZENlbGwoIGNlbGwgKSwgYGludmFsaWQgY2VsbDogJHtjZWxsfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNFbXB0eUNlbGwoIGNlbGwgKSwgYGNlbGwgaXMgb2NjdXBpZWQsIGNlbGw6ICR7Y2VsbH1gICk7XHJcbiAgICB0aGlzLmNlbGxzWyBjZWxsIF0gPSB0ZXJtO1xyXG4gICAgdGVybS5tb3ZlVG8oIHRoaXMuZ2V0UG9zaXRpb25PZkNlbGwoIGNlbGwgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhIHRlcm0gZnJvbSB0aGUgZ3JpZC4gQW55IHRlcm1zIGFib3ZlIGl0IG1vdmUgZG93biB0byBmaWxsIHRoZSBlbXB0eSBjZWxsLlxyXG4gICAqIEBwYXJhbSB0ZXJtXHJcbiAgICogQHJldHVybnMgdGhlIGNlbGwgdGhhdCB0aGUgdGVybSB3YXMgcmVtb3ZlZCBmcm9tXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZVRlcm0oIHRlcm06IFRlcm0gKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IGNlbGwgPSB0aGlzLmdldENlbGxGb3JUZXJtKCB0ZXJtICkhO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2VsbCAhPT0gbnVsbCwgYHRlcm0gbm90IGZvdW5kOiAke3Rlcm19YCApO1xyXG4gICAgdGhpcy5jbGVhckNlbGwoIGNlbGwgKTtcclxuICAgIHRoaXMuY29tcGFjdENvbHVtbiggdGhpcy5jZWxsVG9Db2x1bW4oIGNlbGwgKSApO1xyXG4gICAgcmV0dXJuIGNlbGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wYWN0cyBhIGNvbHVtbiBzbyB0aGF0IGl0IGNvbnRhaW5zIG5vIGVtcHR5IGNlbGxzIGJlbG93IHRlcm1zLlxyXG4gICAqIElmIHRoZSBjb2x1bW4gY29udGFpbnMgbm8gaG9sZXMsIHRoZW4gdGhlIGdyaWQgaW4gbm90IG1vZGlmaWVkLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY29tcGFjdENvbHVtbiggY29sdW1uOiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb2x1bW4gPj0gMCAmJiBjb2x1bW4gPCB0aGlzLmNvbHVtbnMsIGBpbnZhbGlkIGNvbHVtbjogJHtjb2x1bW59YCApO1xyXG5cclxuICAgIGxldCBoYXNIb2xlcyA9IGZhbHNlOyAvLyBkb2VzIHRoZSBjb2x1bW4gaGF2ZSBvbmUgb3IgbW9yZSBob2xlcz9cclxuICAgIGNvbnN0IHRlcm1zID0gW107IC8vIHRlcm1zIGluIHRoZSBjb2x1bW5cclxuXHJcbiAgICBsZXQgdGVybTsgLy8gdGhlIGN1cnJlbnQgdGVybVxyXG4gICAgbGV0IGNlbGw7IC8vIHRoZSBjdXJyZW50IGNlbGwgaWRlbnRpZmllclxyXG5cclxuICAgIC8vIEdldCBhbGwgdGVybXMgaW4gdGhlIGNvbHVtbiwgZnJvbSB0b3AgZG93blxyXG4gICAgZm9yICggbGV0IHJvdyA9IDA7IHJvdyA8IHRoaXMucm93czsgcm93KysgKSB7XHJcbiAgICAgIGNlbGwgPSB0aGlzLnJvd0NvbHVtblRvQ2VsbCggcm93LCBjb2x1bW4gKTtcclxuICAgICAgdGVybSA9IHRoaXMuZ2V0VGVybUluQ2VsbCggY2VsbCApO1xyXG4gICAgICBpZiAoIHRlcm0gKSB7XHJcbiAgICAgICAgdGVybXMucHVzaCggdGVybSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0ZXJtcy5sZW5ndGggPiAwICkge1xyXG4gICAgICAgIGhhc0hvbGVzID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHRoZSBjb2x1bW4gaGFzIGhvbGVzIC4uLlxyXG4gICAgaWYgKCBoYXNIb2xlcyApIHtcclxuXHJcbiAgICAgIHBoZXQubG9nICYmIHBoZXQubG9nKCBgR3JpZDogY29tcGFjdGluZyBob2xlcyBpZGVudGlmaWVkIGluIGNvbHVtbiAke2NvbHVtbn1gICk7XHJcblxyXG4gICAgICAvLyBjbGVhciB0aGUgY29sdW1uXHJcbiAgICAgIHRoaXMuY2xlYXJDb2x1bW4oIGNvbHVtbiApO1xyXG5cclxuICAgICAgLy8gUHV0IHRlcm1zIGJhY2sgaW50byB0aGUgY29sdW1uLCBmcm9tIGJvdHRvbSB1cC5cclxuICAgICAgbGV0IHJvdyA9IHRoaXMucm93cyAtIDE7XHJcbiAgICAgIGZvciAoIGxldCBpID0gdGVybXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgICAgdGVybSA9IHRlcm1zWyBpIF07XHJcbiAgICAgICAgY2VsbCA9IHRoaXMucm93Q29sdW1uVG9DZWxsKCByb3ctLSwgY29sdW1uICk7XHJcbiAgICAgICAgdGhpcy5jZWxsc1sgY2VsbCBdID0gdGVybTtcclxuICAgICAgICB0ZXJtLm1vdmVUbyggdGhpcy5nZXRQb3NpdGlvbk9mQ2VsbCggY2VsbCApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHBvc2l0aW9uIG9mIGEgc3BlY2lmaWMgY2VsbC4gQSBjZWxsJ3MgcG9zaXRpb24gaXMgaW4gdGhlIGNlbnRlciBvZiB0aGUgY2VsbC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UG9zaXRpb25PZkNlbGwoIGNlbGw6IG51bWJlciApOiBWZWN0b3IyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNWYWxpZENlbGwoIGNlbGwgKSwgYGludmFsaWQgY2VsbDogJHtjZWxsfWAgKTtcclxuXHJcbiAgICBjb25zdCByb3cgPSB0aGlzLmNlbGxUb1JvdyggY2VsbCApO1xyXG4gICAgY29uc3QgY29sdW1uID0gdGhpcy5jZWxsVG9Db2x1bW4oIGNlbGwgKTtcclxuXHJcbiAgICBjb25zdCB4ID0gdGhpcy5ib3VuZHMubWluWCArICggY29sdW1uICogdGhpcy5jZWxsV2lkdGggKSArICggMC41ICogdGhpcy5jZWxsV2lkdGggKTtcclxuICAgIGNvbnN0IHkgPSB0aGlzLmJvdW5kcy5taW5ZICsgKCByb3cgKiB0aGlzLmNlbGxIZWlnaHQgKSArICggMC41ICogdGhpcy5jZWxsSGVpZ2h0ICk7XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIHgsIHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmRzIHRoZSBsYXN0IGVtcHR5IGNlbGwgaW4gdGhlIGFycmF5LlxyXG4gICAqIEByZXR1cm5zIHRoZSBjZWxsJ3MgaWRlbnRpZmllciwgbnVsbCBpZiB0aGUgZ3JpZCBpcyBmdWxsXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRMYXN0RW1wdHlDZWxsKCk6IG51bWJlciB8IG51bGwge1xyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmNlbGxzLmxhc3RJbmRleE9mKCBOT19URVJNICk7XHJcbiAgICByZXR1cm4gKCBpbmRleCA9PT0gLTEgKSA/IG51bGwgOiBpbmRleDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGVtcHR5IGNlbGwgdGhhdCB3b3VsZCBiZSB0aGUgYmVzdCBmaXQgZm9yIGFkZGluZyBhIHRlcm0gdG8gdGhlIGdyaWQuXHJcbiAgICogU3RhcnQgYnkgaWRlbnRpZnlpbmcgdGhlIGNsb3Nlc3QgZW1wdHkgY2VsbC4gIElmIHRoYXQgY2VsbCBpcyBpbiBhIGNvbHVtbiB3aXRoIGVtcHR5IGNlbGxzIGJlbG93IGl0LFxyXG4gICAqIGNob29zZSB0aGUgZW1wdHkgY2VsbCB0aGF0IGlzIGNsb3Nlc3QgdG8gdGhlIGJvdHRvbSBvZiB0aGUgZ3JpZCBpbiB0aGF0IGNvbHVtbi5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0QmVzdEVtcHR5Q2VsbCggcG9zaXRpb246IFZlY3RvcjIgKTogbnVtYmVyIHwgbnVsbCB7XHJcblxyXG4gICAgLy8gU3RhcnQgd2l0aCB0aGUgbGFzdCBlbXB0eSBjZWxsIGluIHRoZSBhcnJheVxyXG4gICAgbGV0IGNsb3Nlc3RDZWxsID0gdGhpcy5nZXRMYXN0RW1wdHlDZWxsKCk7XHJcblxyXG4gICAgLy8gQ2FyZWZ1bCEgY2xvc2VzdENlbGwgaXMge251bWJlcnxudWxsfSwgYW5kIG1pZ2h0IGJlIDBcclxuICAgIC8vIElmIHRoZSBncmlkIGlzIG5vdCBmdWxsLi4uXHJcbiAgICBpZiAoIGNsb3Nlc3RDZWxsICE9PSBudWxsICkge1xyXG5cclxuICAgICAgbGV0IGNsb3Nlc3REaXN0YW5jZSA9IHRoaXMuZ2V0UG9zaXRpb25PZkNlbGwoIGNsb3Nlc3RDZWxsICkuZGlzdGFuY2UoIHBvc2l0aW9uICk7XHJcblxyXG4gICAgICAvLyBGaW5kIHRoZSBjbG9zZXN0IGNlbGwgYmFzZWQgb24gZGlzdGFuY2UsIHdvcmtpbmcgYmFja3dhcmRzIGZyb20gbGFzdEVtcHR5Q2VsbC5cclxuICAgICAgLy8gVGhpcyBpcyBicnV0ZSBmb3JjZSwgYnV0IHN0cmFpZ2h0Zm9yd2FyZCwgYW5kIG5vdCBhIHBlcmZvcm1hbmNlIGlzc3VlIGJlY2F1c2UgdGhlIG51bWJlciBvZiBjZWxscyBpcyBzbWFsbC5cclxuICAgICAgZm9yICggbGV0IGkgPSBjbG9zZXN0Q2VsbCAtIDE7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgICAgIGlmICggdGhpcy5pc0VtcHR5Q2VsbCggaSApICkge1xyXG4gICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSB0aGlzLmdldFBvc2l0aW9uT2ZDZWxsKCBpICkuZGlzdGFuY2UoIHBvc2l0aW9uICk7XHJcbiAgICAgICAgICBpZiAoIGRpc3RhbmNlIDwgY2xvc2VzdERpc3RhbmNlICkge1xyXG4gICAgICAgICAgICBjbG9zZXN0RGlzdGFuY2UgPSBkaXN0YW5jZTtcclxuICAgICAgICAgICAgY2xvc2VzdENlbGwgPSBpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTm93IGxvb2sgYmVsb3cgdGhlIGNsb3Nlc3QgY2VsbCB0byBzZWUgaWYgdGhlcmUgYXJlIGFueSBlbXB0eSBjZWxscyBpbiB0aGUgc2FtZSBjb2x1bW4uXHJcbiAgICAgIC8vIFRoaXMgbWFrZXMgdGVybXMgXCJmYWxsXCIgdG8gdGhlIGNlbGwgdGhhdCBpcyBjbG9zZXN0IHRvIHRoZSBib3R0b20gb2YgdGhlIGdyaWQuXHJcbiAgICAgIGNvbnN0IGNsb3Nlc3RSb3cgPSB0aGlzLmNlbGxUb1JvdyggY2xvc2VzdENlbGwgKTtcclxuICAgICAgY29uc3QgY2xvc2VzdENvbHVtbiA9IHRoaXMuY2VsbFRvQ29sdW1uKCBjbG9zZXN0Q2VsbCApO1xyXG4gICAgICBmb3IgKCBsZXQgcm93ID0gdGhpcy5yb3dzIC0gMTsgcm93ID4gY2xvc2VzdFJvdzsgcm93LS0gKSB7XHJcbiAgICAgICAgY29uc3QgY2VsbEJlbG93ID0gdGhpcy5yb3dDb2x1bW5Ub0NlbGwoIHJvdywgY2xvc2VzdENvbHVtbiApO1xyXG4gICAgICAgIGlmICggdGhpcy5pc0VtcHR5Q2VsbCggY2VsbEJlbG93ICkgKSB7XHJcbiAgICAgICAgICBjbG9zZXN0Q2VsbCA9IGNlbGxCZWxvdztcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjbG9zZXN0Q2VsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElzIHRoZSBzcGVjaWZpZWQgY2VsbCBpZGVudGlmaWVyIHZhbGlkP1xyXG4gICAqL1xyXG4gIHByaXZhdGUgaXNWYWxpZENlbGwoIGNlbGw6IG51bWJlciApOiBib29sZWFuIHtcclxuICAgIHJldHVybiAoIE51bWJlci5pc0ludGVnZXIoIGNlbGwgKSAmJiBjZWxsID49IDAgJiYgY2VsbCA8IHRoaXMuY2VsbHMubGVuZ3RoICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0cyBhIGNlbGwgaWRlbnRpZmllciB0byBhIHJvdyBudW1iZXIuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjZWxsVG9Sb3coIGNlbGw6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc1ZhbGlkQ2VsbCggY2VsbCApLCBgaW52YWxpZCBjZWxsOiAke2NlbGx9YCApO1xyXG4gICAgY29uc3Qgcm93ID0gTWF0aC5jZWlsKCAoIGNlbGwgKyAxICkgLyB0aGlzLmNvbHVtbnMgKSAtIDE7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByb3cgPj0gMCAmJiByb3cgPCB0aGlzLnJvd3MgKTtcclxuICAgIHJldHVybiByb3c7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0cyBhIGNlbGwgaWRlbnRpZmllciB0byBhIGNvbHVtbiBudW1iZXIuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjZWxsVG9Db2x1bW4oIGNlbGw6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc1ZhbGlkQ2VsbCggY2VsbCApLCBgaW52YWxpZCBjZWxsOiAke2NlbGx9YCApO1xyXG4gICAgY29uc3QgY29sdW1uID0gY2VsbCAlIHRoaXMuY29sdW1ucztcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbHVtbiA+PSAwICYmIGNvbHVtbiA8IHRoaXMuY29sdW1ucyApO1xyXG4gICAgcmV0dXJuIGNvbHVtbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIHJvdyBhbmQgY29sdW1uIHRvIGEgY2VsbCBpZGVudGlmaWVyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByb3dDb2x1bW5Ub0NlbGwoIHJvdzogbnVtYmVyLCBjb2x1bW46IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcm93ID49IDAgJiYgcm93IDwgdGhpcy5yb3dzLCBgcm93IG91dCBvZiByYW5nZTogJHtyb3d9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29sdW1uID49IDAgJiYgY29sdW1uIDwgdGhpcy5jb2x1bW5zLCBgY29sdW1uIG91dCBvZiByYW5nZTogJHtjb2x1bW59YCApO1xyXG4gICAgY29uc3QgY2VsbCA9ICggcm93ICogdGhpcy5jb2x1bW5zICkgKyBjb2x1bW47XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzVmFsaWRDZWxsKCBjZWxsICksIGBpbnZhbGlkIGNlbGw6ICR7Y2VsbH1gICk7XHJcbiAgICByZXR1cm4gY2VsbDtcclxuICB9XHJcbn1cclxuXHJcbmVxdWFsaXR5RXhwbG9yZXIucmVnaXN0ZXIoICdHcmlkJywgR3JpZCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBR3hELE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFHN0Q7QUFDQSxNQUFNQyxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUM7O0FBV3RCLGVBQWUsTUFBTUMsSUFBSSxDQUFDO0VBU21COztFQUczQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ1NDLFdBQVdBLENBQUVDLGdCQUE0QyxFQUFFQyxTQUEyQixFQUFFQyxlQUE2QixFQUFHO0lBRTdILE1BQU1DLE9BQU8sR0FBR1AsU0FBUyxDQUEyQixDQUFDLENBQUU7TUFFckQ7TUFDQVEsSUFBSSxFQUFFLEVBQUU7TUFDUkMsT0FBTyxFQUFFLEVBQUU7TUFDWEMsU0FBUyxFQUFFLENBQUM7TUFDWkMsVUFB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