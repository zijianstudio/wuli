// Copyright 2016-2020, University of Colorado Boulder

/**
 * enum that defines the different types of coin terms
 * @author John Blanco
 */

import expressionExchange from '../../expressionExchange.js';
const CoinTermTypeID = {
  X: 'X',
  Y: 'Y',
  Z: 'Z',
  X_TIMES_Y: 'X_TIMES_Y',
  X_SQUARED: 'X_SQUARED',
  Y_SQUARED: 'Y_SQUARED',
  X_SQUARED_TIMES_Y_SQUARED: 'X_SQUARED_TIMES_Y_SQUARED',
  CONSTANT: 'CONSTANT'
};

// make the values available in an array
CoinTermTypeID.VALUES = _.values(CoinTermTypeID);

// verify that enum is immutable, without the runtime penalty in production code
if (assert) {
  Object.freeze(CoinTermTypeID);
}
expressionExchange.register('CoinTermTypeID', CoinTermTypeID);
export default CoinTermTypeID;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJleHByZXNzaW9uRXhjaGFuZ2UiLCJDb2luVGVybVR5cGVJRCIsIlgiLCJZIiwiWiIsIlhfVElNRVNfWSIsIlhfU1FVQVJFRCIsIllfU1FVQVJFRCIsIlhfU1FVQVJFRF9USU1FU19ZX1NRVUFSRUQiLCJDT05TVEFOVCIsIlZBTFVFUyIsIl8iLCJ2YWx1ZXMiLCJhc3NlcnQiLCJPYmplY3QiLCJmcmVlemUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvaW5UZXJtVHlwZUlELmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIGVudW0gdGhhdCBkZWZpbmVzIHRoZSBkaWZmZXJlbnQgdHlwZXMgb2YgY29pbiB0ZXJtc1xyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IGV4cHJlc3Npb25FeGNoYW5nZSBmcm9tICcuLi8uLi9leHByZXNzaW9uRXhjaGFuZ2UuanMnO1xyXG5cclxuY29uc3QgQ29pblRlcm1UeXBlSUQgPSB7XHJcbiAgWDogJ1gnLFxyXG4gIFk6ICdZJyxcclxuICBaOiAnWicsXHJcbiAgWF9USU1FU19ZOiAnWF9USU1FU19ZJyxcclxuICBYX1NRVUFSRUQ6ICdYX1NRVUFSRUQnLFxyXG4gIFlfU1FVQVJFRDogJ1lfU1FVQVJFRCcsXHJcbiAgWF9TUVVBUkVEX1RJTUVTX1lfU1FVQVJFRDogJ1hfU1FVQVJFRF9USU1FU19ZX1NRVUFSRUQnLFxyXG4gIENPTlNUQU5UOiAnQ09OU1RBTlQnXHJcbn07XHJcblxyXG4vLyBtYWtlIHRoZSB2YWx1ZXMgYXZhaWxhYmxlIGluIGFuIGFycmF5XHJcbkNvaW5UZXJtVHlwZUlELlZBTFVFUyA9IF8udmFsdWVzKCBDb2luVGVybVR5cGVJRCApO1xyXG5cclxuLy8gdmVyaWZ5IHRoYXQgZW51bSBpcyBpbW11dGFibGUsIHdpdGhvdXQgdGhlIHJ1bnRpbWUgcGVuYWx0eSBpbiBwcm9kdWN0aW9uIGNvZGVcclxuaWYgKCBhc3NlcnQgKSB7IE9iamVjdC5mcmVlemUoIENvaW5UZXJtVHlwZUlEICk7IH1cclxuXHJcbmV4cHJlc3Npb25FeGNoYW5nZS5yZWdpc3RlciggJ0NvaW5UZXJtVHlwZUlEJywgQ29pblRlcm1UeXBlSUQgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvaW5UZXJtVHlwZUlEOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0Esa0JBQWtCLE1BQU0sNkJBQTZCO0FBRTVELE1BQU1DLGNBQWMsR0FBRztFQUNyQkMsQ0FBQyxFQUFFLEdBQUc7RUFDTkMsQ0FBQyxFQUFFLEdBQUc7RUFDTkMsQ0FBQyxFQUFFLEdBQUc7RUFDTkMsU0FBUyxFQUFFLFdBQVc7RUFDdEJDLFNBQVMsRUFBRSxXQUFXO0VBQ3RCQyxTQUFTLEVBQUUsV0FBVztFQUN0QkMseUJBQXlCLEVBQUUsMkJBQTJCO0VBQ3REQyxRQUFRLEVBQUU7QUFDWixDQUFDOztBQUVEO0FBQ0FSLGNBQWMsQ0FBQ1MsTUFBTSxHQUFHQyxDQUFDLENBQUNDLE1BQU0sQ0FBRVgsY0FBZSxDQUFDOztBQUVsRDtBQUNBLElBQUtZLE1BQU0sRUFBRztFQUFFQyxNQUFNLENBQUNDLE1BQU0sQ0FBRWQsY0FBZSxDQUFDO0FBQUU7QUFFakRELGtCQUFrQixDQUFDZ0IsUUFBUSxDQUFFLGdCQUFnQixFQUFFZixjQUFlLENBQUM7QUFFL0QsZUFBZUEsY0FBYyJ9