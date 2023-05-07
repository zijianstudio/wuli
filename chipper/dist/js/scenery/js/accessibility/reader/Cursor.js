// Copyright 2016-2021, University of Colorado Boulder

/**
 * Prototype for a cursor that implements the typical navigation strategies of a screen reader.  The output
 * text is meant to be read to a user by the Web Speech API synthesizer.
 *
 * NOTE: This is a prototype for screen reader behavior, and is an initial implementation for
 * a cursor that is to be used together with the web speech API, see
 * https://github.com/phetsims/scenery/issues/538
 *
 * NOTE: We are no longer actively developing this since we know that users would much rather use their own
 * dedicated software. But we are keeping it around for when we want to explore any other voicing features
 * using the web speech API.
 *
 * @author Jesse Greenberg
 */

import Property from '../../../../axon/js/Property.js';
import { scenery } from '../../imports.js';

// constants
const SPACE = ' '; // space to insert between words of text content
const END_OF_DOCUMENT = 'End of Document'; // flag thrown when there is no more content
const COMMA = ','; // some bits of text content should be separated with a comma for clear synth output
const LINE_WORD_LENGTH = 15; // number of words read in a single line
const NEXT = 'NEXT'; // constant that marks the direction of traversal
const PREVIOUS = 'PREVIOUS'; // constant that marks the direction of tragersal through the DOM

class Cursor {
  /**
   * @param {Element} domElement
   */
  constructor(domElement) {
    const self = this;

    // the output utterance for the cursor, to be read by the synth and handled in various ways
    // initial output is the document title
    // @public (read-only)
    this.outputUtteranceProperty = new Property(new Utterance(document.title, 'off'));

    // @private - a linear representation of the DOM which is navigated by the user
    this.linearDOM = this.getLinearDOMElements(domElement);

    // @private - the active element is element that is under navigation in the parallel DOM
    this.activeElement = null;

    // @private - the active line is the current line being read and navigated with the cursor
    this.activeLine = null;

    // the letter position is the position of the cursor in the active line to support reading on a
    // letter by letter basis.  This is relative to the length of the active line.
    // @private
    this.letterPosition = 0;

    // the positionInLine is the position in words marking the end location of the active line
    // this must be tracked to support content and descriptions longer than 15 words
    // @private
    this.positionInLine = 0;

    // the position of the word in the active line to support navigation on a word by word basis
    // @private
    this.wordPosition = 0;

    // we need to track the mutation observers so that they can be discconnected
    // @private
    this.observers = [];

    // track a keystate in order to handle when multiple key presses happen at once
    // @private
    this.keyState = {};

    // the document will listen for keyboard interactions
    // this listener implements common navigation strategies for a typical screen reader
    //
    // see https://dequeuniversity.com/screenreaders/nvda-keyboard-shortcuts
    // for a list of common navigation strategies
    //
    // TODO: Use this.keyState object instead of referencing the event directly
    document.addEventListener('keydown', event => {
      // update the keystate object
      this.keyState[event.keyCode] = true;

      // store the output text here
      let outputText;

      // check to see if shift key pressed
      // TODO: we can optionally use the keyState object for this
      const shiftKeyDown = event.shiftKey;

      // direction to navigate through the DOM - usually, holding shift indicates the user wants to travers
      // backwards through the DOM
      const direction = shiftKeyDown ? PREVIOUS : NEXT;

      // the dom can change at any time, make sure that we are reading a copy that is up to date
      this.linearDOM = this.getLinearDOMElements(domElement);

      // update the list of live elements
      this.updateLiveElementList();

      // if the element has an 'application' like behavior, keyboard should be free for the application
      // TODO: This may be insufficient if we need the 'arrow' keys to continue to work for an application role
      if (this.activeElement && this.activeElement.getAttribute('role') === 'application') {
        return;
      }

      // otherwise, handle all key events here
      if (this.keyState[40] && !this.keyState[45]) {
        // read the next line on 'down arrow'
        outputText = this.readNextPreviousLine(NEXT);
      } else if (this.keyState[38] && !this.keyState[45]) {
        // read the previous line on 'up arrow'
        outputText = this.readNextPreviousLine(PREVIOUS);
      } else if (this.keyState[72]) {
        // read the previous or next headings depending on whether the shift key is pressed
        const headingLevels = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
        outputText = this.readNextPreviousHeading(headingLevels, direction);
      } else if (this.keyState[9]) {
        // let the browser naturally handle 'tab' for forms elements and elements with a tabIndex
      } else if (this.keyState[39] && !this.keyState[17]) {
        // read the next character of the active line on 'right arrow'
        outputText = this.readNextPreviousCharacter(NEXT);
      } else if (this.keyState[37] && !this.keyState[17]) {
        // read the previous character on 'left arrow'
        outputText = this.readNextPreviousCharacter(PREVIOUS);
      } else if (this.keyState[37] && this.keyState[17]) {
        // read the previous word on 'control + left arrow'
        outputText = this.readNextPreviousWord(PREVIOUS);
      } else if (this.keyState[39] && this.keyState[17]) {
        // read the next word on 'control + right arrow'
        outputText = this.readNextPreviousWord(NEXT);
      } else if (this.keyState[45] && this.keyState[38]) {
        // repeat the active line on 'insert + up arrow'
        outputText = this.readActiveLine();
      } else if (this.keyState[49]) {
        // find the previous/next heading level 1 on '1'
        outputText = this.readNextPreviousHeading(['H1'], direction);
      } else if (this.keyState[50]) {
        // find the previous/next heading level 2 on '2'
        outputText = this.readNextPreviousHeading(['H2'], direction);
      } else if (this.keyState[51]) {
        // find the previous/next heading level 3 on '3'
        outputText = this.readNextPreviousHeading(['H3'], direction);
      } else if (this.keyState[52]) {
        // find the previous/next heading level 4 on '4'
        outputText = this.readNextPreviousHeading(['H4'], direction);
      } else if (this.keyState[53]) {
        // find the previous/next heading level 5 on '5'
        outputText = this.readNextPreviousHeading(['H5'], direction);
      } else if (this.keyState[54]) {
        // find the previous/next heading level 6 on '6'
        outputText = this.readNextPreviousHeading(['H6'], direction);
      } else if (this.keyState[70]) {
        // find the previous/next form element on 'f'
        outputText = this.readNextPreviousFormElement(direction);
      } else if (this.keyState[66]) {
        // find the previous/next button element on 'b'
        outputText = this.readNextPreviousButton(direction);
      } else if (this.keyState[76]) {
        // find the previous/next list on 'L'
        outputText = this.readNextPreviousList(direction);
      } else if (this.keyState[73]) {
        // find the previous/next list item on 'I'
        outputText = this.readNextPreviousListItem(direction);
      } else if (this.keyState[45] && this.keyState[40]) {
        // read entire document on 'insert + down arrow'
        this.readEntireDocument();
      }

      // if the active element is focusable, set the focus to it so that the virtual cursor can
      // directly interact with elements
      if (this.activeElement && this.isFocusable(this.activeElement)) {
        this.activeElement.focus();
      }

      // if the output text is a space, we want it to be read as 'blank' or 'space'
      if (outputText === SPACE) {
        outputText = 'space';
      }
      if (outputText) {
        // for now, all utterances are off for aria-live
        this.outputUtteranceProperty.set(new Utterance(outputText, 'off'));
      }

      // TODO: everything else in https://dequeuniversity.com/screenreaders/nvda-keyboard-shortcuts
    });

    // update the keystate object on keyup to handle multiple key presses at once
    document.addEventListener('keyup', event => {
      this.keyState[event.keyCode] = false;
    });

    // listen for when an element is about to receive focus
    // we are using focusin (and not focus) because we want the event to bubble up the document
    // this will handle both tab navigation AND programatic focus by the simulation
    document.addEventListener('focusin', function (event) {
      // anounce the new focus if it is different from the active element
      if (event.target !== self.activeElement) {
        self.activeElement = event.target;

        // so read out all content from aria markup since focus moved via application behavior
        const withApplicationContent = true;
        const outputText = self.getAccessibleText(this.activeElement, withApplicationContent);
        if (outputText) {
          const liveRole = self.activeElement.getAttribute('aria-live');
          self.outputUtteranceProperty.set(new Utterance(outputText, liveRole));
        }
      }
    });
  }

  /**
   * Get all 'element' nodes off the parent element, placing them in an array
   * for easy traversal.  Note that this includes all elements, even those
   * that are 'hidden' or purely for structure.
   * @private
   *
   * @param  {HTMLElement} domElement - the parent element to linearize
   * @returns {Array.<HTMLElement>}
   */
  getLinearDOMElements(domElement) {
    // gets ALL descendent children for the element
    const children = domElement.getElementsByTagName('*');
    const linearDOM = [];
    for (let i = 0; i < children.length; i++) {
      if (children[i].nodeType === Node.ELEMENT_NODE) {
        linearDOM[i] = children[i];
      }
    }
    return linearDOM;
  }

  /**
   * Get the live role from the DOM element.  If the element is not live, return null.
   * @private
   *
   * @param {HTMLElement} domElement
   * @returns {string}
   */
  getLiveRole(domElement) {
    let liveRole = null;

    // collection of all roles that can produce 'live region' behavior
    // see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
    const roles = ['log', 'status', 'alert', 'progressbar', 'marquee', 'timer', 'assertive', 'polite'];
    roles.forEach(role => {
      if (domElement.getAttribute('aria-live') === role || domElement.getAttribute('role') === role) {
        liveRole = role;
      }
    });
    return liveRole;
  }

  /**
   * Get the next or previous element in the DOM, depending on the desired direction.
   * @private
   *
   * @param {[type]} direction - NEXT || PREVIOUS
   * @returns {HTMLElement}
   */
  getNextPreviousElement(direction) {
    if (!this.activeElement) {
      this.activeElement = this.linearDOM[0];
    }
    const searchDelta = direction === 'NEXT' ? 1 : -1;
    const activeIndex = this.linearDOM.indexOf(this.activeElement);
    const nextIndex = activeIndex + searchDelta;
    return this.linearDOM[nextIndex];
  }

  /**
   * Get the label for a particular id
   * @private
     * @param {string} id
   * @returns {HTMLElement}
   */
  getLabel(id) {
    const labels = document.getElementsByTagName('label');

    // loop through NodeList
    let labelWithId;
    Array.prototype.forEach.call(labels, label => {
      if (label.getAttribute('for')) {
        labelWithId = label;
      }
    });
    assert && assert(labelWithId, 'No label found for id');
    return labelWithId;
  }

  /**
   * Get the accessible text from the element.  Depending on the navigation strategy,
   * we may or may not want to include all application content text from the markup.
   * @private
   *
   * @param {HTMLElement} element
   * @param {boolean} withApplicationContent - do you want to include all aria text content?
   * @returns {string}
   */
  getAccessibleText(element, withApplicationContent) {
    // placeholder for the text content that we will build up from the markup
    let textContent = '';

    // if the element is undefined, we have reached the end of the document
    if (!element) {
      return END_OF_DOCUMENT;
    }

    // filter out structural elements that do not have accessible text
    if (element.getAttribute('class') === 'ScreenView') {
      return null;
    }
    if (element.tagName === 'HEADER') {
      // TODO: Headers should have some behavior
      return null;
    }
    if (element.tagName === 'SECTION') {
      // TODO: What do you we do for sections? Read section + aria-labelledby?
      return null;
    }
    if (element.tagName === 'LABEL') {
      // label content is added like 'aria-describedby', do not read this yet
      return null;
    }

    // search up through the ancestors to see if this element should be hidden
    let childElement = element;
    while (childElement.parentElement) {
      if (childElement.getAttribute('aria-hidden') || childElement.hidden) {
        return null;
      } else {
        childElement = childElement.parentElement;
      }
    }

    // search for elements that will have content and should be read
    if (element.tagName === 'P') {
      textContent += element.textContent;
    }
    if (element.tagName === 'H1') {
      textContent += `Heading Level 1, ${element.textContent}`;
    }
    if (element.tagName === 'H2') {
      textContent += `Heading Level 2, ${element.textContent}`;
    }
    if (element.tagName === 'H3') {
      textContent += `Heading Level 3, ${element.textContent}`;
    }
    if (element.tagName === 'UL') {
      const listLength = element.children.length;
      textContent += `List with ${listLength} items`;
    }
    if (element.tagName === 'LI') {
      textContent += `List Item: ${element.textContent}`;
    }
    if (element.tagName === 'BUTTON') {
      const buttonLabel = ' Button';
      // check to see if this is a 'toggle' button with the 'aria-pressed' attribute
      if (element.getAttribute('aria-pressed')) {
        let toggleLabel = ' toggle';
        const pressedLabel = ' pressed';
        const notLabel = ' not';

        // insert a comma for readibility of the synth
        toggleLabel += buttonLabel + COMMA;
        if (element.getAttribute('aria-pressed') === 'true') {
          toggleLabel += pressedLabel;
        } else {
          toggleLabel += notLabel + pressedLabel;
        }
        textContent += element.textContent + COMMA + toggleLabel;
      } else {
        textContent += element.textContent + buttonLabel;
      }
    }
    if (element.tagName === 'INPUT') {
      if (element.type === 'reset') {
        textContent += `${element.getAttribute('value')} Button`;
      }
      if (element.type === 'checkbox') {
        // the checkbox should have a label - find the correct one
        const checkboxLabel = this.getLabel(element.id);
        const labelContent = checkboxLabel.textContent;

        // describe as a switch if it has the role
        if (element.getAttribute('role') === 'switch') {
          // required for a checkbox
          const ariaChecked = element.getAttribute('aria-checked');
          if (ariaChecked) {
            const switchedString = ariaChecked === 'true' ? 'On' : 'Off';
            textContent += `${labelContent + COMMA + SPACE}switch${COMMA}${SPACE}${switchedString}`;
          } else {
            assert && assert(false, 'checkbox switch must have aria-checked attribute');
          }
        } else {
          const checkedString = element.checked ? ' Checked' : ' Not Checked';
          textContent += `${element.textContent} Checkbox${checkedString}`;
        }
      }
    }

    // if we are in an 'application' style of navigation, we want to add additional information
    // from the markup
    // Order of additions to textContent is important, and is designed to make sense
    // when textContent is read continuously
    // TODO: support more markup!
    if (withApplicationContent) {
      // insert a comma at the end of the content to enhance the output of the synth
      if (textContent.length > 0) {
        textContent += COMMA;
      }

      // look for an aria-label
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel) {
        textContent += SPACE + ariaLabel + COMMA;
      }

      // look for an aria-labelledBy attribute to see if there is another element in the DOM that
      // describes this one
      const ariaLabelledById = element.getAttribute('aria-labelledBy');
      if (ariaLabelledById) {
        const ariaLabelledBy = document.getElementById(ariaLabelledById);
        const ariaLabelledByText = ariaLabelledBy.textContent;
        textContent += SPACE + ariaLabelledByText + COMMA;
      }

      // search up through the ancestors to find if the element has 'application' or 'document' content
      // TODO: Factor out into a searchUp type of function.
      childElement = element;
      let role;
      while (childElement.parentElement) {
        role = childElement.getAttribute('role');
        if (role === 'document' || role === 'application') {
          textContent += SPACE + role + COMMA;
          break;
        } else {
          childElement = childElement.parentElement;
        }
      }

      // check to see if this element has an aria-role
      if (element.getAttribute('role')) {
        role = element.getAttribute('role');
        // TODO handle all the different roles!

        // label if the role is a button
        if (role === 'button') {
          textContent += `${SPACE}Button`;
        }
      }

      // check to see if this element is draggable
      if (element.draggable) {
        textContent += `${SPACE}draggable${COMMA}`;
      }

      // look for aria-grabbed markup to let the user know if the element is grabbed
      if (element.getAttribute('aria-grabbed') === 'true') {
        textContent += `${SPACE}grabbed${COMMA}`;
      }

      // look for an element in the DOM that describes this one
      const ariaDescribedBy = element.getAttribute('aria-describedby');
      if (ariaDescribedBy) {
        // the aria spec supports multiple description ID's for a single element
        const descriptionIDs = ariaDescribedBy.split(SPACE);
        let descriptionElement;
        let descriptionText;
        descriptionIDs.forEach(descriptionID => {
          descriptionElement = document.getElementById(descriptionID);
          descriptionText = descriptionElement.textContent;
          textContent += SPACE + descriptionText;
        });
      }
    }

