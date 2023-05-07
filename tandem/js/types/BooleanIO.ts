// Copyright 2018-2022, University of Colorado Boulder

/**
 * IO Type for JS's built-in boolean type.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import tandemNamespace from '../tandemNamespace.js';
import IOType from './IOType.js';
import StateSchema from './StateSchema.js';
import ValueIO from './ValueIO.js';

const BooleanIO = new IOType<boolean, boolean>( 'BooleanIO', {
  supertype: ValueIO,
  valueType: 'boolean',
  documentation: 'IO Type for Javascript\'s boolean primitive type',
  stateSchema: StateSchema.asValue<boolean, boolean>( 'boolean', { valueType: 'boolean' } ),
  toStateObject: _.identity
} );

tandemNamespace.register( 'BooleanIO', BooleanIO );
export default BooleanIO;