// Copyright 2017-2023, University of Colorado Boulder

/**
 * Used for debugging purposes to see the cells in each RowOfMovable instance.
 * See URQueryParameters.showCells.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Path } from '../../../../scenery/js/imports.js';
import unitRates from '../../unitRates.js';
export default class RowOfMovablesNode extends Path {
  /**
   * @param {RowOfMovables} rowOfMovables
   * @param {Object} [options]
   */
  constructor(rowOfMovables, options) {
    options = merge({
      stroke: 'black'
    }, options);
    const cellWidth = rowOfMovables.cellSize.width;
    const cellHeight = rowOfMovables.cellSize.height;

    // add a rectangle for each cell
    const shape = new Shape();
    rowOfMovables.getCells().forEach(cell => {
      const x = cell.position.x - cellWidth / 2;
      const y = cell.position.y - cellHeight;
      shape.rect(x, y, cellWidth, cellHeight);
    });
    super(shape, options);
  }
}
unitRates.register('RowOfMovablesNode', RowOfMovablesNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIm1lcmdlIiwiUGF0aCIsInVuaXRSYXRlcyIsIlJvd09mTW92YWJsZXNOb2RlIiwiY29uc3RydWN0b3IiLCJyb3dPZk1vdmFibGVzIiwib3B0aW9ucyIsInN0cm9rZSIsImNlbGxXaWR0aCIsImNlbGxTaXplIiwid2lkdGgiLCJjZWxsSGVpZ2h0IiwiaGVpZ2h0Iiwic2hhcGUiLCJnZXRDZWxscyIsImZvckVhY2giLCJjZWxsIiwieCIsInBvc2l0aW9uIiwieSIsInJlY3QiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJvd09mTW92YWJsZXNOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFVzZWQgZm9yIGRlYnVnZ2luZyBwdXJwb3NlcyB0byBzZWUgdGhlIGNlbGxzIGluIGVhY2ggUm93T2ZNb3ZhYmxlIGluc3RhbmNlLlxyXG4gKiBTZWUgVVJRdWVyeVBhcmFtZXRlcnMuc2hvd0NlbGxzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgdW5pdFJhdGVzIGZyb20gJy4uLy4uL3VuaXRSYXRlcy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb3dPZk1vdmFibGVzTm9kZSBleHRlbmRzIFBhdGgge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1Jvd09mTW92YWJsZXN9IHJvd09mTW92YWJsZXNcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHJvd09mTW92YWJsZXMsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJ1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IGNlbGxXaWR0aCA9IHJvd09mTW92YWJsZXMuY2VsbFNpemUud2lkdGg7XHJcbiAgICBjb25zdCBjZWxsSGVpZ2h0ID0gcm93T2ZNb3ZhYmxlcy5jZWxsU2l6ZS5oZWlnaHQ7XHJcblxyXG4gICAgLy8gYWRkIGEgcmVjdGFuZ2xlIGZvciBlYWNoIGNlbGxcclxuICAgIGNvbnN0IHNoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICByb3dPZk1vdmFibGVzLmdldENlbGxzKCkuZm9yRWFjaCggY2VsbCA9PiB7XHJcbiAgICAgIGNvbnN0IHggPSBjZWxsLnBvc2l0aW9uLnggLSAoIGNlbGxXaWR0aCAvIDIgKTtcclxuICAgICAgY29uc3QgeSA9IGNlbGwucG9zaXRpb24ueSAtIGNlbGxIZWlnaHQ7XHJcbiAgICAgIHNoYXBlLnJlY3QoIHgsIHksIGNlbGxXaWR0aCwgY2VsbEhlaWdodCApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBzaGFwZSwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxudW5pdFJhdGVzLnJlZ2lzdGVyKCAnUm93T2ZNb3ZhYmxlc05vZGUnLCBSb3dPZk1vdmFibGVzTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLFNBQVMsTUFBTSxvQkFBb0I7QUFFMUMsZUFBZSxNQUFNQyxpQkFBaUIsU0FBU0YsSUFBSSxDQUFDO0VBRWxEO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VHLFdBQVdBLENBQUVDLGFBQWEsRUFBRUMsT0FBTyxFQUFHO0lBRXBDQSxPQUFPLEdBQUdOLEtBQUssQ0FBRTtNQUNmTyxNQUFNLEVBQUU7SUFDVixDQUFDLEVBQUVELE9BQVEsQ0FBQztJQUVaLE1BQU1FLFNBQVMsR0FBR0gsYUFBYSxDQUFDSSxRQUFRLENBQUNDLEtBQUs7SUFDOUMsTUFBTUMsVUFBVSxHQUFHTixhQUFhLENBQUNJLFFBQVEsQ0FBQ0csTUFBTTs7SUFFaEQ7SUFDQSxNQUFNQyxLQUFLLEdBQUcsSUFBSWQsS0FBSyxDQUFDLENBQUM7SUFDekJNLGFBQWEsQ0FBQ1MsUUFBUSxDQUFDLENBQUMsQ0FBQ0MsT0FBTyxDQUFFQyxJQUFJLElBQUk7TUFDeEMsTUFBTUMsQ0FBQyxHQUFHRCxJQUFJLENBQUNFLFFBQVEsQ0FBQ0QsQ0FBQyxHQUFLVCxTQUFTLEdBQUcsQ0FBRztNQUM3QyxNQUFNVyxDQUFDLEdBQUdILElBQUksQ0FBQ0UsUUFBUSxDQUFDQyxDQUFDLEdBQUdSLFVBQVU7TUFDdENFLEtBQUssQ0FBQ08sSUFBSSxDQUFFSCxDQUFDLEVBQUVFLENBQUMsRUFBRVgsU0FBUyxFQUFFRyxVQUFXLENBQUM7SUFDM0MsQ0FBRSxDQUFDO0lBRUgsS0FBSyxDQUFFRSxLQUFLLEVBQUVQLE9BQVEsQ0FBQztFQUN6QjtBQUNGO0FBRUFKLFNBQVMsQ0FBQ21CLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRWxCLGlCQUFrQixDQUFDIn0=