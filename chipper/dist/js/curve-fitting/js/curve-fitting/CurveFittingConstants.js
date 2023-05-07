// Copyright 2015-2020, University of Colorado Boulder

/**
 * Constants used in multiple locations within the 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (MLearner)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import RangeWithValue from '../../../dot/js/RangeWithValue.js';
import MathSymbolFont from '../../../scenery-phet/js/MathSymbolFont.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import curveFitting from '../curveFitting.js';

// constants
const EQUATION_FONT_SIZE = 16;
const CurveFittingConstants = {
  // speed for dataPoints to reach the bucket when animated
  ANIMATION_SPEED: 65,
  // in model units per second;

  MAX_ORDER_OF_FIT: 3,
  // barometers
  BAROMETER_BAR_WIDTH: 10,
  BAROMETER_AXIS_HEIGHT: 270,
  BAROMETER_TICK_WIDTH: 15,
  // colors
  BLUE_COLOR: 'rgb( 19, 52, 248 )',
  GRAY_COLOR: 'rgb( 107, 107, 107 )',
  LIGHT_GRAY_COLOR: 'rgb( 201, 201, 202 )',
  // points
  POINT_FILL: 'rgb( 252, 151, 64 )',
  POINT_RADIUS: 8,
  POINT_STROKE: 'black',
  POINT_LINE_WIDTH: 1,
  // panels
  PANEL_BACKGROUND_COLOR: 'rgb( 254, 235, 214 )',
  PANEL_CORNER_RADIUS: 5,
  PANEL_MAX_WIDTH: 180,
  PANEL_MIN_WIDTH: 180,
  // radio buttons
  RADIO_BUTTON_OPTIONS: {
    radius: 7,
    touchAreaXDilation: 5
  },
  // checkboxes
  CHECKBOX_OPTIONS: {
    boxWidth: 14
  },
  // sliders
  CONSTANT_RANGE: new RangeWithValue(-10, 10, 2.7),
  LINEAR_RANGE: new RangeWithValue(-2, 2, 0),
  QUADRATIC_RANGE: new RangeWithValue(-1, 1, 0),
  CUBIC_RANGE: new RangeWithValue(-1, 1, 0),
  // size of the graph node in model coordinates (including axes and labels)
  GRAPH_NODE_MODEL_BOUNDS: new Bounds2(-12, -12, 12, 12),
  // bounds for the graph axes
  GRAPH_AXES_BOUNDS: new Bounds2(-10.75, -10.75, 10.75, 10.75),
  // size of the graph in model coordinates (just the white background)
  GRAPH_BACKGROUND_MODEL_BOUNDS: new Bounds2(-10, -10, 10, 10),
  // clipping bounds for the drawn curve in model coordinates
  CURVE_CLIP_BOUNDS: new Bounds2(-10, -10, 10, 10),
  // margins
  SCREEN_VIEW_X_MARGIN: 20,
  SCREEN_VIEW_Y_MARGIN: 12,
  PANEL_MARGIN: 10,
  // spacing
  CONTROLS_Y_SPACING: 12,
  SLIDERS_X_SPACING: 15,
  // fonts
  CONTROL_FONT: new PhetFont(16),
  COEFFICIENT_FONT: new PhetFont({
    size: EQUATION_FONT_SIZE,
    weight: 'bold'
  }),
  EQUATION_SYMBOL_FONT: new MathSymbolFont(EQUATION_FONT_SIZE),
  EQUATION_NORMAL_FONT: new PhetFont(EQUATION_FONT_SIZE),
  ACCORDION_BOX_TITLE_FONT: new PhetFont(16),
  GRAPH_TICK_LABEL_FONT: new PhetFont(14),
  GRAPH_AXIS_LABEL_FONT: new MathSymbolFont(16),
  BAROMETER_TICK_LABEL_FONT: new PhetFont(14),
  BAROMETER_VALUE_FONT: new PhetFont(14),
  BAROMETER_SYMBOL_FONT: new MathSymbolFont(16),
  POINT_VALUE_FONT: new PhetFont(14),
  INFO_DIALOG_NORMAL_FONT: new PhetFont(14),
  INFO_DIALOG_SYMBOL_FONT: new MathSymbolFont(14)
};
curveFitting.register('CurveFittingConstants', CurveFittingConstants);
export default CurveFittingConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiUmFuZ2VXaXRoVmFsdWUiLCJNYXRoU3ltYm9sRm9udCIsIlBoZXRGb250IiwiY3VydmVGaXR0aW5nIiwiRVFVQVRJT05fRk9OVF9TSVpFIiwiQ3VydmVGaXR0aW5nQ29uc3RhbnRzIiwiQU5JTUFUSU9OX1NQRUVEIiwiTUFYX09SREVSX09GX0ZJVCIsIkJBUk9NRVRFUl9CQVJfV0lEVEgiLCJCQVJPTUVURVJfQVhJU19IRUlHSFQiLCJCQVJPTUVURVJfVElDS19XSURUSCIsIkJMVUVfQ09MT1IiLCJHUkFZX0NPTE9SIiwiTElHSFRfR1JBWV9DT0xPUiIsIlBPSU5UX0ZJTEwiLCJQT0lOVF9SQURJVVMiLCJQT0lOVF9TVFJPS0UiLCJQT0lOVF9MSU5FX1dJRFRIIiwiUEFORUxfQkFDS0dST1VORF9DT0xPUiIsIlBBTkVMX0NPUk5FUl9SQURJVVMiLCJQQU5FTF9NQVhfV0lEVEgiLCJQQU5FTF9NSU5fV0lEVEgiLCJSQURJT19CVVRUT05fT1BUSU9OUyIsInJhZGl1cyIsInRvdWNoQXJlYVhEaWxhdGlvbiIsIkNIRUNLQk9YX09QVElPTlMiLCJib3hXaWR0aCIsIkNPTlNUQU5UX1JBTkdFIiwiTElORUFSX1JBTkdFIiwiUVVBRFJBVElDX1JBTkdFIiwiQ1VCSUNfUkFOR0UiLCJHUkFQSF9OT0RFX01PREVMX0JPVU5EUyIsIkdSQVBIX0FYRVNfQk9VTkRTIiwiR1JBUEhfQkFDS0dST1VORF9NT0RFTF9CT1VORFMiLCJDVVJWRV9DTElQX0JPVU5EUyIsIlNDUkVFTl9WSUVXX1hfTUFSR0lOIiwiU0NSRUVOX1ZJRVdfWV9NQVJHSU4iLCJQQU5FTF9NQVJHSU4iLCJDT05UUk9MU19ZX1NQQUNJTkciLCJTTElERVJTX1hfU1BBQ0lORyIsIkNPTlRST0xfRk9OVCIsIkNPRUZGSUNJRU5UX0ZPTlQiLCJzaXplIiwid2VpZ2h0IiwiRVFVQVRJT05fU1lNQk9MX0ZPTlQiLCJFUVVBVElPTl9OT1JNQUxfRk9OVCIsIkFDQ09SRElPTl9CT1hfVElUTEVfRk9OVCIsIkdSQVBIX1RJQ0tfTEFCRUxfRk9OVCIsIkdSQVBIX0FYSVNfTEFCRUxfRk9OVCIsIkJBUk9NRVRFUl9USUNLX0xBQkVMX0ZPTlQiLCJCQVJPTUVURVJfVkFMVUVfRk9OVCIsIkJBUk9NRVRFUl9TWU1CT0xfRk9OVCIsIlBPSU5UX1ZBTFVFX0ZPTlQiLCJJTkZPX0RJQUxPR19OT1JNQUxfRk9OVCIsIklORk9fRElBTE9HX1NZTUJPTF9GT05UIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDdXJ2ZUZpdHRpbmdDb25zdGFudHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29uc3RhbnRzIHVzZWQgaW4gbXVsdGlwbGUgbG9jYXRpb25zIHdpdGhpbiB0aGUgJ0N1cnZlIEZpdHRpbmcnIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNTGVhcm5lcilcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBSYW5nZVdpdGhWYWx1ZSBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmFuZ2VXaXRoVmFsdWUuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbEZvbnQgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xGb250LmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBjdXJ2ZUZpdHRpbmcgZnJvbSAnLi4vY3VydmVGaXR0aW5nLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBFUVVBVElPTl9GT05UX1NJWkUgPSAxNjtcclxuXHJcbmNvbnN0IEN1cnZlRml0dGluZ0NvbnN0YW50cyA9IHtcclxuXHJcbiAgLy8gc3BlZWQgZm9yIGRhdGFQb2ludHMgdG8gcmVhY2ggdGhlIGJ1Y2tldCB3aGVuIGFuaW1hdGVkXHJcbiAgQU5JTUFUSU9OX1NQRUVEOiA2NSwgLy8gaW4gbW9kZWwgdW5pdHMgcGVyIHNlY29uZDtcclxuXHJcbiAgTUFYX09SREVSX09GX0ZJVDogMyxcclxuXHJcbiAgLy8gYmFyb21ldGVyc1xyXG4gIEJBUk9NRVRFUl9CQVJfV0lEVEg6IDEwLFxyXG4gIEJBUk9NRVRFUl9BWElTX0hFSUdIVDogMjcwLFxyXG4gIEJBUk9NRVRFUl9USUNLX1dJRFRIOiAxNSxcclxuXHJcbiAgLy8gY29sb3JzXHJcbiAgQkxVRV9DT0xPUjogJ3JnYiggMTksIDUyLCAyNDggKScsXHJcbiAgR1JBWV9DT0xPUjogJ3JnYiggMTA3LCAxMDcsIDEwNyApJyxcclxuICBMSUdIVF9HUkFZX0NPTE9SOiAncmdiKCAyMDEsIDIwMSwgMjAyICknLFxyXG5cclxuICAvLyBwb2ludHNcclxuICBQT0lOVF9GSUxMOiAncmdiKCAyNTIsIDE1MSwgNjQgKScsXHJcbiAgUE9JTlRfUkFESVVTOiA4LFxyXG4gIFBPSU5UX1NUUk9LRTogJ2JsYWNrJyxcclxuICBQT0lOVF9MSU5FX1dJRFRIOiAxLFxyXG5cclxuICAvLyBwYW5lbHNcclxuICBQQU5FTF9CQUNLR1JPVU5EX0NPTE9SOiAncmdiKCAyNTQsIDIzNSwgMjE0ICknLFxyXG4gIFBBTkVMX0NPUk5FUl9SQURJVVM6IDUsXHJcbiAgUEFORUxfTUFYX1dJRFRIOiAxODAsXHJcbiAgUEFORUxfTUlOX1dJRFRIOiAxODAsXHJcblxyXG4gIC8vIHJhZGlvIGJ1dHRvbnNcclxuICBSQURJT19CVVRUT05fT1BUSU9OUzoge1xyXG4gICAgcmFkaXVzOiA3LFxyXG4gICAgdG91Y2hBcmVhWERpbGF0aW9uOiA1XHJcbiAgfSxcclxuXHJcbiAgLy8gY2hlY2tib3hlc1xyXG4gIENIRUNLQk9YX09QVElPTlM6IHtcclxuICAgIGJveFdpZHRoOiAxNFxyXG4gIH0sXHJcblxyXG4gIC8vIHNsaWRlcnNcclxuICBDT05TVEFOVF9SQU5HRTogbmV3IFJhbmdlV2l0aFZhbHVlKCAtMTAsIDEwLCAyLjcgKSxcclxuICBMSU5FQVJfUkFOR0U6IG5ldyBSYW5nZVdpdGhWYWx1ZSggLTIsIDIsIDAgKSxcclxuICBRVUFEUkFUSUNfUkFOR0U6IG5ldyBSYW5nZVdpdGhWYWx1ZSggLTEsIDEsIDAgKSxcclxuICBDVUJJQ19SQU5HRTogbmV3IFJhbmdlV2l0aFZhbHVlKCAtMSwgMSwgMCApLFxyXG5cclxuICAvLyBzaXplIG9mIHRoZSBncmFwaCBub2RlIGluIG1vZGVsIGNvb3JkaW5hdGVzIChpbmNsdWRpbmcgYXhlcyBhbmQgbGFiZWxzKVxyXG4gIEdSQVBIX05PREVfTU9ERUxfQk9VTkRTOiBuZXcgQm91bmRzMiggLTEyLCAtMTIsIDEyLCAxMiApLFxyXG5cclxuICAvLyBib3VuZHMgZm9yIHRoZSBncmFwaCBheGVzXHJcbiAgR1JBUEhfQVhFU19CT1VORFM6IG5ldyBCb3VuZHMyKCAtMTAuNzUsIC0xMC43NSwgMTAuNzUsIDEwLjc1ICksXHJcblxyXG4gIC8vIHNpemUgb2YgdGhlIGdyYXBoIGluIG1vZGVsIGNvb3JkaW5hdGVzIChqdXN0IHRoZSB3aGl0ZSBiYWNrZ3JvdW5kKVxyXG4gIEdSQVBIX0JBQ0tHUk9VTkRfTU9ERUxfQk9VTkRTOiBuZXcgQm91bmRzMiggLTEwLCAtMTAsIDEwLCAxMCApLFxyXG5cclxuICAvLyBjbGlwcGluZyBib3VuZHMgZm9yIHRoZSBkcmF3biBjdXJ2ZSBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gIENVUlZFX0NMSVBfQk9VTkRTOiBuZXcgQm91bmRzMiggLTEwLCAtMTAsIDEwLCAxMCApLFxyXG5cclxuICAvLyBtYXJnaW5zXHJcbiAgU0NSRUVOX1ZJRVdfWF9NQVJHSU46IDIwLFxyXG4gIFNDUkVFTl9WSUVXX1lfTUFSR0lOOiAxMixcclxuICBQQU5FTF9NQVJHSU46IDEwLFxyXG5cclxuICAvLyBzcGFjaW5nXHJcbiAgQ09OVFJPTFNfWV9TUEFDSU5HOiAxMixcclxuICBTTElERVJTX1hfU1BBQ0lORzogMTUsXHJcblxyXG4gIC8vIGZvbnRzXHJcbiAgQ09OVFJPTF9GT05UOiBuZXcgUGhldEZvbnQoIDE2ICksXHJcbiAgQ09FRkZJQ0lFTlRfRk9OVDogbmV3IFBoZXRGb250KCB7IHNpemU6IEVRVUFUSU9OX0ZPTlRfU0laRSwgd2VpZ2h0OiAnYm9sZCcgfSApLFxyXG4gIEVRVUFUSU9OX1NZTUJPTF9GT05UOiBuZXcgTWF0aFN5bWJvbEZvbnQoIEVRVUFUSU9OX0ZPTlRfU0laRSApLFxyXG4gIEVRVUFUSU9OX05PUk1BTF9GT05UOiBuZXcgUGhldEZvbnQoIEVRVUFUSU9OX0ZPTlRfU0laRSApLFxyXG4gIEFDQ09SRElPTl9CT1hfVElUTEVfRk9OVDogbmV3IFBoZXRGb250KCAxNiApLFxyXG4gIEdSQVBIX1RJQ0tfTEFCRUxfRk9OVDogbmV3IFBoZXRGb250KCAxNCApLFxyXG4gIEdSQVBIX0FYSVNfTEFCRUxfRk9OVDogbmV3IE1hdGhTeW1ib2xGb250KCAxNiApLFxyXG4gIEJBUk9NRVRFUl9USUNLX0xBQkVMX0ZPTlQ6IG5ldyBQaGV0Rm9udCggMTQgKSxcclxuICBCQVJPTUVURVJfVkFMVUVfRk9OVDogbmV3IFBoZXRGb250KCAxNCApLFxyXG4gIEJBUk9NRVRFUl9TWU1CT0xfRk9OVDogbmV3IE1hdGhTeW1ib2xGb250KCAxNiApLFxyXG4gIFBPSU5UX1ZBTFVFX0ZPTlQ6IG5ldyBQaGV0Rm9udCggMTQgKSxcclxuICBJTkZPX0RJQUxPR19OT1JNQUxfRk9OVDogbmV3IFBoZXRGb250KCAxNCApLFxyXG4gIElORk9fRElBTE9HX1NZTUJPTF9GT05UOiBuZXcgTWF0aFN5bWJvbEZvbnQoIDE0IClcclxufTtcclxuXHJcbmN1cnZlRml0dGluZy5yZWdpc3RlciggJ0N1cnZlRml0dGluZ0NvbnN0YW50cycsIEN1cnZlRml0dGluZ0NvbnN0YW50cyApO1xyXG5leHBvcnQgZGVmYXVsdCBDdXJ2ZUZpdHRpbmdD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