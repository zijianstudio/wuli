// Copyright 2018-2022, University of Colorado Boulder

/**
 * IO Type for JS's built-in number type.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import tandemNamespace from '../tandemNamespace.js';
import IOType from './IOType.js';
import StateSchema from './StateSchema.js';
const NumberIO = new IOType('NumberIO', {
  valueType: 'number',
  documentation: 'IO Type for Javascript\'s number primitive type',
  toStateObject: _.identity,
  fromStateObject: stateObject => stateObject,
  stateSchema: StateSchema.asValue('number', {
    isValidValue: value => typeof value === 'number' && !isNaN(value) && value !== Number.POSITIVE_INFINITY && value !== Number.NEGATIVE_INFINITY
  })
});
tandemNamespace.register('NumberIO', NumberIO);
export default NumberIO;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0YW5kZW1OYW1lc3BhY2UiLCJJT1R5cGUiLCJTdGF0ZVNjaGVtYSIsIk51bWJlcklPIiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsInRvU3RhdGVPYmplY3QiLCJfIiwiaWRlbnRpdHkiLCJmcm9tU3RhdGVPYmplY3QiLCJzdGF0ZU9iamVjdCIsInN0YXRlU2NoZW1hIiwiYXNWYWx1ZSIsImlzVmFsaWRWYWx1ZSIsInZhbHVlIiwiaXNOYU4iLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsIk5FR0FUSVZFX0lORklOSVRZIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOdW1iZXJJTy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBJTyBUeXBlIGZvciBKUydzIGJ1aWx0LWluIG51bWJlciB0eXBlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEFuZHJldyBBZGFyZSAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgdGFuZGVtTmFtZXNwYWNlIGZyb20gJy4uL3RhbmRlbU5hbWVzcGFjZS5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi9JT1R5cGUuanMnO1xyXG5pbXBvcnQgU3RhdGVTY2hlbWEgZnJvbSAnLi9TdGF0ZVNjaGVtYS5qcyc7XHJcblxyXG5jb25zdCBOdW1iZXJJTyA9IG5ldyBJT1R5cGU8bnVtYmVyLCBudW1iZXI+KCAnTnVtYmVySU8nLCB7XHJcbiAgdmFsdWVUeXBlOiAnbnVtYmVyJyxcclxuICBkb2N1bWVudGF0aW9uOiAnSU8gVHlwZSBmb3IgSmF2YXNjcmlwdFxcJ3MgbnVtYmVyIHByaW1pdGl2ZSB0eXBlJyxcclxuICB0b1N0YXRlT2JqZWN0OiBfLmlkZW50aXR5LFxyXG4gIGZyb21TdGF0ZU9iamVjdDogc3RhdGVPYmplY3QgPT4gc3RhdGVPYmplY3QsXHJcbiAgc3RhdGVTY2hlbWE6IFN0YXRlU2NoZW1hLmFzVmFsdWU8bnVtYmVyLCBudW1iZXI+KCAnbnVtYmVyJywge1xyXG4gICAgaXNWYWxpZFZhbHVlOiAoIHZhbHVlOiBudW1iZXIgKSA9PiAoIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKCB2YWx1ZSApICYmIHZhbHVlICE9PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgJiYgdmFsdWUgIT09IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSApXHJcbiAgfSApXHJcbn0gKTtcclxuXHJcbnRhbmRlbU5hbWVzcGFjZS5yZWdpc3RlciggJ051bWJlcklPJywgTnVtYmVySU8gKTtcclxuZXhwb3J0IGRlZmF1bHQgTnVtYmVySU87Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHVCQUF1QjtBQUNuRCxPQUFPQyxNQUFNLE1BQU0sYUFBYTtBQUNoQyxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBRTFDLE1BQU1DLFFBQVEsR0FBRyxJQUFJRixNQUFNLENBQWtCLFVBQVUsRUFBRTtFQUN2REcsU0FBUyxFQUFFLFFBQVE7RUFDbkJDLGFBQWEsRUFBRSxpREFBaUQ7RUFDaEVDLGFBQWEsRUFBRUMsQ0FBQyxDQUFDQyxRQUFRO0VBQ3pCQyxlQUFlLEVBQUVDLFdBQVcsSUFBSUEsV0FBVztFQUMzQ0MsV0FBVyxFQUFFVCxXQUFXLENBQUNVLE9BQU8sQ0FBa0IsUUFBUSxFQUFFO0lBQzFEQyxZQUFZLEVBQUlDLEtBQWEsSUFBUSxPQUFPQSxLQUFLLEtBQUssUUFBUSxJQUFJLENBQUNDLEtBQUssQ0FBRUQsS0FBTSxDQUFDLElBQUlBLEtBQUssS0FBS0UsTUFBTSxDQUFDQyxpQkFBaUIsSUFBSUgsS0FBSyxLQUFLRSxNQUFNLENBQUNFO0VBQzlJLENBQUU7QUFDSixDQUFFLENBQUM7QUFFSGxCLGVBQWUsQ0FBQ21CLFFBQVEsQ0FBRSxVQUFVLEVBQUVoQixRQUFTLENBQUM7QUFDaEQsZUFBZUEsUUFBUSJ9