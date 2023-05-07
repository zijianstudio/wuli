// Copyright 2017-2022, University of Colorado Boulder

/**
 * Unit tests for phet-core. Please run once in phet brand and once in brand=phet-io to cover all functionality.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import qunitStart from '../../chipper/js/sim-tests/qunitStart.js';
import './arrayDifferenceTests.js';
import './arrayRemoveTests.js';
import './assertHasPropertiesTests.js';
import './assertMutuallyExclusiveOptionsTests.js';
import './cleanArrayTests.js';
import './detectPrefixEventTests.js';
import './detectPrefixTests.js';
import './dimensionForEachTests.js';
import './dimensionMapTests.js';
import './EnumerationDeprecatedTests.js';
import './EnumerationTests.js';
import './escapeHTMLTests.js';
import './interleaveTests.js';
import './isArrayTests.js';
import './mergeTests.js';
import './pairsTests.js';
import './partitionTests.js';
import './swapObjectKeysTests.js';

// Since our tests are loaded asynchronously, we must direct QUnit to begin the tests
qunitStart();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJxdW5pdFN0YXJ0Il0sInNvdXJjZXMiOlsicGhldC1jb3JlLXRlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFVuaXQgdGVzdHMgZm9yIHBoZXQtY29yZS4gUGxlYXNlIHJ1biBvbmNlIGluIHBoZXQgYnJhbmQgYW5kIG9uY2UgaW4gYnJhbmQ9cGhldC1pbyB0byBjb3ZlciBhbGwgZnVuY3Rpb25hbGl0eS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgcXVuaXRTdGFydCBmcm9tICcuLi8uLi9jaGlwcGVyL2pzL3NpbS10ZXN0cy9xdW5pdFN0YXJ0LmpzJztcclxuaW1wb3J0ICcuL2FycmF5RGlmZmVyZW5jZVRlc3RzLmpzJztcclxuaW1wb3J0ICcuL2FycmF5UmVtb3ZlVGVzdHMuanMnO1xyXG5pbXBvcnQgJy4vYXNzZXJ0SGFzUHJvcGVydGllc1Rlc3RzLmpzJztcclxuaW1wb3J0ICcuL2Fzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9uc1Rlc3RzLmpzJztcclxuaW1wb3J0ICcuL2NsZWFuQXJyYXlUZXN0cy5qcyc7XHJcbmltcG9ydCAnLi9kZXRlY3RQcmVmaXhFdmVudFRlc3RzLmpzJztcclxuaW1wb3J0ICcuL2RldGVjdFByZWZpeFRlc3RzLmpzJztcclxuaW1wb3J0ICcuL2RpbWVuc2lvbkZvckVhY2hUZXN0cy5qcyc7XHJcbmltcG9ydCAnLi9kaW1lbnNpb25NYXBUZXN0cy5qcyc7XHJcbmltcG9ydCAnLi9FbnVtZXJhdGlvbkRlcHJlY2F0ZWRUZXN0cy5qcyc7XHJcbmltcG9ydCAnLi9FbnVtZXJhdGlvblRlc3RzLmpzJztcclxuaW1wb3J0ICcuL2VzY2FwZUhUTUxUZXN0cy5qcyc7XHJcbmltcG9ydCAnLi9pbnRlcmxlYXZlVGVzdHMuanMnO1xyXG5pbXBvcnQgJy4vaXNBcnJheVRlc3RzLmpzJztcclxuaW1wb3J0ICcuL21lcmdlVGVzdHMuanMnO1xyXG5pbXBvcnQgJy4vcGFpcnNUZXN0cy5qcyc7XHJcbmltcG9ydCAnLi9wYXJ0aXRpb25UZXN0cy5qcyc7XHJcbmltcG9ydCAnLi9zd2FwT2JqZWN0S2V5c1Rlc3RzLmpzJztcclxuXHJcbi8vIFNpbmNlIG91ciB0ZXN0cyBhcmUgbG9hZGVkIGFzeW5jaHJvbm91c2x5LCB3ZSBtdXN0IGRpcmVjdCBRVW5pdCB0byBiZWdpbiB0aGUgdGVzdHNcclxucXVuaXRTdGFydCgpOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSwwQ0FBMEM7QUFDakUsT0FBTywyQkFBMkI7QUFDbEMsT0FBTyx1QkFBdUI7QUFDOUIsT0FBTywrQkFBK0I7QUFDdEMsT0FBTywwQ0FBMEM7QUFDakQsT0FBTyxzQkFBc0I7QUFDN0IsT0FBTyw2QkFBNkI7QUFDcEMsT0FBTyx3QkFBd0I7QUFDL0IsT0FBTyw0QkFBNEI7QUFDbkMsT0FBTyx3QkFBd0I7QUFDL0IsT0FBTyxpQ0FBaUM7QUFDeEMsT0FBTyx1QkFBdUI7QUFDOUIsT0FBTyxzQkFBc0I7QUFDN0IsT0FBTyxzQkFBc0I7QUFDN0IsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxxQkFBcUI7QUFDNUIsT0FBTywwQkFBMEI7O0FBRWpDO0FBQ0FBLFVBQVUsQ0FBQyxDQUFDIn0=