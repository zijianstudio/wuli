// Copyright 2020-2022, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { Color } from '../../../scenery/js/imports.js';
import numberLineOperations from '../numberLineOperations.js';
import NumberLineOperationsStrings from '../NumberLineOperationsStrings.js';

const NLOConstants = {

  // layout bounds used for all screens
  LAYOUT_BOUNDS: ScreenView.DEFAULT_LAYOUT_BOUNDS,

  // shared constants used for consistent layout between screens
  NUMBER_LINE_WIDTH: ScreenView.DEFAULT_LAYOUT_BOUNDS.width - 200,
  CHECKBOX_SPACING: 12,
  OPERATION_ENTRY_CAROUSEL_LEFT_INSET: 70,
  ERASER_BUTTON_ICON_WIDTH: 32,
  ERASER_BUTTON_INSET: 12,

  // length of time between activating and then deactivating it when the timed deactivation feature is in use
  OPERATION_AUTO_DEACTIVATE_TIME: 4000, // in milliseconds

  // fade out time for operations that are being deactivated
  OPERATION_FADE_OUT_TIME: 1500, // in milliseconds,

  // patternized string for net worth with a currency symbol that is used in multiple places
  NET_WORTH_WITH_CURRENCY_STRING: StringUtils.fillIn( NumberLineOperationsStrings.netWorthWithCurrencyPattern, {
    netWorthString: NumberLineOperationsStrings.netWorth,
    currencyUnits: NumberLineOperationsStrings.currencyUnits
  } ),

  // net worth range, used in a couple of places
  NET_WORTH_RANGE: new Range( -1000, 1000 ),

  // common colors used for points in multiple places
  DARK_BLUE_POINT_COLOR: new Color( '#0000C4' ),
  MEDIUM_BLUE_POINT_COLOR: new Color( '#4069FF' ),
  LIGHT_BLUE_POINT_COLOR: new Color( '#64A3FF' )
};

numberLineOperations.register( 'NLOConstants', NLOConstants );
export default NLOConstants;
