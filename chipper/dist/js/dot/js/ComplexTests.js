// Copyright 2017-2022, University of Colorado Boulder

/**
 * Bounds2 tests
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Complex from './Complex.js';
QUnit.module('Complex');
function approximateComplexEquals(assert, a, b, msg) {
  const epsilon = 0.00001;
  assert.ok(a.equalsEpsilon(b, epsilon), `${msg} expected: ${b.toString()}, result: ${a.toString()}`);
}
QUnit.test('Basic', assert => {
  const c = new Complex(2, 3);
  assert.equal(c.real, 2, 'real');
  assert.equal(c.imaginary, 3, 'imaginary');
  assert.equal(c.conjugated().real, 2, 'real conjugated');
  assert.equal(c.conjugated().imaginary, -3, 'imaginary conjugated');
});
QUnit.test('Multiplication', assert => {
  approximateComplexEquals(assert, new Complex(2, 3).times(new Complex(7, -13)), new Complex(53, -5), 'Multiplication');
});
QUnit.test('Division', assert => {
  approximateComplexEquals(assert, new Complex(2, 3).dividedBy(new Complex(7, -13)), new Complex(-25 / 218, 47 / 218), 'Division');
});
QUnit.test('Canceling', assert => {
  const a = new Complex(2, -3);
  const b = new Complex(7, 13);
  approximateComplexEquals(assert, a.times(b).dividedBy(b), a, 'Canceling');
});
QUnit.test('Square root', assert => {
  approximateComplexEquals(assert, new Complex(3, 4).sqrtOf(), new Complex(2, 1), 'Division');
  approximateComplexEquals(assert, new Complex(3, -4).sqrtOf(), new Complex(2, -1), 'Division');
  const c = new Complex(2.5, -7.1);
  approximateComplexEquals(assert, c.sqrtOf().times(c.sqrtOf()), c);
  const cc = c.plus(c);
  new Complex(cc.x, cc.y).sqrtOf();
});
QUnit.test('Exponentiation', assert => {
  approximateComplexEquals(assert, new Complex(2, -3).exponentiated(), new Complex(-7.31511, -1.04274), 'Exponentiation');
});
QUnit.test('Cos of', assert => {
  const a = new Complex(1, 1);
  const b = new Complex(0.8337300251311491, -0.9888977057628651);
  approximateComplexEquals(assert, a.cosOf(), b, 'Cos Of');
});
QUnit.test('Sin of', assert => {
  const a = new Complex(1, 1);
  const b = new Complex(1.29845758, 0.634963914);
  approximateComplexEquals(assert, a.sinOf(), b, 'Sin Of');
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb21wbGV4IiwiUVVuaXQiLCJtb2R1bGUiLCJhcHByb3hpbWF0ZUNvbXBsZXhFcXVhbHMiLCJhc3NlcnQiLCJhIiwiYiIsIm1zZyIsImVwc2lsb24iLCJvayIsImVxdWFsc0Vwc2lsb24iLCJ0b1N0cmluZyIsInRlc3QiLCJjIiwiZXF1YWwiLCJyZWFsIiwiaW1hZ2luYXJ5IiwiY29uanVnYXRlZCIsInRpbWVzIiwiZGl2aWRlZEJ5Iiwic3FydE9mIiwiY2MiLCJwbHVzIiwieCIsInkiLCJleHBvbmVudGlhdGVkIiwiY29zT2YiLCJzaW5PZiJdLCJzb3VyY2VzIjpbIkNvbXBsZXhUZXN0cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCb3VuZHMyIHRlc3RzXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IENvbXBsZXggZnJvbSAnLi9Db21wbGV4LmpzJztcclxuXHJcblFVbml0Lm1vZHVsZSggJ0NvbXBsZXgnICk7XHJcblxyXG5mdW5jdGlvbiBhcHByb3hpbWF0ZUNvbXBsZXhFcXVhbHMoIGFzc2VydCwgYSwgYiwgbXNnICkge1xyXG4gIGNvbnN0IGVwc2lsb24gPSAwLjAwMDAxO1xyXG4gIGFzc2VydC5vayggYS5lcXVhbHNFcHNpbG9uKCBiLCBlcHNpbG9uICksIGAke21zZ30gZXhwZWN0ZWQ6ICR7Yi50b1N0cmluZygpfSwgcmVzdWx0OiAke2EudG9TdHJpbmcoKX1gICk7XHJcbn1cclxuXHJcblFVbml0LnRlc3QoICdCYXNpYycsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgYyA9IG5ldyBDb21wbGV4KCAyLCAzICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBjLnJlYWwsIDIsICdyZWFsJyApO1xyXG4gIGFzc2VydC5lcXVhbCggYy5pbWFnaW5hcnksIDMsICdpbWFnaW5hcnknICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBjLmNvbmp1Z2F0ZWQoKS5yZWFsLCAyLCAncmVhbCBjb25qdWdhdGVkJyApO1xyXG4gIGFzc2VydC5lcXVhbCggYy5jb25qdWdhdGVkKCkuaW1hZ2luYXJ5LCAtMywgJ2ltYWdpbmFyeSBjb25qdWdhdGVkJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnTXVsdGlwbGljYXRpb24nLCBhc3NlcnQgPT4ge1xyXG4gIGFwcHJveGltYXRlQ29tcGxleEVxdWFscyggYXNzZXJ0LCBuZXcgQ29tcGxleCggMiwgMyApLnRpbWVzKCBuZXcgQ29tcGxleCggNywgLTEzICkgKSwgbmV3IENvbXBsZXgoIDUzLCAtNSApLCAnTXVsdGlwbGljYXRpb24nICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdEaXZpc2lvbicsIGFzc2VydCA9PiB7XHJcbiAgYXBwcm94aW1hdGVDb21wbGV4RXF1YWxzKCBhc3NlcnQsIG5ldyBDb21wbGV4KCAyLCAzICkuZGl2aWRlZEJ5KCBuZXcgQ29tcGxleCggNywgLTEzICkgKSwgbmV3IENvbXBsZXgoIC0yNSAvIDIxOCwgNDcgLyAyMTggKSwgJ0RpdmlzaW9uJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnQ2FuY2VsaW5nJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBhID0gbmV3IENvbXBsZXgoIDIsIC0zICk7XHJcbiAgY29uc3QgYiA9IG5ldyBDb21wbGV4KCA3LCAxMyApO1xyXG4gIGFwcHJveGltYXRlQ29tcGxleEVxdWFscyggYXNzZXJ0LCBhLnRpbWVzKCBiICkuZGl2aWRlZEJ5KCBiICksIGEsICdDYW5jZWxpbmcnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdTcXVhcmUgcm9vdCcsIGFzc2VydCA9PiB7XHJcbiAgYXBwcm94aW1hdGVDb21wbGV4RXF1YWxzKCBhc3NlcnQsIG5ldyBDb21wbGV4KCAzLCA0ICkuc3FydE9mKCksIG5ldyBDb21wbGV4KCAyLCAxICksICdEaXZpc2lvbicgKTtcclxuICBhcHByb3hpbWF0ZUNvbXBsZXhFcXVhbHMoIGFzc2VydCwgbmV3IENvbXBsZXgoIDMsIC00ICkuc3FydE9mKCksIG5ldyBDb21wbGV4KCAyLCAtMSApLCAnRGl2aXNpb24nICk7XHJcblxyXG4gIGNvbnN0IGMgPSBuZXcgQ29tcGxleCggMi41LCAtNy4xICk7XHJcbiAgYXBwcm94aW1hdGVDb21wbGV4RXF1YWxzKCBhc3NlcnQsIGMuc3FydE9mKCkudGltZXMoIGMuc3FydE9mKCkgKSwgYyApO1xyXG5cclxuICBjb25zdCBjYyA9IGMucGx1cyggYyApO1xyXG4gIG5ldyBDb21wbGV4KCBjYy54LCBjYy55ICkuc3FydE9mKCk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdFeHBvbmVudGlhdGlvbicsIGFzc2VydCA9PiB7XHJcbiAgYXBwcm94aW1hdGVDb21wbGV4RXF1YWxzKCBhc3NlcnQsIG5ldyBDb21wbGV4KCAyLCAtMyApLmV4cG9uZW50aWF0ZWQoKSwgbmV3IENvbXBsZXgoIC03LjMxNTExLCAtMS4wNDI3NCApLCAnRXhwb25lbnRpYXRpb24nICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdDb3Mgb2YnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGEgPSBuZXcgQ29tcGxleCggMSwgMSApO1xyXG4gIGNvbnN0IGIgPSBuZXcgQ29tcGxleCggMC44MzM3MzAwMjUxMzExNDkxLCAtMC45ODg4OTc3MDU3NjI4NjUxICk7XHJcbiAgYXBwcm94aW1hdGVDb21wbGV4RXF1YWxzKCBhc3NlcnQsIGEuY29zT2YoKSwgYiwgJ0NvcyBPZicgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1NpbiBvZicsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgYSA9IG5ldyBDb21wbGV4KCAxLCAxICk7XHJcbiAgY29uc3QgYiA9IG5ldyBDb21wbGV4KCAxLjI5ODQ1NzU4LCAwLjYzNDk2MzkxNCApO1xyXG4gIGFwcHJveGltYXRlQ29tcGxleEVxdWFscyggYXNzZXJ0LCBhLnNpbk9mKCksIGIsICdTaW4gT2YnICk7XHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sY0FBYztBQUVsQ0MsS0FBSyxDQUFDQyxNQUFNLENBQUUsU0FBVSxDQUFDO0FBRXpCLFNBQVNDLHdCQUF3QkEsQ0FBRUMsTUFBTSxFQUFFQyxDQUFDLEVBQUVDLENBQUMsRUFBRUMsR0FBRyxFQUFHO0VBQ3JELE1BQU1DLE9BQU8sR0FBRyxPQUFPO0VBQ3ZCSixNQUFNLENBQUNLLEVBQUUsQ0FBRUosQ0FBQyxDQUFDSyxhQUFhLENBQUVKLENBQUMsRUFBRUUsT0FBUSxDQUFDLEVBQUcsR0FBRUQsR0FBSSxjQUFhRCxDQUFDLENBQUNLLFFBQVEsQ0FBQyxDQUFFLGFBQVlOLENBQUMsQ0FBQ00sUUFBUSxDQUFDLENBQUUsRUFBRSxDQUFDO0FBQ3pHO0FBRUFWLEtBQUssQ0FBQ1csSUFBSSxDQUFFLE9BQU8sRUFBRVIsTUFBTSxJQUFJO0VBQzdCLE1BQU1TLENBQUMsR0FBRyxJQUFJYixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztFQUM3QkksTUFBTSxDQUFDVSxLQUFLLENBQUVELENBQUMsQ0FBQ0UsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFPLENBQUM7RUFDakNYLE1BQU0sQ0FBQ1UsS0FBSyxDQUFFRCxDQUFDLENBQUNHLFNBQVMsRUFBRSxDQUFDLEVBQUUsV0FBWSxDQUFDO0VBQzNDWixNQUFNLENBQUNVLEtBQUssQ0FBRUQsQ0FBQyxDQUFDSSxVQUFVLENBQUMsQ0FBQyxDQUFDRixJQUFJLEVBQUUsQ0FBQyxFQUFFLGlCQUFrQixDQUFDO0VBQ3pEWCxNQUFNLENBQUNVLEtBQUssQ0FBRUQsQ0FBQyxDQUFDSSxVQUFVLENBQUMsQ0FBQyxDQUFDRCxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsc0JBQXVCLENBQUM7QUFDdEUsQ0FBRSxDQUFDO0FBRUhmLEtBQUssQ0FBQ1csSUFBSSxDQUFFLGdCQUFnQixFQUFFUixNQUFNLElBQUk7RUFDdENELHdCQUF3QixDQUFFQyxNQUFNLEVBQUUsSUFBSUosT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsQ0FBQ2tCLEtBQUssQ0FBRSxJQUFJbEIsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUcsQ0FBRSxDQUFDLEVBQUUsSUFBSUEsT0FBTyxDQUFFLEVBQUUsRUFBRSxDQUFDLENBQUUsQ0FBQyxFQUFFLGdCQUFpQixDQUFDO0FBQ2pJLENBQUUsQ0FBQztBQUVIQyxLQUFLLENBQUNXLElBQUksQ0FBRSxVQUFVLEVBQUVSLE1BQU0sSUFBSTtFQUNoQ0Qsd0JBQXdCLENBQUVDLE1BQU0sRUFBRSxJQUFJSixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDbUIsU0FBUyxDQUFFLElBQUluQixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRyxDQUFFLENBQUMsRUFBRSxJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsR0FBRyxHQUFJLENBQUMsRUFBRSxVQUFXLENBQUM7QUFDNUksQ0FBRSxDQUFDO0FBRUhDLEtBQUssQ0FBQ1csSUFBSSxDQUFFLFdBQVcsRUFBRVIsTUFBTSxJQUFJO0VBQ2pDLE1BQU1DLENBQUMsR0FBRyxJQUFJTCxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDO0VBQzlCLE1BQU1NLENBQUMsR0FBRyxJQUFJTixPQUFPLENBQUUsQ0FBQyxFQUFFLEVBQUcsQ0FBQztFQUM5Qkcsd0JBQXdCLENBQUVDLE1BQU0sRUFBRUMsQ0FBQyxDQUFDYSxLQUFLLENBQUVaLENBQUUsQ0FBQyxDQUFDYSxTQUFTLENBQUViLENBQUUsQ0FBQyxFQUFFRCxDQUFDLEVBQUUsV0FBWSxDQUFDO0FBQ2pGLENBQUUsQ0FBQztBQUVISixLQUFLLENBQUNXLElBQUksQ0FBRSxhQUFhLEVBQUVSLE1BQU0sSUFBSTtFQUNuQ0Qsd0JBQXdCLENBQUVDLE1BQU0sRUFBRSxJQUFJSixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDb0IsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJcEIsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFBRSxVQUFXLENBQUM7RUFDakdHLHdCQUF3QixDQUFFQyxNQUFNLEVBQUUsSUFBSUosT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQyxDQUFDb0IsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJcEIsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQyxFQUFFLFVBQVcsQ0FBQztFQUVuRyxNQUFNYSxDQUFDLEdBQUcsSUFBSWIsT0FBTyxDQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUksQ0FBQztFQUNsQ0csd0JBQXdCLENBQUVDLE1BQU0sRUFBRVMsQ0FBQyxDQUFDTyxNQUFNLENBQUMsQ0FBQyxDQUFDRixLQUFLLENBQUVMLENBQUMsQ0FBQ08sTUFBTSxDQUFDLENBQUUsQ0FBQyxFQUFFUCxDQUFFLENBQUM7RUFFckUsTUFBTVEsRUFBRSxHQUFHUixDQUFDLENBQUNTLElBQUksQ0FBRVQsQ0FBRSxDQUFDO0VBQ3RCLElBQUliLE9BQU8sQ0FBRXFCLEVBQUUsQ0FBQ0UsQ0FBQyxFQUFFRixFQUFFLENBQUNHLENBQUUsQ0FBQyxDQUFDSixNQUFNLENBQUMsQ0FBQztBQUNwQyxDQUFFLENBQUM7QUFFSG5CLEtBQUssQ0FBQ1csSUFBSSxDQUFFLGdCQUFnQixFQUFFUixNQUFNLElBQUk7RUFDdENELHdCQUF3QixDQUFFQyxNQUFNLEVBQUUsSUFBSUosT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQyxDQUFDeUIsYUFBYSxDQUFDLENBQUMsRUFBRSxJQUFJekIsT0FBTyxDQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBUSxDQUFDLEVBQUUsZ0JBQWlCLENBQUM7QUFDL0gsQ0FBRSxDQUFDO0FBRUhDLEtBQUssQ0FBQ1csSUFBSSxDQUFFLFFBQVEsRUFBRVIsTUFBTSxJQUFJO0VBQzlCLE1BQU1DLENBQUMsR0FBRyxJQUFJTCxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztFQUM3QixNQUFNTSxDQUFDLEdBQUcsSUFBSU4sT0FBTyxDQUFFLGtCQUFrQixFQUFFLENBQUMsa0JBQW1CLENBQUM7RUFDaEVHLHdCQUF3QixDQUFFQyxNQUFNLEVBQUVDLENBQUMsQ0FBQ3FCLEtBQUssQ0FBQyxDQUFDLEVBQUVwQixDQUFDLEVBQUUsUUFBUyxDQUFDO0FBQzVELENBQUUsQ0FBQztBQUVITCxLQUFLLENBQUNXLElBQUksQ0FBRSxRQUFRLEVBQUVSLE1BQU0sSUFBSTtFQUM5QixNQUFNQyxDQUFDLEdBQUcsSUFBSUwsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7RUFDN0IsTUFBTU0sQ0FBQyxHQUFHLElBQUlOLE9BQU8sQ0FBRSxVQUFVLEVBQUUsV0FBWSxDQUFDO0VBQ2hERyx3QkFBd0IsQ0FBRUMsTUFBTSxFQUFFQyxDQUFDLENBQUNzQixLQUFLLENBQUMsQ0FBQyxFQUFFckIsQ0FBQyxFQUFFLFFBQVMsQ0FBQztBQUM1RCxDQUFFLENBQUMifQ==