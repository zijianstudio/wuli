// Copyright 2021, University of Colorado Boulder

/**
 * Query parameters supported by the normal-modes simulation.
 * Running with ?log will print these query parameters and their values to the console at startup.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import normalModes from '../normalModes.js';
const NormalModesQueryParameters = QueryStringMachine.getAll({
  //----------------------------------------------------------------------------------------------------------------
  // Public-facing query parameters
  //----------------------------------------------------------------------------------------------------------------

  //----------------------------------------------------------------------------------------------------------------
  // Internal query parameters
  //----------------------------------------------------------------------------------------------------------------

  // Adjusts the height of the dragBounds for masses in the 'One Dimension' screen.
  // See https://github.com/phetsims/normal-modes/issues/68
  dragBoundsHeight1D: {
    type: 'number',
    defaultValue: 100,
    isValidValue: value => value > 0
  },
  // Draws the drag bounds for masses in the 'One Dimension' screen as a red rectangle.
  showDragBounds1D: {
    type: 'flag'
  }
});
normalModes.register('NormalModesQueryParameters', NormalModesQueryParameters);

// Log query parameters
logGlobal('phet.chipper.queryParameters');
logGlobal('phet.preloads.phetio.queryParameters');
logGlobal('phet.normalModes.NormalModesQueryParameters');
export default NormalModesQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJsb2dHbG9iYWwiLCJub3JtYWxNb2RlcyIsIk5vcm1hbE1vZGVzUXVlcnlQYXJhbWV0ZXJzIiwiUXVlcnlTdHJpbmdNYWNoaW5lIiwiZ2V0QWxsIiwiZHJhZ0JvdW5kc0hlaWdodDFEIiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImlzVmFsaWRWYWx1ZSIsInZhbHVlIiwic2hvd0RyYWdCb3VuZHMxRCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTm9ybWFsTW9kZXNRdWVyeVBhcmFtZXRlcnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFF1ZXJ5IHBhcmFtZXRlcnMgc3VwcG9ydGVkIGJ5IHRoZSBub3JtYWwtbW9kZXMgc2ltdWxhdGlvbi5cclxuICogUnVubmluZyB3aXRoID9sb2cgd2lsbCBwcmludCB0aGVzZSBxdWVyeSBwYXJhbWV0ZXJzIGFuZCB0aGVpciB2YWx1ZXMgdG8gdGhlIGNvbnNvbGUgYXQgc3RhcnR1cC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgbG9nR2xvYmFsIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9sb2dHbG9iYWwuanMnO1xyXG5pbXBvcnQgbm9ybWFsTW9kZXMgZnJvbSAnLi4vbm9ybWFsTW9kZXMuanMnO1xyXG5cclxuY29uc3QgTm9ybWFsTW9kZXNRdWVyeVBhcmFtZXRlcnMgPSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsKCB7XHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIFB1YmxpYy1mYWNpbmcgcXVlcnkgcGFyYW1ldGVyc1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBJbnRlcm5hbCBxdWVyeSBwYXJhbWV0ZXJzXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8vIEFkanVzdHMgdGhlIGhlaWdodCBvZiB0aGUgZHJhZ0JvdW5kcyBmb3IgbWFzc2VzIGluIHRoZSAnT25lIERpbWVuc2lvbicgc2NyZWVuLlxyXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbm9ybWFsLW1vZGVzL2lzc3Vlcy82OFxyXG4gIGRyYWdCb3VuZHNIZWlnaHQxRDoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDEwMCxcclxuICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gKCB2YWx1ZSA+IDAgKVxyXG4gIH0sXHJcblxyXG4gIC8vIERyYXdzIHRoZSBkcmFnIGJvdW5kcyBmb3IgbWFzc2VzIGluIHRoZSAnT25lIERpbWVuc2lvbicgc2NyZWVuIGFzIGEgcmVkIHJlY3RhbmdsZS5cclxuICBzaG93RHJhZ0JvdW5kczFEOiB7XHJcbiAgICB0eXBlOiAnZmxhZydcclxuICB9XHJcbn0gKTtcclxuXHJcbm5vcm1hbE1vZGVzLnJlZ2lzdGVyKCAnTm9ybWFsTW9kZXNRdWVyeVBhcmFtZXRlcnMnLCBOb3JtYWxNb2Rlc1F1ZXJ5UGFyYW1ldGVycyApO1xyXG5cclxuLy8gTG9nIHF1ZXJ5IHBhcmFtZXRlcnNcclxubG9nR2xvYmFsKCAncGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycycgKTtcclxubG9nR2xvYmFsKCAncGhldC5wcmVsb2Fkcy5waGV0aW8ucXVlcnlQYXJhbWV0ZXJzJyApO1xyXG5sb2dHbG9iYWwoICdwaGV0Lm5vcm1hbE1vZGVzLk5vcm1hbE1vZGVzUXVlcnlQYXJhbWV0ZXJzJyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTm9ybWFsTW9kZXNRdWVyeVBhcmFtZXRlcnM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLG9DQUFvQztBQUMxRCxPQUFPQyxXQUFXLE1BQU0sbUJBQW1CO0FBRTNDLE1BQU1DLDBCQUEwQixHQUFHQyxrQkFBa0IsQ0FBQ0MsTUFBTSxDQUFFO0VBRTVEO0VBQ0E7RUFDQTs7RUFFQTtFQUNBO0VBQ0E7O0VBRUE7RUFDQTtFQUNBQyxrQkFBa0IsRUFBRTtJQUNsQkMsSUFBSSxFQUFFLFFBQVE7SUFDZEMsWUFBWSxFQUFFLEdBQUc7SUFDakJDLFlBQVksRUFBRUMsS0FBSyxJQUFNQSxLQUFLLEdBQUc7RUFDbkMsQ0FBQztFQUVEO0VBQ0FDLGdCQUFnQixFQUFFO0lBQ2hCSixJQUFJLEVBQUU7RUFDUjtBQUNGLENBQUUsQ0FBQztBQUVITCxXQUFXLENBQUNVLFFBQVEsQ0FBRSw0QkFBNEIsRUFBRVQsMEJBQTJCLENBQUM7O0FBRWhGO0FBQ0FGLFNBQVMsQ0FBRSw4QkFBK0IsQ0FBQztBQUMzQ0EsU0FBUyxDQUFFLHNDQUF1QyxDQUFDO0FBQ25EQSxTQUFTLENBQUUsNkNBQThDLENBQUM7QUFFMUQsZUFBZUUsMEJBQTBCIn0=