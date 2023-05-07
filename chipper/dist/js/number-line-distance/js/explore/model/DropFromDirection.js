// Copyright 2021-2022, University of Colorado Boulder

/**
 * Represents from where a point controller should 'drop' onto a number line for #34.
 * For example, if a point controller is above a play area and the DropFromDirection is TOP, then
 * the point controller will 'fall' onto the play area instead of being sent to the box.
 *
 * @author Saurabh Totey
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import numberLineDistance from '../../numberLineDistance.js';

// @public
const DropFromDirection = EnumerationDeprecated.byKeys(['TOP', 'LEFT']);
numberLineDistance.register('DropFromDirection', DropFromDirection);
export default DropFromDirection;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJudW1iZXJMaW5lRGlzdGFuY2UiLCJEcm9wRnJvbURpcmVjdGlvbiIsImJ5S2V5cyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRHJvcEZyb21EaXJlY3Rpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmVwcmVzZW50cyBmcm9tIHdoZXJlIGEgcG9pbnQgY29udHJvbGxlciBzaG91bGQgJ2Ryb3AnIG9udG8gYSBudW1iZXIgbGluZSBmb3IgIzM0LlxyXG4gKiBGb3IgZXhhbXBsZSwgaWYgYSBwb2ludCBjb250cm9sbGVyIGlzIGFib3ZlIGEgcGxheSBhcmVhIGFuZCB0aGUgRHJvcEZyb21EaXJlY3Rpb24gaXMgVE9QLCB0aGVuXHJcbiAqIHRoZSBwb2ludCBjb250cm9sbGVyIHdpbGwgJ2ZhbGwnIG9udG8gdGhlIHBsYXkgYXJlYSBpbnN0ZWFkIG9mIGJlaW5nIHNlbnQgdG8gdGhlIGJveC5cclxuICpcclxuICogQGF1dGhvciBTYXVyYWJoIFRvdGV5XHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25EZXByZWNhdGVkLmpzJztcclxuaW1wb3J0IG51bWJlckxpbmVEaXN0YW5jZSBmcm9tICcuLi8uLi9udW1iZXJMaW5lRGlzdGFuY2UuanMnO1xyXG5cclxuLy8gQHB1YmxpY1xyXG5jb25zdCBEcm9wRnJvbURpcmVjdGlvbiA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ1RPUCcsICdMRUZUJyBdICk7XHJcblxyXG5udW1iZXJMaW5lRGlzdGFuY2UucmVnaXN0ZXIoICdEcm9wRnJvbURpcmVjdGlvbicsIERyb3BGcm9tRGlyZWN0aW9uICk7XHJcbmV4cG9ydCBkZWZhdWx0IERyb3BGcm9tRGlyZWN0aW9uO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHFCQUFxQixNQUFNLG1EQUFtRDtBQUNyRixPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7O0FBRTVEO0FBQ0EsTUFBTUMsaUJBQWlCLEdBQUdGLHFCQUFxQixDQUFDRyxNQUFNLENBQUUsQ0FBRSxLQUFLLEVBQUUsTUFBTSxDQUFHLENBQUM7QUFFM0VGLGtCQUFrQixDQUFDRyxRQUFRLENBQUUsbUJBQW1CLEVBQUVGLGlCQUFrQixDQUFDO0FBQ3JFLGVBQWVBLGlCQUFpQiJ9