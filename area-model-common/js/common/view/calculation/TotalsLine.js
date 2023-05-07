// Copyright 2018-2021, University of Colorado Boulder

/**
 * The first calculation line, which shows totals (both horizontal and vertical).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import areaModelCommon from '../../../areaModelCommon.js';
import AreaModelCommonConstants from '../../AreaModelCommonConstants.js';
import CalculationLine from './CalculationLine.js';

class TotalsLine extends CalculationLine {
  /**
   * @extends {CalculationLine}
   *
   * @param {Area} area
   * @param {Property.<number|null>} activeIndexProperty
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   * @param {boolean} isProportional - Whether the area is shown as proportional (instead of generic)
   */
  constructor( area, activeIndexProperty, allowExponents, isProportional ) {

    super( CalculationLine.TOTALS_LINE_INDEX, area.colorProperties, activeIndexProperty, allowExponents, isProportional );

    const totalTexts = area.displayProperties.map( ( orientationTotal, orientation ) => orientationTotal.value ? this.orientedTermText( orientation, orientationTotal.value )
                                                                                                               : this.orientedPlaceholderBox( orientation ) );

    if ( allowExponents ) {
      this.node = this.group( [
        this.parentheses( totalTexts.vertical ),
        this.parentheses( totalTexts.horizontal )
      ], AreaModelCommonConstants.CALCULATION_PAREN_PAREN_PADDING );
    }
    else {
      this.node = this.multiplyX( totalTexts.vertical, totalTexts.horizontal );
    }
  }
}

areaModelCommon.register( 'TotalsLine', TotalsLine );

export default TotalsLine;