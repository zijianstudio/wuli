// Copyright 2019-2022, University of Colorado Boulder

/**
 * Enumeration for the two default directions that the ISLCObjects and sub components can have in the sim.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../phet-core/js/EnumerationDeprecated.js';
import inverseSquareLawCommon from '../inverseSquareLawCommon.js';

const DefaultDirection = EnumerationDeprecated.byKeys( [
  'LEFT',
  'RIGHT'
] );
inverseSquareLawCommon.register( 'DefaultDirection', DefaultDirection );
export default DefaultDirection;