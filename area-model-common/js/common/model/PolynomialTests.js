// Copyright 2018-2021, University of Colorado Boulder

/**
 * Tests for Polynomial.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Polynomial from './Polynomial.js';
import Term from './Term.js';

QUnit.module( 'Polynomial' );

QUnit.test( 'Combining factors', assert => {
  assert.ok( new Polynomial( [
    new Term( 2, 1 ),
    new Term( -3, 1 )
  ] ).getTerm( 1 ).equals( new Term( -1, 1 ) ), 'Should be combined into one' );
} );

QUnit.test( 'Times', assert => {
  assert.ok( new Polynomial( [
    new Term( 4, 1 ),
    new Term( -5, 0 )
  ] ).times( new Polynomial( [
    new Term( 2, 2 ),
    new Term( 3, 1 ),
    new Term( -6, 0 )
  ] ) ).equals( new Polynomial( [
    new Term( 8, 3 ),
    new Term( 2, 2 ),
    new Term( -39, 1 ),
    new Term( 30, 0 )
  ] ) ), 'Example multiplication' );

  assert.ok( new Polynomial( [
    new Term( 3, 1 ), // 3x
    new Term( -2, 0 ) // -2
  ] ).times( new Polynomial( [
    new Term( 2, 1 ), // 2x
    new Term( 1, 0 ) // 1
  ] ) ).equals( new Polynomial( [
    new Term( 6, 2 ), // 6x^2
    new Term( -1, 1 ), // -x
    new Term( -2, 0 ) // -2
  ] ) ), 'Example multiplication' );

  assert.ok( new Polynomial( [
    new Term( 1, 2 ) // x^2
  ] ).times( new Polynomial( [
    new Term( 1, 0 ), // 1
    new Term( 1, 0 ) // 1
  ] ) ).equals( new Polynomial( [
    new Term( 2, 2 ) // 2x^2
  ] ) ), 'Combination and multiplication' );
} );