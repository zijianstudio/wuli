// Copyright 2014-2021, University of Colorado Boulder

/**
 * shared constants for the Energy Forms and Changes simulation
 *
 * @author John Blanco
 */

import LinearFunction from '../../../dot/js/LinearFunction.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import { Color } from '../../../scenery/js/imports.js';
import energyFormsAndChanges from '../energyFormsAndChanges.js';

// constants used for creating projections that have a 3D-ish look.
const Z_TO_X_OFFSET_MULTIPLIER = -0.25;
const Z_TO_Y_OFFSET_MULTIPLIER = -0.25;

// physical temperature constants
const ROOM_TEMPERATURE = 296; // in degrees Kelvin
const WATER_FREEZING_POINT_TEMPERATURE = 273.15; // in degrees Kelvin

// constants that define physical parameters of various rectangular objects.
const BRICK_DENSITY = 3300; // in kg/m^3, source = design document plus some tweaking to keep chunk numbers reasonable
const BRICK_SPECIFIC_HEAT = 840; // in J/kg-K, source = design document
const BLOCK_SURFACE_WIDTH = 0.045;

// brick constants needed for energy chunk mapping
const BRICK_ENERGY_AT_ROOM_TEMPERATURE = Math.pow(BLOCK_SURFACE_WIDTH, 3) * BRICK_DENSITY * BRICK_SPECIFIC_HEAT * ROOM_TEMPERATURE; // In joules.
const BRICK_ENERGY_AT_FREEZING_TEMPERATURE = Math.pow(BLOCK_SURFACE_WIDTH, 3) * BRICK_DENSITY * BRICK_SPECIFIC_HEAT * WATER_FREEZING_POINT_TEMPERATURE; // In joules.

// constants for temperature-energy mapping functions
const LOW_ENERGY_FOR_MAP_FUNCTION = BRICK_ENERGY_AT_FREEZING_TEMPERATURE;
const HIGH_ENERGY_FOR_MAP_FUNCTION = BRICK_ENERGY_AT_ROOM_TEMPERATURE;

// empirically determined
const NUM_ENERGY_CHUNKS_IN_BRICK_AT_FREEZING = 1.25;
const NUM_ENERGY_CHUNKS_IN_BRICK_AT_ROOM_TEMP = 2.4; // close to rounding to 3 so that little energy needed to transfer first chunk

// time values for normal and fast-forward motion
const FRAMES_PER_SECOND = 60.0;
const SIM_TIME_PER_TICK_NORMAL = 1 / FRAMES_PER_SECOND;

// colors
const NOMINAL_WATER_OPACITY = 0.75;
const FIRST_SCREEN_BACKGROUND_COLOR = new Color(249, 244, 205);
const SECOND_SCREEN_BACKGROUND_COLOR = new Color(249, 244, 205);

// mapping function that maps the energy to the number of energy chunks
const MAP_ENERGY_TO_NUM_CHUNKS = new LinearFunction(LOW_ENERGY_FOR_MAP_FUNCTION, HIGH_ENERGY_FOR_MAP_FUNCTION, NUM_ENERGY_CHUNKS_IN_BRICK_AT_FREEZING, NUM_ENERGY_CHUNKS_IN_BRICK_AT_ROOM_TEMP);

