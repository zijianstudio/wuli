// Copyright 2017-2023, University of Colorado Boulder

/**
 * A key accumulator for handling general area-model terms.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import AbstractKeyAccumulator from '../../../../scenery-phet/js/keypad/AbstractKeyAccumulator.js';
import KeyID from '../../../../scenery-phet/js/keypad/KeyID.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import Term from '../../common/model/Term.js';

// constants
const NONZERO_DIGIT_STRINGS = _.range( 1, 10 ).map( n => `${n}` );
const DIGIT_STRINGS = _.range( 0, 10 ).map( n => `${n}` );

class TermAccumulator extends AbstractKeyAccumulator {
  /**
   * @param {Property.<number>} digitCountProperty
   */
  constructor( digitCountProperty ) {

    // Validators to be passed to AbstractKeyAccumulator
    // Whether a set of proposed keys is allowed, see https://github.com/phetsims/area-model-common/issues/138
    super( [ proposedKeys => {
      let xCount = 0;
      let digitCount = 0;

      proposedKeys.forEach( key => {
        if ( key === KeyID.X || key === KeyID.X_SQUARED ) {
          xCount++;
        }

        if ( _.includes( DIGIT_STRINGS, key ) ) {
          digitCount++;
        }
      } );

      return xCount <= 1 && digitCount <= digitCountProperty.value;
    } ] );

    // @public {Property.<string>} - For display
    this.richStringProperty = new DerivedProperty( [ this.accumulatedKeysProperty ], accumulatedKeys => accumulatedKeys.map( key => {
      if ( key === KeyID.PLUS_MINUS ) {
        return MathSymbols.UNARY_MINUS;
      }
      else if ( key === KeyID.X ) {
        return AreaModelCommonConstants.X_VARIABLE_RICH_STRING;
      }
      else if ( key === KeyID.X_SQUARED ) {
        return `${AreaModelCommonConstants.X_VARIABLE_RICH_STRING}<sup>2</sup>`;
      }
      else {
        return key;
      }
    } ).join( '' ) );

    // To adhere to the Accumulator interface
    this.stringProperty = this.richStringProperty;

    // @public {Property.<Term|null>} - The term used if 'enter' is pressed
    this.termProperty = new DerivedProperty( [ this.accumulatedKeysProperty ], accumulatedKeys => {
      const lastKey = accumulatedKeys[ accumulatedKeys.length - 1 ];

      let coefficient = 1;
      let power = 0;
      if ( lastKey === KeyID.X ) {
        power = 1;
        accumulatedKeys = accumulatedKeys.slice( 0, accumulatedKeys.length - 1 );
      }
      else if ( lastKey === KeyID.X_SQUARED ) {
        power = 2;
        accumulatedKeys = accumulatedKeys.slice( 0, accumulatedKeys.length - 1 );
      }
      if ( accumulatedKeys[ 0 ] === KeyID.PLUS_MINUS ) {
        accumulatedKeys = accumulatedKeys.slice( 1 );

        // handle -x
        if ( accumulatedKeys.length === 0 ) {
          coefficient = -1;
        }
        else {
          accumulatedKeys = [ '-' ].concat( accumulatedKeys );
        }
      }

      const digitString = accumulatedKeys.join( '' );
      if ( digitString === '' || digitString === '-' ) {
        if ( power === 0 ) {
          return null;
        }
      }
      else {
        coefficient = Number( digitString );
      }

      return new Term( coefficient, power );
    } );
  }

  /**
   * Handles what happens when a key is pressed and create proposed set of keys to be passed to Validator
   * @public
   * @override
   *
   * @param {KeyID} keyIdentifier - identifier for the key pressed
   */
  handleKeyPressed( keyIdentifier ) {

    const currentKeys = this.accumulatedKeysProperty.get();

    // Whether we have a negative sign in our current input
    let negative = _.includes( currentKeys, KeyID.PLUS_MINUS );

    // The power of x (X or X_SQUARED) in our input (otherwise undefined). This keypad only allows one "power" of X,
    // e.g. 0, 1 or 2 (corresponding to multiplying times 1, x, x^2). This is the corresponding key for that power.
    let power = _.find( currentKeys, key => key === KeyID.X || key === KeyID.X_SQUARED );

    // All of the digits in our current input. (just numerical parts, not powers of x or negative signs)
    let digits = currentKeys.filter( key => _.includes( DIGIT_STRINGS, key ) );

    // Helpful booleans for what our pressed key is.
    const isDigit = _.includes( NONZERO_DIGIT_STRINGS, keyIdentifier );
    const isZero = keyIdentifier === KeyID.ZERO;
    const isBackspace = keyIdentifier === KeyID.BACKSPACE;
    const isPlusMinus = keyIdentifier === KeyID.PLUS_MINUS;
    const isX = keyIdentifier === KeyID.X;
    const isXSquared = keyIdentifier === KeyID.X_SQUARED;

    if ( isBackspace ) {
      if ( power ) {
        power = null;
      }
      else if ( digits.length ) {
        digits.pop();
      }
      else {
        negative = false;
      }
    }
    else if ( isX || isXSquared ) {
      if ( !power ) {
        power = keyIdentifier;
      }
    }
    else if ( isPlusMinus ) {
      negative = !negative;
    }
    else if ( isZero ) {
      if ( digits[ 0 ] !== KeyID.ZERO ) {
        digits.push( keyIdentifier );
      }
    }
    else if ( isDigit ) {
      if ( digits[ 0 ] === KeyID.ZERO ) {
        digits = [ keyIdentifier ];
      }
      else {
        digits.push( keyIdentifier );
      }
    }
    else {
      throw new Error( `unknown digit: ${keyIdentifier}` );
    }

    // Validate and update the keys
    const proposedKeys = ( negative ? [ KeyID.PLUS_MINUS ] : [] ).concat( digits ).concat( power ? [ power ] : [] );
    this.validateKeys( proposedKeys ) && this.updateKeys( proposedKeys );
  }
}

areaModelCommon.register( 'TermAccumulator', TermAccumulator );

export default TermAccumulator;