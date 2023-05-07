// Copyright 2018-2023, University of Colorado Boulder

/**
 * The main interaction for grabbing and dragging an object through the PDOM and assistive technology. It works by
 * taking in a Node to augment with the PDOM interaction. In fact it works much like a mixin. In general, this type
 * will mutate the accessible content (PDOM) of the passed in Node (sometimes referred to "wrappedNode"), toggling
 * between a "grabbable" state and a "draggable" state. When each state changes, the underlying PDOM element and general
 * interaction does as well.
 *
 * To accomplish this there are options to be filled in that keep track of the scenery inputListeners for each state,
 * as well as options to mutate the Node for each state. By default the grabbable is a `button` with a containing  `div`,
 * and the draggable is a focusable `div` with an "application" aria role. It is up to the client to supply a
 * KeyboardDragListener as an arg that will be added to the Node in the "draggable" state.
 *
 * As a note on terminology, mostly things are referred to by their current "interaction state" which is either grabbable
 * or draggable.
 *
 * This type will alert when the draggable is released, but no default alert is provided when the object is grabbed.
 * This is because in usages so far, that alert has been custom, context specific, and easier to just supply through
 * the onGrab callback option.
 *
 * NOTE: You SHOULD NOT add listeners directly to the Node where it is constructed, instead see
 * `options.listenersForGrab/DragState`. These will keep track of the listeners for each interaction state, and
 * will set them accordingly. In rare cases it may be desirable to have a listener attached no matter the state, but that
 * has not come up so far.
 *
 * NOTE: There is no "undo" for a mutate call, so it is the client's job to make sure that grabbable/draggableOptions objects
 * appropriately "cancel" out the other. The same goes for any alterations that are done on `onGrab` and `onRelease`
 * callbacks.
 *
 * NOTE: problems may occur if you change the focusHighlight or interactiveHighlight of the Node passed in after
 * creating this type.
 *
 * NOTE: focusHighlightLayerable and interactiveHighlightLayerable is finicky with this type. In order to support
 * it, you must have set the focusHighlight or interactiveHighlight to the wrappedNode and added the focusHighlight
 * to the scene graph before calling this type's constructor.
 *
 * NOTE on positioning the grab "cue" Node: transforming the wrappedNode after creating this type will not update the
 * layout of the grabCueNode. This is because the cue Node is a child of the focus highlight. As a
 * result, currently you must correctly position node before the cue Node is created.
 *
 * NOTE: upon "activation" of this type, meaning that the user grabs the object and it turns into a draggable, the
 * wrappedNode is blurred and refocused. This means that the input event "blur()" set in listenersForGrabState will
 * not just fire when navigating through the sim, but also upon activation. This weirdness is to make sure that the
 * input event "focus()" is called and supported for within listenersForDragState
 *
 * NOTE: For PhET-iO instrumentation, GrabDragInteraction.enabledProperty is phetioReadOnly, it makes the most sense
 * to link to whatever Node control's the mouse/touch input and toggle grab drag enabled when that Node's inputEnabled
 * changes. For example see Friction.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import EnabledComponent from '../../../axon/js/EnabledComponent.js';
import assertHasProperties from '../../../phet-core/js/assertHasProperties.js';
import getGlobal from '../../../phet-core/js/getGlobal.js';
import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { FocusHighlightFromNode, FocusHighlightPath, KeyboardUtils, Node, PDOMPeer, PressListener, Voicing } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import AriaLiveAnnouncer from '../../../utterance-queue/js/AriaLiveAnnouncer.js';
import ResponsePacket from '../../../utterance-queue/js/ResponsePacket.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
import sceneryPhet from '../sceneryPhet.js';
import SceneryPhetStrings from '../SceneryPhetStrings.js';
import GrabReleaseCueNode from './nodes/GrabReleaseCueNode.js';

// constants
const grabPatternString = SceneryPhetStrings.a11y.grabDrag.grabPattern;
const gestureHelpTextPatternString = SceneryPhetStrings.a11y.grabDrag.gestureHelpTextPattern;
const movableString = SceneryPhetStrings.a11y.grabDrag.movable;
const buttonString = SceneryPhetStrings.a11y.grabDrag.button;
const defaultObjectToGrabString = SceneryPhetStrings.a11y.grabDrag.defaultObjectToGrab;
const releasedString = SceneryPhetStrings.a11y.grabDrag.released;
class GrabDragInteraction extends EnabledComponent {
  /**
   * @param {Node} node - will be mutated with a11y options to have the grab/drag functionality in the PDOM
   * @param {KeyboardDragListener} keyboardDragListener - added to the Node when it is draggable
   * @param {Object} [options]
   */
  constructor(node, keyboardDragListener, options) {
    options = merge({
      // A string that is filled in to the appropriate button label
      objectToGrabString: defaultObjectToGrabString,
      // {string|null} - if not provided, a default will be applied, see this.grabbableAccessibleName
      grabbableAccessibleName: null,
      // {function(SceneryEvent):} - called when the node is "grabbed" (when the grab button fires); button -> draggable
      onGrab: _.noop,
      // {function} - called when the node is "released" (when the draggable is "let go"); draggable -> button
      onRelease: _.noop,
      // {function} - similar to onRelease, but called whenever the interaction state is set to "grab". Useful for adding
      // accessible content for the interaction state in a way that can't be achieved with options, like setting
      // pdom attributes.
      onGrabbable: _.noop,
      // {function} - similar to onGrab, but called whenever the interaction state is set to "drag". Useful for adding
      // accessible content for the interaction state in a way that can't be achieved with options, like setting
      // pdom attributes.
      onDraggable: _.noop,
      // {Object} - Node options passed to the grabbable created for the PDOM, filled in with defaults below
      grabbableOptions: {
        appendDescription: true // in general, the help text is after the grabbable
      },

      // {Object} - To pass in options to the cue. This is a scenery Node and you can pass it options supported by
      // that type. When positioning this node, it is in the target Node's parent coordinate frame.
      grabCueOptions: {},
      // {Object} - Node options passed to the draggable created for the PDOM, filled in with defaults below
      draggableOptions: {},
      // {null|Node} - Optional node to cue the drag interaction once successfully updated.
      dragCueNode: null,
      // {Object[]} - GrabDragInteraction swaps the PDOM structure for a given node between a grabbable state, and
      // draggable one. We need to keep track of all listeners that need to be attached to each PDOM manifestation.
      // Note: when these are removed while converting to/from grabbable/draggable, they are interrupted. Other
      // listeners that are attached to this.node but aren't in these lists will not be interrupted. The grabbable
      // will blur() when activated from a grabbable to a draggable. The draggable will focus when activated
      // from grabbable.
      listenersForDragState: [],
      listenersForGrabState: [],
      // {boolean} - if this instance will support specific gesture description behavior.
      supportsGestureDescription: getGlobal('phet.joist.sim.supportsGestureDescription'),
      // {function(numberOfGrabs:number} - Add an aria-describedby link between the description
      // sibling and the primary sibling, only when grabbable. By default this should only be done when supporting
      // gesture interactive description before two success grabs. This function is called with one parameters: the number of
      // successful grabs that has occurred thus far.
      addAriaDescribedbyPredicate: numberOfGrabs => options.supportsGestureDescription && numberOfGrabs < 2,
      // {string} - Help text is treated as the same for the grabbable and draggable items, but is different based on if the
      // runtime is supporting gesture interactive description. Even though "technically" there is no way to access the
      // help text when this Node is in the draggable state, the help text is still in the PDOM.
      keyboardHelpText: null,
      // controls whether or not to show the "Grab" cue node that is displayed on focus - by
      // default it will be shown on focus until it has been successfully grabbed with a keyboard
      showGrabCueNode: () => {
        return this.numberOfKeyboardGrabs < 1 && node.inputEnabled;
      },
      // whether or not to display the Node for the "Drag" cue node once the grabbable Node has been picked up,
      // if a options.dragCueNode is specified. This will only be shown if draggable node has focus
      // from alternative input
      showDragCueNode: () => {
        return true;
      },
      // EnabledComponent
      phetioEnabledPropertyInstrumented: true,
      enabledPropertyOptions: {
        // It is best to wire up grab drag enabled to be in sync with mouse/touch inputEnabled (instead of having both
        // editable by PhET-iO).
        phetioReadOnly: true,
        phetioFeatured: false
      },
      // {Tandem} - For instrumenting
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'GrabDragInteraction'
    }, options);

    // a second block for options that use other options, therefore needing the defaults to be filled in
    options = merge({
      // {string} - like keyboardHelpText but when supporting gesture interactive description
      gestureHelpText: StringUtils.fillIn(gestureHelpTextPatternString, {
        objectToGrab: options.objectToGrabString
      })
    }, options);
    assert && assert(typeof options.supportsGestureDescription === 'boolean', 'supportsGestureDescription must be provided');
    if (node.focusHighlightLayerable) {
      assert && assert(node.focusHighlight, 'if focusHighlightLayerable, the highlight must be set to the node before constructing the grab/drag interaction.');
      assert && assert(node.focusHighlight.parent, 'if focusHighlightLayerable, the highlight must be added to the ' + 'scene graph before grab/drag construction.');
    }
    if (node.interactiveHighlightLayerable) {
      assert && assert(node.interactiveHighlight, 'An interactive highlight must be set to the Node before construcion when using interactiveHighlightLayerable');
      assert && assert(node.interactiveHighlight.parent, 'if interactiveHighlightLayerable, the highlight must be added to the scene graph before construction');
    }
    if (node.focusHighlight) {
      assert && assert(node.focusHighlight instanceof phet.scenery.FocusHighlightPath, 'if provided, focusHighlight must be a Path to support highlightChangedEmitter');
    }
    if (node.interactiveHighlight) {
      assert && assert(node.interactiveHighlight instanceof phet.scenery.FocusHighlightPath, 'if provided, interactiveHighlight must be a Path to support highlightChangedEmitter');
    }
    assert && assert(typeof options.onGrab === 'function');
    assert && assert(typeof options.onRelease === 'function');
    assert && assert(typeof options.onGrabbable === 'function');
    assert && assert(typeof options.onDraggable === 'function');
    assert && assert(typeof options.showDragCueNode === 'function');
    assert && assert(typeof options.showGrabCueNode === 'function');
    assert && assert(Array.isArray(options.listenersForDragState));
    assert && assert(Array.isArray(options.listenersForGrabState));
    assert && assert(options.grabbableOptions instanceof Object);
    assert && assert(options.grabCueOptions instanceof Object);
    assert && assert(options.grabCueOptions.visible === undefined, 'Should not set visibility of the cue node');
    assert && assert(options.draggableOptions instanceof Object);
    assert && assert(!options.listenersForDragState.includes(keyboardDragListener), 'GrabDragInteraction adds the KeyboardDragListener to listenersForDragState');
    if (options.dragCueNode !== null) {
      assert && assert(options.dragCueNode instanceof Node);
      assert && assert(!options.dragCueNode.parent, 'GrabDragInteraction adds dragCueNode to focusHighlight');
      assert && assert(options.dragCueNode.visible === true, 'dragCueNode should be visible to begin with');
    }

    // GrabDragInteraction has its own API for description content.
    assert && assert(!options.grabbableOptions.descriptionContent, 'set grabbableOptions.descriptionContent through custom Grab/Drag API, (see keyboardHelpText and gestureHelpText option).');
    assert && assert(!options.grabbableOptions.helpText, 'set grabbableOptions.helpText through custom Grab/Drag API, (see keyboardHelpText and gestureHelpText option).');
    assert && assert(!options.grabbableOptions.descriptionTagName, 'set grabbableOptions.descriptionTagName through custom Grab/Drag API, (see keyboardHelpText and gestureHelpText option).');
    assert && assert(!options.draggableOptions.descriptionTagName, 'set draggableOptions.descriptionTagName through custom Grab/Drag API, (see keyboardHelpText and gestureHelpText option).');
    assert && assert(!options.draggableOptions.descriptionContent, 'set draggableOptions.descriptionContent through custom Grab/Drag API, (see keyboardHelpText and gestureHelpText option).');
    assert && assert(!options.draggableOptions.helpText, 'set draggableOptions.helpText through custom Grab/Drag API, (see keyboardHelpText and gestureHelpText option).');
    assert && assert(!options.draggableOptions.accessibleName, 'GrabDragInteraction sets its own accessible name, see objectToGrabString');
    assert && assert(!options.draggableOptions.innerContent, 'GrabDragInteraction sets its own innerContent, see objectToGrabString');
    assert && assert(!options.draggableOptions.ariaLabel, 'GrabDragInteraction sets its own ariaLabel, see objectToGrabString');
    super(options);
    options.draggableOptions = merge({
      tagName: 'div',
      ariaRole: 'application',
      // to cancel out grabbable
      containerTagName: null
    }, options.draggableOptions);

    // @private
    this.draggableAccessibleName = options.objectToGrabString;
    options.draggableOptions.innerContent = this.draggableAccessibleName;
    options.draggableOptions.ariaLabel = this.draggableAccessibleName;
    assert && assert(!options.grabbableOptions.accessibleName, 'GrabDragInteraction sets its own accessible name, see objectToGrabString');
    assert && assert(!options.grabbableOptions.innerContent, 'GrabDragInteraction sets its own innerContent, see objectToGrabString');
    assert && assert(!options.grabbableOptions.ariaLabel, 'GrabDragInteraction sets its own ariaLabel, see objectToGrabString');
    options.grabbableOptions = merge({
      containerTagName: 'div',
      ariaRole: null,
      tagName: 'button',
      // position the PDOM elements when grabbable for drag and drop on touch-based screen readers
      positionInPDOM: true,
      // {string}
      accessibleName: null
    }, options.grabbableOptions);

    // @private
    this.grabbableAccessibleName = options.grabbableAccessibleName || (
    // if a provided option
    options.supportsGestureDescription ? options.objectToGrabString :
    // otherwise if supporting gesture
    StringUtils.fillIn(grabPatternString, {
      // default case
      objectToGrab: options.objectToGrabString
    }));
    options.grabbableOptions.innerContent = this.grabbableAccessibleName;

    // Setting the aria-label on the grabbable element fixes a bug with VoiceOver in Safari where the aria role
    // from the draggable state is never cleared, see https://github.com/phetsims/scenery-phet/issues/688
    options.grabbableOptions.ariaLabel = this.grabbableAccessibleName;

    // @private
    this.grabbable = true; // If false, then instead this type is in the draggable interaction state.
    this.node = node;
    this.grabbableOptions = options.grabbableOptions;
    this.draggableOptions = options.draggableOptions;
    this.dragCueNode = options.dragCueNode; // {Node|null}
    this.grabCueNode = new GrabReleaseCueNode(options.grabCueOptions);
    this.showGrabCueNode = options.showGrabCueNode;
    this.showDragCueNode = options.showDragCueNode;
    this.onGrabbable = options.onGrabbable;
    this.onDraggable = options.onDraggable;
    this.addAriaDescribedbyPredicate = options.addAriaDescribedbyPredicate;
    this.supportsGestureDescription = options.supportsGestureDescription;

    // @private {number} - the number of times the component has been picked up for dragging, regardless
    // of pickup method for things like determining content for "hints" describing the interaction
    // to the user
    this.numberOfGrabs = 0; // {number}

    // @private {number} - the number of times this component has been picked up with a keyboard
    // specifically to provide hints specific to alternative input
    this.numberOfKeyboardGrabs = 0;

    // @private {string|null}
    // set the help text, if provided - it will be associated with aria-describedby when in the "grabbable" state
    this.node.descriptionContent = this.supportsGestureDescription ? options.gestureHelpText : options.keyboardHelpText;

    // @private {Object} - The aria-describedby association object that will associate "grabbable" with its
    // help text so that it is read automatically when the user finds it. This reference is saved so that
    // the association can be removed when the node becomes a "draggable"
    this.descriptionAssociationObject = {
      otherNode: this.node,
      thisElementName: PDOMPeer.PRIMARY_SIBLING,
      otherElementName: PDOMPeer.DESCRIPTION_SIBLING
    };

    // @private
    this.voicingFocusUtterance = new Utterance({
      alert: new ResponsePacket(),
      announcerOptions: {
        cancelOther: false
      }
    });

    // for both grabbing and dragging, the node with this interaction must be focusable, except when disabled.
    this.node.focusable = true;
    assert && node.isVoicing && assert(node.voicingFocusListener === node.defaultFocusListener, 'GrabDragInteraction sets its own voicingFocusListener.');

    // "released" alerts are assertive so that a pile up of alerts doesn't happen with rapid movement, see
    // https://github.com/phetsims/balloons-and-static-electricity/issues/491
    const releasedUtterance = new Utterance({
      alert: new ResponsePacket({
        objectResponse: releasedString
      }),
      // This was being obscured by other messages, the priority helps make sure it is heard, see https://github.com/phetsims/friction/issues/325
      priority: Utterance.MEDIUM_PRIORITY,
      announcerOptions: {
        ariaLivePriority: AriaLiveAnnouncer.AriaLive.ASSERTIVE // for AriaLiveAnnouncer
      }
    });

    if (node.isVoicing) {
      // sanity check on the voicing interface API.
      assertHasProperties(node, ['voicingFocusListener']);
      node.voicingFocusListener = event => {
        // When swapping from grabbable to draggable, the draggable element will be focused, ignore that case here, see https://github.com/phetsims/friction/issues/213
        this.grabbable && node.defaultFocusListener(event);
      };

      // These Utterances should only be announced if the Node is globally visible and voicingVisible.
      Voicing.registerUtteranceToVoicingNode(releasedUtterance, node);
      Voicing.registerUtteranceToVoicingNode(this.voicingFocusUtterance, node);
    }

    // @private - wrap the optional onRelease in logic that is needed for the core type.
    this.onRelease = () => {
      options.onRelease && options.onRelease();
      this.node.alertDescriptionUtterance(releasedUtterance);
      node.isVoicing && Voicing.alertUtterance(releasedUtterance);
    };
    this.onGrab = options.onGrab; // @private

    // @private - Take highlights from the node for the grab button interaction. The Interactive Highlights cannot
    // fall back to the default focus highlights because GrabDragInteraction adds "grab cue" Nodes as children
    // to the focus highlights that should not be displayed when using Interactive Highlights.
    this.grabFocusHighlight = node.focusHighlight || new FocusHighlightFromNode(node);
    this.grabInteractiveHighlight = node.interactiveHighlight || new FocusHighlightFromNode(node);
    node.focusHighlight = this.grabFocusHighlight;
    node.interactiveHighlight = this.grabInteractiveHighlight;

    // @private - Make the draggable highlights in the spitting image of the node's grabbable highlights
    this.dragFocusHighlight = new FocusHighlightPath(this.grabFocusHighlight.shape, {
      visible: false,
      transformSourceNode: this.grabFocusHighlight.transformSourceNode || node
    });
    this.dragInteractiveHighlight = new FocusHighlightPath(this.grabInteractiveHighlight.shape, {
      visible: false,
      transformSourceNode: this.grabInteractiveHighlight.transformSourceNode || node
    });

    // Update the passed in node's focusHighlight to make it dashed for the "draggable" state
    this.dragFocusHighlight.makeDashed();
    this.dragInteractiveHighlight.makeDashed();

    // if the Node layers its interactive highlights in the scene graph, add the dragInteractiveHighlight in the same
    // way the grabInteractiveHighlight was added
    if (node.interactiveHighlightLayerable) {
      this.grabInteractiveHighlight.parent.addChild(this.dragInteractiveHighlight);
    }

    // if ever we update the node's highlights, then update the grab button's too to keep in syn.
    const onFocusHighlightChange = () => {
      this.dragFocusHighlight.setShape(this.grabFocusHighlight.shape);
    };
    this.grabFocusHighlight.highlightChangedEmitter.addListener(onFocusHighlightChange);
    const onInteractiveHighlightChange = () => {
      this.dragInteractiveHighlight.setShape(this.grabInteractiveHighlight.shape);
    };
    this.grabInteractiveHighlight.highlightChangedEmitter.addListener(onInteractiveHighlightChange);

    // only the focus highlights have "cue" Nodes so we do not need to do any work here for the Interactive Highlights
    this.grabCueNode.prependMatrix(node.getMatrix());
    this.grabFocusHighlight.addChild(this.grabCueNode);
    if (this.dragCueNode) {
      this.dragCueNode.prependMatrix(node.getMatrix());
      this.dragFocusHighlight.addChild(this.dragCueNode);
    }

    // Some key presses can fire the node's click (the grab button) from the same press that fires the keydown from
    // the draggable, so guard against that.
    let guardKeyPressFromDraggable = false;

    // when the "Grab {{thing}}" button is pressed, focus the draggable node and set to dragged state
    const grabButtonListener = {
      click: event => {
        // don't turn to draggable on mobile a11y, it is the wrong gesture - user should press down and hold
        // to initiate a drag
        if (this.supportsGestureDescription) {
          return;
        }

        // if the draggable was just released, don't pick it up again until the next click event so we don't "loop"
        // and pick it up immediately again.
        if (!guardKeyPressFromDraggable) {
          // blur as a grabbable so that we geta new focus event after we turn into a draggable
          this.node.blur();
          this.turnToDraggable();
          this.numberOfKeyboardGrabs++;

          // focus after the transition
          this.node.focus();
          this.onGrab(event);

          // Add the newly created focusHighlight to the scene graph if focusHighlightLayerable, just like the
          // original focus highlight was added. By doing this on click, we make sure that the node's
          // focusHighlight has been completely constructed (added to the scene graph) and can use its parent. But only
          // do it once.
          if (node.focusHighlightLayerable) {
            assert && assert(this.grabFocusHighlight.parent, 'how can we have focusHighlightLayerable with a ' + 'node that is not in the scene graph?');
            // If not yet added, do so now.
            if (!this.grabFocusHighlight.parent.hasChild(this.dragFocusHighlight)) {
              this.grabFocusHighlight.parent.addChild(this.dragFocusHighlight);
            }
          }
        }

        // "grab" the draggable on the next click event
        guardKeyPressFromDraggable = false;
      },
      focus: () => {
        this.updateVisibilityForCues();
        if (this.node.isVoicing && this.showGrabCueNode()) {
          this.voicingFocusUtterance.alert.hintResponse = SceneryPhetStrings.a11y.grabDrag.spaceToGrabOrReleaseStringProperty;
          Voicing.alertUtterance(this.voicingFocusUtterance);
        }
      },
      blur: () => {
        this.grabCueNode.visible = options.showGrabCueNode();
      }
    };

    // @private - keep track of all listeners to swap out grab/drag functionalities
    this.listenersForGrabState = options.listenersForGrabState.concat(grabButtonListener);

    // use arrow functions so that we can have the right "this" reference
    const dragDivListener = {
      // Release the draggable on 'enter' key, tracking that we have released the draggable with this key so that
      // we don't immediately catch the 'click' event while the enter key is down on the button
      keydown: event => {
        if (KeyboardUtils.isKeyEvent(event.domEvent, KeyboardUtils.KEY_ENTER)) {
          // set a guard to make sure the key press from enter doesn't fire future listeners, therefore
          // "clicking" the grab button also on this key press.
          guardKeyPressFromDraggable = true;
          this.releaseDraggable();
        }
      },
      keyup: event => {
        // Release  on keyup of spacebar so that we don't pick up the draggable again when we release the spacebar
        // and trigger a click event - escape could be added to either keyup or keydown listeners
        if (KeyboardUtils.isAnyKeyEvent(event.domEvent, [KeyboardUtils.KEY_SPACE, KeyboardUtils.KEY_ESCAPE])) {
          this.releaseDraggable();
        }

        // if successfully dragged, then make the cue node invisible
        this.updateVisibilityForCues();
      },
      blur: () => this.releaseDraggable(),
      focus: () => {
        // if successfully dragged, then make the cue node invisible
        this.updateVisibilityForCues();
      }
    };

    // @private
    this.listenersForDragState = options.listenersForDragState.concat([dragDivListener, keyboardDragListener]);

    // @private - from non-PDOM pointer events, change representations in the PDOM - necessary for accessible tech that
    // uses pointer events like iOS VoiceOver. The above listeners manage input from the PDOM.
    this.pressListener = new PressListener({
      press: event => {
        if (!event.isFromPDOM()) {
          this.turnToDraggable();
          this.onGrab(event);
        }
      },
      release: event => {
        // release if PressListener is interrupted, but only if not already
        // grabbable, which is possible if the GrabDragInteraction has been
        // reset since press
        if ((event === null || !event.isFromPDOM()) && !this.grabbable) {
          this.releaseDraggable();
        }
      },
      // this listener shouldn't prevent the behavior of other listeners, and this listener should always fire
      // whether or not the pointer is already attached
      attach: false,
      enabledProperty: this.enabledProperty,
      tandem: options.tandem.createTandem('pressListener')
    });
    this.node.addInputListener(this.pressListener);

    // Initialize the Node as a grabbable (button) to begin with
    this.turnToGrabbable();
    this.enabledProperty.lazyLink(enabled => {
      !enabled && this.interrupt();

      // Disabled GrabDragInteractions will be unable to be interacted with.
      this.node.focusable = enabled;
    });
    const boundUpdateVisibilityForCues = this.updateVisibilityForCues.bind(this);
    this.node.inputEnabledProperty.lazyLink(boundUpdateVisibilityForCues);

    // @private
    this.disposeGrabDragInteraction = () => {
      this.node.removeInputListener(this.pressListener);
      this.node.inputEnabledProperty.unlink(boundUpdateVisibilityForCues);

      // Remove listeners according to what state we are in
      if (this.grabbable) {
        this.removeInputListeners(this.listenersForGrabState);
      } else {
        this.removeInputListeners(this.listenersForDragState);
      }
      this.grabFocusHighlight.highlightChangedEmitter.removeListener(onFocusHighlightChange);
      this.grabInteractiveHighlight.highlightChangedEmitter.removeListener(onInteractiveHighlightChange);

      // Remove children if they were added to support layerable highlights
      if (node.focusHighlightLayerable) {
        assert && assert(this.grabFocusHighlight.parent, 'how can we have focusHighlightLayerable with a ' + 'node that is not in the scene graph?');
        if (this.grabFocusHighlight.parent.hasChild(this.dragFocusHighlight)) {
          this.grabFocusHighlight.parent.removeChild(this.dragFocusHighlight);
        }
      }
      if (node.interactiveHighlightLayerable) {
        assert && assert(this.grabInteractiveHighlight.parent, 'how can we have interactiveHighlightLayerable with a ' + 'node that is not in the scene graph?');
        if (this.grabInteractiveHighlight.parent.hasChild(this.dragInteractiveHighlight)) {
          this.grabInteractiveHighlight.parent.removeChild(this.dragInteractiveHighlight);
        }
      }
      if (node.isVoicing) {
        Voicing.unregisterUtteranceToVoicingNode(releasedUtterance, node);
        Voicing.unregisterUtteranceToVoicingNode(this.voicingFocusUtterance, node);
      }

      // remove cue references
      this.grabFocusHighlight.removeChild(this.grabCueNode);
      this.dragCueNode && this.dragFocusHighlight.focusHighlight.removeChild(this.dragCueNode);
    };
  }

  /**
   * Release the draggable
   * @public
   */
  releaseDraggable() {
    assert && assert(!this.grabbable, 'cannot set to grabbable if already set that way');
    this.turnToGrabbable();
    this.onRelease();
  }

  /**
   * turn the Node into the grabbable (button), swap out listeners too
   * @private
   */
  turnToGrabbable() {
    this.grabbable = true;

    // To support gesture and mobile screen readers, we change the roledescription, see https://github.com/phetsims/scenery-phet/issues/536
    if (this.supportsGestureDescription) {
      this.node.setPDOMAttribute('aria-roledescription', movableString);
    } else if (this.node.hasPDOMAttribute('aria-roledescription')) {
      // By default, the grabbable gets a roledescription to force the AT to say its role. This fixes a bug in VoiceOver
      // where it fails to update the role after turning back into a grabbable.
      // See https://github.com/phetsims/scenery-phet/issues/688.
      // You can override this with onGrabbable() if necessary.
      this.node.setPDOMAttribute('aria-roledescription', buttonString);
    }
    if (this.addAriaDescribedbyPredicate(this.numberOfGrabs)) {
      // this node is aria-describedby its own description content, so that the description is read automatically
      // when found by the user
      !this.node.hasAriaDescribedbyAssociation(this.descriptionAssociationObject) && this.node.addAriaDescribedbyAssociation(this.descriptionAssociationObject);
    } else if (this.node.hasAriaDescribedbyAssociation(this.descriptionAssociationObject)) {
      this.node.removeAriaDescribedbyAssociation(this.descriptionAssociationObject);
    }
    this.baseInteractionUpdate(this.grabbableOptions, this.listenersForDragState, this.listenersForGrabState);

    // callback on completion
    this.onGrabbable();
  }

  /**
   * Turn the node into a draggable by updating accessibility representation in the PDOM and changing input
   * listeners.
   * @private
   */
  turnToDraggable() {
    this.numberOfGrabs++;
    this.grabbable = false;

    // by default, the draggable has roledescription of "movable". Can be overwritten in `onDraggable()`
    this.node.setPDOMAttribute('aria-roledescription', movableString);

    // This node is aria-describedby its own description content only when grabbable, so that the description is
    // read automatically when found by the user with the virtual cursor. Remove it for draggable
    if (this.node.hasAriaDescribedbyAssociation(this.descriptionAssociationObject)) {
      this.node.removeAriaDescribedbyAssociation(this.descriptionAssociationObject);
    }

    // turn this into a draggable in the node
    this.baseInteractionUpdate(this.draggableOptions, this.listenersForGrabState, this.listenersForDragState);

    // callback on completion
    this.onDraggable();
  }

  /**
   * Update the node to switch modalities between being draggable, and grabbable. This function holds code that should
   * be called when switching in either direction.
   * @private
   */
  baseInteractionUpdate(optionsToMutate, listenersToRemove, listenersToAdd) {
    // interrupt prior input, reset the key state of the drag handler by interrupting the drag. Don't interrupt all
    // input, but instead just those to be removed.
    listenersToRemove.forEach(listener => listener.interrupt && listener.interrupt());

    // remove all previous listeners from the node
    this.removeInputListeners(listenersToRemove);

    // update the PDOM of the node
    this.node.mutate(optionsToMutate);
    assert && this.enabledProperty.value && assert(this.node.focusable, 'GrabDragInteraction node must remain focusable after mutation');
    this.addInputListeners(listenersToAdd);
    this.updateFocusHighlights();
    this.updateVisibilityForCues();
  }

  /**
   * Update the focusHighlights according to if we are in grabbable or draggable state
   * No need to set visibility to true, because that will happen for us by HighlightOverlay on focus.
   *
   * @private
   */
  updateFocusHighlights() {
    if (this.grabbable) {
      this.node.focusHighlight = this.grabFocusHighlight;
      this.node.interactiveHighlight = this.grabInteractiveHighlight;
    } else {
      this.node.focusHighlight = this.dragFocusHighlight;
      this.node.interactiveHighlight = this.dragInteractiveHighlight;
    }
  }

  /**
   * Update the visibility of the cues for both grabbable and draggable states.
   * @private
   */
  updateVisibilityForCues() {
    if (this.dragCueNode) {
      this.dragCueNode.visible = this.showDragCueNode();
    }
    this.grabCueNode.visible = this.showGrabCueNode();
  }

  /**
   * Add all listeners to node
   * @private
   * @param {Function[]}listeners
   */
  addInputListeners(listeners) {
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      if (!this.node.hasInputListener(listener)) {
        this.node.addInputListener(listener);
      }
    }
  }

  /**
   * Remove all listeners from the node
   * @param listeners
   * @private
   */
  removeInputListeners(listeners) {
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      if (this.node.hasInputListener(listener)) {
        this.node.removeInputListener(listener);
      }
    }
  }

  /**
   * @override
   * @public
   */
  dispose() {
    this.disposeGrabDragInteraction();
    super.dispose();
  }

  /**
   * Interrupt the grab drag interraction - interrupts any listeners attached and makes sure the
   * Node is back in its "grabbable" state.
   * @public
   */
  interrupt() {
    this.pressListener.interrupt();
  }

  /**
   * Reset to initial state
   * @public
   */
  reset() {
    // reset numberOfGrabs for turnToGrabbable
    this.numberOfGrabs = 0;
    this.turnToGrabbable();
    this.voicingFocusUtterance.reset();

    // turnToGrabbable will increment this, so reset it again
    this.numberOfGrabs = 0;
    this.numberOfKeyboardGrabs = 0;
    this.grabCueNode.visible = true;
    if (this.dragCueNode) {
      this.dragCueNode.visible = true;
    }
  }
}
sceneryPhet.register('GrabDragInteraction', GrabDragInteraction);
export default GrabDragInteraction;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbmFibGVkQ29tcG9uZW50IiwiYXNzZXJ0SGFzUHJvcGVydGllcyIsImdldEdsb2JhbCIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJGb2N1c0hpZ2hsaWdodEZyb21Ob2RlIiwiRm9jdXNIaWdobGlnaHRQYXRoIiwiS2V5Ym9hcmRVdGlscyIsIk5vZGUiLCJQRE9NUGVlciIsIlByZXNzTGlzdGVuZXIiLCJWb2ljaW5nIiwiVGFuZGVtIiwiQXJpYUxpdmVBbm5vdW5jZXIiLCJSZXNwb25zZVBhY2tldCIsIlV0dGVyYW5jZSIsInNjZW5lcnlQaGV0IiwiU2NlbmVyeVBoZXRTdHJpbmdzIiwiR3JhYlJlbGVhc2VDdWVOb2RlIiwiZ3JhYlBhdHRlcm5TdHJpbmciLCJhMTF5IiwiZ3JhYkRyYWciLCJncmFiUGF0dGVybiIsImdlc3R1cmVIZWxwVGV4dFBhdHRlcm5TdHJpbmciLCJnZXN0dXJlSGVscFRleHRQYXR0ZXJuIiwibW92YWJsZVN0cmluZyIsIm1vdmFibGUiLCJidXR0b25TdHJpbmciLCJidXR0b24iLCJkZWZhdWx0T2JqZWN0VG9HcmFiU3RyaW5nIiwiZGVmYXVsdE9iamVjdFRvR3JhYiIsInJlbGVhc2VkU3RyaW5nIiwicmVsZWFzZWQiLCJHcmFiRHJhZ0ludGVyYWN0aW9uIiwiY29uc3RydWN0b3IiLCJub2RlIiwia2V5Ym9hcmREcmFnTGlzdGVuZXIiLCJvcHRpb25zIiwib2JqZWN0VG9HcmFiU3RyaW5nIiwiZ3JhYmJhYmxlQWNjZXNzaWJsZU5hbWUiLCJvbkdyYWIiLCJfIiwibm9vcCIsIm9uUmVsZWFzZSIsIm9uR3JhYmJhYmxlIiwib25EcmFnZ2FibGUiLCJncmFiYmFibGVPcHRpb25zIiwiYXBwZW5kRGVzY3JpcHRpb24iLCJncmFiQ3VlT3B0aW9ucyIsImRyYWdnYWJsZU9wdGlvbnMiLCJkcmFnQ3VlTm9kZSIsImxpc3RlbmVyc0ZvckRyYWdTdGF0ZSIsImxpc3RlbmVyc0ZvckdyYWJTdGF0ZSIsInN1cHBvcnRzR2VzdHVyZURlc2NyaXB0aW9uIiwiYWRkQXJpYURlc2NyaWJlZGJ5UHJlZGljYXRlIiwibnVtYmVyT2ZHcmFicyIsImtleWJvYXJkSGVscFRleHQiLCJzaG93R3JhYkN1ZU5vZGUiLCJudW1iZXJPZktleWJvYXJkR3JhYnMiLCJpbnB1dEVuYWJsZWQiLCJzaG93RHJhZ0N1ZU5vZGUiLCJwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJlbmFibGVkUHJvcGVydHlPcHRpb25zIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9GZWF0dXJlZCIsInRhbmRlbSIsIlJFUVVJUkVEIiwidGFuZGVtTmFtZVN1ZmZpeCIsImdlc3R1cmVIZWxwVGV4dCIsImZpbGxJbiIsIm9iamVjdFRvR3JhYiIsImFzc2VydCIsImZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlIiwiZm9jdXNIaWdobGlnaHQiLCJwYXJlbnQiLCJpbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSIsImludGVyYWN0aXZlSGlnaGxpZ2h0IiwicGhldCIsInNjZW5lcnkiLCJBcnJheSIsImlzQXJyYXkiLCJPYmplY3QiLCJ2aXNpYmxlIiwidW5kZWZpbmVkIiwiaW5jbHVkZXMiLCJkZXNjcmlwdGlvbkNvbnRlbnQiLCJoZWxwVGV4dCIsImRlc2NyaXB0aW9uVGFnTmFtZSIsImFjY2Vzc2libGVOYW1lIiwiaW5uZXJDb250ZW50IiwiYXJpYUxhYmVsIiwidGFnTmFtZSIsImFyaWFSb2xlIiwiY29udGFpbmVyVGFnTmFtZSIsImRyYWdnYWJsZUFjY2Vzc2libGVOYW1lIiwicG9zaXRpb25JblBET00iLCJncmFiYmFibGUiLCJncmFiQ3VlTm9kZSIsImRlc2NyaXB0aW9uQXNzb2NpYXRpb25PYmplY3QiLCJvdGhlck5vZGUiLCJ0aGlzRWxlbWVudE5hbWUiLCJQUklNQVJZX1NJQkxJTkciLCJvdGhlckVsZW1lbnROYW1lIiwiREVTQ1JJUFRJT05fU0lCTElORyIsInZvaWNpbmdGb2N1c1V0dGVyYW5jZSIsImFsZXJ0IiwiYW5ub3VuY2VyT3B0aW9ucyIsImNhbmNlbE90aGVyIiwiZm9jdXNhYmxlIiwiaXNWb2ljaW5nIiwidm9pY2luZ0ZvY3VzTGlzdGVuZXIiLCJkZWZhdWx0Rm9jdXNMaXN0ZW5lciIsInJlbGVhc2VkVXR0ZXJhbmNlIiwib2JqZWN0UmVzcG9uc2UiLCJwcmlvcml0eSIsIk1FRElVTV9QUklPUklUWSIsImFyaWFMaXZlUHJpb3JpdHkiLCJBcmlhTGl2ZSIsIkFTU0VSVElWRSIsImV2ZW50IiwicmVnaXN0ZXJVdHRlcmFuY2VUb1ZvaWNpbmdOb2RlIiwiYWxlcnREZXNjcmlwdGlvblV0dGVyYW5jZSIsImFsZXJ0VXR0ZXJhbmNlIiwiZ3JhYkZvY3VzSGlnaGxpZ2h0IiwiZ3JhYkludGVyYWN0aXZlSGlnaGxpZ2h0IiwiZHJhZ0ZvY3VzSGlnaGxpZ2h0Iiwic2hhcGUiLCJ0cmFuc2Zvcm1Tb3VyY2VOb2RlIiwiZHJhZ0ludGVyYWN0aXZlSGlnaGxpZ2h0IiwibWFrZURhc2hlZCIsImFkZENoaWxkIiwib25Gb2N1c0hpZ2hsaWdodENoYW5nZSIsInNldFNoYXBlIiwiaGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsIm9uSW50ZXJhY3RpdmVIaWdobGlnaHRDaGFuZ2UiLCJwcmVwZW5kTWF0cml4IiwiZ2V0TWF0cml4IiwiZ3VhcmRLZXlQcmVzc0Zyb21EcmFnZ2FibGUiLCJncmFiQnV0dG9uTGlzdGVuZXIiLCJjbGljayIsImJsdXIiLCJ0dXJuVG9EcmFnZ2FibGUiLCJmb2N1cyIsImhhc0NoaWxkIiwidXBkYXRlVmlzaWJpbGl0eUZvckN1ZXMiLCJoaW50UmVzcG9uc2UiLCJzcGFjZVRvR3JhYk9yUmVsZWFzZVN0cmluZ1Byb3BlcnR5IiwiY29uY2F0IiwiZHJhZ0Rpdkxpc3RlbmVyIiwia2V5ZG93biIsImlzS2V5RXZlbnQiLCJkb21FdmVudCIsIktFWV9FTlRFUiIsInJlbGVhc2VEcmFnZ2FibGUiLCJrZXl1cCIsImlzQW55S2V5RXZlbnQiLCJLRVlfU1BBQ0UiLCJLRVlfRVNDQVBFIiwicHJlc3NMaXN0ZW5lciIsInByZXNzIiwiaXNGcm9tUERPTSIsInJlbGVhc2UiLCJhdHRhY2giLCJlbmFibGVkUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJhZGRJbnB1dExpc3RlbmVyIiwidHVyblRvR3JhYmJhYmxlIiwibGF6eUxpbmsiLCJlbmFibGVkIiwiaW50ZXJydXB0IiwiYm91bmRVcGRhdGVWaXNpYmlsaXR5Rm9yQ3VlcyIsImJpbmQiLCJpbnB1dEVuYWJsZWRQcm9wZXJ0eSIsImRpc3Bvc2VHcmFiRHJhZ0ludGVyYWN0aW9uIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsInVubGluayIsInJlbW92ZUlucHV0TGlzdGVuZXJzIiwicmVtb3ZlTGlzdGVuZXIiLCJyZW1vdmVDaGlsZCIsInVucmVnaXN0ZXJVdHRlcmFuY2VUb1ZvaWNpbmdOb2RlIiwic2V0UERPTUF0dHJpYnV0ZSIsImhhc1BET01BdHRyaWJ1dGUiLCJoYXNBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbiIsImFkZEFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uIiwicmVtb3ZlQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24iLCJiYXNlSW50ZXJhY3Rpb25VcGRhdGUiLCJvcHRpb25zVG9NdXRhdGUiLCJsaXN0ZW5lcnNUb1JlbW92ZSIsImxpc3RlbmVyc1RvQWRkIiwiZm9yRWFjaCIsImxpc3RlbmVyIiwibXV0YXRlIiwidmFsdWUiLCJhZGRJbnB1dExpc3RlbmVycyIsInVwZGF0ZUZvY3VzSGlnaGxpZ2h0cyIsImxpc3RlbmVycyIsImkiLCJsZW5ndGgiLCJoYXNJbnB1dExpc3RlbmVyIiwiZGlzcG9zZSIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHcmFiRHJhZ0ludGVyYWN0aW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBtYWluIGludGVyYWN0aW9uIGZvciBncmFiYmluZyBhbmQgZHJhZ2dpbmcgYW4gb2JqZWN0IHRocm91Z2ggdGhlIFBET00gYW5kIGFzc2lzdGl2ZSB0ZWNobm9sb2d5LiBJdCB3b3JrcyBieVxyXG4gKiB0YWtpbmcgaW4gYSBOb2RlIHRvIGF1Z21lbnQgd2l0aCB0aGUgUERPTSBpbnRlcmFjdGlvbi4gSW4gZmFjdCBpdCB3b3JrcyBtdWNoIGxpa2UgYSBtaXhpbi4gSW4gZ2VuZXJhbCwgdGhpcyB0eXBlXHJcbiAqIHdpbGwgbXV0YXRlIHRoZSBhY2Nlc3NpYmxlIGNvbnRlbnQgKFBET00pIG9mIHRoZSBwYXNzZWQgaW4gTm9kZSAoc29tZXRpbWVzIHJlZmVycmVkIHRvIFwid3JhcHBlZE5vZGVcIiksIHRvZ2dsaW5nXHJcbiAqIGJldHdlZW4gYSBcImdyYWJiYWJsZVwiIHN0YXRlIGFuZCBhIFwiZHJhZ2dhYmxlXCIgc3RhdGUuIFdoZW4gZWFjaCBzdGF0ZSBjaGFuZ2VzLCB0aGUgdW5kZXJseWluZyBQRE9NIGVsZW1lbnQgYW5kIGdlbmVyYWxcclxuICogaW50ZXJhY3Rpb24gZG9lcyBhcyB3ZWxsLlxyXG4gKlxyXG4gKiBUbyBhY2NvbXBsaXNoIHRoaXMgdGhlcmUgYXJlIG9wdGlvbnMgdG8gYmUgZmlsbGVkIGluIHRoYXQga2VlcCB0cmFjayBvZiB0aGUgc2NlbmVyeSBpbnB1dExpc3RlbmVycyBmb3IgZWFjaCBzdGF0ZSxcclxuICogYXMgd2VsbCBhcyBvcHRpb25zIHRvIG11dGF0ZSB0aGUgTm9kZSBmb3IgZWFjaCBzdGF0ZS4gQnkgZGVmYXVsdCB0aGUgZ3JhYmJhYmxlIGlzIGEgYGJ1dHRvbmAgd2l0aCBhIGNvbnRhaW5pbmcgIGBkaXZgLFxyXG4gKiBhbmQgdGhlIGRyYWdnYWJsZSBpcyBhIGZvY3VzYWJsZSBgZGl2YCB3aXRoIGFuIFwiYXBwbGljYXRpb25cIiBhcmlhIHJvbGUuIEl0IGlzIHVwIHRvIHRoZSBjbGllbnQgdG8gc3VwcGx5IGFcclxuICogS2V5Ym9hcmREcmFnTGlzdGVuZXIgYXMgYW4gYXJnIHRoYXQgd2lsbCBiZSBhZGRlZCB0byB0aGUgTm9kZSBpbiB0aGUgXCJkcmFnZ2FibGVcIiBzdGF0ZS5cclxuICpcclxuICogQXMgYSBub3RlIG9uIHRlcm1pbm9sb2d5LCBtb3N0bHkgdGhpbmdzIGFyZSByZWZlcnJlZCB0byBieSB0aGVpciBjdXJyZW50IFwiaW50ZXJhY3Rpb24gc3RhdGVcIiB3aGljaCBpcyBlaXRoZXIgZ3JhYmJhYmxlXHJcbiAqIG9yIGRyYWdnYWJsZS5cclxuICpcclxuICogVGhpcyB0eXBlIHdpbGwgYWxlcnQgd2hlbiB0aGUgZHJhZ2dhYmxlIGlzIHJlbGVhc2VkLCBidXQgbm8gZGVmYXVsdCBhbGVydCBpcyBwcm92aWRlZCB3aGVuIHRoZSBvYmplY3QgaXMgZ3JhYmJlZC5cclxuICogVGhpcyBpcyBiZWNhdXNlIGluIHVzYWdlcyBzbyBmYXIsIHRoYXQgYWxlcnQgaGFzIGJlZW4gY3VzdG9tLCBjb250ZXh0IHNwZWNpZmljLCBhbmQgZWFzaWVyIHRvIGp1c3Qgc3VwcGx5IHRocm91Z2hcclxuICogdGhlIG9uR3JhYiBjYWxsYmFjayBvcHRpb24uXHJcbiAqXHJcbiAqIE5PVEU6IFlvdSBTSE9VTEQgTk9UIGFkZCBsaXN0ZW5lcnMgZGlyZWN0bHkgdG8gdGhlIE5vZGUgd2hlcmUgaXQgaXMgY29uc3RydWN0ZWQsIGluc3RlYWQgc2VlXHJcbiAqIGBvcHRpb25zLmxpc3RlbmVyc0ZvckdyYWIvRHJhZ1N0YXRlYC4gVGhlc2Ugd2lsbCBrZWVwIHRyYWNrIG9mIHRoZSBsaXN0ZW5lcnMgZm9yIGVhY2ggaW50ZXJhY3Rpb24gc3RhdGUsIGFuZFxyXG4gKiB3aWxsIHNldCB0aGVtIGFjY29yZGluZ2x5LiBJbiByYXJlIGNhc2VzIGl0IG1heSBiZSBkZXNpcmFibGUgdG8gaGF2ZSBhIGxpc3RlbmVyIGF0dGFjaGVkIG5vIG1hdHRlciB0aGUgc3RhdGUsIGJ1dCB0aGF0XHJcbiAqIGhhcyBub3QgY29tZSB1cCBzbyBmYXIuXHJcbiAqXHJcbiAqIE5PVEU6IFRoZXJlIGlzIG5vIFwidW5kb1wiIGZvciBhIG11dGF0ZSBjYWxsLCBzbyBpdCBpcyB0aGUgY2xpZW50J3Mgam9iIHRvIG1ha2Ugc3VyZSB0aGF0IGdyYWJiYWJsZS9kcmFnZ2FibGVPcHRpb25zIG9iamVjdHNcclxuICogYXBwcm9wcmlhdGVseSBcImNhbmNlbFwiIG91dCB0aGUgb3RoZXIuIFRoZSBzYW1lIGdvZXMgZm9yIGFueSBhbHRlcmF0aW9ucyB0aGF0IGFyZSBkb25lIG9uIGBvbkdyYWJgIGFuZCBgb25SZWxlYXNlYFxyXG4gKiBjYWxsYmFja3MuXHJcbiAqXHJcbiAqIE5PVEU6IHByb2JsZW1zIG1heSBvY2N1ciBpZiB5b3UgY2hhbmdlIHRoZSBmb2N1c0hpZ2hsaWdodCBvciBpbnRlcmFjdGl2ZUhpZ2hsaWdodCBvZiB0aGUgTm9kZSBwYXNzZWQgaW4gYWZ0ZXJcclxuICogY3JlYXRpbmcgdGhpcyB0eXBlLlxyXG4gKlxyXG4gKiBOT1RFOiBmb2N1c0hpZ2hsaWdodExheWVyYWJsZSBhbmQgaW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGUgaXMgZmluaWNreSB3aXRoIHRoaXMgdHlwZS4gSW4gb3JkZXIgdG8gc3VwcG9ydFxyXG4gKiBpdCwgeW91IG11c3QgaGF2ZSBzZXQgdGhlIGZvY3VzSGlnaGxpZ2h0IG9yIGludGVyYWN0aXZlSGlnaGxpZ2h0IHRvIHRoZSB3cmFwcGVkTm9kZSBhbmQgYWRkZWQgdGhlIGZvY3VzSGlnaGxpZ2h0XHJcbiAqIHRvIHRoZSBzY2VuZSBncmFwaCBiZWZvcmUgY2FsbGluZyB0aGlzIHR5cGUncyBjb25zdHJ1Y3Rvci5cclxuICpcclxuICogTk9URSBvbiBwb3NpdGlvbmluZyB0aGUgZ3JhYiBcImN1ZVwiIE5vZGU6IHRyYW5zZm9ybWluZyB0aGUgd3JhcHBlZE5vZGUgYWZ0ZXIgY3JlYXRpbmcgdGhpcyB0eXBlIHdpbGwgbm90IHVwZGF0ZSB0aGVcclxuICogbGF5b3V0IG9mIHRoZSBncmFiQ3VlTm9kZS4gVGhpcyBpcyBiZWNhdXNlIHRoZSBjdWUgTm9kZSBpcyBhIGNoaWxkIG9mIHRoZSBmb2N1cyBoaWdobGlnaHQuIEFzIGFcclxuICogcmVzdWx0LCBjdXJyZW50bHkgeW91IG11c3QgY29ycmVjdGx5IHBvc2l0aW9uIG5vZGUgYmVmb3JlIHRoZSBjdWUgTm9kZSBpcyBjcmVhdGVkLlxyXG4gKlxyXG4gKiBOT1RFOiB1cG9uIFwiYWN0aXZhdGlvblwiIG9mIHRoaXMgdHlwZSwgbWVhbmluZyB0aGF0IHRoZSB1c2VyIGdyYWJzIHRoZSBvYmplY3QgYW5kIGl0IHR1cm5zIGludG8gYSBkcmFnZ2FibGUsIHRoZVxyXG4gKiB3cmFwcGVkTm9kZSBpcyBibHVycmVkIGFuZCByZWZvY3VzZWQuIFRoaXMgbWVhbnMgdGhhdCB0aGUgaW5wdXQgZXZlbnQgXCJibHVyKClcIiBzZXQgaW4gbGlzdGVuZXJzRm9yR3JhYlN0YXRlIHdpbGxcclxuICogbm90IGp1c3QgZmlyZSB3aGVuIG5hdmlnYXRpbmcgdGhyb3VnaCB0aGUgc2ltLCBidXQgYWxzbyB1cG9uIGFjdGl2YXRpb24uIFRoaXMgd2VpcmRuZXNzIGlzIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZVxyXG4gKiBpbnB1dCBldmVudCBcImZvY3VzKClcIiBpcyBjYWxsZWQgYW5kIHN1cHBvcnRlZCBmb3Igd2l0aGluIGxpc3RlbmVyc0ZvckRyYWdTdGF0ZVxyXG4gKlxyXG4gKiBOT1RFOiBGb3IgUGhFVC1pTyBpbnN0cnVtZW50YXRpb24sIEdyYWJEcmFnSW50ZXJhY3Rpb24uZW5hYmxlZFByb3BlcnR5IGlzIHBoZXRpb1JlYWRPbmx5LCBpdCBtYWtlcyB0aGUgbW9zdCBzZW5zZVxyXG4gKiB0byBsaW5rIHRvIHdoYXRldmVyIE5vZGUgY29udHJvbCdzIHRoZSBtb3VzZS90b3VjaCBpbnB1dCBhbmQgdG9nZ2xlIGdyYWIgZHJhZyBlbmFibGVkIHdoZW4gdGhhdCBOb2RlJ3MgaW5wdXRFbmFibGVkXHJcbiAqIGNoYW5nZXMuIEZvciBleGFtcGxlIHNlZSBGcmljdGlvbi5cclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbmFibGVkQ29tcG9uZW50IGZyb20gJy4uLy4uLy4uL2F4b24vanMvRW5hYmxlZENvbXBvbmVudC5qcyc7XHJcbmltcG9ydCBhc3NlcnRIYXNQcm9wZXJ0aWVzIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hc3NlcnRIYXNQcm9wZXJ0aWVzLmpzJztcclxuaW1wb3J0IGdldEdsb2JhbCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvZ2V0R2xvYmFsLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBGb2N1c0hpZ2hsaWdodEZyb21Ob2RlLCBGb2N1c0hpZ2hsaWdodFBhdGgsIEtleWJvYXJkVXRpbHMsIE5vZGUsIFBET01QZWVyLCBQcmVzc0xpc3RlbmVyLCBWb2ljaW5nIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEFyaWFMaXZlQW5ub3VuY2VyIGZyb20gJy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9BcmlhTGl2ZUFubm91bmNlci5qcyc7XHJcbmltcG9ydCBSZXNwb25zZVBhY2tldCBmcm9tICcuLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvUmVzcG9uc2VQYWNrZXQuanMnO1xyXG5pbXBvcnQgVXR0ZXJhbmNlIGZyb20gJy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2UuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vc2NlbmVyeVBoZXQuanMnO1xyXG5pbXBvcnQgU2NlbmVyeVBoZXRTdHJpbmdzIGZyb20gJy4uL1NjZW5lcnlQaGV0U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBHcmFiUmVsZWFzZUN1ZU5vZGUgZnJvbSAnLi9ub2Rlcy9HcmFiUmVsZWFzZUN1ZU5vZGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IGdyYWJQYXR0ZXJuU3RyaW5nID0gU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkuZ3JhYkRyYWcuZ3JhYlBhdHRlcm47XHJcbmNvbnN0IGdlc3R1cmVIZWxwVGV4dFBhdHRlcm5TdHJpbmcgPSBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5ncmFiRHJhZy5nZXN0dXJlSGVscFRleHRQYXR0ZXJuO1xyXG5jb25zdCBtb3ZhYmxlU3RyaW5nID0gU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkuZ3JhYkRyYWcubW92YWJsZTtcclxuY29uc3QgYnV0dG9uU3RyaW5nID0gU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkuZ3JhYkRyYWcuYnV0dG9uO1xyXG5jb25zdCBkZWZhdWx0T2JqZWN0VG9HcmFiU3RyaW5nID0gU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkuZ3JhYkRyYWcuZGVmYXVsdE9iamVjdFRvR3JhYjtcclxuY29uc3QgcmVsZWFzZWRTdHJpbmcgPSBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5ncmFiRHJhZy5yZWxlYXNlZDtcclxuXHJcbmNsYXNzIEdyYWJEcmFnSW50ZXJhY3Rpb24gZXh0ZW5kcyBFbmFibGVkQ29tcG9uZW50IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlIC0gd2lsbCBiZSBtdXRhdGVkIHdpdGggYTExeSBvcHRpb25zIHRvIGhhdmUgdGhlIGdyYWIvZHJhZyBmdW5jdGlvbmFsaXR5IGluIHRoZSBQRE9NXHJcbiAgICogQHBhcmFtIHtLZXlib2FyZERyYWdMaXN0ZW5lcn0ga2V5Ym9hcmREcmFnTGlzdGVuZXIgLSBhZGRlZCB0byB0aGUgTm9kZSB3aGVuIGl0IGlzIGRyYWdnYWJsZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggbm9kZSwga2V5Ym9hcmREcmFnTGlzdGVuZXIsIG9wdGlvbnMgKSB7XHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIEEgc3RyaW5nIHRoYXQgaXMgZmlsbGVkIGluIHRvIHRoZSBhcHByb3ByaWF0ZSBidXR0b24gbGFiZWxcclxuICAgICAgb2JqZWN0VG9HcmFiU3RyaW5nOiBkZWZhdWx0T2JqZWN0VG9HcmFiU3RyaW5nLFxyXG5cclxuICAgICAgLy8ge3N0cmluZ3xudWxsfSAtIGlmIG5vdCBwcm92aWRlZCwgYSBkZWZhdWx0IHdpbGwgYmUgYXBwbGllZCwgc2VlIHRoaXMuZ3JhYmJhYmxlQWNjZXNzaWJsZU5hbWVcclxuICAgICAgZ3JhYmJhYmxlQWNjZXNzaWJsZU5hbWU6IG51bGwsXHJcblxyXG4gICAgICAvLyB7ZnVuY3Rpb24oU2NlbmVyeUV2ZW50KTp9IC0gY2FsbGVkIHdoZW4gdGhlIG5vZGUgaXMgXCJncmFiYmVkXCIgKHdoZW4gdGhlIGdyYWIgYnV0dG9uIGZpcmVzKTsgYnV0dG9uIC0+IGRyYWdnYWJsZVxyXG4gICAgICBvbkdyYWI6IF8ubm9vcCxcclxuXHJcbiAgICAgIC8vIHtmdW5jdGlvbn0gLSBjYWxsZWQgd2hlbiB0aGUgbm9kZSBpcyBcInJlbGVhc2VkXCIgKHdoZW4gdGhlIGRyYWdnYWJsZSBpcyBcImxldCBnb1wiKTsgZHJhZ2dhYmxlIC0+IGJ1dHRvblxyXG4gICAgICBvblJlbGVhc2U6IF8ubm9vcCxcclxuXHJcbiAgICAgIC8vIHtmdW5jdGlvbn0gLSBzaW1pbGFyIHRvIG9uUmVsZWFzZSwgYnV0IGNhbGxlZCB3aGVuZXZlciB0aGUgaW50ZXJhY3Rpb24gc3RhdGUgaXMgc2V0IHRvIFwiZ3JhYlwiLiBVc2VmdWwgZm9yIGFkZGluZ1xyXG4gICAgICAvLyBhY2Nlc3NpYmxlIGNvbnRlbnQgZm9yIHRoZSBpbnRlcmFjdGlvbiBzdGF0ZSBpbiBhIHdheSB0aGF0IGNhbid0IGJlIGFjaGlldmVkIHdpdGggb3B0aW9ucywgbGlrZSBzZXR0aW5nXHJcbiAgICAgIC8vIHBkb20gYXR0cmlidXRlcy5cclxuICAgICAgb25HcmFiYmFibGU6IF8ubm9vcCxcclxuXHJcbiAgICAgIC8vIHtmdW5jdGlvbn0gLSBzaW1pbGFyIHRvIG9uR3JhYiwgYnV0IGNhbGxlZCB3aGVuZXZlciB0aGUgaW50ZXJhY3Rpb24gc3RhdGUgaXMgc2V0IHRvIFwiZHJhZ1wiLiBVc2VmdWwgZm9yIGFkZGluZ1xyXG4gICAgICAvLyBhY2Nlc3NpYmxlIGNvbnRlbnQgZm9yIHRoZSBpbnRlcmFjdGlvbiBzdGF0ZSBpbiBhIHdheSB0aGF0IGNhbid0IGJlIGFjaGlldmVkIHdpdGggb3B0aW9ucywgbGlrZSBzZXR0aW5nXHJcbiAgICAgIC8vIHBkb20gYXR0cmlidXRlcy5cclxuICAgICAgb25EcmFnZ2FibGU6IF8ubm9vcCxcclxuXHJcbiAgICAgIC8vIHtPYmplY3R9IC0gTm9kZSBvcHRpb25zIHBhc3NlZCB0byB0aGUgZ3JhYmJhYmxlIGNyZWF0ZWQgZm9yIHRoZSBQRE9NLCBmaWxsZWQgaW4gd2l0aCBkZWZhdWx0cyBiZWxvd1xyXG4gICAgICBncmFiYmFibGVPcHRpb25zOiB7XHJcbiAgICAgICAgYXBwZW5kRGVzY3JpcHRpb246IHRydWUgLy8gaW4gZ2VuZXJhbCwgdGhlIGhlbHAgdGV4dCBpcyBhZnRlciB0aGUgZ3JhYmJhYmxlXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyB7T2JqZWN0fSAtIFRvIHBhc3MgaW4gb3B0aW9ucyB0byB0aGUgY3VlLiBUaGlzIGlzIGEgc2NlbmVyeSBOb2RlIGFuZCB5b3UgY2FuIHBhc3MgaXQgb3B0aW9ucyBzdXBwb3J0ZWQgYnlcclxuICAgICAgLy8gdGhhdCB0eXBlLiBXaGVuIHBvc2l0aW9uaW5nIHRoaXMgbm9kZSwgaXQgaXMgaW4gdGhlIHRhcmdldCBOb2RlJ3MgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAgICAgIGdyYWJDdWVPcHRpb25zOiB7fSxcclxuXHJcbiAgICAgIC8vIHtPYmplY3R9IC0gTm9kZSBvcHRpb25zIHBhc3NlZCB0byB0aGUgZHJhZ2dhYmxlIGNyZWF0ZWQgZm9yIHRoZSBQRE9NLCBmaWxsZWQgaW4gd2l0aCBkZWZhdWx0cyBiZWxvd1xyXG4gICAgICBkcmFnZ2FibGVPcHRpb25zOiB7fSxcclxuXHJcbiAgICAgIC8vIHtudWxsfE5vZGV9IC0gT3B0aW9uYWwgbm9kZSB0byBjdWUgdGhlIGRyYWcgaW50ZXJhY3Rpb24gb25jZSBzdWNjZXNzZnVsbHkgdXBkYXRlZC5cclxuICAgICAgZHJhZ0N1ZU5vZGU6IG51bGwsXHJcblxyXG4gICAgICAvLyB7T2JqZWN0W119IC0gR3JhYkRyYWdJbnRlcmFjdGlvbiBzd2FwcyB0aGUgUERPTSBzdHJ1Y3R1cmUgZm9yIGEgZ2l2ZW4gbm9kZSBiZXR3ZWVuIGEgZ3JhYmJhYmxlIHN0YXRlLCBhbmRcclxuICAgICAgLy8gZHJhZ2dhYmxlIG9uZS4gV2UgbmVlZCB0byBrZWVwIHRyYWNrIG9mIGFsbCBsaXN0ZW5lcnMgdGhhdCBuZWVkIHRvIGJlIGF0dGFjaGVkIHRvIGVhY2ggUERPTSBtYW5pZmVzdGF0aW9uLlxyXG4gICAgICAvLyBOb3RlOiB3aGVuIHRoZXNlIGFyZSByZW1vdmVkIHdoaWxlIGNvbnZlcnRpbmcgdG8vZnJvbSBncmFiYmFibGUvZHJhZ2dhYmxlLCB0aGV5IGFyZSBpbnRlcnJ1cHRlZC4gT3RoZXJcclxuICAgICAgLy8gbGlzdGVuZXJzIHRoYXQgYXJlIGF0dGFjaGVkIHRvIHRoaXMubm9kZSBidXQgYXJlbid0IGluIHRoZXNlIGxpc3RzIHdpbGwgbm90IGJlIGludGVycnVwdGVkLiBUaGUgZ3JhYmJhYmxlXHJcbiAgICAgIC8vIHdpbGwgYmx1cigpIHdoZW4gYWN0aXZhdGVkIGZyb20gYSBncmFiYmFibGUgdG8gYSBkcmFnZ2FibGUuIFRoZSBkcmFnZ2FibGUgd2lsbCBmb2N1cyB3aGVuIGFjdGl2YXRlZFxyXG4gICAgICAvLyBmcm9tIGdyYWJiYWJsZS5cclxuICAgICAgbGlzdGVuZXJzRm9yRHJhZ1N0YXRlOiBbXSxcclxuICAgICAgbGlzdGVuZXJzRm9yR3JhYlN0YXRlOiBbXSxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIGlmIHRoaXMgaW5zdGFuY2Ugd2lsbCBzdXBwb3J0IHNwZWNpZmljIGdlc3R1cmUgZGVzY3JpcHRpb24gYmVoYXZpb3IuXHJcbiAgICAgIHN1cHBvcnRzR2VzdHVyZURlc2NyaXB0aW9uOiBnZXRHbG9iYWwoICdwaGV0LmpvaXN0LnNpbS5zdXBwb3J0c0dlc3R1cmVEZXNjcmlwdGlvbicgKSxcclxuXHJcbiAgICAgIC8vIHtmdW5jdGlvbihudW1iZXJPZkdyYWJzOm51bWJlcn0gLSBBZGQgYW4gYXJpYS1kZXNjcmliZWRieSBsaW5rIGJldHdlZW4gdGhlIGRlc2NyaXB0aW9uXHJcbiAgICAgIC8vIHNpYmxpbmcgYW5kIHRoZSBwcmltYXJ5IHNpYmxpbmcsIG9ubHkgd2hlbiBncmFiYmFibGUuIEJ5IGRlZmF1bHQgdGhpcyBzaG91bGQgb25seSBiZSBkb25lIHdoZW4gc3VwcG9ydGluZ1xyXG4gICAgICAvLyBnZXN0dXJlIGludGVyYWN0aXZlIGRlc2NyaXB0aW9uIGJlZm9yZSB0d28gc3VjY2VzcyBncmFicy4gVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCBvbmUgcGFyYW1ldGVyczogdGhlIG51bWJlciBvZlxyXG4gICAgICAvLyBzdWNjZXNzZnVsIGdyYWJzIHRoYXQgaGFzIG9jY3VycmVkIHRodXMgZmFyLlxyXG4gICAgICBhZGRBcmlhRGVzY3JpYmVkYnlQcmVkaWNhdGU6IG51bWJlck9mR3JhYnMgPT4gb3B0aW9ucy5zdXBwb3J0c0dlc3R1cmVEZXNjcmlwdGlvbiAmJiBudW1iZXJPZkdyYWJzIDwgMixcclxuXHJcbiAgICAgIC8vIHtzdHJpbmd9IC0gSGVscCB0ZXh0IGlzIHRyZWF0ZWQgYXMgdGhlIHNhbWUgZm9yIHRoZSBncmFiYmFibGUgYW5kIGRyYWdnYWJsZSBpdGVtcywgYnV0IGlzIGRpZmZlcmVudCBiYXNlZCBvbiBpZiB0aGVcclxuICAgICAgLy8gcnVudGltZSBpcyBzdXBwb3J0aW5nIGdlc3R1cmUgaW50ZXJhY3RpdmUgZGVzY3JpcHRpb24uIEV2ZW4gdGhvdWdoIFwidGVjaG5pY2FsbHlcIiB0aGVyZSBpcyBubyB3YXkgdG8gYWNjZXNzIHRoZVxyXG4gICAgICAvLyBoZWxwIHRleHQgd2hlbiB0aGlzIE5vZGUgaXMgaW4gdGhlIGRyYWdnYWJsZSBzdGF0ZSwgdGhlIGhlbHAgdGV4dCBpcyBzdGlsbCBpbiB0aGUgUERPTS5cclxuICAgICAga2V5Ym9hcmRIZWxwVGV4dDogbnVsbCxcclxuXHJcbiAgICAgIC8vIGNvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRvIHNob3cgdGhlIFwiR3JhYlwiIGN1ZSBub2RlIHRoYXQgaXMgZGlzcGxheWVkIG9uIGZvY3VzIC0gYnlcclxuICAgICAgLy8gZGVmYXVsdCBpdCB3aWxsIGJlIHNob3duIG9uIGZvY3VzIHVudGlsIGl0IGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBncmFiYmVkIHdpdGggYSBrZXlib2FyZFxyXG4gICAgICBzaG93R3JhYkN1ZU5vZGU6ICgpID0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5udW1iZXJPZktleWJvYXJkR3JhYnMgPCAxICYmIG5vZGUuaW5wdXRFbmFibGVkO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gd2hldGhlciBvciBub3QgdG8gZGlzcGxheSB0aGUgTm9kZSBmb3IgdGhlIFwiRHJhZ1wiIGN1ZSBub2RlIG9uY2UgdGhlIGdyYWJiYWJsZSBOb2RlIGhhcyBiZWVuIHBpY2tlZCB1cCxcclxuICAgICAgLy8gaWYgYSBvcHRpb25zLmRyYWdDdWVOb2RlIGlzIHNwZWNpZmllZC4gVGhpcyB3aWxsIG9ubHkgYmUgc2hvd24gaWYgZHJhZ2dhYmxlIG5vZGUgaGFzIGZvY3VzXHJcbiAgICAgIC8vIGZyb20gYWx0ZXJuYXRpdmUgaW5wdXRcclxuICAgICAgc2hvd0RyYWdDdWVOb2RlOiAoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBFbmFibGVkQ29tcG9uZW50XHJcbiAgICAgIHBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogdHJ1ZSxcclxuICAgICAgZW5hYmxlZFByb3BlcnR5T3B0aW9uczoge1xyXG5cclxuICAgICAgICAvLyBJdCBpcyBiZXN0IHRvIHdpcmUgdXAgZ3JhYiBkcmFnIGVuYWJsZWQgdG8gYmUgaW4gc3luYyB3aXRoIG1vdXNlL3RvdWNoIGlucHV0RW5hYmxlZCAoaW5zdGVhZCBvZiBoYXZpbmcgYm90aFxyXG4gICAgICAgIC8vIGVkaXRhYmxlIGJ5IFBoRVQtaU8pLlxyXG4gICAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICAgIHBoZXRpb0ZlYXR1cmVkOiBmYWxzZVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8ge1RhbmRlbX0gLSBGb3IgaW5zdHJ1bWVudGluZ1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcclxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ0dyYWJEcmFnSW50ZXJhY3Rpb24nXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gYSBzZWNvbmQgYmxvY2sgZm9yIG9wdGlvbnMgdGhhdCB1c2Ugb3RoZXIgb3B0aW9ucywgdGhlcmVmb3JlIG5lZWRpbmcgdGhlIGRlZmF1bHRzIHRvIGJlIGZpbGxlZCBpblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyB7c3RyaW5nfSAtIGxpa2Uga2V5Ym9hcmRIZWxwVGV4dCBidXQgd2hlbiBzdXBwb3J0aW5nIGdlc3R1cmUgaW50ZXJhY3RpdmUgZGVzY3JpcHRpb25cclxuICAgICAgZ2VzdHVyZUhlbHBUZXh0OiBTdHJpbmdVdGlscy5maWxsSW4oIGdlc3R1cmVIZWxwVGV4dFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBvYmplY3RUb0dyYWI6IG9wdGlvbnMub2JqZWN0VG9HcmFiU3RyaW5nXHJcbiAgICAgIH0gKVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBvcHRpb25zLnN1cHBvcnRzR2VzdHVyZURlc2NyaXB0aW9uID09PSAnYm9vbGVhbicsICdzdXBwb3J0c0dlc3R1cmVEZXNjcmlwdGlvbiBtdXN0IGJlIHByb3ZpZGVkJyApO1xyXG5cclxuICAgIGlmICggbm9kZS5mb2N1c0hpZ2hsaWdodExheWVyYWJsZSApIHtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUuZm9jdXNIaWdobGlnaHQsXHJcbiAgICAgICAgJ2lmIGZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlLCB0aGUgaGlnaGxpZ2h0IG11c3QgYmUgc2V0IHRvIHRoZSBub2RlIGJlZm9yZSBjb25zdHJ1Y3RpbmcgdGhlIGdyYWIvZHJhZyBpbnRlcmFjdGlvbi4nICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUuZm9jdXNIaWdobGlnaHQucGFyZW50LCAnaWYgZm9jdXNIaWdobGlnaHRMYXllcmFibGUsIHRoZSBoaWdobGlnaHQgbXVzdCBiZSBhZGRlZCB0byB0aGUgJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc2NlbmUgZ3JhcGggYmVmb3JlIGdyYWIvZHJhZyBjb25zdHJ1Y3Rpb24uJyApO1xyXG4gICAgfVxyXG4gICAgaWYgKCBub2RlLmludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlLmludGVyYWN0aXZlSGlnaGxpZ2h0LFxyXG4gICAgICAgICdBbiBpbnRlcmFjdGl2ZSBoaWdobGlnaHQgbXVzdCBiZSBzZXQgdG8gdGhlIE5vZGUgYmVmb3JlIGNvbnN0cnVjaW9uIHdoZW4gdXNpbmcgaW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGUnICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUuaW50ZXJhY3RpdmVIaWdobGlnaHQucGFyZW50LFxyXG4gICAgICAgICdpZiBpbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSwgdGhlIGhpZ2hsaWdodCBtdXN0IGJlIGFkZGVkIHRvIHRoZSBzY2VuZSBncmFwaCBiZWZvcmUgY29uc3RydWN0aW9uJyApO1xyXG4gICAgfVxyXG4gICAgaWYgKCBub2RlLmZvY3VzSGlnaGxpZ2h0ICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlLmZvY3VzSGlnaGxpZ2h0IGluc3RhbmNlb2YgcGhldC5zY2VuZXJ5LkZvY3VzSGlnaGxpZ2h0UGF0aCxcclxuICAgICAgICAnaWYgcHJvdmlkZWQsIGZvY3VzSGlnaGxpZ2h0IG11c3QgYmUgYSBQYXRoIHRvIHN1cHBvcnQgaGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXInICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIG5vZGUuaW50ZXJhY3RpdmVIaWdobGlnaHQgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUuaW50ZXJhY3RpdmVIaWdobGlnaHQgaW5zdGFuY2VvZiBwaGV0LnNjZW5lcnkuRm9jdXNIaWdobGlnaHRQYXRoLFxyXG4gICAgICAgICdpZiBwcm92aWRlZCwgaW50ZXJhY3RpdmVIaWdobGlnaHQgbXVzdCBiZSBhIFBhdGggdG8gc3VwcG9ydCBoaWdobGlnaHRDaGFuZ2VkRW1pdHRlcicgKTtcclxuICAgIH1cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBvcHRpb25zLm9uR3JhYiA9PT0gJ2Z1bmN0aW9uJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG9wdGlvbnMub25SZWxlYXNlID09PSAnZnVuY3Rpb24nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygb3B0aW9ucy5vbkdyYWJiYWJsZSA9PT0gJ2Z1bmN0aW9uJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG9wdGlvbnMub25EcmFnZ2FibGUgPT09ICdmdW5jdGlvbicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBvcHRpb25zLnNob3dEcmFnQ3VlTm9kZSA9PT0gJ2Z1bmN0aW9uJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG9wdGlvbnMuc2hvd0dyYWJDdWVOb2RlID09PSAnZnVuY3Rpb24nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBvcHRpb25zLmxpc3RlbmVyc0ZvckRyYWdTdGF0ZSApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBvcHRpb25zLmxpc3RlbmVyc0ZvckdyYWJTdGF0ZSApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmdyYWJiYWJsZU9wdGlvbnMgaW5zdGFuY2VvZiBPYmplY3QgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuZ3JhYkN1ZU9wdGlvbnMgaW5zdGFuY2VvZiBPYmplY3QgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuZ3JhYkN1ZU9wdGlvbnMudmlzaWJsZSA9PT0gdW5kZWZpbmVkLCAnU2hvdWxkIG5vdCBzZXQgdmlzaWJpbGl0eSBvZiB0aGUgY3VlIG5vZGUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmRyYWdnYWJsZU9wdGlvbnMgaW5zdGFuY2VvZiBPYmplY3QgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmxpc3RlbmVyc0ZvckRyYWdTdGF0ZS5pbmNsdWRlcygga2V5Ym9hcmREcmFnTGlzdGVuZXIgKSwgJ0dyYWJEcmFnSW50ZXJhY3Rpb24gYWRkcyB0aGUgS2V5Ym9hcmREcmFnTGlzdGVuZXIgdG8gbGlzdGVuZXJzRm9yRHJhZ1N0YXRlJyApO1xyXG4gICAgaWYgKCBvcHRpb25zLmRyYWdDdWVOb2RlICE9PSBudWxsICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmRyYWdDdWVOb2RlIGluc3RhbmNlb2YgTm9kZSApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5kcmFnQ3VlTm9kZS5wYXJlbnQsICdHcmFiRHJhZ0ludGVyYWN0aW9uIGFkZHMgZHJhZ0N1ZU5vZGUgdG8gZm9jdXNIaWdobGlnaHQnICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuZHJhZ0N1ZU5vZGUudmlzaWJsZSA9PT0gdHJ1ZSwgJ2RyYWdDdWVOb2RlIHNob3VsZCBiZSB2aXNpYmxlIHRvIGJlZ2luIHdpdGgnICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR3JhYkRyYWdJbnRlcmFjdGlvbiBoYXMgaXRzIG93biBBUEkgZm9yIGRlc2NyaXB0aW9uIGNvbnRlbnQuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5ncmFiYmFibGVPcHRpb25zLmRlc2NyaXB0aW9uQ29udGVudCxcclxuICAgICAgJ3NldCBncmFiYmFibGVPcHRpb25zLmRlc2NyaXB0aW9uQ29udGVudCB0aHJvdWdoIGN1c3RvbSBHcmFiL0RyYWcgQVBJLCAoc2VlIGtleWJvYXJkSGVscFRleHQgYW5kIGdlc3R1cmVIZWxwVGV4dCBvcHRpb24pLicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmdyYWJiYWJsZU9wdGlvbnMuaGVscFRleHQsXHJcbiAgICAgICdzZXQgZ3JhYmJhYmxlT3B0aW9ucy5oZWxwVGV4dCB0aHJvdWdoIGN1c3RvbSBHcmFiL0RyYWcgQVBJLCAoc2VlIGtleWJvYXJkSGVscFRleHQgYW5kIGdlc3R1cmVIZWxwVGV4dCBvcHRpb24pLicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmdyYWJiYWJsZU9wdGlvbnMuZGVzY3JpcHRpb25UYWdOYW1lLFxyXG4gICAgICAnc2V0IGdyYWJiYWJsZU9wdGlvbnMuZGVzY3JpcHRpb25UYWdOYW1lIHRocm91Z2ggY3VzdG9tIEdyYWIvRHJhZyBBUEksIChzZWUga2V5Ym9hcmRIZWxwVGV4dCBhbmQgZ2VzdHVyZUhlbHBUZXh0IG9wdGlvbikuJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuZHJhZ2dhYmxlT3B0aW9ucy5kZXNjcmlwdGlvblRhZ05hbWUsXHJcbiAgICAgICdzZXQgZHJhZ2dhYmxlT3B0aW9ucy5kZXNjcmlwdGlvblRhZ05hbWUgdGhyb3VnaCBjdXN0b20gR3JhYi9EcmFnIEFQSSwgKHNlZSBrZXlib2FyZEhlbHBUZXh0IGFuZCBnZXN0dXJlSGVscFRleHQgb3B0aW9uKS4nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5kcmFnZ2FibGVPcHRpb25zLmRlc2NyaXB0aW9uQ29udGVudCxcclxuICAgICAgJ3NldCBkcmFnZ2FibGVPcHRpb25zLmRlc2NyaXB0aW9uQ29udGVudCB0aHJvdWdoIGN1c3RvbSBHcmFiL0RyYWcgQVBJLCAoc2VlIGtleWJvYXJkSGVscFRleHQgYW5kIGdlc3R1cmVIZWxwVGV4dCBvcHRpb24pLicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmRyYWdnYWJsZU9wdGlvbnMuaGVscFRleHQsXHJcbiAgICAgICdzZXQgZHJhZ2dhYmxlT3B0aW9ucy5oZWxwVGV4dCB0aHJvdWdoIGN1c3RvbSBHcmFiL0RyYWcgQVBJLCAoc2VlIGtleWJvYXJkSGVscFRleHQgYW5kIGdlc3R1cmVIZWxwVGV4dCBvcHRpb24pLicgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5kcmFnZ2FibGVPcHRpb25zLmFjY2Vzc2libGVOYW1lLCAnR3JhYkRyYWdJbnRlcmFjdGlvbiBzZXRzIGl0cyBvd24gYWNjZXNzaWJsZSBuYW1lLCBzZWUgb2JqZWN0VG9HcmFiU3RyaW5nJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuZHJhZ2dhYmxlT3B0aW9ucy5pbm5lckNvbnRlbnQsICdHcmFiRHJhZ0ludGVyYWN0aW9uIHNldHMgaXRzIG93biBpbm5lckNvbnRlbnQsIHNlZSBvYmplY3RUb0dyYWJTdHJpbmcnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5kcmFnZ2FibGVPcHRpb25zLmFyaWFMYWJlbCwgJ0dyYWJEcmFnSW50ZXJhY3Rpb24gc2V0cyBpdHMgb3duIGFyaWFMYWJlbCwgc2VlIG9iamVjdFRvR3JhYlN0cmluZycgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIG9wdGlvbnMuZHJhZ2dhYmxlT3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHRhZ05hbWU6ICdkaXYnLFxyXG4gICAgICBhcmlhUm9sZTogJ2FwcGxpY2F0aW9uJyxcclxuXHJcbiAgICAgIC8vIHRvIGNhbmNlbCBvdXQgZ3JhYmJhYmxlXHJcbiAgICAgIGNvbnRhaW5lclRhZ05hbWU6IG51bGxcclxuICAgIH0sIG9wdGlvbnMuZHJhZ2dhYmxlT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmRyYWdnYWJsZUFjY2Vzc2libGVOYW1lID0gb3B0aW9ucy5vYmplY3RUb0dyYWJTdHJpbmc7XHJcbiAgICBvcHRpb25zLmRyYWdnYWJsZU9wdGlvbnMuaW5uZXJDb250ZW50ID0gdGhpcy5kcmFnZ2FibGVBY2Nlc3NpYmxlTmFtZTtcclxuICAgIG9wdGlvbnMuZHJhZ2dhYmxlT3B0aW9ucy5hcmlhTGFiZWwgPSB0aGlzLmRyYWdnYWJsZUFjY2Vzc2libGVOYW1lO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmdyYWJiYWJsZU9wdGlvbnMuYWNjZXNzaWJsZU5hbWUsICdHcmFiRHJhZ0ludGVyYWN0aW9uIHNldHMgaXRzIG93biBhY2Nlc3NpYmxlIG5hbWUsIHNlZSBvYmplY3RUb0dyYWJTdHJpbmcnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5ncmFiYmFibGVPcHRpb25zLmlubmVyQ29udGVudCwgJ0dyYWJEcmFnSW50ZXJhY3Rpb24gc2V0cyBpdHMgb3duIGlubmVyQ29udGVudCwgc2VlIG9iamVjdFRvR3JhYlN0cmluZycgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmdyYWJiYWJsZU9wdGlvbnMuYXJpYUxhYmVsLCAnR3JhYkRyYWdJbnRlcmFjdGlvbiBzZXRzIGl0cyBvd24gYXJpYUxhYmVsLCBzZWUgb2JqZWN0VG9HcmFiU3RyaW5nJyApO1xyXG5cclxuICAgIG9wdGlvbnMuZ3JhYmJhYmxlT3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGNvbnRhaW5lclRhZ05hbWU6ICdkaXYnLFxyXG4gICAgICBhcmlhUm9sZTogbnVsbCxcclxuICAgICAgdGFnTmFtZTogJ2J1dHRvbicsXHJcblxyXG4gICAgICAvLyBwb3NpdGlvbiB0aGUgUERPTSBlbGVtZW50cyB3aGVuIGdyYWJiYWJsZSBmb3IgZHJhZyBhbmQgZHJvcCBvbiB0b3VjaC1iYXNlZCBzY3JlZW4gcmVhZGVyc1xyXG4gICAgICBwb3NpdGlvbkluUERPTTogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIHtzdHJpbmd9XHJcbiAgICAgIGFjY2Vzc2libGVOYW1lOiBudWxsXHJcbiAgICB9LCBvcHRpb25zLmdyYWJiYWJsZU9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5ncmFiYmFibGVBY2Nlc3NpYmxlTmFtZSA9IG9wdGlvbnMuZ3JhYmJhYmxlQWNjZXNzaWJsZU5hbWUgfHwgLy8gaWYgYSBwcm92aWRlZCBvcHRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIG9wdGlvbnMuc3VwcG9ydHNHZXN0dXJlRGVzY3JpcHRpb24gPyBvcHRpb25zLm9iamVjdFRvR3JhYlN0cmluZyA6IC8vIG90aGVyd2lzZSBpZiBzdXBwb3J0aW5nIGdlc3R1cmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0cmluZ1V0aWxzLmZpbGxJbiggZ3JhYlBhdHRlcm5TdHJpbmcsIHsgLy8gZGVmYXVsdCBjYXNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdFRvR3JhYjogb3B0aW9ucy5vYmplY3RUb0dyYWJTdHJpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKSApO1xyXG4gICAgb3B0aW9ucy5ncmFiYmFibGVPcHRpb25zLmlubmVyQ29udGVudCA9IHRoaXMuZ3JhYmJhYmxlQWNjZXNzaWJsZU5hbWU7XHJcblxyXG4gICAgLy8gU2V0dGluZyB0aGUgYXJpYS1sYWJlbCBvbiB0aGUgZ3JhYmJhYmxlIGVsZW1lbnQgZml4ZXMgYSBidWcgd2l0aCBWb2ljZU92ZXIgaW4gU2FmYXJpIHdoZXJlIHRoZSBhcmlhIHJvbGVcclxuICAgIC8vIGZyb20gdGhlIGRyYWdnYWJsZSBzdGF0ZSBpcyBuZXZlciBjbGVhcmVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvNjg4XHJcbiAgICBvcHRpb25zLmdyYWJiYWJsZU9wdGlvbnMuYXJpYUxhYmVsID0gdGhpcy5ncmFiYmFibGVBY2Nlc3NpYmxlTmFtZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5ncmFiYmFibGUgPSB0cnVlOyAvLyBJZiBmYWxzZSwgdGhlbiBpbnN0ZWFkIHRoaXMgdHlwZSBpcyBpbiB0aGUgZHJhZ2dhYmxlIGludGVyYWN0aW9uIHN0YXRlLlxyXG4gICAgdGhpcy5ub2RlID0gbm9kZTtcclxuICAgIHRoaXMuZ3JhYmJhYmxlT3B0aW9ucyA9IG9wdGlvbnMuZ3JhYmJhYmxlT3B0aW9ucztcclxuICAgIHRoaXMuZHJhZ2dhYmxlT3B0aW9ucyA9IG9wdGlvbnMuZHJhZ2dhYmxlT3B0aW9ucztcclxuICAgIHRoaXMuZHJhZ0N1ZU5vZGUgPSBvcHRpb25zLmRyYWdDdWVOb2RlOyAvLyB7Tm9kZXxudWxsfVxyXG4gICAgdGhpcy5ncmFiQ3VlTm9kZSA9IG5ldyBHcmFiUmVsZWFzZUN1ZU5vZGUoIG9wdGlvbnMuZ3JhYkN1ZU9wdGlvbnMgKTtcclxuICAgIHRoaXMuc2hvd0dyYWJDdWVOb2RlID0gb3B0aW9ucy5zaG93R3JhYkN1ZU5vZGU7XHJcbiAgICB0aGlzLnNob3dEcmFnQ3VlTm9kZSA9IG9wdGlvbnMuc2hvd0RyYWdDdWVOb2RlO1xyXG4gICAgdGhpcy5vbkdyYWJiYWJsZSA9IG9wdGlvbnMub25HcmFiYmFibGU7XHJcbiAgICB0aGlzLm9uRHJhZ2dhYmxlID0gb3B0aW9ucy5vbkRyYWdnYWJsZTtcclxuICAgIHRoaXMuYWRkQXJpYURlc2NyaWJlZGJ5UHJlZGljYXRlID0gb3B0aW9ucy5hZGRBcmlhRGVzY3JpYmVkYnlQcmVkaWNhdGU7XHJcbiAgICB0aGlzLnN1cHBvcnRzR2VzdHVyZURlc2NyaXB0aW9uID0gb3B0aW9ucy5zdXBwb3J0c0dlc3R1cmVEZXNjcmlwdGlvbjtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIHRoZSBudW1iZXIgb2YgdGltZXMgdGhlIGNvbXBvbmVudCBoYXMgYmVlbiBwaWNrZWQgdXAgZm9yIGRyYWdnaW5nLCByZWdhcmRsZXNzXHJcbiAgICAvLyBvZiBwaWNrdXAgbWV0aG9kIGZvciB0aGluZ3MgbGlrZSBkZXRlcm1pbmluZyBjb250ZW50IGZvciBcImhpbnRzXCIgZGVzY3JpYmluZyB0aGUgaW50ZXJhY3Rpb25cclxuICAgIC8vIHRvIHRoZSB1c2VyXHJcbiAgICB0aGlzLm51bWJlck9mR3JhYnMgPSAwOyAvLyB7bnVtYmVyfVxyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gdGhlIG51bWJlciBvZiB0aW1lcyB0aGlzIGNvbXBvbmVudCBoYXMgYmVlbiBwaWNrZWQgdXAgd2l0aCBhIGtleWJvYXJkXHJcbiAgICAvLyBzcGVjaWZpY2FsbHkgdG8gcHJvdmlkZSBoaW50cyBzcGVjaWZpYyB0byBhbHRlcm5hdGl2ZSBpbnB1dFxyXG4gICAgdGhpcy5udW1iZXJPZktleWJvYXJkR3JhYnMgPSAwO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtzdHJpbmd8bnVsbH1cclxuICAgIC8vIHNldCB0aGUgaGVscCB0ZXh0LCBpZiBwcm92aWRlZCAtIGl0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIGFyaWEtZGVzY3JpYmVkYnkgd2hlbiBpbiB0aGUgXCJncmFiYmFibGVcIiBzdGF0ZVxyXG4gICAgdGhpcy5ub2RlLmRlc2NyaXB0aW9uQ29udGVudCA9IHRoaXMuc3VwcG9ydHNHZXN0dXJlRGVzY3JpcHRpb24gPyBvcHRpb25zLmdlc3R1cmVIZWxwVGV4dCA6IG9wdGlvbnMua2V5Ym9hcmRIZWxwVGV4dDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7T2JqZWN0fSAtIFRoZSBhcmlhLWRlc2NyaWJlZGJ5IGFzc29jaWF0aW9uIG9iamVjdCB0aGF0IHdpbGwgYXNzb2NpYXRlIFwiZ3JhYmJhYmxlXCIgd2l0aCBpdHNcclxuICAgIC8vIGhlbHAgdGV4dCBzbyB0aGF0IGl0IGlzIHJlYWQgYXV0b21hdGljYWxseSB3aGVuIHRoZSB1c2VyIGZpbmRzIGl0LiBUaGlzIHJlZmVyZW5jZSBpcyBzYXZlZCBzbyB0aGF0XHJcbiAgICAvLyB0aGUgYXNzb2NpYXRpb24gY2FuIGJlIHJlbW92ZWQgd2hlbiB0aGUgbm9kZSBiZWNvbWVzIGEgXCJkcmFnZ2FibGVcIlxyXG4gICAgdGhpcy5kZXNjcmlwdGlvbkFzc29jaWF0aW9uT2JqZWN0ID0ge1xyXG4gICAgICBvdGhlck5vZGU6IHRoaXMubm9kZSxcclxuICAgICAgdGhpc0VsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkcsXHJcbiAgICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLkRFU0NSSVBUSU9OX1NJQkxJTkdcclxuICAgIH07XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMudm9pY2luZ0ZvY3VzVXR0ZXJhbmNlID0gbmV3IFV0dGVyYW5jZSgge1xyXG4gICAgICBhbGVydDogbmV3IFJlc3BvbnNlUGFja2V0KCksXHJcbiAgICAgIGFubm91bmNlck9wdGlvbnM6IHtcclxuICAgICAgICBjYW5jZWxPdGhlcjogZmFsc2VcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGZvciBib3RoIGdyYWJiaW5nIGFuZCBkcmFnZ2luZywgdGhlIG5vZGUgd2l0aCB0aGlzIGludGVyYWN0aW9uIG11c3QgYmUgZm9jdXNhYmxlLCBleGNlcHQgd2hlbiBkaXNhYmxlZC5cclxuICAgIHRoaXMubm9kZS5mb2N1c2FibGUgPSB0cnVlO1xyXG5cclxuICAgIGFzc2VydCAmJiBub2RlLmlzVm9pY2luZyAmJiBhc3NlcnQoIG5vZGUudm9pY2luZ0ZvY3VzTGlzdGVuZXIgPT09IG5vZGUuZGVmYXVsdEZvY3VzTGlzdGVuZXIsXHJcbiAgICAgICdHcmFiRHJhZ0ludGVyYWN0aW9uIHNldHMgaXRzIG93biB2b2ljaW5nRm9jdXNMaXN0ZW5lci4nICk7XHJcblxyXG4gICAgLy8gXCJyZWxlYXNlZFwiIGFsZXJ0cyBhcmUgYXNzZXJ0aXZlIHNvIHRoYXQgYSBwaWxlIHVwIG9mIGFsZXJ0cyBkb2Vzbid0IGhhcHBlbiB3aXRoIHJhcGlkIG1vdmVtZW50LCBzZWVcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iYWxsb29ucy1hbmQtc3RhdGljLWVsZWN0cmljaXR5L2lzc3Vlcy80OTFcclxuICAgIGNvbnN0IHJlbGVhc2VkVXR0ZXJhbmNlID0gbmV3IFV0dGVyYW5jZSgge1xyXG4gICAgICBhbGVydDogbmV3IFJlc3BvbnNlUGFja2V0KCB7IG9iamVjdFJlc3BvbnNlOiByZWxlYXNlZFN0cmluZyB9ICksXHJcblxyXG4gICAgICAvLyBUaGlzIHdhcyBiZWluZyBvYnNjdXJlZCBieSBvdGhlciBtZXNzYWdlcywgdGhlIHByaW9yaXR5IGhlbHBzIG1ha2Ugc3VyZSBpdCBpcyBoZWFyZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mcmljdGlvbi9pc3N1ZXMvMzI1XHJcbiAgICAgIHByaW9yaXR5OiBVdHRlcmFuY2UuTUVESVVNX1BSSU9SSVRZLFxyXG5cclxuICAgICAgYW5ub3VuY2VyT3B0aW9uczoge1xyXG4gICAgICAgIGFyaWFMaXZlUHJpb3JpdHk6IEFyaWFMaXZlQW5ub3VuY2VyLkFyaWFMaXZlLkFTU0VSVElWRSAvLyBmb3IgQXJpYUxpdmVBbm5vdW5jZXJcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGlmICggbm9kZS5pc1ZvaWNpbmcgKSB7XHJcblxyXG4gICAgICAvLyBzYW5pdHkgY2hlY2sgb24gdGhlIHZvaWNpbmcgaW50ZXJmYWNlIEFQSS5cclxuICAgICAgYXNzZXJ0SGFzUHJvcGVydGllcyggbm9kZSwgWyAndm9pY2luZ0ZvY3VzTGlzdGVuZXInIF0gKTtcclxuXHJcbiAgICAgIG5vZGUudm9pY2luZ0ZvY3VzTGlzdGVuZXIgPSBldmVudCA9PiB7XHJcblxyXG4gICAgICAgIC8vIFdoZW4gc3dhcHBpbmcgZnJvbSBncmFiYmFibGUgdG8gZHJhZ2dhYmxlLCB0aGUgZHJhZ2dhYmxlIGVsZW1lbnQgd2lsbCBiZSBmb2N1c2VkLCBpZ25vcmUgdGhhdCBjYXNlIGhlcmUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZnJpY3Rpb24vaXNzdWVzLzIxM1xyXG4gICAgICAgIHRoaXMuZ3JhYmJhYmxlICYmIG5vZGUuZGVmYXVsdEZvY3VzTGlzdGVuZXIoIGV2ZW50ICk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBUaGVzZSBVdHRlcmFuY2VzIHNob3VsZCBvbmx5IGJlIGFubm91bmNlZCBpZiB0aGUgTm9kZSBpcyBnbG9iYWxseSB2aXNpYmxlIGFuZCB2b2ljaW5nVmlzaWJsZS5cclxuICAgICAgVm9pY2luZy5yZWdpc3RlclV0dGVyYW5jZVRvVm9pY2luZ05vZGUoIHJlbGVhc2VkVXR0ZXJhbmNlLCBub2RlICk7XHJcbiAgICAgIFZvaWNpbmcucmVnaXN0ZXJVdHRlcmFuY2VUb1ZvaWNpbmdOb2RlKCB0aGlzLnZvaWNpbmdGb2N1c1V0dGVyYW5jZSwgbm9kZSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gd3JhcCB0aGUgb3B0aW9uYWwgb25SZWxlYXNlIGluIGxvZ2ljIHRoYXQgaXMgbmVlZGVkIGZvciB0aGUgY29yZSB0eXBlLlxyXG4gICAgdGhpcy5vblJlbGVhc2UgPSAoKSA9PiB7XHJcbiAgICAgIG9wdGlvbnMub25SZWxlYXNlICYmIG9wdGlvbnMub25SZWxlYXNlKCk7XHJcblxyXG4gICAgICB0aGlzLm5vZGUuYWxlcnREZXNjcmlwdGlvblV0dGVyYW5jZSggcmVsZWFzZWRVdHRlcmFuY2UgKTtcclxuICAgICAgbm9kZS5pc1ZvaWNpbmcgJiYgVm9pY2luZy5hbGVydFV0dGVyYW5jZSggcmVsZWFzZWRVdHRlcmFuY2UgKTtcclxuICAgIH07XHJcbiAgICB0aGlzLm9uR3JhYiA9IG9wdGlvbnMub25HcmFiOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gVGFrZSBoaWdobGlnaHRzIGZyb20gdGhlIG5vZGUgZm9yIHRoZSBncmFiIGJ1dHRvbiBpbnRlcmFjdGlvbi4gVGhlIEludGVyYWN0aXZlIEhpZ2hsaWdodHMgY2Fubm90XHJcbiAgICAvLyBmYWxsIGJhY2sgdG8gdGhlIGRlZmF1bHQgZm9jdXMgaGlnaGxpZ2h0cyBiZWNhdXNlIEdyYWJEcmFnSW50ZXJhY3Rpb24gYWRkcyBcImdyYWIgY3VlXCIgTm9kZXMgYXMgY2hpbGRyZW5cclxuICAgIC8vIHRvIHRoZSBmb2N1cyBoaWdobGlnaHRzIHRoYXQgc2hvdWxkIG5vdCBiZSBkaXNwbGF5ZWQgd2hlbiB1c2luZyBJbnRlcmFjdGl2ZSBIaWdobGlnaHRzLlxyXG4gICAgdGhpcy5ncmFiRm9jdXNIaWdobGlnaHQgPSBub2RlLmZvY3VzSGlnaGxpZ2h0IHx8IG5ldyBGb2N1c0hpZ2hsaWdodEZyb21Ob2RlKCBub2RlICk7XHJcbiAgICB0aGlzLmdyYWJJbnRlcmFjdGl2ZUhpZ2hsaWdodCA9IG5vZGUuaW50ZXJhY3RpdmVIaWdobGlnaHQgfHwgbmV3IEZvY3VzSGlnaGxpZ2h0RnJvbU5vZGUoIG5vZGUgKTtcclxuXHJcbiAgICBub2RlLmZvY3VzSGlnaGxpZ2h0ID0gdGhpcy5ncmFiRm9jdXNIaWdobGlnaHQ7XHJcbiAgICBub2RlLmludGVyYWN0aXZlSGlnaGxpZ2h0ID0gdGhpcy5ncmFiSW50ZXJhY3RpdmVIaWdobGlnaHQ7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBNYWtlIHRoZSBkcmFnZ2FibGUgaGlnaGxpZ2h0cyBpbiB0aGUgc3BpdHRpbmcgaW1hZ2Ugb2YgdGhlIG5vZGUncyBncmFiYmFibGUgaGlnaGxpZ2h0c1xyXG4gICAgdGhpcy5kcmFnRm9jdXNIaWdobGlnaHQgPSBuZXcgRm9jdXNIaWdobGlnaHRQYXRoKCB0aGlzLmdyYWJGb2N1c0hpZ2hsaWdodC5zaGFwZSwge1xyXG4gICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgdHJhbnNmb3JtU291cmNlTm9kZTogdGhpcy5ncmFiRm9jdXNIaWdobGlnaHQudHJhbnNmb3JtU291cmNlTm9kZSB8fCBub2RlXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmRyYWdJbnRlcmFjdGl2ZUhpZ2hsaWdodCA9IG5ldyBGb2N1c0hpZ2hsaWdodFBhdGgoIHRoaXMuZ3JhYkludGVyYWN0aXZlSGlnaGxpZ2h0LnNoYXBlLCB7XHJcbiAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICB0cmFuc2Zvcm1Tb3VyY2VOb2RlOiB0aGlzLmdyYWJJbnRlcmFjdGl2ZUhpZ2hsaWdodC50cmFuc2Zvcm1Tb3VyY2VOb2RlIHx8IG5vZGVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHBhc3NlZCBpbiBub2RlJ3MgZm9jdXNIaWdobGlnaHQgdG8gbWFrZSBpdCBkYXNoZWQgZm9yIHRoZSBcImRyYWdnYWJsZVwiIHN0YXRlXHJcbiAgICB0aGlzLmRyYWdGb2N1c0hpZ2hsaWdodC5tYWtlRGFzaGVkKCk7XHJcbiAgICB0aGlzLmRyYWdJbnRlcmFjdGl2ZUhpZ2hsaWdodC5tYWtlRGFzaGVkKCk7XHJcblxyXG4gICAgLy8gaWYgdGhlIE5vZGUgbGF5ZXJzIGl0cyBpbnRlcmFjdGl2ZSBoaWdobGlnaHRzIGluIHRoZSBzY2VuZSBncmFwaCwgYWRkIHRoZSBkcmFnSW50ZXJhY3RpdmVIaWdobGlnaHQgaW4gdGhlIHNhbWVcclxuICAgIC8vIHdheSB0aGUgZ3JhYkludGVyYWN0aXZlSGlnaGxpZ2h0IHdhcyBhZGRlZFxyXG4gICAgaWYgKCBub2RlLmludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlICkge1xyXG4gICAgICB0aGlzLmdyYWJJbnRlcmFjdGl2ZUhpZ2hsaWdodC5wYXJlbnQuYWRkQ2hpbGQoIHRoaXMuZHJhZ0ludGVyYWN0aXZlSGlnaGxpZ2h0ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgZXZlciB3ZSB1cGRhdGUgdGhlIG5vZGUncyBoaWdobGlnaHRzLCB0aGVuIHVwZGF0ZSB0aGUgZ3JhYiBidXR0b24ncyB0b28gdG8ga2VlcCBpbiBzeW4uXHJcbiAgICBjb25zdCBvbkZvY3VzSGlnaGxpZ2h0Q2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLmRyYWdGb2N1c0hpZ2hsaWdodC5zZXRTaGFwZSggdGhpcy5ncmFiRm9jdXNIaWdobGlnaHQuc2hhcGUgKTtcclxuICAgIH07XHJcbiAgICB0aGlzLmdyYWJGb2N1c0hpZ2hsaWdodC5oaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5hZGRMaXN0ZW5lciggb25Gb2N1c0hpZ2hsaWdodENoYW5nZSApO1xyXG5cclxuICAgIGNvbnN0IG9uSW50ZXJhY3RpdmVIaWdobGlnaHRDaGFuZ2UgPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMuZHJhZ0ludGVyYWN0aXZlSGlnaGxpZ2h0LnNldFNoYXBlKCB0aGlzLmdyYWJJbnRlcmFjdGl2ZUhpZ2hsaWdodC5zaGFwZSApO1xyXG4gICAgfTtcclxuICAgIHRoaXMuZ3JhYkludGVyYWN0aXZlSGlnaGxpZ2h0LmhpZ2hsaWdodENoYW5nZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBvbkludGVyYWN0aXZlSGlnaGxpZ2h0Q2hhbmdlICk7XHJcblxyXG4gICAgLy8gb25seSB0aGUgZm9jdXMgaGlnaGxpZ2h0cyBoYXZlIFwiY3VlXCIgTm9kZXMgc28gd2UgZG8gbm90IG5lZWQgdG8gZG8gYW55IHdvcmsgaGVyZSBmb3IgdGhlIEludGVyYWN0aXZlIEhpZ2hsaWdodHNcclxuICAgIHRoaXMuZ3JhYkN1ZU5vZGUucHJlcGVuZE1hdHJpeCggbm9kZS5nZXRNYXRyaXgoKSApO1xyXG4gICAgdGhpcy5ncmFiRm9jdXNIaWdobGlnaHQuYWRkQ2hpbGQoIHRoaXMuZ3JhYkN1ZU5vZGUgKTtcclxuICAgIGlmICggdGhpcy5kcmFnQ3VlTm9kZSApIHtcclxuICAgICAgdGhpcy5kcmFnQ3VlTm9kZS5wcmVwZW5kTWF0cml4KCBub2RlLmdldE1hdHJpeCgpICk7XHJcbiAgICAgIHRoaXMuZHJhZ0ZvY3VzSGlnaGxpZ2h0LmFkZENoaWxkKCB0aGlzLmRyYWdDdWVOb2RlICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU29tZSBrZXkgcHJlc3NlcyBjYW4gZmlyZSB0aGUgbm9kZSdzIGNsaWNrICh0aGUgZ3JhYiBidXR0b24pIGZyb20gdGhlIHNhbWUgcHJlc3MgdGhhdCBmaXJlcyB0aGUga2V5ZG93biBmcm9tXHJcbiAgICAvLyB0aGUgZHJhZ2dhYmxlLCBzbyBndWFyZCBhZ2FpbnN0IHRoYXQuXHJcbiAgICBsZXQgZ3VhcmRLZXlQcmVzc0Zyb21EcmFnZ2FibGUgPSBmYWxzZTtcclxuXHJcbiAgICAvLyB3aGVuIHRoZSBcIkdyYWIge3t0aGluZ319XCIgYnV0dG9uIGlzIHByZXNzZWQsIGZvY3VzIHRoZSBkcmFnZ2FibGUgbm9kZSBhbmQgc2V0IHRvIGRyYWdnZWQgc3RhdGVcclxuICAgIGNvbnN0IGdyYWJCdXR0b25MaXN0ZW5lciA9IHtcclxuICAgICAgY2xpY2s6IGV2ZW50ID0+IHtcclxuXHJcbiAgICAgICAgLy8gZG9uJ3QgdHVybiB0byBkcmFnZ2FibGUgb24gbW9iaWxlIGExMXksIGl0IGlzIHRoZSB3cm9uZyBnZXN0dXJlIC0gdXNlciBzaG91bGQgcHJlc3MgZG93biBhbmQgaG9sZFxyXG4gICAgICAgIC8vIHRvIGluaXRpYXRlIGEgZHJhZ1xyXG4gICAgICAgIGlmICggdGhpcy5zdXBwb3J0c0dlc3R1cmVEZXNjcmlwdGlvbiApIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGlmIHRoZSBkcmFnZ2FibGUgd2FzIGp1c3QgcmVsZWFzZWQsIGRvbid0IHBpY2sgaXQgdXAgYWdhaW4gdW50aWwgdGhlIG5leHQgY2xpY2sgZXZlbnQgc28gd2UgZG9uJ3QgXCJsb29wXCJcclxuICAgICAgICAvLyBhbmQgcGljayBpdCB1cCBpbW1lZGlhdGVseSBhZ2Fpbi5cclxuICAgICAgICBpZiAoICFndWFyZEtleVByZXNzRnJvbURyYWdnYWJsZSApIHtcclxuXHJcbiAgICAgICAgICAvLyBibHVyIGFzIGEgZ3JhYmJhYmxlIHNvIHRoYXQgd2UgZ2V0YSBuZXcgZm9jdXMgZXZlbnQgYWZ0ZXIgd2UgdHVybiBpbnRvIGEgZHJhZ2dhYmxlXHJcbiAgICAgICAgICB0aGlzLm5vZGUuYmx1cigpO1xyXG5cclxuICAgICAgICAgIHRoaXMudHVyblRvRHJhZ2dhYmxlKCk7XHJcblxyXG4gICAgICAgICAgdGhpcy5udW1iZXJPZktleWJvYXJkR3JhYnMrKztcclxuXHJcbiAgICAgICAgICAvLyBmb2N1cyBhZnRlciB0aGUgdHJhbnNpdGlvblxyXG4gICAgICAgICAgdGhpcy5ub2RlLmZvY3VzKCk7XHJcblxyXG4gICAgICAgICAgdGhpcy5vbkdyYWIoIGV2ZW50ICk7XHJcblxyXG4gICAgICAgICAgLy8gQWRkIHRoZSBuZXdseSBjcmVhdGVkIGZvY3VzSGlnaGxpZ2h0IHRvIHRoZSBzY2VuZSBncmFwaCBpZiBmb2N1c0hpZ2hsaWdodExheWVyYWJsZSwganVzdCBsaWtlIHRoZVxyXG4gICAgICAgICAgLy8gb3JpZ2luYWwgZm9jdXMgaGlnaGxpZ2h0IHdhcyBhZGRlZC4gQnkgZG9pbmcgdGhpcyBvbiBjbGljaywgd2UgbWFrZSBzdXJlIHRoYXQgdGhlIG5vZGUnc1xyXG4gICAgICAgICAgLy8gZm9jdXNIaWdobGlnaHQgaGFzIGJlZW4gY29tcGxldGVseSBjb25zdHJ1Y3RlZCAoYWRkZWQgdG8gdGhlIHNjZW5lIGdyYXBoKSBhbmQgY2FuIHVzZSBpdHMgcGFyZW50LiBCdXQgb25seVxyXG4gICAgICAgICAgLy8gZG8gaXQgb25jZS5cclxuICAgICAgICAgIGlmICggbm9kZS5mb2N1c0hpZ2hsaWdodExheWVyYWJsZSApIHtcclxuICAgICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5ncmFiRm9jdXNIaWdobGlnaHQucGFyZW50LCAnaG93IGNhbiB3ZSBoYXZlIGZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlIHdpdGggYSAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbm9kZSB0aGF0IGlzIG5vdCBpbiB0aGUgc2NlbmUgZ3JhcGg/JyApO1xyXG4gICAgICAgICAgICAvLyBJZiBub3QgeWV0IGFkZGVkLCBkbyBzbyBub3cuXHJcbiAgICAgICAgICAgIGlmICggIXRoaXMuZ3JhYkZvY3VzSGlnaGxpZ2h0LnBhcmVudC5oYXNDaGlsZCggdGhpcy5kcmFnRm9jdXNIaWdobGlnaHQgKSApIHtcclxuICAgICAgICAgICAgICB0aGlzLmdyYWJGb2N1c0hpZ2hsaWdodC5wYXJlbnQuYWRkQ2hpbGQoIHRoaXMuZHJhZ0ZvY3VzSGlnaGxpZ2h0ICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFwiZ3JhYlwiIHRoZSBkcmFnZ2FibGUgb24gdGhlIG5leHQgY2xpY2sgZXZlbnRcclxuICAgICAgICBndWFyZEtleVByZXNzRnJvbURyYWdnYWJsZSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgZm9jdXM6ICgpID0+IHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpc2liaWxpdHlGb3JDdWVzKCk7XHJcblxyXG4gICAgICAgIGlmICggdGhpcy5ub2RlLmlzVm9pY2luZyAmJiB0aGlzLnNob3dHcmFiQ3VlTm9kZSgpICkge1xyXG4gICAgICAgICAgdGhpcy52b2ljaW5nRm9jdXNVdHRlcmFuY2UuYWxlcnQuaGludFJlc3BvbnNlID0gU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkuZ3JhYkRyYWcuc3BhY2VUb0dyYWJPclJlbGVhc2VTdHJpbmdQcm9wZXJ0eTtcclxuICAgICAgICAgIFZvaWNpbmcuYWxlcnRVdHRlcmFuY2UoIHRoaXMudm9pY2luZ0ZvY3VzVXR0ZXJhbmNlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgYmx1cjogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZ3JhYkN1ZU5vZGUudmlzaWJsZSA9IG9wdGlvbnMuc2hvd0dyYWJDdWVOb2RlKCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBrZWVwIHRyYWNrIG9mIGFsbCBsaXN0ZW5lcnMgdG8gc3dhcCBvdXQgZ3JhYi9kcmFnIGZ1bmN0aW9uYWxpdGllc1xyXG4gICAgdGhpcy5saXN0ZW5lcnNGb3JHcmFiU3RhdGUgPSBvcHRpb25zLmxpc3RlbmVyc0ZvckdyYWJTdGF0ZS5jb25jYXQoIGdyYWJCdXR0b25MaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIHVzZSBhcnJvdyBmdW5jdGlvbnMgc28gdGhhdCB3ZSBjYW4gaGF2ZSB0aGUgcmlnaHQgXCJ0aGlzXCIgcmVmZXJlbmNlXHJcbiAgICBjb25zdCBkcmFnRGl2TGlzdGVuZXIgPSB7XHJcblxyXG4gICAgICAvLyBSZWxlYXNlIHRoZSBkcmFnZ2FibGUgb24gJ2VudGVyJyBrZXksIHRyYWNraW5nIHRoYXQgd2UgaGF2ZSByZWxlYXNlZCB0aGUgZHJhZ2dhYmxlIHdpdGggdGhpcyBrZXkgc28gdGhhdFxyXG4gICAgICAvLyB3ZSBkb24ndCBpbW1lZGlhdGVseSBjYXRjaCB0aGUgJ2NsaWNrJyBldmVudCB3aGlsZSB0aGUgZW50ZXIga2V5IGlzIGRvd24gb24gdGhlIGJ1dHRvblxyXG4gICAgICBrZXlkb3duOiBldmVudCA9PiB7XHJcbiAgICAgICAgaWYgKCBLZXlib2FyZFV0aWxzLmlzS2V5RXZlbnQoIGV2ZW50LmRvbUV2ZW50LCBLZXlib2FyZFV0aWxzLktFWV9FTlRFUiApICkge1xyXG5cclxuICAgICAgICAgIC8vIHNldCBhIGd1YXJkIHRvIG1ha2Ugc3VyZSB0aGUga2V5IHByZXNzIGZyb20gZW50ZXIgZG9lc24ndCBmaXJlIGZ1dHVyZSBsaXN0ZW5lcnMsIHRoZXJlZm9yZVxyXG4gICAgICAgICAgLy8gXCJjbGlja2luZ1wiIHRoZSBncmFiIGJ1dHRvbiBhbHNvIG9uIHRoaXMga2V5IHByZXNzLlxyXG4gICAgICAgICAgZ3VhcmRLZXlQcmVzc0Zyb21EcmFnZ2FibGUgPSB0cnVlO1xyXG4gICAgICAgICAgdGhpcy5yZWxlYXNlRHJhZ2dhYmxlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBrZXl1cDogZXZlbnQgPT4ge1xyXG5cclxuICAgICAgICAvLyBSZWxlYXNlICBvbiBrZXl1cCBvZiBzcGFjZWJhciBzbyB0aGF0IHdlIGRvbid0IHBpY2sgdXAgdGhlIGRyYWdnYWJsZSBhZ2FpbiB3aGVuIHdlIHJlbGVhc2UgdGhlIHNwYWNlYmFyXHJcbiAgICAgICAgLy8gYW5kIHRyaWdnZXIgYSBjbGljayBldmVudCAtIGVzY2FwZSBjb3VsZCBiZSBhZGRlZCB0byBlaXRoZXIga2V5dXAgb3Iga2V5ZG93biBsaXN0ZW5lcnNcclxuICAgICAgICBpZiAoIEtleWJvYXJkVXRpbHMuaXNBbnlLZXlFdmVudCggZXZlbnQuZG9tRXZlbnQsIFsgS2V5Ym9hcmRVdGlscy5LRVlfU1BBQ0UsIEtleWJvYXJkVXRpbHMuS0VZX0VTQ0FQRSBdICkgKSB7XHJcbiAgICAgICAgICB0aGlzLnJlbGVhc2VEcmFnZ2FibGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGlmIHN1Y2Nlc3NmdWxseSBkcmFnZ2VkLCB0aGVuIG1ha2UgdGhlIGN1ZSBub2RlIGludmlzaWJsZVxyXG4gICAgICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eUZvckN1ZXMoKTtcclxuICAgICAgfSxcclxuICAgICAgYmx1cjogKCkgPT4gdGhpcy5yZWxlYXNlRHJhZ2dhYmxlKCksXHJcbiAgICAgIGZvY3VzOiAoKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIGlmIHN1Y2Nlc3NmdWxseSBkcmFnZ2VkLCB0aGVuIG1ha2UgdGhlIGN1ZSBub2RlIGludmlzaWJsZVxyXG4gICAgICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eUZvckN1ZXMoKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5saXN0ZW5lcnNGb3JEcmFnU3RhdGUgPSBvcHRpb25zLmxpc3RlbmVyc0ZvckRyYWdTdGF0ZS5jb25jYXQoIFsgZHJhZ0Rpdkxpc3RlbmVyLCBrZXlib2FyZERyYWdMaXN0ZW5lciBdICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBmcm9tIG5vbi1QRE9NIHBvaW50ZXIgZXZlbnRzLCBjaGFuZ2UgcmVwcmVzZW50YXRpb25zIGluIHRoZSBQRE9NIC0gbmVjZXNzYXJ5IGZvciBhY2Nlc3NpYmxlIHRlY2ggdGhhdFxyXG4gICAgLy8gdXNlcyBwb2ludGVyIGV2ZW50cyBsaWtlIGlPUyBWb2ljZU92ZXIuIFRoZSBhYm92ZSBsaXN0ZW5lcnMgbWFuYWdlIGlucHV0IGZyb20gdGhlIFBET00uXHJcbiAgICB0aGlzLnByZXNzTGlzdGVuZXIgPSBuZXcgUHJlc3NMaXN0ZW5lcigge1xyXG4gICAgICBwcmVzczogZXZlbnQgPT4ge1xyXG4gICAgICAgIGlmICggIWV2ZW50LmlzRnJvbVBET00oKSApIHtcclxuICAgICAgICAgIHRoaXMudHVyblRvRHJhZ2dhYmxlKCk7XHJcbiAgICAgICAgICB0aGlzLm9uR3JhYiggZXZlbnQgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHJlbGVhc2U6IGV2ZW50ID0+IHtcclxuXHJcbiAgICAgICAgLy8gcmVsZWFzZSBpZiBQcmVzc0xpc3RlbmVyIGlzIGludGVycnVwdGVkLCBidXQgb25seSBpZiBub3QgYWxyZWFkeVxyXG4gICAgICAgIC8vIGdyYWJiYWJsZSwgd2hpY2ggaXMgcG9zc2libGUgaWYgdGhlIEdyYWJEcmFnSW50ZXJhY3Rpb24gaGFzIGJlZW5cclxuICAgICAgICAvLyByZXNldCBzaW5jZSBwcmVzc1xyXG4gICAgICAgIGlmICggKCBldmVudCA9PT0gbnVsbCB8fCAhZXZlbnQuaXNGcm9tUERPTSgpICkgJiYgIXRoaXMuZ3JhYmJhYmxlICkge1xyXG4gICAgICAgICAgdGhpcy5yZWxlYXNlRHJhZ2dhYmxlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gdGhpcyBsaXN0ZW5lciBzaG91bGRuJ3QgcHJldmVudCB0aGUgYmVoYXZpb3Igb2Ygb3RoZXIgbGlzdGVuZXJzLCBhbmQgdGhpcyBsaXN0ZW5lciBzaG91bGQgYWx3YXlzIGZpcmVcclxuICAgICAgLy8gd2hldGhlciBvciBub3QgdGhlIHBvaW50ZXIgaXMgYWxyZWFkeSBhdHRhY2hlZFxyXG4gICAgICBhdHRhY2g6IGZhbHNlLFxyXG4gICAgICBlbmFibGVkUHJvcGVydHk6IHRoaXMuZW5hYmxlZFByb3BlcnR5LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ByZXNzTGlzdGVuZXInIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMubm9kZS5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLnByZXNzTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBJbml0aWFsaXplIHRoZSBOb2RlIGFzIGEgZ3JhYmJhYmxlIChidXR0b24pIHRvIGJlZ2luIHdpdGhcclxuICAgIHRoaXMudHVyblRvR3JhYmJhYmxlKCk7XHJcblxyXG4gICAgdGhpcy5lbmFibGVkUHJvcGVydHkubGF6eUxpbmsoIGVuYWJsZWQgPT4ge1xyXG4gICAgICAhZW5hYmxlZCAmJiB0aGlzLmludGVycnVwdCgpO1xyXG5cclxuICAgICAgLy8gRGlzYWJsZWQgR3JhYkRyYWdJbnRlcmFjdGlvbnMgd2lsbCBiZSB1bmFibGUgdG8gYmUgaW50ZXJhY3RlZCB3aXRoLlxyXG4gICAgICB0aGlzLm5vZGUuZm9jdXNhYmxlID0gZW5hYmxlZDtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBib3VuZFVwZGF0ZVZpc2liaWxpdHlGb3JDdWVzID0gdGhpcy51cGRhdGVWaXNpYmlsaXR5Rm9yQ3Vlcy5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgdGhpcy5ub2RlLmlucHV0RW5hYmxlZFByb3BlcnR5LmxhenlMaW5rKCBib3VuZFVwZGF0ZVZpc2liaWxpdHlGb3JDdWVzICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZGlzcG9zZUdyYWJEcmFnSW50ZXJhY3Rpb24gPSAoKSA9PiB7XHJcblxyXG4gICAgICB0aGlzLm5vZGUucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5wcmVzc0xpc3RlbmVyICk7XHJcbiAgICAgIHRoaXMubm9kZS5pbnB1dEVuYWJsZWRQcm9wZXJ0eS51bmxpbmsoIGJvdW5kVXBkYXRlVmlzaWJpbGl0eUZvckN1ZXMgKTtcclxuXHJcbiAgICAgIC8vIFJlbW92ZSBsaXN0ZW5lcnMgYWNjb3JkaW5nIHRvIHdoYXQgc3RhdGUgd2UgYXJlIGluXHJcbiAgICAgIGlmICggdGhpcy5ncmFiYmFibGUgKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVycyggdGhpcy5saXN0ZW5lcnNGb3JHcmFiU3RhdGUgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUlucHV0TGlzdGVuZXJzKCB0aGlzLmxpc3RlbmVyc0ZvckRyYWdTdGF0ZSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmdyYWJGb2N1c0hpZ2hsaWdodC5oaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggb25Gb2N1c0hpZ2hsaWdodENoYW5nZSApO1xyXG4gICAgICB0aGlzLmdyYWJJbnRlcmFjdGl2ZUhpZ2hsaWdodC5oaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggb25JbnRlcmFjdGl2ZUhpZ2hsaWdodENoYW5nZSApO1xyXG5cclxuICAgICAgLy8gUmVtb3ZlIGNoaWxkcmVuIGlmIHRoZXkgd2VyZSBhZGRlZCB0byBzdXBwb3J0IGxheWVyYWJsZSBoaWdobGlnaHRzXHJcbiAgICAgIGlmICggbm9kZS5mb2N1c0hpZ2hsaWdodExheWVyYWJsZSApIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmdyYWJGb2N1c0hpZ2hsaWdodC5wYXJlbnQsICdob3cgY2FuIHdlIGhhdmUgZm9jdXNIaWdobGlnaHRMYXllcmFibGUgd2l0aCBhICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ25vZGUgdGhhdCBpcyBub3QgaW4gdGhlIHNjZW5lIGdyYXBoPycgKTtcclxuICAgICAgICBpZiAoIHRoaXMuZ3JhYkZvY3VzSGlnaGxpZ2h0LnBhcmVudC5oYXNDaGlsZCggdGhpcy5kcmFnRm9jdXNIaWdobGlnaHQgKSApIHtcclxuICAgICAgICAgIHRoaXMuZ3JhYkZvY3VzSGlnaGxpZ2h0LnBhcmVudC5yZW1vdmVDaGlsZCggdGhpcy5kcmFnRm9jdXNIaWdobGlnaHQgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggbm9kZS5pbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSApIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmdyYWJJbnRlcmFjdGl2ZUhpZ2hsaWdodC5wYXJlbnQsICdob3cgY2FuIHdlIGhhdmUgaW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGUgd2l0aCBhICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ25vZGUgdGhhdCBpcyBub3QgaW4gdGhlIHNjZW5lIGdyYXBoPycgKTtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLmdyYWJJbnRlcmFjdGl2ZUhpZ2hsaWdodC5wYXJlbnQuaGFzQ2hpbGQoIHRoaXMuZHJhZ0ludGVyYWN0aXZlSGlnaGxpZ2h0ICkgKSB7XHJcbiAgICAgICAgICB0aGlzLmdyYWJJbnRlcmFjdGl2ZUhpZ2hsaWdodC5wYXJlbnQucmVtb3ZlQ2hpbGQoIHRoaXMuZHJhZ0ludGVyYWN0aXZlSGlnaGxpZ2h0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIG5vZGUuaXNWb2ljaW5nICkge1xyXG4gICAgICAgIFZvaWNpbmcudW5yZWdpc3RlclV0dGVyYW5jZVRvVm9pY2luZ05vZGUoIHJlbGVhc2VkVXR0ZXJhbmNlLCBub2RlICk7XHJcbiAgICAgICAgVm9pY2luZy51bnJlZ2lzdGVyVXR0ZXJhbmNlVG9Wb2ljaW5nTm9kZSggdGhpcy52b2ljaW5nRm9jdXNVdHRlcmFuY2UsIG5vZGUgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcmVtb3ZlIGN1ZSByZWZlcmVuY2VzXHJcbiAgICAgIHRoaXMuZ3JhYkZvY3VzSGlnaGxpZ2h0LnJlbW92ZUNoaWxkKCB0aGlzLmdyYWJDdWVOb2RlICk7XHJcbiAgICAgIHRoaXMuZHJhZ0N1ZU5vZGUgJiYgdGhpcy5kcmFnRm9jdXNIaWdobGlnaHQuZm9jdXNIaWdobGlnaHQucmVtb3ZlQ2hpbGQoIHRoaXMuZHJhZ0N1ZU5vZGUgKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWxlYXNlIHRoZSBkcmFnZ2FibGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVsZWFzZURyYWdnYWJsZSgpIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmdyYWJiYWJsZSwgJ2Nhbm5vdCBzZXQgdG8gZ3JhYmJhYmxlIGlmIGFscmVhZHkgc2V0IHRoYXQgd2F5JyApO1xyXG4gICAgdGhpcy50dXJuVG9HcmFiYmFibGUoKTtcclxuICAgIHRoaXMub25SZWxlYXNlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiB0dXJuIHRoZSBOb2RlIGludG8gdGhlIGdyYWJiYWJsZSAoYnV0dG9uKSwgc3dhcCBvdXQgbGlzdGVuZXJzIHRvb1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdHVyblRvR3JhYmJhYmxlKCkge1xyXG4gICAgdGhpcy5ncmFiYmFibGUgPSB0cnVlO1xyXG5cclxuICAgIC8vIFRvIHN1cHBvcnQgZ2VzdHVyZSBhbmQgbW9iaWxlIHNjcmVlbiByZWFkZXJzLCB3ZSBjaGFuZ2UgdGhlIHJvbGVkZXNjcmlwdGlvbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzUzNlxyXG4gICAgaWYgKCB0aGlzLnN1cHBvcnRzR2VzdHVyZURlc2NyaXB0aW9uICkge1xyXG4gICAgICB0aGlzLm5vZGUuc2V0UERPTUF0dHJpYnV0ZSggJ2FyaWEtcm9sZWRlc2NyaXB0aW9uJywgbW92YWJsZVN0cmluZyApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMubm9kZS5oYXNQRE9NQXR0cmlidXRlKCAnYXJpYS1yb2xlZGVzY3JpcHRpb24nICkgKSB7XHJcblxyXG4gICAgICAvLyBCeSBkZWZhdWx0LCB0aGUgZ3JhYmJhYmxlIGdldHMgYSByb2xlZGVzY3JpcHRpb24gdG8gZm9yY2UgdGhlIEFUIHRvIHNheSBpdHMgcm9sZS4gVGhpcyBmaXhlcyBhIGJ1ZyBpbiBWb2ljZU92ZXJcclxuICAgICAgLy8gd2hlcmUgaXQgZmFpbHMgdG8gdXBkYXRlIHRoZSByb2xlIGFmdGVyIHR1cm5pbmcgYmFjayBpbnRvIGEgZ3JhYmJhYmxlLlxyXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvNjg4LlxyXG4gICAgICAvLyBZb3UgY2FuIG92ZXJyaWRlIHRoaXMgd2l0aCBvbkdyYWJiYWJsZSgpIGlmIG5lY2Vzc2FyeS5cclxuICAgICAgdGhpcy5ub2RlLnNldFBET01BdHRyaWJ1dGUoICdhcmlhLXJvbGVkZXNjcmlwdGlvbicsIGJ1dHRvblN0cmluZyApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy5hZGRBcmlhRGVzY3JpYmVkYnlQcmVkaWNhdGUoIHRoaXMubnVtYmVyT2ZHcmFicyApICkge1xyXG5cclxuICAgICAgLy8gdGhpcyBub2RlIGlzIGFyaWEtZGVzY3JpYmVkYnkgaXRzIG93biBkZXNjcmlwdGlvbiBjb250ZW50LCBzbyB0aGF0IHRoZSBkZXNjcmlwdGlvbiBpcyByZWFkIGF1dG9tYXRpY2FsbHlcclxuICAgICAgLy8gd2hlbiBmb3VuZCBieSB0aGUgdXNlclxyXG4gICAgICAhdGhpcy5ub2RlLmhhc0FyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uKCB0aGlzLmRlc2NyaXB0aW9uQXNzb2NpYXRpb25PYmplY3QgKSAmJiB0aGlzLm5vZGUuYWRkQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24oIHRoaXMuZGVzY3JpcHRpb25Bc3NvY2lhdGlvbk9iamVjdCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMubm9kZS5oYXNBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbiggdGhpcy5kZXNjcmlwdGlvbkFzc29jaWF0aW9uT2JqZWN0ICkgKSB7XHJcbiAgICAgIHRoaXMubm9kZS5yZW1vdmVBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbiggdGhpcy5kZXNjcmlwdGlvbkFzc29jaWF0aW9uT2JqZWN0ICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5iYXNlSW50ZXJhY3Rpb25VcGRhdGUoIHRoaXMuZ3JhYmJhYmxlT3B0aW9ucywgdGhpcy5saXN0ZW5lcnNGb3JEcmFnU3RhdGUsIHRoaXMubGlzdGVuZXJzRm9yR3JhYlN0YXRlICk7XHJcblxyXG4gICAgLy8gY2FsbGJhY2sgb24gY29tcGxldGlvblxyXG4gICAgdGhpcy5vbkdyYWJiYWJsZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHVybiB0aGUgbm9kZSBpbnRvIGEgZHJhZ2dhYmxlIGJ5IHVwZGF0aW5nIGFjY2Vzc2liaWxpdHkgcmVwcmVzZW50YXRpb24gaW4gdGhlIFBET00gYW5kIGNoYW5naW5nIGlucHV0XHJcbiAgICogbGlzdGVuZXJzLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdHVyblRvRHJhZ2dhYmxlKCkge1xyXG4gICAgdGhpcy5udW1iZXJPZkdyYWJzKys7XHJcblxyXG4gICAgdGhpcy5ncmFiYmFibGUgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBieSBkZWZhdWx0LCB0aGUgZHJhZ2dhYmxlIGhhcyByb2xlZGVzY3JpcHRpb24gb2YgXCJtb3ZhYmxlXCIuIENhbiBiZSBvdmVyd3JpdHRlbiBpbiBgb25EcmFnZ2FibGUoKWBcclxuICAgIHRoaXMubm9kZS5zZXRQRE9NQXR0cmlidXRlKCAnYXJpYS1yb2xlZGVzY3JpcHRpb24nLCBtb3ZhYmxlU3RyaW5nICk7XHJcblxyXG4gICAgLy8gVGhpcyBub2RlIGlzIGFyaWEtZGVzY3JpYmVkYnkgaXRzIG93biBkZXNjcmlwdGlvbiBjb250ZW50IG9ubHkgd2hlbiBncmFiYmFibGUsIHNvIHRoYXQgdGhlIGRlc2NyaXB0aW9uIGlzXHJcbiAgICAvLyByZWFkIGF1dG9tYXRpY2FsbHkgd2hlbiBmb3VuZCBieSB0aGUgdXNlciB3aXRoIHRoZSB2aXJ0dWFsIGN1cnNvci4gUmVtb3ZlIGl0IGZvciBkcmFnZ2FibGVcclxuICAgIGlmICggdGhpcy5ub2RlLmhhc0FyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uKCB0aGlzLmRlc2NyaXB0aW9uQXNzb2NpYXRpb25PYmplY3QgKSApIHtcclxuICAgICAgdGhpcy5ub2RlLnJlbW92ZUFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uKCB0aGlzLmRlc2NyaXB0aW9uQXNzb2NpYXRpb25PYmplY3QgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0dXJuIHRoaXMgaW50byBhIGRyYWdnYWJsZSBpbiB0aGUgbm9kZVxyXG4gICAgdGhpcy5iYXNlSW50ZXJhY3Rpb25VcGRhdGUoIHRoaXMuZHJhZ2dhYmxlT3B0aW9ucywgdGhpcy5saXN0ZW5lcnNGb3JHcmFiU3RhdGUsIHRoaXMubGlzdGVuZXJzRm9yRHJhZ1N0YXRlICk7XHJcblxyXG4gICAgLy8gY2FsbGJhY2sgb24gY29tcGxldGlvblxyXG4gICAgdGhpcy5vbkRyYWdnYWJsZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBub2RlIHRvIHN3aXRjaCBtb2RhbGl0aWVzIGJldHdlZW4gYmVpbmcgZHJhZ2dhYmxlLCBhbmQgZ3JhYmJhYmxlLiBUaGlzIGZ1bmN0aW9uIGhvbGRzIGNvZGUgdGhhdCBzaG91bGRcclxuICAgKiBiZSBjYWxsZWQgd2hlbiBzd2l0Y2hpbmcgaW4gZWl0aGVyIGRpcmVjdGlvbi5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGJhc2VJbnRlcmFjdGlvblVwZGF0ZSggb3B0aW9uc1RvTXV0YXRlLCBsaXN0ZW5lcnNUb1JlbW92ZSwgbGlzdGVuZXJzVG9BZGQgKSB7XHJcblxyXG4gICAgLy8gaW50ZXJydXB0IHByaW9yIGlucHV0LCByZXNldCB0aGUga2V5IHN0YXRlIG9mIHRoZSBkcmFnIGhhbmRsZXIgYnkgaW50ZXJydXB0aW5nIHRoZSBkcmFnLiBEb24ndCBpbnRlcnJ1cHQgYWxsXHJcbiAgICAvLyBpbnB1dCwgYnV0IGluc3RlYWQganVzdCB0aG9zZSB0byBiZSByZW1vdmVkLlxyXG4gICAgbGlzdGVuZXJzVG9SZW1vdmUuZm9yRWFjaCggbGlzdGVuZXIgPT4gbGlzdGVuZXIuaW50ZXJydXB0ICYmIGxpc3RlbmVyLmludGVycnVwdCgpICk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGFsbCBwcmV2aW91cyBsaXN0ZW5lcnMgZnJvbSB0aGUgbm9kZVxyXG4gICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVycyggbGlzdGVuZXJzVG9SZW1vdmUgKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIFBET00gb2YgdGhlIG5vZGVcclxuICAgIHRoaXMubm9kZS5tdXRhdGUoIG9wdGlvbnNUb011dGF0ZSApO1xyXG4gICAgYXNzZXJ0ICYmIHRoaXMuZW5hYmxlZFByb3BlcnR5LnZhbHVlICYmIGFzc2VydCggdGhpcy5ub2RlLmZvY3VzYWJsZSwgJ0dyYWJEcmFnSW50ZXJhY3Rpb24gbm9kZSBtdXN0IHJlbWFpbiBmb2N1c2FibGUgYWZ0ZXIgbXV0YXRpb24nICk7XHJcblxyXG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVycyggbGlzdGVuZXJzVG9BZGQgKTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZUZvY3VzSGlnaGxpZ2h0cygpO1xyXG4gICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5Rm9yQ3VlcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBmb2N1c0hpZ2hsaWdodHMgYWNjb3JkaW5nIHRvIGlmIHdlIGFyZSBpbiBncmFiYmFibGUgb3IgZHJhZ2dhYmxlIHN0YXRlXHJcbiAgICogTm8gbmVlZCB0byBzZXQgdmlzaWJpbGl0eSB0byB0cnVlLCBiZWNhdXNlIHRoYXQgd2lsbCBoYXBwZW4gZm9yIHVzIGJ5IEhpZ2hsaWdodE92ZXJsYXkgb24gZm9jdXMuXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZUZvY3VzSGlnaGxpZ2h0cygpIHtcclxuICAgIGlmICggdGhpcy5ncmFiYmFibGUgKSB7XHJcbiAgICAgIHRoaXMubm9kZS5mb2N1c0hpZ2hsaWdodCA9IHRoaXMuZ3JhYkZvY3VzSGlnaGxpZ2h0O1xyXG4gICAgICB0aGlzLm5vZGUuaW50ZXJhY3RpdmVIaWdobGlnaHQgPSB0aGlzLmdyYWJJbnRlcmFjdGl2ZUhpZ2hsaWdodDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLm5vZGUuZm9jdXNIaWdobGlnaHQgPSB0aGlzLmRyYWdGb2N1c0hpZ2hsaWdodDtcclxuICAgICAgdGhpcy5ub2RlLmludGVyYWN0aXZlSGlnaGxpZ2h0ID0gdGhpcy5kcmFnSW50ZXJhY3RpdmVIaWdobGlnaHQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGN1ZXMgZm9yIGJvdGggZ3JhYmJhYmxlIGFuZCBkcmFnZ2FibGUgc3RhdGVzLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlVmlzaWJpbGl0eUZvckN1ZXMoKSB7XHJcbiAgICBpZiAoIHRoaXMuZHJhZ0N1ZU5vZGUgKSB7XHJcbiAgICAgIHRoaXMuZHJhZ0N1ZU5vZGUudmlzaWJsZSA9IHRoaXMuc2hvd0RyYWdDdWVOb2RlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5ncmFiQ3VlTm9kZS52aXNpYmxlID0gdGhpcy5zaG93R3JhYkN1ZU5vZGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhbGwgbGlzdGVuZXJzIHRvIG5vZGVcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb25bXX1saXN0ZW5lcnNcclxuICAgKi9cclxuICBhZGRJbnB1dExpc3RlbmVycyggbGlzdGVuZXJzICkge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBsaXN0ZW5lciA9IGxpc3RlbmVyc1sgaSBdO1xyXG4gICAgICBpZiAoICF0aGlzLm5vZGUuaGFzSW5wdXRMaXN0ZW5lciggbGlzdGVuZXIgKSApIHtcclxuICAgICAgICB0aGlzLm5vZGUuYWRkSW5wdXRMaXN0ZW5lciggbGlzdGVuZXIgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIGZyb20gdGhlIG5vZGVcclxuICAgKiBAcGFyYW0gbGlzdGVuZXJzXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICByZW1vdmVJbnB1dExpc3RlbmVycyggbGlzdGVuZXJzICkge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBsaXN0ZW5lciA9IGxpc3RlbmVyc1sgaSBdO1xyXG4gICAgICBpZiAoIHRoaXMubm9kZS5oYXNJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApICkge1xyXG4gICAgICAgIHRoaXMubm9kZS5yZW1vdmVJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGlzcG9zZUdyYWJEcmFnSW50ZXJhY3Rpb24oKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVycnVwdCB0aGUgZ3JhYiBkcmFnIGludGVycmFjdGlvbiAtIGludGVycnVwdHMgYW55IGxpc3RlbmVycyBhdHRhY2hlZCBhbmQgbWFrZXMgc3VyZSB0aGVcclxuICAgKiBOb2RlIGlzIGJhY2sgaW4gaXRzIFwiZ3JhYmJhYmxlXCIgc3RhdGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGludGVycnVwdCgpIHtcclxuICAgIHRoaXMucHJlc3NMaXN0ZW5lci5pbnRlcnJ1cHQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IHRvIGluaXRpYWwgc3RhdGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcblxyXG4gICAgLy8gcmVzZXQgbnVtYmVyT2ZHcmFicyBmb3IgdHVyblRvR3JhYmJhYmxlXHJcbiAgICB0aGlzLm51bWJlck9mR3JhYnMgPSAwO1xyXG4gICAgdGhpcy50dXJuVG9HcmFiYmFibGUoKTtcclxuXHJcbiAgICB0aGlzLnZvaWNpbmdGb2N1c1V0dGVyYW5jZS5yZXNldCgpO1xyXG5cclxuICAgIC8vIHR1cm5Ub0dyYWJiYWJsZSB3aWxsIGluY3JlbWVudCB0aGlzLCBzbyByZXNldCBpdCBhZ2FpblxyXG4gICAgdGhpcy5udW1iZXJPZkdyYWJzID0gMDtcclxuICAgIHRoaXMubnVtYmVyT2ZLZXlib2FyZEdyYWJzID0gMDtcclxuICAgIHRoaXMuZ3JhYkN1ZU5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICBpZiAoIHRoaXMuZHJhZ0N1ZU5vZGUgKSB7XHJcbiAgICAgIHRoaXMuZHJhZ0N1ZU5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0dyYWJEcmFnSW50ZXJhY3Rpb24nLCBHcmFiRHJhZ0ludGVyYWN0aW9uICk7XHJcbmV4cG9ydCBkZWZhdWx0IEdyYWJEcmFnSW50ZXJhY3Rpb247Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGdCQUFnQixNQUFNLHNDQUFzQztBQUNuRSxPQUFPQyxtQkFBbUIsTUFBTSw4Q0FBOEM7QUFDOUUsT0FBT0MsU0FBUyxNQUFNLG9DQUFvQztBQUMxRCxPQUFPQyxLQUFLLE1BQU0sZ0NBQWdDO0FBQ2xELE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsU0FBU0Msc0JBQXNCLEVBQUVDLGtCQUFrQixFQUFFQyxhQUFhLEVBQUVDLElBQUksRUFBRUMsUUFBUSxFQUFFQyxhQUFhLEVBQUVDLE9BQU8sUUFBUSxnQ0FBZ0M7QUFDbEosT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxpQkFBaUIsTUFBTSxr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