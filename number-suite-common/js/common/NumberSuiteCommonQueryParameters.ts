// Copyright 2022-2023, University of Colorado Boulder

/**
 * NumberSuiteCommonQueryParameters defines query parameters that are specific to Number Suite sims.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import numberSuiteCommon from '../numberSuiteCommon.js';

const NumberSuiteCommonQueryParameters = QueryStringMachine.getAll( {

  // whether the current number on the 'Ten' and 'Twenty' screens or the compare statement on the 'Compare' screen
  // should be spoken aloud when their value changes.
  autoHear: {
    public: true,
    type: 'flag'
  },

  // specifies a second locale to make available on the 'Ten', 'Twenty', and 'Compare' screens. Values are specified
  // with a locale code, e.g. "en" or "zh_CN".
  secondLocale: {
    public: true,
    type: 'string',
    isValidValue: locale => locale === null || // default value
                            ( !!locale && phet.chipper.strings.hasOwnProperty( locale ) &&

                              // This part is valuable if you tried this query parameter on the _en.html version
                              Object.keys( phet.chipper.strings ).length > 1 ),
    defaultValue: null
  },

  // whether the paper ones are visible on the 'Lab' screen
  showLabOnes: {
    public: true,
    type: 'boolean',
    defaultValue: true
  }
} );

numberSuiteCommon.register( 'NumberSuiteCommonQueryParameters', NumberSuiteCommonQueryParameters );
export default NumberSuiteCommonQueryParameters;