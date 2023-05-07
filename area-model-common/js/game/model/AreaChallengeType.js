// Copyright 2017-2021, University of Colorado Boulder

/**
 * Enumeration for the general type of challenges: numbers or variables?
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import areaModelCommon from '../../areaModelCommon.js';

const AreaChallengeType = {
  NUMBERS: 'NUMBERS',
  VARIABLES: 'VARIABLES'
};

areaModelCommon.register( 'AreaChallengeType', AreaChallengeType );

// @public {Array.<AreaChallengeType>} - All values the enumeration can take.
AreaChallengeType.VALUES = [
  AreaChallengeType.NUMBERS,
  AreaChallengeType.VARIABLES
];

// verify that enumeration is immutable, without the runtime penalty in production code
if ( assert ) { Object.freeze( AreaChallengeType ); }

export default AreaChallengeType;