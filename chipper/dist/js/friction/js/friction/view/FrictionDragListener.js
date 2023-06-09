// Copyright 2018-2022, University of Colorado Boulder

/**
 * Listener for the book and magnifier areas.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { DragListener } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import friction from '../../friction.js';
const DRAG_CAPTURE_GRANULARITY = 3000; // in ms

class FrictionDragListener extends DragListener {
  /**
   * @param {FrictionModel} model
   * @param {TemperatureIncreasingAlerter} temperatureIncreasingAlerter
   * @param {TemperatureDecreasingAlerter} temperatureDecreasingAlerter
   * @param {BookMovementAlerter} bookMovementAlerter
   * @param options
   */
  constructor(model, temperatureIncreasingAlerter, temperatureDecreasingAlerter, bookMovementAlerter, options) {
    options = merge({
      // {SoundClip} - sounds to be played at start and end of drag
      startSound: null,
      endSound: null,
      targetNode: null,
      startDrag: _.noop,
      tandem: Tandem.REQUIRED
    }, options);
    let lastCaptureDragStartTime = 0;
    super({
      positionProperty: model.topBookPositionProperty,
      dragBoundsProperty: model.topBookDragBoundsProperty,
      targetNode: options.targetNode,
      // This allows the bounds and transform to be in the correct coordinate frame even though we provide a targetNode
      useParentOffset: true,
      start: () => {
        lastCaptureDragStartTime = phet.joist.elapsedTime;

        // sound
        options.startSound && options.startSound.play();

        // pdom
        temperatureIncreasingAlerter.startDrag();
        temperatureDecreasingAlerter.startDrag();
        options.startDrag();
      },
      drag: (event, dragListener) => {
        // instead of calling only on end drag (like for the keyboard drag listeners), increase the granularity of
        // data capture and potential alerting by triggering this every X ms of dragging.
        if (phet.joist.elapsedTime - lastCaptureDragStartTime > DRAG_CAPTURE_GRANULARITY) {
          // pdom
          temperatureIncreasingAlerter.onDrag();
          bookMovementAlerter.endDrag();
        }
      },
      end: () => {
        // sound
        options.endSound && options.endSound.play();

        // pdom - always again on end drag
        temperatureIncreasingAlerter.endDrag();
        temperatureDecreasingAlerter.endDrag();
        bookMovementAlerter.endDrag();
      },
      tandem: options.tandem
    });
  }
}
friction.register('FrictionDragListener', FrictionDragListener);
export default FrictionDragListener;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkRyYWdMaXN0ZW5lciIsIlRhbmRlbSIsImZyaWN0aW9uIiwiRFJBR19DQVBUVVJFX0dSQU5VTEFSSVRZIiwiRnJpY3Rpb25EcmFnTGlzdGVuZXIiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwidGVtcGVyYXR1cmVJbmNyZWFzaW5nQWxlcnRlciIsInRlbXBlcmF0dXJlRGVjcmVhc2luZ0FsZXJ0ZXIiLCJib29rTW92ZW1lbnRBbGVydGVyIiwib3B0aW9ucyIsInN0YXJ0U291bmQiLCJlbmRTb3VuZCIsInRhcmdldE5vZGUiLCJzdGFydERyYWciLCJfIiwibm9vcCIsInRhbmRlbSIsIlJFUVVJUkVEIiwibGFzdENhcHR1cmVEcmFnU3RhcnRUaW1lIiwicG9zaXRpb25Qcm9wZXJ0eSIsInRvcEJvb2tQb3NpdGlvblByb3BlcnR5IiwiZHJhZ0JvdW5kc1Byb3BlcnR5IiwidG9wQm9va0RyYWdCb3VuZHNQcm9wZXJ0eSIsInVzZVBhcmVudE9mZnNldCIsInN0YXJ0IiwicGhldCIsImpvaXN0IiwiZWxhcHNlZFRpbWUiLCJwbGF5IiwiZHJhZyIsImV2ZW50IiwiZHJhZ0xpc3RlbmVyIiwib25EcmFnIiwiZW5kRHJhZyIsImVuZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRnJpY3Rpb25EcmFnTGlzdGVuZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTGlzdGVuZXIgZm9yIHRoZSBib29rIGFuZCBtYWduaWZpZXIgYXJlYXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IERyYWdMaXN0ZW5lciB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBmcmljdGlvbiBmcm9tICcuLi8uLi9mcmljdGlvbi5qcyc7XHJcblxyXG5jb25zdCBEUkFHX0NBUFRVUkVfR1JBTlVMQVJJVFkgPSAzMDAwOyAvLyBpbiBtc1xyXG5cclxuY2xhc3MgRnJpY3Rpb25EcmFnTGlzdGVuZXIgZXh0ZW5kcyBEcmFnTGlzdGVuZXIge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RnJpY3Rpb25Nb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge1RlbXBlcmF0dXJlSW5jcmVhc2luZ0FsZXJ0ZXJ9IHRlbXBlcmF0dXJlSW5jcmVhc2luZ0FsZXJ0ZXJcclxuICAgKiBAcGFyYW0ge1RlbXBlcmF0dXJlRGVjcmVhc2luZ0FsZXJ0ZXJ9IHRlbXBlcmF0dXJlRGVjcmVhc2luZ0FsZXJ0ZXJcclxuICAgKiBAcGFyYW0ge0Jvb2tNb3ZlbWVudEFsZXJ0ZXJ9IGJvb2tNb3ZlbWVudEFsZXJ0ZXJcclxuICAgKiBAcGFyYW0gb3B0aW9uc1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgdGVtcGVyYXR1cmVJbmNyZWFzaW5nQWxlcnRlciwgdGVtcGVyYXR1cmVEZWNyZWFzaW5nQWxlcnRlciwgYm9va01vdmVtZW50QWxlcnRlciwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIHtTb3VuZENsaXB9IC0gc291bmRzIHRvIGJlIHBsYXllZCBhdCBzdGFydCBhbmQgZW5kIG9mIGRyYWdcclxuICAgICAgc3RhcnRTb3VuZDogbnVsbCxcclxuICAgICAgZW5kU291bmQ6IG51bGwsXHJcbiAgICAgIHRhcmdldE5vZGU6IG51bGwsXHJcblxyXG4gICAgICBzdGFydERyYWc6IF8ubm9vcCxcclxuXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgbGV0IGxhc3RDYXB0dXJlRHJhZ1N0YXJ0VGltZSA9IDA7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogbW9kZWwudG9wQm9va1Bvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIGRyYWdCb3VuZHNQcm9wZXJ0eTogbW9kZWwudG9wQm9va0RyYWdCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgdGFyZ2V0Tm9kZTogb3B0aW9ucy50YXJnZXROb2RlLFxyXG5cclxuICAgICAgLy8gVGhpcyBhbGxvd3MgdGhlIGJvdW5kcyBhbmQgdHJhbnNmb3JtIHRvIGJlIGluIHRoZSBjb3JyZWN0IGNvb3JkaW5hdGUgZnJhbWUgZXZlbiB0aG91Z2ggd2UgcHJvdmlkZSBhIHRhcmdldE5vZGVcclxuICAgICAgdXNlUGFyZW50T2Zmc2V0OiB0cnVlLFxyXG5cclxuICAgICAgc3RhcnQ6ICgpID0+IHtcclxuXHJcbiAgICAgICAgbGFzdENhcHR1cmVEcmFnU3RhcnRUaW1lID0gcGhldC5qb2lzdC5lbGFwc2VkVGltZTtcclxuXHJcbiAgICAgICAgLy8gc291bmRcclxuICAgICAgICBvcHRpb25zLnN0YXJ0U291bmQgJiYgb3B0aW9ucy5zdGFydFNvdW5kLnBsYXkoKTtcclxuXHJcbiAgICAgICAgLy8gcGRvbVxyXG4gICAgICAgIHRlbXBlcmF0dXJlSW5jcmVhc2luZ0FsZXJ0ZXIuc3RhcnREcmFnKCk7XHJcbiAgICAgICAgdGVtcGVyYXR1cmVEZWNyZWFzaW5nQWxlcnRlci5zdGFydERyYWcoKTtcclxuXHJcbiAgICAgICAgb3B0aW9ucy5zdGFydERyYWcoKTtcclxuICAgICAgfSxcclxuICAgICAgZHJhZzogKCBldmVudCwgZHJhZ0xpc3RlbmVyICkgPT4ge1xyXG5cclxuICAgICAgICAvLyBpbnN0ZWFkIG9mIGNhbGxpbmcgb25seSBvbiBlbmQgZHJhZyAobGlrZSBmb3IgdGhlIGtleWJvYXJkIGRyYWcgbGlzdGVuZXJzKSwgaW5jcmVhc2UgdGhlIGdyYW51bGFyaXR5IG9mXHJcbiAgICAgICAgLy8gZGF0YSBjYXB0dXJlIGFuZCBwb3RlbnRpYWwgYWxlcnRpbmcgYnkgdHJpZ2dlcmluZyB0aGlzIGV2ZXJ5IFggbXMgb2YgZHJhZ2dpbmcuXHJcbiAgICAgICAgaWYgKCBwaGV0LmpvaXN0LmVsYXBzZWRUaW1lIC0gbGFzdENhcHR1cmVEcmFnU3RhcnRUaW1lID4gRFJBR19DQVBUVVJFX0dSQU5VTEFSSVRZICkge1xyXG5cclxuICAgICAgICAgIC8vIHBkb21cclxuICAgICAgICAgIHRlbXBlcmF0dXJlSW5jcmVhc2luZ0FsZXJ0ZXIub25EcmFnKCk7XHJcbiAgICAgICAgICBib29rTW92ZW1lbnRBbGVydGVyLmVuZERyYWcoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGVuZDogKCkgPT4ge1xyXG5cclxuICAgICAgICAvLyBzb3VuZFxyXG4gICAgICAgIG9wdGlvbnMuZW5kU291bmQgJiYgb3B0aW9ucy5lbmRTb3VuZC5wbGF5KCk7XHJcblxyXG4gICAgICAgIC8vIHBkb20gLSBhbHdheXMgYWdhaW4gb24gZW5kIGRyYWdcclxuICAgICAgICB0ZW1wZXJhdHVyZUluY3JlYXNpbmdBbGVydGVyLmVuZERyYWcoKTtcclxuICAgICAgICB0ZW1wZXJhdHVyZURlY3JlYXNpbmdBbGVydGVyLmVuZERyYWcoKTtcclxuICAgICAgICBib29rTW92ZW1lbnRBbGVydGVyLmVuZERyYWcoKTtcclxuICAgICAgfSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZnJpY3Rpb24ucmVnaXN0ZXIoICdGcmljdGlvbkRyYWdMaXN0ZW5lcicsIEZyaWN0aW9uRHJhZ0xpc3RlbmVyICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBGcmljdGlvbkRyYWdMaXN0ZW5lcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FB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