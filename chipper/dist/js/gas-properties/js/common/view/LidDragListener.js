// Copyright 2019-2022, University of Colorado Boulder

/**
 * LidDragListener is the drag listener for the container's lid. It determines the size of the opening in the top of
 * the container.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { DragListener } from '../../../../scenery/js/imports.js';
import gasProperties from '../../gasProperties.js';
export default class LidDragListener extends DragListener {
  constructor(container, modelViewTransform, parentNode, tandem) {
    // pointer's x offset from container.getOpeningLeft(), when a drag starts
    let startXOffset = 0;
    super({
      start: (event, listener) => {
        startXOffset = modelViewTransform.modelToViewX(container.getOpeningLeft()) - parentNode.globalToParentPoint(event.pointer.point).x;
      },
      drag: (event, listener) => {
        const viewX = parentNode.globalToParentPoint(event.pointer.point).x;
        const modelX = modelViewTransform.viewToModelX(viewX + startXOffset);
        if (modelX >= container.getOpeningRight()) {
          // the lid is fully closed
          container.lidWidthProperty.value = container.getMaxLidWidth();
        } else {
          // the lid is open
          const openingWidth = container.getOpeningRight() - modelX;
          container.lidWidthProperty.value = Math.max(container.getMaxLidWidth() - openingWidth, container.getMinLidWidth());
        }
      },
      // when the lid handle is released, log the opening
      end: () => {
        phet.log && phet.log(container.isOpenProperty.value ? `Lid is open: ${container.getOpeningLeft()} to ${container.getOpeningRight()} pm` : 'Lid is closed');
      },
      tandem: tandem
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
gasProperties.register('LidDragListener', LidDragListener);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEcmFnTGlzdGVuZXIiLCJnYXNQcm9wZXJ0aWVzIiwiTGlkRHJhZ0xpc3RlbmVyIiwiY29uc3RydWN0b3IiLCJjb250YWluZXIiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJwYXJlbnROb2RlIiwidGFuZGVtIiwic3RhcnRYT2Zmc2V0Iiwic3RhcnQiLCJldmVudCIsImxpc3RlbmVyIiwibW9kZWxUb1ZpZXdYIiwiZ2V0T3BlbmluZ0xlZnQiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwicG9pbnRlciIsInBvaW50IiwieCIsImRyYWciLCJ2aWV3WCIsIm1vZGVsWCIsInZpZXdUb01vZGVsWCIsImdldE9wZW5pbmdSaWdodCIsImxpZFdpZHRoUHJvcGVydHkiLCJ2YWx1ZSIsImdldE1heExpZFdpZHRoIiwib3BlbmluZ1dpZHRoIiwiTWF0aCIsIm1heCIsImdldE1pbkxpZFdpZHRoIiwiZW5kIiwicGhldCIsImxvZyIsImlzT3BlblByb3BlcnR5IiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGlkRHJhZ0xpc3RlbmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIExpZERyYWdMaXN0ZW5lciBpcyB0aGUgZHJhZyBsaXN0ZW5lciBmb3IgdGhlIGNvbnRhaW5lcidzIGxpZC4gSXQgZGV0ZXJtaW5lcyB0aGUgc2l6ZSBvZiB0aGUgb3BlbmluZyBpbiB0aGUgdG9wIG9mXHJcbiAqIHRoZSBjb250YWluZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgeyBEcmFnTGlzdGVuZXIsIE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgZ2FzUHJvcGVydGllcyBmcm9tICcuLi8uLi9nYXNQcm9wZXJ0aWVzLmpzJztcclxuaW1wb3J0IElkZWFsR2FzTGF3Q29udGFpbmVyIGZyb20gJy4uL21vZGVsL0lkZWFsR2FzTGF3Q29udGFpbmVyLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpZERyYWdMaXN0ZW5lciBleHRlbmRzIERyYWdMaXN0ZW5lciB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY29udGFpbmVyOiBJZGVhbEdhc0xhd0NvbnRhaW5lciwgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLCBwYXJlbnROb2RlOiBOb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgLy8gcG9pbnRlcidzIHggb2Zmc2V0IGZyb20gY29udGFpbmVyLmdldE9wZW5pbmdMZWZ0KCksIHdoZW4gYSBkcmFnIHN0YXJ0c1xyXG4gICAgbGV0IHN0YXJ0WE9mZnNldCA9IDA7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuXHJcbiAgICAgIHN0YXJ0OiAoIGV2ZW50LCBsaXN0ZW5lciApID0+IHtcclxuXHJcbiAgICAgICAgc3RhcnRYT2Zmc2V0ID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggY29udGFpbmVyLmdldE9wZW5pbmdMZWZ0KCkgKSAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Tm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkueDtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGRyYWc6ICggZXZlbnQsIGxpc3RlbmVyICkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3WCA9IHBhcmVudE5vZGUuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApLng7XHJcbiAgICAgICAgY29uc3QgbW9kZWxYID0gbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsWCggdmlld1ggKyBzdGFydFhPZmZzZXQgKTtcclxuICAgICAgICBpZiAoIG1vZGVsWCA+PSBjb250YWluZXIuZ2V0T3BlbmluZ1JpZ2h0KCkgKSB7XHJcblxyXG4gICAgICAgICAgLy8gdGhlIGxpZCBpcyBmdWxseSBjbG9zZWRcclxuICAgICAgICAgIGNvbnRhaW5lci5saWRXaWR0aFByb3BlcnR5LnZhbHVlID0gY29udGFpbmVyLmdldE1heExpZFdpZHRoKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIHRoZSBsaWQgaXMgb3BlblxyXG4gICAgICAgICAgY29uc3Qgb3BlbmluZ1dpZHRoID0gY29udGFpbmVyLmdldE9wZW5pbmdSaWdodCgpIC0gbW9kZWxYO1xyXG4gICAgICAgICAgY29udGFpbmVyLmxpZFdpZHRoUHJvcGVydHkudmFsdWUgPVxyXG4gICAgICAgICAgICBNYXRoLm1heCggY29udGFpbmVyLmdldE1heExpZFdpZHRoKCkgLSBvcGVuaW5nV2lkdGgsIGNvbnRhaW5lci5nZXRNaW5MaWRXaWR0aCgpICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gd2hlbiB0aGUgbGlkIGhhbmRsZSBpcyByZWxlYXNlZCwgbG9nIHRoZSBvcGVuaW5nXHJcbiAgICAgIGVuZDogKCkgPT4ge1xyXG4gICAgICAgIHBoZXQubG9nICYmIHBoZXQubG9nKCBjb250YWluZXIuaXNPcGVuUHJvcGVydHkudmFsdWUgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgTGlkIGlzIG9wZW46ICR7Y29udGFpbmVyLmdldE9wZW5pbmdMZWZ0KCl9IHRvICR7Y29udGFpbmVyLmdldE9wZW5pbmdSaWdodCgpfSBwbWAgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnTGlkIGlzIGNsb3NlZCcgKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuZ2FzUHJvcGVydGllcy5yZWdpc3RlciggJ0xpZERyYWdMaXN0ZW5lcicsIExpZERyYWdMaXN0ZW5lciApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLFNBQVNBLFlBQVksUUFBYyxtQ0FBbUM7QUFFdEUsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUdsRCxlQUFlLE1BQU1DLGVBQWUsU0FBU0YsWUFBWSxDQUFDO0VBRWpERyxXQUFXQSxDQUFFQyxTQUErQixFQUFFQyxrQkFBdUMsRUFBRUMsVUFBZ0IsRUFDMUZDLE1BQWMsRUFBRztJQUVuQztJQUNBLElBQUlDLFlBQVksR0FBRyxDQUFDO0lBRXBCLEtBQUssQ0FBRTtNQUVMQyxLQUFLLEVBQUVBLENBQUVDLEtBQUssRUFBRUMsUUFBUSxLQUFNO1FBRTVCSCxZQUFZLEdBQUdILGtCQUFrQixDQUFDTyxZQUFZLENBQUVSLFNBQVMsQ0FBQ1MsY0FBYyxDQUFDLENBQUUsQ0FBQyxHQUM3RFAsVUFBVSxDQUFDUSxtQkFBbUIsQ0FBRUosS0FBSyxDQUFDSyxPQUFPLENBQUNDLEtBQU0sQ0FBQyxDQUFDQyxDQUFDO01BQ3hFLENBQUM7TUFFREMsSUFBSSxFQUFFQSxDQUFFUixLQUFLLEVBQUVDLFFBQVEsS0FBTTtRQUUzQixNQUFNUSxLQUFLLEdBQUdiLFVBQVUsQ0FBQ1EsbUJBQW1CLENBQUVKLEtBQUssQ0FBQ0ssT0FBTyxDQUFDQyxLQUFNLENBQUMsQ0FBQ0MsQ0FBQztRQUNyRSxNQUFNRyxNQUFNLEdBQUdmLGtCQUFrQixDQUFDZ0IsWUFBWSxDQUFFRixLQUFLLEdBQUdYLFlBQWEsQ0FBQztRQUN0RSxJQUFLWSxNQUFNLElBQUloQixTQUFTLENBQUNrQixlQUFlLENBQUMsQ0FBQyxFQUFHO1VBRTNDO1VBQ0FsQixTQUFTLENBQUNtQixnQkFBZ0IsQ0FBQ0MsS0FBSyxHQUFHcEIsU0FBUyxDQUFDcUIsY0FBYyxDQUFDLENBQUM7UUFDL0QsQ0FBQyxNQUNJO1VBRUg7VUFDQSxNQUFNQyxZQUFZLEdBQUd0QixTQUFTLENBQUNrQixlQUFlLENBQUMsQ0FBQyxHQUFHRixNQUFNO1VBQ3pEaEIsU0FBUyxDQUFDbUIsZ0JBQWdCLENBQUNDLEtBQUssR0FDOUJHLElBQUksQ0FBQ0MsR0FBRyxDQUFFeEIsU0FBUyxDQUFDcUIsY0FBYyxDQUFDLENBQUMsR0FBR0MsWUFBWSxFQUFFdEIsU0FBUyxDQUFDeUIsY0FBYyxDQUFDLENBQUUsQ0FBQztRQUNyRjtNQUNGLENBQUM7TUFFRDtNQUNBQyxHQUFHLEVBQUVBLENBQUEsS0FBTTtRQUNUQyxJQUFJLENBQUNDLEdBQUcsSUFBSUQsSUFBSSxDQUFDQyxHQUFHLENBQUU1QixTQUFTLENBQUM2QixjQUFjLENBQUNULEtBQUssR0FDN0IsZ0JBQWVwQixTQUFTLENBQUNTLGNBQWMsQ0FBQyxDQUFFLE9BQU1ULFNBQVMsQ0FBQ2tCLGVBQWUsQ0FBQyxDQUFFLEtBQUksR0FDakYsZUFBZ0IsQ0FBQztNQUN6QyxDQUFDO01BRURmLE1BQU0sRUFBRUE7SUFDVixDQUFFLENBQUM7RUFDTDtFQUVnQjJCLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBakMsYUFBYSxDQUFDbUMsUUFBUSxDQUFFLGlCQUFpQixFQUFFbEMsZUFBZ0IsQ0FBQyJ9