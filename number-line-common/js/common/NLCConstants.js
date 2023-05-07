// Copyright 2020-2021, University of Colorado Boulder

/**
 * NLCConstants (Number Line Common Constants) contains constants that are used by the common code and/or more than one
 * of the sims in the Number Line suite.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import numberLineCommon from '../numberLineCommon.js';

// constants
const LABEL_BACKGROUND_CORNER_RADIUS = 3;

const NLCConstants = {

  // corner radius of the background for most if not all labels
  LABEL_BACKGROUND_CORNER_RADIUS: LABEL_BACKGROUND_CORNER_RADIUS,

  // options used for most if not all label backgrounds, of type scenery-phet/BackgroundNode
  LABEL_BACKGROUND_OPTIONS: {
    rectangleOptions: {
      opacity: 0.85,
      cornerRadius: LABEL_BACKGROUND_CORNER_RADIUS
    },
    xMargin: 3,
    yMargin: 3,
    pickable: false
  },

  // options used to keep layouts consistent across sims in this suite
  SCREEN_VIEW_X_MARGIN: 15,
  SCREEN_VIEW_Y_MARGIN: 15,

  ACCORDION_BOX_COMMON_OPTIONS: {
    fill: 'white',
    showTitleWhenExpanded: false,
    cornerRadius: 5,
    buttonXMargin: 8,
    buttonYMargin: 6,
    expandCollapseButtonOptions: {
      touchAreaXDilation: 15,
      touchAreaYDilation: 15,
      mouseAreaXDilation: 5,
      mouseAreaYDilation: 5
    }
  }
};

numberLineCommon.register( 'NLCConstants', NLCConstants );
export default NLCConstants;
