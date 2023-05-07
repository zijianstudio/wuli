// Copyright 2017-2021, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../dot/js/Range.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import unitRates from '../unitRates.js';

const URConstants = {

  // screen
  SCREEN_X_MARGIN: 15,
  SCREEN_Y_MARGIN: 10,

  // image scaling
  BAG_IMAGE_SCALE: 0.5,
  SHOPPING_ITEM_IMAGE_SCALE: 0.5,
  EDIT_ICON_SCALE: 0.032,

  // double number lines
  SHOPPING_AXIS_LENGTH: 816, // determined empirically, to take up the full width of the screen
  RACING_LAB_AXIS_LENGTH: 582, // determined empirically

  // AccordionBoxes
  ACCORDION_BOX_OPTIONS: {
    titleBarExpandCollapse: false,
    titleAlignX: 'left',
    titleXMargin: 10,
    titleYMargin: 4,
    showTitleWhenExpanded: true,
    fill: 'white',
    cornerRadius: 5,
    buttonXMargin: 10,
    buttonYMargin: 4,
    contentXMargin: 10,
    contentYMargin: 8,
    contentYSpacing: 4,
    expandCollapseButtonOptions: {
      sideLength: 16,
      touchAreaXDilation: 8,
      touchAreaYDilation: 10,
      touchAreaYShift: -4,
      mouseAreaXDilation: 4,
      mouseAreaYDilation: 4
    }
  },
  ACCORDION_BOX_TITLE_FONT: new PhetFont( 14 ),

  // Rate pickers (aka spinners)
  NUMBER_PICKER_OPTIONS: {
    xMargin: 8,
    cornerRadius: 4
  },
  COST_RANGE: new Range( 1, 20 ),
  QUANTITY_RANGE: new Range( 1, 20 ),
  MILES_RANGE: new Range( 20, 100 ),
  HOURS_RANGE: new Range( 0.5, 10 ),
  MILES_DELTA: 5,
  HOURS_DELTA: 0.5,
  HOURS_DECIMALS: 1, // decimal places in pickers for miles

  // markers on the double number line
  MAJOR_MARKER_LENGTH: 55,
  MINOR_MARKER_LENGTH: 30,
  MARKER_Y_SPACING: 1  // space between the marker line and its values
};

unitRates.register( 'URConstants', URConstants );

export default URConstants;