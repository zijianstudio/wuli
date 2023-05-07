// Copyright 2014-2022, University of Colorado Boulder

/**
 * Colors used throughout this sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import { Color } from '../../../scenery/js/imports.js';
import moleculePolarity from '../moleculePolarity.js';

// constants
const SURFACE_ALPHA = 0.72;
const NEUTRAL_GREEN = new Color(31, 247, 0);
const MPColors = {
  SCREEN_BACKGROUND: 'rgb( 180, 205, 255)',
  CONTROL_PANEL_BACKGROUND: 'rgb( 238, 238, 238)',
  // atoms
  ATOM_A: 'rgb( 255, 255, 90 )',
  ATOM_B: 'rgb( 0, 255, 0 )',
  ATOM_C: 'rgb( 255, 175, 175)',
  BOND: 'rgb( 90, 90, 90)',
  OXYGEN: PhetColorScheme.RED_COLORBLIND,
  // dipoles
  BOND_DIPOLE: 'black',
  MOLECULAR_DIPOLE: 'rgb( 255, 200, 0 )',
  // E-field plates
  PLATE: 'rgb( 192, 192, 192 )',
  // surfaces, colors are ordered negative to positive
  NEUTRAL_GRAY: new Color(128, 128, 128, SURFACE_ALPHA),
  BW_GRADIENT: [Color.BLACK.withAlpha(SURFACE_ALPHA), Color.WHITE.withAlpha(SURFACE_ALPHA)],
  RWB_GRADIENT: [Color.RED.withAlpha(SURFACE_ALPHA), Color.WHITE.withAlpha(SURFACE_ALPHA), Color.BLUE.withAlpha(SURFACE_ALPHA)],
  // Color used for 'neutral' (potential===0) by Jmol in ROYGB gradient, see http://jmol.sourceforge.net/jscolors/#gradnt
  NEUTRAL_POTENTIAL: NEUTRAL_GREEN,
  /*
   * Secondary gradient for mep, negative to positive.
   * This is Jmol's ROYGB gradient, documented at http://jmol.sourceforge.net/jscolors/#gradnt.
   */
  ROYGB_GRADIENT: [Color.RED, new Color(242, 30, 0), new Color(247, 62, 0), new Color(247, 93, 0), new Color(247, 124, 0), new Color(247, 155, 0), new Color(244, 214, 0), new Color(244, 230, 0), new Color(242, 242, 0), new Color(227, 227, 0), new Color(217, 247, 0), new Color(180, 242, 0), new Color(121, 247, 0), new Color(93, 247, 0), new Color(61, 242, 0), NEUTRAL_GREEN,
  // neutral (potential===0)
  new Color(0, 244, 0), new Color(0, 244, 31), new Color(0, 247, 93), new Color(0, 247, 124), new Color(0, 247, 155), new Color(0, 250, 188), new Color(0, 243, 217), new Color(0, 247, 247), new Color(0, 184, 244), new Color(0, 153, 244), new Color(0, 121, 242), new Color(0, 89, 236), new Color(0, 60, 239), new Color(0, 30, 242), Color.BLUE]
};
moleculePolarity.register('MPColors', MPColors);
export default MPColors;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Q29sb3JTY2hlbWUiLCJDb2xvciIsIm1vbGVjdWxlUG9sYXJpdHkiLCJTVVJGQUNFX0FMUEhBIiwiTkVVVFJBTF9HUkVFTiIsIk1QQ29sb3JzIiwiU0NSRUVOX0JBQ0tHUk9VTkQiLCJDT05UUk9MX1BBTkVMX0JBQ0tHUk9VTkQiLCJBVE9NX0EiLCJBVE9NX0IiLCJBVE9NX0MiLCJCT05EIiwiT1hZR0VOIiwiUkVEX0NPTE9SQkxJTkQiLCJCT05EX0RJUE9MRSIsIk1PTEVDVUxBUl9ESVBPTEUiLCJQTEFURSIsIk5FVVRSQUxfR1JBWSIsIkJXX0dSQURJRU5UIiwiQkxBQ0siLCJ3aXRoQWxwaGEiLCJXSElURSIsIlJXQl9HUkFESUVOVCIsIlJFRCIsIkJMVUUiLCJORVVUUkFMX1BPVEVOVElBTCIsIlJPWUdCX0dSQURJRU5UIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNUENvbG9ycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb2xvcnMgdXNlZCB0aHJvdWdob3V0IHRoaXMgc2ltLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1vbGVjdWxlUG9sYXJpdHkgZnJvbSAnLi4vbW9sZWN1bGVQb2xhcml0eS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgU1VSRkFDRV9BTFBIQSA9IDAuNzI7XHJcbmNvbnN0IE5FVVRSQUxfR1JFRU4gPSBuZXcgQ29sb3IoIDMxLCAyNDcsIDAgKTtcclxuXHJcbmNvbnN0IE1QQ29sb3JzID0ge1xyXG5cclxuICBTQ1JFRU5fQkFDS0dST1VORDogJ3JnYiggMTgwLCAyMDUsIDI1NSknLFxyXG5cclxuICBDT05UUk9MX1BBTkVMX0JBQ0tHUk9VTkQ6ICdyZ2IoIDIzOCwgMjM4LCAyMzgpJyxcclxuXHJcbiAgLy8gYXRvbXNcclxuICBBVE9NX0E6ICdyZ2IoIDI1NSwgMjU1LCA5MCApJyxcclxuICBBVE9NX0I6ICdyZ2IoIDAsIDI1NSwgMCApJyxcclxuICBBVE9NX0M6ICdyZ2IoIDI1NSwgMTc1LCAxNzUpJyxcclxuICBCT05EOiAncmdiKCA5MCwgOTAsIDkwKScsXHJcbiAgT1hZR0VOOiBQaGV0Q29sb3JTY2hlbWUuUkVEX0NPTE9SQkxJTkQsXHJcblxyXG4gIC8vIGRpcG9sZXNcclxuICBCT05EX0RJUE9MRTogJ2JsYWNrJyxcclxuICBNT0xFQ1VMQVJfRElQT0xFOiAncmdiKCAyNTUsIDIwMCwgMCApJyxcclxuXHJcbiAgLy8gRS1maWVsZCBwbGF0ZXNcclxuICBQTEFURTogJ3JnYiggMTkyLCAxOTIsIDE5MiApJyxcclxuXHJcbiAgLy8gc3VyZmFjZXMsIGNvbG9ycyBhcmUgb3JkZXJlZCBuZWdhdGl2ZSB0byBwb3NpdGl2ZVxyXG4gIE5FVVRSQUxfR1JBWTogbmV3IENvbG9yKCAxMjgsIDEyOCwgMTI4LCBTVVJGQUNFX0FMUEhBICksXHJcbiAgQldfR1JBRElFTlQ6IFsgQ29sb3IuQkxBQ0sud2l0aEFscGhhKCBTVVJGQUNFX0FMUEhBICksIENvbG9yLldISVRFLndpdGhBbHBoYSggU1VSRkFDRV9BTFBIQSApIF0sXHJcbiAgUldCX0dSQURJRU5UOiBbIENvbG9yLlJFRC53aXRoQWxwaGEoIFNVUkZBQ0VfQUxQSEEgKSwgQ29sb3IuV0hJVEUud2l0aEFscGhhKCBTVVJGQUNFX0FMUEhBICksIENvbG9yLkJMVUUud2l0aEFscGhhKCBTVVJGQUNFX0FMUEhBICkgXSxcclxuXHJcbiAgLy8gQ29sb3IgdXNlZCBmb3IgJ25ldXRyYWwnIChwb3RlbnRpYWw9PT0wKSBieSBKbW9sIGluIFJPWUdCIGdyYWRpZW50LCBzZWUgaHR0cDovL2ptb2wuc291cmNlZm9yZ2UubmV0L2pzY29sb3JzLyNncmFkbnRcclxuICBORVVUUkFMX1BPVEVOVElBTDogTkVVVFJBTF9HUkVFTixcclxuXHJcbiAgLypcclxuICAgKiBTZWNvbmRhcnkgZ3JhZGllbnQgZm9yIG1lcCwgbmVnYXRpdmUgdG8gcG9zaXRpdmUuXHJcbiAgICogVGhpcyBpcyBKbW9sJ3MgUk9ZR0IgZ3JhZGllbnQsIGRvY3VtZW50ZWQgYXQgaHR0cDovL2ptb2wuc291cmNlZm9yZ2UubmV0L2pzY29sb3JzLyNncmFkbnQuXHJcbiAgICovXHJcbiAgUk9ZR0JfR1JBRElFTlQ6IFtcclxuICAgIENvbG9yLlJFRCxcclxuICAgIG5ldyBDb2xvciggMjQyLCAzMCwgMCApLFxyXG4gICAgbmV3IENvbG9yKCAyNDcsIDYyLCAwICksXHJcbiAgICBuZXcgQ29sb3IoIDI0NywgOTMsIDAgKSxcclxuICAgIG5ldyBDb2xvciggMjQ3LCAxMjQsIDAgKSxcclxuICAgIG5ldyBDb2xvciggMjQ3LCAxNTUsIDAgKSxcclxuICAgIG5ldyBDb2xvciggMjQ0LCAyMTQsIDAgKSxcclxuICAgIG5ldyBDb2xvciggMjQ0LCAyMzAsIDAgKSxcclxuICAgIG5ldyBDb2xvciggMjQyLCAyNDIsIDAgKSxcclxuICAgIG5ldyBDb2xvciggMjI3LCAyMjcsIDAgKSxcclxuICAgIG5ldyBDb2xvciggMjE3LCAyNDcsIDAgKSxcclxuICAgIG5ldyBDb2xvciggMTgwLCAyNDIsIDAgKSxcclxuICAgIG5ldyBDb2xvciggMTIxLCAyNDcsIDAgKSxcclxuICAgIG5ldyBDb2xvciggOTMsIDI0NywgMCApLFxyXG4gICAgbmV3IENvbG9yKCA2MSwgMjQyLCAwICksXHJcbiAgICBORVVUUkFMX0dSRUVOLCAvLyBuZXV0cmFsIChwb3RlbnRpYWw9PT0wKVxyXG4gICAgbmV3IENvbG9yKCAwLCAyNDQsIDAgKSxcclxuICAgIG5ldyBDb2xvciggMCwgMjQ0LCAzMSApLFxyXG4gICAgbmV3IENvbG9yKCAwLCAyNDcsIDkzICksXHJcbiAgICBuZXcgQ29sb3IoIDAsIDI0NywgMTI0ICksXHJcbiAgICBuZXcgQ29sb3IoIDAsIDI0NywgMTU1ICksXHJcbiAgICBuZXcgQ29sb3IoIDAsIDI1MCwgMTg4ICksXHJcbiAgICBuZXcgQ29sb3IoIDAsIDI0MywgMjE3ICksXHJcbiAgICBuZXcgQ29sb3IoIDAsIDI0NywgMjQ3ICksXHJcbiAgICBuZXcgQ29sb3IoIDAsIDE4NCwgMjQ0ICksXHJcbiAgICBuZXcgQ29sb3IoIDAsIDE1MywgMjQ0ICksXHJcbiAgICBuZXcgQ29sb3IoIDAsIDEyMSwgMjQyICksXHJcbiAgICBuZXcgQ29sb3IoIDAsIDg5LCAyMzYgKSxcclxuICAgIG5ldyBDb2xvciggMCwgNjAsIDIzOSApLFxyXG4gICAgbmV3IENvbG9yKCAwLCAzMCwgMjQyICksXHJcbiAgICBDb2xvci5CTFVFXHJcbiAgXVxyXG59O1xyXG5cclxubW9sZWN1bGVQb2xhcml0eS5yZWdpc3RlciggJ01QQ29sb3JzJywgTVBDb2xvcnMgKTtcclxuZXhwb3J0IGRlZmF1bHQgTVBDb2xvcnM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSw2Q0FBNkM7QUFDekUsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxnQkFBZ0IsTUFBTSx3QkFBd0I7O0FBRXJEO0FBQ0EsTUFBTUMsYUFBYSxHQUFHLElBQUk7QUFDMUIsTUFBTUMsYUFBYSxHQUFHLElBQUlILEtBQUssQ0FBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUUsQ0FBQztBQUU3QyxNQUFNSSxRQUFRLEdBQUc7RUFFZkMsaUJBQWlCLEVBQUUscUJBQXFCO0VBRXhDQyx3QkFBd0IsRUFBRSxxQkFBcUI7RUFFL0M7RUFDQUMsTUFBTSxFQUFFLHFCQUFxQjtFQUM3QkMsTUFBTSxFQUFFLGtCQUFrQjtFQUMxQkMsTUFBTSxFQUFFLHFC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