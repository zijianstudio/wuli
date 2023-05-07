// Copyright 2020-2022, University of Colorado Boulder

/**
 * An enumeration of how distance will be represented.
 * Absolute is unsigned distance and directed is signed distance.
 *
 * @author Saurabh Totey
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import numberLineDistance from '../../numberLineDistance.js';

const DistanceRepresentation = EnumerationDeprecated.byKeys( [ 'ABSOLUTE', 'DIRECTED' ] );
numberLineDistance.register( 'DistanceRepresentation', DistanceRepresentation );
export default DistanceRepresentation;
