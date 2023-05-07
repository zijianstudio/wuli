// Copyright 2021-2022, University of Colorado Boulder

/**
 * Colors used in more than one Number Suite sim.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { Color, ProfileColorProperty } from '../../../scenery/js/imports.js';
import numberSuiteCommon from '../numberSuiteCommon.js';

const NumberSuiteCommonColors = {
  lightPurpleBackgroundColorProperty: new ProfileColorProperty( numberSuiteCommon, 'lightPurpleBackground', {
    default: new Color( 248, 248, 255 )
  } ),
  lightOrangeBackgroundColorProperty: new ProfileColorProperty( numberSuiteCommon, 'lightOrangeBackgroundColor', {
    default: new Color( 255, 247, 235 )
  } )
};

numberSuiteCommon.register( 'NumberSuiteCommonColors', NumberSuiteCommonColors );
export default NumberSuiteCommonColors;