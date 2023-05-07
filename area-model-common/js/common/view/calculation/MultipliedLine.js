// Copyright 2018-2021, University of Colorado Boulder

/**
 * A calculation line below the 'distributed' line, where each term (in this case, multiplication between the
 * horizontal and vertical 'Term') is multiplied to result in a non-oriented value.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import areaModelCommon from '../../../areaModelCommon.js';
import CalculationLine from './CalculationLine.js';

class MultipliedLine extends CalculationLine {
  /**
   * @param {TermList} multipliedTermList
   * @param {Area} area
   * @param {Property.<number|null>} activeIndexProperty
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   * @param {boolean} isProportional - Whether the area is shown as proportional (instead of generic)
   */
  constructor( multipliedTermList, area, activeIndexProperty, allowExponents, isProportional ) {
    super( CalculationLine.MULTIPLIED_LINE_INDEX, area.colorProperties, activeIndexProperty, allowExponents, isProportional );

    this.node = this.sumWithNegativeParens( multipliedTermList.terms );
  }
}

areaModelCommon.register( 'MultipliedLine', MultipliedLine );

export default MultipliedLine;