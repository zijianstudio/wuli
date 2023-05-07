// Copyright 2017-2022, University of Colorado Boulder

/**
 * Query parameters that are specific to the Equality Explorer sim.
 *
 * Running with ?log will print these query parameters and their values to the console.
 *
 * Running with ?dev shows the following things that are specific to this sim:
 * - red dot at the origin of each term (geometric center)
 * - red dot at the origin of each plate (geometric center)
 * - red dot at the origin of the scale (top of fulcrum)
 * - red rectangle for drag bounds on each side of the scale
 * - red horizontal line that denotes the cutoff of 'on' vs 'off' the scale, when dragging terms
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import getGameLevelsSchema from '../../../vegas/js/getGameLevelsSchema.js';
import equalityExplorer from '../equalityExplorer.js';
import EqualityExplorerConstants from './EqualityExplorerConstants.js';
const EqualityExplorerQueryParameters = QueryStringMachine.getAll({
  //----------------------------------------------------------------------------------------------------------------
  // Public-facing query parameters
  //----------------------------------------------------------------------------------------------------------------

  // Reaching this score results in a reward.
  rewardScore: {
    type: 'number',
    defaultValue: 10,
    isValidValue: value => value > 0 && Number.isInteger(value),
    public: true
  },
  //----------------------------------------------------------------------------------------------------------------
  // Internal query parameters
  //----------------------------------------------------------------------------------------------------------------

  // The levels to show in the game (Solve It!) screen.
  gameLevels: getGameLevelsSchema(EqualityExplorerConstants.NUMBER_OF_GAME_LEVELS),
  // Shows the grid on each of the plates.
  // For internal use only, not public facing.
  showGrid: {
    type: 'flag'
  },
  // Number of rows in the grid on each plate in the 'Basics', 'Numbers' and 'Variables' screens.
  // Set this to a smaller number so you can fill up the plate faster.
  // For internal use only, not public facing.
  rows: {
    type: 'number',
    defaultValue: 6,
    isValidValue: value => value > 0 && value <= 6
  },
  // Number of columns in the grid on each plate in the 'Basics', 'Numbers' and 'Variables' screens.
  // Set this to a smaller number so you can fill up the plate faster.
  // For internal use only, not public facing.
  columns: {
    type: 'number',
    defaultValue: 6,
    isValidValue: value => value > 0 && value <= 6
  },
  // Vertical offset, relative to center of plate, for when a term is considered 'above' the plate.
  // Positive y is down in scenery, so positive values are below the center of the plate.
  // For internal use only, not public facing.
  plateYOffset: {
    type: 'number',
    defaultValue: 18
  },
  // The largest absolute integer value for any numerator, denominator or constant.
  // Any operation or interaction that would exceed this value is canceled, and a dialog is shown.
  // See https://github.com/phetsims/equality-explorer/issues/48
  // For internal use only, not public facing.
  maxInteger: {
    type: 'number',
    defaultValue: 1E9,
    isValidValue: value => value > 0
  },
  // Describes a challenge that will be used throughout the Solve It! screen.
  // Used to test and debug a specific challenge, e.g. https://github.com/phetsims/equality-explorer/issues/71.
  // Format is [a1,a2,b1,b2,m1,m2,n1,n2,x] where a1/a2 x + b1/b2 = m1/m2 x + n1/n1.
  // Example: to test -7/2 x + 4 = -17 (x=6), use challenge=-7,2,4,1,0,1,-17,1,6
  // For internal use only, not public facing.
  challenge: {
    type: 'array',
    elementSchema: {
      type: 'number'
    },
    defaultValue: null,
    isValidValue: value => value === null || value.length === 9
  },
  // Turns the lock feature 'on' by default.
  // For internal use only, not public facing.
  locked: {
    type: 'flag'
  },
  // Whether the lock control is visible.  When used with the 'locked' query parameter, this is useful for keeping
  // the sim in the locked or unlocked state while memory profiling or fuzz testing.
  // For example, use ?locked&lockVisible=false to profile the sim in the locked state.
  // For internal use only, not public facing.
  lockVisible: {
    type: 'boolean',
    defaultValue: true
  }
});
equalityExplorer.register('EqualityExplorerQueryParameters', EqualityExplorerQueryParameters);

// Log query parameters
logGlobal('phet.chipper.queryParameters');
logGlobal('phet.preloads.phetio.queryParameters');
logGlobal('phet.equalityExplorer.EqualityExplorerQueryParameters');
export default EqualityExplorerQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJsb2dHbG9iYWwiLCJnZXRHYW1lTGV2ZWxzU2NoZW1hIiwiZXF1YWxpdHlFeHBsb3JlciIsIkVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMiLCJFcXVhbGl0eUV4cGxvcmVyUXVlcnlQYXJhbWV0ZXJzIiwiUXVlcnlTdHJpbmdNYWNoaW5lIiwiZ2V0QWxsIiwicmV3YXJkU2NvcmUiLCJ0eXBlIiwiZGVmYXVsdFZhbHVlIiwiaXNWYWxpZFZhbHVlIiwidmFsdWUiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJwdWJsaWMiLCJnYW1lTGV2ZWxzIiwiTlVNQkVSX09GX0dBTUVfTEVWRUxTIiwic2hvd0dyaWQiLCJyb3dzIiwiY29sdW1ucyIsInBsYXRlWU9mZnNldCIsIm1heEludGVnZXIiLCJjaGFsbGVuZ2UiLCJlbGVtZW50U2NoZW1hIiwibGVuZ3RoIiwibG9ja2VkIiwibG9ja1Zpc2libGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVxdWFsaXR5RXhwbG9yZXJRdWVyeVBhcmFtZXRlcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUXVlcnkgcGFyYW1ldGVycyB0aGF0IGFyZSBzcGVjaWZpYyB0byB0aGUgRXF1YWxpdHkgRXhwbG9yZXIgc2ltLlxyXG4gKlxyXG4gKiBSdW5uaW5nIHdpdGggP2xvZyB3aWxsIHByaW50IHRoZXNlIHF1ZXJ5IHBhcmFtZXRlcnMgYW5kIHRoZWlyIHZhbHVlcyB0byB0aGUgY29uc29sZS5cclxuICpcclxuICogUnVubmluZyB3aXRoID9kZXYgc2hvd3MgdGhlIGZvbGxvd2luZyB0aGluZ3MgdGhhdCBhcmUgc3BlY2lmaWMgdG8gdGhpcyBzaW06XHJcbiAqIC0gcmVkIGRvdCBhdCB0aGUgb3JpZ2luIG9mIGVhY2ggdGVybSAoZ2VvbWV0cmljIGNlbnRlcilcclxuICogLSByZWQgZG90IGF0IHRoZSBvcmlnaW4gb2YgZWFjaCBwbGF0ZSAoZ2VvbWV0cmljIGNlbnRlcilcclxuICogLSByZWQgZG90IGF0IHRoZSBvcmlnaW4gb2YgdGhlIHNjYWxlICh0b3Agb2YgZnVsY3J1bSlcclxuICogLSByZWQgcmVjdGFuZ2xlIGZvciBkcmFnIGJvdW5kcyBvbiBlYWNoIHNpZGUgb2YgdGhlIHNjYWxlXHJcbiAqIC0gcmVkIGhvcml6b250YWwgbGluZSB0aGF0IGRlbm90ZXMgdGhlIGN1dG9mZiBvZiAnb24nIHZzICdvZmYnIHRoZSBzY2FsZSwgd2hlbiBkcmFnZ2luZyB0ZXJtc1xyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBsb2dHbG9iYWwgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2xvZ0dsb2JhbC5qcyc7XHJcbmltcG9ydCBnZXRHYW1lTGV2ZWxzU2NoZW1hIGZyb20gJy4uLy4uLy4uL3ZlZ2FzL2pzL2dldEdhbWVMZXZlbHNTY2hlbWEuanMnO1xyXG5pbXBvcnQgZXF1YWxpdHlFeHBsb3JlciBmcm9tICcuLi9lcXVhbGl0eUV4cGxvcmVyLmpzJztcclxuaW1wb3J0IEVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMgZnJvbSAnLi9FcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzLmpzJztcclxuXHJcbmNvbnN0IEVxdWFsaXR5RXhwbG9yZXJRdWVyeVBhcmFtZXRlcnMgPSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsKCB7XHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIFB1YmxpYy1mYWNpbmcgcXVlcnkgcGFyYW1ldGVyc1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvLyBSZWFjaGluZyB0aGlzIHNjb3JlIHJlc3VsdHMgaW4gYSByZXdhcmQuXHJcbiAgcmV3YXJkU2NvcmU6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAxMCxcclxuICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gKCB2YWx1ZSA+IDAgKSAmJiBOdW1iZXIuaXNJbnRlZ2VyKCB2YWx1ZSApLFxyXG4gICAgcHVibGljOiB0cnVlXHJcbiAgfSxcclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gSW50ZXJuYWwgcXVlcnkgcGFyYW1ldGVyc1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbiAgLy8gVGhlIGxldmVscyB0byBzaG93IGluIHRoZSBnYW1lIChTb2x2ZSBJdCEpIHNjcmVlbi5cclxuICBnYW1lTGV2ZWxzOiBnZXRHYW1lTGV2ZWxzU2NoZW1hKCBFcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzLk5VTUJFUl9PRl9HQU1FX0xFVkVMUyApLFxyXG5cclxuICAvLyBTaG93cyB0aGUgZ3JpZCBvbiBlYWNoIG9mIHRoZSBwbGF0ZXMuXHJcbiAgLy8gRm9yIGludGVybmFsIHVzZSBvbmx5LCBub3QgcHVibGljIGZhY2luZy5cclxuICBzaG93R3JpZDogeyB0eXBlOiAnZmxhZycgfSxcclxuXHJcbiAgLy8gTnVtYmVyIG9mIHJvd3MgaW4gdGhlIGdyaWQgb24gZWFjaCBwbGF0ZSBpbiB0aGUgJ0Jhc2ljcycsICdOdW1iZXJzJyBhbmQgJ1ZhcmlhYmxlcycgc2NyZWVucy5cclxuICAvLyBTZXQgdGhpcyB0byBhIHNtYWxsZXIgbnVtYmVyIHNvIHlvdSBjYW4gZmlsbCB1cCB0aGUgcGxhdGUgZmFzdGVyLlxyXG4gIC8vIEZvciBpbnRlcm5hbCB1c2Ugb25seSwgbm90IHB1YmxpYyBmYWNpbmcuXHJcbiAgcm93czoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDYsXHJcbiAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+ICggdmFsdWUgPiAwICYmIHZhbHVlIDw9IDYgKVxyXG4gIH0sXHJcblxyXG4gIC8vIE51bWJlciBvZiBjb2x1bW5zIGluIHRoZSBncmlkIG9uIGVhY2ggcGxhdGUgaW4gdGhlICdCYXNpY3MnLCAnTnVtYmVycycgYW5kICdWYXJpYWJsZXMnIHNjcmVlbnMuXHJcbiAgLy8gU2V0IHRoaXMgdG8gYSBzbWFsbGVyIG51bWJlciBzbyB5b3UgY2FuIGZpbGwgdXAgdGhlIHBsYXRlIGZhc3Rlci5cclxuICAvLyBGb3IgaW50ZXJuYWwgdXNlIG9ubHksIG5vdCBwdWJsaWMgZmFjaW5nLlxyXG4gIGNvbHVtbnM6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiA2LFxyXG4gICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiAoIHZhbHVlID4gMCAmJiB2YWx1ZSA8PSA2IClcclxuICB9LFxyXG5cclxuICAvLyBWZXJ0aWNhbCBvZmZzZXQsIHJlbGF0aXZlIHRvIGNlbnRlciBvZiBwbGF0ZSwgZm9yIHdoZW4gYSB0ZXJtIGlzIGNvbnNpZGVyZWQgJ2Fib3ZlJyB0aGUgcGxhdGUuXHJcbiAgLy8gUG9zaXRpdmUgeSBpcyBkb3duIGluIHNjZW5lcnksIHNvIHBvc2l0aXZlIHZhbHVlcyBhcmUgYmVsb3cgdGhlIGNlbnRlciBvZiB0aGUgcGxhdGUuXHJcbiAgLy8gRm9yIGludGVybmFsIHVzZSBvbmx5LCBub3QgcHVibGljIGZhY2luZy5cclxuICBwbGF0ZVlPZmZzZXQ6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAxOFxyXG4gIH0sXHJcblxyXG4gIC8vIFRoZSBsYXJnZXN0IGFic29sdXRlIGludGVnZXIgdmFsdWUgZm9yIGFueSBudW1lcmF0b3IsIGRlbm9taW5hdG9yIG9yIGNvbnN0YW50LlxyXG4gIC8vIEFueSBvcGVyYXRpb24gb3IgaW50ZXJhY3Rpb24gdGhhdCB3b3VsZCBleGNlZWQgdGhpcyB2YWx1ZSBpcyBjYW5jZWxlZCwgYW5kIGEgZGlhbG9nIGlzIHNob3duLlxyXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzQ4XHJcbiAgLy8gRm9yIGludGVybmFsIHVzZSBvbmx5LCBub3QgcHVibGljIGZhY2luZy5cclxuICBtYXhJbnRlZ2VyOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogMUU5LFxyXG4gICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiAoIHZhbHVlID4gMCApXHJcbiAgfSxcclxuXHJcbiAgLy8gRGVzY3JpYmVzIGEgY2hhbGxlbmdlIHRoYXQgd2lsbCBiZSB1c2VkIHRocm91Z2hvdXQgdGhlIFNvbHZlIEl0ISBzY3JlZW4uXHJcbiAgLy8gVXNlZCB0byB0ZXN0IGFuZCBkZWJ1ZyBhIHNwZWNpZmljIGNoYWxsZW5nZSwgZS5nLiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzcxLlxyXG4gIC8vIEZvcm1hdCBpcyBbYTEsYTIsYjEsYjIsbTEsbTIsbjEsbjIseF0gd2hlcmUgYTEvYTIgeCArIGIxL2IyID0gbTEvbTIgeCArIG4xL24xLlxyXG4gIC8vIEV4YW1wbGU6IHRvIHRlc3QgLTcvMiB4ICsgNCA9IC0xNyAoeD02KSwgdXNlIGNoYWxsZW5nZT0tNywyLDQsMSwwLDEsLTE3LDEsNlxyXG4gIC8vIEZvciBpbnRlcm5hbCB1c2Ugb25seSwgbm90IHB1YmxpYyBmYWNpbmcuXHJcbiAgY2hhbGxlbmdlOiB7XHJcbiAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgZWxlbWVudFNjaGVtYToge1xyXG4gICAgICB0eXBlOiAnbnVtYmVyJ1xyXG4gICAgfSxcclxuICAgIGRlZmF1bHRWYWx1ZTogbnVsbCxcclxuICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gKCB2YWx1ZSA9PT0gbnVsbCApIHx8ICggdmFsdWUubGVuZ3RoID09PSA5IClcclxuICB9LFxyXG5cclxuICAvLyBUdXJucyB0aGUgbG9jayBmZWF0dXJlICdvbicgYnkgZGVmYXVsdC5cclxuICAvLyBGb3IgaW50ZXJuYWwgdXNlIG9ubHksIG5vdCBwdWJsaWMgZmFjaW5nLlxyXG4gIGxvY2tlZDogeyB0eXBlOiAnZmxhZycgfSxcclxuXHJcbiAgLy8gV2hldGhlciB0aGUgbG9jayBjb250cm9sIGlzIHZpc2libGUuICBXaGVuIHVzZWQgd2l0aCB0aGUgJ2xvY2tlZCcgcXVlcnkgcGFyYW1ldGVyLCB0aGlzIGlzIHVzZWZ1bCBmb3Iga2VlcGluZ1xyXG4gIC8vIHRoZSBzaW0gaW4gdGhlIGxvY2tlZCBvciB1bmxvY2tlZCBzdGF0ZSB3aGlsZSBtZW1vcnkgcHJvZmlsaW5nIG9yIGZ1enogdGVzdGluZy5cclxuICAvLyBGb3IgZXhhbXBsZSwgdXNlID9sb2NrZWQmbG9ja1Zpc2libGU9ZmFsc2UgdG8gcHJvZmlsZSB0aGUgc2ltIGluIHRoZSBsb2NrZWQgc3RhdGUuXHJcbiAgLy8gRm9yIGludGVybmFsIHVzZSBvbmx5LCBub3QgcHVibGljIGZhY2luZy5cclxuICBsb2NrVmlzaWJsZToge1xyXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgZGVmYXVsdFZhbHVlOiB0cnVlXHJcbiAgfVxyXG59ICk7XHJcblxyXG5lcXVhbGl0eUV4cGxvcmVyLnJlZ2lzdGVyKCAnRXF1YWxpdHlFeHBsb3JlclF1ZXJ5UGFyYW1ldGVycycsIEVxdWFsaXR5RXhwbG9yZXJRdWVyeVBhcmFtZXRlcnMgKTtcclxuXHJcbi8vIExvZyBxdWVyeSBwYXJhbWV0ZXJzXHJcbmxvZ0dsb2JhbCggJ3BoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMnICk7XHJcbmxvZ0dsb2JhbCggJ3BoZXQucHJlbG9hZHMucGhldGlvLnF1ZXJ5UGFyYW1ldGVycycgKTtcclxubG9nR2xvYmFsKCAncGhldC5lcXVhbGl0eUV4cGxvcmVyLkVxdWFsaXR5RXhwbG9yZXJRdWVyeVBhcmFtZXRlcnMnICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBFcXVhbGl0eUV4cGxvcmVyUXVlcnlQYXJhbWV0ZXJzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sb0NBQW9DO0FBQzFELE9BQU9DLG1CQUFtQixNQUFNLDBDQUEwQztBQUMxRSxPQUFPQyxnQkFBZ0IsTUFBTSx3QkFBd0I7QUFDckQsT0FBT0MseUJBQXlCLE1BQU0sZ0NBQWdDO0FBRXRFLE1BQU1DLCtCQUErQixHQUFHQyxrQkFBa0IsQ0FBQ0MsTUFBTSxDQUFFO0VBRWpFO0VBQ0E7RUFDQTs7RUFFQTtFQUNBQyxXQUFXLEVBQUU7SUFDWEMsSUFBSSxFQUFFLFFBQVE7SUFDZEMsWUFBWSxFQUFFLEVBQUU7SUFDaEJDLFlBQVksRUFBRUMsS0FBSyxJQUFNQSxLQUFLLEdBQUcsQ0FBQyxJQUFNQyxNQUFNLENBQUNDLFNBQVMsQ0FBRUYsS0FBTSxDQUFDO0lBQ2pFRyxNQUFNLEVBQUU7RUFDVixDQUFDO0VBRUQ7RUFDQTtFQUNBOztFQUdBO0VBQ0FDLFVBQVUsRUFBRWQsbUJBQW1CLENBQUVFLHlCQUF5QixDQUFDYSxxQkFBc0IsQ0FBQztFQUVsRjtFQUNBO0VBQ0FDLFFBQVEsRUFBRTtJQUFFVCxJQUFJLEVBQUU7RUFBTyxDQUFDO0VBRTFCO0VBQ0E7RUFDQTtFQUNBVSxJQUFJLEVBQUU7SUFDSlYsSUFBSSxFQUFFLFFBQVE7SUFDZEMsWUFBWSxFQUFFLENBQUM7SUFDZkMsWUFBWSxFQUFFQyxLQUFLLElBQU1BLEtBQUssR0FBRyxDQUFDLElBQUlBLEtBQUssSUFBSTtFQUNqRCxDQUFDO0VBRUQ7RUFDQTtFQUNBO0VBQ0FRLE9BQU8sRUFBRTtJQUNQWCxJQUFJLEVBQUUsUUFBUTtJQUNkQyxZQUFZLEVBQUUsQ0FBQztJQUNmQyxZQUFZLEVBQUVDLEtBQUssSUFBTUEsS0FBSyxHQUFHLENBQUMsSUFBSUEsS0FBSyxJQUFJO0VBQ2pELENBQUM7RUFFRDtFQUNBO0VBQ0E7RUFDQVMsWUFBWSxFQUFFO0lBQ1paLElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBRTtFQUNoQixDQUFDO0VBRUQ7RUFDQTtFQUNBO0VBQ0E7RUFDQVksVUFBVSxFQUFFO0lBQ1ZiLElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBRSxHQUFHO0lBQ2pCQyxZQUFZLEVBQUVDLEtBQUssSUFBTUEsS0FBSyxHQUFHO0VBQ25DLENBQUM7RUFFRDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0FXLFNBQVMsRUFBRTtJQUNUZCxJQUFJLEVBQUUsT0FBTztJQUNiZSxhQUFhLEVBQUU7TUFDYmYsSUFBSSxFQUFFO0lBQ1IsQ0FBQztJQUNEQyxZQUFZLEVBQUUsSUFBSTtJQUNsQkMsWUFBWSxFQUFFQyxLQUFLLElBQU1BLEtBQUssS0FBSyxJQUFJLElBQVFBLEtBQUssQ0FBQ2EsTUFBTSxLQUFLO0VBQ2xFLENBQUM7RUFFRDtFQUNBO0VBQ0FDLE1BQU0sRUFBRTtJQUFFakIsSUFBSSxFQUFFO0VBQU8sQ0FBQztFQUV4QjtFQUNBO0VBQ0E7RUFDQTtFQUNBa0IsV0FBVyxFQUFFO0lBQ1hsQixJQUFJLEVBQUUsU0FBUztJQUNmQyxZQUFZLEVBQUU7RUFDaEI7QUFDRixDQUFFLENBQUM7QUFFSFAsZ0JBQWdCLENBQUN5QixRQUFRLENBQUUsaUNBQWlDLEVBQUV2QiwrQkFBZ0MsQ0FBQzs7QUFFL0Y7QUFDQUosU0FBUyxDQUFFLDhCQUErQixDQUFDO0FBQzNDQSxTQUFTLENBQUUsc0NBQXVDLENBQUM7QUFDbkRBLFNBQVMsQ0FBRSx1REFBd0QsQ0FBQztBQUVwRSxlQUFlSSwrQkFBK0IifQ==