// Copyright 2017-2022, University of Colorado Boulder

/**
 * Plate where terms are placed to be weighed on a balance scale.
 * (The correct term is 'weighing platform', but 'plate' was used throughout the design.)
 * Terms are arranged in a 2D grid of cells, where each cell can be occupied by at most one term.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import equalityExplorer from '../../equalityExplorer.js';
import Grid from './Grid.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
// constants
const DEFAULT_CELL_SIZE = new Dimension2(5, 5);
export default class Plate extends PhetioObject {
  // position of the plate in the model coordinate frame
  // number of terms on the plate
  // total weight of the terms that are on the plate
  // emit is called when the contents of the grid changes (terms added, removed, organized)

  /**
   * @param termCreators - creators associated with term on this plate
   * @param debugSide - which side of the scale, for debugging
   * @param [providedOptions]
   */
  constructor(termCreators, debugSide, providedOptions) {
    const options = optionize()({
      // SelfOptions
      supportHeight: 10,
      diameter: 20,
      gridRows: 1,
      gridColumns: 1,
      cellSize: DEFAULT_CELL_SIZE,
      // PhetioObjectOptions
      phetioState: false
    }, providedOptions);
    super(options);
    this.termCreators = termCreators;
    this.debugSide = debugSide;
    this.supportHeight = options.supportHeight;
    this.diameter = options.diameter;
    this.gridRows = options.gridRows;
    this.gridColumns = options.gridColumns;
    this.cellSize = options.cellSize;

    // Does not need to be reset.
    this.positionProperty = new Vector2Property(new Vector2(0, 0), {
      tandem: options.tandem.createTandem('positionProperty'),
      phetioReadOnly: true // BalanceScale is responsible for setting positionProperty
    });

    this.grid = new Grid(this.positionProperty, debugSide, {
      rows: options.gridRows,
      columns: options.gridColumns,
      cellWidth: options.cellSize.width,
      cellHeight: options.cellSize.height
    });

    // Does not need to be reset.
    this.numberOfTermsProperty = new NumberProperty(0, {
      numberType: 'Integer',
      range: new Range(0, options.gridRows * options.gridColumns),
      tandem: options.tandem.createTandem('numberOfTermsProperty'),
      phetioDocumentation: 'Number of terms on the plate',
      phetioReadOnly: true // numberOfTermsProperty must be set by addTerm and removeTerm
    });

    // weightProperty is derived from the weights of each termCreator
    const weightDependencies = [];
    for (let i = 0; i < termCreators.length; i++) {
      weightDependencies.push(termCreators[i].weightOnPlateProperty);
    }
    this.weightProperty = DerivedProperty.deriveAny(weightDependencies, () => {
      let weight = Fraction.fromInteger(0);
      for (let i = 0; i < termCreators.length; i++) {
        weight = weight.plus(termCreators[i].weightOnPlateProperty.value).reduced();
      }
      return weight;
    }, {
      tandem: options.tandem.createTandem('weightProperty'),
      phetioValueType: Fraction.FractionIO,
      phetioDocumentation: 'Combined weight of the terms on the plate'
    });
    this.contentsChangedEmitter = new Emitter();

    // Associate this plate with its term creators. Note that this is a 2-way association.
    termCreators.forEach(termCreator => {
      termCreator.plate = this;
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }

  /**
   * Adds a term to the plate, in a specific cell in the grid.
   */
  addTerm(term, cell) {
    this.grid.putTerm(term, cell);
    this.numberOfTermsProperty.value++;
    this.contentsChangedEmitter.emit();
  }

  /**
   * Removes a term from the plate. Returns the cell that the term was removed from.
   * @param term
   * @returns the cell that the term was removed from
   */
  removeTerm(term) {
    const cell = this.grid.removeTerm(term);
    this.numberOfTermsProperty.value--;
    this.contentsChangedEmitter.emit();
    return cell;
  }

  /**
   * Is the plate's grid full? That is, are all cells occupied?
   */
  isFull() {
    return this.grid.isFull();
  }

  /**
   * Is the specified cell empty?
   */
  isEmptyCell(cell) {
    return this.grid.isEmptyCell(cell);
  }

  /**
   * Gets the empty cell that would be the best fit for adding a term to the plate.
   * @param position
   * @returns the cell's identifier, null if the grid is full
   */
  getBestEmptyCell(position) {
    return this.grid.getBestEmptyCell(position);
  }

  /**
   * Gets the position of a specific cell, in global coordinates.
   * A cell's position is in the center of the cell.
   */
  getPositionOfCell(cell) {
    return this.grid.getPositionOfCell(cell);
  }

  /**
   * Gets the term at a specified position in the grid.
   * @param position
   * @returns null if position is outside the grid, or the cell at position is empty
   */
  getTermAtPosition(position) {
    return this.grid.getTermAtPosition(position);
  }

  /**
   * Gets the term in a specified cell.
   * @param cell
   * @returns null if the cell is empty
   */
  getTermInCell(cell) {
    return this.grid.getTermInCell(cell);
  }

  /**
   * Gets the cell that a term occupies.
   * @param term
   * @returns the cell's identifier, null if the term doesn't occupy a cell
   */
  getCellForTerm(term) {
    return this.grid.getCellForTerm(term);
  }

  /**
   * Gets the y coordinate of the top of the grid.
   */
  getGridTop() {
    return this.grid.top;
  }

  /**
   * Gets an equivalent term from the grid that is closest to a specified cell.
   * @param term
   * @param cell
   * @returns null if no equivalent term is found
   */
  getClosestEquivalentTerm(term, cell) {
    return this.grid.getClosestEquivalentTerm(term, cell);
  }

  /**
   * Organizes terms on the plate, as specified in https://github.com/phetsims/equality-explorer/issues/4
   */
  organize() {
    let numberOfTermsToOrganize = this.numberOfTermsProperty.value;
    if (numberOfTermsToOrganize > 0) {
      const grid = this.grid;
      grid.clearAllCells();

      // start with the bottom-left cell
      let row = grid.rows - 1;
      let column = 0;

      // Group the terms by positive and negative
      const termGroups = []; // {Term[][]}
      this.termCreators.forEach(termCreator => {
        termGroups.push(termCreator.getPositiveTermsOnPlate());
        termGroups.push(termCreator.getNegativeTermsOnPlate());
      });
      termGroups.forEach(terms => {
        if (terms.length > 0) {
          // stack the terms in columns, from left to right
          for (let i = 0; i < terms.length; i++) {
            const term = terms[i];
            const cell = grid.rowColumnToCell(row, column);
            grid.putTerm(term, cell);
            numberOfTermsToOrganize--;

            // advance to the next cell
            if (i < terms.length - 1) {
              if (row > 0) {
                // next cell in the current column
                row--;
              } else {
                // start a new column
                row = grid.rows - 1;
                column++;
              }
            }
          }
          if (numberOfTermsToOrganize > 0) {
            // Start a new column if we have enough cells to the right of the current column.
            // Otherwise, continue to fill the current column.
            const numberOfCellsToRight = (grid.columns - column - 1) * grid.rows;
            if (numberOfCellsToRight >= numberOfTermsToOrganize) {
              row = grid.rows - 1;
              column++;
            } else {
              row--;
            }
          }
        }
      });
      assert && assert(numberOfTermsToOrganize === 0);

      // Center the stacks on the plate by shifting columns to the right.
      // If it's not possible to exactly center, the additional space will appear on the right.
      const numberOfEmptyColumns = grid.columns - column - 1;
      const gridColumnsToShiftRight = Math.floor(numberOfEmptyColumns / 2);
      if (gridColumnsToShiftRight > 0) {
        for (row = grid.rows - 1; row >= 0; row--) {
          for (column = grid.columns - 1; column >= 0; column--) {
            const cell = grid.rowColumnToCell(row, column);
            const term = grid.getTermInCell(cell);
            if (term) {
              // move term 1 column to the right
              grid.clearCell(cell);
              const rightCell = grid.rowColumnToCell(row, column + gridColumnsToShiftRight);
              grid.putTerm(term, rightCell);
            }
          }
        }
      }

      // Verify that the same terms are on the plate after organizing.
      assert && assert(_.xor(
      // terms on the plate before organize
      _.flatten(termGroups),
      // terms on the plate after organize
      _.flatMap(this.termCreators, termCreator => termCreator.getTermsOnPlate())).length === 0,
      // contains no elements that are different
      'set of terms is not the same after organize');
      this.contentsChangedEmitter.emit();
    }
  }
}
equalityExplorer.register('Plate', Plate);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJEaW1lbnNpb24yIiwiUmFuZ2UiLCJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5Iiwib3B0aW9uaXplIiwiRnJhY3Rpb24iLCJlcXVhbGl0eUV4cGxvcmVyIiwiR3JpZCIsIlBoZXRpb09iamVjdCIsIkRFRkFVTFRfQ0VMTF9TSVpFIiwiUGxhdGUiLCJjb25zdHJ1Y3RvciIsInRlcm1DcmVhdG9ycyIsImRlYnVnU2lkZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJzdXBwb3J0SGVpZ2h0IiwiZGlhbWV0ZXIiLCJncmlkUm93cyIsImdyaWRDb2x1bW5zIiwiY2VsbFNpemUiLCJwaGV0aW9TdGF0ZSIsInBvc2l0aW9uUHJvcGVydHkiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9SZWFkT25seSIsImdyaWQiLCJyb3dzIiwiY29sdW1ucyIsImNlbGxXaWR0aCIsIndpZHRoIiwiY2VsbEhlaWdodCIsImhlaWdodCIsIm51bWJlck9mVGVybXNQcm9wZXJ0eSIsIm51bWJlclR5cGUiLCJyYW5nZSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJ3ZWlnaHREZXBlbmRlbmNpZXMiLCJpIiwibGVuZ3RoIiwicHVzaCIsIndlaWdodE9uUGxhdGVQcm9wZXJ0eSIsIndlaWdodFByb3BlcnR5IiwiZGVyaXZlQW55Iiwid2VpZ2h0IiwiZnJvbUludGVnZXIiLCJwbHVzIiwidmFsdWUiLCJyZWR1Y2VkIiwicGhldGlvVmFsdWVUeXBlIiwiRnJhY3Rpb25JTyIsImNvbnRlbnRzQ2hhbmdlZEVtaXR0ZXIiLCJmb3JFYWNoIiwidGVybUNyZWF0b3IiLCJwbGF0ZSIsImRpc3Bvc2UiLCJhc3NlcnQiLCJhZGRUZXJtIiwidGVybSIsImNlbGwiLCJwdXRUZXJtIiwiZW1pdCIsInJlbW92ZVRlcm0iLCJpc0Z1bGwiLCJpc0VtcHR5Q2VsbCIsImdldEJlc3RFbXB0eUNlbGwiLCJwb3NpdGlvbiIsImdldFBvc2l0aW9uT2ZDZWxsIiwiZ2V0VGVybUF0UG9zaXRpb24iLCJnZXRUZXJtSW5DZWxsIiwiZ2V0Q2VsbEZvclRlcm0iLCJnZXRHcmlkVG9wIiwidG9wIiwiZ2V0Q2xvc2VzdEVxdWl2YWxlbnRUZXJtIiwib3JnYW5pemUiLCJudW1iZXJPZlRlcm1zVG9Pcmdhbml6ZSIsImNsZWFyQWxsQ2VsbHMiLCJyb3ciLCJjb2x1bW4iLCJ0ZXJtR3JvdXBzIiwiZ2V0UG9zaXRpdmVUZXJtc09uUGxhdGUiLCJnZXROZWdhdGl2ZVRlcm1zT25QbGF0ZSIsInRlcm1zIiwicm93Q29sdW1uVG9DZWxsIiwibnVtYmVyT2ZDZWxsc1RvUmlnaHQiLCJudW1iZXJPZkVtcHR5Q29sdW1ucyIsImdyaWRDb2x1bW5zVG9TaGlmdFJpZ2h0IiwiTWF0aCIsImZsb29yIiwiY2xlYXJDZWxsIiwicmlnaHRDZWxsIiwiXyIsInhvciIsImZsYXR0ZW4iLCJmbGF0TWFwIiwiZ2V0VGVybXNPblBsYXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQbGF0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQbGF0ZSB3aGVyZSB0ZXJtcyBhcmUgcGxhY2VkIHRvIGJlIHdlaWdoZWQgb24gYSBiYWxhbmNlIHNjYWxlLlxyXG4gKiAoVGhlIGNvcnJlY3QgdGVybSBpcyAnd2VpZ2hpbmcgcGxhdGZvcm0nLCBidXQgJ3BsYXRlJyB3YXMgdXNlZCB0aHJvdWdob3V0IHRoZSBkZXNpZ24uKVxyXG4gKiBUZXJtcyBhcmUgYXJyYW5nZWQgaW4gYSAyRCBncmlkIG9mIGNlbGxzLCB3aGVyZSBlYWNoIGNlbGwgY2FuIGJlIG9jY3VwaWVkIGJ5IGF0IG1vc3Qgb25lIHRlcm0uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvbW9kZWwvRnJhY3Rpb24uanMnO1xyXG5pbXBvcnQgZXF1YWxpdHlFeHBsb3JlciBmcm9tICcuLi8uLi9lcXVhbGl0eUV4cGxvcmVyLmpzJztcclxuaW1wb3J0IEdyaWQgZnJvbSAnLi9HcmlkLmpzJztcclxuaW1wb3J0IFRlcm0gZnJvbSAnLi9UZXJtLmpzJztcclxuaW1wb3J0IFRlcm1DcmVhdG9yIGZyb20gJy4vVGVybUNyZWF0b3IuanMnO1xyXG5pbXBvcnQgeyBCYWxhbmNlU2NhbGVTaWRlIH0gZnJvbSAnLi9CYWxhbmNlU2NhbGUuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0LCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBERUZBVUxUX0NFTExfU0laRSA9IG5ldyBEaW1lbnNpb24yKCA1LCA1ICk7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHN1cHBvcnRIZWlnaHQ/OiBudW1iZXI7IC8vIGhlaWdodCBvZiB0aGUgdmVydGljYWwgc3VwcG9ydCB0aGF0IGNvbm5lY3RzIHRoZSBwbGF0ZSB0byB0aGUgc2NhbGVcclxuICBkaWFtZXRlcj86IG51bWJlcjsgLy8gZGlhbWV0ZXIgb2YgdGhlIHBsYXRlXHJcbiAgZ3JpZFJvd3M/OiBudW1iZXI7IC8vIHJvd3MgaW4gdGhlIDJEIGdyaWRcclxuICBncmlkQ29sdW1ucz86IG51bWJlcjsgLy8gY29sdW1ucyBpbiB0aGUgMkQgZ3JpZFxyXG4gIGNlbGxTaXplPzogRGltZW5zaW9uMjsgLy8gZGltZW5zaW9ucyBvZiBlYWNoIGNlbGwgaW4gdGhlIGdyaWRcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFBsYXRlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPFBoZXRpb09iamVjdE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXRlIGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IHRlcm1DcmVhdG9yczogVGVybUNyZWF0b3JbXTtcclxuICBwdWJsaWMgcmVhZG9ubHkgZGVidWdTaWRlOiBCYWxhbmNlU2NhbGVTaWRlO1xyXG4gIHB1YmxpYyByZWFkb25seSBzdXBwb3J0SGVpZ2h0OiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGRpYW1ldGVyOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGdyaWRSb3dzOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGdyaWRDb2x1bW5zOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGNlbGxTaXplOiBEaW1lbnNpb24yO1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgcG9zaXRpb25Qcm9wZXJ0eTogUHJvcGVydHk8VmVjdG9yMj47IC8vIHBvc2l0aW9uIG9mIHRoZSBwbGF0ZSBpbiB0aGUgbW9kZWwgY29vcmRpbmF0ZSBmcmFtZVxyXG4gIHB1YmxpYyByZWFkb25seSBudW1iZXJPZlRlcm1zUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj47IC8vIG51bWJlciBvZiB0ZXJtcyBvbiB0aGUgcGxhdGVcclxuICBwdWJsaWMgcmVhZG9ubHkgd2VpZ2h0UHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PEZyYWN0aW9uPjsgLy8gdG90YWwgd2VpZ2h0IG9mIHRoZSB0ZXJtcyB0aGF0IGFyZSBvbiB0aGUgcGxhdGVcclxuICBwdWJsaWMgcmVhZG9ubHkgY29udGVudHNDaGFuZ2VkRW1pdHRlcjogRW1pdHRlcjsgLy8gZW1pdCBpcyBjYWxsZWQgd2hlbiB0aGUgY29udGVudHMgb2YgdGhlIGdyaWQgY2hhbmdlcyAodGVybXMgYWRkZWQsIHJlbW92ZWQsIG9yZ2FuaXplZClcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBncmlkOiBHcmlkO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gdGVybUNyZWF0b3JzIC0gY3JlYXRvcnMgYXNzb2NpYXRlZCB3aXRoIHRlcm0gb24gdGhpcyBwbGF0ZVxyXG4gICAqIEBwYXJhbSBkZWJ1Z1NpZGUgLSB3aGljaCBzaWRlIG9mIHRoZSBzY2FsZSwgZm9yIGRlYnVnZ2luZ1xyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGVybUNyZWF0b3JzOiBUZXJtQ3JlYXRvcltdLCBkZWJ1Z1NpZGU6IEJhbGFuY2VTY2FsZVNpZGUsIHByb3ZpZGVkT3B0aW9uczogUGxhdGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UGxhdGVPcHRpb25zLCBTZWxmT3B0aW9ucywgUGhldGlvT2JqZWN0T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgc3VwcG9ydEhlaWdodDogMTAsXHJcbiAgICAgIGRpYW1ldGVyOiAyMCxcclxuICAgICAgZ3JpZFJvd3M6IDEsXHJcbiAgICAgIGdyaWRDb2x1bW5zOiAxLFxyXG4gICAgICBjZWxsU2l6ZTogREVGQVVMVF9DRUxMX1NJWkUsXHJcblxyXG4gICAgICAvLyBQaGV0aW9PYmplY3RPcHRpb25zXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnRlcm1DcmVhdG9ycyA9IHRlcm1DcmVhdG9ycztcclxuICAgIHRoaXMuZGVidWdTaWRlID0gZGVidWdTaWRlO1xyXG4gICAgdGhpcy5zdXBwb3J0SGVpZ2h0ID0gb3B0aW9ucy5zdXBwb3J0SGVpZ2h0O1xyXG4gICAgdGhpcy5kaWFtZXRlciA9IG9wdGlvbnMuZGlhbWV0ZXI7XHJcbiAgICB0aGlzLmdyaWRSb3dzID0gb3B0aW9ucy5ncmlkUm93cztcclxuICAgIHRoaXMuZ3JpZENvbHVtbnMgPSBvcHRpb25zLmdyaWRDb2x1bW5zO1xyXG4gICAgdGhpcy5jZWxsU2l6ZSA9IG9wdGlvbnMuY2VsbFNpemU7XHJcblxyXG4gICAgLy8gRG9lcyBub3QgbmVlZCB0byBiZSByZXNldC5cclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIG5ldyBWZWN0b3IyKCAwLCAwICksIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwb3NpdGlvblByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSAvLyBCYWxhbmNlU2NhbGUgaXMgcmVzcG9uc2libGUgZm9yIHNldHRpbmcgcG9zaXRpb25Qcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZ3JpZCA9IG5ldyBHcmlkKCB0aGlzLnBvc2l0aW9uUHJvcGVydHksIGRlYnVnU2lkZSwge1xyXG4gICAgICByb3dzOiBvcHRpb25zLmdyaWRSb3dzLFxyXG4gICAgICBjb2x1bW5zOiBvcHRpb25zLmdyaWRDb2x1bW5zLFxyXG4gICAgICBjZWxsV2lkdGg6IG9wdGlvbnMuY2VsbFNpemUud2lkdGgsXHJcbiAgICAgIGNlbGxIZWlnaHQ6IG9wdGlvbnMuY2VsbFNpemUuaGVpZ2h0XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRG9lcyBub3QgbmVlZCB0byBiZSByZXNldC5cclxuICAgIHRoaXMubnVtYmVyT2ZUZXJtc1Byb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIG51bWJlclR5cGU6ICdJbnRlZ2VyJyxcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgb3B0aW9ucy5ncmlkUm93cyAqIG9wdGlvbnMuZ3JpZENvbHVtbnMgKSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdudW1iZXJPZlRlcm1zUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdOdW1iZXIgb2YgdGVybXMgb24gdGhlIHBsYXRlJyxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUgLy8gbnVtYmVyT2ZUZXJtc1Byb3BlcnR5IG11c3QgYmUgc2V0IGJ5IGFkZFRlcm0gYW5kIHJlbW92ZVRlcm1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB3ZWlnaHRQcm9wZXJ0eSBpcyBkZXJpdmVkIGZyb20gdGhlIHdlaWdodHMgb2YgZWFjaCB0ZXJtQ3JlYXRvclxyXG4gICAgY29uc3Qgd2VpZ2h0RGVwZW5kZW5jaWVzOiBUUmVhZE9ubHlQcm9wZXJ0eTxGcmFjdGlvbj5bXSA9IFtdO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGVybUNyZWF0b3JzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICB3ZWlnaHREZXBlbmRlbmNpZXMucHVzaCggdGVybUNyZWF0b3JzWyBpIF0ud2VpZ2h0T25QbGF0ZVByb3BlcnR5ICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy53ZWlnaHRQcm9wZXJ0eSA9IERlcml2ZWRQcm9wZXJ0eS5kZXJpdmVBbnkoIHdlaWdodERlcGVuZGVuY2llcyxcclxuICAgICAgKCkgPT4ge1xyXG4gICAgICAgIGxldCB3ZWlnaHQgPSBGcmFjdGlvbi5mcm9tSW50ZWdlciggMCApO1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRlcm1DcmVhdG9ycy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgIHdlaWdodCA9IHdlaWdodC5wbHVzKCB0ZXJtQ3JlYXRvcnNbIGkgXS53ZWlnaHRPblBsYXRlUHJvcGVydHkudmFsdWUgKS5yZWR1Y2VkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB3ZWlnaHQ7XHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3dlaWdodFByb3BlcnR5JyApLFxyXG4gICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogRnJhY3Rpb24uRnJhY3Rpb25JTyxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnQ29tYmluZWQgd2VpZ2h0IG9mIHRoZSB0ZXJtcyBvbiB0aGUgcGxhdGUnXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmNvbnRlbnRzQ2hhbmdlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIC8vIEFzc29jaWF0ZSB0aGlzIHBsYXRlIHdpdGggaXRzIHRlcm0gY3JlYXRvcnMuIE5vdGUgdGhhdCB0aGlzIGlzIGEgMi13YXkgYXNzb2NpYXRpb24uXHJcbiAgICB0ZXJtQ3JlYXRvcnMuZm9yRWFjaCggdGVybUNyZWF0b3IgPT4ge1xyXG4gICAgICB0ZXJtQ3JlYXRvci5wbGF0ZSA9IHRoaXM7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIHRlcm0gdG8gdGhlIHBsYXRlLCBpbiBhIHNwZWNpZmljIGNlbGwgaW4gdGhlIGdyaWQuXHJcbiAgICovXHJcbiAgcHVibGljIGFkZFRlcm0oIHRlcm06IFRlcm0sIGNlbGw6IG51bWJlciApOiB2b2lkIHtcclxuICAgIHRoaXMuZ3JpZC5wdXRUZXJtKCB0ZXJtLCBjZWxsICk7XHJcbiAgICB0aGlzLm51bWJlck9mVGVybXNQcm9wZXJ0eS52YWx1ZSsrO1xyXG4gICAgdGhpcy5jb250ZW50c0NoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSB0ZXJtIGZyb20gdGhlIHBsYXRlLiBSZXR1cm5zIHRoZSBjZWxsIHRoYXQgdGhlIHRlcm0gd2FzIHJlbW92ZWQgZnJvbS5cclxuICAgKiBAcGFyYW0gdGVybVxyXG4gICAqIEByZXR1cm5zIHRoZSBjZWxsIHRoYXQgdGhlIHRlcm0gd2FzIHJlbW92ZWQgZnJvbVxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVUZXJtKCB0ZXJtOiBUZXJtICk6IG51bWJlciB7XHJcbiAgICBjb25zdCBjZWxsID0gdGhpcy5ncmlkLnJlbW92ZVRlcm0oIHRlcm0gKTtcclxuICAgIHRoaXMubnVtYmVyT2ZUZXJtc1Byb3BlcnR5LnZhbHVlLS07XHJcbiAgICB0aGlzLmNvbnRlbnRzQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgcmV0dXJuIGNlbGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJcyB0aGUgcGxhdGUncyBncmlkIGZ1bGw/IFRoYXQgaXMsIGFyZSBhbGwgY2VsbHMgb2NjdXBpZWQ/XHJcbiAgICovXHJcbiAgcHVibGljIGlzRnVsbCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmdyaWQuaXNGdWxsKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJcyB0aGUgc3BlY2lmaWVkIGNlbGwgZW1wdHk/XHJcbiAgICovXHJcbiAgcHVibGljIGlzRW1wdHlDZWxsKCBjZWxsOiBudW1iZXIgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkLmlzRW1wdHlDZWxsKCBjZWxsICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBlbXB0eSBjZWxsIHRoYXQgd291bGQgYmUgdGhlIGJlc3QgZml0IGZvciBhZGRpbmcgYSB0ZXJtIHRvIHRoZSBwbGF0ZS5cclxuICAgKiBAcGFyYW0gcG9zaXRpb25cclxuICAgKiBAcmV0dXJucyB0aGUgY2VsbCdzIGlkZW50aWZpZXIsIG51bGwgaWYgdGhlIGdyaWQgaXMgZnVsbFxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRCZXN0RW1wdHlDZWxsKCBwb3NpdGlvbjogVmVjdG9yMiApOiBudW1iZXIgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLmdyaWQuZ2V0QmVzdEVtcHR5Q2VsbCggcG9zaXRpb24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHBvc2l0aW9uIG9mIGEgc3BlY2lmaWMgY2VsbCwgaW4gZ2xvYmFsIGNvb3JkaW5hdGVzLlxyXG4gICAqIEEgY2VsbCdzIHBvc2l0aW9uIGlzIGluIHRoZSBjZW50ZXIgb2YgdGhlIGNlbGwuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFBvc2l0aW9uT2ZDZWxsKCBjZWxsOiBudW1iZXIgKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkLmdldFBvc2l0aW9uT2ZDZWxsKCBjZWxsICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB0ZXJtIGF0IGEgc3BlY2lmaWVkIHBvc2l0aW9uIGluIHRoZSBncmlkLlxyXG4gICAqIEBwYXJhbSBwb3NpdGlvblxyXG4gICAqIEByZXR1cm5zIG51bGwgaWYgcG9zaXRpb24gaXMgb3V0c2lkZSB0aGUgZ3JpZCwgb3IgdGhlIGNlbGwgYXQgcG9zaXRpb24gaXMgZW1wdHlcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VGVybUF0UG9zaXRpb24oIHBvc2l0aW9uOiBWZWN0b3IyICk6IFRlcm0gfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLmdyaWQuZ2V0VGVybUF0UG9zaXRpb24oIHBvc2l0aW9uICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB0ZXJtIGluIGEgc3BlY2lmaWVkIGNlbGwuXHJcbiAgICogQHBhcmFtIGNlbGxcclxuICAgKiBAcmV0dXJucyBudWxsIGlmIHRoZSBjZWxsIGlzIGVtcHR5XHJcbiAgICovXHJcbiAgcHVibGljIGdldFRlcm1JbkNlbGwoIGNlbGw6IG51bWJlciApOiBUZXJtIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkLmdldFRlcm1JbkNlbGwoIGNlbGwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGNlbGwgdGhhdCBhIHRlcm0gb2NjdXBpZXMuXHJcbiAgICogQHBhcmFtIHRlcm1cclxuICAgKiBAcmV0dXJucyB0aGUgY2VsbCdzIGlkZW50aWZpZXIsIG51bGwgaWYgdGhlIHRlcm0gZG9lc24ndCBvY2N1cHkgYSBjZWxsXHJcbiAgICovXHJcbiAgcHVibGljIGdldENlbGxGb3JUZXJtKCB0ZXJtOiBUZXJtICk6IG51bWJlciB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZC5nZXRDZWxsRm9yVGVybSggdGVybSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgeSBjb29yZGluYXRlIG9mIHRoZSB0b3Agb2YgdGhlIGdyaWQuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEdyaWRUb3AoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdyaWQudG9wO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBhbiBlcXVpdmFsZW50IHRlcm0gZnJvbSB0aGUgZ3JpZCB0aGF0IGlzIGNsb3Nlc3QgdG8gYSBzcGVjaWZpZWQgY2VsbC5cclxuICAgKiBAcGFyYW0gdGVybVxyXG4gICAqIEBwYXJhbSBjZWxsXHJcbiAgICogQHJldHVybnMgbnVsbCBpZiBubyBlcXVpdmFsZW50IHRlcm0gaXMgZm91bmRcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q2xvc2VzdEVxdWl2YWxlbnRUZXJtKCB0ZXJtOiBUZXJtLCBjZWxsOiBudW1iZXIgKTogVGVybSB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZC5nZXRDbG9zZXN0RXF1aXZhbGVudFRlcm0oIHRlcm0sIGNlbGwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE9yZ2FuaXplcyB0ZXJtcyBvbiB0aGUgcGxhdGUsIGFzIHNwZWNpZmllZCBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzRcclxuICAgKi9cclxuICBwdWJsaWMgb3JnYW5pemUoKTogdm9pZCB7XHJcblxyXG4gICAgbGV0IG51bWJlck9mVGVybXNUb09yZ2FuaXplID0gdGhpcy5udW1iZXJPZlRlcm1zUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgaWYgKCBudW1iZXJPZlRlcm1zVG9Pcmdhbml6ZSA+IDAgKSB7XHJcblxyXG4gICAgICBjb25zdCBncmlkID0gdGhpcy5ncmlkO1xyXG5cclxuICAgICAgZ3JpZC5jbGVhckFsbENlbGxzKCk7XHJcblxyXG4gICAgICAvLyBzdGFydCB3aXRoIHRoZSBib3R0b20tbGVmdCBjZWxsXHJcbiAgICAgIGxldCByb3cgPSBncmlkLnJvd3MgLSAxO1xyXG4gICAgICBsZXQgY29sdW1uID0gMDtcclxuXHJcbiAgICAgIC8vIEdyb3VwIHRoZSB0ZXJtcyBieSBwb3NpdGl2ZSBhbmQgbmVnYXRpdmVcclxuICAgICAgY29uc3QgdGVybUdyb3VwczogVGVybVtdW10gPSBbXTsgLy8ge1Rlcm1bXVtdfVxyXG4gICAgICB0aGlzLnRlcm1DcmVhdG9ycy5mb3JFYWNoKCB0ZXJtQ3JlYXRvciA9PiB7XHJcbiAgICAgICAgdGVybUdyb3Vwcy5wdXNoKCB0ZXJtQ3JlYXRvci5nZXRQb3NpdGl2ZVRlcm1zT25QbGF0ZSgpICk7XHJcbiAgICAgICAgdGVybUdyb3Vwcy5wdXNoKCB0ZXJtQ3JlYXRvci5nZXROZWdhdGl2ZVRlcm1zT25QbGF0ZSgpICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRlcm1Hcm91cHMuZm9yRWFjaCggdGVybXMgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIHRlcm1zLmxlbmd0aCA+IDAgKSB7XHJcblxyXG4gICAgICAgICAgLy8gc3RhY2sgdGhlIHRlcm1zIGluIGNvbHVtbnMsIGZyb20gbGVmdCB0byByaWdodFxyXG4gICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGVybXMubGVuZ3RoOyBpKysgKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB0ZXJtID0gdGVybXNbIGkgXTtcclxuICAgICAgICAgICAgY29uc3QgY2VsbCA9IGdyaWQucm93Q29sdW1uVG9DZWxsKCByb3csIGNvbHVtbiApO1xyXG4gICAgICAgICAgICBncmlkLnB1dFRlcm0oIHRlcm0sIGNlbGwgKTtcclxuXHJcbiAgICAgICAgICAgIG51bWJlck9mVGVybXNUb09yZ2FuaXplLS07XHJcblxyXG4gICAgICAgICAgICAvLyBhZHZhbmNlIHRvIHRoZSBuZXh0IGNlbGxcclxuICAgICAgICAgICAgaWYgKCBpIDwgdGVybXMubGVuZ3RoIC0gMSApIHtcclxuICAgICAgICAgICAgICBpZiAoIHJvdyA+IDAgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gbmV4dCBjZWxsIGluIHRoZSBjdXJyZW50IGNvbHVtblxyXG4gICAgICAgICAgICAgICAgcm93LS07XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHN0YXJ0IGEgbmV3IGNvbHVtblxyXG4gICAgICAgICAgICAgICAgcm93ID0gZ3JpZC5yb3dzIC0gMTtcclxuICAgICAgICAgICAgICAgIGNvbHVtbisrO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICggbnVtYmVyT2ZUZXJtc1RvT3JnYW5pemUgPiAwICkge1xyXG5cclxuICAgICAgICAgICAgLy8gU3RhcnQgYSBuZXcgY29sdW1uIGlmIHdlIGhhdmUgZW5vdWdoIGNlbGxzIHRvIHRoZSByaWdodCBvZiB0aGUgY3VycmVudCBjb2x1bW4uXHJcbiAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgY29udGludWUgdG8gZmlsbCB0aGUgY3VycmVudCBjb2x1bW4uXHJcbiAgICAgICAgICAgIGNvbnN0IG51bWJlck9mQ2VsbHNUb1JpZ2h0ID0gKCBncmlkLmNvbHVtbnMgLSBjb2x1bW4gLSAxICkgKiBncmlkLnJvd3M7XHJcbiAgICAgICAgICAgIGlmICggbnVtYmVyT2ZDZWxsc1RvUmlnaHQgPj0gbnVtYmVyT2ZUZXJtc1RvT3JnYW5pemUgKSB7XHJcbiAgICAgICAgICAgICAgcm93ID0gZ3JpZC5yb3dzIC0gMTtcclxuICAgICAgICAgICAgICBjb2x1bW4rKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICByb3ctLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBudW1iZXJPZlRlcm1zVG9Pcmdhbml6ZSA9PT0gMCApO1xyXG5cclxuICAgICAgLy8gQ2VudGVyIHRoZSBzdGFja3Mgb24gdGhlIHBsYXRlIGJ5IHNoaWZ0aW5nIGNvbHVtbnMgdG8gdGhlIHJpZ2h0LlxyXG4gICAgICAvLyBJZiBpdCdzIG5vdCBwb3NzaWJsZSB0byBleGFjdGx5IGNlbnRlciwgdGhlIGFkZGl0aW9uYWwgc3BhY2Ugd2lsbCBhcHBlYXIgb24gdGhlIHJpZ2h0LlxyXG4gICAgICBjb25zdCBudW1iZXJPZkVtcHR5Q29sdW1ucyA9IGdyaWQuY29sdW1ucyAtIGNvbHVtbiAtIDE7XHJcbiAgICAgIGNvbnN0IGdyaWRDb2x1bW5zVG9TaGlmdFJpZ2h0ID0gTWF0aC5mbG9vciggbnVtYmVyT2ZFbXB0eUNvbHVtbnMgLyAyICk7XHJcbiAgICAgIGlmICggZ3JpZENvbHVtbnNUb1NoaWZ0UmlnaHQgPiAwICkge1xyXG4gICAgICAgIGZvciAoIHJvdyA9IGdyaWQucm93cyAtIDE7IHJvdyA+PSAwOyByb3ctLSApIHtcclxuICAgICAgICAgIGZvciAoIGNvbHVtbiA9IGdyaWQuY29sdW1ucyAtIDE7IGNvbHVtbiA+PSAwOyBjb2x1bW4tLSApIHtcclxuICAgICAgICAgICAgY29uc3QgY2VsbCA9IGdyaWQucm93Q29sdW1uVG9DZWxsKCByb3csIGNvbHVtbiApO1xyXG4gICAgICAgICAgICBjb25zdCB0ZXJtID0gZ3JpZC5nZXRUZXJtSW5DZWxsKCBjZWxsICk7XHJcbiAgICAgICAgICAgIGlmICggdGVybSApIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gbW92ZSB0ZXJtIDEgY29sdW1uIHRvIHRoZSByaWdodFxyXG4gICAgICAgICAgICAgIGdyaWQuY2xlYXJDZWxsKCBjZWxsICk7XHJcbiAgICAgICAgICAgICAgY29uc3QgcmlnaHRDZWxsID0gZ3JpZC5yb3dDb2x1bW5Ub0NlbGwoIHJvdywgY29sdW1uICsgZ3JpZENvbHVtbnNUb1NoaWZ0UmlnaHQgKTtcclxuICAgICAgICAgICAgICBncmlkLnB1dFRlcm0oIHRlcm0sIHJpZ2h0Q2VsbCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBWZXJpZnkgdGhhdCB0aGUgc2FtZSB0ZXJtcyBhcmUgb24gdGhlIHBsYXRlIGFmdGVyIG9yZ2FuaXppbmcuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIF8ueG9yKFxyXG4gICAgICAgIC8vIHRlcm1zIG9uIHRoZSBwbGF0ZSBiZWZvcmUgb3JnYW5pemVcclxuICAgICAgICBfLmZsYXR0ZW4oIHRlcm1Hcm91cHMgKSxcclxuICAgICAgICAvLyB0ZXJtcyBvbiB0aGUgcGxhdGUgYWZ0ZXIgb3JnYW5pemVcclxuICAgICAgICBfLmZsYXRNYXAoIHRoaXMudGVybUNyZWF0b3JzLCB0ZXJtQ3JlYXRvciA9PiB0ZXJtQ3JlYXRvci5nZXRUZXJtc09uUGxhdGUoKSApXHJcbiAgICAgICkubGVuZ3RoID09PSAwLCAvLyBjb250YWlucyBubyBlbGVtZW50cyB0aGF0IGFyZSBkaWZmZXJlbnRcclxuICAgICAgICAnc2V0IG9mIHRlcm1zIGlzIG5vdCB0aGUgc2FtZSBhZnRlciBvcmdhbml6ZScgKTtcclxuXHJcbiAgICAgIHRoaXMuY29udGVudHNDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5lcXVhbGl0eUV4cGxvcmVyLnJlZ2lzdGVyKCAnUGxhdGUnLCBQbGF0ZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFHbEUsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztB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