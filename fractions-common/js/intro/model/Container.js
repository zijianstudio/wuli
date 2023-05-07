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
    this.filledCellCountProperty = new NumberProperty( 0 );

    // @public {Property.<boolean>} - How many cells appear filled?
    this.appearsFilledCellCountProperty = new NumberProperty( 0 );

    // Called when a fill property changes
    const filledChange = filled => {
      this.filledCellCountProperty.value += filled ? 1 : -1;
    };
    const appearsfilledChange = filled => {
      this.appearsFilledCellCountProperty.value += filled ? 1 : -1;
    };

    // When a cell is added, listen to when its fill changes
    this.cells.addItemAddedListener( cell => {
      // If it's already filled, increment
      if ( cell.isFilledProperty.value ) {
        this.filledCellCountProperty.value += 1;
      }
      if ( cell.appearsFilledProperty.value ) {
        this.appearsFilledCellCountProperty.value += 1;
      }
      cell.isFilledProperty.lazyLink( filledChange );
      cell.appearsFilledProperty.lazyLink( appearsfilledChange );
    } );

    // When a cell is removed, stop listening to its fill changes
    this.cells.addItemRemovedListener( cell => {
      cell.isFilledProperty.unlink( filledChange );
      cell.appearsFilledProperty.unlink( appearsfilledChange );

      // If it's filled, decrement
      if ( cell.isFilledProperty.value ) {
        this.filledCellCountProperty.value -= 1;
      }
      if ( cell.appearsFilledProperty.value ) {
        this.appearsFilledCellCountProperty.value -= 1;
      }
    } );
  }

  /**
   * Adds a certain number of empty cells.
   * @public
   *
   * @param {number} quantity
   */
  addCells( quantity ) {
    _.times( quantity, () => this.cells.push( new Cell( this, this.cells.length ) ) );
  }

  /**
   * Removes a certain number of cells, attempting to redistribute any filled ones to empty cells.
   * @public
   *
   * @param {number} quantity
   * @returns {number} - The number of filled cells removed that couldn't be handled by filling another empty cell.
   */
  removeCells( quantity ) {
    let removedCount = 0;

    _.times( quantity, () => {
      const removedCell = this.cells.pop();

      // If the removed cell is filled, we want to find another cell to fill
      if ( removedCell.isFilledProperty.value ) {
        const cell = this.getNextEmptyCell();

        if ( cell ) {
          cell.fill();
        }
        else {
          removedCount++;
        }
      }
    } );

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
    for ( let i = 0; i < this.cells.length; i++ ) {
      const cell = this.cells.get( i );
      if ( !cell.isFilledProperty.value ) {
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
    for ( let i = this.cells.length - 1; i >= 0; i-- ) {
      const cell = this.cells.get( i );
      if ( cell.isFilledProperty.value ) {
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
    for ( let i = this.cells.length - 1; i >= 0; i-- ) {
      const cell = this.cells.get( i );
      if ( cell.appearsFilledProperty.value ) {
        return cell;
      }
    }
    return null;
  }
}

fractionsCommon.register( 'Container', Container );
export default Container;