// Copyright 2022, University of Colorado Boulder

/**
 * Function that returns its input. This was added as an alternative to _.identity because WebStorm did
 * not provide as good navigation for _.identity.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import phetCore from './phetCore.js';
export default function identity(t) {
  return t;
}
phetCore.register('identity', identity);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaGV0Q29yZSIsImlkZW50aXR5IiwidCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiaWRlbnRpdHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyBpdHMgaW5wdXQuIFRoaXMgd2FzIGFkZGVkIGFzIGFuIGFsdGVybmF0aXZlIHRvIF8uaWRlbnRpdHkgYmVjYXVzZSBXZWJTdG9ybSBkaWRcclxuICogbm90IHByb3ZpZGUgYXMgZ29vZCBuYXZpZ2F0aW9uIGZvciBfLmlkZW50aXR5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBwaGV0Q29yZSBmcm9tICcuL3BoZXRDb3JlLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGlkZW50aXR5PFQ+KCB0OiBUICk6IFQge1xyXG4gIHJldHVybiB0O1xyXG59XHJcblxyXG5waGV0Q29yZS5yZWdpc3RlciggJ2lkZW50aXR5JywgaWRlbnRpdHkgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sZUFBZTtBQUVwQyxlQUFlLFNBQVNDLFFBQVFBLENBQUtDLENBQUksRUFBTTtFQUM3QyxPQUFPQSxDQUFDO0FBQ1Y7QUFFQUYsUUFBUSxDQUFDRyxRQUFRLENBQUUsVUFBVSxFQUFFRixRQUFTLENBQUMifQ==