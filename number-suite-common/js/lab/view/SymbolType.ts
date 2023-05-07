// Copyright 2023, University of Colorado Boulder

/**
 * Allowed symbols for cards on the 'Lab' screen.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';

type SymbolType = typeof MathSymbols.LESS_THAN | typeof MathSymbols.EQUAL_TO | typeof MathSymbols.GREATER_THAN |
  typeof MathSymbols.PLUS | typeof MathSymbols.MINUS;
export default SymbolType;
