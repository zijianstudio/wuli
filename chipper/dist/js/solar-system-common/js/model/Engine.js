// Copyright 2023, University of Colorado Boulder

/**
 * Everything that controls the gravitational interactions between bodies.
 * 
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import solarSystemCommon from '../solarSystemCommon.js';
export default class Engine {
  // Array of gravitational interacting bodies

  constructor(bodies) {
    this.bodies = bodies;
  }
  checkCollisions() {
    // no-op
  }
}
solarSystemCommon.register('Engine', Engine);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzb2xhclN5c3RlbUNvbW1vbiIsIkVuZ2luZSIsImNvbnN0cnVjdG9yIiwiYm9kaWVzIiwiY2hlY2tDb2xsaXNpb25zIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFbmdpbmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEV2ZXJ5dGhpbmcgdGhhdCBjb250cm9scyB0aGUgZ3Jhdml0YXRpb25hbCBpbnRlcmFjdGlvbnMgYmV0d2VlbiBib2RpZXMuXHJcbiAqIFxyXG4gKiBAYXV0aG9yIEFndXN0w61uIFZhbGxlam8gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgT2JzZXJ2YWJsZUFycmF5IH0gZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgQm9keSBmcm9tICcuL0JvZHkuanMnO1xyXG5pbXBvcnQgc29sYXJTeXN0ZW1Db21tb24gZnJvbSAnLi4vc29sYXJTeXN0ZW1Db21tb24uanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgRW5naW5lIHtcclxuICAvLyBBcnJheSBvZiBncmF2aXRhdGlvbmFsIGludGVyYWN0aW5nIGJvZGllc1xyXG4gIHByb3RlY3RlZCBib2RpZXM6IE9ic2VydmFibGVBcnJheTxCb2R5PjtcclxuXHJcbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCBib2RpZXM6IE9ic2VydmFibGVBcnJheTxCb2R5PiApIHtcclxuICAgIHRoaXMuYm9kaWVzID0gYm9kaWVzO1xyXG4gIH1cclxuICBwdWJsaWMgY2hlY2tDb2xsaXNpb25zKCk6IHZvaWQge1xyXG4gICAgLy8gbm8tb3BcclxuICB9XHJcbiAgcHVibGljIGFic3RyYWN0IHJ1biggZHQ6IG51bWJlciwgdXBkYXRlUHJvcGVydGllczogYm9vbGVhbiApOiB2b2lkO1xyXG4gIHB1YmxpYyBhYnN0cmFjdCB1cGRhdGUoIGJvZGllczogT2JzZXJ2YWJsZUFycmF5PEJvZHk+ICk6IHZvaWQ7XHJcbiAgcHVibGljIGFic3RyYWN0IHJlc2V0KCk6IHZvaWQ7XHJcbn1cclxuXHJcbnNvbGFyU3lzdGVtQ29tbW9uLnJlZ2lzdGVyKCAnRW5naW5lJywgRW5naW5lICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUlBLE9BQU9BLGlCQUFpQixNQUFNLHlCQUF5QjtBQUV2RCxlQUFlLE1BQWVDLE1BQU0sQ0FBQztFQUNuQzs7RUFHVUMsV0FBV0EsQ0FBRUMsTUFBNkIsRUFBRztJQUNyRCxJQUFJLENBQUNBLE1BQU0sR0FBR0EsTUFBTTtFQUN0QjtFQUNPQyxlQUFlQSxDQUFBLEVBQVM7SUFDN0I7RUFBQTtBQUtKO0FBRUFKLGlCQUFpQixDQUFDSyxRQUFRLENBQUUsUUFBUSxFQUFFSixNQUFPLENBQUMifQ==