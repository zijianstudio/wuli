// Copyright 2017-2023, University of Colorado Boulder

/**
 * ParallelDOM tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Display from '../../display/Display.js';
import Circle from '../../nodes/Circle.js';
import Node from '../../nodes/Node.js';
import Rectangle from '../../nodes/Rectangle.js';
import PDOMFuzzer from './PDOMFuzzer.js';
import PDOMPeer from './PDOMPeer.js';
import PDOMUtils from './PDOMUtils.js';
// constants
const TEST_INNER_CONTENT = 'Test Inner Content Here please^&*. Thanks you so very mucho.';
const TEST_LABEL = 'Test label';
const TEST_LABEL_2 = 'Test label 2';
const TEST_DESCRIPTION = 'Test description';
const TEST_LABEL_HTML = '<strong>I ROCK as a LABEL</strong>';
const TEST_LABEL_HTML_2 = '<strong>I ROCK as a LABEL 2</strong>';
const TEST_DESCRIPTION_HTML = '<strong>I ROCK as a DESCRIPTION</strong>';
const TEST_DESCRIPTION_HTML_2 = '<strong>I ROCK as a DESCRIPTION 2</strong>';
const TEST_CLASS_ONE = 'test-class-one';
const TEST_CLASS_TWO = 'test-class-two';

// These should manually match the defaults in the ParallelDOM.js trait
const DEFAULT_LABEL_TAG_NAME = PDOMUtils.DEFAULT_LABEL_TAG_NAME;
const DEFAULT_DESCRIPTION_TAG_NAME = PDOMUtils.DEFAULT_DESCRIPTION_TAG_NAME;

// given the parent container element for a node, this value is the index of the label sibling in the
// parent's array of children HTMLElements.
const DEFAULT_LABEL_SIBLING_INDEX = 0;
const DEFAULT_DESCRIPTION_SIBLING_INDEX = 1;
const APPENDED_DESCRIPTION_SIBLING_INDEX = 2;

// a focus highlight for testing, since dummy nodes tend to have no bounds
const TEST_HIGHLIGHT = new Circle(5);

// a custom focus highlight (since dummy node's have no bounds)
const focusHighlight = new Rectangle(0, 0, 10, 10);
QUnit.module('ParallelDOMTests');

/**
 * Get a unique PDOMPeer from a node with accessible content. Will error if the node has multiple instances
 * or if the node hasn't been attached to a display (and therefore has no accessible content).
 */
function getPDOMPeerByNode(node) {
  if (node.pdomInstances.length === 0) {
    throw new Error('No pdomInstances. Was your node added to the scene graph?');
  } else if (node.pdomInstances.length > 1) {
    throw new Error('There should one and only one accessible instance for the node');
  } else if (!node.pdomInstances[0].peer) {
    throw new Error('pdomInstance\'s peer should exist.');
  }
  return node.pdomInstances[0].peer;
}

/**
 * Get the id of a dom element representing a node in the DOM.  The accessible content must exist and be unique,
 * there should only be one accessible instance and one dom element for the node.
 *
 * NOTE: Be careful about getting references to dom Elements, the reference will be stale each time
 * the view (PDOMPeer) is redrawn, which is quite often when setting options.
 */
function getPrimarySiblingElementByNode(node) {
  const uniquePeer = getPDOMPeerByNode(node);
  return document.getElementById(uniquePeer.primarySibling.id);
}

/**
 * Audit the root node for accessible content within a test, to make sure that content is accessible as we expect,
 * and so that our pdomAudit function may catch things that have gone wrong.
 * @param rootNode - the root Node attached to the Display being tested
 */
function pdomAuditRootNode(rootNode) {
  rootNode.pdomAudit();
}
QUnit.test('tagName/innerContent options', assert => {
  // test the behavior of swapVisibility function
  const rootNode = new Node({
    tagName: 'div'
  });
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);

  // create some nodes for testing
  const a = new Node({
    tagName: 'button',
    innerContent: TEST_LABEL
  });
  rootNode.addChild(a);
  const aElement = getPrimarySiblingElementByNode(a);
  assert.ok(a.pdomInstances.length === 1, 'only 1 instance');
  assert.ok(aElement.parentElement.childNodes.length === 1, 'parent contains one primary siblings');
  assert.ok(aElement.tagName === 'BUTTON', 'default label tagName');
  assert.ok(aElement.textContent === TEST_LABEL, 'no html should use textContent');
  a.innerContent = TEST_LABEL_HTML;
  assert.ok(aElement.innerHTML === TEST_LABEL_HTML, 'html label should use innerHTML');
  a.innerContent = TEST_LABEL_HTML_2;
  assert.ok(aElement.innerHTML === TEST_LABEL_HTML_2, 'html label should use innerHTML, overwrite from html');
  a.innerContent = null;
  assert.ok(aElement.innerHTML === '', 'innerHTML should be empty after clearing innerContent');
  a.tagName = null;
  assert.ok(a.pdomInstances.length === 0, 'set to null should clear accessible instances');

  // make sure that no errors when setting innerContent with tagName null.
  a.innerContent = 'hello';
  a.tagName = 'button';
  a.innerContent = TEST_LABEL_HTML_2;
  assert.ok(getPrimarySiblingElementByNode(a).innerHTML === TEST_LABEL_HTML_2, 'innerContent not cleared when tagName set to null.');

  // verify that setting inner content on an input is not allowed
  const b = new Node({
    tagName: 'input',
    inputType: 'range'
  });
  rootNode.addChild(b);
  window.assert && assert.throws(() => {
    b.innerContent = 'this should fail';
  }, /.*/, 'cannot set inner content on input');

  // now that it is a div, innerContent is allowed
  b.tagName = 'div';
  assert.ok(b.tagName === 'div', 'expect tagName setter to work.');
  b.innerContent = TEST_LABEL;
  assert.ok(b.innerContent === TEST_LABEL, 'inner content allowed');

  // revert tag name to input, should throw an error
  window.assert && assert.throws(() => {
    b.tagName = 'input';
  }, /.*/, 'error thrown after setting tagName to input on Node with innerContent.');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('containerTagName option', assert => {
  // test the behavior of swapVisibility function
  const rootNode = new Node({
    tagName: 'div'
  });
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);

  // create some nodes for testing
  const a = new Node({
    tagName: 'button'
  });
  rootNode.addChild(a);
  assert.ok(a.pdomInstances.length === 1, 'only 1 instance');
  assert.ok(a.pdomInstances[0].peer.containerParent === null, 'no container parent for just button');
  assert.ok(rootNode['_pdomInstances'][0].peer.primarySibling.children[0] === a['_pdomInstances'][0].peer.primarySibling, 'rootNode peer should hold node a\'s peer in the PDOM');
  a.containerTagName = 'div';
  assert.ok(a.pdomInstances[0].peer.containerParent.id.includes('container'), 'container parent is div if specified');
  assert.ok(rootNode['_pdomInstances'][0].peer.primarySibling.children[0] === a['_pdomInstances'][0].peer.containerParent, 'container parent is div if specified');
  a.containerTagName = null;
  assert.ok(!a.pdomInstances[0].peer.containerParent, 'container parent is cleared if specified');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('labelTagName/labelContent option', assert => {
  // test the behavior of swapVisibility function
  const rootNode = new Node({
    tagName: 'div'
  });
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);

  // create some nodes for testing
  const a = new Node({
    tagName: 'button',
    labelContent: TEST_LABEL
  });
  rootNode.addChild(a);
  const aElement = getPrimarySiblingElementByNode(a);
  const labelSibling = aElement.parentElement.childNodes[0];
  assert.ok(a.pdomInstances.length === 1, 'only 1 instance');
  assert.ok(aElement.parentElement.childNodes.length === 2, 'parent contains two siblings');
  assert.ok(labelSibling.tagName === DEFAULT_LABEL_TAG_NAME, 'default label tagName');
  assert.ok(labelSibling.textContent === TEST_LABEL, 'no html should use textContent');
  a.labelContent = TEST_LABEL_HTML;
  assert.ok(labelSibling.innerHTML === TEST_LABEL_HTML, 'html label should use innerHTML');
  a.labelContent = null;
  assert.ok(labelSibling.innerHTML === '', 'label content should be empty after setting to null');
  a.labelContent = TEST_LABEL_HTML_2;
  assert.ok(labelSibling.innerHTML === TEST_LABEL_HTML_2, 'html label should use innerHTML, overwrite from html');
  a.tagName = 'div';
  const newAElement = getPrimarySiblingElementByNode(a);
  const newLabelSibling = newAElement.parentElement.childNodes[0];
  assert.ok(newLabelSibling.innerHTML === TEST_LABEL_HTML_2, 'tagName independent of: html label should use innerHTML, overwrite from html');
  a.labelTagName = null;

  // make sure label was cleared from PDOM
  assert.ok(getPrimarySiblingElementByNode(a).parentElement.childNodes.length === 1, 'Only one element after clearing label');
  assert.ok(a.labelContent === TEST_LABEL_HTML_2, 'clearing labelTagName should not change content, even  though it is not displayed');
  a.labelTagName = 'p';
  assert.ok(a.labelTagName === 'p', 'expect labelTagName setter to work.');
  const b = new Node({
    tagName: 'p',
    labelContent: 'I am groot'
  });
  rootNode.addChild(b);
  let bLabelElement = document.getElementById(b.pdomInstances[0].peer.labelSibling.id);
  assert.ok(!bLabelElement.getAttribute('for'), 'for attribute should not be on non label label sibling.');
  b.labelTagName = 'label';
  bLabelElement = document.getElementById(b.pdomInstances[0].peer.labelSibling.id);
  assert.ok(bLabelElement.getAttribute('for') !== null, 'for attribute should be on "label" tag for label sibling.');
  const c = new Node({
    tagName: 'p'
  });
  rootNode.addChild(c);
  c.labelTagName = 'label';
  c.labelContent = TEST_LABEL;
  const cLabelElement = document.getElementById(c.pdomInstances[0].peer.labelSibling.id);
  assert.ok(cLabelElement.getAttribute('for') !== null, 'order should not matter');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('container element not needed for multiple siblings', assert => {
  // test the behavior of swapVisibility function
  const rootNode = new Node({
    tagName: 'div'
  });
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);

  // test containerTag is not needed
  const b = new Node({
    tagName: 'div',
    labelContent: 'hello'
  });
  const c = new Node({
    tagName: 'section',
    labelContent: 'hi'
  });
  const d = new Node({
    tagName: 'p',
    innerContent: 'PPPP',
    containerTagName: 'div'
  });
  rootNode.addChild(b);
  b.addChild(c);
  b.addChild(d);
  let bElement = getPrimarySiblingElementByNode(b);
  let cPeer = c.pdomInstances[0].peer;
  let dPeer = d.pdomInstances[0].peer;
  assert.ok(bElement.children.length === 3, 'c.p, c.section, d.div should all be on the same level');
  const confirmOriginalOrder = () => {
    assert.ok(bElement.children[0].tagName === 'P', 'p first');
    assert.ok(bElement.children[1].tagName === 'SECTION', 'section 2nd');
    assert.ok(bElement.children[2].tagName === 'DIV', 'div 3rd');
    assert.ok(bElement.children[0] === cPeer.labelSibling, 'c label first');
    assert.ok(bElement.children[1] === cPeer.primarySibling, 'c primary 2nd');
    assert.ok(bElement.children[2] === dPeer.containerParent, 'd container 3rd');
  };
  confirmOriginalOrder();

  // add a few more
  const e = new Node({
    tagName: 'span',
    descriptionContent: '<br>sweet and cool things</br>'
  });
  b.addChild(e);
  bElement = getPrimarySiblingElementByNode(b); // refresh the DOM Elements
  cPeer = c.pdomInstances[0].peer; // refresh the DOM Elements
  dPeer = d.pdomInstances[0].peer; // refresh the DOM Elements
  let ePeer = e.pdomInstances[0].peer;
  assert.ok(bElement.children.length === 5, 'e children should be added to the same PDOM level.');
  confirmOriginalOrder();
  const confirmOriginalWithE = () => {
    assert.ok(bElement.children[3].tagName === 'P', 'P 4rd');
    assert.ok(bElement.children[4].tagName === 'SPAN', 'SPAN 3rd');
    assert.ok(bElement.children[3] === ePeer.descriptionSibling, 'e description 4th');
    assert.ok(bElement.children[4] === ePeer.primarySibling, 'e primary 5th');
  };

  // dynamically adding parent
  e.containerTagName = 'article';
  bElement = getPrimarySiblingElementByNode(b); // refresh the DOM Elements
  cPeer = c.pdomInstances[0].peer; // refresh the DOM Elements
  dPeer = d.pdomInstances[0].peer; // refresh the DOM Elements
  ePeer = e.pdomInstances[0].peer;
  assert.ok(bElement.children.length === 4, 'e children should now be under e\'s container.');
  confirmOriginalOrder();
  assert.ok(bElement.children[3].tagName === 'ARTICLE', 'SPAN 3rd');
  assert.ok(bElement.children[3] === ePeer.containerParent, 'e parent 3rd');

  // clear container
  e.containerTagName = null;
  bElement = getPrimarySiblingElementByNode(b); // refresh the DOM Elements
  cPeer = c.pdomInstances[0].peer; // refresh the DOM Elements
  dPeer = d.pdomInstances[0].peer; // refresh the DOM Elements
  ePeer = e.pdomInstances[0].peer;
  assert.ok(bElement.children.length === 5, 'e children should be added to the same PDOM level again.');
  confirmOriginalOrder();
  confirmOriginalWithE();

  // proper disposal
  e.dispose();
  bElement = getPrimarySiblingElementByNode(b);
  assert.ok(bElement.children.length === 3, 'e children should have been removed');
  assert.ok(e.pdomInstances.length === 0, 'e is disposed');
  confirmOriginalOrder();

  // reorder d correctly when c removed
  b.removeChild(c);
  assert.ok(bElement.children.length === 1, 'c children should have been removed, only d container');
  bElement = getPrimarySiblingElementByNode(b);
  dPeer = d.pdomInstances[0].peer;
  assert.ok(bElement.children[0].tagName === 'DIV', 'DIV first');
  assert.ok(bElement.children[0] === dPeer.containerParent, 'd container first');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('descriptionTagName/descriptionContent option', assert => {
  // test the behavior of swapVisibility function
  const rootNode = new Node({
    tagName: 'div'
  });
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);

  // create some nodes for testing
  const a = new Node({
    tagName: 'button',
    descriptionContent: TEST_DESCRIPTION
  });
  rootNode.addChild(a);
  const aElement = getPrimarySiblingElementByNode(a);
  const descriptionSibling = aElement.parentElement.childNodes[0];
  assert.ok(a.pdomInstances.length === 1, 'only 1 instance');
  assert.ok(aElement.parentElement.childNodes.length === 2, 'parent contains two siblings');
  assert.ok(descriptionSibling.tagName === DEFAULT_DESCRIPTION_TAG_NAME, 'default label tagName');
  assert.ok(descriptionSibling.textContent === TEST_DESCRIPTION, 'no html should use textContent');
  a.descriptionContent = TEST_DESCRIPTION_HTML;
  assert.ok(descriptionSibling.innerHTML === TEST_DESCRIPTION_HTML, 'html label should use innerHTML');
  a.descriptionContent = null;
  assert.ok(descriptionSibling.innerHTML === '', 'description content should be cleared');
  a.descriptionContent = TEST_DESCRIPTION_HTML_2;
  assert.ok(descriptionSibling.innerHTML === TEST_DESCRIPTION_HTML_2, 'html label should use innerHTML, overwrite from html');
  a.descriptionTagName = null;

  // make sure description was cleared from PDOM
  assert.ok(getPrimarySiblingElementByNode(a).parentElement.childNodes.length === 1, 'Only one element after clearing description');
  assert.ok(a.descriptionContent === TEST_DESCRIPTION_HTML_2, 'clearing descriptionTagName should not change content, even  though it is not displayed');
  assert.ok(a.descriptionTagName === null, 'expect descriptionTagName setter to work.');
  a.descriptionTagName = 'p';
  assert.ok(a.descriptionTagName === 'p', 'expect descriptionTagName setter to work.');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('ParallelDOM options', assert => {
  const rootNode = new Node();
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);

  // test setting of accessible content through options
  const buttonNode = new Node({
    focusHighlight: new Circle(5),
    containerTagName: 'div',
    // contained in parent element 'div'
    tagName: 'input',
    // dom element with tag name 'input'
    inputType: 'button',
    // input type 'button'
    labelTagName: 'label',
    // label with tagname 'label'
    labelContent: TEST_LABEL,
    // label text content
    descriptionContent: TEST_DESCRIPTION,
    // description text content
    focusable: false,
    // remove from focus order
    ariaRole: 'button' // uses the ARIA button role
  });

  rootNode.addChild(buttonNode);
  const divNode = new Node({
    tagName: 'div',
    ariaLabel: TEST_LABEL,
    // use ARIA label attribute
    pdomVisible: false,
    // hidden from screen readers (and browser)
    descriptionContent: TEST_DESCRIPTION,
    // default to a <p> tag
    containerTagName: 'div'
  });
  rootNode.addChild(divNode);

  // verify that setters and getters worked correctly
  assert.ok(buttonNode.labelTagName === 'label', 'Label tag name');
  assert.ok(buttonNode.containerTagName === 'div', 'container tag name');
  assert.ok(buttonNode.labelContent === TEST_LABEL, 'Accessible label');
  assert.ok(buttonNode.descriptionTagName.toUpperCase() === DEFAULT_DESCRIPTION_TAG_NAME, 'Description tag name');
  assert.equal(buttonNode.focusable, false, 'Focusable');
  assert.ok(buttonNode.ariaRole === 'button', 'Aria role');
  assert.ok(buttonNode.descriptionContent === TEST_DESCRIPTION, 'Accessible Description');
  assert.ok(buttonNode.focusHighlight instanceof Circle, 'Focus highlight');
  assert.ok(buttonNode.tagName === 'input', 'Tag name');
  assert.ok(buttonNode.inputType === 'button', 'Input type');
  assert.ok(divNode.tagName === 'div', 'Tag name');
  assert.ok(divNode.ariaLabel === TEST_LABEL, 'Use aria label');
  assert.equal(divNode.pdomVisible, false, 'pdom visible');
  assert.ok(divNode.labelTagName === null, 'Label tag name with aria label is independent');
  assert.ok(divNode.descriptionTagName.toUpperCase() === DEFAULT_DESCRIPTION_TAG_NAME, 'Description tag name');

  // verify DOM structure - options above should create something like:
  // <div id="display-root">
  //  <div id="parent-container-id">
  //    <label for="id">Test Label</label>
  //    <p>Description>Test Description</p>
  //    <input type='button' role='button' tabindex="-1" id=id>
  //  </div>
  //
  //  <div aria-label="Test Label" hidden aria-labelledBy="button-node-id" aria-describedby='button-node-id'>
  //    <p>Test Description</p>
  //  </div>
  // </div>
  pdomAuditRootNode(rootNode);
  let buttonElement = getPrimarySiblingElementByNode(buttonNode);
  const buttonParent = buttonElement.parentNode;
  const buttonPeers = buttonParent.childNodes;
  const buttonLabel = buttonPeers[0];
  const buttonDescription = buttonPeers[1];
  const divElement = getPrimarySiblingElementByNode(divNode);
  const pDescription = divElement.parentElement.childNodes[0]; // description before primary div

  assert.ok(buttonParent.tagName === 'DIV', 'parent container');
  assert.ok(buttonLabel.tagName === 'LABEL', 'Label first');
  assert.ok(buttonLabel.getAttribute('for') === buttonElement.id, 'label for attribute');
  assert.ok(buttonLabel.textContent === TEST_LABEL, 'label content');
  assert.ok(buttonDescription.tagName === DEFAULT_DESCRIPTION_TAG_NAME, 'description second');
  assert.equal(buttonDescription.textContent, TEST_DESCRIPTION, 'description content');
  assert.ok(buttonPeers[2] === buttonElement, 'Button third');
  assert.ok(buttonElement.getAttribute('type') === 'button', 'input type set');
  assert.ok(buttonElement.getAttribute('role') === 'button', 'button role set');
  assert.ok(buttonElement.tabIndex === -1, 'not focusable');
  assert.ok(divElement.getAttribute('aria-label') === TEST_LABEL, 'aria label set');
  assert.ok(divElement.parentElement.hidden, 'hidden set should act on parent');
  assert.ok(pDescription.textContent === TEST_DESCRIPTION, 'description content');
  assert.ok(pDescription.parentElement === divElement.parentElement, 'description is sibling to primary');
  assert.ok(divElement.parentElement.childNodes.length === 2, 'no label element for aria-label, just description and primary siblings');

  // clear values
  buttonNode.inputType = null;
  buttonElement = getPrimarySiblingElementByNode(buttonNode);
  assert.ok(buttonElement.getAttribute('type') === null, 'input type cleared');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});

// tests for aria-labelledby and aria-describedby should be the same, since both support the same feature set
function testAssociationAttribute(assert, attribute) {
  // use a different setter depending on if testing labelledby or describedby
  const addAssociationFunction = attribute === 'aria-labelledby' ? 'addAriaLabelledbyAssociation' : attribute === 'aria-describedby' ? 'addAriaDescribedbyAssociation' : attribute === 'aria-activedescendant' ? 'addActiveDescendantAssociation' : null;
  if (!addAssociationFunction) {
    throw new Error('incorrect attribute name while in testAssociationAttribute');
  }
  const rootNode = new Node();
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);

  // two new nodes that will be related with the aria-labelledby and aria-describedby associations
  const a = new Node({
    tagName: 'button',
    labelTagName: 'p',
    descriptionTagName: 'p'
  });
  const b = new Node({
    tagName: 'p',
    innerContent: TEST_LABEL_2
  });
  rootNode.children = [a, b];
  window.assert && assert.throws(() => {
    a.setPDOMAttribute(attribute, 'hello');
  }, /.*/, 'cannot set association attributes with setPDOMAttribute');
  a[addAssociationFunction]({
    otherNode: b,
    thisElementName: PDOMPeer.PRIMARY_SIBLING,
    otherElementName: PDOMPeer.PRIMARY_SIBLING
  });
  let aElement = getPrimarySiblingElementByNode(a);
  let bElement = getPrimarySiblingElementByNode(b);
  assert.ok(aElement.getAttribute(attribute).includes(bElement.id), `${attribute} for one node.`);
  const c = new Node({
    tagName: 'div',
    innerContent: TEST_LABEL
  });
  rootNode.addChild(c);
  a[addAssociationFunction]({
    otherNode: c,
    thisElementName: PDOMPeer.PRIMARY_SIBLING,
    otherElementName: PDOMPeer.PRIMARY_SIBLING
  });
  aElement = getPrimarySiblingElementByNode(a);
  bElement = getPrimarySiblingElementByNode(b);
  let cElement = getPrimarySiblingElementByNode(c);
  const expectedValue = [bElement.id, cElement.id].join(' ');
  assert.ok(aElement.getAttribute(attribute) === expectedValue, `${attribute} two nodes`);

  // Make c invalidate
  rootNode.removeChild(c);
  rootNode.addChild(new Node({
    children: [c]
  }));
  const oldValue = expectedValue;
  aElement = getPrimarySiblingElementByNode(a);
  cElement = getPrimarySiblingElementByNode(c);
  assert.ok(aElement.getAttribute(attribute) !== oldValue, 'should have invalidated on tree change');
  assert.ok(aElement.getAttribute(attribute) === [bElement.id, cElement.id].join(' '), 'should have invalidated on tree change');
  const d = new Node({
    tagName: 'div',
    descriptionTagName: 'p',
    innerContent: TEST_LABEL,
    containerTagName: 'div'
  });
  rootNode.addChild(d);
  b[addAssociationFunction]({
    otherNode: d,
    thisElementName: PDOMPeer.CONTAINER_PARENT,
    otherElementName: PDOMPeer.DESCRIPTION_SIBLING
  });
  b.containerTagName = 'div';
  const bParentContainer = getPrimarySiblingElementByNode(b).parentElement;
  const dDescriptionElement = getPrimarySiblingElementByNode(d).parentElement.childNodes[0];
  assert.ok(bParentContainer.getAttribute(attribute) !== oldValue, 'should have invalidated on tree change');
  assert.ok(bParentContainer.getAttribute(attribute) === dDescriptionElement.id, `b parent container element is ${attribute} d description sibling`);

  // say we have a scene graph that looks like:
  //    e
  //     \
  //      f
  //       \
  //        g
  //         \
  //          h
  // we want to make sure
  const e = new Node({
    tagName: 'div'
  });
  const f = new Node({
    tagName: 'div'
  });
  const g = new Node({
    tagName: 'div'
  });
  const h = new Node({
    tagName: 'div'
  });
  e.addChild(f);
  f.addChild(g);
  g.addChild(h);
  rootNode.addChild(e);
  e[addAssociationFunction]({
    otherNode: f,
    thisElementName: PDOMPeer.PRIMARY_SIBLING,
    otherElementName: PDOMPeer.PRIMARY_SIBLING
  });
  f[addAssociationFunction]({
    otherNode: g,
    thisElementName: PDOMPeer.PRIMARY_SIBLING,
    otherElementName: PDOMPeer.PRIMARY_SIBLING
  });
  g[addAssociationFunction]({
    otherNode: h,
    thisElementName: PDOMPeer.PRIMARY_SIBLING,
    otherElementName: PDOMPeer.PRIMARY_SIBLING
  });
  let eElement = getPrimarySiblingElementByNode(e);
  let fElement = getPrimarySiblingElementByNode(f);
  let gElement = getPrimarySiblingElementByNode(g);
  let hElement = getPrimarySiblingElementByNode(h);
  assert.ok(eElement.getAttribute(attribute) === fElement.id, `eElement should be ${attribute} fElement`);
  assert.ok(fElement.getAttribute(attribute) === gElement.id, `fElement should be ${attribute} gElement`);
  assert.ok(gElement.getAttribute(attribute) === hElement.id, `gElement should be ${attribute} hElement`);

  // re-arrange the scene graph and make sure that the attribute ids remain up to date
  //    e
  //     \
  //      h
  //       \
  //        g
  //         \
  //          f
  e.removeChild(f);
  f.removeChild(g);
  g.removeChild(h);
  e.addChild(h);
  h.addChild(g);
  g.addChild(f);
  eElement = getPrimarySiblingElementByNode(e);
  fElement = getPrimarySiblingElementByNode(f);
  gElement = getPrimarySiblingElementByNode(g);
  hElement = getPrimarySiblingElementByNode(h);
  assert.ok(eElement.getAttribute(attribute) === fElement.id, `eElement should still be ${attribute} fElement`);
  assert.ok(fElement.getAttribute(attribute) === gElement.id, `fElement should still be ${attribute} gElement`);
  assert.ok(gElement.getAttribute(attribute) === hElement.id, `gElement should still be ${attribute} hElement`);

  // test aria labelled by your self, but a different peer Element, multiple attribute ids included in the test.
  const containerTagName = 'div';
  const j = new Node({
    tagName: 'button',
    labelTagName: 'label',
    descriptionTagName: 'p',
    containerTagName: containerTagName
  });
  rootNode.children = [j];
  j[addAssociationFunction]({
    otherNode: j,
    thisElementName: PDOMPeer.PRIMARY_SIBLING,
    otherElementName: PDOMPeer.LABEL_SIBLING
  });
  j[addAssociationFunction]({
    otherNode: j,
    thisElementName: PDOMPeer.CONTAINER_PARENT,
    otherElementName: PDOMPeer.DESCRIPTION_SIBLING
  });
  j[addAssociationFunction]({
    otherNode: j,
    thisElementName: PDOMPeer.CONTAINER_PARENT,
    otherElementName: PDOMPeer.LABEL_SIBLING
  });
  const checkOnYourOwnAssociations = node => {
    const instance = node['_pdomInstances'][0];
    const nodePrimaryElement = instance.peer.primarySibling;
    const nodeParent = nodePrimaryElement.parentElement;
    const getUniqueIdStringForSibling = siblingString => {
      return instance.peer.getElementId(siblingString, instance.getPDOMInstanceUniqueId());
    };
    assert.ok(nodePrimaryElement.getAttribute(attribute).includes(getUniqueIdStringForSibling('label')), `${attribute} your own label element.`);
    assert.ok(nodeParent.getAttribute(attribute).includes(getUniqueIdStringForSibling('description')), `parent ${attribute} your own description element.`);
    assert.ok(nodeParent.getAttribute(attribute).includes(getUniqueIdStringForSibling('label')), `parent ${attribute} your own label element.`);
  };

  // add k into the mix
  const k = new Node({
    tagName: 'div'
  });
  k[addAssociationFunction]({
    otherNode: j,
    thisElementName: PDOMPeer.PRIMARY_SIBLING,
    otherElementName: PDOMPeer.LABEL_SIBLING
  });
  rootNode.addChild(k);
  const testK = () => {
    const kValue = k['_pdomInstances'][0].peer.primarySibling.getAttribute(attribute);
    const jID = j['_pdomInstances'][0].peer.labelSibling.getAttribute('id');
    assert.ok(jID === kValue, 'k pointing to j');
  };

  // audit the content we have created
  pdomAuditRootNode(rootNode);

  // Check basic associations within single node
  checkOnYourOwnAssociations(j);
  testK();

  // Moving this node around the scene graph should not change it's aria labelled by associations.
  rootNode.addChild(new Node({
    children: [j]
  }));
  checkOnYourOwnAssociations(j);
  testK();

  // check remove child
  rootNode.removeChild(j);
  checkOnYourOwnAssociations(j);
  testK();

  // check dispose
  const jParent = new Node({
    children: [j]
  });
  rootNode.children = [];
  rootNode.addChild(jParent);
  checkOnYourOwnAssociations(j);
  rootNode.addChild(j);
  checkOnYourOwnAssociations(j);
  rootNode.addChild(k);
  checkOnYourOwnAssociations(j);
  testK();
  jParent.dispose();
  checkOnYourOwnAssociations(j);
  testK();

  // check removeChild with dag
  const jParent2 = new Node({
    children: [j]
  });
  rootNode.insertChild(0, jParent2);
  checkOnYourOwnAssociations(j);
  testK();
  rootNode.removeChild(jParent2);
  checkOnYourOwnAssociations(j);
  testK();
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
}
function testAssociationAttributeBySetters(assert, attribute) {
  const rootNode = new Node();
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);
  // use a different setter depending on if testing labelledby or describedby
  const associationsArrayName = attribute === 'aria-labelledby' ? 'ariaLabelledbyAssociations' : attribute === 'aria-describedby' ? 'ariaDescribedbyAssociations' : 'activeDescendantAssociations';
  // use a different setter depending on if testing labelledby or describedby
  const associationRemovalFunction = attribute === 'aria-labelledby' ? 'removeAriaLabelledbyAssociation' : attribute === 'aria-describedby' ? 'removeAriaDescribedbyAssociation' : 'removeActiveDescendantAssociation';
  const options = {
    tagName: 'p',
    labelContent: 'hi',
    descriptionContent: 'hello',
    containerTagName: 'div'
  };
  const n = new Node(options);
  rootNode.addChild(n);
  options[associationsArrayName] = [{
    otherNode: n,
    thisElementName: PDOMPeer.PRIMARY_SIBLING,
    otherElementName: PDOMPeer.LABEL_SIBLING
  }];
  const o = new Node(options);
  rootNode.addChild(o);
  const nPeer = getPDOMPeerByNode(n);
  const oElement = getPrimarySiblingElementByNode(o);
  assert.ok(oElement.getAttribute(attribute).includes(nPeer.getElementId('label', nPeer.pdomInstance.getPDOMInstanceUniqueId())), `${attribute} for two nodes with setter (label).`);

  // make a list of associations to test as a setter
  const randomAssociationObject = {
    otherNode: new Node(),
    thisElementName: PDOMPeer.CONTAINER_PARENT,
    otherElementName: PDOMPeer.LABEL_SIBLING
  };
  options[associationsArrayName] = [{
    otherNode: new Node(),
    thisElementName: PDOMPeer.CONTAINER_PARENT,
    otherElementName: PDOMPeer.DESCRIPTION_SIBLING
  }, randomAssociationObject, {
    otherNode: new Node(),
    thisElementName: PDOMPeer.PRIMARY_SIBLING,
    otherElementName: PDOMPeer.LABEL_SIBLING
  }];

  // test getters and setters
  const m = new Node(options);
  rootNode.addChild(m);
  assert.ok(_.isEqual(m[associationsArrayName], options[associationsArrayName]), 'test association object getter');
  m[associationRemovalFunction](randomAssociationObject);
  options[associationsArrayName].splice(options[associationsArrayName].indexOf(randomAssociationObject), 1);
  assert.ok(_.isEqual(m[associationsArrayName], options[associationsArrayName]), 'test association object getter after removal');
  m[associationsArrayName] = [];
  assert.ok(getPrimarySiblingElementByNode(m).getAttribute(attribute) === null, 'clear with setter');
  m[associationsArrayName] = options[associationsArrayName];
  m.dispose();
  assert.ok(m[associationsArrayName].length === 0, 'cleared when disposed');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
}
QUnit.test('aria-labelledby', assert => {
  testAssociationAttribute(assert, 'aria-labelledby');
  testAssociationAttributeBySetters(assert, 'aria-labelledby');
});
QUnit.test('aria-describedby', assert => {
  testAssociationAttribute(assert, 'aria-describedby');
  testAssociationAttributeBySetters(assert, 'aria-describedby');
});
QUnit.test('aria-activedescendant', assert => {
  testAssociationAttribute(assert, 'aria-activedescendant');
  testAssociationAttributeBySetters(assert, 'aria-activedescendant');
});
QUnit.test('ParallelDOM invalidation', assert => {
  // test invalidation of accessibility (changing content which requires )
  const a1 = new Node();
  const rootNode = new Node();
  a1.tagName = 'button';

  // accessible instances are not sorted until added to a display
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);
  rootNode.addChild(a1);

  // verify that elements are in the DOM
  const a1Element = getPrimarySiblingElementByNode(a1);
  assert.ok(a1Element, 'button in DOM');
  assert.ok(a1Element.tagName === 'BUTTON', 'button tag name set');

  // give the button a container parent and some empty siblings
  a1.labelTagName = 'div';
  a1.descriptionTagName = 'p';
  a1.containerTagName = 'div';
  let buttonElement = a1.pdomInstances[0].peer.primarySibling;
  let parentElement = buttonElement.parentElement;
  const buttonPeers = parentElement.childNodes;

  // now html should look like
  // <div id='parent'>
  //  <div id='label'></div>
  //  <p id='description'></p>
  //  <button></button>
  // </div>
  assert.ok(document.getElementById(parentElement.id), 'container parent in DOM');
  assert.ok(buttonPeers[0].tagName === 'DIV', 'label first');
  assert.ok(buttonPeers[1].tagName === 'P', 'description second');
  assert.ok(buttonPeers[2].tagName === 'BUTTON', 'primarySibling third');

  // make the button a div and use an inline label, and place the description below
  a1.tagName = 'div';
  a1.appendLabel = true;
  a1.appendDescription = true;
  a1.labelTagName = null; // use aria label attribute instead
  a1.ariaLabel = TEST_LABEL;

  // now the html should look like
  // <div id='parent-id'>
  //  <div></div>
  //  <p id='description'></p>
  // </div>

  // redefine the HTML elements (references will point to old elements before mutation)
  buttonElement = a1.pdomInstances[0].peer.primarySibling;
  parentElement = buttonElement.parentElement;
  const newButtonPeers = parentElement.childNodes;
  assert.ok(newButtonPeers[0] === getPrimarySiblingElementByNode(a1), 'div first');
  assert.ok(newButtonPeers[1].id.includes('description'), 'description after div when appending both elements');
  assert.ok(newButtonPeers.length === 2, 'no label peer when using just aria-label attribute');
  const elementInDom = document.getElementById(a1.pdomInstances[0].peer.primarySibling.id);
  assert.ok(elementInDom.getAttribute('aria-label') === TEST_LABEL, 'aria-label set');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('ParallelDOM setters/getters', assert => {
  const a1 = new Node({
    tagName: 'div'
  });
  var display = new Display(a1); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);

  // set/get attributes
  let a1Element = getPrimarySiblingElementByNode(a1);
  const initialLength = a1.getPDOMAttributes().length;
  a1.setPDOMAttribute('role', 'switch');
  assert.ok(a1.getPDOMAttributes().length === initialLength + 1, 'attribute set should only add 1');
  assert.ok(a1.getPDOMAttributes()[a1.getPDOMAttributes().length - 1].attribute === 'role', 'attribute set');
  assert.ok(a1Element.getAttribute('role') === 'switch', 'HTML attribute set');
  assert.ok(a1.hasPDOMAttribute('role'), 'should have pdom attribute');
  a1.removePDOMAttribute('role');
  assert.ok(!a1.hasPDOMAttribute('role'), 'should not have pdom attribute');
  assert.ok(!a1Element.getAttribute('role'), 'attribute removed');
  const b = new Node({
    focusable: true
  });
  a1.addChild(b);
  b.tagName = 'div';
  assert.ok(getPrimarySiblingElementByNode(b).tabIndex >= 0, 'set tagName after focusable');

  // test setting attribute as DOM property, should NOT have attribute value pair (DOM uses empty string for empty)
  a1.setPDOMAttribute('hidden', true, {
    asProperty: true
  });
  a1Element = getPrimarySiblingElementByNode(a1);
  assert.equal(a1Element.hidden, true, 'hidden set as Property');
  assert.ok(a1Element.getAttribute('hidden') === '', 'hidden should not be set as attribute');

  // test setting and removing PDOM classes
  a1.setPDOMClass(TEST_CLASS_ONE);
  assert.ok(getPrimarySiblingElementByNode(a1).classList.contains(TEST_CLASS_ONE), 'TEST_CLASS_ONE missing from classList');

  // two classes
  a1.setPDOMClass(TEST_CLASS_TWO);
  a1Element = getPrimarySiblingElementByNode(a1);
  assert.ok(a1Element.classList.contains(TEST_CLASS_ONE) && a1Element.classList.contains(TEST_CLASS_ONE), 'One of the classes missing from classList');

  // modify the Node in a way that would cause a full redraw, make sure classes still exist
  a1.tagName = 'button';
  a1Element = getPrimarySiblingElementByNode(a1);
  assert.ok(a1Element.classList.contains(TEST_CLASS_ONE) && a1Element.classList.contains(TEST_CLASS_ONE), 'One of the classes missing from classList after changing tagName');

  // remove them one at a time
  a1.removePDOMClass(TEST_CLASS_ONE);
  a1Element = getPrimarySiblingElementByNode(a1);
  assert.ok(!a1Element.classList.contains(TEST_CLASS_ONE), 'TEST_CLASS_ONE should be removed from classList');
  assert.ok(a1Element.classList.contains(TEST_CLASS_TWO), 'TEST_CLASS_TWO should still be in classList');
  a1.removePDOMClass(TEST_CLASS_TWO);
  a1Element = getPrimarySiblingElementByNode(a1);
  assert.ok(!a1Element.classList.contains(TEST_CLASS_ONE) && !a1Element.classList.contains(TEST_CLASS_ONE), 'classList should not contain any added classes');
  pdomAuditRootNode(a1);
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('Next/Previous focusable', assert => {
  const util = PDOMUtils;
  const rootNode = new Node({
    tagName: 'div',
    focusable: true
  });
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);

  // invisible is deprecated don't use in future, this is a workaround for Nodes without bounds
  const a = new Node({
    tagName: 'div',
    focusable: true,
    focusHighlight: 'invisible'
  });
  const b = new Node({
    tagName: 'div',
    focusable: true,
    focusHighlight: 'invisible'
  });
  const c = new Node({
    tagName: 'div',
    focusable: true,
    focusHighlight: 'invisible'
  });
  const d = new Node({
    tagName: 'div',
    focusable: true,
    focusHighlight: 'invisible'
  });
  const e = new Node({
    tagName: 'div',
    focusable: true,
    focusHighlight: 'invisible'
  });
  rootNode.children = [a, b, c, d];
  assert.ok(a.focusable, 'should be focusable');

  // get dom elements from the body
  const rootElement = getPrimarySiblingElementByNode(rootNode);
  const aElement = getPrimarySiblingElementByNode(a);
  const bElement = getPrimarySiblingElementByNode(b);
  const cElement = getPrimarySiblingElementByNode(c);
  const dElement = getPrimarySiblingElementByNode(d);
  a.focus();
  assert.ok(document.activeElement.id === aElement.id, 'a in focus (next)');
  util.getNextFocusable(rootElement).focus();
  assert.ok(document.activeElement.id === bElement.id, 'b in focus (next)');
  util.getNextFocusable(rootElement).focus();
  assert.ok(document.activeElement.id === cElement.id, 'c in focus (next)');
  util.getNextFocusable(rootElement).focus();
  assert.ok(document.activeElement.id === dElement.id, 'd in focus (next)');
  util.getNextFocusable(rootElement).focus();
  assert.ok(document.activeElement.id === dElement.id, 'd still in focus (next)');
  util.getPreviousFocusable(rootElement).focus();
  assert.ok(document.activeElement.id === cElement.id, 'c in focus (previous)');
  util.getPreviousFocusable(rootElement).focus();
  assert.ok(document.activeElement.id === bElement.id, 'b in focus (previous)');
  util.getPreviousFocusable(rootElement).focus();
  assert.ok(document.activeElement.id === aElement.id, 'a in focus (previous)');
  util.getPreviousFocusable(rootElement).focus();
  assert.ok(document.activeElement.id === aElement.id, 'a still in focus (previous)');
  rootNode.removeAllChildren();
  rootNode.addChild(a);
  a.children = [b, c];
  c.addChild(d);
  d.addChild(e);

  // this should hide everything except a
  b.focusable = false;
  c.pdomVisible = false;
  a.focus();
  util.getNextFocusable(rootElement).focus();
  assert.ok(document.activeElement.id === aElement.id, 'a only element focusable');
  pdomAuditRootNode(rootNode);
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('Remove accessibility subtree', assert => {
  const rootNode = new Node({
    tagName: 'div',
    focusable: true
  });
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);
  const a = new Node({
    tagName: 'div',
    focusable: true,
    focusHighlight: 'invisible'
  });
  const b = new Node({
    tagName: 'div',
    focusable: true,
    focusHighlight: 'invisible'
  });
  const c = new Node({
    tagName: 'div',
    focusable: true,
    focusHighlight: 'invisible'
  });
  const d = new Node({
    tagName: 'div',
    focusable: true,
    focusHighlight: 'invisible'
  });
  const e = new Node({
    tagName: 'div',
    focusable: true,
    focusHighlight: 'invisible'
  });
  const f = new Node({
    tagName: 'div',
    focusable: true,
    focusHighlight: 'invisible'
  });
  rootNode.children = [a, b, c, d, e];
  d.addChild(f);
  let rootDOMElement = getPrimarySiblingElementByNode(rootNode);
  let dDOMElement = getPrimarySiblingElementByNode(d);

  // verify the dom
  assert.ok(rootDOMElement.children.length === 5, 'children added');

  // redefine because the dom element references above have become stale
  rootDOMElement = getPrimarySiblingElementByNode(rootNode);
  dDOMElement = getPrimarySiblingElementByNode(d);
  assert.ok(rootDOMElement.children.length === 5, 'children added back');
  assert.ok(dDOMElement.children.length === 1, 'descendant child added back');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('accessible-dag', assert => {
  // test accessibility for multiple instances of a node
  const rootNode = new Node({
    tagName: 'div',
    focusable: true
  });
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);
  const a = new Node({
    tagName: 'div'
  });
  const b = new Node({
    tagName: 'div'
  });
  const c = new Node({
    tagName: 'div'
  });
  const d = new Node({
    tagName: 'div'
  });
  const e = new Node({
    tagName: 'div'
  });
  rootNode.addChild(a);
  a.children = [b, c, d];

  // e has three parents (DAG)
  b.addChild(e);
  c.addChild(e);
  d.addChild(e);

  // each instance should have its own accessible content, HTML should look like
  // <div id="root">
  //   <div id="a">
  //     <div id="b">
  //       <div id="e-instance1">
  //     <div id="c">
  //       <div id="e-instance2">
  //     <div id="d">
  //       <div id="e-instance2">
  const instances = e.pdomInstances;
  assert.ok(e.pdomInstances.length === 3, 'node e should have 3 accessible instances');
  assert.ok(instances[0].peer.primarySibling.id !== instances[1].peer.primarySibling.id && instances[1].peer.primarySibling.id !== instances[2].peer.primarySibling.id && instances[0].peer.primarySibling.id !== instances[2].peer.primarySibling.id, 'each dom element should be unique');
  assert.ok(document.getElementById(instances[0].peer.primarySibling.id), 'peer primarySibling 0 should be in the DOM');
  assert.ok(document.getElementById(instances[1].peer.primarySibling.id), 'peer primarySibling 1 should be in the DOM');
  assert.ok(document.getElementById(instances[2].peer.primarySibling.id), 'peer primarySibling 2 should be in the DOM');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('replaceChild', assert => {
  // test the behavior of replaceChild function
  const rootNode = new Node({
    tagName: 'div'
  });
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);
  display.initializeEvents();

  // create some nodes for testing
  const a = new Node({
    tagName: 'button',
    focusHighlight: focusHighlight
  });
  const b = new Node({
    tagName: 'button',
    focusHighlight: focusHighlight
  });
  const c = new Node({
    tagName: 'button',
    focusHighlight: focusHighlight
  });
  const d = new Node({
    tagName: 'button',
    focusHighlight: focusHighlight
  });
  const e = new Node({
    tagName: 'button',
    focusHighlight: focusHighlight
  });
  const f = new Node({
    tagName: 'button',
    focusHighlight: focusHighlight
  });

  // a child that will be added through replaceChild()
  const testNode = new Node({
    tagName: 'button',
    focusHighlight: focusHighlight
  });

  // make sure replaceChild puts the child in the right spot
  a.children = [b, c, d, e, f];
  const initIndex = a.indexOfChild(e);
  a.replaceChild(e, testNode);
  const afterIndex = a.indexOfChild(testNode);
  assert.ok(a.hasChild(testNode), 'a should have child testNode after it replaced node e');
  assert.ok(!a.hasChild(e), 'a should no longer have child node e after it was replaced by testNode');
  assert.ok(initIndex === afterIndex, 'testNode should be at the same place as e was after replaceChild');

  // create a scene graph to test how scenery manages focus
  //    a
  //   / \
  //  f   b
  //     / \
  //    c   d
  //     \ /
  //      e
  a.removeAllChildren();
  rootNode.addChild(a);
  a.children = [f, b];
  b.children = [c, d];
  c.addChild(e);
  d.addChild(e);
  f.focus();
  assert.ok(f.focused, 'f has focus before being replaced');

  // replace f with testNode, ensure that testNode receives focus after replacing
  a.replaceChild(f, testNode);
  assert.ok(!a.hasChild(f), 'a should no longer have child f');
  assert.ok(a.hasChild(testNode), 'a should now have child testNode');
  assert.ok(!f.focused, 'f no longer has focus after being replaced');
  assert.ok(testNode.focused, 'testNode has focus after replacing focused node f');
  assert.ok(testNode.pdomInstances[0].peer.primarySibling === document.activeElement, 'browser is focusing testNode');
  testNode.blur();
  assert.ok(!!testNode, 'testNode blurred before being replaced');

  // replace testNode with f after bluring testNode, neither should have focus after the replacement
  a.replaceChild(testNode, f);
  assert.ok(a.hasChild(f), 'node f should replace node testNode');
  assert.ok(!a.hasChild(testNode), 'testNode should no longer be a child of node a');
  assert.ok(!testNode.focused, 'testNode should not have focus after being replaced');
  assert.ok(!f.focused, 'f should not have focus after replacing testNode, testNode did not have focus');
  assert.ok(f.pdomInstances[0].peer.primarySibling !== document.activeElement, 'browser should not be focusing node f');

  // focus node d and replace with non-focusable testNode, neither should have focus since testNode is not focusable
  d.focus();
  testNode.focusable = false;
  assert.ok(d.focused, 'd has focus before being replaced');
  assert.ok(!testNode.focusable, 'testNode is not focusable before replacing node d');
  b.replaceChild(d, testNode);
  assert.ok(b.hasChild(testNode), 'testNode should be a child of node b after replacing with replaceChild');
  assert.ok(!b.hasChild(d), 'd should not be a child of b after it was replaced with replaceChild');
  assert.ok(!d.focused, 'd does not have focus after being replaced by testNode');
  assert.ok(!testNode.focused, 'testNode does not have focus after replacing node d (testNode is not focusable)');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('pdomVisible', assert => {
  const rootNode = new Node();
  const display = new Display(rootNode);
  document.body.appendChild(display.domElement);

  // test with a scene graph
  //       a
  //      / \
  //     b    c
  //        / | \
  //       d  e  f
  //           \ /
  //            g
  const a = new Node();
  const b = new Node();
  const c = new Node();
  const d = new Node();
  const e = new Node();
  const f = new Node();
  const g = new Node();
  rootNode.addChild(a);
  a.children = [b, c];
  c.children = [d, e, f];
  e.children = [g];
  f.children = [g];

  // give some accessible content
  a.tagName = 'div';
  b.tagName = 'button';
  e.tagName = 'div';
  g.tagName = 'button';

  // scenery should produce this accessible DOM tree
  // <div id="a">
  //   <button id="b">
  //   <div id="e">
  //      <button id="g1">
  //   <button id="g2">

  // get the accessible primary siblings - looking into pdomInstances for testing, there is no getter for primarySibling
  const divA = a.pdomInstances[0].peer.primarySibling;
  const buttonB = b.pdomInstances[0].peer.primarySibling;
  const divE = e.pdomInstances[0].peer.primarySibling;
  const buttonG1 = g.pdomInstances[0].peer.primarySibling;
  const buttonG2 = g.pdomInstances[1].peer.primarySibling;
  const divAChildren = divA.childNodes;
  const divEChildren = divE.childNodes;
  assert.ok(_.includes(divAChildren, buttonB), 'button B should be an immediate child of div A');
  assert.ok(_.includes(divAChildren, divE), 'div E should be an immediate child of div A');
  assert.ok(_.includes(divAChildren, buttonG2), 'button G2 should be an immediate child of div A');
  assert.ok(_.includes(divEChildren, buttonG1), 'button G1 should be an immediate child of div E');

  // make node B invisible for accessibility - it should should visible, but hidden from screen readers
  b.pdomVisible = false;
  assert.equal(b.visible, true, 'b should be visible after becoming hidden for screen readers');
  assert.equal(b.pdomVisible, false, 'b state should reflect it is hidden for screen readers');
  assert.equal(buttonB.hidden, true, 'buttonB should be hidden for screen readers');
  assert.equal(b.pdomDisplayed, false, 'pdomVisible=false, b should have no representation in the PDOM');
  b.pdomVisible = true;

  // make node B invisible - it should not be visible, and it should be hidden for screen readers
  b.visible = false;
  assert.equal(b.visible, false, 'state of node b is visible');
  assert.equal(buttonB.hidden, true, 'buttonB is hidden from screen readers after becoming invisible');
  assert.equal(b.pdomVisible, true, 'state of node b still reflects pdom visibility when invisible');
  assert.equal(b.pdomDisplayed, false, 'b invisible and should have no representation in the PDOM');
  b.visible = true;

  // make node f invisible - g's trail that goes through f should be invisible to AT, tcomhe child of c should remain pdomVisible
  f.visible = false;
  assert.equal(g.isPDOMVisible(), true, 'state of pdomVisible should remain true on node g');
  assert.ok(!buttonG1.hidden, 'buttonG1 (child of e) should not be hidden after parent node f made invisible (no accessible content on node f)');
  assert.equal(buttonG2.hidden, true, 'buttonG2 should be hidden after parent node f made invisible (no accessible content on node f)');
  assert.equal(g.pdomDisplayed, true, 'one parent still visible, g still has one PDOMInstance displayed in PDOM');
  f.visible = true;

  // make node c (no accessible content) invisible to screen, e should be hidden and g2 should be hidden
  c.pdomVisible = false;
  assert.equal(c.visible, true, 'c should still be visible after becoming invisible to screen readers');
  assert.equal(divE.hidden, true, 'div E should be hidden after parent node c (no accessible content) is made invisible to screen readers');
  assert.equal(buttonG2.hidden, true, 'buttonG2 should be hidden after ancestor node c (no accessible content) is made invisible to screen readers');
  assert.ok(!divA.hidden, 'div A should not have been hidden by making descendant c invisible to screen readers');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('inputValue', assert => {
  const rootNode = new Node();
  const display = new Display(rootNode);
  document.body.appendChild(display.domElement);
  const a = new Node({
    tagName: 'input',
    inputType: 'radio',
    inputValue: 'i am value'
  });
  rootNode.addChild(a);
  let aElement = getPrimarySiblingElementByNode(a);
  assert.ok(aElement.getAttribute('value') === 'i am value', 'should have correct value');
  const differentValue = 'i am different value';
  a.inputValue = differentValue;
  aElement = getPrimarySiblingElementByNode(a);
  assert.ok(aElement.getAttribute('value') === differentValue, 'should have different value');
  rootNode.addChild(new Node({
    children: [a]
  }));
  aElement = a.pdomInstances[1].peer.primarySibling;
  assert.ok(aElement.getAttribute('value') === differentValue, 'should have the same different value');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('ariaValueText', assert => {
  const rootNode = new Node();
  const display = new Display(rootNode);
  document.body.appendChild(display.domElement);
  const ariaValueText = 'this is my value text';
  const a = new Node({
    tagName: 'input',
    ariaValueText: ariaValueText,
    inputType: 'range'
  });
  rootNode.addChild(a);
  let aElement = getPrimarySiblingElementByNode(a);
  assert.ok(aElement.getAttribute('aria-valuetext') === ariaValueText, 'should have correct value text.');
  assert.ok(a.ariaValueText === ariaValueText, 'should have correct value text, getter');
  const differentValue = 'i am different value text';
  a.ariaValueText = differentValue;
  aElement = getPrimarySiblingElementByNode(a);
  assert.ok(aElement.getAttribute('aria-valuetext') === differentValue, 'should have different value text');
  assert.ok(a.ariaValueText === differentValue, 'should have different value text, getter');
  rootNode.addChild(new Node({
    children: [a]
  }));
  aElement = a.pdomInstances[1].peer.primarySibling;
  assert.ok(aElement.getAttribute('aria-valuetext') === differentValue, 'should have the same different value text after children moving');
  assert.ok(a.ariaValueText === differentValue, 'should have the same different value text after children moving, getter');
  a.tagName = 'div';
  aElement = a.pdomInstances[1].peer.primarySibling;
  assert.ok(aElement.getAttribute('aria-valuetext') === differentValue, 'value text as div');
  assert.ok(a.ariaValueText === differentValue, 'value text as div, getter');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('setPDOMAttribute', assert => {
  const rootNode = new Node();
  const display = new Display(rootNode);
  document.body.appendChild(display.domElement);
  const a = new Node({
    tagName: 'div',
    labelContent: 'hello'
  });
  rootNode.addChild(a);
  a.setPDOMAttribute('test', 'test1');
  let aElement = getPrimarySiblingElementByNode(a);
  assert.ok(aElement.getAttribute('test') === 'test1', 'setPDOMAttribute for primary sibling');
  a.removePDOMAttribute('test');
  aElement = getPrimarySiblingElementByNode(a);
  assert.ok(aElement.getAttribute('test') === null, 'removePDOMAttribute for primary sibling');
  a.setPDOMAttribute('test', 'testValue');
  a.setPDOMAttribute('test', 'testValueLabel', {
    elementName: PDOMPeer.LABEL_SIBLING
  });
  const testBothAttributes = () => {
    aElement = getPrimarySiblingElementByNode(a);
    const aLabelElement = aElement.parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
    assert.ok(aElement.getAttribute('test') === 'testValue', 'setPDOMAttribute for primary sibling 2');
    assert.ok(aLabelElement.getAttribute('test') === 'testValueLabel', 'setPDOMAttribute for label sibling');
  };
  testBothAttributes();
  rootNode.removeChild(a);
  rootNode.addChild(new Node({
    children: [a]
  }));
  testBothAttributes();
  a.removePDOMAttribute('test', {
    elementName: PDOMPeer.LABEL_SIBLING
  });
  aElement = getPrimarySiblingElementByNode(a);
  const aLabelElement = aElement.parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
  assert.ok(aElement.getAttribute('test') === 'testValue', 'removePDOMAttribute for label should not effect primary sibling ');
  assert.ok(aLabelElement.getAttribute('test') === null, 'removePDOMAttribute for label sibling');
  a.removePDOMAttributes();
  const attributeName = 'multiTest';
  a.setPDOMAttribute(attributeName, 'true', {
    asProperty: false
  });
  aElement = getPrimarySiblingElementByNode(a);
  assert.ok(aElement.getAttribute(attributeName) === 'true', 'asProperty:false should set attribute');
  a.setPDOMAttribute(attributeName, false, {
    asProperty: true
  });
  assert.ok(!aElement.getAttribute(attributeName), 'asProperty:true should remove attribute');

  // @ts-expect-error for testing
  assert.equal(aElement[attributeName], false, 'asProperty:true should set property');
  const testAttributes = a.getPDOMAttributes().filter(a => a.attribute === attributeName);
  assert.ok(testAttributes.length === 1, 'asProperty change should alter the attribute, not add a new one.');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('pdomChecked', assert => {
  const rootNode = new Node();
  const display = new Display(rootNode);
  document.body.appendChild(display.domElement);
  const a = new Node({
    tagName: 'input',
    inputType: 'radio',
    pdomChecked: true
  });
  rootNode.addChild(a);
  let aElement = getPrimarySiblingElementByNode(a);
  assert.ok(aElement.checked, 'should be checked');
  a.pdomChecked = false;
  aElement = getPrimarySiblingElementByNode(a);
  assert.ok(!aElement.checked, 'should not be checked');
  a.inputType = 'range';
  window.assert && assert.throws(() => {
    a.pdomChecked = true;
  }, /.*/, 'should fail if inputType range');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('swapVisibility', assert => {
  // test the behavior of swapVisibility function
  const rootNode = new Node({
    tagName: 'div'
  });
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);
  display.initializeEvents();

  // a custom focus highlight (since dummy node's have no bounds)
  const focusHighlight = new Rectangle(0, 0, 10, 10);

  // create some nodes for testing
  const a = new Node({
    tagName: 'button',
    focusHighlight: focusHighlight
  });
  const b = new Node({
    tagName: 'button',
    focusHighlight: focusHighlight
  });
  const c = new Node({
    tagName: 'button',
    focusHighlight: focusHighlight
  });
  rootNode.addChild(a);
  a.children = [b, c];

  // swap visibility between two nodes, visibility should be swapped and neither should have keyboard focus
  b.visible = true;
  c.visible = false;
  b.swapVisibility(c);
  assert.equal(b.visible, false, 'b should now be invisible');
  assert.equal(c.visible, true, 'c should now be visible');
  assert.equal(b.focused, false, 'b should not have focus after being made invisible');
  assert.equal(c.focused, false, 'c should not have  focus since b did not have focus');

  // swap visibility between two nodes where the one that is initially visible has keyboard focus, the newly visible
  // node then receive focus
  b.visible = true;
  c.visible = false;
  b.focus();
  b.swapVisibility(c);
  assert.equal(b.visible, false, 'b should be invisible after swapVisibility');
  assert.equal(c.visible, true, 'c should be visible after  swapVisibility');
  assert.equal(b.focused, false, 'b should no longer have focus  after swapVisibility');
  assert.equal(c.focused, true, 'c should now have focus after swapVisibility');

  // swap visibility between two nodes where the one that is initially visible has keyboard focus, the newly visible
  // node then receive focus - like the previous test but c.swapVisibility( b ) is the same as b.swapVisibility( c )
  b.visible = true;
  c.visible = false;
  b.focus();
  b.swapVisibility(c);
  assert.equal(b.visible, false, 'b should be invisible after swapVisibility');
  assert.equal(c.visible, true, 'c should be visible after  swapVisibility');
  assert.equal(b.focused, false, 'b should no longer have focus  after swapVisibility');
  assert.equal(c.focused, true, 'c should now have focus after swapVisibility');

  // swap visibility between two nodes where the first node has focus, but the second node is not focusable. After
  // swapping, neither should have focus
  b.visible = true;
  c.visible = false;
  b.focus();
  c.focusable = false;
  b.swapVisibility(c);
  assert.equal(b.visible, false, 'b should be invisible after visibility is swapped');
  assert.equal(c.visible, true, 'c should be visible after visibility is swapped');
  assert.equal(b.focused, false, 'b should no longer have focus after visibility is swapped');
  assert.equal(c.focused, false, 'c should not have focus after visibility is swapped because it is not focusable');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('Aria Label Setter', assert => {
  // test the behavior of swapVisibility function
  const rootNode = new Node({
    tagName: 'div'
  });
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);

  // create some nodes for testing
  const a = new Node({
    tagName: 'button',
    ariaLabel: TEST_LABEL_2
  });
  assert.ok(a.ariaLabel === TEST_LABEL_2, 'aria-label getter/setter');
  assert.ok(a.labelContent === null, 'no other label set with aria-label');
  assert.ok(a.innerContent === null, 'no inner content set with aria-label');
  rootNode.addChild(a);
  let buttonA = a.pdomInstances[0].peer.primarySibling;
  assert.ok(buttonA.getAttribute('aria-label') === TEST_LABEL_2, 'setter on dom element');
  assert.ok(buttonA.innerHTML === '', 'no inner html with aria-label setter');
  a.ariaLabel = null;
  buttonA = a.pdomInstances[0].peer.primarySibling;
  assert.ok(!buttonA.hasAttribute('aria-label'), 'setter can clear on dom element');
  assert.ok(buttonA.innerHTML === '', 'no inner html with aria-label setter when clearing');
  assert.ok(a.ariaLabel === null, 'cleared in Node model.');
  pdomAuditRootNode(rootNode);
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('focusable option', assert => {
  // test the behavior of focusable function
  const rootNode = new Node({
    tagName: 'div'
  });
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);
  display.initializeEvents();
  const a = new Node({
    tagName: 'div',
    focusable: true
  });
  rootNode.addChild(a);
  assert.equal(a.focusable, true, 'focusable option setter');
  assert.ok(getPrimarySiblingElementByNode(a).tabIndex === 0, 'tab index on primary sibling with setter');

  // change the tag name, but focusable should stay the same
  a.tagName = 'p';
  assert.equal(a.focusable, true, 'tagName option should not change focusable value');
  assert.ok(getPrimarySiblingElementByNode(a).tabIndex === 0, 'tagName option should not change tab index on primary sibling');
  a.focusable = false;
  assert.ok(getPrimarySiblingElementByNode(a).tabIndex === -1, 'set focusable false');
  const b = new Node({
    tagName: 'p'
  });
  rootNode.addChild(b);
  b.focusable = true;
  assert.ok(b.focusable, 'set focusable as setter');
  assert.ok(getPrimarySiblingElementByNode(b).tabIndex === 0, 'set focusable as setter');

  // HTML elements that are natively focusable are focusable by default
  const c = new Node({
    tagName: 'button'
  });
  assert.ok(c.focusable, 'button is focusable by default');

  // change tagName to something that is not focusable, focusable should be false
  c.tagName = 'p';
  assert.ok(!c.focusable, 'button changed to paragraph, should no longer be focusable');

  // When focusable is set to null on an element that is not focusable by default, it should lose focus
  const d = new Node({
    tagName: 'div',
    focusable: true,
    focusHighlight: focusHighlight
  });
  rootNode.addChild(d);
  d.focus();
  assert.ok(d.focused, 'focusable div should be focused after calling focus()');
  d.focusable = null;
  assert.ok(!d.focused, 'default div should lose focus after node restored to null focusable');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('append siblings/appendLabel/appendDescription setters', assert => {
  // test the behavior of focusable function
  const rootNode = new Node({
    tagName: 'div'
  });
  const display = new Display(rootNode);
  document.body.appendChild(display.domElement);
  const a = new Node({
    tagName: 'li',
    innerContent: TEST_INNER_CONTENT,
    labelTagName: 'h3',
    labelContent: TEST_LABEL,
    descriptionContent: TEST_DESCRIPTION,
    containerTagName: 'section',
    appendLabel: true
  });
  rootNode.addChild(a);
  const aElement = getPrimarySiblingElementByNode(a);
  let containerElement = aElement.parentElement;
  assert.ok(containerElement.tagName.toUpperCase() === 'SECTION', 'container parent is set to right tag');
  let peerElements = containerElement.childNodes;
  assert.ok(peerElements.length === 3, 'expected three siblings');
  assert.ok(peerElements[0].tagName.toUpperCase() === DEFAULT_DESCRIPTION_TAG_NAME, 'description first sibling');
  assert.ok(peerElements[1].tagName.toUpperCase() === 'LI', 'primary sibling second sibling');
  assert.ok(peerElements[2].tagName.toUpperCase() === 'H3', 'label sibling last');
  a.appendDescription = true;
  containerElement = getPrimarySiblingElementByNode(a).parentElement;
  peerElements = containerElement.childNodes;
  assert.ok(containerElement.childNodes.length === 3, 'expected three siblings');
  assert.ok(peerElements[0].tagName.toUpperCase() === 'LI', 'primary sibling first sibling');
  assert.ok(peerElements[1].tagName.toUpperCase() === 'H3', 'label sibling second');
  assert.ok(peerElements[2].tagName.toUpperCase() === DEFAULT_DESCRIPTION_TAG_NAME, 'description last sibling');

  // clear it out back to defaults should work with setters
  a.appendDescription = false;
  a.appendLabel = false;
  containerElement = getPrimarySiblingElementByNode(a).parentElement;
  peerElements = containerElement.childNodes;
  assert.ok(containerElement.childNodes.length === 3, 'expected three siblings');
  assert.ok(peerElements[0].tagName.toUpperCase() === 'H3', 'label sibling first');
  assert.ok(peerElements[1].tagName.toUpperCase() === DEFAULT_DESCRIPTION_TAG_NAME, 'description sibling second');
  assert.ok(peerElements[2].tagName.toUpperCase() === 'LI', 'primary sibling last');

  // test order when using appendLabel/appendDescription without a parent container - order should be primary sibling,
  // label sibling, description sibling
  const b = new Node({
    tagName: 'input',
    inputType: 'checkbox',
    labelTagName: 'label',
    labelContent: TEST_LABEL,
    descriptionContent: TEST_DESCRIPTION,
    appendLabel: true,
    appendDescription: true
  });
  rootNode.addChild(b);
  let bPeer = getPDOMPeerByNode(b);
  let bElement = getPrimarySiblingElementByNode(b);
  let bElementParent = bElement.parentElement;
  let indexOfPrimaryElement = Array.prototype.indexOf.call(bElementParent.childNodes, bElement);
  assert.ok(bElementParent.childNodes[indexOfPrimaryElement] === bElement, 'b primary sibling first with no container, both appended');
  assert.ok(bElementParent.childNodes[indexOfPrimaryElement + 1] === bPeer.labelSibling, 'b label sibling second with no container, both appended');
  assert.ok(bElementParent.childNodes[indexOfPrimaryElement + 2] === bPeer.descriptionSibling, 'b description sibling third with no container, both appended');

  // test order when only description appended and no parent container - order should be label, primary, then
  // description
  b.appendLabel = false;

  // refresh since operation may have created new Objects
  bPeer = getPDOMPeerByNode(b);
  bElement = getPrimarySiblingElementByNode(b);
  bElementParent = bElement.parentElement;
  indexOfPrimaryElement = Array.prototype.indexOf.call(bElementParent.childNodes, bElement);
  assert.ok(bElementParent.childNodes[indexOfPrimaryElement - 1] === bPeer.labelSibling, 'b label sibling first with no container, description appended');
  assert.ok(bElementParent.childNodes[indexOfPrimaryElement] === bElement, 'b primary sibling second with no container, description appended');
  assert.ok(bElementParent.childNodes[indexOfPrimaryElement + 1] === bPeer.descriptionSibling, 'b description sibling third with no container, description appended');
  pdomAuditRootNode(rootNode);
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('containerAriaRole option', assert => {
  // test the behavior of focusable function
  const rootNode = new Node({
    tagName: 'div'
  });
  const display = new Display(rootNode);
  document.body.appendChild(display.domElement);
  const a = new Node({
    tagName: 'div',
    containerTagName: 'div',
    containerAriaRole: 'application'
  });
  rootNode.addChild(a);
  assert.ok(a.containerAriaRole === 'application', 'role attribute should be on node property');
  let aElement = getPrimarySiblingElementByNode(a);
  assert.ok(aElement.parentElement.getAttribute('role') === 'application', 'role attribute should be on parent element');
  a.containerAriaRole = null;
  assert.ok(a.containerAriaRole === null, 'role attribute should be cleared on node');
  aElement = getPrimarySiblingElementByNode(a);
  assert.ok(aElement.parentElement.getAttribute('role') === null, 'role attribute should be cleared on parent element');
  pdomAuditRootNode(rootNode);
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('ariaRole option', assert => {
  // test the behavior of focusable function
  const rootNode = new Node({
    tagName: 'div'
  });
  const display = new Display(rootNode);
  document.body.appendChild(display.domElement);
  const a = new Node({
    tagName: 'div',
    innerContent: 'Draggable',
    ariaRole: 'application'
  });
  rootNode.addChild(a);
  assert.ok(a.ariaRole === 'application', 'role attribute should be on node property');
  let aElement = getPrimarySiblingElementByNode(a);
  assert.ok(aElement.getAttribute('role') === 'application', 'role attribute should be on element');
  a.ariaRole = null;
  assert.ok(a.ariaRole === null, 'role attribute should be cleared on node');
  aElement = getPrimarySiblingElementByNode(a);
  assert.ok(aElement.getAttribute('role') === null, 'role attribute should be cleared on element');
  pdomAuditRootNode(rootNode);
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});

// Higher level setter/getter options
QUnit.test('accessibleName option', assert => {
  assert.ok(true);

  // test the behavior of focusable function
  const rootNode = new Node({
    tagName: 'div'
  });
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);
  const a = new Node({
    tagName: 'div',
    accessibleName: TEST_LABEL
  });
  rootNode.addChild(a);
  assert.ok(a.accessibleName === TEST_LABEL, 'accessibleName getter');
  const aElement = getPrimarySiblingElementByNode(a);
  assert.ok(aElement.textContent === TEST_LABEL, 'accessibleName setter on div');
  const b = new Node({
    tagName: 'input',
    accessibleName: TEST_LABEL,
    inputType: 'range'
  });
  a.addChild(b);
  const bElement = getPrimarySiblingElementByNode(b);
  const bParent = getPrimarySiblingElementByNode(b).parentElement;
  const bLabelSibling = bParent.children[DEFAULT_LABEL_SIBLING_INDEX];
  assert.ok(bLabelSibling.textContent === TEST_LABEL, 'accessibleName sets label sibling');
  assert.ok(bLabelSibling.getAttribute('for').includes(bElement.id), 'accessibleName sets label\'s "for" attribute');
  const c = new Node({
    containerTagName: 'div',
    tagName: 'div',
    ariaLabel: 'overrideThis'
  });
  rootNode.addChild(c);
  const cAccessibleNameBehavior = (node, options, accessibleName) => {
    options.ariaLabel = accessibleName;
    return options;
  };
  c.accessibleNameBehavior = cAccessibleNameBehavior;
  assert.ok(c.accessibleNameBehavior === cAccessibleNameBehavior, 'getter works');
  let cLabelElement = getPrimarySiblingElementByNode(c).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
  assert.ok(cLabelElement.getAttribute('aria-label') === 'overrideThis', 'accessibleNameBehavior should not work until there is accessible name');
  c.accessibleName = 'accessible name description';
  cLabelElement = getPrimarySiblingElementByNode(c).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
  assert.ok(cLabelElement.getAttribute('aria-label') === 'accessible name description', 'accessible name setter');
  c.accessibleName = '';
  cLabelElement = getPrimarySiblingElementByNode(c).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
  assert.ok(cLabelElement.getAttribute('aria-label') === '', 'accessibleNameBehavior should work for empty string');
  c.accessibleName = null;
  cLabelElement = getPrimarySiblingElementByNode(c).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
  assert.ok(cLabelElement.getAttribute('aria-label') === 'overrideThis', 'accessibleNameBehavior should not work until there is accessible name');
  const d = new Node({
    containerTagName: 'div',
    tagName: 'div'
  });
  rootNode.addChild(d);
  const dAccessibleNameBehavior = (node, options, accessibleName) => {
    options.ariaLabel = accessibleName;
    return options;
  };
  d.accessibleNameBehavior = dAccessibleNameBehavior;
  assert.ok(d.accessibleNameBehavior === dAccessibleNameBehavior, 'getter works');
  let dLabelElement = getPrimarySiblingElementByNode(d).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
  assert.ok(dLabelElement.getAttribute('aria-label') === null, 'accessibleNameBehavior should not work until there is accessible name');
  const accessibleNameDescription = 'accessible name description';
  d.accessibleName = accessibleNameDescription;
  dLabelElement = getPrimarySiblingElementByNode(d).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
  assert.ok(dLabelElement.getAttribute('aria-label') === accessibleNameDescription, 'accessible name setter');
  d.accessibleName = '';
  dLabelElement = getPrimarySiblingElementByNode(d).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
  assert.ok(dLabelElement.getAttribute('aria-label') === '', 'accessibleNameBehavior should work for empty string');
  d.accessibleName = null;
  dLabelElement = getPrimarySiblingElementByNode(d).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
  assert.ok(dLabelElement.getAttribute('aria-label') === null, 'accessibleNameBehavior should not work until there is accessible name');
  pdomAuditRootNode(rootNode);
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('pdomHeading option', assert => {
  assert.ok(true);

  // test the behavior of focusable function
  const rootNode = new Node({
    tagName: 'div'
  });
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);
  const a = new Node({
    tagName: 'div',
    pdomHeading: TEST_LABEL,
    containerTagName: 'div'
  });
  rootNode.addChild(a);
  assert.ok(a.pdomHeading === TEST_LABEL, 'accessibleName getter');
  const aLabelSibling = getPrimarySiblingElementByNode(a).parentElement.children[DEFAULT_LABEL_SIBLING_INDEX];
  assert.ok(aLabelSibling.textContent === TEST_LABEL, 'pdomHeading setter on div');
  assert.ok(aLabelSibling.tagName === 'H1', 'pdomHeading setter should be h1');
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('helpText option', assert => {
  assert.ok(true);

  // test the behavior of focusable function
  const rootNode = new Node({
    tagName: 'div'
  });
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);

  // label tag needed for default sibling indices to work
  const a = new Node({
    containerTagName: 'div',
    tagName: 'div',
    labelTagName: 'div',
    helpText: TEST_DESCRIPTION
  });
  rootNode.addChild(a);
  rootNode.addChild(new Node({
    tagName: 'input',
    inputType: 'range'
  }));
  assert.ok(a.helpText === TEST_DESCRIPTION, 'helpText getter');

  // default for help text is to append description after the primary sibling
  const aDescriptionElement = getPrimarySiblingElementByNode(a).parentElement.children[APPENDED_DESCRIPTION_SIBLING_INDEX];
  assert.ok(aDescriptionElement.textContent === TEST_DESCRIPTION, 'helpText setter on div');
  const b = new Node({
    containerTagName: 'div',
    tagName: 'button',
    descriptionContent: 'overrideThis',
    labelTagName: 'div'
  });
  rootNode.addChild(b);
  b.helpTextBehavior = (node, options, helpText) => {
    options.descriptionTagName = 'p';
    options.descriptionContent = helpText;
    return options;
  };
  let bDescriptionElement = getPrimarySiblingElementByNode(b).parentElement.children[DEFAULT_DESCRIPTION_SIBLING_INDEX];
  assert.ok(bDescriptionElement.textContent === 'overrideThis', 'helpTextBehavior should not work until there is help text');
  b.helpText = 'help text description';
  bDescriptionElement = getPrimarySiblingElementByNode(b).parentElement.children[DEFAULT_DESCRIPTION_SIBLING_INDEX];
  assert.ok(bDescriptionElement.textContent === 'help text description', 'help text setter');
  b.helpText = '';
  bDescriptionElement = getPrimarySiblingElementByNode(b).parentElement.children[DEFAULT_DESCRIPTION_SIBLING_INDEX];
  assert.ok(bDescriptionElement.textContent === '', 'helpTextBehavior should work for empty string');
  b.helpText = null;
  bDescriptionElement = getPrimarySiblingElementByNode(b).parentElement.children[DEFAULT_DESCRIPTION_SIBLING_INDEX];
  assert.ok(bDescriptionElement.textContent === 'overrideThis', 'helpTextBehavior should not work until there is help text');
  pdomAuditRootNode(rootNode);
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('move to front/move to back', assert => {
  // make sure state is restored after moving children to front and back
  const rootNode = new Node({
    tagName: 'div'
  });
  const display = new Display(rootNode);
  document.body.appendChild(display.domElement);
  display.initializeEvents();
  const a = new Node({
    tagName: 'button',
    focusHighlight: TEST_HIGHLIGHT
  });
  const b = new Node({
    tagName: 'button',
    focusHighlight: TEST_HIGHLIGHT
  });
  rootNode.children = [a, b];
  b.focus();

  // after moving a to front, b should still have focus
  a.moveToFront();
  assert.ok(b.focused, 'b should have focus after a moved to front');

  // after moving a to back, b should still have focus
  a.moveToBack();

  // add a guard where we don't check this if focus has been moved somewhere else. This happens sometimes with
  // dev tools or other windows opened, see https://github.com/phetsims/scenery/issues/827
  if (document.body.contains(document.activeElement) && document.body !== document.activeElement) {
    assert.ok(b.focused, 'b should have focus after a moved to back');
  }
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('Node.enabledProperty with PDOM', assert => {
  const rootNode = new Node({
    tagName: 'div'
  });
  var display = new Display(rootNode); // eslint-disable-line no-var
  document.body.appendChild(display.domElement);
  const pdomNode = new Node({
    tagName: 'p'
  });
  rootNode.addChild(pdomNode);
  assert.ok(pdomNode.pdomInstances.length === 1, 'should have an instance when attached to display');
  assert.ok(!!pdomNode.pdomInstances[0].peer, 'should have a peer');
  assert.ok(pdomNode.pdomInstances[0].peer.primarySibling.getAttribute('aria-disabled') !== 'true', 'should be enabled to start');
  pdomNode.enabled = false;
  assert.ok(pdomNode.pdomInstances[0].peer.primarySibling.getAttribute('aria-disabled') === 'true', 'should be aria-disabled when disabled');
  pdomNode.enabled = true;
  assert.ok(pdomNode.pdomInstances[0].peer.primarySibling.getAttribute('aria-disabled') === 'false', 'Actually set to false since it was previously disabled.');
  pdomNode.dispose;
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});

// these fuzzers take time, so it is nice when they are last
QUnit.test('Display.interactive toggling in the PDOM', assert => {
  const rootNode = new Node({
    tagName: 'div'
  });
  var display = new Display(rootNode); // eslint-disable-line no-var
  display.initializeEvents();
  document.body.appendChild(display.domElement);
  const pdomRangeChild = new Node({
    tagName: 'input',
    inputType: 'range'
  });
  const pdomParagraphChild = new Node({
    tagName: 'p'
  });
  const pdomButtonChild = new Node({
    tagName: 'button'
  });
  const pdomParent = new Node({
    tagName: 'button',
    children: [pdomRangeChild, pdomParagraphChild, pdomButtonChild]
  });
  const DISABLED_TRUE = true;

  // For of list of html elements that support disabled, see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled
  const DEFAULT_DISABLED_WHEN_SUPPORTED = false;
  const DEFAULT_DISABLED_WHEN_NOT_SUPPORTED = undefined;
  rootNode.addChild(pdomParent);
  assert.ok(true, 'initial case');
  const testDisabled = (node, disabled, message, pdomInstance = 0) => {
    // @ts-expect-error "disabled" is only supported by certain attributes, see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled
    assert.ok(node.pdomInstances[pdomInstance].peer.primarySibling.disabled === disabled, message);
  };
  testDisabled(pdomParent, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomParent initial no disabled');
  testDisabled(pdomRangeChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomRangeChild initial no disabled');
  testDisabled(pdomParagraphChild, DEFAULT_DISABLED_WHEN_NOT_SUPPORTED, 'pdomParagraphChild initial no disabled');
  testDisabled(pdomButtonChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomButtonChild initial no disabled');
  display.interactive = false;
  testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent toggled not interactive');
  testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild toggled not interactive');
  testDisabled(pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild toggled not interactive');
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild toggled not interactive');
  display.interactive = true;
  testDisabled(pdomParent, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomParent toggled back to interactive');
  testDisabled(pdomRangeChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomRangeChild toggled back to interactive');
  testDisabled(pdomParagraphChild, DEFAULT_DISABLED_WHEN_NOT_SUPPORTED, 'pdomParagraphChild toggled back to interactive');
  testDisabled(pdomButtonChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomButtonChild toggled back to interactive');
  display.interactive = false;
  testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent second toggled not interactive');
  testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild second toggled not interactive');
  testDisabled(pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild second toggled not interactive');
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild second toggled not interactive');
  pdomParent.setPDOMAttribute('disabled', true, {
    asProperty: true
  });
  pdomRangeChild.setPDOMAttribute('disabled', true, {
    asProperty: true
  });
  pdomParagraphChild.setPDOMAttribute('disabled', true, {
    asProperty: true
  });
  pdomButtonChild.setPDOMAttribute('disabled', true, {
    asProperty: true
  });
  testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent not interactive after setting disabled manually as property, display not interactive');
  testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild not interactive after setting disabled manually as property, display not interactive');
  testDisabled(pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild not interactive after setting disabled manually as property, display not interactive');
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild not interactive after setting disabled manually as property, display not interactive');
  display.interactive = true;
  testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent not interactive after setting disabled manually as property display interactive');
  testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild not interactive after setting disabled manually as property display interactive');
  testDisabled(pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild not interactive after setting disabled manually as property display interactive');
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild not interactive after setting disabled manually as property display interactive');
  display.interactive = false;
  testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent still disabled when display is not interactive again.');
  testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild still disabled when display is not interactive again.');
  testDisabled(pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild still disabled when display is not interactive again.');
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild still disabled when display is not interactive again.');
  pdomParent.removePDOMAttribute('disabled');
  pdomRangeChild.removePDOMAttribute('disabled');
  pdomParagraphChild.removePDOMAttribute('disabled');
  pdomButtonChild.removePDOMAttribute('disabled');
  testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent still disabled from display not interactive after local property removed.');
  testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild still disabled from display not interactive after local property removed.');
  testDisabled(pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild still disabled from display not interactive after local property removed.');
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild still disabled from display not interactive after local property removed.');
  display.interactive = true;
  testDisabled(pdomParent, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomParent interactive now without local property.');
  testDisabled(pdomRangeChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomRangeChild interactive now without local property.');
  testDisabled(pdomParagraphChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomParagraphChild interactive now without local property.');
  testDisabled(pdomButtonChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomButtonChild interactive now without local property.');
  pdomParent.setPDOMAttribute('disabled', '');
  pdomRangeChild.setPDOMAttribute('disabled', '');
  pdomParagraphChild.setPDOMAttribute('disabled', '');
  pdomButtonChild.setPDOMAttribute('disabled', '');
  testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent not interactive after setting disabled manually as attribute, display not interactive');
  testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild not interactive after setting disabled manually as attribute, display not interactive');
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild not interactive after setting disabled manually as attribute, display not interactive');
  display.interactive = true;
  testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent not interactive after setting disabled manually as attribute display interactive');
  testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild not interactive after setting disabled manually as attribute display interactive');
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild not interactive after setting disabled manually as attribute display interactive');

  // This test doesn't work, because paragraphs don't support disabled, so the attribute "disabled" won't
  // automatically transfer over to the property value like for the others. For a list of Elements that support "disabled", see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled
  // testDisabled( pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild not interactive after setting disabled manually as attribute, display  interactive' );

  display.interactive = false;
  testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent still disabled when display is not interactive again.');
  testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild still disabled when display is not interactive again.');
  testDisabled(pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild still disabled when display is not interactive again.');
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild still disabled when display is not interactive again.');
  pdomParent.removePDOMAttribute('disabled');
  pdomRangeChild.removePDOMAttribute('disabled');
  pdomParagraphChild.removePDOMAttribute('disabled');
  pdomButtonChild.removePDOMAttribute('disabled');
  testDisabled(pdomParent, DISABLED_TRUE, 'pdomParent still disabled from display not interactive after local attribute removed.');
  testDisabled(pdomRangeChild, DISABLED_TRUE, 'pdomRangeChild still disabled from display not interactive after local attribute removed.');
  testDisabled(pdomParagraphChild, DISABLED_TRUE, 'pdomParagraphChild still disabled from display not interactive after local attribute removed.');
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild still disabled from display not interactive after local attribute removed.');
  display.interactive = true;
  testDisabled(pdomParent, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomParent interactive now without local attribute.');
  testDisabled(pdomRangeChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomRangeChild interactive now without local attribute.');
  testDisabled(pdomParagraphChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomParagraphChild interactive now without local attribute.');
  testDisabled(pdomButtonChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomButtonChild interactive now without local attribute.');
  const containerOfDAGButton = new Node({
    children: [pdomButtonChild]
  });
  pdomParent.addChild(containerOfDAGButton);
  testDisabled(pdomButtonChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomButtonChild default not disabled.');
  testDisabled(pdomButtonChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomButtonChild default not disabled with dag.', 1);
  display.interactive = false;
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild turned disabled.');
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild turned disabled with dag.', 1);
  pdomButtonChild.setPDOMAttribute('disabled', true, {
    asProperty: true
  });
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild turned disabled set property too.');
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild turned disabled set property too, with dag.', 1);
  display.interactive = true;
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild turned not disabled set property too.');
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild turned not disabled set property too, with dag.', 1);
  display.interactive = false;
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild turned disabled again.');
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild turned disabled again, with dag.', 1);
  pdomButtonChild.removePDOMAttribute('disabled');
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild remove disabled while not interactive.');
  testDisabled(pdomButtonChild, DISABLED_TRUE, 'pdomButtonChild remove disabled while not interactive, with dag.', 1);
  display.interactive = true;
  testDisabled(pdomButtonChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomButtonChild default not disabled after interactive again.');
  testDisabled(pdomButtonChild, DEFAULT_DISABLED_WHEN_SUPPORTED, 'pdomButtonChild default not disabled after interactive again with dag.', 1);
  display.dispose();
  display.domElement.parentElement.removeChild(display.domElement);
});

// these fuzzers take time, so it is nice when they are last
QUnit.test('PDOMFuzzer with 3 nodes', assert => {
  const fuzzer = new PDOMFuzzer(3, false);
  for (let i = 0; i < 5000; i++) {
    fuzzer.step();
  }
  assert.expect(0);
  fuzzer.dispose();
});
QUnit.test('PDOMFuzzer with 4 nodes', assert => {
  const fuzzer = new PDOMFuzzer(4, false);
  for (let i = 0; i < 1000; i++) {
    fuzzer.step();
  }
  assert.expect(0);
  fuzzer.dispose();
});
QUnit.test('PDOMFuzzer with 5 nodes', assert => {
  const fuzzer = new PDOMFuzzer(5, false);
  for (let i = 0; i < 300; i++) {
    fuzzer.step();
  }
  assert.expect(0);
  fuzzer.dispose();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaXNwbGF5IiwiQ2lyY2xlIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlBET01GdXp6ZXIiLCJQRE9NUGVlciIsIlBET01VdGlscyIsIlRFU1RfSU5ORVJfQ09OVEVOVCIsIlRFU1RfTEFCRUwiLCJURVNUX0xBQkVMXzIiLCJURVNUX0RFU0NSSVBUSU9OIiwiVEVTVF9MQUJFTF9IVE1MIiwiVEVTVF9MQUJFTF9IVE1MXzIiLCJURVNUX0RFU0NSSVBUSU9OX0hUTUwiLCJURVNUX0RFU0NSSVBUSU9OX0hUTUxfMiIsIlRFU1RfQ0xBU1NfT05FIiwiVEVTVF9DTEFTU19UV08iLCJERUZBVUxUX0xBQkVMX1RBR19OQU1FIiwiREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRSIsIkRFRkFVTFRfTEFCRUxfU0lCTElOR19JTkRFWCIsIkRFRkFVTFRfREVTQ1JJUFRJT05fU0lCTElOR19JTkRFWCIsIkFQUEVOREVEX0RFU0NSSVBUSU9OX1NJQkxJTkdfSU5ERVgiLCJURVNUX0hJR0hMSUdIVCIsImZvY3VzSGlnaGxpZ2h0IiwiUVVuaXQiLCJtb2R1bGUiLCJnZXRQRE9NUGVlckJ5Tm9kZSIsIm5vZGUiLCJwZG9tSW5zdGFuY2VzIiwibGVuZ3RoIiwiRXJyb3IiLCJwZWVyIiwiZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlIiwidW5pcXVlUGVlciIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJwcmltYXJ5U2libGluZyIsImlkIiwicGRvbUF1ZGl0Um9vdE5vZGUiLCJyb290Tm9kZSIsInBkb21BdWRpdCIsInRlc3QiLCJhc3NlcnQiLCJ0YWdOYW1lIiwiZGlzcGxheSIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImRvbUVsZW1lbnQiLCJhIiwiaW5uZXJDb250ZW50IiwiYWRkQ2hpbGQiLCJhRWxlbWVudCIsIm9rIiwicGFyZW50RWxlbWVudCIsImNoaWxkTm9kZXMiLCJ0ZXh0Q29udGVudCIsImlubmVySFRNTCIsImIiLCJpbnB1dFR5cGUiLCJ3aW5kb3ciLCJ0aHJvd3MiLCJkaXNwb3NlIiwicmVtb3ZlQ2hpbGQiLCJjb250YWluZXJQYXJlbnQiLCJjaGlsZHJlbiIsImNvbnRhaW5lclRhZ05hbWUiLCJpbmNsdWRlcyIsImxhYmVsQ29udGVudCIsImxhYmVsU2libGluZyIsIm5ld0FFbGVtZW50IiwibmV3TGFiZWxTaWJsaW5nIiwibGFiZWxUYWdOYW1lIiwiYkxhYmVsRWxlbWVudCIsImdldEF0dHJpYnV0ZSIsImMiLCJjTGFiZWxFbGVtZW50IiwiZCIsImJFbGVtZW50IiwiY1BlZXIiLCJkUGVlciIsImNvbmZpcm1PcmlnaW5hbE9yZGVyIiwiZSIsImRlc2NyaXB0aW9uQ29udGVudCIsImVQZWVyIiwiY29uZmlybU9yaWdpbmFsV2l0aEUiLCJkZXNjcmlwdGlvblNpYmxpbmciLCJkZXNjcmlwdGlvblRhZ05hbWUiLCJidXR0b25Ob2RlIiwiZm9jdXNhYmxlIiwiYXJpYVJvbGUiLCJkaXZOb2RlIiwiYXJpYUxhYmVsIiwicGRvbVZpc2libGUiLCJ0b1VwcGVyQ2FzZSIsImVxdWFsIiwiYnV0dG9uRWxlbWVudCIsImJ1dHRvblBhcmVudCIsInBhcmVudE5vZGUiLCJidXR0b25QZWVycyIsImJ1dHRvbkxhYmVsIiwiYnV0dG9uRGVzY3JpcHRpb24iLCJkaXZFbGVtZW50IiwicERlc2NyaXB0aW9uIiwidGFiSW5kZXgiLCJoaWRkZW4iLCJ0ZXN0QXNzb2NpYXRpb25BdHRyaWJ1dGUiLCJhdHRyaWJ1dGUiLCJhZGRBc3NvY2lhdGlvbkZ1bmN0aW9uIiwic2V0UERPTUF0dHJpYnV0ZSIsIm90aGVyTm9kZSIsInRoaXNFbGVtZW50TmFtZSIsIlBSSU1BUllfU0lCTElORyIsIm90aGVyRWxlbWVudE5hbWUiLCJjRWxlbWVudCIsImV4cGVjdGVkVmFsdWUiLCJqb2luIiwib2xkVmFsdWUiLCJDT05UQUlORVJfUEFSRU5UIiwiREVTQ1JJUFRJT05fU0lCTElORyIsImJQYXJlbnRDb250YWluZXIiLCJkRGVzY3JpcHRpb25FbGVtZW50IiwiZiIsImciLCJoIiwiZUVsZW1lbnQiLCJmRWxlbWVudCIsImdFbGVtZW50IiwiaEVsZW1lbnQiLCJqIiwiTEFCRUxfU0lCTElORyIsImNoZWNrT25Zb3VyT3duQXNzb2NpYXRpb25zIiwiaW5zdGFuY2UiLCJub2RlUHJpbWFyeUVsZW1lbnQiLCJub2RlUGFyZW50IiwiZ2V0VW5pcXVlSWRTdHJpbmdGb3JTaWJsaW5nIiwic2libGluZ1N0cmluZyIsImdldEVsZW1lbnRJZCIsImdldFBET01JbnN0YW5jZVVuaXF1ZUlkIiwiayIsInRlc3RLIiwia1ZhbHVlIiwiaklEIiwialBhcmVudCIsImpQYXJlbnQyIiwiaW5zZXJ0Q2hpbGQiLCJ0ZXN0QXNzb2NpYXRpb25BdHRyaWJ1dGVCeVNldHRlcnMiLCJhc3NvY2lhdGlvbnNBcnJheU5hbWUiLCJhc3NvY2lhdGlvblJlbW92YWxGdW5jdGlvbiIsIm9wdGlvbnMiLCJuIiwibyIsIm5QZWVyIiwib0VsZW1lbnQiLCJwZG9tSW5zdGFuY2UiLCJyYW5kb21Bc3NvY2lhdGlvbk9iamVjdCIsIm0iLCJfIiwiaXNFcXVhbCIsInNwbGljZSIsImluZGV4T2YiLCJhMSIsImExRWxlbWVudCIsImFwcGVuZExhYmVsIiwiYXBwZW5kRGVzY3JpcHRpb24iLCJuZXdCdXR0b25QZWVycyIsImVsZW1lbnRJbkRvbSIsImluaXRpYWxMZW5ndGgiLCJnZXRQRE9NQXR0cmlidXRlcyIsImhhc1BET01BdHRyaWJ1dGUiLCJyZW1vdmVQRE9NQXR0cmlidXRlIiwiYXNQcm9wZXJ0eSIsInNldFBET01DbGFzcyIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwicmVtb3ZlUERPTUNsYXNzIiwidXRpbCIsInJvb3RFbGVtZW50IiwiZEVsZW1lbnQiLCJmb2N1cyIsImFjdGl2ZUVsZW1lbnQiLCJnZXROZXh0Rm9jdXNhYmxlIiwiZ2V0UHJldmlvdXNGb2N1c2FibGUiLCJyZW1vdmVBbGxDaGlsZHJlbiIsInJvb3RET01FbGVtZW50IiwiZERPTUVsZW1lbnQiLCJpbnN0YW5jZXMiLCJpbml0aWFsaXplRXZlbnRzIiwidGVzdE5vZGUiLCJpbml0SW5kZXgiLCJpbmRleE9mQ2hpbGQiLCJyZXBsYWNlQ2hpbGQiLCJhZnRlckluZGV4IiwiaGFzQ2hpbGQiLCJmb2N1c2VkIiwiYmx1ciIsImRpdkEiLCJidXR0b25CIiwiZGl2RSIsImJ1dHRvbkcxIiwiYnV0dG9uRzIiLCJkaXZBQ2hpbGRyZW4iLCJkaXZFQ2hpbGRyZW4iLCJ2aXNpYmxlIiwicGRvbURpc3BsYXllZCIsImlzUERPTVZpc2libGUiLCJpbnB1dFZhbHVlIiwiZGlmZmVyZW50VmFsdWUiLCJhcmlhVmFsdWVUZXh0IiwiZWxlbWVudE5hbWUiLCJ0ZXN0Qm90aEF0dHJpYnV0ZXMiLCJhTGFiZWxFbGVtZW50IiwicmVtb3ZlUERPTUF0dHJpYnV0ZXMiLCJhdHRyaWJ1dGVOYW1lIiwidGVzdEF0dHJpYnV0ZXMiLCJmaWx0ZXIiLCJwZG9tQ2hlY2tlZCIsImNoZWNrZWQiLCJzd2FwVmlzaWJpbGl0eSIsImJ1dHRvbkEiLCJoYXNBdHRyaWJ1dGUiLCJjb250YWluZXJFbGVtZW50IiwicGVlckVsZW1lbnRzIiwiYlBlZXIiLCJiRWxlbWVudFBhcmVudCIsImluZGV4T2ZQcmltYXJ5RWxlbWVudCIsIkFycmF5IiwicHJvdG90eXBlIiwiY2FsbCIsImNvbnRhaW5lckFyaWFSb2xlIiwiYWNjZXNzaWJsZU5hbWUiLCJiUGFyZW50IiwiYkxhYmVsU2libGluZyIsImNBY2Nlc3NpYmxlTmFtZUJlaGF2aW9yIiwiYWNjZXNzaWJsZU5hbWVCZWhhdmlvciIsImRBY2Nlc3NpYmxlTmFtZUJlaGF2aW9yIiwiZExhYmVsRWxlbWVudCIsImFjY2Vzc2libGVOYW1lRGVzY3JpcHRpb24iLCJwZG9tSGVhZGluZyIsImFMYWJlbFNpYmxpbmciLCJoZWxwVGV4dCIsImFEZXNjcmlwdGlvbkVsZW1lbnQiLCJoZWxwVGV4dEJlaGF2aW9yIiwiYkRlc2NyaXB0aW9uRWxlbWVudCIsIm1vdmVUb0Zyb250IiwibW92ZVRvQmFjayIsInBkb21Ob2RlIiwiZW5hYmxlZCIsInBkb21SYW5nZUNoaWxkIiwicGRvbVBhcmFncmFwaENoaWxkIiwicGRvbUJ1dHRvbkNoaWxkIiwicGRvbVBhcmVudCIsIkRJU0FCTEVEX1RSVUUiLCJERUZBVUxUX0RJU0FCTEVEX1dIRU5fU1VQUE9SVEVEIiwiREVGQVVMVF9ESVNBQkxFRF9XSEVOX05PVF9TVVBQT1JURUQiLCJ1bmRlZmluZWQiLCJ0ZXN0RGlzYWJsZWQiLCJkaXNhYmxlZCIsIm1lc3NhZ2UiLCJpbnRlcmFjdGl2ZSIsImNvbnRhaW5lck9mREFHQnV0dG9uIiwiZnV6emVyIiwiaSIsInN0ZXAiLCJleHBlY3QiXSwic291cmNlcyI6WyJQYXJhbGxlbERPTVRlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBhcmFsbGVsRE9NIHRlc3RzXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IERpc3BsYXkgZnJvbSAnLi4vLi4vZGlzcGxheS9EaXNwbGF5LmpzJztcclxuaW1wb3J0IENpcmNsZSBmcm9tICcuLi8uLi9ub2Rlcy9DaXJjbGUuanMnO1xyXG5pbXBvcnQgTm9kZSBmcm9tICcuLi8uLi9ub2Rlcy9Ob2RlLmpzJztcclxuaW1wb3J0IFJlY3RhbmdsZSBmcm9tICcuLi8uLi9ub2Rlcy9SZWN0YW5nbGUuanMnO1xyXG5pbXBvcnQgUERPTUZ1enplciBmcm9tICcuL1BET01GdXp6ZXIuanMnO1xyXG5pbXBvcnQgUERPTVBlZXIgZnJvbSAnLi9QRE9NUGVlci5qcyc7XHJcbmltcG9ydCBQRE9NVXRpbHMgZnJvbSAnLi9QRE9NVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBQYXJhbGxlbERPTU9wdGlvbnMsIFBET01CZWhhdmlvckZ1bmN0aW9uIH0gZnJvbSAnLi9QYXJhbGxlbERPTS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgVEVTVF9JTk5FUl9DT05URU5UID0gJ1Rlc3QgSW5uZXIgQ29udGVudCBIZXJlIHBsZWFzZV4mKi4gVGhhbmtzIHlvdSBzbyB2ZXJ5IG11Y2hvLic7XHJcbmNvbnN0IFRFU1RfTEFCRUwgPSAnVGVzdCBsYWJlbCc7XHJcbmNvbnN0IFRFU1RfTEFCRUxfMiA9ICdUZXN0IGxhYmVsIDInO1xyXG5jb25zdCBURVNUX0RFU0NSSVBUSU9OID0gJ1Rlc3QgZGVzY3JpcHRpb24nO1xyXG5jb25zdCBURVNUX0xBQkVMX0hUTUwgPSAnPHN0cm9uZz5JIFJPQ0sgYXMgYSBMQUJFTDwvc3Ryb25nPic7XHJcbmNvbnN0IFRFU1RfTEFCRUxfSFRNTF8yID0gJzxzdHJvbmc+SSBST0NLIGFzIGEgTEFCRUwgMjwvc3Ryb25nPic7XHJcbmNvbnN0IFRFU1RfREVTQ1JJUFRJT05fSFRNTCA9ICc8c3Ryb25nPkkgUk9DSyBhcyBhIERFU0NSSVBUSU9OPC9zdHJvbmc+JztcclxuY29uc3QgVEVTVF9ERVNDUklQVElPTl9IVE1MXzIgPSAnPHN0cm9uZz5JIFJPQ0sgYXMgYSBERVNDUklQVElPTiAyPC9zdHJvbmc+JztcclxuY29uc3QgVEVTVF9DTEFTU19PTkUgPSAndGVzdC1jbGFzcy1vbmUnO1xyXG5jb25zdCBURVNUX0NMQVNTX1RXTyA9ICd0ZXN0LWNsYXNzLXR3byc7XHJcblxyXG4vLyBUaGVzZSBzaG91bGQgbWFudWFsbHkgbWF0Y2ggdGhlIGRlZmF1bHRzIGluIHRoZSBQYXJhbGxlbERPTS5qcyB0cmFpdFxyXG5jb25zdCBERUZBVUxUX0xBQkVMX1RBR19OQU1FID0gUERPTVV0aWxzLkRFRkFVTFRfTEFCRUxfVEFHX05BTUU7XHJcbmNvbnN0IERFRkFVTFRfREVTQ1JJUFRJT05fVEFHX05BTUUgPSBQRE9NVXRpbHMuREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRTtcclxuXHJcbi8vIGdpdmVuIHRoZSBwYXJlbnQgY29udGFpbmVyIGVsZW1lbnQgZm9yIGEgbm9kZSwgdGhpcyB2YWx1ZSBpcyB0aGUgaW5kZXggb2YgdGhlIGxhYmVsIHNpYmxpbmcgaW4gdGhlXHJcbi8vIHBhcmVudCdzIGFycmF5IG9mIGNoaWxkcmVuIEhUTUxFbGVtZW50cy5cclxuY29uc3QgREVGQVVMVF9MQUJFTF9TSUJMSU5HX0lOREVYID0gMDtcclxuY29uc3QgREVGQVVMVF9ERVNDUklQVElPTl9TSUJMSU5HX0lOREVYID0gMTtcclxuY29uc3QgQVBQRU5ERURfREVTQ1JJUFRJT05fU0lCTElOR19JTkRFWCA9IDI7XHJcblxyXG4vLyBhIGZvY3VzIGhpZ2hsaWdodCBmb3IgdGVzdGluZywgc2luY2UgZHVtbXkgbm9kZXMgdGVuZCB0byBoYXZlIG5vIGJvdW5kc1xyXG5jb25zdCBURVNUX0hJR0hMSUdIVCA9IG5ldyBDaXJjbGUoIDUgKTtcclxuXHJcbi8vIGEgY3VzdG9tIGZvY3VzIGhpZ2hsaWdodCAoc2luY2UgZHVtbXkgbm9kZSdzIGhhdmUgbm8gYm91bmRzKVxyXG5jb25zdCBmb2N1c0hpZ2hsaWdodCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwLCAxMCApO1xyXG5cclxuUVVuaXQubW9kdWxlKCAnUGFyYWxsZWxET01UZXN0cycgKTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgYSB1bmlxdWUgUERPTVBlZXIgZnJvbSBhIG5vZGUgd2l0aCBhY2Nlc3NpYmxlIGNvbnRlbnQuIFdpbGwgZXJyb3IgaWYgdGhlIG5vZGUgaGFzIG11bHRpcGxlIGluc3RhbmNlc1xyXG4gKiBvciBpZiB0aGUgbm9kZSBoYXNuJ3QgYmVlbiBhdHRhY2hlZCB0byBhIGRpc3BsYXkgKGFuZCB0aGVyZWZvcmUgaGFzIG5vIGFjY2Vzc2libGUgY29udGVudCkuXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRQRE9NUGVlckJ5Tm9kZSggbm9kZTogTm9kZSApOiBQRE9NUGVlciB7XHJcbiAgaWYgKCBub2RlLnBkb21JbnN0YW5jZXMubGVuZ3RoID09PSAwICkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnTm8gcGRvbUluc3RhbmNlcy4gV2FzIHlvdXIgbm9kZSBhZGRlZCB0byB0aGUgc2NlbmUgZ3JhcGg/JyApO1xyXG4gIH1cclxuXHJcbiAgZWxzZSBpZiAoIG5vZGUucGRvbUluc3RhbmNlcy5sZW5ndGggPiAxICkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnVGhlcmUgc2hvdWxkIG9uZSBhbmQgb25seSBvbmUgYWNjZXNzaWJsZSBpbnN0YW5jZSBmb3IgdGhlIG5vZGUnICk7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCAhbm9kZS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciApIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ3Bkb21JbnN0YW5jZVxcJ3MgcGVlciBzaG91bGQgZXhpc3QuJyApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG5vZGUucGRvbUluc3RhbmNlc1sgMCBdLnBlZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIGlkIG9mIGEgZG9tIGVsZW1lbnQgcmVwcmVzZW50aW5nIGEgbm9kZSBpbiB0aGUgRE9NLiAgVGhlIGFjY2Vzc2libGUgY29udGVudCBtdXN0IGV4aXN0IGFuZCBiZSB1bmlxdWUsXHJcbiAqIHRoZXJlIHNob3VsZCBvbmx5IGJlIG9uZSBhY2Nlc3NpYmxlIGluc3RhbmNlIGFuZCBvbmUgZG9tIGVsZW1lbnQgZm9yIHRoZSBub2RlLlxyXG4gKlxyXG4gKiBOT1RFOiBCZSBjYXJlZnVsIGFib3V0IGdldHRpbmcgcmVmZXJlbmNlcyB0byBkb20gRWxlbWVudHMsIHRoZSByZWZlcmVuY2Ugd2lsbCBiZSBzdGFsZSBlYWNoIHRpbWVcclxuICogdGhlIHZpZXcgKFBET01QZWVyKSBpcyByZWRyYXduLCB3aGljaCBpcyBxdWl0ZSBvZnRlbiB3aGVuIHNldHRpbmcgb3B0aW9ucy5cclxuICovXHJcbmZ1bmN0aW9uIGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggbm9kZTogTm9kZSApOiBIVE1MRWxlbWVudCB7XHJcbiAgY29uc3QgdW5pcXVlUGVlciA9IGdldFBET01QZWVyQnlOb2RlKCBub2RlICk7XHJcbiAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCB1bmlxdWVQZWVyLnByaW1hcnlTaWJsaW5nIS5pZCApITtcclxufVxyXG5cclxuLyoqXHJcbiAqIEF1ZGl0IHRoZSByb290IG5vZGUgZm9yIGFjY2Vzc2libGUgY29udGVudCB3aXRoaW4gYSB0ZXN0LCB0byBtYWtlIHN1cmUgdGhhdCBjb250ZW50IGlzIGFjY2Vzc2libGUgYXMgd2UgZXhwZWN0LFxyXG4gKiBhbmQgc28gdGhhdCBvdXIgcGRvbUF1ZGl0IGZ1bmN0aW9uIG1heSBjYXRjaCB0aGluZ3MgdGhhdCBoYXZlIGdvbmUgd3JvbmcuXHJcbiAqIEBwYXJhbSByb290Tm9kZSAtIHRoZSByb290IE5vZGUgYXR0YWNoZWQgdG8gdGhlIERpc3BsYXkgYmVpbmcgdGVzdGVkXHJcbiAqL1xyXG5mdW5jdGlvbiBwZG9tQXVkaXRSb290Tm9kZSggcm9vdE5vZGU6IE5vZGUgKTogdm9pZCB7XHJcbiAgcm9vdE5vZGUucGRvbUF1ZGl0KCk7XHJcbn1cclxuXHJcblFVbml0LnRlc3QoICd0YWdOYW1lL2lubmVyQ29udGVudCBvcHRpb25zJywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgLy8gdGVzdCB0aGUgYmVoYXZpb3Igb2Ygc3dhcFZpc2liaWxpdHkgZnVuY3Rpb25cclxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcclxuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxuICAvLyBjcmVhdGUgc29tZSBub2RlcyBmb3IgdGVzdGluZ1xyXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnYnV0dG9uJywgaW5uZXJDb250ZW50OiBURVNUX0xBQkVMIH0gKTtcclxuXHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcclxuXHJcbiAgY29uc3QgYUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKTtcclxuICBhc3NlcnQub2soIGEucGRvbUluc3RhbmNlcy5sZW5ndGggPT09IDEsICdvbmx5IDEgaW5zdGFuY2UnICk7XHJcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5wYXJlbnRFbGVtZW50IS5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMSwgJ3BhcmVudCBjb250YWlucyBvbmUgcHJpbWFyeSBzaWJsaW5ncycgKTtcclxuICBhc3NlcnQub2soIGFFbGVtZW50LnRhZ05hbWUgPT09ICdCVVRUT04nLCAnZGVmYXVsdCBsYWJlbCB0YWdOYW1lJyApO1xyXG4gIGFzc2VydC5vayggYUVsZW1lbnQudGV4dENvbnRlbnQgPT09IFRFU1RfTEFCRUwsICdubyBodG1sIHNob3VsZCB1c2UgdGV4dENvbnRlbnQnICk7XHJcblxyXG4gIGEuaW5uZXJDb250ZW50ID0gVEVTVF9MQUJFTF9IVE1MO1xyXG4gIGFzc2VydC5vayggYUVsZW1lbnQuaW5uZXJIVE1MID09PSBURVNUX0xBQkVMX0hUTUwsICdodG1sIGxhYmVsIHNob3VsZCB1c2UgaW5uZXJIVE1MJyApO1xyXG5cclxuICBhLmlubmVyQ29udGVudCA9IFRFU1RfTEFCRUxfSFRNTF8yO1xyXG4gIGFzc2VydC5vayggYUVsZW1lbnQuaW5uZXJIVE1MID09PSBURVNUX0xBQkVMX0hUTUxfMiwgJ2h0bWwgbGFiZWwgc2hvdWxkIHVzZSBpbm5lckhUTUwsIG92ZXJ3cml0ZSBmcm9tIGh0bWwnICk7XHJcblxyXG4gIGEuaW5uZXJDb250ZW50ID0gbnVsbDtcclxuICBhc3NlcnQub2soIGFFbGVtZW50LmlubmVySFRNTCA9PT0gJycsICdpbm5lckhUTUwgc2hvdWxkIGJlIGVtcHR5IGFmdGVyIGNsZWFyaW5nIGlubmVyQ29udGVudCcgKTtcclxuXHJcbiAgYS50YWdOYW1lID0gbnVsbDtcclxuICBhc3NlcnQub2soIGEucGRvbUluc3RhbmNlcy5sZW5ndGggPT09IDAsICdzZXQgdG8gbnVsbCBzaG91bGQgY2xlYXIgYWNjZXNzaWJsZSBpbnN0YW5jZXMnICk7XHJcblxyXG4gIC8vIG1ha2Ugc3VyZSB0aGF0IG5vIGVycm9ycyB3aGVuIHNldHRpbmcgaW5uZXJDb250ZW50IHdpdGggdGFnTmFtZSBudWxsLlxyXG4gIGEuaW5uZXJDb250ZW50ID0gJ2hlbGxvJztcclxuXHJcbiAgYS50YWdOYW1lID0gJ2J1dHRvbic7XHJcbiAgYS5pbm5lckNvbnRlbnQgPSBURVNUX0xBQkVMX0hUTUxfMjtcclxuICBhc3NlcnQub2soIGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApLmlubmVySFRNTCA9PT0gVEVTVF9MQUJFTF9IVE1MXzIsICdpbm5lckNvbnRlbnQgbm90IGNsZWFyZWQgd2hlbiB0YWdOYW1lIHNldCB0byBudWxsLicgKTtcclxuXHJcbiAgLy8gdmVyaWZ5IHRoYXQgc2V0dGluZyBpbm5lciBjb250ZW50IG9uIGFuIGlucHV0IGlzIG5vdCBhbGxvd2VkXHJcbiAgY29uc3QgYiA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdpbnB1dCcsIGlucHV0VHlwZTogJ3JhbmdlJyB9ICk7XHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGIgKTtcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgIGIuaW5uZXJDb250ZW50ID0gJ3RoaXMgc2hvdWxkIGZhaWwnO1xyXG4gIH0sIC8uKi8sICdjYW5ub3Qgc2V0IGlubmVyIGNvbnRlbnQgb24gaW5wdXQnICk7XHJcblxyXG4gIC8vIG5vdyB0aGF0IGl0IGlzIGEgZGl2LCBpbm5lckNvbnRlbnQgaXMgYWxsb3dlZFxyXG4gIGIudGFnTmFtZSA9ICdkaXYnO1xyXG4gIGFzc2VydC5vayggYi50YWdOYW1lID09PSAnZGl2JywgJ2V4cGVjdCB0YWdOYW1lIHNldHRlciB0byB3b3JrLicgKTtcclxuICBiLmlubmVyQ29udGVudCA9IFRFU1RfTEFCRUw7XHJcbiAgYXNzZXJ0Lm9rKCBiLmlubmVyQ29udGVudCA9PT0gVEVTVF9MQUJFTCwgJ2lubmVyIGNvbnRlbnQgYWxsb3dlZCcgKTtcclxuXHJcbiAgLy8gcmV2ZXJ0IHRhZyBuYW1lIHRvIGlucHV0LCBzaG91bGQgdGhyb3cgYW4gZXJyb3JcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgIGIudGFnTmFtZSA9ICdpbnB1dCc7XHJcbiAgfSwgLy4qLywgJ2Vycm9yIHRocm93biBhZnRlciBzZXR0aW5nIHRhZ05hbWUgdG8gaW5wdXQgb24gTm9kZSB3aXRoIGlubmVyQ29udGVudC4nICk7XHJcblxyXG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xyXG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XHJcbn0gKTtcclxuXHJcblxyXG5RVW5pdC50ZXN0KCAnY29udGFpbmVyVGFnTmFtZSBvcHRpb24nLCBhc3NlcnQgPT4ge1xyXG5cclxuICAvLyB0ZXN0IHRoZSBiZWhhdmlvciBvZiBzd2FwVmlzaWJpbGl0eSBmdW5jdGlvblxyXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xyXG4gIHZhciBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdmFyXHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XHJcblxyXG4gIC8vIGNyZWF0ZSBzb21lIG5vZGVzIGZvciB0ZXN0aW5nXHJcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdidXR0b24nIH0gKTtcclxuXHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcclxuICBhc3NlcnQub2soIGEucGRvbUluc3RhbmNlcy5sZW5ndGggPT09IDEsICdvbmx5IDEgaW5zdGFuY2UnICk7XHJcbiAgYXNzZXJ0Lm9rKCBhLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5jb250YWluZXJQYXJlbnQgPT09IG51bGwsICdubyBjb250YWluZXIgcGFyZW50IGZvciBqdXN0IGJ1dHRvbicgKTtcclxuICBhc3NlcnQub2soIHJvb3ROb2RlWyAnX3Bkb21JbnN0YW5jZXMnIF1bIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZyEuY2hpbGRyZW5bIDAgXSA9PT0gYVsgJ19wZG9tSW5zdGFuY2VzJyBdWyAwIF0ucGVlciEucHJpbWFyeVNpYmxpbmchLFxyXG4gICAgJ3Jvb3ROb2RlIHBlZXIgc2hvdWxkIGhvbGQgbm9kZSBhXFwncyBwZWVyIGluIHRoZSBQRE9NJyApO1xyXG5cclxuICBhLmNvbnRhaW5lclRhZ05hbWUgPSAnZGl2JztcclxuXHJcbiAgYXNzZXJ0Lm9rKCBhLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5jb250YWluZXJQYXJlbnQhLmlkLmluY2x1ZGVzKCAnY29udGFpbmVyJyApLCAnY29udGFpbmVyIHBhcmVudCBpcyBkaXYgaWYgc3BlY2lmaWVkJyApO1xyXG4gIGFzc2VydC5vayggcm9vdE5vZGVbICdfcGRvbUluc3RhbmNlcycgXVsgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nIS5jaGlsZHJlblsgMCBdID09PSBhWyAnX3Bkb21JbnN0YW5jZXMnIF1bIDAgXS5wZWVyIS5jb250YWluZXJQYXJlbnQhLFxyXG4gICAgJ2NvbnRhaW5lciBwYXJlbnQgaXMgZGl2IGlmIHNwZWNpZmllZCcgKTtcclxuXHJcbiAgYS5jb250YWluZXJUYWdOYW1lID0gbnVsbDtcclxuXHJcbiAgYXNzZXJ0Lm9rKCAhYS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciEuY29udGFpbmVyUGFyZW50ISwgJ2NvbnRhaW5lciBwYXJlbnQgaXMgY2xlYXJlZCBpZiBzcGVjaWZpZWQnICk7XHJcbiAgZGlzcGxheS5kaXNwb3NlKCk7XHJcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ2xhYmVsVGFnTmFtZS9sYWJlbENvbnRlbnQgb3B0aW9uJywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgLy8gdGVzdCB0aGUgYmVoYXZpb3Igb2Ygc3dhcFZpc2liaWxpdHkgZnVuY3Rpb25cclxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcclxuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxuICAvLyBjcmVhdGUgc29tZSBub2RlcyBmb3IgdGVzdGluZ1xyXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnYnV0dG9uJywgbGFiZWxDb250ZW50OiBURVNUX0xBQkVMIH0gKTtcclxuXHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcclxuXHJcbiAgY29uc3QgYUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKTtcclxuICBjb25zdCBsYWJlbFNpYmxpbmcgPSBhRWxlbWVudC5wYXJlbnRFbGVtZW50IS5jaGlsZE5vZGVzWyAwIF0gYXMgSFRNTEVsZW1lbnQ7XHJcbiAgYXNzZXJ0Lm9rKCBhLnBkb21JbnN0YW5jZXMubGVuZ3RoID09PSAxLCAnb25seSAxIGluc3RhbmNlJyApO1xyXG4gIGFzc2VydC5vayggYUVsZW1lbnQucGFyZW50RWxlbWVudCEuY2hpbGROb2Rlcy5sZW5ndGggPT09IDIsICdwYXJlbnQgY29udGFpbnMgdHdvIHNpYmxpbmdzJyApO1xyXG4gIGFzc2VydC5vayggbGFiZWxTaWJsaW5nLnRhZ05hbWUgPT09IERFRkFVTFRfTEFCRUxfVEFHX05BTUUsICdkZWZhdWx0IGxhYmVsIHRhZ05hbWUnICk7XHJcbiAgYXNzZXJ0Lm9rKCBsYWJlbFNpYmxpbmcudGV4dENvbnRlbnQgPT09IFRFU1RfTEFCRUwsICdubyBodG1sIHNob3VsZCB1c2UgdGV4dENvbnRlbnQnICk7XHJcblxyXG4gIGEubGFiZWxDb250ZW50ID0gVEVTVF9MQUJFTF9IVE1MO1xyXG4gIGFzc2VydC5vayggbGFiZWxTaWJsaW5nLmlubmVySFRNTCA9PT0gVEVTVF9MQUJFTF9IVE1MLCAnaHRtbCBsYWJlbCBzaG91bGQgdXNlIGlubmVySFRNTCcgKTtcclxuXHJcbiAgYS5sYWJlbENvbnRlbnQgPSBudWxsO1xyXG4gIGFzc2VydC5vayggbGFiZWxTaWJsaW5nLmlubmVySFRNTCA9PT0gJycsICdsYWJlbCBjb250ZW50IHNob3VsZCBiZSBlbXB0eSBhZnRlciBzZXR0aW5nIHRvIG51bGwnICk7XHJcblxyXG4gIGEubGFiZWxDb250ZW50ID0gVEVTVF9MQUJFTF9IVE1MXzI7XHJcbiAgYXNzZXJ0Lm9rKCBsYWJlbFNpYmxpbmcuaW5uZXJIVE1MID09PSBURVNUX0xBQkVMX0hUTUxfMiwgJ2h0bWwgbGFiZWwgc2hvdWxkIHVzZSBpbm5lckhUTUwsIG92ZXJ3cml0ZSBmcm9tIGh0bWwnICk7XHJcblxyXG4gIGEudGFnTmFtZSA9ICdkaXYnO1xyXG5cclxuICBjb25zdCBuZXdBRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApO1xyXG4gIGNvbnN0IG5ld0xhYmVsU2libGluZyA9IG5ld0FFbGVtZW50LnBhcmVudEVsZW1lbnQhLmNoaWxkTm9kZXNbIDAgXSBhcyBIVE1MRWxlbWVudDtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBuZXdMYWJlbFNpYmxpbmcuaW5uZXJIVE1MID09PSBURVNUX0xBQkVMX0hUTUxfMiwgJ3RhZ05hbWUgaW5kZXBlbmRlbnQgb2Y6IGh0bWwgbGFiZWwgc2hvdWxkIHVzZSBpbm5lckhUTUwsIG92ZXJ3cml0ZSBmcm9tIGh0bWwnICk7XHJcblxyXG4gIGEubGFiZWxUYWdOYW1lID0gbnVsbDtcclxuXHJcbiAgLy8gbWFrZSBzdXJlIGxhYmVsIHdhcyBjbGVhcmVkIGZyb20gUERPTVxyXG4gIGFzc2VydC5vayggZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICkucGFyZW50RWxlbWVudCEuY2hpbGROb2Rlcy5sZW5ndGggPT09IDEsXHJcbiAgICAnT25seSBvbmUgZWxlbWVudCBhZnRlciBjbGVhcmluZyBsYWJlbCcgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBhLmxhYmVsQ29udGVudCA9PT0gVEVTVF9MQUJFTF9IVE1MXzIsICdjbGVhcmluZyBsYWJlbFRhZ05hbWUgc2hvdWxkIG5vdCBjaGFuZ2UgY29udGVudCwgZXZlbiAgdGhvdWdoIGl0IGlzIG5vdCBkaXNwbGF5ZWQnICk7XHJcblxyXG4gIGEubGFiZWxUYWdOYW1lID0gJ3AnO1xyXG4gIGFzc2VydC5vayggYS5sYWJlbFRhZ05hbWUgPT09ICdwJywgJ2V4cGVjdCBsYWJlbFRhZ05hbWUgc2V0dGVyIHRvIHdvcmsuJyApO1xyXG5cclxuICBjb25zdCBiID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ3AnLCBsYWJlbENvbnRlbnQ6ICdJIGFtIGdyb290JyB9ICk7XHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGIgKTtcclxuICBsZXQgYkxhYmVsRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBiLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5sYWJlbFNpYmxpbmchLmlkICkhO1xyXG4gIGFzc2VydC5vayggIWJMYWJlbEVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnZm9yJyApLCAnZm9yIGF0dHJpYnV0ZSBzaG91bGQgbm90IGJlIG9uIG5vbiBsYWJlbCBsYWJlbCBzaWJsaW5nLicgKTtcclxuICBiLmxhYmVsVGFnTmFtZSA9ICdsYWJlbCc7XHJcbiAgYkxhYmVsRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBiLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5sYWJlbFNpYmxpbmchLmlkICkhO1xyXG4gIGFzc2VydC5vayggYkxhYmVsRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdmb3InICkgIT09IG51bGwsICdmb3IgYXR0cmlidXRlIHNob3VsZCBiZSBvbiBcImxhYmVsXCIgdGFnIGZvciBsYWJlbCBzaWJsaW5nLicgKTtcclxuXHJcbiAgY29uc3QgYyA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdwJyB9ICk7XHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGMgKTtcclxuICBjLmxhYmVsVGFnTmFtZSA9ICdsYWJlbCc7XHJcbiAgYy5sYWJlbENvbnRlbnQgPSBURVNUX0xBQkVMO1xyXG4gIGNvbnN0IGNMYWJlbEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggYy5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciEubGFiZWxTaWJsaW5nIS5pZCApITtcclxuICBhc3NlcnQub2soIGNMYWJlbEVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnZm9yJyApICE9PSBudWxsLCAnb3JkZXIgc2hvdWxkIG5vdCBtYXR0ZXInICk7XHJcbiAgZGlzcGxheS5kaXNwb3NlKCk7XHJcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdjb250YWluZXIgZWxlbWVudCBub3QgbmVlZGVkIGZvciBtdWx0aXBsZSBzaWJsaW5ncycsIGFzc2VydCA9PiB7XHJcblxyXG4gIC8vIHRlc3QgdGhlIGJlaGF2aW9yIG9mIHN3YXBWaXNpYmlsaXR5IGZ1bmN0aW9uXHJcbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XHJcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbiAgLy8gdGVzdCBjb250YWluZXJUYWcgaXMgbm90IG5lZWRlZFxyXG4gIGNvbnN0IGIgPSBuZXcgTm9kZSgge1xyXG4gICAgdGFnTmFtZTogJ2RpdicsXHJcbiAgICBsYWJlbENvbnRlbnQ6ICdoZWxsbydcclxuICB9ICk7XHJcbiAgY29uc3QgYyA9IG5ldyBOb2RlKCB7XHJcbiAgICB0YWdOYW1lOiAnc2VjdGlvbicsXHJcbiAgICBsYWJlbENvbnRlbnQ6ICdoaSdcclxuICB9ICk7XHJcbiAgY29uc3QgZCA9IG5ldyBOb2RlKCB7XHJcbiAgICB0YWdOYW1lOiAncCcsXHJcbiAgICBpbm5lckNvbnRlbnQ6ICdQUFBQJyxcclxuICAgIGNvbnRhaW5lclRhZ05hbWU6ICdkaXYnXHJcbiAgfSApO1xyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBiICk7XHJcbiAgYi5hZGRDaGlsZCggYyApO1xyXG4gIGIuYWRkQ2hpbGQoIGQgKTtcclxuICBsZXQgYkVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGIgKTtcclxuICBsZXQgY1BlZXIgPSBjLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyITtcclxuICBsZXQgZFBlZXIgPSBkLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyITtcclxuICBhc3NlcnQub2soIGJFbGVtZW50LmNoaWxkcmVuLmxlbmd0aCA9PT0gMywgJ2MucCwgYy5zZWN0aW9uLCBkLmRpdiBzaG91bGQgYWxsIGJlIG9uIHRoZSBzYW1lIGxldmVsJyApO1xyXG4gIGNvbnN0IGNvbmZpcm1PcmlnaW5hbE9yZGVyID0gKCkgPT4ge1xyXG4gICAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlblsgMCBdLnRhZ05hbWUgPT09ICdQJywgJ3AgZmlyc3QnICk7XHJcbiAgICBhc3NlcnQub2soIGJFbGVtZW50LmNoaWxkcmVuWyAxIF0udGFnTmFtZSA9PT0gJ1NFQ1RJT04nLCAnc2VjdGlvbiAybmQnICk7XHJcbiAgICBhc3NlcnQub2soIGJFbGVtZW50LmNoaWxkcmVuWyAyIF0udGFnTmFtZSA9PT0gJ0RJVicsICdkaXYgM3JkJyApO1xyXG4gICAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlblsgMCBdID09PSBjUGVlci5sYWJlbFNpYmxpbmcsICdjIGxhYmVsIGZpcnN0JyApO1xyXG4gICAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlblsgMSBdID09PSBjUGVlci5wcmltYXJ5U2libGluZywgJ2MgcHJpbWFyeSAybmQnICk7XHJcbiAgICBhc3NlcnQub2soIGJFbGVtZW50LmNoaWxkcmVuWyAyIF0gPT09IGRQZWVyLmNvbnRhaW5lclBhcmVudCwgJ2QgY29udGFpbmVyIDNyZCcgKTtcclxuICB9O1xyXG4gIGNvbmZpcm1PcmlnaW5hbE9yZGVyKCk7XHJcblxyXG4gIC8vIGFkZCBhIGZldyBtb3JlXHJcbiAgY29uc3QgZSA9IG5ldyBOb2RlKCB7XHJcbiAgICB0YWdOYW1lOiAnc3BhbicsXHJcbiAgICBkZXNjcmlwdGlvbkNvbnRlbnQ6ICc8YnI+c3dlZXQgYW5kIGNvb2wgdGhpbmdzPC9icj4nXHJcbiAgfSApO1xyXG4gIGIuYWRkQ2hpbGQoIGUgKTtcclxuICBiRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYiApOyAvLyByZWZyZXNoIHRoZSBET00gRWxlbWVudHNcclxuICBjUGVlciA9IGMucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhOyAvLyByZWZyZXNoIHRoZSBET00gRWxlbWVudHNcclxuICBkUGVlciA9IGQucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhOyAvLyByZWZyZXNoIHRoZSBET00gRWxlbWVudHNcclxuICBsZXQgZVBlZXIgPSBlLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyITtcclxuICBhc3NlcnQub2soIGJFbGVtZW50LmNoaWxkcmVuLmxlbmd0aCA9PT0gNSwgJ2UgY2hpbGRyZW4gc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBzYW1lIFBET00gbGV2ZWwuJyApO1xyXG4gIGNvbmZpcm1PcmlnaW5hbE9yZGVyKCk7XHJcblxyXG4gIGNvbnN0IGNvbmZpcm1PcmlnaW5hbFdpdGhFID0gKCkgPT4ge1xyXG4gICAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlblsgMyBdLnRhZ05hbWUgPT09ICdQJywgJ1AgNHJkJyApO1xyXG4gICAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlblsgNCBdLnRhZ05hbWUgPT09ICdTUEFOJywgJ1NQQU4gM3JkJyApO1xyXG4gICAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlblsgMyBdID09PSBlUGVlci5kZXNjcmlwdGlvblNpYmxpbmcsICdlIGRlc2NyaXB0aW9uIDR0aCcgKTtcclxuICAgIGFzc2VydC5vayggYkVsZW1lbnQuY2hpbGRyZW5bIDQgXSA9PT0gZVBlZXIucHJpbWFyeVNpYmxpbmcsICdlIHByaW1hcnkgNXRoJyApO1xyXG4gIH07XHJcblxyXG4gIC8vIGR5bmFtaWNhbGx5IGFkZGluZyBwYXJlbnRcclxuICBlLmNvbnRhaW5lclRhZ05hbWUgPSAnYXJ0aWNsZSc7XHJcbiAgYkVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGIgKTsgLy8gcmVmcmVzaCB0aGUgRE9NIEVsZW1lbnRzXHJcbiAgY1BlZXIgPSBjLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyITsgLy8gcmVmcmVzaCB0aGUgRE9NIEVsZW1lbnRzXHJcbiAgZFBlZXIgPSBkLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyITsgLy8gcmVmcmVzaCB0aGUgRE9NIEVsZW1lbnRzXHJcbiAgZVBlZXIgPSBlLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyITtcclxuICBhc3NlcnQub2soIGJFbGVtZW50LmNoaWxkcmVuLmxlbmd0aCA9PT0gNCwgJ2UgY2hpbGRyZW4gc2hvdWxkIG5vdyBiZSB1bmRlciBlXFwncyBjb250YWluZXIuJyApO1xyXG4gIGNvbmZpcm1PcmlnaW5hbE9yZGVyKCk7XHJcbiAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlblsgMyBdLnRhZ05hbWUgPT09ICdBUlRJQ0xFJywgJ1NQQU4gM3JkJyApO1xyXG4gIGFzc2VydC5vayggYkVsZW1lbnQuY2hpbGRyZW5bIDMgXSA9PT0gZVBlZXIuY29udGFpbmVyUGFyZW50LCAnZSBwYXJlbnQgM3JkJyApO1xyXG5cclxuICAvLyBjbGVhciBjb250YWluZXJcclxuICBlLmNvbnRhaW5lclRhZ05hbWUgPSBudWxsO1xyXG4gIGJFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICk7IC8vIHJlZnJlc2ggdGhlIERPTSBFbGVtZW50c1xyXG4gIGNQZWVyID0gYy5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciE7IC8vIHJlZnJlc2ggdGhlIERPTSBFbGVtZW50c1xyXG4gIGRQZWVyID0gZC5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciE7IC8vIHJlZnJlc2ggdGhlIERPTSBFbGVtZW50c1xyXG4gIGVQZWVyID0gZS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciE7XHJcbiAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlbi5sZW5ndGggPT09IDUsICdlIGNoaWxkcmVuIHNob3VsZCBiZSBhZGRlZCB0byB0aGUgc2FtZSBQRE9NIGxldmVsIGFnYWluLicgKTtcclxuICBjb25maXJtT3JpZ2luYWxPcmRlcigpO1xyXG4gIGNvbmZpcm1PcmlnaW5hbFdpdGhFKCk7XHJcblxyXG4gIC8vIHByb3BlciBkaXNwb3NhbFxyXG4gIGUuZGlzcG9zZSgpO1xyXG4gIGJFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICk7XHJcbiAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlbi5sZW5ndGggPT09IDMsICdlIGNoaWxkcmVuIHNob3VsZCBoYXZlIGJlZW4gcmVtb3ZlZCcgKTtcclxuICBhc3NlcnQub2soIGUucGRvbUluc3RhbmNlcy5sZW5ndGggPT09IDAsICdlIGlzIGRpc3Bvc2VkJyApO1xyXG4gIGNvbmZpcm1PcmlnaW5hbE9yZGVyKCk7XHJcblxyXG4gIC8vIHJlb3JkZXIgZCBjb3JyZWN0bHkgd2hlbiBjIHJlbW92ZWRcclxuICBiLnJlbW92ZUNoaWxkKCBjICk7XHJcbiAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlbi5sZW5ndGggPT09IDEsICdjIGNoaWxkcmVuIHNob3VsZCBoYXZlIGJlZW4gcmVtb3ZlZCwgb25seSBkIGNvbnRhaW5lcicgKTtcclxuICBiRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYiApO1xyXG4gIGRQZWVyID0gZC5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciE7XHJcbiAgYXNzZXJ0Lm9rKCBiRWxlbWVudC5jaGlsZHJlblsgMCBdLnRhZ05hbWUgPT09ICdESVYnLCAnRElWIGZpcnN0JyApO1xyXG4gIGFzc2VydC5vayggYkVsZW1lbnQuY2hpbGRyZW5bIDAgXSA9PT0gZFBlZXIuY29udGFpbmVyUGFyZW50LCAnZCBjb250YWluZXIgZmlyc3QnICk7XHJcbiAgZGlzcGxheS5kaXNwb3NlKCk7XHJcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdkZXNjcmlwdGlvblRhZ05hbWUvZGVzY3JpcHRpb25Db250ZW50IG9wdGlvbicsIGFzc2VydCA9PiB7XHJcblxyXG4gIC8vIHRlc3QgdGhlIGJlaGF2aW9yIG9mIHN3YXBWaXNpYmlsaXR5IGZ1bmN0aW9uXHJcbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XHJcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbiAgLy8gY3JlYXRlIHNvbWUgbm9kZXMgZm9yIHRlc3RpbmdcclxuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicsIGRlc2NyaXB0aW9uQ29udGVudDogVEVTVF9ERVNDUklQVElPTiB9ICk7XHJcblxyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XHJcblxyXG4gIGNvbnN0IGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XHJcbiAgY29uc3QgZGVzY3JpcHRpb25TaWJsaW5nID0gYUVsZW1lbnQucGFyZW50RWxlbWVudCEuY2hpbGROb2Rlc1sgMCBdIGFzIEhUTUxFbGVtZW50O1xyXG4gIGFzc2VydC5vayggYS5wZG9tSW5zdGFuY2VzLmxlbmd0aCA9PT0gMSwgJ29ubHkgMSBpbnN0YW5jZScgKTtcclxuICBhc3NlcnQub2soIGFFbGVtZW50LnBhcmVudEVsZW1lbnQhLmNoaWxkTm9kZXMubGVuZ3RoID09PSAyLCAncGFyZW50IGNvbnRhaW5zIHR3byBzaWJsaW5ncycgKTtcclxuICBhc3NlcnQub2soIGRlc2NyaXB0aW9uU2libGluZy50YWdOYW1lID09PSBERUZBVUxUX0RFU0NSSVBUSU9OX1RBR19OQU1FLCAnZGVmYXVsdCBsYWJlbCB0YWdOYW1lJyApO1xyXG4gIGFzc2VydC5vayggZGVzY3JpcHRpb25TaWJsaW5nLnRleHRDb250ZW50ID09PSBURVNUX0RFU0NSSVBUSU9OLCAnbm8gaHRtbCBzaG91bGQgdXNlIHRleHRDb250ZW50JyApO1xyXG5cclxuICBhLmRlc2NyaXB0aW9uQ29udGVudCA9IFRFU1RfREVTQ1JJUFRJT05fSFRNTDtcclxuICBhc3NlcnQub2soIGRlc2NyaXB0aW9uU2libGluZy5pbm5lckhUTUwgPT09IFRFU1RfREVTQ1JJUFRJT05fSFRNTCwgJ2h0bWwgbGFiZWwgc2hvdWxkIHVzZSBpbm5lckhUTUwnICk7XHJcblxyXG4gIGEuZGVzY3JpcHRpb25Db250ZW50ID0gbnVsbDtcclxuICBhc3NlcnQub2soIGRlc2NyaXB0aW9uU2libGluZy5pbm5lckhUTUwgPT09ICcnLCAnZGVzY3JpcHRpb24gY29udGVudCBzaG91bGQgYmUgY2xlYXJlZCcgKTtcclxuXHJcbiAgYS5kZXNjcmlwdGlvbkNvbnRlbnQgPSBURVNUX0RFU0NSSVBUSU9OX0hUTUxfMjtcclxuICBhc3NlcnQub2soIGRlc2NyaXB0aW9uU2libGluZy5pbm5lckhUTUwgPT09IFRFU1RfREVTQ1JJUFRJT05fSFRNTF8yLCAnaHRtbCBsYWJlbCBzaG91bGQgdXNlIGlubmVySFRNTCwgb3ZlcndyaXRlIGZyb20gaHRtbCcgKTtcclxuXHJcbiAgYS5kZXNjcmlwdGlvblRhZ05hbWUgPSBudWxsO1xyXG5cclxuICAvLyBtYWtlIHN1cmUgZGVzY3JpcHRpb24gd2FzIGNsZWFyZWQgZnJvbSBQRE9NXHJcbiAgYXNzZXJ0Lm9rKCBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKS5wYXJlbnRFbGVtZW50IS5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMSxcclxuICAgICdPbmx5IG9uZSBlbGVtZW50IGFmdGVyIGNsZWFyaW5nIGRlc2NyaXB0aW9uJyApO1xyXG5cclxuICBhc3NlcnQub2soIGEuZGVzY3JpcHRpb25Db250ZW50ID09PSBURVNUX0RFU0NSSVBUSU9OX0hUTUxfMiwgJ2NsZWFyaW5nIGRlc2NyaXB0aW9uVGFnTmFtZSBzaG91bGQgbm90IGNoYW5nZSBjb250ZW50LCBldmVuICB0aG91Z2ggaXQgaXMgbm90IGRpc3BsYXllZCcgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBhLmRlc2NyaXB0aW9uVGFnTmFtZSA9PT0gbnVsbCwgJ2V4cGVjdCBkZXNjcmlwdGlvblRhZ05hbWUgc2V0dGVyIHRvIHdvcmsuJyApO1xyXG5cclxuICBhLmRlc2NyaXB0aW9uVGFnTmFtZSA9ICdwJztcclxuICBhc3NlcnQub2soIGEuZGVzY3JpcHRpb25UYWdOYW1lID09PSAncCcsICdleHBlY3QgZGVzY3JpcHRpb25UYWdOYW1lIHNldHRlciB0byB3b3JrLicgKTtcclxuICBkaXNwbGF5LmRpc3Bvc2UoKTtcclxuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1BhcmFsbGVsRE9NIG9wdGlvbnMnLCBhc3NlcnQgPT4ge1xyXG5cclxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCk7XHJcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbiAgLy8gdGVzdCBzZXR0aW5nIG9mIGFjY2Vzc2libGUgY29udGVudCB0aHJvdWdoIG9wdGlvbnNcclxuICBjb25zdCBidXR0b25Ob2RlID0gbmV3IE5vZGUoIHtcclxuICAgIGZvY3VzSGlnaGxpZ2h0OiBuZXcgQ2lyY2xlKCA1ICksXHJcbiAgICBjb250YWluZXJUYWdOYW1lOiAnZGl2JywgLy8gY29udGFpbmVkIGluIHBhcmVudCBlbGVtZW50ICdkaXYnXHJcbiAgICB0YWdOYW1lOiAnaW5wdXQnLCAvLyBkb20gZWxlbWVudCB3aXRoIHRhZyBuYW1lICdpbnB1dCdcclxuICAgIGlucHV0VHlwZTogJ2J1dHRvbicsIC8vIGlucHV0IHR5cGUgJ2J1dHRvbidcclxuICAgIGxhYmVsVGFnTmFtZTogJ2xhYmVsJywgLy8gbGFiZWwgd2l0aCB0YWduYW1lICdsYWJlbCdcclxuICAgIGxhYmVsQ29udGVudDogVEVTVF9MQUJFTCwgLy8gbGFiZWwgdGV4dCBjb250ZW50XHJcbiAgICBkZXNjcmlwdGlvbkNvbnRlbnQ6IFRFU1RfREVTQ1JJUFRJT04sIC8vIGRlc2NyaXB0aW9uIHRleHQgY29udGVudFxyXG4gICAgZm9jdXNhYmxlOiBmYWxzZSwgLy8gcmVtb3ZlIGZyb20gZm9jdXMgb3JkZXJcclxuICAgIGFyaWFSb2xlOiAnYnV0dG9uJyAvLyB1c2VzIHRoZSBBUklBIGJ1dHRvbiByb2xlXHJcbiAgfSApO1xyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBidXR0b25Ob2RlICk7XHJcblxyXG4gIGNvbnN0IGRpdk5vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgdGFnTmFtZTogJ2RpdicsXHJcbiAgICBhcmlhTGFiZWw6IFRFU1RfTEFCRUwsIC8vIHVzZSBBUklBIGxhYmVsIGF0dHJpYnV0ZVxyXG4gICAgcGRvbVZpc2libGU6IGZhbHNlLCAvLyBoaWRkZW4gZnJvbSBzY3JlZW4gcmVhZGVycyAoYW5kIGJyb3dzZXIpXHJcbiAgICBkZXNjcmlwdGlvbkNvbnRlbnQ6IFRFU1RfREVTQ1JJUFRJT04sIC8vIGRlZmF1bHQgdG8gYSA8cD4gdGFnXHJcbiAgICBjb250YWluZXJUYWdOYW1lOiAnZGl2J1xyXG4gIH0gKTtcclxuICByb290Tm9kZS5hZGRDaGlsZCggZGl2Tm9kZSApO1xyXG5cclxuICAvLyB2ZXJpZnkgdGhhdCBzZXR0ZXJzIGFuZCBnZXR0ZXJzIHdvcmtlZCBjb3JyZWN0bHlcclxuICBhc3NlcnQub2soIGJ1dHRvbk5vZGUubGFiZWxUYWdOYW1lID09PSAnbGFiZWwnLCAnTGFiZWwgdGFnIG5hbWUnICk7XHJcbiAgYXNzZXJ0Lm9rKCBidXR0b25Ob2RlLmNvbnRhaW5lclRhZ05hbWUgPT09ICdkaXYnLCAnY29udGFpbmVyIHRhZyBuYW1lJyApO1xyXG4gIGFzc2VydC5vayggYnV0dG9uTm9kZS5sYWJlbENvbnRlbnQgPT09IFRFU1RfTEFCRUwsICdBY2Nlc3NpYmxlIGxhYmVsJyApO1xyXG4gIGFzc2VydC5vayggYnV0dG9uTm9kZS5kZXNjcmlwdGlvblRhZ05hbWUhLnRvVXBwZXJDYXNlKCkgPT09IERFRkFVTFRfREVTQ1JJUFRJT05fVEFHX05BTUUsICdEZXNjcmlwdGlvbiB0YWcgbmFtZScgKTtcclxuICBhc3NlcnQuZXF1YWwoIGJ1dHRvbk5vZGUuZm9jdXNhYmxlLCBmYWxzZSwgJ0ZvY3VzYWJsZScgKTtcclxuICBhc3NlcnQub2soIGJ1dHRvbk5vZGUuYXJpYVJvbGUgPT09ICdidXR0b24nLCAnQXJpYSByb2xlJyApO1xyXG4gIGFzc2VydC5vayggYnV0dG9uTm9kZS5kZXNjcmlwdGlvbkNvbnRlbnQgPT09IFRFU1RfREVTQ1JJUFRJT04sICdBY2Nlc3NpYmxlIERlc2NyaXB0aW9uJyApO1xyXG4gIGFzc2VydC5vayggYnV0dG9uTm9kZS5mb2N1c0hpZ2hsaWdodCBpbnN0YW5jZW9mIENpcmNsZSwgJ0ZvY3VzIGhpZ2hsaWdodCcgKTtcclxuICBhc3NlcnQub2soIGJ1dHRvbk5vZGUudGFnTmFtZSA9PT0gJ2lucHV0JywgJ1RhZyBuYW1lJyApO1xyXG4gIGFzc2VydC5vayggYnV0dG9uTm9kZS5pbnB1dFR5cGUgPT09ICdidXR0b24nLCAnSW5wdXQgdHlwZScgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBkaXZOb2RlLnRhZ05hbWUgPT09ICdkaXYnLCAnVGFnIG5hbWUnICk7XHJcbiAgYXNzZXJ0Lm9rKCBkaXZOb2RlLmFyaWFMYWJlbCA9PT0gVEVTVF9MQUJFTCwgJ1VzZSBhcmlhIGxhYmVsJyApO1xyXG4gIGFzc2VydC5lcXVhbCggZGl2Tm9kZS5wZG9tVmlzaWJsZSwgZmFsc2UsICdwZG9tIHZpc2libGUnICk7XHJcbiAgYXNzZXJ0Lm9rKCBkaXZOb2RlLmxhYmVsVGFnTmFtZSA9PT0gbnVsbCwgJ0xhYmVsIHRhZyBuYW1lIHdpdGggYXJpYSBsYWJlbCBpcyBpbmRlcGVuZGVudCcgKTtcclxuICBhc3NlcnQub2soIGRpdk5vZGUuZGVzY3JpcHRpb25UYWdOYW1lIS50b1VwcGVyQ2FzZSgpID09PSBERUZBVUxUX0RFU0NSSVBUSU9OX1RBR19OQU1FLCAnRGVzY3JpcHRpb24gdGFnIG5hbWUnICk7XHJcblxyXG4gIC8vIHZlcmlmeSBET00gc3RydWN0dXJlIC0gb3B0aW9ucyBhYm92ZSBzaG91bGQgY3JlYXRlIHNvbWV0aGluZyBsaWtlOlxyXG4gIC8vIDxkaXYgaWQ9XCJkaXNwbGF5LXJvb3RcIj5cclxuICAvLyAgPGRpdiBpZD1cInBhcmVudC1jb250YWluZXItaWRcIj5cclxuICAvLyAgICA8bGFiZWwgZm9yPVwiaWRcIj5UZXN0IExhYmVsPC9sYWJlbD5cclxuICAvLyAgICA8cD5EZXNjcmlwdGlvbj5UZXN0IERlc2NyaXB0aW9uPC9wPlxyXG4gIC8vICAgIDxpbnB1dCB0eXBlPSdidXR0b24nIHJvbGU9J2J1dHRvbicgdGFiaW5kZXg9XCItMVwiIGlkPWlkPlxyXG4gIC8vICA8L2Rpdj5cclxuICAvL1xyXG4gIC8vICA8ZGl2IGFyaWEtbGFiZWw9XCJUZXN0IExhYmVsXCIgaGlkZGVuIGFyaWEtbGFiZWxsZWRCeT1cImJ1dHRvbi1ub2RlLWlkXCIgYXJpYS1kZXNjcmliZWRieT0nYnV0dG9uLW5vZGUtaWQnPlxyXG4gIC8vICAgIDxwPlRlc3QgRGVzY3JpcHRpb248L3A+XHJcbiAgLy8gIDwvZGl2PlxyXG4gIC8vIDwvZGl2PlxyXG4gIHBkb21BdWRpdFJvb3ROb2RlKCByb290Tm9kZSApO1xyXG4gIGxldCBidXR0b25FbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBidXR0b25Ob2RlICk7XHJcblxyXG4gIGNvbnN0IGJ1dHRvblBhcmVudCA9IGJ1dHRvbkVsZW1lbnQucGFyZW50Tm9kZSEgYXMgSFRNTEVsZW1lbnQ7XHJcbiAgY29uc3QgYnV0dG9uUGVlcnMgPSBidXR0b25QYXJlbnQuY2hpbGROb2RlcyBhcyB1bmtub3duIGFzIEhUTUxFbGVtZW50W107XHJcbiAgY29uc3QgYnV0dG9uTGFiZWwgPSBidXR0b25QZWVyc1sgMCBdO1xyXG4gIGNvbnN0IGJ1dHRvbkRlc2NyaXB0aW9uID0gYnV0dG9uUGVlcnNbIDEgXTtcclxuICBjb25zdCBkaXZFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBkaXZOb2RlICk7XHJcbiAgY29uc3QgcERlc2NyaXB0aW9uID0gZGl2RWxlbWVudC5wYXJlbnRFbGVtZW50IS5jaGlsZE5vZGVzWyAwIF07IC8vIGRlc2NyaXB0aW9uIGJlZm9yZSBwcmltYXJ5IGRpdlxyXG5cclxuICBhc3NlcnQub2soIGJ1dHRvblBhcmVudC50YWdOYW1lID09PSAnRElWJywgJ3BhcmVudCBjb250YWluZXInICk7XHJcbiAgYXNzZXJ0Lm9rKCBidXR0b25MYWJlbC50YWdOYW1lID09PSAnTEFCRUwnLCAnTGFiZWwgZmlyc3QnICk7XHJcbiAgYXNzZXJ0Lm9rKCBidXR0b25MYWJlbC5nZXRBdHRyaWJ1dGUoICdmb3InICkgPT09IGJ1dHRvbkVsZW1lbnQuaWQsICdsYWJlbCBmb3IgYXR0cmlidXRlJyApO1xyXG4gIGFzc2VydC5vayggYnV0dG9uTGFiZWwudGV4dENvbnRlbnQgPT09IFRFU1RfTEFCRUwsICdsYWJlbCBjb250ZW50JyApO1xyXG4gIGFzc2VydC5vayggYnV0dG9uRGVzY3JpcHRpb24udGFnTmFtZSA9PT0gREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRSwgJ2Rlc2NyaXB0aW9uIHNlY29uZCcgKTtcclxuICBhc3NlcnQuZXF1YWwoIGJ1dHRvbkRlc2NyaXB0aW9uLnRleHRDb250ZW50LCBURVNUX0RFU0NSSVBUSU9OLCAnZGVzY3JpcHRpb24gY29udGVudCcgKTtcclxuICBhc3NlcnQub2soIGJ1dHRvblBlZXJzWyAyIF0gPT09IGJ1dHRvbkVsZW1lbnQsICdCdXR0b24gdGhpcmQnICk7XHJcbiAgYXNzZXJ0Lm9rKCBidXR0b25FbGVtZW50LmdldEF0dHJpYnV0ZSggJ3R5cGUnICkgPT09ICdidXR0b24nLCAnaW5wdXQgdHlwZSBzZXQnICk7XHJcbiAgYXNzZXJ0Lm9rKCBidXR0b25FbGVtZW50LmdldEF0dHJpYnV0ZSggJ3JvbGUnICkgPT09ICdidXR0b24nLCAnYnV0dG9uIHJvbGUgc2V0JyApO1xyXG4gIGFzc2VydC5vayggYnV0dG9uRWxlbWVudC50YWJJbmRleCA9PT0gLTEsICdub3QgZm9jdXNhYmxlJyApO1xyXG5cclxuICBhc3NlcnQub2soIGRpdkVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbCcgKSA9PT0gVEVTVF9MQUJFTCwgJ2FyaWEgbGFiZWwgc2V0JyApO1xyXG4gIGFzc2VydC5vayggZGl2RWxlbWVudC5wYXJlbnRFbGVtZW50IS5oaWRkZW4sICdoaWRkZW4gc2V0IHNob3VsZCBhY3Qgb24gcGFyZW50JyApO1xyXG4gIGFzc2VydC5vayggcERlc2NyaXB0aW9uLnRleHRDb250ZW50ID09PSBURVNUX0RFU0NSSVBUSU9OLCAnZGVzY3JpcHRpb24gY29udGVudCcgKTtcclxuICBhc3NlcnQub2soIHBEZXNjcmlwdGlvbi5wYXJlbnRFbGVtZW50ID09PSBkaXZFbGVtZW50LnBhcmVudEVsZW1lbnQsICdkZXNjcmlwdGlvbiBpcyBzaWJsaW5nIHRvIHByaW1hcnknICk7XHJcbiAgYXNzZXJ0Lm9rKCBkaXZFbGVtZW50LnBhcmVudEVsZW1lbnQhLmNoaWxkTm9kZXMubGVuZ3RoID09PSAyLCAnbm8gbGFiZWwgZWxlbWVudCBmb3IgYXJpYS1sYWJlbCwganVzdCBkZXNjcmlwdGlvbiBhbmQgcHJpbWFyeSBzaWJsaW5ncycgKTtcclxuXHJcbiAgLy8gY2xlYXIgdmFsdWVzXHJcbiAgYnV0dG9uTm9kZS5pbnB1dFR5cGUgPSBudWxsO1xyXG4gIGJ1dHRvbkVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGJ1dHRvbk5vZGUgKTtcclxuICBhc3NlcnQub2soIGJ1dHRvbkVsZW1lbnQuZ2V0QXR0cmlidXRlKCAndHlwZScgKSA9PT0gbnVsbCwgJ2lucHV0IHR5cGUgY2xlYXJlZCcgKTtcclxuICBkaXNwbGF5LmRpc3Bvc2UoKTtcclxuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxufSApO1xyXG5cclxuLy8gdGVzdHMgZm9yIGFyaWEtbGFiZWxsZWRieSBhbmQgYXJpYS1kZXNjcmliZWRieSBzaG91bGQgYmUgdGhlIHNhbWUsIHNpbmNlIGJvdGggc3VwcG9ydCB0aGUgc2FtZSBmZWF0dXJlIHNldFxyXG5mdW5jdGlvbiB0ZXN0QXNzb2NpYXRpb25BdHRyaWJ1dGUoIGFzc2VydDogQXNzZXJ0LCBhdHRyaWJ1dGU6IHN0cmluZyApOiB2b2lkIHtcclxuXHJcbiAgLy8gdXNlIGEgZGlmZmVyZW50IHNldHRlciBkZXBlbmRpbmcgb24gaWYgdGVzdGluZyBsYWJlbGxlZGJ5IG9yIGRlc2NyaWJlZGJ5XHJcbiAgY29uc3QgYWRkQXNzb2NpYXRpb25GdW5jdGlvbiA9IGF0dHJpYnV0ZSA9PT0gJ2FyaWEtbGFiZWxsZWRieScgPyAnYWRkQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbicgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGUgPT09ICdhcmlhLWRlc2NyaWJlZGJ5JyA/ICdhZGRBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbicgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGUgPT09ICdhcmlhLWFjdGl2ZWRlc2NlbmRhbnQnID8gJ2FkZEFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbicgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xyXG5cclxuICBpZiAoICFhZGRBc3NvY2lhdGlvbkZ1bmN0aW9uICkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnaW5jb3JyZWN0IGF0dHJpYnV0ZSBuYW1lIHdoaWxlIGluIHRlc3RBc3NvY2lhdGlvbkF0dHJpYnV0ZScgKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoKTtcclxuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxuICAvLyB0d28gbmV3IG5vZGVzIHRoYXQgd2lsbCBiZSByZWxhdGVkIHdpdGggdGhlIGFyaWEtbGFiZWxsZWRieSBhbmQgYXJpYS1kZXNjcmliZWRieSBhc3NvY2lhdGlvbnNcclxuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicsIGxhYmVsVGFnTmFtZTogJ3AnLCBkZXNjcmlwdGlvblRhZ05hbWU6ICdwJyB9ICk7XHJcbiAgY29uc3QgYiA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdwJywgaW5uZXJDb250ZW50OiBURVNUX0xBQkVMXzIgfSApO1xyXG4gIHJvb3ROb2RlLmNoaWxkcmVuID0gWyBhLCBiIF07XHJcblxyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgYS5zZXRQRE9NQXR0cmlidXRlKCBhdHRyaWJ1dGUsICdoZWxsbycgKTtcclxuICB9LCAvLiovLCAnY2Fubm90IHNldCBhc3NvY2lhdGlvbiBhdHRyaWJ1dGVzIHdpdGggc2V0UERPTUF0dHJpYnV0ZScgKTtcclxuXHJcbiAgYVsgYWRkQXNzb2NpYXRpb25GdW5jdGlvbiBdKCB7XHJcbiAgICBvdGhlck5vZGU6IGIsXHJcbiAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElORyxcclxuICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElOR1xyXG4gIH0gKTtcclxuXHJcbiAgbGV0IGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XHJcbiAgbGV0IGJFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICk7XHJcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoIGF0dHJpYnV0ZSApIS5pbmNsdWRlcyggYkVsZW1lbnQuaWQgKSwgYCR7YXR0cmlidXRlfSBmb3Igb25lIG5vZGUuYCApO1xyXG5cclxuICBjb25zdCBjID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicsIGlubmVyQ29udGVudDogVEVTVF9MQUJFTCB9ICk7XHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGMgKTtcclxuXHJcbiAgYVsgYWRkQXNzb2NpYXRpb25GdW5jdGlvbiBdKCB7XHJcbiAgICBvdGhlck5vZGU6IGMsXHJcbiAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElORyxcclxuICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElOR1xyXG4gIH0gKTtcclxuXHJcbiAgYUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKTtcclxuICBiRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYiApO1xyXG4gIGxldCBjRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYyApO1xyXG4gIGNvbnN0IGV4cGVjdGVkVmFsdWUgPSBbIGJFbGVtZW50LmlkLCBjRWxlbWVudC5pZCBdLmpvaW4oICcgJyApO1xyXG4gIGFzc2VydC5vayggYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUgKSA9PT0gZXhwZWN0ZWRWYWx1ZSwgYCR7YXR0cmlidXRlfSB0d28gbm9kZXNgICk7XHJcblxyXG4gIC8vIE1ha2UgYyBpbnZhbGlkYXRlXHJcbiAgcm9vdE5vZGUucmVtb3ZlQ2hpbGQoIGMgKTtcclxuICByb290Tm9kZS5hZGRDaGlsZCggbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgYyBdIH0gKSApO1xyXG5cclxuICBjb25zdCBvbGRWYWx1ZSA9IGV4cGVjdGVkVmFsdWU7XHJcblxyXG4gIGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XHJcbiAgY0VsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGMgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoIGF0dHJpYnV0ZSApICE9PSBvbGRWYWx1ZSwgJ3Nob3VsZCBoYXZlIGludmFsaWRhdGVkIG9uIHRyZWUgY2hhbmdlJyApO1xyXG4gIGFzc2VydC5vayggYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUgKSA9PT0gWyBiRWxlbWVudC5pZCwgY0VsZW1lbnQuaWQgXS5qb2luKCAnICcgKSxcclxuICAgICdzaG91bGQgaGF2ZSBpbnZhbGlkYXRlZCBvbiB0cmVlIGNoYW5nZScgKTtcclxuXHJcbiAgY29uc3QgZCA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBkZXNjcmlwdGlvblRhZ05hbWU6ICdwJywgaW5uZXJDb250ZW50OiBURVNUX0xBQkVMLCBjb250YWluZXJUYWdOYW1lOiAnZGl2JyB9ICk7XHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGQgKTtcclxuXHJcbiAgYlsgYWRkQXNzb2NpYXRpb25GdW5jdGlvbiBdKCB7XHJcbiAgICBvdGhlck5vZGU6IGQsXHJcbiAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLkNPTlRBSU5FUl9QQVJFTlQsXHJcbiAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5ERVNDUklQVElPTl9TSUJMSU5HXHJcbiAgfSApO1xyXG4gIGIuY29udGFpbmVyVGFnTmFtZSA9ICdkaXYnO1xyXG5cclxuICBjb25zdCBiUGFyZW50Q29udGFpbmVyID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICkucGFyZW50RWxlbWVudCE7XHJcbiAgY29uc3QgZERlc2NyaXB0aW9uRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggZCApLnBhcmVudEVsZW1lbnQhLmNoaWxkTm9kZXNbIDAgXSBhcyBIVE1MRWxlbWVudDtcclxuICBhc3NlcnQub2soIGJQYXJlbnRDb250YWluZXIuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUgKSAhPT0gb2xkVmFsdWUsICdzaG91bGQgaGF2ZSBpbnZhbGlkYXRlZCBvbiB0cmVlIGNoYW5nZScgKTtcclxuICBhc3NlcnQub2soIGJQYXJlbnRDb250YWluZXIuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUgKSA9PT0gZERlc2NyaXB0aW9uRWxlbWVudC5pZCxcclxuICAgIGBiIHBhcmVudCBjb250YWluZXIgZWxlbWVudCBpcyAke2F0dHJpYnV0ZX0gZCBkZXNjcmlwdGlvbiBzaWJsaW5nYCApO1xyXG5cclxuICAvLyBzYXkgd2UgaGF2ZSBhIHNjZW5lIGdyYXBoIHRoYXQgbG9va3MgbGlrZTpcclxuICAvLyAgICBlXHJcbiAgLy8gICAgIFxcXHJcbiAgLy8gICAgICBmXHJcbiAgLy8gICAgICAgXFxcclxuICAvLyAgICAgICAgZ1xyXG4gIC8vICAgICAgICAgXFxcclxuICAvLyAgICAgICAgICBoXHJcbiAgLy8gd2Ugd2FudCB0byBtYWtlIHN1cmVcclxuICBjb25zdCBlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xyXG4gIGNvbnN0IGYgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XHJcbiAgY29uc3QgZyA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcclxuICBjb25zdCBoID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xyXG4gIGUuYWRkQ2hpbGQoIGYgKTtcclxuICBmLmFkZENoaWxkKCBnICk7XHJcbiAgZy5hZGRDaGlsZCggaCApO1xyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBlICk7XHJcblxyXG4gIGVbIGFkZEFzc29jaWF0aW9uRnVuY3Rpb24gXSgge1xyXG4gICAgb3RoZXJOb2RlOiBmLFxyXG4gICAgdGhpc0VsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkcsXHJcbiAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkdcclxuICB9ICk7XHJcblxyXG4gIGZbIGFkZEFzc29jaWF0aW9uRnVuY3Rpb24gXSgge1xyXG4gICAgb3RoZXJOb2RlOiBnLFxyXG4gICAgdGhpc0VsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkcsXHJcbiAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkdcclxuICB9ICk7XHJcblxyXG4gIGdbIGFkZEFzc29jaWF0aW9uRnVuY3Rpb24gXSgge1xyXG4gICAgb3RoZXJOb2RlOiBoLFxyXG4gICAgdGhpc0VsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkcsXHJcbiAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkdcclxuICB9ICk7XHJcblxyXG4gIGxldCBlRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggZSApO1xyXG4gIGxldCBmRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggZiApO1xyXG4gIGxldCBnRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggZyApO1xyXG4gIGxldCBoRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggaCApO1xyXG4gIGFzc2VydC5vayggZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUgKSA9PT0gZkVsZW1lbnQuaWQsIGBlRWxlbWVudCBzaG91bGQgYmUgJHthdHRyaWJ1dGV9IGZFbGVtZW50YCApO1xyXG4gIGFzc2VydC5vayggZkVsZW1lbnQuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUgKSA9PT0gZ0VsZW1lbnQuaWQsIGBmRWxlbWVudCBzaG91bGQgYmUgJHthdHRyaWJ1dGV9IGdFbGVtZW50YCApO1xyXG4gIGFzc2VydC5vayggZ0VsZW1lbnQuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUgKSA9PT0gaEVsZW1lbnQuaWQsIGBnRWxlbWVudCBzaG91bGQgYmUgJHthdHRyaWJ1dGV9IGhFbGVtZW50YCApO1xyXG5cclxuICAvLyByZS1hcnJhbmdlIHRoZSBzY2VuZSBncmFwaCBhbmQgbWFrZSBzdXJlIHRoYXQgdGhlIGF0dHJpYnV0ZSBpZHMgcmVtYWluIHVwIHRvIGRhdGVcclxuICAvLyAgICBlXHJcbiAgLy8gICAgIFxcXHJcbiAgLy8gICAgICBoXHJcbiAgLy8gICAgICAgXFxcclxuICAvLyAgICAgICAgZ1xyXG4gIC8vICAgICAgICAgXFxcclxuICAvLyAgICAgICAgICBmXHJcbiAgZS5yZW1vdmVDaGlsZCggZiApO1xyXG4gIGYucmVtb3ZlQ2hpbGQoIGcgKTtcclxuICBnLnJlbW92ZUNoaWxkKCBoICk7XHJcblxyXG4gIGUuYWRkQ2hpbGQoIGggKTtcclxuICBoLmFkZENoaWxkKCBnICk7XHJcbiAgZy5hZGRDaGlsZCggZiApO1xyXG4gIGVFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBlICk7XHJcbiAgZkVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGYgKTtcclxuICBnRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggZyApO1xyXG4gIGhFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBoICk7XHJcbiAgYXNzZXJ0Lm9rKCBlRWxlbWVudC5nZXRBdHRyaWJ1dGUoIGF0dHJpYnV0ZSApID09PSBmRWxlbWVudC5pZCwgYGVFbGVtZW50IHNob3VsZCBzdGlsbCBiZSAke2F0dHJpYnV0ZX0gZkVsZW1lbnRgICk7XHJcbiAgYXNzZXJ0Lm9rKCBmRWxlbWVudC5nZXRBdHRyaWJ1dGUoIGF0dHJpYnV0ZSApID09PSBnRWxlbWVudC5pZCwgYGZFbGVtZW50IHNob3VsZCBzdGlsbCBiZSAke2F0dHJpYnV0ZX0gZ0VsZW1lbnRgICk7XHJcbiAgYXNzZXJ0Lm9rKCBnRWxlbWVudC5nZXRBdHRyaWJ1dGUoIGF0dHJpYnV0ZSApID09PSBoRWxlbWVudC5pZCwgYGdFbGVtZW50IHNob3VsZCBzdGlsbCBiZSAke2F0dHJpYnV0ZX0gaEVsZW1lbnRgICk7XHJcblxyXG4gIC8vIHRlc3QgYXJpYSBsYWJlbGxlZCBieSB5b3VyIHNlbGYsIGJ1dCBhIGRpZmZlcmVudCBwZWVyIEVsZW1lbnQsIG11bHRpcGxlIGF0dHJpYnV0ZSBpZHMgaW5jbHVkZWQgaW4gdGhlIHRlc3QuXHJcbiAgY29uc3QgY29udGFpbmVyVGFnTmFtZSA9ICdkaXYnO1xyXG4gIGNvbnN0IGogPSBuZXcgTm9kZSgge1xyXG4gICAgdGFnTmFtZTogJ2J1dHRvbicsXHJcbiAgICBsYWJlbFRhZ05hbWU6ICdsYWJlbCcsXHJcbiAgICBkZXNjcmlwdGlvblRhZ05hbWU6ICdwJyxcclxuICAgIGNvbnRhaW5lclRhZ05hbWU6IGNvbnRhaW5lclRhZ05hbWVcclxuICB9ICk7XHJcbiAgcm9vdE5vZGUuY2hpbGRyZW4gPSBbIGogXTtcclxuXHJcbiAgalsgYWRkQXNzb2NpYXRpb25GdW5jdGlvbiBdKCB7XHJcbiAgICBvdGhlck5vZGU6IGosXHJcbiAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElORyxcclxuICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLkxBQkVMX1NJQkxJTkdcclxuICB9ICk7XHJcblxyXG4gIGpbIGFkZEFzc29jaWF0aW9uRnVuY3Rpb24gXSgge1xyXG4gICAgb3RoZXJOb2RlOiBqLFxyXG4gICAgdGhpc0VsZW1lbnROYW1lOiBQRE9NUGVlci5DT05UQUlORVJfUEFSRU5ULFxyXG4gICAgb3RoZXJFbGVtZW50TmFtZTogUERPTVBlZXIuREVTQ1JJUFRJT05fU0lCTElOR1xyXG4gIH0gKTtcclxuXHJcbiAgalsgYWRkQXNzb2NpYXRpb25GdW5jdGlvbiBdKCB7XHJcbiAgICBvdGhlck5vZGU6IGosXHJcbiAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLkNPTlRBSU5FUl9QQVJFTlQsXHJcbiAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5MQUJFTF9TSUJMSU5HXHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBjaGVja09uWW91ck93bkFzc29jaWF0aW9ucyA9ICggbm9kZTogTm9kZSApID0+IHtcclxuXHJcbiAgICBjb25zdCBpbnN0YW5jZSA9IG5vZGVbICdfcGRvbUluc3RhbmNlcycgXVsgMCBdO1xyXG4gICAgY29uc3Qgbm9kZVByaW1hcnlFbGVtZW50ID0gaW5zdGFuY2UucGVlciEucHJpbWFyeVNpYmxpbmchO1xyXG4gICAgY29uc3Qgbm9kZVBhcmVudCA9IG5vZGVQcmltYXJ5RWxlbWVudC5wYXJlbnRFbGVtZW50ITtcclxuXHJcbiAgICBjb25zdCBnZXRVbmlxdWVJZFN0cmluZ0ZvclNpYmxpbmcgPSAoIHNpYmxpbmdTdHJpbmc6IHN0cmluZyApOiBzdHJpbmcgPT4ge1xyXG4gICAgICByZXR1cm4gaW5zdGFuY2UucGVlciEuZ2V0RWxlbWVudElkKCBzaWJsaW5nU3RyaW5nLCBpbnN0YW5jZS5nZXRQRE9NSW5zdGFuY2VVbmlxdWVJZCgpICk7XHJcbiAgICB9O1xyXG5cclxuICAgIGFzc2VydC5vayggbm9kZVByaW1hcnlFbGVtZW50LmdldEF0dHJpYnV0ZSggYXR0cmlidXRlICkhLmluY2x1ZGVzKCBnZXRVbmlxdWVJZFN0cmluZ0ZvclNpYmxpbmcoICdsYWJlbCcgKSApLCBgJHthdHRyaWJ1dGV9IHlvdXIgb3duIGxhYmVsIGVsZW1lbnQuYCApO1xyXG4gICAgYXNzZXJ0Lm9rKCBub2RlUGFyZW50LmdldEF0dHJpYnV0ZSggYXR0cmlidXRlICkhLmluY2x1ZGVzKCBnZXRVbmlxdWVJZFN0cmluZ0ZvclNpYmxpbmcoICdkZXNjcmlwdGlvbicgKSApLCBgcGFyZW50ICR7YXR0cmlidXRlfSB5b3VyIG93biBkZXNjcmlwdGlvbiBlbGVtZW50LmAgKTtcclxuXHJcbiAgICBhc3NlcnQub2soIG5vZGVQYXJlbnQuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUgKSEuaW5jbHVkZXMoIGdldFVuaXF1ZUlkU3RyaW5nRm9yU2libGluZyggJ2xhYmVsJyApICksIGBwYXJlbnQgJHthdHRyaWJ1dGV9IHlvdXIgb3duIGxhYmVsIGVsZW1lbnQuYCApO1xyXG5cclxuICB9O1xyXG5cclxuICAvLyBhZGQgayBpbnRvIHRoZSBtaXhcclxuICBjb25zdCBrID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xyXG4gIGtbIGFkZEFzc29jaWF0aW9uRnVuY3Rpb24gXSgge1xyXG4gICAgb3RoZXJOb2RlOiBqLFxyXG4gICAgdGhpc0VsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkcsXHJcbiAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5MQUJFTF9TSUJMSU5HXHJcbiAgfSApO1xyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBrICk7XHJcbiAgY29uc3QgdGVzdEsgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBrVmFsdWUgPSBrWyAnX3Bkb21JbnN0YW5jZXMnIF1bIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZyEuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUgKTtcclxuICAgIGNvbnN0IGpJRCA9IGpbICdfcGRvbUluc3RhbmNlcycgXVsgMCBdLnBlZXIhLmxhYmVsU2libGluZyEuZ2V0QXR0cmlidXRlKCAnaWQnICk7XHJcbiAgICBhc3NlcnQub2soIGpJRCA9PT0ga1ZhbHVlLCAnayBwb2ludGluZyB0byBqJyApO1xyXG4gIH07XHJcblxyXG4gIC8vIGF1ZGl0IHRoZSBjb250ZW50IHdlIGhhdmUgY3JlYXRlZFxyXG4gIHBkb21BdWRpdFJvb3ROb2RlKCByb290Tm9kZSApO1xyXG5cclxuICAvLyBDaGVjayBiYXNpYyBhc3NvY2lhdGlvbnMgd2l0aGluIHNpbmdsZSBub2RlXHJcbiAgY2hlY2tPbllvdXJPd25Bc3NvY2lhdGlvbnMoIGogKTtcclxuICB0ZXN0SygpO1xyXG5cclxuICAvLyBNb3ZpbmcgdGhpcyBub2RlIGFyb3VuZCB0aGUgc2NlbmUgZ3JhcGggc2hvdWxkIG5vdCBjaGFuZ2UgaXQncyBhcmlhIGxhYmVsbGVkIGJ5IGFzc29jaWF0aW9ucy5cclxuICByb290Tm9kZS5hZGRDaGlsZCggbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgaiBdIH0gKSApO1xyXG4gIGNoZWNrT25Zb3VyT3duQXNzb2NpYXRpb25zKCBqICk7XHJcbiAgdGVzdEsoKTtcclxuXHJcbiAgLy8gY2hlY2sgcmVtb3ZlIGNoaWxkXHJcbiAgcm9vdE5vZGUucmVtb3ZlQ2hpbGQoIGogKTtcclxuICBjaGVja09uWW91ck93bkFzc29jaWF0aW9ucyggaiApO1xyXG4gIHRlc3RLKCk7XHJcblxyXG4gIC8vIGNoZWNrIGRpc3Bvc2VcclxuICBjb25zdCBqUGFyZW50ID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgaiBdIH0gKTtcclxuICByb290Tm9kZS5jaGlsZHJlbiA9IFtdO1xyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBqUGFyZW50ICk7XHJcbiAgY2hlY2tPbllvdXJPd25Bc3NvY2lhdGlvbnMoIGogKTtcclxuICByb290Tm9kZS5hZGRDaGlsZCggaiApO1xyXG4gIGNoZWNrT25Zb3VyT3duQXNzb2NpYXRpb25zKCBqICk7XHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGsgKTtcclxuICBjaGVja09uWW91ck93bkFzc29jaWF0aW9ucyggaiApO1xyXG4gIHRlc3RLKCk7XHJcbiAgalBhcmVudC5kaXNwb3NlKCk7XHJcbiAgY2hlY2tPbllvdXJPd25Bc3NvY2lhdGlvbnMoIGogKTtcclxuICB0ZXN0SygpO1xyXG5cclxuICAvLyBjaGVjayByZW1vdmVDaGlsZCB3aXRoIGRhZ1xyXG4gIGNvbnN0IGpQYXJlbnQyID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgaiBdIH0gKTtcclxuICByb290Tm9kZS5pbnNlcnRDaGlsZCggMCwgalBhcmVudDIgKTtcclxuICBjaGVja09uWW91ck93bkFzc29jaWF0aW9ucyggaiApO1xyXG4gIHRlc3RLKCk7XHJcbiAgcm9vdE5vZGUucmVtb3ZlQ2hpbGQoIGpQYXJlbnQyICk7XHJcbiAgY2hlY2tPbllvdXJPd25Bc3NvY2lhdGlvbnMoIGogKTtcclxuICB0ZXN0SygpO1xyXG5cclxuICBkaXNwbGF5LmRpc3Bvc2UoKTtcclxuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG59XHJcblxyXG50eXBlIEFzc29jaWF0aW9uQXR0cmlidXRlID0gJ2FyaWEtbGFiZWxsZWRieScgfCAnYXJpYS1kZXNjcmliZWRieScgfCAnYXJpYS1hY3RpdmVkZXNjZW5kYW50JztcclxuXHJcbmZ1bmN0aW9uIHRlc3RBc3NvY2lhdGlvbkF0dHJpYnV0ZUJ5U2V0dGVycyggYXNzZXJ0OiBBc3NlcnQsIGF0dHJpYnV0ZTogQXNzb2NpYXRpb25BdHRyaWJ1dGUgKTogdm9pZCB7XHJcblxyXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoKTtcclxuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxuICB0eXBlIE9wdGlvbk5hbWVzID0gJ2FyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zJyB8ICdhcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMnIHwgJ2FjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnMnO1xyXG4gIC8vIHVzZSBhIGRpZmZlcmVudCBzZXR0ZXIgZGVwZW5kaW5nIG9uIGlmIHRlc3RpbmcgbGFiZWxsZWRieSBvciBkZXNjcmliZWRieVxyXG4gIGNvbnN0IGFzc29jaWF0aW9uc0FycmF5TmFtZTogT3B0aW9uTmFtZXMgPSBhdHRyaWJ1dGUgPT09ICdhcmlhLWxhYmVsbGVkYnknID8gJ2FyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZSA9PT0gJ2FyaWEtZGVzY3JpYmVkYnknID8gJ2FyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucycgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucyc7XHJcblxyXG4gIHR5cGUgUmVtb3ZhbEZ1bmN0aW9uTmFtZXMgPSAncmVtb3ZlQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbicgfCAncmVtb3ZlQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24nIHwgJ3JlbW92ZUFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbic7XHJcblxyXG4gIC8vIHVzZSBhIGRpZmZlcmVudCBzZXR0ZXIgZGVwZW5kaW5nIG9uIGlmIHRlc3RpbmcgbGFiZWxsZWRieSBvciBkZXNjcmliZWRieVxyXG4gIGNvbnN0IGFzc29jaWF0aW9uUmVtb3ZhbEZ1bmN0aW9uOiBSZW1vdmFsRnVuY3Rpb25OYW1lcyA9IGF0dHJpYnV0ZSA9PT0gJ2FyaWEtbGFiZWxsZWRieScgPyAncmVtb3ZlQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbicgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZSA9PT0gJ2FyaWEtZGVzY3JpYmVkYnknID8gJ3JlbW92ZUFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3JlbW92ZUFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbic7XHJcblxyXG4gIGNvbnN0IG9wdGlvbnM6IFBhcmFsbGVsRE9NT3B0aW9ucyA9IHtcclxuICAgIHRhZ05hbWU6ICdwJyxcclxuICAgIGxhYmVsQ29udGVudDogJ2hpJyxcclxuICAgIGRlc2NyaXB0aW9uQ29udGVudDogJ2hlbGxvJyxcclxuICAgIGNvbnRhaW5lclRhZ05hbWU6ICdkaXYnXHJcbiAgfTtcclxuICBjb25zdCBuID0gbmV3IE5vZGUoIG9wdGlvbnMgKTtcclxuICByb290Tm9kZS5hZGRDaGlsZCggbiApO1xyXG4gIG9wdGlvbnNbIGFzc29jaWF0aW9uc0FycmF5TmFtZSBdID0gW1xyXG4gICAge1xyXG4gICAgICBvdGhlck5vZGU6IG4sXHJcbiAgICAgIHRoaXNFbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HLFxyXG4gICAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5MQUJFTF9TSUJMSU5HXHJcbiAgICB9XHJcbiAgXTtcclxuICBjb25zdCBvID0gbmV3IE5vZGUoIG9wdGlvbnMgKTtcclxuICByb290Tm9kZS5hZGRDaGlsZCggbyApO1xyXG5cclxuICBjb25zdCBuUGVlciA9IGdldFBET01QZWVyQnlOb2RlKCBuICk7XHJcbiAgY29uc3Qgb0VsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIG8gKTtcclxuICBhc3NlcnQub2soIG9FbGVtZW50LmdldEF0dHJpYnV0ZSggYXR0cmlidXRlICkhLmluY2x1ZGVzKFxyXG4gICAgICBuUGVlci5nZXRFbGVtZW50SWQoICdsYWJlbCcsIG5QZWVyLnBkb21JbnN0YW5jZSEuZ2V0UERPTUluc3RhbmNlVW5pcXVlSWQoKSApICksXHJcbiAgICBgJHthdHRyaWJ1dGV9IGZvciB0d28gbm9kZXMgd2l0aCBzZXR0ZXIgKGxhYmVsKS5gICk7XHJcblxyXG4gIC8vIG1ha2UgYSBsaXN0IG9mIGFzc29jaWF0aW9ucyB0byB0ZXN0IGFzIGEgc2V0dGVyXHJcbiAgY29uc3QgcmFuZG9tQXNzb2NpYXRpb25PYmplY3QgPSB7XHJcbiAgICBvdGhlck5vZGU6IG5ldyBOb2RlKCksXHJcbiAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLkNPTlRBSU5FUl9QQVJFTlQsXHJcbiAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5MQUJFTF9TSUJMSU5HXHJcbiAgfTtcclxuICBvcHRpb25zWyBhc3NvY2lhdGlvbnNBcnJheU5hbWUgXSA9IFtcclxuICAgIHtcclxuICAgICAgb3RoZXJOb2RlOiBuZXcgTm9kZSgpLFxyXG4gICAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLkNPTlRBSU5FUl9QQVJFTlQsXHJcbiAgICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLkRFU0NSSVBUSU9OX1NJQkxJTkdcclxuICAgIH0sXHJcbiAgICByYW5kb21Bc3NvY2lhdGlvbk9iamVjdCxcclxuICAgIHtcclxuICAgICAgb3RoZXJOb2RlOiBuZXcgTm9kZSgpLFxyXG4gICAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElORyxcclxuICAgICAgb3RoZXJFbGVtZW50TmFtZTogUERPTVBlZXIuTEFCRUxfU0lCTElOR1xyXG4gICAgfVxyXG4gIF07XHJcblxyXG4gIC8vIHRlc3QgZ2V0dGVycyBhbmQgc2V0dGVyc1xyXG4gIGNvbnN0IG0gPSBuZXcgTm9kZSggb3B0aW9ucyApO1xyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBtICk7XHJcbiAgYXNzZXJ0Lm9rKCBfLmlzRXF1YWwoIG1bIGFzc29jaWF0aW9uc0FycmF5TmFtZSBdLCBvcHRpb25zWyBhc3NvY2lhdGlvbnNBcnJheU5hbWUgXSApLCAndGVzdCBhc3NvY2lhdGlvbiBvYmplY3QgZ2V0dGVyJyApO1xyXG4gIG1bIGFzc29jaWF0aW9uUmVtb3ZhbEZ1bmN0aW9uIF0oIHJhbmRvbUFzc29jaWF0aW9uT2JqZWN0ICk7XHJcbiAgb3B0aW9uc1sgYXNzb2NpYXRpb25zQXJyYXlOYW1lIF0hLnNwbGljZSggb3B0aW9uc1sgYXNzb2NpYXRpb25zQXJyYXlOYW1lIF0hLmluZGV4T2YoIHJhbmRvbUFzc29jaWF0aW9uT2JqZWN0ICksIDEgKTtcclxuICBhc3NlcnQub2soIF8uaXNFcXVhbCggbVsgYXNzb2NpYXRpb25zQXJyYXlOYW1lIF0sIG9wdGlvbnNbIGFzc29jaWF0aW9uc0FycmF5TmFtZSBdICksICd0ZXN0IGFzc29jaWF0aW9uIG9iamVjdCBnZXR0ZXIgYWZ0ZXIgcmVtb3ZhbCcgKTtcclxuXHJcbiAgbVsgYXNzb2NpYXRpb25zQXJyYXlOYW1lIF0gPSBbXTtcclxuICBhc3NlcnQub2soIGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggbSApLmdldEF0dHJpYnV0ZSggYXR0cmlidXRlICkgPT09IG51bGwsICdjbGVhciB3aXRoIHNldHRlcicgKTtcclxuXHJcbiAgbVsgYXNzb2NpYXRpb25zQXJyYXlOYW1lIF0gPSBvcHRpb25zWyBhc3NvY2lhdGlvbnNBcnJheU5hbWUgXSE7XHJcbiAgbS5kaXNwb3NlKCk7XHJcbiAgYXNzZXJ0Lm9rKCBtWyBhc3NvY2lhdGlvbnNBcnJheU5hbWUgXS5sZW5ndGggPT09IDAsICdjbGVhcmVkIHdoZW4gZGlzcG9zZWQnICk7XHJcblxyXG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xyXG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XHJcbn1cclxuXHJcblFVbml0LnRlc3QoICdhcmlhLWxhYmVsbGVkYnknLCBhc3NlcnQgPT4ge1xyXG5cclxuICB0ZXN0QXNzb2NpYXRpb25BdHRyaWJ1dGUoIGFzc2VydCwgJ2FyaWEtbGFiZWxsZWRieScgKTtcclxuICB0ZXN0QXNzb2NpYXRpb25BdHRyaWJ1dGVCeVNldHRlcnMoIGFzc2VydCwgJ2FyaWEtbGFiZWxsZWRieScgKTtcclxuXHJcbn0gKTtcclxuUVVuaXQudGVzdCggJ2FyaWEtZGVzY3JpYmVkYnknLCBhc3NlcnQgPT4ge1xyXG5cclxuICB0ZXN0QXNzb2NpYXRpb25BdHRyaWJ1dGUoIGFzc2VydCwgJ2FyaWEtZGVzY3JpYmVkYnknICk7XHJcbiAgdGVzdEFzc29jaWF0aW9uQXR0cmlidXRlQnlTZXR0ZXJzKCBhc3NlcnQsICdhcmlhLWRlc2NyaWJlZGJ5JyApO1xyXG5cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ2FyaWEtYWN0aXZlZGVzY2VuZGFudCcsIGFzc2VydCA9PiB7XHJcblxyXG4gIHRlc3RBc3NvY2lhdGlvbkF0dHJpYnV0ZSggYXNzZXJ0LCAnYXJpYS1hY3RpdmVkZXNjZW5kYW50JyApO1xyXG4gIHRlc3RBc3NvY2lhdGlvbkF0dHJpYnV0ZUJ5U2V0dGVycyggYXNzZXJ0LCAnYXJpYS1hY3RpdmVkZXNjZW5kYW50JyApO1xyXG5cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1BhcmFsbGVsRE9NIGludmFsaWRhdGlvbicsIGFzc2VydCA9PiB7XHJcblxyXG4gIC8vIHRlc3QgaW52YWxpZGF0aW9uIG9mIGFjY2Vzc2liaWxpdHkgKGNoYW5naW5nIGNvbnRlbnQgd2hpY2ggcmVxdWlyZXMgKVxyXG4gIGNvbnN0IGExID0gbmV3IE5vZGUoKTtcclxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCk7XHJcblxyXG4gIGExLnRhZ05hbWUgPSAnYnV0dG9uJztcclxuXHJcbiAgLy8gYWNjZXNzaWJsZSBpbnN0YW5jZXMgYXJlIG5vdCBzb3J0ZWQgdW50aWwgYWRkZWQgdG8gYSBkaXNwbGF5XHJcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGExICk7XHJcblxyXG4gIC8vIHZlcmlmeSB0aGF0IGVsZW1lbnRzIGFyZSBpbiB0aGUgRE9NXHJcbiAgY29uc3QgYTFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhMSApO1xyXG4gIGFzc2VydC5vayggYTFFbGVtZW50LCAnYnV0dG9uIGluIERPTScgKTtcclxuICBhc3NlcnQub2soIGExRWxlbWVudC50YWdOYW1lID09PSAnQlVUVE9OJywgJ2J1dHRvbiB0YWcgbmFtZSBzZXQnICk7XHJcblxyXG4gIC8vIGdpdmUgdGhlIGJ1dHRvbiBhIGNvbnRhaW5lciBwYXJlbnQgYW5kIHNvbWUgZW1wdHkgc2libGluZ3NcclxuICBhMS5sYWJlbFRhZ05hbWUgPSAnZGl2JztcclxuICBhMS5kZXNjcmlwdGlvblRhZ05hbWUgPSAncCc7XHJcbiAgYTEuY29udGFpbmVyVGFnTmFtZSA9ICdkaXYnO1xyXG5cclxuICBsZXQgYnV0dG9uRWxlbWVudCA9IGExLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZyE7XHJcbiAgbGV0IHBhcmVudEVsZW1lbnQgPSBidXR0b25FbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgY29uc3QgYnV0dG9uUGVlcnMgPSBwYXJlbnRFbGVtZW50IS5jaGlsZE5vZGVzIGFzIHVua25vd24gYXMgSFRNTEVsZW1lbnRbXTtcclxuXHJcbiAgLy8gbm93IGh0bWwgc2hvdWxkIGxvb2sgbGlrZVxyXG4gIC8vIDxkaXYgaWQ9J3BhcmVudCc+XHJcbiAgLy8gIDxkaXYgaWQ9J2xhYmVsJz48L2Rpdj5cclxuICAvLyAgPHAgaWQ9J2Rlc2NyaXB0aW9uJz48L3A+XHJcbiAgLy8gIDxidXR0b24+PC9idXR0b24+XHJcbiAgLy8gPC9kaXY+XHJcbiAgYXNzZXJ0Lm9rKCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggcGFyZW50RWxlbWVudCEuaWQgKSwgJ2NvbnRhaW5lciBwYXJlbnQgaW4gRE9NJyApO1xyXG4gIGFzc2VydC5vayggYnV0dG9uUGVlcnNbIDAgXS50YWdOYW1lID09PSAnRElWJywgJ2xhYmVsIGZpcnN0JyApO1xyXG4gIGFzc2VydC5vayggYnV0dG9uUGVlcnNbIDEgXS50YWdOYW1lID09PSAnUCcsICdkZXNjcmlwdGlvbiBzZWNvbmQnICk7XHJcbiAgYXNzZXJ0Lm9rKCBidXR0b25QZWVyc1sgMiBdLnRhZ05hbWUgPT09ICdCVVRUT04nLCAncHJpbWFyeVNpYmxpbmcgdGhpcmQnICk7XHJcblxyXG4gIC8vIG1ha2UgdGhlIGJ1dHRvbiBhIGRpdiBhbmQgdXNlIGFuIGlubGluZSBsYWJlbCwgYW5kIHBsYWNlIHRoZSBkZXNjcmlwdGlvbiBiZWxvd1xyXG4gIGExLnRhZ05hbWUgPSAnZGl2JztcclxuICBhMS5hcHBlbmRMYWJlbCA9IHRydWU7XHJcbiAgYTEuYXBwZW5kRGVzY3JpcHRpb24gPSB0cnVlO1xyXG4gIGExLmxhYmVsVGFnTmFtZSA9IG51bGw7IC8vIHVzZSBhcmlhIGxhYmVsIGF0dHJpYnV0ZSBpbnN0ZWFkXHJcbiAgYTEuYXJpYUxhYmVsID0gVEVTVF9MQUJFTDtcclxuXHJcbiAgLy8gbm93IHRoZSBodG1sIHNob3VsZCBsb29rIGxpa2VcclxuICAvLyA8ZGl2IGlkPSdwYXJlbnQtaWQnPlxyXG4gIC8vICA8ZGl2PjwvZGl2PlxyXG4gIC8vICA8cCBpZD0nZGVzY3JpcHRpb24nPjwvcD5cclxuICAvLyA8L2Rpdj5cclxuXHJcbiAgLy8gcmVkZWZpbmUgdGhlIEhUTUwgZWxlbWVudHMgKHJlZmVyZW5jZXMgd2lsbCBwb2ludCB0byBvbGQgZWxlbWVudHMgYmVmb3JlIG11dGF0aW9uKVxyXG4gIGJ1dHRvbkVsZW1lbnQgPSBhMS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciEucHJpbWFyeVNpYmxpbmchO1xyXG4gIHBhcmVudEVsZW1lbnQgPSBidXR0b25FbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgY29uc3QgbmV3QnV0dG9uUGVlcnMgPSBwYXJlbnRFbGVtZW50IS5jaGlsZE5vZGVzIGFzIHVua25vd24gYXMgSFRNTEVsZW1lbnRbXTtcclxuICBhc3NlcnQub2soIG5ld0J1dHRvblBlZXJzWyAwIF0gPT09IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYTEgKSwgJ2RpdiBmaXJzdCcgKTtcclxuICBhc3NlcnQub2soIG5ld0J1dHRvblBlZXJzWyAxIF0uaWQuaW5jbHVkZXMoICdkZXNjcmlwdGlvbicgKSwgJ2Rlc2NyaXB0aW9uIGFmdGVyIGRpdiB3aGVuIGFwcGVuZGluZyBib3RoIGVsZW1lbnRzJyApO1xyXG4gIGFzc2VydC5vayggbmV3QnV0dG9uUGVlcnMubGVuZ3RoID09PSAyLCAnbm8gbGFiZWwgcGVlciB3aGVuIHVzaW5nIGp1c3QgYXJpYS1sYWJlbCBhdHRyaWJ1dGUnICk7XHJcblxyXG4gIGNvbnN0IGVsZW1lbnRJbkRvbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBhMS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciEucHJpbWFyeVNpYmxpbmchLmlkICkhO1xyXG4gIGFzc2VydC5vayggZWxlbWVudEluRG9tLmdldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWwnICkgPT09IFRFU1RfTEFCRUwsICdhcmlhLWxhYmVsIHNldCcgKTtcclxuXHJcbiAgZGlzcGxheS5kaXNwb3NlKCk7XHJcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1BhcmFsbGVsRE9NIHNldHRlcnMvZ2V0dGVycycsIGFzc2VydCA9PiB7XHJcblxyXG4gIGNvbnN0IGExID0gbmV3IE5vZGUoIHtcclxuICAgIHRhZ05hbWU6ICdkaXYnXHJcbiAgfSApO1xyXG4gIHZhciBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIGExICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdmFyXHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XHJcblxyXG4gIC8vIHNldC9nZXQgYXR0cmlidXRlc1xyXG4gIGxldCBhMUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGExICk7XHJcbiAgY29uc3QgaW5pdGlhbExlbmd0aCA9IGExLmdldFBET01BdHRyaWJ1dGVzKCkubGVuZ3RoO1xyXG4gIGExLnNldFBET01BdHRyaWJ1dGUoICdyb2xlJywgJ3N3aXRjaCcgKTtcclxuICBhc3NlcnQub2soIGExLmdldFBET01BdHRyaWJ1dGVzKCkubGVuZ3RoID09PSBpbml0aWFsTGVuZ3RoICsgMSwgJ2F0dHJpYnV0ZSBzZXQgc2hvdWxkIG9ubHkgYWRkIDEnICk7XHJcbiAgYXNzZXJ0Lm9rKCBhMS5nZXRQRE9NQXR0cmlidXRlcygpWyBhMS5nZXRQRE9NQXR0cmlidXRlcygpLmxlbmd0aCAtIDEgXS5hdHRyaWJ1dGUgPT09ICdyb2xlJywgJ2F0dHJpYnV0ZSBzZXQnICk7XHJcbiAgYXNzZXJ0Lm9rKCBhMUVsZW1lbnQuZ2V0QXR0cmlidXRlKCAncm9sZScgKSA9PT0gJ3N3aXRjaCcsICdIVE1MIGF0dHJpYnV0ZSBzZXQnICk7XHJcbiAgYXNzZXJ0Lm9rKCBhMS5oYXNQRE9NQXR0cmlidXRlKCAncm9sZScgKSwgJ3Nob3VsZCBoYXZlIHBkb20gYXR0cmlidXRlJyApO1xyXG5cclxuICBhMS5yZW1vdmVQRE9NQXR0cmlidXRlKCAncm9sZScgKTtcclxuICBhc3NlcnQub2soICFhMS5oYXNQRE9NQXR0cmlidXRlKCAncm9sZScgKSwgJ3Nob3VsZCBub3QgaGF2ZSBwZG9tIGF0dHJpYnV0ZScgKTtcclxuICBhc3NlcnQub2soICFhMUVsZW1lbnQuZ2V0QXR0cmlidXRlKCAncm9sZScgKSwgJ2F0dHJpYnV0ZSByZW1vdmVkJyApO1xyXG5cclxuICBjb25zdCBiID0gbmV3IE5vZGUoIHsgZm9jdXNhYmxlOiB0cnVlIH0gKTtcclxuICBhMS5hZGRDaGlsZCggYiApO1xyXG4gIGIudGFnTmFtZSA9ICdkaXYnO1xyXG4gIGFzc2VydC5vayggZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICkudGFiSW5kZXggPj0gMCwgJ3NldCB0YWdOYW1lIGFmdGVyIGZvY3VzYWJsZScgKTtcclxuXHJcbiAgLy8gdGVzdCBzZXR0aW5nIGF0dHJpYnV0ZSBhcyBET00gcHJvcGVydHksIHNob3VsZCBOT1QgaGF2ZSBhdHRyaWJ1dGUgdmFsdWUgcGFpciAoRE9NIHVzZXMgZW1wdHkgc3RyaW5nIGZvciBlbXB0eSlcclxuICBhMS5zZXRQRE9NQXR0cmlidXRlKCAnaGlkZGVuJywgdHJ1ZSwgeyBhc1Byb3BlcnR5OiB0cnVlIH0gKTtcclxuICBhMUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGExICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBhMUVsZW1lbnQuaGlkZGVuLCB0cnVlLCAnaGlkZGVuIHNldCBhcyBQcm9wZXJ0eScgKTtcclxuICBhc3NlcnQub2soIGExRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdoaWRkZW4nICkgPT09ICcnLCAnaGlkZGVuIHNob3VsZCBub3QgYmUgc2V0IGFzIGF0dHJpYnV0ZScgKTtcclxuXHJcblxyXG4gIC8vIHRlc3Qgc2V0dGluZyBhbmQgcmVtb3ZpbmcgUERPTSBjbGFzc2VzXHJcbiAgYTEuc2V0UERPTUNsYXNzKCBURVNUX0NMQVNTX09ORSApO1xyXG4gIGFzc2VydC5vayggZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhMSApLmNsYXNzTGlzdC5jb250YWlucyggVEVTVF9DTEFTU19PTkUgKSwgJ1RFU1RfQ0xBU1NfT05FIG1pc3NpbmcgZnJvbSBjbGFzc0xpc3QnICk7XHJcblxyXG4gIC8vIHR3byBjbGFzc2VzXHJcbiAgYTEuc2V0UERPTUNsYXNzKCBURVNUX0NMQVNTX1RXTyApO1xyXG4gIGExRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYTEgKTtcclxuICBhc3NlcnQub2soIGExRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoIFRFU1RfQ0xBU1NfT05FICkgJiYgYTFFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyggVEVTVF9DTEFTU19PTkUgKSwgJ09uZSBvZiB0aGUgY2xhc3NlcyBtaXNzaW5nIGZyb20gY2xhc3NMaXN0JyApO1xyXG5cclxuICAvLyBtb2RpZnkgdGhlIE5vZGUgaW4gYSB3YXkgdGhhdCB3b3VsZCBjYXVzZSBhIGZ1bGwgcmVkcmF3LCBtYWtlIHN1cmUgY2xhc3NlcyBzdGlsbCBleGlzdFxyXG4gIGExLnRhZ05hbWUgPSAnYnV0dG9uJztcclxuICBhMUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGExICk7XHJcbiAgYXNzZXJ0Lm9rKCBhMUVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCBURVNUX0NMQVNTX09ORSApICYmIGExRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoIFRFU1RfQ0xBU1NfT05FICksICdPbmUgb2YgdGhlIGNsYXNzZXMgbWlzc2luZyBmcm9tIGNsYXNzTGlzdCBhZnRlciBjaGFuZ2luZyB0YWdOYW1lJyApO1xyXG5cclxuICAvLyByZW1vdmUgdGhlbSBvbmUgYXQgYSB0aW1lXHJcbiAgYTEucmVtb3ZlUERPTUNsYXNzKCBURVNUX0NMQVNTX09ORSApO1xyXG4gIGExRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYTEgKTtcclxuICBhc3NlcnQub2soICFhMUVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCBURVNUX0NMQVNTX09ORSApLCAnVEVTVF9DTEFTU19PTkUgc2hvdWxkIGJlIHJlbW92ZWQgZnJvbSBjbGFzc0xpc3QnICk7XHJcbiAgYXNzZXJ0Lm9rKCBhMUVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCBURVNUX0NMQVNTX1RXTyApLCAnVEVTVF9DTEFTU19UV08gc2hvdWxkIHN0aWxsIGJlIGluIGNsYXNzTGlzdCcgKTtcclxuXHJcbiAgYTEucmVtb3ZlUERPTUNsYXNzKCBURVNUX0NMQVNTX1RXTyApO1xyXG4gIGExRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYTEgKTtcclxuICBhc3NlcnQub2soICFhMUVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCBURVNUX0NMQVNTX09ORSApICYmICFhMUVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCBURVNUX0NMQVNTX09ORSApLCAnY2xhc3NMaXN0IHNob3VsZCBub3QgY29udGFpbiBhbnkgYWRkZWQgY2xhc3NlcycgKTtcclxuXHJcbiAgcGRvbUF1ZGl0Um9vdE5vZGUoIGExICk7XHJcblxyXG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xyXG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdOZXh0L1ByZXZpb3VzIGZvY3VzYWJsZScsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgdXRpbCA9IFBET01VdGlscztcclxuXHJcbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JywgZm9jdXNhYmxlOiB0cnVlIH0gKTtcclxuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxuICAvLyBpbnZpc2libGUgaXMgZGVwcmVjYXRlZCBkb24ndCB1c2UgaW4gZnV0dXJlLCB0aGlzIGlzIGEgd29ya2Fyb3VuZCBmb3IgTm9kZXMgd2l0aG91dCBib3VuZHNcclxuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicsIGZvY3VzYWJsZTogdHJ1ZSwgZm9jdXNIaWdobGlnaHQ6ICdpbnZpc2libGUnIH0gKTtcclxuICBjb25zdCBiID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicsIGZvY3VzYWJsZTogdHJ1ZSwgZm9jdXNIaWdobGlnaHQ6ICdpbnZpc2libGUnIH0gKTtcclxuICBjb25zdCBjID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicsIGZvY3VzYWJsZTogdHJ1ZSwgZm9jdXNIaWdobGlnaHQ6ICdpbnZpc2libGUnIH0gKTtcclxuICBjb25zdCBkID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicsIGZvY3VzYWJsZTogdHJ1ZSwgZm9jdXNIaWdobGlnaHQ6ICdpbnZpc2libGUnIH0gKTtcclxuICBjb25zdCBlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicsIGZvY3VzYWJsZTogdHJ1ZSwgZm9jdXNIaWdobGlnaHQ6ICdpbnZpc2libGUnIH0gKTtcclxuICByb290Tm9kZS5jaGlsZHJlbiA9IFsgYSwgYiwgYywgZCBdO1xyXG5cclxuICBhc3NlcnQub2soIGEuZm9jdXNhYmxlLCAnc2hvdWxkIGJlIGZvY3VzYWJsZScgKTtcclxuXHJcbiAgLy8gZ2V0IGRvbSBlbGVtZW50cyBmcm9tIHRoZSBib2R5XHJcbiAgY29uc3Qgcm9vdEVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIHJvb3ROb2RlICk7XHJcbiAgY29uc3QgYUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKTtcclxuICBjb25zdCBiRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYiApO1xyXG4gIGNvbnN0IGNFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBjICk7XHJcbiAgY29uc3QgZEVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGQgKTtcclxuXHJcbiAgYS5mb2N1cygpO1xyXG4gIGFzc2VydC5vayggZG9jdW1lbnQuYWN0aXZlRWxlbWVudCEuaWQgPT09IGFFbGVtZW50LmlkLCAnYSBpbiBmb2N1cyAobmV4dCknICk7XHJcblxyXG4gIHV0aWwuZ2V0TmV4dEZvY3VzYWJsZSggcm9vdEVsZW1lbnQgKS5mb2N1cygpO1xyXG4gIGFzc2VydC5vayggZG9jdW1lbnQuYWN0aXZlRWxlbWVudCEuaWQgPT09IGJFbGVtZW50LmlkLCAnYiBpbiBmb2N1cyAobmV4dCknICk7XHJcblxyXG4gIHV0aWwuZ2V0TmV4dEZvY3VzYWJsZSggcm9vdEVsZW1lbnQgKS5mb2N1cygpO1xyXG4gIGFzc2VydC5vayggZG9jdW1lbnQuYWN0aXZlRWxlbWVudCEuaWQgPT09IGNFbGVtZW50LmlkLCAnYyBpbiBmb2N1cyAobmV4dCknICk7XHJcblxyXG4gIHV0aWwuZ2V0TmV4dEZvY3VzYWJsZSggcm9vdEVsZW1lbnQgKS5mb2N1cygpO1xyXG4gIGFzc2VydC5vayggZG9jdW1lbnQuYWN0aXZlRWxlbWVudCEuaWQgPT09IGRFbGVtZW50LmlkLCAnZCBpbiBmb2N1cyAobmV4dCknICk7XHJcblxyXG4gIHV0aWwuZ2V0TmV4dEZvY3VzYWJsZSggcm9vdEVsZW1lbnQgKS5mb2N1cygpO1xyXG4gIGFzc2VydC5vayggZG9jdW1lbnQuYWN0aXZlRWxlbWVudCEuaWQgPT09IGRFbGVtZW50LmlkLCAnZCBzdGlsbCBpbiBmb2N1cyAobmV4dCknICk7XHJcblxyXG4gIHV0aWwuZ2V0UHJldmlvdXNGb2N1c2FibGUoIHJvb3RFbGVtZW50ICkuZm9jdXMoKTtcclxuICBhc3NlcnQub2soIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQhLmlkID09PSBjRWxlbWVudC5pZCwgJ2MgaW4gZm9jdXMgKHByZXZpb3VzKScgKTtcclxuXHJcbiAgdXRpbC5nZXRQcmV2aW91c0ZvY3VzYWJsZSggcm9vdEVsZW1lbnQgKS5mb2N1cygpO1xyXG4gIGFzc2VydC5vayggZG9jdW1lbnQuYWN0aXZlRWxlbWVudCEuaWQgPT09IGJFbGVtZW50LmlkLCAnYiBpbiBmb2N1cyAocHJldmlvdXMpJyApO1xyXG5cclxuICB1dGlsLmdldFByZXZpb3VzRm9jdXNhYmxlKCByb290RWxlbWVudCApLmZvY3VzKCk7XHJcbiAgYXNzZXJ0Lm9rKCBkb2N1bWVudC5hY3RpdmVFbGVtZW50IS5pZCA9PT0gYUVsZW1lbnQuaWQsICdhIGluIGZvY3VzIChwcmV2aW91cyknICk7XHJcblxyXG4gIHV0aWwuZ2V0UHJldmlvdXNGb2N1c2FibGUoIHJvb3RFbGVtZW50ICkuZm9jdXMoKTtcclxuICBhc3NlcnQub2soIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQhLmlkID09PSBhRWxlbWVudC5pZCwgJ2Egc3RpbGwgaW4gZm9jdXMgKHByZXZpb3VzKScgKTtcclxuXHJcbiAgcm9vdE5vZGUucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcclxuICByb290Tm9kZS5hZGRDaGlsZCggYSApO1xyXG4gIGEuY2hpbGRyZW4gPSBbIGIsIGMgXTtcclxuICBjLmFkZENoaWxkKCBkICk7XHJcbiAgZC5hZGRDaGlsZCggZSApO1xyXG5cclxuICAvLyB0aGlzIHNob3VsZCBoaWRlIGV2ZXJ5dGhpbmcgZXhjZXB0IGFcclxuICBiLmZvY3VzYWJsZSA9IGZhbHNlO1xyXG4gIGMucGRvbVZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgYS5mb2N1cygpO1xyXG4gIHV0aWwuZ2V0TmV4dEZvY3VzYWJsZSggcm9vdEVsZW1lbnQgKS5mb2N1cygpO1xyXG4gIGFzc2VydC5vayggZG9jdW1lbnQuYWN0aXZlRWxlbWVudCEuaWQgPT09IGFFbGVtZW50LmlkLCAnYSBvbmx5IGVsZW1lbnQgZm9jdXNhYmxlJyApO1xyXG5cclxuICBwZG9tQXVkaXRSb290Tm9kZSggcm9vdE5vZGUgKTtcclxuICBkaXNwbGF5LmRpc3Bvc2UoKTtcclxuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1JlbW92ZSBhY2Nlc3NpYmlsaXR5IHN1YnRyZWUnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicsIGZvY3VzYWJsZTogdHJ1ZSB9ICk7XHJcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUsIGZvY3VzSGlnaGxpZ2h0OiAnaW52aXNpYmxlJyB9ICk7XHJcbiAgY29uc3QgYiA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUsIGZvY3VzSGlnaGxpZ2h0OiAnaW52aXNpYmxlJyB9ICk7XHJcbiAgY29uc3QgYyA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUsIGZvY3VzSGlnaGxpZ2h0OiAnaW52aXNpYmxlJyB9ICk7XHJcbiAgY29uc3QgZCA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUsIGZvY3VzSGlnaGxpZ2h0OiAnaW52aXNpYmxlJyB9ICk7XHJcbiAgY29uc3QgZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUsIGZvY3VzSGlnaGxpZ2h0OiAnaW52aXNpYmxlJyB9ICk7XHJcbiAgY29uc3QgZiA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUsIGZvY3VzSGlnaGxpZ2h0OiAnaW52aXNpYmxlJyB9ICk7XHJcbiAgcm9vdE5vZGUuY2hpbGRyZW4gPSBbIGEsIGIsIGMsIGQsIGUgXTtcclxuICBkLmFkZENoaWxkKCBmICk7XHJcblxyXG4gIGxldCByb290RE9NRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggcm9vdE5vZGUgKTtcclxuICBsZXQgZERPTUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGQgKTtcclxuXHJcbiAgLy8gdmVyaWZ5IHRoZSBkb21cclxuICBhc3NlcnQub2soIHJvb3RET01FbGVtZW50LmNoaWxkcmVuLmxlbmd0aCA9PT0gNSwgJ2NoaWxkcmVuIGFkZGVkJyApO1xyXG5cclxuICAvLyByZWRlZmluZSBiZWNhdXNlIHRoZSBkb20gZWxlbWVudCByZWZlcmVuY2VzIGFib3ZlIGhhdmUgYmVjb21lIHN0YWxlXHJcbiAgcm9vdERPTUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIHJvb3ROb2RlICk7XHJcbiAgZERPTUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGQgKTtcclxuICBhc3NlcnQub2soIHJvb3RET01FbGVtZW50LmNoaWxkcmVuLmxlbmd0aCA9PT0gNSwgJ2NoaWxkcmVuIGFkZGVkIGJhY2snICk7XHJcbiAgYXNzZXJ0Lm9rKCBkRE9NRWxlbWVudC5jaGlsZHJlbi5sZW5ndGggPT09IDEsICdkZXNjZW5kYW50IGNoaWxkIGFkZGVkIGJhY2snICk7XHJcbiAgZGlzcGxheS5kaXNwb3NlKCk7XHJcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdhY2Nlc3NpYmxlLWRhZycsIGFzc2VydCA9PiB7XHJcblxyXG4gIC8vIHRlc3QgYWNjZXNzaWJpbGl0eSBmb3IgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIGEgbm9kZVxyXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicsIGZvY3VzYWJsZTogdHJ1ZSB9ICk7XHJcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcclxuICBjb25zdCBiID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xyXG4gIGNvbnN0IGMgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XHJcbiAgY29uc3QgZCA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcclxuICBjb25zdCBlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xyXG5cclxuICByb290Tm9kZS5hZGRDaGlsZCggYSApO1xyXG4gIGEuY2hpbGRyZW4gPSBbIGIsIGMsIGQgXTtcclxuXHJcbiAgLy8gZSBoYXMgdGhyZWUgcGFyZW50cyAoREFHKVxyXG4gIGIuYWRkQ2hpbGQoIGUgKTtcclxuICBjLmFkZENoaWxkKCBlICk7XHJcbiAgZC5hZGRDaGlsZCggZSApO1xyXG5cclxuICAvLyBlYWNoIGluc3RhbmNlIHNob3VsZCBoYXZlIGl0cyBvd24gYWNjZXNzaWJsZSBjb250ZW50LCBIVE1MIHNob3VsZCBsb29rIGxpa2VcclxuICAvLyA8ZGl2IGlkPVwicm9vdFwiPlxyXG4gIC8vICAgPGRpdiBpZD1cImFcIj5cclxuICAvLyAgICAgPGRpdiBpZD1cImJcIj5cclxuICAvLyAgICAgICA8ZGl2IGlkPVwiZS1pbnN0YW5jZTFcIj5cclxuICAvLyAgICAgPGRpdiBpZD1cImNcIj5cclxuICAvLyAgICAgICA8ZGl2IGlkPVwiZS1pbnN0YW5jZTJcIj5cclxuICAvLyAgICAgPGRpdiBpZD1cImRcIj5cclxuICAvLyAgICAgICA8ZGl2IGlkPVwiZS1pbnN0YW5jZTJcIj5cclxuICBjb25zdCBpbnN0YW5jZXMgPSBlLnBkb21JbnN0YW5jZXM7XHJcbiAgYXNzZXJ0Lm9rKCBlLnBkb21JbnN0YW5jZXMubGVuZ3RoID09PSAzLCAnbm9kZSBlIHNob3VsZCBoYXZlIDMgYWNjZXNzaWJsZSBpbnN0YW5jZXMnICk7XHJcbiAgYXNzZXJ0Lm9rKCAoIGluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nIS5pZCAhPT0gaW5zdGFuY2VzWyAxIF0ucGVlciEucHJpbWFyeVNpYmxpbmchLmlkICkgJiZcclxuICAgICAgICAgICAgICggaW5zdGFuY2VzWyAxIF0ucGVlciEucHJpbWFyeVNpYmxpbmchLmlkICE9PSBpbnN0YW5jZXNbIDIgXS5wZWVyIS5wcmltYXJ5U2libGluZyEuaWQgKSAmJlxyXG4gICAgICAgICAgICAgKCBpbnN0YW5jZXNbIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZyEuaWQgIT09IGluc3RhbmNlc1sgMiBdLnBlZXIhLnByaW1hcnlTaWJsaW5nIS5pZCApLCAnZWFjaCBkb20gZWxlbWVudCBzaG91bGQgYmUgdW5pcXVlJyApO1xyXG4gIGFzc2VydC5vayggZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIGluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nIS5pZCApLCAncGVlciBwcmltYXJ5U2libGluZyAwIHNob3VsZCBiZSBpbiB0aGUgRE9NJyApO1xyXG4gIGFzc2VydC5vayggZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIGluc3RhbmNlc1sgMSBdLnBlZXIhLnByaW1hcnlTaWJsaW5nIS5pZCApLCAncGVlciBwcmltYXJ5U2libGluZyAxIHNob3VsZCBiZSBpbiB0aGUgRE9NJyApO1xyXG4gIGFzc2VydC5vayggZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIGluc3RhbmNlc1sgMiBdLnBlZXIhLnByaW1hcnlTaWJsaW5nIS5pZCApLCAncGVlciBwcmltYXJ5U2libGluZyAyIHNob3VsZCBiZSBpbiB0aGUgRE9NJyApO1xyXG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xyXG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XHJcblxyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAncmVwbGFjZUNoaWxkJywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgLy8gdGVzdCB0aGUgYmVoYXZpb3Igb2YgcmVwbGFjZUNoaWxkIGZ1bmN0aW9uXHJcbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XHJcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbiAgZGlzcGxheS5pbml0aWFsaXplRXZlbnRzKCk7XHJcblxyXG4gIC8vIGNyZWF0ZSBzb21lIG5vZGVzIGZvciB0ZXN0aW5nXHJcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdidXR0b24nLCBmb2N1c0hpZ2hsaWdodDogZm9jdXNIaWdobGlnaHQgfSApO1xyXG4gIGNvbnN0IGIgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnYnV0dG9uJywgZm9jdXNIaWdobGlnaHQ6IGZvY3VzSGlnaGxpZ2h0IH0gKTtcclxuICBjb25zdCBjID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicsIGZvY3VzSGlnaGxpZ2h0OiBmb2N1c0hpZ2hsaWdodCB9ICk7XHJcbiAgY29uc3QgZCA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdidXR0b24nLCBmb2N1c0hpZ2hsaWdodDogZm9jdXNIaWdobGlnaHQgfSApO1xyXG4gIGNvbnN0IGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnYnV0dG9uJywgZm9jdXNIaWdobGlnaHQ6IGZvY3VzSGlnaGxpZ2h0IH0gKTtcclxuICBjb25zdCBmID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicsIGZvY3VzSGlnaGxpZ2h0OiBmb2N1c0hpZ2hsaWdodCB9ICk7XHJcblxyXG4gIC8vIGEgY2hpbGQgdGhhdCB3aWxsIGJlIGFkZGVkIHRocm91Z2ggcmVwbGFjZUNoaWxkKClcclxuICBjb25zdCB0ZXN0Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdidXR0b24nLCBmb2N1c0hpZ2hsaWdodDogZm9jdXNIaWdobGlnaHQgfSApO1xyXG5cclxuICAvLyBtYWtlIHN1cmUgcmVwbGFjZUNoaWxkIHB1dHMgdGhlIGNoaWxkIGluIHRoZSByaWdodCBzcG90XHJcbiAgYS5jaGlsZHJlbiA9IFsgYiwgYywgZCwgZSwgZiBdO1xyXG4gIGNvbnN0IGluaXRJbmRleCA9IGEuaW5kZXhPZkNoaWxkKCBlICk7XHJcbiAgYS5yZXBsYWNlQ2hpbGQoIGUsIHRlc3ROb2RlICk7XHJcbiAgY29uc3QgYWZ0ZXJJbmRleCA9IGEuaW5kZXhPZkNoaWxkKCB0ZXN0Tm9kZSApO1xyXG5cclxuICBhc3NlcnQub2soIGEuaGFzQ2hpbGQoIHRlc3ROb2RlICksICdhIHNob3VsZCBoYXZlIGNoaWxkIHRlc3ROb2RlIGFmdGVyIGl0IHJlcGxhY2VkIG5vZGUgZScgKTtcclxuICBhc3NlcnQub2soICFhLmhhc0NoaWxkKCBlICksICdhIHNob3VsZCBubyBsb25nZXIgaGF2ZSBjaGlsZCBub2RlIGUgYWZ0ZXIgaXQgd2FzIHJlcGxhY2VkIGJ5IHRlc3ROb2RlJyApO1xyXG4gIGFzc2VydC5vayggaW5pdEluZGV4ID09PSBhZnRlckluZGV4LCAndGVzdE5vZGUgc2hvdWxkIGJlIGF0IHRoZSBzYW1lIHBsYWNlIGFzIGUgd2FzIGFmdGVyIHJlcGxhY2VDaGlsZCcgKTtcclxuXHJcbiAgLy8gY3JlYXRlIGEgc2NlbmUgZ3JhcGggdG8gdGVzdCBob3cgc2NlbmVyeSBtYW5hZ2VzIGZvY3VzXHJcbiAgLy8gICAgYVxyXG4gIC8vICAgLyBcXFxyXG4gIC8vICBmICAgYlxyXG4gIC8vICAgICAvIFxcXHJcbiAgLy8gICAgYyAgIGRcclxuICAvLyAgICAgXFwgL1xyXG4gIC8vICAgICAgZVxyXG4gIGEucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcclxuICByb290Tm9kZS5hZGRDaGlsZCggYSApO1xyXG4gIGEuY2hpbGRyZW4gPSBbIGYsIGIgXTtcclxuICBiLmNoaWxkcmVuID0gWyBjLCBkIF07XHJcbiAgYy5hZGRDaGlsZCggZSApO1xyXG4gIGQuYWRkQ2hpbGQoIGUgKTtcclxuXHJcbiAgZi5mb2N1cygpO1xyXG4gIGFzc2VydC5vayggZi5mb2N1c2VkLCAnZiBoYXMgZm9jdXMgYmVmb3JlIGJlaW5nIHJlcGxhY2VkJyApO1xyXG5cclxuICAvLyByZXBsYWNlIGYgd2l0aCB0ZXN0Tm9kZSwgZW5zdXJlIHRoYXQgdGVzdE5vZGUgcmVjZWl2ZXMgZm9jdXMgYWZ0ZXIgcmVwbGFjaW5nXHJcbiAgYS5yZXBsYWNlQ2hpbGQoIGYsIHRlc3ROb2RlICk7XHJcbiAgYXNzZXJ0Lm9rKCAhYS5oYXNDaGlsZCggZiApLCAnYSBzaG91bGQgbm8gbG9uZ2VyIGhhdmUgY2hpbGQgZicgKTtcclxuICBhc3NlcnQub2soIGEuaGFzQ2hpbGQoIHRlc3ROb2RlICksICdhIHNob3VsZCBub3cgaGF2ZSBjaGlsZCB0ZXN0Tm9kZScgKTtcclxuICBhc3NlcnQub2soICFmLmZvY3VzZWQsICdmIG5vIGxvbmdlciBoYXMgZm9jdXMgYWZ0ZXIgYmVpbmcgcmVwbGFjZWQnICk7XHJcbiAgYXNzZXJ0Lm9rKCB0ZXN0Tm9kZS5mb2N1c2VkLCAndGVzdE5vZGUgaGFzIGZvY3VzIGFmdGVyIHJlcGxhY2luZyBmb2N1c2VkIG5vZGUgZicgKTtcclxuICBhc3NlcnQub2soIHRlc3ROb2RlLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZyA9PT0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCwgJ2Jyb3dzZXIgaXMgZm9jdXNpbmcgdGVzdE5vZGUnICk7XHJcblxyXG4gIHRlc3ROb2RlLmJsdXIoKTtcclxuICBhc3NlcnQub2soICEhdGVzdE5vZGUsICd0ZXN0Tm9kZSBibHVycmVkIGJlZm9yZSBiZWluZyByZXBsYWNlZCcgKTtcclxuXHJcbiAgLy8gcmVwbGFjZSB0ZXN0Tm9kZSB3aXRoIGYgYWZ0ZXIgYmx1cmluZyB0ZXN0Tm9kZSwgbmVpdGhlciBzaG91bGQgaGF2ZSBmb2N1cyBhZnRlciB0aGUgcmVwbGFjZW1lbnRcclxuICBhLnJlcGxhY2VDaGlsZCggdGVzdE5vZGUsIGYgKTtcclxuICBhc3NlcnQub2soIGEuaGFzQ2hpbGQoIGYgKSwgJ25vZGUgZiBzaG91bGQgcmVwbGFjZSBub2RlIHRlc3ROb2RlJyApO1xyXG4gIGFzc2VydC5vayggIWEuaGFzQ2hpbGQoIHRlc3ROb2RlICksICd0ZXN0Tm9kZSBzaG91bGQgbm8gbG9uZ2VyIGJlIGEgY2hpbGQgb2Ygbm9kZSBhJyApO1xyXG4gIGFzc2VydC5vayggIXRlc3ROb2RlLmZvY3VzZWQsICd0ZXN0Tm9kZSBzaG91bGQgbm90IGhhdmUgZm9jdXMgYWZ0ZXIgYmVpbmcgcmVwbGFjZWQnICk7XHJcbiAgYXNzZXJ0Lm9rKCAhZi5mb2N1c2VkLCAnZiBzaG91bGQgbm90IGhhdmUgZm9jdXMgYWZ0ZXIgcmVwbGFjaW5nIHRlc3ROb2RlLCB0ZXN0Tm9kZSBkaWQgbm90IGhhdmUgZm9jdXMnICk7XHJcbiAgYXNzZXJ0Lm9rKCBmLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZyAhPT0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCwgJ2Jyb3dzZXIgc2hvdWxkIG5vdCBiZSBmb2N1c2luZyBub2RlIGYnICk7XHJcblxyXG4gIC8vIGZvY3VzIG5vZGUgZCBhbmQgcmVwbGFjZSB3aXRoIG5vbi1mb2N1c2FibGUgdGVzdE5vZGUsIG5laXRoZXIgc2hvdWxkIGhhdmUgZm9jdXMgc2luY2UgdGVzdE5vZGUgaXMgbm90IGZvY3VzYWJsZVxyXG4gIGQuZm9jdXMoKTtcclxuICB0ZXN0Tm9kZS5mb2N1c2FibGUgPSBmYWxzZTtcclxuICBhc3NlcnQub2soIGQuZm9jdXNlZCwgJ2QgaGFzIGZvY3VzIGJlZm9yZSBiZWluZyByZXBsYWNlZCcgKTtcclxuICBhc3NlcnQub2soICF0ZXN0Tm9kZS5mb2N1c2FibGUsICd0ZXN0Tm9kZSBpcyBub3QgZm9jdXNhYmxlIGJlZm9yZSByZXBsYWNpbmcgbm9kZSBkJyApO1xyXG5cclxuICBiLnJlcGxhY2VDaGlsZCggZCwgdGVzdE5vZGUgKTtcclxuICBhc3NlcnQub2soIGIuaGFzQ2hpbGQoIHRlc3ROb2RlICksICd0ZXN0Tm9kZSBzaG91bGQgYmUgYSBjaGlsZCBvZiBub2RlIGIgYWZ0ZXIgcmVwbGFjaW5nIHdpdGggcmVwbGFjZUNoaWxkJyApO1xyXG4gIGFzc2VydC5vayggIWIuaGFzQ2hpbGQoIGQgKSwgJ2Qgc2hvdWxkIG5vdCBiZSBhIGNoaWxkIG9mIGIgYWZ0ZXIgaXQgd2FzIHJlcGxhY2VkIHdpdGggcmVwbGFjZUNoaWxkJyApO1xyXG4gIGFzc2VydC5vayggIWQuZm9jdXNlZCwgJ2QgZG9lcyBub3QgaGF2ZSBmb2N1cyBhZnRlciBiZWluZyByZXBsYWNlZCBieSB0ZXN0Tm9kZScgKTtcclxuICBhc3NlcnQub2soICF0ZXN0Tm9kZS5mb2N1c2VkLCAndGVzdE5vZGUgZG9lcyBub3QgaGF2ZSBmb2N1cyBhZnRlciByZXBsYWNpbmcgbm9kZSBkICh0ZXN0Tm9kZSBpcyBub3QgZm9jdXNhYmxlKScgKTtcclxuXHJcbiAgZGlzcGxheS5kaXNwb3NlKCk7XHJcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdwZG9tVmlzaWJsZScsIGFzc2VydCA9PiB7XHJcblxyXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoKTtcclxuICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7XHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XHJcblxyXG4gIC8vIHRlc3Qgd2l0aCBhIHNjZW5lIGdyYXBoXHJcbiAgLy8gICAgICAgYVxyXG4gIC8vICAgICAgLyBcXFxyXG4gIC8vICAgICBiICAgIGNcclxuICAvLyAgICAgICAgLyB8IFxcXHJcbiAgLy8gICAgICAgZCAgZSAgZlxyXG4gIC8vICAgICAgICAgICBcXCAvXHJcbiAgLy8gICAgICAgICAgICBnXHJcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3QgYiA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3QgYyA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3QgZCA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3QgZSA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3QgZiA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3QgZyA9IG5ldyBOb2RlKCk7XHJcblxyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XHJcbiAgYS5jaGlsZHJlbiA9IFsgYiwgYyBdO1xyXG4gIGMuY2hpbGRyZW4gPSBbIGQsIGUsIGYgXTtcclxuICBlLmNoaWxkcmVuID0gWyBnIF07XHJcbiAgZi5jaGlsZHJlbiA9IFsgZyBdO1xyXG5cclxuICAvLyBnaXZlIHNvbWUgYWNjZXNzaWJsZSBjb250ZW50XHJcbiAgYS50YWdOYW1lID0gJ2Rpdic7XHJcbiAgYi50YWdOYW1lID0gJ2J1dHRvbic7XHJcbiAgZS50YWdOYW1lID0gJ2Rpdic7XHJcbiAgZy50YWdOYW1lID0gJ2J1dHRvbic7XHJcblxyXG4gIC8vIHNjZW5lcnkgc2hvdWxkIHByb2R1Y2UgdGhpcyBhY2Nlc3NpYmxlIERPTSB0cmVlXHJcbiAgLy8gPGRpdiBpZD1cImFcIj5cclxuICAvLyAgIDxidXR0b24gaWQ9XCJiXCI+XHJcbiAgLy8gICA8ZGl2IGlkPVwiZVwiPlxyXG4gIC8vICAgICAgPGJ1dHRvbiBpZD1cImcxXCI+XHJcbiAgLy8gICA8YnV0dG9uIGlkPVwiZzJcIj5cclxuXHJcbiAgLy8gZ2V0IHRoZSBhY2Nlc3NpYmxlIHByaW1hcnkgc2libGluZ3MgLSBsb29raW5nIGludG8gcGRvbUluc3RhbmNlcyBmb3IgdGVzdGluZywgdGhlcmUgaXMgbm8gZ2V0dGVyIGZvciBwcmltYXJ5U2libGluZ1xyXG4gIGNvbnN0IGRpdkEgPSBhLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZyE7XHJcbiAgY29uc3QgYnV0dG9uQiA9IGIucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nITtcclxuICBjb25zdCBkaXZFID0gZS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciEucHJpbWFyeVNpYmxpbmchO1xyXG4gIGNvbnN0IGJ1dHRvbkcxID0gZy5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciEucHJpbWFyeVNpYmxpbmchO1xyXG4gIGNvbnN0IGJ1dHRvbkcyID0gZy5wZG9tSW5zdGFuY2VzWyAxIF0ucGVlciEucHJpbWFyeVNpYmxpbmchO1xyXG5cclxuICBjb25zdCBkaXZBQ2hpbGRyZW4gPSBkaXZBLmNoaWxkTm9kZXM7XHJcbiAgY29uc3QgZGl2RUNoaWxkcmVuID0gZGl2RS5jaGlsZE5vZGVzO1xyXG5cclxuICBhc3NlcnQub2soIF8uaW5jbHVkZXMoIGRpdkFDaGlsZHJlbiwgYnV0dG9uQiApLCAnYnV0dG9uIEIgc2hvdWxkIGJlIGFuIGltbWVkaWF0ZSBjaGlsZCBvZiBkaXYgQScgKTtcclxuICBhc3NlcnQub2soIF8uaW5jbHVkZXMoIGRpdkFDaGlsZHJlbiwgZGl2RSApLCAnZGl2IEUgc2hvdWxkIGJlIGFuIGltbWVkaWF0ZSBjaGlsZCBvZiBkaXYgQScgKTtcclxuICBhc3NlcnQub2soIF8uaW5jbHVkZXMoIGRpdkFDaGlsZHJlbiwgYnV0dG9uRzIgKSwgJ2J1dHRvbiBHMiBzaG91bGQgYmUgYW4gaW1tZWRpYXRlIGNoaWxkIG9mIGRpdiBBJyApO1xyXG4gIGFzc2VydC5vayggXy5pbmNsdWRlcyggZGl2RUNoaWxkcmVuLCBidXR0b25HMSApLCAnYnV0dG9uIEcxIHNob3VsZCBiZSBhbiBpbW1lZGlhdGUgY2hpbGQgb2YgZGl2IEUnICk7XHJcblxyXG4gIC8vIG1ha2Ugbm9kZSBCIGludmlzaWJsZSBmb3IgYWNjZXNzaWJpbGl0eSAtIGl0IHNob3VsZCBzaG91bGQgdmlzaWJsZSwgYnV0IGhpZGRlbiBmcm9tIHNjcmVlbiByZWFkZXJzXHJcbiAgYi5wZG9tVmlzaWJsZSA9IGZhbHNlO1xyXG4gIGFzc2VydC5lcXVhbCggYi52aXNpYmxlLCB0cnVlLCAnYiBzaG91bGQgYmUgdmlzaWJsZSBhZnRlciBiZWNvbWluZyBoaWRkZW4gZm9yIHNjcmVlbiByZWFkZXJzJyApO1xyXG4gIGFzc2VydC5lcXVhbCggYi5wZG9tVmlzaWJsZSwgZmFsc2UsICdiIHN0YXRlIHNob3VsZCByZWZsZWN0IGl0IGlzIGhpZGRlbiBmb3Igc2NyZWVuIHJlYWRlcnMnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBidXR0b25CLmhpZGRlbiwgdHJ1ZSwgJ2J1dHRvbkIgc2hvdWxkIGJlIGhpZGRlbiBmb3Igc2NyZWVuIHJlYWRlcnMnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBiLnBkb21EaXNwbGF5ZWQsIGZhbHNlLCAncGRvbVZpc2libGU9ZmFsc2UsIGIgc2hvdWxkIGhhdmUgbm8gcmVwcmVzZW50YXRpb24gaW4gdGhlIFBET00nICk7XHJcbiAgYi5wZG9tVmlzaWJsZSA9IHRydWU7XHJcblxyXG4gIC8vIG1ha2Ugbm9kZSBCIGludmlzaWJsZSAtIGl0IHNob3VsZCBub3QgYmUgdmlzaWJsZSwgYW5kIGl0IHNob3VsZCBiZSBoaWRkZW4gZm9yIHNjcmVlbiByZWFkZXJzXHJcbiAgYi52aXNpYmxlID0gZmFsc2U7XHJcbiAgYXNzZXJ0LmVxdWFsKCBiLnZpc2libGUsIGZhbHNlLCAnc3RhdGUgb2Ygbm9kZSBiIGlzIHZpc2libGUnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBidXR0b25CLmhpZGRlbiwgdHJ1ZSwgJ2J1dHRvbkIgaXMgaGlkZGVuIGZyb20gc2NyZWVuIHJlYWRlcnMgYWZ0ZXIgYmVjb21pbmcgaW52aXNpYmxlJyApO1xyXG4gIGFzc2VydC5lcXVhbCggYi5wZG9tVmlzaWJsZSwgdHJ1ZSwgJ3N0YXRlIG9mIG5vZGUgYiBzdGlsbCByZWZsZWN0cyBwZG9tIHZpc2liaWxpdHkgd2hlbiBpbnZpc2libGUnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBiLnBkb21EaXNwbGF5ZWQsIGZhbHNlLCAnYiBpbnZpc2libGUgYW5kIHNob3VsZCBoYXZlIG5vIHJlcHJlc2VudGF0aW9uIGluIHRoZSBQRE9NJyApO1xyXG4gIGIudmlzaWJsZSA9IHRydWU7XHJcblxyXG4gIC8vIG1ha2Ugbm9kZSBmIGludmlzaWJsZSAtIGcncyB0cmFpbCB0aGF0IGdvZXMgdGhyb3VnaCBmIHNob3VsZCBiZSBpbnZpc2libGUgdG8gQVQsIHRjb21oZSBjaGlsZCBvZiBjIHNob3VsZCByZW1haW4gcGRvbVZpc2libGVcclxuICBmLnZpc2libGUgPSBmYWxzZTtcclxuICBhc3NlcnQuZXF1YWwoIGcuaXNQRE9NVmlzaWJsZSgpLCB0cnVlLCAnc3RhdGUgb2YgcGRvbVZpc2libGUgc2hvdWxkIHJlbWFpbiB0cnVlIG9uIG5vZGUgZycgKTtcclxuICBhc3NlcnQub2soICFidXR0b25HMS5oaWRkZW4sICdidXR0b25HMSAoY2hpbGQgb2YgZSkgc2hvdWxkIG5vdCBiZSBoaWRkZW4gYWZ0ZXIgcGFyZW50IG5vZGUgZiBtYWRlIGludmlzaWJsZSAobm8gYWNjZXNzaWJsZSBjb250ZW50IG9uIG5vZGUgZiknICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBidXR0b25HMi5oaWRkZW4sIHRydWUsICdidXR0b25HMiBzaG91bGQgYmUgaGlkZGVuIGFmdGVyIHBhcmVudCBub2RlIGYgbWFkZSBpbnZpc2libGUgKG5vIGFjY2Vzc2libGUgY29udGVudCBvbiBub2RlIGYpJyApO1xyXG4gIGFzc2VydC5lcXVhbCggZy5wZG9tRGlzcGxheWVkLCB0cnVlLCAnb25lIHBhcmVudCBzdGlsbCB2aXNpYmxlLCBnIHN0aWxsIGhhcyBvbmUgUERPTUluc3RhbmNlIGRpc3BsYXllZCBpbiBQRE9NJyApO1xyXG4gIGYudmlzaWJsZSA9IHRydWU7XHJcblxyXG4gIC8vIG1ha2Ugbm9kZSBjIChubyBhY2Nlc3NpYmxlIGNvbnRlbnQpIGludmlzaWJsZSB0byBzY3JlZW4sIGUgc2hvdWxkIGJlIGhpZGRlbiBhbmQgZzIgc2hvdWxkIGJlIGhpZGRlblxyXG4gIGMucGRvbVZpc2libGUgPSBmYWxzZTtcclxuICBhc3NlcnQuZXF1YWwoIGMudmlzaWJsZSwgdHJ1ZSwgJ2Mgc2hvdWxkIHN0aWxsIGJlIHZpc2libGUgYWZ0ZXIgYmVjb21pbmcgaW52aXNpYmxlIHRvIHNjcmVlbiByZWFkZXJzJyApO1xyXG4gIGFzc2VydC5lcXVhbCggZGl2RS5oaWRkZW4sIHRydWUsICdkaXYgRSBzaG91bGQgYmUgaGlkZGVuIGFmdGVyIHBhcmVudCBub2RlIGMgKG5vIGFjY2Vzc2libGUgY29udGVudCkgaXMgbWFkZSBpbnZpc2libGUgdG8gc2NyZWVuIHJlYWRlcnMnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBidXR0b25HMi5oaWRkZW4sIHRydWUsICdidXR0b25HMiBzaG91bGQgYmUgaGlkZGVuIGFmdGVyIGFuY2VzdG9yIG5vZGUgYyAobm8gYWNjZXNzaWJsZSBjb250ZW50KSBpcyBtYWRlIGludmlzaWJsZSB0byBzY3JlZW4gcmVhZGVycycgKTtcclxuICBhc3NlcnQub2soICFkaXZBLmhpZGRlbiwgJ2RpdiBBIHNob3VsZCBub3QgaGF2ZSBiZWVuIGhpZGRlbiBieSBtYWtpbmcgZGVzY2VuZGFudCBjIGludmlzaWJsZSB0byBzY3JlZW4gcmVhZGVycycgKTtcclxuICBkaXNwbGF5LmRpc3Bvc2UoKTtcclxuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ2lucHV0VmFsdWUnLCBhc3NlcnQgPT4ge1xyXG5cclxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApO1xyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2lucHV0JywgaW5wdXRUeXBlOiAncmFkaW8nLCBpbnB1dFZhbHVlOiAnaSBhbSB2YWx1ZScgfSApO1xyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XHJcbiAgbGV0IGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XHJcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoICd2YWx1ZScgKSA9PT0gJ2kgYW0gdmFsdWUnLCAnc2hvdWxkIGhhdmUgY29ycmVjdCB2YWx1ZScgKTtcclxuXHJcbiAgY29uc3QgZGlmZmVyZW50VmFsdWUgPSAnaSBhbSBkaWZmZXJlbnQgdmFsdWUnO1xyXG4gIGEuaW5wdXRWYWx1ZSA9IGRpZmZlcmVudFZhbHVlO1xyXG4gIGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XHJcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoICd2YWx1ZScgKSA9PT0gZGlmZmVyZW50VmFsdWUsICdzaG91bGQgaGF2ZSBkaWZmZXJlbnQgdmFsdWUnICk7XHJcblxyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBhIF0gfSApICk7XHJcbiAgYUVsZW1lbnQgPSBhLnBkb21JbnN0YW5jZXNbIDEgXS5wZWVyIS5wcmltYXJ5U2libGluZyE7XHJcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoICd2YWx1ZScgKSA9PT0gZGlmZmVyZW50VmFsdWUsICdzaG91bGQgaGF2ZSB0aGUgc2FtZSBkaWZmZXJlbnQgdmFsdWUnICk7XHJcbiAgZGlzcGxheS5kaXNwb3NlKCk7XHJcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdhcmlhVmFsdWVUZXh0JywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSgpO1xyXG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTtcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbiAgY29uc3QgYXJpYVZhbHVlVGV4dCA9ICd0aGlzIGlzIG15IHZhbHVlIHRleHQnO1xyXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnaW5wdXQnLCBhcmlhVmFsdWVUZXh0OiBhcmlhVmFsdWVUZXh0LCBpbnB1dFR5cGU6ICdyYW5nZScgfSApO1xyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XHJcbiAgbGV0IGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XHJcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLXZhbHVldGV4dCcgKSA9PT0gYXJpYVZhbHVlVGV4dCwgJ3Nob3VsZCBoYXZlIGNvcnJlY3QgdmFsdWUgdGV4dC4nICk7XHJcbiAgYXNzZXJ0Lm9rKCBhLmFyaWFWYWx1ZVRleHQgPT09IGFyaWFWYWx1ZVRleHQsICdzaG91bGQgaGF2ZSBjb3JyZWN0IHZhbHVlIHRleHQsIGdldHRlcicgKTtcclxuXHJcbiAgY29uc3QgZGlmZmVyZW50VmFsdWUgPSAnaSBhbSBkaWZmZXJlbnQgdmFsdWUgdGV4dCc7XHJcbiAgYS5hcmlhVmFsdWVUZXh0ID0gZGlmZmVyZW50VmFsdWU7XHJcbiAgYUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKTtcclxuICBhc3NlcnQub2soIGFFbGVtZW50LmdldEF0dHJpYnV0ZSggJ2FyaWEtdmFsdWV0ZXh0JyApID09PSBkaWZmZXJlbnRWYWx1ZSwgJ3Nob3VsZCBoYXZlIGRpZmZlcmVudCB2YWx1ZSB0ZXh0JyApO1xyXG4gIGFzc2VydC5vayggYS5hcmlhVmFsdWVUZXh0ID09PSBkaWZmZXJlbnRWYWx1ZSwgJ3Nob3VsZCBoYXZlIGRpZmZlcmVudCB2YWx1ZSB0ZXh0LCBnZXR0ZXInICk7XHJcblxyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBhIF0gfSApICk7XHJcbiAgYUVsZW1lbnQgPSBhLnBkb21JbnN0YW5jZXNbIDEgXS5wZWVyIS5wcmltYXJ5U2libGluZyE7XHJcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLXZhbHVldGV4dCcgKSA9PT0gZGlmZmVyZW50VmFsdWUsICdzaG91bGQgaGF2ZSB0aGUgc2FtZSBkaWZmZXJlbnQgdmFsdWUgdGV4dCBhZnRlciBjaGlsZHJlbiBtb3ZpbmcnICk7XHJcbiAgYXNzZXJ0Lm9rKCBhLmFyaWFWYWx1ZVRleHQgPT09IGRpZmZlcmVudFZhbHVlLCAnc2hvdWxkIGhhdmUgdGhlIHNhbWUgZGlmZmVyZW50IHZhbHVlIHRleHQgYWZ0ZXIgY2hpbGRyZW4gbW92aW5nLCBnZXR0ZXInICk7XHJcblxyXG4gIGEudGFnTmFtZSA9ICdkaXYnO1xyXG4gIGFFbGVtZW50ID0gYS5wZG9tSW5zdGFuY2VzWyAxIF0ucGVlciEucHJpbWFyeVNpYmxpbmchO1xyXG4gIGFzc2VydC5vayggYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnYXJpYS12YWx1ZXRleHQnICkgPT09IGRpZmZlcmVudFZhbHVlLCAndmFsdWUgdGV4dCBhcyBkaXYnICk7XHJcbiAgYXNzZXJ0Lm9rKCBhLmFyaWFWYWx1ZVRleHQgPT09IGRpZmZlcmVudFZhbHVlLCAndmFsdWUgdGV4dCBhcyBkaXYsIGdldHRlcicgKTtcclxuICBkaXNwbGF5LmRpc3Bvc2UoKTtcclxuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxufSApO1xyXG5cclxuXHJcblFVbml0LnRlc3QoICdzZXRQRE9NQXR0cmlidXRlJywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSgpO1xyXG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTtcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBsYWJlbENvbnRlbnQ6ICdoZWxsbycgfSApO1xyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XHJcblxyXG4gIGEuc2V0UERPTUF0dHJpYnV0ZSggJ3Rlc3QnLCAndGVzdDEnICk7XHJcbiAgbGV0IGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XHJcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoICd0ZXN0JyApID09PSAndGVzdDEnLCAnc2V0UERPTUF0dHJpYnV0ZSBmb3IgcHJpbWFyeSBzaWJsaW5nJyApO1xyXG5cclxuICBhLnJlbW92ZVBET01BdHRyaWJ1dGUoICd0ZXN0JyApO1xyXG4gIGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XHJcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoICd0ZXN0JyApID09PSBudWxsLCAncmVtb3ZlUERPTUF0dHJpYnV0ZSBmb3IgcHJpbWFyeSBzaWJsaW5nJyApO1xyXG5cclxuICBhLnNldFBET01BdHRyaWJ1dGUoICd0ZXN0JywgJ3Rlc3RWYWx1ZScgKTtcclxuICBhLnNldFBET01BdHRyaWJ1dGUoICd0ZXN0JywgJ3Rlc3RWYWx1ZUxhYmVsJywge1xyXG4gICAgZWxlbWVudE5hbWU6IFBET01QZWVyLkxBQkVMX1NJQkxJTkdcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IHRlc3RCb3RoQXR0cmlidXRlcyA9ICgpID0+IHtcclxuICAgIGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XHJcbiAgICBjb25zdCBhTGFiZWxFbGVtZW50ID0gYUVsZW1lbnQucGFyZW50RWxlbWVudCEuY2hpbGRyZW5bIERFRkFVTFRfTEFCRUxfU0lCTElOR19JTkRFWCBdO1xyXG4gICAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoICd0ZXN0JyApID09PSAndGVzdFZhbHVlJywgJ3NldFBET01BdHRyaWJ1dGUgZm9yIHByaW1hcnkgc2libGluZyAyJyApO1xyXG4gICAgYXNzZXJ0Lm9rKCBhTGFiZWxFbGVtZW50LmdldEF0dHJpYnV0ZSggJ3Rlc3QnICkgPT09ICd0ZXN0VmFsdWVMYWJlbCcsICdzZXRQRE9NQXR0cmlidXRlIGZvciBsYWJlbCBzaWJsaW5nJyApO1xyXG4gIH07XHJcbiAgdGVzdEJvdGhBdHRyaWJ1dGVzKCk7XHJcblxyXG4gIHJvb3ROb2RlLnJlbW92ZUNoaWxkKCBhICk7XHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGEgXSB9ICkgKTtcclxuICB0ZXN0Qm90aEF0dHJpYnV0ZXMoKTtcclxuXHJcbiAgYS5yZW1vdmVQRE9NQXR0cmlidXRlKCAndGVzdCcsIHtcclxuICAgIGVsZW1lbnROYW1lOiBQRE9NUGVlci5MQUJFTF9TSUJMSU5HXHJcbiAgfSApO1xyXG4gIGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XHJcbiAgY29uc3QgYUxhYmVsRWxlbWVudCA9IGFFbGVtZW50LnBhcmVudEVsZW1lbnQhLmNoaWxkcmVuWyBERUZBVUxUX0xBQkVMX1NJQkxJTkdfSU5ERVggXTtcclxuICBhc3NlcnQub2soIGFFbGVtZW50LmdldEF0dHJpYnV0ZSggJ3Rlc3QnICkgPT09ICd0ZXN0VmFsdWUnLCAncmVtb3ZlUERPTUF0dHJpYnV0ZSBmb3IgbGFiZWwgc2hvdWxkIG5vdCBlZmZlY3QgcHJpbWFyeSBzaWJsaW5nICcgKTtcclxuICBhc3NlcnQub2soIGFMYWJlbEVsZW1lbnQuZ2V0QXR0cmlidXRlKCAndGVzdCcgKSA9PT0gbnVsbCwgJ3JlbW92ZVBET01BdHRyaWJ1dGUgZm9yIGxhYmVsIHNpYmxpbmcnICk7XHJcblxyXG4gIGEucmVtb3ZlUERPTUF0dHJpYnV0ZXMoKTtcclxuICBjb25zdCBhdHRyaWJ1dGVOYW1lID0gJ211bHRpVGVzdCc7XHJcbiAgYS5zZXRQRE9NQXR0cmlidXRlKCBhdHRyaWJ1dGVOYW1lLCAndHJ1ZScsIHtcclxuICAgIGFzUHJvcGVydHk6IGZhbHNlXHJcbiAgfSApO1xyXG4gIGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XHJcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoIGF0dHJpYnV0ZU5hbWUgKSA9PT0gJ3RydWUnLCAnYXNQcm9wZXJ0eTpmYWxzZSBzaG91bGQgc2V0IGF0dHJpYnV0ZScgKTtcclxuXHJcbiAgYS5zZXRQRE9NQXR0cmlidXRlKCBhdHRyaWJ1dGVOYW1lLCBmYWxzZSwge1xyXG4gICAgYXNQcm9wZXJ0eTogdHJ1ZVxyXG4gIH0gKTtcclxuICBhc3NlcnQub2soICFhRWxlbWVudC5nZXRBdHRyaWJ1dGUoIGF0dHJpYnV0ZU5hbWUgKSwgJ2FzUHJvcGVydHk6dHJ1ZSBzaG91bGQgcmVtb3ZlIGF0dHJpYnV0ZScgKTtcclxuXHJcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBmb3IgdGVzdGluZ1xyXG4gIGFzc2VydC5lcXVhbCggYUVsZW1lbnRbIGF0dHJpYnV0ZU5hbWUgXSwgZmFsc2UsICdhc1Byb3BlcnR5OnRydWUgc2hvdWxkIHNldCBwcm9wZXJ0eScgKTtcclxuXHJcbiAgY29uc3QgdGVzdEF0dHJpYnV0ZXMgPSBhLmdldFBET01BdHRyaWJ1dGVzKCkuZmlsdGVyKCBhID0+IGEuYXR0cmlidXRlID09PSBhdHRyaWJ1dGVOYW1lICk7XHJcbiAgYXNzZXJ0Lm9rKCB0ZXN0QXR0cmlidXRlcy5sZW5ndGggPT09IDEsICdhc1Byb3BlcnR5IGNoYW5nZSBzaG91bGQgYWx0ZXIgdGhlIGF0dHJpYnV0ZSwgbm90IGFkZCBhIG5ldyBvbmUuJyApO1xyXG5cclxuICBkaXNwbGF5LmRpc3Bvc2UoKTtcclxuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAncGRvbUNoZWNrZWQnLCBhc3NlcnQgPT4ge1xyXG5cclxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApO1xyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2lucHV0JywgaW5wdXRUeXBlOiAncmFkaW8nLCBwZG9tQ2hlY2tlZDogdHJ1ZSB9ICk7XHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcclxuICBsZXQgYUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gIGFzc2VydC5vayggYUVsZW1lbnQuY2hlY2tlZCwgJ3Nob3VsZCBiZSBjaGVja2VkJyApO1xyXG5cclxuICBhLnBkb21DaGVja2VkID0gZmFsc2U7XHJcbiAgYUVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gIGFzc2VydC5vayggIWFFbGVtZW50LmNoZWNrZWQsICdzaG91bGQgbm90IGJlIGNoZWNrZWQnICk7XHJcblxyXG4gIGEuaW5wdXRUeXBlID0gJ3JhbmdlJztcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgIGEucGRvbUNoZWNrZWQgPSB0cnVlO1xyXG4gIH0sIC8uKi8sICdzaG91bGQgZmFpbCBpZiBpbnB1dFR5cGUgcmFuZ2UnICk7XHJcblxyXG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xyXG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XHJcblxyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnc3dhcFZpc2liaWxpdHknLCBhc3NlcnQgPT4ge1xyXG5cclxuICAvLyB0ZXN0IHRoZSBiZWhhdmlvciBvZiBzd2FwVmlzaWJpbGl0eSBmdW5jdGlvblxyXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xyXG4gIHZhciBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdmFyXHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XHJcblxyXG4gIGRpc3BsYXkuaW5pdGlhbGl6ZUV2ZW50cygpO1xyXG5cclxuICAvLyBhIGN1c3RvbSBmb2N1cyBoaWdobGlnaHQgKHNpbmNlIGR1bW15IG5vZGUncyBoYXZlIG5vIGJvdW5kcylcclxuICBjb25zdCBmb2N1c0hpZ2hsaWdodCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwLCAxMCApO1xyXG5cclxuICAvLyBjcmVhdGUgc29tZSBub2RlcyBmb3IgdGVzdGluZ1xyXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnYnV0dG9uJywgZm9jdXNIaWdobGlnaHQ6IGZvY3VzSGlnaGxpZ2h0IH0gKTtcclxuICBjb25zdCBiID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicsIGZvY3VzSGlnaGxpZ2h0OiBmb2N1c0hpZ2hsaWdodCB9ICk7XHJcbiAgY29uc3QgYyA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdidXR0b24nLCBmb2N1c0hpZ2hsaWdodDogZm9jdXNIaWdobGlnaHQgfSApO1xyXG5cclxuICByb290Tm9kZS5hZGRDaGlsZCggYSApO1xyXG4gIGEuY2hpbGRyZW4gPSBbIGIsIGMgXTtcclxuXHJcbiAgLy8gc3dhcCB2aXNpYmlsaXR5IGJldHdlZW4gdHdvIG5vZGVzLCB2aXNpYmlsaXR5IHNob3VsZCBiZSBzd2FwcGVkIGFuZCBuZWl0aGVyIHNob3VsZCBoYXZlIGtleWJvYXJkIGZvY3VzXHJcbiAgYi52aXNpYmxlID0gdHJ1ZTtcclxuICBjLnZpc2libGUgPSBmYWxzZTtcclxuICBiLnN3YXBWaXNpYmlsaXR5KCBjICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBiLnZpc2libGUsIGZhbHNlLCAnYiBzaG91bGQgbm93IGJlIGludmlzaWJsZScgKTtcclxuICBhc3NlcnQuZXF1YWwoIGMudmlzaWJsZSwgdHJ1ZSwgJ2Mgc2hvdWxkIG5vdyBiZSB2aXNpYmxlJyApO1xyXG4gIGFzc2VydC5lcXVhbCggYi5mb2N1c2VkLCBmYWxzZSwgJ2Igc2hvdWxkIG5vdCBoYXZlIGZvY3VzIGFmdGVyIGJlaW5nIG1hZGUgaW52aXNpYmxlJyApO1xyXG4gIGFzc2VydC5lcXVhbCggYy5mb2N1c2VkLCBmYWxzZSwgJ2Mgc2hvdWxkIG5vdCBoYXZlICBmb2N1cyBzaW5jZSBiIGRpZCBub3QgaGF2ZSBmb2N1cycgKTtcclxuXHJcbiAgLy8gc3dhcCB2aXNpYmlsaXR5IGJldHdlZW4gdHdvIG5vZGVzIHdoZXJlIHRoZSBvbmUgdGhhdCBpcyBpbml0aWFsbHkgdmlzaWJsZSBoYXMga2V5Ym9hcmQgZm9jdXMsIHRoZSBuZXdseSB2aXNpYmxlXHJcbiAgLy8gbm9kZSB0aGVuIHJlY2VpdmUgZm9jdXNcclxuICBiLnZpc2libGUgPSB0cnVlO1xyXG4gIGMudmlzaWJsZSA9IGZhbHNlO1xyXG4gIGIuZm9jdXMoKTtcclxuICBiLnN3YXBWaXNpYmlsaXR5KCBjICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBiLnZpc2libGUsIGZhbHNlLCAnYiBzaG91bGQgYmUgaW52aXNpYmxlIGFmdGVyIHN3YXBWaXNpYmlsaXR5JyApO1xyXG4gIGFzc2VydC5lcXVhbCggYy52aXNpYmxlLCB0cnVlLCAnYyBzaG91bGQgYmUgdmlzaWJsZSBhZnRlciAgc3dhcFZpc2liaWxpdHknICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBiLmZvY3VzZWQsIGZhbHNlLCAnYiBzaG91bGQgbm8gbG9uZ2VyIGhhdmUgZm9jdXMgIGFmdGVyIHN3YXBWaXNpYmlsaXR5JyApO1xyXG4gIGFzc2VydC5lcXVhbCggYy5mb2N1c2VkLCB0cnVlLCAnYyBzaG91bGQgbm93IGhhdmUgZm9jdXMgYWZ0ZXIgc3dhcFZpc2liaWxpdHknICk7XHJcblxyXG4gIC8vIHN3YXAgdmlzaWJpbGl0eSBiZXR3ZWVuIHR3byBub2RlcyB3aGVyZSB0aGUgb25lIHRoYXQgaXMgaW5pdGlhbGx5IHZpc2libGUgaGFzIGtleWJvYXJkIGZvY3VzLCB0aGUgbmV3bHkgdmlzaWJsZVxyXG4gIC8vIG5vZGUgdGhlbiByZWNlaXZlIGZvY3VzIC0gbGlrZSB0aGUgcHJldmlvdXMgdGVzdCBidXQgYy5zd2FwVmlzaWJpbGl0eSggYiApIGlzIHRoZSBzYW1lIGFzIGIuc3dhcFZpc2liaWxpdHkoIGMgKVxyXG4gIGIudmlzaWJsZSA9IHRydWU7XHJcbiAgYy52aXNpYmxlID0gZmFsc2U7XHJcbiAgYi5mb2N1cygpO1xyXG4gIGIuc3dhcFZpc2liaWxpdHkoIGMgKTtcclxuICBhc3NlcnQuZXF1YWwoIGIudmlzaWJsZSwgZmFsc2UsICdiIHNob3VsZCBiZSBpbnZpc2libGUgYWZ0ZXIgc3dhcFZpc2liaWxpdHknICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBjLnZpc2libGUsIHRydWUsICdjIHNob3VsZCBiZSB2aXNpYmxlIGFmdGVyICBzd2FwVmlzaWJpbGl0eScgKTtcclxuICBhc3NlcnQuZXF1YWwoIGIuZm9jdXNlZCwgZmFsc2UsICdiIHNob3VsZCBubyBsb25nZXIgaGF2ZSBmb2N1cyAgYWZ0ZXIgc3dhcFZpc2liaWxpdHknICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBjLmZvY3VzZWQsIHRydWUsICdjIHNob3VsZCBub3cgaGF2ZSBmb2N1cyBhZnRlciBzd2FwVmlzaWJpbGl0eScgKTtcclxuXHJcbiAgLy8gc3dhcCB2aXNpYmlsaXR5IGJldHdlZW4gdHdvIG5vZGVzIHdoZXJlIHRoZSBmaXJzdCBub2RlIGhhcyBmb2N1cywgYnV0IHRoZSBzZWNvbmQgbm9kZSBpcyBub3QgZm9jdXNhYmxlLiBBZnRlclxyXG4gIC8vIHN3YXBwaW5nLCBuZWl0aGVyIHNob3VsZCBoYXZlIGZvY3VzXHJcbiAgYi52aXNpYmxlID0gdHJ1ZTtcclxuICBjLnZpc2libGUgPSBmYWxzZTtcclxuICBiLmZvY3VzKCk7XHJcbiAgYy5mb2N1c2FibGUgPSBmYWxzZTtcclxuICBiLnN3YXBWaXNpYmlsaXR5KCBjICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBiLnZpc2libGUsIGZhbHNlLCAnYiBzaG91bGQgYmUgaW52aXNpYmxlIGFmdGVyIHZpc2liaWxpdHkgaXMgc3dhcHBlZCcgKTtcclxuICBhc3NlcnQuZXF1YWwoIGMudmlzaWJsZSwgdHJ1ZSwgJ2Mgc2hvdWxkIGJlIHZpc2libGUgYWZ0ZXIgdmlzaWJpbGl0eSBpcyBzd2FwcGVkJyApO1xyXG4gIGFzc2VydC5lcXVhbCggYi5mb2N1c2VkLCBmYWxzZSwgJ2Igc2hvdWxkIG5vIGxvbmdlciBoYXZlIGZvY3VzIGFmdGVyIHZpc2liaWxpdHkgaXMgc3dhcHBlZCcgKTtcclxuICBhc3NlcnQuZXF1YWwoIGMuZm9jdXNlZCwgZmFsc2UsICdjIHNob3VsZCBub3QgaGF2ZSBmb2N1cyBhZnRlciB2aXNpYmlsaXR5IGlzIHN3YXBwZWQgYmVjYXVzZSBpdCBpcyBub3QgZm9jdXNhYmxlJyApO1xyXG5cclxuICBkaXNwbGF5LmRpc3Bvc2UoKTtcclxuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0FyaWEgTGFiZWwgU2V0dGVyJywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgLy8gdGVzdCB0aGUgYmVoYXZpb3Igb2Ygc3dhcFZpc2liaWxpdHkgZnVuY3Rpb25cclxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcclxuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxuICAvLyBjcmVhdGUgc29tZSBub2RlcyBmb3IgdGVzdGluZ1xyXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnYnV0dG9uJywgYXJpYUxhYmVsOiBURVNUX0xBQkVMXzIgfSApO1xyXG5cclxuICBhc3NlcnQub2soIGEuYXJpYUxhYmVsID09PSBURVNUX0xBQkVMXzIsICdhcmlhLWxhYmVsIGdldHRlci9zZXR0ZXInICk7XHJcbiAgYXNzZXJ0Lm9rKCBhLmxhYmVsQ29udGVudCA9PT0gbnVsbCwgJ25vIG90aGVyIGxhYmVsIHNldCB3aXRoIGFyaWEtbGFiZWwnICk7XHJcbiAgYXNzZXJ0Lm9rKCBhLmlubmVyQ29udGVudCA9PT0gbnVsbCwgJ25vIGlubmVyIGNvbnRlbnQgc2V0IHdpdGggYXJpYS1sYWJlbCcgKTtcclxuXHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcclxuICBsZXQgYnV0dG9uQSA9IGEucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nITtcclxuICBhc3NlcnQub2soIGJ1dHRvbkEuZ2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbCcgKSA9PT0gVEVTVF9MQUJFTF8yLCAnc2V0dGVyIG9uIGRvbSBlbGVtZW50JyApO1xyXG4gIGFzc2VydC5vayggYnV0dG9uQS5pbm5lckhUTUwgPT09ICcnLCAnbm8gaW5uZXIgaHRtbCB3aXRoIGFyaWEtbGFiZWwgc2V0dGVyJyApO1xyXG5cclxuICBhLmFyaWFMYWJlbCA9IG51bGw7XHJcblxyXG4gIGJ1dHRvbkEgPSBhLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZyE7XHJcbiAgYXNzZXJ0Lm9rKCAhYnV0dG9uQS5oYXNBdHRyaWJ1dGUoICdhcmlhLWxhYmVsJyApLCAnc2V0dGVyIGNhbiBjbGVhciBvbiBkb20gZWxlbWVudCcgKTtcclxuICBhc3NlcnQub2soIGJ1dHRvbkEuaW5uZXJIVE1MID09PSAnJywgJ25vIGlubmVyIGh0bWwgd2l0aCBhcmlhLWxhYmVsIHNldHRlciB3aGVuIGNsZWFyaW5nJyApO1xyXG4gIGFzc2VydC5vayggYS5hcmlhTGFiZWwgPT09IG51bGwsICdjbGVhcmVkIGluIE5vZGUgbW9kZWwuJyApO1xyXG5cclxuICBwZG9tQXVkaXRSb290Tm9kZSggcm9vdE5vZGUgKTtcclxuICBkaXNwbGF5LmRpc3Bvc2UoKTtcclxuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ2ZvY3VzYWJsZSBvcHRpb24nLCBhc3NlcnQgPT4ge1xyXG5cclxuICAvLyB0ZXN0IHRoZSBiZWhhdmlvciBvZiBmb2N1c2FibGUgZnVuY3Rpb25cclxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcclxuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxuICBkaXNwbGF5LmluaXRpYWxpemVFdmVudHMoKTtcclxuXHJcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUgfSApO1xyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XHJcblxyXG4gIGFzc2VydC5lcXVhbCggYS5mb2N1c2FibGUsIHRydWUsICdmb2N1c2FibGUgb3B0aW9uIHNldHRlcicgKTtcclxuICBhc3NlcnQub2soIGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApLnRhYkluZGV4ID09PSAwLCAndGFiIGluZGV4IG9uIHByaW1hcnkgc2libGluZyB3aXRoIHNldHRlcicgKTtcclxuXHJcbiAgLy8gY2hhbmdlIHRoZSB0YWcgbmFtZSwgYnV0IGZvY3VzYWJsZSBzaG91bGQgc3RheSB0aGUgc2FtZVxyXG4gIGEudGFnTmFtZSA9ICdwJztcclxuXHJcbiAgYXNzZXJ0LmVxdWFsKCBhLmZvY3VzYWJsZSwgdHJ1ZSwgJ3RhZ05hbWUgb3B0aW9uIHNob3VsZCBub3QgY2hhbmdlIGZvY3VzYWJsZSB2YWx1ZScgKTtcclxuICBhc3NlcnQub2soIGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApLnRhYkluZGV4ID09PSAwLCAndGFnTmFtZSBvcHRpb24gc2hvdWxkIG5vdCBjaGFuZ2UgdGFiIGluZGV4IG9uIHByaW1hcnkgc2libGluZycgKTtcclxuXHJcbiAgYS5mb2N1c2FibGUgPSBmYWxzZTtcclxuICBhc3NlcnQub2soIGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApLnRhYkluZGV4ID09PSAtMSwgJ3NldCBmb2N1c2FibGUgZmFsc2UnICk7XHJcblxyXG4gIGNvbnN0IGIgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAncCcgfSApO1xyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBiICk7XHJcblxyXG4gIGIuZm9jdXNhYmxlID0gdHJ1ZTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBiLmZvY3VzYWJsZSwgJ3NldCBmb2N1c2FibGUgYXMgc2V0dGVyJyApO1xyXG4gIGFzc2VydC5vayggZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICkudGFiSW5kZXggPT09IDAsICdzZXQgZm9jdXNhYmxlIGFzIHNldHRlcicgKTtcclxuXHJcbiAgLy8gSFRNTCBlbGVtZW50cyB0aGF0IGFyZSBuYXRpdmVseSBmb2N1c2FibGUgYXJlIGZvY3VzYWJsZSBieSBkZWZhdWx0XHJcbiAgY29uc3QgYyA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdidXR0b24nIH0gKTtcclxuICBhc3NlcnQub2soIGMuZm9jdXNhYmxlLCAnYnV0dG9uIGlzIGZvY3VzYWJsZSBieSBkZWZhdWx0JyApO1xyXG5cclxuICAvLyBjaGFuZ2UgdGFnTmFtZSB0byBzb21ldGhpbmcgdGhhdCBpcyBub3QgZm9jdXNhYmxlLCBmb2N1c2FibGUgc2hvdWxkIGJlIGZhbHNlXHJcbiAgYy50YWdOYW1lID0gJ3AnO1xyXG4gIGFzc2VydC5vayggIWMuZm9jdXNhYmxlLCAnYnV0dG9uIGNoYW5nZWQgdG8gcGFyYWdyYXBoLCBzaG91bGQgbm8gbG9uZ2VyIGJlIGZvY3VzYWJsZScgKTtcclxuXHJcbiAgLy8gV2hlbiBmb2N1c2FibGUgaXMgc2V0IHRvIG51bGwgb24gYW4gZWxlbWVudCB0aGF0IGlzIG5vdCBmb2N1c2FibGUgYnkgZGVmYXVsdCwgaXQgc2hvdWxkIGxvc2UgZm9jdXNcclxuICBjb25zdCBkID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicsIGZvY3VzYWJsZTogdHJ1ZSwgZm9jdXNIaWdobGlnaHQ6IGZvY3VzSGlnaGxpZ2h0IH0gKTtcclxuICByb290Tm9kZS5hZGRDaGlsZCggZCApO1xyXG4gIGQuZm9jdXMoKTtcclxuICBhc3NlcnQub2soIGQuZm9jdXNlZCwgJ2ZvY3VzYWJsZSBkaXYgc2hvdWxkIGJlIGZvY3VzZWQgYWZ0ZXIgY2FsbGluZyBmb2N1cygpJyApO1xyXG5cclxuICBkLmZvY3VzYWJsZSA9IG51bGw7XHJcbiAgYXNzZXJ0Lm9rKCAhZC5mb2N1c2VkLCAnZGVmYXVsdCBkaXYgc2hvdWxkIGxvc2UgZm9jdXMgYWZ0ZXIgbm9kZSByZXN0b3JlZCB0byBudWxsIGZvY3VzYWJsZScgKTtcclxuXHJcbiAgZGlzcGxheS5kaXNwb3NlKCk7XHJcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdhcHBlbmQgc2libGluZ3MvYXBwZW5kTGFiZWwvYXBwZW5kRGVzY3JpcHRpb24gc2V0dGVycycsIGFzc2VydCA9PiB7XHJcblxyXG4gIC8vIHRlc3QgdGhlIGJlaGF2aW9yIG9mIGZvY3VzYWJsZSBmdW5jdGlvblxyXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xyXG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTtcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7XHJcbiAgICB0YWdOYW1lOiAnbGknLFxyXG4gICAgaW5uZXJDb250ZW50OiBURVNUX0lOTkVSX0NPTlRFTlQsXHJcbiAgICBsYWJlbFRhZ05hbWU6ICdoMycsXHJcbiAgICBsYWJlbENvbnRlbnQ6IFRFU1RfTEFCRUwsXHJcbiAgICBkZXNjcmlwdGlvbkNvbnRlbnQ6IFRFU1RfREVTQ1JJUFRJT04sXHJcbiAgICBjb250YWluZXJUYWdOYW1lOiAnc2VjdGlvbicsXHJcbiAgICBhcHBlbmRMYWJlbDogdHJ1ZVxyXG4gIH0gKTtcclxuICByb290Tm9kZS5hZGRDaGlsZCggYSApO1xyXG5cclxuICBjb25zdCBhRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApO1xyXG4gIGxldCBjb250YWluZXJFbGVtZW50ID0gYUVsZW1lbnQucGFyZW50RWxlbWVudCE7XHJcbiAgYXNzZXJ0Lm9rKCBjb250YWluZXJFbGVtZW50LnRhZ05hbWUudG9VcHBlckNhc2UoKSA9PT0gJ1NFQ1RJT04nLCAnY29udGFpbmVyIHBhcmVudCBpcyBzZXQgdG8gcmlnaHQgdGFnJyApO1xyXG5cclxuICBsZXQgcGVlckVsZW1lbnRzID0gY29udGFpbmVyRWxlbWVudC5jaGlsZE5vZGVzIGFzIHVua25vd24gYXMgSFRNTEVsZW1lbnRbXTtcclxuICBhc3NlcnQub2soIHBlZXJFbGVtZW50cy5sZW5ndGggPT09IDMsICdleHBlY3RlZCB0aHJlZSBzaWJsaW5ncycgKTtcclxuICBhc3NlcnQub2soIHBlZXJFbGVtZW50c1sgMCBdLnRhZ05hbWUudG9VcHBlckNhc2UoKSA9PT0gREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRSwgJ2Rlc2NyaXB0aW9uIGZpcnN0IHNpYmxpbmcnICk7XHJcbiAgYXNzZXJ0Lm9rKCBwZWVyRWxlbWVudHNbIDEgXS50YWdOYW1lLnRvVXBwZXJDYXNlKCkgPT09ICdMSScsICdwcmltYXJ5IHNpYmxpbmcgc2Vjb25kIHNpYmxpbmcnICk7XHJcbiAgYXNzZXJ0Lm9rKCBwZWVyRWxlbWVudHNbIDIgXS50YWdOYW1lLnRvVXBwZXJDYXNlKCkgPT09ICdIMycsICdsYWJlbCBzaWJsaW5nIGxhc3QnICk7XHJcblxyXG4gIGEuYXBwZW5kRGVzY3JpcHRpb24gPSB0cnVlO1xyXG4gIGNvbnRhaW5lckVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGEgKS5wYXJlbnRFbGVtZW50ITtcclxuICBwZWVyRWxlbWVudHMgPSBjb250YWluZXJFbGVtZW50LmNoaWxkTm9kZXMgYXMgdW5rbm93biBhcyBIVE1MRWxlbWVudFtdO1xyXG4gIGFzc2VydC5vayggY29udGFpbmVyRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMywgJ2V4cGVjdGVkIHRocmVlIHNpYmxpbmdzJyApO1xyXG4gIGFzc2VydC5vayggcGVlckVsZW1lbnRzWyAwIF0udGFnTmFtZS50b1VwcGVyQ2FzZSgpID09PSAnTEknLCAncHJpbWFyeSBzaWJsaW5nIGZpcnN0IHNpYmxpbmcnICk7XHJcbiAgYXNzZXJ0Lm9rKCBwZWVyRWxlbWVudHNbIDEgXS50YWdOYW1lLnRvVXBwZXJDYXNlKCkgPT09ICdIMycsICdsYWJlbCBzaWJsaW5nIHNlY29uZCcgKTtcclxuICBhc3NlcnQub2soIHBlZXJFbGVtZW50c1sgMiBdLnRhZ05hbWUudG9VcHBlckNhc2UoKSA9PT0gREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRSwgJ2Rlc2NyaXB0aW9uIGxhc3Qgc2libGluZycgKTtcclxuXHJcbiAgLy8gY2xlYXIgaXQgb3V0IGJhY2sgdG8gZGVmYXVsdHMgc2hvdWxkIHdvcmsgd2l0aCBzZXR0ZXJzXHJcbiAgYS5hcHBlbmREZXNjcmlwdGlvbiA9IGZhbHNlO1xyXG4gIGEuYXBwZW5kTGFiZWwgPSBmYWxzZTtcclxuICBjb250YWluZXJFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICkucGFyZW50RWxlbWVudCE7XHJcbiAgcGVlckVsZW1lbnRzID0gY29udGFpbmVyRWxlbWVudC5jaGlsZE5vZGVzIGFzIHVua25vd24gYXMgSFRNTEVsZW1lbnRbXTtcclxuICBhc3NlcnQub2soIGNvbnRhaW5lckVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggPT09IDMsICdleHBlY3RlZCB0aHJlZSBzaWJsaW5ncycgKTtcclxuICBhc3NlcnQub2soIHBlZXJFbGVtZW50c1sgMCBdLnRhZ05hbWUudG9VcHBlckNhc2UoKSA9PT0gJ0gzJywgJ2xhYmVsIHNpYmxpbmcgZmlyc3QnICk7XHJcbiAgYXNzZXJ0Lm9rKCBwZWVyRWxlbWVudHNbIDEgXS50YWdOYW1lLnRvVXBwZXJDYXNlKCkgPT09IERFRkFVTFRfREVTQ1JJUFRJT05fVEFHX05BTUUsICdkZXNjcmlwdGlvbiBzaWJsaW5nIHNlY29uZCcgKTtcclxuICBhc3NlcnQub2soIHBlZXJFbGVtZW50c1sgMiBdLnRhZ05hbWUudG9VcHBlckNhc2UoKSA9PT0gJ0xJJywgJ3ByaW1hcnkgc2libGluZyBsYXN0JyApO1xyXG5cclxuICAvLyB0ZXN0IG9yZGVyIHdoZW4gdXNpbmcgYXBwZW5kTGFiZWwvYXBwZW5kRGVzY3JpcHRpb24gd2l0aG91dCBhIHBhcmVudCBjb250YWluZXIgLSBvcmRlciBzaG91bGQgYmUgcHJpbWFyeSBzaWJsaW5nLFxyXG4gIC8vIGxhYmVsIHNpYmxpbmcsIGRlc2NyaXB0aW9uIHNpYmxpbmdcclxuICBjb25zdCBiID0gbmV3IE5vZGUoIHtcclxuICAgIHRhZ05hbWU6ICdpbnB1dCcsXHJcbiAgICBpbnB1dFR5cGU6ICdjaGVja2JveCcsXHJcbiAgICBsYWJlbFRhZ05hbWU6ICdsYWJlbCcsXHJcbiAgICBsYWJlbENvbnRlbnQ6IFRFU1RfTEFCRUwsXHJcbiAgICBkZXNjcmlwdGlvbkNvbnRlbnQ6IFRFU1RfREVTQ1JJUFRJT04sXHJcbiAgICBhcHBlbmRMYWJlbDogdHJ1ZSxcclxuICAgIGFwcGVuZERlc2NyaXB0aW9uOiB0cnVlXHJcbiAgfSApO1xyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBiICk7XHJcblxyXG4gIGxldCBiUGVlciA9IGdldFBET01QZWVyQnlOb2RlKCBiICk7XHJcbiAgbGV0IGJFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICk7XHJcbiAgbGV0IGJFbGVtZW50UGFyZW50ID0gYkVsZW1lbnQucGFyZW50RWxlbWVudCE7XHJcbiAgbGV0IGluZGV4T2ZQcmltYXJ5RWxlbWVudCA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoIGJFbGVtZW50UGFyZW50LmNoaWxkTm9kZXMsIGJFbGVtZW50ICk7XHJcblxyXG4gIGFzc2VydC5vayggYkVsZW1lbnRQYXJlbnQuY2hpbGROb2Rlc1sgaW5kZXhPZlByaW1hcnlFbGVtZW50IF0gPT09IGJFbGVtZW50LCAnYiBwcmltYXJ5IHNpYmxpbmcgZmlyc3Qgd2l0aCBubyBjb250YWluZXIsIGJvdGggYXBwZW5kZWQnICk7XHJcbiAgYXNzZXJ0Lm9rKCBiRWxlbWVudFBhcmVudC5jaGlsZE5vZGVzWyBpbmRleE9mUHJpbWFyeUVsZW1lbnQgKyAxIF0gPT09IGJQZWVyLmxhYmVsU2libGluZywgJ2IgbGFiZWwgc2libGluZyBzZWNvbmQgd2l0aCBubyBjb250YWluZXIsIGJvdGggYXBwZW5kZWQnICk7XHJcbiAgYXNzZXJ0Lm9rKCBiRWxlbWVudFBhcmVudC5jaGlsZE5vZGVzWyBpbmRleE9mUHJpbWFyeUVsZW1lbnQgKyAyIF0gPT09IGJQZWVyLmRlc2NyaXB0aW9uU2libGluZywgJ2IgZGVzY3JpcHRpb24gc2libGluZyB0aGlyZCB3aXRoIG5vIGNvbnRhaW5lciwgYm90aCBhcHBlbmRlZCcgKTtcclxuXHJcbiAgLy8gdGVzdCBvcmRlciB3aGVuIG9ubHkgZGVzY3JpcHRpb24gYXBwZW5kZWQgYW5kIG5vIHBhcmVudCBjb250YWluZXIgLSBvcmRlciBzaG91bGQgYmUgbGFiZWwsIHByaW1hcnksIHRoZW5cclxuICAvLyBkZXNjcmlwdGlvblxyXG4gIGIuYXBwZW5kTGFiZWwgPSBmYWxzZTtcclxuXHJcbiAgLy8gcmVmcmVzaCBzaW5jZSBvcGVyYXRpb24gbWF5IGhhdmUgY3JlYXRlZCBuZXcgT2JqZWN0c1xyXG4gIGJQZWVyID0gZ2V0UERPTVBlZXJCeU5vZGUoIGIgKTtcclxuICBiRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYiApO1xyXG4gIGJFbGVtZW50UGFyZW50ID0gYkVsZW1lbnQucGFyZW50RWxlbWVudCE7XHJcbiAgaW5kZXhPZlByaW1hcnlFbGVtZW50ID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbCggYkVsZW1lbnRQYXJlbnQuY2hpbGROb2RlcywgYkVsZW1lbnQgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBiRWxlbWVudFBhcmVudC5jaGlsZE5vZGVzWyBpbmRleE9mUHJpbWFyeUVsZW1lbnQgLSAxIF0gPT09IGJQZWVyLmxhYmVsU2libGluZywgJ2IgbGFiZWwgc2libGluZyBmaXJzdCB3aXRoIG5vIGNvbnRhaW5lciwgZGVzY3JpcHRpb24gYXBwZW5kZWQnICk7XHJcbiAgYXNzZXJ0Lm9rKCBiRWxlbWVudFBhcmVudC5jaGlsZE5vZGVzWyBpbmRleE9mUHJpbWFyeUVsZW1lbnQgXSA9PT0gYkVsZW1lbnQsICdiIHByaW1hcnkgc2libGluZyBzZWNvbmQgd2l0aCBubyBjb250YWluZXIsIGRlc2NyaXB0aW9uIGFwcGVuZGVkJyApO1xyXG4gIGFzc2VydC5vayggYkVsZW1lbnRQYXJlbnQuY2hpbGROb2Rlc1sgaW5kZXhPZlByaW1hcnlFbGVtZW50ICsgMSBdID09PSBiUGVlci5kZXNjcmlwdGlvblNpYmxpbmcsICdiIGRlc2NyaXB0aW9uIHNpYmxpbmcgdGhpcmQgd2l0aCBubyBjb250YWluZXIsIGRlc2NyaXB0aW9uIGFwcGVuZGVkJyApO1xyXG5cclxuICBwZG9tQXVkaXRSb290Tm9kZSggcm9vdE5vZGUgKTtcclxuICBkaXNwbGF5LmRpc3Bvc2UoKTtcclxuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ2NvbnRhaW5lckFyaWFSb2xlIG9wdGlvbicsIGFzc2VydCA9PiB7XHJcblxyXG4gIC8vIHRlc3QgdGhlIGJlaGF2aW9yIG9mIGZvY3VzYWJsZSBmdW5jdGlvblxyXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xyXG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTtcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7XHJcbiAgICB0YWdOYW1lOiAnZGl2JyxcclxuICAgIGNvbnRhaW5lclRhZ05hbWU6ICdkaXYnLFxyXG4gICAgY29udGFpbmVyQXJpYVJvbGU6ICdhcHBsaWNhdGlvbidcclxuICB9ICk7XHJcblxyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XHJcbiAgYXNzZXJ0Lm9rKCBhLmNvbnRhaW5lckFyaWFSb2xlID09PSAnYXBwbGljYXRpb24nLCAncm9sZSBhdHRyaWJ1dGUgc2hvdWxkIGJlIG9uIG5vZGUgcHJvcGVydHknICk7XHJcbiAgbGV0IGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XHJcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5wYXJlbnRFbGVtZW50IS5nZXRBdHRyaWJ1dGUoICdyb2xlJyApID09PSAnYXBwbGljYXRpb24nLCAncm9sZSBhdHRyaWJ1dGUgc2hvdWxkIGJlIG9uIHBhcmVudCBlbGVtZW50JyApO1xyXG5cclxuICBhLmNvbnRhaW5lckFyaWFSb2xlID0gbnVsbDtcclxuICBhc3NlcnQub2soIGEuY29udGFpbmVyQXJpYVJvbGUgPT09IG51bGwsICdyb2xlIGF0dHJpYnV0ZSBzaG91bGQgYmUgY2xlYXJlZCBvbiBub2RlJyApO1xyXG4gIGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XHJcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5wYXJlbnRFbGVtZW50IS5nZXRBdHRyaWJ1dGUoICdyb2xlJyApID09PSBudWxsLCAncm9sZSBhdHRyaWJ1dGUgc2hvdWxkIGJlIGNsZWFyZWQgb24gcGFyZW50IGVsZW1lbnQnICk7XHJcblxyXG4gIHBkb21BdWRpdFJvb3ROb2RlKCByb290Tm9kZSApO1xyXG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xyXG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XHJcblxyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnYXJpYVJvbGUgb3B0aW9uJywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgLy8gdGVzdCB0aGUgYmVoYXZpb3Igb2YgZm9jdXNhYmxlIGZ1bmN0aW9uXHJcbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XHJcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApO1xyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxuICBjb25zdCBhID0gbmV3IE5vZGUoIHtcclxuICAgIHRhZ05hbWU6ICdkaXYnLFxyXG4gICAgaW5uZXJDb250ZW50OiAnRHJhZ2dhYmxlJyxcclxuICAgIGFyaWFSb2xlOiAnYXBwbGljYXRpb24nXHJcbiAgfSApO1xyXG5cclxuICByb290Tm9kZS5hZGRDaGlsZCggYSApO1xyXG4gIGFzc2VydC5vayggYS5hcmlhUm9sZSA9PT0gJ2FwcGxpY2F0aW9uJywgJ3JvbGUgYXR0cmlidXRlIHNob3VsZCBiZSBvbiBub2RlIHByb3BlcnR5JyApO1xyXG4gIGxldCBhRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApO1xyXG4gIGFzc2VydC5vayggYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCAncm9sZScgKSA9PT0gJ2FwcGxpY2F0aW9uJywgJ3JvbGUgYXR0cmlidXRlIHNob3VsZCBiZSBvbiBlbGVtZW50JyApO1xyXG5cclxuICBhLmFyaWFSb2xlID0gbnVsbDtcclxuICBhc3NlcnQub2soIGEuYXJpYVJvbGUgPT09IG51bGwsICdyb2xlIGF0dHJpYnV0ZSBzaG91bGQgYmUgY2xlYXJlZCBvbiBub2RlJyApO1xyXG4gIGFFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICk7XHJcbiAgYXNzZXJ0Lm9rKCBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdyb2xlJyApID09PSBudWxsLCAncm9sZSBhdHRyaWJ1dGUgc2hvdWxkIGJlIGNsZWFyZWQgb24gZWxlbWVudCcgKTtcclxuXHJcbiAgcGRvbUF1ZGl0Um9vdE5vZGUoIHJvb3ROb2RlICk7XHJcbiAgZGlzcGxheS5kaXNwb3NlKCk7XHJcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbn0gKTtcclxuXHJcblxyXG4vLyBIaWdoZXIgbGV2ZWwgc2V0dGVyL2dldHRlciBvcHRpb25zXHJcblFVbml0LnRlc3QoICdhY2Nlc3NpYmxlTmFtZSBvcHRpb24nLCBhc3NlcnQgPT4ge1xyXG5cclxuICBhc3NlcnQub2soIHRydWUgKTtcclxuXHJcbiAgLy8gdGVzdCB0aGUgYmVoYXZpb3Igb2YgZm9jdXNhYmxlIGZ1bmN0aW9uXHJcbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XHJcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBhY2Nlc3NpYmxlTmFtZTogVEVTVF9MQUJFTCB9ICk7XHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBhLmFjY2Vzc2libGVOYW1lID09PSBURVNUX0xBQkVMLCAnYWNjZXNzaWJsZU5hbWUgZ2V0dGVyJyApO1xyXG5cclxuICBjb25zdCBhRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApO1xyXG4gIGFzc2VydC5vayggYUVsZW1lbnQudGV4dENvbnRlbnQgPT09IFRFU1RfTEFCRUwsICdhY2Nlc3NpYmxlTmFtZSBzZXR0ZXIgb24gZGl2JyApO1xyXG5cclxuICBjb25zdCBiID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2lucHV0JywgYWNjZXNzaWJsZU5hbWU6IFRFU1RfTEFCRUwsIGlucHV0VHlwZTogJ3JhbmdlJyB9ICk7XHJcbiAgYS5hZGRDaGlsZCggYiApO1xyXG4gIGNvbnN0IGJFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICk7XHJcbiAgY29uc3QgYlBhcmVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYiApLnBhcmVudEVsZW1lbnQhO1xyXG4gIGNvbnN0IGJMYWJlbFNpYmxpbmcgPSBiUGFyZW50LmNoaWxkcmVuWyBERUZBVUxUX0xBQkVMX1NJQkxJTkdfSU5ERVggXSE7XHJcbiAgYXNzZXJ0Lm9rKCBiTGFiZWxTaWJsaW5nLnRleHRDb250ZW50ID09PSBURVNUX0xBQkVMLCAnYWNjZXNzaWJsZU5hbWUgc2V0cyBsYWJlbCBzaWJsaW5nJyApO1xyXG4gIGFzc2VydC5vayggYkxhYmVsU2libGluZy5nZXRBdHRyaWJ1dGUoICdmb3InICkhLmluY2x1ZGVzKCBiRWxlbWVudC5pZCApLCAnYWNjZXNzaWJsZU5hbWUgc2V0cyBsYWJlbFxcJ3MgXCJmb3JcIiBhdHRyaWJ1dGUnICk7XHJcblxyXG4gIGNvbnN0IGMgPSBuZXcgTm9kZSggeyBjb250YWluZXJUYWdOYW1lOiAnZGl2JywgdGFnTmFtZTogJ2RpdicsIGFyaWFMYWJlbDogJ292ZXJyaWRlVGhpcycgfSApO1xyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBjICk7XHJcbiAgY29uc3QgY0FjY2Vzc2libGVOYW1lQmVoYXZpb3I6IFBET01CZWhhdmlvckZ1bmN0aW9uID0gKCBub2RlLCBvcHRpb25zLCBhY2Nlc3NpYmxlTmFtZSApID0+IHtcclxuICAgIG9wdGlvbnMuYXJpYUxhYmVsID0gYWNjZXNzaWJsZU5hbWU7XHJcbiAgICByZXR1cm4gb3B0aW9ucztcclxuICB9O1xyXG4gIGMuYWNjZXNzaWJsZU5hbWVCZWhhdmlvciA9IGNBY2Nlc3NpYmxlTmFtZUJlaGF2aW9yO1xyXG5cclxuICBhc3NlcnQub2soIGMuYWNjZXNzaWJsZU5hbWVCZWhhdmlvciA9PT0gY0FjY2Vzc2libGVOYW1lQmVoYXZpb3IsICdnZXR0ZXIgd29ya3MnICk7XHJcblxyXG4gIGxldCBjTGFiZWxFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBjICkucGFyZW50RWxlbWVudCEuY2hpbGRyZW5bIERFRkFVTFRfTEFCRUxfU0lCTElOR19JTkRFWCBdO1xyXG4gIGFzc2VydC5vayggY0xhYmVsRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsJyApID09PSAnb3ZlcnJpZGVUaGlzJywgJ2FjY2Vzc2libGVOYW1lQmVoYXZpb3Igc2hvdWxkIG5vdCB3b3JrIHVudGlsIHRoZXJlIGlzIGFjY2Vzc2libGUgbmFtZScgKTtcclxuICBjLmFjY2Vzc2libGVOYW1lID0gJ2FjY2Vzc2libGUgbmFtZSBkZXNjcmlwdGlvbic7XHJcbiAgY0xhYmVsRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYyApLnBhcmVudEVsZW1lbnQhLmNoaWxkcmVuWyBERUZBVUxUX0xBQkVMX1NJQkxJTkdfSU5ERVggXTtcclxuICBhc3NlcnQub2soIGNMYWJlbEVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbCcgKSA9PT0gJ2FjY2Vzc2libGUgbmFtZSBkZXNjcmlwdGlvbicsICdhY2Nlc3NpYmxlIG5hbWUgc2V0dGVyJyApO1xyXG5cclxuICBjLmFjY2Vzc2libGVOYW1lID0gJyc7XHJcblxyXG4gIGNMYWJlbEVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGMgKS5wYXJlbnRFbGVtZW50IS5jaGlsZHJlblsgREVGQVVMVF9MQUJFTF9TSUJMSU5HX0lOREVYIF07XHJcbiAgYXNzZXJ0Lm9rKCBjTGFiZWxFbGVtZW50LmdldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWwnICkgPT09ICcnLCAnYWNjZXNzaWJsZU5hbWVCZWhhdmlvciBzaG91bGQgd29yayBmb3IgZW1wdHkgc3RyaW5nJyApO1xyXG5cclxuICBjLmFjY2Vzc2libGVOYW1lID0gbnVsbDtcclxuICBjTGFiZWxFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBjICkucGFyZW50RWxlbWVudCEuY2hpbGRyZW5bIERFRkFVTFRfTEFCRUxfU0lCTElOR19JTkRFWCBdO1xyXG4gIGFzc2VydC5vayggY0xhYmVsRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsJyApID09PSAnb3ZlcnJpZGVUaGlzJywgJ2FjY2Vzc2libGVOYW1lQmVoYXZpb3Igc2hvdWxkIG5vdCB3b3JrIHVudGlsIHRoZXJlIGlzIGFjY2Vzc2libGUgbmFtZScgKTtcclxuXHJcblxyXG4gIGNvbnN0IGQgPSBuZXcgTm9kZSggeyBjb250YWluZXJUYWdOYW1lOiAnZGl2JywgdGFnTmFtZTogJ2RpdicgfSApO1xyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBkICk7XHJcbiAgY29uc3QgZEFjY2Vzc2libGVOYW1lQmVoYXZpb3I6IFBET01CZWhhdmlvckZ1bmN0aW9uID0gKCBub2RlLCBvcHRpb25zLCBhY2Nlc3NpYmxlTmFtZSApID0+IHtcclxuXHJcbiAgICBvcHRpb25zLmFyaWFMYWJlbCA9IGFjY2Vzc2libGVOYW1lO1xyXG4gICAgcmV0dXJuIG9wdGlvbnM7XHJcbiAgfTtcclxuICBkLmFjY2Vzc2libGVOYW1lQmVoYXZpb3IgPSBkQWNjZXNzaWJsZU5hbWVCZWhhdmlvcjtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBkLmFjY2Vzc2libGVOYW1lQmVoYXZpb3IgPT09IGRBY2Nlc3NpYmxlTmFtZUJlaGF2aW9yLCAnZ2V0dGVyIHdvcmtzJyApO1xyXG4gIGxldCBkTGFiZWxFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBkICkucGFyZW50RWxlbWVudCEuY2hpbGRyZW5bIERFRkFVTFRfTEFCRUxfU0lCTElOR19JTkRFWCBdO1xyXG4gIGFzc2VydC5vayggZExhYmVsRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsJyApID09PSBudWxsLCAnYWNjZXNzaWJsZU5hbWVCZWhhdmlvciBzaG91bGQgbm90IHdvcmsgdW50aWwgdGhlcmUgaXMgYWNjZXNzaWJsZSBuYW1lJyApO1xyXG4gIGNvbnN0IGFjY2Vzc2libGVOYW1lRGVzY3JpcHRpb24gPSAnYWNjZXNzaWJsZSBuYW1lIGRlc2NyaXB0aW9uJztcclxuICBkLmFjY2Vzc2libGVOYW1lID0gYWNjZXNzaWJsZU5hbWVEZXNjcmlwdGlvbjtcclxuICBkTGFiZWxFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBkICkucGFyZW50RWxlbWVudCEuY2hpbGRyZW5bIERFRkFVTFRfTEFCRUxfU0lCTElOR19JTkRFWCBdO1xyXG4gIGFzc2VydC5vayggZExhYmVsRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsJyApID09PSBhY2Nlc3NpYmxlTmFtZURlc2NyaXB0aW9uLCAnYWNjZXNzaWJsZSBuYW1lIHNldHRlcicgKTtcclxuXHJcbiAgZC5hY2Nlc3NpYmxlTmFtZSA9ICcnO1xyXG5cclxuICBkTGFiZWxFbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBkICkucGFyZW50RWxlbWVudCEuY2hpbGRyZW5bIERFRkFVTFRfTEFCRUxfU0lCTElOR19JTkRFWCBdO1xyXG4gIGFzc2VydC5vayggZExhYmVsRWxlbWVudC5nZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsJyApID09PSAnJywgJ2FjY2Vzc2libGVOYW1lQmVoYXZpb3Igc2hvdWxkIHdvcmsgZm9yIGVtcHR5IHN0cmluZycgKTtcclxuXHJcbiAgZC5hY2Nlc3NpYmxlTmFtZSA9IG51bGw7XHJcbiAgZExhYmVsRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggZCApLnBhcmVudEVsZW1lbnQhLmNoaWxkcmVuWyBERUZBVUxUX0xBQkVMX1NJQkxJTkdfSU5ERVggXTtcclxuICBhc3NlcnQub2soIGRMYWJlbEVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbCcgKSA9PT0gbnVsbCwgJ2FjY2Vzc2libGVOYW1lQmVoYXZpb3Igc2hvdWxkIG5vdCB3b3JrIHVudGlsIHRoZXJlIGlzIGFjY2Vzc2libGUgbmFtZScgKTtcclxuXHJcbiAgcGRvbUF1ZGl0Um9vdE5vZGUoIHJvb3ROb2RlICk7XHJcbiAgZGlzcGxheS5kaXNwb3NlKCk7XHJcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxufSApO1xyXG5cclxuXHJcblFVbml0LnRlc3QoICdwZG9tSGVhZGluZyBvcHRpb24nLCBhc3NlcnQgPT4ge1xyXG5cclxuICBhc3NlcnQub2soIHRydWUgKTtcclxuXHJcbiAgLy8gdGVzdCB0aGUgYmVoYXZpb3Igb2YgZm9jdXNhYmxlIGZ1bmN0aW9uXHJcbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XHJcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBwZG9tSGVhZGluZzogVEVTVF9MQUJFTCwgY29udGFpbmVyVGFnTmFtZTogJ2RpdicgfSApO1xyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XHJcblxyXG4gIGFzc2VydC5vayggYS5wZG9tSGVhZGluZyA9PT0gVEVTVF9MQUJFTCwgJ2FjY2Vzc2libGVOYW1lIGdldHRlcicgKTtcclxuXHJcbiAgY29uc3QgYUxhYmVsU2libGluZyA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYSApLnBhcmVudEVsZW1lbnQhLmNoaWxkcmVuWyBERUZBVUxUX0xBQkVMX1NJQkxJTkdfSU5ERVggXTtcclxuICBhc3NlcnQub2soIGFMYWJlbFNpYmxpbmcudGV4dENvbnRlbnQgPT09IFRFU1RfTEFCRUwsICdwZG9tSGVhZGluZyBzZXR0ZXIgb24gZGl2JyApO1xyXG4gIGFzc2VydC5vayggYUxhYmVsU2libGluZy50YWdOYW1lID09PSAnSDEnLCAncGRvbUhlYWRpbmcgc2V0dGVyIHNob3VsZCBiZSBoMScgKTtcclxuICBkaXNwbGF5LmRpc3Bvc2UoKTtcclxuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ2hlbHBUZXh0IG9wdGlvbicsIGFzc2VydCA9PiB7XHJcblxyXG4gIGFzc2VydC5vayggdHJ1ZSApO1xyXG5cclxuICAvLyB0ZXN0IHRoZSBiZWhhdmlvciBvZiBmb2N1c2FibGUgZnVuY3Rpb25cclxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcclxuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxuICAvLyBsYWJlbCB0YWcgbmVlZGVkIGZvciBkZWZhdWx0IHNpYmxpbmcgaW5kaWNlcyB0byB3b3JrXHJcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7XHJcbiAgICBjb250YWluZXJUYWdOYW1lOiAnZGl2JyxcclxuICAgIHRhZ05hbWU6ICdkaXYnLFxyXG4gICAgbGFiZWxUYWdOYW1lOiAnZGl2JyxcclxuICAgIGhlbHBUZXh0OiBURVNUX0RFU0NSSVBUSU9OXHJcbiAgfSApO1xyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XHJcblxyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBuZXcgTm9kZSggeyB0YWdOYW1lOiAnaW5wdXQnLCBpbnB1dFR5cGU6ICdyYW5nZScgfSApICk7XHJcbiAgYXNzZXJ0Lm9rKCBhLmhlbHBUZXh0ID09PSBURVNUX0RFU0NSSVBUSU9OLCAnaGVscFRleHQgZ2V0dGVyJyApO1xyXG5cclxuICAvLyBkZWZhdWx0IGZvciBoZWxwIHRleHQgaXMgdG8gYXBwZW5kIGRlc2NyaXB0aW9uIGFmdGVyIHRoZSBwcmltYXJ5IHNpYmxpbmdcclxuICBjb25zdCBhRGVzY3JpcHRpb25FbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBhICkucGFyZW50RWxlbWVudCEuY2hpbGRyZW5bIEFQUEVOREVEX0RFU0NSSVBUSU9OX1NJQkxJTkdfSU5ERVggXTtcclxuICBhc3NlcnQub2soIGFEZXNjcmlwdGlvbkVsZW1lbnQudGV4dENvbnRlbnQgPT09IFRFU1RfREVTQ1JJUFRJT04sICdoZWxwVGV4dCBzZXR0ZXIgb24gZGl2JyApO1xyXG5cclxuICBjb25zdCBiID0gbmV3IE5vZGUoIHtcclxuICAgIGNvbnRhaW5lclRhZ05hbWU6ICdkaXYnLFxyXG4gICAgdGFnTmFtZTogJ2J1dHRvbicsXHJcbiAgICBkZXNjcmlwdGlvbkNvbnRlbnQ6ICdvdmVycmlkZVRoaXMnLFxyXG4gICAgbGFiZWxUYWdOYW1lOiAnZGl2J1xyXG4gIH0gKTtcclxuICByb290Tm9kZS5hZGRDaGlsZCggYiApO1xyXG5cclxuICBiLmhlbHBUZXh0QmVoYXZpb3IgPSAoIG5vZGUsIG9wdGlvbnMsIGhlbHBUZXh0ICkgPT4ge1xyXG5cclxuICAgIG9wdGlvbnMuZGVzY3JpcHRpb25UYWdOYW1lID0gJ3AnO1xyXG4gICAgb3B0aW9ucy5kZXNjcmlwdGlvbkNvbnRlbnQgPSBoZWxwVGV4dDtcclxuICAgIHJldHVybiBvcHRpb25zO1xyXG4gIH07XHJcblxyXG4gIGxldCBiRGVzY3JpcHRpb25FbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICkucGFyZW50RWxlbWVudCEuY2hpbGRyZW5bIERFRkFVTFRfREVTQ1JJUFRJT05fU0lCTElOR19JTkRFWCBdO1xyXG4gIGFzc2VydC5vayggYkRlc2NyaXB0aW9uRWxlbWVudC50ZXh0Q29udGVudCA9PT0gJ292ZXJyaWRlVGhpcycsICdoZWxwVGV4dEJlaGF2aW9yIHNob3VsZCBub3Qgd29yayB1bnRpbCB0aGVyZSBpcyBoZWxwIHRleHQnICk7XHJcbiAgYi5oZWxwVGV4dCA9ICdoZWxwIHRleHQgZGVzY3JpcHRpb24nO1xyXG4gIGJEZXNjcmlwdGlvbkVsZW1lbnQgPSBnZXRQcmltYXJ5U2libGluZ0VsZW1lbnRCeU5vZGUoIGIgKS5wYXJlbnRFbGVtZW50IS5jaGlsZHJlblsgREVGQVVMVF9ERVNDUklQVElPTl9TSUJMSU5HX0lOREVYIF07XHJcbiAgYXNzZXJ0Lm9rKCBiRGVzY3JpcHRpb25FbGVtZW50LnRleHRDb250ZW50ID09PSAnaGVscCB0ZXh0IGRlc2NyaXB0aW9uJywgJ2hlbHAgdGV4dCBzZXR0ZXInICk7XHJcblxyXG4gIGIuaGVscFRleHQgPSAnJztcclxuXHJcbiAgYkRlc2NyaXB0aW9uRWxlbWVudCA9IGdldFByaW1hcnlTaWJsaW5nRWxlbWVudEJ5Tm9kZSggYiApLnBhcmVudEVsZW1lbnQhLmNoaWxkcmVuWyBERUZBVUxUX0RFU0NSSVBUSU9OX1NJQkxJTkdfSU5ERVggXTtcclxuICBhc3NlcnQub2soIGJEZXNjcmlwdGlvbkVsZW1lbnQudGV4dENvbnRlbnQgPT09ICcnLCAnaGVscFRleHRCZWhhdmlvciBzaG91bGQgd29yayBmb3IgZW1wdHkgc3RyaW5nJyApO1xyXG5cclxuICBiLmhlbHBUZXh0ID0gbnVsbDtcclxuICBiRGVzY3JpcHRpb25FbGVtZW50ID0gZ2V0UHJpbWFyeVNpYmxpbmdFbGVtZW50QnlOb2RlKCBiICkucGFyZW50RWxlbWVudCEuY2hpbGRyZW5bIERFRkFVTFRfREVTQ1JJUFRJT05fU0lCTElOR19JTkRFWCBdO1xyXG4gIGFzc2VydC5vayggYkRlc2NyaXB0aW9uRWxlbWVudC50ZXh0Q29udGVudCA9PT0gJ292ZXJyaWRlVGhpcycsICdoZWxwVGV4dEJlaGF2aW9yIHNob3VsZCBub3Qgd29yayB1bnRpbCB0aGVyZSBpcyBoZWxwIHRleHQnICk7XHJcblxyXG4gIHBkb21BdWRpdFJvb3ROb2RlKCByb290Tm9kZSApO1xyXG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xyXG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdtb3ZlIHRvIGZyb250L21vdmUgdG8gYmFjaycsIGFzc2VydCA9PiB7XHJcblxyXG4gIC8vIG1ha2Ugc3VyZSBzdGF0ZSBpcyByZXN0b3JlZCBhZnRlciBtb3ZpbmcgY2hpbGRyZW4gdG8gZnJvbnQgYW5kIGJhY2tcclxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcclxuICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7XHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XHJcblxyXG4gIGRpc3BsYXkuaW5pdGlhbGl6ZUV2ZW50cygpO1xyXG5cclxuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicsIGZvY3VzSGlnaGxpZ2h0OiBURVNUX0hJR0hMSUdIVCB9ICk7XHJcbiAgY29uc3QgYiA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdidXR0b24nLCBmb2N1c0hpZ2hsaWdodDogVEVTVF9ISUdITElHSFQgfSApO1xyXG4gIHJvb3ROb2RlLmNoaWxkcmVuID0gWyBhLCBiIF07XHJcbiAgYi5mb2N1cygpO1xyXG5cclxuICAvLyBhZnRlciBtb3ZpbmcgYSB0byBmcm9udCwgYiBzaG91bGQgc3RpbGwgaGF2ZSBmb2N1c1xyXG4gIGEubW92ZVRvRnJvbnQoKTtcclxuICBhc3NlcnQub2soIGIuZm9jdXNlZCwgJ2Igc2hvdWxkIGhhdmUgZm9jdXMgYWZ0ZXIgYSBtb3ZlZCB0byBmcm9udCcgKTtcclxuXHJcbiAgLy8gYWZ0ZXIgbW92aW5nIGEgdG8gYmFjaywgYiBzaG91bGQgc3RpbGwgaGF2ZSBmb2N1c1xyXG4gIGEubW92ZVRvQmFjaygpO1xyXG5cclxuICAvLyBhZGQgYSBndWFyZCB3aGVyZSB3ZSBkb24ndCBjaGVjayB0aGlzIGlmIGZvY3VzIGhhcyBiZWVuIG1vdmVkIHNvbWV3aGVyZSBlbHNlLiBUaGlzIGhhcHBlbnMgc29tZXRpbWVzIHdpdGhcclxuICAvLyBkZXYgdG9vbHMgb3Igb3RoZXIgd2luZG93cyBvcGVuZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODI3XHJcbiAgaWYgKCBkb2N1bWVudC5ib2R5LmNvbnRhaW5zKCBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICkgJiYgZG9jdW1lbnQuYm9keSAhPT0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCApIHtcclxuICAgIGFzc2VydC5vayggYi5mb2N1c2VkLCAnYiBzaG91bGQgaGF2ZSBmb2N1cyBhZnRlciBhIG1vdmVkIHRvIGJhY2snICk7XHJcbiAgfVxyXG5cclxuICBkaXNwbGF5LmRpc3Bvc2UoKTtcclxuICBkaXNwbGF5LmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCEucmVtb3ZlQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ05vZGUuZW5hYmxlZFByb3BlcnR5IHdpdGggUERPTScsIGFzc2VydCA9PiB7XHJcblxyXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xyXG4gIHZhciBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdmFyXHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XHJcblxyXG4gIGNvbnN0IHBkb21Ob2RlID0gbmV3IE5vZGUoIHtcclxuICAgIHRhZ05hbWU6ICdwJ1xyXG4gIH0gKTtcclxuXHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIHBkb21Ob2RlICk7XHJcbiAgYXNzZXJ0Lm9rKCBwZG9tTm9kZS5wZG9tSW5zdGFuY2VzLmxlbmd0aCA9PT0gMSwgJ3Nob3VsZCBoYXZlIGFuIGluc3RhbmNlIHdoZW4gYXR0YWNoZWQgdG8gZGlzcGxheScgKTtcclxuICBhc3NlcnQub2soICEhcGRvbU5vZGUucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIsICdzaG91bGQgaGF2ZSBhIHBlZXInICk7XHJcblxyXG4gIGFzc2VydC5vayggcGRvbU5vZGUucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nIS5nZXRBdHRyaWJ1dGUoICdhcmlhLWRpc2FibGVkJyApICE9PSAndHJ1ZScsICdzaG91bGQgYmUgZW5hYmxlZCB0byBzdGFydCcgKTtcclxuICBwZG9tTm9kZS5lbmFibGVkID0gZmFsc2U7XHJcbiAgYXNzZXJ0Lm9rKCBwZG9tTm9kZS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciEucHJpbWFyeVNpYmxpbmchLmdldEF0dHJpYnV0ZSggJ2FyaWEtZGlzYWJsZWQnICkgPT09ICd0cnVlJywgJ3Nob3VsZCBiZSBhcmlhLWRpc2FibGVkIHdoZW4gZGlzYWJsZWQnICk7XHJcbiAgcGRvbU5vZGUuZW5hYmxlZCA9IHRydWU7XHJcbiAgYXNzZXJ0Lm9rKCBwZG9tTm9kZS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciEucHJpbWFyeVNpYmxpbmchLmdldEF0dHJpYnV0ZSggJ2FyaWEtZGlzYWJsZWQnICkgPT09ICdmYWxzZScsICdBY3R1YWxseSBzZXQgdG8gZmFsc2Ugc2luY2UgaXQgd2FzIHByZXZpb3VzbHkgZGlzYWJsZWQuJyApO1xyXG4gIHBkb21Ob2RlLmRpc3Bvc2U7XHJcbiAgZGlzcGxheS5kaXNwb3NlKCk7XHJcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxufSApO1xyXG5cclxuLy8gdGhlc2UgZnV6emVycyB0YWtlIHRpbWUsIHNvIGl0IGlzIG5pY2Ugd2hlbiB0aGV5IGFyZSBsYXN0XHJcblFVbml0LnRlc3QoICdEaXNwbGF5LmludGVyYWN0aXZlIHRvZ2dsaW5nIGluIHRoZSBQRE9NJywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XHJcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12YXJcclxuICBkaXNwbGF5LmluaXRpYWxpemVFdmVudHMoKTtcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuXHJcbiAgY29uc3QgcGRvbVJhbmdlQ2hpbGQgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnaW5wdXQnLCBpbnB1dFR5cGU6ICdyYW5nZScgfSApO1xyXG4gIGNvbnN0IHBkb21QYXJhZ3JhcGhDaGlsZCA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdwJyB9ICk7XHJcbiAgY29uc3QgcGRvbUJ1dHRvbkNoaWxkID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xyXG5cclxuICBjb25zdCBwZG9tUGFyZW50ID0gbmV3IE5vZGUoIHtcclxuICAgIHRhZ05hbWU6ICdidXR0b24nLFxyXG4gICAgY2hpbGRyZW46IFsgcGRvbVJhbmdlQ2hpbGQsIHBkb21QYXJhZ3JhcGhDaGlsZCwgcGRvbUJ1dHRvbkNoaWxkIF1cclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IERJU0FCTEVEX1RSVUUgPSB0cnVlO1xyXG5cclxuICAvLyBGb3Igb2YgbGlzdCBvZiBodG1sIGVsZW1lbnRzIHRoYXQgc3VwcG9ydCBkaXNhYmxlZCwgc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0hUTUwvQXR0cmlidXRlcy9kaXNhYmxlZFxyXG4gIGNvbnN0IERFRkFVTFRfRElTQUJMRURfV0hFTl9TVVBQT1JURUQgPSBmYWxzZTtcclxuICBjb25zdCBERUZBVUxUX0RJU0FCTEVEX1dIRU5fTk9UX1NVUFBPUlRFRCA9IHVuZGVmaW5lZDtcclxuXHJcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIHBkb21QYXJlbnQgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnaW5pdGlhbCBjYXNlJyApO1xyXG5cclxuICBjb25zdCB0ZXN0RGlzYWJsZWQgPSAoIG5vZGU6IE5vZGUsIGRpc2FibGVkOiBib29sZWFuIHwgdW5kZWZpbmVkLCBtZXNzYWdlOiBzdHJpbmcsIHBkb21JbnN0YW5jZSA9IDAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBcImRpc2FibGVkXCIgaXMgb25seSBzdXBwb3J0ZWQgYnkgY2VydGFpbiBhdHRyaWJ1dGVzLCBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSFRNTC9BdHRyaWJ1dGVzL2Rpc2FibGVkXHJcbiAgICBhc3NlcnQub2soIG5vZGUucGRvbUluc3RhbmNlc1sgcGRvbUluc3RhbmNlIF0ucGVlciEucHJpbWFyeVNpYmxpbmchLmRpc2FibGVkID09PSBkaXNhYmxlZCwgbWVzc2FnZSApO1xyXG4gIH07XHJcblxyXG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmVudCwgREVGQVVMVF9ESVNBQkxFRF9XSEVOX1NVUFBPUlRFRCwgJ3Bkb21QYXJlbnQgaW5pdGlhbCBubyBkaXNhYmxlZCcgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21SYW5nZUNoaWxkLCBERUZBVUxUX0RJU0FCTEVEX1dIRU5fU1VQUE9SVEVELCAncGRvbVJhbmdlQ2hpbGQgaW5pdGlhbCBubyBkaXNhYmxlZCcgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJhZ3JhcGhDaGlsZCwgREVGQVVMVF9ESVNBQkxFRF9XSEVOX05PVF9TVVBQT1JURUQsICdwZG9tUGFyYWdyYXBoQ2hpbGQgaW5pdGlhbCBubyBkaXNhYmxlZCcgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgREVGQVVMVF9ESVNBQkxFRF9XSEVOX1NVUFBPUlRFRCwgJ3Bkb21CdXR0b25DaGlsZCBpbml0aWFsIG5vIGRpc2FibGVkJyApO1xyXG5cclxuICBkaXNwbGF5LmludGVyYWN0aXZlID0gZmFsc2U7XHJcblxyXG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmVudCwgRElTQUJMRURfVFJVRSwgJ3Bkb21QYXJlbnQgdG9nZ2xlZCBub3QgaW50ZXJhY3RpdmUnICk7XHJcbiAgdGVzdERpc2FibGVkKCBwZG9tUmFuZ2VDaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21SYW5nZUNoaWxkIHRvZ2dsZWQgbm90IGludGVyYWN0aXZlJyApO1xyXG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmFncmFwaENoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbVBhcmFncmFwaENoaWxkIHRvZ2dsZWQgbm90IGludGVyYWN0aXZlJyApO1xyXG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbUJ1dHRvbkNoaWxkIHRvZ2dsZWQgbm90IGludGVyYWN0aXZlJyApO1xyXG5cclxuICBkaXNwbGF5LmludGVyYWN0aXZlID0gdHJ1ZTtcclxuXHJcbiAgdGVzdERpc2FibGVkKCBwZG9tUGFyZW50LCBERUZBVUxUX0RJU0FCTEVEX1dIRU5fU1VQUE9SVEVELCAncGRvbVBhcmVudCB0b2dnbGVkIGJhY2sgdG8gaW50ZXJhY3RpdmUnICk7XHJcbiAgdGVzdERpc2FibGVkKCBwZG9tUmFuZ2VDaGlsZCwgREVGQVVMVF9ESVNBQkxFRF9XSEVOX1NVUFBPUlRFRCwgJ3Bkb21SYW5nZUNoaWxkIHRvZ2dsZWQgYmFjayB0byBpbnRlcmFjdGl2ZScgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJhZ3JhcGhDaGlsZCwgREVGQVVMVF9ESVNBQkxFRF9XSEVOX05PVF9TVVBQT1JURUQsICdwZG9tUGFyYWdyYXBoQ2hpbGQgdG9nZ2xlZCBiYWNrIHRvIGludGVyYWN0aXZlJyApO1xyXG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBERUZBVUxUX0RJU0FCTEVEX1dIRU5fU1VQUE9SVEVELCAncGRvbUJ1dHRvbkNoaWxkIHRvZ2dsZWQgYmFjayB0byBpbnRlcmFjdGl2ZScgKTtcclxuXHJcbiAgZGlzcGxheS5pbnRlcmFjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJlbnQsIERJU0FCTEVEX1RSVUUsICdwZG9tUGFyZW50IHNlY29uZCB0b2dnbGVkIG5vdCBpbnRlcmFjdGl2ZScgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21SYW5nZUNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbVJhbmdlQ2hpbGQgc2Vjb25kIHRvZ2dsZWQgbm90IGludGVyYWN0aXZlJyApO1xyXG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmFncmFwaENoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbVBhcmFncmFwaENoaWxkIHNlY29uZCB0b2dnbGVkIG5vdCBpbnRlcmFjdGl2ZScgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21CdXR0b25DaGlsZCBzZWNvbmQgdG9nZ2xlZCBub3QgaW50ZXJhY3RpdmUnICk7XHJcblxyXG4gIHBkb21QYXJlbnQuc2V0UERPTUF0dHJpYnV0ZSggJ2Rpc2FibGVkJywgdHJ1ZSwgeyBhc1Byb3BlcnR5OiB0cnVlIH0gKTtcclxuICBwZG9tUmFuZ2VDaGlsZC5zZXRQRE9NQXR0cmlidXRlKCAnZGlzYWJsZWQnLCB0cnVlLCB7IGFzUHJvcGVydHk6IHRydWUgfSApO1xyXG4gIHBkb21QYXJhZ3JhcGhDaGlsZC5zZXRQRE9NQXR0cmlidXRlKCAnZGlzYWJsZWQnLCB0cnVlLCB7IGFzUHJvcGVydHk6IHRydWUgfSApO1xyXG4gIHBkb21CdXR0b25DaGlsZC5zZXRQRE9NQXR0cmlidXRlKCAnZGlzYWJsZWQnLCB0cnVlLCB7IGFzUHJvcGVydHk6IHRydWUgfSApO1xyXG5cclxuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJlbnQsIERJU0FCTEVEX1RSVUUsICdwZG9tUGFyZW50IG5vdCBpbnRlcmFjdGl2ZSBhZnRlciBzZXR0aW5nIGRpc2FibGVkIG1hbnVhbGx5IGFzIHByb3BlcnR5LCBkaXNwbGF5IG5vdCBpbnRlcmFjdGl2ZScgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21SYW5nZUNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbVJhbmdlQ2hpbGQgbm90IGludGVyYWN0aXZlIGFmdGVyIHNldHRpbmcgZGlzYWJsZWQgbWFudWFsbHkgYXMgcHJvcGVydHksIGRpc3BsYXkgbm90IGludGVyYWN0aXZlJyApO1xyXG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmFncmFwaENoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbVBhcmFncmFwaENoaWxkIG5vdCBpbnRlcmFjdGl2ZSBhZnRlciBzZXR0aW5nIGRpc2FibGVkIG1hbnVhbGx5IGFzIHByb3BlcnR5LCBkaXNwbGF5IG5vdCBpbnRlcmFjdGl2ZScgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21CdXR0b25DaGlsZCBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgc2V0dGluZyBkaXNhYmxlZCBtYW51YWxseSBhcyBwcm9wZXJ0eSwgZGlzcGxheSBub3QgaW50ZXJhY3RpdmUnICk7XHJcblxyXG4gIGRpc3BsYXkuaW50ZXJhY3RpdmUgPSB0cnVlO1xyXG5cclxuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJlbnQsIERJU0FCTEVEX1RSVUUsICdwZG9tUGFyZW50IG5vdCBpbnRlcmFjdGl2ZSBhZnRlciBzZXR0aW5nIGRpc2FibGVkIG1hbnVhbGx5IGFzIHByb3BlcnR5IGRpc3BsYXkgaW50ZXJhY3RpdmUnICk7XHJcbiAgdGVzdERpc2FibGVkKCBwZG9tUmFuZ2VDaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21SYW5nZUNoaWxkIG5vdCBpbnRlcmFjdGl2ZSBhZnRlciBzZXR0aW5nIGRpc2FibGVkIG1hbnVhbGx5IGFzIHByb3BlcnR5IGRpc3BsYXkgaW50ZXJhY3RpdmUnICk7XHJcbiAgdGVzdERpc2FibGVkKCBwZG9tUGFyYWdyYXBoQ2hpbGQsIERJU0FCTEVEX1RSVUUsICdwZG9tUGFyYWdyYXBoQ2hpbGQgbm90IGludGVyYWN0aXZlIGFmdGVyIHNldHRpbmcgZGlzYWJsZWQgbWFudWFsbHkgYXMgcHJvcGVydHkgZGlzcGxheSBpbnRlcmFjdGl2ZScgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21CdXR0b25DaGlsZCBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgc2V0dGluZyBkaXNhYmxlZCBtYW51YWxseSBhcyBwcm9wZXJ0eSBkaXNwbGF5IGludGVyYWN0aXZlJyApO1xyXG5cclxuICBkaXNwbGF5LmludGVyYWN0aXZlID0gZmFsc2U7XHJcblxyXG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmVudCwgRElTQUJMRURfVFJVRSwgJ3Bkb21QYXJlbnQgc3RpbGwgZGlzYWJsZWQgd2hlbiBkaXNwbGF5IGlzIG5vdCBpbnRlcmFjdGl2ZSBhZ2Fpbi4nICk7XHJcbiAgdGVzdERpc2FibGVkKCBwZG9tUmFuZ2VDaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21SYW5nZUNoaWxkIHN0aWxsIGRpc2FibGVkIHdoZW4gZGlzcGxheSBpcyBub3QgaW50ZXJhY3RpdmUgYWdhaW4uJyApO1xyXG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmFncmFwaENoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbVBhcmFncmFwaENoaWxkIHN0aWxsIGRpc2FibGVkIHdoZW4gZGlzcGxheSBpcyBub3QgaW50ZXJhY3RpdmUgYWdhaW4uJyApO1xyXG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbUJ1dHRvbkNoaWxkIHN0aWxsIGRpc2FibGVkIHdoZW4gZGlzcGxheSBpcyBub3QgaW50ZXJhY3RpdmUgYWdhaW4uJyApO1xyXG5cclxuICBwZG9tUGFyZW50LnJlbW92ZVBET01BdHRyaWJ1dGUoICdkaXNhYmxlZCcgKTtcclxuICBwZG9tUmFuZ2VDaGlsZC5yZW1vdmVQRE9NQXR0cmlidXRlKCAnZGlzYWJsZWQnICk7XHJcbiAgcGRvbVBhcmFncmFwaENoaWxkLnJlbW92ZVBET01BdHRyaWJ1dGUoICdkaXNhYmxlZCcgKTtcclxuICBwZG9tQnV0dG9uQ2hpbGQucmVtb3ZlUERPTUF0dHJpYnV0ZSggJ2Rpc2FibGVkJyApO1xyXG5cclxuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJlbnQsIERJU0FCTEVEX1RSVUUsICdwZG9tUGFyZW50IHN0aWxsIGRpc2FibGVkIGZyb20gZGlzcGxheSBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgbG9jYWwgcHJvcGVydHkgcmVtb3ZlZC4nICk7XHJcbiAgdGVzdERpc2FibGVkKCBwZG9tUmFuZ2VDaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21SYW5nZUNoaWxkIHN0aWxsIGRpc2FibGVkIGZyb20gZGlzcGxheSBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgbG9jYWwgcHJvcGVydHkgcmVtb3ZlZC4nICk7XHJcbiAgdGVzdERpc2FibGVkKCBwZG9tUGFyYWdyYXBoQ2hpbGQsIERJU0FCTEVEX1RSVUUsICdwZG9tUGFyYWdyYXBoQ2hpbGQgc3RpbGwgZGlzYWJsZWQgZnJvbSBkaXNwbGF5IG5vdCBpbnRlcmFjdGl2ZSBhZnRlciBsb2NhbCBwcm9wZXJ0eSByZW1vdmVkLicgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21CdXR0b25DaGlsZCBzdGlsbCBkaXNhYmxlZCBmcm9tIGRpc3BsYXkgbm90IGludGVyYWN0aXZlIGFmdGVyIGxvY2FsIHByb3BlcnR5IHJlbW92ZWQuJyApO1xyXG5cclxuICBkaXNwbGF5LmludGVyYWN0aXZlID0gdHJ1ZTtcclxuXHJcbiAgdGVzdERpc2FibGVkKCBwZG9tUGFyZW50LCBERUZBVUxUX0RJU0FCTEVEX1dIRU5fU1VQUE9SVEVELCAncGRvbVBhcmVudCBpbnRlcmFjdGl2ZSBub3cgd2l0aG91dCBsb2NhbCBwcm9wZXJ0eS4nICk7XHJcbiAgdGVzdERpc2FibGVkKCBwZG9tUmFuZ2VDaGlsZCwgREVGQVVMVF9ESVNBQkxFRF9XSEVOX1NVUFBPUlRFRCwgJ3Bkb21SYW5nZUNoaWxkIGludGVyYWN0aXZlIG5vdyB3aXRob3V0IGxvY2FsIHByb3BlcnR5LicgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJhZ3JhcGhDaGlsZCwgREVGQVVMVF9ESVNBQkxFRF9XSEVOX1NVUFBPUlRFRCwgJ3Bkb21QYXJhZ3JhcGhDaGlsZCBpbnRlcmFjdGl2ZSBub3cgd2l0aG91dCBsb2NhbCBwcm9wZXJ0eS4nICk7XHJcbiAgdGVzdERpc2FibGVkKCBwZG9tQnV0dG9uQ2hpbGQsIERFRkFVTFRfRElTQUJMRURfV0hFTl9TVVBQT1JURUQsICdwZG9tQnV0dG9uQ2hpbGQgaW50ZXJhY3RpdmUgbm93IHdpdGhvdXQgbG9jYWwgcHJvcGVydHkuJyApO1xyXG5cclxuICBwZG9tUGFyZW50LnNldFBET01BdHRyaWJ1dGUoICdkaXNhYmxlZCcsICcnICk7XHJcbiAgcGRvbVJhbmdlQ2hpbGQuc2V0UERPTUF0dHJpYnV0ZSggJ2Rpc2FibGVkJywgJycgKTtcclxuICBwZG9tUGFyYWdyYXBoQ2hpbGQuc2V0UERPTUF0dHJpYnV0ZSggJ2Rpc2FibGVkJywgJycgKTtcclxuICBwZG9tQnV0dG9uQ2hpbGQuc2V0UERPTUF0dHJpYnV0ZSggJ2Rpc2FibGVkJywgJycgKTtcclxuXHJcbiAgdGVzdERpc2FibGVkKCBwZG9tUGFyZW50LCBESVNBQkxFRF9UUlVFLCAncGRvbVBhcmVudCBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgc2V0dGluZyBkaXNhYmxlZCBtYW51YWxseSBhcyBhdHRyaWJ1dGUsIGRpc3BsYXkgbm90IGludGVyYWN0aXZlJyApO1xyXG4gIHRlc3REaXNhYmxlZCggcGRvbVJhbmdlQ2hpbGQsIERJU0FCTEVEX1RSVUUsICdwZG9tUmFuZ2VDaGlsZCBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgc2V0dGluZyBkaXNhYmxlZCBtYW51YWxseSBhcyBhdHRyaWJ1dGUsIGRpc3BsYXkgbm90IGludGVyYWN0aXZlJyApO1xyXG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbUJ1dHRvbkNoaWxkIG5vdCBpbnRlcmFjdGl2ZSBhZnRlciBzZXR0aW5nIGRpc2FibGVkIG1hbnVhbGx5IGFzIGF0dHJpYnV0ZSwgZGlzcGxheSBub3QgaW50ZXJhY3RpdmUnICk7XHJcblxyXG4gIGRpc3BsYXkuaW50ZXJhY3RpdmUgPSB0cnVlO1xyXG5cclxuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJlbnQsIERJU0FCTEVEX1RSVUUsICdwZG9tUGFyZW50IG5vdCBpbnRlcmFjdGl2ZSBhZnRlciBzZXR0aW5nIGRpc2FibGVkIG1hbnVhbGx5IGFzIGF0dHJpYnV0ZSBkaXNwbGF5IGludGVyYWN0aXZlJyApO1xyXG4gIHRlc3REaXNhYmxlZCggcGRvbVJhbmdlQ2hpbGQsIERJU0FCTEVEX1RSVUUsICdwZG9tUmFuZ2VDaGlsZCBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgc2V0dGluZyBkaXNhYmxlZCBtYW51YWxseSBhcyBhdHRyaWJ1dGUgZGlzcGxheSBpbnRlcmFjdGl2ZScgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21CdXR0b25DaGlsZCBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgc2V0dGluZyBkaXNhYmxlZCBtYW51YWxseSBhcyBhdHRyaWJ1dGUgZGlzcGxheSBpbnRlcmFjdGl2ZScgKTtcclxuXHJcbiAgLy8gVGhpcyB0ZXN0IGRvZXNuJ3Qgd29yaywgYmVjYXVzZSBwYXJhZ3JhcGhzIGRvbid0IHN1cHBvcnQgZGlzYWJsZWQsIHNvIHRoZSBhdHRyaWJ1dGUgXCJkaXNhYmxlZFwiIHdvbid0XHJcbiAgLy8gYXV0b21hdGljYWxseSB0cmFuc2ZlciBvdmVyIHRvIHRoZSBwcm9wZXJ0eSB2YWx1ZSBsaWtlIGZvciB0aGUgb3RoZXJzLiBGb3IgYSBsaXN0IG9mIEVsZW1lbnRzIHRoYXQgc3VwcG9ydCBcImRpc2FibGVkXCIsIHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVE1ML0F0dHJpYnV0ZXMvZGlzYWJsZWRcclxuICAvLyB0ZXN0RGlzYWJsZWQoIHBkb21QYXJhZ3JhcGhDaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21QYXJhZ3JhcGhDaGlsZCBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgc2V0dGluZyBkaXNhYmxlZCBtYW51YWxseSBhcyBhdHRyaWJ1dGUsIGRpc3BsYXkgIGludGVyYWN0aXZlJyApO1xyXG5cclxuICBkaXNwbGF5LmludGVyYWN0aXZlID0gZmFsc2U7XHJcblxyXG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmVudCwgRElTQUJMRURfVFJVRSwgJ3Bkb21QYXJlbnQgc3RpbGwgZGlzYWJsZWQgd2hlbiBkaXNwbGF5IGlzIG5vdCBpbnRlcmFjdGl2ZSBhZ2Fpbi4nICk7XHJcbiAgdGVzdERpc2FibGVkKCBwZG9tUmFuZ2VDaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21SYW5nZUNoaWxkIHN0aWxsIGRpc2FibGVkIHdoZW4gZGlzcGxheSBpcyBub3QgaW50ZXJhY3RpdmUgYWdhaW4uJyApO1xyXG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmFncmFwaENoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbVBhcmFncmFwaENoaWxkIHN0aWxsIGRpc2FibGVkIHdoZW4gZGlzcGxheSBpcyBub3QgaW50ZXJhY3RpdmUgYWdhaW4uJyApO1xyXG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbUJ1dHRvbkNoaWxkIHN0aWxsIGRpc2FibGVkIHdoZW4gZGlzcGxheSBpcyBub3QgaW50ZXJhY3RpdmUgYWdhaW4uJyApO1xyXG5cclxuICBwZG9tUGFyZW50LnJlbW92ZVBET01BdHRyaWJ1dGUoICdkaXNhYmxlZCcgKTtcclxuICBwZG9tUmFuZ2VDaGlsZC5yZW1vdmVQRE9NQXR0cmlidXRlKCAnZGlzYWJsZWQnICk7XHJcbiAgcGRvbVBhcmFncmFwaENoaWxkLnJlbW92ZVBET01BdHRyaWJ1dGUoICdkaXNhYmxlZCcgKTtcclxuICBwZG9tQnV0dG9uQ2hpbGQucmVtb3ZlUERPTUF0dHJpYnV0ZSggJ2Rpc2FibGVkJyApO1xyXG5cclxuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJlbnQsIERJU0FCTEVEX1RSVUUsICdwZG9tUGFyZW50IHN0aWxsIGRpc2FibGVkIGZyb20gZGlzcGxheSBub3QgaW50ZXJhY3RpdmUgYWZ0ZXIgbG9jYWwgYXR0cmlidXRlIHJlbW92ZWQuJyApO1xyXG4gIHRlc3REaXNhYmxlZCggcGRvbVJhbmdlQ2hpbGQsIERJU0FCTEVEX1RSVUUsICdwZG9tUmFuZ2VDaGlsZCBzdGlsbCBkaXNhYmxlZCBmcm9tIGRpc3BsYXkgbm90IGludGVyYWN0aXZlIGFmdGVyIGxvY2FsIGF0dHJpYnV0ZSByZW1vdmVkLicgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJhZ3JhcGhDaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21QYXJhZ3JhcGhDaGlsZCBzdGlsbCBkaXNhYmxlZCBmcm9tIGRpc3BsYXkgbm90IGludGVyYWN0aXZlIGFmdGVyIGxvY2FsIGF0dHJpYnV0ZSByZW1vdmVkLicgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21CdXR0b25DaGlsZCBzdGlsbCBkaXNhYmxlZCBmcm9tIGRpc3BsYXkgbm90IGludGVyYWN0aXZlIGFmdGVyIGxvY2FsIGF0dHJpYnV0ZSByZW1vdmVkLicgKTtcclxuXHJcbiAgZGlzcGxheS5pbnRlcmFjdGl2ZSA9IHRydWU7XHJcblxyXG4gIHRlc3REaXNhYmxlZCggcGRvbVBhcmVudCwgREVGQVVMVF9ESVNBQkxFRF9XSEVOX1NVUFBPUlRFRCwgJ3Bkb21QYXJlbnQgaW50ZXJhY3RpdmUgbm93IHdpdGhvdXQgbG9jYWwgYXR0cmlidXRlLicgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21SYW5nZUNoaWxkLCBERUZBVUxUX0RJU0FCTEVEX1dIRU5fU1VQUE9SVEVELCAncGRvbVJhbmdlQ2hpbGQgaW50ZXJhY3RpdmUgbm93IHdpdGhvdXQgbG9jYWwgYXR0cmlidXRlLicgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21QYXJhZ3JhcGhDaGlsZCwgREVGQVVMVF9ESVNBQkxFRF9XSEVOX1NVUFBPUlRFRCwgJ3Bkb21QYXJhZ3JhcGhDaGlsZCBpbnRlcmFjdGl2ZSBub3cgd2l0aG91dCBsb2NhbCBhdHRyaWJ1dGUuJyApO1xyXG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBERUZBVUxUX0RJU0FCTEVEX1dIRU5fU1VQUE9SVEVELCAncGRvbUJ1dHRvbkNoaWxkIGludGVyYWN0aXZlIG5vdyB3aXRob3V0IGxvY2FsIGF0dHJpYnV0ZS4nICk7XHJcblxyXG4gIGNvbnN0IGNvbnRhaW5lck9mREFHQnV0dG9uID0gbmV3IE5vZGUoIHtcclxuICAgIGNoaWxkcmVuOiBbIHBkb21CdXR0b25DaGlsZCBdXHJcbiAgfSApO1xyXG4gIHBkb21QYXJlbnQuYWRkQ2hpbGQoIGNvbnRhaW5lck9mREFHQnV0dG9uICk7XHJcblxyXG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBERUZBVUxUX0RJU0FCTEVEX1dIRU5fU1VQUE9SVEVELCAncGRvbUJ1dHRvbkNoaWxkIGRlZmF1bHQgbm90IGRpc2FibGVkLicgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgREVGQVVMVF9ESVNBQkxFRF9XSEVOX1NVUFBPUlRFRCwgJ3Bkb21CdXR0b25DaGlsZCBkZWZhdWx0IG5vdCBkaXNhYmxlZCB3aXRoIGRhZy4nLCAxICk7XHJcblxyXG4gIGRpc3BsYXkuaW50ZXJhY3RpdmUgPSBmYWxzZTtcclxuXHJcbiAgdGVzdERpc2FibGVkKCBwZG9tQnV0dG9uQ2hpbGQsIERJU0FCTEVEX1RSVUUsICdwZG9tQnV0dG9uQ2hpbGQgdHVybmVkIGRpc2FibGVkLicgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21CdXR0b25DaGlsZCB0dXJuZWQgZGlzYWJsZWQgd2l0aCBkYWcuJywgMSApO1xyXG5cclxuICBwZG9tQnV0dG9uQ2hpbGQuc2V0UERPTUF0dHJpYnV0ZSggJ2Rpc2FibGVkJywgdHJ1ZSwgeyBhc1Byb3BlcnR5OiB0cnVlIH0gKTtcclxuXHJcbiAgdGVzdERpc2FibGVkKCBwZG9tQnV0dG9uQ2hpbGQsIERJU0FCTEVEX1RSVUUsICdwZG9tQnV0dG9uQ2hpbGQgdHVybmVkIGRpc2FibGVkIHNldCBwcm9wZXJ0eSB0b28uJyApO1xyXG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbUJ1dHRvbkNoaWxkIHR1cm5lZCBkaXNhYmxlZCBzZXQgcHJvcGVydHkgdG9vLCB3aXRoIGRhZy4nLCAxICk7XHJcblxyXG4gIGRpc3BsYXkuaW50ZXJhY3RpdmUgPSB0cnVlO1xyXG5cclxuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgRElTQUJMRURfVFJVRSwgJ3Bkb21CdXR0b25DaGlsZCB0dXJuZWQgbm90IGRpc2FibGVkIHNldCBwcm9wZXJ0eSB0b28uJyApO1xyXG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbUJ1dHRvbkNoaWxkIHR1cm5lZCBub3QgZGlzYWJsZWQgc2V0IHByb3BlcnR5IHRvbywgd2l0aCBkYWcuJywgMSApO1xyXG5cclxuICBkaXNwbGF5LmludGVyYWN0aXZlID0gZmFsc2U7XHJcblxyXG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbUJ1dHRvbkNoaWxkIHR1cm5lZCBkaXNhYmxlZCBhZ2Fpbi4nICk7XHJcbiAgdGVzdERpc2FibGVkKCBwZG9tQnV0dG9uQ2hpbGQsIERJU0FCTEVEX1RSVUUsICdwZG9tQnV0dG9uQ2hpbGQgdHVybmVkIGRpc2FibGVkIGFnYWluLCB3aXRoIGRhZy4nLCAxICk7XHJcblxyXG4gIHBkb21CdXR0b25DaGlsZC5yZW1vdmVQRE9NQXR0cmlidXRlKCAnZGlzYWJsZWQnICk7XHJcblxyXG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbUJ1dHRvbkNoaWxkIHJlbW92ZSBkaXNhYmxlZCB3aGlsZSBub3QgaW50ZXJhY3RpdmUuJyApO1xyXG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBESVNBQkxFRF9UUlVFLCAncGRvbUJ1dHRvbkNoaWxkIHJlbW92ZSBkaXNhYmxlZCB3aGlsZSBub3QgaW50ZXJhY3RpdmUsIHdpdGggZGFnLicsIDEgKTtcclxuXHJcbiAgZGlzcGxheS5pbnRlcmFjdGl2ZSA9IHRydWU7XHJcblxyXG4gIHRlc3REaXNhYmxlZCggcGRvbUJ1dHRvbkNoaWxkLCBERUZBVUxUX0RJU0FCTEVEX1dIRU5fU1VQUE9SVEVELCAncGRvbUJ1dHRvbkNoaWxkIGRlZmF1bHQgbm90IGRpc2FibGVkIGFmdGVyIGludGVyYWN0aXZlIGFnYWluLicgKTtcclxuICB0ZXN0RGlzYWJsZWQoIHBkb21CdXR0b25DaGlsZCwgREVGQVVMVF9ESVNBQkxFRF9XSEVOX1NVUFBPUlRFRCwgJ3Bkb21CdXR0b25DaGlsZCBkZWZhdWx0IG5vdCBkaXNhYmxlZCBhZnRlciBpbnRlcmFjdGl2ZSBhZ2FpbiB3aXRoIGRhZy4nLCAxICk7XHJcblxyXG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xyXG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XHJcbn0gKTtcclxuXHJcbi8vIHRoZXNlIGZ1enplcnMgdGFrZSB0aW1lLCBzbyBpdCBpcyBuaWNlIHdoZW4gdGhleSBhcmUgbGFzdFxyXG5RVW5pdC50ZXN0KCAnUERPTUZ1enplciB3aXRoIDMgbm9kZXMnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGZ1enplciA9IG5ldyBQRE9NRnV6emVyKCAzLCBmYWxzZSApO1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IDUwMDA7IGkrKyApIHtcclxuICAgIGZ1enplci5zdGVwKCk7XHJcbiAgfVxyXG4gIGFzc2VydC5leHBlY3QoIDAgKTtcclxuICBmdXp6ZXIuZGlzcG9zZSgpO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnUERPTUZ1enplciB3aXRoIDQgbm9kZXMnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGZ1enplciA9IG5ldyBQRE9NRnV6emVyKCA0LCBmYWxzZSApO1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IDEwMDA7IGkrKyApIHtcclxuICAgIGZ1enplci5zdGVwKCk7XHJcbiAgfVxyXG4gIGFzc2VydC5leHBlY3QoIDAgKTtcclxuICBmdXp6ZXIuZGlzcG9zZSgpO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnUERPTUZ1enplciB3aXRoIDUgbm9kZXMnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGZ1enplciA9IG5ldyBQRE9NRnV6emVyKCA1LCBmYWxzZSApO1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IDMwMDsgaSsrICkge1xyXG4gICAgZnV6emVyLnN0ZXAoKTtcclxuICB9XHJcbiAgYXNzZXJ0LmV4cGVjdCggMCApO1xyXG4gIGZ1enplci5kaXNwb3NlKCk7XHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLDBCQUEw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