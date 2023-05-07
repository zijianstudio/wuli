// Copyright 2016-2020, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import makeATen from '../../makeATen.js';
const MakeATenQueryParameters = QueryStringMachine.getAll({
  // Initializes the Explore screen with specific numbers, spaced horizontally,
  // e.g. ?exploreNumbers=10,51, where 0 indicates none.
  exploreNumbers: {
    type: 'array',
    elementSchema: {
      type: 'number'
    },
    defaultValue: [10]
  }
});
makeATen.register('MakeATenQueryParameters', MakeATenQueryParameters);
export default MakeATenQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtYWtlQVRlbiIsIk1ha2VBVGVuUXVlcnlQYXJhbWV0ZXJzIiwiUXVlcnlTdHJpbmdNYWNoaW5lIiwiZ2V0QWxsIiwiZXhwbG9yZU51bWJlcnMiLCJ0eXBlIiwiZWxlbWVudFNjaGVtYSIsImRlZmF1bHRWYWx1ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTWFrZUFUZW5RdWVyeVBhcmFtZXRlcnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUXVlcnkgcGFyYW1ldGVycyBzdXBwb3J0ZWQgYnkgdGhpcyBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IG1ha2VBVGVuIGZyb20gJy4uLy4uL21ha2VBVGVuLmpzJztcclxuXHJcbmNvbnN0IE1ha2VBVGVuUXVlcnlQYXJhbWV0ZXJzID0gUXVlcnlTdHJpbmdNYWNoaW5lLmdldEFsbCgge1xyXG5cclxuICAvLyBJbml0aWFsaXplcyB0aGUgRXhwbG9yZSBzY3JlZW4gd2l0aCBzcGVjaWZpYyBudW1iZXJzLCBzcGFjZWQgaG9yaXpvbnRhbGx5LFxyXG4gIC8vIGUuZy4gP2V4cGxvcmVOdW1iZXJzPTEwLDUxLCB3aGVyZSAwIGluZGljYXRlcyBub25lLlxyXG4gIGV4cGxvcmVOdW1iZXJzOiB7XHJcbiAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgZWxlbWVudFNjaGVtYToge1xyXG4gICAgICB0eXBlOiAnbnVtYmVyJ1xyXG4gICAgfSxcclxuICAgIGRlZmF1bHRWYWx1ZTogWyAxMCBdXHJcbiAgfVxyXG59ICk7XHJcblxyXG5tYWtlQVRlbi5yZWdpc3RlciggJ01ha2VBVGVuUXVlcnlQYXJhbWV0ZXJzJywgTWFrZUFUZW5RdWVyeVBhcmFtZXRlcnMgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1ha2VBVGVuUXVlcnlQYXJhbWV0ZXJzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sbUJBQW1CO0FBRXhDLE1BQU1DLHVCQUF1QixHQUFHQyxrQkFBa0IsQ0FBQ0MsTUFBTSxDQUFFO0VBRXpEO0VBQ0E7RUFDQUMsY0FBYyxFQUFFO0lBQ2RDLElBQUksRUFBRSxPQUFPO0lBQ2JDLGFBQWEsRUFBRTtNQUNiRCxJQUFJLEVBQUU7SUFDUixDQUFDO0lBQ0RFLFlBQVksRUFBRSxDQUFFLEVBQUU7RUFDcEI7QUFDRixDQUFFLENBQUM7QUFFSFAsUUFBUSxDQUFDUSxRQUFRLENBQUUseUJBQXlCLEVBQUVQLHVCQUF3QixDQUFDO0FBRXZFLGVBQWVBLHVCQUF1QiJ9