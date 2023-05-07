// Copyright 2017-2022, University of Colorado Boulder

/**
 * Possible Edge types in 'Faradays Law' simulation for when a magnet is colliding with a coil during dragging.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import faradaysLaw from '../../faradaysLaw.js';

const OrientationEnum = EnumerationDeprecated.byKeys( [ 'NS', 'SN' ] );

faradaysLaw.register( 'OrientationEnum', OrientationEnum );
export default OrientationEnum;