// Copyright 2020-2022, University of Colorado Boulder

/**
 * enum of possible operations that can be performed through interaction with an operation-tracking number line
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import numberLineOperations from '../../numberLineOperations.js';

const Operation = EnumerationDeprecated.byKeys( [ 'ADDITION', 'SUBTRACTION' ] );
numberLineOperations.register( 'Operation', Operation );
export default Operation;