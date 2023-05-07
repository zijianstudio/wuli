// Copyright 2019-2022, University of Colorado Boulder

/**
 * MNACircuit tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

// modules
import LTACircuit from './LTACircuit.js';
import LTACapacitor from './LTACapacitor.js';
import LTAInductor from './LTAInductor.js';
import LTAResistiveBattery from './LTAResistiveBattery.js';
import MNAResistor from './mna/MNAResistor.js';
const ITERATIONS = 250;
QUnit.module('LTACircuit');
const dt = 1 / 60;
let id = 0;
let worstError = 0;

// window.string = `{v}  {r}  {c}  {t}  {desiredVoltageAtTPlusDT}  {voltage}  {error}
// `;
// Check the values coming from an RC circuit (may be an equivalent capacitance)
const iterateCapacitor = (circuit, resistor, v, r, c, assert) => {
  for (let i = 0; i < ITERATIONS; i++) {
    const t = i * dt;
    const companionSolution = circuit.solveItWithSubdivisions(dt);
    const actualVoltage = companionSolution.getVoltage(resistor.nodeId0, resistor.nodeId1);
    const expectedVoltage = v * Math.exp(-(t + dt) / r / c);
    const error = Math.abs(actualVoltage - expectedVoltage);

    // console.log( expectedVoltage, actualVoltage );
    // console.log( error );
    if (error > worstError) {
      worstError = error;
      // console.log( 'new worst error: ' + worstError );
    }

    // window.string = window.string + `${v}  ${r}  ${c}  ${t}  ${desiredVoltageAtTPlusDT}  ${voltage}  ${error}
    // `;

    const fractionalError = error / expectedVoltage;
    // console.log( fractionalError, error );
    if (error > 1E-8) {
      assert.ok(fractionalError <= 0.02); // sample run indicates largest error is 1.5328E-7
    }

    circuit = circuit.updateWithSubdivisions(dt);
  }
};
const testVRCCircuit = (v, r, c, assert) => {
  const resistor = new MNAResistor('1', '2', r);
  const battery = new LTAResistiveBattery(id++, '0', '1', v, 0);
  const capacitor = new LTACapacitor(id++, '2', '0', 0.0, v / r, c);
  const circuit = new LTACircuit([resistor], [battery], [capacitor], []);
  iterateCapacitor(circuit, resistor, v, r, c, assert);
};
const testVRCCircuitSeriesCapacitors = (v, r, c1, c2, assert) => {
  const ceq = 1 / (1 / c1 + 1 / c2);
  const resistor = new MNAResistor('1', '2', r);
  const battery = new LTAResistiveBattery(id++, '0', '1', v, 0);
  const capacitor1 = new LTACapacitor(id++, '2', '3', 0.0, v / r, c1);
  const capacitor2 = new LTACapacitor(id++, '3', '0', 0.0, v / r, c2);
  const circuit = new LTACircuit([resistor], [battery], [capacitor1, capacitor2], []);
  iterateCapacitor(circuit, resistor, v, r, ceq, assert);
};
const testVRCCircuitParallelCapacitors = (v, r, c1, c2, assert) => {
  const ceq = c1 + c2;
  const resistor = new MNAResistor('1', '2', r);
  const battery = new LTAResistiveBattery(id++, '0', '1', v, 0);
  const capacitor1 = new LTACapacitor(id++, '2', '0', 0.0, v / r, c1);
  const capacitor2 = new LTACapacitor(id++, '2', '0', 0.0, v / r, c2);
  const circuit = new LTACircuit([resistor], [battery], [capacitor1, capacitor2], []);
  iterateCapacitor(circuit, resistor, v, r, ceq, assert);
};

// This is for comparison with TestTheveninCapacitorRC
// QUnit.test( 'testVRC991Eminus2', assert => {
//
//   for ( let v = 0; v < 120; v += 10 ) { // esl
//     for ( let c = 0.05; c <= 0.20; c += 0.05 ) {
//       testVRCCircuit( v, 10, c, assert );
//     }
//   }
// } );

QUnit.test('test RC Circuit should have voltage exponentially decay with T RC for v 5 r 10 c 1E minus2', assert => {
  testVRCCircuit(5.0, 10.0, 1.0E-2, assert);
});
QUnit.test('test RC Circuit should have voltage exponentially decay with T RC for v 10 r 10 c 1E minus2', assert => {
  testVRCCircuit(10.0, 10.0, 1.0E-2, assert);
});
QUnit.test('test RC Circuit should have voltage exponentially decay with T RC for v 3  r 7  c 1Eminus1', assert => {
  testVRCCircuit(3, 7, 1E-1, assert);
});
QUnit.test('test RC Circuit should have voltage exponentially decay with T RC for v 3  r 7  c 100', assert => {
  testVRCCircuit(3, 7, 100, assert);
});
QUnit.test('test RC Circuit with series capacitors', assert => {
  testVRCCircuitSeriesCapacitors(3, 7, 10, 10, assert);
  for (let i = 0; i < 10; i++) {
    testVRCCircuitSeriesCapacitors(3, 7, Math.random() * 10, Math.random() * 10, assert); // eslint-disable-line bad-sim-text, bad-sim-text
  }
});

QUnit.test('test RC Circuit with parallel capacitors', assert => {
  testVRCCircuitParallelCapacitors(3, 7, 10, 10, assert);
  for (let i = 0; i < 10; i++) {
    testVRCCircuitParallelCapacitors(3, 7, Math.random() * 10, Math.random() * 10, assert); // eslint-disable-line bad-sim-text, bad-sim-text
  }
});

const iterateInductor = (circuit, resistor, V, R, L, assert) => {
  for (let i = 0; i < ITERATIONS; i++) {
    const t = i * dt;
    const solution = circuit.solveItWithSubdivisions(dt);
    const actualCurrent = solution.getCurrent(resistor);
    const expectedCurrent = -V / R * (1 - Math.exp(-(t + dt) * R / L)); //positive, by definition of MNA.Battery

    // console.log( expectedCurrent, actualCurrent );
    const error = Math.abs(actualCurrent - expectedCurrent);
    const fractionalError = error / expectedCurrent;
    if (error > 1E-8) {
      assert.ok(fractionalError <= 0.02);
    }
    // assert.ok( error < errorThreshold );
    // assert.ok( true );
    circuit = circuit.updateWithSubdivisions(dt);
  }
};
const testVRLCircuit = (V, R, L, assert) => {
  const resistor = new MNAResistor('1', '2', R);
  const battery = new LTAResistiveBattery(id++, '0', '1', V, 0);
  const inductor = new LTAInductor(id++, '2', '0', V, 0.0, L);
  const circuit = new LTACircuit([resistor], [battery], [], [inductor]);
  iterateInductor(circuit, resistor, V, R, L, assert);
};
const testVRLCircuitSeries = (V, R, L1, L2, assert) => {
  const Leq = L1 + L2;
  const resistor = new MNAResistor('1', '2', R);
  const battery = new LTAResistiveBattery(id++, '0', '1', V, 0);
  const inductor1 = new LTAInductor(id++, '2', '3', 0, 0.0, L1);
  const inductor2 = new LTAInductor(id++, '3', '0', 0, 0.0, L2);
  const circuit = new LTACircuit([resistor], [battery], [], [inductor1, inductor2]);
  iterateInductor(circuit, resistor, V, R, Leq, assert);
};
const testVRLCircuitParallel = (V, R, L1, L2, assert) => {
  const Leq = 1 / (1 / L1 + 1 / L2);
  const resistor = new MNAResistor('1', '2', R);
  const battery = new LTAResistiveBattery(id++, '0', '1', V, 0);
  const inductor1 = new LTAInductor(id++, '2', '0', 0, 0.0, L1);
  const inductor2 = new LTAInductor(id++, '2', '0', 0, 0.0, L2);
  const circuit = new LTACircuit([resistor], [battery], [], [inductor1, inductor2]);
  iterateInductor(circuit, resistor, V, R, Leq, assert);
};
QUnit.test('test_RL_Circuit_should_have_correct_behavior', assert => {
  testVRLCircuit(5, 10, 1, assert);
  testVRLCircuit(3, 11, 2.5, assert);
  testVRLCircuit(7, 13, 1E4, assert);
  testVRLCircuit(7, 13, 1E-1, assert);
});
QUnit.test('Series inductors', assert => {
  testVRLCircuitSeries(5, 10, 1, 1, assert);
  for (let i = 0; i < 10; i++) {
    testVRLCircuitSeries(10, 10, 5 * Math.random() + 0.1, 5 * Math.random() + 0.1, assert); // eslint-disable-line bad-sim-text
  }
});

QUnit.test('Parallel inductors', assert => {
  testVRLCircuitParallel(5, 10, 1, 1, assert);
  for (let i = 0; i < 10; i++) {
    testVRLCircuitParallel(10, 10, 5 * Math.random() + 1, 5 * Math.random() + 1, assert); // eslint-disable-line bad-sim-text
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMVEFDaXJjdWl0IiwiTFRBQ2FwYWNpdG9yIiwiTFRBSW5kdWN0b3IiLCJMVEFSZXNpc3RpdmVCYXR0ZXJ5IiwiTU5BUmVzaXN0b3IiLCJJVEVSQVRJT05TIiwiUVVuaXQiLCJtb2R1bGUiLCJkdCIsImlkIiwid29yc3RFcnJvciIsIml0ZXJhdGVDYXBhY2l0b3IiLCJjaXJjdWl0IiwicmVzaXN0b3IiLCJ2IiwiciIsImMiLCJhc3NlcnQiLCJpIiwidCIsImNvbXBhbmlvblNvbHV0aW9uIiwic29sdmVJdFdpdGhTdWJkaXZpc2lvbnMiLCJhY3R1YWxWb2x0YWdlIiwiZ2V0Vm9sdGFnZSIsIm5vZGVJZDAiLCJub2RlSWQxIiwiZXhwZWN0ZWRWb2x0YWdlIiwiTWF0aCIsImV4cCIsImVycm9yIiwiYWJzIiwiZnJhY3Rpb25hbEVycm9yIiwib2siLCJ1cGRhdGVXaXRoU3ViZGl2aXNpb25zIiwidGVzdFZSQ0NpcmN1aXQiLCJiYXR0ZXJ5IiwiY2FwYWNpdG9yIiwidGVzdFZSQ0NpcmN1aXRTZXJpZXNDYXBhY2l0b3JzIiwiYzEiLCJjMiIsImNlcSIsImNhcGFjaXRvcjEiLCJjYXBhY2l0b3IyIiwidGVzdFZSQ0NpcmN1aXRQYXJhbGxlbENhcGFjaXRvcnMiLCJ0ZXN0IiwicmFuZG9tIiwiaXRlcmF0ZUluZHVjdG9yIiwiViIsIlIiLCJMIiwic29sdXRpb24iLCJhY3R1YWxDdXJyZW50IiwiZ2V0Q3VycmVudCIsImV4cGVjdGVkQ3VycmVudCIsInRlc3RWUkxDaXJjdWl0IiwiaW5kdWN0b3IiLCJ0ZXN0VlJMQ2lyY3VpdFNlcmllcyIsIkwxIiwiTDIiLCJMZXEiLCJpbmR1Y3RvcjEiLCJpbmR1Y3RvcjIiLCJ0ZXN0VlJMQ2lyY3VpdFBhcmFsbGVsIl0sInNvdXJjZXMiOlsiTFRBQ2lyY3VpdFRlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1OQUNpcmN1aXQgdGVzdHNcclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG4vLyBtb2R1bGVzXHJcbmltcG9ydCBMVEFDaXJjdWl0IGZyb20gJy4vTFRBQ2lyY3VpdC5qcyc7XHJcbmltcG9ydCBMVEFDYXBhY2l0b3IgZnJvbSAnLi9MVEFDYXBhY2l0b3IuanMnO1xyXG5pbXBvcnQgTFRBSW5kdWN0b3IgZnJvbSAnLi9MVEFJbmR1Y3Rvci5qcyc7XHJcbmltcG9ydCBMVEFSZXNpc3RpdmVCYXR0ZXJ5IGZyb20gJy4vTFRBUmVzaXN0aXZlQmF0dGVyeS5qcyc7XHJcbmltcG9ydCBNTkFSZXNpc3RvciBmcm9tICcuL21uYS9NTkFSZXNpc3Rvci5qcyc7XHJcblxyXG5jb25zdCBJVEVSQVRJT05TID0gMjUwO1xyXG5RVW5pdC5tb2R1bGUoICdMVEFDaXJjdWl0JyApO1xyXG5jb25zdCBkdCA9IDEgLyA2MDtcclxuXHJcbmxldCBpZCA9IDA7XHJcblxyXG5sZXQgd29yc3RFcnJvciA9IDA7XHJcblxyXG4vLyB3aW5kb3cuc3RyaW5nID0gYHt2fSAge3J9ICB7Y30gIHt0fSAge2Rlc2lyZWRWb2x0YWdlQXRUUGx1c0RUfSAge3ZvbHRhZ2V9ICB7ZXJyb3J9XHJcbi8vIGA7XHJcbi8vIENoZWNrIHRoZSB2YWx1ZXMgY29taW5nIGZyb20gYW4gUkMgY2lyY3VpdCAobWF5IGJlIGFuIGVxdWl2YWxlbnQgY2FwYWNpdGFuY2UpXHJcbmNvbnN0IGl0ZXJhdGVDYXBhY2l0b3IgPSAoIGNpcmN1aXQ6IExUQUNpcmN1aXQsIHJlc2lzdG9yOiBNTkFSZXNpc3RvciwgdjogbnVtYmVyLCByOiBudW1iZXIsIGM6IG51bWJlciwgYXNzZXJ0OiBBc3NlcnQgKSA9PiB7XHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgSVRFUkFUSU9OUzsgaSsrICkge1xyXG4gICAgY29uc3QgdCA9IGkgKiBkdDtcclxuXHJcbiAgICBjb25zdCBjb21wYW5pb25Tb2x1dGlvbiA9IGNpcmN1aXQuc29sdmVJdFdpdGhTdWJkaXZpc2lvbnMoIGR0ICk7XHJcbiAgICBjb25zdCBhY3R1YWxWb2x0YWdlID0gY29tcGFuaW9uU29sdXRpb24hLmdldFZvbHRhZ2UoIHJlc2lzdG9yLm5vZGVJZDAsIHJlc2lzdG9yLm5vZGVJZDEgKTtcclxuICAgIGNvbnN0IGV4cGVjdGVkVm9sdGFnZSA9IHYgKiBNYXRoLmV4cCggLSggdCArIGR0ICkgLyByIC8gYyApO1xyXG4gICAgY29uc3QgZXJyb3IgPSBNYXRoLmFicyggYWN0dWFsVm9sdGFnZSAtIGV4cGVjdGVkVm9sdGFnZSApO1xyXG5cclxuICAgIC8vIGNvbnNvbGUubG9nKCBleHBlY3RlZFZvbHRhZ2UsIGFjdHVhbFZvbHRhZ2UgKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKCBlcnJvciApO1xyXG4gICAgaWYgKCBlcnJvciA+IHdvcnN0RXJyb3IgKSB7XHJcbiAgICAgIHdvcnN0RXJyb3IgPSBlcnJvcjtcclxuICAgICAgLy8gY29uc29sZS5sb2coICduZXcgd29yc3QgZXJyb3I6ICcgKyB3b3JzdEVycm9yICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gd2luZG93LnN0cmluZyA9IHdpbmRvdy5zdHJpbmcgKyBgJHt2fSAgJHtyfSAgJHtjfSAgJHt0fSAgJHtkZXNpcmVkVm9sdGFnZUF0VFBsdXNEVH0gICR7dm9sdGFnZX0gICR7ZXJyb3J9XHJcbi8vIGA7XHJcblxyXG4gICAgY29uc3QgZnJhY3Rpb25hbEVycm9yID0gZXJyb3IgLyBleHBlY3RlZFZvbHRhZ2U7XHJcbiAgICAvLyBjb25zb2xlLmxvZyggZnJhY3Rpb25hbEVycm9yLCBlcnJvciApO1xyXG4gICAgaWYgKCBlcnJvciA+IDFFLTggKSB7XHJcbiAgICAgIGFzc2VydC5vayggZnJhY3Rpb25hbEVycm9yIDw9IDAuMDIgKTsgLy8gc2FtcGxlIHJ1biBpbmRpY2F0ZXMgbGFyZ2VzdCBlcnJvciBpcyAxLjUzMjhFLTdcclxuICAgIH1cclxuXHJcbiAgICBjaXJjdWl0ID0gY2lyY3VpdC51cGRhdGVXaXRoU3ViZGl2aXNpb25zKCBkdCApO1xyXG4gIH1cclxufTtcclxuXHJcbmNvbnN0IHRlc3RWUkNDaXJjdWl0ID0gKCB2OiBudW1iZXIsIHI6IG51bWJlciwgYzogbnVtYmVyLCBhc3NlcnQ6IEFzc2VydCApID0+IHtcclxuICBjb25zdCByZXNpc3RvciA9IG5ldyBNTkFSZXNpc3RvciggJzEnLCAnMicsIHIgKTtcclxuICBjb25zdCBiYXR0ZXJ5ID0gbmV3IExUQVJlc2lzdGl2ZUJhdHRlcnkoIGlkKyssICcwJywgJzEnLCB2LCAwICk7XHJcbiAgY29uc3QgY2FwYWNpdG9yID0gbmV3IExUQUNhcGFjaXRvciggaWQrKywgJzInLCAnMCcsIDAuMCwgdiAvIHIsIGMgKTtcclxuICBjb25zdCBjaXJjdWl0ID0gbmV3IExUQUNpcmN1aXQoIFsgcmVzaXN0b3IgXSwgWyBiYXR0ZXJ5IF0sIFsgY2FwYWNpdG9yIF0sIFtdICk7XHJcbiAgaXRlcmF0ZUNhcGFjaXRvciggY2lyY3VpdCwgcmVzaXN0b3IsIHYsIHIsIGMsIGFzc2VydCApO1xyXG59O1xyXG5cclxuY29uc3QgdGVzdFZSQ0NpcmN1aXRTZXJpZXNDYXBhY2l0b3JzID0gKCB2OiBudW1iZXIsIHI6IG51bWJlciwgYzE6IG51bWJlciwgYzI6IG51bWJlciwgYXNzZXJ0OiBBc3NlcnQgKSA9PiB7XHJcblxyXG4gIGNvbnN0IGNlcSA9IDEgLyAoIDEgLyBjMSArIDEgLyBjMiApO1xyXG4gIGNvbnN0IHJlc2lzdG9yID0gbmV3IE1OQVJlc2lzdG9yKCAnMScsICcyJywgciApO1xyXG4gIGNvbnN0IGJhdHRlcnkgPSBuZXcgTFRBUmVzaXN0aXZlQmF0dGVyeSggaWQrKywgJzAnLCAnMScsIHYsIDAgKTtcclxuICBjb25zdCBjYXBhY2l0b3IxID0gbmV3IExUQUNhcGFjaXRvciggaWQrKywgJzInLCAnMycsIDAuMCwgdiAvIHIsIGMxICk7XHJcbiAgY29uc3QgY2FwYWNpdG9yMiA9IG5ldyBMVEFDYXBhY2l0b3IoIGlkKyssICczJywgJzAnLCAwLjAsIHYgLyByLCBjMiApO1xyXG5cclxuICBjb25zdCBjaXJjdWl0ID0gbmV3IExUQUNpcmN1aXQoIFsgcmVzaXN0b3IgXSwgWyBiYXR0ZXJ5IF0sIFsgY2FwYWNpdG9yMSwgY2FwYWNpdG9yMiBdLCBbXSApO1xyXG5cclxuICBpdGVyYXRlQ2FwYWNpdG9yKCBjaXJjdWl0LCByZXNpc3RvciwgdiwgciwgY2VxLCBhc3NlcnQgKTtcclxufTtcclxuXHJcbmNvbnN0IHRlc3RWUkNDaXJjdWl0UGFyYWxsZWxDYXBhY2l0b3JzID0gKCB2OiBudW1iZXIsIHI6IG51bWJlciwgYzE6IG51bWJlciwgYzI6IG51bWJlciwgYXNzZXJ0OiBBc3NlcnQgKSA9PiB7XHJcblxyXG4gIGNvbnN0IGNlcSA9IGMxICsgYzI7XHJcbiAgY29uc3QgcmVzaXN0b3IgPSBuZXcgTU5BUmVzaXN0b3IoICcxJywgJzInLCByICk7XHJcbiAgY29uc3QgYmF0dGVyeSA9IG5ldyBMVEFSZXNpc3RpdmVCYXR0ZXJ5KCBpZCsrLCAnMCcsICcxJywgdiwgMCApO1xyXG4gIGNvbnN0IGNhcGFjaXRvcjEgPSBuZXcgTFRBQ2FwYWNpdG9yKCBpZCsrLCAnMicsICcwJywgMC4wLCB2IC8gciwgYzEgKTtcclxuICBjb25zdCBjYXBhY2l0b3IyID0gbmV3IExUQUNhcGFjaXRvciggaWQrKywgJzInLCAnMCcsIDAuMCwgdiAvIHIsIGMyICk7XHJcblxyXG4gIGNvbnN0IGNpcmN1aXQgPSBuZXcgTFRBQ2lyY3VpdCggWyByZXNpc3RvciBdLCBbIGJhdHRlcnkgXSwgWyBjYXBhY2l0b3IxLCBjYXBhY2l0b3IyIF0sIFtdICk7XHJcbiAgaXRlcmF0ZUNhcGFjaXRvciggY2lyY3VpdCwgcmVzaXN0b3IsIHYsIHIsIGNlcSwgYXNzZXJ0ICk7XHJcbn07XHJcblxyXG4vLyBUaGlzIGlzIGZvciBjb21wYXJpc29uIHdpdGggVGVzdFRoZXZlbmluQ2FwYWNpdG9yUkNcclxuLy8gUVVuaXQudGVzdCggJ3Rlc3RWUkM5OTFFbWludXMyJywgYXNzZXJ0ID0+IHtcclxuLy9cclxuLy8gICBmb3IgKCBsZXQgdiA9IDA7IHYgPCAxMjA7IHYgKz0gMTAgKSB7IC8vIGVzbFxyXG4vLyAgICAgZm9yICggbGV0IGMgPSAwLjA1OyBjIDw9IDAuMjA7IGMgKz0gMC4wNSApIHtcclxuLy8gICAgICAgdGVzdFZSQ0NpcmN1aXQoIHYsIDEwLCBjLCBhc3NlcnQgKTtcclxuLy8gICAgIH1cclxuLy8gICB9XHJcbi8vIH0gKTtcclxuXHJcblFVbml0LnRlc3QoICd0ZXN0IFJDIENpcmN1aXQgc2hvdWxkIGhhdmUgdm9sdGFnZSBleHBvbmVudGlhbGx5IGRlY2F5IHdpdGggVCBSQyBmb3IgdiA1IHIgMTAgYyAxRSBtaW51czInLCBhc3NlcnQgPT4ge1xyXG4gIHRlc3RWUkNDaXJjdWl0KCA1LjAsIDEwLjAsIDEuMEUtMiwgYXNzZXJ0ICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICd0ZXN0IFJDIENpcmN1aXQgc2hvdWxkIGhhdmUgdm9sdGFnZSBleHBvbmVudGlhbGx5IGRlY2F5IHdpdGggVCBSQyBmb3IgdiAxMCByIDEwIGMgMUUgbWludXMyJywgYXNzZXJ0ID0+IHtcclxuICB0ZXN0VlJDQ2lyY3VpdCggMTAuMCwgMTAuMCwgMS4wRS0yLCBhc3NlcnQgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ3Rlc3QgUkMgQ2lyY3VpdCBzaG91bGQgaGF2ZSB2b2x0YWdlIGV4cG9uZW50aWFsbHkgZGVjYXkgd2l0aCBUIFJDIGZvciB2IDMgIHIgNyAgYyAxRW1pbnVzMScsIGFzc2VydCA9PiB7XHJcbiAgdGVzdFZSQ0NpcmN1aXQoIDMsIDcsIDFFLTEsIGFzc2VydCApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAndGVzdCBSQyBDaXJjdWl0IHNob3VsZCBoYXZlIHZvbHRhZ2UgZXhwb25lbnRpYWxseSBkZWNheSB3aXRoIFQgUkMgZm9yIHYgMyAgciA3ICBjIDEwMCcsIGFzc2VydCA9PiB7XHJcbiAgdGVzdFZSQ0NpcmN1aXQoIDMsIDcsIDEwMCwgYXNzZXJ0ICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICd0ZXN0IFJDIENpcmN1aXQgd2l0aCBzZXJpZXMgY2FwYWNpdG9ycycsIGFzc2VydCA9PiB7XHJcbiAgdGVzdFZSQ0NpcmN1aXRTZXJpZXNDYXBhY2l0b3JzKCAzLCA3LCAxMCwgMTAsIGFzc2VydCApO1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IDEwOyBpKysgKSB7XHJcbiAgICB0ZXN0VlJDQ2lyY3VpdFNlcmllc0NhcGFjaXRvcnMoIDMsIDcsIE1hdGgucmFuZG9tKCkgKiAxMCwgTWF0aC5yYW5kb20oKSAqIDEwLCBhc3NlcnQgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWQtc2ltLXRleHQsIGJhZC1zaW0tdGV4dFxyXG4gIH1cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ3Rlc3QgUkMgQ2lyY3VpdCB3aXRoIHBhcmFsbGVsIGNhcGFjaXRvcnMnLCBhc3NlcnQgPT4ge1xyXG4gIHRlc3RWUkNDaXJjdWl0UGFyYWxsZWxDYXBhY2l0b3JzKCAzLCA3LCAxMCwgMTAsIGFzc2VydCApO1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IDEwOyBpKysgKSB7XHJcbiAgICB0ZXN0VlJDQ2lyY3VpdFBhcmFsbGVsQ2FwYWNpdG9ycyggMywgNywgTWF0aC5yYW5kb20oKSAqIDEwLCBNYXRoLnJhbmRvbSgpICogMTAsIGFzc2VydCApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhZC1zaW0tdGV4dCwgYmFkLXNpbS10ZXh0XHJcbiAgfVxyXG59ICk7XHJcblxyXG5jb25zdCBpdGVyYXRlSW5kdWN0b3IgPSAoIGNpcmN1aXQ6IExUQUNpcmN1aXQsIHJlc2lzdG9yOiBNTkFSZXNpc3RvciwgVjogbnVtYmVyLCBSOiBudW1iZXIsIEw6IG51bWJlciwgYXNzZXJ0OiBBc3NlcnQgKSA9PiB7XHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgSVRFUkFUSU9OUzsgaSsrICkge1xyXG4gICAgY29uc3QgdCA9IGkgKiBkdDtcclxuICAgIGNvbnN0IHNvbHV0aW9uID0gY2lyY3VpdC5zb2x2ZUl0V2l0aFN1YmRpdmlzaW9ucyggZHQgKTtcclxuICAgIGNvbnN0IGFjdHVhbEN1cnJlbnQgPSBzb2x1dGlvbiEuZ2V0Q3VycmVudCggcmVzaXN0b3IgKSE7XHJcbiAgICBjb25zdCBleHBlY3RlZEN1cnJlbnQgPSAtViAvIFIgKiAoIDEgLSBNYXRoLmV4cCggLSggdCArIGR0ICkgKiBSIC8gTCApICk7Ly9wb3NpdGl2ZSwgYnkgZGVmaW5pdGlvbiBvZiBNTkEuQmF0dGVyeVxyXG5cclxuICAgIC8vIGNvbnNvbGUubG9nKCBleHBlY3RlZEN1cnJlbnQsIGFjdHVhbEN1cnJlbnQgKTtcclxuICAgIGNvbnN0IGVycm9yID0gTWF0aC5hYnMoIGFjdHVhbEN1cnJlbnQgLSBleHBlY3RlZEN1cnJlbnQgKTtcclxuICAgIGNvbnN0IGZyYWN0aW9uYWxFcnJvciA9IGVycm9yIC8gZXhwZWN0ZWRDdXJyZW50O1xyXG5cclxuICAgIGlmICggZXJyb3IgPiAxRS04ICkge1xyXG4gICAgICBhc3NlcnQub2soIGZyYWN0aW9uYWxFcnJvciA8PSAwLjAyICk7XHJcbiAgICB9XHJcbiAgICAvLyBhc3NlcnQub2soIGVycm9yIDwgZXJyb3JUaHJlc2hvbGQgKTtcclxuICAgIC8vIGFzc2VydC5vayggdHJ1ZSApO1xyXG4gICAgY2lyY3VpdCA9IGNpcmN1aXQudXBkYXRlV2l0aFN1YmRpdmlzaW9ucyggZHQgKTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCB0ZXN0VlJMQ2lyY3VpdCA9ICggVjogbnVtYmVyLCBSOiBudW1iZXIsIEw6IG51bWJlciwgYXNzZXJ0OiBBc3NlcnQgKSA9PiB7XHJcbiAgY29uc3QgcmVzaXN0b3IgPSBuZXcgTU5BUmVzaXN0b3IoICcxJywgJzInLCBSICk7XHJcbiAgY29uc3QgYmF0dGVyeSA9IG5ldyBMVEFSZXNpc3RpdmVCYXR0ZXJ5KCBpZCsrLCAnMCcsICcxJywgViwgMCApO1xyXG4gIGNvbnN0IGluZHVjdG9yID0gbmV3IExUQUluZHVjdG9yKCBpZCsrLCAnMicsICcwJywgViwgMC4wLCBMICk7XHJcbiAgY29uc3QgY2lyY3VpdCA9IG5ldyBMVEFDaXJjdWl0KCBbIHJlc2lzdG9yIF0sIFsgYmF0dGVyeSBdLCBbXSwgWyBpbmR1Y3RvciBdICk7XHJcbiAgaXRlcmF0ZUluZHVjdG9yKCBjaXJjdWl0LCByZXNpc3RvciwgViwgUiwgTCwgYXNzZXJ0ICk7XHJcbn07XHJcbmNvbnN0IHRlc3RWUkxDaXJjdWl0U2VyaWVzID0gKCBWOiBudW1iZXIsIFI6IG51bWJlciwgTDE6IG51bWJlciwgTDI6IG51bWJlciwgYXNzZXJ0OiBBc3NlcnQgKSA9PiB7XHJcbiAgY29uc3QgTGVxID0gTDEgKyBMMjtcclxuICBjb25zdCByZXNpc3RvciA9IG5ldyBNTkFSZXNpc3RvciggJzEnLCAnMicsIFIgKTtcclxuICBjb25zdCBiYXR0ZXJ5ID0gbmV3IExUQVJlc2lzdGl2ZUJhdHRlcnkoIGlkKyssICcwJywgJzEnLCBWLCAwICk7XHJcbiAgY29uc3QgaW5kdWN0b3IxID0gbmV3IExUQUluZHVjdG9yKCBpZCsrLCAnMicsICczJywgMCwgMC4wLCBMMSApO1xyXG4gIGNvbnN0IGluZHVjdG9yMiA9IG5ldyBMVEFJbmR1Y3RvciggaWQrKywgJzMnLCAnMCcsIDAsIDAuMCwgTDIgKTtcclxuICBjb25zdCBjaXJjdWl0ID0gbmV3IExUQUNpcmN1aXQoIFsgcmVzaXN0b3IgXSwgWyBiYXR0ZXJ5IF0sIFtdLCBbIGluZHVjdG9yMSwgaW5kdWN0b3IyIF0gKTtcclxuICBpdGVyYXRlSW5kdWN0b3IoIGNpcmN1aXQsIHJlc2lzdG9yLCBWLCBSLCBMZXEsIGFzc2VydCApO1xyXG59O1xyXG5jb25zdCB0ZXN0VlJMQ2lyY3VpdFBhcmFsbGVsID0gKCBWOiBudW1iZXIsIFI6IG51bWJlciwgTDE6IG51bWJlciwgTDI6IG51bWJlciwgYXNzZXJ0OiBBc3NlcnQgKSA9PiB7XHJcbiAgY29uc3QgTGVxID0gMSAvICggMSAvIEwxICsgMSAvIEwyICk7XHJcbiAgY29uc3QgcmVzaXN0b3IgPSBuZXcgTU5BUmVzaXN0b3IoICcxJywgJzInLCBSICk7XHJcbiAgY29uc3QgYmF0dGVyeSA9IG5ldyBMVEFSZXNpc3RpdmVCYXR0ZXJ5KCBpZCsrLCAnMCcsICcxJywgViwgMCApO1xyXG4gIGNvbnN0IGluZHVjdG9yMSA9IG5ldyBMVEFJbmR1Y3RvciggaWQrKywgJzInLCAnMCcsIDAsIDAuMCwgTDEgKTtcclxuICBjb25zdCBpbmR1Y3RvcjIgPSBuZXcgTFRBSW5kdWN0b3IoIGlkKyssICcyJywgJzAnLCAwLCAwLjAsIEwyICk7XHJcbiAgY29uc3QgY2lyY3VpdCA9IG5ldyBMVEFDaXJjdWl0KCBbIHJlc2lzdG9yIF0sIFsgYmF0dGVyeSBdLCBbXSwgWyBpbmR1Y3RvcjEsIGluZHVjdG9yMiBdICk7XHJcbiAgaXRlcmF0ZUluZHVjdG9yKCBjaXJjdWl0LCByZXNpc3RvciwgViwgUiwgTGVxLCBhc3NlcnQgKTtcclxufTtcclxuXHJcblFVbml0LnRlc3QoICd0ZXN0X1JMX0NpcmN1aXRfc2hvdWxkX2hhdmVfY29ycmVjdF9iZWhhdmlvcicsIGFzc2VydCA9PiB7XHJcbiAgdGVzdFZSTENpcmN1aXQoIDUsIDEwLCAxLCBhc3NlcnQgKTtcclxuICB0ZXN0VlJMQ2lyY3VpdCggMywgMTEsIDIuNSwgYXNzZXJ0ICk7XHJcbiAgdGVzdFZSTENpcmN1aXQoIDcsIDEzLCAxRTQsIGFzc2VydCApO1xyXG4gIHRlc3RWUkxDaXJjdWl0KCA3LCAxMywgMUUtMSwgYXNzZXJ0ICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdTZXJpZXMgaW5kdWN0b3JzJywgYXNzZXJ0ID0+IHtcclxuICB0ZXN0VlJMQ2lyY3VpdFNlcmllcyggNSwgMTAsIDEsIDEsIGFzc2VydCApO1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IDEwOyBpKysgKSB7XHJcbiAgICB0ZXN0VlJMQ2lyY3VpdFNlcmllcyggMTAsIDEwLCA1ICogTWF0aC5yYW5kb20oKSArIDAuMSwgNSAqIE1hdGgucmFuZG9tKCkgKyAwLjEsIGFzc2VydCApOy8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFkLXNpbS10ZXh0XHJcbiAgfVxyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnUGFyYWxsZWwgaW5kdWN0b3JzJywgYXNzZXJ0ID0+IHtcclxuICB0ZXN0VlJMQ2lyY3VpdFBhcmFsbGVsKCA1LCAxMCwgMSwgMSwgYXNzZXJ0ICk7XHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgMTA7IGkrKyApIHtcclxuICAgIHRlc3RWUkxDaXJjdWl0UGFyYWxsZWwoIDEwLCAxMCwgNSAqIE1hdGgucmFuZG9tKCkgKyAxLCA1ICogTWF0aC5yYW5kb20oKSArIDEsIGFzc2VydCApOy8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFkLXNpbS10ZXh0XHJcbiAgfVxyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsT0FBT0EsVUFBVSxNQUFNLGlCQUFpQjtBQUN4QyxPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBQzVDLE9BQU9DLFdBQVcsTUFBTSxrQkFBa0I7QUFDMUMsT0FBT0MsbUJBQW1CLE1BQU0sMEJBQTBCO0FBQzFELE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFFOUMsTUFBTUMsVUFBVSxHQUFHLEdBQUc7QUFDdEJDLEtBQUssQ0FBQ0MsTUFBTSxDQUFFLFlBQWEsQ0FBQztBQUM1QixNQUFNQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUU7QUFFakIsSUFBSUMsRUFBRSxHQUFHLENBQUM7QUFFVixJQUFJQyxVQUFVLEdBQUcsQ0FBQzs7QUFFbEI7QUFDQTtBQUNBO0FBQ0EsTUFBTUMsZ0JBQWdCLEdBQUdBLENBQUVDLE9BQW1CLEVBQUVDLFFBQXFCLEVBQUVDLENBQVMsRUFBRUMsQ0FBUyxFQUFFQyxDQUFTLEVBQUVDLE1BQWMsS0FBTTtFQUMxSCxLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2IsVUFBVSxFQUFFYSxDQUFDLEVBQUUsRUFBRztJQUNy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