// Copyright 2020-2021, University of Colorado Boulder

/**
 * Colors used in this simulation.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 * @author Franco Barpp Gomes (UTFPR)
 */

import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import { Color } from '../../../scenery/js/imports.js';
import normalModes from '../normalModes.js';

// Colors that are used as the base for other colors
const ARROW_FILL = 'rgb( 255, 255, 0 )';
const MASS_FILL = '#007bff';
const WALL_FILL = '#333';
const NormalModesColors = {
  SCREEN_BACKGROUND: 'white',
  // Colors for the play button (based on waves on a string sim)
  BLUE_BUTTON_UP_COLOR: new Color('hsl( 210, 70%, 75% )'),
  BLUE_BUTTON_OVER_COLOR: new Color('hsl( 210, 90%, 80% )'),
  BLUE_BUTTON_DISABLED_COLOR: new Color('rgb( 180, 180, 180 )'),
  BLUE_BUTTON_DOWN_COLOR: new Color('hsl( 210, 80%, 70% )'),
  BLUE_BUTTON_BORDER_0: new Color('transparent'),
  BLUE_BUTTON_BORDER_1: new Color('transparent'),
  // Color scheme for panels in the whole sim
  PANEL_COLORS: {
    stroke: 'rgb( 190, 190, 190 )',
    fill: 'rgb( 240, 240, 240 )'
  },
  // The colors for the arrows in the masses
  ARROW_COLORS: {
    fill: ARROW_FILL,
    stroke: Color.toColor(ARROW_FILL).colorUtilsDarker(0.6)
  },
  // The colors of the 2D amplitude selectors
  SELECTOR_HORIZONTAL_FILL: 'rgb( 0, 255, 255 )',
  SELECTOR_VERTICAL_FILL: 'rgb( 0, 0, 255 )',
  BACKGROUND_RECTANGLE_DEFAULT_FILL: Color.toColor('rgb( 0, 0, 0 )').colorUtilsBrighter(0.6),
  MASS_COLORS: {
    fill: MASS_FILL,
    stroke: Color.toColor(MASS_FILL).colorUtilsDarker(0.6)
  },
  WALL_COLORS: {
    fill: WALL_FILL,
    stroke: Color.toColor(WALL_FILL).colorUtilsDarker(0.5)
  },
  BUTTON_COLORS: {
    baseColor: 'hsl( 210, 0%, 85% )',
    stroke: '#202020'
  },
  // Used in the AmplitudeDirectionRadioButtonGroup arrows
  AXES_ARROW_FILL: 'black',
  SPRING_STROKE: PhetColorScheme.RED_COLORBLIND,
  MODE_GRAPH_COLORS: {
    strokeColor: 'blue',
    referenceLineStrokeColor: 'black',
    wallColor: 'black'
  },
  // Used in the NormalModeSpectrumAccordionBox
  SEPARATOR_STROKE: 'gray'
};
normalModes.register('NormalModesColors', NormalModesColors);
export default NormalModesColors;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Q29sb3JTY2hlbWUiLCJDb2xvciIsIm5vcm1hbE1vZGVzIiwiQVJST1dfRklMTCIsIk1BU1NfRklMTCIsIldBTExfRklMTCIsIk5vcm1hbE1vZGVzQ29sb3JzIiwiU0NSRUVOX0JBQ0tHUk9VTkQiLCJCTFVFX0JVVFRPTl9VUF9DT0xPUiIsIkJMVUVfQlVUVE9OX09WRVJfQ09MT1IiLCJCTFVFX0JVVFRPTl9ESVNBQkxFRF9DT0xPUiIsIkJMVUVfQlVUVE9OX0RPV05fQ09MT1IiLCJCTFVFX0JVVFRPTl9CT1JERVJfMCIsIkJMVUVfQlVUVE9OX0JPUkRFUl8xIiwiUEFORUxfQ09MT1JTIiwic3Ryb2tlIiwiZmlsbCIsIkFSUk9XX0NPTE9SUyIsInRvQ29sb3IiLCJjb2xvclV0aWxzRGFya2VyIiwiU0VMRUNUT1JfSE9SSVpPTlRBTF9GSUxMIiwiU0VMRUNUT1JfVkVSVElDQUxfRklMTCIsIkJBQ0tHUk9VTkRfUkVDVEFOR0xFX0RFRkFVTFRfRklMTCIsImNvbG9yVXRpbHNCcmlnaHRlciIsIk1BU1NfQ09MT1JTIiwiV0FMTF9DT0xPUlMiLCJCVVRUT05fQ09MT1JTIiwiYmFzZUNvbG9yIiwiQVhFU19BUlJPV19GSUxMIiwiU1BSSU5HX1NUUk9LRSIsIlJFRF9DT0xPUkJMSU5EIiwiTU9ERV9HUkFQSF9DT0xPUlMiLCJzdHJva2VDb2xvciIsInJlZmVyZW5jZUxpbmVTdHJva2VDb2xvciIsIndhbGxDb2xvciIsIlNFUEFSQVRPUl9TVFJPS0UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk5vcm1hbE1vZGVzQ29sb3JzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbG9ycyB1c2VkIGluIHRoaXMgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBUaGlhZ28gZGUgTWVuZG9uw6dhIE1pbGRlbWJlcmdlciAoVVRGUFIpXHJcbiAqIEBhdXRob3IgRnJhbmNvIEJhcnBwIEdvbWVzIChVVEZQUilcclxuICovXHJcblxyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBub3JtYWxNb2RlcyBmcm9tICcuLi9ub3JtYWxNb2Rlcy5qcyc7XHJcblxyXG4vLyBDb2xvcnMgdGhhdCBhcmUgdXNlZCBhcyB0aGUgYmFzZSBmb3Igb3RoZXIgY29sb3JzXHJcbmNvbnN0IEFSUk9XX0ZJTEwgPSAncmdiKCAyNTUsIDI1NSwgMCApJztcclxuY29uc3QgTUFTU19GSUxMID0gJyMwMDdiZmYnO1xyXG5jb25zdCBXQUxMX0ZJTEwgPSAnIzMzMyc7XHJcblxyXG5jb25zdCBOb3JtYWxNb2Rlc0NvbG9ycyA9IHtcclxuXHJcbiAgU0NSRUVOX0JBQ0tHUk9VTkQ6ICd3aGl0ZScsXHJcblxyXG4gIC8vIENvbG9ycyBmb3IgdGhlIHBsYXkgYnV0dG9uIChiYXNlZCBvbiB3YXZlcyBvbiBhIHN0cmluZyBzaW0pXHJcbiAgQkxVRV9CVVRUT05fVVBfQ09MT1I6IG5ldyBDb2xvciggJ2hzbCggMjEwLCA3MCUsIDc1JSApJyApLFxyXG4gIEJMVUVfQlVUVE9OX09WRVJfQ09MT1I6IG5ldyBDb2xvciggJ2hzbCggMjEwLCA5MCUsIDgwJSApJyApLFxyXG4gIEJMVUVfQlVUVE9OX0RJU0FCTEVEX0NPTE9SOiBuZXcgQ29sb3IoICdyZ2IoIDE4MCwgMTgwLCAxODAgKScgKSxcclxuICBCTFVFX0JVVFRPTl9ET1dOX0NPTE9SOiBuZXcgQ29sb3IoICdoc2woIDIxMCwgODAlLCA3MCUgKScgKSxcclxuICBCTFVFX0JVVFRPTl9CT1JERVJfMDogbmV3IENvbG9yKCAndHJhbnNwYXJlbnQnICksXHJcbiAgQkxVRV9CVVRUT05fQk9SREVSXzE6IG5ldyBDb2xvciggJ3RyYW5zcGFyZW50JyApLFxyXG5cclxuICAvLyBDb2xvciBzY2hlbWUgZm9yIHBhbmVscyBpbiB0aGUgd2hvbGUgc2ltXHJcbiAgUEFORUxfQ09MT1JTOiB7XHJcbiAgICBzdHJva2U6ICdyZ2IoIDE5MCwgMTkwLCAxOTAgKScsXHJcbiAgICBmaWxsOiAncmdiKCAyNDAsIDI0MCwgMjQwICknXHJcbiAgfSxcclxuXHJcbiAgLy8gVGhlIGNvbG9ycyBmb3IgdGhlIGFycm93cyBpbiB0aGUgbWFzc2VzXHJcbiAgQVJST1dfQ09MT1JTOiB7XHJcbiAgICBmaWxsOiBBUlJPV19GSUxMLFxyXG4gICAgc3Ryb2tlOiBDb2xvci50b0NvbG9yKCBBUlJPV19GSUxMICkuY29sb3JVdGlsc0RhcmtlciggMC42IClcclxuICB9LFxyXG5cclxuICAvLyBUaGUgY29sb3JzIG9mIHRoZSAyRCBhbXBsaXR1ZGUgc2VsZWN0b3JzXHJcbiAgU0VMRUNUT1JfSE9SSVpPTlRBTF9GSUxMOiAncmdiKCAwLCAyNTUsIDI1NSApJyxcclxuICBTRUxFQ1RPUl9WRVJUSUNBTF9GSUxMOiAncmdiKCAwLCAwLCAyNTUgKScsXHJcbiAgQkFDS0dST1VORF9SRUNUQU5HTEVfREVGQVVMVF9GSUxMOiBDb2xvci50b0NvbG9yKCAncmdiKCAwLCAwLCAwICknICkuY29sb3JVdGlsc0JyaWdodGVyKCAwLjYgKSxcclxuXHJcbiAgTUFTU19DT0xPUlM6IHtcclxuICAgIGZpbGw6IE1BU1NfRklMTCxcclxuICAgIHN0cm9rZTogQ29sb3IudG9Db2xvciggTUFTU19GSUxMICkuY29sb3JVdGlsc0RhcmtlciggMC42IClcclxuICB9LFxyXG5cclxuICBXQUxMX0NPTE9SUzoge1xyXG4gICAgZmlsbDogV0FMTF9GSUxMLFxyXG4gICAgc3Ryb2tlOiBDb2xvci50b0NvbG9yKCBXQUxMX0ZJTEwgKS5jb2xvclV0aWxzRGFya2VyKCAwLjUgKVxyXG4gIH0sXHJcblxyXG4gIEJVVFRPTl9DT0xPUlM6IHtcclxuICAgIGJhc2VDb2xvcjogJ2hzbCggMjEwLCAwJSwgODUlICknLFxyXG4gICAgc3Ryb2tlOiAnIzIwMjAyMCdcclxuICB9LFxyXG5cclxuICAvLyBVc2VkIGluIHRoZSBBbXBsaXR1ZGVEaXJlY3Rpb25SYWRpb0J1dHRvbkdyb3VwIGFycm93c1xyXG4gIEFYRVNfQVJST1dfRklMTDogJ2JsYWNrJyxcclxuXHJcbiAgU1BSSU5HX1NUUk9LRTogUGhldENvbG9yU2NoZW1lLlJFRF9DT0xPUkJMSU5ELFxyXG5cclxuICBNT0RFX0dSQVBIX0NPTE9SUzoge1xyXG4gICAgc3Ryb2tlQ29sb3I6ICdibHVlJyxcclxuICAgIHJlZmVyZW5jZUxpbmVTdHJva2VDb2xvcjogJ2JsYWNrJyxcclxuICAgIHdhbGxDb2xvcjogJ2JsYWNrJ1xyXG4gIH0sXHJcblxyXG4gIC8vIFVzZWQgaW4gdGhlIE5vcm1hbE1vZGVTcGVjdHJ1bUFjY29yZGlvbkJveFxyXG4gIFNFUEFSQVRPUl9TVFJPS0U6ICdncmF5J1xyXG59O1xyXG5cclxubm9ybWFsTW9kZXMucmVnaXN0ZXIoICdOb3JtYWxNb2Rlc0NvbG9ycycsIE5vcm1hbE1vZGVzQ29sb3JzICk7XHJcbmV4cG9ydCBkZWZhdWx0IE5vcm1hbE1vZGVzQ29sb3JzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSw2Q0FBNkM7QUFDekUsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxXQUFXLE1BQU0sbUJBQW1COztBQUUzQztBQUNBLE1BQU1DLFVBQVUsR0FBRyxvQkFBb0I7QUFDdkMsTUFBTUMsU0FBUyxHQUFHLFNBQVM7QUFDM0IsTUFBTUMsU0FBUyxHQUFHLE1BQU07QUFFeEIsTUFBTUMsaUJBQWlCLEdBQUc7RUFFeEJDLGlCQUFpQixFQUFFLE9BQU87RUFFMUI7RUFDQUMsb0JBQW9CLEVBQUUsSUFBSVAsS0FBSyxDQUFFLHNCQUF1QixDQUFDO0VBQ3pEUSxzQkFBc0IsRUFBRSxJQUFJUixLQUFLLENBQUUsc0JBQXVCLENBQUM7RUFDM0RTLDBCQUEwQixFQUFFLElBQUlULEtBQUssQ0FBRSxzQkFBdUIsQ0FBQztFQUMvRFUsc0JBQXNCLEVBQUUsSUFBSVYsS0FBSyxDQUFFLHNCQUF1QixDQUFDO0VBQzNEVyxvQkFBb0IsRUFBRSxJQUFJWCxLQUFLLENBQUUsYUFBYyxDQUFDO0VBQ2hEWSxvQkFBb0IsRUFBRSxJQUFJWixLQUFLLENBQUUsYUFBYyxDQUFDO0VBRWhEO0VBQ0FhLFlBQVksRUFBRTtJQUNaQyxNQUFNLEVBQUUsc0JBQXNCO0lBQzlCQyxJQUFJLEVBQUU7RUFDUixDQUFDO0VBRUQ7RUFDQUMsWUFBWSxFQUFFO0lBQ1pELElBQUksRUFBRWIsVUFBVTtJQUNoQlksTUFBTSxFQUFFZCxLQUFLLENBQUNpQixPQUFPLENBQUVmLFVBQVcsQ0FBQyxDQUFDZ0IsZ0JBQWdCLENBQUUsR0FBSTtFQUM1RCxDQUFDO0VBRUQ7RUFDQUMsd0JBQXdCLEVBQUUsb0JBQW9CO0VBQzlDQyxzQkFBc0IsRUFBRSxrQkFBa0I7RUFDMUNDLGlDQUFpQyxFQUFFckIsS0FBSyxDQUFDaUIsT0FBTyxDQUFFLGdCQUFpQixDQUFDLENBQUNLLGtCQUFrQixDQUFFLEdBQUksQ0FBQztFQUU5RkMsV0FBVyxFQUFFO0lBQ1hSLElBQUksRUFBRVosU0FBUztJQUNmVyxNQUFNLEVBQUVkLEtBQUssQ0FBQ2lCLE9BQU8sQ0FBRWQsU0FBVSxDQUFDLENBQUNlLGdCQUFnQixDQUFFLEdBQUk7RUFDM0QsQ0FBQztFQUVETSxXQUFXLEVBQUU7SUFDWFQsSUFBSSxFQUFFWCxTQUFTO0lBQ2ZVLE1BQU0sRUFBRWQsS0FBSyxDQUFDaUIsT0FBTyxDQUFFYixTQUFVLENBQUMsQ0FBQ2MsZ0JBQWdCLENBQUUsR0FBSTtFQUMzRCxDQUFDO0VBRURPLGFBQWEsRUFBRTtJQUNiQyxTQUFTLEVBQUUscUJBQXFCO0lBQ2hDWixNQUFNLEVBQUU7RUFDVixDQUFDO0VBRUQ7RUFDQWEsZUFBZSxFQUFFLE9BQU87RUFFeEJDLGFBQWEsRUFBRTdCLGVBQWUsQ0FBQzhCLGNBQWM7RUFFN0NDLGlCQUFpQixFQUFFO0lBQ2pCQyxXQUFXLEVBQUUsTUFBTTtJQUNuQkMsd0JBQXdCLEVBQUUsT0FBTztJQUNqQ0MsU0FBUyxFQUFFO0VBQ2IsQ0FBQztFQUVEO0VBQ0FDLGdCQUFnQixFQUFFO0FBQ3BCLENBQUM7QUFFRGpDLFdBQVcsQ0FBQ2tDLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRTlCLGlCQUFrQixDQUFDO0FBQzlELGVBQWVBLGlCQUFpQiJ9