// Copyright 2018-2022, University of Colorado Boulder

/**
 * Enumeration for area-model partition line choices.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import areaModelCommon from '../../areaModelCommon.js';

const PartitionLineChoice = EnumerationDeprecated.byKeys( [
  'NONE', // No partition lines
  'ONE', // One at a time (toggles between the two)
  'BOTH' // Both partition lines available at all times
] );

areaModelCommon.register( 'PartitionLineChoice', PartitionLineChoice );
export default PartitionLineChoice;