// Copyright 2018-2022, University of Colorado Boulder

/**
 * ?fuzzBoard keyboard fuzzer
 * TODO: keep track of keyState so that we don't trigger a keydown of keyA before the previous keyA keyup event has been called.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import stepTimer from '../../../axon/js/stepTimer.js';
import Random from '../../../dot/js/Random.js';
import { globalKeyStateTracker, KeyboardUtils, PDOMUtils, scenery } from '../imports.js';
// uppercase matters
const keyboardTestingSchema = {
  INPUT: [...KeyboardUtils.ARROW_KEYS, KeyboardUtils.KEY_PAGE_UP, KeyboardUtils.KEY_PAGE_DOWN, KeyboardUtils.KEY_HOME, KeyboardUtils.KEY_END, KeyboardUtils.KEY_ENTER, KeyboardUtils.KEY_SPACE],
  DIV: [...KeyboardUtils.ARROW_KEYS, ...KeyboardUtils.WASD_KEYS],
  P: [KeyboardUtils.KEY_ESCAPE],
  BUTTON: [KeyboardUtils.KEY_ENTER, KeyboardUtils.KEY_SPACE]
};
const ALL_KEYS = KeyboardUtils.ALL_KEYS;
const MAX_MS_KEY_HOLD_DOWN = 100;
const NEXT_ELEMENT_THRESHOLD = 0.1;
const DO_KNOWN_KEYS_THRESHOLD = 0.60; // for keydown/up, 60 percent of the events
const CLICK_EVENT_THRESHOLD = DO_KNOWN_KEYS_THRESHOLD + 0.10; // 10 percent of the events

const KEY_DOWN = 'keydown';
const KEY_UP = 'keyup';
class KeyboardFuzzer {
  constructor(display, seed) {
    this.display = display;
    this.random = new Random({
      seed: seed
    });
    this.numberOfComponentsTested = 10;
    this.keyupListeners = [];
    this.currentElement = null;
  }

  /**
   * Randomly decide if we should focus the next element, or stay focused on the current element
   */
  chooseNextElement() {
    if (this.currentElement === null) {
      this.currentElement = document.activeElement;
    } else if (this.random.nextDouble() < NEXT_ELEMENT_THRESHOLD) {
      sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.KeyboardFuzzer('choosing new element');
      sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.push();

      // before we change focus to the next item, immediately release all keys that were down on the active element
      this.clearListeners();
      const nextFocusable = PDOMUtils.getRandomFocusable(this.random);
      nextFocusable.focus();
      this.currentElement = nextFocusable;
      sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.pop();
    }
  }
  clearListeners() {
    this.keyupListeners.forEach(listener => {
      assert && assert(typeof listener.timeout === 'function', 'should have an attached timeout');
      stepTimer.clearTimeout(listener.timeout);
      listener();
      assert && assert(!this.keyupListeners.includes(listener), 'calling listener should remove itself from the keyupListeners.');
    });
  }
  triggerClickEvent() {
    sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.KeyboardFuzzer('triggering click');
    sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.push();

    // We'll only ever want to send events to the activeElement (so that it's not stale), see
    // https://github.com/phetsims/scenery/issues/1497
    const element = document.activeElement;
    element instanceof HTMLElement && element.click();
    sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.pop();
  }

  /**
   * Trigger a keydown/keyup pair. The keyup is triggered with a timeout.
   */
  triggerKeyDownUpEvents(code) {
    sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.KeyboardFuzzer(`trigger keydown/up: ${code}`);
    sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.push();

    // TODO: screen readers normally take our keydown events, but may not here, is the discrepancy ok?
    this.triggerDOMEvent(KEY_DOWN, code);
    const randomTimeForKeypress = this.random.nextInt(MAX_MS_KEY_HOLD_DOWN);
    const keyupListener = () => {
      this.triggerDOMEvent(KEY_UP, code);
      if (this.keyupListeners.includes(keyupListener)) {
        this.keyupListeners.splice(this.keyupListeners.indexOf(keyupListener), 1);
      }
    };
    keyupListener.timeout = stepTimer.setTimeout(keyupListener, randomTimeForKeypress === MAX_MS_KEY_HOLD_DOWN ? 2000 : randomTimeForKeypress);
    this.keyupListeners.push(keyupListener);
    sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.pop();
  }

  /**
   * Trigger a keydown/keyup pair with a random KeyboardEvent.code.
   */
  triggerRandomKeyDownUpEvents(element) {
    const randomCode = ALL_KEYS[Math.floor(this.random.nextDouble() * (ALL_KEYS.length - 1))];
    sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.KeyboardFuzzer(`trigger random keydown/up: ${randomCode}`);
    sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.push();
    this.triggerKeyDownUpEvents(randomCode);
    sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.pop();
  }

  /**
   * A random event creator that sends keyboard events. Based on the idea of fuzzMouse, but to test/spam accessibility
   * related keyboard navigation and alternate input implementation.
   *
   * TODO: NOTE: Right now this is a very experimental implementation. Tread wearily
   * TODO: @param keyboardPressesPerFocusedItem {number} - basically would be the same as fuzzRate, but handling
   * TODO:     the keydown events for a focused item
   */
  fuzzBoardEvents(fuzzRate) {
    if (this.display && this.display._input && this.display._input.pdomPointer) {
      const pdomPointer = this.display._input.pdomPointer;
      if (pdomPointer && !pdomPointer.blockTrustedEvents) {
        pdomPointer.blockTrustedEvents = true;
      }
    }
    for (let i = 0; i < this.numberOfComponentsTested; i++) {
      // find a focus a random element
      this.chooseNextElement();
      for (let i = 0; i < fuzzRate / this.numberOfComponentsTested; i++) {
        sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.KeyboardFuzzer(`main loop, i=${i}`);
        sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.push();

        // get active element, focus might have changed in the last press
        const elementWithFocus = document.activeElement;
        if (elementWithFocus && keyboardTestingSchema[elementWithFocus.tagName.toUpperCase()]) {
          const randomNumber = this.random.nextDouble();
          if (randomNumber < DO_KNOWN_KEYS_THRESHOLD) {
            const codeValues = keyboardTestingSchema[elementWithFocus.tagName];
            const code = this.random.sample(codeValues);
            this.triggerKeyDownUpEvents(code);
          } else if (randomNumber < CLICK_EVENT_THRESHOLD) {
            this.triggerClickEvent();
          } else {
            this.triggerRandomKeyDownUpEvents(elementWithFocus);
          }
        } else {
          elementWithFocus && this.triggerRandomKeyDownUpEvents(elementWithFocus);
        }
        // TODO: What about other types of events, not just keydown/keyup??!?!
        // TODO: what about application role elements

        sceneryLog && sceneryLog.KeyboardFuzzer && sceneryLog.pop();
      }
    }
  }

  /**
   * Taken from example in http://output.jsbin.com/awenaq/3,
   */
  triggerDOMEvent(event, code) {
    // We'll only ever want to send events to the activeElement (so that it's not stale), see
    // https://github.com/phetsims/scenery/issues/1497
    if (document.activeElement) {
      const eventObj = new KeyboardEvent(event, {
        bubbles: true,
        code: code,
        shiftKey: globalKeyStateTracker.shiftKeyDown,
        altKey: globalKeyStateTracker.altKeyDown,
        ctrlKey: globalKeyStateTracker.ctrlKeyDown
      });
      document.activeElement.dispatchEvent(eventObj);
    }
  }
}
scenery.register('KeyboardFuzzer', KeyboardFuzzer);
export default KeyboardFuzzer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzdGVwVGltZXIiLCJSYW5kb20iLCJnbG9iYWxLZXlTdGF0ZVRyYWNrZXIiLCJLZXlib2FyZFV0aWxzIiwiUERPTVV0aWxzIiwic2NlbmVyeSIsImtleWJvYXJkVGVzdGluZ1NjaGVtYSIsIklOUFVUIiwiQVJST1dfS0VZUyIsIktFWV9QQUdFX1VQIiwiS0VZX1BBR0VfRE9XTiIsIktFWV9IT01FIiwiS0VZX0VORCIsIktFWV9FTlRFUiIsIktFWV9TUEFDRSIsIkRJViIsIldBU0RfS0VZUyIsIlAiLCJLRVlfRVNDQVBFIiwiQlVUVE9OIiwiQUxMX0tFWVMiLCJNQVhfTVNfS0VZX0hPTERfRE9XTiIsIk5FWFRfRUxFTUVOVF9USFJFU0hPTEQiLCJET19LTk9XTl9LRVlTX1RIUkVTSE9MRCIsIkNMSUNLX0VWRU5UX1RIUkVTSE9MRCIsIktFWV9ET1dOIiwiS0VZX1VQIiwiS2V5Ym9hcmRGdXp6ZXIiLCJjb25zdHJ1Y3RvciIsImRpc3BsYXkiLCJzZWVkIiwicmFuZG9tIiwibnVtYmVyT2ZDb21wb25lbnRzVGVzdGVkIiwia2V5dXBMaXN0ZW5lcnMiLCJjdXJyZW50RWxlbWVudCIsImNob29zZU5leHRFbGVtZW50IiwiZG9jdW1lbnQiLCJhY3RpdmVFbGVtZW50IiwibmV4dERvdWJsZSIsInNjZW5lcnlMb2ciLCJwdXNoIiwiY2xlYXJMaXN0ZW5lcnMiLCJuZXh0Rm9jdXNhYmxlIiwiZ2V0UmFuZG9tRm9jdXNhYmxlIiwiZm9jdXMiLCJwb3AiLCJmb3JFYWNoIiwibGlzdGVuZXIiLCJhc3NlcnQiLCJ0aW1lb3V0IiwiY2xlYXJUaW1lb3V0IiwiaW5jbHVkZXMiLCJ0cmlnZ2VyQ2xpY2tFdmVudCIsImVsZW1lbnQiLCJIVE1MRWxlbWVudCIsImNsaWNrIiwidHJpZ2dlcktleURvd25VcEV2ZW50cyIsImNvZGUiLCJ0cmlnZ2VyRE9NRXZlbnQiLCJyYW5kb21UaW1lRm9yS2V5cHJlc3MiLCJuZXh0SW50Iiwia2V5dXBMaXN0ZW5lciIsInNwbGljZSIsImluZGV4T2YiLCJzZXRUaW1lb3V0IiwidHJpZ2dlclJhbmRvbUtleURvd25VcEV2ZW50cyIsInJhbmRvbUNvZGUiLCJNYXRoIiwiZmxvb3IiLCJsZW5ndGgiLCJmdXp6Qm9hcmRFdmVudHMiLCJmdXp6UmF0ZSIsIl9pbnB1dCIsInBkb21Qb2ludGVyIiwiYmxvY2tUcnVzdGVkRXZlbnRzIiwiaSIsImVsZW1lbnRXaXRoRm9jdXMiLCJ0YWdOYW1lIiwidG9VcHBlckNhc2UiLCJyYW5kb21OdW1iZXIiLCJjb2RlVmFsdWVzIiwic2FtcGxlIiwiZXZlbnQiLCJldmVudE9iaiIsIktleWJvYXJkRXZlbnQiLCJidWJibGVzIiwic2hpZnRLZXkiLCJzaGlmdEtleURvd24iLCJhbHRLZXkiLCJhbHRLZXlEb3duIiwiY3RybEtleSIsImN0cmxLZXlEb3duIiwiZGlzcGF0Y2hFdmVudCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiS2V5Ym9hcmRGdXp6ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogP2Z1enpCb2FyZCBrZXlib2FyZCBmdXp6ZXJcclxuICogVE9ETzoga2VlcCB0cmFjayBvZiBrZXlTdGF0ZSBzbyB0aGF0IHdlIGRvbid0IHRyaWdnZXIgYSBrZXlkb3duIG9mIGtleUEgYmVmb3JlIHRoZSBwcmV2aW91cyBrZXlBIGtleXVwIGV2ZW50IGhhcyBiZWVuIGNhbGxlZC5cclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xyXG5pbXBvcnQgeyBUaW1lckxpc3RlbmVyIH0gZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UaW1lci5qcyc7XHJcbmltcG9ydCBSYW5kb20gZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmRvbS5qcyc7XHJcbmltcG9ydCB7IERpc3BsYXksIGdsb2JhbEtleVN0YXRlVHJhY2tlciwgS2V5Ym9hcmRVdGlscywgUERPTVV0aWxzLCBzY2VuZXJ5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG50eXBlIEtleXVwTGlzdGVuZXIgPSAoICgpID0+IHZvaWQgKSAmIHtcclxuICB0aW1lb3V0OiBUaW1lckxpc3RlbmVyO1xyXG59O1xyXG5cclxuXHJcbi8vIHVwcGVyY2FzZSBtYXR0ZXJzXHJcbmNvbnN0IGtleWJvYXJkVGVzdGluZ1NjaGVtYTogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0ge1xyXG4gIElOUFVUOiBbIC4uLktleWJvYXJkVXRpbHMuQVJST1dfS0VZUywgS2V5Ym9hcmRVdGlscy5LRVlfUEFHRV9VUCwgS2V5Ym9hcmRVdGlscy5LRVlfUEFHRV9ET1dOLFxyXG4gICAgS2V5Ym9hcmRVdGlscy5LRVlfSE9NRSwgS2V5Ym9hcmRVdGlscy5LRVlfRU5ELCBLZXlib2FyZFV0aWxzLktFWV9FTlRFUiwgS2V5Ym9hcmRVdGlscy5LRVlfU1BBQ0UgXSxcclxuICBESVY6IFsgLi4uS2V5Ym9hcmRVdGlscy5BUlJPV19LRVlTLCAuLi5LZXlib2FyZFV0aWxzLldBU0RfS0VZUyBdLFxyXG4gIFA6IFsgS2V5Ym9hcmRVdGlscy5LRVlfRVNDQVBFIF0sXHJcbiAgQlVUVE9OOiBbIEtleWJvYXJkVXRpbHMuS0VZX0VOVEVSLCBLZXlib2FyZFV0aWxzLktFWV9TUEFDRSBdXHJcbn07XHJcblxyXG5jb25zdCBBTExfS0VZUyA9IEtleWJvYXJkVXRpbHMuQUxMX0tFWVM7XHJcblxyXG5jb25zdCBNQVhfTVNfS0VZX0hPTERfRE9XTiA9IDEwMDtcclxuY29uc3QgTkVYVF9FTEVNRU5UX1RIUkVTSE9MRCA9IDAuMTtcclxuXHJcbmNvbnN0IERPX0tOT1dOX0tFWVNfVEhSRVNIT0xEID0gMC42MDsgLy8gZm9yIGtleWRvd24vdXAsIDYwIHBlcmNlbnQgb2YgdGhlIGV2ZW50c1xyXG5jb25zdCBDTElDS19FVkVOVF9USFJFU0hPTEQgPSBET19LTk9XTl9LRVlTX1RIUkVTSE9MRCArIDAuMTA7IC8vIDEwIHBlcmNlbnQgb2YgdGhlIGV2ZW50c1xyXG5cclxuY29uc3QgS0VZX0RPV04gPSAna2V5ZG93bic7XHJcbmNvbnN0IEtFWV9VUCA9ICdrZXl1cCc7XHJcblxyXG5jbGFzcyBLZXlib2FyZEZ1enplciB7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwbGF5OiBEaXNwbGF5O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmFuZG9tOiBSYW5kb207XHJcbiAgcHJpdmF0ZSByZWFkb25seSBudW1iZXJPZkNvbXBvbmVudHNUZXN0ZWQ6IG51bWJlcjtcclxuICBwcml2YXRlIGtleXVwTGlzdGVuZXJzOiBLZXl1cExpc3RlbmVyW107XHJcbiAgcHJpdmF0ZSBjdXJyZW50RWxlbWVudDogRWxlbWVudCB8IG51bGw7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZGlzcGxheTogRGlzcGxheSwgc2VlZDogbnVtYmVyICkge1xyXG5cclxuICAgIHRoaXMuZGlzcGxheSA9IGRpc3BsYXk7XHJcbiAgICB0aGlzLnJhbmRvbSA9IG5ldyBSYW5kb20oIHsgc2VlZDogc2VlZCB9ICk7XHJcbiAgICB0aGlzLm51bWJlck9mQ29tcG9uZW50c1Rlc3RlZCA9IDEwO1xyXG4gICAgdGhpcy5rZXl1cExpc3RlbmVycyA9IFtdO1xyXG4gICAgdGhpcy5jdXJyZW50RWxlbWVudCA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSYW5kb21seSBkZWNpZGUgaWYgd2Ugc2hvdWxkIGZvY3VzIHRoZSBuZXh0IGVsZW1lbnQsIG9yIHN0YXkgZm9jdXNlZCBvbiB0aGUgY3VycmVudCBlbGVtZW50XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjaG9vc2VOZXh0RWxlbWVudCgpOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5jdXJyZW50RWxlbWVudCA9PT0gbnVsbCApIHtcclxuICAgICAgdGhpcy5jdXJyZW50RWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5yYW5kb20ubmV4dERvdWJsZSgpIDwgTkVYVF9FTEVNRU5UX1RIUkVTSE9MRCApIHtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLktleWJvYXJkRnV6emVyICYmIHNjZW5lcnlMb2cuS2V5Ym9hcmRGdXp6ZXIoICdjaG9vc2luZyBuZXcgZWxlbWVudCcgKTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLktleWJvYXJkRnV6emVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgLy8gYmVmb3JlIHdlIGNoYW5nZSBmb2N1cyB0byB0aGUgbmV4dCBpdGVtLCBpbW1lZGlhdGVseSByZWxlYXNlIGFsbCBrZXlzIHRoYXQgd2VyZSBkb3duIG9uIHRoZSBhY3RpdmUgZWxlbWVudFxyXG4gICAgICB0aGlzLmNsZWFyTGlzdGVuZXJzKCk7XHJcbiAgICAgIGNvbnN0IG5leHRGb2N1c2FibGUgPSBQRE9NVXRpbHMuZ2V0UmFuZG9tRm9jdXNhYmxlKCB0aGlzLnJhbmRvbSApO1xyXG4gICAgICBuZXh0Rm9jdXNhYmxlLmZvY3VzKCk7XHJcbiAgICAgIHRoaXMuY3VycmVudEVsZW1lbnQgPSBuZXh0Rm9jdXNhYmxlO1xyXG5cclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLktleWJvYXJkRnV6emVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNsZWFyTGlzdGVuZXJzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5rZXl1cExpc3RlbmVycy5mb3JFYWNoKCBsaXN0ZW5lciA9PiB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBsaXN0ZW5lci50aW1lb3V0ID09PSAnZnVuY3Rpb24nLCAnc2hvdWxkIGhhdmUgYW4gYXR0YWNoZWQgdGltZW91dCcgKTtcclxuICAgICAgc3RlcFRpbWVyLmNsZWFyVGltZW91dCggbGlzdGVuZXIudGltZW91dCApO1xyXG4gICAgICBsaXN0ZW5lcigpO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5rZXl1cExpc3RlbmVycy5pbmNsdWRlcyggbGlzdGVuZXIgKSwgJ2NhbGxpbmcgbGlzdGVuZXIgc2hvdWxkIHJlbW92ZSBpdHNlbGYgZnJvbSB0aGUga2V5dXBMaXN0ZW5lcnMuJyApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB0cmlnZ2VyQ2xpY2tFdmVudCgpOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5LZXlib2FyZEZ1enplciAmJiBzY2VuZXJ5TG9nLktleWJvYXJkRnV6emVyKCAndHJpZ2dlcmluZyBjbGljaycgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5LZXlib2FyZEZ1enplciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBXZSdsbCBvbmx5IGV2ZXIgd2FudCB0byBzZW5kIGV2ZW50cyB0byB0aGUgYWN0aXZlRWxlbWVudCAoc28gdGhhdCBpdCdzIG5vdCBzdGFsZSksIHNlZVxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE0OTdcclxuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xyXG4gICAgZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIGVsZW1lbnQuY2xpY2soKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuS2V5Ym9hcmRGdXp6ZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWdnZXIgYSBrZXlkb3duL2tleXVwIHBhaXIuIFRoZSBrZXl1cCBpcyB0cmlnZ2VyZWQgd2l0aCBhIHRpbWVvdXQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0cmlnZ2VyS2V5RG93blVwRXZlbnRzKCBjb2RlOiBzdHJpbmcgKTogdm9pZCB7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLktleWJvYXJkRnV6emVyICYmIHNjZW5lcnlMb2cuS2V5Ym9hcmRGdXp6ZXIoIGB0cmlnZ2VyIGtleWRvd24vdXA6ICR7Y29kZX1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuS2V5Ym9hcmRGdXp6ZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gVE9ETzogc2NyZWVuIHJlYWRlcnMgbm9ybWFsbHkgdGFrZSBvdXIga2V5ZG93biBldmVudHMsIGJ1dCBtYXkgbm90IGhlcmUsIGlzIHRoZSBkaXNjcmVwYW5jeSBvaz9cclxuICAgIHRoaXMudHJpZ2dlckRPTUV2ZW50KCBLRVlfRE9XTiwgY29kZSApO1xyXG5cclxuICAgIGNvbnN0IHJhbmRvbVRpbWVGb3JLZXlwcmVzcyA9IHRoaXMucmFuZG9tLm5leHRJbnQoIE1BWF9NU19LRVlfSE9MRF9ET1dOICk7XHJcblxyXG4gICAgY29uc3Qga2V5dXBMaXN0ZW5lcjogS2V5dXBMaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgdGhpcy50cmlnZ2VyRE9NRXZlbnQoIEtFWV9VUCwgY29kZSApO1xyXG4gICAgICBpZiAoIHRoaXMua2V5dXBMaXN0ZW5lcnMuaW5jbHVkZXMoIGtleXVwTGlzdGVuZXIgKSApIHtcclxuICAgICAgICB0aGlzLmtleXVwTGlzdGVuZXJzLnNwbGljZSggdGhpcy5rZXl1cExpc3RlbmVycy5pbmRleE9mKCBrZXl1cExpc3RlbmVyICksIDEgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBrZXl1cExpc3RlbmVyLnRpbWVvdXQgPSBzdGVwVGltZXIuc2V0VGltZW91dCgga2V5dXBMaXN0ZW5lciwgcmFuZG9tVGltZUZvcktleXByZXNzID09PSBNQVhfTVNfS0VZX0hPTERfRE9XTiA/IDIwMDAgOiByYW5kb21UaW1lRm9yS2V5cHJlc3MgKTtcclxuICAgIHRoaXMua2V5dXBMaXN0ZW5lcnMucHVzaCgga2V5dXBMaXN0ZW5lciApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5LZXlib2FyZEZ1enplciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZ2dlciBhIGtleWRvd24va2V5dXAgcGFpciB3aXRoIGEgcmFuZG9tIEtleWJvYXJkRXZlbnQuY29kZS5cclxuICAgKi9cclxuICBwcml2YXRlIHRyaWdnZXJSYW5kb21LZXlEb3duVXBFdmVudHMoIGVsZW1lbnQ6IEVsZW1lbnQgKTogdm9pZCB7XHJcblxyXG4gICAgY29uc3QgcmFuZG9tQ29kZSA9IEFMTF9LRVlTWyBNYXRoLmZsb29yKCB0aGlzLnJhbmRvbS5uZXh0RG91YmxlKCkgKiAoIEFMTF9LRVlTLmxlbmd0aCAtIDEgKSApIF07XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLktleWJvYXJkRnV6emVyICYmIHNjZW5lcnlMb2cuS2V5Ym9hcmRGdXp6ZXIoIGB0cmlnZ2VyIHJhbmRvbSBrZXlkb3duL3VwOiAke3JhbmRvbUNvZGV9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLktleWJvYXJkRnV6emVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIHRoaXMudHJpZ2dlcktleURvd25VcEV2ZW50cyggcmFuZG9tQ29kZSApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5LZXlib2FyZEZ1enplciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSByYW5kb20gZXZlbnQgY3JlYXRvciB0aGF0IHNlbmRzIGtleWJvYXJkIGV2ZW50cy4gQmFzZWQgb24gdGhlIGlkZWEgb2YgZnV6ek1vdXNlLCBidXQgdG8gdGVzdC9zcGFtIGFjY2Vzc2liaWxpdHlcclxuICAgKiByZWxhdGVkIGtleWJvYXJkIG5hdmlnYXRpb24gYW5kIGFsdGVybmF0ZSBpbnB1dCBpbXBsZW1lbnRhdGlvbi5cclxuICAgKlxyXG4gICAqIFRPRE86IE5PVEU6IFJpZ2h0IG5vdyB0aGlzIGlzIGEgdmVyeSBleHBlcmltZW50YWwgaW1wbGVtZW50YXRpb24uIFRyZWFkIHdlYXJpbHlcclxuICAgKiBUT0RPOiBAcGFyYW0ga2V5Ym9hcmRQcmVzc2VzUGVyRm9jdXNlZEl0ZW0ge251bWJlcn0gLSBiYXNpY2FsbHkgd291bGQgYmUgdGhlIHNhbWUgYXMgZnV6elJhdGUsIGJ1dCBoYW5kbGluZ1xyXG4gICAqIFRPRE86ICAgICB0aGUga2V5ZG93biBldmVudHMgZm9yIGEgZm9jdXNlZCBpdGVtXHJcbiAgICovXHJcbiAgcHVibGljIGZ1enpCb2FyZEV2ZW50cyggZnV6elJhdGU6IG51bWJlciApOiB2b2lkIHtcclxuXHJcbiAgICBpZiAoIHRoaXMuZGlzcGxheSAmJiB0aGlzLmRpc3BsYXkuX2lucHV0ICYmIHRoaXMuZGlzcGxheS5faW5wdXQucGRvbVBvaW50ZXIgKSB7XHJcbiAgICAgIGNvbnN0IHBkb21Qb2ludGVyID0gdGhpcy5kaXNwbGF5Ll9pbnB1dC5wZG9tUG9pbnRlcjtcclxuICAgICAgaWYgKCBwZG9tUG9pbnRlciAmJiAhcGRvbVBvaW50ZXIuYmxvY2tUcnVzdGVkRXZlbnRzICkge1xyXG4gICAgICAgIHBkb21Qb2ludGVyLmJsb2NrVHJ1c3RlZEV2ZW50cyA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm51bWJlck9mQ29tcG9uZW50c1Rlc3RlZDsgaSsrICkge1xyXG5cclxuICAgICAgLy8gZmluZCBhIGZvY3VzIGEgcmFuZG9tIGVsZW1lbnRcclxuICAgICAgdGhpcy5jaG9vc2VOZXh0RWxlbWVudCgpO1xyXG5cclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZnV6elJhdGUgLyB0aGlzLm51bWJlck9mQ29tcG9uZW50c1Rlc3RlZDsgaSsrICkge1xyXG5cclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuS2V5Ym9hcmRGdXp6ZXIgJiYgc2NlbmVyeUxvZy5LZXlib2FyZEZ1enplciggYG1haW4gbG9vcCwgaT0ke2l9YCApO1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5LZXlib2FyZEZ1enplciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAgICAgLy8gZ2V0IGFjdGl2ZSBlbGVtZW50LCBmb2N1cyBtaWdodCBoYXZlIGNoYW5nZWQgaW4gdGhlIGxhc3QgcHJlc3NcclxuICAgICAgICBjb25zdCBlbGVtZW50V2l0aEZvY3VzID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcclxuXHJcbiAgICAgICAgaWYgKCBlbGVtZW50V2l0aEZvY3VzICYmIGtleWJvYXJkVGVzdGluZ1NjaGVtYVsgZWxlbWVudFdpdGhGb2N1cy50YWdOYW1lLnRvVXBwZXJDYXNlKCkgXSApIHtcclxuXHJcbiAgICAgICAgICBjb25zdCByYW5kb21OdW1iZXIgPSB0aGlzLnJhbmRvbS5uZXh0RG91YmxlKCk7XHJcbiAgICAgICAgICBpZiAoIHJhbmRvbU51bWJlciA8IERPX0tOT1dOX0tFWVNfVEhSRVNIT0xEICkge1xyXG4gICAgICAgICAgICBjb25zdCBjb2RlVmFsdWVzID0ga2V5Ym9hcmRUZXN0aW5nU2NoZW1hWyBlbGVtZW50V2l0aEZvY3VzLnRhZ05hbWUgXTtcclxuICAgICAgICAgICAgY29uc3QgY29kZSA9IHRoaXMucmFuZG9tLnNhbXBsZSggY29kZVZhbHVlcyApO1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJLZXlEb3duVXBFdmVudHMoIGNvZGUgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCByYW5kb21OdW1iZXIgPCBDTElDS19FVkVOVF9USFJFU0hPTEQgKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlckNsaWNrRXZlbnQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJSYW5kb21LZXlEb3duVXBFdmVudHMoIGVsZW1lbnRXaXRoRm9jdXMgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBlbGVtZW50V2l0aEZvY3VzICYmIHRoaXMudHJpZ2dlclJhbmRvbUtleURvd25VcEV2ZW50cyggZWxlbWVudFdpdGhGb2N1cyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBUT0RPOiBXaGF0IGFib3V0IG90aGVyIHR5cGVzIG9mIGV2ZW50cywgbm90IGp1c3Qga2V5ZG93bi9rZXl1cD8/IT8hXHJcbiAgICAgICAgLy8gVE9ETzogd2hhdCBhYm91dCBhcHBsaWNhdGlvbiByb2xlIGVsZW1lbnRzXHJcblxyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5LZXlib2FyZEZ1enplciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUYWtlbiBmcm9tIGV4YW1wbGUgaW4gaHR0cDovL291dHB1dC5qc2Jpbi5jb20vYXdlbmFxLzMsXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0cmlnZ2VyRE9NRXZlbnQoIGV2ZW50OiBzdHJpbmcsIGNvZGU6IHN0cmluZyApOiB2b2lkIHtcclxuICAgIC8vIFdlJ2xsIG9ubHkgZXZlciB3YW50IHRvIHNlbmQgZXZlbnRzIHRvIHRoZSBhY3RpdmVFbGVtZW50IChzbyB0aGF0IGl0J3Mgbm90IHN0YWxlKSwgc2VlXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTQ5N1xyXG4gICAgaWYgKCBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICkge1xyXG4gICAgICBjb25zdCBldmVudE9iaiA9IG5ldyBLZXlib2FyZEV2ZW50KCBldmVudCwge1xyXG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXHJcbiAgICAgICAgY29kZTogY29kZSxcclxuICAgICAgICBzaGlmdEtleTogZ2xvYmFsS2V5U3RhdGVUcmFja2VyLnNoaWZ0S2V5RG93bixcclxuICAgICAgICBhbHRLZXk6IGdsb2JhbEtleVN0YXRlVHJhY2tlci5hbHRLZXlEb3duLFxyXG4gICAgICAgIGN0cmxLZXk6IGdsb2JhbEtleVN0YXRlVHJhY2tlci5jdHJsS2V5RG93blxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmRpc3BhdGNoRXZlbnQoIGV2ZW50T2JqICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnS2V5Ym9hcmRGdXp6ZXInLCBLZXlib2FyZEZ1enplciApO1xyXG5leHBvcnQgZGVmYXVsdCBLZXlib2FyZEZ1enplcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sK0JBQStCO0FBRXJELE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsU0FBa0JDLHFCQUFxQixFQUFFQyxhQUFhLEVBQUVDLFNBQVMsRUFBRUMsT0FBTyxRQUFRLGVBQWU7QUFPakc7QUFDQSxNQUFNQyxxQkFBK0MsR0FBRztFQUN0REMsS0FBSyxFQUFFLENBQUUsR0FBR0osYUFBYSxDQUFDSyxVQUFVLEVBQUVMLGFBQWEsQ0FBQ00sV0FBVyxFQUFFTixhQUFhLENBQUNPLGFBQWEsRUFDMUZQLGFBQWEsQ0FBQ1EsUUFBUSxFQUFFUixhQUFhLENBQUNTLE9BQU8sRUFBRVQsYUFBYSxDQUFDVSxTQUFTLEVBQUVWLGFBQWEsQ0FBQ1csU0FBUyxDQUFFO0VBQ25HQyxHQUFHLEVBQUUsQ0FBRSxHQUFHWixhQUFhLENBQUNLLFVBQVUsRUFBRSxHQUFHTCxhQUFhLENBQUNhLFNBQVMsQ0FBRTtFQUNoRUMsQ0FBQyxFQUFFLENBQUVkLGFBQWEsQ0FBQ2UsVUFBVSxDQUFFO0VBQy9CQyxNQUFNLEVBQUUsQ0FBRWhCLGFBQWEsQ0FBQ1UsU0FB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