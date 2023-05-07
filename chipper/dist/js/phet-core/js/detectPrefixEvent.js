// Copyright 2014-2023, University of Colorado Boulder
/* eslint-disable no-useless-concat */

/**
 * Scans through potential event properties on an object to detect prefixed forms, and returns the first match.
 *
 * E.g. currently:
 * phet.phetCore.detectPrefixEvent( document, 'fullscreenchange' ) === 'webkitfullscreenchange'
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import phetCore from './phetCore.js';

// @returns the best String str where obj['on'+str] !== undefined, or returns undefined if that is not available
function detectPrefixEvent(obj, name, isEvent) {
  if (obj[`on${name}`] !== undefined) {
    return name;
  }

  // Chrome planning to not introduce prefixes in the future, hopefully we will be safe
  if (obj[`${'on' + 'moz'}${name}`] !== undefined) {
    return `moz${name}`;
  }
  if (obj[`${'on' + 'Moz'}${name}`] !== undefined) {
    return `Moz${name}`;
  } // some prefixes seem to have all-caps?
  if (obj[`${'on' + 'webkit'}${name}`] !== undefined) {
    return `webkit${name}`;
  }
  if (obj[`${'on' + 'ms'}${name}`] !== undefined) {
    return `ms${name}`;
  }
  if (obj[`${'on' + 'o'}${name}`] !== undefined) {
    return `o${name}`;
  }
  return undefined;
}
phetCore.register('detectPrefixEvent', detectPrefixEvent);
export default detectPrefixEvent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaGV0Q29yZSIsImRldGVjdFByZWZpeEV2ZW50Iiwib2JqIiwibmFtZSIsImlzRXZlbnQiLCJ1bmRlZmluZWQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbImRldGVjdFByZWZpeEV2ZW50LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11c2VsZXNzLWNvbmNhdCAqL1xyXG5cclxuLyoqXHJcbiAqIFNjYW5zIHRocm91Z2ggcG90ZW50aWFsIGV2ZW50IHByb3BlcnRpZXMgb24gYW4gb2JqZWN0IHRvIGRldGVjdCBwcmVmaXhlZCBmb3JtcywgYW5kIHJldHVybnMgdGhlIGZpcnN0IG1hdGNoLlxyXG4gKlxyXG4gKiBFLmcuIGN1cnJlbnRseTpcclxuICogcGhldC5waGV0Q29yZS5kZXRlY3RQcmVmaXhFdmVudCggZG9jdW1lbnQsICdmdWxsc2NyZWVuY2hhbmdlJyApID09PSAnd2Via2l0ZnVsbHNjcmVlbmNoYW5nZSdcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBwaGV0Q29yZSBmcm9tICcuL3BoZXRDb3JlLmpzJztcclxuXHJcbi8vIEByZXR1cm5zIHRoZSBiZXN0IFN0cmluZyBzdHIgd2hlcmUgb2JqWydvbicrc3RyXSAhPT0gdW5kZWZpbmVkLCBvciByZXR1cm5zIHVuZGVmaW5lZCBpZiB0aGF0IGlzIG5vdCBhdmFpbGFibGVcclxuZnVuY3Rpb24gZGV0ZWN0UHJlZml4RXZlbnQoIG9iaiwgbmFtZSwgaXNFdmVudCApIHtcclxuICBpZiAoIG9ialsgYG9uJHtuYW1lfWAgXSAhPT0gdW5kZWZpbmVkICkgeyByZXR1cm4gbmFtZTsgfVxyXG5cclxuICAvLyBDaHJvbWUgcGxhbm5pbmcgdG8gbm90IGludHJvZHVjZSBwcmVmaXhlcyBpbiB0aGUgZnV0dXJlLCBob3BlZnVsbHkgd2Ugd2lsbCBiZSBzYWZlXHJcbiAgaWYgKCBvYmpbIGAkeydvbicgKyAnbW96J30ke25hbWV9YCBdICE9PSB1bmRlZmluZWQgKSB7IHJldHVybiBgbW96JHtuYW1lfWA7IH1cclxuICBpZiAoIG9ialsgYCR7J29uJyArICdNb3onfSR7bmFtZX1gIF0gIT09IHVuZGVmaW5lZCApIHsgcmV0dXJuIGBNb3oke25hbWV9YDsgfSAvLyBzb21lIHByZWZpeGVzIHNlZW0gdG8gaGF2ZSBhbGwtY2Fwcz9cclxuICBpZiAoIG9ialsgYCR7J29uJyArICd3ZWJraXQnfSR7bmFtZX1gIF0gIT09IHVuZGVmaW5lZCApIHsgcmV0dXJuIGB3ZWJraXQke25hbWV9YDsgfVxyXG4gIGlmICggb2JqWyBgJHsnb24nICsgJ21zJ30ke25hbWV9YCBdICE9PSB1bmRlZmluZWQgKSB7IHJldHVybiBgbXMke25hbWV9YDsgfVxyXG4gIGlmICggb2JqWyBgJHsnb24nICsgJ28nfSR7bmFtZX1gIF0gIT09IHVuZGVmaW5lZCApIHsgcmV0dXJuIGBvJHtuYW1lfWA7IH1cclxuICByZXR1cm4gdW5kZWZpbmVkO1xyXG59XHJcblxyXG5waGV0Q29yZS5yZWdpc3RlciggJ2RldGVjdFByZWZpeEV2ZW50JywgZGV0ZWN0UHJlZml4RXZlbnQgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRldGVjdFByZWZpeEV2ZW50OyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxlQUFlOztBQUVwQztBQUNBLFNBQVNDLGlCQUFpQkEsQ0FBRUMsR0FBRyxFQUFFQyxJQUFJLEVBQUVDLE9BQU8sRUFBRztFQUMvQyxJQUFLRixHQUFHLENBQUcsS0FBSUMsSUFBSyxFQUFDLENBQUUsS0FBS0UsU0FBUyxFQUFHO0lBQUUsT0FBT0YsSUFBSTtFQUFFOztFQUV2RDtFQUNBLElBQUtELEdBQUcsQ0FBRyxHQUFFLElBQUksR0FBRyxLQUFNLEdBQUVDLElBQUssRUFBQyxDQUFFLEtBQUtFLFNBQVMsRUFBRztJQUFFLE9BQVEsTUFBS0YsSUFBSyxFQUFDO0VBQUU7RUFDNUUsSUFBS0QsR0FBRyxDQUFHLEdBQUUsSUFBSSxHQUFHLEtBQU0sR0FBRUMsSUFBSyxFQUFDLENBQUUsS0FBS0UsU0FBUyxFQUFHO0lBQUUsT0FBUSxNQUFLRixJQUFLLEVBQUM7RUFBRSxDQUFDLENBQUM7RUFDOUUsSUFBS0QsR0FBRyxDQUFHLEdBQUUsSUFBSSxHQUFHLFFBQVMsR0FBRUMsSUFBSyxFQUFDLENBQUUsS0FBS0UsU0FBUyxFQUFHO0lBQUUsT0FBUSxTQUFRRixJQUFLLEVBQUM7RUFBRTtFQUNsRixJQUFLRCxHQUFHLENBQUcsR0FBRSxJQUFJLEdBQUcsSUFBSyxHQUFFQyxJQUFLLEVBQUMsQ0FBRSxLQUFLRSxTQUFTLEVBQUc7SUFBRSxPQUFRLEtBQUlGLElBQUssRUFBQztFQUFFO0VBQzFFLElBQUtELEdBQUcsQ0FBRyxHQUFFLElBQUksR0FBRyxHQUFJLEdBQUVDLElBQUssRUFBQyxDQUFFLEtBQUtFLFNBQVMsRUFBRztJQUFFLE9BQVEsSUFBR0YsSUFBSyxFQUFDO0VBQUU7RUFDeEUsT0FBT0UsU0FBUztBQUNsQjtBQUVBTCxRQUFRLENBQUNNLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRUwsaUJBQWtCLENBQUM7QUFFM0QsZUFBZUEsaUJBQWlCIn0=