// Copyright 2015-2023, University of Colorado Boulder

/**
 * An overlay that implements highlights for a Display. This is responsible for drawing the highlights and
 * observing Properties or Emitters that dictate when highlights should become active. A highlight surrounds a Node
 * to indicate that it is in focus or relevant.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import { Shape } from '../../../kite/js/imports.js';
import optionize from '../../../phet-core/js/optionize.js';
import { ActivatedReadingBlockHighlight, Display, FocusHighlightFromNode, FocusHighlightPath, FocusManager, Node, scenery, TransformTracker } from '../imports.js';
// colors for the focus highlights, can be changed for different application backgrounds or color profiles, see
// the setters and getters below for these values.
let outerHighlightColor = FocusHighlightPath.OUTER_FOCUS_COLOR;
let innerHighlightColor = FocusHighlightPath.INNER_FOCUS_COLOR;
let innerGroupHighlightColor = FocusHighlightPath.INNER_LIGHT_GROUP_FOCUS_COLOR;
let outerGroupHighlightColor = FocusHighlightPath.OUTER_LIGHT_GROUP_FOCUS_COLOR;

// Type for the "mode" of a particular highlight, signifying behavior for handling the active highlight.

// Highlights displayed by the overlay support these types. Highlight behavior works like the following:
// - If value is null, the highlight will use default stylings of FocusHighlightPath and surround the Node with focus.
// - If value is a Shape the Shape is set to a FocusHighlightPath with default stylings in the global coordinate frame.
// - If you provide a Node it is your responsibility to position it in the global coordinate frame.
// - If the value is 'invisible' no highlight will be displayed at all.
export default class HighlightOverlay {
  // The root Node of our child display

  // Trail to the node with focus, modified when focus changes
  trail = null;

  // Node with focus, modified when focus changes
  node = null;

  // A references to the highlight from the Node that is highlighted.
  activeHighlight = null;

  // Signifies method of representing focus, 'bounds'|'node'|'shape'|'invisible', modified
  // when focus changes
  mode = null;

  // Signifies method off representing group focus, 'bounds'|'node', modified when
  // focus changes
  groupMode = null;

  // The group highlight node around an ancestor of this.node when focus changes, see ParallelDOM.setGroupFocusHighlight
  // for more information on the group focus highlight, modified when focus changes
  groupHighlightNode = null;

  // Tracks transformations to the focused node and the node with a group focus highlight, modified when focus changes
  transformTracker = null;
  groupTransformTracker = null;

  // If a node is using a custom focus highlight, a reference is kept so that it can be removed from the overlay when
  // node focus changes.
  nodeModeHighlight = null;

  // If true, the active highlight is in "node" mode and is layered in the scene graph. This field lets us deactivate
  // the highlight appropriately when it is in that state.
  nodeModeHighlightLayered = false;

  // If true, the next update() will trigger an update to the highlight's transform
  transformDirty = true;

  // The main node for the highlight. It will be transformed.
  highlightNode = new Node();

  // The main Node for the ReadingBlock highlight, while ReadingBlock content is being spoken by speech synthesis.
  readingBlockHighlightNode = new Node();

  // A reference to the Node that is added when a custom node is specified as the active highlight for the
  // ReadingBlock. Stored so that we can remove it when deactivating reading block highlights.
  addedReadingBlockHighlight = null;

  // A reference to the Node that is a ReadingBlock which the Voicing framework is currently speaking about.
  activeReadingBlockNode = null;

  // Trail to the ReadingBlock Node with an active highlight around it while the voicingManager is speaking its content.
  readingBlockTrail = null;

  // Whether the transform applied to the readinBlockHighlightNode is out of date.
  readingBlockTransformDirty = true;

  // The TransformTracker used to observe changes to the transform of the Node with Reading Block focus, so that
  // the highlight can match the ReadingBlock.
  readingBlockTransformTracker = null;

  // See HighlightOverlayOptions for documentation.

  // See HighlightOverlayOptions for documentation.

  // See HighlightOverlayOptions for documentation.

  // Display that manages all highlights

  // HTML element of the display

  // Used as the focus highlight when the overlay is passed a shape

  // Used as the default case for the highlight when the highlight value is null

  // Focus highlight for 'groups' of Nodes. When descendant node has focus, ancestor with groupFocusHighlight flag will
  // have this extra focus highlight surround its local bounds
  // A parent Node for group focus highlights so visibility of all group highlights can easily be controlled
  // The highlight shown around ReadingBlock Nodes while the voicingManager is speaking.
  constructor(display, focusRootNode, providedOptions) {
    const options = optionize()({
      // Controls whether highlights related to DOM focus are visible
      pdomFocusHighlightsVisibleProperty: new BooleanProperty(true),
      // Controls whether highlights related to Interactive Highlights are visible
      interactiveHighlightsVisibleProperty: new BooleanProperty(false),
      // Controls whether highlights associated with ReadingBlocks (of the Voicing feature set) are shown when
      // pointerFocusProperty changes
      readingBlockHighlightsVisibleProperty: new BooleanProperty(false)
    }, providedOptions);
    this.display = display;
    this.focusRootNode = focusRootNode;
    this.focusRootNode.addChild(this.highlightNode);
    this.focusRootNode.addChild(this.readingBlockHighlightNode);
    this.pdomFocusHighlightsVisibleProperty = options.pdomFocusHighlightsVisibleProperty;
    this.interactiveHighlightsVisibleProperty = options.interactiveHighlightsVisibleProperty;
    this.readingBlockHighlightsVisibleProperty = options.readingBlockHighlightsVisibleProperty;
    this.focusDisplay = new Display(this.focusRootNode, {
      allowWebGL: display.isWebGLAllowed(),
      allowCSSHacks: false,
      accessibility: false,
      interactive: false
    });
    this.domElement = this.focusDisplay.domElement;
    this.domElement.style.pointerEvents = 'none';
    this.shapeFocusHighlightPath = new FocusHighlightPath(null);
    this.boundsFocusHighlightPath = new FocusHighlightFromNode(null, {
      useLocalBounds: true
    });
    this.highlightNode.addChild(this.shapeFocusHighlightPath);
    this.highlightNode.addChild(this.boundsFocusHighlightPath);
    this.groupFocusHighlightPath = new FocusHighlightFromNode(null, {
      useLocalBounds: true,
      useGroupDilation: true,
      outerLineWidth: FocusHighlightPath.GROUP_OUTER_LINE_WIDTH,
      innerLineWidth: FocusHighlightPath.GROUP_INNER_LINE_WIDTH,
      innerStroke: FocusHighlightPath.OUTER_FOCUS_COLOR
    });
    this.groupFocusHighlightParent = new Node({
      children: [this.groupFocusHighlightPath]
    });
    this.focusRootNode.addChild(this.groupFocusHighlightParent);
    this.readingBlockHighlightPath = new ActivatedReadingBlockHighlight(null);
    this.readingBlockHighlightNode.addChild(this.readingBlockHighlightPath);

    // Listeners bound once, so we can access them for removal.
    this.boundsListener = this.onBoundsChange.bind(this);
    this.transformListener = this.onTransformChange.bind(this);
    this.domFocusListener = this.onFocusChange.bind(this);
    this.readingBlockTransformListener = this.onReadingBlockTransformChange.bind(this);
    this.focusHighlightListener = this.onFocusHighlightChange.bind(this);
    this.interactiveHighlightListener = this.onInteractiveHighlightChange.bind(this);
    this.focusHighlightsVisibleListener = this.onFocusHighlightsVisibleChange.bind(this);
    this.voicingHighlightsVisibleListener = this.onVoicingHighlightsVisibleChange.bind(this);
    this.pointerFocusListener = this.onPointerFocusChange.bind(this);
    this.lockedPointerFocusListener = this.onLockedPointerFocusChange.bind(this);
    this.readingBlockFocusListener = this.onReadingBlockFocusChange.bind(this);
    this.readingBlockHighlightChangeListener = this.onReadingBlockHighlightChange.bind(this);
    FocusManager.pdomFocusProperty.link(this.domFocusListener);
    display.focusManager.pointerFocusProperty.link(this.pointerFocusListener);
    display.focusManager.readingBlockFocusProperty.link(this.readingBlockFocusListener);
    display.focusManager.lockedPointerFocusProperty.link(this.lockedPointerFocusListener);
    this.pdomFocusHighlightsVisibleProperty.link(this.focusHighlightsVisibleListener);
    this.interactiveHighlightsVisibleProperty.link(this.voicingHighlightsVisibleListener);
  }

  /**
   * Releases references
   */
  dispose() {
    if (this.hasHighlight()) {
      this.deactivateHighlight();
    }
    FocusManager.pdomFocusProperty.unlink(this.domFocusListener);
    this.pdomFocusHighlightsVisibleProperty.unlink(this.focusHighlightsVisibleListener);
    this.interactiveHighlightsVisibleProperty.unlink(this.voicingHighlightsVisibleListener);
    this.display.focusManager.pointerFocusProperty.unlink(this.pointerFocusListener);
    this.display.focusManager.readingBlockFocusProperty.unlink(this.readingBlockFocusListener);
    this.focusDisplay.dispose();
  }

  /**
   * Returns whether or not this HighlightOverlay is displaying some highlight.
   */
  hasHighlight() {
    return !!this.trail;
  }

  /**
   * Returns true if there is an active highlight around a ReadingBlock while the voicingManager is speaking its
   * Voicing content.
   */
  hasReadingBlockHighlight() {
    return !!this.readingBlockTrail;
  }

  /**
   * Activates the highlight, choosing a mode for whether the highlight will be a shape, node, or bounds.
   *
   * @param trail - The focused trail to highlight. It assumes that this trail is in this display.
   * @param node - Node receiving the highlight
   * @param nodeHighlight - the highlight to use
   * @param layerable - Is the highlight layerable in the scene graph?
   * @param visibleProperty - Property controlling the visibility for the provided highlight
   */
  activateHighlight(trail, node, nodeHighlight, layerable, visibleProperty) {
    this.trail = trail;
    this.node = node;
    const highlight = nodeHighlight;
    this.activeHighlight = highlight;

    // we may or may not track this trail depending on whether the focus highlight surrounds the trail's leaf node or
    // a different node
    let trailToTrack = trail;

    // Invisible mode - no focus highlight; this is only for testing mode, when Nodes rarely have bounds.
    if (highlight === 'invisible') {
      this.mode = 'invisible';
    }
    // Shape mode
    else if (highlight instanceof Shape) {
      this.mode = 'shape';
      this.shapeFocusHighlightPath.visible = true;
      this.shapeFocusHighlightPath.setShape(highlight);
    }
    // Node mode
    else if (highlight instanceof Node) {
      this.mode = 'node';

      // if using a focus highlight from another node, we will track that node's transform instead of the focused node
      if (highlight instanceof FocusHighlightPath) {
        const highlightPath = highlight;
        assert && assert(highlight.shape !== null, 'The shape of the Node highlight should be set by now. Does it have bounds?');
        if (highlightPath.transformSourceNode) {
          trailToTrack = highlight.getUniqueHighlightTrail(this.trail);
        }
      }

      // store the focus highlight so that it can be removed later
      this.nodeModeHighlight = highlight;
      if (layerable) {
        // flag so that we know how to deactivate in this case
        this.nodeModeHighlightLayered = true;

        // the focusHighlight is just a node in the scene graph, so set it visible - visibility of other highlights
        // controlled by visibility of parent Nodes but that cannot be done in this case because the highlight
        // can be anywhere in the scene graph, so have to check pdomFocusHighlightsVisibleProperty
        this.nodeModeHighlight.visible = visibleProperty.get();
      } else {
        // the node is already in the scene graph, so this will set visibility
        // for all instances.
        this.nodeModeHighlight.visible = true;

        // Use the node itself as the highlight
        this.highlightNode.addChild(this.nodeModeHighlight);
      }
    }
    // Bounds mode
    else {
      this.mode = 'bounds';
      this.boundsFocusHighlightPath.setShapeFromNode(this.node);
      this.boundsFocusHighlightPath.visible = true;
      this.node.localBoundsProperty.lazyLink(this.boundsListener);
      this.onBoundsChange();
    }
    this.transformTracker = new TransformTracker(trailToTrack, {
      isStatic: true
    });
    this.transformTracker.addListener(this.transformListener);

    // handle group focus highlights
    this.activateGroupHighlights();

    // update highlight colors if necessary
    this.updateHighlightColors();
    this.transformDirty = true;
  }

  /**
   * Activate a focus highlight, activating the highlight and adding a listener that will update the highlight whenever
   * the Node's focusHighlight changes
   */
  activateFocusHighlight(trail, node) {
    this.activateHighlight(trail, node, node.focusHighlight, node.focusHighlightLayerable, this.pdomFocusHighlightsVisibleProperty);

    // handle any changes to the focus highlight while the node has focus
    node.focusHighlightChangedEmitter.addListener(this.focusHighlightListener);
  }

  /**
   * Activate an interactive highlight, activating the highlight and adding a listener that will update the highlight
   * changes while it is active.
   */
  activateInteractiveHighlight(trail, node) {
    this.activateHighlight(trail, node, node.interactiveHighlight || node.focusHighlight, node.interactiveHighlightLayerable, this.interactiveHighlightsVisibleProperty);

    // handle changes to the highlight while it is active - Since the highlight can fall back to the focus highlight
    // watch for updates to redraw when that highlight changes as well
    node.interactiveHighlightChangedEmitter.addListener(this.interactiveHighlightListener);
    node.focusHighlightChangedEmitter.addListener(this.interactiveHighlightListener);
  }

  /**
   * Activate the Reading Block highlight. This highlight is separate from others in the overlay and will always
   * surround the Bounds of the focused Node. It is shown in response to certain input on Nodes with Voicing while
   * the voicingManager is speaking.
   *
   * Note that customizations for this highlight are not supported at this time, that could be added in the future if
   * we need.
   */
  activateReadingBlockHighlight(trail) {
    this.readingBlockTrail = trail;
    const readingBlockNode = trail.lastNode();
    assert && assert(readingBlockNode.isReadingBlock, 'should not activate a reading block highlight for a Node that is not a ReadingBlock');
    this.activeReadingBlockNode = readingBlockNode;
    const readingBlockHighlight = this.activeReadingBlockNode.readingBlockActiveHighlight;
    this.addedReadingBlockHighlight = readingBlockHighlight;
    if (readingBlockHighlight === 'invisible') {
      // nothing to draw
    } else if (readingBlockHighlight instanceof Shape) {
      this.readingBlockHighlightPath.setShape(readingBlockHighlight);
      this.readingBlockHighlightPath.visible = true;
    } else if (readingBlockHighlight instanceof Node) {
      // node mode
      this.readingBlockHighlightNode.addChild(readingBlockHighlight);
    } else {
      // bounds mode
      this.readingBlockHighlightPath.setShapeFromNode(this.activeReadingBlockNode);
      this.readingBlockHighlightPath.visible = true;
    }

    // update the highlight if the transform for the Node ever changes
    this.readingBlockTransformTracker = new TransformTracker(this.readingBlockTrail, {
      isStatic: true
    });
    this.readingBlockTransformTracker.addListener(this.readingBlockTransformListener);

    // update the highlight if it is changed on the Node while active
    this.activeReadingBlockNode.readingBlockActiveHighlightChangedEmitter.addListener(this.readingBlockHighlightChangeListener);
    this.readingBlockTransformDirty = true;
  }

  /**
   * Deactivate the speaking highlight by making it invisible.
   */
  deactivateReadingBlockHighlight() {
    this.readingBlockHighlightPath.visible = false;
    if (this.addedReadingBlockHighlight instanceof Node) {
      this.readingBlockHighlightNode.removeChild(this.addedReadingBlockHighlight);
    }
    assert && assert(this.readingBlockTransformTracker, 'How can we deactivate the TransformTracker if it wasnt assigned.');
    const transformTracker = this.readingBlockTransformTracker;
    transformTracker.removeListener(this.readingBlockTransformListener);
    transformTracker.dispose();
    this.readingBlockTransformTracker = null;
    assert && assert(this.activeReadingBlockNode, 'How can we deactivate the activeReadingBlockNode if it wasnt assigned.');
    this.activeReadingBlockNode.readingBlockActiveHighlightChangedEmitter.removeListener(this.readingBlockHighlightChangeListener);
    this.activeReadingBlockNode = null;
    this.readingBlockTrail = null;
    this.addedReadingBlockHighlight = null;
  }

  /**
   * Deactivates the all active highlights, disposing and removing listeners as necessary.
   */
  deactivateHighlight() {
    assert && assert(this.node, 'Need an active Node to deactivate highlights');
    const activeNode = this.node;
    if (this.mode === 'shape') {
      this.shapeFocusHighlightPath.visible = false;
    } else if (this.mode === 'node') {
      assert && assert(this.nodeModeHighlight, 'How can we deactivate if nodeModeHighlight is not assigned');
      const nodeModeHighlight = this.nodeModeHighlight;

      // If layered, client has put the Node where they want in the scene graph and we cannot remove it
      if (this.nodeModeHighlightLayered) {
        this.nodeModeHighlightLayered = false;
      } else {
        this.highlightNode.removeChild(nodeModeHighlight);
      }

      // node focus highlight can be cleared now that it has been removed
      nodeModeHighlight.visible = false;
      this.nodeModeHighlight = null;
    } else if (this.mode === 'bounds') {
      this.boundsFocusHighlightPath.visible = false;
      activeNode.localBoundsProperty.unlink(this.boundsListener);
    }

    // remove listeners that redraw the highlight if a type of highlight changes on the Node
    if (activeNode.focusHighlightChangedEmitter.hasListener(this.focusHighlightListener)) {
      activeNode.focusHighlightChangedEmitter.removeListener(this.focusHighlightListener);
    }
    const activeInteractiveHighlightingNode = activeNode;
    if (activeInteractiveHighlightingNode.isInteractiveHighlighting) {
      if (activeInteractiveHighlightingNode.interactiveHighlightChangedEmitter.hasListener(this.interactiveHighlightListener)) {
        activeInteractiveHighlightingNode.interactiveHighlightChangedEmitter.removeListener(this.interactiveHighlightListener);
      }
      if (activeInteractiveHighlightingNode.focusHighlightChangedEmitter.hasListener(this.interactiveHighlightListener)) {
        activeInteractiveHighlightingNode.focusHighlightChangedEmitter.removeListener(this.interactiveHighlightListener);
      }
    }

    // remove all 'group' focus highlights
    this.deactivateGroupHighlights();
    this.trail = null;
    this.node = null;
    this.mode = null;
    this.activeHighlight = null;
    this.transformTracker.removeListener(this.transformListener);
    this.transformTracker.dispose();
    this.transformTracker = null;
  }

  /**
   * Activate all 'group' focus highlights by searching for ancestor nodes from the node that has focus
   * and adding a rectangle around it if it has a "groupFocusHighlight". A group highlight will only appear around
   * the closest ancestor that has a one.
   */
  activateGroupHighlights() {
    assert && assert(this.trail, 'must have an active trail to activate group highlights');
    const trail = this.trail;
    for (let i = 0; i < trail.length; i++) {
      const node = trail.nodes[i];
      const highlight = node.groupFocusHighlight;
      if (highlight) {
        // update transform tracker
        const trailToParent = trail.upToNode(node);
        this.groupTransformTracker = new TransformTracker(trailToParent);
        this.groupTransformTracker.addListener(this.transformListener);
        if (typeof highlight === 'boolean') {
          // add a bounding rectangle around the node that uses group highlights
          this.groupFocusHighlightPath.setShapeFromNode(node);
          this.groupFocusHighlightPath.visible = true;
          this.groupHighlightNode = this.groupFocusHighlightPath;
          this.groupMode = 'bounds';
        } else if (highlight instanceof Node) {
          this.groupHighlightNode = highlight;
          this.groupFocusHighlightParent.addChild(highlight);
          this.groupMode = 'node';
        }

        // Only closest ancestor with group highlight will get the group highlight
        break;
      }
    }
  }

  /**
   * Update focus highlight colors. This is a no-op if we are in 'node' mode, or if none of the highlight colors
   * have changed.
   *
   * TODO: Support updating focus highlight strokes in 'node' mode as well?
   */
  updateHighlightColors() {
    if (this.mode === 'shape') {
      if (this.shapeFocusHighlightPath.innerHighlightColor !== HighlightOverlay.getInnerHighlightColor()) {
        this.shapeFocusHighlightPath.setInnerHighlightColor(HighlightOverlay.getInnerHighlightColor());
      }
      if (this.shapeFocusHighlightPath.outerHighlightColor !== HighlightOverlay.getOuterHighlightColor()) {
        this.shapeFocusHighlightPath.setOuterHighlightColor(HighlightOverlay.getOuterHighlightColor());
      }
    } else if (this.mode === 'bounds') {
      if (this.boundsFocusHighlightPath.innerHighlightColor !== HighlightOverlay.getInnerHighlightColor()) {
        this.boundsFocusHighlightPath.setInnerHighlightColor(HighlightOverlay.getInnerHighlightColor());
      }
      if (this.boundsFocusHighlightPath.outerHighlightColor !== HighlightOverlay.getOuterHighlightColor()) {
        this.boundsFocusHighlightPath.setOuterHighlightColor(HighlightOverlay.getOuterHighlightColor());
      }
    }

    // if a group focus highlight is active, update strokes
    if (this.groupMode) {
      if (this.groupFocusHighlightPath.innerHighlightColor !== HighlightOverlay.getInnerGroupHighlightColor()) {
        this.groupFocusHighlightPath.setInnerHighlightColor(HighlightOverlay.getInnerGroupHighlightColor());
      }
      if (this.groupFocusHighlightPath.outerHighlightColor !== HighlightOverlay.getOuterGroupHighlightColor()) {
        this.groupFocusHighlightPath.setOuterHighlightColor(HighlightOverlay.getOuterGroupHighlightColor());
      }
    }
  }

  /**
   * Remove all group focus highlights by making them invisible, or removing them from the root of this overlay,
   * depending on mode.
   */
  deactivateGroupHighlights() {
    if (this.groupMode) {
      if (this.groupMode === 'bounds') {
        this.groupFocusHighlightPath.visible = false;
      } else if (this.groupMode === 'node') {
        assert && assert(this.groupHighlightNode, 'Need a groupHighlightNode to deactivate this mode');
        this.groupFocusHighlightParent.removeChild(this.groupHighlightNode);
      }
      this.groupMode = null;
      this.groupHighlightNode = null;
      assert && assert(this.groupTransformTracker, 'Need a groupTransformTracker to dispose');
      this.groupTransformTracker.removeListener(this.transformListener);
      this.groupTransformTracker.dispose();
      this.groupTransformTracker = null;
    }
  }

  /**
   * Called from HighlightOverlay after transforming the highlight. Only called when the transform changes.
   */
  afterTransform() {
    if (this.mode === 'shape') {
      this.shapeFocusHighlightPath.updateLineWidth();
    } else if (this.mode === 'bounds') {
      this.boundsFocusHighlightPath.updateLineWidth();
    } else if (this.mode === 'node' && this.activeHighlight instanceof FocusHighlightPath && this.activeHighlight.updateLineWidth) {
      // Update the transform based on the transform of the node that the focusHighlight is highlighting.
      assert && assert(this.node, 'Need an active Node to update line width');
      this.activeHighlight.updateLineWidth(this.node);
    }
  }

  /**
   * Every time the transform changes on the target Node signify that updates are necessary, see the usage of the
   * TransformTrackers.
   */
  onTransformChange() {
    this.transformDirty = true;
  }

  /**
   * Mark that the transform for the ReadingBlock highlight is out of date and needs to be recalculated next update.
   */
  onReadingBlockTransformChange() {
    this.readingBlockTransformDirty = true;
  }

  /**
   * Called when bounds change on our node when we are in "Bounds" mode
   */
  onBoundsChange() {
    assert && assert(this.node, 'Must have an active node when bounds are changing');
    this.boundsFocusHighlightPath.setShapeFromNode(this.node);
  }

  /**
   * Called when the main Scenery focus pair (Display,Trail) changes. The Trail points to the Node that has
   * focus and a highlight will appear around this Node if focus highlights are visible.
   */
  onFocusChange(focus) {
    const newTrail = focus && focus.display === this.display ? focus.trail : null;
    if (this.hasHighlight()) {
      this.deactivateHighlight();
    }
    if (newTrail && this.pdomFocusHighlightsVisibleProperty.value) {
      const node = newTrail.lastNode();
      this.activateFocusHighlight(newTrail, node);
    } else if (this.display.focusManager.pointerFocusProperty.value && this.interactiveHighlightsVisibleProperty.value) {
      this.updateInteractiveHighlight(this.display.focusManager.pointerFocusProperty.value);
    }
  }

  /**
   * Called when the pointerFocusProperty changes. pointerFocusProperty will have the Trail to the
   * Node that composes Voicing and is under the Pointer. A highlight will appear around this Node if
   * voicing highlights are visible.
   */
  onPointerFocusChange(focus) {
    // updateInteractiveHighlight will only activate the highlight if pdomFocusHighlightsVisibleProperty is false,
    // but check here as well so that we don't do work to deactivate highlights only to immediately reactivate them
    if (!this.display.focusManager.lockedPointerFocusProperty.value && !this.display.focusManager.pdomFocusHighlightsVisibleProperty.value) {
      this.updateInteractiveHighlight(focus);
    }
  }

  /**
   * Redraws the highlight. There are cases where we want to do this regardless of whether the pointer focus
   * is locked, such as when the highlight changes changes for a Node that is activated for highlighting.
   *
   * As of 8/11/21 we also decided that Interactive Highlights should also never be shown while
   * PDOM highlights are visible, to avoid confusing cases where the Interactive Highlight
   * can appear while the DOM focus highlight is active and conveying information. In the future
   * we might make it so that both can be visible at the same time, but that will require
   * changing the look of one of the highlights so it is clear they are distinct.
   */
  updateInteractiveHighlight(focus) {
    const newTrail = focus && focus.display === this.display ? focus.trail : null;

    // always clear the highlight if it is being removed
    if (this.hasHighlight()) {
      this.deactivateHighlight();
    }

    // only activate a new highlight if PDOM focus highlights are not displayed, see JSDoc
    let activated = false;
    if (newTrail && !this.display.focusManager.pdomFocusHighlightsVisibleProperty.value) {
      const node = newTrail.lastNode();
      if (node.isReadingBlock && this.readingBlockHighlightsVisibleProperty.value || !node.isReadingBlock && this.interactiveHighlightsVisibleProperty.value) {
        this.activateInteractiveHighlight(newTrail, node);
        activated = true;
      }
    }
    if (!activated && FocusManager.pdomFocus && this.pdomFocusHighlightsVisibleProperty.value) {
      this.onFocusChange(FocusManager.pdomFocus);
    }
  }

  /**
   * Called whenever the lockedPointerFocusProperty changes. If the lockedPointerFocusProperty changes we probably
   * have to update the highlight because interaction with a Node that uses InteractiveHighlighting just ended.
   */
  onLockedPointerFocusChange(focus) {
    this.updateInteractiveHighlight(focus || this.display.focusManager.pointerFocusProperty.value);
  }

  /**
   * Responsible for deactivating the Reading Block highlight when the display.focusManager.readingBlockFocusProperty changes.
   * The Reading Block waits to activate until the voicingManager starts speaking because there is often a stop speaking
   * event that comes right after the speaker starts to interrupt the previous utterance.
   */
  onReadingBlockFocusChange(focus) {
    if (this.hasReadingBlockHighlight()) {
      this.deactivateReadingBlockHighlight();
    }
    const newTrail = focus && focus.display === this.display ? focus.trail : null;
    if (newTrail) {
      this.activateReadingBlockHighlight(newTrail);
    }
  }

  /**
   * If the focused node has an updated focus highlight, we must do all the work of highlight deactivation/activation
   * as if the application focus changed. If focus highlight mode changed, we need to add/remove static listeners,
   * add/remove highlight children, and so on. Called when focus highlight changes, but should only ever be
   * necessary when the node has focus.
   */
  onFocusHighlightChange() {
    assert && assert(this.node && this.node.focused, 'update should only be necessary if node already has focus');
    this.onFocusChange(FocusManager.pdomFocus);
  }

  /**
   * If the Node has pointer focus and the interacive highlight changes, we must do all of the work to reapply the
   * highlight as if the value of the focusProperty changed.
   */
  onInteractiveHighlightChange() {
    if (assert) {
      const interactiveHighlightNode = this.node;
      const lockedPointerFocus = this.display.focusManager.lockedPointerFocusProperty.value;
      assert(interactiveHighlightNode || lockedPointerFocus && lockedPointerFocus.trail.lastNode() === this.node, 'Update should only be necessary if Node is activated with a Pointer or pointer focus is locked during interaction');
    }
    this.updateInteractiveHighlight(this.display.focusManager.lockedPointerFocusProperty.value);
  }

  /**
   * Redraw the highlight for the ReadingBlock if it changes while the reading block highlight is already
   * active for a Node.
   */
  onReadingBlockHighlightChange() {
    assert && assert(this.activeReadingBlockNode, 'Update should only be necessary when there is an active ReadingBlock Node');
    assert && assert(this.activeReadingBlockNode.readingBlockActivated, 'Update should only be necessary while the ReadingBlock is activated');
    this.onReadingBlockFocusChange(this.display.focusManager.readingBlockFocusProperty.value);
  }

  /**
   * When focus highlight visibility changes, deactivate highlights or reactivate the highlight around the Node
   * with focus.
   */
  onFocusHighlightsVisibleChange() {
    this.onFocusChange(FocusManager.pdomFocus);
  }

  /**
   * When voicing highlight visibility changes, deactivate highlights or reactivate the highlight around the Node
   * with focus. Note that when voicing is disabled we will never set the pointerFocusProperty to prevent
   * extra work, so this function shouldn't do much. But it is here to complete the API.
   */
  onVoicingHighlightsVisibleChange() {
    this.onPointerFocusChange(this.display.focusManager.pointerFocusProperty.value);
  }

  /**
   * Called by Display, updates this overlay in the Display.updateDisplay call.
   */
  update() {
    // Transform the highlight to match the position of the node
    if (this.hasHighlight() && this.transformDirty) {
      this.transformDirty = false;
      assert && assert(this.transformTracker, 'The transformTracker must be available on update if transform is dirty');
      this.highlightNode.setMatrix(this.transformTracker.matrix);
      if (this.groupHighlightNode) {
        assert && assert(this.groupTransformTracker, 'The groupTransformTracker must be available on update if transform is dirty');
        this.groupHighlightNode.setMatrix(this.groupTransformTracker.matrix);
      }
      this.afterTransform();
    }
    if (this.hasReadingBlockHighlight() && this.readingBlockTransformDirty) {
      this.readingBlockTransformDirty = false;
      assert && assert(this.readingBlockTransformTracker, 'The groupTransformTracker must be available on update if transform is dirty');
      this.readingBlockHighlightNode.setMatrix(this.readingBlockTransformTracker.matrix);
    }
    if (!this.display.size.equals(this.focusDisplay.size)) {
      this.focusDisplay.setWidthHeight(this.display.width, this.display.height);
    }
    this.focusDisplay.updateDisplay();
  }

  /**
   * Set the inner color of all focus highlights.
   */
  static setInnerHighlightColor(color) {
    innerHighlightColor = color;
  }

  /**
   * Get the inner color of all focus highlights.
   */
  static getInnerHighlightColor() {
    return innerHighlightColor;
  }

  /**
   * Set the outer color of all focus highlights.
   */
  static setOuterHilightColor(color) {
    outerHighlightColor = color;
  }

  /**
   * Get the outer color of all focus highlights.
   */
  static getOuterHighlightColor() {
    return outerHighlightColor;
  }

  /**
   * Set the inner color of all group focus highlights.
   */
  static setInnerGroupHighlightColor(color) {
    innerGroupHighlightColor = color;
  }

  /**
   * Get the inner color of all group focus highlights
   */
  static getInnerGroupHighlightColor() {
    return innerGroupHighlightColor;
  }

  /**
   * Set the outer color of all group focus highlight.
   */
  static setOuterGroupHighlightColor(color) {
    outerGroupHighlightColor = color;
  }

  /**
   * Get the outer color of all group focus highlights.
   */
  static getOuterGroupHighlightColor() {
    return outerGroupHighlightColor;
  }
}
scenery.register('HighlightOverlay', HighlightOverlay);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJTaGFwZSIsIm9wdGlvbml6ZSIsIkFjdGl2YXRlZFJlYWRpbmdCbG9ja0hpZ2hsaWdodCIsIkRpc3BsYXkiLCJGb2N1c0hpZ2hsaWdodEZyb21Ob2RlIiwiRm9jdXNIaWdobGlnaHRQYXRoIiwiRm9jdXNNYW5hZ2VyIiwiTm9kZSIsInNjZW5lcnkiLCJUcmFuc2Zvcm1UcmFja2VyIiwib3V0ZXJIaWdobGlnaHRDb2xvciIsIk9VVEVSX0ZPQ1VTX0NPTE9SIiwiaW5uZXJIaWdobGlnaHRDb2xvciIsIklOTkVSX0ZPQ1VTX0NPTE9SIiwiaW5uZXJHcm91cEhpZ2hsaWdodENvbG9yIiwiSU5ORVJfTElHSFRfR1JPVVBfRk9DVVNfQ09MT1IiLCJvdXRlckdyb3VwSGlnaGxpZ2h0Q29sb3IiLCJPVVRFUl9MSUdIVF9HUk9VUF9GT0NVU19DT0xPUiIsIkhpZ2hsaWdodE92ZXJsYXkiLCJ0cmFpbCIsIm5vZGUiLCJhY3RpdmVIaWdobGlnaHQiLCJtb2RlIiwiZ3JvdXBNb2RlIiwiZ3JvdXBIaWdobGlnaHROb2RlIiwidHJhbnNmb3JtVHJhY2tlciIsImdyb3VwVHJhbnNmb3JtVHJhY2tlciIsIm5vZGVNb2RlSGlnaGxpZ2h0Iiwibm9kZU1vZGVIaWdobGlnaHRMYXllcmVkIiwidHJhbnNmb3JtRGlydHkiLCJoaWdobGlnaHROb2RlIiwicmVhZGluZ0Jsb2NrSGlnaGxpZ2h0Tm9kZSIsImFkZGVkUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0IiwiYWN0aXZlUmVhZGluZ0Jsb2NrTm9kZSIsInJlYWRpbmdCbG9ja1RyYWlsIiwicmVhZGluZ0Jsb2NrVHJhbnNmb3JtRGlydHkiLCJyZWFkaW5nQmxvY2tUcmFuc2Zvcm1UcmFja2VyIiwiY29uc3RydWN0b3IiLCJkaXNwbGF5IiwiZm9jdXNSb290Tm9kZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJwZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5IiwiaW50ZXJhY3RpdmVIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5IiwicmVhZGluZ0Jsb2NrSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eSIsImFkZENoaWxkIiwiZm9jdXNEaXNwbGF5IiwiYWxsb3dXZWJHTCIsImlzV2ViR0xBbGxvd2VkIiwiYWxsb3dDU1NIYWNrcyIsImFjY2Vzc2liaWxpdHkiLCJpbnRlcmFjdGl2ZSIsImRvbUVsZW1lbnQiLCJzdHlsZSIsInBvaW50ZXJFdmVudHMiLCJzaGFwZUZvY3VzSGlnaGxpZ2h0UGF0aCIsImJvdW5kc0ZvY3VzSGlnaGxpZ2h0UGF0aCIsInVzZUxvY2FsQm91bmRzIiwiZ3JvdXBGb2N1c0hpZ2hsaWdodFBhdGgiLCJ1c2VHcm91cERpbGF0aW9uIiwib3V0ZXJMaW5lV2lkdGgiLCJHUk9VUF9PVVRFUl9MSU5FX1dJRFRIIiwiaW5uZXJMaW5lV2lkdGgiLCJHUk9VUF9JTk5FUl9MSU5FX1dJRFRIIiwiaW5uZXJTdHJva2UiLCJncm91cEZvY3VzSGlnaGxpZ2h0UGFyZW50IiwiY2hpbGRyZW4iLCJyZWFkaW5nQmxvY2tIaWdobGlnaHRQYXRoIiwiYm91bmRzTGlzdGVuZXIiLCJvbkJvdW5kc0NoYW5nZSIsImJpbmQiLCJ0cmFuc2Zvcm1MaXN0ZW5lciIsIm9uVHJhbnNmb3JtQ2hhbmdlIiwiZG9tRm9jdXNMaXN0ZW5lciIsIm9uRm9jdXNDaGFuZ2UiLCJyZWFkaW5nQmxvY2tUcmFuc2Zvcm1MaXN0ZW5lciIsIm9uUmVhZGluZ0Jsb2NrVHJhbnNmb3JtQ2hhbmdlIiwiZm9jdXNIaWdobGlnaHRMaXN0ZW5lciIsIm9uRm9jdXNIaWdobGlnaHRDaGFuZ2UiLCJpbnRlcmFjdGl2ZUhpZ2hsaWdodExpc3RlbmVyIiwib25JbnRlcmFjdGl2ZUhpZ2hsaWdodENoYW5nZSIsImZvY3VzSGlnaGxpZ2h0c1Zpc2libGVMaXN0ZW5lciIsIm9uRm9jdXNIaWdobGlnaHRzVmlzaWJsZUNoYW5nZSIsInZvaWNpbmdIaWdobGlnaHRzVmlzaWJsZUxpc3RlbmVyIiwib25Wb2ljaW5nSGlnaGxpZ2h0c1Zpc2libGVDaGFuZ2UiLCJwb2ludGVyRm9jdXNMaXN0ZW5lciIsIm9uUG9pbnRlckZvY3VzQ2hhbmdlIiwibG9ja2VkUG9pbnRlckZvY3VzTGlzdGVuZXIiLCJvbkxvY2tlZFBvaW50ZXJGb2N1c0NoYW5nZSIsInJlYWRpbmdCbG9ja0ZvY3VzTGlzdGVuZXIiLCJvblJlYWRpbmdCbG9ja0ZvY3VzQ2hhbmdlIiwicmVhZGluZ0Jsb2NrSGlnaGxpZ2h0Q2hhbmdlTGlzdGVuZXIiLCJvblJlYWRpbmdCbG9ja0hpZ2hsaWdodENoYW5nZSIsInBkb21Gb2N1c1Byb3BlcnR5IiwibGluayIsImZvY3VzTWFuYWdlciIsInBvaW50ZXJGb2N1c1Byb3BlcnR5IiwicmVhZGluZ0Jsb2NrRm9jdXNQcm9wZXJ0eSIsImxvY2tlZFBvaW50ZXJGb2N1c1Byb3BlcnR5IiwiZGlzcG9zZSIsImhhc0hpZ2hsaWdodCIsImRlYWN0aXZhdGVIaWdobGlnaHQiLCJ1bmxpbmsiLCJoYXNSZWFkaW5nQmxvY2tIaWdobGlnaHQiLCJhY3RpdmF0ZUhpZ2hsaWdodCIsIm5vZGVIaWdobGlnaHQiLCJsYXllcmFibGUiLCJ2aXNpYmxlUHJvcGVydHkiLCJoaWdobGlnaHQiLCJ0cmFpbFRvVHJhY2siLCJ2aXNpYmxlIiwic2V0U2hhcGUiLCJoaWdobGlnaHRQYXRoIiwiYXNzZXJ0Iiwic2hhcGUiLCJ0cmFuc2Zvcm1Tb3VyY2VOb2RlIiwiZ2V0VW5pcXVlSGlnaGxpZ2h0VHJhaWwiLCJnZXQiLCJzZXRTaGFwZUZyb21Ob2RlIiwibG9jYWxCb3VuZHNQcm9wZXJ0eSIsImxhenlMaW5rIiwiaXNTdGF0aWMiLCJhZGRMaXN0ZW5lciIsImFjdGl2YXRlR3JvdXBIaWdobGlnaHRzIiwidXBkYXRlSGlnaGxpZ2h0Q29sb3JzIiwiYWN0aXZhdGVGb2N1c0hpZ2hsaWdodCIsImZvY3VzSGlnaGxpZ2h0IiwiZm9jdXNIaWdobGlnaHRMYXllcmFibGUiLCJmb2N1c0hpZ2hsaWdodENoYW5nZWRFbWl0dGVyIiwiYWN0aXZhdGVJbnRlcmFjdGl2ZUhpZ2hsaWdodCIsImludGVyYWN0aXZlSGlnaGxpZ2h0IiwiaW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGUiLCJpbnRlcmFjdGl2ZUhpZ2hsaWdodENoYW5nZWRFbWl0dGVyIiwiYWN0aXZhdGVSZWFkaW5nQmxvY2tIaWdobGlnaHQiLCJyZWFkaW5nQmxvY2tOb2RlIiwibGFzdE5vZGUiLCJpc1JlYWRpbmdCbG9jayIsInJlYWRpbmdCbG9ja0hpZ2hsaWdodCIsInJlYWRpbmdCbG9ja0FjdGl2ZUhpZ2hsaWdodCIsInJlYWRpbmdCbG9ja0FjdGl2ZUhpZ2hsaWdodENoYW5nZWRFbWl0dGVyIiwiZGVhY3RpdmF0ZVJlYWRpbmdCbG9ja0hpZ2hsaWdodCIsInJlbW92ZUNoaWxkIiwicmVtb3ZlTGlzdGVuZXIiLCJhY3RpdmVOb2RlIiwiaGFzTGlzdGVuZXIiLCJhY3RpdmVJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ05vZGUiLCJpc0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nIiwiZGVhY3RpdmF0ZUdyb3VwSGlnaGxpZ2h0cyIsImkiLCJsZW5ndGgiLCJub2RlcyIsImdyb3VwRm9jdXNIaWdobGlnaHQiLCJ0cmFpbFRvUGFyZW50IiwidXBUb05vZGUiLCJnZXRJbm5lckhpZ2hsaWdodENvbG9yIiwic2V0SW5uZXJIaWdobGlnaHRDb2xvciIsImdldE91dGVySGlnaGxpZ2h0Q29sb3IiLCJzZXRPdXRlckhpZ2hsaWdodENvbG9yIiwiZ2V0SW5uZXJHcm91cEhpZ2hsaWdodENvbG9yIiwiZ2V0T3V0ZXJHcm91cEhpZ2hsaWdodENvbG9yIiwiYWZ0ZXJUcmFuc2Zvcm0iLCJ1cGRhdGVMaW5lV2lkdGgiLCJmb2N1cyIsIm5ld1RyYWlsIiwidmFsdWUiLCJ1cGRhdGVJbnRlcmFjdGl2ZUhpZ2hsaWdodCIsImFjdGl2YXRlZCIsInBkb21Gb2N1cyIsImZvY3VzZWQiLCJpbnRlcmFjdGl2ZUhpZ2hsaWdodE5vZGUiLCJsb2NrZWRQb2ludGVyRm9jdXMiLCJyZWFkaW5nQmxvY2tBY3RpdmF0ZWQiLCJ1cGRhdGUiLCJzZXRNYXRyaXgiLCJtYXRyaXgiLCJzaXplIiwiZXF1YWxzIiwic2V0V2lkdGhIZWlnaHQiLCJ3aWR0aCIsImhlaWdodCIsInVwZGF0ZURpc3BsYXkiLCJjb2xvciIsInNldE91dGVySGlsaWdodENvbG9yIiwic2V0SW5uZXJHcm91cEhpZ2hsaWdodENvbG9yIiwic2V0T3V0ZXJHcm91cEhpZ2hsaWdodENvbG9yIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJIaWdobGlnaHRPdmVybGF5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEFuIG92ZXJsYXkgdGhhdCBpbXBsZW1lbnRzIGhpZ2hsaWdodHMgZm9yIGEgRGlzcGxheS4gVGhpcyBpcyByZXNwb25zaWJsZSBmb3IgZHJhd2luZyB0aGUgaGlnaGxpZ2h0cyBhbmRcclxuICogb2JzZXJ2aW5nIFByb3BlcnRpZXMgb3IgRW1pdHRlcnMgdGhhdCBkaWN0YXRlIHdoZW4gaGlnaGxpZ2h0cyBzaG91bGQgYmVjb21lIGFjdGl2ZS4gQSBoaWdobGlnaHQgc3Vycm91bmRzIGEgTm9kZVxyXG4gKiB0byBpbmRpY2F0ZSB0aGF0IGl0IGlzIGluIGZvY3VzIG9yIHJlbGV2YW50LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB7IEFjdGl2YXRlZFJlYWRpbmdCbG9ja0hpZ2hsaWdodCwgRGlzcGxheSwgRm9jdXMsIEZvY3VzSGlnaGxpZ2h0RnJvbU5vZGUsIEZvY3VzSGlnaGxpZ2h0UGF0aCwgRm9jdXNNYW5hZ2VyLCBOb2RlLCBzY2VuZXJ5LCBUT3ZlcmxheSwgVFBhaW50LCBUcmFpbCwgVHJhbnNmb3JtVHJhY2tlciB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ05vZGUgfSBmcm9tICcuLi9hY2Nlc3NpYmlsaXR5L3ZvaWNpbmcvSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcuanMnO1xyXG5pbXBvcnQgeyBSZWFkaW5nQmxvY2tOb2RlIH0gZnJvbSAnLi4vYWNjZXNzaWJpbGl0eS92b2ljaW5nL1JlYWRpbmdCbG9jay5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5cclxuLy8gY29sb3JzIGZvciB0aGUgZm9jdXMgaGlnaGxpZ2h0cywgY2FuIGJlIGNoYW5nZWQgZm9yIGRpZmZlcmVudCBhcHBsaWNhdGlvbiBiYWNrZ3JvdW5kcyBvciBjb2xvciBwcm9maWxlcywgc2VlXHJcbi8vIHRoZSBzZXR0ZXJzIGFuZCBnZXR0ZXJzIGJlbG93IGZvciB0aGVzZSB2YWx1ZXMuXHJcbmxldCBvdXRlckhpZ2hsaWdodENvbG9yOiBUUGFpbnQgPSBGb2N1c0hpZ2hsaWdodFBhdGguT1VURVJfRk9DVVNfQ09MT1I7XHJcbmxldCBpbm5lckhpZ2hsaWdodENvbG9yOiBUUGFpbnQgPSBGb2N1c0hpZ2hsaWdodFBhdGguSU5ORVJfRk9DVVNfQ09MT1I7XHJcblxyXG5sZXQgaW5uZXJHcm91cEhpZ2hsaWdodENvbG9yOiBUUGFpbnQgPSBGb2N1c0hpZ2hsaWdodFBhdGguSU5ORVJfTElHSFRfR1JPVVBfRk9DVVNfQ09MT1I7XHJcbmxldCBvdXRlckdyb3VwSGlnaGxpZ2h0Q29sb3I6IFRQYWludCA9IEZvY3VzSGlnaGxpZ2h0UGF0aC5PVVRFUl9MSUdIVF9HUk9VUF9GT0NVU19DT0xPUjtcclxuXHJcbi8vIFR5cGUgZm9yIHRoZSBcIm1vZGVcIiBvZiBhIHBhcnRpY3VsYXIgaGlnaGxpZ2h0LCBzaWduaWZ5aW5nIGJlaGF2aW9yIGZvciBoYW5kbGluZyB0aGUgYWN0aXZlIGhpZ2hsaWdodC5cclxudHlwZSBIaWdobGlnaHRNb2RlID0gbnVsbCB8ICdib3VuZHMnIHwgJ25vZGUnIHwgJ3NoYXBlJyB8ICdpbnZpc2libGUnO1xyXG5cclxuLy8gSGlnaGxpZ2h0cyBkaXNwbGF5ZWQgYnkgdGhlIG92ZXJsYXkgc3VwcG9ydCB0aGVzZSB0eXBlcy4gSGlnaGxpZ2h0IGJlaGF2aW9yIHdvcmtzIGxpa2UgdGhlIGZvbGxvd2luZzpcclxuLy8gLSBJZiB2YWx1ZSBpcyBudWxsLCB0aGUgaGlnaGxpZ2h0IHdpbGwgdXNlIGRlZmF1bHQgc3R5bGluZ3Mgb2YgRm9jdXNIaWdobGlnaHRQYXRoIGFuZCBzdXJyb3VuZCB0aGUgTm9kZSB3aXRoIGZvY3VzLlxyXG4vLyAtIElmIHZhbHVlIGlzIGEgU2hhcGUgdGhlIFNoYXBlIGlzIHNldCB0byBhIEZvY3VzSGlnaGxpZ2h0UGF0aCB3aXRoIGRlZmF1bHQgc3R5bGluZ3MgaW4gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lLlxyXG4vLyAtIElmIHlvdSBwcm92aWRlIGEgTm9kZSBpdCBpcyB5b3VyIHJlc3BvbnNpYmlsaXR5IHRvIHBvc2l0aW9uIGl0IGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZS5cclxuLy8gLSBJZiB0aGUgdmFsdWUgaXMgJ2ludmlzaWJsZScgbm8gaGlnaGxpZ2h0IHdpbGwgYmUgZGlzcGxheWVkIGF0IGFsbC5cclxuZXhwb3J0IHR5cGUgSGlnaGxpZ2h0ID0gTm9kZSB8IFNoYXBlIHwgbnVsbCB8ICdpbnZpc2libGUnO1xyXG5cclxuZXhwb3J0IHR5cGUgSGlnaGxpZ2h0T3ZlcmxheU9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIENvbnRyb2xzIHdoZXRoZXIgaGlnaGxpZ2h0cyByZWxhdGVkIHRvIERPTSBmb2N1cyBhcmUgdmlzaWJsZVxyXG4gIHBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHk/OiBUUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIENvbnRyb2xzIHdoZXRoZXIgaGlnaGxpZ2h0cyByZWxhdGVkIHRvIEludGVyYWN0aXZlIEhpZ2hsaWdodHMgYXJlIHZpc2libGVcclxuICBpbnRlcmFjdGl2ZUhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHk/OiBUUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIENvbnRyb2xzIHdoZXRoZXIgaGlnaGxpZ2h0cyBhc3NvY2lhdGVkIHdpdGggUmVhZGluZ0Jsb2NrcyAob2YgdGhlIFZvaWNpbmcgZmVhdHVyZSBzZXQpXHJcbiAgLy8gYXJlIHNob3duIHdoZW4gcG9pbnRlckZvY3VzUHJvcGVydHkgY2hhbmdlc1xyXG4gIHJlYWRpbmdCbG9ja0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHk/OiBUUHJvcGVydHk8Ym9vbGVhbj47XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIaWdobGlnaHRPdmVybGF5IGltcGxlbWVudHMgVE92ZXJsYXkge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3BsYXk6IERpc3BsYXk7XHJcblxyXG4gIC8vIFRoZSByb290IE5vZGUgb2Ygb3VyIGNoaWxkIGRpc3BsYXlcclxuICBwcml2YXRlIHJlYWRvbmx5IGZvY3VzUm9vdE5vZGU6IE5vZGU7XHJcblxyXG4gIC8vIFRyYWlsIHRvIHRoZSBub2RlIHdpdGggZm9jdXMsIG1vZGlmaWVkIHdoZW4gZm9jdXMgY2hhbmdlc1xyXG4gIHByaXZhdGUgdHJhaWw6IFRyYWlsIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8vIE5vZGUgd2l0aCBmb2N1cywgbW9kaWZpZWQgd2hlbiBmb2N1cyBjaGFuZ2VzXHJcbiAgcHJpdmF0ZSBub2RlOiBOb2RlIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8vIEEgcmVmZXJlbmNlcyB0byB0aGUgaGlnaGxpZ2h0IGZyb20gdGhlIE5vZGUgdGhhdCBpcyBoaWdobGlnaHRlZC5cclxuICBwcml2YXRlIGFjdGl2ZUhpZ2hsaWdodDogSGlnaGxpZ2h0ID0gbnVsbDtcclxuXHJcbiAgLy8gU2lnbmlmaWVzIG1ldGhvZCBvZiByZXByZXNlbnRpbmcgZm9jdXMsICdib3VuZHMnfCdub2RlJ3wnc2hhcGUnfCdpbnZpc2libGUnLCBtb2RpZmllZFxyXG4gIC8vIHdoZW4gZm9jdXMgY2hhbmdlc1xyXG4gIHByaXZhdGUgbW9kZTogSGlnaGxpZ2h0TW9kZSA9IG51bGw7XHJcblxyXG4gIC8vIFNpZ25pZmllcyBtZXRob2Qgb2ZmIHJlcHJlc2VudGluZyBncm91cCBmb2N1cywgJ2JvdW5kcyd8J25vZGUnLCBtb2RpZmllZCB3aGVuXHJcbiAgLy8gZm9jdXMgY2hhbmdlc1xyXG4gIHByaXZhdGUgZ3JvdXBNb2RlOiBIaWdobGlnaHRNb2RlID0gbnVsbDtcclxuXHJcbiAgLy8gVGhlIGdyb3VwIGhpZ2hsaWdodCBub2RlIGFyb3VuZCBhbiBhbmNlc3RvciBvZiB0aGlzLm5vZGUgd2hlbiBmb2N1cyBjaGFuZ2VzLCBzZWUgUGFyYWxsZWxET00uc2V0R3JvdXBGb2N1c0hpZ2hsaWdodFxyXG4gIC8vIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHRoZSBncm91cCBmb2N1cyBoaWdobGlnaHQsIG1vZGlmaWVkIHdoZW4gZm9jdXMgY2hhbmdlc1xyXG4gIHByaXZhdGUgZ3JvdXBIaWdobGlnaHROb2RlOiBOb2RlIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8vIFRyYWNrcyB0cmFuc2Zvcm1hdGlvbnMgdG8gdGhlIGZvY3VzZWQgbm9kZSBhbmQgdGhlIG5vZGUgd2l0aCBhIGdyb3VwIGZvY3VzIGhpZ2hsaWdodCwgbW9kaWZpZWQgd2hlbiBmb2N1cyBjaGFuZ2VzXHJcbiAgcHJpdmF0ZSB0cmFuc2Zvcm1UcmFja2VyOiBUcmFuc2Zvcm1UcmFja2VyIHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSBncm91cFRyYW5zZm9ybVRyYWNrZXI6IFRyYW5zZm9ybVRyYWNrZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgLy8gSWYgYSBub2RlIGlzIHVzaW5nIGEgY3VzdG9tIGZvY3VzIGhpZ2hsaWdodCwgYSByZWZlcmVuY2UgaXMga2VwdCBzbyB0aGF0IGl0IGNhbiBiZSByZW1vdmVkIGZyb20gdGhlIG92ZXJsYXkgd2hlblxyXG4gIC8vIG5vZGUgZm9jdXMgY2hhbmdlcy5cclxuICBwcml2YXRlIG5vZGVNb2RlSGlnaGxpZ2h0OiBOb2RlIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8vIElmIHRydWUsIHRoZSBhY3RpdmUgaGlnaGxpZ2h0IGlzIGluIFwibm9kZVwiIG1vZGUgYW5kIGlzIGxheWVyZWQgaW4gdGhlIHNjZW5lIGdyYXBoLiBUaGlzIGZpZWxkIGxldHMgdXMgZGVhY3RpdmF0ZVxyXG4gIC8vIHRoZSBoaWdobGlnaHQgYXBwcm9wcmlhdGVseSB3aGVuIGl0IGlzIGluIHRoYXQgc3RhdGUuXHJcbiAgcHJpdmF0ZSBub2RlTW9kZUhpZ2hsaWdodExheWVyZWQgPSBmYWxzZTtcclxuXHJcbiAgLy8gSWYgdHJ1ZSwgdGhlIG5leHQgdXBkYXRlKCkgd2lsbCB0cmlnZ2VyIGFuIHVwZGF0ZSB0byB0aGUgaGlnaGxpZ2h0J3MgdHJhbnNmb3JtXHJcbiAgcHJpdmF0ZSB0cmFuc2Zvcm1EaXJ0eSA9IHRydWU7XHJcblxyXG4gIC8vIFRoZSBtYWluIG5vZGUgZm9yIHRoZSBoaWdobGlnaHQuIEl0IHdpbGwgYmUgdHJhbnNmb3JtZWQuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBoaWdobGlnaHROb2RlID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgLy8gVGhlIG1haW4gTm9kZSBmb3IgdGhlIFJlYWRpbmdCbG9jayBoaWdobGlnaHQsIHdoaWxlIFJlYWRpbmdCbG9jayBjb250ZW50IGlzIGJlaW5nIHNwb2tlbiBieSBzcGVlY2ggc3ludGhlc2lzLlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVhZGluZ0Jsb2NrSGlnaGxpZ2h0Tm9kZSA9IG5ldyBOb2RlKCk7XHJcblxyXG4gIC8vIEEgcmVmZXJlbmNlIHRvIHRoZSBOb2RlIHRoYXQgaXMgYWRkZWQgd2hlbiBhIGN1c3RvbSBub2RlIGlzIHNwZWNpZmllZCBhcyB0aGUgYWN0aXZlIGhpZ2hsaWdodCBmb3IgdGhlXHJcbiAgLy8gUmVhZGluZ0Jsb2NrLiBTdG9yZWQgc28gdGhhdCB3ZSBjYW4gcmVtb3ZlIGl0IHdoZW4gZGVhY3RpdmF0aW5nIHJlYWRpbmcgYmxvY2sgaGlnaGxpZ2h0cy5cclxuICBwcml2YXRlIGFkZGVkUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0OiBIaWdobGlnaHQgPSBudWxsO1xyXG5cclxuICAvLyBBIHJlZmVyZW5jZSB0byB0aGUgTm9kZSB0aGF0IGlzIGEgUmVhZGluZ0Jsb2NrIHdoaWNoIHRoZSBWb2ljaW5nIGZyYW1ld29yayBpcyBjdXJyZW50bHkgc3BlYWtpbmcgYWJvdXQuXHJcbiAgcHJpdmF0ZSBhY3RpdmVSZWFkaW5nQmxvY2tOb2RlOiBudWxsIHwgUmVhZGluZ0Jsb2NrTm9kZSA9IG51bGw7XHJcblxyXG4gIC8vIFRyYWlsIHRvIHRoZSBSZWFkaW5nQmxvY2sgTm9kZSB3aXRoIGFuIGFjdGl2ZSBoaWdobGlnaHQgYXJvdW5kIGl0IHdoaWxlIHRoZSB2b2ljaW5nTWFuYWdlciBpcyBzcGVha2luZyBpdHMgY29udGVudC5cclxuICBwcml2YXRlIHJlYWRpbmdCbG9ja1RyYWlsOiBudWxsIHwgVHJhaWwgPSBudWxsO1xyXG5cclxuICAvLyBXaGV0aGVyIHRoZSB0cmFuc2Zvcm0gYXBwbGllZCB0byB0aGUgcmVhZGluQmxvY2tIaWdobGlnaHROb2RlIGlzIG91dCBvZiBkYXRlLlxyXG4gIHByaXZhdGUgcmVhZGluZ0Jsb2NrVHJhbnNmb3JtRGlydHkgPSB0cnVlO1xyXG5cclxuICAvLyBUaGUgVHJhbnNmb3JtVHJhY2tlciB1c2VkIHRvIG9ic2VydmUgY2hhbmdlcyB0byB0aGUgdHJhbnNmb3JtIG9mIHRoZSBOb2RlIHdpdGggUmVhZGluZyBCbG9jayBmb2N1cywgc28gdGhhdFxyXG4gIC8vIHRoZSBoaWdobGlnaHQgY2FuIG1hdGNoIHRoZSBSZWFkaW5nQmxvY2suXHJcbiAgcHJpdmF0ZSByZWFkaW5nQmxvY2tUcmFuc2Zvcm1UcmFja2VyOiBudWxsIHwgVHJhbnNmb3JtVHJhY2tlciA9IG51bGw7XHJcblxyXG4gIC8vIFNlZSBIaWdobGlnaHRPdmVybGF5T3B0aW9ucyBmb3IgZG9jdW1lbnRhdGlvbi5cclxuICBwcml2YXRlIHJlYWRvbmx5IHBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHk6IFRQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gU2VlIEhpZ2hsaWdodE92ZXJsYXlPcHRpb25zIGZvciBkb2N1bWVudGF0aW9uLlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgaW50ZXJhY3RpdmVIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIFNlZSBIaWdobGlnaHRPdmVybGF5T3B0aW9ucyBmb3IgZG9jdW1lbnRhdGlvbi5cclxuICBwcml2YXRlIHJlYWRvbmx5IHJlYWRpbmdCbG9ja0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHk6IFRQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gRGlzcGxheSB0aGF0IG1hbmFnZXMgYWxsIGhpZ2hsaWdodHNcclxuICBwcml2YXRlIHJlYWRvbmx5IGZvY3VzRGlzcGxheTogRGlzcGxheTtcclxuXHJcbiAgLy8gSFRNTCBlbGVtZW50IG9mIHRoZSBkaXNwbGF5XHJcbiAgcHVibGljIHJlYWRvbmx5IGRvbUVsZW1lbnQ6IEhUTUxFbGVtZW50O1xyXG5cclxuICAvLyBVc2VkIGFzIHRoZSBmb2N1cyBoaWdobGlnaHQgd2hlbiB0aGUgb3ZlcmxheSBpcyBwYXNzZWQgYSBzaGFwZVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgc2hhcGVGb2N1c0hpZ2hsaWdodFBhdGg6IEZvY3VzSGlnaGxpZ2h0UGF0aDtcclxuXHJcbiAgLy8gVXNlZCBhcyB0aGUgZGVmYXVsdCBjYXNlIGZvciB0aGUgaGlnaGxpZ2h0IHdoZW4gdGhlIGhpZ2hsaWdodCB2YWx1ZSBpcyBudWxsXHJcbiAgcHJpdmF0ZSByZWFkb25seSBib3VuZHNGb2N1c0hpZ2hsaWdodFBhdGg6IEZvY3VzSGlnaGxpZ2h0RnJvbU5vZGU7XHJcblxyXG4gIC8vIEZvY3VzIGhpZ2hsaWdodCBmb3IgJ2dyb3Vwcycgb2YgTm9kZXMuIFdoZW4gZGVzY2VuZGFudCBub2RlIGhhcyBmb2N1cywgYW5jZXN0b3Igd2l0aCBncm91cEZvY3VzSGlnaGxpZ2h0IGZsYWcgd2lsbFxyXG4gIC8vIGhhdmUgdGhpcyBleHRyYSBmb2N1cyBoaWdobGlnaHQgc3Vycm91bmQgaXRzIGxvY2FsIGJvdW5kc1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZ3JvdXBGb2N1c0hpZ2hsaWdodFBhdGg6IEZvY3VzSGlnaGxpZ2h0RnJvbU5vZGU7XHJcblxyXG4gIC8vIEEgcGFyZW50IE5vZGUgZm9yIGdyb3VwIGZvY3VzIGhpZ2hsaWdodHMgc28gdmlzaWJpbGl0eSBvZiBhbGwgZ3JvdXAgaGlnaGxpZ2h0cyBjYW4gZWFzaWx5IGJlIGNvbnRyb2xsZWRcclxuICBwcml2YXRlIHJlYWRvbmx5IGdyb3VwRm9jdXNIaWdobGlnaHRQYXJlbnQ6IE5vZGU7XHJcblxyXG4gIC8vIFRoZSBoaWdobGlnaHQgc2hvd24gYXJvdW5kIFJlYWRpbmdCbG9jayBOb2RlcyB3aGlsZSB0aGUgdm9pY2luZ01hbmFnZXIgaXMgc3BlYWtpbmcuXHJcbiAgcHJpdmF0ZSByZWFkb25seSByZWFkaW5nQmxvY2tIaWdobGlnaHRQYXRoOiBBY3RpdmF0ZWRSZWFkaW5nQmxvY2tIaWdobGlnaHQ7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgYm91bmRzTGlzdGVuZXI6ICgpID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSByZWFkb25seSB0cmFuc2Zvcm1MaXN0ZW5lcjogKCkgPT4gdm9pZDtcclxuICBwcml2YXRlIHJlYWRvbmx5IGRvbUZvY3VzTGlzdGVuZXI6ICggZm9jdXM6IEZvY3VzIHwgbnVsbCApID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSByZWFkb25seSByZWFkaW5nQmxvY2tUcmFuc2Zvcm1MaXN0ZW5lcjogKCkgPT4gdm9pZDtcclxuICBwcml2YXRlIHJlYWRvbmx5IGZvY3VzSGlnaGxpZ2h0TGlzdGVuZXI6ICgpID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBpbnRlcmFjdGl2ZUhpZ2hsaWdodExpc3RlbmVyOiAoKSA9PiB2b2lkO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZm9jdXNIaWdobGlnaHRzVmlzaWJsZUxpc3RlbmVyOiAoKSA9PiB2b2lkO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdm9pY2luZ0hpZ2hsaWdodHNWaXNpYmxlTGlzdGVuZXI6ICgpID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBwb2ludGVyRm9jdXNMaXN0ZW5lcjogKCBmb2N1czogRm9jdXMgfCBudWxsICkgPT4gdm9pZDtcclxuICBwcml2YXRlIHJlYWRvbmx5IGxvY2tlZFBvaW50ZXJGb2N1c0xpc3RlbmVyOiAoIGZvY3VzOiBGb2N1cyB8IG51bGwgKSA9PiB2b2lkO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVhZGluZ0Jsb2NrRm9jdXNMaXN0ZW5lcjogKCBmb2N1czogRm9jdXMgfCBudWxsICkgPT4gdm9pZDtcclxuICBwcml2YXRlIHJlYWRvbmx5IHJlYWRpbmdCbG9ja0hpZ2hsaWdodENoYW5nZUxpc3RlbmVyOiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGRpc3BsYXk6IERpc3BsYXksIGZvY3VzUm9vdE5vZGU6IE5vZGUsIHByb3ZpZGVkT3B0aW9ucz86IEhpZ2hsaWdodE92ZXJsYXlPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8SGlnaGxpZ2h0T3ZlcmxheU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIENvbnRyb2xzIHdoZXRoZXIgaGlnaGxpZ2h0cyByZWxhdGVkIHRvIERPTSBmb2N1cyBhcmUgdmlzaWJsZVxyXG4gICAgICBwZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5OiBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICksXHJcblxyXG4gICAgICAvLyBDb250cm9scyB3aGV0aGVyIGhpZ2hsaWdodHMgcmVsYXRlZCB0byBJbnRlcmFjdGl2ZSBIaWdobGlnaHRzIGFyZSB2aXNpYmxlXHJcbiAgICAgIGludGVyYWN0aXZlSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eTogbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKSxcclxuXHJcbiAgICAgIC8vIENvbnRyb2xzIHdoZXRoZXIgaGlnaGxpZ2h0cyBhc3NvY2lhdGVkIHdpdGggUmVhZGluZ0Jsb2NrcyAob2YgdGhlIFZvaWNpbmcgZmVhdHVyZSBzZXQpIGFyZSBzaG93biB3aGVuXHJcbiAgICAgIC8vIHBvaW50ZXJGb2N1c1Byb3BlcnR5IGNoYW5nZXNcclxuICAgICAgcmVhZGluZ0Jsb2NrSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eTogbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5kaXNwbGF5ID0gZGlzcGxheTtcclxuICAgIHRoaXMuZm9jdXNSb290Tm9kZSA9IGZvY3VzUm9vdE5vZGU7XHJcblxyXG4gICAgdGhpcy5mb2N1c1Jvb3ROb2RlLmFkZENoaWxkKCB0aGlzLmhpZ2hsaWdodE5vZGUgKTtcclxuICAgIHRoaXMuZm9jdXNSb290Tm9kZS5hZGRDaGlsZCggdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHROb2RlICk7XHJcblxyXG4gICAgdGhpcy5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5ID0gb3B0aW9ucy5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5O1xyXG4gICAgdGhpcy5pbnRlcmFjdGl2ZUhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkgPSBvcHRpb25zLmludGVyYWN0aXZlSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eTtcclxuICAgIHRoaXMucmVhZGluZ0Jsb2NrSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eSA9IG9wdGlvbnMucmVhZGluZ0Jsb2NrSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eTtcclxuXHJcbiAgICB0aGlzLmZvY3VzRGlzcGxheSA9IG5ldyBEaXNwbGF5KCB0aGlzLmZvY3VzUm9vdE5vZGUsIHtcclxuICAgICAgYWxsb3dXZWJHTDogZGlzcGxheS5pc1dlYkdMQWxsb3dlZCgpLFxyXG4gICAgICBhbGxvd0NTU0hhY2tzOiBmYWxzZSxcclxuICAgICAgYWNjZXNzaWJpbGl0eTogZmFsc2UsXHJcbiAgICAgIGludGVyYWN0aXZlOiBmYWxzZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZG9tRWxlbWVudCA9IHRoaXMuZm9jdXNEaXNwbGF5LmRvbUVsZW1lbnQ7XHJcbiAgICB0aGlzLmRvbUVsZW1lbnQuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcclxuXHJcbiAgICB0aGlzLnNoYXBlRm9jdXNIaWdobGlnaHRQYXRoID0gbmV3IEZvY3VzSGlnaGxpZ2h0UGF0aCggbnVsbCApO1xyXG4gICAgdGhpcy5ib3VuZHNGb2N1c0hpZ2hsaWdodFBhdGggPSBuZXcgRm9jdXNIaWdobGlnaHRGcm9tTm9kZSggbnVsbCwge1xyXG4gICAgICB1c2VMb2NhbEJvdW5kczogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuaGlnaGxpZ2h0Tm9kZS5hZGRDaGlsZCggdGhpcy5zaGFwZUZvY3VzSGlnaGxpZ2h0UGF0aCApO1xyXG4gICAgdGhpcy5oaWdobGlnaHROb2RlLmFkZENoaWxkKCB0aGlzLmJvdW5kc0ZvY3VzSGlnaGxpZ2h0UGF0aCApO1xyXG5cclxuICAgIHRoaXMuZ3JvdXBGb2N1c0hpZ2hsaWdodFBhdGggPSBuZXcgRm9jdXNIaWdobGlnaHRGcm9tTm9kZSggbnVsbCwge1xyXG4gICAgICB1c2VMb2NhbEJvdW5kczogdHJ1ZSxcclxuICAgICAgdXNlR3JvdXBEaWxhdGlvbjogdHJ1ZSxcclxuICAgICAgb3V0ZXJMaW5lV2lkdGg6IEZvY3VzSGlnaGxpZ2h0UGF0aC5HUk9VUF9PVVRFUl9MSU5FX1dJRFRILFxyXG4gICAgICBpbm5lckxpbmVXaWR0aDogRm9jdXNIaWdobGlnaHRQYXRoLkdST1VQX0lOTkVSX0xJTkVfV0lEVEgsXHJcbiAgICAgIGlubmVyU3Ryb2tlOiBGb2N1c0hpZ2hsaWdodFBhdGguT1VURVJfRk9DVVNfQ09MT1JcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmdyb3VwRm9jdXNIaWdobGlnaHRQYXJlbnQgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyB0aGlzLmdyb3VwRm9jdXNIaWdobGlnaHRQYXRoIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuZm9jdXNSb290Tm9kZS5hZGRDaGlsZCggdGhpcy5ncm91cEZvY3VzSGlnaGxpZ2h0UGFyZW50ICk7XHJcblxyXG4gICAgdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHRQYXRoID0gbmV3IEFjdGl2YXRlZFJlYWRpbmdCbG9ja0hpZ2hsaWdodCggbnVsbCApO1xyXG4gICAgdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHROb2RlLmFkZENoaWxkKCB0aGlzLnJlYWRpbmdCbG9ja0hpZ2hsaWdodFBhdGggKTtcclxuXHJcbiAgICAvLyBMaXN0ZW5lcnMgYm91bmQgb25jZSwgc28gd2UgY2FuIGFjY2VzcyB0aGVtIGZvciByZW1vdmFsLlxyXG4gICAgdGhpcy5ib3VuZHNMaXN0ZW5lciA9IHRoaXMub25Cb3VuZHNDaGFuZ2UuYmluZCggdGhpcyApO1xyXG4gICAgdGhpcy50cmFuc2Zvcm1MaXN0ZW5lciA9IHRoaXMub25UcmFuc2Zvcm1DaGFuZ2UuYmluZCggdGhpcyApO1xyXG4gICAgdGhpcy5kb21Gb2N1c0xpc3RlbmVyID0gdGhpcy5vbkZvY3VzQ2hhbmdlLmJpbmQoIHRoaXMgKTtcclxuICAgIHRoaXMucmVhZGluZ0Jsb2NrVHJhbnNmb3JtTGlzdGVuZXIgPSB0aGlzLm9uUmVhZGluZ0Jsb2NrVHJhbnNmb3JtQ2hhbmdlLmJpbmQoIHRoaXMgKTtcclxuICAgIHRoaXMuZm9jdXNIaWdobGlnaHRMaXN0ZW5lciA9IHRoaXMub25Gb2N1c0hpZ2hsaWdodENoYW5nZS5iaW5kKCB0aGlzICk7XHJcbiAgICB0aGlzLmludGVyYWN0aXZlSGlnaGxpZ2h0TGlzdGVuZXIgPSB0aGlzLm9uSW50ZXJhY3RpdmVIaWdobGlnaHRDaGFuZ2UuYmluZCggdGhpcyApO1xyXG4gICAgdGhpcy5mb2N1c0hpZ2hsaWdodHNWaXNpYmxlTGlzdGVuZXIgPSB0aGlzLm9uRm9jdXNIaWdobGlnaHRzVmlzaWJsZUNoYW5nZS5iaW5kKCB0aGlzICk7XHJcbiAgICB0aGlzLnZvaWNpbmdIaWdobGlnaHRzVmlzaWJsZUxpc3RlbmVyID0gdGhpcy5vblZvaWNpbmdIaWdobGlnaHRzVmlzaWJsZUNoYW5nZS5iaW5kKCB0aGlzICk7XHJcbiAgICB0aGlzLnBvaW50ZXJGb2N1c0xpc3RlbmVyID0gdGhpcy5vblBvaW50ZXJGb2N1c0NoYW5nZS5iaW5kKCB0aGlzICk7XHJcbiAgICB0aGlzLmxvY2tlZFBvaW50ZXJGb2N1c0xpc3RlbmVyID0gdGhpcy5vbkxvY2tlZFBvaW50ZXJGb2N1c0NoYW5nZS5iaW5kKCB0aGlzICk7XHJcbiAgICB0aGlzLnJlYWRpbmdCbG9ja0ZvY3VzTGlzdGVuZXIgPSB0aGlzLm9uUmVhZGluZ0Jsb2NrRm9jdXNDaGFuZ2UuYmluZCggdGhpcyApO1xyXG4gICAgdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHRDaGFuZ2VMaXN0ZW5lciA9IHRoaXMub25SZWFkaW5nQmxvY2tIaWdobGlnaHRDaGFuZ2UuYmluZCggdGhpcyApO1xyXG5cclxuICAgIEZvY3VzTWFuYWdlci5wZG9tRm9jdXNQcm9wZXJ0eS5saW5rKCB0aGlzLmRvbUZvY3VzTGlzdGVuZXIgKTtcclxuICAgIGRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJGb2N1c1Byb3BlcnR5LmxpbmsoIHRoaXMucG9pbnRlckZvY3VzTGlzdGVuZXIgKTtcclxuICAgIGRpc3BsYXkuZm9jdXNNYW5hZ2VyLnJlYWRpbmdCbG9ja0ZvY3VzUHJvcGVydHkubGluayggdGhpcy5yZWFkaW5nQmxvY2tGb2N1c0xpc3RlbmVyICk7XHJcblxyXG4gICAgZGlzcGxheS5mb2N1c01hbmFnZXIubG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkubGluayggdGhpcy5sb2NrZWRQb2ludGVyRm9jdXNMaXN0ZW5lciApO1xyXG5cclxuICAgIHRoaXMucGRvbUZvY3VzSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eS5saW5rKCB0aGlzLmZvY3VzSGlnaGxpZ2h0c1Zpc2libGVMaXN0ZW5lciApO1xyXG4gICAgdGhpcy5pbnRlcmFjdGl2ZUhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkubGluayggdGhpcy52b2ljaW5nSGlnaGxpZ2h0c1Zpc2libGVMaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLmhhc0hpZ2hsaWdodCgpICkge1xyXG4gICAgICB0aGlzLmRlYWN0aXZhdGVIaWdobGlnaHQoKTtcclxuICAgIH1cclxuXHJcbiAgICBGb2N1c01hbmFnZXIucGRvbUZvY3VzUHJvcGVydHkudW5saW5rKCB0aGlzLmRvbUZvY3VzTGlzdGVuZXIgKTtcclxuICAgIHRoaXMucGRvbUZvY3VzSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eS51bmxpbmsoIHRoaXMuZm9jdXNIaWdobGlnaHRzVmlzaWJsZUxpc3RlbmVyICk7XHJcbiAgICB0aGlzLmludGVyYWN0aXZlSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eS51bmxpbmsoIHRoaXMudm9pY2luZ0hpZ2hsaWdodHNWaXNpYmxlTGlzdGVuZXIgKTtcclxuXHJcbiAgICB0aGlzLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJGb2N1c1Byb3BlcnR5LnVubGluayggdGhpcy5wb2ludGVyRm9jdXNMaXN0ZW5lciApO1xyXG4gICAgdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5yZWFkaW5nQmxvY2tGb2N1c1Byb3BlcnR5LnVubGluayggdGhpcy5yZWFkaW5nQmxvY2tGb2N1c0xpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy5mb2N1c0Rpc3BsYXkuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGlzIEhpZ2hsaWdodE92ZXJsYXkgaXMgZGlzcGxheWluZyBzb21lIGhpZ2hsaWdodC5cclxuICAgKi9cclxuICBwdWJsaWMgaGFzSGlnaGxpZ2h0KCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICEhdGhpcy50cmFpbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGVyZSBpcyBhbiBhY3RpdmUgaGlnaGxpZ2h0IGFyb3VuZCBhIFJlYWRpbmdCbG9jayB3aGlsZSB0aGUgdm9pY2luZ01hbmFnZXIgaXMgc3BlYWtpbmcgaXRzXHJcbiAgICogVm9pY2luZyBjb250ZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBoYXNSZWFkaW5nQmxvY2tIaWdobGlnaHQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gISF0aGlzLnJlYWRpbmdCbG9ja1RyYWlsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWN0aXZhdGVzIHRoZSBoaWdobGlnaHQsIGNob29zaW5nIGEgbW9kZSBmb3Igd2hldGhlciB0aGUgaGlnaGxpZ2h0IHdpbGwgYmUgYSBzaGFwZSwgbm9kZSwgb3IgYm91bmRzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHRyYWlsIC0gVGhlIGZvY3VzZWQgdHJhaWwgdG8gaGlnaGxpZ2h0LiBJdCBhc3N1bWVzIHRoYXQgdGhpcyB0cmFpbCBpcyBpbiB0aGlzIGRpc3BsYXkuXHJcbiAgICogQHBhcmFtIG5vZGUgLSBOb2RlIHJlY2VpdmluZyB0aGUgaGlnaGxpZ2h0XHJcbiAgICogQHBhcmFtIG5vZGVIaWdobGlnaHQgLSB0aGUgaGlnaGxpZ2h0IHRvIHVzZVxyXG4gICAqIEBwYXJhbSBsYXllcmFibGUgLSBJcyB0aGUgaGlnaGxpZ2h0IGxheWVyYWJsZSBpbiB0aGUgc2NlbmUgZ3JhcGg/XHJcbiAgICogQHBhcmFtIHZpc2libGVQcm9wZXJ0eSAtIFByb3BlcnR5IGNvbnRyb2xsaW5nIHRoZSB2aXNpYmlsaXR5IGZvciB0aGUgcHJvdmlkZWQgaGlnaGxpZ2h0XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhY3RpdmF0ZUhpZ2hsaWdodCggdHJhaWw6IFRyYWlsLCBub2RlOiBOb2RlLCBub2RlSGlnaGxpZ2h0OiBIaWdobGlnaHQsIGxheWVyYWJsZTogYm9vbGVhbiwgdmlzaWJsZVByb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj4gKTogdm9pZCB7XHJcbiAgICB0aGlzLnRyYWlsID0gdHJhaWw7XHJcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xyXG5cclxuICAgIGNvbnN0IGhpZ2hsaWdodCA9IG5vZGVIaWdobGlnaHQ7XHJcbiAgICB0aGlzLmFjdGl2ZUhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcclxuXHJcbiAgICAvLyB3ZSBtYXkgb3IgbWF5IG5vdCB0cmFjayB0aGlzIHRyYWlsIGRlcGVuZGluZyBvbiB3aGV0aGVyIHRoZSBmb2N1cyBoaWdobGlnaHQgc3Vycm91bmRzIHRoZSB0cmFpbCdzIGxlYWYgbm9kZSBvclxyXG4gICAgLy8gYSBkaWZmZXJlbnQgbm9kZVxyXG4gICAgbGV0IHRyYWlsVG9UcmFjayA9IHRyYWlsO1xyXG5cclxuICAgIC8vIEludmlzaWJsZSBtb2RlIC0gbm8gZm9jdXMgaGlnaGxpZ2h0OyB0aGlzIGlzIG9ubHkgZm9yIHRlc3RpbmcgbW9kZSwgd2hlbiBOb2RlcyByYXJlbHkgaGF2ZSBib3VuZHMuXHJcbiAgICBpZiAoIGhpZ2hsaWdodCA9PT0gJ2ludmlzaWJsZScgKSB7XHJcbiAgICAgIHRoaXMubW9kZSA9ICdpbnZpc2libGUnO1xyXG4gICAgfVxyXG4gICAgLy8gU2hhcGUgbW9kZVxyXG4gICAgZWxzZSBpZiAoIGhpZ2hsaWdodCBpbnN0YW5jZW9mIFNoYXBlICkge1xyXG4gICAgICB0aGlzLm1vZGUgPSAnc2hhcGUnO1xyXG5cclxuICAgICAgdGhpcy5zaGFwZUZvY3VzSGlnaGxpZ2h0UGF0aC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgdGhpcy5zaGFwZUZvY3VzSGlnaGxpZ2h0UGF0aC5zZXRTaGFwZSggaGlnaGxpZ2h0ICk7XHJcbiAgICB9XHJcbiAgICAvLyBOb2RlIG1vZGVcclxuICAgIGVsc2UgaWYgKCBoaWdobGlnaHQgaW5zdGFuY2VvZiBOb2RlICkge1xyXG4gICAgICB0aGlzLm1vZGUgPSAnbm9kZSc7XHJcblxyXG4gICAgICAvLyBpZiB1c2luZyBhIGZvY3VzIGhpZ2hsaWdodCBmcm9tIGFub3RoZXIgbm9kZSwgd2Ugd2lsbCB0cmFjayB0aGF0IG5vZGUncyB0cmFuc2Zvcm0gaW5zdGVhZCBvZiB0aGUgZm9jdXNlZCBub2RlXHJcbiAgICAgIGlmICggaGlnaGxpZ2h0IGluc3RhbmNlb2YgRm9jdXNIaWdobGlnaHRQYXRoICkge1xyXG4gICAgICAgIGNvbnN0IGhpZ2hsaWdodFBhdGggPSBoaWdobGlnaHQ7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaGlnaGxpZ2h0LnNoYXBlICE9PSBudWxsLCAnVGhlIHNoYXBlIG9mIHRoZSBOb2RlIGhpZ2hsaWdodCBzaG91bGQgYmUgc2V0IGJ5IG5vdy4gRG9lcyBpdCBoYXZlIGJvdW5kcz8nICk7XHJcblxyXG4gICAgICAgIGlmICggaGlnaGxpZ2h0UGF0aC50cmFuc2Zvcm1Tb3VyY2VOb2RlICkge1xyXG4gICAgICAgICAgdHJhaWxUb1RyYWNrID0gaGlnaGxpZ2h0LmdldFVuaXF1ZUhpZ2hsaWdodFRyYWlsKCB0aGlzLnRyYWlsICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBzdG9yZSB0aGUgZm9jdXMgaGlnaGxpZ2h0IHNvIHRoYXQgaXQgY2FuIGJlIHJlbW92ZWQgbGF0ZXJcclxuICAgICAgdGhpcy5ub2RlTW9kZUhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcclxuXHJcbiAgICAgIGlmICggbGF5ZXJhYmxlICkge1xyXG5cclxuICAgICAgICAvLyBmbGFnIHNvIHRoYXQgd2Uga25vdyBob3cgdG8gZGVhY3RpdmF0ZSBpbiB0aGlzIGNhc2VcclxuICAgICAgICB0aGlzLm5vZGVNb2RlSGlnaGxpZ2h0TGF5ZXJlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIHRoZSBmb2N1c0hpZ2hsaWdodCBpcyBqdXN0IGEgbm9kZSBpbiB0aGUgc2NlbmUgZ3JhcGgsIHNvIHNldCBpdCB2aXNpYmxlIC0gdmlzaWJpbGl0eSBvZiBvdGhlciBoaWdobGlnaHRzXHJcbiAgICAgICAgLy8gY29udHJvbGxlZCBieSB2aXNpYmlsaXR5IG9mIHBhcmVudCBOb2RlcyBidXQgdGhhdCBjYW5ub3QgYmUgZG9uZSBpbiB0aGlzIGNhc2UgYmVjYXVzZSB0aGUgaGlnaGxpZ2h0XHJcbiAgICAgICAgLy8gY2FuIGJlIGFueXdoZXJlIGluIHRoZSBzY2VuZSBncmFwaCwgc28gaGF2ZSB0byBjaGVjayBwZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5XHJcbiAgICAgICAgdGhpcy5ub2RlTW9kZUhpZ2hsaWdodC52aXNpYmxlID0gdmlzaWJsZVByb3BlcnR5LmdldCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyB0aGUgbm9kZSBpcyBhbHJlYWR5IGluIHRoZSBzY2VuZSBncmFwaCwgc28gdGhpcyB3aWxsIHNldCB2aXNpYmlsaXR5XHJcbiAgICAgICAgLy8gZm9yIGFsbCBpbnN0YW5jZXMuXHJcbiAgICAgICAgdGhpcy5ub2RlTW9kZUhpZ2hsaWdodC52aXNpYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gVXNlIHRoZSBub2RlIGl0c2VsZiBhcyB0aGUgaGlnaGxpZ2h0XHJcbiAgICAgICAgdGhpcy5oaWdobGlnaHROb2RlLmFkZENoaWxkKCB0aGlzLm5vZGVNb2RlSGlnaGxpZ2h0ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIEJvdW5kcyBtb2RlXHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5tb2RlID0gJ2JvdW5kcyc7XHJcblxyXG4gICAgICB0aGlzLmJvdW5kc0ZvY3VzSGlnaGxpZ2h0UGF0aC5zZXRTaGFwZUZyb21Ob2RlKCB0aGlzLm5vZGUgKTtcclxuXHJcbiAgICAgIHRoaXMuYm91bmRzRm9jdXNIaWdobGlnaHRQYXRoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICB0aGlzLm5vZGUubG9jYWxCb3VuZHNQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5ib3VuZHNMaXN0ZW5lciApO1xyXG5cclxuICAgICAgdGhpcy5vbkJvdW5kc0NoYW5nZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudHJhbnNmb3JtVHJhY2tlciA9IG5ldyBUcmFuc2Zvcm1UcmFja2VyKCB0cmFpbFRvVHJhY2ssIHtcclxuICAgICAgaXNTdGF0aWM6IHRydWVcclxuICAgIH0gKTtcclxuICAgIHRoaXMudHJhbnNmb3JtVHJhY2tlci5hZGRMaXN0ZW5lciggdGhpcy50cmFuc2Zvcm1MaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIGhhbmRsZSBncm91cCBmb2N1cyBoaWdobGlnaHRzXHJcbiAgICB0aGlzLmFjdGl2YXRlR3JvdXBIaWdobGlnaHRzKCk7XHJcblxyXG4gICAgLy8gdXBkYXRlIGhpZ2hsaWdodCBjb2xvcnMgaWYgbmVjZXNzYXJ5XHJcbiAgICB0aGlzLnVwZGF0ZUhpZ2hsaWdodENvbG9ycygpO1xyXG5cclxuICAgIHRoaXMudHJhbnNmb3JtRGlydHkgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWN0aXZhdGUgYSBmb2N1cyBoaWdobGlnaHQsIGFjdGl2YXRpbmcgdGhlIGhpZ2hsaWdodCBhbmQgYWRkaW5nIGEgbGlzdGVuZXIgdGhhdCB3aWxsIHVwZGF0ZSB0aGUgaGlnaGxpZ2h0IHdoZW5ldmVyXHJcbiAgICogdGhlIE5vZGUncyBmb2N1c0hpZ2hsaWdodCBjaGFuZ2VzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhY3RpdmF0ZUZvY3VzSGlnaGxpZ2h0KCB0cmFpbDogVHJhaWwsIG5vZGU6IE5vZGUgKTogdm9pZCB7XHJcbiAgICB0aGlzLmFjdGl2YXRlSGlnaGxpZ2h0KCB0cmFpbCwgbm9kZSwgbm9kZS5mb2N1c0hpZ2hsaWdodCwgbm9kZS5mb2N1c0hpZ2hsaWdodExheWVyYWJsZSwgdGhpcy5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5ICk7XHJcblxyXG4gICAgLy8gaGFuZGxlIGFueSBjaGFuZ2VzIHRvIHRoZSBmb2N1cyBoaWdobGlnaHQgd2hpbGUgdGhlIG5vZGUgaGFzIGZvY3VzXHJcbiAgICBub2RlLmZvY3VzSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuZm9jdXNIaWdobGlnaHRMaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWN0aXZhdGUgYW4gaW50ZXJhY3RpdmUgaGlnaGxpZ2h0LCBhY3RpdmF0aW5nIHRoZSBoaWdobGlnaHQgYW5kIGFkZGluZyBhIGxpc3RlbmVyIHRoYXQgd2lsbCB1cGRhdGUgdGhlIGhpZ2hsaWdodFxyXG4gICAqIGNoYW5nZXMgd2hpbGUgaXQgaXMgYWN0aXZlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYWN0aXZhdGVJbnRlcmFjdGl2ZUhpZ2hsaWdodCggdHJhaWw6IFRyYWlsLCBub2RlOiBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ05vZGUgKTogdm9pZCB7XHJcblxyXG4gICAgdGhpcy5hY3RpdmF0ZUhpZ2hsaWdodChcclxuICAgICAgdHJhaWwsXHJcbiAgICAgIG5vZGUsXHJcbiAgICAgIG5vZGUuaW50ZXJhY3RpdmVIaWdobGlnaHQgfHwgbm9kZS5mb2N1c0hpZ2hsaWdodCxcclxuICAgICAgbm9kZS5pbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSxcclxuICAgICAgdGhpcy5pbnRlcmFjdGl2ZUhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHlcclxuICAgICk7XHJcblxyXG4gICAgLy8gaGFuZGxlIGNoYW5nZXMgdG8gdGhlIGhpZ2hsaWdodCB3aGlsZSBpdCBpcyBhY3RpdmUgLSBTaW5jZSB0aGUgaGlnaGxpZ2h0IGNhbiBmYWxsIGJhY2sgdG8gdGhlIGZvY3VzIGhpZ2hsaWdodFxyXG4gICAgLy8gd2F0Y2ggZm9yIHVwZGF0ZXMgdG8gcmVkcmF3IHdoZW4gdGhhdCBoaWdobGlnaHQgY2hhbmdlcyBhcyB3ZWxsXHJcbiAgICBub2RlLmludGVyYWN0aXZlSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuaW50ZXJhY3RpdmVIaWdobGlnaHRMaXN0ZW5lciApO1xyXG4gICAgbm9kZS5mb2N1c0hpZ2hsaWdodENoYW5nZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLmludGVyYWN0aXZlSGlnaGxpZ2h0TGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFjdGl2YXRlIHRoZSBSZWFkaW5nIEJsb2NrIGhpZ2hsaWdodC4gVGhpcyBoaWdobGlnaHQgaXMgc2VwYXJhdGUgZnJvbSBvdGhlcnMgaW4gdGhlIG92ZXJsYXkgYW5kIHdpbGwgYWx3YXlzXHJcbiAgICogc3Vycm91bmQgdGhlIEJvdW5kcyBvZiB0aGUgZm9jdXNlZCBOb2RlLiBJdCBpcyBzaG93biBpbiByZXNwb25zZSB0byBjZXJ0YWluIGlucHV0IG9uIE5vZGVzIHdpdGggVm9pY2luZyB3aGlsZVxyXG4gICAqIHRoZSB2b2ljaW5nTWFuYWdlciBpcyBzcGVha2luZy5cclxuICAgKlxyXG4gICAqIE5vdGUgdGhhdCBjdXN0b21pemF0aW9ucyBmb3IgdGhpcyBoaWdobGlnaHQgYXJlIG5vdCBzdXBwb3J0ZWQgYXQgdGhpcyB0aW1lLCB0aGF0IGNvdWxkIGJlIGFkZGVkIGluIHRoZSBmdXR1cmUgaWZcclxuICAgKiB3ZSBuZWVkLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYWN0aXZhdGVSZWFkaW5nQmxvY2tIaWdobGlnaHQoIHRyYWlsOiBUcmFpbCApOiB2b2lkIHtcclxuICAgIHRoaXMucmVhZGluZ0Jsb2NrVHJhaWwgPSB0cmFpbDtcclxuXHJcbiAgICBjb25zdCByZWFkaW5nQmxvY2tOb2RlID0gdHJhaWwubGFzdE5vZGUoKSBhcyBSZWFkaW5nQmxvY2tOb2RlO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVhZGluZ0Jsb2NrTm9kZS5pc1JlYWRpbmdCbG9jayxcclxuICAgICAgJ3Nob3VsZCBub3QgYWN0aXZhdGUgYSByZWFkaW5nIGJsb2NrIGhpZ2hsaWdodCBmb3IgYSBOb2RlIHRoYXQgaXMgbm90IGEgUmVhZGluZ0Jsb2NrJyApO1xyXG4gICAgdGhpcy5hY3RpdmVSZWFkaW5nQmxvY2tOb2RlID0gcmVhZGluZ0Jsb2NrTm9kZTtcclxuXHJcbiAgICBjb25zdCByZWFkaW5nQmxvY2tIaWdobGlnaHQgPSB0aGlzLmFjdGl2ZVJlYWRpbmdCbG9ja05vZGUucmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0O1xyXG5cclxuICAgIHRoaXMuYWRkZWRSZWFkaW5nQmxvY2tIaWdobGlnaHQgPSByZWFkaW5nQmxvY2tIaWdobGlnaHQ7XHJcblxyXG4gICAgaWYgKCByZWFkaW5nQmxvY2tIaWdobGlnaHQgPT09ICdpbnZpc2libGUnICkge1xyXG4gICAgICAvLyBub3RoaW5nIHRvIGRyYXdcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCByZWFkaW5nQmxvY2tIaWdobGlnaHQgaW5zdGFuY2VvZiBTaGFwZSApIHtcclxuICAgICAgdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHRQYXRoLnNldFNoYXBlKCByZWFkaW5nQmxvY2tIaWdobGlnaHQgKTtcclxuICAgICAgdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHRQYXRoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHJlYWRpbmdCbG9ja0hpZ2hsaWdodCBpbnN0YW5jZW9mIE5vZGUgKSB7XHJcblxyXG4gICAgICAvLyBub2RlIG1vZGVcclxuICAgICAgdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHROb2RlLmFkZENoaWxkKCByZWFkaW5nQmxvY2tIaWdobGlnaHQgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gYm91bmRzIG1vZGVcclxuICAgICAgdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHRQYXRoLnNldFNoYXBlRnJvbU5vZGUoIHRoaXMuYWN0aXZlUmVhZGluZ0Jsb2NrTm9kZSApO1xyXG4gICAgICB0aGlzLnJlYWRpbmdCbG9ja0hpZ2hsaWdodFBhdGgudmlzaWJsZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBoaWdobGlnaHQgaWYgdGhlIHRyYW5zZm9ybSBmb3IgdGhlIE5vZGUgZXZlciBjaGFuZ2VzXHJcbiAgICB0aGlzLnJlYWRpbmdCbG9ja1RyYW5zZm9ybVRyYWNrZXIgPSBuZXcgVHJhbnNmb3JtVHJhY2tlciggdGhpcy5yZWFkaW5nQmxvY2tUcmFpbCwge1xyXG4gICAgICBpc1N0YXRpYzogdHJ1ZVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5yZWFkaW5nQmxvY2tUcmFuc2Zvcm1UcmFja2VyLmFkZExpc3RlbmVyKCB0aGlzLnJlYWRpbmdCbG9ja1RyYW5zZm9ybUxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBoaWdobGlnaHQgaWYgaXQgaXMgY2hhbmdlZCBvbiB0aGUgTm9kZSB3aGlsZSBhY3RpdmVcclxuICAgIHRoaXMuYWN0aXZlUmVhZGluZ0Jsb2NrTm9kZS5yZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHRDaGFuZ2VMaXN0ZW5lciApO1xyXG5cclxuICAgIHRoaXMucmVhZGluZ0Jsb2NrVHJhbnNmb3JtRGlydHkgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGVhY3RpdmF0ZSB0aGUgc3BlYWtpbmcgaGlnaGxpZ2h0IGJ5IG1ha2luZyBpdCBpbnZpc2libGUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBkZWFjdGl2YXRlUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHRQYXRoLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoIHRoaXMuYWRkZWRSZWFkaW5nQmxvY2tIaWdobGlnaHQgaW5zdGFuY2VvZiBOb2RlICkge1xyXG4gICAgICB0aGlzLnJlYWRpbmdCbG9ja0hpZ2hsaWdodE5vZGUucmVtb3ZlQ2hpbGQoIHRoaXMuYWRkZWRSZWFkaW5nQmxvY2tIaWdobGlnaHQgKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnJlYWRpbmdCbG9ja1RyYW5zZm9ybVRyYWNrZXIsICdIb3cgY2FuIHdlIGRlYWN0aXZhdGUgdGhlIFRyYW5zZm9ybVRyYWNrZXIgaWYgaXQgd2FzbnQgYXNzaWduZWQuJyApO1xyXG4gICAgY29uc3QgdHJhbnNmb3JtVHJhY2tlciA9IHRoaXMucmVhZGluZ0Jsb2NrVHJhbnNmb3JtVHJhY2tlciE7XHJcbiAgICB0cmFuc2Zvcm1UcmFja2VyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLnJlYWRpbmdCbG9ja1RyYW5zZm9ybUxpc3RlbmVyICk7XHJcbiAgICB0cmFuc2Zvcm1UcmFja2VyLmRpc3Bvc2UoKTtcclxuICAgIHRoaXMucmVhZGluZ0Jsb2NrVHJhbnNmb3JtVHJhY2tlciA9IG51bGw7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5hY3RpdmVSZWFkaW5nQmxvY2tOb2RlLCAnSG93IGNhbiB3ZSBkZWFjdGl2YXRlIHRoZSBhY3RpdmVSZWFkaW5nQmxvY2tOb2RlIGlmIGl0IHdhc250IGFzc2lnbmVkLicgKTtcclxuICAgIHRoaXMuYWN0aXZlUmVhZGluZ0Jsb2NrTm9kZSEucmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMucmVhZGluZ0Jsb2NrSGlnaGxpZ2h0Q2hhbmdlTGlzdGVuZXIgKTtcclxuXHJcbiAgICB0aGlzLmFjdGl2ZVJlYWRpbmdCbG9ja05vZGUgPSBudWxsO1xyXG4gICAgdGhpcy5yZWFkaW5nQmxvY2tUcmFpbCA9IG51bGw7XHJcbiAgICB0aGlzLmFkZGVkUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0ID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERlYWN0aXZhdGVzIHRoZSBhbGwgYWN0aXZlIGhpZ2hsaWdodHMsIGRpc3Bvc2luZyBhbmQgcmVtb3ZpbmcgbGlzdGVuZXJzIGFzIG5lY2Vzc2FyeS5cclxuICAgKi9cclxuICBwcml2YXRlIGRlYWN0aXZhdGVIaWdobGlnaHQoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm5vZGUsICdOZWVkIGFuIGFjdGl2ZSBOb2RlIHRvIGRlYWN0aXZhdGUgaGlnaGxpZ2h0cycgKTtcclxuICAgIGNvbnN0IGFjdGl2ZU5vZGUgPSB0aGlzLm5vZGUhO1xyXG5cclxuICAgIGlmICggdGhpcy5tb2RlID09PSAnc2hhcGUnICkge1xyXG4gICAgICB0aGlzLnNoYXBlRm9jdXNIaWdobGlnaHRQYXRoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLm1vZGUgPT09ICdub2RlJyApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5ub2RlTW9kZUhpZ2hsaWdodCwgJ0hvdyBjYW4gd2UgZGVhY3RpdmF0ZSBpZiBub2RlTW9kZUhpZ2hsaWdodCBpcyBub3QgYXNzaWduZWQnICk7XHJcbiAgICAgIGNvbnN0IG5vZGVNb2RlSGlnaGxpZ2h0ID0gdGhpcy5ub2RlTW9kZUhpZ2hsaWdodCE7XHJcblxyXG4gICAgICAvLyBJZiBsYXllcmVkLCBjbGllbnQgaGFzIHB1dCB0aGUgTm9kZSB3aGVyZSB0aGV5IHdhbnQgaW4gdGhlIHNjZW5lIGdyYXBoIGFuZCB3ZSBjYW5ub3QgcmVtb3ZlIGl0XHJcbiAgICAgIGlmICggdGhpcy5ub2RlTW9kZUhpZ2hsaWdodExheWVyZWQgKSB7XHJcbiAgICAgICAgdGhpcy5ub2RlTW9kZUhpZ2hsaWdodExheWVyZWQgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmhpZ2hsaWdodE5vZGUucmVtb3ZlQ2hpbGQoIG5vZGVNb2RlSGlnaGxpZ2h0ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG5vZGUgZm9jdXMgaGlnaGxpZ2h0IGNhbiBiZSBjbGVhcmVkIG5vdyB0aGF0IGl0IGhhcyBiZWVuIHJlbW92ZWRcclxuICAgICAgbm9kZU1vZGVIaWdobGlnaHQudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLm5vZGVNb2RlSGlnaGxpZ2h0ID0gbnVsbDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLm1vZGUgPT09ICdib3VuZHMnICkge1xyXG4gICAgICB0aGlzLmJvdW5kc0ZvY3VzSGlnaGxpZ2h0UGF0aC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIGFjdGl2ZU5vZGUubG9jYWxCb3VuZHNQcm9wZXJ0eS51bmxpbmsoIHRoaXMuYm91bmRzTGlzdGVuZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZW1vdmUgbGlzdGVuZXJzIHRoYXQgcmVkcmF3IHRoZSBoaWdobGlnaHQgaWYgYSB0eXBlIG9mIGhpZ2hsaWdodCBjaGFuZ2VzIG9uIHRoZSBOb2RlXHJcbiAgICBpZiAoIGFjdGl2ZU5vZGUuZm9jdXNIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5oYXNMaXN0ZW5lciggdGhpcy5mb2N1c0hpZ2hsaWdodExpc3RlbmVyICkgKSB7XHJcbiAgICAgIGFjdGl2ZU5vZGUuZm9jdXNIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5mb2N1c0hpZ2hsaWdodExpc3RlbmVyICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYWN0aXZlSW50ZXJhY3RpdmVIaWdobGlnaHRpbmdOb2RlID0gYWN0aXZlTm9kZSBhcyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ05vZGU7XHJcbiAgICBpZiAoIGFjdGl2ZUludGVyYWN0aXZlSGlnaGxpZ2h0aW5nTm9kZS5pc0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nICkge1xyXG4gICAgICBpZiAoIGFjdGl2ZUludGVyYWN0aXZlSGlnaGxpZ2h0aW5nTm9kZS5pbnRlcmFjdGl2ZUhpZ2hsaWdodENoYW5nZWRFbWl0dGVyLmhhc0xpc3RlbmVyKCB0aGlzLmludGVyYWN0aXZlSGlnaGxpZ2h0TGlzdGVuZXIgKSApIHtcclxuICAgICAgICBhY3RpdmVJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ05vZGUuaW50ZXJhY3RpdmVIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5pbnRlcmFjdGl2ZUhpZ2hsaWdodExpc3RlbmVyICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBhY3RpdmVJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ05vZGUuZm9jdXNIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5oYXNMaXN0ZW5lciggdGhpcy5pbnRlcmFjdGl2ZUhpZ2hsaWdodExpc3RlbmVyICkgKSB7XHJcbiAgICAgICAgYWN0aXZlSW50ZXJhY3RpdmVIaWdobGlnaHRpbmdOb2RlLmZvY3VzSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuaW50ZXJhY3RpdmVIaWdobGlnaHRMaXN0ZW5lciApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVtb3ZlIGFsbCAnZ3JvdXAnIGZvY3VzIGhpZ2hsaWdodHNcclxuICAgIHRoaXMuZGVhY3RpdmF0ZUdyb3VwSGlnaGxpZ2h0cygpO1xyXG5cclxuICAgIHRoaXMudHJhaWwgPSBudWxsO1xyXG4gICAgdGhpcy5ub2RlID0gbnVsbDtcclxuICAgIHRoaXMubW9kZSA9IG51bGw7XHJcbiAgICB0aGlzLmFjdGl2ZUhpZ2hsaWdodCA9IG51bGw7XHJcbiAgICB0aGlzLnRyYW5zZm9ybVRyYWNrZXIhLnJlbW92ZUxpc3RlbmVyKCB0aGlzLnRyYW5zZm9ybUxpc3RlbmVyICk7XHJcbiAgICB0aGlzLnRyYW5zZm9ybVRyYWNrZXIhLmRpc3Bvc2UoKTtcclxuICAgIHRoaXMudHJhbnNmb3JtVHJhY2tlciA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBY3RpdmF0ZSBhbGwgJ2dyb3VwJyBmb2N1cyBoaWdobGlnaHRzIGJ5IHNlYXJjaGluZyBmb3IgYW5jZXN0b3Igbm9kZXMgZnJvbSB0aGUgbm9kZSB0aGF0IGhhcyBmb2N1c1xyXG4gICAqIGFuZCBhZGRpbmcgYSByZWN0YW5nbGUgYXJvdW5kIGl0IGlmIGl0IGhhcyBhIFwiZ3JvdXBGb2N1c0hpZ2hsaWdodFwiLiBBIGdyb3VwIGhpZ2hsaWdodCB3aWxsIG9ubHkgYXBwZWFyIGFyb3VuZFxyXG4gICAqIHRoZSBjbG9zZXN0IGFuY2VzdG9yIHRoYXQgaGFzIGEgb25lLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYWN0aXZhdGVHcm91cEhpZ2hsaWdodHMoKTogdm9pZCB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy50cmFpbCwgJ211c3QgaGF2ZSBhbiBhY3RpdmUgdHJhaWwgdG8gYWN0aXZhdGUgZ3JvdXAgaGlnaGxpZ2h0cycgKTtcclxuICAgIGNvbnN0IHRyYWlsID0gdGhpcy50cmFpbCE7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0cmFpbC5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3Qgbm9kZSA9IHRyYWlsLm5vZGVzWyBpIF07XHJcbiAgICAgIGNvbnN0IGhpZ2hsaWdodCA9IG5vZGUuZ3JvdXBGb2N1c0hpZ2hsaWdodDtcclxuICAgICAgaWYgKCBoaWdobGlnaHQgKSB7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSB0cmFuc2Zvcm0gdHJhY2tlclxyXG4gICAgICAgIGNvbnN0IHRyYWlsVG9QYXJlbnQgPSB0cmFpbC51cFRvTm9kZSggbm9kZSApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBUcmFuc2Zvcm1UcmFja2VyID0gbmV3IFRyYW5zZm9ybVRyYWNrZXIoIHRyYWlsVG9QYXJlbnQgKTtcclxuICAgICAgICB0aGlzLmdyb3VwVHJhbnNmb3JtVHJhY2tlci5hZGRMaXN0ZW5lciggdGhpcy50cmFuc2Zvcm1MaXN0ZW5lciApO1xyXG5cclxuICAgICAgICBpZiAoIHR5cGVvZiBoaWdobGlnaHQgPT09ICdib29sZWFuJyApIHtcclxuXHJcbiAgICAgICAgICAvLyBhZGQgYSBib3VuZGluZyByZWN0YW5nbGUgYXJvdW5kIHRoZSBub2RlIHRoYXQgdXNlcyBncm91cCBoaWdobGlnaHRzXHJcbiAgICAgICAgICB0aGlzLmdyb3VwRm9jdXNIaWdobGlnaHRQYXRoLnNldFNoYXBlRnJvbU5vZGUoIG5vZGUgKTtcclxuICAgICAgICAgIHRoaXMuZ3JvdXBGb2N1c0hpZ2hsaWdodFBhdGgudmlzaWJsZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgdGhpcy5ncm91cEhpZ2hsaWdodE5vZGUgPSB0aGlzLmdyb3VwRm9jdXNIaWdobGlnaHRQYXRoO1xyXG4gICAgICAgICAgdGhpcy5ncm91cE1vZGUgPSAnYm91bmRzJztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIGhpZ2hsaWdodCBpbnN0YW5jZW9mIE5vZGUgKSB7XHJcbiAgICAgICAgICB0aGlzLmdyb3VwSGlnaGxpZ2h0Tm9kZSA9IGhpZ2hsaWdodDtcclxuICAgICAgICAgIHRoaXMuZ3JvdXBGb2N1c0hpZ2hsaWdodFBhcmVudC5hZGRDaGlsZCggaGlnaGxpZ2h0ICk7XHJcblxyXG4gICAgICAgICAgdGhpcy5ncm91cE1vZGUgPSAnbm9kZSc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBPbmx5IGNsb3Nlc3QgYW5jZXN0b3Igd2l0aCBncm91cCBoaWdobGlnaHQgd2lsbCBnZXQgdGhlIGdyb3VwIGhpZ2hsaWdodFxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgZm9jdXMgaGlnaGxpZ2h0IGNvbG9ycy4gVGhpcyBpcyBhIG5vLW9wIGlmIHdlIGFyZSBpbiAnbm9kZScgbW9kZSwgb3IgaWYgbm9uZSBvZiB0aGUgaGlnaGxpZ2h0IGNvbG9yc1xyXG4gICAqIGhhdmUgY2hhbmdlZC5cclxuICAgKlxyXG4gICAqIFRPRE86IFN1cHBvcnQgdXBkYXRpbmcgZm9jdXMgaGlnaGxpZ2h0IHN0cm9rZXMgaW4gJ25vZGUnIG1vZGUgYXMgd2VsbD9cclxuICAgKi9cclxuICBwcml2YXRlIHVwZGF0ZUhpZ2hsaWdodENvbG9ycygpOiB2b2lkIHtcclxuXHJcbiAgICBpZiAoIHRoaXMubW9kZSA9PT0gJ3NoYXBlJyApIHtcclxuICAgICAgaWYgKCB0aGlzLnNoYXBlRm9jdXNIaWdobGlnaHRQYXRoLmlubmVySGlnaGxpZ2h0Q29sb3IgIT09IEhpZ2hsaWdodE92ZXJsYXkuZ2V0SW5uZXJIaWdobGlnaHRDb2xvcigpICkge1xyXG4gICAgICAgIHRoaXMuc2hhcGVGb2N1c0hpZ2hsaWdodFBhdGguc2V0SW5uZXJIaWdobGlnaHRDb2xvciggSGlnaGxpZ2h0T3ZlcmxheS5nZXRJbm5lckhpZ2hsaWdodENvbG9yKCkgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHRoaXMuc2hhcGVGb2N1c0hpZ2hsaWdodFBhdGgub3V0ZXJIaWdobGlnaHRDb2xvciAhPT0gSGlnaGxpZ2h0T3ZlcmxheS5nZXRPdXRlckhpZ2hsaWdodENvbG9yKCkgKSB7XHJcbiAgICAgICAgdGhpcy5zaGFwZUZvY3VzSGlnaGxpZ2h0UGF0aC5zZXRPdXRlckhpZ2hsaWdodENvbG9yKCBIaWdobGlnaHRPdmVybGF5LmdldE91dGVySGlnaGxpZ2h0Q29sb3IoKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5tb2RlID09PSAnYm91bmRzJyApIHtcclxuICAgICAgaWYgKCB0aGlzLmJvdW5kc0ZvY3VzSGlnaGxpZ2h0UGF0aC5pbm5lckhpZ2hsaWdodENvbG9yICE9PSBIaWdobGlnaHRPdmVybGF5LmdldElubmVySGlnaGxpZ2h0Q29sb3IoKSApIHtcclxuICAgICAgICB0aGlzLmJvdW5kc0ZvY3VzSGlnaGxpZ2h0UGF0aC5zZXRJbm5lckhpZ2hsaWdodENvbG9yKCBIaWdobGlnaHRPdmVybGF5LmdldElubmVySGlnaGxpZ2h0Q29sb3IoKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggdGhpcy5ib3VuZHNGb2N1c0hpZ2hsaWdodFBhdGgub3V0ZXJIaWdobGlnaHRDb2xvciAhPT0gSGlnaGxpZ2h0T3ZlcmxheS5nZXRPdXRlckhpZ2hsaWdodENvbG9yKCkgKSB7XHJcbiAgICAgICAgdGhpcy5ib3VuZHNGb2N1c0hpZ2hsaWdodFBhdGguc2V0T3V0ZXJIaWdobGlnaHRDb2xvciggSGlnaGxpZ2h0T3ZlcmxheS5nZXRPdXRlckhpZ2hsaWdodENvbG9yKCkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGEgZ3JvdXAgZm9jdXMgaGlnaGxpZ2h0IGlzIGFjdGl2ZSwgdXBkYXRlIHN0cm9rZXNcclxuICAgIGlmICggdGhpcy5ncm91cE1vZGUgKSB7XHJcbiAgICAgIGlmICggdGhpcy5ncm91cEZvY3VzSGlnaGxpZ2h0UGF0aC5pbm5lckhpZ2hsaWdodENvbG9yICE9PSBIaWdobGlnaHRPdmVybGF5LmdldElubmVyR3JvdXBIaWdobGlnaHRDb2xvcigpICkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXBGb2N1c0hpZ2hsaWdodFBhdGguc2V0SW5uZXJIaWdobGlnaHRDb2xvciggSGlnaGxpZ2h0T3ZlcmxheS5nZXRJbm5lckdyb3VwSGlnaGxpZ2h0Q29sb3IoKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggdGhpcy5ncm91cEZvY3VzSGlnaGxpZ2h0UGF0aC5vdXRlckhpZ2hsaWdodENvbG9yICE9PSBIaWdobGlnaHRPdmVybGF5LmdldE91dGVyR3JvdXBIaWdobGlnaHRDb2xvcigpICkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXBGb2N1c0hpZ2hsaWdodFBhdGguc2V0T3V0ZXJIaWdobGlnaHRDb2xvciggSGlnaGxpZ2h0T3ZlcmxheS5nZXRPdXRlckdyb3VwSGlnaGxpZ2h0Q29sb3IoKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYWxsIGdyb3VwIGZvY3VzIGhpZ2hsaWdodHMgYnkgbWFraW5nIHRoZW0gaW52aXNpYmxlLCBvciByZW1vdmluZyB0aGVtIGZyb20gdGhlIHJvb3Qgb2YgdGhpcyBvdmVybGF5LFxyXG4gICAqIGRlcGVuZGluZyBvbiBtb2RlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZGVhY3RpdmF0ZUdyb3VwSGlnaGxpZ2h0cygpOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5ncm91cE1vZGUgKSB7XHJcbiAgICAgIGlmICggdGhpcy5ncm91cE1vZGUgPT09ICdib3VuZHMnICkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXBGb2N1c0hpZ2hsaWdodFBhdGgudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLmdyb3VwTW9kZSA9PT0gJ25vZGUnICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZ3JvdXBIaWdobGlnaHROb2RlLCAnTmVlZCBhIGdyb3VwSGlnaGxpZ2h0Tm9kZSB0byBkZWFjdGl2YXRlIHRoaXMgbW9kZScgKTtcclxuICAgICAgICB0aGlzLmdyb3VwRm9jdXNIaWdobGlnaHRQYXJlbnQucmVtb3ZlQ2hpbGQoIHRoaXMuZ3JvdXBIaWdobGlnaHROb2RlISApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmdyb3VwTW9kZSA9IG51bGw7XHJcbiAgICAgIHRoaXMuZ3JvdXBIaWdobGlnaHROb2RlID0gbnVsbDtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZ3JvdXBUcmFuc2Zvcm1UcmFja2VyLCAnTmVlZCBhIGdyb3VwVHJhbnNmb3JtVHJhY2tlciB0byBkaXNwb3NlJyApO1xyXG4gICAgICB0aGlzLmdyb3VwVHJhbnNmb3JtVHJhY2tlciEucmVtb3ZlTGlzdGVuZXIoIHRoaXMudHJhbnNmb3JtTGlzdGVuZXIgKTtcclxuICAgICAgdGhpcy5ncm91cFRyYW5zZm9ybVRyYWNrZXIhLmRpc3Bvc2UoKTtcclxuICAgICAgdGhpcy5ncm91cFRyYW5zZm9ybVRyYWNrZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGZyb20gSGlnaGxpZ2h0T3ZlcmxheSBhZnRlciB0cmFuc2Zvcm1pbmcgdGhlIGhpZ2hsaWdodC4gT25seSBjYWxsZWQgd2hlbiB0aGUgdHJhbnNmb3JtIGNoYW5nZXMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhZnRlclRyYW5zZm9ybSgpOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5tb2RlID09PSAnc2hhcGUnICkge1xyXG4gICAgICB0aGlzLnNoYXBlRm9jdXNIaWdobGlnaHRQYXRoLnVwZGF0ZUxpbmVXaWR0aCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMubW9kZSA9PT0gJ2JvdW5kcycgKSB7XHJcbiAgICAgIHRoaXMuYm91bmRzRm9jdXNIaWdobGlnaHRQYXRoLnVwZGF0ZUxpbmVXaWR0aCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMubW9kZSA9PT0gJ25vZGUnICYmIHRoaXMuYWN0aXZlSGlnaGxpZ2h0IGluc3RhbmNlb2YgRm9jdXNIaWdobGlnaHRQYXRoICYmIHRoaXMuYWN0aXZlSGlnaGxpZ2h0LnVwZGF0ZUxpbmVXaWR0aCApIHtcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0aGUgdHJhbnNmb3JtIGJhc2VkIG9uIHRoZSB0cmFuc2Zvcm0gb2YgdGhlIG5vZGUgdGhhdCB0aGUgZm9jdXNIaWdobGlnaHQgaXMgaGlnaGxpZ2h0aW5nLlxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm5vZGUsICdOZWVkIGFuIGFjdGl2ZSBOb2RlIHRvIHVwZGF0ZSBsaW5lIHdpZHRoJyApO1xyXG4gICAgICB0aGlzLmFjdGl2ZUhpZ2hsaWdodC51cGRhdGVMaW5lV2lkdGgoIHRoaXMubm9kZSEgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV2ZXJ5IHRpbWUgdGhlIHRyYW5zZm9ybSBjaGFuZ2VzIG9uIHRoZSB0YXJnZXQgTm9kZSBzaWduaWZ5IHRoYXQgdXBkYXRlcyBhcmUgbmVjZXNzYXJ5LCBzZWUgdGhlIHVzYWdlIG9mIHRoZVxyXG4gICAqIFRyYW5zZm9ybVRyYWNrZXJzLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgb25UcmFuc2Zvcm1DaGFuZ2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLnRyYW5zZm9ybURpcnR5ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcmsgdGhhdCB0aGUgdHJhbnNmb3JtIGZvciB0aGUgUmVhZGluZ0Jsb2NrIGhpZ2hsaWdodCBpcyBvdXQgb2YgZGF0ZSBhbmQgbmVlZHMgdG8gYmUgcmVjYWxjdWxhdGVkIG5leHQgdXBkYXRlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgb25SZWFkaW5nQmxvY2tUcmFuc2Zvcm1DaGFuZ2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlYWRpbmdCbG9ja1RyYW5zZm9ybURpcnR5ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGJvdW5kcyBjaGFuZ2Ugb24gb3VyIG5vZGUgd2hlbiB3ZSBhcmUgaW4gXCJCb3VuZHNcIiBtb2RlXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvbkJvdW5kc0NoYW5nZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubm9kZSwgJ011c3QgaGF2ZSBhbiBhY3RpdmUgbm9kZSB3aGVuIGJvdW5kcyBhcmUgY2hhbmdpbmcnICk7XHJcbiAgICB0aGlzLmJvdW5kc0ZvY3VzSGlnaGxpZ2h0UGF0aC5zZXRTaGFwZUZyb21Ob2RlKCB0aGlzLm5vZGUhICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgbWFpbiBTY2VuZXJ5IGZvY3VzIHBhaXIgKERpc3BsYXksVHJhaWwpIGNoYW5nZXMuIFRoZSBUcmFpbCBwb2ludHMgdG8gdGhlIE5vZGUgdGhhdCBoYXNcclxuICAgKiBmb2N1cyBhbmQgYSBoaWdobGlnaHQgd2lsbCBhcHBlYXIgYXJvdW5kIHRoaXMgTm9kZSBpZiBmb2N1cyBoaWdobGlnaHRzIGFyZSB2aXNpYmxlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgb25Gb2N1c0NoYW5nZSggZm9jdXM6IEZvY3VzIHwgbnVsbCApOiB2b2lkIHtcclxuICAgIGNvbnN0IG5ld1RyYWlsID0gKCBmb2N1cyAmJiBmb2N1cy5kaXNwbGF5ID09PSB0aGlzLmRpc3BsYXkgKSA/IGZvY3VzLnRyYWlsIDogbnVsbDtcclxuXHJcbiAgICBpZiAoIHRoaXMuaGFzSGlnaGxpZ2h0KCkgKSB7XHJcbiAgICAgIHRoaXMuZGVhY3RpdmF0ZUhpZ2hsaWdodCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggbmV3VHJhaWwgJiYgdGhpcy5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICBjb25zdCBub2RlID0gbmV3VHJhaWwubGFzdE5vZGUoKTtcclxuXHJcbiAgICAgIHRoaXMuYWN0aXZhdGVGb2N1c0hpZ2hsaWdodCggbmV3VHJhaWwsIG5vZGUgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJGb2N1c1Byb3BlcnR5LnZhbHVlICYmIHRoaXMuaW50ZXJhY3RpdmVIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLnVwZGF0ZUludGVyYWN0aXZlSGlnaGxpZ2h0KCB0aGlzLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJGb2N1c1Byb3BlcnR5LnZhbHVlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgcG9pbnRlckZvY3VzUHJvcGVydHkgY2hhbmdlcy4gcG9pbnRlckZvY3VzUHJvcGVydHkgd2lsbCBoYXZlIHRoZSBUcmFpbCB0byB0aGVcclxuICAgKiBOb2RlIHRoYXQgY29tcG9zZXMgVm9pY2luZyBhbmQgaXMgdW5kZXIgdGhlIFBvaW50ZXIuIEEgaGlnaGxpZ2h0IHdpbGwgYXBwZWFyIGFyb3VuZCB0aGlzIE5vZGUgaWZcclxuICAgKiB2b2ljaW5nIGhpZ2hsaWdodHMgYXJlIHZpc2libGUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvblBvaW50ZXJGb2N1c0NoYW5nZSggZm9jdXM6IEZvY3VzIHwgbnVsbCApOiB2b2lkIHtcclxuXHJcbiAgICAvLyB1cGRhdGVJbnRlcmFjdGl2ZUhpZ2hsaWdodCB3aWxsIG9ubHkgYWN0aXZhdGUgdGhlIGhpZ2hsaWdodCBpZiBwZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5IGlzIGZhbHNlLFxyXG4gICAgLy8gYnV0IGNoZWNrIGhlcmUgYXMgd2VsbCBzbyB0aGF0IHdlIGRvbid0IGRvIHdvcmsgdG8gZGVhY3RpdmF0ZSBoaWdobGlnaHRzIG9ubHkgdG8gaW1tZWRpYXRlbHkgcmVhY3RpdmF0ZSB0aGVtXHJcbiAgICBpZiAoICF0aGlzLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLmxvY2tlZFBvaW50ZXJGb2N1c1Byb3BlcnR5LnZhbHVlICYmXHJcbiAgICAgICAgICF0aGlzLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlSW50ZXJhY3RpdmVIaWdobGlnaHQoIGZvY3VzICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWRyYXdzIHRoZSBoaWdobGlnaHQuIFRoZXJlIGFyZSBjYXNlcyB3aGVyZSB3ZSB3YW50IHRvIGRvIHRoaXMgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSBwb2ludGVyIGZvY3VzXHJcbiAgICogaXMgbG9ja2VkLCBzdWNoIGFzIHdoZW4gdGhlIGhpZ2hsaWdodCBjaGFuZ2VzIGNoYW5nZXMgZm9yIGEgTm9kZSB0aGF0IGlzIGFjdGl2YXRlZCBmb3IgaGlnaGxpZ2h0aW5nLlxyXG4gICAqXHJcbiAgICogQXMgb2YgOC8xMS8yMSB3ZSBhbHNvIGRlY2lkZWQgdGhhdCBJbnRlcmFjdGl2ZSBIaWdobGlnaHRzIHNob3VsZCBhbHNvIG5ldmVyIGJlIHNob3duIHdoaWxlXHJcbiAgICogUERPTSBoaWdobGlnaHRzIGFyZSB2aXNpYmxlLCB0byBhdm9pZCBjb25mdXNpbmcgY2FzZXMgd2hlcmUgdGhlIEludGVyYWN0aXZlIEhpZ2hsaWdodFxyXG4gICAqIGNhbiBhcHBlYXIgd2hpbGUgdGhlIERPTSBmb2N1cyBoaWdobGlnaHQgaXMgYWN0aXZlIGFuZCBjb252ZXlpbmcgaW5mb3JtYXRpb24uIEluIHRoZSBmdXR1cmVcclxuICAgKiB3ZSBtaWdodCBtYWtlIGl0IHNvIHRoYXQgYm90aCBjYW4gYmUgdmlzaWJsZSBhdCB0aGUgc2FtZSB0aW1lLCBidXQgdGhhdCB3aWxsIHJlcXVpcmVcclxuICAgKiBjaGFuZ2luZyB0aGUgbG9vayBvZiBvbmUgb2YgdGhlIGhpZ2hsaWdodHMgc28gaXQgaXMgY2xlYXIgdGhleSBhcmUgZGlzdGluY3QuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB1cGRhdGVJbnRlcmFjdGl2ZUhpZ2hsaWdodCggZm9jdXM6IEZvY3VzIHwgbnVsbCApOiB2b2lkIHtcclxuICAgIGNvbnN0IG5ld1RyYWlsID0gKCBmb2N1cyAmJiBmb2N1cy5kaXNwbGF5ID09PSB0aGlzLmRpc3BsYXkgKSA/IGZvY3VzLnRyYWlsIDogbnVsbDtcclxuXHJcbiAgICAvLyBhbHdheXMgY2xlYXIgdGhlIGhpZ2hsaWdodCBpZiBpdCBpcyBiZWluZyByZW1vdmVkXHJcbiAgICBpZiAoIHRoaXMuaGFzSGlnaGxpZ2h0KCkgKSB7XHJcbiAgICAgIHRoaXMuZGVhY3RpdmF0ZUhpZ2hsaWdodCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG9ubHkgYWN0aXZhdGUgYSBuZXcgaGlnaGxpZ2h0IGlmIFBET00gZm9jdXMgaGlnaGxpZ2h0cyBhcmUgbm90IGRpc3BsYXllZCwgc2VlIEpTRG9jXHJcbiAgICBsZXQgYWN0aXZhdGVkID0gZmFsc2U7XHJcbiAgICBpZiAoIG5ld1RyYWlsICYmICF0aGlzLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIGNvbnN0IG5vZGUgPSBuZXdUcmFpbC5sYXN0Tm9kZSgpIGFzIFJlYWRpbmdCbG9ja05vZGU7XHJcblxyXG4gICAgICBpZiAoICggbm9kZS5pc1JlYWRpbmdCbG9jayAmJiB0aGlzLnJlYWRpbmdCbG9ja0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkudmFsdWUgKSB8fCAoICFub2RlLmlzUmVhZGluZ0Jsb2NrICYmIHRoaXMuaW50ZXJhY3RpdmVIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LnZhbHVlICkgKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmF0ZUludGVyYWN0aXZlSGlnaGxpZ2h0KCBuZXdUcmFpbCwgbm9kZSApO1xyXG4gICAgICAgIGFjdGl2YXRlZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoICFhY3RpdmF0ZWQgJiYgRm9jdXNNYW5hZ2VyLnBkb21Gb2N1cyAmJiB0aGlzLnBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHRoaXMub25Gb2N1c0NoYW5nZSggRm9jdXNNYW5hZ2VyLnBkb21Gb2N1cyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW5ldmVyIHRoZSBsb2NrZWRQb2ludGVyRm9jdXNQcm9wZXJ0eSBjaGFuZ2VzLiBJZiB0aGUgbG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkgY2hhbmdlcyB3ZSBwcm9iYWJseVxyXG4gICAqIGhhdmUgdG8gdXBkYXRlIHRoZSBoaWdobGlnaHQgYmVjYXVzZSBpbnRlcmFjdGlvbiB3aXRoIGEgTm9kZSB0aGF0IHVzZXMgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcganVzdCBlbmRlZC5cclxuICAgKi9cclxuICBwcml2YXRlIG9uTG9ja2VkUG9pbnRlckZvY3VzQ2hhbmdlKCBmb2N1czogRm9jdXMgfCBudWxsICk6IHZvaWQge1xyXG4gICAgdGhpcy51cGRhdGVJbnRlcmFjdGl2ZUhpZ2hsaWdodCggZm9jdXMgfHwgdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5wb2ludGVyRm9jdXNQcm9wZXJ0eS52YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzcG9uc2libGUgZm9yIGRlYWN0aXZhdGluZyB0aGUgUmVhZGluZyBCbG9jayBoaWdobGlnaHQgd2hlbiB0aGUgZGlzcGxheS5mb2N1c01hbmFnZXIucmVhZGluZ0Jsb2NrRm9jdXNQcm9wZXJ0eSBjaGFuZ2VzLlxyXG4gICAqIFRoZSBSZWFkaW5nIEJsb2NrIHdhaXRzIHRvIGFjdGl2YXRlIHVudGlsIHRoZSB2b2ljaW5nTWFuYWdlciBzdGFydHMgc3BlYWtpbmcgYmVjYXVzZSB0aGVyZSBpcyBvZnRlbiBhIHN0b3Agc3BlYWtpbmdcclxuICAgKiBldmVudCB0aGF0IGNvbWVzIHJpZ2h0IGFmdGVyIHRoZSBzcGVha2VyIHN0YXJ0cyB0byBpbnRlcnJ1cHQgdGhlIHByZXZpb3VzIHV0dGVyYW5jZS5cclxuICAgKi9cclxuICBwcml2YXRlIG9uUmVhZGluZ0Jsb2NrRm9jdXNDaGFuZ2UoIGZvY3VzOiBGb2N1cyB8IG51bGwgKTogdm9pZCB7XHJcbiAgICBpZiAoIHRoaXMuaGFzUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0KCkgKSB7XHJcbiAgICAgIHRoaXMuZGVhY3RpdmF0ZVJlYWRpbmdCbG9ja0hpZ2hsaWdodCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5ld1RyYWlsID0gKCBmb2N1cyAmJiBmb2N1cy5kaXNwbGF5ID09PSB0aGlzLmRpc3BsYXkgKSA/IGZvY3VzLnRyYWlsIDogbnVsbDtcclxuICAgIGlmICggbmV3VHJhaWwgKSB7XHJcbiAgICAgIHRoaXMuYWN0aXZhdGVSZWFkaW5nQmxvY2tIaWdobGlnaHQoIG5ld1RyYWlsICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJZiB0aGUgZm9jdXNlZCBub2RlIGhhcyBhbiB1cGRhdGVkIGZvY3VzIGhpZ2hsaWdodCwgd2UgbXVzdCBkbyBhbGwgdGhlIHdvcmsgb2YgaGlnaGxpZ2h0IGRlYWN0aXZhdGlvbi9hY3RpdmF0aW9uXHJcbiAgICogYXMgaWYgdGhlIGFwcGxpY2F0aW9uIGZvY3VzIGNoYW5nZWQuIElmIGZvY3VzIGhpZ2hsaWdodCBtb2RlIGNoYW5nZWQsIHdlIG5lZWQgdG8gYWRkL3JlbW92ZSBzdGF0aWMgbGlzdGVuZXJzLFxyXG4gICAqIGFkZC9yZW1vdmUgaGlnaGxpZ2h0IGNoaWxkcmVuLCBhbmQgc28gb24uIENhbGxlZCB3aGVuIGZvY3VzIGhpZ2hsaWdodCBjaGFuZ2VzLCBidXQgc2hvdWxkIG9ubHkgZXZlciBiZVxyXG4gICAqIG5lY2Vzc2FyeSB3aGVuIHRoZSBub2RlIGhhcyBmb2N1cy5cclxuICAgKi9cclxuICBwcml2YXRlIG9uRm9jdXNIaWdobGlnaHRDaGFuZ2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm5vZGUgJiYgdGhpcy5ub2RlLmZvY3VzZWQsICd1cGRhdGUgc2hvdWxkIG9ubHkgYmUgbmVjZXNzYXJ5IGlmIG5vZGUgYWxyZWFkeSBoYXMgZm9jdXMnICk7XHJcbiAgICB0aGlzLm9uRm9jdXNDaGFuZ2UoIEZvY3VzTWFuYWdlci5wZG9tRm9jdXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElmIHRoZSBOb2RlIGhhcyBwb2ludGVyIGZvY3VzIGFuZCB0aGUgaW50ZXJhY2l2ZSBoaWdobGlnaHQgY2hhbmdlcywgd2UgbXVzdCBkbyBhbGwgb2YgdGhlIHdvcmsgdG8gcmVhcHBseSB0aGVcclxuICAgKiBoaWdobGlnaHQgYXMgaWYgdGhlIHZhbHVlIG9mIHRoZSBmb2N1c1Byb3BlcnR5IGNoYW5nZWQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvbkludGVyYWN0aXZlSGlnaGxpZ2h0Q2hhbmdlKCk6IHZvaWQge1xyXG5cclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICBjb25zdCBpbnRlcmFjdGl2ZUhpZ2hsaWdodE5vZGUgPSB0aGlzLm5vZGUgYXMgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmdOb2RlO1xyXG4gICAgICBjb25zdCBsb2NrZWRQb2ludGVyRm9jdXMgPSB0aGlzLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLmxvY2tlZFBvaW50ZXJGb2N1c1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgICBhc3NlcnQoIGludGVyYWN0aXZlSGlnaGxpZ2h0Tm9kZSB8fCAoIGxvY2tlZFBvaW50ZXJGb2N1cyAmJiBsb2NrZWRQb2ludGVyRm9jdXMudHJhaWwubGFzdE5vZGUoKSA9PT0gdGhpcy5ub2RlICksXHJcbiAgICAgICAgJ1VwZGF0ZSBzaG91bGQgb25seSBiZSBuZWNlc3NhcnkgaWYgTm9kZSBpcyBhY3RpdmF0ZWQgd2l0aCBhIFBvaW50ZXIgb3IgcG9pbnRlciBmb2N1cyBpcyBsb2NrZWQgZHVyaW5nIGludGVyYWN0aW9uJyApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudXBkYXRlSW50ZXJhY3RpdmVIaWdobGlnaHQoIHRoaXMuZGlzcGxheS5mb2N1c01hbmFnZXIubG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkudmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlZHJhdyB0aGUgaGlnaGxpZ2h0IGZvciB0aGUgUmVhZGluZ0Jsb2NrIGlmIGl0IGNoYW5nZXMgd2hpbGUgdGhlIHJlYWRpbmcgYmxvY2sgaGlnaGxpZ2h0IGlzIGFscmVhZHlcclxuICAgKiBhY3RpdmUgZm9yIGEgTm9kZS5cclxuICAgKi9cclxuICBwcml2YXRlIG9uUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0Q2hhbmdlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5hY3RpdmVSZWFkaW5nQmxvY2tOb2RlLCAnVXBkYXRlIHNob3VsZCBvbmx5IGJlIG5lY2Vzc2FyeSB3aGVuIHRoZXJlIGlzIGFuIGFjdGl2ZSBSZWFkaW5nQmxvY2sgTm9kZScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYWN0aXZlUmVhZGluZ0Jsb2NrTm9kZSEucmVhZGluZ0Jsb2NrQWN0aXZhdGVkLCAnVXBkYXRlIHNob3VsZCBvbmx5IGJlIG5lY2Vzc2FyeSB3aGlsZSB0aGUgUmVhZGluZ0Jsb2NrIGlzIGFjdGl2YXRlZCcgKTtcclxuICAgIHRoaXMub25SZWFkaW5nQmxvY2tGb2N1c0NoYW5nZSggdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5yZWFkaW5nQmxvY2tGb2N1c1Byb3BlcnR5LnZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGVuIGZvY3VzIGhpZ2hsaWdodCB2aXNpYmlsaXR5IGNoYW5nZXMsIGRlYWN0aXZhdGUgaGlnaGxpZ2h0cyBvciByZWFjdGl2YXRlIHRoZSBoaWdobGlnaHQgYXJvdW5kIHRoZSBOb2RlXHJcbiAgICogd2l0aCBmb2N1cy5cclxuICAgKi9cclxuICBwcml2YXRlIG9uRm9jdXNIaWdobGlnaHRzVmlzaWJsZUNoYW5nZSgpOiB2b2lkIHtcclxuICAgIHRoaXMub25Gb2N1c0NoYW5nZSggRm9jdXNNYW5hZ2VyLnBkb21Gb2N1cyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hlbiB2b2ljaW5nIGhpZ2hsaWdodCB2aXNpYmlsaXR5IGNoYW5nZXMsIGRlYWN0aXZhdGUgaGlnaGxpZ2h0cyBvciByZWFjdGl2YXRlIHRoZSBoaWdobGlnaHQgYXJvdW5kIHRoZSBOb2RlXHJcbiAgICogd2l0aCBmb2N1cy4gTm90ZSB0aGF0IHdoZW4gdm9pY2luZyBpcyBkaXNhYmxlZCB3ZSB3aWxsIG5ldmVyIHNldCB0aGUgcG9pbnRlckZvY3VzUHJvcGVydHkgdG8gcHJldmVudFxyXG4gICAqIGV4dHJhIHdvcmssIHNvIHRoaXMgZnVuY3Rpb24gc2hvdWxkbid0IGRvIG11Y2guIEJ1dCBpdCBpcyBoZXJlIHRvIGNvbXBsZXRlIHRoZSBBUEkuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvblZvaWNpbmdIaWdobGlnaHRzVmlzaWJsZUNoYW5nZSgpOiB2b2lkIHtcclxuICAgIHRoaXMub25Qb2ludGVyRm9jdXNDaGFuZ2UoIHRoaXMuZGlzcGxheS5mb2N1c01hbmFnZXIucG9pbnRlckZvY3VzUHJvcGVydHkudmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCBieSBEaXNwbGF5LCB1cGRhdGVzIHRoaXMgb3ZlcmxheSBpbiB0aGUgRGlzcGxheS51cGRhdGVEaXNwbGF5IGNhbGwuXHJcbiAgICovXHJcbiAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBUcmFuc2Zvcm0gdGhlIGhpZ2hsaWdodCB0byBtYXRjaCB0aGUgcG9zaXRpb24gb2YgdGhlIG5vZGVcclxuICAgIGlmICggdGhpcy5oYXNIaWdobGlnaHQoKSAmJiB0aGlzLnRyYW5zZm9ybURpcnR5ICkge1xyXG4gICAgICB0aGlzLnRyYW5zZm9ybURpcnR5ID0gZmFsc2U7XHJcblxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnRyYW5zZm9ybVRyYWNrZXIsICdUaGUgdHJhbnNmb3JtVHJhY2tlciBtdXN0IGJlIGF2YWlsYWJsZSBvbiB1cGRhdGUgaWYgdHJhbnNmb3JtIGlzIGRpcnR5JyApO1xyXG4gICAgICB0aGlzLmhpZ2hsaWdodE5vZGUuc2V0TWF0cml4KCB0aGlzLnRyYW5zZm9ybVRyYWNrZXIhLm1hdHJpeCApO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLmdyb3VwSGlnaGxpZ2h0Tm9kZSApIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmdyb3VwVHJhbnNmb3JtVHJhY2tlciwgJ1RoZSBncm91cFRyYW5zZm9ybVRyYWNrZXIgbXVzdCBiZSBhdmFpbGFibGUgb24gdXBkYXRlIGlmIHRyYW5zZm9ybSBpcyBkaXJ0eScgKTtcclxuICAgICAgICB0aGlzLmdyb3VwSGlnaGxpZ2h0Tm9kZS5zZXRNYXRyaXgoIHRoaXMuZ3JvdXBUcmFuc2Zvcm1UcmFja2VyIS5tYXRyaXggKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5hZnRlclRyYW5zZm9ybSgpO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLmhhc1JlYWRpbmdCbG9ja0hpZ2hsaWdodCgpICYmIHRoaXMucmVhZGluZ0Jsb2NrVHJhbnNmb3JtRGlydHkgKSB7XHJcbiAgICAgIHRoaXMucmVhZGluZ0Jsb2NrVHJhbnNmb3JtRGlydHkgPSBmYWxzZTtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucmVhZGluZ0Jsb2NrVHJhbnNmb3JtVHJhY2tlciwgJ1RoZSBncm91cFRyYW5zZm9ybVRyYWNrZXIgbXVzdCBiZSBhdmFpbGFibGUgb24gdXBkYXRlIGlmIHRyYW5zZm9ybSBpcyBkaXJ0eScgKTtcclxuICAgICAgdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHROb2RlLnNldE1hdHJpeCggdGhpcy5yZWFkaW5nQmxvY2tUcmFuc2Zvcm1UcmFja2VyIS5tYXRyaXggKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoICF0aGlzLmRpc3BsYXkuc2l6ZS5lcXVhbHMoIHRoaXMuZm9jdXNEaXNwbGF5LnNpemUgKSApIHtcclxuICAgICAgdGhpcy5mb2N1c0Rpc3BsYXkuc2V0V2lkdGhIZWlnaHQoIHRoaXMuZGlzcGxheS53aWR0aCwgdGhpcy5kaXNwbGF5LmhlaWdodCApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5mb2N1c0Rpc3BsYXkudXBkYXRlRGlzcGxheSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBpbm5lciBjb2xvciBvZiBhbGwgZm9jdXMgaGlnaGxpZ2h0cy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHNldElubmVySGlnaGxpZ2h0Q29sb3IoIGNvbG9yOiBUUGFpbnQgKTogdm9pZCB7XHJcbiAgICBpbm5lckhpZ2hsaWdodENvbG9yID0gY29sb3I7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGlubmVyIGNvbG9yIG9mIGFsbCBmb2N1cyBoaWdobGlnaHRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgZ2V0SW5uZXJIaWdobGlnaHRDb2xvcigpOiBUUGFpbnQge1xyXG4gICAgcmV0dXJuIGlubmVySGlnaGxpZ2h0Q29sb3I7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIG91dGVyIGNvbG9yIG9mIGFsbCBmb2N1cyBoaWdobGlnaHRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgc2V0T3V0ZXJIaWxpZ2h0Q29sb3IoIGNvbG9yOiBUUGFpbnQgKTogdm9pZCB7XHJcbiAgICBvdXRlckhpZ2hsaWdodENvbG9yID0gY29sb3I7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIG91dGVyIGNvbG9yIG9mIGFsbCBmb2N1cyBoaWdobGlnaHRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgZ2V0T3V0ZXJIaWdobGlnaHRDb2xvcigpOiBUUGFpbnQge1xyXG4gICAgcmV0dXJuIG91dGVySGlnaGxpZ2h0Q29sb3I7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGlubmVyIGNvbG9yIG9mIGFsbCBncm91cCBmb2N1cyBoaWdobGlnaHRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgc2V0SW5uZXJHcm91cEhpZ2hsaWdodENvbG9yKCBjb2xvcjogVFBhaW50ICk6IHZvaWQge1xyXG4gICAgaW5uZXJHcm91cEhpZ2hsaWdodENvbG9yID0gY29sb3I7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGlubmVyIGNvbG9yIG9mIGFsbCBncm91cCBmb2N1cyBoaWdobGlnaHRzXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBnZXRJbm5lckdyb3VwSGlnaGxpZ2h0Q29sb3IoKTogVFBhaW50IHtcclxuICAgIHJldHVybiBpbm5lckdyb3VwSGlnaGxpZ2h0Q29sb3I7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIG91dGVyIGNvbG9yIG9mIGFsbCBncm91cCBmb2N1cyBoaWdobGlnaHQuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBzZXRPdXRlckdyb3VwSGlnaGxpZ2h0Q29sb3IoIGNvbG9yOiBUUGFpbnQgKTogdm9pZCB7XHJcbiAgICBvdXRlckdyb3VwSGlnaGxpZ2h0Q29sb3IgPSBjb2xvcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgb3V0ZXIgY29sb3Igb2YgYWxsIGdyb3VwIGZvY3VzIGhpZ2hsaWdodHMuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBnZXRPdXRlckdyb3VwSGlnaGxpZ2h0Q29sb3IoKTogVFBhaW50IHtcclxuICAgIHJldHVybiBvdXRlckdyb3VwSGlnaGxpZ2h0Q29sb3I7XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnSGlnaGxpZ2h0T3ZlcmxheScsIEhpZ2hsaWdodE92ZXJsYXkgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSxxQ0FBcUM7QUFDakUsU0FBU0MsS0FBSyxRQUFRLDZCQUE2QjtBQUNuRCxPQUFPQyxTQUFTLE1BQU0sb0NBQW9DO0FBQzFELFNBQVNDLDhCQUE4QixFQUFFQyxPQUFPLEVBQVNDLHNCQUFzQixFQUFFQyxrQkFBa0IsRUFBRUMsWUFBWSxFQUFFQyxJQUFJLEVBQUVDLE9BQU8sRUFBMkJD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