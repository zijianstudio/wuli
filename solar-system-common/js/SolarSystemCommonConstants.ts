// Copyright 2023, University of Colorado Boulder

/**
 * Constants used throughout the My Solar System and Kepler's Laws Simulations.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import PhetFont from '../../scenery-phet/js/PhetFont.js';
import SolarSystemCommonColors from './SolarSystemCommonColors.js';
import solarSystemCommon from './solarSystemCommon.js';
import { DEFAULT_SEPARATOR_LAYOUT_OPTIONS } from '../../scenery/js/imports.js';

export const METERS_IN_AU = 149597870700;
export const SECONDS_IN_A_YEAR = 31557600;
export const G = 10000;
export const G_ACTUAL = 6.6743e-11;
export const POSITION_MULTIPLIER = 0.01;
export const MASS_MULTIPLIER = 1e28;
export const TIME_MULTIPLIER = Math.pow( POSITION_MULTIPLIER, 3 / 2 ) * Math.sqrt( G ) * Math.pow( METERS_IN_AU, 3 / 2 ) / ( Math.sqrt( G_ACTUAL ) * Math.sqrt( MASS_MULTIPLIER ) * SECONDS_IN_A_YEAR );
export const VELOCITY_MULTIPLIER = POSITION_MULTIPLIER / TIME_MULTIPLIER * METERS_IN_AU / SECONDS_IN_A_YEAR / 1000;

const SolarSystemCommonConstants = {

  MARGIN: 10,
  SCREEN_VIEW_X_MARGIN: 10,
  SCREEN_VIEW_Y_MARGIN: 10,

  // Max width for many of the text labels
  TEXT_MAX_WIDTH: 200,

  SLIDER_STEP: 25,

  CONTROL_PANEL_OPTIONS: {
    stroke: null,
    fill: SolarSystemCommonColors.controlPanelFillProperty,
    cornerRadius: 5,
    xMargin: 10,
    yMargin: 10,
    layoutOptions: {
      stretch: true
    }
  },
  CHECKBOX_OPTIONS: {
    boxWidth: 14,
    checkboxColor: SolarSystemCommonColors.foregroundProperty,
    checkboxColorBackground: SolarSystemCommonColors.backgroundProperty
  },
  HSEPARATOR_OPTIONS: {
    lineWidth: 2,
    stroke: '#8E9097',
    layoutOptions: {
      yMargin: 2,
      ...DEFAULT_SEPARATOR_LAYOUT_OPTIONS
    }
  },
  PANEL_FONT: new PhetFont( 16 ),
  TITLE_FONT: new PhetFont( { size: 16, weight: 'bold' } ),
  TEXT_OPTIONS: {
    font: new PhetFont( 16 ),
    fill: SolarSystemCommonColors.foregroundProperty,
    lineWidth: 0.1
  },
  TITLE_OPTIONS: {
    font: new PhetFont( { size: 18, weight: 'bold' } ),
    fill: SolarSystemCommonColors.foregroundProperty
  },

  GRID_SPACING: 100,

  NUM_BODIES: 4,

  CHECKBOX_SPACING: 7,

  DEFAULT_SOUND_OUTPUT_LEVEL: 0.1,

  // Multipliers that modify the numeric value shown in Number Displays
  POSITION_MULTIPLIER: 0.01, // Transforms from model units to AU
  VELOCITY_MULTIPLIER: VELOCITY_MULTIPLIER, // Transforms from model units to AU/yr then to km/s
  TIME_MULTIPLIER: TIME_MULTIPLIER // Transforms from model units to years
};

solarSystemCommon.register( 'SolarSystemCommonConstants', SolarSystemCommonConstants );
export default SolarSystemCommonConstants;