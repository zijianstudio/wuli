// Copyright 2017-2022, University of Colorado Boulder

/**
 * Utility functions for scenery that are specifically useful for ParallelDOM.
 * These generally pertain to DOM traversal and manipulation.
 *
 * For the most part this file's methods are public in a scenery-internal context. Some exceptions apply. Please
 * consult @jessegreenberg and/or @zepumph before using this outside of scenery.
 *
 * @author Jesse Greenberg
 */

import validate from '../../../../axon/js/validate.js';
import Validation from '../../../../axon/js/Validation.js';
import merge from '../../../../phet-core/js/merge.js';
import stripEmbeddingMarks from '../../../../phet-core/js/stripEmbeddingMarks.js';
import { PDOMSiblingStyle, scenery } from '../../imports.js';

// constants
const NEXT = 'NEXT';
const PREVIOUS = 'PREVIOUS';

// HTML tag names
const INPUT_TAG = 'INPUT';
const LABEL_TAG = 'LABEL';
const BUTTON_TAG = 'BUTTON';
const TEXTAREA_TAG = 'TEXTAREA';
const SELECT_TAG = 'SELECT';
const OPTGROUP_TAG = 'OPTGROUP';
const DATALIST_TAG = 'DATALIST';
const OUTPUT_TAG = 'OUTPUT';
const DIV_TAG = 'DIV';
const A_TAG = 'A';
const AREA_TAG = 'AREA';
const P_TAG = 'P';
const IFRAME_TAG = 'IFRAME';

// tag names with special behavior
const BOLD_TAG = 'B';
const STRONG_TAG = 'STRONG';
const I_TAG = 'I';
const EM_TAG = 'EM';
const MARK_TAG = 'MARK';
const SMALL_TAG = 'SMALL';
const DEL_TAG = 'DEL';
const INS_TAG = 'INS';
const SUB_TAG = 'SUB';
const SUP_TAG = 'SUP';
const BR_TAG = 'BR';

// These browser tags are a definition of default focusable elements, converted from Javascript types,
// see https://stackoverflow.com/questions/1599660/which-html-elements-can-receive-focus
const DEFAULT_FOCUSABLE_TAGS = [A_TAG, AREA_TAG, INPUT_TAG, SELECT_TAG, TEXTAREA_TAG, BUTTON_TAG, IFRAME_TAG];

// collection of tags that are used for formatting text
const FORMATTING_TAGS = [BOLD_TAG, STRONG_TAG, I_TAG, EM_TAG, MARK_TAG, SMALL_TAG, DEL_TAG, INS_TAG, SUB_TAG, SUP_TAG, BR_TAG];

// these elements do not have a closing tag, so they won't support features like innerHTML. This is how PhET treats
// these elements, not necessary what is legal html.
const ELEMENTS_WITHOUT_CLOSING_TAG = [INPUT_TAG];

// valid DOM events that the display adds listeners to. For a list of scenery events that support pdom features
// see Input.PDOM_EVENT_TYPES
// NOTE: Update BrowserEvents if this is added to
const DOM_EVENTS = ['focusin', 'focusout', 'input', 'change', 'click', 'keydown', 'keyup'];

// DOM events that must have been triggered from user input of some kind, and will trigger the
// Display.userGestureEmitter. focus and blur events will trigger from scripting so they must be excluded.
const USER_GESTURE_EVENTS = ['input', 'change', 'click', 'keydown', 'keyup'];

// A collection of DOM events which should be blocked from reaching the scenery Display div
// if they are targeted at an ancestor of the PDOM. Some screen readers try to send fake
// mouse/touch/pointer events to elements but for the purposes of Accessibility we only
// want to respond to DOM_EVENTS.
const BLOCKED_DOM_EVENTS = [
// touch
'touchstart', 'touchend', 'touchmove', 'touchcancel',
// mouse
'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout',
// pointer
'pointerdown', 'pointerup', 'pointermove', 'pointerover', 'pointerout', 'pointercancel', 'gotpointercapture', 'lostpointercapture'];
const ARIA_LABELLEDBY = 'aria-labelledby';
const ARIA_DESCRIBEDBY = 'aria-describedby';
const ARIA_ACTIVE_DESCENDANT = 'aria-activedescendant';

// data attribute to flag whether an element is focusable - cannot check tabindex because IE11 and Edge assign
// tabIndex=0 internally for all HTML elements, including those that should not receive focus
const DATA_FOCUSABLE = 'data-focusable';

// data attribute which contains the unique ID of a Trail that allows us to find the PDOMPeer associated
// with a particular DOM element. This is used in several places in scenery accessibility, mostly PDOMPeer and Input.
const DATA_PDOM_UNIQUE_ID = 'data-unique-id';

// {Array.<String>} attributes that put an ID of another attribute as the value, see https://github.com/phetsims/scenery/issues/819
const ASSOCIATION_ATTRIBUTES = [ARIA_LABELLEDBY, ARIA_DESCRIBEDBY, ARIA_ACTIVE_DESCENDANT];

/**
 * Get all 'element' nodes off the parent element, placing them in an array for easy traversal.  Note that this
 * includes all elements, even those that are 'hidden' or purely for structure.
 *
 * @param  {HTMLElement} domElement - parent whose children will be linearized
 * @returns {HTMLElement[]}
 */
function getLinearDOMElements(domElement) {
  // gets ALL descendant children for the element
  const children = domElement.getElementsByTagName('*');
  const linearDOM = [];
  for (let i = 0; i < children.length; i++) {
    // searching for the HTML element nodes (NOT Scenery nodes)
    if (children[i].nodeType === Node.ELEMENT_NODE) {
      linearDOM[i] = children[i];
    }
  }
  return linearDOM;
}

/**
 * Determine if an element is hidden.  An element is considered 'hidden' if it (or any of its ancestors) has the
 * 'hidden' attribute.
 *
 * @param {HTMLElement} domElement
 * @returns {Boolean}
 */
function isElementHidden(domElement) {
  if (domElement.hidden) {
    return true;
  } else if (domElement === document.body) {
    return false;
  } else {
    return isElementHidden(domElement.parentElement);
  }
}

/**
 * Get the next or previous focusable element in the parallel DOM under the parent element and relative to the currently
 * focused element. Useful if you need to set focus dynamically or need to prevent default behavior
 * when focus changes. If no next or previous focusable is found, it returns the currently focused element.
 * This function should not be used directly, use getNextFocusable() or getPreviousFocusable() instead.
 *
 * @param {string} direction - direction of traversal, one of 'NEXT' | 'PREVIOUS'
 * @param {HTMLElement} [parentElement] - optional, search will be limited to children of this element
 * @returns {HTMLElement}
 */
function getNextPreviousFocusable(direction, parentElement) {
  // linearize the document [or the desired parent] for traversal
  const parent = parentElement || document.body;
  const linearDOM = getLinearDOMElements(parent);
  const activeElement = document.activeElement;
  const activeIndex = linearDOM.indexOf(activeElement);
  const delta = direction === NEXT ? +1 : -1;

  // find the next focusable element in the DOM
  let nextIndex = activeIndex + delta;
  while (nextIndex < linearDOM.length && nextIndex >= 0) {
    const nextElement = linearDOM[nextIndex];
    nextIndex += delta;
    if (PDOMUtils.isElementFocusable(nextElement)) {
      return nextElement;
    }
  }

  // if no next focusable is found, return the active DOM element
  return activeElement;
}

/**
 * Trims the white space from the left of the string.
 * Solution from https://stackoverflow.com/questions/1593859/left-trim-in-javascript
 * @param  {string} string
 * @returns {string}
 */
function trimLeft(string) {
  // ^ - from the beginning of the string
  // \s - whitespace character
  // + - greedy
  return string.replace(/^\s+/, '');
}

/**
 * Returns whether or not the tagName supports innerHTML or textContent in PhET.
 * @private
 * @param {string} tagName
 * @returns {boolean}
 */
