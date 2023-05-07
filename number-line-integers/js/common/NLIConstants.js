// Copyright 2019-2022, University of Colorado Boulder

/**
 * shared constants for the "Number Line: Integers" simulation
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import ScreenView from '../../../joist/js/ScreenView.js';
import EnumerationDeprecated from '../../../phet-core/js/EnumerationDeprecated.js';
import numberLineIntegers from '../numberLineIntegers.js';

const NLIConstants = {

  // layout bounds used for all screens
  NLI_LAYOUT_BOUNDS: ScreenView.DEFAULT_LAYOUT_BOUNDS,

  // The amount, in model and view coordinates, of space between the end of the number lines display range and the end
  // of the number line itself.
  GENERIC_SCREEN_DISPLAYED_RANGE_INSET: 25,

  // possible values for temperature units
  TEMPERATURE_UNITS: EnumerationDeprecated.byKeys( [ 'FAHRENHEIT', 'CELSIUS' ] ),

  // various shared fonts and layout parameters
  EXPLORE_SCREEN_CONTROLS_LEFT_SIDE_INSET: 175
};

numberLineIntegers.register( 'NLIConstants', NLIConstants );
export default NLIConstants;