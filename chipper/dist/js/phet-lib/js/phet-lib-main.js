// Copyright 2022-2023, University of Colorado Boulder

// NOTE: Not including mobius, since it requires THREE.js

import '../../axon/js/main.js';
import '../../bamboo/js/main.js';
import '../../dot/js/main.js';
import '../../griddle/js/main.js';
import '../../joist/js/main.js';
import '../../kite/js/main.js';
import '../../mobius/js/main.js';
import '../../nitroglycerin/js/main.js';
import '../../phet-core/js/main.js';
import '../../phetcommon/js/main.js';
import '../../scenery-phet/js/main.js';
import '../../scenery/js/imports.js';
import '../../sun/js/main.js';
import '../../tambo/js/main.js';
import '../../tandem/js/main.js';
import '../../tappi/js/main.js';
import '../../twixt/js/main.js';
import '../../utterance-queue/js/main.js';
import '../../vegas/js/main.js';
if (!window.hasOwnProperty('_')) {
  throw new Error('Underscore/Lodash not found: _');
}
if (!window.hasOwnProperty('$')) {
  throw new Error('jQuery not found: $');
}
phet.scenery.Utils.polyfillRequestAnimationFrame();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ3aW5kb3ciLCJoYXNPd25Qcm9wZXJ0eSIsIkVycm9yIiwicGhldCIsInNjZW5lcnkiLCJVdGlscyIsInBvbHlmaWxsUmVxdWVzdEFuaW1hdGlvbkZyYW1lIl0sInNvdXJjZXMiOlsicGhldC1saWItbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8vIE5PVEU6IE5vdCBpbmNsdWRpbmcgbW9iaXVzLCBzaW5jZSBpdCByZXF1aXJlcyBUSFJFRS5qc1xyXG5cclxuaW1wb3J0ICcuLi8uLi9heG9uL2pzL21haW4uanMnO1xyXG5pbXBvcnQgJy4uLy4uL2JhbWJvby9qcy9tYWluLmpzJztcclxuaW1wb3J0ICcuLi8uLi9kb3QvanMvbWFpbi5qcyc7XHJcbmltcG9ydCAnLi4vLi4vZ3JpZGRsZS9qcy9tYWluLmpzJztcclxuaW1wb3J0ICcuLi8uLi9qb2lzdC9qcy9tYWluLmpzJztcclxuaW1wb3J0ICcuLi8uLi9raXRlL2pzL21haW4uanMnO1xyXG5pbXBvcnQgJy4uLy4uL21vYml1cy9qcy9tYWluLmpzJztcclxuaW1wb3J0ICcuLi8uLi9uaXRyb2dseWNlcmluL2pzL21haW4uanMnO1xyXG5pbXBvcnQgJy4uLy4uL3BoZXQtY29yZS9qcy9tYWluLmpzJztcclxuaW1wb3J0ICcuLi8uLi9waGV0Y29tbW9uL2pzL21haW4uanMnO1xyXG5pbXBvcnQgJy4uLy4uL3NjZW5lcnktcGhldC9qcy9tYWluLmpzJztcclxuaW1wb3J0ICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgJy4uLy4uL3N1bi9qcy9tYWluLmpzJztcclxuaW1wb3J0ICcuLi8uLi90YW1iby9qcy9tYWluLmpzJztcclxuaW1wb3J0ICcuLi8uLi90YW5kZW0vanMvbWFpbi5qcyc7XHJcbmltcG9ydCAnLi4vLi4vdGFwcGkvanMvbWFpbi5qcyc7XHJcbmltcG9ydCAnLi4vLi4vdHdpeHQvanMvbWFpbi5qcyc7XHJcbmltcG9ydCAnLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL21haW4uanMnO1xyXG5pbXBvcnQgJy4uLy4uL3ZlZ2FzL2pzL21haW4uanMnO1xyXG5cclxuaWYgKCAhd2luZG93Lmhhc093blByb3BlcnR5KCAnXycgKSApIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoICdVbmRlcnNjb3JlL0xvZGFzaCBub3QgZm91bmQ6IF8nICk7XHJcbn1cclxuaWYgKCAhd2luZG93Lmhhc093blByb3BlcnR5KCAnJCcgKSApIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoICdqUXVlcnkgbm90IGZvdW5kOiAkJyApO1xyXG59XHJcblxyXG5waGV0LnNjZW5lcnkuVXRpbHMucG9seWZpbGxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTs7QUFFQSxPQUFPLHVCQUF1QjtBQUM5QixPQUFPLHlCQUF5QjtBQUNoQyxPQUFPLHNCQUFzQjtBQUM3QixPQUFPLDBCQUEwQjtBQUNqQyxPQUFPLHdCQUF3QjtBQUMvQixPQUFPLHVCQUF1QjtBQUM5QixPQUFPLHlCQUF5QjtBQUNoQyxPQUFPLGdDQUFnQztBQUN2QyxPQUFPLDRCQUE0QjtBQUNuQyxPQUFPLDZCQUE2QjtBQUNwQyxPQUFPLCtCQUErQjtBQUN0QyxPQUFPLDZCQUE2QjtBQUNwQyxPQUFPLHNCQUFzQjtBQUM3QixPQUFPLHdCQUF3QjtBQUMvQixPQUFPLHlCQUF5QjtBQUNoQyxPQUFPLHdCQUF3QjtBQUMvQixPQUFPLHdCQUF3QjtBQUMvQixPQUFPLGtDQUFrQztBQUN6QyxPQUFPLHdCQUF3QjtBQUUvQixJQUFLLENBQUNBLE1BQU0sQ0FBQ0MsY0FBYyxDQUFFLEdBQUksQ0FBQyxFQUFHO0VBQ25DLE1BQU0sSUFBSUMsS0FBSyxDQUFFLGdDQUFpQyxDQUFDO0FBQ3JEO0FBQ0EsSUFBSyxDQUFDRixNQUFNLENBQUNDLGNBQWMsQ0FBRSxHQUFJLENBQUMsRUFBRztFQUNuQyxNQUFNLElBQUlDLEtBQUssQ0FBRSxxQkFBc0IsQ0FBQztBQUMxQztBQUVBQyxJQUFJLENBQUNDLE9BQU8sQ0FBQ0MsS0FBSyxDQUFDQyw2QkFBNkIsQ0FBQyxDQUFDIn0=