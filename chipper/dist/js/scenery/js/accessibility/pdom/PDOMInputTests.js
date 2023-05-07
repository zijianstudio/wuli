// Copyright 2018-2022, University of Colorado Boulder

/**
 * Tests related to ParallelDOM input and events.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import Display from '../../display/Display.js';
import Node from '../../nodes/Node.js';
import Rectangle from '../../nodes/Rectangle.js';
import globalKeyStateTracker from '../globalKeyStateTracker.js';
import KeyboardUtils from '../KeyboardUtils.js';

// constants
const TEST_LABEL = 'Test Label';
const TEST_LABEL_2 = 'Test Label 2';
QUnit.module('PDOMInput');

/**
 * Set up a test for accessible input by attaching a root node to a display and initializing events.
 * @param {Display} display
 */
const beforeTest = display => {
  display.initializeEvents();
  document.body.appendChild(display.domElement);
};

/**
 * Clean up a test by detaching events and removing the element from the DOM so that it doesn't interfere
 * with QUnit UI.
 * @param {Display} display
 */
const afterTest = display => {
  document.body.removeChild(display.domElement);
  display.dispose();
};
const dispatchEvent = (domElement, event) => {
  const Constructor = event.startsWith('key') ? window.KeyboardEvent : window.Event;
  domElement.dispatchEvent(new Constructor(event, {
    bubbles: true,
    // that is vital to all that scenery events hold near and dear to their hearts.
    code: KeyboardUtils.KEY_TAB
  }));
};