    // delete the trailing comma if it exists at the end of the textContent
    if (textContent[textContent.length - 1] === ',') {
      textContent = textContent.slice(0, -1);
    }
    return textContent;
  }

  /**
   * Get the next or previous element in the DOM that has accessible text content, relative to the current
   * active element.
   * @private
   *
   * @param  {string} direction - NEXT || PREVIOUS
   * @returns {HTMLElement}
   */
  getNextPreviousElementWithPDOMContent(direction) {
    let pdomContent;
    while (!pdomContent) {
      // set the selected element to the next element in the DOM
      this.activeElement = this.getNextPreviousElement(direction);
      pdomContent = this.getAccessibleText(this.activeElement, false);
    }
    return this.activeElement;
  }

  /**
   * Get the next element in the DOM with on of the desired tagNames, types, or roles.  This does not set the active element, it
   * only traverses the document looking for elements.
   * @private
   *
   * @param  {Array.<string>} roles - list of desired DOM tag names, types, or aria roles
   * @param  {[type]} direction - direction flag for to search through the DOM - NEXT || PREVIOUS
   * @returns {HTMLElement}
   */
  getNextPreviousElementWithRole(roles, direction) {
    let element = null;
    const searchDelta = direction === NEXT ? 1 : -1;

    // if there is not an active element, use the first element in the DOM.
    if (!this.activeElement) {
      this.activeElement = this.linearDOM[0];
    }

    // start search from the next or previous element and set up the traversal conditions
    let searchIndex = this.linearDOM.indexOf(this.activeElement) + searchDelta;
    while (this.linearDOM[searchIndex]) {
      for (let j = 0; j < roles.length; j++) {
        const elementTag = this.linearDOM[searchIndex].tagName;
        const elementType = this.linearDOM[searchIndex].type;
        const elementRole = this.linearDOM[searchIndex].getAttribute('role');
        const searchRole = roles[j];
        if (elementTag === searchRole || elementRole === searchRole || elementType === searchRole) {
          element = this.linearDOM[searchIndex];
          break;
        }
      }
      if (element) {
        // we have alread found an element, break out
        break;
      }
      searchIndex += searchDelta;
    }
    return element;
  }

  /**
   * @private
   *
   * @param {string} direction
   * @returns {string}
   */
  readNextPreviousLine(direction) {
    let line = '';

    // reset the content letter and word positions because we are reading a new line
    this.letterPosition = 0;
    this.wordPosition = 0;

    // if there is no active element, set to the next element with accessible content
    if (!this.activeElement) {
      this.activeElement = this.getNextPreviousElementWithPDOMContent(direction);
    }

    // get the accessible content for the active element, without any 'application' content, and split into words
    let accessibleText = this.getAccessibleText(this.activeElement, false).split(SPACE);

    // if traversing backwards, position in line needs be at the start of previous line
    if (direction === PREVIOUS) {
      this.positionInLine = this.positionInLine - 2 * LINE_WORD_LENGTH;
    }

    // if there is no content at the line position, it is time to find the next element
    if (!accessibleText[this.positionInLine]) {
      // reset the position in the line
      this.positionInLine = 0;

      // save the active element in case it needs to be restored
      const previousElement = this.activeElement;

      // update the active element and set the accessible content from this element
      this.activeElement = this.getNextPreviousElementWithPDOMContent(direction);
      accessibleText = this.getAccessibleText(this.activeElement, false).split(' ');

      // restore the previous active element if we are at the end of the document
      if (!this.activeElement) {
        this.activeElement = previousElement;
      }
    }

    // read the next line of the accessible content
    const lineLimit = this.positionInLine + LINE_WORD_LENGTH;
    for (let i = this.positionInLine; i < lineLimit; i++) {
      if (accessibleText[i]) {
        line += accessibleText[i];
        this.positionInLine += 1;
        if (accessibleText[i + 1]) {
          line += SPACE;
        } else {
          // we have reached the end of this content, there are no more words
          // wrap the line position to the end so we can easily read back the previous line
          this.positionInLine += LINE_WORD_LENGTH - this.positionInLine % LINE_WORD_LENGTH;
          break;
        }
      }
    }
    this.activeLine = line;
    return line;
  }

  /**
   * Read the active line without incrementing the word count.
   * @private
   *
   * @returns {[type]} [description]
   */
  readActiveLine() {
    let line = '';

    // if there is no active line, find the next one
    if (!this.activeLine) {
      this.activeLine = this.readNextPreviousLine(NEXT);
    }

    // split up the active line into an array of words
    const activeWords = this.activeLine.split(SPACE);

    // read this line of content
    for (let i = 0; i < LINE_WORD_LENGTH; i++) {
      if (activeWords[i]) {
        line += activeWords[i];
        if (activeWords[i + 1]) {
          // add space if there are more words
          line += SPACE;
        } else {
          // we have reached the end of the line, there are no more words
          break;
        }
      }
    }
    return line;
  }

  /**
   * @private
   *
   * @param {string} direction
   * @returns {string}
   */
  readNextPreviousWord(direction) {
    // if there is no active line, find the next one
    if (!this.activeLine) {
      this.activeLine = this.readNextPreviousLine(direction);
    }

    // split the active line into an array of words
    const activeWords = this.activeLine.split(SPACE);

    // direction dependent variables
    let searchDelta;
    let contentEnd;
    if (direction === NEXT) {
      contentEnd = activeWords.length;
      searchDelta = 1;
    } else if (direction === PREVIOUS) {
      contentEnd = 0;
      searchDelta = -2;
    }

    // if there is no more content, read the next/previous line
    if (this.wordPosition === contentEnd) {
      this.activeLine = this.readNextPreviousLine(direction);
    }

    // get the word to read update word position
    const outputText = activeWords[this.wordPosition];
    this.wordPosition += searchDelta;
    return outputText;
  }

  /**
   * Read the next or previous heading with one of the levels specified in headingLevels and in the direction
   * specified by the direction flag.
   * @private
   *
   * @param  {Array.<string>} headingLevels
   * @param  {[type]} direction - direction of traversal through the DOM - NEXT || PREVIOUS
   * @returns {string}
   */
  readNextPreviousHeading(headingLevels, direction) {
    // get the next element in the DOM with one of the above heading levels which has accessible content
    // to read
    let accessibleText;
    let nextElement;

    // track the previous element - if there are no more headings, store it here
    let previousElement;
    while (!accessibleText) {
      previousElement = this.activeElement;
      nextElement = this.getNextPreviousElementWithRole(headingLevels, direction);
      this.activeElement = nextElement;
      accessibleText = this.getAccessibleText(nextElement);
    }
    if (!nextElement) {
      // restore the active element
      this.activeElement = previousElement;
      // let the user know that there are no more headings at the desired level
      const directionDescriptionString = direction === NEXT ? 'more' : 'previous';
      if (headingLevels.length === 1) {
        const noNextHeadingString = `No ${directionDescriptionString} headings at `;
        const headingLevel = headingLevels[0];
        const levelString = headingLevel === 'H1' ? 'Level 1' : headingLevel === 'H2' ? 'Level 2' : headingLevel === 'H3' ? 'Level 3' : headingLevel === 'H4' ? 'Level 4' : headingLevel === 'H5' ? 'Level 5' : 'Level 6';
        return noNextHeadingString + levelString;
      }
      return `No ${directionDescriptionString} headings`;
    }

    // set element as the next active element and return the text
    this.activeElement = nextElement;
    return accessibleText;
  }

  /**
   * Read the next/previous button element.  A button can have the tagname button, have the aria button role, or
   * or have one of the following types: submit, button, reset
   * @private
   *
   * @param  {string}} direction
   * @returns {HTMLElement}
   */
  readNextPreviousButton(direction) {
    // the following roles should handle 'role=button', 'type=button', 'tagName=BUTTON'
    const roles = ['button', 'BUTTON', 'submit', 'reset'];
    let nextElement;
    let accessibleText;
    let previousElement;
    while (!accessibleText) {
      previousElement = this.activeElement;
      nextElement = this.getNextPreviousElementWithRole(roles, direction);
      this.activeElement = nextElement;

      // get the accessible text with application descriptions
      accessibleText = this.getAccessibleText(nextElement, true);
    }
    if (!nextElement) {
      this.activeElement = previousElement;
      const directionDescriptionString = direction === NEXT ? 'more' : 'previous';
      return `No ${directionDescriptionString} buttons`;
    }
    this.activeElement = nextElement;
    return accessibleText;
  }

  /**
   * @private
   *
   * @param {string} direction
   * @returns {string}
   */
  readNextPreviousFormElement(direction) {
    // TODO: support more form elements!
    const tagNames = ['INPUT', 'BUTTON'];
    const ariaRoles = ['button'];
    const roles = tagNames.concat(ariaRoles);
    let nextElement;
    let accessibleText;

    // track the previous element - if there are no more form elements it will need to be restored
    let previousElement;
    while (!accessibleText) {
      previousElement = this.activeElement;
      nextElement = this.getNextPreviousElementWithRole(roles, direction);
      this.activeElement = nextElement;

      // get the accessible text with aria descriptions
      accessibleText = this.getAccessibleText(nextElement, true);
    }
    if (accessibleText === END_OF_DOCUMENT) {
      this.activeElement = previousElement;
      const directionDescriptionString = direction === NEXT ? 'next' : 'previous';
      return `No ${directionDescriptionString} form field`;
    }
    this.activeElement = nextElement;
    return accessibleText;
  }

  /**
   * @private
   *
   * @param {string} direction
   * @returns {string}
   */
  readNextPreviousListItem(direction) {
    if (!this.activeElement) {
      this.activeElement = this.getNextPreviousElementWithPDOMContent(direction);
    }
    let accessibleText;

    // if we are inside of a list, get the next peer, or find the next list
    const parentElement = this.activeElement.parentElement;
    if (parentElement.tagName === 'UL' || parentElement.tagName === 'OL') {
      const searchDelta = direction === NEXT ? 1 : -1;

      // Array.prototype must be used on the NodeList
      let searchIndex = Array.prototype.indexOf.call(parentElement.children, this.activeElement) + searchDelta;
      while (parentElement.children[searchIndex]) {
        accessibleText = this.getAccessibleText(parentElement.children[searchIndex]);
        if (accessibleText) {
          this.activeElement = parentElement.children[searchIndex];
          break;
        }
        searchIndex += searchDelta;
      }
      if (!accessibleText) {
        // there was no accessible text in the list items, so read the next / previous list
        accessibleText = this.readNextPreviousList(direction);
      }
    } else {
      // not inside of a list, so read the next/previous one and its first item
      accessibleText = this.readNextPreviousList(direction);
    }
    if (!accessibleText) {
      const directionDescriptionString = direction === NEXT ? 'more' : 'previous';
      return `No ${directionDescriptionString} list items`;
    }
    return accessibleText;
  }

  /**
   * @private
   *
   * @param {string} direction
   * @returns {string}
   */
  readNextPreviousList(direction) {
    if (!this.activeElement) {
      this.activeElement = this.getNextPreviousElementWithPDOMContent(direction);
    }

    // if we are inside of a list already, step out of it to begin searching there
    const parentElement = this.activeElement.parentElement;
    let activeElement;
    if (parentElement.tagName === 'UL' || parentElement.tagName === 'OL') {
      // save the previous active element - if there are no more lists, this should not change
      activeElement = this.activeElement;
      this.activeElement = parentElement;
    }
    const listElement = this.getNextPreviousElementWithRole(['UL', 'OL'], direction);
    if (!listElement) {
      // restore the previous active element
      if (activeElement) {
        this.activeElement = activeElement;
      }

      // let the user know that there are no more lists and move to the next element
      const directionDescriptionString = direction === NEXT ? 'more' : 'previous';
      return `No ${directionDescriptionString} lists`;
    }

    // get the content from the list element
    const listText = this.getAccessibleText(listElement);

    // include the content from the first item in the list
    let itemText = '';
    const firstItem = listElement.children[0];
    if (firstItem) {
      itemText = this.getAccessibleText(firstItem);
      this.activeElement = firstItem;
    }
    return `${listText}, ${itemText}`;
  }

  /**
   * @private
   *
   * @param {string} direction
   * @returns {string}
   */
  readNextPreviousCharacter(direction) {
    // if there is no active line, find the next one
    if (!this.activeLine) {
      this.activeLine = this.readNextPreviousLine(NEXT);
    }

    // directional dependent variables
    let contentEnd;
    let searchDelta;
    let normalizeDirection;
    if (direction === NEXT) {
      contentEnd = this.activeLine.length;
      searchDelta = 1;
      normalizeDirection = 0;
    } else if (direction === PREVIOUS) {
      // for backwards traversal, read from two characters behind
      contentEnd = 2;
      searchDelta = -1;
      normalizeDirection = -2;
    }

    // if we are at the end of the content, read the next/previous line
    if (this.letterPosition === contentEnd) {
      this.activeLine = this.readNextPreviousLine(direction);

      // if reading backwards, letter position should be at the end of the active line
      this.letterPosition = this.activeLine.length;
    }

    // get the letter to read and increment the letter position
    const outputText = this.activeLine[this.letterPosition + normalizeDirection];
    this.letterPosition += searchDelta;
    return outputText;
  }

  /**
   * Update the list of elements, and add Mutation Observers to each one.  MutationObservers
   * provide a way to listen to changes in the DOM,
   * see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
   * @private
   */
  updateLiveElementList() {
    // remove all previous observers
    // TODO: only update the observer list if necessary
    for (let i = 0; i < this.observers.length; i++) {
      if (this.observers[i]) {
        this.observers[i].disconnect();
      }
    }

    // clear the list of observers
    this.observers = [];

    // search through the DOM, looking for elements with a 'live region' attribute
    for (let i = 0; i < this.linearDOM.length; i++) {
      const domElement = this.linearDOM[i];
      const liveRole = this.getLiveRole(domElement);
      if (liveRole) {
        const mutationObserverCallback = mutations => {
          mutations.forEach(mutation => {
            let liveRole;
            let mutatedElement = mutation.target;

            // look for the type of live role that is associated with this mutation
            // if the target has no live attribute, search through the element's ancestors to find the attribute
            while (!liveRole) {
              liveRole = this.getLiveRole(mutatedElement);
              mutatedElement = mutatedElement.parentElement;
            }

            // we only care about nodes added
            if (mutation.addedNodes[0]) {
              const updatedText = mutation.addedNodes[0].data;
              this.outputUtteranceProperty.set(new Utterance(updatedText, liveRole));
            }
          });
        };

        // create a mutation observer for this live element
        const observer = new MutationObserver(mutations => {
          mutationObserverCallback(mutations);
        });

        // listen for changes to the subtree in case children of the aria-live parent change their textContent
        const observerConfig = {
          childList: true,
          subtree: true
        };
        observer.observe(domElement, observerConfig);
        this.observers.push(observer);
      }
    }
  }

  /**
   * Read continuously from the current active element.  Accessible content is read by reader with a 'polite'
   * utterance so that new text is added to the queue line by line.
   * @private
   *
   * TODO: If the read is cancelled, the active element should be set appropriately.
   *
   * @returns {string}
   */
  readEntireDocument() {
    const liveRole = 'polite';
    let outputText = this.getAccessibleText(this.activeElement);
    let activeElement = this.activeElement;
    while (outputText !== END_OF_DOCUMENT) {
      activeElement = this.activeElement;
      outputText = this.readNextPreviousLine(NEXT);
      if (outputText === END_OF_DOCUMENT) {
        this.activeElement = activeElement;
      }
      this.outputUtteranceProperty.set(new Utterance(outputText, liveRole));
    }
  }

  /**
   * Return true if the element is focusable.  A focusable element has a tab index, is a
   * form element, or has a role which adds it to the navigation order.
   * @private
   *
   * TODO: Populate with the rest of the focusable elements.
   * @param  {HTMLElement} domElement
   * @returns {boolean}
   */
  isFocusable(domElement) {
    // list of attributes and tag names which should be in the navigation order
    // TODO: more roles!
    const focusableRoles = ['tabindex', 'BUTTON', 'INPUT'];
    let focusable = false;
    focusableRoles.forEach(role => {
      if (domElement.getAttribute(role)) {
        focusable = true;
      } else if (domElement.tagName === role) {
        focusable = true;
      }
    });
    return focusable;
  }
}
scenery.register('Cursor', Cursor);
class Utterance {
  /**
   * Create an experimental type to create unique utterances for the reader.
   * Type is simply a collection of text and a priority for aria-live that
   * lets the reader know whether to queue the next utterance or cancel it in the order.
   *
   * TODO: This is where we could deviate from traditional screen reader behavior. For instance, instead of
   * just liveRole, perhaps we should have a liveIndex that specifies order of the live update? We may also
   * need additional flags here for the reader.
   *
   * @param {string} text - the text to be read as the utterance for the synth
   * @param {string} liveRole - see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
   */
  constructor(text, liveRole) {
    this.text = text;
    this.liveRole = liveRole;
  }
}
export default Cursor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsInNjZW5lcnkiLCJTUEFDRSIsIkVORF9PRl9ET0NVTUVOVCIsIkNPTU1BIiwiTElORV9XT1JEX0xFTkdUSCIsIk5FWFQiLCJQUkVWSU9VUyIsIkN1cnNvciIsImNvbnN0cnVjdG9yIiwiZG9tRWxlbWVudCIsInNlbGYiLCJvdXRwdXRVdHRlcmFuY2VQcm9wZXJ0eSIsIlV0dGVyYW5jZSIsImRvY3VtZW50IiwidGl0bGUiLCJsaW5lYXJET00iLCJnZXRMaW5lYXJET01FbGVtZW50cyIsImFjdGl2ZUVsZW1lbnQiLCJhY3RpdmVMaW5lIiwibGV0dGVyUG9zaXRpb24iLCJwb3NpdGlvbkluTGluZSIsIndvcmRQb3NpdGlvbiIsIm9ic2VydmVycyIsImtleVN0YXRlIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50Iiwia2V5Q29kZSIsIm91dHB1dFRleHQiLCJzaGlmdEtleURvd24iLCJzaGlmdEtleSIsImRpcmVjdGlvbiIsInVwZGF0ZUxpdmVFbGVtZW50TGlzdCIsImdldEF0dHJpYnV0ZSIsInJlYWROZXh0UHJldmlvdXNMaW5lIiwiaGVhZGluZ0xldmVscyIsInJlYWROZXh0UHJldmlvdXNIZWFkaW5nIiwicmVhZE5leHRQcmV2aW91c0NoYXJhY3RlciIsInJlYWROZXh0UHJldmlvdXNXb3JkIiwicmVhZEFjdGl2ZUxpbmUiLCJyZWFkTmV4dFByZXZpb3VzRm9ybUVsZW1lbnQiLCJyZWFkTmV4dFByZXZpb3VzQnV0dG9uIiwicmVhZE5leHRQcmV2aW91c0xpc3QiLCJyZWFkTmV4dFByZXZpb3VzTGlzdEl0ZW0iLCJyZWFkRW50aXJlRG9jdW1lbnQiLCJpc0ZvY3VzYWJsZSIsImZvY3VzIiwic2V0IiwidGFyZ2V0Iiwid2l0aEFwcGxpY2F0aW9uQ29udGVudCIsImdldEFjY2Vzc2libGVUZXh0IiwibGl2ZVJvbGUiLCJjaGlsZHJlbiIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwiaSIsImxlbmd0aCIsIm5vZGVUeXBlIiwiTm9kZSIsIkVMRU1FTlRfTk9ERSIsImdldExpdmVSb2xlIiwicm9sZXMiLCJmb3JFYWNoIiwicm9sZSIsImdldE5leHRQcmV2aW91c0VsZW1lbnQiLCJzZWFyY2hEZWx0YSIsImFjdGl2ZUluZGV4IiwiaW5kZXhPZiIsIm5leHRJbmRleCIsImdldExhYmVsIiwiaWQiLCJsYWJlbHMiLCJsYWJlbFdpdGhJZCIsIkFycmF5IiwicHJvdG90eXBlIiwiY2FsbCIsImxhYmVsIiwiYXNzZXJ0IiwiZWxlbWVudCIsInRleHRDb250ZW50IiwidGFnTmFtZSIsImNoaWxkRWxlbWVudCIsInBhcmVudEVsZW1lbnQiLCJoaWRkZW4iLCJsaXN0TGVuZ3RoIiwiYnV0dG9uTGFiZWwiLCJ0b2dnbGVMYWJlbCIsInByZXNzZWRMYWJlbCIsIm5vdExhYmVsIiwidHlwZSIsImNoZWNrYm94TGFiZWwiLCJsYWJlbENvbnRlbnQiLCJhcmlhQ2hlY2tlZCIsInN3aXRjaGVkU3RyaW5nIiwiY2hlY2tlZFN0cmluZyIsImNoZWNrZWQiLCJhcmlhTGFiZWwiLCJhcmlhTGFiZWxsZWRCeUlkIiwiYXJpYUxhYmVsbGVkQnkiLCJnZXRFbGVtZW50QnlJZCIsImFyaWFMYWJlbGxlZEJ5VGV4dCIsImRyYWdnYWJsZSIsImFyaWFEZXNjcmliZWRCeSIsImRlc2NyaXB0aW9uSURzIiwic3BsaXQiLCJkZXNjcmlwdGlvbkVsZW1lbnQiLCJkZXNjcmlwdGlvblRleHQiLCJkZXNjcmlwdGlvbklEIiwic2xpY2UiLCJnZXROZXh0UHJldmlvdXNFbGVtZW50V2l0aFBET01Db250ZW50IiwicGRvbUNvbnRlbnQiLCJnZXROZXh0UHJldmlvdXNFbGVtZW50V2l0aFJvbGUiLCJzZWFyY2hJbmRleCIsImoiLCJlbGVtZW50VGFnIiwiZWxlbWVudFR5cGUiLCJlbGVtZW50Um9sZSIsInNlYXJjaFJvbGUiLCJsaW5lIiwiYWNjZXNzaWJsZVRleHQiLCJwcmV2aW91c0VsZW1lbnQiLCJsaW5lTGltaXQiLCJhY3RpdmVXb3JkcyIsImNvbnRlbnRFbmQiLCJuZXh0RWxlbWVudCIsImRpcmVjdGlvbkRlc2NyaXB0aW9uU3RyaW5nIiwibm9OZXh0SGVhZGluZ1N0cmluZyIsImhlYWRpbmdMZXZlbCIsImxldmVsU3RyaW5nIiwidGFnTmFtZXMiLCJhcmlhUm9sZXMiLCJjb25jYXQiLCJsaXN0RWxlbWVudCIsImxpc3RUZXh0IiwiaXRlbVRleHQiLCJmaXJzdEl0ZW0iLCJub3JtYWxpemVEaXJlY3Rpb24iLCJkaXNjb25uZWN0IiwibXV0YXRpb25PYnNlcnZlckNhbGxiYWNrIiwibXV0YXRpb25zIiwibXV0YXRpb24iLCJtdXRhdGVkRWxlbWVudCIsImFkZGVkTm9kZXMiLCJ1cGRhdGVkVGV4dCIsImRhdGEiLCJvYnNlcnZlciIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJvYnNlcnZlckNvbmZpZyIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJvYnNlcnZlIiwicHVzaCIsImZvY3VzYWJsZVJvbGVzIiwiZm9jdXNhYmxlIiwicmVnaXN0ZXIiLCJ0ZXh0Il0sInNvdXJjZXMiOlsiQ3Vyc29yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFByb3RvdHlwZSBmb3IgYSBjdXJzb3IgdGhhdCBpbXBsZW1lbnRzIHRoZSB0eXBpY2FsIG5hdmlnYXRpb24gc3RyYXRlZ2llcyBvZiBhIHNjcmVlbiByZWFkZXIuICBUaGUgb3V0cHV0XHJcbiAqIHRleHQgaXMgbWVhbnQgdG8gYmUgcmVhZCB0byBhIHVzZXIgYnkgdGhlIFdlYiBTcGVlY2ggQVBJIHN5bnRoZXNpemVyLlxyXG4gKlxyXG4gKiBOT1RFOiBUaGlzIGlzIGEgcHJvdG90eXBlIGZvciBzY3JlZW4gcmVhZGVyIGJlaGF2aW9yLCBhbmQgaXMgYW4gaW5pdGlhbCBpbXBsZW1lbnRhdGlvbiBmb3JcclxuICogYSBjdXJzb3IgdGhhdCBpcyB0byBiZSB1c2VkIHRvZ2V0aGVyIHdpdGggdGhlIHdlYiBzcGVlY2ggQVBJLCBzZWVcclxuICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzUzOFxyXG4gKlxyXG4gKiBOT1RFOiBXZSBhcmUgbm8gbG9uZ2VyIGFjdGl2ZWx5IGRldmVsb3BpbmcgdGhpcyBzaW5jZSB3ZSBrbm93IHRoYXQgdXNlcnMgd291bGQgbXVjaCByYXRoZXIgdXNlIHRoZWlyIG93blxyXG4gKiBkZWRpY2F0ZWQgc29mdHdhcmUuIEJ1dCB3ZSBhcmUga2VlcGluZyBpdCBhcm91bmQgZm9yIHdoZW4gd2Ugd2FudCB0byBleHBsb3JlIGFueSBvdGhlciB2b2ljaW5nIGZlYXR1cmVzXHJcbiAqIHVzaW5nIHRoZSB3ZWIgc3BlZWNoIEFQSS5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IHNjZW5lcnkgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBTUEFDRSA9ICcgJzsgLy8gc3BhY2UgdG8gaW5zZXJ0IGJldHdlZW4gd29yZHMgb2YgdGV4dCBjb250ZW50XHJcbmNvbnN0IEVORF9PRl9ET0NVTUVOVCA9ICdFbmQgb2YgRG9jdW1lbnQnOyAvLyBmbGFnIHRocm93biB3aGVuIHRoZXJlIGlzIG5vIG1vcmUgY29udGVudFxyXG5jb25zdCBDT01NQSA9ICcsJzsgLy8gc29tZSBiaXRzIG9mIHRleHQgY29udGVudCBzaG91bGQgYmUgc2VwYXJhdGVkIHdpdGggYSBjb21tYSBmb3IgY2xlYXIgc3ludGggb3V0cHV0XHJcbmNvbnN0IExJTkVfV09SRF9MRU5HVEggPSAxNTsgLy8gbnVtYmVyIG9mIHdvcmRzIHJlYWQgaW4gYSBzaW5nbGUgbGluZVxyXG5jb25zdCBORVhUID0gJ05FWFQnOyAvLyBjb25zdGFudCB0aGF0IG1hcmtzIHRoZSBkaXJlY3Rpb24gb2YgdHJhdmVyc2FsXHJcbmNvbnN0IFBSRVZJT1VTID0gJ1BSRVZJT1VTJzsgLy8gY29uc3RhbnQgdGhhdCBtYXJrcyB0aGUgZGlyZWN0aW9uIG9mIHRyYWdlcnNhbCB0aHJvdWdoIHRoZSBET01cclxuXHJcbmNsYXNzIEN1cnNvciB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtFbGVtZW50fSBkb21FbGVtZW50XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGRvbUVsZW1lbnQgKSB7XHJcblxyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgLy8gdGhlIG91dHB1dCB1dHRlcmFuY2UgZm9yIHRoZSBjdXJzb3IsIHRvIGJlIHJlYWQgYnkgdGhlIHN5bnRoIGFuZCBoYW5kbGVkIGluIHZhcmlvdXMgd2F5c1xyXG4gICAgLy8gaW5pdGlhbCBvdXRwdXQgaXMgdGhlIGRvY3VtZW50IHRpdGxlXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpXHJcbiAgICB0aGlzLm91dHB1dFV0dGVyYW5jZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBuZXcgVXR0ZXJhbmNlKCBkb2N1bWVudC50aXRsZSwgJ29mZicgKSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gYSBsaW5lYXIgcmVwcmVzZW50YXRpb24gb2YgdGhlIERPTSB3aGljaCBpcyBuYXZpZ2F0ZWQgYnkgdGhlIHVzZXJcclxuICAgIHRoaXMubGluZWFyRE9NID0gdGhpcy5nZXRMaW5lYXJET01FbGVtZW50cyggZG9tRWxlbWVudCApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gdGhlIGFjdGl2ZSBlbGVtZW50IGlzIGVsZW1lbnQgdGhhdCBpcyB1bmRlciBuYXZpZ2F0aW9uIGluIHRoZSBwYXJhbGxlbCBET01cclxuICAgIHRoaXMuYWN0aXZlRWxlbWVudCA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSB0aGUgYWN0aXZlIGxpbmUgaXMgdGhlIGN1cnJlbnQgbGluZSBiZWluZyByZWFkIGFuZCBuYXZpZ2F0ZWQgd2l0aCB0aGUgY3Vyc29yXHJcbiAgICB0aGlzLmFjdGl2ZUxpbmUgPSBudWxsO1xyXG5cclxuICAgIC8vIHRoZSBsZXR0ZXIgcG9zaXRpb24gaXMgdGhlIHBvc2l0aW9uIG9mIHRoZSBjdXJzb3IgaW4gdGhlIGFjdGl2ZSBsaW5lIHRvIHN1cHBvcnQgcmVhZGluZyBvbiBhXHJcbiAgICAvLyBsZXR0ZXIgYnkgbGV0dGVyIGJhc2lzLiAgVGhpcyBpcyByZWxhdGl2ZSB0byB0aGUgbGVuZ3RoIG9mIHRoZSBhY3RpdmUgbGluZS5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmxldHRlclBvc2l0aW9uID0gMDtcclxuXHJcbiAgICAvLyB0aGUgcG9zaXRpb25JbkxpbmUgaXMgdGhlIHBvc2l0aW9uIGluIHdvcmRzIG1hcmtpbmcgdGhlIGVuZCBsb2NhdGlvbiBvZiB0aGUgYWN0aXZlIGxpbmVcclxuICAgIC8vIHRoaXMgbXVzdCBiZSB0cmFja2VkIHRvIHN1cHBvcnQgY29udGVudCBhbmQgZGVzY3JpcHRpb25zIGxvbmdlciB0aGFuIDE1IHdvcmRzXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5wb3NpdGlvbkluTGluZSA9IDA7XHJcblxyXG4gICAgLy8gdGhlIHBvc2l0aW9uIG9mIHRoZSB3b3JkIGluIHRoZSBhY3RpdmUgbGluZSB0byBzdXBwb3J0IG5hdmlnYXRpb24gb24gYSB3b3JkIGJ5IHdvcmQgYmFzaXNcclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLndvcmRQb3NpdGlvbiA9IDA7XHJcblxyXG4gICAgLy8gd2UgbmVlZCB0byB0cmFjayB0aGUgbXV0YXRpb24gb2JzZXJ2ZXJzIHNvIHRoYXQgdGhleSBjYW4gYmUgZGlzY2Nvbm5lY3RlZFxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMub2JzZXJ2ZXJzID0gW107XHJcblxyXG4gICAgLy8gdHJhY2sgYSBrZXlzdGF0ZSBpbiBvcmRlciB0byBoYW5kbGUgd2hlbiBtdWx0aXBsZSBrZXkgcHJlc3NlcyBoYXBwZW4gYXQgb25jZVxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMua2V5U3RhdGUgPSB7fTtcclxuXHJcbiAgICAvLyB0aGUgZG9jdW1lbnQgd2lsbCBsaXN0ZW4gZm9yIGtleWJvYXJkIGludGVyYWN0aW9uc1xyXG4gICAgLy8gdGhpcyBsaXN0ZW5lciBpbXBsZW1lbnRzIGNvbW1vbiBuYXZpZ2F0aW9uIHN0cmF0ZWdpZXMgZm9yIGEgdHlwaWNhbCBzY3JlZW4gcmVhZGVyXHJcbiAgICAvL1xyXG4gICAgLy8gc2VlIGh0dHBzOi8vZGVxdWV1bml2ZXJzaXR5LmNvbS9zY3JlZW5yZWFkZXJzL252ZGEta2V5Ym9hcmQtc2hvcnRjdXRzXHJcbiAgICAvLyBmb3IgYSBsaXN0IG9mIGNvbW1vbiBuYXZpZ2F0aW9uIHN0cmF0ZWdpZXNcclxuICAgIC8vXHJcbiAgICAvLyBUT0RPOiBVc2UgdGhpcy5rZXlTdGF0ZSBvYmplY3QgaW5zdGVhZCBvZiByZWZlcmVuY2luZyB0aGUgZXZlbnQgZGlyZWN0bHlcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgZXZlbnQgPT4ge1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHRoZSBrZXlzdGF0ZSBvYmplY3RcclxuICAgICAgdGhpcy5rZXlTdGF0ZVsgZXZlbnQua2V5Q29kZSBdID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIHN0b3JlIHRoZSBvdXRwdXQgdGV4dCBoZXJlXHJcbiAgICAgIGxldCBvdXRwdXRUZXh0O1xyXG5cclxuICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHNoaWZ0IGtleSBwcmVzc2VkXHJcbiAgICAgIC8vIFRPRE86IHdlIGNhbiBvcHRpb25hbGx5IHVzZSB0aGUga2V5U3RhdGUgb2JqZWN0IGZvciB0aGlzXHJcbiAgICAgIGNvbnN0IHNoaWZ0S2V5RG93biA9IGV2ZW50LnNoaWZ0S2V5O1xyXG5cclxuICAgICAgLy8gZGlyZWN0aW9uIHRvIG5hdmlnYXRlIHRocm91Z2ggdGhlIERPTSAtIHVzdWFsbHksIGhvbGRpbmcgc2hpZnQgaW5kaWNhdGVzIHRoZSB1c2VyIHdhbnRzIHRvIHRyYXZlcnNcclxuICAgICAgLy8gYmFja3dhcmRzIHRocm91Z2ggdGhlIERPTVxyXG4gICAgICBjb25zdCBkaXJlY3Rpb24gPSBzaGlmdEtleURvd24gPyBQUkVWSU9VUyA6IE5FWFQ7XHJcblxyXG4gICAgICAvLyB0aGUgZG9tIGNhbiBjaGFuZ2UgYXQgYW55IHRpbWUsIG1ha2Ugc3VyZSB0aGF0IHdlIGFyZSByZWFkaW5nIGEgY29weSB0aGF0IGlzIHVwIHRvIGRhdGVcclxuICAgICAgdGhpcy5saW5lYXJET00gPSB0aGlzLmdldExpbmVhckRPTUVsZW1lbnRzKCBkb21FbGVtZW50ICk7XHJcblxyXG4gICAgICAvLyB1cGRhdGUgdGhlIGxpc3Qgb2YgbGl2ZSBlbGVtZW50c1xyXG4gICAgICB0aGlzLnVwZGF0ZUxpdmVFbGVtZW50TGlzdCgpO1xyXG5cclxuICAgICAgLy8gaWYgdGhlIGVsZW1lbnQgaGFzIGFuICdhcHBsaWNhdGlvbicgbGlrZSBiZWhhdmlvciwga2V5Ym9hcmQgc2hvdWxkIGJlIGZyZWUgZm9yIHRoZSBhcHBsaWNhdGlvblxyXG4gICAgICAvLyBUT0RPOiBUaGlzIG1heSBiZSBpbnN1ZmZpY2llbnQgaWYgd2UgbmVlZCB0aGUgJ2Fycm93JyBrZXlzIHRvIGNvbnRpbnVlIHRvIHdvcmsgZm9yIGFuIGFwcGxpY2F0aW9uIHJvbGVcclxuICAgICAgaWYgKCB0aGlzLmFjdGl2ZUVsZW1lbnQgJiYgdGhpcy5hY3RpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSggJ3JvbGUnICkgPT09ICdhcHBsaWNhdGlvbicgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBvdGhlcndpc2UsIGhhbmRsZSBhbGwga2V5IGV2ZW50cyBoZXJlXHJcbiAgICAgIGlmICggdGhpcy5rZXlTdGF0ZVsgNDAgXSAmJiAhdGhpcy5rZXlTdGF0ZVsgNDUgXSApIHtcclxuICAgICAgICAvLyByZWFkIHRoZSBuZXh0IGxpbmUgb24gJ2Rvd24gYXJyb3cnXHJcbiAgICAgICAgb3V0cHV0VGV4dCA9IHRoaXMucmVhZE5leHRQcmV2aW91c0xpbmUoIE5FWFQgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgMzggXSAmJiAhdGhpcy5rZXlTdGF0ZVsgNDUgXSApIHtcclxuICAgICAgICAvLyByZWFkIHRoZSBwcmV2aW91cyBsaW5lIG9uICd1cCBhcnJvdydcclxuICAgICAgICBvdXRwdXRUZXh0ID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzTGluZSggUFJFVklPVVMgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgNzIgXSApIHtcclxuICAgICAgICAvLyByZWFkIHRoZSBwcmV2aW91cyBvciBuZXh0IGhlYWRpbmdzIGRlcGVuZGluZyBvbiB3aGV0aGVyIHRoZSBzaGlmdCBrZXkgaXMgcHJlc3NlZFxyXG4gICAgICAgIGNvbnN0IGhlYWRpbmdMZXZlbHMgPSBbICdIMScsICdIMicsICdIMycsICdINCcsICdINScsICdINicgXTtcclxuICAgICAgICBvdXRwdXRUZXh0ID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzSGVhZGluZyggaGVhZGluZ0xldmVscywgZGlyZWN0aW9uICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHRoaXMua2V5U3RhdGVbIDkgXSApIHtcclxuICAgICAgICAvLyBsZXQgdGhlIGJyb3dzZXIgbmF0dXJhbGx5IGhhbmRsZSAndGFiJyBmb3IgZm9ybXMgZWxlbWVudHMgYW5kIGVsZW1lbnRzIHdpdGggYSB0YWJJbmRleFxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLmtleVN0YXRlWyAzOSBdICYmICF0aGlzLmtleVN0YXRlWyAxNyBdICkge1xyXG4gICAgICAgIC8vIHJlYWQgdGhlIG5leHQgY2hhcmFjdGVyIG9mIHRoZSBhY3RpdmUgbGluZSBvbiAncmlnaHQgYXJyb3cnXHJcbiAgICAgICAgb3V0cHV0VGV4dCA9IHRoaXMucmVhZE5leHRQcmV2aW91c0NoYXJhY3RlciggTkVYVCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLmtleVN0YXRlWyAzNyBdICYmICF0aGlzLmtleVN0YXRlWyAxNyBdICkge1xyXG4gICAgICAgIC8vIHJlYWQgdGhlIHByZXZpb3VzIGNoYXJhY3RlciBvbiAnbGVmdCBhcnJvdydcclxuICAgICAgICBvdXRwdXRUZXh0ID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzQ2hhcmFjdGVyKCBQUkVWSU9VUyApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLmtleVN0YXRlWyAzNyBdICYmIHRoaXMua2V5U3RhdGVbIDE3IF0gKSB7XHJcbiAgICAgICAgLy8gcmVhZCB0aGUgcHJldmlvdXMgd29yZCBvbiAnY29udHJvbCArIGxlZnQgYXJyb3cnXHJcbiAgICAgICAgb3V0cHV0VGV4dCA9IHRoaXMucmVhZE5leHRQcmV2aW91c1dvcmQoIFBSRVZJT1VTICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHRoaXMua2V5U3RhdGVbIDM5IF0gJiYgdGhpcy5rZXlTdGF0ZVsgMTcgXSApIHtcclxuICAgICAgICAvLyByZWFkIHRoZSBuZXh0IHdvcmQgb24gJ2NvbnRyb2wgKyByaWdodCBhcnJvdydcclxuICAgICAgICBvdXRwdXRUZXh0ID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzV29yZCggTkVYVCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLmtleVN0YXRlWyA0NSBdICYmIHRoaXMua2V5U3RhdGVbIDM4IF0gKSB7XHJcbiAgICAgICAgLy8gcmVwZWF0IHRoZSBhY3RpdmUgbGluZSBvbiAnaW5zZXJ0ICsgdXAgYXJyb3cnXHJcbiAgICAgICAgb3V0cHV0VGV4dCA9IHRoaXMucmVhZEFjdGl2ZUxpbmUoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgNDkgXSApIHtcclxuICAgICAgICAvLyBmaW5kIHRoZSBwcmV2aW91cy9uZXh0IGhlYWRpbmcgbGV2ZWwgMSBvbiAnMSdcclxuICAgICAgICBvdXRwdXRUZXh0ID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzSGVhZGluZyggWyAnSDEnIF0sIGRpcmVjdGlvbiApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLmtleVN0YXRlWyA1MCBdICkge1xyXG4gICAgICAgIC8vIGZpbmQgdGhlIHByZXZpb3VzL25leHQgaGVhZGluZyBsZXZlbCAyIG9uICcyJ1xyXG4gICAgICAgIG91dHB1dFRleHQgPSB0aGlzLnJlYWROZXh0UHJldmlvdXNIZWFkaW5nKCBbICdIMicgXSwgZGlyZWN0aW9uICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHRoaXMua2V5U3RhdGVbIDUxIF0gKSB7XHJcbiAgICAgICAgLy8gZmluZCB0aGUgcHJldmlvdXMvbmV4dCBoZWFkaW5nIGxldmVsIDMgb24gJzMnXHJcbiAgICAgICAgb3V0cHV0VGV4dCA9IHRoaXMucmVhZE5leHRQcmV2aW91c0hlYWRpbmcoIFsgJ0gzJyBdLCBkaXJlY3Rpb24gKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgNTIgXSApIHtcclxuICAgICAgICAvLyBmaW5kIHRoZSBwcmV2aW91cy9uZXh0IGhlYWRpbmcgbGV2ZWwgNCBvbiAnNCdcclxuICAgICAgICBvdXRwdXRUZXh0ID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzSGVhZGluZyggWyAnSDQnIF0sIGRpcmVjdGlvbiApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLmtleVN0YXRlWyA1MyBdICkge1xyXG4gICAgICAgIC8vIGZpbmQgdGhlIHByZXZpb3VzL25leHQgaGVhZGluZyBsZXZlbCA1IG9uICc1J1xyXG4gICAgICAgIG91dHB1dFRleHQgPSB0aGlzLnJlYWROZXh0UHJldmlvdXNIZWFkaW5nKCBbICdINScgXSwgZGlyZWN0aW9uICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHRoaXMua2V5U3RhdGVbIDU0IF0gKSB7XHJcbiAgICAgICAgLy8gZmluZCB0aGUgcHJldmlvdXMvbmV4dCBoZWFkaW5nIGxldmVsIDYgb24gJzYnXHJcbiAgICAgICAgb3V0cHV0VGV4dCA9IHRoaXMucmVhZE5leHRQcmV2aW91c0hlYWRpbmcoIFsgJ0g2JyBdLCBkaXJlY3Rpb24gKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgNzAgXSApIHtcclxuICAgICAgICAvLyBmaW5kIHRoZSBwcmV2aW91cy9uZXh0IGZvcm0gZWxlbWVudCBvbiAnZidcclxuICAgICAgICBvdXRwdXRUZXh0ID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzRm9ybUVsZW1lbnQoIGRpcmVjdGlvbiApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLmtleVN0YXRlWyA2NiBdICkge1xyXG4gICAgICAgIC8vIGZpbmQgdGhlIHByZXZpb3VzL25leHQgYnV0dG9uIGVsZW1lbnQgb24gJ2InXHJcbiAgICAgICAgb3V0cHV0VGV4dCA9IHRoaXMucmVhZE5leHRQcmV2aW91c0J1dHRvbiggZGlyZWN0aW9uICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHRoaXMua2V5U3RhdGVbIDc2IF0gKSB7XHJcbiAgICAgICAgLy8gZmluZCB0aGUgcHJldmlvdXMvbmV4dCBsaXN0IG9uICdMJ1xyXG4gICAgICAgIG91dHB1dFRleHQgPSB0aGlzLnJlYWROZXh0UHJldmlvdXNMaXN0KCBkaXJlY3Rpb24gKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggdGhpcy5rZXlTdGF0ZVsgNzMgXSApIHtcclxuICAgICAgICAvLyBmaW5kIHRoZSBwcmV2aW91cy9uZXh0IGxpc3QgaXRlbSBvbiAnSSdcclxuICAgICAgICBvdXRwdXRUZXh0ID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzTGlzdEl0ZW0oIGRpcmVjdGlvbiApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLmtleVN0YXRlWyA0NSBdICYmIHRoaXMua2V5U3RhdGVbIDQwIF0gKSB7XHJcbiAgICAgICAgLy8gcmVhZCBlbnRpcmUgZG9jdW1lbnQgb24gJ2luc2VydCArIGRvd24gYXJyb3cnXHJcbiAgICAgICAgdGhpcy5yZWFkRW50aXJlRG9jdW1lbnQoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaWYgdGhlIGFjdGl2ZSBlbGVtZW50IGlzIGZvY3VzYWJsZSwgc2V0IHRoZSBmb2N1cyB0byBpdCBzbyB0aGF0IHRoZSB2aXJ0dWFsIGN1cnNvciBjYW5cclxuICAgICAgLy8gZGlyZWN0bHkgaW50ZXJhY3Qgd2l0aCBlbGVtZW50c1xyXG4gICAgICBpZiAoIHRoaXMuYWN0aXZlRWxlbWVudCAmJiB0aGlzLmlzRm9jdXNhYmxlKCB0aGlzLmFjdGl2ZUVsZW1lbnQgKSApIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZUVsZW1lbnQuZm9jdXMoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaWYgdGhlIG91dHB1dCB0ZXh0IGlzIGEgc3BhY2UsIHdlIHdhbnQgaXQgdG8gYmUgcmVhZCBhcyAnYmxhbmsnIG9yICdzcGFjZSdcclxuICAgICAgaWYgKCBvdXRwdXRUZXh0ID09PSBTUEFDRSApIHtcclxuICAgICAgICBvdXRwdXRUZXh0ID0gJ3NwYWNlJztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBvdXRwdXRUZXh0ICkge1xyXG4gICAgICAgIC8vIGZvciBub3csIGFsbCB1dHRlcmFuY2VzIGFyZSBvZmYgZm9yIGFyaWEtbGl2ZVxyXG4gICAgICAgIHRoaXMub3V0cHV0VXR0ZXJhbmNlUHJvcGVydHkuc2V0KCBuZXcgVXR0ZXJhbmNlKCBvdXRwdXRUZXh0LCAnb2ZmJyApICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRPRE86IGV2ZXJ5dGhpbmcgZWxzZSBpbiBodHRwczovL2RlcXVldW5pdmVyc2l0eS5jb20vc2NyZWVucmVhZGVycy9udmRhLWtleWJvYXJkLXNob3J0Y3V0c1xyXG5cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIGtleXN0YXRlIG9iamVjdCBvbiBrZXl1cCB0byBoYW5kbGUgbXVsdGlwbGUga2V5IHByZXNzZXMgYXQgb25jZVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleXVwJywgZXZlbnQgPT4ge1xyXG4gICAgICB0aGlzLmtleVN0YXRlWyBldmVudC5rZXlDb2RlIF0gPSBmYWxzZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBsaXN0ZW4gZm9yIHdoZW4gYW4gZWxlbWVudCBpcyBhYm91dCB0byByZWNlaXZlIGZvY3VzXHJcbiAgICAvLyB3ZSBhcmUgdXNpbmcgZm9jdXNpbiAoYW5kIG5vdCBmb2N1cykgYmVjYXVzZSB3ZSB3YW50IHRoZSBldmVudCB0byBidWJibGUgdXAgdGhlIGRvY3VtZW50XHJcbiAgICAvLyB0aGlzIHdpbGwgaGFuZGxlIGJvdGggdGFiIG5hdmlnYXRpb24gQU5EIHByb2dyYW1hdGljIGZvY3VzIGJ5IHRoZSBzaW11bGF0aW9uXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnZm9jdXNpbicsIGZ1bmN0aW9uKCBldmVudCApIHtcclxuXHJcbiAgICAgIC8vIGFub3VuY2UgdGhlIG5ldyBmb2N1cyBpZiBpdCBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgYWN0aXZlIGVsZW1lbnRcclxuICAgICAgaWYgKCBldmVudC50YXJnZXQgIT09IHNlbGYuYWN0aXZlRWxlbWVudCApIHtcclxuICAgICAgICBzZWxmLmFjdGl2ZUVsZW1lbnQgPSBldmVudC50YXJnZXQ7XHJcblxyXG4gICAgICAgIC8vIHNvIHJlYWQgb3V0IGFsbCBjb250ZW50IGZyb20gYXJpYSBtYXJrdXAgc2luY2UgZm9jdXMgbW92ZWQgdmlhIGFwcGxpY2F0aW9uIGJlaGF2aW9yXHJcbiAgICAgICAgY29uc3Qgd2l0aEFwcGxpY2F0aW9uQ29udGVudCA9IHRydWU7XHJcbiAgICAgICAgY29uc3Qgb3V0cHV0VGV4dCA9IHNlbGYuZ2V0QWNjZXNzaWJsZVRleHQoIHRoaXMuYWN0aXZlRWxlbWVudCwgd2l0aEFwcGxpY2F0aW9uQ29udGVudCApO1xyXG5cclxuICAgICAgICBpZiAoIG91dHB1dFRleHQgKSB7XHJcbiAgICAgICAgICBjb25zdCBsaXZlUm9sZSA9IHNlbGYuYWN0aXZlRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLWxpdmUnICk7XHJcbiAgICAgICAgICBzZWxmLm91dHB1dFV0dGVyYW5jZVByb3BlcnR5LnNldCggbmV3IFV0dGVyYW5jZSggb3V0cHV0VGV4dCwgbGl2ZVJvbGUgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGFsbCAnZWxlbWVudCcgbm9kZXMgb2ZmIHRoZSBwYXJlbnQgZWxlbWVudCwgcGxhY2luZyB0aGVtIGluIGFuIGFycmF5XHJcbiAgICogZm9yIGVhc3kgdHJhdmVyc2FsLiAgTm90ZSB0aGF0IHRoaXMgaW5jbHVkZXMgYWxsIGVsZW1lbnRzLCBldmVuIHRob3NlXHJcbiAgICogdGhhdCBhcmUgJ2hpZGRlbicgb3IgcHVyZWx5IGZvciBzdHJ1Y3R1cmUuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBkb21FbGVtZW50IC0gdGhlIHBhcmVudCBlbGVtZW50IHRvIGxpbmVhcml6ZVxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48SFRNTEVsZW1lbnQ+fVxyXG4gICAqL1xyXG4gIGdldExpbmVhckRPTUVsZW1lbnRzKCBkb21FbGVtZW50ICkge1xyXG4gICAgLy8gZ2V0cyBBTEwgZGVzY2VuZGVudCBjaGlsZHJlbiBmb3IgdGhlIGVsZW1lbnRcclxuICAgIGNvbnN0IGNoaWxkcmVuID0gZG9tRWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSggJyonICk7XHJcblxyXG4gICAgY29uc3QgbGluZWFyRE9NID0gW107XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCBjaGlsZHJlblsgaSBdLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSApIHtcclxuICAgICAgICBsaW5lYXJET01bIGkgXSA9ICggY2hpbGRyZW5bIGkgXSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbGluZWFyRE9NO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBsaXZlIHJvbGUgZnJvbSB0aGUgRE9NIGVsZW1lbnQuICBJZiB0aGUgZWxlbWVudCBpcyBub3QgbGl2ZSwgcmV0dXJuIG51bGwuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRvbUVsZW1lbnRcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldExpdmVSb2xlKCBkb21FbGVtZW50ICkge1xyXG4gICAgbGV0IGxpdmVSb2xlID0gbnVsbDtcclxuXHJcbiAgICAvLyBjb2xsZWN0aW9uIG9mIGFsbCByb2xlcyB0aGF0IGNhbiBwcm9kdWNlICdsaXZlIHJlZ2lvbicgYmVoYXZpb3JcclxuICAgIC8vIHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BY2Nlc3NpYmlsaXR5L0FSSUEvQVJJQV9MaXZlX1JlZ2lvbnNcclxuICAgIGNvbnN0IHJvbGVzID0gWyAnbG9nJywgJ3N0YXR1cycsICdhbGVydCcsICdwcm9ncmVzc2JhcicsICdtYXJxdWVlJywgJ3RpbWVyJywgJ2Fzc2VydGl2ZScsICdwb2xpdGUnIF07XHJcblxyXG4gICAgcm9sZXMuZm9yRWFjaCggcm9sZSA9PiB7XHJcbiAgICAgIGlmICggZG9tRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLWxpdmUnICkgPT09IHJvbGUgfHwgZG9tRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdyb2xlJyApID09PSByb2xlICkge1xyXG4gICAgICAgIGxpdmVSb2xlID0gcm9sZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBsaXZlUm9sZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgbmV4dCBvciBwcmV2aW91cyBlbGVtZW50IGluIHRoZSBET00sIGRlcGVuZGluZyBvbiB0aGUgZGVzaXJlZCBkaXJlY3Rpb24uXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7W3R5cGVdfSBkaXJlY3Rpb24gLSBORVhUIHx8IFBSRVZJT1VTXHJcbiAgICogQHJldHVybnMge0hUTUxFbGVtZW50fVxyXG4gICAqL1xyXG4gIGdldE5leHRQcmV2aW91c0VsZW1lbnQoIGRpcmVjdGlvbiApIHtcclxuICAgIGlmICggIXRoaXMuYWN0aXZlRWxlbWVudCApIHtcclxuICAgICAgdGhpcy5hY3RpdmVFbGVtZW50ID0gdGhpcy5saW5lYXJET01bIDAgXTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZWFyY2hEZWx0YSA9IGRpcmVjdGlvbiA9PT0gJ05FWFQnID8gMSA6IC0xO1xyXG4gICAgY29uc3QgYWN0aXZlSW5kZXggPSB0aGlzLmxpbmVhckRPTS5pbmRleE9mKCB0aGlzLmFjdGl2ZUVsZW1lbnQgKTtcclxuXHJcbiAgICBjb25zdCBuZXh0SW5kZXggPSBhY3RpdmVJbmRleCArIHNlYXJjaERlbHRhO1xyXG4gICAgcmV0dXJuIHRoaXMubGluZWFyRE9NWyBuZXh0SW5kZXggXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgbGFiZWwgZm9yIGEgcGFydGljdWxhciBpZFxyXG4gICAqIEBwcml2YXRlXHJcblxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZFxyXG4gICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cclxuICAgKi9cclxuICBnZXRMYWJlbCggaWQgKSB7XHJcbiAgICBjb25zdCBsYWJlbHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSggJ2xhYmVsJyApO1xyXG5cclxuICAgIC8vIGxvb3AgdGhyb3VnaCBOb2RlTGlzdFxyXG4gICAgbGV0IGxhYmVsV2l0aElkO1xyXG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCggbGFiZWxzLCBsYWJlbCA9PiB7XHJcbiAgICAgIGlmICggbGFiZWwuZ2V0QXR0cmlidXRlKCAnZm9yJyApICkge1xyXG4gICAgICAgIGxhYmVsV2l0aElkID0gbGFiZWw7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxhYmVsV2l0aElkLCAnTm8gbGFiZWwgZm91bmQgZm9yIGlkJyApO1xyXG5cclxuICAgIHJldHVybiBsYWJlbFdpdGhJZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgYWNjZXNzaWJsZSB0ZXh0IGZyb20gdGhlIGVsZW1lbnQuICBEZXBlbmRpbmcgb24gdGhlIG5hdmlnYXRpb24gc3RyYXRlZ3ksXHJcbiAgICogd2UgbWF5IG9yIG1heSBub3Qgd2FudCB0byBpbmNsdWRlIGFsbCBhcHBsaWNhdGlvbiBjb250ZW50IHRleHQgZnJvbSB0aGUgbWFya3VwLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICogQHBhcmFtIHtib29sZWFufSB3aXRoQXBwbGljYXRpb25Db250ZW50IC0gZG8geW91IHdhbnQgdG8gaW5jbHVkZSBhbGwgYXJpYSB0ZXh0IGNvbnRlbnQ/XHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRBY2Nlc3NpYmxlVGV4dCggZWxlbWVudCwgd2l0aEFwcGxpY2F0aW9uQ29udGVudCApIHtcclxuXHJcbiAgICAvLyBwbGFjZWhvbGRlciBmb3IgdGhlIHRleHQgY29udGVudCB0aGF0IHdlIHdpbGwgYnVpbGQgdXAgZnJvbSB0aGUgbWFya3VwXHJcbiAgICBsZXQgdGV4dENvbnRlbnQgPSAnJztcclxuXHJcbiAgICAvLyBpZiB0aGUgZWxlbWVudCBpcyB1bmRlZmluZWQsIHdlIGhhdmUgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZSBkb2N1bWVudFxyXG4gICAgaWYgKCAhZWxlbWVudCApIHtcclxuICAgICAgcmV0dXJuIEVORF9PRl9ET0NVTUVOVDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBmaWx0ZXIgb3V0IHN0cnVjdHVyYWwgZWxlbWVudHMgdGhhdCBkbyBub3QgaGF2ZSBhY2Nlc3NpYmxlIHRleHRcclxuICAgIGlmICggZWxlbWVudC5nZXRBdHRyaWJ1dGUoICdjbGFzcycgKSA9PT0gJ1NjcmVlblZpZXcnICkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnSEVBREVSJyApIHtcclxuICAgICAgLy8gVE9ETzogSGVhZGVycyBzaG91bGQgaGF2ZSBzb21lIGJlaGF2aW9yXHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKCBlbGVtZW50LnRhZ05hbWUgPT09ICdTRUNUSU9OJyApIHtcclxuICAgICAgLy8gVE9ETzogV2hhdCBkbyB5b3Ugd2UgZG8gZm9yIHNlY3Rpb25zPyBSZWFkIHNlY3Rpb24gKyBhcmlhLWxhYmVsbGVkYnk/XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKCBlbGVtZW50LnRhZ05hbWUgPT09ICdMQUJFTCcgKSB7XHJcbiAgICAgIC8vIGxhYmVsIGNvbnRlbnQgaXMgYWRkZWQgbGlrZSAnYXJpYS1kZXNjcmliZWRieScsIGRvIG5vdCByZWFkIHRoaXMgeWV0XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHNlYXJjaCB1cCB0aHJvdWdoIHRoZSBhbmNlc3RvcnMgdG8gc2VlIGlmIHRoaXMgZWxlbWVudCBzaG91bGQgYmUgaGlkZGVuXHJcbiAgICBsZXQgY2hpbGRFbGVtZW50ID0gZWxlbWVudDtcclxuICAgIHdoaWxlICggY2hpbGRFbGVtZW50LnBhcmVudEVsZW1lbnQgKSB7XHJcbiAgICAgIGlmICggY2hpbGRFbGVtZW50LmdldEF0dHJpYnV0ZSggJ2FyaWEtaGlkZGVuJyApIHx8IGNoaWxkRWxlbWVudC5oaWRkZW4gKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7IGNoaWxkRWxlbWVudCA9IGNoaWxkRWxlbWVudC5wYXJlbnRFbGVtZW50OyB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2VhcmNoIGZvciBlbGVtZW50cyB0aGF0IHdpbGwgaGF2ZSBjb250ZW50IGFuZCBzaG91bGQgYmUgcmVhZFxyXG4gICAgaWYgKCBlbGVtZW50LnRhZ05hbWUgPT09ICdQJyApIHtcclxuICAgICAgdGV4dENvbnRlbnQgKz0gZWxlbWVudC50ZXh0Q29udGVudDtcclxuICAgIH1cclxuICAgIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnSDEnICkge1xyXG4gICAgICB0ZXh0Q29udGVudCArPSBgSGVhZGluZyBMZXZlbCAxLCAke2VsZW1lbnQudGV4dENvbnRlbnR9YDtcclxuICAgIH1cclxuICAgIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnSDInICkge1xyXG4gICAgICB0ZXh0Q29udGVudCArPSBgSGVhZGluZyBMZXZlbCAyLCAke2VsZW1lbnQudGV4dENvbnRlbnR9YDtcclxuICAgIH1cclxuICAgIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnSDMnICkge1xyXG4gICAgICB0ZXh0Q29udGVudCArPSBgSGVhZGluZyBMZXZlbCAzLCAke2VsZW1lbnQudGV4dENvbnRlbnR9YDtcclxuICAgIH1cclxuICAgIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnVUwnICkge1xyXG4gICAgICBjb25zdCBsaXN0TGVuZ3RoID0gZWxlbWVudC5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICAgIHRleHRDb250ZW50ICs9IGBMaXN0IHdpdGggJHtsaXN0TGVuZ3RofSBpdGVtc2A7XHJcbiAgICB9XHJcbiAgICBpZiAoIGVsZW1lbnQudGFnTmFtZSA9PT0gJ0xJJyApIHtcclxuICAgICAgdGV4dENvbnRlbnQgKz0gYExpc3QgSXRlbTogJHtlbGVtZW50LnRleHRDb250ZW50fWA7XHJcbiAgICB9XHJcbiAgICBpZiAoIGVsZW1lbnQudGFnTmFtZSA9PT0gJ0JVVFRPTicgKSB7XHJcbiAgICAgIGNvbnN0IGJ1dHRvbkxhYmVsID0gJyBCdXR0b24nO1xyXG4gICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhpcyBpcyBhICd0b2dnbGUnIGJ1dHRvbiB3aXRoIHRoZSAnYXJpYS1wcmVzc2VkJyBhdHRyaWJ1dGVcclxuICAgICAgaWYgKCBlbGVtZW50LmdldEF0dHJpYnV0ZSggJ2FyaWEtcHJlc3NlZCcgKSApIHtcclxuICAgICAgICBsZXQgdG9nZ2xlTGFiZWwgPSAnIHRvZ2dsZSc7XHJcbiAgICAgICAgY29uc3QgcHJlc3NlZExhYmVsID0gJyBwcmVzc2VkJztcclxuICAgICAgICBjb25zdCBub3RMYWJlbCA9ICcgbm90JztcclxuXHJcbiAgICAgICAgLy8gaW5zZXJ0IGEgY29tbWEgZm9yIHJlYWRpYmlsaXR5IG9mIHRoZSBzeW50aFxyXG4gICAgICAgIHRvZ2dsZUxhYmVsICs9IGJ1dHRvbkxhYmVsICsgQ09NTUE7XHJcbiAgICAgICAgaWYgKCBlbGVtZW50LmdldEF0dHJpYnV0ZSggJ2FyaWEtcHJlc3NlZCcgKSA9PT0gJ3RydWUnICkge1xyXG4gICAgICAgICAgdG9nZ2xlTGFiZWwgKz0gcHJlc3NlZExhYmVsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRvZ2dsZUxhYmVsICs9IG5vdExhYmVsICsgcHJlc3NlZExhYmVsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0ZXh0Q29udGVudCArPSBlbGVtZW50LnRleHRDb250ZW50ICsgQ09NTUEgKyB0b2dnbGVMYWJlbDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0ZXh0Q29udGVudCArPSBlbGVtZW50LnRleHRDb250ZW50ICsgYnV0dG9uTGFiZWw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnSU5QVVQnICkge1xyXG4gICAgICBpZiAoIGVsZW1lbnQudHlwZSA9PT0gJ3Jlc2V0JyApIHtcclxuICAgICAgICB0ZXh0Q29udGVudCArPSBgJHtlbGVtZW50LmdldEF0dHJpYnV0ZSggJ3ZhbHVlJyApfSBCdXR0b25gO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggZWxlbWVudC50eXBlID09PSAnY2hlY2tib3gnICkge1xyXG4gICAgICAgIC8vIHRoZSBjaGVja2JveCBzaG91bGQgaGF2ZSBhIGxhYmVsIC0gZmluZCB0aGUgY29ycmVjdCBvbmVcclxuICAgICAgICBjb25zdCBjaGVja2JveExhYmVsID0gdGhpcy5nZXRMYWJlbCggZWxlbWVudC5pZCApO1xyXG4gICAgICAgIGNvbnN0IGxhYmVsQ29udGVudCA9IGNoZWNrYm94TGFiZWwudGV4dENvbnRlbnQ7XHJcblxyXG4gICAgICAgIC8vIGRlc2NyaWJlIGFzIGEgc3dpdGNoIGlmIGl0IGhhcyB0aGUgcm9sZVxyXG4gICAgICAgIGlmICggZWxlbWVudC5nZXRBdHRyaWJ1dGUoICdyb2xlJyApID09PSAnc3dpdGNoJyApIHtcclxuICAgICAgICAgIC8vIHJlcXVpcmVkIGZvciBhIGNoZWNrYm94XHJcbiAgICAgICAgICBjb25zdCBhcmlhQ2hlY2tlZCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnYXJpYS1jaGVja2VkJyApO1xyXG4gICAgICAgICAgaWYgKCBhcmlhQ2hlY2tlZCApIHtcclxuICAgICAgICAgICAgY29uc3Qgc3dpdGNoZWRTdHJpbmcgPSAoIGFyaWFDaGVja2VkID09PSAndHJ1ZScgKSA/ICdPbicgOiAnT2ZmJztcclxuICAgICAgICAgICAgdGV4dENvbnRlbnQgKz0gYCR7bGFiZWxDb250ZW50ICsgQ09NTUEgKyBTUEFDRX1zd2l0Y2gke0NPTU1BfSR7U1BBQ0V9JHtzd2l0Y2hlZFN0cmluZ31gO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnY2hlY2tib3ggc3dpdGNoIG11c3QgaGF2ZSBhcmlhLWNoZWNrZWQgYXR0cmlidXRlJyApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGNvbnN0IGNoZWNrZWRTdHJpbmcgPSBlbGVtZW50LmNoZWNrZWQgPyAnIENoZWNrZWQnIDogJyBOb3QgQ2hlY2tlZCc7XHJcbiAgICAgICAgICB0ZXh0Q29udGVudCArPSBgJHtlbGVtZW50LnRleHRDb250ZW50fSBDaGVja2JveCR7Y2hlY2tlZFN0cmluZ31gO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIHdlIGFyZSBpbiBhbiAnYXBwbGljYXRpb24nIHN0eWxlIG9mIG5hdmlnYXRpb24sIHdlIHdhbnQgdG8gYWRkIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cclxuICAgIC8vIGZyb20gdGhlIG1hcmt1cFxyXG4gICAgLy8gT3JkZXIgb2YgYWRkaXRpb25zIHRvIHRleHRDb250ZW50IGlzIGltcG9ydGFudCwgYW5kIGlzIGRlc2lnbmVkIHRvIG1ha2Ugc2Vuc2VcclxuICAgIC8vIHdoZW4gdGV4dENvbnRlbnQgaXMgcmVhZCBjb250aW51b3VzbHlcclxuICAgIC8vIFRPRE86IHN1cHBvcnQgbW9yZSBtYXJrdXAhXHJcbiAgICBpZiAoIHdpdGhBcHBsaWNhdGlvbkNvbnRlbnQgKSB7XHJcblxyXG4gICAgICAvLyBpbnNlcnQgYSBjb21tYSBhdCB0aGUgZW5kIG9mIHRoZSBjb250ZW50IHRvIGVuaGFuY2UgdGhlIG91dHB1dCBvZiB0aGUgc3ludGhcclxuICAgICAgaWYgKCB0ZXh0Q29udGVudC5sZW5ndGggPiAwICkge1xyXG4gICAgICAgIHRleHRDb250ZW50ICs9IENPTU1BO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBsb29rIGZvciBhbiBhcmlhLWxhYmVsXHJcbiAgICAgIGNvbnN0IGFyaWFMYWJlbCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbCcgKTtcclxuICAgICAgaWYgKCBhcmlhTGFiZWwgKSB7XHJcbiAgICAgICAgdGV4dENvbnRlbnQgKz0gU1BBQ0UgKyBhcmlhTGFiZWwgKyBDT01NQTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gbG9vayBmb3IgYW4gYXJpYS1sYWJlbGxlZEJ5IGF0dHJpYnV0ZSB0byBzZWUgaWYgdGhlcmUgaXMgYW5vdGhlciBlbGVtZW50IGluIHRoZSBET00gdGhhdFxyXG4gICAgICAvLyBkZXNjcmliZXMgdGhpcyBvbmVcclxuICAgICAgY29uc3QgYXJpYUxhYmVsbGVkQnlJZCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbGxlZEJ5JyApO1xyXG4gICAgICBpZiAoIGFyaWFMYWJlbGxlZEJ5SWQgKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGFyaWFMYWJlbGxlZEJ5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIGFyaWFMYWJlbGxlZEJ5SWQgKTtcclxuICAgICAgICBjb25zdCBhcmlhTGFiZWxsZWRCeVRleHQgPSBhcmlhTGFiZWxsZWRCeS50ZXh0Q29udGVudDtcclxuXHJcbiAgICAgICAgdGV4dENvbnRlbnQgKz0gU1BBQ0UgKyBhcmlhTGFiZWxsZWRCeVRleHQgKyBDT01NQTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gc2VhcmNoIHVwIHRocm91Z2ggdGhlIGFuY2VzdG9ycyB0byBmaW5kIGlmIHRoZSBlbGVtZW50IGhhcyAnYXBwbGljYXRpb24nIG9yICdkb2N1bWVudCcgY29udGVudFxyXG4gICAgICAvLyBUT0RPOiBGYWN0b3Igb3V0IGludG8gYSBzZWFyY2hVcCB0eXBlIG9mIGZ1bmN0aW9uLlxyXG4gICAgICBjaGlsZEVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgICBsZXQgcm9sZTtcclxuICAgICAgd2hpbGUgKCBjaGlsZEVsZW1lbnQucGFyZW50RWxlbWVudCApIHtcclxuICAgICAgICByb2xlID0gY2hpbGRFbGVtZW50LmdldEF0dHJpYnV0ZSggJ3JvbGUnICk7XHJcbiAgICAgICAgaWYgKCByb2xlID09PSAnZG9jdW1lbnQnIHx8IHJvbGUgPT09ICdhcHBsaWNhdGlvbicgKSB7XHJcbiAgICAgICAgICB0ZXh0Q29udGVudCArPSBTUEFDRSArIHJvbGUgKyBDT01NQTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHsgY2hpbGRFbGVtZW50ID0gY2hpbGRFbGVtZW50LnBhcmVudEVsZW1lbnQ7IH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoaXMgZWxlbWVudCBoYXMgYW4gYXJpYS1yb2xlXHJcbiAgICAgIGlmICggZWxlbWVudC5nZXRBdHRyaWJ1dGUoICdyb2xlJyApICkge1xyXG4gICAgICAgIHJvbGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSggJ3JvbGUnICk7XHJcbiAgICAgICAgLy8gVE9ETyBoYW5kbGUgYWxsIHRoZSBkaWZmZXJlbnQgcm9sZXMhXHJcblxyXG4gICAgICAgIC8vIGxhYmVsIGlmIHRoZSByb2xlIGlzIGEgYnV0dG9uXHJcbiAgICAgICAgaWYgKCByb2xlID09PSAnYnV0dG9uJyApIHtcclxuICAgICAgICAgIHRleHRDb250ZW50ICs9IGAke1NQQUNFfUJ1dHRvbmA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhpcyBlbGVtZW50IGlzIGRyYWdnYWJsZVxyXG4gICAgICBpZiAoIGVsZW1lbnQuZHJhZ2dhYmxlICkge1xyXG4gICAgICAgIHRleHRDb250ZW50ICs9IGAke1NQQUNFfWRyYWdnYWJsZSR7Q09NTUF9YDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gbG9vayBmb3IgYXJpYS1ncmFiYmVkIG1hcmt1cCB0byBsZXQgdGhlIHVzZXIga25vdyBpZiB0aGUgZWxlbWVudCBpcyBncmFiYmVkXHJcbiAgICAgIGlmICggZWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLWdyYWJiZWQnICkgPT09ICd0cnVlJyApIHtcclxuICAgICAgICB0ZXh0Q29udGVudCArPSBgJHtTUEFDRX1ncmFiYmVkJHtDT01NQX1gO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBsb29rIGZvciBhbiBlbGVtZW50IGluIHRoZSBET00gdGhhdCBkZXNjcmliZXMgdGhpcyBvbmVcclxuICAgICAgY29uc3QgYXJpYURlc2NyaWJlZEJ5ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLWRlc2NyaWJlZGJ5JyApO1xyXG4gICAgICBpZiAoIGFyaWFEZXNjcmliZWRCeSApIHtcclxuICAgICAgICAvLyB0aGUgYXJpYSBzcGVjIHN1cHBvcnRzIG11bHRpcGxlIGRlc2NyaXB0aW9uIElEJ3MgZm9yIGEgc2luZ2xlIGVsZW1lbnRcclxuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbklEcyA9IGFyaWFEZXNjcmliZWRCeS5zcGxpdCggU1BBQ0UgKTtcclxuXHJcbiAgICAgICAgbGV0IGRlc2NyaXB0aW9uRWxlbWVudDtcclxuICAgICAgICBsZXQgZGVzY3JpcHRpb25UZXh0O1xyXG4gICAgICAgIGRlc2NyaXB0aW9uSURzLmZvckVhY2goIGRlc2NyaXB0aW9uSUQgPT4ge1xyXG4gICAgICAgICAgZGVzY3JpcHRpb25FbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIGRlc2NyaXB0aW9uSUQgKTtcclxuICAgICAgICAgIGRlc2NyaXB0aW9uVGV4dCA9IGRlc2NyaXB0aW9uRWxlbWVudC50ZXh0Q29udGVudDtcclxuXHJcbiAgICAgICAgICB0ZXh0Q29udGVudCArPSBTUEFDRSArIGRlc2NyaXB0aW9uVGV4dDtcclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZGVsZXRlIHRoZSB0cmFpbGluZyBjb21tYSBpZiBpdCBleGlzdHMgYXQgdGhlIGVuZCBvZiB0aGUgdGV4dENvbnRlbnRcclxuICAgIGlmICggdGV4dENvbnRlbnRbIHRleHRDb250ZW50Lmxlbmd0aCAtIDEgXSA9PT0gJywnICkge1xyXG4gICAgICB0ZXh0Q29udGVudCA9IHRleHRDb250ZW50LnNsaWNlKCAwLCAtMSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0ZXh0Q29udGVudDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgbmV4dCBvciBwcmV2aW91cyBlbGVtZW50IGluIHRoZSBET00gdGhhdCBoYXMgYWNjZXNzaWJsZSB0ZXh0IGNvbnRlbnQsIHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50XHJcbiAgICogYWN0aXZlIGVsZW1lbnQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSAge3N0cmluZ30gZGlyZWN0aW9uIC0gTkVYVCB8fCBQUkVWSU9VU1xyXG4gICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cclxuICAgKi9cclxuICBnZXROZXh0UHJldmlvdXNFbGVtZW50V2l0aFBET01Db250ZW50KCBkaXJlY3Rpb24gKSB7XHJcbiAgICBsZXQgcGRvbUNvbnRlbnQ7XHJcbiAgICB3aGlsZSAoICFwZG9tQ29udGVudCApIHtcclxuICAgICAgLy8gc2V0IHRoZSBzZWxlY3RlZCBlbGVtZW50IHRvIHRoZSBuZXh0IGVsZW1lbnQgaW4gdGhlIERPTVxyXG4gICAgICB0aGlzLmFjdGl2ZUVsZW1lbnQgPSB0aGlzLmdldE5leHRQcmV2aW91c0VsZW1lbnQoIGRpcmVjdGlvbiApO1xyXG4gICAgICBwZG9tQ29udGVudCA9IHRoaXMuZ2V0QWNjZXNzaWJsZVRleHQoIHRoaXMuYWN0aXZlRWxlbWVudCwgZmFsc2UgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5hY3RpdmVFbGVtZW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBuZXh0IGVsZW1lbnQgaW4gdGhlIERPTSB3aXRoIG9uIG9mIHRoZSBkZXNpcmVkIHRhZ05hbWVzLCB0eXBlcywgb3Igcm9sZXMuICBUaGlzIGRvZXMgbm90IHNldCB0aGUgYWN0aXZlIGVsZW1lbnQsIGl0XHJcbiAgICogb25seSB0cmF2ZXJzZXMgdGhlIGRvY3VtZW50IGxvb2tpbmcgZm9yIGVsZW1lbnRzLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0gIHtBcnJheS48c3RyaW5nPn0gcm9sZXMgLSBsaXN0IG9mIGRlc2lyZWQgRE9NIHRhZyBuYW1lcywgdHlwZXMsIG9yIGFyaWEgcm9sZXNcclxuICAgKiBAcGFyYW0gIHtbdHlwZV19IGRpcmVjdGlvbiAtIGRpcmVjdGlvbiBmbGFnIGZvciB0byBzZWFyY2ggdGhyb3VnaCB0aGUgRE9NIC0gTkVYVCB8fCBQUkVWSU9VU1xyXG4gICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cclxuICAgKi9cclxuICBnZXROZXh0UHJldmlvdXNFbGVtZW50V2l0aFJvbGUoIHJvbGVzLCBkaXJlY3Rpb24gKSB7XHJcblxyXG4gICAgbGV0IGVsZW1lbnQgPSBudWxsO1xyXG4gICAgY29uc3Qgc2VhcmNoRGVsdGEgPSAoIGRpcmVjdGlvbiA9PT0gTkVYVCApID8gMSA6IC0xO1xyXG5cclxuICAgIC8vIGlmIHRoZXJlIGlzIG5vdCBhbiBhY3RpdmUgZWxlbWVudCwgdXNlIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBET00uXHJcbiAgICBpZiAoICF0aGlzLmFjdGl2ZUVsZW1lbnQgKSB7XHJcbiAgICAgIHRoaXMuYWN0aXZlRWxlbWVudCA9IHRoaXMubGluZWFyRE9NWyAwIF07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc3RhcnQgc2VhcmNoIGZyb20gdGhlIG5leHQgb3IgcHJldmlvdXMgZWxlbWVudCBhbmQgc2V0IHVwIHRoZSB0cmF2ZXJzYWwgY29uZGl0aW9uc1xyXG4gICAgbGV0IHNlYXJjaEluZGV4ID0gdGhpcy5saW5lYXJET00uaW5kZXhPZiggdGhpcy5hY3RpdmVFbGVtZW50ICkgKyBzZWFyY2hEZWx0YTtcclxuICAgIHdoaWxlICggdGhpcy5saW5lYXJET01bIHNlYXJjaEluZGV4IF0gKSB7XHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHJvbGVzLmxlbmd0aDsgaisrICkge1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRUYWcgPSB0aGlzLmxpbmVhckRPTVsgc2VhcmNoSW5kZXggXS50YWdOYW1lO1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRUeXBlID0gdGhpcy5saW5lYXJET01bIHNlYXJjaEluZGV4IF0udHlwZTtcclxuICAgICAgICBjb25zdCBlbGVtZW50Um9sZSA9IHRoaXMubGluZWFyRE9NWyBzZWFyY2hJbmRleCBdLmdldEF0dHJpYnV0ZSggJ3JvbGUnICk7XHJcbiAgICAgICAgY29uc3Qgc2VhcmNoUm9sZSA9IHJvbGVzWyBqIF07XHJcbiAgICAgICAgaWYgKCBlbGVtZW50VGFnID09PSBzZWFyY2hSb2xlIHx8IGVsZW1lbnRSb2xlID09PSBzZWFyY2hSb2xlIHx8IGVsZW1lbnRUeXBlID09PSBzZWFyY2hSb2xlICkge1xyXG4gICAgICAgICAgZWxlbWVudCA9IHRoaXMubGluZWFyRE9NWyBzZWFyY2hJbmRleCBdO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICggZWxlbWVudCApIHtcclxuICAgICAgICAvLyB3ZSBoYXZlIGFscmVhZCBmb3VuZCBhbiBlbGVtZW50LCBicmVhayBvdXRcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBzZWFyY2hJbmRleCArPSBzZWFyY2hEZWx0YTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZWxlbWVudDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICByZWFkTmV4dFByZXZpb3VzTGluZSggZGlyZWN0aW9uICkge1xyXG4gICAgbGV0IGxpbmUgPSAnJztcclxuXHJcbiAgICAvLyByZXNldCB0aGUgY29udGVudCBsZXR0ZXIgYW5kIHdvcmQgcG9zaXRpb25zIGJlY2F1c2Ugd2UgYXJlIHJlYWRpbmcgYSBuZXcgbGluZVxyXG4gICAgdGhpcy5sZXR0ZXJQb3NpdGlvbiA9IDA7XHJcbiAgICB0aGlzLndvcmRQb3NpdGlvbiA9IDA7XHJcblxyXG4gICAgLy8gaWYgdGhlcmUgaXMgbm8gYWN0aXZlIGVsZW1lbnQsIHNldCB0byB0aGUgbmV4dCBlbGVtZW50IHdpdGggYWNjZXNzaWJsZSBjb250ZW50XHJcbiAgICBpZiAoICF0aGlzLmFjdGl2ZUVsZW1lbnQgKSB7XHJcbiAgICAgIHRoaXMuYWN0aXZlRWxlbWVudCA9IHRoaXMuZ2V0TmV4dFByZXZpb3VzRWxlbWVudFdpdGhQRE9NQ29udGVudCggZGlyZWN0aW9uICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZ2V0IHRoZSBhY2Nlc3NpYmxlIGNvbnRlbnQgZm9yIHRoZSBhY3RpdmUgZWxlbWVudCwgd2l0aG91dCBhbnkgJ2FwcGxpY2F0aW9uJyBjb250ZW50LCBhbmQgc3BsaXQgaW50byB3b3Jkc1xyXG4gICAgbGV0IGFjY2Vzc2libGVUZXh0ID0gdGhpcy5nZXRBY2Nlc3NpYmxlVGV4dCggdGhpcy5hY3RpdmVFbGVtZW50LCBmYWxzZSApLnNwbGl0KCBTUEFDRSApO1xyXG5cclxuICAgIC8vIGlmIHRyYXZlcnNpbmcgYmFja3dhcmRzLCBwb3NpdGlvbiBpbiBsaW5lIG5lZWRzIGJlIGF0IHRoZSBzdGFydCBvZiBwcmV2aW91cyBsaW5lXHJcbiAgICBpZiAoIGRpcmVjdGlvbiA9PT0gUFJFVklPVVMgKSB7XHJcbiAgICAgIHRoaXMucG9zaXRpb25JbkxpbmUgPSB0aGlzLnBvc2l0aW9uSW5MaW5lIC0gMiAqIExJTkVfV09SRF9MRU5HVEg7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgdGhlcmUgaXMgbm8gY29udGVudCBhdCB0aGUgbGluZSBwb3NpdGlvbiwgaXQgaXMgdGltZSB0byBmaW5kIHRoZSBuZXh0IGVsZW1lbnRcclxuICAgIGlmICggIWFjY2Vzc2libGVUZXh0WyB0aGlzLnBvc2l0aW9uSW5MaW5lIF0gKSB7XHJcbiAgICAgIC8vIHJlc2V0IHRoZSBwb3NpdGlvbiBpbiB0aGUgbGluZVxyXG4gICAgICB0aGlzLnBvc2l0aW9uSW5MaW5lID0gMDtcclxuXHJcbiAgICAgIC8vIHNhdmUgdGhlIGFjdGl2ZSBlbGVtZW50IGluIGNhc2UgaXQgbmVlZHMgdG8gYmUgcmVzdG9yZWRcclxuICAgICAgY29uc3QgcHJldmlvdXNFbGVtZW50ID0gdGhpcy5hY3RpdmVFbGVtZW50O1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHRoZSBhY3RpdmUgZWxlbWVudCBhbmQgc2V0IHRoZSBhY2Nlc3NpYmxlIGNvbnRlbnQgZnJvbSB0aGlzIGVsZW1lbnRcclxuICAgICAgdGhpcy5hY3RpdmVFbGVtZW50ID0gdGhpcy5nZXROZXh0UHJldmlvdXNFbGVtZW50V2l0aFBET01Db250ZW50KCBkaXJlY3Rpb24gKTtcclxuXHJcbiAgICAgIGFjY2Vzc2libGVUZXh0ID0gdGhpcy5nZXRBY2Nlc3NpYmxlVGV4dCggdGhpcy5hY3RpdmVFbGVtZW50LCBmYWxzZSApLnNwbGl0KCAnICcgKTtcclxuXHJcbiAgICAgIC8vIHJlc3RvcmUgdGhlIHByZXZpb3VzIGFjdGl2ZSBlbGVtZW50IGlmIHdlIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBkb2N1bWVudFxyXG4gICAgICBpZiAoICF0aGlzLmFjdGl2ZUVsZW1lbnQgKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVFbGVtZW50ID0gcHJldmlvdXNFbGVtZW50O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVhZCB0aGUgbmV4dCBsaW5lIG9mIHRoZSBhY2Nlc3NpYmxlIGNvbnRlbnRcclxuICAgIGNvbnN0IGxpbmVMaW1pdCA9IHRoaXMucG9zaXRpb25JbkxpbmUgKyBMSU5FX1dPUkRfTEVOR1RIO1xyXG4gICAgZm9yICggbGV0IGkgPSB0aGlzLnBvc2l0aW9uSW5MaW5lOyBpIDwgbGluZUxpbWl0OyBpKysgKSB7XHJcbiAgICAgIGlmICggYWNjZXNzaWJsZVRleHRbIGkgXSApIHtcclxuICAgICAgICBsaW5lICs9IGFjY2Vzc2libGVUZXh0WyBpIF07XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbkluTGluZSArPSAxO1xyXG5cclxuICAgICAgICBpZiAoIGFjY2Vzc2libGVUZXh0WyBpICsgMSBdICkge1xyXG4gICAgICAgICAgbGluZSArPSBTUEFDRTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAvLyB3ZSBoYXZlIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGlzIGNvbnRlbnQsIHRoZXJlIGFyZSBubyBtb3JlIHdvcmRzXHJcbiAgICAgICAgICAvLyB3cmFwIHRoZSBsaW5lIHBvc2l0aW9uIHRvIHRoZSBlbmQgc28gd2UgY2FuIGVhc2lseSByZWFkIGJhY2sgdGhlIHByZXZpb3VzIGxpbmVcclxuICAgICAgICAgIHRoaXMucG9zaXRpb25JbkxpbmUgKz0gTElORV9XT1JEX0xFTkdUSCAtIHRoaXMucG9zaXRpb25JbkxpbmUgJSBMSU5FX1dPUkRfTEVOR1RIO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hY3RpdmVMaW5lID0gbGluZTtcclxuICAgIHJldHVybiBsaW5lO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVhZCB0aGUgYWN0aXZlIGxpbmUgd2l0aG91dCBpbmNyZW1lbnRpbmcgdGhlIHdvcmQgY291bnQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICAgKi9cclxuICByZWFkQWN0aXZlTGluZSgpIHtcclxuXHJcbiAgICBsZXQgbGluZSA9ICcnO1xyXG5cclxuICAgIC8vIGlmIHRoZXJlIGlzIG5vIGFjdGl2ZSBsaW5lLCBmaW5kIHRoZSBuZXh0IG9uZVxyXG4gICAgaWYgKCAhdGhpcy5hY3RpdmVMaW5lICkge1xyXG4gICAgICB0aGlzLmFjdGl2ZUxpbmUgPSB0aGlzLnJlYWROZXh0UHJldmlvdXNMaW5lKCBORVhUICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc3BsaXQgdXAgdGhlIGFjdGl2ZSBsaW5lIGludG8gYW4gYXJyYXkgb2Ygd29yZHNcclxuICAgIGNvbnN0IGFjdGl2ZVdvcmRzID0gdGhpcy5hY3RpdmVMaW5lLnNwbGl0KCBTUEFDRSApO1xyXG5cclxuICAgIC8vIHJlYWQgdGhpcyBsaW5lIG9mIGNvbnRlbnRcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IExJTkVfV09SRF9MRU5HVEg7IGkrKyApIHtcclxuICAgICAgaWYgKCBhY3RpdmVXb3Jkc1sgaSBdICkge1xyXG4gICAgICAgIGxpbmUgKz0gYWN0aXZlV29yZHNbIGkgXTtcclxuXHJcbiAgICAgICAgaWYgKCBhY3RpdmVXb3Jkc1sgaSArIDEgXSApIHtcclxuICAgICAgICAgIC8vIGFkZCBzcGFjZSBpZiB0aGVyZSBhcmUgbW9yZSB3b3Jkc1xyXG4gICAgICAgICAgbGluZSArPSBTUEFDRTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAvLyB3ZSBoYXZlIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGUgbGluZSwgdGhlcmUgYXJlIG5vIG1vcmUgd29yZHNcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBsaW5lO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3Rpb25cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHJlYWROZXh0UHJldmlvdXNXb3JkKCBkaXJlY3Rpb24gKSB7XHJcbiAgICAvLyBpZiB0aGVyZSBpcyBubyBhY3RpdmUgbGluZSwgZmluZCB0aGUgbmV4dCBvbmVcclxuICAgIGlmICggIXRoaXMuYWN0aXZlTGluZSApIHtcclxuICAgICAgdGhpcy5hY3RpdmVMaW5lID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzTGluZSggZGlyZWN0aW9uICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc3BsaXQgdGhlIGFjdGl2ZSBsaW5lIGludG8gYW4gYXJyYXkgb2Ygd29yZHNcclxuICAgIGNvbnN0IGFjdGl2ZVdvcmRzID0gdGhpcy5hY3RpdmVMaW5lLnNwbGl0KCBTUEFDRSApO1xyXG5cclxuICAgIC8vIGRpcmVjdGlvbiBkZXBlbmRlbnQgdmFyaWFibGVzXHJcbiAgICBsZXQgc2VhcmNoRGVsdGE7XHJcbiAgICBsZXQgY29udGVudEVuZDtcclxuICAgIGlmICggZGlyZWN0aW9uID09PSBORVhUICkge1xyXG4gICAgICBjb250ZW50RW5kID0gYWN0aXZlV29yZHMubGVuZ3RoO1xyXG4gICAgICBzZWFyY2hEZWx0YSA9IDE7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggZGlyZWN0aW9uID09PSBQUkVWSU9VUyApIHtcclxuICAgICAgY29udGVudEVuZCA9IDA7XHJcbiAgICAgIHNlYXJjaERlbHRhID0gLTI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgdGhlcmUgaXMgbm8gbW9yZSBjb250ZW50LCByZWFkIHRoZSBuZXh0L3ByZXZpb3VzIGxpbmVcclxuICAgIGlmICggdGhpcy53b3JkUG9zaXRpb24gPT09IGNvbnRlbnRFbmQgKSB7XHJcbiAgICAgIHRoaXMuYWN0aXZlTGluZSA9IHRoaXMucmVhZE5leHRQcmV2aW91c0xpbmUoIGRpcmVjdGlvbiApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGdldCB0aGUgd29yZCB0byByZWFkIHVwZGF0ZSB3b3JkIHBvc2l0aW9uXHJcbiAgICBjb25zdCBvdXRwdXRUZXh0ID0gYWN0aXZlV29yZHNbIHRoaXMud29yZFBvc2l0aW9uIF07XHJcbiAgICB0aGlzLndvcmRQb3NpdGlvbiArPSBzZWFyY2hEZWx0YTtcclxuXHJcbiAgICByZXR1cm4gb3V0cHV0VGV4dDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlYWQgdGhlIG5leHQgb3IgcHJldmlvdXMgaGVhZGluZyB3aXRoIG9uZSBvZiB0aGUgbGV2ZWxzIHNwZWNpZmllZCBpbiBoZWFkaW5nTGV2ZWxzIGFuZCBpbiB0aGUgZGlyZWN0aW9uXHJcbiAgICogc3BlY2lmaWVkIGJ5IHRoZSBkaXJlY3Rpb24gZmxhZy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtICB7QXJyYXkuPHN0cmluZz59IGhlYWRpbmdMZXZlbHNcclxuICAgKiBAcGFyYW0gIHtbdHlwZV19IGRpcmVjdGlvbiAtIGRpcmVjdGlvbiBvZiB0cmF2ZXJzYWwgdGhyb3VnaCB0aGUgRE9NIC0gTkVYVCB8fCBQUkVWSU9VU1xyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgcmVhZE5leHRQcmV2aW91c0hlYWRpbmcoIGhlYWRpbmdMZXZlbHMsIGRpcmVjdGlvbiApIHtcclxuXHJcbiAgICAvLyBnZXQgdGhlIG5leHQgZWxlbWVudCBpbiB0aGUgRE9NIHdpdGggb25lIG9mIHRoZSBhYm92ZSBoZWFkaW5nIGxldmVscyB3aGljaCBoYXMgYWNjZXNzaWJsZSBjb250ZW50XHJcbiAgICAvLyB0byByZWFkXHJcbiAgICBsZXQgYWNjZXNzaWJsZVRleHQ7XHJcbiAgICBsZXQgbmV4dEVsZW1lbnQ7XHJcblxyXG4gICAgLy8gdHJhY2sgdGhlIHByZXZpb3VzIGVsZW1lbnQgLSBpZiB0aGVyZSBhcmUgbm8gbW9yZSBoZWFkaW5ncywgc3RvcmUgaXQgaGVyZVxyXG4gICAgbGV0IHByZXZpb3VzRWxlbWVudDtcclxuXHJcbiAgICB3aGlsZSAoICFhY2Nlc3NpYmxlVGV4dCApIHtcclxuICAgICAgcHJldmlvdXNFbGVtZW50ID0gdGhpcy5hY3RpdmVFbGVtZW50O1xyXG4gICAgICBuZXh0RWxlbWVudCA9IHRoaXMuZ2V0TmV4dFByZXZpb3VzRWxlbWVudFdpdGhSb2xlKCBoZWFkaW5nTGV2ZWxzLCBkaXJlY3Rpb24gKTtcclxuICAgICAgdGhpcy5hY3RpdmVFbGVtZW50ID0gbmV4dEVsZW1lbnQ7XHJcbiAgICAgIGFjY2Vzc2libGVUZXh0ID0gdGhpcy5nZXRBY2Nlc3NpYmxlVGV4dCggbmV4dEVsZW1lbnQgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoICFuZXh0RWxlbWVudCApIHtcclxuICAgICAgLy8gcmVzdG9yZSB0aGUgYWN0aXZlIGVsZW1lbnRcclxuICAgICAgdGhpcy5hY3RpdmVFbGVtZW50ID0gcHJldmlvdXNFbGVtZW50O1xyXG4gICAgICAvLyBsZXQgdGhlIHVzZXIga25vdyB0aGF0IHRoZXJlIGFyZSBubyBtb3JlIGhlYWRpbmdzIGF0IHRoZSBkZXNpcmVkIGxldmVsXHJcbiAgICAgIGNvbnN0IGRpcmVjdGlvbkRlc2NyaXB0aW9uU3RyaW5nID0gKCBkaXJlY3Rpb24gPT09IE5FWFQgKSA/ICdtb3JlJyA6ICdwcmV2aW91cyc7XHJcbiAgICAgIGlmICggaGVhZGluZ0xldmVscy5sZW5ndGggPT09IDEgKSB7XHJcbiAgICAgICAgY29uc3Qgbm9OZXh0SGVhZGluZ1N0cmluZyA9IGBObyAke2RpcmVjdGlvbkRlc2NyaXB0aW9uU3RyaW5nfSBoZWFkaW5ncyBhdCBgO1xyXG5cclxuICAgICAgICBjb25zdCBoZWFkaW5nTGV2ZWwgPSBoZWFkaW5nTGV2ZWxzWyAwIF07XHJcbiAgICAgICAgY29uc3QgbGV2ZWxTdHJpbmcgPSBoZWFkaW5nTGV2ZWwgPT09ICdIMScgPyAnTGV2ZWwgMScgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGluZ0xldmVsID09PSAnSDInID8gJ0xldmVsIDInIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRpbmdMZXZlbCA9PT0gJ0gzJyA/ICdMZXZlbCAzJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkaW5nTGV2ZWwgPT09ICdINCcgPyAnTGV2ZWwgNCcgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGluZ0xldmVsID09PSAnSDUnID8gJ0xldmVsIDUnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdMZXZlbCA2JztcclxuICAgICAgICByZXR1cm4gbm9OZXh0SGVhZGluZ1N0cmluZyArIGxldmVsU3RyaW5nO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBgTm8gJHtkaXJlY3Rpb25EZXNjcmlwdGlvblN0cmluZ30gaGVhZGluZ3NgO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHNldCBlbGVtZW50IGFzIHRoZSBuZXh0IGFjdGl2ZSBlbGVtZW50IGFuZCByZXR1cm4gdGhlIHRleHRcclxuICAgIHRoaXMuYWN0aXZlRWxlbWVudCA9IG5leHRFbGVtZW50O1xyXG4gICAgcmV0dXJuIGFjY2Vzc2libGVUZXh0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVhZCB0aGUgbmV4dC9wcmV2aW91cyBidXR0b24gZWxlbWVudC4gIEEgYnV0dG9uIGNhbiBoYXZlIHRoZSB0YWduYW1lIGJ1dHRvbiwgaGF2ZSB0aGUgYXJpYSBidXR0b24gcm9sZSwgb3JcclxuICAgKiBvciBoYXZlIG9uZSBvZiB0aGUgZm9sbG93aW5nIHR5cGVzOiBzdWJtaXQsIGJ1dHRvbiwgcmVzZXRcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtICB7c3RyaW5nfX0gZGlyZWN0aW9uXHJcbiAgICogQHJldHVybnMge0hUTUxFbGVtZW50fVxyXG4gICAqL1xyXG4gIHJlYWROZXh0UHJldmlvdXNCdXR0b24oIGRpcmVjdGlvbiApIHtcclxuICAgIC8vIHRoZSBmb2xsb3dpbmcgcm9sZXMgc2hvdWxkIGhhbmRsZSAncm9sZT1idXR0b24nLCAndHlwZT1idXR0b24nLCAndGFnTmFtZT1CVVRUT04nXHJcbiAgICBjb25zdCByb2xlcyA9IFsgJ2J1dHRvbicsICdCVVRUT04nLCAnc3VibWl0JywgJ3Jlc2V0JyBdO1xyXG5cclxuICAgIGxldCBuZXh0RWxlbWVudDtcclxuICAgIGxldCBhY2Nlc3NpYmxlVGV4dDtcclxuICAgIGxldCBwcmV2aW91c0VsZW1lbnQ7XHJcblxyXG4gICAgd2hpbGUgKCAhYWNjZXNzaWJsZVRleHQgKSB7XHJcbiAgICAgIHByZXZpb3VzRWxlbWVudCA9IHRoaXMuYWN0aXZlRWxlbWVudDtcclxuICAgICAgbmV4dEVsZW1lbnQgPSB0aGlzLmdldE5leHRQcmV2aW91c0VsZW1lbnRXaXRoUm9sZSggcm9sZXMsIGRpcmVjdGlvbiApO1xyXG4gICAgICB0aGlzLmFjdGl2ZUVsZW1lbnQgPSBuZXh0RWxlbWVudDtcclxuXHJcbiAgICAgIC8vIGdldCB0aGUgYWNjZXNzaWJsZSB0ZXh0IHdpdGggYXBwbGljYXRpb24gZGVzY3JpcHRpb25zXHJcbiAgICAgIGFjY2Vzc2libGVUZXh0ID0gdGhpcy5nZXRBY2Nlc3NpYmxlVGV4dCggbmV4dEVsZW1lbnQsIHRydWUgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoICFuZXh0RWxlbWVudCApIHtcclxuICAgICAgdGhpcy5hY3RpdmVFbGVtZW50ID0gcHJldmlvdXNFbGVtZW50O1xyXG4gICAgICBjb25zdCBkaXJlY3Rpb25EZXNjcmlwdGlvblN0cmluZyA9IGRpcmVjdGlvbiA9PT0gTkVYVCA/ICdtb3JlJyA6ICdwcmV2aW91cyc7XHJcbiAgICAgIHJldHVybiBgTm8gJHtkaXJlY3Rpb25EZXNjcmlwdGlvblN0cmluZ30gYnV0dG9uc2A7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hY3RpdmVFbGVtZW50ID0gbmV4dEVsZW1lbnQ7XHJcbiAgICByZXR1cm4gYWNjZXNzaWJsZVRleHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvblxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgcmVhZE5leHRQcmV2aW91c0Zvcm1FbGVtZW50KCBkaXJlY3Rpb24gKSB7XHJcbiAgICAvLyBUT0RPOiBzdXBwb3J0IG1vcmUgZm9ybSBlbGVtZW50cyFcclxuICAgIGNvbnN0IHRhZ05hbWVzID0gWyAnSU5QVVQnLCAnQlVUVE9OJyBdO1xyXG4gICAgY29uc3QgYXJpYVJvbGVzID0gWyAnYnV0dG9uJyBdO1xyXG4gICAgY29uc3Qgcm9sZXMgPSB0YWdOYW1lcy5jb25jYXQoIGFyaWFSb2xlcyApO1xyXG5cclxuICAgIGxldCBuZXh0RWxlbWVudDtcclxuICAgIGxldCBhY2Nlc3NpYmxlVGV4dDtcclxuXHJcbiAgICAvLyB0cmFjayB0aGUgcHJldmlvdXMgZWxlbWVudCAtIGlmIHRoZXJlIGFyZSBubyBtb3JlIGZvcm0gZWxlbWVudHMgaXQgd2lsbCBuZWVkIHRvIGJlIHJlc3RvcmVkXHJcbiAgICBsZXQgcHJldmlvdXNFbGVtZW50O1xyXG5cclxuICAgIHdoaWxlICggIWFjY2Vzc2libGVUZXh0ICkge1xyXG4gICAgICBwcmV2aW91c0VsZW1lbnQgPSB0aGlzLmFjdGl2ZUVsZW1lbnQ7XHJcbiAgICAgIG5leHRFbGVtZW50ID0gdGhpcy5nZXROZXh0UHJldmlvdXNFbGVtZW50V2l0aFJvbGUoIHJvbGVzLCBkaXJlY3Rpb24gKTtcclxuICAgICAgdGhpcy5hY3RpdmVFbGVtZW50ID0gbmV4dEVsZW1lbnQ7XHJcblxyXG4gICAgICAvLyBnZXQgdGhlIGFjY2Vzc2libGUgdGV4dCB3aXRoIGFyaWEgZGVzY3JpcHRpb25zXHJcbiAgICAgIGFjY2Vzc2libGVUZXh0ID0gdGhpcy5nZXRBY2Nlc3NpYmxlVGV4dCggbmV4dEVsZW1lbnQsIHRydWUgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGFjY2Vzc2libGVUZXh0ID09PSBFTkRfT0ZfRE9DVU1FTlQgKSB7XHJcbiAgICAgIHRoaXMuYWN0aXZlRWxlbWVudCA9IHByZXZpb3VzRWxlbWVudDtcclxuICAgICAgY29uc3QgZGlyZWN0aW9uRGVzY3JpcHRpb25TdHJpbmcgPSBkaXJlY3Rpb24gPT09IE5FWFQgPyAnbmV4dCcgOiAncHJldmlvdXMnO1xyXG4gICAgICByZXR1cm4gYE5vICR7ZGlyZWN0aW9uRGVzY3JpcHRpb25TdHJpbmd9IGZvcm0gZmllbGRgO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYWN0aXZlRWxlbWVudCA9IG5leHRFbGVtZW50O1xyXG4gICAgcmV0dXJuIGFjY2Vzc2libGVUZXh0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3Rpb25cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHJlYWROZXh0UHJldmlvdXNMaXN0SXRlbSggZGlyZWN0aW9uICkge1xyXG4gICAgaWYgKCAhdGhpcy5hY3RpdmVFbGVtZW50ICkge1xyXG4gICAgICB0aGlzLmFjdGl2ZUVsZW1lbnQgPSB0aGlzLmdldE5leHRQcmV2aW91c0VsZW1lbnRXaXRoUERPTUNvbnRlbnQoIGRpcmVjdGlvbiApO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBhY2Nlc3NpYmxlVGV4dDtcclxuXHJcbiAgICAvLyBpZiB3ZSBhcmUgaW5zaWRlIG9mIGEgbGlzdCwgZ2V0IHRoZSBuZXh0IHBlZXIsIG9yIGZpbmQgdGhlIG5leHQgbGlzdFxyXG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IHRoaXMuYWN0aXZlRWxlbWVudC5wYXJlbnRFbGVtZW50O1xyXG4gICAgaWYgKCBwYXJlbnRFbGVtZW50LnRhZ05hbWUgPT09ICdVTCcgfHwgcGFyZW50RWxlbWVudC50YWdOYW1lID09PSAnT0wnICkge1xyXG5cclxuICAgICAgY29uc3Qgc2VhcmNoRGVsdGEgPSBkaXJlY3Rpb24gPT09IE5FWFQgPyAxIDogLTE7XHJcblxyXG4gICAgICAvLyBBcnJheS5wcm90b3R5cGUgbXVzdCBiZSB1c2VkIG9uIHRoZSBOb2RlTGlzdFxyXG4gICAgICBsZXQgc2VhcmNoSW5kZXggPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKCBwYXJlbnRFbGVtZW50LmNoaWxkcmVuLCB0aGlzLmFjdGl2ZUVsZW1lbnQgKSArIHNlYXJjaERlbHRhO1xyXG5cclxuICAgICAgd2hpbGUgKCBwYXJlbnRFbGVtZW50LmNoaWxkcmVuWyBzZWFyY2hJbmRleCBdICkge1xyXG4gICAgICAgIGFjY2Vzc2libGVUZXh0ID0gdGhpcy5nZXRBY2Nlc3NpYmxlVGV4dCggcGFyZW50RWxlbWVudC5jaGlsZHJlblsgc2VhcmNoSW5kZXggXSApO1xyXG4gICAgICAgIGlmICggYWNjZXNzaWJsZVRleHQgKSB7XHJcbiAgICAgICAgICB0aGlzLmFjdGl2ZUVsZW1lbnQgPSBwYXJlbnRFbGVtZW50LmNoaWxkcmVuWyBzZWFyY2hJbmRleCBdO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNlYXJjaEluZGV4ICs9IHNlYXJjaERlbHRhO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoICFhY2Nlc3NpYmxlVGV4dCApIHtcclxuICAgICAgICAvLyB0aGVyZSB3YXMgbm8gYWNjZXNzaWJsZSB0ZXh0IGluIHRoZSBsaXN0IGl0ZW1zLCBzbyByZWFkIHRoZSBuZXh0IC8gcHJldmlvdXMgbGlzdFxyXG4gICAgICAgIGFjY2Vzc2libGVUZXh0ID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzTGlzdCggZGlyZWN0aW9uICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBub3QgaW5zaWRlIG9mIGEgbGlzdCwgc28gcmVhZCB0aGUgbmV4dC9wcmV2aW91cyBvbmUgYW5kIGl0cyBmaXJzdCBpdGVtXHJcbiAgICAgIGFjY2Vzc2libGVUZXh0ID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzTGlzdCggZGlyZWN0aW9uICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCAhYWNjZXNzaWJsZVRleHQgKSB7XHJcbiAgICAgIGNvbnN0IGRpcmVjdGlvbkRlc2NyaXB0aW9uU3RyaW5nID0gKCBkaXJlY3Rpb24gPT09IE5FWFQgKSA/ICdtb3JlJyA6ICdwcmV2aW91cyc7XHJcbiAgICAgIHJldHVybiBgTm8gJHtkaXJlY3Rpb25EZXNjcmlwdGlvblN0cmluZ30gbGlzdCBpdGVtc2A7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFjY2Vzc2libGVUZXh0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3Rpb25cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHJlYWROZXh0UHJldmlvdXNMaXN0KCBkaXJlY3Rpb24gKSB7XHJcbiAgICBpZiAoICF0aGlzLmFjdGl2ZUVsZW1lbnQgKSB7XHJcbiAgICAgIHRoaXMuYWN0aXZlRWxlbWVudCA9IHRoaXMuZ2V0TmV4dFByZXZpb3VzRWxlbWVudFdpdGhQRE9NQ29udGVudCggZGlyZWN0aW9uICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgd2UgYXJlIGluc2lkZSBvZiBhIGxpc3QgYWxyZWFkeSwgc3RlcCBvdXQgb2YgaXQgdG8gYmVnaW4gc2VhcmNoaW5nIHRoZXJlXHJcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gdGhpcy5hY3RpdmVFbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICBsZXQgYWN0aXZlRWxlbWVudDtcclxuICAgIGlmICggcGFyZW50RWxlbWVudC50YWdOYW1lID09PSAnVUwnIHx8IHBhcmVudEVsZW1lbnQudGFnTmFtZSA9PT0gJ09MJyApIHtcclxuICAgICAgLy8gc2F2ZSB0aGUgcHJldmlvdXMgYWN0aXZlIGVsZW1lbnQgLSBpZiB0aGVyZSBhcmUgbm8gbW9yZSBsaXN0cywgdGhpcyBzaG91bGQgbm90IGNoYW5nZVxyXG4gICAgICBhY3RpdmVFbGVtZW50ID0gdGhpcy5hY3RpdmVFbGVtZW50O1xyXG5cclxuICAgICAgdGhpcy5hY3RpdmVFbGVtZW50ID0gcGFyZW50RWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsaXN0RWxlbWVudCA9IHRoaXMuZ2V0TmV4dFByZXZpb3VzRWxlbWVudFdpdGhSb2xlKCBbICdVTCcsICdPTCcgXSwgZGlyZWN0aW9uICk7XHJcblxyXG4gICAgaWYgKCAhbGlzdEVsZW1lbnQgKSB7XHJcblxyXG4gICAgICAvLyByZXN0b3JlIHRoZSBwcmV2aW91cyBhY3RpdmUgZWxlbWVudFxyXG4gICAgICBpZiAoIGFjdGl2ZUVsZW1lbnQgKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVFbGVtZW50ID0gYWN0aXZlRWxlbWVudDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gbGV0IHRoZSB1c2VyIGtub3cgdGhhdCB0aGVyZSBhcmUgbm8gbW9yZSBsaXN0cyBhbmQgbW92ZSB0byB0aGUgbmV4dCBlbGVtZW50XHJcbiAgICAgIGNvbnN0IGRpcmVjdGlvbkRlc2NyaXB0aW9uU3RyaW5nID0gZGlyZWN0aW9uID09PSBORVhUID8gJ21vcmUnIDogJ3ByZXZpb3VzJztcclxuICAgICAgcmV0dXJuIGBObyAke2RpcmVjdGlvbkRlc2NyaXB0aW9uU3RyaW5nfSBsaXN0c2A7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZ2V0IHRoZSBjb250ZW50IGZyb20gdGhlIGxpc3QgZWxlbWVudFxyXG4gICAgY29uc3QgbGlzdFRleHQgPSB0aGlzLmdldEFjY2Vzc2libGVUZXh0KCBsaXN0RWxlbWVudCApO1xyXG5cclxuICAgIC8vIGluY2x1ZGUgdGhlIGNvbnRlbnQgZnJvbSB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgbGlzdFxyXG4gICAgbGV0IGl0ZW1UZXh0ID0gJyc7XHJcbiAgICBjb25zdCBmaXJzdEl0ZW0gPSBsaXN0RWxlbWVudC5jaGlsZHJlblsgMCBdO1xyXG4gICAgaWYgKCBmaXJzdEl0ZW0gKSB7XHJcbiAgICAgIGl0ZW1UZXh0ID0gdGhpcy5nZXRBY2Nlc3NpYmxlVGV4dCggZmlyc3RJdGVtICk7XHJcbiAgICAgIHRoaXMuYWN0aXZlRWxlbWVudCA9IGZpcnN0SXRlbTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYCR7bGlzdFRleHR9LCAke2l0ZW1UZXh0fWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvblxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgcmVhZE5leHRQcmV2aW91c0NoYXJhY3RlciggZGlyZWN0aW9uICkge1xyXG4gICAgLy8gaWYgdGhlcmUgaXMgbm8gYWN0aXZlIGxpbmUsIGZpbmQgdGhlIG5leHQgb25lXHJcbiAgICBpZiAoICF0aGlzLmFjdGl2ZUxpbmUgKSB7XHJcbiAgICAgIHRoaXMuYWN0aXZlTGluZSA9IHRoaXMucmVhZE5leHRQcmV2aW91c0xpbmUoIE5FWFQgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkaXJlY3Rpb25hbCBkZXBlbmRlbnQgdmFyaWFibGVzXHJcbiAgICBsZXQgY29udGVudEVuZDtcclxuICAgIGxldCBzZWFyY2hEZWx0YTtcclxuICAgIGxldCBub3JtYWxpemVEaXJlY3Rpb247XHJcbiAgICBpZiAoIGRpcmVjdGlvbiA9PT0gTkVYVCApIHtcclxuICAgICAgY29udGVudEVuZCA9IHRoaXMuYWN0aXZlTGluZS5sZW5ndGg7XHJcbiAgICAgIHNlYXJjaERlbHRhID0gMTtcclxuICAgICAgbm9ybWFsaXplRGlyZWN0aW9uID0gMDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBkaXJlY3Rpb24gPT09IFBSRVZJT1VTICkge1xyXG4gICAgICAvLyBmb3IgYmFja3dhcmRzIHRyYXZlcnNhbCwgcmVhZCBmcm9tIHR3byBjaGFyYWN0ZXJzIGJlaGluZFxyXG4gICAgICBjb250ZW50RW5kID0gMjtcclxuICAgICAgc2VhcmNoRGVsdGEgPSAtMTtcclxuICAgICAgbm9ybWFsaXplRGlyZWN0aW9uID0gLTI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgd2UgYXJlIGF0IHRoZSBlbmQgb2YgdGhlIGNvbnRlbnQsIHJlYWQgdGhlIG5leHQvcHJldmlvdXMgbGluZVxyXG4gICAgaWYgKCB0aGlzLmxldHRlclBvc2l0aW9uID09PSBjb250ZW50RW5kICkge1xyXG4gICAgICB0aGlzLmFjdGl2ZUxpbmUgPSB0aGlzLnJlYWROZXh0UHJldmlvdXNMaW5lKCBkaXJlY3Rpb24gKTtcclxuXHJcbiAgICAgIC8vIGlmIHJlYWRpbmcgYmFja3dhcmRzLCBsZXR0ZXIgcG9zaXRpb24gc2hvdWxkIGJlIGF0IHRoZSBlbmQgb2YgdGhlIGFjdGl2ZSBsaW5lXHJcbiAgICAgIHRoaXMubGV0dGVyUG9zaXRpb24gPSB0aGlzLmFjdGl2ZUxpbmUubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGdldCB0aGUgbGV0dGVyIHRvIHJlYWQgYW5kIGluY3JlbWVudCB0aGUgbGV0dGVyIHBvc2l0aW9uXHJcbiAgICBjb25zdCBvdXRwdXRUZXh0ID0gdGhpcy5hY3RpdmVMaW5lWyB0aGlzLmxldHRlclBvc2l0aW9uICsgbm9ybWFsaXplRGlyZWN0aW9uIF07XHJcbiAgICB0aGlzLmxldHRlclBvc2l0aW9uICs9IHNlYXJjaERlbHRhO1xyXG5cclxuICAgIHJldHVybiBvdXRwdXRUZXh0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBsaXN0IG9mIGVsZW1lbnRzLCBhbmQgYWRkIE11dGF0aW9uIE9ic2VydmVycyB0byBlYWNoIG9uZS4gIE11dGF0aW9uT2JzZXJ2ZXJzXHJcbiAgICogcHJvdmlkZSBhIHdheSB0byBsaXN0ZW4gdG8gY2hhbmdlcyBpbiB0aGUgRE9NLFxyXG4gICAqIHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTXV0YXRpb25PYnNlcnZlclxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlTGl2ZUVsZW1lbnRMaXN0KCkge1xyXG5cclxuICAgIC8vIHJlbW92ZSBhbGwgcHJldmlvdXMgb2JzZXJ2ZXJzXHJcbiAgICAvLyBUT0RPOiBvbmx5IHVwZGF0ZSB0aGUgb2JzZXJ2ZXIgbGlzdCBpZiBuZWNlc3NhcnlcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMub2JzZXJ2ZXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIHRoaXMub2JzZXJ2ZXJzWyBpIF0gKSB7XHJcbiAgICAgICAgdGhpcy5vYnNlcnZlcnNbIGkgXS5kaXNjb25uZWN0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBjbGVhciB0aGUgbGlzdCBvZiBvYnNlcnZlcnNcclxuICAgIHRoaXMub2JzZXJ2ZXJzID0gW107XHJcblxyXG4gICAgLy8gc2VhcmNoIHRocm91Z2ggdGhlIERPTSwgbG9va2luZyBmb3IgZWxlbWVudHMgd2l0aCBhICdsaXZlIHJlZ2lvbicgYXR0cmlidXRlXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxpbmVhckRPTS5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgZG9tRWxlbWVudCA9IHRoaXMubGluZWFyRE9NWyBpIF07XHJcbiAgICAgIGNvbnN0IGxpdmVSb2xlID0gdGhpcy5nZXRMaXZlUm9sZSggZG9tRWxlbWVudCApO1xyXG5cclxuICAgICAgaWYgKCBsaXZlUm9sZSApIHtcclxuICAgICAgICBjb25zdCBtdXRhdGlvbk9ic2VydmVyQ2FsbGJhY2sgPSBtdXRhdGlvbnMgPT4ge1xyXG4gICAgICAgICAgbXV0YXRpb25zLmZvckVhY2goIG11dGF0aW9uID0+IHtcclxuICAgICAgICAgICAgbGV0IGxpdmVSb2xlO1xyXG4gICAgICAgICAgICBsZXQgbXV0YXRlZEVsZW1lbnQgPSBtdXRhdGlvbi50YXJnZXQ7XHJcblxyXG4gICAgICAgICAgICAvLyBsb29rIGZvciB0aGUgdHlwZSBvZiBsaXZlIHJvbGUgdGhhdCBpcyBhc3NvY2lhdGVkIHdpdGggdGhpcyBtdXRhdGlvblxyXG4gICAgICAgICAgICAvLyBpZiB0aGUgdGFyZ2V0IGhhcyBubyBsaXZlIGF0dHJpYnV0ZSwgc2VhcmNoIHRocm91Z2ggdGhlIGVsZW1lbnQncyBhbmNlc3RvcnMgdG8gZmluZCB0aGUgYXR0cmlidXRlXHJcbiAgICAgICAgICAgIHdoaWxlICggIWxpdmVSb2xlICkge1xyXG4gICAgICAgICAgICAgIGxpdmVSb2xlID0gdGhpcy5nZXRMaXZlUm9sZSggbXV0YXRlZEVsZW1lbnQgKTtcclxuICAgICAgICAgICAgICBtdXRhdGVkRWxlbWVudCA9IG11dGF0ZWRFbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHdlIG9ubHkgY2FyZSBhYm91dCBub2RlcyBhZGRlZFxyXG4gICAgICAgICAgICBpZiAoIG11dGF0aW9uLmFkZGVkTm9kZXNbIDAgXSApIHtcclxuICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkVGV4dCA9IG11dGF0aW9uLmFkZGVkTm9kZXNbIDAgXS5kYXRhO1xyXG4gICAgICAgICAgICAgIHRoaXMub3V0cHV0VXR0ZXJhbmNlUHJvcGVydHkuc2V0KCBuZXcgVXR0ZXJhbmNlKCB1cGRhdGVkVGV4dCwgbGl2ZVJvbGUgKSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gY3JlYXRlIGEgbXV0YXRpb24gb2JzZXJ2ZXIgZm9yIHRoaXMgbGl2ZSBlbGVtZW50XHJcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlciggbXV0YXRpb25zID0+IHtcclxuICAgICAgICAgIG11dGF0aW9uT2JzZXJ2ZXJDYWxsYmFjayggbXV0YXRpb25zICk7XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAvLyBsaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIHN1YnRyZWUgaW4gY2FzZSBjaGlsZHJlbiBvZiB0aGUgYXJpYS1saXZlIHBhcmVudCBjaGFuZ2UgdGhlaXIgdGV4dENvbnRlbnRcclxuICAgICAgICBjb25zdCBvYnNlcnZlckNvbmZpZyA9IHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH07XHJcblxyXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoIGRvbUVsZW1lbnQsIG9ic2VydmVyQ29uZmlnICk7XHJcbiAgICAgICAgdGhpcy5vYnNlcnZlcnMucHVzaCggb2JzZXJ2ZXIgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVhZCBjb250aW51b3VzbHkgZnJvbSB0aGUgY3VycmVudCBhY3RpdmUgZWxlbWVudC4gIEFjY2Vzc2libGUgY29udGVudCBpcyByZWFkIGJ5IHJlYWRlciB3aXRoIGEgJ3BvbGl0ZSdcclxuICAgKiB1dHRlcmFuY2Ugc28gdGhhdCBuZXcgdGV4dCBpcyBhZGRlZCB0byB0aGUgcXVldWUgbGluZSBieSBsaW5lLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBUT0RPOiBJZiB0aGUgcmVhZCBpcyBjYW5jZWxsZWQsIHRoZSBhY3RpdmUgZWxlbWVudCBzaG91bGQgYmUgc2V0IGFwcHJvcHJpYXRlbHkuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHJlYWRFbnRpcmVEb2N1bWVudCgpIHtcclxuXHJcbiAgICBjb25zdCBsaXZlUm9sZSA9ICdwb2xpdGUnO1xyXG4gICAgbGV0IG91dHB1dFRleHQgPSB0aGlzLmdldEFjY2Vzc2libGVUZXh0KCB0aGlzLmFjdGl2ZUVsZW1lbnQgKTtcclxuICAgIGxldCBhY3RpdmVFbGVtZW50ID0gdGhpcy5hY3RpdmVFbGVtZW50O1xyXG5cclxuICAgIHdoaWxlICggb3V0cHV0VGV4dCAhPT0gRU5EX09GX0RPQ1VNRU5UICkge1xyXG4gICAgICBhY3RpdmVFbGVtZW50ID0gdGhpcy5hY3RpdmVFbGVtZW50O1xyXG4gICAgICBvdXRwdXRUZXh0ID0gdGhpcy5yZWFkTmV4dFByZXZpb3VzTGluZSggTkVYVCApO1xyXG5cclxuICAgICAgaWYgKCBvdXRwdXRUZXh0ID09PSBFTkRfT0ZfRE9DVU1FTlQgKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVFbGVtZW50ID0gYWN0aXZlRWxlbWVudDtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm91dHB1dFV0dGVyYW5jZVByb3BlcnR5LnNldCggbmV3IFV0dGVyYW5jZSggb3V0cHV0VGV4dCwgbGl2ZVJvbGUgKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIGVsZW1lbnQgaXMgZm9jdXNhYmxlLiAgQSBmb2N1c2FibGUgZWxlbWVudCBoYXMgYSB0YWIgaW5kZXgsIGlzIGFcclxuICAgKiBmb3JtIGVsZW1lbnQsIG9yIGhhcyBhIHJvbGUgd2hpY2ggYWRkcyBpdCB0byB0aGUgbmF2aWdhdGlvbiBvcmRlci5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogVE9ETzogUG9wdWxhdGUgd2l0aCB0aGUgcmVzdCBvZiB0aGUgZm9jdXNhYmxlIGVsZW1lbnRzLlxyXG4gICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBkb21FbGVtZW50XHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNGb2N1c2FibGUoIGRvbUVsZW1lbnQgKSB7XHJcbiAgICAvLyBsaXN0IG9mIGF0dHJpYnV0ZXMgYW5kIHRhZyBuYW1lcyB3aGljaCBzaG91bGQgYmUgaW4gdGhlIG5hdmlnYXRpb24gb3JkZXJcclxuICAgIC8vIFRPRE86IG1vcmUgcm9sZXMhXHJcbiAgICBjb25zdCBmb2N1c2FibGVSb2xlcyA9IFsgJ3RhYmluZGV4JywgJ0JVVFRPTicsICdJTlBVVCcgXTtcclxuXHJcbiAgICBsZXQgZm9jdXNhYmxlID0gZmFsc2U7XHJcbiAgICBmb2N1c2FibGVSb2xlcy5mb3JFYWNoKCByb2xlID0+IHtcclxuXHJcbiAgICAgIGlmICggZG9tRWxlbWVudC5nZXRBdHRyaWJ1dGUoIHJvbGUgKSApIHtcclxuICAgICAgICBmb2N1c2FibGUgPSB0cnVlO1xyXG5cclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggZG9tRWxlbWVudC50YWdOYW1lID09PSByb2xlICkge1xyXG4gICAgICAgIGZvY3VzYWJsZSA9IHRydWU7XHJcblxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gZm9jdXNhYmxlO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0N1cnNvcicsIEN1cnNvciApO1xyXG5cclxuY2xhc3MgVXR0ZXJhbmNlIHtcclxuICAvKipcclxuICAgKiBDcmVhdGUgYW4gZXhwZXJpbWVudGFsIHR5cGUgdG8gY3JlYXRlIHVuaXF1ZSB1dHRlcmFuY2VzIGZvciB0aGUgcmVhZGVyLlxyXG4gICAqIFR5cGUgaXMgc2ltcGx5IGEgY29sbGVjdGlvbiBvZiB0ZXh0IGFuZCBhIHByaW9yaXR5IGZvciBhcmlhLWxpdmUgdGhhdFxyXG4gICAqIGxldHMgdGhlIHJlYWRlciBrbm93IHdoZXRoZXIgdG8gcXVldWUgdGhlIG5leHQgdXR0ZXJhbmNlIG9yIGNhbmNlbCBpdCBpbiB0aGUgb3JkZXIuXHJcbiAgICpcclxuICAgKiBUT0RPOiBUaGlzIGlzIHdoZXJlIHdlIGNvdWxkIGRldmlhdGUgZnJvbSB0cmFkaXRpb25hbCBzY3JlZW4gcmVhZGVyIGJlaGF2aW9yLiBGb3IgaW5zdGFuY2UsIGluc3RlYWQgb2ZcclxuICAgKiBqdXN0IGxpdmVSb2xlLCBwZXJoYXBzIHdlIHNob3VsZCBoYXZlIGEgbGl2ZUluZGV4IHRoYXQgc3BlY2lmaWVzIG9yZGVyIG9mIHRoZSBsaXZlIHVwZGF0ZT8gV2UgbWF5IGFsc29cclxuICAgKiBuZWVkIGFkZGl0aW9uYWwgZmxhZ3MgaGVyZSBmb3IgdGhlIHJlYWRlci5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gdGhlIHRleHQgdG8gYmUgcmVhZCBhcyB0aGUgdXR0ZXJhbmNlIGZvciB0aGUgc3ludGhcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gbGl2ZVJvbGUgLSBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQWNjZXNzaWJpbGl0eS9BUklBL0FSSUFfTGl2ZV9SZWdpb25zXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRleHQsIGxpdmVSb2xlICkge1xyXG5cclxuICAgIHRoaXMudGV4dCA9IHRleHQ7XHJcbiAgICB0aGlzLmxpdmVSb2xlID0gbGl2ZVJvbGU7XHJcblxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ3Vyc29yOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELFNBQVNDLE9BQU8sUUFBUSxrQkFBa0I7O0FBRTFDO0FBQ0EsTUFBTUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLE1BQU1DLGVBQWUsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzNDLE1BQU1DLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNuQixNQUFNQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUM3QixNQUFNQyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFDckIsTUFBTUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxDQUFDOztBQUU3QixNQUFNQyxNQUFNLENBQUM7RUFDWDtBQUNGO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsVUFBVSxFQUFHO0lBRXhCLE1BQU1DLElBQUksR0FBRyxJQUFJOztJQUVqQjtJQUNBO0lBQ0E7SUFDQSxJQUFJLENBQUNDLHVCQUF1QixHQUFHLElBQUlaLFFBQVEsQ0FBRSxJQUFJYSxTQUFTLENBQUVDLFFBQVEsQ0FBQ0MsS0FBSyxFQUFFLEtBQU0sQ0FBRSxDQUFDOztJQUVyRjtJQUNBLElBQUksQ0FBQ0MsU0FBUyxHQUFHLElBQUksQ0FBQ0Msb0JBQW9CLENBQUVQLFVBQVcsQ0FBQzs7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