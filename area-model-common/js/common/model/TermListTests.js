// Copyright 2018-2021, University of Colorado Boulder

/**
 * Tests for TermList.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Term from './Term.js';
import TermList from './TermList.js';

QUnit.module( 'TermList' );

QUnit.test( 'Times', assert => {
  assert.ok( new TermList( [
    new Term( 3, 1 ), // 3x
    new Term( -2, 0 ) // -2
  ] ).times( new TermList( [
    new Term( 2, 1 ), // 2x
    new Term( 1, 0 ) // 1
  ] ) ).equals( new TermList( [
    new Term( 6, 2 ), // 6x^2
    new Term( 3, 1 ), // 3x
    new Term( -4, 1 ), // -4x
    new Term( -2, 0 ) // -2
  ] ) ), 'Example multiplication' );
} );

QUnit.test( 'Ordering', assert => {
  assert.ok( new TermList( [
    new Term( 3, 2 ),
    new Term( 1, 1 ),
    new Term( 2, 0 )
  ] ).orderedByExponent().equals( new TermList( [
    new Term( 3, 2 ),
    new Term( 1, 1 ),
    new Term( 2, 0 )
  ] ) ), 'Ordering (no change)' );
  assert.ok( new TermList( [
    new Term( 2, 0 ),
    new Term( 1, 1 ),
    new Term( 3, 2 )
  ] ).orderedByExponent().equals( new TermList( [
    new Term( 3, 2 ),
    new Term( 1, 1 ),
    new Term( 2, 0 )
  ] ) ), 'Ordering (reversed)' );
} );

QUnit.test( 'Negative test', assert => {
  assert.ok( !new TermList( [
    new Term( 3, 2 ),
    new Term( 1, 1 ),
    new Term( 2, 0 )
  ] ).hasNegativeTerm(), 'No negative' );
  assert.ok( new TermList( [
    new Term( 3, 2 ),
    new Term( 1, 1 ),
    new Term( -2, 0 )
  ] ).hasNegativeTerm(), 'Has negative' );
} );