// create a fake DOM event and delegate to an HTMLElement
// TODO: Can this replace the dispatchEvent function above? EXTRA_TODO use KeyboardFuzzer.triggerDOMEvent as a guide to rewrite this.
const triggerDOMEvent = (event, element, key, options) => {
  options = merge({
    // secondary target for the event, behavior depends on event type
    relatedTarget: null,
    // Does the event bubble? Almost all scenery PDOM events should.
    bubbles: true,
    // Is the event cancelable? Most are, this should generally be true.
    cancelable: true,
    // Optional code for the event, most relevant if the eventType is window.KeyboardEvent.
    code: key,
    // {function} Constructor for the event.
    eventConstructor: window.Event
  }, options);
  const eventToDispatch = new options.eventConstructor(event, options);
  element.dispatchEvent ? element.dispatchEvent(eventToDispatch) : element.fireEvent(`on${eventToDispatch}`, eventToDispatch);
};
QUnit.test('focusin/focusout (focus/blur)', assert => {
  const rootNode = new Node({
    tagName: 'div'
  });
  const display = new Display(rootNode);
  beforeTest(display);
  const a = new Rectangle(0, 0, 20, 20, {
    tagName: 'button'
  });
  const b = new Rectangle(0, 0, 20, 20, {
    tagName: 'button'
  });
  const c = new Rectangle(0, 0, 20, 20, {
    tagName: 'button'
  });

  // rootNode
  //   /  \
  //  a    b
  //        \
  //         c
  rootNode.addChild(a);
  rootNode.addChild(b);
  b.addChild(c);
  let aGotFocus = false;
  let aLostFocus = false;
  let bGotFocus = false;
  let bGotBlur = false;
  let bGotFocusIn = false;
  let bGotFocusOut = false;
  let cGotFocusIn = false;
  let cGotFocusOut = false;
  const resetFocusVariables = () => {
    aGotFocus = false;
    aLostFocus = false;
    bGotFocus = false;
    bGotBlur = false;
    bGotFocusIn = false;
    bGotFocusOut = false;
    cGotFocusIn = false;
    cGotFocusOut = false;
  };
  a.addInputListener({
    focus() {
      aGotFocus = true;
    },
    blur() {
      aLostFocus = true;
    }
  });
  b.addInputListener({
    focus() {
      bGotFocus = true;
    },
    blur() {
      bGotBlur = true;
    },
    focusin() {
      bGotFocusIn = true;
    },
    focusout() {
      bGotFocusOut = true;
    }
  });
  c.addInputListener({
    focusin() {
      cGotFocusIn = true;
    },
    focusout() {
      cGotFocusOut = true;
    }
  });
  a.focus();
  assert.ok(aGotFocus, 'a should have been focused');
  assert.ok(!aLostFocus, 'a should not blur');
  resetFocusVariables();
  b.focus();
  assert.ok(bGotFocus, 'b should have been focused');
  assert.ok(aLostFocus, 'a should have lost focused');
  resetFocusVariables();
  c.focus();
  assert.ok(!bGotFocus, 'b should not receive focus (doesnt bubble)');
  assert.ok(cGotFocusIn, 'c should receive a focusin');
  assert.ok(bGotFocusIn, 'b should receive a focusin (from bubbling)');
  resetFocusVariables();
  c.blur();
  assert.ok(!bGotBlur, 'b should not receive a blur event (doesnt bubble)');
  assert.ok(cGotFocusOut, 'c should have received a focusout');
  assert.ok(bGotFocusOut, 'c should have received a focusout (from bubbling)');
  afterTest(display);
});
QUnit.test('tab focusin/focusout', assert => {
  const rootNode = new Node({
    tagName: 'div'
  });
  const display = new Display(rootNode);
  beforeTest(display);
  const buttonA = new Rectangle(0, 0, 5, 5, {
    tagName: 'button'
  });
  const buttonB = new Rectangle(0, 0, 5, 5, {
    tagName: 'button'
  });
  const buttonC = new Rectangle(0, 0, 5, 5, {
    tagName: 'button'
  });
  rootNode.children = [buttonA, buttonB, buttonC];
  const aPrimarySibling = buttonA.pdomInstances[0].peer.primarySibling;
  const bPrimarySibling = buttonB.pdomInstances[0].peer.primarySibling;

  // test that a blur listener on a node overides the "tab" like navigation moving focus to the next element
  buttonA.focus();
  assert.ok(buttonA.focused, 'butonA has focus initially');
  const overrideFocusListener = {
    blur: event => {
      buttonC.focus();
    }
  };
  buttonA.addInputListener(overrideFocusListener);

  // mimic a "tab" interaction, attempting to move focus to the next element
  triggerDOMEvent('focusout', aPrimarySibling, KeyboardUtils.KEY_TAB, {
    relatedTarget: bPrimarySibling
  });

  // the blur listener on buttonA should override the movement of focus on "tab" like interaction
  assert.ok(buttonC.focused, 'butonC now has focus');

  // test that a blur listener can prevent focus from moving to another element after "tab" like navigation
  buttonA.removeInputListener(overrideFocusListener);
  buttonA.focus();
  const makeUnfocusableListener = {
    blur: event => {
      buttonB.focusable = false;
    }
  };
  buttonA.addInputListener(makeUnfocusableListener);

  // mimic a tab press by moving focus to buttonB - this will automatically have the correct `relatedTarget` for
  // the `blur` event on buttonA because focus is moving from buttonA to buttonB.
  buttonB.focus();

  // the blur listener on buttonA should have made the default element unfocusable
  assert.ok(!buttonB.focused, 'buttonB cannot receive focus due to blur listener on buttonA');
  assert.ok(document.activeElement !== bPrimarySibling, 'element buttonB cannot receive focus due to blur listener on buttonA');
  assert.ok(!buttonA.focused, 'buttonA cannot keep focus when tabbing away, even if buttonB is not focusable');

  // cleanup for the next test
  buttonA.removeInputListener(makeUnfocusableListener);
  buttonB.focusable = true;
  buttonA.focus();
  const causeRedrawListener = {
    blur: event => {
      buttonB.focusable = true;
      buttonB.tagName = 'p';
    }
  };
  buttonA.addInputListener(causeRedrawListener);
  buttonB.focus();

  // the blur listener on buttonA will cause a full redraw of buttonB in the PDOM, but buttonB should receive focus
  assert.ok(buttonB.focused, 'buttonB should still have focus after a full redraw due to a blur listener');

  // cleanup
  buttonA.removeInputListener(causeRedrawListener);
  buttonA.focusable = true;
  buttonB.tagName = 'button';

  // sanity checks manipulating focus, and added because we were seeing very strange things while working on
  // https://github.com/phetsims/scenery/issues/1296, but these should definitely pass
  buttonA.focus();
  assert.ok(buttonA.focused, 'buttonA does not have focus after a basic focus call?');
  buttonB.blur();
  assert.ok(buttonA.focused, 'Blurring a non-focussed element should not remove focus from a non-focused element');
  afterTest(display);
});
QUnit.test('click', assert => {
  const rootNode = new Node({
    tagName: 'div'
  });
  const display = new Display(rootNode);
  beforeTest(display);
  const a = new Rectangle(0, 0, 20, 20, {
    tagName: 'button'
  });
  let gotFocus = false;
  let gotClick = false;
  let aClickCounter = 0;
  rootNode.addChild(a);
  a.addInputListener({
    focus() {
      gotFocus = true;
    },
    click() {
      gotClick = true;
      aClickCounter++;
    },
    blur() {
      gotFocus = false;
    }
  });
  a.pdomInstances[0].peer.primarySibling.focus();
  assert.ok(gotFocus && !gotClick, 'focus first');
  a.pdomInstances[0].peer.primarySibling.click(); // this works because it's a button
  assert.ok(gotClick && gotFocus && aClickCounter === 1, 'a should have been clicked');
  let bClickCounter = 0;
  const b = new Rectangle(0, 0, 20, 20, {
    tagName: 'button'
  });
  b.addInputListener({
    click() {
      bClickCounter++;
    }
  });
  a.addChild(b);
  b.pdomInstances[0].peer.primarySibling.focus();
  b.pdomInstances[0].peer.primarySibling.click();
  assert.ok(bClickCounter === 1 && aClickCounter === 2, 'a should have been clicked with b');
  a.pdomInstances[0].peer.primarySibling.click();
  assert.ok(bClickCounter === 1 && aClickCounter === 3, 'b still should not have been clicked.');

  // create a node
  const a1 = new Node({
    tagName: 'button'
  });
  a.addChild(a1);
  assert.ok(a1.inputListeners.length === 0, 'no input accessible listeners on instantiation');
  assert.ok(a1.labelContent === null, 'no label on instantiation');

  // add a listener
  const listener = {
    click() {
      a1.labelContent = TEST_LABEL;
    }
  };
  a1.addInputListener(listener);
  assert.ok(a1.inputListeners.length === 1, 'accessible listener added');

  // verify added with hasInputListener
  assert.ok(a1.hasInputListener(listener) === true, 'found with hasInputListener');

  // fire the event
  a1.pdomInstances[0].peer.primarySibling.click();
  assert.ok(a1.labelContent === TEST_LABEL, 'click fired, label set');
  const c = new Rectangle(0, 0, 20, 20, {
    tagName: 'button'
  });
  const d = new Rectangle(0, 0, 20, 20, {
    tagName: 'button'
  });
  const e = new Rectangle(0, 0, 20, 20, {
    tagName: 'button'
  });
  let cClickCount = 0;
  let dClickCount = 0;
  let eClickCount = 0;
  rootNode.addChild(c);
  c.addChild(d);
  d.addChild(e);
  c.addInputListener({
    click() {
      cClickCount++;
    }
  });
  d.addInputListener({
    click() {
      dClickCount++;
    }
  });
  e.addInputListener({
    click() {
      eClickCount++;
    }
  });
  e.pdomInstances[0].peer.primarySibling.click();
  assert.ok(cClickCount === dClickCount && cClickCount === eClickCount && cClickCount === 1, 'click should have bubbled to all parents');
  d.pdomInstances[0].peer.primarySibling.click();
  assert.ok(cClickCount === 2 && dClickCount === 2 && eClickCount === 1, 'd should not trigger click on e');
  c.pdomInstances[0].peer.primarySibling.click();
  assert.ok(cClickCount === 3 && dClickCount === 2 && eClickCount === 1, 'c should not trigger click on d or e');

  // reset click count
  cClickCount = 0;
  dClickCount = 0;
  eClickCount = 0;
  c.pdomOrder = [d, e];
  e.pdomInstances[0].peer.primarySibling.click();
  assert.ok(cClickCount === 1 && dClickCount === 0 && eClickCount === 1, 'pdomOrder means click should bypass d');
  c.pdomInstances[0].peer.primarySibling.click();
  assert.ok(cClickCount === 2 && dClickCount === 0 && eClickCount === 1, 'click c should not effect e or d.');
  d.pdomInstances[0].peer.primarySibling.click();
  assert.ok(cClickCount === 3 && dClickCount === 1 && eClickCount === 1, 'click d should not effect e.');

  // reset click count
  cClickCount = 0;
  dClickCount = 0;
  eClickCount = 0;
  const f = new Rectangle(0, 0, 20, 20, {
    tagName: 'button'
  });
  let fClickCount = 0;
  f.addInputListener({
    click() {
      fClickCount++;
    }
  });
  e.addChild(f);

  // so its a chain in the scene graph c->d->e->f

  d.pdomOrder = [f];

  /* accessible instance tree:
       c
      / \
      d  e
      |
      f
  */

  f.pdomInstances[0].peer.primarySibling.click();
  assert.ok(cClickCount === 1 && dClickCount === 1 && eClickCount === 0 && fClickCount === 1, 'click d should not effect e.');
  afterTest(display);
});
QUnit.test('click extra', assert => {
  // create a node
  const a1 = new Node({
    tagName: 'button'
  });
  const root = new Node({
    tagName: 'div'
  });
  const display = new Display(root);
  beforeTest(display);
  root.addChild(a1);
  assert.ok(a1.inputListeners.length === 0, 'no input accessible listeners on instantiation');
  assert.ok(a1.labelContent === null, 'no label on instantiation');

  // add a listener
  const listener = {
    click: () => {
      a1.labelContent = TEST_LABEL;
    }
  };
  a1.addInputListener(listener);
  assert.ok(a1.inputListeners.length === 1, 'accessible listener added');

  // verify added with hasInputListener
  assert.ok(a1.hasInputListener(listener) === true, 'found with hasInputListener');

  // fire the event
  a1.pdomInstances[0].peer.primarySibling.click();
  assert.ok(a1.labelContent === TEST_LABEL, 'click fired, label set');

  // remove the listener
  a1.removeInputListener(listener);
  assert.ok(a1.inputListeners.length === 0, 'accessible listener removed');

  // verify removed with hasInputListener
  assert.ok(a1.hasInputListener(listener) === false, 'not found with hasInputListener');

  // make sure event listener was also removed from DOM element
  // click should not change the label
  a1.labelContent = TEST_LABEL_2;
  assert.ok(a1.labelContent === TEST_LABEL_2, 'before click');

  // setting the label redrew the pdom, so get a reference to the new dom element.
  a1.pdomInstances[0].peer.primarySibling.click();
  assert.ok(a1.labelContent === TEST_LABEL_2, 'click should not change label');

  // verify disposal removes accessible input listeners
  a1.addInputListener(listener);
  a1.dispose();

  // TODO: Since converting to use Node.inputListeners, we can't assume this anymore
  // assert.ok( a1.hasInputListener( listener ) === false, 'disposal removed accessible input listeners' );

  afterTest(display);
});
QUnit.test('input', assert => {
  const rootNode = new Node({
    tagName: 'div'
  });
  const display = new Display(rootNode);
  beforeTest(display);
  const a = new Rectangle(0, 0, 20, 20, {
    tagName: 'input',
    inputType: 'text'
  });
  let gotFocus = false;
  let gotInput = false;
  rootNode.addChild(a);
  a.addInputListener({
    focus() {
      gotFocus = true;
    },
    input() {
      gotInput = true;
    },
    blur() {
      gotFocus = false;
    }
  });
  a.pdomInstances[0].peer.primarySibling.focus();
  assert.ok(gotFocus && !gotInput, 'focus first');
  dispatchEvent(a.pdomInstances[0].peer.primarySibling, 'input');
  assert.ok(gotInput && gotFocus, 'a should have been an input');
  afterTest(display);
});
QUnit.test('change', assert => {
  const rootNode = new Node({
    tagName: 'div'
  });
  const display = new Display(rootNode);
  beforeTest(display);
  const a = new Rectangle(0, 0, 20, 20, {
    tagName: 'input',
    inputType: 'range'
  });
  let gotFocus = false;
  let gotChange = false;
  rootNode.addChild(a);
  a.addInputListener({
    focus() {
      gotFocus = true;
    },
    change() {
      gotChange = true;
    },
    blur() {
      gotFocus = false;
    }
  });
  a.pdomInstances[0].peer.primarySibling.focus();
  assert.ok(gotFocus && !gotChange, 'focus first');
  dispatchEvent(a.pdomInstances[0].peer.primarySibling, 'change');
  assert.ok(gotChange && gotFocus, 'a should have been an input');
  afterTest(display);
});
QUnit.test('keydown/keyup', assert => {
  const rootNode = new Node({
    tagName: 'div'
  });
  const display = new Display(rootNode);
  beforeTest(display);
  const a = new Rectangle(0, 0, 20, 20, {
    tagName: 'input',
    inputType: 'text'
  });
  let gotFocus = false;
  let gotKeydown = false;
  let gotKeyup = false;
  rootNode.addChild(a);
  a.addInputListener({
    focus() {
      gotFocus = true;
    },
    keydown() {
      gotKeydown = true;
    },
    keyup() {
      gotKeyup = true;
    },
    blur() {
      gotFocus = false;
    }
  });
  a.pdomInstances[0].peer.primarySibling.focus();
  assert.ok(gotFocus && !gotKeydown, 'focus first');
  dispatchEvent(a.pdomInstances[0].peer.primarySibling, 'keydown');
  assert.ok(gotKeydown && gotFocus, 'a should have had keydown');
  dispatchEvent(a.pdomInstances[0].peer.primarySibling, 'keyup');
  assert.ok(gotKeydown && gotKeyup && gotFocus, 'a should have had keyup');
  afterTest(display);
});
QUnit.test('Global KeyStateTracker tests', assert => {
  const rootNode = new Node({
    tagName: 'div'
  });
  const display = new Display(rootNode);
  beforeTest(display);
  const a = new Node({
    tagName: 'button'
  });
  const b = new Node({
    tagName: 'button'
  });
  const c = new Node({
    tagName: 'button'
  });
  const d = new Node({
    tagName: 'button'
  });
  a.addChild(b);
  b.addChild(c);
  c.addChild(d);
  rootNode.addChild(a);
  const dPrimarySibling = d.pdomInstances[0].peer.primarySibling;
  triggerDOMEvent('keydown', dPrimarySibling, KeyboardUtils.KEY_RIGHT_ARROW, {
    eventConstructor: window.KeyboardEvent
  });
  assert.ok(globalKeyStateTracker.isKeyDown(KeyboardUtils.KEY_RIGHT_ARROW), 'global keyStateTracker should be updated with right arrow key down');
  afterTest(display);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkRpc3BsYXkiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiZ2xvYmFsS2V5U3RhdGVUcmFja2VyIiwiS2V5Ym9hcmRVdGlscyIsIlRFU1RfTEFCRUwiLCJURVNUX0xBQkVMXzIiLCJRVW5pdCIsIm1vZHVsZSIsImJlZm9yZVRlc3QiLCJkaXNwbGF5IiwiaW5pdGlhbGl6ZUV2ZW50cyIsImRvY3VtZW50IiwiYm9keSIsImFwcGVuZENoaWxkIiwiZG9tRWxlbWVudCIsImFmdGVyVGVzdCIsInJlbW92ZUNoaWxkIiwiZGlzcG9zZSIsImRpc3BhdGNoRXZlbnQiLCJldmVudCIsIkNvbnN0cnVjdG9yIiwic3RhcnRzV2l0aCIsIndpbmRvdyIsIktleWJvYXJkRXZlbnQiLCJFdmVudCIsImJ1YmJsZXMiLCJjb2RlIiwiS0VZX1RBQiIsInRyaWdnZXJET01FdmVudCIsImVsZW1lbnQiLCJrZXkiLCJvcHRpb25zIiwicmVsYXRlZFRhcmdldCIsImNhbmNlbGFibGUiLCJldmVudENvbnN0cnVjdG9yIiwiZXZlbnRUb0Rpc3BhdGNoIiwiZmlyZUV2ZW50IiwidGVzdCIsImFzc2VydCIsInJvb3ROb2RlIiwidGFnTmFtZSIsImEiLCJiIiwiYyIsImFkZENoaWxkIiwiYUdvdEZvY3VzIiwiYUxvc3RGb2N1cyIsImJHb3RGb2N1cyIsImJHb3RCbHVyIiwiYkdvdEZvY3VzSW4iLCJiR290Rm9jdXNPdXQiLCJjR290Rm9jdXNJbiIsImNHb3RGb2N1c091dCIsInJlc2V0Rm9jdXNWYXJpYWJsZXMiLCJhZGRJbnB1dExpc3RlbmVyIiwiZm9jdXMiLCJibHVyIiwiZm9jdXNpbiIsImZvY3Vzb3V0Iiwib2siLCJidXR0b25BIiwiYnV0dG9uQiIsImJ1dHRvbkMiLCJjaGlsZHJlbiIsImFQcmltYXJ5U2libGluZyIsInBkb21JbnN0YW5jZXMiLCJwZWVyIiwicHJpbWFyeVNpYmxpbmciLCJiUHJpbWFyeVNpYmxpbmciLCJmb2N1c2VkIiwib3ZlcnJpZGVGb2N1c0xpc3RlbmVyIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsIm1ha2VVbmZvY3VzYWJsZUxpc3RlbmVyIiwiZm9jdXNhYmxlIiwiYWN0aXZlRWxlbWVudCIsImNhdXNlUmVkcmF3TGlzdGVuZXIiLCJnb3RGb2N1cyIsImdvdENsaWNrIiwiYUNsaWNrQ291bnRlciIsImNsaWNrIiwiYkNsaWNrQ291bnRlciIsImExIiwiaW5wdXRMaXN0ZW5lcnMiLCJsZW5ndGgiLCJsYWJlbENvbnRlbnQiLCJsaXN0ZW5lciIsImhhc0lucHV0TGlzdGVuZXIiLCJkIiwiZSIsImNDbGlja0NvdW50IiwiZENsaWNrQ291bnQiLCJlQ2xpY2tDb3VudCIsInBkb21PcmRlciIsImYiLCJmQ2xpY2tDb3VudCIsInJvb3QiLCJpbnB1dFR5cGUiLCJnb3RJbnB1dCIsImlucHV0IiwiZ290Q2hhbmdlIiwiY2hhbmdlIiwiZ290S2V5ZG93biIsImdvdEtleXVwIiwia2V5ZG93biIsImtleXVwIiwiZFByaW1hcnlTaWJsaW5nIiwiS0VZX1JJR0hUX0FSUk9XIiwiaXNLZXlEb3duIl0sInNvdXJjZXMiOlsiUERPTUlucHV0VGVzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGVzdHMgcmVsYXRlZCB0byBQYXJhbGxlbERPTSBpbnB1dCBhbmQgZXZlbnRzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgRGlzcGxheSBmcm9tICcuLi8uLi9kaXNwbGF5L0Rpc3BsYXkuanMnO1xyXG5pbXBvcnQgTm9kZSBmcm9tICcuLi8uLi9ub2Rlcy9Ob2RlLmpzJztcclxuaW1wb3J0IFJlY3RhbmdsZSBmcm9tICcuLi8uLi9ub2Rlcy9SZWN0YW5nbGUuanMnO1xyXG5pbXBvcnQgZ2xvYmFsS2V5U3RhdGVUcmFja2VyIGZyb20gJy4uL2dsb2JhbEtleVN0YXRlVHJhY2tlci5qcyc7XHJcbmltcG9ydCBLZXlib2FyZFV0aWxzIGZyb20gJy4uL0tleWJvYXJkVXRpbHMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRFU1RfTEFCRUwgPSAnVGVzdCBMYWJlbCc7XHJcbmNvbnN0IFRFU1RfTEFCRUxfMiA9ICdUZXN0IExhYmVsIDInO1xyXG5cclxuUVVuaXQubW9kdWxlKCAnUERPTUlucHV0JyApO1xyXG5cclxuLyoqXHJcbiAqIFNldCB1cCBhIHRlc3QgZm9yIGFjY2Vzc2libGUgaW5wdXQgYnkgYXR0YWNoaW5nIGEgcm9vdCBub2RlIHRvIGEgZGlzcGxheSBhbmQgaW5pdGlhbGl6aW5nIGV2ZW50cy5cclxuICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XHJcbiAqL1xyXG5jb25zdCBiZWZvcmVUZXN0ID0gZGlzcGxheSA9PiB7XHJcbiAgZGlzcGxheS5pbml0aWFsaXplRXZlbnRzKCk7XHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2xlYW4gdXAgYSB0ZXN0IGJ5IGRldGFjaGluZyBldmVudHMgYW5kIHJlbW92aW5nIHRoZSBlbGVtZW50IGZyb20gdGhlIERPTSBzbyB0aGF0IGl0IGRvZXNuJ3QgaW50ZXJmZXJlXHJcbiAqIHdpdGggUVVuaXQgVUkuXHJcbiAqIEBwYXJhbSB7RGlzcGxheX0gZGlzcGxheVxyXG4gKi9cclxuY29uc3QgYWZ0ZXJUZXN0ID0gZGlzcGxheSA9PiB7XHJcbiAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XHJcbiAgZGlzcGxheS5kaXNwb3NlKCk7XHJcbn07XHJcblxyXG5jb25zdCBkaXNwYXRjaEV2ZW50ID0gKCBkb21FbGVtZW50LCBldmVudCApID0+IHtcclxuICBjb25zdCBDb25zdHJ1Y3RvciA9IGV2ZW50LnN0YXJ0c1dpdGgoICdrZXknICkgPyB3aW5kb3cuS2V5Ym9hcmRFdmVudCA6IHdpbmRvdy5FdmVudDtcclxuICBkb21FbGVtZW50LmRpc3BhdGNoRXZlbnQoIG5ldyBDb25zdHJ1Y3RvciggZXZlbnQsIHtcclxuICAgIGJ1YmJsZXM6IHRydWUsIC8vIHRoYXQgaXMgdml0YWwgdG8gYWxsIHRoYXQgc2NlbmVyeSBldmVudHMgaG9sZCBuZWFyIGFuZCBkZWFyIHRvIHRoZWlyIGhlYXJ0cy5cclxuICAgIGNvZGU6IEtleWJvYXJkVXRpbHMuS0VZX1RBQlxyXG4gIH0gKSApO1xyXG59O1xyXG5cclxuLy8gY3JlYXRlIGEgZmFrZSBET00gZXZlbnQgYW5kIGRlbGVnYXRlIHRvIGFuIEhUTUxFbGVtZW50XHJcbi8vIFRPRE86IENhbiB0aGlzIHJlcGxhY2UgdGhlIGRpc3BhdGNoRXZlbnQgZnVuY3Rpb24gYWJvdmU/IEVYVFJBX1RPRE8gdXNlIEtleWJvYXJkRnV6emVyLnRyaWdnZXJET01FdmVudCBhcyBhIGd1aWRlIHRvIHJld3JpdGUgdGhpcy5cclxuY29uc3QgdHJpZ2dlckRPTUV2ZW50ID0gKCBldmVudCwgZWxlbWVudCwga2V5LCBvcHRpb25zICkgPT4ge1xyXG5cclxuICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAvLyBzZWNvbmRhcnkgdGFyZ2V0IGZvciB0aGUgZXZlbnQsIGJlaGF2aW9yIGRlcGVuZHMgb24gZXZlbnQgdHlwZVxyXG4gICAgcmVsYXRlZFRhcmdldDogbnVsbCxcclxuXHJcbiAgICAvLyBEb2VzIHRoZSBldmVudCBidWJibGU/IEFsbW9zdCBhbGwgc2NlbmVyeSBQRE9NIGV2ZW50cyBzaG91bGQuXHJcbiAgICBidWJibGVzOiB0cnVlLFxyXG5cclxuICAgIC8vIElzIHRoZSBldmVudCBjYW5jZWxhYmxlPyBNb3N0IGFyZSwgdGhpcyBzaG91bGQgZ2VuZXJhbGx5IGJlIHRydWUuXHJcbiAgICBjYW5jZWxhYmxlOiB0cnVlLFxyXG5cclxuICAgIC8vIE9wdGlvbmFsIGNvZGUgZm9yIHRoZSBldmVudCwgbW9zdCByZWxldmFudCBpZiB0aGUgZXZlbnRUeXBlIGlzIHdpbmRvdy5LZXlib2FyZEV2ZW50LlxyXG4gICAgY29kZToga2V5LFxyXG5cclxuICAgIC8vIHtmdW5jdGlvbn0gQ29uc3RydWN0b3IgZm9yIHRoZSBldmVudC5cclxuICAgIGV2ZW50Q29uc3RydWN0b3I6IHdpbmRvdy5FdmVudFxyXG4gIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgY29uc3QgZXZlbnRUb0Rpc3BhdGNoID0gbmV3IG9wdGlvbnMuZXZlbnRDb25zdHJ1Y3RvciggZXZlbnQsIG9wdGlvbnMgKTtcclxuICBlbGVtZW50LmRpc3BhdGNoRXZlbnQgPyBlbGVtZW50LmRpc3BhdGNoRXZlbnQoIGV2ZW50VG9EaXNwYXRjaCApIDogZWxlbWVudC5maXJlRXZlbnQoIGBvbiR7ZXZlbnRUb0Rpc3BhdGNofWAsIGV2ZW50VG9EaXNwYXRjaCApO1xyXG59O1xyXG5cclxuUVVuaXQudGVzdCggJ2ZvY3VzaW4vZm9jdXNvdXQgKGZvY3VzL2JsdXIpJywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XHJcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApO1xyXG4gIGJlZm9yZVRlc3QoIGRpc3BsYXkgKTtcclxuXHJcbiAgY29uc3QgYSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDIwLCAyMCwgeyB0YWdOYW1lOiAnYnV0dG9uJyB9ICk7XHJcbiAgY29uc3QgYiA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDIwLCAyMCwgeyB0YWdOYW1lOiAnYnV0dG9uJyB9ICk7XHJcbiAgY29uc3QgYyA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDIwLCAyMCwgeyB0YWdOYW1lOiAnYnV0dG9uJyB9ICk7XHJcblxyXG4gIC8vIHJvb3ROb2RlXHJcbiAgLy8gICAvICBcXFxyXG4gIC8vICBhICAgIGJcclxuICAvLyAgICAgICAgXFxcclxuICAvLyAgICAgICAgIGNcclxuICByb290Tm9kZS5hZGRDaGlsZCggYSApO1xyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBiICk7XHJcbiAgYi5hZGRDaGlsZCggYyApO1xyXG5cclxuICBsZXQgYUdvdEZvY3VzID0gZmFsc2U7XHJcbiAgbGV0IGFMb3N0Rm9jdXMgPSBmYWxzZTtcclxuICBsZXQgYkdvdEZvY3VzID0gZmFsc2U7XHJcbiAgbGV0IGJHb3RCbHVyID0gZmFsc2U7XHJcbiAgbGV0IGJHb3RGb2N1c0luID0gZmFsc2U7XHJcbiAgbGV0IGJHb3RGb2N1c091dCA9IGZhbHNlO1xyXG4gIGxldCBjR290Rm9jdXNJbiA9IGZhbHNlO1xyXG4gIGxldCBjR290Rm9jdXNPdXQgPSBmYWxzZTtcclxuXHJcbiAgY29uc3QgcmVzZXRGb2N1c1ZhcmlhYmxlcyA9ICgpID0+IHtcclxuICAgIGFHb3RGb2N1cyA9IGZhbHNlO1xyXG4gICAgYUxvc3RGb2N1cyA9IGZhbHNlO1xyXG4gICAgYkdvdEZvY3VzID0gZmFsc2U7XHJcbiAgICBiR290Qmx1ciA9IGZhbHNlO1xyXG4gICAgYkdvdEZvY3VzSW4gPSBmYWxzZTtcclxuICAgIGJHb3RGb2N1c091dCA9IGZhbHNlO1xyXG4gICAgY0dvdEZvY3VzSW4gPSBmYWxzZTtcclxuICAgIGNHb3RGb2N1c091dCA9IGZhbHNlO1xyXG4gIH07XHJcblxyXG4gIGEuYWRkSW5wdXRMaXN0ZW5lcigge1xyXG4gICAgZm9jdXMoKSB7XHJcbiAgICAgIGFHb3RGb2N1cyA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgYmx1cigpIHtcclxuICAgICAgYUxvc3RGb2N1cyA9IHRydWU7XHJcbiAgICB9XHJcbiAgfSApO1xyXG5cclxuICBiLmFkZElucHV0TGlzdGVuZXIoIHtcclxuICAgIGZvY3VzKCkge1xyXG4gICAgICBiR290Rm9jdXMgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIGJsdXIoKSB7XHJcbiAgICAgIGJHb3RCbHVyID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICBmb2N1c2luKCkge1xyXG4gICAgICBiR290Rm9jdXNJbiA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgZm9jdXNvdXQoKSB7XHJcbiAgICAgIGJHb3RGb2N1c091dCA9IHRydWU7XHJcbiAgICB9XHJcbiAgfSApO1xyXG5cclxuICBjLmFkZElucHV0TGlzdGVuZXIoIHtcclxuICAgIGZvY3VzaW4oKSB7XHJcbiAgICAgIGNHb3RGb2N1c0luID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICBmb2N1c291dCgpIHtcclxuICAgICAgY0dvdEZvY3VzT3V0ID0gdHJ1ZTtcclxuICAgIH1cclxuICB9ICk7XHJcblxyXG4gIGEuZm9jdXMoKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBhR290Rm9jdXMsICdhIHNob3VsZCBoYXZlIGJlZW4gZm9jdXNlZCcgKTtcclxuICBhc3NlcnQub2soICFhTG9zdEZvY3VzLCAnYSBzaG91bGQgbm90IGJsdXInICk7XHJcbiAgcmVzZXRGb2N1c1ZhcmlhYmxlcygpO1xyXG5cclxuICBiLmZvY3VzKCk7XHJcbiAgYXNzZXJ0Lm9rKCBiR290Rm9jdXMsICdiIHNob3VsZCBoYXZlIGJlZW4gZm9jdXNlZCcgKTtcclxuICBhc3NlcnQub2soIGFMb3N0Rm9jdXMsICdhIHNob3VsZCBoYXZlIGxvc3QgZm9jdXNlZCcgKTtcclxuICByZXNldEZvY3VzVmFyaWFibGVzKCk7XHJcblxyXG4gIGMuZm9jdXMoKTtcclxuICBhc3NlcnQub2soICFiR290Rm9jdXMsICdiIHNob3VsZCBub3QgcmVjZWl2ZSBmb2N1cyAoZG9lc250IGJ1YmJsZSknICk7XHJcbiAgYXNzZXJ0Lm9rKCBjR290Rm9jdXNJbiwgJ2Mgc2hvdWxkIHJlY2VpdmUgYSBmb2N1c2luJyApO1xyXG4gIGFzc2VydC5vayggYkdvdEZvY3VzSW4sICdiIHNob3VsZCByZWNlaXZlIGEgZm9jdXNpbiAoZnJvbSBidWJibGluZyknICk7XHJcbiAgcmVzZXRGb2N1c1ZhcmlhYmxlcygpO1xyXG5cclxuICBjLmJsdXIoKTtcclxuICBhc3NlcnQub2soICFiR290Qmx1ciwgJ2Igc2hvdWxkIG5vdCByZWNlaXZlIGEgYmx1ciBldmVudCAoZG9lc250IGJ1YmJsZSknICk7XHJcbiAgYXNzZXJ0Lm9rKCBjR290Rm9jdXNPdXQsICdjIHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgZm9jdXNvdXQnICk7XHJcbiAgYXNzZXJ0Lm9rKCBiR290Rm9jdXNPdXQsICdjIHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgZm9jdXNvdXQgKGZyb20gYnViYmxpbmcpJyApO1xyXG5cclxuICBhZnRlclRlc3QoIGRpc3BsYXkgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ3RhYiBmb2N1c2luL2ZvY3Vzb3V0JywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcclxuICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7XHJcbiAgYmVmb3JlVGVzdCggZGlzcGxheSApO1xyXG5cclxuICBjb25zdCBidXR0b25BID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgNSwgNSwgeyB0YWdOYW1lOiAnYnV0dG9uJyB9ICk7XHJcbiAgY29uc3QgYnV0dG9uQiA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDUsIDUsIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xyXG4gIGNvbnN0IGJ1dHRvbkMgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCA1LCA1LCB7IHRhZ05hbWU6ICdidXR0b24nIH0gKTtcclxuICByb290Tm9kZS5jaGlsZHJlbiA9IFsgYnV0dG9uQSwgYnV0dG9uQiwgYnV0dG9uQyBdO1xyXG5cclxuICBjb25zdCBhUHJpbWFyeVNpYmxpbmcgPSBidXR0b25BLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nO1xyXG4gIGNvbnN0IGJQcmltYXJ5U2libGluZyA9IGJ1dHRvbkIucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIucHJpbWFyeVNpYmxpbmc7XHJcblxyXG4gIC8vIHRlc3QgdGhhdCBhIGJsdXIgbGlzdGVuZXIgb24gYSBub2RlIG92ZXJpZGVzIHRoZSBcInRhYlwiIGxpa2UgbmF2aWdhdGlvbiBtb3ZpbmcgZm9jdXMgdG8gdGhlIG5leHQgZWxlbWVudFxyXG4gIGJ1dHRvbkEuZm9jdXMoKTtcclxuICBhc3NlcnQub2soIGJ1dHRvbkEuZm9jdXNlZCwgJ2J1dG9uQSBoYXMgZm9jdXMgaW5pdGlhbGx5JyApO1xyXG5cclxuICBjb25zdCBvdmVycmlkZUZvY3VzTGlzdGVuZXIgPSB7XHJcbiAgICBibHVyOiBldmVudCA9PiB7XHJcbiAgICAgIGJ1dHRvbkMuZm9jdXMoKTtcclxuICAgIH1cclxuICB9O1xyXG4gIGJ1dHRvbkEuYWRkSW5wdXRMaXN0ZW5lciggb3ZlcnJpZGVGb2N1c0xpc3RlbmVyICk7XHJcblxyXG4gIC8vIG1pbWljIGEgXCJ0YWJcIiBpbnRlcmFjdGlvbiwgYXR0ZW1wdGluZyB0byBtb3ZlIGZvY3VzIHRvIHRoZSBuZXh0IGVsZW1lbnRcclxuICB0cmlnZ2VyRE9NRXZlbnQoICdmb2N1c291dCcsIGFQcmltYXJ5U2libGluZywgS2V5Ym9hcmRVdGlscy5LRVlfVEFCLCB7XHJcbiAgICByZWxhdGVkVGFyZ2V0OiBiUHJpbWFyeVNpYmxpbmdcclxuICB9ICk7XHJcblxyXG4gIC8vIHRoZSBibHVyIGxpc3RlbmVyIG9uIGJ1dHRvbkEgc2hvdWxkIG92ZXJyaWRlIHRoZSBtb3ZlbWVudCBvZiBmb2N1cyBvbiBcInRhYlwiIGxpa2UgaW50ZXJhY3Rpb25cclxuICBhc3NlcnQub2soIGJ1dHRvbkMuZm9jdXNlZCwgJ2J1dG9uQyBub3cgaGFzIGZvY3VzJyApO1xyXG5cclxuICAvLyB0ZXN0IHRoYXQgYSBibHVyIGxpc3RlbmVyIGNhbiBwcmV2ZW50IGZvY3VzIGZyb20gbW92aW5nIHRvIGFub3RoZXIgZWxlbWVudCBhZnRlciBcInRhYlwiIGxpa2UgbmF2aWdhdGlvblxyXG4gIGJ1dHRvbkEucmVtb3ZlSW5wdXRMaXN0ZW5lciggb3ZlcnJpZGVGb2N1c0xpc3RlbmVyICk7XHJcbiAgYnV0dG9uQS5mb2N1cygpO1xyXG4gIGNvbnN0IG1ha2VVbmZvY3VzYWJsZUxpc3RlbmVyID0ge1xyXG4gICAgYmx1cjogZXZlbnQgPT4ge1xyXG4gICAgICBidXR0b25CLmZvY3VzYWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgYnV0dG9uQS5hZGRJbnB1dExpc3RlbmVyKCBtYWtlVW5mb2N1c2FibGVMaXN0ZW5lciApO1xyXG5cclxuICAvLyBtaW1pYyBhIHRhYiBwcmVzcyBieSBtb3ZpbmcgZm9jdXMgdG8gYnV0dG9uQiAtIHRoaXMgd2lsbCBhdXRvbWF0aWNhbGx5IGhhdmUgdGhlIGNvcnJlY3QgYHJlbGF0ZWRUYXJnZXRgIGZvclxyXG4gIC8vIHRoZSBgYmx1cmAgZXZlbnQgb24gYnV0dG9uQSBiZWNhdXNlIGZvY3VzIGlzIG1vdmluZyBmcm9tIGJ1dHRvbkEgdG8gYnV0dG9uQi5cclxuICBidXR0b25CLmZvY3VzKCk7XHJcblxyXG4gIC8vIHRoZSBibHVyIGxpc3RlbmVyIG9uIGJ1dHRvbkEgc2hvdWxkIGhhdmUgbWFkZSB0aGUgZGVmYXVsdCBlbGVtZW50IHVuZm9jdXNhYmxlXHJcbiAgYXNzZXJ0Lm9rKCAhYnV0dG9uQi5mb2N1c2VkLCAnYnV0dG9uQiBjYW5ub3QgcmVjZWl2ZSBmb2N1cyBkdWUgdG8gYmx1ciBsaXN0ZW5lciBvbiBidXR0b25BJyApO1xyXG4gIGFzc2VydC5vayggZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gYlByaW1hcnlTaWJsaW5nLCAnZWxlbWVudCBidXR0b25CIGNhbm5vdCByZWNlaXZlIGZvY3VzIGR1ZSB0byBibHVyIGxpc3RlbmVyIG9uIGJ1dHRvbkEnICk7XHJcbiAgYXNzZXJ0Lm9rKCAhYnV0dG9uQS5mb2N1c2VkLCAnYnV0dG9uQSBjYW5ub3Qga2VlcCBmb2N1cyB3aGVuIHRhYmJpbmcgYXdheSwgZXZlbiBpZiBidXR0b25CIGlzIG5vdCBmb2N1c2FibGUnICk7XHJcblxyXG4gIC8vIGNsZWFudXAgZm9yIHRoZSBuZXh0IHRlc3RcclxuICBidXR0b25BLnJlbW92ZUlucHV0TGlzdGVuZXIoIG1ha2VVbmZvY3VzYWJsZUxpc3RlbmVyICk7XHJcbiAgYnV0dG9uQi5mb2N1c2FibGUgPSB0cnVlO1xyXG5cclxuICBidXR0b25BLmZvY3VzKCk7XHJcbiAgY29uc3QgY2F1c2VSZWRyYXdMaXN0ZW5lciA9IHtcclxuICAgIGJsdXI6IGV2ZW50ID0+IHtcclxuICAgICAgYnV0dG9uQi5mb2N1c2FibGUgPSB0cnVlO1xyXG4gICAgICBidXR0b25CLnRhZ05hbWUgPSAncCc7XHJcbiAgICB9XHJcbiAgfTtcclxuICBidXR0b25BLmFkZElucHV0TGlzdGVuZXIoIGNhdXNlUmVkcmF3TGlzdGVuZXIgKTtcclxuXHJcbiAgYnV0dG9uQi5mb2N1cygpO1xyXG5cclxuICAvLyB0aGUgYmx1ciBsaXN0ZW5lciBvbiBidXR0b25BIHdpbGwgY2F1c2UgYSBmdWxsIHJlZHJhdyBvZiBidXR0b25CIGluIHRoZSBQRE9NLCBidXQgYnV0dG9uQiBzaG91bGQgcmVjZWl2ZSBmb2N1c1xyXG4gIGFzc2VydC5vayggYnV0dG9uQi5mb2N1c2VkLCAnYnV0dG9uQiBzaG91bGQgc3RpbGwgaGF2ZSBmb2N1cyBhZnRlciBhIGZ1bGwgcmVkcmF3IGR1ZSB0byBhIGJsdXIgbGlzdGVuZXInICk7XHJcblxyXG4gIC8vIGNsZWFudXBcclxuICBidXR0b25BLnJlbW92ZUlucHV0TGlzdGVuZXIoIGNhdXNlUmVkcmF3TGlzdGVuZXIgKTtcclxuICBidXR0b25BLmZvY3VzYWJsZSA9IHRydWU7XHJcbiAgYnV0dG9uQi50YWdOYW1lID0gJ2J1dHRvbic7XHJcblxyXG4gIC8vIHNhbml0eSBjaGVja3MgbWFuaXB1bGF0aW5nIGZvY3VzLCBhbmQgYWRkZWQgYmVjYXVzZSB3ZSB3ZXJlIHNlZWluZyB2ZXJ5IHN0cmFuZ2UgdGhpbmdzIHdoaWxlIHdvcmtpbmcgb25cclxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTI5NiwgYnV0IHRoZXNlIHNob3VsZCBkZWZpbml0ZWx5IHBhc3NcclxuICBidXR0b25BLmZvY3VzKCk7XHJcbiAgYXNzZXJ0Lm9rKCBidXR0b25BLmZvY3VzZWQsICdidXR0b25BIGRvZXMgbm90IGhhdmUgZm9jdXMgYWZ0ZXIgYSBiYXNpYyBmb2N1cyBjYWxsPycgKTtcclxuICBidXR0b25CLmJsdXIoKTtcclxuICBhc3NlcnQub2soIGJ1dHRvbkEuZm9jdXNlZCwgJ0JsdXJyaW5nIGEgbm9uLWZvY3Vzc2VkIGVsZW1lbnQgc2hvdWxkIG5vdCByZW1vdmUgZm9jdXMgZnJvbSBhIG5vbi1mb2N1c2VkIGVsZW1lbnQnICk7XHJcblxyXG4gIGFmdGVyVGVzdCggZGlzcGxheSApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnY2xpY2snLCBhc3NlcnQgPT4ge1xyXG5cclxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcclxuICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7XHJcbiAgYmVmb3JlVGVzdCggZGlzcGxheSApO1xyXG5cclxuICBjb25zdCBhID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMjAsIDIwLCB7IHRhZ05hbWU6ICdidXR0b24nIH0gKTtcclxuXHJcbiAgbGV0IGdvdEZvY3VzID0gZmFsc2U7XHJcbiAgbGV0IGdvdENsaWNrID0gZmFsc2U7XHJcbiAgbGV0IGFDbGlja0NvdW50ZXIgPSAwO1xyXG5cclxuICByb290Tm9kZS5hZGRDaGlsZCggYSApO1xyXG5cclxuICBhLmFkZElucHV0TGlzdGVuZXIoIHtcclxuICAgIGZvY3VzKCkge1xyXG4gICAgICBnb3RGb2N1cyA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgY2xpY2soKSB7XHJcbiAgICAgIGdvdENsaWNrID0gdHJ1ZTtcclxuICAgICAgYUNsaWNrQ291bnRlcisrO1xyXG4gICAgfSxcclxuICAgIGJsdXIoKSB7XHJcbiAgICAgIGdvdEZvY3VzID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSApO1xyXG5cclxuXHJcbiAgYS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlci5wcmltYXJ5U2libGluZy5mb2N1cygpO1xyXG4gIGFzc2VydC5vayggZ290Rm9jdXMgJiYgIWdvdENsaWNrLCAnZm9jdXMgZmlyc3QnICk7XHJcbiAgYS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlci5wcmltYXJ5U2libGluZy5jbGljaygpOyAvLyB0aGlzIHdvcmtzIGJlY2F1c2UgaXQncyBhIGJ1dHRvblxyXG4gIGFzc2VydC5vayggZ290Q2xpY2sgJiYgZ290Rm9jdXMgJiYgYUNsaWNrQ291bnRlciA9PT0gMSwgJ2Egc2hvdWxkIGhhdmUgYmVlbiBjbGlja2VkJyApO1xyXG5cclxuICBsZXQgYkNsaWNrQ291bnRlciA9IDA7XHJcblxyXG4gIGNvbnN0IGIgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAyMCwgMjAsIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xyXG5cclxuICBiLmFkZElucHV0TGlzdGVuZXIoIHtcclxuICAgIGNsaWNrKCkge1xyXG4gICAgICBiQ2xpY2tDb3VudGVyKys7XHJcbiAgICB9XHJcbiAgfSApO1xyXG5cclxuICBhLmFkZENoaWxkKCBiICk7XHJcblxyXG4gIGIucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIucHJpbWFyeVNpYmxpbmcuZm9jdXMoKTtcclxuICBiLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nLmNsaWNrKCk7XHJcbiAgYXNzZXJ0Lm9rKCBiQ2xpY2tDb3VudGVyID09PSAxICYmIGFDbGlja0NvdW50ZXIgPT09IDIsICdhIHNob3VsZCBoYXZlIGJlZW4gY2xpY2tlZCB3aXRoIGInICk7XHJcbiAgYS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlci5wcmltYXJ5U2libGluZy5jbGljaygpO1xyXG4gIGFzc2VydC5vayggYkNsaWNrQ291bnRlciA9PT0gMSAmJiBhQ2xpY2tDb3VudGVyID09PSAzLCAnYiBzdGlsbCBzaG91bGQgbm90IGhhdmUgYmVlbiBjbGlja2VkLicgKTtcclxuXHJcblxyXG4gIC8vIGNyZWF0ZSBhIG5vZGVcclxuICBjb25zdCBhMSA9IG5ldyBOb2RlKCB7XHJcbiAgICB0YWdOYW1lOiAnYnV0dG9uJ1xyXG4gIH0gKTtcclxuICBhLmFkZENoaWxkKCBhMSApO1xyXG4gIGFzc2VydC5vayggYTEuaW5wdXRMaXN0ZW5lcnMubGVuZ3RoID09PSAwLCAnbm8gaW5wdXQgYWNjZXNzaWJsZSBsaXN0ZW5lcnMgb24gaW5zdGFudGlhdGlvbicgKTtcclxuICBhc3NlcnQub2soIGExLmxhYmVsQ29udGVudCA9PT0gbnVsbCwgJ25vIGxhYmVsIG9uIGluc3RhbnRpYXRpb24nICk7XHJcblxyXG4gIC8vIGFkZCBhIGxpc3RlbmVyXHJcbiAgY29uc3QgbGlzdGVuZXIgPSB7IGNsaWNrKCkgeyBhMS5sYWJlbENvbnRlbnQgPSBURVNUX0xBQkVMOyB9IH07XHJcbiAgYTEuYWRkSW5wdXRMaXN0ZW5lciggbGlzdGVuZXIgKTtcclxuICBhc3NlcnQub2soIGExLmlucHV0TGlzdGVuZXJzLmxlbmd0aCA9PT0gMSwgJ2FjY2Vzc2libGUgbGlzdGVuZXIgYWRkZWQnICk7XHJcblxyXG4gIC8vIHZlcmlmeSBhZGRlZCB3aXRoIGhhc0lucHV0TGlzdGVuZXJcclxuICBhc3NlcnQub2soIGExLmhhc0lucHV0TGlzdGVuZXIoIGxpc3RlbmVyICkgPT09IHRydWUsICdmb3VuZCB3aXRoIGhhc0lucHV0TGlzdGVuZXInICk7XHJcblxyXG4gIC8vIGZpcmUgdGhlIGV2ZW50XHJcbiAgYTEucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIucHJpbWFyeVNpYmxpbmcuY2xpY2soKTtcclxuICBhc3NlcnQub2soIGExLmxhYmVsQ29udGVudCA9PT0gVEVTVF9MQUJFTCwgJ2NsaWNrIGZpcmVkLCBsYWJlbCBzZXQnICk7XHJcblxyXG4gIGNvbnN0IGMgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAyMCwgMjAsIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xyXG4gIGNvbnN0IGQgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAyMCwgMjAsIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xyXG4gIGNvbnN0IGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAyMCwgMjAsIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xyXG5cclxuICBsZXQgY0NsaWNrQ291bnQgPSAwO1xyXG4gIGxldCBkQ2xpY2tDb3VudCA9IDA7XHJcbiAgbGV0IGVDbGlja0NvdW50ID0gMDtcclxuXHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGMgKTtcclxuICBjLmFkZENoaWxkKCBkICk7XHJcbiAgZC5hZGRDaGlsZCggZSApO1xyXG5cclxuICBjLmFkZElucHV0TGlzdGVuZXIoIHtcclxuICAgIGNsaWNrKCkge1xyXG4gICAgICBjQ2xpY2tDb3VudCsrO1xyXG4gICAgfVxyXG4gIH0gKTtcclxuICBkLmFkZElucHV0TGlzdGVuZXIoIHtcclxuICAgIGNsaWNrKCkge1xyXG4gICAgICBkQ2xpY2tDb3VudCsrO1xyXG4gICAgfVxyXG4gIH0gKTtcclxuICBlLmFkZElucHV0TGlzdGVuZXIoIHtcclxuICAgIGNsaWNrKCkge1xyXG4gICAgICBlQ2xpY2tDb3VudCsrO1xyXG4gICAgfVxyXG4gIH0gKTtcclxuXHJcbiAgZS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlci5wcmltYXJ5U2libGluZy5jbGljaygpO1xyXG5cclxuICBhc3NlcnQub2soIGNDbGlja0NvdW50ID09PSBkQ2xpY2tDb3VudCAmJiBjQ2xpY2tDb3VudCA9PT0gZUNsaWNrQ291bnQgJiYgY0NsaWNrQ291bnQgPT09IDEsXHJcbiAgICAnY2xpY2sgc2hvdWxkIGhhdmUgYnViYmxlZCB0byBhbGwgcGFyZW50cycgKTtcclxuXHJcbiAgZC5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlci5wcmltYXJ5U2libGluZy5jbGljaygpO1xyXG5cclxuXHJcbiAgYXNzZXJ0Lm9rKCBjQ2xpY2tDb3VudCA9PT0gMiAmJiBkQ2xpY2tDb3VudCA9PT0gMiAmJiBlQ2xpY2tDb3VudCA9PT0gMSxcclxuICAgICdkIHNob3VsZCBub3QgdHJpZ2dlciBjbGljayBvbiBlJyApO1xyXG4gIGMucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIucHJpbWFyeVNpYmxpbmcuY2xpY2soKTtcclxuXHJcblxyXG4gIGFzc2VydC5vayggY0NsaWNrQ291bnQgPT09IDMgJiYgZENsaWNrQ291bnQgPT09IDIgJiYgZUNsaWNrQ291bnQgPT09IDEsXHJcbiAgICAnYyBzaG91bGQgbm90IHRyaWdnZXIgY2xpY2sgb24gZCBvciBlJyApO1xyXG5cclxuICAvLyByZXNldCBjbGljayBjb3VudFxyXG4gIGNDbGlja0NvdW50ID0gMDtcclxuICBkQ2xpY2tDb3VudCA9IDA7XHJcbiAgZUNsaWNrQ291bnQgPSAwO1xyXG5cclxuICBjLnBkb21PcmRlciA9IFsgZCwgZSBdO1xyXG5cclxuICBlLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nLmNsaWNrKCk7XHJcbiAgYXNzZXJ0Lm9rKCBjQ2xpY2tDb3VudCA9PT0gMSAmJiBkQ2xpY2tDb3VudCA9PT0gMCAmJiBlQ2xpY2tDb3VudCA9PT0gMSxcclxuICAgICdwZG9tT3JkZXIgbWVhbnMgY2xpY2sgc2hvdWxkIGJ5cGFzcyBkJyApO1xyXG5cclxuICBjLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nLmNsaWNrKCk7XHJcbiAgYXNzZXJ0Lm9rKCBjQ2xpY2tDb3VudCA9PT0gMiAmJiBkQ2xpY2tDb3VudCA9PT0gMCAmJiBlQ2xpY2tDb3VudCA9PT0gMSxcclxuICAgICdjbGljayBjIHNob3VsZCBub3QgZWZmZWN0IGUgb3IgZC4nICk7XHJcblxyXG4gIGQucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIucHJpbWFyeVNpYmxpbmcuY2xpY2soKTtcclxuICBhc3NlcnQub2soIGNDbGlja0NvdW50ID09PSAzICYmIGRDbGlja0NvdW50ID09PSAxICYmIGVDbGlja0NvdW50ID09PSAxLFxyXG4gICAgJ2NsaWNrIGQgc2hvdWxkIG5vdCBlZmZlY3QgZS4nICk7XHJcblxyXG4gIC8vIHJlc2V0IGNsaWNrIGNvdW50XHJcbiAgY0NsaWNrQ291bnQgPSAwO1xyXG4gIGRDbGlja0NvdW50ID0gMDtcclxuICBlQ2xpY2tDb3VudCA9IDA7XHJcblxyXG4gIGNvbnN0IGYgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAyMCwgMjAsIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xyXG5cclxuICBsZXQgZkNsaWNrQ291bnQgPSAwO1xyXG4gIGYuYWRkSW5wdXRMaXN0ZW5lcigge1xyXG4gICAgY2xpY2soKSB7XHJcbiAgICAgIGZDbGlja0NvdW50Kys7XHJcbiAgICB9XHJcbiAgfSApO1xyXG4gIGUuYWRkQ2hpbGQoIGYgKTtcclxuXHJcbiAgLy8gc28gaXRzIGEgY2hhaW4gaW4gdGhlIHNjZW5lIGdyYXBoIGMtPmQtPmUtPmZcclxuXHJcbiAgZC5wZG9tT3JkZXIgPSBbIGYgXTtcclxuXHJcbiAgLyogYWNjZXNzaWJsZSBpbnN0YW5jZSB0cmVlOlxyXG4gICAgICAgY1xyXG4gICAgICAvIFxcXHJcbiAgICAgIGQgIGVcclxuICAgICAgfFxyXG4gICAgICBmXHJcbiAgKi9cclxuXHJcbiAgZi5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlci5wcmltYXJ5U2libGluZy5jbGljaygpO1xyXG4gIGFzc2VydC5vayggY0NsaWNrQ291bnQgPT09IDEgJiYgZENsaWNrQ291bnQgPT09IDEgJiYgZUNsaWNrQ291bnQgPT09IDAgJiYgZkNsaWNrQ291bnQgPT09IDEsXHJcbiAgICAnY2xpY2sgZCBzaG91bGQgbm90IGVmZmVjdCBlLicgKTtcclxuXHJcbiAgYWZ0ZXJUZXN0KCBkaXNwbGF5ICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdjbGljayBleHRyYScsIGFzc2VydCA9PiB7XHJcblxyXG4gIC8vIGNyZWF0ZSBhIG5vZGVcclxuICBjb25zdCBhMSA9IG5ldyBOb2RlKCB7XHJcbiAgICB0YWdOYW1lOiAnYnV0dG9uJ1xyXG4gIH0gKTtcclxuICBjb25zdCByb290ID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xyXG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdCApO1xyXG4gIGJlZm9yZVRlc3QoIGRpc3BsYXkgKTtcclxuXHJcbiAgcm9vdC5hZGRDaGlsZCggYTEgKTtcclxuICBhc3NlcnQub2soIGExLmlucHV0TGlzdGVuZXJzLmxlbmd0aCA9PT0gMCwgJ25vIGlucHV0IGFjY2Vzc2libGUgbGlzdGVuZXJzIG9uIGluc3RhbnRpYXRpb24nICk7XHJcbiAgYXNzZXJ0Lm9rKCBhMS5sYWJlbENvbnRlbnQgPT09IG51bGwsICdubyBsYWJlbCBvbiBpbnN0YW50aWF0aW9uJyApO1xyXG5cclxuICAvLyBhZGQgYSBsaXN0ZW5lclxyXG4gIGNvbnN0IGxpc3RlbmVyID0geyBjbGljazogKCkgPT4geyBhMS5sYWJlbENvbnRlbnQgPSBURVNUX0xBQkVMOyB9IH07XHJcbiAgYTEuYWRkSW5wdXRMaXN0ZW5lciggbGlzdGVuZXIgKTtcclxuICBhc3NlcnQub2soIGExLmlucHV0TGlzdGVuZXJzLmxlbmd0aCA9PT0gMSwgJ2FjY2Vzc2libGUgbGlzdGVuZXIgYWRkZWQnICk7XHJcblxyXG4gIC8vIHZlcmlmeSBhZGRlZCB3aXRoIGhhc0lucHV0TGlzdGVuZXJcclxuICBhc3NlcnQub2soIGExLmhhc0lucHV0TGlzdGVuZXIoIGxpc3RlbmVyICkgPT09IHRydWUsICdmb3VuZCB3aXRoIGhhc0lucHV0TGlzdGVuZXInICk7XHJcblxyXG4gIC8vIGZpcmUgdGhlIGV2ZW50XHJcbiAgYTEucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIucHJpbWFyeVNpYmxpbmcuY2xpY2soKTtcclxuICBhc3NlcnQub2soIGExLmxhYmVsQ29udGVudCA9PT0gVEVTVF9MQUJFTCwgJ2NsaWNrIGZpcmVkLCBsYWJlbCBzZXQnICk7XHJcblxyXG4gIC8vIHJlbW92ZSB0aGUgbGlzdGVuZXJcclxuICBhMS5yZW1vdmVJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApO1xyXG4gIGFzc2VydC5vayggYTEuaW5wdXRMaXN0ZW5lcnMubGVuZ3RoID09PSAwLCAnYWNjZXNzaWJsZSBsaXN0ZW5lciByZW1vdmVkJyApO1xyXG5cclxuICAvLyB2ZXJpZnkgcmVtb3ZlZCB3aXRoIGhhc0lucHV0TGlzdGVuZXJcclxuICBhc3NlcnQub2soIGExLmhhc0lucHV0TGlzdGVuZXIoIGxpc3RlbmVyICkgPT09IGZhbHNlLCAnbm90IGZvdW5kIHdpdGggaGFzSW5wdXRMaXN0ZW5lcicgKTtcclxuXHJcbiAgLy8gbWFrZSBzdXJlIGV2ZW50IGxpc3RlbmVyIHdhcyBhbHNvIHJlbW92ZWQgZnJvbSBET00gZWxlbWVudFxyXG4gIC8vIGNsaWNrIHNob3VsZCBub3QgY2hhbmdlIHRoZSBsYWJlbFxyXG4gIGExLmxhYmVsQ29udGVudCA9IFRFU1RfTEFCRUxfMjtcclxuICBhc3NlcnQub2soIGExLmxhYmVsQ29udGVudCA9PT0gVEVTVF9MQUJFTF8yLCAnYmVmb3JlIGNsaWNrJyApO1xyXG5cclxuICAvLyBzZXR0aW5nIHRoZSBsYWJlbCByZWRyZXcgdGhlIHBkb20sIHNvIGdldCBhIHJlZmVyZW5jZSB0byB0aGUgbmV3IGRvbSBlbGVtZW50LlxyXG4gIGExLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nLmNsaWNrKCk7XHJcbiAgYXNzZXJ0Lm9rKCBhMS5sYWJlbENvbnRlbnQgPT09IFRFU1RfTEFCRUxfMiwgJ2NsaWNrIHNob3VsZCBub3QgY2hhbmdlIGxhYmVsJyApO1xyXG5cclxuICAvLyB2ZXJpZnkgZGlzcG9zYWwgcmVtb3ZlcyBhY2Nlc3NpYmxlIGlucHV0IGxpc3RlbmVyc1xyXG4gIGExLmFkZElucHV0TGlzdGVuZXIoIGxpc3RlbmVyICk7XHJcbiAgYTEuZGlzcG9zZSgpO1xyXG5cclxuICAvLyBUT0RPOiBTaW5jZSBjb252ZXJ0aW5nIHRvIHVzZSBOb2RlLmlucHV0TGlzdGVuZXJzLCB3ZSBjYW4ndCBhc3N1bWUgdGhpcyBhbnltb3JlXHJcbiAgLy8gYXNzZXJ0Lm9rKCBhMS5oYXNJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApID09PSBmYWxzZSwgJ2Rpc3Bvc2FsIHJlbW92ZWQgYWNjZXNzaWJsZSBpbnB1dCBsaXN0ZW5lcnMnICk7XHJcblxyXG4gIGFmdGVyVGVzdCggZGlzcGxheSApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnaW5wdXQnLCBhc3NlcnQgPT4ge1xyXG5cclxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcclxuICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7XHJcbiAgYmVmb3JlVGVzdCggZGlzcGxheSApO1xyXG5cclxuICBjb25zdCBhID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMjAsIDIwLCB7IHRhZ05hbWU6ICdpbnB1dCcsIGlucHV0VHlwZTogJ3RleHQnIH0gKTtcclxuXHJcbiAgbGV0IGdvdEZvY3VzID0gZmFsc2U7XHJcbiAgbGV0IGdvdElucHV0ID0gZmFsc2U7XHJcblxyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XHJcblxyXG4gIGEuYWRkSW5wdXRMaXN0ZW5lcigge1xyXG4gICAgZm9jdXMoKSB7XHJcbiAgICAgIGdvdEZvY3VzID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICBpbnB1dCgpIHtcclxuICAgICAgZ290SW5wdXQgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIGJsdXIoKSB7XHJcbiAgICAgIGdvdEZvY3VzID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSApO1xyXG5cclxuICBhLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nLmZvY3VzKCk7XHJcbiAgYXNzZXJ0Lm9rKCBnb3RGb2N1cyAmJiAhZ290SW5wdXQsICdmb2N1cyBmaXJzdCcgKTtcclxuXHJcbiAgZGlzcGF0Y2hFdmVudCggYS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlci5wcmltYXJ5U2libGluZywgJ2lucHV0JyApO1xyXG5cclxuICBhc3NlcnQub2soIGdvdElucHV0ICYmIGdvdEZvY3VzLCAnYSBzaG91bGQgaGF2ZSBiZWVuIGFuIGlucHV0JyApO1xyXG5cclxuICBhZnRlclRlc3QoIGRpc3BsYXkgKTtcclxufSApO1xyXG5cclxuXHJcblFVbml0LnRlc3QoICdjaGFuZ2UnLCBhc3NlcnQgPT4ge1xyXG5cclxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcclxuICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7XHJcbiAgYmVmb3JlVGVzdCggZGlzcGxheSApO1xyXG5cclxuICBjb25zdCBhID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMjAsIDIwLCB7IHRhZ05hbWU6ICdpbnB1dCcsIGlucHV0VHlwZTogJ3JhbmdlJyB9ICk7XHJcblxyXG4gIGxldCBnb3RGb2N1cyA9IGZhbHNlO1xyXG4gIGxldCBnb3RDaGFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcclxuXHJcbiAgYS5hZGRJbnB1dExpc3RlbmVyKCB7XHJcbiAgICBmb2N1cygpIHtcclxuICAgICAgZ290Rm9jdXMgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIGNoYW5nZSgpIHtcclxuICAgICAgZ290Q2hhbmdlID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICBibHVyKCkge1xyXG4gICAgICBnb3RGb2N1cyA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH0gKTtcclxuXHJcbiAgYS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlci5wcmltYXJ5U2libGluZy5mb2N1cygpO1xyXG4gIGFzc2VydC5vayggZ290Rm9jdXMgJiYgIWdvdENoYW5nZSwgJ2ZvY3VzIGZpcnN0JyApO1xyXG5cclxuICBkaXNwYXRjaEV2ZW50KCBhLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nLCAnY2hhbmdlJyApO1xyXG5cclxuICBhc3NlcnQub2soIGdvdENoYW5nZSAmJiBnb3RGb2N1cywgJ2Egc2hvdWxkIGhhdmUgYmVlbiBhbiBpbnB1dCcgKTtcclxuXHJcbiAgYWZ0ZXJUZXN0KCBkaXNwbGF5ICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdrZXlkb3duL2tleXVwJywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XHJcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApO1xyXG4gIGJlZm9yZVRlc3QoIGRpc3BsYXkgKTtcclxuXHJcbiAgY29uc3QgYSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDIwLCAyMCwgeyB0YWdOYW1lOiAnaW5wdXQnLCBpbnB1dFR5cGU6ICd0ZXh0JyB9ICk7XHJcblxyXG4gIGxldCBnb3RGb2N1cyA9IGZhbHNlO1xyXG4gIGxldCBnb3RLZXlkb3duID0gZmFsc2U7XHJcbiAgbGV0IGdvdEtleXVwID0gZmFsc2U7XHJcblxyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XHJcblxyXG4gIGEuYWRkSW5wdXRMaXN0ZW5lcigge1xyXG4gICAgZm9jdXMoKSB7XHJcbiAgICAgIGdvdEZvY3VzID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICBrZXlkb3duKCkge1xyXG4gICAgICBnb3RLZXlkb3duID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICBrZXl1cCgpIHtcclxuICAgICAgZ290S2V5dXAgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIGJsdXIoKSB7XHJcbiAgICAgIGdvdEZvY3VzID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSApO1xyXG5cclxuICBhLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nLmZvY3VzKCk7XHJcbiAgYXNzZXJ0Lm9rKCBnb3RGb2N1cyAmJiAhZ290S2V5ZG93biwgJ2ZvY3VzIGZpcnN0JyApO1xyXG5cclxuICBkaXNwYXRjaEV2ZW50KCBhLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nLCAna2V5ZG93bicgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBnb3RLZXlkb3duICYmIGdvdEZvY3VzLCAnYSBzaG91bGQgaGF2ZSBoYWQga2V5ZG93bicgKTtcclxuXHJcbiAgZGlzcGF0Y2hFdmVudCggYS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlci5wcmltYXJ5U2libGluZywgJ2tleXVwJyApO1xyXG4gIGFzc2VydC5vayggZ290S2V5ZG93biAmJiBnb3RLZXl1cCAmJiBnb3RGb2N1cywgJ2Egc2hvdWxkIGhhdmUgaGFkIGtleXVwJyApO1xyXG5cclxuICBhZnRlclRlc3QoIGRpc3BsYXkgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0dsb2JhbCBLZXlTdGF0ZVRyYWNrZXIgdGVzdHMnLCBhc3NlcnQgPT4ge1xyXG5cclxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcclxuICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7XHJcbiAgYmVmb3JlVGVzdCggZGlzcGxheSApO1xyXG5cclxuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xyXG4gIGNvbnN0IGIgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnYnV0dG9uJyB9ICk7XHJcbiAgY29uc3QgYyA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdidXR0b24nIH0gKTtcclxuICBjb25zdCBkID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xyXG5cclxuICBhLmFkZENoaWxkKCBiICk7XHJcbiAgYi5hZGRDaGlsZCggYyApO1xyXG4gIGMuYWRkQ2hpbGQoIGQgKTtcclxuICByb290Tm9kZS5hZGRDaGlsZCggYSApO1xyXG5cclxuICBjb25zdCBkUHJpbWFyeVNpYmxpbmcgPSBkLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyLnByaW1hcnlTaWJsaW5nO1xyXG4gIHRyaWdnZXJET01FdmVudCggJ2tleWRvd24nLCBkUHJpbWFyeVNpYmxpbmcsIEtleWJvYXJkVXRpbHMuS0VZX1JJR0hUX0FSUk9XLCB7XHJcbiAgICBldmVudENvbnN0cnVjdG9yOiB3aW5kb3cuS2V5Ym9hcmRFdmVudFxyXG4gIH0gKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIuaXNLZXlEb3duKCBLZXlib2FyZFV0aWxzLktFWV9SSUdIVF9BUlJPVyApLCAnZ2xvYmFsIGtleVN0YXRlVHJhY2tlciBzaG91bGQgYmUgdXBkYXRlZCB3aXRoIHJpZ2h0IGFycm93IGtleSBkb3duJyApO1xyXG5cclxuICBhZnRlclRlc3QoIGRpc3BsYXkgKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsT0FBTyxNQUFNLDBCQUEwQjtBQUM5QyxPQUFPQyxJQUFJLE1BQU0scUJBQXFCO0FBQ3RDLE9BQU9DLFNBQVMsTUFBTSwwQkFBMEI7QUFDaEQsT0FBT0MscUJBQXFCLE1BQU0sNkJBQTZCO0FBQy9ELE9BQU9DLGFBQWEsTUFBTSxxQkFBcUI7O0FBRS9DO0FBQ0EsTUFBTUMsVUFBVSxHQUFHLFlBQVk7QUFDL0IsTUFBTUMsWUFBWSxHQUFHLGNBQWM7QUFFbkNDLEtBQUssQ0FBQ0MsTUFBTSxDQUFFLFdBQVksQ0FBQzs7QUFFM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQyxVQUFVLEdBQUdDLE9BQU8sSUFBSTtFQUM1QkEsT0FBTyxDQUFDQyxnQkFBZ0IsQ0FBQyxDQUFDO0VBQzFCQyxRQUFRLENBQUNDLElBQUksQ0FBQ0MsV0FBVyxDQUFFSixPQUFPLENBQUNLLFVBQVcsQ0FBQztBQUNqRCxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxN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