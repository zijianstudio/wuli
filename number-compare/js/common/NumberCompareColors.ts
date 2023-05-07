// Copyright 2022, University of Colorado Boulder

/**
 * NumberCompareColors defines the colors for this simulation. Additional colors used in this sim can be found in
 * NumberSuiteCommonColors.ts
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { Color, ProfileColorProperty } from '../../../scenery/js/imports.js';
import numberCompare from '../numberCompare.js';

const NumberCompareColors = {
  purpleHighlightColorProperty: new ProfileColorProperty( numberCompare, 'purpleHighlightColor', {
    default: new Color( 200, 194, 255 )
  } ),
  mediumPurpleBackgroundColorProperty: new ProfileColorProperty( numberCompare, 'mediumPurpleBackgroundColor', {
    default: new Color( 238, 238, 255 )
  } ),
  orangeHighlightColorProperty: new ProfileColorProperty( numberCompare, 'orangeHighlightColor', {
    default: new Color( 247, 209, 159 )
  } ),
  whiteBackgroundColorProperty: new ProfileColorProperty( numberCompare, 'whiteBackgroundColor', {
    default: new Color( 255, 255, 255 )
  } )
};

numberCompare.register( 'NumberCompareColors', NumberCompareColors );
export default NumberCompareColors;