// mapping function that maps the number of chunks of energy to the energy value
const MAP_NUM_CHUNKS_TO_ENERGY = new LinearFunction(NUM_ENERGY_CHUNKS_IN_BRICK_AT_FREEZING, NUM_ENERGY_CHUNKS_IN_BRICK_AT_ROOM_TEMP, LOW_ENERGY_FOR_MAP_FUNCTION, HIGH_ENERGY_FOR_MAP_FUNCTION);
const EFACConstants = {
  // intro screen customization
  IRON_KEY: 'iron',
  // used to validate query parameter values and map to the corresponding Enumeration type
  BRICK_KEY: 'brick',
  WATER_KEY: 'water',
  OLIVE_OIL_KEY: 'oliveOil',
  // modify with caution - the intro screen element layout heavily relies on these
  MAX_NUMBER_OF_INTRO_ELEMENTS: 4,
  MAX_NUMBER_OF_INTRO_BURNERS: 2,
  MAX_NUMBER_OF_INTRO_BEAKERS: 2,
  // Cap large dt values, which occur when the tab containing the sim had been hidden and then re-shown
  maxDT: 0.1,
  // physical temperature constants
  ROOM_TEMPERATURE: ROOM_TEMPERATURE,
  WATER_FREEZING_POINT_TEMPERATURE: WATER_FREEZING_POINT_TEMPERATURE,
  // in degrees Kelvin
  WATER_BOILING_POINT_TEMPERATURE: 373.15,
  // in degrees Kelvin
  OLIVE_OIL_BOILING_POINT_TEMPERATURE: 573.15,
  // in degrees Kelvin

  // mapping function that maps the energy to the number of energy chunks
  MAP_ENERGY_TO_NUM_CHUNKS: MAP_ENERGY_TO_NUM_CHUNKS,
  // mapping function that maps the number of chunks of energy to the energy value
  MAP_NUM_CHUNKS_TO_ENERGY: MAP_NUM_CHUNKS_TO_ENERGY,
  // time values for normal and fast-forward motion
  FRAMES_PER_SECOND: FRAMES_PER_SECOND,
  SIM_TIME_PER_TICK_NORMAL: 1 / FRAMES_PER_SECOND,
  MAX_HEAT_EXCHANGE_TIME_STEP: SIM_TIME_PER_TICK_NORMAL,
  MAP_Z_TO_XY_OFFSET: zValue => {
    return new Vector2(zValue * Z_TO_X_OFFSET_MULTIPLIER, zValue * Z_TO_Y_OFFSET_MULTIPLIER);
  },
  // for comparing temperatures
  SIGNIFICANT_TEMPERATURE_DIFFERENCE: 1E-3,
  // in degrees Kelvin

  ENERGY_TO_NUM_CHUNKS_MAPPER: energy => {
    return Math.max(Utils.roundSymmetric(MAP_ENERGY_TO_NUM_CHUNKS.evaluate(energy)), 0);
  },
  ENERGY_PER_CHUNK: MAP_NUM_CHUNKS_TO_ENERGY.evaluate(2) - MAP_NUM_CHUNKS_TO_ENERGY.evaluate(1),
  // threshold for deciding when two temperatures can be considered equal
  TEMPERATURES_EQUAL_THRESHOLD: 1E-6,
  // in degrees Kelvin

  // Constant used by all of the "energy systems" in order to keep the amount of energy generated, converted, and
  // consumed consistent.
  MAX_ENERGY_PRODUCTION_RATE: 10000,
  // in joules/sec

  // colors
  NOMINAL_WATER_OPACITY: 0.7,
  WATER_COLOR_OPAQUE: new Color(175, 238, 238),
  WATER_COLOR_IN_BEAKER: new Color(175, 238, 238, NOMINAL_WATER_OPACITY),
  WATER_STEAM_COLOR: new Color(255, 255, 255),
  OLIVE_OIL_COLOR_IN_BEAKER: new Color(255, 210, 0),
  OLIVE_OIL_STEAM_COLOR: new Color(230, 230, 230),
  FIRST_SCREEN_BACKGROUND_COLOR: FIRST_SCREEN_BACKGROUND_COLOR,
  SECOND_SCREEN_BACKGROUND_COLOR: SECOND_SCREEN_BACKGROUND_COLOR,
  CONTROL_PANEL_BACKGROUND_COLOR: new Color(229, 236, 255),
  // Pale gray purple. AP, AR, and CK like this.
  TEMPERATURE_SENSOR_INACTIVE_COLOR: new Color('white'),
  // appearance of controls
  CONTROL_PANEL_OUTLINE_LINE_WIDTH: 1.5,
  CONTROL_PANEL_OUTLINE_STROKE: new Color(120, 120, 120),
  CLOCK_CONTROL_BACKGROUND_COLOR: new Color(160, 160, 160),
  ENERGY_SYMBOLS_PANEL_CORNER_RADIUS: 6,
  ENERGY_SYMBOLS_PANEL_MIN_WIDTH: 215,
  ENERGY_SYMBOLS_PANEL_TEXT_MAX_WIDTH: 180,
  ENERGY_SYMBOLS_PANEL_CHECKBOX_Y_DILATION: 5,
  CONTROL_PANEL_CORNER_RADIUS: 10,
  RESET_ALL_BUTTON_RADIUS: 20,
  PLAY_PAUSE_BUTTON_RADIUS: 20,
  STEP_FORWARD_BUTTON_RADIUS: 15,
  // used to scale down the element base image, which is used in multiple system elements
  ELEMENT_BASE_WIDTH: 72,
  // used to scale down the wire images, which are used in multiple system elements
  WIRE_IMAGE_SCALE: 0.48,
  // model-view transform scale factors for each screen - smaller zooms out, larger zooms in
  INTRO_MVT_SCALE_FACTOR: 1700,
  SYSTEMS_MVT_SCALE_FACTOR: 2200,
  // constants for energy chunks
  ENERGY_CHUNK_VELOCITY: 0.04,
  // in meters/sec
  ENERGY_CHUNK_WIDTH: 19,
  // in screen coords, which are close to pixels. Empirically determined to look nice.

  // the maximum number of times that the energy chunk distribution algorithm should run when initializing energy
  // chunks in their containers. Containers like the water beaker can take more cycles than this threshold, but cause
  // the sim reset time to be too long if not limited.
  MAX_NUMBER_OF_INITIALIZATION_DISTRIBUTION_CYCLES: 500,
  // max travel height of energy chunks, in meters. the y-center position and zoom factors are different on each
  // screen, so these were empirically determined to visually match on both screens
  INTRO_SCREEN_ENERGY_CHUNK_MAX_TRAVEL_HEIGHT: 0.85,
  SYSTEMS_SCREEN_ENERGY_CHUNK_MAX_TRAVEL_HEIGHT: 0.55,
  // constants that define physical parameters of various objects
  WATER_SPECIFIC_HEAT: 3000,
  // In J/kg-K.  The real value for water is 4186, but this was adjusted so that there
  // aren't too many chunks and so that a chunk is needed as soon as heating starts.
  WATER_DENSITY: 1000.0,
  // In kg/m^3, source = design document (and common knowledge).
  OLIVE_OIL_SPECIFIC_HEAT: 1411,
  // In J/kg-K. real value is 1970 (need to confirm) but this is scaled to match water
  OLIVE_OIL_DENSITY: 916.0,
  // In kg/m^3, need to confirm with design doc
  BRICK_SPECIFIC_HEAT: BRICK_SPECIFIC_HEAT,
  BRICK_DENSITY: BRICK_DENSITY,
  IRON_SPECIFIC_HEAT: 450,
  // In J/kg-K, source = design doc
  IRON_DENSITY: 7800,
  // In kg/m^3, source = design doc
  BLOCK_SURFACE_WIDTH: 0.045,
  BLOCK_PERSPECTIVE_EDGE_PROPORTION: Math.sqrt(Math.pow(Z_TO_X_OFFSET_MULTIPLIER, 2) + Math.pow(Z_TO_Y_OFFSET_MULTIPLIER, 2)),
  BLOCK_PERSPECTIVE_ANGLE: Math.atan2(-Z_TO_Y_OFFSET_MULTIPLIER, -Z_TO_X_OFFSET_MULTIPLIER),
  FADE_COEFFICIENT_IN_AIR: 0.005,
  // constants for the burners.
  INITIAL_FLUID_PROPORTION: 0.5,
  BURNER_EDGE_TO_HEIGHT_RATIO: 0.2,
  // multiplier empirically determined for best look
  BURNER_PERSPECTIVE_ANGLE: Math.PI / 4,
  // positive is counterclockwise, a value of 0 produces a non-skewed rectangle

  // constants used for creating projections that have a 3D-ish look
  Z_TO_X_OFFSET_MULTIPLIER: Z_TO_X_OFFSET_MULTIPLIER,
  Z_TO_Y_OFFSET_MULTIPLIER: Z_TO_Y_OFFSET_MULTIPLIER,
  // use the default layout bounds
  SCREEN_LAYOUT_BOUNDS: ScreenView.DEFAULT_LAYOUT_BOUNDS

  // A note for energy-forms-and-changes-strings_en.json (which cannot have comments): the keys for the screen names
  // are incorrect, as they do not follow the form 'screen.{{screenName}}', but the sim was published and translated
  // before that was noticed. See https://github.com/phetsims/energy-forms-and-changes/issues/249 for discussion.
};

