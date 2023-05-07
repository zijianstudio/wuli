// Copyright 2018-2023, University of Colorado Boulder

/**
 * Enumeration for the two ISLCObjects in the sim.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Michael Barlow (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../phet-core/js/EnumerationDeprecated.js';
import inverseSquareLawCommon from '../inverseSquareLawCommon.js';
const ISLCObjectEnum = EnumerationDeprecated.byKeys(['OBJECT_ONE', 'OBJECT_TWO'], {
  beforeFreeze: ISLCObjectEnum => {
    /**
     * @param {ISLCObjectEnum} objectEnum
     * @returns {ISLCObjectEnum}
     */
    ISLCObjectEnum.getOtherObjectEnum = objectEnum => {
      assert && assert(ISLCObjectEnum.includes(objectEnum));
      return objectEnum === ISLCObjectEnum.OBJECT_ONE ? ISLCObjectEnum.OBJECT_TWO : ISLCObjectEnum.OBJECT_ONE;
    };

    /**
     * @public
     * @param {ISLCObjectEnum} objectEnum
     * @returns {boolean}
     */
    ISLCObjectEnum.isObject1 = objectEnum => {
      assert && assert(ISLCObjectEnum.includes(objectEnum));
      return objectEnum === ISLCObjectEnum.OBJECT_ONE;
    };

    /**
     * @param {ISLCObjectEnum} objectEnum
     * @returns {boolean}
     */
    ISLCObjectEnum.isObject2 = objectEnum => {
      assert && assert(ISLCObjectEnum.includes(objectEnum));
      return objectEnum === ISLCObjectEnum.OBJECT_TWO;
    };
  }
});
inverseSquareLawCommon.register('ISLCObjectEnum', ISLCObjectEnum);
export default ISLCObjectEnum;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJpbnZlcnNlU3F1YXJlTGF3Q29tbW9uIiwiSVNMQ09iamVjdEVudW0iLCJieUtleXMiLCJiZWZvcmVGcmVlemUiLCJnZXRPdGhlck9iamVjdEVudW0iLCJvYmplY3RFbnVtIiwiYXNzZXJ0IiwiaW5jbHVkZXMiLCJPQkpFQ1RfT05FIiwiT0JKRUNUX1RXTyIsImlzT2JqZWN0MSIsImlzT2JqZWN0MiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSVNMQ09iamVjdEVudW0uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRW51bWVyYXRpb24gZm9yIHRoZSB0d28gSVNMQ09iamVjdHMgaW4gdGhlIHNpbS5cclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgQmFybG93IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZC5qcyc7XHJcbmltcG9ydCBpbnZlcnNlU3F1YXJlTGF3Q29tbW9uIGZyb20gJy4uL2ludmVyc2VTcXVhcmVMYXdDb21tb24uanMnO1xyXG5cclxuY29uc3QgSVNMQ09iamVjdEVudW0gPSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuYnlLZXlzKCBbXHJcbiAgJ09CSkVDVF9PTkUnLFxyXG4gICdPQkpFQ1RfVFdPJ1xyXG5dLCB7XHJcbiAgYmVmb3JlRnJlZXplOiBJU0xDT2JqZWN0RW51bSA9PiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge0lTTENPYmplY3RFbnVtfSBvYmplY3RFbnVtXHJcbiAgICAgKiBAcmV0dXJucyB7SVNMQ09iamVjdEVudW19XHJcbiAgICAgKi9cclxuICAgIElTTENPYmplY3RFbnVtLmdldE90aGVyT2JqZWN0RW51bSA9IG9iamVjdEVudW0gPT4ge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBJU0xDT2JqZWN0RW51bS5pbmNsdWRlcyggb2JqZWN0RW51bSApICk7XHJcbiAgICAgIHJldHVybiBvYmplY3RFbnVtID09PSBJU0xDT2JqZWN0RW51bS5PQkpFQ1RfT05FID8gSVNMQ09iamVjdEVudW0uT0JKRUNUX1RXTyA6IElTTENPYmplY3RFbnVtLk9CSkVDVF9PTkU7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQHBhcmFtIHtJU0xDT2JqZWN0RW51bX0gb2JqZWN0RW51bVxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIElTTENPYmplY3RFbnVtLmlzT2JqZWN0MSA9IG9iamVjdEVudW0gPT4ge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBJU0xDT2JqZWN0RW51bS5pbmNsdWRlcyggb2JqZWN0RW51bSApICk7XHJcbiAgICAgIHJldHVybiBvYmplY3RFbnVtID09PSBJU0xDT2JqZWN0RW51bS5PQkpFQ1RfT05FO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7SVNMQ09iamVjdEVudW19IG9iamVjdEVudW1cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBJU0xDT2JqZWN0RW51bS5pc09iamVjdDIgPSBvYmplY3RFbnVtID0+IHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggSVNMQ09iamVjdEVudW0uaW5jbHVkZXMoIG9iamVjdEVudW0gKSApO1xyXG4gICAgICByZXR1cm4gb2JqZWN0RW51bSA9PT0gSVNMQ09iamVjdEVudW0uT0JKRUNUX1RXTztcclxuICAgIH07XHJcbiAgfVxyXG59ICk7XHJcbmludmVyc2VTcXVhcmVMYXdDb21tb24ucmVnaXN0ZXIoICdJU0xDT2JqZWN0RW51bScsIElTTENPYmplY3RFbnVtICk7XHJcbmV4cG9ydCBkZWZhdWx0IElTTENPYmplY3RFbnVtOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxxQkFBcUIsTUFBTSxnREFBZ0Q7QUFDbEYsT0FBT0Msc0JBQXNCLE1BQU0sOEJBQThCO0FBRWpFLE1BQU1DLGNBQWMsR0FBR0YscUJBQXFCLENBQUNHLE1BQU0sQ0FBRSxDQUNuRCxZQUFZLEVBQ1osWUFBWSxDQUNiLEVBQUU7RUFDREMsWUFBWSxFQUFFRixjQUFjLElBQUk7SUFFOUI7QUFDSjtBQUNBO0FBQ0E7SUFDSUEsY0FBYyxDQUFDRyxrQkFBa0IsR0FBR0MsVUFBVSxJQUFJO01BQ2hEQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUwsY0FBYyxDQUFDTSxRQUFRLENBQUVGLFVBQVcsQ0FBRSxDQUFDO01BQ3pELE9BQU9BLFVBQVUsS0FBS0osY0FBYyxDQUFDTyxVQUFVLEdBQUdQLGNBQWMsQ0FBQ1EsVUFBVSxHQUFHUixjQUFjLENBQUNPLFVBQVU7SUFDekcsQ0FBQzs7SUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0lBQ0lQLGNBQWMsQ0FBQ1MsU0FBUyxHQUFHTCxVQUFVLElBQUk7TUFDdkNDLE1BQU0sSUFBSUEsTUFBTSxDQUFFTCxjQUFjLENBQUNNLFFBQVEsQ0FBRUYsVUFBVyxDQUFFLENBQUM7TUFDekQsT0FBT0EsVUFBVSxLQUFLSixjQUFjLENBQUNPLFVBQVU7SUFDakQsQ0FBQzs7SUFFRDtBQUNKO0FBQ0E7QUFDQTtJQUNJUCxjQUFjLENBQUNVLFNBQVMsR0FBR04sVUFBVSxJQUFJO01BQ3ZDQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUwsY0FBYyxDQUFDTSxRQUFRLENBQUVGLFVBQVcsQ0FBRSxDQUFDO01BQ3pELE9BQU9BLFVBQVUsS0FBS0osY0FBYyxDQUFDUSxVQUFVO0lBQ2pELENBQUM7RUFDSDtBQUNGLENBQUUsQ0FBQztBQUNIVCxzQkFBc0IsQ0FBQ1ksUUFBUSxDQUFFLGdCQUFnQixFQUFFWCxjQUFlLENBQUM7QUFDbkUsZUFBZUEsY0FBYyJ9