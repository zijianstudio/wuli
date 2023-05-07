// Copyright 2021-2023, University of Colorado Boulder

/**
 * Main flow-layout logic. Usually used indirectly through FlowBox, but can also be used directly (say, if nodes don't
 * have the same parent, or a FlowBox can't be used).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import mutate from '../../../../phet-core/js/mutate.js';
import { FLOW_CONFIGURABLE_OPTION_KEYS, FlowConfigurable, FlowLine, LayoutAlign, LayoutJustification, NodeLayoutConstraint, scenery } from '../../imports.js';
const FLOW_CONSTRAINT_OPTION_KEYS = [...FLOW_CONFIGURABLE_OPTION_KEYS, 'spacing', 'lineSpacing', 'justify', 'justifyLines', 'wrap', 'excludeInvisible'];
export default class FlowConstraint extends FlowConfigurable(NodeLayoutConstraint) {
  cells = [];
  _justify = LayoutJustification.SPACE_BETWEEN;
  _justifyLines = null;
  _wrap = false;
  _spacing = 0;
  _lineSpacing = 0;

  // (scenery-internal)
  displayedCells = [];
  constructor(ancestorNode, providedOptions) {
    super(ancestorNode, providedOptions);

    // Set configuration to actual default values (instead of null) so that we will have guaranteed non-null
    // (non-inherit) values for our computations.
    this.setConfigToBaseDefault();
    this.mutateConfigurable(providedOptions);
    mutate(this, FLOW_CONSTRAINT_OPTION_KEYS, providedOptions);

    // Key configuration changes to relayout
    this.changedEmitter.addListener(this._updateLayoutListener);
    this.orientationChangedEmitter.addListener(() => this.cells.forEach(cell => {
      cell.orientation = this.orientation;
    }));
  }
  updateSeparatorVisibility() {
    // Find the index of the first visible non-separator cell. Then hide all separators until this index.
    // This is needed, so that we do NOT temporarily change the visibility of separators back-and-forth during the
    // layout. If we did that, it would trigger a layout inside every layout, leading to an infinite loop.
    // This is effectively done so that we have NO visible separators in front of the first visible non-separator cell
    // (thus satisfying our separator constraints).
    let firstVisibleNonSeparatorIndex = 0;
    for (; firstVisibleNonSeparatorIndex < this.cells.length; firstVisibleNonSeparatorIndex++) {
      const cell = this.cells[firstVisibleNonSeparatorIndex];
      if (cell._isSeparator) {
        cell.node.visible = false;
      } else if (cell.node.visible) {
        break;
      }
    }

    // Scan for separators, toggling visibility as desired. Leave the "last" separator visible, as if they are marking
    // sections "after" themselves.
    let hasVisibleNonSeparator = false;
    for (let i = this.cells.length - 1; i > firstVisibleNonSeparatorIndex; i--) {
      const cell = this.cells[i];
      if (cell._isSeparator) {
        cell.node.visible = hasVisibleNonSeparator;
        hasVisibleNonSeparator = false;
      } else if (cell.node.visible) {
        hasVisibleNonSeparator = true;
      }
    }
  }
  layout() {
    super.layout();

    // The orientation along the laid-out lines - also known as the "primary" axis
    const orientation = this._orientation;

    // The perpendicular orientation, where alignment is handled - also known as the "secondary" axis
    const oppositeOrientation = this._orientation.opposite;
    this.updateSeparatorVisibility();

    // Filter to only cells used in the layout
    const cells = this.filterLayoutCells(this.cells);
    this.displayedCells = cells;
    if (!cells.length) {
      this.layoutBoundsProperty.value = Bounds2.NOTHING;
      this.minimumWidthProperty.value = null;
      this.minimumHeightProperty.value = null;
      return;
    }

    // Determine our preferred sizes (they can be null, in which case)
    let preferredSize = this.getPreferredProperty(orientation).value;
    const preferredOppositeSize = this.getPreferredProperty(oppositeOrientation).value;

    // What is the largest of the minimum sizes of cells (e.g. if we're wrapping, this would be our minimum size)
    const maxMinimumCellSize = Math.max(...cells.map(cell => cell.getMinimumSize(orientation) || 0));

    // If we can't fit the content... just pretend like we have a larger preferred size!
    if (maxMinimumCellSize > (preferredSize || Number.POSITIVE_INFINITY)) {
      preferredSize = maxMinimumCellSize;
    }

    // Wrapping all the cells into lines
    const lines = [];
    if (this.wrap) {
      let currentLineCells = [];
      let availableSpace = preferredSize || Number.POSITIVE_INFINITY;
      while (cells.length) {
        const cell = cells.shift();
        const cellSpace = cell.getMinimumSize(orientation);

        // If we're the very first cell, don't create a new line
        if (currentLineCells.length === 0) {
          currentLineCells.push(cell);
          availableSpace -= cellSpace;
        }
        // Our cell fits! Epsilon for avoiding floating point issues
        else if (this.spacing + cellSpace <= availableSpace + 1e-7) {
          currentLineCells.push(cell);
          availableSpace -= this.spacing + cellSpace;
        }
        // We don't fit, create a new line
        else {
          lines.push(FlowLine.pool.create(orientation, currentLineCells));
          availableSpace = preferredSize || Number.POSITIVE_INFINITY;
          currentLineCells = [cell];
          availableSpace -= cellSpace;
        }
      }
      if (currentLineCells.length) {
        lines.push(FlowLine.pool.create(orientation, currentLineCells));
      }
    } else {
      lines.push(FlowLine.pool.create(orientation, cells));
    }

    // Determine line opposite-orientation min/max sizes and origin sizes (how tall will a row have to be?)
    lines.forEach(line => {
      line.cells.forEach(cell => {
        line.min = Math.max(line.min, cell.getMinimumSize(oppositeOrientation));
        line.max = Math.min(line.max, cell.getMaximumSize(oppositeOrientation));

        // For origin-specified cells, we will record their maximum reach from the origin, so these can be "summed"
        // (since the origin line may end up taking more space).
        if (cell.effectiveAlign === LayoutAlign.ORIGIN) {
          const originBounds = cell.getOriginBounds();
          line.minOrigin = Math.min(originBounds[oppositeOrientation.minCoordinate], line.minOrigin);
          line.maxOrigin = Math.max(originBounds[oppositeOrientation.maxCoordinate], line.maxOrigin);
        }
      });

      // If we have align:origin content, we need to see if the maximum origin span is larger than or line's
      // minimum size.
      if (isFinite(line.minOrigin) && isFinite(line.maxOrigin)) {
        line.size = Math.max(line.min, line.maxOrigin - line.minOrigin);
      } else {
        line.size = line.min;
      }
    });

    // Given our wrapped lines, what is our minimum size we could take up?
    const minimumCurrentSize = Math.max(...lines.map(line => line.getMinimumSize(this.spacing)));
    const minimumCurrentOppositeSize = _.sum(lines.map(line => line.size)) + (lines.length - 1) * this.lineSpacing;

    // Used for determining our "minimum" size for preferred sizes... if wrapping is enabled, we can be smaller than
    // current minimums
    const minimumAllowableSize = this.wrap ? maxMinimumCellSize : minimumCurrentSize;

    // Increase things if our preferred size is larger than our minimums (we'll figure out how to compensate
    // for the extra space below).
    const size = Math.max(minimumCurrentSize, preferredSize || 0);
    const oppositeSize = Math.max(minimumCurrentOppositeSize, preferredOppositeSize || 0);

    // Our layout origin (usually the upper-left of the content in local coordinates, but could be different based on
    // align:origin content.
    const originPrimary = this.layoutOriginProperty.value[orientation.coordinate];
    const originSecondary = this.layoutOriginProperty.value[orientation.opposite.coordinate];

    // Primary-direction layout
    lines.forEach(line => {
      const minimumContent = _.sum(line.cells.map(cell => cell.getMinimumSize(orientation)));
      const spacingAmount = this.spacing * (line.cells.length - 1);
      let spaceRemaining = size - minimumContent - spacingAmount;

      // Initial pending sizes
      line.cells.forEach(cell => {
        cell.size = cell.getMinimumSize(orientation);
      });

      // Grow potential sizes if possible
      let growableCells;
      while (spaceRemaining > 1e-7 && (growableCells = line.cells.filter(cell => {
        // Can the cell grow more?
        return cell.effectiveGrow !== 0 && cell.size < cell.getMaximumSize(orientation) - 1e-7;
      })).length) {
        // Total sum of "grow" values in cells that could potentially grow
        const totalGrow = _.sum(growableCells.map(cell => cell.effectiveGrow));
        const amountToGrow = Math.min(
        // Smallest amount that any of the cells couldn't grow past (note: proportional to effectiveGrow)
        Math.min(...growableCells.map(cell => (cell.getMaximumSize(orientation) - cell.size) / cell.effectiveGrow)),
        // Amount each cell grows if all of our extra space fits in ALL the cells
        spaceRemaining / totalGrow);
        assert && assert(amountToGrow > 1e-11);
        growableCells.forEach(cell => {
          cell.size += amountToGrow * cell.effectiveGrow;
        });
        spaceRemaining -= amountToGrow * totalGrow;
      }

      // Update preferred dimension based on the pending size
      line.cells.forEach(cell => cell.attemptPreferredSize(orientation, cell.size));

      // Gives additional spacing based on justification
      const primarySpacingFunction = this._justify.spacingFunctionFactory(spaceRemaining, line.cells.length);
      let position = originPrimary;
      line.cells.forEach((cell, index) => {
        // Always include justify spacing
        position += primarySpacingFunction(index);

        // Only include normal spacing between items
        if (index > 0) {
          position += this.spacing;
        }

        // ACTUALLY position it!
        cell.positionStart(orientation, position);
        cell.lastAvailableBounds[orientation.minCoordinate] = position;
        cell.lastAvailableBounds[orientation.maxCoordinate] = position + cell.size;
        position += cell.size;
        assert && assert(this.spacing >= 0 || cell.size >= -this.spacing - 1e-7, 'Negative spacing more than a cell\'s size causes issues with layout');
      });
    });

    // Secondary-direction layout
    const oppositeSpaceRemaining = oppositeSize - minimumCurrentOppositeSize;
    const initialOppositePosition = (lines[0].hasOrigin() ? lines[0].minOrigin : 0) + originSecondary;
    let oppositePosition = initialOppositePosition;
    if (this._justifyLines === null) {
      // null justifyLines will result in expanding all of our lines into the remaining space.

      // Add space remaining evenly (for now) since we don't have any grow values
      lines.forEach(line => {
        line.size += oppositeSpaceRemaining / lines.length;
      });

      // Position the lines
      lines.forEach(line => {
        line.position = oppositePosition;
        oppositePosition += line.size + this.lineSpacing;
      });
    } else {
      // If we're justifying lines, we won't add any additional space into things
      const spacingFunction = this._justifyLines.spacingFunctionFactory(oppositeSpaceRemaining, lines.length);
      lines.forEach((line, index) => {
        oppositePosition += spacingFunction(index);
        line.position = oppositePosition;
        oppositePosition += line.size + this.lineSpacing;
      });
    }
    lines.forEach(line => line.cells.forEach(cell => {
      cell.reposition(oppositeOrientation, line.size, line.position, cell.effectiveStretch, -line.minOrigin, cell.effectiveAlign);
    }));

    // Determine the size we actually take up (localBounds for the FlowBox will use this)
    const minCoordinate = originPrimary;
    const maxCoordinate = originPrimary + size;
    const minOppositeCoordinate = initialOppositePosition;
    const maxOppositeCoordinate = initialOppositePosition + oppositeSize;

    // We're taking up these layout bounds (nodes could use them for localBounds)
    this.layoutBoundsProperty.value = Bounds2.oriented(orientation, minCoordinate, minOppositeCoordinate, maxCoordinate, maxOppositeCoordinate);

    // Tell others about our new "minimum" sizes
    this.minimumWidthProperty.value = orientation === Orientation.HORIZONTAL ? minimumAllowableSize : minimumCurrentOppositeSize;
    this.minimumHeightProperty.value = orientation === Orientation.HORIZONTAL ? minimumCurrentOppositeSize : minimumAllowableSize;
    this.finishedLayoutEmitter.emit();
    lines.forEach(line => line.clean());
  }
  get justify() {
    const result = LayoutJustification.internalToJustify(this._orientation, this._justify);
    assert && assert(LayoutJustification.getAllowedJustificationValues(this._orientation).includes(result));
    return result;
  }
  set justify(value) {
    assert && assert(LayoutJustification.getAllowedJustificationValues(this._orientation).includes(value), `justify ${value} not supported, with the orientation ${this._orientation}, the valid values are ${LayoutJustification.getAllowedJustificationValues(this._orientation)}`);

    // remapping align values to an independent set, so they aren't orientation-dependent
    const mappedValue = LayoutJustification.justifyToInternal(this._orientation, value);
    if (this._justify !== mappedValue) {
      this._justify = mappedValue;
      this.updateLayoutAutomatically();
    }
  }
  get justifyLines() {
    if (this._justifyLines === null) {
      return null;
    } else {
      const result = LayoutJustification.internalToJustify(this._orientation, this._justifyLines);
      assert && assert(LayoutJustification.getAllowedJustificationValues(this._orientation).includes(result));
      return result;
    }
  }
  set justifyLines(value) {
    assert && assert(value === null || LayoutJustification.getAllowedJustificationValues(this._orientation.opposite).includes(value), `justify ${value} not supported, with the orientation ${this._orientation.opposite}, the valid values are ${LayoutJustification.getAllowedJustificationValues(this._orientation.opposite)} or null`);

    // remapping align values to an independent set, so they aren't orientation-dependent
    const mappedValue = value === null ? null : LayoutJustification.justifyToInternal(this._orientation.opposite, value);
    assert && assert(mappedValue === null || mappedValue instanceof LayoutJustification);
    if (this._justifyLines !== mappedValue) {
      this._justifyLines = mappedValue;
      this.updateLayoutAutomatically();
    }
  }
  get wrap() {
    return this._wrap;
  }
  set wrap(value) {
    if (this._wrap !== value) {
      this._wrap = value;
      this.updateLayoutAutomatically();
    }
  }
  get spacing() {
    return this._spacing;
  }
  set spacing(value) {
    assert && assert(isFinite(value));
    if (this._spacing !== value) {
      this._spacing = value;
      this.updateLayoutAutomatically();
    }
  }
  get lineSpacing() {
    return this._lineSpacing;
  }
  set lineSpacing(value) {
    assert && assert(isFinite(value));
    if (this._lineSpacing !== value) {
      this._lineSpacing = value;
      this.updateLayoutAutomatically();
    }
  }
  insertCell(index, cell) {
    assert && assert(index >= 0);
    assert && assert(index <= this.cells.length);
    assert && assert(!_.includes(this.cells, cell));
    cell.orientation = this.orientation;
    this.cells.splice(index, 0, cell);
    this.addNode(cell.node);
    cell.changedEmitter.addListener(this._updateLayoutListener);
    this.updateLayoutAutomatically();
  }
  removeCell(cell) {
    assert && assert(_.includes(this.cells, cell));
    arrayRemove(this.cells, cell);
    this.removeNode(cell.node);
    cell.changedEmitter.removeListener(this._updateLayoutListener);
    this.updateLayoutAutomatically();
  }
  reorderCells(cells, minChangeIndex, maxChangeIndex) {
    this.cells.splice(minChangeIndex, maxChangeIndex - minChangeIndex + 1, ...cells);
    this.updateLayoutAutomatically();
  }

  // (scenery-internal)
  getPreferredProperty(orientation) {
    return orientation === Orientation.HORIZONTAL ? this.preferredWidthProperty : this.preferredHeightProperty;
  }

  /**
   * Releases references
   */
  dispose() {
    // Lock during disposal to avoid layout calls
    this.lock();
    this.cells.forEach(cell => this.removeCell(cell));
    this.displayedCells = [];
    super.dispose();
    this.unlock();
  }
  static create(ancestorNode, options) {
    return new FlowConstraint(ancestorNode, options);
  }
}
scenery.register('FlowConstraint', FlowConstraint);
export { FLOW_CONSTRAINT_OPTION_KEYS };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiT3JpZW50YXRpb24iLCJhcnJheVJlbW92ZSIsIm11dGF0ZSIsIkZMT1dfQ09ORklHVVJBQkxFX09QVElPTl9LRVlTIiwiRmxvd0NvbmZpZ3VyYWJsZSIsIkZsb3dMaW5lIiwiTGF5b3V0QWxpZ24iLCJMYXlvdXRKdXN0aWZpY2F0aW9uIiwiTm9kZUxheW91dENvbnN0cmFpbnQiLCJzY2VuZXJ5IiwiRkxPV19DT05TVFJBSU5UX09QVElPTl9LRVlTIiwiRmxvd0NvbnN0cmFpbnQiLCJjZWxscyIsIl9qdXN0aWZ5IiwiU1BBQ0VfQkVUV0VFTiIsIl9qdXN0aWZ5TGluZXMiLCJfd3JhcCIsIl9zcGFjaW5nIiwiX2xpbmVTcGFjaW5nIiwiZGlzcGxheWVkQ2VsbHMiLCJjb25zdHJ1Y3RvciIsImFuY2VzdG9yTm9kZSIsInByb3ZpZGVkT3B0aW9ucyIsInNldENvbmZpZ1RvQmFzZURlZmF1bHQiLCJtdXRhdGVDb25maWd1cmFibGUiLCJjaGFuZ2VkRW1pdHRlciIsImFkZExpc3RlbmVyIiwiX3VwZGF0ZUxheW91dExpc3RlbmVyIiwib3JpZW50YXRpb25DaGFuZ2VkRW1pdHRlciIsImZvckVhY2giLCJjZWxsIiwib3JpZW50YXRpb24iLCJ1cGRhdGVTZXBhcmF0b3JWaXNpYmlsaXR5IiwiZmlyc3RWaXNpYmxlTm9uU2VwYXJhdG9ySW5kZXgiLCJsZW5ndGgiLCJfaXNTZXBhcmF0b3IiLCJub2RlIiwidmlzaWJsZSIsImhhc1Zpc2libGVOb25TZXBhcmF0b3IiLCJpIiwibGF5b3V0IiwiX29yaWVudGF0aW9uIiwib3Bwb3NpdGVPcmllbnRhdGlvbiIsIm9wcG9zaXRlIiwiZmlsdGVyTGF5b3V0Q2VsbHMiLCJsYXlvdXRCb3VuZHNQcm9wZXJ0eSIsInZhbHVlIiwiTk9USElORyIsIm1pbmltdW1XaWR0aFByb3BlcnR5IiwibWluaW11bUhlaWdodFByb3BlcnR5IiwicHJlZmVycmVkU2l6ZSIsImdldFByZWZlcnJlZFByb3BlcnR5IiwicHJlZmVycmVkT3Bwb3NpdGVTaXplIiwibWF4TWluaW11bUNlbGxTaXplIiwiTWF0aCIsIm1heCIsIm1hcCIsImdldE1pbmltdW1TaXplIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJsaW5lcyIsIndyYXAiLCJjdXJyZW50TGluZUNlbGxzIiwiYXZhaWxhYmxlU3BhY2UiLCJzaGlmdCIsImNlbGxTcGFjZSIsInB1c2giLCJzcGFjaW5nIiwicG9vbCIsImNyZWF0ZSIsImxpbmUiLCJtaW4iLCJnZXRNYXhpbXVtU2l6ZSIsImVmZmVjdGl2ZUFsaWduIiwiT1JJR0lOIiwib3JpZ2luQm91bmRzIiwiZ2V0T3JpZ2luQm91bmRzIiwibWluT3JpZ2luIiwibWluQ29vcmRpbmF0ZSIsIm1heE9yaWdpbiIsIm1heENvb3JkaW5hdGUiLCJpc0Zpbml0ZSIsInNpemUiLCJtaW5pbXVtQ3VycmVudFNpemUiLCJtaW5pbXVtQ3VycmVudE9wcG9zaXRlU2l6ZSIsIl8iLCJzdW0iLCJsaW5lU3BhY2luZyIsIm1pbmltdW1BbGxvd2FibGVTaXplIiwib3Bwb3NpdGVTaXplIiwib3JpZ2luUHJpbWFyeSIsImxheW91dE9yaWdpblByb3BlcnR5IiwiY29vcmRpbmF0ZSIsIm9yaWdpblNlY29uZGFyeSIsIm1pbmltdW1Db250ZW50Iiwic3BhY2luZ0Ftb3VudCIsInNwYWNlUmVtYWluaW5nIiwiZ3Jvd2FibGVDZWxscyIsImZpbHRlciIsImVmZmVjdGl2ZUdyb3ciLCJ0b3RhbEdyb3ciLCJhbW91bnRUb0dyb3ciLCJhc3NlcnQiLCJhdHRlbXB0UHJlZmVycmVkU2l6ZSIsInByaW1hcnlTcGFjaW5nRnVuY3Rpb24iLCJzcGFjaW5nRnVuY3Rpb25GYWN0b3J5IiwicG9zaXRpb24iLCJpbmRleCIsInBvc2l0aW9uU3RhcnQiLCJsYXN0QXZhaWxhYmxlQm91bmRzIiwib3Bwb3NpdGVTcGFjZVJlbWFpbmluZyIsImluaXRpYWxPcHBvc2l0ZVBvc2l0aW9uIiwiaGFzT3JpZ2luIiwib3Bwb3NpdGVQb3NpdGlvbiIsInNwYWNpbmdGdW5jdGlvbiIsInJlcG9zaXRpb24iLCJlZmZlY3RpdmVTdHJldGNoIiwibWluT3Bwb3NpdGVDb29yZGluYXRlIiwibWF4T3Bwb3NpdGVDb29yZGluYXRlIiwib3JpZW50ZWQiLCJIT1JJWk9OVEFMIiwiZmluaXNoZWRMYXlvdXRFbWl0dGVyIiwiZW1pdCIsImNsZWFuIiwianVzdGlmeSIsInJlc3VsdCIsImludGVybmFsVG9KdXN0aWZ5IiwiZ2V0QWxsb3dlZEp1c3RpZmljYXRpb25WYWx1ZXMiLCJpbmNsdWRlcyIsIm1hcHBlZFZhbHVlIiwianVzdGlmeVRvSW50ZXJuYWwiLCJ1cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5IiwianVzdGlmeUxpbmVzIiwiaW5zZXJ0Q2VsbCIsInNwbGljZSIsImFkZE5vZGUiLCJyZW1vdmVDZWxsIiwicmVtb3ZlTm9kZSIsInJlbW92ZUxpc3RlbmVyIiwicmVvcmRlckNlbGxzIiwibWluQ2hhbmdlSW5kZXgiLCJtYXhDaGFuZ2VJbmRleCIsInByZWZlcnJlZFdpZHRoUHJvcGVydHkiLCJwcmVmZXJyZWRIZWlnaHRQcm9wZXJ0eSIsImRpc3Bvc2UiLCJsb2NrIiwidW5sb2NrIiwib3B0aW9ucyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRmxvd0NvbnN0cmFpbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBmbG93LWxheW91dCBsb2dpYy4gVXN1YWxseSB1c2VkIGluZGlyZWN0bHkgdGhyb3VnaCBGbG93Qm94LCBidXQgY2FuIGFsc28gYmUgdXNlZCBkaXJlY3RseSAoc2F5LCBpZiBub2RlcyBkb24ndFxyXG4gKiBoYXZlIHRoZSBzYW1lIHBhcmVudCwgb3IgYSBGbG93Qm94IGNhbid0IGJlIHVzZWQpLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcclxuaW1wb3J0IGFycmF5UmVtb3ZlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hcnJheVJlbW92ZS5qcyc7XHJcbmltcG9ydCBtdXRhdGUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL211dGF0ZS5qcyc7XHJcbmltcG9ydCB7IEV4dGVybmFsRmxvd0NvbmZpZ3VyYWJsZU9wdGlvbnMsIEZMT1dfQ09ORklHVVJBQkxFX09QVElPTl9LRVlTLCBGbG93Q2VsbCwgRmxvd0NvbmZpZ3VyYWJsZSwgRmxvd0xpbmUsIEhvcml6b250YWxMYXlvdXRKdXN0aWZpY2F0aW9uLCBMYXlvdXRBbGlnbiwgTGF5b3V0SnVzdGlmaWNhdGlvbiwgTm9kZSwgTm9kZUxheW91dEF2YWlsYWJsZUNvbnN0cmFpbnRPcHRpb25zLCBOb2RlTGF5b3V0Q29uc3RyYWludCwgc2NlbmVyeSwgVmVydGljYWxMYXlvdXRKdXN0aWZpY2F0aW9uIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5cclxuY29uc3QgRkxPV19DT05TVFJBSU5UX09QVElPTl9LRVlTID0gW1xyXG4gIC4uLkZMT1dfQ09ORklHVVJBQkxFX09QVElPTl9LRVlTLFxyXG4gICdzcGFjaW5nJyxcclxuICAnbGluZVNwYWNpbmcnLFxyXG4gICdqdXN0aWZ5JyxcclxuICAnanVzdGlmeUxpbmVzJyxcclxuICAnd3JhcCcsXHJcbiAgJ2V4Y2x1ZGVJbnZpc2libGUnXHJcbl07XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIC8vIFRoZSBkZWZhdWx0IHNwYWNpbmcgaW4tYmV0d2VlbiBlbGVtZW50cyBpbiB0aGUgcHJpbWFyeSBkaXJlY3Rpb24uIElmIGFkZGl0aW9uYWwgKG9yIGxlc3MpIHNwYWNpbmcgaXMgZGVzaXJlZCBmb3JcclxuICAvLyBjZXJ0YWluIGVsZW1lbnRzLCBwZXItZWxlbWVudCBtYXJnaW5zIChldmVuIG5lZ2F0aXZlKSBjYW4gYmUgc2V0IGluIHRoZSBsYXlvdXRPcHRpb25zIG9mIG5vZGVzIGNvbnRhaW5lZC5cclxuICBzcGFjaW5nPzogbnVtYmVyO1xyXG5cclxuICAvLyBUaGUgZGVmYXVsdCBzcGFjaW5nIGluLWJldHdlZW4gbGluZXMgbG9uZyB0aGUgc2Vjb25kYXJ5IGF4aXMuXHJcbiAgbGluZVNwYWNpbmc/OiBudW1iZXI7XHJcblxyXG4gIC8vIEhvdyBleHRyYSBzcGFjZSBhbG9uZyB0aGUgcHJpbWFyeSBheGlzIGlzIGFsbG9jYXRlZC4gVGhlIGRlZmF1bHQgaXMgc3BhY2VCZXR3ZWVuLlxyXG4gIGp1c3RpZnk/OiBIb3Jpem9udGFsTGF5b3V0SnVzdGlmaWNhdGlvbiB8IFZlcnRpY2FsTGF5b3V0SnVzdGlmaWNhdGlvbjtcclxuXHJcbiAgLy8gSG93IGV4dHJhIHNwYWNlIGFsb25nIHRoZSBzZWNvbmRhcnkgYXhpcyBpcyBhbGxvY2F0ZWQuIFRoZSBkZWZhdWx0IGlzIG51bGwgKHdoaWNoIHdpbGwgZXhwYW5kIGNvbnRlbnQgdG8gZml0KVxyXG4gIGp1c3RpZnlMaW5lcz86IEhvcml6b250YWxMYXlvdXRKdXN0aWZpY2F0aW9uIHwgVmVydGljYWxMYXlvdXRKdXN0aWZpY2F0aW9uIHwgbnVsbDtcclxuXHJcbiAgLy8gV2hldGhlciBsaW5lLXdyYXBwaW5nIGlzIGVuYWJsZWQuIElmIHNvLCB0aGUgcHJpbWFyeSBwcmVmZXJyZWQgYXhpcyB3aWxsIGRldGVybWluZSB3aGVyZSB0aGluZ3MgYXJlIHdyYXBwZWQuXHJcbiAgd3JhcD86IGJvb2xlYW47XHJcblxyXG4gIC8vIFRoZSBwcmVmZXJyZWQgd2lkdGgvaGVpZ2h0IChpZGVhbGx5IGZyb20gYSBjb250YWluZXIncyBsb2NhbFByZWZlcnJlZFdpZHRoL2xvY2FsUHJlZmVycmVkSGVpZ2h0LlxyXG4gIHByZWZlcnJlZFdpZHRoUHJvcGVydHk/OiBUUHJvcGVydHk8bnVtYmVyIHwgbnVsbD47XHJcbiAgcHJlZmVycmVkSGVpZ2h0UHJvcGVydHk/OiBUUHJvcGVydHk8bnVtYmVyIHwgbnVsbD47XHJcblxyXG4gIC8vIFRoZSBtaW5pbXVtIHdpZHRoL2hlaWdodCAoaWRlYWxseSBmcm9tIGEgY29udGFpbmVyJ3MgbG9jYWxNaW5pbXVtV2lkdGgvbG9jYWxNaW5pbXVtSGVpZ2h0LlxyXG4gIG1pbmltdW1XaWR0aFByb3BlcnR5PzogVFByb3BlcnR5PG51bWJlciB8IG51bGw+O1xyXG4gIG1pbmltdW1IZWlnaHRQcm9wZXJ0eT86IFRQcm9wZXJ0eTxudW1iZXIgfCBudWxsPjtcclxufTtcclxudHlwZSBQYXJlbnRPcHRpb25zID0gRXh0ZXJuYWxGbG93Q29uZmlndXJhYmxlT3B0aW9ucyAmIE5vZGVMYXlvdXRBdmFpbGFibGVDb25zdHJhaW50T3B0aW9ucztcclxuZXhwb3J0IHR5cGUgRmxvd0NvbnN0cmFpbnRPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQYXJlbnRPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmxvd0NvbnN0cmFpbnQgZXh0ZW5kcyBGbG93Q29uZmlndXJhYmxlKCBOb2RlTGF5b3V0Q29uc3RyYWludCApIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBjZWxsczogRmxvd0NlbGxbXSA9IFtdO1xyXG4gIHByaXZhdGUgX2p1c3RpZnk6IExheW91dEp1c3RpZmljYXRpb24gPSBMYXlvdXRKdXN0aWZpY2F0aW9uLlNQQUNFX0JFVFdFRU47XHJcbiAgcHJpdmF0ZSBfanVzdGlmeUxpbmVzOiBMYXlvdXRKdXN0aWZpY2F0aW9uIHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSBfd3JhcCA9IGZhbHNlO1xyXG4gIHByaXZhdGUgX3NwYWNpbmcgPSAwO1xyXG4gIHByaXZhdGUgX2xpbmVTcGFjaW5nID0gMDtcclxuXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgcHVibGljIGRpc3BsYXllZENlbGxzOiBGbG93Q2VsbFtdID0gW107XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYW5jZXN0b3JOb2RlOiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBGbG93Q29uc3RyYWludE9wdGlvbnMgKSB7XHJcbiAgICBzdXBlciggYW5jZXN0b3JOb2RlLCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBTZXQgY29uZmlndXJhdGlvbiB0byBhY3R1YWwgZGVmYXVsdCB2YWx1ZXMgKGluc3RlYWQgb2YgbnVsbCkgc28gdGhhdCB3ZSB3aWxsIGhhdmUgZ3VhcmFudGVlZCBub24tbnVsbFxyXG4gICAgLy8gKG5vbi1pbmhlcml0KSB2YWx1ZXMgZm9yIG91ciBjb21wdXRhdGlvbnMuXHJcbiAgICB0aGlzLnNldENvbmZpZ1RvQmFzZURlZmF1bHQoKTtcclxuICAgIHRoaXMubXV0YXRlQ29uZmlndXJhYmxlKCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICAgIG11dGF0ZSggdGhpcywgRkxPV19DT05TVFJBSU5UX09QVElPTl9LRVlTLCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBLZXkgY29uZmlndXJhdGlvbiBjaGFuZ2VzIHRvIHJlbGF5b3V0XHJcbiAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLl91cGRhdGVMYXlvdXRMaXN0ZW5lciApO1xyXG5cclxuICAgIHRoaXMub3JpZW50YXRpb25DaGFuZ2VkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gdGhpcy5jZWxscy5mb3JFYWNoKCBjZWxsID0+IHtcclxuICAgICAgY2VsbC5vcmllbnRhdGlvbiA9IHRoaXMub3JpZW50YXRpb247XHJcbiAgICB9ICkgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlU2VwYXJhdG9yVmlzaWJpbGl0eSgpOiB2b2lkIHtcclxuICAgIC8vIEZpbmQgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCB2aXNpYmxlIG5vbi1zZXBhcmF0b3IgY2VsbC4gVGhlbiBoaWRlIGFsbCBzZXBhcmF0b3JzIHVudGlsIHRoaXMgaW5kZXguXHJcbiAgICAvLyBUaGlzIGlzIG5lZWRlZCwgc28gdGhhdCB3ZSBkbyBOT1QgdGVtcG9yYXJpbHkgY2hhbmdlIHRoZSB2aXNpYmlsaXR5IG9mIHNlcGFyYXRvcnMgYmFjay1hbmQtZm9ydGggZHVyaW5nIHRoZVxyXG4gICAgLy8gbGF5b3V0LiBJZiB3ZSBkaWQgdGhhdCwgaXQgd291bGQgdHJpZ2dlciBhIGxheW91dCBpbnNpZGUgZXZlcnkgbGF5b3V0LCBsZWFkaW5nIHRvIGFuIGluZmluaXRlIGxvb3AuXHJcbiAgICAvLyBUaGlzIGlzIGVmZmVjdGl2ZWx5IGRvbmUgc28gdGhhdCB3ZSBoYXZlIE5PIHZpc2libGUgc2VwYXJhdG9ycyBpbiBmcm9udCBvZiB0aGUgZmlyc3QgdmlzaWJsZSBub24tc2VwYXJhdG9yIGNlbGxcclxuICAgIC8vICh0aHVzIHNhdGlzZnlpbmcgb3VyIHNlcGFyYXRvciBjb25zdHJhaW50cykuXHJcbiAgICBsZXQgZmlyc3RWaXNpYmxlTm9uU2VwYXJhdG9ySW5kZXggPSAwO1xyXG4gICAgZm9yICggOyBmaXJzdFZpc2libGVOb25TZXBhcmF0b3JJbmRleCA8IHRoaXMuY2VsbHMubGVuZ3RoOyBmaXJzdFZpc2libGVOb25TZXBhcmF0b3JJbmRleCsrICkge1xyXG4gICAgICBjb25zdCBjZWxsID0gdGhpcy5jZWxsc1sgZmlyc3RWaXNpYmxlTm9uU2VwYXJhdG9ySW5kZXggXTtcclxuICAgICAgaWYgKCBjZWxsLl9pc1NlcGFyYXRvciApIHtcclxuICAgICAgICBjZWxsLm5vZGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBjZWxsLm5vZGUudmlzaWJsZSApIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNjYW4gZm9yIHNlcGFyYXRvcnMsIHRvZ2dsaW5nIHZpc2liaWxpdHkgYXMgZGVzaXJlZC4gTGVhdmUgdGhlIFwibGFzdFwiIHNlcGFyYXRvciB2aXNpYmxlLCBhcyBpZiB0aGV5IGFyZSBtYXJraW5nXHJcbiAgICAvLyBzZWN0aW9ucyBcImFmdGVyXCIgdGhlbXNlbHZlcy5cclxuICAgIGxldCBoYXNWaXNpYmxlTm9uU2VwYXJhdG9yID0gZmFsc2U7XHJcbiAgICBmb3IgKCBsZXQgaSA9IHRoaXMuY2VsbHMubGVuZ3RoIC0gMTsgaSA+IGZpcnN0VmlzaWJsZU5vblNlcGFyYXRvckluZGV4OyBpLS0gKSB7XHJcbiAgICAgIGNvbnN0IGNlbGwgPSB0aGlzLmNlbGxzWyBpIF07XHJcbiAgICAgIGlmICggY2VsbC5faXNTZXBhcmF0b3IgKSB7XHJcbiAgICAgICAgY2VsbC5ub2RlLnZpc2libGUgPSBoYXNWaXNpYmxlTm9uU2VwYXJhdG9yO1xyXG4gICAgICAgIGhhc1Zpc2libGVOb25TZXBhcmF0b3IgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggY2VsbC5ub2RlLnZpc2libGUgKSB7XHJcbiAgICAgICAgaGFzVmlzaWJsZU5vblNlcGFyYXRvciA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBvdmVycmlkZSBsYXlvdXQoKTogdm9pZCB7XHJcbiAgICBzdXBlci5sYXlvdXQoKTtcclxuXHJcbiAgICAvLyBUaGUgb3JpZW50YXRpb24gYWxvbmcgdGhlIGxhaWQtb3V0IGxpbmVzIC0gYWxzbyBrbm93biBhcyB0aGUgXCJwcmltYXJ5XCIgYXhpc1xyXG4gICAgY29uc3Qgb3JpZW50YXRpb24gPSB0aGlzLl9vcmllbnRhdGlvbjtcclxuXHJcbiAgICAvLyBUaGUgcGVycGVuZGljdWxhciBvcmllbnRhdGlvbiwgd2hlcmUgYWxpZ25tZW50IGlzIGhhbmRsZWQgLSBhbHNvIGtub3duIGFzIHRoZSBcInNlY29uZGFyeVwiIGF4aXNcclxuICAgIGNvbnN0IG9wcG9zaXRlT3JpZW50YXRpb24gPSB0aGlzLl9vcmllbnRhdGlvbi5vcHBvc2l0ZTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZVNlcGFyYXRvclZpc2liaWxpdHkoKTtcclxuXHJcbiAgICAvLyBGaWx0ZXIgdG8gb25seSBjZWxscyB1c2VkIGluIHRoZSBsYXlvdXRcclxuICAgIGNvbnN0IGNlbGxzID0gdGhpcy5maWx0ZXJMYXlvdXRDZWxscyggdGhpcy5jZWxscyApO1xyXG5cclxuICAgIHRoaXMuZGlzcGxheWVkQ2VsbHMgPSBjZWxscztcclxuXHJcbiAgICBpZiAoICFjZWxscy5sZW5ndGggKSB7XHJcbiAgICAgIHRoaXMubGF5b3V0Qm91bmRzUHJvcGVydHkudmFsdWUgPSBCb3VuZHMyLk5PVEhJTkc7XHJcbiAgICAgIHRoaXMubWluaW11bVdpZHRoUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgICB0aGlzLm1pbmltdW1IZWlnaHRQcm9wZXJ0eS52YWx1ZSA9IG51bGw7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBEZXRlcm1pbmUgb3VyIHByZWZlcnJlZCBzaXplcyAodGhleSBjYW4gYmUgbnVsbCwgaW4gd2hpY2ggY2FzZSlcclxuICAgIGxldCBwcmVmZXJyZWRTaXplOiBudW1iZXIgfCBudWxsID0gdGhpcy5nZXRQcmVmZXJyZWRQcm9wZXJ0eSggb3JpZW50YXRpb24gKS52YWx1ZTtcclxuICAgIGNvbnN0IHByZWZlcnJlZE9wcG9zaXRlU2l6ZTogbnVtYmVyIHwgbnVsbCA9IHRoaXMuZ2V0UHJlZmVycmVkUHJvcGVydHkoIG9wcG9zaXRlT3JpZW50YXRpb24gKS52YWx1ZTtcclxuXHJcbiAgICAvLyBXaGF0IGlzIHRoZSBsYXJnZXN0IG9mIHRoZSBtaW5pbXVtIHNpemVzIG9mIGNlbGxzIChlLmcuIGlmIHdlJ3JlIHdyYXBwaW5nLCB0aGlzIHdvdWxkIGJlIG91ciBtaW5pbXVtIHNpemUpXHJcbiAgICBjb25zdCBtYXhNaW5pbXVtQ2VsbFNpemU6IG51bWJlciA9IE1hdGgubWF4KCAuLi5jZWxscy5tYXAoIGNlbGwgPT4gY2VsbC5nZXRNaW5pbXVtU2l6ZSggb3JpZW50YXRpb24gKSB8fCAwICkgKTtcclxuXHJcbiAgICAvLyBJZiB3ZSBjYW4ndCBmaXQgdGhlIGNvbnRlbnQuLi4ganVzdCBwcmV0ZW5kIGxpa2Ugd2UgaGF2ZSBhIGxhcmdlciBwcmVmZXJyZWQgc2l6ZSFcclxuICAgIGlmICggbWF4TWluaW11bUNlbGxTaXplID4gKCBwcmVmZXJyZWRTaXplIHx8IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSApICkge1xyXG4gICAgICBwcmVmZXJyZWRTaXplID0gbWF4TWluaW11bUNlbGxTaXplO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdyYXBwaW5nIGFsbCB0aGUgY2VsbHMgaW50byBsaW5lc1xyXG4gICAgY29uc3QgbGluZXM6IEZsb3dMaW5lW10gPSBbXTtcclxuICAgIGlmICggdGhpcy53cmFwICkge1xyXG4gICAgICBsZXQgY3VycmVudExpbmVDZWxsczogRmxvd0NlbGxbXSA9IFtdO1xyXG4gICAgICBsZXQgYXZhaWxhYmxlU3BhY2UgPSBwcmVmZXJyZWRTaXplIHx8IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuXHJcbiAgICAgIHdoaWxlICggY2VsbHMubGVuZ3RoICkge1xyXG4gICAgICAgIGNvbnN0IGNlbGwgPSBjZWxscy5zaGlmdCgpITtcclxuICAgICAgICBjb25zdCBjZWxsU3BhY2UgPSBjZWxsLmdldE1pbmltdW1TaXplKCBvcmllbnRhdGlvbiApO1xyXG5cclxuICAgICAgICAvLyBJZiB3ZSdyZSB0aGUgdmVyeSBmaXJzdCBjZWxsLCBkb24ndCBjcmVhdGUgYSBuZXcgbGluZVxyXG4gICAgICAgIGlmICggY3VycmVudExpbmVDZWxscy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgICAgICBjdXJyZW50TGluZUNlbGxzLnB1c2goIGNlbGwgKTtcclxuICAgICAgICAgIGF2YWlsYWJsZVNwYWNlIC09IGNlbGxTcGFjZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gT3VyIGNlbGwgZml0cyEgRXBzaWxvbiBmb3IgYXZvaWRpbmcgZmxvYXRpbmcgcG9pbnQgaXNzdWVzXHJcbiAgICAgICAgZWxzZSBpZiAoIHRoaXMuc3BhY2luZyArIGNlbGxTcGFjZSA8PSBhdmFpbGFibGVTcGFjZSArIDFlLTcgKSB7XHJcbiAgICAgICAgICBjdXJyZW50TGluZUNlbGxzLnB1c2goIGNlbGwgKTtcclxuICAgICAgICAgIGF2YWlsYWJsZVNwYWNlIC09IHRoaXMuc3BhY2luZyArIGNlbGxTcGFjZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gV2UgZG9uJ3QgZml0LCBjcmVhdGUgYSBuZXcgbGluZVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgbGluZXMucHVzaCggRmxvd0xpbmUucG9vbC5jcmVhdGUoIG9yaWVudGF0aW9uLCBjdXJyZW50TGluZUNlbGxzICkgKTtcclxuICAgICAgICAgIGF2YWlsYWJsZVNwYWNlID0gcHJlZmVycmVkU2l6ZSB8fCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcblxyXG4gICAgICAgICAgY3VycmVudExpbmVDZWxscyA9IFsgY2VsbCBdO1xyXG4gICAgICAgICAgYXZhaWxhYmxlU3BhY2UgLT0gY2VsbFNwYWNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBjdXJyZW50TGluZUNlbGxzLmxlbmd0aCApIHtcclxuICAgICAgICBsaW5lcy5wdXNoKCBGbG93TGluZS5wb29sLmNyZWF0ZSggb3JpZW50YXRpb24sIGN1cnJlbnRMaW5lQ2VsbHMgKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgbGluZXMucHVzaCggRmxvd0xpbmUucG9vbC5jcmVhdGUoIG9yaWVudGF0aW9uLCBjZWxscyApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRGV0ZXJtaW5lIGxpbmUgb3Bwb3NpdGUtb3JpZW50YXRpb24gbWluL21heCBzaXplcyBhbmQgb3JpZ2luIHNpemVzIChob3cgdGFsbCB3aWxsIGEgcm93IGhhdmUgdG8gYmU/KVxyXG4gICAgbGluZXMuZm9yRWFjaCggbGluZSA9PiB7XHJcbiAgICAgIGxpbmUuY2VsbHMuZm9yRWFjaCggY2VsbCA9PiB7XHJcbiAgICAgICAgbGluZS5taW4gPSBNYXRoLm1heCggbGluZS5taW4sIGNlbGwuZ2V0TWluaW11bVNpemUoIG9wcG9zaXRlT3JpZW50YXRpb24gKSApO1xyXG4gICAgICAgIGxpbmUubWF4ID0gTWF0aC5taW4oIGxpbmUubWF4LCBjZWxsLmdldE1heGltdW1TaXplKCBvcHBvc2l0ZU9yaWVudGF0aW9uICkgKTtcclxuXHJcbiAgICAgICAgLy8gRm9yIG9yaWdpbi1zcGVjaWZpZWQgY2VsbHMsIHdlIHdpbGwgcmVjb3JkIHRoZWlyIG1heGltdW0gcmVhY2ggZnJvbSB0aGUgb3JpZ2luLCBzbyB0aGVzZSBjYW4gYmUgXCJzdW1tZWRcIlxyXG4gICAgICAgIC8vIChzaW5jZSB0aGUgb3JpZ2luIGxpbmUgbWF5IGVuZCB1cCB0YWtpbmcgbW9yZSBzcGFjZSkuXHJcbiAgICAgICAgaWYgKCBjZWxsLmVmZmVjdGl2ZUFsaWduID09PSBMYXlvdXRBbGlnbi5PUklHSU4gKSB7XHJcbiAgICAgICAgICBjb25zdCBvcmlnaW5Cb3VuZHMgPSBjZWxsLmdldE9yaWdpbkJvdW5kcygpO1xyXG4gICAgICAgICAgbGluZS5taW5PcmlnaW4gPSBNYXRoLm1pbiggb3JpZ2luQm91bmRzWyBvcHBvc2l0ZU9yaWVudGF0aW9uLm1pbkNvb3JkaW5hdGUgXSwgbGluZS5taW5PcmlnaW4gKTtcclxuICAgICAgICAgIGxpbmUubWF4T3JpZ2luID0gTWF0aC5tYXgoIG9yaWdpbkJvdW5kc1sgb3Bwb3NpdGVPcmllbnRhdGlvbi5tYXhDb29yZGluYXRlIF0sIGxpbmUubWF4T3JpZ2luICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBJZiB3ZSBoYXZlIGFsaWduOm9yaWdpbiBjb250ZW50LCB3ZSBuZWVkIHRvIHNlZSBpZiB0aGUgbWF4aW11bSBvcmlnaW4gc3BhbiBpcyBsYXJnZXIgdGhhbiBvciBsaW5lJ3NcclxuICAgICAgLy8gbWluaW11bSBzaXplLlxyXG4gICAgICBpZiAoIGlzRmluaXRlKCBsaW5lLm1pbk9yaWdpbiApICYmIGlzRmluaXRlKCBsaW5lLm1heE9yaWdpbiApICkge1xyXG4gICAgICAgIGxpbmUuc2l6ZSA9IE1hdGgubWF4KCBsaW5lLm1pbiwgbGluZS5tYXhPcmlnaW4gLSBsaW5lLm1pbk9yaWdpbiApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGxpbmUuc2l6ZSA9IGxpbmUubWluO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gR2l2ZW4gb3VyIHdyYXBwZWQgbGluZXMsIHdoYXQgaXMgb3VyIG1pbmltdW0gc2l6ZSB3ZSBjb3VsZCB0YWtlIHVwP1xyXG4gICAgY29uc3QgbWluaW11bUN1cnJlbnRTaXplOiBudW1iZXIgPSBNYXRoLm1heCggLi4ubGluZXMubWFwKCBsaW5lID0+IGxpbmUuZ2V0TWluaW11bVNpemUoIHRoaXMuc3BhY2luZyApICkgKTtcclxuICAgIGNvbnN0IG1pbmltdW1DdXJyZW50T3Bwb3NpdGVTaXplID0gXy5zdW0oIGxpbmVzLm1hcCggbGluZSA9PiBsaW5lLnNpemUgKSApICsgKCBsaW5lcy5sZW5ndGggLSAxICkgKiB0aGlzLmxpbmVTcGFjaW5nO1xyXG5cclxuICAgIC8vIFVzZWQgZm9yIGRldGVybWluaW5nIG91ciBcIm1pbmltdW1cIiBzaXplIGZvciBwcmVmZXJyZWQgc2l6ZXMuLi4gaWYgd3JhcHBpbmcgaXMgZW5hYmxlZCwgd2UgY2FuIGJlIHNtYWxsZXIgdGhhblxyXG4gICAgLy8gY3VycmVudCBtaW5pbXVtc1xyXG4gICAgY29uc3QgbWluaW11bUFsbG93YWJsZVNpemUgPSB0aGlzLndyYXAgPyBtYXhNaW5pbXVtQ2VsbFNpemUgOiBtaW5pbXVtQ3VycmVudFNpemU7XHJcblxyXG4gICAgLy8gSW5jcmVhc2UgdGhpbmdzIGlmIG91ciBwcmVmZXJyZWQgc2l6ZSBpcyBsYXJnZXIgdGhhbiBvdXIgbWluaW11bXMgKHdlJ2xsIGZpZ3VyZSBvdXQgaG93IHRvIGNvbXBlbnNhdGVcclxuICAgIC8vIGZvciB0aGUgZXh0cmEgc3BhY2UgYmVsb3cpLlxyXG4gICAgY29uc3Qgc2l6ZSA9IE1hdGgubWF4KCBtaW5pbXVtQ3VycmVudFNpemUsIHByZWZlcnJlZFNpemUgfHwgMCApO1xyXG4gICAgY29uc3Qgb3Bwb3NpdGVTaXplID0gTWF0aC5tYXgoIG1pbmltdW1DdXJyZW50T3Bwb3NpdGVTaXplLCBwcmVmZXJyZWRPcHBvc2l0ZVNpemUgfHwgMCApO1xyXG5cclxuICAgIC8vIE91ciBsYXlvdXQgb3JpZ2luICh1c3VhbGx5IHRoZSB1cHBlci1sZWZ0IG9mIHRoZSBjb250ZW50IGluIGxvY2FsIGNvb3JkaW5hdGVzLCBidXQgY291bGQgYmUgZGlmZmVyZW50IGJhc2VkIG9uXHJcbiAgICAvLyBhbGlnbjpvcmlnaW4gY29udGVudC5cclxuICAgIGNvbnN0IG9yaWdpblByaW1hcnkgPSB0aGlzLmxheW91dE9yaWdpblByb3BlcnR5LnZhbHVlWyBvcmllbnRhdGlvbi5jb29yZGluYXRlIF07XHJcbiAgICBjb25zdCBvcmlnaW5TZWNvbmRhcnkgPSB0aGlzLmxheW91dE9yaWdpblByb3BlcnR5LnZhbHVlWyBvcmllbnRhdGlvbi5vcHBvc2l0ZS5jb29yZGluYXRlIF07XHJcblxyXG4gICAgLy8gUHJpbWFyeS1kaXJlY3Rpb24gbGF5b3V0XHJcbiAgICBsaW5lcy5mb3JFYWNoKCBsaW5lID0+IHtcclxuICAgICAgY29uc3QgbWluaW11bUNvbnRlbnQgPSBfLnN1bSggbGluZS5jZWxscy5tYXAoIGNlbGwgPT4gY2VsbC5nZXRNaW5pbXVtU2l6ZSggb3JpZW50YXRpb24gKSApICk7XHJcbiAgICAgIGNvbnN0IHNwYWNpbmdBbW91bnQgPSB0aGlzLnNwYWNpbmcgKiAoIGxpbmUuY2VsbHMubGVuZ3RoIC0gMSApO1xyXG4gICAgICBsZXQgc3BhY2VSZW1haW5pbmcgPSBzaXplIC0gbWluaW11bUNvbnRlbnQgLSBzcGFjaW5nQW1vdW50O1xyXG5cclxuICAgICAgLy8gSW5pdGlhbCBwZW5kaW5nIHNpemVzXHJcbiAgICAgIGxpbmUuY2VsbHMuZm9yRWFjaCggY2VsbCA9PiB7XHJcbiAgICAgICAgY2VsbC5zaXplID0gY2VsbC5nZXRNaW5pbXVtU2l6ZSggb3JpZW50YXRpb24gKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gR3JvdyBwb3RlbnRpYWwgc2l6ZXMgaWYgcG9zc2libGVcclxuICAgICAgbGV0IGdyb3dhYmxlQ2VsbHM7XHJcbiAgICAgIHdoaWxlICggc3BhY2VSZW1haW5pbmcgPiAxZS03ICYmICggZ3Jvd2FibGVDZWxscyA9IGxpbmUuY2VsbHMuZmlsdGVyKCBjZWxsID0+IHtcclxuICAgICAgICAvLyBDYW4gdGhlIGNlbGwgZ3JvdyBtb3JlP1xyXG4gICAgICAgIHJldHVybiBjZWxsLmVmZmVjdGl2ZUdyb3cgIT09IDAgJiYgY2VsbC5zaXplIDwgY2VsbC5nZXRNYXhpbXVtU2l6ZSggb3JpZW50YXRpb24gKSAtIDFlLTc7XHJcbiAgICAgIH0gKSApLmxlbmd0aCApIHtcclxuICAgICAgICAvLyBUb3RhbCBzdW0gb2YgXCJncm93XCIgdmFsdWVzIGluIGNlbGxzIHRoYXQgY291bGQgcG90ZW50aWFsbHkgZ3Jvd1xyXG4gICAgICAgIGNvbnN0IHRvdGFsR3JvdyA9IF8uc3VtKCBncm93YWJsZUNlbGxzLm1hcCggY2VsbCA9PiBjZWxsLmVmZmVjdGl2ZUdyb3cgKSApO1xyXG4gICAgICAgIGNvbnN0IGFtb3VudFRvR3JvdyA9IE1hdGgubWluKFxyXG4gICAgICAgICAgLy8gU21hbGxlc3QgYW1vdW50IHRoYXQgYW55IG9mIHRoZSBjZWxscyBjb3VsZG4ndCBncm93IHBhc3QgKG5vdGU6IHByb3BvcnRpb25hbCB0byBlZmZlY3RpdmVHcm93KVxyXG4gICAgICAgICAgTWF0aC5taW4oIC4uLmdyb3dhYmxlQ2VsbHMubWFwKCBjZWxsID0+ICggY2VsbC5nZXRNYXhpbXVtU2l6ZSggb3JpZW50YXRpb24gKSAtIGNlbGwuc2l6ZSApIC8gY2VsbC5lZmZlY3RpdmVHcm93ICkgKSxcclxuXHJcbiAgICAgICAgICAvLyBBbW91bnQgZWFjaCBjZWxsIGdyb3dzIGlmIGFsbCBvZiBvdXIgZXh0cmEgc3BhY2UgZml0cyBpbiBBTEwgdGhlIGNlbGxzXHJcbiAgICAgICAgICBzcGFjZVJlbWFpbmluZyAvIHRvdGFsR3Jvd1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGFtb3VudFRvR3JvdyA+IDFlLTExICk7XHJcblxyXG4gICAgICAgIGdyb3dhYmxlQ2VsbHMuZm9yRWFjaCggY2VsbCA9PiB7XHJcbiAgICAgICAgICBjZWxsLnNpemUgKz0gYW1vdW50VG9Hcm93ICogY2VsbC5lZmZlY3RpdmVHcm93O1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBzcGFjZVJlbWFpbmluZyAtPSBhbW91bnRUb0dyb3cgKiB0b3RhbEdyb3c7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFVwZGF0ZSBwcmVmZXJyZWQgZGltZW5zaW9uIGJhc2VkIG9uIHRoZSBwZW5kaW5nIHNpemVcclxuICAgICAgbGluZS5jZWxscy5mb3JFYWNoKCBjZWxsID0+IGNlbGwuYXR0ZW1wdFByZWZlcnJlZFNpemUoIG9yaWVudGF0aW9uLCBjZWxsLnNpemUgKSApO1xyXG5cclxuICAgICAgLy8gR2l2ZXMgYWRkaXRpb25hbCBzcGFjaW5nIGJhc2VkIG9uIGp1c3RpZmljYXRpb25cclxuICAgICAgY29uc3QgcHJpbWFyeVNwYWNpbmdGdW5jdGlvbiA9IHRoaXMuX2p1c3RpZnkuc3BhY2luZ0Z1bmN0aW9uRmFjdG9yeSggc3BhY2VSZW1haW5pbmcsIGxpbmUuY2VsbHMubGVuZ3RoICk7XHJcblxyXG4gICAgICBsZXQgcG9zaXRpb24gPSBvcmlnaW5QcmltYXJ5O1xyXG4gICAgICBsaW5lLmNlbGxzLmZvckVhY2goICggY2VsbCwgaW5kZXggKSA9PiB7XHJcbiAgICAgICAgLy8gQWx3YXlzIGluY2x1ZGUganVzdGlmeSBzcGFjaW5nXHJcbiAgICAgICAgcG9zaXRpb24gKz0gcHJpbWFyeVNwYWNpbmdGdW5jdGlvbiggaW5kZXggKTtcclxuXHJcbiAgICAgICAgLy8gT25seSBpbmNsdWRlIG5vcm1hbCBzcGFjaW5nIGJldHdlZW4gaXRlbXNcclxuICAgICAgICBpZiAoIGluZGV4ID4gMCApIHtcclxuICAgICAgICAgIHBvc2l0aW9uICs9IHRoaXMuc3BhY2luZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFDVFVBTExZIHBvc2l0aW9uIGl0IVxyXG4gICAgICAgIGNlbGwucG9zaXRpb25TdGFydCggb3JpZW50YXRpb24sIHBvc2l0aW9uICk7XHJcbiAgICAgICAgY2VsbC5sYXN0QXZhaWxhYmxlQm91bmRzWyBvcmllbnRhdGlvbi5taW5Db29yZGluYXRlIF0gPSBwb3NpdGlvbjtcclxuICAgICAgICBjZWxsLmxhc3RBdmFpbGFibGVCb3VuZHNbIG9yaWVudGF0aW9uLm1heENvb3JkaW5hdGUgXSA9IHBvc2l0aW9uICsgY2VsbC5zaXplO1xyXG5cclxuICAgICAgICBwb3NpdGlvbiArPSBjZWxsLnNpemU7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zcGFjaW5nID49IDAgfHwgY2VsbC5zaXplID49IC10aGlzLnNwYWNpbmcgLSAxZS03LFxyXG4gICAgICAgICAgJ05lZ2F0aXZlIHNwYWNpbmcgbW9yZSB0aGFuIGEgY2VsbFxcJ3Mgc2l6ZSBjYXVzZXMgaXNzdWVzIHdpdGggbGF5b3V0JyApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU2Vjb25kYXJ5LWRpcmVjdGlvbiBsYXlvdXRcclxuICAgIGNvbnN0IG9wcG9zaXRlU3BhY2VSZW1haW5pbmcgPSBvcHBvc2l0ZVNpemUgLSBtaW5pbXVtQ3VycmVudE9wcG9zaXRlU2l6ZTtcclxuICAgIGNvbnN0IGluaXRpYWxPcHBvc2l0ZVBvc2l0aW9uID0gKCBsaW5lc1sgMCBdLmhhc09yaWdpbigpID8gbGluZXNbIDAgXS5taW5PcmlnaW4gOiAwICkgKyBvcmlnaW5TZWNvbmRhcnk7XHJcbiAgICBsZXQgb3Bwb3NpdGVQb3NpdGlvbiA9IGluaXRpYWxPcHBvc2l0ZVBvc2l0aW9uO1xyXG4gICAgaWYgKCB0aGlzLl9qdXN0aWZ5TGluZXMgPT09IG51bGwgKSB7XHJcbiAgICAgIC8vIG51bGwganVzdGlmeUxpbmVzIHdpbGwgcmVzdWx0IGluIGV4cGFuZGluZyBhbGwgb2Ygb3VyIGxpbmVzIGludG8gdGhlIHJlbWFpbmluZyBzcGFjZS5cclxuXHJcbiAgICAgIC8vIEFkZCBzcGFjZSByZW1haW5pbmcgZXZlbmx5IChmb3Igbm93KSBzaW5jZSB3ZSBkb24ndCBoYXZlIGFueSBncm93IHZhbHVlc1xyXG4gICAgICBsaW5lcy5mb3JFYWNoKCBsaW5lID0+IHtcclxuICAgICAgICBsaW5lLnNpemUgKz0gb3Bwb3NpdGVTcGFjZVJlbWFpbmluZyAvIGxpbmVzLmxlbmd0aDtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gUG9zaXRpb24gdGhlIGxpbmVzXHJcbiAgICAgIGxpbmVzLmZvckVhY2goIGxpbmUgPT4ge1xyXG4gICAgICAgIGxpbmUucG9zaXRpb24gPSBvcHBvc2l0ZVBvc2l0aW9uO1xyXG4gICAgICAgIG9wcG9zaXRlUG9zaXRpb24gKz0gbGluZS5zaXplICsgdGhpcy5saW5lU3BhY2luZztcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIElmIHdlJ3JlIGp1c3RpZnlpbmcgbGluZXMsIHdlIHdvbid0IGFkZCBhbnkgYWRkaXRpb25hbCBzcGFjZSBpbnRvIHRoaW5nc1xyXG4gICAgICBjb25zdCBzcGFjaW5nRnVuY3Rpb24gPSB0aGlzLl9qdXN0aWZ5TGluZXMuc3BhY2luZ0Z1bmN0aW9uRmFjdG9yeSggb3Bwb3NpdGVTcGFjZVJlbWFpbmluZywgbGluZXMubGVuZ3RoICk7XHJcblxyXG4gICAgICBsaW5lcy5mb3JFYWNoKCAoIGxpbmUsIGluZGV4ICkgPT4ge1xyXG4gICAgICAgIG9wcG9zaXRlUG9zaXRpb24gKz0gc3BhY2luZ0Z1bmN0aW9uKCBpbmRleCApO1xyXG4gICAgICAgIGxpbmUucG9zaXRpb24gPSBvcHBvc2l0ZVBvc2l0aW9uO1xyXG4gICAgICAgIG9wcG9zaXRlUG9zaXRpb24gKz0gbGluZS5zaXplICsgdGhpcy5saW5lU3BhY2luZztcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgbGluZXMuZm9yRWFjaCggbGluZSA9PiBsaW5lLmNlbGxzLmZvckVhY2goIGNlbGwgPT4ge1xyXG4gICAgICBjZWxsLnJlcG9zaXRpb24oIG9wcG9zaXRlT3JpZW50YXRpb24sIGxpbmUuc2l6ZSwgbGluZS5wb3NpdGlvbiwgY2VsbC5lZmZlY3RpdmVTdHJldGNoLCAtbGluZS5taW5PcmlnaW4sIGNlbGwuZWZmZWN0aXZlQWxpZ24gKTtcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIERldGVybWluZSB0aGUgc2l6ZSB3ZSBhY3R1YWxseSB0YWtlIHVwIChsb2NhbEJvdW5kcyBmb3IgdGhlIEZsb3dCb3ggd2lsbCB1c2UgdGhpcylcclxuICAgIGNvbnN0IG1pbkNvb3JkaW5hdGUgPSBvcmlnaW5QcmltYXJ5O1xyXG4gICAgY29uc3QgbWF4Q29vcmRpbmF0ZSA9IG9yaWdpblByaW1hcnkgKyBzaXplO1xyXG4gICAgY29uc3QgbWluT3Bwb3NpdGVDb29yZGluYXRlID0gaW5pdGlhbE9wcG9zaXRlUG9zaXRpb247XHJcbiAgICBjb25zdCBtYXhPcHBvc2l0ZUNvb3JkaW5hdGUgPSBpbml0aWFsT3Bwb3NpdGVQb3NpdGlvbiArIG9wcG9zaXRlU2l6ZTtcclxuXHJcbiAgICAvLyBXZSdyZSB0YWtpbmcgdXAgdGhlc2UgbGF5b3V0IGJvdW5kcyAobm9kZXMgY291bGQgdXNlIHRoZW0gZm9yIGxvY2FsQm91bmRzKVxyXG4gICAgdGhpcy5sYXlvdXRCb3VuZHNQcm9wZXJ0eS52YWx1ZSA9IEJvdW5kczIub3JpZW50ZWQoXHJcbiAgICAgIG9yaWVudGF0aW9uLFxyXG4gICAgICBtaW5Db29yZGluYXRlLFxyXG4gICAgICBtaW5PcHBvc2l0ZUNvb3JkaW5hdGUsXHJcbiAgICAgIG1heENvb3JkaW5hdGUsXHJcbiAgICAgIG1heE9wcG9zaXRlQ29vcmRpbmF0ZVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBUZWxsIG90aGVycyBhYm91dCBvdXIgbmV3IFwibWluaW11bVwiIHNpemVzXHJcbiAgICB0aGlzLm1pbmltdW1XaWR0aFByb3BlcnR5LnZhbHVlID0gb3JpZW50YXRpb24gPT09IE9yaWVudGF0aW9uLkhPUklaT05UQUwgPyBtaW5pbXVtQWxsb3dhYmxlU2l6ZSA6IG1pbmltdW1DdXJyZW50T3Bwb3NpdGVTaXplO1xyXG4gICAgdGhpcy5taW5pbXVtSGVpZ2h0UHJvcGVydHkudmFsdWUgPSBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTCA/IG1pbmltdW1DdXJyZW50T3Bwb3NpdGVTaXplIDogbWluaW11bUFsbG93YWJsZVNpemU7XHJcblxyXG4gICAgdGhpcy5maW5pc2hlZExheW91dEVtaXR0ZXIuZW1pdCgpO1xyXG5cclxuICAgIGxpbmVzLmZvckVhY2goIGxpbmUgPT4gbGluZS5jbGVhbigpICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGp1c3RpZnkoKTogSG9yaXpvbnRhbExheW91dEp1c3RpZmljYXRpb24gfCBWZXJ0aWNhbExheW91dEp1c3RpZmljYXRpb24ge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gTGF5b3V0SnVzdGlmaWNhdGlvbi5pbnRlcm5hbFRvSnVzdGlmeSggdGhpcy5fb3JpZW50YXRpb24sIHRoaXMuX2p1c3RpZnkgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBMYXlvdXRKdXN0aWZpY2F0aW9uLmdldEFsbG93ZWRKdXN0aWZpY2F0aW9uVmFsdWVzKCB0aGlzLl9vcmllbnRhdGlvbiApLmluY2x1ZGVzKCByZXN1bHQgKSApO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGp1c3RpZnkoIHZhbHVlOiBIb3Jpem9udGFsTGF5b3V0SnVzdGlmaWNhdGlvbiB8IFZlcnRpY2FsTGF5b3V0SnVzdGlmaWNhdGlvbiApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIExheW91dEp1c3RpZmljYXRpb24uZ2V0QWxsb3dlZEp1c3RpZmljYXRpb25WYWx1ZXMoIHRoaXMuX29yaWVudGF0aW9uICkuaW5jbHVkZXMoIHZhbHVlICksXHJcbiAgICAgIGBqdXN0aWZ5ICR7dmFsdWV9IG5vdCBzdXBwb3J0ZWQsIHdpdGggdGhlIG9yaWVudGF0aW9uICR7dGhpcy5fb3JpZW50YXRpb259LCB0aGUgdmFsaWQgdmFsdWVzIGFyZSAke0xheW91dEp1c3RpZmljYXRpb24uZ2V0QWxsb3dlZEp1c3RpZmljYXRpb25WYWx1ZXMoIHRoaXMuX29yaWVudGF0aW9uICl9YCApO1xyXG5cclxuICAgIC8vIHJlbWFwcGluZyBhbGlnbiB2YWx1ZXMgdG8gYW4gaW5kZXBlbmRlbnQgc2V0LCBzbyB0aGV5IGFyZW4ndCBvcmllbnRhdGlvbi1kZXBlbmRlbnRcclxuICAgIGNvbnN0IG1hcHBlZFZhbHVlID0gTGF5b3V0SnVzdGlmaWNhdGlvbi5qdXN0aWZ5VG9JbnRlcm5hbCggdGhpcy5fb3JpZW50YXRpb24sIHZhbHVlICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9qdXN0aWZ5ICE9PSBtYXBwZWRWYWx1ZSApIHtcclxuICAgICAgdGhpcy5fanVzdGlmeSA9IG1hcHBlZFZhbHVlO1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGp1c3RpZnlMaW5lcygpOiBIb3Jpem9udGFsTGF5b3V0SnVzdGlmaWNhdGlvbiB8IFZlcnRpY2FsTGF5b3V0SnVzdGlmaWNhdGlvbiB8IG51bGwge1xyXG4gICAgaWYgKCB0aGlzLl9qdXN0aWZ5TGluZXMgPT09IG51bGwgKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNvbnN0IHJlc3VsdCA9IExheW91dEp1c3RpZmljYXRpb24uaW50ZXJuYWxUb0p1c3RpZnkoIHRoaXMuX29yaWVudGF0aW9uLCB0aGlzLl9qdXN0aWZ5TGluZXMgKTtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIExheW91dEp1c3RpZmljYXRpb24uZ2V0QWxsb3dlZEp1c3RpZmljYXRpb25WYWx1ZXMoIHRoaXMuX29yaWVudGF0aW9uICkuaW5jbHVkZXMoIHJlc3VsdCApICk7XHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBqdXN0aWZ5TGluZXMoIHZhbHVlOiBIb3Jpem9udGFsTGF5b3V0SnVzdGlmaWNhdGlvbiB8IFZlcnRpY2FsTGF5b3V0SnVzdGlmaWNhdGlvbiB8IG51bGwgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2YWx1ZSA9PT0gbnVsbCB8fCBMYXlvdXRKdXN0aWZpY2F0aW9uLmdldEFsbG93ZWRKdXN0aWZpY2F0aW9uVmFsdWVzKCB0aGlzLl9vcmllbnRhdGlvbi5vcHBvc2l0ZSApLmluY2x1ZGVzKCB2YWx1ZSApLFxyXG4gICAgICBganVzdGlmeSAke3ZhbHVlfSBub3Qgc3VwcG9ydGVkLCB3aXRoIHRoZSBvcmllbnRhdGlvbiAke3RoaXMuX29yaWVudGF0aW9uLm9wcG9zaXRlfSwgdGhlIHZhbGlkIHZhbHVlcyBhcmUgJHtMYXlvdXRKdXN0aWZpY2F0aW9uLmdldEFsbG93ZWRKdXN0aWZpY2F0aW9uVmFsdWVzKCB0aGlzLl9vcmllbnRhdGlvbi5vcHBvc2l0ZSApfSBvciBudWxsYCApO1xyXG5cclxuICAgIC8vIHJlbWFwcGluZyBhbGlnbiB2YWx1ZXMgdG8gYW4gaW5kZXBlbmRlbnQgc2V0LCBzbyB0aGV5IGFyZW4ndCBvcmllbnRhdGlvbi1kZXBlbmRlbnRcclxuICAgIGNvbnN0IG1hcHBlZFZhbHVlID0gdmFsdWUgPT09IG51bGwgPyBudWxsIDogTGF5b3V0SnVzdGlmaWNhdGlvbi5qdXN0aWZ5VG9JbnRlcm5hbCggdGhpcy5fb3JpZW50YXRpb24ub3Bwb3NpdGUsIHZhbHVlICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWFwcGVkVmFsdWUgPT09IG51bGwgfHwgbWFwcGVkVmFsdWUgaW5zdGFuY2VvZiBMYXlvdXRKdXN0aWZpY2F0aW9uICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9qdXN0aWZ5TGluZXMgIT09IG1hcHBlZFZhbHVlICkge1xyXG4gICAgICB0aGlzLl9qdXN0aWZ5TGluZXMgPSBtYXBwZWRWYWx1ZTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlTGF5b3V0QXV0b21hdGljYWxseSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCB3cmFwKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3dyYXA7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHdyYXAoIHZhbHVlOiBib29sZWFuICkge1xyXG4gICAgaWYgKCB0aGlzLl93cmFwICE9PSB2YWx1ZSApIHtcclxuICAgICAgdGhpcy5fd3JhcCA9IHZhbHVlO1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHNwYWNpbmcoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9zcGFjaW5nO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBzcGFjaW5nKCB2YWx1ZTogbnVtYmVyICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHZhbHVlICkgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX3NwYWNpbmcgIT09IHZhbHVlICkge1xyXG4gICAgICB0aGlzLl9zcGFjaW5nID0gdmFsdWU7XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgbGluZVNwYWNpbmcoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9saW5lU3BhY2luZztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgbGluZVNwYWNpbmcoIHZhbHVlOiBudW1iZXIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdmFsdWUgKSApO1xyXG5cclxuICAgIGlmICggdGhpcy5fbGluZVNwYWNpbmcgIT09IHZhbHVlICkge1xyXG4gICAgICB0aGlzLl9saW5lU3BhY2luZyA9IHZhbHVlO1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaW5zZXJ0Q2VsbCggaW5kZXg6IG51bWJlciwgY2VsbDogRmxvd0NlbGwgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCA+PSAwICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCA8PSB0aGlzLmNlbGxzLmxlbmd0aCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIV8uaW5jbHVkZXMoIHRoaXMuY2VsbHMsIGNlbGwgKSApO1xyXG5cclxuICAgIGNlbGwub3JpZW50YXRpb24gPSB0aGlzLm9yaWVudGF0aW9uO1xyXG5cclxuICAgIHRoaXMuY2VsbHMuc3BsaWNlKCBpbmRleCwgMCwgY2VsbCApO1xyXG4gICAgdGhpcy5hZGROb2RlKCBjZWxsLm5vZGUgKTtcclxuICAgIGNlbGwuY2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuX3VwZGF0ZUxheW91dExpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVtb3ZlQ2VsbCggY2VsbDogRmxvd0NlbGwgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCB0aGlzLmNlbGxzLCBjZWxsICkgKTtcclxuXHJcbiAgICBhcnJheVJlbW92ZSggdGhpcy5jZWxscywgY2VsbCApO1xyXG4gICAgdGhpcy5yZW1vdmVOb2RlKCBjZWxsLm5vZGUgKTtcclxuICAgIGNlbGwuY2hhbmdlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuX3VwZGF0ZUxheW91dExpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVvcmRlckNlbGxzKCBjZWxsczogRmxvd0NlbGxbXSwgbWluQ2hhbmdlSW5kZXg6IG51bWJlciwgbWF4Q2hhbmdlSW5kZXg6IG51bWJlciApOiB2b2lkIHtcclxuICAgIHRoaXMuY2VsbHMuc3BsaWNlKCBtaW5DaGFuZ2VJbmRleCwgbWF4Q2hhbmdlSW5kZXggLSBtaW5DaGFuZ2VJbmRleCArIDEsIC4uLmNlbGxzICk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5KCk7XHJcbiAgfVxyXG5cclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICBwdWJsaWMgZ2V0UHJlZmVycmVkUHJvcGVydHkoIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiApOiBUUHJvcGVydHk8bnVtYmVyIHwgbnVsbD4ge1xyXG4gICAgcmV0dXJuIG9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5IT1JJWk9OVEFMID8gdGhpcy5wcmVmZXJyZWRXaWR0aFByb3BlcnR5IDogdGhpcy5wcmVmZXJyZWRIZWlnaHRQcm9wZXJ0eTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXNcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIC8vIExvY2sgZHVyaW5nIGRpc3Bvc2FsIHRvIGF2b2lkIGxheW91dCBjYWxsc1xyXG4gICAgdGhpcy5sb2NrKCk7XHJcblxyXG4gICAgdGhpcy5jZWxscy5mb3JFYWNoKCBjZWxsID0+IHRoaXMucmVtb3ZlQ2VsbCggY2VsbCApICk7XHJcbiAgICB0aGlzLmRpc3BsYXllZENlbGxzID0gW107XHJcblxyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG5cclxuICAgIHRoaXMudW5sb2NrKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZSggYW5jZXN0b3JOb2RlOiBOb2RlLCBvcHRpb25zPzogRmxvd0NvbnN0cmFpbnRPcHRpb25zICk6IEZsb3dDb25zdHJhaW50IHtcclxuICAgIHJldHVybiBuZXcgRmxvd0NvbnN0cmFpbnQoIGFuY2VzdG9yTm9kZSwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0Zsb3dDb25zdHJhaW50JywgRmxvd0NvbnN0cmFpbnQgKTtcclxuZXhwb3J0IHsgRkxPV19DT05TVFJBSU5UX09QVElPTl9LRVlTIH07XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxXQUFXLE1BQU0seUNBQXlDO0FBQ2pFLE9BQU9DLE1BQU0sTUFBTSxvQ0FBb0M7QUFDdkQsU0FBMENDLDZCQUE2QixFQUFZQyxnQkFBZ0IsRUFBRUMsUUFBUSxFQUFpQ0MsV0FBVyxFQUFFQyxtQkFBbUIsRUFBOENDLG9CQUFvQixFQUFFQyxPQUFPLFFBQXFDLGtCQUFrQjtBQUdoVCxNQUFNQywyQkFBMkIsR0FBRyxDQUNsQyxHQUFHUCw2QkFBNkIsRUFDaEMsU0FBUyxFQUNULGFBQWEsRUFDYixTQUFTLEVBQ1QsY0FBYyxFQUNkLE1BQU0sRUFDTixrQkFBa0IsQ0FDbkI7QUE4QkQsZUFBZSxNQUFNUSxjQUFjLFNBQVNQLGdCQUFnQixDQUFFSSxvQkFBcUIsQ0FBQyxDQUFDO0VBRWxFSSxLQUFLLEdBQWUsRUFBRTtFQUMvQkMsUUFBUSxHQUF3Qk4sbUJBQW1CLENBQUNPLGFBQWE7RUFDakVDLGFBQWEsR0FBK0IsSUFBSTtFQUNoREMsS0FBSyxHQUFHLEtBQUs7RUFDYkMsUUFBUSxHQUFHLENBQUM7RUFDWkMsWUFBWSxHQUFHLENBQUM7O0VBRXhCO0VBQ09DLGNBQWMsR0FBZSxFQUFFO0VBRS9CQyxXQUFXQSxDQUFFQyxZQUFrQixFQUFFQyxlQUF1QyxFQUFHO0lBQ2hGLEtBQUssQ0FBRUQsWUFBWSxFQUFFQyxlQUFnQixDQUFDOztJQUV0QztJQUNBO0lBQ0EsSUFBSSxDQUFDQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQzdCLElBQUksQ0FBQ0Msa0JBQWtCLENBQUVGLGVBQWdCLENBQUM7SUFDMUNwQixNQUFNLENBQUUsSUFBSSxFQUFFUSwyQkFBMkIsRUFBRVksZUFBZ0IsQ0FBQzs7SUFFNUQ7SUFDQSxJQUFJLENBQUNHLGNBQWMsQ0FBQ0MsV0FBVyxDQUFFLElBQUksQ0FBQ0MscUJBQXNCLENBQUM7SUFFN0QsSUFBSSxDQUFDQyx5QkFBeUIsQ0FBQ0YsV0FBVyxDQUFFLE1BQU0sSUFBSSxDQUFDZCxLQUFLLENBQUNpQixPQUFPLENBQUVDLElBQUksSUFBSTtNQUM1RUEsSUFBSSxDQUFDQyxXQUFXLEdBQUcsSUFBSSxDQUFDQSxXQUFXO0lBQ3JDLENBQUUsQ0FBRSxDQUFDO0VBQ1A7RUFFUUMseUJBQXlCQSxDQUFBLEVBQVM7SUFDeEM7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBLElBQUlDLDZCQUE2QixHQUFHLENBQUM7SUFDckMsT0FBUUEsNkJBQTZCLEdBQUcsSUFBSSxDQUFDckIsS0FBSyxDQUFDc0IsTUFBTSxFQUFFRCw2QkFBNkIsRUFBRSxFQUFHO01BQzNGLE1BQU1ILElBQUksR0FBRyxJQUFJLENBQUNsQixLQUFLLENBQUVxQiw2QkFBNkIsQ0FBRTtNQUN4RCxJQUFLSCxJQUFJLENBQUNLLFlBQVksRUFBRztRQUN2QkwsSUFBSSxDQUFDTSxJQUFJLENBQUNDLE9BQU8sR0FBRyxLQUFLO01BQzNCLENBQUMsTUFDSSxJQUFLUCxJQUFJLENBQUNNLElBQUksQ0FBQ0MsT0FBTyxFQUFHO1FBQzVCO01BQ0Y7SUFDRjs7SUFFQTtJQUNBO0lBQ0EsSUFBSUMsc0JBQXNCLEdBQUcsS0FBSztJQUNsQyxLQUFNLElBQUlDLENBQUMsR0FBRyxJQUFJLENBQUMzQixLQUFLLENBQUNzQixNQUFNLEdBQUcsQ0FBQyxFQUFFSyxDQUFDLEdBQUdOLDZCQUE2QixFQUFFTSxDQUFDLEVBQUUsRUFBRztNQUM1RSxNQUFNVCxJQUFJLEdBQUcsSUFBSSxDQUFDbEIsS0FBSyxDQUFFMkIsQ0FBQyxDQUFFO01BQzVCLElBQUtULElBQUksQ0FBQ0ssWUFBWSxFQUFHO1FBQ3ZCTCxJQUFJLENBQUNNLElBQUksQ0FBQ0MsT0FBTyxHQUFHQyxzQkFBc0I7UUFDMUNBLHNCQUFzQixHQUFHLEtBQUs7TUFDaEMsQ0FBQyxNQUNJLElBQUtSLElBQUksQ0FBQ00sSUFBSSxDQUFDQyxPQUFPLEVBQUc7UUFDNUJDLHNCQUFzQixHQUFHLElBQUk7TUFDL0I7SUFDRjtFQUNGO0VBRW1CRSxNQUFNQSxDQUFBLEVBQVM7SUFDaEMsS0FBSyxDQUFDQSxNQUFNLENBQUMsQ0FBQzs7SUFFZDtJQUNBLE1BQU1ULFdBQVcsR0FBRyxJQUFJLENBQUNVLFlBQVk7O0lBRXJDO0lBQ0EsTUFBTUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDRCxZQUFZLENBQUNFLFFBQVE7SUFFdEQsSUFBSSxDQUFDWCx5QkFBeUIsQ0FBQyxDQUFDOztJQUVoQztJQUNBLE1BQU1wQixLQUFLLEdBQUcsSUFBSSxDQUFDZ0MsaUJBQWlCLENBQUUsSUFBSSxDQUFDaEMsS0FBTSxDQUFDO0lBRWxELElBQUksQ0FBQ08sY0FBYyxHQUFHUCxLQUFLO0lBRTNCLElBQUssQ0FBQ0EsS0FBSyxDQUFDc0IsTUFBTSxFQUFHO01BQ25CLElBQUksQ0FBQ1csb0JBQW9CLENBQUNDLEtBQUssR0FBRy9DLE9BQU8sQ0FBQ2dELE9BQU87TUFDakQsSUFBSSxDQUFDQyxvQkFBb0IsQ0FBQ0YsS0FBSyxHQUFHLElBQUk7TUFDdEMsSUFBSSxDQUFDRyxxQkFBcUIsQ0FBQ0gsS0FBSyxHQUFHLElBQUk7TUFDdkM7SUFDRjs7SUFFQTtJQUNBLElBQUlJLGFBQTRCLEdBQUcsSUFBSSxDQUFDQyxvQkFBb0IsQ0FBRXBCLFdBQVksQ0FBQyxDQUFDZSxLQUFLO0lBQ2pGLE1BQU1NLHFCQUFvQyxHQUFHLElBQUksQ0FBQ0Qsb0JBQW9CLENBQUVULG1CQUFvQixDQUFDLENBQUNJLEtBQUs7O0lBRW5HO0lBQ0EsTUFBTU8sa0JBQTBCLEdBQUdDLElBQUksQ0FBQ0MsR0FBRyxDQUFFLEdBQUczQyxLQUFLLENBQUM0QyxHQUFHLENBQUUxQixJQUFJLElBQUlBLElBQUksQ0FBQzJCLGNBQWMsQ0FBRTFCLFdBQVksQ0FBQyxJQUFJLENBQUUsQ0FBRSxDQUFDOztJQUU5RztJQUNBLElBQUtzQixrQkFBa0IsSUFBS0gsYUFBYSxJQUFJUSxNQUFNLENBQUNDLGlCQUFpQixDQUFFLEVBQUc7TUFDeEVULGFBQWEsR0FBR0csa0JBQWtCO0lBQ3BDOztJQUVBO0lBQ0EsTUFBTU8sS0FBaUIsR0FBRyxFQUFFO0lBQzVCLElBQUssSUFBSSxDQUFDQyxJQUFJLEVBQUc7TUFDZixJQUFJQyxnQkFBNEIsR0FBRyxFQUFFO01BQ3JDLElBQUlDLGNBQWMsR0FBR2IsYUFBYSxJQUFJUSxNQUFNLENBQUNDLGlCQUFpQjtNQUU5RCxPQUFRL0MsS0FBSyxDQUFDc0IsTUFBTSxFQUFHO1FBQ3JCLE1BQU1KLElBQUksR0FBR2xCLEtBQUssQ0FBQ29ELEtBQUssQ0FBQyxDQUFFO1FBQzNCLE1BQU1DLFNBQVMsR0FBR25DLElBQUksQ0FBQzJCLGNBQWMsQ0FBRTFCLFdBQVksQ0FBQzs7UUFFcEQ7UUFDQSxJQUFLK0IsZ0JBQWdCLENBQUM1QixNQUFNLEtBQUssQ0FBQyxFQUFHO1VBQ25DNEIsZ0JBQWdCLENBQUNJLElBQUksQ0FBRXBDLElBQUssQ0FBQztVQUM3QmlDLGNBQWMsSUFBSUUsU0FBUztRQUM3QjtRQUNBO1FBQUEsS0FDSyxJQUFLLElBQUksQ0FBQ0UsT0FBTyxHQUFHRixTQUFTLElBQUlGLGNBQWMsR0FBRyxJQUFJLEVBQUc7VUFDNURELGdCQUFnQixDQUFDSSxJQUFJLENBQUVwQyxJQUFLLENBQUM7VUFDN0JpQyxjQUFjLElBQUksSUFBSSxDQUFDSSxPQUFPLEdBQUdGLFNBQVM7UUFDNUM7UUFDQTtRQUFBLEtBQ0s7VUFDSEwsS0FBSyxDQUFDTSxJQUFJLENBQUU3RCxRQUFRLENBQUMrRCxJQUFJLENBQUNDLE1BQU0sQ0FBRXRDLFdBQVcsRUFBRStCLGdCQUFpQixDQUFFLENBQUM7VUFDbkVDLGNBQWMsR0FBR2IsYUFBYSxJQUFJUSxNQUFNLENBQUNDLGlCQUFpQjtVQUUxREcsZ0JBQWdCLEdBQUcsQ0FBRWhDLElBQUksQ0FBRTtVQUMzQmlDLGNBQWMsSUFBSUUsU0FBUztRQUM3QjtNQUNGO01BRUEsSUFBS0gsZ0JBQWdCLENBQUM1QixNQUFNLEVBQUc7UUFDN0IwQixLQUFLLENBQUNNLElBQUksQ0FBRTdELFFBQVEsQ0FBQytELElBQUksQ0FBQ0MsTUFBTSxDQUFFdEMsV0FBVyxFQUFFK0IsZ0JBQWlCLENBQUUsQ0FBQztNQUNyRTtJQUNGLENBQUMsTUFDSTtNQUNIRixLQUFLLENBQUNNLElBQUksQ0FBRTdELFFBQVEsQ0FBQytELElBQUksQ0FBQ0MsTUFBTSxDQUFFdEMsV0FBVyxFQUFFbkIsS0FBTSxDQUFFLENBQUM7SUFDMUQ7O0lBRUE7SUFDQWdELEtBQUssQ0FBQy9CLE9BQU8sQ0FBRXlDLElBQUksSUFBSTtNQUNyQkEsSUFBSSxDQUFDMUQsS0FBSyxDQUFDaUIsT0FBTyxDQUFFQyxJQUFJLElBQUk7UUFDMUJ3QyxJQUFJLENBQUNDLEdBQUcsR0FBR2pCLElBQUksQ0FBQ0MsR0FBRyxDQUFFZSxJQUFJLENBQUNDLEdBQUcsRUFBRXpDLElBQUksQ0FBQzJCLGNBQWMsQ0FBRWYsbUJBQW9CLENBQUUsQ0FBQztRQUMzRTRCLElBQUksQ0FBQ2YsR0FBRyxHQUFHRCxJQUFJLENBQUNpQixHQUFHLENBQUVELElBQUksQ0FBQ2YsR0FBRyxFQUFFekIsSUFBSSxDQUFDMEMsY0FBYyxDQUFFOUIsbUJBQW9CLENBQUUsQ0FBQzs7UUFFM0U7UUFDQTtRQUNBLElBQUtaLElBQUksQ0FBQzJDLGNBQWMsS0FBS25FLFdBQVcsQ0FBQ29FLE1BQU0sRUFBRztVQUNoRCxNQUFNQyxZQUFZLEdBQUc3QyxJQUFJLENBQUM4QyxlQUFlLENBQUMsQ0FBQztVQUMzQ04sSUFBSSxDQUFDTyxTQUFTLEdBQUd2QixJQUFJLENBQUNpQixHQUFHLENBQUVJLFlBQVksQ0FBRWpDLG1CQUFtQixDQUFDb0MsYUFBYSxDQUFFLEVBQUVSLElBQUksQ0FBQ08sU0FBVSxDQUFDO1VBQzlGUCxJQUFJLENBQUNTLFNBQVMsR0FBR3pCLElBQUksQ0FBQ0MsR0FBRyxDQUFFb0IsWUFBWSxDQUFFakMsbUJBQW1CLENBQUNzQyxhQUFhLENBQUUsRUFBRVYsSUFBSSxDQUFDUyxTQUFVLENBQUM7UUFDaEc7TUFDRixDQUFFLENBQUM7O01BRUg7TUFDQTtNQUNBLElBQUtFLFFBQVEsQ0FBRVgsSUFBSSxDQUFDTyxTQUFVLENBQUMsSUFBSUksUUFBUSxDQUFFWCxJQUFJLENBQUNTLFNBQVUsQ0FBQyxFQUFHO1FBQzlEVCxJQUFJLENBQUNZLElBQUksR0FBRzVCLElBQUksQ0FBQ0MsR0FBRyxDQUFFZSxJQUFJLENBQUNDLEdBQUcsRUFBRUQsSUFBSSxDQUFDUyxTQUFTLEdBQUdULElBQUksQ0FBQ08sU0FBVSxDQUFDO01BQ25FLENBQUMsTUFDSTtRQUNIUCxJQUFJLENBQUNZLElBQUksR0FBR1osSUFBSSxDQUFDQyxHQUFHO01BQ3RCO0lBQ0YsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTVksa0JBQTBCLEdBQUc3QixJQUFJLENBQUNDLEdBQUcsQ0FBRSxHQUFHSyxLQUFLLENBQUNKLEdBQUcsQ0FBRWMsSUFBSSxJQUFJQSxJQUFJLENBQUNiLGNBQWMsQ0FBRSxJQUFJLENBQUNVLE9BQVEsQ0FBRSxDQUFFLENBQUM7SUFDMUcsTUFBTWlCLDBCQUEwQixHQUFHQyxDQUFDLENBQUNDLEdBQUcsQ0FBRTFCLEtBQUssQ0FBQ0osR0FBRyxDQUFFYyxJQUFJLElBQUlBLElBQUksQ0FBQ1ksSUFBSyxDQUFFLENBQUMsR0FBRyxDQUFFdEIsS0FBSyxDQUFDMUIsTUFBTSxHQUFHLENBQUMsSUFBSyxJQUFJLENBQUNxRCxXQUFXOztJQUVwSDtJQUNBO0lBQ0EsTUFBTUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDM0IsSUFBSSxHQUFHUixrQkFBa0IsR0FBRzhCLGtCQUFrQjs7SUFFaEY7SUFDQTtJQUNBLE1BQU1ELElBQUksR0FBRzVCLElBQUksQ0FBQ0MsR0FBRyxDQUFFNEIsa0JBQWtCLEVBQUVqQyxhQUFhLElBQUksQ0FBRSxDQUFDO0lBQy9ELE1BQU11QyxZQUFZLEdBQUduQyxJQUFJLENBQUNDLEdBQUcsQ0FBRTZCLDBCQUEwQixFQUFFaEMscUJBQXFCLElBQUksQ0FBRSxDQUFDOztJQUV2RjtJQUNBO0lBQ0EsTUFBTXNDLGFBQWEsR0FBRyxJQUFJLENBQUNDLG9CQUFvQixDQUFDN0MsS0FBSyxDQUFFZixXQUFXLENBQUM2RCxVQUFVLENBQUU7SUFDL0UsTUFBTUMsZUFBZSxHQUFHLElBQUksQ0FBQ0Ysb0JBQW9CLENBQUM3QyxLQUFLLENBQUVmLFdBQVcsQ0FBQ1ksUUFBUSxDQUFDaUQsVUFBVSxDQUFFOztJQUUxRjtJQUNBaEMsS0FBSyxDQUFDL0IsT0FBTyxDQUFFeUMsSUFBSSxJQUFJO01BQ3JCLE1BQU13QixjQUFjLEdBQUdULENBQUMsQ0FBQ0MsR0FBRyxDQUFFaEIsSUFBSSxDQUFDMUQsS0FBSyxDQUFDNEMsR0FBRyxDQUFFMUIsSUFBSSxJQUFJQSxJQUFJLENBQUMyQixjQUFjLENBQUUxQixXQUFZLENBQUUsQ0FBRSxDQUFDO01BQzVGLE1BQU1nRSxhQUFhLEdBQUcsSUFBSSxDQUFDNUIsT0FBTyxJQUFLRyxJQUFJLENBQUMxRCxLQUFLLENBQUNzQixNQUFNLEdBQUcsQ0FBQyxDQUFFO01BQzlELElBQUk4RCxjQUFjLEdBQUdkLElBQUksR0FBR1ksY0FBYyxHQUFHQyxhQUFhOztNQUUxRDtNQUNBekIsSUFBSSxDQUFDMUQsS0FBSyxDQUFDaUIsT0FBTyxDQUFFQyxJQUFJLElBQUk7UUFDMUJBLElBQUksQ0FBQ29ELElBQUksR0FBR3BELElBQUksQ0FBQzJCLGNBQWMsQ0FBRTFCLFdBQVksQ0FBQztNQUNoRCxDQUFFLENBQUM7O01BRUg7TUFDQSxJQUFJa0UsYUFBYTtNQUNqQixPQUFRRCxjQUFjLEdBQUcsSUFBSSxJQUFJLENBQUVDLGFBQWEsR0FBRzNCLElBQUksQ0FBQzFELEtBQUssQ0FBQ3NGLE1BQU0sQ0FBRXBFLElBQUksSUFBSTtRQUM1RTtRQUNBLE9BQU9BLElBQUksQ0FBQ3FFLGFBQWEsS0FBSyxDQUFDLElBQUlyRSxJQUFJLENBQUNvRCxJQUFJLEdBQUdwRCxJQUFJLENBQUMwQyxjQUFjLENBQUV6QyxXQUFZLENBQUMsR0FBRyxJQUFJO01BQzFGLENBQUUsQ0FBQyxFQUFHRyxNQUFNLEVBQUc7UUFDYjtRQUNBLE1BQU1rRSxTQUFTLEdBQUdmLENBQUMsQ0FBQ0MsR0FBRyxDQUFFVyxhQUFhLENBQUN6QyxHQUFHLENBQUUxQixJQUFJLElBQUlBLElBQUksQ0FBQ3FFLGFBQWMsQ0FBRSxDQUFDO1FBQzFFLE1BQU1FLFlBQVksR0FBRy9DLElBQUksQ0FBQ2lCLEdBQUc7UUFDM0I7UUFDQWpCLElBQUksQ0FBQ2lCLEdBQUcsQ0FBRSxHQUFHMEIsYUFBYSxDQUFDekMsR0FBRyxDQUFFMUIsSUFBSSxJQUFJLENBQUVBLElBQUksQ0FBQzBDLGNBQWMsQ0FBRXpDLFdBQVksQ0FBQyxHQUFHRCxJQUFJLENBQUNvRCxJQUFJLElBQUtwRCxJQUFJLENBQUNxRSxhQUFjLENBQUUsQ0FBQztRQUVuSDtRQUNBSCxjQUFjLEdBQUdJLFNBQ25CLENBQUM7UUFFREUsTUFBTSxJQUFJQSxNQUFNLENBQUVELFlBQVksR0FBRyxLQUFNLENBQUM7UUFFeENKLGFBQWEsQ0FBQ3BFLE9BQU8sQ0FBRUMsSUFBSSxJQUFJO1VBQzdCQSxJQUFJLENBQUNvRCxJQUFJLElBQUltQixZQUFZLEdBQUd2RSxJQUFJLENBQUNxRSxhQUFhO1FBQ2hELENBQUUsQ0FBQztRQUNISCxjQUFjLElBQUlLLFlBQVksR0FBR0QsU0FBUztNQUM1Qzs7TUFFQTtNQUNBOUIsSUFBSSxDQUFDMUQsS0FBSyxDQUFDaUIsT0FBTyxDQUFFQyxJQUFJLElBQUlBLElBQUksQ0FBQ3lFLG9CQUFvQixDQUFFeEUsV0FBVyxFQUFFRCxJQUFJLENBQUNvRCxJQUFLLENBQUUsQ0FBQzs7TUFFakY7TUFDQSxNQUFNc0Isc0JBQXNCLEdBQUcsSUFBSSxDQUFDM0YsUUFBUSxDQUFDNEYsc0JBQXNCLENBQUVULGNBQWMsRUFBRTFCLElBQUksQ0FBQzFELEtBQUssQ0FBQ3NCLE1BQU8sQ0FBQztNQUV4RyxJQUFJd0UsUUFBUSxHQUFHaEIsYUFBYTtNQUM1QnBCLElBQUksQ0FBQzFELEtBQUssQ0FBQ2lCLE9BQU8sQ0FBRSxDQUFFQyxJQUFJLEVBQUU2RSxLQUFLLEtBQU07UUFDckM7UUFDQUQsUUFBUSxJQUFJRixzQkFBc0IsQ0FBRUcsS0FBTSxDQUFDOztRQUUzQztRQUNBLElBQUtBLEtBQUssR0FBRyxDQUFDLEVBQUc7VUFDZkQsUUFBUSxJQUFJLElBQUksQ0FBQ3ZDLE9BQU87UUFDMUI7O1FBRUE7UUFDQXJDLElBQUksQ0FBQzhFLGFBQWEsQ0FBRTdFLFdBQVcsRUFBRTJFLFFBQVMsQ0FBQztRQUMzQzVFLElBQUksQ0FBQytFLG1CQUFtQixDQUFFOUUsV0FBVyxDQUFDK0MsYUFBYSxDQUFFLEdBQUc0QixRQUFRO1FBQ2hFNUUsSUFBSSxDQUFDK0UsbUJBQW1CLENBQUU5RSxXQUFXLENBQUNpRCxhQUFhLENBQUUsR0FBRzBCLFFBQVEsR0FBRzVFLElBQUksQ0FBQ29ELElBQUk7UUFFNUV3QixRQUFRLElBQUk1RSxJQUFJLENBQUNvRCxJQUFJO1FBQ3JCb0IsTUFBTSxJQUFJQSxNQUFNLENBQUUsSUFBSSxDQUFDbkMsT0FBTyxJQUFJLENBQUMsSUFBSXJDLElBQUksQ0FBQ29ELElBQUksSUFBSSxDQUFDLElBQUksQ0FBQ2YsT0FBTyxHQUFHLElBQUksRUFDdEUscUVBQXNFLENBQUM7TUFDM0UsQ0FBRSxDQUFDO0lBQ0wsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTTJDLHNCQUFzQixHQUFHckIsWUFBWSxHQUFHTCwwQkFBMEI7SUFDeEUsTUFBTTJCLHVCQUF1QixHQUFHLENBQUVuRCxLQUFLLENBQUUsQ0FBQyxDQUFFLENBQUNvRCxTQUFTLENBQUMsQ0FBQyxHQUFHcEQsS0FBSyxDQUFFLENBQUMsQ0FBRSxDQUFDaUIsU0FBUyxHQUFHLENBQUMsSUFBS2dCLGVBQWU7SUFDdkcsSUFBSW9CLGdCQUFnQixHQUFHRix1QkFBdUI7SUFDOUMsSUFBSyxJQUFJLENBQUNoRyxhQUFhLEtBQUssSUFBSSxFQUFHO01BQ2pDOztNQUVBO01BQ0E2QyxLQUFLLENBQUMvQixPQUFPLENBQUV5QyxJQUFJLElBQUk7UUFDckJBLElBQUksQ0FBQ1ksSUFBSSxJQUFJNEIsc0JBQXNCLEdBQUdsRCxLQUFLLENBQUMxQixNQUFNO01BQ3BELENBQUUsQ0FBQzs7TUFFSDtNQUNBMEIsS0FBSyxDQUFDL0IsT0FBTyxDQUFFeUMsSUFBSSxJQUFJO1FBQ3JCQSxJQUFJLENBQUNvQyxRQUFRLEdBQUdPLGdCQUFnQjtRQUNoQ0EsZ0JBQWdCLElBQUkzQyxJQUFJLENBQUNZLElBQUksR0FBRyxJQUFJLENBQUNLLFdBQVc7TUFDbEQsQ0FBRSxDQUFDO0lBQ0wsQ0FBQyxNQUNJO01BQ0g7TUFDQSxNQUFNMkIsZUFBZSxHQUFHLElBQUksQ0FBQ25HLGFBQWEsQ0FBQzBGLHNCQUFzQixDQUFFSyxzQkFBc0IsRUFBRWxELEtBQUssQ0FBQzFCLE1BQU8sQ0FBQztNQUV6RzBCLEtBQUssQ0FBQy9CLE9BQU8sQ0FBRSxDQUFFeUMsSUFBSSxFQUFFcUMsS0FBSyxLQUFNO1FBQ2hDTSxnQkFBZ0IsSUFBSUMsZUFBZSxDQUFFUCxLQUFNLENBQUM7UUFDNUNyQyxJQUFJLENBQUNvQyxRQUFRLEdBQUdPLGdCQUFnQjtRQUNoQ0EsZ0JBQWdCLElBQUkzQyxJQUFJLENBQUNZLElBQUksR0FBRyxJQUFJLENBQUNLLFdBQVc7TUFDbEQsQ0FBRSxDQUFDO0lBQ0w7SUFDQTNCLEtBQUssQ0FBQy9CLE9BQU8sQ0FBRXlDLElBQUksSUFBSUEsSUFBSSxDQUFDMUQsS0FBSyxDQUFDaUIsT0FBTyxDQUFFQyxJQUFJLElBQUk7TUFDakRBLElBQUksQ0FBQ3FGLFVBQVUsQ0FBRXpFLG1CQUFtQixFQUFFNEIsSUFBSSxDQUFDWSxJQUFJLEVBQUVaLElBQUksQ0FBQ29DLFFBQVEsRUFBRTVFLElBQUksQ0FBQ3NGLGdCQUFnQixFQUFFLENBQUM5QyxJQUFJLENBQUNPLFNBQVMsRUFBRS9DLElBQUksQ0FBQzJDLGNBQWUsQ0FBQztJQUMvSCxDQUFFLENBQUUsQ0FBQzs7SUFFTDtJQUNBLE1BQU1LLGFBQWEsR0FBR1ksYUFBYTtJQUNuQyxNQUFNVixhQUFhLEdBQUdVLGFBQWEsR0FBR1IsSUFBSTtJQUMxQyxNQUFNbUMscUJBQXFCLEdBQUdOLHVCQUF1QjtJQUNyRCxNQUFNTyxxQkFBcUIsR0FBR1AsdUJBQXVCLEdBQUd0QixZQUFZOztJQUVwRTtJQUNBLElBQUksQ0FBQzVDLG9CQUFvQixDQUFDQyxLQUFLLEdBQUcvQyxPQUFPLENBQUN3SCxRQUFRLENBQ2hEeEYsV0FBVyxFQUNYK0MsYUFBYSxFQUNidUMscUJBQXFCLEVBQ3JCckMsYUFBYSxFQUNic0MscUJBQ0YsQ0FBQzs7SUFFRDtJQUNBLElBQUksQ0FBQ3RFLG9CQUFvQixDQUFDRixLQUFLLEdBQUdmLFdBQVcsS0FBSy9CLFdBQVcsQ0FBQ3dILFVBQVUsR0FBR2hDLG9CQUFvQixHQUFHSiwwQkFBMEI7SUFDNUgsSUFBSSxDQUFDbkMscUJBQXFCLENBQUNILEtBQUssR0FBR2YsV0FBVyxLQUFLL0IsV0FBVyxDQUFDd0gsVUFBVSxHQUFHcEMsMEJBQTBCLEdBQUdJLG9CQUFvQjtJQUU3SCxJQUFJLENBQUNpQyxxQkFBcUIsQ0FBQ0MsSUFBSSxDQUFDLENBQUM7SUFFakM5RCxLQUFLLENBQUMvQixPQUFPLENBQUV5QyxJQUFJLElBQUlBLElBQUksQ0FBQ3FELEtBQUssQ0FBQyxDQUFFLENBQUM7RUFDdkM7RUFFQSxJQUFXQyxPQUFPQSxDQUFBLEVBQWdFO0lBQ2hGLE1BQU1DLE1BQU0sR0FBR3RILG1CQUFtQixDQUFDdUgsaUJBQWlCLENBQUUsSUFBSSxDQUFDckYsWUFBWSxFQUFFLElBQUksQ0FBQzVCLFFBQVMsQ0FBQztJQUV4RnlGLE1BQU0sSUFBSUEsTUFBTSxDQUFFL0YsbUJBQW1CLENBQUN3SCw2QkFBNkIsQ0FBRSxJQUFJLENBQUN0RixZQUFhLENBQUMsQ0FBQ3VGLFFBQVEsQ0FBRUgsTUFBTyxDQUFFLENBQUM7SUFFN0csT0FBT0EsTUFBTTtFQUNmO0VBRUEsSUFBV0QsT0FBT0EsQ0FBRTlFLEtBQWtFLEVBQUc7SUFDdkZ3RCxNQUFNLElBQUlBLE1BQU0sQ0FBRS9GLG1CQUFtQixDQUFDd0gsNkJBQTZCLENBQUUsSUFBSSxDQUFDdEYsWUFBYSxDQUFDLENBQUN1RixRQUFRLENBQUVsRixLQUFNLENBQUMsRUFDdkcsV0FBVUEsS0FBTSx3Q0FBdUMsSUFBSSxDQUFDTCxZQUFhLDBCQUF5QmxDLG1CQUFtQixDQUFDd0gsNkJBQTZCLENBQUUsSUFBSSxDQUFDdEYsWUFBYSxDQUFFLEVBQUUsQ0FBQzs7SUFFL0s7SUFDQSxNQUFNd0YsV0FBVyxHQUFHMUgsbUJBQW1CLENBQUMySCxpQkFBaUIsQ0FBRSxJQUFJLENBQUN6RixZQUFZLEVBQUVLLEtBQU0sQ0FBQztJQUVyRixJQUFLLElBQUksQ0FBQ2pDLFFBQVEsS0FBS29ILFdBQVcsRUFBRztNQUNuQyxJQUFJLENBQUNwSCxRQUFRLEdBQUdvSCxXQUFXO01BRTNCLElBQUksQ0FBQ0UseUJBQXlCLENBQUMsQ0FBQztJQUNsQztFQUNGO0VBRUEsSUFBV0MsWUFBWUEsQ0FBQSxFQUF1RTtJQUM1RixJQUFLLElBQUksQ0FBQ3JILGFBQWEsS0FBSyxJQUFJLEVBQUc7TUFDakMsT0FBTyxJQUFJO0lBQ2IsQ0FBQyxNQUNJO01BQ0gsTUFBTThHLE1BQU0sR0FBR3RILG1CQUFtQixDQUFDdUgsaUJBQWlCLENBQUUsSUFBSSxDQUFDckYsWUFBWSxFQUFFLElBQUksQ0FBQzFCLGFBQWMsQ0FBQztNQUU3RnVGLE1BQU0sSUFBSUEsTUFBTSxDQUFFL0YsbUJBQW1CLENBQUN3SCw2QkFBNkIsQ0FBRSxJQUFJLENBQUN0RixZQUFhLENBQUMsQ0FBQ3VGLFFBQVEsQ0FBRUgsTUFBTyxDQUFFLENBQUM7TUFFN0csT0FBT0EsTUFBTTtJQUNmO0VBQ0Y7RUFFQSxJQUFXTyxZQUFZQSxDQUFFdEYsS0FBeUUsRUFBRztJQUNuR3dELE1BQU0sSUFBSUEsTUFBTSxDQUFFeEQsS0FBSyxLQUFLLElBQUksSUFBSXZDLG1CQUFtQixDQUFDd0gsNkJBQTZCLENBQUUsSUFBSSxDQUFDdEYsWUFBWSxDQUFDRSxRQUFTLENBQUMsQ0FBQ3FGLFFBQVEsQ0FBRWxGLEtBQU0sQ0FBQyxFQUNsSSxXQUFVQSxLQUFNLHdDQUF1QyxJQUFJLENBQUNMLFlBQVksQ0FBQ0UsUUFBUywwQkFBeUJwQyxtQkFBbUIsQ0FBQ3dILDZCQUE2QixDQUFFLElBQUksQ0FBQ3RGLFlBQVksQ0FBQ0UsUUFBUyxDQUFFLFVBQVUsQ0FBQzs7SUFFek07SUFDQSxNQUFNc0YsV0FBVyxHQUFHbkYsS0FBSyxLQUFLLElBQUksR0FBRyxJQUFJLEdBQUd2QyxtQkFBbUIsQ0FBQzJILGlCQUFpQixDQUFFLElBQUksQ0FBQ3pGLFlBQVksQ0FBQ0UsUUFBUSxFQUFFRyxLQUFNLENBQUM7SUFFdEh3RCxNQUFNLElBQUlBLE1BQU0sQ0FBRTJCLFdBQVcsS0FBSyxJQUFJLElBQUlBLFdBQVcsWUFBWTFILG1CQUFvQixDQUFDO0lBRXRGLElBQUssSUFBSSxDQUFDUSxhQUFhLEtBQUtrSCxXQUFXLEVBQUc7TUFDeEMsSUFBSSxDQUFDbEgsYUFBYSxHQUFHa0gsV0FBVztNQUVoQyxJQUFJLENBQUNFLHlCQUF5QixDQUFDLENBQUM7SUFDbEM7RUFDRjtFQUVBLElBQVd0RSxJQUFJQSxDQUFBLEVBQVk7SUFDekIsT0FBTyxJQUFJLENBQUM3QyxLQUFLO0VBQ25CO0VBRUEsSUFBVzZDLElBQUlBLENBQUVmLEtBQWMsRUFBRztJQUNoQyxJQUFLLElBQUksQ0FBQzlCLEtBQUssS0FBSzhCLEtBQUssRUFBRztNQUMxQixJQUFJLENBQUM5QixLQUFLLEdBQUc4QixLQUFLO01BRWxCLElBQUksQ0FBQ3FGLHlCQUF5QixDQUFDLENBQUM7SUFDbEM7RUFDRjtFQUVBLElBQVdoRSxPQUFPQSxDQUFBLEVBQVc7SUFDM0IsT0FBTyxJQUFJLENBQUNsRCxRQUFRO0VBQ3RCO0VBRUEsSUFBV2tELE9BQU9BLENBQUVyQixLQUFhLEVBQUc7SUFDbEN3RCxNQUFNLElBQUlBLE1BQU0sQ0FBRXJCLFFBQVEsQ0FBRW5DLEtBQU0sQ0FBRSxDQUFDO0lBRXJDLElBQUssSUFBSSxDQUFDN0IsUUFBUSxLQUFLNkIsS0FBSyxFQUFHO01BQzdCLElBQUksQ0FBQzdCLFFBQVEsR0FBRzZCLEtBQUs7TUFFckIsSUFBSSxDQUFDcUYseUJBQXlCLENBQUMsQ0FBQztJQUNsQztFQUNGO0VBRUEsSUFBVzVDLFdBQVdBLENBQUEsRUFBVztJQUMvQixPQUFPLElBQUksQ0FBQ3JFLFlBQVk7RUFDMUI7RUFFQSxJQUFXcUUsV0FBV0EsQ0FBRXpDLEtBQWEsRUFBRztJQUN0Q3dELE1BQU0sSUFBSUEsTUFBTSxDQUFFckIsUUFBUSxDQUFFbkMsS0FBTSxDQUFFLENBQUM7SUFFckMsSUFBSyxJQUFJLENBQUM1QixZQUFZLEtBQUs0QixLQUFLLEVBQUc7TUFDakMsSUFBSSxDQUFDNUIsWUFBWSxHQUFHNEIsS0FBSztNQUV6QixJQUFJLENBQUNxRix5QkFBeUIsQ0FBQyxDQUFDO0lBQ2xDO0VBQ0Y7RUFFT0UsVUFBVUEsQ0FBRTFCLEtBQWEsRUFBRTdFLElBQWMsRUFBUztJQUN2RHdFLE1BQU0sSUFBSUEsTUFBTSxDQUFFSyxLQUFLLElBQUksQ0FBRSxDQUFDO0lBQzlCTCxNQUFNLElBQUlBLE1BQU0sQ0FBRUssS0FBSyxJQUFJLElBQUksQ0FBQy9GLEtBQUssQ0FBQ3NCLE1BQU8sQ0FBQztJQUM5Q29FLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUNqQixDQUFDLENBQUMyQyxRQUFRLENBQUUsSUFBSSxDQUFDcEgsS0FBSyxFQUFFa0IsSUFBSyxDQUFFLENBQUM7SUFFbkRBLElBQUksQ0FBQ0MsV0FBVyxHQUFHLElBQUksQ0FBQ0EsV0FBVztJQUVuQyxJQUFJLENBQUNuQixLQUFLLENBQUMwSCxNQUFNLENBQUUzQixLQUFLLEVBQUUsQ0FBQyxFQUFFN0UsSUFBSyxDQUFDO0lBQ25DLElBQUksQ0FBQ3lHLE9BQU8sQ0FBRXpHLElBQUksQ0FBQ00sSUFBSyxDQUFDO0lBQ3pCTixJQUFJLENBQUNMLGNBQWMsQ0FBQ0MsV0FBVyxDQUFFLElBQUksQ0FBQ0MscUJBQXNCLENBQUM7SUFFN0QsSUFBSSxDQUFDd0cseUJBQXlCLENBQUMsQ0FBQztFQUNsQztFQUVPSyxVQUFVQSxDQUFFMUcsSUFBYyxFQUFTO0lBQ3hDd0UsTUFBTSxJQUFJQSxNQUFNLENBQUVqQixDQUFDLENBQUMyQyxRQUFRLENBQUUsSUFBSSxDQUFDcEgsS0FBSyxFQUFFa0IsSUFBSyxDQUFFLENBQUM7SUFFbEQ3QixXQUFXLENBQUUsSUFBSSxDQUFDVyxLQUFLLEVBQUVrQixJQUFLLENBQUM7SUFDL0IsSUFBSSxDQUFDMkcsVUFBVSxDQUFFM0csSUFBSSxDQUFDTSxJQUFLLENBQUM7SUFDNUJOLElBQUksQ0FBQ0wsY0FBYyxDQUFDaUgsY0FBYyxDQUFFLElBQUksQ0FBQy9HLHFCQUFzQixDQUFDO0lBRWhFLElBQUksQ0FBQ3dHLHlCQUF5QixDQUFDLENBQUM7RUFDbEM7RUFFT1EsWUFBWUEsQ0FBRS9ILEtBQWlCLEVBQUVnSSxjQUFzQixFQUFFQyxjQUFzQixFQUFTO0lBQzdGLElBQUksQ0FBQ2pJLEtBQUssQ0FBQzBILE1BQU0sQ0FBRU0sY0FBYyxFQUFFQyxjQUFjLEdBQUdELGNBQWMsR0FBRyxDQUFDLEVBQUUsR0FBR2hJLEtBQU0sQ0FBQztJQUVsRixJQUFJLENBQUN1SCx5QkFBeUIsQ0FBQyxDQUFDO0VBQ2xDOztFQUVBO0VBQ09oRixvQkFBb0JBLENBQUVwQixXQUF3QixFQUE2QjtJQUNoRixPQUFPQSxXQUFXLEtBQUsvQixXQUFXLENBQUN3SCxVQUFVLEdBQUcsSUFBSSxDQUFDc0Isc0JBQXNCLEdBQUcsSUFBSSxDQUFDQyx1QkFBdUI7RUFDNUc7O0VBRUE7QUFDRjtBQUNBO0VBQ2tCQyxPQUFPQSxDQUFBLEVBQVM7SUFDOUI7SUFDQSxJQUFJLENBQUNDLElBQUksQ0FBQyxDQUFDO0lBRVgsSUFBSSxDQUFDckksS0FBSyxDQUFDaUIsT0FBTyxDQUFFQyxJQUFJLElBQUksSUFBSSxDQUFDMEcsVUFBVSxDQUFFMUcsSUFBSyxDQUFFLENBQUM7SUFDckQsSUFBSSxDQUFDWCxjQUFjLEdBQUcsRUFBRTtJQUV4QixLQUFLLENBQUM2SCxPQUFPLENBQUMsQ0FBQztJQUVmLElBQUksQ0FBQ0UsTUFBTSxDQUFDLENBQUM7RUFDZjtFQUVBLE9BQWM3RSxNQUFNQSxDQUFFaEQsWUFBa0IsRUFBRThILE9BQStCLEVBQW1CO0lBQzFGLE9BQU8sSUFBSXhJLGNBQWMsQ0FBRVUsWUFBWSxFQUFFOEgsT0FBUSxDQUFDO0VBQ3BEO0FBQ0Y7QUFFQTFJLE9BQU8sQ0FBQzJJLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRXpJLGNBQWUsQ0FBQztBQUNwRCxTQUFTRCwyQkFBMkIifQ==