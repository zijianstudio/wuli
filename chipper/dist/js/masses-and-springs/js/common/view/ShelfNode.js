// Copyright 2017-2021, University of Colorado Boulder

/**
 * Shelf used to house the masses when they are not being dragged or attached to a spring
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { Rectangle } from '../../../../scenery/js/imports.js';
import massesAndSprings from '../../massesAndSprings.js';
class ShelfNode extends Rectangle {
  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(tandem, options) {
    options = merge({
      fill: '#e6c29a',
      stroke: 'black',
      rectHeight: 10,
      rectX: 6,
      rectWidth: 280,
      tandem: tandem
    }, options);
    super(options);
  }
}
massesAndSprings.register('ShelfNode', ShelfNode);
export default ShelfNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlJlY3RhbmdsZSIsIm1hc3Nlc0FuZFNwcmluZ3MiLCJTaGVsZk5vZGUiLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsIm9wdGlvbnMiLCJmaWxsIiwic3Ryb2tlIiwicmVjdEhlaWdodCIsInJlY3RYIiwicmVjdFdpZHRoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTaGVsZk5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2hlbGYgdXNlZCB0byBob3VzZSB0aGUgbWFzc2VzIHdoZW4gdGhleSBhcmUgbm90IGJlaW5nIGRyYWdnZWQgb3IgYXR0YWNoZWQgdG8gYSBzcHJpbmdcclxuICpcclxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtYXNzZXNBbmRTcHJpbmdzIGZyb20gJy4uLy4uL21hc3Nlc0FuZFNwcmluZ3MuanMnO1xyXG5cclxuY2xhc3MgU2hlbGZOb2RlIGV4dGVuZHMgUmVjdGFuZ2xlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgZmlsbDogJyNlNmMyOWEnLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIHJlY3RIZWlnaHQ6IDEwLFxyXG4gICAgICByZWN0WDogNixcclxuICAgICAgcmVjdFdpZHRoOiAyODAsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9LCBvcHRpb25zICk7XHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxubWFzc2VzQW5kU3ByaW5ncy5yZWdpc3RlciggJ1NoZWxmTm9kZScsIFNoZWxmTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2hlbGZOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDN0QsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBRXhELE1BQU1DLFNBQVMsU0FBU0YsU0FBUyxDQUFDO0VBQ2hDO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VHLFdBQVdBLENBQUVDLE1BQU0sRUFBRUMsT0FBTyxFQUFHO0lBQzdCQSxPQUFPLEdBQUdOLEtBQUssQ0FBRTtNQUNmTyxJQUFJLEVBQUUsU0FBUztNQUNmQyxNQUFNLEVBQUUsT0FBTztNQUNmQyxVQUFVLEVBQUUsRUFBRTtNQUNkQyxLQUFLLEVBQUUsQ0FBQztNQUNSQyxTQUFTLEVBQUUsR0FBRztNQUNkTixNQUFNLEVBQUVBO0lBQ1YsQ0FBQyxFQUFFQyxPQUFRLENBQUM7SUFDWixLQUFLLENBQUVBLE9BQVEsQ0FBQztFQUNsQjtBQUNGO0FBRUFKLGdCQUFnQixDQUFDVSxRQUFRLENBQUUsV0FBVyxFQUFFVCxTQUFVLENBQUM7QUFFbkQsZUFBZUEsU0FBUyJ9