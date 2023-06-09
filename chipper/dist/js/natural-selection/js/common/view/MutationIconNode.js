// Copyright 2019-2022, University of Colorado Boulder

/**
 * MutationIconNode is the mutation icon that appears in the Pedigree tree and 'Add Mutations' panel.
 * It looks like a DNA helix.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { Circle, Node, Path } from '../../../../scenery/js/imports.js';
import dnaSolidShape from '../../../../sherpa/js/fontawesome-5/dnaSolidShape.js';
import naturalSelection from '../../naturalSelection.js';
export default class MutationIconNode extends Node {
  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      radius: 12
    }, providedOptions);

    // Yellow circle
    const circle = new Circle(options.radius, {
      fill: 'rgb( 250, 244, 77 )',
      stroke: 'black'
    });

    // DNA icon centered in the circle
    const icon = new Path(dnaSolidShape, {
      fill: 'black'
    });
    const scale = 0.6 * circle.height / Math.max(icon.width, icon.height);
    icon.setScaleMagnitude(scale);
    icon.center = circle.center;
    options.children = [circle, icon];
    super(options);
  }
}
naturalSelection.register('MutationIconNode', MutationIconNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJDaXJjbGUiLCJOb2RlIiwiUGF0aCIsImRuYVNvbGlkU2hhcGUiLCJuYXR1cmFsU2VsZWN0aW9uIiwiTXV0YXRpb25JY29uTm9kZSIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInJhZGl1cyIsImNpcmNsZSIsImZpbGwiLCJzdHJva2UiLCJpY29uIiwic2NhbGUiLCJoZWlnaHQiLCJNYXRoIiwibWF4Iiwid2lkdGgiLCJzZXRTY2FsZU1hZ25pdHVkZSIsImNlbnRlciIsImNoaWxkcmVuIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNdXRhdGlvbkljb25Ob2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE11dGF0aW9uSWNvbk5vZGUgaXMgdGhlIG11dGF0aW9uIGljb24gdGhhdCBhcHBlYXJzIGluIHRoZSBQZWRpZ3JlZSB0cmVlIGFuZCAnQWRkIE11dGF0aW9ucycgcGFuZWwuXHJcbiAqIEl0IGxvb2tzIGxpa2UgYSBETkEgaGVsaXguXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tPcHRpb25hbCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja09wdGlvbmFsLmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBOb2RlLCBOb2RlT3B0aW9ucywgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucywgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBkbmFTb2xpZFNoYXBlIGZyb20gJy4uLy4uLy4uLy4uL3NoZXJwYS9qcy9mb250YXdlc29tZS01L2RuYVNvbGlkU2hhcGUuanMnO1xyXG5pbXBvcnQgbmF0dXJhbFNlbGVjdGlvbiBmcm9tICcuLi8uLi9uYXR1cmFsU2VsZWN0aW9uLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgcmFkaXVzPzogbnVtYmVyO1xyXG59O1xyXG5cclxudHlwZSBNdXRhdGlvbkljb25Ob2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucyAmIFBpY2tPcHRpb25hbDxOb2RlT3B0aW9ucywgJ3BpY2thYmxlJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNdXRhdGlvbkljb25Ob2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogTXV0YXRpb25JY29uTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxNdXRhdGlvbkljb25Ob2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICByYWRpdXM6IDEyXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBZZWxsb3cgY2lyY2xlXHJcbiAgICBjb25zdCBjaXJjbGUgPSBuZXcgQ2lyY2xlKCBvcHRpb25zLnJhZGl1cywge1xyXG4gICAgICBmaWxsOiAncmdiKCAyNTAsIDI0NCwgNzcgKScsXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEROQSBpY29uIGNlbnRlcmVkIGluIHRoZSBjaXJjbGVcclxuICAgIGNvbnN0IGljb24gPSBuZXcgUGF0aCggZG5hU29saWRTaGFwZSwge1xyXG4gICAgICBmaWxsOiAnYmxhY2snXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBzY2FsZSA9ICggMC42ICogY2lyY2xlLmhlaWdodCApIC8gTWF0aC5tYXgoIGljb24ud2lkdGgsIGljb24uaGVpZ2h0ICk7XHJcbiAgICBpY29uLnNldFNjYWxlTWFnbml0dWRlKCBzY2FsZSApO1xyXG4gICAgaWNvbi5jZW50ZXIgPSBjaXJjbGUuY2VudGVyO1xyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIGNpcmNsZSwgaWNvbiBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5uYXR1cmFsU2VsZWN0aW9uLnJlZ2lzdGVyKCAnTXV0YXRpb25JY29uTm9kZScsIE11dGF0aW9uSWNvbk5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sdUNBQXVDO0FBRTdELFNBQVNDLE1BQU0sRUFBRUMsSUFBSSxFQUF1Q0MsSUFBSSxRQUFRLG1DQUFtQztBQUMzRyxPQUFPQyxhQUFhLE1BQU0sc0RBQXNEO0FBQ2hGLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQVF4RCxlQUFlLE1BQU1DLGdCQUFnQixTQUFTSixJQUFJLENBQUM7RUFFMUNLLFdBQVdBLENBQUVDLGVBQXlDLEVBQUc7SUFFOUQsTUFBTUMsT0FBTyxHQUFHVCxTQUFTLENBQW9ELENBQUMsQ0FBRTtNQUU5RTtNQUNBVSxNQUFNLEVBQUU7SUFDVixDQUFDLEVBQUVGLGVBQWdCLENBQUM7O0lBRXBCO0lBQ0EsTUFBTUcsTUFBTSxHQUFHLElBQUlWLE1BQU0sQ0FBRVEsT0FBTyxDQUFDQyxNQUFNLEVBQUU7TUFDekNFLElBQUksRUFBRSxxQkFBcUI7TUFDM0JDLE1BQU0sRUFBRTtJQUNWLENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1DLElBQUksR0FBRyxJQUFJWCxJQUFJLENBQUVDLGFBQWEsRUFBRTtNQUNwQ1EsSUFBSSxFQUFFO0lBQ1IsQ0FBRSxDQUFDO0lBQ0gsTUFBTUcsS0FBSyxHQUFLLEdBQUcsR0FBR0osTUFBTSxDQUFDSyxNQUFNLEdBQUtDLElBQUksQ0FBQ0MsR0FBRyxDQUFFSixJQUFJLENBQUNLLEtBQUssRUFBRUwsSUFBSSxDQUFDRSxNQUFPLENBQUM7SUFDM0VGLElBQUksQ0FBQ00saUJBQWlCLENBQUVMLEtBQU0sQ0FBQztJQUMvQkQsSUFBSSxDQUFDTyxNQUFNLEdBQUdWLE1BQU0sQ0FBQ1UsTUFBTTtJQUUzQlosT0FBTyxDQUFDYSxRQUFRLEdBQUcsQ0FBRVgsTUFBTSxFQUFFRyxJQUFJLENBQUU7SUFFbkMsS0FBSyxDQUFFTCxPQUFRLENBQUM7RUFDbEI7QUFDRjtBQUVBSixnQkFBZ0IsQ0FBQ2tCLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRWpCLGdCQUFpQixDQUFDIn0=