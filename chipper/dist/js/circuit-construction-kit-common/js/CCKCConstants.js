// Copyright 2015-2023, University of Colorado Boulder

/**
 * Constants used in all of the Circuit Construction Kit sims/screens/scenes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import CCKCQueryParameters from './CCKCQueryParameters.js';
import circuitConstructionKitCommon from './circuitConstructionKitCommon.js';

// constants
const FONT_SIZE = 14;

// constants
const CCKCConstants = {
  // Run a paused clock at this rate, see https://github.com/phetsims/circuit-construction-kit-common/issues/572
  // and refined in https://github.com/phetsims/circuit-construction-kit-common/issues/772
  // Still need physics to update, like capacitors clearing and electrons updating.  But don't propagate time very far!
  PAUSED_DT: 1E-6,
  // Available scale factors for the sim stage
  ZOOM_SCALES: [0.5, 1, 1.6],
  // When trying to drop an item back in the toolbox, this is the proportion of its width and height used for the hit box
  RETURN_ITEM_HIT_BOX_RATIO: 0.2,
  // Maximum size for Width or height of icons in the circuit element toolbox or sensor toolbox
  TOOLBOX_ICON_HEIGHT: 31,
  TOOLBOX_ICON_WIDTH: 60,
  // The number of decimal points to display on the voltmeter and ammeter readings
  METER_PRECISION: 2,
  // The resistance of a default resistor, also used in icons
  DEFAULT_RESISTANCE: 10,
  // The default capacitance in farads
  DEFAULT_CAPACITANCE: 0.1,
  // The resistance of a default battery
  DEFAULT_BATTERY_RESISTANCE: CCKCQueryParameters.batteryMinimumResistance,
  // The range of the battery resistance
  BATTERY_RESISTANCE_RANGE: new Range(CCKCQueryParameters.batteryMinimumResistance, 10),
  // Right side panel minWidth
  RIGHT_SIDE_PANEL_MIN_WIDTH: 190,
  // Padding for placement of control panels
  VERTICAL_MARGIN: 5,
  HORIZONTAL_MARGIN: 10,
  // Number of pixels (screen coordinates) that constitutes a tap instead of a drag
  TAP_THRESHOLD: 15,
  // Dimensions of track size found in sliders
  SLIDER_TRACK_SIZE: new Dimension2(160, 5),
  // Uniform scaling for all font awesome node button icons
  FONT_AWESOME_ICON_SCALE: 0.07,
  // Line width for highlighting for selected objects
  HIGHLIGHT_LINE_WIDTH: 5,
  // Default resistivity for Wires and Switches (whose resistance varies with length)
  // R = rho * L / A.  Resistance = resistivity * Length / cross sectional area.
  // https://en.wikipedia.org/wiki/Electrical_resistivity_and_conductivity says copper has rho=1.68E-8 Ohm * m
  // According to http://www.sengpielaudio.com/calculator-cross-section.htm AWG Wire Gauge of 20 has 0.52mm^2 = 5.2e-7m^2
  // Maximum is large enough so that max resistance in a 9v battery slows to a good rate
  WIRE_RESISTIVITY_RANGE: new Range(CCKCQueryParameters.wireResistivity, 0.0168),
  // Ohm * m

  WIRE_CROSS_SECTIONAL_AREA: 5E-4,
  // meters squared

  // Lowest resistance a wire can have
  MINIMUM_WIRE_RESISTANCE: 1E-14,
  // The lowest resistance other CircuitElements can have. This is the resistance of a wire the same length as a resistor
  MINIMUM_RESISTANCE: 1.1E-10,
  // How far to erode the visible bounds for keeping the probes in bounds.
  DRAG_BOUNDS_EROSION: 20,
  // Distance between adjacent charges within a circuit element
  CHARGE_SEPARATION: 28,
  // Length of a battery
  BATTERY_LENGTH: 102,
  // Length of the AC Voltage
  AC_VOLTAGE_LENGTH: 68,
  // Length of a switch, not so wide that electrons appear in the notches
  SWITCH_LENGTH: 112,
  SWITCH_START: 1 / 3,
  // fraction along the switch to the pivot
  SWITCH_END: 2 / 3,
  // fraction along the switch to the connection point

  // Length of a resistor
  RESISTOR_LENGTH: 110,
  FUSE_LENGTH: 110,
  WIRE_LENGTH: 100,
  CAPACITOR_LENGTH: 110,
  INDUCTOR_LENGTH: 110,
  // Length of household items in view coordinates
  COIN_LENGTH: 85,
  ERASER_LENGTH: 90,
  PENCIL_LENGTH: 130,
  HAND_LENGTH: 140,
  DOG_LENGTH: 170,
  DOLLAR_BILL_LENGTH: 140,
  PAPER_CLIP_LENGTH: 75,
  // Length
  SERIES_AMMETER_LENGTH: 121,
  // radius for panels and radio buttons
  CORNER_RADIUS: 6,
  // Line width for schematic view
  SCHEMATIC_LINE_WIDTH: 4,
  // The maximum resistance any circuit element can have.  An open switch is modeled as a high-resistance resistor
  MAX_RESISTANCE: 1000000000,
  // scale applied to the light bulb view
  BULB_SCALE: 2.52,
  // tweaker amount for the high resistance or high voltage components
  HIGH_EDITOR_DELTA: 100,
  // default resistance for the high resistance light bulb or high resistance resistor
  HIGH_RESISTANCE: 1000,
  HIGH_RESISTANCE_RANGE: new Range(100, 10000),
  PANEL_LINE_WIDTH: 1.3,
  THUMB_SIZE: new Dimension2(13, 24),
  MAJOR_TICK_LENGTH: 18,
  MINOR_TICK_LENGTH: 12,
  // The main font size to use for labels and controls
  FONT_SIZE: FONT_SIZE,
  DEFAULT_FONT: new PhetFont(FONT_SIZE),
  // Number of wires that can be dragged out of the toolbox
  NUMBER_OF_WIRES: 50,
  // The number of gridlines in the charts that indicate the progression of time.
  NUMBER_OF_TIME_DIVISIONS: 4,
  CHART_SERIES_COLOR: '#404041',
  DC_CAROUSEL_SCALE: 1.2,
  AC_CAROUSEL_SCALE: 0.85,
  MAX_DT: 0.5 // see https://github.com/phetsims/circuit-construction-kit-common/issues/476 and https://github.com/phetsims/joist/issues/130
};

circuitConstructionKitCommon.register('CCKCConstants', CCKCConstants);
export default CCKCConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiUmFuZ2UiLCJQaGV0Rm9udCIsIkNDS0NRdWVyeVBhcmFtZXRlcnMiLCJjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIiwiRk9OVF9TSVpFIiwiQ0NLQ0NvbnN0YW50cyIsIlBBVVNFRF9EVCIsIlpPT01fU0NBTEVTIiwiUkVUVVJOX0lURU1fSElUX0JPWF9SQVRJTyIsIlRPT0xCT1hfSUNPTl9IRUlHSFQiLCJUT09MQk9YX0lDT05fV0lEVEgiLCJNRVRFUl9QUkVDSVNJT04iLCJERUZBVUxUX1JFU0lTVEFOQ0UiLCJERUZBVUxUX0NBUEFDSVRBTkNFIiwiREVGQVVMVF9CQVRURVJZX1JFU0lTVEFOQ0UiLCJiYXR0ZXJ5TWluaW11bVJlc2lzdGFuY2UiLCJCQVRURVJZX1JFU0lTVEFOQ0VfUkFOR0UiLCJSSUdIVF9TSURFX1BBTkVMX01JTl9XSURUSCIsIlZFUlRJQ0FMX01BUkdJTiIsIkhPUklaT05UQUxfTUFSR0lOIiwiVEFQX1RIUkVTSE9MRCIsIlNMSURFUl9UUkFDS19TSVpFIiwiRk9OVF9BV0VTT01FX0lDT05fU0NBTEUiLCJISUdITElHSFRfTElORV9XSURUSCIsIldJUkVfUkVTSVNUSVZJVFlfUkFOR0UiLCJ3aXJlUmVzaXN0aXZpdHkiLCJXSVJFX0NST1NTX1NFQ1RJT05BTF9BUkVBIiwiTUlOSU1VTV9XSVJFX1JFU0lTVEFOQ0UiLCJNSU5JTVVNX1JFU0lTVEFOQ0UiLCJEUkFHX0JPVU5EU19FUk9TSU9OIiwiQ0hBUkdFX1NFUEFSQVRJT04iLCJCQVRURVJZX0xFTkdUSCIsIkFDX1ZPTFRBR0VfTEVOR1RIIiwiU1dJVENIX0xFTkdUSCIsIlNXSVRDSF9TVEFSVCIsIlNXSVRDSF9FTkQiLCJSRVNJU1RPUl9MRU5HVEgiLCJGVVNFX0xFTkdUSCIsIldJUkVfTEVOR1RIIiwiQ0FQQUNJVE9SX0xFTkdUSCIsIklORFVDVE9SX0xFTkdUSCIsIkNPSU5fTEVOR1RIIiwiRVJBU0VSX0xFTkdUSCIsIlBFTkNJTF9MRU5HVEgiLCJIQU5EX0xFTkdUSCIsIkRPR19MRU5HVEgiLCJET0xMQVJfQklMTF9MRU5HVEgiLCJQQVBFUl9DTElQX0xFTkdUSCIsIlNFUklFU19BTU1FVEVSX0xFTkdUSCIsIkNPUk5FUl9SQURJVVMiLCJTQ0hFTUFUSUNfTElORV9XSURUSCIsIk1BWF9SRVNJU1RBTkNFIiwiQlVMQl9TQ0FMRSIsIkhJR0hfRURJVE9SX0RFTFRBIiwiSElHSF9SRVNJU1RBTkNFIiwiSElHSF9SRVNJU1RBTkNFX1JBTkdFIiwiUEFORUxfTElORV9XSURUSCIsIlRIVU1CX1NJWkUiLCJNQUpPUl9USUNLX0xFTkdUSCIsIk1JTk9SX1RJQ0tfTEVOR1RIIiwiREVGQVVMVF9GT05UIiwiTlVNQkVSX09GX1dJUkVTIiwiTlVNQkVSX09GX1RJTUVfRElWSVNJT05TIiwiQ0hBUlRfU0VSSUVTX0NPTE9SIiwiRENfQ0FST1VTRUxfU0NBTEUiLCJBQ19DQVJPVVNFTF9TQ0FMRSIsIk1BWF9EVCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ0NLQ0NvbnN0YW50cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb25zdGFudHMgdXNlZCBpbiBhbGwgb2YgdGhlIENpcmN1aXQgQ29uc3RydWN0aW9uIEtpdCBzaW1zL3NjcmVlbnMvc2NlbmVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgQ0NLQ1F1ZXJ5UGFyYW1ldGVycyBmcm9tICcuL0NDS0NRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiBmcm9tICcuL2NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24uanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEZPTlRfU0laRSA9IDE0O1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IENDS0NDb25zdGFudHMgPSB7XHJcblxyXG4gIC8vIFJ1biBhIHBhdXNlZCBjbG9jayBhdCB0aGlzIHJhdGUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWNvbW1vbi9pc3N1ZXMvNTcyXHJcbiAgLy8gYW5kIHJlZmluZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1jb21tb24vaXNzdWVzLzc3MlxyXG4gIC8vIFN0aWxsIG5lZWQgcGh5c2ljcyB0byB1cGRhdGUsIGxpa2UgY2FwYWNpdG9ycyBjbGVhcmluZyBhbmQgZWxlY3Ryb25zIHVwZGF0aW5nLiAgQnV0IGRvbid0IHByb3BhZ2F0ZSB0aW1lIHZlcnkgZmFyIVxyXG4gIFBBVVNFRF9EVDogMUUtNixcclxuXHJcbiAgLy8gQXZhaWxhYmxlIHNjYWxlIGZhY3RvcnMgZm9yIHRoZSBzaW0gc3RhZ2VcclxuICBaT09NX1NDQUxFUzogWyAwLjUsIDEsIDEuNiBdLFxyXG5cclxuICAvLyBXaGVuIHRyeWluZyB0byBkcm9wIGFuIGl0ZW0gYmFjayBpbiB0aGUgdG9vbGJveCwgdGhpcyBpcyB0aGUgcHJvcG9ydGlvbiBvZiBpdHMgd2lkdGggYW5kIGhlaWdodCB1c2VkIGZvciB0aGUgaGl0IGJveFxyXG4gIFJFVFVSTl9JVEVNX0hJVF9CT1hfUkFUSU86IDAuMixcclxuXHJcbiAgLy8gTWF4aW11bSBzaXplIGZvciBXaWR0aCBvciBoZWlnaHQgb2YgaWNvbnMgaW4gdGhlIGNpcmN1aXQgZWxlbWVudCB0b29sYm94IG9yIHNlbnNvciB0b29sYm94XHJcbiAgVE9PTEJPWF9JQ09OX0hFSUdIVDogMzEsXHJcbiAgVE9PTEJPWF9JQ09OX1dJRFRIOiA2MCxcclxuXHJcbiAgLy8gVGhlIG51bWJlciBvZiBkZWNpbWFsIHBvaW50cyB0byBkaXNwbGF5IG9uIHRoZSB2b2x0bWV0ZXIgYW5kIGFtbWV0ZXIgcmVhZGluZ3NcclxuICBNRVRFUl9QUkVDSVNJT046IDIsXHJcblxyXG4gIC8vIFRoZSByZXNpc3RhbmNlIG9mIGEgZGVmYXVsdCByZXNpc3RvciwgYWxzbyB1c2VkIGluIGljb25zXHJcbiAgREVGQVVMVF9SRVNJU1RBTkNFOiAxMCxcclxuXHJcbiAgLy8gVGhlIGRlZmF1bHQgY2FwYWNpdGFuY2UgaW4gZmFyYWRzXHJcbiAgREVGQVVMVF9DQVBBQ0lUQU5DRTogMC4xLFxyXG5cclxuICAvLyBUaGUgcmVzaXN0YW5jZSBvZiBhIGRlZmF1bHQgYmF0dGVyeVxyXG4gIERFRkFVTFRfQkFUVEVSWV9SRVNJU1RBTkNFOiBDQ0tDUXVlcnlQYXJhbWV0ZXJzLmJhdHRlcnlNaW5pbXVtUmVzaXN0YW5jZSxcclxuXHJcbiAgLy8gVGhlIHJhbmdlIG9mIHRoZSBiYXR0ZXJ5IHJlc2lzdGFuY2VcclxuICBCQVRURVJZX1JFU0lTVEFOQ0VfUkFOR0U6IG5ldyBSYW5nZSggQ0NLQ1F1ZXJ5UGFyYW1ldGVycy5iYXR0ZXJ5TWluaW11bVJlc2lzdGFuY2UsIDEwICksXHJcblxyXG4gIC8vIFJpZ2h0IHNpZGUgcGFuZWwgbWluV2lkdGhcclxuICBSSUdIVF9TSURFX1BBTkVMX01JTl9XSURUSDogMTkwLFxyXG5cclxuICAvLyBQYWRkaW5nIGZvciBwbGFjZW1lbnQgb2YgY29udHJvbCBwYW5lbHNcclxuICBWRVJUSUNBTF9NQVJHSU46IDUsXHJcbiAgSE9SSVpPTlRBTF9NQVJHSU46IDEwLFxyXG5cclxuICAvLyBOdW1iZXIgb2YgcGl4ZWxzIChzY3JlZW4gY29vcmRpbmF0ZXMpIHRoYXQgY29uc3RpdHV0ZXMgYSB0YXAgaW5zdGVhZCBvZiBhIGRyYWdcclxuICBUQVBfVEhSRVNIT0xEOiAxNSxcclxuXHJcbiAgLy8gRGltZW5zaW9ucyBvZiB0cmFjayBzaXplIGZvdW5kIGluIHNsaWRlcnNcclxuICBTTElERVJfVFJBQ0tfU0laRTogbmV3IERpbWVuc2lvbjIoIDE2MCwgNSApLFxyXG5cclxuICAvLyBVbmlmb3JtIHNjYWxpbmcgZm9yIGFsbCBmb250IGF3ZXNvbWUgbm9kZSBidXR0b24gaWNvbnNcclxuICBGT05UX0FXRVNPTUVfSUNPTl9TQ0FMRTogMC4wNyxcclxuXHJcbiAgLy8gTGluZSB3aWR0aCBmb3IgaGlnaGxpZ2h0aW5nIGZvciBzZWxlY3RlZCBvYmplY3RzXHJcbiAgSElHSExJR0hUX0xJTkVfV0lEVEg6IDUsXHJcblxyXG4gIC8vIERlZmF1bHQgcmVzaXN0aXZpdHkgZm9yIFdpcmVzIGFuZCBTd2l0Y2hlcyAod2hvc2UgcmVzaXN0YW5jZSB2YXJpZXMgd2l0aCBsZW5ndGgpXHJcbiAgLy8gUiA9IHJobyAqIEwgLyBBLiAgUmVzaXN0YW5jZSA9IHJlc2lzdGl2aXR5ICogTGVuZ3RoIC8gY3Jvc3Mgc2VjdGlvbmFsIGFyZWEuXHJcbiAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRWxlY3RyaWNhbF9yZXNpc3Rpdml0eV9hbmRfY29uZHVjdGl2aXR5IHNheXMgY29wcGVyIGhhcyByaG89MS42OEUtOCBPaG0gKiBtXHJcbiAgLy8gQWNjb3JkaW5nIHRvIGh0dHA6Ly93d3cuc2VuZ3BpZWxhdWRpby5jb20vY2FsY3VsYXRvci1jcm9zcy1zZWN0aW9uLmh0bSBBV0cgV2lyZSBHYXVnZSBvZiAyMCBoYXMgMC41Mm1tXjIgPSA1LjJlLTdtXjJcclxuICAvLyBNYXhpbXVtIGlzIGxhcmdlIGVub3VnaCBzbyB0aGF0IG1heCByZXNpc3RhbmNlIGluIGEgOXYgYmF0dGVyeSBzbG93cyB0byBhIGdvb2QgcmF0ZVxyXG4gIFdJUkVfUkVTSVNUSVZJVFlfUkFOR0U6IG5ldyBSYW5nZSggQ0NLQ1F1ZXJ5UGFyYW1ldGVycy53aXJlUmVzaXN0aXZpdHksIDAuMDE2OCApLCAvLyBPaG0gKiBtXHJcblxyXG4gIFdJUkVfQ1JPU1NfU0VDVElPTkFMX0FSRUE6IDVFLTQsIC8vIG1ldGVycyBzcXVhcmVkXHJcblxyXG4gIC8vIExvd2VzdCByZXNpc3RhbmNlIGEgd2lyZSBjYW4gaGF2ZVxyXG4gIE1JTklNVU1fV0lSRV9SRVNJU1RBTkNFOiAxRS0xNCxcclxuXHJcbiAgLy8gVGhlIGxvd2VzdCByZXNpc3RhbmNlIG90aGVyIENpcmN1aXRFbGVtZW50cyBjYW4gaGF2ZS4gVGhpcyBpcyB0aGUgcmVzaXN0YW5jZSBvZiBhIHdpcmUgdGhlIHNhbWUgbGVuZ3RoIGFzIGEgcmVzaXN0b3JcclxuICBNSU5JTVVNX1JFU0lTVEFOQ0U6IDEuMUUtMTAsXHJcblxyXG4gIC8vIEhvdyBmYXIgdG8gZXJvZGUgdGhlIHZpc2libGUgYm91bmRzIGZvciBrZWVwaW5nIHRoZSBwcm9iZXMgaW4gYm91bmRzLlxyXG4gIERSQUdfQk9VTkRTX0VST1NJT046IDIwLFxyXG5cclxuICAvLyBEaXN0YW5jZSBiZXR3ZWVuIGFkamFjZW50IGNoYXJnZXMgd2l0aGluIGEgY2lyY3VpdCBlbGVtZW50XHJcbiAgQ0hBUkdFX1NFUEFSQVRJT046IDI4LFxyXG4gIFxyXG4gIC8vIExlbmd0aCBvZiBhIGJhdHRlcnlcclxuICBCQVRURVJZX0xFTkdUSDogMTAyLFxyXG5cclxuICAvLyBMZW5ndGggb2YgdGhlIEFDIFZvbHRhZ2VcclxuICBBQ19WT0xUQUdFX0xFTkdUSDogNjgsXHJcblxyXG4gIC8vIExlbmd0aCBvZiBhIHN3aXRjaCwgbm90IHNvIHdpZGUgdGhhdCBlbGVjdHJvbnMgYXBwZWFyIGluIHRoZSBub3RjaGVzXHJcbiAgU1dJVENIX0xFTkdUSDogMTEyLFxyXG5cclxuICBTV0lUQ0hfU1RBUlQ6IDEgLyAzLCAvLyBmcmFjdGlvbiBhbG9uZyB0aGUgc3dpdGNoIHRvIHRoZSBwaXZvdFxyXG4gIFNXSVRDSF9FTkQ6IDIgLyAzLCAvLyBmcmFjdGlvbiBhbG9uZyB0aGUgc3dpdGNoIHRvIHRoZSBjb25uZWN0aW9uIHBvaW50XHJcblxyXG4gIC8vIExlbmd0aCBvZiBhIHJlc2lzdG9yXHJcbiAgUkVTSVNUT1JfTEVOR1RIOiAxMTAsXHJcblxyXG4gIEZVU0VfTEVOR1RIOiAxMTAsXHJcbiAgV0lSRV9MRU5HVEg6IDEwMCxcclxuXHJcbiAgQ0FQQUNJVE9SX0xFTkdUSDogMTEwLFxyXG5cclxuICBJTkRVQ1RPUl9MRU5HVEg6IDExMCxcclxuXHJcbiAgLy8gTGVuZ3RoIG9mIGhvdXNlaG9sZCBpdGVtcyBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcbiAgQ09JTl9MRU5HVEg6IDg1LFxyXG4gIEVSQVNFUl9MRU5HVEg6IDkwLFxyXG4gIFBFTkNJTF9MRU5HVEg6IDEzMCxcclxuICBIQU5EX0xFTkdUSDogMTQwLFxyXG4gIERPR19MRU5HVEg6IDE3MCxcclxuICBET0xMQVJfQklMTF9MRU5HVEg6IDE0MCxcclxuICBQQVBFUl9DTElQX0xFTkdUSDogNzUsXHJcblxyXG4gIC8vIExlbmd0aFxyXG4gIFNFUklFU19BTU1FVEVSX0xFTkdUSDogMTIxLFxyXG5cclxuICAvLyByYWRpdXMgZm9yIHBhbmVscyBhbmQgcmFkaW8gYnV0dG9uc1xyXG4gIENPUk5FUl9SQURJVVM6IDYsXHJcblxyXG4gIC8vIExpbmUgd2lkdGggZm9yIHNjaGVtYXRpYyB2aWV3XHJcbiAgU0NIRU1BVElDX0xJTkVfV0lEVEg6IDQsXHJcblxyXG4gIC8vIFRoZSBtYXhpbXVtIHJlc2lzdGFuY2UgYW55IGNpcmN1aXQgZWxlbWVudCBjYW4gaGF2ZS4gIEFuIG9wZW4gc3dpdGNoIGlzIG1vZGVsZWQgYXMgYSBoaWdoLXJlc2lzdGFuY2UgcmVzaXN0b3JcclxuICBNQVhfUkVTSVNUQU5DRTogMTAwMDAwMDAwMCxcclxuXHJcbiAgLy8gc2NhbGUgYXBwbGllZCB0byB0aGUgbGlnaHQgYnVsYiB2aWV3XHJcbiAgQlVMQl9TQ0FMRTogMi41MixcclxuXHJcbiAgLy8gdHdlYWtlciBhbW91bnQgZm9yIHRoZSBoaWdoIHJlc2lzdGFuY2Ugb3IgaGlnaCB2b2x0YWdlIGNvbXBvbmVudHNcclxuICBISUdIX0VESVRPUl9ERUxUQTogMTAwLFxyXG5cclxuICAvLyBkZWZhdWx0IHJlc2lzdGFuY2UgZm9yIHRoZSBoaWdoIHJlc2lzdGFuY2UgbGlnaHQgYnVsYiBvciBoaWdoIHJlc2lzdGFuY2UgcmVzaXN0b3JcclxuICBISUdIX1JFU0lTVEFOQ0U6IDEwMDAsXHJcblxyXG4gIEhJR0hfUkVTSVNUQU5DRV9SQU5HRTogbmV3IFJhbmdlKCAxMDAsIDEwMDAwICksXHJcblxyXG4gIFBBTkVMX0xJTkVfV0lEVEg6IDEuMyxcclxuXHJcbiAgVEhVTUJfU0laRTogbmV3IERpbWVuc2lvbjIoIDEzLCAyNCApLFxyXG5cclxuICBNQUpPUl9USUNLX0xFTkdUSDogMTgsXHJcbiAgTUlOT1JfVElDS19MRU5HVEg6IDEyLFxyXG5cclxuICAvLyBUaGUgbWFpbiBmb250IHNpemUgdG8gdXNlIGZvciBsYWJlbHMgYW5kIGNvbnRyb2xzXHJcbiAgRk9OVF9TSVpFOiBGT05UX1NJWkUsXHJcblxyXG4gIERFRkFVTFRfRk9OVDogbmV3IFBoZXRGb250KCBGT05UX1NJWkUgKSxcclxuXHJcbiAgLy8gTnVtYmVyIG9mIHdpcmVzIHRoYXQgY2FuIGJlIGRyYWdnZWQgb3V0IG9mIHRoZSB0b29sYm94XHJcbiAgTlVNQkVSX09GX1dJUkVTOiA1MCxcclxuXHJcbiAgLy8gVGhlIG51bWJlciBvZiBncmlkbGluZXMgaW4gdGhlIGNoYXJ0cyB0aGF0IGluZGljYXRlIHRoZSBwcm9ncmVzc2lvbiBvZiB0aW1lLlxyXG4gIE5VTUJFUl9PRl9USU1FX0RJVklTSU9OUzogNCxcclxuXHJcbiAgQ0hBUlRfU0VSSUVTX0NPTE9SOiAnIzQwNDA0MScsXHJcblxyXG4gIERDX0NBUk9VU0VMX1NDQUxFOiAxLjIsXHJcblxyXG4gIEFDX0NBUk9VU0VMX1NDQUxFOiAwLjg1LFxyXG5cclxuICBNQVhfRFQ6IDAuNSAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1jb21tb24vaXNzdWVzLzQ3NiBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy8xMzBcclxufTtcclxuXHJcbmNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24ucmVnaXN0ZXIoICdDQ0tDQ29uc3RhbnRzJywgQ0NLQ0NvbnN0YW50cyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ0NLQ0NvbnN0YW50czsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLDRCQUE0QjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sdUJBQXVCO0FBQ3pDLE9BQU9DLFFBQVEsTUFBTSxtQ0FBbUM7QUFDeEQsT0FBT0MsbUJBQW1CLE1BQU0sMEJBQTBCO0FBQzFELE9BQU9DLDRCQUE0QixNQUFNLG1DQUFtQzs7QUFFNUU7QUFDQSxNQUFNQyxTQUFTLEdBQUcsRUFBRTs7QUFFcEI7QUFDQSxNQUFNQyxhQUFhLEdBQUc7RUFFcEI7RUFDQTtFQUNBO0VBQ0FDLFNBQVMsRUFBRSxJQUFJO0VBRWY7RUFDQUMsV0FBVyxFQUFFLENBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUU7RUFFNUI7RUFDQUMseUJBQXlCLEVBQUUsR0FBRztFQUU5QjtFQUNBQyxtQkFBbUIsRUFBRSxFQUFFO0VBQ3ZCQyxrQkFBa0IsRUFBRSxFQUFFO0VBRXRCO0VBQ0FDLGVBQWUsRUFBRSxDQUFDO0VBRWxCO0VBQ0FDLGtCQUFrQixFQUFFLEVBQUU7RUFFdEI7RUFDQUMsbUJBQW1CLEVBQUUsR0FBRztFQUV4QjtFQUNBQywwQkFBMEIsRUFBRVosbUJBQW1CLENBQUNhLHdCQUF3QjtFQUV4RTtFQUNBQyx3QkFBd0IsRUFBRSxJQUFJaEIsS0FBSyxDQUFFRSxtQkFBbUIsQ0FBQ2Esd0JBQXdCLEVBQUUsRUFBRyxDQUFDO0VBRXZGO0VBQ0FFLDBCQUEwQixFQUFFLEdBQUc7RUFFL0I7RUFDQUMsZUFB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