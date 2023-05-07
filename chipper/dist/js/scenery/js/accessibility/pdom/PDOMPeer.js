// Copyright 2015-2023, University of Colorado Boulder

/**
 * An accessible peer controls the appearance of an accessible Node's instance in the parallel DOM. An PDOMPeer can
 * have up to four window.Elements displayed in the PDOM, see ftructor for details.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Jesse Greenberg
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import merge from '../../../../phet-core/js/merge.js';
import Poolable from '../../../../phet-core/js/Poolable.js';
import stripEmbeddingMarks from '../../../../phet-core/js/stripEmbeddingMarks.js';
import { FocusManager, PDOMInstance, PDOMSiblingStyle, PDOMUtils, scenery } from '../../imports.js';

// constants
const PRIMARY_SIBLING = 'PRIMARY_SIBLING';
const LABEL_SIBLING = 'LABEL_SIBLING';
const DESCRIPTION_SIBLING = 'DESCRIPTION_SIBLING';
const CONTAINER_PARENT = 'CONTAINER_PARENT';
const LABEL_TAG = PDOMUtils.TAGS.LABEL;
const INPUT_TAG = PDOMUtils.TAGS.INPUT;
const DISABLED_ATTRIBUTE_NAME = 'disabled';

// DOM observers that apply new CSS transformations are triggered when children, or inner content change. Updating
// style/positioning of the element will change attributes so we can't observe those changes since it would trigger
// the MutationObserver infinitely.
const OBSERVER_CONFIG = {
  attributes: false,
  childList: true,
  characterData: true
};
let globalId = 1;

// mutables instances to avoid creating many in operations that occur frequently
const scratchGlobalBounds = new Bounds2(0, 0, 0, 0);
const scratchSiblingBounds = new Bounds2(0, 0, 0, 0);
const globalNodeTranslationMatrix = new Matrix3();
const globalToClientScaleMatrix = new Matrix3();
const nodeScaleMagnitudeMatrix = new Matrix3();
class PDOMPeer {
  /**
   * @param {PDOMInstance} pdomInstance
   * @param {Object} [options]
   * @mixes Poolable
   */
  constructor(pdomInstance, options) {
    this.initializePDOMPeer(pdomInstance, options);
  }

  /**
   * Initializes the object (either from a freshly-created state, or from a "disposed" state brought back from a
   * pool).
   *
   * NOTE: the PDOMPeer is not fully constructed until calling PDOMPeer.update() after creating from pool.
   * @private
   *
   * @param {PDOMInstance} pdomInstance
   * @param {Object} [options]
   * @returns {PDOMPeer} - Returns 'this' reference, for chaining
   */
  initializePDOMPeer(pdomInstance, options) {
    options = merge({
      primarySibling: null
    }, options);
    assert && assert(!this.id || this.isDisposed, 'If we previously existed, we need to have been disposed');

    // @public {number} - unique ID
    this.id = this.id || globalId++;

    // @public {PDOMInstance}
    this.pdomInstance = pdomInstance;

    // @public {Node|null} only null for the root pdomInstance
    this.node = this.pdomInstance.node;

    // @public {Display} - Each peer is associated with a specific Display.
    this.display = pdomInstance.display;

    // @public {Trail} - NOTE: May have "gaps" due to pdomOrder usage.
    this.trail = pdomInstance.trail;

    // @private {boolean|null} - whether or not this PDOMPeer is visible in the PDOM
    // Only initialized to null, should not be set to it. isVisible() will return true if this.visible is null
    // (because it hasn't been set yet).
    this.visible = null;

    // @private {boolean|null} - whether or not the primary sibling of this PDOMPeer can receive focus.
    this.focusable = null;

    // @private {HTMLElement|null} - Optional label/description elements
    this._labelSibling = null;
    this._descriptionSibling = null;

    // @private {HTMLElement|null} - A parent element that can contain this primarySibling and other siblings, usually
    // the label and description content.
    this._containerParent = null;

    // @public {HTMLElement[]} Rather than guarantee that a peer is a tree with a root DOMElement,
    // allow multiple window.Elements at the top level of the peer. This is used for sorting the instance.
    // See this.orderElements for more info.
    this.topLevelElements = [];

    // @private {boolean} - flag that indicates that this peer has accessible content that changed, and so
    // the siblings need to be repositioned in the next Display.updateDisplay()
    this.positionDirty = false;

    // @private {boolean} - indicates that this peer's pdomInstance has a descendant that is dirty. Used to
    // quickly find peers with positionDirty when we traverse the tree of PDOMInstances
    this.childPositionDirty = false;

    // @private {boolean} - Indicates that this peer will position sibling elements so that
    // they are in the right location in the viewport, which is a requirement for touch based
    // screen readers. See setPositionInPDOM.
    this.positionInPDOM = false;

    // @private {MutationObserver} - An observer that will call back any time a property of the primary
    // sibling changes. Used to reposition the sibling elements if the bounding box resizes. No need to loop over
    // all of the mutations, any single mutation will require updating CSS positioning.
    //
    // NOTE: Ideally, a single MutationObserver could be used to observe changes to all elements in the PDOM. But
    // MutationObserver makes it impossible to detach observers from a single element. MutationObserver.detach()
    // will remove listeners on all observed elements, so individual observers must be used on each element.
    // One alternative could be to put the MutationObserver on the root element and use "subtree: true" in
    // OBSERVER_CONFIG. This could reduce the number of MutationObservers, but there is no easy way to get the
    // peer from the mutation target element. If MutationObserver takes a lot of memory, this could be an
    // optimization that may come with a performance cost.
    //
    // NOTE: ResizeObserver is a superior alternative to MutationObserver for this purpose because
    // it will only monitor changes we care about and prevent infinite callback loops if size is changed in
    // the callback function (we get around this now by not observing attribute changes). But it is not yet widely
    // supported, see https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver.
    //
    // TODO: Should we be watching "model" changes from ParallelDOM.js instead of using MutationObserver?
    // See https://github.com/phetsims/scenery/issues/852. This would be less fragile, and also less
    // memory intensive because we don't need an instance of MutationObserver on every PDOMInstance.
    this.mutationObserver = this.mutationObserver || new MutationObserver(this.invalidateCSSPositioning.bind(this));

    // @private {function} - must be removed on disposal
    this.transformListener = this.transformListener || this.invalidateCSSPositioning.bind(this);
    this.pdomInstance.transformTracker.addListener(this.transformListener);

    // @private {*} - To support setting the Display.interactive=false (which sets disabled on all primarySiblings,
    // we need to set disabled on a separate channel from this.setAttributeToElement. That way we cover the case where
    // `disabled` was set through the ParallelDOM API when we need to toggle it specifically for Display.interactive.
    // This way we can conserve the previous `disabled` attribute/property value through toggling Display.interactive.
    this._preservedDisabledValue = null;

    // @private {boolean} - Whether we are currently in a "disposed" (in the pool) state, or are available to be
    // interacted with.
    this.isDisposed = false;

    // edge case for root accessibility
    if (this.pdomInstance.isRootInstance) {
      // @private {HTMLElement} - The main element associated with this peer. If focusable, this is the element that gets
      // the focus. It also will contain any children.
      this._primarySibling = options.primarySibling;
      this._primarySibling.classList.add(PDOMSiblingStyle.ROOT_CLASS_NAME);

      // Stop blocked events from bubbling past the root of the PDOM so that scenery does
      // not dispatch them in Input.js.
      PDOMUtils.BLOCKED_DOM_EVENTS.forEach(eventType => {
        this._primarySibling.addEventListener(eventType, event => {
          event.stopPropagation();
        });
      });
    }
    return this;
  }

  /**
   * Update the content of the peer. This must be called after the AccessibePeer is constructed from pool.
   * @param {boolean} updateIndicesStringAndElementIds - if this function should be called upon initial "construction" (in update), allows for the option to do this lazily, see https://github.com/phetsims/phet-io/issues/1847
   * @public (scenery-internal)
   */
  update(updateIndicesStringAndElementIds) {
    let options = this.node.getBaseOptions();
    const callbacksForOtherNodes = [];
    if (this.node.accessibleName !== null) {
      options = this.node.accessibleNameBehavior(this.node, options, this.node.accessibleName, callbacksForOtherNodes);
      assert && assert(typeof options === 'object', 'should return an object');
    }
    if (this.node.pdomHeading !== null) {
      options = this.node.pdomHeadingBehavior(this.node, options, this.node.pdomHeading, callbacksForOtherNodes);
      assert && assert(typeof options === 'object', 'should return an object');
    }
    if (this.node.helpText !== null) {
      options = this.node.helpTextBehavior(this.node, options, this.node.helpText, callbacksForOtherNodes);
      assert && assert(typeof options === 'object', 'should return an object');
    }

    // create the base DOM element representing this accessible instance
    // TODO: why not just options.focusable?
    this._primarySibling = createElement(options.tagName, this.node.focusable, {
      namespace: options.pdomNamespace
    });

    // create the container parent for the dom siblings
    if (options.containerTagName) {
      this._containerParent = createElement(options.containerTagName, false);
    }

    // create the label DOM element representing this instance
    if (options.labelTagName) {
      this._labelSibling = createElement(options.labelTagName, false, {
        excludeFromInput: this.node.excludeLabelSiblingFromInput
      });
    }

    // create the description DOM element representing this instance
    if (options.descriptionTagName) {
      this._descriptionSibling = createElement(options.descriptionTagName, false);
    }
    updateIndicesStringAndElementIds && this.updateIndicesStringAndElementIds();
    this.orderElements(options);

    // assign listeners (to be removed or disconnected during disposal)
    this.mutationObserver.disconnect(); // in case update() is called more than once on an instance of PDOMPeer
    this.mutationObserver.observe(this._primarySibling, OBSERVER_CONFIG);

    // set the accessible label now that the element has been recreated again, but not if the tagName
    // has been cleared out
    if (options.labelContent && options.labelTagName !== null) {
      this.setLabelSiblingContent(options.labelContent);
    }

    // restore the innerContent
    if (options.innerContent && options.tagName !== null) {
      this.setPrimarySiblingContent(options.innerContent);
    }

    // set the accessible description, but not if the tagName has been cleared out.
    if (options.descriptionContent && options.descriptionTagName !== null) {
      this.setDescriptionSiblingContent(options.descriptionContent);
    }

    // if element is an input element, set input type
    if (options.tagName.toUpperCase() === INPUT_TAG && options.inputType) {
      this.setAttributeToElement('type', options.inputType);
    }
    this.setFocusable(this.node.focusable);

    // set the positionInPDOM field to our updated instance
    this.setPositionInPDOM(this.node.positionInPDOM);

    // recompute and assign the association attributes that link two elements (like aria-labelledby)
    this.onAriaLabelledbyAssociationChange();
    this.onAriaDescribedbyAssociationChange();
    this.onActiveDescendantAssociationChange();

    // update all attributes for the peer, should cover aria-label, role, and others
    this.onAttributeChange(options);

    // update all classes for the peer
    this.onClassChange();

    // update input value attribute for the peer
    this.onInputValueChange();
    this.node.updateOtherNodesAriaLabelledby();
    this.node.updateOtherNodesAriaDescribedby();
    this.node.updateOtherNodesActiveDescendant();
    callbacksForOtherNodes.forEach(callback => {
      assert && assert(typeof callback === 'function');
      callback();
    });
  }

  /**
   * Handle the internal ordering of the elements in the peer, this involves setting the proper value of
   * this.topLevelElements
   * @param {Object} config - the computed mixin options to be applied to the peer. (select ParallelDOM mutator keys)
   * @private
   */
  orderElements(config) {
    if (this._containerParent) {
      // The first child of the container parent element should be the peer dom element
      // if undefined, the insertBefore method will insert the this._primarySibling as the first child
      this._containerParent.insertBefore(this._primarySibling, this._containerParent.children[0] || null);
      this.topLevelElements = [this._containerParent];
    } else {
      // Wean out any null siblings
      this.topLevelElements = [this._labelSibling, this._descriptionSibling, this._primarySibling].filter(_.identity);
    }

    // insert the label and description elements in the correct location if they exist
    // NOTE: Important for arrangeContentElement to be called on the label sibling first for correct order
    this._labelSibling && this.arrangeContentElement(this._labelSibling, config.appendLabel);
    this._descriptionSibling && this.arrangeContentElement(this._descriptionSibling, config.appendDescription);
  }

  /**
   * Get the primary sibling element for the peer
   * @public
   * @returns {HTMLElement|null}
   */
  getPrimarySibling() {
    return this._primarySibling;
  }
  get primarySibling() {
    return this.getPrimarySibling();
  }

  /**
   * Get the primary sibling element for the peer
   * @public
   * @returns {HTMLElement|null}
   */
  getLabelSibling() {
    return this._labelSibling;
  }
  get labelSibling() {
    return this.getLabelSibling();
  }

  /**
   * Get the primary sibling element for the peer
   * @public
   * @returns {HTMLElement|null}
   */
  getDescriptionSibling() {
    return this._descriptionSibling;
  }
  get descriptionSibling() {
    return this.getDescriptionSibling();
  }

  /**
   * Get the primary sibling element for the peer
   * @public
   * @returns {HTMLElement|null}
   */
  getContainerParent() {
    return this._containerParent;
  }
  get containerParent() {
    return this.getContainerParent();
  }

  /**
   * Returns the top-level element that contains the primary sibling. If there is no container parent, then the primary
   * sibling is returned.
   * @public
   *
   * @returns {HTMLElement|null}
   */
  getTopLevelElementContainingPrimarySibling() {
    return this._containerParent || this._primarySibling;
  }

  /**
   * Recompute the aria-labelledby attributes for all of the peer's elements
   * @public
   */
  onAriaLabelledbyAssociationChange() {
    this.removeAttributeFromAllElements('aria-labelledby');
    for (let i = 0; i < this.node.ariaLabelledbyAssociations.length; i++) {
      const associationObject = this.node.ariaLabelledbyAssociations[i];

      // Assert out if the model list is different than the data held in the associationObject
      assert && assert(associationObject.otherNode.nodesThatAreAriaLabelledbyThisNode.indexOf(this.node) >= 0, 'unexpected otherNode');
      this.setAssociationAttribute('aria-labelledby', associationObject);
    }
  }

  /**
   * Recompute the aria-describedby attributes for all of the peer's elements
   * @public
   */
  onAriaDescribedbyAssociationChange() {
    this.removeAttributeFromAllElements('aria-describedby');
    for (let i = 0; i < this.node.ariaDescribedbyAssociations.length; i++) {
      const associationObject = this.node.ariaDescribedbyAssociations[i];

      // Assert out if the model list is different than the data held in the associationObject
      assert && assert(associationObject.otherNode.nodesThatAreAriaDescribedbyThisNode.indexOf(this.node) >= 0, 'unexpected otherNode');
      this.setAssociationAttribute('aria-describedby', associationObject);
    }
  }

  /**
   * Recompute the aria-activedescendant attributes for all of the peer's elements
   * @public
   */
  onActiveDescendantAssociationChange() {
    this.removeAttributeFromAllElements('aria-activedescendant');
    for (let i = 0; i < this.node.activeDescendantAssociations.length; i++) {
      const associationObject = this.node.activeDescendantAssociations[i];

      // Assert out if the model list is different than the data held in the associationObject
      assert && assert(associationObject.otherNode.nodesThatAreActiveDescendantToThisNode.indexOf(this.node) >= 0, 'unexpected otherNode');
      this.setAssociationAttribute('aria-activedescendant', associationObject);
    }
  }

  /**
   * Set the new attribute to the element if the value is a string. It will otherwise be null or undefined and should
   * then be removed from the element. This allows empty strings to be set as values.
   *
   * @param {string} key
   * @param {string|null|undefined} value
   * @private
   */
  handleAttributeWithPDOMOption(key, value) {
    if (typeof value === 'string') {
      this.setAttributeToElement(key, value);
    } else {
      this.removeAttributeFromElement(key);
    }
  }

  /**
   * Set all pdom attributes onto the peer elements from the model's stored data objects
   * @private
   *
   * @param {Object} [pdomOptions] - these can override the values of the node, see this.update()
   */
  onAttributeChange(pdomOptions) {
    for (let i = 0; i < this.node.pdomAttributes.length; i++) {
      const dataObject = this.node.pdomAttributes[i];
      this.setAttributeToElement(dataObject.attribute, dataObject.value, dataObject.options);
    }

    // Manually support options that map to attributes. This covers that case where behavior functions want to change
    // these, but they aren't in node.pdomAttributes. It will do double work in some cases, but it is pretty minor for
    // the complexity it saves. https://github.com/phetsims/scenery/issues/1436. Empty strings should be settable for
    // these attributes but null and undefined are ignored.
    this.handleAttributeWithPDOMOption('aria-label', pdomOptions.ariaLabel);
    this.handleAttributeWithPDOMOption('role', pdomOptions.ariaRole);
  }

  /**
   * Set all classes onto the peer elements from the model's stored data objects
   * @private
   */
  onClassChange() {
    for (let i = 0; i < this.node.pdomClasses.length; i++) {
      const dataObject = this.node.pdomClasses[i];
      this.setClassToElement(dataObject.className, dataObject.options);
    }
  }

  /**
   * Set the input value on the peer's primary sibling element. The value attribute must be set as a Property to be
   * registered correctly by an assistive device. If null, the attribute is removed so that we don't clutter the DOM
   * with value="null" attributes.
   *
   * @public (scenery-internal)
   */
  onInputValueChange() {
    assert && assert(this.node.inputValue !== undefined, 'use null to remove input value attribute');
    if (this.node.inputValue === null) {
      this.removeAttributeFromElement('value');
    } else {
      // type conversion for DOM spec
      const valueString = `${this.node.inputValue}`;
      this.setAttributeToElement('value', valueString, {
        asProperty: true
      });
    }
  }

  /**
   * Get an element on this node, looked up by the elementName flag passed in.
   * @public (scenery-internal)
   *
   * @param {string} elementName - see PDOMUtils for valid associations
   * @returns {HTMLElement}
   */
  getElementByName(elementName) {
    if (elementName === PDOMPeer.PRIMARY_SIBLING) {
      return this._primarySibling;
    } else if (elementName === PDOMPeer.LABEL_SIBLING) {
      return this._labelSibling;
    } else if (elementName === PDOMPeer.DESCRIPTION_SIBLING) {
      return this._descriptionSibling;
    } else if (elementName === PDOMPeer.CONTAINER_PARENT) {
      return this._containerParent;
    }
    throw new Error(`invalid elementName name: ${elementName}`);
  }

  /**
   * Sets a attribute on one of the peer's window.Elements.
   * @public (scenery-internal)
   * @param {string} attribute
   * @param {*} attributeValue
   * @param {Object} [options]
   */
  setAttributeToElement(attribute, attributeValue, options) {
    options = merge({
      // {string|null} - If non-null, will set the attribute with the specified namespace. This can be required
      // for setting certain attributes (e.g. MathML).
      namespace: null,
      // set as a javascript property instead of an attribute on the DOM Element.
      asProperty: false,
      elementName: PRIMARY_SIBLING,
      // see this.getElementName() for valid values, default to the primary sibling

      // {HTMLElement|null} - element that will directly receive the input rather than looking up by name, if
      // provided, elementName option will have no effect
      element: null
    }, options);
    const element = options.element || this.getElementByName(options.elementName);

    // remove directional formatting that may surround strings if they are translatable
    let attributeValueWithoutMarks = attributeValue;
    if (typeof attributeValue === 'string') {
      attributeValueWithoutMarks = stripEmbeddingMarks(attributeValue);
    }
    if (attribute === DISABLED_ATTRIBUTE_NAME && !this.display.interactive) {
      // The presence of the `disabled` attribute means it is always disabled.
      this._preservedDisabledValue = options.asProperty ? attributeValueWithoutMarks : true;
    }
    if (options.namespace) {
      element.setAttributeNS(options.namespace, attribute, attributeValueWithoutMarks);
    } else if (options.asProperty) {
      element[attribute] = attributeValueWithoutMarks;
    } else {
      element.setAttribute(attribute, attributeValueWithoutMarks);
    }
  }

  /**
   * Remove attribute from one of the peer's window.Elements.
   * @public (scenery-internal)
   * @param {string} attribute
   * @param {Object} [options]
   */
  removeAttributeFromElement(attribute, options) {
    options = merge({
      // {string|null} - If non-null, will set the attribute with the specified namespace. This can be required
      // for setting certain attributes (e.g. MathML).
      namespace: null,
      elementName: PRIMARY_SIBLING,
      // see this.getElementName() for valid values, default to the primary sibling

      // {HTMLElement|null} - element that will directly receive the input rather than looking up by name, if
      // provided, elementName option will have no effect
      element: null
    }, options);
    const element = options.element || this.getElementByName(options.elementName);
    if (options.namespace) {
      element.removeAttributeNS(options.namespace, attribute);
    } else if (attribute === DISABLED_ATTRIBUTE_NAME && !this.display.interactive) {
      // maintain our interal disabled state in case the display toggles back to be interactive.
      this._preservedDisabledValue = false;
    } else {
      element.removeAttribute(attribute);
    }
  }

  /**
   * Remove the given attribute from all peer elements
   * @public (scenery-internal)
   * @param {string} attribute
   */
  removeAttributeFromAllElements(attribute) {
    assert && assert(attribute !== DISABLED_ATTRIBUTE_NAME, 'this method does not currently support disabled, to make Display.interactive toggling easier to implement');
    assert && assert(typeof attribute === 'string');
    this._primarySibling && this._primarySibling.removeAttribute(attribute);
    this._labelSibling && this._labelSibling.removeAttribute(attribute);
    this._descriptionSibling && this._descriptionSibling.removeAttribute(attribute);
    this._containerParent && this._containerParent.removeAttribute(attribute);
  }

  /**
   * Add the provided className to the element's classList.
   *
   * @public
   * @param {string} className
   * @param {Object} [options]
   */
  setClassToElement(className, options) {
    assert && assert(typeof className === 'string');
    options = merge({
      // Name of the element who we are adding the class to, see this.getElementName() for valid values
      elementName: PRIMARY_SIBLING
    }, options);
    this.getElementByName(options.elementName).classList.add(className);
  }

  /**
   * Remove the specified className from the element.
   * @public
   *
   * @param {string} className
   * @param {Object} [options]
   */
  removeClassFromElement(className, options) {
    assert && assert(typeof className === 'string');
    options = merge({
      // Name of the element who we are removing the class from, see this.getElementName() for valid values
      elementName: PRIMARY_SIBLING
    }, options);
    this.getElementByName(options.elementName).classList.remove(className);
  }

  /**
   * Set either association attribute (aria-labelledby/describedby) on one of this peer's Elements
   * @public (scenery-internal)
   * @param {string} attribute - either aria-labelledby or aria-describedby
   * @param {Object} associationObject - see addAriaLabelledbyAssociation() for schema
   */
  setAssociationAttribute(attribute, associationObject) {
    assert && assert(PDOMUtils.ASSOCIATION_ATTRIBUTES.indexOf(attribute) >= 0, `unsupported attribute for setting with association object: ${attribute}`);
    const otherNodePDOMInstances = associationObject.otherNode.getPDOMInstances();

    // If the other node hasn't been added to the scene graph yet, it won't have any accessible instances, so no op.
    // This will be recalculated when that node is added to the scene graph
    if (otherNodePDOMInstances.length > 0) {
      // We are just using the first PDOMInstance for simplicity, but it is OK because the accessible
      // content for all PDOMInstances will be the same, so the Accessible Names (in the browser's
      // accessibility tree) of elements that are referenced by the attribute value id will all have the same content
      const firstPDOMInstance = otherNodePDOMInstances[0];

      // Handle a case where you are associating to yourself, and the peer has not been constructed yet.
      if (firstPDOMInstance === this.pdomInstance) {
        firstPDOMInstance.peer = this;
      }
      assert && assert(firstPDOMInstance.peer, 'peer should exist');

      // we can use the same element's id to update all of this Node's peers
      const otherPeerElement = firstPDOMInstance.peer.getElementByName(associationObject.otherElementName);
      const element = this.getElementByName(associationObject.thisElementName);

      // to support any option order, no-op if the peer element has not been created yet.
      if (element && otherPeerElement) {
        // only update associations if the requested peer element has been created
        // NOTE: in the future, we would like to verify that the association exists but can't do that yet because
        // we have to support cases where we set label association prior to setting the sibling/parent tagName
        const previousAttributeValue = element.getAttribute(attribute) || '';
        assert && assert(typeof previousAttributeValue === 'string');
        const newAttributeValue = [previousAttributeValue.trim(), otherPeerElement.id].join(' ').trim();

        // add the id from the new association to the value of the HTMLElement's attribute.
        this.setAttributeToElement(attribute, newAttributeValue, {
          elementName: associationObject.thisElementName
        });
      }
    }
  }

  /**
   * The contentElement will either be a label or description element. The contentElement will be sorted relative to
   * the primarySibling. Its placement will also depend on whether or not this node wants to append this element,
   * see setAppendLabel() and setAppendDescription(). By default, the "content" element will be placed before the
   * primarySibling.
   *
   * NOTE: This function assumes it is called on label sibling before description sibling for inserting elements
   * into the correct order.
   *
   * @private
   *
   * @param {HTMLElement} contentElement
   * @param {boolean} appendElement
   */
  arrangeContentElement(contentElement, appendElement) {
    // if there is a containerParent
    if (this.topLevelElements[0] === this._containerParent) {
      assert && assert(this.topLevelElements.length === 1);
      if (appendElement) {
        this._containerParent.appendChild(contentElement);
      } else {
        this._containerParent.insertBefore(contentElement, this._primarySibling);
      }
    }

    // If there are multiple top level nodes
    else {
      // keep this.topLevelElements in sync
      arrayRemove(this.topLevelElements, contentElement);
      const indexOfPrimarySibling = this.topLevelElements.indexOf(this._primarySibling);

      // if appending, just insert at at end of the top level elements
      const insertIndex = appendElement ? this.topLevelElements.length : indexOfPrimarySibling;
      this.topLevelElements.splice(insertIndex, 0, contentElement);
    }
  }

  /**
   * Is this peer hidden in the PDOM
   * @public
   *
   * @returns {boolean}
   */
  isVisible() {
    if (assert) {
      let visibleElements = 0;
      this.topLevelElements.forEach(element => {
        // support property or attribute
        if (!element.hidden && !element.hasAttribute('hidden')) {
          visibleElements += 1;
        }
      });
      assert(this.visible ? visibleElements === this.topLevelElements.length : visibleElements === 0, 'some of the peer\'s elements are visible and some are not');
    }
    return this.visible === null ? true : this.visible; // default to true if visibility hasn't been set yet.
  }

  /**
   * Set whether or not the peer is visible in the PDOM
   * @public
   *
   * @param {boolean} visible
   */
  setVisible(visible) {
    assert && assert(typeof visible === 'boolean');
    if (this.visible !== visible) {
      this.visible = visible;
      for (let i = 0; i < this.topLevelElements.length; i++) {
        const element = this.topLevelElements[i];
        if (visible) {
          this.removeAttributeFromElement('hidden', {
            element: element
          });
        } else {
          this.setAttributeToElement('hidden', '', {
            element: element
          });
        }
      }

      // invalidate CSS transforms because when 'hidden' the content will have no dimensions in the viewport
      this.invalidateCSSPositioning();
    }
  }

  /**
   * Returns if this peer is focused. A peer is focused if its primarySibling is focused.
   * @public (scenery-internal)
   * @returns {boolean}
   */
  isFocused() {
    const visualFocusTrail = PDOMInstance.guessVisualTrail(this.trail, this.display.rootNode);
    return FocusManager.pdomFocusProperty.value && FocusManager.pdomFocusProperty.value.trail.equals(visualFocusTrail);
  }

  /**
   * Focus the primary sibling of the peer.
   * @public (scenery-internal)
   */
  focus() {
    assert && assert(this._primarySibling, 'must have a primary sibling to focus');
    this._primarySibling.focus();
  }

  /**
   * Blur the primary sibling of the peer.
   * @public (scenery-internal)
   */
  blur() {
    assert && assert(this._primarySibling, 'must have a primary sibling to blur');

    // no op by the browser if primary sibling does not have focus
    this._primarySibling.blur();
  }

  /**
   * Make the peer focusable. Only the primary sibling is ever considered focusable.
   * @public
   * @param {boolean} focusable
   */
  setFocusable(focusable) {
    assert && assert(typeof focusable === 'boolean');
    const peerHadFocus = this.isFocused();
    if (this.focusable !== focusable) {
      this.focusable = focusable;
      PDOMUtils.overrideFocusWithTabIndex(this.primarySibling, focusable);

      // in Chrome, if tabindex is removed and the element is not focusable by default the element is blurred.
      // This behavior is reasonable and we want to enforce it in other browsers for consistency. See
      // https://github.com/phetsims/scenery/issues/967
      if (peerHadFocus && !focusable) {
        this.blur();
      }

      // reposition the sibling in the DOM, since non-focusable nodes are not positioned
      this.invalidateCSSPositioning();
    }
  }

  /**
   * Responsible for setting the content for the label sibling
   * @public (scenery-internal)
   * @param {string|null} content - the content for the label sibling.
   */
  setLabelSiblingContent(content) {
    assert && assert(content === null || typeof content === 'string', 'incorrect label content type');

    // no-op to support any option order
    if (!this._labelSibling) {
      return;
    }
    PDOMUtils.setTextContent(this._labelSibling, content);

    // if the label element happens to be a 'label', associate with 'for' attribute
    if (this._labelSibling.tagName.toUpperCase() === LABEL_TAG) {
      this.setAttributeToElement('for', this._primarySibling.id, {
        elementName: PDOMPeer.LABEL_SIBLING
      });
    }
  }

  /**
   * Responsible for setting the content for the description sibling
   * @public (scenery-internal)
   * @param {string|null} content - the content for the description sibling.
   */
  setDescriptionSiblingContent(content) {
    assert && assert(content === null || typeof content === 'string', 'incorrect description content type');

    // no-op to support any option order
    if (!this._descriptionSibling) {
      return;
    }
    PDOMUtils.setTextContent(this._descriptionSibling, content);
  }

  /**
   * Responsible for setting the content for the primary sibling
   * @public (scenery-internal)
   * @param {string|null} content - the content for the primary sibling.
   */
  setPrimarySiblingContent(content) {
    assert && assert(content === null || typeof content === 'string', 'incorrect inner content type');
    assert && assert(this.pdomInstance.children.length === 0, 'descendants exist with accessible content, innerContent cannot be used');
    assert && assert(PDOMUtils.tagNameSupportsContent(this._primarySibling.tagName), `tagName: ${this.node.tagName} does not support inner content`);

    // no-op to support any option order
    if (!this._primarySibling) {
      return;
    }
    PDOMUtils.setTextContent(this._primarySibling, content);
  }

  /**
   * Sets the pdomTransformSourceNode so that the primary sibling will be transformed with changes to along the
   * unique trail to the source node. If null, repositioning happens with transform changes along this
   * pdomInstance's trail.
   * @public
   *
   * @param {../nodes/Node|null} node
   */
  setPDOMTransformSourceNode(node) {
    // remove previous listeners before creating a new TransformTracker
    this.pdomInstance.transformTracker.removeListener(this.transformListener);
    this.pdomInstance.updateTransformTracker(node);

    // add listeners back after update
    this.pdomInstance.transformTracker.addListener(this.transformListener);

    // new trail with transforms so positioning is probably dirty
    this.invalidateCSSPositioning();
  }

  /**
   * Enable or disable positioning of the sibling elements. Generally this is requiredfor accessibility to work on
   * touch screen based screen readers like phones. But repositioning DOM elements is expensive. This can be set to
   * false to optimize when positioning is not necessary.
   * @public (scenery-internal)
   *
   * @param {boolean} positionInPDOM
   */
  setPositionInPDOM(positionInPDOM) {
    this.positionInPDOM = positionInPDOM;

    // signify that it needs to be repositioned next frame, either off screen or to match
    // graphical rendering
    this.invalidateCSSPositioning();
  }

  // @private
  getElementId(siblingName, stringId) {
    return `display${this.display.id}-${siblingName}-${stringId}`;
  }

  // @public
  updateIndicesStringAndElementIds() {
    const indices = this.pdomInstance.getPDOMInstanceUniqueId();
    if (this._primarySibling) {
      // NOTE: dataset isn't supported by all namespaces (like MathML) so we need to use setAttribute
      this._primarySibling.setAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID, indices);
      this._primarySibling.id = this.getElementId('primary', indices);
    }
    if (this._labelSibling) {
      // NOTE: dataset isn't supported by all namespaces (like MathML) so we need to use setAttribute
      this._labelSibling.setAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID, indices);
      this._labelSibling.id = this.getElementId('label', indices);
    }
    if (this._descriptionSibling) {
      // NOTE: dataset isn't supported by all namespaces (like MathML) so we need to use setAttribute
      this._descriptionSibling.setAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID, indices);
      this._descriptionSibling.id = this.getElementId('description', indices);
    }
    if (this._containerParent) {
      // NOTE: dataset isn't supported by all namespaces (like MathML) so we need to use setAttribute
      this._containerParent.setAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID, indices);
      this._containerParent.id = this.getElementId('container', indices);
    }
  }

  /**
   * Mark that the siblings of this PDOMPeer need to be updated in the next Display update. Possibly from a
   * change of accessible content or node transformation. Does nothing if already marked dirty.
   *
   * @private
   */
  invalidateCSSPositioning() {
    if (!this.positionDirty) {
      this.positionDirty = true;

      // mark all ancestors of this peer so that we can quickly find this dirty peer when we traverse
      // the PDOMInstance tree
      let parent = this.pdomInstance.parent;
      while (parent) {
        parent.peer.childPositionDirty = true;
        parent = parent.parent;
      }
    }
  }

  /**
   * Update the CSS positioning of the primary and label siblings. Required to support accessibility on mobile
   * devices. On activation of focusable elements, certain AT will send fake pointer events to the browser at
   * the center of the client bounding rectangle of the HTML element. By positioning elements over graphical display
   * objects we can capture those events. A transformation matrix is calculated that will transform the position
   * and dimension of the HTML element in pixels to the global coordinate frame. The matrix is used to transform
   * the bounds of the element prior to any other transformation so we can set the element's left, top, width, and
   * height with CSS attributes.
   *
   * For now we are only transforming the primary and label siblings if the primary sibling is focusable. If
   * focusable, the primary sibling needs to be transformed to receive user input. VoiceOver includes the label bounds
   * in its calculation for where to send the events, so it needs to be transformed as well. Descriptions are not
   * considered and do not need to be positioned.
   *
   * Initially, we tried to set the CSS transformations on elements directly through the transform attribute. While
   * this worked for basic input, it did not support other AT features like tapping the screen to focus elements.
   * With this strategy, the VoiceOver "touch area" was a small box around the top left corner of the element. It was
   * never clear why this was this case, but forced us to change our strategy to set the left, top, width, and height
   * attributes instead.
   *
   * This function assumes that elements have other style attributes so they can be positioned correctly and don't
   * interfere with scenery input, see SceneryStyle in PDOMUtils.
   *
   * Additional notes were taken in https://github.com/phetsims/scenery/issues/852, see that issue for more
   * information.
   *
   * Review: This function could be simplified by setting the element width/height a small arbitrary shape
   * at the center of the node's global bounds. There is a drawback in that the VO default highlight won't
   * surround the Node anymore. But it could be a performance enhancement and simplify this function.
   * Or maybe a big rectangle larger than the Display div still centered on the node so we never
   * see the VO highlight?
   *
   * @private
   */
  positionElements(positionInPDOM) {
    assert && assert(this._primarySibling, 'a primary sibling required to receive CSS positioning');
    assert && assert(this.positionDirty, 'elements should only be repositioned if dirty');

    // CSS transformation only needs to be applied if the node is focusable - otherwise the element will be found
    // by gesture navigation with the virtual cursor. Bounds for non-focusable elements in the ViewPort don't
    // need to be accurate because the AT doesn't need to send events to them.
    if (positionInPDOM) {
      const transformSourceNode = this.node.pdomTransformSourceNode || this.node;
      scratchGlobalBounds.set(transformSourceNode.localBounds);
      if (scratchGlobalBounds.isFinite()) {
        scratchGlobalBounds.transform(this.pdomInstance.transformTracker.getMatrix());

        // no need to position if the node is fully outside of the Display bounds (out of view)
        const displayBounds = this.display.bounds;
        if (displayBounds.intersectsBounds(scratchGlobalBounds)) {
          // Constrain the global bounds to Display bounds so that center of the sibling element
          // is always in the Display. We may miss input if the center of the Node is outside
          // the Display, where VoiceOver would otherwise send pointer events.
          scratchGlobalBounds.constrainBounds(displayBounds);
          let clientDimensions = getClientDimensions(this._primarySibling);
          let clientWidth = clientDimensions.width;
          let clientHeight = clientDimensions.height;
          if (clientWidth > 0 && clientHeight > 0) {
            scratchSiblingBounds.setMinMax(0, 0, clientWidth, clientHeight);
            scratchSiblingBounds.transform(getCSSMatrix(clientWidth, clientHeight, scratchGlobalBounds));
            setClientBounds(this._primarySibling, scratchSiblingBounds);
          }
          if (this.labelSibling) {
            clientDimensions = getClientDimensions(this._labelSibling);
            clientWidth = clientDimensions.width;
            clientHeight = clientDimensions.height;
            if (clientHeight > 0 && clientWidth > 0) {
              scratchSiblingBounds.setMinMax(0, 0, clientWidth, clientHeight);
              scratchSiblingBounds.transform(getCSSMatrix(clientWidth, clientHeight, scratchGlobalBounds));
              setClientBounds(this._labelSibling, scratchSiblingBounds);
            }
          }
        }
      }
    } else {
      // not positioning, just move off screen
      scratchSiblingBounds.set(PDOMPeer.OFFSCREEN_SIBLING_BOUNDS);
      setClientBounds(this._primarySibling, scratchSiblingBounds);
      if (this._labelSibling) {
        setClientBounds(this._labelSibling, scratchSiblingBounds);
      }
    }
    this.positionDirty = false;
  }

  /**
   * Update positioning of elements in the PDOM. Does a depth first search for all descendants of parentIntsance with
   * a peer that either has dirty positioning or as a descendant with dirty positioning.
   *
   * @public (scenery-internal)
   */
  updateSubtreePositioning(parentPositionInPDOM = false) {
    this.childPositionDirty = false;
    const positionInPDOM = this.positionInPDOM || parentPositionInPDOM;
    if (this.positionDirty) {
      this.positionElements(positionInPDOM);
    }
    for (let i = 0; i < this.pdomInstance.children.length; i++) {
      const childPeer = this.pdomInstance.children[i].peer;
      if (childPeer.positionDirty || childPeer.childPositionDirty) {
        this.pdomInstance.children[i].peer.updateSubtreePositioning(positionInPDOM);
      }
    }
  }

  /**
   * Recursively set this PDOMPeer and children to be disabled. This will overwrite any previous value of disabled
   * that may have been set, but will keep track of the old value, and restore its state upon re-enabling.
   * @param {boolean} disabled
   * @public
   */
  recursiveDisable(disabled) {
    if (disabled) {
      this._preservedDisabledValue = this._primarySibling.disabled;
      this._primarySibling.disabled = true;
    } else {
      this._primarySibling.disabled = this._preservedDisabledValue;
    }
    for (let i = 0; i < this.pdomInstance.children.length; i++) {
      this.pdomInstance.children[i].peer.recursiveDisable(disabled);
    }
  }

  /**
   * Removes external references from this peer, and places it in the pool.
   * @public (scenery-internal)
   */
  dispose() {
    this.isDisposed = true;

    // remove focus if the disposed peer is the active element
    this.blur();

    // remove listeners
    this._primarySibling.removeEventListener('blur', this.blurEventListener);
    this._primarySibling.removeEventListener('focus', this.focusEventListener);
    this.pdomInstance.transformTracker.removeListener(this.transformListener);
    this.mutationObserver.disconnect();

    // zero-out references
    this.pdomInstance = null;
    this.node = null;
    this.display = null;
    this.trail = null;
    this._primarySibling = null;
    this._labelSibling = null;
    this._descriptionSibling = null;
    this._containerParent = null;
    this.focusable = null;

    // for now
    this.freeToPool();
  }
}

