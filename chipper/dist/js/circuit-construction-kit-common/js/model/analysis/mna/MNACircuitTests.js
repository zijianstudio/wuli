// Copyright 2015-2022, University of Colorado Boulder

/**
 * MNACircuit tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import MNACircuit from './MNACircuit.js';
import MNASolution from './MNASolution.js';
import MNAResistor from './MNAResistor.js';
import MNABattery from './MNABattery.js';
import MNACurrent from './MNACurrent.js';
QUnit.module('MNACircuitTests');
const approxEquals = (a, b) => Math.abs(a - b) < 1E-6;
QUnit.test('test_should_be_able_to_obtain_current_for_a_resistor', assert => {
  const battery = new MNABattery('0', '1', 4.0);
  const resistor = new MNAResistor('1', '0', 2.0);
  const solution = new MNACircuit([battery], [resistor], []).solve();
  const desiredSolution = new MNASolution(new Map([['0', 0], ['1', -4]]), new Map([[battery, 2.0]]));
  assert.equal(solution.approxEquals(desiredSolution, assert), true, 'solution should match');

  // same magnitude as battery: positive because current flows from node 1 to 0
  assert.equal(approxEquals(solution.getCurrentForResistor(resistor), -2), true, 'current through resistor should be 2.0 Amps');
});
QUnit.test('test_an_unconnected_resistor_shouldnt_cause_problems', assert => {
  const battery = new MNABattery('0', '1', 4.0);
  const resistor1 = new MNAResistor('1', '0', 4.0);
  const resistor2 = new MNAResistor('2', '3', 100);
  const circuit = new MNACircuit([battery], [resistor1, resistor2], []);
  const desiredSolution = new MNASolution(new Map([['0', 0], ['1', -4], ['2', 0], ['3', 0]]), new Map([[battery, 1.0]]));
  const solution = circuit.solve();
  assert.equal(solution.approxEquals(desiredSolution, assert), true, 'solutions should match');
});
QUnit.test('test_current_should_be_reversed_when_voltage_is_reversed', assert => {
  const battery = new MNABattery('0', '1', -4);
  const resistor = new MNAResistor('1', '0', 2);
  const circuit = new MNACircuit([battery], [resistor], []);
  const voltageMap = new Map([['0', 0], ['1', 4]]);
  const desiredSolution = new MNASolution(voltageMap, new Map([[battery, -2.0]]));
  const solution = circuit.solve();
  assert.equal(solution.approxEquals(desiredSolution, assert), true, 'solutions should match');
});
QUnit.test('test_two_batteries_in_series_should_have_voltage_added', assert => {
  const battery1 = new MNABattery('0', '1', -4);
  const battery2 = new MNABattery('1', '2', -4);
  const resistor1 = new MNAResistor('2', '0', 2.0);
  const circuit = new MNACircuit([battery1, battery2], [resistor1], []);
  const desiredSolution = new MNASolution(new Map([['0', 0], ['1', 4], ['2', 8]]), new Map([[battery1, -4.0], [battery2, -4.0]]));
  const solution = circuit.solve();
  assert.equal(solution.approxEquals(desiredSolution, assert), true, 'solutions should match');
});
QUnit.test('test_two_resistors_in_series_should_have_resistance_added', assert => {
  const battery = new MNABattery('0', '1', 5.0);
  const resistor1 = new MNAResistor('1', '2', 10.0);
  const resistor2 = new MNAResistor('2', '0', 10.0);
  const circuit = new MNACircuit([battery], [resistor1, resistor2], []);
  const voltageMap = new Map([['0', 0], ['1', -5], ['2', -2.5]]);
  const desiredSolution = new MNASolution(voltageMap, new Map([[battery, 5 / 20.0]]));
  const solution = circuit.solve();
  assert.equal(solution.approxEquals(desiredSolution, assert), true, 'solutions should match');
});
QUnit.test('test_A_resistor_with_one_node_unconnected_shouldnt_cause_problems', assert => {
  const battery = new MNABattery('0', '1', 4.0);
  const resistor1 = new MNAResistor('1', '0', 4.0);
  const resistor2 = new MNAResistor('0', '2', 100.0);
  const circuit = new MNACircuit([battery], [resistor1, resistor2], []);
  const voltageMap = new Map([['0', 0], ['1', -4], ['2', 0]]);
  const desiredSolution = new MNASolution(voltageMap, new Map([[battery, 1.0]]));
  const solution = circuit.solve();
  assert.equal(solution.approxEquals(desiredSolution, assert), true, 'solutions should match');
});
QUnit.test('test_an_unconnected_resistor_shouldnt_cause_problems', assert => {
  const battery = new MNABattery('0', '1', 4.0);
  const resistor1 = new MNAResistor('1', '0', 4.0);
  const resistor2 = new MNAResistor('2', '3', 100.0);
  const circuit = new MNACircuit([battery], [resistor1, resistor2], []);
  const voltageMap = new Map([['0', 0], ['1', -4], ['2', 0], ['3', 0]]);
  const desiredSolution = new MNASolution(voltageMap, new Map([[battery, 1.0]]));
  const solution = circuit.solve();
  assert.equal(solution.approxEquals(desiredSolution, assert), true, 'solutions should match');
});
QUnit.test('test_should_handle_resistors_with_no_resistance', assert => {
  const battery = new MNABattery('0', '1', 5);
  const resistor = new MNAResistor('2', '0', 0);
  const resistor0 = new MNAResistor('1', '2', 10);
  const circuit = new MNACircuit([battery], [resistor0, resistor], []);
  const voltageMap = new Map([['0', 0], ['1', -5], ['2', 0]]);
  const desiredSolution = new MNASolution(voltageMap, new Map([[battery, 5 / 10], [resistor, 5 / 10]]));
  const solution = circuit.solve();
  assert.equal(solution.approxEquals(desiredSolution, assert), true, 'solutions should match');
});
QUnit.test('test_resistors_in_parallel_should_have_harmonic_mean_of_resistance', assert => {
  const V = 9.0;
  const R1 = 5.0;
  const R2 = 5.0;
  const Req = 1 / (1 / R1 + 1 / R2);
  const battery = new MNABattery('0', '1', V);
  const resistor1 = new MNAResistor('1', '0', R1);
  const resistor2 = new MNAResistor('1', '0', R2);
  const circuit = new MNACircuit([battery], [resistor1, resistor2], []);
  const voltageMap = new Map([['0', 0], ['1', -V]]);
  const desiredSolution = new MNASolution(voltageMap, new Map([[battery, V / Req]]));
  const solution = circuit.solve();
  assert.equal(solution.approxEquals(desiredSolution, assert), true, 'solutions should match');
});

// ( () => {
//
// // http://zacg.github.io/blog/2013/08/02/binary-combinations-in-javascript/
//   function binaryCombos( n: number ) {
//     const result = [];
//     for ( let y = 0; y < Math.pow( 2, n ); y++ ) {
//       const combo = [];
//       for ( let x = 0; x < n; x++ ) {
//         //shift bit and and it with 1
//         if ( ( y >> x ) & 1 ) {
//           combo.push( true );
//         }
//         else {
//           combo.push( false );
//         }
//       }
//       result.push( combo );
//     }
//     return result;
//   }
//
// //Usage
//   const combos = binaryCombos( 7 );
//   console.log( 'testing ' + combos.length + ' combos' );
//
//   for ( let x = 0; x < combos.length; x++ ) {
//     // console.log( combos[ x ].join( ',' ) );
//
//     window.signs = combos[ x ].map( t => t ? 1 : -1 );
//
//     const v1 = new MNABattery( '1', '0', 24 );
//     const v2 = new MNABattery( '3', '0', 15 );
//     const r1 = new MNAResistor( '1', '2', 10000 );
//     const r2 = new MNAResistor( '2', '3', 8100 );
//     const r3 = new MNAResistor( '2', '0', 4700 );
//
//     const circuit = new MNACircuit( [ v1, v2 ], [ r1, r2, r3 ], [] );
//     const solution = circuit.solve();
//
//     // console.log( solution.getNodeVoltage( '0' ) );
//     // console.log( solution.getNodeVoltage( '1' ) );
//     // console.log( solution.getNodeVoltage( '2' ) );
//     // console.log( solution.getNodeVoltage( '3' ) );
//     // console.log( solution.getSolvedCurrent( v1 ) );
//     // console.log( solution.getSolvedCurrent( v2 ) );
//
//     let wins = 0;
//     if ( approxEquals2( solution.getNodeVoltage( '0' ), 0 ) ) { wins++; }
//     if ( approxEquals2( solution.getNodeVoltage( '1' ), 24 ) ) { wins++; }
//     if ( approxEquals2( solution.getNodeVoltage( '2' ), 9.7470 ) ) { wins++; }
//     if ( approxEquals2( solution.getNodeVoltage( '3' ), 15.0 ) ) { wins++; }
//     if ( approxEquals2( solution.getSolvedCurrent( v1 ), -1.425E-3 ) ) { wins++; }
//     if ( approxEquals2( solution.getSolvedCurrent( v2 ), -6.485E-4 ) ) { wins++; }
//
//
//     console.log( 'wins: ' + wins );
//     if ( wins === 6 ) {
//       console.log( window.signs );
//     }
//   }
//
//   // v1 1 0 dc 24V
//   // v2 3 0 dc 15V
//   // r1 1 2 10000 Ohms
//   // r2 2 3 8100 Ohms
//   // r3 2 0 4700 Ohms
//
//   // node voltages: (1) 24.0000 (2) 9.7470 (3) 15.0000
//   // voltage source currents: (v1) -1.425E-03 (v2) -6.485E-04
//
// } )();

// Netlist example at https://www.allaboutcircuits.com/textbook/reference/chpt-7/example-circuits-and-netlists/
QUnit.test('Netlist: 2 batteries & 3 resistors', assert => {
  const v1 = new MNABattery('1', '0', 24);
  const v2 = new MNABattery('3', '0', 15);
  const r1 = new MNAResistor('1', '2', 10000);
  const r2 = new MNAResistor('2', '3', 8100);
  const r3 = new MNAResistor('2', '0', 4700);
  const circuit = new MNACircuit([v1, v2], [r1, r2, r3], []);
  const desiredSolution = new MNASolution(new Map([['0', 0], ['1', 24.0], ['2', 9.7470], ['3', 15.0]]), new Map([[v1, -1.425E-3], [v2, -6.485E-4]]));
  const solution = circuit.solve();
  assert.equal(solution.approxEquals(desiredSolution, assert), true, 'solutions should match');
});
QUnit.test('Netlist: 1 battery and 1 resistor', assert => {
  const v1 = new MNABattery('a', '0', 9);
  const r1 = new MNAResistor('a', '0', 9);
  const circuit = new MNACircuit([v1], [r1], []);
  const desiredSolution = new MNASolution(new Map([['a', 9], ['0', 0]]), new Map([[v1, -1.0]]));
  const solution = circuit.solve();
  assert.equal(solution.approxEquals(desiredSolution, assert), true, 'solutions should match');
});
QUnit.test('Netlist: 1 battery and 1 resistor: part 2', assert => {
  const v1 = new MNABattery('a', '0', 10);
  const r1 = new MNAResistor('a', '0', 5);
  const circuit = new MNACircuit([v1], [r1], []);
  const desiredSolution = new MNASolution(new Map([['a', 10], ['0', 0]]), new Map([[v1, -2.0]]));
  const solution = circuit.solve();
  assert.equal(solution.approxEquals(desiredSolution, assert), true, 'solutions should match');
});

// Compare to the example at https://www.khanacademy.org/science/electrical-engineering/ee-circuit-analysis-topic/ee-dc-circuit-analysis/a/ee-node-voltage-method
QUnit.test('Netlist: khan ee', assert => {
  const battery = new MNABattery('a', 'c', 140);
  const resistor1 = new MNAResistor('a', 'b', 20);
  const resistor2 = new MNAResistor('b', 'c', 6);
  const resistor3 = new MNAResistor('b', 'c', 5);
  const current = new MNACurrent('c', 'b', 18);
  const circuit = new MNACircuit([battery], [resistor1, resistor2, resistor3], [current]);
  const offset = -140;
  const voltageMap = new Map([['a', 140 + offset], ['b', 60 + offset], ['c', 0 + offset]]);
  const desiredSolution = new MNASolution(voltageMap, new Map([[battery, -4.0]]));
  const solution = circuit.solve();
  assert.equal(solution.approxEquals(desiredSolution, assert), true, 'solutions should match');
});
QUnit.test('netlist: ir', assert => {
  const currentSource = new MNACurrent('0', 'a', 10);
  const resistor = new MNAResistor('a', '0', 4);
  const circuit = new MNACircuit([], [resistor], [currentSource]);
  const voltageMap = new Map([['0', 0], ['a', 40.0]]);
  const desiredSolution = new MNASolution(voltageMap, new Map());
  const solution = circuit.solve();
  assert.equal(solution.approxEquals(desiredSolution, assert), true, 'solutions should match');
});

// const findOperatingPointForLRCircuit = ( V: number, R: number, L: number ) => {
//   let id = 0;
//   const resistor = new MNAResistor( '1', '2', R );
//   const battery = new MNABattery( '0', '1', V );
//   const myResistor = new MNAResistor( '2', '0', 1 );
//   const circuit = new MNACircuit( [ battery ], [ resistor, myResistor ], [] );
//   // iterateInductor( circuit, resistor, V, R, L, assert );
//   const x = circuit.solve();
// };
//
// findOperatingPointForLRCircuit( 5, 10, 1 );
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNTkFDaXJjdWl0IiwiTU5BU29sdXRpb24iLCJNTkFSZXNpc3RvciIsIk1OQUJhdHRlcnkiLCJNTkFDdXJyZW50IiwiUVVuaXQiLCJtb2R1bGUiLCJhcHByb3hFcXVhbHMiLCJhIiwiYiIsIk1hdGgiLCJhYnMiLCJ0ZXN0IiwiYXNzZXJ0IiwiYmF0dGVyeSIsInJlc2lzdG9yIiwic29sdXRpb24iLCJzb2x2ZSIsImRlc2lyZWRTb2x1dGlvbiIsIk1hcCIsImVxdWFsIiwiZ2V0Q3VycmVudEZvclJlc2lzdG9yIiwicmVzaXN0b3IxIiwicmVzaXN0b3IyIiwiY2lyY3VpdCIsInZvbHRhZ2VNYXAiLCJiYXR0ZXJ5MSIsImJhdHRlcnkyIiwicmVzaXN0b3IwIiwiViIsIlIxIiwiUjIiLCJSZXEiLCJ2MSIsInYyIiwicjEiLCJyMiIsInIzIiwicmVzaXN0b3IzIiwiY3VycmVudCIsIm9mZnNldCIsImN1cnJlbnRTb3VyY2UiXSwic291cmNlcyI6WyJNTkFDaXJjdWl0VGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTU5BQ2lyY3VpdCB0ZXN0c1xyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBNTkFDaXJjdWl0IGZyb20gJy4vTU5BQ2lyY3VpdC5qcyc7XHJcbmltcG9ydCBNTkFTb2x1dGlvbiBmcm9tICcuL01OQVNvbHV0aW9uLmpzJztcclxuaW1wb3J0IE1OQVJlc2lzdG9yIGZyb20gJy4vTU5BUmVzaXN0b3IuanMnO1xyXG5pbXBvcnQgTU5BQmF0dGVyeSBmcm9tICcuL01OQUJhdHRlcnkuanMnO1xyXG5pbXBvcnQgTU5BQ3VycmVudCBmcm9tICcuL01OQUN1cnJlbnQuanMnO1xyXG5pbXBvcnQgTU5BQ2lyY3VpdEVsZW1lbnQgZnJvbSAnLi9NTkFDaXJjdWl0RWxlbWVudC5qcyc7XHJcblxyXG5RVW5pdC5tb2R1bGUoICdNTkFDaXJjdWl0VGVzdHMnICk7XHJcblxyXG5jb25zdCBhcHByb3hFcXVhbHMgPSAoIGE6IG51bWJlciwgYjogbnVtYmVyICkgPT4gTWF0aC5hYnMoIGEgLSBiICkgPCAxRS02O1xyXG5cclxuUVVuaXQudGVzdCggJ3Rlc3Rfc2hvdWxkX2JlX2FibGVfdG9fb2J0YWluX2N1cnJlbnRfZm9yX2FfcmVzaXN0b3InLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGJhdHRlcnkgPSBuZXcgTU5BQmF0dGVyeSggJzAnLCAnMScsIDQuMCApO1xyXG4gIGNvbnN0IHJlc2lzdG9yID0gbmV3IE1OQVJlc2lzdG9yKCAnMScsICcwJywgMi4wICk7XHJcbiAgY29uc3Qgc29sdXRpb24gPSBuZXcgTU5BQ2lyY3VpdCggWyBiYXR0ZXJ5IF0sIFsgcmVzaXN0b3IgXSwgW10gKS5zb2x2ZSgpO1xyXG4gIGNvbnN0IGRlc2lyZWRTb2x1dGlvbiA9IG5ldyBNTkFTb2x1dGlvbiggbmV3IE1hcCggW1xyXG4gICAgWyAnMCcsIDAgXSxcclxuICAgIFsgJzEnLCAtNCBdXHJcbiAgXSApLCBuZXcgTWFwPE1OQUNpcmN1aXRFbGVtZW50LCBudW1iZXI+KCBbXHJcbiAgICBbIGJhdHRlcnksIDIuMCBdXHJcbiAgXSApICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBzb2x1dGlvbi5hcHByb3hFcXVhbHMoIGRlc2lyZWRTb2x1dGlvbiwgYXNzZXJ0ICksIHRydWUsICdzb2x1dGlvbiBzaG91bGQgbWF0Y2gnICk7XHJcblxyXG4gIC8vIHNhbWUgbWFnbml0dWRlIGFzIGJhdHRlcnk6IHBvc2l0aXZlIGJlY2F1c2UgY3VycmVudCBmbG93cyBmcm9tIG5vZGUgMSB0byAwXHJcbiAgYXNzZXJ0LmVxdWFsKFxyXG4gICAgYXBwcm94RXF1YWxzKCBzb2x1dGlvbi5nZXRDdXJyZW50Rm9yUmVzaXN0b3IoIHJlc2lzdG9yICksIC0yICksIHRydWUsICdjdXJyZW50IHRocm91Z2ggcmVzaXN0b3Igc2hvdWxkIGJlIDIuMCBBbXBzJ1xyXG4gICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICd0ZXN0X2FuX3VuY29ubmVjdGVkX3Jlc2lzdG9yX3Nob3VsZG50X2NhdXNlX3Byb2JsZW1zJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBiYXR0ZXJ5ID0gbmV3IE1OQUJhdHRlcnkoICcwJywgJzEnLCA0LjAgKTtcclxuICBjb25zdCByZXNpc3RvcjEgPSBuZXcgTU5BUmVzaXN0b3IoICcxJywgJzAnLCA0LjAgKTtcclxuICBjb25zdCByZXNpc3RvcjIgPSBuZXcgTU5BUmVzaXN0b3IoICcyJywgJzMnLCAxMDAgKTtcclxuICBjb25zdCBjaXJjdWl0ID0gbmV3IE1OQUNpcmN1aXQoIFsgYmF0dGVyeSBdLCBbIHJlc2lzdG9yMSwgcmVzaXN0b3IyIF0sIFtdICk7XHJcbiAgY29uc3QgZGVzaXJlZFNvbHV0aW9uID0gbmV3IE1OQVNvbHV0aW9uKCBuZXcgTWFwKCBbXHJcbiAgICBbICcwJywgMCBdLFxyXG4gICAgWyAnMScsIC00IF0sXHJcbiAgICBbICcyJywgMCBdLFxyXG4gICAgWyAnMycsIDAgXVxyXG4gIF0gKSwgbmV3IE1hcDxNTkFDaXJjdWl0RWxlbWVudCwgbnVtYmVyPiggW1xyXG4gICAgWyBiYXR0ZXJ5LCAxLjAgXVxyXG4gIF0gKSApO1xyXG4gIGNvbnN0IHNvbHV0aW9uID0gY2lyY3VpdC5zb2x2ZSgpO1xyXG4gIGFzc2VydC5lcXVhbCggc29sdXRpb24uYXBwcm94RXF1YWxzKCBkZXNpcmVkU29sdXRpb24sIGFzc2VydCApLCB0cnVlLCAnc29sdXRpb25zIHNob3VsZCBtYXRjaCcgKTtcclxufSApO1xyXG5cclxuXHJcblFVbml0LnRlc3QoICd0ZXN0X2N1cnJlbnRfc2hvdWxkX2JlX3JldmVyc2VkX3doZW5fdm9sdGFnZV9pc19yZXZlcnNlZCcsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgYmF0dGVyeSA9IG5ldyBNTkFCYXR0ZXJ5KCAnMCcsICcxJywgLTQgKTtcclxuICBjb25zdCByZXNpc3RvciA9IG5ldyBNTkFSZXNpc3RvciggJzEnLCAnMCcsIDIgKTtcclxuICBjb25zdCBjaXJjdWl0ID0gbmV3IE1OQUNpcmN1aXQoIFsgYmF0dGVyeSBdLCBbIHJlc2lzdG9yIF0sIFtdICk7XHJcbiAgY29uc3Qgdm9sdGFnZU1hcCA9IG5ldyBNYXAoIFtcclxuICAgIFsgJzAnLCAwIF0sXHJcbiAgICBbICcxJywgNCBdXHJcbiAgXSApO1xyXG5cclxuICBjb25zdCBkZXNpcmVkU29sdXRpb24gPSBuZXcgTU5BU29sdXRpb24oIHZvbHRhZ2VNYXAsIG5ldyBNYXA8TU5BQ2lyY3VpdEVsZW1lbnQsIG51bWJlcj4oIFtcclxuICAgIFsgYmF0dGVyeSwgLTIuMCBdXHJcbiAgXSApICk7XHJcbiAgY29uc3Qgc29sdXRpb24gPSBjaXJjdWl0LnNvbHZlKCk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBzb2x1dGlvbi5hcHByb3hFcXVhbHMoIGRlc2lyZWRTb2x1dGlvbiwgYXNzZXJ0ICksIHRydWUsICdzb2x1dGlvbnMgc2hvdWxkIG1hdGNoJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAndGVzdF90d29fYmF0dGVyaWVzX2luX3Nlcmllc19zaG91bGRfaGF2ZV92b2x0YWdlX2FkZGVkJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBiYXR0ZXJ5MSA9IG5ldyBNTkFCYXR0ZXJ5KCAnMCcsICcxJywgLTQgKTtcclxuICBjb25zdCBiYXR0ZXJ5MiA9IG5ldyBNTkFCYXR0ZXJ5KCAnMScsICcyJywgLTQgKTtcclxuICBjb25zdCByZXNpc3RvcjEgPSBuZXcgTU5BUmVzaXN0b3IoICcyJywgJzAnLCAyLjAgKTtcclxuICBjb25zdCBjaXJjdWl0ID0gbmV3IE1OQUNpcmN1aXQoIFsgYmF0dGVyeTEsIGJhdHRlcnkyIF0sIFsgcmVzaXN0b3IxIF0sIFtdICk7XHJcblxyXG4gIGNvbnN0IGRlc2lyZWRTb2x1dGlvbiA9IG5ldyBNTkFTb2x1dGlvbiggbmV3IE1hcCggW1xyXG4gICAgWyAnMCcsIDAgXSxcclxuICAgIFsgJzEnLCA0IF0sXHJcbiAgICBbICcyJywgOCBdXHJcbiAgXSApLCBuZXcgTWFwPE1OQUNpcmN1aXRFbGVtZW50LCBudW1iZXI+KCBbXHJcbiAgICBbIGJhdHRlcnkxLCAtNC4wIF0sXHJcbiAgICBbIGJhdHRlcnkyLCAtNC4wIF1cclxuICBdICkgKTtcclxuICBjb25zdCBzb2x1dGlvbiA9IGNpcmN1aXQuc29sdmUoKTtcclxuICBhc3NlcnQuZXF1YWwoIHNvbHV0aW9uLmFwcHJveEVxdWFscyggZGVzaXJlZFNvbHV0aW9uLCBhc3NlcnQgKSwgdHJ1ZSwgJ3NvbHV0aW9ucyBzaG91bGQgbWF0Y2gnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICd0ZXN0X3R3b19yZXNpc3RvcnNfaW5fc2VyaWVzX3Nob3VsZF9oYXZlX3Jlc2lzdGFuY2VfYWRkZWQnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGJhdHRlcnkgPSBuZXcgTU5BQmF0dGVyeSggJzAnLCAnMScsIDUuMCApO1xyXG4gIGNvbnN0IHJlc2lzdG9yMSA9IG5ldyBNTkFSZXNpc3RvciggJzEnLCAnMicsIDEwLjAgKTtcclxuICBjb25zdCByZXNpc3RvcjIgPSBuZXcgTU5BUmVzaXN0b3IoICcyJywgJzAnLCAxMC4wICk7XHJcbiAgY29uc3QgY2lyY3VpdCA9IG5ldyBNTkFDaXJjdWl0KCBbIGJhdHRlcnkgXSwgW1xyXG4gICAgcmVzaXN0b3IxLFxyXG4gICAgcmVzaXN0b3IyXHJcbiAgXSwgW10gKTtcclxuICBjb25zdCB2b2x0YWdlTWFwID0gbmV3IE1hcCggW1xyXG4gICAgWyAnMCcsIDAgXSxcclxuICAgIFsgJzEnLCAtNSBdLFxyXG4gICAgWyAnMicsIC0yLjUgXVxyXG4gIF0gKTtcclxuICBjb25zdCBkZXNpcmVkU29sdXRpb24gPSBuZXcgTU5BU29sdXRpb24oIHZvbHRhZ2VNYXAsIG5ldyBNYXA8TU5BQ2lyY3VpdEVsZW1lbnQsIG51bWJlcj4oIFtcclxuICAgIFsgYmF0dGVyeSwgNSAvIDIwLjAgXVxyXG4gIF0gKSApO1xyXG4gIGNvbnN0IHNvbHV0aW9uID0gY2lyY3VpdC5zb2x2ZSgpO1xyXG4gIGFzc2VydC5lcXVhbCggc29sdXRpb24uYXBwcm94RXF1YWxzKCBkZXNpcmVkU29sdXRpb24sIGFzc2VydCApLCB0cnVlLCAnc29sdXRpb25zIHNob3VsZCBtYXRjaCcgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ3Rlc3RfQV9yZXNpc3Rvcl93aXRoX29uZV9ub2RlX3VuY29ubmVjdGVkX3Nob3VsZG50X2NhdXNlX3Byb2JsZW1zJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBiYXR0ZXJ5ID0gbmV3IE1OQUJhdHRlcnkoICcwJywgJzEnLCA0LjAgKTtcclxuICBjb25zdCByZXNpc3RvcjEgPSBuZXcgTU5BUmVzaXN0b3IoICcxJywgJzAnLCA0LjAgKTtcclxuICBjb25zdCByZXNpc3RvcjIgPSBuZXcgTU5BUmVzaXN0b3IoICcwJywgJzInLCAxMDAuMCApO1xyXG4gIGNvbnN0IGNpcmN1aXQgPSBuZXcgTU5BQ2lyY3VpdChcclxuICAgIFsgYmF0dGVyeSBdLFxyXG4gICAgWyByZXNpc3RvcjEsIHJlc2lzdG9yMiBdLCBbXVxyXG4gICk7XHJcbiAgY29uc3Qgdm9sdGFnZU1hcCA9IG5ldyBNYXAoIFtcclxuICAgIFsgJzAnLCAwIF0sXHJcbiAgICBbICcxJywgLTQgXSxcclxuICAgIFsgJzInLCAwIF1cclxuICBdICk7XHJcbiAgY29uc3QgZGVzaXJlZFNvbHV0aW9uID0gbmV3IE1OQVNvbHV0aW9uKCB2b2x0YWdlTWFwLCBuZXcgTWFwPE1OQUNpcmN1aXRFbGVtZW50LCBudW1iZXI+KCBbXHJcbiAgICBbIGJhdHRlcnksIDEuMCBdXHJcbiAgXSApICk7XHJcbiAgY29uc3Qgc29sdXRpb24gPSBjaXJjdWl0LnNvbHZlKCk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBzb2x1dGlvbi5hcHByb3hFcXVhbHMoIGRlc2lyZWRTb2x1dGlvbiwgYXNzZXJ0ICksIHRydWUsICdzb2x1dGlvbnMgc2hvdWxkIG1hdGNoJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAndGVzdF9hbl91bmNvbm5lY3RlZF9yZXNpc3Rvcl9zaG91bGRudF9jYXVzZV9wcm9ibGVtcycsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgYmF0dGVyeSA9IG5ldyBNTkFCYXR0ZXJ5KCAnMCcsICcxJywgNC4wICk7XHJcbiAgY29uc3QgcmVzaXN0b3IxID0gbmV3IE1OQVJlc2lzdG9yKCAnMScsICcwJywgNC4wICk7XHJcbiAgY29uc3QgcmVzaXN0b3IyID0gbmV3IE1OQVJlc2lzdG9yKCAnMicsICczJywgMTAwLjAgKTtcclxuICBjb25zdCBjaXJjdWl0ID0gbmV3IE1OQUNpcmN1aXQoIFsgYmF0dGVyeSBdLCBbXHJcbiAgICByZXNpc3RvcjEsXHJcbiAgICByZXNpc3RvcjJcclxuICBdLCBbXSApO1xyXG4gIGNvbnN0IHZvbHRhZ2VNYXAgPSBuZXcgTWFwKCBbXHJcbiAgICBbICcwJywgMCBdLFxyXG4gICAgWyAnMScsIC00IF0sXHJcbiAgICBbICcyJywgMCBdLFxyXG4gICAgWyAnMycsIDAgXVxyXG4gIF0gKTtcclxuXHJcbiAgY29uc3QgZGVzaXJlZFNvbHV0aW9uID0gbmV3IE1OQVNvbHV0aW9uKCB2b2x0YWdlTWFwLCBuZXcgTWFwPE1OQUNpcmN1aXRFbGVtZW50LCBudW1iZXI+KCBbXHJcbiAgICBbIGJhdHRlcnksIDEuMCBdXHJcbiAgXSApICk7XHJcbiAgY29uc3Qgc29sdXRpb24gPSBjaXJjdWl0LnNvbHZlKCk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBzb2x1dGlvbi5hcHByb3hFcXVhbHMoIGRlc2lyZWRTb2x1dGlvbiwgYXNzZXJ0ICksIHRydWUsICdzb2x1dGlvbnMgc2hvdWxkIG1hdGNoJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAndGVzdF9zaG91bGRfaGFuZGxlX3Jlc2lzdG9yc193aXRoX25vX3Jlc2lzdGFuY2UnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGJhdHRlcnkgPSBuZXcgTU5BQmF0dGVyeSggJzAnLCAnMScsIDUgKTtcclxuICBjb25zdCByZXNpc3RvciA9IG5ldyBNTkFSZXNpc3RvciggJzInLCAnMCcsIDAgKTtcclxuICBjb25zdCByZXNpc3RvcjAgPSBuZXcgTU5BUmVzaXN0b3IoICcxJywgJzInLCAxMCApO1xyXG4gIGNvbnN0IGNpcmN1aXQgPSBuZXcgTU5BQ2lyY3VpdCggWyBiYXR0ZXJ5IF0sIFtcclxuICAgIHJlc2lzdG9yMCxcclxuICAgIHJlc2lzdG9yXHJcbiAgXSwgW10gKTtcclxuICBjb25zdCB2b2x0YWdlTWFwID0gbmV3IE1hcCggW1xyXG4gICAgWyAnMCcsIDAgXSxcclxuICAgIFsgJzEnLCAtNSBdLFxyXG4gICAgWyAnMicsIDAgXVxyXG4gIF0gKTtcclxuICBjb25zdCBkZXNpcmVkU29sdXRpb24gPSBuZXcgTU5BU29sdXRpb24oIHZvbHRhZ2VNYXAsIG5ldyBNYXA8TU5BQ2lyY3VpdEVsZW1lbnQsIG51bWJlcj4oIFtcclxuICAgIFsgYmF0dGVyeSwgNSAvIDEwIF0sXHJcbiAgICBbIHJlc2lzdG9yLCA1IC8gMTAgXVxyXG4gIF0gKSApO1xyXG4gIGNvbnN0IHNvbHV0aW9uID0gY2lyY3VpdC5zb2x2ZSgpO1xyXG4gIGFzc2VydC5lcXVhbCggc29sdXRpb24uYXBwcm94RXF1YWxzKCBkZXNpcmVkU29sdXRpb24sIGFzc2VydCApLCB0cnVlLCAnc29sdXRpb25zIHNob3VsZCBtYXRjaCcgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ3Rlc3RfcmVzaXN0b3JzX2luX3BhcmFsbGVsX3Nob3VsZF9oYXZlX2hhcm1vbmljX21lYW5fb2ZfcmVzaXN0YW5jZScsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgViA9IDkuMDtcclxuICBjb25zdCBSMSA9IDUuMDtcclxuICBjb25zdCBSMiA9IDUuMDtcclxuICBjb25zdCBSZXEgPSAxIC8gKCAxIC8gUjEgKyAxIC8gUjIgKTtcclxuICBjb25zdCBiYXR0ZXJ5ID0gbmV3IE1OQUJhdHRlcnkoICcwJywgJzEnLCBWICk7XHJcbiAgY29uc3QgcmVzaXN0b3IxID0gbmV3IE1OQVJlc2lzdG9yKCAnMScsICcwJywgUjEgKTtcclxuICBjb25zdCByZXNpc3RvcjIgPSBuZXcgTU5BUmVzaXN0b3IoICcxJywgJzAnLCBSMiApO1xyXG4gIGNvbnN0IGNpcmN1aXQgPSBuZXcgTU5BQ2lyY3VpdCggWyBiYXR0ZXJ5IF0sIFtcclxuICAgIHJlc2lzdG9yMSxcclxuICAgIHJlc2lzdG9yMlxyXG4gIF0sIFtdICk7XHJcbiAgY29uc3Qgdm9sdGFnZU1hcCA9IG5ldyBNYXAoIFtcclxuICAgIFsgJzAnLCAwIF0sXHJcbiAgICBbICcxJywgLVYgXVxyXG4gIF0gKTtcclxuXHJcbiAgY29uc3QgZGVzaXJlZFNvbHV0aW9uID0gbmV3IE1OQVNvbHV0aW9uKCB2b2x0YWdlTWFwLCBuZXcgTWFwPE1OQUNpcmN1aXRFbGVtZW50LCBudW1iZXI+KCBbXHJcbiAgICBbIGJhdHRlcnksIFYgLyBSZXEgXVxyXG4gIF0gKSApO1xyXG4gIGNvbnN0IHNvbHV0aW9uID0gY2lyY3VpdC5zb2x2ZSgpO1xyXG4gIGFzc2VydC5lcXVhbCggc29sdXRpb24uYXBwcm94RXF1YWxzKCBkZXNpcmVkU29sdXRpb24sIGFzc2VydCApLCB0cnVlLCAnc29sdXRpb25zIHNob3VsZCBtYXRjaCcgKTtcclxufSApO1xyXG5cclxuLy8gKCAoKSA9PiB7XHJcbi8vXHJcbi8vIC8vIGh0dHA6Ly96YWNnLmdpdGh1Yi5pby9ibG9nLzIwMTMvMDgvMDIvYmluYXJ5LWNvbWJpbmF0aW9ucy1pbi1qYXZhc2NyaXB0L1xyXG4vLyAgIGZ1bmN0aW9uIGJpbmFyeUNvbWJvcyggbjogbnVtYmVyICkge1xyXG4vLyAgICAgY29uc3QgcmVzdWx0ID0gW107XHJcbi8vICAgICBmb3IgKCBsZXQgeSA9IDA7IHkgPCBNYXRoLnBvdyggMiwgbiApOyB5KysgKSB7XHJcbi8vICAgICAgIGNvbnN0IGNvbWJvID0gW107XHJcbi8vICAgICAgIGZvciAoIGxldCB4ID0gMDsgeCA8IG47IHgrKyApIHtcclxuLy8gICAgICAgICAvL3NoaWZ0IGJpdCBhbmQgYW5kIGl0IHdpdGggMVxyXG4vLyAgICAgICAgIGlmICggKCB5ID4+IHggKSAmIDEgKSB7XHJcbi8vICAgICAgICAgICBjb21iby5wdXNoKCB0cnVlICk7XHJcbi8vICAgICAgICAgfVxyXG4vLyAgICAgICAgIGVsc2Uge1xyXG4vLyAgICAgICAgICAgY29tYm8ucHVzaCggZmFsc2UgKTtcclxuLy8gICAgICAgICB9XHJcbi8vICAgICAgIH1cclxuLy8gICAgICAgcmVzdWx0LnB1c2goIGNvbWJvICk7XHJcbi8vICAgICB9XHJcbi8vICAgICByZXR1cm4gcmVzdWx0O1xyXG4vLyAgIH1cclxuLy9cclxuLy8gLy9Vc2FnZVxyXG4vLyAgIGNvbnN0IGNvbWJvcyA9IGJpbmFyeUNvbWJvcyggNyApO1xyXG4vLyAgIGNvbnNvbGUubG9nKCAndGVzdGluZyAnICsgY29tYm9zLmxlbmd0aCArICcgY29tYm9zJyApO1xyXG4vL1xyXG4vLyAgIGZvciAoIGxldCB4ID0gMDsgeCA8IGNvbWJvcy5sZW5ndGg7IHgrKyApIHtcclxuLy8gICAgIC8vIGNvbnNvbGUubG9nKCBjb21ib3NbIHggXS5qb2luKCAnLCcgKSApO1xyXG4vL1xyXG4vLyAgICAgd2luZG93LnNpZ25zID0gY29tYm9zWyB4IF0ubWFwKCB0ID0+IHQgPyAxIDogLTEgKTtcclxuLy9cclxuLy8gICAgIGNvbnN0IHYxID0gbmV3IE1OQUJhdHRlcnkoICcxJywgJzAnLCAyNCApO1xyXG4vLyAgICAgY29uc3QgdjIgPSBuZXcgTU5BQmF0dGVyeSggJzMnLCAnMCcsIDE1ICk7XHJcbi8vICAgICBjb25zdCByMSA9IG5ldyBNTkFSZXNpc3RvciggJzEnLCAnMicsIDEwMDAwICk7XHJcbi8vICAgICBjb25zdCByMiA9IG5ldyBNTkFSZXNpc3RvciggJzInLCAnMycsIDgxMDAgKTtcclxuLy8gICAgIGNvbnN0IHIzID0gbmV3IE1OQVJlc2lzdG9yKCAnMicsICcwJywgNDcwMCApO1xyXG4vL1xyXG4vLyAgICAgY29uc3QgY2lyY3VpdCA9IG5ldyBNTkFDaXJjdWl0KCBbIHYxLCB2MiBdLCBbIHIxLCByMiwgcjMgXSwgW10gKTtcclxuLy8gICAgIGNvbnN0IHNvbHV0aW9uID0gY2lyY3VpdC5zb2x2ZSgpO1xyXG4vL1xyXG4vLyAgICAgLy8gY29uc29sZS5sb2coIHNvbHV0aW9uLmdldE5vZGVWb2x0YWdlKCAnMCcgKSApO1xyXG4vLyAgICAgLy8gY29uc29sZS5sb2coIHNvbHV0aW9uLmdldE5vZGVWb2x0YWdlKCAnMScgKSApO1xyXG4vLyAgICAgLy8gY29uc29sZS5sb2coIHNvbHV0aW9uLmdldE5vZGVWb2x0YWdlKCAnMicgKSApO1xyXG4vLyAgICAgLy8gY29uc29sZS5sb2coIHNvbHV0aW9uLmdldE5vZGVWb2x0YWdlKCAnMycgKSApO1xyXG4vLyAgICAgLy8gY29uc29sZS5sb2coIHNvbHV0aW9uLmdldFNvbHZlZEN1cnJlbnQoIHYxICkgKTtcclxuLy8gICAgIC8vIGNvbnNvbGUubG9nKCBzb2x1dGlvbi5nZXRTb2x2ZWRDdXJyZW50KCB2MiApICk7XHJcbi8vXHJcbi8vICAgICBsZXQgd2lucyA9IDA7XHJcbi8vICAgICBpZiAoIGFwcHJveEVxdWFsczIoIHNvbHV0aW9uLmdldE5vZGVWb2x0YWdlKCAnMCcgKSwgMCApICkgeyB3aW5zKys7IH1cclxuLy8gICAgIGlmICggYXBwcm94RXF1YWxzMiggc29sdXRpb24uZ2V0Tm9kZVZvbHRhZ2UoICcxJyApLCAyNCApICkgeyB3aW5zKys7IH1cclxuLy8gICAgIGlmICggYXBwcm94RXF1YWxzMiggc29sdXRpb24uZ2V0Tm9kZVZvbHRhZ2UoICcyJyApLCA5Ljc0NzAgKSApIHsgd2lucysrOyB9XHJcbi8vICAgICBpZiAoIGFwcHJveEVxdWFsczIoIHNvbHV0aW9uLmdldE5vZGVWb2x0YWdlKCAnMycgKSwgMTUuMCApICkgeyB3aW5zKys7IH1cclxuLy8gICAgIGlmICggYXBwcm94RXF1YWxzMiggc29sdXRpb24uZ2V0U29sdmVkQ3VycmVudCggdjEgKSwgLTEuNDI1RS0zICkgKSB7IHdpbnMrKzsgfVxyXG4vLyAgICAgaWYgKCBhcHByb3hFcXVhbHMyKCBzb2x1dGlvbi5nZXRTb2x2ZWRDdXJyZW50KCB2MiApLCAtNi40ODVFLTQgKSApIHsgd2lucysrOyB9XHJcbi8vXHJcbi8vXHJcbi8vICAgICBjb25zb2xlLmxvZyggJ3dpbnM6ICcgKyB3aW5zICk7XHJcbi8vICAgICBpZiAoIHdpbnMgPT09IDYgKSB7XHJcbi8vICAgICAgIGNvbnNvbGUubG9nKCB3aW5kb3cuc2lnbnMgKTtcclxuLy8gICAgIH1cclxuLy8gICB9XHJcbi8vXHJcbi8vICAgLy8gdjEgMSAwIGRjIDI0VlxyXG4vLyAgIC8vIHYyIDMgMCBkYyAxNVZcclxuLy8gICAvLyByMSAxIDIgMTAwMDAgT2htc1xyXG4vLyAgIC8vIHIyIDIgMyA4MTAwIE9obXNcclxuLy8gICAvLyByMyAyIDAgNDcwMCBPaG1zXHJcbi8vXHJcbi8vICAgLy8gbm9kZSB2b2x0YWdlczogKDEpIDI0LjAwMDAgKDIpIDkuNzQ3MCAoMykgMTUuMDAwMFxyXG4vLyAgIC8vIHZvbHRhZ2Ugc291cmNlIGN1cnJlbnRzOiAodjEpIC0xLjQyNUUtMDMgKHYyKSAtNi40ODVFLTA0XHJcbi8vXHJcbi8vIH0gKSgpO1xyXG5cclxuLy8gTmV0bGlzdCBleGFtcGxlIGF0IGh0dHBzOi8vd3d3LmFsbGFib3V0Y2lyY3VpdHMuY29tL3RleHRib29rL3JlZmVyZW5jZS9jaHB0LTcvZXhhbXBsZS1jaXJjdWl0cy1hbmQtbmV0bGlzdHMvXHJcblFVbml0LnRlc3QoICdOZXRsaXN0OiAyIGJhdHRlcmllcyAmIDMgcmVzaXN0b3JzJywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgY29uc3QgdjEgPSBuZXcgTU5BQmF0dGVyeSggJzEnLCAnMCcsIDI0ICk7XHJcbiAgY29uc3QgdjIgPSBuZXcgTU5BQmF0dGVyeSggJzMnLCAnMCcsIDE1ICk7XHJcbiAgY29uc3QgcjEgPSBuZXcgTU5BUmVzaXN0b3IoICcxJywgJzInLCAxMDAwMCApO1xyXG4gIGNvbnN0IHIyID0gbmV3IE1OQVJlc2lzdG9yKCAnMicsICczJywgODEwMCApO1xyXG4gIGNvbnN0IHIzID0gbmV3IE1OQVJlc2lzdG9yKCAnMicsICcwJywgNDcwMCApO1xyXG5cclxuICBjb25zdCBjaXJjdWl0ID0gbmV3IE1OQUNpcmN1aXQoIFsgdjEsIHYyIF0sIFsgcjEsIHIyLCByMyBdLCBbXSApO1xyXG5cclxuICBjb25zdCBkZXNpcmVkU29sdXRpb24gPSBuZXcgTU5BU29sdXRpb24oIG5ldyBNYXAoIFtcclxuICAgIFsgJzAnLCAwIF0sXHJcbiAgICBbICcxJywgMjQuMCBdLFxyXG4gICAgWyAnMicsIDkuNzQ3MCBdLFxyXG4gICAgWyAnMycsIDE1LjAgXVxyXG4gIF0gKSwgbmV3IE1hcDxNTkFDaXJjdWl0RWxlbWVudCwgbnVtYmVyPiggW1xyXG4gICAgWyB2MSwgLTEuNDI1RS0zIF0sXHJcbiAgICBbIHYyLCAtNi40ODVFLTQgXVxyXG4gIF0gKSApO1xyXG4gIGNvbnN0IHNvbHV0aW9uID0gY2lyY3VpdC5zb2x2ZSgpO1xyXG5cclxuICBhc3NlcnQuZXF1YWwoIHNvbHV0aW9uLmFwcHJveEVxdWFscyggZGVzaXJlZFNvbHV0aW9uLCBhc3NlcnQgKSwgdHJ1ZSwgJ3NvbHV0aW9ucyBzaG91bGQgbWF0Y2gnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdOZXRsaXN0OiAxIGJhdHRlcnkgYW5kIDEgcmVzaXN0b3InLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IHYxID0gbmV3IE1OQUJhdHRlcnkoICdhJywgJzAnLCA5ICk7XHJcbiAgY29uc3QgcjEgPSBuZXcgTU5BUmVzaXN0b3IoICdhJywgJzAnLCA5ICk7XHJcbiAgY29uc3QgY2lyY3VpdCA9IG5ldyBNTkFDaXJjdWl0KCBbIHYxIF0sIFsgcjEgXSwgW10gKTtcclxuICBjb25zdCBkZXNpcmVkU29sdXRpb24gPSBuZXcgTU5BU29sdXRpb24oIG5ldyBNYXAoIFsgWyAnYScsIDkgXSwgWyAnMCcsIDAgXSBdICksIG5ldyBNYXAoIFsgWyB2MSwgLTEuMCBdIF0gKSApO1xyXG4gIGNvbnN0IHNvbHV0aW9uID0gY2lyY3VpdC5zb2x2ZSgpO1xyXG4gIGFzc2VydC5lcXVhbCggc29sdXRpb24uYXBwcm94RXF1YWxzKCBkZXNpcmVkU29sdXRpb24sIGFzc2VydCApLCB0cnVlLCAnc29sdXRpb25zIHNob3VsZCBtYXRjaCcgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ05ldGxpc3Q6IDEgYmF0dGVyeSBhbmQgMSByZXNpc3RvcjogcGFydCAyJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCB2MSA9IG5ldyBNTkFCYXR0ZXJ5KCAnYScsICcwJywgMTAgKTtcclxuICBjb25zdCByMSA9IG5ldyBNTkFSZXNpc3RvciggJ2EnLCAnMCcsIDUgKTtcclxuICBjb25zdCBjaXJjdWl0ID0gbmV3IE1OQUNpcmN1aXQoIFsgdjEgXSwgWyByMSBdLCBbXSApO1xyXG4gIGNvbnN0IGRlc2lyZWRTb2x1dGlvbiA9IG5ldyBNTkFTb2x1dGlvbiggbmV3IE1hcCggWyBbICdhJywgMTAgXSwgWyAnMCcsIDAgXSBdICksIG5ldyBNYXAoIFsgWyB2MSwgLTIuMCBdIF0gKSApO1xyXG4gIGNvbnN0IHNvbHV0aW9uID0gY2lyY3VpdC5zb2x2ZSgpO1xyXG4gIGFzc2VydC5lcXVhbCggc29sdXRpb24uYXBwcm94RXF1YWxzKCBkZXNpcmVkU29sdXRpb24sIGFzc2VydCApLCB0cnVlLCAnc29sdXRpb25zIHNob3VsZCBtYXRjaCcgKTtcclxufSApO1xyXG5cclxuLy8gQ29tcGFyZSB0byB0aGUgZXhhbXBsZSBhdCBodHRwczovL3d3dy5raGFuYWNhZGVteS5vcmcvc2NpZW5jZS9lbGVjdHJpY2FsLWVuZ2luZWVyaW5nL2VlLWNpcmN1aXQtYW5hbHlzaXMtdG9waWMvZWUtZGMtY2lyY3VpdC1hbmFseXNpcy9hL2VlLW5vZGUtdm9sdGFnZS1tZXRob2RcclxuUVVuaXQudGVzdCggJ05ldGxpc3Q6IGtoYW4gZWUnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGJhdHRlcnkgPSBuZXcgTU5BQmF0dGVyeSggJ2EnLCAnYycsIDE0MCApO1xyXG4gIGNvbnN0IHJlc2lzdG9yMSA9IG5ldyBNTkFSZXNpc3RvciggJ2EnLCAnYicsIDIwICk7XHJcbiAgY29uc3QgcmVzaXN0b3IyID0gbmV3IE1OQVJlc2lzdG9yKCAnYicsICdjJywgNiApO1xyXG4gIGNvbnN0IHJlc2lzdG9yMyA9IG5ldyBNTkFSZXNpc3RvciggJ2InLCAnYycsIDUgKTtcclxuICBjb25zdCBjdXJyZW50ID0gbmV3IE1OQUN1cnJlbnQoICdjJywgJ2InLCAxOCApO1xyXG4gIGNvbnN0IGNpcmN1aXQgPSBuZXcgTU5BQ2lyY3VpdCggWyBiYXR0ZXJ5IF0sIFsgcmVzaXN0b3IxLCByZXNpc3RvcjIsIHJlc2lzdG9yMyBdLCBbIGN1cnJlbnQgXSApO1xyXG5cclxuICBjb25zdCBvZmZzZXQgPSAtMTQwO1xyXG4gIGNvbnN0IHZvbHRhZ2VNYXAgPSBuZXcgTWFwKCBbXHJcbiAgICBbICdhJywgMTQwICsgb2Zmc2V0IF0sXHJcbiAgICBbICdiJywgNjAgKyBvZmZzZXQgXSxcclxuICAgIFsgJ2MnLCAwICsgb2Zmc2V0IF1cclxuICBdICk7XHJcblxyXG4gIGNvbnN0IGRlc2lyZWRTb2x1dGlvbiA9IG5ldyBNTkFTb2x1dGlvbiggdm9sdGFnZU1hcCwgbmV3IE1hcCggW1xyXG4gICAgWyBiYXR0ZXJ5LCAtNC4wIF1cclxuICBdICkgKTtcclxuICBjb25zdCBzb2x1dGlvbiA9IGNpcmN1aXQuc29sdmUoKTtcclxuICBhc3NlcnQuZXF1YWwoIHNvbHV0aW9uLmFwcHJveEVxdWFscyggZGVzaXJlZFNvbHV0aW9uLCBhc3NlcnQgKSwgdHJ1ZSwgJ3NvbHV0aW9ucyBzaG91bGQgbWF0Y2gnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICduZXRsaXN0OiBpcicsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgY3VycmVudFNvdXJjZSA9IG5ldyBNTkFDdXJyZW50KCAnMCcsICdhJywgMTAgKTtcclxuICBjb25zdCByZXNpc3RvciA9IG5ldyBNTkFSZXNpc3RvciggJ2EnLCAnMCcsIDQgKTtcclxuICBjb25zdCBjaXJjdWl0ID0gbmV3IE1OQUNpcmN1aXQoIFtdLCBbIHJlc2lzdG9yIF0sIFsgY3VycmVudFNvdXJjZSBdICk7XHJcbiAgY29uc3Qgdm9sdGFnZU1hcCA9IG5ldyBNYXAoIFtcclxuICAgIFsgJzAnLCAwIF0sXHJcbiAgICBbICdhJywgNDAuMCBdXHJcbiAgXSApO1xyXG4gIGNvbnN0IGRlc2lyZWRTb2x1dGlvbiA9IG5ldyBNTkFTb2x1dGlvbiggdm9sdGFnZU1hcCwgbmV3IE1hcDxNTkFDaXJjdWl0RWxlbWVudCwgbnVtYmVyPigpICk7XHJcbiAgY29uc3Qgc29sdXRpb24gPSBjaXJjdWl0LnNvbHZlKCk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBzb2x1dGlvbi5hcHByb3hFcXVhbHMoIGRlc2lyZWRTb2x1dGlvbiwgYXNzZXJ0ICksIHRydWUsICdzb2x1dGlvbnMgc2hvdWxkIG1hdGNoJyApO1xyXG59ICk7XHJcblxyXG4vLyBjb25zdCBmaW5kT3BlcmF0aW5nUG9pbnRGb3JMUkNpcmN1aXQgPSAoIFY6IG51bWJlciwgUjogbnVtYmVyLCBMOiBudW1iZXIgKSA9PiB7XHJcbi8vICAgbGV0IGlkID0gMDtcclxuLy8gICBjb25zdCByZXNpc3RvciA9IG5ldyBNTkFSZXNpc3RvciggJzEnLCAnMicsIFIgKTtcclxuLy8gICBjb25zdCBiYXR0ZXJ5ID0gbmV3IE1OQUJhdHRlcnkoICcwJywgJzEnLCBWICk7XHJcbi8vICAgY29uc3QgbXlSZXNpc3RvciA9IG5ldyBNTkFSZXNpc3RvciggJzInLCAnMCcsIDEgKTtcclxuLy8gICBjb25zdCBjaXJjdWl0ID0gbmV3IE1OQUNpcmN1aXQoIFsgYmF0dGVyeSBdLCBbIHJlc2lzdG9yLCBteVJlc2lzdG9yIF0sIFtdICk7XHJcbi8vICAgLy8gaXRlcmF0ZUluZHVjdG9yKCBjaXJjdWl0LCByZXNpc3RvciwgViwgUiwgTCwgYXNzZXJ0ICk7XHJcbi8vICAgY29uc3QgeCA9IGNpcmN1aXQuc29sdmUoKTtcclxuLy8gfTtcclxuLy9cclxuLy8gZmluZE9wZXJhdGluZ1BvaW50Rm9yTFJDaXJjdWl0KCA1LCAxMCwgMSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0saUJBQWlCO0FBQ3hDLE9BQU9DLFdBQVcsTUFBTSxrQkFBa0I7QUFDMUMsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjtBQUMxQyxPQUFPQyxVQUFVLE1BQU0saUJBQWlCO0FBQ3hDLE9BQU9DLFVBQVUsTUFBTSxpQkFBaUI7QUFHeENDLEtBQUssQ0FBQ0MsTUFBTSxDQUFFLGlCQUFrQixDQUFDO0FBRWpDLE1BQU1DLFlBQVksR0FBR0EsQ0FBRUMsQ0FBUyxFQUFFQyxDQUFTLEtBQU1DLElBQUksQ0FBQ0MsR0FBRyxDQUFFSCxDQUFDLEdBQUdDLENBQUUsQ0FBQyxHQUFHLElBQUk7QUFFekVKLEtBQUssQ0FBQ08sSUFBSSxDQUFFLHNEQUFzRCxFQUFFQyxNQUFNLElBQUk7RUFDNUUsTUFBTUMsT0FBTyxHQUFHLElBQUlYLFVBQVUsQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUksQ0FBQztFQUMvQyxNQUFNWSxRQUFRLEdBQUcsSUFBSWIsV0FBVyxDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBSSxDQUFDO0VBQ2pELE1BQU1jLFFBQVEsR0FBRyxJQUFJaEIsVUFBVSxDQUFFLENBQUVjLE9BQU8sQ0FBRSxFQUFFLENBQUVDLFFBQVEsQ0FBRSxFQUFFLEVBQUcsQ0FBQyxDQUFDRSxLQUFLLENBQUMsQ0FBQztFQUN4RSxNQUFNQyxlQUFlLEdBQUcsSUFBSWpCLFdBQVcsQ0FBRSxJQUFJa0IsR0FBRyxDQUFFLENBQ2hELENBQUUsR0FBRyxFQUFFLENBQUMsQ0FBRSxFQUNWLENBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFFLENBQ1gsQ0FBQyxFQUFFLElBQUlBLEdBQUcsQ0FBNkIsQ0FDdkMsQ0FBRUwsT0FBTyxFQUFFLEdB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