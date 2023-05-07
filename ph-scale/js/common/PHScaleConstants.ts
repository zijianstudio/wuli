// Copyright 2013-2023, University of Colorado Boulder

/**
 * Constants used throughout this sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import RangeWithValue from '../../../dot/js/RangeWithValue.js';
import Vector2 from '../../../dot/js/Vector2.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import phScale from '../phScale.js';

const PHScaleConstants = {

  // ScreenView
  SCREEN_VIEW_OPTIONS: {
    layoutBounds: new Bounds2( 0, 0, 1100, 700 ),

    // Workaround for things shifting around while dragging
    // See https://github.com/phetsims/scenery/issues/1289 and https://github.com/phetsims/ph-scale/issues/226
    preventFit: true
  },

  // Credits, shared by ph-scale and ph-scale-basics
  CREDITS: {
    leadDesign:
      'Yuen-ying Carpenter, Archie Paulson',
    softwareDevelopment:
      'Chris Malley (PixelZoom, Inc.)',
    team:
      'Wendy Adams, Jack Barbera, Julia Chamberlain, Laurie Langdon, Trish Loeblein, Emily B. Moore, Ariel Paul, Katherine Perkins, Amy Rouinfar',
    graphicArts:
      'Sharon Siman-Tov',
    qualityAssurance:
      'Jaspe Arias, Logan Bray, Steele Dalton, Jaron Droder, Bryce Griebenow, Clifford Hardin, Brooklyn Lash, Emily Miller, ' +
      'Matthew Moore, Elise Morgan, Liam Mulhall, Oliver Orejola, Devon Quispe, Benjamin Roberts, Jacob Romero, Nancy Salpepi, ' +
      'Marla Schulz, Ethan Ward, Kathryn Woessner, Bryan Yoelin',
    thanks:
      'Conversion of this simulation to HTML5 was funded in part by the Royal Society of Chemistry.'
  },

  // beaker
  BEAKER_VOLUME: 1.2, // L
  BEAKER_POSITION: new Vector2( 750, 580 ),
  BEAKER_SIZE: new Dimension2( 450, 300 ),

  // pH
  PH_RANGE: new RangeWithValue( -1, 15, 7 ),
  PH_METER_DECIMAL_PLACES: 2,

  // volume
  VOLUME_DECIMAL_PLACES: 2,
  MIN_SOLUTION_VOLUME: 0.015,  // L, minimum non-zero volume for solution, so it's visible and measurable

  // logarithmic graph
  LOGARITHMIC_EXPONENT_RANGE: new Range( -16, 2 ),
  LOGARITHMIC_MANTISSA_DECIMAL_PLACES: 1,
  LINEAR_EXPONENT_RANGE: new Range( -14, 1 ),
  LINEAR_MANTISSA_RANGE: new Range( 0, 8 ),

  // expand/collapse buttons
  EXPAND_COLLAPSE_BUTTON_OPTIONS: {
    sideLength: 30,
    touchAreaXDilation: 10,
    touchAreaYDilation: 10
  },

  // faucets
  FAUCET_OPTIONS: {
    tapToDispenseAmount: 0.05, // L
    tapToDispenseInterval: 333, // ms
    shooterOptions: {
      touchAreaXDilation: 37,
      touchAreaYDilation: 60
    }
  },

  // formulas, no i18n required
  H3O_FORMULA: 'H<sub>3</sub>O<sup>+</sup>',
  OH_FORMULA: 'OH<sup>-</sup>',
  H2O_FORMULA: 'H<sub>2</sub>O',

  // fonts
  AB_SWITCH_FONT: new PhetFont( { size: 18, weight: 'bold' } )
};

phScale.register( 'PHScaleConstants', PHScaleConstants );
export default PHScaleConstants;