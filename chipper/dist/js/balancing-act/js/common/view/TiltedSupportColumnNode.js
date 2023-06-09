// Copyright 2013-2022, University of Colorado Boulder

/**
 * Node that represents a support column with a non-level (a.k.a. tilted) top
 * in the view.
 *
 * @author John Blanco
 */

import { LinearGradient, Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import balancingAct from '../../balancingAct.js';
import ColumnState from '../model/ColumnState.js';
class TiltedSupportColumnNode extends Node {
  /**
   * @param modelViewTransform
   * @param tiltedSupportColumn
   * @param columnState
   */
  constructor(modelViewTransform, tiltedSupportColumn, columnState) {
    super();

    // Create and add the main body of the column.
    const transformedColumnShape = modelViewTransform.modelToViewShape(tiltedSupportColumn.shape);
    const mainBodyGradient = new LinearGradient(transformedColumnShape.bounds.minX, 0, transformedColumnShape.bounds.maxX, 0).addColorStop(0, 'rgb( 150, 150, 150 )').addColorStop(0.25, 'rgb( 230, 230, 230 )').addColorStop(0.65, 'rgb( 150, 150, 150 )').addColorStop(1, 'rgb( 200, 200, 200 )');
    const columnNode = new Path(transformedColumnShape, {
      fill: mainBodyGradient,
      stroke: 'black',
      lineWidth: 1
    });
    this.addChild(columnNode);

    // Create and add the column support.
    const supportWidth = transformedColumnShape.bounds.width * 1.3; // Empirically determined.
    const supportHeight = transformedColumnShape.bounds.height * 0.15; // Empirically determined.
    const supportGradient = new LinearGradient(transformedColumnShape.bounds.centerX - supportWidth / 2, 0, transformedColumnShape.bounds.centerX + supportWidth / 2, 0).addColorStop(0, 'rgb( 150, 150, 150 )').addColorStop(0.25, 'rgb( 210, 210, 210 )').addColorStop(0.65, 'rgb( 150, 150, 150 )').addColorStop(1, 'rgb( 170, 170, 170 )');
    const columnSupportNode = new Rectangle(transformedColumnShape.bounds.centerX - supportWidth / 2, transformedColumnShape.bounds.maxY - supportHeight, supportWidth, supportHeight, 3, 3, {
      fill: supportGradient,
      stroke: 'black',
      lineWidth: 1
    });
    this.addChild(columnSupportNode);
    columnState.link(state => {
      this.visible = state === ColumnState.SINGLE_COLUMN;
    });
  }
}
balancingAct.register('TiltedSupportColumnNode', TiltedSupportColumnNode);
export default TiltedSupportColumnNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaW5lYXJHcmFkaWVudCIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiYmFsYW5jaW5nQWN0IiwiQ29sdW1uU3RhdGUiLCJUaWx0ZWRTdXBwb3J0Q29sdW1uTm9kZSIsImNvbnN0cnVjdG9yIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwidGlsdGVkU3VwcG9ydENvbHVtbiIsImNvbHVtblN0YXRlIiwidHJhbnNmb3JtZWRDb2x1bW5TaGFwZSIsIm1vZGVsVG9WaWV3U2hhcGUiLCJzaGFwZSIsIm1haW5Cb2R5R3JhZGllbnQiLCJib3VuZHMiLCJtaW5YIiwibWF4WCIsImFkZENvbG9yU3RvcCIsImNvbHVtbk5vZGUiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwiYWRkQ2hpbGQiLCJzdXBwb3J0V2lkdGgiLCJ3aWR0aCIsInN1cHBvcnRIZWlnaHQiLCJoZWlnaHQiLCJzdXBwb3J0R3JhZGllbnQiLCJjZW50ZXJYIiwiY29sdW1uU3VwcG9ydE5vZGUiLCJtYXhZIiwibGluayIsInN0YXRlIiwidmlzaWJsZSIsIlNJTkdMRV9DT0xVTU4iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRpbHRlZFN1cHBvcnRDb2x1bW5Ob2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE5vZGUgdGhhdCByZXByZXNlbnRzIGEgc3VwcG9ydCBjb2x1bW4gd2l0aCBhIG5vbi1sZXZlbCAoYS5rLmEuIHRpbHRlZCkgdG9wXHJcbiAqIGluIHRoZSB2aWV3LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgTGluZWFyR3JhZGllbnQsIE5vZGUsIFBhdGgsIFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBiYWxhbmNpbmdBY3QgZnJvbSAnLi4vLi4vYmFsYW5jaW5nQWN0LmpzJztcclxuaW1wb3J0IENvbHVtblN0YXRlIGZyb20gJy4uL21vZGVsL0NvbHVtblN0YXRlLmpzJztcclxuXHJcbmNsYXNzIFRpbHRlZFN1cHBvcnRDb2x1bW5Ob2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0gdGlsdGVkU3VwcG9ydENvbHVtblxyXG4gICAqIEBwYXJhbSBjb2x1bW5TdGF0ZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHRpbHRlZFN1cHBvcnRDb2x1bW4sIGNvbHVtblN0YXRlICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYW5kIGFkZCB0aGUgbWFpbiBib2R5IG9mIHRoZSBjb2x1bW4uXHJcbiAgICBjb25zdCB0cmFuc2Zvcm1lZENvbHVtblNoYXBlID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3U2hhcGUoIHRpbHRlZFN1cHBvcnRDb2x1bW4uc2hhcGUgKTtcclxuICAgIGNvbnN0IG1haW5Cb2R5R3JhZGllbnQgPSBuZXcgTGluZWFyR3JhZGllbnQoIHRyYW5zZm9ybWVkQ29sdW1uU2hhcGUuYm91bmRzLm1pblgsIDAsIHRyYW5zZm9ybWVkQ29sdW1uU2hhcGUuYm91bmRzLm1heFgsIDAgKS5hZGRDb2xvclN0b3AoIDAsICdyZ2IoIDE1MCwgMTUwLCAxNTAgKScgKS5hZGRDb2xvclN0b3AoIDAuMjUsICdyZ2IoIDIzMCwgMjMwLCAyMzAgKScgKS5hZGRDb2xvclN0b3AoIDAuNjUsICdyZ2IoIDE1MCwgMTUwLCAxNTAgKScgKS5hZGRDb2xvclN0b3AoIDEsICdyZ2IoIDIwMCwgMjAwLCAyMDAgKScgKTtcclxuXHJcbiAgICBjb25zdCBjb2x1bW5Ob2RlID0gbmV3IFBhdGgoIHRyYW5zZm9ybWVkQ29sdW1uU2hhcGUsXHJcbiAgICAgIHtcclxuICAgICAgICBmaWxsOiBtYWluQm9keUdyYWRpZW50LFxyXG4gICAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgICBsaW5lV2lkdGg6IDFcclxuICAgICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggY29sdW1uTm9kZSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSBjb2x1bW4gc3VwcG9ydC5cclxuICAgIGNvbnN0IHN1cHBvcnRXaWR0aCA9IHRyYW5zZm9ybWVkQ29sdW1uU2hhcGUuYm91bmRzLndpZHRoICogMS4zOyAvLyBFbXBpcmljYWxseSBkZXRlcm1pbmVkLlxyXG4gICAgY29uc3Qgc3VwcG9ydEhlaWdodCA9IHRyYW5zZm9ybWVkQ29sdW1uU2hhcGUuYm91bmRzLmhlaWdodCAqIDAuMTU7IC8vIEVtcGlyaWNhbGx5IGRldGVybWluZWQuXHJcbiAgICBjb25zdCBzdXBwb3J0R3JhZGllbnQgPSBuZXcgTGluZWFyR3JhZGllbnQoIHRyYW5zZm9ybWVkQ29sdW1uU2hhcGUuYm91bmRzLmNlbnRlclggLSBzdXBwb3J0V2lkdGggLyAyLCAwLCB0cmFuc2Zvcm1lZENvbHVtblNoYXBlLmJvdW5kcy5jZW50ZXJYICsgc3VwcG9ydFdpZHRoIC8gMiwgMCApLmFkZENvbG9yU3RvcCggMCwgJ3JnYiggMTUwLCAxNTAsIDE1MCApJyApLmFkZENvbG9yU3RvcCggMC4yNSwgJ3JnYiggMjEwLCAyMTAsIDIxMCApJyApLmFkZENvbG9yU3RvcCggMC42NSwgJ3JnYiggMTUwLCAxNTAsIDE1MCApJyApLmFkZENvbG9yU3RvcCggMSwgJ3JnYiggMTcwLCAxNzAsIDE3MCApJyApO1xyXG4gICAgY29uc3QgY29sdW1uU3VwcG9ydE5vZGUgPSBuZXcgUmVjdGFuZ2xlKFxyXG4gICAgICB0cmFuc2Zvcm1lZENvbHVtblNoYXBlLmJvdW5kcy5jZW50ZXJYIC0gc3VwcG9ydFdpZHRoIC8gMixcclxuICAgICAgdHJhbnNmb3JtZWRDb2x1bW5TaGFwZS5ib3VuZHMubWF4WSAtIHN1cHBvcnRIZWlnaHQsXHJcbiAgICAgIHN1cHBvcnRXaWR0aCxcclxuICAgICAgc3VwcG9ydEhlaWdodCxcclxuICAgICAgMyxcclxuICAgICAgMyxcclxuICAgICAge1xyXG4gICAgICAgIGZpbGw6IHN1cHBvcnRHcmFkaWVudCxcclxuICAgICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgICAgbGluZVdpZHRoOiAxXHJcbiAgICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNvbHVtblN1cHBvcnROb2RlICk7XHJcblxyXG4gICAgY29sdW1uU3RhdGUubGluayggc3RhdGUgPT4ge1xyXG4gICAgICB0aGlzLnZpc2libGUgPSBzdGF0ZSA9PT0gQ29sdW1uU3RhdGUuU0lOR0xFX0NPTFVNTjtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmJhbGFuY2luZ0FjdC5yZWdpc3RlciggJ1RpbHRlZFN1cHBvcnRDb2x1bW5Ob2RlJywgVGlsdGVkU3VwcG9ydENvbHVtbk5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRpbHRlZFN1cHBvcnRDb2x1bW5Ob2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLGNBQWMsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDekYsT0FBT0MsWUFBWSxNQUFNLHVCQUF1QjtBQUNoRCxPQUFPQyxXQUFXLE1BQU0seUJBQXlCO0FBRWpELE1BQU1DLHVCQUF1QixTQUFTTCxJQUFJLENBQUM7RUFFekM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFTSxXQUFXQSxDQUFFQyxrQkFBa0IsRUFBRUMsbUJBQW1CLEVBQUVDLFdBQVcsRUFBRztJQUNsRSxLQUFLLENBQUMsQ0FBQzs7SUFFUDtJQUNBLE1BQU1DLHNCQUFzQixHQUFHSCxrQkFBa0IsQ0FBQ0ksZ0JBQWdCLENBQUVILG1CQUFtQixDQUFDSSxLQUFNLENBQUM7SUFDL0YsTUFBTUMsZ0JBQWdCLEdBQUcsSUFBSWQsY0FBYyxDQUFFVyxzQkFBc0IsQ0FBQ0ksTUFBTSxDQUFDQyxJQUFJLEVBQUUsQ0FBQyxFQUFFTCxzQkFBc0IsQ0FBQ0ksTUFBTSxDQUFDRSxJQUFJLEVBQUUsQ0FBRSxDQUFDLENBQUNDLFlBQVksQ0FBRSxDQUFDLEVBQUUsc0JBQXVCLENBQUMsQ0FBQ0EsWUFBWSxDQUFFLElBQUksRUFBRSxzQkFBdUIsQ0FBQyxDQUFDQSxZQUFZLENBQUUsSUFBSSxFQUFFLHNCQUF1QixDQUFDLENBQUNBLFlBQVksQ0FBRSxDQUFDLEVBQUUsc0JBQXVCLENBQUM7SUFFelMsTUFBTUMsVUFBVSxHQUFHLElBQUlqQixJQUFJLENBQUVTLHNCQUFzQixFQUNqRDtNQUNFUyxJQUFJLEVBQUVOLGdCQUFnQjtNQUN0Qk8sTUFBTSxFQUFFLE9BQU87TUFDZkMsU0FBUyxFQUFFO0lBQ2IsQ0FBRSxDQUFDO0lBQ0wsSUFBSSxDQUFDQyxRQUFRLENBQUVKLFVBQVcsQ0FBQzs7SUFFM0I7SUFDQSxNQUFNSyxZQUFZLEdBQUdiLHNCQUFzQixDQUFDSSxNQUFNLENBQUNVLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNoRSxNQUFNQyxhQUFhLEdBQUdmLHNCQUFzQixDQUFDSSxNQUFNLENBQUNZLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNuRSxNQUFNQyxlQUFlLEdBQUcsSUFBSTVCLGNBQWMsQ0FBRVcsc0JBQXNCLENBQUNJLE1BQU0sQ0FBQ2MsT0FBTyxHQUFHTCxZQUFZLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRWIsc0JBQXNCLENBQUNJLE1BQU0sQ0FBQ2MsT0FBTyxHQUFHTCxZQUFZLEdBQUcsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDTixZQUFZLENBQUUsQ0FBQyxFQUFFLHNCQUF1QixDQUFDLENBQUNBLFlBQVksQ0FBRSxJQUFJLEVBQUUsc0JBQXVCLENBQUMsQ0FBQ0EsWUFBWSxDQUFFLElBQUksRUFBRSxzQkFBdUIsQ0FBQyxDQUFDQSxZQUFZLENBQUUsQ0FBQyxFQUFFLHNCQUF1QixDQUFDO0lBQ3BWLE1BQU1ZLGlCQUFpQixHQUFHLElBQUkzQixTQUFTLENBQ3JDUSxzQkFBc0IsQ0FBQ0ksTUFBTSxDQUFDYyxPQUFPLEdBQUdMLFlBQVksR0FBRyxDQUFDLEVBQ3hEYixzQkFBc0IsQ0FBQ0ksTUFBTSxDQUFDZ0IsSUFBSSxHQUFHTCxhQUFhLEVBQ2xERixZQUFZLEVBQ1pFLGFBQWEsRUFDYixDQUFDLEVBQ0QsQ0FBQyxFQUNEO01BQ0VOLElBQUksRUFBRVEsZUFBZTtNQUNyQlAsTUFBTSxFQUFFLE9BQU87TUFDZkMsU0FBUyxFQUFFO0lBQ2IsQ0FBRSxDQUFDO0lBQ0wsSUFBSSxDQUFDQyxRQUFRLENBQUVPLGlCQUFrQixDQUFDO0lBRWxDcEIsV0FBVyxDQUFDc0IsSUFBSSxDQUFFQyxLQUFLLElBQUk7TUFDekIsSUFBSSxDQUFDQyxPQUFPLEdBQUdELEtBQUssS0FBSzVCLFdBQVcsQ0FBQzhCLGFBQWE7SUFDcEQsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBL0IsWUFBWSxDQUFDZ0MsUUFBUSxDQUFFLHlCQUF5QixFQUFFOUIsdUJBQXdCLENBQUM7QUFFM0UsZUFBZUEsdUJBQXVCIn0=