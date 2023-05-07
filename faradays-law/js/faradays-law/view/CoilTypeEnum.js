// Copyright 2014-2022, University of Colorado Boulder

/**
 * Possible Coil types in 'Faradays Law' simulation.
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import faradaysLaw from '../../faradaysLaw.js';

const CoilTypeEnum = EnumerationDeprecated.byKeys( [ 'TWO_COIL', 'FOUR_COIL', 'NO_COIL' ] );

faradaysLaw.register( 'CoilTypeEnum', CoilTypeEnum );
export default CoilTypeEnum;