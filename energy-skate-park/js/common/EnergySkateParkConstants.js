// Copyright 2013-2023, University of Colorado Boulder

/**
 * EnergySkateParkConstants used throughout the simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import energySkatePark from '../energySkatePark.js';
import EnergySkateParkColorScheme from './view/EnergySkateParkColorScheme.js';

// for zoom buttons for bar graphs, pressing button will increase/decrease scale by this much
const ZOOM_FACTOR_DELTA = 1 / 60;

// precision of constants here must match precision of the physical control so that user
// can find this exact value so that it is correctly labelled
const EARTH_GRAVITY = 9.8;
const MOON_GRAVITY = 1.6;
const JUPITER_GRAVITY = 24.8;

// maximum coefficient of friction
const MIN_FRICTION = 0;
const MAX_FRICTION = 0.1;

const PANEL_CORNER_RADIUS = 5;

const PANEL_OPTIONS = {
  cornerRadius: PANEL_CORNER_RADIUS,
  fill: EnergySkateParkColorScheme.panelFill,
  stroke: EnergySkateParkColorScheme.panelStroke
};

const EnergySkateParkConstants = {
  SLIDER_OPTIONS: {
    thumbSize: new Dimension2( 12, 23 ),
    trackSize: new Dimension2( 95, 3 ),
    tickLabelSpacing: 0,
    majorTickLength: 11,
    thumbTouchAreaYDilation: 8
  },

  // for radio buttons
  RADIO_BUTTON_CONTENT_MARGIN: 3,
  RADIO_BUTTON_CORNER_RADIUS: 2,

  // consistent width for all checkboxesz
  CHECKBOX_WIDTH: 14.7,
  CHECKBOX_LABEL_FONT: new PhetFont( { size: 14.7 } ),

  CONTROL_LABEL_FONT: new PhetFont( { size: 14.7 } ),

  // font for labels of physical controls
  CONTROL_TITLE_FONT: new PhetFont( { weight: 'bold', size: 14.7 } ),
  CONTROL_TICK_LABEL_OPTIONS: {
    font: new PhetFont( 12.3 ),
    maxWidth: 31 // selected by choosing the length of widest English string in ?stringTest=double
  },

  // options for boxes and panels
  PANEL_CORNER_RADIUS: PANEL_CORNER_RADIUS,
  PANEL_OPTIONS: PANEL_OPTIONS,

  GRAPH_PANEL_OPTONS: merge( {}, PANEL_OPTIONS, {
    fill: EnergySkateParkColorScheme.chartPanelFill
  } ),

  // options for the ComboBoxes in this sim
  COMBO_BOX_OPTIONS: {
    xMargin: 10,
    yMargin: 6,
    cornerRadius: PANEL_CORNER_RADIUS
  },
  COMBO_BOX_ITEM_OPTIONS: { font: new PhetFont( 13.5 ), maxWidth: 98 },

  // Control points are replenished in the toolbox as they are destroyed (by connecting) in the play area
  // This is the maximum number of control points available to the user.
  MAX_NUMBER_CONTROL_POINTS: 15,

  // for the bar graphs, factors multiplied by physical values to produce heights in view coordinates
  ZOOM_FACTOR_DELTA: ZOOM_FACTOR_DELTA,
  MAX_ZOOM_FACTOR: 9 * ZOOM_FACTOR_DELTA,
  MIN_ZOOM_FACTOR: ZOOM_FACTOR_DELTA / 3,

  // coefficients of friction, default values are not common
  MIN_FRICTION: MIN_FRICTION,
  MAX_FRICTION: MAX_FRICTION,

  // it was decided that default friction for this sim should be zero on all screens
  DEFAULT_FRICTION: MIN_FRICTION,

  // in m/s^2, including direction (naming aligned with magnitude for readability at usages)
  MAX_GRAVITY: -26, // maximum value of gravity, as requested by design
  MIN_GRAVITY: -1, // minimum value for gravity, as requested by design team

  // pre-determined gravities
  EARTH_GRAVITY: EARTH_GRAVITY,
  MOON_GRAVITY: MOON_GRAVITY,
  JUPITER_GRAVITY: JUPITER_GRAVITY,

  REFERENCE_HEIGHT_RANGE: new Range( 0, 8 ) // in meters
};

energySkatePark.register( 'EnergySkateParkConstants', EnergySkateParkConstants );

export default EnergySkateParkConstants;