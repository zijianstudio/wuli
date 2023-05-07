// Copyright 2018-2021, University of Colorado Boulder

/**
 * Calculation line that shows only the final sim of the total width times the total height.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import areaModelCommon from '../../../areaModelCommon.js';
import CalculationLine from './CalculationLine.js';

class SumLine extends CalculationLine {
  /**
   * @param {Area} area
   * @param {Property.<number|null>} activeIndexProperty
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   * @param {boolean} isProportional - Whether the area is shown as proportional (instead of generic)
   */
  constructor( area, activeIndexProperty, allowExponents, isProportional ) {
    super( CalculationLine.SUM_LINE_INDEX, area.colorProperties, activeIndexProperty, allowExponents, isProportional );

    this.node = this.baseTermText( area.totalAreaProperty.value, false );
  }
}

areaModelCommon.register( 'SumLine', SumLine );

export default SumLine;