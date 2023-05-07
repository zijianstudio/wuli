// Copyright 2019-2022, University of Colorado Boulder

/**
 * Enumeration for the different display methods for the force values.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../phet-core/js/EnumerationDeprecated.js';
import inverseSquareLawCommon from '../inverseSquareLawCommon.js';

const ForceValuesDisplayEnum = EnumerationDeprecated.byKeys( [
  'DECIMAL', 'SCIENTIFIC', 'HIDDEN'
] );
inverseSquareLawCommon.register( 'ForceValuesDisplayEnum', ForceValuesDisplayEnum );
export default ForceValuesDisplayEnum;