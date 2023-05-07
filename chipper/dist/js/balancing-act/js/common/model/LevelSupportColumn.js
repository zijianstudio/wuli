// Copyright 2013-2022, University of Colorado Boulder

/**
 * This is a column that can be used to support one of the ends of the plank
 * in a level position.  At the time of this writing, this type of column is
 * always used in conjunction with another that is holding up the other side of
 * the plank.
 *
 * @author John Blanco
 */

import { Shape } from '../../../../kite/js/imports.js';
import balancingAct from '../../balancingAct.js';

// constants
const COLUMN_WIDTH = 0.35; // In meters

/**
 * @param height
 * @param centerX
 * @constructor
 */
function LevelSupportColumn(height, centerX) {
  this.shape = Shape.rect(centerX - COLUMN_WIDTH / 2, 0, COLUMN_WIDTH, height);
}
balancingAct.register('LevelSupportColumn', LevelSupportColumn);
export default LevelSupportColumn;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsImJhbGFuY2luZ0FjdCIsIkNPTFVNTl9XSURUSCIsIkxldmVsU3VwcG9ydENvbHVtbiIsImhlaWdodCIsImNlbnRlclgiLCJzaGFwZSIsInJlY3QiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxldmVsU3VwcG9ydENvbHVtbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGlzIGEgY29sdW1uIHRoYXQgY2FuIGJlIHVzZWQgdG8gc3VwcG9ydCBvbmUgb2YgdGhlIGVuZHMgb2YgdGhlIHBsYW5rXHJcbiAqIGluIGEgbGV2ZWwgcG9zaXRpb24uICBBdCB0aGUgdGltZSBvZiB0aGlzIHdyaXRpbmcsIHRoaXMgdHlwZSBvZiBjb2x1bW4gaXNcclxuICogYWx3YXlzIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBhbm90aGVyIHRoYXQgaXMgaG9sZGluZyB1cCB0aGUgb3RoZXIgc2lkZSBvZlxyXG4gKiB0aGUgcGxhbmsuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBiYWxhbmNpbmdBY3QgZnJvbSAnLi4vLi4vYmFsYW5jaW5nQWN0LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBDT0xVTU5fV0lEVEggPSAwLjM1OyAvLyBJbiBtZXRlcnNcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0gaGVpZ2h0XHJcbiAqIEBwYXJhbSBjZW50ZXJYXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gTGV2ZWxTdXBwb3J0Q29sdW1uKCBoZWlnaHQsIGNlbnRlclggKSB7XHJcbiAgdGhpcy5zaGFwZSA9IFNoYXBlLnJlY3QoIGNlbnRlclggLSBDT0xVTU5fV0lEVEggLyAyLCAwLCBDT0xVTU5fV0lEVEgsIGhlaWdodCApO1xyXG59XHJcblxyXG5iYWxhbmNpbmdBY3QucmVnaXN0ZXIoICdMZXZlbFN1cHBvcnRDb2x1bW4nLCBMZXZlbFN1cHBvcnRDb2x1bW4gKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IExldmVsU3VwcG9ydENvbHVtbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxZQUFZLE1BQU0sdUJBQXVCOztBQUVoRDtBQUNBLE1BQU1DLFlBQVksR0FBRyxJQUFJLENBQUMsQ0FBQzs7QUFFM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNDLGtCQUFrQkEsQ0FBRUMsTUFBTSxFQUFFQyxPQUFPLEVBQUc7RUFDN0MsSUFBSSxDQUFDQyxLQUFLLEdBQUdOLEtBQUssQ0FBQ08sSUFBSSxDQUFFRixPQUFPLEdBQUdILFlBQVksR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFQSxZQUFZLEVBQUVFLE1BQU8sQ0FBQztBQUNoRjtBQUVBSCxZQUFZLENBQUNPLFFBQVEsQ0FBRSxvQkFBb0IsRUFBRUwsa0JBQW1CLENBQUM7QUFFakUsZUFBZUEsa0JBQWtCIn0=