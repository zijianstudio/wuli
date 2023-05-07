// Copyright 2013-2023, University of Colorado Boulder

/**
 * A persistent display of a specific Node and its descendants, which is updated at discrete points in time.
 *
 * Use display.getDOMElement or display.domElement to retrieve the Display's DOM representation.
 * Use display.updateDisplay() to trigger the visual update in the Display's DOM element.
 *
 * A standard way of using a Display with Scenery is to:
 * 1. Create a Node that will be the root
 * 2. Create a Display, referencing that node
 * 3. Make changes to the scene graph
 * 4. Call display.updateDisplay() to draw the scene graph into the Display
 * 5. Go to (3)
 *
 * Common ways to simplify the change/update loop would be to:
 * - Use Node-based events. Initialize it with Display.initializeEvents(), then
 *   add input listeners to parts of the scene graph (see Node.addInputListener).
 * - Execute code (and update the display afterwards) by using Display.updateOnRequestAnimationFrame.
 *
 * Internal documentation:
 *
 * Lifecycle information:
 *   Instance (create,dispose)
 *     - out of update:            Stateless stub is created synchronously when a Node's children are added where we
 *                                 have no relevant Instance.
 *     - start of update:          Creates first (root) instance if it doesn't exist (stateless stub).
 *     - synctree:                 Create descendant instances under stubs, fills in state, and marks removed subtree
 *                                 roots for disposal.
 *     - update instance disposal: Disposes root instances that were marked. This also disposes all descendant
 *                                 instances, and for every instance,
 *                                 it disposes the currently-attached drawables.
 *   Drawable (create,dispose)
 *     - synctree:                 Creates all drawables where necessary. If it replaces a self/group/shared drawable on
 *                                 the instance,
 *                                 that old drawable is marked for disposal.
 *     - update instance disposal: Any drawables attached to disposed instances are disposed themselves (see Instance
 *                                 lifecycle).
 *     - update drawable disposal: Any marked drawables that were replaced or removed from an instance (it didn't
 *                                 maintain a reference) are disposed.
 *
 *   add/remove drawables from blocks:
 *     - stitching changes pending "parents", marks for block update
 *     - backbones marked for disposal (e.g. instance is still there, just changed to not have a backbone) will mark
 *         drawables for block updates
 *     - add/remove drawables phase updates drawables that were marked
 *     - disposed backbone instances will only remove drawables if they weren't marked for removal previously (e.g. in
 *         case we are from a removed instance)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Emitter from '../../../axon/js/Emitter.js';
import stepTimer from '../../../axon/js/stepTimer.js';
import TinyProperty from '../../../axon/js/TinyProperty.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import { Matrix3Type } from '../../../dot/js/Matrix3.js';
import escapeHTML from '../../../phet-core/js/escapeHTML.js';
import optionize from '../../../phet-core/js/optionize.js';
import platform from '../../../phet-core/js/platform.js';
import Tandem from '../../../tandem/js/Tandem.js';
import AriaLiveAnnouncer from '../../../utterance-queue/js/AriaLiveAnnouncer.js';
import UtteranceQueue from '../../../utterance-queue/js/UtteranceQueue.js';
import { BackboneDrawable, Block, CanvasBlock, CanvasNodeBoundsOverlay, Color, DOMBlock, DOMDrawable, Features, FittedBlockBoundsOverlay, FocusManager, FullScreen, globalKeyStateTracker, HighlightOverlay, HitAreaOverlay, Input, Instance, KeyboardUtils, Node, PDOMInstance, PDOMSiblingStyle, PDOMTree, PDOMUtils, PointerAreaOverlay, PointerOverlay, Renderer, scenery, scenerySerialize, Trail, Utils, WebGLBlock } from '../imports.js';
import SafariWorkaroundOverlay from '../overlays/SafariWorkaroundOverlay.js';
const CUSTOM_CURSORS = {
  'scenery-grab-pointer': ['grab', '-moz-grab', '-webkit-grab', 'pointer'],
  'scenery-grabbing-pointer': ['grabbing', '-moz-grabbing', '-webkit-grabbing', 'pointer']
};
let globalIdCounter = 1;
export default class Display {
  // unique ID for the display instance, (scenery-internal), and useful for debugging with multiple displays.

  // The (integral, > 0) dimensions of the Display's DOM element (only updates the DOM element on updateDisplay())

  // data structure for managing aria-live alerts the this Display instance

  // Manages the various types of Focus that can go through the Display, as well as Properties
  // controlling which forms of focus should be displayed in the HighlightOverlay.
  // (phet-io,scenery) - Will be filled in with a phet.scenery.Input if event handling is enabled
  // (scenery-internal) Whether accessibility is enabled for this particular display.
  // (scenery-internal)
  // (scenery-internal) map from Node ID to Instance, for fast lookup
  // (scenery-internal) - We have a monotonically-increasing frame ID, generally for use with a pattern
  // where we can mark objects with this to note that they are either up-to-date or need refreshing due to this
  // particular frame (without having to clear that information after use). This is incremented every frame
  // (scenery-internal)
  // to be filled in later
  // will be filled with the root Instance
  // Used to check against new size to see what we need to change
  // At the end of Display.update, reduceReferences will be called on all of these. It's meant to
  // catch various objects that would usually have update() called, but if they are invisible or otherwise not updated
  // for performance, they may need to release references another way instead.
  // See https://github.com/phetsims/energy-forms-and-changes/issues/356
  // Block changes are handled by changing the "pending" block/backbone on drawables. We
  // want to change them all after the main stitch process has completed, so we can guarantee that a single drawable is
  // removed from its previous block before being added to a new one. This is taken care of in an updateDisplay pass
  // after syncTree / stitching.
  // Drawables have two implicit linked-lists, "current" and "old". syncTree modifies the
  // "current" linked-list information so it is up-to-date, but needs to use the "old" information also. We move
  // updating the "current" => "old" linked-list information until after syncTree and stitching is complete, and is
  // taken care of in an updateDisplay pass.
  // We store information on {ChangeInterval}s that records change interval
  // information, that may contain references. We don't want to leave those references dangling after we don't need
  // them, so they are recorded and cleaned in one of updateDisplay's phases.
  // Used for shortcut animation frame functions
  // Listeners that will be called for every event.
  // Whether mouse/touch/keyboard inputs are enabled (if input has been added). Simulation will still step.
  // Passed through to Input
  // Overlays currently being displayed.
  // @assertion-only - Whether we are running the paint phase of updateDisplay() for this Display.
  // @assertion-only
  // @assertion-only Whether disposal has started (but not finished)
  // If accessible
  // (scenery-internal, if accessible)
  // (if accessible)
  // If logging performance
  /**
   * Constructs a Display that will show the rootNode and its subtree in a visual state. Default options provided below
   *
   * @param rootNode - Displays this node and all of its descendants
   * @param [providedOptions]
   */
  constructor(rootNode, providedOptions) {
    assert && assert(rootNode, 'rootNode is a required parameter');

    //OHTWO TODO: hybrid batching (option to batch until an event like 'up' that might be needed for security issues)

    const options = optionize()({
      // {number} - Initial display width
      width: providedOptions && providedOptions.container && providedOptions.container.clientWidth || 640,
      // {number} - Initial display height
      height: providedOptions && providedOptions.container && providedOptions.container.clientHeight || 480,
      // {boolean} - Applies CSS styles to the root DOM element that make it amenable to interactive content
      allowCSSHacks: true,
      allowSafariRedrawWorkaround: false,
      // {boolean} - Usually anything displayed outside of our dom element is hidden with CSS overflow
      allowSceneOverflow: false,
      // {string} - What cursor is used when no other cursor is specified
      defaultCursor: 'default',
      // {ColorDef} - Intial background color
      backgroundColor: null,
      // {boolean} - Whether WebGL will preserve the drawing buffer
      preserveDrawingBuffer: false,
      // {boolean} - Whether WebGL is enabled at all for drawables in this Display
      allowWebGL: true,
      // {boolean} - Enables accessibility features
      accessibility: true,
      // {boolean} - See declaration.
      supportsInteractiveHighlights: false,
      // {boolean} - Whether mouse/touch/keyboard inputs are enabled (if input has been added).
      interactive: true,
      // {boolean} - If true, input event listeners will be attached to the Display's DOM element instead of the window.
      // Normally, attaching listeners to the window is preferred (it will see mouse moves/ups outside of the browser
      // window, allowing correct button tracking), however there may be instances where a global listener is not
      // preferred.
      listenToOnlyElement: false,
      // {boolean} - Forwarded to Input: If true, most event types will be batched until otherwise triggered.
      batchDOMEvents: false,
      // {boolean} - If true, the input event location (based on the top-left of the browser tab's viewport, with no
      // scaling applied) will be used. Usually, this is not a safe assumption, so when false the location of the
      // display's DOM element will be used to get the correct event location. There is a slight performance hit to
      // doing so, thus this option is provided if the top-left location can be guaranteed.
      // NOTE: Rotation of the Display's DOM element (e.g. with a CSS transform) will result in an incorrect event
      //       mapping, as getBoundingClientRect() can't work with this. getBoxQuads() should fix this when browser
      //       support is available.
      assumeFullWindow: false,
      // {boolean} - Whether Scenery will try to aggressively re-create WebGL Canvas/context instead of waiting for
      // a context restored event. Sometimes context losses can occur without a restoration afterwards, but this can
      // jump-start the process.
      // See https://github.com/phetsims/scenery/issues/347.
      aggressiveContextRecreation: true,
      // {boolean|null} - Whether the `passive` flag should be set when adding and removing DOM event listeners.
      // See https://github.com/phetsims/scenery/issues/770 for more details.
      // If it is true or false, that is the value of the passive flag that will be used. If it is null, the default
      // behavior of the browser will be used.
      //
      // Safari doesn't support touch-action: none, so we NEED to not use passive events (which would not allow
      // preventDefault to do anything, so drags actually can scroll the sim).
      // Chrome also did the same "passive by default", but because we have `touch-action: none` in place, it doesn't
      // affect us, and we can potentially get performance improvements by allowing passive events.
      // See https://github.com/phetsims/scenery/issues/770 for more information.
      passiveEvents: platform.safari ? false : null,
      // {boolean} - Whether, if no WebGL antialiasing is detected, the backing scale can be increased so as to
      //             provide some antialiasing benefit. See https://github.com/phetsims/scenery/issues/859.
      allowBackingScaleAntialiasing: true,
      // phet-io
      tandem: Tandem.OPTIONAL
    }, providedOptions);
    this.id = globalIdCounter++;
    this._accessible = options.accessibility;
    this._preserveDrawingBuffer = options.preserveDrawingBuffer;
    this._allowWebGL = options.allowWebGL;
    this._allowCSSHacks = options.allowCSSHacks;
    this._allowSceneOverflow = options.allowSceneOverflow;
    this._defaultCursor = options.defaultCursor;
    this.sizeProperty = new TinyProperty(new Dimension2(options.width, options.height));
    this._currentSize = new Dimension2(-1, -1);
    this._rootNode = rootNode;
    this._rootNode.addRootedDisplay(this);
    this._rootBackbone = null; // to be filled in later
    this._domElement = options.container ? BackboneDrawable.repurposeBackboneContainer(options.container) : BackboneDrawable.createDivBackbone();
    this._sharedCanvasInstances = {};
    this._baseInstance = null; // will be filled with the root Instance
    this._frameId = 0;
    this._dirtyTransformRoots = [];
    this._dirtyTransformRootsWithoutPass = [];
    this._instanceRootsToDispose = [];
    this._reduceReferencesNeeded = [];
    this._drawablesToDispose = [];
    this._drawablesToChangeBlock = [];
    this._drawablesToUpdateLinks = [];
    this._changeIntervalsToDispose = [];
    this._lastCursor = null;
    this._currentBackgroundCSS = null;
    this._backgroundColor = null;
    this._requestAnimationFrameID = 0;
    this._input = null;
    this._inputListeners = [];
    this._interactive = options.interactive;
    this._listenToOnlyElement = options.listenToOnlyElement;
    this._batchDOMEvents = options.batchDOMEvents;
    this._assumeFullWindow = options.assumeFullWindow;
    this._passiveEvents = options.passiveEvents;
    this._aggressiveContextRecreation = options.aggressiveContextRecreation;
    this._allowBackingScaleAntialiasing = options.allowBackingScaleAntialiasing;
    this._overlays = [];
    this._pointerOverlay = null;
    this._pointerAreaOverlay = null;
    this._hitAreaOverlay = null;
    this._canvasAreaBoundsOverlay = null;
    this._fittedBlockBoundsOverlay = null;
    if (assert) {
      this._isPainting = false;
      this._isDisposing = false;
      this._isDisposed = false;
    }
    this.applyCSSHacks();
    this.setBackgroundColor(options.backgroundColor);
    const ariaLiveAnnouncer = new AriaLiveAnnouncer();
    this.descriptionUtteranceQueue = new UtteranceQueue(ariaLiveAnnouncer, {
      initialize: this._accessible,
      featureSpecificAnnouncingControlPropertyName: 'descriptionCanAnnounceProperty'
    });
    if (platform.safari && options.allowSafariRedrawWorkaround) {
      this.addOverlay(new SafariWorkaroundOverlay(this));
    }
    this.focusManager = new FocusManager();

    // Features that require the HighlightOverlay
    if (this._accessible || options.supportsInteractiveHighlights) {
      this._focusRootNode = new Node();
      this._focusOverlay = new HighlightOverlay(this, this._focusRootNode, {
        pdomFocusHighlightsVisibleProperty: this.focusManager.pdomFocusHighlightsVisibleProperty,
        interactiveHighlightsVisibleProperty: this.focusManager.interactiveHighlightsVisibleProperty,
        readingBlockHighlightsVisibleProperty: this.focusManager.readingBlockHighlightsVisibleProperty
      });
      this.addOverlay(this._focusOverlay);
    }
    if (this._accessible) {
      this._rootPDOMInstance = PDOMInstance.pool.create(null, this, new Trail());
      sceneryLog && sceneryLog.PDOMInstance && sceneryLog.PDOMInstance(`Display root instance: ${this._rootPDOMInstance.toString()}`);
      PDOMTree.rebuildInstanceTree(this._rootPDOMInstance);

      // add the accessible DOM as a child of this DOM element
      assert && assert(this._rootPDOMInstance.peer, 'Peer should be created from createFromPool');
      this._domElement.appendChild(this._rootPDOMInstance.peer.primarySibling);
      const ariaLiveContainer = ariaLiveAnnouncer.ariaLiveContainer;

      // add aria-live elements to the display
      this._domElement.appendChild(ariaLiveContainer);

      // set `user-select: none` on the aria-live container to prevent iOS text selection issue, see
      // https://github.com/phetsims/scenery/issues/1006
      ariaLiveContainer.style[Features.userSelect] = 'none';

      // Prevent focus from being lost in FullScreen mode, listener on the globalKeyStateTracker
      // because tab navigation may happen before focus is within the PDOM. See handleFullScreenNavigation
      // for more.
      this._boundHandleFullScreenNavigation = this.handleFullScreenNavigation.bind(this);
      globalKeyStateTracker.keydownEmitter.addListener(this._boundHandleFullScreenNavigation);
    }
  }
  getDOMElement() {
    return this._domElement;
  }
  get domElement() {
    return this.getDOMElement();
  }

  /**
   * Updates the display's DOM element with the current visual state of the attached root node and its descendants
   */
  updateDisplay() {
    // @ts-expect-error scenery namespace
    if (sceneryLog && scenery.isLoggingPerformance()) {
      this.perfSyncTreeCount = 0;
      this.perfStitchCount = 0;
      this.perfIntervalCount = 0;
      this.perfDrawableBlockChangeCount = 0;
      this.perfDrawableOldIntervalCount = 0;
      this.perfDrawableNewIntervalCount = 0;
    }
    if (assert) {
      Display.assertSubtreeDisposed(this._rootNode);
    }
    sceneryLog && sceneryLog.Display && sceneryLog.Display(`updateDisplay frame ${this._frameId}`);
    sceneryLog && sceneryLog.Display && sceneryLog.push();
    const firstRun = !!this._baseInstance;

    // check to see whether contents under pointers changed (and if so, send the enter/exit events) to
    // maintain consistent state
    if (this._input) {
      // TODO: Should this be handled elsewhere?
      this._input.validatePointers();
    }
    if (this._accessible) {
      // update positioning of focusable peer siblings so they are discoverable on mobile assistive devices
      this._rootPDOMInstance.peer.updateSubtreePositioning();
    }

    // validate bounds for everywhere that could trigger bounds listeners. we want to flush out any changes, so that we can call validateBounds()
    // from code below without triggering side effects (we assume that we are not reentrant).
    this._rootNode.validateWatchedBounds();
    if (assertSlow) {
      this._accessible && this._rootPDOMInstance.auditRoot();
    }
    if (assertSlow) {
      this._rootNode._picker.audit();
    }

    // @ts-expect-error TODO Instance
    this._baseInstance = this._baseInstance || Instance.createFromPool(this, new Trail(this._rootNode), true, false);
    this._baseInstance.baseSyncTree();
    if (firstRun) {
      // @ts-expect-error TODO instance
      this.markTransformRootDirty(this._baseInstance, this._baseInstance.isTransformed); // marks the transform root as dirty (since it is)
    }

    // update our drawable's linked lists where necessary
    while (this._drawablesToUpdateLinks.length) {
      this._drawablesToUpdateLinks.pop().updateLinks();
    }

    // clean change-interval information from instances, so we don't leak memory/references
    while (this._changeIntervalsToDispose.length) {
      this._changeIntervalsToDispose.pop().dispose();
    }
    this._rootBackbone = this._rootBackbone || this._baseInstance.groupDrawable;
    assert && assert(this._rootBackbone, 'We are guaranteed a root backbone as the groupDrawable on the base instance');
    assert && assert(this._rootBackbone === this._baseInstance.groupDrawable, 'We don\'t want the base instance\'s groupDrawable to change');
    if (assertSlow) {
      this._rootBackbone.audit(true, false, true);
    } // allow pending blocks / dirty

    sceneryLog && sceneryLog.Display && sceneryLog.Display('drawable block change phase');
    sceneryLog && sceneryLog.Display && sceneryLog.push();
    while (this._drawablesToChangeBlock.length) {
      const changed = this._drawablesToChangeBlock.pop().updateBlock();
      // @ts-expect-error scenery namespace
      if (sceneryLog && scenery.isLoggingPerformance() && changed) {
        this.perfDrawableBlockChangeCount++;
      }
    }
    sceneryLog && sceneryLog.Display && sceneryLog.pop();
    if (assertSlow) {
      this._rootBackbone.audit(false, false, true);
    } // allow only dirty
    if (assertSlow) {
      this._baseInstance.audit(this._frameId, false);
    }

    // pre-repaint phase: update relative transform information for listeners (notification) and precomputation where desired
    this.updateDirtyTransformRoots();
    // pre-repaint phase update visibility information on instances
    this._baseInstance.updateVisibility(true, true, true, false);
    if (assertSlow) {
      this._baseInstance.auditVisibility(true);
    }
    if (assertSlow) {
      this._baseInstance.audit(this._frameId, true);
    }
    sceneryLog && sceneryLog.Display && sceneryLog.Display('instance root disposal phase');
    sceneryLog && sceneryLog.Display && sceneryLog.push();
    // dispose all of our instances. disposing the root will cause all descendants to also be disposed.
    // will also dispose attached drawables (self/group/etc.)
    while (this._instanceRootsToDispose.length) {
      this._instanceRootsToDispose.pop().dispose();
    }
    sceneryLog && sceneryLog.Display && sceneryLog.pop();
    if (assertSlow) {
      this._rootNode.auditInstanceSubtreeForDisplay(this);
    } // make sure trails are valid

    sceneryLog && sceneryLog.Display && sceneryLog.Display('drawable disposal phase');
    sceneryLog && sceneryLog.Display && sceneryLog.push();
    // dispose all of our other drawables.
    while (this._drawablesToDispose.length) {
      this._drawablesToDispose.pop().dispose();
    }
    sceneryLog && sceneryLog.Display && sceneryLog.pop();
    if (assertSlow) {
      this._baseInstance.audit(this._frameId, false);
    }
    if (assert) {
      assert(!this._isPainting, 'Display was already updating paint, may have thrown an error on the last update');
      this._isPainting = true;
    }

    // repaint phase
    //OHTWO TODO: can anything be updated more efficiently by tracking at the Display level? Remember, we have recursive updates so things get updated in the right order!
    sceneryLog && sceneryLog.Display && sceneryLog.Display('repaint phase');
    sceneryLog && sceneryLog.Display && sceneryLog.push();
    this._rootBackbone.update();
    sceneryLog && sceneryLog.Display && sceneryLog.pop();
    if (assert) {
      this._isPainting = false;
    }
    if (assertSlow) {
      this._rootBackbone.audit(false, false, false);
    } // allow nothing
    if (assertSlow) {
      this._baseInstance.audit(this._frameId, false);
    }
    this.updateCursor();
    this.updateBackgroundColor();
    this.updateSize();
    if (this._overlays.length) {
      let zIndex = this._rootBackbone.lastZIndex;
      for (let i = 0; i < this._overlays.length; i++) {
        // layer the overlays properly
        const overlay = this._overlays[i];
        overlay.domElement.style.zIndex = '' + zIndex++;
        overlay.update();
      }
    }

    // After our update and disposals, we want to eliminate any memory leaks from anything that wasn't updated.
    while (this._reduceReferencesNeeded.length) {
      this._reduceReferencesNeeded.pop().reduceReferences();
    }
    this._frameId++;

    // @ts-expect-error TODO scenery namespace
    if (sceneryLog && scenery.isLoggingPerformance()) {
      const syncTreeMessage = `syncTree count: ${this.perfSyncTreeCount}`;
      if (this.perfSyncTreeCount > 500) {
        sceneryLog.PerfCritical && sceneryLog.PerfCritical(syncTreeMessage);
      } else if (this.perfSyncTreeCount > 100) {
        sceneryLog.PerfMajor && sceneryLog.PerfMajor(syncTreeMessage);
      } else if (this.perfSyncTreeCount > 20) {
        sceneryLog.PerfMinor && sceneryLog.PerfMinor(syncTreeMessage);
      } else if (this.perfSyncTreeCount > 0) {
        sceneryLog.PerfVerbose && sceneryLog.PerfVerbose(syncTreeMessage);
      }
      const drawableBlockCountMessage = `drawable block changes: ${this.perfDrawableBlockChangeCount} for` + ` -${this.perfDrawableOldIntervalCount} +${this.perfDrawableNewIntervalCount}`;
      if (this.perfDrawableBlockChangeCount > 200) {
        sceneryLog.PerfCritical && sceneryLog.PerfCritical(drawableBlockCountMessage);
      } else if (this.perfDrawableBlockChangeCount > 60) {
        sceneryLog.PerfMajor && sceneryLog.PerfMajor(drawableBlockCountMessage);
      } else if (this.perfDrawableBlockChangeCount > 10) {
        sceneryLog.PerfMinor && sceneryLog.PerfMinor(drawableBlockCountMessage);
      } else if (this.perfDrawableBlockChangeCount > 0) {
        sceneryLog.PerfVerbose && sceneryLog.PerfVerbose(drawableBlockCountMessage);
      }
    }
    PDOMTree.auditPDOMDisplays(this.rootNode);
    sceneryLog && sceneryLog.Display && sceneryLog.pop();
  }

  // Used for Studio Autoselect to determine the leafiest PhET-iO Element under the mouse
  getPhetioElementAt(point) {
    const node = this._rootNode.getPhetioMouseHit(point);
    return node && node.isPhetioInstrumented() ? node : null;
  }
  updateSize() {
    let sizeDirty = false;
    //OHTWO TODO: if we aren't clipping or setting background colors, can we get away with having a 0x0 container div and using absolutely-positioned children?
    if (this.size.width !== this._currentSize.width) {
      sizeDirty = true;
      this._currentSize.width = this.size.width;
      this._domElement.style.width = `${this.size.width}px`;
    }
    if (this.size.height !== this._currentSize.height) {
      sizeDirty = true;
      this._currentSize.height = this.size.height;
      this._domElement.style.height = `${this.size.height}px`;
    }
    if (sizeDirty && !this._allowSceneOverflow) {
      // to prevent overflow, we add a CSS clip
      //TODO: 0px => 0?
      this._domElement.style.clip = `rect(0px,${this.size.width}px,${this.size.height}px,0px)`;
    }
  }

  /**
   * Whether WebGL is allowed to be used in drawables for this Display
   */
  isWebGLAllowed() {
    return this._allowWebGL;
  }
  get webglAllowed() {
    return this.isWebGLAllowed();
  }
  getRootNode() {
    return this._rootNode;
  }
  get rootNode() {
    return this.getRootNode();
  }
  getRootBackbone() {
    assert && assert(this._rootBackbone);
    return this._rootBackbone;
  }
  get rootBackbone() {
    return this.getRootBackbone();
  }

  /**
   * The dimensions of the Display's DOM element
   */
  getSize() {
    return this.sizeProperty.value;
  }
  get size() {
    return this.getSize();
  }
  getBounds() {
    return this.size.toBounds();
  }
  get bounds() {
    return this.getBounds();
  }

  /**
   * Changes the size that the Display's DOM element will be after the next updateDisplay()
   */
  setSize(size) {
    assert && assert(size.width % 1 === 0, 'Display.width should be an integer');
    assert && assert(size.width > 0, 'Display.width should be greater than zero');
    assert && assert(size.height % 1 === 0, 'Display.height should be an integer');
    assert && assert(size.height > 0, 'Display.height should be greater than zero');
    this.sizeProperty.value = size;
  }

  /**
   * Changes the size that the Display's DOM element will be after the next updateDisplay()
   */
  setWidthHeight(width, height) {
    this.setSize(new Dimension2(width, height));
  }

  /**
   * The width of the Display's DOM element
   */
  getWidth() {
    return this.size.width;
  }
  get width() {
    return this.getWidth();
  }
  set width(value) {
    this.setWidth(value);
  }

  /**
   * Sets the width that the Display's DOM element will be after the next updateDisplay(). Should be an integral value.
   */
  setWidth(width) {
    if (this.getWidth() !== width) {
      this.setSize(new Dimension2(width, this.getHeight()));
    }
    return this;
  }

  /**
   * The height of the Display's DOM element
   */
  getHeight() {
    return this.size.height;
  }
  get height() {
    return this.getHeight();
  }
  set height(value) {
    this.setHeight(value);
  }

  /**
   * Sets the height that the Display's DOM element will be after the next updateDisplay(). Should be an integral value.
   */
  setHeight(height) {
    if (this.getHeight() !== height) {
      this.setSize(new Dimension2(this.getWidth(), height));
    }
    return this;
  }

  /**
   * Will be applied to the root DOM element on updateDisplay(), and no sooner.
   */
  setBackgroundColor(color) {
    assert && assert(color === null || typeof color === 'string' || color instanceof Color);
    this._backgroundColor = color;
    return this;
  }
  set backgroundColor(value) {
    this.setBackgroundColor(value);
  }
  get backgroundColor() {
    return this.getBackgroundColor();
  }
  getBackgroundColor() {
    return this._backgroundColor;
  }
  get interactive() {
    return this._interactive;
  }
  set interactive(value) {
    if (this._accessible && value !== this._interactive) {
      this._rootPDOMInstance.peer.recursiveDisable(!value);
    }
    this._interactive = value;
    if (!this._interactive && this._input) {
      this._input.interruptPointers();
      this._input.clearBatchedEvents();
      this._input.removeTemporaryPointers();
      this._rootNode.interruptSubtreeInput();
      this.interruptInput();
    }
  }

  /**
   * Adds an overlay to the Display. Each overlay should have a .domElement (the DOM element that will be used for
   * display) and an .update() method.
   */
  addOverlay(overlay) {
    this._overlays.push(overlay);
    this._domElement.appendChild(overlay.domElement);

    // ensure that the overlay is hidden from screen readers, all accessible content should be in the dom element
    // of the this._rootPDOMInstance
    overlay.domElement.setAttribute('aria-hidden', 'true');
  }

  /**
   * Removes an overlay from the display.
   */
  removeOverlay(overlay) {
    this._domElement.removeChild(overlay.domElement);
    this._overlays.splice(_.indexOf(this._overlays, overlay), 1);
  }

  /**
   * Get the root accessible DOM element which represents this display and provides semantics for assistive
   * technology. If this Display is not accessible, returns null.
   */
  getPDOMRootElement() {
    return this._accessible ? this._rootPDOMInstance.peer.primarySibling : null;
  }
  get pdomRootElement() {
    return this.getPDOMRootElement();
  }

  /**
   * Has this Display enabled accessibility features like PDOM creation and support.
   */
  isAccessible() {
    return this._accessible;
  }

  /**
   * Implements a workaround that prevents DOM focus from leaving the Display in FullScreen mode. There is
   * a bug in some browsers where DOM focus can be permanently lost if tabbing out of the FullScreen element,
   * see https://github.com/phetsims/scenery/issues/883.
   */
  handleFullScreenNavigation(domEvent) {
    assert && assert(this.pdomRootElement, 'There must be a PDOM to support keyboard navigation');
    if (FullScreen.isFullScreen() && KeyboardUtils.isKeyEvent(domEvent, KeyboardUtils.KEY_TAB)) {
      const rootElement = this.pdomRootElement;
      const nextElement = domEvent.shiftKey ? PDOMUtils.getPreviousFocusable(rootElement || undefined) : PDOMUtils.getNextFocusable(rootElement || undefined);
      if (nextElement === domEvent.target) {
        domEvent.preventDefault();
      }
    }
  }

  /**
   * Returns the bitmask union of all renderers (canvas/svg/dom/webgl) that are used for display, excluding
   * BackboneDrawables (which would be DOM).
   */
  getUsedRenderersBitmask() {
    function renderersUnderBackbone(backbone) {
      let bitmask = 0;
      _.each(backbone.blocks, block => {
        if (block instanceof DOMBlock && block.domDrawable instanceof BackboneDrawable) {
          bitmask = bitmask | renderersUnderBackbone(block.domDrawable);
        } else {
          bitmask = bitmask | block.renderer;
        }
      });
      return bitmask;
    }

    // only return the renderer-specific portion (no other hints, etc)
    return renderersUnderBackbone(this._rootBackbone) & Renderer.bitmaskRendererArea;
  }

  /**
   * Called from Instances that will need a transform update (for listeners and precomputation). (scenery-internal)
   *
   * @param instance
   * @param passTransform - Whether we should pass the first transform root when validating transforms (should
   * be true if the instance is transformed)
   */
  markTransformRootDirty(instance, passTransform) {
    passTransform ? this._dirtyTransformRoots.push(instance) : this._dirtyTransformRootsWithoutPass.push(instance);
  }
  updateDirtyTransformRoots() {
    sceneryLog && sceneryLog.transformSystem && sceneryLog.transformSystem('updateDirtyTransformRoots');
    sceneryLog && sceneryLog.transformSystem && sceneryLog.push();
    while (this._dirtyTransformRoots.length) {
      this._dirtyTransformRoots.pop().relativeTransform.updateTransformListenersAndCompute(false, false, this._frameId, true);
    }
    while (this._dirtyTransformRootsWithoutPass.length) {
      this._dirtyTransformRootsWithoutPass.pop().relativeTransform.updateTransformListenersAndCompute(false, false, this._frameId, false);
    }
    sceneryLog && sceneryLog.transformSystem && sceneryLog.pop();
  }

  /**
   * (scenery-internal)
   */
  markDrawableChangedBlock(drawable) {
    sceneryLog && sceneryLog.Display && sceneryLog.Display(`markDrawableChangedBlock: ${drawable.toString()}`);
    this._drawablesToChangeBlock.push(drawable);
  }

  /**
   * Marks an item for later reduceReferences() calls at the end of Display.update().
   * (scenery-internal)
   */
  markForReducedReferences(item) {
    assert && assert(!!item.reduceReferences);
    this._reduceReferencesNeeded.push(item);
  }

  /**
   * (scenery-internal)
   */
  markInstanceRootForDisposal(instance) {
    sceneryLog && sceneryLog.Display && sceneryLog.Display(`markInstanceRootForDisposal: ${instance.toString()}`);
    this._instanceRootsToDispose.push(instance);
  }

  /**
   * (scenery-internal)
   */
  markDrawableForDisposal(drawable) {
    sceneryLog && sceneryLog.Display && sceneryLog.Display(`markDrawableForDisposal: ${drawable.toString()}`);
    this._drawablesToDispose.push(drawable);
  }

  /**
   * (scenery-internal)
   */
  markDrawableForLinksUpdate(drawable) {
    this._drawablesToUpdateLinks.push(drawable);
  }

  /**
   * Add a {ChangeInterval} for the "remove change interval info" phase (we don't want to leak memory/references)
   * (scenery-internal)
   */
  markChangeIntervalToDispose(changeInterval) {
    this._changeIntervalsToDispose.push(changeInterval);
  }
  updateBackgroundColor() {
    assert && assert(this._backgroundColor === null || typeof this._backgroundColor === 'string' || this._backgroundColor instanceof Color);
    const newBackgroundCSS = this._backgroundColor === null ? '' : this._backgroundColor.toCSS ? this._backgroundColor.toCSS() : this._backgroundColor;
    if (newBackgroundCSS !== this._currentBackgroundCSS) {
      this._currentBackgroundCSS = newBackgroundCSS;
      this._domElement.style.backgroundColor = newBackgroundCSS;
    }
  }

  /*---------------------------------------------------------------------------*
   * Cursors
   *----------------------------------------------------------------------------*/

  updateCursor() {
    if (this._input && this._input.mouse && this._input.mouse.point) {
      if (this._input.mouse.cursor) {
        sceneryLog && sceneryLog.Cursor && sceneryLog.Cursor(`set on pointer: ${this._input.mouse.cursor}`);
        this.setSceneCursor(this._input.mouse.cursor);
        return;
      }

      //OHTWO TODO: For a display, just return an instance and we can avoid the garbage collection/mutation at the cost of the linked-list traversal instead of an array
      const mouseTrail = this._rootNode.trailUnderPointer(this._input.mouse);
      if (mouseTrail) {
        for (let i = mouseTrail.getCursorCheckIndex(); i >= 0; i--) {
          const node = mouseTrail.nodes[i];
          const cursor = node.getEffectiveCursor();
          if (cursor) {
            sceneryLog && sceneryLog.Cursor && sceneryLog.Cursor(`${cursor} on ${node.constructor.name}#${node.id}`);
            this.setSceneCursor(cursor);
            return;
          }
        }
      }
      sceneryLog && sceneryLog.Cursor && sceneryLog.Cursor(`--- for ${mouseTrail ? mouseTrail.toString() : '(no hit)'}`);
    }

    // fallback case
    this.setSceneCursor(this._defaultCursor);
  }

  /**
   * Sets the cursor to be displayed when over the Display.
   */
  setElementCursor(cursor) {
    this._domElement.style.cursor = cursor;

    // In some cases, Chrome doesn't seem to respect the cursor set on the Display's domElement. If we are using the
    // full window, we can apply the workaround of controlling the body's style.
    // See https://github.com/phetsims/scenery/issues/983
    if (this._assumeFullWindow) {
      document.body.style.cursor = cursor;
    }
  }
  setSceneCursor(cursor) {
    if (cursor !== this._lastCursor) {
      this._lastCursor = cursor;
      const customCursors = CUSTOM_CURSORS[cursor];
      if (customCursors) {
        // go backwards, so the most desired cursor sticks
        for (let i = customCursors.length - 1; i >= 0; i--) {
          this.setElementCursor(customCursors[i]);
        }
      } else {
        this.setElementCursor(cursor);
      }
    }
  }
  applyCSSHacks() {
    // to use CSS3 transforms for performance, hide anything outside our bounds by default
    if (!this._allowSceneOverflow) {
      this._domElement.style.overflow = 'hidden';
    }

    // forward all pointer events
    // @ts-expect-error legacy
    this._domElement.style.msTouchAction = 'none';

    // don't allow browser to switch between font smoothing methods for text (see https://github.com/phetsims/scenery/issues/431)
    Features.setStyle(this._domElement, Features.fontSmoothing, 'antialiased');
    if (this._allowCSSHacks) {
      // Prevents selection cursor issues in Safari, see https://github.com/phetsims/scenery/issues/476
      document.onselectstart = () => false;

      // prevent any default zooming behavior from a trackpad on IE11 and Edge, all should be handled by scenery - must
      // be on the body, doesn't prevent behavior if on the display div
      // @ts-expect-error legacy
      document.body.style.msContentZooming = 'none';

      // some css hacks (inspired from https://github.com/EightMedia/hammer.js/blob/master/hammer.js).
      // modified to only apply the proper prefixed version instead of spamming all of them, and doesn't use jQuery.
      Features.setStyle(this._domElement, Features.userDrag, 'none');
      Features.setStyle(this._domElement, Features.userSelect, 'none');
      Features.setStyle(this._domElement, Features.touchAction, 'none');
      Features.setStyle(this._domElement, Features.touchCallout, 'none');
      Features.setStyle(this._domElement, Features.tapHighlightColor, 'rgba(0,0,0,0)');
    }
  }
  canvasDataURL(callback) {
    this.canvasSnapshot(canvas => {
      callback(canvas.toDataURL());
    });
  }

  /**
   * Renders what it can into a Canvas (so far, Canvas and SVG layers work fine)
   */
  canvasSnapshot(callback) {
    const canvas = document.createElement('canvas');
    canvas.width = this.size.width;
    canvas.height = this.size.height;
    const context = canvas.getContext('2d');

    //OHTWO TODO: allow actual background color directly, not having to check the style here!!!
    this._rootNode.renderToCanvas(canvas, context, () => {
      callback(canvas, context.getImageData(0, 0, canvas.width, canvas.height));
    }, this.domElement.style.backgroundColor);
  }

  /**
   * TODO: reduce code duplication for handling overlays
   */
  setPointerDisplayVisible(visibility) {
    const hasOverlay = !!this._pointerOverlay;
    if (visibility !== hasOverlay) {
      if (!visibility) {
        this.removeOverlay(this._pointerOverlay);
        this._pointerOverlay.dispose();
        this._pointerOverlay = null;
      } else {
        this._pointerOverlay = new PointerOverlay(this, this._rootNode);
        this.addOverlay(this._pointerOverlay);
      }
    }
  }

  /**
   * TODO: reduce code duplication for handling overlays
   */
  setPointerAreaDisplayVisible(visibility) {
    const hasOverlay = !!this._pointerAreaOverlay;
    if (visibility !== hasOverlay) {
      if (!visibility) {
        this.removeOverlay(this._pointerAreaOverlay);
        this._pointerAreaOverlay.dispose();
        this._pointerAreaOverlay = null;
      } else {
        this._pointerAreaOverlay = new PointerAreaOverlay(this, this._rootNode);
        this.addOverlay(this._pointerAreaOverlay);
      }
    }
  }

  /**
   * TODO: reduce code duplication for handling overlays
   */
  setHitAreaDisplayVisible(visibility) {
    const hasOverlay = !!this._hitAreaOverlay;
    if (visibility !== hasOverlay) {
      if (!visibility) {
        this.removeOverlay(this._hitAreaOverlay);
        this._hitAreaOverlay.dispose();
        this._hitAreaOverlay = null;
      } else {
        this._hitAreaOverlay = new HitAreaOverlay(this, this._rootNode);
        this.addOverlay(this._hitAreaOverlay);
      }
    }
  }

  /**
   * TODO: reduce code duplication for handling overlays
   */
  setCanvasNodeBoundsVisible(visibility) {
    const hasOverlay = !!this._canvasAreaBoundsOverlay;
    if (visibility !== hasOverlay) {
      if (!visibility) {
        this.removeOverlay(this._canvasAreaBoundsOverlay);
        this._canvasAreaBoundsOverlay.dispose();
        this._canvasAreaBoundsOverlay = null;
      } else {
        this._canvasAreaBoundsOverlay = new CanvasNodeBoundsOverlay(this, this._rootNode);
        this.addOverlay(this._canvasAreaBoundsOverlay);
      }
    }
  }

  /**
   * TODO: reduce code duplication for handling overlays
   */
  setFittedBlockBoundsVisible(visibility) {
    const hasOverlay = !!this._fittedBlockBoundsOverlay;
    if (visibility !== hasOverlay) {
      if (!visibility) {
        this.removeOverlay(this._fittedBlockBoundsOverlay);
        this._fittedBlockBoundsOverlay.dispose();
        this._fittedBlockBoundsOverlay = null;
      } else {
        this._fittedBlockBoundsOverlay = new FittedBlockBoundsOverlay(this, this._rootNode);
        this.addOverlay(this._fittedBlockBoundsOverlay);
      }
    }
  }

  /**
   * Sets up the Display to resize to whatever the window inner dimensions will be.
   */
  resizeOnWindowResize() {
    const resizer = () => {
      this.setWidthHeight(window.innerWidth, window.innerHeight); // eslint-disable-line bad-sim-text
    };

    window.addEventListener('resize', resizer);
    resizer();
  }

  /**
   * Updates on every request animation frame. If stepCallback is passed in, it is called before updateDisplay() with
   * stepCallback( timeElapsedInSeconds )
   */
  updateOnRequestAnimationFrame(stepCallback) {
    // keep track of how much time elapsed over the last frame
    let lastTime = 0;
    let timeElapsedInSeconds = 0;
    const self = this; // eslint-disable-line @typescript-eslint/no-this-alias
    (function step() {
      // @ts-expect-error LEGACY --- it would know to update just the DOM element's location if it's the second argument
      self._requestAnimationFrameID = window.requestAnimationFrame(step, self._domElement);

      // calculate how much time has elapsed since we rendered the last frame
      const timeNow = Date.now();
      if (lastTime !== 0) {
        timeElapsedInSeconds = (timeNow - lastTime) / 1000.0;
      }
      lastTime = timeNow;

      // step the timer that drives any time dependent updates of the Display
      stepTimer.emit(timeElapsedInSeconds);
      stepCallback && stepCallback(timeElapsedInSeconds);
      self.updateDisplay();
    })();
  }
  cancelUpdateOnRequestAnimationFrame() {
    window.cancelAnimationFrame(this._requestAnimationFrameID);
  }

  /**
   * Initializes event handling, and connects the browser's input event handlers to notify this Display of events.
   *
   * NOTE: This can be reversed with detachEvents().
   */
  initializeEvents(options) {
    assert && assert(!this._input, 'Events cannot be attached twice to a display (for now)');

    // TODO: refactor here
    const input = new Input(this, !this._listenToOnlyElement, this._batchDOMEvents, this._assumeFullWindow, this._passiveEvents, options);
    this._input = input;
    input.connectListeners();
  }

  /**
   * Detach already-attached input event handling (from initializeEvents()).
   */
  detachEvents() {
    assert && assert(this._input, 'detachEvents() should be called only when events are attached');
    this._input.disconnectListeners();
    this._input = null;
  }

  /**
   * Adds an input listener.
   */
  addInputListener(listener) {
    assert && assert(!_.includes(this._inputListeners, listener), 'Input listener already registered on this Display');

    // don't allow listeners to be added multiple times
    if (!_.includes(this._inputListeners, listener)) {
      this._inputListeners.push(listener);
    }
    return this;
  }

  /**
   * Removes an input listener that was previously added with addInputListener.
   */
  removeInputListener(listener) {
    // ensure the listener is in our list
    assert && assert(_.includes(this._inputListeners, listener));
    this._inputListeners.splice(_.indexOf(this._inputListeners, listener), 1);
    return this;
  }

  /**
   * Returns whether this input listener is currently listening to this Display.
   *
   * More efficient than checking display.inputListeners, as that includes a defensive copy.
   */
  hasInputListener(listener) {
    for (let i = 0; i < this._inputListeners.length; i++) {
      if (this._inputListeners[i] === listener) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns a copy of all of our input listeners.
   */
  getInputListeners() {
    return this._inputListeners.slice(0); // defensive copy
  }

  get inputListeners() {
    return this.getInputListeners();
  }

  /**
   * Interrupts all input listeners that are attached to this Display.
   */
  interruptInput() {
    const listenersCopy = this.inputListeners;
    for (let i = 0; i < listenersCopy.length; i++) {
      const listener = listenersCopy[i];
      listener.interrupt && listener.interrupt();
    }
    return this;
  }

  /**
   * (scenery-internal)
   */
  ensureNotPainting() {
    assert && assert(!this._isPainting, 'This should not be run in the call tree of updateDisplay(). If you see this, it is likely that either the ' + 'last updateDisplay() had a thrown error and it is trying to be run again (in which case, investigate that ' + 'error), OR code was run/triggered from inside an updateDisplay() that has the potential to cause an infinite ' + 'loop, e.g. CanvasNode paintCanvas() call manipulating another Node, or a bounds listener that Scenery missed.');
  }

  /**
   * Triggers a loss of context for all WebGL blocks.
   *
   * NOTE: Should generally only be used for debugging.
   */
  loseWebGLContexts() {
    (function loseBackbone(backbone) {
      if (backbone.blocks) {
        backbone.blocks.forEach(block => {
          const gl = block.gl;
          if (gl) {
            Utils.loseContext(gl);
          }

          //TODO: pattern for this iteration
          for (let drawable = block.firstDrawable; drawable !== null; drawable = drawable.nextDrawable) {
            loseBackbone(drawable);
            if (drawable === block.lastDrawable) {
              break;
            }
          }
        });
      }
    })(this._rootBackbone);
  }

  /**
   * Makes this Display available for inspection.
   */
  inspect() {
    localStorage.scenerySnapshot = JSON.stringify(scenerySerialize(this));
  }

  /**
   * Returns an HTML fragment that includes a large amount of debugging information, including a view of the
   * instance tree and drawable tree.
   */
  getDebugHTML() {
    const headerStyle = 'font-weight: bold; font-size: 120%; margin-top: 5px;';
    let depth = 0;
    let result = '';
    result += `<div style="${headerStyle}">Display (${this.id}) Summary</div>`;
    result += `${this.size.toString()} frame:${this._frameId} input:${!!this._input} cursor:${this._lastCursor}<br/>`;
    function nodeCount(node) {
      let count = 1; // for us
      for (let i = 0; i < node.children.length; i++) {
        count += nodeCount(node.children[i]);
      }
      return count;
    }
    result += `Nodes: ${nodeCount(this._rootNode)}<br/>`;
    function instanceCount(instance) {
      let count = 1; // for us
      for (let i = 0; i < instance.children.length; i++) {
        count += instanceCount(instance.children[i]);
      }
      return count;
    }
    result += this._baseInstance ? `Instances: ${instanceCount(this._baseInstance)}<br/>` : '';
    function drawableCount(drawable) {
      let count = 1; // for us
      if (drawable.blocks) {
        // we're a backbone
        _.each(drawable.blocks, childDrawable => {
          count += drawableCount(childDrawable);
        });
      } else if (drawable.firstDrawable && drawable.lastDrawable) {
        // we're a block
        for (let childDrawable = drawable.firstDrawable; childDrawable !== drawable.lastDrawable; childDrawable = childDrawable.nextDrawable) {
          count += drawableCount(childDrawable);
        }
        count += drawableCount(drawable.lastDrawable);
      }
      return count;
    }

    // @ts-expect-error TODO BackboneDrawable
    result += this._rootBackbone ? `Drawables: ${drawableCount(this._rootBackbone)}<br/>` : '';
    const drawableCountMap = {}; // {string} drawable constructor name => {number} count of seen
    // increment the count in our map
    function countRetainedDrawable(drawable) {
      const name = drawable.constructor.name;
      if (drawableCountMap[name]) {
        drawableCountMap[name]++;
      } else {
        drawableCountMap[name] = 1;
      }
    }
    function retainedDrawableCount(instance) {
      let count = 0;
      if (instance.selfDrawable) {
        countRetainedDrawable(instance.selfDrawable);
        count++;
      }
      if (instance.groupDrawable) {
        countRetainedDrawable(instance.groupDrawable);
        count++;
      }
      if (instance.sharedCacheDrawable) {
        // @ts-expect-error TODO Instance
        countRetainedDrawable(instance.sharedCacheDrawable);
        count++;
      }
      for (let i = 0; i < instance.children.length; i++) {
        count += retainedDrawableCount(instance.children[i]);
      }
      return count;
    }
    result += this._baseInstance ? `Retained Drawables: ${retainedDrawableCount(this._baseInstance)}<br/>` : '';
    for (const drawableName in drawableCountMap) {
      result += `&nbsp;&nbsp;&nbsp;&nbsp;${drawableName}: ${drawableCountMap[drawableName]}<br/>`;
    }
    function blockSummary(block) {
      // ensure we are a block
      if (!block.firstDrawable || !block.lastDrawable) {
        return '';
      }

      // @ts-expect-error TODO display stuff
      const hasBackbone = block.domDrawable && block.domDrawable.blocks;
      let div = `<div style="margin-left: ${depth * 20}px">`;
      div += block.toString();
      if (!hasBackbone) {
        div += ` (${block.drawableCount} drawables)`;
      }
      div += '</div>';
      depth += 1;
      if (hasBackbone) {
        // @ts-expect-error TODO display stuff
        for (let k = 0; k < block.domDrawable.blocks.length; k++) {
          // @ts-expect-error TODO display stuff
          div += blockSummary(block.domDrawable.blocks[k]);
        }
      }
      depth -= 1;
      return div;
    }
    if (this._rootBackbone) {
      result += `<div style="${headerStyle}">Block Summary</div>`;
      for (let i = 0; i < this._rootBackbone.blocks.length; i++) {
        result += blockSummary(this._rootBackbone.blocks[i]);
      }
    }
    function instanceSummary(instance) {
      let iSummary = '';
      function addQualifier(text) {
        iSummary += ` <span style="color: #008">${text}</span>`;
      }
      const node = instance.node;
      iSummary += instance.id;
      iSummary += ` ${node.constructor.name ? node.constructor.name : '?'}`;
      iSummary += ` <span style="font-weight: ${node.isPainted() ? 'bold' : 'normal'}">${node.id}</span>`;
      iSummary += node.getDebugHTMLExtras();
      if (!node.visible) {
        addQualifier('invis');
      }
      if (!instance.visible) {
        addQualifier('I-invis');
      }
      if (!instance.relativeVisible) {
        addQualifier('I-rel-invis');
      }
      if (!instance.selfVisible) {
        addQualifier('I-self-invis');
      }
      if (!instance.fittability.ancestorsFittable) {
        addQualifier('nofit-ancestor');
      }
      if (!instance.fittability.selfFittable) {
        addQualifier('nofit-self');
      }
      if (node.pickable === true) {
        addQualifier('pickable');
      }
      if (node.pickable === false) {
        addQualifier('unpickable');
      }
      if (instance.trail.isPickable()) {
        addQualifier('<span style="color: #808">hits</span>');
      }
      if (node.getEffectiveCursor()) {
        addQualifier(`effectiveCursor:${node.getEffectiveCursor()}`);
      }
      if (node.clipArea) {
        addQualifier('clipArea');
      }
      if (node.mouseArea) {
        addQualifier('mouseArea');
      }
      if (node.touchArea) {
        addQualifier('touchArea');
      }
      if (node.getInputListeners().length) {
        addQualifier('inputListeners');
      }
      if (node.getRenderer()) {
        addQualifier(`renderer:${node.getRenderer()}`);
      }
      if (node.isLayerSplit()) {
        addQualifier('layerSplit');
      }
      if (node.opacity < 1) {
        addQualifier(`opacity:${node.opacity}`);
      }
      if (node.disabledOpacity < 1) {
        addQualifier(`disabledOpacity:${node.disabledOpacity}`);
      }
      if (node._boundsEventCount > 0) {
        addQualifier(`<span style="color: #800">boundsListen:${node._boundsEventCount}:${node._boundsEventSelfCount}</span>`);
      }
      let transformType = '';
      switch (node.transform.getMatrix().type) {
        case Matrix3Type.IDENTITY:
          transformType = '';
          break;
        case Matrix3Type.TRANSLATION_2D:
          transformType = 'translated';
          break;
        case Matrix3Type.SCALING:
          transformType = 'scale';
          break;
        case Matrix3Type.AFFINE:
          transformType = 'affine';
          break;
        case Matrix3Type.OTHER:
          transformType = 'other';
          break;
        default:
          throw new Error(`invalid matrix type: ${node.transform.getMatrix().type}`);
      }
      if (transformType) {
        iSummary += ` <span style="color: #88f" title="${node.transform.getMatrix().toString().replace('\n', '&#10;')}">${transformType}</span>`;
      }
      iSummary += ` <span style="color: #888">[Trail ${instance.trail.indices.join('.')}]</span>`;
      // iSummary += ` <span style="color: #c88">${str( instance.state )}</span>`;
      iSummary += ` <span style="color: #8c8">${node._rendererSummary.bitmask.toString(16)}${node._rendererBitmask !== Renderer.bitmaskNodeDefault ? ` (${node._rendererBitmask.toString(16)})` : ''}</span>`;
      return iSummary;
    }
    function drawableSummary(drawable) {
      let drawableString = drawable.toString();
      if (drawable.visible) {
        drawableString = `<strong>${drawableString}</strong>`;
      }
      if (drawable.dirty) {
        drawableString += drawable.dirty ? ' <span style="color: #c00;">[x]</span>' : '';
      }
      if (!drawable.fittable) {
        drawableString += drawable.dirty ? ' <span style="color: #0c0;">[no-fit]</span>' : '';
      }
      return drawableString;
    }
    function printInstanceSubtree(instance) {
      let div = `<div style="margin-left: ${depth * 20}px">`;
      function addDrawable(name, drawable) {
        div += ` <span style="color: #888">${name}:${drawableSummary(drawable)}</span>`;
      }
      div += instanceSummary(instance);
      instance.selfDrawable && addDrawable('self', instance.selfDrawable);
      instance.groupDrawable && addDrawable('group', instance.groupDrawable);
      // @ts-expect-error TODO Instance
      instance.sharedCacheDrawable && addDrawable('sharedCache', instance.sharedCacheDrawable);
      div += '</div>';
      result += div;
      depth += 1;
      _.each(instance.children, childInstance => {
        printInstanceSubtree(childInstance);
      });
      depth -= 1;
    }
    if (this._baseInstance) {
      result += `<div style="${headerStyle}">Root Instance Tree</div>`;
      printInstanceSubtree(this._baseInstance);
    }
    _.each(this._sharedCanvasInstances, instance => {
      result += `<div style="${headerStyle}">Shared Canvas Instance Tree</div>`;
      printInstanceSubtree(instance);
    });
    function printDrawableSubtree(drawable) {
      let div = `<div style="margin-left: ${depth * 20}px">`;
      div += drawableSummary(drawable);
      if (drawable.instance) {
        div += ` <span style="color: #0a0;">(${drawable.instance.trail.toPathString()})</span>`;
        div += `&nbsp;&nbsp;&nbsp;${instanceSummary(drawable.instance)}`;
      } else if (drawable.backboneInstance) {
        div += ` <span style="color: #a00;">(${drawable.backboneInstance.trail.toPathString()})</span>`;
        div += `&nbsp;&nbsp;&nbsp;${instanceSummary(drawable.backboneInstance)}`;
      }
      div += '</div>';
      result += div;
      if (drawable.blocks) {
        // we're a backbone
        depth += 1;
        _.each(drawable.blocks, childDrawable => {
          printDrawableSubtree(childDrawable);
        });
        depth -= 1;
      } else if (drawable.firstDrawable && drawable.lastDrawable) {
        // we're a block
        depth += 1;
        for (let childDrawable = drawable.firstDrawable; childDrawable !== drawable.lastDrawable; childDrawable = childDrawable.nextDrawable) {
          printDrawableSubtree(childDrawable);
        }
        printDrawableSubtree(drawable.lastDrawable); // wasn't hit in our simplified (and safer) loop
        depth -= 1;
      }
    }
    if (this._rootBackbone) {
      result += '<div style="font-weight: bold;">Root Drawable Tree</div>';
      // @ts-expect-error TODO BackboneDrawable
      printDrawableSubtree(this._rootBackbone);
    }

    //OHTWO TODO: add shared cache drawable trees

    return result;
  }

  /**
   * Returns the getDebugHTML() information, but wrapped into a full HTML page included in a data URI.
   */
  getDebugURI() {
    return `data:text/html;charset=utf-8,${encodeURIComponent(`${'<!DOCTYPE html>' + '<html lang="en">' + '<head><title>Scenery Debug Snapshot</title></head>' + '<body style="font-size: 12px;">'}${this.getDebugHTML()}</body>` + '</html>')}`;
  }

  /**
   * Attempts to open a popup with the getDebugHTML() information.
   */
  popupDebug() {
    window.open(this.getDebugURI());
  }

  /**
   * Attempts to open an iframe popup with the getDebugHTML() information in the same window. This is similar to
   * popupDebug(), but should work in browsers that block popups, or prevent that type of data URI being opened.
   */
  iframeDebug() {
    const iframe = document.createElement('iframe');
    iframe.width = '' + window.innerWidth; // eslint-disable-line bad-sim-text
    iframe.height = '' + window.innerHeight; // eslint-disable-line bad-sim-text
    iframe.style.position = 'absolute';
    iframe.style.left = '0';
    iframe.style.top = '0';
    iframe.style.zIndex = '10000';
    document.body.appendChild(iframe);
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(this.getDebugHTML());
    iframe.contentWindow.document.close();
    iframe.contentWindow.document.body.style.background = 'white';
    const closeButton = document.createElement('button');
    closeButton.style.position = 'absolute';
    closeButton.style.top = '0';
    closeButton.style.right = '0';
    closeButton.style.zIndex = '10001';
    document.body.appendChild(closeButton);
    closeButton.textContent = 'close';

    // A normal 'click' event listener doesn't seem to be working. This is less-than-ideal.
    ['pointerdown', 'click', 'touchdown'].forEach(eventType => {
      closeButton.addEventListener(eventType, () => {
        document.body.removeChild(iframe);
        document.body.removeChild(closeButton);
      }, true);
    });
  }
  getPDOMDebugHTML() {
    let result = '';
    const headerStyle = 'font-weight: bold; font-size: 120%; margin-top: 5px;';
    const indent = '&nbsp;&nbsp;&nbsp;&nbsp;';
    result += `<div style="${headerStyle}">Accessible Instances</div><br>`;
    recurse(this._rootPDOMInstance, '');
    function recurse(instance, indentation) {
      result += `${indentation + escapeHTML(`${instance.isRootInstance ? '' : instance.node.tagName} ${instance.toString()}`)}<br>`;
      instance.children.forEach(child => {
        recurse(child, indentation + indent);
      });
    }
    result += `<br><div style="${headerStyle}">Parallel DOM</div><br>`;
    let parallelDOM = this._rootPDOMInstance.peer.primarySibling.outerHTML;
    parallelDOM = parallelDOM.replace(/></g, '>\n<');
    const lines = parallelDOM.split('\n');
    let indentation = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isEndTag = line.startsWith('</');
      if (isEndTag) {
        indentation = indentation.slice(indent.length);
      }
      result += `${indentation + escapeHTML(line)}<br>`;
      if (!isEndTag) {
        indentation += indent;
      }
    }
    return result;
  }

  /**
   * Will attempt to call callback( {string} dataURI ) with the rasterization of the entire Display's DOM structure,
   * used for internal testing. Will call-back null if there was an error
   *
   * Only tested on recent Chrome and Firefox, not recommended for general use. Guaranteed not to work for IE <= 10.
   *
   * See https://github.com/phetsims/scenery/issues/394 for some details.
   */
  foreignObjectRasterization(callback) {
    // Scan our drawable tree for Canvases. We'll rasterize them here (to data URLs) so we can replace them later in
    // the HTML tree (with images) before putting that in the foreignObject. That way, we can actually display
    // things rendered in Canvas in our rasterization.
    const canvasUrlMap = {};
    let unknownIds = 0;
    function addCanvas(canvas) {
      if (!canvas.id) {
        canvas.id = `unknown-canvas-${unknownIds++}`;
      }
      canvasUrlMap[canvas.id] = canvas.toDataURL();
    }
    function scanForCanvases(drawable) {
      if (drawable instanceof BackboneDrawable) {
        // we're a backbone
        _.each(drawable.blocks, childDrawable => {
          scanForCanvases(childDrawable);
        });
      } else if (drawable instanceof Block && drawable.firstDrawable && drawable.lastDrawable) {
        // we're a block
        for (let childDrawable = drawable.firstDrawable; childDrawable !== drawable.lastDrawable; childDrawable = childDrawable.nextDrawable) {
          scanForCanvases(childDrawable);
        }
        scanForCanvases(drawable.lastDrawable); // wasn't hit in our simplified (and safer) loop

        if ((drawable instanceof CanvasBlock || drawable instanceof WebGLBlock) && drawable.canvas && drawable.canvas instanceof window.HTMLCanvasElement) {
          addCanvas(drawable.canvas);
        }
      }
      if (DOMDrawable && drawable instanceof DOMDrawable) {
        if (drawable.domElement instanceof window.HTMLCanvasElement) {
          addCanvas(drawable.domElement);
        }
        Array.prototype.forEach.call(drawable.domElement.getElementsByTagName('canvas'), canvas => {
          addCanvas(canvas);
        });
      }
    }

    // @ts-expect-error TODO BackboneDrawable
    scanForCanvases(this._rootBackbone);

    // Create a new document, so that we can (1) serialize it to XHTML, and (2) manipulate it independently.
    // Inspired by http://cburgmer.github.io/rasterizeHTML.js/
    const doc = document.implementation.createHTMLDocument('');
    doc.documentElement.innerHTML = this.domElement.outerHTML;
    doc.documentElement.setAttribute('xmlns', doc.documentElement.namespaceURI);

    // Hide the PDOM
    doc.documentElement.appendChild(document.createElement('style')).innerHTML = `.${PDOMSiblingStyle.ROOT_CLASS_NAME} { display:none; } `;

    // Replace each <canvas> with an <img> that has src=canvas.toDataURL() and the same style
    let displayCanvases = doc.documentElement.getElementsByTagName('canvas');
    displayCanvases = Array.prototype.slice.call(displayCanvases); // don't use a live HTMLCollection copy!
    for (let i = 0; i < displayCanvases.length; i++) {
      const displayCanvas = displayCanvases[i];
      const cssText = displayCanvas.style.cssText;
      const displayImg = doc.createElement('img');
      const src = canvasUrlMap[displayCanvas.id];
      assert && assert(src, 'Must have missed a toDataURL() on a Canvas');
      displayImg.src = src;
      displayImg.setAttribute('style', cssText);
      displayCanvas.parentNode.replaceChild(displayImg, displayCanvas);
    }
    const displayWidth = this.width;
    const displayHeight = this.height;
    const completeFunction = () => {
      Display.elementToSVGDataURL(doc.documentElement, displayWidth, displayHeight, callback);
    };

    // Convert each <image>'s xlink:href so that it's a data URL with the relevant data, e.g.
    // <image ... xlink:href="http://localhost:8080/scenery-phet/images/batteryDCell.png?bust=1476308407988"/>
    // gets replaced with a data URL.
    // See https://github.com/phetsims/scenery/issues/573
    let replacedImages = 0; // Count how many images get replaced. We'll decrement with each finished image.
    let hasReplacedImages = false; // Whether any images are replaced
    const displaySVGImages = Array.prototype.slice.call(doc.documentElement.getElementsByTagName('image'));
    for (let j = 0; j < displaySVGImages.length; j++) {
      const displaySVGImage = displaySVGImages[j];
      const currentHref = displaySVGImage.getAttribute('xlink:href');
      if (currentHref.slice(0, 5) !== 'data:') {
        replacedImages++;
        hasReplacedImages = true;
        (() => {
          // eslint-disable-line @typescript-eslint/no-loop-func
          // Closure variables need to be stored for each individual SVG image.
          const refImage = new window.Image();
          const svgImage = displaySVGImage;
          refImage.onload = () => {
            // Get a Canvas
            const refCanvas = document.createElement('canvas');
            refCanvas.width = refImage.width;
            refCanvas.height = refImage.height;
            const refContext = refCanvas.getContext('2d');

            // Draw the (now loaded) image into the Canvas
            refContext.drawImage(refImage, 0, 0);

            // Replace the <image>'s href with the Canvas' data.
            svgImage.setAttribute('xlink:href', refCanvas.toDataURL());

            // If it's the last replaced image, go to the next step
            if (--replacedImages === 0) {
              completeFunction();
            }
            assert && assert(replacedImages >= 0);
          };
          refImage.onerror = () => {
            // NOTE: not much we can do, leave this element alone.

            // If it's the last replaced image, go to the next step
            if (--replacedImages === 0) {
              completeFunction();
            }
            assert && assert(replacedImages >= 0);
          };

          // Kick off loading of the image.
          refImage.src = currentHref;
        })();
      }
    }

    // If no images are replaced, we need to call our callback through this route.
    if (!hasReplacedImages) {
      completeFunction();
    }
  }
  popupRasterization() {
    this.foreignObjectRasterization(url => {
      if (url) {
        window.open(url);
      }
    });
  }

  /**
   * Will return null if the string of indices isn't part of the PDOMInstance tree
   */
  getTrailFromPDOMIndicesString(indicesString) {
    // No PDOMInstance tree if the display isn't accessible
    if (!this._rootPDOMInstance) {
      return null;
    }
    let instance = this._rootPDOMInstance;
    const indexStrings = indicesString.split(PDOMUtils.PDOM_UNIQUE_ID_SEPARATOR);
    for (let i = 0; i < indexStrings.length; i++) {
      const digit = Number(indexStrings[i]);
      instance = instance.children[digit];
      if (!instance) {
        return null;
      }
    }
    return instance && instance.trail ? instance.trail : null;
  }

  /**
   * Releases references.
   *
   * TODO: this dispose function is not complete.
   */
  dispose() {
    if (assert) {
      assert(!this._isDisposing);
      assert(!this._isDisposed);
      this._isDisposing = true;
    }
    if (this._input) {
      this.detachEvents();
    }
    this._rootNode.removeRootedDisplay(this);
    if (this._accessible) {
      assert && assert(this._boundHandleFullScreenNavigation, '_boundHandleFullScreenNavigation was not added to the keyStateTracker');
      globalKeyStateTracker.keydownEmitter.removeListener(this._boundHandleFullScreenNavigation);
      this._rootPDOMInstance.dispose();
    }
    this._focusOverlay && this._focusOverlay.dispose();
    this.sizeProperty.dispose();

    // Will immediately dispose recursively, all Instances AND their attached drawables, which will include the
    // rootBackbone.
    this._baseInstance && this._baseInstance.dispose();
    this.descriptionUtteranceQueue.dispose();
    this.focusManager && this.focusManager.dispose();
    if (assert) {
      this._isDisposing = false;
      this._isDisposed = true;
    }
  }

  /**
   * Takes a given DOM element, and asynchronously renders it to a string that is a data URL representing an SVG
   * file.
   *
   * @param domElement
   * @param width - The width of the output SVG
   * @param height - The height of the output SVG
   * @param callback - Called as callback( url: {string} ), where the URL will be the encoded SVG file.
   */
  static elementToSVGDataURL(domElement, width, height, callback) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    // Serialize it to XHTML that can be used in foreignObject (HTML can't be)
    const xhtml = new window.XMLSerializer().serializeToString(domElement);

    // Create an SVG container with a foreignObject.
    const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` + '<foreignObject width="100%" height="100%">' + `<div xmlns="http://www.w3.org/1999/xhtml">${xhtml}</div>` + '</foreignObject>' + '</svg>';

    // Load an <img> with the SVG data URL, and when loaded draw it into our Canvas
    const img = new window.Image();
    img.onload = () => {
      context.drawImage(img, 0, 0);
      callback(canvas.toDataURL()); // Endpoint here
    };

    img.onerror = () => {
      callback(null);
    };

    // We can't btoa() arbitrary unicode, so we need another solution,
    // see https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_.22Unicode_Problem.22
    // @ts-expect-error - Exterior lib
    const uint8array = new window.TextEncoderLite('utf-8').encode(data);
    // @ts-expect-error - Exterior lib
    const base64 = window.fromByteArray(uint8array);

    // turn it to base64 and wrap it in the data URL format
    img.src = `data:image/svg+xml;base64,${base64}`;
  }

  /**
   * Returns true when NO nodes in the subtree are disposed.
   */
  static assertSubtreeDisposed(node) {
    assert && assert(!node.isDisposed, 'Disposed nodes should not be included in a scene graph to display.');
    if (assert) {
      for (let i = 0; i < node.children.length; i++) {
        Display.assertSubtreeDisposed(node.children[i]);
      }
    }
  }

  /**
   * Adds an input listener to be fired for ANY Display
   */
  static addInputListener(listener) {
    assert && assert(!_.includes(Display.inputListeners, listener), 'Input listener already registered');

    // don't allow listeners to be added multiple times
    if (!_.includes(Display.inputListeners, listener)) {
      Display.inputListeners.push(listener);
    }
  }

  /**
   * Removes an input listener that was previously added with Display.addInputListener.
   */
  static removeInputListener(listener) {
    // ensure the listener is in our list
    assert && assert(_.includes(Display.inputListeners, listener));
    Display.inputListeners.splice(_.indexOf(Display.inputListeners, listener), 1);
  }

  /**
   * Interrupts all input listeners that are attached to all Displays.
   */
  static interruptInput() {
    const listenersCopy = Display.inputListeners.slice(0);
    for (let i = 0; i < listenersCopy.length; i++) {
      const listener = listenersCopy[i];
      listener.interrupt && listener.interrupt();
    }
  }

  // Fires when we detect an input event that would be considered a "user gesture" by Chrome, so
  // that we can trigger browser actions that are only allowed as a result.
  // See https://github.com/phetsims/scenery/issues/802 and https://github.com/phetsims/vibe/issues/32 for more
  // information.
  // Listeners that will be called for every event on ANY Display, see
  // https://github.com/phetsims/scenery/issues/1149. Do not directly modify this!
}
scenery.register('Display', Display);
Display.userGestureEmitter = new Emitter();
Display.inputListeners = [];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwic3RlcFRpbWVyIiwiVGlueVByb3BlcnR5IiwiRGltZW5zaW9uMiIsIk1hdHJpeDNUeXBlIiwiZXNjYXBlSFRNTCIsIm9wdGlvbml6ZSIsInBsYXRmb3JtIiwiVGFuZGVtIiwiQXJpYUxpdmVBbm5vdW5jZXIiLCJVdHRlcmFuY2VRdWV1ZSIsIkJhY2tib25lRHJhd2FibGUiLCJCbG9jayIsIkNhbnZhc0Jsb2NrIiwiQ2FudmFzTm9kZUJvdW5kc092ZXJsYXkiLCJDb2xvciIsIkRPTUJsb2NrIiwiRE9NRHJhd2FibGUiLCJGZWF0dXJlcyIsIkZpdHRlZEJsb2NrQm91bmRzT3ZlcmxheSIsIkZvY3VzTWFuYWdlciIsIkZ1bGxTY3JlZW4iLCJnbG9iYWxLZXlTdGF0ZVRyYWNrZXIiLCJIaWdobGlnaHRPdmVybGF5IiwiSGl0QXJlYU92ZXJsYXkiLCJJbnB1dCIsIkluc3RhbmNlIiwiS2V5Ym9hcmRVdGlscyIsIk5vZGUiLCJQRE9NSW5zdGFuY2UiLCJQRE9NU2libGluZ1N0eWxlIiwiUERPTVRyZWUiLCJQRE9NVXRpbHMiLCJQb2ludGVyQXJlYU92ZXJsYXkiLCJQb2ludGVyT3ZlcmxheSIsIlJlbmRlcmVyIiwic2NlbmVyeSIsInNjZW5lcnlTZXJpYWxpemUiLCJUcmFpbCIsIlV0aWxzIiwiV2ViR0xCbG9jayIsIlNhZmFyaVdvcmthcm91bmRPdmVybGF5IiwiQ1VTVE9NX0NVUlNPUlMiLCJnbG9iYWxJZENvdW50ZXIiLCJEaXNwbGF5IiwiY29uc3RydWN0b3IiLCJyb290Tm9kZSIsInByb3ZpZGVkT3B0aW9ucyIsImFzc2VydCIsIm9wdGlvbnMiLCJ3aWR0aCIsImNvbnRhaW5lciIsImNsaWVudFdpZHRoIiwiaGVpZ2h0IiwiY2xpZW50SGVpZ2h0IiwiYWxsb3dDU1NIYWNrcyIsImFsbG93U2FmYXJpUmVkcmF3V29ya2Fyb3VuZCIsImFsbG93U2NlbmVPdmVyZmxvdyIsImRlZmF1bHRDdXJzb3IiLCJiYWNrZ3JvdW5kQ29sb3IiLCJwcmVzZXJ2ZURyYXdpbmdCdWZmZXIiLCJhbGxvd1dlYkdMIiwiYWNjZXNzaWJpbGl0eSIsInN1cHBvcnRzSW50ZXJhY3RpdmVIaWdobGlnaHRzIiwiaW50ZXJhY3RpdmUiLCJsaXN0ZW5Ub09ubHlFbGVtZW50IiwiYmF0Y2hET01FdmVudHMiLCJhc3N1bWVGdWxsV2luZG93IiwiYWdncmVzc2l2ZUNvbnRleHRSZWNyZWF0aW9uIiwicGFzc2l2ZUV2ZW50cyIsInNhZmFyaSIsImFsbG93QmFja2luZ1NjYWxlQW50aWFsaWFzaW5nIiwidGFuZGVtIiwiT1BUSU9OQUwiLCJpZCIsIl9hY2Nlc3NpYmxlIiwiX3ByZXNlcnZlRHJhd2luZ0J1ZmZlciIsIl9hbGxvd1dlYkdMIiwiX2FsbG93Q1NTSGFja3MiLCJfYWxsb3dTY2VuZU92ZXJmbG93IiwiX2RlZmF1bHRDdXJzb3IiLCJzaXplUHJvcGVydHkiLCJfY3VycmVudFNpemUiLCJfcm9vdE5vZGUiLCJhZGRSb290ZWREaXNwbGF5IiwiX3Jvb3RCYWNrYm9uZSIsIl9kb21FbGVtZW50IiwicmVwdXJwb3NlQmFja2JvbmVDb250YWluZXIiLCJjcmVhdGVEaXZCYWNrYm9uZSIsIl9zaGFyZWRDYW52YXNJbnN0YW5jZXMiLCJfYmFzZUluc3RhbmNlIiwiX2ZyYW1lSWQiLCJfZGlydHlUcmFuc2Zvcm1Sb290cyIsIl9kaXJ0eVRyYW5zZm9ybVJvb3RzV2l0aG91dFBhc3MiLCJfaW5zdGFuY2VSb290c1RvRGlzcG9zZSIsIl9yZWR1Y2VSZWZlcmVuY2VzTmVlZGVkIiwiX2RyYXdhYmxlc1RvRGlzcG9zZSIsIl9kcmF3YWJsZXNUb0NoYW5nZUJsb2NrIiwiX2RyYXdhYmxlc1RvVXBkYXRlTGlua3MiLCJfY2hhbmdlSW50ZXJ2YWxzVG9EaXNwb3NlIiwiX2xhc3RDdXJzb3IiLCJfY3VycmVudEJhY2tncm91bmRDU1MiLCJfYmFja2dyb3VuZENvbG9yIiwiX3JlcXVlc3RBbmltYXRpb25GcmFtZUlEIiwiX2lucHV0IiwiX2lucHV0TGlzdGVuZXJzIiwiX2ludGVyYWN0aXZlIiwiX2xpc3RlblRvT25seUVsZW1lbnQiLCJfYmF0Y2hET01FdmVudHMiLCJfYXNzdW1lRnVsbFdpbmRvdyIsIl9wYXNzaXZlRXZlbnRzIiwiX2FnZ3Jlc3NpdmVDb250ZXh0UmVjcmVhdGlvbiIsIl9hbGxvd0JhY2tpbmdTY2FsZUFudGlhbGlhc2luZyIsIl9vdmVybGF5cyIsIl9wb2ludGVyT3ZlcmxheSIsIl9wb2ludGVyQXJlYU92ZXJsYXkiLCJfaGl0QXJlYU92ZXJsYXkiLCJfY2FudmFzQXJlYUJvdW5kc092ZXJsYXkiLCJfZml0dGVkQmxvY2tCb3VuZHNPdmVybGF5IiwiX2lzUGFpbnRpbmciLCJfaXNEaXNwb3NpbmciLCJfaXNEaXNwb3NlZCIsImFwcGx5Q1NTSGFja3MiLCJzZXRCYWNrZ3JvdW5kQ29sb3IiLCJhcmlhTGl2ZUFubm91bmNlciIsImRlc2NyaXB0aW9uVXR0ZXJhbmNlUXVldWUiLCJpbml0aWFsaXplIiwiZmVhdHVyZVNwZWNpZmljQW5ub3VuY2luZ0NvbnRyb2xQcm9wZXJ0eU5hbWUiLCJhZGRPdmVybGF5IiwiZm9jdXNNYW5hZ2VyIiwiX2ZvY3VzUm9vdE5vZGUiLCJfZm9jdXNPdmVybGF5IiwicGRvbUZvY3VzSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eSIsImludGVyYWN0aXZlSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eSIsInJlYWRpbmdCbG9ja0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkiLCJfcm9vdFBET01JbnN0YW5jZSIsInBvb2wiLCJjcmVhdGUiLCJzY2VuZXJ5TG9nIiwidG9TdHJpbmciLCJyZWJ1aWxkSW5zdGFuY2VUcmVlIiwicGVlciIsImFwcGVuZENoaWxkIiwicHJpbWFyeVNpYmxpbmciLCJhcmlhTGl2ZUNvbnRhaW5lciIsInN0eWxlIiwidXNlclNlbGVjdCIsIl9ib3VuZEhhbmRsZUZ1bGxTY3JlZW5OYXZpZ2F0aW9uIiwiaGFuZGxlRnVsbFNjcmVlbk5hdmlnYXRpb24iLCJiaW5kIiwia2V5ZG93bkVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImdldERPTUVsZW1lbnQiLCJkb21FbGVtZW50IiwidXBkYXRlRGlzcGxheSIsImlzTG9nZ2luZ1BlcmZvcm1hbmNlIiwicGVyZlN5bmNUcmVlQ291bnQiLCJwZXJmU3RpdGNoQ291bnQiLCJwZXJmSW50ZXJ2YWxDb3VudCIsInBlcmZEcmF3YWJsZUJsb2NrQ2hhbmdlQ291bnQiLCJwZXJmRHJhd2FibGVPbGRJbnRlcnZhbENvdW50IiwicGVyZkRyYXdhYmxlTmV3SW50ZXJ2YWxDb3VudCIsImFzc2VydFN1YnRyZWVEaXNwb3NlZCIsInB1c2giLCJmaXJzdFJ1biIsInZhbGlkYXRlUG9pbnRlcnMiLCJ1cGRhdGVTdWJ0cmVlUG9zaXRpb25pbmciLCJ2YWxpZGF0ZVdhdGNoZWRCb3VuZHMiLCJhc3NlcnRTbG93IiwiYXVkaXRSb290IiwiX3BpY2tlciIsImF1ZGl0IiwiY3JlYXRlRnJvbVBvb2wiLCJiYXNlU3luY1RyZWUiLCJtYXJrVHJhbnNmb3JtUm9vdERpcnR5IiwiaXNUcmFuc2Zvcm1lZCIsImxlbmd0aCIsInBvcCIsInVwZGF0ZUxpbmtzIiwiZGlzcG9zZSIsImdyb3VwRHJhd2FibGUiLCJjaGFuZ2VkIiwidXBkYXRlQmxvY2siLCJ1cGRhdGVEaXJ0eVRyYW5zZm9ybVJvb3RzIiwidXBkYXRlVmlzaWJpbGl0eSIsImF1ZGl0VmlzaWJpbGl0eSIsImF1ZGl0SW5zdGFuY2VTdWJ0cmVlRm9yRGlzcGxheSIsInVwZGF0ZSIsInVwZGF0ZUN1cnNvciIsInVwZGF0ZUJhY2tncm91bmRDb2xvciIsInVwZGF0ZVNpemUiLCJ6SW5kZXgiLCJsYXN0WkluZGV4IiwiaSIsIm92ZXJsYXkiLCJyZWR1Y2VSZWZlcmVuY2VzIiwic3luY1RyZWVNZXNzYWdlIiwiUGVyZkNyaXRpY2FsIiwiUGVyZk1ham9yIiwiUGVyZk1pbm9yIiwiUGVyZlZlcmJvc2UiLCJkcmF3YWJsZUJsb2NrQ291bnRNZXNzYWdlIiwiYXVkaXRQRE9NRGlzcGxheXMiLCJnZXRQaGV0aW9FbGVtZW50QXQiLCJwb2ludCIsIm5vZGUiLCJnZXRQaGV0aW9Nb3VzZUhpdCIsImlzUGhldGlvSW5zdHJ1bWVudGVkIiwic2l6ZURpcnR5Iiwic2l6ZSIsImNsaXAiLCJpc1dlYkdMQWxsb3dlZCIsIndlYmdsQWxsb3dlZCIsImdldFJvb3ROb2RlIiwiZ2V0Um9vdEJhY2tib25lIiwicm9vdEJhY2tib25lIiwiZ2V0U2l6ZSIsInZhbHVlIiwiZ2V0Qm91bmRzIiwidG9Cb3VuZHMiLCJib3VuZHMiLCJzZXRTaXplIiwic2V0V2lkdGhIZWlnaHQiLCJnZXRXaWR0aCIsInNldFdpZHRoIiwiZ2V0SGVpZ2h0Iiwic2V0SGVpZ2h0IiwiY29sb3IiLCJnZXRCYWNrZ3JvdW5kQ29sb3IiLCJyZWN1cnNpdmVEaXNhYmxlIiwiaW50ZXJydXB0UG9pbnRlcnMiLCJjbGVhckJhdGNoZWRFdmVudHMiLCJyZW1vdmVUZW1wb3JhcnlQb2ludGVycyIsImludGVycnVwdFN1YnRyZWVJbnB1dCIsImludGVycnVwdElucHV0Iiwic2V0QXR0cmlidXRlIiwicmVtb3ZlT3ZlcmxheSIsInJlbW92ZUNoaWxkIiwic3BsaWNlIiwiXyIsImluZGV4T2YiLCJnZXRQRE9NUm9vdEVsZW1lbnQiLCJwZG9tUm9vdEVsZW1lbnQiLCJpc0FjY2Vzc2libGUiLCJkb21FdmVudCIsImlzRnVsbFNjcmVlbiIsImlzS2V5RXZlbnQiLCJLRVlfVEFCIiwicm9vdEVsZW1lbnQiLCJuZXh0RWxlbWVudCIsInNoaWZ0S2V5IiwiZ2V0UHJldmlvdXNGb2N1c2FibGUiLCJ1bmRlZmluZWQiLCJnZXROZXh0Rm9jdXNhYmxlIiwidGFyZ2V0IiwicHJldmVudERlZmF1bHQiLCJnZXRVc2VkUmVuZGVyZXJzQml0bWFzayIsInJlbmRlcmVyc1VuZGVyQmFja2JvbmUiLCJiYWNrYm9uZSIsImJpdG1hc2siLCJlYWNoIiwiYmxvY2tzIiwiYmxvY2siLCJkb21EcmF3YWJsZSIsInJlbmRlcmVyIiwiYml0bWFza1JlbmRlcmVyQXJlYSIsImluc3RhbmNlIiwicGFzc1RyYW5zZm9ybSIsInRyYW5zZm9ybVN5c3RlbSIsInJlbGF0aXZlVHJhbnNmb3JtIiwidXBkYXRlVHJhbnNmb3JtTGlzdGVuZXJzQW5kQ29tcHV0ZSIsIm1hcmtEcmF3YWJsZUNoYW5nZWRCbG9jayIsImRyYXdhYmxlIiwibWFya0ZvclJlZHVjZWRSZWZlcmVuY2VzIiwiaXRlbSIsIm1hcmtJbnN0YW5jZVJvb3RGb3JEaXNwb3NhbCIsIm1hcmtEcmF3YWJsZUZvckRpc3Bvc2FsIiwibWFya0RyYXdhYmxlRm9yTGlua3NVcGRhdGUiLCJtYXJrQ2hhbmdlSW50ZXJ2YWxUb0Rpc3Bvc2UiLCJjaGFuZ2VJbnRlcnZhbCIsIm5ld0JhY2tncm91bmRDU1MiLCJ0b0NTUyIsIm1vdXNlIiwiY3Vyc29yIiwiQ3Vyc29yIiwic2V0U2NlbmVDdXJzb3IiLCJtb3VzZVRyYWlsIiwidHJhaWxVbmRlclBvaW50ZXIiLCJnZXRDdXJzb3JDaGVja0luZGV4Iiwibm9kZXMiLCJnZXRFZmZlY3RpdmVDdXJzb3IiLCJuYW1lIiwic2V0RWxlbWVudEN1cnNvciIsImRvY3VtZW50IiwiYm9keSIsImN1c3RvbUN1cnNvcnMiLCJvdmVyZmxvdyIsIm1zVG91Y2hBY3Rpb24iLCJzZXRTdHlsZSIsImZvbnRTbW9vdGhpbmciLCJvbnNlbGVjdHN0YXJ0IiwibXNDb250ZW50Wm9vbWluZyIsInVzZXJEcmFnIiwidG91Y2hBY3Rpb24iLCJ0b3VjaENhbGxvdXQiLCJ0YXBIaWdobGlnaHRDb2xvciIsImNhbnZhc0RhdGFVUkwiLCJjYWxsYmFjayIsImNhbnZhc1NuYXBzaG90IiwiY2FudmFzIiwidG9EYXRhVVJMIiwiY3JlYXRlRWxlbWVudCIsImNvbnRleHQiLCJnZXRDb250ZXh0IiwicmVuZGVyVG9DYW52YXMiLCJnZXRJbWFnZURhdGEiLCJzZXRQb2ludGVyRGlzcGxheVZpc2libGUiLCJ2aXNpYmlsaXR5IiwiaGFzT3ZlcmxheSIsInNldFBvaW50ZXJBcmVhRGlzcGxheVZpc2libGUiLCJzZXRIaXRBcmVhRGlzcGxheVZpc2libGUiLCJzZXRDYW52YXNOb2RlQm91bmRzVmlzaWJsZSIsInNldEZpdHRlZEJsb2NrQm91bmRzVmlzaWJsZSIsInJlc2l6ZU9uV2luZG93UmVzaXplIiwicmVzaXplciIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsImFkZEV2ZW50TGlzdGVuZXIiLCJ1cGRhdGVPblJlcXVlc3RBbmltYXRpb25GcmFtZSIsInN0ZXBDYWxsYmFjayIsImxhc3RUaW1lIiwidGltZUVsYXBzZWRJblNlY29uZHMiLCJzZWxmIiwic3RlcCIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInRpbWVOb3ciLCJEYXRlIiwibm93IiwiZW1pdCIsImNhbmNlbFVwZGF0ZU9uUmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJpbml0aWFsaXplRXZlbnRzIiwiaW5wdXQiLCJjb25uZWN0TGlzdGVuZXJzIiwiZGV0YWNoRXZlbnRzIiwiZGlzY29ubmVjdExpc3RlbmVycyIsImFkZElucHV0TGlzdGVuZXIiLCJsaXN0ZW5lciIsImluY2x1ZGVzIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsImhhc0lucHV0TGlzdGVuZXIiLCJnZXRJbnB1dExpc3RlbmVycyIsInNsaWNlIiwiaW5wdXRMaXN0ZW5lcnMiLCJsaXN0ZW5lcnNDb3B5IiwiaW50ZXJydXB0IiwiZW5zdXJlTm90UGFpbnRpbmciLCJsb3NlV2ViR0xDb250ZXh0cyIsImxvc2VCYWNrYm9uZSIsImZvckVhY2giLCJnbCIsImxvc2VDb250ZXh0IiwiZmlyc3REcmF3YWJsZSIsIm5leHREcmF3YWJsZSIsImxhc3REcmF3YWJsZSIsImluc3BlY3QiLCJsb2NhbFN0b3JhZ2UiLCJzY2VuZXJ5U25hcHNob3QiLCJKU09OIiwic3RyaW5naWZ5IiwiZ2V0RGVidWdIVE1MIiwiaGVhZGVyU3R5bGUiLCJkZXB0aCIsInJlc3VsdCIsIm5vZGVDb3VudCIsImNvdW50IiwiY2hpbGRyZW4iLCJpbnN0YW5jZUNvdW50IiwiZHJhd2FibGVDb3VudCIsImNoaWxkRHJhd2FibGUiLCJkcmF3YWJsZUNvdW50TWFwIiwiY291bnRSZXRhaW5lZERyYXdhYmxlIiwicmV0YWluZWREcmF3YWJsZUNvdW50Iiwic2VsZkRyYXdhYmxlIiwic2hhcmVkQ2FjaGVEcmF3YWJsZSIsImRyYXdhYmxlTmFtZSIsImJsb2NrU3VtbWFyeSIsImhhc0JhY2tib25lIiwiZGl2IiwiayIsImluc3RhbmNlU3VtbWFyeSIsImlTdW1tYXJ5IiwiYWRkUXVhbGlmaWVyIiwidGV4dCIsImlzUGFpbnRlZCIsImdldERlYnVnSFRNTEV4dHJhcyIsInZpc2libGUiLCJyZWxhdGl2ZVZpc2libGUiLCJzZWxmVmlzaWJsZSIsImZpdHRhYmlsaXR5IiwiYW5jZXN0b3JzRml0dGFibGUiLCJzZWxmRml0dGFibGUiLCJwaWNrYWJsZSIsInRyYWlsIiwiaXNQaWNrYWJsZSIsImNsaXBBcmVhIiwibW91c2VBcmVhIiwidG91Y2hBcmVhIiwiZ2V0UmVuZGVyZXIiLCJpc0xheWVyU3BsaXQiLCJvcGFjaXR5IiwiZGlzYWJsZWRPcGFjaXR5IiwiX2JvdW5kc0V2ZW50Q291bnQiLCJfYm91bmRzRXZlbnRTZWxmQ291bnQiLCJ0cmFuc2Zvcm1UeXBlIiwidHJhbnNmb3JtIiwiZ2V0TWF0cml4IiwidHlwZSIsIklERU5USVRZIiwiVFJBTlNMQVRJT05fMkQiLCJTQ0FMSU5HIiwiQUZGSU5FIiwiT1RIRVIiLCJFcnJvciIsInJlcGxhY2UiLCJpbmRpY2VzIiwiam9pbiIsIl9yZW5kZXJlclN1bW1hcnkiLCJfcmVuZGVyZXJCaXRtYXNrIiwiYml0bWFza05vZGVEZWZhdWx0IiwiZHJhd2FibGVTdW1tYXJ5IiwiZHJhd2FibGVTdHJpbmciLCJkaXJ0eSIsImZpdHRhYmxlIiwicHJpbnRJbnN0YW5jZVN1YnRyZWUiLCJhZGREcmF3YWJsZSIsImNoaWxkSW5zdGFuY2UiLCJwcmludERyYXdhYmxlU3VidHJlZSIsInRvUGF0aFN0cmluZyIsImJhY2tib25lSW5zdGFuY2UiLCJnZXREZWJ1Z1VSSSIsImVuY29kZVVSSUNvbXBvbmVudCIsInBvcHVwRGVidWciLCJvcGVuIiwiaWZyYW1lRGVidWciLCJpZnJhbWUiLCJwb3NpdGlvbiIsImxlZnQiLCJ0b3AiLCJjb250ZW50V2luZG93Iiwid3JpdGUiLCJjbG9zZSIsImJhY2tncm91bmQiLCJjbG9zZUJ1dHRvbiIsInJpZ2h0IiwidGV4dENvbnRlbnQiLCJldmVudFR5cGUiLCJnZXRQRE9NRGVidWdIVE1MIiwiaW5kZW50IiwicmVjdXJzZSIsImluZGVudGF0aW9uIiwiaXNSb290SW5zdGFuY2UiLCJ0YWdOYW1lIiwiY2hpbGQiLCJwYXJhbGxlbERPTSIsIm91dGVySFRNTCIsImxpbmVzIiwic3BsaXQiLCJsaW5lIiwiaXNFbmRUYWciLCJzdGFydHNXaXRoIiwiZm9yZWlnbk9iamVjdFJhc3Rlcml6YXRpb24iLCJjYW52YXNVcmxNYXAiLCJ1bmtub3duSWRzIiwiYWRkQ2FudmFzIiwic2NhbkZvckNhbnZhc2VzIiwiSFRNTENhbnZhc0VsZW1lbnQiLCJBcnJheSIsInByb3RvdHlwZSIsImNhbGwiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImRvYyIsImltcGxlbWVudGF0aW9uIiwiY3JlYXRlSFRNTERvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwiaW5uZXJIVE1MIiwibmFtZXNwYWNlVVJJIiwiUk9PVF9DTEFTU19OQU1FIiwiZGlzcGxheUNhbnZhc2VzIiwiZGlzcGxheUNhbnZhcyIsImNzc1RleHQiLCJkaXNwbGF5SW1nIiwic3JjIiwicGFyZW50Tm9kZSIsInJlcGxhY2VDaGlsZCIsImRpc3BsYXlXaWR0aCIsImRpc3BsYXlIZWlnaHQiLCJjb21wbGV0ZUZ1bmN0aW9uIiwiZWxlbWVudFRvU1ZHRGF0YVVSTCIsInJlcGxhY2VkSW1hZ2VzIiwiaGFzUmVwbGFjZWRJbWFnZXMiLCJkaXNwbGF5U1ZHSW1hZ2VzIiwiaiIsImRpc3BsYXlTVkdJbWFnZSIsImN1cnJlbnRIcmVmIiwiZ2V0QXR0cmlidXRlIiwicmVmSW1hZ2UiLCJJbWFnZSIsInN2Z0ltYWdlIiwib25sb2FkIiwicmVmQ2FudmFzIiwicmVmQ29udGV4dCIsImRyYXdJbWFnZSIsIm9uZXJyb3IiLCJwb3B1cFJhc3Rlcml6YXRpb24iLCJ1cmwiLCJnZXRUcmFpbEZyb21QRE9NSW5kaWNlc1N0cmluZyIsImluZGljZXNTdHJpbmciLCJpbmRleFN0cmluZ3MiLCJQRE9NX1VOSVFVRV9JRF9TRVBBUkFUT1IiLCJkaWdpdCIsIk51bWJlciIsInJlbW92ZVJvb3RlZERpc3BsYXkiLCJyZW1vdmVMaXN0ZW5lciIsInhodG1sIiwiWE1MU2VyaWFsaXplciIsInNlcmlhbGl6ZVRvU3RyaW5nIiwiZGF0YSIsImltZyIsInVpbnQ4YXJyYXkiLCJUZXh0RW5jb2RlckxpdGUiLCJlbmNvZGUiLCJiYXNlNjQiLCJmcm9tQnl0ZUFycmF5IiwiaXNEaXNwb3NlZCIsInJlZ2lzdGVyIiwidXNlckdlc3R1cmVFbWl0dGVyIl0sInNvdXJjZXMiOlsiRGlzcGxheS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIHBlcnNpc3RlbnQgZGlzcGxheSBvZiBhIHNwZWNpZmljIE5vZGUgYW5kIGl0cyBkZXNjZW5kYW50cywgd2hpY2ggaXMgdXBkYXRlZCBhdCBkaXNjcmV0ZSBwb2ludHMgaW4gdGltZS5cclxuICpcclxuICogVXNlIGRpc3BsYXkuZ2V0RE9NRWxlbWVudCBvciBkaXNwbGF5LmRvbUVsZW1lbnQgdG8gcmV0cmlldmUgdGhlIERpc3BsYXkncyBET00gcmVwcmVzZW50YXRpb24uXHJcbiAqIFVzZSBkaXNwbGF5LnVwZGF0ZURpc3BsYXkoKSB0byB0cmlnZ2VyIHRoZSB2aXN1YWwgdXBkYXRlIGluIHRoZSBEaXNwbGF5J3MgRE9NIGVsZW1lbnQuXHJcbiAqXHJcbiAqIEEgc3RhbmRhcmQgd2F5IG9mIHVzaW5nIGEgRGlzcGxheSB3aXRoIFNjZW5lcnkgaXMgdG86XHJcbiAqIDEuIENyZWF0ZSBhIE5vZGUgdGhhdCB3aWxsIGJlIHRoZSByb290XHJcbiAqIDIuIENyZWF0ZSBhIERpc3BsYXksIHJlZmVyZW5jaW5nIHRoYXQgbm9kZVxyXG4gKiAzLiBNYWtlIGNoYW5nZXMgdG8gdGhlIHNjZW5lIGdyYXBoXHJcbiAqIDQuIENhbGwgZGlzcGxheS51cGRhdGVEaXNwbGF5KCkgdG8gZHJhdyB0aGUgc2NlbmUgZ3JhcGggaW50byB0aGUgRGlzcGxheVxyXG4gKiA1LiBHbyB0byAoMylcclxuICpcclxuICogQ29tbW9uIHdheXMgdG8gc2ltcGxpZnkgdGhlIGNoYW5nZS91cGRhdGUgbG9vcCB3b3VsZCBiZSB0bzpcclxuICogLSBVc2UgTm9kZS1iYXNlZCBldmVudHMuIEluaXRpYWxpemUgaXQgd2l0aCBEaXNwbGF5LmluaXRpYWxpemVFdmVudHMoKSwgdGhlblxyXG4gKiAgIGFkZCBpbnB1dCBsaXN0ZW5lcnMgdG8gcGFydHMgb2YgdGhlIHNjZW5lIGdyYXBoIChzZWUgTm9kZS5hZGRJbnB1dExpc3RlbmVyKS5cclxuICogLSBFeGVjdXRlIGNvZGUgKGFuZCB1cGRhdGUgdGhlIGRpc3BsYXkgYWZ0ZXJ3YXJkcykgYnkgdXNpbmcgRGlzcGxheS51cGRhdGVPblJlcXVlc3RBbmltYXRpb25GcmFtZS5cclxuICpcclxuICogSW50ZXJuYWwgZG9jdW1lbnRhdGlvbjpcclxuICpcclxuICogTGlmZWN5Y2xlIGluZm9ybWF0aW9uOlxyXG4gKiAgIEluc3RhbmNlIChjcmVhdGUsZGlzcG9zZSlcclxuICogICAgIC0gb3V0IG9mIHVwZGF0ZTogICAgICAgICAgICBTdGF0ZWxlc3Mgc3R1YiBpcyBjcmVhdGVkIHN5bmNocm9ub3VzbHkgd2hlbiBhIE5vZGUncyBjaGlsZHJlbiBhcmUgYWRkZWQgd2hlcmUgd2VcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXZlIG5vIHJlbGV2YW50IEluc3RhbmNlLlxyXG4gKiAgICAgLSBzdGFydCBvZiB1cGRhdGU6ICAgICAgICAgIENyZWF0ZXMgZmlyc3QgKHJvb3QpIGluc3RhbmNlIGlmIGl0IGRvZXNuJ3QgZXhpc3QgKHN0YXRlbGVzcyBzdHViKS5cclxuICogICAgIC0gc3luY3RyZWU6ICAgICAgICAgICAgICAgICBDcmVhdGUgZGVzY2VuZGFudCBpbnN0YW5jZXMgdW5kZXIgc3R1YnMsIGZpbGxzIGluIHN0YXRlLCBhbmQgbWFya3MgcmVtb3ZlZCBzdWJ0cmVlXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdHMgZm9yIGRpc3Bvc2FsLlxyXG4gKiAgICAgLSB1cGRhdGUgaW5zdGFuY2UgZGlzcG9zYWw6IERpc3Bvc2VzIHJvb3QgaW5zdGFuY2VzIHRoYXQgd2VyZSBtYXJrZWQuIFRoaXMgYWxzbyBkaXNwb3NlcyBhbGwgZGVzY2VuZGFudFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlcywgYW5kIGZvciBldmVyeSBpbnN0YW5jZSxcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdCBkaXNwb3NlcyB0aGUgY3VycmVudGx5LWF0dGFjaGVkIGRyYXdhYmxlcy5cclxuICogICBEcmF3YWJsZSAoY3JlYXRlLGRpc3Bvc2UpXHJcbiAqICAgICAtIHN5bmN0cmVlOiAgICAgICAgICAgICAgICAgQ3JlYXRlcyBhbGwgZHJhd2FibGVzIHdoZXJlIG5lY2Vzc2FyeS4gSWYgaXQgcmVwbGFjZXMgYSBzZWxmL2dyb3VwL3NoYXJlZCBkcmF3YWJsZSBvblxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBpbnN0YW5jZSxcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0IG9sZCBkcmF3YWJsZSBpcyBtYXJrZWQgZm9yIGRpc3Bvc2FsLlxyXG4gKiAgICAgLSB1cGRhdGUgaW5zdGFuY2UgZGlzcG9zYWw6IEFueSBkcmF3YWJsZXMgYXR0YWNoZWQgdG8gZGlzcG9zZWQgaW5zdGFuY2VzIGFyZSBkaXNwb3NlZCB0aGVtc2VsdmVzIChzZWUgSW5zdGFuY2VcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaWZlY3ljbGUpLlxyXG4gKiAgICAgLSB1cGRhdGUgZHJhd2FibGUgZGlzcG9zYWw6IEFueSBtYXJrZWQgZHJhd2FibGVzIHRoYXQgd2VyZSByZXBsYWNlZCBvciByZW1vdmVkIGZyb20gYW4gaW5zdGFuY2UgKGl0IGRpZG4ndFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1haW50YWluIGEgcmVmZXJlbmNlKSBhcmUgZGlzcG9zZWQuXHJcbiAqXHJcbiAqICAgYWRkL3JlbW92ZSBkcmF3YWJsZXMgZnJvbSBibG9ja3M6XHJcbiAqICAgICAtIHN0aXRjaGluZyBjaGFuZ2VzIHBlbmRpbmcgXCJwYXJlbnRzXCIsIG1hcmtzIGZvciBibG9jayB1cGRhdGVcclxuICogICAgIC0gYmFja2JvbmVzIG1hcmtlZCBmb3IgZGlzcG9zYWwgKGUuZy4gaW5zdGFuY2UgaXMgc3RpbGwgdGhlcmUsIGp1c3QgY2hhbmdlZCB0byBub3QgaGF2ZSBhIGJhY2tib25lKSB3aWxsIG1hcmtcclxuICogICAgICAgICBkcmF3YWJsZXMgZm9yIGJsb2NrIHVwZGF0ZXNcclxuICogICAgIC0gYWRkL3JlbW92ZSBkcmF3YWJsZXMgcGhhc2UgdXBkYXRlcyBkcmF3YWJsZXMgdGhhdCB3ZXJlIG1hcmtlZFxyXG4gKiAgICAgLSBkaXNwb3NlZCBiYWNrYm9uZSBpbnN0YW5jZXMgd2lsbCBvbmx5IHJlbW92ZSBkcmF3YWJsZXMgaWYgdGhleSB3ZXJlbid0IG1hcmtlZCBmb3IgcmVtb3ZhbCBwcmV2aW91c2x5IChlLmcuIGluXHJcbiAqICAgICAgICAgY2FzZSB3ZSBhcmUgZnJvbSBhIHJlbW92ZWQgaW5zdGFuY2UpXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgc3RlcFRpbWVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvc3RlcFRpbWVyLmpzJztcclxuaW1wb3J0IFRpbnlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RpbnlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgeyBNYXRyaXgzVHlwZSB9IGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgZXNjYXBlSFRNTCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvZXNjYXBlSFRNTC5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBwbGF0Zm9ybSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvcGxhdGZvcm0uanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0IGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQXJpYUxpdmVBbm5vdW5jZXIgZnJvbSAnLi4vLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL0FyaWFMaXZlQW5ub3VuY2VyLmpzJztcclxuaW1wb3J0IFV0dGVyYW5jZVF1ZXVlIGZyb20gJy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2VRdWV1ZS5qcyc7XHJcbmltcG9ydCB7IEJhY2tib25lRHJhd2FibGUsIEJsb2NrLCBDYW52YXNCbG9jaywgQ2FudmFzTm9kZUJvdW5kc092ZXJsYXksIENoYW5nZUludGVydmFsLCBDb2xvciwgRE9NQmxvY2ssIERPTURyYXdhYmxlLCBEcmF3YWJsZSwgRmVhdHVyZXMsIEZpdHRlZEJsb2NrQm91bmRzT3ZlcmxheSwgRm9jdXNNYW5hZ2VyLCBGdWxsU2NyZWVuLCBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIsIEhpZ2hsaWdodE92ZXJsYXksIEhpdEFyZWFPdmVybGF5LCBJbnB1dCwgSW5wdXRPcHRpb25zLCBJbnN0YW5jZSwgS2V5Ym9hcmRVdGlscywgTm9kZSwgUERPTUluc3RhbmNlLCBQRE9NU2libGluZ1N0eWxlLCBQRE9NVHJlZSwgUERPTVV0aWxzLCBQb2ludGVyQXJlYU92ZXJsYXksIFBvaW50ZXJPdmVybGF5LCBSZW5kZXJlciwgc2NlbmVyeSwgc2NlbmVyeVNlcmlhbGl6ZSwgU2VsZkRyYXdhYmxlLCBUSW5wdXRMaXN0ZW5lciwgVE92ZXJsYXksIFRyYWlsLCBVdGlscywgV2ViR0xCbG9jayB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XHJcbmltcG9ydCBTYWZhcmlXb3JrYXJvdW5kT3ZlcmxheSBmcm9tICcuLi9vdmVybGF5cy9TYWZhcmlXb3JrYXJvdW5kT3ZlcmxheS5qcyc7XHJcblxyXG5leHBvcnQgdHlwZSBEaXNwbGF5T3B0aW9ucyA9IHtcclxuICAvLyBJbml0aWFsIChvciBvdmVycmlkZSkgZGlzcGxheSB3aWR0aFxyXG4gIHdpZHRoPzogbnVtYmVyO1xyXG5cclxuICAvLyBJbml0aWFsIChvciBvdmVycmlkZSkgZGlzcGxheSBoZWlnaHRcclxuICBoZWlnaHQ/OiBudW1iZXI7XHJcblxyXG4gIC8vIEFwcGxpZXMgQ1NTIHN0eWxlcyB0byB0aGUgcm9vdCBET00gZWxlbWVudCB0aGF0IG1ha2UgaXQgYW1lbmFibGUgdG8gaW50ZXJhY3RpdmUgY29udGVudFxyXG4gIGFsbG93Q1NTSGFja3M/OiBib29sZWFuO1xyXG5cclxuICAvLyBXaGV0aGVyIHdlIGFsbG93IHRoZSBkaXNwbGF5IHRvIHB1dCBhIHJlY3RhbmdsZSBpbiBmcm9udCBvZiBldmVyeXRoaW5nIHRoYXQgc3VidGx5IHNoaWZ0cyBldmVyeSBmcmFtZSwgaW4gb3JkZXIgdG9cclxuICAvLyBmb3JjZSByZXBhaW50cyBmb3IgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dlb21ldHJpYy1vcHRpY3MtYmFzaWNzL2lzc3Vlcy8zMS5cclxuICBhbGxvd1NhZmFyaVJlZHJhd1dvcmthcm91bmQ/OiBib29sZWFuO1xyXG5cclxuICAvLyBVc3VhbGx5IGFueXRoaW5nIGRpc3BsYXllZCBvdXRzaWRlIG91ciBkb20gZWxlbWVudCBpcyBoaWRkZW4gd2l0aCBDU1Mgb3ZlcmZsb3cuXHJcbiAgYWxsb3dTY2VuZU92ZXJmbG93PzogYm9vbGVhbjtcclxuXHJcbiAgLy8gV2hhdCBjdXJzb3IgaXMgdXNlZCB3aGVuIG5vIG90aGVyIGN1cnNvciBpcyBzcGVjaWZpZWRcclxuICBkZWZhdWx0Q3Vyc29yPzogc3RyaW5nO1xyXG5cclxuICAvLyBJbml0aWFsIGJhY2tncm91bmQgY29sb3JcclxuICBiYWNrZ3JvdW5kQ29sb3I/OiBDb2xvciB8IHN0cmluZyB8IG51bGw7XHJcblxyXG4gIC8vIFdoZXRoZXIgV2ViR0wgd2lsbCBwcmVzZXJ2ZSB0aGUgZHJhd2luZyBidWZmZXJcclxuICAvLyBXQVJOSU5HITogVGhpcyBjYW4gc2lnbmlmaWNhbnRseSByZWR1Y2UgcGVyZm9ybWFuY2UgaWYgc2V0IHRvIHRydWUuXHJcbiAgcHJlc2VydmVEcmF3aW5nQnVmZmVyPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gV2hldGhlciBXZWJHTCBpcyBlbmFibGVkIGF0IGFsbCBmb3IgZHJhd2FibGVzIGluIHRoaXMgRGlzcGxheVxyXG4gIC8vIE1ha2VzIGl0IHBvc3NpYmxlIHRvIGRpc2FibGUgV2ViR0wgZm9yIGVhc2Ugb2YgdGVzdGluZyBvbiBub24tV2ViR0wgcGxhdGZvcm1zLCBzZWUgIzI4OVxyXG4gIGFsbG93V2ViR0w/OiBib29sZWFuO1xyXG5cclxuICAvLyBFbmFibGVzIGFjY2Vzc2liaWxpdHkgZmVhdHVyZXNcclxuICBhY2Nlc3NpYmlsaXR5PzogYm9vbGVhbjtcclxuXHJcbiAgLy8ge2Jvb2xlYW59IC0gRW5hYmxlcyBJbnRlcmFjdGl2ZSBIaWdobGlnaHRzIGluIHRoZSBIaWdobGlnaHRPdmVybGF5LiBUaGVzZSBhcmUgaGlnaGxpZ2h0cyB0aGF0IHN1cnJvdW5kXHJcbiAgLy8gaW50ZXJhY3RpdmUgY29tcG9uZW50cyB3aGVuIHVzaW5nIG1vdXNlIG9yIHRvdWNoIHdoaWNoIGltcHJvdmVzIGxvdyB2aXNpb24gYWNjZXNzLlxyXG4gIHN1cHBvcnRzSW50ZXJhY3RpdmVIaWdobGlnaHRzPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gV2hldGhlciBtb3VzZS90b3VjaC9rZXlib2FyZCBpbnB1dHMgYXJlIGVuYWJsZWQgKGlmIGlucHV0IGhhcyBiZWVuIGFkZGVkKS5cclxuICBpbnRlcmFjdGl2ZT86IGJvb2xlYW47XHJcblxyXG4gIC8vIElmIHRydWUsIGlucHV0IGV2ZW50IGxpc3RlbmVycyB3aWxsIGJlIGF0dGFjaGVkIHRvIHRoZSBEaXNwbGF5J3MgRE9NIGVsZW1lbnQgaW5zdGVhZCBvZiB0aGUgd2luZG93LlxyXG4gIC8vIE5vcm1hbGx5LCBhdHRhY2hpbmcgbGlzdGVuZXJzIHRvIHRoZSB3aW5kb3cgaXMgcHJlZmVycmVkIChpdCB3aWxsIHNlZSBtb3VzZSBtb3Zlcy91cHMgb3V0c2lkZSBvZiB0aGUgYnJvd3NlclxyXG4gIC8vIHdpbmRvdywgYWxsb3dpbmcgY29ycmVjdCBidXR0b24gdHJhY2tpbmcpLCBob3dldmVyIHRoZXJlIG1heSBiZSBpbnN0YW5jZXMgd2hlcmUgYSBnbG9iYWwgbGlzdGVuZXIgaXMgbm90XHJcbiAgLy8gcHJlZmVycmVkLlxyXG4gIGxpc3RlblRvT25seUVsZW1lbnQ/OiBib29sZWFuO1xyXG5cclxuICAvLyBGb3J3YXJkZWQgdG8gSW5wdXQ6IElmIHRydWUsIG1vc3QgZXZlbnQgdHlwZXMgd2lsbCBiZSBiYXRjaGVkIHVudGlsIG90aGVyd2lzZSB0cmlnZ2VyZWQuXHJcbiAgYmF0Y2hET01FdmVudHM/OiBib29sZWFuO1xyXG5cclxuICAvLyBJZiB0cnVlLCB0aGUgaW5wdXQgZXZlbnQgbG9jYXRpb24gKGJhc2VkIG9uIHRoZSB0b3AtbGVmdCBvZiB0aGUgYnJvd3NlciB0YWIncyB2aWV3cG9ydCwgd2l0aCBub1xyXG4gIC8vIHNjYWxpbmcgYXBwbGllZCkgd2lsbCBiZSB1c2VkLiBVc3VhbGx5LCB0aGlzIGlzIG5vdCBhIHNhZmUgYXNzdW1wdGlvbiwgc28gd2hlbiBmYWxzZSB0aGUgbG9jYXRpb24gb2YgdGhlXHJcbiAgLy8gZGlzcGxheSdzIERPTSBlbGVtZW50IHdpbGwgYmUgdXNlZCB0byBnZXQgdGhlIGNvcnJlY3QgZXZlbnQgbG9jYXRpb24uIFRoZXJlIGlzIGEgc2xpZ2h0IHBlcmZvcm1hbmNlIGhpdCB0b1xyXG4gIC8vIGRvaW5nIHNvLCB0aHVzIHRoaXMgb3B0aW9uIGlzIHByb3ZpZGVkIGlmIHRoZSB0b3AtbGVmdCBsb2NhdGlvbiBjYW4gYmUgZ3VhcmFudGVlZC5cclxuICAvLyBOT1RFOiBSb3RhdGlvbiBvZiB0aGUgRGlzcGxheSdzIERPTSBlbGVtZW50IChlLmcuIHdpdGggYSBDU1MgdHJhbnNmb3JtKSB3aWxsIHJlc3VsdCBpbiBhbiBpbmNvcnJlY3QgZXZlbnRcclxuICAvLyAgICAgICBtYXBwaW5nLCBhcyBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKSBjYW4ndCB3b3JrIHdpdGggdGhpcy4gZ2V0Qm94UXVhZHMoKSBzaG91bGQgZml4IHRoaXMgd2hlbiBicm93c2VyXHJcbiAgLy8gICAgICAgc3VwcG9ydCBpcyBhdmFpbGFibGUuXHJcbiAgYXNzdW1lRnVsbFdpbmRvdz86IGJvb2xlYW47XHJcblxyXG4gIC8vIFdoZXRoZXIgU2NlbmVyeSB3aWxsIHRyeSB0byBhZ2dyZXNzaXZlbHkgcmUtY3JlYXRlIFdlYkdMIENhbnZhcy9jb250ZXh0IGluc3RlYWQgb2Ygd2FpdGluZyBmb3JcclxuICAvLyBhIGNvbnRleHQgcmVzdG9yZWQgZXZlbnQuIFNvbWV0aW1lcyBjb250ZXh0IGxvc3NlcyBjYW4gb2NjdXIgd2l0aG91dCBhIHJlc3RvcmF0aW9uIGFmdGVyd2FyZHMsIGJ1dCB0aGlzIGNhblxyXG4gIC8vIGp1bXAtc3RhcnQgdGhlIHByb2Nlc3MuXHJcbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8zNDcuXHJcbiAgYWdncmVzc2l2ZUNvbnRleHRSZWNyZWF0aW9uPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gV2hldGhlciB0aGUgYHBhc3NpdmVgIGZsYWcgc2hvdWxkIGJlIHNldCB3aGVuIGFkZGluZyBhbmQgcmVtb3ZpbmcgRE9NIGV2ZW50IGxpc3RlbmVycy5cclxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzc3MCBmb3IgbW9yZSBkZXRhaWxzLlxyXG4gIC8vIElmIGl0IGlzIHRydWUgb3IgZmFsc2UsIHRoYXQgaXMgdGhlIHZhbHVlIG9mIHRoZSBwYXNzaXZlIGZsYWcgdGhhdCB3aWxsIGJlIHVzZWQuIElmIGl0IGlzIG51bGwsIHRoZSBkZWZhdWx0XHJcbiAgLy8gYmVoYXZpb3Igb2YgdGhlIGJyb3dzZXIgd2lsbCBiZSB1c2VkLlxyXG4gIC8vXHJcbiAgLy8gU2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCB0b3VjaC1hY3Rpb246IG5vbmUsIHNvIHdlIE5FRUQgdG8gbm90IHVzZSBwYXNzaXZlIGV2ZW50cyAod2hpY2ggd291bGQgbm90IGFsbG93XHJcbiAgLy8gcHJldmVudERlZmF1bHQgdG8gZG8gYW55dGhpbmcsIHNvIGRyYWdzIGFjdHVhbGx5IGNhbiBzY3JvbGwgdGhlIHNpbSkuXHJcbiAgLy8gQ2hyb21lIGFsc28gZGlkIHRoZSBzYW1lIFwicGFzc2l2ZSBieSBkZWZhdWx0XCIsIGJ1dCBiZWNhdXNlIHdlIGhhdmUgYHRvdWNoLWFjdGlvbjogbm9uZWAgaW4gcGxhY2UsIGl0IGRvZXNuJ3RcclxuICAvLyBhZmZlY3QgdXMsIGFuZCB3ZSBjYW4gcG90ZW50aWFsbHkgZ2V0IHBlcmZvcm1hbmNlIGltcHJvdmVtZW50cyBieSBhbGxvd2luZyBwYXNzaXZlIGV2ZW50cy5cclxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzc3MCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICBwYXNzaXZlRXZlbnRzPzogYm9vbGVhbiB8IG51bGw7XHJcblxyXG4gIC8vIFdoZXRoZXIsIGlmIG5vIFdlYkdMIGFudGlhbGlhc2luZyBpcyBkZXRlY3RlZCwgdGhlIGJhY2tpbmcgc2NhbGUgY2FuIGJlIGluY3JlYXNlZCB0byBwcm92aWRlIHNvbWVcclxuICAvLyBhbnRpYWxpYXNpbmcgYmVuZWZpdC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84NTkuXHJcbiAgYWxsb3dCYWNraW5nU2NhbGVBbnRpYWxpYXNpbmc/OiBib29sZWFuO1xyXG5cclxuICAvLyBBbiBIVE1MRWxlbWVudCB1c2VkIHRvIGNvbnRhaW4gdGhlIGNvbnRlbnRzIG9mIHRoZSBEaXNwbGF5XHJcbiAgY29udGFpbmVyPzogSFRNTEVsZW1lbnQ7XHJcblxyXG4gIC8vIHBoZXQtaW9cclxuICB0YW5kZW0/OiBUYW5kZW07XHJcbn07XHJcblxyXG5jb25zdCBDVVNUT01fQ1VSU09SUyA9IHtcclxuICAnc2NlbmVyeS1ncmFiLXBvaW50ZXInOiBbICdncmFiJywgJy1tb3otZ3JhYicsICctd2Via2l0LWdyYWInLCAncG9pbnRlcicgXSxcclxuICAnc2NlbmVyeS1ncmFiYmluZy1wb2ludGVyJzogWyAnZ3JhYmJpbmcnLCAnLW1vei1ncmFiYmluZycsICctd2Via2l0LWdyYWJiaW5nJywgJ3BvaW50ZXInIF1cclxufSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT47XHJcblxyXG5sZXQgZ2xvYmFsSWRDb3VudGVyID0gMTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpc3BsYXkge1xyXG5cclxuICAvLyB1bmlxdWUgSUQgZm9yIHRoZSBkaXNwbGF5IGluc3RhbmNlLCAoc2NlbmVyeS1pbnRlcm5hbCksIGFuZCB1c2VmdWwgZm9yIGRlYnVnZ2luZyB3aXRoIG11bHRpcGxlIGRpc3BsYXlzLlxyXG4gIHB1YmxpYyByZWFkb25seSBpZDogbnVtYmVyO1xyXG5cclxuICAvLyBUaGUgKGludGVncmFsLCA+IDApIGRpbWVuc2lvbnMgb2YgdGhlIERpc3BsYXkncyBET00gZWxlbWVudCAob25seSB1cGRhdGVzIHRoZSBET00gZWxlbWVudCBvbiB1cGRhdGVEaXNwbGF5KCkpXHJcbiAgcHVibGljIHJlYWRvbmx5IHNpemVQcm9wZXJ0eTogVFByb3BlcnR5PERpbWVuc2lvbjI+O1xyXG5cclxuICAvLyBkYXRhIHN0cnVjdHVyZSBmb3IgbWFuYWdpbmcgYXJpYS1saXZlIGFsZXJ0cyB0aGUgdGhpcyBEaXNwbGF5IGluc3RhbmNlXHJcbiAgcHVibGljIGRlc2NyaXB0aW9uVXR0ZXJhbmNlUXVldWU6IFV0dGVyYW5jZVF1ZXVlO1xyXG5cclxuICAvLyBNYW5hZ2VzIHRoZSB2YXJpb3VzIHR5cGVzIG9mIEZvY3VzIHRoYXQgY2FuIGdvIHRocm91Z2ggdGhlIERpc3BsYXksIGFzIHdlbGwgYXMgUHJvcGVydGllc1xyXG4gIC8vIGNvbnRyb2xsaW5nIHdoaWNoIGZvcm1zIG9mIGZvY3VzIHNob3VsZCBiZSBkaXNwbGF5ZWQgaW4gdGhlIEhpZ2hsaWdodE92ZXJsYXkuXHJcbiAgcHVibGljIGZvY3VzTWFuYWdlcjogRm9jdXNNYW5hZ2VyO1xyXG5cclxuICAvLyAocGhldC1pbyxzY2VuZXJ5KSAtIFdpbGwgYmUgZmlsbGVkIGluIHdpdGggYSBwaGV0LnNjZW5lcnkuSW5wdXQgaWYgZXZlbnQgaGFuZGxpbmcgaXMgZW5hYmxlZFxyXG4gIHB1YmxpYyBfaW5wdXQ6IElucHV0IHwgbnVsbDtcclxuXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpIFdoZXRoZXIgYWNjZXNzaWJpbGl0eSBpcyBlbmFibGVkIGZvciB0aGlzIHBhcnRpY3VsYXIgZGlzcGxheS5cclxuICBwdWJsaWMgcmVhZG9ubHkgX2FjY2Vzc2libGU6IGJvb2xlYW47XHJcblxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gIHB1YmxpYyByZWFkb25seSBfcHJlc2VydmVEcmF3aW5nQnVmZmVyOiBib29sZWFuO1xyXG5cclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbCkgbWFwIGZyb20gTm9kZSBJRCB0byBJbnN0YW5jZSwgZm9yIGZhc3QgbG9va3VwXHJcbiAgcHVibGljIF9zaGFyZWRDYW52YXNJbnN0YW5jZXM6IFJlY29yZDxudW1iZXIsIEluc3RhbmNlPjtcclxuXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpIC0gV2UgaGF2ZSBhIG1vbm90b25pY2FsbHktaW5jcmVhc2luZyBmcmFtZSBJRCwgZ2VuZXJhbGx5IGZvciB1c2Ugd2l0aCBhIHBhdHRlcm5cclxuICAvLyB3aGVyZSB3ZSBjYW4gbWFyayBvYmplY3RzIHdpdGggdGhpcyB0byBub3RlIHRoYXQgdGhleSBhcmUgZWl0aGVyIHVwLXRvLWRhdGUgb3IgbmVlZCByZWZyZXNoaW5nIGR1ZSB0byB0aGlzXHJcbiAgLy8gcGFydGljdWxhciBmcmFtZSAod2l0aG91dCBoYXZpbmcgdG8gY2xlYXIgdGhhdCBpbmZvcm1hdGlvbiBhZnRlciB1c2UpLiBUaGlzIGlzIGluY3JlbWVudGVkIGV2ZXJ5IGZyYW1lXHJcbiAgcHVibGljIF9mcmFtZUlkOiBudW1iZXI7XHJcblxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gIHB1YmxpYyBfYWdncmVzc2l2ZUNvbnRleHRSZWNyZWF0aW9uOiBib29sZWFuO1xyXG4gIHB1YmxpYyBfYWxsb3dCYWNraW5nU2NhbGVBbnRpYWxpYXNpbmc6IGJvb2xlYW47XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgX2FsbG93V2ViR0w6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfYWxsb3dDU1NIYWNrczogYm9vbGVhbjtcclxuICBwcml2YXRlIHJlYWRvbmx5IF9hbGxvd1NjZW5lT3ZlcmZsb3c6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfZGVmYXVsdEN1cnNvcjogc3RyaW5nO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IF9yb290Tm9kZTogTm9kZTtcclxuICBwcml2YXRlIF9yb290QmFja2JvbmU6IEJhY2tib25lRHJhd2FibGUgfCBudWxsOyAvLyB0byBiZSBmaWxsZWQgaW4gbGF0ZXJcclxuICBwcml2YXRlIHJlYWRvbmx5IF9kb21FbGVtZW50OiBIVE1MRWxlbWVudDtcclxuICBwcml2YXRlIF9iYXNlSW5zdGFuY2U6IEluc3RhbmNlIHwgbnVsbDsgLy8gd2lsbCBiZSBmaWxsZWQgd2l0aCB0aGUgcm9vdCBJbnN0YW5jZVxyXG5cclxuICAvLyBVc2VkIHRvIGNoZWNrIGFnYWluc3QgbmV3IHNpemUgdG8gc2VlIHdoYXQgd2UgbmVlZCB0byBjaGFuZ2VcclxuICBwcml2YXRlIF9jdXJyZW50U2l6ZTogRGltZW5zaW9uMjtcclxuXHJcbiAgcHJpdmF0ZSBfZGlydHlUcmFuc2Zvcm1Sb290czogSW5zdGFuY2VbXTtcclxuICBwcml2YXRlIF9kaXJ0eVRyYW5zZm9ybVJvb3RzV2l0aG91dFBhc3M6IEluc3RhbmNlW107XHJcbiAgcHJpdmF0ZSBfaW5zdGFuY2VSb290c1RvRGlzcG9zZTogSW5zdGFuY2VbXTtcclxuXHJcbiAgLy8gQXQgdGhlIGVuZCBvZiBEaXNwbGF5LnVwZGF0ZSwgcmVkdWNlUmVmZXJlbmNlcyB3aWxsIGJlIGNhbGxlZCBvbiBhbGwgb2YgdGhlc2UuIEl0J3MgbWVhbnQgdG9cclxuICAvLyBjYXRjaCB2YXJpb3VzIG9iamVjdHMgdGhhdCB3b3VsZCB1c3VhbGx5IGhhdmUgdXBkYXRlKCkgY2FsbGVkLCBidXQgaWYgdGhleSBhcmUgaW52aXNpYmxlIG9yIG90aGVyd2lzZSBub3QgdXBkYXRlZFxyXG4gIC8vIGZvciBwZXJmb3JtYW5jZSwgdGhleSBtYXkgbmVlZCB0byByZWxlYXNlIHJlZmVyZW5jZXMgYW5vdGhlciB3YXkgaW5zdGVhZC5cclxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VuZXJneS1mb3Jtcy1hbmQtY2hhbmdlcy9pc3N1ZXMvMzU2XHJcbiAgcHJpdmF0ZSBfcmVkdWNlUmVmZXJlbmNlc05lZWRlZDogeyByZWR1Y2VSZWZlcmVuY2VzOiAoKSA9PiB2b2lkIH1bXTtcclxuXHJcbiAgcHJpdmF0ZSBfZHJhd2FibGVzVG9EaXNwb3NlOiBEcmF3YWJsZVtdO1xyXG5cclxuICAvLyBCbG9jayBjaGFuZ2VzIGFyZSBoYW5kbGVkIGJ5IGNoYW5naW5nIHRoZSBcInBlbmRpbmdcIiBibG9jay9iYWNrYm9uZSBvbiBkcmF3YWJsZXMuIFdlXHJcbiAgLy8gd2FudCB0byBjaGFuZ2UgdGhlbSBhbGwgYWZ0ZXIgdGhlIG1haW4gc3RpdGNoIHByb2Nlc3MgaGFzIGNvbXBsZXRlZCwgc28gd2UgY2FuIGd1YXJhbnRlZSB0aGF0IGEgc2luZ2xlIGRyYXdhYmxlIGlzXHJcbiAgLy8gcmVtb3ZlZCBmcm9tIGl0cyBwcmV2aW91cyBibG9jayBiZWZvcmUgYmVpbmcgYWRkZWQgdG8gYSBuZXcgb25lLiBUaGlzIGlzIHRha2VuIGNhcmUgb2YgaW4gYW4gdXBkYXRlRGlzcGxheSBwYXNzXHJcbiAgLy8gYWZ0ZXIgc3luY1RyZWUgLyBzdGl0Y2hpbmcuXHJcbiAgcHJpdmF0ZSBfZHJhd2FibGVzVG9DaGFuZ2VCbG9jazogRHJhd2FibGVbXTtcclxuXHJcbiAgLy8gRHJhd2FibGVzIGhhdmUgdHdvIGltcGxpY2l0IGxpbmtlZC1saXN0cywgXCJjdXJyZW50XCIgYW5kIFwib2xkXCIuIHN5bmNUcmVlIG1vZGlmaWVzIHRoZVxyXG4gIC8vIFwiY3VycmVudFwiIGxpbmtlZC1saXN0IGluZm9ybWF0aW9uIHNvIGl0IGlzIHVwLXRvLWRhdGUsIGJ1dCBuZWVkcyB0byB1c2UgdGhlIFwib2xkXCIgaW5mb3JtYXRpb24gYWxzby4gV2UgbW92ZVxyXG4gIC8vIHVwZGF0aW5nIHRoZSBcImN1cnJlbnRcIiA9PiBcIm9sZFwiIGxpbmtlZC1saXN0IGluZm9ybWF0aW9uIHVudGlsIGFmdGVyIHN5bmNUcmVlIGFuZCBzdGl0Y2hpbmcgaXMgY29tcGxldGUsIGFuZCBpc1xyXG4gIC8vIHRha2VuIGNhcmUgb2YgaW4gYW4gdXBkYXRlRGlzcGxheSBwYXNzLlxyXG4gIHByaXZhdGUgX2RyYXdhYmxlc1RvVXBkYXRlTGlua3M6IERyYXdhYmxlW107XHJcblxyXG4gIC8vIFdlIHN0b3JlIGluZm9ybWF0aW9uIG9uIHtDaGFuZ2VJbnRlcnZhbH1zIHRoYXQgcmVjb3JkcyBjaGFuZ2UgaW50ZXJ2YWxcclxuICAvLyBpbmZvcm1hdGlvbiwgdGhhdCBtYXkgY29udGFpbiByZWZlcmVuY2VzLiBXZSBkb24ndCB3YW50IHRvIGxlYXZlIHRob3NlIHJlZmVyZW5jZXMgZGFuZ2xpbmcgYWZ0ZXIgd2UgZG9uJ3QgbmVlZFxyXG4gIC8vIHRoZW0sIHNvIHRoZXkgYXJlIHJlY29yZGVkIGFuZCBjbGVhbmVkIGluIG9uZSBvZiB1cGRhdGVEaXNwbGF5J3MgcGhhc2VzLlxyXG4gIHByaXZhdGUgX2NoYW5nZUludGVydmFsc1RvRGlzcG9zZTogQ2hhbmdlSW50ZXJ2YWxbXTtcclxuXHJcbiAgcHJpdmF0ZSBfbGFzdEN1cnNvcjogc3RyaW5nIHwgbnVsbDtcclxuICBwcml2YXRlIF9jdXJyZW50QmFja2dyb3VuZENTUzogc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgcHJpdmF0ZSBfYmFja2dyb3VuZENvbG9yOiBDb2xvciB8IHN0cmluZyB8IG51bGw7XHJcblxyXG4gIC8vIFVzZWQgZm9yIHNob3J0Y3V0IGFuaW1hdGlvbiBmcmFtZSBmdW5jdGlvbnNcclxuICBwcml2YXRlIF9yZXF1ZXN0QW5pbWF0aW9uRnJhbWVJRDogbnVtYmVyO1xyXG5cclxuICAvLyBMaXN0ZW5lcnMgdGhhdCB3aWxsIGJlIGNhbGxlZCBmb3IgZXZlcnkgZXZlbnQuXHJcbiAgcHJpdmF0ZSBfaW5wdXRMaXN0ZW5lcnM6IFRJbnB1dExpc3RlbmVyW107XHJcblxyXG4gIC8vIFdoZXRoZXIgbW91c2UvdG91Y2gva2V5Ym9hcmQgaW5wdXRzIGFyZSBlbmFibGVkIChpZiBpbnB1dCBoYXMgYmVlbiBhZGRlZCkuIFNpbXVsYXRpb24gd2lsbCBzdGlsbCBzdGVwLlxyXG4gIHByaXZhdGUgX2ludGVyYWN0aXZlOiBib29sZWFuO1xyXG5cclxuICAvLyBQYXNzZWQgdGhyb3VnaCB0byBJbnB1dFxyXG4gIHByaXZhdGUgX2xpc3RlblRvT25seUVsZW1lbnQ6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBfYmF0Y2hET01FdmVudHM6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBfYXNzdW1lRnVsbFdpbmRvdzogYm9vbGVhbjtcclxuICBwcml2YXRlIF9wYXNzaXZlRXZlbnRzOiBib29sZWFuIHwgbnVsbDtcclxuXHJcbiAgLy8gT3ZlcmxheXMgY3VycmVudGx5IGJlaW5nIGRpc3BsYXllZC5cclxuICBwcml2YXRlIF9vdmVybGF5czogVE92ZXJsYXlbXTtcclxuXHJcbiAgcHJpdmF0ZSBfcG9pbnRlck92ZXJsYXk6IFBvaW50ZXJPdmVybGF5IHwgbnVsbDtcclxuICBwcml2YXRlIF9wb2ludGVyQXJlYU92ZXJsYXk6IFBvaW50ZXJBcmVhT3ZlcmxheSB8IG51bGw7XHJcbiAgcHJpdmF0ZSBfaGl0QXJlYU92ZXJsYXk6IEhpdEFyZWFPdmVybGF5IHwgbnVsbDtcclxuICBwcml2YXRlIF9jYW52YXNBcmVhQm91bmRzT3ZlcmxheTogQ2FudmFzTm9kZUJvdW5kc092ZXJsYXkgfCBudWxsO1xyXG4gIHByaXZhdGUgX2ZpdHRlZEJsb2NrQm91bmRzT3ZlcmxheTogRml0dGVkQmxvY2tCb3VuZHNPdmVybGF5IHwgbnVsbDtcclxuXHJcbiAgLy8gQGFzc2VydGlvbi1vbmx5IC0gV2hldGhlciB3ZSBhcmUgcnVubmluZyB0aGUgcGFpbnQgcGhhc2Ugb2YgdXBkYXRlRGlzcGxheSgpIGZvciB0aGlzIERpc3BsYXkuXHJcbiAgcHJpdmF0ZSBfaXNQYWludGluZz86IGJvb2xlYW47XHJcblxyXG4gIC8vIEBhc3NlcnRpb24tb25seVxyXG4gIHB1YmxpYyBfaXNEaXNwb3Npbmc/OiBib29sZWFuO1xyXG5cclxuICAvLyBAYXNzZXJ0aW9uLW9ubHkgV2hldGhlciBkaXNwb3NhbCBoYXMgc3RhcnRlZCAoYnV0IG5vdCBmaW5pc2hlZClcclxuICBwdWJsaWMgX2lzRGlzcG9zZWQ/OiBib29sZWFuO1xyXG5cclxuICAvLyBJZiBhY2Nlc3NpYmxlXHJcbiAgcHJpdmF0ZSBfZm9jdXNSb290Tm9kZT86IE5vZGU7XHJcbiAgcHJpdmF0ZSBfZm9jdXNPdmVybGF5PzogSGlnaGxpZ2h0T3ZlcmxheTtcclxuXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwsIGlmIGFjY2Vzc2libGUpXHJcbiAgcHVibGljIF9yb290UERPTUluc3RhbmNlPzogUERPTUluc3RhbmNlO1xyXG5cclxuICAvLyAoaWYgYWNjZXNzaWJsZSlcclxuICBwcml2YXRlIF9ib3VuZEhhbmRsZUZ1bGxTY3JlZW5OYXZpZ2F0aW9uPzogKCBkb21FdmVudDogS2V5Ym9hcmRFdmVudCApID0+IHZvaWQ7XHJcblxyXG4gIC8vIElmIGxvZ2dpbmcgcGVyZm9ybWFuY2VcclxuICBwcml2YXRlIHBlcmZTeW5jVHJlZUNvdW50PzogbnVtYmVyO1xyXG4gIHByaXZhdGUgcGVyZlN0aXRjaENvdW50PzogbnVtYmVyO1xyXG4gIHByaXZhdGUgcGVyZkludGVydmFsQ291bnQ/OiBudW1iZXI7XHJcbiAgcHJpdmF0ZSBwZXJmRHJhd2FibGVCbG9ja0NoYW5nZUNvdW50PzogbnVtYmVyO1xyXG4gIHByaXZhdGUgcGVyZkRyYXdhYmxlT2xkSW50ZXJ2YWxDb3VudD86IG51bWJlcjtcclxuICBwcml2YXRlIHBlcmZEcmF3YWJsZU5ld0ludGVydmFsQ291bnQ/OiBudW1iZXI7XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdHMgYSBEaXNwbGF5IHRoYXQgd2lsbCBzaG93IHRoZSByb290Tm9kZSBhbmQgaXRzIHN1YnRyZWUgaW4gYSB2aXN1YWwgc3RhdGUuIERlZmF1bHQgb3B0aW9ucyBwcm92aWRlZCBiZWxvd1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHJvb3ROb2RlIC0gRGlzcGxheXMgdGhpcyBub2RlIGFuZCBhbGwgb2YgaXRzIGRlc2NlbmRhbnRzXHJcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCByb290Tm9kZTogTm9kZSwgcHJvdmlkZWRPcHRpb25zPzogRGlzcGxheU9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByb290Tm9kZSwgJ3Jvb3ROb2RlIGlzIGEgcmVxdWlyZWQgcGFyYW1ldGVyJyApO1xyXG5cclxuICAgIC8vT0hUV08gVE9ETzogaHlicmlkIGJhdGNoaW5nIChvcHRpb24gdG8gYmF0Y2ggdW50aWwgYW4gZXZlbnQgbGlrZSAndXAnIHRoYXQgbWlnaHQgYmUgbmVlZGVkIGZvciBzZWN1cml0eSBpc3N1ZXMpXHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxEaXNwbGF5T3B0aW9ucywgU3RyaWN0T21pdDxEaXNwbGF5T3B0aW9ucywgJ2NvbnRhaW5lcic+PigpKCB7XHJcbiAgICAgIC8vIHtudW1iZXJ9IC0gSW5pdGlhbCBkaXNwbGF5IHdpZHRoXHJcbiAgICAgIHdpZHRoOiAoIHByb3ZpZGVkT3B0aW9ucyAmJiBwcm92aWRlZE9wdGlvbnMuY29udGFpbmVyICYmIHByb3ZpZGVkT3B0aW9ucy5jb250YWluZXIuY2xpZW50V2lkdGggKSB8fCA2NDAsXHJcblxyXG4gICAgICAvLyB7bnVtYmVyfSAtIEluaXRpYWwgZGlzcGxheSBoZWlnaHRcclxuICAgICAgaGVpZ2h0OiAoIHByb3ZpZGVkT3B0aW9ucyAmJiBwcm92aWRlZE9wdGlvbnMuY29udGFpbmVyICYmIHByb3ZpZGVkT3B0aW9ucy5jb250YWluZXIuY2xpZW50SGVpZ2h0ICkgfHwgNDgwLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gQXBwbGllcyBDU1Mgc3R5bGVzIHRvIHRoZSByb290IERPTSBlbGVtZW50IHRoYXQgbWFrZSBpdCBhbWVuYWJsZSB0byBpbnRlcmFjdGl2ZSBjb250ZW50XHJcbiAgICAgIGFsbG93Q1NTSGFja3M6IHRydWUsXHJcblxyXG4gICAgICBhbGxvd1NhZmFyaVJlZHJhd1dvcmthcm91bmQ6IGZhbHNlLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gVXN1YWxseSBhbnl0aGluZyBkaXNwbGF5ZWQgb3V0c2lkZSBvZiBvdXIgZG9tIGVsZW1lbnQgaXMgaGlkZGVuIHdpdGggQ1NTIG92ZXJmbG93XHJcbiAgICAgIGFsbG93U2NlbmVPdmVyZmxvdzogZmFsc2UsXHJcblxyXG4gICAgICAvLyB7c3RyaW5nfSAtIFdoYXQgY3Vyc29yIGlzIHVzZWQgd2hlbiBubyBvdGhlciBjdXJzb3IgaXMgc3BlY2lmaWVkXHJcbiAgICAgIGRlZmF1bHRDdXJzb3I6ICdkZWZhdWx0JyxcclxuXHJcbiAgICAgIC8vIHtDb2xvckRlZn0gLSBJbnRpYWwgYmFja2dyb3VuZCBjb2xvclxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IG51bGwsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBXaGV0aGVyIFdlYkdMIHdpbGwgcHJlc2VydmUgdGhlIGRyYXdpbmcgYnVmZmVyXHJcbiAgICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogZmFsc2UsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBXaGV0aGVyIFdlYkdMIGlzIGVuYWJsZWQgYXQgYWxsIGZvciBkcmF3YWJsZXMgaW4gdGhpcyBEaXNwbGF5XHJcbiAgICAgIGFsbG93V2ViR0w6IHRydWUsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBFbmFibGVzIGFjY2Vzc2liaWxpdHkgZmVhdHVyZXNcclxuICAgICAgYWNjZXNzaWJpbGl0eTogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIFNlZSBkZWNsYXJhdGlvbi5cclxuICAgICAgc3VwcG9ydHNJbnRlcmFjdGl2ZUhpZ2hsaWdodHM6IGZhbHNlLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gV2hldGhlciBtb3VzZS90b3VjaC9rZXlib2FyZCBpbnB1dHMgYXJlIGVuYWJsZWQgKGlmIGlucHV0IGhhcyBiZWVuIGFkZGVkKS5cclxuICAgICAgaW50ZXJhY3RpdmU6IHRydWUsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBJZiB0cnVlLCBpbnB1dCBldmVudCBsaXN0ZW5lcnMgd2lsbCBiZSBhdHRhY2hlZCB0byB0aGUgRGlzcGxheSdzIERPTSBlbGVtZW50IGluc3RlYWQgb2YgdGhlIHdpbmRvdy5cclxuICAgICAgLy8gTm9ybWFsbHksIGF0dGFjaGluZyBsaXN0ZW5lcnMgdG8gdGhlIHdpbmRvdyBpcyBwcmVmZXJyZWQgKGl0IHdpbGwgc2VlIG1vdXNlIG1vdmVzL3VwcyBvdXRzaWRlIG9mIHRoZSBicm93c2VyXHJcbiAgICAgIC8vIHdpbmRvdywgYWxsb3dpbmcgY29ycmVjdCBidXR0b24gdHJhY2tpbmcpLCBob3dldmVyIHRoZXJlIG1heSBiZSBpbnN0YW5jZXMgd2hlcmUgYSBnbG9iYWwgbGlzdGVuZXIgaXMgbm90XHJcbiAgICAgIC8vIHByZWZlcnJlZC5cclxuICAgICAgbGlzdGVuVG9Pbmx5RWxlbWVudDogZmFsc2UsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBGb3J3YXJkZWQgdG8gSW5wdXQ6IElmIHRydWUsIG1vc3QgZXZlbnQgdHlwZXMgd2lsbCBiZSBiYXRjaGVkIHVudGlsIG90aGVyd2lzZSB0cmlnZ2VyZWQuXHJcbiAgICAgIGJhdGNoRE9NRXZlbnRzOiBmYWxzZSxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIElmIHRydWUsIHRoZSBpbnB1dCBldmVudCBsb2NhdGlvbiAoYmFzZWQgb24gdGhlIHRvcC1sZWZ0IG9mIHRoZSBicm93c2VyIHRhYidzIHZpZXdwb3J0LCB3aXRoIG5vXHJcbiAgICAgIC8vIHNjYWxpbmcgYXBwbGllZCkgd2lsbCBiZSB1c2VkLiBVc3VhbGx5LCB0aGlzIGlzIG5vdCBhIHNhZmUgYXNzdW1wdGlvbiwgc28gd2hlbiBmYWxzZSB0aGUgbG9jYXRpb24gb2YgdGhlXHJcbiAgICAgIC8vIGRpc3BsYXkncyBET00gZWxlbWVudCB3aWxsIGJlIHVzZWQgdG8gZ2V0IHRoZSBjb3JyZWN0IGV2ZW50IGxvY2F0aW9uLiBUaGVyZSBpcyBhIHNsaWdodCBwZXJmb3JtYW5jZSBoaXQgdG9cclxuICAgICAgLy8gZG9pbmcgc28sIHRodXMgdGhpcyBvcHRpb24gaXMgcHJvdmlkZWQgaWYgdGhlIHRvcC1sZWZ0IGxvY2F0aW9uIGNhbiBiZSBndWFyYW50ZWVkLlxyXG4gICAgICAvLyBOT1RFOiBSb3RhdGlvbiBvZiB0aGUgRGlzcGxheSdzIERPTSBlbGVtZW50IChlLmcuIHdpdGggYSBDU1MgdHJhbnNmb3JtKSB3aWxsIHJlc3VsdCBpbiBhbiBpbmNvcnJlY3QgZXZlbnRcclxuICAgICAgLy8gICAgICAgbWFwcGluZywgYXMgZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkgY2FuJ3Qgd29yayB3aXRoIHRoaXMuIGdldEJveFF1YWRzKCkgc2hvdWxkIGZpeCB0aGlzIHdoZW4gYnJvd3NlclxyXG4gICAgICAvLyAgICAgICBzdXBwb3J0IGlzIGF2YWlsYWJsZS5cclxuICAgICAgYXNzdW1lRnVsbFdpbmRvdzogZmFsc2UsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBXaGV0aGVyIFNjZW5lcnkgd2lsbCB0cnkgdG8gYWdncmVzc2l2ZWx5IHJlLWNyZWF0ZSBXZWJHTCBDYW52YXMvY29udGV4dCBpbnN0ZWFkIG9mIHdhaXRpbmcgZm9yXHJcbiAgICAgIC8vIGEgY29udGV4dCByZXN0b3JlZCBldmVudC4gU29tZXRpbWVzIGNvbnRleHQgbG9zc2VzIGNhbiBvY2N1ciB3aXRob3V0IGEgcmVzdG9yYXRpb24gYWZ0ZXJ3YXJkcywgYnV0IHRoaXMgY2FuXHJcbiAgICAgIC8vIGp1bXAtc3RhcnQgdGhlIHByb2Nlc3MuXHJcbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMzQ3LlxyXG4gICAgICBhZ2dyZXNzaXZlQ29udGV4dFJlY3JlYXRpb246IHRydWUsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbnxudWxsfSAtIFdoZXRoZXIgdGhlIGBwYXNzaXZlYCBmbGFnIHNob3VsZCBiZSBzZXQgd2hlbiBhZGRpbmcgYW5kIHJlbW92aW5nIERPTSBldmVudCBsaXN0ZW5lcnMuXHJcbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNzcwIGZvciBtb3JlIGRldGFpbHMuXHJcbiAgICAgIC8vIElmIGl0IGlzIHRydWUgb3IgZmFsc2UsIHRoYXQgaXMgdGhlIHZhbHVlIG9mIHRoZSBwYXNzaXZlIGZsYWcgdGhhdCB3aWxsIGJlIHVzZWQuIElmIGl0IGlzIG51bGwsIHRoZSBkZWZhdWx0XHJcbiAgICAgIC8vIGJlaGF2aW9yIG9mIHRoZSBicm93c2VyIHdpbGwgYmUgdXNlZC5cclxuICAgICAgLy9cclxuICAgICAgLy8gU2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCB0b3VjaC1hY3Rpb246IG5vbmUsIHNvIHdlIE5FRUQgdG8gbm90IHVzZSBwYXNzaXZlIGV2ZW50cyAod2hpY2ggd291bGQgbm90IGFsbG93XHJcbiAgICAgIC8vIHByZXZlbnREZWZhdWx0IHRvIGRvIGFueXRoaW5nLCBzbyBkcmFncyBhY3R1YWxseSBjYW4gc2Nyb2xsIHRoZSBzaW0pLlxyXG4gICAgICAvLyBDaHJvbWUgYWxzbyBkaWQgdGhlIHNhbWUgXCJwYXNzaXZlIGJ5IGRlZmF1bHRcIiwgYnV0IGJlY2F1c2Ugd2UgaGF2ZSBgdG91Y2gtYWN0aW9uOiBub25lYCBpbiBwbGFjZSwgaXQgZG9lc24ndFxyXG4gICAgICAvLyBhZmZlY3QgdXMsIGFuZCB3ZSBjYW4gcG90ZW50aWFsbHkgZ2V0IHBlcmZvcm1hbmNlIGltcHJvdmVtZW50cyBieSBhbGxvd2luZyBwYXNzaXZlIGV2ZW50cy5cclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy83NzAgZm9yIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAgICAgIHBhc3NpdmVFdmVudHM6IHBsYXRmb3JtLnNhZmFyaSA/IGZhbHNlIDogbnVsbCxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIFdoZXRoZXIsIGlmIG5vIFdlYkdMIGFudGlhbGlhc2luZyBpcyBkZXRlY3RlZCwgdGhlIGJhY2tpbmcgc2NhbGUgY2FuIGJlIGluY3JlYXNlZCBzbyBhcyB0b1xyXG4gICAgICAvLyAgICAgICAgICAgICBwcm92aWRlIHNvbWUgYW50aWFsaWFzaW5nIGJlbmVmaXQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODU5LlxyXG4gICAgICBhbGxvd0JhY2tpbmdTY2FsZUFudGlhbGlhc2luZzogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUSU9OQUxcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuaWQgPSBnbG9iYWxJZENvdW50ZXIrKztcclxuXHJcbiAgICB0aGlzLl9hY2Nlc3NpYmxlID0gb3B0aW9ucy5hY2Nlc3NpYmlsaXR5O1xyXG4gICAgdGhpcy5fcHJlc2VydmVEcmF3aW5nQnVmZmVyID0gb3B0aW9ucy5wcmVzZXJ2ZURyYXdpbmdCdWZmZXI7XHJcbiAgICB0aGlzLl9hbGxvd1dlYkdMID0gb3B0aW9ucy5hbGxvd1dlYkdMO1xyXG4gICAgdGhpcy5fYWxsb3dDU1NIYWNrcyA9IG9wdGlvbnMuYWxsb3dDU1NIYWNrcztcclxuICAgIHRoaXMuX2FsbG93U2NlbmVPdmVyZmxvdyA9IG9wdGlvbnMuYWxsb3dTY2VuZU92ZXJmbG93O1xyXG5cclxuICAgIHRoaXMuX2RlZmF1bHRDdXJzb3IgPSBvcHRpb25zLmRlZmF1bHRDdXJzb3I7XHJcblxyXG4gICAgdGhpcy5zaXplUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCBuZXcgRGltZW5zaW9uMiggb3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQgKSApO1xyXG5cclxuICAgIHRoaXMuX2N1cnJlbnRTaXplID0gbmV3IERpbWVuc2lvbjIoIC0xLCAtMSApO1xyXG4gICAgdGhpcy5fcm9vdE5vZGUgPSByb290Tm9kZTtcclxuICAgIHRoaXMuX3Jvb3ROb2RlLmFkZFJvb3RlZERpc3BsYXkoIHRoaXMgKTtcclxuICAgIHRoaXMuX3Jvb3RCYWNrYm9uZSA9IG51bGw7IC8vIHRvIGJlIGZpbGxlZCBpbiBsYXRlclxyXG4gICAgdGhpcy5fZG9tRWxlbWVudCA9IG9wdGlvbnMuY29udGFpbmVyID9cclxuICAgICAgICAgICAgICAgICAgICAgICBCYWNrYm9uZURyYXdhYmxlLnJlcHVycG9zZUJhY2tib25lQ29udGFpbmVyKCBvcHRpb25zLmNvbnRhaW5lciApIDpcclxuICAgICAgICAgICAgICAgICAgICAgICBCYWNrYm9uZURyYXdhYmxlLmNyZWF0ZURpdkJhY2tib25lKCk7XHJcblxyXG4gICAgdGhpcy5fc2hhcmVkQ2FudmFzSW5zdGFuY2VzID0ge307XHJcbiAgICB0aGlzLl9iYXNlSW5zdGFuY2UgPSBudWxsOyAvLyB3aWxsIGJlIGZpbGxlZCB3aXRoIHRoZSByb290IEluc3RhbmNlXHJcbiAgICB0aGlzLl9mcmFtZUlkID0gMDtcclxuICAgIHRoaXMuX2RpcnR5VHJhbnNmb3JtUm9vdHMgPSBbXTtcclxuICAgIHRoaXMuX2RpcnR5VHJhbnNmb3JtUm9vdHNXaXRob3V0UGFzcyA9IFtdO1xyXG4gICAgdGhpcy5faW5zdGFuY2VSb290c1RvRGlzcG9zZSA9IFtdO1xyXG4gICAgdGhpcy5fcmVkdWNlUmVmZXJlbmNlc05lZWRlZCA9IFtdO1xyXG4gICAgdGhpcy5fZHJhd2FibGVzVG9EaXNwb3NlID0gW107XHJcbiAgICB0aGlzLl9kcmF3YWJsZXNUb0NoYW5nZUJsb2NrID0gW107XHJcbiAgICB0aGlzLl9kcmF3YWJsZXNUb1VwZGF0ZUxpbmtzID0gW107XHJcbiAgICB0aGlzLl9jaGFuZ2VJbnRlcnZhbHNUb0Rpc3Bvc2UgPSBbXTtcclxuICAgIHRoaXMuX2xhc3RDdXJzb3IgPSBudWxsO1xyXG4gICAgdGhpcy5fY3VycmVudEJhY2tncm91bmRDU1MgPSBudWxsO1xyXG4gICAgdGhpcy5fYmFja2dyb3VuZENvbG9yID0gbnVsbDtcclxuICAgIHRoaXMuX3JlcXVlc3RBbmltYXRpb25GcmFtZUlEID0gMDtcclxuICAgIHRoaXMuX2lucHV0ID0gbnVsbDtcclxuICAgIHRoaXMuX2lucHV0TGlzdGVuZXJzID0gW107XHJcbiAgICB0aGlzLl9pbnRlcmFjdGl2ZSA9IG9wdGlvbnMuaW50ZXJhY3RpdmU7XHJcbiAgICB0aGlzLl9saXN0ZW5Ub09ubHlFbGVtZW50ID0gb3B0aW9ucy5saXN0ZW5Ub09ubHlFbGVtZW50O1xyXG4gICAgdGhpcy5fYmF0Y2hET01FdmVudHMgPSBvcHRpb25zLmJhdGNoRE9NRXZlbnRzO1xyXG4gICAgdGhpcy5fYXNzdW1lRnVsbFdpbmRvdyA9IG9wdGlvbnMuYXNzdW1lRnVsbFdpbmRvdztcclxuICAgIHRoaXMuX3Bhc3NpdmVFdmVudHMgPSBvcHRpb25zLnBhc3NpdmVFdmVudHM7XHJcbiAgICB0aGlzLl9hZ2dyZXNzaXZlQ29udGV4dFJlY3JlYXRpb24gPSBvcHRpb25zLmFnZ3Jlc3NpdmVDb250ZXh0UmVjcmVhdGlvbjtcclxuICAgIHRoaXMuX2FsbG93QmFja2luZ1NjYWxlQW50aWFsaWFzaW5nID0gb3B0aW9ucy5hbGxvd0JhY2tpbmdTY2FsZUFudGlhbGlhc2luZztcclxuICAgIHRoaXMuX292ZXJsYXlzID0gW107XHJcbiAgICB0aGlzLl9wb2ludGVyT3ZlcmxheSA9IG51bGw7XHJcbiAgICB0aGlzLl9wb2ludGVyQXJlYU92ZXJsYXkgPSBudWxsO1xyXG4gICAgdGhpcy5faGl0QXJlYU92ZXJsYXkgPSBudWxsO1xyXG4gICAgdGhpcy5fY2FudmFzQXJlYUJvdW5kc092ZXJsYXkgPSBudWxsO1xyXG4gICAgdGhpcy5fZml0dGVkQmxvY2tCb3VuZHNPdmVybGF5ID0gbnVsbDtcclxuXHJcbiAgICBpZiAoIGFzc2VydCApIHtcclxuICAgICAgdGhpcy5faXNQYWludGluZyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLl9pc0Rpc3Bvc2luZyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hcHBseUNTU0hhY2tzKCk7XHJcblxyXG4gICAgdGhpcy5zZXRCYWNrZ3JvdW5kQ29sb3IoIG9wdGlvbnMuYmFja2dyb3VuZENvbG9yICk7XHJcblxyXG4gICAgY29uc3QgYXJpYUxpdmVBbm5vdW5jZXIgPSBuZXcgQXJpYUxpdmVBbm5vdW5jZXIoKTtcclxuICAgIHRoaXMuZGVzY3JpcHRpb25VdHRlcmFuY2VRdWV1ZSA9IG5ldyBVdHRlcmFuY2VRdWV1ZSggYXJpYUxpdmVBbm5vdW5jZXIsIHtcclxuICAgICAgaW5pdGlhbGl6ZTogdGhpcy5fYWNjZXNzaWJsZSxcclxuICAgICAgZmVhdHVyZVNwZWNpZmljQW5ub3VuY2luZ0NvbnRyb2xQcm9wZXJ0eU5hbWU6ICdkZXNjcmlwdGlvbkNhbkFubm91bmNlUHJvcGVydHknXHJcbiAgICB9ICk7XHJcblxyXG4gICAgaWYgKCBwbGF0Zm9ybS5zYWZhcmkgJiYgb3B0aW9ucy5hbGxvd1NhZmFyaVJlZHJhd1dvcmthcm91bmQgKSB7XHJcbiAgICAgIHRoaXMuYWRkT3ZlcmxheSggbmV3IFNhZmFyaVdvcmthcm91bmRPdmVybGF5KCB0aGlzICkgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmZvY3VzTWFuYWdlciA9IG5ldyBGb2N1c01hbmFnZXIoKTtcclxuXHJcbiAgICAvLyBGZWF0dXJlcyB0aGF0IHJlcXVpcmUgdGhlIEhpZ2hsaWdodE92ZXJsYXlcclxuICAgIGlmICggdGhpcy5fYWNjZXNzaWJsZSB8fCBvcHRpb25zLnN1cHBvcnRzSW50ZXJhY3RpdmVIaWdobGlnaHRzICkge1xyXG4gICAgICB0aGlzLl9mb2N1c1Jvb3ROb2RlID0gbmV3IE5vZGUoKTtcclxuICAgICAgdGhpcy5fZm9jdXNPdmVybGF5ID0gbmV3IEhpZ2hsaWdodE92ZXJsYXkoIHRoaXMsIHRoaXMuX2ZvY3VzUm9vdE5vZGUsIHtcclxuICAgICAgICBwZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5OiB0aGlzLmZvY3VzTWFuYWdlci5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICAgIGludGVyYWN0aXZlSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eTogdGhpcy5mb2N1c01hbmFnZXIuaW50ZXJhY3RpdmVIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICAgIHJlYWRpbmdCbG9ja0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHk6IHRoaXMuZm9jdXNNYW5hZ2VyLnJlYWRpbmdCbG9ja0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHlcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmFkZE92ZXJsYXkoIHRoaXMuX2ZvY3VzT3ZlcmxheSApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy5fYWNjZXNzaWJsZSApIHtcclxuICAgICAgdGhpcy5fcm9vdFBET01JbnN0YW5jZSA9IFBET01JbnN0YW5jZS5wb29sLmNyZWF0ZSggbnVsbCwgdGhpcywgbmV3IFRyYWlsKCkgKTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZShcclxuICAgICAgICBgRGlzcGxheSByb290IGluc3RhbmNlOiAke3RoaXMuX3Jvb3RQRE9NSW5zdGFuY2UudG9TdHJpbmcoKX1gICk7XHJcbiAgICAgIFBET01UcmVlLnJlYnVpbGRJbnN0YW5jZVRyZWUoIHRoaXMuX3Jvb3RQRE9NSW5zdGFuY2UgKTtcclxuXHJcbiAgICAgIC8vIGFkZCB0aGUgYWNjZXNzaWJsZSBET00gYXMgYSBjaGlsZCBvZiB0aGlzIERPTSBlbGVtZW50XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3Jvb3RQRE9NSW5zdGFuY2UucGVlciwgJ1BlZXIgc2hvdWxkIGJlIGNyZWF0ZWQgZnJvbSBjcmVhdGVGcm9tUG9vbCcgKTtcclxuICAgICAgdGhpcy5fZG9tRWxlbWVudC5hcHBlbmRDaGlsZCggdGhpcy5fcm9vdFBET01JbnN0YW5jZS5wZWVyIS5wcmltYXJ5U2libGluZyEgKTtcclxuXHJcbiAgICAgIGNvbnN0IGFyaWFMaXZlQ29udGFpbmVyID0gYXJpYUxpdmVBbm5vdW5jZXIuYXJpYUxpdmVDb250YWluZXI7XHJcblxyXG4gICAgICAvLyBhZGQgYXJpYS1saXZlIGVsZW1lbnRzIHRvIHRoZSBkaXNwbGF5XHJcbiAgICAgIHRoaXMuX2RvbUVsZW1lbnQuYXBwZW5kQ2hpbGQoIGFyaWFMaXZlQ29udGFpbmVyICk7XHJcblxyXG4gICAgICAvLyBzZXQgYHVzZXItc2VsZWN0OiBub25lYCBvbiB0aGUgYXJpYS1saXZlIGNvbnRhaW5lciB0byBwcmV2ZW50IGlPUyB0ZXh0IHNlbGVjdGlvbiBpc3N1ZSwgc2VlXHJcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMDA2XHJcbiAgICAgIGFyaWFMaXZlQ29udGFpbmVyLnN0eWxlWyBGZWF0dXJlcy51c2VyU2VsZWN0IF0gPSAnbm9uZSc7XHJcblxyXG4gICAgICAvLyBQcmV2ZW50IGZvY3VzIGZyb20gYmVpbmcgbG9zdCBpbiBGdWxsU2NyZWVuIG1vZGUsIGxpc3RlbmVyIG9uIHRoZSBnbG9iYWxLZXlTdGF0ZVRyYWNrZXJcclxuICAgICAgLy8gYmVjYXVzZSB0YWIgbmF2aWdhdGlvbiBtYXkgaGFwcGVuIGJlZm9yZSBmb2N1cyBpcyB3aXRoaW4gdGhlIFBET00uIFNlZSBoYW5kbGVGdWxsU2NyZWVuTmF2aWdhdGlvblxyXG4gICAgICAvLyBmb3IgbW9yZS5cclxuICAgICAgdGhpcy5fYm91bmRIYW5kbGVGdWxsU2NyZWVuTmF2aWdhdGlvbiA9IHRoaXMuaGFuZGxlRnVsbFNjcmVlbk5hdmlnYXRpb24uYmluZCggdGhpcyApO1xyXG4gICAgICBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIua2V5ZG93bkVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuX2JvdW5kSGFuZGxlRnVsbFNjcmVlbk5hdmlnYXRpb24gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRET01FbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcclxuICAgIHJldHVybiB0aGlzLl9kb21FbGVtZW50O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBkb21FbGVtZW50KCk6IEhUTUxFbGVtZW50IHsgcmV0dXJuIHRoaXMuZ2V0RE9NRWxlbWVudCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIGRpc3BsYXkncyBET00gZWxlbWVudCB3aXRoIHRoZSBjdXJyZW50IHZpc3VhbCBzdGF0ZSBvZiB0aGUgYXR0YWNoZWQgcm9vdCBub2RlIGFuZCBpdHMgZGVzY2VuZGFudHNcclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlRGlzcGxheSgpOiB2b2lkIHtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3Igc2NlbmVyeSBuYW1lc3BhY2VcclxuICAgIGlmICggc2NlbmVyeUxvZyAmJiBzY2VuZXJ5LmlzTG9nZ2luZ1BlcmZvcm1hbmNlKCkgKSB7XHJcbiAgICAgIHRoaXMucGVyZlN5bmNUcmVlQ291bnQgPSAwO1xyXG4gICAgICB0aGlzLnBlcmZTdGl0Y2hDb3VudCA9IDA7XHJcbiAgICAgIHRoaXMucGVyZkludGVydmFsQ291bnQgPSAwO1xyXG4gICAgICB0aGlzLnBlcmZEcmF3YWJsZUJsb2NrQ2hhbmdlQ291bnQgPSAwO1xyXG4gICAgICB0aGlzLnBlcmZEcmF3YWJsZU9sZEludGVydmFsQ291bnQgPSAwO1xyXG4gICAgICB0aGlzLnBlcmZEcmF3YWJsZU5ld0ludGVydmFsQ291bnQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICBEaXNwbGF5LmFzc2VydFN1YnRyZWVEaXNwb3NlZCggdGhpcy5fcm9vdE5vZGUgKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRGlzcGxheSAmJiBzY2VuZXJ5TG9nLkRpc3BsYXkoIGB1cGRhdGVEaXNwbGF5IGZyYW1lICR7dGhpcy5fZnJhbWVJZH1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRGlzcGxheSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBjb25zdCBmaXJzdFJ1biA9ICEhdGhpcy5fYmFzZUluc3RhbmNlO1xyXG5cclxuICAgIC8vIGNoZWNrIHRvIHNlZSB3aGV0aGVyIGNvbnRlbnRzIHVuZGVyIHBvaW50ZXJzIGNoYW5nZWQgKGFuZCBpZiBzbywgc2VuZCB0aGUgZW50ZXIvZXhpdCBldmVudHMpIHRvXHJcbiAgICAvLyBtYWludGFpbiBjb25zaXN0ZW50IHN0YXRlXHJcbiAgICBpZiAoIHRoaXMuX2lucHV0ICkge1xyXG4gICAgICAvLyBUT0RPOiBTaG91bGQgdGhpcyBiZSBoYW5kbGVkIGVsc2V3aGVyZT9cclxuICAgICAgdGhpcy5faW5wdXQudmFsaWRhdGVQb2ludGVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy5fYWNjZXNzaWJsZSApIHtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSBwb3NpdGlvbmluZyBvZiBmb2N1c2FibGUgcGVlciBzaWJsaW5ncyBzbyB0aGV5IGFyZSBkaXNjb3ZlcmFibGUgb24gbW9iaWxlIGFzc2lzdGl2ZSBkZXZpY2VzXHJcbiAgICAgIHRoaXMuX3Jvb3RQRE9NSW5zdGFuY2UhLnBlZXIhLnVwZGF0ZVN1YnRyZWVQb3NpdGlvbmluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHZhbGlkYXRlIGJvdW5kcyBmb3IgZXZlcnl3aGVyZSB0aGF0IGNvdWxkIHRyaWdnZXIgYm91bmRzIGxpc3RlbmVycy4gd2Ugd2FudCB0byBmbHVzaCBvdXQgYW55IGNoYW5nZXMsIHNvIHRoYXQgd2UgY2FuIGNhbGwgdmFsaWRhdGVCb3VuZHMoKVxyXG4gICAgLy8gZnJvbSBjb2RlIGJlbG93IHdpdGhvdXQgdHJpZ2dlcmluZyBzaWRlIGVmZmVjdHMgKHdlIGFzc3VtZSB0aGF0IHdlIGFyZSBub3QgcmVlbnRyYW50KS5cclxuICAgIHRoaXMuX3Jvb3ROb2RlLnZhbGlkYXRlV2F0Y2hlZEJvdW5kcygpO1xyXG5cclxuICAgIGlmICggYXNzZXJ0U2xvdyApIHsgdGhpcy5fYWNjZXNzaWJsZSAmJiB0aGlzLl9yb290UERPTUluc3RhbmNlIS5hdWRpdFJvb3QoKTsgfVxyXG5cclxuICAgIGlmICggYXNzZXJ0U2xvdyApIHsgdGhpcy5fcm9vdE5vZGUuX3BpY2tlci5hdWRpdCgpOyB9XHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPIEluc3RhbmNlXHJcbiAgICB0aGlzLl9iYXNlSW5zdGFuY2UgPSB0aGlzLl9iYXNlSW5zdGFuY2UgfHwgSW5zdGFuY2UuY3JlYXRlRnJvbVBvb2woIHRoaXMsIG5ldyBUcmFpbCggdGhpcy5fcm9vdE5vZGUgKSwgdHJ1ZSwgZmFsc2UgKTtcclxuICAgIHRoaXMuX2Jhc2VJbnN0YW5jZSEuYmFzZVN5bmNUcmVlKCk7XHJcbiAgICBpZiAoIGZpcnN0UnVuICkge1xyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE8gaW5zdGFuY2VcclxuICAgICAgdGhpcy5tYXJrVHJhbnNmb3JtUm9vdERpcnR5KCB0aGlzLl9iYXNlSW5zdGFuY2UhLCB0aGlzLl9iYXNlSW5zdGFuY2UhLmlzVHJhbnNmb3JtZWQgKTsgLy8gbWFya3MgdGhlIHRyYW5zZm9ybSByb290IGFzIGRpcnR5IChzaW5jZSBpdCBpcylcclxuICAgIH1cclxuXHJcbiAgICAvLyB1cGRhdGUgb3VyIGRyYXdhYmxlJ3MgbGlua2VkIGxpc3RzIHdoZXJlIG5lY2Vzc2FyeVxyXG4gICAgd2hpbGUgKCB0aGlzLl9kcmF3YWJsZXNUb1VwZGF0ZUxpbmtzLmxlbmd0aCApIHtcclxuICAgICAgdGhpcy5fZHJhd2FibGVzVG9VcGRhdGVMaW5rcy5wb3AoKSEudXBkYXRlTGlua3MoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjbGVhbiBjaGFuZ2UtaW50ZXJ2YWwgaW5mb3JtYXRpb24gZnJvbSBpbnN0YW5jZXMsIHNvIHdlIGRvbid0IGxlYWsgbWVtb3J5L3JlZmVyZW5jZXNcclxuICAgIHdoaWxlICggdGhpcy5fY2hhbmdlSW50ZXJ2YWxzVG9EaXNwb3NlLmxlbmd0aCApIHtcclxuICAgICAgdGhpcy5fY2hhbmdlSW50ZXJ2YWxzVG9EaXNwb3NlLnBvcCgpIS5kaXNwb3NlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fcm9vdEJhY2tib25lID0gdGhpcy5fcm9vdEJhY2tib25lIHx8IHRoaXMuX2Jhc2VJbnN0YW5jZSEuZ3JvdXBEcmF3YWJsZTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3Jvb3RCYWNrYm9uZSwgJ1dlIGFyZSBndWFyYW50ZWVkIGEgcm9vdCBiYWNrYm9uZSBhcyB0aGUgZ3JvdXBEcmF3YWJsZSBvbiB0aGUgYmFzZSBpbnN0YW5jZScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3Jvb3RCYWNrYm9uZSA9PT0gdGhpcy5fYmFzZUluc3RhbmNlIS5ncm91cERyYXdhYmxlLCAnV2UgZG9uXFwndCB3YW50IHRoZSBiYXNlIGluc3RhbmNlXFwncyBncm91cERyYXdhYmxlIHRvIGNoYW5nZScgKTtcclxuXHJcblxyXG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9yb290QmFja2JvbmUhLmF1ZGl0KCB0cnVlLCBmYWxzZSwgdHJ1ZSApOyB9IC8vIGFsbG93IHBlbmRpbmcgYmxvY2tzIC8gZGlydHlcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRGlzcGxheSAmJiBzY2VuZXJ5TG9nLkRpc3BsYXkoICdkcmF3YWJsZSBibG9jayBjaGFuZ2UgcGhhc2UnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRGlzcGxheSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuICAgIHdoaWxlICggdGhpcy5fZHJhd2FibGVzVG9DaGFuZ2VCbG9jay5sZW5ndGggKSB7XHJcbiAgICAgIGNvbnN0IGNoYW5nZWQgPSB0aGlzLl9kcmF3YWJsZXNUb0NoYW5nZUJsb2NrLnBvcCgpIS51cGRhdGVCbG9jaygpO1xyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHNjZW5lcnkgbmFtZXNwYWNlXHJcbiAgICAgIGlmICggc2NlbmVyeUxvZyAmJiBzY2VuZXJ5LmlzTG9nZ2luZ1BlcmZvcm1hbmNlKCkgJiYgY2hhbmdlZCApIHtcclxuICAgICAgICB0aGlzLnBlcmZEcmF3YWJsZUJsb2NrQ2hhbmdlQ291bnQhKys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EaXNwbGF5ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcblxyXG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9yb290QmFja2JvbmUhLmF1ZGl0KCBmYWxzZSwgZmFsc2UsIHRydWUgKTsgfSAvLyBhbGxvdyBvbmx5IGRpcnR5XHJcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7IHRoaXMuX2Jhc2VJbnN0YW5jZSEuYXVkaXQoIHRoaXMuX2ZyYW1lSWQsIGZhbHNlICk7IH1cclxuXHJcbiAgICAvLyBwcmUtcmVwYWludCBwaGFzZTogdXBkYXRlIHJlbGF0aXZlIHRyYW5zZm9ybSBpbmZvcm1hdGlvbiBmb3IgbGlzdGVuZXJzIChub3RpZmljYXRpb24pIGFuZCBwcmVjb21wdXRhdGlvbiB3aGVyZSBkZXNpcmVkXHJcbiAgICB0aGlzLnVwZGF0ZURpcnR5VHJhbnNmb3JtUm9vdHMoKTtcclxuICAgIC8vIHByZS1yZXBhaW50IHBoYXNlIHVwZGF0ZSB2aXNpYmlsaXR5IGluZm9ybWF0aW9uIG9uIGluc3RhbmNlc1xyXG4gICAgdGhpcy5fYmFzZUluc3RhbmNlIS51cGRhdGVWaXNpYmlsaXR5KCB0cnVlLCB0cnVlLCB0cnVlLCBmYWxzZSApO1xyXG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9iYXNlSW5zdGFuY2UhLmF1ZGl0VmlzaWJpbGl0eSggdHJ1ZSApOyB9XHJcblxyXG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9iYXNlSW5zdGFuY2UhLmF1ZGl0KCB0aGlzLl9mcmFtZUlkLCB0cnVlICk7IH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRGlzcGxheSAmJiBzY2VuZXJ5TG9nLkRpc3BsYXkoICdpbnN0YW5jZSByb290IGRpc3Bvc2FsIHBoYXNlJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRpc3BsYXkgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcbiAgICAvLyBkaXNwb3NlIGFsbCBvZiBvdXIgaW5zdGFuY2VzLiBkaXNwb3NpbmcgdGhlIHJvb3Qgd2lsbCBjYXVzZSBhbGwgZGVzY2VuZGFudHMgdG8gYWxzbyBiZSBkaXNwb3NlZC5cclxuICAgIC8vIHdpbGwgYWxzbyBkaXNwb3NlIGF0dGFjaGVkIGRyYXdhYmxlcyAoc2VsZi9ncm91cC9ldGMuKVxyXG4gICAgd2hpbGUgKCB0aGlzLl9pbnN0YW5jZVJvb3RzVG9EaXNwb3NlLmxlbmd0aCApIHtcclxuICAgICAgdGhpcy5faW5zdGFuY2VSb290c1RvRGlzcG9zZS5wb3AoKSEuZGlzcG9zZSgpO1xyXG4gICAgfVxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRpc3BsYXkgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuXHJcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7IHRoaXMuX3Jvb3ROb2RlLmF1ZGl0SW5zdGFuY2VTdWJ0cmVlRm9yRGlzcGxheSggdGhpcyApOyB9IC8vIG1ha2Ugc3VyZSB0cmFpbHMgYXJlIHZhbGlkXHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRpc3BsYXkgJiYgc2NlbmVyeUxvZy5EaXNwbGF5KCAnZHJhd2FibGUgZGlzcG9zYWwgcGhhc2UnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRGlzcGxheSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuICAgIC8vIGRpc3Bvc2UgYWxsIG9mIG91ciBvdGhlciBkcmF3YWJsZXMuXHJcbiAgICB3aGlsZSAoIHRoaXMuX2RyYXdhYmxlc1RvRGlzcG9zZS5sZW5ndGggKSB7XHJcbiAgICAgIHRoaXMuX2RyYXdhYmxlc1RvRGlzcG9zZS5wb3AoKSEuZGlzcG9zZSgpO1xyXG4gICAgfVxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRpc3BsYXkgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuXHJcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7IHRoaXMuX2Jhc2VJbnN0YW5jZSEuYXVkaXQoIHRoaXMuX2ZyYW1lSWQsIGZhbHNlICk7IH1cclxuXHJcbiAgICBpZiAoIGFzc2VydCApIHtcclxuICAgICAgYXNzZXJ0KCAhdGhpcy5faXNQYWludGluZywgJ0Rpc3BsYXkgd2FzIGFscmVhZHkgdXBkYXRpbmcgcGFpbnQsIG1heSBoYXZlIHRocm93biBhbiBlcnJvciBvbiB0aGUgbGFzdCB1cGRhdGUnICk7XHJcbiAgICAgIHRoaXMuX2lzUGFpbnRpbmcgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlcGFpbnQgcGhhc2VcclxuICAgIC8vT0hUV08gVE9ETzogY2FuIGFueXRoaW5nIGJlIHVwZGF0ZWQgbW9yZSBlZmZpY2llbnRseSBieSB0cmFja2luZyBhdCB0aGUgRGlzcGxheSBsZXZlbD8gUmVtZW1iZXIsIHdlIGhhdmUgcmVjdXJzaXZlIHVwZGF0ZXMgc28gdGhpbmdzIGdldCB1cGRhdGVkIGluIHRoZSByaWdodCBvcmRlciFcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EaXNwbGF5ICYmIHNjZW5lcnlMb2cuRGlzcGxheSggJ3JlcGFpbnQgcGhhc2UnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRGlzcGxheSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuICAgIHRoaXMuX3Jvb3RCYWNrYm9uZSEudXBkYXRlKCk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRGlzcGxheSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG5cclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICB0aGlzLl9pc1BhaW50aW5nID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9yb290QmFja2JvbmUhLmF1ZGl0KCBmYWxzZSwgZmFsc2UsIGZhbHNlICk7IH0gLy8gYWxsb3cgbm90aGluZ1xyXG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9iYXNlSW5zdGFuY2UhLmF1ZGl0KCB0aGlzLl9mcmFtZUlkLCBmYWxzZSApOyB9XHJcblxyXG4gICAgdGhpcy51cGRhdGVDdXJzb3IoKTtcclxuICAgIHRoaXMudXBkYXRlQmFja2dyb3VuZENvbG9yKCk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVTaXplKCk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9vdmVybGF5cy5sZW5ndGggKSB7XHJcbiAgICAgIGxldCB6SW5kZXggPSB0aGlzLl9yb290QmFja2JvbmUhLmxhc3RaSW5kZXghO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9vdmVybGF5cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAvLyBsYXllciB0aGUgb3ZlcmxheXMgcHJvcGVybHlcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gdGhpcy5fb3ZlcmxheXNbIGkgXTtcclxuICAgICAgICBvdmVybGF5LmRvbUVsZW1lbnQuc3R5bGUuekluZGV4ID0gJycgKyAoIHpJbmRleCsrICk7XHJcblxyXG4gICAgICAgIG92ZXJsYXkudXBkYXRlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBBZnRlciBvdXIgdXBkYXRlIGFuZCBkaXNwb3NhbHMsIHdlIHdhbnQgdG8gZWxpbWluYXRlIGFueSBtZW1vcnkgbGVha3MgZnJvbSBhbnl0aGluZyB0aGF0IHdhc24ndCB1cGRhdGVkLlxyXG4gICAgd2hpbGUgKCB0aGlzLl9yZWR1Y2VSZWZlcmVuY2VzTmVlZGVkLmxlbmd0aCApIHtcclxuICAgICAgdGhpcy5fcmVkdWNlUmVmZXJlbmNlc05lZWRlZC5wb3AoKSEucmVkdWNlUmVmZXJlbmNlcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2ZyYW1lSWQrKztcclxuXHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE8gc2NlbmVyeSBuYW1lc3BhY2VcclxuICAgIGlmICggc2NlbmVyeUxvZyAmJiBzY2VuZXJ5LmlzTG9nZ2luZ1BlcmZvcm1hbmNlKCkgKSB7XHJcbiAgICAgIGNvbnN0IHN5bmNUcmVlTWVzc2FnZSA9IGBzeW5jVHJlZSBjb3VudDogJHt0aGlzLnBlcmZTeW5jVHJlZUNvdW50fWA7XHJcbiAgICAgIGlmICggdGhpcy5wZXJmU3luY1RyZWVDb3VudCEgPiA1MDAgKSB7XHJcbiAgICAgICAgc2NlbmVyeUxvZy5QZXJmQ3JpdGljYWwgJiYgc2NlbmVyeUxvZy5QZXJmQ3JpdGljYWwoIHN5bmNUcmVlTWVzc2FnZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLnBlcmZTeW5jVHJlZUNvdW50ISA+IDEwMCApIHtcclxuICAgICAgICBzY2VuZXJ5TG9nLlBlcmZNYWpvciAmJiBzY2VuZXJ5TG9nLlBlcmZNYWpvciggc3luY1RyZWVNZXNzYWdlICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHRoaXMucGVyZlN5bmNUcmVlQ291bnQhID4gMjAgKSB7XHJcbiAgICAgICAgc2NlbmVyeUxvZy5QZXJmTWlub3IgJiYgc2NlbmVyeUxvZy5QZXJmTWlub3IoIHN5bmNUcmVlTWVzc2FnZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLnBlcmZTeW5jVHJlZUNvdW50ISA+IDAgKSB7XHJcbiAgICAgICAgc2NlbmVyeUxvZy5QZXJmVmVyYm9zZSAmJiBzY2VuZXJ5TG9nLlBlcmZWZXJib3NlKCBzeW5jVHJlZU1lc3NhZ2UgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZHJhd2FibGVCbG9ja0NvdW50TWVzc2FnZSA9IGBkcmF3YWJsZSBibG9jayBjaGFuZ2VzOiAke3RoaXMucGVyZkRyYXdhYmxlQmxvY2tDaGFuZ2VDb3VudH0gZm9yYCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgIC0ke3RoaXMucGVyZkRyYXdhYmxlT2xkSW50ZXJ2YWxDb3VudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSArJHt0aGlzLnBlcmZEcmF3YWJsZU5ld0ludGVydmFsQ291bnR9YDtcclxuICAgICAgaWYgKCB0aGlzLnBlcmZEcmF3YWJsZUJsb2NrQ2hhbmdlQ291bnQhID4gMjAwICkge1xyXG4gICAgICAgIHNjZW5lcnlMb2cuUGVyZkNyaXRpY2FsICYmIHNjZW5lcnlMb2cuUGVyZkNyaXRpY2FsKCBkcmF3YWJsZUJsb2NrQ291bnRNZXNzYWdlICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHRoaXMucGVyZkRyYXdhYmxlQmxvY2tDaGFuZ2VDb3VudCEgPiA2MCApIHtcclxuICAgICAgICBzY2VuZXJ5TG9nLlBlcmZNYWpvciAmJiBzY2VuZXJ5TG9nLlBlcmZNYWpvciggZHJhd2FibGVCbG9ja0NvdW50TWVzc2FnZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLnBlcmZEcmF3YWJsZUJsb2NrQ2hhbmdlQ291bnQhID4gMTAgKSB7XHJcbiAgICAgICAgc2NlbmVyeUxvZy5QZXJmTWlub3IgJiYgc2NlbmVyeUxvZy5QZXJmTWlub3IoIGRyYXdhYmxlQmxvY2tDb3VudE1lc3NhZ2UgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggdGhpcy5wZXJmRHJhd2FibGVCbG9ja0NoYW5nZUNvdW50ISA+IDAgKSB7XHJcbiAgICAgICAgc2NlbmVyeUxvZy5QZXJmVmVyYm9zZSAmJiBzY2VuZXJ5TG9nLlBlcmZWZXJib3NlKCBkcmF3YWJsZUJsb2NrQ291bnRNZXNzYWdlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBQRE9NVHJlZS5hdWRpdFBET01EaXNwbGF5cyggdGhpcy5yb290Tm9kZSApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EaXNwbGF5ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvLyBVc2VkIGZvciBTdHVkaW8gQXV0b3NlbGVjdCB0byBkZXRlcm1pbmUgdGhlIGxlYWZpZXN0IFBoRVQtaU8gRWxlbWVudCB1bmRlciB0aGUgbW91c2VcclxuICBwdWJsaWMgZ2V0UGhldGlvRWxlbWVudEF0KCBwb2ludDogVmVjdG9yMiApOiBQaGV0aW9PYmplY3QgfCBudWxsIHtcclxuICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9yb290Tm9kZS5nZXRQaGV0aW9Nb3VzZUhpdCggcG9pbnQgKTtcclxuICAgIHJldHVybiBub2RlICYmIG5vZGUuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSA/IG5vZGUgOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVTaXplKCk6IHZvaWQge1xyXG4gICAgbGV0IHNpemVEaXJ0eSA9IGZhbHNlO1xyXG4gICAgLy9PSFRXTyBUT0RPOiBpZiB3ZSBhcmVuJ3QgY2xpcHBpbmcgb3Igc2V0dGluZyBiYWNrZ3JvdW5kIGNvbG9ycywgY2FuIHdlIGdldCBhd2F5IHdpdGggaGF2aW5nIGEgMHgwIGNvbnRhaW5lciBkaXYgYW5kIHVzaW5nIGFic29sdXRlbHktcG9zaXRpb25lZCBjaGlsZHJlbj9cclxuICAgIGlmICggdGhpcy5zaXplLndpZHRoICE9PSB0aGlzLl9jdXJyZW50U2l6ZS53aWR0aCApIHtcclxuICAgICAgc2l6ZURpcnR5ID0gdHJ1ZTtcclxuICAgICAgdGhpcy5fY3VycmVudFNpemUud2lkdGggPSB0aGlzLnNpemUud2lkdGg7XHJcbiAgICAgIHRoaXMuX2RvbUVsZW1lbnQuc3R5bGUud2lkdGggPSBgJHt0aGlzLnNpemUud2lkdGh9cHhgO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLnNpemUuaGVpZ2h0ICE9PSB0aGlzLl9jdXJyZW50U2l6ZS5oZWlnaHQgKSB7XHJcbiAgICAgIHNpemVEaXJ0eSA9IHRydWU7XHJcbiAgICAgIHRoaXMuX2N1cnJlbnRTaXplLmhlaWdodCA9IHRoaXMuc2l6ZS5oZWlnaHQ7XHJcbiAgICAgIHRoaXMuX2RvbUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gYCR7dGhpcy5zaXplLmhlaWdodH1weGA7XHJcbiAgICB9XHJcbiAgICBpZiAoIHNpemVEaXJ0eSAmJiAhdGhpcy5fYWxsb3dTY2VuZU92ZXJmbG93ICkge1xyXG4gICAgICAvLyB0byBwcmV2ZW50IG92ZXJmbG93LCB3ZSBhZGQgYSBDU1MgY2xpcFxyXG4gICAgICAvL1RPRE86IDBweCA9PiAwP1xyXG4gICAgICB0aGlzLl9kb21FbGVtZW50LnN0eWxlLmNsaXAgPSBgcmVjdCgwcHgsJHt0aGlzLnNpemUud2lkdGh9cHgsJHt0aGlzLnNpemUuaGVpZ2h0fXB4LDBweClgO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciBXZWJHTCBpcyBhbGxvd2VkIHRvIGJlIHVzZWQgaW4gZHJhd2FibGVzIGZvciB0aGlzIERpc3BsYXlcclxuICAgKi9cclxuICBwdWJsaWMgaXNXZWJHTEFsbG93ZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fYWxsb3dXZWJHTDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgd2ViZ2xBbGxvd2VkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pc1dlYkdMQWxsb3dlZCgpOyB9XHJcblxyXG4gIHB1YmxpYyBnZXRSb290Tm9kZSgpOiBOb2RlIHtcclxuICAgIHJldHVybiB0aGlzLl9yb290Tm9kZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgcm9vdE5vZGUoKTogTm9kZSB7IHJldHVybiB0aGlzLmdldFJvb3ROb2RlKCk7IH1cclxuXHJcbiAgcHVibGljIGdldFJvb3RCYWNrYm9uZSgpOiBCYWNrYm9uZURyYXdhYmxlIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3Jvb3RCYWNrYm9uZSApO1xyXG4gICAgcmV0dXJuIHRoaXMuX3Jvb3RCYWNrYm9uZSE7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHJvb3RCYWNrYm9uZSgpOiBCYWNrYm9uZURyYXdhYmxlIHsgcmV0dXJuIHRoaXMuZ2V0Um9vdEJhY2tib25lKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGRpbWVuc2lvbnMgb2YgdGhlIERpc3BsYXkncyBET00gZWxlbWVudFxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRTaXplKCk6IERpbWVuc2lvbjIge1xyXG4gICAgcmV0dXJuIHRoaXMuc2l6ZVByb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBzaXplKCk6IERpbWVuc2lvbjIgeyByZXR1cm4gdGhpcy5nZXRTaXplKCk7IH1cclxuXHJcbiAgcHVibGljIGdldEJvdW5kcygpOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLnNpemUudG9Cb3VuZHMoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgYm91bmRzKCk6IEJvdW5kczIgeyByZXR1cm4gdGhpcy5nZXRCb3VuZHMoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGFuZ2VzIHRoZSBzaXplIHRoYXQgdGhlIERpc3BsYXkncyBET00gZWxlbWVudCB3aWxsIGJlIGFmdGVyIHRoZSBuZXh0IHVwZGF0ZURpc3BsYXkoKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRTaXplKCBzaXplOiBEaW1lbnNpb24yICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2l6ZS53aWR0aCAlIDEgPT09IDAsICdEaXNwbGF5LndpZHRoIHNob3VsZCBiZSBhbiBpbnRlZ2VyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2l6ZS53aWR0aCA+IDAsICdEaXNwbGF5LndpZHRoIHNob3VsZCBiZSBncmVhdGVyIHRoYW4gemVybycgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNpemUuaGVpZ2h0ICUgMSA9PT0gMCwgJ0Rpc3BsYXkuaGVpZ2h0IHNob3VsZCBiZSBhbiBpbnRlZ2VyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2l6ZS5oZWlnaHQgPiAwLCAnRGlzcGxheS5oZWlnaHQgc2hvdWxkIGJlIGdyZWF0ZXIgdGhhbiB6ZXJvJyApO1xyXG5cclxuICAgIHRoaXMuc2l6ZVByb3BlcnR5LnZhbHVlID0gc2l6ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoYW5nZXMgdGhlIHNpemUgdGhhdCB0aGUgRGlzcGxheSdzIERPTSBlbGVtZW50IHdpbGwgYmUgYWZ0ZXIgdGhlIG5leHQgdXBkYXRlRGlzcGxheSgpXHJcbiAgICovXHJcbiAgcHVibGljIHNldFdpZHRoSGVpZ2h0KCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0U2l6ZSggbmV3IERpbWVuc2lvbjIoIHdpZHRoLCBoZWlnaHQgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHdpZHRoIG9mIHRoZSBEaXNwbGF5J3MgRE9NIGVsZW1lbnRcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0V2lkdGgoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLnNpemUud2lkdGg7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHdpZHRoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFdpZHRoKCk7IH1cclxuXHJcbiAgcHVibGljIHNldCB3aWR0aCggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRXaWR0aCggdmFsdWUgKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB3aWR0aCB0aGF0IHRoZSBEaXNwbGF5J3MgRE9NIGVsZW1lbnQgd2lsbCBiZSBhZnRlciB0aGUgbmV4dCB1cGRhdGVEaXNwbGF5KCkuIFNob3VsZCBiZSBhbiBpbnRlZ3JhbCB2YWx1ZS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0V2lkdGgoIHdpZHRoOiBudW1iZXIgKTogdGhpcyB7XHJcblxyXG4gICAgaWYgKCB0aGlzLmdldFdpZHRoKCkgIT09IHdpZHRoICkge1xyXG4gICAgICB0aGlzLnNldFNpemUoIG5ldyBEaW1lbnNpb24yKCB3aWR0aCwgdGhpcy5nZXRIZWlnaHQoKSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSBEaXNwbGF5J3MgRE9NIGVsZW1lbnRcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0SGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5zaXplLmhlaWdodDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgaGVpZ2h0KCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldEhlaWdodCgpOyB9XHJcblxyXG4gIHB1YmxpYyBzZXQgaGVpZ2h0KCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldEhlaWdodCggdmFsdWUgKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBoZWlnaHQgdGhhdCB0aGUgRGlzcGxheSdzIERPTSBlbGVtZW50IHdpbGwgYmUgYWZ0ZXIgdGhlIG5leHQgdXBkYXRlRGlzcGxheSgpLiBTaG91bGQgYmUgYW4gaW50ZWdyYWwgdmFsdWUuXHJcbiAgICovXHJcbiAgcHVibGljIHNldEhlaWdodCggaGVpZ2h0OiBudW1iZXIgKTogdGhpcyB7XHJcblxyXG4gICAgaWYgKCB0aGlzLmdldEhlaWdodCgpICE9PSBoZWlnaHQgKSB7XHJcbiAgICAgIHRoaXMuc2V0U2l6ZSggbmV3IERpbWVuc2lvbjIoIHRoaXMuZ2V0V2lkdGgoKSwgaGVpZ2h0ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdpbGwgYmUgYXBwbGllZCB0byB0aGUgcm9vdCBET00gZWxlbWVudCBvbiB1cGRhdGVEaXNwbGF5KCksIGFuZCBubyBzb29uZXIuXHJcbiAgICovXHJcbiAgcHVibGljIHNldEJhY2tncm91bmRDb2xvciggY29sb3I6IENvbG9yIHwgc3RyaW5nIHwgbnVsbCApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbG9yID09PSBudWxsIHx8IHR5cGVvZiBjb2xvciA9PT0gJ3N0cmluZycgfHwgY29sb3IgaW5zdGFuY2VvZiBDb2xvciApO1xyXG5cclxuICAgIHRoaXMuX2JhY2tncm91bmRDb2xvciA9IGNvbG9yO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBiYWNrZ3JvdW5kQ29sb3IoIHZhbHVlOiBDb2xvciB8IHN0cmluZyB8IG51bGwgKSB7IHRoaXMuc2V0QmFja2dyb3VuZENvbG9yKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgYmFja2dyb3VuZENvbG9yKCk6IENvbG9yIHwgc3RyaW5nIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldEJhY2tncm91bmRDb2xvcigpOyB9XHJcblxyXG4gIHB1YmxpYyBnZXRCYWNrZ3JvdW5kQ29sb3IoKTogQ29sb3IgfCBzdHJpbmcgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9iYWNrZ3JvdW5kQ29sb3I7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGludGVyYWN0aXZlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5faW50ZXJhY3RpdmU7IH1cclxuXHJcbiAgcHVibGljIHNldCBpbnRlcmFjdGl2ZSggdmFsdWU6IGJvb2xlYW4gKSB7XHJcbiAgICBpZiAoIHRoaXMuX2FjY2Vzc2libGUgJiYgdmFsdWUgIT09IHRoaXMuX2ludGVyYWN0aXZlICkge1xyXG4gICAgICB0aGlzLl9yb290UERPTUluc3RhbmNlIS5wZWVyIS5yZWN1cnNpdmVEaXNhYmxlKCAhdmFsdWUgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9pbnRlcmFjdGl2ZSA9IHZhbHVlO1xyXG4gICAgaWYgKCAhdGhpcy5faW50ZXJhY3RpdmUgJiYgdGhpcy5faW5wdXQgKSB7XHJcbiAgICAgIHRoaXMuX2lucHV0LmludGVycnVwdFBvaW50ZXJzKCk7XHJcbiAgICAgIHRoaXMuX2lucHV0LmNsZWFyQmF0Y2hlZEV2ZW50cygpO1xyXG4gICAgICB0aGlzLl9pbnB1dC5yZW1vdmVUZW1wb3JhcnlQb2ludGVycygpO1xyXG4gICAgICB0aGlzLl9yb290Tm9kZS5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuICAgICAgdGhpcy5pbnRlcnJ1cHRJbnB1dCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhbiBvdmVybGF5IHRvIHRoZSBEaXNwbGF5LiBFYWNoIG92ZXJsYXkgc2hvdWxkIGhhdmUgYSAuZG9tRWxlbWVudCAodGhlIERPTSBlbGVtZW50IHRoYXQgd2lsbCBiZSB1c2VkIGZvclxyXG4gICAqIGRpc3BsYXkpIGFuZCBhbiAudXBkYXRlKCkgbWV0aG9kLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRPdmVybGF5KCBvdmVybGF5OiBUT3ZlcmxheSApOiB2b2lkIHtcclxuICAgIHRoaXMuX292ZXJsYXlzLnB1c2goIG92ZXJsYXkgKTtcclxuICAgIHRoaXMuX2RvbUVsZW1lbnQuYXBwZW5kQ2hpbGQoIG92ZXJsYXkuZG9tRWxlbWVudCApO1xyXG5cclxuICAgIC8vIGVuc3VyZSB0aGF0IHRoZSBvdmVybGF5IGlzIGhpZGRlbiBmcm9tIHNjcmVlbiByZWFkZXJzLCBhbGwgYWNjZXNzaWJsZSBjb250ZW50IHNob3VsZCBiZSBpbiB0aGUgZG9tIGVsZW1lbnRcclxuICAgIC8vIG9mIHRoZSB0aGlzLl9yb290UERPTUluc3RhbmNlXHJcbiAgICBvdmVybGF5LmRvbUVsZW1lbnQuc2V0QXR0cmlidXRlKCAnYXJpYS1oaWRkZW4nLCAndHJ1ZScgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYW4gb3ZlcmxheSBmcm9tIHRoZSBkaXNwbGF5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVPdmVybGF5KCBvdmVybGF5OiBUT3ZlcmxheSApOiB2b2lkIHtcclxuICAgIHRoaXMuX2RvbUVsZW1lbnQucmVtb3ZlQ2hpbGQoIG92ZXJsYXkuZG9tRWxlbWVudCApO1xyXG4gICAgdGhpcy5fb3ZlcmxheXMuc3BsaWNlKCBfLmluZGV4T2YoIHRoaXMuX292ZXJsYXlzLCBvdmVybGF5ICksIDEgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgcm9vdCBhY2Nlc3NpYmxlIERPTSBlbGVtZW50IHdoaWNoIHJlcHJlc2VudHMgdGhpcyBkaXNwbGF5IGFuZCBwcm92aWRlcyBzZW1hbnRpY3MgZm9yIGFzc2lzdGl2ZVxyXG4gICAqIHRlY2hub2xvZ3kuIElmIHRoaXMgRGlzcGxheSBpcyBub3QgYWNjZXNzaWJsZSwgcmV0dXJucyBudWxsLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRQRE9NUm9vdEVsZW1lbnQoKTogSFRNTEVsZW1lbnQgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9hY2Nlc3NpYmxlID8gdGhpcy5fcm9vdFBET01JbnN0YW5jZSEucGVlciEucHJpbWFyeVNpYmxpbmcgOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBwZG9tUm9vdEVsZW1lbnQoKTogSFRNTEVsZW1lbnQgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0UERPTVJvb3RFbGVtZW50KCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFzIHRoaXMgRGlzcGxheSBlbmFibGVkIGFjY2Vzc2liaWxpdHkgZmVhdHVyZXMgbGlrZSBQRE9NIGNyZWF0aW9uIGFuZCBzdXBwb3J0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc0FjY2Vzc2libGUoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fYWNjZXNzaWJsZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEltcGxlbWVudHMgYSB3b3JrYXJvdW5kIHRoYXQgcHJldmVudHMgRE9NIGZvY3VzIGZyb20gbGVhdmluZyB0aGUgRGlzcGxheSBpbiBGdWxsU2NyZWVuIG1vZGUuIFRoZXJlIGlzXHJcbiAgICogYSBidWcgaW4gc29tZSBicm93c2VycyB3aGVyZSBET00gZm9jdXMgY2FuIGJlIHBlcm1hbmVudGx5IGxvc3QgaWYgdGFiYmluZyBvdXQgb2YgdGhlIEZ1bGxTY3JlZW4gZWxlbWVudCxcclxuICAgKiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg4My5cclxuICAgKi9cclxuICBwcml2YXRlIGhhbmRsZUZ1bGxTY3JlZW5OYXZpZ2F0aW9uKCBkb21FdmVudDogS2V5Ym9hcmRFdmVudCApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucGRvbVJvb3RFbGVtZW50LCAnVGhlcmUgbXVzdCBiZSBhIFBET00gdG8gc3VwcG9ydCBrZXlib2FyZCBuYXZpZ2F0aW9uJyApO1xyXG5cclxuICAgIGlmICggRnVsbFNjcmVlbi5pc0Z1bGxTY3JlZW4oKSAmJiBLZXlib2FyZFV0aWxzLmlzS2V5RXZlbnQoIGRvbUV2ZW50LCBLZXlib2FyZFV0aWxzLktFWV9UQUIgKSApIHtcclxuICAgICAgY29uc3Qgcm9vdEVsZW1lbnQgPSB0aGlzLnBkb21Sb290RWxlbWVudDtcclxuICAgICAgY29uc3QgbmV4dEVsZW1lbnQgPSBkb21FdmVudC5zaGlmdEtleSA/IFBET01VdGlscy5nZXRQcmV2aW91c0ZvY3VzYWJsZSggcm9vdEVsZW1lbnQgfHwgdW5kZWZpbmVkICkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFBET01VdGlscy5nZXROZXh0Rm9jdXNhYmxlKCByb290RWxlbWVudCB8fCB1bmRlZmluZWQgKTtcclxuICAgICAgaWYgKCBuZXh0RWxlbWVudCA9PT0gZG9tRXZlbnQudGFyZ2V0ICkge1xyXG4gICAgICAgIGRvbUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGJpdG1hc2sgdW5pb24gb2YgYWxsIHJlbmRlcmVycyAoY2FudmFzL3N2Zy9kb20vd2ViZ2wpIHRoYXQgYXJlIHVzZWQgZm9yIGRpc3BsYXksIGV4Y2x1ZGluZ1xyXG4gICAqIEJhY2tib25lRHJhd2FibGVzICh3aGljaCB3b3VsZCBiZSBET00pLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRVc2VkUmVuZGVyZXJzQml0bWFzaygpOiBudW1iZXIge1xyXG4gICAgZnVuY3Rpb24gcmVuZGVyZXJzVW5kZXJCYWNrYm9uZSggYmFja2JvbmU6IEJhY2tib25lRHJhd2FibGUgKTogbnVtYmVyIHtcclxuICAgICAgbGV0IGJpdG1hc2sgPSAwO1xyXG4gICAgICBfLmVhY2goIGJhY2tib25lLmJsb2NrcywgYmxvY2sgPT4ge1xyXG4gICAgICAgIGlmICggYmxvY2sgaW5zdGFuY2VvZiBET01CbG9jayAmJiBibG9jay5kb21EcmF3YWJsZSBpbnN0YW5jZW9mIEJhY2tib25lRHJhd2FibGUgKSB7XHJcbiAgICAgICAgICBiaXRtYXNrID0gYml0bWFzayB8IHJlbmRlcmVyc1VuZGVyQmFja2JvbmUoIGJsb2NrLmRvbURyYXdhYmxlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgYml0bWFzayA9IGJpdG1hc2sgfCBibG9jay5yZW5kZXJlcjtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgICAgcmV0dXJuIGJpdG1hc2s7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gb25seSByZXR1cm4gdGhlIHJlbmRlcmVyLXNwZWNpZmljIHBvcnRpb24gKG5vIG90aGVyIGhpbnRzLCBldGMpXHJcbiAgICByZXR1cm4gcmVuZGVyZXJzVW5kZXJCYWNrYm9uZSggdGhpcy5fcm9vdEJhY2tib25lISApICYgUmVuZGVyZXIuYml0bWFza1JlbmRlcmVyQXJlYTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCBmcm9tIEluc3RhbmNlcyB0aGF0IHdpbGwgbmVlZCBhIHRyYW5zZm9ybSB1cGRhdGUgKGZvciBsaXN0ZW5lcnMgYW5kIHByZWNvbXB1dGF0aW9uKS4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBAcGFyYW0gaW5zdGFuY2VcclxuICAgKiBAcGFyYW0gcGFzc1RyYW5zZm9ybSAtIFdoZXRoZXIgd2Ugc2hvdWxkIHBhc3MgdGhlIGZpcnN0IHRyYW5zZm9ybSByb290IHdoZW4gdmFsaWRhdGluZyB0cmFuc2Zvcm1zIChzaG91bGRcclxuICAgKiBiZSB0cnVlIGlmIHRoZSBpbnN0YW5jZSBpcyB0cmFuc2Zvcm1lZClcclxuICAgKi9cclxuICBwdWJsaWMgbWFya1RyYW5zZm9ybVJvb3REaXJ0eSggaW5zdGFuY2U6IEluc3RhbmNlLCBwYXNzVHJhbnNmb3JtOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgcGFzc1RyYW5zZm9ybSA/IHRoaXMuX2RpcnR5VHJhbnNmb3JtUm9vdHMucHVzaCggaW5zdGFuY2UgKSA6IHRoaXMuX2RpcnR5VHJhbnNmb3JtUm9vdHNXaXRob3V0UGFzcy5wdXNoKCBpbnN0YW5jZSApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVEaXJ0eVRyYW5zZm9ybVJvb3RzKCk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLnRyYW5zZm9ybVN5c3RlbSAmJiBzY2VuZXJ5TG9nLnRyYW5zZm9ybVN5c3RlbSggJ3VwZGF0ZURpcnR5VHJhbnNmb3JtUm9vdHMnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cudHJhbnNmb3JtU3lzdGVtICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG4gICAgd2hpbGUgKCB0aGlzLl9kaXJ0eVRyYW5zZm9ybVJvb3RzLmxlbmd0aCApIHtcclxuICAgICAgdGhpcy5fZGlydHlUcmFuc2Zvcm1Sb290cy5wb3AoKSEucmVsYXRpdmVUcmFuc2Zvcm0udXBkYXRlVHJhbnNmb3JtTGlzdGVuZXJzQW5kQ29tcHV0ZSggZmFsc2UsIGZhbHNlLCB0aGlzLl9mcmFtZUlkLCB0cnVlICk7XHJcbiAgICB9XHJcbiAgICB3aGlsZSAoIHRoaXMuX2RpcnR5VHJhbnNmb3JtUm9vdHNXaXRob3V0UGFzcy5sZW5ndGggKSB7XHJcbiAgICAgIHRoaXMuX2RpcnR5VHJhbnNmb3JtUm9vdHNXaXRob3V0UGFzcy5wb3AoKSEucmVsYXRpdmVUcmFuc2Zvcm0udXBkYXRlVHJhbnNmb3JtTGlzdGVuZXJzQW5kQ29tcHV0ZSggZmFsc2UsIGZhbHNlLCB0aGlzLl9mcmFtZUlkLCBmYWxzZSApO1xyXG4gICAgfVxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLnRyYW5zZm9ybVN5c3RlbSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIG1hcmtEcmF3YWJsZUNoYW5nZWRCbG9jayggZHJhd2FibGU6IERyYXdhYmxlICk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRpc3BsYXkgJiYgc2NlbmVyeUxvZy5EaXNwbGF5KCBgbWFya0RyYXdhYmxlQ2hhbmdlZEJsb2NrOiAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgdGhpcy5fZHJhd2FibGVzVG9DaGFuZ2VCbG9jay5wdXNoKCBkcmF3YWJsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFya3MgYW4gaXRlbSBmb3IgbGF0ZXIgcmVkdWNlUmVmZXJlbmNlcygpIGNhbGxzIGF0IHRoZSBlbmQgb2YgRGlzcGxheS51cGRhdGUoKS5cclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgbWFya0ZvclJlZHVjZWRSZWZlcmVuY2VzKCBpdGVtOiB7IHJlZHVjZVJlZmVyZW5jZXM6ICgpID0+IHZvaWQgfSApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICEhaXRlbS5yZWR1Y2VSZWZlcmVuY2VzICk7XHJcblxyXG4gICAgdGhpcy5fcmVkdWNlUmVmZXJlbmNlc05lZWRlZC5wdXNoKCBpdGVtICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgbWFya0luc3RhbmNlUm9vdEZvckRpc3Bvc2FsKCBpbnN0YW5jZTogSW5zdGFuY2UgKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRGlzcGxheSAmJiBzY2VuZXJ5TG9nLkRpc3BsYXkoIGBtYXJrSW5zdGFuY2VSb290Rm9yRGlzcG9zYWw6ICR7aW5zdGFuY2UudG9TdHJpbmcoKX1gICk7XHJcbiAgICB0aGlzLl9pbnN0YW5jZVJvb3RzVG9EaXNwb3NlLnB1c2goIGluc3RhbmNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgbWFya0RyYXdhYmxlRm9yRGlzcG9zYWwoIGRyYXdhYmxlOiBEcmF3YWJsZSApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EaXNwbGF5ICYmIHNjZW5lcnlMb2cuRGlzcGxheSggYG1hcmtEcmF3YWJsZUZvckRpc3Bvc2FsOiAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgdGhpcy5fZHJhd2FibGVzVG9EaXNwb3NlLnB1c2goIGRyYXdhYmxlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgbWFya0RyYXdhYmxlRm9yTGlua3NVcGRhdGUoIGRyYXdhYmxlOiBEcmF3YWJsZSApOiB2b2lkIHtcclxuICAgIHRoaXMuX2RyYXdhYmxlc1RvVXBkYXRlTGlua3MucHVzaCggZHJhd2FibGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhIHtDaGFuZ2VJbnRlcnZhbH0gZm9yIHRoZSBcInJlbW92ZSBjaGFuZ2UgaW50ZXJ2YWwgaW5mb1wiIHBoYXNlICh3ZSBkb24ndCB3YW50IHRvIGxlYWsgbWVtb3J5L3JlZmVyZW5jZXMpXHJcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIG1hcmtDaGFuZ2VJbnRlcnZhbFRvRGlzcG9zZSggY2hhbmdlSW50ZXJ2YWw6IENoYW5nZUludGVydmFsICk6IHZvaWQge1xyXG4gICAgdGhpcy5fY2hhbmdlSW50ZXJ2YWxzVG9EaXNwb3NlLnB1c2goIGNoYW5nZUludGVydmFsICk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZUJhY2tncm91bmRDb2xvcigpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2JhY2tncm91bmRDb2xvciA9PT0gbnVsbCB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHRoaXMuX2JhY2tncm91bmRDb2xvciA9PT0gJ3N0cmluZycgfHxcclxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2JhY2tncm91bmRDb2xvciBpbnN0YW5jZW9mIENvbG9yICk7XHJcblxyXG4gICAgY29uc3QgbmV3QmFja2dyb3VuZENTUyA9IHRoaXMuX2JhY2tncm91bmRDb2xvciA9PT0gbnVsbCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJycgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICggKCB0aGlzLl9iYWNrZ3JvdW5kQ29sb3IgYXMgQ29sb3IgKS50b0NTUyA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIHRoaXMuX2JhY2tncm91bmRDb2xvciBhcyBDb2xvciApLnRvQ1NTKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYmFja2dyb3VuZENvbG9yIGFzIHN0cmluZyApO1xyXG4gICAgaWYgKCBuZXdCYWNrZ3JvdW5kQ1NTICE9PSB0aGlzLl9jdXJyZW50QmFja2dyb3VuZENTUyApIHtcclxuICAgICAgdGhpcy5fY3VycmVudEJhY2tncm91bmRDU1MgPSBuZXdCYWNrZ3JvdW5kQ1NTO1xyXG5cclxuICAgICAgdGhpcy5fZG9tRWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBuZXdCYWNrZ3JvdW5kQ1NTO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogQ3Vyc29yc1xyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gIHByaXZhdGUgdXBkYXRlQ3Vyc29yKCk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLl9pbnB1dCAmJiB0aGlzLl9pbnB1dC5tb3VzZSAmJiB0aGlzLl9pbnB1dC5tb3VzZS5wb2ludCApIHtcclxuICAgICAgaWYgKCB0aGlzLl9pbnB1dC5tb3VzZS5jdXJzb3IgKSB7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkN1cnNvciAmJiBzY2VuZXJ5TG9nLkN1cnNvciggYHNldCBvbiBwb2ludGVyOiAke3RoaXMuX2lucHV0Lm1vdXNlLmN1cnNvcn1gICk7XHJcbiAgICAgICAgdGhpcy5zZXRTY2VuZUN1cnNvciggdGhpcy5faW5wdXQubW91c2UuY3Vyc29yICk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvL09IVFdPIFRPRE86IEZvciBhIGRpc3BsYXksIGp1c3QgcmV0dXJuIGFuIGluc3RhbmNlIGFuZCB3ZSBjYW4gYXZvaWQgdGhlIGdhcmJhZ2UgY29sbGVjdGlvbi9tdXRhdGlvbiBhdCB0aGUgY29zdCBvZiB0aGUgbGlua2VkLWxpc3QgdHJhdmVyc2FsIGluc3RlYWQgb2YgYW4gYXJyYXlcclxuICAgICAgY29uc3QgbW91c2VUcmFpbCA9IHRoaXMuX3Jvb3ROb2RlLnRyYWlsVW5kZXJQb2ludGVyKCB0aGlzLl9pbnB1dC5tb3VzZSApO1xyXG5cclxuICAgICAgaWYgKCBtb3VzZVRyYWlsICkge1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gbW91c2VUcmFpbC5nZXRDdXJzb3JDaGVja0luZGV4KCk7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgICAgICAgY29uc3Qgbm9kZSA9IG1vdXNlVHJhaWwubm9kZXNbIGkgXTtcclxuICAgICAgICAgIGNvbnN0IGN1cnNvciA9IG5vZGUuZ2V0RWZmZWN0aXZlQ3Vyc29yKCk7XHJcblxyXG4gICAgICAgICAgaWYgKCBjdXJzb3IgKSB7XHJcbiAgICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DdXJzb3IgJiYgc2NlbmVyeUxvZy5DdXJzb3IoIGAke2N1cnNvcn0gb24gJHtub2RlLmNvbnN0cnVjdG9yLm5hbWV9IyR7bm9kZS5pZH1gICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U2NlbmVDdXJzb3IoIGN1cnNvciApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ3Vyc29yICYmIHNjZW5lcnlMb2cuQ3Vyc29yKCBgLS0tIGZvciAke21vdXNlVHJhaWwgPyBtb3VzZVRyYWlsLnRvU3RyaW5nKCkgOiAnKG5vIGhpdCknfWAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBmYWxsYmFjayBjYXNlXHJcbiAgICB0aGlzLnNldFNjZW5lQ3Vyc29yKCB0aGlzLl9kZWZhdWx0Q3Vyc29yICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBjdXJzb3IgdG8gYmUgZGlzcGxheWVkIHdoZW4gb3ZlciB0aGUgRGlzcGxheS5cclxuICAgKi9cclxuICBwcml2YXRlIHNldEVsZW1lbnRDdXJzb3IoIGN1cnNvcjogc3RyaW5nICk6IHZvaWQge1xyXG4gICAgdGhpcy5fZG9tRWxlbWVudC5zdHlsZS5jdXJzb3IgPSBjdXJzb3I7XHJcblxyXG4gICAgLy8gSW4gc29tZSBjYXNlcywgQ2hyb21lIGRvZXNuJ3Qgc2VlbSB0byByZXNwZWN0IHRoZSBjdXJzb3Igc2V0IG9uIHRoZSBEaXNwbGF5J3MgZG9tRWxlbWVudC4gSWYgd2UgYXJlIHVzaW5nIHRoZVxyXG4gICAgLy8gZnVsbCB3aW5kb3csIHdlIGNhbiBhcHBseSB0aGUgd29ya2Fyb3VuZCBvZiBjb250cm9sbGluZyB0aGUgYm9keSdzIHN0eWxlLlxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy85ODNcclxuICAgIGlmICggdGhpcy5fYXNzdW1lRnVsbFdpbmRvdyApIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSBjdXJzb3I7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldFNjZW5lQ3Vyc29yKCBjdXJzb3I6IHN0cmluZyApOiB2b2lkIHtcclxuICAgIGlmICggY3Vyc29yICE9PSB0aGlzLl9sYXN0Q3Vyc29yICkge1xyXG4gICAgICB0aGlzLl9sYXN0Q3Vyc29yID0gY3Vyc29yO1xyXG4gICAgICBjb25zdCBjdXN0b21DdXJzb3JzID0gQ1VTVE9NX0NVUlNPUlNbIGN1cnNvciBdO1xyXG4gICAgICBpZiAoIGN1c3RvbUN1cnNvcnMgKSB7XHJcbiAgICAgICAgLy8gZ28gYmFja3dhcmRzLCBzbyB0aGUgbW9zdCBkZXNpcmVkIGN1cnNvciBzdGlja3NcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IGN1c3RvbUN1cnNvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgICAgICB0aGlzLnNldEVsZW1lbnRDdXJzb3IoIGN1c3RvbUN1cnNvcnNbIGkgXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLnNldEVsZW1lbnRDdXJzb3IoIGN1cnNvciApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFwcGx5Q1NTSGFja3MoKTogdm9pZCB7XHJcbiAgICAvLyB0byB1c2UgQ1NTMyB0cmFuc2Zvcm1zIGZvciBwZXJmb3JtYW5jZSwgaGlkZSBhbnl0aGluZyBvdXRzaWRlIG91ciBib3VuZHMgYnkgZGVmYXVsdFxyXG4gICAgaWYgKCAhdGhpcy5fYWxsb3dTY2VuZU92ZXJmbG93ICkge1xyXG4gICAgICB0aGlzLl9kb21FbGVtZW50LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZm9yd2FyZCBhbGwgcG9pbnRlciBldmVudHNcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgbGVnYWN5XHJcbiAgICB0aGlzLl9kb21FbGVtZW50LnN0eWxlLm1zVG91Y2hBY3Rpb24gPSAnbm9uZSc7XHJcblxyXG4gICAgLy8gZG9uJ3QgYWxsb3cgYnJvd3NlciB0byBzd2l0Y2ggYmV0d2VlbiBmb250IHNtb290aGluZyBtZXRob2RzIGZvciB0ZXh0IChzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzQzMSlcclxuICAgIEZlYXR1cmVzLnNldFN0eWxlKCB0aGlzLl9kb21FbGVtZW50LCBGZWF0dXJlcy5mb250U21vb3RoaW5nLCAnYW50aWFsaWFzZWQnICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9hbGxvd0NTU0hhY2tzICkge1xyXG4gICAgICAvLyBQcmV2ZW50cyBzZWxlY3Rpb24gY3Vyc29yIGlzc3VlcyBpbiBTYWZhcmksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNDc2XHJcbiAgICAgIGRvY3VtZW50Lm9uc2VsZWN0c3RhcnQgPSAoKSA9PiBmYWxzZTtcclxuXHJcbiAgICAgIC8vIHByZXZlbnQgYW55IGRlZmF1bHQgem9vbWluZyBiZWhhdmlvciBmcm9tIGEgdHJhY2twYWQgb24gSUUxMSBhbmQgRWRnZSwgYWxsIHNob3VsZCBiZSBoYW5kbGVkIGJ5IHNjZW5lcnkgLSBtdXN0XHJcbiAgICAgIC8vIGJlIG9uIHRoZSBib2R5LCBkb2Vzbid0IHByZXZlbnQgYmVoYXZpb3IgaWYgb24gdGhlIGRpc3BsYXkgZGl2XHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgbGVnYWN5XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUubXNDb250ZW50Wm9vbWluZyA9ICdub25lJztcclxuXHJcbiAgICAgIC8vIHNvbWUgY3NzIGhhY2tzIChpbnNwaXJlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9FaWdodE1lZGlhL2hhbW1lci5qcy9ibG9iL21hc3Rlci9oYW1tZXIuanMpLlxyXG4gICAgICAvLyBtb2RpZmllZCB0byBvbmx5IGFwcGx5IHRoZSBwcm9wZXIgcHJlZml4ZWQgdmVyc2lvbiBpbnN0ZWFkIG9mIHNwYW1taW5nIGFsbCBvZiB0aGVtLCBhbmQgZG9lc24ndCB1c2UgalF1ZXJ5LlxyXG4gICAgICBGZWF0dXJlcy5zZXRTdHlsZSggdGhpcy5fZG9tRWxlbWVudCwgRmVhdHVyZXMudXNlckRyYWcsICdub25lJyApO1xyXG4gICAgICBGZWF0dXJlcy5zZXRTdHlsZSggdGhpcy5fZG9tRWxlbWVudCwgRmVhdHVyZXMudXNlclNlbGVjdCwgJ25vbmUnICk7XHJcbiAgICAgIEZlYXR1cmVzLnNldFN0eWxlKCB0aGlzLl9kb21FbGVtZW50LCBGZWF0dXJlcy50b3VjaEFjdGlvbiwgJ25vbmUnICk7XHJcbiAgICAgIEZlYXR1cmVzLnNldFN0eWxlKCB0aGlzLl9kb21FbGVtZW50LCBGZWF0dXJlcy50b3VjaENhbGxvdXQsICdub25lJyApO1xyXG4gICAgICBGZWF0dXJlcy5zZXRTdHlsZSggdGhpcy5fZG9tRWxlbWVudCwgRmVhdHVyZXMudGFwSGlnaGxpZ2h0Q29sb3IsICdyZ2JhKDAsMCwwLDApJyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGNhbnZhc0RhdGFVUkwoIGNhbGxiYWNrOiAoIHN0cjogc3RyaW5nICkgPT4gdm9pZCApOiB2b2lkIHtcclxuICAgIHRoaXMuY2FudmFzU25hcHNob3QoICggY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCApID0+IHtcclxuICAgICAgY2FsbGJhY2soIGNhbnZhcy50b0RhdGFVUkwoKSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVuZGVycyB3aGF0IGl0IGNhbiBpbnRvIGEgQ2FudmFzIChzbyBmYXIsIENhbnZhcyBhbmQgU1ZHIGxheWVycyB3b3JrIGZpbmUpXHJcbiAgICovXHJcbiAgcHVibGljIGNhbnZhc1NuYXBzaG90KCBjYWxsYmFjazogKCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCBpbWFnZURhdGE6IEltYWdlRGF0YSApID0+IHZvaWQgKTogdm9pZCB7XHJcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gICAgY2FudmFzLndpZHRoID0gdGhpcy5zaXplLndpZHRoO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IHRoaXMuc2l6ZS5oZWlnaHQ7XHJcblxyXG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICkhO1xyXG5cclxuICAgIC8vT0hUV08gVE9ETzogYWxsb3cgYWN0dWFsIGJhY2tncm91bmQgY29sb3IgZGlyZWN0bHksIG5vdCBoYXZpbmcgdG8gY2hlY2sgdGhlIHN0eWxlIGhlcmUhISFcclxuICAgIHRoaXMuX3Jvb3ROb2RlLnJlbmRlclRvQ2FudmFzKCBjYW52YXMsIGNvbnRleHQsICgpID0+IHtcclxuICAgICAgY2FsbGJhY2soIGNhbnZhcywgY29udGV4dC5nZXRJbWFnZURhdGEoIDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCApICk7XHJcbiAgICB9LCB0aGlzLmRvbUVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUT0RPOiByZWR1Y2UgY29kZSBkdXBsaWNhdGlvbiBmb3IgaGFuZGxpbmcgb3ZlcmxheXNcclxuICAgKi9cclxuICBwdWJsaWMgc2V0UG9pbnRlckRpc3BsYXlWaXNpYmxlKCB2aXNpYmlsaXR5OiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgY29uc3QgaGFzT3ZlcmxheSA9ICEhdGhpcy5fcG9pbnRlck92ZXJsYXk7XHJcblxyXG4gICAgaWYgKCB2aXNpYmlsaXR5ICE9PSBoYXNPdmVybGF5ICkge1xyXG4gICAgICBpZiAoICF2aXNpYmlsaXR5ICkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlT3ZlcmxheSggdGhpcy5fcG9pbnRlck92ZXJsYXkhICk7XHJcbiAgICAgICAgdGhpcy5fcG9pbnRlck92ZXJsYXkhLmRpc3Bvc2UoKTtcclxuICAgICAgICB0aGlzLl9wb2ludGVyT3ZlcmxheSA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5fcG9pbnRlck92ZXJsYXkgPSBuZXcgUG9pbnRlck92ZXJsYXkoIHRoaXMsIHRoaXMuX3Jvb3ROb2RlICk7XHJcbiAgICAgICAgdGhpcy5hZGRPdmVybGF5KCB0aGlzLl9wb2ludGVyT3ZlcmxheSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUT0RPOiByZWR1Y2UgY29kZSBkdXBsaWNhdGlvbiBmb3IgaGFuZGxpbmcgb3ZlcmxheXNcclxuICAgKi9cclxuICBwdWJsaWMgc2V0UG9pbnRlckFyZWFEaXNwbGF5VmlzaWJsZSggdmlzaWJpbGl0eTogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIGNvbnN0IGhhc092ZXJsYXkgPSAhIXRoaXMuX3BvaW50ZXJBcmVhT3ZlcmxheTtcclxuXHJcbiAgICBpZiAoIHZpc2liaWxpdHkgIT09IGhhc092ZXJsYXkgKSB7XHJcbiAgICAgIGlmICggIXZpc2liaWxpdHkgKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVPdmVybGF5KCB0aGlzLl9wb2ludGVyQXJlYU92ZXJsYXkhICk7XHJcbiAgICAgICAgdGhpcy5fcG9pbnRlckFyZWFPdmVybGF5IS5kaXNwb3NlKCk7XHJcbiAgICAgICAgdGhpcy5fcG9pbnRlckFyZWFPdmVybGF5ID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLl9wb2ludGVyQXJlYU92ZXJsYXkgPSBuZXcgUG9pbnRlckFyZWFPdmVybGF5KCB0aGlzLCB0aGlzLl9yb290Tm9kZSApO1xyXG4gICAgICAgIHRoaXMuYWRkT3ZlcmxheSggdGhpcy5fcG9pbnRlckFyZWFPdmVybGF5ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRPRE86IHJlZHVjZSBjb2RlIGR1cGxpY2F0aW9uIGZvciBoYW5kbGluZyBvdmVybGF5c1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRIaXRBcmVhRGlzcGxheVZpc2libGUoIHZpc2liaWxpdHk6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBjb25zdCBoYXNPdmVybGF5ID0gISF0aGlzLl9oaXRBcmVhT3ZlcmxheTtcclxuXHJcbiAgICBpZiAoIHZpc2liaWxpdHkgIT09IGhhc092ZXJsYXkgKSB7XHJcbiAgICAgIGlmICggIXZpc2liaWxpdHkgKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVPdmVybGF5KCB0aGlzLl9oaXRBcmVhT3ZlcmxheSEgKTtcclxuICAgICAgICB0aGlzLl9oaXRBcmVhT3ZlcmxheSEuZGlzcG9zZSgpO1xyXG4gICAgICAgIHRoaXMuX2hpdEFyZWFPdmVybGF5ID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLl9oaXRBcmVhT3ZlcmxheSA9IG5ldyBIaXRBcmVhT3ZlcmxheSggdGhpcywgdGhpcy5fcm9vdE5vZGUgKTtcclxuICAgICAgICB0aGlzLmFkZE92ZXJsYXkoIHRoaXMuX2hpdEFyZWFPdmVybGF5ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRPRE86IHJlZHVjZSBjb2RlIGR1cGxpY2F0aW9uIGZvciBoYW5kbGluZyBvdmVybGF5c1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRDYW52YXNOb2RlQm91bmRzVmlzaWJsZSggdmlzaWJpbGl0eTogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIGNvbnN0IGhhc092ZXJsYXkgPSAhIXRoaXMuX2NhbnZhc0FyZWFCb3VuZHNPdmVybGF5O1xyXG5cclxuICAgIGlmICggdmlzaWJpbGl0eSAhPT0gaGFzT3ZlcmxheSApIHtcclxuICAgICAgaWYgKCAhdmlzaWJpbGl0eSApIHtcclxuICAgICAgICB0aGlzLnJlbW92ZU92ZXJsYXkoIHRoaXMuX2NhbnZhc0FyZWFCb3VuZHNPdmVybGF5ISApO1xyXG4gICAgICAgIHRoaXMuX2NhbnZhc0FyZWFCb3VuZHNPdmVybGF5IS5kaXNwb3NlKCk7XHJcbiAgICAgICAgdGhpcy5fY2FudmFzQXJlYUJvdW5kc092ZXJsYXkgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuX2NhbnZhc0FyZWFCb3VuZHNPdmVybGF5ID0gbmV3IENhbnZhc05vZGVCb3VuZHNPdmVybGF5KCB0aGlzLCB0aGlzLl9yb290Tm9kZSApO1xyXG4gICAgICAgIHRoaXMuYWRkT3ZlcmxheSggdGhpcy5fY2FudmFzQXJlYUJvdW5kc092ZXJsYXkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVE9ETzogcmVkdWNlIGNvZGUgZHVwbGljYXRpb24gZm9yIGhhbmRsaW5nIG92ZXJsYXlzXHJcbiAgICovXHJcbiAgcHVibGljIHNldEZpdHRlZEJsb2NrQm91bmRzVmlzaWJsZSggdmlzaWJpbGl0eTogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIGNvbnN0IGhhc092ZXJsYXkgPSAhIXRoaXMuX2ZpdHRlZEJsb2NrQm91bmRzT3ZlcmxheTtcclxuXHJcbiAgICBpZiAoIHZpc2liaWxpdHkgIT09IGhhc092ZXJsYXkgKSB7XHJcbiAgICAgIGlmICggIXZpc2liaWxpdHkgKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVPdmVybGF5KCB0aGlzLl9maXR0ZWRCbG9ja0JvdW5kc092ZXJsYXkhICk7XHJcbiAgICAgICAgdGhpcy5fZml0dGVkQmxvY2tCb3VuZHNPdmVybGF5IS5kaXNwb3NlKCk7XHJcbiAgICAgICAgdGhpcy5fZml0dGVkQmxvY2tCb3VuZHNPdmVybGF5ID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLl9maXR0ZWRCbG9ja0JvdW5kc092ZXJsYXkgPSBuZXcgRml0dGVkQmxvY2tCb3VuZHNPdmVybGF5KCB0aGlzLCB0aGlzLl9yb290Tm9kZSApO1xyXG4gICAgICAgIHRoaXMuYWRkT3ZlcmxheSggdGhpcy5fZml0dGVkQmxvY2tCb3VuZHNPdmVybGF5ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdXAgdGhlIERpc3BsYXkgdG8gcmVzaXplIHRvIHdoYXRldmVyIHRoZSB3aW5kb3cgaW5uZXIgZGltZW5zaW9ucyB3aWxsIGJlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZXNpemVPbldpbmRvd1Jlc2l6ZSgpOiB2b2lkIHtcclxuICAgIGNvbnN0IHJlc2l6ZXIgPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMuc2V0V2lkdGhIZWlnaHQoIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWQtc2ltLXRleHRcclxuICAgIH07XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3Jlc2l6ZScsIHJlc2l6ZXIgKTtcclxuICAgIHJlc2l6ZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgb24gZXZlcnkgcmVxdWVzdCBhbmltYXRpb24gZnJhbWUuIElmIHN0ZXBDYWxsYmFjayBpcyBwYXNzZWQgaW4sIGl0IGlzIGNhbGxlZCBiZWZvcmUgdXBkYXRlRGlzcGxheSgpIHdpdGhcclxuICAgKiBzdGVwQ2FsbGJhY2soIHRpbWVFbGFwc2VkSW5TZWNvbmRzIClcclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlT25SZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHN0ZXBDYWxsYmFjaz86ICggZHQ6IG51bWJlciApID0+IHZvaWQgKTogdm9pZCB7XHJcbiAgICAvLyBrZWVwIHRyYWNrIG9mIGhvdyBtdWNoIHRpbWUgZWxhcHNlZCBvdmVyIHRoZSBsYXN0IGZyYW1lXHJcbiAgICBsZXQgbGFzdFRpbWUgPSAwO1xyXG4gICAgbGV0IHRpbWVFbGFwc2VkSW5TZWNvbmRzID0gMDtcclxuXHJcbiAgICBjb25zdCBzZWxmID0gdGhpczsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xyXG4gICAgKCBmdW5jdGlvbiBzdGVwKCkge1xyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIExFR0FDWSAtLS0gaXQgd291bGQga25vdyB0byB1cGRhdGUganVzdCB0aGUgRE9NIGVsZW1lbnQncyBsb2NhdGlvbiBpZiBpdCdzIHRoZSBzZWNvbmQgYXJndW1lbnRcclxuICAgICAgc2VsZi5fcmVxdWVzdEFuaW1hdGlvbkZyYW1lSUQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCBzdGVwLCBzZWxmLl9kb21FbGVtZW50ICk7XHJcblxyXG4gICAgICAvLyBjYWxjdWxhdGUgaG93IG11Y2ggdGltZSBoYXMgZWxhcHNlZCBzaW5jZSB3ZSByZW5kZXJlZCB0aGUgbGFzdCBmcmFtZVxyXG4gICAgICBjb25zdCB0aW1lTm93ID0gRGF0ZS5ub3coKTtcclxuICAgICAgaWYgKCBsYXN0VGltZSAhPT0gMCApIHtcclxuICAgICAgICB0aW1lRWxhcHNlZEluU2Vjb25kcyA9ICggdGltZU5vdyAtIGxhc3RUaW1lICkgLyAxMDAwLjA7XHJcbiAgICAgIH1cclxuICAgICAgbGFzdFRpbWUgPSB0aW1lTm93O1xyXG5cclxuICAgICAgLy8gc3RlcCB0aGUgdGltZXIgdGhhdCBkcml2ZXMgYW55IHRpbWUgZGVwZW5kZW50IHVwZGF0ZXMgb2YgdGhlIERpc3BsYXlcclxuICAgICAgc3RlcFRpbWVyLmVtaXQoIHRpbWVFbGFwc2VkSW5TZWNvbmRzICk7XHJcblxyXG4gICAgICBzdGVwQ2FsbGJhY2sgJiYgc3RlcENhbGxiYWNrKCB0aW1lRWxhcHNlZEluU2Vjb25kcyApO1xyXG4gICAgICBzZWxmLnVwZGF0ZURpc3BsYXkoKTtcclxuICAgIH0gKSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNhbmNlbFVwZGF0ZU9uUmVxdWVzdEFuaW1hdGlvbkZyYW1lKCk6IHZvaWQge1xyXG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKCB0aGlzLl9yZXF1ZXN0QW5pbWF0aW9uRnJhbWVJRCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgZXZlbnQgaGFuZGxpbmcsIGFuZCBjb25uZWN0cyB0aGUgYnJvd3NlcidzIGlucHV0IGV2ZW50IGhhbmRsZXJzIHRvIG5vdGlmeSB0aGlzIERpc3BsYXkgb2YgZXZlbnRzLlxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyBjYW4gYmUgcmV2ZXJzZWQgd2l0aCBkZXRhY2hFdmVudHMoKS5cclxuICAgKi9cclxuICBwdWJsaWMgaW5pdGlhbGl6ZUV2ZW50cyggb3B0aW9ucz86IElucHV0T3B0aW9ucyApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLl9pbnB1dCwgJ0V2ZW50cyBjYW5ub3QgYmUgYXR0YWNoZWQgdHdpY2UgdG8gYSBkaXNwbGF5IChmb3Igbm93KScgKTtcclxuXHJcbiAgICAvLyBUT0RPOiByZWZhY3RvciBoZXJlXHJcbiAgICBjb25zdCBpbnB1dCA9IG5ldyBJbnB1dCggdGhpcywgIXRoaXMuX2xpc3RlblRvT25seUVsZW1lbnQsIHRoaXMuX2JhdGNoRE9NRXZlbnRzLCB0aGlzLl9hc3N1bWVGdWxsV2luZG93LCB0aGlzLl9wYXNzaXZlRXZlbnRzLCBvcHRpb25zICk7XHJcbiAgICB0aGlzLl9pbnB1dCA9IGlucHV0O1xyXG5cclxuICAgIGlucHV0LmNvbm5lY3RMaXN0ZW5lcnMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGFjaCBhbHJlYWR5LWF0dGFjaGVkIGlucHV0IGV2ZW50IGhhbmRsaW5nIChmcm9tIGluaXRpYWxpemVFdmVudHMoKSkuXHJcbiAgICovXHJcbiAgcHVibGljIGRldGFjaEV2ZW50cygpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2lucHV0LCAnZGV0YWNoRXZlbnRzKCkgc2hvdWxkIGJlIGNhbGxlZCBvbmx5IHdoZW4gZXZlbnRzIGFyZSBhdHRhY2hlZCcgKTtcclxuXHJcbiAgICB0aGlzLl9pbnB1dCEuZGlzY29ubmVjdExpc3RlbmVycygpO1xyXG4gICAgdGhpcy5faW5wdXQgPSBudWxsO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYW4gaW5wdXQgbGlzdGVuZXIuXHJcbiAgICovXHJcbiAgcHVibGljIGFkZElucHV0TGlzdGVuZXIoIGxpc3RlbmVyOiBUSW5wdXRMaXN0ZW5lciApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFfLmluY2x1ZGVzKCB0aGlzLl9pbnB1dExpc3RlbmVycywgbGlzdGVuZXIgKSwgJ0lucHV0IGxpc3RlbmVyIGFscmVhZHkgcmVnaXN0ZXJlZCBvbiB0aGlzIERpc3BsYXknICk7XHJcblxyXG4gICAgLy8gZG9uJ3QgYWxsb3cgbGlzdGVuZXJzIHRvIGJlIGFkZGVkIG11bHRpcGxlIHRpbWVzXHJcbiAgICBpZiAoICFfLmluY2x1ZGVzKCB0aGlzLl9pbnB1dExpc3RlbmVycywgbGlzdGVuZXIgKSApIHtcclxuICAgICAgdGhpcy5faW5wdXRMaXN0ZW5lcnMucHVzaCggbGlzdGVuZXIgKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhbiBpbnB1dCBsaXN0ZW5lciB0aGF0IHdhcyBwcmV2aW91c2x5IGFkZGVkIHdpdGggYWRkSW5wdXRMaXN0ZW5lci5cclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlSW5wdXRMaXN0ZW5lciggbGlzdGVuZXI6IFRJbnB1dExpc3RlbmVyICk6IHRoaXMge1xyXG4gICAgLy8gZW5zdXJlIHRoZSBsaXN0ZW5lciBpcyBpbiBvdXIgbGlzdFxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggdGhpcy5faW5wdXRMaXN0ZW5lcnMsIGxpc3RlbmVyICkgKTtcclxuXHJcbiAgICB0aGlzLl9pbnB1dExpc3RlbmVycy5zcGxpY2UoIF8uaW5kZXhPZiggdGhpcy5faW5wdXRMaXN0ZW5lcnMsIGxpc3RlbmVyICksIDEgKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIGlucHV0IGxpc3RlbmVyIGlzIGN1cnJlbnRseSBsaXN0ZW5pbmcgdG8gdGhpcyBEaXNwbGF5LlxyXG4gICAqXHJcbiAgICogTW9yZSBlZmZpY2llbnQgdGhhbiBjaGVja2luZyBkaXNwbGF5LmlucHV0TGlzdGVuZXJzLCBhcyB0aGF0IGluY2x1ZGVzIGEgZGVmZW5zaXZlIGNvcHkuXHJcbiAgICovXHJcbiAgcHVibGljIGhhc0lucHV0TGlzdGVuZXIoIGxpc3RlbmVyOiBUSW5wdXRMaXN0ZW5lciApOiBib29sZWFuIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX2lucHV0TGlzdGVuZXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIHRoaXMuX2lucHV0TGlzdGVuZXJzWyBpIF0gPT09IGxpc3RlbmVyICkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgY29weSBvZiBhbGwgb2Ygb3VyIGlucHV0IGxpc3RlbmVycy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0SW5wdXRMaXN0ZW5lcnMoKTogVElucHV0TGlzdGVuZXJbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5faW5wdXRMaXN0ZW5lcnMuc2xpY2UoIDAgKTsgLy8gZGVmZW5zaXZlIGNvcHlcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgaW5wdXRMaXN0ZW5lcnMoKTogVElucHV0TGlzdGVuZXJbXSB7IHJldHVybiB0aGlzLmdldElucHV0TGlzdGVuZXJzKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW50ZXJydXB0cyBhbGwgaW5wdXQgbGlzdGVuZXJzIHRoYXQgYXJlIGF0dGFjaGVkIHRvIHRoaXMgRGlzcGxheS5cclxuICAgKi9cclxuICBwdWJsaWMgaW50ZXJydXB0SW5wdXQoKTogdGhpcyB7XHJcbiAgICBjb25zdCBsaXN0ZW5lcnNDb3B5ID0gdGhpcy5pbnB1dExpc3RlbmVycztcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lcnNDb3B5Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBsaXN0ZW5lciA9IGxpc3RlbmVyc0NvcHlbIGkgXTtcclxuXHJcbiAgICAgIGxpc3RlbmVyLmludGVycnVwdCAmJiBsaXN0ZW5lci5pbnRlcnJ1cHQoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBlbnN1cmVOb3RQYWludGluZygpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLl9pc1BhaW50aW5nLFxyXG4gICAgICAnVGhpcyBzaG91bGQgbm90IGJlIHJ1biBpbiB0aGUgY2FsbCB0cmVlIG9mIHVwZGF0ZURpc3BsYXkoKS4gSWYgeW91IHNlZSB0aGlzLCBpdCBpcyBsaWtlbHkgdGhhdCBlaXRoZXIgdGhlICcgK1xyXG4gICAgICAnbGFzdCB1cGRhdGVEaXNwbGF5KCkgaGFkIGEgdGhyb3duIGVycm9yIGFuZCBpdCBpcyB0cnlpbmcgdG8gYmUgcnVuIGFnYWluIChpbiB3aGljaCBjYXNlLCBpbnZlc3RpZ2F0ZSB0aGF0ICcgK1xyXG4gICAgICAnZXJyb3IpLCBPUiBjb2RlIHdhcyBydW4vdHJpZ2dlcmVkIGZyb20gaW5zaWRlIGFuIHVwZGF0ZURpc3BsYXkoKSB0aGF0IGhhcyB0aGUgcG90ZW50aWFsIHRvIGNhdXNlIGFuIGluZmluaXRlICcgK1xyXG4gICAgICAnbG9vcCwgZS5nLiBDYW52YXNOb2RlIHBhaW50Q2FudmFzKCkgY2FsbCBtYW5pcHVsYXRpbmcgYW5vdGhlciBOb2RlLCBvciBhIGJvdW5kcyBsaXN0ZW5lciB0aGF0IFNjZW5lcnkgbWlzc2VkLicgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWdnZXJzIGEgbG9zcyBvZiBjb250ZXh0IGZvciBhbGwgV2ViR0wgYmxvY2tzLlxyXG4gICAqXHJcbiAgICogTk9URTogU2hvdWxkIGdlbmVyYWxseSBvbmx5IGJlIHVzZWQgZm9yIGRlYnVnZ2luZy5cclxuICAgKi9cclxuICBwdWJsaWMgbG9zZVdlYkdMQ29udGV4dHMoKTogdm9pZCB7XHJcbiAgICAoIGZ1bmN0aW9uIGxvc2VCYWNrYm9uZSggYmFja2JvbmU6IEJhY2tib25lRHJhd2FibGUgKSB7XHJcbiAgICAgIGlmICggYmFja2JvbmUuYmxvY2tzICkge1xyXG4gICAgICAgIGJhY2tib25lLmJsb2Nrcy5mb3JFYWNoKCAoIGJsb2NrOiBCbG9jayApID0+IHtcclxuICAgICAgICAgIGNvbnN0IGdsID0gKCBibG9jayBhcyB1bmtub3duIGFzIFdlYkdMQmxvY2sgKS5nbDtcclxuICAgICAgICAgIGlmICggZ2wgKSB7XHJcbiAgICAgICAgICAgIFV0aWxzLmxvc2VDb250ZXh0KCBnbCApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vVE9ETzogcGF0dGVybiBmb3IgdGhpcyBpdGVyYXRpb25cclxuICAgICAgICAgIGZvciAoIGxldCBkcmF3YWJsZSA9IGJsb2NrLmZpcnN0RHJhd2FibGU7IGRyYXdhYmxlICE9PSBudWxsOyBkcmF3YWJsZSA9IGRyYXdhYmxlLm5leHREcmF3YWJsZSApIHtcclxuICAgICAgICAgICAgbG9zZUJhY2tib25lKCBkcmF3YWJsZSApO1xyXG4gICAgICAgICAgICBpZiAoIGRyYXdhYmxlID09PSBibG9jay5sYXN0RHJhd2FibGUgKSB7IGJyZWFrOyB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICB9ICkoIHRoaXMuX3Jvb3RCYWNrYm9uZSEgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1ha2VzIHRoaXMgRGlzcGxheSBhdmFpbGFibGUgZm9yIGluc3BlY3Rpb24uXHJcbiAgICovXHJcbiAgcHVibGljIGluc3BlY3QoKTogdm9pZCB7XHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2NlbmVyeVNuYXBzaG90ID0gSlNPTi5zdHJpbmdpZnkoIHNjZW5lcnlTZXJpYWxpemUoIHRoaXMgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBIVE1MIGZyYWdtZW50IHRoYXQgaW5jbHVkZXMgYSBsYXJnZSBhbW91bnQgb2YgZGVidWdnaW5nIGluZm9ybWF0aW9uLCBpbmNsdWRpbmcgYSB2aWV3IG9mIHRoZVxyXG4gICAqIGluc3RhbmNlIHRyZWUgYW5kIGRyYXdhYmxlIHRyZWUuXHJcbiAgICovXHJcbiAgcHVibGljIGdldERlYnVnSFRNTCgpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgaGVhZGVyU3R5bGUgPSAnZm9udC13ZWlnaHQ6IGJvbGQ7IGZvbnQtc2l6ZTogMTIwJTsgbWFyZ2luLXRvcDogNXB4Oyc7XHJcblxyXG4gICAgbGV0IGRlcHRoID0gMDtcclxuXHJcbiAgICBsZXQgcmVzdWx0ID0gJyc7XHJcblxyXG4gICAgcmVzdWx0ICs9IGA8ZGl2IHN0eWxlPVwiJHtoZWFkZXJTdHlsZX1cIj5EaXNwbGF5ICgke3RoaXMuaWR9KSBTdW1tYXJ5PC9kaXY+YDtcclxuICAgIHJlc3VsdCArPSBgJHt0aGlzLnNpemUudG9TdHJpbmcoKX0gZnJhbWU6JHt0aGlzLl9mcmFtZUlkfSBpbnB1dDokeyEhdGhpcy5faW5wdXR9IGN1cnNvcjoke3RoaXMuX2xhc3RDdXJzb3J9PGJyLz5gO1xyXG5cclxuICAgIGZ1bmN0aW9uIG5vZGVDb3VudCggbm9kZTogTm9kZSApOiBudW1iZXIge1xyXG4gICAgICBsZXQgY291bnQgPSAxOyAvLyBmb3IgdXNcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb3VudCArPSBub2RlQ291bnQoIG5vZGUuY2hpbGRyZW5bIGkgXSApO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb3VudDtcclxuICAgIH1cclxuXHJcbiAgICByZXN1bHQgKz0gYE5vZGVzOiAke25vZGVDb3VudCggdGhpcy5fcm9vdE5vZGUgKX08YnIvPmA7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5zdGFuY2VDb3VudCggaW5zdGFuY2U6IEluc3RhbmNlICk6IG51bWJlciB7XHJcbiAgICAgIGxldCBjb3VudCA9IDE7IC8vIGZvciB1c1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBpbnN0YW5jZS5jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb3VudCArPSBpbnN0YW5jZUNvdW50KCBpbnN0YW5jZS5jaGlsZHJlblsgaSBdICk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNvdW50O1xyXG4gICAgfVxyXG5cclxuICAgIHJlc3VsdCArPSB0aGlzLl9iYXNlSW5zdGFuY2UgPyAoIGBJbnN0YW5jZXM6ICR7aW5zdGFuY2VDb3VudCggdGhpcy5fYmFzZUluc3RhbmNlICl9PGJyLz5gICkgOiAnJztcclxuXHJcbiAgICBmdW5jdGlvbiBkcmF3YWJsZUNvdW50KCBkcmF3YWJsZTogRHJhd2FibGUgKTogbnVtYmVyIHtcclxuICAgICAgbGV0IGNvdW50ID0gMTsgLy8gZm9yIHVzXHJcbiAgICAgIGlmICggKCBkcmF3YWJsZSBhcyB1bmtub3duIGFzIEJhY2tib25lRHJhd2FibGUgKS5ibG9ja3MgKSB7XHJcbiAgICAgICAgLy8gd2UncmUgYSBiYWNrYm9uZVxyXG4gICAgICAgIF8uZWFjaCggKCBkcmF3YWJsZSBhcyB1bmtub3duIGFzIEJhY2tib25lRHJhd2FibGUgKS5ibG9ja3MsIGNoaWxkRHJhd2FibGUgPT4ge1xyXG4gICAgICAgICAgY291bnQgKz0gZHJhd2FibGVDb3VudCggY2hpbGREcmF3YWJsZSApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggKCBkcmF3YWJsZSBhcyB1bmtub3duIGFzIEJsb2NrICkuZmlyc3REcmF3YWJsZSAmJiAoIGRyYXdhYmxlIGFzIHVua25vd24gYXMgQmxvY2sgKS5sYXN0RHJhd2FibGUgKSB7XHJcbiAgICAgICAgLy8gd2UncmUgYSBibG9ja1xyXG4gICAgICAgIGZvciAoIGxldCBjaGlsZERyYXdhYmxlID0gKCBkcmF3YWJsZSBhcyB1bmtub3duIGFzIEJsb2NrICkuZmlyc3REcmF3YWJsZTsgY2hpbGREcmF3YWJsZSAhPT0gKCBkcmF3YWJsZSBhcyB1bmtub3duIGFzIEJsb2NrICkubGFzdERyYXdhYmxlOyBjaGlsZERyYXdhYmxlID0gY2hpbGREcmF3YWJsZS5uZXh0RHJhd2FibGUgKSB7XHJcbiAgICAgICAgICBjb3VudCArPSBkcmF3YWJsZUNvdW50KCBjaGlsZERyYXdhYmxlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvdW50ICs9IGRyYXdhYmxlQ291bnQoICggZHJhd2FibGUgYXMgdW5rbm93biBhcyBCbG9jayApLmxhc3REcmF3YWJsZSEgKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY291bnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPIEJhY2tib25lRHJhd2FibGVcclxuICAgIHJlc3VsdCArPSB0aGlzLl9yb290QmFja2JvbmUgPyAoIGBEcmF3YWJsZXM6ICR7ZHJhd2FibGVDb3VudCggdGhpcy5fcm9vdEJhY2tib25lICl9PGJyLz5gICkgOiAnJztcclxuXHJcbiAgICBjb25zdCBkcmF3YWJsZUNvdW50TWFwOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307IC8vIHtzdHJpbmd9IGRyYXdhYmxlIGNvbnN0cnVjdG9yIG5hbWUgPT4ge251bWJlcn0gY291bnQgb2Ygc2VlblxyXG4gICAgLy8gaW5jcmVtZW50IHRoZSBjb3VudCBpbiBvdXIgbWFwXHJcbiAgICBmdW5jdGlvbiBjb3VudFJldGFpbmVkRHJhd2FibGUoIGRyYXdhYmxlOiBEcmF3YWJsZSApOiB2b2lkIHtcclxuICAgICAgY29uc3QgbmFtZSA9IGRyYXdhYmxlLmNvbnN0cnVjdG9yLm5hbWU7XHJcbiAgICAgIGlmICggZHJhd2FibGVDb3VudE1hcFsgbmFtZSBdICkge1xyXG4gICAgICAgIGRyYXdhYmxlQ291bnRNYXBbIG5hbWUgXSsrO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGRyYXdhYmxlQ291bnRNYXBbIG5hbWUgXSA9IDE7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZXRhaW5lZERyYXdhYmxlQ291bnQoIGluc3RhbmNlOiBJbnN0YW5jZSApOiBudW1iZXIge1xyXG4gICAgICBsZXQgY291bnQgPSAwO1xyXG4gICAgICBpZiAoIGluc3RhbmNlLnNlbGZEcmF3YWJsZSApIHtcclxuICAgICAgICBjb3VudFJldGFpbmVkRHJhd2FibGUoIGluc3RhbmNlLnNlbGZEcmF3YWJsZSApO1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBpbnN0YW5jZS5ncm91cERyYXdhYmxlICkge1xyXG4gICAgICAgIGNvdW50UmV0YWluZWREcmF3YWJsZSggaW5zdGFuY2UuZ3JvdXBEcmF3YWJsZSApO1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBpbnN0YW5jZS5zaGFyZWRDYWNoZURyYXdhYmxlICkge1xyXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVE9ETyBJbnN0YW5jZVxyXG4gICAgICAgIGNvdW50UmV0YWluZWREcmF3YWJsZSggaW5zdGFuY2Uuc2hhcmVkQ2FjaGVEcmF3YWJsZSApO1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgIH1cclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgaW5zdGFuY2UuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY291bnQgKz0gcmV0YWluZWREcmF3YWJsZUNvdW50KCBpbnN0YW5jZS5jaGlsZHJlblsgaSBdICk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNvdW50O1xyXG4gICAgfVxyXG5cclxuICAgIHJlc3VsdCArPSB0aGlzLl9iYXNlSW5zdGFuY2UgPyAoIGBSZXRhaW5lZCBEcmF3YWJsZXM6ICR7cmV0YWluZWREcmF3YWJsZUNvdW50KCB0aGlzLl9iYXNlSW5zdGFuY2UgKX08YnIvPmAgKSA6ICcnO1xyXG4gICAgZm9yICggY29uc3QgZHJhd2FibGVOYW1lIGluIGRyYXdhYmxlQ291bnRNYXAgKSB7XHJcbiAgICAgIHJlc3VsdCArPSBgJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7JHtkcmF3YWJsZU5hbWV9OiAke2RyYXdhYmxlQ291bnRNYXBbIGRyYXdhYmxlTmFtZSBdfTxici8+YDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBibG9ja1N1bW1hcnkoIGJsb2NrOiBCbG9jayApOiBzdHJpbmcge1xyXG4gICAgICAvLyBlbnN1cmUgd2UgYXJlIGEgYmxvY2tcclxuICAgICAgaWYgKCAhYmxvY2suZmlyc3REcmF3YWJsZSB8fCAhYmxvY2subGFzdERyYXdhYmxlICkge1xyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPIGRpc3BsYXkgc3R1ZmZcclxuICAgICAgY29uc3QgaGFzQmFja2JvbmUgPSBibG9jay5kb21EcmF3YWJsZSAmJiBibG9jay5kb21EcmF3YWJsZS5ibG9ja3M7XHJcblxyXG4gICAgICBsZXQgZGl2ID0gYDxkaXYgc3R5bGU9XCJtYXJnaW4tbGVmdDogJHtkZXB0aCAqIDIwfXB4XCI+YDtcclxuXHJcbiAgICAgIGRpdiArPSBibG9jay50b1N0cmluZygpO1xyXG4gICAgICBpZiAoICFoYXNCYWNrYm9uZSApIHtcclxuICAgICAgICBkaXYgKz0gYCAoJHtibG9jay5kcmF3YWJsZUNvdW50fSBkcmF3YWJsZXMpYDtcclxuICAgICAgfVxyXG5cclxuICAgICAgZGl2ICs9ICc8L2Rpdj4nO1xyXG5cclxuICAgICAgZGVwdGggKz0gMTtcclxuICAgICAgaWYgKCBoYXNCYWNrYm9uZSApIHtcclxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE8gZGlzcGxheSBzdHVmZlxyXG4gICAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IGJsb2NrLmRvbURyYXdhYmxlLmJsb2Nrcy5sZW5ndGg7IGsrKyApIHtcclxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVE9ETyBkaXNwbGF5IHN0dWZmXHJcbiAgICAgICAgICBkaXYgKz0gYmxvY2tTdW1tYXJ5KCBibG9jay5kb21EcmF3YWJsZS5ibG9ja3NbIGsgXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBkZXB0aCAtPSAxO1xyXG5cclxuICAgICAgcmV0dXJuIGRpdjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMuX3Jvb3RCYWNrYm9uZSApIHtcclxuICAgICAgcmVzdWx0ICs9IGA8ZGl2IHN0eWxlPVwiJHtoZWFkZXJTdHlsZX1cIj5CbG9jayBTdW1tYXJ5PC9kaXY+YDtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcm9vdEJhY2tib25lLmJsb2Nrcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICByZXN1bHQgKz0gYmxvY2tTdW1tYXJ5KCB0aGlzLl9yb290QmFja2JvbmUuYmxvY2tzWyBpIF0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluc3RhbmNlU3VtbWFyeSggaW5zdGFuY2U6IEluc3RhbmNlICk6IHN0cmluZyB7XHJcbiAgICAgIGxldCBpU3VtbWFyeSA9ICcnO1xyXG5cclxuICAgICAgZnVuY3Rpb24gYWRkUXVhbGlmaWVyKCB0ZXh0OiBzdHJpbmcgKTogdm9pZCB7XHJcbiAgICAgICAgaVN1bW1hcnkgKz0gYCA8c3BhbiBzdHlsZT1cImNvbG9yOiAjMDA4XCI+JHt0ZXh0fTwvc3Bhbj5gO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBub2RlID0gaW5zdGFuY2Uubm9kZSE7XHJcblxyXG4gICAgICBpU3VtbWFyeSArPSBpbnN0YW5jZS5pZDtcclxuICAgICAgaVN1bW1hcnkgKz0gYCAke25vZGUuY29uc3RydWN0b3IubmFtZSA/IG5vZGUuY29uc3RydWN0b3IubmFtZSA6ICc/J31gO1xyXG4gICAgICBpU3VtbWFyeSArPSBgIDxzcGFuIHN0eWxlPVwiZm9udC13ZWlnaHQ6ICR7bm9kZS5pc1BhaW50ZWQoKSA/ICdib2xkJyA6ICdub3JtYWwnfVwiPiR7bm9kZS5pZH08L3NwYW4+YDtcclxuICAgICAgaVN1bW1hcnkgKz0gbm9kZS5nZXREZWJ1Z0hUTUxFeHRyYXMoKTtcclxuXHJcbiAgICAgIGlmICggIW5vZGUudmlzaWJsZSApIHtcclxuICAgICAgICBhZGRRdWFsaWZpZXIoICdpbnZpcycgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoICFpbnN0YW5jZS52aXNpYmxlICkge1xyXG4gICAgICAgIGFkZFF1YWxpZmllciggJ0ktaW52aXMnICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCAhaW5zdGFuY2UucmVsYXRpdmVWaXNpYmxlICkge1xyXG4gICAgICAgIGFkZFF1YWxpZmllciggJ0ktcmVsLWludmlzJyApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggIWluc3RhbmNlLnNlbGZWaXNpYmxlICkge1xyXG4gICAgICAgIGFkZFF1YWxpZmllciggJ0ktc2VsZi1pbnZpcycgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoICFpbnN0YW5jZS5maXR0YWJpbGl0eS5hbmNlc3RvcnNGaXR0YWJsZSApIHtcclxuICAgICAgICBhZGRRdWFsaWZpZXIoICdub2ZpdC1hbmNlc3RvcicgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoICFpbnN0YW5jZS5maXR0YWJpbGl0eS5zZWxmRml0dGFibGUgKSB7XHJcbiAgICAgICAgYWRkUXVhbGlmaWVyKCAnbm9maXQtc2VsZicgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIG5vZGUucGlja2FibGUgPT09IHRydWUgKSB7XHJcbiAgICAgICAgYWRkUXVhbGlmaWVyKCAncGlja2FibGUnICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBub2RlLnBpY2thYmxlID09PSBmYWxzZSApIHtcclxuICAgICAgICBhZGRRdWFsaWZpZXIoICd1bnBpY2thYmxlJyApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggaW5zdGFuY2UudHJhaWwhLmlzUGlja2FibGUoKSApIHtcclxuICAgICAgICBhZGRRdWFsaWZpZXIoICc8c3BhbiBzdHlsZT1cImNvbG9yOiAjODA4XCI+aGl0czwvc3Bhbj4nICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBub2RlLmdldEVmZmVjdGl2ZUN1cnNvcigpICkge1xyXG4gICAgICAgIGFkZFF1YWxpZmllciggYGVmZmVjdGl2ZUN1cnNvcjoke25vZGUuZ2V0RWZmZWN0aXZlQ3Vyc29yKCl9YCApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggbm9kZS5jbGlwQXJlYSApIHtcclxuICAgICAgICBhZGRRdWFsaWZpZXIoICdjbGlwQXJlYScgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIG5vZGUubW91c2VBcmVhICkge1xyXG4gICAgICAgIGFkZFF1YWxpZmllciggJ21vdXNlQXJlYScgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIG5vZGUudG91Y2hBcmVhICkge1xyXG4gICAgICAgIGFkZFF1YWxpZmllciggJ3RvdWNoQXJlYScgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIG5vZGUuZ2V0SW5wdXRMaXN0ZW5lcnMoKS5sZW5ndGggKSB7XHJcbiAgICAgICAgYWRkUXVhbGlmaWVyKCAnaW5wdXRMaXN0ZW5lcnMnICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBub2RlLmdldFJlbmRlcmVyKCkgKSB7XHJcbiAgICAgICAgYWRkUXVhbGlmaWVyKCBgcmVuZGVyZXI6JHtub2RlLmdldFJlbmRlcmVyKCl9YCApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggbm9kZS5pc0xheWVyU3BsaXQoKSApIHtcclxuICAgICAgICBhZGRRdWFsaWZpZXIoICdsYXllclNwbGl0JyApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggbm9kZS5vcGFjaXR5IDwgMSApIHtcclxuICAgICAgICBhZGRRdWFsaWZpZXIoIGBvcGFjaXR5OiR7bm9kZS5vcGFjaXR5fWAgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIG5vZGUuZGlzYWJsZWRPcGFjaXR5IDwgMSApIHtcclxuICAgICAgICBhZGRRdWFsaWZpZXIoIGBkaXNhYmxlZE9wYWNpdHk6JHtub2RlLmRpc2FibGVkT3BhY2l0eX1gICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggbm9kZS5fYm91bmRzRXZlbnRDb3VudCA+IDAgKSB7XHJcbiAgICAgICAgYWRkUXVhbGlmaWVyKCBgPHNwYW4gc3R5bGU9XCJjb2xvcjogIzgwMFwiPmJvdW5kc0xpc3Rlbjoke25vZGUuX2JvdW5kc0V2ZW50Q291bnR9OiR7bm9kZS5fYm91bmRzRXZlbnRTZWxmQ291bnR9PC9zcGFuPmAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IHRyYW5zZm9ybVR5cGUgPSAnJztcclxuICAgICAgc3dpdGNoKCBub2RlLnRyYW5zZm9ybS5nZXRNYXRyaXgoKS50eXBlICkge1xyXG4gICAgICAgIGNhc2UgTWF0cml4M1R5cGUuSURFTlRJVFk6XHJcbiAgICAgICAgICB0cmFuc2Zvcm1UeXBlID0gJyc7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIE1hdHJpeDNUeXBlLlRSQU5TTEFUSU9OXzJEOlxyXG4gICAgICAgICAgdHJhbnNmb3JtVHlwZSA9ICd0cmFuc2xhdGVkJztcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgTWF0cml4M1R5cGUuU0NBTElORzpcclxuICAgICAgICAgIHRyYW5zZm9ybVR5cGUgPSAnc2NhbGUnO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBNYXRyaXgzVHlwZS5BRkZJTkU6XHJcbiAgICAgICAgICB0cmFuc2Zvcm1UeXBlID0gJ2FmZmluZSc7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIE1hdHJpeDNUeXBlLk9USEVSOlxyXG4gICAgICAgICAgdHJhbnNmb3JtVHlwZSA9ICdvdGhlcic7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgaW52YWxpZCBtYXRyaXggdHlwZTogJHtub2RlLnRyYW5zZm9ybS5nZXRNYXRyaXgoKS50eXBlfWAgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHRyYW5zZm9ybVR5cGUgKSB7XHJcbiAgICAgICAgaVN1bW1hcnkgKz0gYCA8c3BhbiBzdHlsZT1cImNvbG9yOiAjODhmXCIgdGl0bGU9XCIke25vZGUudHJhbnNmb3JtLmdldE1hdHJpeCgpLnRvU3RyaW5nKCkucmVwbGFjZSggJ1xcbicsICcmIzEwOycgKX1cIj4ke3RyYW5zZm9ybVR5cGV9PC9zcGFuPmA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlTdW1tYXJ5ICs9IGAgPHNwYW4gc3R5bGU9XCJjb2xvcjogIzg4OFwiPltUcmFpbCAke2luc3RhbmNlLnRyYWlsIS5pbmRpY2VzLmpvaW4oICcuJyApfV08L3NwYW4+YDtcclxuICAgICAgLy8gaVN1bW1hcnkgKz0gYCA8c3BhbiBzdHlsZT1cImNvbG9yOiAjYzg4XCI+JHtzdHIoIGluc3RhbmNlLnN0YXRlICl9PC9zcGFuPmA7XHJcbiAgICAgIGlTdW1tYXJ5ICs9IGAgPHNwYW4gc3R5bGU9XCJjb2xvcjogIzhjOFwiPiR7bm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmJpdG1hc2sudG9TdHJpbmcoIDE2ICl9JHtub2RlLl9yZW5kZXJlckJpdG1hc2sgIT09IFJlbmRlcmVyLmJpdG1hc2tOb2RlRGVmYXVsdCA/IGAgKCR7bm9kZS5fcmVuZGVyZXJCaXRtYXNrLnRvU3RyaW5nKCAxNiApfSlgIDogJyd9PC9zcGFuPmA7XHJcblxyXG4gICAgICByZXR1cm4gaVN1bW1hcnk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZHJhd2FibGVTdW1tYXJ5KCBkcmF3YWJsZTogRHJhd2FibGUgKTogc3RyaW5nIHtcclxuICAgICAgbGV0IGRyYXdhYmxlU3RyaW5nID0gZHJhd2FibGUudG9TdHJpbmcoKTtcclxuICAgICAgaWYgKCBkcmF3YWJsZS52aXNpYmxlICkge1xyXG4gICAgICAgIGRyYXdhYmxlU3RyaW5nID0gYDxzdHJvbmc+JHtkcmF3YWJsZVN0cmluZ308L3N0cm9uZz5gO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggZHJhd2FibGUuZGlydHkgKSB7XHJcbiAgICAgICAgZHJhd2FibGVTdHJpbmcgKz0gKCBkcmF3YWJsZS5kaXJ0eSA/ICcgPHNwYW4gc3R5bGU9XCJjb2xvcjogI2MwMDtcIj5beF08L3NwYW4+JyA6ICcnICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCAhZHJhd2FibGUuZml0dGFibGUgKSB7XHJcbiAgICAgICAgZHJhd2FibGVTdHJpbmcgKz0gKCBkcmF3YWJsZS5kaXJ0eSA/ICcgPHNwYW4gc3R5bGU9XCJjb2xvcjogIzBjMDtcIj5bbm8tZml0XTwvc3Bhbj4nIDogJycgKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZHJhd2FibGVTdHJpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcHJpbnRJbnN0YW5jZVN1YnRyZWUoIGluc3RhbmNlOiBJbnN0YW5jZSApOiB2b2lkIHtcclxuICAgICAgbGV0IGRpdiA9IGA8ZGl2IHN0eWxlPVwibWFyZ2luLWxlZnQ6ICR7ZGVwdGggKiAyMH1weFwiPmA7XHJcblxyXG4gICAgICBmdW5jdGlvbiBhZGREcmF3YWJsZSggbmFtZTogc3RyaW5nLCBkcmF3YWJsZTogRHJhd2FibGUgKTogdm9pZCB7XHJcbiAgICAgICAgZGl2ICs9IGAgPHNwYW4gc3R5bGU9XCJjb2xvcjogIzg4OFwiPiR7bmFtZX06JHtkcmF3YWJsZVN1bW1hcnkoIGRyYXdhYmxlICl9PC9zcGFuPmA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGRpdiArPSBpbnN0YW5jZVN1bW1hcnkoIGluc3RhbmNlICk7XHJcblxyXG4gICAgICBpbnN0YW5jZS5zZWxmRHJhd2FibGUgJiYgYWRkRHJhd2FibGUoICdzZWxmJywgaW5zdGFuY2Uuc2VsZkRyYXdhYmxlICk7XHJcbiAgICAgIGluc3RhbmNlLmdyb3VwRHJhd2FibGUgJiYgYWRkRHJhd2FibGUoICdncm91cCcsIGluc3RhbmNlLmdyb3VwRHJhd2FibGUgKTtcclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPIEluc3RhbmNlXHJcbiAgICAgIGluc3RhbmNlLnNoYXJlZENhY2hlRHJhd2FibGUgJiYgYWRkRHJhd2FibGUoICdzaGFyZWRDYWNoZScsIGluc3RhbmNlLnNoYXJlZENhY2hlRHJhd2FibGUgKTtcclxuXHJcbiAgICAgIGRpdiArPSAnPC9kaXY+JztcclxuICAgICAgcmVzdWx0ICs9IGRpdjtcclxuXHJcbiAgICAgIGRlcHRoICs9IDE7XHJcbiAgICAgIF8uZWFjaCggaW5zdGFuY2UuY2hpbGRyZW4sIGNoaWxkSW5zdGFuY2UgPT4ge1xyXG4gICAgICAgIHByaW50SW5zdGFuY2VTdWJ0cmVlKCBjaGlsZEluc3RhbmNlICk7XHJcbiAgICAgIH0gKTtcclxuICAgICAgZGVwdGggLT0gMTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMuX2Jhc2VJbnN0YW5jZSApIHtcclxuICAgICAgcmVzdWx0ICs9IGA8ZGl2IHN0eWxlPVwiJHtoZWFkZXJTdHlsZX1cIj5Sb290IEluc3RhbmNlIFRyZWU8L2Rpdj5gO1xyXG4gICAgICBwcmludEluc3RhbmNlU3VidHJlZSggdGhpcy5fYmFzZUluc3RhbmNlICk7XHJcbiAgICB9XHJcblxyXG4gICAgXy5lYWNoKCB0aGlzLl9zaGFyZWRDYW52YXNJbnN0YW5jZXMsIGluc3RhbmNlID0+IHtcclxuICAgICAgcmVzdWx0ICs9IGA8ZGl2IHN0eWxlPVwiJHtoZWFkZXJTdHlsZX1cIj5TaGFyZWQgQ2FudmFzIEluc3RhbmNlIFRyZWU8L2Rpdj5gO1xyXG4gICAgICBwcmludEluc3RhbmNlU3VidHJlZSggaW5zdGFuY2UgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBmdW5jdGlvbiBwcmludERyYXdhYmxlU3VidHJlZSggZHJhd2FibGU6IERyYXdhYmxlICk6IHZvaWQge1xyXG4gICAgICBsZXQgZGl2ID0gYDxkaXYgc3R5bGU9XCJtYXJnaW4tbGVmdDogJHtkZXB0aCAqIDIwfXB4XCI+YDtcclxuXHJcbiAgICAgIGRpdiArPSBkcmF3YWJsZVN1bW1hcnkoIGRyYXdhYmxlICk7XHJcbiAgICAgIGlmICggKCBkcmF3YWJsZSBhcyB1bmtub3duIGFzIFNlbGZEcmF3YWJsZSApLmluc3RhbmNlICkge1xyXG4gICAgICAgIGRpdiArPSBgIDxzcGFuIHN0eWxlPVwiY29sb3I6ICMwYTA7XCI+KCR7KCBkcmF3YWJsZSBhcyB1bmtub3duIGFzIFNlbGZEcmF3YWJsZSApLmluc3RhbmNlLnRyYWlsLnRvUGF0aFN0cmluZygpfSk8L3NwYW4+YDtcclxuICAgICAgICBkaXYgKz0gYCZuYnNwOyZuYnNwOyZuYnNwOyR7aW5zdGFuY2VTdW1tYXJ5KCAoIGRyYXdhYmxlIGFzIHVua25vd24gYXMgU2VsZkRyYXdhYmxlICkuaW5zdGFuY2UgKX1gO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCAoIGRyYXdhYmxlIGFzIHVua25vd24gYXMgQmFja2JvbmVEcmF3YWJsZSApLmJhY2tib25lSW5zdGFuY2UgKSB7XHJcbiAgICAgICAgZGl2ICs9IGAgPHNwYW4gc3R5bGU9XCJjb2xvcjogI2EwMDtcIj4oJHsoIGRyYXdhYmxlIGFzIHVua25vd24gYXMgQmFja2JvbmVEcmF3YWJsZSApLmJhY2tib25lSW5zdGFuY2UudHJhaWwudG9QYXRoU3RyaW5nKCl9KTwvc3Bhbj5gO1xyXG4gICAgICAgIGRpdiArPSBgJm5ic3A7Jm5ic3A7Jm5ic3A7JHtpbnN0YW5jZVN1bW1hcnkoICggZHJhd2FibGUgYXMgdW5rbm93biBhcyBCYWNrYm9uZURyYXdhYmxlICkuYmFja2JvbmVJbnN0YW5jZSApfWA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGRpdiArPSAnPC9kaXY+JztcclxuICAgICAgcmVzdWx0ICs9IGRpdjtcclxuXHJcbiAgICAgIGlmICggKCBkcmF3YWJsZSBhcyB1bmtub3duIGFzIEJhY2tib25lRHJhd2FibGUgKS5ibG9ja3MgKSB7XHJcbiAgICAgICAgLy8gd2UncmUgYSBiYWNrYm9uZVxyXG4gICAgICAgIGRlcHRoICs9IDE7XHJcbiAgICAgICAgXy5lYWNoKCAoIGRyYXdhYmxlIGFzIHVua25vd24gYXMgQmFja2JvbmVEcmF3YWJsZSApLmJsb2NrcywgY2hpbGREcmF3YWJsZSA9PiB7XHJcbiAgICAgICAgICBwcmludERyYXdhYmxlU3VidHJlZSggY2hpbGREcmF3YWJsZSApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBkZXB0aCAtPSAxO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCAoIGRyYXdhYmxlIGFzIHVua25vd24gYXMgQmxvY2sgKS5maXJzdERyYXdhYmxlICYmICggZHJhd2FibGUgYXMgdW5rbm93biBhcyBCbG9jayApLmxhc3REcmF3YWJsZSApIHtcclxuICAgICAgICAvLyB3ZSdyZSBhIGJsb2NrXHJcbiAgICAgICAgZGVwdGggKz0gMTtcclxuICAgICAgICBmb3IgKCBsZXQgY2hpbGREcmF3YWJsZSA9ICggZHJhd2FibGUgYXMgdW5rbm93biBhcyBCbG9jayApLmZpcnN0RHJhd2FibGU7IGNoaWxkRHJhd2FibGUgIT09ICggZHJhd2FibGUgYXMgdW5rbm93biBhcyBCbG9jayApLmxhc3REcmF3YWJsZTsgY2hpbGREcmF3YWJsZSA9IGNoaWxkRHJhd2FibGUubmV4dERyYXdhYmxlICkge1xyXG4gICAgICAgICAgcHJpbnREcmF3YWJsZVN1YnRyZWUoIGNoaWxkRHJhd2FibGUgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJpbnREcmF3YWJsZVN1YnRyZWUoICggZHJhd2FibGUgYXMgdW5rbm93biBhcyBCbG9jayApLmxhc3REcmF3YWJsZSEgKTsgLy8gd2Fzbid0IGhpdCBpbiBvdXIgc2ltcGxpZmllZCAoYW5kIHNhZmVyKSBsb29wXHJcbiAgICAgICAgZGVwdGggLT0gMTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy5fcm9vdEJhY2tib25lICkge1xyXG4gICAgICByZXN1bHQgKz0gJzxkaXYgc3R5bGU9XCJmb250LXdlaWdodDogYm9sZDtcIj5Sb290IERyYXdhYmxlIFRyZWU8L2Rpdj4nO1xyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE8gQmFja2JvbmVEcmF3YWJsZVxyXG4gICAgICBwcmludERyYXdhYmxlU3VidHJlZSggdGhpcy5fcm9vdEJhY2tib25lICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9PSFRXTyBUT0RPOiBhZGQgc2hhcmVkIGNhY2hlIGRyYXdhYmxlIHRyZWVzXHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGdldERlYnVnSFRNTCgpIGluZm9ybWF0aW9uLCBidXQgd3JhcHBlZCBpbnRvIGEgZnVsbCBIVE1MIHBhZ2UgaW5jbHVkZWQgaW4gYSBkYXRhIFVSSS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0RGVidWdVUkkoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCwke2VuY29kZVVSSUNvbXBvbmVudChcclxuICAgICAgYCR7JzwhRE9DVFlQRSBodG1sPicgK1xyXG4gICAgICAnPGh0bWwgbGFuZz1cImVuXCI+JyArXHJcbiAgICAgICc8aGVhZD48dGl0bGU+U2NlbmVyeSBEZWJ1ZyBTbmFwc2hvdDwvdGl0bGU+PC9oZWFkPicgK1xyXG4gICAgICAnPGJvZHkgc3R5bGU9XCJmb250LXNpemU6IDEycHg7XCI+J30ke3RoaXMuZ2V0RGVidWdIVE1MKCl9PC9ib2R5PmAgK1xyXG4gICAgICAnPC9odG1sPidcclxuICAgICl9YDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGVtcHRzIHRvIG9wZW4gYSBwb3B1cCB3aXRoIHRoZSBnZXREZWJ1Z0hUTUwoKSBpbmZvcm1hdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgcG9wdXBEZWJ1ZygpOiB2b2lkIHtcclxuICAgIHdpbmRvdy5vcGVuKCB0aGlzLmdldERlYnVnVVJJKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGVtcHRzIHRvIG9wZW4gYW4gaWZyYW1lIHBvcHVwIHdpdGggdGhlIGdldERlYnVnSFRNTCgpIGluZm9ybWF0aW9uIGluIHRoZSBzYW1lIHdpbmRvdy4gVGhpcyBpcyBzaW1pbGFyIHRvXHJcbiAgICogcG9wdXBEZWJ1ZygpLCBidXQgc2hvdWxkIHdvcmsgaW4gYnJvd3NlcnMgdGhhdCBibG9jayBwb3B1cHMsIG9yIHByZXZlbnQgdGhhdCB0eXBlIG9mIGRhdGEgVVJJIGJlaW5nIG9wZW5lZC5cclxuICAgKi9cclxuICBwdWJsaWMgaWZyYW1lRGVidWcoKTogdm9pZCB7XHJcbiAgICBjb25zdCBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaWZyYW1lJyApO1xyXG4gICAgaWZyYW1lLndpZHRoID0gJycgKyB3aW5kb3cuaW5uZXJXaWR0aDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWQtc2ltLXRleHRcclxuICAgIGlmcmFtZS5oZWlnaHQgPSAnJyArIHdpbmRvdy5pbm5lckhlaWdodDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWQtc2ltLXRleHRcclxuICAgIGlmcmFtZS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICBpZnJhbWUuc3R5bGUubGVmdCA9ICcwJztcclxuICAgIGlmcmFtZS5zdHlsZS50b3AgPSAnMCc7XHJcbiAgICBpZnJhbWUuc3R5bGUuekluZGV4ID0gJzEwMDAwJztcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGlmcmFtZSApO1xyXG5cclxuICAgIGlmcmFtZS5jb250ZW50V2luZG93IS5kb2N1bWVudC5vcGVuKCk7XHJcbiAgICBpZnJhbWUuY29udGVudFdpbmRvdyEuZG9jdW1lbnQud3JpdGUoIHRoaXMuZ2V0RGVidWdIVE1MKCkgKTtcclxuICAgIGlmcmFtZS5jb250ZW50V2luZG93IS5kb2N1bWVudC5jbG9zZSgpO1xyXG5cclxuICAgIGlmcmFtZS5jb250ZW50V2luZG93IS5kb2N1bWVudC5ib2R5LnN0eWxlLmJhY2tncm91bmQgPSAnd2hpdGUnO1xyXG5cclxuICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2J1dHRvbicgKTtcclxuICAgIGNsb3NlQnV0dG9uLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgIGNsb3NlQnV0dG9uLnN0eWxlLnRvcCA9ICcwJztcclxuICAgIGNsb3NlQnV0dG9uLnN0eWxlLnJpZ2h0ID0gJzAnO1xyXG4gICAgY2xvc2VCdXR0b24uc3R5bGUuekluZGV4ID0gJzEwMDAxJztcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGNsb3NlQnV0dG9uICk7XHJcblxyXG4gICAgY2xvc2VCdXR0b24udGV4dENvbnRlbnQgPSAnY2xvc2UnO1xyXG5cclxuICAgIC8vIEEgbm9ybWFsICdjbGljaycgZXZlbnQgbGlzdGVuZXIgZG9lc24ndCBzZWVtIHRvIGJlIHdvcmtpbmcuIFRoaXMgaXMgbGVzcy10aGFuLWlkZWFsLlxyXG4gICAgWyAncG9pbnRlcmRvd24nLCAnY2xpY2snLCAndG91Y2hkb3duJyBdLmZvckVhY2goIGV2ZW50VHlwZSA9PiB7XHJcbiAgICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50VHlwZSwgKCkgPT4ge1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoIGlmcmFtZSApO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoIGNsb3NlQnV0dG9uICk7XHJcbiAgICAgIH0sIHRydWUgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRQRE9NRGVidWdIVE1MKCk6IHN0cmluZyB7XHJcbiAgICBsZXQgcmVzdWx0ID0gJyc7XHJcblxyXG4gICAgY29uc3QgaGVhZGVyU3R5bGUgPSAnZm9udC13ZWlnaHQ6IGJvbGQ7IGZvbnQtc2l6ZTogMTIwJTsgbWFyZ2luLXRvcDogNXB4Oyc7XHJcbiAgICBjb25zdCBpbmRlbnQgPSAnJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7JztcclxuXHJcbiAgICByZXN1bHQgKz0gYDxkaXYgc3R5bGU9XCIke2hlYWRlclN0eWxlfVwiPkFjY2Vzc2libGUgSW5zdGFuY2VzPC9kaXY+PGJyPmA7XHJcblxyXG4gICAgcmVjdXJzZSggdGhpcy5fcm9vdFBET01JbnN0YW5jZSEsICcnICk7XHJcblxyXG4gICAgZnVuY3Rpb24gcmVjdXJzZSggaW5zdGFuY2U6IFBET01JbnN0YW5jZSwgaW5kZW50YXRpb246IHN0cmluZyApOiB2b2lkIHtcclxuICAgICAgcmVzdWx0ICs9IGAke2luZGVudGF0aW9uICsgZXNjYXBlSFRNTCggYCR7aW5zdGFuY2UuaXNSb290SW5zdGFuY2UgPyAnJyA6IGluc3RhbmNlLm5vZGUhLnRhZ05hbWV9ICR7aW5zdGFuY2UudG9TdHJpbmcoKX1gICl9PGJyPmA7XHJcbiAgICAgIGluc3RhbmNlLmNoaWxkcmVuLmZvckVhY2goICggY2hpbGQ6IFBET01JbnN0YW5jZSApID0+IHtcclxuICAgICAgICByZWN1cnNlKCBjaGlsZCwgaW5kZW50YXRpb24gKyBpbmRlbnQgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc3VsdCArPSBgPGJyPjxkaXYgc3R5bGU9XCIke2hlYWRlclN0eWxlfVwiPlBhcmFsbGVsIERPTTwvZGl2Pjxicj5gO1xyXG5cclxuICAgIGxldCBwYXJhbGxlbERPTSA9IHRoaXMuX3Jvb3RQRE9NSW5zdGFuY2UhLnBlZXIhLnByaW1hcnlTaWJsaW5nIS5vdXRlckhUTUw7XHJcbiAgICBwYXJhbGxlbERPTSA9IHBhcmFsbGVsRE9NLnJlcGxhY2UoIC8+PC9nLCAnPlxcbjwnICk7XHJcbiAgICBjb25zdCBsaW5lcyA9IHBhcmFsbGVsRE9NLnNwbGl0KCAnXFxuJyApO1xyXG5cclxuICAgIGxldCBpbmRlbnRhdGlvbiA9ICcnO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGxpbmUgPSBsaW5lc1sgaSBdO1xyXG4gICAgICBjb25zdCBpc0VuZFRhZyA9IGxpbmUuc3RhcnRzV2l0aCggJzwvJyApO1xyXG5cclxuICAgICAgaWYgKCBpc0VuZFRhZyApIHtcclxuICAgICAgICBpbmRlbnRhdGlvbiA9IGluZGVudGF0aW9uLnNsaWNlKCBpbmRlbnQubGVuZ3RoICk7XHJcbiAgICAgIH1cclxuICAgICAgcmVzdWx0ICs9IGAke2luZGVudGF0aW9uICsgZXNjYXBlSFRNTCggbGluZSApfTxicj5gO1xyXG4gICAgICBpZiAoICFpc0VuZFRhZyApIHtcclxuICAgICAgICBpbmRlbnRhdGlvbiArPSBpbmRlbnQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaWxsIGF0dGVtcHQgdG8gY2FsbCBjYWxsYmFjaygge3N0cmluZ30gZGF0YVVSSSApIHdpdGggdGhlIHJhc3Rlcml6YXRpb24gb2YgdGhlIGVudGlyZSBEaXNwbGF5J3MgRE9NIHN0cnVjdHVyZSxcclxuICAgKiB1c2VkIGZvciBpbnRlcm5hbCB0ZXN0aW5nLiBXaWxsIGNhbGwtYmFjayBudWxsIGlmIHRoZXJlIHdhcyBhbiBlcnJvclxyXG4gICAqXHJcbiAgICogT25seSB0ZXN0ZWQgb24gcmVjZW50IENocm9tZSBhbmQgRmlyZWZveCwgbm90IHJlY29tbWVuZGVkIGZvciBnZW5lcmFsIHVzZS4gR3VhcmFudGVlZCBub3QgdG8gd29yayBmb3IgSUUgPD0gMTAuXHJcbiAgICpcclxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzM5NCBmb3Igc29tZSBkZXRhaWxzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBmb3JlaWduT2JqZWN0UmFzdGVyaXphdGlvbiggY2FsbGJhY2s6ICggdXJsOiBzdHJpbmcgfCBudWxsICkgPT4gdm9pZCApOiB2b2lkIHtcclxuICAgIC8vIFNjYW4gb3VyIGRyYXdhYmxlIHRyZWUgZm9yIENhbnZhc2VzLiBXZSdsbCByYXN0ZXJpemUgdGhlbSBoZXJlICh0byBkYXRhIFVSTHMpIHNvIHdlIGNhbiByZXBsYWNlIHRoZW0gbGF0ZXIgaW5cclxuICAgIC8vIHRoZSBIVE1MIHRyZWUgKHdpdGggaW1hZ2VzKSBiZWZvcmUgcHV0dGluZyB0aGF0IGluIHRoZSBmb3JlaWduT2JqZWN0LiBUaGF0IHdheSwgd2UgY2FuIGFjdHVhbGx5IGRpc3BsYXlcclxuICAgIC8vIHRoaW5ncyByZW5kZXJlZCBpbiBDYW52YXMgaW4gb3VyIHJhc3Rlcml6YXRpb24uXHJcbiAgICBjb25zdCBjYW52YXNVcmxNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcclxuXHJcbiAgICBsZXQgdW5rbm93bklkcyA9IDA7XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkQ2FudmFzKCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50ICk6IHZvaWQge1xyXG4gICAgICBpZiAoICFjYW52YXMuaWQgKSB7XHJcbiAgICAgICAgY2FudmFzLmlkID0gYHVua25vd24tY2FudmFzLSR7dW5rbm93bklkcysrfWA7XHJcbiAgICAgIH1cclxuICAgICAgY2FudmFzVXJsTWFwWyBjYW52YXMuaWQgXSA9IGNhbnZhcy50b0RhdGFVUkwoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzY2FuRm9yQ2FudmFzZXMoIGRyYXdhYmxlOiBEcmF3YWJsZSApOiB2b2lkIHtcclxuICAgICAgaWYgKCBkcmF3YWJsZSBpbnN0YW5jZW9mIEJhY2tib25lRHJhd2FibGUgKSB7XHJcbiAgICAgICAgLy8gd2UncmUgYSBiYWNrYm9uZVxyXG4gICAgICAgIF8uZWFjaCggZHJhd2FibGUuYmxvY2tzLCBjaGlsZERyYXdhYmxlID0+IHtcclxuICAgICAgICAgIHNjYW5Gb3JDYW52YXNlcyggY2hpbGREcmF3YWJsZSApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggZHJhd2FibGUgaW5zdGFuY2VvZiBCbG9jayAmJiBkcmF3YWJsZS5maXJzdERyYXdhYmxlICYmIGRyYXdhYmxlLmxhc3REcmF3YWJsZSApIHtcclxuICAgICAgICAvLyB3ZSdyZSBhIGJsb2NrXHJcbiAgICAgICAgZm9yICggbGV0IGNoaWxkRHJhd2FibGUgPSBkcmF3YWJsZS5maXJzdERyYXdhYmxlOyBjaGlsZERyYXdhYmxlICE9PSBkcmF3YWJsZS5sYXN0RHJhd2FibGU7IGNoaWxkRHJhd2FibGUgPSBjaGlsZERyYXdhYmxlLm5leHREcmF3YWJsZSApIHtcclxuICAgICAgICAgIHNjYW5Gb3JDYW52YXNlcyggY2hpbGREcmF3YWJsZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzY2FuRm9yQ2FudmFzZXMoIGRyYXdhYmxlLmxhc3REcmF3YWJsZSApOyAvLyB3YXNuJ3QgaGl0IGluIG91ciBzaW1wbGlmaWVkIChhbmQgc2FmZXIpIGxvb3BcclxuXHJcbiAgICAgICAgaWYgKCAoIGRyYXdhYmxlIGluc3RhbmNlb2YgQ2FudmFzQmxvY2sgfHwgZHJhd2FibGUgaW5zdGFuY2VvZiBXZWJHTEJsb2NrICkgJiYgZHJhd2FibGUuY2FudmFzICYmIGRyYXdhYmxlLmNhbnZhcyBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MQ2FudmFzRWxlbWVudCApIHtcclxuICAgICAgICAgIGFkZENhbnZhcyggZHJhd2FibGUuY2FudmFzICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIERPTURyYXdhYmxlICYmIGRyYXdhYmxlIGluc3RhbmNlb2YgRE9NRHJhd2FibGUgKSB7XHJcbiAgICAgICAgaWYgKCBkcmF3YWJsZS5kb21FbGVtZW50IGluc3RhbmNlb2Ygd2luZG93LkhUTUxDYW52YXNFbGVtZW50ICkge1xyXG4gICAgICAgICAgYWRkQ2FudmFzKCBkcmF3YWJsZS5kb21FbGVtZW50ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoIGRyYXdhYmxlLmRvbUVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoICdjYW52YXMnICksIGNhbnZhcyA9PiB7XHJcbiAgICAgICAgICBhZGRDYW52YXMoIGNhbnZhcyApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVE9ETyBCYWNrYm9uZURyYXdhYmxlXHJcbiAgICBzY2FuRm9yQ2FudmFzZXMoIHRoaXMuX3Jvb3RCYWNrYm9uZSEgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBuZXcgZG9jdW1lbnQsIHNvIHRoYXQgd2UgY2FuICgxKSBzZXJpYWxpemUgaXQgdG8gWEhUTUwsIGFuZCAoMikgbWFuaXB1bGF0ZSBpdCBpbmRlcGVuZGVudGx5LlxyXG4gICAgLy8gSW5zcGlyZWQgYnkgaHR0cDovL2NidXJnbWVyLmdpdGh1Yi5pby9yYXN0ZXJpemVIVE1MLmpzL1xyXG4gICAgY29uc3QgZG9jID0gZG9jdW1lbnQuaW1wbGVtZW50YXRpb24uY3JlYXRlSFRNTERvY3VtZW50KCAnJyApO1xyXG4gICAgZG9jLmRvY3VtZW50RWxlbWVudC5pbm5lckhUTUwgPSB0aGlzLmRvbUVsZW1lbnQub3V0ZXJIVE1MO1xyXG4gICAgZG9jLmRvY3VtZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoICd4bWxucycsIGRvYy5kb2N1bWVudEVsZW1lbnQubmFtZXNwYWNlVVJJISApO1xyXG5cclxuICAgIC8vIEhpZGUgdGhlIFBET01cclxuICAgIGRvYy5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdzdHlsZScgKSApLmlubmVySFRNTCA9IGAuJHtQRE9NU2libGluZ1N0eWxlLlJPT1RfQ0xBU1NfTkFNRX0geyBkaXNwbGF5Om5vbmU7IH0gYDtcclxuXHJcbiAgICAvLyBSZXBsYWNlIGVhY2ggPGNhbnZhcz4gd2l0aCBhbiA8aW1nPiB0aGF0IGhhcyBzcmM9Y2FudmFzLnRvRGF0YVVSTCgpIGFuZCB0aGUgc2FtZSBzdHlsZVxyXG4gICAgbGV0IGRpc3BsYXlDYW52YXNlczogSFRNTEVsZW1lbnRbXSB8IEhUTUxDb2xsZWN0aW9uID0gZG9jLmRvY3VtZW50RWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSggJ2NhbnZhcycgKTtcclxuICAgIGRpc3BsYXlDYW52YXNlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCBkaXNwbGF5Q2FudmFzZXMgKTsgLy8gZG9uJ3QgdXNlIGEgbGl2ZSBIVE1MQ29sbGVjdGlvbiBjb3B5IVxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZGlzcGxheUNhbnZhc2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBkaXNwbGF5Q2FudmFzID0gZGlzcGxheUNhbnZhc2VzWyBpIF07XHJcblxyXG4gICAgICBjb25zdCBjc3NUZXh0ID0gZGlzcGxheUNhbnZhcy5zdHlsZS5jc3NUZXh0O1xyXG5cclxuICAgICAgY29uc3QgZGlzcGxheUltZyA9IGRvYy5jcmVhdGVFbGVtZW50KCAnaW1nJyApO1xyXG4gICAgICBjb25zdCBzcmMgPSBjYW52YXNVcmxNYXBbIGRpc3BsYXlDYW52YXMuaWQgXTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc3JjLCAnTXVzdCBoYXZlIG1pc3NlZCBhIHRvRGF0YVVSTCgpIG9uIGEgQ2FudmFzJyApO1xyXG5cclxuICAgICAgZGlzcGxheUltZy5zcmMgPSBzcmM7XHJcbiAgICAgIGRpc3BsYXlJbWcuc2V0QXR0cmlidXRlKCAnc3R5bGUnLCBjc3NUZXh0ICk7XHJcblxyXG4gICAgICBkaXNwbGF5Q2FudmFzLnBhcmVudE5vZGUhLnJlcGxhY2VDaGlsZCggZGlzcGxheUltZywgZGlzcGxheUNhbnZhcyApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGRpc3BsYXlXaWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICBjb25zdCBkaXNwbGF5SGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbiAgICBjb25zdCBjb21wbGV0ZUZ1bmN0aW9uID0gKCkgPT4ge1xyXG4gICAgICBEaXNwbGF5LmVsZW1lbnRUb1NWR0RhdGFVUkwoIGRvYy5kb2N1bWVudEVsZW1lbnQsIGRpc3BsYXlXaWR0aCwgZGlzcGxheUhlaWdodCwgY2FsbGJhY2sgKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gQ29udmVydCBlYWNoIDxpbWFnZT4ncyB4bGluazpocmVmIHNvIHRoYXQgaXQncyBhIGRhdGEgVVJMIHdpdGggdGhlIHJlbGV2YW50IGRhdGEsIGUuZy5cclxuICAgIC8vIDxpbWFnZSAuLi4geGxpbms6aHJlZj1cImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9zY2VuZXJ5LXBoZXQvaW1hZ2VzL2JhdHRlcnlEQ2VsbC5wbmc/YnVzdD0xNDc2MzA4NDA3OTg4XCIvPlxyXG4gICAgLy8gZ2V0cyByZXBsYWNlZCB3aXRoIGEgZGF0YSBVUkwuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzU3M1xyXG4gICAgbGV0IHJlcGxhY2VkSW1hZ2VzID0gMDsgLy8gQ291bnQgaG93IG1hbnkgaW1hZ2VzIGdldCByZXBsYWNlZC4gV2UnbGwgZGVjcmVtZW50IHdpdGggZWFjaCBmaW5pc2hlZCBpbWFnZS5cclxuICAgIGxldCBoYXNSZXBsYWNlZEltYWdlcyA9IGZhbHNlOyAvLyBXaGV0aGVyIGFueSBpbWFnZXMgYXJlIHJlcGxhY2VkXHJcbiAgICBjb25zdCBkaXNwbGF5U1ZHSW1hZ2VzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoIGRvYy5kb2N1bWVudEVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoICdpbWFnZScgKSApO1xyXG4gICAgZm9yICggbGV0IGogPSAwOyBqIDwgZGlzcGxheVNWR0ltYWdlcy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgY29uc3QgZGlzcGxheVNWR0ltYWdlID0gZGlzcGxheVNWR0ltYWdlc1sgaiBdO1xyXG4gICAgICBjb25zdCBjdXJyZW50SHJlZiA9IGRpc3BsYXlTVkdJbWFnZS5nZXRBdHRyaWJ1dGUoICd4bGluazpocmVmJyApO1xyXG4gICAgICBpZiAoIGN1cnJlbnRIcmVmLnNsaWNlKCAwLCA1ICkgIT09ICdkYXRhOicgKSB7XHJcbiAgICAgICAgcmVwbGFjZWRJbWFnZXMrKztcclxuICAgICAgICBoYXNSZXBsYWNlZEltYWdlcyA9IHRydWU7XHJcblxyXG4gICAgICAgICggKCkgPT4geyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1sb29wLWZ1bmNcclxuICAgICAgICAgIC8vIENsb3N1cmUgdmFyaWFibGVzIG5lZWQgdG8gYmUgc3RvcmVkIGZvciBlYWNoIGluZGl2aWR1YWwgU1ZHIGltYWdlLlxyXG4gICAgICAgICAgY29uc3QgcmVmSW1hZ2UgPSBuZXcgd2luZG93LkltYWdlKCk7XHJcbiAgICAgICAgICBjb25zdCBzdmdJbWFnZSA9IGRpc3BsYXlTVkdJbWFnZTtcclxuXHJcbiAgICAgICAgICByZWZJbWFnZS5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEdldCBhIENhbnZhc1xyXG4gICAgICAgICAgICBjb25zdCByZWZDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gICAgICAgICAgICByZWZDYW52YXMud2lkdGggPSByZWZJbWFnZS53aWR0aDtcclxuICAgICAgICAgICAgcmVmQ2FudmFzLmhlaWdodCA9IHJlZkltYWdlLmhlaWdodDtcclxuICAgICAgICAgICAgY29uc3QgcmVmQ29udGV4dCA9IHJlZkNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICkhO1xyXG5cclxuICAgICAgICAgICAgLy8gRHJhdyB0aGUgKG5vdyBsb2FkZWQpIGltYWdlIGludG8gdGhlIENhbnZhc1xyXG4gICAgICAgICAgICByZWZDb250ZXh0LmRyYXdJbWFnZSggcmVmSW1hZ2UsIDAsIDAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlcGxhY2UgdGhlIDxpbWFnZT4ncyBocmVmIHdpdGggdGhlIENhbnZhcycgZGF0YS5cclxuICAgICAgICAgICAgc3ZnSW1hZ2Uuc2V0QXR0cmlidXRlKCAneGxpbms6aHJlZicsIHJlZkNhbnZhcy50b0RhdGFVUkwoKSApO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgaXQncyB0aGUgbGFzdCByZXBsYWNlZCBpbWFnZSwgZ28gdG8gdGhlIG5leHQgc3RlcFxyXG4gICAgICAgICAgICBpZiAoIC0tcmVwbGFjZWRJbWFnZXMgPT09IDAgKSB7XHJcbiAgICAgICAgICAgICAgY29tcGxldGVGdW5jdGlvbigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZXBsYWNlZEltYWdlcyA+PSAwICk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgcmVmSW1hZ2Uub25lcnJvciA9ICgpID0+IHtcclxuICAgICAgICAgICAgLy8gTk9URTogbm90IG11Y2ggd2UgY2FuIGRvLCBsZWF2ZSB0aGlzIGVsZW1lbnQgYWxvbmUuXHJcblxyXG4gICAgICAgICAgICAvLyBJZiBpdCdzIHRoZSBsYXN0IHJlcGxhY2VkIGltYWdlLCBnbyB0byB0aGUgbmV4dCBzdGVwXHJcbiAgICAgICAgICAgIGlmICggLS1yZXBsYWNlZEltYWdlcyA9PT0gMCApIHtcclxuICAgICAgICAgICAgICBjb21wbGV0ZUZ1bmN0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlcGxhY2VkSW1hZ2VzID49IDAgKTtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgLy8gS2ljayBvZmYgbG9hZGluZyBvZiB0aGUgaW1hZ2UuXHJcbiAgICAgICAgICByZWZJbWFnZS5zcmMgPSBjdXJyZW50SHJlZjtcclxuICAgICAgICB9ICkoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIG5vIGltYWdlcyBhcmUgcmVwbGFjZWQsIHdlIG5lZWQgdG8gY2FsbCBvdXIgY2FsbGJhY2sgdGhyb3VnaCB0aGlzIHJvdXRlLlxyXG4gICAgaWYgKCAhaGFzUmVwbGFjZWRJbWFnZXMgKSB7XHJcbiAgICAgIGNvbXBsZXRlRnVuY3Rpb24oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBwb3B1cFJhc3Rlcml6YXRpb24oKTogdm9pZCB7XHJcbiAgICB0aGlzLmZvcmVpZ25PYmplY3RSYXN0ZXJpemF0aW9uKCB1cmwgPT4ge1xyXG4gICAgICBpZiAoIHVybCApIHtcclxuICAgICAgICB3aW5kb3cub3BlbiggdXJsICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdpbGwgcmV0dXJuIG51bGwgaWYgdGhlIHN0cmluZyBvZiBpbmRpY2VzIGlzbid0IHBhcnQgb2YgdGhlIFBET01JbnN0YW5jZSB0cmVlXHJcbiAgICovXHJcbiAgcHVibGljIGdldFRyYWlsRnJvbVBET01JbmRpY2VzU3RyaW5nKCBpbmRpY2VzU3RyaW5nOiBzdHJpbmcgKTogVHJhaWwgfCBudWxsIHtcclxuXHJcbiAgICAvLyBObyBQRE9NSW5zdGFuY2UgdHJlZSBpZiB0aGUgZGlzcGxheSBpc24ndCBhY2Nlc3NpYmxlXHJcbiAgICBpZiAoICF0aGlzLl9yb290UERPTUluc3RhbmNlICkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgaW5zdGFuY2UgPSB0aGlzLl9yb290UERPTUluc3RhbmNlO1xyXG4gICAgY29uc3QgaW5kZXhTdHJpbmdzID0gaW5kaWNlc1N0cmluZy5zcGxpdCggUERPTVV0aWxzLlBET01fVU5JUVVFX0lEX1NFUEFSQVRPUiApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgaW5kZXhTdHJpbmdzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBkaWdpdCA9IE51bWJlciggaW5kZXhTdHJpbmdzWyBpIF0gKTtcclxuICAgICAgaW5zdGFuY2UgPSBpbnN0YW5jZS5jaGlsZHJlblsgZGlnaXQgXTtcclxuICAgICAgaWYgKCAhaW5zdGFuY2UgKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gKCBpbnN0YW5jZSAmJiBpbnN0YW5jZS50cmFpbCApID8gaW5zdGFuY2UudHJhaWwgOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlcy5cclxuICAgKlxyXG4gICAqIFRPRE86IHRoaXMgZGlzcG9zZSBmdW5jdGlvbiBpcyBub3QgY29tcGxldGUuXHJcbiAgICovXHJcbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBpZiAoIGFzc2VydCApIHtcclxuICAgICAgYXNzZXJ0KCAhdGhpcy5faXNEaXNwb3NpbmcgKTtcclxuICAgICAgYXNzZXJ0KCAhdGhpcy5faXNEaXNwb3NlZCApO1xyXG5cclxuICAgICAgdGhpcy5faXNEaXNwb3NpbmcgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy5faW5wdXQgKSB7XHJcbiAgICAgIHRoaXMuZGV0YWNoRXZlbnRzKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9yb290Tm9kZS5yZW1vdmVSb290ZWREaXNwbGF5KCB0aGlzICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9hY2Nlc3NpYmxlICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9ib3VuZEhhbmRsZUZ1bGxTY3JlZW5OYXZpZ2F0aW9uLCAnX2JvdW5kSGFuZGxlRnVsbFNjcmVlbk5hdmlnYXRpb24gd2FzIG5vdCBhZGRlZCB0byB0aGUga2V5U3RhdGVUcmFja2VyJyApO1xyXG4gICAgICBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIua2V5ZG93bkVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuX2JvdW5kSGFuZGxlRnVsbFNjcmVlbk5hdmlnYXRpb24hICk7XHJcbiAgICAgIHRoaXMuX3Jvb3RQRE9NSW5zdGFuY2UhLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9mb2N1c092ZXJsYXkgJiYgdGhpcy5fZm9jdXNPdmVybGF5LmRpc3Bvc2UoKTtcclxuXHJcbiAgICB0aGlzLnNpemVQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcblxyXG4gICAgLy8gV2lsbCBpbW1lZGlhdGVseSBkaXNwb3NlIHJlY3Vyc2l2ZWx5LCBhbGwgSW5zdGFuY2VzIEFORCB0aGVpciBhdHRhY2hlZCBkcmF3YWJsZXMsIHdoaWNoIHdpbGwgaW5jbHVkZSB0aGVcclxuICAgIC8vIHJvb3RCYWNrYm9uZS5cclxuICAgIHRoaXMuX2Jhc2VJbnN0YW5jZSAmJiB0aGlzLl9iYXNlSW5zdGFuY2UuZGlzcG9zZSgpO1xyXG5cclxuICAgIHRoaXMuZGVzY3JpcHRpb25VdHRlcmFuY2VRdWV1ZS5kaXNwb3NlKCk7XHJcblxyXG4gICAgdGhpcy5mb2N1c01hbmFnZXIgJiYgdGhpcy5mb2N1c01hbmFnZXIuZGlzcG9zZSgpO1xyXG5cclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICB0aGlzLl9pc0Rpc3Bvc2luZyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRha2VzIGEgZ2l2ZW4gRE9NIGVsZW1lbnQsIGFuZCBhc3luY2hyb25vdXNseSByZW5kZXJzIGl0IHRvIGEgc3RyaW5nIHRoYXQgaXMgYSBkYXRhIFVSTCByZXByZXNlbnRpbmcgYW4gU1ZHXHJcbiAgICogZmlsZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkb21FbGVtZW50XHJcbiAgICogQHBhcmFtIHdpZHRoIC0gVGhlIHdpZHRoIG9mIHRoZSBvdXRwdXQgU1ZHXHJcbiAgICogQHBhcmFtIGhlaWdodCAtIFRoZSBoZWlnaHQgb2YgdGhlIG91dHB1dCBTVkdcclxuICAgKiBAcGFyYW0gY2FsbGJhY2sgLSBDYWxsZWQgYXMgY2FsbGJhY2soIHVybDoge3N0cmluZ30gKSwgd2hlcmUgdGhlIFVSTCB3aWxsIGJlIHRoZSBlbmNvZGVkIFNWRyBmaWxlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgZWxlbWVudFRvU1ZHRGF0YVVSTCggZG9tRWxlbWVudDogSFRNTEVsZW1lbnQsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBjYWxsYmFjazogKCB1cmw6IHN0cmluZyB8IG51bGwgKSA9PiB2b2lkICk6IHZvaWQge1xyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApITtcclxuICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuXHJcbiAgICAvLyBTZXJpYWxpemUgaXQgdG8gWEhUTUwgdGhhdCBjYW4gYmUgdXNlZCBpbiBmb3JlaWduT2JqZWN0IChIVE1MIGNhbid0IGJlKVxyXG4gICAgY29uc3QgeGh0bWwgPSBuZXcgd2luZG93LlhNTFNlcmlhbGl6ZXIoKS5zZXJpYWxpemVUb1N0cmluZyggZG9tRWxlbWVudCApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbiBTVkcgY29udGFpbmVyIHdpdGggYSBmb3JlaWduT2JqZWN0LlxyXG4gICAgY29uc3QgZGF0YSA9IGA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIiR7d2lkdGh9XCIgaGVpZ2h0PVwiJHtoZWlnaHR9XCI+YCArXHJcbiAgICAgICAgICAgICAgICAgJzxmb3JlaWduT2JqZWN0IHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIj4nICtcclxuICAgICAgICAgICAgICAgICBgPGRpdiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIj4ke1xyXG4gICAgICAgICAgICAgICAgICAgeGh0bWxcclxuICAgICAgICAgICAgICAgICB9PC9kaXY+YCArXHJcbiAgICAgICAgICAgICAgICAgJzwvZm9yZWlnbk9iamVjdD4nICtcclxuICAgICAgICAgICAgICAgICAnPC9zdmc+JztcclxuXHJcbiAgICAvLyBMb2FkIGFuIDxpbWc+IHdpdGggdGhlIFNWRyBkYXRhIFVSTCwgYW5kIHdoZW4gbG9hZGVkIGRyYXcgaXQgaW50byBvdXIgQ2FudmFzXHJcbiAgICBjb25zdCBpbWcgPSBuZXcgd2luZG93LkltYWdlKCk7XHJcbiAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICBjb250ZXh0LmRyYXdJbWFnZSggaW1nLCAwLCAwICk7XHJcbiAgICAgIGNhbGxiYWNrKCBjYW52YXMudG9EYXRhVVJMKCkgKTsgLy8gRW5kcG9pbnQgaGVyZVxyXG4gICAgfTtcclxuICAgIGltZy5vbmVycm9yID0gKCkgPT4ge1xyXG4gICAgICBjYWxsYmFjayggbnVsbCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBXZSBjYW4ndCBidG9hKCkgYXJiaXRyYXJ5IHVuaWNvZGUsIHNvIHdlIG5lZWQgYW5vdGhlciBzb2x1dGlvbixcclxuICAgIC8vIHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2luZG93QmFzZTY0L0Jhc2U2NF9lbmNvZGluZ19hbmRfZGVjb2RpbmcjVGhlXy4yMlVuaWNvZGVfUHJvYmxlbS4yMlxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIEV4dGVyaW9yIGxpYlxyXG4gICAgY29uc3QgdWludDhhcnJheSA9IG5ldyB3aW5kb3cuVGV4dEVuY29kZXJMaXRlKCAndXRmLTgnICkuZW5jb2RlKCBkYXRhICk7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gRXh0ZXJpb3IgbGliXHJcbiAgICBjb25zdCBiYXNlNjQgPSB3aW5kb3cuZnJvbUJ5dGVBcnJheSggdWludDhhcnJheSApO1xyXG5cclxuICAgIC8vIHR1cm4gaXQgdG8gYmFzZTY0IGFuZCB3cmFwIGl0IGluIHRoZSBkYXRhIFVSTCBmb3JtYXRcclxuICAgIGltZy5zcmMgPSBgZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCwke2Jhc2U2NH1gO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIHdoZW4gTk8gbm9kZXMgaW4gdGhlIHN1YnRyZWUgYXJlIGRpc3Bvc2VkLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RhdGljIGFzc2VydFN1YnRyZWVEaXNwb3NlZCggbm9kZTogTm9kZSApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFub2RlLmlzRGlzcG9zZWQsICdEaXNwb3NlZCBub2RlcyBzaG91bGQgbm90IGJlIGluY2x1ZGVkIGluIGEgc2NlbmUgZ3JhcGggdG8gZGlzcGxheS4nICk7XHJcblxyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgRGlzcGxheS5hc3NlcnRTdWJ0cmVlRGlzcG9zZWQoIG5vZGUuY2hpbGRyZW5bIGkgXSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGFuIGlucHV0IGxpc3RlbmVyIHRvIGJlIGZpcmVkIGZvciBBTlkgRGlzcGxheVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgYWRkSW5wdXRMaXN0ZW5lciggbGlzdGVuZXI6IFRJbnB1dExpc3RlbmVyICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIV8uaW5jbHVkZXMoIERpc3BsYXkuaW5wdXRMaXN0ZW5lcnMsIGxpc3RlbmVyICksICdJbnB1dCBsaXN0ZW5lciBhbHJlYWR5IHJlZ2lzdGVyZWQnICk7XHJcblxyXG4gICAgLy8gZG9uJ3QgYWxsb3cgbGlzdGVuZXJzIHRvIGJlIGFkZGVkIG11bHRpcGxlIHRpbWVzXHJcbiAgICBpZiAoICFfLmluY2x1ZGVzKCBEaXNwbGF5LmlucHV0TGlzdGVuZXJzLCBsaXN0ZW5lciApICkge1xyXG4gICAgICBEaXNwbGF5LmlucHV0TGlzdGVuZXJzLnB1c2goIGxpc3RlbmVyICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGFuIGlucHV0IGxpc3RlbmVyIHRoYXQgd2FzIHByZXZpb3VzbHkgYWRkZWQgd2l0aCBEaXNwbGF5LmFkZElucHV0TGlzdGVuZXIuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyByZW1vdmVJbnB1dExpc3RlbmVyKCBsaXN0ZW5lcjogVElucHV0TGlzdGVuZXIgKTogdm9pZCB7XHJcbiAgICAvLyBlbnN1cmUgdGhlIGxpc3RlbmVyIGlzIGluIG91ciBsaXN0XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCBEaXNwbGF5LmlucHV0TGlzdGVuZXJzLCBsaXN0ZW5lciApICk7XHJcblxyXG4gICAgRGlzcGxheS5pbnB1dExpc3RlbmVycy5zcGxpY2UoIF8uaW5kZXhPZiggRGlzcGxheS5pbnB1dExpc3RlbmVycywgbGlzdGVuZXIgKSwgMSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW50ZXJydXB0cyBhbGwgaW5wdXQgbGlzdGVuZXJzIHRoYXQgYXJlIGF0dGFjaGVkIHRvIGFsbCBEaXNwbGF5cy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGludGVycnVwdElucHV0KCk6IHZvaWQge1xyXG4gICAgY29uc3QgbGlzdGVuZXJzQ29weSA9IERpc3BsYXkuaW5wdXRMaXN0ZW5lcnMuc2xpY2UoIDAgKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lcnNDb3B5Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBsaXN0ZW5lciA9IGxpc3RlbmVyc0NvcHlbIGkgXTtcclxuXHJcbiAgICAgIGxpc3RlbmVyLmludGVycnVwdCAmJiBsaXN0ZW5lci5pbnRlcnJ1cHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEZpcmVzIHdoZW4gd2UgZGV0ZWN0IGFuIGlucHV0IGV2ZW50IHRoYXQgd291bGQgYmUgY29uc2lkZXJlZCBhIFwidXNlciBnZXN0dXJlXCIgYnkgQ2hyb21lLCBzb1xyXG4gIC8vIHRoYXQgd2UgY2FuIHRyaWdnZXIgYnJvd3NlciBhY3Rpb25zIHRoYXQgYXJlIG9ubHkgYWxsb3dlZCBhcyBhIHJlc3VsdC5cclxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzgwMiBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZpYmUvaXNzdWVzLzMyIGZvciBtb3JlXHJcbiAgLy8gaW5mb3JtYXRpb24uXHJcbiAgcHVibGljIHN0YXRpYyB1c2VyR2VzdHVyZUVtaXR0ZXI6IFRFbWl0dGVyO1xyXG5cclxuICAvLyBMaXN0ZW5lcnMgdGhhdCB3aWxsIGJlIGNhbGxlZCBmb3IgZXZlcnkgZXZlbnQgb24gQU5ZIERpc3BsYXksIHNlZVxyXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMTQ5LiBEbyBub3QgZGlyZWN0bHkgbW9kaWZ5IHRoaXMhXHJcbiAgcHVibGljIHN0YXRpYyBpbnB1dExpc3RlbmVyczogVElucHV0TGlzdGVuZXJbXTtcclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0Rpc3BsYXknLCBEaXNwbGF5ICk7XHJcblxyXG5EaXNwbGF5LnVzZXJHZXN0dXJlRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbkRpc3BsYXkuaW5wdXRMaXN0ZW5lcnMgPSBbXTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sNkJBQTZCO0FBR2pELE9BQU9DLFNBQVMsTUFBTSwrQkFBK0I7QUFDckQs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