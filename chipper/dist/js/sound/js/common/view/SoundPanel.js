// Copyright 2022, University of Colorado Boulder

/**
 * Panel subclass that applies styling specific to this simulation. Copied from Wave Interference
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Panel from '../../../../sun/js/Panel.js';
import sound from '../../sound.js';
import optionize from '../../../../phet-core/js/optionize.js';
export default class SoundPanel extends Panel {
  constructor(content, providedOptions) {
    const options = optionize()({
      yMargin: 7,
      xMargin: 10,
      stroke: 'gray',
      fill: 'rgb(230,231,232)',
      cornerRadius: 6
    }, providedOptions);
    super(content, options);
  }
}
sound.register('SoundPanel', SoundPanel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYW5lbCIsInNvdW5kIiwib3B0aW9uaXplIiwiU291bmRQYW5lbCIsImNvbnN0cnVjdG9yIiwiY29udGVudCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ5TWFyZ2luIiwieE1hcmdpbiIsInN0cm9rZSIsImZpbGwiLCJjb3JuZXJSYWRpdXMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNvdW5kUGFuZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBhbmVsIHN1YmNsYXNzIHRoYXQgYXBwbGllcyBzdHlsaW5nIHNwZWNpZmljIHRvIHRoaXMgc2ltdWxhdGlvbi4gQ29waWVkIGZyb20gV2F2ZSBJbnRlcmZlcmVuY2VcclxuICpcclxuICogQGF1dGhvciBQaWV0IEdvcmlzIChVbml2ZXJzaXR5IG9mIExldXZlbilcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUGFuZWwsIHsgUGFuZWxPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBzb3VuZCBmcm9tICcuLi8uLi9zb3VuZC5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcbmV4cG9ydCB0eXBlIFNvdW5kUGFuZWxPcHRpb25zID0gUGFuZWxPcHRpb25zICYgU2VsZk9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb3VuZFBhbmVsIGV4dGVuZHMgUGFuZWwge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNvbnRlbnQ6IE5vZGUsIHByb3ZpZGVkT3B0aW9ucz86IFBhbmVsT3B0aW9ucyApIHtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U291bmRQYW5lbE9wdGlvbnMsIFNlbGZPcHRpb25zLCBQYW5lbE9wdGlvbnM+KCkoIHtcclxuICAgICAgeU1hcmdpbjogNyxcclxuICAgICAgeE1hcmdpbjogMTAsXHJcbiAgICAgIHN0cm9rZTogJ2dyYXknLFxyXG4gICAgICBmaWxsOiAncmdiKDIzMCwyMzEsMjMyKScsXHJcbiAgICAgIGNvcm5lclJhZGl1czogNlxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcbiAgICBzdXBlciggY29udGVudCwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuc291bmQucmVnaXN0ZXIoICdTb3VuZFBhbmVsJywgU291bmRQYW5lbCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBd0IsNkJBQTZCO0FBRWpFLE9BQU9DLEtBQUssTUFBTSxnQkFBZ0I7QUFDbEMsT0FBT0MsU0FBUyxNQUE0Qix1Q0FBdUM7QUFLbkYsZUFBZSxNQUFNQyxVQUFVLFNBQVNILEtBQUssQ0FBQztFQUVyQ0ksV0FBV0EsQ0FBRUMsT0FBYSxFQUFFQyxlQUE4QixFQUFHO0lBQ2xFLE1BQU1DLE9BQU8sR0FBR0wsU0FBUyxDQUErQyxDQUFDLENBQUU7TUFDekVNLE9BQU8sRUFBRSxDQUFDO01BQ1ZDLE9BQU8sRUFBRSxFQUFFO01BQ1hDLE1BQU0sRUFBRSxNQUFNO01BQ2RDLElBQUksRUFBRSxrQkFBa0I7TUFDeEJDLFlBQVksRUFBRTtJQUNoQixDQUFDLEVBQUVOLGVBQWdCLENBQUM7SUFDcEIsS0FBSyxDQUFFRCxPQUFPLEVBQUVFLE9BQVEsQ0FBQztFQUMzQjtBQUNGO0FBRUFOLEtBQUssQ0FBQ1ksUUFBUSxDQUFFLFlBQVksRUFBRVYsVUFBVyxDQUFDIn0=