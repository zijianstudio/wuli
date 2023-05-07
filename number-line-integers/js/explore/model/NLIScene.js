// Copyright 2019-2022, University of Colorado Boulder

/**
 * enum of possible scene values for the Number Line: Integers "Explore" screen
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import numberLineIntegers from '../../numberLineIntegers.js';

const NLIScene = EnumerationDeprecated.byKeys( [ 'ELEVATION', 'BANK', 'TEMPERATURE' ] );
numberLineIntegers.register( 'NLIScene', NLIScene );
export default NLIScene;