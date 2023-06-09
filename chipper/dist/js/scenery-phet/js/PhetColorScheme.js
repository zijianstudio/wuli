// Copyright 2015-2023, University of Colorado Boulder

/**
 * Colors that are specific to PhET simulations.
 * Reuse these in sims whenever possible to facilitate uniformity across sims.
 * These should all be instances of phet.scenery.Color, since {Color} can typically be used anywhere but {string} cannot.
 *
 * This is based on the google doc here:
 * https://docs.google.com/spreadsheets/d/1mNsOWSbcoO-Ox2evxJij5Lix4HTZbXKbFgMlPe9W-u0/edit#gid=0
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Color } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';

// Colors that are used for one or more things in the color scheme.
const DARK_GREEN = new Color(0, 200, 0);
const RED_COLORBLIND = new Color(255, 85, 0); // looks good in colorblind tests, typically used in place of 'red'
const GREEN_COLORBLIND = new Color(0, 135, 0); // looks good in colorblind tests when used alongside RED_COLORBLIND
const PHET_LOGO_BLUE = new Color(106, 206, 245); // the color of the blue in the PhET logo
const PHET_LOGO_YELLOW = new Color(254, 225, 5); // the color of the yellow in the PhET logo

const PhetColorScheme = {
  ACCELERATION: new Color(255, 255, 50),
  APPLIED_FORCE: new Color(236, 153, 55),
  BUTTON_YELLOW: PHET_LOGO_YELLOW,
  ELASTIC_POTENTIAL_ENERGY: new Color(0, 204, 255),
  FRICTION_FORCE: RED_COLORBLIND,
  GRAVITATIONAL_FORCE: new Color(50, 130, 215),
  GRAVITATIONAL_POTENTIAL_ENERGY: new Color(55, 130, 215),
  HEAT_THERMAL_ENERGY: RED_COLORBLIND,
  IMAGINARY_PART: new Color(153, 51, 102),
  KINETIC_ENERGY: new Color(30, 200, 45),
  MOMENTUM: new Color(50, 50, 255),
  NET_WORK: DARK_GREEN,
  NORMAL_FORCE: new Color(255, 235, 0),
  PHET_LOGO_BLUE: PHET_LOGO_BLUE,
  PHET_LOGO_YELLOW: PHET_LOGO_YELLOW,
  POSITION: Color.BLUE,
  REAL_PART: new Color(255, 153, 0),
  RED_COLORBLIND: RED_COLORBLIND,
  RESET_ALL_BUTTON_BASE_COLOR: new Color(247, 151, 34),
  GREEN_COLORBLIND: GREEN_COLORBLIND,
  TOTAL_ENERGY: new Color(180, 180, 0),
  TOTAL_FORCE: DARK_GREEN,
  VELOCITY: new Color(50, 255, 50),
  WALL_FORCE: new Color(153, 51, 0),
  SCREEN_ICON_FRAME: '#dddddd'
};
sceneryPhet.register('PhetColorScheme', PhetColorScheme);
export default PhetColorScheme;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb2xvciIsInNjZW5lcnlQaGV0IiwiREFSS19HUkVFTiIsIlJFRF9DT0xPUkJMSU5EIiwiR1JFRU5fQ09MT1JCTElORCIsIlBIRVRfTE9HT19CTFVFIiwiUEhFVF9MT0dPX1lFTExPVyIsIlBoZXRDb2xvclNjaGVtZSIsIkFDQ0VMRVJBVElPTiIsIkFQUExJRURfRk9SQ0UiLCJCVVRUT05fWUVMTE9XIiwiRUxBU1RJQ19QT1RFTlRJQUxfRU5FUkdZIiwiRlJJQ1RJT05fRk9SQ0UiLCJHUkFWSVRBVElPTkFMX0ZPUkNFIiwiR1JBVklUQVRJT05BTF9QT1RFTlRJQUxfRU5FUkdZIiwiSEVBVF9USEVSTUFMX0VORVJHWSIsIklNQUdJTkFSWV9QQVJUIiwiS0lORVRJQ19FTkVSR1kiLCJNT01FTlRVTSIsIk5FVF9XT1JLIiwiTk9STUFMX0ZPUkNFIiwiUE9TSVRJT04iLCJCTFVFIiwiUkVBTF9QQVJUIiwiUkVTRVRfQUxMX0JVVFRPTl9CQVNFX0NPTE9SIiwiVE9UQUxfRU5FUkdZIiwiVE9UQUxfRk9SQ0UiLCJWRUxPQ0lUWSIsIldBTExfRk9SQ0UiLCJTQ1JFRU5fSUNPTl9GUkFNRSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGhldENvbG9yU2NoZW1lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbG9ycyB0aGF0IGFyZSBzcGVjaWZpYyB0byBQaEVUIHNpbXVsYXRpb25zLlxyXG4gKiBSZXVzZSB0aGVzZSBpbiBzaW1zIHdoZW5ldmVyIHBvc3NpYmxlIHRvIGZhY2lsaXRhdGUgdW5pZm9ybWl0eSBhY3Jvc3Mgc2ltcy5cclxuICogVGhlc2Ugc2hvdWxkIGFsbCBiZSBpbnN0YW5jZXMgb2YgcGhldC5zY2VuZXJ5LkNvbG9yLCBzaW5jZSB7Q29sb3J9IGNhbiB0eXBpY2FsbHkgYmUgdXNlZCBhbnl3aGVyZSBidXQge3N0cmluZ30gY2Fubm90LlxyXG4gKlxyXG4gKiBUaGlzIGlzIGJhc2VkIG9uIHRoZSBnb29nbGUgZG9jIGhlcmU6XHJcbiAqIGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL3NwcmVhZHNoZWV0cy9kLzFtTnNPV1NiY29PLU94MmV2eEppajVMaXg0SFRaYlhLYkZnTWxQZTlXLXUwL2VkaXQjZ2lkPTBcclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcclxuXHJcbi8vIENvbG9ycyB0aGF0IGFyZSB1c2VkIGZvciBvbmUgb3IgbW9yZSB0aGluZ3MgaW4gdGhlIGNvbG9yIHNjaGVtZS5cclxuY29uc3QgREFSS19HUkVFTiA9IG5ldyBDb2xvciggMCwgMjAwLCAwICk7XHJcbmNvbnN0IFJFRF9DT0xPUkJMSU5EID0gbmV3IENvbG9yKCAyNTUsIDg1LCAwICk7IC8vIGxvb2tzIGdvb2QgaW4gY29sb3JibGluZCB0ZXN0cywgdHlwaWNhbGx5IHVzZWQgaW4gcGxhY2Ugb2YgJ3JlZCdcclxuY29uc3QgR1JFRU5fQ09MT1JCTElORCA9IG5ldyBDb2xvciggMCwgMTM1LCAwICk7IC8vIGxvb2tzIGdvb2QgaW4gY29sb3JibGluZCB0ZXN0cyB3aGVuIHVzZWQgYWxvbmdzaWRlIFJFRF9DT0xPUkJMSU5EXHJcbmNvbnN0IFBIRVRfTE9HT19CTFVFID0gbmV3IENvbG9yKCAxMDYsIDIwNiwgMjQ1ICk7IC8vIHRoZSBjb2xvciBvZiB0aGUgYmx1ZSBpbiB0aGUgUGhFVCBsb2dvXHJcbmNvbnN0IFBIRVRfTE9HT19ZRUxMT1cgPSBuZXcgQ29sb3IoIDI1NCwgMjI1LCA1ICk7IC8vIHRoZSBjb2xvciBvZiB0aGUgeWVsbG93IGluIHRoZSBQaEVUIGxvZ29cclxuXHJcbmNvbnN0IFBoZXRDb2xvclNjaGVtZSA9IHtcclxuICBBQ0NFTEVSQVRJT046IG5ldyBDb2xvciggMjU1LCAyNTUsIDUwICksXHJcbiAgQVBQTElFRF9GT1JDRTogbmV3IENvbG9yKCAyMzYsIDE1MywgNTUgKSxcclxuICBCVVRUT05fWUVMTE9XOiBQSEVUX0xPR09fWUVMTE9XLFxyXG4gIEVMQVNUSUNfUE9URU5USUFMX0VORVJHWTogbmV3IENvbG9yKCAwLCAyMDQsIDI1NSApLFxyXG4gIEZSSUNUSU9OX0ZPUkNFOiBSRURfQ09MT1JCTElORCxcclxuICBHUkFWSVRBVElPTkFMX0ZPUkNFOiBuZXcgQ29sb3IoIDUwLCAxMzAsIDIxNSApLFxyXG4gIEdSQVZJVEFUSU9OQUxfUE9URU5USUFMX0VORVJHWTogbmV3IENvbG9yKCA1NSwgMTMwLCAyMTUgKSxcclxuICBIRUFUX1RIRVJNQUxfRU5FUkdZOiBSRURfQ09MT1JCTElORCxcclxuICBJTUFHSU5BUllfUEFSVDogbmV3IENvbG9yKCAxNTMsIDUxLCAxMDIgKSxcclxuICBLSU5FVElDX0VORVJHWTogbmV3IENvbG9yKCAzMCwgMjAwLCA0NSApLFxyXG4gIE1PTUVOVFVNOiBuZXcgQ29sb3IoIDUwLCA1MCwgMjU1ICksXHJcbiAgTkVUX1dPUks6IERBUktfR1JFRU4sXHJcbiAgTk9STUFMX0ZPUkNFOiBuZXcgQ29sb3IoIDI1NSwgMjM1LCAwICksXHJcbiAgUEhFVF9MT0dPX0JMVUU6IFBIRVRfTE9HT19CTFVFLFxyXG4gIFBIRVRfTE9HT19ZRUxMT1c6IFBIRVRfTE9HT19ZRUxMT1csXHJcbiAgUE9TSVRJT046IENvbG9yLkJMVUUsXHJcbiAgUkVBTF9QQVJUOiBuZXcgQ29sb3IoIDI1NSwgMTUzLCAwICksXHJcbiAgUkVEX0NPTE9SQkxJTkQ6IFJFRF9DT0xPUkJMSU5ELFxyXG4gIFJFU0VUX0FMTF9CVVRUT05fQkFTRV9DT0xPUjogbmV3IENvbG9yKCAyNDcsIDE1MSwgMzQgKSxcclxuICBHUkVFTl9DT0xPUkJMSU5EOiBHUkVFTl9DT0xPUkJMSU5ELFxyXG4gIFRPVEFMX0VORVJHWTogbmV3IENvbG9yKCAxODAsIDE4MCwgMCApLFxyXG4gIFRPVEFMX0ZPUkNFOiBEQVJLX0dSRUVOLFxyXG4gIFZFTE9DSVRZOiBuZXcgQ29sb3IoIDUwLCAyNTUsIDUwICksXHJcbiAgV0FMTF9GT1JDRTogbmV3IENvbG9yKCAxNTMsIDUxLCAwICksXHJcbiAgU0NSRUVOX0lDT05fRlJBTUU6ICcjZGRkZGRkJ1xyXG59O1xyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdQaGV0Q29sb3JTY2hlbWUnLCBQaGV0Q29sb3JTY2hlbWUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBoZXRDb2xvclNjaGVtZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsS0FBSyxRQUFRLDZCQUE2QjtBQUNuRCxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCOztBQUUxQztBQUNBLE1BQU1DLFVBQVUsR0FBRyxJQUFJRixLQUFLLENBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFFLENBQUM7QUFDekMsTUFBTUcsY0FBYyxHQUFHLElBQUlILEtBQUssQ0FBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUUsQ0FBQyxDQUFDLENBQUM7QUFDaEQsTUFBTUksZ0JBQWdCLEdBQUcsSUFBSUosS0FBSyxDQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBRSxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFNSyxjQUFjLEdBQUcsSUFBSUwsS0FBSyxDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBSSxDQUFDLENBQUMsQ0FBQztBQUNuRCxNQUFNTSxnQkFBZ0IsR0FBRyxJQUFJTixLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVuRCxNQUFNTyxlQUFlLEdBQUc7RUFDdEJDLFlBQVksRUFBRSxJQUFJUixLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFHLENBQUM7RUFDdkNTLGFBQWEsRUFBRSxJQUFJVCxLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFHLENBQUM7RUFDeENVLGFBQWEsRUFBRUosZ0JBQWdCO0VBQy9CSyx3QkFBd0IsRUFBRSxJQUFJWCxLQUFLLENBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFJLENBQUM7RUFDbERZLGNBQWMsRUFBRVQsY0FBYztFQUM5QlUsbUJBQW1CLEVBQUUsSUFBSWIsS0FBSyxDQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBSSxDQUFDO0VBQzlDYyw4QkFBOEIsRUFBRSxJQUFJZCxLQUFLLENBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFJLENBQUM7RUFDekRlLG1CQUFtQixFQUFFWixjQUFjO0VBQ25DYSxjQUFjLEVBQUUsSUFBSWhCLEtBQUssQ0FBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUksQ0FBQztFQUN6Q2lCLGNBQWMsRUFBRSxJQUFJakIsS0FBSyxDQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRyxDQUFDO0VBQ3hDa0IsUUFBUSxFQUFFLElBQUlsQixLQUFLLENBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFJLENBQUM7RUFDbENtQixRQUFRLEVBQUVqQixVQUFVO0VBQ3BCa0IsWUFBWSxFQUFFLElBQUlwQixLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFFLENBQUM7RUFDdENLLGNBQWMsRUFBRUEsY0FBYztFQUM5QkMsZ0JBQWdCLEVBQUVBLGdCQUFnQjtFQUNsQ2UsUUFBUSxFQUFFckIsS0FBSyxDQUFDc0IsSUFBSTtFQUNwQkMsU0FBUyxFQUFFLElBQUl2QixLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFFLENBQUM7RUFDbkNHLGNBQWMsRUFBRUEsY0FBYztFQUM5QnFCLDJCQUEyQixFQUFFLElBQUl4QixLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFHLENBQUM7RUFDdERJLGdCQUFnQixFQUFFQSxnQkFBZ0I7RUFDbENxQixZQUFZLEVBQUUsSUFBSXpCLEtBQUssQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUUsQ0FBQztFQUN0QzBCLFdBQVcsRUFBRXhCLFVBQVU7RUFDdkJ5QixRQUFRLEVBQUUsSUFBSTNCLEtBQUssQ0FBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUcsQ0FBQztFQUNsQzRCLFVBQVUsRUFBRSxJQUFJNUIsS0FBSyxDQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBRSxDQUFDO0VBQ25DNkIsaUJBQWlCLEVBQUU7QUFDckIsQ0FBQztBQUVENUIsV0FBVyxDQUFDNkIsUUFBUSxDQUFFLGlCQUFpQixFQUFFdkIsZUFBZ0IsQ0FBQztBQUUxRCxlQUFlQSxlQUFlIn0=