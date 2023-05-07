// Copyright 2018-2022, University of Colorado Boulder

/**
 * The different slots in a number group where number pieces can go.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import fractionsCommon from '../../fractionsCommon.js';

const NumberSpotType = EnumerationDeprecated.byKeys( [
  'WHOLE',
  'NUMERATOR',
  'DENOMINATOR'
], {
  beforeFreeze: NumberSpotType => {
    /**
     * @param {boolean} isMixedNumber
     * @returns {Array.<NumberSpotType>} - Shows the number spots available for whether mixed numbers are an option.
     */
    NumberSpotType.getTypes = isMixedNumber => isMixedNumber ? [
      NumberSpotType.WHOLE,
      NumberSpotType.NUMERATOR,
      NumberSpotType.DENOMINATOR
    ] : [
      NumberSpotType.NUMERATOR,
      NumberSpotType.DENOMINATOR
    ];
  }
} );
fractionsCommon.register( 'NumberSpotType', NumberSpotType );
export default NumberSpotType;