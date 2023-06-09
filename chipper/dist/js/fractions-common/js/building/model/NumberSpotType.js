// Copyright 2018-2022, University of Colorado Boulder

/**
 * The different slots in a number group where number pieces can go.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import fractionsCommon from '../../fractionsCommon.js';
const NumberSpotType = EnumerationDeprecated.byKeys(['WHOLE', 'NUMERATOR', 'DENOMINATOR'], {
  beforeFreeze: NumberSpotType => {
    /**
     * @param {boolean} isMixedNumber
     * @returns {Array.<NumberSpotType>} - Shows the number spots available for whether mixed numbers are an option.
     */
    NumberSpotType.getTypes = isMixedNumber => isMixedNumber ? [NumberSpotType.WHOLE, NumberSpotType.NUMERATOR, NumberSpotType.DENOMINATOR] : [NumberSpotType.NUMERATOR, NumberSpotType.DENOMINATOR];
  }
});
fractionsCommon.register('NumberSpotType', NumberSpotType);
export default NumberSpotType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJmcmFjdGlvbnNDb21tb24iLCJOdW1iZXJTcG90VHlwZSIsImJ5S2V5cyIsImJlZm9yZUZyZWV6ZSIsImdldFR5cGVzIiwiaXNNaXhlZE51bWJlciIsIldIT0xFIiwiTlVNRVJBVE9SIiwiREVOT01JTkFUT1IiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk51bWJlclNwb3RUeXBlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBkaWZmZXJlbnQgc2xvdHMgaW4gYSBudW1iZXIgZ3JvdXAgd2hlcmUgbnVtYmVyIHBpZWNlcyBjYW4gZ28uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb25EZXByZWNhdGVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbkRlcHJlY2F0ZWQuanMnO1xyXG5pbXBvcnQgZnJhY3Rpb25zQ29tbW9uIGZyb20gJy4uLy4uL2ZyYWN0aW9uc0NvbW1vbi5qcyc7XHJcblxyXG5jb25zdCBOdW1iZXJTcG90VHlwZSA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFtcclxuICAnV0hPTEUnLFxyXG4gICdOVU1FUkFUT1InLFxyXG4gICdERU5PTUlOQVRPUidcclxuXSwge1xyXG4gIGJlZm9yZUZyZWV6ZTogTnVtYmVyU3BvdFR5cGUgPT4ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzTWl4ZWROdW1iZXJcclxuICAgICAqIEByZXR1cm5zIHtBcnJheS48TnVtYmVyU3BvdFR5cGU+fSAtIFNob3dzIHRoZSBudW1iZXIgc3BvdHMgYXZhaWxhYmxlIGZvciB3aGV0aGVyIG1peGVkIG51bWJlcnMgYXJlIGFuIG9wdGlvbi5cclxuICAgICAqL1xyXG4gICAgTnVtYmVyU3BvdFR5cGUuZ2V0VHlwZXMgPSBpc01peGVkTnVtYmVyID0+IGlzTWl4ZWROdW1iZXIgPyBbXHJcbiAgICAgIE51bWJlclNwb3RUeXBlLldIT0xFLFxyXG4gICAgICBOdW1iZXJTcG90VHlwZS5OVU1FUkFUT1IsXHJcbiAgICAgIE51bWJlclNwb3RUeXBlLkRFTk9NSU5BVE9SXHJcbiAgICBdIDogW1xyXG4gICAgICBOdW1iZXJTcG90VHlwZS5OVU1FUkFUT1IsXHJcbiAgICAgIE51bWJlclNwb3RUeXBlLkRFTk9NSU5BVE9SXHJcbiAgICBdO1xyXG4gIH1cclxufSApO1xyXG5mcmFjdGlvbnNDb21tb24ucmVnaXN0ZXIoICdOdW1iZXJTcG90VHlwZScsIE51bWJlclNwb3RUeXBlICk7XHJcbmV4cG9ydCBkZWZhdWx0IE51bWJlclNwb3RUeXBlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxxQkFBcUIsTUFBTSxtREFBbUQ7QUFDckYsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUV0RCxNQUFNQyxjQUFjLEdBQUdGLHFCQUFxQixDQUFDRyxNQUFNLENBQUUsQ0FDbkQsT0FBTyxFQUNQLFdBQVcsRUFDWCxhQUFhLENBQ2QsRUFBRTtFQUNEQyxZQUFZLEVBQUVGLGNBQWMsSUFBSTtJQUM5QjtBQUNKO0FBQ0E7QUFDQTtJQUNJQSxjQUFjLENBQUNHLFFBQVEsR0FBR0MsYUFBYSxJQUFJQSxhQUFhLEdBQUcsQ0FDekRKLGNBQWMsQ0FBQ0ssS0FBSyxFQUNwQkwsY0FBYyxDQUFDTSxTQUFTLEVBQ3hCTixjQUFjLENBQUNPLFdBQVcsQ0FDM0IsR0FBRyxDQUNGUCxjQUFjLENBQUNNLFNBQVMsRUFDeEJOLGNBQWMsQ0FBQ08sV0FBVyxDQUMzQjtFQUNIO0FBQ0YsQ0FBRSxDQUFDO0FBQ0hSLGVBQWUsQ0FBQ1MsUUFBUSxDQUFFLGdCQUFnQixFQUFFUixjQUFlLENBQUM7QUFDNUQsZUFBZUEsY0FBYyJ9