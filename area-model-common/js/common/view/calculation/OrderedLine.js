// Copyright 2018-2021, University of Colorado Boulder

/**
 * Calculation line below the 'multiplied' line, where all of the products from distribution are sorted by exponent.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import areaModelCommon from '../../../areaModelCommon.js';
import CalculationLine from './CalculationLine.js';

class OrderedLine extends CalculationLine {
  /**
   * @param {TermList} orderedTermList
   * @param {Area} area
   * @param {Property.<number|null>} activeIndexProperty
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   * @param {boolean} isProportional - Whether the area is shown as proportional (instead of generic)
   */
  constructor( orderedTermList, area, activeIndexProperty, allowExponents, isProportional ) {
    super( CalculationLine.ORDERED_LINE_INDEX, area.colorProperties, activeIndexProperty, allowExponents, isProportional );

    this.node = this.sumWithNegativeParens( orderedTermList.terms );
  }
}

areaModelCommon.register( 'OrderedLine', OrderedLine );

export default OrderedLine;