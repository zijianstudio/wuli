// Copyright 2015-2022, University of Colorado Boulder

/**
 * Scenery node that defines a periodic table of the elements.
 */

import Vector2 from '../../../dot/js/Vector2.js';
import merge from '../../../phet-core/js/merge.js';
import { Node } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import AtomIdentifier from '../AtomIdentifier.js';
import shred from '../shred.js';
import ShredConstants from '../ShredConstants.js';
import PeriodicTableCell from './PeriodicTableCell.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';

// constants
// 2D array that defines the table structure.
const POPULATED_CELLS = [[0, 17], [0, 1, 12, 13, 14, 15, 16, 17], [0, 1, 12, 13, 14, 15, 16, 17], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]];
const ENABLED_CELL_COLOR = ShredConstants.DISPLAY_PANEL_BACKGROUND_COLOR;
const DISABLED_CELL_COLOR = '#EEEEEE';
const SELECTED_CELL_COLOR = '#FA8072'; //salmon

class PeriodicTableNode extends Node {
  /**
   * @param {NumberAtom} numberAtom - Atom that defines which element is currently highlighted.
   * @param {Object} [options]
   */
  constructor(numberAtom, options) {
    options = merge({
      interactiveMax: 0,
      //Atomic number of the heaviest element that should be interactive
      cellDimension: 25,
      showLabels: true,
      strokeHighlightWidth: 2,
      strokeHighlightColor: PhetColorScheme.RED_COLORBLIND,
      labelTextHighlightFill: 'black',
      enabledCellColor: ENABLED_CELL_COLOR,
      disabledCellColor: DISABLED_CELL_COLOR,
      selectedCellColor: SELECTED_CELL_COLOR,
      tandem: Tandem.REQUIRED
    }, options);
    super();

    // @private the cells of the table
    this.cells = [];
    let elementIndex = 1;
    for (let i = 0; i < POPULATED_CELLS.length; i++) {
      const populatedCellsInRow = POPULATED_CELLS[i];
      const cellColor = {
        enabled: options.enabledCellColor,
        disabled: options.disabledCellColor,
        selected: options.selectedCellColor
      };
      for (let j = 0; j < populatedCellsInRow.length; j++) {
        const cell = new PeriodicTableCell(elementIndex, numberAtom, cellColor, {
          interactive: elementIndex <= options.interactiveMax,
          showLabels: options.showLabels,
          strokeHighlightWidth: options.strokeHighlightWidth,
          strokeHighlightColor: options.strokeHighlightColor,
          labelTextHighlightFill: options.labelTextHighlightFill,
          length: options.cellDimension,
          tandem: options.tandem.createTandem(`${AtomIdentifier.getEnglishName(elementIndex)}Cell`)
        });
        cell.translation = new Vector2(populatedCellsInRow[j] * options.cellDimension, i * options.cellDimension);
        this.addChild(cell);
        this.cells.push(cell);
        elementIndex++;
        if (elementIndex === 58) {
          elementIndex = 72;
        }
        if (elementIndex === 90) {
          elementIndex = 104;
        }
      }
    }

    // Highlight the cell that corresponds to the atom.
    let highlightedCell = null;
    const updateHighlightedCell = protonCount => {
      if (highlightedCell !== null) {
        highlightedCell.setHighlighted(false);
      }
      if (protonCount > 0 && protonCount <= 118) {
        let elementIndex = protonCount;
        if (protonCount >= 72) {
          elementIndex = elementIndex - 14;
        }
        if (protonCount >= 104 && protonCount <= 118) {
          elementIndex = elementIndex - 14;
        }
        highlightedCell = this.cells[elementIndex - 1];
        highlightedCell.moveToFront();
        highlightedCell.setHighlighted(true);
      }
    };
    numberAtom.protonCountProperty.link(updateHighlightedCell);

    // @private - unlink from Properties
    this.disposePeriodicTableNode = () => {
      numberAtom.protonCountProperty.hasListener(updateHighlightedCell) && numberAtom.protonCountProperty.unlink(updateHighlightedCell);
      this.cells.forEach(cell => {
        !cell.isDisposed && cell.dispose();
      });
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.children.forEach(node => node.dispose());
    this.disposePeriodicTableNode();
    super.dispose();
  }
}
shred.register('PeriodicTableNode', PeriodicTableNode);
export default PeriodicTableNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwibWVyZ2UiLCJOb2RlIiwiVGFuZGVtIiwiQXRvbUlkZW50aWZpZXIiLCJzaHJlZCIsIlNocmVkQ29uc3RhbnRzIiwiUGVyaW9kaWNUYWJsZUNlbGwiLCJQaGV0Q29sb3JTY2hlbWUiLCJQT1BVTEFURURfQ0VMTFMiLCJFTkFCTEVEX0NFTExfQ09MT1IiLCJESVNQTEFZX1BBTkVMX0JBQ0tHUk9VTkRfQ09MT1IiLCJESVNBQkxFRF9DRUxMX0NPTE9SIiwiU0VMRUNURURfQ0VMTF9DT0xPUiIsIlBlcmlvZGljVGFibGVOb2RlIiwiY29uc3RydWN0b3IiLCJudW1iZXJBdG9tIiwib3B0aW9ucyIsImludGVyYWN0aXZlTWF4IiwiY2VsbERpbWVuc2lvbiIsInNob3dMYWJlbHMiLCJzdHJva2VIaWdobGlnaHRXaWR0aCIsInN0cm9rZUhpZ2hsaWdodENvbG9yIiwiUkVEX0NPTE9SQkxJTkQiLCJsYWJlbFRleHRIaWdobGlnaHRGaWxsIiwiZW5hYmxlZENlbGxDb2xvciIsImRpc2FibGVkQ2VsbENvbG9yIiwic2VsZWN0ZWRDZWxsQ29sb3IiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsImNlbGxzIiwiZWxlbWVudEluZGV4IiwiaSIsImxlbmd0aCIsInBvcHVsYXRlZENlbGxzSW5Sb3ciLCJjZWxsQ29sb3IiLCJlbmFibGVkIiwiZGlzYWJsZWQiLCJzZWxlY3RlZCIsImoiLCJjZWxsIiwiaW50ZXJhY3RpdmUiLCJjcmVhdGVUYW5kZW0iLCJnZXRFbmdsaXNoTmFtZSIsInRyYW5zbGF0aW9uIiwiYWRkQ2hpbGQiLCJwdXNoIiwiaGlnaGxpZ2h0ZWRDZWxsIiwidXBkYXRlSGlnaGxpZ2h0ZWRDZWxsIiwicHJvdG9uQ291bnQiLCJzZXRIaWdobGlnaHRlZCIsIm1vdmVUb0Zyb250IiwicHJvdG9uQ291bnRQcm9wZXJ0eSIsImxpbmsiLCJkaXNwb3NlUGVyaW9kaWNUYWJsZU5vZGUiLCJoYXNMaXN0ZW5lciIsInVubGluayIsImZvckVhY2giLCJpc0Rpc3Bvc2VkIiwiZGlzcG9zZSIsImNoaWxkcmVuIiwibm9kZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGVyaW9kaWNUYWJsZU5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2NlbmVyeSBub2RlIHRoYXQgZGVmaW5lcyBhIHBlcmlvZGljIHRhYmxlIG9mIHRoZSBlbGVtZW50cy5cclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEF0b21JZGVudGlmaWVyIGZyb20gJy4uL0F0b21JZGVudGlmaWVyLmpzJztcclxuaW1wb3J0IHNocmVkIGZyb20gJy4uL3NocmVkLmpzJztcclxuaW1wb3J0IFNocmVkQ29uc3RhbnRzIGZyb20gJy4uL1NocmVkQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFBlcmlvZGljVGFibGVDZWxsIGZyb20gJy4vUGVyaW9kaWNUYWJsZUNlbGwuanMnO1xyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbi8vIDJEIGFycmF5IHRoYXQgZGVmaW5lcyB0aGUgdGFibGUgc3RydWN0dXJlLlxyXG5jb25zdCBQT1BVTEFURURfQ0VMTFMgPSBbXHJcbiAgWyAwLCAxNyBdLFxyXG4gIFsgMCwgMSwgMTIsIDEzLCAxNCwgMTUsIDE2LCAxNyBdLFxyXG4gIFsgMCwgMSwgMTIsIDEzLCAxNCwgMTUsIDE2LCAxNyBdLFxyXG4gIFsgMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0LCAxNSwgMTYsIDE3IF0sXHJcbiAgWyAwLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCwgMTEsIDEyLCAxMywgMTQsIDE1LCAxNiwgMTcgXSxcclxuICBbIDAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMSwgMTIsIDEzLCAxNCwgMTUsIDE2LCAxNyBdLFxyXG4gIFsgMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0LCAxNSwgMTYsIDE3IF1cclxuXTtcclxuY29uc3QgRU5BQkxFRF9DRUxMX0NPTE9SID0gU2hyZWRDb25zdGFudHMuRElTUExBWV9QQU5FTF9CQUNLR1JPVU5EX0NPTE9SO1xyXG5jb25zdCBESVNBQkxFRF9DRUxMX0NPTE9SID0gJyNFRUVFRUUnO1xyXG5jb25zdCBTRUxFQ1RFRF9DRUxMX0NPTE9SID0gJyNGQTgwNzInOyAvL3NhbG1vblxyXG5cclxuY2xhc3MgUGVyaW9kaWNUYWJsZU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJBdG9tfSBudW1iZXJBdG9tIC0gQXRvbSB0aGF0IGRlZmluZXMgd2hpY2ggZWxlbWVudCBpcyBjdXJyZW50bHkgaGlnaGxpZ2h0ZWQuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBudW1iZXJBdG9tLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBpbnRlcmFjdGl2ZU1heDogMCwgLy9BdG9taWMgbnVtYmVyIG9mIHRoZSBoZWF2aWVzdCBlbGVtZW50IHRoYXQgc2hvdWxkIGJlIGludGVyYWN0aXZlXHJcbiAgICAgIGNlbGxEaW1lbnNpb246IDI1LFxyXG4gICAgICBzaG93TGFiZWxzOiB0cnVlLFxyXG4gICAgICBzdHJva2VIaWdobGlnaHRXaWR0aDogMixcclxuICAgICAgc3Ryb2tlSGlnaGxpZ2h0Q29sb3I6IFBoZXRDb2xvclNjaGVtZS5SRURfQ09MT1JCTElORCxcclxuICAgICAgbGFiZWxUZXh0SGlnaGxpZ2h0RmlsbDogJ2JsYWNrJyxcclxuICAgICAgZW5hYmxlZENlbGxDb2xvcjogRU5BQkxFRF9DRUxMX0NPTE9SLFxyXG4gICAgICBkaXNhYmxlZENlbGxDb2xvcjogRElTQUJMRURfQ0VMTF9DT0xPUixcclxuICAgICAgc2VsZWN0ZWRDZWxsQ29sb3I6IFNFTEVDVEVEX0NFTExfQ09MT1IsXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB0aGUgY2VsbHMgb2YgdGhlIHRhYmxlXHJcbiAgICB0aGlzLmNlbGxzID0gW107XHJcbiAgICBsZXQgZWxlbWVudEluZGV4ID0gMTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IFBPUFVMQVRFRF9DRUxMUy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgcG9wdWxhdGVkQ2VsbHNJblJvdyA9IFBPUFVMQVRFRF9DRUxMU1sgaSBdO1xyXG4gICAgICBjb25zdCBjZWxsQ29sb3IgPSB7XHJcbiAgICAgICAgZW5hYmxlZDogb3B0aW9ucy5lbmFibGVkQ2VsbENvbG9yLFxyXG4gICAgICAgIGRpc2FibGVkOiBvcHRpb25zLmRpc2FibGVkQ2VsbENvbG9yLFxyXG4gICAgICAgIHNlbGVjdGVkOiBvcHRpb25zLnNlbGVjdGVkQ2VsbENvbG9yXHJcbiAgICAgIH07XHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHBvcHVsYXRlZENlbGxzSW5Sb3cubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgY29uc3QgY2VsbCA9IG5ldyBQZXJpb2RpY1RhYmxlQ2VsbCggZWxlbWVudEluZGV4LCBudW1iZXJBdG9tLCBjZWxsQ29sb3IsIHtcclxuICAgICAgICAgIGludGVyYWN0aXZlOiBlbGVtZW50SW5kZXggPD0gb3B0aW9ucy5pbnRlcmFjdGl2ZU1heCxcclxuICAgICAgICAgIHNob3dMYWJlbHM6IG9wdGlvbnMuc2hvd0xhYmVscyxcclxuICAgICAgICAgIHN0cm9rZUhpZ2hsaWdodFdpZHRoOiBvcHRpb25zLnN0cm9rZUhpZ2hsaWdodFdpZHRoLFxyXG4gICAgICAgICAgc3Ryb2tlSGlnaGxpZ2h0Q29sb3I6IG9wdGlvbnMuc3Ryb2tlSGlnaGxpZ2h0Q29sb3IsXHJcbiAgICAgICAgICBsYWJlbFRleHRIaWdobGlnaHRGaWxsOiBvcHRpb25zLmxhYmVsVGV4dEhpZ2hsaWdodEZpbGwsXHJcbiAgICAgICAgICBsZW5ndGg6IG9wdGlvbnMuY2VsbERpbWVuc2lvbixcclxuICAgICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCBgJHtBdG9tSWRlbnRpZmllci5nZXRFbmdsaXNoTmFtZSggZWxlbWVudEluZGV4ICl9Q2VsbGAgKVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBjZWxsLnRyYW5zbGF0aW9uID0gbmV3IFZlY3RvcjIoIHBvcHVsYXRlZENlbGxzSW5Sb3dbIGogXSAqIG9wdGlvbnMuY2VsbERpbWVuc2lvbiwgaSAqIG9wdGlvbnMuY2VsbERpbWVuc2lvbiApO1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoIGNlbGwgKTtcclxuICAgICAgICB0aGlzLmNlbGxzLnB1c2goIGNlbGwgKTtcclxuICAgICAgICBlbGVtZW50SW5kZXgrKztcclxuICAgICAgICBpZiAoIGVsZW1lbnRJbmRleCA9PT0gNTggKSB7XHJcbiAgICAgICAgICBlbGVtZW50SW5kZXggPSA3MjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBlbGVtZW50SW5kZXggPT09IDkwICkge1xyXG4gICAgICAgICAgZWxlbWVudEluZGV4ID0gMTA0O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEhpZ2hsaWdodCB0aGUgY2VsbCB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBhdG9tLlxyXG4gICAgbGV0IGhpZ2hsaWdodGVkQ2VsbCA9IG51bGw7XHJcbiAgICBjb25zdCB1cGRhdGVIaWdobGlnaHRlZENlbGwgPSBwcm90b25Db3VudCA9PiB7XHJcbiAgICAgIGlmICggaGlnaGxpZ2h0ZWRDZWxsICE9PSBudWxsICkge1xyXG4gICAgICAgIGhpZ2hsaWdodGVkQ2VsbC5zZXRIaWdobGlnaHRlZCggZmFsc2UgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHByb3RvbkNvdW50ID4gMCAmJiBwcm90b25Db3VudCA8PSAxMTggKSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRJbmRleCA9IHByb3RvbkNvdW50O1xyXG4gICAgICAgIGlmICggcHJvdG9uQ291bnQgPj0gNzIgKSB7XHJcbiAgICAgICAgICBlbGVtZW50SW5kZXggPSBlbGVtZW50SW5kZXggLSAxNDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBwcm90b25Db3VudCA+PSAxMDQgJiYgcHJvdG9uQ291bnQgPD0gMTE4ICkge1xyXG4gICAgICAgICAgZWxlbWVudEluZGV4ID0gZWxlbWVudEluZGV4IC0gMTQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhpZ2hsaWdodGVkQ2VsbCA9IHRoaXMuY2VsbHNbIGVsZW1lbnRJbmRleCAtIDEgXTtcclxuICAgICAgICBoaWdobGlnaHRlZENlbGwubW92ZVRvRnJvbnQoKTtcclxuICAgICAgICBoaWdobGlnaHRlZENlbGwuc2V0SGlnaGxpZ2h0ZWQoIHRydWUgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIG51bWJlckF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS5saW5rKCB1cGRhdGVIaWdobGlnaHRlZENlbGwgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHVubGluayBmcm9tIFByb3BlcnRpZXNcclxuICAgIHRoaXMuZGlzcG9zZVBlcmlvZGljVGFibGVOb2RlID0gKCkgPT4ge1xyXG4gICAgICBudW1iZXJBdG9tLnByb3RvbkNvdW50UHJvcGVydHkuaGFzTGlzdGVuZXIoIHVwZGF0ZUhpZ2hsaWdodGVkQ2VsbCApICYmIG51bWJlckF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS51bmxpbmsoIHVwZGF0ZUhpZ2hsaWdodGVkQ2VsbCApO1xyXG4gICAgICB0aGlzLmNlbGxzLmZvckVhY2goIGNlbGwgPT4geyAhY2VsbC5pc0Rpc3Bvc2VkICYmIGNlbGwuZGlzcG9zZSgpO30gKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCggbm9kZSA9PiBub2RlLmRpc3Bvc2UoKSApO1xyXG4gICAgdGhpcy5kaXNwb3NlUGVyaW9kaWNUYWJsZU5vZGUoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbnNocmVkLnJlZ2lzdGVyKCAnUGVyaW9kaWNUYWJsZU5vZGUnLCBQZXJpb2RpY1RhYmxlTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBQZXJpb2RpY1RhYmxlTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsU0FBU0MsSUFBSSxRQUFRLGdDQUFnQztBQUNyRCxPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLGNBQWMsTUFBTSxzQkFBc0I7QUFDakQsT0FBT0MsS0FBSyxNQUFNLGFBQWE7QUFDL0IsT0FBT0MsY0FBYyxNQUFNLHNCQUFzQjtBQUNqRCxPQUFPQyxpQkFBaUIsTUFBTSx3QkFBd0I7QUFDdEQsT0FBT0MsZUFBZSxNQUFNLDZDQUE2Qzs7QUFFekU7QUFDQTtBQUNBLE1BQU1DLGVBQWUsR0FBRyxDQUN0QixDQUFFLENBQUMsRUFBRSxFQUFFLENBQUUsRUFDVCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUUsRUFDaEMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFFLEVBQ2hDLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUUsRUFDaEUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxFQUNoRSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFFLEVBQ2hFLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVB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