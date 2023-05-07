// Copyright 2018-2022, University of Colorado Boulder

/**
 * Represents the orientation of the rectangular view (one representation is more vertical, one is more horizontal).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import fractionsCommon from '../../fractionsCommon.js';

const RectangularOrientation = EnumerationDeprecated.byKeys( [
  'HORIZONTAL',
  'VERTICAL'
] );
fractionsCommon.register( 'RectangularOrientation', RectangularOrientation );
export default RectangularOrientation;