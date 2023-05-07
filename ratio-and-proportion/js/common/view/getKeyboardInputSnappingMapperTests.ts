// Copyright 2020-2022, University of Colorado Boulder

/**
 * QUnit tests for RAPModel
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import RAPModel from '../model/RAPModel.js';
import RAPRatioTuple from '../model/RAPRatioTuple.js';
import RatioTerm from '../model/RatioTerm.js';
import rapConstants from '../rapConstants.js';
import getKeyboardInputSnappingMapper from './getKeyboardInputSnappingMapper.js';

QUnit.module( 'getKeyboardInputSnappingMapperTests' );

// Copied from keyboard step calculation in RAPScreenView.js
const keyboardStep = 1 / 2 / 10;

QUnit.test( 'keyboard input to model always can get in proportion: 2/7 moving down', assert => {

  const model = new RAPModel( Tandem.OPT_OUT );
  const ratioTupleProperty = model.ratio.tupleProperty;
  const getIdealValue = () => model.getIdealValueForTerm( RatioTerm.ANTECEDENT );
  const snapConserveFunction = getKeyboardInputSnappingMapper( getIdealValue, keyboardStep, keyboardStep * rapConstants.SHIFT_KEY_MULTIPLIER );
  model.targetRatioProperty.value = 2 / 7;
  ratioTupleProperty.value = new RAPRatioTuple( 0.14, 0.4 );

  let newValue = null;

  newValue = snapConserveFunction( 0.13, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  assert.ok( ratioTupleProperty.value.antecedent === 0.13, 'one step down' );

  newValue = snapConserveFunction( 0.12, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  assert.ok( ratioTupleProperty.value.antecedent === 0.12, 'another step down' );

  newValue = snapConserveFunction( 0.11, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  const idealRatio = model.targetRatioProperty.value * ratioTupleProperty.value.consequent;
  assert.ok( ratioTupleProperty.value.antecedent === idealRatio, 'another step down should snap to in proportion' );

  newValue = snapConserveFunction( ratioTupleProperty.value.antecedent - 0.01, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  assert.ok( ratioTupleProperty.value.antecedent === 0.10, 'another step down should snap to in proportion' );

  newValue = snapConserveFunction( 0.09, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  assert.ok( ratioTupleProperty.value.antecedent === 0.09, 'another step down should snap to in proportion' );
} );

QUnit.test( 'keyboard always can get in proportion: 2/7 moving up', assert => {

  const model = new RAPModel( Tandem.OPT_OUT );
  const ratioTupleProperty = model.ratio.tupleProperty;

  const getIdealValue = () => model.getIdealValueForTerm( RatioTerm.ANTECEDENT );
  const snapConserveFunction = getKeyboardInputSnappingMapper( getIdealValue, keyboardStep, keyboardStep * rapConstants.SHIFT_KEY_MULTIPLIER );
  model.targetRatioProperty.value = 2 / 7;
  ratioTupleProperty.value = new RAPRatioTuple( 0.09, 0.4 );

  let newValue = null;

  newValue = snapConserveFunction( 0.1, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  assert.ok( ratioTupleProperty.value.antecedent === 0.1, 'step up' );

  newValue = snapConserveFunction( 0.11, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  assert.ok( ratioTupleProperty.value.antecedent === 0.11, 'step up' );

  newValue = snapConserveFunction( 0.12, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  const idealAntecedent = model.targetRatioProperty.value * ratioTupleProperty.value.consequent;
  assert.ok( ratioTupleProperty.value.antecedent === idealAntecedent, 'step up through ideal' );

  newValue = snapConserveFunction( ratioTupleProperty.value.antecedent + 0.01, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  assert.ok( ratioTupleProperty.value.antecedent === 0.13, 'step up' );
} );

QUnit.test( 'test case of 3/4 "ish"', assert => {
  // Buggy case from https://github.com/phetsims/ratio-and-proportion/issues/354

  const model = new RAPModel( Tandem.OPT_OUT );
  const ratioTupleProperty = model.ratio.tupleProperty;

  const getIdealValue = () => model.getIdealValueForTerm( RatioTerm.ANTECEDENT );
  const snapConserveFunction = getKeyboardInputSnappingMapper( getIdealValue, keyboardStep, keyboardStep * rapConstants.SHIFT_KEY_MULTIPLIER );
  model.targetRatioProperty.value = 3 / 4;
  ratioTupleProperty.value = new RAPRatioTuple( 0.29, 0.41150407096456454 );

  let newValue = null;

  newValue = snapConserveFunction( 0.3, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  assert.ok( ratioTupleProperty.value.antecedent === 0.3, 'step up' );

  newValue = snapConserveFunction( 0.31, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  const idealAntecedent = model.targetRatioProperty.value * ratioTupleProperty.value.consequent;
  assert.ok( ratioTupleProperty.value.antecedent === idealAntecedent, 'step up into in-proportion' );

  newValue = snapConserveFunction( ratioTupleProperty.value.antecedent + 0.01, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  assert.ok( ratioTupleProperty.value.antecedent === 0.32, 'utilize remainder' );

  newValue = snapConserveFunction( 0.31, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );

  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  assert.ok( ratioTupleProperty.value.antecedent === 0.31, 'step down' );

  assert.ok( model.inProportionProperty.value, 'should be in proportion or this test is bogus' );

  newValue = snapConserveFunction( 0.30, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  assert.ok( ratioTupleProperty.value.antecedent === 0.30, 'step down through ideal because we are in proportion already' );

} );


QUnit.test( 'test case of 1/2 "ish"', assert => {
  // Buggy case from https://github.com/phetsims/ratio-and-proportion/issues/354#issuecomment-796067400

  const model = new RAPModel( Tandem.OPT_OUT );
  const ratioTupleProperty = model.ratio.tupleProperty;

  const getIdealValue = () => model.getIdealValueForTerm( RatioTerm.ANTECEDENT );
  const snapConserveFunction = getKeyboardInputSnappingMapper( getIdealValue, keyboardStep, keyboardStep * rapConstants.SHIFT_KEY_MULTIPLIER );
  model.targetRatioProperty.value = 1 / 3;
  ratioTupleProperty.value = new RAPRatioTuple( 0.23, 0.6162765341338137 );

  let newValue = null;

  newValue = snapConserveFunction( 0.22, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  assert.ok( ratioTupleProperty.value.antecedent === 0.22, 'normal shift step down' );

  newValue = snapConserveFunction( 0.21, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  assert.ok( ratioTupleProperty.value.antecedent === 0.21, 'normal shift step down 2' );

  newValue = snapConserveFunction( 0.20, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  const idealAntecedent = model.targetRatioProperty.value * ratioTupleProperty.value.consequent;
  assert.ok( ratioTupleProperty.value.antecedent === idealAntecedent, 'utilize remainder' );

  newValue = snapConserveFunction( ratioTupleProperty.value.antecedent - 0.01, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  assert.ok( ratioTupleProperty.value.antecedent === 0.19, 'step down' );


  newValue = snapConserveFunction( 0.2, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  assert.ok( ratioTupleProperty.value.antecedent === 0.2, 'step up' );

  newValue = snapConserveFunction( 0.21, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  const idealAntecedent2 = model.targetRatioProperty.value * ratioTupleProperty.value.consequent;
  assert.ok( ratioTupleProperty.value.antecedent === idealAntecedent2, 'step up into ideal' );

  newValue = snapConserveFunction( ratioTupleProperty.value.antecedent + 0.01, ratioTupleProperty.value.antecedent, true, model.inProportionProperty.value );
  ratioTupleProperty.value = ratioTupleProperty.value.withAntecedent( newValue );
  assert.ok( ratioTupleProperty.value.antecedent === 0.22, 'step up from ideal past next even step' );
} );