// @public {string} - specifies valid associations between related PDOMPeers in the DOM
PDOMPeer.PRIMARY_SIBLING = PRIMARY_SIBLING; // associate with all accessible content related to this peer
PDOMPeer.LABEL_SIBLING = LABEL_SIBLING; // associate with just the label content of this peer
PDOMPeer.DESCRIPTION_SIBLING = DESCRIPTION_SIBLING; // associate with just the description content of this peer
PDOMPeer.CONTAINER_PARENT = CONTAINER_PARENT; // associate with everything under the container parent of this peer

// @public (scenery-internal) - bounds for a sibling that should be moved off-screen when not positioning, in
// global coordinates
PDOMPeer.OFFSCREEN_SIBLING_BOUNDS = new Bounds2(0, 0, 1, 1);
scenery.register('PDOMPeer', PDOMPeer);

// Set up pooling
Poolable.mixInto(PDOMPeer, {
  initialize: PDOMPeer.prototype.initializePDOMPeer
});

//--------------------------------------------------------------------------
// Helper functions
//--------------------------------------------------------------------------

/**
 * Create a sibling element for the PDOMPeer.
 * TODO: this should be inlined with the PDOMUtils method
 * @param {string} tagName
 * @param {boolean} focusable
 * @param {Object} [options] - passed along to PDOMUtils.createElement
 * @returns {HTMLElement}
 */
function createElement(tagName, focusable, options) {
  options = merge({
    // {string|null} - addition to the trailId, separated by a hyphen to identify the different siblings within
    // the document
    siblingName: null,
    // {boolean} - if true, DOM input events received on the element will not be dispatched as SceneryEvents in Input.js
    // see ParallelDOM.setExcludeLabelSiblingFromInput for more information
    excludeFromInput: false
  }, options);
  const newElement = PDOMUtils.createElement(tagName, focusable, options);
  if (options.excludeFromInput) {
    newElement.setAttribute(PDOMUtils.DATA_EXCLUDE_FROM_INPUT, true);
  }
  return newElement;
}

/**
 * Get a matrix that can be used as the CSS transform for elements in the DOM. This matrix will an HTML element
 * dimensions in pixels to the global coordinate frame.
 *
 * @param  {number} clientWidth - width of the element to transform in pixels
 * @param  {number} clientHeight - height of the element to transform in pixels
 * @param  {Bounds2} nodeGlobalBounds - Bounds of the PDOMPeer's node in the global coordinate frame.
 * @returns {Matrix3}
 */
function getCSSMatrix(clientWidth, clientHeight, nodeGlobalBounds) {
  // the translation matrix for the node's bounds in its local coordinate frame
  globalNodeTranslationMatrix.setToTranslation(nodeGlobalBounds.minX, nodeGlobalBounds.minY);

  // scale matrix for "client" HTML element, scale to make the HTML element's DOM bounds match the
  // local bounds of the node
  globalToClientScaleMatrix.setToScale(nodeGlobalBounds.width / clientWidth, nodeGlobalBounds.height / clientHeight);

  // combine these in a single transformation matrix
  return globalNodeTranslationMatrix.multiplyMatrix(globalToClientScaleMatrix).multiplyMatrix(nodeScaleMagnitudeMatrix);
}

/**
 * Gets an object with the width and height of an HTML element in pixels, prior to any scaling. clientWidth and
 * clientHeight are zero for elements with inline layout and elements without CSS. For those elements we fall back
 * to the boundingClientRect, which at that point will describe the dimensions of the element prior to scaling.
 *
 * @param  {HTMLElement} siblingElement
 * @returns {Object} - Returns an object with two entries, { width: {number}, height: {number} }
 */
function getClientDimensions(siblingElement) {
  let clientWidth = siblingElement.clientWidth;
  let clientHeight = siblingElement.clientHeight;
  if (clientWidth === 0 && clientHeight === 0) {
    const clientRect = siblingElement.getBoundingClientRect();
    clientWidth = clientRect.width;
    clientHeight = clientRect.height;
  }
  return {
    width: clientWidth,
    height: clientHeight
  };
}

/**
 * Set the bounds of the sibling element in the view port in pixels, using top, left, width, and height css.
 * The element must be styled with 'position: fixed', and an ancestor must have position: 'relative', so that
 * the dimensions of the sibling are relative to the parent.
 *
 * @param {HTMLElement} siblingElement - the element to position
 * @param {Bounds2} bounds - desired bounds, in pixels
 */
