// Copyright 2018-2022, University of Colorado Boulder

/**
 * Represents the three main different styles of game challenges.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import fractionsCommon from '../../fractionsCommon.js';

const ChallengeType = EnumerationDeprecated.byKeys( [
  'PIE',
  'BAR',
  'NUMBER'
] );
fractionsCommon.register( 'ChallengeType', ChallengeType );
export default ChallengeType;