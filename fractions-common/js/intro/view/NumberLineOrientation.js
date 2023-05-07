// Copyright 2018-2022, University of Colorado Boulder

/**
 * Represents the orientation of a number line.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import fractionsCommon from '../../fractionsCommon.js';

const NumberLineOrientation = EnumerationDeprecated.byKeys( [
  'HORIZONTAL',
  'VERTICAL'
] );
fractionsCommon.register( 'NumberLineOrientation', NumberLineOrientation );
export default NumberLineOrientation;