// Copyright 2016-2021, University of Colorado Boulder

/**
 * Utility functions that are specific to this simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Utils from '../../../dot/js/Utils.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import SunConstants from '../../../sun/js/SunConstants.js';
import unitRates from '../unitRates.js';

// All functions are @public unless otherwise noted.
const URUtils = {

  /**
   * Formats a number, using nearest-neighbor rounding.
   * @param {string} format - the format, which must contain SunConstants.VALUE_NUMBERED_PLACEHOLDER for the value
   * @param {number} value - the number
   * @param {number} maxDecimals - the maximum number of decimal places
   * @param {boolean} trimZeros - whether to trim trailing zeros from the decimal places (eg, 1.20 -> 1.2)
   * @returns {string}
   */
  formatNumber: function( format, value, maxDecimals, trimZeros ) {

    // stringTest indiscriminately replaces all strings, with no regard to formatting placeholders.
    if ( !phet.chipper.queryParameters.stringTest ) {
      assert && assert( format.indexOf( SunConstants.VALUE_NUMBERED_PLACEHOLDER ) !== -1,
        `missing placeholder in format: ${format}` );
    }
    return StringUtils.format( format, URUtils.numberToString( value, maxDecimals, trimZeros ) );
  },

  /**
   * Converts a number to a string, using nearest-neighbor rounding.
   * @param {number} value - the number
   * @param {number} maxDecimals - the maximum number of decimal places
   * @param {boolean} trimZeros - whether to trim trailing zeros from the decimal places (eg, 1.20 -> 1.2)
   * @returns {string}
   */
  numberToString: function( value, maxDecimals, trimZeros ) {
    if ( trimZeros ) {
      return Utils.toFixedNumber( value, maxDecimals ).toString();
    }
    else {
      return Utils.toFixed( value, maxDecimals );
    }
  },

  /**
   * Gets the number of decimal places in a number, or a number that has been converted to a string.
   * @param {number|string} numberOrString
   * @returns {number}
   */
  decimalPlaces: function( numberOrString ) {
    assert && assert( typeof numberOrString === 'number' || typeof numberOrString === 'string', 'invalid argument type' );

    // convert to string
    const str = ( `${numberOrString}` );
    assert && assert( str.length > 0, `invalid argument: ${str}` );

    // find the decimal point
    assert && assert( ( str.match( /\./g ) || [] ).length <= 1, `too many decimal points: ${str}` );
    const decimalIndex = str.indexOf( '.' );

    if ( decimalIndex === -1 ) {

      // no decimal places
      return 0;
    }
    else {

      // count digits to right of decimal point
      return str.substring( decimalIndex + 1, str.length ).length;
    }
  }
};

unitRates.register( 'URUtils', URUtils );

export default URUtils;