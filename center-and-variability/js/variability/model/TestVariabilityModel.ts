// Copyright 2023, University of Colorado Boulder

/**
 * Unit tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import VariabilityModel from './VariabilityModel.js';

QUnit.module( 'TestVariabilityModel' );

const approxEquals = ( a: number, b: number ) => {
  return Math.abs( a - b ) < 1E-10;
};

QUnit.test( 'test variability model', assert => {

  assert.equal( VariabilityModel.meanAbsoluteDeviation( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ] ), 56 / 15 ); // uniform. 3.73333333333
  assert.ok( approxEquals( VariabilityModel.meanAbsoluteDeviation( [ 1, 1, 3, 12, 13, 13, 13, 13, 14, 14, 15, 15, 15, 15, 15 ] ), 3.92 ) ); // skewed left
  assert.ok( approxEquals( VariabilityModel.meanAbsoluteDeviation( [ 1, 1, 1, 1, 1, 1, 2, 2, 3, 8, 11, 14, 14, 14, 15 ] ), 5.38666666666 ) ); // skewed right
  assert.ok( approxEquals( VariabilityModel.meanAbsoluteDeviation( [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 15 ] ), 1.8133333333333 ) ); // near worst case
  assert.ok( approxEquals( VariabilityModel.meanAbsoluteDeviation( [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 15, 15, 15, 15 ] ), 5.47555555555555 ) ); // worst case
  assert.ok( approxEquals( VariabilityModel.meanAbsoluteDeviation( [ 1, 1, 1, 15, 1, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ] ), 5.47555555555555 ) ); // worst case
} );