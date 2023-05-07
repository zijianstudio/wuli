// Copyright 2020-2022, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author John Blanco
 * @author Saurabh Totey
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Range from '../../../dot/js/Range.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import numberLineDistance from '../numberLineDistance.js';
import NumberLineDistanceStrings from '../NumberLineDistanceStrings.js';

const xString = NumberLineDistanceStrings.symbol.x;
const yString = NumberLineDistanceStrings.symbol.y;

const BOX_INSET = 30;
const BOTTOM_BOX_WIDTH = 320;
const BOTTOM_BOX_HEIGHT = 70;
const SIDE_BOX_WIDTH = BOTTOM_BOX_HEIGHT;
const SIDE_BOX_HEIGHT = BOTTOM_BOX_WIDTH;
const VARIABLE_SUBSCRIPT_TEMPLATE = '{{variable}}<sub style=\'font-style:normal\'>{{subscript}}</sub>';

const NLDConstants = {

  NLD_LAYOUT_BOUNDS: ScreenView.DEFAULT_LAYOUT_BOUNDS,

  SCREEN_VIEW_X_MARGIN: 15,
  SCREEN_VIEW_Y_MARGIN: 15,

  GENERIC_NUMBER_LINE_RANGES: [
    new Range( -10, 10 ),
    new Range( -30, 30 ),
    new Range( -100, 100 )
  ],

  BOTTOM_BOX_BOUNDS: new Bounds2(
    ScreenView.DEFAULT_LAYOUT_BOUNDS.centerX - BOTTOM_BOX_WIDTH / 2,
    ScreenView.DEFAULT_LAYOUT_BOUNDS.maxY - BOTTOM_BOX_HEIGHT - BOX_INSET,
    ScreenView.DEFAULT_LAYOUT_BOUNDS.centerX + BOTTOM_BOX_WIDTH / 2,
    ScreenView.DEFAULT_LAYOUT_BOUNDS.maxY - BOX_INSET
  ),
  SIDE_BOX_BOUNDS: new Bounds2(
    ScreenView.DEFAULT_LAYOUT_BOUNDS.minX + BOX_INSET,
    ScreenView.DEFAULT_LAYOUT_BOUNDS.centerY - SIDE_BOX_HEIGHT / 2,
    ScreenView.DEFAULT_LAYOUT_BOUNDS.minX + BOX_INSET + SIDE_BOX_WIDTH,
    ScreenView.DEFAULT_LAYOUT_BOUNDS.centerY + SIDE_BOX_HEIGHT / 2
  ),

  X_1_STRING: StringUtils.fillIn( VARIABLE_SUBSCRIPT_TEMPLATE, { variable: xString, subscript: 1 } ),
  X_2_STRING: StringUtils.fillIn( VARIABLE_SUBSCRIPT_TEMPLATE, { variable: xString, subscript: 2 } ),
  Y_1_STRING: StringUtils.fillIn( VARIABLE_SUBSCRIPT_TEMPLATE, { variable: yString, subscript: 1 } ),
  Y_2_STRING: StringUtils.fillIn( VARIABLE_SUBSCRIPT_TEMPLATE, { variable: yString, subscript: 2 } )
};

numberLineDistance.register( 'NLDConstants', NLDConstants );
export default NLDConstants;
