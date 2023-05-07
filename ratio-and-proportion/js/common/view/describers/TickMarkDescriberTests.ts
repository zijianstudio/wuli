// Copyright 2021-2022, University of Colorado Boulder

/**
 *
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import TickMarkView from '../TickMarkView.js';
import TickMarkDescriber from './TickMarkDescriber.js';
import stripEmbeddingMarks from '../../../../../phet-core/js/stripEmbeddingMarks.js';

QUnit.module( 'TickMarkDescriber' );

QUnit.test( 'getRelativePositionAndTickMarkNumberForPosition', assert => {

  const tickMarkViewProperty = new EnumerationProperty( TickMarkView.VISIBLE );
  const tickMarkRangeProperty = new NumberProperty( 10 );

  const getMessage = ( position: number, supplemental: string ) => {
    return `${supplemental}, Position: ${position}, TickMarkView: ${tickMarkViewProperty.value}, tick mark range: ${tickMarkRangeProperty.value}`;
  };
  const tickMarkDescriber = new TickMarkDescriber( tickMarkRangeProperty, tickMarkViewProperty );

  const testTickMarkOutput = ( position: number, expectedData: { ordinalPosition?: string; tickMarkPosition?: string | number; relativePosition: string } ) => {
    const actualData = tickMarkDescriber.getRelativePositionAndTickMarkNumberForPosition( position );
    if ( expectedData.ordinalPosition ) {
      assert.ok( typeof actualData.ordinalPosition === 'string', getMessage( position, 'should be defined as a string' ) );
      assert.ok( stripEmbeddingMarks( actualData.ordinalPosition! ) === stripEmbeddingMarks( expectedData.ordinalPosition ), getMessage( position, `ordinal should match, expected: ${expectedData.ordinalPosition}, actual: ${actualData.ordinalPosition}` ) );
    }
    if ( expectedData.tickMarkPosition ) {
      const actual = typeof actualData.tickMarkPosition === 'string' ?
                     stripEmbeddingMarks( actualData.tickMarkPosition ) : actualData.tickMarkPosition;
      const expected = typeof expectedData.tickMarkPosition === 'string' ?
                       stripEmbeddingMarks( expectedData.tickMarkPosition ) : expectedData.tickMarkPosition;
      assert.ok( actual === expected, getMessage( position, `position should match, expected: ${expectedData.tickMarkPosition}, actual: ${actualData.tickMarkPosition}` ) );
    }
    assert.ok( stripEmbeddingMarks( actualData.relativePosition ) === stripEmbeddingMarks( expectedData.relativePosition ), getMessage( position, `relativePosition should match, expected: ${expectedData.relativePosition}, actual: ${actualData.relativePosition}` ) );
  };

  //////////////////////////////////////////////////////
  // From 1-10 tick marks

  /////////////////////////////////////////
  // Ordinal numbers for VISIBLE tick marks (no units)

  tickMarkViewProperty.value = TickMarkView.VISIBLE;

  testTickMarkOutput( 0.1, {
    relativePosition: 'on',
    ordinalPosition: 'first'
  } );

  testTickMarkOutput( 0.11, {
    relativePosition: 'around',
    ordinalPosition: 'first'
  } );

  testTickMarkOutput( 0.12, {
    relativePosition: 'around',
    ordinalPosition: 'first'
  } );

  testTickMarkOutput( 0.13, {
    relativePosition: 'almost halfway past',
    ordinalPosition: 'first'
  } );

  testTickMarkOutput( 0.14, {
    relativePosition: 'almost halfway past',
    ordinalPosition: 'first'
  } );

  testTickMarkOutput( 0.15, {
    relativePosition: 'halfway past',
    ordinalPosition: 'first'
  } );

  testTickMarkOutput( 0.16, {
    relativePosition: 'around halfway past',
    ordinalPosition: 'first'
  } );

  testTickMarkOutput( 0.17, {
    relativePosition: 'around halfway past',
    ordinalPosition: 'first'
  } );

  testTickMarkOutput( 0.18, {
    relativePosition: 'almost on',
    ordinalPosition: 'second'
  } );

  testTickMarkOutput( 0.19, {
    relativePosition: 'almost on',
    ordinalPosition: 'second'
  } );

  testTickMarkOutput( 0.2, {
    relativePosition: 'on',
    ordinalPosition: 'second'
  } );


  ///////////////////////////////
  // Tick mark positions for VISIBLE_WITH_UNITS tick marks

  tickMarkViewProperty.value = TickMarkView.VISIBLE_WITH_UNITS;

  testTickMarkOutput( 0.1, {
    tickMarkPosition: 1,
    relativePosition: 'on'
  } );

  testTickMarkOutput( 0.11, {
    tickMarkPosition: 1,
    relativePosition: 'around'
  } );

  testTickMarkOutput( 0.12, {
    tickMarkPosition: 1,
    relativePosition: 'around'
  } );

  testTickMarkOutput( 0.13, {
    tickMarkPosition: 1.5,
    relativePosition: 'almost on'
  } );

  testTickMarkOutput( 0.14, {
    tickMarkPosition: 1.5,
    relativePosition: 'almost on'
  } );

  testTickMarkOutput( 0.15, {
    tickMarkPosition: 1.5,
    relativePosition: 'on'
  } );

  testTickMarkOutput( 0.16, {
    tickMarkPosition: 1.5,
    relativePosition: 'around'
  } );

  testTickMarkOutput( 0.17, {
    tickMarkPosition: 1.5,
    relativePosition: 'around'
  } );

  testTickMarkOutput( 0.18, {
    tickMarkPosition: 2,
    relativePosition: 'almost on'
  } );

  testTickMarkOutput( 0.19, {
    tickMarkPosition: 2,
    relativePosition: 'almost on'
  } );

  testTickMarkOutput( 0.2, {
    tickMarkPosition: 2,
    relativePosition: 'on'
  } );

  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  // From zero to 1


  /////////////////////////////////////////
  // Ordinal numbers for VISIBLE tick marks (no units)

  tickMarkViewProperty.value = TickMarkView.VISIBLE;

  testTickMarkOutput( 0.0, {
    relativePosition: 'at',
    tickMarkPosition: 'zero'
  } );

  testTickMarkOutput( 0.01, {
    relativePosition: 'near',
    tickMarkPosition: 'zero'
  } );

  testTickMarkOutput( 0.02, {
    relativePosition: 'near',
    tickMarkPosition: 'zero'
  } );

  testTickMarkOutput( 0.03, {
    relativePosition: 'almost halfway to',
    ordinalPosition: 'first'
  } );

  testTickMarkOutput( 0.04, {
    relativePosition: 'almost halfway to',
    ordinalPosition: 'first'
  } );

  testTickMarkOutput( 0.05, {
    relativePosition: 'halfway to',
    ordinalPosition: 'first'
  } );

  testTickMarkOutput( 0.06, {
    relativePosition: 'around halfway to',
    ordinalPosition: 'first'
  } );

  testTickMarkOutput( 0.07, {
    relativePosition: 'around halfway to',
    ordinalPosition: 'first'
  } );

  testTickMarkOutput( 0.08, {
    relativePosition: 'almost on',
    ordinalPosition: 'first'
  } );

  testTickMarkOutput( 0.09, {
    relativePosition: 'almost on',
    ordinalPosition: 'first'
  } );

  testTickMarkOutput( 0.1, {
    relativePosition: 'on',
    ordinalPosition: 'first'
  } );


  ///////////////////////////////
  // Tick mark positions for VISIBLE_WITH_UNITS tick marks

  tickMarkViewProperty.value = TickMarkView.VISIBLE_WITH_UNITS;

  testTickMarkOutput( 0.0, {
    relativePosition: 'at',
    tickMarkPosition: 'zero'
  } );

  testTickMarkOutput( 0.01, {
    relativePosition: 'near',
    tickMarkPosition: 'zero'
  } );

  testTickMarkOutput( 0.02, {
    relativePosition: 'near',
    tickMarkPosition: 'zero'
  } );

  testTickMarkOutput( 0.03, {
    relativePosition: 'almost on',
    tickMarkPosition: 0.5
  } );

  testTickMarkOutput( 0.04, {
    relativePosition: 'almost on',
    tickMarkPosition: 0.5
  } );

  testTickMarkOutput( 0.05, {
    relativePosition: 'on',
    tickMarkPosition: 0.5
  } );

  testTickMarkOutput( 0.06, {
    relativePosition: 'around',
    tickMarkPosition: 0.5
  } );

  testTickMarkOutput( 0.07, {
    relativePosition: 'around',
    tickMarkPosition: 0.5
  } );

  testTickMarkOutput( 0.08, {
    relativePosition: 'almost on',
    tickMarkPosition: 1
  } );

  testTickMarkOutput( 0.09, {
    relativePosition: 'almost on',
    tickMarkPosition: 1
  } );

  testTickMarkOutput( 0.1, {
    relativePosition: 'on',
    tickMarkPosition: 1
  } );
} );

