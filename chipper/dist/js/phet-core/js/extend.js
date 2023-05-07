// Copyright 2013-2021, University of Colorado Boulder

/**
 * Like Underscore's _.extend and PHET_CORE/merge, but with hardcoded support for ES5 getters/setters. In general this
 * type shouldn't be used for phet's options pattern, and instead was designed to support extension for defining
 * mixins and object prototypes.
 *
 * See https://github.com/documentcloud/underscore/pull/986.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import phetCore from './phetCore.js';
function extend(obj) {
  // eslint-disable-next-line prefer-rest-params
  _.each(Array.prototype.slice.call(arguments, 1), source => {
    if (source) {
      for (const prop in source) {
        Object.defineProperty(obj, prop, Object.getOwnPropertyDescriptor(source, prop));
      }
    }
  });
  return obj;
}
phetCore.register('extend', extend);
export default extend;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaGV0Q29yZSIsImV4dGVuZCIsIm9iaiIsIl8iLCJlYWNoIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJzbGljZSIsImNhbGwiLCJhcmd1bWVudHMiLCJzb3VyY2UiLCJwcm9wIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbImV4dGVuZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBMaWtlIFVuZGVyc2NvcmUncyBfLmV4dGVuZCBhbmQgUEhFVF9DT1JFL21lcmdlLCBidXQgd2l0aCBoYXJkY29kZWQgc3VwcG9ydCBmb3IgRVM1IGdldHRlcnMvc2V0dGVycy4gSW4gZ2VuZXJhbCB0aGlzXHJcbiAqIHR5cGUgc2hvdWxkbid0IGJlIHVzZWQgZm9yIHBoZXQncyBvcHRpb25zIHBhdHRlcm4sIGFuZCBpbnN0ZWFkIHdhcyBkZXNpZ25lZCB0byBzdXBwb3J0IGV4dGVuc2lvbiBmb3IgZGVmaW5pbmdcclxuICogbWl4aW5zIGFuZCBvYmplY3QgcHJvdG90eXBlcy5cclxuICpcclxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9kb2N1bWVudGNsb3VkL3VuZGVyc2NvcmUvcHVsbC85ODYuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgcGhldENvcmUgZnJvbSAnLi9waGV0Q29yZS5qcyc7XHJcblxyXG5mdW5jdGlvbiBleHRlbmQoIG9iaiApIHtcclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLXJlc3QtcGFyYW1zXHJcbiAgXy5lYWNoKCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggYXJndW1lbnRzLCAxICksIHNvdXJjZSA9PiB7XHJcbiAgICBpZiAoIHNvdXJjZSApIHtcclxuICAgICAgZm9yICggY29uc3QgcHJvcCBpbiBzb3VyY2UgKSB7XHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBvYmosIHByb3AsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoIHNvdXJjZSwgcHJvcCApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9ICk7XHJcbiAgcmV0dXJuIG9iajtcclxufVxyXG5cclxucGhldENvcmUucmVnaXN0ZXIoICdleHRlbmQnLCBleHRlbmQgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGV4dGVuZDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sZUFBZTtBQUVwQyxTQUFTQyxNQUFNQSxDQUFFQyxHQUFHLEVBQUc7RUFDckI7RUFDQUMsQ0FBQyxDQUFDQyxJQUFJLENBQUVDLEtBQUssQ0FBQ0MsU0FBUyxDQUFDQyxLQUFLLENBQUNDLElBQUksQ0FBRUMsU0FBUyxFQUFFLENBQUUsQ0FBQyxFQUFFQyxNQUFNLElBQUk7SUFDNUQsSUFBS0EsTUFBTSxFQUFHO01BQ1osS0FBTSxNQUFNQyxJQUFJLElBQUlELE1BQU0sRUFBRztRQUMzQkUsTUFBTSxDQUFDQyxjQUFjLENBQUVYLEdBQUcsRUFBRVMsSUFBSSxFQUFFQyxNQUFNLENBQUNFLHdCQUF3QixDQUFFSixNQUFNLEVBQUVDLElBQUssQ0FBRSxDQUFDO01BQ3JGO0lBQ0Y7RUFDRixDQUFFLENBQUM7RUFDSCxPQUFPVCxHQUFHO0FBQ1o7QUFFQUYsUUFBUSxDQUFDZSxRQUFRLENBQUUsUUFBUSxFQUFFZCxNQUFPLENBQUM7QUFFckMsZUFBZUEsTUFBTSJ9