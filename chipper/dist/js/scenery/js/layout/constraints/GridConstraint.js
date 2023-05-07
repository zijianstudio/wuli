// Copyright 2021-2023, University of Colorado Boulder

/**
 * Main grid-layout logic. Usually used indirectly through GridBox, but can also be used directly (say, if nodes don't
 * have the same parent, or a GridBox can't be used).
 *
 * Throughout the documentation for grid-related items, the term "line" refers to either a row or column (depending on
 * the orientation).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import OrientationPair from '../../../../phet-core/js/OrientationPair.js';
import mutate from '../../../../phet-core/js/mutate.js';
import { GRID_CONFIGURABLE_OPTION_KEYS, GridConfigurable, GridLine, LayoutAlign, NodeLayoutConstraint, scenery } from '../../imports.js';
const GRID_CONSTRAINT_OPTION_KEYS = [...GRID_CONFIGURABLE_OPTION_KEYS, 'excludeInvisible', 'spacing', 'xSpacing', 'ySpacing'];
export default class GridConstraint extends GridConfigurable(NodeLayoutConstraint) {
  cells = new Set();

  // (scenery-internal)
  displayedCells = [];

  // (scenery-internal) Looked up by index
  displayedLines = new OrientationPair(new Map(), new Map());
  _spacing = new OrientationPair(0, 0);
  constructor(ancestorNode, providedOptions) {
    super(ancestorNode, providedOptions);

    // Set configuration to actual default values (instead of null) so that we will have guaranteed non-null
    // (non-inherit) values for our computations.
    this.setConfigToBaseDefault();
    this.mutateConfigurable(providedOptions);
    mutate(this, GRID_CONSTRAINT_OPTION_KEYS, providedOptions);

    // Key configuration changes to relayout
    this.changedEmitter.addListener(this._updateLayoutListener);
  }
  layout() {
    super.layout();

    // Only grab the cells that will participate in layout
    const cells = this.filterLayoutCells([...this.cells]);
    this.displayedCells = cells;
    if (!cells.length) {
      this.layoutBoundsProperty.value = Bounds2.NOTHING;
      this.minimumWidthProperty.value = null;
      this.minimumHeightProperty.value = null;

      // Synchronize our displayedLines, if it's used for display (e.g. GridBackgroundNode)
      this.displayedLines.forEach(map => map.clear());
      return;
    }
    const minimumSizes = new OrientationPair(0, 0);
    const preferredSizes = new OrientationPair(this.preferredWidthProperty.value, this.preferredHeightProperty.value);
    const layoutBounds = new Bounds2(0, 0, 0, 0);

    // Handle horizontal first, so if we re-wrap we can handle vertical later.
    [Orientation.HORIZONTAL, Orientation.VERTICAL].forEach(orientation => {
      const orientedSpacing = this._spacing.get(orientation);

      // index => GridLine
      const lineMap = this.displayedLines.get(orientation);

      // Clear out the lineMap
      lineMap.forEach(line => line.clean());
      lineMap.clear();

      // What are all the line indices used by displayed cells? There could be gaps. We pretend like those gaps
      // don't exist (except for spacing)
      const lineIndices = _.sortedUniq(_.sortBy(_.flatten(cells.map(cell => cell.getIndices(orientation)))));
      const lines = lineIndices.map(index => {
        // Recall, cells can include multiple lines in the same orientation if they have width/height>1
        const subCells = _.filter(cells, cell => cell.containsIndex(orientation, index));

        // For now, we'll use the maximum grow value included in this line
        const grow = Math.max(...subCells.map(cell => cell.getEffectiveGrow(orientation)));
        const line = GridLine.pool.create(index, subCells, grow);
        lineMap.set(index, line);
        return line;
      });

      // Convert a simple spacing number (or a spacing array) into a spacing array of the correct size, only including
      // spacings AFTER our actually-visible lines. We'll also skip the spacing after the last line, as it won't be used
      const lineSpacings = lines.slice(0, -1).map(line => {
        return typeof orientedSpacing === 'number' ? orientedSpacing : orientedSpacing[line.index];
      });

      // Scan sizes for single-line cells first
      cells.forEach(cell => {
        if (cell.size.get(orientation) === 1) {
          const line = lineMap.get(cell.position.get(orientation));
          line.min = Math.max(line.min, cell.getMinimumSize(orientation));
          line.max = Math.min(line.max, cell.getMaximumSize(orientation));

          // For origin-specified cells, we will record their maximum reach from the origin, so these can be "summed"
          // (since the origin line may end up taking more space).
          if (cell.getEffectiveAlign(orientation) === LayoutAlign.ORIGIN) {
            const originBounds = cell.getOriginBounds();
            line.minOrigin = Math.min(originBounds[orientation.minCoordinate], line.minOrigin);
            line.maxOrigin = Math.max(originBounds[orientation.maxCoordinate], line.maxOrigin);
          }
        }
      });

      // Then increase for spanning cells as necessary
      cells.forEach(cell => {
        if (cell.size.get(orientation) > 1) {
          assert && assert(cell.getEffectiveAlign(orientation) !== LayoutAlign.ORIGIN, 'origin alignment cannot be specified for cells that span >1 width or height');
          // TODO: don't bump mins over maxes here (if lines have maxes, redistribute otherwise)
          // TODO: also handle maxes
          const lines = cell.getIndices(orientation).map(index => lineMap.get(index));
          const currentMin = _.sum(lines.map(line => line.min));
          const neededMin = cell.getMinimumSize(orientation);
          if (neededMin > currentMin) {
            const lineDelta = (neededMin - currentMin) / lines.length;
            lines.forEach(line => {
              line.min += lineDelta;
            });
          }
        }
      });

      // Adjust line sizes to the min
      lines.forEach(line => {
        // If we have origin-specified content, we'll need to include the maximum origin span (which may be larger)
        if (line.hasOrigin()) {
          line.size = Math.max(line.min, line.maxOrigin - line.minOrigin);
        } else {
          line.size = line.min;
        }
      });

      // Minimum size of our grid in this orientation
      const minSizeAndSpacing = _.sum(lines.map(line => line.size)) + _.sum(lineSpacings);
      minimumSizes.set(orientation, minSizeAndSpacing);

      // Compute the size in this orientation (growing the size proportionally in lines as necessary)
      const size = Math.max(minSizeAndSpacing, preferredSizes.get(orientation) || 0);
      let sizeRemaining = size - minSizeAndSpacing;
      let growableLines;
      while (sizeRemaining > 1e-7 && (growableLines = lines.filter(line => {
        return line.grow > 0 && line.size < line.max - 1e-7;
      })).length) {
        const totalGrow = _.sum(growableLines.map(line => line.grow));

        // We could need to stop growing EITHER when a line hits its max OR when we run out of space remaining.
        const amountToGrow = Math.min(Math.min(...growableLines.map(line => (line.max - line.size) / line.grow)), sizeRemaining / totalGrow);
        assert && assert(amountToGrow > 1e-11);

        // Grow proportionally to their grow values
        growableLines.forEach(line => {
          line.size += amountToGrow * line.grow;
        });
        sizeRemaining -= amountToGrow * totalGrow;
      }

      // Layout
      const startPosition = (lines[0].hasOrigin() ? lines[0].minOrigin : 0) + this.layoutOriginProperty.value[orientation.coordinate];
      layoutBounds[orientation.minCoordinate] = startPosition;
      layoutBounds[orientation.maxCoordinate] = startPosition + size;
      lines.forEach((line, arrayIndex) => {
        // Position all the lines
        const totalPreviousLineSizes = _.sum(lines.slice(0, arrayIndex).map(line => line.size));
        const totalPreviousSpacings = _.sum(lineSpacings.slice(0, arrayIndex));
        line.position = startPosition + totalPreviousLineSizes + totalPreviousSpacings;
      });
      cells.forEach(cell => {
        // The line index of the first line our cell is composed of.
        const cellFirstIndexPosition = cell.position.get(orientation);

        // The size of our cell (width/height)
        const cellSize = cell.size.get(orientation);

        // The line index of the last line our cell is composed of.
        const cellLastIndexPosition = cellFirstIndexPosition + cellSize - 1;

        // All the lines our cell is composed of.
        const cellLines = cell.getIndices(orientation).map(index => lineMap.get(index));
        const firstLine = lineMap.get(cellFirstIndexPosition);

        // If we're spanning multiple lines, we have to include the spacing that we've "absorbed" (if we have a cell
        // that spans columns 2 and 3, we'll need to include the spacing between 2 and 3.
        let interiorAbsorbedSpacing = 0;
        if (cellFirstIndexPosition !== cellLastIndexPosition) {
          lines.slice(0, -1).forEach((line, lineIndex) => {
            if (line.index >= cellFirstIndexPosition && line.index < cellLastIndexPosition) {
              interiorAbsorbedSpacing += lineSpacings[lineIndex];
            }
          });
        }

        // Our size includes the line sizes and spacings
        const cellAvailableSize = _.sum(cellLines.map(line => line.size)) + interiorAbsorbedSpacing;
        const cellPosition = firstLine.position;

        // Adjust preferred size and move the cell
        const cellBounds = cell.reposition(orientation, cellAvailableSize, cellPosition, cell.getEffectiveStretch(orientation), -firstLine.minOrigin, cell.getEffectiveAlign(orientation));
        layoutBounds[orientation.minCoordinate] = Math.min(layoutBounds[orientation.minCoordinate], cellBounds[orientation.minCoordinate]);
        layoutBounds[orientation.maxCoordinate] = Math.max(layoutBounds[orientation.maxCoordinate], cellBounds[orientation.maxCoordinate]);
      });
    });

    // We're taking up these layout bounds (nodes could use them for localBounds)
    this.layoutBoundsProperty.value = layoutBounds;
    this.minimumWidthProperty.value = minimumSizes.horizontal;
    this.minimumHeightProperty.value = minimumSizes.vertical;
    this.finishedLayoutEmitter.emit();
  }
  get spacing() {
    assert && assert(this.xSpacing === this.ySpacing);
    return this.xSpacing;
  }
  set spacing(value) {
    assert && assert(typeof value === 'number' && isFinite(value) && value >= 0 || Array.isArray(value) && _.every(value, item => typeof item === 'number' && isFinite(item) && item >= 0));
    if (this._spacing.get(Orientation.HORIZONTAL) !== value || this._spacing.get(Orientation.VERTICAL) !== value) {
      this._spacing.set(Orientation.HORIZONTAL, value);
      this._spacing.set(Orientation.VERTICAL, value);
      this.updateLayoutAutomatically();
    }
  }
  get xSpacing() {
    return this._spacing.get(Orientation.HORIZONTAL);
  }
  set xSpacing(value) {
    assert && assert(typeof value === 'number' && isFinite(value) && value >= 0 || Array.isArray(value) && _.every(value, item => typeof item === 'number' && isFinite(item) && item >= 0));
    if (this._spacing.get(Orientation.HORIZONTAL) !== value) {
      this._spacing.set(Orientation.HORIZONTAL, value);
      this.updateLayoutAutomatically();
    }
  }
  get ySpacing() {
    return this._spacing.get(Orientation.VERTICAL);
  }
  set ySpacing(value) {
    assert && assert(typeof value === 'number' && isFinite(value) && value >= 0 || Array.isArray(value) && _.every(value, item => typeof item === 'number' && isFinite(item) && item >= 0));
    if (this._spacing.get(Orientation.VERTICAL) !== value) {
      this._spacing.set(Orientation.VERTICAL, value);
      this.updateLayoutAutomatically();
    }
  }
  addCell(cell) {
    assert && assert(!this.cells.has(cell));
    this.cells.add(cell);
    this.addNode(cell.node);
    cell.changedEmitter.addListener(this._updateLayoutListener);
    this.updateLayoutAutomatically();
  }
  removeCell(cell) {
    assert && assert(this.cells.has(cell));
    this.cells.delete(cell);
    this.removeNode(cell.node);
    cell.changedEmitter.removeListener(this._updateLayoutListener);
    this.updateLayoutAutomatically();
  }

  /**
   * Releases references
   */
  dispose() {
    // Lock during disposal to avoid layout calls
    this.lock();
    [...this.cells].forEach(cell => this.removeCell(cell));
    this.displayedLines.forEach(map => map.clear());
    this.displayedCells = [];
    super.dispose();
    this.unlock();
  }
  getIndices(orientation) {
    const result = [];
    this.cells.forEach(cell => {
      result.push(...cell.getIndices(orientation));
    });
    return _.sortedUniq(_.sortBy(result));
  }
  getCell(row, column) {
    return _.find([...this.cells], cell => cell.containsRow(row) && cell.containsColumn(column)) || null;
  }
  getCellFromNode(node) {
    return _.find([...this.cells], cell => cell.node === node) || null;
  }
  getCells(orientation, index) {
    return _.filter([...this.cells], cell => cell.containsIndex(orientation, index));
  }
  static create(ancestorNode, options) {
    return new GridConstraint(ancestorNode, options);
  }
}
scenery.register('GridConstraint', GridConstraint);
export { GRID_CONSTRAINT_OPTION_KEYS };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiT3JpZW50YXRpb24iLCJPcmllbnRhdGlvblBhaXIiLCJtdXRhdGUiLCJHUklEX0NPTkZJR1VSQUJMRV9PUFRJT05fS0VZUyIsIkdyaWRDb25maWd1cmFibGUiLCJHcmlkTGluZSIsIkxheW91dEFsaWduIiwiTm9kZUxheW91dENvbnN0cmFpbnQiLCJzY2VuZXJ5IiwiR1JJRF9DT05TVFJBSU5UX09QVElPTl9LRVlTIiwiR3JpZENvbnN0cmFpbnQiLCJjZWxscyIsIlNldCIsImRpc3BsYXllZENlbGxzIiwiZGlzcGxheWVkTGluZXMiLCJNYXAiLCJfc3BhY2luZyIsImNvbnN0cnVjdG9yIiwiYW5jZXN0b3JOb2RlIiwicHJvdmlkZWRPcHRpb25zIiwic2V0Q29uZmlnVG9CYXNlRGVmYXVsdCIsIm11dGF0ZUNvbmZpZ3VyYWJsZSIsImNoYW5nZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJfdXBkYXRlTGF5b3V0TGlzdGVuZXIiLCJsYXlvdXQiLCJmaWx0ZXJMYXlvdXRDZWxscyIsImxlbmd0aCIsImxheW91dEJvdW5kc1Byb3BlcnR5IiwidmFsdWUiLCJOT1RISU5HIiwibWluaW11bVdpZHRoUHJvcGVydHkiLCJtaW5pbXVtSGVpZ2h0UHJvcGVydHkiLCJmb3JFYWNoIiwibWFwIiwiY2xlYXIiLCJtaW5pbXVtU2l6ZXMiLCJwcmVmZXJyZWRTaXplcyIsInByZWZlcnJlZFdpZHRoUHJvcGVydHkiLCJwcmVmZXJyZWRIZWlnaHRQcm9wZXJ0eSIsImxheW91dEJvdW5kcyIsIkhPUklaT05UQUwiLCJWRVJUSUNBTCIsIm9yaWVudGF0aW9uIiwib3JpZW50ZWRTcGFjaW5nIiwiZ2V0IiwibGluZU1hcCIsImxpbmUiLCJjbGVhbiIsImxpbmVJbmRpY2VzIiwiXyIsInNvcnRlZFVuaXEiLCJzb3J0QnkiLCJmbGF0dGVuIiwiY2VsbCIsImdldEluZGljZXMiLCJsaW5lcyIsImluZGV4Iiwic3ViQ2VsbHMiLCJmaWx0ZXIiLCJjb250YWluc0luZGV4IiwiZ3JvdyIsIk1hdGgiLCJtYXgiLCJnZXRFZmZlY3RpdmVHcm93IiwicG9vbCIsImNyZWF0ZSIsInNldCIsImxpbmVTcGFjaW5ncyIsInNsaWNlIiwic2l6ZSIsInBvc2l0aW9uIiwibWluIiwiZ2V0TWluaW11bVNpemUiLCJnZXRNYXhpbXVtU2l6ZSIsImdldEVmZmVjdGl2ZUFsaWduIiwiT1JJR0lOIiwib3JpZ2luQm91bmRzIiwiZ2V0T3JpZ2luQm91bmRzIiwibWluT3JpZ2luIiwibWluQ29vcmRpbmF0ZSIsIm1heE9yaWdpbiIsIm1heENvb3JkaW5hdGUiLCJhc3NlcnQiLCJjdXJyZW50TWluIiwic3VtIiwibmVlZGVkTWluIiwibGluZURlbHRhIiwiaGFzT3JpZ2luIiwibWluU2l6ZUFuZFNwYWNpbmciLCJzaXplUmVtYWluaW5nIiwiZ3Jvd2FibGVMaW5lcyIsInRvdGFsR3JvdyIsImFtb3VudFRvR3JvdyIsInN0YXJ0UG9zaXRpb24iLCJsYXlvdXRPcmlnaW5Qcm9wZXJ0eSIsImNvb3JkaW5hdGUiLCJhcnJheUluZGV4IiwidG90YWxQcmV2aW91c0xpbmVTaXplcyIsInRvdGFsUHJldmlvdXNTcGFjaW5ncyIsImNlbGxGaXJzdEluZGV4UG9zaXRpb24iLCJjZWxsU2l6ZSIsImNlbGxMYXN0SW5kZXhQb3NpdGlvbiIsImNlbGxMaW5lcyIsImZpcnN0TGluZSIsImludGVyaW9yQWJzb3JiZWRTcGFjaW5nIiwibGluZUluZGV4IiwiY2VsbEF2YWlsYWJsZVNpemUiLCJjZWxsUG9zaXRpb24iLCJjZWxsQm91bmRzIiwicmVwb3NpdGlvbiIsImdldEVmZmVjdGl2ZVN0cmV0Y2giLCJob3Jpem9udGFsIiwidmVydGljYWwiLCJmaW5pc2hlZExheW91dEVtaXR0ZXIiLCJlbWl0Iiwic3BhY2luZyIsInhTcGFjaW5nIiwieVNwYWNpbmciLCJpc0Zpbml0ZSIsIkFycmF5IiwiaXNBcnJheSIsImV2ZXJ5IiwiaXRlbSIsInVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkiLCJhZGRDZWxsIiwiaGFzIiwiYWRkIiwiYWRkTm9kZSIsIm5vZGUiLCJyZW1vdmVDZWxsIiwiZGVsZXRlIiwicmVtb3ZlTm9kZSIsInJlbW92ZUxpc3RlbmVyIiwiZGlzcG9zZSIsImxvY2siLCJ1bmxvY2siLCJyZXN1bHQiLCJwdXNoIiwiZ2V0Q2VsbCIsInJvdyIsImNvbHVtbiIsImZpbmQiLCJjb250YWluc1JvdyIsImNvbnRhaW5zQ29sdW1uIiwiZ2V0Q2VsbEZyb21Ob2RlIiwiZ2V0Q2VsbHMiLCJvcHRpb25zIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHcmlkQ29uc3RyYWludC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIGdyaWQtbGF5b3V0IGxvZ2ljLiBVc3VhbGx5IHVzZWQgaW5kaXJlY3RseSB0aHJvdWdoIEdyaWRCb3gsIGJ1dCBjYW4gYWxzbyBiZSB1c2VkIGRpcmVjdGx5IChzYXksIGlmIG5vZGVzIGRvbid0XHJcbiAqIGhhdmUgdGhlIHNhbWUgcGFyZW50LCBvciBhIEdyaWRCb3ggY2FuJ3QgYmUgdXNlZCkuXHJcbiAqXHJcbiAqIFRocm91Z2hvdXQgdGhlIGRvY3VtZW50YXRpb24gZm9yIGdyaWQtcmVsYXRlZCBpdGVtcywgdGhlIHRlcm0gXCJsaW5lXCIgcmVmZXJzIHRvIGVpdGhlciBhIHJvdyBvciBjb2x1bW4gKGRlcGVuZGluZyBvblxyXG4gKiB0aGUgb3JpZW50YXRpb24pLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcclxuaW1wb3J0IE9yaWVudGF0aW9uUGFpciBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvT3JpZW50YXRpb25QYWlyLmpzJztcclxuaW1wb3J0IG11dGF0ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbXV0YXRlLmpzJztcclxuaW1wb3J0IHsgRXh0ZXJuYWxHcmlkQ29uZmlndXJhYmxlT3B0aW9ucywgR1JJRF9DT05GSUdVUkFCTEVfT1BUSU9OX0tFWVMsIEdyaWRDZWxsLCBHcmlkQ29uZmlndXJhYmxlLCBHcmlkTGluZSwgTGF5b3V0QWxpZ24sIE5vZGUsIE5vZGVMYXlvdXRBdmFpbGFibGVDb25zdHJhaW50T3B0aW9ucywgTm9kZUxheW91dENvbnN0cmFpbnQsIHNjZW5lcnkgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XHJcblxyXG5jb25zdCBHUklEX0NPTlNUUkFJTlRfT1BUSU9OX0tFWVMgPSBbXHJcbiAgLi4uR1JJRF9DT05GSUdVUkFCTEVfT1BUSU9OX0tFWVMsXHJcbiAgJ2V4Y2x1ZGVJbnZpc2libGUnLFxyXG4gICdzcGFjaW5nJyxcclxuICAneFNwYWNpbmcnLFxyXG4gICd5U3BhY2luZydcclxuXTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIFNwYWNpbmdzIGFyZSBjb250cm9sbGVkIGluIGVhY2ggZGltZW5zaW9uIChzZXR0aW5nIGBzcGFjaW5nYCkgd2lsbCBhZGp1c3QgYm90aC4gSWYgaXQncyBhIG51bWJlciwgaXQgd2lsbCBiZSBhblxyXG4gIC8vIGV4dHJhIGdhcCBpbi1iZXR3ZWVuIGV2ZXJ5IHJvdyBvciBjb2x1bW4uIElmIGl0J3MgYW4gYXJyYXksIGl0IHdpbGwgc3BlY2lmeSB0aGUgZ2FwIGJldHdlZW4gc3VjY2Vzc2l2ZSByb3dzL2NvbHVtbnNcclxuICAvLyBlLmcuIFsgNSwgNCBdIHdpbGwgaGF2ZSBhIHNwYWNpbmcgb2YgNSBiZXR3ZWVuIHRoZSBmaXJzdCBhbmQgc2Vjb25kIGxpbmVzLCBhbmQgNCBiZXR3ZWVuIHRoZSBzZWNvbmQgYW5kIHRoaXJkXHJcbiAgLy8gbGluZXMuIEluIHRoYXQgY2FzZSwgaWYgdGhlcmUgd2VyZSBhIHRoaXJkIGxpbmUsIGl0IHdvdWxkIGhhdmUgemVybyBzcGFjaW5nIGJldHdlZW4gdGhlIHNlY29uZCAoYW55IG5vbi1zcGVjaWZpZWRcclxuICAvLyBzcGFjaW5ncyBmb3IgZXh0cmEgcm93cy9jb2x1bW5zIHdpbGwgYmUgemVybykuXHJcbiAgLy8gTk9URTogSWYgYSBsaW5lIChyb3cvY29sdW1uKSBpcyBpbnZpc2libGUgKGFuZCBleGNsdWRlSW52aXNpYmxlIGlzIHNldCB0byB0cnVlKSwgdGhlbiB0aGUgc3BhY2luZyB0aGF0IGlzIGRpcmVjdGx5XHJcbiAgLy8gYWZ0ZXIgKHRvIHRoZSByaWdodC9ib3R0b20gb2YpIHRoYXQgbGluZSB3aWxsIGJlIGlnbm9yZWQuXHJcbiAgc3BhY2luZz86IG51bWJlciB8IG51bWJlcltdO1xyXG4gIHhTcGFjaW5nPzogbnVtYmVyIHwgbnVtYmVyW107XHJcbiAgeVNwYWNpbmc/OiBudW1iZXIgfCBudW1iZXJbXTtcclxuXHJcbiAgLy8gVGhlIHByZWZlcnJlZCB3aWR0aC9oZWlnaHQgKGlkZWFsbHkgZnJvbSBhIGNvbnRhaW5lcidzIGxvY2FsUHJlZmVycmVkV2lkdGgvbG9jYWxQcmVmZXJyZWRIZWlnaHQuXHJcbiAgcHJlZmVycmVkV2lkdGhQcm9wZXJ0eT86IFRQcm9wZXJ0eTxudW1iZXIgfCBudWxsPjtcclxuICBwcmVmZXJyZWRIZWlnaHRQcm9wZXJ0eT86IFRQcm9wZXJ0eTxudW1iZXIgfCBudWxsPjtcclxuXHJcbiAgLy8gVGhlIG1pbmltdW0gd2lkdGgvaGVpZ2h0IChpZGVhbGx5IGZyb20gYSBjb250YWluZXIncyBsb2NhbE1pbmltdW1XaWR0aC9sb2NhbE1pbmltdW1IZWlnaHQuXHJcbiAgbWluaW11bVdpZHRoUHJvcGVydHk/OiBUUHJvcGVydHk8bnVtYmVyIHwgbnVsbD47XHJcbiAgbWluaW11bUhlaWdodFByb3BlcnR5PzogVFByb3BlcnR5PG51bWJlciB8IG51bGw+O1xyXG59O1xyXG50eXBlIFBhcmVudE9wdGlvbnMgPSBFeHRlcm5hbEdyaWRDb25maWd1cmFibGVPcHRpb25zICYgTm9kZUxheW91dEF2YWlsYWJsZUNvbnN0cmFpbnRPcHRpb25zO1xyXG5leHBvcnQgdHlwZSBHcmlkQ29uc3RyYWludE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhcmVudE9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmlkQ29uc3RyYWludCBleHRlbmRzIEdyaWRDb25maWd1cmFibGUoIE5vZGVMYXlvdXRDb25zdHJhaW50ICkge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGNlbGxzID0gbmV3IFNldDxHcmlkQ2VsbD4oKTtcclxuXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgcHVibGljIGRpc3BsYXllZENlbGxzOiBHcmlkQ2VsbFtdID0gW107XHJcblxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKSBMb29rZWQgdXAgYnkgaW5kZXhcclxuICBwdWJsaWMgZGlzcGxheWVkTGluZXMgPSBuZXcgT3JpZW50YXRpb25QYWlyPE1hcDxudW1iZXIsIEdyaWRMaW5lPj4oIG5ldyBNYXAoKSwgbmV3IE1hcCgpICk7XHJcblxyXG4gIHByaXZhdGUgX3NwYWNpbmc6IE9yaWVudGF0aW9uUGFpcjxudW1iZXIgfCBudW1iZXJbXT4gPSBuZXcgT3JpZW50YXRpb25QYWlyPG51bWJlciB8IG51bWJlcltdPiggMCwgMCApO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGFuY2VzdG9yTm9kZTogTm9kZSwgcHJvdmlkZWRPcHRpb25zPzogR3JpZENvbnN0cmFpbnRPcHRpb25zICkge1xyXG4gICAgc3VwZXIoIGFuY2VzdG9yTm9kZSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gU2V0IGNvbmZpZ3VyYXRpb24gdG8gYWN0dWFsIGRlZmF1bHQgdmFsdWVzIChpbnN0ZWFkIG9mIG51bGwpIHNvIHRoYXQgd2Ugd2lsbCBoYXZlIGd1YXJhbnRlZWQgbm9uLW51bGxcclxuICAgIC8vIChub24taW5oZXJpdCkgdmFsdWVzIGZvciBvdXIgY29tcHV0YXRpb25zLlxyXG4gICAgdGhpcy5zZXRDb25maWdUb0Jhc2VEZWZhdWx0KCk7XHJcbiAgICB0aGlzLm11dGF0ZUNvbmZpZ3VyYWJsZSggcHJvdmlkZWRPcHRpb25zICk7XHJcbiAgICBtdXRhdGUoIHRoaXMsIEdSSURfQ09OU1RSQUlOVF9PUFRJT05fS0VZUywgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gS2V5IGNvbmZpZ3VyYXRpb24gY2hhbmdlcyB0byByZWxheW91dFxyXG4gICAgdGhpcy5jaGFuZ2VkRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBvdmVycmlkZSBsYXlvdXQoKTogdm9pZCB7XHJcbiAgICBzdXBlci5sYXlvdXQoKTtcclxuXHJcbiAgICAvLyBPbmx5IGdyYWIgdGhlIGNlbGxzIHRoYXQgd2lsbCBwYXJ0aWNpcGF0ZSBpbiBsYXlvdXRcclxuICAgIGNvbnN0IGNlbGxzID0gdGhpcy5maWx0ZXJMYXlvdXRDZWxscyggWyAuLi50aGlzLmNlbGxzIF0gKTtcclxuICAgIHRoaXMuZGlzcGxheWVkQ2VsbHMgPSBjZWxscztcclxuXHJcbiAgICBpZiAoICFjZWxscy5sZW5ndGggKSB7XHJcbiAgICAgIHRoaXMubGF5b3V0Qm91bmRzUHJvcGVydHkudmFsdWUgPSBCb3VuZHMyLk5PVEhJTkc7XHJcbiAgICAgIHRoaXMubWluaW11bVdpZHRoUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgICB0aGlzLm1pbmltdW1IZWlnaHRQcm9wZXJ0eS52YWx1ZSA9IG51bGw7XHJcblxyXG4gICAgICAvLyBTeW5jaHJvbml6ZSBvdXIgZGlzcGxheWVkTGluZXMsIGlmIGl0J3MgdXNlZCBmb3IgZGlzcGxheSAoZS5nLiBHcmlkQmFja2dyb3VuZE5vZGUpXHJcbiAgICAgIHRoaXMuZGlzcGxheWVkTGluZXMuZm9yRWFjaCggbWFwID0+IG1hcC5jbGVhcigpICk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBtaW5pbXVtU2l6ZXMgPSBuZXcgT3JpZW50YXRpb25QYWlyKCAwLCAwICk7XHJcbiAgICBjb25zdCBwcmVmZXJyZWRTaXplcyA9IG5ldyBPcmllbnRhdGlvblBhaXIoIHRoaXMucHJlZmVycmVkV2lkdGhQcm9wZXJ0eS52YWx1ZSwgdGhpcy5wcmVmZXJyZWRIZWlnaHRQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgY29uc3QgbGF5b3V0Qm91bmRzID0gbmV3IEJvdW5kczIoIDAsIDAsIDAsIDAgKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgaG9yaXpvbnRhbCBmaXJzdCwgc28gaWYgd2UgcmUtd3JhcCB3ZSBjYW4gaGFuZGxlIHZlcnRpY2FsIGxhdGVyLlxyXG4gICAgWyBPcmllbnRhdGlvbi5IT1JJWk9OVEFMLCBPcmllbnRhdGlvbi5WRVJUSUNBTCBdLmZvckVhY2goIG9yaWVudGF0aW9uID0+IHtcclxuICAgICAgY29uc3Qgb3JpZW50ZWRTcGFjaW5nID0gdGhpcy5fc3BhY2luZy5nZXQoIG9yaWVudGF0aW9uICk7XHJcblxyXG4gICAgICAvLyBpbmRleCA9PiBHcmlkTGluZVxyXG4gICAgICBjb25zdCBsaW5lTWFwOiBNYXA8bnVtYmVyLCBHcmlkTGluZT4gPSB0aGlzLmRpc3BsYXllZExpbmVzLmdldCggb3JpZW50YXRpb24gKTtcclxuXHJcbiAgICAgIC8vIENsZWFyIG91dCB0aGUgbGluZU1hcFxyXG4gICAgICBsaW5lTWFwLmZvckVhY2goIGxpbmUgPT4gbGluZS5jbGVhbigpICk7XHJcbiAgICAgIGxpbmVNYXAuY2xlYXIoKTtcclxuXHJcbiAgICAgIC8vIFdoYXQgYXJlIGFsbCB0aGUgbGluZSBpbmRpY2VzIHVzZWQgYnkgZGlzcGxheWVkIGNlbGxzPyBUaGVyZSBjb3VsZCBiZSBnYXBzLiBXZSBwcmV0ZW5kIGxpa2UgdGhvc2UgZ2Fwc1xyXG4gICAgICAvLyBkb24ndCBleGlzdCAoZXhjZXB0IGZvciBzcGFjaW5nKVxyXG4gICAgICBjb25zdCBsaW5lSW5kaWNlcyA9IF8uc29ydGVkVW5pcSggXy5zb3J0QnkoIF8uZmxhdHRlbiggY2VsbHMubWFwKCBjZWxsID0+IGNlbGwuZ2V0SW5kaWNlcyggb3JpZW50YXRpb24gKSApICkgKSApO1xyXG5cclxuICAgICAgY29uc3QgbGluZXMgPSBsaW5lSW5kaWNlcy5tYXAoIGluZGV4ID0+IHtcclxuICAgICAgICAvLyBSZWNhbGwsIGNlbGxzIGNhbiBpbmNsdWRlIG11bHRpcGxlIGxpbmVzIGluIHRoZSBzYW1lIG9yaWVudGF0aW9uIGlmIHRoZXkgaGF2ZSB3aWR0aC9oZWlnaHQ+MVxyXG4gICAgICAgIGNvbnN0IHN1YkNlbGxzID0gXy5maWx0ZXIoIGNlbGxzLCBjZWxsID0+IGNlbGwuY29udGFpbnNJbmRleCggb3JpZW50YXRpb24sIGluZGV4ICkgKTtcclxuXHJcbiAgICAgICAgLy8gRm9yIG5vdywgd2UnbGwgdXNlIHRoZSBtYXhpbXVtIGdyb3cgdmFsdWUgaW5jbHVkZWQgaW4gdGhpcyBsaW5lXHJcbiAgICAgICAgY29uc3QgZ3JvdyA9IE1hdGgubWF4KCAuLi5zdWJDZWxscy5tYXAoIGNlbGwgPT4gY2VsbC5nZXRFZmZlY3RpdmVHcm93KCBvcmllbnRhdGlvbiApICkgKTtcclxuXHJcbiAgICAgICAgY29uc3QgbGluZSA9IEdyaWRMaW5lLnBvb2wuY3JlYXRlKCBpbmRleCwgc3ViQ2VsbHMsIGdyb3cgKTtcclxuICAgICAgICBsaW5lTWFwLnNldCggaW5kZXgsIGxpbmUgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGxpbmU7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIENvbnZlcnQgYSBzaW1wbGUgc3BhY2luZyBudW1iZXIgKG9yIGEgc3BhY2luZyBhcnJheSkgaW50byBhIHNwYWNpbmcgYXJyYXkgb2YgdGhlIGNvcnJlY3Qgc2l6ZSwgb25seSBpbmNsdWRpbmdcclxuICAgICAgLy8gc3BhY2luZ3MgQUZURVIgb3VyIGFjdHVhbGx5LXZpc2libGUgbGluZXMuIFdlJ2xsIGFsc28gc2tpcCB0aGUgc3BhY2luZyBhZnRlciB0aGUgbGFzdCBsaW5lLCBhcyBpdCB3b24ndCBiZSB1c2VkXHJcbiAgICAgIGNvbnN0IGxpbmVTcGFjaW5ncyA9IGxpbmVzLnNsaWNlKCAwLCAtMSApLm1hcCggbGluZSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBvcmllbnRlZFNwYWNpbmcgPT09ICdudW1iZXInID8gb3JpZW50ZWRTcGFjaW5nIDogb3JpZW50ZWRTcGFjaW5nWyBsaW5lLmluZGV4IF07XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIFNjYW4gc2l6ZXMgZm9yIHNpbmdsZS1saW5lIGNlbGxzIGZpcnN0XHJcbiAgICAgIGNlbGxzLmZvckVhY2goIGNlbGwgPT4ge1xyXG4gICAgICAgIGlmICggY2VsbC5zaXplLmdldCggb3JpZW50YXRpb24gKSA9PT0gMSApIHtcclxuICAgICAgICAgIGNvbnN0IGxpbmUgPSBsaW5lTWFwLmdldCggY2VsbC5wb3NpdGlvbi5nZXQoIG9yaWVudGF0aW9uICkgKSE7XHJcbiAgICAgICAgICBsaW5lLm1pbiA9IE1hdGgubWF4KCBsaW5lLm1pbiwgY2VsbC5nZXRNaW5pbXVtU2l6ZSggb3JpZW50YXRpb24gKSApO1xyXG4gICAgICAgICAgbGluZS5tYXggPSBNYXRoLm1pbiggbGluZS5tYXgsIGNlbGwuZ2V0TWF4aW11bVNpemUoIG9yaWVudGF0aW9uICkgKTtcclxuXHJcbiAgICAgICAgICAvLyBGb3Igb3JpZ2luLXNwZWNpZmllZCBjZWxscywgd2Ugd2lsbCByZWNvcmQgdGhlaXIgbWF4aW11bSByZWFjaCBmcm9tIHRoZSBvcmlnaW4sIHNvIHRoZXNlIGNhbiBiZSBcInN1bW1lZFwiXHJcbiAgICAgICAgICAvLyAoc2luY2UgdGhlIG9yaWdpbiBsaW5lIG1heSBlbmQgdXAgdGFraW5nIG1vcmUgc3BhY2UpLlxyXG4gICAgICAgICAgaWYgKCBjZWxsLmdldEVmZmVjdGl2ZUFsaWduKCBvcmllbnRhdGlvbiApID09PSBMYXlvdXRBbGlnbi5PUklHSU4gKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbkJvdW5kcyA9IGNlbGwuZ2V0T3JpZ2luQm91bmRzKCk7XHJcbiAgICAgICAgICAgIGxpbmUubWluT3JpZ2luID0gTWF0aC5taW4oIG9yaWdpbkJvdW5kc1sgb3JpZW50YXRpb24ubWluQ29vcmRpbmF0ZSBdLCBsaW5lLm1pbk9yaWdpbiApO1xyXG4gICAgICAgICAgICBsaW5lLm1heE9yaWdpbiA9IE1hdGgubWF4KCBvcmlnaW5Cb3VuZHNbIG9yaWVudGF0aW9uLm1heENvb3JkaW5hdGUgXSwgbGluZS5tYXhPcmlnaW4gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIFRoZW4gaW5jcmVhc2UgZm9yIHNwYW5uaW5nIGNlbGxzIGFzIG5lY2Vzc2FyeVxyXG4gICAgICBjZWxscy5mb3JFYWNoKCBjZWxsID0+IHtcclxuICAgICAgICBpZiAoIGNlbGwuc2l6ZS5nZXQoIG9yaWVudGF0aW9uICkgPiAxICkge1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggY2VsbC5nZXRFZmZlY3RpdmVBbGlnbiggb3JpZW50YXRpb24gKSAhPT0gTGF5b3V0QWxpZ24uT1JJR0lOLCAnb3JpZ2luIGFsaWdubWVudCBjYW5ub3QgYmUgc3BlY2lmaWVkIGZvciBjZWxscyB0aGF0IHNwYW4gPjEgd2lkdGggb3IgaGVpZ2h0JyApO1xyXG4gICAgICAgICAgLy8gVE9ETzogZG9uJ3QgYnVtcCBtaW5zIG92ZXIgbWF4ZXMgaGVyZSAoaWYgbGluZXMgaGF2ZSBtYXhlcywgcmVkaXN0cmlidXRlIG90aGVyd2lzZSlcclxuICAgICAgICAgIC8vIFRPRE86IGFsc28gaGFuZGxlIG1heGVzXHJcbiAgICAgICAgICBjb25zdCBsaW5lcyA9IGNlbGwuZ2V0SW5kaWNlcyggb3JpZW50YXRpb24gKS5tYXAoIGluZGV4ID0+IGxpbmVNYXAuZ2V0KCBpbmRleCApISApO1xyXG4gICAgICAgICAgY29uc3QgY3VycmVudE1pbiA9IF8uc3VtKCBsaW5lcy5tYXAoIGxpbmUgPT4gbGluZS5taW4gKSApO1xyXG4gICAgICAgICAgY29uc3QgbmVlZGVkTWluID0gY2VsbC5nZXRNaW5pbXVtU2l6ZSggb3JpZW50YXRpb24gKTtcclxuICAgICAgICAgIGlmICggbmVlZGVkTWluID4gY3VycmVudE1pbiApIHtcclxuICAgICAgICAgICAgY29uc3QgbGluZURlbHRhID0gKCBuZWVkZWRNaW4gLSBjdXJyZW50TWluICkgLyBsaW5lcy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGxpbmVzLmZvckVhY2goIGxpbmUgPT4ge1xyXG4gICAgICAgICAgICAgIGxpbmUubWluICs9IGxpbmVEZWx0YTtcclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gQWRqdXN0IGxpbmUgc2l6ZXMgdG8gdGhlIG1pblxyXG4gICAgICBsaW5lcy5mb3JFYWNoKCBsaW5lID0+IHtcclxuICAgICAgICAvLyBJZiB3ZSBoYXZlIG9yaWdpbi1zcGVjaWZpZWQgY29udGVudCwgd2UnbGwgbmVlZCB0byBpbmNsdWRlIHRoZSBtYXhpbXVtIG9yaWdpbiBzcGFuICh3aGljaCBtYXkgYmUgbGFyZ2VyKVxyXG4gICAgICAgIGlmICggbGluZS5oYXNPcmlnaW4oKSApIHtcclxuICAgICAgICAgIGxpbmUuc2l6ZSA9IE1hdGgubWF4KCBsaW5lLm1pbiwgbGluZS5tYXhPcmlnaW4gLSBsaW5lLm1pbk9yaWdpbiApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGxpbmUuc2l6ZSA9IGxpbmUubWluO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gTWluaW11bSBzaXplIG9mIG91ciBncmlkIGluIHRoaXMgb3JpZW50YXRpb25cclxuICAgICAgY29uc3QgbWluU2l6ZUFuZFNwYWNpbmcgPSBfLnN1bSggbGluZXMubWFwKCBsaW5lID0+IGxpbmUuc2l6ZSApICkgKyBfLnN1bSggbGluZVNwYWNpbmdzICk7XHJcbiAgICAgIG1pbmltdW1TaXplcy5zZXQoIG9yaWVudGF0aW9uLCBtaW5TaXplQW5kU3BhY2luZyApO1xyXG5cclxuICAgICAgLy8gQ29tcHV0ZSB0aGUgc2l6ZSBpbiB0aGlzIG9yaWVudGF0aW9uIChncm93aW5nIHRoZSBzaXplIHByb3BvcnRpb25hbGx5IGluIGxpbmVzIGFzIG5lY2Vzc2FyeSlcclxuICAgICAgY29uc3Qgc2l6ZSA9IE1hdGgubWF4KCBtaW5TaXplQW5kU3BhY2luZywgcHJlZmVycmVkU2l6ZXMuZ2V0KCBvcmllbnRhdGlvbiApIHx8IDAgKTtcclxuICAgICAgbGV0IHNpemVSZW1haW5pbmcgPSBzaXplIC0gbWluU2l6ZUFuZFNwYWNpbmc7XHJcbiAgICAgIGxldCBncm93YWJsZUxpbmVzO1xyXG4gICAgICB3aGlsZSAoIHNpemVSZW1haW5pbmcgPiAxZS03ICYmICggZ3Jvd2FibGVMaW5lcyA9IGxpbmVzLmZpbHRlciggbGluZSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGxpbmUuZ3JvdyA+IDAgJiYgbGluZS5zaXplIDwgbGluZS5tYXggLSAxZS03O1xyXG4gICAgICB9ICkgKS5sZW5ndGggKSB7XHJcbiAgICAgICAgY29uc3QgdG90YWxHcm93ID0gXy5zdW0oIGdyb3dhYmxlTGluZXMubWFwKCBsaW5lID0+IGxpbmUuZ3JvdyApICk7XHJcblxyXG4gICAgICAgIC8vIFdlIGNvdWxkIG5lZWQgdG8gc3RvcCBncm93aW5nIEVJVEhFUiB3aGVuIGEgbGluZSBoaXRzIGl0cyBtYXggT1Igd2hlbiB3ZSBydW4gb3V0IG9mIHNwYWNlIHJlbWFpbmluZy5cclxuICAgICAgICBjb25zdCBhbW91bnRUb0dyb3cgPSBNYXRoLm1pbihcclxuICAgICAgICAgIE1hdGgubWluKCAuLi5ncm93YWJsZUxpbmVzLm1hcCggbGluZSA9PiAoIGxpbmUubWF4IC0gbGluZS5zaXplICkgLyBsaW5lLmdyb3cgKSApLFxyXG4gICAgICAgICAgc2l6ZVJlbWFpbmluZyAvIHRvdGFsR3Jvd1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGFtb3VudFRvR3JvdyA+IDFlLTExICk7XHJcblxyXG4gICAgICAgIC8vIEdyb3cgcHJvcG9ydGlvbmFsbHkgdG8gdGhlaXIgZ3JvdyB2YWx1ZXNcclxuICAgICAgICBncm93YWJsZUxpbmVzLmZvckVhY2goIGxpbmUgPT4ge1xyXG4gICAgICAgICAgbGluZS5zaXplICs9IGFtb3VudFRvR3JvdyAqIGxpbmUuZ3JvdztcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgc2l6ZVJlbWFpbmluZyAtPSBhbW91bnRUb0dyb3cgKiB0b3RhbEdyb3c7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIExheW91dFxyXG4gICAgICBjb25zdCBzdGFydFBvc2l0aW9uID0gKCBsaW5lc1sgMCBdLmhhc09yaWdpbigpID8gbGluZXNbIDAgXS5taW5PcmlnaW4gOiAwICkgKyB0aGlzLmxheW91dE9yaWdpblByb3BlcnR5LnZhbHVlWyBvcmllbnRhdGlvbi5jb29yZGluYXRlIF07XHJcbiAgICAgIGxheW91dEJvdW5kc1sgb3JpZW50YXRpb24ubWluQ29vcmRpbmF0ZSBdID0gc3RhcnRQb3NpdGlvbjtcclxuICAgICAgbGF5b3V0Qm91bmRzWyBvcmllbnRhdGlvbi5tYXhDb29yZGluYXRlIF0gPSBzdGFydFBvc2l0aW9uICsgc2l6ZTtcclxuICAgICAgbGluZXMuZm9yRWFjaCggKCBsaW5lLCBhcnJheUluZGV4ICkgPT4ge1xyXG4gICAgICAgIC8vIFBvc2l0aW9uIGFsbCB0aGUgbGluZXNcclxuICAgICAgICBjb25zdCB0b3RhbFByZXZpb3VzTGluZVNpemVzID0gXy5zdW0oIGxpbmVzLnNsaWNlKCAwLCBhcnJheUluZGV4ICkubWFwKCBsaW5lID0+IGxpbmUuc2l6ZSApICk7XHJcbiAgICAgICAgY29uc3QgdG90YWxQcmV2aW91c1NwYWNpbmdzID0gXy5zdW0oIGxpbmVTcGFjaW5ncy5zbGljZSggMCwgYXJyYXlJbmRleCApICk7XHJcbiAgICAgICAgbGluZS5wb3NpdGlvbiA9IHN0YXJ0UG9zaXRpb24gKyB0b3RhbFByZXZpb3VzTGluZVNpemVzICsgdG90YWxQcmV2aW91c1NwYWNpbmdzO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGNlbGxzLmZvckVhY2goIGNlbGwgPT4ge1xyXG4gICAgICAgIC8vIFRoZSBsaW5lIGluZGV4IG9mIHRoZSBmaXJzdCBsaW5lIG91ciBjZWxsIGlzIGNvbXBvc2VkIG9mLlxyXG4gICAgICAgIGNvbnN0IGNlbGxGaXJzdEluZGV4UG9zaXRpb24gPSBjZWxsLnBvc2l0aW9uLmdldCggb3JpZW50YXRpb24gKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIHNpemUgb2Ygb3VyIGNlbGwgKHdpZHRoL2hlaWdodClcclxuICAgICAgICBjb25zdCBjZWxsU2l6ZSA9IGNlbGwuc2l6ZS5nZXQoIG9yaWVudGF0aW9uICk7XHJcblxyXG4gICAgICAgIC8vIFRoZSBsaW5lIGluZGV4IG9mIHRoZSBsYXN0IGxpbmUgb3VyIGNlbGwgaXMgY29tcG9zZWQgb2YuXHJcbiAgICAgICAgY29uc3QgY2VsbExhc3RJbmRleFBvc2l0aW9uID0gY2VsbEZpcnN0SW5kZXhQb3NpdGlvbiArIGNlbGxTaXplIC0gMTtcclxuXHJcbiAgICAgICAgLy8gQWxsIHRoZSBsaW5lcyBvdXIgY2VsbCBpcyBjb21wb3NlZCBvZi5cclxuICAgICAgICBjb25zdCBjZWxsTGluZXMgPSBjZWxsLmdldEluZGljZXMoIG9yaWVudGF0aW9uICkubWFwKCBpbmRleCA9PiBsaW5lTWFwLmdldCggaW5kZXggKSEgKTtcclxuXHJcbiAgICAgICAgY29uc3QgZmlyc3RMaW5lID0gbGluZU1hcC5nZXQoIGNlbGxGaXJzdEluZGV4UG9zaXRpb24gKSE7XHJcblxyXG4gICAgICAgIC8vIElmIHdlJ3JlIHNwYW5uaW5nIG11bHRpcGxlIGxpbmVzLCB3ZSBoYXZlIHRvIGluY2x1ZGUgdGhlIHNwYWNpbmcgdGhhdCB3ZSd2ZSBcImFic29yYmVkXCIgKGlmIHdlIGhhdmUgYSBjZWxsXHJcbiAgICAgICAgLy8gdGhhdCBzcGFucyBjb2x1bW5zIDIgYW5kIDMsIHdlJ2xsIG5lZWQgdG8gaW5jbHVkZSB0aGUgc3BhY2luZyBiZXR3ZWVuIDIgYW5kIDMuXHJcbiAgICAgICAgbGV0IGludGVyaW9yQWJzb3JiZWRTcGFjaW5nID0gMDtcclxuICAgICAgICBpZiAoIGNlbGxGaXJzdEluZGV4UG9zaXRpb24gIT09IGNlbGxMYXN0SW5kZXhQb3NpdGlvbiApIHtcclxuICAgICAgICAgIGxpbmVzLnNsaWNlKCAwLCAtMSApLmZvckVhY2goICggbGluZSwgbGluZUluZGV4ICkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIGxpbmUuaW5kZXggPj0gY2VsbEZpcnN0SW5kZXhQb3NpdGlvbiAmJiBsaW5lLmluZGV4IDwgY2VsbExhc3RJbmRleFBvc2l0aW9uICkge1xyXG4gICAgICAgICAgICAgIGludGVyaW9yQWJzb3JiZWRTcGFjaW5nICs9IGxpbmVTcGFjaW5nc1sgbGluZUluZGV4IF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE91ciBzaXplIGluY2x1ZGVzIHRoZSBsaW5lIHNpemVzIGFuZCBzcGFjaW5nc1xyXG4gICAgICAgIGNvbnN0IGNlbGxBdmFpbGFibGVTaXplID0gXy5zdW0oIGNlbGxMaW5lcy5tYXAoIGxpbmUgPT4gbGluZS5zaXplICkgKSArIGludGVyaW9yQWJzb3JiZWRTcGFjaW5nO1xyXG4gICAgICAgIGNvbnN0IGNlbGxQb3NpdGlvbiA9IGZpcnN0TGluZS5wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgLy8gQWRqdXN0IHByZWZlcnJlZCBzaXplIGFuZCBtb3ZlIHRoZSBjZWxsXHJcbiAgICAgICAgY29uc3QgY2VsbEJvdW5kcyA9IGNlbGwucmVwb3NpdGlvbihcclxuICAgICAgICAgIG9yaWVudGF0aW9uLFxyXG4gICAgICAgICAgY2VsbEF2YWlsYWJsZVNpemUsXHJcbiAgICAgICAgICBjZWxsUG9zaXRpb24sXHJcbiAgICAgICAgICBjZWxsLmdldEVmZmVjdGl2ZVN0cmV0Y2goIG9yaWVudGF0aW9uICksXHJcbiAgICAgICAgICAtZmlyc3RMaW5lLm1pbk9yaWdpbixcclxuICAgICAgICAgIGNlbGwuZ2V0RWZmZWN0aXZlQWxpZ24oIG9yaWVudGF0aW9uIClcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBsYXlvdXRCb3VuZHNbIG9yaWVudGF0aW9uLm1pbkNvb3JkaW5hdGUgXSA9IE1hdGgubWluKCBsYXlvdXRCb3VuZHNbIG9yaWVudGF0aW9uLm1pbkNvb3JkaW5hdGUgXSwgY2VsbEJvdW5kc1sgb3JpZW50YXRpb24ubWluQ29vcmRpbmF0ZSBdICk7XHJcbiAgICAgICAgbGF5b3V0Qm91bmRzWyBvcmllbnRhdGlvbi5tYXhDb29yZGluYXRlIF0gPSBNYXRoLm1heCggbGF5b3V0Qm91bmRzWyBvcmllbnRhdGlvbi5tYXhDb29yZGluYXRlIF0sIGNlbGxCb3VuZHNbIG9yaWVudGF0aW9uLm1heENvb3JkaW5hdGUgXSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gV2UncmUgdGFraW5nIHVwIHRoZXNlIGxheW91dCBib3VuZHMgKG5vZGVzIGNvdWxkIHVzZSB0aGVtIGZvciBsb2NhbEJvdW5kcylcclxuICAgIHRoaXMubGF5b3V0Qm91bmRzUHJvcGVydHkudmFsdWUgPSBsYXlvdXRCb3VuZHM7XHJcblxyXG4gICAgdGhpcy5taW5pbXVtV2lkdGhQcm9wZXJ0eS52YWx1ZSA9IG1pbmltdW1TaXplcy5ob3Jpem9udGFsO1xyXG4gICAgdGhpcy5taW5pbXVtSGVpZ2h0UHJvcGVydHkudmFsdWUgPSBtaW5pbXVtU2l6ZXMudmVydGljYWw7XHJcblxyXG4gICAgdGhpcy5maW5pc2hlZExheW91dEVtaXR0ZXIuZW1pdCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBzcGFjaW5nKCk6IG51bWJlciB8IG51bWJlcltdIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMueFNwYWNpbmcgPT09IHRoaXMueVNwYWNpbmcgKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy54U3BhY2luZztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgc3BhY2luZyggdmFsdWU6IG51bWJlciB8IG51bWJlcltdICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggKCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB2YWx1ZSApICYmIHZhbHVlID49IDAgKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgKCBBcnJheS5pc0FycmF5KCB2YWx1ZSApICYmIF8uZXZlcnkoIHZhbHVlLCBpdGVtID0+ICggdHlwZW9mIGl0ZW0gPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBpdGVtICkgJiYgaXRlbSA+PSAwICkgKSApICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9zcGFjaW5nLmdldCggT3JpZW50YXRpb24uSE9SSVpPTlRBTCApICE9PSB2YWx1ZSB8fCB0aGlzLl9zcGFjaW5nLmdldCggT3JpZW50YXRpb24uVkVSVElDQUwgKSAhPT0gdmFsdWUgKSB7XHJcbiAgICAgIHRoaXMuX3NwYWNpbmcuc2V0KCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMLCB2YWx1ZSApO1xyXG4gICAgICB0aGlzLl9zcGFjaW5nLnNldCggT3JpZW50YXRpb24uVkVSVElDQUwsIHZhbHVlICk7XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgeFNwYWNpbmcoKTogbnVtYmVyIHwgbnVtYmVyW10ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NwYWNpbmcuZ2V0KCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHhTcGFjaW5nKCB2YWx1ZTogbnVtYmVyIHwgbnVtYmVyW10gKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAoIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHZhbHVlICkgJiYgdmFsdWUgPj0gMCApIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAoIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgJiYgXy5ldmVyeSggdmFsdWUsIGl0ZW0gPT4gKCB0eXBlb2YgaXRlbSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIGl0ZW0gKSAmJiBpdGVtID49IDAgKSApICkgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX3NwYWNpbmcuZ2V0KCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMICkgIT09IHZhbHVlICkge1xyXG4gICAgICB0aGlzLl9zcGFjaW5nLnNldCggT3JpZW50YXRpb24uSE9SSVpPTlRBTCwgdmFsdWUgKTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlTGF5b3V0QXV0b21hdGljYWxseSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCB5U3BhY2luZygpOiBudW1iZXIgfCBudW1iZXJbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3BhY2luZy5nZXQoIE9yaWVudGF0aW9uLlZFUlRJQ0FMICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHlTcGFjaW5nKCB2YWx1ZTogbnVtYmVyIHwgbnVtYmVyW10gKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAoIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHZhbHVlICkgJiYgdmFsdWUgPj0gMCApIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAoIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgJiYgXy5ldmVyeSggdmFsdWUsIGl0ZW0gPT4gKCB0eXBlb2YgaXRlbSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIGl0ZW0gKSAmJiBpdGVtID49IDAgKSApICkgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX3NwYWNpbmcuZ2V0KCBPcmllbnRhdGlvbi5WRVJUSUNBTCApICE9PSB2YWx1ZSApIHtcclxuICAgICAgdGhpcy5fc3BhY2luZy5zZXQoIE9yaWVudGF0aW9uLlZFUlRJQ0FMLCB2YWx1ZSApO1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYWRkQ2VsbCggY2VsbDogR3JpZENlbGwgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5jZWxscy5oYXMoIGNlbGwgKSApO1xyXG5cclxuICAgIHRoaXMuY2VsbHMuYWRkKCBjZWxsICk7XHJcbiAgICB0aGlzLmFkZE5vZGUoIGNlbGwubm9kZSApO1xyXG4gICAgY2VsbC5jaGFuZ2VkRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZW1vdmVDZWxsKCBjZWxsOiBHcmlkQ2VsbCApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY2VsbHMuaGFzKCBjZWxsICkgKTtcclxuXHJcbiAgICB0aGlzLmNlbGxzLmRlbGV0ZSggY2VsbCApO1xyXG4gICAgdGhpcy5yZW1vdmVOb2RlKCBjZWxsLm5vZGUgKTtcclxuICAgIGNlbGwuY2hhbmdlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuX3VwZGF0ZUxheW91dExpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICAvLyBMb2NrIGR1cmluZyBkaXNwb3NhbCB0byBhdm9pZCBsYXlvdXQgY2FsbHNcclxuICAgIHRoaXMubG9jaygpO1xyXG5cclxuICAgIFsgLi4udGhpcy5jZWxscyBdLmZvckVhY2goIGNlbGwgPT4gdGhpcy5yZW1vdmVDZWxsKCBjZWxsICkgKTtcclxuXHJcbiAgICB0aGlzLmRpc3BsYXllZExpbmVzLmZvckVhY2goIG1hcCA9PiBtYXAuY2xlYXIoKSApO1xyXG4gICAgdGhpcy5kaXNwbGF5ZWRDZWxscyA9IFtdO1xyXG5cclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuXHJcbiAgICB0aGlzLnVubG9jaygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEluZGljZXMoIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiApOiBudW1iZXJbXSB7XHJcbiAgICBjb25zdCByZXN1bHQ6IG51bWJlcltdID0gW107XHJcblxyXG4gICAgdGhpcy5jZWxscy5mb3JFYWNoKCBjZWxsID0+IHtcclxuICAgICAgcmVzdWx0LnB1c2goIC4uLmNlbGwuZ2V0SW5kaWNlcyggb3JpZW50YXRpb24gKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBfLnNvcnRlZFVuaXEoIF8uc29ydEJ5KCByZXN1bHQgKSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldENlbGwoIHJvdzogbnVtYmVyLCBjb2x1bW46IG51bWJlciApOiBHcmlkQ2VsbCB8IG51bGwge1xyXG4gICAgcmV0dXJuIF8uZmluZCggWyAuLi50aGlzLmNlbGxzIF0sIGNlbGwgPT4gY2VsbC5jb250YWluc1Jvdyggcm93ICkgJiYgY2VsbC5jb250YWluc0NvbHVtbiggY29sdW1uICkgKSB8fCBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldENlbGxGcm9tTm9kZSggbm9kZTogTm9kZSApOiBHcmlkQ2VsbCB8IG51bGwge1xyXG4gICAgcmV0dXJuIF8uZmluZCggWyAuLi50aGlzLmNlbGxzIF0sIGNlbGwgPT4gY2VsbC5ub2RlID09PSBub2RlICkgfHwgbnVsbDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRDZWxscyggb3JpZW50YXRpb246IE9yaWVudGF0aW9uLCBpbmRleDogbnVtYmVyICk6IEdyaWRDZWxsW10ge1xyXG4gICAgcmV0dXJuIF8uZmlsdGVyKCBbIC4uLnRoaXMuY2VsbHMgXSwgY2VsbCA9PiBjZWxsLmNvbnRhaW5zSW5kZXgoIG9yaWVudGF0aW9uLCBpbmRleCApICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZSggYW5jZXN0b3JOb2RlOiBOb2RlLCBvcHRpb25zPzogR3JpZENvbnN0cmFpbnRPcHRpb25zICk6IEdyaWRDb25zdHJhaW50IHtcclxuICAgIHJldHVybiBuZXcgR3JpZENvbnN0cmFpbnQoIGFuY2VzdG9yTm9kZSwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0dyaWRDb25zdHJhaW50JywgR3JpZENvbnN0cmFpbnQgKTtcclxuZXhwb3J0IHsgR1JJRF9DT05TVFJBSU5UX09QVElPTl9LRVlTIH07XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxlQUFlLE1BQU0sNkNBQTZDO0FBQ3pFLE9BQU9DLE1BQU0sTUFBTSxvQ0FBb0M7QUFDdkQsU0FBMENDLDZCQUE2QixFQUFZQyxnQkFBZ0IsRUFBRUMsUUFBUSxFQUFFQyxXQUFXLEVBQThDQyxvQkFBb0IsRUFBRUMsT0FBTyxRQUFRLGtCQUFrQjtBQUcvTixNQUFNQywyQkFBMkIsR0FBRyxDQUNsQyxHQUFHTiw2QkFBNkIsRUFDaEMsa0JBQWtCLEVBQ2xCLFNBQVMsRUFDVCxVQUFV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