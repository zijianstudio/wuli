// Copyright 2023, University of Colorado Boulder

/**
 * Uses puppeteer to see whether a page loads without an error. Throws errors it receives
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

const browserPageLoad = require('./browserPageLoad');
const puppeteer = require('puppeteer');

/**
 * Uses puppeteer to see whether a page loads without an error
 * @public
 *
 * Rejects if encountering an error loading the page OR (with option provided within the puppeteer page itself).
 *
 * @param {string} url
 * @param {Object} [options] - see browserPageLoad
 * @returns {Promise.<null|*>} - The eval result/null
 */
module.exports = async function (url, options) {
  return browserPageLoad(puppeteer, url, options);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJicm93c2VyUGFnZUxvYWQiLCJyZXF1aXJlIiwicHVwcGV0ZWVyIiwibW9kdWxlIiwiZXhwb3J0cyIsInVybCIsIm9wdGlvbnMiXSwic291cmNlcyI6WyJwdXBwZXRlZXJMb2FkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBVc2VzIHB1cHBldGVlciB0byBzZWUgd2hldGhlciBhIHBhZ2UgbG9hZHMgd2l0aG91dCBhbiBlcnJvci4gVGhyb3dzIGVycm9ycyBpdCByZWNlaXZlc1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5jb25zdCBicm93c2VyUGFnZUxvYWQgPSByZXF1aXJlKCAnLi9icm93c2VyUGFnZUxvYWQnICk7XHJcbmNvbnN0IHB1cHBldGVlciA9IHJlcXVpcmUoICdwdXBwZXRlZXInICk7XHJcblxyXG4vKipcclxuICogVXNlcyBwdXBwZXRlZXIgdG8gc2VlIHdoZXRoZXIgYSBwYWdlIGxvYWRzIHdpdGhvdXQgYW4gZXJyb3JcclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBSZWplY3RzIGlmIGVuY291bnRlcmluZyBhbiBlcnJvciBsb2FkaW5nIHRoZSBwYWdlIE9SICh3aXRoIG9wdGlvbiBwcm92aWRlZCB3aXRoaW4gdGhlIHB1cHBldGVlciBwYWdlIGl0c2VsZikuXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcclxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIHNlZSBicm93c2VyUGFnZUxvYWRcclxuICogQHJldHVybnMge1Byb21pc2UuPG51bGx8Kj59IC0gVGhlIGV2YWwgcmVzdWx0L251bGxcclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHVybCwgb3B0aW9ucyApIHtcclxuICByZXR1cm4gYnJvd3NlclBhZ2VMb2FkKCBwdXBwZXRlZXIsIHVybCwgb3B0aW9ucyApO1xyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNQSxlQUFlLEdBQUdDLE9BQU8sQ0FBRSxtQkFBb0IsQ0FBQztBQUN0RCxNQUFNQyxTQUFTLEdBQUdELE9BQU8sQ0FBRSxXQUFZLENBQUM7O0FBRXhDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FFLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLGdCQUFnQkMsR0FBRyxFQUFFQyxPQUFPLEVBQUc7RUFDOUMsT0FBT04sZUFBZSxDQUFFRSxTQUFTLEVBQUVHLEdBQUcsRUFBRUMsT0FBUSxDQUFDO0FBQ25ELENBQUMifQ==