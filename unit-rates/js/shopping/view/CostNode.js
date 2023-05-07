// Copyright 2017-2023, University of Colorado Boulder

/**
 * Displays cost with an optional 3rd decimal place.
 * The specifications from https://github.com/phetsims/unit-rates/issues/44 are:
 *
 * - Third decimal is gray
 * - If cost has fewer than 3 decimals, then 3rd decimal is not displayed
 * - If 3rd decimal is not displayed, it still takes up space, so that cost value doesn't shift around
 * - Cost is truncated (not rounded) to 3 decimals (e.g. $1.2349 becomes $1.234)
 */

import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import URUtils from '../../common/URUtils.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';

export default class CostNode extends Node {

  /**
   * @param {Property.<number>} costProperty
   * @param {Object} [options]
   */
  constructor( costProperty, options ) {

    options = merge( {
      extraDecimalVisible: false, // {boolean} is the extra decimal place visible?
      font: new PhetFont( 20 ), // {Font} font for all parts of the value
      extraDecimalColor: 'gray' // {Color|string} color of the extra decimal place
    }, options );

    super();

    // dollar sign (or other currency symbol)
    // always to the left of the value on the scale, see https://github.com/phetsims/unit-rates/issues/176
    const dollarSignNode = new Text( UnitRatesStrings.dollarSign, {
      font: options.font
    } );
    this.addChild( dollarSignNode );

    // the primary part of the value, without the extra decimal place
    const primaryNode = new Text( '', {
      font: options.font
    } );
    this.addChild( primaryNode );

    // the extra decimal place
    const extraDecimalNode = new Text( '', {
      font: options.font,
      fill: options.extraDecimalColor
    } );
    if ( options.extraDecimalVisible ) {
      this.addChild( extraDecimalNode );
    }

    // When cost changes, update the displayed value
    const costObserver = cost => {

      assert && assert( cost >= 0, `negative cost not supported: ${cost}` );

      const visibleDecimalPlaces = 3;

      // First round to a large number of decimal places, in an attempt to identify floating point error.
      // For example, Javascript computes 3 * 0.4 as 1.2000000000000002.
      // This determines whether the cost has relevant non-zero decimal places,
      // and therefore whether the extra decimal place should be visible.
      // See https://github.com/phetsims/unit-rates/issues/202
      const costRounded = Utils.toFixedNumber( cost, 10 );
      extraDecimalNode.visible = ( URUtils.decimalPlaces( costRounded ) >= visibleDecimalPlaces );

      if ( options.extraDecimalVisible && extraDecimalNode.visible ) {

        // Truncate to the number of decimal places that we're interested in.
        // This determines the cost value that is displayed.
        const powerOfTen = Math.pow( 10, visibleDecimalPlaces );
        const costTruncated = Math.floor( cost * powerOfTen ) / powerOfTen;

        // convert to string, then pick it apart
        const costString = URUtils.numberToString( costTruncated, visibleDecimalPlaces, false /* trimZeros */ );
        primaryNode.string = costString.substring( 0, costString.length - 1 );
        extraDecimalNode.string = costString.substring( costString.length - 1, costString.length );
      }
      else {
        primaryNode.string = URUtils.numberToString( cost, 2, false /* trimZeros */ );
        extraDecimalNode.string = '0'; // will be invisible, but needs a valid digit for layout purposes
      }

      // adjust layout
      primaryNode.left = dollarSignNode.right + 1;
      primaryNode.y = dollarSignNode.y;
      extraDecimalNode.left = primaryNode.right + 1;
      extraDecimalNode.y = primaryNode.y;
    };
    costProperty.link( costObserver ); // unlink in dispose

    // @private
    this.disposeCostNode = () => {
      costProperty.unlink( costObserver );
    };

    this.mutate( options );
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeCostNode();
    super.dispose();
  }
}

unitRates.register( 'CostNode', CostNode );