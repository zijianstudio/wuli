// Copyright 2014-2023, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import { MoleculeNodeOptions } from '../../../nitroglycerin/js/nodes/MoleculeNode.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { NumberSpinnerOptions } from '../../../sun/js/NumberSpinner.js';
import reactantsProductsAndLeftovers from '../reactantsProductsAndLeftovers.js';

const MOLECULE_NODE_OPTIONS: MoleculeNodeOptions = {
  atomNodeOptions: {
    stroke: 'black',
    lineWidth: 0.5,
    scale: 1
  }
};

const NUMBER_SPINNER_OPTIONS: NumberSpinnerOptions = {
  numberDisplayOptions: {
    align: 'center',
    xMargin: 5,
    yMargin: 3,
    backgroundLineWidth: 0.5,
    textOptions: {
      font: new PhetFont( 28 )
    }
  },
  touchAreaXDilation: 20,
  touchAreaYDilation: 10
};


const RPALConstants = {

  SCREEN_VIEW_LAYOUT_BOUNDS: new Bounds2( 0, 0, 835, 504 ),

  QUANTITY_RANGE: new Range( 0, 8 ),
  SANDWICH_COEFFICIENT_RANGE: new Range( 0, 3 ),
  RESET_ALL_BUTTON_SCALE: 0.75,

  // box size requested to be configurable per screen
  SANDWICHES_BEFORE_AFTER_BOX_SIZE: new Dimension2( 310, 240 ),
  MOLECULES_BEFORE_AFTER_BOX_SIZE: new Dimension2( 310, 240 ),
  GAME_BEFORE_AFTER_BOX_SIZE: new Dimension2( 330, 240 ),

  // default options
  MOLECULE_NODE_OPTIONS: MOLECULE_NODE_OPTIONS,
  NUMBER_SPINNER_OPTIONS: NUMBER_SPINNER_OPTIONS
};

reactantsProductsAndLeftovers.register( 'RPALConstants', RPALConstants );
export default RPALConstants;