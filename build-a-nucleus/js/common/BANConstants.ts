// Copyright 2021-2023, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../buildANucleus.js';
import { Color } from '../../../scenery/js/imports.js';
import ShredConstants from '../../../shred/js/ShredConstants.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import Bounds2 from '../../../dot/js/Bounds2.js';

const PARTICLE_RADIUS = ShredConstants.NUCLEON_RADIUS;

const BANConstants = {

  SCREEN_VIEW_X_MARGIN: 15,
  SCREEN_VIEW_Y_MARGIN: 15,

  // radius of the particle node used on the NucleonCountPanel and AvailableDecaysPanel
  PARTICLE_RADIUS: PARTICLE_RADIUS,

  // CSS pixels per second
  PARTICLE_ANIMATION_SPEED: 300,

  // font size of the content labels in the NucleonCountPanel and AvailableDecaysPanel
  BUTTONS_AND_LEGEND_FONT_SIZE: 18,

  // This is based on max number of particles, may need adjustment if that changes.
  NUMBER_OF_NUCLEON_LAYERS: 22,

  // half-life number line starting exponent
  HALF_LIFE_NUMBER_LINE_START_EXPONENT: -24,

  // half-life number line ending exponent
  HALF_LIFE_NUMBER_LINE_END_EXPONENT: 24,

  // the maximum number of protons and neutrons for each screen
  DECAY_MAX_NUMBER_OF_PROTONS: 92,
  DECAY_MAX_NUMBER_OF_NEUTRONS: 146,
  CHART_MAX_NUMBER_OF_PROTONS: 10,
  CHART_MAX_NUMBER_OF_NEUTRONS: 12,

  // time to 'pause' the simulation to show the nuclide that does not exist, in seconds
  TIME_TO_SHOW_DOES_NOT_EXIST: 1,

  PANEL_STROKE: Color.GRAY,
  PANEL_CORNER_RADIUS: 6,

  ELEMENT_NAME_MAX_WIDTH: 300,
  INFO_BUTTON_INDENT_DISTANCE: 124,
  INFO_BUTTON_MAX_HEIGHT: 30,

  // font size throughout the first screen (stability strings, legend strings, accordion box titles, etc.)
  REGULAR_FONT: new PhetFont( 20 ),

  DEFAULT_INITIAL_PROTON_COUNT: 0,
  DEFAULT_INITIAL_NEUTRON_COUNT: 0,

  // center of the atom
  SCREEN_VIEW_ATOM_CENTER_X: 335,
  SCREEN_VIEW_ATOM_CENTER_Y: 339,

  // the x distance between the left side of the nucleon energy levels
  X_DISTANCE_BETWEEN_ENERGY_LEVELS: 255,

  // the MVT that places nucleons in their individual spaced apart array positions
  NUCLEON_ENERGY_LEVEL_ARRAY_MVT: ModelViewTransform2.createRectangleInvertedYMapping( new Bounds2( 0, 0, 5, 2 ),
    new Bounds2( 0, 0, ( PARTICLE_RADIUS * 3 ) * 5, ( PARTICLE_RADIUS * 2 ) * 10 ) ),

  // shift highlight rectangle to be aligned on the chart
  X_SHIFT_HIGHLIGHT_RECTANGLE: 0.5,
  Y_SHIFT_HIGHLIGHT_RECTANGLE: -0.5,

  NUCLIDE_CHART_CELL_LINE_WIDTH: 0.5
};

buildANucleus.register( 'BANConstants', BANConstants );
export default BANConstants;