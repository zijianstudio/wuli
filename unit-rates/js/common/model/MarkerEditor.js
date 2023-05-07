// Copyright 2017-2023, University of Colorado Boulder

/**
 * Model for the marker editor.
 * The rate created by the marker editor is used as the basis for creating markers on the double number line.
 * Position of the marker editor is handled by the view.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import unitRates from '../../unitRates.js';

export default class MarkerEditor {

  /**
   * @param {Property.<boolean>} unitRateProperty
   * @param {Object} [options]
   */
  constructor( unitRateProperty, options ) {

    options = merge( {
      numeratorMaxDecimals: 2, // {number} maximum decimal places in the numerator
      denominatorMaxDecimals: 2 // {number} maximum decimal places in the denominator
    }, options );

    // @public {Property.<number|null>} the numerator in the editor
    this.numeratorProperty = new Property( null, {
      reentrant: true // see https://github.com/phetsims/unit-rates/issues/216
    } );

    // @public {Property.<number|null>} the denominator in the editor
    this.denominatorProperty = new Property( null, {
      reentrant: true // see https://github.com/phetsims/unit-rates/issues/216
    } );

    // @public (read-only)
    this.unitRateProperty = unitRateProperty;

    // @private
    this.denominatorMaxDecimals = options.denominatorMaxDecimals;

    // if a numerator is entered that can't be computed from the existing denominator, then clear the denominator
    this.numeratorProperty.link( numerator => { // no unlink required
      if ( numerator !== null && this.denominatorProperty.value !== null ) {
        const correctNumerator = Utils.toFixedNumber( this.denominatorProperty.value * unitRateProperty.value, options.numeratorMaxDecimals );
        if ( numerator !== correctNumerator ) {
          this.denominatorProperty.value = null;
        }
      }
    } );

    // if a denominator is entered that can't be computed from the existing numerator, then clear the numerator
    this.denominatorProperty.link( denominator => { // no unlink required
      if ( denominator !== null && this.numeratorProperty.value !== null ) {
        const correctDenominator = Utils.toFixedNumber( this.numeratorProperty.value / unitRateProperty.value, options.denominatorMaxDecimals );
        if ( denominator !== correctDenominator ) {
          this.numeratorProperty.value = null;
        }
      }
    } );

    // if the unit rate changes, reset the editor, which effectively cancels any edit that is in progress
    // unlink not needed, exists for sim lifetime
    unitRateProperty.lazyLink( () => {
      this.reset();
    } );
  }

  // @public
  reset() {
    this.numeratorProperty.reset();
    this.denominatorProperty.reset();
  }

  /**
   * The marker editor is 'empty' when both the numerator and denominator are null.
   * @returns {boolean}
   * @public
   */
  isEmpty() {
    return ( this.numeratorProperty.value === null && this.denominatorProperty.value === null );
  }
}

unitRates.register( 'MarkerEditor', MarkerEditor );