// Copyright 2014-2022, University of Colorado Boulder

/**
 * Node that represents the electron shells, aka "orbits", in the view.
 *
 * @author John Blanco
 */

import Vector2 from '../../../dot/js/Vector2.js';
import merge from '../../../phet-core/js/merge.js';
import { Circle, Node } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import shred from '../shred.js';

// constants
const LINE_DASH = [4, 5];
class ElectronShellView extends Node {
  /**
   * @param {ParticleAtom} atom
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor(atom, modelViewTransform, options) {
    options = merge({
      tandem: Tandem.REQUIRED
    }, options);
    super({
      pickable: false,
      // phet-io
      tandem: options.tandem,
      // pdom
      tagName: 'div',
      ariaRole: 'listbox',
      focusable: true
    });
    const outerRing = new Circle(modelViewTransform.modelToViewDeltaX(atom.outerElectronShellRadius), {
      stroke: 'blue',
      lineWidth: 1.5,
      lineDash: LINE_DASH,
      translation: modelViewTransform.modelToViewPosition(Vector2.ZERO),
      pickable: false,
      tandem: options.tandem.createTandem('outerRing'),
      // pdom
      tagName: 'div',
      ariaRole: 'option',
      innerContent: 'Outer Electron Ring'
    });
    this.addChild(outerRing);
    const innerRing = new Circle(modelViewTransform.modelToViewDeltaX(atom.innerElectronShellRadius), {
      stroke: 'blue',
      lineWidth: 1.5,
      lineDash: LINE_DASH,
      translation: modelViewTransform.modelToViewPosition(Vector2.ZERO),
      pickable: false,
      tandem: options.tandem.createTandem('innerRing'),
      //a11y
      tagName: 'div',
      ariaRole: 'option',
      innerContent: 'Inner Electron Ring'
    });
    this.addChild(innerRing);

    // @private called by dispose
    this.disposeElectronShellView = () => {
      outerRing.dispose();
      innerRing.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeElectronShellView();
    super.dispose();
  }
}
shred.register('ElectronShellView', ElectronShellView);
export default ElectronShellView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwibWVyZ2UiLCJDaXJjbGUiLCJOb2RlIiwiVGFuZGVtIiwic2hyZWQiLCJMSU5FX0RBU0giLCJFbGVjdHJvblNoZWxsVmlldyIsImNvbnN0cnVjdG9yIiwiYXRvbSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsIm9wdGlvbnMiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInBpY2thYmxlIiwidGFnTmFtZSIsImFyaWFSb2xlIiwiZm9jdXNhYmxlIiwib3V0ZXJSaW5nIiwibW9kZWxUb1ZpZXdEZWx0YVgiLCJvdXRlckVsZWN0cm9uU2hlbGxSYWRpdXMiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJsaW5lRGFzaCIsInRyYW5zbGF0aW9uIiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsIlpFUk8iLCJjcmVhdGVUYW5kZW0iLCJpbm5lckNvbnRlbnQiLCJhZGRDaGlsZCIsImlubmVyUmluZyIsImlubmVyRWxlY3Ryb25TaGVsbFJhZGl1cyIsImRpc3Bvc2VFbGVjdHJvblNoZWxsVmlldyIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVsZWN0cm9uU2hlbGxWaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE5vZGUgdGhhdCByZXByZXNlbnRzIHRoZSBlbGVjdHJvbiBzaGVsbHMsIGFrYSBcIm9yYml0c1wiLCBpbiB0aGUgdmlldy5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IENpcmNsZSwgTm9kZSB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBzaHJlZCBmcm9tICcuLi9zaHJlZC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTElORV9EQVNIID0gWyA0LCA1IF07XHJcblxyXG5jbGFzcyBFbGVjdHJvblNoZWxsVmlldyBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1BhcnRpY2xlQXRvbX0gYXRvbVxyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBhdG9tLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgcGlja2FibGU6IGZhbHNlLFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLFxyXG5cclxuICAgICAgLy8gcGRvbVxyXG4gICAgICB0YWdOYW1lOiAnZGl2JyxcclxuICAgICAgYXJpYVJvbGU6ICdsaXN0Ym94JyxcclxuICAgICAgZm9jdXNhYmxlOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgb3V0ZXJSaW5nID0gbmV3IENpcmNsZSggbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBhdG9tLm91dGVyRWxlY3Ryb25TaGVsbFJhZGl1cyApLCB7XHJcbiAgICAgIHN0cm9rZTogJ2JsdWUnLFxyXG4gICAgICBsaW5lV2lkdGg6IDEuNSxcclxuICAgICAgbGluZURhc2g6IExJTkVfREFTSCxcclxuICAgICAgdHJhbnNsYXRpb246IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBWZWN0b3IyLlpFUk8gKSxcclxuICAgICAgcGlja2FibGU6IGZhbHNlLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ291dGVyUmluZycgKSxcclxuXHJcbiAgICAgIC8vIHBkb21cclxuICAgICAgdGFnTmFtZTogJ2RpdicsXHJcbiAgICAgIGFyaWFSb2xlOiAnb3B0aW9uJyxcclxuICAgICAgaW5uZXJDb250ZW50OiAnT3V0ZXIgRWxlY3Ryb24gUmluZydcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG91dGVyUmluZyApO1xyXG5cclxuICAgIGNvbnN0IGlubmVyUmluZyA9IG5ldyBDaXJjbGUoIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWCggYXRvbS5pbm5lckVsZWN0cm9uU2hlbGxSYWRpdXMgKSwge1xyXG4gICAgICBzdHJva2U6ICdibHVlJyxcclxuICAgICAgbGluZVdpZHRoOiAxLjUsXHJcbiAgICAgIGxpbmVEYXNoOiBMSU5FX0RBU0gsXHJcbiAgICAgIHRyYW5zbGF0aW9uOiBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggVmVjdG9yMi5aRVJPICksXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbm5lclJpbmcnICksXHJcblxyXG4gICAgICAvL2ExMXlcclxuICAgICAgdGFnTmFtZTogJ2RpdicsXHJcbiAgICAgIGFyaWFSb2xlOiAnb3B0aW9uJyxcclxuICAgICAgaW5uZXJDb250ZW50OiAnSW5uZXIgRWxlY3Ryb24gUmluZydcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGlubmVyUmluZyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIGNhbGxlZCBieSBkaXNwb3NlXHJcbiAgICB0aGlzLmRpc3Bvc2VFbGVjdHJvblNoZWxsVmlldyA9ICgpID0+IHtcclxuICAgICAgb3V0ZXJSaW5nLmRpc3Bvc2UoKTtcclxuICAgICAgaW5uZXJSaW5nLmRpc3Bvc2UoKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGlzcG9zZUVsZWN0cm9uU2hlbGxWaWV3KCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5zaHJlZC5yZWdpc3RlciggJ0VsZWN0cm9uU2hlbGxWaWV3JywgRWxlY3Ryb25TaGVsbFZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgRWxlY3Ryb25TaGVsbFZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxTQUFTQyxNQUFNLEVBQUVDLElBQUksUUFBUSxnQ0FBZ0M7QUFDN0QsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxLQUFLLE1BQU0sYUFBYTs7QUFFL0I7QUFDQSxNQUFNQyxTQUFTLEdBQUcsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFO0FBRTFCLE1BQU1DLGlCQUFpQixTQUFTSixJQUFJLENBQUM7RUFFbkM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFSyxXQUFXQSxDQUFFQyxJQUFJLEVBQUVDLGtCQUFrQixFQUFFQyxPQUFPLEVBQUc7SUFFL0NBLE9BQU8sR0FBR1YsS0FBSyxDQUFFO01BQ2ZXLE1BQU0sRUFBRVIsTUFBTSxDQUFDUztJQUNqQixDQUFDLEVBQUVGLE9BQVEsQ0FBQztJQUVaLEtBQUssQ0FBRTtNQUNMRyxRQUFRLEVBQUUsS0FBSztNQUVmO01BQ0FGLE1BQU0sRUFBRUQsT0FBTyxDQUFDQyxNQUFNO01BRXRCO01BQ0FHLE9BQU8sRUFBRSxLQUFLO01BQ2RDLFFBQVEsRUFBRSxTQUFTO01BQ25CQyxTQUFTLEVBQUU7SUFDYixDQUFFLENBQUM7SUFFSCxNQUFNQyxTQUFTLEdBQUcsSUFBSWhCLE1BQU0sQ0FBRVEsa0JBQWtCLENBQUNTLGlCQUFpQixDQUFFVixJQUFJLENBQUNXLHdCQUF5QixDQUFDLEVBQUU7TUFDbkdDLE1BQU0sRUFBRSxNQUFNO01BQ2RDLFNBQVMsRUFBRSxHQUFHO01BQ2RDLFFBQVEsRUFBRWpCLFNBQVM7TUFDbkJrQixXQUFXLEVBQUVkLGtCQUFrQixDQUFDZSxtQkFBbUIsQ0FBRXpCLE9BQU8sQ0FBQzBCLElBQUssQ0FBQztNQUNuRVosUUFBUSxFQUFFLEtBQUs7TUFDZkYsTUFBTSxFQUFFRCxPQUFPLENBQUNDLE1BQU0sQ0FBQ2UsWUFBWSxDQUFFLFdBQVksQ0FBQztNQUVsRDtNQUNBWixPQUFPLEVBQUUsS0FBSztNQUNkQyxRQUFRLEVBQUUsUUFBUTtNQUNsQlksWUFBWSxFQUFFO0lBQ2hCLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ0MsUUFBUSxDQUFFWCxTQUFVLENBQUM7SUFFMUIsTUFBTVksU0FBUyxHQUFHLElBQUk1QixNQUFNLENBQUVRLGtCQUFrQixDQUFDUyxpQkFBaUIsQ0FBRVYsSUFBSSxDQUFDc0Isd0JBQXlCLENBQUMsRUFBRTtNQUNuR1YsTUFBTSxFQUFFLE1BQU07TUFDZEMsU0FBUyxFQUFFLEdBQUc7TUFDZEMsUUFBUSxFQUFFakIsU0FBUztNQUNuQmtCLFdBQVcsRUFBRWQsa0JBQWtCLENBQUNlLG1CQUFtQixDQUFFekIsT0FBTyxDQUFDMEIsSUFBSyxDQUFDO01BQ25FWixRQUFRLEVBQUUsS0FBSztNQUNmRixNQUFNLEVBQUVELE9BQU8sQ0FBQ0MsTUFBTSxDQUFDZSxZQUFZLENBQUUsV0FBWSxDQUFDO01BRWxEO01BQ0FaLE9BQU8sRUFBRSxLQUFLO01BQ2RDLFFBQVEsRUFBRSxRQUFRO01BQ2xCWSxZQUFZLEVBQUU7SUFDaEIsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDQyxRQUFRLENBQUVDLFNBQVUsQ0FBQzs7SUFFMUI7SUFDQSxJQUFJLENBQUNFLHdCQUF3QixHQUFHLE1BQU07TUFDcENkLFNBQVMsQ0FBQ2UsT0FBTyxDQUFDLENBQUM7TUFDbkJILFNBQVMsQ0FBQ0csT0FBTyxDQUFDLENBQUM7SUFDckIsQ0FBQztFQUNIOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VBLE9BQU9BLENBQUEsRUFBRztJQUNSLElBQUksQ0FBQ0Qsd0JBQXdCLENBQUMsQ0FBQztJQUMvQixLQUFLLENBQUNDLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQTVCLEtBQUssQ0FBQzZCLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRTNCLGlCQUFrQixDQUFDO0FBQ3hELGVBQWVBLGlCQUFpQiJ9