// Copyright 2013-2023, University of Colorado Boulder

/**
 * Constants that are global to this sim.
 * Additional constants for the 'Line Game' screen are in LineGameConstants.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Range from '../../../dot/js/Range.js';
import { FontWeight } from '../../../scenery/js/imports.js';
import { NumberPickerOptions } from '../../../sun/js/NumberPicker.js';
import graphingLines from '../graphingLines.js';

// see https://github.com/phetsims/graphing-lines/issues/124
const NUMBER_PICKER_OPTIONS: NumberPickerOptions = {
  touchAreaXDilation: 26,
  touchAreaYDilation: 4,
  mouseAreaXDilation: 0,
  mouseAreaYDilation: 4
};

const EQUATION_FONT_WEIGHT: FontWeight = 'bold';

const GLConstants = {
  SCREEN_VIEW_LAYOUT_BOUNDS: new Bounds2( 0, 0, 1100, 700 ),
  X_AXIS_RANGE: new Range( -10, 10 ),
  Y_AXIS_RANGE: new Range( -10, 10 ),
  INTERACTIVE_EQUATION_FONT_SIZE: 34,
  MANIPULATOR_RADIUS: 0.425,
  SCREEN_X_MARGIN: 40,
  SCREEN_Y_MARGIN: 20,
  RESET_ALL_BUTTON_SCALE: 1.32,
  EQUATION_FONT_WEIGHT: EQUATION_FONT_WEIGHT,
  NUMBER_PICKER_OPTIONS: NUMBER_PICKER_OPTIONS
};

graphingLines.register( 'GLConstants', GLConstants );

export default GLConstants;