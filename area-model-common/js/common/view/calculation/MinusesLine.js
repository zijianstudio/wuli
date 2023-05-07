// Copyright 2018-2021, University of Colorado Boulder

/**
 * Calculation line that is essentially the "ordered" line, but where negative terms use a binary 'minus' in front
 * where possible, instead of a unary minus.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import areaModelCommon from '../../../areaModelCommon.js';
import CalculationLine from './CalculationLine.js';

class MinusesLine extends CalculationLine {
  /**
   * @param {TermList} orderedTermList
   * @param {Area} area
   * @param {Property.<number|null>} activeIndexProperty
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   * @param {boolean} isProportional - Whether the area is shown as proportional (instead of generic)
   */
  constructor( orderedTermList, area, activeIndexProperty, allowExponents, isProportional ) {
    super( CalculationLine.MINUSES_LINE_INDEX, area.colorProperties, activeIndexProperty, allowExponents, isProportional );

    this.node = this.sumOrDifferenceOfTerms( orderedTermList.terms );
  }
}

areaModelCommon.register( 'MinusesLine', MinusesLine );

export default MinusesLine;