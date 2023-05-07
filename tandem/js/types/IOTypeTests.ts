// Copyright 2021-2022, University of Colorado Boulder

/**
 * Unit tests for IOType
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Tandem from '../Tandem.js';

QUnit.module( 'IOType' );

QUnit.test( 'always true', assert => {
  assert.ok( true, 'initial test' );
} );

if ( Tandem.PHET_IO_ENABLED ) {

  // Tests would be nice
}
