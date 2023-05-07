// Copyright 2018-2021, University of Colorado Boulder

/**
 * A calculation line which shows only a question mark.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import areaModelCommon from '../../../areaModelCommon.js';
import CalculationLine from './CalculationLine.js';

class QuestionMarkLine extends CalculationLine {
  /**
   * @param {Area} area
   * @param {Property.<number|null>} activeIndexProperty
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   * @param {boolean} isProportional - Whether the area is shown as proportional (instead of generic)
   */
  constructor( area, activeIndexProperty, allowExponents, isProportional ) {
    super( CalculationLine.TOTALS_LINE_INDEX, area.colorProperties, activeIndexProperty, allowExponents, isProportional );

    this.node = this.questionMark();
  }
}

areaModelCommon.register( 'QuestionMarkLine', QuestionMarkLine );

export default QuestionMarkLine;