function setClientBounds(siblingElement, bounds) {
  siblingElement.style.top = `${bounds.top}px`;
  siblingElement.style.left = `${bounds.left}px`;
  siblingElement.style.width = `${bounds.width}px`;
  siblingElement.style.height = `${bounds.height}px`;
}
export default PDOMPeer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiTWF0cml4MyIsImFycmF5UmVtb3ZlIiwibWVyZ2UiLCJQb29sYWJsZSIsInN0cmlwRW1iZWRkaW5nTWFya3MiLCJGb2N1c01hbmFnZXIiLCJQRE9NSW5zdGFuY2UiLCJQRE9NU2libGluZ1N0eWxlIiwiUERPTVV0aWxzIiwic2NlbmVyeSIsIlBSSU1BUllfU0lCTElORyIsIkxBQkVMX1NJQkxJTkciLCJERVNDUklQVElPTl9TSUJMSU5HIiwiQ09OVEFJTkVSX1BBUkVOVCIsIkxBQkVMX1RBRyIsIlRBR1MiLCJMQUJFTCIsIklOUFVUX1RBRyIsIklOUFVUIiwiRElTQUJMRURfQVRUUklCVVRFX05BTUUiLCJPQlNFUlZFUl9DT05GSUciLCJhdHRyaWJ1dGVzIiwiY2hpbGRMaXN0IiwiY2hhcmFjdGVyRGF0YSIsImdsb2JhbElkIiwic2NyYXRjaEdsb2JhbEJvdW5kcyIsInNjcmF0Y2hTaWJsaW5nQm91bmRzIiwiZ2xvYmFsTm9kZVRyYW5zbGF0aW9uTWF0cml4IiwiZ2xvYmFsVG9DbGllbnRTY2FsZU1hdHJpeCIsIm5vZGVTY2FsZU1hZ25pdHVkZU1hdHJpeCIsIlBET01QZWVyIiwiY29uc3RydWN0b3IiLCJwZG9tSW5zdGFuY2UiLCJvcHRpb25zIiwiaW5pdGlhbGl6ZVBET01QZWVyIiwicHJpbWFyeVNpYmxpbmciLCJhc3NlcnQiLCJpZCIsImlzRGlzcG9zZWQiLCJub2RlIiwiZGlzcGxheSIsInRyYWlsIiwidmlzaWJsZSIsImZvY3VzYWJsZSIsIl9sYWJlbFNpYmxpbmciLCJfZGVzY3JpcHRpb25TaWJsaW5nIiwiX2NvbnRhaW5lclBhcmVudCIsInRvcExldmVsRWxlbWVudHMiLCJwb3NpdGlvbkRpcnR5IiwiY2hpbGRQb3NpdGlvbkRpcnR5IiwicG9zaXRpb25JblBET00iLCJtdXRhdGlvbk9ic2VydmVyIiwiTXV0YXRpb25PYnNlcnZlciIsImludmFsaWRhdGVDU1NQb3NpdGlvbmluZyIsImJpbmQiLCJ0cmFuc2Zvcm1MaXN0ZW5lciIsInRyYW5zZm9ybVRyYWNrZXIiLCJhZGRMaXN0ZW5lciIsIl9wcmVzZXJ2ZWREaXNhYmxlZFZhbHVlIiwiaXNSb290SW5zdGFuY2UiLCJfcHJpbWFyeVNpYmxpbmciLCJjbGFzc0xpc3QiLCJhZGQiLCJST09UX0NMQVNTX05BTUUiLCJCTE9DS0VEX0RPTV9FVkVOVFMiLCJmb3JFYWNoIiwiZXZlbnRUeXBlIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50Iiwic3RvcFByb3BhZ2F0aW9uIiwidXBkYXRlIiwidXBkYXRlSW5kaWNlc1N0cmluZ0FuZEVsZW1lbnRJZHMiLCJnZXRCYXNlT3B0aW9ucyIsImNhbGxiYWNrc0Zvck90aGVyTm9kZXMiLCJhY2Nlc3NpYmxlTmFtZSIsImFjY2Vzc2libGVOYW1lQmVoYXZpb3IiLCJwZG9tSGVhZGluZyIsInBkb21IZWFkaW5nQmVoYXZpb3IiLCJoZWxwVGV4dCIsImhlbHBUZXh0QmVoYXZpb3IiLCJjcmVhdGVFbGVtZW50IiwidGFnTmFtZSIsIm5hbWVzcGFjZSIsInBkb21OYW1lc3BhY2UiLCJjb250YWluZXJUYWdOYW1lIiwibGFiZWxUYWdOYW1lIiwiZXhjbHVkZUZyb21JbnB1dCIsImV4Y2x1ZGVMYWJlbFNpYmxpbmdGcm9tSW5wdXQiLCJkZXNjcmlwdGlvblRhZ05hbWUiLCJvcmRlckVsZW1lbnRzIiwiZGlzY29ubmVjdCIsIm9ic2VydmUiLCJsYWJlbENvbnRlbnQiLCJzZXRMYWJlbFNpYmxpbmdDb250ZW50IiwiaW5uZXJDb250ZW50Iiwic2V0UHJpbWFyeVNpYmxpbmdDb250ZW50IiwiZGVzY3JpcHRpb25Db250ZW50Iiwic2V0RGVzY3JpcHRpb25TaWJsaW5nQ29udGVudCIsInRvVXBwZXJDYXNlIiwiaW5wdXRUeXBlIiwic2V0QXR0cmlidXRlVG9FbGVtZW50Iiwic2V0Rm9jdXNhYmxlIiwic2V0UG9zaXRpb25JblBET00iLCJvbkFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25DaGFuZ2UiLCJvbkFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uQ2hhbmdlIiwib25BY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25DaGFuZ2UiLCJvbkF0dHJpYnV0ZUNoYW5nZSIsIm9uQ2xhc3NDaGFuZ2UiLCJvbklucHV0VmFsdWVDaGFuZ2UiLCJ1cGRhdGVPdGhlck5vZGVzQXJpYUxhYmVsbGVkYnkiLCJ1cGRhdGVPdGhlck5vZGVzQXJpYURlc2NyaWJlZGJ5IiwidXBkYXRlT3RoZXJOb2Rlc0FjdGl2ZURlc2NlbmRhbnQiLCJjYWxsYmFjayIsImNvbmZpZyIsImluc2VydEJlZm9yZSIsImNoaWxkcmVuIiwiZmlsdGVyIiwiXyIsImlkZW50aXR5IiwiYXJyYW5nZUNvbnRlbnRFbGVtZW50IiwiYXBwZW5kTGFiZWwiLCJhcHBlbmREZXNjcmlwdGlvbiIsImdldFByaW1hcnlTaWJsaW5nIiwiZ2V0TGFiZWxTaWJsaW5nIiwibGFiZWxTaWJsaW5nIiwiZ2V0RGVzY3JpcHRpb25TaWJsaW5nIiwiZGVzY3JpcHRpb25TaWJsaW5nIiwiZ2V0Q29udGFpbmVyUGFyZW50IiwiY29udGFpbmVyUGFyZW50IiwiZ2V0VG9wTGV2ZWxFbGVtZW50Q29udGFpbmluZ1ByaW1hcnlTaWJsaW5nIiwicmVtb3ZlQXR0cmlidXRlRnJvbUFsbEVsZW1lbnRzIiwiaSIsImFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zIiwibGVuZ3RoIiwiYXNzb2NpYXRpb25PYmplY3QiLCJvdGhlck5vZGUiLCJub2Rlc1RoYXRBcmVBcmlhTGFiZWxsZWRieVRoaXNOb2RlIiwiaW5kZXhPZiIsInNldEFzc29jaWF0aW9uQXR0cmlidXRlIiwiYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zIiwibm9kZXNUaGF0QXJlQXJpYURlc2NyaWJlZGJ5VGhpc05vZGUiLCJhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zIiwibm9kZXNUaGF0QXJlQWN0aXZlRGVzY2VuZGFudFRvVGhpc05vZGUiLCJoYW5kbGVBdHRyaWJ1dGVXaXRoUERPTU9wdGlvbiIsImtleSIsInZhbHVlIiwicmVtb3ZlQXR0cmlidXRlRnJvbUVsZW1lbnQiLCJwZG9tT3B0aW9ucyIsInBkb21BdHRyaWJ1dGVzIiwiZGF0YU9iamVjdCIsImF0dHJpYnV0ZSIsImFyaWFMYWJlbCIsImFyaWFSb2xlIiwicGRvbUNsYXNzZXMiLCJzZXRDbGFzc1RvRWxlbWVudCIsImNsYXNzTmFtZSIsImlucHV0VmFsdWUiLCJ1bmRlZmluZWQiLCJ2YWx1ZVN0cmluZyIsImFzUHJvcGVydHkiLCJnZXRFbGVtZW50QnlOYW1lIiwiZWxlbWVudE5hbWUiLCJFcnJvciIsImF0dHJpYnV0ZVZhbHVlIiwiZWxlbWVudCIsImF0dHJpYnV0ZVZhbHVlV2l0aG91dE1hcmtzIiwiaW50ZXJhY3RpdmUiLCJzZXRBdHRyaWJ1dGVOUyIsInNldEF0dHJpYnV0ZSIsInJlbW92ZUF0dHJpYnV0ZU5TIiwicmVtb3ZlQXR0cmlidXRlIiwicmVtb3ZlQ2xhc3NGcm9tRWxlbWVudCIsInJlbW92ZSIsIkFTU09DSUFUSU9OX0FUVFJJQlVURVMiLCJvdGhlck5vZGVQRE9NSW5zdGFuY2VzIiwiZ2V0UERPTUluc3RhbmNlcyIsImZpcnN0UERPTUluc3RhbmNlIiwicGVlciIsIm90aGVyUGVlckVsZW1lbnQiLCJvdGhlckVsZW1lbnROYW1lIiwidGhpc0VsZW1lbnROYW1lIiwicHJldmlvdXNBdHRyaWJ1dGVWYWx1ZSIsImdldEF0dHJpYnV0ZSIsIm5ld0F0dHJpYnV0ZVZhbHVlIiwidHJpbSIsImpvaW4iLCJjb250ZW50RWxlbWVudCIsImFwcGVuZEVsZW1lbnQiLCJhcHBlbmRDaGlsZCIsImluZGV4T2ZQcmltYXJ5U2libGluZyIsImluc2VydEluZGV4Iiwic3BsaWNlIiwiaXNWaXNpYmxlIiwidmlzaWJsZUVsZW1lbnRzIiwiaGlkZGVuIiwiaGFzQXR0cmlidXRlIiwic2V0VmlzaWJsZSIsImlzRm9jdXNlZCIsInZpc3VhbEZvY3VzVHJhaWwiLCJndWVzc1Zpc3VhbFRyYWlsIiwicm9vdE5vZGUiLCJwZG9tRm9jdXNQcm9wZXJ0eSIsImVxdWFscyIsImZvY3VzIiwiYmx1ciIsInBlZXJIYWRGb2N1cyIsIm92ZXJyaWRlRm9jdXNXaXRoVGFiSW5kZXgiLCJjb250ZW50Iiwic2V0VGV4dENvbnRlbnQiLCJ0YWdOYW1lU3VwcG9ydHNDb250ZW50Iiwic2V0UERPTVRyYW5zZm9ybVNvdXJjZU5vZGUiLCJyZW1vdmVMaXN0ZW5lciIsInVwZGF0ZVRyYW5zZm9ybVRyYWNrZXIiLCJnZXRFbGVtZW50SWQiLCJzaWJsaW5nTmFtZSIsInN0cmluZ0lkIiwiaW5kaWNlcyIsImdldFBET01JbnN0YW5jZVVuaXF1ZUlkIiwiREFUQV9QRE9NX1VOSVFVRV9JRCIsInBhcmVudCIsInBvc2l0aW9uRWxlbWVudHMiLCJ0cmFuc2Zvcm1Tb3VyY2VOb2RlIiwicGRvbVRyYW5zZm9ybVNvdXJjZU5vZGUiLCJzZXQiLCJsb2NhbEJvdW5kcyIsImlzRmluaXRlIiwidHJhbnNmb3JtIiwiZ2V0TWF0cml4IiwiZGlzcGxheUJvdW5kcyIsImJvdW5kcyIsImludGVyc2VjdHNCb3VuZHMiLCJjb25zdHJhaW5Cb3VuZHMiLCJjbGllbnREaW1lbnNpb25zIiwiZ2V0Q2xpZW50RGltZW5zaW9ucyIsImNsaWVudFdpZHRoIiwid2lkdGgiLCJjbGllbnRIZWlnaHQiLCJoZWlnaHQiLCJzZXRNaW5NYXgiLCJnZXRDU1NNYXRyaXgiLCJzZXRDbGllbnRCb3VuZHMiLCJPRkZTQ1JFRU5fU0lCTElOR19CT1VORFMiLCJ1cGRhdGVTdWJ0cmVlUG9zaXRpb25pbmciLCJwYXJlbnRQb3NpdGlvbkluUERPTSIsImNoaWxkUGVlciIsInJlY3Vyc2l2ZURpc2FibGUiLCJkaXNhYmxlZCIsImRpc3Bvc2UiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiYmx1ckV2ZW50TGlzdGVuZXIiLCJmb2N1c0V2ZW50TGlzdGVuZXIiLCJmcmVlVG9Qb29sIiwicmVnaXN0ZXIiLCJtaXhJbnRvIiwiaW5pdGlhbGl6ZSIsInByb3RvdHlwZSIsIm5ld0VsZW1lbnQiLCJEQVRBX0VYQ0xVREVfRlJPTV9JTlBVVCIsIm5vZGVHbG9iYWxCb3VuZHMiLCJzZXRUb1RyYW5zbGF0aW9uIiwibWluWCIsIm1pblkiLCJzZXRUb1NjYWxlIiwibXVsdGlwbHlNYXRyaXgiLCJzaWJsaW5nRWxlbWVudCIsImNsaWVudFJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJzdHlsZSIsInRvcCIsImxlZnQiXSwic291cmNlcyI6WyJQRE9NUGVlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBbiBhY2Nlc3NpYmxlIHBlZXIgY29udHJvbHMgdGhlIGFwcGVhcmFuY2Ugb2YgYW4gYWNjZXNzaWJsZSBOb2RlJ3MgaW5zdGFuY2UgaW4gdGhlIHBhcmFsbGVsIERPTS4gQW4gUERPTVBlZXIgY2FuXHJcbiAqIGhhdmUgdXAgdG8gZm91ciB3aW5kb3cuRWxlbWVudHMgZGlzcGxheWVkIGluIHRoZSBQRE9NLCBzZWUgZnRydWN0b3IgZm9yIGRldGFpbHMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IGFycmF5UmVtb3ZlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hcnJheVJlbW92ZS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcclxuaW1wb3J0IHN0cmlwRW1iZWRkaW5nTWFya3MgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3N0cmlwRW1iZWRkaW5nTWFya3MuanMnO1xyXG5pbXBvcnQgeyBGb2N1c01hbmFnZXIsIFBET01JbnN0YW5jZSwgUERPTVNpYmxpbmdTdHlsZSwgUERPTVV0aWxzLCBzY2VuZXJ5IH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgUFJJTUFSWV9TSUJMSU5HID0gJ1BSSU1BUllfU0lCTElORyc7XHJcbmNvbnN0IExBQkVMX1NJQkxJTkcgPSAnTEFCRUxfU0lCTElORyc7XHJcbmNvbnN0IERFU0NSSVBUSU9OX1NJQkxJTkcgPSAnREVTQ1JJUFRJT05fU0lCTElORyc7XHJcbmNvbnN0IENPTlRBSU5FUl9QQVJFTlQgPSAnQ09OVEFJTkVSX1BBUkVOVCc7XHJcbmNvbnN0IExBQkVMX1RBRyA9IFBET01VdGlscy5UQUdTLkxBQkVMO1xyXG5jb25zdCBJTlBVVF9UQUcgPSBQRE9NVXRpbHMuVEFHUy5JTlBVVDtcclxuY29uc3QgRElTQUJMRURfQVRUUklCVVRFX05BTUUgPSAnZGlzYWJsZWQnO1xyXG5cclxuLy8gRE9NIG9ic2VydmVycyB0aGF0IGFwcGx5IG5ldyBDU1MgdHJhbnNmb3JtYXRpb25zIGFyZSB0cmlnZ2VyZWQgd2hlbiBjaGlsZHJlbiwgb3IgaW5uZXIgY29udGVudCBjaGFuZ2UuIFVwZGF0aW5nXHJcbi8vIHN0eWxlL3Bvc2l0aW9uaW5nIG9mIHRoZSBlbGVtZW50IHdpbGwgY2hhbmdlIGF0dHJpYnV0ZXMgc28gd2UgY2FuJ3Qgb2JzZXJ2ZSB0aG9zZSBjaGFuZ2VzIHNpbmNlIGl0IHdvdWxkIHRyaWdnZXJcclxuLy8gdGhlIE11dGF0aW9uT2JzZXJ2ZXIgaW5maW5pdGVseS5cclxuY29uc3QgT0JTRVJWRVJfQ09ORklHID0geyBhdHRyaWJ1dGVzOiBmYWxzZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiB0cnVlIH07XHJcblxyXG5sZXQgZ2xvYmFsSWQgPSAxO1xyXG5cclxuLy8gbXV0YWJsZXMgaW5zdGFuY2VzIHRvIGF2b2lkIGNyZWF0aW5nIG1hbnkgaW4gb3BlcmF0aW9ucyB0aGF0IG9jY3VyIGZyZXF1ZW50bHlcclxuY29uc3Qgc2NyYXRjaEdsb2JhbEJvdW5kcyA9IG5ldyBCb3VuZHMyKCAwLCAwLCAwLCAwICk7XHJcbmNvbnN0IHNjcmF0Y2hTaWJsaW5nQm91bmRzID0gbmV3IEJvdW5kczIoIDAsIDAsIDAsIDAgKTtcclxuY29uc3QgZ2xvYmFsTm9kZVRyYW5zbGF0aW9uTWF0cml4ID0gbmV3IE1hdHJpeDMoKTtcclxuY29uc3QgZ2xvYmFsVG9DbGllbnRTY2FsZU1hdHJpeCA9IG5ldyBNYXRyaXgzKCk7XHJcbmNvbnN0IG5vZGVTY2FsZU1hZ25pdHVkZU1hdHJpeCA9IG5ldyBNYXRyaXgzKCk7XHJcblxyXG5jbGFzcyBQRE9NUGVlciB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQRE9NSW5zdGFuY2V9IHBkb21JbnN0YW5jZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKiBAbWl4ZXMgUG9vbGFibGVcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcGRvbUluc3RhbmNlLCBvcHRpb25zICkge1xyXG4gICAgdGhpcy5pbml0aWFsaXplUERPTVBlZXIoIHBkb21JbnN0YW5jZSwgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG9iamVjdCAoZWl0aGVyIGZyb20gYSBmcmVzaGx5LWNyZWF0ZWQgc3RhdGUsIG9yIGZyb20gYSBcImRpc3Bvc2VkXCIgc3RhdGUgYnJvdWdodCBiYWNrIGZyb20gYVxyXG4gICAqIHBvb2wpLlxyXG4gICAqXHJcbiAgICogTk9URTogdGhlIFBET01QZWVyIGlzIG5vdCBmdWxseSBjb25zdHJ1Y3RlZCB1bnRpbCBjYWxsaW5nIFBET01QZWVyLnVwZGF0ZSgpIGFmdGVyIGNyZWF0aW5nIGZyb20gcG9vbC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQRE9NSW5zdGFuY2V9IHBkb21JbnN0YW5jZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKiBAcmV0dXJucyB7UERPTVBlZXJ9IC0gUmV0dXJucyAndGhpcycgcmVmZXJlbmNlLCBmb3IgY2hhaW5pbmdcclxuICAgKi9cclxuICBpbml0aWFsaXplUERPTVBlZXIoIHBkb21JbnN0YW5jZSwgb3B0aW9ucyApIHtcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBwcmltYXJ5U2libGluZzogbnVsbFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlkIHx8IHRoaXMuaXNEaXNwb3NlZCwgJ0lmIHdlIHByZXZpb3VzbHkgZXhpc3RlZCwgd2UgbmVlZCB0byBoYXZlIGJlZW4gZGlzcG9zZWQnICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIHVuaXF1ZSBJRFxyXG4gICAgdGhpcy5pZCA9IHRoaXMuaWQgfHwgZ2xvYmFsSWQrKztcclxuXHJcbiAgICAvLyBAcHVibGljIHtQRE9NSW5zdGFuY2V9XHJcbiAgICB0aGlzLnBkb21JbnN0YW5jZSA9IHBkb21JbnN0YW5jZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtOb2RlfG51bGx9IG9ubHkgbnVsbCBmb3IgdGhlIHJvb3QgcGRvbUluc3RhbmNlXHJcbiAgICB0aGlzLm5vZGUgPSB0aGlzLnBkb21JbnN0YW5jZS5ub2RlO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0Rpc3BsYXl9IC0gRWFjaCBwZWVyIGlzIGFzc29jaWF0ZWQgd2l0aCBhIHNwZWNpZmljIERpc3BsYXkuXHJcbiAgICB0aGlzLmRpc3BsYXkgPSBwZG9tSW5zdGFuY2UuZGlzcGxheTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtUcmFpbH0gLSBOT1RFOiBNYXkgaGF2ZSBcImdhcHNcIiBkdWUgdG8gcGRvbU9yZGVyIHVzYWdlLlxyXG4gICAgdGhpcy50cmFpbCA9IHBkb21JbnN0YW5jZS50cmFpbDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbnxudWxsfSAtIHdoZXRoZXIgb3Igbm90IHRoaXMgUERPTVBlZXIgaXMgdmlzaWJsZSBpbiB0aGUgUERPTVxyXG4gICAgLy8gT25seSBpbml0aWFsaXplZCB0byBudWxsLCBzaG91bGQgbm90IGJlIHNldCB0byBpdC4gaXNWaXNpYmxlKCkgd2lsbCByZXR1cm4gdHJ1ZSBpZiB0aGlzLnZpc2libGUgaXMgbnVsbFxyXG4gICAgLy8gKGJlY2F1c2UgaXQgaGFzbid0IGJlZW4gc2V0IHlldCkuXHJcbiAgICB0aGlzLnZpc2libGUgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufG51bGx9IC0gd2hldGhlciBvciBub3QgdGhlIHByaW1hcnkgc2libGluZyBvZiB0aGlzIFBET01QZWVyIGNhbiByZWNlaXZlIGZvY3VzLlxyXG4gICAgdGhpcy5mb2N1c2FibGUgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtIVE1MRWxlbWVudHxudWxsfSAtIE9wdGlvbmFsIGxhYmVsL2Rlc2NyaXB0aW9uIGVsZW1lbnRzXHJcbiAgICB0aGlzLl9sYWJlbFNpYmxpbmcgPSBudWxsO1xyXG4gICAgdGhpcy5fZGVzY3JpcHRpb25TaWJsaW5nID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7SFRNTEVsZW1lbnR8bnVsbH0gLSBBIHBhcmVudCBlbGVtZW50IHRoYXQgY2FuIGNvbnRhaW4gdGhpcyBwcmltYXJ5U2libGluZyBhbmQgb3RoZXIgc2libGluZ3MsIHVzdWFsbHlcclxuICAgIC8vIHRoZSBsYWJlbCBhbmQgZGVzY3JpcHRpb24gY29udGVudC5cclxuICAgIHRoaXMuX2NvbnRhaW5lclBhcmVudCA9IG51bGw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7SFRNTEVsZW1lbnRbXX0gUmF0aGVyIHRoYW4gZ3VhcmFudGVlIHRoYXQgYSBwZWVyIGlzIGEgdHJlZSB3aXRoIGEgcm9vdCBET01FbGVtZW50LFxyXG4gICAgLy8gYWxsb3cgbXVsdGlwbGUgd2luZG93LkVsZW1lbnRzIGF0IHRoZSB0b3AgbGV2ZWwgb2YgdGhlIHBlZXIuIFRoaXMgaXMgdXNlZCBmb3Igc29ydGluZyB0aGUgaW5zdGFuY2UuXHJcbiAgICAvLyBTZWUgdGhpcy5vcmRlckVsZW1lbnRzIGZvciBtb3JlIGluZm8uXHJcbiAgICB0aGlzLnRvcExldmVsRWxlbWVudHMgPSBbXTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBmbGFnIHRoYXQgaW5kaWNhdGVzIHRoYXQgdGhpcyBwZWVyIGhhcyBhY2Nlc3NpYmxlIGNvbnRlbnQgdGhhdCBjaGFuZ2VkLCBhbmQgc29cclxuICAgIC8vIHRoZSBzaWJsaW5ncyBuZWVkIHRvIGJlIHJlcG9zaXRpb25lZCBpbiB0aGUgbmV4dCBEaXNwbGF5LnVwZGF0ZURpc3BsYXkoKVxyXG4gICAgdGhpcy5wb3NpdGlvbkRpcnR5ID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gaW5kaWNhdGVzIHRoYXQgdGhpcyBwZWVyJ3MgcGRvbUluc3RhbmNlIGhhcyBhIGRlc2NlbmRhbnQgdGhhdCBpcyBkaXJ0eS4gVXNlZCB0b1xyXG4gICAgLy8gcXVpY2tseSBmaW5kIHBlZXJzIHdpdGggcG9zaXRpb25EaXJ0eSB3aGVuIHdlIHRyYXZlcnNlIHRoZSB0cmVlIG9mIFBET01JbnN0YW5jZXNcclxuICAgIHRoaXMuY2hpbGRQb3NpdGlvbkRpcnR5ID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gSW5kaWNhdGVzIHRoYXQgdGhpcyBwZWVyIHdpbGwgcG9zaXRpb24gc2libGluZyBlbGVtZW50cyBzbyB0aGF0XHJcbiAgICAvLyB0aGV5IGFyZSBpbiB0aGUgcmlnaHQgbG9jYXRpb24gaW4gdGhlIHZpZXdwb3J0LCB3aGljaCBpcyBhIHJlcXVpcmVtZW50IGZvciB0b3VjaCBiYXNlZFxyXG4gICAgLy8gc2NyZWVuIHJlYWRlcnMuIFNlZSBzZXRQb3NpdGlvbkluUERPTS5cclxuICAgIHRoaXMucG9zaXRpb25JblBET00gPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7TXV0YXRpb25PYnNlcnZlcn0gLSBBbiBvYnNlcnZlciB0aGF0IHdpbGwgY2FsbCBiYWNrIGFueSB0aW1lIGEgcHJvcGVydHkgb2YgdGhlIHByaW1hcnlcclxuICAgIC8vIHNpYmxpbmcgY2hhbmdlcy4gVXNlZCB0byByZXBvc2l0aW9uIHRoZSBzaWJsaW5nIGVsZW1lbnRzIGlmIHRoZSBib3VuZGluZyBib3ggcmVzaXplcy4gTm8gbmVlZCB0byBsb29wIG92ZXJcclxuICAgIC8vIGFsbCBvZiB0aGUgbXV0YXRpb25zLCBhbnkgc2luZ2xlIG11dGF0aW9uIHdpbGwgcmVxdWlyZSB1cGRhdGluZyBDU1MgcG9zaXRpb25pbmcuXHJcbiAgICAvL1xyXG4gICAgLy8gTk9URTogSWRlYWxseSwgYSBzaW5nbGUgTXV0YXRpb25PYnNlcnZlciBjb3VsZCBiZSB1c2VkIHRvIG9ic2VydmUgY2hhbmdlcyB0byBhbGwgZWxlbWVudHMgaW4gdGhlIFBET00uIEJ1dFxyXG4gICAgLy8gTXV0YXRpb25PYnNlcnZlciBtYWtlcyBpdCBpbXBvc3NpYmxlIHRvIGRldGFjaCBvYnNlcnZlcnMgZnJvbSBhIHNpbmdsZSBlbGVtZW50LiBNdXRhdGlvbk9ic2VydmVyLmRldGFjaCgpXHJcbiAgICAvLyB3aWxsIHJlbW92ZSBsaXN0ZW5lcnMgb24gYWxsIG9ic2VydmVkIGVsZW1lbnRzLCBzbyBpbmRpdmlkdWFsIG9ic2VydmVycyBtdXN0IGJlIHVzZWQgb24gZWFjaCBlbGVtZW50LlxyXG4gICAgLy8gT25lIGFsdGVybmF0aXZlIGNvdWxkIGJlIHRvIHB1dCB0aGUgTXV0YXRpb25PYnNlcnZlciBvbiB0aGUgcm9vdCBlbGVtZW50IGFuZCB1c2UgXCJzdWJ0cmVlOiB0cnVlXCIgaW5cclxuICAgIC8vIE9CU0VSVkVSX0NPTkZJRy4gVGhpcyBjb3VsZCByZWR1Y2UgdGhlIG51bWJlciBvZiBNdXRhdGlvbk9ic2VydmVycywgYnV0IHRoZXJlIGlzIG5vIGVhc3kgd2F5IHRvIGdldCB0aGVcclxuICAgIC8vIHBlZXIgZnJvbSB0aGUgbXV0YXRpb24gdGFyZ2V0IGVsZW1lbnQuIElmIE11dGF0aW9uT2JzZXJ2ZXIgdGFrZXMgYSBsb3Qgb2YgbWVtb3J5LCB0aGlzIGNvdWxkIGJlIGFuXHJcbiAgICAvLyBvcHRpbWl6YXRpb24gdGhhdCBtYXkgY29tZSB3aXRoIGEgcGVyZm9ybWFuY2UgY29zdC5cclxuICAgIC8vXHJcbiAgICAvLyBOT1RFOiBSZXNpemVPYnNlcnZlciBpcyBhIHN1cGVyaW9yIGFsdGVybmF0aXZlIHRvIE11dGF0aW9uT2JzZXJ2ZXIgZm9yIHRoaXMgcHVycG9zZSBiZWNhdXNlXHJcbiAgICAvLyBpdCB3aWxsIG9ubHkgbW9uaXRvciBjaGFuZ2VzIHdlIGNhcmUgYWJvdXQgYW5kIHByZXZlbnQgaW5maW5pdGUgY2FsbGJhY2sgbG9vcHMgaWYgc2l6ZSBpcyBjaGFuZ2VkIGluXHJcbiAgICAvLyB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gKHdlIGdldCBhcm91bmQgdGhpcyBub3cgYnkgbm90IG9ic2VydmluZyBhdHRyaWJ1dGUgY2hhbmdlcykuIEJ1dCBpdCBpcyBub3QgeWV0IHdpZGVseVxyXG4gICAgLy8gc3VwcG9ydGVkLCBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1Jlc2l6ZU9ic2VydmVyLlxyXG4gICAgLy9cclxuICAgIC8vIFRPRE86IFNob3VsZCB3ZSBiZSB3YXRjaGluZyBcIm1vZGVsXCIgY2hhbmdlcyBmcm9tIFBhcmFsbGVsRE9NLmpzIGluc3RlYWQgb2YgdXNpbmcgTXV0YXRpb25PYnNlcnZlcj9cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODUyLiBUaGlzIHdvdWxkIGJlIGxlc3MgZnJhZ2lsZSwgYW5kIGFsc28gbGVzc1xyXG4gICAgLy8gbWVtb3J5IGludGVuc2l2ZSBiZWNhdXNlIHdlIGRvbid0IG5lZWQgYW4gaW5zdGFuY2Ugb2YgTXV0YXRpb25PYnNlcnZlciBvbiBldmVyeSBQRE9NSW5zdGFuY2UuXHJcbiAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIgPSB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIgfHwgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoIHRoaXMuaW52YWxpZGF0ZUNTU1Bvc2l0aW9uaW5nLmJpbmQoIHRoaXMgKSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn0gLSBtdXN0IGJlIHJlbW92ZWQgb24gZGlzcG9zYWxcclxuICAgIHRoaXMudHJhbnNmb3JtTGlzdGVuZXIgPSB0aGlzLnRyYW5zZm9ybUxpc3RlbmVyIHx8IHRoaXMuaW52YWxpZGF0ZUNTU1Bvc2l0aW9uaW5nLmJpbmQoIHRoaXMgKTtcclxuICAgIHRoaXMucGRvbUluc3RhbmNlLnRyYW5zZm9ybVRyYWNrZXIuYWRkTGlzdGVuZXIoIHRoaXMudHJhbnNmb3JtTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Kn0gLSBUbyBzdXBwb3J0IHNldHRpbmcgdGhlIERpc3BsYXkuaW50ZXJhY3RpdmU9ZmFsc2UgKHdoaWNoIHNldHMgZGlzYWJsZWQgb24gYWxsIHByaW1hcnlTaWJsaW5ncyxcclxuICAgIC8vIHdlIG5lZWQgdG8gc2V0IGRpc2FibGVkIG9uIGEgc2VwYXJhdGUgY2hhbm5lbCBmcm9tIHRoaXMuc2V0QXR0cmlidXRlVG9FbGVtZW50LiBUaGF0IHdheSB3ZSBjb3ZlciB0aGUgY2FzZSB3aGVyZVxyXG4gICAgLy8gYGRpc2FibGVkYCB3YXMgc2V0IHRocm91Z2ggdGhlIFBhcmFsbGVsRE9NIEFQSSB3aGVuIHdlIG5lZWQgdG8gdG9nZ2xlIGl0IHNwZWNpZmljYWxseSBmb3IgRGlzcGxheS5pbnRlcmFjdGl2ZS5cclxuICAgIC8vIFRoaXMgd2F5IHdlIGNhbiBjb25zZXJ2ZSB0aGUgcHJldmlvdXMgYGRpc2FibGVkYCBhdHRyaWJ1dGUvcHJvcGVydHkgdmFsdWUgdGhyb3VnaCB0b2dnbGluZyBEaXNwbGF5LmludGVyYWN0aXZlLlxyXG4gICAgdGhpcy5fcHJlc2VydmVkRGlzYWJsZWRWYWx1ZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gV2hldGhlciB3ZSBhcmUgY3VycmVudGx5IGluIGEgXCJkaXNwb3NlZFwiIChpbiB0aGUgcG9vbCkgc3RhdGUsIG9yIGFyZSBhdmFpbGFibGUgdG8gYmVcclxuICAgIC8vIGludGVyYWN0ZWQgd2l0aC5cclxuICAgIHRoaXMuaXNEaXNwb3NlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIGVkZ2UgY2FzZSBmb3Igcm9vdCBhY2Nlc3NpYmlsaXR5XHJcbiAgICBpZiAoIHRoaXMucGRvbUluc3RhbmNlLmlzUm9vdEluc3RhbmNlICkge1xyXG5cclxuICAgICAgLy8gQHByaXZhdGUge0hUTUxFbGVtZW50fSAtIFRoZSBtYWluIGVsZW1lbnQgYXNzb2NpYXRlZCB3aXRoIHRoaXMgcGVlci4gSWYgZm9jdXNhYmxlLCB0aGlzIGlzIHRoZSBlbGVtZW50IHRoYXQgZ2V0c1xyXG4gICAgICAvLyB0aGUgZm9jdXMuIEl0IGFsc28gd2lsbCBjb250YWluIGFueSBjaGlsZHJlbi5cclxuICAgICAgdGhpcy5fcHJpbWFyeVNpYmxpbmcgPSBvcHRpb25zLnByaW1hcnlTaWJsaW5nO1xyXG4gICAgICB0aGlzLl9wcmltYXJ5U2libGluZy5jbGFzc0xpc3QuYWRkKCBQRE9NU2libGluZ1N0eWxlLlJPT1RfQ0xBU1NfTkFNRSApO1xyXG5cclxuICAgICAgLy8gU3RvcCBibG9ja2VkIGV2ZW50cyBmcm9tIGJ1YmJsaW5nIHBhc3QgdGhlIHJvb3Qgb2YgdGhlIFBET00gc28gdGhhdCBzY2VuZXJ5IGRvZXNcclxuICAgICAgLy8gbm90IGRpc3BhdGNoIHRoZW0gaW4gSW5wdXQuanMuXHJcbiAgICAgIFBET01VdGlscy5CTE9DS0VEX0RPTV9FVkVOVFMuZm9yRWFjaCggZXZlbnRUeXBlID0+IHtcclxuICAgICAgICB0aGlzLl9wcmltYXJ5U2libGluZy5hZGRFdmVudExpc3RlbmVyKCBldmVudFR5cGUsIGV2ZW50ID0+IHtcclxuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBjb250ZW50IG9mIHRoZSBwZWVyLiBUaGlzIG11c3QgYmUgY2FsbGVkIGFmdGVyIHRoZSBBY2Nlc3NpYmVQZWVyIGlzIGNvbnN0cnVjdGVkIGZyb20gcG9vbC5cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVwZGF0ZUluZGljZXNTdHJpbmdBbmRFbGVtZW50SWRzIC0gaWYgdGhpcyBmdW5jdGlvbiBzaG91bGQgYmUgY2FsbGVkIHVwb24gaW5pdGlhbCBcImNvbnN0cnVjdGlvblwiIChpbiB1cGRhdGUpLCBhbGxvd3MgZm9yIHRoZSBvcHRpb24gdG8gZG8gdGhpcyBsYXppbHksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTg0N1xyXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgdXBkYXRlKCB1cGRhdGVJbmRpY2VzU3RyaW5nQW5kRWxlbWVudElkcyApIHtcclxuICAgIGxldCBvcHRpb25zID0gdGhpcy5ub2RlLmdldEJhc2VPcHRpb25zKCk7XHJcblxyXG4gICAgY29uc3QgY2FsbGJhY2tzRm9yT3RoZXJOb2RlcyA9IFtdO1xyXG5cclxuICAgIGlmICggdGhpcy5ub2RlLmFjY2Vzc2libGVOYW1lICE9PSBudWxsICkge1xyXG4gICAgICBvcHRpb25zID0gdGhpcy5ub2RlLmFjY2Vzc2libGVOYW1lQmVoYXZpb3IoIHRoaXMubm9kZSwgb3B0aW9ucywgdGhpcy5ub2RlLmFjY2Vzc2libGVOYW1lLCBjYWxsYmFja3NGb3JPdGhlck5vZGVzICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JywgJ3Nob3VsZCByZXR1cm4gYW4gb2JqZWN0JyApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy5ub2RlLnBkb21IZWFkaW5nICE9PSBudWxsICkge1xyXG4gICAgICBvcHRpb25zID0gdGhpcy5ub2RlLnBkb21IZWFkaW5nQmVoYXZpb3IoIHRoaXMubm9kZSwgb3B0aW9ucywgdGhpcy5ub2RlLnBkb21IZWFkaW5nLCBjYWxsYmFja3NGb3JPdGhlck5vZGVzICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JywgJ3Nob3VsZCByZXR1cm4gYW4gb2JqZWN0JyApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy5ub2RlLmhlbHBUZXh0ICE9PSBudWxsICkge1xyXG4gICAgICBvcHRpb25zID0gdGhpcy5ub2RlLmhlbHBUZXh0QmVoYXZpb3IoIHRoaXMubm9kZSwgb3B0aW9ucywgdGhpcy5ub2RlLmhlbHBUZXh0LCBjYWxsYmFja3NGb3JPdGhlck5vZGVzICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JywgJ3Nob3VsZCByZXR1cm4gYW4gb2JqZWN0JyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgYmFzZSBET00gZWxlbWVudCByZXByZXNlbnRpbmcgdGhpcyBhY2Nlc3NpYmxlIGluc3RhbmNlXHJcbiAgICAvLyBUT0RPOiB3aHkgbm90IGp1c3Qgb3B0aW9ucy5mb2N1c2FibGU/XHJcbiAgICB0aGlzLl9wcmltYXJ5U2libGluZyA9IGNyZWF0ZUVsZW1lbnQoIG9wdGlvbnMudGFnTmFtZSwgdGhpcy5ub2RlLmZvY3VzYWJsZSwge1xyXG4gICAgICBuYW1lc3BhY2U6IG9wdGlvbnMucGRvbU5hbWVzcGFjZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgY29udGFpbmVyIHBhcmVudCBmb3IgdGhlIGRvbSBzaWJsaW5nc1xyXG4gICAgaWYgKCBvcHRpb25zLmNvbnRhaW5lclRhZ05hbWUgKSB7XHJcbiAgICAgIHRoaXMuX2NvbnRhaW5lclBhcmVudCA9IGNyZWF0ZUVsZW1lbnQoIG9wdGlvbnMuY29udGFpbmVyVGFnTmFtZSwgZmFsc2UgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIGxhYmVsIERPTSBlbGVtZW50IHJlcHJlc2VudGluZyB0aGlzIGluc3RhbmNlXHJcbiAgICBpZiAoIG9wdGlvbnMubGFiZWxUYWdOYW1lICkge1xyXG4gICAgICB0aGlzLl9sYWJlbFNpYmxpbmcgPSBjcmVhdGVFbGVtZW50KCBvcHRpb25zLmxhYmVsVGFnTmFtZSwgZmFsc2UsIHtcclxuICAgICAgICBleGNsdWRlRnJvbUlucHV0OiB0aGlzLm5vZGUuZXhjbHVkZUxhYmVsU2libGluZ0Zyb21JbnB1dFxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBkZXNjcmlwdGlvbiBET00gZWxlbWVudCByZXByZXNlbnRpbmcgdGhpcyBpbnN0YW5jZVxyXG4gICAgaWYgKCBvcHRpb25zLmRlc2NyaXB0aW9uVGFnTmFtZSApIHtcclxuICAgICAgdGhpcy5fZGVzY3JpcHRpb25TaWJsaW5nID0gY3JlYXRlRWxlbWVudCggb3B0aW9ucy5kZXNjcmlwdGlvblRhZ05hbWUsIGZhbHNlICk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlSW5kaWNlc1N0cmluZ0FuZEVsZW1lbnRJZHMgJiYgdGhpcy51cGRhdGVJbmRpY2VzU3RyaW5nQW5kRWxlbWVudElkcygpO1xyXG5cclxuICAgIHRoaXMub3JkZXJFbGVtZW50cyggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGFzc2lnbiBsaXN0ZW5lcnMgKHRvIGJlIHJlbW92ZWQgb3IgZGlzY29ubmVjdGVkIGR1cmluZyBkaXNwb3NhbClcclxuICAgIHRoaXMubXV0YXRpb25PYnNlcnZlci5kaXNjb25uZWN0KCk7IC8vIGluIGNhc2UgdXBkYXRlKCkgaXMgY2FsbGVkIG1vcmUgdGhhbiBvbmNlIG9uIGFuIGluc3RhbmNlIG9mIFBET01QZWVyXHJcbiAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIub2JzZXJ2ZSggdGhpcy5fcHJpbWFyeVNpYmxpbmcsIE9CU0VSVkVSX0NPTkZJRyApO1xyXG5cclxuICAgIC8vIHNldCB0aGUgYWNjZXNzaWJsZSBsYWJlbCBub3cgdGhhdCB0aGUgZWxlbWVudCBoYXMgYmVlbiByZWNyZWF0ZWQgYWdhaW4sIGJ1dCBub3QgaWYgdGhlIHRhZ05hbWVcclxuICAgIC8vIGhhcyBiZWVuIGNsZWFyZWQgb3V0XHJcbiAgICBpZiAoIG9wdGlvbnMubGFiZWxDb250ZW50ICYmIG9wdGlvbnMubGFiZWxUYWdOYW1lICE9PSBudWxsICkge1xyXG4gICAgICB0aGlzLnNldExhYmVsU2libGluZ0NvbnRlbnQoIG9wdGlvbnMubGFiZWxDb250ZW50ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVzdG9yZSB0aGUgaW5uZXJDb250ZW50XHJcbiAgICBpZiAoIG9wdGlvbnMuaW5uZXJDb250ZW50ICYmIG9wdGlvbnMudGFnTmFtZSAhPT0gbnVsbCApIHtcclxuICAgICAgdGhpcy5zZXRQcmltYXJ5U2libGluZ0NvbnRlbnQoIG9wdGlvbnMuaW5uZXJDb250ZW50ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2V0IHRoZSBhY2Nlc3NpYmxlIGRlc2NyaXB0aW9uLCBidXQgbm90IGlmIHRoZSB0YWdOYW1lIGhhcyBiZWVuIGNsZWFyZWQgb3V0LlxyXG4gICAgaWYgKCBvcHRpb25zLmRlc2NyaXB0aW9uQ29udGVudCAmJiBvcHRpb25zLmRlc2NyaXB0aW9uVGFnTmFtZSAhPT0gbnVsbCApIHtcclxuICAgICAgdGhpcy5zZXREZXNjcmlwdGlvblNpYmxpbmdDb250ZW50KCBvcHRpb25zLmRlc2NyaXB0aW9uQ29udGVudCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGVsZW1lbnQgaXMgYW4gaW5wdXQgZWxlbWVudCwgc2V0IGlucHV0IHR5cGVcclxuICAgIGlmICggb3B0aW9ucy50YWdOYW1lLnRvVXBwZXJDYXNlKCkgPT09IElOUFVUX1RBRyAmJiBvcHRpb25zLmlucHV0VHlwZSApIHtcclxuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGVUb0VsZW1lbnQoICd0eXBlJywgb3B0aW9ucy5pbnB1dFR5cGUgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNldEZvY3VzYWJsZSggdGhpcy5ub2RlLmZvY3VzYWJsZSApO1xyXG5cclxuICAgIC8vIHNldCB0aGUgcG9zaXRpb25JblBET00gZmllbGQgdG8gb3VyIHVwZGF0ZWQgaW5zdGFuY2VcclxuICAgIHRoaXMuc2V0UG9zaXRpb25JblBET00oIHRoaXMubm9kZS5wb3NpdGlvbkluUERPTSApO1xyXG5cclxuICAgIC8vIHJlY29tcHV0ZSBhbmQgYXNzaWduIHRoZSBhc3NvY2lhdGlvbiBhdHRyaWJ1dGVzIHRoYXQgbGluayB0d28gZWxlbWVudHMgKGxpa2UgYXJpYS1sYWJlbGxlZGJ5KVxyXG4gICAgdGhpcy5vbkFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25DaGFuZ2UoKTtcclxuICAgIHRoaXMub25BcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbkNoYW5nZSgpO1xyXG4gICAgdGhpcy5vbkFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbkNoYW5nZSgpO1xyXG5cclxuICAgIC8vIHVwZGF0ZSBhbGwgYXR0cmlidXRlcyBmb3IgdGhlIHBlZXIsIHNob3VsZCBjb3ZlciBhcmlhLWxhYmVsLCByb2xlLCBhbmQgb3RoZXJzXHJcbiAgICB0aGlzLm9uQXR0cmlidXRlQ2hhbmdlKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIGFsbCBjbGFzc2VzIGZvciB0aGUgcGVlclxyXG4gICAgdGhpcy5vbkNsYXNzQ2hhbmdlKCk7XHJcblxyXG4gICAgLy8gdXBkYXRlIGlucHV0IHZhbHVlIGF0dHJpYnV0ZSBmb3IgdGhlIHBlZXJcclxuICAgIHRoaXMub25JbnB1dFZhbHVlQ2hhbmdlKCk7XHJcblxyXG4gICAgdGhpcy5ub2RlLnVwZGF0ZU90aGVyTm9kZXNBcmlhTGFiZWxsZWRieSgpO1xyXG4gICAgdGhpcy5ub2RlLnVwZGF0ZU90aGVyTm9kZXNBcmlhRGVzY3JpYmVkYnkoKTtcclxuICAgIHRoaXMubm9kZS51cGRhdGVPdGhlck5vZGVzQWN0aXZlRGVzY2VuZGFudCgpO1xyXG5cclxuICAgIGNhbGxiYWNrc0Zvck90aGVyTm9kZXMuZm9yRWFjaCggY2FsbGJhY2sgPT4ge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgKTtcclxuICAgICAgY2FsbGJhY2soKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhhbmRsZSB0aGUgaW50ZXJuYWwgb3JkZXJpbmcgb2YgdGhlIGVsZW1lbnRzIGluIHRoZSBwZWVyLCB0aGlzIGludm9sdmVzIHNldHRpbmcgdGhlIHByb3BlciB2YWx1ZSBvZlxyXG4gICAqIHRoaXMudG9wTGV2ZWxFbGVtZW50c1xyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSB0aGUgY29tcHV0ZWQgbWl4aW4gb3B0aW9ucyB0byBiZSBhcHBsaWVkIHRvIHRoZSBwZWVyLiAoc2VsZWN0IFBhcmFsbGVsRE9NIG11dGF0b3Iga2V5cylcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIG9yZGVyRWxlbWVudHMoIGNvbmZpZyApIHtcclxuICAgIGlmICggdGhpcy5fY29udGFpbmVyUGFyZW50ICkge1xyXG4gICAgICAvLyBUaGUgZmlyc3QgY2hpbGQgb2YgdGhlIGNvbnRhaW5lciBwYXJlbnQgZWxlbWVudCBzaG91bGQgYmUgdGhlIHBlZXIgZG9tIGVsZW1lbnRcclxuICAgICAgLy8gaWYgdW5kZWZpbmVkLCB0aGUgaW5zZXJ0QmVmb3JlIG1ldGhvZCB3aWxsIGluc2VydCB0aGUgdGhpcy5fcHJpbWFyeVNpYmxpbmcgYXMgdGhlIGZpcnN0IGNoaWxkXHJcbiAgICAgIHRoaXMuX2NvbnRhaW5lclBhcmVudC5pbnNlcnRCZWZvcmUoIHRoaXMuX3ByaW1hcnlTaWJsaW5nLCB0aGlzLl9jb250YWluZXJQYXJlbnQuY2hpbGRyZW5bIDAgXSB8fCBudWxsICk7XHJcbiAgICAgIHRoaXMudG9wTGV2ZWxFbGVtZW50cyA9IFsgdGhpcy5fY29udGFpbmVyUGFyZW50IF07XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFdlYW4gb3V0IGFueSBudWxsIHNpYmxpbmdzXHJcbiAgICAgIHRoaXMudG9wTGV2ZWxFbGVtZW50cyA9IFsgdGhpcy5fbGFiZWxTaWJsaW5nLCB0aGlzLl9kZXNjcmlwdGlvblNpYmxpbmcsIHRoaXMuX3ByaW1hcnlTaWJsaW5nIF0uZmlsdGVyKCBfLmlkZW50aXR5ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaW5zZXJ0IHRoZSBsYWJlbCBhbmQgZGVzY3JpcHRpb24gZWxlbWVudHMgaW4gdGhlIGNvcnJlY3QgbG9jYXRpb24gaWYgdGhleSBleGlzdFxyXG4gICAgLy8gTk9URTogSW1wb3J0YW50IGZvciBhcnJhbmdlQ29udGVudEVsZW1lbnQgdG8gYmUgY2FsbGVkIG9uIHRoZSBsYWJlbCBzaWJsaW5nIGZpcnN0IGZvciBjb3JyZWN0IG9yZGVyXHJcbiAgICB0aGlzLl9sYWJlbFNpYmxpbmcgJiYgdGhpcy5hcnJhbmdlQ29udGVudEVsZW1lbnQoIHRoaXMuX2xhYmVsU2libGluZywgY29uZmlnLmFwcGVuZExhYmVsICk7XHJcbiAgICB0aGlzLl9kZXNjcmlwdGlvblNpYmxpbmcgJiYgdGhpcy5hcnJhbmdlQ29udGVudEVsZW1lbnQoIHRoaXMuX2Rlc2NyaXB0aW9uU2libGluZywgY29uZmlnLmFwcGVuZERlc2NyaXB0aW9uICk7XHJcblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBwcmltYXJ5IHNpYmxpbmcgZWxlbWVudCBmb3IgdGhlIHBlZXJcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge0hUTUxFbGVtZW50fG51bGx9XHJcbiAgICovXHJcbiAgZ2V0UHJpbWFyeVNpYmxpbmcoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcHJpbWFyeVNpYmxpbmc7XHJcbiAgfVxyXG5cclxuICBnZXQgcHJpbWFyeVNpYmxpbmcoKSB7IHJldHVybiB0aGlzLmdldFByaW1hcnlTaWJsaW5nKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBwcmltYXJ5IHNpYmxpbmcgZWxlbWVudCBmb3IgdGhlIHBlZXJcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge0hUTUxFbGVtZW50fG51bGx9XHJcbiAgICovXHJcbiAgZ2V0TGFiZWxTaWJsaW5nKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2xhYmVsU2libGluZztcclxuICB9XHJcblxyXG4gIGdldCBsYWJlbFNpYmxpbmcoKSB7IHJldHVybiB0aGlzLmdldExhYmVsU2libGluZygpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgcHJpbWFyeSBzaWJsaW5nIGVsZW1lbnQgZm9yIHRoZSBwZWVyXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudHxudWxsfVxyXG4gICAqL1xyXG4gIGdldERlc2NyaXB0aW9uU2libGluZygpIHtcclxuICAgIHJldHVybiB0aGlzLl9kZXNjcmlwdGlvblNpYmxpbmc7XHJcbiAgfVxyXG5cclxuICBnZXQgZGVzY3JpcHRpb25TaWJsaW5nKCkgeyByZXR1cm4gdGhpcy5nZXREZXNjcmlwdGlvblNpYmxpbmcoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHByaW1hcnkgc2libGluZyBlbGVtZW50IGZvciB0aGUgcGVlclxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR8bnVsbH1cclxuICAgKi9cclxuICBnZXRDb250YWluZXJQYXJlbnQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyUGFyZW50O1xyXG4gIH1cclxuXHJcbiAgZ2V0IGNvbnRhaW5lclBhcmVudCgpIHsgcmV0dXJuIHRoaXMuZ2V0Q29udGFpbmVyUGFyZW50KCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdG9wLWxldmVsIGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgcHJpbWFyeSBzaWJsaW5nLiBJZiB0aGVyZSBpcyBubyBjb250YWluZXIgcGFyZW50LCB0aGVuIHRoZSBwcmltYXJ5XHJcbiAgICogc2libGluZyBpcyByZXR1cm5lZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR8bnVsbH1cclxuICAgKi9cclxuICBnZXRUb3BMZXZlbEVsZW1lbnRDb250YWluaW5nUHJpbWFyeVNpYmxpbmcoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyUGFyZW50IHx8IHRoaXMuX3ByaW1hcnlTaWJsaW5nO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVjb21wdXRlIHRoZSBhcmlhLWxhYmVsbGVkYnkgYXR0cmlidXRlcyBmb3IgYWxsIG9mIHRoZSBwZWVyJ3MgZWxlbWVudHNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgb25BcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uQ2hhbmdlKCkge1xyXG4gICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGVGcm9tQWxsRWxlbWVudHMoICdhcmlhLWxhYmVsbGVkYnknICk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5ub2RlLmFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBhc3NvY2lhdGlvbk9iamVjdCA9IHRoaXMubm9kZS5hcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uc1sgaSBdO1xyXG5cclxuICAgICAgLy8gQXNzZXJ0IG91dCBpZiB0aGUgbW9kZWwgbGlzdCBpcyBkaWZmZXJlbnQgdGhhbiB0aGUgZGF0YSBoZWxkIGluIHRoZSBhc3NvY2lhdGlvbk9iamVjdFxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhc3NvY2lhdGlvbk9iamVjdC5vdGhlck5vZGUubm9kZXNUaGF0QXJlQXJpYUxhYmVsbGVkYnlUaGlzTm9kZS5pbmRleE9mKCB0aGlzLm5vZGUgKSA+PSAwLFxyXG4gICAgICAgICd1bmV4cGVjdGVkIG90aGVyTm9kZScgKTtcclxuXHJcblxyXG4gICAgICB0aGlzLnNldEFzc29jaWF0aW9uQXR0cmlidXRlKCAnYXJpYS1sYWJlbGxlZGJ5JywgYXNzb2NpYXRpb25PYmplY3QgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlY29tcHV0ZSB0aGUgYXJpYS1kZXNjcmliZWRieSBhdHRyaWJ1dGVzIGZvciBhbGwgb2YgdGhlIHBlZXIncyBlbGVtZW50c1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBvbkFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uQ2hhbmdlKCkge1xyXG4gICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGVGcm9tQWxsRWxlbWVudHMoICdhcmlhLWRlc2NyaWJlZGJ5JyApO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubm9kZS5hcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGFzc29jaWF0aW9uT2JqZWN0ID0gdGhpcy5ub2RlLmFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uc1sgaSBdO1xyXG5cclxuICAgICAgLy8gQXNzZXJ0IG91dCBpZiB0aGUgbW9kZWwgbGlzdCBpcyBkaWZmZXJlbnQgdGhhbiB0aGUgZGF0YSBoZWxkIGluIHRoZSBhc3NvY2lhdGlvbk9iamVjdFxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhc3NvY2lhdGlvbk9iamVjdC5vdGhlck5vZGUubm9kZXNUaGF0QXJlQXJpYURlc2NyaWJlZGJ5VGhpc05vZGUuaW5kZXhPZiggdGhpcy5ub2RlICkgPj0gMCxcclxuICAgICAgICAndW5leHBlY3RlZCBvdGhlck5vZGUnICk7XHJcblxyXG5cclxuICAgICAgdGhpcy5zZXRBc3NvY2lhdGlvbkF0dHJpYnV0ZSggJ2FyaWEtZGVzY3JpYmVkYnknLCBhc3NvY2lhdGlvbk9iamVjdCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVjb21wdXRlIHRoZSBhcmlhLWFjdGl2ZWRlc2NlbmRhbnQgYXR0cmlidXRlcyBmb3IgYWxsIG9mIHRoZSBwZWVyJ3MgZWxlbWVudHNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgb25BY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25DaGFuZ2UoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZUZyb21BbGxFbGVtZW50cyggJ2FyaWEtYWN0aXZlZGVzY2VuZGFudCcgKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm5vZGUuYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgYXNzb2NpYXRpb25PYmplY3QgPSB0aGlzLm5vZGUuYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9uc1sgaSBdO1xyXG5cclxuICAgICAgLy8gQXNzZXJ0IG91dCBpZiB0aGUgbW9kZWwgbGlzdCBpcyBkaWZmZXJlbnQgdGhhbiB0aGUgZGF0YSBoZWxkIGluIHRoZSBhc3NvY2lhdGlvbk9iamVjdFxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhc3NvY2lhdGlvbk9iamVjdC5vdGhlck5vZGUubm9kZXNUaGF0QXJlQWN0aXZlRGVzY2VuZGFudFRvVGhpc05vZGUuaW5kZXhPZiggdGhpcy5ub2RlICkgPj0gMCxcclxuICAgICAgICAndW5leHBlY3RlZCBvdGhlck5vZGUnICk7XHJcblxyXG5cclxuICAgICAgdGhpcy5zZXRBc3NvY2lhdGlvbkF0dHJpYnV0ZSggJ2FyaWEtYWN0aXZlZGVzY2VuZGFudCcsIGFzc29jaWF0aW9uT2JqZWN0ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIG5ldyBhdHRyaWJ1dGUgdG8gdGhlIGVsZW1lbnQgaWYgdGhlIHZhbHVlIGlzIGEgc3RyaW5nLiBJdCB3aWxsIG90aGVyd2lzZSBiZSBudWxsIG9yIHVuZGVmaW5lZCBhbmQgc2hvdWxkXHJcbiAgICogdGhlbiBiZSByZW1vdmVkIGZyb20gdGhlIGVsZW1lbnQuIFRoaXMgYWxsb3dzIGVtcHR5IHN0cmluZ3MgdG8gYmUgc2V0IGFzIHZhbHVlcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcclxuICAgKiBAcGFyYW0ge3N0cmluZ3xudWxsfHVuZGVmaW5lZH0gdmFsdWVcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGhhbmRsZUF0dHJpYnV0ZVdpdGhQRE9NT3B0aW9uKCBrZXksIHZhbHVlICkge1xyXG4gICAgaWYgKCB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICkge1xyXG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZVRvRWxlbWVudCgga2V5LCB2YWx1ZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlRnJvbUVsZW1lbnQoIGtleSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGFsbCBwZG9tIGF0dHJpYnV0ZXMgb250byB0aGUgcGVlciBlbGVtZW50cyBmcm9tIHRoZSBtb2RlbCdzIHN0b3JlZCBkYXRhIG9iamVjdHNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtwZG9tT3B0aW9uc10gLSB0aGVzZSBjYW4gb3ZlcnJpZGUgdGhlIHZhbHVlcyBvZiB0aGUgbm9kZSwgc2VlIHRoaXMudXBkYXRlKClcclxuICAgKi9cclxuICBvbkF0dHJpYnV0ZUNoYW5nZSggcGRvbU9wdGlvbnMgKSB7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5ub2RlLnBkb21BdHRyaWJ1dGVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBkYXRhT2JqZWN0ID0gdGhpcy5ub2RlLnBkb21BdHRyaWJ1dGVzWyBpIF07XHJcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlVG9FbGVtZW50KCBkYXRhT2JqZWN0LmF0dHJpYnV0ZSwgZGF0YU9iamVjdC52YWx1ZSwgZGF0YU9iamVjdC5vcHRpb25zICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTWFudWFsbHkgc3VwcG9ydCBvcHRpb25zIHRoYXQgbWFwIHRvIGF0dHJpYnV0ZXMuIFRoaXMgY292ZXJzIHRoYXQgY2FzZSB3aGVyZSBiZWhhdmlvciBmdW5jdGlvbnMgd2FudCB0byBjaGFuZ2VcclxuICAgIC8vIHRoZXNlLCBidXQgdGhleSBhcmVuJ3QgaW4gbm9kZS5wZG9tQXR0cmlidXRlcy4gSXQgd2lsbCBkbyBkb3VibGUgd29yayBpbiBzb21lIGNhc2VzLCBidXQgaXQgaXMgcHJldHR5IG1pbm9yIGZvclxyXG4gICAgLy8gdGhlIGNvbXBsZXhpdHkgaXQgc2F2ZXMuIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNDM2LiBFbXB0eSBzdHJpbmdzIHNob3VsZCBiZSBzZXR0YWJsZSBmb3JcclxuICAgIC8vIHRoZXNlIGF0dHJpYnV0ZXMgYnV0IG51bGwgYW5kIHVuZGVmaW5lZCBhcmUgaWdub3JlZC5cclxuICAgIHRoaXMuaGFuZGxlQXR0cmlidXRlV2l0aFBET01PcHRpb24oICdhcmlhLWxhYmVsJywgcGRvbU9wdGlvbnMuYXJpYUxhYmVsICk7XHJcbiAgICB0aGlzLmhhbmRsZUF0dHJpYnV0ZVdpdGhQRE9NT3B0aW9uKCAncm9sZScsIHBkb21PcHRpb25zLmFyaWFSb2xlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgYWxsIGNsYXNzZXMgb250byB0aGUgcGVlciBlbGVtZW50cyBmcm9tIHRoZSBtb2RlbCdzIHN0b3JlZCBkYXRhIG9iamVjdHNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIG9uQ2xhc3NDaGFuZ2UoKSB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm5vZGUucGRvbUNsYXNzZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGRhdGFPYmplY3QgPSB0aGlzLm5vZGUucGRvbUNsYXNzZXNbIGkgXTtcclxuICAgICAgdGhpcy5zZXRDbGFzc1RvRWxlbWVudCggZGF0YU9iamVjdC5jbGFzc05hbWUsIGRhdGFPYmplY3Qub3B0aW9ucyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBpbnB1dCB2YWx1ZSBvbiB0aGUgcGVlcidzIHByaW1hcnkgc2libGluZyBlbGVtZW50LiBUaGUgdmFsdWUgYXR0cmlidXRlIG11c3QgYmUgc2V0IGFzIGEgUHJvcGVydHkgdG8gYmVcclxuICAgKiByZWdpc3RlcmVkIGNvcnJlY3RseSBieSBhbiBhc3Npc3RpdmUgZGV2aWNlLiBJZiBudWxsLCB0aGUgYXR0cmlidXRlIGlzIHJlbW92ZWQgc28gdGhhdCB3ZSBkb24ndCBjbHV0dGVyIHRoZSBET01cclxuICAgKiB3aXRoIHZhbHVlPVwibnVsbFwiIGF0dHJpYnV0ZXMuXHJcbiAgICpcclxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIG9uSW5wdXRWYWx1ZUNoYW5nZSgpIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubm9kZS5pbnB1dFZhbHVlICE9PSB1bmRlZmluZWQsICd1c2UgbnVsbCB0byByZW1vdmUgaW5wdXQgdmFsdWUgYXR0cmlidXRlJyApO1xyXG5cclxuICAgIGlmICggdGhpcy5ub2RlLmlucHV0VmFsdWUgPT09IG51bGwgKSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlRnJvbUVsZW1lbnQoICd2YWx1ZScgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gdHlwZSBjb252ZXJzaW9uIGZvciBET00gc3BlY1xyXG4gICAgICBjb25zdCB2YWx1ZVN0cmluZyA9IGAke3RoaXMubm9kZS5pbnB1dFZhbHVlfWA7XHJcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlVG9FbGVtZW50KCAndmFsdWUnLCB2YWx1ZVN0cmluZywgeyBhc1Byb3BlcnR5OiB0cnVlIH0gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhbiBlbGVtZW50IG9uIHRoaXMgbm9kZSwgbG9va2VkIHVwIGJ5IHRoZSBlbGVtZW50TmFtZSBmbGFnIHBhc3NlZCBpbi5cclxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGVsZW1lbnROYW1lIC0gc2VlIFBET01VdGlscyBmb3IgdmFsaWQgYXNzb2NpYXRpb25zXHJcbiAgICogQHJldHVybnMge0hUTUxFbGVtZW50fVxyXG4gICAqL1xyXG4gIGdldEVsZW1lbnRCeU5hbWUoIGVsZW1lbnROYW1lICkge1xyXG4gICAgaWYgKCBlbGVtZW50TmFtZSA9PT0gUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fcHJpbWFyeVNpYmxpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggZWxlbWVudE5hbWUgPT09IFBET01QZWVyLkxBQkVMX1NJQkxJTkcgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9sYWJlbFNpYmxpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggZWxlbWVudE5hbWUgPT09IFBET01QZWVyLkRFU0NSSVBUSU9OX1NJQkxJTkcgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9kZXNjcmlwdGlvblNpYmxpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggZWxlbWVudE5hbWUgPT09IFBET01QZWVyLkNPTlRBSU5FUl9QQVJFTlQgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9jb250YWluZXJQYXJlbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgdGhyb3cgbmV3IEVycm9yKCBgaW52YWxpZCBlbGVtZW50TmFtZSBuYW1lOiAke2VsZW1lbnROYW1lfWAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgYSBhdHRyaWJ1dGUgb24gb25lIG9mIHRoZSBwZWVyJ3Mgd2luZG93LkVsZW1lbnRzLlxyXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGF0dHJpYnV0ZVxyXG4gICAqIEBwYXJhbSB7Kn0gYXR0cmlidXRlVmFsdWVcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgc2V0QXR0cmlidXRlVG9FbGVtZW50KCBhdHRyaWJ1dGUsIGF0dHJpYnV0ZVZhbHVlLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICAvLyB7c3RyaW5nfG51bGx9IC0gSWYgbm9uLW51bGwsIHdpbGwgc2V0IHRoZSBhdHRyaWJ1dGUgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWVzcGFjZS4gVGhpcyBjYW4gYmUgcmVxdWlyZWRcclxuICAgICAgLy8gZm9yIHNldHRpbmcgY2VydGFpbiBhdHRyaWJ1dGVzIChlLmcuIE1hdGhNTCkuXHJcbiAgICAgIG5hbWVzcGFjZTogbnVsbCxcclxuXHJcbiAgICAgIC8vIHNldCBhcyBhIGphdmFzY3JpcHQgcHJvcGVydHkgaW5zdGVhZCBvZiBhbiBhdHRyaWJ1dGUgb24gdGhlIERPTSBFbGVtZW50LlxyXG4gICAgICBhc1Byb3BlcnR5OiBmYWxzZSxcclxuXHJcbiAgICAgIGVsZW1lbnROYW1lOiBQUklNQVJZX1NJQkxJTkcsIC8vIHNlZSB0aGlzLmdldEVsZW1lbnROYW1lKCkgZm9yIHZhbGlkIHZhbHVlcywgZGVmYXVsdCB0byB0aGUgcHJpbWFyeSBzaWJsaW5nXHJcblxyXG4gICAgICAvLyB7SFRNTEVsZW1lbnR8bnVsbH0gLSBlbGVtZW50IHRoYXQgd2lsbCBkaXJlY3RseSByZWNlaXZlIHRoZSBpbnB1dCByYXRoZXIgdGhhbiBsb29raW5nIHVwIGJ5IG5hbWUsIGlmXHJcbiAgICAgIC8vIHByb3ZpZGVkLCBlbGVtZW50TmFtZSBvcHRpb24gd2lsbCBoYXZlIG5vIGVmZmVjdFxyXG4gICAgICBlbGVtZW50OiBudWxsXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgZWxlbWVudCA9IG9wdGlvbnMuZWxlbWVudCB8fCB0aGlzLmdldEVsZW1lbnRCeU5hbWUoIG9wdGlvbnMuZWxlbWVudE5hbWUgKTtcclxuXHJcbiAgICAvLyByZW1vdmUgZGlyZWN0aW9uYWwgZm9ybWF0dGluZyB0aGF0IG1heSBzdXJyb3VuZCBzdHJpbmdzIGlmIHRoZXkgYXJlIHRyYW5zbGF0YWJsZVxyXG4gICAgbGV0IGF0dHJpYnV0ZVZhbHVlV2l0aG91dE1hcmtzID0gYXR0cmlidXRlVmFsdWU7XHJcbiAgICBpZiAoIHR5cGVvZiBhdHRyaWJ1dGVWYWx1ZSA9PT0gJ3N0cmluZycgKSB7XHJcbiAgICAgIGF0dHJpYnV0ZVZhbHVlV2l0aG91dE1hcmtzID0gc3RyaXBFbWJlZGRpbmdNYXJrcyggYXR0cmlidXRlVmFsdWUgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGF0dHJpYnV0ZSA9PT0gRElTQUJMRURfQVRUUklCVVRFX05BTUUgJiYgIXRoaXMuZGlzcGxheS5pbnRlcmFjdGl2ZSApIHtcclxuXHJcbiAgICAgIC8vIFRoZSBwcmVzZW5jZSBvZiB0aGUgYGRpc2FibGVkYCBhdHRyaWJ1dGUgbWVhbnMgaXQgaXMgYWx3YXlzIGRpc2FibGVkLlxyXG4gICAgICB0aGlzLl9wcmVzZXJ2ZWREaXNhYmxlZFZhbHVlID0gb3B0aW9ucy5hc1Byb3BlcnR5ID8gYXR0cmlidXRlVmFsdWVXaXRob3V0TWFya3MgOiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggb3B0aW9ucy5uYW1lc3BhY2UgKSB7XHJcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlTlMoIG9wdGlvbnMubmFtZXNwYWNlLCBhdHRyaWJ1dGUsIGF0dHJpYnV0ZVZhbHVlV2l0aG91dE1hcmtzICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggb3B0aW9ucy5hc1Byb3BlcnR5ICkge1xyXG4gICAgICBlbGVtZW50WyBhdHRyaWJ1dGUgXSA9IGF0dHJpYnV0ZVZhbHVlV2l0aG91dE1hcmtzO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUsIGF0dHJpYnV0ZVZhbHVlV2l0aG91dE1hcmtzICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYXR0cmlidXRlIGZyb20gb25lIG9mIHRoZSBwZWVyJ3Mgd2luZG93LkVsZW1lbnRzLlxyXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGF0dHJpYnV0ZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICByZW1vdmVBdHRyaWJ1dGVGcm9tRWxlbWVudCggYXR0cmlidXRlLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICAvLyB7c3RyaW5nfG51bGx9IC0gSWYgbm9uLW51bGwsIHdpbGwgc2V0IHRoZSBhdHRyaWJ1dGUgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWVzcGFjZS4gVGhpcyBjYW4gYmUgcmVxdWlyZWRcclxuICAgICAgLy8gZm9yIHNldHRpbmcgY2VydGFpbiBhdHRyaWJ1dGVzIChlLmcuIE1hdGhNTCkuXHJcbiAgICAgIG5hbWVzcGFjZTogbnVsbCxcclxuXHJcbiAgICAgIGVsZW1lbnROYW1lOiBQUklNQVJZX1NJQkxJTkcsIC8vIHNlZSB0aGlzLmdldEVsZW1lbnROYW1lKCkgZm9yIHZhbGlkIHZhbHVlcywgZGVmYXVsdCB0byB0aGUgcHJpbWFyeSBzaWJsaW5nXHJcblxyXG4gICAgICAvLyB7SFRNTEVsZW1lbnR8bnVsbH0gLSBlbGVtZW50IHRoYXQgd2lsbCBkaXJlY3RseSByZWNlaXZlIHRoZSBpbnB1dCByYXRoZXIgdGhhbiBsb29raW5nIHVwIGJ5IG5hbWUsIGlmXHJcbiAgICAgIC8vIHByb3ZpZGVkLCBlbGVtZW50TmFtZSBvcHRpb24gd2lsbCBoYXZlIG5vIGVmZmVjdFxyXG4gICAgICBlbGVtZW50OiBudWxsXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgZWxlbWVudCA9IG9wdGlvbnMuZWxlbWVudCB8fCB0aGlzLmdldEVsZW1lbnRCeU5hbWUoIG9wdGlvbnMuZWxlbWVudE5hbWUgKTtcclxuXHJcbiAgICBpZiAoIG9wdGlvbnMubmFtZXNwYWNlICkge1xyXG4gICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZU5TKCBvcHRpb25zLm5hbWVzcGFjZSwgYXR0cmlidXRlICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggYXR0cmlidXRlID09PSBESVNBQkxFRF9BVFRSSUJVVEVfTkFNRSAmJiAhdGhpcy5kaXNwbGF5LmludGVyYWN0aXZlICkge1xyXG4gICAgICAvLyBtYWludGFpbiBvdXIgaW50ZXJhbCBkaXNhYmxlZCBzdGF0ZSBpbiBjYXNlIHRoZSBkaXNwbGF5IHRvZ2dsZXMgYmFjayB0byBiZSBpbnRlcmFjdGl2ZS5cclxuICAgICAgdGhpcy5fcHJlc2VydmVkRGlzYWJsZWRWYWx1ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCBhdHRyaWJ1dGUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSB0aGUgZ2l2ZW4gYXR0cmlidXRlIGZyb20gYWxsIHBlZXIgZWxlbWVudHNcclxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhdHRyaWJ1dGVcclxuICAgKi9cclxuICByZW1vdmVBdHRyaWJ1dGVGcm9tQWxsRWxlbWVudHMoIGF0dHJpYnV0ZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGF0dHJpYnV0ZSAhPT0gRElTQUJMRURfQVRUUklCVVRFX05BTUUsICd0aGlzIG1ldGhvZCBkb2VzIG5vdCBjdXJyZW50bHkgc3VwcG9ydCBkaXNhYmxlZCwgdG8gbWFrZSBEaXNwbGF5LmludGVyYWN0aXZlIHRvZ2dsaW5nIGVhc2llciB0byBpbXBsZW1lbnQnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgYXR0cmlidXRlID09PSAnc3RyaW5nJyApO1xyXG4gICAgdGhpcy5fcHJpbWFyeVNpYmxpbmcgJiYgdGhpcy5fcHJpbWFyeVNpYmxpbmcucmVtb3ZlQXR0cmlidXRlKCBhdHRyaWJ1dGUgKTtcclxuICAgIHRoaXMuX2xhYmVsU2libGluZyAmJiB0aGlzLl9sYWJlbFNpYmxpbmcucmVtb3ZlQXR0cmlidXRlKCBhdHRyaWJ1dGUgKTtcclxuICAgIHRoaXMuX2Rlc2NyaXB0aW9uU2libGluZyAmJiB0aGlzLl9kZXNjcmlwdGlvblNpYmxpbmcucmVtb3ZlQXR0cmlidXRlKCBhdHRyaWJ1dGUgKTtcclxuICAgIHRoaXMuX2NvbnRhaW5lclBhcmVudCAmJiB0aGlzLl9jb250YWluZXJQYXJlbnQucmVtb3ZlQXR0cmlidXRlKCBhdHRyaWJ1dGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCB0aGUgcHJvdmlkZWQgY2xhc3NOYW1lIHRvIHRoZSBlbGVtZW50J3MgY2xhc3NMaXN0LlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWVcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgc2V0Q2xhc3NUb0VsZW1lbnQoIGNsYXNzTmFtZSwgb3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBjbGFzc05hbWUgPT09ICdzdHJpbmcnICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBOYW1lIG9mIHRoZSBlbGVtZW50IHdobyB3ZSBhcmUgYWRkaW5nIHRoZSBjbGFzcyB0bywgc2VlIHRoaXMuZ2V0RWxlbWVudE5hbWUoKSBmb3IgdmFsaWQgdmFsdWVzXHJcbiAgICAgIGVsZW1lbnROYW1lOiBQUklNQVJZX1NJQkxJTkdcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmdldEVsZW1lbnRCeU5hbWUoIG9wdGlvbnMuZWxlbWVudE5hbWUgKS5jbGFzc0xpc3QuYWRkKCBjbGFzc05hbWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSB0aGUgc3BlY2lmaWVkIGNsYXNzTmFtZSBmcm9tIHRoZSBlbGVtZW50LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWVcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgcmVtb3ZlQ2xhc3NGcm9tRWxlbWVudCggY2xhc3NOYW1lLCBvcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNsYXNzTmFtZSA9PT0gJ3N0cmluZycgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIE5hbWUgb2YgdGhlIGVsZW1lbnQgd2hvIHdlIGFyZSByZW1vdmluZyB0aGUgY2xhc3MgZnJvbSwgc2VlIHRoaXMuZ2V0RWxlbWVudE5hbWUoKSBmb3IgdmFsaWQgdmFsdWVzXHJcbiAgICAgIGVsZW1lbnROYW1lOiBQUklNQVJZX1NJQkxJTkdcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmdldEVsZW1lbnRCeU5hbWUoIG9wdGlvbnMuZWxlbWVudE5hbWUgKS5jbGFzc0xpc3QucmVtb3ZlKCBjbGFzc05hbWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBlaXRoZXIgYXNzb2NpYXRpb24gYXR0cmlidXRlIChhcmlhLWxhYmVsbGVkYnkvZGVzY3JpYmVkYnkpIG9uIG9uZSBvZiB0aGlzIHBlZXIncyBFbGVtZW50c1xyXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGF0dHJpYnV0ZSAtIGVpdGhlciBhcmlhLWxhYmVsbGVkYnkgb3IgYXJpYS1kZXNjcmliZWRieVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhc3NvY2lhdGlvbk9iamVjdCAtIHNlZSBhZGRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uKCkgZm9yIHNjaGVtYVxyXG4gICAqL1xyXG4gIHNldEFzc29jaWF0aW9uQXR0cmlidXRlKCBhdHRyaWJ1dGUsIGFzc29jaWF0aW9uT2JqZWN0ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggUERPTVV0aWxzLkFTU09DSUFUSU9OX0FUVFJJQlVURVMuaW5kZXhPZiggYXR0cmlidXRlICkgPj0gMCxcclxuICAgICAgYHVuc3VwcG9ydGVkIGF0dHJpYnV0ZSBmb3Igc2V0dGluZyB3aXRoIGFzc29jaWF0aW9uIG9iamVjdDogJHthdHRyaWJ1dGV9YCApO1xyXG5cclxuICAgIGNvbnN0IG90aGVyTm9kZVBET01JbnN0YW5jZXMgPSBhc3NvY2lhdGlvbk9iamVjdC5vdGhlck5vZGUuZ2V0UERPTUluc3RhbmNlcygpO1xyXG5cclxuICAgIC8vIElmIHRoZSBvdGhlciBub2RlIGhhc24ndCBiZWVuIGFkZGVkIHRvIHRoZSBzY2VuZSBncmFwaCB5ZXQsIGl0IHdvbid0IGhhdmUgYW55IGFjY2Vzc2libGUgaW5zdGFuY2VzLCBzbyBubyBvcC5cclxuICAgIC8vIFRoaXMgd2lsbCBiZSByZWNhbGN1bGF0ZWQgd2hlbiB0aGF0IG5vZGUgaXMgYWRkZWQgdG8gdGhlIHNjZW5lIGdyYXBoXHJcbiAgICBpZiAoIG90aGVyTm9kZVBET01JbnN0YW5jZXMubGVuZ3RoID4gMCApIHtcclxuXHJcbiAgICAgIC8vIFdlIGFyZSBqdXN0IHVzaW5nIHRoZSBmaXJzdCBQRE9NSW5zdGFuY2UgZm9yIHNpbXBsaWNpdHksIGJ1dCBpdCBpcyBPSyBiZWNhdXNlIHRoZSBhY2Nlc3NpYmxlXHJcbiAgICAgIC8vIGNvbnRlbnQgZm9yIGFsbCBQRE9NSW5zdGFuY2VzIHdpbGwgYmUgdGhlIHNhbWUsIHNvIHRoZSBBY2Nlc3NpYmxlIE5hbWVzIChpbiB0aGUgYnJvd3NlcidzXHJcbiAgICAgIC8vIGFjY2Vzc2liaWxpdHkgdHJlZSkgb2YgZWxlbWVudHMgdGhhdCBhcmUgcmVmZXJlbmNlZCBieSB0aGUgYXR0cmlidXRlIHZhbHVlIGlkIHdpbGwgYWxsIGhhdmUgdGhlIHNhbWUgY29udGVudFxyXG4gICAgICBjb25zdCBmaXJzdFBET01JbnN0YW5jZSA9IG90aGVyTm9kZVBET01JbnN0YW5jZXNbIDAgXTtcclxuXHJcbiAgICAgIC8vIEhhbmRsZSBhIGNhc2Ugd2hlcmUgeW91IGFyZSBhc3NvY2lhdGluZyB0byB5b3Vyc2VsZiwgYW5kIHRoZSBwZWVyIGhhcyBub3QgYmVlbiBjb25zdHJ1Y3RlZCB5ZXQuXHJcbiAgICAgIGlmICggZmlyc3RQRE9NSW5zdGFuY2UgPT09IHRoaXMucGRvbUluc3RhbmNlICkge1xyXG4gICAgICAgIGZpcnN0UERPTUluc3RhbmNlLnBlZXIgPSB0aGlzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmaXJzdFBET01JbnN0YW5jZS5wZWVyLCAncGVlciBzaG91bGQgZXhpc3QnICk7XHJcblxyXG4gICAgICAvLyB3ZSBjYW4gdXNlIHRoZSBzYW1lIGVsZW1lbnQncyBpZCB0byB1cGRhdGUgYWxsIG9mIHRoaXMgTm9kZSdzIHBlZXJzXHJcbiAgICAgIGNvbnN0IG90aGVyUGVlckVsZW1lbnQgPSBmaXJzdFBET01JbnN0YW5jZS5wZWVyLmdldEVsZW1lbnRCeU5hbWUoIGFzc29jaWF0aW9uT2JqZWN0Lm90aGVyRWxlbWVudE5hbWUgKTtcclxuXHJcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmdldEVsZW1lbnRCeU5hbWUoIGFzc29jaWF0aW9uT2JqZWN0LnRoaXNFbGVtZW50TmFtZSApO1xyXG5cclxuICAgICAgLy8gdG8gc3VwcG9ydCBhbnkgb3B0aW9uIG9yZGVyLCBuby1vcCBpZiB0aGUgcGVlciBlbGVtZW50IGhhcyBub3QgYmVlbiBjcmVhdGVkIHlldC5cclxuICAgICAgaWYgKCBlbGVtZW50ICYmIG90aGVyUGVlckVsZW1lbnQgKSB7XHJcblxyXG4gICAgICAgIC8vIG9ubHkgdXBkYXRlIGFzc29jaWF0aW9ucyBpZiB0aGUgcmVxdWVzdGVkIHBlZXIgZWxlbWVudCBoYXMgYmVlbiBjcmVhdGVkXHJcbiAgICAgICAgLy8gTk9URTogaW4gdGhlIGZ1dHVyZSwgd2Ugd291bGQgbGlrZSB0byB2ZXJpZnkgdGhhdCB0aGUgYXNzb2NpYXRpb24gZXhpc3RzIGJ1dCBjYW4ndCBkbyB0aGF0IHlldCBiZWNhdXNlXHJcbiAgICAgICAgLy8gd2UgaGF2ZSB0byBzdXBwb3J0IGNhc2VzIHdoZXJlIHdlIHNldCBsYWJlbCBhc3NvY2lhdGlvbiBwcmlvciB0byBzZXR0aW5nIHRoZSBzaWJsaW5nL3BhcmVudCB0YWdOYW1lXHJcbiAgICAgICAgY29uc3QgcHJldmlvdXNBdHRyaWJ1dGVWYWx1ZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUgKSB8fCAnJztcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgcHJldmlvdXNBdHRyaWJ1dGVWYWx1ZSA9PT0gJ3N0cmluZycgKTtcclxuXHJcbiAgICAgICAgY29uc3QgbmV3QXR0cmlidXRlVmFsdWUgPSBbIHByZXZpb3VzQXR0cmlidXRlVmFsdWUudHJpbSgpLCBvdGhlclBlZXJFbGVtZW50LmlkIF0uam9pbiggJyAnICkudHJpbSgpO1xyXG5cclxuICAgICAgICAvLyBhZGQgdGhlIGlkIGZyb20gdGhlIG5ldyBhc3NvY2lhdGlvbiB0byB0aGUgdmFsdWUgb2YgdGhlIEhUTUxFbGVtZW50J3MgYXR0cmlidXRlLlxyXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlVG9FbGVtZW50KCBhdHRyaWJ1dGUsIG5ld0F0dHJpYnV0ZVZhbHVlLCB7XHJcbiAgICAgICAgICBlbGVtZW50TmFtZTogYXNzb2NpYXRpb25PYmplY3QudGhpc0VsZW1lbnROYW1lXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgY29udGVudEVsZW1lbnQgd2lsbCBlaXRoZXIgYmUgYSBsYWJlbCBvciBkZXNjcmlwdGlvbiBlbGVtZW50LiBUaGUgY29udGVudEVsZW1lbnQgd2lsbCBiZSBzb3J0ZWQgcmVsYXRpdmUgdG9cclxuICAgKiB0aGUgcHJpbWFyeVNpYmxpbmcuIEl0cyBwbGFjZW1lbnQgd2lsbCBhbHNvIGRlcGVuZCBvbiB3aGV0aGVyIG9yIG5vdCB0aGlzIG5vZGUgd2FudHMgdG8gYXBwZW5kIHRoaXMgZWxlbWVudCxcclxuICAgKiBzZWUgc2V0QXBwZW5kTGFiZWwoKSBhbmQgc2V0QXBwZW5kRGVzY3JpcHRpb24oKS4gQnkgZGVmYXVsdCwgdGhlIFwiY29udGVudFwiIGVsZW1lbnQgd2lsbCBiZSBwbGFjZWQgYmVmb3JlIHRoZVxyXG4gICAqIHByaW1hcnlTaWJsaW5nLlxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyBmdW5jdGlvbiBhc3N1bWVzIGl0IGlzIGNhbGxlZCBvbiBsYWJlbCBzaWJsaW5nIGJlZm9yZSBkZXNjcmlwdGlvbiBzaWJsaW5nIGZvciBpbnNlcnRpbmcgZWxlbWVudHNcclxuICAgKiBpbnRvIHRoZSBjb3JyZWN0IG9yZGVyLlxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNvbnRlbnRFbGVtZW50XHJcbiAgICogQHBhcmFtIHtib29sZWFufSBhcHBlbmRFbGVtZW50XHJcbiAgICovXHJcbiAgYXJyYW5nZUNvbnRlbnRFbGVtZW50KCBjb250ZW50RWxlbWVudCwgYXBwZW5kRWxlbWVudCApIHtcclxuXHJcbiAgICAvLyBpZiB0aGVyZSBpcyBhIGNvbnRhaW5lclBhcmVudFxyXG4gICAgaWYgKCB0aGlzLnRvcExldmVsRWxlbWVudHNbIDAgXSA9PT0gdGhpcy5fY29udGFpbmVyUGFyZW50ICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnRvcExldmVsRWxlbWVudHMubGVuZ3RoID09PSAxICk7XHJcblxyXG4gICAgICBpZiAoIGFwcGVuZEVsZW1lbnQgKSB7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyUGFyZW50LmFwcGVuZENoaWxkKCBjb250ZW50RWxlbWVudCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lclBhcmVudC5pbnNlcnRCZWZvcmUoIGNvbnRlbnRFbGVtZW50LCB0aGlzLl9wcmltYXJ5U2libGluZyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgdGhlcmUgYXJlIG11bHRpcGxlIHRvcCBsZXZlbCBub2Rlc1xyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBrZWVwIHRoaXMudG9wTGV2ZWxFbGVtZW50cyBpbiBzeW5jXHJcbiAgICAgIGFycmF5UmVtb3ZlKCB0aGlzLnRvcExldmVsRWxlbWVudHMsIGNvbnRlbnRFbGVtZW50ICk7XHJcbiAgICAgIGNvbnN0IGluZGV4T2ZQcmltYXJ5U2libGluZyA9IHRoaXMudG9wTGV2ZWxFbGVtZW50cy5pbmRleE9mKCB0aGlzLl9wcmltYXJ5U2libGluZyApO1xyXG5cclxuICAgICAgLy8gaWYgYXBwZW5kaW5nLCBqdXN0IGluc2VydCBhdCBhdCBlbmQgb2YgdGhlIHRvcCBsZXZlbCBlbGVtZW50c1xyXG4gICAgICBjb25zdCBpbnNlcnRJbmRleCA9IGFwcGVuZEVsZW1lbnQgPyB0aGlzLnRvcExldmVsRWxlbWVudHMubGVuZ3RoIDogaW5kZXhPZlByaW1hcnlTaWJsaW5nO1xyXG4gICAgICB0aGlzLnRvcExldmVsRWxlbWVudHMuc3BsaWNlKCBpbnNlcnRJbmRleCwgMCwgY29udGVudEVsZW1lbnQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElzIHRoaXMgcGVlciBoaWRkZW4gaW4gdGhlIFBET01cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc1Zpc2libGUoKSB7XHJcbiAgICBpZiAoIGFzc2VydCApIHtcclxuXHJcbiAgICAgIGxldCB2aXNpYmxlRWxlbWVudHMgPSAwO1xyXG4gICAgICB0aGlzLnRvcExldmVsRWxlbWVudHMuZm9yRWFjaCggZWxlbWVudCA9PiB7XHJcblxyXG4gICAgICAgIC8vIHN1cHBvcnQgcHJvcGVydHkgb3IgYXR0cmlidXRlXHJcbiAgICAgICAgaWYgKCAhZWxlbWVudC5oaWRkZW4gJiYgIWVsZW1lbnQuaGFzQXR0cmlidXRlKCAnaGlkZGVuJyApICkge1xyXG4gICAgICAgICAgdmlzaWJsZUVsZW1lbnRzICs9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICAgIGFzc2VydCggdGhpcy52aXNpYmxlID8gdmlzaWJsZUVsZW1lbnRzID09PSB0aGlzLnRvcExldmVsRWxlbWVudHMubGVuZ3RoIDogdmlzaWJsZUVsZW1lbnRzID09PSAwLFxyXG4gICAgICAgICdzb21lIG9mIHRoZSBwZWVyXFwncyBlbGVtZW50cyBhcmUgdmlzaWJsZSBhbmQgc29tZSBhcmUgbm90JyApO1xyXG5cclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLnZpc2libGUgPT09IG51bGwgPyB0cnVlIDogdGhpcy52aXNpYmxlOyAvLyBkZWZhdWx0IHRvIHRydWUgaWYgdmlzaWJpbGl0eSBoYXNuJ3QgYmVlbiBzZXQgeWV0LlxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHdoZXRoZXIgb3Igbm90IHRoZSBwZWVyIGlzIHZpc2libGUgaW4gdGhlIFBET01cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZpc2libGVcclxuICAgKi9cclxuICBzZXRWaXNpYmxlKCB2aXNpYmxlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHZpc2libGUgPT09ICdib29sZWFuJyApO1xyXG4gICAgaWYgKCB0aGlzLnZpc2libGUgIT09IHZpc2libGUgKSB7XHJcblxyXG4gICAgICB0aGlzLnZpc2libGUgPSB2aXNpYmxlO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnRvcExldmVsRWxlbWVudHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMudG9wTGV2ZWxFbGVtZW50c1sgaSBdO1xyXG4gICAgICAgIGlmICggdmlzaWJsZSApIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlRnJvbUVsZW1lbnQoICdoaWRkZW4nLCB7IGVsZW1lbnQ6IGVsZW1lbnQgfSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlVG9FbGVtZW50KCAnaGlkZGVuJywgJycsIHsgZWxlbWVudDogZWxlbWVudCB9ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBpbnZhbGlkYXRlIENTUyB0cmFuc2Zvcm1zIGJlY2F1c2Ugd2hlbiAnaGlkZGVuJyB0aGUgY29udGVudCB3aWxsIGhhdmUgbm8gZGltZW5zaW9ucyBpbiB0aGUgdmlld3BvcnRcclxuICAgICAgdGhpcy5pbnZhbGlkYXRlQ1NTUG9zaXRpb25pbmcoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgaWYgdGhpcyBwZWVyIGlzIGZvY3VzZWQuIEEgcGVlciBpcyBmb2N1c2VkIGlmIGl0cyBwcmltYXJ5U2libGluZyBpcyBmb2N1c2VkLlxyXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNGb2N1c2VkKCkge1xyXG4gICAgY29uc3QgdmlzdWFsRm9jdXNUcmFpbCA9IFBET01JbnN0YW5jZS5ndWVzc1Zpc3VhbFRyYWlsKCB0aGlzLnRyYWlsLCB0aGlzLmRpc3BsYXkucm9vdE5vZGUgKTtcclxuXHJcbiAgICByZXR1cm4gRm9jdXNNYW5hZ2VyLnBkb21Gb2N1c1Byb3BlcnR5LnZhbHVlICYmIEZvY3VzTWFuYWdlci5wZG9tRm9jdXNQcm9wZXJ0eS52YWx1ZS50cmFpbC5lcXVhbHMoIHZpc3VhbEZvY3VzVHJhaWwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZvY3VzIHRoZSBwcmltYXJ5IHNpYmxpbmcgb2YgdGhlIHBlZXIuXHJcbiAgICogQHB1YmxpYyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBmb2N1cygpIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3ByaW1hcnlTaWJsaW5nLCAnbXVzdCBoYXZlIGEgcHJpbWFyeSBzaWJsaW5nIHRvIGZvY3VzJyApO1xyXG4gICAgdGhpcy5fcHJpbWFyeVNpYmxpbmcuZm9jdXMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEJsdXIgdGhlIHByaW1hcnkgc2libGluZyBvZiB0aGUgcGVlci5cclxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIGJsdXIoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9wcmltYXJ5U2libGluZywgJ211c3QgaGF2ZSBhIHByaW1hcnkgc2libGluZyB0byBibHVyJyApO1xyXG5cclxuICAgIC8vIG5vIG9wIGJ5IHRoZSBicm93c2VyIGlmIHByaW1hcnkgc2libGluZyBkb2VzIG5vdCBoYXZlIGZvY3VzXHJcbiAgICB0aGlzLl9wcmltYXJ5U2libGluZy5ibHVyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYWtlIHRoZSBwZWVyIGZvY3VzYWJsZS4gT25seSB0aGUgcHJpbWFyeSBzaWJsaW5nIGlzIGV2ZXIgY29uc2lkZXJlZCBmb2N1c2FibGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9jdXNhYmxlXHJcbiAgICovXHJcbiAgc2V0Rm9jdXNhYmxlKCBmb2N1c2FibGUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgZm9jdXNhYmxlID09PSAnYm9vbGVhbicgKTtcclxuXHJcbiAgICBjb25zdCBwZWVySGFkRm9jdXMgPSB0aGlzLmlzRm9jdXNlZCgpO1xyXG4gICAgaWYgKCB0aGlzLmZvY3VzYWJsZSAhPT0gZm9jdXNhYmxlICkge1xyXG4gICAgICB0aGlzLmZvY3VzYWJsZSA9IGZvY3VzYWJsZTtcclxuICAgICAgUERPTVV0aWxzLm92ZXJyaWRlRm9jdXNXaXRoVGFiSW5kZXgoIHRoaXMucHJpbWFyeVNpYmxpbmcsIGZvY3VzYWJsZSApO1xyXG5cclxuICAgICAgLy8gaW4gQ2hyb21lLCBpZiB0YWJpbmRleCBpcyByZW1vdmVkIGFuZCB0aGUgZWxlbWVudCBpcyBub3QgZm9jdXNhYmxlIGJ5IGRlZmF1bHQgdGhlIGVsZW1lbnQgaXMgYmx1cnJlZC5cclxuICAgICAgLy8gVGhpcyBiZWhhdmlvciBpcyByZWFzb25hYmxlIGFuZCB3ZSB3YW50IHRvIGVuZm9yY2UgaXQgaW4gb3RoZXIgYnJvd3NlcnMgZm9yIGNvbnNpc3RlbmN5LiBTZWVcclxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzk2N1xyXG4gICAgICBpZiAoIHBlZXJIYWRGb2N1cyAmJiAhZm9jdXNhYmxlICkge1xyXG4gICAgICAgIHRoaXMuYmx1cigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZXBvc2l0aW9uIHRoZSBzaWJsaW5nIGluIHRoZSBET00sIHNpbmNlIG5vbi1mb2N1c2FibGUgbm9kZXMgYXJlIG5vdCBwb3NpdGlvbmVkXHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUNTU1Bvc2l0aW9uaW5nKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNwb25zaWJsZSBmb3Igc2V0dGluZyB0aGUgY29udGVudCBmb3IgdGhlIGxhYmVsIHNpYmxpbmdcclxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfG51bGx9IGNvbnRlbnQgLSB0aGUgY29udGVudCBmb3IgdGhlIGxhYmVsIHNpYmxpbmcuXHJcbiAgICovXHJcbiAgc2V0TGFiZWxTaWJsaW5nQ29udGVudCggY29udGVudCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbnRlbnQgPT09IG51bGwgfHwgdHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnLCAnaW5jb3JyZWN0IGxhYmVsIGNvbnRlbnQgdHlwZScgKTtcclxuXHJcbiAgICAvLyBuby1vcCB0byBzdXBwb3J0IGFueSBvcHRpb24gb3JkZXJcclxuICAgIGlmICggIXRoaXMuX2xhYmVsU2libGluZyApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIFBET01VdGlscy5zZXRUZXh0Q29udGVudCggdGhpcy5fbGFiZWxTaWJsaW5nLCBjb250ZW50ICk7XHJcblxyXG4gICAgLy8gaWYgdGhlIGxhYmVsIGVsZW1lbnQgaGFwcGVucyB0byBiZSBhICdsYWJlbCcsIGFzc29jaWF0ZSB3aXRoICdmb3InIGF0dHJpYnV0ZVxyXG4gICAgaWYgKCB0aGlzLl9sYWJlbFNpYmxpbmcudGFnTmFtZS50b1VwcGVyQ2FzZSgpID09PSBMQUJFTF9UQUcgKSB7XHJcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlVG9FbGVtZW50KCAnZm9yJywgdGhpcy5fcHJpbWFyeVNpYmxpbmcuaWQsIHtcclxuICAgICAgICBlbGVtZW50TmFtZTogUERPTVBlZXIuTEFCRUxfU0lCTElOR1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNwb25zaWJsZSBmb3Igc2V0dGluZyB0aGUgY29udGVudCBmb3IgdGhlIGRlc2NyaXB0aW9uIHNpYmxpbmdcclxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfG51bGx9IGNvbnRlbnQgLSB0aGUgY29udGVudCBmb3IgdGhlIGRlc2NyaXB0aW9uIHNpYmxpbmcuXHJcbiAgICovXHJcbiAgc2V0RGVzY3JpcHRpb25TaWJsaW5nQ29udGVudCggY29udGVudCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbnRlbnQgPT09IG51bGwgfHwgdHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnLCAnaW5jb3JyZWN0IGRlc2NyaXB0aW9uIGNvbnRlbnQgdHlwZScgKTtcclxuXHJcbiAgICAvLyBuby1vcCB0byBzdXBwb3J0IGFueSBvcHRpb24gb3JkZXJcclxuICAgIGlmICggIXRoaXMuX2Rlc2NyaXB0aW9uU2libGluZyApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgUERPTVV0aWxzLnNldFRleHRDb250ZW50KCB0aGlzLl9kZXNjcmlwdGlvblNpYmxpbmcsIGNvbnRlbnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3BvbnNpYmxlIGZvciBzZXR0aW5nIHRoZSBjb250ZW50IGZvciB0aGUgcHJpbWFyeSBzaWJsaW5nXHJcbiAgICogQHB1YmxpYyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKiBAcGFyYW0ge3N0cmluZ3xudWxsfSBjb250ZW50IC0gdGhlIGNvbnRlbnQgZm9yIHRoZSBwcmltYXJ5IHNpYmxpbmcuXHJcbiAgICovXHJcbiAgc2V0UHJpbWFyeVNpYmxpbmdDb250ZW50KCBjb250ZW50ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29udGVudCA9PT0gbnVsbCB8fCB0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycsICdpbmNvcnJlY3QgaW5uZXIgY29udGVudCB0eXBlJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wZG9tSW5zdGFuY2UuY2hpbGRyZW4ubGVuZ3RoID09PSAwLCAnZGVzY2VuZGFudHMgZXhpc3Qgd2l0aCBhY2Nlc3NpYmxlIGNvbnRlbnQsIGlubmVyQ29udGVudCBjYW5ub3QgYmUgdXNlZCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIFBET01VdGlscy50YWdOYW1lU3VwcG9ydHNDb250ZW50KCB0aGlzLl9wcmltYXJ5U2libGluZy50YWdOYW1lICksXHJcbiAgICAgIGB0YWdOYW1lOiAke3RoaXMubm9kZS50YWdOYW1lfSBkb2VzIG5vdCBzdXBwb3J0IGlubmVyIGNvbnRlbnRgICk7XHJcblxyXG4gICAgLy8gbm8tb3AgdG8gc3VwcG9ydCBhbnkgb3B0aW9uIG9yZGVyXHJcbiAgICBpZiAoICF0aGlzLl9wcmltYXJ5U2libGluZyApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgUERPTVV0aWxzLnNldFRleHRDb250ZW50KCB0aGlzLl9wcmltYXJ5U2libGluZywgY29udGVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgcGRvbVRyYW5zZm9ybVNvdXJjZU5vZGUgc28gdGhhdCB0aGUgcHJpbWFyeSBzaWJsaW5nIHdpbGwgYmUgdHJhbnNmb3JtZWQgd2l0aCBjaGFuZ2VzIHRvIGFsb25nIHRoZVxyXG4gICAqIHVuaXF1ZSB0cmFpbCB0byB0aGUgc291cmNlIG5vZGUuIElmIG51bGwsIHJlcG9zaXRpb25pbmcgaGFwcGVucyB3aXRoIHRyYW5zZm9ybSBjaGFuZ2VzIGFsb25nIHRoaXNcclxuICAgKiBwZG9tSW5zdGFuY2UncyB0cmFpbC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0gey4uL25vZGVzL05vZGV8bnVsbH0gbm9kZVxyXG4gICAqL1xyXG4gIHNldFBET01UcmFuc2Zvcm1Tb3VyY2VOb2RlKCBub2RlICkge1xyXG5cclxuICAgIC8vIHJlbW92ZSBwcmV2aW91cyBsaXN0ZW5lcnMgYmVmb3JlIGNyZWF0aW5nIGEgbmV3IFRyYW5zZm9ybVRyYWNrZXJcclxuICAgIHRoaXMucGRvbUluc3RhbmNlLnRyYW5zZm9ybVRyYWNrZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMudHJhbnNmb3JtTGlzdGVuZXIgKTtcclxuICAgIHRoaXMucGRvbUluc3RhbmNlLnVwZGF0ZVRyYW5zZm9ybVRyYWNrZXIoIG5vZGUgKTtcclxuXHJcbiAgICAvLyBhZGQgbGlzdGVuZXJzIGJhY2sgYWZ0ZXIgdXBkYXRlXHJcbiAgICB0aGlzLnBkb21JbnN0YW5jZS50cmFuc2Zvcm1UcmFja2VyLmFkZExpc3RlbmVyKCB0aGlzLnRyYW5zZm9ybUxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gbmV3IHRyYWlsIHdpdGggdHJhbnNmb3JtcyBzbyBwb3NpdGlvbmluZyBpcyBwcm9iYWJseSBkaXJ0eVxyXG4gICAgdGhpcy5pbnZhbGlkYXRlQ1NTUG9zaXRpb25pbmcoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEVuYWJsZSBvciBkaXNhYmxlIHBvc2l0aW9uaW5nIG9mIHRoZSBzaWJsaW5nIGVsZW1lbnRzLiBHZW5lcmFsbHkgdGhpcyBpcyByZXF1aXJlZGZvciBhY2Nlc3NpYmlsaXR5IHRvIHdvcmsgb25cclxuICAgKiB0b3VjaCBzY3JlZW4gYmFzZWQgc2NyZWVuIHJlYWRlcnMgbGlrZSBwaG9uZXMuIEJ1dCByZXBvc2l0aW9uaW5nIERPTSBlbGVtZW50cyBpcyBleHBlbnNpdmUuIFRoaXMgY2FuIGJlIHNldCB0b1xyXG4gICAqIGZhbHNlIHRvIG9wdGltaXplIHdoZW4gcG9zaXRpb25pbmcgaXMgbm90IG5lY2Vzc2FyeS5cclxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBwb3NpdGlvbkluUERPTVxyXG4gICAqL1xyXG4gIHNldFBvc2l0aW9uSW5QRE9NKCBwb3NpdGlvbkluUERPTSApIHtcclxuICAgIHRoaXMucG9zaXRpb25JblBET00gPSBwb3NpdGlvbkluUERPTTtcclxuXHJcbiAgICAvLyBzaWduaWZ5IHRoYXQgaXQgbmVlZHMgdG8gYmUgcmVwb3NpdGlvbmVkIG5leHQgZnJhbWUsIGVpdGhlciBvZmYgc2NyZWVuIG9yIHRvIG1hdGNoXHJcbiAgICAvLyBncmFwaGljYWwgcmVuZGVyaW5nXHJcbiAgICB0aGlzLmludmFsaWRhdGVDU1NQb3NpdGlvbmluZygpO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICBnZXRFbGVtZW50SWQoIHNpYmxpbmdOYW1lLCBzdHJpbmdJZCApIHtcclxuICAgIHJldHVybiBgZGlzcGxheSR7dGhpcy5kaXNwbGF5LmlkfS0ke3NpYmxpbmdOYW1lfS0ke3N0cmluZ0lkfWA7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgdXBkYXRlSW5kaWNlc1N0cmluZ0FuZEVsZW1lbnRJZHMoKSB7XHJcbiAgICBjb25zdCBpbmRpY2VzID0gdGhpcy5wZG9tSW5zdGFuY2UuZ2V0UERPTUluc3RhbmNlVW5pcXVlSWQoKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX3ByaW1hcnlTaWJsaW5nICkge1xyXG5cclxuICAgICAgLy8gTk9URTogZGF0YXNldCBpc24ndCBzdXBwb3J0ZWQgYnkgYWxsIG5hbWVzcGFjZXMgKGxpa2UgTWF0aE1MKSBzbyB3ZSBuZWVkIHRvIHVzZSBzZXRBdHRyaWJ1dGVcclxuICAgICAgdGhpcy5fcHJpbWFyeVNpYmxpbmcuc2V0QXR0cmlidXRlKCBQRE9NVXRpbHMuREFUQV9QRE9NX1VOSVFVRV9JRCwgaW5kaWNlcyApO1xyXG4gICAgICB0aGlzLl9wcmltYXJ5U2libGluZy5pZCA9IHRoaXMuZ2V0RWxlbWVudElkKCAncHJpbWFyeScsIGluZGljZXMgKTtcclxuICAgIH1cclxuICAgIGlmICggdGhpcy5fbGFiZWxTaWJsaW5nICkge1xyXG5cclxuICAgICAgLy8gTk9URTogZGF0YXNldCBpc24ndCBzdXBwb3J0ZWQgYnkgYWxsIG5hbWVzcGFjZXMgKGxpa2UgTWF0aE1MKSBzbyB3ZSBuZWVkIHRvIHVzZSBzZXRBdHRyaWJ1dGVcclxuICAgICAgdGhpcy5fbGFiZWxTaWJsaW5nLnNldEF0dHJpYnV0ZSggUERPTVV0aWxzLkRBVEFfUERPTV9VTklRVUVfSUQsIGluZGljZXMgKTtcclxuICAgICAgdGhpcy5fbGFiZWxTaWJsaW5nLmlkID0gdGhpcy5nZXRFbGVtZW50SWQoICdsYWJlbCcsIGluZGljZXMgKTtcclxuICAgIH1cclxuICAgIGlmICggdGhpcy5fZGVzY3JpcHRpb25TaWJsaW5nICkge1xyXG5cclxuICAgICAgLy8gTk9URTogZGF0YXNldCBpc24ndCBzdXBwb3J0ZWQgYnkgYWxsIG5hbWVzcGFjZXMgKGxpa2UgTWF0aE1MKSBzbyB3ZSBuZWVkIHRvIHVzZSBzZXRBdHRyaWJ1dGVcclxuICAgICAgdGhpcy5fZGVzY3JpcHRpb25TaWJsaW5nLnNldEF0dHJpYnV0ZSggUERPTVV0aWxzLkRBVEFfUERPTV9VTklRVUVfSUQsIGluZGljZXMgKTtcclxuICAgICAgdGhpcy5fZGVzY3JpcHRpb25TaWJsaW5nLmlkID0gdGhpcy5nZXRFbGVtZW50SWQoICdkZXNjcmlwdGlvbicsIGluZGljZXMgKTtcclxuICAgIH1cclxuICAgIGlmICggdGhpcy5fY29udGFpbmVyUGFyZW50ICkge1xyXG5cclxuICAgICAgLy8gTk9URTogZGF0YXNldCBpc24ndCBzdXBwb3J0ZWQgYnkgYWxsIG5hbWVzcGFjZXMgKGxpa2UgTWF0aE1MKSBzbyB3ZSBuZWVkIHRvIHVzZSBzZXRBdHRyaWJ1dGVcclxuICAgICAgdGhpcy5fY29udGFpbmVyUGFyZW50LnNldEF0dHJpYnV0ZSggUERPTVV0aWxzLkRBVEFfUERPTV9VTklRVUVfSUQsIGluZGljZXMgKTtcclxuICAgICAgdGhpcy5fY29udGFpbmVyUGFyZW50LmlkID0gdGhpcy5nZXRFbGVtZW50SWQoICdjb250YWluZXInLCBpbmRpY2VzICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXJrIHRoYXQgdGhlIHNpYmxpbmdzIG9mIHRoaXMgUERPTVBlZXIgbmVlZCB0byBiZSB1cGRhdGVkIGluIHRoZSBuZXh0IERpc3BsYXkgdXBkYXRlLiBQb3NzaWJseSBmcm9tIGFcclxuICAgKiBjaGFuZ2Ugb2YgYWNjZXNzaWJsZSBjb250ZW50IG9yIG5vZGUgdHJhbnNmb3JtYXRpb24uIERvZXMgbm90aGluZyBpZiBhbHJlYWR5IG1hcmtlZCBkaXJ0eS5cclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaW52YWxpZGF0ZUNTU1Bvc2l0aW9uaW5nKCkge1xyXG4gICAgaWYgKCAhdGhpcy5wb3NpdGlvbkRpcnR5ICkge1xyXG4gICAgICB0aGlzLnBvc2l0aW9uRGlydHkgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gbWFyayBhbGwgYW5jZXN0b3JzIG9mIHRoaXMgcGVlciBzbyB0aGF0IHdlIGNhbiBxdWlja2x5IGZpbmQgdGhpcyBkaXJ0eSBwZWVyIHdoZW4gd2UgdHJhdmVyc2VcclxuICAgICAgLy8gdGhlIFBET01JbnN0YW5jZSB0cmVlXHJcbiAgICAgIGxldCBwYXJlbnQgPSB0aGlzLnBkb21JbnN0YW5jZS5wYXJlbnQ7XHJcbiAgICAgIHdoaWxlICggcGFyZW50ICkge1xyXG4gICAgICAgIHBhcmVudC5wZWVyLmNoaWxkUG9zaXRpb25EaXJ0eSA9IHRydWU7XHJcbiAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBDU1MgcG9zaXRpb25pbmcgb2YgdGhlIHByaW1hcnkgYW5kIGxhYmVsIHNpYmxpbmdzLiBSZXF1aXJlZCB0byBzdXBwb3J0IGFjY2Vzc2liaWxpdHkgb24gbW9iaWxlXHJcbiAgICogZGV2aWNlcy4gT24gYWN0aXZhdGlvbiBvZiBmb2N1c2FibGUgZWxlbWVudHMsIGNlcnRhaW4gQVQgd2lsbCBzZW5kIGZha2UgcG9pbnRlciBldmVudHMgdG8gdGhlIGJyb3dzZXIgYXRcclxuICAgKiB0aGUgY2VudGVyIG9mIHRoZSBjbGllbnQgYm91bmRpbmcgcmVjdGFuZ2xlIG9mIHRoZSBIVE1MIGVsZW1lbnQuIEJ5IHBvc2l0aW9uaW5nIGVsZW1lbnRzIG92ZXIgZ3JhcGhpY2FsIGRpc3BsYXlcclxuICAgKiBvYmplY3RzIHdlIGNhbiBjYXB0dXJlIHRob3NlIGV2ZW50cy4gQSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggaXMgY2FsY3VsYXRlZCB0aGF0IHdpbGwgdHJhbnNmb3JtIHRoZSBwb3NpdGlvblxyXG4gICAqIGFuZCBkaW1lbnNpb24gb2YgdGhlIEhUTUwgZWxlbWVudCBpbiBwaXhlbHMgdG8gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lLiBUaGUgbWF0cml4IGlzIHVzZWQgdG8gdHJhbnNmb3JtXHJcbiAgICogdGhlIGJvdW5kcyBvZiB0aGUgZWxlbWVudCBwcmlvciB0byBhbnkgb3RoZXIgdHJhbnNmb3JtYXRpb24gc28gd2UgY2FuIHNldCB0aGUgZWxlbWVudCdzIGxlZnQsIHRvcCwgd2lkdGgsIGFuZFxyXG4gICAqIGhlaWdodCB3aXRoIENTUyBhdHRyaWJ1dGVzLlxyXG4gICAqXHJcbiAgICogRm9yIG5vdyB3ZSBhcmUgb25seSB0cmFuc2Zvcm1pbmcgdGhlIHByaW1hcnkgYW5kIGxhYmVsIHNpYmxpbmdzIGlmIHRoZSBwcmltYXJ5IHNpYmxpbmcgaXMgZm9jdXNhYmxlLiBJZlxyXG4gICAqIGZvY3VzYWJsZSwgdGhlIHByaW1hcnkgc2libGluZyBuZWVkcyB0byBiZSB0cmFuc2Zvcm1lZCB0byByZWNlaXZlIHVzZXIgaW5wdXQuIFZvaWNlT3ZlciBpbmNsdWRlcyB0aGUgbGFiZWwgYm91bmRzXHJcbiAgICogaW4gaXRzIGNhbGN1bGF0aW9uIGZvciB3aGVyZSB0byBzZW5kIHRoZSBldmVudHMsIHNvIGl0IG5lZWRzIHRvIGJlIHRyYW5zZm9ybWVkIGFzIHdlbGwuIERlc2NyaXB0aW9ucyBhcmUgbm90XHJcbiAgICogY29uc2lkZXJlZCBhbmQgZG8gbm90IG5lZWQgdG8gYmUgcG9zaXRpb25lZC5cclxuICAgKlxyXG4gICAqIEluaXRpYWxseSwgd2UgdHJpZWQgdG8gc2V0IHRoZSBDU1MgdHJhbnNmb3JtYXRpb25zIG9uIGVsZW1lbnRzIGRpcmVjdGx5IHRocm91Z2ggdGhlIHRyYW5zZm9ybSBhdHRyaWJ1dGUuIFdoaWxlXHJcbiAgICogdGhpcyB3b3JrZWQgZm9yIGJhc2ljIGlucHV0LCBpdCBkaWQgbm90IHN1cHBvcnQgb3RoZXIgQVQgZmVhdHVyZXMgbGlrZSB0YXBwaW5nIHRoZSBzY3JlZW4gdG8gZm9jdXMgZWxlbWVudHMuXHJcbiAgICogV2l0aCB0aGlzIHN0cmF0ZWd5LCB0aGUgVm9pY2VPdmVyIFwidG91Y2ggYXJlYVwiIHdhcyBhIHNtYWxsIGJveCBhcm91bmQgdGhlIHRvcCBsZWZ0IGNvcm5lciBvZiB0aGUgZWxlbWVudC4gSXQgd2FzXHJcbiAgICogbmV2ZXIgY2xlYXIgd2h5IHRoaXMgd2FzIHRoaXMgY2FzZSwgYnV0IGZvcmNlZCB1cyB0byBjaGFuZ2Ugb3VyIHN0cmF0ZWd5IHRvIHNldCB0aGUgbGVmdCwgdG9wLCB3aWR0aCwgYW5kIGhlaWdodFxyXG4gICAqIGF0dHJpYnV0ZXMgaW5zdGVhZC5cclxuICAgKlxyXG4gICAqIFRoaXMgZnVuY3Rpb24gYXNzdW1lcyB0aGF0IGVsZW1lbnRzIGhhdmUgb3RoZXIgc3R5bGUgYXR0cmlidXRlcyBzbyB0aGV5IGNhbiBiZSBwb3NpdGlvbmVkIGNvcnJlY3RseSBhbmQgZG9uJ3RcclxuICAgKiBpbnRlcmZlcmUgd2l0aCBzY2VuZXJ5IGlucHV0LCBzZWUgU2NlbmVyeVN0eWxlIGluIFBET01VdGlscy5cclxuICAgKlxyXG4gICAqIEFkZGl0aW9uYWwgbm90ZXMgd2VyZSB0YWtlbiBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODUyLCBzZWUgdGhhdCBpc3N1ZSBmb3IgbW9yZVxyXG4gICAqIGluZm9ybWF0aW9uLlxyXG4gICAqXHJcbiAgICogUmV2aWV3OiBUaGlzIGZ1bmN0aW9uIGNvdWxkIGJlIHNpbXBsaWZpZWQgYnkgc2V0dGluZyB0aGUgZWxlbWVudCB3aWR0aC9oZWlnaHQgYSBzbWFsbCBhcmJpdHJhcnkgc2hhcGVcclxuICAgKiBhdCB0aGUgY2VudGVyIG9mIHRoZSBub2RlJ3MgZ2xvYmFsIGJvdW5kcy4gVGhlcmUgaXMgYSBkcmF3YmFjayBpbiB0aGF0IHRoZSBWTyBkZWZhdWx0IGhpZ2hsaWdodCB3b24ndFxyXG4gICAqIHN1cnJvdW5kIHRoZSBOb2RlIGFueW1vcmUuIEJ1dCBpdCBjb3VsZCBiZSBhIHBlcmZvcm1hbmNlIGVuaGFuY2VtZW50IGFuZCBzaW1wbGlmeSB0aGlzIGZ1bmN0aW9uLlxyXG4gICAqIE9yIG1heWJlIGEgYmlnIHJlY3RhbmdsZSBsYXJnZXIgdGhhbiB0aGUgRGlzcGxheSBkaXYgc3RpbGwgY2VudGVyZWQgb24gdGhlIG5vZGUgc28gd2UgbmV2ZXJcclxuICAgKiBzZWUgdGhlIFZPIGhpZ2hsaWdodD9cclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcG9zaXRpb25FbGVtZW50cyggcG9zaXRpb25JblBET00gKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9wcmltYXJ5U2libGluZywgJ2EgcHJpbWFyeSBzaWJsaW5nIHJlcXVpcmVkIHRvIHJlY2VpdmUgQ1NTIHBvc2l0aW9uaW5nJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wb3NpdGlvbkRpcnR5LCAnZWxlbWVudHMgc2hvdWxkIG9ubHkgYmUgcmVwb3NpdGlvbmVkIGlmIGRpcnR5JyApO1xyXG5cclxuICAgIC8vIENTUyB0cmFuc2Zvcm1hdGlvbiBvbmx5IG5lZWRzIHRvIGJlIGFwcGxpZWQgaWYgdGhlIG5vZGUgaXMgZm9jdXNhYmxlIC0gb3RoZXJ3aXNlIHRoZSBlbGVtZW50IHdpbGwgYmUgZm91bmRcclxuICAgIC8vIGJ5IGdlc3R1cmUgbmF2aWdhdGlvbiB3aXRoIHRoZSB2aXJ0dWFsIGN1cnNvci4gQm91bmRzIGZvciBub24tZm9jdXNhYmxlIGVsZW1lbnRzIGluIHRoZSBWaWV3UG9ydCBkb24ndFxyXG4gICAgLy8gbmVlZCB0byBiZSBhY2N1cmF0ZSBiZWNhdXNlIHRoZSBBVCBkb2Vzbid0IG5lZWQgdG8gc2VuZCBldmVudHMgdG8gdGhlbS5cclxuICAgIGlmICggcG9zaXRpb25JblBET00gKSB7XHJcbiAgICAgIGNvbnN0IHRyYW5zZm9ybVNvdXJjZU5vZGUgPSB0aGlzLm5vZGUucGRvbVRyYW5zZm9ybVNvdXJjZU5vZGUgfHwgdGhpcy5ub2RlO1xyXG5cclxuICAgICAgc2NyYXRjaEdsb2JhbEJvdW5kcy5zZXQoIHRyYW5zZm9ybVNvdXJjZU5vZGUubG9jYWxCb3VuZHMgKTtcclxuICAgICAgaWYgKCBzY3JhdGNoR2xvYmFsQm91bmRzLmlzRmluaXRlKCkgKSB7XHJcbiAgICAgICAgc2NyYXRjaEdsb2JhbEJvdW5kcy50cmFuc2Zvcm0oIHRoaXMucGRvbUluc3RhbmNlLnRyYW5zZm9ybVRyYWNrZXIuZ2V0TWF0cml4KCkgKTtcclxuXHJcbiAgICAgICAgLy8gbm8gbmVlZCB0byBwb3NpdGlvbiBpZiB0aGUgbm9kZSBpcyBmdWxseSBvdXRzaWRlIG9mIHRoZSBEaXNwbGF5IGJvdW5kcyAob3V0IG9mIHZpZXcpXHJcbiAgICAgICAgY29uc3QgZGlzcGxheUJvdW5kcyA9IHRoaXMuZGlzcGxheS5ib3VuZHM7XHJcbiAgICAgICAgaWYgKCBkaXNwbGF5Qm91bmRzLmludGVyc2VjdHNCb3VuZHMoIHNjcmF0Y2hHbG9iYWxCb3VuZHMgKSApIHtcclxuXHJcbiAgICAgICAgICAvLyBDb25zdHJhaW4gdGhlIGdsb2JhbCBib3VuZHMgdG8gRGlzcGxheSBib3VuZHMgc28gdGhhdCBjZW50ZXIgb2YgdGhlIHNpYmxpbmcgZWxlbWVudFxyXG4gICAgICAgICAgLy8gaXMgYWx3YXlzIGluIHRoZSBEaXNwbGF5LiBXZSBtYXkgbWlzcyBpbnB1dCBpZiB0aGUgY2VudGVyIG9mIHRoZSBOb2RlIGlzIG91dHNpZGVcclxuICAgICAgICAgIC8vIHRoZSBEaXNwbGF5LCB3aGVyZSBWb2ljZU92ZXIgd291bGQgb3RoZXJ3aXNlIHNlbmQgcG9pbnRlciBldmVudHMuXHJcbiAgICAgICAgICBzY3JhdGNoR2xvYmFsQm91bmRzLmNvbnN0cmFpbkJvdW5kcyggZGlzcGxheUJvdW5kcyApO1xyXG5cclxuICAgICAgICAgIGxldCBjbGllbnREaW1lbnNpb25zID0gZ2V0Q2xpZW50RGltZW5zaW9ucyggdGhpcy5fcHJpbWFyeVNpYmxpbmcgKTtcclxuICAgICAgICAgIGxldCBjbGllbnRXaWR0aCA9IGNsaWVudERpbWVuc2lvbnMud2lkdGg7XHJcbiAgICAgICAgICBsZXQgY2xpZW50SGVpZ2h0ID0gY2xpZW50RGltZW5zaW9ucy5oZWlnaHQ7XHJcblxyXG4gICAgICAgICAgaWYgKCBjbGllbnRXaWR0aCA+IDAgJiYgY2xpZW50SGVpZ2h0ID4gMCApIHtcclxuICAgICAgICAgICAgc2NyYXRjaFNpYmxpbmdCb3VuZHMuc2V0TWluTWF4KCAwLCAwLCBjbGllbnRXaWR0aCwgY2xpZW50SGVpZ2h0ICk7XHJcbiAgICAgICAgICAgIHNjcmF0Y2hTaWJsaW5nQm91bmRzLnRyYW5zZm9ybSggZ2V0Q1NTTWF0cml4KCBjbGllbnRXaWR0aCwgY2xpZW50SGVpZ2h0LCBzY3JhdGNoR2xvYmFsQm91bmRzICkgKTtcclxuICAgICAgICAgICAgc2V0Q2xpZW50Qm91bmRzKCB0aGlzLl9wcmltYXJ5U2libGluZywgc2NyYXRjaFNpYmxpbmdCb3VuZHMgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoIHRoaXMubGFiZWxTaWJsaW5nICkge1xyXG4gICAgICAgICAgICBjbGllbnREaW1lbnNpb25zID0gZ2V0Q2xpZW50RGltZW5zaW9ucyggdGhpcy5fbGFiZWxTaWJsaW5nICk7XHJcbiAgICAgICAgICAgIGNsaWVudFdpZHRoID0gY2xpZW50RGltZW5zaW9ucy53aWR0aDtcclxuICAgICAgICAgICAgY2xpZW50SGVpZ2h0ID0gY2xpZW50RGltZW5zaW9ucy5oZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoIGNsaWVudEhlaWdodCA+IDAgJiYgY2xpZW50V2lkdGggPiAwICkge1xyXG4gICAgICAgICAgICAgIHNjcmF0Y2hTaWJsaW5nQm91bmRzLnNldE1pbk1heCggMCwgMCwgY2xpZW50V2lkdGgsIGNsaWVudEhlaWdodCApO1xyXG4gICAgICAgICAgICAgIHNjcmF0Y2hTaWJsaW5nQm91bmRzLnRyYW5zZm9ybSggZ2V0Q1NTTWF0cml4KCBjbGllbnRXaWR0aCwgY2xpZW50SGVpZ2h0LCBzY3JhdGNoR2xvYmFsQm91bmRzICkgKTtcclxuICAgICAgICAgICAgICBzZXRDbGllbnRCb3VuZHMoIHRoaXMuX2xhYmVsU2libGluZywgc2NyYXRjaFNpYmxpbmdCb3VuZHMgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBub3QgcG9zaXRpb25pbmcsIGp1c3QgbW92ZSBvZmYgc2NyZWVuXHJcbiAgICAgIHNjcmF0Y2hTaWJsaW5nQm91bmRzLnNldCggUERPTVBlZXIuT0ZGU0NSRUVOX1NJQkxJTkdfQk9VTkRTICk7XHJcbiAgICAgIHNldENsaWVudEJvdW5kcyggdGhpcy5fcHJpbWFyeVNpYmxpbmcsIHNjcmF0Y2hTaWJsaW5nQm91bmRzICk7XHJcbiAgICAgIGlmICggdGhpcy5fbGFiZWxTaWJsaW5nICkge1xyXG4gICAgICAgIHNldENsaWVudEJvdW5kcyggdGhpcy5fbGFiZWxTaWJsaW5nLCBzY3JhdGNoU2libGluZ0JvdW5kcyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5wb3NpdGlvbkRpcnR5ID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgcG9zaXRpb25pbmcgb2YgZWxlbWVudHMgaW4gdGhlIFBET00uIERvZXMgYSBkZXB0aCBmaXJzdCBzZWFyY2ggZm9yIGFsbCBkZXNjZW5kYW50cyBvZiBwYXJlbnRJbnRzYW5jZSB3aXRoXHJcbiAgICogYSBwZWVyIHRoYXQgZWl0aGVyIGhhcyBkaXJ0eSBwb3NpdGlvbmluZyBvciBhcyBhIGRlc2NlbmRhbnQgd2l0aCBkaXJ0eSBwb3NpdGlvbmluZy5cclxuICAgKlxyXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgdXBkYXRlU3VidHJlZVBvc2l0aW9uaW5nKCBwYXJlbnRQb3NpdGlvbkluUERPTSA9IGZhbHNlICkge1xyXG4gICAgdGhpcy5jaGlsZFBvc2l0aW9uRGlydHkgPSBmYWxzZTtcclxuXHJcbiAgICBjb25zdCBwb3NpdGlvbkluUERPTSA9IHRoaXMucG9zaXRpb25JblBET00gfHwgcGFyZW50UG9zaXRpb25JblBET007XHJcblxyXG4gICAgaWYgKCB0aGlzLnBvc2l0aW9uRGlydHkgKSB7XHJcbiAgICAgIHRoaXMucG9zaXRpb25FbGVtZW50cyggcG9zaXRpb25JblBET00gKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnBkb21JbnN0YW5jZS5jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgY2hpbGRQZWVyID0gdGhpcy5wZG9tSW5zdGFuY2UuY2hpbGRyZW5bIGkgXS5wZWVyO1xyXG4gICAgICBpZiAoIGNoaWxkUGVlci5wb3NpdGlvbkRpcnR5IHx8IGNoaWxkUGVlci5jaGlsZFBvc2l0aW9uRGlydHkgKSB7XHJcbiAgICAgICAgdGhpcy5wZG9tSW5zdGFuY2UuY2hpbGRyZW5bIGkgXS5wZWVyLnVwZGF0ZVN1YnRyZWVQb3NpdGlvbmluZyggcG9zaXRpb25JblBET00gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVjdXJzaXZlbHkgc2V0IHRoaXMgUERPTVBlZXIgYW5kIGNoaWxkcmVuIHRvIGJlIGRpc2FibGVkLiBUaGlzIHdpbGwgb3ZlcndyaXRlIGFueSBwcmV2aW91cyB2YWx1ZSBvZiBkaXNhYmxlZFxyXG4gICAqIHRoYXQgbWF5IGhhdmUgYmVlbiBzZXQsIGJ1dCB3aWxsIGtlZXAgdHJhY2sgb2YgdGhlIG9sZCB2YWx1ZSwgYW5kIHJlc3RvcmUgaXRzIHN0YXRlIHVwb24gcmUtZW5hYmxpbmcuXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBkaXNhYmxlZFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZWN1cnNpdmVEaXNhYmxlKCBkaXNhYmxlZCApIHtcclxuXHJcbiAgICBpZiAoIGRpc2FibGVkICkge1xyXG4gICAgICB0aGlzLl9wcmVzZXJ2ZWREaXNhYmxlZFZhbHVlID0gdGhpcy5fcHJpbWFyeVNpYmxpbmcuZGlzYWJsZWQ7XHJcbiAgICAgIHRoaXMuX3ByaW1hcnlTaWJsaW5nLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLl9wcmltYXJ5U2libGluZy5kaXNhYmxlZCA9IHRoaXMuX3ByZXNlcnZlZERpc2FibGVkVmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5wZG9tSW5zdGFuY2UuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMucGRvbUluc3RhbmNlLmNoaWxkcmVuWyBpIF0ucGVlci5yZWN1cnNpdmVEaXNhYmxlKCBkaXNhYmxlZCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBleHRlcm5hbCByZWZlcmVuY2VzIGZyb20gdGhpcyBwZWVyLCBhbmQgcGxhY2VzIGl0IGluIHRoZSBwb29sLlxyXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuaXNEaXNwb3NlZCA9IHRydWU7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGZvY3VzIGlmIHRoZSBkaXNwb3NlZCBwZWVyIGlzIHRoZSBhY3RpdmUgZWxlbWVudFxyXG4gICAgdGhpcy5ibHVyKCk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGxpc3RlbmVyc1xyXG4gICAgdGhpcy5fcHJpbWFyeVNpYmxpbmcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2JsdXInLCB0aGlzLmJsdXJFdmVudExpc3RlbmVyICk7XHJcbiAgICB0aGlzLl9wcmltYXJ5U2libGluZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnZm9jdXMnLCB0aGlzLmZvY3VzRXZlbnRMaXN0ZW5lciApO1xyXG4gICAgdGhpcy5wZG9tSW5zdGFuY2UudHJhbnNmb3JtVHJhY2tlci5yZW1vdmVMaXN0ZW5lciggdGhpcy50cmFuc2Zvcm1MaXN0ZW5lciApO1xyXG4gICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcclxuXHJcbiAgICAvLyB6ZXJvLW91dCByZWZlcmVuY2VzXHJcbiAgICB0aGlzLnBkb21JbnN0YW5jZSA9IG51bGw7XHJcbiAgICB0aGlzLm5vZGUgPSBudWxsO1xyXG4gICAgdGhpcy5kaXNwbGF5ID0gbnVsbDtcclxuICAgIHRoaXMudHJhaWwgPSBudWxsO1xyXG4gICAgdGhpcy5fcHJpbWFyeVNpYmxpbmcgPSBudWxsO1xyXG4gICAgdGhpcy5fbGFiZWxTaWJsaW5nID0gbnVsbDtcclxuICAgIHRoaXMuX2Rlc2NyaXB0aW9uU2libGluZyA9IG51bGw7XHJcbiAgICB0aGlzLl9jb250YWluZXJQYXJlbnQgPSBudWxsO1xyXG4gICAgdGhpcy5mb2N1c2FibGUgPSBudWxsO1xyXG5cclxuICAgIC8vIGZvciBub3dcclxuICAgIHRoaXMuZnJlZVRvUG9vbCgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQHB1YmxpYyB7c3RyaW5nfSAtIHNwZWNpZmllcyB2YWxpZCBhc3NvY2lhdGlvbnMgYmV0d2VlbiByZWxhdGVkIFBET01QZWVycyBpbiB0aGUgRE9NXHJcblBET01QZWVyLlBSSU1BUllfU0lCTElORyA9IFBSSU1BUllfU0lCTElORzsgLy8gYXNzb2NpYXRlIHdpdGggYWxsIGFjY2Vzc2libGUgY29udGVudCByZWxhdGVkIHRvIHRoaXMgcGVlclxyXG5QRE9NUGVlci5MQUJFTF9TSUJMSU5HID0gTEFCRUxfU0lCTElORzsgLy8gYXNzb2NpYXRlIHdpdGgganVzdCB0aGUgbGFiZWwgY29udGVudCBvZiB0aGlzIHBlZXJcclxuUERPTVBlZXIuREVTQ1JJUFRJT05fU0lCTElORyA9IERFU0NSSVBUSU9OX1NJQkxJTkc7IC8vIGFzc29jaWF0ZSB3aXRoIGp1c3QgdGhlIGRlc2NyaXB0aW9uIGNvbnRlbnQgb2YgdGhpcyBwZWVyXHJcblBET01QZWVyLkNPTlRBSU5FUl9QQVJFTlQgPSBDT05UQUlORVJfUEFSRU5UOyAvLyBhc3NvY2lhdGUgd2l0aCBldmVyeXRoaW5nIHVuZGVyIHRoZSBjb250YWluZXIgcGFyZW50IG9mIHRoaXMgcGVlclxyXG5cclxuLy8gQHB1YmxpYyAoc2NlbmVyeS1pbnRlcm5hbCkgLSBib3VuZHMgZm9yIGEgc2libGluZyB0aGF0IHNob3VsZCBiZSBtb3ZlZCBvZmYtc2NyZWVuIHdoZW4gbm90IHBvc2l0aW9uaW5nLCBpblxyXG4vLyBnbG9iYWwgY29vcmRpbmF0ZXNcclxuUERPTVBlZXIuT0ZGU0NSRUVOX1NJQkxJTkdfQk9VTkRTID0gbmV3IEJvdW5kczIoIDAsIDAsIDEsIDEgKTtcclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdQRE9NUGVlcicsIFBET01QZWVyICk7XHJcblxyXG4vLyBTZXQgdXAgcG9vbGluZ1xyXG5Qb29sYWJsZS5taXhJbnRvKCBQRE9NUGVlciwge1xyXG4gIGluaXRpYWxpemU6IFBET01QZWVyLnByb3RvdHlwZS5pbml0aWFsaXplUERPTVBlZXJcclxufSApO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBIZWxwZXIgZnVuY3Rpb25zXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYSBzaWJsaW5nIGVsZW1lbnQgZm9yIHRoZSBQRE9NUGVlci5cclxuICogVE9ETzogdGhpcyBzaG91bGQgYmUgaW5saW5lZCB3aXRoIHRoZSBQRE9NVXRpbHMgbWV0aG9kXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0YWdOYW1lXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9jdXNhYmxlXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBwYXNzZWQgYWxvbmcgdG8gUERPTVV0aWxzLmNyZWF0ZUVsZW1lbnRcclxuICogQHJldHVybnMge0hUTUxFbGVtZW50fVxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudCggdGFnTmFtZSwgZm9jdXNhYmxlLCBvcHRpb25zICkge1xyXG4gIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgIC8vIHtzdHJpbmd8bnVsbH0gLSBhZGRpdGlvbiB0byB0aGUgdHJhaWxJZCwgc2VwYXJhdGVkIGJ5IGEgaHlwaGVuIHRvIGlkZW50aWZ5IHRoZSBkaWZmZXJlbnQgc2libGluZ3Mgd2l0aGluXHJcbiAgICAvLyB0aGUgZG9jdW1lbnRcclxuICAgIHNpYmxpbmdOYW1lOiBudWxsLFxyXG5cclxuICAgIC8vIHtib29sZWFufSAtIGlmIHRydWUsIERPTSBpbnB1dCBldmVudHMgcmVjZWl2ZWQgb24gdGhlIGVsZW1lbnQgd2lsbCBub3QgYmUgZGlzcGF0Y2hlZCBhcyBTY2VuZXJ5RXZlbnRzIGluIElucHV0LmpzXHJcbiAgICAvLyBzZWUgUGFyYWxsZWxET00uc2V0RXhjbHVkZUxhYmVsU2libGluZ0Zyb21JbnB1dCBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAgZXhjbHVkZUZyb21JbnB1dDogZmFsc2VcclxuICB9LCBvcHRpb25zICk7XHJcblxyXG4gIGNvbnN0IG5ld0VsZW1lbnQgPSBQRE9NVXRpbHMuY3JlYXRlRWxlbWVudCggdGFnTmFtZSwgZm9jdXNhYmxlLCBvcHRpb25zICk7XHJcblxyXG4gIGlmICggb3B0aW9ucy5leGNsdWRlRnJvbUlucHV0ICkge1xyXG4gICAgbmV3RWxlbWVudC5zZXRBdHRyaWJ1dGUoIFBET01VdGlscy5EQVRBX0VYQ0xVREVfRlJPTV9JTlBVVCwgdHJ1ZSApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG5ld0VsZW1lbnQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgYSBtYXRyaXggdGhhdCBjYW4gYmUgdXNlZCBhcyB0aGUgQ1NTIHRyYW5zZm9ybSBmb3IgZWxlbWVudHMgaW4gdGhlIERPTS4gVGhpcyBtYXRyaXggd2lsbCBhbiBIVE1MIGVsZW1lbnRcclxuICogZGltZW5zaW9ucyBpbiBwaXhlbHMgdG8gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGNsaWVudFdpZHRoIC0gd2lkdGggb2YgdGhlIGVsZW1lbnQgdG8gdHJhbnNmb3JtIGluIHBpeGVsc1xyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGNsaWVudEhlaWdodCAtIGhlaWdodCBvZiB0aGUgZWxlbWVudCB0byB0cmFuc2Zvcm0gaW4gcGl4ZWxzXHJcbiAqIEBwYXJhbSAge0JvdW5kczJ9IG5vZGVHbG9iYWxCb3VuZHMgLSBCb3VuZHMgb2YgdGhlIFBET01QZWVyJ3Mgbm9kZSBpbiB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAqIEByZXR1cm5zIHtNYXRyaXgzfVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0Q1NTTWF0cml4KCBjbGllbnRXaWR0aCwgY2xpZW50SGVpZ2h0LCBub2RlR2xvYmFsQm91bmRzICkge1xyXG5cclxuICAvLyB0aGUgdHJhbnNsYXRpb24gbWF0cml4IGZvciB0aGUgbm9kZSdzIGJvdW5kcyBpbiBpdHMgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZVxyXG4gIGdsb2JhbE5vZGVUcmFuc2xhdGlvbk1hdHJpeC5zZXRUb1RyYW5zbGF0aW9uKCBub2RlR2xvYmFsQm91bmRzLm1pblgsIG5vZGVHbG9iYWxCb3VuZHMubWluWSApO1xyXG5cclxuICAvLyBzY2FsZSBtYXRyaXggZm9yIFwiY2xpZW50XCIgSFRNTCBlbGVtZW50LCBzY2FsZSB0byBtYWtlIHRoZSBIVE1MIGVsZW1lbnQncyBET00gYm91bmRzIG1hdGNoIHRoZVxyXG4gIC8vIGxvY2FsIGJvdW5kcyBvZiB0aGUgbm9kZVxyXG4gIGdsb2JhbFRvQ2xpZW50U2NhbGVNYXRyaXguc2V0VG9TY2FsZSggbm9kZUdsb2JhbEJvdW5kcy53aWR0aCAvIGNsaWVudFdpZHRoLCBub2RlR2xvYmFsQm91bmRzLmhlaWdodCAvIGNsaWVudEhlaWdodCApO1xyXG5cclxuICAvLyBjb21iaW5lIHRoZXNlIGluIGEgc2luZ2xlIHRyYW5zZm9ybWF0aW9uIG1hdHJpeFxyXG4gIHJldHVybiBnbG9iYWxOb2RlVHJhbnNsYXRpb25NYXRyaXgubXVsdGlwbHlNYXRyaXgoIGdsb2JhbFRvQ2xpZW50U2NhbGVNYXRyaXggKS5tdWx0aXBseU1hdHJpeCggbm9kZVNjYWxlTWFnbml0dWRlTWF0cml4ICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIGFuIG9iamVjdCB3aXRoIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IG9mIGFuIEhUTUwgZWxlbWVudCBpbiBwaXhlbHMsIHByaW9yIHRvIGFueSBzY2FsaW5nLiBjbGllbnRXaWR0aCBhbmRcclxuICogY2xpZW50SGVpZ2h0IGFyZSB6ZXJvIGZvciBlbGVtZW50cyB3aXRoIGlubGluZSBsYXlvdXQgYW5kIGVsZW1lbnRzIHdpdGhvdXQgQ1NTLiBGb3IgdGhvc2UgZWxlbWVudHMgd2UgZmFsbCBiYWNrXHJcbiAqIHRvIHRoZSBib3VuZGluZ0NsaWVudFJlY3QsIHdoaWNoIGF0IHRoYXQgcG9pbnQgd2lsbCBkZXNjcmliZSB0aGUgZGltZW5zaW9ucyBvZiB0aGUgZWxlbWVudCBwcmlvciB0byBzY2FsaW5nLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gc2libGluZ0VsZW1lbnRcclxuICogQHJldHVybnMge09iamVjdH0gLSBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIHR3byBlbnRyaWVzLCB7IHdpZHRoOiB7bnVtYmVyfSwgaGVpZ2h0OiB7bnVtYmVyfSB9XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRDbGllbnREaW1lbnNpb25zKCBzaWJsaW5nRWxlbWVudCApIHtcclxuICBsZXQgY2xpZW50V2lkdGggPSBzaWJsaW5nRWxlbWVudC5jbGllbnRXaWR0aDtcclxuICBsZXQgY2xpZW50SGVpZ2h0ID0gc2libGluZ0VsZW1lbnQuY2xpZW50SGVpZ2h0O1xyXG5cclxuICBpZiAoIGNsaWVudFdpZHRoID09PSAwICYmIGNsaWVudEhlaWdodCA9PT0gMCApIHtcclxuICAgIGNvbnN0IGNsaWVudFJlY3QgPSBzaWJsaW5nRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgIGNsaWVudFdpZHRoID0gY2xpZW50UmVjdC53aWR0aDtcclxuICAgIGNsaWVudEhlaWdodCA9IGNsaWVudFJlY3QuaGVpZ2h0O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgd2lkdGg6IGNsaWVudFdpZHRoLCBoZWlnaHQ6IGNsaWVudEhlaWdodCB9O1xyXG59XHJcblxyXG4vKipcclxuICogU2V0IHRoZSBib3VuZHMgb2YgdGhlIHNpYmxpbmcgZWxlbWVudCBpbiB0aGUgdmlldyBwb3J0IGluIHBpeGVscywgdXNpbmcgdG9wLCBsZWZ0LCB3aWR0aCwgYW5kIGhlaWdodCBjc3MuXHJcbiAqIFRoZSBlbGVtZW50IG11c3QgYmUgc3R5bGVkIHdpdGggJ3Bvc2l0aW9uOiBmaXhlZCcsIGFuZCBhbiBhbmNlc3RvciBtdXN0IGhhdmUgcG9zaXRpb246ICdyZWxhdGl2ZScsIHNvIHRoYXRcclxuICogdGhlIGRpbWVuc2lvbnMgb2YgdGhlIHNpYmxpbmcgYXJlIHJlbGF0aXZlIHRvIHRoZSBwYXJlbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHNpYmxpbmdFbGVtZW50IC0gdGhlIGVsZW1lbnQgdG8gcG9zaXRpb25cclxuICogQHBhcmFtIHtCb3VuZHMyfSBib3VuZHMgLSBkZXNpcmVkIGJvdW5kcywgaW4gcGl4ZWxzXHJcbiAqL1xyXG5mdW5jdGlvbiBzZXRDbGllbnRCb3VuZHMoIHNpYmxpbmdFbGVtZW50LCBib3VuZHMgKSB7XHJcbiAgc2libGluZ0VsZW1lbnQuc3R5bGUudG9wID0gYCR7Ym91bmRzLnRvcH1weGA7XHJcbiAgc2libGluZ0VsZW1lbnQuc3R5bGUubGVmdCA9IGAke2JvdW5kcy5sZWZ0fXB4YDtcclxuICBzaWJsaW5nRWxlbWVudC5zdHlsZS53aWR0aCA9IGAke2JvdW5kcy53aWR0aH1weGA7XHJcbiAgc2libGluZ0VsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gYCR7Ym91bmRzLmhlaWdodH1weGA7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBET01QZWVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxRQUFRLE1BQU0sc0NBQXNDO0FBQzNELE9BQU9DLG1CQUFtQixNQUFNLGlEQUFpRDtBQUNqRixTQUFTQyxZQUFZLEVBQUVDLFlBQVksRUFBRUMsZ0JBQWdCLEVBQUVDLFNBQVMsRUFBRUMsT0FBTyxRQUFRLGtCQUFrQjs7QUFFbkc7QUFDQSxNQUFNQyxlQUFlLEdBQUcsaUJBQWlCO0FBQ3pDLE1BQU1DLGFBQWEsR0FBRyxlQUFlO0FBQ3JDLE1BQU1DLG1CQUFtQixHQUFHLHFCQUFxQjtBQUNqRCxNQUFNQyxnQkFBZ0IsR0FBRyxrQkFBa0I7QUFDM0MsTUFBTUMsU0FBUyxHQUFHTixTQUFTLENBQUNPLElBQUksQ0FBQ0MsS0FBSztBQUN0QyxNQUFNQyxTQUFTLEdBQUdULFNBQVMsQ0FBQ08sSUFBSSxDQUFDRyxLQUFLO0FBQ3RDLE1BQU1DLHVCQUF1QixHQUFHLFVBQVU7O0FBRTFDO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLGVB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