// Copyright 2022, University of Colorado Boulder

/**
 * A grid-based layout container.
 *
 * See https://phetsims.github.io/scenery/doc/layout#GridBox for details
 *
 * GridBox-only options:
 *   - rows (see https://phetsims.github.io/scenery/doc/layout#GridBox-rows)
 *   - columns (see https://phetsims.github.io/scenery/doc/layout#GridBox-columns)
 *   - autoRows (see https://phetsims.github.io/scenery/doc/layout#GridBox-autoLines)
 *   - autoColumns (see https://phetsims.github.io/scenery/doc/layout#GridBox-autoLines)
 *   - resize (see https://phetsims.github.io/scenery/doc/layout#GridBox-resize)
 *   - spacing (see https://phetsims.github.io/scenery/doc/layout#GridBox-spacing)
 *   - xSpacing (see https://phetsims.github.io/scenery/doc/layout#GridBox-spacing)
 *   - ySpacing (see https://phetsims.github.io/scenery/doc/layout#GridBox-spacing)
 *   - layoutOrigin (see https://phetsims.github.io/scenery/doc/layout#layoutOrigin)
 *
 * GridBox and layoutOptions options (can be set either in the GridBox itself, or within its child nodes' layoutOptions):
 *   - xAlign (see https://phetsims.github.io/scenery/doc/layout#GridBox-align)
 *   - yAlign (see https://phetsims.github.io/scenery/doc/layout#GridBox-align)
 *   - stretch (see https://phetsims.github.io/scenery/doc/layout#GridBox-stretch)
 *   - xStretch (see https://phetsims.github.io/scenery/doc/layout#GridBox-stretch)
 *   - yStretch (see https://phetsims.github.io/scenery/doc/layout#GridBox-stretch)
 *   - grow (see https://phetsims.github.io/scenery/doc/layout#GridBox-grow)
 *   - xGrow (see https://phetsims.github.io/scenery/doc/layout#GridBox-grow)
 *   - yGrow (see https://phetsims.github.io/scenery/doc/layout#GridBox-grow)
 *   - margin (see https://phetsims.github.io/scenery/doc/layout#GridBox-margins)
 *   - xMargin (see https://phetsims.github.io/scenery/doc/layout#GridBox-margins)
 *   - yMargin (see https://phetsims.github.io/scenery/doc/layout#GridBox-margins)
 *   - leftMargin (see https://phetsims.github.io/scenery/doc/layout#GridBox-margins)
 *   - rightMargin (see https://phetsims.github.io/scenery/doc/layout#GridBox-margins)
 *   - topMargin (see https://phetsims.github.io/scenery/doc/layout#GridBox-margins)
 *   - bottomMargin (see https://phetsims.github.io/scenery/doc/layout#GridBox-margins)
 *   - minContentWidth (see https://phetsims.github.io/scenery/doc/layout#GridBox-minContent)
 *   - minContentHeight (see https://phetsims.github.io/scenery/doc/layout#GridBox-minContent)
 *   - maxContentWidth (see https://phetsims.github.io/scenery/doc/layout#GridBox-maxContent)
 *   - maxContentHeight (see https://phetsims.github.io/scenery/doc/layout#GridBox-maxContent)
 *
 * layoutOptions-only options (can only be set within the child nodes' layoutOptions, NOT available on GridBox):
 *   - x (see https://phetsims.github.io/scenery/doc/layout#GridBox-layoutOptions-location)
 *   - y (see https://phetsims.github.io/scenery/doc/layout#GridBox-layoutOptions-location)
 *   - horizontalSpan (see https://phetsims.github.io/scenery/doc/layout#GridBox-layoutOptions-size)
 *   - verticalSpan (see https://phetsims.github.io/scenery/doc/layout#GridBox-layoutOptions-size)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import assertMutuallyExclusiveOptions from '../../../../phet-core/js/assertMutuallyExclusiveOptions.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import { GRID_CONSTRAINT_OPTION_KEYS, GridCell, GridConstraint, LAYOUT_NODE_OPTION_KEYS, LayoutAlign, LayoutNode, MarginLayoutCell, Node, REQUIRES_BOUNDS_OPTION_KEYS, scenery, SIZABLE_OPTION_KEYS } from '../../imports.js';

// GridBox-specific options that can be passed in the constructor or mutate() call.
const GRIDBOX_OPTION_KEYS = [...LAYOUT_NODE_OPTION_KEYS, ...GRID_CONSTRAINT_OPTION_KEYS.filter(key => key !== 'excludeInvisible'), 'rows', 'columns', 'autoRows', 'autoColumns'];

// Used for setting/getting rows/columns

export default class GridBox extends LayoutNode {
  _cellMap = new Map();

  // For handling auto-wrapping features
  _autoRows = null;
  _autoColumns = null;

  // So we don't kill performance while setting children with autoRows/autoColumns
  _autoLockCount = 0;

  // Listeners that we'll need to remove

  constructor(providedOptions) {
    const options = optionize()({
      // Allow dynamic layout by default, see https://github.com/phetsims/joist/issues/608
      excludeInvisibleChildrenFromBounds: true,
      resize: true
    }, providedOptions);
    super();
    this._constraint = new GridConstraint(this, {
      preferredWidthProperty: this.localPreferredWidthProperty,
      preferredHeightProperty: this.localPreferredHeightProperty,
      minimumWidthProperty: this.localMinimumWidthProperty,
      minimumHeightProperty: this.localMinimumHeightProperty,
      layoutOriginProperty: this.layoutOriginProperty,
      excludeInvisible: false // Should be handled by the options mutate below
    });

    this.onChildInserted = this.onGridBoxChildInserted.bind(this);
    this.onChildRemoved = this.onGridBoxChildRemoved.bind(this);
    this.onChildVisibilityToggled = this.updateAllAutoLines.bind(this);
    this.childInsertedEmitter.addListener(this.onChildInserted);
    this.childRemovedEmitter.addListener(this.onChildRemoved);
    const nonBoundsOptions = _.omit(options, REQUIRES_BOUNDS_OPTION_KEYS);
    const boundsOptions = _.pick(options, REQUIRES_BOUNDS_OPTION_KEYS);

    // Before we layout, do non-bounds-related changes (in case we have resize:false), and prevent layout for
    // performance gains.
    this._constraint.lock();
    this.mutate(nonBoundsOptions);
    this._constraint.unlock();

    // Update the layout (so that it is done once if we have resize:false)
    this._constraint.updateLayout();

    // After we have our localBounds complete, now we can mutate things that rely on it.
    this.mutate(boundsOptions);
    this.linkLayoutBounds();
  }

  /**
   * Sets the children of the GridBox and adjusts them to be positioned in certain cells. It takes a 2-dimensional array
   * of Node|null (where null is a placeholder that does nothing).
   *
   * For each cell, the first index into the array will be taken as the cell position in the provided orientation. The
   * second index into the array will be taken as the cell position in the OPPOSITE orientation.
   *
   * See GridBox.rows or GridBox.columns for usages and more documentation.
   */
  setLines(orientation, lineArrays) {
    const children = [];
    for (let i = 0; i < lineArrays.length; i++) {
      const lineArray = lineArrays[i];
      for (let j = 0; j < lineArray.length; j++) {
        const item = lineArray[j];
        if (item !== null) {
          children.push(item);
          item.mutateLayoutOptions({
            [orientation.line]: i,
            [orientation.opposite.line]: j
          });
        }
      }
    }
    this.children = children;
  }

  /**
   * Returns the children of the GridBox in a 2-dimensional array of Node|null (where null is a placeholder that does
   * nothing).
   *
   * For each cell, the first index into the array will be taken as the cell position in the provided orientation. The
   * second index into the array will be taken as the cell position in the OPPOSITE orientation.
   *
   * See GridBox.rows or GridBox.columns for usages
   */
  getLines(orientation) {
    const lineArrays = [];
    for (const cell of this._cellMap.values()) {
      const i = cell.position.get(orientation);
      const j = cell.position.get(orientation.opposite);

      // Ensure we have enough lines
      while (lineArrays.length < i + 1) {
        lineArrays.push([]);
      }

      // null-pad lines
      while (lineArrays[i].length < j + 1) {
        lineArrays[i].push(null);
      }

      // Finally the actual node!
      lineArrays[i][j] = cell.node;
    }
    return lineArrays;
  }

  /**
   * Sets the children of the GridBox by specifying a two-dimensional array of Nodes (or null values as spacers).
   * The inner arrays will be the rows of the grid.
   * Mutates layoutOptions of the provided Nodes. See setLines() for more documentation.
   */
  set rows(lineArrays) {
    this.setLines(Orientation.VERTICAL, lineArrays);
  }

  /**
   * Returns a two-dimensional array of the child Nodes (with null as a spacer) where the inner arrays are the rows.
   */
  get rows() {
    return this.getLines(Orientation.VERTICAL);
  }

  /**
   * Sets the children of the GridBox by specifying a two-dimensional array of Nodes (or null values as spacers).
   * The inner arrays will be the columns of the grid.
   * * Mutates layoutOptions of the provided Nodes. See setLines() for more documentation.
   */
  set columns(lineArrays) {
    this.setLines(Orientation.HORIZONTAL, lineArrays);
  }

  /**
   * Returns a two-dimensional array of the child Nodes (with null as a spacer) where the inner arrays are the columns.
   */
  get columns() {
    return this.getLines(Orientation.HORIZONTAL);
  }

  /**
   * Returns the Node at a specific row/column intersection (or null if there are none)
   */
  getNodeAt(row, column) {
    const cell = this.constraint.getCell(row, column);
    return cell ? cell.node : null;
  }

  /**
   * Returns the row index of a child Node (or if it spans multiple rows, the first row)
   */
  getRowOfNode(node) {
    assert && assert(this.children.includes(node));
    return this.constraint.getCellFromNode(node).position.vertical;
  }

  /**
   * Returns the column index of a child Node (or if it spans multiple columns, the first row)
   */
  getColumnOfNode(node) {
    assert && assert(this.children.includes(node));
    return this.constraint.getCellFromNode(node).position.horizontal;
  }

  /**
   * Returns all the Nodes in a given row (by index)
   */
  getNodesInRow(index) {
    return this.constraint.getCells(Orientation.VERTICAL, index).map(cell => cell.node);
  }

  /**
   * Returns all the Nodes in a given column (by index)
   */
  getNodesInColumn(index) {
    return this.constraint.getCells(Orientation.HORIZONTAL, index).map(cell => cell.node);
  }

  /**
   * Adds an array of child Nodes (with null allowed as empty spacers) at the bottom of all existing rows.
   */
  addRow(row) {
    this.rows = [...this.rows, row];
    return this;
  }

  /**
   * Adds an array of child Nodes (with null allowed as empty spacers) at the right of all existing columns.
   */
  addColumn(column) {
    this.columns = [...this.columns, column];
    return this;
  }

  /**
   * Inserts a row of child Nodes at a given row index (see addRow for more information)
   */
  insertRow(index, row) {
    this.rows = [...this.rows.slice(0, index), row, ...this.rows.slice(index)];
    return this;
  }

  /**
   * Inserts a column of child Nodes at a given column index (see addColumn for more information)
   */
  insertColumn(index, column) {
    this.columns = [...this.columns.slice(0, index), column, ...this.columns.slice(index)];
    return this;
  }

  /**
   * Removes all child Nodes in a given row
   */
  removeRow(index) {
    this.rows = [...this.rows.slice(0, index), ...this.rows.slice(index + 1)];
    return this;
  }

  /**
   * Removes all child Nodes in a given column
   */
  removeColumn(index) {
    this.columns = [...this.columns.slice(0, index), ...this.columns.slice(index + 1)];
    return this;
  }
  set autoRows(value) {
    assert && assert(value === null || typeof value === 'number' && isFinite(value) && value >= 1);
    if (this._autoRows !== value) {
      this._autoRows = value;
      this.updateAutoRows();
    }
  }
  get autoRows() {
    return this._autoRows;
  }
  set autoColumns(value) {
    assert && assert(value === null || typeof value === 'number' && isFinite(value) && value >= 1);
    if (this._autoColumns !== value) {
      this._autoColumns = value;
      this.updateAutoColumns();
    }
  }
  get autoColumns() {
    return this._autoColumns;
  }

  // Used for autoRows/autoColumns
  updateAutoLines(orientation, value) {
    if (value !== null && this._autoLockCount === 0) {
      let updatedCount = 0;
      this.constraint.lock();
      this.children.filter(child => {
        return child.bounds.isValid() && (!this._constraint.excludeInvisible || child.visible);
      }).forEach((child, index) => {
        const primary = index % value;
        const secondary = Math.floor(index / value);
        const width = 1;
        const height = 1;

        // We guard to see if we actually have to update anything (so we can avoid triggering an auto-layout)
        if (!child.layoutOptions || child.layoutOptions[orientation.line] !== primary || child.layoutOptions[orientation.opposite.line] !== secondary || child.layoutOptions.horizontalSpan !== width || child.layoutOptions.verticalSpan !== height) {
          updatedCount++;
          child.mutateLayoutOptions({
            [orientation.line]: index % value,
            [orientation.opposite.line]: Math.floor(index / value),
            horizontalSpan: 1,
            verticalSpan: 1
          });
        }
      });
      this.constraint.unlock();

      // Only trigger an automatic layout IF we actually adjusted something.
      if (updatedCount > 0) {
        this.constraint.updateLayoutAutomatically();
      }
    }
  }
  updateAutoRows() {
    this.updateAutoLines(Orientation.VERTICAL, this.autoRows);
  }
  updateAutoColumns() {
    this.updateAutoLines(Orientation.HORIZONTAL, this.autoColumns);
  }

  // Updates rows or columns, whichever is active at the moment (if any)
  updateAllAutoLines() {
    assert && assert(this._autoRows === null || this._autoColumns === null, 'autoRows and autoColumns should not both be set when updating children');
    this.updateAutoRows();
    this.updateAutoColumns();
  }
  setChildren(children) {
    const oldChildren = this.getChildren(); // defensive copy

    // Don't update autoRows/autoColumns settings while setting children, wait until after for performance
    this._autoLockCount++;
    super.setChildren(children);
    this._autoLockCount--;
    if (!_.isEqual(oldChildren, children)) {
      this.updateAllAutoLines();
    }
    return this;
  }

  /**
   * Called when a child is inserted.
   */
  onGridBoxChildInserted(node, index) {
    node.visibleProperty.lazyLink(this.onChildVisibilityToggled);
    const cell = new GridCell(this._constraint, node, this._constraint.createLayoutProxy(node));
    this._cellMap.set(node, cell);
    this._constraint.addCell(cell);
    this.updateAllAutoLines();
  }

  /**
   * Called when a child is removed.
   *
   * NOTE: This is NOT called on disposal. Any additional cleanup (to prevent memory leaks) should be included in the
   * dispose() function
   */
  onGridBoxChildRemoved(node) {
    const cell = this._cellMap.get(node);
    assert && assert(cell);
    this._cellMap.delete(node);
    this._constraint.removeCell(cell);
    cell.dispose();
    this.updateAllAutoLines();
    node.visibleProperty.unlink(this.onChildVisibilityToggled);
  }
  mutate(options) {
    // children can be used with one of autoRows/autoColumns, but otherwise these options are exclusive
    assertMutuallyExclusiveOptions(options, ['rows'], ['columns'], ['children', 'autoRows', 'autoColumns']);
    if (options) {
      assert && assert(typeof options.autoRows !== 'number' || typeof options.autoColumns !== 'number', 'autoRows and autoColumns should not be specified both as non-null at the same time');
    }
    return super.mutate(options);
  }
  get spacing() {
    return this._constraint.spacing;
  }
  set spacing(value) {
    this._constraint.spacing = value;
  }
  get xSpacing() {
    return this._constraint.xSpacing;
  }
  set xSpacing(value) {
    this._constraint.xSpacing = value;
  }
  get ySpacing() {
    return this._constraint.ySpacing;
  }
  set ySpacing(value) {
    this._constraint.ySpacing = value;
  }
  get xAlign() {
    return this._constraint.xAlign;
  }
  set xAlign(value) {
    this._constraint.xAlign = value;
  }
  get yAlign() {
    return this._constraint.yAlign;
  }
  set yAlign(value) {
    this._constraint.yAlign = value;
  }
  get grow() {
    return this._constraint.grow;
  }
  set grow(value) {
    this._constraint.grow = value;
  }
  get xGrow() {
    return this._constraint.xGrow;
  }
  set xGrow(value) {
    this._constraint.xGrow = value;
  }
  get yGrow() {
    return this._constraint.yGrow;
  }
  set yGrow(value) {
    this._constraint.yGrow = value;
  }
  get stretch() {
    return this._constraint.stretch;
  }
  set stretch(value) {
    this._constraint.stretch = value;
  }
  get xStretch() {
    return this._constraint.xStretch;
  }
  set xStretch(value) {
    this._constraint.xStretch = value;
  }
  get yStretch() {
    return this._constraint.yStretch;
  }
  set yStretch(value) {
    this._constraint.yStretch = value;
  }
  get margin() {
    return this._constraint.margin;
  }
  set margin(value) {
    this._constraint.margin = value;
  }
  get xMargin() {
    return this._constraint.xMargin;
  }
  set xMargin(value) {
    this._constraint.xMargin = value;
  }
  get yMargin() {
    return this._constraint.yMargin;
  }
  set yMargin(value) {
    this._constraint.yMargin = value;
  }
  get leftMargin() {
    return this._constraint.leftMargin;
  }
  set leftMargin(value) {
    this._constraint.leftMargin = value;
  }
  get rightMargin() {
    return this._constraint.rightMargin;
  }
  set rightMargin(value) {
    this._constraint.rightMargin = value;
  }
  get topMargin() {
    return this._constraint.topMargin;
  }
  set topMargin(value) {
    this._constraint.topMargin = value;
  }
  get bottomMargin() {
    return this._constraint.bottomMargin;
  }
  set bottomMargin(value) {
    this._constraint.bottomMargin = value;
  }
  get minContentWidth() {
    return this._constraint.minContentWidth;
  }
  set minContentWidth(value) {
    this._constraint.minContentWidth = value;
  }
  get minContentHeight() {
    return this._constraint.minContentHeight;
  }
  set minContentHeight(value) {
    this._constraint.minContentHeight = value;
  }
  get maxContentWidth() {
    return this._constraint.maxContentWidth;
  }
  set maxContentWidth(value) {
    this._constraint.maxContentWidth = value;
  }
  get maxContentHeight() {
    return this._constraint.maxContentHeight;
  }
  set maxContentHeight(value) {
    this._constraint.maxContentHeight = value;
  }
  setExcludeInvisibleChildrenFromBounds(excludeInvisibleChildrenFromBounds) {
    super.setExcludeInvisibleChildrenFromBounds(excludeInvisibleChildrenFromBounds);
    this.updateAllAutoLines();
  }
  dispose() {
    // Lock our layout forever
    this._constraint.lock();
    this.childInsertedEmitter.removeListener(this.onChildInserted);
    this.childRemovedEmitter.removeListener(this.onChildRemoved);

    // Dispose our cells here. We won't be getting the children-removed listeners fired (we removed them above)
    for (const cell of this._cellMap.values()) {
      cell.dispose();
      cell.node.visibleProperty.unlink(this.onChildVisibilityToggled);
    }
    super.dispose();
  }
  getHelperNode() {
    const marginsNode = MarginLayoutCell.createHelperNode(this.constraint.displayedCells, this.constraint.layoutBoundsProperty.value, cell => {
      let str = '';
      str += `row: ${cell.position.vertical}\n`;
      str += `column: ${cell.position.horizontal}\n`;
      if (cell.size.horizontal > 1) {
        str += `horizontalSpan: ${cell.size.horizontal}\n`;
      }
      if (cell.size.vertical > 1) {
        str += `verticalSpan: ${cell.size.vertical}\n`;
      }
      str += `xAlign: ${LayoutAlign.internalToAlign(Orientation.HORIZONTAL, cell.effectiveXAlign)}\n`;
      str += `yAlign: ${LayoutAlign.internalToAlign(Orientation.VERTICAL, cell.effectiveYAlign)}\n`;
      str += `xStretch: ${cell.effectiveXStretch}\n`;
      str += `yStretch: ${cell.effectiveYStretch}\n`;
      str += `xGrow: ${cell.effectiveXGrow}\n`;
      str += `yGrow: ${cell.effectiveYGrow}\n`;
      return str;
    });
    return marginsNode;
  }
}

