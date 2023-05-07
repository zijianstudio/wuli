// Copyright 2018-2020, University of Colorado Boulder

/**
 * EnergySkateParkConstants related to the skater in Energy Skate Park.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import energySkatePark from '../energySkatePark.js';

// constants
const MIN_MASS = 5;
const MAX_MASS = 100;

const SkaterMasses = {

  // masses of skater objects in the intro screen, in kg
  SKATER_1_MASS: 60,
  SKATER_2_MASS: 35,
  SKATER_3_MASS: 40,
  SKATER_4_MASS: 65,
  SKATER_5_MASS: 80,
  DOG_MASS: 30,

  // min/max masses for the skater when a range of masses is allowed
  MIN_MASS: MIN_MASS,
  MAX_MASS: MAX_MASS,
  MASS_RANGE: new Range( MIN_MASS, MAX_MASS )
};

if ( assert ) {
  const keys = Object.keys( SkaterMasses );
  for ( let i = 0; i < keys.length; i++ ) {
    const mass = SkaterMasses[ keys[ i ] ];
    for ( let j = i + 1; j < keys.length; j++ ) {
      const nextMass = SkaterMasses[ keys[ j ] ];
      assert && assert( mass !== nextMass, 'masses are used as Map keys and must be unique' );
    }
  }
}

energySkatePark.register( 'SkaterMasses', SkaterMasses );

export default SkaterMasses;