function tagNameSupportsContent(tagName) {
  return !_.includes(ELEMENTS_WITHOUT_CLOSING_TAG, tagName.toUpperCase());
}
const PDOMUtils = {
  /**
   * Given a Property or string, return the Propergy value if it is a property. Otherwise just return the string.
   * Useful for forwarding the string to DOM content, but allowing the API to take a StringProperty. Eventually
   * PDOM may support dynamic strings.
   * @param valueOrProperty
   * @returns {string|Property}
   */
  unwrapStringProperty(valueOrProperty) {
    const result = valueOrProperty === null ? null : typeof valueOrProperty === 'string' ? valueOrProperty : valueOrProperty.value;
    assert && assert(result === null || typeof result === 'string');
    return result;
  },
  /**
   * Get the next focusable element relative to the currently focused element and under the parentElement.
   * Can be useful if you want to emulate the 'Tab' key behavior or just transition focus to the next element
   * in the document. If no next focusable can be found, it will return the currently focused element.
   * @public
   *
   * @param {HTMLElement} [parentElement] - optional, search will be limited to elements under this element
   * @returns {HTMLElement}
   */
  getNextFocusable(parentElement) {
    return getNextPreviousFocusable(NEXT, parentElement);
  },
  /**
   * Get the previous focusable element relative to the currently focused element under the parentElement. Can be
   * useful if you want to emulate 'Shift+Tab' behavior. If no next focusable can be found, it will return the
   * currently focused element.
   * @public
   *
   * @param {HTMLElement} [parentElement] - optional, search will be limited to elements under this parent
   * @returns {HTMLElement}
   */
  getPreviousFocusable(parentElement) {
    return getNextPreviousFocusable(PREVIOUS, parentElement);
  },
  /**
   * Get the first focusable element under the parentElement. If no element is available, the document.body is
   * returned.
   *
   * @param {HTMLElement} [parentElement] - optionally restrict the search to elements under this parent
   * @returns {HTMLElement}
   */
  getFirstFocusable(parentElement) {
    const parent = parentElement || document.body;
    const linearDOM = getLinearDOMElements(parent);

    // return the document.body if no element is found
    let firstFocusable = document.body;
    let nextIndex = 0;
    while (nextIndex < linearDOM.length) {
      const nextElement = linearDOM[nextIndex];
      nextIndex++;
      if (PDOMUtils.isElementFocusable(nextElement)) {
        firstFocusable = nextElement;
        break;
      }
    }
    return firstFocusable;
  },
  /**
   * Return a random focusable element in the document. Particularly useful for fuzz testing.
   * @public
   *
   * @parma {Random} random
   * @returns {HTMLElement}
   */
  getRandomFocusable(random) {
    assert && assert(random, 'Random expected');
    const linearDOM = getLinearDOMElements(document.body);
    const focusableElements = [];
    for (let i = 0; i < linearDOM.length; i++) {
      PDOMUtils.isElementFocusable(linearDOM[i]) && focusableElements.push(linearDOM[i]);
    }
    return focusableElements[random.nextInt(focusableElements.length)];
  },
  /**
   * If the textContent has any tags that are not formatting tags, return false. Only checking for
   * tags that are not in the whitelist FORMATTING_TAGS. If there are no tags at all, return false.
   * @public
   *
   * @param {string} textContent
   * @returns {boolean}
   */
  containsFormattingTags(textContent) {
    // no-op for null case
    if (textContent === null) {
      return false;
    }
    assert && assert(typeof textContent === 'string', 'unsupported type for textContent.');
    let i = 0;
    const openIndices = [];
    const closeIndices = [];

    // find open/close tag pairs in the text content
    while (i < textContent.length) {
      const openIndex = textContent.indexOf('<', i);
      const closeIndex = textContent.indexOf('>', i);
      if (openIndex > -1) {
        openIndices.push(openIndex);
        i = openIndex + 1;
      }
      if (closeIndex > -1) {
        closeIndices.push(closeIndex);
        i = closeIndex + 1;
      } else {
        i++;
      }
    }

    // malformed tags or no tags at all, return false immediately
    if (openIndices.length !== closeIndices.length || openIndices.length === 0) {
      return false;
    }

    // check the name in between the open and close brackets - if anything other than formatting tags, return false
    let onlyFormatting = true;
    const upperCaseContent = textContent.toUpperCase();
    for (let j = 0; j < openIndices.length; j++) {
      // get the name and remove the closing slash
      let subString = upperCaseContent.substring(openIndices[j] + 1, closeIndices[j]);
      subString = subString.replace('/', '');

      // if the left of the substring contains space, it is not a valid tag so allow
      const trimmed = trimLeft(subString);
      if (subString.length - trimmed.length > 0) {
        continue;
      }
      if (!_.includes(FORMATTING_TAGS, subString)) {
        onlyFormatting = false;
      }
    }
    return onlyFormatting;
  },
  /**
   * If the text content uses formatting tags, set the content as innerHTML. Otherwise, set as textContent.
   * In general, textContent is more secure and much faster because it doesn't trigger DOM styling and
   * element insertions.
   * @public
   *
   * @param {Element} domElement
   * @param {string|number|null} textContent - domElement is cleared of content if null, could have acceptable HTML
   *                                    "formatting" tags in it
   */
  setTextContent(domElement, textContent) {
    assert && assert(domElement instanceof Element); // parent to HTMLElement, to support other namespaces
    assert && assert(textContent === null || typeof textContent === 'string');
    if (textContent === null) {
      domElement.innerHTML = '';
    } else {
      // XHTML requires <br/> instead of <br>, but <br/> is still valid in HTML. See
      // https://github.com/phetsims/scenery/issues/1309
      const textWithoutBreaks = textContent.replaceAll('<br>', '<br/>');

      // TODO: this line must be removed to support i18n Interactive Description, see https://github.com/phetsims/chipper/issues/798
      const textWithoutEmbeddingMarks = stripEmbeddingMarks(textWithoutBreaks);

      // Disallow any unfilled template variables to be set in the PDOM.
      validate(textWithoutEmbeddingMarks, Validation.STRING_WITHOUT_TEMPLATE_VARS_VALIDATOR);
      if (tagNameSupportsContent(domElement.tagName)) {
        // only returns true if content contains listed formatting tags
        if (PDOMUtils.containsFormattingTags(textWithoutEmbeddingMarks)) {
          domElement.innerHTML = textWithoutEmbeddingMarks;
        } else {
          domElement.textContent = textWithoutEmbeddingMarks;
        }
      }
    }
  },
  /**
   * Given a tagName, test if the element will be focuable by default by the browser.
   * Different from isElementFocusable, because this only looks at tags that the browser will automatically put
   * a >=0 tab index on.
   * @public
   *
   * NOTE: Uses a set of browser types as the definition of default focusable elements,
   * see https://stackoverflow.com/questions/1599660/which-html-elements-can-receive-focus
   *
   * @param tagName
   * @returns {boolean}
   */
  tagIsDefaultFocusable(tagName) {
    return _.includes(DEFAULT_FOCUSABLE_TAGS, tagName.toUpperCase());
  },
  /**
   * Returns true if the element is focusable. Assumes that all focusable  elements have tabIndex >= 0, which
   * is only true for elements of the Parallel DOM.
   *
   * @param {HTMLElement} domElement
   * @returns {boolean}
   */
  isElementFocusable(domElement) {
    if (!document.body.contains(domElement)) {
      return false;
    }

    // continue to next element if this one is meant to be hidden
    if (isElementHidden(domElement)) {
      return false;
    }

    // if element is for formatting, skipe over it - required since IE gives these tabindex="0"
    if (_.includes(FORMATTING_TAGS, domElement.tagName)) {
      return false;
    }
    return domElement.getAttribute(DATA_FOCUSABLE) === 'true';
  },
  /**
   * @public
   *
   * @param {string} tagName
   * @returns {boolean} - true if the tag does support inner content
   */
  tagNameSupportsContent(tagName) {
    return tagNameSupportsContent(tagName);
  },
  /**
   * Helper function to remove multiple HTMLElements from another HTMLElement
   * @public
   *
   * @param {HTMLElement} element
   * @param {Array.<HTMLElement>} childrenToRemove
   */
  removeElements(element, childrenToRemove) {
    for (let i = 0; i < childrenToRemove.length; i++) {
      const childToRemove = childrenToRemove[i];
      assert && assert(element.contains(childToRemove), 'element does not contain child to be removed: ', childToRemove);
      element.removeChild(childToRemove);
    }
  },
  /**
   * Helper function to add multiple elements as children to a parent
   * @public
   *
   * @param {HTMLElement} element - to add children to
   * @param {Array.<HTMLElement>} childrenToAdd
   * @param {HTMLElement} [beforeThisElement] - if not supplied, the insertBefore call will just use 'null'
   */
  insertElements(element, childrenToAdd, beforeThisElement) {
    assert && assert(element instanceof window.Element);
    assert && assert(Array.isArray(childrenToAdd));
    for (let i = 0; i < childrenToAdd.length; i++) {
      const childToAdd = childrenToAdd[i];
      element.insertBefore(childToAdd, beforeThisElement || null);
    }
  },
  /**
   * Create an HTML element.  Unless this is a form element or explicitly marked as focusable, add a negative
   * tab index. IE gives all elements a tabIndex of 0 and handles tab navigation internally, so this marks
   * which elements should not be in the focus order.
   *
   * @public
   * @param  {string} tagName
   * @param {boolean} focusable - should the element be explicitly added to the focus order?
   * @param {Object} [options]
   * @returns {HTMLElement}
   */
  createElement(tagName, focusable, options) {
    options = merge({
      // {string|null} - If non-null, the element will be created with the specific namespace
      namespace: null,
      // {string|null} - A string id that uniquely represents this element in the DOM, must be completely
      // unique in the DOM.
      id: null
    }, options);
    const domElement = options.namespace ? document.createElementNS(options.namespace, tagName) : document.createElement(tagName);
    if (options.id) {
      domElement.id = options.id;
    }

    // set tab index if we are overriding default browser behavior
    PDOMUtils.overrideFocusWithTabIndex(domElement, focusable);

    // gives this element styling from SceneryStyle
    domElement.classList.add(PDOMSiblingStyle.SIBLING_CLASS_NAME);
    return domElement;
  },
  /**
   * Add a tab index to an element when overriding the default focus behavior for the element. Adding tabindex
   * to an element can only be done when overriding the default browser behavior because tabindex interferes with
   * the way JAWS reads through content on Chrome, see https://github.com/phetsims/scenery/issues/893
   *
   * If default behavior and focusable align, the tabindex attribute is removed so that can't interfere with a
   * screen reader.
   * @public (scenery-internal)
   *
   * @param {HTMLElement} element
   * @param {boolean} focusable
   */
  overrideFocusWithTabIndex(element, focusable) {
    const defaultFocusable = PDOMUtils.tagIsDefaultFocusable(element.tagName);

    // only add a tabindex when we are overriding the default focusable bahvior of the browser for the tag name
    if (defaultFocusable !== focusable) {
      element.tabIndex = focusable ? 0 : -1;
    } else {
      element.removeAttribute('tabindex');
    }
    element.setAttribute(DATA_FOCUSABLE, focusable);
  },
  TAGS: {
    INPUT: INPUT_TAG,
    LABEL: LABEL_TAG,
    BUTTON: BUTTON_TAG,
    TEXTAREA: TEXTAREA_TAG,
    SELECT: SELECT_TAG,
    OPTGROUP: OPTGROUP_TAG,
    DATALIST: DATALIST_TAG,
    OUTPUT: OUTPUT_TAG,
    DIV: DIV_TAG,
    A: A_TAG,
    P: P_TAG,
    B: BOLD_TAG,
    STRONG: STRONG_TAG,
    I: I_TAG,
    EM: EM_TAG,
    MARK: MARK_TAG,
    SMALL: SMALL_TAG,
    DEL: DEL_TAG,
    INS: INS_TAG,
    SUB: SUB_TAG,
    SUP: SUP_TAG
  },
  // these elements are typically associated with forms, and support certain attributes
  FORM_ELEMENTS: [INPUT_TAG, BUTTON_TAG, TEXTAREA_TAG, SELECT_TAG, OPTGROUP_TAG, DATALIST_TAG, OUTPUT_TAG, A_TAG],
  // default tags for html elements of the Node.
  DEFAULT_CONTAINER_TAG_NAME: DIV_TAG,
  DEFAULT_DESCRIPTION_TAG_NAME: P_TAG,
  DEFAULT_LABEL_TAG_NAME: P_TAG,
  ASSOCIATION_ATTRIBUTES: ASSOCIATION_ATTRIBUTES,
  // valid input types that support the "checked" property/attribute for input elements
  INPUT_TYPES_THAT_SUPPORT_CHECKED: ['RADIO', 'CHECKBOX'],
  DOM_EVENTS: DOM_EVENTS,
  USER_GESTURE_EVENTS: USER_GESTURE_EVENTS,
  BLOCKED_DOM_EVENTS: BLOCKED_DOM_EVENTS,
  DATA_PDOM_UNIQUE_ID: DATA_PDOM_UNIQUE_ID,
  PDOM_UNIQUE_ID_SEPARATOR: '-',
  // attribute used for elements which Scenery should not dispatch SceneryEvents when DOM event input is received on
  // them, see ParallelDOM.setExcludeLabelSiblingFromInput for more information
  DATA_EXCLUDE_FROM_INPUT: 'data-exclude-from-input'
};
scenery.register('PDOMUtils', PDOMUtils);
export default PDOMUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ2YWxpZGF0ZSIsIlZhbGlkYXRpb24iLCJtZXJnZSIsInN0cmlwRW1iZWRkaW5nTWFya3MiLCJQRE9NU2libGluZ1N0eWxlIiwic2NlbmVyeSIsIk5FWFQiLCJQUkVWSU9VUyIsIklOUFVUX1RBRyIsIkxBQkVMX1RBRyIsIkJVVFRPTl9UQUciLCJURVhUQVJFQV9UQUciLCJTRUxFQ1RfVEFHIiwiT1BUR1JPVVBfVEFHIiwiREFUQUxJU1RfVEFHIiwiT1VUUFVUX1RBRyIsIkRJVl9UQUciLCJBX1RBRyIsIkFSRUFfVEFHIiwiUF9UQUciLCJJRlJBTUVfVEFHIiwiQk9MRF9UQUciLCJTVFJPTkdfVEFHIiwiSV9UQUciLCJFTV9UQUciLCJNQVJLX1RBRyIsIlNNQUxMX1RBRyIsIkRFTF9UQUciLCJJTlNfVEFHIiwiU1VCX1RBRyIsIlNVUF9UQUciLCJCUl9UQUciLCJERUZBVUxUX0ZPQ1VTQUJMRV9UQUdTIiwiRk9STUFUVElOR19UQUdTIiwiRUxFTUVOVFNfV0lUSE9VVF9DTE9TSU5HX1RBRyIsIkRPTV9FVkVOVFMiLCJVU0VSX0dFU1RVUkVfRVZFTlRTIiwiQkxPQ0tFRF9ET01fRVZFTlRTIiwiQVJJQV9MQUJFTExFREJZIiwiQVJJQV9ERVNDUklCRURCWSIsIkFSSUFfQUNUSVZFX0RFU0NFTkRBTlQiLCJEQVRBX0ZPQ1VTQUJMRSIsIkRBVEFfUERPTV9VTklRVUVfSUQiLCJBU1NPQ0lBVElPTl9BVFRSSUJVVEVTIiwiZ2V0TGluZWFyRE9NRWxlbWVudHMiLCJkb21FbGVtZW50IiwiY2hpbGRyZW4iLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImxpbmVhckRPTSIsImkiLCJsZW5ndGgiLCJub2RlVHlwZSIsIk5vZGUiLCJFTEVNRU5UX05PREUiLCJpc0VsZW1lbnRIaWRkZW4iLCJoaWRkZW4iLCJkb2N1bWVudCIsImJvZHkiLCJwYXJlbnRFbGVtZW50IiwiZ2V0TmV4dFByZXZpb3VzRm9jdXNhYmxlIiwiZGlyZWN0aW9uIiwicGFyZW50IiwiYWN0aXZlRWxlbWVudCIsImFjdGl2ZUluZGV4IiwiaW5kZXhPZiIsImRlbHRhIiwibmV4dEluZGV4IiwibmV4dEVsZW1lbnQiLCJQRE9NVXRpbHMiLCJpc0VsZW1lbnRGb2N1c2FibGUiLCJ0cmltTGVmdCIsInN0cmluZyIsInJlcGxhY2UiLCJ0YWdOYW1lU3VwcG9ydHNDb250ZW50IiwidGFnTmFtZSIsIl8iLCJpbmNsdWRlcyIsInRvVXBwZXJDYXNlIiwidW53cmFwU3RyaW5nUHJvcGVydHkiLCJ2YWx1ZU9yUHJvcGVydHkiLCJyZXN1bHQiLCJ2YWx1ZSIsImFzc2VydCIsImdldE5leHRGb2N1c2FibGUiLCJnZXRQcmV2aW91c0ZvY3VzYWJsZSIsImdldEZpcnN0Rm9jdXNhYmxlIiwiZmlyc3RGb2N1c2FibGUiLCJnZXRSYW5kb21Gb2N1c2FibGUiLCJyYW5kb20iLCJmb2N1c2FibGVFbGVtZW50cyIsInB1c2giLCJuZXh0SW50IiwiY29udGFpbnNGb3JtYXR0aW5nVGFncyIsInRleHRDb250ZW50Iiwib3BlbkluZGljZXMiLCJjbG9zZUluZGljZXMiLCJvcGVuSW5kZXgiLCJjbG9zZUluZGV4Iiwib25seUZvcm1hdHRpbmciLCJ1cHBlckNhc2VDb250ZW50IiwiaiIsInN1YlN0cmluZyIsInN1YnN0cmluZyIsInRyaW1tZWQiLCJzZXRUZXh0Q29udGVudCIsIkVsZW1lbnQiLCJpbm5lckhUTUwiLCJ0ZXh0V2l0aG91dEJyZWFrcyIsInJlcGxhY2VBbGwiLCJ0ZXh0V2l0aG91dEVtYmVkZGluZ01hcmtzIiwiU1RSSU5HX1dJVEhPVVRfVEVNUExBVEVfVkFSU19WQUxJREFUT1IiLCJ0YWdJc0RlZmF1bHRGb2N1c2FibGUiLCJjb250YWlucyIsImdldEF0dHJpYnV0ZSIsInJlbW92ZUVsZW1lbnRzIiwiZWxlbWVudCIsImNoaWxkcmVuVG9SZW1vdmUiLCJjaGlsZFRvUmVtb3ZlIiwicmVtb3ZlQ2hpbGQiLCJpbnNlcnRFbGVtZW50cyIsImNoaWxkcmVuVG9BZGQiLCJiZWZvcmVUaGlzRWxlbWVudCIsIndpbmRvdyIsIkFycmF5IiwiaXNBcnJheSIsImNoaWxkVG9BZGQiLCJpbnNlcnRCZWZvcmUiLCJjcmVhdGVFbGVtZW50IiwiZm9jdXNhYmxlIiwib3B0aW9ucyIsIm5hbWVzcGFjZSIsImlkIiwiY3JlYXRlRWxlbWVudE5TIiwib3ZlcnJpZGVGb2N1c1dpdGhUYWJJbmRleCIsImNsYXNzTGlzdCIsImFkZCIsIlNJQkxJTkdfQ0xBU1NfTkFNRSIsImRlZmF1bHRGb2N1c2FibGUiLCJ0YWJJbmRleCIsInJlbW92ZUF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsIlRBR1MiLCJJTlBVVCIsIkxBQkVMIiwiQlVUVE9OIiwiVEVYVEFSRUEiLCJTRUxFQ1QiLCJPUFRHUk9VUCIsIkRBVEFMSVNUIiwiT1VUUFVUIiwiRElWIiwiQSIsIlAiLCJCIiwiU1RST05HIiwiSSIsIkVNIiwiTUFSSyIsIlNNQUxMIiwiREVMIiwiSU5TIiwiU1VCIiwiU1VQIiwiRk9STV9FTEVNRU5UUyIsIkRFRkFVTFRfQ09OVEFJTkVSX1RBR19OQU1FIiwiREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRSIsIkRFRkFVTFRfTEFCRUxfVEFHX05BTUUiLCJJTlBVVF9UWVBFU19USEFUX1NVUFBPUlRfQ0hFQ0tFRCIsIlBET01fVU5JUVVFX0lEX1NFUEFSQVRPUiIsIkRBVEFfRVhDTFVERV9GUk9NX0lOUFVUIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQRE9NVXRpbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVXRpbGl0eSBmdW5jdGlvbnMgZm9yIHNjZW5lcnkgdGhhdCBhcmUgc3BlY2lmaWNhbGx5IHVzZWZ1bCBmb3IgUGFyYWxsZWxET00uXHJcbiAqIFRoZXNlIGdlbmVyYWxseSBwZXJ0YWluIHRvIERPTSB0cmF2ZXJzYWwgYW5kIG1hbmlwdWxhdGlvbi5cclxuICpcclxuICogRm9yIHRoZSBtb3N0IHBhcnQgdGhpcyBmaWxlJ3MgbWV0aG9kcyBhcmUgcHVibGljIGluIGEgc2NlbmVyeS1pbnRlcm5hbCBjb250ZXh0LiBTb21lIGV4Y2VwdGlvbnMgYXBwbHkuIFBsZWFzZVxyXG4gKiBjb25zdWx0IEBqZXNzZWdyZWVuYmVyZyBhbmQvb3IgQHplcHVtcGggYmVmb3JlIHVzaW5nIHRoaXMgb3V0c2lkZSBvZiBzY2VuZXJ5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCB2YWxpZGF0ZSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL3ZhbGlkYXRlLmpzJztcclxuaW1wb3J0IFZhbGlkYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9WYWxpZGF0aW9uLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBzdHJpcEVtYmVkZGluZ01hcmtzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9zdHJpcEVtYmVkZGluZ01hcmtzLmpzJztcclxuaW1wb3J0IHsgUERPTVNpYmxpbmdTdHlsZSwgc2NlbmVyeSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE5FWFQgPSAnTkVYVCc7XHJcbmNvbnN0IFBSRVZJT1VTID0gJ1BSRVZJT1VTJztcclxuXHJcbi8vIEhUTUwgdGFnIG5hbWVzXHJcbmNvbnN0IElOUFVUX1RBRyA9ICdJTlBVVCc7XHJcbmNvbnN0IExBQkVMX1RBRyA9ICdMQUJFTCc7XHJcbmNvbnN0IEJVVFRPTl9UQUcgPSAnQlVUVE9OJztcclxuY29uc3QgVEVYVEFSRUFfVEFHID0gJ1RFWFRBUkVBJztcclxuY29uc3QgU0VMRUNUX1RBRyA9ICdTRUxFQ1QnO1xyXG5jb25zdCBPUFRHUk9VUF9UQUcgPSAnT1BUR1JPVVAnO1xyXG5jb25zdCBEQVRBTElTVF9UQUcgPSAnREFUQUxJU1QnO1xyXG5jb25zdCBPVVRQVVRfVEFHID0gJ09VVFBVVCc7XHJcbmNvbnN0IERJVl9UQUcgPSAnRElWJztcclxuY29uc3QgQV9UQUcgPSAnQSc7XHJcbmNvbnN0IEFSRUFfVEFHID0gJ0FSRUEnO1xyXG5jb25zdCBQX1RBRyA9ICdQJztcclxuY29uc3QgSUZSQU1FX1RBRyA9ICdJRlJBTUUnO1xyXG5cclxuLy8gdGFnIG5hbWVzIHdpdGggc3BlY2lhbCBiZWhhdmlvclxyXG5jb25zdCBCT0xEX1RBRyA9ICdCJztcclxuY29uc3QgU1RST05HX1RBRyA9ICdTVFJPTkcnO1xyXG5jb25zdCBJX1RBRyA9ICdJJztcclxuY29uc3QgRU1fVEFHID0gJ0VNJztcclxuY29uc3QgTUFSS19UQUcgPSAnTUFSSyc7XHJcbmNvbnN0IFNNQUxMX1RBRyA9ICdTTUFMTCc7XHJcbmNvbnN0IERFTF9UQUcgPSAnREVMJztcclxuY29uc3QgSU5TX1RBRyA9ICdJTlMnO1xyXG5jb25zdCBTVUJfVEFHID0gJ1NVQic7XHJcbmNvbnN0IFNVUF9UQUcgPSAnU1VQJztcclxuY29uc3QgQlJfVEFHID0gJ0JSJztcclxuXHJcbi8vIFRoZXNlIGJyb3dzZXIgdGFncyBhcmUgYSBkZWZpbml0aW9uIG9mIGRlZmF1bHQgZm9jdXNhYmxlIGVsZW1lbnRzLCBjb252ZXJ0ZWQgZnJvbSBKYXZhc2NyaXB0IHR5cGVzLFxyXG4vLyBzZWUgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTU5OTY2MC93aGljaC1odG1sLWVsZW1lbnRzLWNhbi1yZWNlaXZlLWZvY3VzXHJcbmNvbnN0IERFRkFVTFRfRk9DVVNBQkxFX1RBR1MgPSBbIEFfVEFHLCBBUkVBX1RBRywgSU5QVVRfVEFHLCBTRUxFQ1RfVEFHLCBURVhUQVJFQV9UQUcsIEJVVFRPTl9UQUcsIElGUkFNRV9UQUcgXTtcclxuXHJcbi8vIGNvbGxlY3Rpb24gb2YgdGFncyB0aGF0IGFyZSB1c2VkIGZvciBmb3JtYXR0aW5nIHRleHRcclxuY29uc3QgRk9STUFUVElOR19UQUdTID0gWyBCT0xEX1RBRywgU1RST05HX1RBRywgSV9UQUcsIEVNX1RBRywgTUFSS19UQUcsIFNNQUxMX1RBRywgREVMX1RBRywgSU5TX1RBRywgU1VCX1RBRyxcclxuICBTVVBfVEFHLCBCUl9UQUcgXTtcclxuXHJcbi8vIHRoZXNlIGVsZW1lbnRzIGRvIG5vdCBoYXZlIGEgY2xvc2luZyB0YWcsIHNvIHRoZXkgd29uJ3Qgc3VwcG9ydCBmZWF0dXJlcyBsaWtlIGlubmVySFRNTC4gVGhpcyBpcyBob3cgUGhFVCB0cmVhdHNcclxuLy8gdGhlc2UgZWxlbWVudHMsIG5vdCBuZWNlc3Nhcnkgd2hhdCBpcyBsZWdhbCBodG1sLlxyXG5jb25zdCBFTEVNRU5UU19XSVRIT1VUX0NMT1NJTkdfVEFHID0gWyBJTlBVVF9UQUcgXTtcclxuXHJcbi8vIHZhbGlkIERPTSBldmVudHMgdGhhdCB0aGUgZGlzcGxheSBhZGRzIGxpc3RlbmVycyB0by4gRm9yIGEgbGlzdCBvZiBzY2VuZXJ5IGV2ZW50cyB0aGF0IHN1cHBvcnQgcGRvbSBmZWF0dXJlc1xyXG4vLyBzZWUgSW5wdXQuUERPTV9FVkVOVF9UWVBFU1xyXG4vLyBOT1RFOiBVcGRhdGUgQnJvd3NlckV2ZW50cyBpZiB0aGlzIGlzIGFkZGVkIHRvXHJcbmNvbnN0IERPTV9FVkVOVFMgPSBbICdmb2N1c2luJywgJ2ZvY3Vzb3V0JywgJ2lucHV0JywgJ2NoYW5nZScsICdjbGljaycsICdrZXlkb3duJywgJ2tleXVwJyBdO1xyXG5cclxuLy8gRE9NIGV2ZW50cyB0aGF0IG11c3QgaGF2ZSBiZWVuIHRyaWdnZXJlZCBmcm9tIHVzZXIgaW5wdXQgb2Ygc29tZSBraW5kLCBhbmQgd2lsbCB0cmlnZ2VyIHRoZVxyXG4vLyBEaXNwbGF5LnVzZXJHZXN0dXJlRW1pdHRlci4gZm9jdXMgYW5kIGJsdXIgZXZlbnRzIHdpbGwgdHJpZ2dlciBmcm9tIHNjcmlwdGluZyBzbyB0aGV5IG11c3QgYmUgZXhjbHVkZWQuXHJcbmNvbnN0IFVTRVJfR0VTVFVSRV9FVkVOVFMgPSBbICdpbnB1dCcsICdjaGFuZ2UnLCAnY2xpY2snLCAna2V5ZG93bicsICdrZXl1cCcgXTtcclxuXHJcbi8vIEEgY29sbGVjdGlvbiBvZiBET00gZXZlbnRzIHdoaWNoIHNob3VsZCBiZSBibG9ja2VkIGZyb20gcmVhY2hpbmcgdGhlIHNjZW5lcnkgRGlzcGxheSBkaXZcclxuLy8gaWYgdGhleSBhcmUgdGFyZ2V0ZWQgYXQgYW4gYW5jZXN0b3Igb2YgdGhlIFBET00uIFNvbWUgc2NyZWVuIHJlYWRlcnMgdHJ5IHRvIHNlbmQgZmFrZVxyXG4vLyBtb3VzZS90b3VjaC9wb2ludGVyIGV2ZW50cyB0byBlbGVtZW50cyBidXQgZm9yIHRoZSBwdXJwb3NlcyBvZiBBY2Nlc3NpYmlsaXR5IHdlIG9ubHlcclxuLy8gd2FudCB0byByZXNwb25kIHRvIERPTV9FVkVOVFMuXHJcbmNvbnN0IEJMT0NLRURfRE9NX0VWRU5UUyA9IFtcclxuXHJcbiAgLy8gdG91Y2hcclxuICAndG91Y2hzdGFydCcsXHJcbiAgJ3RvdWNoZW5kJyxcclxuICAndG91Y2htb3ZlJyxcclxuICAndG91Y2hjYW5jZWwnLFxyXG5cclxuICAvLyBtb3VzZVxyXG4gICdtb3VzZWRvd24nLFxyXG4gICdtb3VzZXVwJyxcclxuICAnbW91c2Vtb3ZlJyxcclxuICAnbW91c2VvdmVyJyxcclxuICAnbW91c2VvdXQnLFxyXG5cclxuICAvLyBwb2ludGVyXHJcbiAgJ3BvaW50ZXJkb3duJyxcclxuICAncG9pbnRlcnVwJyxcclxuICAncG9pbnRlcm1vdmUnLFxyXG4gICdwb2ludGVyb3ZlcicsXHJcbiAgJ3BvaW50ZXJvdXQnLFxyXG4gICdwb2ludGVyY2FuY2VsJyxcclxuICAnZ290cG9pbnRlcmNhcHR1cmUnLFxyXG4gICdsb3N0cG9pbnRlcmNhcHR1cmUnXHJcbl07XHJcblxyXG5jb25zdCBBUklBX0xBQkVMTEVEQlkgPSAnYXJpYS1sYWJlbGxlZGJ5JztcclxuY29uc3QgQVJJQV9ERVNDUklCRURCWSA9ICdhcmlhLWRlc2NyaWJlZGJ5JztcclxuY29uc3QgQVJJQV9BQ1RJVkVfREVTQ0VOREFOVCA9ICdhcmlhLWFjdGl2ZWRlc2NlbmRhbnQnO1xyXG5cclxuLy8gZGF0YSBhdHRyaWJ1dGUgdG8gZmxhZyB3aGV0aGVyIGFuIGVsZW1lbnQgaXMgZm9jdXNhYmxlIC0gY2Fubm90IGNoZWNrIHRhYmluZGV4IGJlY2F1c2UgSUUxMSBhbmQgRWRnZSBhc3NpZ25cclxuLy8gdGFiSW5kZXg9MCBpbnRlcm5hbGx5IGZvciBhbGwgSFRNTCBlbGVtZW50cywgaW5jbHVkaW5nIHRob3NlIHRoYXQgc2hvdWxkIG5vdCByZWNlaXZlIGZvY3VzXHJcbmNvbnN0IERBVEFfRk9DVVNBQkxFID0gJ2RhdGEtZm9jdXNhYmxlJztcclxuXHJcbi8vIGRhdGEgYXR0cmlidXRlIHdoaWNoIGNvbnRhaW5zIHRoZSB1bmlxdWUgSUQgb2YgYSBUcmFpbCB0aGF0IGFsbG93cyB1cyB0byBmaW5kIHRoZSBQRE9NUGVlciBhc3NvY2lhdGVkXHJcbi8vIHdpdGggYSBwYXJ0aWN1bGFyIERPTSBlbGVtZW50LiBUaGlzIGlzIHVzZWQgaW4gc2V2ZXJhbCBwbGFjZXMgaW4gc2NlbmVyeSBhY2Nlc3NpYmlsaXR5LCBtb3N0bHkgUERPTVBlZXIgYW5kIElucHV0LlxyXG5jb25zdCBEQVRBX1BET01fVU5JUVVFX0lEID0gJ2RhdGEtdW5pcXVlLWlkJztcclxuXHJcbi8vIHtBcnJheS48U3RyaW5nPn0gYXR0cmlidXRlcyB0aGF0IHB1dCBhbiBJRCBvZiBhbm90aGVyIGF0dHJpYnV0ZSBhcyB0aGUgdmFsdWUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODE5XHJcbmNvbnN0IEFTU09DSUFUSU9OX0FUVFJJQlVURVMgPSBbIEFSSUFfTEFCRUxMRURCWSwgQVJJQV9ERVNDUklCRURCWSwgQVJJQV9BQ1RJVkVfREVTQ0VOREFOVCBdO1xyXG5cclxuLyoqXHJcbiAqIEdldCBhbGwgJ2VsZW1lbnQnIG5vZGVzIG9mZiB0aGUgcGFyZW50IGVsZW1lbnQsIHBsYWNpbmcgdGhlbSBpbiBhbiBhcnJheSBmb3IgZWFzeSB0cmF2ZXJzYWwuICBOb3RlIHRoYXQgdGhpc1xyXG4gKiBpbmNsdWRlcyBhbGwgZWxlbWVudHMsIGV2ZW4gdGhvc2UgdGhhdCBhcmUgJ2hpZGRlbicgb3IgcHVyZWx5IGZvciBzdHJ1Y3R1cmUuXHJcbiAqXHJcbiAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBkb21FbGVtZW50IC0gcGFyZW50IHdob3NlIGNoaWxkcmVuIHdpbGwgYmUgbGluZWFyaXplZFxyXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnRbXX1cclxuICovXHJcbmZ1bmN0aW9uIGdldExpbmVhckRPTUVsZW1lbnRzKCBkb21FbGVtZW50ICkge1xyXG5cclxuICAvLyBnZXRzIEFMTCBkZXNjZW5kYW50IGNoaWxkcmVuIGZvciB0aGUgZWxlbWVudFxyXG4gIGNvbnN0IGNoaWxkcmVuID0gZG9tRWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSggJyonICk7XHJcblxyXG4gIGNvbnN0IGxpbmVhckRPTSA9IFtdO1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xyXG5cclxuICAgIC8vIHNlYXJjaGluZyBmb3IgdGhlIEhUTUwgZWxlbWVudCBub2RlcyAoTk9UIFNjZW5lcnkgbm9kZXMpXHJcbiAgICBpZiAoIGNoaWxkcmVuWyBpIF0ubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFICkge1xyXG4gICAgICBsaW5lYXJET01bIGkgXSA9ICggY2hpbGRyZW5bIGkgXSApO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gbGluZWFyRE9NO1xyXG59XHJcblxyXG4vKipcclxuICogRGV0ZXJtaW5lIGlmIGFuIGVsZW1lbnQgaXMgaGlkZGVuLiAgQW4gZWxlbWVudCBpcyBjb25zaWRlcmVkICdoaWRkZW4nIGlmIGl0IChvciBhbnkgb2YgaXRzIGFuY2VzdG9ycykgaGFzIHRoZVxyXG4gKiAnaGlkZGVuJyBhdHRyaWJ1dGUuXHJcbiAqXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRvbUVsZW1lbnRcclxuICogQHJldHVybnMge0Jvb2xlYW59XHJcbiAqL1xyXG5mdW5jdGlvbiBpc0VsZW1lbnRIaWRkZW4oIGRvbUVsZW1lbnQgKSB7XHJcbiAgaWYgKCBkb21FbGVtZW50LmhpZGRlbiApIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBlbHNlIGlmICggZG9tRWxlbWVudCA9PT0gZG9jdW1lbnQuYm9keSApIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICByZXR1cm4gaXNFbGVtZW50SGlkZGVuKCBkb21FbGVtZW50LnBhcmVudEVsZW1lbnQgKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIG5leHQgb3IgcHJldmlvdXMgZm9jdXNhYmxlIGVsZW1lbnQgaW4gdGhlIHBhcmFsbGVsIERPTSB1bmRlciB0aGUgcGFyZW50IGVsZW1lbnQgYW5kIHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50bHlcclxuICogZm9jdXNlZCBlbGVtZW50LiBVc2VmdWwgaWYgeW91IG5lZWQgdG8gc2V0IGZvY3VzIGR5bmFtaWNhbGx5IG9yIG5lZWQgdG8gcHJldmVudCBkZWZhdWx0IGJlaGF2aW9yXHJcbiAqIHdoZW4gZm9jdXMgY2hhbmdlcy4gSWYgbm8gbmV4dCBvciBwcmV2aW91cyBmb2N1c2FibGUgaXMgZm91bmQsIGl0IHJldHVybnMgdGhlIGN1cnJlbnRseSBmb2N1c2VkIGVsZW1lbnQuXHJcbiAqIFRoaXMgZnVuY3Rpb24gc2hvdWxkIG5vdCBiZSB1c2VkIGRpcmVjdGx5LCB1c2UgZ2V0TmV4dEZvY3VzYWJsZSgpIG9yIGdldFByZXZpb3VzRm9jdXNhYmxlKCkgaW5zdGVhZC5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvbiAtIGRpcmVjdGlvbiBvZiB0cmF2ZXJzYWwsIG9uZSBvZiAnTkVYVCcgfCAnUFJFVklPVVMnXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtwYXJlbnRFbGVtZW50XSAtIG9wdGlvbmFsLCBzZWFyY2ggd2lsbCBiZSBsaW1pdGVkIHRvIGNoaWxkcmVuIG9mIHRoaXMgZWxlbWVudFxyXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXROZXh0UHJldmlvdXNGb2N1c2FibGUoIGRpcmVjdGlvbiwgcGFyZW50RWxlbWVudCApIHtcclxuXHJcbiAgLy8gbGluZWFyaXplIHRoZSBkb2N1bWVudCBbb3IgdGhlIGRlc2lyZWQgcGFyZW50XSBmb3IgdHJhdmVyc2FsXHJcbiAgY29uc3QgcGFyZW50ID0gcGFyZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xyXG4gIGNvbnN0IGxpbmVhckRPTSA9IGdldExpbmVhckRPTUVsZW1lbnRzKCBwYXJlbnQgKTtcclxuXHJcbiAgY29uc3QgYWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XHJcbiAgY29uc3QgYWN0aXZlSW5kZXggPSBsaW5lYXJET00uaW5kZXhPZiggYWN0aXZlRWxlbWVudCApO1xyXG4gIGNvbnN0IGRlbHRhID0gZGlyZWN0aW9uID09PSBORVhUID8gKzEgOiAtMTtcclxuXHJcbiAgLy8gZmluZCB0aGUgbmV4dCBmb2N1c2FibGUgZWxlbWVudCBpbiB0aGUgRE9NXHJcbiAgbGV0IG5leHRJbmRleCA9IGFjdGl2ZUluZGV4ICsgZGVsdGE7XHJcbiAgd2hpbGUgKCBuZXh0SW5kZXggPCBsaW5lYXJET00ubGVuZ3RoICYmIG5leHRJbmRleCA+PSAwICkge1xyXG4gICAgY29uc3QgbmV4dEVsZW1lbnQgPSBsaW5lYXJET01bIG5leHRJbmRleCBdO1xyXG4gICAgbmV4dEluZGV4ICs9IGRlbHRhO1xyXG5cclxuICAgIGlmICggUERPTVV0aWxzLmlzRWxlbWVudEZvY3VzYWJsZSggbmV4dEVsZW1lbnQgKSApIHtcclxuICAgICAgcmV0dXJuIG5leHRFbGVtZW50O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gaWYgbm8gbmV4dCBmb2N1c2FibGUgaXMgZm91bmQsIHJldHVybiB0aGUgYWN0aXZlIERPTSBlbGVtZW50XHJcbiAgcmV0dXJuIGFjdGl2ZUVsZW1lbnQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmltcyB0aGUgd2hpdGUgc3BhY2UgZnJvbSB0aGUgbGVmdCBvZiB0aGUgc3RyaW5nLlxyXG4gKiBTb2x1dGlvbiBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1OTM4NTkvbGVmdC10cmltLWluLWphdmFzY3JpcHRcclxuICogQHBhcmFtICB7c3RyaW5nfSBzdHJpbmdcclxuICogQHJldHVybnMge3N0cmluZ31cclxuICovXHJcbmZ1bmN0aW9uIHRyaW1MZWZ0KCBzdHJpbmcgKSB7XHJcblxyXG4gIC8vIF4gLSBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHN0cmluZ1xyXG4gIC8vIFxccyAtIHdoaXRlc3BhY2UgY2hhcmFjdGVyXHJcbiAgLy8gKyAtIGdyZWVkeVxyXG4gIHJldHVybiBzdHJpbmcucmVwbGFjZSggL15cXHMrLywgJycgKTtcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB0YWdOYW1lIHN1cHBvcnRzIGlubmVySFRNTCBvciB0ZXh0Q29udGVudCBpbiBQaEVULlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFnTmFtZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIHRhZ05hbWVTdXBwb3J0c0NvbnRlbnQoIHRhZ05hbWUgKSB7XHJcbiAgcmV0dXJuICFfLmluY2x1ZGVzKCBFTEVNRU5UU19XSVRIT1VUX0NMT1NJTkdfVEFHLCB0YWdOYW1lLnRvVXBwZXJDYXNlKCkgKTtcclxufVxyXG5cclxuY29uc3QgUERPTVV0aWxzID0ge1xyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBhIFByb3BlcnR5IG9yIHN0cmluZywgcmV0dXJuIHRoZSBQcm9wZXJneSB2YWx1ZSBpZiBpdCBpcyBhIHByb3BlcnR5LiBPdGhlcndpc2UganVzdCByZXR1cm4gdGhlIHN0cmluZy5cclxuICAgKiBVc2VmdWwgZm9yIGZvcndhcmRpbmcgdGhlIHN0cmluZyB0byBET00gY29udGVudCwgYnV0IGFsbG93aW5nIHRoZSBBUEkgdG8gdGFrZSBhIFN0cmluZ1Byb3BlcnR5LiBFdmVudHVhbGx5XHJcbiAgICogUERPTSBtYXkgc3VwcG9ydCBkeW5hbWljIHN0cmluZ3MuXHJcbiAgICogQHBhcmFtIHZhbHVlT3JQcm9wZXJ0eVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd8UHJvcGVydHl9XHJcbiAgICovXHJcbiAgdW53cmFwU3RyaW5nUHJvcGVydHkoIHZhbHVlT3JQcm9wZXJ0eSApIHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IHZhbHVlT3JQcm9wZXJ0eSA9PT0gbnVsbCA/IG51bGwgOiAoIHR5cGVvZiB2YWx1ZU9yUHJvcGVydHkgPT09ICdzdHJpbmcnID8gdmFsdWVPclByb3BlcnR5IDogdmFsdWVPclByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0ID09PSBudWxsIHx8IHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnICk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIG5leHQgZm9jdXNhYmxlIGVsZW1lbnQgcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnRseSBmb2N1c2VkIGVsZW1lbnQgYW5kIHVuZGVyIHRoZSBwYXJlbnRFbGVtZW50LlxyXG4gICAqIENhbiBiZSB1c2VmdWwgaWYgeW91IHdhbnQgdG8gZW11bGF0ZSB0aGUgJ1RhYicga2V5IGJlaGF2aW9yIG9yIGp1c3QgdHJhbnNpdGlvbiBmb2N1cyB0byB0aGUgbmV4dCBlbGVtZW50XHJcbiAgICogaW4gdGhlIGRvY3VtZW50LiBJZiBubyBuZXh0IGZvY3VzYWJsZSBjYW4gYmUgZm91bmQsIGl0IHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50bHkgZm9jdXNlZCBlbGVtZW50LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtwYXJlbnRFbGVtZW50XSAtIG9wdGlvbmFsLCBzZWFyY2ggd2lsbCBiZSBsaW1pdGVkIHRvIGVsZW1lbnRzIHVuZGVyIHRoaXMgZWxlbWVudFxyXG4gICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cclxuICAgKi9cclxuICBnZXROZXh0Rm9jdXNhYmxlKCBwYXJlbnRFbGVtZW50ICkge1xyXG4gICAgcmV0dXJuIGdldE5leHRQcmV2aW91c0ZvY3VzYWJsZSggTkVYVCwgcGFyZW50RWxlbWVudCApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgcHJldmlvdXMgZm9jdXNhYmxlIGVsZW1lbnQgcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnRseSBmb2N1c2VkIGVsZW1lbnQgdW5kZXIgdGhlIHBhcmVudEVsZW1lbnQuIENhbiBiZVxyXG4gICAqIHVzZWZ1bCBpZiB5b3Ugd2FudCB0byBlbXVsYXRlICdTaGlmdCtUYWInIGJlaGF2aW9yLiBJZiBubyBuZXh0IGZvY3VzYWJsZSBjYW4gYmUgZm91bmQsIGl0IHdpbGwgcmV0dXJuIHRoZVxyXG4gICAqIGN1cnJlbnRseSBmb2N1c2VkIGVsZW1lbnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gW3BhcmVudEVsZW1lbnRdIC0gb3B0aW9uYWwsIHNlYXJjaCB3aWxsIGJlIGxpbWl0ZWQgdG8gZWxlbWVudHMgdW5kZXIgdGhpcyBwYXJlbnRcclxuICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XHJcbiAgICovXHJcbiAgZ2V0UHJldmlvdXNGb2N1c2FibGUoIHBhcmVudEVsZW1lbnQgKSB7XHJcbiAgICByZXR1cm4gZ2V0TmV4dFByZXZpb3VzRm9jdXNhYmxlKCBQUkVWSU9VUywgcGFyZW50RWxlbWVudCApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgZmlyc3QgZm9jdXNhYmxlIGVsZW1lbnQgdW5kZXIgdGhlIHBhcmVudEVsZW1lbnQuIElmIG5vIGVsZW1lbnQgaXMgYXZhaWxhYmxlLCB0aGUgZG9jdW1lbnQuYm9keSBpc1xyXG4gICAqIHJldHVybmVkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gW3BhcmVudEVsZW1lbnRdIC0gb3B0aW9uYWxseSByZXN0cmljdCB0aGUgc2VhcmNoIHRvIGVsZW1lbnRzIHVuZGVyIHRoaXMgcGFyZW50XHJcbiAgICogQHJldHVybnMge0hUTUxFbGVtZW50fVxyXG4gICAqL1xyXG4gIGdldEZpcnN0Rm9jdXNhYmxlKCBwYXJlbnRFbGVtZW50ICkge1xyXG4gICAgY29uc3QgcGFyZW50ID0gcGFyZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xyXG4gICAgY29uc3QgbGluZWFyRE9NID0gZ2V0TGluZWFyRE9NRWxlbWVudHMoIHBhcmVudCApO1xyXG5cclxuICAgIC8vIHJldHVybiB0aGUgZG9jdW1lbnQuYm9keSBpZiBubyBlbGVtZW50IGlzIGZvdW5kXHJcbiAgICBsZXQgZmlyc3RGb2N1c2FibGUgPSBkb2N1bWVudC5ib2R5O1xyXG5cclxuICAgIGxldCBuZXh0SW5kZXggPSAwO1xyXG4gICAgd2hpbGUgKCBuZXh0SW5kZXggPCBsaW5lYXJET00ubGVuZ3RoICkge1xyXG4gICAgICBjb25zdCBuZXh0RWxlbWVudCA9IGxpbmVhckRPTVsgbmV4dEluZGV4IF07XHJcbiAgICAgIG5leHRJbmRleCsrO1xyXG5cclxuICAgICAgaWYgKCBQRE9NVXRpbHMuaXNFbGVtZW50Rm9jdXNhYmxlKCBuZXh0RWxlbWVudCApICkge1xyXG4gICAgICAgIGZpcnN0Rm9jdXNhYmxlID0gbmV4dEVsZW1lbnQ7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmlyc3RGb2N1c2FibGU7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJuIGEgcmFuZG9tIGZvY3VzYWJsZSBlbGVtZW50IGluIHRoZSBkb2N1bWVudC4gUGFydGljdWxhcmx5IHVzZWZ1bCBmb3IgZnV6eiB0ZXN0aW5nLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJtYSB7UmFuZG9tfSByYW5kb21cclxuICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XHJcbiAgICovXHJcbiAgZ2V0UmFuZG9tRm9jdXNhYmxlKCByYW5kb20gKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByYW5kb20sICdSYW5kb20gZXhwZWN0ZWQnICk7XHJcblxyXG4gICAgY29uc3QgbGluZWFyRE9NID0gZ2V0TGluZWFyRE9NRWxlbWVudHMoIGRvY3VtZW50LmJvZHkgKTtcclxuICAgIGNvbnN0IGZvY3VzYWJsZUVsZW1lbnRzID0gW107XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaW5lYXJET00ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIFBET01VdGlscy5pc0VsZW1lbnRGb2N1c2FibGUoIGxpbmVhckRPTVsgaSBdICkgJiYgZm9jdXNhYmxlRWxlbWVudHMucHVzaCggbGluZWFyRE9NWyBpIF0gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZm9jdXNhYmxlRWxlbWVudHNbIHJhbmRvbS5uZXh0SW50KCBmb2N1c2FibGVFbGVtZW50cy5sZW5ndGggKSBdO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIElmIHRoZSB0ZXh0Q29udGVudCBoYXMgYW55IHRhZ3MgdGhhdCBhcmUgbm90IGZvcm1hdHRpbmcgdGFncywgcmV0dXJuIGZhbHNlLiBPbmx5IGNoZWNraW5nIGZvclxyXG4gICAqIHRhZ3MgdGhhdCBhcmUgbm90IGluIHRoZSB3aGl0ZWxpc3QgRk9STUFUVElOR19UQUdTLiBJZiB0aGVyZSBhcmUgbm8gdGFncyBhdCBhbGwsIHJldHVybiBmYWxzZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dENvbnRlbnRcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBjb250YWluc0Zvcm1hdHRpbmdUYWdzKCB0ZXh0Q29udGVudCApIHtcclxuXHJcbiAgICAvLyBuby1vcCBmb3IgbnVsbCBjYXNlXHJcbiAgICBpZiAoIHRleHRDb250ZW50ID09PSBudWxsICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdGV4dENvbnRlbnQgPT09ICdzdHJpbmcnLCAndW5zdXBwb3J0ZWQgdHlwZSBmb3IgdGV4dENvbnRlbnQuJyApO1xyXG5cclxuICAgIGxldCBpID0gMDtcclxuICAgIGNvbnN0IG9wZW5JbmRpY2VzID0gW107XHJcbiAgICBjb25zdCBjbG9zZUluZGljZXMgPSBbXTtcclxuXHJcbiAgICAvLyBmaW5kIG9wZW4vY2xvc2UgdGFnIHBhaXJzIGluIHRoZSB0ZXh0IGNvbnRlbnRcclxuICAgIHdoaWxlICggaSA8IHRleHRDb250ZW50Lmxlbmd0aCApIHtcclxuICAgICAgY29uc3Qgb3BlbkluZGV4ID0gdGV4dENvbnRlbnQuaW5kZXhPZiggJzwnLCBpICk7XHJcbiAgICAgIGNvbnN0IGNsb3NlSW5kZXggPSB0ZXh0Q29udGVudC5pbmRleE9mKCAnPicsIGkgKTtcclxuXHJcbiAgICAgIGlmICggb3BlbkluZGV4ID4gLTEgKSB7XHJcbiAgICAgICAgb3BlbkluZGljZXMucHVzaCggb3BlbkluZGV4ICk7XHJcbiAgICAgICAgaSA9IG9wZW5JbmRleCArIDE7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBjbG9zZUluZGV4ID4gLTEgKSB7XHJcbiAgICAgICAgY2xvc2VJbmRpY2VzLnB1c2goIGNsb3NlSW5kZXggKTtcclxuICAgICAgICBpID0gY2xvc2VJbmRleCArIDE7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgaSsrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbWFsZm9ybWVkIHRhZ3Mgb3Igbm8gdGFncyBhdCBhbGwsIHJldHVybiBmYWxzZSBpbW1lZGlhdGVseVxyXG4gICAgaWYgKCBvcGVuSW5kaWNlcy5sZW5ndGggIT09IGNsb3NlSW5kaWNlcy5sZW5ndGggfHwgb3BlbkluZGljZXMubGVuZ3RoID09PSAwICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hlY2sgdGhlIG5hbWUgaW4gYmV0d2VlbiB0aGUgb3BlbiBhbmQgY2xvc2UgYnJhY2tldHMgLSBpZiBhbnl0aGluZyBvdGhlciB0aGFuIGZvcm1hdHRpbmcgdGFncywgcmV0dXJuIGZhbHNlXHJcbiAgICBsZXQgb25seUZvcm1hdHRpbmcgPSB0cnVlO1xyXG4gICAgY29uc3QgdXBwZXJDYXNlQ29udGVudCA9IHRleHRDb250ZW50LnRvVXBwZXJDYXNlKCk7XHJcbiAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBvcGVuSW5kaWNlcy5sZW5ndGg7IGorKyApIHtcclxuXHJcbiAgICAgIC8vIGdldCB0aGUgbmFtZSBhbmQgcmVtb3ZlIHRoZSBjbG9zaW5nIHNsYXNoXHJcbiAgICAgIGxldCBzdWJTdHJpbmcgPSB1cHBlckNhc2VDb250ZW50LnN1YnN0cmluZyggb3BlbkluZGljZXNbIGogXSArIDEsIGNsb3NlSW5kaWNlc1sgaiBdICk7XHJcbiAgICAgIHN1YlN0cmluZyA9IHN1YlN0cmluZy5yZXBsYWNlKCAnLycsICcnICk7XHJcblxyXG4gICAgICAvLyBpZiB0aGUgbGVmdCBvZiB0aGUgc3Vic3RyaW5nIGNvbnRhaW5zIHNwYWNlLCBpdCBpcyBub3QgYSB2YWxpZCB0YWcgc28gYWxsb3dcclxuICAgICAgY29uc3QgdHJpbW1lZCA9IHRyaW1MZWZ0KCBzdWJTdHJpbmcgKTtcclxuICAgICAgaWYgKCBzdWJTdHJpbmcubGVuZ3RoIC0gdHJpbW1lZC5sZW5ndGggPiAwICkge1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoICFfLmluY2x1ZGVzKCBGT1JNQVRUSU5HX1RBR1MsIHN1YlN0cmluZyApICkge1xyXG4gICAgICAgIG9ubHlGb3JtYXR0aW5nID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb25seUZvcm1hdHRpbmc7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogSWYgdGhlIHRleHQgY29udGVudCB1c2VzIGZvcm1hdHRpbmcgdGFncywgc2V0IHRoZSBjb250ZW50IGFzIGlubmVySFRNTC4gT3RoZXJ3aXNlLCBzZXQgYXMgdGV4dENvbnRlbnQuXHJcbiAgICogSW4gZ2VuZXJhbCwgdGV4dENvbnRlbnQgaXMgbW9yZSBzZWN1cmUgYW5kIG11Y2ggZmFzdGVyIGJlY2F1c2UgaXQgZG9lc24ndCB0cmlnZ2VyIERPTSBzdHlsaW5nIGFuZFxyXG4gICAqIGVsZW1lbnQgaW5zZXJ0aW9ucy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGRvbUVsZW1lbnRcclxuICAgKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ8bnVsbH0gdGV4dENvbnRlbnQgLSBkb21FbGVtZW50IGlzIGNsZWFyZWQgb2YgY29udGVudCBpZiBudWxsLCBjb3VsZCBoYXZlIGFjY2VwdGFibGUgSFRNTFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJmb3JtYXR0aW5nXCIgdGFncyBpbiBpdFxyXG4gICAqL1xyXG4gIHNldFRleHRDb250ZW50KCBkb21FbGVtZW50LCB0ZXh0Q29udGVudCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRvbUVsZW1lbnQgaW5zdGFuY2VvZiBFbGVtZW50ICk7IC8vIHBhcmVudCB0byBIVE1MRWxlbWVudCwgdG8gc3VwcG9ydCBvdGhlciBuYW1lc3BhY2VzXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0ZXh0Q29udGVudCA9PT0gbnVsbCB8fCB0eXBlb2YgdGV4dENvbnRlbnQgPT09ICdzdHJpbmcnICk7XHJcblxyXG4gICAgaWYgKCB0ZXh0Q29udGVudCA9PT0gbnVsbCApIHtcclxuICAgICAgZG9tRWxlbWVudC5pbm5lckhUTUwgPSAnJztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gWEhUTUwgcmVxdWlyZXMgPGJyLz4gaW5zdGVhZCBvZiA8YnI+LCBidXQgPGJyLz4gaXMgc3RpbGwgdmFsaWQgaW4gSFRNTC4gU2VlXHJcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMzA5XHJcbiAgICAgIGNvbnN0IHRleHRXaXRob3V0QnJlYWtzID0gdGV4dENvbnRlbnQucmVwbGFjZUFsbCggJzxicj4nLCAnPGJyLz4nICk7XHJcblxyXG4gICAgICAvLyBUT0RPOiB0aGlzIGxpbmUgbXVzdCBiZSByZW1vdmVkIHRvIHN1cHBvcnQgaTE4biBJbnRlcmFjdGl2ZSBEZXNjcmlwdGlvbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy83OThcclxuICAgICAgY29uc3QgdGV4dFdpdGhvdXRFbWJlZGRpbmdNYXJrcyA9IHN0cmlwRW1iZWRkaW5nTWFya3MoIHRleHRXaXRob3V0QnJlYWtzICk7XHJcblxyXG4gICAgICAvLyBEaXNhbGxvdyBhbnkgdW5maWxsZWQgdGVtcGxhdGUgdmFyaWFibGVzIHRvIGJlIHNldCBpbiB0aGUgUERPTS5cclxuICAgICAgdmFsaWRhdGUoIHRleHRXaXRob3V0RW1iZWRkaW5nTWFya3MsIFZhbGlkYXRpb24uU1RSSU5HX1dJVEhPVVRfVEVNUExBVEVfVkFSU19WQUxJREFUT1IgKTtcclxuXHJcbiAgICAgIGlmICggdGFnTmFtZVN1cHBvcnRzQ29udGVudCggZG9tRWxlbWVudC50YWdOYW1lICkgKSB7XHJcblxyXG4gICAgICAgIC8vIG9ubHkgcmV0dXJucyB0cnVlIGlmIGNvbnRlbnQgY29udGFpbnMgbGlzdGVkIGZvcm1hdHRpbmcgdGFnc1xyXG4gICAgICAgIGlmICggUERPTVV0aWxzLmNvbnRhaW5zRm9ybWF0dGluZ1RhZ3MoIHRleHRXaXRob3V0RW1iZWRkaW5nTWFya3MgKSApIHtcclxuICAgICAgICAgIGRvbUVsZW1lbnQuaW5uZXJIVE1MID0gdGV4dFdpdGhvdXRFbWJlZGRpbmdNYXJrcztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBkb21FbGVtZW50LnRleHRDb250ZW50ID0gdGV4dFdpdGhvdXRFbWJlZGRpbmdNYXJrcztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBhIHRhZ05hbWUsIHRlc3QgaWYgdGhlIGVsZW1lbnQgd2lsbCBiZSBmb2N1YWJsZSBieSBkZWZhdWx0IGJ5IHRoZSBicm93c2VyLlxyXG4gICAqIERpZmZlcmVudCBmcm9tIGlzRWxlbWVudEZvY3VzYWJsZSwgYmVjYXVzZSB0aGlzIG9ubHkgbG9va3MgYXQgdGFncyB0aGF0IHRoZSBicm93c2VyIHdpbGwgYXV0b21hdGljYWxseSBwdXRcclxuICAgKiBhID49MCB0YWIgaW5kZXggb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogTk9URTogVXNlcyBhIHNldCBvZiBicm93c2VyIHR5cGVzIGFzIHRoZSBkZWZpbml0aW9uIG9mIGRlZmF1bHQgZm9jdXNhYmxlIGVsZW1lbnRzLFxyXG4gICAqIHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNTk5NjYwL3doaWNoLWh0bWwtZWxlbWVudHMtY2FuLXJlY2VpdmUtZm9jdXNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB0YWdOYW1lXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgdGFnSXNEZWZhdWx0Rm9jdXNhYmxlKCB0YWdOYW1lICkge1xyXG4gICAgcmV0dXJuIF8uaW5jbHVkZXMoIERFRkFVTFRfRk9DVVNBQkxFX1RBR1MsIHRhZ05hbWUudG9VcHBlckNhc2UoKSApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZWxlbWVudCBpcyBmb2N1c2FibGUuIEFzc3VtZXMgdGhhdCBhbGwgZm9jdXNhYmxlICBlbGVtZW50cyBoYXZlIHRhYkluZGV4ID49IDAsIHdoaWNoXHJcbiAgICogaXMgb25seSB0cnVlIGZvciBlbGVtZW50cyBvZiB0aGUgUGFyYWxsZWwgRE9NLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZG9tRWxlbWVudFxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzRWxlbWVudEZvY3VzYWJsZSggZG9tRWxlbWVudCApIHtcclxuXHJcbiAgICBpZiAoICFkb2N1bWVudC5ib2R5LmNvbnRhaW5zKCBkb21FbGVtZW50ICkgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjb250aW51ZSB0byBuZXh0IGVsZW1lbnQgaWYgdGhpcyBvbmUgaXMgbWVhbnQgdG8gYmUgaGlkZGVuXHJcbiAgICBpZiAoIGlzRWxlbWVudEhpZGRlbiggZG9tRWxlbWVudCApICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgZWxlbWVudCBpcyBmb3IgZm9ybWF0dGluZywgc2tpcGUgb3ZlciBpdCAtIHJlcXVpcmVkIHNpbmNlIElFIGdpdmVzIHRoZXNlIHRhYmluZGV4PVwiMFwiXHJcbiAgICBpZiAoIF8uaW5jbHVkZXMoIEZPUk1BVFRJTkdfVEFHUywgZG9tRWxlbWVudC50YWdOYW1lICkgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZG9tRWxlbWVudC5nZXRBdHRyaWJ1dGUoIERBVEFfRk9DVVNBQkxFICkgPT09ICd0cnVlJztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnTmFtZVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIHRydWUgaWYgdGhlIHRhZyBkb2VzIHN1cHBvcnQgaW5uZXIgY29udGVudFxyXG4gICAqL1xyXG4gIHRhZ05hbWVTdXBwb3J0c0NvbnRlbnQoIHRhZ05hbWUgKSB7XHJcbiAgICByZXR1cm4gdGFnTmFtZVN1cHBvcnRzQ29udGVudCggdGFnTmFtZSApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0byByZW1vdmUgbXVsdGlwbGUgSFRNTEVsZW1lbnRzIGZyb20gYW5vdGhlciBIVE1MRWxlbWVudFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgKiBAcGFyYW0ge0FycmF5LjxIVE1MRWxlbWVudD59IGNoaWxkcmVuVG9SZW1vdmVcclxuICAgKi9cclxuICByZW1vdmVFbGVtZW50cyggZWxlbWVudCwgY2hpbGRyZW5Ub1JlbW92ZSApIHtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjaGlsZHJlblRvUmVtb3ZlLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBjaGlsZFRvUmVtb3ZlID0gY2hpbGRyZW5Ub1JlbW92ZVsgaSBdO1xyXG5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZWxlbWVudC5jb250YWlucyggY2hpbGRUb1JlbW92ZSApLCAnZWxlbWVudCBkb2VzIG5vdCBjb250YWluIGNoaWxkIHRvIGJlIHJlbW92ZWQ6ICcsIGNoaWxkVG9SZW1vdmUgKTtcclxuXHJcbiAgICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQoIGNoaWxkVG9SZW1vdmUgKTtcclxuICAgIH1cclxuXHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRvIGFkZCBtdWx0aXBsZSBlbGVtZW50cyBhcyBjaGlsZHJlbiB0byBhIHBhcmVudFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgLSB0byBhZGQgY2hpbGRyZW4gdG9cclxuICAgKiBAcGFyYW0ge0FycmF5LjxIVE1MRWxlbWVudD59IGNoaWxkcmVuVG9BZGRcclxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBbYmVmb3JlVGhpc0VsZW1lbnRdIC0gaWYgbm90IHN1cHBsaWVkLCB0aGUgaW5zZXJ0QmVmb3JlIGNhbGwgd2lsbCBqdXN0IHVzZSAnbnVsbCdcclxuICAgKi9cclxuICBpbnNlcnRFbGVtZW50cyggZWxlbWVudCwgY2hpbGRyZW5Ub0FkZCwgYmVmb3JlVGhpc0VsZW1lbnQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlbGVtZW50IGluc3RhbmNlb2Ygd2luZG93LkVsZW1lbnQgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGNoaWxkcmVuVG9BZGQgKSApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY2hpbGRyZW5Ub0FkZC5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgY2hpbGRUb0FkZCA9IGNoaWxkcmVuVG9BZGRbIGkgXTtcclxuICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoIGNoaWxkVG9BZGQsIGJlZm9yZVRoaXNFbGVtZW50IHx8IG51bGwgKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYW4gSFRNTCBlbGVtZW50LiAgVW5sZXNzIHRoaXMgaXMgYSBmb3JtIGVsZW1lbnQgb3IgZXhwbGljaXRseSBtYXJrZWQgYXMgZm9jdXNhYmxlLCBhZGQgYSBuZWdhdGl2ZVxyXG4gICAqIHRhYiBpbmRleC4gSUUgZ2l2ZXMgYWxsIGVsZW1lbnRzIGEgdGFiSW5kZXggb2YgMCBhbmQgaGFuZGxlcyB0YWIgbmF2aWdhdGlvbiBpbnRlcm5hbGx5LCBzbyB0aGlzIG1hcmtzXHJcbiAgICogd2hpY2ggZWxlbWVudHMgc2hvdWxkIG5vdCBiZSBpbiB0aGUgZm9jdXMgb3JkZXIuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtICB7c3RyaW5nfSB0YWdOYW1lXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBmb2N1c2FibGUgLSBzaG91bGQgdGhlIGVsZW1lbnQgYmUgZXhwbGljaXRseSBhZGRlZCB0byB0aGUgZm9jdXMgb3JkZXI/XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cclxuICAgKi9cclxuICBjcmVhdGVFbGVtZW50KCB0YWdOYW1lLCBmb2N1c2FibGUsIG9wdGlvbnMgKSB7XHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgLy8ge3N0cmluZ3xudWxsfSAtIElmIG5vbi1udWxsLCB0aGUgZWxlbWVudCB3aWxsIGJlIGNyZWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWMgbmFtZXNwYWNlXHJcbiAgICAgIG5hbWVzcGFjZTogbnVsbCxcclxuXHJcbiAgICAgIC8vIHtzdHJpbmd8bnVsbH0gLSBBIHN0cmluZyBpZCB0aGF0IHVuaXF1ZWx5IHJlcHJlc2VudHMgdGhpcyBlbGVtZW50IGluIHRoZSBET00sIG11c3QgYmUgY29tcGxldGVseVxyXG4gICAgICAvLyB1bmlxdWUgaW4gdGhlIERPTS5cclxuICAgICAgaWQ6IG51bGxcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBkb21FbGVtZW50ID0gb3B0aW9ucy5uYW1lc3BhY2VcclxuICAgICAgICAgICAgICAgICAgICAgICA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggb3B0aW9ucy5uYW1lc3BhY2UsIHRhZ05hbWUgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggdGFnTmFtZSApO1xyXG5cclxuICAgIGlmICggb3B0aW9ucy5pZCApIHtcclxuICAgICAgZG9tRWxlbWVudC5pZCA9IG9wdGlvbnMuaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2V0IHRhYiBpbmRleCBpZiB3ZSBhcmUgb3ZlcnJpZGluZyBkZWZhdWx0IGJyb3dzZXIgYmVoYXZpb3JcclxuICAgIFBET01VdGlscy5vdmVycmlkZUZvY3VzV2l0aFRhYkluZGV4KCBkb21FbGVtZW50LCBmb2N1c2FibGUgKTtcclxuXHJcbiAgICAvLyBnaXZlcyB0aGlzIGVsZW1lbnQgc3R5bGluZyBmcm9tIFNjZW5lcnlTdHlsZVxyXG4gICAgZG9tRWxlbWVudC5jbGFzc0xpc3QuYWRkKCBQRE9NU2libGluZ1N0eWxlLlNJQkxJTkdfQ0xBU1NfTkFNRSApO1xyXG5cclxuICAgIHJldHVybiBkb21FbGVtZW50O1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhIHRhYiBpbmRleCB0byBhbiBlbGVtZW50IHdoZW4gb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBmb2N1cyBiZWhhdmlvciBmb3IgdGhlIGVsZW1lbnQuIEFkZGluZyB0YWJpbmRleFxyXG4gICAqIHRvIGFuIGVsZW1lbnQgY2FuIG9ubHkgYmUgZG9uZSB3aGVuIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgYnJvd3NlciBiZWhhdmlvciBiZWNhdXNlIHRhYmluZGV4IGludGVyZmVyZXMgd2l0aFxyXG4gICAqIHRoZSB3YXkgSkFXUyByZWFkcyB0aHJvdWdoIGNvbnRlbnQgb24gQ2hyb21lLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg5M1xyXG4gICAqXHJcbiAgICogSWYgZGVmYXVsdCBiZWhhdmlvciBhbmQgZm9jdXNhYmxlIGFsaWduLCB0aGUgdGFiaW5kZXggYXR0cmlidXRlIGlzIHJlbW92ZWQgc28gdGhhdCBjYW4ndCBpbnRlcmZlcmUgd2l0aCBhXHJcbiAgICogc2NyZWVuIHJlYWRlci5cclxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9jdXNhYmxlXHJcbiAgICovXHJcbiAgb3ZlcnJpZGVGb2N1c1dpdGhUYWJJbmRleCggZWxlbWVudCwgZm9jdXNhYmxlICkge1xyXG4gICAgY29uc3QgZGVmYXVsdEZvY3VzYWJsZSA9IFBET01VdGlscy50YWdJc0RlZmF1bHRGb2N1c2FibGUoIGVsZW1lbnQudGFnTmFtZSApO1xyXG5cclxuICAgIC8vIG9ubHkgYWRkIGEgdGFiaW5kZXggd2hlbiB3ZSBhcmUgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBmb2N1c2FibGUgYmFodmlvciBvZiB0aGUgYnJvd3NlciBmb3IgdGhlIHRhZyBuYW1lXHJcbiAgICBpZiAoIGRlZmF1bHRGb2N1c2FibGUgIT09IGZvY3VzYWJsZSApIHtcclxuICAgICAgZWxlbWVudC50YWJJbmRleCA9IGZvY3VzYWJsZSA/IDAgOiAtMTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSggJ3RhYmluZGV4JyApO1xyXG4gICAgfVxyXG5cclxuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCBEQVRBX0ZPQ1VTQUJMRSwgZm9jdXNhYmxlICk7XHJcbiAgfSxcclxuXHJcbiAgVEFHUzoge1xyXG4gICAgSU5QVVQ6IElOUFVUX1RBRyxcclxuICAgIExBQkVMOiBMQUJFTF9UQUcsXHJcbiAgICBCVVRUT046IEJVVFRPTl9UQUcsXHJcbiAgICBURVhUQVJFQTogVEVYVEFSRUFfVEFHLFxyXG4gICAgU0VMRUNUOiBTRUxFQ1RfVEFHLFxyXG4gICAgT1BUR1JPVVA6IE9QVEdST1VQX1RBRyxcclxuICAgIERBVEFMSVNUOiBEQVRBTElTVF9UQUcsXHJcbiAgICBPVVRQVVQ6IE9VVFBVVF9UQUcsXHJcbiAgICBESVY6IERJVl9UQUcsXHJcbiAgICBBOiBBX1RBRyxcclxuICAgIFA6IFBfVEFHLFxyXG4gICAgQjogQk9MRF9UQUcsXHJcbiAgICBTVFJPTkc6IFNUUk9OR19UQUcsXHJcbiAgICBJOiBJX1RBRyxcclxuICAgIEVNOiBFTV9UQUcsXHJcbiAgICBNQVJLOiBNQVJLX1RBRyxcclxuICAgIFNNQUxMOiBTTUFMTF9UQUcsXHJcbiAgICBERUw6IERFTF9UQUcsXHJcbiAgICBJTlM6IElOU19UQUcsXHJcbiAgICBTVUI6IFNVQl9UQUcsXHJcbiAgICBTVVA6IFNVUF9UQUdcclxuICB9LFxyXG5cclxuICAvLyB0aGVzZSBlbGVtZW50cyBhcmUgdHlwaWNhbGx5IGFzc29jaWF0ZWQgd2l0aCBmb3JtcywgYW5kIHN1cHBvcnQgY2VydGFpbiBhdHRyaWJ1dGVzXHJcbiAgRk9STV9FTEVNRU5UUzogWyBJTlBVVF9UQUcsIEJVVFRPTl9UQUcsIFRFWFRBUkVBX1RBRywgU0VMRUNUX1RBRywgT1BUR1JPVVBfVEFHLCBEQVRBTElTVF9UQUcsIE9VVFBVVF9UQUcsIEFfVEFHIF0sXHJcblxyXG4gIC8vIGRlZmF1bHQgdGFncyBmb3IgaHRtbCBlbGVtZW50cyBvZiB0aGUgTm9kZS5cclxuICBERUZBVUxUX0NPTlRBSU5FUl9UQUdfTkFNRTogRElWX1RBRyxcclxuICBERUZBVUxUX0RFU0NSSVBUSU9OX1RBR19OQU1FOiBQX1RBRyxcclxuICBERUZBVUxUX0xBQkVMX1RBR19OQU1FOiBQX1RBRyxcclxuXHJcbiAgQVNTT0NJQVRJT05fQVRUUklCVVRFUzogQVNTT0NJQVRJT05fQVRUUklCVVRFUyxcclxuXHJcbiAgLy8gdmFsaWQgaW5wdXQgdHlwZXMgdGhhdCBzdXBwb3J0IHRoZSBcImNoZWNrZWRcIiBwcm9wZXJ0eS9hdHRyaWJ1dGUgZm9yIGlucHV0IGVsZW1lbnRzXHJcbiAgSU5QVVRfVFlQRVNfVEhBVF9TVVBQT1JUX0NIRUNLRUQ6IFsgJ1JBRElPJywgJ0NIRUNLQk9YJyBdLFxyXG5cclxuICBET01fRVZFTlRTOiBET01fRVZFTlRTLFxyXG4gIFVTRVJfR0VTVFVSRV9FVkVOVFM6IFVTRVJfR0VTVFVSRV9FVkVOVFMsXHJcbiAgQkxPQ0tFRF9ET01fRVZFTlRTOiBCTE9DS0VEX0RPTV9FVkVOVFMsXHJcblxyXG4gIERBVEFfUERPTV9VTklRVUVfSUQ6IERBVEFfUERPTV9VTklRVUVfSUQsXHJcbiAgUERPTV9VTklRVUVfSURfU0VQQVJBVE9SOiAnLScsXHJcblxyXG4gIC8vIGF0dHJpYnV0ZSB1c2VkIGZvciBlbGVtZW50cyB3aGljaCBTY2VuZXJ5IHNob3VsZCBub3QgZGlzcGF0Y2ggU2NlbmVyeUV2ZW50cyB3aGVuIERPTSBldmVudCBpbnB1dCBpcyByZWNlaXZlZCBvblxyXG4gIC8vIHRoZW0sIHNlZSBQYXJhbGxlbERPTS5zZXRFeGNsdWRlTGFiZWxTaWJsaW5nRnJvbUlucHV0IGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgREFUQV9FWENMVURFX0ZST01fSU5QVVQ6ICdkYXRhLWV4Y2x1ZGUtZnJvbS1pbnB1dCdcclxufTtcclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdQRE9NVXRpbHMnLCBQRE9NVXRpbHMgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBET01VdGlsczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLFVBQVUsTUFBTSxtQ0FBbUM7QUFDMUQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxtQkFBbUIsTUFBTSxpREFBaUQ7QUFDakYsU0FBU0MsZ0JBQWdCLEVBQUVDLE9BQU8sUUFBUSxrQkFBa0I7O0FBRTVEO0FBQ0EsTUFBTUMsSUFBSSxHQUFHLE1BQU07QUFDbkIsTUFBTUMsUUFBUSxHQUFHLFVBQVU7O0FBRTNCO0FBQ0EsTUFBTUMsU0FBUyxHQUFHLE9BQU87QUFDekIsTUFBTUMsU0FBUyxHQUFHLE9BQU87QUFDekIsTUFBTUMsVUFBVSxHQUFHLFFBQVE7QUFDM0IsTUFBTUMsWUFBWSxHQUFHLFVBQVU7QUFDL0IsTUFBTUMsVUFBVSxHQUFHLFFBQVE7QUFDM0IsTUFBTUMsWUFBWSxHQUFHLFVBQVU7QUFDL0IsTUFBTUMsWUFBWSxHQUFHLFVBQVU7QUFDL0IsTUFBTUMsVUFBVSxHQUFHLFFBQVE7QUFDM0IsTUFBTUMsT0FB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