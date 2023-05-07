// Copyright 2016-2023, University of Colorado Boulder

/**
 * A question that appears in the 'Questions' panel.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import SunConstants from '../../../../sun/js/SunConstants.js';
import unitRates from '../../unitRates.js';

export default class ShoppingQuestion {

  /**
   * @param {string} questionString - the question string to be displayed
   * @param {number} answer - the correct answer
   * @param {number} numerator
   * @param {number} denominator
   * @param {string} numeratorString - the numerator to display when the answer is revealed
   * @param {string} denominatorString - the denominator to display when the answer is revealed
   * @param {Object} [answerOptions] - formatting for the answer (and guesses)
   */
  constructor( questionString, answer, numerator, denominator, numeratorString, denominatorString, answerOptions ) {

    // @public (read-only)
    this.answerOptions = merge( {
      valueFormat: SunConstants.VALUE_NUMBERED_PLACEHOLDER, // {string} format used by StringUtils.format to format the guess
      maxDigits: 4, // {number} maximum number of digits that can be entered on the keypad
      maxDecimals: 2, // {number} maximum number of decimal places that can be entered on the keypad
      trimZeros: false // {boolean} whether to trim trailing zeros in the decimal places
    }, answerOptions );

    // @public (read-only)
    this.questionString = questionString;
    this.answer = answer;
    this.numerator = numerator;
    this.denominator = denominator;
    this.numeratorString = numeratorString;
    this.denominatorString = denominatorString;

    // @public {Property.<number|null>, the user's guess, null indicates no guess
    this.guessProperty = new Property( null );

    // @public emit is called when the question is answered correctly
    this.correctEmitter = new Emitter( {
      parameters: [ { valueType: ShoppingQuestion } ]
    } );

    // Notify observers when the question is answered correctly, no unlink required
    this.guessProperty.link( guess => {
      if ( guess === answer ) {
        this.correctEmitter.emit( this );
      }
    } );
  }

  // @public
  reset() {
    this.guessProperty.reset();
  }
}

unitRates.register( 'ShoppingQuestion', ShoppingQuestion );