// Copyright 2019-2022, University of Colorado Boulder

/**
 * Enumeration of the possible 'styles' to display component vectors.
 *
 * @author Brandon Li
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import vectorAddition from '../../vectorAddition.js';
export default class ComponentVectorStyles extends EnumerationValue {
  // Component vectors are not displayed at all
  static INVISIBLE = new ComponentVectorStyles();

  // Component vectors are displayed tip to tail, such that the component vectors
  // align to create a right triangle with the original vector
  static TRIANGLE = new ComponentVectorStyles();

  // Component vectors' initial points and the original vector's initial points coincide
  static PARALLELOGRAM = new ComponentVectorStyles();

  // Component vectors are displayed as projections on the x and y axes
  static PROJECTION = new ComponentVectorStyles();
  static enumeration = new Enumeration(ComponentVectorStyles);
}
vectorAddition.register('ComponentVectorStyles', ComponentVectorStyles);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJ2ZWN0b3JBZGRpdGlvbiIsIkNvbXBvbmVudFZlY3RvclN0eWxlcyIsIklOVklTSUJMRSIsIlRSSUFOR0xFIiwiUEFSQUxMRUxPR1JBTSIsIlBST0pFQ1RJT04iLCJlbnVtZXJhdGlvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ29tcG9uZW50VmVjdG9yU3R5bGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEVudW1lcmF0aW9uIG9mIHRoZSBwb3NzaWJsZSAnc3R5bGVzJyB0byBkaXNwbGF5IGNvbXBvbmVudCB2ZWN0b3JzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEJyYW5kb24gTGlcclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uVmFsdWUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uVmFsdWUuanMnO1xyXG5pbXBvcnQgdmVjdG9yQWRkaXRpb24gZnJvbSAnLi4vLi4vdmVjdG9yQWRkaXRpb24uanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tcG9uZW50VmVjdG9yU3R5bGVzIGV4dGVuZHMgRW51bWVyYXRpb25WYWx1ZSB7XHJcblxyXG4gIC8vIENvbXBvbmVudCB2ZWN0b3JzIGFyZSBub3QgZGlzcGxheWVkIGF0IGFsbFxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSU5WSVNJQkxFID0gbmV3IENvbXBvbmVudFZlY3RvclN0eWxlcygpO1xyXG5cclxuICAvLyBDb21wb25lbnQgdmVjdG9ycyBhcmUgZGlzcGxheWVkIHRpcCB0byB0YWlsLCBzdWNoIHRoYXQgdGhlIGNvbXBvbmVudCB2ZWN0b3JzXHJcbiAgLy8gYWxpZ24gdG8gY3JlYXRlIGEgcmlnaHQgdHJpYW5nbGUgd2l0aCB0aGUgb3JpZ2luYWwgdmVjdG9yXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBUUklBTkdMRSA9IG5ldyBDb21wb25lbnRWZWN0b3JTdHlsZXMoKTtcclxuXHJcbiAgLy8gQ29tcG9uZW50IHZlY3RvcnMnIGluaXRpYWwgcG9pbnRzIGFuZCB0aGUgb3JpZ2luYWwgdmVjdG9yJ3MgaW5pdGlhbCBwb2ludHMgY29pbmNpZGVcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFBBUkFMTEVMT0dSQU0gPSBuZXcgQ29tcG9uZW50VmVjdG9yU3R5bGVzKCk7XHJcblxyXG4gIC8vIENvbXBvbmVudCB2ZWN0b3JzIGFyZSBkaXNwbGF5ZWQgYXMgcHJvamVjdGlvbnMgb24gdGhlIHggYW5kIHkgYXhlc1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUFJPSkVDVElPTiA9IG5ldyBDb21wb25lbnRWZWN0b3JTdHlsZXMoKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBlbnVtZXJhdGlvbiA9IG5ldyBFbnVtZXJhdGlvbiggQ29tcG9uZW50VmVjdG9yU3R5bGVzICk7XHJcbn1cclxuXHJcbnZlY3RvckFkZGl0aW9uLnJlZ2lzdGVyKCAnQ29tcG9uZW50VmVjdG9yU3R5bGVzJywgQ29tcG9uZW50VmVjdG9yU3R5bGVzICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsZ0JBQWdCLE1BQU0sOENBQThDO0FBQzNFLE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFFcEQsZUFBZSxNQUFNQyxxQkFBcUIsU0FBU0YsZ0JBQWdCLENBQUM7RUFFbEU7RUFDQSxPQUF1QkcsU0FBUyxHQUFHLElBQUlELHFCQUFxQixDQUFDLENBQUM7O0VBRTlEO0VBQ0E7RUFDQSxPQUF1QkUsUUFBUSxHQUFHLElBQUlGLHFCQUFxQixDQUFDLENBQUM7O0VBRTdEO0VBQ0EsT0FBdUJHLGFBQWEsR0FBRyxJQUFJSCxxQkFBcUIsQ0FBQyxDQUFDOztFQUVsRTtFQUNBLE9BQXVCSSxVQUFVLEdBQUcsSUFBSUoscUJBQXFCLENBQUMsQ0FBQztFQUUvRCxPQUF1QkssV0FBVyxHQUFHLElBQUlSLFdBQVcsQ0FBRUcscUJBQXNCLENBQUM7QUFDL0U7QUFFQUQsY0FBYyxDQUFDTyxRQUFRLENBQUUsdUJBQXVCLEVBQUVOLHFCQUFzQixDQUFDIn0=