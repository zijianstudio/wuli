// Copyright 2018-2021, University of Colorado Boulder

/**
 * Tests for Term.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Term from './Term.js';

QUnit.module( 'Term' );

QUnit.test( 'Equality', assert => {
  assert.ok( new Term( 1, 2 ).equals( new Term( 1, 2 ) ), 'Basic equality' );
  assert.ok( !new Term( 2, 2 ).equals( new Term( 1, 2 ) ), 'Basic inequality' );
  assert.ok( !new Term( 1, 2 ).equals( new Term( 1, 1 ) ), 'Basic inequality' );
} );

QUnit.test( 'Multiplication', assert => {
  assert.ok( new Term( 3, 0 ).times( new Term( 5, 0 ) ).equals( new Term( 15, 0 ) ), 'Basic multiplication' );
  assert.ok( new Term( 3, 1 ).times( new Term( 5, 0 ) ).equals( new Term( 15, 1 ) ), 'Basic multiplication (one exponent)' );
  assert.ok( new Term( 3, 2 ).times( new Term( 5, 1 ) ).equals( new Term( 15, 3 ) ), 'Basic multiplication (two exponents)' );
} );