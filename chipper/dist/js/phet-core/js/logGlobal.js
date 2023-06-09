// Copyright 2021, University of Colorado Boulder

/**
 * Logs a global variable by converting it to JSON, then writing to phet.log. If the global is undefined,
 * the log will show 'undefined'.  This is currently used to log a collection of query parameters (which exist
 * as globals), but could be applied to other globals.  If phet.log is undefined, this is a no-op.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import getGlobal from './getGlobal.js';
import phetCore from './phetCore.js';

/**
 * @param {string} globalString - the name of the global
 */
function logGlobal(globalString) {
  assert && assert(typeof globalString === 'string', `invalid globalString: ${globalString}`);
  phet.log && phet.log(`${globalString}: ${JSON.stringify(getGlobal(globalString), null, 2)}`);
}
phetCore.register('logGlobal', logGlobal);
export default logGlobal;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRHbG9iYWwiLCJwaGV0Q29yZSIsImxvZ0dsb2JhbCIsImdsb2JhbFN0cmluZyIsImFzc2VydCIsInBoZXQiLCJsb2ciLCJKU09OIiwic3RyaW5naWZ5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJsb2dHbG9iYWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIExvZ3MgYSBnbG9iYWwgdmFyaWFibGUgYnkgY29udmVydGluZyBpdCB0byBKU09OLCB0aGVuIHdyaXRpbmcgdG8gcGhldC5sb2cuIElmIHRoZSBnbG9iYWwgaXMgdW5kZWZpbmVkLFxyXG4gKiB0aGUgbG9nIHdpbGwgc2hvdyAndW5kZWZpbmVkJy4gIFRoaXMgaXMgY3VycmVudGx5IHVzZWQgdG8gbG9nIGEgY29sbGVjdGlvbiBvZiBxdWVyeSBwYXJhbWV0ZXJzICh3aGljaCBleGlzdFxyXG4gKiBhcyBnbG9iYWxzKSwgYnV0IGNvdWxkIGJlIGFwcGxpZWQgdG8gb3RoZXIgZ2xvYmFscy4gIElmIHBoZXQubG9nIGlzIHVuZGVmaW5lZCwgdGhpcyBpcyBhIG5vLW9wLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBnZXRHbG9iYWwgZnJvbSAnLi9nZXRHbG9iYWwuanMnO1xyXG5pbXBvcnQgcGhldENvcmUgZnJvbSAnLi9waGV0Q29yZS5qcyc7XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtzdHJpbmd9IGdsb2JhbFN0cmluZyAtIHRoZSBuYW1lIG9mIHRoZSBnbG9iYWxcclxuICovXHJcbmZ1bmN0aW9uIGxvZ0dsb2JhbCggZ2xvYmFsU3RyaW5nICkge1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBnbG9iYWxTdHJpbmcgPT09ICdzdHJpbmcnLCBgaW52YWxpZCBnbG9iYWxTdHJpbmc6ICR7Z2xvYmFsU3RyaW5nfWAgKTtcclxuICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggYCR7Z2xvYmFsU3RyaW5nfTogJHtKU09OLnN0cmluZ2lmeSggZ2V0R2xvYmFsKCBnbG9iYWxTdHJpbmcgKSwgbnVsbCwgMiApfWAgKTtcclxufVxyXG5cclxucGhldENvcmUucmVnaXN0ZXIoICdsb2dHbG9iYWwnLCBsb2dHbG9iYWwgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGxvZ0dsb2JhbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxnQkFBZ0I7QUFDdEMsT0FBT0MsUUFBUSxNQUFNLGVBQWU7O0FBRXBDO0FBQ0E7QUFDQTtBQUNBLFNBQVNDLFNBQVNBLENBQUVDLFlBQVksRUFBRztFQUNqQ0MsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT0QsWUFBWSxLQUFLLFFBQVEsRUFBRyx5QkFBd0JBLFlBQWEsRUFBRSxDQUFDO0VBQzdGRSxJQUFJLENBQUNDLEdBQUcsSUFBSUQsSUFBSSxDQUFDQyxHQUFHLENBQUcsR0FBRUgsWUFBYSxLQUFJSSxJQUFJLENBQUNDLFNBQVMsQ0FBRVIsU0FBUyxDQUFFRyxZQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBRSxDQUFFLEVBQUUsQ0FBQztBQUNwRztBQUVBRixRQUFRLENBQUNRLFFBQVEsQ0FBRSxXQUFXLEVBQUVQLFNBQVUsQ0FBQztBQUUzQyxlQUFlQSxTQUFTIn0=