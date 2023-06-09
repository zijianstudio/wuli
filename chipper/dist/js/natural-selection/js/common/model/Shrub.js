// Copyright 2020-2022, University of Colorado Boulder

/**
 * Shrub is the model of a shrub, the food for bunnies.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import naturalSelection from '../../naturalSelection.js';
import Organism from './Organism.js';
export default class Shrub extends Organism {
  constructor(modelViewTransform, options) {
    super(modelViewTransform, options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
naturalSelection.register('Shrub', Shrub);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJuYXR1cmFsU2VsZWN0aW9uIiwiT3JnYW5pc20iLCJTaHJ1YiIsImNvbnN0cnVjdG9yIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwib3B0aW9ucyIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNocnViLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNocnViIGlzIHRoZSBtb2RlbCBvZiBhIHNocnViLCB0aGUgZm9vZCBmb3IgYnVubmllcy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBuYXR1cmFsU2VsZWN0aW9uIGZyb20gJy4uLy4uL25hdHVyYWxTZWxlY3Rpb24uanMnO1xyXG5pbXBvcnQgRW52aXJvbm1lbnRNb2RlbFZpZXdUcmFuc2Zvcm0gZnJvbSAnLi9FbnZpcm9ubWVudE1vZGVsVmlld1RyYW5zZm9ybS5qcyc7XHJcbmltcG9ydCBPcmdhbmlzbSwgeyBPcmdhbmlzbU9wdGlvbnMgfSBmcm9tICcuL09yZ2FuaXNtLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBTaHJ1Yk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE9yZ2FuaXNtT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNocnViIGV4dGVuZHMgT3JnYW5pc20ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsVmlld1RyYW5zZm9ybTogRW52aXJvbm1lbnRNb2RlbFZpZXdUcmFuc2Zvcm0sIG9wdGlvbnM/OiBTaHJ1Yk9wdGlvbnMgKSB7XHJcbiAgICBzdXBlciggbW9kZWxWaWV3VHJhbnNmb3JtLCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxubmF0dXJhbFNlbGVjdGlvbi5yZWdpc3RlciggJ1NocnViJywgU2hydWIgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBRXhELE9BQU9DLFFBQVEsTUFBMkIsZUFBZTtBQU16RCxlQUFlLE1BQU1DLEtBQUssU0FBU0QsUUFBUSxDQUFDO0VBRW5DRSxXQUFXQSxDQUFFQyxrQkFBaUQsRUFBRUMsT0FBc0IsRUFBRztJQUM5RixLQUFLLENBQUVELGtCQUFrQixFQUFFQyxPQUFRLENBQUM7RUFDdEM7RUFFZ0JDLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBTixnQkFBZ0IsQ0FBQ1EsUUFBUSxDQUFFLE9BQU8sRUFBRU4sS0FBTSxDQUFDIn0=