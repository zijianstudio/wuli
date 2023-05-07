// Copyright 2018-2021, University of Colorado Boulder

/**
 * FireListener tests
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Tandem from '../../../tandem/js/Tandem.js';
import FireListener from './FireListener.js';
import ListenerTestUtils from './ListenerTestUtils.js';
QUnit.module('FireListener');
QUnit.test('Basics', assert => {
  ListenerTestUtils.simpleRectangleTest((display, rect, node) => {
    let fireCount = 0;
    const listener = new FireListener({
      tandem: Tandem.ROOT_TEST.createTandem('myListener'),
      fire: () => {
        fireCount++;
      }
    });
    rect.addInputListener(listener);
    ListenerTestUtils.mouseMove(display, 10, 10);
    assert.equal(fireCount, 0, 'Not yet fired on move');
    ListenerTestUtils.mouseDown(display, 10, 10);
    assert.equal(fireCount, 0, 'Not yet fired on initial press');
    ListenerTestUtils.mouseUp(display, 10, 10);
    assert.equal(fireCount, 1, 'It fired on release');
    ListenerTestUtils.mouseMove(display, 50, 10);
    ListenerTestUtils.mouseDown(display, 50, 10);
    ListenerTestUtils.mouseUp(display, 50, 10);
    assert.equal(fireCount, 1, 'Should not fire when the mouse totally misses');
    ListenerTestUtils.mouseMove(display, 10, 10);
    ListenerTestUtils.mouseDown(display, 10, 10);
    ListenerTestUtils.mouseMove(display, 50, 10);
    ListenerTestUtils.mouseUp(display, 50, 10);
    assert.equal(fireCount, 1, 'Should NOT fire when pressed and then moved away');
    ListenerTestUtils.mouseMove(display, 50, 10);
    ListenerTestUtils.mouseDown(display, 50, 10);
    ListenerTestUtils.mouseMove(display, 10, 10);
    ListenerTestUtils.mouseUp(display, 10, 10);
    assert.equal(fireCount, 1, 'Should NOT fire when the press misses (even if the release is over)');
    ListenerTestUtils.mouseMove(display, 10, 10);
    ListenerTestUtils.mouseDown(display, 10, 10);
    listener.interrupt();
    ListenerTestUtils.mouseUp(display, 10, 10);
    assert.equal(fireCount, 1, 'Should NOT fire on an interruption');
    ListenerTestUtils.mouseMove(display, 10, 10);
    ListenerTestUtils.mouseDown(display, 10, 10);
    ListenerTestUtils.mouseMove(display, 50, 10);
    ListenerTestUtils.mouseMove(display, 10, 10);
    ListenerTestUtils.mouseUp(display, 10, 10);
    assert.equal(fireCount, 2, 'Should fire if the mouse is moved away after press (but moved back before release)');
    listener.dispose();
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYW5kZW0iLCJGaXJlTGlzdGVuZXIiLCJMaXN0ZW5lclRlc3RVdGlscyIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsInNpbXBsZVJlY3RhbmdsZVRlc3QiLCJkaXNwbGF5IiwicmVjdCIsIm5vZGUiLCJmaXJlQ291bnQiLCJsaXN0ZW5lciIsInRhbmRlbSIsIlJPT1RfVEVTVCIsImNyZWF0ZVRhbmRlbSIsImZpcmUiLCJhZGRJbnB1dExpc3RlbmVyIiwibW91c2VNb3ZlIiwiZXF1YWwiLCJtb3VzZURvd24iLCJtb3VzZVVwIiwiaW50ZXJydXB0IiwiZGlzcG9zZSJdLCJzb3VyY2VzIjpbIkZpcmVMaXN0ZW5lclRlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEZpcmVMaXN0ZW5lciB0ZXN0c1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEZpcmVMaXN0ZW5lciBmcm9tICcuL0ZpcmVMaXN0ZW5lci5qcyc7XHJcbmltcG9ydCBMaXN0ZW5lclRlc3RVdGlscyBmcm9tICcuL0xpc3RlbmVyVGVzdFV0aWxzLmpzJztcclxuXHJcblFVbml0Lm1vZHVsZSggJ0ZpcmVMaXN0ZW5lcicgKTtcclxuXHJcblFVbml0LnRlc3QoICdCYXNpY3MnLCBhc3NlcnQgPT4ge1xyXG4gIExpc3RlbmVyVGVzdFV0aWxzLnNpbXBsZVJlY3RhbmdsZVRlc3QoICggZGlzcGxheSwgcmVjdCwgbm9kZSApID0+IHtcclxuICAgIGxldCBmaXJlQ291bnQgPSAwO1xyXG4gICAgY29uc3QgbGlzdGVuZXIgPSBuZXcgRmlyZUxpc3RlbmVyKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oICdteUxpc3RlbmVyJyApLFxyXG4gICAgICBmaXJlOiAoKSA9PiB7XHJcbiAgICAgICAgZmlyZUNvdW50Kys7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHJlY3QuYWRkSW5wdXRMaXN0ZW5lciggbGlzdGVuZXIgKTtcclxuXHJcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZU1vdmUoIGRpc3BsYXksIDEwLCAxMCApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBmaXJlQ291bnQsIDAsICdOb3QgeWV0IGZpcmVkIG9uIG1vdmUnICk7XHJcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZURvd24oIGRpc3BsYXksIDEwLCAxMCApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBmaXJlQ291bnQsIDAsICdOb3QgeWV0IGZpcmVkIG9uIGluaXRpYWwgcHJlc3MnICk7XHJcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZVVwKCBkaXNwbGF5LCAxMCwgMTAgKTtcclxuICAgIGFzc2VydC5lcXVhbCggZmlyZUNvdW50LCAxLCAnSXQgZmlyZWQgb24gcmVsZWFzZScgKTtcclxuXHJcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZU1vdmUoIGRpc3BsYXksIDUwLCAxMCApO1xyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VEb3duKCBkaXNwbGF5LCA1MCwgMTAgKTtcclxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlVXAoIGRpc3BsYXksIDUwLCAxMCApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBmaXJlQ291bnQsIDEsICdTaG91bGQgbm90IGZpcmUgd2hlbiB0aGUgbW91c2UgdG90YWxseSBtaXNzZXMnICk7XHJcblxyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAxMCwgMTAgKTtcclxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlRG93biggZGlzcGxheSwgMTAsIDEwICk7XHJcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZU1vdmUoIGRpc3BsYXksIDUwLCAxMCApO1xyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VVcCggZGlzcGxheSwgNTAsIDEwICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIGZpcmVDb3VudCwgMSwgJ1Nob3VsZCBOT1QgZmlyZSB3aGVuIHByZXNzZWQgYW5kIHRoZW4gbW92ZWQgYXdheScgKTtcclxuXHJcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZU1vdmUoIGRpc3BsYXksIDUwLCAxMCApO1xyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VEb3duKCBkaXNwbGF5LCA1MCwgMTAgKTtcclxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlTW92ZSggZGlzcGxheSwgMTAsIDEwICk7XHJcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZVVwKCBkaXNwbGF5LCAxMCwgMTAgKTtcclxuICAgIGFzc2VydC5lcXVhbCggZmlyZUNvdW50LCAxLCAnU2hvdWxkIE5PVCBmaXJlIHdoZW4gdGhlIHByZXNzIG1pc3NlcyAoZXZlbiBpZiB0aGUgcmVsZWFzZSBpcyBvdmVyKScgKTtcclxuXHJcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZU1vdmUoIGRpc3BsYXksIDEwLCAxMCApO1xyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VEb3duKCBkaXNwbGF5LCAxMCwgMTAgKTtcclxuICAgIGxpc3RlbmVyLmludGVycnVwdCgpO1xyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VVcCggZGlzcGxheSwgMTAsIDEwICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIGZpcmVDb3VudCwgMSwgJ1Nob3VsZCBOT1QgZmlyZSBvbiBhbiBpbnRlcnJ1cHRpb24nICk7XHJcblxyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAxMCwgMTAgKTtcclxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlRG93biggZGlzcGxheSwgMTAsIDEwICk7XHJcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZU1vdmUoIGRpc3BsYXksIDUwLCAxMCApO1xyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAxMCwgMTAgKTtcclxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlVXAoIGRpc3BsYXksIDEwLCAxMCApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBmaXJlQ291bnQsIDIsICdTaG91bGQgZmlyZSBpZiB0aGUgbW91c2UgaXMgbW92ZWQgYXdheSBhZnRlciBwcmVzcyAoYnV0IG1vdmVkIGJhY2sgYmVmb3JlIHJlbGVhc2UpJyApO1xyXG5cclxuICAgIGxpc3RlbmVyLmRpc3Bvc2UoKTtcclxuICB9ICk7XHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBQzVDLE9BQU9DLGlCQUFpQixNQUFNLHdCQUF3QjtBQUV0REMsS0FBSyxDQUFDQyxNQUFNLENBQUUsY0FBZSxDQUFDO0FBRTlCRCxLQUFLLENBQUNFLElBQUksQ0FBRSxRQUFRLEVBQUVDLE1BQU0sSUFBSTtFQUM5QkosaUJBQWlCLENBQUNLLG1CQUFtQixDQUFFLENBQUVDLE9BQU8sRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEtBQU07SUFDaEUsSUFBSUMsU0FBUyxHQUFHLENBQUM7SUFDakIsTUFBTUMsUUFBUSxHQUFHLElBQUlYLFlBQVksQ0FBRTtNQUNqQ1ksTUFBTSxFQUFFYixNQUFNLENBQUNjLFNBQVMsQ0FBQ0MsWUFBWSxDQUFFLFlBQWEsQ0FBQztNQUNyREMsSUFBSSxFQUFFQSxDQUFBLEtBQU07UUFDVkwsU0FBUyxFQUFFO01BQ2I7SUFDRixDQUFFLENBQUM7SUFDSEYsSUFBSSxDQUFDUSxnQkFBZ0IsQ0FBRUwsUUFBUyxDQUFDO0lBRWpDVixpQkFBaUIsQ0FBQ2dCLFNBQVMsQ0FB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