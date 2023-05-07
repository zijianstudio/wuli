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
  BLUE_BUTTON_UP_COLOR: new Color( 'hsl( 210, 70%, 75% )' ),
  BLUE_BUTTON_OVER_COLOR: new Color( 'hsl( 210, 90%, 80% )' ),
  BLUE_BUTTON_DISABLED_COLOR: new Color( 'rgb( 180, 180, 180 )' ),
  BLUE_BUTTON_DOWN_COLOR: new Color( 'hsl( 210, 80%, 70% )' ),
  BLUE_BUTTON_BORDER_0: new Color( 'transparent' ),
  BLUE_BUTTON_BORDER_1: new Color( 'transparent' ),

  // Color scheme for panels in the whole sim
  PANEL_COLORS: {
    stroke: 'rgb( 190, 190, 190 )',
    fill: 'rgb( 240, 240, 240 )'
  },

  // The colors for the arrows in the masses
  ARROW_COLORS: {
    fill: ARROW_FILL,
    stroke: Color.toColor( ARROW_FILL ).colorUtilsDarker( 0.6 )
  },

  // The colors of the 2D amplitude selectors
  SELECTOR_HORIZONTAL_FILL: 'rgb( 0, 255, 255 )',
  SELECTOR_VERTICAL_FILL: 'rgb( 0, 0, 255 )',
  BACKGROUND_RECTANGLE_DEFAULT_FILL: Color.toColor( 'rgb( 0, 0, 0 )' ).colorUtilsBrighter( 0.6 ),

  MASS_COLORS: {
    fill: MASS_FILL,
    stroke: Color.toColor( MASS_FILL ).colorUtilsDarker( 0.6 )
  },

  WALL_COLORS: {
    fill: WALL_FILL,
    stroke: Color.toColor( WALL_FILL ).colorUtilsDarker( 0.5 )
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

normalModes.register( 'NormalModesColors', NormalModesColors );
export default NormalModesColors;