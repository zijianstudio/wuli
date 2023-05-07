// Copyright 2019-2022, University of Colorado Boulder

/**
 * EnergySkateParkConstants for the Graphs screen of Energy Skate Park.\
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import energySkatePark from '../energySkatePark.js';

// constants
const TIME_PER_SAMPLE = 1 / 60; // in seconds (assuming 60 fps, one sample per frame)
const RECORDED_TIME = 5; // recording 5 seconds of data
const MAX_SAMPLES = RECORDED_TIME / TIME_PER_SAMPLE;

const GraphsConstants = {
  MAX_SAMPLES: MAX_SAMPLES,

  // maximum recording time for energy vs time plot, in seconds
  MAX_PLOTTED_TIME: 20,

  // determined to be reasonable by inspecting energies at large skater heights - anything
  // above this will be off of the graph
  MAX_PLOTTED_ENERGY: 3000,

  // ranges for the energy plot, when scale changes
  PLOT_RANGES: [
    new Range( -20000, 20000 ),
    new Range( -17500, 17500 ),
    new Range( -15000, 15000 ),
    new Range( -12500, 12500 ),
    new Range( -10000, 10000 ),
    new Range( -9000, 9000 ),
    new Range( -8000, 8000 ),
    new Range( -7000, 7000 ),
    new Range( -6000, 6000 ),
    new Range( -5000, 5000 ),
    new Range( -4000, 4000 ),
    new Range( -3000, 3000 ), // default
    new Range( -2500, 2500 ),
    new Range( -2000, 2000 ),
    new Range( -1500, 1500 ),
    new Range( -1000, 1000 ),
    new Range( -500, 500 ),
    new Range( -200, 200 ),
    new Range( -100, 100 ),
    new Range( -50, 50 )
  ],

  // dimensions for the tracks in the graphs screen, reused and referenced by many components in this screen
  // in model coordinates (meters)
  TRACK_WIDTH: 10,
  TRACK_HEIGHT: 4
};

energySkatePark.register( 'GraphsConstants', GraphsConstants );
export default GraphsConstants;