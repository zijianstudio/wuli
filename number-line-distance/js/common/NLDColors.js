// Copyright 2021, University of Colorado Boulder

/**
 * The color profile for this sim.
 *
 * @author Saurabh Totey
 */

import { ProfileColorProperty } from '../../../scenery/js/imports.js';
import numberLineDistance from '../numberLineDistance.js';

const NLDColors = {
  genericScreenBackgroundColorProperty: new ProfileColorProperty( numberLineDistance, 'genericBackground', {
    default: 'rgb( 245, 255, 254 )'
  } ),
  exploreScreenBackgroundColorProperty: new ProfileColorProperty( numberLineDistance, 'exploreBackground', {
    default: 'rgb( 254, 247, 233 )'
  } )
};

numberLineDistance.register( 'NLDColors', NLDColors );
export default NLDColors;
