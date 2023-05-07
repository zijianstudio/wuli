// Copyright 2022-2023, University of Colorado Boulder

/**
 * NumberComparePreferences is the model for sim-specific preferences, accessed via the Preferences dialog.
 * These preferences are global, and affect all screens.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import numberCompare from '../../numberCompare.js';
import NumberSuiteCommonPreferences from '../../../../number-suite-common/js/common/model/NumberSuiteCommonPreferences.js';

// Currently includes no additional preferences, but provided for type checking.
export class NumberComparePreferences extends NumberSuiteCommonPreferences {}

const numberComparePreferences = new NumberComparePreferences(
  'https://phet.colorado.edu/sims/html/number-compare/latest/number-compare_all.html'
);

numberCompare.register( 'numberComparePreferences', numberComparePreferences );
export default numberComparePreferences;