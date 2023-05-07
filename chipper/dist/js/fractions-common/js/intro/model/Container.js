// Copyright 2018-2022, University of Colorado Boulder

/**
 * Contains up to N cells, where N is the denominator. Represents up to N/N (N cells of 1/N each).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import fractionsCommon from '../../fractionsCommon.js';
import Cell from './Cell.js';
class Container {
  constructor() {
    // @public {ObservableArrayDef.<Cell>}
    this.cells = createObservableArray();

    // @public {Property.<boolean>} - How many cells are logically filled?
    this.filledCellCountProperty = new NumberProperty(0);

    // @public {Property.<boolean>} - How many cells appear filled?
    this.appearsFilledCellCountProperty = new NumberProperty(0);

    // Called when a fill property changes
    const filledChange = filled => {
      this.filledCellCountProperty.value += filled ? 1 : -1;
    };
    const appearsfilledChange = filled => {
      this.appearsFilledCellCountProperty.value += filled ? 1 : -1;
    };

    // When a cell is added, listen to when its fill changes
    this.cells.addItemAddedListener(cell => {
      // If it's already filled, increment
      if (cell.isFilledProperty.value) {
        this.filledCellCountProperty.value += 1;
      }
      if (cell.appearsFilledProperty.value) {
        this.appearsFilledCellCountProperty.value += 1;
      }
      cell.isFilledProperty.lazyLink(filledChange);
      cell.appearsFilledProperty.lazyLink(appearsfilledChange);
    });

    // When a cell is removed, stop listening to its fill changes
    this.cells.addItemRemovedListener(cell => {
      cell.isFilledProperty.unlink(filledChange);
      cell.appearsFilledProperty.unlink(appearsfilledChange);

      // If it's filled, decrement
      if (cell.isFilledProperty.value) {
        this.filledCellCountProperty.value -= 1;
      }
      if (cell.appearsFilledProperty.value) {
        this.appearsFilledCellCountProperty.value -= 1;
      }
    });
  }

  /**
   * Adds a certain number of empty cells.
   * @public
   *
   * @param {number} quantity
   */
  addCells(quantity) {
    _.times(quantity, () => this.cells.push(new Cell(this, this.cells.length)));
  }

  /**
   * Removes a certain number of cells, attempting to redistribute any filled ones to empty cells.
   * @public
   *
   * @param {number} quantity
   * @returns {number} - The number of filled cells removed that couldn't be handled by filling another empty cell.
   */
  removeCells(quantity) {
    let removedCount = 0;
    _.times(quantity, () => {
      const removedCell = this.cells.pop();

      // If the removed cell is filled, we want to find another cell to fill
      if (removedCell.isFilledProperty.value) {
        const cell = this.getNextEmptyCell();
        if (cell) {
          cell.fill();
        } else {
          removedCount++;
        }
      }
    });
    return removedCount;
  }

  /**
   * Finds the next empty cell (looking at the smallest indices first).
   * @public
   *
   * @returns {Cell|null}
   */
  getNextEmptyCell() {
    // forwards order
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells.get(i);
      if (!cell.isFilledProperty.value) {
        return cell;
      }
    }
    return null;
  }

  /**
   * Finds the next filled cell (looking at the largest indices first).
   * @public
   *
   * @returns {Cell|null}
   */
  getNextFilledCell() {
    // backwards order
    for (let i = this.cells.length - 1; i >= 0; i--) {
      const cell = this.cells.get(i);
      if (cell.isFilledProperty.value) {
        return cell;
      }
    }
    return null;
  }

  /**
   * Finds the next cell that appears filled (looking at the largest indices first).
   * @public
   *
   * @returns {Cell|null}
   */
  getNextAppearsFilledCell() {
    // backwards order
    for (let i = this.cells.length - 1; i >= 0; i--) {
      const cell = this.cells.get(i);
      if (cell.appearsFilledProperty.value) {
        return cell;
      }
    }
    return null;
  }
}
fractionsCommon.register('Container', Container);
export default Container;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJOdW1iZXJQcm9wZXJ0eSIsImZyYWN0aW9uc0NvbW1vbiIsIkNlbGwiLCJDb250YWluZXIiLCJjb25zdHJ1Y3RvciIsImNlbGxzIiwiZmlsbGVkQ2VsbENvdW50UHJvcGVydHkiLCJhcHBlYXJzRmlsbGVkQ2VsbENvdW50UHJvcGVydHkiLCJmaWxsZWRDaGFuZ2UiLCJmaWxsZWQiLCJ2YWx1ZSIsImFwcGVhcnNmaWxsZWRDaGFuZ2UiLCJhZGRJdGVtQWRkZWRMaXN0ZW5lciIsImNlbGwiLCJpc0ZpbGxlZFByb3BlcnR5IiwiYXBwZWFyc0ZpbGxlZFByb3BlcnR5IiwibGF6eUxpbmsiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwidW5saW5rIiwiYWRkQ2VsbHMiLCJxdWFudGl0eSIsIl8iLCJ0aW1lcyIsInB1c2giLCJsZW5ndGgiLCJyZW1vdmVDZWxscyIsInJlbW92ZWRDb3VudCIsInJlbW92ZWRDZWxsIiwicG9wIiwiZ2V0TmV4dEVtcHR5Q2VsbCIsImZpbGwiLCJpIiwiZ2V0IiwiZ2V0TmV4dEZpbGxlZENlbGwiLCJnZXROZXh0QXBwZWFyc0ZpbGxlZENlbGwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvbnRhaW5lci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb250YWlucyB1cCB0byBOIGNlbGxzLCB3aGVyZSBOIGlzIHRoZSBkZW5vbWluYXRvci4gUmVwcmVzZW50cyB1cCB0byBOL04gKE4gY2VsbHMgb2YgMS9OIGVhY2gpLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGNyZWF0ZU9ic2VydmFibGVBcnJheSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL2NyZWF0ZU9ic2VydmFibGVBcnJheS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IGZyYWN0aW9uc0NvbW1vbiBmcm9tICcuLi8uLi9mcmFjdGlvbnNDb21tb24uanMnO1xyXG5pbXBvcnQgQ2VsbCBmcm9tICcuL0NlbGwuanMnO1xyXG5cclxuY2xhc3MgQ29udGFpbmVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIC8vIEBwdWJsaWMge09ic2VydmFibGVBcnJheURlZi48Q2VsbD59XHJcbiAgICB0aGlzLmNlbGxzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSAtIEhvdyBtYW55IGNlbGxzIGFyZSBsb2dpY2FsbHkgZmlsbGVkP1xyXG4gICAgdGhpcy5maWxsZWRDZWxsQ291bnRQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gLSBIb3cgbWFueSBjZWxscyBhcHBlYXIgZmlsbGVkP1xyXG4gICAgdGhpcy5hcHBlYXJzRmlsbGVkQ2VsbENvdW50UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcclxuXHJcbiAgICAvLyBDYWxsZWQgd2hlbiBhIGZpbGwgcHJvcGVydHkgY2hhbmdlc1xyXG4gICAgY29uc3QgZmlsbGVkQ2hhbmdlID0gZmlsbGVkID0+IHtcclxuICAgICAgdGhpcy5maWxsZWRDZWxsQ291bnRQcm9wZXJ0eS52YWx1ZSArPSBmaWxsZWQgPyAxIDogLTE7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgYXBwZWFyc2ZpbGxlZENoYW5nZSA9IGZpbGxlZCA9PiB7XHJcbiAgICAgIHRoaXMuYXBwZWFyc0ZpbGxlZENlbGxDb3VudFByb3BlcnR5LnZhbHVlICs9IGZpbGxlZCA/IDEgOiAtMTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gV2hlbiBhIGNlbGwgaXMgYWRkZWQsIGxpc3RlbiB0byB3aGVuIGl0cyBmaWxsIGNoYW5nZXNcclxuICAgIHRoaXMuY2VsbHMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIGNlbGwgPT4ge1xyXG4gICAgICAvLyBJZiBpdCdzIGFscmVhZHkgZmlsbGVkLCBpbmNyZW1lbnRcclxuICAgICAgaWYgKCBjZWxsLmlzRmlsbGVkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgdGhpcy5maWxsZWRDZWxsQ291bnRQcm9wZXJ0eS52YWx1ZSArPSAxO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggY2VsbC5hcHBlYXJzRmlsbGVkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgdGhpcy5hcHBlYXJzRmlsbGVkQ2VsbENvdW50UHJvcGVydHkudmFsdWUgKz0gMTtcclxuICAgICAgfVxyXG4gICAgICBjZWxsLmlzRmlsbGVkUHJvcGVydHkubGF6eUxpbmsoIGZpbGxlZENoYW5nZSApO1xyXG4gICAgICBjZWxsLmFwcGVhcnNGaWxsZWRQcm9wZXJ0eS5sYXp5TGluayggYXBwZWFyc2ZpbGxlZENoYW5nZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdoZW4gYSBjZWxsIGlzIHJlbW92ZWQsIHN0b3AgbGlzdGVuaW5nIHRvIGl0cyBmaWxsIGNoYW5nZXNcclxuICAgIHRoaXMuY2VsbHMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggY2VsbCA9PiB7XHJcbiAgICAgIGNlbGwuaXNGaWxsZWRQcm9wZXJ0eS51bmxpbmsoIGZpbGxlZENoYW5nZSApO1xyXG4gICAgICBjZWxsLmFwcGVhcnNGaWxsZWRQcm9wZXJ0eS51bmxpbmsoIGFwcGVhcnNmaWxsZWRDaGFuZ2UgKTtcclxuXHJcbiAgICAgIC8vIElmIGl0J3MgZmlsbGVkLCBkZWNyZW1lbnRcclxuICAgICAgaWYgKCBjZWxsLmlzRmlsbGVkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgdGhpcy5maWxsZWRDZWxsQ291bnRQcm9wZXJ0eS52YWx1ZSAtPSAxO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggY2VsbC5hcHBlYXJzRmlsbGVkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgdGhpcy5hcHBlYXJzRmlsbGVkQ2VsbENvdW50UHJvcGVydHkudmFsdWUgLT0gMTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIGNlcnRhaW4gbnVtYmVyIG9mIGVtcHR5IGNlbGxzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBxdWFudGl0eVxyXG4gICAqL1xyXG4gIGFkZENlbGxzKCBxdWFudGl0eSApIHtcclxuICAgIF8udGltZXMoIHF1YW50aXR5LCAoKSA9PiB0aGlzLmNlbGxzLnB1c2goIG5ldyBDZWxsKCB0aGlzLCB0aGlzLmNlbGxzLmxlbmd0aCApICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBjZXJ0YWluIG51bWJlciBvZiBjZWxscywgYXR0ZW1wdGluZyB0byByZWRpc3RyaWJ1dGUgYW55IGZpbGxlZCBvbmVzIHRvIGVtcHR5IGNlbGxzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBxdWFudGl0eVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gVGhlIG51bWJlciBvZiBmaWxsZWQgY2VsbHMgcmVtb3ZlZCB0aGF0IGNvdWxkbid0IGJlIGhhbmRsZWQgYnkgZmlsbGluZyBhbm90aGVyIGVtcHR5IGNlbGwuXHJcbiAgICovXHJcbiAgcmVtb3ZlQ2VsbHMoIHF1YW50aXR5ICkge1xyXG4gICAgbGV0IHJlbW92ZWRDb3VudCA9IDA7XHJcblxyXG4gICAgXy50aW1lcyggcXVhbnRpdHksICgpID0+IHtcclxuICAgICAgY29uc3QgcmVtb3ZlZENlbGwgPSB0aGlzLmNlbGxzLnBvcCgpO1xyXG5cclxuICAgICAgLy8gSWYgdGhlIHJlbW92ZWQgY2VsbCBpcyBmaWxsZWQsIHdlIHdhbnQgdG8gZmluZCBhbm90aGVyIGNlbGwgdG8gZmlsbFxyXG4gICAgICBpZiAoIHJlbW92ZWRDZWxsLmlzRmlsbGVkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgY29uc3QgY2VsbCA9IHRoaXMuZ2V0TmV4dEVtcHR5Q2VsbCgpO1xyXG5cclxuICAgICAgICBpZiAoIGNlbGwgKSB7XHJcbiAgICAgICAgICBjZWxsLmZpbGwoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICByZW1vdmVkQ291bnQrKztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gcmVtb3ZlZENvdW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmluZHMgdGhlIG5leHQgZW1wdHkgY2VsbCAobG9va2luZyBhdCB0aGUgc21hbGxlc3QgaW5kaWNlcyBmaXJzdCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge0NlbGx8bnVsbH1cclxuICAgKi9cclxuICBnZXROZXh0RW1wdHlDZWxsKCkge1xyXG4gICAgLy8gZm9yd2FyZHMgb3JkZXJcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY2VsbHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGNlbGwgPSB0aGlzLmNlbGxzLmdldCggaSApO1xyXG4gICAgICBpZiAoICFjZWxsLmlzRmlsbGVkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgcmV0dXJuIGNlbGw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmluZHMgdGhlIG5leHQgZmlsbGVkIGNlbGwgKGxvb2tpbmcgYXQgdGhlIGxhcmdlc3QgaW5kaWNlcyBmaXJzdCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge0NlbGx8bnVsbH1cclxuICAgKi9cclxuICBnZXROZXh0RmlsbGVkQ2VsbCgpIHtcclxuICAgIC8vIGJhY2t3YXJkcyBvcmRlclxyXG4gICAgZm9yICggbGV0IGkgPSB0aGlzLmNlbGxzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgICBjb25zdCBjZWxsID0gdGhpcy5jZWxscy5nZXQoIGkgKTtcclxuICAgICAgaWYgKCBjZWxsLmlzRmlsbGVkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgcmV0dXJuIGNlbGw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmluZHMgdGhlIG5leHQgY2VsbCB0aGF0IGFwcGVhcnMgZmlsbGVkIChsb29raW5nIGF0IHRoZSBsYXJnZXN0IGluZGljZXMgZmlyc3QpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtDZWxsfG51bGx9XHJcbiAgICovXHJcbiAgZ2V0TmV4dEFwcGVhcnNGaWxsZWRDZWxsKCkge1xyXG4gICAgLy8gYmFja3dhcmRzIG9yZGVyXHJcbiAgICBmb3IgKCBsZXQgaSA9IHRoaXMuY2VsbHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgIGNvbnN0IGNlbGwgPSB0aGlzLmNlbGxzLmdldCggaSApO1xyXG4gICAgICBpZiAoIGNlbGwuYXBwZWFyc0ZpbGxlZFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIHJldHVybiBjZWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbmZyYWN0aW9uc0NvbW1vbi5yZWdpc3RlciggJ0NvbnRhaW5lcicsIENvbnRhaW5lciApO1xyXG5leHBvcnQgZGVmYXVsdCBDb250YWluZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHFCQUFxQixNQUFNLDhDQUE4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