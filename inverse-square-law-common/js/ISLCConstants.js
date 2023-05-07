// Copyright 2017-2020, University of Colorado Boulder

/**
 * Shared constants used in various places in gravity-force-lab, gravity-force-lab-basics, and coulombs-law.
 *
 * @author Jesse Greenberg
 */

import PhetFont from '../../scenery-phet/js/PhetFont.js';
import inverseSquareLawCommon from './inverseSquareLawCommon.js';

// constants
const MAX_DISTANCE_FROM_CENTER = 5; // meters, empirically determined boundary for objects

const ISLCConstants = {
  k: 8.987551E9, // Coulomb's constant

  coulombsPerAtomicUnit: 1.6021766208E-19, // atomic unit in C

  RIGHT_OBJECT_BOUNDARY: MAX_DISTANCE_FROM_CENTER,
  LEFT_OBJECT_BOUNDARY: -MAX_DISTANCE_FROM_CENTER,

  MIN_SEPARATION_BETWEEN_OBJECTS: 0.1, // in m

  // mass constants
  CONSTANT_RADIUS: 0.5, // meters
  MASS_DENSITY: 150, // kg/m^3

  CHECKBOX_OPTIONS: {
    spacing: 10,
    padding: 8,
    boxWidth: 16
  },
  UI_TEXT_OPTIONS: {
    font: new PhetFont( 14 ),
    maxWidth: 110
  },

  // The number of decimal places to display scientific notation in.
  SCIENTIFIC_NOTATION_PRECISION: 2,

  // The number of decimal places to display scientific notation in.
  DECIMAL_NOTATION_PRECISION: 12
};

inverseSquareLawCommon.register( 'ISLCConstants', ISLCConstants );

export default ISLCConstants;