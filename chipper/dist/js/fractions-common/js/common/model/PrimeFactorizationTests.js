// Copyright 2018-2020, University of Colorado Boulder

/**
 * Unit tests for PrimeFactorization
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Utils from '../../../../dot/js/Utils.js';
import PrimeFactorization from './PrimeFactorization.js';
import Primes from './Primes.js';

// constants
const MAX_NUMBER = 500;
QUnit.module('PrimeFactorization');
QUnit.test(`Prime factorizations of everything up to ${MAX_NUMBER}`, assert => {
  for (let n = 2; n < MAX_NUMBER; n++) {
    const factorization = PrimeFactorization.factor(n);
    factorization.factors.forEach(factor => {
      assert.ok(Primes.isPrime(factor.prime), `Prime of factorization of ${n} is prime`);
    });
    assert.equal(n, factorization.number, `Prime factorization of ${n} is consistent`);
  }
});
QUnit.test(`Divisors of everything up to ${MAX_NUMBER}`, assert => {
  for (let n = 2; n < MAX_NUMBER; n++) {
    const factorization = PrimeFactorization.factor(n);
    const divisorNumbers = factorization.divisors.map(d => d.number);
    divisorNumbers.sort((a, b) => a - b);
    const referenceDivisorNumbers = [];
    for (let x = 1; x <= n; x++) {
      const isDivisor = n / x % 1 === 0;
      if (isDivisor) {
        referenceDivisorNumbers.push(x);
      }
    }
    assert.ok(_.isEqual(divisorNumbers, referenceDivisorNumbers), `Divisors for ${n}, actual ${divisorNumbers}, expected ${referenceDivisorNumbers}`);
  }
});
QUnit.test('Multiplication tests', assert => {
  for (let a = 1; a <= 30; a++) {
    const aFactorization = PrimeFactorization.factor(a);
    for (let b = 1; b <= 30; b++) {
      const bFactorization = PrimeFactorization.factor(b);
      assert.equal(a * b, aFactorization.times(bFactorization).number, `Multiplication of ${a} times ${b}`);
    }
  }
});
QUnit.test('Division tests', assert => {
  for (let a = 1; a <= 40; a++) {
    const factorization = PrimeFactorization.factor(a);
    const divisors = factorization.divisors;
    divisors.forEach(divisor => {
      assert.equal(a / divisor.number, factorization.divided(divisor).number, `Division of ${a} divided by ${divisor.number}`);
    });
  }
});
QUnit.test('GCD tests', assert => {
  for (let a = 1; a <= 30; a++) {
    const aFactorization = PrimeFactorization.factor(a);
    for (let b = 1; b <= 30; b++) {
      const bFactorization = PrimeFactorization.factor(b);
      assert.equal(Utils.gcd(a, b), aFactorization.gcd(bFactorization).number, `GCD of ${a} and ${b}`);
    }
  }
});
QUnit.test('LCM tests', assert => {
  for (let a = 1; a <= 30; a++) {
    const aFactorization = PrimeFactorization.factor(a);
    for (let b = 1; b <= 30; b++) {
      const bFactorization = PrimeFactorization.factor(b);
      assert.equal(Utils.lcm(a, b), aFactorization.lcm(bFactorization).number, `LCM of ${a} and ${b}`);
    }
  }
});
QUnit.test('Divides', assert => {
  for (let a = 1; a <= 30; a++) {
    const aFactorization = PrimeFactorization.factor(a);
    for (let b = 1; b <= 30; b++) {
      const bFactorization = PrimeFactorization.factor(b);
      assert.equal(b / a % 1 === 0, aFactorization.divides(bFactorization), `If ${a} divides ${b}`);
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlByaW1lRmFjdG9yaXphdGlvbiIsIlByaW1lcyIsIk1BWF9OVU1CRVIiLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJuIiwiZmFjdG9yaXphdGlvbiIsImZhY3RvciIsImZhY3RvcnMiLCJmb3JFYWNoIiwib2siLCJpc1ByaW1lIiwicHJpbWUiLCJlcXVhbCIsIm51bWJlciIsImRpdmlzb3JOdW1iZXJzIiwiZGl2aXNvcnMiLCJtYXAiLCJkIiwic29ydCIsImEiLCJiIiwicmVmZXJlbmNlRGl2aXNvck51bWJlcnMiLCJ4IiwiaXNEaXZpc29yIiwicHVzaCIsIl8iLCJpc0VxdWFsIiwiYUZhY3Rvcml6YXRpb24iLCJiRmFjdG9yaXphdGlvbiIsInRpbWVzIiwiZGl2aXNvciIsImRpdmlkZWQiLCJnY2QiLCJsY20iLCJkaXZpZGVzIl0sInNvdXJjZXMiOlsiUHJpbWVGYWN0b3JpemF0aW9uVGVzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVW5pdCB0ZXN0cyBmb3IgUHJpbWVGYWN0b3JpemF0aW9uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFByaW1lRmFjdG9yaXphdGlvbiBmcm9tICcuL1ByaW1lRmFjdG9yaXphdGlvbi5qcyc7XHJcbmltcG9ydCBQcmltZXMgZnJvbSAnLi9QcmltZXMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE1BWF9OVU1CRVIgPSA1MDA7XHJcblxyXG5RVW5pdC5tb2R1bGUoICdQcmltZUZhY3Rvcml6YXRpb24nICk7XHJcblxyXG5RVW5pdC50ZXN0KCBgUHJpbWUgZmFjdG9yaXphdGlvbnMgb2YgZXZlcnl0aGluZyB1cCB0byAke01BWF9OVU1CRVJ9YCwgYXNzZXJ0ID0+IHtcclxuICBmb3IgKCBsZXQgbiA9IDI7IG4gPCBNQVhfTlVNQkVSOyBuKysgKSB7XHJcbiAgICBjb25zdCBmYWN0b3JpemF0aW9uID0gUHJpbWVGYWN0b3JpemF0aW9uLmZhY3RvciggbiApO1xyXG4gICAgZmFjdG9yaXphdGlvbi5mYWN0b3JzLmZvckVhY2goIGZhY3RvciA9PiB7XHJcbiAgICAgIGFzc2VydC5vayggUHJpbWVzLmlzUHJpbWUoIGZhY3Rvci5wcmltZSApLCBgUHJpbWUgb2YgZmFjdG9yaXphdGlvbiBvZiAke259IGlzIHByaW1lYCApO1xyXG4gICAgfSApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBuLCBmYWN0b3JpemF0aW9uLm51bWJlciwgYFByaW1lIGZhY3Rvcml6YXRpb24gb2YgJHtufSBpcyBjb25zaXN0ZW50YCApO1xyXG4gIH1cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggYERpdmlzb3JzIG9mIGV2ZXJ5dGhpbmcgdXAgdG8gJHtNQVhfTlVNQkVSfWAsIGFzc2VydCA9PiB7XHJcbiAgZm9yICggbGV0IG4gPSAyOyBuIDwgTUFYX05VTUJFUjsgbisrICkge1xyXG4gICAgY29uc3QgZmFjdG9yaXphdGlvbiA9IFByaW1lRmFjdG9yaXphdGlvbi5mYWN0b3IoIG4gKTtcclxuICAgIGNvbnN0IGRpdmlzb3JOdW1iZXJzID0gZmFjdG9yaXphdGlvbi5kaXZpc29ycy5tYXAoIGQgPT4gZC5udW1iZXIgKTtcclxuICAgIGRpdmlzb3JOdW1iZXJzLnNvcnQoICggYSwgYiApID0+IGEgLSBiICk7XHJcblxyXG4gICAgY29uc3QgcmVmZXJlbmNlRGl2aXNvck51bWJlcnMgPSBbXTtcclxuICAgIGZvciAoIGxldCB4ID0gMTsgeCA8PSBuOyB4KysgKSB7XHJcbiAgICAgIGNvbnN0IGlzRGl2aXNvciA9ICggbiAvIHggKSAlIDEgPT09IDA7XHJcbiAgICAgIGlmICggaXNEaXZpc29yICkge1xyXG4gICAgICAgIHJlZmVyZW5jZURpdmlzb3JOdW1iZXJzLnB1c2goIHggKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydC5vayggXy5pc0VxdWFsKCBkaXZpc29yTnVtYmVycywgcmVmZXJlbmNlRGl2aXNvck51bWJlcnMgKSwgYERpdmlzb3JzIGZvciAke259LCBhY3R1YWwgJHtkaXZpc29yTnVtYmVyc30sIGV4cGVjdGVkICR7cmVmZXJlbmNlRGl2aXNvck51bWJlcnN9YCApO1xyXG4gIH1cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ011bHRpcGxpY2F0aW9uIHRlc3RzJywgYXNzZXJ0ID0+IHtcclxuICBmb3IgKCBsZXQgYSA9IDE7IGEgPD0gMzA7IGErKyApIHtcclxuICAgIGNvbnN0IGFGYWN0b3JpemF0aW9uID0gUHJpbWVGYWN0b3JpemF0aW9uLmZhY3RvciggYSApO1xyXG4gICAgZm9yICggbGV0IGIgPSAxOyBiIDw9IDMwOyBiKysgKSB7XHJcbiAgICAgIGNvbnN0IGJGYWN0b3JpemF0aW9uID0gUHJpbWVGYWN0b3JpemF0aW9uLmZhY3RvciggYiApO1xyXG5cclxuICAgICAgYXNzZXJ0LmVxdWFsKCBhICogYiwgYUZhY3Rvcml6YXRpb24udGltZXMoIGJGYWN0b3JpemF0aW9uICkubnVtYmVyLCBgTXVsdGlwbGljYXRpb24gb2YgJHthfSB0aW1lcyAke2J9YCApO1xyXG4gICAgfVxyXG4gIH1cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0RpdmlzaW9uIHRlc3RzJywgYXNzZXJ0ID0+IHtcclxuICBmb3IgKCBsZXQgYSA9IDE7IGEgPD0gNDA7IGErKyApIHtcclxuICAgIGNvbnN0IGZhY3Rvcml6YXRpb24gPSBQcmltZUZhY3Rvcml6YXRpb24uZmFjdG9yKCBhICk7XHJcbiAgICBjb25zdCBkaXZpc29ycyA9IGZhY3Rvcml6YXRpb24uZGl2aXNvcnM7XHJcblxyXG4gICAgZGl2aXNvcnMuZm9yRWFjaCggZGl2aXNvciA9PiB7XHJcbiAgICAgIGFzc2VydC5lcXVhbCggYSAvIGRpdmlzb3IubnVtYmVyLCBmYWN0b3JpemF0aW9uLmRpdmlkZWQoIGRpdmlzb3IgKS5udW1iZXIsIGBEaXZpc2lvbiBvZiAke2F9IGRpdmlkZWQgYnkgJHtkaXZpc29yLm51bWJlcn1gICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnR0NEIHRlc3RzJywgYXNzZXJ0ID0+IHtcclxuICBmb3IgKCBsZXQgYSA9IDE7IGEgPD0gMzA7IGErKyApIHtcclxuICAgIGNvbnN0IGFGYWN0b3JpemF0aW9uID0gUHJpbWVGYWN0b3JpemF0aW9uLmZhY3RvciggYSApO1xyXG4gICAgZm9yICggbGV0IGIgPSAxOyBiIDw9IDMwOyBiKysgKSB7XHJcbiAgICAgIGNvbnN0IGJGYWN0b3JpemF0aW9uID0gUHJpbWVGYWN0b3JpemF0aW9uLmZhY3RvciggYiApO1xyXG5cclxuICAgICAgYXNzZXJ0LmVxdWFsKCBVdGlscy5nY2QoIGEsIGIgKSwgYUZhY3Rvcml6YXRpb24uZ2NkKCBiRmFjdG9yaXphdGlvbiApLm51bWJlciwgYEdDRCBvZiAke2F9IGFuZCAke2J9YCApO1xyXG4gICAgfVxyXG4gIH1cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0xDTSB0ZXN0cycsIGFzc2VydCA9PiB7XHJcbiAgZm9yICggbGV0IGEgPSAxOyBhIDw9IDMwOyBhKysgKSB7XHJcbiAgICBjb25zdCBhRmFjdG9yaXphdGlvbiA9IFByaW1lRmFjdG9yaXphdGlvbi5mYWN0b3IoIGEgKTtcclxuICAgIGZvciAoIGxldCBiID0gMTsgYiA8PSAzMDsgYisrICkge1xyXG4gICAgICBjb25zdCBiRmFjdG9yaXphdGlvbiA9IFByaW1lRmFjdG9yaXphdGlvbi5mYWN0b3IoIGIgKTtcclxuXHJcbiAgICAgIGFzc2VydC5lcXVhbCggVXRpbHMubGNtKCBhLCBiICksIGFGYWN0b3JpemF0aW9uLmxjbSggYkZhY3Rvcml6YXRpb24gKS5udW1iZXIsIGBMQ00gb2YgJHthfSBhbmQgJHtifWAgKTtcclxuICAgIH1cclxuICB9XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdEaXZpZGVzJywgYXNzZXJ0ID0+IHtcclxuICBmb3IgKCBsZXQgYSA9IDE7IGEgPD0gMzA7IGErKyApIHtcclxuICAgIGNvbnN0IGFGYWN0b3JpemF0aW9uID0gUHJpbWVGYWN0b3JpemF0aW9uLmZhY3RvciggYSApO1xyXG4gICAgZm9yICggbGV0IGIgPSAxOyBiIDw9IDMwOyBiKysgKSB7XHJcbiAgICAgIGNvbnN0IGJGYWN0b3JpemF0aW9uID0gUHJpbWVGYWN0b3JpemF0aW9uLmZhY3RvciggYiApO1xyXG5cclxuICAgICAgYXNzZXJ0LmVxdWFsKCAoIGIgLyBhICkgJSAxID09PSAwLCBhRmFjdG9yaXphdGlvbi5kaXZpZGVzKCBiRmFjdG9yaXphdGlvbiApLCBgSWYgJHthfSBkaXZpZGVzICR7Yn1gICk7XHJcbiAgICB9XHJcbiAgfVxyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0Msa0JBQWtCLE1BQU0seUJBQXlCO0FBQ3hELE9BQU9DLE1BQU0sTUFBTSxhQUFhOztBQUVoQztBQUNBLE1BQU1DLFVBQVUsR0FBRyxHQUFHO0FBRXRCQyxLQUFLLENBQUNDLE1BQU0sQ0FBRSxvQkFBcUIsQ0FBQztBQUVwQ0QsS0FBSyxDQUFDRSxJQUFJLENBQUcsNENBQTJDSCxVQUFXLEVBQUMsRUFBRUksTUFBTSxJQUFJO0VBQzlFLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHTCxVQUFVLEVBQUVLLENBQUMsRUFBRSxFQUFHO0lBQ3JDLE1BQU1DLGFBQWEsR0FBR1Isa0JBQWtCLENBQUNTLE1BQU0sQ0FBRUYsQ0FBRSxDQUFDO0lBQ3BEQyxhQUFhLENBQUNFLE9BQU8sQ0FBQ0MsT0FBTyxDQUFFRixNQUFNLElBQUk7TUFDdkNILE1BQU0sQ0FBQ00s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