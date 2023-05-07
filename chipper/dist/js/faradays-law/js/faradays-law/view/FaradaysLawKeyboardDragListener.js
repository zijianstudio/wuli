// Copyright 2018-2022, University of Colorado Boulder

/**
 * Type to handle all standard keyboard input. The only exception is the grab-drag interaction.
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import { KeyboardDragListener } from '../../../../scenery/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';
class FaradaysLawKeyboardDragListener extends KeyboardDragListener {
  /**
   * @param {FaradaysLawModel} model
   * @param {MagnetRegionManager} regionManager
   * @param {FaradaysLawAlertManager} alertManager
   * @param {Object} [options]
   */
  constructor(model, regionManager, alertManager, options) {
    const drag = vectorDelta => {
      model.magnetArrowsVisibleProperty.set(false);

      // Attempt to move the magnet based on the drag action.  The model will prevent the magnet from going anywhere
      // that it shouldn't.
      const proposedPosition = model.magnet.positionProperty.get().plus(vectorDelta);
      model.moveMagnetToPosition(proposedPosition);
    };
    const end = () => {
      alertManager.movementEndAlert();
    };
    options = merge({
      drag: drag,
      end: end,
      dragBoundsProperty: new Property(model.bounds)
    }, options);
    super(options);
    this.regionManager = regionManager;
    this.alertManager = alertManager;
  }

  /**
   * @public
   */
  initializeAccessibleInputListener() {
    return {
      keyup: onKeyUp.bind(this),
      focus: onFocus.bind(this)
    };
  }
}
function onKeyUp(event) {
  const {
    magnetIsAnimating,
    magnetStoppedByKeyboard
  } = this.regionManager;
  if (!magnetIsAnimating && magnetStoppedByKeyboard) {
    this.alertManager.movementEndAlert();
    this.regionManager.resetKeyboardStop();
  }
}
function onFocus() {
  // set flag to override the next keyup alert
  this.alertManager.magnetFocusAlert();
  this.regionManager.resetKeyboardStop();
}
faradaysLaw.register('FaradaysLawKeyboardDragListener', FaradaysLawKeyboardDragListener);
export default FaradaysLawKeyboardDragListener;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIm1lcmdlIiwiS2V5Ym9hcmREcmFnTGlzdGVuZXIiLCJmYXJhZGF5c0xhdyIsIkZhcmFkYXlzTGF3S2V5Ym9hcmREcmFnTGlzdGVuZXIiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwicmVnaW9uTWFuYWdlciIsImFsZXJ0TWFuYWdlciIsIm9wdGlvbnMiLCJkcmFnIiwidmVjdG9yRGVsdGEiLCJtYWduZXRBcnJvd3NWaXNpYmxlUHJvcGVydHkiLCJzZXQiLCJwcm9wb3NlZFBvc2l0aW9uIiwibWFnbmV0IiwicG9zaXRpb25Qcm9wZXJ0eSIsImdldCIsInBsdXMiLCJtb3ZlTWFnbmV0VG9Qb3NpdGlvbiIsImVuZCIsIm1vdmVtZW50RW5kQWxlcnQiLCJkcmFnQm91bmRzUHJvcGVydHkiLCJib3VuZHMiLCJpbml0aWFsaXplQWNjZXNzaWJsZUlucHV0TGlzdGVuZXIiLCJrZXl1cCIsIm9uS2V5VXAiLCJiaW5kIiwiZm9jdXMiLCJvbkZvY3VzIiwiZXZlbnQiLCJtYWduZXRJc0FuaW1hdGluZyIsIm1hZ25ldFN0b3BwZWRCeUtleWJvYXJkIiwicmVzZXRLZXlib2FyZFN0b3AiLCJtYWduZXRGb2N1c0FsZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGYXJhZGF5c0xhd0tleWJvYXJkRHJhZ0xpc3RlbmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFR5cGUgdG8gaGFuZGxlIGFsbCBzdGFuZGFyZCBrZXlib2FyZCBpbnB1dC4gVGhlIG9ubHkgZXhjZXB0aW9uIGlzIHRoZSBncmFiLWRyYWcgaW50ZXJhY3Rpb24uXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgS2V5Ym9hcmREcmFnTGlzdGVuZXIgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZmFyYWRheXNMYXcgZnJvbSAnLi4vLi4vZmFyYWRheXNMYXcuanMnO1xyXG5cclxuY2xhc3MgRmFyYWRheXNMYXdLZXlib2FyZERyYWdMaXN0ZW5lciBleHRlbmRzIEtleWJvYXJkRHJhZ0xpc3RlbmVyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtGYXJhZGF5c0xhd01vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7TWFnbmV0UmVnaW9uTWFuYWdlcn0gcmVnaW9uTWFuYWdlclxyXG4gICAqIEBwYXJhbSB7RmFyYWRheXNMYXdBbGVydE1hbmFnZXJ9IGFsZXJ0TWFuYWdlclxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHJlZ2lvbk1hbmFnZXIsIGFsZXJ0TWFuYWdlciwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBkcmFnID0gdmVjdG9yRGVsdGEgPT4ge1xyXG4gICAgICBtb2RlbC5tYWduZXRBcnJvd3NWaXNpYmxlUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG5cclxuICAgICAgLy8gQXR0ZW1wdCB0byBtb3ZlIHRoZSBtYWduZXQgYmFzZWQgb24gdGhlIGRyYWcgYWN0aW9uLiAgVGhlIG1vZGVsIHdpbGwgcHJldmVudCB0aGUgbWFnbmV0IGZyb20gZ29pbmcgYW55d2hlcmVcclxuICAgICAgLy8gdGhhdCBpdCBzaG91bGRuJ3QuXHJcbiAgICAgIGNvbnN0IHByb3Bvc2VkUG9zaXRpb24gPSBtb2RlbC5tYWduZXQucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5wbHVzKCB2ZWN0b3JEZWx0YSApO1xyXG4gICAgICBtb2RlbC5tb3ZlTWFnbmV0VG9Qb3NpdGlvbiggcHJvcG9zZWRQb3NpdGlvbiApO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBlbmQgPSAoKSA9PiB7XHJcbiAgICAgIGFsZXJ0TWFuYWdlci5tb3ZlbWVudEVuZEFsZXJ0KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBkcmFnOiBkcmFnLFxyXG4gICAgICBlbmQ6IGVuZCxcclxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiBuZXcgUHJvcGVydHkoIG1vZGVsLmJvdW5kcyApXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnJlZ2lvbk1hbmFnZXIgPSByZWdpb25NYW5hZ2VyO1xyXG4gICAgdGhpcy5hbGVydE1hbmFnZXIgPSBhbGVydE1hbmFnZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZUFjY2Vzc2libGVJbnB1dExpc3RlbmVyKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAga2V5dXA6IG9uS2V5VXAuYmluZCggdGhpcyApLFxyXG4gICAgICBmb2N1czogb25Gb2N1cy5iaW5kKCB0aGlzIClcclxuICAgIH07XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBvbktleVVwKCBldmVudCApIHtcclxuICBjb25zdCB7IG1hZ25ldElzQW5pbWF0aW5nLCBtYWduZXRTdG9wcGVkQnlLZXlib2FyZCB9ID0gdGhpcy5yZWdpb25NYW5hZ2VyO1xyXG5cclxuICBpZiAoICFtYWduZXRJc0FuaW1hdGluZyAmJiBtYWduZXRTdG9wcGVkQnlLZXlib2FyZCApIHtcclxuICAgIHRoaXMuYWxlcnRNYW5hZ2VyLm1vdmVtZW50RW5kQWxlcnQoKTtcclxuICAgIHRoaXMucmVnaW9uTWFuYWdlci5yZXNldEtleWJvYXJkU3RvcCgpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gb25Gb2N1cygpIHtcclxuXHJcbiAgLy8gc2V0IGZsYWcgdG8gb3ZlcnJpZGUgdGhlIG5leHQga2V5dXAgYWxlcnRcclxuICB0aGlzLmFsZXJ0TWFuYWdlci5tYWduZXRGb2N1c0FsZXJ0KCk7XHJcbiAgdGhpcy5yZWdpb25NYW5hZ2VyLnJlc2V0S2V5Ym9hcmRTdG9wKCk7XHJcbn1cclxuXHJcbmZhcmFkYXlzTGF3LnJlZ2lzdGVyKCAnRmFyYWRheXNMYXdLZXlib2FyZERyYWdMaXN0ZW5lcicsIEZhcmFkYXlzTGF3S2V5Ym9hcmREcmFnTGlzdGVuZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgRmFyYWRheXNMYXdLZXlib2FyZERyYWdMaXN0ZW5lcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsU0FBU0Msb0JBQW9CLFFBQVEsbUNBQW1DO0FBQ3hFLE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFFOUMsTUFBTUMsK0JBQStCLFNBQVNGLG9CQUFvQixDQUFDO0VBRWpFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxLQUFLLEVBQUVDLGFBQWEsRUFBRUMsWUFBWSxFQUFFQyxPQUFPLEVBQUc7SUFFekQsTUFBTUMsSUFBSSxHQUFHQyxXQUFXLElBQUk7TUFDMUJMLEtBQUssQ0FBQ00sMkJBQTJCLENBQUNDLEdBQUcsQ0FBRSxLQUFNLENBQUM7O01BRTlDO01BQ0E7TUFDQSxNQUFNQyxnQkFBZ0IsR0FBR1IsS0FBSyxDQUFDUyxNQUFNLENBQUNDLGdCQUFnQixDQUFDQyxHQUFHLENBQUMsQ0FBQyxDQUFDQyxJQUFJLENBQUVQLFdBQVksQ0FBQztNQUNoRkwsS0FBSyxDQUFDYSxvQkFBb0IsQ0FBRUwsZ0JBQWlCLENBQUM7SUFDaEQsQ0FBQztJQUVELE1BQU1NLEdBQUcsR0FBR0EsQ0FBQSxLQUFNO01BQ2hCWixZQUFZLENBQUNhLGdCQUFnQixDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVEWixPQUFPLEdBQUdSLEtBQUssQ0FBRTtNQUNmUyxJQUFJLEVBQUVBLElBQUk7TUFDVlUsR0FBRyxFQUFFQSxHQUFHO01BQ1JFLGtCQUFrQixFQUFFLElBQUl0QixRQUFRLENBQUVNLEtBQUssQ0FBQ2lCLE1BQU87SUFDakQsQ0FBQyxFQUFFZCxPQUFRLENBQUM7SUFFWixLQUFLLENBQUVBLE9BQVEsQ0FBQztJQUVoQixJQUFJLENBQUNGLGFBQWEsR0FBR0EsYUFBYTtJQUNsQyxJQUFJLENBQUNDLFlBQVksR0FBR0EsWUFBWTtFQUNsQzs7RUFFQTtBQUNGO0FBQ0E7RUFDRWdCLGlDQUFpQ0EsQ0FBQSxFQUFHO0lBQ2xDLE9BQU87TUFDTEMsS0FBSyxFQUFFQyxPQUFPLENBQUNDLElBQUksQ0FBRSxJQUFLLENBQUM7TUFDM0JDLEtBQUssRUFBRUMsT0FBTyxDQUFDRixJQUFJLENBQUUsSUFBSztJQUM1QixDQUFDO0VBQ0g7QUFDRjtBQUVBLFNBQVNELE9BQU9BLENBQUVJLEtBQUssRUFBRztFQUN4QixNQUFNO0lBQUVDLGlCQUFpQjtJQUFFQztFQUF3QixDQUFDLEdBQUcsSUFBSSxDQUFDekIsYUFBYTtFQUV6RSxJQUFLLENBQUN3QixpQkFBaUIsSUFBSUMsdUJBQXVCLEVBQUc7SUFDbkQsSUFBSSxDQUFDeEIsWUFBWSxDQUFDYSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3BDLElBQUksQ0FBQ2QsYUFBYSxDQUFDMEIsaUJBQWlCLENBQUMsQ0FBQztFQUN4QztBQUNGO0FBRUEsU0FBU0osT0FBT0EsQ0FBQSxFQUFHO0VBRWpCO0VBQ0EsSUFBSSxDQUFDckIsWUFBWSxDQUFDMEIsZ0JBQWdCLENBQUMsQ0FBQztFQUNwQyxJQUFJLENBQUMzQixhQUFhLENBQUMwQixpQkFBaUIsQ0FBQyxDQUFDO0FBQ3hDO0FBRUE5QixXQUFXLENBQUNnQyxRQUFRLENBQUUsaUNBQWlDLEVBQUUvQiwrQkFBZ0MsQ0FBQztBQUMxRixlQUFlQSwrQkFBK0IifQ==