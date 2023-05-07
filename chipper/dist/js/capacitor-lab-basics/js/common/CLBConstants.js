// Copyright 2015-2021, University of Colorado Boulder

/**
 * Shared constants used in multiple locations within the sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import RangeWithValue from '../../../dot/js/RangeWithValue.js';
import Vector3 from '../../../dot/js/Vector3.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import capacitorLabBasics from '../capacitorLabBasics.js';
const CLBConstants = {
  //----------------------------------------------------------------------------
  // Model
  //----------------------------------------------------------------------------

  EPSILON_0: 8.854E-12,
  // vacuum permittivity, aka electric constant (Farads/meter)

  // world
  WORLD_DRAG_MARGIN: 0.001,
  // meters

  // battery
  BATTERY_VOLTAGE_RANGE: new RangeWithValue(-1.5, 1.5, 0),
  // Volts
  BATTERY_VOLTAGE_SNAP_TO_ZERO_THRESHOLD: 0.15,
  // Volts

  // capacitor
  CAPACITANCE_RANGE: new Range(1E-13, 3E-13),
  // Farads

  LIGHT_BULB_X_SPACING: 0.023,
  // meters
  BATTERY_POSITION: new Vector3(0.0065, 0.030, 0),
  // meters
  LIGHT_BULB_RESISTANCE: 5e12,
  // Ohms. Artificially large to stretch discharge time

  // switch
  SWITCH_WIRE_LENGTH: 0.0064,
  // in meters
  SWITCH_Y_SPACING: 0.0025,
  // spacing between circuit components and the switch

  // dielectric constants (dimensionless)
  EPSILON_VACUUM: 1,
  // Wire
  WIRE_THICKNESS: 0.0005,
  // meters

  //----------------------------------------------------------------------------
  // View
  //----------------------------------------------------------------------------

  // colors used by ConnectionNode
  DISCONNECTED_POINT_COLOR: 'rgb( 200, 230, 255 )',
  DISCONNECTED_POINT_STROKE: PhetColorScheme.RED_COLORBLIND,
  CONNECTION_POINT_HIGHLIGHTED: 'yellow',
  DRAG_HANDLE_ARROW_LENGTH: 45,
  // pixels

  // Model values at which the bar meters have their maximum length in the view.
  // They are currently set to follow a common scale.
  CAPACITANCE_METER_MAX_VALUE: 2.7e-12,
  PLATE_CHARGE_METER_MAX_VALUE: 2.7e-12,
  STORED_ENERGY_METER_MAX_VALUE: 2.7e-12,
  CONNECTION_POINT_RADIUS: 8,
  // px - dashed circles at switch contacts

  // plate charges
  ELECTRON_CHARGE: 1.60218E-19,
  MIN_PLATE_CHARGE: 0.01E-12,
  // absolute minimum plate charge in coulombs

  // E-field
  NUMBER_OF_EFIELD_LINES: new Range(1, 900),
  // number of lines on smallest plate
  DIRECTION: {
    UP: 'UP',
    DOWN: 'DOWN'
  },
  // capacitance control
  CAPACITANCE_CONTROL_EXPONENT: -13,
  // colors used throughout the sim, each representing a physical quantity
  CAPACITANCE_COLOR: 'rgb( 61, 179, 79 )',
  E_FIELD_COLOR: 'black',
  STORED_ENERGY_COLOR: 'yellow',
  POSITIVE_CHARGE_COLOR: PhetColorScheme.RED_COLORBLIND,
  NEGATIVE_CHARGE_COLOR: 'blue',
  // other common colors
  METER_PANEL_FILL: 'rgb( 255, 245, 237)',
  CONNECTION_POINT_COLOR: 'black',
  PIN_COLOR: 'lightgray',
  SCREEN_VIEW_BACKGROUND_COLOR: 'rgb( 153, 193, 255 )'
};
capacitorLabBasics.register('CLBConstants', CLBConstants);
export default CLBConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIlJhbmdlV2l0aFZhbHVlIiwiVmVjdG9yMyIsIlBoZXRDb2xvclNjaGVtZSIsImNhcGFjaXRvckxhYkJhc2ljcyIsIkNMQkNvbnN0YW50cyIsIkVQU0lMT05fMCIsIldPUkxEX0RSQUdfTUFSR0lOIiwiQkFUVEVSWV9WT0xUQUdFX1JBTkdFIiwiQkFUVEVSWV9WT0xUQUdFX1NOQVBfVE9fWkVST19USFJFU0hPTEQiLCJDQVBBQ0lUQU5DRV9SQU5HRSIsIkxJR0hUX0JVTEJfWF9TUEFDSU5HIiwiQkFUVEVSWV9QT1NJVElPTiIsIkxJR0hUX0JVTEJfUkVTSVNUQU5DRSIsIlNXSVRDSF9XSVJFX0xFTkdUSCIsIlNXSVRDSF9ZX1NQQUNJTkciLCJFUFNJTE9OX1ZBQ1VVTSIsIldJUkVfVEhJQ0tORVNTIiwiRElTQ09OTkVDVEVEX1BPSU5UX0NPTE9SIiwiRElTQ09OTkVDVEVEX1BPSU5UX1NUUk9LRSIsIlJFRF9DT0xPUkJMSU5EIiwiQ09OTkVDVElPTl9QT0lOVF9ISUdITElHSFRFRCIsIkRSQUdfSEFORExFX0FSUk9XX0xFTkdUSCIsIkNBUEFDSVRBTkNFX01FVEVSX01BWF9WQUxVRSIsIlBMQVRFX0NIQVJHRV9NRVRFUl9NQVhfVkFMVUUiLCJTVE9SRURfRU5FUkdZX01FVEVSX01BWF9WQUxVRSIsIkNPTk5FQ1RJT05fUE9JTlRfUkFESVVTIiwiRUxFQ1RST05fQ0hBUkdFIiwiTUlOX1BMQVRFX0NIQVJHRSIsIk5VTUJFUl9PRl9FRklFTERfTElORVMiLCJESVJFQ1RJT04iLCJVUCIsIkRPV04iLCJDQVBBQ0lUQU5DRV9DT05UUk9MX0VYUE9ORU5UIiwiQ0FQQUNJVEFOQ0VfQ09MT1IiLCJFX0ZJRUxEX0NPTE9SIiwiU1RPUkVEX0VORVJHWV9DT0xPUiIsIlBPU0lUSVZFX0NIQVJHRV9DT0xPUiIsIk5FR0FUSVZFX0NIQVJHRV9DT0xPUiIsIk1FVEVSX1BBTkVMX0ZJTEwiLCJDT05ORUNUSU9OX1BPSU5UX0NPTE9SIiwiUElOX0NPTE9SIiwiU0NSRUVOX1ZJRVdfQkFDS0dST1VORF9DT0xPUiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ0xCQ29uc3RhbnRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNoYXJlZCBjb25zdGFudHMgdXNlZCBpbiBtdWx0aXBsZSBsb2NhdGlvbnMgd2l0aGluIHRoZSBzaW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEFuZHJldyBBZGFyZSAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFJhbmdlV2l0aFZhbHVlIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYW5nZVdpdGhWYWx1ZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IzLmpzJztcclxuaW1wb3J0IFBoZXRDb2xvclNjaGVtZSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldENvbG9yU2NoZW1lLmpzJztcclxuaW1wb3J0IGNhcGFjaXRvckxhYkJhc2ljcyBmcm9tICcuLi9jYXBhY2l0b3JMYWJCYXNpY3MuanMnO1xyXG5cclxuY29uc3QgQ0xCQ29uc3RhbnRzID0ge1xyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBNb2RlbFxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBFUFNJTE9OXzA6IDguODU0RS0xMiwgLy8gdmFjdXVtIHBlcm1pdHRpdml0eSwgYWthIGVsZWN0cmljIGNvbnN0YW50IChGYXJhZHMvbWV0ZXIpXHJcblxyXG4gIC8vIHdvcmxkXHJcbiAgV09STERfRFJBR19NQVJHSU46IDAuMDAxLCAvLyBtZXRlcnNcclxuXHJcbiAgLy8gYmF0dGVyeVxyXG4gIEJBVFRFUllfVk9MVEFHRV9SQU5HRTogbmV3IFJhbmdlV2l0aFZhbHVlKCAtMS41LCAxLjUsIDAgKSwgLy8gVm9sdHNcclxuICBCQVRURVJZX1ZPTFRBR0VfU05BUF9UT19aRVJPX1RIUkVTSE9MRDogMC4xNSwgLy8gVm9sdHNcclxuXHJcbiAgLy8gY2FwYWNpdG9yXHJcbiAgQ0FQQUNJVEFOQ0VfUkFOR0U6IG5ldyBSYW5nZSggMUUtMTMsIDNFLTEzICksIC8vIEZhcmFkc1xyXG5cclxuICBMSUdIVF9CVUxCX1hfU1BBQ0lORzogMC4wMjMsIC8vIG1ldGVyc1xyXG4gIEJBVFRFUllfUE9TSVRJT046IG5ldyBWZWN0b3IzKCAwLjAwNjUsIDAuMDMwLCAwICksIC8vIG1ldGVyc1xyXG4gIExJR0hUX0JVTEJfUkVTSVNUQU5DRTogNWUxMiwgLy8gT2htcy4gQXJ0aWZpY2lhbGx5IGxhcmdlIHRvIHN0cmV0Y2ggZGlzY2hhcmdlIHRpbWVcclxuXHJcbiAgLy8gc3dpdGNoXHJcbiAgU1dJVENIX1dJUkVfTEVOR1RIOiAwLjAwNjQsIC8vIGluIG1ldGVyc1xyXG4gIFNXSVRDSF9ZX1NQQUNJTkc6IDAuMDAyNSwgLy8gc3BhY2luZyBiZXR3ZWVuIGNpcmN1aXQgY29tcG9uZW50cyBhbmQgdGhlIHN3aXRjaFxyXG5cclxuICAvLyBkaWVsZWN0cmljIGNvbnN0YW50cyAoZGltZW5zaW9ubGVzcylcclxuICBFUFNJTE9OX1ZBQ1VVTTogMSxcclxuXHJcbiAgLy8gV2lyZVxyXG4gIFdJUkVfVEhJQ0tORVNTOiAwLjAwMDUsIC8vIG1ldGVyc1xyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBWaWV3XHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8vIGNvbG9ycyB1c2VkIGJ5IENvbm5lY3Rpb25Ob2RlXHJcbiAgRElTQ09OTkVDVEVEX1BPSU5UX0NPTE9SOiAncmdiKCAyMDAsIDIzMCwgMjU1ICknLFxyXG4gIERJU0NPTk5FQ1RFRF9QT0lOVF9TVFJPS0U6IFBoZXRDb2xvclNjaGVtZS5SRURfQ09MT1JCTElORCxcclxuICBDT05ORUNUSU9OX1BPSU5UX0hJR0hMSUdIVEVEOiAneWVsbG93JyxcclxuXHJcbiAgRFJBR19IQU5ETEVfQVJST1dfTEVOR1RIOiA0NSwgLy8gcGl4ZWxzXHJcblxyXG4gIC8vIE1vZGVsIHZhbHVlcyBhdCB3aGljaCB0aGUgYmFyIG1ldGVycyBoYXZlIHRoZWlyIG1heGltdW0gbGVuZ3RoIGluIHRoZSB2aWV3LlxyXG4gIC8vIFRoZXkgYXJlIGN1cnJlbnRseSBzZXQgdG8gZm9sbG93IGEgY29tbW9uIHNjYWxlLlxyXG4gIENBUEFDSVRBTkNFX01FVEVSX01BWF9WQUxVRTogMi43ZS0xMixcclxuICBQTEFURV9DSEFSR0VfTUVURVJfTUFYX1ZBTFVFOiAyLjdlLTEyLFxyXG4gIFNUT1JFRF9FTkVSR1lfTUVURVJfTUFYX1ZBTFVFOiAyLjdlLTEyLFxyXG5cclxuICBDT05ORUNUSU9OX1BPSU5UX1JBRElVUzogOCwgLy8gcHggLSBkYXNoZWQgY2lyY2xlcyBhdCBzd2l0Y2ggY29udGFjdHNcclxuXHJcbiAgLy8gcGxhdGUgY2hhcmdlc1xyXG4gIEVMRUNUUk9OX0NIQVJHRTogMS42MDIxOEUtMTksXHJcbiAgTUlOX1BMQVRFX0NIQVJHRTogMC4wMUUtMTIsIC8vIGFic29sdXRlIG1pbmltdW0gcGxhdGUgY2hhcmdlIGluIGNvdWxvbWJzXHJcblxyXG4gIC8vIEUtZmllbGRcclxuICBOVU1CRVJfT0ZfRUZJRUxEX0xJTkVTOiBuZXcgUmFuZ2UoIDEsIDkwMCApLCAvLyBudW1iZXIgb2YgbGluZXMgb24gc21hbGxlc3QgcGxhdGVcclxuICBESVJFQ1RJT046IHtcclxuICAgIFVQOiAnVVAnLFxyXG4gICAgRE9XTjogJ0RPV04nXHJcbiAgfSxcclxuXHJcbiAgLy8gY2FwYWNpdGFuY2UgY29udHJvbFxyXG4gIENBUEFDSVRBTkNFX0NPTlRST0xfRVhQT05FTlQ6IC0xMyxcclxuXHJcbiAgLy8gY29sb3JzIHVzZWQgdGhyb3VnaG91dCB0aGUgc2ltLCBlYWNoIHJlcHJlc2VudGluZyBhIHBoeXNpY2FsIHF1YW50aXR5XHJcbiAgQ0FQQUNJVEFOQ0VfQ09MT1I6ICdyZ2IoIDYxLCAxNzksIDc5ICknLFxyXG4gIEVfRklFTERfQ09MT1I6ICdibGFjaycsXHJcbiAgU1RPUkVEX0VORVJHWV9DT0xPUjogJ3llbGxvdycsXHJcbiAgUE9TSVRJVkVfQ0hBUkdFX0NPTE9SOiBQaGV0Q29sb3JTY2hlbWUuUkVEX0NPTE9SQkxJTkQsXHJcbiAgTkVHQVRJVkVfQ0hBUkdFX0NPTE9SOiAnYmx1ZScsXHJcblxyXG4gIC8vIG90aGVyIGNvbW1vbiBjb2xvcnNcclxuICBNRVRFUl9QQU5FTF9GSUxMOiAncmdiKCAyNTUsIDI0NSwgMjM3KScsXHJcbiAgQ09OTkVDVElPTl9QT0lOVF9DT0xPUjogJ2JsYWNrJyxcclxuICBQSU5fQ09MT1I6ICdsaWdodGdyYXknLFxyXG4gIFNDUkVFTl9WSUVXX0JBQ0tHUk9VTkRfQ09MT1I6ICdyZ2IoIDE1MywgMTkzLCAyNTUgKSdcclxufTtcclxuXHJcbmNhcGFjaXRvckxhYkJhc2ljcy5yZWdpc3RlciggJ0NMQkNvbnN0YW50cycsIENMQkNvbnN0YW50cyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ0xCQ29uc3RhbnRzO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVB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