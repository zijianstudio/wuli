// Copyright 2014-2021, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author John Blanco
 */

import arithmetic from '../arithmetic.js';
const ArithmeticQueryParameters = QueryStringMachine.getAll({
  // automatically answer most problems to enable faster testing of level completion
  autoAnswer: {
    type: 'flag'
  }
});

// prevent auto answer in versions that are intended for publication
if (phet.chipper.isProduction && !phet.chipper.isDebugBuild) {
  ArithmeticQueryParameters.autoAnswer = false;
}
arithmetic.register('ArithmeticQueryParameters', ArithmeticQueryParameters);
export default ArithmeticQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhcml0aG1ldGljIiwiQXJpdGhtZXRpY1F1ZXJ5UGFyYW1ldGVycyIsIlF1ZXJ5U3RyaW5nTWFjaGluZSIsImdldEFsbCIsImF1dG9BbnN3ZXIiLCJ0eXBlIiwicGhldCIsImNoaXBwZXIiLCJpc1Byb2R1Y3Rpb24iLCJpc0RlYnVnQnVpbGQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFyaXRobWV0aWNRdWVyeVBhcmFtZXRlcnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUXVlcnkgcGFyYW1ldGVycyBzdXBwb3J0ZWQgYnkgdGhpcyBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IGFyaXRobWV0aWMgZnJvbSAnLi4vYXJpdGhtZXRpYy5qcyc7XHJcblxyXG5jb25zdCBBcml0aG1ldGljUXVlcnlQYXJhbWV0ZXJzID0gUXVlcnlTdHJpbmdNYWNoaW5lLmdldEFsbCgge1xyXG5cclxuICAvLyBhdXRvbWF0aWNhbGx5IGFuc3dlciBtb3N0IHByb2JsZW1zIHRvIGVuYWJsZSBmYXN0ZXIgdGVzdGluZyBvZiBsZXZlbCBjb21wbGV0aW9uXHJcbiAgYXV0b0Fuc3dlcjogeyB0eXBlOiAnZmxhZycgfVxyXG59ICk7XHJcblxyXG4vLyBwcmV2ZW50IGF1dG8gYW5zd2VyIGluIHZlcnNpb25zIHRoYXQgYXJlIGludGVuZGVkIGZvciBwdWJsaWNhdGlvblxyXG5pZiAoIHBoZXQuY2hpcHBlci5pc1Byb2R1Y3Rpb24gJiYgIXBoZXQuY2hpcHBlci5pc0RlYnVnQnVpbGQgKSB7XHJcbiAgQXJpdGhtZXRpY1F1ZXJ5UGFyYW1ldGVycy5hdXRvQW5zd2VyID0gZmFsc2U7XHJcbn1cclxuXHJcbmFyaXRobWV0aWMucmVnaXN0ZXIoICdBcml0aG1ldGljUXVlcnlQYXJhbWV0ZXJzJywgQXJpdGhtZXRpY1F1ZXJ5UGFyYW1ldGVycyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXJpdGhtZXRpY1F1ZXJ5UGFyYW1ldGVyczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLGtCQUFrQjtBQUV6QyxNQUFNQyx5QkFBeUIsR0FBR0Msa0JBQWtCLENBQUNDLE1BQU0sQ0FBRTtFQUUzRDtFQUNBQyxVQUFVLEVBQUU7SUFBRUMsSUFBSSxFQUFFO0VBQU87QUFDN0IsQ0FBRSxDQUFDOztBQUVIO0FBQ0EsSUFBS0MsSUFBSSxDQUFDQyxPQUFPLENBQUNDLFlBQVksSUFBSSxDQUFDRixJQUFJLENBQUNDLE9BQU8sQ0FBQ0UsWUFBWSxFQUFHO0VBQzdEUix5QkFBeUIsQ0FBQ0csVUFBVSxHQUFHLEtBQUs7QUFDOUM7QUFFQUosVUFBVSxDQUFDVSxRQUFRLENBQUUsMkJBQTJCLEVBQUVULHlCQUEwQixDQUFDO0FBRTdFLGVBQWVBLHlCQUF5QiJ9