// Copyright 2014-2023, University of Colorado Boulder

/**
 * TODO Describe this class and its responsibilities.
 *
 * @author {{AUTHOR}}
 */

import simulaRasa from '../../simulaRasa.js';
export default class SimulaRasaModel {
  constructor(providedOptions) {
    //TODO
  }

  /**
   * Resets the model.
   */
  reset() {
    //TODO
  }

  /**
   * Steps the model.
   * @param dt - time step, in seconds
   */
  step(dt) {
    //TODO
  }
}
simulaRasa.register('SimulaRasaModel', SimulaRasaModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzaW11bGFSYXNhIiwiU2ltdWxhUmFzYU1vZGVsIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJyZXNldCIsInN0ZXAiLCJkdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2ltdWxhUmFzYU1vZGVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRPRE8gRGVzY3JpYmUgdGhpcyBjbGFzcyBhbmQgaXRzIHJlc3BvbnNpYmlsaXRpZXMuXHJcbiAqXHJcbiAqIEBhdXRob3Ige3tBVVRIT1J9fVxyXG4gKi9cclxuXHJcbmltcG9ydCBzaW11bGFSYXNhIGZyb20gJy4uLy4uL3NpbXVsYVJhc2EuanMnO1xyXG5pbXBvcnQgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBUTW9kZWwgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvVE1vZGVsLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgLy9UT0RPIGFkZCBvcHRpb25zIHRoYXQgYXJlIHNwZWNpZmljIHRvIFNpbXVsYVJhc2FNb2RlbCBoZXJlXHJcbn07XHJcblxyXG50eXBlIFNpbXVsYVJhc2FNb2RlbE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxQaGV0aW9PYmplY3RPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaW11bGFSYXNhTW9kZWwgaW1wbGVtZW50cyBUTW9kZWwge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogU2ltdWxhUmFzYU1vZGVsT3B0aW9ucyApIHtcclxuICAgIC8vVE9ET1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSBtb2RlbC5cclxuICAgKi9cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICAvL1RPRE9cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIHRoZSBtb2RlbC5cclxuICAgKiBAcGFyYW0gZHQgLSB0aW1lIHN0ZXAsIGluIHNlY29uZHNcclxuICAgKi9cclxuICBwdWJsaWMgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIC8vVE9ET1xyXG4gIH1cclxufVxyXG5cclxuc2ltdWxhUmFzYS5yZWdpc3RlciggJ1NpbXVsYVJhc2FNb2RlbCcsIFNpbXVsYVJhc2FNb2RlbCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0scUJBQXFCO0FBVzVDLGVBQWUsTUFBTUMsZUFBZSxDQUFtQjtFQUU5Q0MsV0FBV0EsQ0FBRUMsZUFBdUMsRUFBRztJQUM1RDtFQUFBOztFQUdGO0FBQ0Y7QUFDQTtFQUNTQyxLQUFLQSxDQUFBLEVBQVM7SUFDbkI7RUFBQTs7RUFHRjtBQUNGO0FBQ0E7QUFDQTtFQUNTQyxJQUFJQSxDQUFFQyxFQUFVLEVBQVM7SUFDOUI7RUFBQTtBQUVKO0FBRUFOLFVBQVUsQ0FBQ08sUUFBUSxDQUFFLGlCQUFpQixFQUFFTixlQUFnQixDQUFDIn0=