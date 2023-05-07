// Copyright 2021-2023, University of Colorado Boulder

/**
 * A superclass for Node, adding accessibility by defining content for the Parallel DOM. Please note that Node and
 * ParallelDOM are closely intertwined, though they are separated into separate files in the type hierarchy.
 *
 * The Parallel DOM is an HTML structure that provides semantics for assistive technologies. For web content to be
 * accessible, assistive technologies require HTML markup, which is something that pure graphical content does not
 * include. This adds the accessible HTML content for any Node in the scene graph.
 *
 * Any Node can have pdom content, but they have to opt into it. The structure of the pdom content will
 * match the structure of the scene graph.
 *
 * Say we have the following scene graph:
 *
 *   A
 *  / \
 * B   C
 *    / \
 *   D   E
 *        \
 *         F
 *
 * And say that nodes A, B, C, D, and F specify pdom content for the DOM.  Scenery will render the pdom
 * content like so:
 *
 * <div id="node-A">
 *   <div id="node-B"></div>
 *   <div id="node-C">
 *     <div id="node-D"></div>
 *     <div id="node-F"></div>
 *   </div>
 * </div>
 *
 * In this example, each element is represented by a div, but any HTML element could be used. Note that in this example,
 * node E did not specify pdom content, so node F was added as a child under node C.  If node E had specified
 * pdom content, content for node F would have been added as a child under the content for node E.
 *
 * --------------------------------------------------------------------------------------------------------------------
 * #BASIC EXAMPLE
 *
 * In a basic example let's say that we want to make a Node an unordered list. To do this, add the `tagName` option to
 * the Node, and assign it to the string "ul". Here is what the code could look like:
 *
 * var myUnorderedList = new Node( { tagName: 'ul' } );
 *
 * To get the desired list html, we can assign the `li` `tagName` to children Nodes, like:
 *
 * var listItem1 = new Node( { tagName: 'li' } );
 * myUnorderedList.addChild( listItem1 );
 *
 * Now we have a single list element in the unordered list. To assign content to this <li>, use the `innerContent`
 * option (all of these Node options have getters and setters, just like any other Node option):
 *
 * listItem1.innerContent = 'I am list item number 1';
 *
 * The above operations will create the following PDOM structure (note that actual ids will be different):
 *
 * <ul id='myUnorderedList'>
 *   <li>I am a list item number 1</li>
 * </ul
 *
 * --------------------------------------------------------------------------------------------------------------------
 * #DOM SIBLINGS
 *
 * The API in this class allows you to add additional structure to the accessible DOM content if necessary. Each node
 * can have multiple DOM Elements associated with it. A Node can have a label DOM element, and a description DOM element.
 * These are called siblings. The Node's direct DOM element (the DOM element you create with the `tagName` option)
 * is called the "primary sibling." You can also have a container parent DOM element that surrounds all of these
 * siblings. With three siblings and a container parent, each Node can have up to 4 DOM Elements representing it in the
 * PDOM. Here is an example of how a Node may use these features:
 *
 * <div>
 *   <label for="myInput">This great label for input</label
 *   <input id="myInput"/>
 *   <p>This is a description for the input</p>
 * </div>
 *
 * Although you can create this structure with four nodes (`input` A, `label B, and `p` C children to `div` D),
 * this structure can be created with one single Node. It is often preferable to do this to limit the number of new
 * Nodes that have to be created just for accessibility purposes. To accomplish this we have the following Node code.
 *
 * new Node( {
 *  tagName: 'input'
 *  labelTagName: 'label',
 *  labelContent: 'This great label for input'
 *  descriptionTagName: 'p',
 *  descriptionContent: 'This is a description for the input',
 *  containerTagName: 'div'
 * });
 *
 * A few notes:
 * 1. Only the primary sibling (specified by tagName) is focusable. Using a focusable element through another element
 *    (like labelTagName) will result in buggy behavior.
 * 2. Notice the names of the content setters for siblings parallel the `innerContent` option for setting the primary
 *    sibling.
 * 3. To make this example actually work, you would need the `inputType` option to set the "type" attribute on the `input`.
 * 4. When you specify the  <label> tag for the label sibling, the "for" attribute is automatically added to the sibling.
 * 5. Finally, the example above doesn't utilize the default tags that we have in place for the parent and siblings.
 *      default labelTagName: 'p'
 *      default descriptionTagName: 'p'
 *      default containerTagName: 'div'
 *    so the following will yield the same PDOM structure:
 *
 *    new Node( {
 *     tagName: 'input',
 *     labelTagName: 'label',
 *     labelContent: 'This great label for input'
 *     descriptionContent: 'This is a description for the input',
 *    });
 *
 * The ParallelDOM class is smart enough to know when there needs to be a container parent to wrap multiple siblings,
 * it is not necessary to use that option unless the desired tag name is  something other than 'div'.
 *
 * --------------------------------------------------------------------------------------------------------------------
 *
 * For additional accessibility options, please see the options listed in ACCESSIBILITY_OPTION_KEYS. To understand the
 * PDOM more, see PDOMPeer, which manages the DOM Elements for a node. For more documentation on Scenery, Nodes,
 * and the scene graph, please see http://phetsims.github.io/scenery/
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import validate from '../../../../axon/js/validate.js';
import Validation from '../../../../axon/js/Validation.js';
import arrayDifference from '../../../../phet-core/js/arrayDifference.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import { Node, PDOMDisplaysInfo, PDOMPeer, PDOMTree, PDOMUtils, scenery, Trail } from '../../imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import TinyProperty from '../../../../axon/js/TinyProperty.js';
import TinyForwardingProperty from '../../../../axon/js/TinyForwardingProperty.js';
const INPUT_TAG = PDOMUtils.TAGS.INPUT;
const P_TAG = PDOMUtils.TAGS.P;

// default tag names for siblings
const DEFAULT_DESCRIPTION_TAG_NAME = P_TAG;
const DEFAULT_LABEL_TAG_NAME = P_TAG;
// see setPDOMHeadingBehavior for more details
const DEFAULT_PDOM_HEADING_BEHAVIOR = (node, options, heading) => {
  options.labelTagName = `h${node.headingLevel}`; // TODO: make sure heading level change fires a full peer rebuild, see https://github.com/phetsims/scenery/issues/867
  options.labelContent = heading;
  return options;
};
const unwrapProperty = valueOrProperty => {
  const result = valueOrProperty === null ? null : typeof valueOrProperty === 'string' ? valueOrProperty : valueOrProperty.value;
  assert && assert(result === null || typeof result === 'string');
  return result;
};

// these elements are typically associated with forms, and support certain attributes
const FORM_ELEMENTS = PDOMUtils.FORM_ELEMENTS;

// list of input "type" attribute values that support the "checked" attribute
const INPUT_TYPES_THAT_SUPPORT_CHECKED = PDOMUtils.INPUT_TYPES_THAT_SUPPORT_CHECKED;

// HTMLElement attributes whose value is an ID of another element
const ASSOCIATION_ATTRIBUTES = PDOMUtils.ASSOCIATION_ATTRIBUTES;

// The options for the ParallelDOM API. In general, most default to null; to clear, set back to null. Each one of
// these has an associated setter, see setter functions for more information about each.
const ACCESSIBILITY_OPTION_KEYS = [
// Order matters. Having focus before tagName covers the case where you change the tagName and focusability of a
// currently focused node. We want the focusability to update correctly.
'focusable', 'tagName',
/*
 * Higher Level API Functions
 */
'accessibleName', 'accessibleNameBehavior', 'helpText', 'helpTextBehavior', 'pdomHeading', 'pdomHeadingBehavior',
/*
 * Lower Level API Functions
 */
'containerTagName', 'containerAriaRole', 'innerContent', 'inputType', 'inputValue', 'pdomChecked', 'pdomNamespace', 'ariaLabel', 'ariaRole', 'ariaValueText', 'labelTagName', 'labelContent', 'appendLabel', 'descriptionTagName', 'descriptionContent', 'appendDescription', 'focusHighlight', 'focusHighlightLayerable', 'groupFocusHighlight', 'pdomVisible', 'pdomOrder', 'ariaLabelledbyAssociations', 'ariaDescribedbyAssociations', 'activeDescendantAssociations', 'positionInPDOM', 'pdomTransformSourceNode'];

// Most options use null for their default behavior, see the setters for each option for a description of how null
// behaves as a default.
/**
 *
 * @param node - the node that the pdom behavior is being applied to
 * @param options - options to mutate within the function
 * @param value - the value that you are setting the behavior of, like the accessibleName
 * @param callbacksForOtherNodes - behavior function also support taking state from a Node and using it to
 * set the accessible content for another Node. If this is the case, that logic should be set in a closure and added to
 * this list for execution after this Node is fully created. See discussion in https://github.com/phetsims/sun/issues/503#issuecomment-676541373
 * @returns the options that have been mutated by the behavior function.
 */
export default class ParallelDOM extends PhetioObject {
  // The HTML tag name of the element representing this node in the DOM

  // The HTML tag name for a container parent element for this node in the DOM. This
  // container parent will contain the node's DOM element, as well as peer elements for any label or description
  // content. See setContainerTagName() for more documentation. If this option is needed (like to
  // contain multiple siblings with the primary sibling), it will default to the value of DEFAULT_CONTAINER_TAG_NAME.
  // The HTML tag name for the label element that will contain the label content for
  // this dom element. There are ways in which you can have a label without specifying a label tag name,
  // see setLabelContent() for the list of ways.
  // The HTML tag name for the description element that will contain descsription content
  // for this dom element. If a description is set before a tag name is defined, a paragraph element
  // will be created for the description.
  // The type for an element with tag name of INPUT.  This should only be used
  // if the element has a tag name INPUT.
  // The value of the input, only relevant if the tag name is of type "INPUT". Is a
  // string because the `value` attribute is a DOMString. null value indicates no value.
  // Whether the pdom input is considered 'checked', only useful for inputs of
  // type 'radio' and 'checkbox'
  // By default the label will be prepended before the primary sibling in the PDOM. This
  // option allows you to instead have the label added after the primary sibling. Note: The label will always
  // be in front of the description sibling. If this flag is set with `appendDescription: true`, the order will be
  // (1) primary sibling, (2) label sibling, (3) description sibling. All siblings will be placed within the
  // containerParent.
  // By default the description will be prepended before the primary sibling in the PDOM. This
  // option allows you to instead have the description added after the primary sibling. Note: The description
  // will always be after the label sibling. If this flag is set with `appendLabel: true`, the order will be
  // (1) primary sibling, (2) label sibling, (3) description sibling. All siblings will be placed within the
  // containerParent.
  // Array of attributes that are on the node's DOM element.  Objects will have the
  // form { attribute:{string}, value:{*}, namespace:{string|null} }
  // Collection of class attributes that are applied to the node's DOM element.
  // Objects have the form { className:{string}, options:{*} }
  // The label content for this node's DOM element.  There are multiple ways that a label
  // can be associated with a node's dom element, see setLabelContent() for more documentation
  // The inner label content for this node's primary sibling. Set as inner HTML
  // or text content of the actual DOM element. If this is used, the node should not have children.
  // The description content for this node's DOM element.
  // If provided, it will create the primary DOM element with the specified namespace.
  // This may be needed, for example, with MathML/SVG/etc.
  // If provided, "aria-label" will be added as an inline attribute on the node's DOM
  // element and set to this value. This will determine how the Accessible Name is provided for the DOM element.
  // The ARIA role for this Node's primary sibling, added as an HTML attribute.  For a complete
  // list of ARIA roles, see https://www.w3.org/TR/wai-aria/roles.  Beware that many roles are not supported
  // by browsers or assistive technologies, so use vanilla HTML for accessibility semantics where possible.
  // The ARIA role for the container parent element, added as an HTML attribute. For a
  // complete list of ARIA roles, see https://www.w3.org/TR/wai-aria/roles. Beware that many roles are not
  // supported by browsers or assistive technologies, so use vanilla HTML for accessibility semantics where
  // possible.
  // If provided, "aria-valuetext" will be added as an inline attribute on the Node's
  // primary sibling and set to this value. Setting back to null will clear this attribute in the view.
  // Keep track of what this Node is aria-labelledby via "associationObjects"
  // see addAriaLabelledbyAssociation for why we support more than one association.
  // Keep a reference to all nodes that are aria-labelledby this node, i.e. that have store one of this Node's
  // peer HTMLElement's id in their peer HTMLElement's aria-labelledby attribute. This way we can tell other
  // nodes to update their aria-labelledby associations when this Node rebuilds its pdom content.
  // Keep track of what this Node is aria-describedby via "associationObjects"
  // see addAriaDescribedbyAssociation for why we support more than one association.
  // Keep a reference to all nodes that are aria-describedby this node, i.e. that have store one of this Node's
  // peer HTMLElement's id in their peer HTMLElement's aria-describedby attribute. This way we can tell other
  // nodes to update their aria-describedby associations when this Node rebuilds its pdom content.
  // Keep track of what this Node is aria-activedescendant via "associationObjects"
  // see addActiveDescendantAssociation for why we support more than one association.
  // Keep a reference to all nodes that are aria-activedescendant this node, i.e. that have store one of this Node's
  // peer HTMLElement's id in their peer HTMLElement's aria-activedescendant attribute. This way we can tell other
  // nodes to update their aria-activedescendant associations when this Node rebuilds its pdom content.
  // Whether this Node's primary sibling has been explicitly set to receive focus from
  // tab navigation. Sets the tabIndex attribute on the Node's primary sibling. Setting to false will not remove the
  // node's DOM from the document, but will ensure that it cannot receive focus by pressing 'tab'.  Several
  // HTMLElements (such as HTML form elements) can be focusable by default, without setting this property. The
  // native HTML function from these form elements can be overridden with this property.
  // The focus highlight that will surround this node when it
  // is focused.  By default, the focus highlight will be a pink rectangle that surrounds the Node's local
  // bounds.
  // A flag that allows prevents focus highlight from being displayed in the HighlightOverlay.
  // If true, the focus highlight for this node will be layerable in the scene graph.  Client is responsible
  // for placement of the focus highlight in the scene graph.
  // Adds a group focus highlight that surrounds this node when a descendant has
  // focus. Typically useful to indicate focus if focus enters a group of elements. If 'true', group
  // highlight will go around local bounds of this node. Otherwise the custom node will be used as the highlight/
  // Whether the pdom content will be visible from the browser and assistive
  // technologies.  When pdomVisible is false, the Node's primary sibling will not be focusable, and it cannot
  // be found by the assistive technology virtual cursor. For more information on how assistive technologies
  // read with the virtual cursor see
  // http://www.ssbbartgroup.com/blog/how-windows-screen-readers-work-on-the-web/
  // If provided, it will override the focus order between children
  // (and optionally arbitrary subtrees). If not provided, the focus order will default to the rendering order
  // (first children first, last children last) determined by the children array.
  // See setPDOMOrder() for more documentation.
  // If this node is specified in another node's pdomOrder, then this will have the value of that other (PDOM parent)
  // Node. Otherwise it's null.
  // (scenery-internal)
  // If this is specified, the primary sibling will be positioned
  // to align with this source node and observe the transforms along this node's trail. At this time the
  // pdomTransformSourceNode cannot use DAG.
  // Contains information about what pdom displays
  // this node is "visible" for, see PDOMDisplaysInfo.js for more information.
  // (scenery-internal)
  // Empty unless the Node contains some pdom content (PDOMInstance).
  // Determines if DOM siblings are positioned in the viewport. This
  // is required for Nodes that require unique input gestures with iOS VoiceOver like "Drag and Drop".
  // See setPositionInPDOM for more information.
  // If true, any DOM events received on the label sibling
  // will not dispatch SceneryEvents through the scene graph, see setExcludeLabelSiblingFromInput() - scenery internal
  // HIGHER LEVEL API INITIALIZATION
  // Sets the "Accessible Name" of the Node, as defined by the Browser's ParallelDOM Tree
  // Function that returns the options needed to set the appropriate accessible name for the Node
  // Sets the help text of the Node, this most often corresponds to description text.
  // Sets the help text of the Node, this most often corresponds to description text.
  // Sets the help text of the Node, this most often corresponds to label sibling text.
  // TODO: implement headingLevel override, see https://github.com/phetsims/scenery/issues/855
  // The number that corresponds to the heading tag the node will get if using the pdomHeading API,.
  // Sets the help text of the Node, this most often corresponds to description text.
  // Emits an event when the focus highlight is changed.
  // Fired when the PDOM Displays for this Node have changed (see PDOMInstance)
  // PDOM specific enabled listener
  constructor(options) {
    super(options);
    this._tagName = null;
    this._containerTagName = null;
    this._labelTagName = null;
    this._descriptionTagName = null;
    this._inputType = null;
    this._inputValue = null;
    this._pdomChecked = false;
    this._appendLabel = false;
    this._appendDescription = false;
    this._pdomAttributes = [];
    this._pdomClasses = [];
    this._labelContent = null;
    this._innerContentProperty = new TinyForwardingProperty(null, false);
    this._innerContentProperty.lazyLink(this.onInnerContentPropertyChange.bind(this));
    this._descriptionContent = null;
    this._pdomNamespace = null;
    this._ariaLabel = null;
    this._ariaRole = null;
    this._containerAriaRole = null;
    this._ariaValueText = null;
    this._ariaLabelledbyAssociations = [];
    this._nodesThatAreAriaLabelledbyThisNode = [];
    this._ariaDescribedbyAssociations = [];
    this._nodesThatAreAriaDescribedbyThisNode = [];
    this._activeDescendantAssociations = [];
    this._nodesThatAreActiveDescendantToThisNode = [];
    this._focusableOverride = null;
    this._focusHighlight = null;
    this._focusHighlightLayerable = false;
    this._groupFocusHighlight = false;
    this._pdomVisible = true;
    this._pdomOrder = null;
    this._pdomParent = null;
    this._pdomTransformSourceNode = null;
    this._pdomDisplaysInfo = new PDOMDisplaysInfo(this);
    this._pdomInstances = [];
    this._positionInPDOM = false;
    this.excludeLabelSiblingFromInput = false;

    // HIGHER LEVEL API INITIALIZATION

    this._accessibleName = null;
    this._accessibleNameBehavior = ParallelDOM.BASIC_ACCESSIBLE_NAME_BEHAVIOR;
    this._helpText = null;
    this._helpTextBehavior = ParallelDOM.HELP_TEXT_AFTER_CONTENT;
    this._pdomHeading = null;
    this._headingLevel = null;
    this._pdomHeadingBehavior = DEFAULT_PDOM_HEADING_BEHAVIOR;
    this.focusHighlightChangedEmitter = new TinyEmitter();
    this.pdomDisplaysEmitter = new TinyEmitter();
    this.pdomBoundInputEnabledListener = this.pdomInputEnabledListener.bind(this);
  }

  /***********************************************************************************************************/
  // PUBLIC METHODS
  /***********************************************************************************************************/

  /**
   * Dispose accessibility by removing all listeners on this node for accessible input. ParallelDOM is disposed
   * by calling Node.dispose(), so this function is scenery-internal.
   * (scenery-internal)
   */
  disposeParallelDOM() {
    this.inputEnabledProperty.unlink(this.pdomBoundInputEnabledListener);

    // To prevent memory leaks, we want to clear our order (since otherwise nodes in our order will reference
    // this node).
    this.pdomOrder = null;

    // clear references to the pdomTransformSourceNode
    this.setPDOMTransformSourceNode(null);

    // Clear out aria association attributes, which hold references to other nodes.
    this.setAriaLabelledbyAssociations([]);
    this.setAriaDescribedbyAssociations([]);
    this.setActiveDescendantAssociations([]);
    this._innerContentProperty.dispose();
  }
  pdomInputEnabledListener(enabled) {
    // Mark this Node as disabled in the ParallelDOM
    this.setPDOMAttribute('aria-disabled', !enabled);

    // By returning false, we prevent the component from toggling native HTML element attributes that convey state.
    // For example,this will prevent a checkbox from changing `checked` property while it is disabled. This way
    // we can keep the component in traversal order and don't need to add the `disabled` attribute. See
    // https://github.com/phetsims/sun/issues/519 and https://github.com/phetsims/sun/issues/640
    // This solution was found at https://stackoverflow.com/a/12267350/3408502
    this.setPDOMAttribute('onclick', enabled ? '' : 'return false');
  }

  /**
   * Get whether this Node's primary DOM element currently has focus.
   */
  isFocused() {
    for (let i = 0; i < this._pdomInstances.length; i++) {
      const peer = this._pdomInstances[i].peer;
      if (peer.isFocused()) {
        return true;
      }
    }
    return false;
  }
  get focused() {
    return this.isFocused();
  }

  /**
   * Focus this node's primary dom element. The element must not be hidden, and it must be focusable. If the node
   * has more than one instance, this will fail because the DOM element is not uniquely defined. If accessibility
   * is not enabled, this will be a no op. When ParallelDOM is more widely used, the no op can be replaced
   * with an assertion that checks for pdom content.
   */
  focus() {
    // if a sim is running without accessibility enabled, there will be no accessible instances, but focus() might
    // still be called without accessibility enabled
    if (this._pdomInstances.length > 0) {
      // when accessibility is widely used, this assertion can be added back in
      // assert && assert( this._pdomInstances.length > 0, 'there must be pdom content for the node to receive focus' );
      assert && assert(this.focusable, 'trying to set focus on a node that is not focusable');
      assert && assert(this._pdomVisible, 'trying to set focus on a node with invisible pdom content');
      assert && assert(this._pdomInstances.length === 1, 'focus() unsupported for Nodes using DAG, pdom content is not unique');
      const peer = this._pdomInstances[0].peer;
      assert && assert(peer, 'must have a peer to focus');
      peer.focus();
    }
  }

  /**
   * Remove focus from this node's primary DOM element.  The focus highlight will disappear, and the element will not receive
   * keyboard events when it doesn't have focus.
   */
  blur() {
    if (this._pdomInstances.length > 0) {
      assert && assert(this._pdomInstances.length === 1, 'blur() unsupported for Nodes using DAG, pdom content is not unique');
      const peer = this._pdomInstances[0].peer;
      assert && assert(peer, 'must have a peer to blur');
      peer.blur();
    }
  }

  /**
   * Called when assertions are enabled and once the Node has been completely constructed. This is the time to
   * make sure that options are set up the way they are expected to be. For example. you don't want accessibleName
   * and labelContent declared.
   * (only called by Screen.js)
   */
  pdomAudit() {
    if (this.hasPDOMContent && assert) {
      this._inputType && assert(this._tagName.toUpperCase() === INPUT_TAG, 'tagName must be INPUT to support inputType');
      this._pdomChecked && assert(this._tagName.toUpperCase() === INPUT_TAG, 'tagName must be INPUT to support pdomChecked.');
      this._inputValue && assert(this._tagName.toUpperCase() === INPUT_TAG, 'tagName must be INPUT to support inputValue');
      this._pdomChecked && assert(INPUT_TYPES_THAT_SUPPORT_CHECKED.includes(this._inputType.toUpperCase()), `inputType does not support checked attribute: ${this._inputType}`);
      this._focusHighlightLayerable && assert(this.focusHighlight instanceof Node, 'focusHighlight must be Node if highlight is layerable');
      this._tagName.toUpperCase() === INPUT_TAG && assert(typeof this._inputType === 'string', ' inputType expected for input');

      // note that most things that are not focusable by default need innerContent to be focusable on VoiceOver,
      // but this will catch most cases since often things that get added to the focus order have the application
      // role for custom input. Note that accessibleName will not be checked that it specifically changes innerContent, it is up to the dev to do this.
      this.ariaRole === 'application' && assert(this._innerContentProperty.value || this._accessibleName, 'must have some innerContent or element will never be focusable in VoiceOver');
    }
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].pdomAudit();
    }
  }

  /***********************************************************************************************************/
  // HIGHER LEVEL API: GETTERS AND SETTERS FOR PDOM API OPTIONS
  //
  // These functions utilize the lower level API to achieve a consistence, and convenient API for adding
  // pdom content to the PDOM. See https://github.com/phetsims/scenery/issues/795
  /***********************************************************************************************************/

  /**
   * Set the Node's pdom content in a way that will define the Accessible Name for the browser. Different
   * HTML components and code situations require different methods of setting the Accessible Name. See
   * setAccessibleNameBehavior for details on how this string is rendered in the PDOM. Setting to null will clear
   * this Node's accessibleName
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely). Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */
  setAccessibleName(providedAccessibleName) {
    // If it's a Property, we'll just grab the initial value. See https://github.com/phetsims/scenery/issues/1442
    const accessibleName = unwrapProperty(providedAccessibleName);
    if (this._accessibleName !== accessibleName) {
      this._accessibleName = accessibleName;
      this.onPDOMContentChange();
    }
  }
  set accessibleName(accessibleName) {
    this.setAccessibleName(accessibleName);
  }
  get accessibleName() {
    return this.getAccessibleName();
  }

  /**
   * Get the tag name of the DOM element representing this node for accessibility.
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely). Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */
  getAccessibleName() {
    return this._accessibleName;
  }

  /**
   * Remove this Node from the PDOM by clearing its pdom content. This can be useful when creating icons from
   * pdom content.
   */
  removeFromPDOM() {
    assert && assert(this._tagName !== null, 'There is no pdom content to clear from the PDOM');
    this.tagName = null;
  }

  /**
   * accessibleNameBehavior is a function that will set the appropriate options on this node to get the desired
   * "Accessible Name"
   *
   * This accessibleNameBehavior's default does the best it can to create a general method to set the Accessible
   * Name for a variety of different Node types and configurations, but if a Node is more complicated, then this
   * method will not properly set the Accessible Name for the Node's HTML content. In this situation this function
   * needs to be overridden by the subtype to meet its specific constraints. When doing this make it is up to the
   * usage site to make sure that the Accessible Name is properly being set and conveyed to AT, as it is very hard
   * to validate this function.
   *
   * NOTE: By Accessible Name (capitalized), we mean the proper title of the HTML element that will be set in
   * the browser ParallelDOM Tree and then interpreted by AT. This is necessily different from scenery internal
   * names of HTML elements like "label sibling" (even though, in certain circumstances, an Accessible Name could
   * be set by using the "label sibling" with tag name "label" and a "for" attribute).
   *
   * For more information about setting an Accessible Name on HTML see the scenery docs for accessibility,
   * and see https://developer.paciellogroup.com/blog/2017/04/what-is-an-accessible-name/
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */
  setAccessibleNameBehavior(accessibleNameBehavior) {
    if (this._accessibleNameBehavior !== accessibleNameBehavior) {
      this._accessibleNameBehavior = accessibleNameBehavior;
      this.onPDOMContentChange();
    }
  }
  set accessibleNameBehavior(accessibleNameBehavior) {
    this.setAccessibleNameBehavior(accessibleNameBehavior);
  }
  get accessibleNameBehavior() {
    return this.getAccessibleNameBehavior();
  }

  /**
   * Get the help text of the interactive element.
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */
  getAccessibleNameBehavior() {
    return this._accessibleNameBehavior;
  }

  /**
   * Set the Node heading content. This by default will be a heading tag whose level is dependent on how many parents
   * Nodes are heading nodes. See computeHeadingLevel() for more info
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */
  setPDOMHeading(providedPdomHeading) {
    // If it's a Property, we'll just grab the initial value. See https://github.com/phetsims/scenery/issues/1442
    const pdomHeading = unwrapProperty(providedPdomHeading);
    if (this._pdomHeading !== pdomHeading) {
      this._pdomHeading = pdomHeading;
      this.onPDOMContentChange();
    }
  }
  set pdomHeading(pdomHeading) {
    this.setPDOMHeading(pdomHeading);
  }
  get pdomHeading() {
    return this.getPDOMHeading();
  }

  /**
   * Get the value of this Node's heading. Use null to clear the heading
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */
  getPDOMHeading() {
    return this._pdomHeading;
  }

  /**
   * Set the behavior of how `this.pdomHeading` is set in the PDOM. See default behavior function for more
   * information.
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */
  setPDOMHeadingBehavior(pdomHeadingBehavior) {
    if (this._pdomHeadingBehavior !== pdomHeadingBehavior) {
      this._pdomHeadingBehavior = pdomHeadingBehavior;
      this.onPDOMContentChange();
    }
  }
  set pdomHeadingBehavior(pdomHeadingBehavior) {
    this.setPDOMHeadingBehavior(pdomHeadingBehavior);
  }
  get pdomHeadingBehavior() {
    return this.getPDOMHeadingBehavior();
  }

  /**
   * Get the help text of the interactive element.
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */
  getPDOMHeadingBehavior() {
    return this._pdomHeadingBehavior;
  }

  /**
   * Get the tag name of the DOM element representing this node for accessibility.
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */
  getHeadingLevel() {
    return this._headingLevel;
  }
  get headingLevel() {
    return this.getHeadingLevel();
  }

  /**
   // TODO: what if ancestor changes, see https://github.com/phetsims/scenery/issues/855
   * Sets this Node's heading level, by recursing up the accessibility tree to find headings this Node
   * is nested under.
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */
  computeHeadingLevel() {
    // TODO: assert??? assert( this.headingLevel || this._pdomParent); see https://github.com/phetsims/scenery/issues/855
    // Either ^ which may break during construction, or V (below)
    //  base case to heading level 1
    if (!this._pdomParent) {
      if (this._pdomHeading) {
        this._headingLevel = 1;
        return 1;
      }
      return 0; // so that the first node with a heading is headingLevel 1
    }

    if (this._pdomHeading) {
      const level = this._pdomParent.computeHeadingLevel() + 1;
      this._headingLevel = level;
      return level;
    } else {
      return this._pdomParent.computeHeadingLevel();
    }
  }

  /**
   * Set the help text for a Node. See setAccessibleNameBehavior for details on how this string is
   * rendered in the PDOM. Null will clear the help text for this Node.
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */
  setHelpText(providedHelpText) {
    // If it's a Property, we'll just grab the initial value. See https://github.com/phetsims/scenery/issues/1442
    const helpText = unwrapProperty(providedHelpText);
    if (this._helpText !== helpText) {
      this._helpText = helpText;
      this.onPDOMContentChange();
    }
  }
  set helpText(helpText) {
    this.setHelpText(helpText);
  }
  get helpText() {
    return this.getHelpText();
  }

  /**
   * Get the help text of the interactive element.
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */
  getHelpText() {
    return this._helpText;
  }

  /**
   * helpTextBehavior is a function that will set the appropriate options on this node to get the desired
   * "Help Text".
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */
  setHelpTextBehavior(helpTextBehavior) {
    if (this._helpTextBehavior !== helpTextBehavior) {
      this._helpTextBehavior = helpTextBehavior;
      this.onPDOMContentChange();
    }
  }
  set helpTextBehavior(helpTextBehavior) {
    this.setHelpTextBehavior(helpTextBehavior);
  }
  get helpTextBehavior() {
    return this.getHelpTextBehavior();
  }

  /**
   * Get the help text of the interactive element.
   *
   * @experimental - NOTE: use with caution, a11y team reserves the right to change API (though unlikely).
   *                 Not yet fully implemented, see https://github.com/phetsims/scenery/issues/867
   */
  getHelpTextBehavior() {
    return this._helpTextBehavior;
  }

  /***********************************************************************************************************/
  // LOWER LEVEL GETTERS AND SETTERS FOR PDOM API OPTIONS
  /***********************************************************************************************************/

  /**
   * Set the tag name for the primary sibling in the PDOM. DOM element tag names are read-only, so this
   * function will create a new DOM element each time it is called for the Node's PDOMPeer and
   * reset the pdom content.
   *
   * This is the "entry point" for Parallel DOM content. When a Node has a tagName it will appear in the Parallel DOM
   * and other attributes can be set. Without it, nothing will appear in the Parallel DOM.
   */
  setTagName(tagName) {
    assert && assert(tagName === null || typeof tagName === 'string');
    if (tagName !== this._tagName) {
      this._tagName = tagName;

      // TODO: this could be setting PDOM content twice
      this.onPDOMContentChange();
    }
  }
  set tagName(tagName) {
    this.setTagName(tagName);
  }
  get tagName() {
    return this.getTagName();
  }

  /**
   * Get the tag name of the DOM element representing this node for accessibility.
   */
  getTagName() {
    return this._tagName;
  }

  /**
   * Set the tag name for the accessible label sibling for this Node. DOM element tag names are read-only,
   * so this will require creating a new PDOMPeer for this Node (reconstructing all DOM Elements). If
   * labelContent is specified without calling this method, then the DEFAULT_LABEL_TAG_NAME will be used as the
   * tag name for the label sibling. Use null to clear the label sibling element from the PDOM.
   */
  setLabelTagName(tagName) {
    assert && assert(tagName === null || typeof tagName === 'string');
    if (tagName !== this._labelTagName) {
      this._labelTagName = tagName;
      this.onPDOMContentChange();
    }
  }
  set labelTagName(tagName) {
    this.setLabelTagName(tagName);
  }
  get labelTagName() {
    return this.getLabelTagName();
  }

  /**
   * Get the label sibling HTML tag name.
   */
  getLabelTagName() {
    return this._labelTagName;
  }

  /**
   * Set the tag name for the description sibling. HTML element tag names are read-only, so this will require creating
   * a new HTML element, and inserting it into the DOM. The tag name provided must support
   * innerHTML and textContent. If descriptionContent is specified without this option,
   * then descriptionTagName will be set to DEFAULT_DESCRIPTION_TAG_NAME.
   *
   * Passing 'null' will clear away the description sibling.
   */
  setDescriptionTagName(tagName) {
    assert && assert(tagName === null || typeof tagName === 'string');
    if (tagName !== this._descriptionTagName) {
      this._descriptionTagName = tagName;
      this.onPDOMContentChange();
    }
  }
  set descriptionTagName(tagName) {
    this.setDescriptionTagName(tagName);
  }
  get descriptionTagName() {
    return this.getDescriptionTagName();
  }

  /**
   * Get the HTML tag name for the description sibling.
   */
  getDescriptionTagName() {
    return this._descriptionTagName;
  }

  /**
   * Sets the type for an input element.  Element must have the INPUT tag name. The input attribute is not
   * specified as readonly, so invalidating pdom content is not necessary.
   */
  setInputType(inputType) {
    assert && assert(inputType === null || typeof inputType === 'string');
    assert && this.tagName && assert(this._tagName.toUpperCase() === INPUT_TAG, 'tag name must be INPUT to support inputType');
    if (inputType !== this._inputType) {
      this._inputType = inputType;
      for (let i = 0; i < this._pdomInstances.length; i++) {
        const peer = this._pdomInstances[i].peer;

        // remove the attribute if cleared by setting to 'null'
        if (inputType === null) {
          peer.removeAttributeFromElement('type');
        } else {
          peer.setAttributeToElement('type', inputType);
        }
      }
    }
  }
  set inputType(inputType) {
    this.setInputType(inputType);
  }
  get inputType() {
    return this.getInputType();
  }

  /**
   * Get the input type. Input type is only relevant if this Node's primary sibling has tag name "INPUT".
   */
  getInputType() {
    return this._inputType;
  }

  /**
   * By default the label will be prepended before the primary sibling in the PDOM. This
   * option allows you to instead have the label added after the primary sibling. Note: The label will always
   * be in front of the description sibling. If this flag is set with `appendDescription`, the order will be
   *
   * <container>
   *   <primary sibling/>
   *   <label sibling/>
   *   <description sibling/>
   * </container>
   */
  setAppendLabel(appendLabel) {
    if (this._appendLabel !== appendLabel) {
      this._appendLabel = appendLabel;
      this.onPDOMContentChange();
    }
  }
  set appendLabel(appendLabel) {
    this.setAppendLabel(appendLabel);
  }
  get appendLabel() {
    return this.getAppendLabel();
  }

  /**
   * Get whether the label sibling should be appended after the primary sibling.
   */
  getAppendLabel() {
    return this._appendLabel;
  }

  /**
   * By default the label will be prepended before the primary sibling in the PDOM. This
   * option allows you to instead have the label added after the primary sibling. Note: The label will always
   * be in front of the description sibling. If this flag is set with `appendLabel`, the order will be
   *
   * <container>
   *   <primary sibling/>
   *   <label sibling/>
   *   <description sibling/>
   * </container>
   */
  setAppendDescription(appendDescription) {
    if (this._appendDescription !== appendDescription) {
      this._appendDescription = appendDescription;
      this.onPDOMContentChange();
    }
  }
  set appendDescription(appendDescription) {
    this.setAppendDescription(appendDescription);
  }
  get appendDescription() {
    return this.getAppendDescription();
  }

  /**
   * Get whether the description sibling should be appended after the primary sibling.
   */
  getAppendDescription() {
    return this._appendDescription;
  }

  /**
   * Set the container parent tag name. By specifying this container parent, an element will be created that
   * acts as a container for this Node's primary sibling DOM Element and its label and description siblings.
   * This containerTagName will default to DEFAULT_LABEL_TAG_NAME, and be added to the PDOM automatically if
   * more than just the primary sibling is created.
   *
   * For instance, a button element with a label and description will be contained like the following
   * if the containerTagName is specified as 'section'.
   *
   * <section id='parent-container-trail-id'>
   *   <button>Press me!</button>
   *   <p>Button label</p>
   *   <p>Button description</p>
   * </section>
   */
  setContainerTagName(tagName) {
    assert && assert(tagName === null || typeof tagName === 'string', `invalid tagName argument: ${tagName}`);
    if (this._containerTagName !== tagName) {
      this._containerTagName = tagName;
      this.onPDOMContentChange();
    }
  }
  set containerTagName(tagName) {
    this.setContainerTagName(tagName);
  }
  get containerTagName() {
    return this.getContainerTagName();
  }

  /**
   * Get the tag name for the container parent element.
   */
  getContainerTagName() {
    return this._containerTagName;
  }

  /**
   * Set the content of the label sibling for the this node.  The label sibling will default to the value of
   * DEFAULT_LABEL_TAG_NAME if no `labelTagName` is provided. If the label sibling is a `LABEL` html element,
   * then the `for` attribute will automatically be added, pointing to the Node's primary sibling.
   *
   * This method supports adding content in two ways, with HTMLElement.textContent and HTMLElement.innerHTML.
   * The DOM setter is chosen based on if the label passes the `containsFormattingTags`.
   *
   * Passing a null label value will not clear the whole label sibling, just the inner content of the DOM Element.
   */
  setLabelContent(providedLabel) {
    // If it's a Property, we'll just grab the initial value. See https://github.com/phetsims/scenery/issues/1442
    const label = unwrapProperty(providedLabel);
    if (this._labelContent !== label) {
      this._labelContent = label;

      // if trying to set labelContent, make sure that there is a labelTagName default
      if (!this._labelTagName) {
        this.setLabelTagName(DEFAULT_LABEL_TAG_NAME);
      }
      for (let i = 0; i < this._pdomInstances.length; i++) {
        const peer = this._pdomInstances[i].peer;
        peer.setLabelSiblingContent(this._labelContent);
      }
    }
  }
  set labelContent(label) {
    this.setLabelContent(label);
  }
  get labelContent() {
    return this.getLabelContent();
  }

  /**
   * Get the content for this Node's label sibling DOM element.
   */
  getLabelContent() {
    return this._labelContent;
  }

  /**
   * Set the inner content for the primary sibling of the PDOMPeers of this Node. Will be set as textContent
   * unless content is html which uses exclusively formatting tags. A node with inner content cannot
   * have accessible descendants because this content will override the HTML of descendants of this node.
   */
  setInnerContent(providedContent) {
    this._innerContentProperty.setValueOrTargetProperty(this, null, providedContent);
  }
  set innerContent(content) {
    this.setInnerContent(content);
  }
  get innerContent() {
    return this.getInnerContent();
  }

  /**
   * Get the inner content, the string that is the innerHTML or innerText for the Node's primary sibling.
   */
  getInnerContent() {
    return this._innerContentProperty.value;
  }
  onInnerContentPropertyChange(value) {
    for (let i = 0; i < this._pdomInstances.length; i++) {
      const peer = this._pdomInstances[i].peer;
      peer.setPrimarySiblingContent(value);
    }
  }

  /**
   * Set the description content for this Node's primary sibling. The description sibling tag name must support
   * innerHTML and textContent. If a description element does not exist yet, a default
   * DEFAULT_LABEL_TAG_NAME will be assigned to the descriptionTagName.
   */
  setDescriptionContent(providedDescriptionContent) {
    // If it's a Property, we'll just grab the initial value. See https://github.com/phetsims/scenery/issues/1442
    const descriptionContent = unwrapProperty(providedDescriptionContent);
    if (this._descriptionContent !== descriptionContent) {
      this._descriptionContent = descriptionContent;

      // if there is no description element, assume that a paragraph element should be used
      if (!this._descriptionTagName) {
        this.setDescriptionTagName(DEFAULT_DESCRIPTION_TAG_NAME);
      }
      for (let i = 0; i < this._pdomInstances.length; i++) {
        const peer = this._pdomInstances[i].peer;
        peer.setDescriptionSiblingContent(this._descriptionContent);
      }
    }
  }
  set descriptionContent(textContent) {
    this.setDescriptionContent(textContent);
  }
  get descriptionContent() {
    return this.getDescriptionContent();
  }

  /**
   * Get the content for this Node's description sibling DOM Element.
   */
  getDescriptionContent() {
    return this._descriptionContent;
  }

  /**
   * Set the ARIA role for this Node's primary sibling. According to the W3C, the ARIA role is read-only for a DOM
   * element.  So this will create a new DOM element for this Node with the desired role, and replace the old
   * element in the DOM. Note that the aria role can completely change the events that fire from an element,
   * especially when using a screen reader. For example, a role of `application` will largely bypass the default
   * behavior and logic of the screen reader, triggering keydown/keyup events even for buttons that would usually
   * only receive a "click" event.
   *
   * @param ariaRole - role for the element, see
   *                            https://www.w3.org/TR/html-aria/#allowed-aria-roles-states-and-properties
   *                            for a list of roles, states, and properties.
   */
  setAriaRole(ariaRole) {
    assert && assert(ariaRole === null || typeof ariaRole === 'string');
    if (this._ariaRole !== ariaRole) {
      this._ariaRole = ariaRole;
      if (ariaRole !== null) {
        this.setPDOMAttribute('role', ariaRole);
      } else {
        this.removePDOMAttribute('role');
      }
    }
  }
  set ariaRole(ariaRole) {
    this.setAriaRole(ariaRole);
  }
  get ariaRole() {
    return this.getAriaRole();
  }

  /**
   * Get the ARIA role representing this node.
   */
  getAriaRole() {
    return this._ariaRole;
  }

  /**
   * Set the ARIA role for this node's container parent element.  According to the W3C, the ARIA role is read-only
   * for a DOM element. This will create a new DOM element for the container parent with the desired role, and
   * replace it in the DOM.
   *
   * @param ariaRole - role for the element, see
   *                            https://www.w3.org/TR/html-aria/#allowed-aria-roles-states-and-properties
   *                            for a list of roles, states, and properties.
   */
  setContainerAriaRole(ariaRole) {
    assert && assert(ariaRole === null || typeof ariaRole === 'string');
    if (this._containerAriaRole !== ariaRole) {
      this._containerAriaRole = ariaRole;

      // clear out the attribute
      if (ariaRole === null) {
        this.removePDOMAttribute('role', {
          elementName: PDOMPeer.CONTAINER_PARENT
        });
      }

      // add the attribute
      else {
        this.setPDOMAttribute('role', ariaRole, {
          elementName: PDOMPeer.CONTAINER_PARENT
        });
      }
    }
  }
  set containerAriaRole(ariaRole) {
    this.setContainerAriaRole(ariaRole);
  }
  get containerAriaRole() {
    return this.getContainerAriaRole();
  }

  /**
   * Get the ARIA role assigned to the container parent element.
   */
  getContainerAriaRole() {
    return this._containerAriaRole;
  }

  /**
   * Set the aria-valuetext of this Node independently from the changing value, if necessary. Setting to null will
   * clear this attribute.
   */
  setAriaValueText(providedAriaValueText) {
    // If it's a Property, we'll just grab the initial value. See https://github.com/phetsims/scenery/issues/1442
    const ariaValueText = unwrapProperty(providedAriaValueText);
    if (this._ariaValueText !== ariaValueText) {
      this._ariaValueText = ariaValueText;
      if (ariaValueText === null) {
        this.removePDOMAttribute('aria-valuetext');
      } else {
        this.setPDOMAttribute('aria-valuetext', ariaValueText);
      }
    }
  }
  set ariaValueText(ariaValueText) {
    this.setAriaValueText(ariaValueText);
  }
  get ariaValueText() {
    return this.getAriaValueText();
  }

  /**
   * Get the value of the aria-valuetext attribute for this Node's primary sibling. If null, then the attribute
   * has not been set on the primary sibling.
   */
  getAriaValueText() {
    return this._ariaValueText;
  }

  /**
   * Sets the namespace for the primary element (relevant for MathML/SVG/etc.)
   *
   * For example, to create a MathML element:
   * { tagName: 'math', pdomNamespace: 'http://www.w3.org/1998/Math/MathML' }
   *
   * or for SVG:
   * { tagName: 'svg', pdomNamespace: 'http://www.w3.org/2000/svg' }
   *
   * @param pdomNamespace - Null indicates no namespace.
   */
  setPDOMNamespace(pdomNamespace) {
    assert && assert(pdomNamespace === null || typeof pdomNamespace === 'string');
    if (this._pdomNamespace !== pdomNamespace) {
      this._pdomNamespace = pdomNamespace;

      // If the namespace changes, tear down the view and redraw the whole thing, there is no easy mutable solution here.
      this.onPDOMContentChange();
    }
    return this;
  }
  set pdomNamespace(value) {
    this.setPDOMNamespace(value);
  }
  get pdomNamespace() {
    return this.getPDOMNamespace();
  }

  /**
   * Returns the accessible namespace (see setPDOMNamespace for more information).
   */
  getPDOMNamespace() {
    return this._pdomNamespace;
  }

  /**
   * Sets the 'aria-label' attribute for labelling the Node's primary sibling. By using the
   * 'aria-label' attribute, the label will be read on focus, but can not be found with the
   * virtual cursor. This is one way to set a DOM Element's Accessible Name.
   *
   * @param providedAriaLabel - the text for the aria label attribute
   */
  setAriaLabel(providedAriaLabel) {
    // If it's a Property, we'll just grab the initial value. See https://github.com/phetsims/scenery/issues/1442
    const ariaLabel = unwrapProperty(providedAriaLabel);
    if (this._ariaLabel !== ariaLabel) {
      this._ariaLabel = ariaLabel;
      if (ariaLabel === null) {
        this.removePDOMAttribute('aria-label');
      } else {
        this.setPDOMAttribute('aria-label', ariaLabel);
      }
    }
  }
  set ariaLabel(ariaLabel) {
    this.setAriaLabel(ariaLabel);
  }
  get ariaLabel() {
    return this.getAriaLabel();
  }

  /**
   * Get the value of the aria-label attribute for this Node's primary sibling.
   */
  getAriaLabel() {
    return this._ariaLabel;
  }

  /**
   * Set the focus highlight for this node. By default, the focus highlight will be a pink rectangle that
   * surrounds the node's local bounds.  If focus highlight is set to 'invisible', the node will not have
   * any highlighting when it receives focus.
   */
  setFocusHighlight(focusHighlight) {
    if (this._focusHighlight !== focusHighlight) {
      this._focusHighlight = focusHighlight;

      // if the focus highlight is layerable in the scene graph, update visibility so that it is only
      // visible when associated node has focus
      if (this._focusHighlightLayerable) {
        // if focus highlight is layerable, it must be a node in the scene graph
        assert && assert(focusHighlight instanceof Node); // eslint-disable-line no-simple-type-checking-assertions

        // the highlight starts off invisible, HighlightOverlay will make it visible when this Node has DOM focus
        focusHighlight.visible = false;
      }
      this.focusHighlightChangedEmitter.emit();
    }
  }
  set focusHighlight(focusHighlight) {
    this.setFocusHighlight(focusHighlight);
  }
  get focusHighlight() {
    return this.getFocusHighlight();
  }

  /**
   * Get the focus highlight for this node.
   */
  getFocusHighlight() {
    return this._focusHighlight;
  }

  /**
   * Setting a flag to break default and allow the focus highlight to be (z) layered into the scene graph.
   * This will set the visibility of the layered focus highlight, it will always be invisible until this node has
   * focus.
   */
  setFocusHighlightLayerable(focusHighlightLayerable) {
    if (this._focusHighlightLayerable !== focusHighlightLayerable) {
      this._focusHighlightLayerable = focusHighlightLayerable;

      // if a focus highlight is defined (it must be a node), update its visibility so it is linked to focus
      // of the associated node
      if (this._focusHighlight) {
        assert && assert(this._focusHighlight instanceof Node);
        this._focusHighlight.visible = false;

        // emit that the highlight has changed and we may need to update its visual representation
        this.focusHighlightChangedEmitter.emit();
      }
    }
  }
  set focusHighlightLayerable(focusHighlightLayerable) {
    this.setFocusHighlightLayerable(focusHighlightLayerable);
  }
  get focusHighlightLayerable() {
    return this.getFocusHighlightLayerable();
  }

  /**
   * Get the flag for if this node is layerable in the scene graph (or if it is always on top, like the default).
   */
  getFocusHighlightLayerable() {
    return this._focusHighlightLayerable;
  }

  /**
   * Set whether or not this node has a group focus highlight. If this node has a group focus highlight, an extra
   * focus highlight will surround this node whenever a descendant node has focus. Generally
   * useful to indicate nested keyboard navigation. If true, the group focus highlight will surround
   * this node's local bounds. Otherwise, the Node will be used.
   *
   * TODO: Support more than one group focus highlight (multiple ancestors could have groupFocusHighlight), see https://github.com/phetsims/scenery/issues/708
   */
  setGroupFocusHighlight(groupHighlight) {
    this._groupFocusHighlight = groupHighlight;
  }
  set groupFocusHighlight(groupHighlight) {
    this.setGroupFocusHighlight(groupHighlight);
  }
  get groupFocusHighlight() {
    return this.getGroupFocusHighlight();
  }

  /**
   * Get whether or not this node has a 'group' focus highlight, see setter for more information.
   */
  getGroupFocusHighlight() {
    return this._groupFocusHighlight;
  }

  /**
   * Very similar algorithm to setChildren in Node.js
   * @param ariaLabelledbyAssociations - list of associationObjects, see this._ariaLabelledbyAssociations.
   */
  setAriaLabelledbyAssociations(ariaLabelledbyAssociations) {
    let associationObject;
    let i;

    // validation if assert is enabled
    if (assert) {
      assert(Array.isArray(ariaLabelledbyAssociations));
      for (i = 0; i < ariaLabelledbyAssociations.length; i++) {
        associationObject = ariaLabelledbyAssociations[i];
      }
    }

    // no work to be done if both are empty, return early
    if (ariaLabelledbyAssociations.length === 0 && this._ariaLabelledbyAssociations.length === 0) {
      return;
    }
    const beforeOnly = []; // Will hold all nodes that will be removed.
    const afterOnly = []; // Will hold all nodes that will be "new" children (added)
    const inBoth = []; // Child nodes that "stay". Will be ordered for the "after" case.

    // get a difference of the desired new list, and the old
    arrayDifference(ariaLabelledbyAssociations, this._ariaLabelledbyAssociations, afterOnly, beforeOnly, inBoth);

    // remove each current associationObject that isn't in the new list
    for (i = 0; i < beforeOnly.length; i++) {
      associationObject = beforeOnly[i];
      this.removeAriaLabelledbyAssociation(associationObject);
    }
    assert && assert(this._ariaLabelledbyAssociations.length === inBoth.length, 'Removing associations should not have triggered other association changes');

    // add each association from the new list that hasn't been added yet
    for (i = 0; i < afterOnly.length; i++) {
      const ariaLabelledbyAssociation = ariaLabelledbyAssociations[i];
      this.addAriaLabelledbyAssociation(ariaLabelledbyAssociation);
    }
  }
  set ariaLabelledbyAssociations(ariaLabelledbyAssociations) {
    this.setAriaLabelledbyAssociations(ariaLabelledbyAssociations);
  }
  get ariaLabelledbyAssociations() {
    return this.getAriaLabelledbyAssociations();
  }
  getAriaLabelledbyAssociations() {
    return this._ariaLabelledbyAssociations;
  }

  /**
   * Add an aria-labelledby association to this node. The data in the associationObject will be implemented like
   * "a peer's HTMLElement of this Node (specified with the string constant stored in `thisElementName`) will have an
   * aria-labelledby attribute with a value that includes the `otherNode`'s peer HTMLElement's id (specified with
   * `otherElementName`)."
   *
   * There can be more than one association because an aria-labelledby attribute's value can be a space separated
   * list of HTML ids, and not just a single id, see https://www.w3.org/WAI/GL/wiki/Using_aria-labelledby_to_concatenate_a_label_from_several_text_nodes
   */
  addAriaLabelledbyAssociation(associationObject) {
    // TODO: assert if this associationObject is already in the association objects list! https://github.com/phetsims/scenery/issues/832

    this._ariaLabelledbyAssociations.push(associationObject); // Keep track of this association.

    // Flag that this node is is being labelled by the other node, so that if the other node changes it can tell
    // this node to restore the association appropriately.
    associationObject.otherNode._nodesThatAreAriaLabelledbyThisNode.push(this);
    this.updateAriaLabelledbyAssociationsInPeers();
  }

  /**
   * Remove an aria-labelledby association object, see addAriaLabelledbyAssociation for more details
   */
  removeAriaLabelledbyAssociation(associationObject) {
    assert && assert(_.includes(this._ariaLabelledbyAssociations, associationObject));

    // remove the
    const removedObject = this._ariaLabelledbyAssociations.splice(_.indexOf(this._ariaLabelledbyAssociations, associationObject), 1);

    // remove the reference from the other node back to this node because we don't need it anymore
    removedObject[0].otherNode.removeNodeThatIsAriaLabelledByThisNode(this);
    this.updateAriaLabelledbyAssociationsInPeers();
  }

  /**
   * Remove the reference to the node that is using this Node's ID as an aria-labelledby value (scenery-internal)
   */
  removeNodeThatIsAriaLabelledByThisNode(node) {
    const indexOfNode = _.indexOf(this._nodesThatAreAriaLabelledbyThisNode, node);
    assert && assert(indexOfNode >= 0);
    this._nodesThatAreAriaLabelledbyThisNode.splice(indexOfNode, 1);
  }

  /**
   * Trigger the view update for each PDOMPeer
   */
  updateAriaLabelledbyAssociationsInPeers() {
    for (let i = 0; i < this.pdomInstances.length; i++) {
      const peer = this.pdomInstances[i].peer;
      peer.onAriaLabelledbyAssociationChange();
    }
  }

  /**
   * Update the associations for aria-labelledby (scenery-internal)
   */
  updateOtherNodesAriaLabelledby() {
    // if any other nodes are aria-labelledby this Node, update those associations too. Since this node's
    // pdom content needs to be recreated, they need to update their aria-labelledby associations accordingly.
    for (let i = 0; i < this._nodesThatAreAriaLabelledbyThisNode.length; i++) {
      const otherNode = this._nodesThatAreAriaLabelledbyThisNode[i];
      otherNode.updateAriaLabelledbyAssociationsInPeers();
    }
  }

  /**
   * The list of Nodes that are aria-labelledby this node (other node's peer element will have this Node's Peer element's
   * id in the aria-labelledby attribute
   */
  getNodesThatAreAriaLabelledbyThisNode() {
    return this._nodesThatAreAriaLabelledbyThisNode;
  }
  get nodesThatAreAriaLabelledbyThisNode() {
    return this.getNodesThatAreAriaLabelledbyThisNode();
  }
  setAriaDescribedbyAssociations(ariaDescribedbyAssociations) {
    let associationObject;
    if (assert) {
      assert(Array.isArray(ariaDescribedbyAssociations));
      for (let j = 0; j < ariaDescribedbyAssociations.length; j++) {
        associationObject = ariaDescribedbyAssociations[j];
      }
    }

    // no work to be done if both are empty
    if (ariaDescribedbyAssociations.length === 0 && this._ariaDescribedbyAssociations.length === 0) {
      return;
    }
    const beforeOnly = []; // Will hold all nodes that will be removed.
    const afterOnly = []; // Will hold all nodes that will be "new" children (added)
    const inBoth = []; // Child nodes that "stay". Will be ordered for the "after" case.
    let i;

    // get a difference of the desired new list, and the old
    arrayDifference(ariaDescribedbyAssociations, this._ariaDescribedbyAssociations, afterOnly, beforeOnly, inBoth);

    // remove each current associationObject that isn't in the new list
    for (i = 0; i < beforeOnly.length; i++) {
      associationObject = beforeOnly[i];
      this.removeAriaDescribedbyAssociation(associationObject);
    }
    assert && assert(this._ariaDescribedbyAssociations.length === inBoth.length, 'Removing associations should not have triggered other association changes');

    // add each association from the new list that hasn't been added yet
    for (i = 0; i < afterOnly.length; i++) {
      const ariaDescribedbyAssociation = ariaDescribedbyAssociations[i];
      this.addAriaDescribedbyAssociation(ariaDescribedbyAssociation);
    }
  }
  set ariaDescribedbyAssociations(ariaDescribedbyAssociations) {
    this.setAriaDescribedbyAssociations(ariaDescribedbyAssociations);
  }
  get ariaDescribedbyAssociations() {
    return this.getAriaDescribedbyAssociations();
  }
  getAriaDescribedbyAssociations() {
    return this._ariaDescribedbyAssociations;
  }

  /**
   * Add an aria-describedby association to this node. The data in the associationObject will be implemented like
   * "a peer's HTMLElement of this Node (specified with the string constant stored in `thisElementName`) will have an
   * aria-describedby attribute with a value that includes the `otherNode`'s peer HTMLElement's id (specified with
   * `otherElementName`)."
   *
   * There can be more than one association because an aria-describedby attribute's value can be a space separated
   * list of HTML ids, and not just a single id, see https://www.w3.org/WAI/GL/wiki/Using_aria-labelledby_to_concatenate_a_label_from_several_text_nodes
   */
  addAriaDescribedbyAssociation(associationObject) {
    assert && assert(!_.includes(this._ariaDescribedbyAssociations, associationObject), 'describedby association already registed');
    this._ariaDescribedbyAssociations.push(associationObject); // Keep track of this association.

    // Flag that this node is is being described by the other node, so that if the other node changes it can tell
    // this node to restore the association appropriately.
    associationObject.otherNode._nodesThatAreAriaDescribedbyThisNode.push(this);

    // update the PDOMPeers with this aria-describedby association
    this.updateAriaDescribedbyAssociationsInPeers();
  }

  /**
   * Is this object already in the describedby association list
   */
  hasAriaDescribedbyAssociation(associationObject) {
    return _.includes(this._ariaDescribedbyAssociations, associationObject);
  }

  /**
   * Remove an aria-describedby association object, see addAriaDescribedbyAssociation for more details
   */
  removeAriaDescribedbyAssociation(associationObject) {
    assert && assert(_.includes(this._ariaDescribedbyAssociations, associationObject));

    // remove the
    const removedObject = this._ariaDescribedbyAssociations.splice(_.indexOf(this._ariaDescribedbyAssociations, associationObject), 1);

    // remove the reference from the other node back to this node because we don't need it anymore
    removedObject[0].otherNode.removeNodeThatIsAriaDescribedByThisNode(this);
    this.updateAriaDescribedbyAssociationsInPeers();
  }

  /**
   * Remove the reference to the node that is using this Node's ID as an aria-describedby value (scenery-internal)
   */
  removeNodeThatIsAriaDescribedByThisNode(node) {
    const indexOfNode = _.indexOf(this._nodesThatAreAriaDescribedbyThisNode, node);
    assert && assert(indexOfNode >= 0);
    this._nodesThatAreAriaDescribedbyThisNode.splice(indexOfNode, 1);
  }

  /**
   * Trigger the view update for each PDOMPeer
   */
  updateAriaDescribedbyAssociationsInPeers() {
    for (let i = 0; i < this.pdomInstances.length; i++) {
      const peer = this.pdomInstances[i].peer;
      peer.onAriaDescribedbyAssociationChange();
    }
  }

  /**
   * Update the associations for aria-describedby (scenery-internal)
   */
  updateOtherNodesAriaDescribedby() {
    // if any other nodes are aria-describedby this Node, update those associations too. Since this node's
    // pdom content needs to be recreated, they need to update their aria-describedby associations accordingly.
    // TODO: only use unique elements of the array (_.unique)
    for (let i = 0; i < this._nodesThatAreAriaDescribedbyThisNode.length; i++) {
      const otherNode = this._nodesThatAreAriaDescribedbyThisNode[i];
      otherNode.updateAriaDescribedbyAssociationsInPeers();
    }
  }

  /**
   * The list of Nodes that are aria-describedby this node (other node's peer element will have this Node's Peer element's
   * id in the aria-describedby attribute
   */
  getNodesThatAreAriaDescribedbyThisNode() {
    return this._nodesThatAreAriaDescribedbyThisNode;
  }
  get nodesThatAreAriaDescribedbyThisNode() {
    return this.getNodesThatAreAriaDescribedbyThisNode();
  }
  setActiveDescendantAssociations(activeDescendantAssociations) {
    let associationObject;
    if (assert) {
      assert(Array.isArray(activeDescendantAssociations));
      for (let j = 0; j < activeDescendantAssociations.length; j++) {
        associationObject = activeDescendantAssociations[j];
      }
    }

    // no work to be done if both are empty, safe to return early
    if (activeDescendantAssociations.length === 0 && this._activeDescendantAssociations.length === 0) {
      return;
    }
    const beforeOnly = []; // Will hold all nodes that will be removed.
    const afterOnly = []; // Will hold all nodes that will be "new" children (added)
    const inBoth = []; // Child nodes that "stay". Will be ordered for the "after" case.
    let i;

    // get a difference of the desired new list, and the old
    arrayDifference(activeDescendantAssociations, this._activeDescendantAssociations, afterOnly, beforeOnly, inBoth);

    // remove each current associationObject that isn't in the new list
    for (i = 0; i < beforeOnly.length; i++) {
      associationObject = beforeOnly[i];
      this.removeActiveDescendantAssociation(associationObject);
    }
    assert && assert(this._activeDescendantAssociations.length === inBoth.length, 'Removing associations should not have triggered other association changes');

    // add each association from the new list that hasn't been added yet
    for (i = 0; i < afterOnly.length; i++) {
      const activeDescendantAssociation = activeDescendantAssociations[i];
      this.addActiveDescendantAssociation(activeDescendantAssociation);
    }
  }
  set activeDescendantAssociations(activeDescendantAssociations) {
    this.setActiveDescendantAssociations(activeDescendantAssociations);
  }
  get activeDescendantAssociations() {
    return this.getActiveDescendantAssociations();
  }
  getActiveDescendantAssociations() {
    return this._activeDescendantAssociations;
  }

  /**
   * Add an aria-activeDescendant association to this node. The data in the associationObject will be implemented like
   * "a peer's HTMLElement of this Node (specified with the string constant stored in `thisElementName`) will have an
   * aria-activeDescendant attribute with a value that includes the `otherNode`'s peer HTMLElement's id (specified with
   * `otherElementName`)."
   */
  addActiveDescendantAssociation(associationObject) {
    // TODO: assert if this associationObject is already in the association objects list! https://github.com/phetsims/scenery/issues/832
    this._activeDescendantAssociations.push(associationObject); // Keep track of this association.

    // Flag that this node is is being described by the other node, so that if the other node changes it can tell
    // this node to restore the association appropriately.
    associationObject.otherNode._nodesThatAreActiveDescendantToThisNode.push(this);

    // update the pdomPeers with this aria-activeDescendant association
    this.updateActiveDescendantAssociationsInPeers();
  }

  /**
   * Remove an aria-activeDescendant association object, see addActiveDescendantAssociation for more details
   */
  removeActiveDescendantAssociation(associationObject) {
    assert && assert(_.includes(this._activeDescendantAssociations, associationObject));

    // remove the
    const removedObject = this._activeDescendantAssociations.splice(_.indexOf(this._activeDescendantAssociations, associationObject), 1);

    // remove the reference from the other node back to this node because we don't need it anymore
    removedObject[0].otherNode.removeNodeThatIsActiveDescendantThisNode(this);
    this.updateActiveDescendantAssociationsInPeers();
  }

  /**
   * Remove the reference to the node that is using this Node's ID as an aria-activeDescendant value (scenery-internal)
   */
  removeNodeThatIsActiveDescendantThisNode(node) {
    const indexOfNode = _.indexOf(this._nodesThatAreActiveDescendantToThisNode, node);
    assert && assert(indexOfNode >= 0);
    this._nodesThatAreActiveDescendantToThisNode.splice(indexOfNode, 1);
  }

  /**
   * Trigger the view update for each PDOMPeer
   */
  updateActiveDescendantAssociationsInPeers() {
    for (let i = 0; i < this.pdomInstances.length; i++) {
      const peer = this.pdomInstances[i].peer;
      peer.onActiveDescendantAssociationChange();
    }
  }

  /**
   * Update the associations for aria-activeDescendant (scenery-internal)
   */
  updateOtherNodesActiveDescendant() {
    // if any other nodes are aria-activeDescendant this Node, update those associations too. Since this node's
    // pdom content needs to be recreated, they need to update their aria-activeDescendant associations accordingly.
    // TODO: only use unique elements of the array (_.unique)
    for (let i = 0; i < this._nodesThatAreActiveDescendantToThisNode.length; i++) {
      const otherNode = this._nodesThatAreActiveDescendantToThisNode[i];
      otherNode.updateActiveDescendantAssociationsInPeers();
    }
  }

  /**
   * The list of Nodes that are aria-activeDescendant this node (other node's peer element will have this Node's Peer element's
   * id in the aria-activeDescendant attribute
   */
  getNodesThatAreActiveDescendantToThisNode() {
    return this._nodesThatAreActiveDescendantToThisNode;
  }
  get nodesThatAreActiveDescendantToThisNode() {
    return this.getNodesThatAreActiveDescendantToThisNode();
  }

  /**
   * Sets the PDOM/DOM order for this Node. This includes not only focused items, but elements that can be
   * placed in the Parallel DOM. If provided, it will override the focus order between children (and
   * optionally arbitrary subtrees). If not provided, the focus order will default to the rendering order
   * (first children first, last children last), determined by the children array. A Node must be conected to a scene
   * graph (via children) in order for PDOM order to apply. Thus `setPDOMOrder` cannot be used in exchange for
   * setting a node as a child.
   *
   * In the general case, when an pdom order is specified, it's an array of nodes, with optionally one
   * element being a placeholder for "the rest of the children", signified by null. This means that, for
   * accessibility, it will act as if the children for this node WERE the pdomOrder (potentially
   * supplemented with other children via the placeholder).
   *
   * For example, if you have the tree:
   *   a
   *     b
   *       d
   *       e
   *     c
   *       g
   *       f
   *         h
   *
   * and we specify b.pdomOrder = [ e, f, d, c ], then the pdom structure will act as if the tree is:
   *  a
   *    b
   *      e
   *      f <--- the entire subtree of `f` gets placed here under `b`, pulling it out from where it was before.
   *        h
   *      d
   *      c <--- note that `g` is NOT under `c` anymore, because it got pulled out under b directly
   *        g
   *
   * The placeholder (`null`) will get filled in with all direct children that are NOT in any pdomOrder.
   * If there is no placeholder specified, it will act as if the placeholder is at the end of the order.
   * The value `null` (the default) and the empty array (`[]`) both act as if the only order is the placeholder,
   * i.e. `[null]`.
   *
   * Some general constraints for the orders are:
   * - Nodes must be attached to a Display (in a scene graph) to be shown in an pdom order.
   * - You can't specify a node in more than one pdomOrder, and you can't specify duplicates of a value
   *   in an pdomOrder.
   * - You can't specify an ancestor of a node in that node's pdomOrder
   *   (e.g. this.pdomOrder = this.parents ).
   *
   * Note that specifying something in an pdomOrder will effectively remove it from all of its parents for
   * the pdom tree (so if you create `tmpNode.pdomOrder = [ a ]` then toss the tmpNode without
   * disposing it, `a` won't show up in the parallel DOM). If there is a need for that, disposing a Node
   * effectively removes its pdomOrder.
   *
   * See https://github.com/phetsims/scenery-phet/issues/365#issuecomment-381302583 for more information on the
   * decisions and design for this feature.
   */
  setPDOMOrder(pdomOrder) {
    assert && assert(Array.isArray(pdomOrder) || pdomOrder === null, `Array or null expected, received: ${pdomOrder}`);
    assert && pdomOrder && pdomOrder.forEach((node, index) => {
      assert && assert(node === null || node instanceof Node, `Elements of pdomOrder should be either a Node or null. Element at index ${index} is: ${node}`);
    });
    assert && pdomOrder && assert(this.getTrails(node => _.includes(pdomOrder, node)).length === 0, 'pdomOrder should not include any ancestors or the node itself');

    // Only update if it has changed
    if (this._pdomOrder !== pdomOrder) {
      const oldPDOMOrder = this._pdomOrder;

      // Store our own reference to this, so client modifications to the input array won't silently break things.
      // See https://github.com/phetsims/scenery/issues/786
      this._pdomOrder = pdomOrder === null ? null : pdomOrder.slice();
      PDOMTree.pdomOrderChange(this, oldPDOMOrder, pdomOrder);
      this.rendererSummaryRefreshEmitter.emit();
    }
  }
  set pdomOrder(value) {
    this.setPDOMOrder(value);
  }
  get pdomOrder() {
    return this.getPDOMOrder();
  }

  /**
   * Returns the pdom (focus) order for this node.
   * If there is an existing array, this returns a copy of that array. This is important because clients may then
   * modify the array, and call setPDOMOrder - which is a no-op unless the array reference is different.
   */
  getPDOMOrder() {
    if (this._pdomOrder) {
      return this._pdomOrder.slice(0); // create a defensive copy
    }

    return this._pdomOrder;
  }

  /**
   * Returns whether this node has an pdomOrder that is effectively different than the default.
   *
   * NOTE: `null`, `[]` and `[null]` are all effectively the same thing, so this will return true for any of
   * those. Usage of `null` is recommended, as it doesn't create the extra object reference (but some code
   * that generates arrays may be more convenient).
   */
  hasPDOMOrder() {
    return this._pdomOrder !== null && this._pdomOrder.length !== 0 && (this._pdomOrder.length > 1 || this._pdomOrder[0] !== null);
  }

  /**
   * Returns our "PDOM parent" if available: the node that specifies this node in its pdomOrder.
   */
  getPDOMParent() {
    return this._pdomParent;
  }
  get pdomParent() {
    return this.getPDOMParent();
  }

  /**
   * Returns the "effective" pdom children for the node (which may be different based on the order or other
   * excluded subtrees).
   *
   * If there is no pdomOrder specified, this is basically "all children that don't have pdom parents"
   * (a Node has a "PDOM parent" if it is specified in an pdomOrder).
   *
   * Otherwise (if it has an pdomOrder), it is the pdomOrder, with the above list of nodes placed
   * in at the location of the placeholder. If there is no placeholder, it acts like a placeholder was the last
   * element of the pdomOrder (see setPDOMOrder for more documentation information).
   *
   * NOTE: If you specify a child in the pdomOrder, it will NOT be double-included (since it will have an
   * PDOM parent).
   *
   * (scenery-internal)
   */
  getEffectiveChildren() {
    // Find all children without PDOM parents.
    const nonOrderedChildren = [];
    for (let i = 0; i < this._children.length; i++) {
      const child = this._children[i];
      if (!child._pdomParent) {
        nonOrderedChildren.push(child);
      }
    }

    // Override the order, and replace the placeholder if it exists.
    if (this.hasPDOMOrder()) {
      const effectiveChildren = this.pdomOrder.slice();
      const placeholderIndex = effectiveChildren.indexOf(null);

      // If we have a placeholder, replace its content with the children
      if (placeholderIndex >= 0) {
        // for efficiency
        nonOrderedChildren.unshift(placeholderIndex, 1);

        // @ts-expect-error - TODO: best way to type?
        Array.prototype.splice.apply(effectiveChildren, nonOrderedChildren);
      }
      // Otherwise, just add the normal things at the end
      else {
        Array.prototype.push.apply(effectiveChildren, nonOrderedChildren);
      }
      return effectiveChildren;
    } else {
      return nonOrderedChildren;
    }
  }

  /**
   * Hide completely from a screen reader and the browser by setting the hidden attribute on the node's
   * representative DOM element. If the sibling DOM Elements have a container parent, the container
   * should be hidden so that all PDOM elements are hidden as well.  Hiding the element will remove it from the focus
   * order.
   */
  setPDOMVisible(visible) {
    if (this._pdomVisible !== visible) {
      this._pdomVisible = visible;
      this._pdomDisplaysInfo.onPDOMVisibilityChange(visible);
    }
  }
  set pdomVisible(visible) {
    this.setPDOMVisible(visible);
  }
  get pdomVisible() {
    return this.isPDOMVisible();
  }

  /**
   * Get whether or not this node's representative DOM element is visible.
   */
  isPDOMVisible() {
    return this._pdomVisible;
  }

  /**
   * Returns true if any of the PDOMInstances for the Node are globally visible and displayed in the PDOM. A
   * PDOMInstance is globally visible if Node and all ancestors are pdomVisible. PDOMInstance visibility is
   * updated synchronously, so this returns the most up-to-date information without requiring Display.updateDisplay
   */
  isPDOMDisplayed() {
    for (let i = 0; i < this._pdomInstances.length; i++) {
      if (this._pdomInstances[i].isGloballyVisible()) {
        return true;
      }
    }
    return false;
  }
  get pdomDisplayed() {
    return this.isPDOMDisplayed();
  }

  /**
   * Set the value of an input element.  Element must be a form element to support the value attribute. The input
   * value is converted to string since input values are generally string for HTML.
   */
  setInputValue(value) {
    // If it's a Property, we'll just grab the initial value. See https://github.com/phetsims/scenery/issues/1442
    if (value instanceof ReadOnlyProperty || value instanceof TinyProperty) {
      value = value.value;
    }
    assert && assert(value === null || typeof value === 'string' || typeof value === 'number');
    assert && this._tagName && assert(_.includes(FORM_ELEMENTS, this._tagName.toUpperCase()), 'dom element must be a form element to support value');

    // type cast
    value = `${value}`;
    if (value !== this._inputValue) {
      this._inputValue = value;
      for (let i = 0; i < this.pdomInstances.length; i++) {
        const peer = this.pdomInstances[i].peer;
        peer.onInputValueChange();
      }
    }
  }
  set inputValue(value) {
    this.setInputValue(value);
  }
  get inputValue() {
    return this.getInputValue();
  }

  /**
   * Get the value of the element. Element must be a form element to support the value attribute.
   */
  getInputValue() {
    return this._inputValue;
  }

  /**
   * Set whether or not the checked attribute appears on the dom elements associated with this Node's
   * pdom content.  This is only useful for inputs of type 'radio' and 'checkbox'. A 'checked' input
   * is considered selected to the browser and assistive technology.
   */
  setPDOMChecked(checked) {
    if (this._tagName) {
      assert && assert(this._tagName.toUpperCase() === INPUT_TAG, 'Cannot set checked on a non input tag.');
    }
    if (this._inputType) {
      assert && assert(INPUT_TYPES_THAT_SUPPORT_CHECKED.includes(this._inputType.toUpperCase()), `inputType does not support checked: ${this._inputType}`);
    }
    if (this._pdomChecked !== checked) {
      this._pdomChecked = checked;
      this.setPDOMAttribute('checked', checked, {
        asProperty: true
      });
    }
  }
  set pdomChecked(checked) {
    this.setPDOMChecked(checked);
  }
  get pdomChecked() {
    return this.getPDOMChecked();
  }

  /**
   * Get whether or not the pdom input is 'checked'.
   */
  getPDOMChecked() {
    return this._pdomChecked;
  }

  /**
   * Get an array containing all pdom attributes that have been added to this Node's primary sibling.
   */
  getPDOMAttributes() {
    return this._pdomAttributes.slice(0); // defensive copy
  }

  get pdomAttributes() {
    return this.getPDOMAttributes();
  }

  /**
   * Set a particular attribute or property for this Node's primary sibling, generally to provide extra semantic information for
   * a screen reader.
   *
   * @param attribute - string naming the attribute
   * @param value - the value for the attribute, if boolean, then it will be set as a javascript property on the HTMLElement rather than an attribute
   * @param [providedOptions]
   */
  setPDOMAttribute(attribute, value, providedOptions) {
    if (!(typeof value === 'boolean' || typeof value === 'number')) {
      value = unwrapProperty(value);
    }
    assert && providedOptions && assert(Object.getPrototypeOf(providedOptions) === Object.prototype, 'Extra prototype on pdomAttribute options object is a code smell');
    assert && typeof value === 'string' && validate(value, Validation.STRING_WITHOUT_TEMPLATE_VARS_VALIDATOR);
    const options = optionize()({
      // {string|null} - If non-null, will set the attribute with the specified namespace. This can be required
      // for setting certain attributes (e.g. MathML).
      namespace: null,
      // set the "attribute" as a javascript property on the DOMElement instead
      asProperty: false,
      elementName: PDOMPeer.PRIMARY_SIBLING // see PDOMPeer.getElementName() for valid values, default to the primary sibling
    }, providedOptions);
    assert && assert(!ASSOCIATION_ATTRIBUTES.includes(attribute), 'setPDOMAttribute does not support association attributes');

    // if the pdom attribute already exists in the list, remove it - no need
    // to remove from the peers, existing attributes will simply be replaced in the DOM
    for (let i = 0; i < this._pdomAttributes.length; i++) {
      const currentAttribute = this._pdomAttributes[i];
      if (currentAttribute.attribute === attribute && currentAttribute.options.namespace === options.namespace && currentAttribute.options.elementName === options.elementName) {
        if (currentAttribute.options.asProperty === options.asProperty) {
          this._pdomAttributes.splice(i, 1);
        } else {
          // Swapping asProperty setting strategies should remove the attribute so it can be set as a property.
          this.removePDOMAttribute(currentAttribute.attribute, currentAttribute.options);
        }
      }
    }
    this._pdomAttributes.push({
      attribute: attribute,
      value: value,
      options: options
    });
    for (let j = 0; j < this._pdomInstances.length; j++) {
      const peer = this._pdomInstances[j].peer;
      peer.setAttributeToElement(attribute, value, options);
    }
  }

  /**
   * Remove a particular attribute, removing the associated semantic information from the DOM element.
   *
   * It is HIGHLY recommended that you never call this function from an attribute set with `asProperty:true`, see
   * setPDOMAttribute for the option details.
   *
   * @param attribute - name of the attribute to remove
   * @param [providedOptions]
   */
  removePDOMAttribute(attribute, providedOptions) {
    assert && providedOptions && assert(Object.getPrototypeOf(providedOptions) === Object.prototype, 'Extra prototype on pdomAttribute options object is a code smell');
    const options = optionize()({
      // {string|null} - If non-null, will remove the attribute with the specified namespace. This can be required
      // for removing certain attributes (e.g. MathML).
      namespace: null,
      elementName: PDOMPeer.PRIMARY_SIBLING // see PDOMPeer.getElementName() for valid values, default to the primary sibling
    }, providedOptions);
    let attributeRemoved = false;
    for (let i = 0; i < this._pdomAttributes.length; i++) {
      if (this._pdomAttributes[i].attribute === attribute && this._pdomAttributes[i].options.namespace === options.namespace && this._pdomAttributes[i].options.elementName === options.elementName) {
        this._pdomAttributes.splice(i, 1);
        attributeRemoved = true;
      }
    }
    assert && assert(attributeRemoved, `Node does not have pdom attribute ${attribute}`);
    for (let j = 0; j < this._pdomInstances.length; j++) {
      const peer = this._pdomInstances[j].peer;
      peer.removeAttributeFromElement(attribute, options);
    }
  }

  /**
   * Remove all attributes from this node's dom element.
   */
  removePDOMAttributes() {
    // all attributes currently on this Node's primary sibling
    const attributes = this.getPDOMAttributes();
    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i].attribute;
      this.removePDOMAttribute(attribute);
    }
  }

  /**
   * Remove a particular attribute, removing the associated semantic information from the DOM element.
   *
   * @param attribute - name of the attribute to remove
   * @param [providedOptions]
   */
  hasPDOMAttribute(attribute, providedOptions) {
    assert && providedOptions && assert(Object.getPrototypeOf(providedOptions) === Object.prototype, 'Extra prototype on pdomAttribute options object is a code smell');
    const options = optionize()({
      // {string|null} - If non-null, will remove the attribute with the specified namespace. This can be required
      // for removing certain attributes (e.g. MathML).
      namespace: null,
      elementName: PDOMPeer.PRIMARY_SIBLING // see PDOMPeer.getElementName() for valid values, default to the primary sibling
    }, providedOptions);
    let attributeFound = false;
    for (let i = 0; i < this._pdomAttributes.length; i++) {
      if (this._pdomAttributes[i].attribute === attribute && this._pdomAttributes[i].options.namespace === options.namespace && this._pdomAttributes[i].options.elementName === options.elementName) {
        attributeFound = true;
      }
    }
    return attributeFound;
  }

  /**
   * Add the class to the PDOM element's classList. The PDOM is generally invisible,
   * but some styling occasionally has an impact on semantics so it is necessary to set styles.
   * Add a class with this function and define the style in stylesheets (likely SceneryStyle).
   */
  setPDOMClass(className, providedOptions) {
    const options = optionize()({
      elementName: PDOMPeer.PRIMARY_SIBLING
    }, providedOptions);

    // if we already have the provided className set to the sibling, do nothing
    for (let i = 0; i < this._pdomClasses.length; i++) {
      const currentClass = this._pdomClasses[i];
      if (currentClass.className === className && currentClass.options.elementName === options.elementName) {
        return;
      }
    }
    this._pdomClasses.push({
      className: className,
      options: options
    });
    for (let j = 0; j < this._pdomInstances.length; j++) {
      const peer = this._pdomInstances[j].peer;
      peer.setClassToElement(className, options);
    }
  }

  /**
   * Remove a class from the classList of one of the elements for this Node.
   */
  removePDOMClass(className, providedOptions) {
    const options = optionize()({
      elementName: PDOMPeer.PRIMARY_SIBLING // see PDOMPeer.getElementName() for valid values, default to the primary sibling
    }, providedOptions);
    let classRemoved = false;
    for (let i = 0; i < this._pdomClasses.length; i++) {
      if (this._pdomClasses[i].className === className && this._pdomClasses[i].options.elementName === options.elementName) {
        this._pdomClasses.splice(i, 1);
        classRemoved = true;
      }
    }
    assert && assert(classRemoved, `Node does not have pdom attribute ${className}`);
    for (let j = 0; j < this._pdomClasses.length; j++) {
      const peer = this.pdomInstances[j].peer;
      peer.removeClassFromElement(className, options);
    }
  }

  /**
   * Get the list of classes assigned to PDOM elements for this Node.
   */
  getPDOMClasses() {
    return this._pdomClasses.slice(0); // defensive copy
  }

  get pdomClasses() {
    return this.getPDOMClasses();
  }

  /**
   * Make the DOM element explicitly focusable with a tab index. Native HTML form elements will generally be in
   * the navigation order without explicitly setting focusable.  If these need to be removed from the navigation
   * order, call setFocusable( false ).  Removing an element from the focus order does not hide the element from
   * assistive technology.
   *
   * @param focusable - null to use the default browser focus for the primary element
   */
  setFocusable(focusable) {
    assert && assert(focusable === null || typeof focusable === 'boolean');
    if (this._focusableOverride !== focusable) {
      this._focusableOverride = focusable;
      for (let i = 0; i < this._pdomInstances.length; i++) {
        // after the override is set, update the focusability of the peer based on this node's value for focusable
        // which may be true or false (but not null)
        // assert && assert( typeof this.focusable === 'boolean' );
        assert && assert(this._pdomInstances[i].peer, 'Peer required to set focusable.');
        this._pdomInstances[i].peer.setFocusable(this.focusable);
      }
    }
  }
  set focusable(isFocusable) {
    this.setFocusable(isFocusable);
  }
  get focusable() {
    return this.isFocusable();
  }

  /**
   * Get whether or not the node is focusable. Use the focusOverride, and then default to browser defined
   * focusable elements.
   */
  isFocusable() {
    if (this._focusableOverride !== null) {
      return this._focusableOverride;
    }

    // if there isn't a tagName yet, then there isn't an element, so we aren't focusable. To support option order.
    else if (this._tagName === null) {
      return false;
    } else {
      return PDOMUtils.tagIsDefaultFocusable(this._tagName);
    }
  }

  /**
   * Sets the source Node that controls positioning of the primary sibling. Transforms along the trail to this
   * node are observed so that the primary sibling is positioned correctly in the global coordinate frame.
   *
   * The transformSourceNode cannot use DAG for now because we need a unique trail to observe transforms.
   *
   * By default, transforms along trails to all of this Node's PDOMInstances are observed. But this
   * function can be used if you have a visual Node represented in the PDOM by a different Node in the scene
   * graph but still need the other Node's PDOM content positioned over the visual node. For example, this could
   * be required to catch all fake pointer events that may come from certain types of screen readers.
   */
  setPDOMTransformSourceNode(node) {
    this._pdomTransformSourceNode = node;
    for (let i = 0; i < this._pdomInstances.length; i++) {
      this._pdomInstances[i].peer.setPDOMTransformSourceNode(this._pdomTransformSourceNode);
    }
  }
  set pdomTransformSourceNode(node) {
    this.setPDOMTransformSourceNode(node);
  }
  get pdomTransformSourceNode() {
    return this.getPDOMTransformSourceNode();
  }

  /**
   * Get the source Node that controls positioning of the primary sibling in the global coordinate frame. See
   * setPDOMTransformSourceNode for more in depth information.
   */
  getPDOMTransformSourceNode() {
    return this._pdomTransformSourceNode;
  }

  /**
   * Sets whether the PDOM sibling elements are positioned in the correct place in the viewport. Doing so is a
   * requirement for custom gestures on touch based screen readers. However, doing this DOM layout is expensive so
   * only do this when necessary. Generally only needed for elements that utilize a "double tap and hold" gesture
   * to drag and drop.
   *
   * Positioning the PDOM element will caused some screen readers to send both click and pointer events to the
   * location of the Node in global coordinates. Do not position elements that use click listeners since activation
   * will fire twice (once for the pointer event listeners and once for the click event listeners).
   */
  setPositionInPDOM(positionInPDOM) {
    this._positionInPDOM = positionInPDOM;
    for (let i = 0; i < this._pdomInstances.length; i++) {
      this._pdomInstances[i].peer.setPositionInPDOM(positionInPDOM);
    }
  }
  set positionInPDOM(positionInPDOM) {
    this.setPositionInPDOM(positionInPDOM);
  }
  get positionInPDOM() {
    return this.getPositionInPDOM();
  }

  /**
   * Gets whether or not we are positioning the PDOM sibling elements. See setPositionInPDOM().
   */
  getPositionInPDOM() {
    return this._positionInPDOM;
  }

  /**
   * This function should be used sparingly as a workaround. If used, any DOM input events received from the label
   * sibling will not be dispatched as SceneryEvents in Input.js. The label sibling may receive input by screen
   * readers if the virtual cursor is over it. That is usually fine, but there is a bug with NVDA and Firefox where
   * both the label sibling AND primary sibling receive events in this case, and both bubble up to the root of the
   * PDOM, and so we would otherwise dispatch two SceneryEvents instead of one.
   *
   * See https://github.com/phetsims/a11y-research/issues/156 for more information.
   */
  setExcludeLabelSiblingFromInput() {
    this.excludeLabelSiblingFromInput = true;
    this.onPDOMContentChange();
  }

  /**
   * Return true if this Node is a PhET-iO archetype or it is a Node descendant of a PhET-iO archetype.
   * See https://github.com/phetsims/joist/issues/817
   */
  isInsidePhetioArchetype(node = this) {
    if (node.isPhetioInstrumented()) {
      return node.phetioIsArchetype;
    }
    for (let i = 0; i < node.parents.length; i++) {
      if (this.isInsidePhetioArchetype(node.parents[i])) {
        return true;
      }
    }
    return false;
  }

  /**
   * Alert on all interactive description utteranceQueues located on each connected Display. See
   * Node.getConnectedDisplays. Note that if your Node is not connected to a Display, this function will have
   * no effect.
   */
  alertDescriptionUtterance(utterance) {
    // No description should be alerted if setting PhET-iO state, see https://github.com/phetsims/scenery/issues/1397
    if (_.hasIn(window, 'phet.phetio.phetioEngine.phetioStateEngine') && phet.phetio.phetioEngine.phetioStateEngine.isSettingStateProperty.value) {
      return;
    }

    // No description should be alerted if an archetype of a PhET-iO dynamic element, see https://github.com/phetsims/joist/issues/817
    if (Tandem.PHET_IO_ENABLED && this.isInsidePhetioArchetype()) {
      return;
    }
    const connectedDisplays = this.getConnectedDisplays();
    for (let i = 0; i < connectedDisplays.length; i++) {
      const display = connectedDisplays[i];
      if (display.isAccessible()) {
        // Don't use `forEachUtterance` to prevent creating a closure for each usage of this function
        display.descriptionUtteranceQueue.addToBack(utterance);
      }
    }
  }

  /**
   * Apply a callback on each utteranceQueue that this Node has a connection to (via Display). Note that only
   * accessible Displays have utteranceQueues that this function will interface with.
   */
  forEachUtteranceQueue(callback) {
    const connectedDisplays = this.getConnectedDisplays();

    // If you run into this assertion, talk to @jessegreenberg and @zepumph, because it is quite possible we would
    // remove this assertion for your case.
    assert && assert(connectedDisplays.length > 0, 'must be connected to a display to use UtteranceQueue features');
    for (let i = 0; i < connectedDisplays.length; i++) {
      const display = connectedDisplays[i];
      if (display.isAccessible()) {
        callback(display.descriptionUtteranceQueue);
      }
    }
  }

  /***********************************************************************************************************/
  // SCENERY-INTERNAL AND PRIVATE METHODS
  /***********************************************************************************************************/

  /**
   * Used to get a list of all settable options and their current values. (scenery-internal)
   *
   * @returns - keys are all accessibility option keys, and the values are the values of those properties
   * on this node.
   */
  getBaseOptions() {
    const currentOptions = {};
    for (let i = 0; i < ACCESSIBILITY_OPTION_KEYS.length; i++) {
      const optionName = ACCESSIBILITY_OPTION_KEYS[i];

      // @ts-expect-error - Not sure of a great way to do this
      currentOptions[optionName] = this[optionName];
    }
    return currentOptions;
  }

  /**
   * Returns a recursive data structure that represents the nested ordering of pdom content for this Node's
   * subtree. Each "Item" will have the type { trail: {Trail}, children: {Array.<Item>} }, forming a tree-like
   * structure. (scenery-internal)
   */
  getNestedPDOMOrder() {
    const currentTrail = new Trail(this);
    let pruneStack = []; // A list of nodes to prune

    // {Array.<Item>} - The main result we will be returning. It is the top-level array where child items will be
    // inserted.
    const result = [];

    // {Array.<Array.<Item>>} A stack of children arrays, where we should be inserting items into the top array.
    // We will start out with the result, and as nested levels are added, the children arrays of those items will be
    // pushed and poppped, so that the top array on this stack is where we should insert our next child item.
    const nestedChildStack = [result];
    function addTrailsForNode(node, overridePruning) {
      // If subtrees were specified with pdomOrder, they should be skipped from the ordering of ancestor subtrees,
      // otherwise we could end up having multiple references to the same trail (which should be disallowed).
      let pruneCount = 0;
      // count the number of times our node appears in the pruneStack
      _.each(pruneStack, pruneNode => {
        if (node === pruneNode) {
          pruneCount++;
        }
      });

      // If overridePruning is set, we ignore one reference to our node in the prune stack. If there are two copies,
      // however, it means a node was specified in a pdomOrder that already needs to be pruned (so we skip it instead
      // of creating duplicate references in the traversal order).
      if (pruneCount > 1 || pruneCount === 1 && !overridePruning) {
        return;
      }

      // Pushing item and its children array, if has pdom content
      if (node.hasPDOMContent) {
        const item = {
          trail: currentTrail.copy(),
          children: []
        };
        nestedChildStack[nestedChildStack.length - 1].push(item);
        nestedChildStack.push(item.children);
      }
      const arrayPDOMOrder = node._pdomOrder === null ? [] : node._pdomOrder;

      // push specific focused nodes to the stack
      pruneStack = pruneStack.concat(arrayPDOMOrder);

      // Visiting trails to ordered nodes.
      // @ts-expect-error
      _.each(arrayPDOMOrder, descendant => {
        // Find all descendant references to the node.
        // NOTE: We are not reordering trails (due to descendant constraints) if there is more than one instance for
        // this descendant node.
        _.each(node.getLeafTrailsTo(descendant), descendantTrail => {
          descendantTrail.removeAncestor(); // strip off 'node', so that we handle only children

          // same as the normal order, but adding a full trail (since we may be referencing a descendant node)
          currentTrail.addDescendantTrail(descendantTrail);
          addTrailsForNode(descendant, true); // 'true' overrides one reference in the prune stack (added above)
          currentTrail.removeDescendantTrail(descendantTrail);
        });
      });

      // Visit everything. If there is an pdomOrder, those trails were already visited, and will be excluded.
      const numChildren = node._children.length;
      for (let i = 0; i < numChildren; i++) {
        const child = node._children[i];
        currentTrail.addDescendant(child, i);
        addTrailsForNode(child, false);
        currentTrail.removeDescendant();
      }

      // pop focused nodes from the stack (that were added above)
      _.each(arrayPDOMOrder, () => {
        pruneStack.pop();
      });

      // Popping children array if has pdom content
      if (node.hasPDOMContent) {
        nestedChildStack.pop();
      }
    }
    addTrailsForNode(this, false);
    return result;
  }

  /**
   * Sets the pdom content for a Node. See constructor for more information. Not part of the ParallelDOM
   * API (scenery-internal)
   */
  onPDOMContentChange() {
    PDOMTree.pdomContentChange(this);

    // recompute the heading level for this node if it is using the pdomHeading API.
    this._pdomHeading && this.computeHeadingLevel();
    this.rendererSummaryRefreshEmitter.emit();
  }

  /**
   * Returns whether or not this Node has any representation for the Parallel DOM.
   * Note this is still true if the content is pdomVisible=false or is otherwise hidden.
   */
  get hasPDOMContent() {
    return !!this._tagName;
  }

  /**
   * Called when the node is added as a child to this node AND the node's subtree contains pdom content.
   * We need to notify all Displays that can see this change, so that they can update the PDOMInstance tree.
   */
  onPDOMAddChild(node) {
    sceneryLog && sceneryLog.ParallelDOM && sceneryLog.ParallelDOM(`onPDOMAddChild n#${node.id} (parent:n#${this.id})`);
    sceneryLog && sceneryLog.ParallelDOM && sceneryLog.push();

    // Find descendants with pdomOrders and check them against all of their ancestors/self
    assert && function recur(descendant) {
      // Prune the search (because milliseconds don't grow on trees, even if we do have assertions enabled)
      if (descendant._rendererSummary.hasNoPDOM()) {
        return;
      }
      descendant.pdomOrder && assert(descendant.getTrails(node => _.includes(descendant.pdomOrder, node)).length === 0, 'pdomOrder should not include any ancestors or the node itself');
    }(node);
    assert && PDOMTree.auditNodeForPDOMCycles(this);
    this._pdomDisplaysInfo.onAddChild(node);
    PDOMTree.addChild(this, node);
    sceneryLog && sceneryLog.ParallelDOM && sceneryLog.pop();
  }

  /**
   * Called when the node is removed as a child from this node AND the node's subtree contains pdom content.
   * We need to notify all Displays that can see this change, so that they can update the PDOMInstance tree.
   */
  onPDOMRemoveChild(node) {
    sceneryLog && sceneryLog.ParallelDOM && sceneryLog.ParallelDOM(`onPDOMRemoveChild n#${node.id} (parent:n#${this.id})`);
    sceneryLog && sceneryLog.ParallelDOM && sceneryLog.push();
    this._pdomDisplaysInfo.onRemoveChild(node);
    PDOMTree.removeChild(this, node);

    // make sure that the associations for aria-labelledby and aria-describedby are updated for nodes associated
    // to this Node (they are pointing to this Node's IDs). https://github.com/phetsims/scenery/issues/816
    node.updateOtherNodesAriaLabelledby();
    node.updateOtherNodesAriaDescribedby();
    node.updateOtherNodesActiveDescendant();
    sceneryLog && sceneryLog.ParallelDOM && sceneryLog.pop();
  }

  /**
   * Called when this node's children are reordered (with nothing added/removed).
   */
  onPDOMReorderedChildren() {
    sceneryLog && sceneryLog.ParallelDOM && sceneryLog.ParallelDOM(`onPDOMReorderedChildren (parent:n#${this.id})`);
    sceneryLog && sceneryLog.ParallelDOM && sceneryLog.push();
    PDOMTree.childrenOrderChange(this);
    sceneryLog && sceneryLog.ParallelDOM && sceneryLog.pop();
  }

  /**
   * Handles linking and checking child PhET-iO Properties such as Node.visibleProperty and Node.enabledProperty.
   */
  updateLinkedElementForProperty(tandemName, oldProperty, newProperty) {
    assert && assert(oldProperty !== newProperty, 'should not be called on same values');

    // Only update linked elements if this Node is instrumented for PhET-iO
    if (this.isPhetioInstrumented()) {
      oldProperty && oldProperty instanceof ReadOnlyProperty && oldProperty.isPhetioInstrumented() && oldProperty instanceof PhetioObject && this.removeLinkedElements(oldProperty);
      const tandem = this.tandem.createTandem(tandemName);
      if (newProperty && newProperty instanceof ReadOnlyProperty && newProperty.isPhetioInstrumented() && newProperty instanceof PhetioObject && tandem !== newProperty.tandem) {
        this.addLinkedElement(newProperty, {
          tandem: tandem
        });
      }
    }
  }

  /*---------------------------------------------------------------------------*/
  //
  // PDOM Instance handling

  /**
   * Returns a reference to the pdom instances array. (scenery-internal)
   */
  getPDOMInstances() {
    return this._pdomInstances;
  }
  get pdomInstances() {
    return this.getPDOMInstances();
  }

  /**
   * Adds an PDOMInstance reference to our array. (scenery-internal)
   */
  addPDOMInstance(pdomInstance) {
    this._pdomInstances.push(pdomInstance);
  }

  /**
   * Removes an PDOMInstance reference from our array. (scenery-internal)
   */
  removePDOMInstance(pdomInstance) {
    const index = _.indexOf(this._pdomInstances, pdomInstance);
    assert && assert(index !== -1, 'Cannot remove an PDOMInstance from a Node if it was not there');
    this._pdomInstances.splice(index, 1);
  }
  static BASIC_ACCESSIBLE_NAME_BEHAVIOR(node, options, accessibleName) {
    if (node.tagName === 'input') {
      options.labelTagName = 'label';
      options.labelContent = accessibleName;
    } else if (PDOMUtils.tagNameSupportsContent(node.tagName)) {
      options.innerContent = accessibleName;
    } else {
      options.ariaLabel = accessibleName;
    }
    return options;
  }
  static HELP_TEXT_BEFORE_CONTENT(node, options, helpText) {
    options.descriptionTagName = PDOMUtils.DEFAULT_DESCRIPTION_TAG_NAME;
    options.descriptionContent = helpText;
    options.appendDescription = false;
    return options;
  }
  static HELP_TEXT_AFTER_CONTENT(node, options, helpText) {
    options.descriptionTagName = PDOMUtils.DEFAULT_DESCRIPTION_TAG_NAME;
    options.descriptionContent = helpText;
    options.appendDescription = true;
    return options;
  }
}
scenery.register('ParallelDOM', ParallelDOM);
export { ACCESSIBILITY_OPTION_KEYS };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsInZhbGlkYXRlIiwiVmFsaWRhdGlvbiIsImFycmF5RGlmZmVyZW5jZSIsIlBoZXRpb09iamVjdCIsIk5vZGUiLCJQRE9NRGlzcGxheXNJbmZvIiwiUERPTVBlZXIiLCJQRE9NVHJlZSIsIlBET01VdGlscyIsInNjZW5lcnkiLCJUcmFpbCIsIm9wdGlvbml6ZSIsIlRhbmRlbSIsIlJlYWRPbmx5UHJvcGVydHkiLCJUaW55UHJvcGVydHkiLCJUaW55Rm9yd2FyZGluZ1Byb3BlcnR5IiwiSU5QVVRfVEFHIiwiVEFHUyIsIklOUFVUIiwiUF9UQUciLCJQIiwiREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRSIsIkRFRkFVTFRfTEFCRUxfVEFHX05BTUUiLCJERUZBVUxUX1BET01fSEVBRElOR19CRUhBVklPUiIsIm5vZGUiLCJvcHRpb25zIiwiaGVhZGluZyIsImxhYmVsVGFnTmFtZSIsImhlYWRpbmdMZXZlbCIsImxhYmVsQ29udGVudCIsInVud3JhcFByb3BlcnR5IiwidmFsdWVPclByb3BlcnR5IiwicmVzdWx0IiwidmFsdWUiLCJhc3NlcnQiLCJGT1JNX0VMRU1FTlRTIiwiSU5QVVRfVFlQRVNfVEhBVF9TVVBQT1JUX0NIRUNLRUQiLCJBU1NPQ0lBVElPTl9BVFRSSUJVVEVTIiwiQUNDRVNTSUJJTElUWV9PUFRJT05fS0VZUyIsIlBhcmFsbGVsRE9NIiwiY29uc3RydWN0b3IiLCJfdGFnTmFtZSIsIl9jb250YWluZXJUYWdOYW1lIiwiX2xhYmVsVGFnTmFtZSIsIl9kZXNjcmlwdGlvblRhZ05hbWUiLCJfaW5wdXRUeXBlIiwiX2lucHV0VmFsdWUiLCJfcGRvbUNoZWNrZWQiLCJfYXBwZW5kTGFiZWwiLCJfYXBwZW5kRGVzY3JpcHRpb24iLCJfcGRvbUF0dHJpYnV0ZXMiLCJfcGRvbUNsYXNzZXMiLCJfbGFiZWxDb250ZW50IiwiX2lubmVyQ29udGVudFByb3BlcnR5IiwibGF6eUxpbmsiLCJvbklubmVyQ29udGVudFByb3BlcnR5Q2hhbmdlIiwiYmluZCIsIl9kZXNjcmlwdGlvbkNvbnRlbnQiLCJfcGRvbU5hbWVzcGFjZSIsIl9hcmlhTGFiZWwiLCJfYXJpYVJvbGUiLCJfY29udGFpbmVyQXJpYVJvbGUiLCJfYXJpYVZhbHVlVGV4dCIsIl9hcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucyIsIl9ub2Rlc1RoYXRBcmVBcmlhTGFiZWxsZWRieVRoaXNOb2RlIiwiX2FyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucyIsIl9ub2Rlc1RoYXRBcmVBcmlhRGVzY3JpYmVkYnlUaGlzTm9kZSIsIl9hY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zIiwiX25vZGVzVGhhdEFyZUFjdGl2ZURlc2NlbmRhbnRUb1RoaXNOb2RlIiwiX2ZvY3VzYWJsZU92ZXJyaWRlIiwiX2ZvY3VzSGlnaGxpZ2h0IiwiX2ZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlIiwiX2dyb3VwRm9jdXNIaWdobGlnaHQiLCJfcGRvbVZpc2libGUiLCJfcGRvbU9yZGVyIiwiX3Bkb21QYXJlbnQiLCJfcGRvbVRyYW5zZm9ybVNvdXJjZU5vZGUiLCJfcGRvbURpc3BsYXlzSW5mbyIsIl9wZG9tSW5zdGFuY2VzIiwiX3Bvc2l0aW9uSW5QRE9NIiwiZXhjbHVkZUxhYmVsU2libGluZ0Zyb21JbnB1dCIsIl9hY2Nlc3NpYmxlTmFtZSIsIl9hY2Nlc3NpYmxlTmFtZUJlaGF2aW9yIiwiQkFTSUNfQUNDRVNTSUJMRV9OQU1FX0JFSEFWSU9SIiwiX2hlbHBUZXh0IiwiX2hlbHBUZXh0QmVoYXZpb3IiLCJIRUxQX1RFWFRfQUZURVJfQ09OVEVOVCIsIl9wZG9tSGVhZGluZyIsIl9oZWFkaW5nTGV2ZWwiLCJfcGRvbUhlYWRpbmdCZWhhdmlvciIsImZvY3VzSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXIiLCJwZG9tRGlzcGxheXNFbWl0dGVyIiwicGRvbUJvdW5kSW5wdXRFbmFibGVkTGlzdGVuZXIiLCJwZG9tSW5wdXRFbmFibGVkTGlzdGVuZXIiLCJkaXNwb3NlUGFyYWxsZWxET00iLCJpbnB1dEVuYWJsZWRQcm9wZXJ0eSIsInVubGluayIsInBkb21PcmRlciIsInNldFBET01UcmFuc2Zvcm1Tb3VyY2VOb2RlIiwic2V0QXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnMiLCJzZXRBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMiLCJzZXRBY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zIiwiZGlzcG9zZSIsImVuYWJsZWQiLCJzZXRQRE9NQXR0cmlidXRlIiwiaXNGb2N1c2VkIiwiaSIsImxlbmd0aCIsInBlZXIiLCJmb2N1c2VkIiwiZm9jdXMiLCJmb2N1c2FibGUiLCJibHVyIiwicGRvbUF1ZGl0IiwiaGFzUERPTUNvbnRlbnQiLCJ0b1VwcGVyQ2FzZSIsImluY2x1ZGVzIiwiZm9jdXNIaWdobGlnaHQiLCJhcmlhUm9sZSIsImNoaWxkcmVuIiwic2V0QWNjZXNzaWJsZU5hbWUiLCJwcm92aWRlZEFjY2Vzc2libGVOYW1lIiwiYWNjZXNzaWJsZU5hbWUiLCJvblBET01Db250ZW50Q2hhbmdlIiwiZ2V0QWNjZXNzaWJsZU5hbWUiLCJyZW1vdmVGcm9tUERPTSIsInRhZ05hbWUiLCJzZXRBY2Nlc3NpYmxlTmFtZUJlaGF2aW9yIiwiYWNjZXNzaWJsZU5hbWVCZWhhdmlvciIsImdldEFjY2Vzc2libGVOYW1lQmVoYXZpb3IiLCJzZXRQRE9NSGVhZGluZyIsInByb3ZpZGVkUGRvbUhlYWRpbmciLCJwZG9tSGVhZGluZyIsImdldFBET01IZWFkaW5nIiwic2V0UERPTUhlYWRpbmdCZWhhdmlvciIsInBkb21IZWFkaW5nQmVoYXZpb3IiLCJnZXRQRE9NSGVhZGluZ0JlaGF2aW9yIiwiZ2V0SGVhZGluZ0xldmVsIiwiY29tcHV0ZUhlYWRpbmdMZXZlbCIsImxldmVsIiwic2V0SGVscFRleHQiLCJwcm92aWRlZEhlbHBUZXh0IiwiaGVscFRleHQiLCJnZXRIZWxwVGV4dCIsInNldEhlbHBUZXh0QmVoYXZpb3IiLCJoZWxwVGV4dEJlaGF2aW9yIiwiZ2V0SGVscFRleHRCZWhhdmlvciIsInNldFRhZ05hbWUiLCJnZXRUYWdOYW1lIiwic2V0TGFiZWxUYWdOYW1lIiwiZ2V0TGFiZWxUYWdOYW1lIiwic2V0RGVzY3JpcHRpb25UYWdOYW1lIiwiZGVzY3JpcHRpb25UYWdOYW1lIiwiZ2V0RGVzY3JpcHRpb25UYWdOYW1lIiwic2V0SW5wdXRUeXBlIiwiaW5wdXRUeXBlIiwicmVtb3ZlQXR0cmlidXRlRnJvbUVsZW1lbnQiLCJzZXRBdHRyaWJ1dGVUb0VsZW1lbnQiLCJnZXRJbnB1dFR5cGUiLCJzZXRBcHBlbmRMYWJlbCIsImFwcGVuZExhYmVsIiwiZ2V0QXBwZW5kTGFiZWwiLCJzZXRBcHBlbmREZXNjcmlwdGlvbiIsImFwcGVuZERlc2NyaXB0aW9uIiwiZ2V0QXBwZW5kRGVzY3JpcHRpb24iLCJzZXRDb250YWluZXJUYWdOYW1lIiwiY29udGFpbmVyVGFnTmFtZSIsImdldENvbnRhaW5lclRhZ05hbWUiLCJzZXRMYWJlbENvbnRlbnQiLCJwcm92aWRlZExhYmVsIiwibGFiZWwiLCJzZXRMYWJlbFNpYmxpbmdDb250ZW50IiwiZ2V0TGFiZWxDb250ZW50Iiwic2V0SW5uZXJDb250ZW50IiwicHJvdmlkZWRDb250ZW50Iiwic2V0VmFsdWVPclRhcmdldFByb3BlcnR5IiwiaW5uZXJDb250ZW50IiwiY29udGVudCIsImdldElubmVyQ29udGVudCIsInNldFByaW1hcnlTaWJsaW5nQ29udGVudCIsInNldERlc2NyaXB0aW9uQ29udGVudCIsInByb3ZpZGVkRGVzY3JpcHRpb25Db250ZW50IiwiZGVzY3JpcHRpb25Db250ZW50Iiwic2V0RGVzY3JpcHRpb25TaWJsaW5nQ29udGVudCIsInRleHRDb250ZW50IiwiZ2V0RGVzY3JpcHRpb25Db250ZW50Iiwic2V0QXJpYVJvbGUiLCJyZW1vdmVQRE9NQXR0cmlidXRlIiwiZ2V0QXJpYVJvbGUiLCJzZXRDb250YWluZXJBcmlhUm9sZSIsImVsZW1lbnROYW1lIiwiQ09OVEFJTkVSX1BBUkVOVCIsImNvbnRhaW5lckFyaWFSb2xlIiwiZ2V0Q29udGFpbmVyQXJpYVJvbGUiLCJzZXRBcmlhVmFsdWVUZXh0IiwicHJvdmlkZWRBcmlhVmFsdWVUZXh0IiwiYXJpYVZhbHVlVGV4dCIsImdldEFyaWFWYWx1ZVRleHQiLCJzZXRQRE9NTmFtZXNwYWNlIiwicGRvbU5hbWVzcGFjZSIsImdldFBET01OYW1lc3BhY2UiLCJzZXRBcmlhTGFiZWwiLCJwcm92aWRlZEFyaWFMYWJlbCIsImFyaWFMYWJlbCIsImdldEFyaWFMYWJlbCIsInNldEZvY3VzSGlnaGxpZ2h0IiwidmlzaWJsZSIsImVtaXQiLCJnZXRGb2N1c0hpZ2hsaWdodCIsInNldEZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlIiwiZm9jdXNIaWdobGlnaHRMYXllcmFibGUiLCJnZXRGb2N1c0hpZ2hsaWdodExheWVyYWJsZSIsInNldEdyb3VwRm9jdXNIaWdobGlnaHQiLCJncm91cEhpZ2hsaWdodCIsImdyb3VwRm9jdXNIaWdobGlnaHQiLCJnZXRHcm91cEZvY3VzSGlnaGxpZ2h0IiwiYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnMiLCJhc3NvY2lhdGlvbk9iamVjdCIsIkFycmF5IiwiaXNBcnJheSIsImJlZm9yZU9ubHkiLCJhZnRlck9ubHkiLCJpbkJvdGgiLCJyZW1vdmVBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uIiwiYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbiIsImFkZEFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb24iLCJnZXRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucyIsInB1c2giLCJvdGhlck5vZGUiLCJ1cGRhdGVBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uc0luUGVlcnMiLCJfIiwicmVtb3ZlZE9iamVjdCIsInNwbGljZSIsImluZGV4T2YiLCJyZW1vdmVOb2RlVGhhdElzQXJpYUxhYmVsbGVkQnlUaGlzTm9kZSIsImluZGV4T2ZOb2RlIiwicGRvbUluc3RhbmNlcyIsIm9uQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbkNoYW5nZSIsInVwZGF0ZU90aGVyTm9kZXNBcmlhTGFiZWxsZWRieSIsImdldE5vZGVzVGhhdEFyZUFyaWFMYWJlbGxlZGJ5VGhpc05vZGUiLCJub2Rlc1RoYXRBcmVBcmlhTGFiZWxsZWRieVRoaXNOb2RlIiwiYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zIiwiaiIsInJlbW92ZUFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uIiwiYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24iLCJhZGRBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbiIsImdldEFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucyIsInVwZGF0ZUFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uc0luUGVlcnMiLCJoYXNBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbiIsInJlbW92ZU5vZGVUaGF0SXNBcmlhRGVzY3JpYmVkQnlUaGlzTm9kZSIsIm9uQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25DaGFuZ2UiLCJ1cGRhdGVPdGhlck5vZGVzQXJpYURlc2NyaWJlZGJ5IiwiZ2V0Tm9kZXNUaGF0QXJlQXJpYURlc2NyaWJlZGJ5VGhpc05vZGUiLCJub2Rlc1RoYXRBcmVBcmlhRGVzY3JpYmVkYnlUaGlzTm9kZSIsImFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnMiLCJyZW1vdmVBY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb24iLCJhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb24iLCJhZGRBY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb24iLCJnZXRBY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zIiwidXBkYXRlQWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9uc0luUGVlcnMiLCJyZW1vdmVOb2RlVGhhdElzQWN0aXZlRGVzY2VuZGFudFRoaXNOb2RlIiwib25BY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25DaGFuZ2UiLCJ1cGRhdGVPdGhlck5vZGVzQWN0aXZlRGVzY2VuZGFudCIsImdldE5vZGVzVGhhdEFyZUFjdGl2ZURlc2NlbmRhbnRUb1RoaXNOb2RlIiwibm9kZXNUaGF0QXJlQWN0aXZlRGVzY2VuZGFudFRvVGhpc05vZGUiLCJzZXRQRE9NT3JkZXIiLCJmb3JFYWNoIiwiaW5kZXgiLCJnZXRUcmFpbHMiLCJvbGRQRE9NT3JkZXIiLCJzbGljZSIsInBkb21PcmRlckNoYW5nZSIsInJlbmRlcmVyU3VtbWFyeVJlZnJlc2hFbWl0dGVyIiwiZ2V0UERPTU9yZGVyIiwiaGFzUERPTU9yZGVyIiwiZ2V0UERPTVBhcmVudCIsInBkb21QYXJlbnQiLCJnZXRFZmZlY3RpdmVDaGlsZHJlbiIsIm5vbk9yZGVyZWRDaGlsZHJlbiIsIl9jaGlsZHJlbiIsImNoaWxkIiwiZWZmZWN0aXZlQ2hpbGRyZW4iLCJwbGFjZWhvbGRlckluZGV4IiwidW5zaGlmdCIsInByb3RvdHlwZSIsImFwcGx5Iiwic2V0UERPTVZpc2libGUiLCJvblBET01WaXNpYmlsaXR5Q2hhbmdlIiwicGRvbVZpc2libGUiLCJpc1BET01WaXNpYmxlIiwiaXNQRE9NRGlzcGxheWVkIiwiaXNHbG9iYWxseVZpc2libGUiLCJwZG9tRGlzcGxheWVkIiwic2V0SW5wdXRWYWx1ZSIsIm9uSW5wdXRWYWx1ZUNoYW5nZSIsImlucHV0VmFsdWUiLCJnZXRJbnB1dFZhbHVlIiwic2V0UERPTUNoZWNrZWQiLCJjaGVja2VkIiwiYXNQcm9wZXJ0eSIsInBkb21DaGVja2VkIiwiZ2V0UERPTUNoZWNrZWQiLCJnZXRQRE9NQXR0cmlidXRlcyIsInBkb21BdHRyaWJ1dGVzIiwiYXR0cmlidXRlIiwicHJvdmlkZWRPcHRpb25zIiwiT2JqZWN0IiwiZ2V0UHJvdG90eXBlT2YiLCJTVFJJTkdfV0lUSE9VVF9URU1QTEFURV9WQVJTX1ZBTElEQVRPUiIsIm5hbWVzcGFjZSIsIlBSSU1BUllfU0lCTElORyIsImN1cnJlbnRBdHRyaWJ1dGUiLCJhdHRyaWJ1dGVSZW1vdmVkIiwicmVtb3ZlUERPTUF0dHJpYnV0ZXMiLCJhdHRyaWJ1dGVzIiwiaGFzUERPTUF0dHJpYnV0ZSIsImF0dHJpYnV0ZUZvdW5kIiwic2V0UERPTUNsYXNzIiwiY2xhc3NOYW1lIiwiY3VycmVudENsYXNzIiwic2V0Q2xhc3NUb0VsZW1lbnQiLCJyZW1vdmVQRE9NQ2xhc3MiLCJjbGFzc1JlbW92ZWQiLCJyZW1vdmVDbGFzc0Zyb21FbGVtZW50IiwiZ2V0UERPTUNsYXNzZXMiLCJwZG9tQ2xhc3NlcyIsInNldEZvY3VzYWJsZSIsImlzRm9jdXNhYmxlIiwidGFnSXNEZWZhdWx0Rm9jdXNhYmxlIiwicGRvbVRyYW5zZm9ybVNvdXJjZU5vZGUiLCJnZXRQRE9NVHJhbnNmb3JtU291cmNlTm9kZSIsInNldFBvc2l0aW9uSW5QRE9NIiwicG9zaXRpb25JblBET00iLCJnZXRQb3NpdGlvbkluUERPTSIsInNldEV4Y2x1ZGVMYWJlbFNpYmxpbmdGcm9tSW5wdXQiLCJpc0luc2lkZVBoZXRpb0FyY2hldHlwZSIsImlzUGhldGlvSW5zdHJ1bWVudGVkIiwicGhldGlvSXNBcmNoZXR5cGUiLCJwYXJlbnRzIiwiYWxlcnREZXNjcmlwdGlvblV0dGVyYW5jZSIsInV0dGVyYW5jZSIsImhhc0luIiwid2luZG93IiwicGhldCIsInBoZXRpbyIsInBoZXRpb0VuZ2luZSIsInBoZXRpb1N0YXRlRW5naW5lIiwiaXNTZXR0aW5nU3RhdGVQcm9wZXJ0eSIsIlBIRVRfSU9fRU5BQkxFRCIsImNvbm5lY3RlZERpc3BsYXlzIiwiZ2V0Q29ubmVjdGVkRGlzcGxheXMiLCJkaXNwbGF5IiwiaXNBY2Nlc3NpYmxlIiwiZGVzY3JpcHRpb25VdHRlcmFuY2VRdWV1ZSIsImFkZFRvQmFjayIsImZvckVhY2hVdHRlcmFuY2VRdWV1ZSIsImNhbGxiYWNrIiwiZ2V0QmFzZU9wdGlvbnMiLCJjdXJyZW50T3B0aW9ucyIsIm9wdGlvbk5hbWUiLCJnZXROZXN0ZWRQRE9NT3JkZXIiLCJjdXJyZW50VHJhaWwiLCJwcnVuZVN0YWNrIiwibmVzdGVkQ2hpbGRTdGFjayIsImFkZFRyYWlsc0Zvck5vZGUiLCJvdmVycmlkZVBydW5pbmciLCJwcnVuZUNvdW50IiwiZWFjaCIsInBydW5lTm9kZSIsIml0ZW0iLCJ0cmFpbCIsImNvcHkiLCJhcnJheVBET01PcmRlciIsImNvbmNhdCIsImRlc2NlbmRhbnQiLCJnZXRMZWFmVHJhaWxzVG8iLCJkZXNjZW5kYW50VHJhaWwiLCJyZW1vdmVBbmNlc3RvciIsImFkZERlc2NlbmRhbnRUcmFpbCIsInJlbW92ZURlc2NlbmRhbnRUcmFpbCIsIm51bUNoaWxkcmVuIiwiYWRkRGVzY2VuZGFudCIsInJlbW92ZURlc2NlbmRhbnQiLCJwb3AiLCJwZG9tQ29udGVudENoYW5nZSIsIm9uUERPTUFkZENoaWxkIiwic2NlbmVyeUxvZyIsImlkIiwicmVjdXIiLCJfcmVuZGVyZXJTdW1tYXJ5IiwiaGFzTm9QRE9NIiwiYXVkaXROb2RlRm9yUERPTUN5Y2xlcyIsIm9uQWRkQ2hpbGQiLCJhZGRDaGlsZCIsIm9uUERPTVJlbW92ZUNoaWxkIiwib25SZW1vdmVDaGlsZCIsInJlbW92ZUNoaWxkIiwib25QRE9NUmVvcmRlcmVkQ2hpbGRyZW4iLCJjaGlsZHJlbk9yZGVyQ2hhbmdlIiwidXBkYXRlTGlua2VkRWxlbWVudEZvclByb3BlcnR5IiwidGFuZGVtTmFtZSIsIm9sZFByb3BlcnR5IiwibmV3UHJvcGVydHkiLCJyZW1vdmVMaW5rZWRFbGVtZW50cyIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImFkZExpbmtlZEVsZW1lbnQiLCJnZXRQRE9NSW5zdGFuY2VzIiwiYWRkUERPTUluc3RhbmNlIiwicGRvbUluc3RhbmNlIiwicmVtb3ZlUERPTUluc3RhbmNlIiwidGFnTmFtZVN1cHBvcnRzQ29udGVudCIsIkhFTFBfVEVYVF9CRUZPUkVfQ09OVEVOVCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGFyYWxsZWxET00udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBzdXBlcmNsYXNzIGZvciBOb2RlLCBhZGRpbmcgYWNjZXNzaWJpbGl0eSBieSBkZWZpbmluZyBjb250ZW50IGZvciB0aGUgUGFyYWxsZWwgRE9NLiBQbGVhc2Ugbm90ZSB0aGF0IE5vZGUgYW5kXHJcbiAqIFBhcmFsbGVsRE9NIGFyZSBjbG9zZWx5IGludGVydHdpbmVkLCB0aG91Z2ggdGhleSBhcmUgc2VwYXJhdGVkIGludG8gc2VwYXJhdGUgZmlsZXMgaW4gdGhlIHR5cGUgaGllcmFyY2h5LlxyXG4gKlxyXG4gKiBUaGUgUGFyYWxsZWwgRE9NIGlzIGFuIEhUTUwgc3RydWN0dXJlIHRoYXQgcHJvdmlkZXMgc2VtYW50aWNzIGZvciBhc3Npc3RpdmUgdGVjaG5vbG9naWVzLiBGb3Igd2ViIGNvbnRlbnQgdG8gYmVcclxuICogYWNjZXNzaWJsZSwgYXNzaXN0aXZlIHRlY2hub2xvZ2llcyByZXF1aXJlIEhUTUwgbWFya3VwLCB3aGljaCBpcyBzb21ldGhpbmcgdGhhdCBwdXJlIGdyYXBoaWNhbCBjb250ZW50IGRvZXMgbm90XHJcbiAqIGluY2x1ZGUuIFRoaXMgYWRkcyB0aGUgYWNjZXNzaWJsZSBIVE1MIGNvbnRlbnQgZm9yIGFueSBOb2RlIGluIHRoZSBzY2VuZSBncmFwaC5cclxuICpcclxuICogQW55IE5vZGUgY2FuIGhhdmUgcGRvbSBjb250ZW50LCBidXQgdGhleSBoYXZlIHRvIG9wdCBpbnRvIGl0LiBUaGUgc3RydWN0dXJlIG9mIHRoZSBwZG9tIGNvbnRlbnQgd2lsbFxyXG4gKiBtYXRjaCB0aGUgc3RydWN0dXJlIG9mIHRoZSBzY2VuZSBncmFwaC5cclxuICpcclxuICogU2F5IHdlIGhhdmUgdGhlIGZvbGxvd2luZyBzY2VuZSBncmFwaDpcclxuICpcclxuICogICBBXHJcbiAqICAvIFxcXHJcbiAqIEIgICBDXHJcbiAqICAgIC8gXFxcclxuICogICBEICAgRVxyXG4gKiAgICAgICAgXFxcclxuICogICAgICAgICBGXHJcbiAqXHJcbiAqIEFuZCBzYXkgdGhhdCBub2RlcyBBLCBCLCBDLCBELCBhbmQgRiBzcGVjaWZ5IHBkb20gY29udGVudCBmb3IgdGhlIERPTS4gIFNjZW5lcnkgd2lsbCByZW5kZXIgdGhlIHBkb21cclxuICogY29udGVudCBsaWtlIHNvOlxyXG4gKlxyXG4gKiA8ZGl2IGlkPVwibm9kZS1BXCI+XHJcbiAqICAgPGRpdiBpZD1cIm5vZGUtQlwiPjwvZGl2PlxyXG4gKiAgIDxkaXYgaWQ9XCJub2RlLUNcIj5cclxuICogICAgIDxkaXYgaWQ9XCJub2RlLURcIj48L2Rpdj5cclxuICogICAgIDxkaXYgaWQ9XCJub2RlLUZcIj48L2Rpdj5cclxuICogICA8L2Rpdj5cclxuICogPC9kaXY+XHJcbiAqXHJcbiAqIEluIHRoaXMgZXhhbXBsZSwgZWFjaCBlbGVtZW50IGlzIHJlcHJlc2VudGVkIGJ5IGEgZGl2LCBidXQgYW55IEhUTUwgZWxlbWVudCBjb3VsZCBiZSB1c2VkLiBOb3RlIHRoYXQgaW4gdGhpcyBleGFtcGxlLFxyXG4gKiBub2RlIEUgZGlkIG5vdCBzcGVjaWZ5IHBkb20gY29udGVudCwgc28gbm9kZSBGIHdhcyBhZGRlZCBhcyBhIGNoaWxkIHVuZGVyIG5vZGUgQy4gIElmIG5vZGUgRSBoYWQgc3BlY2lmaWVkXHJcbiAqIHBkb20gY29udGVudCwgY29udGVudCBmb3Igbm9kZSBGIHdvdWxkIGhhdmUgYmVlbiBhZGRlZCBhcyBhIGNoaWxkIHVuZGVyIHRoZSBjb250ZW50IGZvciBub2RlIEUuXHJcbiAqXHJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqICNCQVNJQyBFWEFNUExFXHJcbiAqXHJcbiAqIEluIGEgYmFzaWMgZXhhbXBsZSBsZXQncyBzYXkgdGhhdCB3ZSB3YW50IHRvIG1ha2UgYSBOb2RlIGFuIHVub3JkZXJlZCBsaXN0LiBUbyBkbyB0aGlzLCBhZGQgdGhlIGB0YWdOYW1lYCBvcHRpb24gdG9cclxuICogdGhlIE5vZGUsIGFuZCBhc3NpZ24gaXQgdG8gdGhlIHN0cmluZyBcInVsXCIuIEhlcmUgaXMgd2hhdCB0aGUgY29kZSBjb3VsZCBsb29rIGxpa2U6XHJcbiAqXHJcbiAqIHZhciBteVVub3JkZXJlZExpc3QgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAndWwnIH0gKTtcclxuICpcclxuICogVG8gZ2V0IHRoZSBkZXNpcmVkIGxpc3QgaHRtbCwgd2UgY2FuIGFzc2lnbiB0aGUgYGxpYCBgdGFnTmFtZWAgdG8gY2hpbGRyZW4gTm9kZXMsIGxpa2U6XHJcbiAqXHJcbiAqIHZhciBsaXN0SXRlbTEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnbGknIH0gKTtcclxuICogbXlVbm9yZGVyZWRMaXN0LmFkZENoaWxkKCBsaXN0SXRlbTEgKTtcclxuICpcclxuICogTm93IHdlIGhhdmUgYSBzaW5nbGUgbGlzdCBlbGVtZW50IGluIHRoZSB1bm9yZGVyZWQgbGlzdC4gVG8gYXNzaWduIGNvbnRlbnQgdG8gdGhpcyA8bGk+LCB1c2UgdGhlIGBpbm5lckNvbnRlbnRgXHJcbiAqIG9wdGlvbiAoYWxsIG9mIHRoZXNlIE5vZGUgb3B0aW9ucyBoYXZlIGdldHRlcnMgYW5kIHNldHRlcnMsIGp1c3QgbGlrZSBhbnkgb3RoZXIgTm9kZSBvcHRpb24pOlxyXG4gKlxyXG4gKiBsaXN0SXRlbTEuaW5uZXJDb250ZW50ID0gJ0kgYW0gbGlzdCBpdGVtIG51bWJlciAxJztcclxuICpcclxuICogVGhlIGFib3ZlIG9wZXJhdGlvbnMgd2lsbCBjcmVhdGUgdGhlIGZvbGxvd2luZyBQRE9NIHN0cnVjdHVyZSAobm90ZSB0aGF0IGFjdHVhbCBpZHMgd2lsbCBiZSBkaWZmZXJlbnQpOlxyXG4gKlxyXG4gKiA8dWwgaWQ9J215VW5vcmRlcmVkTGlzdCc+XHJcbiAqICAgPGxpPkkgYW0gYSBsaXN0IGl0ZW0gbnVtYmVyIDE8L2xpPlxyXG4gKiA8L3VsXHJcbiAqXHJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqICNET00gU0lCTElOR1NcclxuICpcclxuICogVGhlIEFQSSBpbiB0aGlzIGNsYXNzIGFsbG93cyB5b3UgdG8gYWRkIGFkZGl0aW9uYWwgc3RydWN0dXJlIHRvIHRoZSBhY2Nlc3NpYmxlIERPTSBjb250ZW50IGlmIG5lY2Vzc2FyeS4gRWFjaCBub2RlXHJcbiAqIGNhbiBoYXZlIG11bHRpcGxlIERPTSBFbGVtZW50cyBhc3NvY2lhdGVkIHdpdGggaXQuIEEgTm9kZSBjYW4gaGF2ZSBhIGxhYmVsIERPTSBlbGVtZW50LCBhbmQgYSBkZXNjcmlwdGlvbiBET00gZWxlbWVudC5cclxuICogVGhlc2UgYXJlIGNhbGxlZCBzaWJsaW5ncy4gVGhlIE5vZGUncyBkaXJlY3QgRE9NIGVsZW1lbnQgKHRoZSBET00gZWxlbWVudCB5b3UgY3JlYXRlIHdpdGggdGhlIGB0YWdOYW1lYCBvcHRpb24pXHJcbiAqIGlzIGNhbGxlZCB0aGUgXCJwcmltYXJ5IHNpYmxpbmcuXCIgWW91IGNhbiBhbHNvIGhhdmUgYSBjb250YWluZXIgcGFyZW50IERPTSBlbGVtZW50IHRoYXQgc3Vycm91bmRzIGFsbCBvZiB0aGVzZVxyXG4gKiBzaWJsaW5ncy4gV2l0aCB0aHJlZSBzaWJsaW5ncyBhbmQgYSBjb250YWluZXIgcGFyZW50LCBlYWNoIE5vZGUgY2FuIGhhdmUgdXAgdG8gNCBET00gRWxlbWVudHMgcmVwcmVzZW50aW5nIGl0IGluIHRoZVxyXG4gKiBQRE9NLiBIZXJlIGlzIGFuIGV4YW1wbGUgb2YgaG93IGEgTm9kZSBtYXkgdXNlIHRoZXNlIGZlYXR1cmVzOlxyXG4gKlxyXG4gKiA8ZGl2PlxyXG4gKiAgIDxsYWJlbCBmb3I9XCJteUlucHV0XCI+VGhpcyBncmVhdCBsYWJlbCBmb3IgaW5wdXQ8L2xhYmVsXHJcbiAqICAgPGlucHV0IGlkPVwibXlJbnB1dFwiLz5cclxuICogICA8cD5UaGlzIGlzIGEgZGVzY3JpcHRpb24gZm9yIHRoZSBpbnB1dDwvcD5cclxuICogPC9kaXY+XHJcbiAqXHJcbiAqIEFsdGhvdWdoIHlvdSBjYW4gY3JlYXRlIHRoaXMgc3RydWN0dXJlIHdpdGggZm91ciBub2RlcyAoYGlucHV0YCBBLCBgbGFiZWwgQiwgYW5kIGBwYCBDIGNoaWxkcmVuIHRvIGBkaXZgIEQpLFxyXG4gKiB0aGlzIHN0cnVjdHVyZSBjYW4gYmUgY3JlYXRlZCB3aXRoIG9uZSBzaW5nbGUgTm9kZS4gSXQgaXMgb2Z0ZW4gcHJlZmVyYWJsZSB0byBkbyB0aGlzIHRvIGxpbWl0IHRoZSBudW1iZXIgb2YgbmV3XHJcbiAqIE5vZGVzIHRoYXQgaGF2ZSB0byBiZSBjcmVhdGVkIGp1c3QgZm9yIGFjY2Vzc2liaWxpdHkgcHVycG9zZXMuIFRvIGFjY29tcGxpc2ggdGhpcyB3ZSBoYXZlIHRoZSBmb2xsb3dpbmcgTm9kZSBjb2RlLlxyXG4gKlxyXG4gKiBuZXcgTm9kZSgge1xyXG4gKiAgdGFnTmFtZTogJ2lucHV0J1xyXG4gKiAgbGFiZWxUYWdOYW1lOiAnbGFiZWwnLFxyXG4gKiAgbGFiZWxDb250ZW50OiAnVGhpcyBncmVhdCBsYWJlbCBmb3IgaW5wdXQnXHJcbiAqICBkZXNjcmlwdGlvblRhZ05hbWU6ICdwJyxcclxuICogIGRlc2NyaXB0aW9uQ29udGVudDogJ1RoaXMgaXMgYSBkZXNjcmlwdGlvbiBmb3IgdGhlIGlucHV0JyxcclxuICogIGNvbnRhaW5lclRhZ05hbWU6ICdkaXYnXHJcbiAqIH0pO1xyXG4gKlxyXG4gKiBBIGZldyBub3RlczpcclxuICogMS4gT25seSB0aGUgcHJpbWFyeSBzaWJsaW5nIChzcGVjaWZpZWQgYnkgdGFnTmFtZSkgaXMgZm9jdXNhYmxlLiBVc2luZyBhIGZvY3VzYWJsZSBlbGVtZW50IHRocm91Z2ggYW5vdGhlciBlbGVtZW50XHJcbiAqICAgIChsaWtlIGxhYmVsVGFnTmFtZSkgd2lsbCByZXN1bHQgaW4gYnVnZ3kgYmVoYXZpb3IuXHJcbiAqIDIuIE5vdGljZSB0aGUgbmFtZXMgb2YgdGhlIGNvbnRlbnQgc2V0dGVycyBmb3Igc2libGluZ3MgcGFyYWxsZWwgdGhlIGBpbm5lckNvbnRlbnRgIG9wdGlvbiBmb3Igc2V0dGluZyB0aGUgcHJpbWFyeVxyXG4gKiAgICBzaWJsaW5nLlxyXG4gKiAzLiBUbyBtYWtlIHRoaXMgZXhhbXBsZSBhY3R1YWxseSB3b3JrLCB5b3Ugd291bGQgbmVlZCB0aGUgYGlucHV0VHlwZWAgb3B0aW9uIHRvIHNldCB0aGUgXCJ0eXBlXCIgYXR0cmlidXRlIG9uIHRoZSBgaW5wdXRgLlxyXG4gKiA0LiBXaGVuIHlvdSBzcGVjaWZ5IHRoZSAgPGxhYmVsPiB0YWcgZm9yIHRoZSBsYWJlbCBzaWJsaW5nLCB0aGUgXCJmb3JcIiBhdHRyaWJ1dGUgaXMgYXV0b21hdGljYWxseSBhZGRlZCB0byB0aGUgc2libGluZy5cclxuICogNS4gRmluYWxseSwgdGhlIGV4YW1wbGUgYWJvdmUgZG9lc24ndCB1dGlsaXplIHRoZSBkZWZhdWx0IHRhZ3MgdGhhdCB3ZSBoYXZlIGluIHBsYWNlIGZvciB0aGUgcGFyZW50IGFuZCBzaWJsaW5ncy5cclxuICogICAgICBkZWZhdWx0IGxhYmVsVGFnTmFtZTogJ3AnXHJcbiAqICAgICAgZGVmYXVsdCBkZXNjcmlwdGlvblRhZ05hbWU6ICdwJ1xyXG4gKiAgICAgIGRlZmF1bHQgY29udGFpbmVyVGFnTmFtZTogJ2RpdidcclxuICogICAgc28gdGhlIGZvbGxvd2luZyB3aWxsIHlpZWxkIHRoZSBzYW1lIFBET00gc3RydWN0dXJlOlxyXG4gKlxyXG4gKiAgICBuZXcgTm9kZSgge1xyXG4gKiAgICAgdGFnTmFtZTogJ2lucHV0JyxcclxuICogICAgIGxhYmVsVGFnTmFtZTogJ2xhYmVsJyxcclxuICogICAgIGxhYmVsQ29udGVudDogJ1RoaXMgZ3JlYXQgbGFiZWwgZm9yIGlucHV0J1xyXG4gKiAgICAgZGVzY3JpcHRpb25Db250ZW50OiAnVGhpcyBpcyBhIGRlc2NyaXB0aW9uIGZvciB0aGUgaW5wdXQnLFxyXG4gKiAgICB9KTtcclxuICpcclxuICogVGhlIFBhcmFsbGVsRE9NIGNsYXNzIGlzIHNtYXJ0IGVub3VnaCB0byBrbm93IHdoZW4gdGhlcmUgbmVlZHMgdG8gYmUgYSBjb250YWluZXIgcGFyZW50IHRvIHdyYXAgbXVsdGlwbGUgc2libGluZ3MsXHJcbiAqIGl0IGlzIG5vdCBuZWNlc3NhcnkgdG8gdXNlIHRoYXQgb3B0aW9uIHVubGVzcyB0aGUgZGVzaXJlZCB0YWcgbmFtZSBpcyAgc29tZXRoaW5nIG90aGVyIHRoYW4gJ2RpdicuXHJcbiAqXHJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqXHJcbiAqIEZvciBhZGRpdGlvbmFsIGFjY2Vzc2liaWxpdHkgb3B0aW9ucywgcGxlYXNlIHNlZSB0aGUgb3B0aW9ucyBsaXN0ZWQgaW4gQUNDRVNTSUJJTElUWV9PUFRJT05fS0VZUy4gVG8gdW5kZXJzdGFuZCB0aGVcclxuICogUERPTSBtb3JlLCBzZWUgUERPTVBlZXIsIHdoaWNoIG1hbmFnZXMgdGhlIERPTSBFbGVtZW50cyBmb3IgYSBub2RlLiBGb3IgbW9yZSBkb2N1bWVudGF0aW9uIG9uIFNjZW5lcnksIE5vZGVzLFxyXG4gKiBhbmQgdGhlIHNjZW5lIGdyYXBoLCBwbGVhc2Ugc2VlIGh0dHA6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgVGlueUVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UaW55RW1pdHRlci5qcyc7XHJcbmltcG9ydCB2YWxpZGF0ZSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL3ZhbGlkYXRlLmpzJztcclxuaW1wb3J0IFZhbGlkYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9WYWxpZGF0aW9uLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgYXJyYXlEaWZmZXJlbmNlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hcnJheURpZmZlcmVuY2UuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0LCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IFV0dGVyYW5jZVF1ZXVlIGZyb20gJy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2VRdWV1ZS5qcyc7XHJcbmltcG9ydCB7IFRBbGVydGFibGUgfSBmcm9tICcuLi8uLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvVXR0ZXJhbmNlLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUERPTURpc3BsYXlzSW5mbywgUERPTUluc3RhbmNlLCBQRE9NUGVlciwgUERPTVRyZWUsIFBET01VdGlscywgc2NlbmVyeSwgVHJhaWwgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHsgSGlnaGxpZ2h0IH0gZnJvbSAnLi4vLi4vb3ZlcmxheXMvSGlnaGxpZ2h0T3ZlcmxheS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBURW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RFbWl0dGVyLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVGlueVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVGlueVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRpbnlGb3J3YXJkaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UaW55Rm9yd2FyZGluZ1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XHJcblxyXG5jb25zdCBJTlBVVF9UQUcgPSBQRE9NVXRpbHMuVEFHUy5JTlBVVDtcclxuY29uc3QgUF9UQUcgPSBQRE9NVXRpbHMuVEFHUy5QO1xyXG5cclxuLy8gZGVmYXVsdCB0YWcgbmFtZXMgZm9yIHNpYmxpbmdzXHJcbmNvbnN0IERFRkFVTFRfREVTQ1JJUFRJT05fVEFHX05BTUUgPSBQX1RBRztcclxuY29uc3QgREVGQVVMVF9MQUJFTF9UQUdfTkFNRSA9IFBfVEFHO1xyXG5cclxuZXhwb3J0IHR5cGUgUERPTVZhbHVlVHlwZSA9IHN0cmluZyB8IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz47XHJcblxyXG4vLyBzZWUgc2V0UERPTUhlYWRpbmdCZWhhdmlvciBmb3IgbW9yZSBkZXRhaWxzXHJcbmNvbnN0IERFRkFVTFRfUERPTV9IRUFESU5HX0JFSEFWSU9SID0gKCBub2RlOiBOb2RlLCBvcHRpb25zOiBQYXJhbGxlbERPTU9wdGlvbnMsIGhlYWRpbmc6IFBET01WYWx1ZVR5cGUgKSA9PiB7XHJcblxyXG4gIG9wdGlvbnMubGFiZWxUYWdOYW1lID0gYGgke25vZGUuaGVhZGluZ0xldmVsfWA7IC8vIFRPRE86IG1ha2Ugc3VyZSBoZWFkaW5nIGxldmVsIGNoYW5nZSBmaXJlcyBhIGZ1bGwgcGVlciByZWJ1aWxkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg2N1xyXG4gIG9wdGlvbnMubGFiZWxDb250ZW50ID0gaGVhZGluZztcclxuICByZXR1cm4gb3B0aW9ucztcclxufTtcclxuXHJcbmNvbnN0IHVud3JhcFByb3BlcnR5ID0gKCB2YWx1ZU9yUHJvcGVydHk6IFBET01WYWx1ZVR5cGUgfCBudWxsICk6IHN0cmluZyB8IG51bGwgPT4ge1xyXG4gIGNvbnN0IHJlc3VsdCA9IHZhbHVlT3JQcm9wZXJ0eSA9PT0gbnVsbCA/IG51bGwgOiAoIHR5cGVvZiB2YWx1ZU9yUHJvcGVydHkgPT09ICdzdHJpbmcnID8gdmFsdWVPclByb3BlcnR5IDogdmFsdWVPclByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gIGFzc2VydCAmJiBhc3NlcnQoIHJlc3VsdCA9PT0gbnVsbCB8fCB0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJyApO1xyXG5cclxuICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuLy8gdGhlc2UgZWxlbWVudHMgYXJlIHR5cGljYWxseSBhc3NvY2lhdGVkIHdpdGggZm9ybXMsIGFuZCBzdXBwb3J0IGNlcnRhaW4gYXR0cmlidXRlc1xyXG5jb25zdCBGT1JNX0VMRU1FTlRTID0gUERPTVV0aWxzLkZPUk1fRUxFTUVOVFM7XHJcblxyXG4vLyBsaXN0IG9mIGlucHV0IFwidHlwZVwiIGF0dHJpYnV0ZSB2YWx1ZXMgdGhhdCBzdXBwb3J0IHRoZSBcImNoZWNrZWRcIiBhdHRyaWJ1dGVcclxuY29uc3QgSU5QVVRfVFlQRVNfVEhBVF9TVVBQT1JUX0NIRUNLRUQgPSBQRE9NVXRpbHMuSU5QVVRfVFlQRVNfVEhBVF9TVVBQT1JUX0NIRUNLRUQ7XHJcblxyXG4vLyBIVE1MRWxlbWVudCBhdHRyaWJ1dGVzIHdob3NlIHZhbHVlIGlzIGFuIElEIG9mIGFub3RoZXIgZWxlbWVudFxyXG5jb25zdCBBU1NPQ0lBVElPTl9BVFRSSUJVVEVTID0gUERPTVV0aWxzLkFTU09DSUFUSU9OX0FUVFJJQlVURVM7XHJcblxyXG4vLyBUaGUgb3B0aW9ucyBmb3IgdGhlIFBhcmFsbGVsRE9NIEFQSS4gSW4gZ2VuZXJhbCwgbW9zdCBkZWZhdWx0IHRvIG51bGw7IHRvIGNsZWFyLCBzZXQgYmFjayB0byBudWxsLiBFYWNoIG9uZSBvZlxyXG4vLyB0aGVzZSBoYXMgYW4gYXNzb2NpYXRlZCBzZXR0ZXIsIHNlZSBzZXR0ZXIgZnVuY3Rpb25zIGZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IGVhY2guXHJcbmNvbnN0IEFDQ0VTU0lCSUxJVFlfT1BUSU9OX0tFWVMgPSBbXHJcblxyXG4gIC8vIE9yZGVyIG1hdHRlcnMuIEhhdmluZyBmb2N1cyBiZWZvcmUgdGFnTmFtZSBjb3ZlcnMgdGhlIGNhc2Ugd2hlcmUgeW91IGNoYW5nZSB0aGUgdGFnTmFtZSBhbmQgZm9jdXNhYmlsaXR5IG9mIGFcclxuICAvLyBjdXJyZW50bHkgZm9jdXNlZCBub2RlLiBXZSB3YW50IHRoZSBmb2N1c2FiaWxpdHkgdG8gdXBkYXRlIGNvcnJlY3RseS5cclxuICAnZm9jdXNhYmxlJyxcclxuICAndGFnTmFtZScsXHJcblxyXG4gIC8qXHJcbiAgICogSGlnaGVyIExldmVsIEFQSSBGdW5jdGlvbnNcclxuICAgKi9cclxuICAnYWNjZXNzaWJsZU5hbWUnLFxyXG4gICdhY2Nlc3NpYmxlTmFtZUJlaGF2aW9yJyxcclxuICAnaGVscFRleHQnLFxyXG4gICdoZWxwVGV4dEJlaGF2aW9yJyxcclxuICAncGRvbUhlYWRpbmcnLFxyXG4gICdwZG9tSGVhZGluZ0JlaGF2aW9yJyxcclxuXHJcbiAgLypcclxuICAgKiBMb3dlciBMZXZlbCBBUEkgRnVuY3Rpb25zXHJcbiAgICovXHJcbiAgJ2NvbnRhaW5lclRhZ05hbWUnLFxyXG4gICdjb250YWluZXJBcmlhUm9sZScsXHJcblxyXG4gICdpbm5lckNvbnRlbnQnLFxyXG4gICdpbnB1dFR5cGUnLFxyXG4gICdpbnB1dFZhbHVlJyxcclxuICAncGRvbUNoZWNrZWQnLFxyXG4gICdwZG9tTmFtZXNwYWNlJyxcclxuICAnYXJpYUxhYmVsJyxcclxuICAnYXJpYVJvbGUnLFxyXG4gICdhcmlhVmFsdWVUZXh0JyxcclxuXHJcbiAgJ2xhYmVsVGFnTmFtZScsXHJcbiAgJ2xhYmVsQ29udGVudCcsXHJcbiAgJ2FwcGVuZExhYmVsJyxcclxuXHJcbiAgJ2Rlc2NyaXB0aW9uVGFnTmFtZScsXHJcbiAgJ2Rlc2NyaXB0aW9uQ29udGVudCcsXHJcbiAgJ2FwcGVuZERlc2NyaXB0aW9uJyxcclxuXHJcbiAgJ2ZvY3VzSGlnaGxpZ2h0JyxcclxuICAnZm9jdXNIaWdobGlnaHRMYXllcmFibGUnLFxyXG4gICdncm91cEZvY3VzSGlnaGxpZ2h0JyxcclxuICAncGRvbVZpc2libGUnLFxyXG4gICdwZG9tT3JkZXInLFxyXG5cclxuICAnYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnMnLFxyXG4gICdhcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMnLFxyXG4gICdhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zJyxcclxuXHJcbiAgJ3Bvc2l0aW9uSW5QRE9NJyxcclxuXHJcbiAgJ3Bkb21UcmFuc2Zvcm1Tb3VyY2VOb2RlJ1xyXG5dO1xyXG5cclxuLy8gTW9zdCBvcHRpb25zIHVzZSBudWxsIGZvciB0aGVpciBkZWZhdWx0IGJlaGF2aW9yLCBzZWUgdGhlIHNldHRlcnMgZm9yIGVhY2ggb3B0aW9uIGZvciBhIGRlc2NyaXB0aW9uIG9mIGhvdyBudWxsXHJcbi8vIGJlaGF2ZXMgYXMgYSBkZWZhdWx0LlxyXG5leHBvcnQgdHlwZSBQYXJhbGxlbERPTU9wdGlvbnMgPSB7XHJcbiAgZm9jdXNhYmxlPzogYm9vbGVhbiB8IG51bGw7IC8vIFNldHMgd2hldGhlciB0aGUgbm9kZSBjYW4gcmVjZWl2ZSBrZXlib2FyZCBmb2N1c1xyXG4gIHRhZ05hbWU/OiBzdHJpbmcgfCBudWxsOyAvLyBTZXRzIHRoZSB0YWcgbmFtZSBmb3IgdGhlIHByaW1hcnkgc2libGluZyBET00gZWxlbWVudCBpbiB0aGUgcGFyYWxsZWwgRE9NLCBzaG91bGQgYmUgZmlyc3RcclxuXHJcbiAgLypcclxuICAgKiBIaWdoZXIgTGV2ZWwgQVBJIEZ1bmN0aW9uc1xyXG4gICAqL1xyXG4gIGFjY2Vzc2libGVOYW1lPzogUERPTVZhbHVlVHlwZSB8IG51bGw7IC8vIFNldHMgdGhlIG5hbWUgb2YgdGhpcyBub2RlLCByZWFkIHdoZW4gdGhpcyBub2RlIHJlY2VpdmVzIGZvY3VzIGFuZCBpbnNlcnRlZCBhcHByb3ByaWF0ZWx5IGJhc2VkIG9uIGFjY2Vzc2libGVOYW1lQmVoYXZpb3JcclxuICBhY2Nlc3NpYmxlTmFtZUJlaGF2aW9yPzogUERPTUJlaGF2aW9yRnVuY3Rpb247IC8vIFNldHMgdGhlIHdheSBpbiB3aGljaCBhY2Nlc3NpYmxlTmFtZSB3aWxsIGJlIHNldCBmb3IgdGhlIE5vZGUsIHNlZSBERUZBVUxUX0FDQ0VTU0lCTEVfTkFNRV9CRUhBVklPUiBmb3IgZXhhbXBsZVxyXG4gIGhlbHBUZXh0PzogUERPTVZhbHVlVHlwZSB8IG51bGw7IC8vIFNldHMgdGhlIGRlc2NyaXB0aXZlIGNvbnRlbnQgZm9yIHRoaXMgbm9kZSwgcmVhZCBieSB0aGUgdmlydHVhbCBjdXJzb3IsIGluc2VydGVkIGludG8gRE9NIGFwcHJvcHJpYXRlbHkgYmFzZWQgb24gaGVscFRleHRCZWhhdmlvclxyXG4gIGhlbHBUZXh0QmVoYXZpb3I/OiBQRE9NQmVoYXZpb3JGdW5jdGlvbjsgLy8gU2V0cyB0aGUgd2F5IGluIHdoaWNoIGhlbHAgdGV4dCB3aWxsIGJlIHNldCBmb3IgdGhlIE5vZGUsIHNlZSBERUZBVUxUX0hFTFBfVEVYVF9CRUhBVklPUiBmb3IgZXhhbXBsZVxyXG4gIHBkb21IZWFkaW5nPzogUERPTVZhbHVlVHlwZSB8IG51bGw7IC8vIFNldHMgY29udGVudCBmb3IgdGhlIGhlYWRpbmcgd2hvc2UgbGV2ZWwgd2lsbCBiZSBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZCBpZiBzcGVjaWZpZWRcclxuICBwZG9tSGVhZGluZ0JlaGF2aW9yPzogUERPTUJlaGF2aW9yRnVuY3Rpb247IC8vIFNldCB0byBtb2RpZnkgZGVmYXVsdCBiZWhhdmlvciBmb3IgaW5zZXJ0aW5nIHBkb21IZWFkaW5nIHN0cmluZ1xyXG5cclxuICAvKlxyXG4gICAqIExvd2VyIExldmVsIEFQSSBGdW5jdGlvbnNcclxuICAgKi9cclxuICBjb250YWluZXJUYWdOYW1lPzogc3RyaW5nIHwgbnVsbDsgLy8gU2V0cyB0aGUgdGFnIG5hbWUgZm9yIGFuIFtvcHRpb25hbF0gZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoaXMgTm9kZSdzIHNpYmxpbmdzXHJcbiAgY29udGFpbmVyQXJpYVJvbGU/OiBzdHJpbmcgfCBudWxsOyAvLyBTZXRzIHRoZSBBUklBIHJvbGUgZm9yIHRoZSBjb250YWluZXIgcGFyZW50IERPTSBlbGVtZW50XHJcblxyXG4gIGlubmVyQ29udGVudD86IFBET01WYWx1ZVR5cGUgfCBudWxsOyAvLyBTZXRzIHRoZSBpbm5lciB0ZXh0IG9yIEhUTUwgZm9yIGEgbm9kZSdzIHByaW1hcnkgc2libGluZyBlbGVtZW50XHJcbiAgaW5wdXRUeXBlPzogc3RyaW5nIHwgbnVsbDsgLy8gU2V0cyB0aGUgaW5wdXQgdHlwZSBmb3IgdGhlIHByaW1hcnkgc2libGluZyBET00gZWxlbWVudCwgb25seSByZWxldmFudCBpZiB0YWdOYW1lIGlzICdpbnB1dCdcclxuICBpbnB1dFZhbHVlPzogUERPTVZhbHVlVHlwZSB8IG51bGwgfCBudW1iZXI7IC8vIFNldHMgdGhlIGlucHV0IHZhbHVlIGZvciB0aGUgcHJpbWFyeSBzaWJsaW5nIERPTSBlbGVtZW50LCBvbmx5IHJlbGV2YW50IGlmIHRhZ05hbWUgaXMgJ2lucHV0J1xyXG4gIHBkb21DaGVja2VkPzogYm9vbGVhbjsgLy8gU2V0cyB0aGUgJ2NoZWNrZWQnIHN0YXRlIGZvciBpbnB1dHMgb2YgdHlwZSAncmFkaW8nIGFuZCAnY2hlY2tib3gnXHJcbiAgcGRvbU5hbWVzcGFjZT86IHN0cmluZyB8IG51bGw7IC8vIFNldHMgdGhlIG5hbWVzcGFjZSBmb3IgdGhlIHByaW1hcnkgZWxlbWVudFxyXG4gIGFyaWFMYWJlbD86IFBET01WYWx1ZVR5cGUgfCBudWxsOyAvLyBTZXRzIHRoZSB2YWx1ZSBvZiB0aGUgJ2FyaWEtbGFiZWwnIGF0dHJpYnV0ZSBvbiB0aGUgcHJpbWFyeSBzaWJsaW5nIG9mIHRoaXMgTm9kZVxyXG4gIGFyaWFSb2xlPzogc3RyaW5nIHwgbnVsbDsgLy8gU2V0cyB0aGUgQVJJQSByb2xlIGZvciB0aGUgcHJpbWFyeSBzaWJsaW5nIG9mIHRoaXMgTm9kZVxyXG4gIGFyaWFWYWx1ZVRleHQ/OiBQRE9NVmFsdWVUeXBlIHwgbnVsbDsgLy8gc2V0cyB0aGUgYXJpYS12YWx1ZXRleHQgYXR0cmlidXRlIG9mIHRoZSBwcmltYXJ5IHNpYmxpbmdcclxuXHJcbiAgbGFiZWxUYWdOYW1lPzogc3RyaW5nIHwgbnVsbDsgLy8gU2V0cyB0aGUgdGFnIG5hbWUgZm9yIHRoZSBET00gZWxlbWVudCBzaWJsaW5nIGxhYmVsaW5nIHRoaXMgbm9kZVxyXG4gIGxhYmVsQ29udGVudD86IFBET01WYWx1ZVR5cGUgfCBudWxsOyAvLyBTZXRzIHRoZSBsYWJlbCBjb250ZW50IGZvciB0aGUgbm9kZVxyXG4gIGFwcGVuZExhYmVsPzogYm9vbGVhbjsgLy8gU2V0cyB0aGUgbGFiZWwgc2libGluZyB0byBjb21lIGFmdGVyIHRoZSBwcmltYXJ5IHNpYmxpbmcgaW4gdGhlIFBET01cclxuXHJcbiAgZGVzY3JpcHRpb25UYWdOYW1lPzogc3RyaW5nIHwgbnVsbDsgLy8gU2V0cyB0aGUgdGFnIG5hbWUgZm9yIHRoZSBET00gZWxlbWVudCBzaWJsaW5nIGRlc2NyaWJpbmcgdGhpcyBub2RlXHJcbiAgZGVzY3JpcHRpb25Db250ZW50PzogUERPTVZhbHVlVHlwZSB8IG51bGw7IC8vIFNldHMgdGhlIGRlc2NyaXB0aW9uIGNvbnRlbnQgZm9yIHRoZSBub2RlXHJcbiAgYXBwZW5kRGVzY3JpcHRpb24/OiBib29sZWFuOyAvLyBTZXRzIHRoZSBkZXNjcmlwdGlvbiBzaWJsaW5nIHRvIGNvbWUgYWZ0ZXIgdGhlIHByaW1hcnkgc2libGluZyBpbiB0aGUgUERPTVxyXG5cclxuICBmb2N1c0hpZ2hsaWdodD86IEhpZ2hsaWdodDsgLy8gU2V0cyB0aGUgZm9jdXMgaGlnaGxpZ2h0IGZvciB0aGUgbm9kZVxyXG4gIGZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlPzogYm9vbGVhbjsgLy9sYWcgdG8gZGV0ZXJtaW5lIGlmIHRoZSBmb2N1cyBoaWdobGlnaHQgbm9kZSBjYW4gYmUgbGF5ZXJlZCBpbiB0aGUgc2NlbmUgZ3JhcGhcclxuICBncm91cEZvY3VzSGlnaGxpZ2h0PzogTm9kZSB8IGJvb2xlYW47IC8vIFNldHMgdGhlIG91dGVyIGZvY3VzIGhpZ2hsaWdodCBmb3IgdGhpcyBub2RlIHdoZW4gYSBkZXNjZW5kYW50IGhhcyBmb2N1c1xyXG4gIHBkb21WaXNpYmxlPzogYm9vbGVhbjsgLy8gU2V0cyB3aGV0aGVyIG9yIG5vdCB0aGUgbm9kZSdzIERPTSBlbGVtZW50IGlzIHZpc2libGUgaW4gdGhlIHBhcmFsbGVsIERPTVxyXG4gIHBkb21PcmRlcj86ICggTm9kZSB8IG51bGwgKVtdIHwgbnVsbDsgLy8gTW9kaWZpZXMgdGhlIG9yZGVyIG9mIGFjY2Vzc2libGUgbmF2aWdhdGlvblxyXG5cclxuICBhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucz86IEFzc29jaWF0aW9uW107IC8vIHNldHMgdGhlIGxpc3Qgb2YgYXJpYS1sYWJlbGxlZGJ5IGFzc29jaWF0aW9ucyBiZXR3ZWVuIGZyb20gdGhpcyBub2RlIHRvIG90aGVycyAoaW5jbHVkaW5nIGl0c2VsZilcclxuICBhcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnM/OiBBc3NvY2lhdGlvbltdOyAvLyBzZXRzIHRoZSBsaXN0IG9mIGFyaWEtZGVzY3JpYmVkYnkgYXNzb2NpYXRpb25zIGJldHdlZW4gZnJvbSB0aGlzIG5vZGUgdG8gb3RoZXJzIChpbmNsdWRpbmcgaXRzZWxmKVxyXG4gIGFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnM/OiBBc3NvY2lhdGlvbltdOyAvLyBzZXRzIHRoZSBsaXN0IG9mIGFyaWEtYWN0aXZlZGVzY2VuZGFudCBhc3NvY2lhdGlvbnMgYmV0d2VlbiBmcm9tIHRoaXMgbm9kZSB0byBvdGhlcnMgKGluY2x1ZGluZyBpdHNlbGYpXHJcblxyXG4gIHBvc2l0aW9uSW5QRE9NPzogYm9vbGVhbjsgLy8gU2V0cyB3aGV0aGVyIHRoZSBub2RlJ3MgRE9NIGVsZW1lbnRzIGFyZSBwb3NpdGlvbmVkIGluIHRoZSB2aWV3cG9ydFxyXG5cclxuICBwZG9tVHJhbnNmb3JtU291cmNlTm9kZT86IE5vZGUgfCBudWxsOyAvLyB7IHNldHMgdGhlIG5vZGUgdGhhdCBjb250cm9scyBwcmltYXJ5IHNpYmxpbmcgZWxlbWVudCBwb3NpdGlvbmluZyBpbiB0aGUgZGlzcGxheSwgc2VlIHNldFBET01UcmFuc2Zvcm1Tb3VyY2VOb2RlKClcclxufSAmIFBoZXRpb09iamVjdE9wdGlvbnM7XHJcblxyXG50eXBlIFBET01BdHRyaWJ1dGUgPSB7XHJcbiAgYXR0cmlidXRlOiBzdHJpbmc7XHJcbiAgdmFsdWU6IFBET01WYWx1ZVR5cGUgfCBib29sZWFuIHwgbnVtYmVyO1xyXG4gIG5hbWVzcGFjZTogc3RyaW5nIHwgbnVsbDtcclxuICBvcHRpb25zOiBTZXRQRE9NQXR0cmlidXRlT3B0aW9ucztcclxufTtcclxuXHJcbnR5cGUgUERPTUNsYXNzID0ge1xyXG4gIGNsYXNzTmFtZTogc3RyaW5nO1xyXG4gIG9wdGlvbnM6IFNldFBET01DbGFzc09wdGlvbnM7XHJcbn07XHJcblxyXG50eXBlIEFzc29jaWF0aW9uID0ge1xyXG4gIG90aGVyTm9kZTogTm9kZTtcclxuICBvdGhlckVsZW1lbnROYW1lOiBzdHJpbmc7XHJcbiAgdGhpc0VsZW1lbnROYW1lOiBzdHJpbmc7XHJcbn07XHJcblxyXG50eXBlIFNldFBET01BdHRyaWJ1dGVPcHRpb25zID0ge1xyXG4gIG5hbWVzcGFjZT86IHN0cmluZyB8IG51bGw7XHJcbiAgYXNQcm9wZXJ0eT86IGJvb2xlYW47XHJcbiAgZWxlbWVudE5hbWU/OiBzdHJpbmc7XHJcbn07XHJcblxyXG50eXBlIFJlbW92ZVBET01BdHRyaWJ1dGVPcHRpb25zID0ge1xyXG4gIG5hbWVzcGFjZT86IHN0cmluZyB8IG51bGw7XHJcbiAgZWxlbWVudE5hbWU/OiBzdHJpbmc7XHJcbn07XHJcblxyXG50eXBlIEhhc1BET01BdHRyaWJ1dGVPcHRpb25zID0ge1xyXG4gIG5hbWVzcGFjZT86IHN0cmluZyB8IG51bGw7XHJcbiAgZWxlbWVudE5hbWU/OiBzdHJpbmc7XHJcbn07XHJcblxyXG50eXBlIFNldFBET01DbGFzc09wdGlvbnMgPSB7XHJcbiAgZWxlbWVudE5hbWU/OiBzdHJpbmc7XHJcbn07XHJcblxyXG50eXBlIFJlbW92ZVBET01DbGFzc09wdGlvbnMgPSB7XHJcbiAgZWxlbWVudE5hbWU/OiBzdHJpbmc7XHJcbn07XHJcblxyXG4vKipcclxuICpcclxuICogQHBhcmFtIG5vZGUgLSB0aGUgbm9kZSB0aGF0IHRoZSBwZG9tIGJlaGF2aW9yIGlzIGJlaW5nIGFwcGxpZWQgdG9cclxuICogQHBhcmFtIG9wdGlvbnMgLSBvcHRpb25zIHRvIG11dGF0ZSB3aXRoaW4gdGhlIGZ1bmN0aW9uXHJcbiAqIEBwYXJhbSB2YWx1ZSAtIHRoZSB2YWx1ZSB0aGF0IHlvdSBhcmUgc2V0dGluZyB0aGUgYmVoYXZpb3Igb2YsIGxpa2UgdGhlIGFjY2Vzc2libGVOYW1lXHJcbiAqIEBwYXJhbSBjYWxsYmFja3NGb3JPdGhlck5vZGVzIC0gYmVoYXZpb3IgZnVuY3Rpb24gYWxzbyBzdXBwb3J0IHRha2luZyBzdGF0ZSBmcm9tIGEgTm9kZSBhbmQgdXNpbmcgaXQgdG9cclxuICogc2V0IHRoZSBhY2Nlc3NpYmxlIGNvbnRlbnQgZm9yIGFub3RoZXIgTm9kZS4gSWYgdGhpcyBpcyB0aGUgY2FzZSwgdGhhdCBsb2dpYyBzaG91bGQgYmUgc2V0IGluIGEgY2xvc3VyZSBhbmQgYWRkZWQgdG9cclxuICogdGhpcyBsaXN0IGZvciBleGVjdXRpb24gYWZ0ZXIgdGhpcyBOb2RlIGlzIGZ1bGx5IGNyZWF0ZWQuIFNlZSBkaXNjdXNzaW9uIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzUwMyNpc3N1ZWNvbW1lbnQtNjc2NTQxMzczXHJcbiAqIEByZXR1cm5zIHRoZSBvcHRpb25zIHRoYXQgaGF2ZSBiZWVuIG11dGF0ZWQgYnkgdGhlIGJlaGF2aW9yIGZ1bmN0aW9uLlxyXG4gKi9cclxuZXhwb3J0IHR5cGUgUERPTUJlaGF2aW9yRnVuY3Rpb24gPSAoIG5vZGU6IE5vZGUsIG9wdGlvbnM6IFBhcmFsbGVsRE9NT3B0aW9ucywgdmFsdWU6IFBET01WYWx1ZVR5cGUsIGNhbGxiYWNrc0Zvck90aGVyTm9kZXM6ICggKCkgPT4gdm9pZCApW10gKSA9PiBQYXJhbGxlbERPTU9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJhbGxlbERPTSBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcblxyXG4gIC8vIFRoZSBIVE1MIHRhZyBuYW1lIG9mIHRoZSBlbGVtZW50IHJlcHJlc2VudGluZyB0aGlzIG5vZGUgaW4gdGhlIERPTVxyXG4gIHByaXZhdGUgX3RhZ05hbWU6IHN0cmluZyB8IG51bGw7XHJcblxyXG4gIC8vIFRoZSBIVE1MIHRhZyBuYW1lIGZvciBhIGNvbnRhaW5lciBwYXJlbnQgZWxlbWVudCBmb3IgdGhpcyBub2RlIGluIHRoZSBET00uIFRoaXNcclxuICAvLyBjb250YWluZXIgcGFyZW50IHdpbGwgY29udGFpbiB0aGUgbm9kZSdzIERPTSBlbGVtZW50LCBhcyB3ZWxsIGFzIHBlZXIgZWxlbWVudHMgZm9yIGFueSBsYWJlbCBvciBkZXNjcmlwdGlvblxyXG4gIC8vIGNvbnRlbnQuIFNlZSBzZXRDb250YWluZXJUYWdOYW1lKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvbi4gSWYgdGhpcyBvcHRpb24gaXMgbmVlZGVkIChsaWtlIHRvXHJcbiAgLy8gY29udGFpbiBtdWx0aXBsZSBzaWJsaW5ncyB3aXRoIHRoZSBwcmltYXJ5IHNpYmxpbmcpLCBpdCB3aWxsIGRlZmF1bHQgdG8gdGhlIHZhbHVlIG9mIERFRkFVTFRfQ09OVEFJTkVSX1RBR19OQU1FLlxyXG4gIHByaXZhdGUgX2NvbnRhaW5lclRhZ05hbWU6IHN0cmluZyB8IG51bGw7XHJcblxyXG4gIC8vIFRoZSBIVE1MIHRhZyBuYW1lIGZvciB0aGUgbGFiZWwgZWxlbWVudCB0aGF0IHdpbGwgY29udGFpbiB0aGUgbGFiZWwgY29udGVudCBmb3JcclxuICAvLyB0aGlzIGRvbSBlbGVtZW50LiBUaGVyZSBhcmUgd2F5cyBpbiB3aGljaCB5b3UgY2FuIGhhdmUgYSBsYWJlbCB3aXRob3V0IHNwZWNpZnlpbmcgYSBsYWJlbCB0YWcgbmFtZSxcclxuICAvLyBzZWUgc2V0TGFiZWxDb250ZW50KCkgZm9yIHRoZSBsaXN0IG9mIHdheXMuXHJcbiAgcHJpdmF0ZSBfbGFiZWxUYWdOYW1lOiBzdHJpbmcgfCBudWxsO1xyXG5cclxuICAvLyBUaGUgSFRNTCB0YWcgbmFtZSBmb3IgdGhlIGRlc2NyaXB0aW9uIGVsZW1lbnQgdGhhdCB3aWxsIGNvbnRhaW4gZGVzY3NyaXB0aW9uIGNvbnRlbnRcclxuICAvLyBmb3IgdGhpcyBkb20gZWxlbWVudC4gSWYgYSBkZXNjcmlwdGlvbiBpcyBzZXQgYmVmb3JlIGEgdGFnIG5hbWUgaXMgZGVmaW5lZCwgYSBwYXJhZ3JhcGggZWxlbWVudFxyXG4gIC8vIHdpbGwgYmUgY3JlYXRlZCBmb3IgdGhlIGRlc2NyaXB0aW9uLlxyXG4gIHByaXZhdGUgX2Rlc2NyaXB0aW9uVGFnTmFtZTogc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgLy8gVGhlIHR5cGUgZm9yIGFuIGVsZW1lbnQgd2l0aCB0YWcgbmFtZSBvZiBJTlBVVC4gIFRoaXMgc2hvdWxkIG9ubHkgYmUgdXNlZFxyXG4gIC8vIGlmIHRoZSBlbGVtZW50IGhhcyBhIHRhZyBuYW1lIElOUFVULlxyXG4gIHByaXZhdGUgX2lucHV0VHlwZTogc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgLy8gVGhlIHZhbHVlIG9mIHRoZSBpbnB1dCwgb25seSByZWxldmFudCBpZiB0aGUgdGFnIG5hbWUgaXMgb2YgdHlwZSBcIklOUFVUXCIuIElzIGFcclxuICAvLyBzdHJpbmcgYmVjYXVzZSB0aGUgYHZhbHVlYCBhdHRyaWJ1dGUgaXMgYSBET01TdHJpbmcuIG51bGwgdmFsdWUgaW5kaWNhdGVzIG5vIHZhbHVlLlxyXG4gIHByaXZhdGUgX2lucHV0VmFsdWU6IHN0cmluZyB8IG51bWJlciB8IG51bGw7XHJcblxyXG4gIC8vIFdoZXRoZXIgdGhlIHBkb20gaW5wdXQgaXMgY29uc2lkZXJlZCAnY2hlY2tlZCcsIG9ubHkgdXNlZnVsIGZvciBpbnB1dHMgb2ZcclxuICAvLyB0eXBlICdyYWRpbycgYW5kICdjaGVja2JveCdcclxuICBwcml2YXRlIF9wZG9tQ2hlY2tlZDogYm9vbGVhbjtcclxuXHJcbiAgLy8gQnkgZGVmYXVsdCB0aGUgbGFiZWwgd2lsbCBiZSBwcmVwZW5kZWQgYmVmb3JlIHRoZSBwcmltYXJ5IHNpYmxpbmcgaW4gdGhlIFBET00uIFRoaXNcclxuICAvLyBvcHRpb24gYWxsb3dzIHlvdSB0byBpbnN0ZWFkIGhhdmUgdGhlIGxhYmVsIGFkZGVkIGFmdGVyIHRoZSBwcmltYXJ5IHNpYmxpbmcuIE5vdGU6IFRoZSBsYWJlbCB3aWxsIGFsd2F5c1xyXG4gIC8vIGJlIGluIGZyb250IG9mIHRoZSBkZXNjcmlwdGlvbiBzaWJsaW5nLiBJZiB0aGlzIGZsYWcgaXMgc2V0IHdpdGggYGFwcGVuZERlc2NyaXB0aW9uOiB0cnVlYCwgdGhlIG9yZGVyIHdpbGwgYmVcclxuICAvLyAoMSkgcHJpbWFyeSBzaWJsaW5nLCAoMikgbGFiZWwgc2libGluZywgKDMpIGRlc2NyaXB0aW9uIHNpYmxpbmcuIEFsbCBzaWJsaW5ncyB3aWxsIGJlIHBsYWNlZCB3aXRoaW4gdGhlXHJcbiAgLy8gY29udGFpbmVyUGFyZW50LlxyXG4gIHByaXZhdGUgX2FwcGVuZExhYmVsOiBib29sZWFuO1xyXG5cclxuICAvLyBCeSBkZWZhdWx0IHRoZSBkZXNjcmlwdGlvbiB3aWxsIGJlIHByZXBlbmRlZCBiZWZvcmUgdGhlIHByaW1hcnkgc2libGluZyBpbiB0aGUgUERPTS4gVGhpc1xyXG4gIC8vIG9wdGlvbiBhbGxvd3MgeW91IHRvIGluc3RlYWQgaGF2ZSB0aGUgZGVzY3JpcHRpb24gYWRkZWQgYWZ0ZXIgdGhlIHByaW1hcnkgc2libGluZy4gTm90ZTogVGhlIGRlc2NyaXB0aW9uXHJcbiAgLy8gd2lsbCBhbHdheXMgYmUgYWZ0ZXIgdGhlIGxhYmVsIHNpYmxpbmcuIElmIHRoaXMgZmxhZyBpcyBzZXQgd2l0aCBgYXBwZW5kTGFiZWw6IHRydWVgLCB0aGUgb3JkZXIgd2lsbCBiZVxyXG4gIC8vICgxKSBwcmltYXJ5IHNpYmxpbmcsICgyKSBsYWJlbCBzaWJsaW5nLCAoMykgZGVzY3JpcHRpb24gc2libGluZy4gQWxsIHNpYmxpbmdzIHdpbGwgYmUgcGxhY2VkIHdpdGhpbiB0aGVcclxuICAvLyBjb250YWluZXJQYXJlbnQuXHJcbiAgcHJpdmF0ZSBfYXBwZW5kRGVzY3JpcHRpb246IGJvb2xlYW47XHJcblxyXG4gIC8vIEFycmF5IG9mIGF0dHJpYnV0ZXMgdGhhdCBhcmUgb24gdGhlIG5vZGUncyBET00gZWxlbWVudC4gIE9iamVjdHMgd2lsbCBoYXZlIHRoZVxyXG4gIC8vIGZvcm0geyBhdHRyaWJ1dGU6e3N0cmluZ30sIHZhbHVlOnsqfSwgbmFtZXNwYWNlOntzdHJpbmd8bnVsbH0gfVxyXG4gIHByaXZhdGUgX3Bkb21BdHRyaWJ1dGVzOiBQRE9NQXR0cmlidXRlW107XHJcblxyXG4gIC8vIENvbGxlY3Rpb24gb2YgY2xhc3MgYXR0cmlidXRlcyB0aGF0IGFyZSBhcHBsaWVkIHRvIHRoZSBub2RlJ3MgRE9NIGVsZW1lbnQuXHJcbiAgLy8gT2JqZWN0cyBoYXZlIHRoZSBmb3JtIHsgY2xhc3NOYW1lOntzdHJpbmd9LCBvcHRpb25zOnsqfSB9XHJcbiAgcHJpdmF0ZSBfcGRvbUNsYXNzZXM6IFBET01DbGFzc1tdO1xyXG5cclxuICAvLyBUaGUgbGFiZWwgY29udGVudCBmb3IgdGhpcyBub2RlJ3MgRE9NIGVsZW1lbnQuICBUaGVyZSBhcmUgbXVsdGlwbGUgd2F5cyB0aGF0IGEgbGFiZWxcclxuICAvLyBjYW4gYmUgYXNzb2NpYXRlZCB3aXRoIGEgbm9kZSdzIGRvbSBlbGVtZW50LCBzZWUgc2V0TGFiZWxDb250ZW50KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gIHByaXZhdGUgX2xhYmVsQ29udGVudDogc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgLy8gVGhlIGlubmVyIGxhYmVsIGNvbnRlbnQgZm9yIHRoaXMgbm9kZSdzIHByaW1hcnkgc2libGluZy4gU2V0IGFzIGlubmVyIEhUTUxcclxuICAvLyBvciB0ZXh0IGNvbnRlbnQgb2YgdGhlIGFjdHVhbCBET00gZWxlbWVudC4gSWYgdGhpcyBpcyB1c2VkLCB0aGUgbm9kZSBzaG91bGQgbm90IGhhdmUgY2hpbGRyZW4uXHJcbiAgcHJpdmF0ZSBfaW5uZXJDb250ZW50UHJvcGVydHk6IFRpbnlGb3J3YXJkaW5nUHJvcGVydHk8c3RyaW5nIHwgbnVsbD47XHJcblxyXG4gIC8vIFRoZSBkZXNjcmlwdGlvbiBjb250ZW50IGZvciB0aGlzIG5vZGUncyBET00gZWxlbWVudC5cclxuICBwcml2YXRlIF9kZXNjcmlwdGlvbkNvbnRlbnQ6IHN0cmluZyB8IG51bGw7XHJcblxyXG4gIC8vIElmIHByb3ZpZGVkLCBpdCB3aWxsIGNyZWF0ZSB0aGUgcHJpbWFyeSBET00gZWxlbWVudCB3aXRoIHRoZSBzcGVjaWZpZWQgbmFtZXNwYWNlLlxyXG4gIC8vIFRoaXMgbWF5IGJlIG5lZWRlZCwgZm9yIGV4YW1wbGUsIHdpdGggTWF0aE1ML1NWRy9ldGMuXHJcbiAgcHJpdmF0ZSBfcGRvbU5hbWVzcGFjZTogc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgLy8gSWYgcHJvdmlkZWQsIFwiYXJpYS1sYWJlbFwiIHdpbGwgYmUgYWRkZWQgYXMgYW4gaW5saW5lIGF0dHJpYnV0ZSBvbiB0aGUgbm9kZSdzIERPTVxyXG4gIC8vIGVsZW1lbnQgYW5kIHNldCB0byB0aGlzIHZhbHVlLiBUaGlzIHdpbGwgZGV0ZXJtaW5lIGhvdyB0aGUgQWNjZXNzaWJsZSBOYW1lIGlzIHByb3ZpZGVkIGZvciB0aGUgRE9NIGVsZW1lbnQuXHJcbiAgcHJpdmF0ZSBfYXJpYUxhYmVsOiBzdHJpbmcgfCBudWxsO1xyXG5cclxuICAvLyBUaGUgQVJJQSByb2xlIGZvciB0aGlzIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcsIGFkZGVkIGFzIGFuIEhUTUwgYXR0cmlidXRlLiAgRm9yIGEgY29tcGxldGVcclxuICAvLyBsaXN0IG9mIEFSSUEgcm9sZXMsIHNlZSBodHRwczovL3d3dy53My5vcmcvVFIvd2FpLWFyaWEvcm9sZXMuICBCZXdhcmUgdGhhdCBtYW55IHJvbGVzIGFyZSBub3Qgc3VwcG9ydGVkXHJcbiAgLy8gYnkgYnJvd3NlcnMgb3IgYXNzaXN0aXZlIHRlY2hub2xvZ2llcywgc28gdXNlIHZhbmlsbGEgSFRNTCBmb3IgYWNjZXNzaWJpbGl0eSBzZW1hbnRpY3Mgd2hlcmUgcG9zc2libGUuXHJcbiAgcHJpdmF0ZSBfYXJpYVJvbGU6IHN0cmluZyB8IG51bGw7XHJcblxyXG4gIC8vIFRoZSBBUklBIHJvbGUgZm9yIHRoZSBjb250YWluZXIgcGFyZW50IGVsZW1lbnQsIGFkZGVkIGFzIGFuIEhUTUwgYXR0cmlidXRlLiBGb3IgYVxyXG4gIC8vIGNvbXBsZXRlIGxpc3Qgb2YgQVJJQSByb2xlcywgc2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi93YWktYXJpYS9yb2xlcy4gQmV3YXJlIHRoYXQgbWFueSByb2xlcyBhcmUgbm90XHJcbiAgLy8gc3VwcG9ydGVkIGJ5IGJyb3dzZXJzIG9yIGFzc2lzdGl2ZSB0ZWNobm9sb2dpZXMsIHNvIHVzZSB2YW5pbGxhIEhUTUwgZm9yIGFjY2Vzc2liaWxpdHkgc2VtYW50aWNzIHdoZXJlXHJcbiAgLy8gcG9zc2libGUuXHJcbiAgcHJpdmF0ZSBfY29udGFpbmVyQXJpYVJvbGU6IHN0cmluZyB8IG51bGw7XHJcblxyXG4gIC8vIElmIHByb3ZpZGVkLCBcImFyaWEtdmFsdWV0ZXh0XCIgd2lsbCBiZSBhZGRlZCBhcyBhbiBpbmxpbmUgYXR0cmlidXRlIG9uIHRoZSBOb2RlJ3NcclxuICAvLyBwcmltYXJ5IHNpYmxpbmcgYW5kIHNldCB0byB0aGlzIHZhbHVlLiBTZXR0aW5nIGJhY2sgdG8gbnVsbCB3aWxsIGNsZWFyIHRoaXMgYXR0cmlidXRlIGluIHRoZSB2aWV3LlxyXG4gIHByaXZhdGUgX2FyaWFWYWx1ZVRleHQ6IHN0cmluZyB8IG51bGw7XHJcblxyXG4gIC8vIEtlZXAgdHJhY2sgb2Ygd2hhdCB0aGlzIE5vZGUgaXMgYXJpYS1sYWJlbGxlZGJ5IHZpYSBcImFzc29jaWF0aW9uT2JqZWN0c1wiXHJcbiAgLy8gc2VlIGFkZEFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb24gZm9yIHdoeSB3ZSBzdXBwb3J0IG1vcmUgdGhhbiBvbmUgYXNzb2NpYXRpb24uXHJcbiAgcHJpdmF0ZSBfYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnM6IEFzc29jaWF0aW9uW107XHJcblxyXG4gIC8vIEtlZXAgYSByZWZlcmVuY2UgdG8gYWxsIG5vZGVzIHRoYXQgYXJlIGFyaWEtbGFiZWxsZWRieSB0aGlzIG5vZGUsIGkuZS4gdGhhdCBoYXZlIHN0b3JlIG9uZSBvZiB0aGlzIE5vZGUnc1xyXG4gIC8vIHBlZXIgSFRNTEVsZW1lbnQncyBpZCBpbiB0aGVpciBwZWVyIEhUTUxFbGVtZW50J3MgYXJpYS1sYWJlbGxlZGJ5IGF0dHJpYnV0ZS4gVGhpcyB3YXkgd2UgY2FuIHRlbGwgb3RoZXJcclxuICAvLyBub2RlcyB0byB1cGRhdGUgdGhlaXIgYXJpYS1sYWJlbGxlZGJ5IGFzc29jaWF0aW9ucyB3aGVuIHRoaXMgTm9kZSByZWJ1aWxkcyBpdHMgcGRvbSBjb250ZW50LlxyXG4gIHByaXZhdGUgX25vZGVzVGhhdEFyZUFyaWFMYWJlbGxlZGJ5VGhpc05vZGU6IE5vZGVbXTtcclxuXHJcbiAgLy8gS2VlcCB0cmFjayBvZiB3aGF0IHRoaXMgTm9kZSBpcyBhcmlhLWRlc2NyaWJlZGJ5IHZpYSBcImFzc29jaWF0aW9uT2JqZWN0c1wiXHJcbiAgLy8gc2VlIGFkZEFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uIGZvciB3aHkgd2Ugc3VwcG9ydCBtb3JlIHRoYW4gb25lIGFzc29jaWF0aW9uLlxyXG4gIHByaXZhdGUgX2FyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uczogQXNzb2NpYXRpb25bXTtcclxuXHJcbiAgLy8gS2VlcCBhIHJlZmVyZW5jZSB0byBhbGwgbm9kZXMgdGhhdCBhcmUgYXJpYS1kZXNjcmliZWRieSB0aGlzIG5vZGUsIGkuZS4gdGhhdCBoYXZlIHN0b3JlIG9uZSBvZiB0aGlzIE5vZGUnc1xyXG4gIC8vIHBlZXIgSFRNTEVsZW1lbnQncyBpZCBpbiB0aGVpciBwZWVyIEhUTUxFbGVtZW50J3MgYXJpYS1kZXNjcmliZWRieSBhdHRyaWJ1dGUuIFRoaXMgd2F5IHdlIGNhbiB0ZWxsIG90aGVyXHJcbiAgLy8gbm9kZXMgdG8gdXBkYXRlIHRoZWlyIGFyaWEtZGVzY3JpYmVkYnkgYXNzb2NpYXRpb25zIHdoZW4gdGhpcyBOb2RlIHJlYnVpbGRzIGl0cyBwZG9tIGNvbnRlbnQuXHJcbiAgcHJpdmF0ZSBfbm9kZXNUaGF0QXJlQXJpYURlc2NyaWJlZGJ5VGhpc05vZGU6IE5vZGVbXTtcclxuXHJcbiAgLy8gS2VlcCB0cmFjayBvZiB3aGF0IHRoaXMgTm9kZSBpcyBhcmlhLWFjdGl2ZWRlc2NlbmRhbnQgdmlhIFwiYXNzb2NpYXRpb25PYmplY3RzXCJcclxuICAvLyBzZWUgYWRkQWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9uIGZvciB3aHkgd2Ugc3VwcG9ydCBtb3JlIHRoYW4gb25lIGFzc29jaWF0aW9uLlxyXG4gIHByaXZhdGUgX2FjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnM6IEFzc29jaWF0aW9uW107XHJcblxyXG4gIC8vIEtlZXAgYSByZWZlcmVuY2UgdG8gYWxsIG5vZGVzIHRoYXQgYXJlIGFyaWEtYWN0aXZlZGVzY2VuZGFudCB0aGlzIG5vZGUsIGkuZS4gdGhhdCBoYXZlIHN0b3JlIG9uZSBvZiB0aGlzIE5vZGUnc1xyXG4gIC8vIHBlZXIgSFRNTEVsZW1lbnQncyBpZCBpbiB0aGVpciBwZWVyIEhUTUxFbGVtZW50J3MgYXJpYS1hY3RpdmVkZXNjZW5kYW50IGF0dHJpYnV0ZS4gVGhpcyB3YXkgd2UgY2FuIHRlbGwgb3RoZXJcclxuICAvLyBub2RlcyB0byB1cGRhdGUgdGhlaXIgYXJpYS1hY3RpdmVkZXNjZW5kYW50IGFzc29jaWF0aW9ucyB3aGVuIHRoaXMgTm9kZSByZWJ1aWxkcyBpdHMgcGRvbSBjb250ZW50LlxyXG4gIHByaXZhdGUgX25vZGVzVGhhdEFyZUFjdGl2ZURlc2NlbmRhbnRUb1RoaXNOb2RlOiBOb2RlW107XHJcblxyXG4gIC8vIFdoZXRoZXIgdGhpcyBOb2RlJ3MgcHJpbWFyeSBzaWJsaW5nIGhhcyBiZWVuIGV4cGxpY2l0bHkgc2V0IHRvIHJlY2VpdmUgZm9jdXMgZnJvbVxyXG4gIC8vIHRhYiBuYXZpZ2F0aW9uLiBTZXRzIHRoZSB0YWJJbmRleCBhdHRyaWJ1dGUgb24gdGhlIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcuIFNldHRpbmcgdG8gZmFsc2Ugd2lsbCBub3QgcmVtb3ZlIHRoZVxyXG4gIC8vIG5vZGUncyBET00gZnJvbSB0aGUgZG9jdW1lbnQsIGJ1dCB3aWxsIGVuc3VyZSB0aGF0IGl0IGNhbm5vdCByZWNlaXZlIGZvY3VzIGJ5IHByZXNzaW5nICd0YWInLiAgU2V2ZXJhbFxyXG4gIC8vIEhUTUxFbGVtZW50cyAoc3VjaCBhcyBIVE1MIGZvcm0gZWxlbWVudHMpIGNhbiBiZSBmb2N1c2FibGUgYnkgZGVmYXVsdCwgd2l0aG91dCBzZXR0aW5nIHRoaXMgcHJvcGVydHkuIFRoZVxyXG4gIC8vIG5hdGl2ZSBIVE1MIGZ1bmN0aW9uIGZyb20gdGhlc2UgZm9ybSBlbGVtZW50cyBjYW4gYmUgb3ZlcnJpZGRlbiB3aXRoIHRoaXMgcHJvcGVydHkuXHJcbiAgcHJpdmF0ZSBfZm9jdXNhYmxlT3ZlcnJpZGU6IGJvb2xlYW4gfCBudWxsO1xyXG5cclxuICAvLyBUaGUgZm9jdXMgaGlnaGxpZ2h0IHRoYXQgd2lsbCBzdXJyb3VuZCB0aGlzIG5vZGUgd2hlbiBpdFxyXG4gIC8vIGlzIGZvY3VzZWQuICBCeSBkZWZhdWx0LCB0aGUgZm9jdXMgaGlnaGxpZ2h0IHdpbGwgYmUgYSBwaW5rIHJlY3RhbmdsZSB0aGF0IHN1cnJvdW5kcyB0aGUgTm9kZSdzIGxvY2FsXHJcbiAgLy8gYm91bmRzLlxyXG4gIHByaXZhdGUgX2ZvY3VzSGlnaGxpZ2h0OiBTaGFwZSB8IE5vZGUgfCAnaW52aXNpYmxlJyB8IG51bGw7XHJcblxyXG4gIC8vIEEgZmxhZyB0aGF0IGFsbG93cyBwcmV2ZW50cyBmb2N1cyBoaWdobGlnaHQgZnJvbSBiZWluZyBkaXNwbGF5ZWQgaW4gdGhlIEhpZ2hsaWdodE92ZXJsYXkuXHJcbiAgLy8gSWYgdHJ1ZSwgdGhlIGZvY3VzIGhpZ2hsaWdodCBmb3IgdGhpcyBub2RlIHdpbGwgYmUgbGF5ZXJhYmxlIGluIHRoZSBzY2VuZSBncmFwaC4gIENsaWVudCBpcyByZXNwb25zaWJsZVxyXG4gIC8vIGZvciBwbGFjZW1lbnQgb2YgdGhlIGZvY3VzIGhpZ2hsaWdodCBpbiB0aGUgc2NlbmUgZ3JhcGguXHJcbiAgcHJpdmF0ZSBfZm9jdXNIaWdobGlnaHRMYXllcmFibGU6IGJvb2xlYW47XHJcblxyXG4gIC8vIEFkZHMgYSBncm91cCBmb2N1cyBoaWdobGlnaHQgdGhhdCBzdXJyb3VuZHMgdGhpcyBub2RlIHdoZW4gYSBkZXNjZW5kYW50IGhhc1xyXG4gIC8vIGZvY3VzLiBUeXBpY2FsbHkgdXNlZnVsIHRvIGluZGljYXRlIGZvY3VzIGlmIGZvY3VzIGVudGVycyBhIGdyb3VwIG9mIGVsZW1lbnRzLiBJZiAndHJ1ZScsIGdyb3VwXHJcbiAgLy8gaGlnaGxpZ2h0IHdpbGwgZ28gYXJvdW5kIGxvY2FsIGJvdW5kcyBvZiB0aGlzIG5vZGUuIE90aGVyd2lzZSB0aGUgY3VzdG9tIG5vZGUgd2lsbCBiZSB1c2VkIGFzIHRoZSBoaWdobGlnaHQvXHJcbiAgcHJpdmF0ZSBfZ3JvdXBGb2N1c0hpZ2hsaWdodDogTm9kZSB8IGJvb2xlYW47XHJcblxyXG4gIC8vIFdoZXRoZXIgdGhlIHBkb20gY29udGVudCB3aWxsIGJlIHZpc2libGUgZnJvbSB0aGUgYnJvd3NlciBhbmQgYXNzaXN0aXZlXHJcbiAgLy8gdGVjaG5vbG9naWVzLiAgV2hlbiBwZG9tVmlzaWJsZSBpcyBmYWxzZSwgdGhlIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcgd2lsbCBub3QgYmUgZm9jdXNhYmxlLCBhbmQgaXQgY2Fubm90XHJcbiAgLy8gYmUgZm91bmQgYnkgdGhlIGFzc2lzdGl2ZSB0ZWNobm9sb2d5IHZpcnR1YWwgY3Vyc29yLiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBob3cgYXNzaXN0aXZlIHRlY2hub2xvZ2llc1xyXG4gIC8vIHJlYWQgd2l0aCB0aGUgdmlydHVhbCBjdXJzb3Igc2VlXHJcbiAgLy8gaHR0cDovL3d3dy5zc2JiYXJ0Z3JvdXAuY29tL2Jsb2cvaG93LXdpbmRvd3Mtc2NyZWVuLXJlYWRlcnMtd29yay1vbi10aGUtd2ViL1xyXG4gIHByaXZhdGUgX3Bkb21WaXNpYmxlOiBib29sZWFuO1xyXG5cclxuICAvLyBJZiBwcm92aWRlZCwgaXQgd2lsbCBvdmVycmlkZSB0aGUgZm9jdXMgb3JkZXIgYmV0d2VlbiBjaGlsZHJlblxyXG4gIC8vIChhbmQgb3B0aW9uYWxseSBhcmJpdHJhcnkgc3VidHJlZXMpLiBJZiBub3QgcHJvdmlkZWQsIHRoZSBmb2N1cyBvcmRlciB3aWxsIGRlZmF1bHQgdG8gdGhlIHJlbmRlcmluZyBvcmRlclxyXG4gIC8vIChmaXJzdCBjaGlsZHJlbiBmaXJzdCwgbGFzdCBjaGlsZHJlbiBsYXN0KSBkZXRlcm1pbmVkIGJ5IHRoZSBjaGlsZHJlbiBhcnJheS5cclxuICAvLyBTZWUgc2V0UERPTU9yZGVyKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvbi5cclxuICBwcml2YXRlIF9wZG9tT3JkZXI6ICggTm9kZSB8IG51bGwgKVtdIHwgbnVsbDtcclxuXHJcbiAgLy8gSWYgdGhpcyBub2RlIGlzIHNwZWNpZmllZCBpbiBhbm90aGVyIG5vZGUncyBwZG9tT3JkZXIsIHRoZW4gdGhpcyB3aWxsIGhhdmUgdGhlIHZhbHVlIG9mIHRoYXQgb3RoZXIgKFBET00gcGFyZW50KVxyXG4gIC8vIE5vZGUuIE90aGVyd2lzZSBpdCdzIG51bGwuXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgcHVibGljIF9wZG9tUGFyZW50OiBOb2RlIHwgbnVsbDtcclxuXHJcbiAgLy8gSWYgdGhpcyBpcyBzcGVjaWZpZWQsIHRoZSBwcmltYXJ5IHNpYmxpbmcgd2lsbCBiZSBwb3NpdGlvbmVkXHJcbiAgLy8gdG8gYWxpZ24gd2l0aCB0aGlzIHNvdXJjZSBub2RlIGFuZCBvYnNlcnZlIHRoZSB0cmFuc2Zvcm1zIGFsb25nIHRoaXMgbm9kZSdzIHRyYWlsLiBBdCB0aGlzIHRpbWUgdGhlXHJcbiAgLy8gcGRvbVRyYW5zZm9ybVNvdXJjZU5vZGUgY2Fubm90IHVzZSBEQUcuXHJcbiAgcHJpdmF0ZSBfcGRvbVRyYW5zZm9ybVNvdXJjZU5vZGU6IE5vZGUgfCBudWxsO1xyXG5cclxuICAvLyBDb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCB3aGF0IHBkb20gZGlzcGxheXNcclxuICAvLyB0aGlzIG5vZGUgaXMgXCJ2aXNpYmxlXCIgZm9yLCBzZWUgUERPTURpc3BsYXlzSW5mby5qcyBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICBwdWJsaWMgX3Bkb21EaXNwbGF5c0luZm86IFBET01EaXNwbGF5c0luZm87XHJcblxyXG4gIC8vIEVtcHR5IHVubGVzcyB0aGUgTm9kZSBjb250YWlucyBzb21lIHBkb20gY29udGVudCAoUERPTUluc3RhbmNlKS5cclxuICBwcml2YXRlIHJlYWRvbmx5IF9wZG9tSW5zdGFuY2VzOiBQRE9NSW5zdGFuY2VbXTtcclxuXHJcbiAgLy8gRGV0ZXJtaW5lcyBpZiBET00gc2libGluZ3MgYXJlIHBvc2l0aW9uZWQgaW4gdGhlIHZpZXdwb3J0LiBUaGlzXHJcbiAgLy8gaXMgcmVxdWlyZWQgZm9yIE5vZGVzIHRoYXQgcmVxdWlyZSB1bmlxdWUgaW5wdXQgZ2VzdHVyZXMgd2l0aCBpT1MgVm9pY2VPdmVyIGxpa2UgXCJEcmFnIGFuZCBEcm9wXCIuXHJcbiAgLy8gU2VlIHNldFBvc2l0aW9uSW5QRE9NIGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG4gIHByaXZhdGUgX3Bvc2l0aW9uSW5QRE9NOiBib29sZWFuO1xyXG5cclxuICAvLyBJZiB0cnVlLCBhbnkgRE9NIGV2ZW50cyByZWNlaXZlZCBvbiB0aGUgbGFiZWwgc2libGluZ1xyXG4gIC8vIHdpbGwgbm90IGRpc3BhdGNoIFNjZW5lcnlFdmVudHMgdGhyb3VnaCB0aGUgc2NlbmUgZ3JhcGgsIHNlZSBzZXRFeGNsdWRlTGFiZWxTaWJsaW5nRnJvbUlucHV0KCkgLSBzY2VuZXJ5IGludGVybmFsXHJcbiAgcHJpdmF0ZSBleGNsdWRlTGFiZWxTaWJsaW5nRnJvbUlucHV0OiBib29sZWFuO1xyXG5cclxuICAvLyBISUdIRVIgTEVWRUwgQVBJIElOSVRJQUxJWkFUSU9OXHJcblxyXG4gIC8vIFNldHMgdGhlIFwiQWNjZXNzaWJsZSBOYW1lXCIgb2YgdGhlIE5vZGUsIGFzIGRlZmluZWQgYnkgdGhlIEJyb3dzZXIncyBQYXJhbGxlbERPTSBUcmVlXHJcbiAgcHJpdmF0ZSBfYWNjZXNzaWJsZU5hbWU6IHN0cmluZyB8IG51bGw7XHJcblxyXG4gIC8vIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgb3B0aW9ucyBuZWVkZWQgdG8gc2V0IHRoZSBhcHByb3ByaWF0ZSBhY2Nlc3NpYmxlIG5hbWUgZm9yIHRoZSBOb2RlXHJcbiAgcHJpdmF0ZSBfYWNjZXNzaWJsZU5hbWVCZWhhdmlvcjogUERPTUJlaGF2aW9yRnVuY3Rpb247XHJcblxyXG4gIC8vIFNldHMgdGhlIGhlbHAgdGV4dCBvZiB0aGUgTm9kZSwgdGhpcyBtb3N0IG9mdGVuIGNvcnJlc3BvbmRzIHRvIGRlc2NyaXB0aW9uIHRleHQuXHJcbiAgcHJpdmF0ZSBfaGVscFRleHQ6IHN0cmluZyB8IG51bGw7XHJcblxyXG4gIC8vIFNldHMgdGhlIGhlbHAgdGV4dCBvZiB0aGUgTm9kZSwgdGhpcyBtb3N0IG9mdGVuIGNvcnJlc3BvbmRzIHRvIGRlc2NyaXB0aW9uIHRleHQuXHJcbiAgcHJpdmF0ZSBfaGVscFRleHRCZWhhdmlvcjogUERPTUJlaGF2aW9yRnVuY3Rpb247XHJcblxyXG4gIC8vIFNldHMgdGhlIGhlbHAgdGV4dCBvZiB0aGUgTm9kZSwgdGhpcyBtb3N0IG9mdGVuIGNvcnJlc3BvbmRzIHRvIGxhYmVsIHNpYmxpbmcgdGV4dC5cclxuICBwcml2YXRlIF9wZG9tSGVhZGluZzogc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgLy8gVE9ETzogaW1wbGVtZW50IGhlYWRpbmdMZXZlbCBvdmVycmlkZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84NTVcclxuICAvLyBUaGUgbnVtYmVyIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIGhlYWRpbmcgdGFnIHRoZSBub2RlIHdpbGwgZ2V0IGlmIHVzaW5nIHRoZSBwZG9tSGVhZGluZyBBUEksLlxyXG4gIHByaXZhdGUgX2hlYWRpbmdMZXZlbDogbnVtYmVyIHwgbnVsbDtcclxuXHJcbiAgLy8gU2V0cyB0aGUgaGVscCB0ZXh0IG9mIHRoZSBOb2RlLCB0aGlzIG1vc3Qgb2Z0ZW4gY29ycmVzcG9uZHMgdG8gZGVzY3JpcHRpb24gdGV4dC5cclxuICBwcml2YXRlIF9wZG9tSGVhZGluZ0JlaGF2aW9yOiBQRE9NQmVoYXZpb3JGdW5jdGlvbjtcclxuXHJcbiAgLy8gRW1pdHMgYW4gZXZlbnQgd2hlbiB0aGUgZm9jdXMgaGlnaGxpZ2h0IGlzIGNoYW5nZWQuXHJcbiAgcHVibGljIHJlYWRvbmx5IGZvY3VzSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXI6IFRFbWl0dGVyO1xyXG5cclxuICAvLyBGaXJlZCB3aGVuIHRoZSBQRE9NIERpc3BsYXlzIGZvciB0aGlzIE5vZGUgaGF2ZSBjaGFuZ2VkIChzZWUgUERPTUluc3RhbmNlKVxyXG4gIHB1YmxpYyByZWFkb25seSBwZG9tRGlzcGxheXNFbWl0dGVyOiBURW1pdHRlcjtcclxuXHJcbiAgLy8gUERPTSBzcGVjaWZpYyBlbmFibGVkIGxpc3RlbmVyXHJcbiAgcHJvdGVjdGVkIHBkb21Cb3VuZElucHV0RW5hYmxlZExpc3RlbmVyOiAoIGVuYWJsZWQ6IGJvb2xlYW4gKSA9PiB2b2lkO1xyXG5cclxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoIG9wdGlvbnM/OiBQaGV0aW9PYmplY3RPcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5fdGFnTmFtZSA9IG51bGw7XHJcbiAgICB0aGlzLl9jb250YWluZXJUYWdOYW1lID0gbnVsbDtcclxuICAgIHRoaXMuX2xhYmVsVGFnTmFtZSA9IG51bGw7XHJcbiAgICB0aGlzLl9kZXNjcmlwdGlvblRhZ05hbWUgPSBudWxsO1xyXG4gICAgdGhpcy5faW5wdXRUeXBlID0gbnVsbDtcclxuICAgIHRoaXMuX2lucHV0VmFsdWUgPSBudWxsO1xyXG4gICAgdGhpcy5fcGRvbUNoZWNrZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuX2FwcGVuZExhYmVsID0gZmFsc2U7XHJcbiAgICB0aGlzLl9hcHBlbmREZXNjcmlwdGlvbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5fcGRvbUF0dHJpYnV0ZXMgPSBbXTtcclxuICAgIHRoaXMuX3Bkb21DbGFzc2VzID0gW107XHJcbiAgICB0aGlzLl9sYWJlbENvbnRlbnQgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuX2lubmVyQ29udGVudFByb3BlcnR5ID0gbmV3IFRpbnlGb3J3YXJkaW5nUHJvcGVydHk8c3RyaW5nIHwgbnVsbD4oIG51bGwsIGZhbHNlICk7XHJcbiAgICB0aGlzLl9pbm5lckNvbnRlbnRQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5vbklubmVyQ29udGVudFByb3BlcnR5Q2hhbmdlLmJpbmQoIHRoaXMgKSApO1xyXG5cclxuICAgIHRoaXMuX2Rlc2NyaXB0aW9uQ29udGVudCA9IG51bGw7XHJcbiAgICB0aGlzLl9wZG9tTmFtZXNwYWNlID0gbnVsbDtcclxuICAgIHRoaXMuX2FyaWFMYWJlbCA9IG51bGw7XHJcbiAgICB0aGlzLl9hcmlhUm9sZSA9IG51bGw7XHJcbiAgICB0aGlzLl9jb250YWluZXJBcmlhUm9sZSA9IG51bGw7XHJcbiAgICB0aGlzLl9hcmlhVmFsdWVUZXh0ID0gbnVsbDtcclxuICAgIHRoaXMuX2FyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zID0gW107XHJcbiAgICB0aGlzLl9ub2Rlc1RoYXRBcmVBcmlhTGFiZWxsZWRieVRoaXNOb2RlID0gW107XHJcbiAgICB0aGlzLl9hcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMgPSBbXTtcclxuICAgIHRoaXMuX25vZGVzVGhhdEFyZUFyaWFEZXNjcmliZWRieVRoaXNOb2RlID0gW107XHJcbiAgICB0aGlzLl9hY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zID0gW107XHJcbiAgICB0aGlzLl9ub2Rlc1RoYXRBcmVBY3RpdmVEZXNjZW5kYW50VG9UaGlzTm9kZSA9IFtdO1xyXG4gICAgdGhpcy5fZm9jdXNhYmxlT3ZlcnJpZGUgPSBudWxsO1xyXG4gICAgdGhpcy5fZm9jdXNIaWdobGlnaHQgPSBudWxsO1xyXG4gICAgdGhpcy5fZm9jdXNIaWdobGlnaHRMYXllcmFibGUgPSBmYWxzZTtcclxuICAgIHRoaXMuX2dyb3VwRm9jdXNIaWdobGlnaHQgPSBmYWxzZTtcclxuICAgIHRoaXMuX3Bkb21WaXNpYmxlID0gdHJ1ZTtcclxuICAgIHRoaXMuX3Bkb21PcmRlciA9IG51bGw7XHJcbiAgICB0aGlzLl9wZG9tUGFyZW50ID0gbnVsbDtcclxuICAgIHRoaXMuX3Bkb21UcmFuc2Zvcm1Tb3VyY2VOb2RlID0gbnVsbDtcclxuICAgIHRoaXMuX3Bkb21EaXNwbGF5c0luZm8gPSBuZXcgUERPTURpc3BsYXlzSW5mbyggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKTtcclxuICAgIHRoaXMuX3Bkb21JbnN0YW5jZXMgPSBbXTtcclxuICAgIHRoaXMuX3Bvc2l0aW9uSW5QRE9NID0gZmFsc2U7XHJcbiAgICB0aGlzLmV4Y2x1ZGVMYWJlbFNpYmxpbmdGcm9tSW5wdXQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBISUdIRVIgTEVWRUwgQVBJIElOSVRJQUxJWkFUSU9OXHJcblxyXG4gICAgdGhpcy5fYWNjZXNzaWJsZU5hbWUgPSBudWxsO1xyXG4gICAgdGhpcy5fYWNjZXNzaWJsZU5hbWVCZWhhdmlvciA9IFBhcmFsbGVsRE9NLkJBU0lDX0FDQ0VTU0lCTEVfTkFNRV9CRUhBVklPUjtcclxuICAgIHRoaXMuX2hlbHBUZXh0ID0gbnVsbDtcclxuICAgIHRoaXMuX2hlbHBUZXh0QmVoYXZpb3IgPSBQYXJhbGxlbERPTS5IRUxQX1RFWFRfQUZURVJfQ09OVEVOVDtcclxuICAgIHRoaXMuX3Bkb21IZWFkaW5nID0gbnVsbDtcclxuICAgIHRoaXMuX2hlYWRpbmdMZXZlbCA9IG51bGw7XHJcbiAgICB0aGlzLl9wZG9tSGVhZGluZ0JlaGF2aW9yID0gREVGQVVMVF9QRE9NX0hFQURJTkdfQkVIQVZJT1I7XHJcbiAgICB0aGlzLmZvY3VzSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXIoKTtcclxuICAgIHRoaXMucGRvbURpc3BsYXlzRW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xyXG4gICAgdGhpcy5wZG9tQm91bmRJbnB1dEVuYWJsZWRMaXN0ZW5lciA9IHRoaXMucGRvbUlucHV0RW5hYmxlZExpc3RlbmVyLmJpbmQoIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAvLyBQVUJMSUMgTUVUSE9EU1xyXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcG9zZSBhY2Nlc3NpYmlsaXR5IGJ5IHJlbW92aW5nIGFsbCBsaXN0ZW5lcnMgb24gdGhpcyBub2RlIGZvciBhY2Nlc3NpYmxlIGlucHV0LiBQYXJhbGxlbERPTSBpcyBkaXNwb3NlZFxyXG4gICAqIGJ5IGNhbGxpbmcgTm9kZS5kaXNwb3NlKCksIHNvIHRoaXMgZnVuY3Rpb24gaXMgc2NlbmVyeS1pbnRlcm5hbC5cclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwcm90ZWN0ZWQgZGlzcG9zZVBhcmFsbGVsRE9NKCk6IHZvaWQge1xyXG5cclxuICAgICggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKS5pbnB1dEVuYWJsZWRQcm9wZXJ0eS51bmxpbmsoIHRoaXMucGRvbUJvdW5kSW5wdXRFbmFibGVkTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBUbyBwcmV2ZW50IG1lbW9yeSBsZWFrcywgd2Ugd2FudCB0byBjbGVhciBvdXIgb3JkZXIgKHNpbmNlIG90aGVyd2lzZSBub2RlcyBpbiBvdXIgb3JkZXIgd2lsbCByZWZlcmVuY2VcclxuICAgIC8vIHRoaXMgbm9kZSkuXHJcbiAgICB0aGlzLnBkb21PcmRlciA9IG51bGw7XHJcblxyXG4gICAgLy8gY2xlYXIgcmVmZXJlbmNlcyB0byB0aGUgcGRvbVRyYW5zZm9ybVNvdXJjZU5vZGVcclxuICAgIHRoaXMuc2V0UERPTVRyYW5zZm9ybVNvdXJjZU5vZGUoIG51bGwgKTtcclxuXHJcbiAgICAvLyBDbGVhciBvdXQgYXJpYSBhc3NvY2lhdGlvbiBhdHRyaWJ1dGVzLCB3aGljaCBob2xkIHJlZmVyZW5jZXMgdG8gb3RoZXIgbm9kZXMuXHJcbiAgICB0aGlzLnNldEFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zKCBbXSApO1xyXG4gICAgdGhpcy5zZXRBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMoIFtdICk7XHJcbiAgICB0aGlzLnNldEFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnMoIFtdICk7XHJcblxyXG4gICAgdGhpcy5faW5uZXJDb250ZW50UHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwZG9tSW5wdXRFbmFibGVkTGlzdGVuZXIoIGVuYWJsZWQ6IGJvb2xlYW4gKTogdm9pZCB7XHJcblxyXG4gICAgLy8gTWFyayB0aGlzIE5vZGUgYXMgZGlzYWJsZWQgaW4gdGhlIFBhcmFsbGVsRE9NXHJcbiAgICB0aGlzLnNldFBET01BdHRyaWJ1dGUoICdhcmlhLWRpc2FibGVkJywgIWVuYWJsZWQgKTtcclxuXHJcbiAgICAvLyBCeSByZXR1cm5pbmcgZmFsc2UsIHdlIHByZXZlbnQgdGhlIGNvbXBvbmVudCBmcm9tIHRvZ2dsaW5nIG5hdGl2ZSBIVE1MIGVsZW1lbnQgYXR0cmlidXRlcyB0aGF0IGNvbnZleSBzdGF0ZS5cclxuICAgIC8vIEZvciBleGFtcGxlLHRoaXMgd2lsbCBwcmV2ZW50IGEgY2hlY2tib3ggZnJvbSBjaGFuZ2luZyBgY2hlY2tlZGAgcHJvcGVydHkgd2hpbGUgaXQgaXMgZGlzYWJsZWQuIFRoaXMgd2F5XHJcbiAgICAvLyB3ZSBjYW4ga2VlcCB0aGUgY29tcG9uZW50IGluIHRyYXZlcnNhbCBvcmRlciBhbmQgZG9uJ3QgbmVlZCB0byBhZGQgdGhlIGBkaXNhYmxlZGAgYXR0cmlidXRlLiBTZWVcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzUxOSBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNjQwXHJcbiAgICAvLyBUaGlzIHNvbHV0aW9uIHdhcyBmb3VuZCBhdCBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTIyNjczNTAvMzQwODUwMlxyXG4gICAgdGhpcy5zZXRQRE9NQXR0cmlidXRlKCAnb25jbGljaycsIGVuYWJsZWQgPyAnJyA6ICdyZXR1cm4gZmFsc2UnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgd2hldGhlciB0aGlzIE5vZGUncyBwcmltYXJ5IERPTSBlbGVtZW50IGN1cnJlbnRseSBoYXMgZm9jdXMuXHJcbiAgICovXHJcbiAgcHVibGljIGlzRm9jdXNlZCgpOiBib29sZWFuIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX3Bkb21JbnN0YW5jZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLl9wZG9tSW5zdGFuY2VzWyBpIF0ucGVlciE7XHJcbiAgICAgIGlmICggcGVlci5pc0ZvY3VzZWQoKSApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBmb2N1c2VkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pc0ZvY3VzZWQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBGb2N1cyB0aGlzIG5vZGUncyBwcmltYXJ5IGRvbSBlbGVtZW50LiBUaGUgZWxlbWVudCBtdXN0IG5vdCBiZSBoaWRkZW4sIGFuZCBpdCBtdXN0IGJlIGZvY3VzYWJsZS4gSWYgdGhlIG5vZGVcclxuICAgKiBoYXMgbW9yZSB0aGFuIG9uZSBpbnN0YW5jZSwgdGhpcyB3aWxsIGZhaWwgYmVjYXVzZSB0aGUgRE9NIGVsZW1lbnQgaXMgbm90IHVuaXF1ZWx5IGRlZmluZWQuIElmIGFjY2Vzc2liaWxpdHlcclxuICAgKiBpcyBub3QgZW5hYmxlZCwgdGhpcyB3aWxsIGJlIGEgbm8gb3AuIFdoZW4gUGFyYWxsZWxET00gaXMgbW9yZSB3aWRlbHkgdXNlZCwgdGhlIG5vIG9wIGNhbiBiZSByZXBsYWNlZFxyXG4gICAqIHdpdGggYW4gYXNzZXJ0aW9uIHRoYXQgY2hlY2tzIGZvciBwZG9tIGNvbnRlbnQuXHJcbiAgICovXHJcbiAgcHVibGljIGZvY3VzKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIGlmIGEgc2ltIGlzIHJ1bm5pbmcgd2l0aG91dCBhY2Nlc3NpYmlsaXR5IGVuYWJsZWQsIHRoZXJlIHdpbGwgYmUgbm8gYWNjZXNzaWJsZSBpbnN0YW5jZXMsIGJ1dCBmb2N1cygpIG1pZ2h0XHJcbiAgICAvLyBzdGlsbCBiZSBjYWxsZWQgd2l0aG91dCBhY2Nlc3NpYmlsaXR5IGVuYWJsZWRcclxuICAgIGlmICggdGhpcy5fcGRvbUluc3RhbmNlcy5sZW5ndGggPiAwICkge1xyXG5cclxuICAgICAgLy8gd2hlbiBhY2Nlc3NpYmlsaXR5IGlzIHdpZGVseSB1c2VkLCB0aGlzIGFzc2VydGlvbiBjYW4gYmUgYWRkZWQgYmFjayBpblxyXG4gICAgICAvLyBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9wZG9tSW5zdGFuY2VzLmxlbmd0aCA+IDAsICd0aGVyZSBtdXN0IGJlIHBkb20gY29udGVudCBmb3IgdGhlIG5vZGUgdG8gcmVjZWl2ZSBmb2N1cycgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5mb2N1c2FibGUsICd0cnlpbmcgdG8gc2V0IGZvY3VzIG9uIGEgbm9kZSB0aGF0IGlzIG5vdCBmb2N1c2FibGUnICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3Bkb21WaXNpYmxlLCAndHJ5aW5nIHRvIHNldCBmb2N1cyBvbiBhIG5vZGUgd2l0aCBpbnZpc2libGUgcGRvbSBjb250ZW50JyApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9wZG9tSW5zdGFuY2VzLmxlbmd0aCA9PT0gMSwgJ2ZvY3VzKCkgdW5zdXBwb3J0ZWQgZm9yIE5vZGVzIHVzaW5nIERBRywgcGRvbSBjb250ZW50IGlzIG5vdCB1bmlxdWUnICk7XHJcblxyXG4gICAgICBjb25zdCBwZWVyID0gdGhpcy5fcGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwZWVyLCAnbXVzdCBoYXZlIGEgcGVlciB0byBmb2N1cycgKTtcclxuICAgICAgcGVlci5mb2N1cygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGZvY3VzIGZyb20gdGhpcyBub2RlJ3MgcHJpbWFyeSBET00gZWxlbWVudC4gIFRoZSBmb2N1cyBoaWdobGlnaHQgd2lsbCBkaXNhcHBlYXIsIGFuZCB0aGUgZWxlbWVudCB3aWxsIG5vdCByZWNlaXZlXHJcbiAgICoga2V5Ym9hcmQgZXZlbnRzIHdoZW4gaXQgZG9lc24ndCBoYXZlIGZvY3VzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBibHVyKCk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLl9wZG9tSW5zdGFuY2VzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3Bkb21JbnN0YW5jZXMubGVuZ3RoID09PSAxLCAnYmx1cigpIHVuc3VwcG9ydGVkIGZvciBOb2RlcyB1c2luZyBEQUcsIHBkb20gY29udGVudCBpcyBub3QgdW5pcXVlJyApO1xyXG4gICAgICBjb25zdCBwZWVyID0gdGhpcy5fcGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwZWVyLCAnbXVzdCBoYXZlIGEgcGVlciB0byBibHVyJyApO1xyXG4gICAgICBwZWVyLmJsdXIoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGFzc2VydGlvbnMgYXJlIGVuYWJsZWQgYW5kIG9uY2UgdGhlIE5vZGUgaGFzIGJlZW4gY29tcGxldGVseSBjb25zdHJ1Y3RlZC4gVGhpcyBpcyB0aGUgdGltZSB0b1xyXG4gICAqIG1ha2Ugc3VyZSB0aGF0IG9wdGlvbnMgYXJlIHNldCB1cCB0aGUgd2F5IHRoZXkgYXJlIGV4cGVjdGVkIHRvIGJlLiBGb3IgZXhhbXBsZS4geW91IGRvbid0IHdhbnQgYWNjZXNzaWJsZU5hbWVcclxuICAgKiBhbmQgbGFiZWxDb250ZW50IGRlY2xhcmVkLlxyXG4gICAqIChvbmx5IGNhbGxlZCBieSBTY3JlZW4uanMpXHJcbiAgICovXHJcbiAgcHVibGljIHBkb21BdWRpdCgpOiB2b2lkIHtcclxuXHJcbiAgICBpZiAoIHRoaXMuaGFzUERPTUNvbnRlbnQgJiYgYXNzZXJ0ICkge1xyXG5cclxuICAgICAgdGhpcy5faW5wdXRUeXBlICYmIGFzc2VydCggdGhpcy5fdGFnTmFtZSEudG9VcHBlckNhc2UoKSA9PT0gSU5QVVRfVEFHLCAndGFnTmFtZSBtdXN0IGJlIElOUFVUIHRvIHN1cHBvcnQgaW5wdXRUeXBlJyApO1xyXG4gICAgICB0aGlzLl9wZG9tQ2hlY2tlZCAmJiBhc3NlcnQoIHRoaXMuX3RhZ05hbWUhLnRvVXBwZXJDYXNlKCkgPT09IElOUFVUX1RBRywgJ3RhZ05hbWUgbXVzdCBiZSBJTlBVVCB0byBzdXBwb3J0IHBkb21DaGVja2VkLicgKTtcclxuICAgICAgdGhpcy5faW5wdXRWYWx1ZSAmJiBhc3NlcnQoIHRoaXMuX3RhZ05hbWUhLnRvVXBwZXJDYXNlKCkgPT09IElOUFVUX1RBRywgJ3RhZ05hbWUgbXVzdCBiZSBJTlBVVCB0byBzdXBwb3J0IGlucHV0VmFsdWUnICk7XHJcbiAgICAgIHRoaXMuX3Bkb21DaGVja2VkICYmIGFzc2VydCggSU5QVVRfVFlQRVNfVEhBVF9TVVBQT1JUX0NIRUNLRUQuaW5jbHVkZXMoIHRoaXMuX2lucHV0VHlwZSEudG9VcHBlckNhc2UoKSApLCBgaW5wdXRUeXBlIGRvZXMgbm90IHN1cHBvcnQgY2hlY2tlZCBhdHRyaWJ1dGU6ICR7dGhpcy5faW5wdXRUeXBlfWAgKTtcclxuICAgICAgdGhpcy5fZm9jdXNIaWdobGlnaHRMYXllcmFibGUgJiYgYXNzZXJ0KCB0aGlzLmZvY3VzSGlnaGxpZ2h0IGluc3RhbmNlb2YgTm9kZSwgJ2ZvY3VzSGlnaGxpZ2h0IG11c3QgYmUgTm9kZSBpZiBoaWdobGlnaHQgaXMgbGF5ZXJhYmxlJyApO1xyXG4gICAgICB0aGlzLl90YWdOYW1lIS50b1VwcGVyQ2FzZSgpID09PSBJTlBVVF9UQUcgJiYgYXNzZXJ0KCB0eXBlb2YgdGhpcy5faW5wdXRUeXBlID09PSAnc3RyaW5nJywgJyBpbnB1dFR5cGUgZXhwZWN0ZWQgZm9yIGlucHV0JyApO1xyXG5cclxuICAgICAgLy8gbm90ZSB0aGF0IG1vc3QgdGhpbmdzIHRoYXQgYXJlIG5vdCBmb2N1c2FibGUgYnkgZGVmYXVsdCBuZWVkIGlubmVyQ29udGVudCB0byBiZSBmb2N1c2FibGUgb24gVm9pY2VPdmVyLFxyXG4gICAgICAvLyBidXQgdGhpcyB3aWxsIGNhdGNoIG1vc3QgY2FzZXMgc2luY2Ugb2Z0ZW4gdGhpbmdzIHRoYXQgZ2V0IGFkZGVkIHRvIHRoZSBmb2N1cyBvcmRlciBoYXZlIHRoZSBhcHBsaWNhdGlvblxyXG4gICAgICAvLyByb2xlIGZvciBjdXN0b20gaW5wdXQuIE5vdGUgdGhhdCBhY2Nlc3NpYmxlTmFtZSB3aWxsIG5vdCBiZSBjaGVja2VkIHRoYXQgaXQgc3BlY2lmaWNhbGx5IGNoYW5nZXMgaW5uZXJDb250ZW50LCBpdCBpcyB1cCB0byB0aGUgZGV2IHRvIGRvIHRoaXMuXHJcbiAgICAgIHRoaXMuYXJpYVJvbGUgPT09ICdhcHBsaWNhdGlvbicgJiYgYXNzZXJ0KCB0aGlzLl9pbm5lckNvbnRlbnRQcm9wZXJ0eS52YWx1ZSB8fCB0aGlzLl9hY2Nlc3NpYmxlTmFtZSwgJ211c3QgaGF2ZSBzb21lIGlubmVyQ29udGVudCBvciBlbGVtZW50IHdpbGwgbmV2ZXIgYmUgZm9jdXNhYmxlIGluIFZvaWNlT3ZlcicgKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCAoIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICkuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKS5jaGlsZHJlblsgaSBdLnBkb21BdWRpdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gIC8vIEhJR0hFUiBMRVZFTCBBUEk6IEdFVFRFUlMgQU5EIFNFVFRFUlMgRk9SIFBET00gQVBJIE9QVElPTlNcclxuICAvL1xyXG4gIC8vIFRoZXNlIGZ1bmN0aW9ucyB1dGlsaXplIHRoZSBsb3dlciBsZXZlbCBBUEkgdG8gYWNoaWV2ZSBhIGNvbnNpc3RlbmNlLCBhbmQgY29udmVuaWVudCBBUEkgZm9yIGFkZGluZ1xyXG4gIC8vIHBkb20gY29udGVudCB0byB0aGUgUERPTS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy83OTVcclxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgTm9kZSdzIHBkb20gY29udGVudCBpbiBhIHdheSB0aGF0IHdpbGwgZGVmaW5lIHRoZSBBY2Nlc3NpYmxlIE5hbWUgZm9yIHRoZSBicm93c2VyLiBEaWZmZXJlbnRcclxuICAgKiBIVE1MIGNvbXBvbmVudHMgYW5kIGNvZGUgc2l0dWF0aW9ucyByZXF1aXJlIGRpZmZlcmVudCBtZXRob2RzIG9mIHNldHRpbmcgdGhlIEFjY2Vzc2libGUgTmFtZS4gU2VlXHJcbiAgICogc2V0QWNjZXNzaWJsZU5hbWVCZWhhdmlvciBmb3IgZGV0YWlscyBvbiBob3cgdGhpcyBzdHJpbmcgaXMgcmVuZGVyZWQgaW4gdGhlIFBET00uIFNldHRpbmcgdG8gbnVsbCB3aWxsIGNsZWFyXHJcbiAgICogdGhpcyBOb2RlJ3MgYWNjZXNzaWJsZU5hbWVcclxuICAgKlxyXG4gICAqIEBleHBlcmltZW50YWwgLSBOT1RFOiB1c2Ugd2l0aCBjYXV0aW9uLCBhMTF5IHRlYW0gcmVzZXJ2ZXMgdGhlIHJpZ2h0IHRvIGNoYW5nZSBBUEkgKHRob3VnaCB1bmxpa2VseSkuIE5vdCB5ZXQgZnVsbHkgaW1wbGVtZW50ZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODY3XHJcbiAgICovXHJcbiAgcHVibGljIHNldEFjY2Vzc2libGVOYW1lKCBwcm92aWRlZEFjY2Vzc2libGVOYW1lOiBQRE9NVmFsdWVUeXBlIHwgbnVsbCApOiB2b2lkIHtcclxuICAgIC8vIElmIGl0J3MgYSBQcm9wZXJ0eSwgd2UnbGwganVzdCBncmFiIHRoZSBpbml0aWFsIHZhbHVlLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE0NDJcclxuICAgIGNvbnN0IGFjY2Vzc2libGVOYW1lID0gdW53cmFwUHJvcGVydHkoIHByb3ZpZGVkQWNjZXNzaWJsZU5hbWUgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX2FjY2Vzc2libGVOYW1lICE9PSBhY2Nlc3NpYmxlTmFtZSApIHtcclxuICAgICAgdGhpcy5fYWNjZXNzaWJsZU5hbWUgPSBhY2Nlc3NpYmxlTmFtZTtcclxuXHJcbiAgICAgIHRoaXMub25QRE9NQ29udGVudENoYW5nZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBhY2Nlc3NpYmxlTmFtZSggYWNjZXNzaWJsZU5hbWU6IFBET01WYWx1ZVR5cGUgfCBudWxsICkgeyB0aGlzLnNldEFjY2Vzc2libGVOYW1lKCBhY2Nlc3NpYmxlTmFtZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgYWNjZXNzaWJsZU5hbWUoKTogc3RyaW5nIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldEFjY2Vzc2libGVOYW1lKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSB0YWcgbmFtZSBvZiB0aGUgRE9NIGVsZW1lbnQgcmVwcmVzZW50aW5nIHRoaXMgbm9kZSBmb3IgYWNjZXNzaWJpbGl0eS5cclxuICAgKlxyXG4gICAqIEBleHBlcmltZW50YWwgLSBOT1RFOiB1c2Ugd2l0aCBjYXV0aW9uLCBhMTF5IHRlYW0gcmVzZXJ2ZXMgdGhlIHJpZ2h0IHRvIGNoYW5nZSBBUEkgKHRob3VnaCB1bmxpa2VseSkuIE5vdCB5ZXQgZnVsbHkgaW1wbGVtZW50ZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODY3XHJcbiAgICovXHJcbiAgcHVibGljIGdldEFjY2Vzc2libGVOYW1lKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX2FjY2Vzc2libGVOYW1lO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIHRoaXMgTm9kZSBmcm9tIHRoZSBQRE9NIGJ5IGNsZWFyaW5nIGl0cyBwZG9tIGNvbnRlbnQuIFRoaXMgY2FuIGJlIHVzZWZ1bCB3aGVuIGNyZWF0aW5nIGljb25zIGZyb21cclxuICAgKiBwZG9tIGNvbnRlbnQuXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZUZyb21QRE9NKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fdGFnTmFtZSAhPT0gbnVsbCwgJ1RoZXJlIGlzIG5vIHBkb20gY29udGVudCB0byBjbGVhciBmcm9tIHRoZSBQRE9NJyApO1xyXG4gICAgdGhpcy50YWdOYW1lID0gbnVsbDtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBhY2Nlc3NpYmxlTmFtZUJlaGF2aW9yIGlzIGEgZnVuY3Rpb24gdGhhdCB3aWxsIHNldCB0aGUgYXBwcm9wcmlhdGUgb3B0aW9ucyBvbiB0aGlzIG5vZGUgdG8gZ2V0IHRoZSBkZXNpcmVkXHJcbiAgICogXCJBY2Nlc3NpYmxlIE5hbWVcIlxyXG4gICAqXHJcbiAgICogVGhpcyBhY2Nlc3NpYmxlTmFtZUJlaGF2aW9yJ3MgZGVmYXVsdCBkb2VzIHRoZSBiZXN0IGl0IGNhbiB0byBjcmVhdGUgYSBnZW5lcmFsIG1ldGhvZCB0byBzZXQgdGhlIEFjY2Vzc2libGVcclxuICAgKiBOYW1lIGZvciBhIHZhcmlldHkgb2YgZGlmZmVyZW50IE5vZGUgdHlwZXMgYW5kIGNvbmZpZ3VyYXRpb25zLCBidXQgaWYgYSBOb2RlIGlzIG1vcmUgY29tcGxpY2F0ZWQsIHRoZW4gdGhpc1xyXG4gICAqIG1ldGhvZCB3aWxsIG5vdCBwcm9wZXJseSBzZXQgdGhlIEFjY2Vzc2libGUgTmFtZSBmb3IgdGhlIE5vZGUncyBIVE1MIGNvbnRlbnQuIEluIHRoaXMgc2l0dWF0aW9uIHRoaXMgZnVuY3Rpb25cclxuICAgKiBuZWVkcyB0byBiZSBvdmVycmlkZGVuIGJ5IHRoZSBzdWJ0eXBlIHRvIG1lZXQgaXRzIHNwZWNpZmljIGNvbnN0cmFpbnRzLiBXaGVuIGRvaW5nIHRoaXMgbWFrZSBpdCBpcyB1cCB0byB0aGVcclxuICAgKiB1c2FnZSBzaXRlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBBY2Nlc3NpYmxlIE5hbWUgaXMgcHJvcGVybHkgYmVpbmcgc2V0IGFuZCBjb252ZXllZCB0byBBVCwgYXMgaXQgaXMgdmVyeSBoYXJkXHJcbiAgICogdG8gdmFsaWRhdGUgdGhpcyBmdW5jdGlvbi5cclxuICAgKlxyXG4gICAqIE5PVEU6IEJ5IEFjY2Vzc2libGUgTmFtZSAoY2FwaXRhbGl6ZWQpLCB3ZSBtZWFuIHRoZSBwcm9wZXIgdGl0bGUgb2YgdGhlIEhUTUwgZWxlbWVudCB0aGF0IHdpbGwgYmUgc2V0IGluXHJcbiAgICogdGhlIGJyb3dzZXIgUGFyYWxsZWxET00gVHJlZSBhbmQgdGhlbiBpbnRlcnByZXRlZCBieSBBVC4gVGhpcyBpcyBuZWNlc3NpbHkgZGlmZmVyZW50IGZyb20gc2NlbmVyeSBpbnRlcm5hbFxyXG4gICAqIG5hbWVzIG9mIEhUTUwgZWxlbWVudHMgbGlrZSBcImxhYmVsIHNpYmxpbmdcIiAoZXZlbiB0aG91Z2gsIGluIGNlcnRhaW4gY2lyY3Vtc3RhbmNlcywgYW4gQWNjZXNzaWJsZSBOYW1lIGNvdWxkXHJcbiAgICogYmUgc2V0IGJ5IHVzaW5nIHRoZSBcImxhYmVsIHNpYmxpbmdcIiB3aXRoIHRhZyBuYW1lIFwibGFiZWxcIiBhbmQgYSBcImZvclwiIGF0dHJpYnV0ZSkuXHJcbiAgICpcclxuICAgKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCBzZXR0aW5nIGFuIEFjY2Vzc2libGUgTmFtZSBvbiBIVE1MIHNlZSB0aGUgc2NlbmVyeSBkb2NzIGZvciBhY2Nlc3NpYmlsaXR5LFxyXG4gICAqIGFuZCBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIucGFjaWVsbG9ncm91cC5jb20vYmxvZy8yMDE3LzA0L3doYXQtaXMtYW4tYWNjZXNzaWJsZS1uYW1lL1xyXG4gICAqXHJcbiAgICogQGV4cGVyaW1lbnRhbCAtIE5PVEU6IHVzZSB3aXRoIGNhdXRpb24sIGExMXkgdGVhbSByZXNlcnZlcyB0aGUgcmlnaHQgdG8gY2hhbmdlIEFQSSAodGhvdWdoIHVubGlrZWx5KS5cclxuICAgKiAgICAgICAgICAgICAgICAgTm90IHlldCBmdWxseSBpbXBsZW1lbnRlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84NjdcclxuICAgKi9cclxuICBwdWJsaWMgc2V0QWNjZXNzaWJsZU5hbWVCZWhhdmlvciggYWNjZXNzaWJsZU5hbWVCZWhhdmlvcjogUERPTUJlaGF2aW9yRnVuY3Rpb24gKTogdm9pZCB7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9hY2Nlc3NpYmxlTmFtZUJlaGF2aW9yICE9PSBhY2Nlc3NpYmxlTmFtZUJlaGF2aW9yICkge1xyXG5cclxuICAgICAgdGhpcy5fYWNjZXNzaWJsZU5hbWVCZWhhdmlvciA9IGFjY2Vzc2libGVOYW1lQmVoYXZpb3I7XHJcblxyXG4gICAgICB0aGlzLm9uUERPTUNvbnRlbnRDaGFuZ2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgYWNjZXNzaWJsZU5hbWVCZWhhdmlvciggYWNjZXNzaWJsZU5hbWVCZWhhdmlvcjogUERPTUJlaGF2aW9yRnVuY3Rpb24gKSB7IHRoaXMuc2V0QWNjZXNzaWJsZU5hbWVCZWhhdmlvciggYWNjZXNzaWJsZU5hbWVCZWhhdmlvciApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgYWNjZXNzaWJsZU5hbWVCZWhhdmlvcigpOiBQRE9NQmVoYXZpb3JGdW5jdGlvbiB7IHJldHVybiB0aGlzLmdldEFjY2Vzc2libGVOYW1lQmVoYXZpb3IoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGhlbHAgdGV4dCBvZiB0aGUgaW50ZXJhY3RpdmUgZWxlbWVudC5cclxuICAgKlxyXG4gICAqIEBleHBlcmltZW50YWwgLSBOT1RFOiB1c2Ugd2l0aCBjYXV0aW9uLCBhMTF5IHRlYW0gcmVzZXJ2ZXMgdGhlIHJpZ2h0IHRvIGNoYW5nZSBBUEkgKHRob3VnaCB1bmxpa2VseSkuXHJcbiAgICogICAgICAgICAgICAgICAgIE5vdCB5ZXQgZnVsbHkgaW1wbGVtZW50ZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODY3XHJcbiAgICovXHJcbiAgcHVibGljIGdldEFjY2Vzc2libGVOYW1lQmVoYXZpb3IoKTogUERPTUJlaGF2aW9yRnVuY3Rpb24ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2FjY2Vzc2libGVOYW1lQmVoYXZpb3I7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIE5vZGUgaGVhZGluZyBjb250ZW50LiBUaGlzIGJ5IGRlZmF1bHQgd2lsbCBiZSBhIGhlYWRpbmcgdGFnIHdob3NlIGxldmVsIGlzIGRlcGVuZGVudCBvbiBob3cgbWFueSBwYXJlbnRzXHJcbiAgICogTm9kZXMgYXJlIGhlYWRpbmcgbm9kZXMuIFNlZSBjb21wdXRlSGVhZGluZ0xldmVsKCkgZm9yIG1vcmUgaW5mb1xyXG4gICAqXHJcbiAgICogQGV4cGVyaW1lbnRhbCAtIE5PVEU6IHVzZSB3aXRoIGNhdXRpb24sIGExMXkgdGVhbSByZXNlcnZlcyB0aGUgcmlnaHQgdG8gY2hhbmdlIEFQSSAodGhvdWdoIHVubGlrZWx5KS5cclxuICAgKiAgICAgICAgICAgICAgICAgTm90IHlldCBmdWxseSBpbXBsZW1lbnRlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84NjdcclxuICAgKi9cclxuICBwdWJsaWMgc2V0UERPTUhlYWRpbmcoIHByb3ZpZGVkUGRvbUhlYWRpbmc6IFBET01WYWx1ZVR5cGUgfCBudWxsICk6IHZvaWQge1xyXG4gICAgLy8gSWYgaXQncyBhIFByb3BlcnR5LCB3ZSdsbCBqdXN0IGdyYWIgdGhlIGluaXRpYWwgdmFsdWUuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTQ0MlxyXG4gICAgY29uc3QgcGRvbUhlYWRpbmcgPSB1bndyYXBQcm9wZXJ0eSggcHJvdmlkZWRQZG9tSGVhZGluZyApO1xyXG5cclxuICAgIGlmICggdGhpcy5fcGRvbUhlYWRpbmcgIT09IHBkb21IZWFkaW5nICkge1xyXG4gICAgICB0aGlzLl9wZG9tSGVhZGluZyA9IHBkb21IZWFkaW5nO1xyXG5cclxuICAgICAgdGhpcy5vblBET01Db250ZW50Q2hhbmdlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHBkb21IZWFkaW5nKCBwZG9tSGVhZGluZzogUERPTVZhbHVlVHlwZSB8IG51bGwgKSB7IHRoaXMuc2V0UERPTUhlYWRpbmcoIHBkb21IZWFkaW5nICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBwZG9tSGVhZGluZygpOiBzdHJpbmcgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0UERPTUhlYWRpbmcoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHZhbHVlIG9mIHRoaXMgTm9kZSdzIGhlYWRpbmcuIFVzZSBudWxsIHRvIGNsZWFyIHRoZSBoZWFkaW5nXHJcbiAgICpcclxuICAgKiBAZXhwZXJpbWVudGFsIC0gTk9URTogdXNlIHdpdGggY2F1dGlvbiwgYTExeSB0ZWFtIHJlc2VydmVzIHRoZSByaWdodCB0byBjaGFuZ2UgQVBJICh0aG91Z2ggdW5saWtlbHkpLlxyXG4gICAqICAgICAgICAgICAgICAgICBOb3QgeWV0IGZ1bGx5IGltcGxlbWVudGVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg2N1xyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRQRE9NSGVhZGluZygpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9wZG9tSGVhZGluZztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgYmVoYXZpb3Igb2YgaG93IGB0aGlzLnBkb21IZWFkaW5nYCBpcyBzZXQgaW4gdGhlIFBET00uIFNlZSBkZWZhdWx0IGJlaGF2aW9yIGZ1bmN0aW9uIGZvciBtb3JlXHJcbiAgICogaW5mb3JtYXRpb24uXHJcbiAgICpcclxuICAgKiBAZXhwZXJpbWVudGFsIC0gTk9URTogdXNlIHdpdGggY2F1dGlvbiwgYTExeSB0ZWFtIHJlc2VydmVzIHRoZSByaWdodCB0byBjaGFuZ2UgQVBJICh0aG91Z2ggdW5saWtlbHkpLlxyXG4gICAqICAgICAgICAgICAgICAgICBOb3QgeWV0IGZ1bGx5IGltcGxlbWVudGVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg2N1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRQRE9NSGVhZGluZ0JlaGF2aW9yKCBwZG9tSGVhZGluZ0JlaGF2aW9yOiBQRE9NQmVoYXZpb3JGdW5jdGlvbiApOiB2b2lkIHtcclxuXHJcbiAgICBpZiAoIHRoaXMuX3Bkb21IZWFkaW5nQmVoYXZpb3IgIT09IHBkb21IZWFkaW5nQmVoYXZpb3IgKSB7XHJcblxyXG4gICAgICB0aGlzLl9wZG9tSGVhZGluZ0JlaGF2aW9yID0gcGRvbUhlYWRpbmdCZWhhdmlvcjtcclxuXHJcbiAgICAgIHRoaXMub25QRE9NQ29udGVudENoYW5nZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBwZG9tSGVhZGluZ0JlaGF2aW9yKCBwZG9tSGVhZGluZ0JlaGF2aW9yOiBQRE9NQmVoYXZpb3JGdW5jdGlvbiApIHsgdGhpcy5zZXRQRE9NSGVhZGluZ0JlaGF2aW9yKCBwZG9tSGVhZGluZ0JlaGF2aW9yICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBwZG9tSGVhZGluZ0JlaGF2aW9yKCk6IFBET01CZWhhdmlvckZ1bmN0aW9uIHsgcmV0dXJuIHRoaXMuZ2V0UERPTUhlYWRpbmdCZWhhdmlvcigpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgaGVscCB0ZXh0IG9mIHRoZSBpbnRlcmFjdGl2ZSBlbGVtZW50LlxyXG4gICAqXHJcbiAgICogQGV4cGVyaW1lbnRhbCAtIE5PVEU6IHVzZSB3aXRoIGNhdXRpb24sIGExMXkgdGVhbSByZXNlcnZlcyB0aGUgcmlnaHQgdG8gY2hhbmdlIEFQSSAodGhvdWdoIHVubGlrZWx5KS5cclxuICAgKiAgICAgICAgICAgICAgICAgTm90IHlldCBmdWxseSBpbXBsZW1lbnRlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84NjdcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UERPTUhlYWRpbmdCZWhhdmlvcigpOiBQRE9NQmVoYXZpb3JGdW5jdGlvbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fcGRvbUhlYWRpbmdCZWhhdmlvcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgdGFnIG5hbWUgb2YgdGhlIERPTSBlbGVtZW50IHJlcHJlc2VudGluZyB0aGlzIG5vZGUgZm9yIGFjY2Vzc2liaWxpdHkuXHJcbiAgICpcclxuICAgKiBAZXhwZXJpbWVudGFsIC0gTk9URTogdXNlIHdpdGggY2F1dGlvbiwgYTExeSB0ZWFtIHJlc2VydmVzIHRoZSByaWdodCB0byBjaGFuZ2UgQVBJICh0aG91Z2ggdW5saWtlbHkpLlxyXG4gICAqICAgICAgICAgICAgICAgICBOb3QgeWV0IGZ1bGx5IGltcGxlbWVudGVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg2N1xyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRIZWFkaW5nTGV2ZWwoKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5faGVhZGluZ0xldmVsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBoZWFkaW5nTGV2ZWwoKTogbnVtYmVyIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldEhlYWRpbmdMZXZlbCgpOyB9XHJcblxyXG5cclxuICAvKipcclxuICAgLy8gVE9ETzogd2hhdCBpZiBhbmNlc3RvciBjaGFuZ2VzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg1NVxyXG4gICAqIFNldHMgdGhpcyBOb2RlJ3MgaGVhZGluZyBsZXZlbCwgYnkgcmVjdXJzaW5nIHVwIHRoZSBhY2Nlc3NpYmlsaXR5IHRyZWUgdG8gZmluZCBoZWFkaW5ncyB0aGlzIE5vZGVcclxuICAgKiBpcyBuZXN0ZWQgdW5kZXIuXHJcbiAgICpcclxuICAgKiBAZXhwZXJpbWVudGFsIC0gTk9URTogdXNlIHdpdGggY2F1dGlvbiwgYTExeSB0ZWFtIHJlc2VydmVzIHRoZSByaWdodCB0byBjaGFuZ2UgQVBJICh0aG91Z2ggdW5saWtlbHkpLlxyXG4gICAqICAgICAgICAgICAgICAgICBOb3QgeWV0IGZ1bGx5IGltcGxlbWVudGVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg2N1xyXG4gICAqL1xyXG4gIHByaXZhdGUgY29tcHV0ZUhlYWRpbmdMZXZlbCgpOiBudW1iZXIge1xyXG5cclxuICAgIC8vIFRPRE86IGFzc2VydD8/PyBhc3NlcnQoIHRoaXMuaGVhZGluZ0xldmVsIHx8IHRoaXMuX3Bkb21QYXJlbnQpOyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg1NVxyXG4gICAgLy8gRWl0aGVyIF4gd2hpY2ggbWF5IGJyZWFrIGR1cmluZyBjb25zdHJ1Y3Rpb24sIG9yIFYgKGJlbG93KVxyXG4gICAgLy8gIGJhc2UgY2FzZSB0byBoZWFkaW5nIGxldmVsIDFcclxuICAgIGlmICggIXRoaXMuX3Bkb21QYXJlbnQgKSB7XHJcbiAgICAgIGlmICggdGhpcy5fcGRvbUhlYWRpbmcgKSB7XHJcbiAgICAgICAgdGhpcy5faGVhZGluZ0xldmVsID0gMTtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gMDsgLy8gc28gdGhhdCB0aGUgZmlyc3Qgbm9kZSB3aXRoIGEgaGVhZGluZyBpcyBoZWFkaW5nTGV2ZWwgMVxyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy5fcGRvbUhlYWRpbmcgKSB7XHJcbiAgICAgIGNvbnN0IGxldmVsID0gdGhpcy5fcGRvbVBhcmVudC5jb21wdXRlSGVhZGluZ0xldmVsKCkgKyAxO1xyXG4gICAgICB0aGlzLl9oZWFkaW5nTGV2ZWwgPSBsZXZlbDtcclxuICAgICAgcmV0dXJuIGxldmVsO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9wZG9tUGFyZW50LmNvbXB1dGVIZWFkaW5nTGV2ZWwoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgaGVscCB0ZXh0IGZvciBhIE5vZGUuIFNlZSBzZXRBY2Nlc3NpYmxlTmFtZUJlaGF2aW9yIGZvciBkZXRhaWxzIG9uIGhvdyB0aGlzIHN0cmluZyBpc1xyXG4gICAqIHJlbmRlcmVkIGluIHRoZSBQRE9NLiBOdWxsIHdpbGwgY2xlYXIgdGhlIGhlbHAgdGV4dCBmb3IgdGhpcyBOb2RlLlxyXG4gICAqXHJcbiAgICogQGV4cGVyaW1lbnRhbCAtIE5PVEU6IHVzZSB3aXRoIGNhdXRpb24sIGExMXkgdGVhbSByZXNlcnZlcyB0aGUgcmlnaHQgdG8gY2hhbmdlIEFQSSAodGhvdWdoIHVubGlrZWx5KS5cclxuICAgKiAgICAgICAgICAgICAgICAgTm90IHlldCBmdWxseSBpbXBsZW1lbnRlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84NjdcclxuICAgKi9cclxuICBwdWJsaWMgc2V0SGVscFRleHQoIHByb3ZpZGVkSGVscFRleHQ6IFBET01WYWx1ZVR5cGUgfCBudWxsICk6IHZvaWQge1xyXG4gICAgLy8gSWYgaXQncyBhIFByb3BlcnR5LCB3ZSdsbCBqdXN0IGdyYWIgdGhlIGluaXRpYWwgdmFsdWUuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTQ0MlxyXG4gICAgY29uc3QgaGVscFRleHQgPSB1bndyYXBQcm9wZXJ0eSggcHJvdmlkZWRIZWxwVGV4dCApO1xyXG5cclxuICAgIGlmICggdGhpcy5faGVscFRleHQgIT09IGhlbHBUZXh0ICkge1xyXG5cclxuICAgICAgdGhpcy5faGVscFRleHQgPSBoZWxwVGV4dDtcclxuXHJcbiAgICAgIHRoaXMub25QRE9NQ29udGVudENoYW5nZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBoZWxwVGV4dCggaGVscFRleHQ6IFBET01WYWx1ZVR5cGUgfCBudWxsICkgeyB0aGlzLnNldEhlbHBUZXh0KCBoZWxwVGV4dCApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgaGVscFRleHQoKTogc3RyaW5nIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldEhlbHBUZXh0KCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBoZWxwIHRleHQgb2YgdGhlIGludGVyYWN0aXZlIGVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBAZXhwZXJpbWVudGFsIC0gTk9URTogdXNlIHdpdGggY2F1dGlvbiwgYTExeSB0ZWFtIHJlc2VydmVzIHRoZSByaWdodCB0byBjaGFuZ2UgQVBJICh0aG91Z2ggdW5saWtlbHkpLlxyXG4gICAqICAgICAgICAgICAgICAgICBOb3QgeWV0IGZ1bGx5IGltcGxlbWVudGVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg2N1xyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRIZWxwVGV4dCgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9oZWxwVGV4dDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGhlbHBUZXh0QmVoYXZpb3IgaXMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgc2V0IHRoZSBhcHByb3ByaWF0ZSBvcHRpb25zIG9uIHRoaXMgbm9kZSB0byBnZXQgdGhlIGRlc2lyZWRcclxuICAgKiBcIkhlbHAgVGV4dFwiLlxyXG4gICAqXHJcbiAgICogQGV4cGVyaW1lbnRhbCAtIE5PVEU6IHVzZSB3aXRoIGNhdXRpb24sIGExMXkgdGVhbSByZXNlcnZlcyB0aGUgcmlnaHQgdG8gY2hhbmdlIEFQSSAodGhvdWdoIHVubGlrZWx5KS5cclxuICAgKiAgICAgICAgICAgICAgICAgTm90IHlldCBmdWxseSBpbXBsZW1lbnRlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84NjdcclxuICAgKi9cclxuICBwdWJsaWMgc2V0SGVscFRleHRCZWhhdmlvciggaGVscFRleHRCZWhhdmlvcjogUERPTUJlaGF2aW9yRnVuY3Rpb24gKTogdm9pZCB7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9oZWxwVGV4dEJlaGF2aW9yICE9PSBoZWxwVGV4dEJlaGF2aW9yICkge1xyXG5cclxuICAgICAgdGhpcy5faGVscFRleHRCZWhhdmlvciA9IGhlbHBUZXh0QmVoYXZpb3I7XHJcblxyXG4gICAgICB0aGlzLm9uUERPTUNvbnRlbnRDaGFuZ2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgaGVscFRleHRCZWhhdmlvciggaGVscFRleHRCZWhhdmlvcjogUERPTUJlaGF2aW9yRnVuY3Rpb24gKSB7IHRoaXMuc2V0SGVscFRleHRCZWhhdmlvciggaGVscFRleHRCZWhhdmlvciApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgaGVscFRleHRCZWhhdmlvcigpOiBQRE9NQmVoYXZpb3JGdW5jdGlvbiB7IHJldHVybiB0aGlzLmdldEhlbHBUZXh0QmVoYXZpb3IoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGhlbHAgdGV4dCBvZiB0aGUgaW50ZXJhY3RpdmUgZWxlbWVudC5cclxuICAgKlxyXG4gICAqIEBleHBlcmltZW50YWwgLSBOT1RFOiB1c2Ugd2l0aCBjYXV0aW9uLCBhMTF5IHRlYW0gcmVzZXJ2ZXMgdGhlIHJpZ2h0IHRvIGNoYW5nZSBBUEkgKHRob3VnaCB1bmxpa2VseSkuXHJcbiAgICogICAgICAgICAgICAgICAgIE5vdCB5ZXQgZnVsbHkgaW1wbGVtZW50ZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODY3XHJcbiAgICovXHJcbiAgcHVibGljIGdldEhlbHBUZXh0QmVoYXZpb3IoKTogUERPTUJlaGF2aW9yRnVuY3Rpb24ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2hlbHBUZXh0QmVoYXZpb3I7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gIC8vIExPV0VSIExFVkVMIEdFVFRFUlMgQU5EIFNFVFRFUlMgRk9SIFBET00gQVBJIE9QVElPTlNcclxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgdGFnIG5hbWUgZm9yIHRoZSBwcmltYXJ5IHNpYmxpbmcgaW4gdGhlIFBET00uIERPTSBlbGVtZW50IHRhZyBuYW1lcyBhcmUgcmVhZC1vbmx5LCBzbyB0aGlzXHJcbiAgICogZnVuY3Rpb24gd2lsbCBjcmVhdGUgYSBuZXcgRE9NIGVsZW1lbnQgZWFjaCB0aW1lIGl0IGlzIGNhbGxlZCBmb3IgdGhlIE5vZGUncyBQRE9NUGVlciBhbmRcclxuICAgKiByZXNldCB0aGUgcGRvbSBjb250ZW50LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgXCJlbnRyeSBwb2ludFwiIGZvciBQYXJhbGxlbCBET00gY29udGVudC4gV2hlbiBhIE5vZGUgaGFzIGEgdGFnTmFtZSBpdCB3aWxsIGFwcGVhciBpbiB0aGUgUGFyYWxsZWwgRE9NXHJcbiAgICogYW5kIG90aGVyIGF0dHJpYnV0ZXMgY2FuIGJlIHNldC4gV2l0aG91dCBpdCwgbm90aGluZyB3aWxsIGFwcGVhciBpbiB0aGUgUGFyYWxsZWwgRE9NLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRUYWdOYW1lKCB0YWdOYW1lOiBzdHJpbmcgfCBudWxsICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGFnTmFtZSA9PT0gbnVsbCB8fCB0eXBlb2YgdGFnTmFtZSA9PT0gJ3N0cmluZycgKTtcclxuXHJcbiAgICBpZiAoIHRhZ05hbWUgIT09IHRoaXMuX3RhZ05hbWUgKSB7XHJcbiAgICAgIHRoaXMuX3RhZ05hbWUgPSB0YWdOYW1lO1xyXG5cclxuICAgICAgLy8gVE9ETzogdGhpcyBjb3VsZCBiZSBzZXR0aW5nIFBET00gY29udGVudCB0d2ljZVxyXG4gICAgICB0aGlzLm9uUERPTUNvbnRlbnRDaGFuZ2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgdGFnTmFtZSggdGFnTmFtZTogc3RyaW5nIHwgbnVsbCApIHsgdGhpcy5zZXRUYWdOYW1lKCB0YWdOYW1lICk7IH1cclxuXHJcbiAgcHVibGljIGdldCB0YWdOYW1lKCk6IHN0cmluZyB8IG51bGwgeyByZXR1cm4gdGhpcy5nZXRUYWdOYW1lKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSB0YWcgbmFtZSBvZiB0aGUgRE9NIGVsZW1lbnQgcmVwcmVzZW50aW5nIHRoaXMgbm9kZSBmb3IgYWNjZXNzaWJpbGl0eS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VGFnTmFtZSgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl90YWdOYW1lO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSB0YWcgbmFtZSBmb3IgdGhlIGFjY2Vzc2libGUgbGFiZWwgc2libGluZyBmb3IgdGhpcyBOb2RlLiBET00gZWxlbWVudCB0YWcgbmFtZXMgYXJlIHJlYWQtb25seSxcclxuICAgKiBzbyB0aGlzIHdpbGwgcmVxdWlyZSBjcmVhdGluZyBhIG5ldyBQRE9NUGVlciBmb3IgdGhpcyBOb2RlIChyZWNvbnN0cnVjdGluZyBhbGwgRE9NIEVsZW1lbnRzKS4gSWZcclxuICAgKiBsYWJlbENvbnRlbnQgaXMgc3BlY2lmaWVkIHdpdGhvdXQgY2FsbGluZyB0aGlzIG1ldGhvZCwgdGhlbiB0aGUgREVGQVVMVF9MQUJFTF9UQUdfTkFNRSB3aWxsIGJlIHVzZWQgYXMgdGhlXHJcbiAgICogdGFnIG5hbWUgZm9yIHRoZSBsYWJlbCBzaWJsaW5nLiBVc2UgbnVsbCB0byBjbGVhciB0aGUgbGFiZWwgc2libGluZyBlbGVtZW50IGZyb20gdGhlIFBET00uXHJcbiAgICovXHJcbiAgcHVibGljIHNldExhYmVsVGFnTmFtZSggdGFnTmFtZTogc3RyaW5nIHwgbnVsbCApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRhZ05hbWUgPT09IG51bGwgfHwgdHlwZW9mIHRhZ05hbWUgPT09ICdzdHJpbmcnICk7XHJcblxyXG4gICAgaWYgKCB0YWdOYW1lICE9PSB0aGlzLl9sYWJlbFRhZ05hbWUgKSB7XHJcbiAgICAgIHRoaXMuX2xhYmVsVGFnTmFtZSA9IHRhZ05hbWU7XHJcblxyXG4gICAgICB0aGlzLm9uUERPTUNvbnRlbnRDaGFuZ2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgbGFiZWxUYWdOYW1lKCB0YWdOYW1lOiBzdHJpbmcgfCBudWxsICkgeyB0aGlzLnNldExhYmVsVGFnTmFtZSggdGFnTmFtZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgbGFiZWxUYWdOYW1lKCk6IHN0cmluZyB8IG51bGwgeyByZXR1cm4gdGhpcy5nZXRMYWJlbFRhZ05hbWUoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGxhYmVsIHNpYmxpbmcgSFRNTCB0YWcgbmFtZS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TGFiZWxUYWdOYW1lKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX2xhYmVsVGFnTmFtZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgdGFnIG5hbWUgZm9yIHRoZSBkZXNjcmlwdGlvbiBzaWJsaW5nLiBIVE1MIGVsZW1lbnQgdGFnIG5hbWVzIGFyZSByZWFkLW9ubHksIHNvIHRoaXMgd2lsbCByZXF1aXJlIGNyZWF0aW5nXHJcbiAgICogYSBuZXcgSFRNTCBlbGVtZW50LCBhbmQgaW5zZXJ0aW5nIGl0IGludG8gdGhlIERPTS4gVGhlIHRhZyBuYW1lIHByb3ZpZGVkIG11c3Qgc3VwcG9ydFxyXG4gICAqIGlubmVySFRNTCBhbmQgdGV4dENvbnRlbnQuIElmIGRlc2NyaXB0aW9uQ29udGVudCBpcyBzcGVjaWZpZWQgd2l0aG91dCB0aGlzIG9wdGlvbixcclxuICAgKiB0aGVuIGRlc2NyaXB0aW9uVGFnTmFtZSB3aWxsIGJlIHNldCB0byBERUZBVUxUX0RFU0NSSVBUSU9OX1RBR19OQU1FLlxyXG4gICAqXHJcbiAgICogUGFzc2luZyAnbnVsbCcgd2lsbCBjbGVhciBhd2F5IHRoZSBkZXNjcmlwdGlvbiBzaWJsaW5nLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXREZXNjcmlwdGlvblRhZ05hbWUoIHRhZ05hbWU6IHN0cmluZyB8IG51bGwgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0YWdOYW1lID09PSBudWxsIHx8IHR5cGVvZiB0YWdOYW1lID09PSAnc3RyaW5nJyApO1xyXG5cclxuICAgIGlmICggdGFnTmFtZSAhPT0gdGhpcy5fZGVzY3JpcHRpb25UYWdOYW1lICkge1xyXG5cclxuICAgICAgdGhpcy5fZGVzY3JpcHRpb25UYWdOYW1lID0gdGFnTmFtZTtcclxuXHJcbiAgICAgIHRoaXMub25QRE9NQ29udGVudENoYW5nZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBkZXNjcmlwdGlvblRhZ05hbWUoIHRhZ05hbWU6IHN0cmluZyB8IG51bGwgKSB7IHRoaXMuc2V0RGVzY3JpcHRpb25UYWdOYW1lKCB0YWdOYW1lICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBkZXNjcmlwdGlvblRhZ05hbWUoKTogc3RyaW5nIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldERlc2NyaXB0aW9uVGFnTmFtZSgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgSFRNTCB0YWcgbmFtZSBmb3IgdGhlIGRlc2NyaXB0aW9uIHNpYmxpbmcuXHJcbiAgICovXHJcbiAgcHVibGljIGdldERlc2NyaXB0aW9uVGFnTmFtZSgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9kZXNjcmlwdGlvblRhZ05hbWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB0eXBlIGZvciBhbiBpbnB1dCBlbGVtZW50LiAgRWxlbWVudCBtdXN0IGhhdmUgdGhlIElOUFVUIHRhZyBuYW1lLiBUaGUgaW5wdXQgYXR0cmlidXRlIGlzIG5vdFxyXG4gICAqIHNwZWNpZmllZCBhcyByZWFkb25seSwgc28gaW52YWxpZGF0aW5nIHBkb20gY29udGVudCBpcyBub3QgbmVjZXNzYXJ5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRJbnB1dFR5cGUoIGlucHV0VHlwZTogc3RyaW5nIHwgbnVsbCApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlucHV0VHlwZSA9PT0gbnVsbCB8fCB0eXBlb2YgaW5wdXRUeXBlID09PSAnc3RyaW5nJyApO1xyXG4gICAgYXNzZXJ0ICYmIHRoaXMudGFnTmFtZSAmJiBhc3NlcnQoIHRoaXMuX3RhZ05hbWUhLnRvVXBwZXJDYXNlKCkgPT09IElOUFVUX1RBRywgJ3RhZyBuYW1lIG11c3QgYmUgSU5QVVQgdG8gc3VwcG9ydCBpbnB1dFR5cGUnICk7XHJcblxyXG4gICAgaWYgKCBpbnB1dFR5cGUgIT09IHRoaXMuX2lucHV0VHlwZSApIHtcclxuXHJcbiAgICAgIHRoaXMuX2lucHV0VHlwZSA9IGlucHV0VHlwZTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcGRvbUluc3RhbmNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBwZWVyID0gdGhpcy5fcGRvbUluc3RhbmNlc1sgaSBdLnBlZXIhO1xyXG5cclxuICAgICAgICAvLyByZW1vdmUgdGhlIGF0dHJpYnV0ZSBpZiBjbGVhcmVkIGJ5IHNldHRpbmcgdG8gJ251bGwnXHJcbiAgICAgICAgaWYgKCBpbnB1dFR5cGUgPT09IG51bGwgKSB7XHJcbiAgICAgICAgICBwZWVyLnJlbW92ZUF0dHJpYnV0ZUZyb21FbGVtZW50KCAndHlwZScgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBwZWVyLnNldEF0dHJpYnV0ZVRvRWxlbWVudCggJ3R5cGUnLCBpbnB1dFR5cGUgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgaW5wdXRUeXBlKCBpbnB1dFR5cGU6IHN0cmluZyB8IG51bGwgKSB7IHRoaXMuc2V0SW5wdXRUeXBlKCBpbnB1dFR5cGUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGlucHV0VHlwZSgpOiBzdHJpbmcgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0SW5wdXRUeXBlKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBpbnB1dCB0eXBlLiBJbnB1dCB0eXBlIGlzIG9ubHkgcmVsZXZhbnQgaWYgdGhpcyBOb2RlJ3MgcHJpbWFyeSBzaWJsaW5nIGhhcyB0YWcgbmFtZSBcIklOUFVUXCIuXHJcbiAgICovXHJcbiAgcHVibGljIGdldElucHV0VHlwZSgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9pbnB1dFR5cGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBCeSBkZWZhdWx0IHRoZSBsYWJlbCB3aWxsIGJlIHByZXBlbmRlZCBiZWZvcmUgdGhlIHByaW1hcnkgc2libGluZyBpbiB0aGUgUERPTS4gVGhpc1xyXG4gICAqIG9wdGlvbiBhbGxvd3MgeW91IHRvIGluc3RlYWQgaGF2ZSB0aGUgbGFiZWwgYWRkZWQgYWZ0ZXIgdGhlIHByaW1hcnkgc2libGluZy4gTm90ZTogVGhlIGxhYmVsIHdpbGwgYWx3YXlzXHJcbiAgICogYmUgaW4gZnJvbnQgb2YgdGhlIGRlc2NyaXB0aW9uIHNpYmxpbmcuIElmIHRoaXMgZmxhZyBpcyBzZXQgd2l0aCBgYXBwZW5kRGVzY3JpcHRpb25gLCB0aGUgb3JkZXIgd2lsbCBiZVxyXG4gICAqXHJcbiAgICogPGNvbnRhaW5lcj5cclxuICAgKiAgIDxwcmltYXJ5IHNpYmxpbmcvPlxyXG4gICAqICAgPGxhYmVsIHNpYmxpbmcvPlxyXG4gICAqICAgPGRlc2NyaXB0aW9uIHNpYmxpbmcvPlxyXG4gICAqIDwvY29udGFpbmVyPlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRBcHBlbmRMYWJlbCggYXBwZW5kTGFiZWw6IGJvb2xlYW4gKTogdm9pZCB7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9hcHBlbmRMYWJlbCAhPT0gYXBwZW5kTGFiZWwgKSB7XHJcbiAgICAgIHRoaXMuX2FwcGVuZExhYmVsID0gYXBwZW5kTGFiZWw7XHJcblxyXG4gICAgICB0aGlzLm9uUERPTUNvbnRlbnRDaGFuZ2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgYXBwZW5kTGFiZWwoIGFwcGVuZExhYmVsOiBib29sZWFuICkgeyB0aGlzLnNldEFwcGVuZExhYmVsKCBhcHBlbmRMYWJlbCApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgYXBwZW5kTGFiZWwoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmdldEFwcGVuZExhYmVsKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHdoZXRoZXIgdGhlIGxhYmVsIHNpYmxpbmcgc2hvdWxkIGJlIGFwcGVuZGVkIGFmdGVyIHRoZSBwcmltYXJ5IHNpYmxpbmcuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEFwcGVuZExhYmVsKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2FwcGVuZExhYmVsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQnkgZGVmYXVsdCB0aGUgbGFiZWwgd2lsbCBiZSBwcmVwZW5kZWQgYmVmb3JlIHRoZSBwcmltYXJ5IHNpYmxpbmcgaW4gdGhlIFBET00uIFRoaXNcclxuICAgKiBvcHRpb24gYWxsb3dzIHlvdSB0byBpbnN0ZWFkIGhhdmUgdGhlIGxhYmVsIGFkZGVkIGFmdGVyIHRoZSBwcmltYXJ5IHNpYmxpbmcuIE5vdGU6IFRoZSBsYWJlbCB3aWxsIGFsd2F5c1xyXG4gICAqIGJlIGluIGZyb250IG9mIHRoZSBkZXNjcmlwdGlvbiBzaWJsaW5nLiBJZiB0aGlzIGZsYWcgaXMgc2V0IHdpdGggYGFwcGVuZExhYmVsYCwgdGhlIG9yZGVyIHdpbGwgYmVcclxuICAgKlxyXG4gICAqIDxjb250YWluZXI+XHJcbiAgICogICA8cHJpbWFyeSBzaWJsaW5nLz5cclxuICAgKiAgIDxsYWJlbCBzaWJsaW5nLz5cclxuICAgKiAgIDxkZXNjcmlwdGlvbiBzaWJsaW5nLz5cclxuICAgKiA8L2NvbnRhaW5lcj5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0QXBwZW5kRGVzY3JpcHRpb24oIGFwcGVuZERlc2NyaXB0aW9uOiBib29sZWFuICk6IHZvaWQge1xyXG5cclxuICAgIGlmICggdGhpcy5fYXBwZW5kRGVzY3JpcHRpb24gIT09IGFwcGVuZERlc2NyaXB0aW9uICkge1xyXG4gICAgICB0aGlzLl9hcHBlbmREZXNjcmlwdGlvbiA9IGFwcGVuZERlc2NyaXB0aW9uO1xyXG5cclxuICAgICAgdGhpcy5vblBET01Db250ZW50Q2hhbmdlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGFwcGVuZERlc2NyaXB0aW9uKCBhcHBlbmREZXNjcmlwdGlvbjogYm9vbGVhbiApIHsgdGhpcy5zZXRBcHBlbmREZXNjcmlwdGlvbiggYXBwZW5kRGVzY3JpcHRpb24gKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGFwcGVuZERlc2NyaXB0aW9uKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5nZXRBcHBlbmREZXNjcmlwdGlvbigpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB3aGV0aGVyIHRoZSBkZXNjcmlwdGlvbiBzaWJsaW5nIHNob3VsZCBiZSBhcHBlbmRlZCBhZnRlciB0aGUgcHJpbWFyeSBzaWJsaW5nLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRBcHBlbmREZXNjcmlwdGlvbigpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9hcHBlbmREZXNjcmlwdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgY29udGFpbmVyIHBhcmVudCB0YWcgbmFtZS4gQnkgc3BlY2lmeWluZyB0aGlzIGNvbnRhaW5lciBwYXJlbnQsIGFuIGVsZW1lbnQgd2lsbCBiZSBjcmVhdGVkIHRoYXRcclxuICAgKiBhY3RzIGFzIGEgY29udGFpbmVyIGZvciB0aGlzIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcgRE9NIEVsZW1lbnQgYW5kIGl0cyBsYWJlbCBhbmQgZGVzY3JpcHRpb24gc2libGluZ3MuXHJcbiAgICogVGhpcyBjb250YWluZXJUYWdOYW1lIHdpbGwgZGVmYXVsdCB0byBERUZBVUxUX0xBQkVMX1RBR19OQU1FLCBhbmQgYmUgYWRkZWQgdG8gdGhlIFBET00gYXV0b21hdGljYWxseSBpZlxyXG4gICAqIG1vcmUgdGhhbiBqdXN0IHRoZSBwcmltYXJ5IHNpYmxpbmcgaXMgY3JlYXRlZC5cclxuICAgKlxyXG4gICAqIEZvciBpbnN0YW5jZSwgYSBidXR0b24gZWxlbWVudCB3aXRoIGEgbGFiZWwgYW5kIGRlc2NyaXB0aW9uIHdpbGwgYmUgY29udGFpbmVkIGxpa2UgdGhlIGZvbGxvd2luZ1xyXG4gICAqIGlmIHRoZSBjb250YWluZXJUYWdOYW1lIGlzIHNwZWNpZmllZCBhcyAnc2VjdGlvbicuXHJcbiAgICpcclxuICAgKiA8c2VjdGlvbiBpZD0ncGFyZW50LWNvbnRhaW5lci10cmFpbC1pZCc+XHJcbiAgICogICA8YnV0dG9uPlByZXNzIG1lITwvYnV0dG9uPlxyXG4gICAqICAgPHA+QnV0dG9uIGxhYmVsPC9wPlxyXG4gICAqICAgPHA+QnV0dG9uIGRlc2NyaXB0aW9uPC9wPlxyXG4gICAqIDwvc2VjdGlvbj5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q29udGFpbmVyVGFnTmFtZSggdGFnTmFtZTogc3RyaW5nIHwgbnVsbCApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRhZ05hbWUgPT09IG51bGwgfHwgdHlwZW9mIHRhZ05hbWUgPT09ICdzdHJpbmcnLCBgaW52YWxpZCB0YWdOYW1lIGFyZ3VtZW50OiAke3RhZ05hbWV9YCApO1xyXG5cclxuICAgIGlmICggdGhpcy5fY29udGFpbmVyVGFnTmFtZSAhPT0gdGFnTmFtZSApIHtcclxuICAgICAgdGhpcy5fY29udGFpbmVyVGFnTmFtZSA9IHRhZ05hbWU7XHJcbiAgICAgIHRoaXMub25QRE9NQ29udGVudENoYW5nZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBjb250YWluZXJUYWdOYW1lKCB0YWdOYW1lOiBzdHJpbmcgfCBudWxsICkgeyB0aGlzLnNldENvbnRhaW5lclRhZ05hbWUoIHRhZ05hbWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGNvbnRhaW5lclRhZ05hbWUoKTogc3RyaW5nIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldENvbnRhaW5lclRhZ05hbWUoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHRhZyBuYW1lIGZvciB0aGUgY29udGFpbmVyIHBhcmVudCBlbGVtZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDb250YWluZXJUYWdOYW1lKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnRhaW5lclRhZ05hbWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGNvbnRlbnQgb2YgdGhlIGxhYmVsIHNpYmxpbmcgZm9yIHRoZSB0aGlzIG5vZGUuICBUaGUgbGFiZWwgc2libGluZyB3aWxsIGRlZmF1bHQgdG8gdGhlIHZhbHVlIG9mXHJcbiAgICogREVGQVVMVF9MQUJFTF9UQUdfTkFNRSBpZiBubyBgbGFiZWxUYWdOYW1lYCBpcyBwcm92aWRlZC4gSWYgdGhlIGxhYmVsIHNpYmxpbmcgaXMgYSBgTEFCRUxgIGh0bWwgZWxlbWVudCxcclxuICAgKiB0aGVuIHRoZSBgZm9yYCBhdHRyaWJ1dGUgd2lsbCBhdXRvbWF0aWNhbGx5IGJlIGFkZGVkLCBwb2ludGluZyB0byB0aGUgTm9kZSdzIHByaW1hcnkgc2libGluZy5cclxuICAgKlxyXG4gICAqIFRoaXMgbWV0aG9kIHN1cHBvcnRzIGFkZGluZyBjb250ZW50IGluIHR3byB3YXlzLCB3aXRoIEhUTUxFbGVtZW50LnRleHRDb250ZW50IGFuZCBIVE1MRWxlbWVudC5pbm5lckhUTUwuXHJcbiAgICogVGhlIERPTSBzZXR0ZXIgaXMgY2hvc2VuIGJhc2VkIG9uIGlmIHRoZSBsYWJlbCBwYXNzZXMgdGhlIGBjb250YWluc0Zvcm1hdHRpbmdUYWdzYC5cclxuICAgKlxyXG4gICAqIFBhc3NpbmcgYSBudWxsIGxhYmVsIHZhbHVlIHdpbGwgbm90IGNsZWFyIHRoZSB3aG9sZSBsYWJlbCBzaWJsaW5nLCBqdXN0IHRoZSBpbm5lciBjb250ZW50IG9mIHRoZSBET00gRWxlbWVudC5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0TGFiZWxDb250ZW50KCBwcm92aWRlZExhYmVsOiBQRE9NVmFsdWVUeXBlIHwgbnVsbCApOiB2b2lkIHtcclxuICAgIC8vIElmIGl0J3MgYSBQcm9wZXJ0eSwgd2UnbGwganVzdCBncmFiIHRoZSBpbml0aWFsIHZhbHVlLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE0NDJcclxuICAgIGNvbnN0IGxhYmVsID0gdW53cmFwUHJvcGVydHkoIHByb3ZpZGVkTGFiZWwgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX2xhYmVsQ29udGVudCAhPT0gbGFiZWwgKSB7XHJcbiAgICAgIHRoaXMuX2xhYmVsQ29udGVudCA9IGxhYmVsO1xyXG5cclxuICAgICAgLy8gaWYgdHJ5aW5nIHRvIHNldCBsYWJlbENvbnRlbnQsIG1ha2Ugc3VyZSB0aGF0IHRoZXJlIGlzIGEgbGFiZWxUYWdOYW1lIGRlZmF1bHRcclxuICAgICAgaWYgKCAhdGhpcy5fbGFiZWxUYWdOYW1lICkge1xyXG4gICAgICAgIHRoaXMuc2V0TGFiZWxUYWdOYW1lKCBERUZBVUxUX0xBQkVMX1RBR19OQU1FICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX3Bkb21JbnN0YW5jZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgcGVlciA9IHRoaXMuX3Bkb21JbnN0YW5jZXNbIGkgXS5wZWVyITtcclxuICAgICAgICBwZWVyLnNldExhYmVsU2libGluZ0NvbnRlbnQoIHRoaXMuX2xhYmVsQ29udGVudCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGxhYmVsQ29udGVudCggbGFiZWw6IFBET01WYWx1ZVR5cGUgfCBudWxsICkgeyB0aGlzLnNldExhYmVsQ29udGVudCggbGFiZWwgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGxhYmVsQ29udGVudCgpOiBzdHJpbmcgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0TGFiZWxDb250ZW50KCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBjb250ZW50IGZvciB0aGlzIE5vZGUncyBsYWJlbCBzaWJsaW5nIERPTSBlbGVtZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRMYWJlbENvbnRlbnQoKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fbGFiZWxDb250ZW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBpbm5lciBjb250ZW50IGZvciB0aGUgcHJpbWFyeSBzaWJsaW5nIG9mIHRoZSBQRE9NUGVlcnMgb2YgdGhpcyBOb2RlLiBXaWxsIGJlIHNldCBhcyB0ZXh0Q29udGVudFxyXG4gICAqIHVubGVzcyBjb250ZW50IGlzIGh0bWwgd2hpY2ggdXNlcyBleGNsdXNpdmVseSBmb3JtYXR0aW5nIHRhZ3MuIEEgbm9kZSB3aXRoIGlubmVyIGNvbnRlbnQgY2Fubm90XHJcbiAgICogaGF2ZSBhY2Nlc3NpYmxlIGRlc2NlbmRhbnRzIGJlY2F1c2UgdGhpcyBjb250ZW50IHdpbGwgb3ZlcnJpZGUgdGhlIEhUTUwgb2YgZGVzY2VuZGFudHMgb2YgdGhpcyBub2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRJbm5lckNvbnRlbnQoIHByb3ZpZGVkQ29udGVudDogUERPTVZhbHVlVHlwZSB8IG51bGwgKTogdm9pZCB7XHJcbiAgICB0aGlzLl9pbm5lckNvbnRlbnRQcm9wZXJ0eS5zZXRWYWx1ZU9yVGFyZ2V0UHJvcGVydHkoIHRoaXMsIG51bGwsIHByb3ZpZGVkQ29udGVudCApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBpbm5lckNvbnRlbnQoIGNvbnRlbnQ6IFBET01WYWx1ZVR5cGUgfCBudWxsICkgeyB0aGlzLnNldElubmVyQ29udGVudCggY29udGVudCApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgaW5uZXJDb250ZW50KCk6IHN0cmluZyB8IG51bGwgeyByZXR1cm4gdGhpcy5nZXRJbm5lckNvbnRlbnQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGlubmVyIGNvbnRlbnQsIHRoZSBzdHJpbmcgdGhhdCBpcyB0aGUgaW5uZXJIVE1MIG9yIGlubmVyVGV4dCBmb3IgdGhlIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcuXHJcbiAgICovXHJcbiAgcHVibGljIGdldElubmVyQ29udGVudCgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9pbm5lckNvbnRlbnRQcm9wZXJ0eS52YWx1ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25Jbm5lckNvbnRlbnRQcm9wZXJ0eUNoYW5nZSggdmFsdWU6IHN0cmluZyB8IG51bGwgKTogdm9pZCB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9wZG9tSW5zdGFuY2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBwZWVyID0gdGhpcy5fcGRvbUluc3RhbmNlc1sgaSBdLnBlZXIhO1xyXG4gICAgICBwZWVyLnNldFByaW1hcnlTaWJsaW5nQ29udGVudCggdmFsdWUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgZGVzY3JpcHRpb24gY29udGVudCBmb3IgdGhpcyBOb2RlJ3MgcHJpbWFyeSBzaWJsaW5nLiBUaGUgZGVzY3JpcHRpb24gc2libGluZyB0YWcgbmFtZSBtdXN0IHN1cHBvcnRcclxuICAgKiBpbm5lckhUTUwgYW5kIHRleHRDb250ZW50LiBJZiBhIGRlc2NyaXB0aW9uIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QgeWV0LCBhIGRlZmF1bHRcclxuICAgKiBERUZBVUxUX0xBQkVMX1RBR19OQU1FIHdpbGwgYmUgYXNzaWduZWQgdG8gdGhlIGRlc2NyaXB0aW9uVGFnTmFtZS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0RGVzY3JpcHRpb25Db250ZW50KCBwcm92aWRlZERlc2NyaXB0aW9uQ29udGVudDogUERPTVZhbHVlVHlwZSB8IG51bGwgKTogdm9pZCB7XHJcbiAgICAvLyBJZiBpdCdzIGEgUHJvcGVydHksIHdlJ2xsIGp1c3QgZ3JhYiB0aGUgaW5pdGlhbCB2YWx1ZS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNDQyXHJcbiAgICBjb25zdCBkZXNjcmlwdGlvbkNvbnRlbnQgPSB1bndyYXBQcm9wZXJ0eSggcHJvdmlkZWREZXNjcmlwdGlvbkNvbnRlbnQgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX2Rlc2NyaXB0aW9uQ29udGVudCAhPT0gZGVzY3JpcHRpb25Db250ZW50ICkge1xyXG4gICAgICB0aGlzLl9kZXNjcmlwdGlvbkNvbnRlbnQgPSBkZXNjcmlwdGlvbkNvbnRlbnQ7XHJcblxyXG4gICAgICAvLyBpZiB0aGVyZSBpcyBubyBkZXNjcmlwdGlvbiBlbGVtZW50LCBhc3N1bWUgdGhhdCBhIHBhcmFncmFwaCBlbGVtZW50IHNob3VsZCBiZSB1c2VkXHJcbiAgICAgIGlmICggIXRoaXMuX2Rlc2NyaXB0aW9uVGFnTmFtZSApIHtcclxuICAgICAgICB0aGlzLnNldERlc2NyaXB0aW9uVGFnTmFtZSggREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9wZG9tSW5zdGFuY2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLl9wZG9tSW5zdGFuY2VzWyBpIF0ucGVlciE7XHJcbiAgICAgICAgcGVlci5zZXREZXNjcmlwdGlvblNpYmxpbmdDb250ZW50KCB0aGlzLl9kZXNjcmlwdGlvbkNvbnRlbnQgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBkZXNjcmlwdGlvbkNvbnRlbnQoIHRleHRDb250ZW50OiBQRE9NVmFsdWVUeXBlIHwgbnVsbCApIHsgdGhpcy5zZXREZXNjcmlwdGlvbkNvbnRlbnQoIHRleHRDb250ZW50ICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBkZXNjcmlwdGlvbkNvbnRlbnQoKTogc3RyaW5nIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldERlc2NyaXB0aW9uQ29udGVudCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgY29udGVudCBmb3IgdGhpcyBOb2RlJ3MgZGVzY3JpcHRpb24gc2libGluZyBET00gRWxlbWVudC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0RGVzY3JpcHRpb25Db250ZW50KCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX2Rlc2NyaXB0aW9uQ29udGVudDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgQVJJQSByb2xlIGZvciB0aGlzIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcuIEFjY29yZGluZyB0byB0aGUgVzNDLCB0aGUgQVJJQSByb2xlIGlzIHJlYWQtb25seSBmb3IgYSBET01cclxuICAgKiBlbGVtZW50LiAgU28gdGhpcyB3aWxsIGNyZWF0ZSBhIG5ldyBET00gZWxlbWVudCBmb3IgdGhpcyBOb2RlIHdpdGggdGhlIGRlc2lyZWQgcm9sZSwgYW5kIHJlcGxhY2UgdGhlIG9sZFxyXG4gICAqIGVsZW1lbnQgaW4gdGhlIERPTS4gTm90ZSB0aGF0IHRoZSBhcmlhIHJvbGUgY2FuIGNvbXBsZXRlbHkgY2hhbmdlIHRoZSBldmVudHMgdGhhdCBmaXJlIGZyb20gYW4gZWxlbWVudCxcclxuICAgKiBlc3BlY2lhbGx5IHdoZW4gdXNpbmcgYSBzY3JlZW4gcmVhZGVyLiBGb3IgZXhhbXBsZSwgYSByb2xlIG9mIGBhcHBsaWNhdGlvbmAgd2lsbCBsYXJnZWx5IGJ5cGFzcyB0aGUgZGVmYXVsdFxyXG4gICAqIGJlaGF2aW9yIGFuZCBsb2dpYyBvZiB0aGUgc2NyZWVuIHJlYWRlciwgdHJpZ2dlcmluZyBrZXlkb3duL2tleXVwIGV2ZW50cyBldmVuIGZvciBidXR0b25zIHRoYXQgd291bGQgdXN1YWxseVxyXG4gICAqIG9ubHkgcmVjZWl2ZSBhIFwiY2xpY2tcIiBldmVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBhcmlhUm9sZSAtIHJvbGUgZm9yIHRoZSBlbGVtZW50LCBzZWVcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbC1hcmlhLyNhbGxvd2VkLWFyaWEtcm9sZXMtc3RhdGVzLWFuZC1wcm9wZXJ0aWVzXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGEgbGlzdCBvZiByb2xlcywgc3RhdGVzLCBhbmQgcHJvcGVydGllcy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0QXJpYVJvbGUoIGFyaWFSb2xlOiBzdHJpbmcgfCBudWxsICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYXJpYVJvbGUgPT09IG51bGwgfHwgdHlwZW9mIGFyaWFSb2xlID09PSAnc3RyaW5nJyApO1xyXG5cclxuICAgIGlmICggdGhpcy5fYXJpYVJvbGUgIT09IGFyaWFSb2xlICkge1xyXG5cclxuICAgICAgdGhpcy5fYXJpYVJvbGUgPSBhcmlhUm9sZTtcclxuXHJcbiAgICAgIGlmICggYXJpYVJvbGUgIT09IG51bGwgKSB7XHJcbiAgICAgICAgdGhpcy5zZXRQRE9NQXR0cmlidXRlKCAncm9sZScsIGFyaWFSb2xlICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVQRE9NQXR0cmlidXRlKCAncm9sZScgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBhcmlhUm9sZSggYXJpYVJvbGU6IHN0cmluZyB8IG51bGwgKSB7IHRoaXMuc2V0QXJpYVJvbGUoIGFyaWFSb2xlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBhcmlhUm9sZSgpOiBzdHJpbmcgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0QXJpYVJvbGUoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIEFSSUEgcm9sZSByZXByZXNlbnRpbmcgdGhpcyBub2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRBcmlhUm9sZSgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9hcmlhUm9sZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgQVJJQSByb2xlIGZvciB0aGlzIG5vZGUncyBjb250YWluZXIgcGFyZW50IGVsZW1lbnQuICBBY2NvcmRpbmcgdG8gdGhlIFczQywgdGhlIEFSSUEgcm9sZSBpcyByZWFkLW9ubHlcclxuICAgKiBmb3IgYSBET00gZWxlbWVudC4gVGhpcyB3aWxsIGNyZWF0ZSBhIG5ldyBET00gZWxlbWVudCBmb3IgdGhlIGNvbnRhaW5lciBwYXJlbnQgd2l0aCB0aGUgZGVzaXJlZCByb2xlLCBhbmRcclxuICAgKiByZXBsYWNlIGl0IGluIHRoZSBET00uXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYXJpYVJvbGUgLSByb2xlIGZvciB0aGUgZWxlbWVudCwgc2VlXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWwtYXJpYS8jYWxsb3dlZC1hcmlhLXJvbGVzLXN0YXRlcy1hbmQtcHJvcGVydGllc1xyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBhIGxpc3Qgb2Ygcm9sZXMsIHN0YXRlcywgYW5kIHByb3BlcnRpZXMuXHJcbiAgICovXHJcbiAgcHVibGljIHNldENvbnRhaW5lckFyaWFSb2xlKCBhcmlhUm9sZTogc3RyaW5nIHwgbnVsbCApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFyaWFSb2xlID09PSBudWxsIHx8IHR5cGVvZiBhcmlhUm9sZSA9PT0gJ3N0cmluZycgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX2NvbnRhaW5lckFyaWFSb2xlICE9PSBhcmlhUm9sZSApIHtcclxuXHJcbiAgICAgIHRoaXMuX2NvbnRhaW5lckFyaWFSb2xlID0gYXJpYVJvbGU7XHJcblxyXG4gICAgICAvLyBjbGVhciBvdXQgdGhlIGF0dHJpYnV0ZVxyXG4gICAgICBpZiAoIGFyaWFSb2xlID09PSBudWxsICkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlUERPTUF0dHJpYnV0ZSggJ3JvbGUnLCB7XHJcbiAgICAgICAgICBlbGVtZW50TmFtZTogUERPTVBlZXIuQ09OVEFJTkVSX1BBUkVOVFxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gYWRkIHRoZSBhdHRyaWJ1dGVcclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zZXRQRE9NQXR0cmlidXRlKCAncm9sZScsIGFyaWFSb2xlLCB7XHJcbiAgICAgICAgICBlbGVtZW50TmFtZTogUERPTVBlZXIuQ09OVEFJTkVSX1BBUkVOVFxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBjb250YWluZXJBcmlhUm9sZSggYXJpYVJvbGU6IHN0cmluZyB8IG51bGwgKSB7IHRoaXMuc2V0Q29udGFpbmVyQXJpYVJvbGUoIGFyaWFSb2xlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBjb250YWluZXJBcmlhUm9sZSgpOiBzdHJpbmcgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0Q29udGFpbmVyQXJpYVJvbGUoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIEFSSUEgcm9sZSBhc3NpZ25lZCB0byB0aGUgY29udGFpbmVyIHBhcmVudCBlbGVtZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDb250YWluZXJBcmlhUm9sZSgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9jb250YWluZXJBcmlhUm9sZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgYXJpYS12YWx1ZXRleHQgb2YgdGhpcyBOb2RlIGluZGVwZW5kZW50bHkgZnJvbSB0aGUgY2hhbmdpbmcgdmFsdWUsIGlmIG5lY2Vzc2FyeS4gU2V0dGluZyB0byBudWxsIHdpbGxcclxuICAgKiBjbGVhciB0aGlzIGF0dHJpYnV0ZS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0QXJpYVZhbHVlVGV4dCggcHJvdmlkZWRBcmlhVmFsdWVUZXh0OiBQRE9NVmFsdWVUeXBlIHwgbnVsbCApOiB2b2lkIHtcclxuICAgIC8vIElmIGl0J3MgYSBQcm9wZXJ0eSwgd2UnbGwganVzdCBncmFiIHRoZSBpbml0aWFsIHZhbHVlLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE0NDJcclxuICAgIGNvbnN0IGFyaWFWYWx1ZVRleHQgPSB1bndyYXBQcm9wZXJ0eSggcHJvdmlkZWRBcmlhVmFsdWVUZXh0ICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9hcmlhVmFsdWVUZXh0ICE9PSBhcmlhVmFsdWVUZXh0ICkge1xyXG4gICAgICB0aGlzLl9hcmlhVmFsdWVUZXh0ID0gYXJpYVZhbHVlVGV4dDtcclxuXHJcbiAgICAgIGlmICggYXJpYVZhbHVlVGV4dCA9PT0gbnVsbCApIHtcclxuICAgICAgICB0aGlzLnJlbW92ZVBET01BdHRyaWJ1dGUoICdhcmlhLXZhbHVldGV4dCcgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLnNldFBET01BdHRyaWJ1dGUoICdhcmlhLXZhbHVldGV4dCcsIGFyaWFWYWx1ZVRleHQgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBhcmlhVmFsdWVUZXh0KCBhcmlhVmFsdWVUZXh0OiBQRE9NVmFsdWVUeXBlIHwgbnVsbCApIHsgdGhpcy5zZXRBcmlhVmFsdWVUZXh0KCBhcmlhVmFsdWVUZXh0ICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBhcmlhVmFsdWVUZXh0KCk6IHN0cmluZyB8IG51bGwgeyByZXR1cm4gdGhpcy5nZXRBcmlhVmFsdWVUZXh0KCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSB2YWx1ZSBvZiB0aGUgYXJpYS12YWx1ZXRleHQgYXR0cmlidXRlIGZvciB0aGlzIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcuIElmIG51bGwsIHRoZW4gdGhlIGF0dHJpYnV0ZVxyXG4gICAqIGhhcyBub3QgYmVlbiBzZXQgb24gdGhlIHByaW1hcnkgc2libGluZy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0QXJpYVZhbHVlVGV4dCgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9hcmlhVmFsdWVUZXh0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgbmFtZXNwYWNlIGZvciB0aGUgcHJpbWFyeSBlbGVtZW50IChyZWxldmFudCBmb3IgTWF0aE1ML1NWRy9ldGMuKVxyXG4gICAqXHJcbiAgICogRm9yIGV4YW1wbGUsIHRvIGNyZWF0ZSBhIE1hdGhNTCBlbGVtZW50OlxyXG4gICAqIHsgdGFnTmFtZTogJ21hdGgnLCBwZG9tTmFtZXNwYWNlOiAnaHR0cDovL3d3dy53My5vcmcvMTk5OC9NYXRoL01hdGhNTCcgfVxyXG4gICAqXHJcbiAgICogb3IgZm9yIFNWRzpcclxuICAgKiB7IHRhZ05hbWU6ICdzdmcnLCBwZG9tTmFtZXNwYWNlOiAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIH1cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwZG9tTmFtZXNwYWNlIC0gTnVsbCBpbmRpY2F0ZXMgbm8gbmFtZXNwYWNlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRQRE9NTmFtZXNwYWNlKCBwZG9tTmFtZXNwYWNlOiBzdHJpbmcgfCBudWxsICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcGRvbU5hbWVzcGFjZSA9PT0gbnVsbCB8fCB0eXBlb2YgcGRvbU5hbWVzcGFjZSA9PT0gJ3N0cmluZycgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX3Bkb21OYW1lc3BhY2UgIT09IHBkb21OYW1lc3BhY2UgKSB7XHJcbiAgICAgIHRoaXMuX3Bkb21OYW1lc3BhY2UgPSBwZG9tTmFtZXNwYWNlO1xyXG5cclxuICAgICAgLy8gSWYgdGhlIG5hbWVzcGFjZSBjaGFuZ2VzLCB0ZWFyIGRvd24gdGhlIHZpZXcgYW5kIHJlZHJhdyB0aGUgd2hvbGUgdGhpbmcsIHRoZXJlIGlzIG5vIGVhc3kgbXV0YWJsZSBzb2x1dGlvbiBoZXJlLlxyXG4gICAgICB0aGlzLm9uUERPTUNvbnRlbnRDaGFuZ2UoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgcGRvbU5hbWVzcGFjZSggdmFsdWU6IHN0cmluZyB8IG51bGwgKSB7IHRoaXMuc2V0UERPTU5hbWVzcGFjZSggdmFsdWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHBkb21OYW1lc3BhY2UoKTogc3RyaW5nIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldFBET01OYW1lc3BhY2UoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBhY2Nlc3NpYmxlIG5hbWVzcGFjZSAoc2VlIHNldFBET01OYW1lc3BhY2UgZm9yIG1vcmUgaW5mb3JtYXRpb24pLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRQRE9NTmFtZXNwYWNlKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX3Bkb21OYW1lc3BhY2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSAnYXJpYS1sYWJlbCcgYXR0cmlidXRlIGZvciBsYWJlbGxpbmcgdGhlIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcuIEJ5IHVzaW5nIHRoZVxyXG4gICAqICdhcmlhLWxhYmVsJyBhdHRyaWJ1dGUsIHRoZSBsYWJlbCB3aWxsIGJlIHJlYWQgb24gZm9jdXMsIGJ1dCBjYW4gbm90IGJlIGZvdW5kIHdpdGggdGhlXHJcbiAgICogdmlydHVhbCBjdXJzb3IuIFRoaXMgaXMgb25lIHdheSB0byBzZXQgYSBET00gRWxlbWVudCdzIEFjY2Vzc2libGUgTmFtZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwcm92aWRlZEFyaWFMYWJlbCAtIHRoZSB0ZXh0IGZvciB0aGUgYXJpYSBsYWJlbCBhdHRyaWJ1dGVcclxuICAgKi9cclxuICBwdWJsaWMgc2V0QXJpYUxhYmVsKCBwcm92aWRlZEFyaWFMYWJlbDogUERPTVZhbHVlVHlwZSB8IG51bGwgKTogdm9pZCB7XHJcbiAgICAvLyBJZiBpdCdzIGEgUHJvcGVydHksIHdlJ2xsIGp1c3QgZ3JhYiB0aGUgaW5pdGlhbCB2YWx1ZS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNDQyXHJcbiAgICBjb25zdCBhcmlhTGFiZWwgPSB1bndyYXBQcm9wZXJ0eSggcHJvdmlkZWRBcmlhTGFiZWwgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX2FyaWFMYWJlbCAhPT0gYXJpYUxhYmVsICkge1xyXG4gICAgICB0aGlzLl9hcmlhTGFiZWwgPSBhcmlhTGFiZWw7XHJcblxyXG4gICAgICBpZiAoIGFyaWFMYWJlbCA9PT0gbnVsbCApIHtcclxuICAgICAgICB0aGlzLnJlbW92ZVBET01BdHRyaWJ1dGUoICdhcmlhLWxhYmVsJyApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2V0UERPTUF0dHJpYnV0ZSggJ2FyaWEtbGFiZWwnLCBhcmlhTGFiZWwgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBhcmlhTGFiZWwoIGFyaWFMYWJlbDogUERPTVZhbHVlVHlwZSB8IG51bGwgKSB7IHRoaXMuc2V0QXJpYUxhYmVsKCBhcmlhTGFiZWwgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGFyaWFMYWJlbCgpOiBzdHJpbmcgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0QXJpYUxhYmVsKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSB2YWx1ZSBvZiB0aGUgYXJpYS1sYWJlbCBhdHRyaWJ1dGUgZm9yIHRoaXMgTm9kZSdzIHByaW1hcnkgc2libGluZy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0QXJpYUxhYmVsKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX2FyaWFMYWJlbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgZm9jdXMgaGlnaGxpZ2h0IGZvciB0aGlzIG5vZGUuIEJ5IGRlZmF1bHQsIHRoZSBmb2N1cyBoaWdobGlnaHQgd2lsbCBiZSBhIHBpbmsgcmVjdGFuZ2xlIHRoYXRcclxuICAgKiBzdXJyb3VuZHMgdGhlIG5vZGUncyBsb2NhbCBib3VuZHMuICBJZiBmb2N1cyBoaWdobGlnaHQgaXMgc2V0IHRvICdpbnZpc2libGUnLCB0aGUgbm9kZSB3aWxsIG5vdCBoYXZlXHJcbiAgICogYW55IGhpZ2hsaWdodGluZyB3aGVuIGl0IHJlY2VpdmVzIGZvY3VzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRGb2N1c0hpZ2hsaWdodCggZm9jdXNIaWdobGlnaHQ6IEhpZ2hsaWdodCApOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5fZm9jdXNIaWdobGlnaHQgIT09IGZvY3VzSGlnaGxpZ2h0ICkge1xyXG4gICAgICB0aGlzLl9mb2N1c0hpZ2hsaWdodCA9IGZvY3VzSGlnaGxpZ2h0O1xyXG5cclxuICAgICAgLy8gaWYgdGhlIGZvY3VzIGhpZ2hsaWdodCBpcyBsYXllcmFibGUgaW4gdGhlIHNjZW5lIGdyYXBoLCB1cGRhdGUgdmlzaWJpbGl0eSBzbyB0aGF0IGl0IGlzIG9ubHlcclxuICAgICAgLy8gdmlzaWJsZSB3aGVuIGFzc29jaWF0ZWQgbm9kZSBoYXMgZm9jdXNcclxuICAgICAgaWYgKCB0aGlzLl9mb2N1c0hpZ2hsaWdodExheWVyYWJsZSApIHtcclxuXHJcbiAgICAgICAgLy8gaWYgZm9jdXMgaGlnaGxpZ2h0IGlzIGxheWVyYWJsZSwgaXQgbXVzdCBiZSBhIG5vZGUgaW4gdGhlIHNjZW5lIGdyYXBoXHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZm9jdXNIaWdobGlnaHQgaW5zdGFuY2VvZiBOb2RlICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2ltcGxlLXR5cGUtY2hlY2tpbmctYXNzZXJ0aW9uc1xyXG5cclxuICAgICAgICAvLyB0aGUgaGlnaGxpZ2h0IHN0YXJ0cyBvZmYgaW52aXNpYmxlLCBIaWdobGlnaHRPdmVybGF5IHdpbGwgbWFrZSBpdCB2aXNpYmxlIHdoZW4gdGhpcyBOb2RlIGhhcyBET00gZm9jdXNcclxuICAgICAgICAoIGZvY3VzSGlnaGxpZ2h0IGFzIE5vZGUgKS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuZm9jdXNIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGZvY3VzSGlnaGxpZ2h0KCBmb2N1c0hpZ2hsaWdodDogSGlnaGxpZ2h0ICkgeyB0aGlzLnNldEZvY3VzSGlnaGxpZ2h0KCBmb2N1c0hpZ2hsaWdodCApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZm9jdXNIaWdobGlnaHQoKTogSGlnaGxpZ2h0IHsgcmV0dXJuIHRoaXMuZ2V0Rm9jdXNIaWdobGlnaHQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGZvY3VzIGhpZ2hsaWdodCBmb3IgdGhpcyBub2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRGb2N1c0hpZ2hsaWdodCgpOiBIaWdobGlnaHQge1xyXG4gICAgcmV0dXJuIHRoaXMuX2ZvY3VzSGlnaGxpZ2h0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0dGluZyBhIGZsYWcgdG8gYnJlYWsgZGVmYXVsdCBhbmQgYWxsb3cgdGhlIGZvY3VzIGhpZ2hsaWdodCB0byBiZSAoeikgbGF5ZXJlZCBpbnRvIHRoZSBzY2VuZSBncmFwaC5cclxuICAgKiBUaGlzIHdpbGwgc2V0IHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBsYXllcmVkIGZvY3VzIGhpZ2hsaWdodCwgaXQgd2lsbCBhbHdheXMgYmUgaW52aXNpYmxlIHVudGlsIHRoaXMgbm9kZSBoYXNcclxuICAgKiBmb2N1cy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0Rm9jdXNIaWdobGlnaHRMYXllcmFibGUoIGZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlOiBib29sZWFuICk6IHZvaWQge1xyXG5cclxuICAgIGlmICggdGhpcy5fZm9jdXNIaWdobGlnaHRMYXllcmFibGUgIT09IGZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlICkge1xyXG4gICAgICB0aGlzLl9mb2N1c0hpZ2hsaWdodExheWVyYWJsZSA9IGZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlO1xyXG5cclxuICAgICAgLy8gaWYgYSBmb2N1cyBoaWdobGlnaHQgaXMgZGVmaW5lZCAoaXQgbXVzdCBiZSBhIG5vZGUpLCB1cGRhdGUgaXRzIHZpc2liaWxpdHkgc28gaXQgaXMgbGlua2VkIHRvIGZvY3VzXHJcbiAgICAgIC8vIG9mIHRoZSBhc3NvY2lhdGVkIG5vZGVcclxuICAgICAgaWYgKCB0aGlzLl9mb2N1c0hpZ2hsaWdodCApIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9mb2N1c0hpZ2hsaWdodCBpbnN0YW5jZW9mIE5vZGUgKTtcclxuICAgICAgICAoIHRoaXMuX2ZvY3VzSGlnaGxpZ2h0IGFzIE5vZGUgKS52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIGVtaXQgdGhhdCB0aGUgaGlnaGxpZ2h0IGhhcyBjaGFuZ2VkIGFuZCB3ZSBtYXkgbmVlZCB0byB1cGRhdGUgaXRzIHZpc3VhbCByZXByZXNlbnRhdGlvblxyXG4gICAgICAgIHRoaXMuZm9jdXNIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgZm9jdXNIaWdobGlnaHRMYXllcmFibGUoIGZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlOiBib29sZWFuICkgeyB0aGlzLnNldEZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlKCBmb2N1c0hpZ2hsaWdodExheWVyYWJsZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZm9jdXNIaWdobGlnaHRMYXllcmFibGUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmdldEZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBmbGFnIGZvciBpZiB0aGlzIG5vZGUgaXMgbGF5ZXJhYmxlIGluIHRoZSBzY2VuZSBncmFwaCAob3IgaWYgaXQgaXMgYWx3YXlzIG9uIHRvcCwgbGlrZSB0aGUgZGVmYXVsdCkuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2ZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHdoZXRoZXIgb3Igbm90IHRoaXMgbm9kZSBoYXMgYSBncm91cCBmb2N1cyBoaWdobGlnaHQuIElmIHRoaXMgbm9kZSBoYXMgYSBncm91cCBmb2N1cyBoaWdobGlnaHQsIGFuIGV4dHJhXHJcbiAgICogZm9jdXMgaGlnaGxpZ2h0IHdpbGwgc3Vycm91bmQgdGhpcyBub2RlIHdoZW5ldmVyIGEgZGVzY2VuZGFudCBub2RlIGhhcyBmb2N1cy4gR2VuZXJhbGx5XHJcbiAgICogdXNlZnVsIHRvIGluZGljYXRlIG5lc3RlZCBrZXlib2FyZCBuYXZpZ2F0aW9uLiBJZiB0cnVlLCB0aGUgZ3JvdXAgZm9jdXMgaGlnaGxpZ2h0IHdpbGwgc3Vycm91bmRcclxuICAgKiB0aGlzIG5vZGUncyBsb2NhbCBib3VuZHMuIE90aGVyd2lzZSwgdGhlIE5vZGUgd2lsbCBiZSB1c2VkLlxyXG4gICAqXHJcbiAgICogVE9ETzogU3VwcG9ydCBtb3JlIHRoYW4gb25lIGdyb3VwIGZvY3VzIGhpZ2hsaWdodCAobXVsdGlwbGUgYW5jZXN0b3JzIGNvdWxkIGhhdmUgZ3JvdXBGb2N1c0hpZ2hsaWdodCksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNzA4XHJcbiAgICovXHJcbiAgcHVibGljIHNldEdyb3VwRm9jdXNIaWdobGlnaHQoIGdyb3VwSGlnaGxpZ2h0OiBOb2RlIHwgYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIHRoaXMuX2dyb3VwRm9jdXNIaWdobGlnaHQgPSBncm91cEhpZ2hsaWdodDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgZ3JvdXBGb2N1c0hpZ2hsaWdodCggZ3JvdXBIaWdobGlnaHQ6IE5vZGUgfCBib29sZWFuICkgeyB0aGlzLnNldEdyb3VwRm9jdXNIaWdobGlnaHQoIGdyb3VwSGlnaGxpZ2h0ICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBncm91cEZvY3VzSGlnaGxpZ2h0KCk6IE5vZGUgfCBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0R3JvdXBGb2N1c0hpZ2hsaWdodCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB3aGV0aGVyIG9yIG5vdCB0aGlzIG5vZGUgaGFzIGEgJ2dyb3VwJyBmb2N1cyBoaWdobGlnaHQsIHNlZSBzZXR0ZXIgZm9yIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIGdldEdyb3VwRm9jdXNIaWdobGlnaHQoKTogTm9kZSB8IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2dyb3VwRm9jdXNIaWdobGlnaHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBWZXJ5IHNpbWlsYXIgYWxnb3JpdGhtIHRvIHNldENoaWxkcmVuIGluIE5vZGUuanNcclxuICAgKiBAcGFyYW0gYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnMgLSBsaXN0IG9mIGFzc29jaWF0aW9uT2JqZWN0cywgc2VlIHRoaXMuX2FyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucyggYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnM6IEFzc29jaWF0aW9uW10gKTogdm9pZCB7XHJcbiAgICBsZXQgYXNzb2NpYXRpb25PYmplY3Q7XHJcbiAgICBsZXQgaTtcclxuXHJcbiAgICAvLyB2YWxpZGF0aW9uIGlmIGFzc2VydCBpcyBlbmFibGVkXHJcbiAgICBpZiAoIGFzc2VydCApIHtcclxuICAgICAgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucyApICk7XHJcbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgYXNzb2NpYXRpb25PYmplY3QgPSBhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uc1sgaSBdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbm8gd29yayB0byBiZSBkb25lIGlmIGJvdGggYXJlIGVtcHR5LCByZXR1cm4gZWFybHlcclxuICAgIGlmICggYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnMubGVuZ3RoID09PSAwICYmIHRoaXMuX2FyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJlZm9yZU9ubHk6IEFzc29jaWF0aW9uW10gPSBbXTsgLy8gV2lsbCBob2xkIGFsbCBub2RlcyB0aGF0IHdpbGwgYmUgcmVtb3ZlZC5cclxuICAgIGNvbnN0IGFmdGVyT25seTogQXNzb2NpYXRpb25bXSA9IFtdOyAvLyBXaWxsIGhvbGQgYWxsIG5vZGVzIHRoYXQgd2lsbCBiZSBcIm5ld1wiIGNoaWxkcmVuIChhZGRlZClcclxuICAgIGNvbnN0IGluQm90aDogQXNzb2NpYXRpb25bXSA9IFtdOyAvLyBDaGlsZCBub2RlcyB0aGF0IFwic3RheVwiLiBXaWxsIGJlIG9yZGVyZWQgZm9yIHRoZSBcImFmdGVyXCIgY2FzZS5cclxuXHJcbiAgICAvLyBnZXQgYSBkaWZmZXJlbmNlIG9mIHRoZSBkZXNpcmVkIG5ldyBsaXN0LCBhbmQgdGhlIG9sZFxyXG4gICAgYXJyYXlEaWZmZXJlbmNlKCBhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucywgdGhpcy5fYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnMsIGFmdGVyT25seSwgYmVmb3JlT25seSwgaW5Cb3RoICk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGVhY2ggY3VycmVudCBhc3NvY2lhdGlvbk9iamVjdCB0aGF0IGlzbid0IGluIHRoZSBuZXcgbGlzdFxyXG4gICAgZm9yICggaSA9IDA7IGkgPCBiZWZvcmVPbmx5Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBhc3NvY2lhdGlvbk9iamVjdCA9IGJlZm9yZU9ubHlbIGkgXTtcclxuICAgICAgdGhpcy5yZW1vdmVBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uKCBhc3NvY2lhdGlvbk9iamVjdCApO1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2FyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zLmxlbmd0aCA9PT0gaW5Cb3RoLmxlbmd0aCxcclxuICAgICAgJ1JlbW92aW5nIGFzc29jaWF0aW9ucyBzaG91bGQgbm90IGhhdmUgdHJpZ2dlcmVkIG90aGVyIGFzc29jaWF0aW9uIGNoYW5nZXMnICk7XHJcblxyXG4gICAgLy8gYWRkIGVhY2ggYXNzb2NpYXRpb24gZnJvbSB0aGUgbmV3IGxpc3QgdGhhdCBoYXNuJ3QgYmVlbiBhZGRlZCB5ZXRcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgYWZ0ZXJPbmx5Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uID0gYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnNbIGkgXTtcclxuICAgICAgdGhpcy5hZGRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uKCBhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zKCBhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uczogQXNzb2NpYXRpb25bXSApIHsgdGhpcy5zZXRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucyggYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnMgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zKCk6IEFzc29jaWF0aW9uW10geyByZXR1cm4gdGhpcy5nZXRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucygpOyB9XHJcblxyXG4gIHB1YmxpYyBnZXRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucygpOiBBc3NvY2lhdGlvbltdIHtcclxuICAgIHJldHVybiB0aGlzLl9hcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhbiBhcmlhLWxhYmVsbGVkYnkgYXNzb2NpYXRpb24gdG8gdGhpcyBub2RlLiBUaGUgZGF0YSBpbiB0aGUgYXNzb2NpYXRpb25PYmplY3Qgd2lsbCBiZSBpbXBsZW1lbnRlZCBsaWtlXHJcbiAgICogXCJhIHBlZXIncyBIVE1MRWxlbWVudCBvZiB0aGlzIE5vZGUgKHNwZWNpZmllZCB3aXRoIHRoZSBzdHJpbmcgY29uc3RhbnQgc3RvcmVkIGluIGB0aGlzRWxlbWVudE5hbWVgKSB3aWxsIGhhdmUgYW5cclxuICAgKiBhcmlhLWxhYmVsbGVkYnkgYXR0cmlidXRlIHdpdGggYSB2YWx1ZSB0aGF0IGluY2x1ZGVzIHRoZSBgb3RoZXJOb2RlYCdzIHBlZXIgSFRNTEVsZW1lbnQncyBpZCAoc3BlY2lmaWVkIHdpdGhcclxuICAgKiBgb3RoZXJFbGVtZW50TmFtZWApLlwiXHJcbiAgICpcclxuICAgKiBUaGVyZSBjYW4gYmUgbW9yZSB0aGFuIG9uZSBhc3NvY2lhdGlvbiBiZWNhdXNlIGFuIGFyaWEtbGFiZWxsZWRieSBhdHRyaWJ1dGUncyB2YWx1ZSBjYW4gYmUgYSBzcGFjZSBzZXBhcmF0ZWRcclxuICAgKiBsaXN0IG9mIEhUTUwgaWRzLCBhbmQgbm90IGp1c3QgYSBzaW5nbGUgaWQsIHNlZSBodHRwczovL3d3dy53My5vcmcvV0FJL0dML3dpa2kvVXNpbmdfYXJpYS1sYWJlbGxlZGJ5X3RvX2NvbmNhdGVuYXRlX2FfbGFiZWxfZnJvbV9zZXZlcmFsX3RleHRfbm9kZXNcclxuICAgKi9cclxuICBwdWJsaWMgYWRkQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbiggYXNzb2NpYXRpb25PYmplY3Q6IEFzc29jaWF0aW9uICk6IHZvaWQge1xyXG5cclxuICAgIC8vIFRPRE86IGFzc2VydCBpZiB0aGlzIGFzc29jaWF0aW9uT2JqZWN0IGlzIGFscmVhZHkgaW4gdGhlIGFzc29jaWF0aW9uIG9iamVjdHMgbGlzdCEgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzgzMlxyXG5cclxuICAgIHRoaXMuX2FyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zLnB1c2goIGFzc29jaWF0aW9uT2JqZWN0ICk7IC8vIEtlZXAgdHJhY2sgb2YgdGhpcyBhc3NvY2lhdGlvbi5cclxuXHJcbiAgICAvLyBGbGFnIHRoYXQgdGhpcyBub2RlIGlzIGlzIGJlaW5nIGxhYmVsbGVkIGJ5IHRoZSBvdGhlciBub2RlLCBzbyB0aGF0IGlmIHRoZSBvdGhlciBub2RlIGNoYW5nZXMgaXQgY2FuIHRlbGxcclxuICAgIC8vIHRoaXMgbm9kZSB0byByZXN0b3JlIHRoZSBhc3NvY2lhdGlvbiBhcHByb3ByaWF0ZWx5LlxyXG4gICAgYXNzb2NpYXRpb25PYmplY3Qub3RoZXJOb2RlLl9ub2Rlc1RoYXRBcmVBcmlhTGFiZWxsZWRieVRoaXNOb2RlLnB1c2goIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uc0luUGVlcnMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBhbiBhcmlhLWxhYmVsbGVkYnkgYXNzb2NpYXRpb24gb2JqZWN0LCBzZWUgYWRkQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbiBmb3IgbW9yZSBkZXRhaWxzXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZUFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb24oIGFzc29jaWF0aW9uT2JqZWN0OiBBc3NvY2lhdGlvbiApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIHRoaXMuX2FyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zLCBhc3NvY2lhdGlvbk9iamVjdCApICk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIHRoZVxyXG4gICAgY29uc3QgcmVtb3ZlZE9iamVjdCA9IHRoaXMuX2FyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zLnNwbGljZSggXy5pbmRleE9mKCB0aGlzLl9hcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucywgYXNzb2NpYXRpb25PYmplY3QgKSwgMSApO1xyXG5cclxuICAgIC8vIHJlbW92ZSB0aGUgcmVmZXJlbmNlIGZyb20gdGhlIG90aGVyIG5vZGUgYmFjayB0byB0aGlzIG5vZGUgYmVjYXVzZSB3ZSBkb24ndCBuZWVkIGl0IGFueW1vcmVcclxuICAgIHJlbW92ZWRPYmplY3RbIDAgXS5vdGhlck5vZGUucmVtb3ZlTm9kZVRoYXRJc0FyaWFMYWJlbGxlZEJ5VGhpc05vZGUoIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uc0luUGVlcnMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSB0aGUgcmVmZXJlbmNlIHRvIHRoZSBub2RlIHRoYXQgaXMgdXNpbmcgdGhpcyBOb2RlJ3MgSUQgYXMgYW4gYXJpYS1sYWJlbGxlZGJ5IHZhbHVlIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVOb2RlVGhhdElzQXJpYUxhYmVsbGVkQnlUaGlzTm9kZSggbm9kZTogTm9kZSApOiB2b2lkIHtcclxuICAgIGNvbnN0IGluZGV4T2ZOb2RlID0gXy5pbmRleE9mKCB0aGlzLl9ub2Rlc1RoYXRBcmVBcmlhTGFiZWxsZWRieVRoaXNOb2RlLCBub2RlICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleE9mTm9kZSA+PSAwICk7XHJcbiAgICB0aGlzLl9ub2Rlc1RoYXRBcmVBcmlhTGFiZWxsZWRieVRoaXNOb2RlLnNwbGljZSggaW5kZXhPZk5vZGUsIDEgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWdnZXIgdGhlIHZpZXcgdXBkYXRlIGZvciBlYWNoIFBET01QZWVyXHJcbiAgICovXHJcbiAgcHVibGljIHVwZGF0ZUFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zSW5QZWVycygpOiB2b2lkIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMucGRvbUluc3RhbmNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgcGVlciA9IHRoaXMucGRvbUluc3RhbmNlc1sgaSBdLnBlZXIhO1xyXG4gICAgICBwZWVyLm9uQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbkNoYW5nZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBhc3NvY2lhdGlvbnMgZm9yIGFyaWEtbGFiZWxsZWRieSAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlT3RoZXJOb2Rlc0FyaWFMYWJlbGxlZGJ5KCk6IHZvaWQge1xyXG5cclxuICAgIC8vIGlmIGFueSBvdGhlciBub2RlcyBhcmUgYXJpYS1sYWJlbGxlZGJ5IHRoaXMgTm9kZSwgdXBkYXRlIHRob3NlIGFzc29jaWF0aW9ucyB0b28uIFNpbmNlIHRoaXMgbm9kZSdzXHJcbiAgICAvLyBwZG9tIGNvbnRlbnQgbmVlZHMgdG8gYmUgcmVjcmVhdGVkLCB0aGV5IG5lZWQgdG8gdXBkYXRlIHRoZWlyIGFyaWEtbGFiZWxsZWRieSBhc3NvY2lhdGlvbnMgYWNjb3JkaW5nbHkuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9ub2Rlc1RoYXRBcmVBcmlhTGFiZWxsZWRieVRoaXNOb2RlLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBvdGhlck5vZGUgPSB0aGlzLl9ub2Rlc1RoYXRBcmVBcmlhTGFiZWxsZWRieVRoaXNOb2RlWyBpIF07XHJcbiAgICAgIG90aGVyTm9kZS51cGRhdGVBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uc0luUGVlcnMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBsaXN0IG9mIE5vZGVzIHRoYXQgYXJlIGFyaWEtbGFiZWxsZWRieSB0aGlzIG5vZGUgKG90aGVyIG5vZGUncyBwZWVyIGVsZW1lbnQgd2lsbCBoYXZlIHRoaXMgTm9kZSdzIFBlZXIgZWxlbWVudCdzXHJcbiAgICogaWQgaW4gdGhlIGFyaWEtbGFiZWxsZWRieSBhdHRyaWJ1dGVcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Tm9kZXNUaGF0QXJlQXJpYUxhYmVsbGVkYnlUaGlzTm9kZSgpOiBOb2RlW10ge1xyXG4gICAgcmV0dXJuIHRoaXMuX25vZGVzVGhhdEFyZUFyaWFMYWJlbGxlZGJ5VGhpc05vZGU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IG5vZGVzVGhhdEFyZUFyaWFMYWJlbGxlZGJ5VGhpc05vZGUoKTogTm9kZVtdIHsgcmV0dXJuIHRoaXMuZ2V0Tm9kZXNUaGF0QXJlQXJpYUxhYmVsbGVkYnlUaGlzTm9kZSgpOyB9XHJcblxyXG4gIHB1YmxpYyBzZXRBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMoIGFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uczogQXNzb2NpYXRpb25bXSApOiB2b2lkIHtcclxuICAgIGxldCBhc3NvY2lhdGlvbk9iamVjdDtcclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucyApICk7XHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IGFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICBhc3NvY2lhdGlvbk9iamVjdCA9IGFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uc1sgaiBdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbm8gd29yayB0byBiZSBkb25lIGlmIGJvdGggYXJlIGVtcHR5XHJcbiAgICBpZiAoIGFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucy5sZW5ndGggPT09IDAgJiYgdGhpcy5fYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJlZm9yZU9ubHk6IEFzc29jaWF0aW9uW10gPSBbXTsgLy8gV2lsbCBob2xkIGFsbCBub2RlcyB0aGF0IHdpbGwgYmUgcmVtb3ZlZC5cclxuICAgIGNvbnN0IGFmdGVyT25seTogQXNzb2NpYXRpb25bXSA9IFtdOyAvLyBXaWxsIGhvbGQgYWxsIG5vZGVzIHRoYXQgd2lsbCBiZSBcIm5ld1wiIGNoaWxkcmVuIChhZGRlZClcclxuICAgIGNvbnN0IGluQm90aDogQXNzb2NpYXRpb25bXSA9IFtdOyAvLyBDaGlsZCBub2RlcyB0aGF0IFwic3RheVwiLiBXaWxsIGJlIG9yZGVyZWQgZm9yIHRoZSBcImFmdGVyXCIgY2FzZS5cclxuICAgIGxldCBpO1xyXG5cclxuICAgIC8vIGdldCBhIGRpZmZlcmVuY2Ugb2YgdGhlIGRlc2lyZWQgbmV3IGxpc3QsIGFuZCB0aGUgb2xkXHJcbiAgICBhcnJheURpZmZlcmVuY2UoIGFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucywgdGhpcy5fYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zLCBhZnRlck9ubHksIGJlZm9yZU9ubHksIGluQm90aCApO1xyXG5cclxuICAgIC8vIHJlbW92ZSBlYWNoIGN1cnJlbnQgYXNzb2NpYXRpb25PYmplY3QgdGhhdCBpc24ndCBpbiB0aGUgbmV3IGxpc3RcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgYmVmb3JlT25seS5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgYXNzb2NpYXRpb25PYmplY3QgPSBiZWZvcmVPbmx5WyBpIF07XHJcbiAgICAgIHRoaXMucmVtb3ZlQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24oIGFzc29jaWF0aW9uT2JqZWN0ICk7XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zLmxlbmd0aCA9PT0gaW5Cb3RoLmxlbmd0aCxcclxuICAgICAgJ1JlbW92aW5nIGFzc29jaWF0aW9ucyBzaG91bGQgbm90IGhhdmUgdHJpZ2dlcmVkIG90aGVyIGFzc29jaWF0aW9uIGNoYW5nZXMnICk7XHJcblxyXG4gICAgLy8gYWRkIGVhY2ggYXNzb2NpYXRpb24gZnJvbSB0aGUgbmV3IGxpc3QgdGhhdCBoYXNuJ3QgYmVlbiBhZGRlZCB5ZXRcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgYWZ0ZXJPbmx5Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBhcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbiA9IGFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uc1sgaSBdO1xyXG4gICAgICB0aGlzLmFkZEFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uKCBhcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbiApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBhcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMoIGFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uczogQXNzb2NpYXRpb25bXSApIHsgdGhpcy5zZXRBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMoIGFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucyApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgYXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zKCk6IEFzc29jaWF0aW9uW10geyByZXR1cm4gdGhpcy5nZXRBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMoKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0QXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zKCk6IEFzc29jaWF0aW9uW10ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2FyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhbiBhcmlhLWRlc2NyaWJlZGJ5IGFzc29jaWF0aW9uIHRvIHRoaXMgbm9kZS4gVGhlIGRhdGEgaW4gdGhlIGFzc29jaWF0aW9uT2JqZWN0IHdpbGwgYmUgaW1wbGVtZW50ZWQgbGlrZVxyXG4gICAqIFwiYSBwZWVyJ3MgSFRNTEVsZW1lbnQgb2YgdGhpcyBOb2RlIChzcGVjaWZpZWQgd2l0aCB0aGUgc3RyaW5nIGNvbnN0YW50IHN0b3JlZCBpbiBgdGhpc0VsZW1lbnROYW1lYCkgd2lsbCBoYXZlIGFuXHJcbiAgICogYXJpYS1kZXNjcmliZWRieSBhdHRyaWJ1dGUgd2l0aCBhIHZhbHVlIHRoYXQgaW5jbHVkZXMgdGhlIGBvdGhlck5vZGVgJ3MgcGVlciBIVE1MRWxlbWVudCdzIGlkIChzcGVjaWZpZWQgd2l0aFxyXG4gICAqIGBvdGhlckVsZW1lbnROYW1lYCkuXCJcclxuICAgKlxyXG4gICAqIFRoZXJlIGNhbiBiZSBtb3JlIHRoYW4gb25lIGFzc29jaWF0aW9uIGJlY2F1c2UgYW4gYXJpYS1kZXNjcmliZWRieSBhdHRyaWJ1dGUncyB2YWx1ZSBjYW4gYmUgYSBzcGFjZSBzZXBhcmF0ZWRcclxuICAgKiBsaXN0IG9mIEhUTUwgaWRzLCBhbmQgbm90IGp1c3QgYSBzaW5nbGUgaWQsIHNlZSBodHRwczovL3d3dy53My5vcmcvV0FJL0dML3dpa2kvVXNpbmdfYXJpYS1sYWJlbGxlZGJ5X3RvX2NvbmNhdGVuYXRlX2FfbGFiZWxfZnJvbV9zZXZlcmFsX3RleHRfbm9kZXNcclxuICAgKi9cclxuICBwdWJsaWMgYWRkQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24oIGFzc29jaWF0aW9uT2JqZWN0OiBBc3NvY2lhdGlvbiApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFfLmluY2x1ZGVzKCB0aGlzLl9hcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMsIGFzc29jaWF0aW9uT2JqZWN0ICksICdkZXNjcmliZWRieSBhc3NvY2lhdGlvbiBhbHJlYWR5IHJlZ2lzdGVkJyApO1xyXG5cclxuICAgIHRoaXMuX2FyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucy5wdXNoKCBhc3NvY2lhdGlvbk9iamVjdCApOyAvLyBLZWVwIHRyYWNrIG9mIHRoaXMgYXNzb2NpYXRpb24uXHJcblxyXG4gICAgLy8gRmxhZyB0aGF0IHRoaXMgbm9kZSBpcyBpcyBiZWluZyBkZXNjcmliZWQgYnkgdGhlIG90aGVyIG5vZGUsIHNvIHRoYXQgaWYgdGhlIG90aGVyIG5vZGUgY2hhbmdlcyBpdCBjYW4gdGVsbFxyXG4gICAgLy8gdGhpcyBub2RlIHRvIHJlc3RvcmUgdGhlIGFzc29jaWF0aW9uIGFwcHJvcHJpYXRlbHkuXHJcbiAgICBhc3NvY2lhdGlvbk9iamVjdC5vdGhlck5vZGUuX25vZGVzVGhhdEFyZUFyaWFEZXNjcmliZWRieVRoaXNOb2RlLnB1c2goIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBQRE9NUGVlcnMgd2l0aCB0aGlzIGFyaWEtZGVzY3JpYmVkYnkgYXNzb2NpYXRpb25cclxuICAgIHRoaXMudXBkYXRlQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zSW5QZWVycygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSXMgdGhpcyBvYmplY3QgYWxyZWFkeSBpbiB0aGUgZGVzY3JpYmVkYnkgYXNzb2NpYXRpb24gbGlzdFxyXG4gICAqL1xyXG4gIHB1YmxpYyBoYXNBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbiggYXNzb2NpYXRpb25PYmplY3Q6IEFzc29jaWF0aW9uICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIF8uaW5jbHVkZXMoIHRoaXMuX2FyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucywgYXNzb2NpYXRpb25PYmplY3QgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBhbiBhcmlhLWRlc2NyaWJlZGJ5IGFzc29jaWF0aW9uIG9iamVjdCwgc2VlIGFkZEFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uIGZvciBtb3JlIGRldGFpbHNcclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24oIGFzc29jaWF0aW9uT2JqZWN0OiBBc3NvY2lhdGlvbiApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIHRoaXMuX2FyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucywgYXNzb2NpYXRpb25PYmplY3QgKSApO1xyXG5cclxuICAgIC8vIHJlbW92ZSB0aGVcclxuICAgIGNvbnN0IHJlbW92ZWRPYmplY3QgPSB0aGlzLl9hcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbnMuc3BsaWNlKCBfLmluZGV4T2YoIHRoaXMuX2FyaWFEZXNjcmliZWRieUFzc29jaWF0aW9ucywgYXNzb2NpYXRpb25PYmplY3QgKSwgMSApO1xyXG5cclxuICAgIC8vIHJlbW92ZSB0aGUgcmVmZXJlbmNlIGZyb20gdGhlIG90aGVyIG5vZGUgYmFjayB0byB0aGlzIG5vZGUgYmVjYXVzZSB3ZSBkb24ndCBuZWVkIGl0IGFueW1vcmVcclxuICAgIHJlbW92ZWRPYmplY3RbIDAgXS5vdGhlck5vZGUucmVtb3ZlTm9kZVRoYXRJc0FyaWFEZXNjcmliZWRCeVRoaXNOb2RlKCB0aGlzIGFzIHVua25vd24gYXMgTm9kZSApO1xyXG5cclxuICAgIHRoaXMudXBkYXRlQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zSW5QZWVycygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIHRoZSByZWZlcmVuY2UgdG8gdGhlIG5vZGUgdGhhdCBpcyB1c2luZyB0aGlzIE5vZGUncyBJRCBhcyBhbiBhcmlhLWRlc2NyaWJlZGJ5IHZhbHVlIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVOb2RlVGhhdElzQXJpYURlc2NyaWJlZEJ5VGhpc05vZGUoIG5vZGU6IE5vZGUgKTogdm9pZCB7XHJcbiAgICBjb25zdCBpbmRleE9mTm9kZSA9IF8uaW5kZXhPZiggdGhpcy5fbm9kZXNUaGF0QXJlQXJpYURlc2NyaWJlZGJ5VGhpc05vZGUsIG5vZGUgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4T2ZOb2RlID49IDAgKTtcclxuICAgIHRoaXMuX25vZGVzVGhhdEFyZUFyaWFEZXNjcmliZWRieVRoaXNOb2RlLnNwbGljZSggaW5kZXhPZk5vZGUsIDEgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWdnZXIgdGhlIHZpZXcgdXBkYXRlIGZvciBlYWNoIFBET01QZWVyXHJcbiAgICovXHJcbiAgcHVibGljIHVwZGF0ZUFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uc0luUGVlcnMoKTogdm9pZCB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnBkb21JbnN0YW5jZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLnBkb21JbnN0YW5jZXNbIGkgXS5wZWVyITtcclxuICAgICAgcGVlci5vbkFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uQ2hhbmdlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIGFzc29jaWF0aW9ucyBmb3IgYXJpYS1kZXNjcmliZWRieSAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlT3RoZXJOb2Rlc0FyaWFEZXNjcmliZWRieSgpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBpZiBhbnkgb3RoZXIgbm9kZXMgYXJlIGFyaWEtZGVzY3JpYmVkYnkgdGhpcyBOb2RlLCB1cGRhdGUgdGhvc2UgYXNzb2NpYXRpb25zIHRvby4gU2luY2UgdGhpcyBub2RlJ3NcclxuICAgIC8vIHBkb20gY29udGVudCBuZWVkcyB0byBiZSByZWNyZWF0ZWQsIHRoZXkgbmVlZCB0byB1cGRhdGUgdGhlaXIgYXJpYS1kZXNjcmliZWRieSBhc3NvY2lhdGlvbnMgYWNjb3JkaW5nbHkuXHJcbiAgICAvLyBUT0RPOiBvbmx5IHVzZSB1bmlxdWUgZWxlbWVudHMgb2YgdGhlIGFycmF5IChfLnVuaXF1ZSlcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX25vZGVzVGhhdEFyZUFyaWFEZXNjcmliZWRieVRoaXNOb2RlLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBvdGhlck5vZGUgPSB0aGlzLl9ub2Rlc1RoYXRBcmVBcmlhRGVzY3JpYmVkYnlUaGlzTm9kZVsgaSBdO1xyXG4gICAgICBvdGhlck5vZGUudXBkYXRlQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb25zSW5QZWVycygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGxpc3Qgb2YgTm9kZXMgdGhhdCBhcmUgYXJpYS1kZXNjcmliZWRieSB0aGlzIG5vZGUgKG90aGVyIG5vZGUncyBwZWVyIGVsZW1lbnQgd2lsbCBoYXZlIHRoaXMgTm9kZSdzIFBlZXIgZWxlbWVudCdzXHJcbiAgICogaWQgaW4gdGhlIGFyaWEtZGVzY3JpYmVkYnkgYXR0cmlidXRlXHJcbiAgICovXHJcbiAgcHVibGljIGdldE5vZGVzVGhhdEFyZUFyaWFEZXNjcmliZWRieVRoaXNOb2RlKCk6IE5vZGVbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5fbm9kZXNUaGF0QXJlQXJpYURlc2NyaWJlZGJ5VGhpc05vZGU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IG5vZGVzVGhhdEFyZUFyaWFEZXNjcmliZWRieVRoaXNOb2RlKCk6IE5vZGVbXSB7IHJldHVybiB0aGlzLmdldE5vZGVzVGhhdEFyZUFyaWFEZXNjcmliZWRieVRoaXNOb2RlKCk7IH1cclxuXHJcbiAgcHVibGljIHNldEFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnMoIGFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnM6IEFzc29jaWF0aW9uW10gKTogdm9pZCB7XHJcblxyXG4gICAgbGV0IGFzc29jaWF0aW9uT2JqZWN0O1xyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIGFzc2VydCggQXJyYXkuaXNBcnJheSggYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucyApICk7XHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IGFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgYXNzb2NpYXRpb25PYmplY3QgPSBhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zWyBqIF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBubyB3b3JrIHRvIGJlIGRvbmUgaWYgYm90aCBhcmUgZW1wdHksIHNhZmUgdG8gcmV0dXJuIGVhcmx5XHJcbiAgICBpZiAoIGFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnMubGVuZ3RoID09PSAwICYmIHRoaXMuX2FjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnMubGVuZ3RoID09PSAwICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYmVmb3JlT25seTogQXNzb2NpYXRpb25bXSA9IFtdOyAvLyBXaWxsIGhvbGQgYWxsIG5vZGVzIHRoYXQgd2lsbCBiZSByZW1vdmVkLlxyXG4gICAgY29uc3QgYWZ0ZXJPbmx5OiBBc3NvY2lhdGlvbltdID0gW107IC8vIFdpbGwgaG9sZCBhbGwgbm9kZXMgdGhhdCB3aWxsIGJlIFwibmV3XCIgY2hpbGRyZW4gKGFkZGVkKVxyXG4gICAgY29uc3QgaW5Cb3RoOiBBc3NvY2lhdGlvbltdID0gW107IC8vIENoaWxkIG5vZGVzIHRoYXQgXCJzdGF5XCIuIFdpbGwgYmUgb3JkZXJlZCBmb3IgdGhlIFwiYWZ0ZXJcIiBjYXNlLlxyXG4gICAgbGV0IGk7XHJcblxyXG4gICAgLy8gZ2V0IGEgZGlmZmVyZW5jZSBvZiB0aGUgZGVzaXJlZCBuZXcgbGlzdCwgYW5kIHRoZSBvbGRcclxuICAgIGFycmF5RGlmZmVyZW5jZSggYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucywgdGhpcy5fYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucywgYWZ0ZXJPbmx5LCBiZWZvcmVPbmx5LCBpbkJvdGggKTtcclxuXHJcbiAgICAvLyByZW1vdmUgZWFjaCBjdXJyZW50IGFzc29jaWF0aW9uT2JqZWN0IHRoYXQgaXNuJ3QgaW4gdGhlIG5ldyBsaXN0XHJcbiAgICBmb3IgKCBpID0gMDsgaSA8IGJlZm9yZU9ubHkubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGFzc29jaWF0aW9uT2JqZWN0ID0gYmVmb3JlT25seVsgaSBdO1xyXG4gICAgICB0aGlzLnJlbW92ZUFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbiggYXNzb2NpYXRpb25PYmplY3QgKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9hY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zLmxlbmd0aCA9PT0gaW5Cb3RoLmxlbmd0aCxcclxuICAgICAgJ1JlbW92aW5nIGFzc29jaWF0aW9ucyBzaG91bGQgbm90IGhhdmUgdHJpZ2dlcmVkIG90aGVyIGFzc29jaWF0aW9uIGNoYW5nZXMnICk7XHJcblxyXG4gICAgLy8gYWRkIGVhY2ggYXNzb2NpYXRpb24gZnJvbSB0aGUgbmV3IGxpc3QgdGhhdCBoYXNuJ3QgYmVlbiBhZGRlZCB5ZXRcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgYWZ0ZXJPbmx5Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb24gPSBhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zWyBpIF07XHJcbiAgICAgIHRoaXMuYWRkQWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9uKCBhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb24gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucyggYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9uczogQXNzb2NpYXRpb25bXSApIHsgdGhpcy5zZXRBY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zKCBhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBhY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zKCk6IEFzc29jaWF0aW9uW10geyByZXR1cm4gdGhpcy5nZXRBY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zKCk7IH1cclxuXHJcbiAgcHVibGljIGdldEFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnMoKTogQXNzb2NpYXRpb25bXSB7XHJcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhbiBhcmlhLWFjdGl2ZURlc2NlbmRhbnQgYXNzb2NpYXRpb24gdG8gdGhpcyBub2RlLiBUaGUgZGF0YSBpbiB0aGUgYXNzb2NpYXRpb25PYmplY3Qgd2lsbCBiZSBpbXBsZW1lbnRlZCBsaWtlXHJcbiAgICogXCJhIHBlZXIncyBIVE1MRWxlbWVudCBvZiB0aGlzIE5vZGUgKHNwZWNpZmllZCB3aXRoIHRoZSBzdHJpbmcgY29uc3RhbnQgc3RvcmVkIGluIGB0aGlzRWxlbWVudE5hbWVgKSB3aWxsIGhhdmUgYW5cclxuICAgKiBhcmlhLWFjdGl2ZURlc2NlbmRhbnQgYXR0cmlidXRlIHdpdGggYSB2YWx1ZSB0aGF0IGluY2x1ZGVzIHRoZSBgb3RoZXJOb2RlYCdzIHBlZXIgSFRNTEVsZW1lbnQncyBpZCAoc3BlY2lmaWVkIHdpdGhcclxuICAgKiBgb3RoZXJFbGVtZW50TmFtZWApLlwiXHJcbiAgICovXHJcbiAgcHVibGljIGFkZEFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbiggYXNzb2NpYXRpb25PYmplY3Q6IEFzc29jaWF0aW9uICk6IHZvaWQge1xyXG5cclxuICAgIC8vIFRPRE86IGFzc2VydCBpZiB0aGlzIGFzc29jaWF0aW9uT2JqZWN0IGlzIGFscmVhZHkgaW4gdGhlIGFzc29jaWF0aW9uIG9iamVjdHMgbGlzdCEgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzgzMlxyXG4gICAgdGhpcy5fYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucy5wdXNoKCBhc3NvY2lhdGlvbk9iamVjdCApOyAvLyBLZWVwIHRyYWNrIG9mIHRoaXMgYXNzb2NpYXRpb24uXHJcblxyXG4gICAgLy8gRmxhZyB0aGF0IHRoaXMgbm9kZSBpcyBpcyBiZWluZyBkZXNjcmliZWQgYnkgdGhlIG90aGVyIG5vZGUsIHNvIHRoYXQgaWYgdGhlIG90aGVyIG5vZGUgY2hhbmdlcyBpdCBjYW4gdGVsbFxyXG4gICAgLy8gdGhpcyBub2RlIHRvIHJlc3RvcmUgdGhlIGFzc29jaWF0aW9uIGFwcHJvcHJpYXRlbHkuXHJcbiAgICBhc3NvY2lhdGlvbk9iamVjdC5vdGhlck5vZGUuX25vZGVzVGhhdEFyZUFjdGl2ZURlc2NlbmRhbnRUb1RoaXNOb2RlLnB1c2goIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBwZG9tUGVlcnMgd2l0aCB0aGlzIGFyaWEtYWN0aXZlRGVzY2VuZGFudCBhc3NvY2lhdGlvblxyXG4gICAgdGhpcy51cGRhdGVBY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zSW5QZWVycygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGFuIGFyaWEtYWN0aXZlRGVzY2VuZGFudCBhc3NvY2lhdGlvbiBvYmplY3QsIHNlZSBhZGRBY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb24gZm9yIG1vcmUgZGV0YWlsc1xyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVBY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb24oIGFzc29jaWF0aW9uT2JqZWN0OiBBc3NvY2lhdGlvbiApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIHRoaXMuX2FjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnMsIGFzc29jaWF0aW9uT2JqZWN0ICkgKTtcclxuXHJcbiAgICAvLyByZW1vdmUgdGhlXHJcbiAgICBjb25zdCByZW1vdmVkT2JqZWN0ID0gdGhpcy5fYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucy5zcGxpY2UoIF8uaW5kZXhPZiggdGhpcy5fYWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9ucywgYXNzb2NpYXRpb25PYmplY3QgKSwgMSApO1xyXG5cclxuICAgIC8vIHJlbW92ZSB0aGUgcmVmZXJlbmNlIGZyb20gdGhlIG90aGVyIG5vZGUgYmFjayB0byB0aGlzIG5vZGUgYmVjYXVzZSB3ZSBkb24ndCBuZWVkIGl0IGFueW1vcmVcclxuICAgIHJlbW92ZWRPYmplY3RbIDAgXS5vdGhlck5vZGUucmVtb3ZlTm9kZVRoYXRJc0FjdGl2ZURlc2NlbmRhbnRUaGlzTm9kZSggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZUFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbnNJblBlZXJzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgdGhlIHJlZmVyZW5jZSB0byB0aGUgbm9kZSB0aGF0IGlzIHVzaW5nIHRoaXMgTm9kZSdzIElEIGFzIGFuIGFyaWEtYWN0aXZlRGVzY2VuZGFudCB2YWx1ZSAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwcml2YXRlIHJlbW92ZU5vZGVUaGF0SXNBY3RpdmVEZXNjZW5kYW50VGhpc05vZGUoIG5vZGU6IE5vZGUgKTogdm9pZCB7XHJcbiAgICBjb25zdCBpbmRleE9mTm9kZSA9IF8uaW5kZXhPZiggdGhpcy5fbm9kZXNUaGF0QXJlQWN0aXZlRGVzY2VuZGFudFRvVGhpc05vZGUsIG5vZGUgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4T2ZOb2RlID49IDAgKTtcclxuICAgIHRoaXMuX25vZGVzVGhhdEFyZUFjdGl2ZURlc2NlbmRhbnRUb1RoaXNOb2RlLnNwbGljZSggaW5kZXhPZk5vZGUsIDEgKTtcclxuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmlnZ2VyIHRoZSB2aWV3IHVwZGF0ZSBmb3IgZWFjaCBQRE9NUGVlclxyXG4gICAqL1xyXG4gIHByaXZhdGUgdXBkYXRlQWN0aXZlRGVzY2VuZGFudEFzc29jaWF0aW9uc0luUGVlcnMoKTogdm9pZCB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnBkb21JbnN0YW5jZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLnBkb21JbnN0YW5jZXNbIGkgXS5wZWVyITtcclxuICAgICAgcGVlci5vbkFjdGl2ZURlc2NlbmRhbnRBc3NvY2lhdGlvbkNoYW5nZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBhc3NvY2lhdGlvbnMgZm9yIGFyaWEtYWN0aXZlRGVzY2VuZGFudCAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlT3RoZXJOb2Rlc0FjdGl2ZURlc2NlbmRhbnQoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gaWYgYW55IG90aGVyIG5vZGVzIGFyZSBhcmlhLWFjdGl2ZURlc2NlbmRhbnQgdGhpcyBOb2RlLCB1cGRhdGUgdGhvc2UgYXNzb2NpYXRpb25zIHRvby4gU2luY2UgdGhpcyBub2RlJ3NcclxuICAgIC8vIHBkb20gY29udGVudCBuZWVkcyB0byBiZSByZWNyZWF0ZWQsIHRoZXkgbmVlZCB0byB1cGRhdGUgdGhlaXIgYXJpYS1hY3RpdmVEZXNjZW5kYW50IGFzc29jaWF0aW9ucyBhY2NvcmRpbmdseS5cclxuICAgIC8vIFRPRE86IG9ubHkgdXNlIHVuaXF1ZSBlbGVtZW50cyBvZiB0aGUgYXJyYXkgKF8udW5pcXVlKVxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fbm9kZXNUaGF0QXJlQWN0aXZlRGVzY2VuZGFudFRvVGhpc05vZGUubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IG90aGVyTm9kZSA9IHRoaXMuX25vZGVzVGhhdEFyZUFjdGl2ZURlc2NlbmRhbnRUb1RoaXNOb2RlWyBpIF07XHJcbiAgICAgIG90aGVyTm9kZS51cGRhdGVBY3RpdmVEZXNjZW5kYW50QXNzb2NpYXRpb25zSW5QZWVycygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGxpc3Qgb2YgTm9kZXMgdGhhdCBhcmUgYXJpYS1hY3RpdmVEZXNjZW5kYW50IHRoaXMgbm9kZSAob3RoZXIgbm9kZSdzIHBlZXIgZWxlbWVudCB3aWxsIGhhdmUgdGhpcyBOb2RlJ3MgUGVlciBlbGVtZW50J3NcclxuICAgKiBpZCBpbiB0aGUgYXJpYS1hY3RpdmVEZXNjZW5kYW50IGF0dHJpYnV0ZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0Tm9kZXNUaGF0QXJlQWN0aXZlRGVzY2VuZGFudFRvVGhpc05vZGUoKTogTm9kZVtdIHtcclxuICAgIHJldHVybiB0aGlzLl9ub2Rlc1RoYXRBcmVBY3RpdmVEZXNjZW5kYW50VG9UaGlzTm9kZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0IG5vZGVzVGhhdEFyZUFjdGl2ZURlc2NlbmRhbnRUb1RoaXNOb2RlKCkgeyByZXR1cm4gdGhpcy5nZXROb2Rlc1RoYXRBcmVBY3RpdmVEZXNjZW5kYW50VG9UaGlzTm9kZSgpOyB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBQRE9NL0RPTSBvcmRlciBmb3IgdGhpcyBOb2RlLiBUaGlzIGluY2x1ZGVzIG5vdCBvbmx5IGZvY3VzZWQgaXRlbXMsIGJ1dCBlbGVtZW50cyB0aGF0IGNhbiBiZVxyXG4gICAqIHBsYWNlZCBpbiB0aGUgUGFyYWxsZWwgRE9NLiBJZiBwcm92aWRlZCwgaXQgd2lsbCBvdmVycmlkZSB0aGUgZm9jdXMgb3JkZXIgYmV0d2VlbiBjaGlsZHJlbiAoYW5kXHJcbiAgICogb3B0aW9uYWxseSBhcmJpdHJhcnkgc3VidHJlZXMpLiBJZiBub3QgcHJvdmlkZWQsIHRoZSBmb2N1cyBvcmRlciB3aWxsIGRlZmF1bHQgdG8gdGhlIHJlbmRlcmluZyBvcmRlclxyXG4gICAqIChmaXJzdCBjaGlsZHJlbiBmaXJzdCwgbGFzdCBjaGlsZHJlbiBsYXN0KSwgZGV0ZXJtaW5lZCBieSB0aGUgY2hpbGRyZW4gYXJyYXkuIEEgTm9kZSBtdXN0IGJlIGNvbmVjdGVkIHRvIGEgc2NlbmVcclxuICAgKiBncmFwaCAodmlhIGNoaWxkcmVuKSBpbiBvcmRlciBmb3IgUERPTSBvcmRlciB0byBhcHBseS4gVGh1cyBgc2V0UERPTU9yZGVyYCBjYW5ub3QgYmUgdXNlZCBpbiBleGNoYW5nZSBmb3JcclxuICAgKiBzZXR0aW5nIGEgbm9kZSBhcyBhIGNoaWxkLlxyXG4gICAqXHJcbiAgICogSW4gdGhlIGdlbmVyYWwgY2FzZSwgd2hlbiBhbiBwZG9tIG9yZGVyIGlzIHNwZWNpZmllZCwgaXQncyBhbiBhcnJheSBvZiBub2Rlcywgd2l0aCBvcHRpb25hbGx5IG9uZVxyXG4gICAqIGVsZW1lbnQgYmVpbmcgYSBwbGFjZWhvbGRlciBmb3IgXCJ0aGUgcmVzdCBvZiB0aGUgY2hpbGRyZW5cIiwgc2lnbmlmaWVkIGJ5IG51bGwuIFRoaXMgbWVhbnMgdGhhdCwgZm9yXHJcbiAgICogYWNjZXNzaWJpbGl0eSwgaXQgd2lsbCBhY3QgYXMgaWYgdGhlIGNoaWxkcmVuIGZvciB0aGlzIG5vZGUgV0VSRSB0aGUgcGRvbU9yZGVyIChwb3RlbnRpYWxseVxyXG4gICAqIHN1cHBsZW1lbnRlZCB3aXRoIG90aGVyIGNoaWxkcmVuIHZpYSB0aGUgcGxhY2Vob2xkZXIpLlxyXG4gICAqXHJcbiAgICogRm9yIGV4YW1wbGUsIGlmIHlvdSBoYXZlIHRoZSB0cmVlOlxyXG4gICAqICAgYVxyXG4gICAqICAgICBiXHJcbiAgICogICAgICAgZFxyXG4gICAqICAgICAgIGVcclxuICAgKiAgICAgY1xyXG4gICAqICAgICAgIGdcclxuICAgKiAgICAgICBmXHJcbiAgICogICAgICAgICBoXHJcbiAgICpcclxuICAgKiBhbmQgd2Ugc3BlY2lmeSBiLnBkb21PcmRlciA9IFsgZSwgZiwgZCwgYyBdLCB0aGVuIHRoZSBwZG9tIHN0cnVjdHVyZSB3aWxsIGFjdCBhcyBpZiB0aGUgdHJlZSBpczpcclxuICAgKiAgYVxyXG4gICAqICAgIGJcclxuICAgKiAgICAgIGVcclxuICAgKiAgICAgIGYgPC0tLSB0aGUgZW50aXJlIHN1YnRyZWUgb2YgYGZgIGdldHMgcGxhY2VkIGhlcmUgdW5kZXIgYGJgLCBwdWxsaW5nIGl0IG91dCBmcm9tIHdoZXJlIGl0IHdhcyBiZWZvcmUuXHJcbiAgICogICAgICAgIGhcclxuICAgKiAgICAgIGRcclxuICAgKiAgICAgIGMgPC0tLSBub3RlIHRoYXQgYGdgIGlzIE5PVCB1bmRlciBgY2AgYW55bW9yZSwgYmVjYXVzZSBpdCBnb3QgcHVsbGVkIG91dCB1bmRlciBiIGRpcmVjdGx5XHJcbiAgICogICAgICAgIGdcclxuICAgKlxyXG4gICAqIFRoZSBwbGFjZWhvbGRlciAoYG51bGxgKSB3aWxsIGdldCBmaWxsZWQgaW4gd2l0aCBhbGwgZGlyZWN0IGNoaWxkcmVuIHRoYXQgYXJlIE5PVCBpbiBhbnkgcGRvbU9yZGVyLlxyXG4gICAqIElmIHRoZXJlIGlzIG5vIHBsYWNlaG9sZGVyIHNwZWNpZmllZCwgaXQgd2lsbCBhY3QgYXMgaWYgdGhlIHBsYWNlaG9sZGVyIGlzIGF0IHRoZSBlbmQgb2YgdGhlIG9yZGVyLlxyXG4gICAqIFRoZSB2YWx1ZSBgbnVsbGAgKHRoZSBkZWZhdWx0KSBhbmQgdGhlIGVtcHR5IGFycmF5IChgW11gKSBib3RoIGFjdCBhcyBpZiB0aGUgb25seSBvcmRlciBpcyB0aGUgcGxhY2Vob2xkZXIsXHJcbiAgICogaS5lLiBgW251bGxdYC5cclxuICAgKlxyXG4gICAqIFNvbWUgZ2VuZXJhbCBjb25zdHJhaW50cyBmb3IgdGhlIG9yZGVycyBhcmU6XHJcbiAgICogLSBOb2RlcyBtdXN0IGJlIGF0dGFjaGVkIHRvIGEgRGlzcGxheSAoaW4gYSBzY2VuZSBncmFwaCkgdG8gYmUgc2hvd24gaW4gYW4gcGRvbSBvcmRlci5cclxuICAgKiAtIFlvdSBjYW4ndCBzcGVjaWZ5IGEgbm9kZSBpbiBtb3JlIHRoYW4gb25lIHBkb21PcmRlciwgYW5kIHlvdSBjYW4ndCBzcGVjaWZ5IGR1cGxpY2F0ZXMgb2YgYSB2YWx1ZVxyXG4gICAqICAgaW4gYW4gcGRvbU9yZGVyLlxyXG4gICAqIC0gWW91IGNhbid0IHNwZWNpZnkgYW4gYW5jZXN0b3Igb2YgYSBub2RlIGluIHRoYXQgbm9kZSdzIHBkb21PcmRlclxyXG4gICAqICAgKGUuZy4gdGhpcy5wZG9tT3JkZXIgPSB0aGlzLnBhcmVudHMgKS5cclxuICAgKlxyXG4gICAqIE5vdGUgdGhhdCBzcGVjaWZ5aW5nIHNvbWV0aGluZyBpbiBhbiBwZG9tT3JkZXIgd2lsbCBlZmZlY3RpdmVseSByZW1vdmUgaXQgZnJvbSBhbGwgb2YgaXRzIHBhcmVudHMgZm9yXHJcbiAgICogdGhlIHBkb20gdHJlZSAoc28gaWYgeW91IGNyZWF0ZSBgdG1wTm9kZS5wZG9tT3JkZXIgPSBbIGEgXWAgdGhlbiB0b3NzIHRoZSB0bXBOb2RlIHdpdGhvdXRcclxuICAgKiBkaXNwb3NpbmcgaXQsIGBhYCB3b24ndCBzaG93IHVwIGluIHRoZSBwYXJhbGxlbCBET00pLiBJZiB0aGVyZSBpcyBhIG5lZWQgZm9yIHRoYXQsIGRpc3Bvc2luZyBhIE5vZGVcclxuICAgKiBlZmZlY3RpdmVseSByZW1vdmVzIGl0cyBwZG9tT3JkZXIuXHJcbiAgICpcclxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvMzY1I2lzc3VlY29tbWVudC0zODEzMDI1ODMgZm9yIG1vcmUgaW5mb3JtYXRpb24gb24gdGhlXHJcbiAgICogZGVjaXNpb25zIGFuZCBkZXNpZ24gZm9yIHRoaXMgZmVhdHVyZS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0UERPTU9yZGVyKCBwZG9tT3JkZXI6ICggTm9kZSB8IG51bGwgKVtdIHwgbnVsbCApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIHBkb21PcmRlciApIHx8IHBkb21PcmRlciA9PT0gbnVsbCxcclxuICAgICAgYEFycmF5IG9yIG51bGwgZXhwZWN0ZWQsIHJlY2VpdmVkOiAke3Bkb21PcmRlcn1gICk7XHJcbiAgICBhc3NlcnQgJiYgcGRvbU9yZGVyICYmIHBkb21PcmRlci5mb3JFYWNoKCAoIG5vZGUsIGluZGV4ICkgPT4ge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlID09PSBudWxsIHx8IG5vZGUgaW5zdGFuY2VvZiBOb2RlLFxyXG4gICAgICAgIGBFbGVtZW50cyBvZiBwZG9tT3JkZXIgc2hvdWxkIGJlIGVpdGhlciBhIE5vZGUgb3IgbnVsbC4gRWxlbWVudCBhdCBpbmRleCAke2luZGV4fSBpczogJHtub2RlfWAgKTtcclxuICAgIH0gKTtcclxuICAgIGFzc2VydCAmJiBwZG9tT3JkZXIgJiYgYXNzZXJ0KCAoIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICkuZ2V0VHJhaWxzKCBub2RlID0+IF8uaW5jbHVkZXMoIHBkb21PcmRlciwgbm9kZSApICkubGVuZ3RoID09PSAwLCAncGRvbU9yZGVyIHNob3VsZCBub3QgaW5jbHVkZSBhbnkgYW5jZXN0b3JzIG9yIHRoZSBub2RlIGl0c2VsZicgKTtcclxuXHJcbiAgICAvLyBPbmx5IHVwZGF0ZSBpZiBpdCBoYXMgY2hhbmdlZFxyXG4gICAgaWYgKCB0aGlzLl9wZG9tT3JkZXIgIT09IHBkb21PcmRlciApIHtcclxuICAgICAgY29uc3Qgb2xkUERPTU9yZGVyID0gdGhpcy5fcGRvbU9yZGVyO1xyXG5cclxuICAgICAgLy8gU3RvcmUgb3VyIG93biByZWZlcmVuY2UgdG8gdGhpcywgc28gY2xpZW50IG1vZGlmaWNhdGlvbnMgdG8gdGhlIGlucHV0IGFycmF5IHdvbid0IHNpbGVudGx5IGJyZWFrIHRoaW5ncy5cclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy83ODZcclxuICAgICAgdGhpcy5fcGRvbU9yZGVyID0gcGRvbU9yZGVyID09PSBudWxsID8gbnVsbCA6IHBkb21PcmRlci5zbGljZSgpO1xyXG5cclxuICAgICAgUERPTVRyZWUucGRvbU9yZGVyQ2hhbmdlKCB0aGlzIGFzIHVua25vd24gYXMgTm9kZSwgb2xkUERPTU9yZGVyLCBwZG9tT3JkZXIgKTtcclxuXHJcbiAgICAgICggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKS5yZW5kZXJlclN1bW1hcnlSZWZyZXNoRW1pdHRlci5lbWl0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHBkb21PcmRlciggdmFsdWU6ICggTm9kZSB8IG51bGwgKVtdIHwgbnVsbCApIHsgdGhpcy5zZXRQRE9NT3JkZXIoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBwZG9tT3JkZXIoKTogKCBOb2RlIHwgbnVsbCApW10gfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0UERPTU9yZGVyKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgcGRvbSAoZm9jdXMpIG9yZGVyIGZvciB0aGlzIG5vZGUuXHJcbiAgICogSWYgdGhlcmUgaXMgYW4gZXhpc3RpbmcgYXJyYXksIHRoaXMgcmV0dXJucyBhIGNvcHkgb2YgdGhhdCBhcnJheS4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSBjbGllbnRzIG1heSB0aGVuXHJcbiAgICogbW9kaWZ5IHRoZSBhcnJheSwgYW5kIGNhbGwgc2V0UERPTU9yZGVyIC0gd2hpY2ggaXMgYSBuby1vcCB1bmxlc3MgdGhlIGFycmF5IHJlZmVyZW5jZSBpcyBkaWZmZXJlbnQuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFBET01PcmRlcigpOiAoIE5vZGUgfCBudWxsIClbXSB8IG51bGwge1xyXG4gICAgaWYgKCB0aGlzLl9wZG9tT3JkZXIgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9wZG9tT3JkZXIuc2xpY2UoIDAgKTsgLy8gY3JlYXRlIGEgZGVmZW5zaXZlIGNvcHlcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLl9wZG9tT3JkZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBub2RlIGhhcyBhbiBwZG9tT3JkZXIgdGhhdCBpcyBlZmZlY3RpdmVseSBkaWZmZXJlbnQgdGhhbiB0aGUgZGVmYXVsdC5cclxuICAgKlxyXG4gICAqIE5PVEU6IGBudWxsYCwgYFtdYCBhbmQgYFtudWxsXWAgYXJlIGFsbCBlZmZlY3RpdmVseSB0aGUgc2FtZSB0aGluZywgc28gdGhpcyB3aWxsIHJldHVybiB0cnVlIGZvciBhbnkgb2ZcclxuICAgKiB0aG9zZS4gVXNhZ2Ugb2YgYG51bGxgIGlzIHJlY29tbWVuZGVkLCBhcyBpdCBkb2Vzbid0IGNyZWF0ZSB0aGUgZXh0cmEgb2JqZWN0IHJlZmVyZW5jZSAoYnV0IHNvbWUgY29kZVxyXG4gICAqIHRoYXQgZ2VuZXJhdGVzIGFycmF5cyBtYXkgYmUgbW9yZSBjb252ZW5pZW50KS5cclxuICAgKi9cclxuICBwdWJsaWMgaGFzUERPTU9yZGVyKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3Bkb21PcmRlciAhPT0gbnVsbCAmJlxyXG4gICAgICAgICAgIHRoaXMuX3Bkb21PcmRlci5sZW5ndGggIT09IDAgJiZcclxuICAgICAgICAgICAoIHRoaXMuX3Bkb21PcmRlci5sZW5ndGggPiAxIHx8IHRoaXMuX3Bkb21PcmRlclsgMCBdICE9PSBudWxsICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIG91ciBcIlBET00gcGFyZW50XCIgaWYgYXZhaWxhYmxlOiB0aGUgbm9kZSB0aGF0IHNwZWNpZmllcyB0aGlzIG5vZGUgaW4gaXRzIHBkb21PcmRlci5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UERPTVBhcmVudCgpOiBOb2RlIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fcGRvbVBhcmVudDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgcGRvbVBhcmVudCgpOiBOb2RlIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldFBET01QYXJlbnQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBcImVmZmVjdGl2ZVwiIHBkb20gY2hpbGRyZW4gZm9yIHRoZSBub2RlICh3aGljaCBtYXkgYmUgZGlmZmVyZW50IGJhc2VkIG9uIHRoZSBvcmRlciBvciBvdGhlclxyXG4gICAqIGV4Y2x1ZGVkIHN1YnRyZWVzKS5cclxuICAgKlxyXG4gICAqIElmIHRoZXJlIGlzIG5vIHBkb21PcmRlciBzcGVjaWZpZWQsIHRoaXMgaXMgYmFzaWNhbGx5IFwiYWxsIGNoaWxkcmVuIHRoYXQgZG9uJ3QgaGF2ZSBwZG9tIHBhcmVudHNcIlxyXG4gICAqIChhIE5vZGUgaGFzIGEgXCJQRE9NIHBhcmVudFwiIGlmIGl0IGlzIHNwZWNpZmllZCBpbiBhbiBwZG9tT3JkZXIpLlxyXG4gICAqXHJcbiAgICogT3RoZXJ3aXNlIChpZiBpdCBoYXMgYW4gcGRvbU9yZGVyKSwgaXQgaXMgdGhlIHBkb21PcmRlciwgd2l0aCB0aGUgYWJvdmUgbGlzdCBvZiBub2RlcyBwbGFjZWRcclxuICAgKiBpbiBhdCB0aGUgbG9jYXRpb24gb2YgdGhlIHBsYWNlaG9sZGVyLiBJZiB0aGVyZSBpcyBubyBwbGFjZWhvbGRlciwgaXQgYWN0cyBsaWtlIGEgcGxhY2Vob2xkZXIgd2FzIHRoZSBsYXN0XHJcbiAgICogZWxlbWVudCBvZiB0aGUgcGRvbU9yZGVyIChzZWUgc2V0UERPTU9yZGVyIGZvciBtb3JlIGRvY3VtZW50YXRpb24gaW5mb3JtYXRpb24pLlxyXG4gICAqXHJcbiAgICogTk9URTogSWYgeW91IHNwZWNpZnkgYSBjaGlsZCBpbiB0aGUgcGRvbU9yZGVyLCBpdCB3aWxsIE5PVCBiZSBkb3VibGUtaW5jbHVkZWQgKHNpbmNlIGl0IHdpbGwgaGF2ZSBhblxyXG4gICAqIFBET00gcGFyZW50KS5cclxuICAgKlxyXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRFZmZlY3RpdmVDaGlsZHJlbigpOiBOb2RlW10ge1xyXG4gICAgLy8gRmluZCBhbGwgY2hpbGRyZW4gd2l0aG91dCBQRE9NIHBhcmVudHMuXHJcbiAgICBjb25zdCBub25PcmRlcmVkQ2hpbGRyZW4gPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8ICggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKS5fY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGNoaWxkID0gKCB0aGlzIGFzIHVua25vd24gYXMgTm9kZSApLl9jaGlsZHJlblsgaSBdO1xyXG5cclxuICAgICAgaWYgKCAhY2hpbGQuX3Bkb21QYXJlbnQgKSB7XHJcbiAgICAgICAgbm9uT3JkZXJlZENoaWxkcmVuLnB1c2goIGNoaWxkICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBPdmVycmlkZSB0aGUgb3JkZXIsIGFuZCByZXBsYWNlIHRoZSBwbGFjZWhvbGRlciBpZiBpdCBleGlzdHMuXHJcbiAgICBpZiAoIHRoaXMuaGFzUERPTU9yZGVyKCkgKSB7XHJcbiAgICAgIGNvbnN0IGVmZmVjdGl2ZUNoaWxkcmVuID0gdGhpcy5wZG9tT3JkZXIhLnNsaWNlKCk7XHJcblxyXG4gICAgICBjb25zdCBwbGFjZWhvbGRlckluZGV4ID0gZWZmZWN0aXZlQ2hpbGRyZW4uaW5kZXhPZiggbnVsbCApO1xyXG5cclxuICAgICAgLy8gSWYgd2UgaGF2ZSBhIHBsYWNlaG9sZGVyLCByZXBsYWNlIGl0cyBjb250ZW50IHdpdGggdGhlIGNoaWxkcmVuXHJcbiAgICAgIGlmICggcGxhY2Vob2xkZXJJbmRleCA+PSAwICkge1xyXG4gICAgICAgIC8vIGZvciBlZmZpY2llbmN5XHJcbiAgICAgICAgbm9uT3JkZXJlZENoaWxkcmVuLnVuc2hpZnQoIHBsYWNlaG9sZGVySW5kZXgsIDEgKTtcclxuXHJcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFRPRE86IGJlc3Qgd2F5IHRvIHR5cGU/XHJcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseSggZWZmZWN0aXZlQ2hpbGRyZW4sIG5vbk9yZGVyZWRDaGlsZHJlbiApO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIE90aGVyd2lzZSwganVzdCBhZGQgdGhlIG5vcm1hbCB0aGluZ3MgYXQgdGhlIGVuZFxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSggZWZmZWN0aXZlQ2hpbGRyZW4sIG5vbk9yZGVyZWRDaGlsZHJlbiApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gZWZmZWN0aXZlQ2hpbGRyZW4gYXMgTm9kZVtdO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBub25PcmRlcmVkQ2hpbGRyZW47XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIaWRlIGNvbXBsZXRlbHkgZnJvbSBhIHNjcmVlbiByZWFkZXIgYW5kIHRoZSBicm93c2VyIGJ5IHNldHRpbmcgdGhlIGhpZGRlbiBhdHRyaWJ1dGUgb24gdGhlIG5vZGUnc1xyXG4gICAqIHJlcHJlc2VudGF0aXZlIERPTSBlbGVtZW50LiBJZiB0aGUgc2libGluZyBET00gRWxlbWVudHMgaGF2ZSBhIGNvbnRhaW5lciBwYXJlbnQsIHRoZSBjb250YWluZXJcclxuICAgKiBzaG91bGQgYmUgaGlkZGVuIHNvIHRoYXQgYWxsIFBET00gZWxlbWVudHMgYXJlIGhpZGRlbiBhcyB3ZWxsLiAgSGlkaW5nIHRoZSBlbGVtZW50IHdpbGwgcmVtb3ZlIGl0IGZyb20gdGhlIGZvY3VzXHJcbiAgICogb3JkZXIuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFBET01WaXNpYmxlKCB2aXNpYmxlOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLl9wZG9tVmlzaWJsZSAhPT0gdmlzaWJsZSApIHtcclxuICAgICAgdGhpcy5fcGRvbVZpc2libGUgPSB2aXNpYmxlO1xyXG5cclxuICAgICAgdGhpcy5fcGRvbURpc3BsYXlzSW5mby5vblBET01WaXNpYmlsaXR5Q2hhbmdlKCB2aXNpYmxlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHBkb21WaXNpYmxlKCB2aXNpYmxlOiBib29sZWFuICkgeyB0aGlzLnNldFBET01WaXNpYmxlKCB2aXNpYmxlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBwZG9tVmlzaWJsZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuaXNQRE9NVmlzaWJsZSgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB3aGV0aGVyIG9yIG5vdCB0aGlzIG5vZGUncyByZXByZXNlbnRhdGl2ZSBET00gZWxlbWVudCBpcyB2aXNpYmxlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc1BET01WaXNpYmxlKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3Bkb21WaXNpYmxlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIGFueSBvZiB0aGUgUERPTUluc3RhbmNlcyBmb3IgdGhlIE5vZGUgYXJlIGdsb2JhbGx5IHZpc2libGUgYW5kIGRpc3BsYXllZCBpbiB0aGUgUERPTS4gQVxyXG4gICAqIFBET01JbnN0YW5jZSBpcyBnbG9iYWxseSB2aXNpYmxlIGlmIE5vZGUgYW5kIGFsbCBhbmNlc3RvcnMgYXJlIHBkb21WaXNpYmxlLiBQRE9NSW5zdGFuY2UgdmlzaWJpbGl0eSBpc1xyXG4gICAqIHVwZGF0ZWQgc3luY2hyb25vdXNseSwgc28gdGhpcyByZXR1cm5zIHRoZSBtb3N0IHVwLXRvLWRhdGUgaW5mb3JtYXRpb24gd2l0aG91dCByZXF1aXJpbmcgRGlzcGxheS51cGRhdGVEaXNwbGF5XHJcbiAgICovXHJcbiAgcHVibGljIGlzUERPTURpc3BsYXllZCgpOiBib29sZWFuIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX3Bkb21JbnN0YW5jZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGlmICggdGhpcy5fcGRvbUluc3RhbmNlc1sgaSBdLmlzR2xvYmFsbHlWaXNpYmxlKCkgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgcGRvbURpc3BsYXllZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuaXNQRE9NRGlzcGxheWVkKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSB2YWx1ZSBvZiBhbiBpbnB1dCBlbGVtZW50LiAgRWxlbWVudCBtdXN0IGJlIGEgZm9ybSBlbGVtZW50IHRvIHN1cHBvcnQgdGhlIHZhbHVlIGF0dHJpYnV0ZS4gVGhlIGlucHV0XHJcbiAgICogdmFsdWUgaXMgY29udmVydGVkIHRvIHN0cmluZyBzaW5jZSBpbnB1dCB2YWx1ZXMgYXJlIGdlbmVyYWxseSBzdHJpbmcgZm9yIEhUTUwuXHJcbiAgICovXHJcbiAgcHVibGljIHNldElucHV0VmFsdWUoIHZhbHVlOiBQRE9NVmFsdWVUeXBlIHwgbnVtYmVyIHwgbnVsbCApOiB2b2lkIHtcclxuICAgIC8vIElmIGl0J3MgYSBQcm9wZXJ0eSwgd2UnbGwganVzdCBncmFiIHRoZSBpbml0aWFsIHZhbHVlLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE0NDJcclxuICAgIGlmICggdmFsdWUgaW5zdGFuY2VvZiBSZWFkT25seVByb3BlcnR5IHx8IHZhbHVlIGluc3RhbmNlb2YgVGlueVByb3BlcnR5ICkge1xyXG4gICAgICB2YWx1ZSA9IHZhbHVlLnZhbHVlO1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmFsdWUgPT09IG51bGwgfHwgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICk7XHJcbiAgICBhc3NlcnQgJiYgdGhpcy5fdGFnTmFtZSAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIEZPUk1fRUxFTUVOVFMsIHRoaXMuX3RhZ05hbWUudG9VcHBlckNhc2UoKSApLCAnZG9tIGVsZW1lbnQgbXVzdCBiZSBhIGZvcm0gZWxlbWVudCB0byBzdXBwb3J0IHZhbHVlJyApO1xyXG5cclxuICAgIC8vIHR5cGUgY2FzdFxyXG4gICAgdmFsdWUgPSBgJHt2YWx1ZX1gO1xyXG5cclxuICAgIGlmICggdmFsdWUgIT09IHRoaXMuX2lucHV0VmFsdWUgKSB7XHJcbiAgICAgIHRoaXMuX2lucHV0VmFsdWUgPSB2YWx1ZTtcclxuXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMucGRvbUluc3RhbmNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBwZWVyID0gdGhpcy5wZG9tSW5zdGFuY2VzWyBpIF0ucGVlciE7XHJcbiAgICAgICAgcGVlci5vbklucHV0VmFsdWVDaGFuZ2UoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBpbnB1dFZhbHVlKCB2YWx1ZTogUERPTVZhbHVlVHlwZSB8IG51bWJlciB8IG51bGwgKSB7IHRoaXMuc2V0SW5wdXRWYWx1ZSggdmFsdWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGlucHV0VmFsdWUoKTogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldElucHV0VmFsdWUoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHZhbHVlIG9mIHRoZSBlbGVtZW50LiBFbGVtZW50IG11c3QgYmUgYSBmb3JtIGVsZW1lbnQgdG8gc3VwcG9ydCB0aGUgdmFsdWUgYXR0cmlidXRlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRJbnB1dFZhbHVlKCk6IHN0cmluZyB8IG51bWJlciB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX2lucHV0VmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgd2hldGhlciBvciBub3QgdGhlIGNoZWNrZWQgYXR0cmlidXRlIGFwcGVhcnMgb24gdGhlIGRvbSBlbGVtZW50cyBhc3NvY2lhdGVkIHdpdGggdGhpcyBOb2RlJ3NcclxuICAgKiBwZG9tIGNvbnRlbnQuICBUaGlzIGlzIG9ubHkgdXNlZnVsIGZvciBpbnB1dHMgb2YgdHlwZSAncmFkaW8nIGFuZCAnY2hlY2tib3gnLiBBICdjaGVja2VkJyBpbnB1dFxyXG4gICAqIGlzIGNvbnNpZGVyZWQgc2VsZWN0ZWQgdG8gdGhlIGJyb3dzZXIgYW5kIGFzc2lzdGl2ZSB0ZWNobm9sb2d5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRQRE9NQ2hlY2tlZCggY2hlY2tlZDogYm9vbGVhbiApOiB2b2lkIHtcclxuXHJcbiAgICBpZiAoIHRoaXMuX3RhZ05hbWUgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3RhZ05hbWUudG9VcHBlckNhc2UoKSA9PT0gSU5QVVRfVEFHLCAnQ2Fubm90IHNldCBjaGVja2VkIG9uIGEgbm9uIGlucHV0IHRhZy4nICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIHRoaXMuX2lucHV0VHlwZSApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggSU5QVVRfVFlQRVNfVEhBVF9TVVBQT1JUX0NIRUNLRUQuaW5jbHVkZXMoIHRoaXMuX2lucHV0VHlwZS50b1VwcGVyQ2FzZSgpICksIGBpbnB1dFR5cGUgZG9lcyBub3Qgc3VwcG9ydCBjaGVja2VkOiAke3RoaXMuX2lucHV0VHlwZX1gICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLl9wZG9tQ2hlY2tlZCAhPT0gY2hlY2tlZCApIHtcclxuICAgICAgdGhpcy5fcGRvbUNoZWNrZWQgPSBjaGVja2VkO1xyXG5cclxuICAgICAgdGhpcy5zZXRQRE9NQXR0cmlidXRlKCAnY2hlY2tlZCcsIGNoZWNrZWQsIHtcclxuICAgICAgICBhc1Byb3BlcnR5OiB0cnVlXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgcGRvbUNoZWNrZWQoIGNoZWNrZWQ6IGJvb2xlYW4gKSB7IHRoaXMuc2V0UERPTUNoZWNrZWQoIGNoZWNrZWQgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHBkb21DaGVja2VkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5nZXRQRE9NQ2hlY2tlZCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB3aGV0aGVyIG9yIG5vdCB0aGUgcGRvbSBpbnB1dCBpcyAnY2hlY2tlZCcuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFBET01DaGVja2VkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3Bkb21DaGVja2VkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIHBkb20gYXR0cmlidXRlcyB0aGF0IGhhdmUgYmVlbiBhZGRlZCB0byB0aGlzIE5vZGUncyBwcmltYXJ5IHNpYmxpbmcuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFBET01BdHRyaWJ1dGVzKCk6IFBET01BdHRyaWJ1dGVbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcGRvbUF0dHJpYnV0ZXMuc2xpY2UoIDAgKTsgLy8gZGVmZW5zaXZlIGNvcHlcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgcGRvbUF0dHJpYnV0ZXMoKTogUERPTUF0dHJpYnV0ZVtdIHsgcmV0dXJuIHRoaXMuZ2V0UERPTUF0dHJpYnV0ZXMoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgYSBwYXJ0aWN1bGFyIGF0dHJpYnV0ZSBvciBwcm9wZXJ0eSBmb3IgdGhpcyBOb2RlJ3MgcHJpbWFyeSBzaWJsaW5nLCBnZW5lcmFsbHkgdG8gcHJvdmlkZSBleHRyYSBzZW1hbnRpYyBpbmZvcm1hdGlvbiBmb3JcclxuICAgKiBhIHNjcmVlbiByZWFkZXIuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYXR0cmlidXRlIC0gc3RyaW5nIG5hbWluZyB0aGUgYXR0cmlidXRlXHJcbiAgICogQHBhcmFtIHZhbHVlIC0gdGhlIHZhbHVlIGZvciB0aGUgYXR0cmlidXRlLCBpZiBib29sZWFuLCB0aGVuIGl0IHdpbGwgYmUgc2V0IGFzIGEgamF2YXNjcmlwdCBwcm9wZXJ0eSBvbiB0aGUgSFRNTEVsZW1lbnQgcmF0aGVyIHRoYW4gYW4gYXR0cmlidXRlXHJcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXHJcbiAgICovXHJcbiAgcHVibGljIHNldFBET01BdHRyaWJ1dGUoIGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogUERPTVZhbHVlVHlwZSB8IGJvb2xlYW4gfCBudW1iZXIsIHByb3ZpZGVkT3B0aW9ucz86IFNldFBET01BdHRyaWJ1dGVPcHRpb25zICk6IHZvaWQge1xyXG4gICAgaWYgKCAhKCB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICkgKSB7XHJcbiAgICAgIHZhbHVlID0gdW53cmFwUHJvcGVydHkoIHZhbHVlICkhO1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydCAmJiBwcm92aWRlZE9wdGlvbnMgJiYgYXNzZXJ0KCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIHByb3ZpZGVkT3B0aW9ucyApID09PSBPYmplY3QucHJvdG90eXBlLFxyXG4gICAgICAnRXh0cmEgcHJvdG90eXBlIG9uIHBkb21BdHRyaWJ1dGUgb3B0aW9ucyBvYmplY3QgaXMgYSBjb2RlIHNtZWxsJyApO1xyXG4gICAgYXNzZXJ0ICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsaWRhdGUoIHZhbHVlLCBWYWxpZGF0aW9uLlNUUklOR19XSVRIT1VUX1RFTVBMQVRFX1ZBUlNfVkFMSURBVE9SICk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTZXRQRE9NQXR0cmlidXRlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8ge3N0cmluZ3xudWxsfSAtIElmIG5vbi1udWxsLCB3aWxsIHNldCB0aGUgYXR0cmlidXRlIHdpdGggdGhlIHNwZWNpZmllZCBuYW1lc3BhY2UuIFRoaXMgY2FuIGJlIHJlcXVpcmVkXHJcbiAgICAgIC8vIGZvciBzZXR0aW5nIGNlcnRhaW4gYXR0cmlidXRlcyAoZS5nLiBNYXRoTUwpLlxyXG4gICAgICBuYW1lc3BhY2U6IG51bGwsXHJcblxyXG4gICAgICAvLyBzZXQgdGhlIFwiYXR0cmlidXRlXCIgYXMgYSBqYXZhc2NyaXB0IHByb3BlcnR5IG9uIHRoZSBET01FbGVtZW50IGluc3RlYWRcclxuICAgICAgYXNQcm9wZXJ0eTogZmFsc2UsXHJcblxyXG4gICAgICBlbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HIC8vIHNlZSBQRE9NUGVlci5nZXRFbGVtZW50TmFtZSgpIGZvciB2YWxpZCB2YWx1ZXMsIGRlZmF1bHQgdG8gdGhlIHByaW1hcnkgc2libGluZ1xyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIUFTU09DSUFUSU9OX0FUVFJJQlVURVMuaW5jbHVkZXMoIGF0dHJpYnV0ZSApLCAnc2V0UERPTUF0dHJpYnV0ZSBkb2VzIG5vdCBzdXBwb3J0IGFzc29jaWF0aW9uIGF0dHJpYnV0ZXMnICk7XHJcblxyXG4gICAgLy8gaWYgdGhlIHBkb20gYXR0cmlidXRlIGFscmVhZHkgZXhpc3RzIGluIHRoZSBsaXN0LCByZW1vdmUgaXQgLSBubyBuZWVkXHJcbiAgICAvLyB0byByZW1vdmUgZnJvbSB0aGUgcGVlcnMsIGV4aXN0aW5nIGF0dHJpYnV0ZXMgd2lsbCBzaW1wbHkgYmUgcmVwbGFjZWQgaW4gdGhlIERPTVxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcGRvbUF0dHJpYnV0ZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRBdHRyaWJ1dGUgPSB0aGlzLl9wZG9tQXR0cmlidXRlc1sgaSBdO1xyXG4gICAgICBpZiAoIGN1cnJlbnRBdHRyaWJ1dGUuYXR0cmlidXRlID09PSBhdHRyaWJ1dGUgJiZcclxuICAgICAgICAgICBjdXJyZW50QXR0cmlidXRlLm9wdGlvbnMubmFtZXNwYWNlID09PSBvcHRpb25zLm5hbWVzcGFjZSAmJlxyXG4gICAgICAgICAgIGN1cnJlbnRBdHRyaWJ1dGUub3B0aW9ucy5lbGVtZW50TmFtZSA9PT0gb3B0aW9ucy5lbGVtZW50TmFtZSApIHtcclxuXHJcbiAgICAgICAgaWYgKCBjdXJyZW50QXR0cmlidXRlLm9wdGlvbnMuYXNQcm9wZXJ0eSA9PT0gb3B0aW9ucy5hc1Byb3BlcnR5ICkge1xyXG4gICAgICAgICAgdGhpcy5fcGRvbUF0dHJpYnV0ZXMuc3BsaWNlKCBpLCAxICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIFN3YXBwaW5nIGFzUHJvcGVydHkgc2V0dGluZyBzdHJhdGVnaWVzIHNob3VsZCByZW1vdmUgdGhlIGF0dHJpYnV0ZSBzbyBpdCBjYW4gYmUgc2V0IGFzIGEgcHJvcGVydHkuXHJcbiAgICAgICAgICB0aGlzLnJlbW92ZVBET01BdHRyaWJ1dGUoIGN1cnJlbnRBdHRyaWJ1dGUuYXR0cmlidXRlLCBjdXJyZW50QXR0cmlidXRlLm9wdGlvbnMgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9wZG9tQXR0cmlidXRlcy5wdXNoKCB7XHJcbiAgICAgIGF0dHJpYnV0ZTogYXR0cmlidXRlLFxyXG4gICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnNcclxuICAgIH0gYXMgUERPTUF0dHJpYnV0ZSApO1xyXG5cclxuICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMuX3Bkb21JbnN0YW5jZXMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLl9wZG9tSW5zdGFuY2VzWyBqIF0ucGVlciE7XHJcbiAgICAgIHBlZXIuc2V0QXR0cmlidXRlVG9FbGVtZW50KCBhdHRyaWJ1dGUsIHZhbHVlLCBvcHRpb25zICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYSBwYXJ0aWN1bGFyIGF0dHJpYnV0ZSwgcmVtb3ZpbmcgdGhlIGFzc29jaWF0ZWQgc2VtYW50aWMgaW5mb3JtYXRpb24gZnJvbSB0aGUgRE9NIGVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBJdCBpcyBISUdITFkgcmVjb21tZW5kZWQgdGhhdCB5b3UgbmV2ZXIgY2FsbCB0aGlzIGZ1bmN0aW9uIGZyb20gYW4gYXR0cmlidXRlIHNldCB3aXRoIGBhc1Byb3BlcnR5OnRydWVgLCBzZWVcclxuICAgKiBzZXRQRE9NQXR0cmlidXRlIGZvciB0aGUgb3B0aW9uIGRldGFpbHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYXR0cmlidXRlIC0gbmFtZSBvZiB0aGUgYXR0cmlidXRlIHRvIHJlbW92ZVxyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVQRE9NQXR0cmlidXRlKCBhdHRyaWJ1dGU6IHN0cmluZywgcHJvdmlkZWRPcHRpb25zPzogUmVtb3ZlUERPTUF0dHJpYnV0ZU9wdGlvbnMgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgcHJvdmlkZWRPcHRpb25zICYmIGFzc2VydCggT2JqZWN0LmdldFByb3RvdHlwZU9mKCBwcm92aWRlZE9wdGlvbnMgKSA9PT0gT2JqZWN0LnByb3RvdHlwZSxcclxuICAgICAgJ0V4dHJhIHByb3RvdHlwZSBvbiBwZG9tQXR0cmlidXRlIG9wdGlvbnMgb2JqZWN0IGlzIGEgY29kZSBzbWVsbCcgKTtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFJlbW92ZVBET01BdHRyaWJ1dGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyB7c3RyaW5nfG51bGx9IC0gSWYgbm9uLW51bGwsIHdpbGwgcmVtb3ZlIHRoZSBhdHRyaWJ1dGUgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWVzcGFjZS4gVGhpcyBjYW4gYmUgcmVxdWlyZWRcclxuICAgICAgLy8gZm9yIHJlbW92aW5nIGNlcnRhaW4gYXR0cmlidXRlcyAoZS5nLiBNYXRoTUwpLlxyXG4gICAgICBuYW1lc3BhY2U6IG51bGwsXHJcblxyXG4gICAgICBlbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HIC8vIHNlZSBQRE9NUGVlci5nZXRFbGVtZW50TmFtZSgpIGZvciB2YWxpZCB2YWx1ZXMsIGRlZmF1bHQgdG8gdGhlIHByaW1hcnkgc2libGluZ1xyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgbGV0IGF0dHJpYnV0ZVJlbW92ZWQgPSBmYWxzZTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX3Bkb21BdHRyaWJ1dGVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIHRoaXMuX3Bkb21BdHRyaWJ1dGVzWyBpIF0uYXR0cmlidXRlID09PSBhdHRyaWJ1dGUgJiZcclxuICAgICAgICAgICB0aGlzLl9wZG9tQXR0cmlidXRlc1sgaSBdLm9wdGlvbnMubmFtZXNwYWNlID09PSBvcHRpb25zLm5hbWVzcGFjZSAmJlxyXG4gICAgICAgICAgIHRoaXMuX3Bkb21BdHRyaWJ1dGVzWyBpIF0ub3B0aW9ucy5lbGVtZW50TmFtZSA9PT0gb3B0aW9ucy5lbGVtZW50TmFtZSApIHtcclxuICAgICAgICB0aGlzLl9wZG9tQXR0cmlidXRlcy5zcGxpY2UoIGksIDEgKTtcclxuICAgICAgICBhdHRyaWJ1dGVSZW1vdmVkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYXR0cmlidXRlUmVtb3ZlZCwgYE5vZGUgZG9lcyBub3QgaGF2ZSBwZG9tIGF0dHJpYnV0ZSAke2F0dHJpYnV0ZX1gICk7XHJcblxyXG4gICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5fcGRvbUluc3RhbmNlcy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgY29uc3QgcGVlciA9IHRoaXMuX3Bkb21JbnN0YW5jZXNbIGogXS5wZWVyITtcclxuICAgICAgcGVlci5yZW1vdmVBdHRyaWJ1dGVGcm9tRWxlbWVudCggYXR0cmlidXRlLCBvcHRpb25zICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYWxsIGF0dHJpYnV0ZXMgZnJvbSB0aGlzIG5vZGUncyBkb20gZWxlbWVudC5cclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlUERPTUF0dHJpYnV0ZXMoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gYWxsIGF0dHJpYnV0ZXMgY3VycmVudGx5IG9uIHRoaXMgTm9kZSdzIHByaW1hcnkgc2libGluZ1xyXG4gICAgY29uc3QgYXR0cmlidXRlcyA9IHRoaXMuZ2V0UERPTUF0dHJpYnV0ZXMoKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhdHRyaWJ1dGVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzWyBpIF0uYXR0cmlidXRlO1xyXG4gICAgICB0aGlzLnJlbW92ZVBET01BdHRyaWJ1dGUoIGF0dHJpYnV0ZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGEgcGFydGljdWxhciBhdHRyaWJ1dGUsIHJlbW92aW5nIHRoZSBhc3NvY2lhdGVkIHNlbWFudGljIGluZm9ybWF0aW9uIGZyb20gdGhlIERPTSBlbGVtZW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGF0dHJpYnV0ZSAtIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZSB0byByZW1vdmVcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgaGFzUERPTUF0dHJpYnV0ZSggYXR0cmlidXRlOiBzdHJpbmcsIHByb3ZpZGVkT3B0aW9ucz86IEhhc1BET01BdHRyaWJ1dGVPcHRpb25zICk6IGJvb2xlYW4ge1xyXG4gICAgYXNzZXJ0ICYmIHByb3ZpZGVkT3B0aW9ucyAmJiBhc3NlcnQoIE9iamVjdC5nZXRQcm90b3R5cGVPZiggcHJvdmlkZWRPcHRpb25zICkgPT09IE9iamVjdC5wcm90b3R5cGUsXHJcbiAgICAgICdFeHRyYSBwcm90b3R5cGUgb24gcGRvbUF0dHJpYnV0ZSBvcHRpb25zIG9iamVjdCBpcyBhIGNvZGUgc21lbGwnICk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxIYXNQRE9NQXR0cmlidXRlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8ge3N0cmluZ3xudWxsfSAtIElmIG5vbi1udWxsLCB3aWxsIHJlbW92ZSB0aGUgYXR0cmlidXRlIHdpdGggdGhlIHNwZWNpZmllZCBuYW1lc3BhY2UuIFRoaXMgY2FuIGJlIHJlcXVpcmVkXHJcbiAgICAgIC8vIGZvciByZW1vdmluZyBjZXJ0YWluIGF0dHJpYnV0ZXMgKGUuZy4gTWF0aE1MKS5cclxuICAgICAgbmFtZXNwYWNlOiBudWxsLFxyXG5cclxuICAgICAgZWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElORyAvLyBzZWUgUERPTVBlZXIuZ2V0RWxlbWVudE5hbWUoKSBmb3IgdmFsaWQgdmFsdWVzLCBkZWZhdWx0IHRvIHRoZSBwcmltYXJ5IHNpYmxpbmdcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGxldCBhdHRyaWJ1dGVGb3VuZCA9IGZhbHNlO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcGRvbUF0dHJpYnV0ZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGlmICggdGhpcy5fcGRvbUF0dHJpYnV0ZXNbIGkgXS5hdHRyaWJ1dGUgPT09IGF0dHJpYnV0ZSAmJlxyXG4gICAgICAgICAgIHRoaXMuX3Bkb21BdHRyaWJ1dGVzWyBpIF0ub3B0aW9ucy5uYW1lc3BhY2UgPT09IG9wdGlvbnMubmFtZXNwYWNlICYmXHJcbiAgICAgICAgICAgdGhpcy5fcGRvbUF0dHJpYnV0ZXNbIGkgXS5vcHRpb25zLmVsZW1lbnROYW1lID09PSBvcHRpb25zLmVsZW1lbnROYW1lICkge1xyXG4gICAgICAgIGF0dHJpYnV0ZUZvdW5kID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGF0dHJpYnV0ZUZvdW5kO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIHRoZSBjbGFzcyB0byB0aGUgUERPTSBlbGVtZW50J3MgY2xhc3NMaXN0LiBUaGUgUERPTSBpcyBnZW5lcmFsbHkgaW52aXNpYmxlLFxyXG4gICAqIGJ1dCBzb21lIHN0eWxpbmcgb2NjYXNpb25hbGx5IGhhcyBhbiBpbXBhY3Qgb24gc2VtYW50aWNzIHNvIGl0IGlzIG5lY2Vzc2FyeSB0byBzZXQgc3R5bGVzLlxyXG4gICAqIEFkZCBhIGNsYXNzIHdpdGggdGhpcyBmdW5jdGlvbiBhbmQgZGVmaW5lIHRoZSBzdHlsZSBpbiBzdHlsZXNoZWV0cyAobGlrZWx5IFNjZW5lcnlTdHlsZSkuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFBET01DbGFzcyggY2xhc3NOYW1lOiBzdHJpbmcsIHByb3ZpZGVkT3B0aW9ucz86IFNldFBET01DbGFzc09wdGlvbnMgKTogdm9pZCB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTZXRQRE9NQ2xhc3NPcHRpb25zPigpKCB7XHJcbiAgICAgIGVsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkdcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGlmIHdlIGFscmVhZHkgaGF2ZSB0aGUgcHJvdmlkZWQgY2xhc3NOYW1lIHNldCB0byB0aGUgc2libGluZywgZG8gbm90aGluZ1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcGRvbUNsYXNzZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRDbGFzcyA9IHRoaXMuX3Bkb21DbGFzc2VzWyBpIF07XHJcbiAgICAgIGlmICggY3VycmVudENsYXNzLmNsYXNzTmFtZSA9PT0gY2xhc3NOYW1lICYmIGN1cnJlbnRDbGFzcy5vcHRpb25zLmVsZW1lbnROYW1lID09PSBvcHRpb25zLmVsZW1lbnROYW1lICkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3Bkb21DbGFzc2VzLnB1c2goIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUsIG9wdGlvbnM6IG9wdGlvbnMgfSApO1xyXG5cclxuICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMuX3Bkb21JbnN0YW5jZXMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLl9wZG9tSW5zdGFuY2VzWyBqIF0ucGVlciE7XHJcbiAgICAgIHBlZXIuc2V0Q2xhc3NUb0VsZW1lbnQoIGNsYXNzTmFtZSwgb3B0aW9ucyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGEgY2xhc3MgZnJvbSB0aGUgY2xhc3NMaXN0IG9mIG9uZSBvZiB0aGUgZWxlbWVudHMgZm9yIHRoaXMgTm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlUERPTUNsYXNzKCBjbGFzc05hbWU6IHN0cmluZywgcHJvdmlkZWRPcHRpb25zPzogUmVtb3ZlUERPTUNsYXNzT3B0aW9ucyApOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFJlbW92ZVBET01DbGFzc09wdGlvbnM+KCkoIHtcclxuICAgICAgZWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElORyAvLyBzZWUgUERPTVBlZXIuZ2V0RWxlbWVudE5hbWUoKSBmb3IgdmFsaWQgdmFsdWVzLCBkZWZhdWx0IHRvIHRoZSBwcmltYXJ5IHNpYmxpbmdcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGxldCBjbGFzc1JlbW92ZWQgPSBmYWxzZTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX3Bkb21DbGFzc2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIHRoaXMuX3Bkb21DbGFzc2VzWyBpIF0uY2xhc3NOYW1lID09PSBjbGFzc05hbWUgJiZcclxuICAgICAgICAgICB0aGlzLl9wZG9tQ2xhc3Nlc1sgaSBdLm9wdGlvbnMuZWxlbWVudE5hbWUgPT09IG9wdGlvbnMuZWxlbWVudE5hbWUgKSB7XHJcbiAgICAgICAgdGhpcy5fcGRvbUNsYXNzZXMuc3BsaWNlKCBpLCAxICk7XHJcbiAgICAgICAgY2xhc3NSZW1vdmVkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2xhc3NSZW1vdmVkLCBgTm9kZSBkb2VzIG5vdCBoYXZlIHBkb20gYXR0cmlidXRlICR7Y2xhc3NOYW1lfWAgKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLl9wZG9tQ2xhc3Nlcy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgY29uc3QgcGVlciA9IHRoaXMucGRvbUluc3RhbmNlc1sgaiBdLnBlZXIhO1xyXG4gICAgICBwZWVyLnJlbW92ZUNsYXNzRnJvbUVsZW1lbnQoIGNsYXNzTmFtZSwgb3B0aW9ucyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBsaXN0IG9mIGNsYXNzZXMgYXNzaWduZWQgdG8gUERPTSBlbGVtZW50cyBmb3IgdGhpcyBOb2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRQRE9NQ2xhc3NlcygpOiBQRE9NQ2xhc3NbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcGRvbUNsYXNzZXMuc2xpY2UoIDAgKTsgLy8gZGVmZW5zaXZlIGNvcHlcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgcGRvbUNsYXNzZXMoKTogUERPTUNsYXNzW10geyByZXR1cm4gdGhpcy5nZXRQRE9NQ2xhc3NlcygpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1ha2UgdGhlIERPTSBlbGVtZW50IGV4cGxpY2l0bHkgZm9jdXNhYmxlIHdpdGggYSB0YWIgaW5kZXguIE5hdGl2ZSBIVE1MIGZvcm0gZWxlbWVudHMgd2lsbCBnZW5lcmFsbHkgYmUgaW5cclxuICAgKiB0aGUgbmF2aWdhdGlvbiBvcmRlciB3aXRob3V0IGV4cGxpY2l0bHkgc2V0dGluZyBmb2N1c2FibGUuICBJZiB0aGVzZSBuZWVkIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGUgbmF2aWdhdGlvblxyXG4gICAqIG9yZGVyLCBjYWxsIHNldEZvY3VzYWJsZSggZmFsc2UgKS4gIFJlbW92aW5nIGFuIGVsZW1lbnQgZnJvbSB0aGUgZm9jdXMgb3JkZXIgZG9lcyBub3QgaGlkZSB0aGUgZWxlbWVudCBmcm9tXHJcbiAgICogYXNzaXN0aXZlIHRlY2hub2xvZ3kuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZm9jdXNhYmxlIC0gbnVsbCB0byB1c2UgdGhlIGRlZmF1bHQgYnJvd3NlciBmb2N1cyBmb3IgdGhlIHByaW1hcnkgZWxlbWVudFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRGb2N1c2FibGUoIGZvY3VzYWJsZTogYm9vbGVhbiB8IG51bGwgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmb2N1c2FibGUgPT09IG51bGwgfHwgdHlwZW9mIGZvY3VzYWJsZSA9PT0gJ2Jvb2xlYW4nICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9mb2N1c2FibGVPdmVycmlkZSAhPT0gZm9jdXNhYmxlICkge1xyXG4gICAgICB0aGlzLl9mb2N1c2FibGVPdmVycmlkZSA9IGZvY3VzYWJsZTtcclxuXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX3Bkb21JbnN0YW5jZXMubGVuZ3RoOyBpKysgKSB7XHJcblxyXG4gICAgICAgIC8vIGFmdGVyIHRoZSBvdmVycmlkZSBpcyBzZXQsIHVwZGF0ZSB0aGUgZm9jdXNhYmlsaXR5IG9mIHRoZSBwZWVyIGJhc2VkIG9uIHRoaXMgbm9kZSdzIHZhbHVlIGZvciBmb2N1c2FibGVcclxuICAgICAgICAvLyB3aGljaCBtYXkgYmUgdHJ1ZSBvciBmYWxzZSAoYnV0IG5vdCBudWxsKVxyXG4gICAgICAgIC8vIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLmZvY3VzYWJsZSA9PT0gJ2Jvb2xlYW4nICk7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fcGRvbUluc3RhbmNlc1sgaSBdLnBlZXIsICdQZWVyIHJlcXVpcmVkIHRvIHNldCBmb2N1c2FibGUuJyApO1xyXG4gICAgICAgIHRoaXMuX3Bkb21JbnN0YW5jZXNbIGkgXS5wZWVyIS5zZXRGb2N1c2FibGUoIHRoaXMuZm9jdXNhYmxlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgZm9jdXNhYmxlKCBpc0ZvY3VzYWJsZTogYm9vbGVhbiB8IG51bGwgKSB7IHRoaXMuc2V0Rm9jdXNhYmxlKCBpc0ZvY3VzYWJsZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZm9jdXNhYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pc0ZvY3VzYWJsZSgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB3aGV0aGVyIG9yIG5vdCB0aGUgbm9kZSBpcyBmb2N1c2FibGUuIFVzZSB0aGUgZm9jdXNPdmVycmlkZSwgYW5kIHRoZW4gZGVmYXVsdCB0byBicm93c2VyIGRlZmluZWRcclxuICAgKiBmb2N1c2FibGUgZWxlbWVudHMuXHJcbiAgICovXHJcbiAgcHVibGljIGlzRm9jdXNhYmxlKCk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCB0aGlzLl9mb2N1c2FibGVPdmVycmlkZSAhPT0gbnVsbCApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2ZvY3VzYWJsZU92ZXJyaWRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIHRoZXJlIGlzbid0IGEgdGFnTmFtZSB5ZXQsIHRoZW4gdGhlcmUgaXNuJ3QgYW4gZWxlbWVudCwgc28gd2UgYXJlbid0IGZvY3VzYWJsZS4gVG8gc3VwcG9ydCBvcHRpb24gb3JkZXIuXHJcbiAgICBlbHNlIGlmICggdGhpcy5fdGFnTmFtZSA9PT0gbnVsbCApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBQRE9NVXRpbHMudGFnSXNEZWZhdWx0Rm9jdXNhYmxlKCB0aGlzLl90YWdOYW1lICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBzb3VyY2UgTm9kZSB0aGF0IGNvbnRyb2xzIHBvc2l0aW9uaW5nIG9mIHRoZSBwcmltYXJ5IHNpYmxpbmcuIFRyYW5zZm9ybXMgYWxvbmcgdGhlIHRyYWlsIHRvIHRoaXNcclxuICAgKiBub2RlIGFyZSBvYnNlcnZlZCBzbyB0aGF0IHRoZSBwcmltYXJ5IHNpYmxpbmcgaXMgcG9zaXRpb25lZCBjb3JyZWN0bHkgaW4gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lLlxyXG4gICAqXHJcbiAgICogVGhlIHRyYW5zZm9ybVNvdXJjZU5vZGUgY2Fubm90IHVzZSBEQUcgZm9yIG5vdyBiZWNhdXNlIHdlIG5lZWQgYSB1bmlxdWUgdHJhaWwgdG8gb2JzZXJ2ZSB0cmFuc2Zvcm1zLlxyXG4gICAqXHJcbiAgICogQnkgZGVmYXVsdCwgdHJhbnNmb3JtcyBhbG9uZyB0cmFpbHMgdG8gYWxsIG9mIHRoaXMgTm9kZSdzIFBET01JbnN0YW5jZXMgYXJlIG9ic2VydmVkLiBCdXQgdGhpc1xyXG4gICAqIGZ1bmN0aW9uIGNhbiBiZSB1c2VkIGlmIHlvdSBoYXZlIGEgdmlzdWFsIE5vZGUgcmVwcmVzZW50ZWQgaW4gdGhlIFBET00gYnkgYSBkaWZmZXJlbnQgTm9kZSBpbiB0aGUgc2NlbmVcclxuICAgKiBncmFwaCBidXQgc3RpbGwgbmVlZCB0aGUgb3RoZXIgTm9kZSdzIFBET00gY29udGVudCBwb3NpdGlvbmVkIG92ZXIgdGhlIHZpc3VhbCBub2RlLiBGb3IgZXhhbXBsZSwgdGhpcyBjb3VsZFxyXG4gICAqIGJlIHJlcXVpcmVkIHRvIGNhdGNoIGFsbCBmYWtlIHBvaW50ZXIgZXZlbnRzIHRoYXQgbWF5IGNvbWUgZnJvbSBjZXJ0YWluIHR5cGVzIG9mIHNjcmVlbiByZWFkZXJzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRQRE9NVHJhbnNmb3JtU291cmNlTm9kZSggbm9kZTogTm9kZSB8IG51bGwgKTogdm9pZCB7XHJcbiAgICB0aGlzLl9wZG9tVHJhbnNmb3JtU291cmNlTm9kZSA9IG5vZGU7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcGRvbUluc3RhbmNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdGhpcy5fcGRvbUluc3RhbmNlc1sgaSBdLnBlZXIhLnNldFBET01UcmFuc2Zvcm1Tb3VyY2VOb2RlKCB0aGlzLl9wZG9tVHJhbnNmb3JtU291cmNlTm9kZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBwZG9tVHJhbnNmb3JtU291cmNlTm9kZSggbm9kZTogTm9kZSB8IG51bGwgKSB7IHRoaXMuc2V0UERPTVRyYW5zZm9ybVNvdXJjZU5vZGUoIG5vZGUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHBkb21UcmFuc2Zvcm1Tb3VyY2VOb2RlKCk6IE5vZGUgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0UERPTVRyYW5zZm9ybVNvdXJjZU5vZGUoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHNvdXJjZSBOb2RlIHRoYXQgY29udHJvbHMgcG9zaXRpb25pbmcgb2YgdGhlIHByaW1hcnkgc2libGluZyBpbiB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUuIFNlZVxyXG4gICAqIHNldFBET01UcmFuc2Zvcm1Tb3VyY2VOb2RlIGZvciBtb3JlIGluIGRlcHRoIGluZm9ybWF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRQRE9NVHJhbnNmb3JtU291cmNlTm9kZSgpOiBOb2RlIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fcGRvbVRyYW5zZm9ybVNvdXJjZU5vZGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHdoZXRoZXIgdGhlIFBET00gc2libGluZyBlbGVtZW50cyBhcmUgcG9zaXRpb25lZCBpbiB0aGUgY29ycmVjdCBwbGFjZSBpbiB0aGUgdmlld3BvcnQuIERvaW5nIHNvIGlzIGFcclxuICAgKiByZXF1aXJlbWVudCBmb3IgY3VzdG9tIGdlc3R1cmVzIG9uIHRvdWNoIGJhc2VkIHNjcmVlbiByZWFkZXJzLiBIb3dldmVyLCBkb2luZyB0aGlzIERPTSBsYXlvdXQgaXMgZXhwZW5zaXZlIHNvXHJcbiAgICogb25seSBkbyB0aGlzIHdoZW4gbmVjZXNzYXJ5LiBHZW5lcmFsbHkgb25seSBuZWVkZWQgZm9yIGVsZW1lbnRzIHRoYXQgdXRpbGl6ZSBhIFwiZG91YmxlIHRhcCBhbmQgaG9sZFwiIGdlc3R1cmVcclxuICAgKiB0byBkcmFnIGFuZCBkcm9wLlxyXG4gICAqXHJcbiAgICogUG9zaXRpb25pbmcgdGhlIFBET00gZWxlbWVudCB3aWxsIGNhdXNlZCBzb21lIHNjcmVlbiByZWFkZXJzIHRvIHNlbmQgYm90aCBjbGljayBhbmQgcG9pbnRlciBldmVudHMgdG8gdGhlXHJcbiAgICogbG9jYXRpb24gb2YgdGhlIE5vZGUgaW4gZ2xvYmFsIGNvb3JkaW5hdGVzLiBEbyBub3QgcG9zaXRpb24gZWxlbWVudHMgdGhhdCB1c2UgY2xpY2sgbGlzdGVuZXJzIHNpbmNlIGFjdGl2YXRpb25cclxuICAgKiB3aWxsIGZpcmUgdHdpY2UgKG9uY2UgZm9yIHRoZSBwb2ludGVyIGV2ZW50IGxpc3RlbmVycyBhbmQgb25jZSBmb3IgdGhlIGNsaWNrIGV2ZW50IGxpc3RlbmVycykuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFBvc2l0aW9uSW5QRE9NKCBwb3NpdGlvbkluUERPTTogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIHRoaXMuX3Bvc2l0aW9uSW5QRE9NID0gcG9zaXRpb25JblBET007XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcGRvbUluc3RhbmNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdGhpcy5fcGRvbUluc3RhbmNlc1sgaSBdLnBlZXIhLnNldFBvc2l0aW9uSW5QRE9NKCBwb3NpdGlvbkluUERPTSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBwb3NpdGlvbkluUERPTSggcG9zaXRpb25JblBET006IGJvb2xlYW4gKSB7IHRoaXMuc2V0UG9zaXRpb25JblBET00oIHBvc2l0aW9uSW5QRE9NICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBwb3NpdGlvbkluUERPTSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0UG9zaXRpb25JblBET00oKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHdoZXRoZXIgb3Igbm90IHdlIGFyZSBwb3NpdGlvbmluZyB0aGUgUERPTSBzaWJsaW5nIGVsZW1lbnRzLiBTZWUgc2V0UG9zaXRpb25JblBET00oKS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UG9zaXRpb25JblBET00oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fcG9zaXRpb25JblBET007XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBiZSB1c2VkIHNwYXJpbmdseSBhcyBhIHdvcmthcm91bmQuIElmIHVzZWQsIGFueSBET00gaW5wdXQgZXZlbnRzIHJlY2VpdmVkIGZyb20gdGhlIGxhYmVsXHJcbiAgICogc2libGluZyB3aWxsIG5vdCBiZSBkaXNwYXRjaGVkIGFzIFNjZW5lcnlFdmVudHMgaW4gSW5wdXQuanMuIFRoZSBsYWJlbCBzaWJsaW5nIG1heSByZWNlaXZlIGlucHV0IGJ5IHNjcmVlblxyXG4gICAqIHJlYWRlcnMgaWYgdGhlIHZpcnR1YWwgY3Vyc29yIGlzIG92ZXIgaXQuIFRoYXQgaXMgdXN1YWxseSBmaW5lLCBidXQgdGhlcmUgaXMgYSBidWcgd2l0aCBOVkRBIGFuZCBGaXJlZm94IHdoZXJlXHJcbiAgICogYm90aCB0aGUgbGFiZWwgc2libGluZyBBTkQgcHJpbWFyeSBzaWJsaW5nIHJlY2VpdmUgZXZlbnRzIGluIHRoaXMgY2FzZSwgYW5kIGJvdGggYnViYmxlIHVwIHRvIHRoZSByb290IG9mIHRoZVxyXG4gICAqIFBET00sIGFuZCBzbyB3ZSB3b3VsZCBvdGhlcndpc2UgZGlzcGF0Y2ggdHdvIFNjZW5lcnlFdmVudHMgaW5zdGVhZCBvZiBvbmUuXHJcbiAgICpcclxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ExMXktcmVzZWFyY2gvaXNzdWVzLzE1NiBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0RXhjbHVkZUxhYmVsU2libGluZ0Zyb21JbnB1dCgpOiB2b2lkIHtcclxuICAgIHRoaXMuZXhjbHVkZUxhYmVsU2libGluZ0Zyb21JbnB1dCA9IHRydWU7XHJcbiAgICB0aGlzLm9uUERPTUNvbnRlbnRDaGFuZ2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybiB0cnVlIGlmIHRoaXMgTm9kZSBpcyBhIFBoRVQtaU8gYXJjaGV0eXBlIG9yIGl0IGlzIGEgTm9kZSBkZXNjZW5kYW50IG9mIGEgUGhFVC1pTyBhcmNoZXR5cGUuXHJcbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvODE3XHJcbiAgICovXHJcbiAgcHVibGljIGlzSW5zaWRlUGhldGlvQXJjaGV0eXBlKCBub2RlOiBOb2RlID0gKCB0aGlzIGFzIHVua25vd24gYXMgTm9kZSApICk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCBub2RlLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XHJcbiAgICAgIHJldHVybiBub2RlLnBoZXRpb0lzQXJjaGV0eXBlO1xyXG4gICAgfVxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbm9kZS5wYXJlbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIHRoaXMuaXNJbnNpZGVQaGV0aW9BcmNoZXR5cGUoIG5vZGUucGFyZW50c1sgaSBdICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFsZXJ0IG9uIGFsbCBpbnRlcmFjdGl2ZSBkZXNjcmlwdGlvbiB1dHRlcmFuY2VRdWV1ZXMgbG9jYXRlZCBvbiBlYWNoIGNvbm5lY3RlZCBEaXNwbGF5LiBTZWVcclxuICAgKiBOb2RlLmdldENvbm5lY3RlZERpc3BsYXlzLiBOb3RlIHRoYXQgaWYgeW91ciBOb2RlIGlzIG5vdCBjb25uZWN0ZWQgdG8gYSBEaXNwbGF5LCB0aGlzIGZ1bmN0aW9uIHdpbGwgaGF2ZVxyXG4gICAqIG5vIGVmZmVjdC5cclxuICAgKi9cclxuICBwdWJsaWMgYWxlcnREZXNjcmlwdGlvblV0dGVyYW5jZSggdXR0ZXJhbmNlOiBUQWxlcnRhYmxlICk6IHZvaWQge1xyXG5cclxuICAgIC8vIE5vIGRlc2NyaXB0aW9uIHNob3VsZCBiZSBhbGVydGVkIGlmIHNldHRpbmcgUGhFVC1pTyBzdGF0ZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMzk3XHJcbiAgICBpZiAoIF8uaGFzSW4oIHdpbmRvdywgJ3BoZXQucGhldGlvLnBoZXRpb0VuZ2luZS5waGV0aW9TdGF0ZUVuZ2luZScgKSAmJlxyXG4gICAgICAgICBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUucGhldGlvU3RhdGVFbmdpbmUuaXNTZXR0aW5nU3RhdGVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE5vIGRlc2NyaXB0aW9uIHNob3VsZCBiZSBhbGVydGVkIGlmIGFuIGFyY2hldHlwZSBvZiBhIFBoRVQtaU8gZHluYW1pYyBlbGVtZW50LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy84MTdcclxuICAgIGlmICggVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCAmJiB0aGlzLmlzSW5zaWRlUGhldGlvQXJjaGV0eXBlKCkgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb25uZWN0ZWREaXNwbGF5cyA9ICggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKS5nZXRDb25uZWN0ZWREaXNwbGF5cygpO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY29ubmVjdGVkRGlzcGxheXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGRpc3BsYXkgPSBjb25uZWN0ZWREaXNwbGF5c1sgaSBdO1xyXG4gICAgICBpZiAoIGRpc3BsYXkuaXNBY2Nlc3NpYmxlKCkgKSB7XHJcblxyXG4gICAgICAgIC8vIERvbid0IHVzZSBgZm9yRWFjaFV0dGVyYW5jZWAgdG8gcHJldmVudCBjcmVhdGluZyBhIGNsb3N1cmUgZm9yIGVhY2ggdXNhZ2Ugb2YgdGhpcyBmdW5jdGlvblxyXG4gICAgICAgIGRpc3BsYXkuZGVzY3JpcHRpb25VdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHV0dGVyYW5jZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBseSBhIGNhbGxiYWNrIG9uIGVhY2ggdXR0ZXJhbmNlUXVldWUgdGhhdCB0aGlzIE5vZGUgaGFzIGEgY29ubmVjdGlvbiB0byAodmlhIERpc3BsYXkpLiBOb3RlIHRoYXQgb25seVxyXG4gICAqIGFjY2Vzc2libGUgRGlzcGxheXMgaGF2ZSB1dHRlcmFuY2VRdWV1ZXMgdGhhdCB0aGlzIGZ1bmN0aW9uIHdpbGwgaW50ZXJmYWNlIHdpdGguXHJcbiAgICovXHJcbiAgcHVibGljIGZvckVhY2hVdHRlcmFuY2VRdWV1ZSggY2FsbGJhY2s6ICggcXVldWU6IFV0dGVyYW5jZVF1ZXVlICkgPT4gdm9pZCApOiB2b2lkIHtcclxuICAgIGNvbnN0IGNvbm5lY3RlZERpc3BsYXlzID0gKCB0aGlzIGFzIHVua25vd24gYXMgTm9kZSApLmdldENvbm5lY3RlZERpc3BsYXlzKCk7XHJcblxyXG4gICAgLy8gSWYgeW91IHJ1biBpbnRvIHRoaXMgYXNzZXJ0aW9uLCB0YWxrIHRvIEBqZXNzZWdyZWVuYmVyZyBhbmQgQHplcHVtcGgsIGJlY2F1c2UgaXQgaXMgcXVpdGUgcG9zc2libGUgd2Ugd291bGRcclxuICAgIC8vIHJlbW92ZSB0aGlzIGFzc2VydGlvbiBmb3IgeW91ciBjYXNlLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29ubmVjdGVkRGlzcGxheXMubGVuZ3RoID4gMCxcclxuICAgICAgJ211c3QgYmUgY29ubmVjdGVkIHRvIGEgZGlzcGxheSB0byB1c2UgVXR0ZXJhbmNlUXVldWUgZmVhdHVyZXMnICk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY29ubmVjdGVkRGlzcGxheXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGRpc3BsYXkgPSBjb25uZWN0ZWREaXNwbGF5c1sgaSBdO1xyXG4gICAgICBpZiAoIGRpc3BsYXkuaXNBY2Nlc3NpYmxlKCkgKSB7XHJcbiAgICAgICAgY2FsbGJhY2soIGRpc3BsYXkuZGVzY3JpcHRpb25VdHRlcmFuY2VRdWV1ZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgLy8gU0NFTkVSWS1JTlRFUk5BTCBBTkQgUFJJVkFURSBNRVRIT0RTXHJcbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuICAvKipcclxuICAgKiBVc2VkIHRvIGdldCBhIGxpc3Qgb2YgYWxsIHNldHRhYmxlIG9wdGlvbnMgYW5kIHRoZWlyIGN1cnJlbnQgdmFsdWVzLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIC0ga2V5cyBhcmUgYWxsIGFjY2Vzc2liaWxpdHkgb3B0aW9uIGtleXMsIGFuZCB0aGUgdmFsdWVzIGFyZSB0aGUgdmFsdWVzIG9mIHRob3NlIHByb3BlcnRpZXNcclxuICAgKiBvbiB0aGlzIG5vZGUuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEJhc2VPcHRpb25zKCk6IFBhcmFsbGVsRE9NT3B0aW9ucyB7XHJcblxyXG4gICAgY29uc3QgY3VycmVudE9wdGlvbnM6IFBhcmFsbGVsRE9NT3B0aW9ucyA9IHt9O1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IEFDQ0VTU0lCSUxJVFlfT1BUSU9OX0tFWVMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbk5hbWUgPSBBQ0NFU1NJQklMSVRZX09QVElPTl9LRVlTWyBpIF07XHJcblxyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gTm90IHN1cmUgb2YgYSBncmVhdCB3YXkgdG8gZG8gdGhpc1xyXG4gICAgICBjdXJyZW50T3B0aW9uc1sgb3B0aW9uTmFtZSBdID0gdGhpc1sgb3B0aW9uTmFtZSBdO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjdXJyZW50T3B0aW9ucztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSByZWN1cnNpdmUgZGF0YSBzdHJ1Y3R1cmUgdGhhdCByZXByZXNlbnRzIHRoZSBuZXN0ZWQgb3JkZXJpbmcgb2YgcGRvbSBjb250ZW50IGZvciB0aGlzIE5vZGUnc1xyXG4gICAqIHN1YnRyZWUuIEVhY2ggXCJJdGVtXCIgd2lsbCBoYXZlIHRoZSB0eXBlIHsgdHJhaWw6IHtUcmFpbH0sIGNoaWxkcmVuOiB7QXJyYXkuPEl0ZW0+fSB9LCBmb3JtaW5nIGEgdHJlZS1saWtlXHJcbiAgICogc3RydWN0dXJlLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TmVzdGVkUERPTU9yZGVyKCk6IHsgdHJhaWw6IFRyYWlsOyBjaGlsZHJlbjogTm9kZVtdIH1bXSB7XHJcbiAgICBjb25zdCBjdXJyZW50VHJhaWwgPSBuZXcgVHJhaWwoIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICk7XHJcbiAgICBsZXQgcHJ1bmVTdGFjazogTm9kZVtdID0gW107IC8vIEEgbGlzdCBvZiBub2RlcyB0byBwcnVuZVxyXG5cclxuICAgIC8vIHtBcnJheS48SXRlbT59IC0gVGhlIG1haW4gcmVzdWx0IHdlIHdpbGwgYmUgcmV0dXJuaW5nLiBJdCBpcyB0aGUgdG9wLWxldmVsIGFycmF5IHdoZXJlIGNoaWxkIGl0ZW1zIHdpbGwgYmVcclxuICAgIC8vIGluc2VydGVkLlxyXG4gICAgY29uc3QgcmVzdWx0OiB7IHRyYWlsOiBUcmFpbDsgY2hpbGRyZW46IE5vZGVbXSB9W10gPSBbXTtcclxuXHJcbiAgICAvLyB7QXJyYXkuPEFycmF5LjxJdGVtPj59IEEgc3RhY2sgb2YgY2hpbGRyZW4gYXJyYXlzLCB3aGVyZSB3ZSBzaG91bGQgYmUgaW5zZXJ0aW5nIGl0ZW1zIGludG8gdGhlIHRvcCBhcnJheS5cclxuICAgIC8vIFdlIHdpbGwgc3RhcnQgb3V0IHdpdGggdGhlIHJlc3VsdCwgYW5kIGFzIG5lc3RlZCBsZXZlbHMgYXJlIGFkZGVkLCB0aGUgY2hpbGRyZW4gYXJyYXlzIG9mIHRob3NlIGl0ZW1zIHdpbGwgYmVcclxuICAgIC8vIHB1c2hlZCBhbmQgcG9wcHBlZCwgc28gdGhhdCB0aGUgdG9wIGFycmF5IG9uIHRoaXMgc3RhY2sgaXMgd2hlcmUgd2Ugc2hvdWxkIGluc2VydCBvdXIgbmV4dCBjaGlsZCBpdGVtLlxyXG4gICAgY29uc3QgbmVzdGVkQ2hpbGRTdGFjayA9IFsgcmVzdWx0IF07XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkVHJhaWxzRm9yTm9kZSggbm9kZTogTm9kZSwgb3ZlcnJpZGVQcnVuaW5nOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgICAvLyBJZiBzdWJ0cmVlcyB3ZXJlIHNwZWNpZmllZCB3aXRoIHBkb21PcmRlciwgdGhleSBzaG91bGQgYmUgc2tpcHBlZCBmcm9tIHRoZSBvcmRlcmluZyBvZiBhbmNlc3RvciBzdWJ0cmVlcyxcclxuICAgICAgLy8gb3RoZXJ3aXNlIHdlIGNvdWxkIGVuZCB1cCBoYXZpbmcgbXVsdGlwbGUgcmVmZXJlbmNlcyB0byB0aGUgc2FtZSB0cmFpbCAod2hpY2ggc2hvdWxkIGJlIGRpc2FsbG93ZWQpLlxyXG4gICAgICBsZXQgcHJ1bmVDb3VudCA9IDA7XHJcbiAgICAgIC8vIGNvdW50IHRoZSBudW1iZXIgb2YgdGltZXMgb3VyIG5vZGUgYXBwZWFycyBpbiB0aGUgcHJ1bmVTdGFja1xyXG4gICAgICBfLmVhY2goIHBydW5lU3RhY2ssIHBydW5lTm9kZSA9PiB7XHJcbiAgICAgICAgaWYgKCBub2RlID09PSBwcnVuZU5vZGUgKSB7XHJcbiAgICAgICAgICBwcnVuZUNvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBJZiBvdmVycmlkZVBydW5pbmcgaXMgc2V0LCB3ZSBpZ25vcmUgb25lIHJlZmVyZW5jZSB0byBvdXIgbm9kZSBpbiB0aGUgcHJ1bmUgc3RhY2suIElmIHRoZXJlIGFyZSB0d28gY29waWVzLFxyXG4gICAgICAvLyBob3dldmVyLCBpdCBtZWFucyBhIG5vZGUgd2FzIHNwZWNpZmllZCBpbiBhIHBkb21PcmRlciB0aGF0IGFscmVhZHkgbmVlZHMgdG8gYmUgcHJ1bmVkIChzbyB3ZSBza2lwIGl0IGluc3RlYWRcclxuICAgICAgLy8gb2YgY3JlYXRpbmcgZHVwbGljYXRlIHJlZmVyZW5jZXMgaW4gdGhlIHRyYXZlcnNhbCBvcmRlcikuXHJcbiAgICAgIGlmICggcHJ1bmVDb3VudCA+IDEgfHwgKCBwcnVuZUNvdW50ID09PSAxICYmICFvdmVycmlkZVBydW5pbmcgKSApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFB1c2hpbmcgaXRlbSBhbmQgaXRzIGNoaWxkcmVuIGFycmF5LCBpZiBoYXMgcGRvbSBjb250ZW50XHJcbiAgICAgIGlmICggbm9kZS5oYXNQRE9NQ29udGVudCApIHtcclxuICAgICAgICBjb25zdCBpdGVtID0ge1xyXG4gICAgICAgICAgdHJhaWw6IGN1cnJlbnRUcmFpbC5jb3B5KCksXHJcbiAgICAgICAgICBjaGlsZHJlbjogW11cclxuICAgICAgICB9O1xyXG4gICAgICAgIG5lc3RlZENoaWxkU3RhY2tbIG5lc3RlZENoaWxkU3RhY2subGVuZ3RoIC0gMSBdLnB1c2goIGl0ZW0gKTtcclxuICAgICAgICBuZXN0ZWRDaGlsZFN0YWNrLnB1c2goIGl0ZW0uY2hpbGRyZW4gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgYXJyYXlQRE9NT3JkZXIgPSBub2RlLl9wZG9tT3JkZXIgPT09IG51bGwgPyBbXSA6IG5vZGUuX3Bkb21PcmRlcjtcclxuXHJcbiAgICAgIC8vIHB1c2ggc3BlY2lmaWMgZm9jdXNlZCBub2RlcyB0byB0aGUgc3RhY2tcclxuICAgICAgcHJ1bmVTdGFjayA9IHBydW5lU3RhY2suY29uY2F0KCBhcnJheVBET01PcmRlciBhcyBOb2RlW10gKTtcclxuXHJcbiAgICAgIC8vIFZpc2l0aW5nIHRyYWlscyB0byBvcmRlcmVkIG5vZGVzLlxyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICAgIF8uZWFjaCggYXJyYXlQRE9NT3JkZXIsICggZGVzY2VuZGFudDogTm9kZSApID0+IHtcclxuICAgICAgICAvLyBGaW5kIGFsbCBkZXNjZW5kYW50IHJlZmVyZW5jZXMgdG8gdGhlIG5vZGUuXHJcbiAgICAgICAgLy8gTk9URTogV2UgYXJlIG5vdCByZW9yZGVyaW5nIHRyYWlscyAoZHVlIHRvIGRlc2NlbmRhbnQgY29uc3RyYWludHMpIGlmIHRoZXJlIGlzIG1vcmUgdGhhbiBvbmUgaW5zdGFuY2UgZm9yXHJcbiAgICAgICAgLy8gdGhpcyBkZXNjZW5kYW50IG5vZGUuXHJcbiAgICAgICAgXy5lYWNoKCBub2RlLmdldExlYWZUcmFpbHNUbyggZGVzY2VuZGFudCApLCBkZXNjZW5kYW50VHJhaWwgPT4ge1xyXG4gICAgICAgICAgZGVzY2VuZGFudFRyYWlsLnJlbW92ZUFuY2VzdG9yKCk7IC8vIHN0cmlwIG9mZiAnbm9kZScsIHNvIHRoYXQgd2UgaGFuZGxlIG9ubHkgY2hpbGRyZW5cclxuXHJcbiAgICAgICAgICAvLyBzYW1lIGFzIHRoZSBub3JtYWwgb3JkZXIsIGJ1dCBhZGRpbmcgYSBmdWxsIHRyYWlsIChzaW5jZSB3ZSBtYXkgYmUgcmVmZXJlbmNpbmcgYSBkZXNjZW5kYW50IG5vZGUpXHJcbiAgICAgICAgICBjdXJyZW50VHJhaWwuYWRkRGVzY2VuZGFudFRyYWlsKCBkZXNjZW5kYW50VHJhaWwgKTtcclxuICAgICAgICAgIGFkZFRyYWlsc0Zvck5vZGUoIGRlc2NlbmRhbnQsIHRydWUgKTsgLy8gJ3RydWUnIG92ZXJyaWRlcyBvbmUgcmVmZXJlbmNlIGluIHRoZSBwcnVuZSBzdGFjayAoYWRkZWQgYWJvdmUpXHJcbiAgICAgICAgICBjdXJyZW50VHJhaWwucmVtb3ZlRGVzY2VuZGFudFRyYWlsKCBkZXNjZW5kYW50VHJhaWwgKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIFZpc2l0IGV2ZXJ5dGhpbmcuIElmIHRoZXJlIGlzIGFuIHBkb21PcmRlciwgdGhvc2UgdHJhaWxzIHdlcmUgYWxyZWFkeSB2aXNpdGVkLCBhbmQgd2lsbCBiZSBleGNsdWRlZC5cclxuICAgICAgY29uc3QgbnVtQ2hpbGRyZW4gPSBub2RlLl9jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bUNoaWxkcmVuOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgY2hpbGQgPSBub2RlLl9jaGlsZHJlblsgaSBdO1xyXG5cclxuICAgICAgICBjdXJyZW50VHJhaWwuYWRkRGVzY2VuZGFudCggY2hpbGQsIGkgKTtcclxuICAgICAgICBhZGRUcmFpbHNGb3JOb2RlKCBjaGlsZCwgZmFsc2UgKTtcclxuICAgICAgICBjdXJyZW50VHJhaWwucmVtb3ZlRGVzY2VuZGFudCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBwb3AgZm9jdXNlZCBub2RlcyBmcm9tIHRoZSBzdGFjayAodGhhdCB3ZXJlIGFkZGVkIGFib3ZlKVxyXG4gICAgICBfLmVhY2goIGFycmF5UERPTU9yZGVyLCAoKSA9PiB7XHJcbiAgICAgICAgcHJ1bmVTdGFjay5wb3AoKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gUG9wcGluZyBjaGlsZHJlbiBhcnJheSBpZiBoYXMgcGRvbSBjb250ZW50XHJcbiAgICAgIGlmICggbm9kZS5oYXNQRE9NQ29udGVudCApIHtcclxuICAgICAgICBuZXN0ZWRDaGlsZFN0YWNrLnBvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYWRkVHJhaWxzRm9yTm9kZSggKCB0aGlzIGFzIHVua25vd24gYXMgTm9kZSApLCBmYWxzZSApO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBwZG9tIGNvbnRlbnQgZm9yIGEgTm9kZS4gU2VlIGNvbnN0cnVjdG9yIGZvciBtb3JlIGluZm9ybWF0aW9uLiBOb3QgcGFydCBvZiB0aGUgUGFyYWxsZWxET01cclxuICAgKiBBUEkgKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvblBET01Db250ZW50Q2hhbmdlKCk6IHZvaWQge1xyXG5cclxuICAgIFBET01UcmVlLnBkb21Db250ZW50Q2hhbmdlKCB0aGlzIGFzIHVua25vd24gYXMgTm9kZSApO1xyXG5cclxuICAgIC8vIHJlY29tcHV0ZSB0aGUgaGVhZGluZyBsZXZlbCBmb3IgdGhpcyBub2RlIGlmIGl0IGlzIHVzaW5nIHRoZSBwZG9tSGVhZGluZyBBUEkuXHJcbiAgICB0aGlzLl9wZG9tSGVhZGluZyAmJiB0aGlzLmNvbXB1dGVIZWFkaW5nTGV2ZWwoKTtcclxuXHJcbiAgICAoIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICkucmVuZGVyZXJTdW1tYXJ5UmVmcmVzaEVtaXR0ZXIuZW1pdCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGlzIE5vZGUgaGFzIGFueSByZXByZXNlbnRhdGlvbiBmb3IgdGhlIFBhcmFsbGVsIERPTS5cclxuICAgKiBOb3RlIHRoaXMgaXMgc3RpbGwgdHJ1ZSBpZiB0aGUgY29udGVudCBpcyBwZG9tVmlzaWJsZT1mYWxzZSBvciBpcyBvdGhlcndpc2UgaGlkZGVuLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgaGFzUERPTUNvbnRlbnQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gISF0aGlzLl90YWdOYW1lO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIG5vZGUgaXMgYWRkZWQgYXMgYSBjaGlsZCB0byB0aGlzIG5vZGUgQU5EIHRoZSBub2RlJ3Mgc3VidHJlZSBjb250YWlucyBwZG9tIGNvbnRlbnQuXHJcbiAgICogV2UgbmVlZCB0byBub3RpZnkgYWxsIERpc3BsYXlzIHRoYXQgY2FuIHNlZSB0aGlzIGNoYW5nZSwgc28gdGhhdCB0aGV5IGNhbiB1cGRhdGUgdGhlIFBET01JbnN0YW5jZSB0cmVlLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBvblBET01BZGRDaGlsZCggbm9kZTogTm9kZSApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYXJhbGxlbERPTSAmJiBzY2VuZXJ5TG9nLlBhcmFsbGVsRE9NKCBgb25QRE9NQWRkQ2hpbGQgbiMke25vZGUuaWR9IChwYXJlbnQ6biMkeyggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKS5pZH0pYCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhcmFsbGVsRE9NICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIC8vIEZpbmQgZGVzY2VuZGFudHMgd2l0aCBwZG9tT3JkZXJzIGFuZCBjaGVjayB0aGVtIGFnYWluc3QgYWxsIG9mIHRoZWlyIGFuY2VzdG9ycy9zZWxmXHJcbiAgICBhc3NlcnQgJiYgKCBmdW5jdGlvbiByZWN1ciggZGVzY2VuZGFudCApIHtcclxuICAgICAgLy8gUHJ1bmUgdGhlIHNlYXJjaCAoYmVjYXVzZSBtaWxsaXNlY29uZHMgZG9uJ3QgZ3JvdyBvbiB0cmVlcywgZXZlbiBpZiB3ZSBkbyBoYXZlIGFzc2VydGlvbnMgZW5hYmxlZClcclxuICAgICAgaWYgKCBkZXNjZW5kYW50Ll9yZW5kZXJlclN1bW1hcnkuaGFzTm9QRE9NKCkgKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgZGVzY2VuZGFudC5wZG9tT3JkZXIgJiYgYXNzZXJ0KCBkZXNjZW5kYW50LmdldFRyYWlscyggbm9kZSA9PiBfLmluY2x1ZGVzKCBkZXNjZW5kYW50LnBkb21PcmRlciwgbm9kZSApICkubGVuZ3RoID09PSAwLCAncGRvbU9yZGVyIHNob3VsZCBub3QgaW5jbHVkZSBhbnkgYW5jZXN0b3JzIG9yIHRoZSBub2RlIGl0c2VsZicgKTtcclxuICAgIH0gKSggbm9kZSApO1xyXG5cclxuICAgIGFzc2VydCAmJiBQRE9NVHJlZS5hdWRpdE5vZGVGb3JQRE9NQ3ljbGVzKCB0aGlzIGFzIHVua25vd24gYXMgTm9kZSApO1xyXG5cclxuICAgIHRoaXMuX3Bkb21EaXNwbGF5c0luZm8ub25BZGRDaGlsZCggbm9kZSApO1xyXG5cclxuICAgIFBET01UcmVlLmFkZENoaWxkKCB0aGlzIGFzIHVua25vd24gYXMgTm9kZSwgbm9kZSApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYXJhbGxlbERPTSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIG5vZGUgaXMgcmVtb3ZlZCBhcyBhIGNoaWxkIGZyb20gdGhpcyBub2RlIEFORCB0aGUgbm9kZSdzIHN1YnRyZWUgY29udGFpbnMgcGRvbSBjb250ZW50LlxyXG4gICAqIFdlIG5lZWQgdG8gbm90aWZ5IGFsbCBEaXNwbGF5cyB0aGF0IGNhbiBzZWUgdGhpcyBjaGFuZ2UsIHNvIHRoYXQgdGhleSBjYW4gdXBkYXRlIHRoZSBQRE9NSW5zdGFuY2UgdHJlZS5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgb25QRE9NUmVtb3ZlQ2hpbGQoIG5vZGU6IE5vZGUgKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFyYWxsZWxET00gJiYgc2NlbmVyeUxvZy5QYXJhbGxlbERPTSggYG9uUERPTVJlbW92ZUNoaWxkIG4jJHtub2RlLmlkfSAocGFyZW50Om4jJHsoIHRoaXMgYXMgdW5rbm93biBhcyBOb2RlICkuaWR9KWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYXJhbGxlbERPTSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICB0aGlzLl9wZG9tRGlzcGxheXNJbmZvLm9uUmVtb3ZlQ2hpbGQoIG5vZGUgKTtcclxuXHJcbiAgICBQRE9NVHJlZS5yZW1vdmVDaGlsZCggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUsIG5vZGUgKTtcclxuXHJcbiAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGUgYXNzb2NpYXRpb25zIGZvciBhcmlhLWxhYmVsbGVkYnkgYW5kIGFyaWEtZGVzY3JpYmVkYnkgYXJlIHVwZGF0ZWQgZm9yIG5vZGVzIGFzc29jaWF0ZWRcclxuICAgIC8vIHRvIHRoaXMgTm9kZSAodGhleSBhcmUgcG9pbnRpbmcgdG8gdGhpcyBOb2RlJ3MgSURzKS4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzgxNlxyXG4gICAgbm9kZS51cGRhdGVPdGhlck5vZGVzQXJpYUxhYmVsbGVkYnkoKTtcclxuICAgIG5vZGUudXBkYXRlT3RoZXJOb2Rlc0FyaWFEZXNjcmliZWRieSgpO1xyXG4gICAgbm9kZS51cGRhdGVPdGhlck5vZGVzQWN0aXZlRGVzY2VuZGFudCgpO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYXJhbGxlbERPTSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhpcyBub2RlJ3MgY2hpbGRyZW4gYXJlIHJlb3JkZXJlZCAod2l0aCBub3RoaW5nIGFkZGVkL3JlbW92ZWQpLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBvblBET01SZW9yZGVyZWRDaGlsZHJlbigpOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYXJhbGxlbERPTSAmJiBzY2VuZXJ5TG9nLlBhcmFsbGVsRE9NKCBgb25QRE9NUmVvcmRlcmVkQ2hpbGRyZW4gKHBhcmVudDpuIyR7KCB0aGlzIGFzIHVua25vd24gYXMgTm9kZSApLmlkfSlgICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFyYWxsZWxET00gJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgUERPTVRyZWUuY2hpbGRyZW5PcmRlckNoYW5nZSggdGhpcyBhcyB1bmtub3duIGFzIE5vZGUgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFyYWxsZWxET00gJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhhbmRsZXMgbGlua2luZyBhbmQgY2hlY2tpbmcgY2hpbGQgUGhFVC1pTyBQcm9wZXJ0aWVzIHN1Y2ggYXMgTm9kZS52aXNpYmxlUHJvcGVydHkgYW5kIE5vZGUuZW5hYmxlZFByb3BlcnR5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyB1cGRhdGVMaW5rZWRFbGVtZW50Rm9yUHJvcGVydHk8VD4oIHRhbmRlbU5hbWU6IHN0cmluZywgb2xkUHJvcGVydHk/OiBUUHJvcGVydHk8VD4gfCBudWxsLCBuZXdQcm9wZXJ0eT86IFRQcm9wZXJ0eTxUPiB8IG51bGwgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvbGRQcm9wZXJ0eSAhPT0gbmV3UHJvcGVydHksICdzaG91bGQgbm90IGJlIGNhbGxlZCBvbiBzYW1lIHZhbHVlcycgKTtcclxuXHJcbiAgICAvLyBPbmx5IHVwZGF0ZSBsaW5rZWQgZWxlbWVudHMgaWYgdGhpcyBOb2RlIGlzIGluc3RydW1lbnRlZCBmb3IgUGhFVC1pT1xyXG4gICAgaWYgKCB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XHJcblxyXG4gICAgICBvbGRQcm9wZXJ0eSAmJiBvbGRQcm9wZXJ0eSBpbnN0YW5jZW9mIFJlYWRPbmx5UHJvcGVydHkgJiYgb2xkUHJvcGVydHkuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSAmJiBvbGRQcm9wZXJ0eSBpbnN0YW5jZW9mIFBoZXRpb09iamVjdCAmJiB0aGlzLnJlbW92ZUxpbmtlZEVsZW1lbnRzKCBvbGRQcm9wZXJ0eSApO1xyXG5cclxuICAgICAgY29uc3QgdGFuZGVtID0gdGhpcy50YW5kZW0uY3JlYXRlVGFuZGVtKCB0YW5kZW1OYW1lICk7XHJcbiAgICAgIGlmICggbmV3UHJvcGVydHkgJiYgbmV3UHJvcGVydHkgaW5zdGFuY2VvZiBSZWFkT25seVByb3BlcnR5ICYmIG5ld1Byb3BlcnR5LmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgJiYgbmV3UHJvcGVydHkgaW5zdGFuY2VvZiBQaGV0aW9PYmplY3QgJiYgdGFuZGVtICE9PSBuZXdQcm9wZXJ0eS50YW5kZW0gKSB7XHJcbiAgICAgICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBuZXdQcm9wZXJ0eSwgeyB0YW5kZW06IHRhbmRlbSB9ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuICAvL1xyXG4gIC8vIFBET00gSW5zdGFuY2UgaGFuZGxpbmdcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgcGRvbSBpbnN0YW5jZXMgYXJyYXkuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRQRE9NSW5zdGFuY2VzKCk6IFBET01JbnN0YW5jZVtdIHtcclxuICAgIHJldHVybiB0aGlzLl9wZG9tSW5zdGFuY2VzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBwZG9tSW5zdGFuY2VzKCk6IFBET01JbnN0YW5jZVtdIHsgcmV0dXJuIHRoaXMuZ2V0UERPTUluc3RhbmNlcygpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYW4gUERPTUluc3RhbmNlIHJlZmVyZW5jZSB0byBvdXIgYXJyYXkuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRQRE9NSW5zdGFuY2UoIHBkb21JbnN0YW5jZTogUERPTUluc3RhbmNlICk6IHZvaWQge1xyXG4gICAgdGhpcy5fcGRvbUluc3RhbmNlcy5wdXNoKCBwZG9tSW5zdGFuY2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYW4gUERPTUluc3RhbmNlIHJlZmVyZW5jZSBmcm9tIG91ciBhcnJheS4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZVBET01JbnN0YW5jZSggcGRvbUluc3RhbmNlOiBQRE9NSW5zdGFuY2UgKTogdm9pZCB7XHJcbiAgICBjb25zdCBpbmRleCA9IF8uaW5kZXhPZiggdGhpcy5fcGRvbUluc3RhbmNlcywgcGRvbUluc3RhbmNlICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCAhPT0gLTEsICdDYW5ub3QgcmVtb3ZlIGFuIFBET01JbnN0YW5jZSBmcm9tIGEgTm9kZSBpZiBpdCB3YXMgbm90IHRoZXJlJyApO1xyXG4gICAgdGhpcy5fcGRvbUluc3RhbmNlcy5zcGxpY2UoIGluZGV4LCAxICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIEJBU0lDX0FDQ0VTU0lCTEVfTkFNRV9CRUhBVklPUiggbm9kZTogTm9kZSwgb3B0aW9uczogUGFyYWxsZWxET01PcHRpb25zLCBhY2Nlc3NpYmxlTmFtZTogUERPTVZhbHVlVHlwZSApOiBQYXJhbGxlbERPTU9wdGlvbnMge1xyXG4gICAgaWYgKCBub2RlLnRhZ05hbWUgPT09ICdpbnB1dCcgKSB7XHJcbiAgICAgIG9wdGlvbnMubGFiZWxUYWdOYW1lID0gJ2xhYmVsJztcclxuICAgICAgb3B0aW9ucy5sYWJlbENvbnRlbnQgPSBhY2Nlc3NpYmxlTmFtZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBQRE9NVXRpbHMudGFnTmFtZVN1cHBvcnRzQ29udGVudCggbm9kZS50YWdOYW1lISApICkge1xyXG4gICAgICBvcHRpb25zLmlubmVyQ29udGVudCA9IGFjY2Vzc2libGVOYW1lO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIG9wdGlvbnMuYXJpYUxhYmVsID0gYWNjZXNzaWJsZU5hbWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb3B0aW9ucztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgSEVMUF9URVhUX0JFRk9SRV9DT05URU5UKCBub2RlOiBOb2RlLCBvcHRpb25zOiBQYXJhbGxlbERPTU9wdGlvbnMsIGhlbHBUZXh0OiBQRE9NVmFsdWVUeXBlICk6IFBhcmFsbGVsRE9NT3B0aW9ucyB7XHJcbiAgICBvcHRpb25zLmRlc2NyaXB0aW9uVGFnTmFtZSA9IFBET01VdGlscy5ERUZBVUxUX0RFU0NSSVBUSU9OX1RBR19OQU1FO1xyXG4gICAgb3B0aW9ucy5kZXNjcmlwdGlvbkNvbnRlbnQgPSBoZWxwVGV4dDtcclxuICAgIG9wdGlvbnMuYXBwZW5kRGVzY3JpcHRpb24gPSBmYWxzZTtcclxuICAgIHJldHVybiBvcHRpb25zO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBIRUxQX1RFWFRfQUZURVJfQ09OVEVOVCggbm9kZTogTm9kZSwgb3B0aW9uczogUGFyYWxsZWxET01PcHRpb25zLCBoZWxwVGV4dDogUERPTVZhbHVlVHlwZSApOiBQYXJhbGxlbERPTU9wdGlvbnMge1xyXG4gICAgb3B0aW9ucy5kZXNjcmlwdGlvblRhZ05hbWUgPSBQRE9NVXRpbHMuREVGQVVMVF9ERVNDUklQVElPTl9UQUdfTkFNRTtcclxuICAgIG9wdGlvbnMuZGVzY3JpcHRpb25Db250ZW50ID0gaGVscFRleHQ7XHJcbiAgICBvcHRpb25zLmFwcGVuZERlc2NyaXB0aW9uID0gdHJ1ZTtcclxuICAgIHJldHVybiBvcHRpb25zO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ1BhcmFsbGVsRE9NJywgUGFyYWxsZWxET00gKTtcclxuZXhwb3J0IHsgQUNDRVNTSUJJTElUWV9PUFRJT05fS0VZUyB9O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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