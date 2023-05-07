// Copyright 2018-2021, University of Colorado Boulder

/**
 * Calculation line below the 'expanded' line, where things are "multiplied out" and distributed.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Orientation from '../../../../../phet-core/js/Orientation.js';
import areaModelCommon from '../../../areaModelCommon.js';
import AreaModelCommonConstants from '../../AreaModelCommonConstants.js';
import CalculationLine from './CalculationLine.js';

class DistributionLine extends CalculationLine {
  /**
   * @param {Array.<Term>} horizontalTerms
   * @param {Array.<Term>} verticalTerms
   * @param {Area} area
   * @param {Property.<number|null>} activeIndexProperty
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   * @param {boolean} isProportional - Whether the area is shown as proportional (instead of generic)
   */
  constructor( horizontalTerms, verticalTerms, area, activeIndexProperty, allowExponents, isProportional ) {

    super( CalculationLine.DISTRIBUTION_LINE_INDEX, area.colorProperties, activeIndexProperty, allowExponents, isProportional );

    this.node = this.sumGroup( _.flatten( verticalTerms.map( verticalTerm => horizontalTerms.map( horizontalTerm => {
      const horizontalText = this.orientedTermText( Orientation.HORIZONTAL, horizontalTerm );
      const verticalText = this.orientedTermText( Orientation.VERTICAL, verticalTerm );

      // Proportional uses X-multiplication, see https://github.com/phetsims/area-model-common/issues/71
      if ( isProportional ) {
        return this.parentheses( this.multiplyX( verticalText, horizontalText ) );
      }
      else if ( allowExponents ) {
        return this.group( [
          this.parentheses( verticalText ),
          this.parentheses( horizontalText )
        ], AreaModelCommonConstants.CALCULATION_PAREN_PAREN_PADDING );
      }
      // Generic Screen (non-proportional, no exponents) uses dot, see https://github.com/phetsims/area-model-common/issues/72
      else {
        return this.parentheses( this.multiplyX( verticalText, horizontalText ) );
      }
    } ) ) ) );
  }
}

areaModelCommon.register( 'DistributionLine', DistributionLine );

export default DistributionLine;