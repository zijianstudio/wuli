// Copyright 2018-2022, University of Colorado Boulder

/**
 * QUnit tests for the KeyStateTracker.
 *
 * @author Jesse Greenberg
 * @author Michael Barlow
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

// modules
import stepTimer from '../../../axon/js/stepTimer.js';
import KeyboardUtils from './KeyboardUtils.js';
import KeyStateTracker from './KeyStateTracker.js';

// Reusable KeyboardEvents to update the KeyStateTracker with
// const tabKeyEvent = { key: KeyboardUtils.KEY_TAB };
// const spaceKeyEvent = { key: KeyboardUtils.KEY_SPACE };
// const shiftTabKeyEvent = { key: KeyboardUtils.KEY_TAB, shiftKey: true };
// const shiftKeyEvent = { key: KeyboardUtils.KEY_SHIFT };

const tabKeyDownEvent = new KeyboardEvent('keydown', {
  code: KeyboardUtils.KEY_TAB
});
const tabKeyUpEvent = new KeyboardEvent('keyup', {
  code: KeyboardUtils.KEY_TAB
});
const spaceKeyDownEvent = new KeyboardEvent('keydown', {
  code: KeyboardUtils.KEY_SPACE
});
const spaceKeyUpEvent = new KeyboardEvent('keyup', {
  code: KeyboardUtils.KEY_SPACE
});
const shiftTabKeyDownEvent = new KeyboardEvent('keydown', {
  code: KeyboardUtils.KEY_TAB,
  shiftKey: true
});
const shiftTabKeyUpEvent = new KeyboardEvent('keyup', {
  code: KeyboardUtils.KEY_TAB,
  shiftKey: true
});
const shiftKeyLeftDownEvent = new KeyboardEvent('keydown', {
  code: KeyboardUtils.KEY_SHIFT_LEFT
});
const shiftKeyLeftUpEvent = new KeyboardEvent('keyup', {
  code: KeyboardUtils.KEY_SHIFT_LEFT
});
const testTracker = new KeyStateTracker();
let intervalID;
QUnit.module('KeyStateTracker', {
  before() {
    // step the stepTimer, because utteranceQueue runs on stepTimer
    let previousTime = Date.now();
    intervalID = window.setInterval(() => {
      // eslint-disable-line bad-sim-text
      const currentTime = Date.now();
      const timeStep = (currentTime - previousTime) / 1000; // convert to seconds
      previousTime = currentTime;

      // step timer
      stepTimer.emit(timeStep);
    }, 10);
  },
  after() {
    testTracker.dispose();
    clearInterval(intervalID);
  },
  beforeEach() {
    testTracker.clearState();
  }
});
QUnit.test('basic state tracking of keys', assert => {
  // mock sending "keydown" events to the tracker
  testTracker['keydownUpdate'](tabKeyDownEvent);
  assert.ok(testTracker.isKeyDown(tabKeyDownEvent.code), 'tab key should be down in tracker');
  testTracker['keyupUpdate'](tabKeyUpEvent);
  assert.ok(!testTracker.isKeyDown(tabKeyUpEvent.code), 'tab key should be up in tracker');
  testTracker['keydownUpdate'](spaceKeyDownEvent);
  assert.ok(testTracker.isAnyKeyInListDown([spaceKeyDownEvent.code, tabKeyDownEvent.code]), 'tab or space are down');
  assert.ok(!testTracker.areKeysDown([tabKeyDownEvent.code, spaceKeyDownEvent.code]), 'tab and space are not down');
  testTracker['keydownUpdate'](tabKeyDownEvent);
  assert.ok(testTracker.isAnyKeyInListDown([tabKeyDownEvent.code, spaceKeyDownEvent.code]), 'tab and/or space are down');
  assert.ok(testTracker.areKeysDown([tabKeyDownEvent.code, spaceKeyDownEvent.code]), 'tab and space are down');
  testTracker['keydownUpdate'](spaceKeyUpEvent);
});
QUnit.test('tracking of shift key', assert => {
  // mock sending "keydown" events to the tracker
  testTracker['keydownUpdate'](shiftTabKeyDownEvent);
  assert.ok(testTracker.shiftKeyDown, 'tab key with shift modifier should produce a keystate with shift key down');
  testTracker['keydownUpdate'](shiftKeyLeftDownEvent);
  testTracker['keydownUpdate'](shiftTabKeyDownEvent);
  assert.ok(testTracker.isKeyDown(tabKeyDownEvent.code), 'tab key should be down in tracker');
  assert.ok(testTracker.isKeyDown(shiftKeyLeftDownEvent.code), 'shift key should be down in tracker');
  assert.ok(testTracker.shiftKeyDown, 'shift key should be down in tracker getter');
  testTracker['keyupUpdate'](shiftKeyLeftUpEvent);
  testTracker['keyupUpdate'](tabKeyUpEvent);
  assert.ok(!testTracker.isKeyDown(shiftKeyLeftUpEvent.code), 'shift key should not be down in tracker');
  assert.ok(!testTracker.shiftKeyDown, 'shift key should not be down in tracker getter');
  assert.ok(!testTracker.isKeyDown(tabKeyUpEvent.code), 'tab key should not be down in tracker');
  assert.ok(!testTracker.keysAreDown(), 'no keys should be down');
  testTracker['keydownUpdate'](tabKeyDownEvent);
  testTracker['keyupUpdate'](shiftTabKeyUpEvent);
  assert.ok(!testTracker.isKeyDown(tabKeyDownEvent.code), 'tab key should not be down in tracker');

  // KeyStateTracker should correctly update when modifier keys like "shift" are attached to the event - if shift
  // is down on keyUpUpdate, shift should be considered down
  assert.ok(testTracker.isKeyDown(shiftKeyLeftDownEvent.code), 'shift key should update from modifier');
  assert.ok(testTracker.shiftKeyDown, 'shift key should update from modifier getter');
});
QUnit.test('test tracking with time', async assert => {
  const done = assert.async();

  // we will test holding down a key for these lengths of time in ms
  const firstPressTime = 500;
  const secondPressTime = 71;
  const totalPressTime = firstPressTime + secondPressTime;
  testTracker['keydownUpdate'](spaceKeyDownEvent);
  let currentTimeDown = testTracker.timeDownForKey(spaceKeyDownEvent.code);
  assert.ok(currentTimeDown === 0, 'should be zero, has not been down any time');
  stepTimer.setTimeout(() => {
    currentTimeDown = testTracker.timeDownForKey(spaceKeyDownEvent.code);
    assert.ok(currentTimeDown >= firstPressTime && currentTimeDown <= totalPressTime, `key pressed for ${firstPressTime} ms`);
    stepTimer.setTimeout(() => {
      currentTimeDown = testTracker.timeDownForKey(spaceKeyDownEvent.code);
      assert.ok(currentTimeDown >= totalPressTime, `key pressed for ${secondPressTime} more ms.`);
      testTracker['keyupUpdate'](spaceKeyUpEvent);
      done();
    }, secondPressTime);
  }, firstPressTime);
});
QUnit.test('KeyStateTracker.enabled', async assert => {
  const keyStateTracker = new KeyStateTracker();
  keyStateTracker['keydownUpdate'](tabKeyDownEvent);
  assert.ok(keyStateTracker.enabled, 'default enabled');
  assert.ok(keyStateTracker.isKeyDown(KeyboardUtils.KEY_TAB), 'tab key down');
  keyStateTracker.enabled = false;
  assert.ok(!keyStateTracker.enabled, 'disabled');
  assert.ok(!keyStateTracker.isKeyDown(KeyboardUtils.KEY_TAB), 'tab key down cleared upon disabled');
  assert.ok(!keyStateTracker.keysAreDown(), 'no keys down');
  keyStateTracker['keydownUpdate'](tabKeyDownEvent);
  assert.ok(!keyStateTracker.isKeyDown(KeyboardUtils.KEY_TAB), 'tab key not registered when disabled');
  keyStateTracker['keydownUpdate'](shiftTabKeyDownEvent);
  assert.ok(!keyStateTracker.isKeyDown(KeyboardUtils.KEY_SHIFT_LEFT), 'shift key should not be down');
  keyStateTracker.enabled = true;
  keyStateTracker['keydownUpdate'](shiftTabKeyDownEvent);
  assert.ok(keyStateTracker.isKeyDown(KeyboardUtils.KEY_SHIFT_LEFT), 'shift key should be down');
  assert.ok(keyStateTracker.isKeyDown(KeyboardUtils.KEY_TAB), 'tab key should  be down');
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzdGVwVGltZXIiLCJLZXlib2FyZFV0aWxzIiwiS2V5U3RhdGVUcmFja2VyIiwidGFiS2V5RG93bkV2ZW50IiwiS2V5Ym9hcmRFdmVudCIsImNvZGUiLCJLRVlfVEFCIiwidGFiS2V5VXBFdmVudCIsInNwYWNlS2V5RG93bkV2ZW50IiwiS0VZX1NQQUNFIiwic3BhY2VLZXlVcEV2ZW50Iiwic2hpZnRUYWJLZXlEb3duRXZlbnQiLCJzaGlmdEtleSIsInNoaWZ0VGFiS2V5VXBFdmVudCIsInNoaWZ0S2V5TGVmdERvd25FdmVudCIsIktFWV9TSElGVF9MRUZUIiwic2hpZnRLZXlMZWZ0VXBFdmVudCIsInRlc3RUcmFja2VyIiwiaW50ZXJ2YWxJRCIsIlFVbml0IiwibW9kdWxlIiwiYmVmb3JlIiwicHJldmlvdXNUaW1lIiwiRGF0ZSIsIm5vdyIsIndpbmRvdyIsInNldEludGVydmFsIiwiY3VycmVudFRpbWUiLCJ0aW1lU3RlcCIsImVtaXQiLCJhZnRlciIsImRpc3Bvc2UiLCJjbGVhckludGVydmFsIiwiYmVmb3JlRWFjaCIsImNsZWFyU3RhdGUiLCJ0ZXN0IiwiYXNzZXJ0Iiwib2siLCJpc0tleURvd24iLCJpc0FueUtleUluTGlzdERvd24iLCJhcmVLZXlzRG93biIsInNoaWZ0S2V5RG93biIsImtleXNBcmVEb3duIiwiZG9uZSIsImFzeW5jIiwiZmlyc3RQcmVzc1RpbWUiLCJzZWNvbmRQcmVzc1RpbWUiLCJ0b3RhbFByZXNzVGltZSIsImN1cnJlbnRUaW1lRG93biIsInRpbWVEb3duRm9yS2V5Iiwic2V0VGltZW91dCIsImtleVN0YXRlVHJhY2tlciIsImVuYWJsZWQiXSwic291cmNlcyI6WyJLZXlTdGF0ZVRyYWNrZXJUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBRVW5pdCB0ZXN0cyBmb3IgdGhlIEtleVN0YXRlVHJhY2tlci5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcclxuICogQGF1dGhvciBNaWNoYWVsIEJhcmxvd1xyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuXHJcbi8vIG1vZHVsZXNcclxuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XHJcbmltcG9ydCBLZXlib2FyZFV0aWxzIGZyb20gJy4vS2V5Ym9hcmRVdGlscy5qcyc7XHJcbmltcG9ydCBLZXlTdGF0ZVRyYWNrZXIgZnJvbSAnLi9LZXlTdGF0ZVRyYWNrZXIuanMnO1xyXG5cclxuLy8gUmV1c2FibGUgS2V5Ym9hcmRFdmVudHMgdG8gdXBkYXRlIHRoZSBLZXlTdGF0ZVRyYWNrZXIgd2l0aFxyXG4vLyBjb25zdCB0YWJLZXlFdmVudCA9IHsga2V5OiBLZXlib2FyZFV0aWxzLktFWV9UQUIgfTtcclxuLy8gY29uc3Qgc3BhY2VLZXlFdmVudCA9IHsga2V5OiBLZXlib2FyZFV0aWxzLktFWV9TUEFDRSB9O1xyXG4vLyBjb25zdCBzaGlmdFRhYktleUV2ZW50ID0geyBrZXk6IEtleWJvYXJkVXRpbHMuS0VZX1RBQiwgc2hpZnRLZXk6IHRydWUgfTtcclxuLy8gY29uc3Qgc2hpZnRLZXlFdmVudCA9IHsga2V5OiBLZXlib2FyZFV0aWxzLktFWV9TSElGVCB9O1xyXG5cclxuY29uc3QgdGFiS2V5RG93bkV2ZW50ID0gbmV3IEtleWJvYXJkRXZlbnQoICdrZXlkb3duJywgeyBjb2RlOiBLZXlib2FyZFV0aWxzLktFWV9UQUIgfSApO1xyXG5jb25zdCB0YWJLZXlVcEV2ZW50ID0gbmV3IEtleWJvYXJkRXZlbnQoICdrZXl1cCcsIHsgY29kZTogS2V5Ym9hcmRVdGlscy5LRVlfVEFCIH0gKTtcclxuY29uc3Qgc3BhY2VLZXlEb3duRXZlbnQgPSBuZXcgS2V5Ym9hcmRFdmVudCggJ2tleWRvd24nLCB7IGNvZGU6IEtleWJvYXJkVXRpbHMuS0VZX1NQQUNFIH0gKTtcclxuY29uc3Qgc3BhY2VLZXlVcEV2ZW50ID0gbmV3IEtleWJvYXJkRXZlbnQoICdrZXl1cCcsIHsgY29kZTogS2V5Ym9hcmRVdGlscy5LRVlfU1BBQ0UgfSApO1xyXG5jb25zdCBzaGlmdFRhYktleURvd25FdmVudCA9IG5ldyBLZXlib2FyZEV2ZW50KCAna2V5ZG93bicsIHsgY29kZTogS2V5Ym9hcmRVdGlscy5LRVlfVEFCLCBzaGlmdEtleTogdHJ1ZSB9ICk7XHJcbmNvbnN0IHNoaWZ0VGFiS2V5VXBFdmVudCA9IG5ldyBLZXlib2FyZEV2ZW50KCAna2V5dXAnLCB7IGNvZGU6IEtleWJvYXJkVXRpbHMuS0VZX1RBQiwgc2hpZnRLZXk6IHRydWUgfSApO1xyXG5jb25zdCBzaGlmdEtleUxlZnREb3duRXZlbnQgPSBuZXcgS2V5Ym9hcmRFdmVudCggJ2tleWRvd24nLCB7IGNvZGU6IEtleWJvYXJkVXRpbHMuS0VZX1NISUZUX0xFRlQgfSApO1xyXG5jb25zdCBzaGlmdEtleUxlZnRVcEV2ZW50ID0gbmV3IEtleWJvYXJkRXZlbnQoICdrZXl1cCcsIHsgY29kZTogS2V5Ym9hcmRVdGlscy5LRVlfU0hJRlRfTEVGVCB9ICk7XHJcblxyXG5jb25zdCB0ZXN0VHJhY2tlciA9IG5ldyBLZXlTdGF0ZVRyYWNrZXIoKTtcclxuXHJcbmxldCBpbnRlcnZhbElEOiBudW1iZXI7XHJcblxyXG5RVW5pdC5tb2R1bGUoICdLZXlTdGF0ZVRyYWNrZXInLCB7XHJcblxyXG4gIGJlZm9yZSgpIHtcclxuXHJcbiAgICAvLyBzdGVwIHRoZSBzdGVwVGltZXIsIGJlY2F1c2UgdXR0ZXJhbmNlUXVldWUgcnVucyBvbiBzdGVwVGltZXJcclxuICAgIGxldCBwcmV2aW91c1RpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgaW50ZXJ2YWxJRCA9IHdpbmRvdy5zZXRJbnRlcnZhbCggKCkgPT4geyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhZC1zaW0tdGV4dFxyXG4gICAgICBjb25zdCBjdXJyZW50VGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgIGNvbnN0IHRpbWVTdGVwID0gKCBjdXJyZW50VGltZSAtIHByZXZpb3VzVGltZSApIC8gMTAwMDsgLy8gY29udmVydCB0byBzZWNvbmRzXHJcbiAgICAgIHByZXZpb3VzVGltZSA9IGN1cnJlbnRUaW1lO1xyXG5cclxuICAgICAgLy8gc3RlcCB0aW1lclxyXG4gICAgICBzdGVwVGltZXIuZW1pdCggdGltZVN0ZXAgKTtcclxuICAgIH0sIDEwICk7XHJcbiAgfSxcclxuICBhZnRlcigpIHtcclxuICAgIHRlc3RUcmFja2VyLmRpc3Bvc2UoKTtcclxuICAgIGNsZWFySW50ZXJ2YWwoIGludGVydmFsSUQgKTtcclxuICB9LFxyXG5cclxuICBiZWZvcmVFYWNoKCkge1xyXG4gICAgdGVzdFRyYWNrZXIuY2xlYXJTdGF0ZSgpO1xyXG4gIH1cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ2Jhc2ljIHN0YXRlIHRyYWNraW5nIG9mIGtleXMnLCBhc3NlcnQgPT4ge1xyXG5cclxuICAvLyBtb2NrIHNlbmRpbmcgXCJrZXlkb3duXCIgZXZlbnRzIHRvIHRoZSB0cmFja2VyXHJcbiAgdGVzdFRyYWNrZXJbICdrZXlkb3duVXBkYXRlJyBdKCB0YWJLZXlEb3duRXZlbnQgKTtcclxuICBhc3NlcnQub2soIHRlc3RUcmFja2VyLmlzS2V5RG93biggdGFiS2V5RG93bkV2ZW50LmNvZGUgKSwgJ3RhYiBrZXkgc2hvdWxkIGJlIGRvd24gaW4gdHJhY2tlcicgKTtcclxuXHJcbiAgdGVzdFRyYWNrZXJbICdrZXl1cFVwZGF0ZScgXSggdGFiS2V5VXBFdmVudCApO1xyXG4gIGFzc2VydC5vayggIXRlc3RUcmFja2VyLmlzS2V5RG93biggdGFiS2V5VXBFdmVudC5jb2RlICksICd0YWIga2V5IHNob3VsZCBiZSB1cCBpbiB0cmFja2VyJyApO1xyXG5cclxuICB0ZXN0VHJhY2tlclsgJ2tleWRvd25VcGRhdGUnIF0oIHNwYWNlS2V5RG93bkV2ZW50ICk7XHJcbiAgYXNzZXJ0Lm9rKCB0ZXN0VHJhY2tlci5pc0FueUtleUluTGlzdERvd24oIFsgc3BhY2VLZXlEb3duRXZlbnQuY29kZSwgdGFiS2V5RG93bkV2ZW50LmNvZGUgXSApLCAndGFiIG9yIHNwYWNlIGFyZSBkb3duJyApO1xyXG4gIGFzc2VydC5vayggIXRlc3RUcmFja2VyLmFyZUtleXNEb3duKCBbIHRhYktleURvd25FdmVudC5jb2RlLCBzcGFjZUtleURvd25FdmVudC5jb2RlIF0gKSwgJ3RhYiBhbmQgc3BhY2UgYXJlIG5vdCBkb3duJyApO1xyXG5cclxuICB0ZXN0VHJhY2tlclsgJ2tleWRvd25VcGRhdGUnIF0oIHRhYktleURvd25FdmVudCApO1xyXG4gIGFzc2VydC5vayggdGVzdFRyYWNrZXIuaXNBbnlLZXlJbkxpc3REb3duKCBbIHRhYktleURvd25FdmVudC5jb2RlLCBzcGFjZUtleURvd25FdmVudC5jb2RlIF0gKSwgJ3RhYiBhbmQvb3Igc3BhY2UgYXJlIGRvd24nICk7XHJcbiAgYXNzZXJ0Lm9rKCB0ZXN0VHJhY2tlci5hcmVLZXlzRG93biggWyB0YWJLZXlEb3duRXZlbnQuY29kZSwgc3BhY2VLZXlEb3duRXZlbnQuY29kZSBdICksICd0YWIgYW5kIHNwYWNlIGFyZSBkb3duJyApO1xyXG5cclxuICB0ZXN0VHJhY2tlclsgJ2tleWRvd25VcGRhdGUnIF0oIHNwYWNlS2V5VXBFdmVudCApO1xyXG59ICk7XHJcblxyXG5cclxuUVVuaXQudGVzdCggJ3RyYWNraW5nIG9mIHNoaWZ0IGtleScsIGFzc2VydCA9PiB7XHJcblxyXG4gIC8vIG1vY2sgc2VuZGluZyBcImtleWRvd25cIiBldmVudHMgdG8gdGhlIHRyYWNrZXJcclxuICB0ZXN0VHJhY2tlclsgJ2tleWRvd25VcGRhdGUnIF0oIHNoaWZ0VGFiS2V5RG93bkV2ZW50ICk7XHJcbiAgYXNzZXJ0Lm9rKCB0ZXN0VHJhY2tlci5zaGlmdEtleURvd24sICd0YWIga2V5IHdpdGggc2hpZnQgbW9kaWZpZXIgc2hvdWxkIHByb2R1Y2UgYSBrZXlzdGF0ZSB3aXRoIHNoaWZ0IGtleSBkb3duJyApO1xyXG5cclxuICB0ZXN0VHJhY2tlclsgJ2tleWRvd25VcGRhdGUnIF0oIHNoaWZ0S2V5TGVmdERvd25FdmVudCApO1xyXG4gIHRlc3RUcmFja2VyWyAna2V5ZG93blVwZGF0ZScgXSggc2hpZnRUYWJLZXlEb3duRXZlbnQgKTtcclxuICBhc3NlcnQub2soIHRlc3RUcmFja2VyLmlzS2V5RG93biggdGFiS2V5RG93bkV2ZW50LmNvZGUgKSwgJ3RhYiBrZXkgc2hvdWxkIGJlIGRvd24gaW4gdHJhY2tlcicgKTtcclxuICBhc3NlcnQub2soIHRlc3RUcmFja2VyLmlzS2V5RG93biggc2hpZnRLZXlMZWZ0RG93bkV2ZW50LmNvZGUgKSwgJ3NoaWZ0IGtleSBzaG91bGQgYmUgZG93biBpbiB0cmFja2VyJyApO1xyXG4gIGFzc2VydC5vayggdGVzdFRyYWNrZXIuc2hpZnRLZXlEb3duLCAnc2hpZnQga2V5IHNob3VsZCBiZSBkb3duIGluIHRyYWNrZXIgZ2V0dGVyJyApO1xyXG5cclxuICB0ZXN0VHJhY2tlclsgJ2tleXVwVXBkYXRlJyBdKCBzaGlmdEtleUxlZnRVcEV2ZW50ICk7XHJcbiAgdGVzdFRyYWNrZXJbICdrZXl1cFVwZGF0ZScgXSggdGFiS2V5VXBFdmVudCApO1xyXG5cclxuXHJcbiAgYXNzZXJ0Lm9rKCAhdGVzdFRyYWNrZXIuaXNLZXlEb3duKCBzaGlmdEtleUxlZnRVcEV2ZW50LmNvZGUgKSwgJ3NoaWZ0IGtleSBzaG91bGQgbm90IGJlIGRvd24gaW4gdHJhY2tlcicgKTtcclxuICBhc3NlcnQub2soICF0ZXN0VHJhY2tlci5zaGlmdEtleURvd24sICdzaGlmdCBrZXkgc2hvdWxkIG5vdCBiZSBkb3duIGluIHRyYWNrZXIgZ2V0dGVyJyApO1xyXG4gIGFzc2VydC5vayggIXRlc3RUcmFja2VyLmlzS2V5RG93biggdGFiS2V5VXBFdmVudC5jb2RlICksICd0YWIga2V5IHNob3VsZCBub3QgYmUgZG93biBpbiB0cmFja2VyJyApO1xyXG5cclxuICBhc3NlcnQub2soICF0ZXN0VHJhY2tlci5rZXlzQXJlRG93bigpLCAnbm8ga2V5cyBzaG91bGQgYmUgZG93bicgKTtcclxuXHJcbiAgdGVzdFRyYWNrZXJbICdrZXlkb3duVXBkYXRlJyBdKCB0YWJLZXlEb3duRXZlbnQgKTtcclxuICB0ZXN0VHJhY2tlclsgJ2tleXVwVXBkYXRlJyBdKCBzaGlmdFRhYktleVVwRXZlbnQgKTtcclxuICBhc3NlcnQub2soICF0ZXN0VHJhY2tlci5pc0tleURvd24oIHRhYktleURvd25FdmVudC5jb2RlICksICd0YWIga2V5IHNob3VsZCBub3QgYmUgZG93biBpbiB0cmFja2VyJyApO1xyXG5cclxuICAvLyBLZXlTdGF0ZVRyYWNrZXIgc2hvdWxkIGNvcnJlY3RseSB1cGRhdGUgd2hlbiBtb2RpZmllciBrZXlzIGxpa2UgXCJzaGlmdFwiIGFyZSBhdHRhY2hlZCB0byB0aGUgZXZlbnQgLSBpZiBzaGlmdFxyXG4gIC8vIGlzIGRvd24gb24ga2V5VXBVcGRhdGUsIHNoaWZ0IHNob3VsZCBiZSBjb25zaWRlcmVkIGRvd25cclxuICBhc3NlcnQub2soIHRlc3RUcmFja2VyLmlzS2V5RG93biggc2hpZnRLZXlMZWZ0RG93bkV2ZW50LmNvZGUgKSwgJ3NoaWZ0IGtleSBzaG91bGQgdXBkYXRlIGZyb20gbW9kaWZpZXInICk7XHJcbiAgYXNzZXJ0Lm9rKCB0ZXN0VHJhY2tlci5zaGlmdEtleURvd24sICdzaGlmdCBrZXkgc2hvdWxkIHVwZGF0ZSBmcm9tIG1vZGlmaWVyIGdldHRlcicgKTtcclxufSApO1xyXG5cclxuXHJcblFVbml0LnRlc3QoICd0ZXN0IHRyYWNraW5nIHdpdGggdGltZScsIGFzeW5jIGFzc2VydCA9PiB7XHJcblxyXG4gIGNvbnN0IGRvbmUgPSBhc3NlcnQuYXN5bmMoKTtcclxuXHJcbiAgLy8gd2Ugd2lsbCB0ZXN0IGhvbGRpbmcgZG93biBhIGtleSBmb3IgdGhlc2UgbGVuZ3RocyBvZiB0aW1lIGluIG1zXHJcbiAgY29uc3QgZmlyc3RQcmVzc1RpbWUgPSA1MDA7XHJcbiAgY29uc3Qgc2Vjb25kUHJlc3NUaW1lID0gNzE7XHJcbiAgY29uc3QgdG90YWxQcmVzc1RpbWUgPSBmaXJzdFByZXNzVGltZSArIHNlY29uZFByZXNzVGltZTtcclxuXHJcbiAgdGVzdFRyYWNrZXJbICdrZXlkb3duVXBkYXRlJyBdKCBzcGFjZUtleURvd25FdmVudCApO1xyXG4gIGxldCBjdXJyZW50VGltZURvd24gPSB0ZXN0VHJhY2tlci50aW1lRG93bkZvcktleSggc3BhY2VLZXlEb3duRXZlbnQuY29kZSApO1xyXG4gIGFzc2VydC5vayggY3VycmVudFRpbWVEb3duID09PSAwLCAnc2hvdWxkIGJlIHplcm8sIGhhcyBub3QgYmVlbiBkb3duIGFueSB0aW1lJyApO1xyXG5cclxuICBzdGVwVGltZXIuc2V0VGltZW91dCggKCkgPT4ge1xyXG4gICAgY3VycmVudFRpbWVEb3duID0gdGVzdFRyYWNrZXIudGltZURvd25Gb3JLZXkoIHNwYWNlS2V5RG93bkV2ZW50LmNvZGUgKTtcclxuXHJcbiAgICBhc3NlcnQub2soIGN1cnJlbnRUaW1lRG93biA+PSBmaXJzdFByZXNzVGltZSAmJiBjdXJyZW50VGltZURvd24gPD0gdG90YWxQcmVzc1RpbWUsIGBrZXkgcHJlc3NlZCBmb3IgJHtmaXJzdFByZXNzVGltZX0gbXNgICk7XHJcblxyXG4gICAgc3RlcFRpbWVyLnNldFRpbWVvdXQoICgpID0+IHtcclxuICAgICAgY3VycmVudFRpbWVEb3duID0gdGVzdFRyYWNrZXIudGltZURvd25Gb3JLZXkoIHNwYWNlS2V5RG93bkV2ZW50LmNvZGUgKTtcclxuXHJcbiAgICAgIGFzc2VydC5vayggY3VycmVudFRpbWVEb3duID49IHRvdGFsUHJlc3NUaW1lLCBga2V5IHByZXNzZWQgZm9yICR7c2Vjb25kUHJlc3NUaW1lfSBtb3JlIG1zLmAgKTtcclxuXHJcbiAgICAgIHRlc3RUcmFja2VyWyAna2V5dXBVcGRhdGUnIF0oIHNwYWNlS2V5VXBFdmVudCApO1xyXG4gICAgICBkb25lKCk7XHJcbiAgICB9LCBzZWNvbmRQcmVzc1RpbWUgKTtcclxuICB9LCBmaXJzdFByZXNzVGltZSApO1xyXG59ICk7XHJcblxyXG5cclxuUVVuaXQudGVzdCggJ0tleVN0YXRlVHJhY2tlci5lbmFibGVkJywgYXN5bmMgYXNzZXJ0ID0+IHtcclxuXHJcbiAgY29uc3Qga2V5U3RhdGVUcmFja2VyID0gbmV3IEtleVN0YXRlVHJhY2tlcigpO1xyXG5cclxuICBrZXlTdGF0ZVRyYWNrZXJbICdrZXlkb3duVXBkYXRlJyBdKCB0YWJLZXlEb3duRXZlbnQgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBrZXlTdGF0ZVRyYWNrZXIuZW5hYmxlZCwgJ2RlZmF1bHQgZW5hYmxlZCcgKTtcclxuICBhc3NlcnQub2soIGtleVN0YXRlVHJhY2tlci5pc0tleURvd24oIEtleWJvYXJkVXRpbHMuS0VZX1RBQiApLCAndGFiIGtleSBkb3duJyApO1xyXG5cclxuICBrZXlTdGF0ZVRyYWNrZXIuZW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuXHJcbiAgYXNzZXJ0Lm9rKCAha2V5U3RhdGVUcmFja2VyLmVuYWJsZWQsICdkaXNhYmxlZCcgKTtcclxuICBhc3NlcnQub2soICFrZXlTdGF0ZVRyYWNrZXIuaXNLZXlEb3duKCBLZXlib2FyZFV0aWxzLktFWV9UQUIgKSwgJ3RhYiBrZXkgZG93biBjbGVhcmVkIHVwb24gZGlzYWJsZWQnICk7XHJcbiAgYXNzZXJ0Lm9rKCAha2V5U3RhdGVUcmFja2VyLmtleXNBcmVEb3duKCksICdubyBrZXlzIGRvd24nICk7XHJcblxyXG4gIGtleVN0YXRlVHJhY2tlclsgJ2tleWRvd25VcGRhdGUnIF0oIHRhYktleURvd25FdmVudCApO1xyXG4gIGFzc2VydC5vayggIWtleVN0YXRlVHJhY2tlci5pc0tleURvd24oIEtleWJvYXJkVXRpbHMuS0VZX1RBQiApLCAndGFiIGtleSBub3QgcmVnaXN0ZXJlZCB3aGVuIGRpc2FibGVkJyApO1xyXG5cclxuICBrZXlTdGF0ZVRyYWNrZXJbICdrZXlkb3duVXBkYXRlJyBdKCBzaGlmdFRhYktleURvd25FdmVudCApO1xyXG5cclxuICBhc3NlcnQub2soICFrZXlTdGF0ZVRyYWNrZXIuaXNLZXlEb3duKCBLZXlib2FyZFV0aWxzLktFWV9TSElGVF9MRUZUICksICdzaGlmdCBrZXkgc2hvdWxkIG5vdCBiZSBkb3duJyApO1xyXG5cclxuXHJcbiAga2V5U3RhdGVUcmFja2VyLmVuYWJsZWQgPSB0cnVlO1xyXG5cclxuICBrZXlTdGF0ZVRyYWNrZXJbICdrZXlkb3duVXBkYXRlJyBdKCBzaGlmdFRhYktleURvd25FdmVudCApO1xyXG5cclxuICBhc3NlcnQub2soIGtleVN0YXRlVHJhY2tlci5pc0tleURvd24oIEtleWJvYXJkVXRpbHMuS0VZX1NISUZUX0xFRlQgKSwgJ3NoaWZ0IGtleSBzaG91bGQgYmUgZG93bicgKTtcclxuICBhc3NlcnQub2soIGtleVN0YXRlVHJhY2tlci5pc0tleURvd24oIEtleWJvYXJkVXRpbHMuS0VZX1RBQiApLCAndGFiIGtleSBzaG91bGQgIGJlIGRvd24nICk7XHJcblxyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQTtBQUNBLE9BQU9BLFNBQVMsTUFBTSwrQkFBK0I7QUFDckQsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUM5QyxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCOztBQUVsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1DLGVBQWUsR0FBRyxJQUFJQyxhQUFhLENBQUUsU0FBUyxFQUFFO0VBQUVDLElBQUksRUFBRUosYUFBYSxDQUFDSztBQUFRLENBQUUsQ0FBQztBQUN2RixNQUFNQyxhQUFhLEdBQUcsSUFBSUgsYUFBYSxDQUFFLE9BQU8sRUFBRTtFQUFFQyxJQUFJLEVBQUVKLGFBQWEsQ0FBQ0s7QUFBUSxDQUFFLENBQUM7QUFDbkYsTUFBTUUsaUJBQWlCLEdBQUcsSUFBSUosYUFBYSxDQUFFLFNBQVMsRUFBRTtFQUFFQyxJQUFJLEVB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