// Copyright 2022-2023, University of Colorado Boulder

/**
 * QUnit tests for Disposable
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Disposable from './Disposable.js';
QUnit.module('Disposable');
QUnit.test('Disposable basics', assert => {
  assert.ok(true, 'initial test');
  class MyDisposable extends Disposable {
    constructor() {
      super();
    }
  }
  const object1 = new MyDisposable();
  assert.ok(!!object1.disposeEmitter, 'disposeEmitter needed');
  const object2 = new MyDisposable();
  object1.disposeEmitter.addListener(() => object2.dispose());
  assert.ok(!object1.isDisposed, '1 is not disposed');
  assert.ok(!object2.isDisposed, '2 is not disposed');
  object1.dispose();
  assert.ok(object1.isDisposed, '1 is disposed');
  assert.ok(object2.isDisposed, '2 is disposed');

  // @ts-expect-error isDisposed is not on TEmitter, but should be in place if assertions are enabled
  window.assert && assert.ok(object1.disposeEmitter.isDisposed, 'disposeEmitter should be disposed too');
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaXNwb3NhYmxlIiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0Iiwib2siLCJNeURpc3Bvc2FibGUiLCJjb25zdHJ1Y3RvciIsIm9iamVjdDEiLCJkaXNwb3NlRW1pdHRlciIsIm9iamVjdDIiLCJhZGRMaXN0ZW5lciIsImRpc3Bvc2UiLCJpc0Rpc3Bvc2VkIiwid2luZG93Il0sInNvdXJjZXMiOlsiRGlzcG9zYWJsZVRlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFFVbml0IHRlc3RzIGZvciBEaXNwb3NhYmxlXHJcbiAqXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgRGlzcG9zYWJsZSBmcm9tICcuL0Rpc3Bvc2FibGUuanMnO1xyXG5cclxuUVVuaXQubW9kdWxlKCAnRGlzcG9zYWJsZScgKTtcclxuXHJcblFVbml0LnRlc3QoICdEaXNwb3NhYmxlIGJhc2ljcycsIGFzc2VydCA9PiB7XHJcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnaW5pdGlhbCB0ZXN0JyApO1xyXG5cclxuICBjbGFzcyBNeURpc3Bvc2FibGUgZXh0ZW5kcyBEaXNwb3NhYmxlIHtcclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoKTt9XHJcbiAgfVxyXG5cclxuICBjb25zdCBvYmplY3QxID0gbmV3IE15RGlzcG9zYWJsZSgpO1xyXG4gIGFzc2VydC5vayggISFvYmplY3QxLmRpc3Bvc2VFbWl0dGVyLCAnZGlzcG9zZUVtaXR0ZXIgbmVlZGVkJyApO1xyXG4gIGNvbnN0IG9iamVjdDIgPSBuZXcgTXlEaXNwb3NhYmxlKCk7XHJcbiAgb2JqZWN0MS5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gb2JqZWN0Mi5kaXNwb3NlKCkgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCAhb2JqZWN0MS5pc0Rpc3Bvc2VkLCAnMSBpcyBub3QgZGlzcG9zZWQnICk7XHJcbiAgYXNzZXJ0Lm9rKCAhb2JqZWN0Mi5pc0Rpc3Bvc2VkLCAnMiBpcyBub3QgZGlzcG9zZWQnICk7XHJcblxyXG4gIG9iamVjdDEuZGlzcG9zZSgpO1xyXG4gIGFzc2VydC5vayggb2JqZWN0MS5pc0Rpc3Bvc2VkLCAnMSBpcyBkaXNwb3NlZCcgKTtcclxuICBhc3NlcnQub2soIG9iamVjdDIuaXNEaXNwb3NlZCwgJzIgaXMgZGlzcG9zZWQnICk7XHJcblxyXG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgaXNEaXNwb3NlZCBpcyBub3Qgb24gVEVtaXR0ZXIsIGJ1dCBzaG91bGQgYmUgaW4gcGxhY2UgaWYgYXNzZXJ0aW9ucyBhcmUgZW5hYmxlZFxyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0Lm9rKCBvYmplY3QxLmRpc3Bvc2VFbWl0dGVyLmlzRGlzcG9zZWQsICdkaXNwb3NlRW1pdHRlciBzaG91bGQgYmUgZGlzcG9zZWQgdG9vJyApO1xyXG59ICk7XHJcblxyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLGlCQUFpQjtBQUV4Q0MsS0FBSyxDQUFDQyxNQUFNLENBQUUsWUFBYSxDQUFDO0FBRTVCRCxLQUFLLENBQUNFLElBQUksQ0FBRSxtQkFBbUIsRUFBRUMsTUFBTSxJQUFJO0VBQ3pDQSxNQUFNLENBQUNDLEVBQUUsQ0FBRSxJQUFJLEVBQUUsY0FBZSxDQUFDO0VBRWpDLE1BQU1DLFlBQVksU0FBU04sVUFBVSxDQUFDO0lBQzdCTyxXQUFXQSxDQUFBLEVBQUc7TUFBRSxLQUFLLENBQUMsQ0FBQztJQUFDO0VBQ2pDO0VBRUEsTUFBTUMsT0FBTyxHQUFHLElBQUlGLFlBQVksQ0FBQyxDQUFDO0VBQ2xDRixNQUFNLENBQUNDLEVBQUUsQ0FBRSxDQUFDLENBQUNHLE9BQU8sQ0FBQ0MsY0FBYyxFQUFFLHVCQUF3QixDQUFDO0VBQzlELE1BQU1DLE9BQU8sR0FBRyxJQUFJSixZQUFZLENBQUMsQ0FBQztFQUNsQ0UsT0FBTyxDQUFDQyxjQUFjLENBQUNFLFdBQVcsQ0FBRSxNQUFNRCxPQUFPLENBQUNFLE9BQU8sQ0FBQyxDQUFFLENBQUM7RUFFN0RSLE1BQU0sQ0FBQ0MsRUFBRSxDQUFFLENBQUNHLE9BQU8sQ0FBQ0ssVUFBVSxFQUFFLG1CQUFvQixDQUFDO0VBQ3JEVCxNQUFNLENBQUNDLEVBQUUsQ0FBRSxDQUFDSyxPQUFPLENBQUNHLFVBQVUsRUFBRSxtQkFBb0IsQ0FBQztFQUVyREwsT0FBTyxDQUFDSSxPQUFPLENBQUMsQ0FBQztFQUNqQlIsTUFBTSxDQUFDQyxFQUFFLENBQUVHLE9BQU8sQ0FBQ0ssVUFBVSxFQUFFLGVBQWdCLENBQUM7RUFDaERULE1BQU0sQ0FBQ0MsRUFBRSxDQUFFSyxPQUFPLENBQUNHLFVBQVUsRUFBRSxlQUFnQixDQUFDOztFQUVoRDtFQUNBQyxNQUFNLENBQUNWLE1BQU0sSUFBSUEsTUFBTSxDQUFDQyxFQUFFLENBQUVHLE9BQU8sQ0FBQ0MsY0FBYyxDQUFDSSxVQUFVLEVBQUUsdUNBQXdDLENBQUM7QUFDMUcsQ0FBRSxDQUFDIn0=