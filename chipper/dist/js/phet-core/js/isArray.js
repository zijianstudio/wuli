// Copyright 2013-2022, University of Colorado Boulder

/**
 * Tests whether a reference is to an array.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import phetCore from './phetCore.js';
function isArray(array) {
  // yes, this is actually how to do this. see http://stackoverflow.com/questions/4775722/javascript-check-if-object-is-array
  return Object.prototype.toString.call(array) === '[object Array]';
}
phetCore.register('isArray', isArray);
export default isArray;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaGV0Q29yZSIsImlzQXJyYXkiLCJhcnJheSIsIk9iamVjdCIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwiY2FsbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiaXNBcnJheS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUZXN0cyB3aGV0aGVyIGEgcmVmZXJlbmNlIGlzIHRvIGFuIGFycmF5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IHBoZXRDb3JlIGZyb20gJy4vcGhldENvcmUuanMnO1xyXG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XHJcblxyXG5mdW5jdGlvbiBpc0FycmF5KCBhcnJheTogSW50ZW50aW9uYWxBbnkgKTogYXJyYXkgaXMgSW50ZW50aW9uYWxBbnlbXSB7XHJcbiAgLy8geWVzLCB0aGlzIGlzIGFjdHVhbGx5IGhvdyB0byBkbyB0aGlzLiBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy80Nzc1NzIyL2phdmFzY3JpcHQtY2hlY2staWYtb2JqZWN0LWlzLWFycmF5XHJcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCggYXJyYXkgKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcclxufVxyXG5cclxucGhldENvcmUucmVnaXN0ZXIoICdpc0FycmF5JywgaXNBcnJheSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaXNBcnJheTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGVBQWU7QUFHcEMsU0FBU0MsT0FBT0EsQ0FBRUMsS0FBcUIsRUFBOEI7RUFDbkU7RUFDQSxPQUFPQyxNQUFNLENBQUNDLFNBQVMsQ0FBQ0MsUUFBUSxDQUFDQyxJQUFJLENBQUVKLEtBQU0sQ0FBQyxLQUFLLGdCQUFnQjtBQUNyRTtBQUVBRixRQUFRLENBQUNPLFFBQVEsQ0FBRSxTQUFTLEVBQUVOLE9BQVEsQ0FBQztBQUV2QyxlQUFlQSxPQUFPIn0=