// Copyright 2018-2023, University of Colorado Boulder

/**
 * GQEquationFactory creates strings that display various equations needed by this sim.
 * The strings contain markup that is compatible with SCENERY/RichText.
 * Equations are reduced so that they don't contain terms that evaluate to zero,
 * and coefficients are displayed as positive decimal numbers.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Utils from '../../../../dot/js/Utils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQConstants from '../GQConstants.js';
import GQSymbols from '../GQSymbols.js';
import Quadratic from '../model/Quadratic.js';

// constants
const Y_EQUALS_STRING = `${GQSymbols.y} ${MathSymbols.EQUAL_TO}`; // 'y ='

const GQEquationFactory = {

  /**
   * Creates the RichText string for an equation in standard form, y = ax^2 + bx + c
   */
  createStandardForm( quadratic: Quadratic ): string {

    // use toFixedNumber so we don't have trailing zeros
    const a = Utils.toFixedNumber( quadratic.a, GQConstants.EXPLORE_DECIMALS_A );
    const b = Utils.toFixedNumber( quadratic.b, GQConstants.EXPLORE_DECIMALS_B );
    const c = Utils.toFixedNumber( quadratic.c, GQConstants.EXPLORE_DECIMALS_C );

    // y =
    let equationString = `${Y_EQUALS_STRING} `;

    if ( a === 0 && b === 0 && c === 0 ) {

      // y = 0
      equationString += '0';
    }
    else {

      // ax^2 term
      if ( a !== 0 ) {

        if ( a === -1 ) {
          equationString += MathSymbols.UNARY_MINUS; // -x^2
        }
        else if ( a !== 1 ) {
          equationString += a; // ax^2
        }

        equationString += GQSymbols.xSquared;

        if ( b !== 0 || c !== 0 ) {
          equationString += ' ';
        }
      }

      // bx term
      if ( b !== 0 ) {

        if ( a === 0 ) {
          if ( b === -1 ) {
            equationString += MathSymbols.UNARY_MINUS; // -x
          }
          else if ( b !== 1 ) {
            equationString += b; // bx
          }
          equationString += GQSymbols.x;
        }
        else {
          equationString += ( b > 0 ) ? MathSymbols.PLUS : MathSymbols.MINUS;
          equationString += ' ';
          if ( Math.abs( b ) !== 1 ) {
            equationString += Math.abs( b );
          }
          equationString += GQSymbols.x;
        }

        if ( c !== 0 ) {
          equationString += ' ';
        }
      }

      // c term
      if ( c !== 0 ) {
        if ( a === 0 && b === 0 ) {
          equationString += c;
        }
        else {
          equationString += ( c > 0 ) ? MathSymbols.PLUS : MathSymbols.MINUS;
          equationString += ` ${Math.abs( c )}`;
        }
      }
    }

    return equationString;
  },

  /**
   * Creates the RichText string for an equation in vertex form, y = a(x - h)^2 + k
   */
  createVertexForm( quadratic: Quadratic ): string {

    // use toFixedNumber so we don't have trailing zeros
    const a = Utils.toFixedNumber( quadratic.a, GQConstants.FOCUS_AND_DIRECTRIX_DECIMALS_A );
    const h = ( quadratic.h === undefined ) ? 0 : Utils.toFixedNumber( quadratic.h, GQConstants.FOCUS_AND_DIRECTRIX_DECIMALS_H );
    const k = ( quadratic.k === undefined ) ? 0 : Utils.toFixedNumber( quadratic.k, GQConstants.FOCUS_AND_DIRECTRIX_DECIMALS_K );

    // y =
    let equationString = `${Y_EQUALS_STRING} `;

    if ( a === 0 && k === 0 ) {

      // y = 0
      equationString += '0';
    }
    else if ( a === 0 ) {

      // y = c
      equationString += Utils.toFixedNumber( quadratic.c, GQConstants.FOCUS_AND_DIRECTRIX_DECIMALS_K );
    }
    else {

      // a(x - h)^2 term
      if ( a === -1 ) {
        equationString += MathSymbols.UNARY_MINUS;
      }
      else if ( a !== 1 ) {
        equationString += a;
      }

      if ( h === 0 ) {
        equationString += GQSymbols.xSquared;
      }
      else {
        equationString += `(${GQSymbols.x} `;
        equationString += ( h > 0 ) ? MathSymbols.MINUS : MathSymbols.PLUS;
        equationString += ` ${Math.abs( h )}`;
        equationString += ')<sup>2</sup>';
      }

      if ( k !== 0 ) {
        equationString += ' ';
      }

      // k term
      if ( k !== 0 ) {
        if ( a === 0 ) {
          equationString += k;
        }
        else {
          equationString += ( k > 0 ) ? MathSymbols.PLUS : MathSymbols.MINUS;
          equationString += ` ${Math.abs( k )}`;
        }
      }
    }

    return equationString;
  },

  /**
   * Creates the RichText string for the directrix equation.
   */
  createDirectrix( directrix: number ): string {
    return `${Y_EQUALS_STRING} ${Utils.toFixedNumber( directrix, GQConstants.DIRECTRIX_DECIMALS )}`;
  },

  /**
   * Creates the RichText string for the axis of symmetry equation.
   */
  createAxisOfSymmetry( axisOfSymmetry: number ): string {
    return `${GQSymbols.x} ${MathSymbols.EQUAL_TO} ${Utils.toFixedNumber( axisOfSymmetry, GQConstants.AXIS_OF_SYMMETRY_DECIMALS )}`;
  }
};

graphingQuadratics.register( 'GQEquationFactory', GQEquationFactory );
export default GQEquationFactory;