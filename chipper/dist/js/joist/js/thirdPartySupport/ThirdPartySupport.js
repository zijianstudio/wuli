// Copyright 2017-2022, University of Colorado Boulder

/**
 * Enumeration of third parties that PhET supports.  Each third party has its own type that sets up listeners for
 * communication between third party frames and the simulation.
 *
 * @author Jesse Greenberg
 */

import joist from '../joist.js';
import LegendsOfLearningSupport from './LegendsOfLearningSupport.js';
const ThirdPartySupport = {
  legendsOfLearning: LegendsOfLearningSupport
};

// verify that enum is immutable, without the runtime penalty in production code
if (assert) {
  Object.freeze(ThirdPartySupport);
}
joist.register('ThirdPartySupport', ThirdPartySupport);
export default ThirdPartySupport;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJqb2lzdCIsIkxlZ2VuZHNPZkxlYXJuaW5nU3VwcG9ydCIsIlRoaXJkUGFydHlTdXBwb3J0IiwibGVnZW5kc09mTGVhcm5pbmciLCJhc3NlcnQiLCJPYmplY3QiLCJmcmVlemUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRoaXJkUGFydHlTdXBwb3J0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEVudW1lcmF0aW9uIG9mIHRoaXJkIHBhcnRpZXMgdGhhdCBQaEVUIHN1cHBvcnRzLiAgRWFjaCB0aGlyZCBwYXJ0eSBoYXMgaXRzIG93biB0eXBlIHRoYXQgc2V0cyB1cCBsaXN0ZW5lcnMgZm9yXHJcbiAqIGNvbW11bmljYXRpb24gYmV0d2VlbiB0aGlyZCBwYXJ0eSBmcmFtZXMgYW5kIHRoZSBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBqb2lzdCBmcm9tICcuLi9qb2lzdC5qcyc7XHJcbmltcG9ydCBMZWdlbmRzT2ZMZWFybmluZ1N1cHBvcnQgZnJvbSAnLi9MZWdlbmRzT2ZMZWFybmluZ1N1cHBvcnQuanMnO1xyXG5cclxuY29uc3QgVGhpcmRQYXJ0eVN1cHBvcnQgPSB7XHJcbiAgbGVnZW5kc09mTGVhcm5pbmc6IExlZ2VuZHNPZkxlYXJuaW5nU3VwcG9ydFxyXG59O1xyXG5cclxuLy8gdmVyaWZ5IHRoYXQgZW51bSBpcyBpbW11dGFibGUsIHdpdGhvdXQgdGhlIHJ1bnRpbWUgcGVuYWx0eSBpbiBwcm9kdWN0aW9uIGNvZGVcclxuaWYgKCBhc3NlcnQgKSB7IE9iamVjdC5mcmVlemUoIFRoaXJkUGFydHlTdXBwb3J0ICk7IH1cclxuXHJcbmpvaXN0LnJlZ2lzdGVyKCAnVGhpcmRQYXJ0eVN1cHBvcnQnLCBUaGlyZFBhcnR5U3VwcG9ydCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGhpcmRQYXJ0eVN1cHBvcnQ7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLGFBQWE7QUFDL0IsT0FBT0Msd0JBQXdCLE1BQU0sK0JBQStCO0FBRXBFLE1BQU1DLGlCQUFpQixHQUFHO0VBQ3hCQyxpQkFBaUIsRUFBRUY7QUFDckIsQ0FBQzs7QUFFRDtBQUNBLElBQUtHLE1BQU0sRUFBRztFQUFFQyxNQUFNLENBQUNDLE1BQU0sQ0FBRUosaUJBQWtCLENBQUM7QUFBRTtBQUVwREYsS0FBSyxDQUFDTyxRQUFRLENBQUUsbUJBQW1CLEVBQUVMLGlCQUFrQixDQUFDO0FBRXhELGVBQWVBLGlCQUFpQiJ9