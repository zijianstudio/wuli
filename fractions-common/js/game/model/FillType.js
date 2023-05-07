// Copyright 2018-2022, University of Colorado Boulder

/**
 * Enumerates strategies for turning ShapePartition + Fraction => FilledPartition
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import fractionsCommon from '../../fractionsCommon.js';

const FillType = EnumerationDeprecated.byKeys( [
  'SEQUENTIAL',
  'MIXED', // when number of shapes > 1, first shape will be completely filled and the 2nd shape will be random
  'RANDOM'
] );
fractionsCommon.register( 'FillType', FillType );
export default FillType;