/**
 * {Array.<string>} - String keys for all of the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */
GridBox.prototype._mutatorKeys = [...SIZABLE_OPTION_KEYS, ...GRIDBOX_OPTION_KEYS, ...Node.prototype._mutatorKeys];
scenery.register('GridBox', GridBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMiLCJvcHRpb25pemUiLCJPcmllbnRhdGlvbiIsIkdSSURfQ09OU1RSQUlOVF9PUFRJT05fS0VZUyIsIkdyaWRDZWxsIiwiR3JpZENvbnN0cmFpbnQiLCJMQVlPVVRfTk9ERV9PUFRJT05fS0VZUyIsIkxheW91dEFsaWduIiwiTGF5b3V0Tm9kZSIsIk1hcmdpbkxheW91dENlbGwiLCJOb2RlIiwiUkVRVUlSRVNfQk9VTkRTX09QVElPTl9LRVlTIiwic2NlbmVyeSIsIlNJWkFCTEVfT1BUSU9OX0tFWVMiLCJHUklEQk9YX09QVElPTl9LRVlTIiwiZmlsdGVyIiwia2V5IiwiR3JpZEJveCIsIl9jZWxsTWFwIiwiTWFwIiwiX2F1dG9Sb3dzIiwiX2F1dG9Db2x1bW5zIiwiX2F1dG9Mb2NrQ291bnQiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwicmVzaXplIiwiX2NvbnN0cmFpbnQiLCJwcmVmZXJyZWRXaWR0aFByb3BlcnR5IiwibG9jYWxQcmVmZXJyZWRXaWR0aFByb3BlcnR5IiwicHJlZmVycmVkSGVpZ2h0UHJvcGVydHkiLCJsb2NhbFByZWZlcnJlZEhlaWdodFByb3BlcnR5IiwibWluaW11bVdpZHRoUHJvcGVydHkiLCJsb2NhbE1pbmltdW1XaWR0aFByb3BlcnR5IiwibWluaW11bUhlaWdodFByb3BlcnR5IiwibG9jYWxNaW5pbXVtSGVpZ2h0UHJvcGVydHkiLCJsYXlvdXRPcmlnaW5Qcm9wZXJ0eSIsImV4Y2x1ZGVJbnZpc2libGUiLCJvbkNoaWxkSW5zZXJ0ZWQiLCJvbkdyaWRCb3hDaGlsZEluc2VydGVkIiwiYmluZCIsIm9uQ2hpbGRSZW1vdmVkIiwib25HcmlkQm94Q2hpbGRSZW1vdmVkIiwib25DaGlsZFZpc2liaWxpdHlUb2dnbGVkIiwidXBkYXRlQWxsQXV0b0xpbmVzIiwiY2hpbGRJbnNlcnRlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImNoaWxkUmVtb3ZlZEVtaXR0ZXIiLCJub25Cb3VuZHNPcHRpb25zIiwiXyIsIm9taXQiLCJib3VuZHNPcHRpb25zIiwicGljayIsImxvY2siLCJtdXRhdGUiLCJ1bmxvY2siLCJ1cGRhdGVMYXlvdXQiLCJsaW5rTGF5b3V0Qm91bmRzIiwic2V0TGluZXMiLCJvcmllbnRhdGlvbiIsImxpbmVBcnJheXMiLCJjaGlsZHJlbiIsImkiLCJsZW5ndGgiLCJsaW5lQXJyYXkiLCJqIiwiaXRlbSIsInB1c2giLCJtdXRhdGVMYXlvdXRPcHRpb25zIiwibGluZSIsIm9wcG9zaXRlIiwiZ2V0TGluZXMiLCJjZWxsIiwidmFsdWVzIiwicG9zaXRpb24iLCJnZXQiLCJub2RlIiwicm93cyIsIlZFUlRJQ0FMIiwiY29sdW1ucyIsIkhPUklaT05UQUwiLCJnZXROb2RlQXQiLCJyb3ciLCJjb2x1bW4iLCJjb25zdHJhaW50IiwiZ2V0Q2VsbCIsImdldFJvd09mTm9kZSIsImFzc2VydCIsImluY2x1ZGVzIiwiZ2V0Q2VsbEZyb21Ob2RlIiwidmVydGljYWwiLCJnZXRDb2x1bW5PZk5vZGUiLCJob3Jpem9udGFsIiwiZ2V0Tm9kZXNJblJvdyIsImluZGV4IiwiZ2V0Q2VsbHMiLCJtYXAiLCJnZXROb2Rlc0luQ29sdW1uIiwiYWRkUm93IiwiYWRkQ29sdW1uIiwiaW5zZXJ0Um93Iiwic2xpY2UiLCJpbnNlcnRDb2x1bW4iLCJyZW1vdmVSb3ciLCJyZW1vdmVDb2x1bW4iLCJhdXRvUm93cyIsInZhbHVlIiwiaXNGaW5pdGUiLCJ1cGRhdGVBdXRvUm93cyIsImF1dG9Db2x1bW5zIiwidXBkYXRlQXV0b0NvbHVtbnMiLCJ1cGRhdGVBdXRvTGluZXMiLCJ1cGRhdGVkQ291bnQiLCJjaGlsZCIsImJvdW5kcyIsImlzVmFsaWQiLCJ2aXNpYmxlIiwiZm9yRWFjaCIsInByaW1hcnkiLCJzZWNvbmRhcnkiLCJNYXRoIiwiZmxvb3IiLCJ3aWR0aCIsImhlaWdodCIsImxheW91dE9wdGlvbnMiLCJob3Jpem9udGFsU3BhbiIsInZlcnRpY2FsU3BhbiIsInVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkiLCJzZXRDaGlsZHJlbiIsIm9sZENoaWxkcmVuIiwiZ2V0Q2hpbGRyZW4iLCJpc0VxdWFsIiwidmlzaWJsZVByb3BlcnR5IiwibGF6eUxpbmsiLCJjcmVhdGVMYXlvdXRQcm94eSIsInNldCIsImFkZENlbGwiLCJkZWxldGUiLCJyZW1vdmVDZWxsIiwiZGlzcG9zZSIsInVubGluayIsInNwYWNpbmciLCJ4U3BhY2luZyIsInlTcGFjaW5nIiwieEFsaWduIiwieUFsaWduIiwiZ3JvdyIsInhHcm93IiwieUdyb3ciLCJzdHJldGNoIiwieFN0cmV0Y2giLCJ5U3RyZXRjaCIsIm1hcmdpbiIsInhNYXJnaW4iLCJ5TWFyZ2luIiwibGVmdE1hcmdpbiIsInJpZ2h0TWFyZ2luIiwidG9wTWFyZ2luIiwiYm90dG9tTWFyZ2luIiwibWluQ29udGVudFdpZHRoIiwibWluQ29udGVudEhlaWdodCIsIm1heENvbnRlbnRXaWR0aCIsIm1heENvbnRlbnRIZWlnaHQiLCJzZXRFeGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwicmVtb3ZlTGlzdGVuZXIiLCJnZXRIZWxwZXJOb2RlIiwibWFyZ2luc05vZGUiLCJjcmVhdGVIZWxwZXJOb2RlIiwiZGlzcGxheWVkQ2VsbHMiLCJsYXlvdXRCb3VuZHNQcm9wZXJ0eSIsInN0ciIsInNpemUiLCJpbnRlcm5hbFRvQWxpZ24iLCJlZmZlY3RpdmVYQWxpZ24iLCJlZmZlY3RpdmVZQWxpZ24iLCJlZmZlY3RpdmVYU3RyZXRjaCIsImVmZmVjdGl2ZVlTdHJldGNoIiwiZWZmZWN0aXZlWEdyb3ciLCJlZmZlY3RpdmVZR3JvdyIsInByb3RvdHlwZSIsIl9tdXRhdG9yS2V5cyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR3JpZEJveC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBncmlkLWJhc2VkIGxheW91dCBjb250YWluZXIuXHJcbiAqXHJcbiAqIFNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjR3JpZEJveCBmb3IgZGV0YWlsc1xyXG4gKlxyXG4gKiBHcmlkQm94LW9ubHkgb3B0aW9uczpcclxuICogICAtIHJvd3MgKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjR3JpZEJveC1yb3dzKVxyXG4gKiAgIC0gY29sdW1ucyAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LWNvbHVtbnMpXHJcbiAqICAgLSBhdXRvUm93cyAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LWF1dG9MaW5lcylcclxuICogICAtIGF1dG9Db2x1bW5zIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtYXV0b0xpbmVzKVxyXG4gKiAgIC0gcmVzaXplIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtcmVzaXplKVxyXG4gKiAgIC0gc3BhY2luZyAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LXNwYWNpbmcpXHJcbiAqICAgLSB4U3BhY2luZyAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LXNwYWNpbmcpXHJcbiAqICAgLSB5U3BhY2luZyAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LXNwYWNpbmcpXHJcbiAqICAgLSBsYXlvdXRPcmlnaW4gKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjbGF5b3V0T3JpZ2luKVxyXG4gKlxyXG4gKiBHcmlkQm94IGFuZCBsYXlvdXRPcHRpb25zIG9wdGlvbnMgKGNhbiBiZSBzZXQgZWl0aGVyIGluIHRoZSBHcmlkQm94IGl0c2VsZiwgb3Igd2l0aGluIGl0cyBjaGlsZCBub2RlcycgbGF5b3V0T3B0aW9ucyk6XHJcbiAqICAgLSB4QWxpZ24gKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjR3JpZEJveC1hbGlnbilcclxuICogICAtIHlBbGlnbiAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LWFsaWduKVxyXG4gKiAgIC0gc3RyZXRjaCAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LXN0cmV0Y2gpXHJcbiAqICAgLSB4U3RyZXRjaCAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LXN0cmV0Y2gpXHJcbiAqICAgLSB5U3RyZXRjaCAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LXN0cmV0Y2gpXHJcbiAqICAgLSBncm93IChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtZ3JvdylcclxuICogICAtIHhHcm93IChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtZ3JvdylcclxuICogICAtIHlHcm93IChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtZ3JvdylcclxuICogICAtIG1hcmdpbiAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LW1hcmdpbnMpXHJcbiAqICAgLSB4TWFyZ2luIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtbWFyZ2lucylcclxuICogICAtIHlNYXJnaW4gKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjR3JpZEJveC1tYXJnaW5zKVxyXG4gKiAgIC0gbGVmdE1hcmdpbiAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LW1hcmdpbnMpXHJcbiAqICAgLSByaWdodE1hcmdpbiAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LW1hcmdpbnMpXHJcbiAqICAgLSB0b3BNYXJnaW4gKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjR3JpZEJveC1tYXJnaW5zKVxyXG4gKiAgIC0gYm90dG9tTWFyZ2luIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtbWFyZ2lucylcclxuICogICAtIG1pbkNvbnRlbnRXaWR0aCAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LW1pbkNvbnRlbnQpXHJcbiAqICAgLSBtaW5Db250ZW50SGVpZ2h0IChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtbWluQ29udGVudClcclxuICogICAtIG1heENvbnRlbnRXaWR0aCAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LW1heENvbnRlbnQpXHJcbiAqICAgLSBtYXhDb250ZW50SGVpZ2h0IChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtbWF4Q29udGVudClcclxuICpcclxuICogbGF5b3V0T3B0aW9ucy1vbmx5IG9wdGlvbnMgKGNhbiBvbmx5IGJlIHNldCB3aXRoaW4gdGhlIGNoaWxkIG5vZGVzJyBsYXlvdXRPcHRpb25zLCBOT1QgYXZhaWxhYmxlIG9uIEdyaWRCb3gpOlxyXG4gKiAgIC0geCAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LWxheW91dE9wdGlvbnMtbG9jYXRpb24pXHJcbiAqICAgLSB5IChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtbGF5b3V0T3B0aW9ucy1sb2NhdGlvbilcclxuICogICAtIGhvcml6b250YWxTcGFuIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtbGF5b3V0T3B0aW9ucy1zaXplKVxyXG4gKiAgIC0gdmVydGljYWxTcGFuIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtbGF5b3V0T3B0aW9ucy1zaXplKVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcclxuaW1wb3J0IHsgR1JJRF9DT05TVFJBSU5UX09QVElPTl9LRVlTLCBHcmlkQ2VsbCwgR3JpZENvbnN0cmFpbnQsIEdyaWRDb25zdHJhaW50T3B0aW9ucywgSG9yaXpvbnRhbExheW91dEFsaWduLCBMQVlPVVRfTk9ERV9PUFRJT05fS0VZUywgTGF5b3V0QWxpZ24sIExheW91dE5vZGUsIExheW91dE5vZGVPcHRpb25zLCBNYXJnaW5MYXlvdXRDZWxsLCBOb2RlLCBSRVFVSVJFU19CT1VORFNfT1BUSU9OX0tFWVMsIHNjZW5lcnksIFNJWkFCTEVfT1BUSU9OX0tFWVMsIFZlcnRpY2FsTGF5b3V0QWxpZ24gfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcclxuXHJcbi8vIEdyaWRCb3gtc3BlY2lmaWMgb3B0aW9ucyB0aGF0IGNhbiBiZSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yIG9yIG11dGF0ZSgpIGNhbGwuXHJcbmNvbnN0IEdSSURCT1hfT1BUSU9OX0tFWVMgPSBbXHJcbiAgLi4uTEFZT1VUX05PREVfT1BUSU9OX0tFWVMsXHJcbiAgLi4uR1JJRF9DT05TVFJBSU5UX09QVElPTl9LRVlTLmZpbHRlcigga2V5ID0+IGtleSAhPT0gJ2V4Y2x1ZGVJbnZpc2libGUnICksXHJcbiAgJ3Jvd3MnLFxyXG4gICdjb2x1bW5zJyxcclxuICAnYXV0b1Jvd3MnLFxyXG4gICdhdXRvQ29sdW1ucydcclxuXTtcclxuXHJcbi8vIFVzZWQgZm9yIHNldHRpbmcvZ2V0dGluZyByb3dzL2NvbHVtbnNcclxudHlwZSBMaW5lQXJyYXkgPSAoIE5vZGUgfCBudWxsIClbXTtcclxudHlwZSBMaW5lQXJyYXlzID0gTGluZUFycmF5W107XHJcblxyXG50eXBlIEdyaWRDb25zdHJhaW50RXhjbHVkZWRPcHRpb25zID0gJ2V4Y2x1ZGVJbnZpc2libGUnIHwgJ3ByZWZlcnJlZFdpZHRoUHJvcGVydHknIHwgJ3ByZWZlcnJlZEhlaWdodFByb3BlcnR5JyB8ICdtaW5pbXVtV2lkdGhQcm9wZXJ0eScgfCAnbWluaW11bUhlaWdodFByb3BlcnR5JyB8ICdsYXlvdXRPcmlnaW5Qcm9wZXJ0eSc7XHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgLy8gQ29udHJvbHMgd2hldGhlciB0aGUgR3JpZEJveCB3aWxsIHJlLXRyaWdnZXIgbGF5b3V0IGF1dG9tYXRpY2FsbHkgYWZ0ZXIgdGhlIFwiZmlyc3RcIiBsYXlvdXQgZHVyaW5nIGNvbnN0cnVjdGlvbi5cclxuICAvLyBUaGUgR3JpZEJveCB3aWxsIGxheW91dCBvbmNlIGFmdGVyIHByb2Nlc3NpbmcgdGhlIG9wdGlvbnMgb2JqZWN0LCBidXQgaWYgcmVzaXplOmZhbHNlLCB0aGVuIGFmdGVyIHRoYXQgbWFudWFsXHJcbiAgLy8gbGF5b3V0IGNhbGxzIHdpbGwgbmVlZCB0byBiZSBkb25lICh3aXRoIHVwZGF0ZUxheW91dCgpKVxyXG4gIHJlc2l6ZT86IGJvb2xlYW47XHJcblxyXG4gIC8vIFNldHMgdGhlIGNoaWxkcmVuIG9mIHRoZSBHcmlkQm94IGFuZCBwb3NpdGlvbnMgdGhlbSB1c2luZyBhIDItZGltZW5zaW9uYWwgYXJyYXkgb2YgTm9kZXxudWxsIChudWxsIGlzIGEgcGxhY2Vob2xkZXJcclxuICAvLyBhbmQgZG9lcyBub3RoaW5nKS4gVGhlIGZpcnN0IGluZGV4IGlzIHRyZWF0ZWQgYXMgYSByb3csIGFuZCB0aGUgc2Vjb25kIGlzIHRyZWF0ZWQgYXMgYSBjb2x1bW4sIHNvIHRoYXQ6XHJcbiAgLy9cclxuICAvLyAgIHJvd3NbIHJvdyBdWyBjb2x1bW4gXSA9IE5vZGVcclxuICAvLyAgIHJvd3NbIHkgXVsgeCBdID0gTm9kZVxyXG4gIC8vXHJcbiAgLy8gVGh1cyB0aGUgZm9sbG93aW5nIHdpbGwgaGF2ZSAyIHJvd3MgdGhhdCBoYXZlIDMgY29sdW1ucyBlYWNoOlxyXG4gIC8vICAgcm93czogWyBbIGEsIGIsIGMgXSwgWyBkLCBlLCBmIF0gXVxyXG4gIC8vXHJcbiAgLy8gTk9URTogVGhpcyB3aWxsIG11dGF0ZSB0aGUgbGF5b3V0T3B0aW9ucyBvZiB0aGUgTm9kZXMgdGhlbXNlbHZlcywgYW5kIHdpbGwgYWxzbyB3aXBlIG91dCBhbnkgZXhpc3RpbmcgY2hpbGRyZW4uXHJcbiAgLy8gTk9URTogRG9uJ3QgdXNlIHRoaXMgb3B0aW9uIHdpdGggZWl0aGVyIGBjaGlsZHJlbmAgb3IgYGNvbHVtbnNgIGFsc28gYmVpbmcgc2V0XHJcbiAgcm93cz86IExpbmVBcnJheXM7XHJcblxyXG4gIC8vIFNldHMgdGhlIGNoaWxkcmVuIG9mIHRoZSBHcmlkQm94IGFuZCBwb3NpdGlvbnMgdGhlbSB1c2luZyBhIDItZGltZW5zaW9uYWwgYXJyYXkgb2YgTm9kZXxudWxsIChudWxsIGlzIGEgcGxhY2Vob2xkZXJcclxuICAvLyBhbmQgZG9lcyBub3RoaW5nKS4gVGhlIGZpcnN0IGluZGV4IGlzIHRyZWF0ZWQgYXMgYSBjb2x1bW4sIGFuZCB0aGUgc2Vjb25kIGlzIHRyZWF0ZWQgYXMgYSByb3csIHNvIHRoYXQ6XHJcbiAgLy9cclxuICAvLyAgIGNvbHVtbnNbIGNvbHVtbiBdWyByb3cgXSA9IE5vZGVcclxuICAvLyAgIGNvbHVtbnNbIHggXVsgeSBdID0gTm9kZVxyXG4gIC8vXHJcbiAgLy8gVGh1cyB0aGUgZm9sbG93aW5nIHdpbGwgaGF2ZSAyIGNvbHVtbnMgdGhhdCBoYXZlIDMgcm93cyBlYWNoOlxyXG4gIC8vICAgY29sdW1uczogWyBbIGEsIGIsIGMgXSwgWyBkLCBlLCBmIF0gXVxyXG4gIC8vXHJcbiAgLy8gTk9URTogVGhpcyB3aWxsIG11dGF0ZSB0aGUgbGF5b3V0T3B0aW9ucyBvZiB0aGUgTm9kZXMgdGhlbXNlbHZlcywgYW5kIHdpbGwgYWxzbyB3aXBlIG91dCBhbnkgZXhpc3RpbmcgY2hpbGRyZW4uXHJcbiAgLy8gTk9URTogRG9uJ3QgdXNlIHRoaXMgb3B0aW9uIHdpdGggZWl0aGVyIGBjaGlsZHJlbmAgb3IgYHJvd3NgIGFsc28gYmVpbmcgc2V0XHJcbiAgY29sdW1ucz86IExpbmVBcnJheXM7XHJcblxyXG4gIC8vIFdoZW4gbm9uLW51bGwsIHRoZSBjZWxscyBvZiB0aGlzIGdyaWQgd2lsbCBiZSBwb3NpdGlvbmVkL3NpemVkIHRvIGJlIDF4MSBjZWxscywgZmlsbGluZyByb3dzIHVudGlsIGEgY29sdW1uIGhhc1xyXG4gIC8vIGBhdXRvUm93c2AgbnVtYmVyIG9mIHJvd3MsIHRoZW4gaXQgd2lsbCBnbyB0byB0aGUgbmV4dCBjb2x1bW4uIFRoaXMgc2hvdWxkIGdlbmVyYWxseSBiZSB1c2VkIHdpdGggYGNoaWxkcmVuYCBvclxyXG4gIC8vIGFkZGluZy9yZW1vdmluZyBjaGlsZHJlbiBpbiBub3JtYWwgd2F5cy5cclxuICAvLyBOT1RFOiBUaGlzIHNob3VsZCBiZSB1c2VkIHdpdGggdGhlIGBjaGlsZHJlbmAgb3B0aW9uIGFuZC9vciBhZGRpbmcgY2hpbGRyZW4gbWFudWFsbHkgKGFkZENoaWxkLCBldGMuKVxyXG4gIC8vIE5PVEU6IFRoaXMgc2hvdWxkIE5PVCBiZSB1c2VkIHdpdGggYXV0b0NvbHVtbnMgb3Igcm93cy9jb2x1bW5zLCBhcyB0aG9zZSBhbHNvIHNwZWNpZnkgY29vcmRpbmF0ZSBpbmZvcm1hdGlvblxyXG4gIC8vIE5PVEU6IFRoaXMgd2lsbCBvbmx5IGxheSBvdXQgY2hpbGRyZW4gd2l0aCB2YWxpZCBib3VuZHMsIGFuZCBpZiBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIGlzIHRydWUgdGhlbiBpdFxyXG4gIC8vIHdpbGwgQUxTTyBiZSBjb25zdHJhaW5lZCB0byBvbmx5IHZpc2libGUgY2hpbGRyZW4uIEl0IHdvbid0IGxlYXZlIGdhcHMgZm9yIGNoaWxkcmVuIHRoYXQgZG9uJ3QgbWVldCB0aGVzZVxyXG4gIC8vIGNvbnN0cmFpbnRzLlxyXG4gIGF1dG9Sb3dzPzogbnVtYmVyIHwgbnVsbDtcclxuXHJcbiAgLy8gV2hlbiBub24tbnVsbCwgdGhlIGNlbGxzIG9mIHRoaXMgZ3JpZCB3aWxsIGJlIHBvc2l0aW9uZWQvc2l6ZWQgdG8gYmUgMXgxIGNlbGxzLCBmaWxsaW5nIGNvbHVtbnMgdW50aWwgYSByb3cgaGFzXHJcbiAgLy8gYGF1dG9Db2x1bW5zYCBudW1iZXIgb2YgY29sdW1ucywgdGhlbiBpdCB3aWxsIGdvIHRvIHRoZSBuZXh0IHJvdy4gVGhpcyBzaG91bGQgZ2VuZXJhbGx5IGJlIHVzZWQgd2l0aCBgY2hpbGRyZW5gIG9yXHJcbiAgLy8gYWRkaW5nL3JlbW92aW5nIGNoaWxkcmVuIGluIG5vcm1hbCB3YXlzLlxyXG4gIC8vIE5PVEU6IFRoaXMgc2hvdWxkIGJlIHVzZWQgd2l0aCB0aGUgYGNoaWxkcmVuYCBvcHRpb24gYW5kL29yIGFkZGluZyBjaGlsZHJlbiBtYW51YWxseSAoYWRkQ2hpbGQsIGV0Yy4pXHJcbiAgLy8gTk9URTogVGhpcyBzaG91bGQgTk9UIGJlIHVzZWQgd2l0aCBhdXRvUm93cyBvciByb3dzL2NvbHVtbnMsIGFzIHRob3NlIGFsc28gc3BlY2lmeSBjb29yZGluYXRlIGluZm9ybWF0aW9uXHJcbiAgLy8gTk9URTogVGhpcyB3aWxsIG9ubHkgbGF5IG91dCBjaGlsZHJlbiB3aXRoIHZhbGlkIGJvdW5kcywgYW5kIGlmIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMgaXMgdHJ1ZSB0aGVuIGl0XHJcbiAgLy8gd2lsbCBBTFNPIGJlIGNvbnN0cmFpbmVkIHRvIG9ubHkgdmlzaWJsZSBjaGlsZHJlbi4gSXQgd29uJ3QgbGVhdmUgZ2FwcyBmb3IgY2hpbGRyZW4gdGhhdCBkb24ndCBtZWV0IHRoZXNlXHJcbiAgLy8gY29uc3RyYWludHMuXHJcbiAgYXV0b0NvbHVtbnM/OiBudW1iZXIgfCBudWxsO1xyXG59ICYgU3RyaWN0T21pdDxHcmlkQ29uc3RyYWludE9wdGlvbnMsIEdyaWRDb25zdHJhaW50RXhjbHVkZWRPcHRpb25zPjtcclxuXHJcbmV4cG9ydCB0eXBlIEdyaWRCb3hPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBMYXlvdXROb2RlT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyaWRCb3ggZXh0ZW5kcyBMYXlvdXROb2RlPEdyaWRDb25zdHJhaW50PiB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgX2NlbGxNYXA6IE1hcDxOb2RlLCBHcmlkQ2VsbD4gPSBuZXcgTWFwPE5vZGUsIEdyaWRDZWxsPigpO1xyXG5cclxuICAvLyBGb3IgaGFuZGxpbmcgYXV0by13cmFwcGluZyBmZWF0dXJlc1xyXG4gIHByaXZhdGUgX2F1dG9Sb3dzOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuICBwcml2YXRlIF9hdXRvQ29sdW1uczogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8vIFNvIHdlIGRvbid0IGtpbGwgcGVyZm9ybWFuY2Ugd2hpbGUgc2V0dGluZyBjaGlsZHJlbiB3aXRoIGF1dG9Sb3dzL2F1dG9Db2x1bW5zXHJcbiAgcHJpdmF0ZSBfYXV0b0xvY2tDb3VudCA9IDA7XHJcblxyXG4gIC8vIExpc3RlbmVycyB0aGF0IHdlJ2xsIG5lZWQgdG8gcmVtb3ZlXHJcbiAgcHJpdmF0ZSByZWFkb25seSBvbkNoaWxkSW5zZXJ0ZWQ6ICggbm9kZTogTm9kZSwgaW5kZXg6IG51bWJlciApID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBvbkNoaWxkUmVtb3ZlZDogKCBub2RlOiBOb2RlICkgPT4gdm9pZDtcclxuICBwcml2YXRlIHJlYWRvbmx5IG9uQ2hpbGRWaXNpYmlsaXR5VG9nZ2xlZDogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBHcmlkQm94T3B0aW9ucyApIHtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8R3JpZEJveE9wdGlvbnMsIFN0cmljdE9taXQ8U2VsZk9wdGlvbnMsIEV4Y2x1ZGU8a2V5b2YgR3JpZENvbnN0cmFpbnRPcHRpb25zLCBHcmlkQ29uc3RyYWludEV4Y2x1ZGVkT3B0aW9ucz4gfCAncm93cycgfCAnY29sdW1ucycgfCAnYXV0b1Jvd3MnIHwgJ2F1dG9Db2x1bW5zJz4sXHJcbiAgICAgIExheW91dE5vZGVPcHRpb25zPigpKCB7XHJcbiAgICAgIC8vIEFsbG93IGR5bmFtaWMgbGF5b3V0IGJ5IGRlZmF1bHQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzYwOFxyXG4gICAgICBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzOiB0cnVlLFxyXG5cclxuICAgICAgcmVzaXplOiB0cnVlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIHRoaXMuX2NvbnN0cmFpbnQgPSBuZXcgR3JpZENvbnN0cmFpbnQoIHRoaXMsIHtcclxuICAgICAgcHJlZmVycmVkV2lkdGhQcm9wZXJ0eTogdGhpcy5sb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHksXHJcbiAgICAgIHByZWZlcnJlZEhlaWdodFByb3BlcnR5OiB0aGlzLmxvY2FsUHJlZmVycmVkSGVpZ2h0UHJvcGVydHksXHJcbiAgICAgIG1pbmltdW1XaWR0aFByb3BlcnR5OiB0aGlzLmxvY2FsTWluaW11bVdpZHRoUHJvcGVydHksXHJcbiAgICAgIG1pbmltdW1IZWlnaHRQcm9wZXJ0eTogdGhpcy5sb2NhbE1pbmltdW1IZWlnaHRQcm9wZXJ0eSxcclxuICAgICAgbGF5b3V0T3JpZ2luUHJvcGVydHk6IHRoaXMubGF5b3V0T3JpZ2luUHJvcGVydHksXHJcblxyXG4gICAgICBleGNsdWRlSW52aXNpYmxlOiBmYWxzZSAvLyBTaG91bGQgYmUgaGFuZGxlZCBieSB0aGUgb3B0aW9ucyBtdXRhdGUgYmVsb3dcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm9uQ2hpbGRJbnNlcnRlZCA9IHRoaXMub25HcmlkQm94Q2hpbGRJbnNlcnRlZC5iaW5kKCB0aGlzICk7XHJcbiAgICB0aGlzLm9uQ2hpbGRSZW1vdmVkID0gdGhpcy5vbkdyaWRCb3hDaGlsZFJlbW92ZWQuYmluZCggdGhpcyApO1xyXG4gICAgdGhpcy5vbkNoaWxkVmlzaWJpbGl0eVRvZ2dsZWQgPSB0aGlzLnVwZGF0ZUFsbEF1dG9MaW5lcy5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgdGhpcy5jaGlsZEluc2VydGVkRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5vbkNoaWxkSW5zZXJ0ZWQgKTtcclxuICAgIHRoaXMuY2hpbGRSZW1vdmVkRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5vbkNoaWxkUmVtb3ZlZCApO1xyXG5cclxuICAgIGNvbnN0IG5vbkJvdW5kc09wdGlvbnMgPSBfLm9taXQoIG9wdGlvbnMsIFJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZUyApIGFzIExheW91dE5vZGVPcHRpb25zO1xyXG4gICAgY29uc3QgYm91bmRzT3B0aW9ucyA9IF8ucGljayggb3B0aW9ucywgUkVRVUlSRVNfQk9VTkRTX09QVElPTl9LRVlTICkgYXMgTGF5b3V0Tm9kZU9wdGlvbnM7XHJcblxyXG4gICAgLy8gQmVmb3JlIHdlIGxheW91dCwgZG8gbm9uLWJvdW5kcy1yZWxhdGVkIGNoYW5nZXMgKGluIGNhc2Ugd2UgaGF2ZSByZXNpemU6ZmFsc2UpLCBhbmQgcHJldmVudCBsYXlvdXQgZm9yXHJcbiAgICAvLyBwZXJmb3JtYW5jZSBnYWlucy5cclxuICAgIHRoaXMuX2NvbnN0cmFpbnQubG9jaygpO1xyXG4gICAgdGhpcy5tdXRhdGUoIG5vbkJvdW5kc09wdGlvbnMgKTtcclxuICAgIHRoaXMuX2NvbnN0cmFpbnQudW5sb2NrKCk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBsYXlvdXQgKHNvIHRoYXQgaXQgaXMgZG9uZSBvbmNlIGlmIHdlIGhhdmUgcmVzaXplOmZhbHNlKVxyXG4gICAgdGhpcy5fY29uc3RyYWludC51cGRhdGVMYXlvdXQoKTtcclxuXHJcbiAgICAvLyBBZnRlciB3ZSBoYXZlIG91ciBsb2NhbEJvdW5kcyBjb21wbGV0ZSwgbm93IHdlIGNhbiBtdXRhdGUgdGhpbmdzIHRoYXQgcmVseSBvbiBpdC5cclxuICAgIHRoaXMubXV0YXRlKCBib3VuZHNPcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5saW5rTGF5b3V0Qm91bmRzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBjaGlsZHJlbiBvZiB0aGUgR3JpZEJveCBhbmQgYWRqdXN0cyB0aGVtIHRvIGJlIHBvc2l0aW9uZWQgaW4gY2VydGFpbiBjZWxscy4gSXQgdGFrZXMgYSAyLWRpbWVuc2lvbmFsIGFycmF5XHJcbiAgICogb2YgTm9kZXxudWxsICh3aGVyZSBudWxsIGlzIGEgcGxhY2Vob2xkZXIgdGhhdCBkb2VzIG5vdGhpbmcpLlxyXG4gICAqXHJcbiAgICogRm9yIGVhY2ggY2VsbCwgdGhlIGZpcnN0IGluZGV4IGludG8gdGhlIGFycmF5IHdpbGwgYmUgdGFrZW4gYXMgdGhlIGNlbGwgcG9zaXRpb24gaW4gdGhlIHByb3ZpZGVkIG9yaWVudGF0aW9uLiBUaGVcclxuICAgKiBzZWNvbmQgaW5kZXggaW50byB0aGUgYXJyYXkgd2lsbCBiZSB0YWtlbiBhcyB0aGUgY2VsbCBwb3NpdGlvbiBpbiB0aGUgT1BQT1NJVEUgb3JpZW50YXRpb24uXHJcbiAgICpcclxuICAgKiBTZWUgR3JpZEJveC5yb3dzIG9yIEdyaWRCb3guY29sdW1ucyBmb3IgdXNhZ2VzIGFuZCBtb3JlIGRvY3VtZW50YXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIHNldExpbmVzKCBvcmllbnRhdGlvbjogT3JpZW50YXRpb24sIGxpbmVBcnJheXM6IExpbmVBcnJheXMgKTogdm9pZCB7XHJcbiAgICBjb25zdCBjaGlsZHJlbjogTm9kZVtdID0gW107XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGluZUFycmF5cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgbGluZUFycmF5ID0gbGluZUFycmF5c1sgaSBdO1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBsaW5lQXJyYXkubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgY29uc3QgaXRlbSA9IGxpbmVBcnJheVsgaiBdO1xyXG4gICAgICAgIGlmICggaXRlbSAhPT0gbnVsbCApIHtcclxuICAgICAgICAgIGNoaWxkcmVuLnB1c2goIGl0ZW0gKTtcclxuICAgICAgICAgIGl0ZW0ubXV0YXRlTGF5b3V0T3B0aW9ucygge1xyXG4gICAgICAgICAgICBbIG9yaWVudGF0aW9uLmxpbmUgXTogaSxcclxuICAgICAgICAgICAgWyBvcmllbnRhdGlvbi5vcHBvc2l0ZS5saW5lIF06IGpcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjaGlsZHJlbiBvZiB0aGUgR3JpZEJveCBpbiBhIDItZGltZW5zaW9uYWwgYXJyYXkgb2YgTm9kZXxudWxsICh3aGVyZSBudWxsIGlzIGEgcGxhY2Vob2xkZXIgdGhhdCBkb2VzXHJcbiAgICogbm90aGluZykuXHJcbiAgICpcclxuICAgKiBGb3IgZWFjaCBjZWxsLCB0aGUgZmlyc3QgaW5kZXggaW50byB0aGUgYXJyYXkgd2lsbCBiZSB0YWtlbiBhcyB0aGUgY2VsbCBwb3NpdGlvbiBpbiB0aGUgcHJvdmlkZWQgb3JpZW50YXRpb24uIFRoZVxyXG4gICAqIHNlY29uZCBpbmRleCBpbnRvIHRoZSBhcnJheSB3aWxsIGJlIHRha2VuIGFzIHRoZSBjZWxsIHBvc2l0aW9uIGluIHRoZSBPUFBPU0lURSBvcmllbnRhdGlvbi5cclxuICAgKlxyXG4gICAqIFNlZSBHcmlkQm94LnJvd3Mgb3IgR3JpZEJveC5jb2x1bW5zIGZvciB1c2FnZXNcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TGluZXMoIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiApOiBMaW5lQXJyYXlzIHtcclxuICAgIGNvbnN0IGxpbmVBcnJheXM6IExpbmVBcnJheXMgPSBbXTtcclxuXHJcbiAgICBmb3IgKCBjb25zdCBjZWxsIG9mIHRoaXMuX2NlbGxNYXAudmFsdWVzKCkgKSB7XHJcbiAgICAgIGNvbnN0IGkgPSBjZWxsLnBvc2l0aW9uLmdldCggb3JpZW50YXRpb24gKTtcclxuICAgICAgY29uc3QgaiA9IGNlbGwucG9zaXRpb24uZ2V0KCBvcmllbnRhdGlvbi5vcHBvc2l0ZSApO1xyXG5cclxuICAgICAgLy8gRW5zdXJlIHdlIGhhdmUgZW5vdWdoIGxpbmVzXHJcbiAgICAgIHdoaWxlICggbGluZUFycmF5cy5sZW5ndGggPCBpICsgMSApIHtcclxuICAgICAgICBsaW5lQXJyYXlzLnB1c2goIFtdICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG51bGwtcGFkIGxpbmVzXHJcbiAgICAgIHdoaWxlICggbGluZUFycmF5c1sgaSBdLmxlbmd0aCA8IGogKyAxICkge1xyXG4gICAgICAgIGxpbmVBcnJheXNbIGkgXS5wdXNoKCBudWxsICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEZpbmFsbHkgdGhlIGFjdHVhbCBub2RlIVxyXG4gICAgICBsaW5lQXJyYXlzWyBpIF1bIGogXSA9IGNlbGwubm9kZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbGluZUFycmF5cztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGNoaWxkcmVuIG9mIHRoZSBHcmlkQm94IGJ5IHNwZWNpZnlpbmcgYSB0d28tZGltZW5zaW9uYWwgYXJyYXkgb2YgTm9kZXMgKG9yIG51bGwgdmFsdWVzIGFzIHNwYWNlcnMpLlxyXG4gICAqIFRoZSBpbm5lciBhcnJheXMgd2lsbCBiZSB0aGUgcm93cyBvZiB0aGUgZ3JpZC5cclxuICAgKiBNdXRhdGVzIGxheW91dE9wdGlvbnMgb2YgdGhlIHByb3ZpZGVkIE5vZGVzLiBTZWUgc2V0TGluZXMoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgcm93cyggbGluZUFycmF5czogTGluZUFycmF5cyApIHtcclxuICAgIHRoaXMuc2V0TGluZXMoIE9yaWVudGF0aW9uLlZFUlRJQ0FMLCBsaW5lQXJyYXlzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgdHdvLWRpbWVuc2lvbmFsIGFycmF5IG9mIHRoZSBjaGlsZCBOb2RlcyAod2l0aCBudWxsIGFzIGEgc3BhY2VyKSB3aGVyZSB0aGUgaW5uZXIgYXJyYXlzIGFyZSB0aGUgcm93cy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHJvd3MoKTogTGluZUFycmF5cyB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRMaW5lcyggT3JpZW50YXRpb24uVkVSVElDQUwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGNoaWxkcmVuIG9mIHRoZSBHcmlkQm94IGJ5IHNwZWNpZnlpbmcgYSB0d28tZGltZW5zaW9uYWwgYXJyYXkgb2YgTm9kZXMgKG9yIG51bGwgdmFsdWVzIGFzIHNwYWNlcnMpLlxyXG4gICAqIFRoZSBpbm5lciBhcnJheXMgd2lsbCBiZSB0aGUgY29sdW1ucyBvZiB0aGUgZ3JpZC5cclxuICAgKiAqIE11dGF0ZXMgbGF5b3V0T3B0aW9ucyBvZiB0aGUgcHJvdmlkZWQgTm9kZXMuIFNlZSBzZXRMaW5lcygpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBjb2x1bW5zKCBsaW5lQXJyYXlzOiBMaW5lQXJyYXlzICkge1xyXG4gICAgdGhpcy5zZXRMaW5lcyggT3JpZW50YXRpb24uSE9SSVpPTlRBTCwgbGluZUFycmF5cyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHR3by1kaW1lbnNpb25hbCBhcnJheSBvZiB0aGUgY2hpbGQgTm9kZXMgKHdpdGggbnVsbCBhcyBhIHNwYWNlcikgd2hlcmUgdGhlIGlubmVyIGFycmF5cyBhcmUgdGhlIGNvbHVtbnMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBjb2x1bW5zKCk6IExpbmVBcnJheXMge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TGluZXMoIE9yaWVudGF0aW9uLkhPUklaT05UQUwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIE5vZGUgYXQgYSBzcGVjaWZpYyByb3cvY29sdW1uIGludGVyc2VjdGlvbiAob3IgbnVsbCBpZiB0aGVyZSBhcmUgbm9uZSlcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Tm9kZUF0KCByb3c6IG51bWJlciwgY29sdW1uOiBudW1iZXIgKTogTm9kZSB8IG51bGwge1xyXG4gICAgY29uc3QgY2VsbCA9IHRoaXMuY29uc3RyYWludC5nZXRDZWxsKCByb3csIGNvbHVtbiApO1xyXG5cclxuICAgIHJldHVybiBjZWxsID8gY2VsbC5ub2RlIDogbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHJvdyBpbmRleCBvZiBhIGNoaWxkIE5vZGUgKG9yIGlmIGl0IHNwYW5zIG11bHRpcGxlIHJvd3MsIHRoZSBmaXJzdCByb3cpXHJcbiAgICovXHJcbiAgcHVibGljIGdldFJvd09mTm9kZSggbm9kZTogTm9kZSApOiBudW1iZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5jaGlsZHJlbi5pbmNsdWRlcyggbm9kZSApICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuY29uc3RyYWludC5nZXRDZWxsRnJvbU5vZGUoIG5vZGUgKSEucG9zaXRpb24udmVydGljYWw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjb2x1bW4gaW5kZXggb2YgYSBjaGlsZCBOb2RlIChvciBpZiBpdCBzcGFucyBtdWx0aXBsZSBjb2x1bW5zLCB0aGUgZmlyc3Qgcm93KVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDb2x1bW5PZk5vZGUoIG5vZGU6IE5vZGUgKTogbnVtYmVyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY2hpbGRyZW4uaW5jbHVkZXMoIG5vZGUgKSApO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmNvbnN0cmFpbnQuZ2V0Q2VsbEZyb21Ob2RlKCBub2RlICkhLnBvc2l0aW9uLmhvcml6b250YWw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFsbCB0aGUgTm9kZXMgaW4gYSBnaXZlbiByb3cgKGJ5IGluZGV4KVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXROb2Rlc0luUm93KCBpbmRleDogbnVtYmVyICk6IE5vZGVbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5jb25zdHJhaW50LmdldENlbGxzKCBPcmllbnRhdGlvbi5WRVJUSUNBTCwgaW5kZXggKS5tYXAoIGNlbGwgPT4gY2VsbC5ub2RlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFsbCB0aGUgTm9kZXMgaW4gYSBnaXZlbiBjb2x1bW4gKGJ5IGluZGV4KVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXROb2Rlc0luQ29sdW1uKCBpbmRleDogbnVtYmVyICk6IE5vZGVbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5jb25zdHJhaW50LmdldENlbGxzKCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMLCBpbmRleCApLm1hcCggY2VsbCA9PiBjZWxsLm5vZGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYW4gYXJyYXkgb2YgY2hpbGQgTm9kZXMgKHdpdGggbnVsbCBhbGxvd2VkIGFzIGVtcHR5IHNwYWNlcnMpIGF0IHRoZSBib3R0b20gb2YgYWxsIGV4aXN0aW5nIHJvd3MuXHJcbiAgICovXHJcbiAgcHVibGljIGFkZFJvdyggcm93OiBMaW5lQXJyYXkgKTogdGhpcyB7XHJcblxyXG4gICAgdGhpcy5yb3dzID0gWyAuLi50aGlzLnJvd3MsIHJvdyBdO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhbiBhcnJheSBvZiBjaGlsZCBOb2RlcyAod2l0aCBudWxsIGFsbG93ZWQgYXMgZW1wdHkgc3BhY2VycykgYXQgdGhlIHJpZ2h0IG9mIGFsbCBleGlzdGluZyBjb2x1bW5zLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRDb2x1bW4oIGNvbHVtbjogTGluZUFycmF5ICk6IHRoaXMge1xyXG5cclxuICAgIHRoaXMuY29sdW1ucyA9IFsgLi4udGhpcy5jb2x1bW5zLCBjb2x1bW4gXTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluc2VydHMgYSByb3cgb2YgY2hpbGQgTm9kZXMgYXQgYSBnaXZlbiByb3cgaW5kZXggKHNlZSBhZGRSb3cgZm9yIG1vcmUgaW5mb3JtYXRpb24pXHJcbiAgICovXHJcbiAgcHVibGljIGluc2VydFJvdyggaW5kZXg6IG51bWJlciwgcm93OiBMaW5lQXJyYXkgKTogdGhpcyB7XHJcblxyXG4gICAgdGhpcy5yb3dzID0gWyAuLi50aGlzLnJvd3Muc2xpY2UoIDAsIGluZGV4ICksIHJvdywgLi4udGhpcy5yb3dzLnNsaWNlKCBpbmRleCApIF07XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnNlcnRzIGEgY29sdW1uIG9mIGNoaWxkIE5vZGVzIGF0IGEgZ2l2ZW4gY29sdW1uIGluZGV4IChzZWUgYWRkQ29sdW1uIGZvciBtb3JlIGluZm9ybWF0aW9uKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBpbnNlcnRDb2x1bW4oIGluZGV4OiBudW1iZXIsIGNvbHVtbjogTGluZUFycmF5ICk6IHRoaXMge1xyXG5cclxuICAgIHRoaXMuY29sdW1ucyA9IFsgLi4udGhpcy5jb2x1bW5zLnNsaWNlKCAwLCBpbmRleCApLCBjb2x1bW4sIC4uLnRoaXMuY29sdW1ucy5zbGljZSggaW5kZXggKSBdO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhbGwgY2hpbGQgTm9kZXMgaW4gYSBnaXZlbiByb3dcclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlUm93KCBpbmRleDogbnVtYmVyICk6IHRoaXMge1xyXG5cclxuICAgIHRoaXMucm93cyA9IFsgLi4udGhpcy5yb3dzLnNsaWNlKCAwLCBpbmRleCApLCAuLi50aGlzLnJvd3Muc2xpY2UoIGluZGV4ICsgMSApIF07XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGFsbCBjaGlsZCBOb2RlcyBpbiBhIGdpdmVuIGNvbHVtblxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVDb2x1bW4oIGluZGV4OiBudW1iZXIgKTogdGhpcyB7XHJcblxyXG4gICAgdGhpcy5jb2x1bW5zID0gWyAuLi50aGlzLmNvbHVtbnMuc2xpY2UoIDAsIGluZGV4ICksIC4uLnRoaXMuY29sdW1ucy5zbGljZSggaW5kZXggKyAxICkgXTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgYXV0b1Jvd3MoIHZhbHVlOiBudW1iZXIgfCBudWxsICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmFsdWUgPT09IG51bGwgfHwgKCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB2YWx1ZSApICYmIHZhbHVlID49IDEgKSApO1xyXG5cclxuICAgIGlmICggdGhpcy5fYXV0b1Jvd3MgIT09IHZhbHVlICkge1xyXG4gICAgICB0aGlzLl9hdXRvUm93cyA9IHZhbHVlO1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVBdXRvUm93cygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBhdXRvUm93cygpOiBudW1iZXIgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9hdXRvUm93cztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgYXV0b0NvbHVtbnMoIHZhbHVlOiBudW1iZXIgfCBudWxsICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmFsdWUgPT09IG51bGwgfHwgKCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB2YWx1ZSApICYmIHZhbHVlID49IDEgKSApO1xyXG5cclxuICAgIGlmICggdGhpcy5fYXV0b0NvbHVtbnMgIT09IHZhbHVlICkge1xyXG4gICAgICB0aGlzLl9hdXRvQ29sdW1ucyA9IHZhbHVlO1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVBdXRvQ29sdW1ucygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBhdXRvQ29sdW1ucygpOiBudW1iZXIgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9hdXRvQ29sdW1ucztcclxuICB9XHJcblxyXG4gIC8vIFVzZWQgZm9yIGF1dG9Sb3dzL2F1dG9Db2x1bW5zXHJcbiAgcHJpdmF0ZSB1cGRhdGVBdXRvTGluZXMoIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiwgdmFsdWU6IG51bWJlciB8IG51bGwgKTogdm9pZCB7XHJcbiAgICBpZiAoIHZhbHVlICE9PSBudWxsICYmIHRoaXMuX2F1dG9Mb2NrQ291bnQgPT09IDAgKSB7XHJcbiAgICAgIGxldCB1cGRhdGVkQ291bnQgPSAwO1xyXG5cclxuICAgICAgdGhpcy5jb25zdHJhaW50LmxvY2soKTtcclxuXHJcbiAgICAgIHRoaXMuY2hpbGRyZW4uZmlsdGVyKCBjaGlsZCA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGNoaWxkLmJvdW5kcy5pc1ZhbGlkKCkgJiYgKCAhdGhpcy5fY29uc3RyYWludC5leGNsdWRlSW52aXNpYmxlIHx8IGNoaWxkLnZpc2libGUgKTtcclxuICAgICAgfSApLmZvckVhY2goICggY2hpbGQsIGluZGV4ICkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHByaW1hcnkgPSBpbmRleCAlIHZhbHVlO1xyXG4gICAgICAgIGNvbnN0IHNlY29uZGFyeSA9IE1hdGguZmxvb3IoIGluZGV4IC8gdmFsdWUgKTtcclxuICAgICAgICBjb25zdCB3aWR0aCA9IDE7XHJcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gMTtcclxuXHJcbiAgICAgICAgLy8gV2UgZ3VhcmQgdG8gc2VlIGlmIHdlIGFjdHVhbGx5IGhhdmUgdG8gdXBkYXRlIGFueXRoaW5nIChzbyB3ZSBjYW4gYXZvaWQgdHJpZ2dlcmluZyBhbiBhdXRvLWxheW91dClcclxuICAgICAgICBpZiAoICFjaGlsZC5sYXlvdXRPcHRpb25zIHx8XHJcbiAgICAgICAgICAgICBjaGlsZC5sYXlvdXRPcHRpb25zWyBvcmllbnRhdGlvbi5saW5lIF0gIT09IHByaW1hcnkgfHxcclxuICAgICAgICAgICAgIGNoaWxkLmxheW91dE9wdGlvbnNbIG9yaWVudGF0aW9uLm9wcG9zaXRlLmxpbmUgXSAhPT0gc2Vjb25kYXJ5IHx8XHJcbiAgICAgICAgICAgICBjaGlsZC5sYXlvdXRPcHRpb25zLmhvcml6b250YWxTcGFuICE9PSB3aWR0aCB8fFxyXG4gICAgICAgICAgICAgY2hpbGQubGF5b3V0T3B0aW9ucy52ZXJ0aWNhbFNwYW4gIT09IGhlaWdodFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgdXBkYXRlZENvdW50Kys7XHJcbiAgICAgICAgICBjaGlsZC5tdXRhdGVMYXlvdXRPcHRpb25zKCB7XHJcbiAgICAgICAgICAgIFsgb3JpZW50YXRpb24ubGluZSBdOiBpbmRleCAlIHZhbHVlLFxyXG4gICAgICAgICAgICBbIG9yaWVudGF0aW9uLm9wcG9zaXRlLmxpbmUgXTogTWF0aC5mbG9vciggaW5kZXggLyB2YWx1ZSApLFxyXG4gICAgICAgICAgICBob3Jpem9udGFsU3BhbjogMSxcclxuICAgICAgICAgICAgdmVydGljYWxTcGFuOiAxXHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgdGhpcy5jb25zdHJhaW50LnVubG9jaygpO1xyXG5cclxuICAgICAgLy8gT25seSB0cmlnZ2VyIGFuIGF1dG9tYXRpYyBsYXlvdXQgSUYgd2UgYWN0dWFsbHkgYWRqdXN0ZWQgc29tZXRoaW5nLlxyXG4gICAgICBpZiAoIHVwZGF0ZWRDb3VudCA+IDAgKSB7XHJcbiAgICAgICAgdGhpcy5jb25zdHJhaW50LnVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVBdXRvUm93cygpOiB2b2lkIHtcclxuICAgIHRoaXMudXBkYXRlQXV0b0xpbmVzKCBPcmllbnRhdGlvbi5WRVJUSUNBTCwgdGhpcy5hdXRvUm93cyApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVBdXRvQ29sdW1ucygpOiB2b2lkIHtcclxuICAgIHRoaXMudXBkYXRlQXV0b0xpbmVzKCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMLCB0aGlzLmF1dG9Db2x1bW5zICk7XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGVzIHJvd3Mgb3IgY29sdW1ucywgd2hpY2hldmVyIGlzIGFjdGl2ZSBhdCB0aGUgbW9tZW50IChpZiBhbnkpXHJcbiAgcHJpdmF0ZSB1cGRhdGVBbGxBdXRvTGluZXMoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9hdXRvUm93cyA9PT0gbnVsbCB8fCB0aGlzLl9hdXRvQ29sdW1ucyA9PT0gbnVsbCxcclxuICAgICAgJ2F1dG9Sb3dzIGFuZCBhdXRvQ29sdW1ucyBzaG91bGQgbm90IGJvdGggYmUgc2V0IHdoZW4gdXBkYXRpbmcgY2hpbGRyZW4nICk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVBdXRvUm93cygpO1xyXG4gICAgdGhpcy51cGRhdGVBdXRvQ29sdW1ucygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIHNldENoaWxkcmVuKCBjaGlsZHJlbjogTm9kZVtdICk6IHRoaXMge1xyXG5cclxuICAgIGNvbnN0IG9sZENoaWxkcmVuID0gdGhpcy5nZXRDaGlsZHJlbigpOyAvLyBkZWZlbnNpdmUgY29weVxyXG5cclxuICAgIC8vIERvbid0IHVwZGF0ZSBhdXRvUm93cy9hdXRvQ29sdW1ucyBzZXR0aW5ncyB3aGlsZSBzZXR0aW5nIGNoaWxkcmVuLCB3YWl0IHVudGlsIGFmdGVyIGZvciBwZXJmb3JtYW5jZVxyXG4gICAgdGhpcy5fYXV0b0xvY2tDb3VudCsrO1xyXG4gICAgc3VwZXIuc2V0Q2hpbGRyZW4oIGNoaWxkcmVuICk7XHJcbiAgICB0aGlzLl9hdXRvTG9ja0NvdW50LS07XHJcblxyXG4gICAgaWYgKCAhXy5pc0VxdWFsKCBvbGRDaGlsZHJlbiwgY2hpbGRyZW4gKSApIHtcclxuICAgICAgdGhpcy51cGRhdGVBbGxBdXRvTGluZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGEgY2hpbGQgaXMgaW5zZXJ0ZWQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvbkdyaWRCb3hDaGlsZEluc2VydGVkKCBub2RlOiBOb2RlLCBpbmRleDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgbm9kZS52aXNpYmxlUHJvcGVydHkubGF6eUxpbmsoIHRoaXMub25DaGlsZFZpc2liaWxpdHlUb2dnbGVkICk7XHJcblxyXG4gICAgY29uc3QgY2VsbCA9IG5ldyBHcmlkQ2VsbCggdGhpcy5fY29uc3RyYWludCwgbm9kZSwgdGhpcy5fY29uc3RyYWludC5jcmVhdGVMYXlvdXRQcm94eSggbm9kZSApICk7XHJcbiAgICB0aGlzLl9jZWxsTWFwLnNldCggbm9kZSwgY2VsbCApO1xyXG5cclxuICAgIHRoaXMuX2NvbnN0cmFpbnQuYWRkQ2VsbCggY2VsbCApO1xyXG5cclxuICAgIHRoaXMudXBkYXRlQWxsQXV0b0xpbmVzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIGNoaWxkIGlzIHJlbW92ZWQuXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIGlzIE5PVCBjYWxsZWQgb24gZGlzcG9zYWwuIEFueSBhZGRpdGlvbmFsIGNsZWFudXAgKHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzKSBzaG91bGQgYmUgaW5jbHVkZWQgaW4gdGhlXHJcbiAgICogZGlzcG9zZSgpIGZ1bmN0aW9uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvbkdyaWRCb3hDaGlsZFJlbW92ZWQoIG5vZGU6IE5vZGUgKTogdm9pZCB7XHJcblxyXG4gICAgY29uc3QgY2VsbCA9IHRoaXMuX2NlbGxNYXAuZ2V0KCBub2RlICkhO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2VsbCApO1xyXG5cclxuICAgIHRoaXMuX2NlbGxNYXAuZGVsZXRlKCBub2RlICk7XHJcblxyXG4gICAgdGhpcy5fY29uc3RyYWludC5yZW1vdmVDZWxsKCBjZWxsICk7XHJcblxyXG4gICAgY2VsbC5kaXNwb3NlKCk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVBbGxBdXRvTGluZXMoKTtcclxuXHJcbiAgICBub2RlLnZpc2libGVQcm9wZXJ0eS51bmxpbmsoIHRoaXMub25DaGlsZFZpc2liaWxpdHlUb2dnbGVkICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgbXV0YXRlKCBvcHRpb25zPzogR3JpZEJveE9wdGlvbnMgKTogdGhpcyB7XHJcbiAgICAvLyBjaGlsZHJlbiBjYW4gYmUgdXNlZCB3aXRoIG9uZSBvZiBhdXRvUm93cy9hdXRvQ29sdW1ucywgYnV0IG90aGVyd2lzZSB0aGVzZSBvcHRpb25zIGFyZSBleGNsdXNpdmVcclxuICAgIGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyggb3B0aW9ucywgWyAncm93cycgXSwgWyAnY29sdW1ucycgXSwgWyAnY2hpbGRyZW4nLCAnYXV0b1Jvd3MnLCAnYXV0b0NvbHVtbnMnIF0gKTtcclxuICAgIGlmICggb3B0aW9ucyApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG9wdGlvbnMuYXV0b1Jvd3MgIT09ICdudW1iZXInIHx8IHR5cGVvZiBvcHRpb25zLmF1dG9Db2x1bW5zICE9PSAnbnVtYmVyJyxcclxuICAgICAgICAnYXV0b1Jvd3MgYW5kIGF1dG9Db2x1bW5zIHNob3VsZCBub3QgYmUgc3BlY2lmaWVkIGJvdGggYXMgbm9uLW51bGwgYXQgdGhlIHNhbWUgdGltZScgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc3VwZXIubXV0YXRlKCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHNwYWNpbmcoKTogbnVtYmVyIHwgbnVtYmVyW10ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQuc3BhY2luZztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgc3BhY2luZyggdmFsdWU6IG51bWJlciB8IG51bWJlcltdICkge1xyXG4gICAgdGhpcy5fY29uc3RyYWludC5zcGFjaW5nID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHhTcGFjaW5nKCk6IG51bWJlciB8IG51bWJlcltdIHtcclxuICAgIHJldHVybiB0aGlzLl9jb25zdHJhaW50LnhTcGFjaW5nO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCB4U3BhY2luZyggdmFsdWU6IG51bWJlciB8IG51bWJlcltdICkge1xyXG4gICAgdGhpcy5fY29uc3RyYWludC54U3BhY2luZyA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCB5U3BhY2luZygpOiBudW1iZXIgfCBudW1iZXJbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC55U3BhY2luZztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgeVNwYWNpbmcoIHZhbHVlOiBudW1iZXIgfCBudW1iZXJbXSApIHtcclxuICAgIHRoaXMuX2NvbnN0cmFpbnQueVNwYWNpbmcgPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgeEFsaWduKCk6IEhvcml6b250YWxMYXlvdXRBbGlnbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC54QWxpZ24hO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCB4QWxpZ24oIHZhbHVlOiBIb3Jpem9udGFsTGF5b3V0QWxpZ24gKSB7XHJcbiAgICB0aGlzLl9jb25zdHJhaW50LnhBbGlnbiA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCB5QWxpZ24oKTogVmVydGljYWxMYXlvdXRBbGlnbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC55QWxpZ24hO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCB5QWxpZ24oIHZhbHVlOiBWZXJ0aWNhbExheW91dEFsaWduICkge1xyXG4gICAgdGhpcy5fY29uc3RyYWludC55QWxpZ24gPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZ3JvdygpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQuZ3JvdyE7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGdyb3coIHZhbHVlOiBudW1iZXIgKSB7XHJcbiAgICB0aGlzLl9jb25zdHJhaW50Lmdyb3cgPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgeEdyb3coKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9jb25zdHJhaW50LnhHcm93ITtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgeEdyb3coIHZhbHVlOiBudW1iZXIgKSB7XHJcbiAgICB0aGlzLl9jb25zdHJhaW50LnhHcm93ID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHlHcm93KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC55R3JvdyE7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHlHcm93KCB2YWx1ZTogbnVtYmVyICkge1xyXG4gICAgdGhpcy5fY29uc3RyYWludC55R3JvdyA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBzdHJldGNoKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQuc3RyZXRjaCE7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHN0cmV0Y2goIHZhbHVlOiBib29sZWFuICkge1xyXG4gICAgdGhpcy5fY29uc3RyYWludC5zdHJldGNoID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHhTdHJldGNoKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQueFN0cmV0Y2ghO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCB4U3RyZXRjaCggdmFsdWU6IGJvb2xlYW4gKSB7XHJcbiAgICB0aGlzLl9jb25zdHJhaW50LnhTdHJldGNoID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHlTdHJldGNoKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQueVN0cmV0Y2ghO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCB5U3RyZXRjaCggdmFsdWU6IGJvb2xlYW4gKSB7XHJcbiAgICB0aGlzLl9jb25zdHJhaW50LnlTdHJldGNoID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IG1hcmdpbigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQubWFyZ2luITtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgbWFyZ2luKCB2YWx1ZTogbnVtYmVyICkge1xyXG4gICAgdGhpcy5fY29uc3RyYWludC5tYXJnaW4gPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgeE1hcmdpbigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQueE1hcmdpbiE7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHhNYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XHJcbiAgICB0aGlzLl9jb25zdHJhaW50LnhNYXJnaW4gPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgeU1hcmdpbigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQueU1hcmdpbiE7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHlNYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XHJcbiAgICB0aGlzLl9jb25zdHJhaW50LnlNYXJnaW4gPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgbGVmdE1hcmdpbigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQubGVmdE1hcmdpbiE7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGxlZnRNYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XHJcbiAgICB0aGlzLl9jb25zdHJhaW50LmxlZnRNYXJnaW4gPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgcmlnaHRNYXJnaW4oKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9jb25zdHJhaW50LnJpZ2h0TWFyZ2luITtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgcmlnaHRNYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XHJcbiAgICB0aGlzLl9jb25zdHJhaW50LnJpZ2h0TWFyZ2luID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHRvcE1hcmdpbigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQudG9wTWFyZ2luITtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgdG9wTWFyZ2luKCB2YWx1ZTogbnVtYmVyICkge1xyXG4gICAgdGhpcy5fY29uc3RyYWludC50b3BNYXJnaW4gPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgYm90dG9tTWFyZ2luKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC5ib3R0b21NYXJnaW4hO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBib3R0b21NYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XHJcbiAgICB0aGlzLl9jb25zdHJhaW50LmJvdHRvbU1hcmdpbiA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBtaW5Db250ZW50V2lkdGgoKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC5taW5Db250ZW50V2lkdGg7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IG1pbkNvbnRlbnRXaWR0aCggdmFsdWU6IG51bWJlciB8IG51bGwgKSB7XHJcbiAgICB0aGlzLl9jb25zdHJhaW50Lm1pbkNvbnRlbnRXaWR0aCA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBtaW5Db250ZW50SGVpZ2h0KCk6IG51bWJlciB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQubWluQ29udGVudEhlaWdodDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgbWluQ29udGVudEhlaWdodCggdmFsdWU6IG51bWJlciB8IG51bGwgKSB7XHJcbiAgICB0aGlzLl9jb25zdHJhaW50Lm1pbkNvbnRlbnRIZWlnaHQgPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgbWF4Q29udGVudFdpZHRoKCk6IG51bWJlciB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQubWF4Q29udGVudFdpZHRoO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBtYXhDb250ZW50V2lkdGgoIHZhbHVlOiBudW1iZXIgfCBudWxsICkge1xyXG4gICAgdGhpcy5fY29uc3RyYWludC5tYXhDb250ZW50V2lkdGggPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgbWF4Q29udGVudEhlaWdodCgpOiBudW1iZXIgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9jb25zdHJhaW50Lm1heENvbnRlbnRIZWlnaHQ7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IG1heENvbnRlbnRIZWlnaHQoIHZhbHVlOiBudW1iZXIgfCBudWxsICkge1xyXG4gICAgdGhpcy5fY29uc3RyYWludC5tYXhDb250ZW50SGVpZ2h0ID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIHNldEV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMoIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBzdXBlci5zZXRFeGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzKCBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzICk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVBbGxBdXRvTGluZXMoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIExvY2sgb3VyIGxheW91dCBmb3JldmVyXHJcbiAgICB0aGlzLl9jb25zdHJhaW50LmxvY2soKTtcclxuXHJcbiAgICB0aGlzLmNoaWxkSW5zZXJ0ZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLm9uQ2hpbGRJbnNlcnRlZCApO1xyXG4gICAgdGhpcy5jaGlsZFJlbW92ZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLm9uQ2hpbGRSZW1vdmVkICk7XHJcblxyXG4gICAgLy8gRGlzcG9zZSBvdXIgY2VsbHMgaGVyZS4gV2Ugd29uJ3QgYmUgZ2V0dGluZyB0aGUgY2hpbGRyZW4tcmVtb3ZlZCBsaXN0ZW5lcnMgZmlyZWQgKHdlIHJlbW92ZWQgdGhlbSBhYm92ZSlcclxuICAgIGZvciAoIGNvbnN0IGNlbGwgb2YgdGhpcy5fY2VsbE1hcC52YWx1ZXMoKSApIHtcclxuICAgICAgY2VsbC5kaXNwb3NlKCk7XHJcblxyXG4gICAgICBjZWxsLm5vZGUudmlzaWJsZVByb3BlcnR5LnVubGluayggdGhpcy5vbkNoaWxkVmlzaWJpbGl0eVRvZ2dsZWQgKTtcclxuICAgIH1cclxuXHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0SGVscGVyTm9kZSgpOiBOb2RlIHtcclxuICAgIGNvbnN0IG1hcmdpbnNOb2RlID0gTWFyZ2luTGF5b3V0Q2VsbC5jcmVhdGVIZWxwZXJOb2RlKCB0aGlzLmNvbnN0cmFpbnQuZGlzcGxheWVkQ2VsbHMsIHRoaXMuY29uc3RyYWludC5sYXlvdXRCb3VuZHNQcm9wZXJ0eS52YWx1ZSwgY2VsbCA9PiB7XHJcbiAgICAgIGxldCBzdHIgPSAnJztcclxuXHJcbiAgICAgIHN0ciArPSBgcm93OiAke2NlbGwucG9zaXRpb24udmVydGljYWx9XFxuYDtcclxuICAgICAgc3RyICs9IGBjb2x1bW46ICR7Y2VsbC5wb3NpdGlvbi5ob3Jpem9udGFsfVxcbmA7XHJcbiAgICAgIGlmICggY2VsbC5zaXplLmhvcml6b250YWwgPiAxICkge1xyXG4gICAgICAgIHN0ciArPSBgaG9yaXpvbnRhbFNwYW46ICR7Y2VsbC5zaXplLmhvcml6b250YWx9XFxuYDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGNlbGwuc2l6ZS52ZXJ0aWNhbCA+IDEgKSB7XHJcbiAgICAgICAgc3RyICs9IGB2ZXJ0aWNhbFNwYW46ICR7Y2VsbC5zaXplLnZlcnRpY2FsfVxcbmA7XHJcbiAgICAgIH1cclxuICAgICAgc3RyICs9IGB4QWxpZ246ICR7TGF5b3V0QWxpZ24uaW50ZXJuYWxUb0FsaWduKCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMLCBjZWxsLmVmZmVjdGl2ZVhBbGlnbiApfVxcbmA7XHJcbiAgICAgIHN0ciArPSBgeUFsaWduOiAke0xheW91dEFsaWduLmludGVybmFsVG9BbGlnbiggT3JpZW50YXRpb24uVkVSVElDQUwsIGNlbGwuZWZmZWN0aXZlWUFsaWduICl9XFxuYDtcclxuICAgICAgc3RyICs9IGB4U3RyZXRjaDogJHtjZWxsLmVmZmVjdGl2ZVhTdHJldGNofVxcbmA7XHJcbiAgICAgIHN0ciArPSBgeVN0cmV0Y2g6ICR7Y2VsbC5lZmZlY3RpdmVZU3RyZXRjaH1cXG5gO1xyXG4gICAgICBzdHIgKz0gYHhHcm93OiAke2NlbGwuZWZmZWN0aXZlWEdyb3d9XFxuYDtcclxuICAgICAgc3RyICs9IGB5R3JvdzogJHtjZWxsLmVmZmVjdGl2ZVlHcm93fVxcbmA7XHJcblxyXG4gICAgICByZXR1cm4gc3RyO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBtYXJnaW5zTm9kZTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiB7QXJyYXkuPHN0cmluZz59IC0gU3RyaW5nIGtleXMgZm9yIGFsbCBvZiB0aGUgYWxsb3dlZCBvcHRpb25zIHRoYXQgd2lsbCBiZSBzZXQgYnkgbm9kZS5tdXRhdGUoIG9wdGlvbnMgKSwgaW4gdGhlXHJcbiAqIG9yZGVyIHRoZXkgd2lsbCBiZSBldmFsdWF0ZWQgaW4uXHJcbiAqXHJcbiAqIE5PVEU6IFNlZSBOb2RlJ3MgX211dGF0b3JLZXlzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24gb24gaG93IHRoaXMgb3BlcmF0ZXMsIGFuZCBwb3RlbnRpYWwgc3BlY2lhbFxyXG4gKiAgICAgICBjYXNlcyB0aGF0IG1heSBhcHBseS5cclxuICovXHJcbkdyaWRCb3gucHJvdG90eXBlLl9tdXRhdG9yS2V5cyA9IFsgLi4uU0laQUJMRV9PUFRJT05fS0VZUywgLi4uR1JJREJPWF9PUFRJT05fS0VZUywgLi4uTm9kZS5wcm90b3R5cGUuX211dGF0b3JLZXlzIF07XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnR3JpZEJveCcsIEdyaWRCb3ggKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsOEJBQThCLE1BQU0sNERBQTREO0FBRXZHLE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFDN0QsT0FBT0MsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxTQUFTQywyQkFB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