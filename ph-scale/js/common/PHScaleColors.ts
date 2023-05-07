// Copyright 2013-2022, University of Colorado Boulder

/**
 * Colors used throughout this sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import { Color } from '../../../scenery/js/imports.js';
import phScale from '../phScale.js';

const PHScaleColors = {

  SCREEN_BACKGROUND: 'white',
  PANEL_FILL: 'rgb( 230, 230, 230 )',

  // pH range
  ACIDIC: new Color( 249, 106, 102 ),
  BASIC: new Color( 106, 126, 195 ),
  NEUTRAL: new Color( 164, 58, 149 ),

  // atom colors
  OXYGEN: PhetColorScheme.RED_COLORBLIND,
  HYDROGEN: new Color( 255, 255, 255 ),

  // water
  WATER: new Color( 224, 255, 255 ),

  // background on various features
  H2O_BACKGROUND: new Color( 20, 184, 238 ),

  // base colors for particles in 'ratio' view, alpha added later
  H3O_PARTICLES: new Color( 204, 0, 0 ),
  OH_PARTICLES: new Color( 0, 0, 255 )
};

phScale.register( 'PHScaleColors', PHScaleColors );
export default PHScaleColors;