energyFormsAndChanges.register('EFACConstants', EFACConstants);
export default EFACConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaW5lYXJGdW5jdGlvbiIsIlV0aWxzIiwiVmVjdG9yMiIsIlNjcmVlblZpZXciLCJDb2xvciIsImVuZXJneUZvcm1zQW5kQ2hhbmdlcyIsIlpfVE9fWF9PRkZTRVRfTVVMVElQTElFUiIsIlpfVE9fWV9PRkZTRVRfTVVMVElQTElFUiIsIlJPT01fVEVNUEVSQVRVUkUiLCJXQVRFUl9GUkVFWklOR19QT0lOVF9URU1QRVJBVFVSRSIsIkJSSUNLX0RFTlNJVFkiLCJCUklDS19TUEVDSUZJQ19IRUFUIiwiQkxPQ0tfU1VSRkFDRV9XSURUSCIsIkJSSUNLX0VORVJHWV9BVF9ST09NX1RFTVBFUkFUVVJFIiwiTWF0aCIsInBvdyIsIkJSSUNLX0VORVJHWV9BVF9GUkVFWklOR19URU1QRVJBVFVSRSIsIkxPV19FTkVSR1lfRk9SX01BUF9GVU5DVElPTiIsIkhJR0hfRU5FUkdZX0ZPUl9NQVBfRlVOQ1RJT04iLCJOVU1fRU5FUkdZX0NIVU5LU19JTl9CUklDS19BVF9GUkVFWklORyIsIk5VTV9FTkVSR1lfQ0hVTktTX0lOX0JSSUNLX0FUX1JPT01fVEVNUCIsIkZSQU1FU19QRVJfU0VDT05EIiwiU0lNX1RJTUVfUEVSX1RJQ0tfTk9STUFMIiwiTk9NSU5BTF9XQVRFUl9PUEFDSVRZIiwiRklSU1RfU0NSRUVOX0JBQ0tHUk9VTkRfQ09MT1IiLCJTRUNPTkRfU0NSRUVOX0JBQ0tHUk9VTkRfQ09MT1IiLCJNQVBfRU5FUkdZX1RPX05VTV9DSFVOS1MiLCJNQVBfTlVNX0NIVU5LU19UT19FTkVSR1kiLCJFRkFDQ29uc3RhbnRzIiwiSVJPTl9LRVkiLCJCUklDS19LRVkiLCJXQVRFUl9LRVkiLCJPTElWRV9PSUxfS0VZIiwiTUFYX05VTUJFUl9PRl9JTlRST19FTEVNRU5UUyIsIk1BWF9OVU1CRVJfT0ZfSU5UUk9fQlVSTkVSUyIsIk1BWF9OVU1CRVJfT0ZfSU5UUk9fQkVBS0VSUyIsIm1heERUIiwiV0FURVJfQk9JTElOR19QT0lOVF9URU1QRVJBVFVSRSIsIk9MSVZFX09JTF9CT0lMSU5HX1BPSU5UX1RFTVBFUkFUVVJFIiwiTUFYX0hFQVRfRVhDSEFOR0VfVElNRV9TVEVQIiwiTUFQX1pfVE9fWFlfT0ZGU0VUIiwielZhbHVlIiwiU0lHTklGSUNBTlRfVEVNUEVSQVRVUkVfRElGRkVSRU5DRSIsIkVORVJHWV9UT19OVU1fQ0hVTktTX01BUFBFUiIsImVuZXJneSIsIm1heCIsInJvdW5kU3ltbWV0cmljIiwiZXZhbHVhdGUiLCJFTkVSR1lfUEVSX0NIVU5LIiwiVEVNUEVSQVRVUkVTX0VRVUFMX1RIUkVTSE9MRCIsIk1BWF9FTkVSR1lfUFJPRFVDVElPTl9SQVRFIiwiV0FURVJfQ09MT1JfT1BBUVVFIiwiV0FURVJfQ09MT1JfSU5fQkVBS0VSIiwiV0FURVJfU1RFQU1fQ09MT1IiLCJPTElWRV9PSUxfQ09MT1JfSU5fQkVBS0VSIiwiT0xJVkVfT0lMX1NURUFNX0NPTE9SIiwiQ09OVFJPTF9QQU5FTF9CQUNLR1JPVU5EX0NPTE9SIiwiVEVNUEVSQVRVUkVfU0VOU09SX0lOQUNUSVZFX0NPTE9SIiwiQ09OVFJPTF9QQU5FTF9PVVRMSU5FX0xJTkVfV0lEVEgiLCJDT05UUk9MX1BBTkVMX09VVExJTkVfU1RST0tFIiwiQ0xPQ0tfQ09OVFJPTF9CQUNLR1JPVU5EX0NPTE9SIiwiRU5FUkdZX1NZTUJPTFNfUEFORUxfQ09STkVSX1JBRElVUyIsIkVORVJHWV9TWU1CT0xTX1BBTkVMX01JTl9XSURUSCIsIkVORVJHWV9TWU1CT0xTX1BBTkVMX1RFWFRfTUFYX1dJRFRIIiwiRU5FUkdZX1NZTUJPTFNfUEFORUxfQ0hFQ0tCT1hfWV9ESUxBVElPTiIsIkNPTlRST0xfUEFORUxfQ09STkVSX1JBRElVUyIsIlJFU0VUX0FMTF9CVVRUT05fUkFESVVTIiwiUExBWV9QQVVTRV9CVVRUT05fUkFESVVTIiwiU1RFUF9GT1JXQVJEX0JVVFRPTl9SQURJVVMiLCJFTEVNRU5UX0JBU0VfV0lEVEgiLCJXSVJFX0lNQUdFX1NDQUxFIiwiSU5UUk9fTVZUX1NDQUxFX0ZBQ1RPUiIsIlNZU1RFTVNfTVZUX1NDQUxFX0ZBQ1RPUiIsIkVORVJHWV9DSFVOS19WRUxPQ0lUWSIsIkVORVJHWV9DSFVOS19XSURUSCIsIk1BWF9OVU1CRVJfT0ZfSU5JVElBTElaQVRJT05fRElTVFJJQlVUSU9OX0NZQ0xFUyIsIklOVFJPX1NDUkVFTl9FTkVSR1lfQ0hVTktfTUFYX1RSQVZFTF9IRUlHSFQiLCJTWVNURU1TX1NDUkVFTl9FTkVSR1lfQ0hVTktfTUFYX1RSQVZFTF9IRUlHSFQiLCJXQVRFUl9TUEVDSUZJQ19IRUFUIiwiV0FURVJfREVOU0lUWSIsIk9MSVZFX09JTF9TUEVDSUZJQ19IRUFUIiwiT0xJVkVfT0lMX0RFTlNJVFkiLCJJUk9OX1NQRUNJRklDX0hFQVQiLCJJUk9OX0RFTlNJVFkiLCJCTE9DS19QRVJTUEVDVElWRV9FREdFX1BST1BPUlRJT04iLCJzcXJ0IiwiQkxPQ0tfUEVSU1BFQ1RJVkVfQU5HTEUiLCJhdGFuMiIsIkZBREVfQ09FRkZJQ0lFTlRfSU5fQUlSIiwiSU5JVElBTF9GTFVJRF9QUk9QT1JUSU9OIiwiQlVSTkVSX0VER0VfVE9fSEVJR0hUX1JBVElPIiwiQlVSTkVSX1BFUlNQRUNUSVZFX0FOR0xFIiwiUEkiLCJTQ1JFRU5fTEFZT1VUX0JPVU5EUyIsIkRFRkFVTFRfTEFZT1VUX0JPVU5EUyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRUZBQ0NvbnN0YW50cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBzaGFyZWQgY29uc3RhbnRzIGZvciB0aGUgRW5lcmd5IEZvcm1zIGFuZCBDaGFuZ2VzIHNpbXVsYXRpb25cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBMaW5lYXJGdW5jdGlvbiBmcm9tICcuLi8uLi8uLi9kb3QvanMvTGluZWFyRnVuY3Rpb24uanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIGZyb20gJy4uL2VuZXJneUZvcm1zQW5kQ2hhbmdlcy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHMgdXNlZCBmb3IgY3JlYXRpbmcgcHJvamVjdGlvbnMgdGhhdCBoYXZlIGEgM0QtaXNoIGxvb2suXHJcbmNvbnN0IFpfVE9fWF9PRkZTRVRfTVVMVElQTElFUiA9IC0wLjI1O1xyXG5jb25zdCBaX1RPX1lfT0ZGU0VUX01VTFRJUExJRVIgPSAtMC4yNTtcclxuXHJcbi8vIHBoeXNpY2FsIHRlbXBlcmF0dXJlIGNvbnN0YW50c1xyXG5jb25zdCBST09NX1RFTVBFUkFUVVJFID0gMjk2OyAvLyBpbiBkZWdyZWVzIEtlbHZpblxyXG5jb25zdCBXQVRFUl9GUkVFWklOR19QT0lOVF9URU1QRVJBVFVSRSA9IDI3My4xNTsgLy8gaW4gZGVncmVlcyBLZWx2aW5cclxuXHJcbi8vIGNvbnN0YW50cyB0aGF0IGRlZmluZSBwaHlzaWNhbCBwYXJhbWV0ZXJzIG9mIHZhcmlvdXMgcmVjdGFuZ3VsYXIgb2JqZWN0cy5cclxuY29uc3QgQlJJQ0tfREVOU0lUWSA9IDMzMDA7IC8vIGluIGtnL21eMywgc291cmNlID0gZGVzaWduIGRvY3VtZW50IHBsdXMgc29tZSB0d2Vha2luZyB0byBrZWVwIGNodW5rIG51bWJlcnMgcmVhc29uYWJsZVxyXG5jb25zdCBCUklDS19TUEVDSUZJQ19IRUFUID0gODQwOyAvLyBpbiBKL2tnLUssIHNvdXJjZSA9IGRlc2lnbiBkb2N1bWVudFxyXG5jb25zdCBCTE9DS19TVVJGQUNFX1dJRFRIID0gMC4wNDU7XHJcblxyXG4vLyBicmljayBjb25zdGFudHMgbmVlZGVkIGZvciBlbmVyZ3kgY2h1bmsgbWFwcGluZ1xyXG5jb25zdCBCUklDS19FTkVSR1lfQVRfUk9PTV9URU1QRVJBVFVSRSA9IE1hdGgucG93KCBCTE9DS19TVVJGQUNFX1dJRFRILCAzICkgKiBCUklDS19ERU5TSVRZICogQlJJQ0tfU1BFQ0lGSUNfSEVBVCAqIFJPT01fVEVNUEVSQVRVUkU7IC8vIEluIGpvdWxlcy5cclxuY29uc3QgQlJJQ0tfRU5FUkdZX0FUX0ZSRUVaSU5HX1RFTVBFUkFUVVJFID0gTWF0aC5wb3coIEJMT0NLX1NVUkZBQ0VfV0lEVEgsIDMgKSAqIEJSSUNLX0RFTlNJVFkgKiBCUklDS19TUEVDSUZJQ19IRUFUICogV0FURVJfRlJFRVpJTkdfUE9JTlRfVEVNUEVSQVRVUkU7IC8vIEluIGpvdWxlcy5cclxuXHJcbi8vIGNvbnN0YW50cyBmb3IgdGVtcGVyYXR1cmUtZW5lcmd5IG1hcHBpbmcgZnVuY3Rpb25zXHJcbmNvbnN0IExPV19FTkVSR1lfRk9SX01BUF9GVU5DVElPTiA9IEJSSUNLX0VORVJHWV9BVF9GUkVFWklOR19URU1QRVJBVFVSRTtcclxuY29uc3QgSElHSF9FTkVSR1lfRk9SX01BUF9GVU5DVElPTiA9IEJSSUNLX0VORVJHWV9BVF9ST09NX1RFTVBFUkFUVVJFO1xyXG5cclxuLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5jb25zdCBOVU1fRU5FUkdZX0NIVU5LU19JTl9CUklDS19BVF9GUkVFWklORyA9IDEuMjU7XHJcbmNvbnN0IE5VTV9FTkVSR1lfQ0hVTktTX0lOX0JSSUNLX0FUX1JPT01fVEVNUCA9IDIuNDsgLy8gY2xvc2UgdG8gcm91bmRpbmcgdG8gMyBzbyB0aGF0IGxpdHRsZSBlbmVyZ3kgbmVlZGVkIHRvIHRyYW5zZmVyIGZpcnN0IGNodW5rXHJcblxyXG4vLyB0aW1lIHZhbHVlcyBmb3Igbm9ybWFsIGFuZCBmYXN0LWZvcndhcmQgbW90aW9uXHJcbmNvbnN0IEZSQU1FU19QRVJfU0VDT05EID0gNjAuMDtcclxuY29uc3QgU0lNX1RJTUVfUEVSX1RJQ0tfTk9STUFMID0gMSAvIEZSQU1FU19QRVJfU0VDT05EO1xyXG5cclxuLy8gY29sb3JzXHJcbmNvbnN0IE5PTUlOQUxfV0FURVJfT1BBQ0lUWSA9IDAuNzU7XHJcbmNvbnN0IEZJUlNUX1NDUkVFTl9CQUNLR1JPVU5EX0NPTE9SID0gbmV3IENvbG9yKCAyNDksIDI0NCwgMjA1ICk7XHJcbmNvbnN0IFNFQ09ORF9TQ1JFRU5fQkFDS0dST1VORF9DT0xPUiA9IG5ldyBDb2xvciggMjQ5LCAyNDQsIDIwNSApO1xyXG5cclxuLy8gbWFwcGluZyBmdW5jdGlvbiB0aGF0IG1hcHMgdGhlIGVuZXJneSB0byB0aGUgbnVtYmVyIG9mIGVuZXJneSBjaHVua3NcclxuY29uc3QgTUFQX0VORVJHWV9UT19OVU1fQ0hVTktTID0gbmV3IExpbmVhckZ1bmN0aW9uKFxyXG4gIExPV19FTkVSR1lfRk9SX01BUF9GVU5DVElPTixcclxuICBISUdIX0VORVJHWV9GT1JfTUFQX0ZVTkNUSU9OLFxyXG4gIE5VTV9FTkVSR1lfQ0hVTktTX0lOX0JSSUNLX0FUX0ZSRUVaSU5HLFxyXG4gIE5VTV9FTkVSR1lfQ0hVTktTX0lOX0JSSUNLX0FUX1JPT01fVEVNUFxyXG4pO1xyXG5cclxuLy8gbWFwcGluZyBmdW5jdGlvbiB0aGF0IG1hcHMgdGhlIG51bWJlciBvZiBjaHVua3Mgb2YgZW5lcmd5IHRvIHRoZSBlbmVyZ3kgdmFsdWVcclxuY29uc3QgTUFQX05VTV9DSFVOS1NfVE9fRU5FUkdZID0gbmV3IExpbmVhckZ1bmN0aW9uKFxyXG4gIE5VTV9FTkVSR1lfQ0hVTktTX0lOX0JSSUNLX0FUX0ZSRUVaSU5HLFxyXG4gIE5VTV9FTkVSR1lfQ0hVTktTX0lOX0JSSUNLX0FUX1JPT01fVEVNUCxcclxuICBMT1dfRU5FUkdZX0ZPUl9NQVBfRlVOQ1RJT04sXHJcbiAgSElHSF9FTkVSR1lfRk9SX01BUF9GVU5DVElPTlxyXG4pO1xyXG5cclxuY29uc3QgRUZBQ0NvbnN0YW50cyA9IHtcclxuXHJcbiAgLy8gaW50cm8gc2NyZWVuIGN1c3RvbWl6YXRpb25cclxuICBJUk9OX0tFWTogJ2lyb24nLCAvLyB1c2VkIHRvIHZhbGlkYXRlIHF1ZXJ5IHBhcmFtZXRlciB2YWx1ZXMgYW5kIG1hcCB0byB0aGUgY29ycmVzcG9uZGluZyBFbnVtZXJhdGlvbiB0eXBlXHJcbiAgQlJJQ0tfS0VZOiAnYnJpY2snLFxyXG4gIFdBVEVSX0tFWTogJ3dhdGVyJyxcclxuICBPTElWRV9PSUxfS0VZOiAnb2xpdmVPaWwnLFxyXG5cclxuICAvLyBtb2RpZnkgd2l0aCBjYXV0aW9uIC0gdGhlIGludHJvIHNjcmVlbiBlbGVtZW50IGxheW91dCBoZWF2aWx5IHJlbGllcyBvbiB0aGVzZVxyXG4gIE1BWF9OVU1CRVJfT0ZfSU5UUk9fRUxFTUVOVFM6IDQsXHJcbiAgTUFYX05VTUJFUl9PRl9JTlRST19CVVJORVJTOiAyLFxyXG4gIE1BWF9OVU1CRVJfT0ZfSU5UUk9fQkVBS0VSUzogMixcclxuXHJcbiAgLy8gQ2FwIGxhcmdlIGR0IHZhbHVlcywgd2hpY2ggb2NjdXIgd2hlbiB0aGUgdGFiIGNvbnRhaW5pbmcgdGhlIHNpbSBoYWQgYmVlbiBoaWRkZW4gYW5kIHRoZW4gcmUtc2hvd25cclxuICBtYXhEVDogMC4xLFxyXG5cclxuICAvLyBwaHlzaWNhbCB0ZW1wZXJhdHVyZSBjb25zdGFudHNcclxuICBST09NX1RFTVBFUkFUVVJFOiBST09NX1RFTVBFUkFUVVJFLFxyXG4gIFdBVEVSX0ZSRUVaSU5HX1BPSU5UX1RFTVBFUkFUVVJFOiBXQVRFUl9GUkVFWklOR19QT0lOVF9URU1QRVJBVFVSRSwgLy8gaW4gZGVncmVlcyBLZWx2aW5cclxuICBXQVRFUl9CT0lMSU5HX1BPSU5UX1RFTVBFUkFUVVJFOiAzNzMuMTUsIC8vIGluIGRlZ3JlZXMgS2VsdmluXHJcbiAgT0xJVkVfT0lMX0JPSUxJTkdfUE9JTlRfVEVNUEVSQVRVUkU6IDU3My4xNSwgLy8gaW4gZGVncmVlcyBLZWx2aW5cclxuXHJcbiAgLy8gbWFwcGluZyBmdW5jdGlvbiB0aGF0IG1hcHMgdGhlIGVuZXJneSB0byB0aGUgbnVtYmVyIG9mIGVuZXJneSBjaHVua3NcclxuICBNQVBfRU5FUkdZX1RPX05VTV9DSFVOS1M6IE1BUF9FTkVSR1lfVE9fTlVNX0NIVU5LUyxcclxuXHJcbiAgLy8gbWFwcGluZyBmdW5jdGlvbiB0aGF0IG1hcHMgdGhlIG51bWJlciBvZiBjaHVua3Mgb2YgZW5lcmd5IHRvIHRoZSBlbmVyZ3kgdmFsdWVcclxuICBNQVBfTlVNX0NIVU5LU19UT19FTkVSR1k6IE1BUF9OVU1fQ0hVTktTX1RPX0VORVJHWSxcclxuXHJcbiAgLy8gdGltZSB2YWx1ZXMgZm9yIG5vcm1hbCBhbmQgZmFzdC1mb3J3YXJkIG1vdGlvblxyXG4gIEZSQU1FU19QRVJfU0VDT05EOiBGUkFNRVNfUEVSX1NFQ09ORCxcclxuICBTSU1fVElNRV9QRVJfVElDS19OT1JNQUw6IDEgLyBGUkFNRVNfUEVSX1NFQ09ORCxcclxuICBNQVhfSEVBVF9FWENIQU5HRV9USU1FX1NURVA6IFNJTV9USU1FX1BFUl9USUNLX05PUk1BTCxcclxuXHJcbiAgTUFQX1pfVE9fWFlfT0ZGU0VUOiB6VmFsdWUgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCB6VmFsdWUgKiBaX1RPX1hfT0ZGU0VUX01VTFRJUExJRVIsIHpWYWx1ZSAqIFpfVE9fWV9PRkZTRVRfTVVMVElQTElFUiApO1xyXG4gIH0sXHJcblxyXG4gIC8vIGZvciBjb21wYXJpbmcgdGVtcGVyYXR1cmVzXHJcbiAgU0lHTklGSUNBTlRfVEVNUEVSQVRVUkVfRElGRkVSRU5DRTogMUUtMywgLy8gaW4gZGVncmVlcyBLZWx2aW5cclxuXHJcbiAgRU5FUkdZX1RPX05VTV9DSFVOS1NfTUFQUEVSOiBlbmVyZ3kgPT4ge1xyXG4gICAgcmV0dXJuIE1hdGgubWF4KCBVdGlscy5yb3VuZFN5bW1ldHJpYyggTUFQX0VORVJHWV9UT19OVU1fQ0hVTktTLmV2YWx1YXRlKCBlbmVyZ3kgKSApLCAwICk7XHJcbiAgfSxcclxuXHJcbiAgRU5FUkdZX1BFUl9DSFVOSzogTUFQX05VTV9DSFVOS1NfVE9fRU5FUkdZLmV2YWx1YXRlKCAyICkgLSBNQVBfTlVNX0NIVU5LU19UT19FTkVSR1kuZXZhbHVhdGUoIDEgKSxcclxuXHJcbiAgLy8gdGhyZXNob2xkIGZvciBkZWNpZGluZyB3aGVuIHR3byB0ZW1wZXJhdHVyZXMgY2FuIGJlIGNvbnNpZGVyZWQgZXF1YWxcclxuICBURU1QRVJBVFVSRVNfRVFVQUxfVEhSRVNIT0xEOiAxRS02LCAvLyBpbiBkZWdyZWVzIEtlbHZpblxyXG5cclxuICAvLyBDb25zdGFudCB1c2VkIGJ5IGFsbCBvZiB0aGUgXCJlbmVyZ3kgc3lzdGVtc1wiIGluIG9yZGVyIHRvIGtlZXAgdGhlIGFtb3VudCBvZiBlbmVyZ3kgZ2VuZXJhdGVkLCBjb252ZXJ0ZWQsIGFuZFxyXG4gIC8vIGNvbnN1bWVkIGNvbnNpc3RlbnQuXHJcbiAgTUFYX0VORVJHWV9QUk9EVUNUSU9OX1JBVEU6IDEwMDAwLCAvLyBpbiBqb3VsZXMvc2VjXHJcblxyXG4gIC8vIGNvbG9yc1xyXG4gIE5PTUlOQUxfV0FURVJfT1BBQ0lUWTogMC43LFxyXG4gIFdBVEVSX0NPTE9SX09QQVFVRTogbmV3IENvbG9yKCAxNzUsIDIzOCwgMjM4ICksXHJcbiAgV0FURVJfQ09MT1JfSU5fQkVBS0VSOiBuZXcgQ29sb3IoIDE3NSwgMjM4LCAyMzgsIE5PTUlOQUxfV0FURVJfT1BBQ0lUWSApLFxyXG4gIFdBVEVSX1NURUFNX0NPTE9SOiBuZXcgQ29sb3IoIDI1NSwgMjU1LCAyNTUgKSxcclxuICBPTElWRV9PSUxfQ09MT1JfSU5fQkVBS0VSOiBuZXcgQ29sb3IoIDI1NSwgMjEwLCAwICksXHJcbiAgT0xJVkVfT0lMX1NURUFNX0NPTE9SOiBuZXcgQ29sb3IoIDIzMCwgMjMwLCAyMzAgKSxcclxuICBGSVJTVF9TQ1JFRU5fQkFDS0dST1VORF9DT0xPUjogRklSU1RfU0NSRUVOX0JBQ0tHUk9VTkRfQ09MT1IsXHJcbiAgU0VDT05EX1NDUkVFTl9CQUNLR1JPVU5EX0NPTE9SOiBTRUNPTkRfU0NSRUVOX0JBQ0tHUk9VTkRfQ09MT1IsXHJcbiAgQ09OVFJPTF9QQU5FTF9CQUNLR1JPVU5EX0NPTE9SOiBuZXcgQ29sb3IoIDIyOSwgMjM2LCAyNTUgKSwgLy8gUGFsZSBncmF5IHB1cnBsZS4gQVAsIEFSLCBhbmQgQ0sgbGlrZSB0aGlzLlxyXG4gIFRFTVBFUkFUVVJFX1NFTlNPUl9JTkFDVElWRV9DT0xPUjogbmV3IENvbG9yKCAnd2hpdGUnICksXHJcblxyXG4gIC8vIGFwcGVhcmFuY2Ugb2YgY29udHJvbHNcclxuICBDT05UUk9MX1BBTkVMX09VVExJTkVfTElORV9XSURUSDogMS41LFxyXG4gIENPTlRST0xfUEFORUxfT1VUTElORV9TVFJPS0U6IG5ldyBDb2xvciggMTIwLCAxMjAsIDEyMCApLFxyXG4gIENMT0NLX0NPTlRST0xfQkFDS0dST1VORF9DT0xPUjogbmV3IENvbG9yKCAxNjAsIDE2MCwgMTYwICksXHJcbiAgRU5FUkdZX1NZTUJPTFNfUEFORUxfQ09STkVSX1JBRElVUzogNixcclxuICBFTkVSR1lfU1lNQk9MU19QQU5FTF9NSU5fV0lEVEg6IDIxNSxcclxuICBFTkVSR1lfU1lNQk9MU19QQU5FTF9URVhUX01BWF9XSURUSDogMTgwLFxyXG4gIEVORVJHWV9TWU1CT0xTX1BBTkVMX0NIRUNLQk9YX1lfRElMQVRJT046IDUsXHJcbiAgQ09OVFJPTF9QQU5FTF9DT1JORVJfUkFESVVTOiAxMCxcclxuICBSRVNFVF9BTExfQlVUVE9OX1JBRElVUzogMjAsXHJcbiAgUExBWV9QQVVTRV9CVVRUT05fUkFESVVTOiAyMCxcclxuICBTVEVQX0ZPUldBUkRfQlVUVE9OX1JBRElVUzogMTUsXHJcblxyXG4gIC8vIHVzZWQgdG8gc2NhbGUgZG93biB0aGUgZWxlbWVudCBiYXNlIGltYWdlLCB3aGljaCBpcyB1c2VkIGluIG11bHRpcGxlIHN5c3RlbSBlbGVtZW50c1xyXG4gIEVMRU1FTlRfQkFTRV9XSURUSDogNzIsXHJcblxyXG4gIC8vIHVzZWQgdG8gc2NhbGUgZG93biB0aGUgd2lyZSBpbWFnZXMsIHdoaWNoIGFyZSB1c2VkIGluIG11bHRpcGxlIHN5c3RlbSBlbGVtZW50c1xyXG4gIFdJUkVfSU1BR0VfU0NBTEU6IDAuNDgsXHJcblxyXG4gIC8vIG1vZGVsLXZpZXcgdHJhbnNmb3JtIHNjYWxlIGZhY3RvcnMgZm9yIGVhY2ggc2NyZWVuIC0gc21hbGxlciB6b29tcyBvdXQsIGxhcmdlciB6b29tcyBpblxyXG4gIElOVFJPX01WVF9TQ0FMRV9GQUNUT1I6IDE3MDAsXHJcbiAgU1lTVEVNU19NVlRfU0NBTEVfRkFDVE9SOiAyMjAwLFxyXG5cclxuICAvLyBjb25zdGFudHMgZm9yIGVuZXJneSBjaHVua3NcclxuICBFTkVSR1lfQ0hVTktfVkVMT0NJVFk6IDAuMDQsIC8vIGluIG1ldGVycy9zZWNcclxuICBFTkVSR1lfQ0hVTktfV0lEVEg6IDE5LCAvLyBpbiBzY3JlZW4gY29vcmRzLCB3aGljaCBhcmUgY2xvc2UgdG8gcGl4ZWxzLiBFbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIGxvb2sgbmljZS5cclxuXHJcbiAgLy8gdGhlIG1heGltdW0gbnVtYmVyIG9mIHRpbWVzIHRoYXQgdGhlIGVuZXJneSBjaHVuayBkaXN0cmlidXRpb24gYWxnb3JpdGhtIHNob3VsZCBydW4gd2hlbiBpbml0aWFsaXppbmcgZW5lcmd5XHJcbiAgLy8gY2h1bmtzIGluIHRoZWlyIGNvbnRhaW5lcnMuIENvbnRhaW5lcnMgbGlrZSB0aGUgd2F0ZXIgYmVha2VyIGNhbiB0YWtlIG1vcmUgY3ljbGVzIHRoYW4gdGhpcyB0aHJlc2hvbGQsIGJ1dCBjYXVzZVxyXG4gIC8vIHRoZSBzaW0gcmVzZXQgdGltZSB0byBiZSB0b28gbG9uZyBpZiBub3QgbGltaXRlZC5cclxuICBNQVhfTlVNQkVSX09GX0lOSVRJQUxJWkFUSU9OX0RJU1RSSUJVVElPTl9DWUNMRVM6IDUwMCxcclxuXHJcbiAgLy8gbWF4IHRyYXZlbCBoZWlnaHQgb2YgZW5lcmd5IGNodW5rcywgaW4gbWV0ZXJzLiB0aGUgeS1jZW50ZXIgcG9zaXRpb24gYW5kIHpvb20gZmFjdG9ycyBhcmUgZGlmZmVyZW50IG9uIGVhY2hcclxuICAvLyBzY3JlZW4sIHNvIHRoZXNlIHdlcmUgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byB2aXN1YWxseSBtYXRjaCBvbiBib3RoIHNjcmVlbnNcclxuICBJTlRST19TQ1JFRU5fRU5FUkdZX0NIVU5LX01BWF9UUkFWRUxfSEVJR0hUOiAwLjg1LFxyXG4gIFNZU1RFTVNfU0NSRUVOX0VORVJHWV9DSFVOS19NQVhfVFJBVkVMX0hFSUdIVDogMC41NSxcclxuXHJcbiAgLy8gY29uc3RhbnRzIHRoYXQgZGVmaW5lIHBoeXNpY2FsIHBhcmFtZXRlcnMgb2YgdmFyaW91cyBvYmplY3RzXHJcbiAgV0FURVJfU1BFQ0lGSUNfSEVBVDogMzAwMCwgLy8gSW4gSi9rZy1LLiAgVGhlIHJlYWwgdmFsdWUgZm9yIHdhdGVyIGlzIDQxODYsIGJ1dCB0aGlzIHdhcyBhZGp1c3RlZCBzbyB0aGF0IHRoZXJlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXJlbid0IHRvbyBtYW55IGNodW5rcyBhbmQgc28gdGhhdCBhIGNodW5rIGlzIG5lZWRlZCBhcyBzb29uIGFzIGhlYXRpbmcgc3RhcnRzLlxyXG4gIFdBVEVSX0RFTlNJVFk6IDEwMDAuMCwgLy8gSW4ga2cvbV4zLCBzb3VyY2UgPSBkZXNpZ24gZG9jdW1lbnQgKGFuZCBjb21tb24ga25vd2xlZGdlKS5cclxuICBPTElWRV9PSUxfU1BFQ0lGSUNfSEVBVDogMTQxMSwgLy8gSW4gSi9rZy1LLiByZWFsIHZhbHVlIGlzIDE5NzAgKG5lZWQgdG8gY29uZmlybSkgYnV0IHRoaXMgaXMgc2NhbGVkIHRvIG1hdGNoIHdhdGVyXHJcbiAgT0xJVkVfT0lMX0RFTlNJVFk6IDkxNi4wLCAvLyBJbiBrZy9tXjMsIG5lZWQgdG8gY29uZmlybSB3aXRoIGRlc2lnbiBkb2NcclxuICBCUklDS19TUEVDSUZJQ19IRUFUOiBCUklDS19TUEVDSUZJQ19IRUFULFxyXG4gIEJSSUNLX0RFTlNJVFk6IEJSSUNLX0RFTlNJVFksXHJcbiAgSVJPTl9TUEVDSUZJQ19IRUFUOiA0NTAsIC8vIEluIEova2ctSywgc291cmNlID0gZGVzaWduIGRvY1xyXG4gIElST05fREVOU0lUWTogNzgwMCwgLy8gSW4ga2cvbV4zLCBzb3VyY2UgPSBkZXNpZ24gZG9jXHJcbiAgQkxPQ0tfU1VSRkFDRV9XSURUSDogMC4wNDUsXHJcbiAgQkxPQ0tfUEVSU1BFQ1RJVkVfRURHRV9QUk9QT1JUSU9OOiBNYXRoLnNxcnQoIE1hdGgucG93KCBaX1RPX1hfT0ZGU0VUX01VTFRJUExJRVIsIDIgKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgucG93KCBaX1RPX1lfT0ZGU0VUX01VTFRJUExJRVIsIDIgKSApLFxyXG4gIEJMT0NLX1BFUlNQRUNUSVZFX0FOR0xFOiBNYXRoLmF0YW4yKCAtWl9UT19ZX09GRlNFVF9NVUxUSVBMSUVSLCAtWl9UT19YX09GRlNFVF9NVUxUSVBMSUVSICksXHJcbiAgRkFERV9DT0VGRklDSUVOVF9JTl9BSVI6IDAuMDA1LFxyXG5cclxuICAvLyBjb25zdGFudHMgZm9yIHRoZSBidXJuZXJzLlxyXG4gIElOSVRJQUxfRkxVSURfUFJPUE9SVElPTjogMC41LFxyXG4gIEJVUk5FUl9FREdFX1RPX0hFSUdIVF9SQVRJTzogMC4yLCAvLyBtdWx0aXBsaWVyIGVtcGlyaWNhbGx5IGRldGVybWluZWQgZm9yIGJlc3QgbG9va1xyXG4gIEJVUk5FUl9QRVJTUEVDVElWRV9BTkdMRTogTWF0aC5QSSAvIDQsIC8vIHBvc2l0aXZlIGlzIGNvdW50ZXJjbG9ja3dpc2UsIGEgdmFsdWUgb2YgMCBwcm9kdWNlcyBhIG5vbi1za2V3ZWQgcmVjdGFuZ2xlXHJcblxyXG4gIC8vIGNvbnN0YW50cyB1c2VkIGZvciBjcmVhdGluZyBwcm9qZWN0aW9ucyB0aGF0IGhhdmUgYSAzRC1pc2ggbG9va1xyXG4gIFpfVE9fWF9PRkZTRVRfTVVMVElQTElFUjogWl9UT19YX09GRlNFVF9NVUxUSVBMSUVSLFxyXG4gIFpfVE9fWV9PRkZTRVRfTVVMVElQTElFUjogWl9UT19ZX09GRlNFVF9NVUxUSVBMSUVSLFxyXG5cclxuICAvLyB1c2UgdGhlIGRlZmF1bHQgbGF5b3V0IGJvdW5kc1xyXG4gIFNDUkVFTl9MQVlPVVRfQk9VTkRTOiBTY3JlZW5WaWV3LkRFRkFVTFRfTEFZT1VUX0JPVU5EU1xyXG5cclxuICAvLyBBIG5vdGUgZm9yIGVuZXJneS1mb3Jtcy1hbmQtY2hhbmdlcy1zdHJpbmdzX2VuLmpzb24gKHdoaWNoIGNhbm5vdCBoYXZlIGNvbW1lbnRzKTogdGhlIGtleXMgZm9yIHRoZSBzY3JlZW4gbmFtZXNcclxuICAvLyBhcmUgaW5jb3JyZWN0LCBhcyB0aGV5IGRvIG5vdCBmb2xsb3cgdGhlIGZvcm0gJ3NjcmVlbi57e3NjcmVlbk5hbWV9fScsIGJ1dCB0aGUgc2ltIHdhcyBwdWJsaXNoZWQgYW5kIHRyYW5zbGF0ZWRcclxuICAvLyBiZWZvcmUgdGhhdCB3YXMgbm90aWNlZC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lbmVyZ3ktZm9ybXMtYW5kLWNoYW5nZXMvaXNzdWVzLzI0OSBmb3IgZGlzY3Vzc2lvbi5cclxufTtcclxuXHJcbmVuZXJneUZvcm1zQW5kQ2hhbmdlcy5yZWdpc3RlciggJ0VGQUNDb25zdGFudHMnLCBFRkFDQ29uc3RhbnRzICk7XHJcbmV4cG9ydCBkZWZhdWx0IEVGQUNDb25zdGFudHM7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0sbUNBQW1DO0FBQzlELE9BQU9DLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxVQUFVLE1BQU0saUNBQWlDO0FBQ3hELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MscUJBQXFCLE1BQU0sNkJBQTZCOztBQUUvRDtB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