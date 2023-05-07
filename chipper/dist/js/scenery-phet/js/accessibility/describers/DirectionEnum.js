// Copyright 2018-2022, University of Colorado Boulder

/**
 * Possible directions for a freely draggable item; it can move up, down, left, right,
 * and along the diagonals of these orientations.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import { KeyboardUtils } from '../../../../scenery/js/imports.js';
import sceneryPhet from '../../sceneryPhet.js';

// It is important that the key and value are the same, so that either way you can access the values of the enum.
const DirectionEnum = EnumerationDeprecated.byKeys(['LEFT', 'RIGHT', 'UP', 'DOWN', 'UP_LEFT', 'UP_RIGHT', 'DOWN_LEFT', 'DOWN_RIGHT'], {
  beforeFreeze: DirectionEnum => {
    /**
     * Returns true if direction is one of the primary relative directions "up", "down", "left", "right".
     *
     * @param {DirectionEnum} direction - one of DirectionEnum
     * @returns {boolean}
     */
    DirectionEnum.isRelativeDirection = function (direction) {
      assert && assert(DirectionEnum.hasOwnProperty(direction));
      return direction === DirectionEnum.LEFT || direction === DirectionEnum.RIGHT || direction === DirectionEnum.UP || direction === DirectionEnum.DOWN;
    };

    /**
     * If the direction is a complex diagonal direction, break it up into its composite pieces
     * @param {DirectionEnum} direction - one of DirectionEnum
     * @returns {Array.<DirectionEnum>}
     */
    DirectionEnum.directionToRelativeDirections = function (direction) {
      assert && assert(DirectionEnum.hasOwnProperty(direction));
      return direction === DirectionEnum.UP_LEFT ? [DirectionEnum.UP, DirectionEnum.LEFT] : direction === DirectionEnum.UP_RIGHT ? [DirectionEnum.UP, DirectionEnum.RIGHT] : direction === DirectionEnum.DOWN_LEFT ? [DirectionEnum.DOWN, DirectionEnum.LEFT] : direction === DirectionEnum.DOWN_RIGHT ? [DirectionEnum.DOWN, DirectionEnum.RIGHT] : [DirectionEnum[direction]]; // primary relative direction, so return a single item in the array
    };

    /**
     * Convenience function if a horizontal direction
     * @param {DirectionEnum} direction - one of DirectionEnum
     * @returns {boolean}
     */
    DirectionEnum.isHorizontalDirection = function (direction) {
      assert && assert(DirectionEnum.hasOwnProperty(direction));
      return direction === DirectionEnum.LEFT || direction === DirectionEnum.RIGHT;
    };

    /**
     * Support for converting a key to a direction. Arrow keys and WASD will return a primary relative direction.
     * Return null if unrecognized key is given.
     * @param {string} key
     * @returns {DirectionEnum|null}
     */
    DirectionEnum.keyToDirection = function (key) {
      assert && assert(typeof key === 'string');
      if (key === KeyboardUtils.KEY_UP_ARROW || key === KeyboardUtils.KEY_W) {
        return DirectionEnum.UP;
      }
      if (key === KeyboardUtils.KEY_LEFT_ARROW || key === KeyboardUtils.KEY_A) {
        return DirectionEnum.LEFT;
      }
      if (key === KeyboardUtils.KEY_DOWN_ARROW || key === KeyboardUtils.KEY_S) {
        return DirectionEnum.DOWN;
      }
      if (key === KeyboardUtils.KEY_RIGHT_ARROW || key === KeyboardUtils.KEY_D) {
        return DirectionEnum.RIGHT;
      }
      return null;
    };
  }
});
sceneryPhet.register('DirectionEnum', DirectionEnum);
export default DirectionEnum;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJLZXlib2FyZFV0aWxzIiwic2NlbmVyeVBoZXQiLCJEaXJlY3Rpb25FbnVtIiwiYnlLZXlzIiwiYmVmb3JlRnJlZXplIiwiaXNSZWxhdGl2ZURpcmVjdGlvbiIsImRpcmVjdGlvbiIsImFzc2VydCIsImhhc093blByb3BlcnR5IiwiTEVGVCIsIlJJR0hUIiwiVVAiLCJET1dOIiwiZGlyZWN0aW9uVG9SZWxhdGl2ZURpcmVjdGlvbnMiLCJVUF9MRUZUIiwiVVBfUklHSFQiLCJET1dOX0xFRlQiLCJET1dOX1JJR0hUIiwiaXNIb3Jpem9udGFsRGlyZWN0aW9uIiwia2V5VG9EaXJlY3Rpb24iLCJrZXkiLCJLRVlfVVBfQVJST1ciLCJLRVlfVyIsIktFWV9MRUZUX0FSUk9XIiwiS0VZX0EiLCJLRVlfRE9XTl9BUlJPVyIsIktFWV9TIiwiS0VZX1JJR0hUX0FSUk9XIiwiS0VZX0QiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkRpcmVjdGlvbkVudW0uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUG9zc2libGUgZGlyZWN0aW9ucyBmb3IgYSBmcmVlbHkgZHJhZ2dhYmxlIGl0ZW07IGl0IGNhbiBtb3ZlIHVwLCBkb3duLCBsZWZ0LCByaWdodCxcclxuICogYW5kIGFsb25nIHRoZSBkaWFnb25hbHMgb2YgdGhlc2Ugb3JpZW50YXRpb25zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZC5qcyc7XHJcbmltcG9ydCB7IEtleWJvYXJkVXRpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vLi4vc2NlbmVyeVBoZXQuanMnO1xyXG5cclxuLy8gSXQgaXMgaW1wb3J0YW50IHRoYXQgdGhlIGtleSBhbmQgdmFsdWUgYXJlIHRoZSBzYW1lLCBzbyB0aGF0IGVpdGhlciB3YXkgeW91IGNhbiBhY2Nlc3MgdGhlIHZhbHVlcyBvZiB0aGUgZW51bS5cclxuY29uc3QgRGlyZWN0aW9uRW51bSA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFtcclxuICAnTEVGVCcsXHJcbiAgJ1JJR0hUJyxcclxuICAnVVAnLFxyXG4gICdET1dOJyxcclxuICAnVVBfTEVGVCcsXHJcbiAgJ1VQX1JJR0hUJyxcclxuICAnRE9XTl9MRUZUJyxcclxuICAnRE9XTl9SSUdIVCdcclxuXSwge1xyXG4gIGJlZm9yZUZyZWV6ZTogRGlyZWN0aW9uRW51bSA9PiB7XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIGRpcmVjdGlvbiBpcyBvbmUgb2YgdGhlIHByaW1hcnkgcmVsYXRpdmUgZGlyZWN0aW9ucyBcInVwXCIsIFwiZG93blwiLCBcImxlZnRcIiwgXCJyaWdodFwiLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7RGlyZWN0aW9uRW51bX0gZGlyZWN0aW9uIC0gb25lIG9mIERpcmVjdGlvbkVudW1cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBEaXJlY3Rpb25FbnVtLmlzUmVsYXRpdmVEaXJlY3Rpb24gPSBmdW5jdGlvbiggZGlyZWN0aW9uICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBEaXJlY3Rpb25FbnVtLmhhc093blByb3BlcnR5KCBkaXJlY3Rpb24gKSApO1xyXG4gICAgICByZXR1cm4gZGlyZWN0aW9uID09PSBEaXJlY3Rpb25FbnVtLkxFRlQgfHxcclxuICAgICAgICAgICAgIGRpcmVjdGlvbiA9PT0gRGlyZWN0aW9uRW51bS5SSUdIVCB8fFxyXG4gICAgICAgICAgICAgZGlyZWN0aW9uID09PSBEaXJlY3Rpb25FbnVtLlVQIHx8XHJcbiAgICAgICAgICAgICBkaXJlY3Rpb24gPT09IERpcmVjdGlvbkVudW0uRE9XTjtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiB0aGUgZGlyZWN0aW9uIGlzIGEgY29tcGxleCBkaWFnb25hbCBkaXJlY3Rpb24sIGJyZWFrIGl0IHVwIGludG8gaXRzIGNvbXBvc2l0ZSBwaWVjZXNcclxuICAgICAqIEBwYXJhbSB7RGlyZWN0aW9uRW51bX0gZGlyZWN0aW9uIC0gb25lIG9mIERpcmVjdGlvbkVudW1cclxuICAgICAqIEByZXR1cm5zIHtBcnJheS48RGlyZWN0aW9uRW51bT59XHJcbiAgICAgKi9cclxuICAgIERpcmVjdGlvbkVudW0uZGlyZWN0aW9uVG9SZWxhdGl2ZURpcmVjdGlvbnMgPSBmdW5jdGlvbiggZGlyZWN0aW9uICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBEaXJlY3Rpb25FbnVtLmhhc093blByb3BlcnR5KCBkaXJlY3Rpb24gKSApO1xyXG4gICAgICByZXR1cm4gZGlyZWN0aW9uID09PSBEaXJlY3Rpb25FbnVtLlVQX0xFRlQgPyBbIERpcmVjdGlvbkVudW0uVVAsIERpcmVjdGlvbkVudW0uTEVGVCBdIDpcclxuICAgICAgICAgICAgIGRpcmVjdGlvbiA9PT0gRGlyZWN0aW9uRW51bS5VUF9SSUdIVCA/IFsgRGlyZWN0aW9uRW51bS5VUCwgRGlyZWN0aW9uRW51bS5SSUdIVCBdIDpcclxuICAgICAgICAgICAgIGRpcmVjdGlvbiA9PT0gRGlyZWN0aW9uRW51bS5ET1dOX0xFRlQgPyBbIERpcmVjdGlvbkVudW0uRE9XTiwgRGlyZWN0aW9uRW51bS5MRUZUIF0gOlxyXG4gICAgICAgICAgICAgZGlyZWN0aW9uID09PSBEaXJlY3Rpb25FbnVtLkRPV05fUklHSFQgPyBbIERpcmVjdGlvbkVudW0uRE9XTiwgRGlyZWN0aW9uRW51bS5SSUdIVCBdIDpcclxuICAgICAgICAgICAgICAgWyBEaXJlY3Rpb25FbnVtWyBkaXJlY3Rpb24gXSBdOyAvLyBwcmltYXJ5IHJlbGF0aXZlIGRpcmVjdGlvbiwgc28gcmV0dXJuIGEgc2luZ2xlIGl0ZW0gaW4gdGhlIGFycmF5XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVuaWVuY2UgZnVuY3Rpb24gaWYgYSBob3Jpem9udGFsIGRpcmVjdGlvblxyXG4gICAgICogQHBhcmFtIHtEaXJlY3Rpb25FbnVtfSBkaXJlY3Rpb24gLSBvbmUgb2YgRGlyZWN0aW9uRW51bVxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIERpcmVjdGlvbkVudW0uaXNIb3Jpem9udGFsRGlyZWN0aW9uID0gZnVuY3Rpb24oIGRpcmVjdGlvbiApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggRGlyZWN0aW9uRW51bS5oYXNPd25Qcm9wZXJ0eSggZGlyZWN0aW9uICkgKTtcclxuICAgICAgcmV0dXJuIGRpcmVjdGlvbiA9PT0gRGlyZWN0aW9uRW51bS5MRUZUIHx8XHJcbiAgICAgICAgICAgICBkaXJlY3Rpb24gPT09IERpcmVjdGlvbkVudW0uUklHSFQ7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3VwcG9ydCBmb3IgY29udmVydGluZyBhIGtleSB0byBhIGRpcmVjdGlvbi4gQXJyb3cga2V5cyBhbmQgV0FTRCB3aWxsIHJldHVybiBhIHByaW1hcnkgcmVsYXRpdmUgZGlyZWN0aW9uLlxyXG4gICAgICogUmV0dXJuIG51bGwgaWYgdW5yZWNvZ25pemVkIGtleSBpcyBnaXZlbi5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcclxuICAgICAqIEByZXR1cm5zIHtEaXJlY3Rpb25FbnVtfG51bGx9XHJcbiAgICAgKi9cclxuICAgIERpcmVjdGlvbkVudW0ua2V5VG9EaXJlY3Rpb24gPSBmdW5jdGlvbigga2V5ICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Yga2V5ID09PSAnc3RyaW5nJyApO1xyXG5cclxuICAgICAgaWYgKCBrZXkgPT09IEtleWJvYXJkVXRpbHMuS0VZX1VQX0FSUk9XIHx8IGtleSA9PT0gS2V5Ym9hcmRVdGlscy5LRVlfVyApIHtcclxuICAgICAgICByZXR1cm4gRGlyZWN0aW9uRW51bS5VUDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGtleSA9PT0gS2V5Ym9hcmRVdGlscy5LRVlfTEVGVF9BUlJPVyB8fCBrZXkgPT09IEtleWJvYXJkVXRpbHMuS0VZX0EgKSB7XHJcbiAgICAgICAgcmV0dXJuIERpcmVjdGlvbkVudW0uTEVGVDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGtleSA9PT0gS2V5Ym9hcmRVdGlscy5LRVlfRE9XTl9BUlJPVyB8fCBrZXkgPT09IEtleWJvYXJkVXRpbHMuS0VZX1MgKSB7XHJcbiAgICAgICAgcmV0dXJuIERpcmVjdGlvbkVudW0uRE9XTjtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGtleSA9PT0gS2V5Ym9hcmRVdGlscy5LRVlfUklHSFRfQVJST1cgfHwga2V5ID09PSBLZXlib2FyZFV0aWxzLktFWV9EICkge1xyXG4gICAgICAgIHJldHVybiBEaXJlY3Rpb25FbnVtLlJJR0hUO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfTtcclxuICB9XHJcbn0gKTtcclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnRGlyZWN0aW9uRW51bScsIERpcmVjdGlvbkVudW0gKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IERpcmVjdGlvbkVudW07Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxxQkFBcUIsTUFBTSxtREFBbUQ7QUFDckYsU0FB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