// Copyright 2013-2022, University of Colorado Boulder

/**
 * An instance that is specific to the display (not necessarily a global instance, could be in a Canvas cache, etc),
 * that is needed to tracking instance-specific display information, and signals to the display system when other
 * changes are necessary.
 *
 * Instances generally form a true tree, as opposed to the DAG of nodes. The one exception is for shared Canvas caches,
 * where multiple instances can point to one globally-stored (shared) cache instance.
 *
 * An Instance is pooled, but when constructed will not automatically create children, drawables, etc.
 * syncTree() is responsible for synchronizing the instance itself and its entire subtree.
 *
 * Instances are created as 'stateless' instances, but during syncTree the rendering state (properties to determine
 * how to construct the drawable tree for this instance and its subtree) are set.
 *
 * While Instances are considered 'stateful', they will have listeners added to their Node which records actions taken
 * in-between Display.updateDisplay().
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import arrayRemove from '../../../phet-core/js/arrayRemove.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import Poolable from '../../../phet-core/js/Poolable.js';
import { BackboneDrawable, CanvasBlock, ChangeInterval, Drawable, Fittability, InlineCanvasCacheDrawable, RelativeTransform, Renderer, scenery, SharedCanvasCacheDrawable, Trail, Utils } from '../imports.js';
let globalIdCounter = 1;

// preferences top to bottom in general
const defaultPreferredRenderers = Renderer.createOrderBitmask(Renderer.bitmaskSVG, Renderer.bitmaskCanvas, Renderer.bitmaskDOM, Renderer.bitmaskWebGL);
class Instance {
  /**
   * @mixes Poolable
   *
   * See initialize() for documentation
   *
   * @param {Display} display
   * @param {Trail} trail
   * @param {boolean} isDisplayRoot
   * @param {boolean} isSharedCanvasCacheRoot
   */
  constructor(display, trail, isDisplayRoot, isSharedCanvasCacheRoot) {
    // @private {boolean}
    this.active = false;
    this.initialize(display, trail, isDisplayRoot, isSharedCanvasCacheRoot);
  }

  /**
   * @public
   *
   * @param {Display} display - Instances are bound to a single display
   * @param {Trail} trail - The list of ancestors going back up to our root instance (for the display, or for a cache)
   * @param {boolean} isDisplayRoot - Whether our instance is for the root node provided to the Display.
   * @param {boolean} isSharedCanvasCacheRoot - Whether our instance is the root for a shared Canvas cache (which can
   *                                            be used multiple places in the main instance tree)
   */
  initialize(display, trail, isDisplayRoot, isSharedCanvasCacheRoot) {
    assert && assert(!this.active, 'We should never try to initialize an already active object');

    // prevent the trail passed in from being mutated after this point (we want a consistent trail)
    trail.setImmutable();

    // @public {number}
    this.id = this.id || globalIdCounter++;

    // @public {boolean}
    this.isWebGLSupported = display.isWebGLAllowed() && Utils.isWebGLSupported;

    // @public {RelativeTransform} - provides high-performance access to 'relative' transforms (from our nearest
    // transform root), and allows for listening to when our relative transform changes (called during a phase of
    // Display.updateDisplay()).
    this.relativeTransform = this.relativeTransform || new RelativeTransform(this);

    // @public {Fittability} - provides logic for whether our drawables (or common-fit ancestors) will support fitting
    // for FittedBlock subtypes. See https://github.com/phetsims/scenery/issues/406.
    this.fittability = this.fittability || new Fittability(this);

    // @public {boolean} - Tracking of visibility {boolean} and associated boolean flags.
    this.visible = true; // global visibility (whether this instance will end up appearing on the display)
    this.relativeVisible = true; // relative visibility (ignores the closest ancestral visibility root and below)
    this.selfVisible = true; // like relative visibility, but is always true if we are a visibility root
    this.visibilityDirty = true; // entire subtree of visibility will need to be updated
    this.childVisibilityDirty = true; // an ancestor needs its visibility updated
    this.voicingVisible = true; // whether this instance is "visible" for Voicing and allows speech with that feature

    // @private {Object.<instanceId:number,number>} - Maps another instance's `instance.id` {number} => branch index
    // {number} (first index where the two trails are different). This effectively operates as a cache (since it's more
    // expensive to compute the value than it is to look up the value).
    // It is also "bidirectional", such that if we add instance A's branch index to this map, we will also add the
    // same value to instance A's map (referencing this instance). In order to clean up and prevent leaks, the
    // instance references are provided in this.branchIndexReferences (on both ends), so that when one instance is
    // disposed it can remove the references bidirectionally.
    this.branchIndexMap = this.branchIndexMap || {};

    // @public {Array.<Instance>} - All instances where we have entries in our map. See docs for branchIndexMap.
    this.branchIndexReferences = cleanArray(this.branchIndexReferences);

    // @private {number} - In the range (-1,0), to help us track insertions and removals of this instance's node to its
    // parent (did we get removed but added back?).
    // If it's -1 at its parent's syncTree, we'll end up removing our reference to it.
    // We use an integer just for sanity checks (if it ever reaches -2 or 1, we've reached an invalid state)
    this.addRemoveCounter = 0;

    // @private {number} - If equal to the current frame ID (it is initialized as such), then it is treated during the
    // change interval waterfall as "completely changed", and an interval for the entire instance is used.
    this.stitchChangeFrame = display._frameId;

    // @private {number} - If equal to the current frame ID, an instance was removed from before or after this instance,
    // so we'll want to add in a proper change interval (related to siblings)
    this.stitchChangeBefore = 0;
    this.stitchChangeAfter = 0;

    // @private {number} - If equal to the current frame ID, child instances were added or removed from this instance.
    this.stitchChangeOnChildren = 0;

    // @private {boolean} - whether we have been included in our parent's drawables the previous frame
    this.stitchChangeIncluded = false;

    // @private {function} - Node listeners for tracking children. Listeners should be added only when we become
    // stateful
    this.childInsertedListener = this.childInsertedListener || this.onChildInserted.bind(this);
    this.childRemovedListener = this.childRemovedListener || this.onChildRemoved.bind(this);
    this.childrenReorderedListener = this.childrenReorderedListener || this.onChildrenReordered.bind(this);
    this.visibilityListener = this.visibilityListener || this.onVisibilityChange.bind(this);
    this.markRenderStateDirtyListener = this.markRenderStateDirtyListener || this.markRenderStateDirty.bind(this);

    // @public {TinyEmitter}
    this.visibleEmitter = new TinyEmitter();
    this.relativeVisibleEmitter = new TinyEmitter();
    this.selfVisibleEmitter = new TinyEmitter();
    this.canVoiceEmitter = new TinyEmitter();
    this.cleanInstance(display, trail);

    // We need to add this reference on stateless instances, so that we can find out if it was removed before our
    // syncTree was called.
    this.node.addInstance(this);

    // @private {number} - Outstanding external references. used for shared cache instances, where multiple instances
    // can point to us.
    this.externalReferenceCount = 0;

    // @public {boolean} - Whether we have had our state initialized yet
    this.stateless = true;

    // @public {boolean} - Whether we are the root instance for a Display. Rendering state constant (will not change
    // over the life of an instance)
    this.isDisplayRoot = isDisplayRoot;

    // @public {boolean} - Whether we are the root of a Canvas cache. Rendering state constant (will not change over the
    // life of an instance)
    this.isSharedCanvasCacheRoot = isSharedCanvasCacheRoot;

    // @private {number} - [CASCADING RENDER STATE] Packed renderer order bitmask (what our renderer preferences are).
    // Part of the 'cascading' render state for the instance tree. These are properties that can affect the entire
    // subtree when set
    this.preferredRenderers = 0;

    // @private {boolean} - [CASCADING RENDER STATE] Whether we are beneath a Canvas cache (Canvas required). Part of
    // the 'cascading' render state for the instance tree. These are properties that can affect the entire subtree when
    // set
    this.isUnderCanvasCache = isSharedCanvasCacheRoot;

    // @public {boolean} - [RENDER STATE EXPORT] Whether we will have a BackboneDrawable group drawable
    this.isBackbone = false;

    // @public {boolean} - [RENDER STATE EXPORT] Whether this instance creates a new "root" for the relative trail
    // transforms
    this.isTransformed = false;

    // @private {boolean} - [RENDER STATE EXPORT] Whether this instance handles visibility with a group drawable
    this.isVisibilityApplied = false;

    // @private {boolean} - [RENDER STATE EXPORT] Whether we have a Canvas cache specific to this instance's position
    this.isInstanceCanvasCache = false;

    // @private {boolean} - [RENDER STATE EXPORT]
    this.isSharedCanvasCachePlaceholder = false;

    // @private {boolean} - [RENDER STATE EXPORT]
    this.isSharedCanvasCacheSelf = isSharedCanvasCacheRoot;

    // @private {number} - [RENDER STATE EXPORT] Renderer bitmask for the 'self' drawable (if our Node is painted)
    this.selfRenderer = 0;

    // @private {number} - [RENDER STATE EXPORT] Renderer bitmask for the 'group' drawable (if applicable)
    this.groupRenderer = 0;

    // @private {number} - [RENDER STATE EXPORT] Renderer bitmask for the cache drawable (if applicable)
    this.sharedCacheRenderer = 0;

    // @private {number} - When equal to the current frame it is considered "dirty". Is a pruning flag (whether we need
    // to be visited, whether updateRenderingState is required, and whether to visit children)
    this.renderStateDirtyFrame = display._frameId;

    // @private {number} - When equal to the current frame we can't prune at this instance. Is a pruning flag (whether
    // we need to be visited, whether updateRenderingState is required, and whether to visit children)
    this.skipPruningFrame = display._frameId;
    sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`initialized ${this.toString()}`);

    // Whether we have been instantiated. false if we are in a pool waiting to be instantiated.
    this.active = true;
    return this;
  }

  /**
   * Called for initialization of properties (via initialize(), via constructor), and to clean the instance for
   * placement in the pool (don't leak memory).
   * @private
   *
   * If the parameters are null, we remove all external references so that we don't leak memory.
   *
   * @param {Display|null} display - Instances are bound to a single display
   * @param {Trail|null} trail - The list of ancestors going back up to our root instance (for the display, or for a cache)
   */
  cleanInstance(display, trail) {
    // @public {Display|null}
    this.display = display;

    // @public {Trail|null}
    this.trail = trail;

    // @public {Node|null}
    this.node = trail ? trail.lastNode() : null;

    // @public {Instance|null} - will be set as needed
    this.parent = null;

    // @private {Instance|null} - set when removed from us, so that we can easily reattach it when necessary
    this.oldParent = null;

    // @public {Array.<Instance>} - NOTE: reliance on correct order after syncTree by at least SVGBlock/SVGGroup
    this.children = cleanArray(this.children);

    // @private {Instance|null} - reference to a shared cache instance (different than a child)
    this.sharedCacheInstance = null;

    // initialize/clean sub-components
    this.relativeTransform.initialize(display, trail);
    this.fittability.initialize(display, trail);

    // @private {Array.<Instance>} - Child instances are pushed to here when their node is removed from our node.
    // We don't immediately dispose, since it may be added back.
    this.instanceRemovalCheckList = cleanArray(this.instanceRemovalCheckList);

    // @public {Drawable|null} - Our self-drawable in the drawable tree
    this.selfDrawable = null;

    // @public {Drawable|null} - Our backbone or non-shared cache
    this.groupDrawable = null;

    // @public {Drawable|null} - Our drawable if we are a shared cache
    this.sharedCacheDrawable = null;

    // @private {Drawable} - references into the linked list of drawables (null if nothing is drawable under this)
    this.firstDrawable = null;
    this.lastDrawable = null;

    // @private {Drawable} - references into the linked list of drawables (excludes any group drawables handling)
    this.firstInnerDrawable = null;
    this.lastInnerDrawable = null;

    // @private {Array.<SVGGroup>} - List of SVG groups associated with this display instance
    this.svgGroups = cleanArray(this.svgGroups);
    this.cleanSyncTreeResults();
  }

  /**
   * Initializes or clears properties that are all set as pseudo 'return values' of the syncTree() method. It is the
   * responsibility of the caller of syncTree() to afterwards (optionally read these results and) clear the references
   * using this method to prevent memory leaks.
   * @private
   *
   * TODO: consider a pool of (or a single global) typed return object(s), since setting these values on the instance
   * generally means hitting the heap, and can slow us down.
   */
  cleanSyncTreeResults() {
    // Tracking bounding indices / drawables for what has changed, so we don't have to over-stitch things.

    // @private {number} - if (not iff) child's index <= beforeStableIndex, it hasn't been added/removed. relevant to
    // current children.
    this.beforeStableIndex = this.children.length;

    // @private {number} - if (not iff) child's index >= afterStableIndex, it hasn't been added/removed. relevant to
    // current children.
    this.afterStableIndex = -1;

    // NOTE: both of these being null indicates "there are no change intervals", otherwise it assumes it points to
    // a linked-list of change intervals. We use {ChangeInterval}s to hold this information, see ChangeInterval to see
    // the individual properties that are considered part of a change interval.

    // @private {ChangeInterval}, first change interval (should have nextChangeInterval linked-list to
    // lastChangeInterval)
    this.firstChangeInterval = null;

    // @private {ChangeInterval}, last change interval
    this.lastChangeInterval = null;

    // @private {boolean} - render state change flags, all set in updateRenderingState()
    this.incompatibleStateChange = false; // Whether we need to recreate the instance tree
    this.groupChanged = false; // Whether we need to force a rebuild of the group drawable
    this.cascadingStateChange = false; // Whether we had a render state change that requires visiting all children
    this.anyStateChange = false; // Whether there was any change of rendering state with the last updateRenderingState()
  }

  /**
   * Updates the rendering state properties, and returns a {boolean} flag of whether it was successful if we were
   * already stateful.
   * @private
   *
   * Rendering state properties determine how we construct the drawable tree from our instance tree (e.g. do we
   * create an SVG or Canvas rectangle, where to place CSS transforms, how to handle opacity, etc.)
   *
   * Instances start out as 'stateless' until updateRenderingState() is called the first time.
   *
   * Node changes that can cause a potential state change (using Node event listeners):
   * - hints
   * - opacity
   * - clipArea
   * - _rendererSummary
   * - _rendererBitmask
   *
   * State changes that can cause cascading state changes in descendants:
   * - isUnderCanvasCache
   * - preferredRenderers
   */
  updateRenderingState() {
    sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`updateRenderingState ${this.toString()}${this.stateless ? ' (stateless)' : ''}`);
    sceneryLog && sceneryLog.Instance && sceneryLog.push();
    sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`old: ${this.getStateString()}`);

    // old state information, so we can compare what was changed
    const wasBackbone = this.isBackbone;
    const wasTransformed = this.isTransformed;
    const wasVisibilityApplied = this.isVisibilityApplied;
    const wasInstanceCanvasCache = this.isInstanceCanvasCache;
    const wasSharedCanvasCacheSelf = this.isSharedCanvasCacheSelf;
    const wasSharedCanvasCachePlaceholder = this.isSharedCanvasCachePlaceholder;
    const wasUnderCanvasCache = this.isUnderCanvasCache;
    const oldSelfRenderer = this.selfRenderer;
    const oldGroupRenderer = this.groupRenderer;
    const oldSharedCacheRenderer = this.sharedCacheRenderer;
    const oldPreferredRenderers = this.preferredRenderers;

    // default values to set (makes the logic much simpler)
    this.isBackbone = false;
    this.isTransformed = false;
    this.isVisibilityApplied = false;
    this.isInstanceCanvasCache = false;
    this.isSharedCanvasCacheSelf = false;
    this.isSharedCanvasCachePlaceholder = false;
    this.selfRenderer = 0;
    this.groupRenderer = 0;
    this.sharedCacheRenderer = 0;
    const hints = this.node._hints;
    this.isUnderCanvasCache = this.isSharedCanvasCacheRoot || (this.parent ? this.parent.isUnderCanvasCache || this.parent.isInstanceCanvasCache || this.parent.isSharedCanvasCacheSelf : false);

    // set up our preferred renderer list (generally based on the parent)
    this.preferredRenderers = this.parent ? this.parent.preferredRenderers : defaultPreferredRenderers;
    // allow the node to modify its preferred renderers (and those of its descendants)
    if (hints.renderer) {
      this.preferredRenderers = Renderer.pushOrderBitmask(this.preferredRenderers, hints.renderer);
    }
    const hasClip = this.node.hasClipArea();
    const hasFilters = this.node.effectiveOpacity !== 1 || hints.usesOpacity || this.node._filters.length > 0;
    // let hasNonDOMFilter = false;
    let hasNonSVGFilter = false;
    let hasNonCanvasFilter = false;
    // let hasNonWebGLFilter = false;
    if (hasFilters) {
      // NOTE: opacity is OK with all of those (currently)
      for (let i = 0; i < this.node._filters.length; i++) {
        const filter = this.node._filters[i];

        // TODO: how to handle this, if we split AT the node?
        // if ( !filter.isDOMCompatible() ) {
        //   hasNonDOMFilter = true;
        // }
        if (!filter.isSVGCompatible()) {
          hasNonSVGFilter = true;
        }
        if (!filter.isCanvasCompatible()) {
          hasNonCanvasFilter = true;
        }
        // if ( !filter.isWebGLCompatible() ) {
        //   hasNonWebGLFilter = true;
        // }
      }
    }

    const requiresSplit = hints.cssTransform || hints.layerSplit;
    const backboneRequired = this.isDisplayRoot || !this.isUnderCanvasCache && requiresSplit;

    // Support either "all Canvas" or "all SVG" opacity/clip
    const applyTransparencyWithBlock = !backboneRequired && (hasFilters || hasClip) && (!hasNonSVGFilter && this.node._rendererSummary.isSubtreeRenderedExclusivelySVG(this.preferredRenderers) || !hasNonCanvasFilter && this.node._rendererSummary.isSubtreeRenderedExclusivelyCanvas(this.preferredRenderers));
    const useBackbone = applyTransparencyWithBlock ? false : backboneRequired || hasFilters || hasClip;

    // check if we need a backbone or cache
    // if we are under a canvas cache, we will NEVER have a backbone
    // splits are accomplished just by having a backbone
    // NOTE: If changing, check RendererSummary.summaryBitmaskForNodeSelf
    //OHTWO TODO: Update this to properly identify when backbones are necessary/and-or when we forward opacity/clipping
    if (useBackbone) {
      this.isBackbone = true;
      this.isVisibilityApplied = true;
      this.isTransformed = this.isDisplayRoot || !!hints.cssTransform; // for now, only trigger CSS transform if we have the specific hint
      //OHTWO TODO: check whether the force acceleration hint is being used by our DOMBlock
      this.groupRenderer = Renderer.bitmaskDOM; // probably won't be used
    } else if (!applyTransparencyWithBlock && (hasFilters || hasClip || hints.canvasCache)) {
      // everything underneath needs to be renderable with Canvas, otherwise we cannot cache
      assert && assert(this.node._rendererSummary.isSingleCanvasSupported(), `hints.canvasCache provided, but not all node contents can be rendered with Canvas under ${this.node.constructor.name}`);
      if (hints.singleCache) {
        // TODO: scale options - fixed size, match highest resolution (adaptive), or mipmapped
        if (this.isSharedCanvasCacheRoot) {
          this.isSharedCanvasCacheSelf = true;
          this.sharedCacheRenderer = this.isWebGLSupported ? Renderer.bitmaskWebGL : Renderer.bitmaskCanvas;
        } else {
          // everything underneath needs to guarantee that its bounds are valid
          //OHTWO TODO: We'll probably remove this if we go with the "safe bounds" approach
          assert && assert(this.node._rendererSummary.areBoundsValid(), `hints.singleCache provided, but not all node contents have valid bounds under ${this.node.constructor.name}`);
          this.isSharedCanvasCachePlaceholder = true;
        }
      } else {
        this.isInstanceCanvasCache = true;
        this.isUnderCanvasCache = true;
        this.groupRenderer = this.isWebGLSupported ? Renderer.bitmaskWebGL : Renderer.bitmaskCanvas;
      }
    }
    if (this.node.isPainted()) {
      if (this.isUnderCanvasCache) {
        this.selfRenderer = Renderer.bitmaskCanvas;
      } else {
        let supportedNodeBitmask = this.node._rendererBitmask;
        if (!this.isWebGLSupported) {
          const invalidBitmasks = Renderer.bitmaskWebGL;
          supportedNodeBitmask = supportedNodeBitmask ^ supportedNodeBitmask & invalidBitmasks;
        }

        // use the preferred rendering order if specified, otherwise use the default
        this.selfRenderer = supportedNodeBitmask & Renderer.bitmaskOrder(this.preferredRenderers, 0) || supportedNodeBitmask & Renderer.bitmaskOrder(this.preferredRenderers, 1) || supportedNodeBitmask & Renderer.bitmaskOrder(this.preferredRenderers, 2) || supportedNodeBitmask & Renderer.bitmaskOrder(this.preferredRenderers, 3) || supportedNodeBitmask & Renderer.bitmaskSVG || supportedNodeBitmask & Renderer.bitmaskCanvas || supportedNodeBitmask & Renderer.bitmaskDOM || supportedNodeBitmask & Renderer.bitmaskWebGL || 0;
        assert && assert(this.selfRenderer, 'setSelfRenderer failure?');
      }
    }

    // whether we need to force rebuilding the group drawable
    this.groupChanged = wasBackbone !== this.isBackbone || wasInstanceCanvasCache !== this.isInstanceCanvasCache || wasSharedCanvasCacheSelf !== this.isSharedCanvasCacheSelf;

    // whether any of our render state changes can change descendant render states
    this.cascadingStateChange = wasUnderCanvasCache !== this.isUnderCanvasCache || oldPreferredRenderers !== this.preferredRenderers;

    /*
     * Whether we can just update the state on an Instance when changing from this state => otherState.
     * This is generally not possible if there is a change in whether the instance should be a transform root
     * (e.g. backbone/single-cache), so we will have to recreate the instance and its subtree if that is the case.
     *
     * Only relevant if we were previously stateful, so it can be ignored if this is our first updateRenderingState()
     */
    this.incompatibleStateChange = this.isTransformed !== wasTransformed || this.isSharedCanvasCachePlaceholder !== wasSharedCanvasCachePlaceholder;

    // whether there was any render state change
    this.anyStateChange = this.groupChanged || this.cascadingStateChange || this.incompatibleStateChange || oldSelfRenderer !== this.selfRenderer || oldGroupRenderer !== this.groupRenderer || oldSharedCacheRenderer !== this.sharedCacheRenderer;

    // if our visibility applications changed, update the entire subtree
    if (wasVisibilityApplied !== this.isVisibilityApplied) {
      this.visibilityDirty = true;
      this.parent && this.parent.markChildVisibilityDirty();
    }

    // If our fittability has changed, propagate those changes. (It's generally a hint change which will trigger an
    // update of rendering state).
    this.fittability.checkSelfFittability();
    sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`new: ${this.getStateString()}`);
    sceneryLog && sceneryLog.Instance && sceneryLog.pop();
  }

  /**
   * A short string that contains a summary of the rendering state, for debugging/logging purposes.
   * @public
   *
   * @returns {string}
   */
  getStateString() {
    const result = `S[ ${this.isDisplayRoot ? 'displayRoot ' : ''}${this.isBackbone ? 'backbone ' : ''}${this.isInstanceCanvasCache ? 'instanceCache ' : ''}${this.isSharedCanvasCachePlaceholder ? 'sharedCachePlaceholder ' : ''}${this.isSharedCanvasCacheSelf ? 'sharedCacheSelf ' : ''}${this.isTransformed ? 'TR ' : ''}${this.isVisibilityApplied ? 'VIS ' : ''}${this.selfRenderer ? this.selfRenderer.toString(16) : '-'},${this.groupRenderer ? this.groupRenderer.toString(16) : '-'},${this.sharedCacheRenderer ? this.sharedCacheRenderer.toString(16) : '-'} `;
    return `${result}]`;
  }

  /**
   * The main entry point for syncTree(), called on the root instance. See syncTree() for more information.
   * @public
   */
  baseSyncTree() {
    assert && assert(this.isDisplayRoot, 'baseSyncTree() should only be called on the root instance');
    sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`-------- START baseSyncTree ${this.toString()} --------`);
    this.syncTree();
    sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`-------- END baseSyncTree ${this.toString()} --------`);
    this.cleanSyncTreeResults();
  }

  /**
   * Updates the rendering state, synchronizes the instance sub-tree (so that our instance tree matches
   * the Node tree the client provided), and back-propagates {ChangeInterval} information for stitching backbones
   * and/or caches.
   * @private
   *
   * syncTree() also sets a number of pseudo 'return values' (documented in cleanSyncTreeResults()). After calling
   * syncTree() and optionally reading those results, cleanSyncTreeResults() should be called on the same instance
   * in order to prevent memory leaks.
   *
   * @returns {boolean} - Whether the sync was possible. If it wasn't, a new instance subtree will need to be created.
   */
  syncTree() {
    sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`syncTree ${this.toString()} ${this.getStateString()}${this.stateless ? ' (stateless)' : ''}`);
    sceneryLog && sceneryLog.Instance && sceneryLog.push();
    if (sceneryLog && scenery.isLoggingPerformance()) {
      this.display.perfSyncTreeCount++;
    }

    // may access isTransformed up to root to determine relative trails
    assert && assert(!this.parent || !this.parent.stateless, 'We should not have a stateless parent instance');
    const wasStateless = this.stateless;
    if (wasStateless || this.parent && this.parent.cascadingStateChange ||
    // if our parent had cascading state changes, we need to recompute
    this.renderStateDirtyFrame === this.display._frameId) {
      // if our render state is dirty
      this.updateRenderingState();
    } else {
      // we can check whether updating state would have made any changes when we skip it (for slow assertions)
      if (assertSlow) {
        this.updateRenderingState();
        assertSlow(!this.anyStateChange);
      }
    }
    if (!wasStateless && this.incompatibleStateChange) {
      sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`incompatible instance ${this.toString()} ${this.getStateString()}, aborting`);
      sceneryLog && sceneryLog.Instance && sceneryLog.pop();

      // The false return will signal that a new instance needs to be used. our tree will be disposed soon.
      return false;
    }
    this.stateless = false;

    // no need to overwrite, should always be the same
    assert && assert(!wasStateless || this.children.length === 0, 'We should not have child instances on an instance without state');
    if (wasStateless) {
      // If we are a transform root, notify the display that we are dirty. We'll be validated when it's at that phase
      // at the next updateDisplay().
      if (this.isTransformed) {
        this.display.markTransformRootDirty(this, true);
      }
      this.attachNodeListeners();
    }

    // TODO: pruning of shared caches
    if (this.isSharedCanvasCachePlaceholder) {
      this.sharedSyncTree();
    }
    // pruning so that if no changes would affect a subtree it is skipped
    else if (wasStateless || this.skipPruningFrame === this.display._frameId || this.anyStateChange) {
      // mark fully-removed instances for disposal, and initialize child instances if we were stateless
      this.prepareChildInstances(wasStateless);
      const oldFirstDrawable = this.firstDrawable;
      const oldLastDrawable = this.lastDrawable;
      const oldFirstInnerDrawable = this.firstInnerDrawable;
      const oldLastInnerDrawable = this.lastInnerDrawable;
      const selfChanged = this.updateSelfDrawable();

      // Synchronizes our children and self, with the drawables and change intervals of both combined
      this.localSyncTree(selfChanged);
      if (assertSlow) {
        // before and after first/last drawables (inside any potential group drawable)
        this.auditChangeIntervals(oldFirstInnerDrawable, oldLastInnerDrawable, this.firstInnerDrawable, this.lastInnerDrawable);
      }

      // If we use a group drawable (backbone, etc.), we'll collapse our drawables and change intervals to reference
      // the group drawable (as applicable).
      this.groupSyncTree(wasStateless);
      if (assertSlow) {
        // before and after first/last drawables (outside of any potential group drawable)
        this.auditChangeIntervals(oldFirstDrawable, oldLastDrawable, this.firstDrawable, this.lastDrawable);
      }
    } else {
      // our sub-tree was not visited, since there were no relevant changes to it (that need instance synchronization
      // or drawable changes)
      sceneryLog && sceneryLog.Instance && sceneryLog.Instance('pruned');
    }
    sceneryLog && sceneryLog.Instance && sceneryLog.pop();
    return true;
  }

  /**
   * Responsible for syncing children, connecting the drawable linked list as needed, and outputting change intervals
   * and first/last drawable information.
   * @private
   *
   * @param {boolean} selfChanged
   */
  localSyncTree(selfChanged) {
    const frameId = this.display._frameId;

    // local variables, since we can't overwrite our instance properties yet
    let firstDrawable = this.selfDrawable; // possibly null
    let currentDrawable = firstDrawable; // possibly null

    assert && assert(this.firstChangeInterval === null && this.lastChangeInterval === null, 'sanity checks that cleanSyncTreeResults were called');
    let firstChangeInterval = null;
    if (selfChanged) {
      sceneryLog && sceneryLog.ChangeInterval && sceneryLog.ChangeInterval('self');
      sceneryLog && sceneryLog.ChangeInterval && sceneryLog.push();
      firstChangeInterval = ChangeInterval.newForDisplay(null, null, this.display);
      sceneryLog && sceneryLog.ChangeInterval && sceneryLog.pop();
    }
    let currentChangeInterval = firstChangeInterval;
    let lastUnchangedDrawable = selfChanged ? null : this.selfDrawable; // possibly null

    for (let i = 0; i < this.children.length; i++) {
      let childInstance = this.children[i];
      const isCompatible = childInstance.syncTree();
      if (!isCompatible) {
        childInstance = this.updateIncompatibleChildInstance(childInstance, i);
        childInstance.syncTree();
      }
      const includeChildDrawables = childInstance.shouldIncludeInParentDrawables();

      //OHTWO TODO: only strip out invisible Canvas drawables, while leaving SVG (since we can more efficiently hide
      // SVG trees, memory-wise)
      // here we strip out invisible drawable sections out of the drawable linked list
      if (includeChildDrawables) {
        // if there are any drawables for that child, link them up in our linked list
        if (childInstance.firstDrawable) {
          if (currentDrawable) {
            // there is already an end of the linked list, so just append to it
            Drawable.connectDrawables(currentDrawable, childInstance.firstDrawable, this.display);
          } else {
            // start out the linked list
            firstDrawable = childInstance.firstDrawable;
          }
          // update the last drawable of the linked list
          currentDrawable = childInstance.lastDrawable;
        }
      }

      /*---------------------------------------------------------------------------*
       * Change intervals
       *----------------------------------------------------------------------------*/

      sceneryLog && sceneryLog.ChangeInterval && sceneryLog.ChangeInterval(`changes for ${childInstance.toString()} in ${this.toString()}`);
      sceneryLog && sceneryLog.ChangeInterval && sceneryLog.push();
      const wasIncluded = childInstance.stitchChangeIncluded;
      const isIncluded = includeChildDrawables;
      childInstance.stitchChangeIncluded = isIncluded;
      sceneryLog && sceneryLog.ChangeInterval && sceneryLog.ChangeInterval(`included: ${wasIncluded} => ${isIncluded}`);

      // check for forcing full change-interval on child
      if (childInstance.stitchChangeFrame === frameId) {
        sceneryLog && sceneryLog.ChangeInterval && sceneryLog.ChangeInterval('stitchChangeFrame full change interval');
        sceneryLog && sceneryLog.ChangeInterval && sceneryLog.push();

        // e.g. it was added, moved, or had visibility changes. requires full change interval
        childInstance.firstChangeInterval = childInstance.lastChangeInterval = ChangeInterval.newForDisplay(null, null, this.display);
        sceneryLog && sceneryLog.ChangeInterval && sceneryLog.pop();
      } else {
        assert && assert(wasIncluded === isIncluded, 'If we do not have stitchChangeFrame activated, our inclusion should not have changed');
      }
      const firstChildChangeInterval = childInstance.firstChangeInterval;
      let isBeforeOpen = currentChangeInterval && currentChangeInterval.drawableAfter === null;
      const isAfterOpen = firstChildChangeInterval && firstChildChangeInterval.drawableBefore === null;
      const needsBridge = childInstance.stitchChangeBefore === frameId && !isBeforeOpen && !isAfterOpen;

      // We need to insert an additional change interval (bridge) when we notice a link in the drawable linked list
      // where there were nodes that needed stitch changes that aren't still children, or were moved. We create a
      // "bridge" change interval to span the gap where nodes were removed.
      if (needsBridge) {
        sceneryLog && sceneryLog.ChangeInterval && sceneryLog.ChangeInterval('bridge');
        sceneryLog && sceneryLog.ChangeInterval && sceneryLog.push();
        const bridge = ChangeInterval.newForDisplay(lastUnchangedDrawable, null, this.display);
        if (currentChangeInterval) {
          currentChangeInterval.nextChangeInterval = bridge;
        }
        currentChangeInterval = bridge;
        firstChangeInterval = firstChangeInterval || currentChangeInterval; // store if it is the first
        isBeforeOpen = true;
        sceneryLog && sceneryLog.ChangeInterval && sceneryLog.pop();
      }

      // Exclude child instances that are now (and were before) not included. NOTE: We still need to include those in
      // bridge calculations, since a removed (before-included) instance could be between two still-invisible
      // instances.
      if (wasIncluded || isIncluded) {
        if (isBeforeOpen) {
          // we want to try to glue our last ChangeInterval up
          if (firstChildChangeInterval) {
            if (firstChildChangeInterval.drawableBefore === null) {
              // we want to glue from both sides

              // basically have our current change interval replace the child's first change interval
              currentChangeInterval.drawableAfter = firstChildChangeInterval.drawableAfter;
              currentChangeInterval.nextChangeInterval = firstChildChangeInterval.nextChangeInterval;
              currentChangeInterval = childInstance.lastChangeInterval === firstChildChangeInterval ? currentChangeInterval :
              // since we are replacing, don't give an origin reference
              childInstance.lastChangeInterval;
            } else {
              // only a desire to glue from before
              currentChangeInterval.drawableAfter = childInstance.firstDrawable; // either null or the correct drawable
              currentChangeInterval.nextChangeInterval = firstChildChangeInterval;
              currentChangeInterval = childInstance.lastChangeInterval;
            }
          } else {
            // no changes to the child. grabs the first drawable reference it can
            currentChangeInterval.drawableAfter = childInstance.firstDrawable; // either null or the correct drawable
          }
        } else if (firstChildChangeInterval) {
          firstChangeInterval = firstChangeInterval || firstChildChangeInterval; // store if it is the first
          if (firstChildChangeInterval.drawableBefore === null) {
            assert && assert(!currentChangeInterval || lastUnchangedDrawable, 'If we have a current change interval, we should be guaranteed a non-null ' + 'lastUnchangedDrawable');
            firstChildChangeInterval.drawableBefore = lastUnchangedDrawable; // either null or the correct drawable
          }

          if (currentChangeInterval) {
            currentChangeInterval.nextChangeInterval = firstChildChangeInterval;
          }
          currentChangeInterval = childInstance.lastChangeInterval;
        }
        lastUnchangedDrawable = currentChangeInterval && currentChangeInterval.drawableAfter === null ? null : childInstance.lastDrawable ? childInstance.lastDrawable : lastUnchangedDrawable;
      }

      // if the last instance, check for post-bridge
      if (i === this.children.length - 1) {
        if (childInstance.stitchChangeAfter === frameId && !(currentChangeInterval && currentChangeInterval.drawableAfter === null)) {
          const endingBridge = ChangeInterval.newForDisplay(lastUnchangedDrawable, null, this.display);
          if (currentChangeInterval) {
            currentChangeInterval.nextChangeInterval = endingBridge;
          }
          currentChangeInterval = endingBridge;
          firstChangeInterval = firstChangeInterval || currentChangeInterval; // store if it is the first
        }
      }

      // clean up the metadata on our child (can't be done in the child call, since we use these values like a
      // composite return value)
      //OHTWO TODO: only do this on instances that were actually traversed
      childInstance.cleanSyncTreeResults();
      sceneryLog && sceneryLog.ChangeInterval && sceneryLog.pop();
    }

    // it's really the easiest way to compare if two things (casted to booleans) are the same?
    assert && assert(!!firstChangeInterval === !!currentChangeInterval, 'Presence of first and current change intervals should be equal');

    // Check to see if we are emptied and marked as changed (but without change intervals). This should imply we have
    // no children (and thus no stitchChangeBefore / stitchChangeAfter to use), so we'll want to create a change
    // interval to cover our entire range.
    if (!firstChangeInterval && this.stitchChangeOnChildren === this.display._frameId && this.children.length === 0) {
      firstChangeInterval = currentChangeInterval = ChangeInterval.newForDisplay(null, null, this.display);
    }

    // store our results
    // NOTE: these may get overwritten with the group change intervals (in that case, groupSyncTree will read from these)
    this.firstChangeInterval = firstChangeInterval;
    this.lastChangeInterval = currentChangeInterval;

    // NOTE: these may get overwritten with the group drawable (in that case, groupSyncTree will read from these)
    this.firstDrawable = this.firstInnerDrawable = firstDrawable;
    this.lastDrawable = this.lastInnerDrawable = currentDrawable; // either null, or the drawable itself

    // ensure that our firstDrawable and lastDrawable are correct
    if (assertSlow) {
      let firstDrawableCheck = null;
      for (let j = 0; j < this.children.length; j++) {
        if (this.children[j].shouldIncludeInParentDrawables() && this.children[j].firstDrawable) {
          firstDrawableCheck = this.children[j].firstDrawable;
          break;
        }
      }
      if (this.selfDrawable) {
        firstDrawableCheck = this.selfDrawable;
      }
      let lastDrawableCheck = this.selfDrawable;
      for (let k = this.children.length - 1; k >= 0; k--) {
        if (this.children[k].shouldIncludeInParentDrawables() && this.children[k].lastDrawable) {
          lastDrawableCheck = this.children[k].lastDrawable;
          break;
        }
      }
      assertSlow(firstDrawableCheck === this.firstDrawable);
      assertSlow(lastDrawableCheck === this.lastDrawable);
    }
  }

  /**
   * If necessary, create/replace/remove our selfDrawable.
   * @private
   *
   * @returns whether the selfDrawable changed
   */
  updateSelfDrawable() {
    if (this.node.isPainted()) {
      const selfRenderer = this.selfRenderer; // our new self renderer bitmask

      // bitwise trick, since only one of Canvas/SVG/DOM/WebGL/etc. flags will be chosen, and bitmaskRendererArea is
      // the mask for those flags. In English, "Is the current selfDrawable compatible with our selfRenderer (if any),
      // or do we need to create a selfDrawable?"
      //OHTWO TODO: For Canvas, we won't care about anything else for the drawable, but for DOM we care about the
      // force-acceleration flag! That's stripped out here.
      if (!this.selfDrawable || (this.selfDrawable.renderer & selfRenderer & Renderer.bitmaskRendererArea) === 0) {
        if (this.selfDrawable) {
          sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`replacing old drawable ${this.selfDrawable.toString()} with new renderer`);

          // scrap the previous selfDrawable, we need to create one with a different renderer.
          this.selfDrawable.markForDisposal(this.display);
        }
        this.selfDrawable = Renderer.createSelfDrawable(this, this.node, selfRenderer, this.fittability.ancestorsFittable);
        assert && assert(this.selfDrawable);
        return true;
      }
    } else {
      assert && assert(this.selfDrawable === null, 'Non-painted nodes should not have a selfDrawable');
    }
    return false;
  }

  /**
   * Returns the up-to-date instance.
   * @private
   *
   * @param {Instance} childInstance
   * @param {number} index
   * @returns {Instance}
   */
  updateIncompatibleChildInstance(childInstance, index) {
    if (sceneryLog && scenery.isLoggingPerformance()) {
      const affectedInstanceCount = childInstance.getDescendantCount() + 1; // +1 for itself

      if (affectedInstanceCount > 100) {
        sceneryLog.PerfCritical && sceneryLog.PerfCritical(`incompatible instance rebuild at ${this.trail.toPathString()}: ${affectedInstanceCount}`);
      } else if (affectedInstanceCount > 40) {
        sceneryLog.PerfMajor && sceneryLog.PerfMajor(`incompatible instance rebuild at ${this.trail.toPathString()}: ${affectedInstanceCount}`);
      } else if (affectedInstanceCount > 0) {
        sceneryLog.PerfMinor && sceneryLog.PerfMinor(`incompatible instance rebuild at ${this.trail.toPathString()}: ${affectedInstanceCount}`);
      }
    }

    // mark it for disposal
    this.display.markInstanceRootForDisposal(childInstance);

    // swap in a new instance
    const replacementInstance = Instance.createFromPool(this.display, this.trail.copy().addDescendant(childInstance.node, index), false, false);
    this.replaceInstanceWithIndex(childInstance, replacementInstance, index);
    return replacementInstance;
  }

  /**
   * @private
   *
   * @param {boolean} wasStateless
   */
  groupSyncTree(wasStateless) {
    const groupRenderer = this.groupRenderer;
    assert && assert((this.isBackbone ? 1 : 0) + (this.isInstanceCanvasCache ? 1 : 0) + (this.isSharedCanvasCacheSelf ? 1 : 0) === (groupRenderer ? 1 : 0), 'We should have precisely one of these flags set for us to have a groupRenderer');

    // if we switched to/away from a group, our group type changed, or our group renderer changed
    const groupChanged = !!groupRenderer !== !!this.groupDrawable || !wasStateless && this.groupChanged || this.groupDrawable && this.groupDrawable.renderer !== groupRenderer;

    // if there is a change, prepare
    if (groupChanged) {
      if (this.groupDrawable) {
        sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`replacing group drawable ${this.groupDrawable.toString()}`);
        this.groupDrawable.markForDisposal(this.display);
        this.groupDrawable = null;
      }

      // change everything, since we may need a full restitch
      this.firstChangeInterval = this.lastChangeInterval = ChangeInterval.newForDisplay(null, null, this.display);
    }
    if (groupRenderer) {
      // ensure our linked list is fully disconnected from others
      this.firstDrawable && Drawable.disconnectBefore(this.firstDrawable, this.display);
      this.lastDrawable && Drawable.disconnectAfter(this.lastDrawable, this.display);
      if (this.isBackbone) {
        if (groupChanged) {
          this.groupDrawable = BackboneDrawable.createFromPool(this.display, this, this.getTransformRootInstance(), groupRenderer, this.isDisplayRoot);
          if (this.isTransformed) {
            this.display.markTransformRootDirty(this, true);
          }
        }
        if (this.firstChangeInterval) {
          this.groupDrawable.stitch(this.firstDrawable, this.lastDrawable, this.firstChangeInterval, this.lastChangeInterval);
        }
      } else if (this.isInstanceCanvasCache) {
        if (groupChanged) {
          this.groupDrawable = InlineCanvasCacheDrawable.createFromPool(groupRenderer, this);
        }
        if (this.firstChangeInterval) {
          this.groupDrawable.stitch(this.firstDrawable, this.lastDrawable, this.firstChangeInterval, this.lastChangeInterval);
        }
      } else if (this.isSharedCanvasCacheSelf) {
        if (groupChanged) {
          this.groupDrawable = CanvasBlock.createFromPool(groupRenderer, this);
        }
        //OHTWO TODO: restitch here??? implement it
      }
      // Update the fittable flag
      this.groupDrawable.setFittable(this.fittability.ancestorsFittable);
      this.firstDrawable = this.lastDrawable = this.groupDrawable;
    }

    // change interval handling
    if (groupChanged) {
      // if our group status changed, mark EVERYTHING as potentially changed
      this.firstChangeInterval = this.lastChangeInterval = ChangeInterval.newForDisplay(null, null, this.display);
    } else if (groupRenderer) {
      // our group didn't have to change at all, so we prevent any change intervals
      this.firstChangeInterval = this.lastChangeInterval = null;
    }
  }

  /**
   * @private
   */
  sharedSyncTree() {
    //OHTWO TODO: we are probably missing syncTree for shared trees properly with pruning. investigate!!

    this.ensureSharedCacheInitialized();
    const sharedCacheRenderer = this.sharedCacheRenderer;
    if (!this.sharedCacheDrawable || this.sharedCacheDrawable.renderer !== sharedCacheRenderer) {
      //OHTWO TODO: mark everything as changed (big change interval)

      if (this.sharedCacheDrawable) {
        sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`replacing shared cache drawable ${this.sharedCacheDrawable.toString()}`);
        this.sharedCacheDrawable.markForDisposal(this.display);
      }

      //OHTWO TODO: actually create the proper shared cache drawable depending on the specified renderer
      // (update it if necessary)
      this.sharedCacheDrawable = new SharedCanvasCacheDrawable(this.trail, sharedCacheRenderer, this, this.sharedCacheInstance);
      this.firstDrawable = this.sharedCacheDrawable;
      this.lastDrawable = this.sharedCacheDrawable;

      // basically everything changed now, and won't from now on
      this.firstChangeInterval = this.lastChangeInterval = ChangeInterval.newForDisplay(null, null, this.display);
    }
  }

  /**
   * @private
   *
   * @param {boolean} wasStateless
   */
  prepareChildInstances(wasStateless) {
    // mark all removed instances to be disposed (along with their subtrees)
    while (this.instanceRemovalCheckList.length) {
      const instanceToMark = this.instanceRemovalCheckList.pop();
      if (instanceToMark.addRemoveCounter === -1) {
        instanceToMark.addRemoveCounter = 0; // reset it, so we don't mark it for disposal more than once
        this.display.markInstanceRootForDisposal(instanceToMark);
      }
    }
    if (wasStateless) {
      // we need to create all of the child instances
      for (let k = 0; k < this.node.children.length; k++) {
        // create a child instance
        const child = this.node.children[k];
        this.appendInstance(Instance.createFromPool(this.display, this.trail.copy().addDescendant(child, k), false, false));
      }
    }
  }

  /**
   * @private
   */
  ensureSharedCacheInitialized() {
    // we only need to initialize this shared cache reference once
    if (!this.sharedCacheInstance) {
      const instanceKey = this.node.getId();
      // TODO: have this abstracted away in the Display?
      this.sharedCacheInstance = this.display._sharedCanvasInstances[instanceKey];

      // TODO: increment reference counting?
      if (!this.sharedCacheInstance) {
        this.sharedCacheInstance = Instance.createFromPool(this.display, new Trail(this.node), false, true);
        this.sharedCacheInstance.syncTree();
        this.display._sharedCanvasInstances[instanceKey] = this.sharedCacheInstance;
        // TODO: reference counting?

        // TODO: this.sharedCacheInstance.isTransformed?

        //OHTWO TODO: is this necessary?
        this.display.markTransformRootDirty(this.sharedCacheInstance, true);
      }
      this.sharedCacheInstance.externalReferenceCount++;

      //OHTWO TODO: is this necessary?
      if (this.isTransformed) {
        this.display.markTransformRootDirty(this, true);
      }
    }
  }

  /**
   * Whether out drawables (from firstDrawable to lastDrawable) should be included in our parent's drawables
   * @private
   *
   * @returns {boolean}
   */
  shouldIncludeInParentDrawables() {
    return this.node.isVisible() || !this.node.isExcludeInvisible();
  }

  /**
   * Finds the closest drawable (not including the child instance at childIndex) using lastDrawable, or null
   * @private
   *
   * TODO: check usage?
   *
   * @param {number} childIndex
   * @returns {Drawable|null}
   */
  findPreviousDrawable(childIndex) {
    for (let i = childIndex - 1; i >= 0; i--) {
      const option = this.children[i].lastDrawable;
      if (option !== null) {
        return option;
      }
    }
    return null;
  }

  /**
   * Finds the closest drawable (not including the child instance at childIndex) using nextDrawable, or null
   * @private
   *
   * TODO: check usage?
   *
   * @param {number} childIndex
   * @returns {Drawable|null}
   */
  findNextDrawable(childIndex) {
    const len = this.children.length;
    for (let i = childIndex + 1; i < len; i++) {
      const option = this.children[i].firstDrawable;
      if (option !== null) {
        return option;
      }
    }
    return null;
  }

  /*---------------------------------------------------------------------------*
   * Children handling
   *----------------------------------------------------------------------------*/

  /**
   * @private
   *
   * @param {Instance} instance
   */
  appendInstance(instance) {
    this.insertInstance(instance, this.children.length);
  }

  /**
   * @private
   *
   * NOTE: different parameter order compared to Node
   *
   * @param {Instance} instance
   * @param {number} index
   */
  insertInstance(instance, index) {
    assert && assert(instance instanceof Instance);
    assert && assert(index >= 0 && index <= this.children.length, `Instance insertion bounds check for index ${index} with previous children length ${this.children.length}`);
    sceneryLog && sceneryLog.InstanceTree && sceneryLog.InstanceTree(`inserting ${instance.toString()} into ${this.toString()}`);
    sceneryLog && sceneryLog.InstanceTree && sceneryLog.push();

    // mark it as changed during this frame, so that we can properly set the change interval
    instance.stitchChangeFrame = this.display._frameId;
    this.stitchChangeOnChildren = this.display._frameId;
    this.children.splice(index, 0, instance);
    instance.parent = this;
    instance.oldParent = this;

    // maintain our stitch-change interval
    if (index <= this.beforeStableIndex) {
      this.beforeStableIndex = index - 1;
    }
    if (index > this.afterStableIndex) {
      this.afterStableIndex = index + 1;
    } else {
      this.afterStableIndex++;
    }

    // maintain fittable flags
    this.fittability.onInsert(instance.fittability);
    this.relativeTransform.addInstance(instance);
    this.markChildVisibilityDirty();
    sceneryLog && sceneryLog.InstanceTree && sceneryLog.pop();
  }

  /**
   * @private
   *
   * @param {Instance} instance
   */
  removeInstance(instance) {
    this.removeInstanceWithIndex(instance, _.indexOf(this.children, instance));
  }

  /**
   * @private
   *
   * @param {Instance} instance
   * @param {number} index
   */
  removeInstanceWithIndex(instance, index) {
    assert && assert(instance instanceof Instance);
    assert && assert(index >= 0 && index < this.children.length, `Instance removal bounds check for index ${index} with previous children length ${this.children.length}`);
    sceneryLog && sceneryLog.InstanceTree && sceneryLog.InstanceTree(`removing ${instance.toString()} from ${this.toString()}`);
    sceneryLog && sceneryLog.InstanceTree && sceneryLog.push();
    const frameId = this.display._frameId;

    // mark it as changed during this frame, so that we can properly set the change interval
    instance.stitchChangeFrame = frameId;
    this.stitchChangeOnChildren = frameId;

    // mark neighbors so that we can add a change interval for our removal area
    if (index - 1 >= 0) {
      this.children[index - 1].stitchChangeAfter = frameId;
    }
    if (index + 1 < this.children.length) {
      this.children[index + 1].stitchChangeBefore = frameId;
    }
    this.children.splice(index, 1); // TODO: replace with a 'remove' function call
    instance.parent = null;
    instance.oldParent = this;

    // maintain our stitch-change interval
    if (index <= this.beforeStableIndex) {
      this.beforeStableIndex = index - 1;
    }
    if (index >= this.afterStableIndex) {
      this.afterStableIndex = index;
    } else {
      this.afterStableIndex--;
    }

    // maintain fittable flags
    this.fittability.onRemove(instance.fittability);
    this.relativeTransform.removeInstance(instance);
    sceneryLog && sceneryLog.InstanceTree && sceneryLog.pop();
  }

  /**
   * @private
   *
   * @param {Instance} childInstance
   * @param {Instance} replacementInstance
   * @param {number} index
   */
  replaceInstanceWithIndex(childInstance, replacementInstance, index) {
    // TODO: optimization? hopefully it won't happen often, so we just do this for now
    this.removeInstanceWithIndex(childInstance, index);
    this.insertInstance(replacementInstance, index);
  }

  /**
   * For handling potential reordering of child instances inclusively between the min and max indices.
   * @private
   *
   * @param {number} minChangeIndex
   * @param {number} maxChangeIndex
   */
  reorderInstances(minChangeIndex, maxChangeIndex) {
    assert && assert(typeof minChangeIndex === 'number');
    assert && assert(typeof maxChangeIndex === 'number');
    assert && assert(minChangeIndex <= maxChangeIndex);
    sceneryLog && sceneryLog.InstanceTree && sceneryLog.InstanceTree(`Reordering ${this.toString()}`);
    sceneryLog && sceneryLog.InstanceTree && sceneryLog.push();

    // NOTE: For implementation, we've basically set parameters as if we removed all of the relevant instances and
    // then added them back in. There may be more efficient ways to do this, but the stitching and change interval
    // process is a bit complicated right now.

    const frameId = this.display._frameId;

    // Remove the old ordering of instances
    this.children.splice(minChangeIndex, maxChangeIndex - minChangeIndex + 1);

    // Add the instances back in the correct order
    for (let i = minChangeIndex; i <= maxChangeIndex; i++) {
      const child = this.findChildInstanceOnNode(this.node._children[i]);
      this.children.splice(i, 0, child);
      child.stitchChangeFrame = frameId;

      // mark neighbors so that we can add a change interval for our change area
      if (i > minChangeIndex) {
        child.stitchChangeAfter = frameId;
      }
      if (i < maxChangeIndex) {
        child.stitchChangeBefore = frameId;
      }
    }
    this.stitchChangeOnChildren = frameId;
    this.beforeStableIndex = Math.min(this.beforeStableIndex, minChangeIndex - 1);
    this.afterStableIndex = Math.max(this.afterStableIndex, maxChangeIndex + 1);
    sceneryLog && sceneryLog.InstanceTree && sceneryLog.pop();
  }

  /**
   * If we have a child instance that corresponds to this node, return it (otherwise null).
   * @private
   *
   * @param {Node} node
   * @returns {Instance|null}
   */
  findChildInstanceOnNode(node) {
    const instances = node.getInstances();
    for (let i = 0; i < instances.length; i++) {
      if (instances[i].oldParent === this) {
        return instances[i];
      }
    }
    return null;
  }

  /**
   * Event callback for Node's 'childInserted' event, used to track children.
   * @private
   *
   * @param {Node} childNode
   * @param {number} index
   */
  onChildInserted(childNode, index) {
    sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`inserting child node ${childNode.constructor.name}#${childNode.id} into ${this.toString()}`);
    sceneryLog && sceneryLog.Instance && sceneryLog.push();
    assert && assert(!this.stateless, 'If we are stateless, we should not receive these notifications');
    let instance = this.findChildInstanceOnNode(childNode);
    if (instance) {
      sceneryLog && sceneryLog.Instance && sceneryLog.Instance('instance already exists');
      // it must have been added back. increment its counter
      instance.addRemoveCounter += 1;
      assert && assert(instance.addRemoveCounter === 0);
    } else {
      sceneryLog && sceneryLog.Instance && sceneryLog.Instance('creating stub instance');
      sceneryLog && sceneryLog.Instance && sceneryLog.push();
      instance = Instance.createFromPool(this.display, this.trail.copy().addDescendant(childNode, index), false, false);
      sceneryLog && sceneryLog.Instance && sceneryLog.pop();
    }
    this.insertInstance(instance, index);

    // make sure we are visited for syncTree()
    this.markSkipPruning();
    sceneryLog && sceneryLog.Instance && sceneryLog.pop();
  }

  /**
   * Event callback for Node's 'childRemoved' event, used to track children.
   * @private
   *
   * @param {Node} childNode
   * @param {number} index
   */
  onChildRemoved(childNode, index) {
    sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`removing child node ${childNode.constructor.name}#${childNode.id} from ${this.toString()}`);
    sceneryLog && sceneryLog.Instance && sceneryLog.push();
    assert && assert(!this.stateless, 'If we are stateless, we should not receive these notifications');
    assert && assert(this.children[index].node === childNode, 'Ensure that our instance matches up');
    const instance = this.findChildInstanceOnNode(childNode);
    assert && assert(instance !== null, 'We should always have a reference to a removed instance');
    instance.addRemoveCounter -= 1;
    assert && assert(instance.addRemoveCounter === -1);

    // track the removed instance here. if it doesn't get added back, this will be the only reference we have (we'll
    // need to dispose it)
    this.instanceRemovalCheckList.push(instance);
    this.removeInstanceWithIndex(instance, index);

    // make sure we are visited for syncTree()
    this.markSkipPruning();
    sceneryLog && sceneryLog.Instance && sceneryLog.pop();
  }

  /**
   * Event callback for Node's 'childrenReordered' event
   * @private
   *
   * @param {number} minChangeIndex
   * @param {number} maxChangeIndex
   */
  onChildrenReordered(minChangeIndex, maxChangeIndex) {
    sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`reordering children for ${this.toString()}`);
    sceneryLog && sceneryLog.Instance && sceneryLog.push();
    this.reorderInstances(minChangeIndex, maxChangeIndex);

    // make sure we are visited for syncTree()
    this.markSkipPruning();
    sceneryLog && sceneryLog.Instance && sceneryLog.pop();
  }

  /**
   * Event callback for Node's 'visibility' event, used to notify about stitch changes.
   * @private
   */
  onVisibilityChange() {
    assert && assert(!this.stateless, 'If we are stateless, we should not receive these notifications');

    // for now, just mark which frame we were changed for our change interval
    this.stitchChangeFrame = this.display._frameId;

    // make sure we aren't pruned in the next syncTree()
    this.parent && this.parent.markSkipPruning();

    // mark visibility changes
    this.visibilityDirty = true;
    this.parent && this.parent.markChildVisibilityDirty();
  }

  /**
   * Event callback for Node's 'opacity' change event.
   * @private
   */
  onOpacityChange() {
    assert && assert(!this.stateless, 'If we are stateless, we should not receive these notifications');
    this.markRenderStateDirty();
  }

  /**
   * @private
   */
  markChildVisibilityDirty() {
    if (!this.childVisibilityDirty) {
      this.childVisibilityDirty = true;
      this.parent && this.parent.markChildVisibilityDirty();
    }
  }

  /**
   * Updates the currently fittability for all of the drawables attached to this instance.
   * @public
   *
   * @param {boolean} fittable
   */
  updateDrawableFittability(fittable) {
    this.selfDrawable && this.selfDrawable.setFittable(fittable);
    this.groupDrawable && this.groupDrawable.setFittable(fittable);
    // this.sharedCacheDrawable && this.sharedCacheDrawable.setFittable( fittable );
  }

  /**
   * Updates the visible/relativeVisible flags on the Instance and its entire subtree.
   * @public
   *
   * @param {boolean} parentGloballyVisible - Whether our parent (if any) is globally visible
   * @param {boolean} parentGloballyVoicingVisible - Whether our parent (if any) is globally voicingVisible.
   * @param {boolean} parentRelativelyVisible - Whether our parent (if any) is relatively visible
   * @param {boolean} updateFullSubtree - If true, we will visit the entire subtree to ensure visibility is correct.
   */
  updateVisibility(parentGloballyVisible, parentGloballyVoicingVisible, parentRelativelyVisible, updateFullSubtree) {
    // If our visibility flag for ourself is dirty, we need to update our entire subtree
    if (this.visibilityDirty) {
      updateFullSubtree = true;
    }

    // calculate our visibilities
    const nodeVisible = this.node.isVisible();
    const wasVisible = this.visible;
    const wasRelativeVisible = this.relativeVisible;
    const wasSelfVisible = this.selfVisible;
    const nodeVoicingVisible = this.node.voicingVisibleProperty.value;
    const wasVoicingVisible = this.voicingVisible;
    const couldVoice = wasVisible && wasVoicingVisible;
    this.visible = parentGloballyVisible && nodeVisible;
    this.voicingVisible = parentGloballyVoicingVisible && nodeVoicingVisible;
    this.relativeVisible = parentRelativelyVisible && nodeVisible;
    this.selfVisible = this.isVisibilityApplied ? true : this.relativeVisible;
    const len = this.children.length;
    for (let i = 0; i < len; i++) {
      const child = this.children[i];
      if (updateFullSubtree || child.visibilityDirty || child.childVisibilityDirty) {
        // if we are a visibility root (isVisibilityApplied===true), disregard ancestor visibility
        child.updateVisibility(this.visible, this.voicingVisible, this.isVisibilityApplied ? true : this.relativeVisible, updateFullSubtree);
      }
    }
    this.visibilityDirty = false;
    this.childVisibilityDirty = false;

    // trigger changes after we do the full visibility update
    if (this.visible !== wasVisible) {
      this.visibleEmitter.emit();
    }
    if (this.relativeVisible !== wasRelativeVisible) {
      this.relativeVisibleEmitter.emit();
    }
    if (this.selfVisible !== wasSelfVisible) {
      this.selfVisibleEmitter.emit();
    }

    // An Instance can voice when it is globally visible and voicingVisible. Notify when this state has changed
    // based on these dependencies.
    const canVoice = this.voicingVisible && this.visible;
    if (canVoice !== couldVoice) {
      this.canVoiceEmitter.emit(canVoice);
    }
  }

  /**
   * @private
   *
   * @returns {number}
   */
  getDescendantCount() {
    let count = this.children.length;
    for (let i = 0; i < this.children.length; i++) {
      count += this.children[i].getDescendantCount();
    }
    return count;
  }

  /*---------------------------------------------------------------------------*
   * Miscellaneous
   *----------------------------------------------------------------------------*/

  /**
   * Add a reference for an SVG group (fastest way to track them)
   * @public
   *
   * @param {SVGGroup} group
   */
  addSVGGroup(group) {
    this.svgGroups.push(group);
  }

  /**
   * Remove a reference for an SVG group (fastest way to track them)
   * @public
   *
   * @param {SVGGroup} group
   */
  removeSVGGroup(group) {
    arrayRemove(this.svgGroups, group);
  }

  /**
   * Returns null when a lookup fails (which is legitimate)
   * @public
   *
   * @param {SVGBlock} block
   * @returns {SVGGroup|null}
   */
  lookupSVGGroup(block) {
    const len = this.svgGroups.length;
    for (let i = 0; i < len; i++) {
      const group = this.svgGroups[i];
      if (group.block === block) {
        return group;
      }
    }
    return null;
  }

  /**
   * What instance have filters (opacity/visibility/clip) been applied up to?
   * @public
   *
   * @returns {Instance}
   */
  getFilterRootInstance() {
    if (this.isBackbone || this.isInstanceCanvasCache || !this.parent) {
      return this;
    } else {
      return this.parent.getFilterRootInstance();
    }
  }

  /**
   * What instance transforms have been applied up to?
   * @public
   *
   * @returns {Instance}
   */
  getTransformRootInstance() {
    if (this.isTransformed || !this.parent) {
      return this;
    } else {
      return this.parent.getTransformRootInstance();
    }
  }

  /**
   * @public
   *
   * @returns {Instance}
   */
  getVisibilityRootInstance() {
    if (this.isVisibilityApplied || !this.parent) {
      return this;
    } else {
      return this.parent.getVisibilityRootInstance();
    }
  }

  /**
   * @private
   */
  attachNodeListeners() {
    // attach listeners to our node
    this.relativeTransform.attachNodeListeners();
    if (!this.isSharedCanvasCachePlaceholder) {
      this.node.childInsertedEmitter.addListener(this.childInsertedListener);
      this.node.childRemovedEmitter.addListener(this.childRemovedListener);
      this.node.childrenReorderedEmitter.addListener(this.childrenReorderedListener);
      this.node.visibleProperty.lazyLink(this.visibilityListener);

      // Marks all visibility dirty when voicingVisible changes to cause necessary updates for voicingVisible
      this.node.voicingVisibleProperty.lazyLink(this.visibilityListener);
      this.node.filterChangeEmitter.addListener(this.markRenderStateDirtyListener);
      this.node.clipAreaProperty.lazyLink(this.markRenderStateDirtyListener);
      this.node.instanceRefreshEmitter.addListener(this.markRenderStateDirtyListener);
    }
  }

  /**
   * @private
   */
  detachNodeListeners() {
    this.relativeTransform.detachNodeListeners();
    if (!this.isSharedCanvasCachePlaceholder) {
      this.node.childInsertedEmitter.removeListener(this.childInsertedListener);
      this.node.childRemovedEmitter.removeListener(this.childRemovedListener);
      this.node.childrenReorderedEmitter.removeListener(this.childrenReorderedListener);
      this.node.visibleProperty.unlink(this.visibilityListener);
      this.node.voicingVisibleProperty.unlink(this.visibilityListener);
      this.node.filterChangeEmitter.removeListener(this.markRenderStateDirtyListener);
      this.node.clipAreaProperty.unlink(this.markRenderStateDirtyListener);
      this.node.instanceRefreshEmitter.removeListener(this.markRenderStateDirtyListener);
    }
  }

  /**
   * Ensure that the render state is updated in the next syncTree()
   * @private
   */
  markRenderStateDirty() {
    this.renderStateDirtyFrame = this.display._frameId;

    // ensure we aren't pruned (not set on this instance, since we may not need to visit our children)
    this.parent && this.parent.markSkipPruning();
  }

  /**
   * Ensure that this instance and its children will be visited in the next syncTree()
   * @private
   */
  markSkipPruning() {
    this.skipPruningFrame = this.display._frameId;

    // walk it up to the root
    this.parent && this.parent.markSkipPruning();
  }

  /**
   * @public
   *
   * NOTE: used in CanvasBlock internals, performance-critical.
   *
   * @param {Instance} instance
   * @returns {number}
   */
  getBranchIndexTo(instance) {
    const cachedValue = this.branchIndexMap[instance.id];
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    const branchIndex = this.trail.getBranchIndexTo(instance.trail);
    this.branchIndexMap[instance.id] = branchIndex;
    instance.branchIndexMap[this.id] = branchIndex;
    this.branchIndexReferences.push(instance);
    instance.branchIndexReferences.push(this);
    return branchIndex;
  }

  /**
   * Clean up listeners and garbage, so that we can be recycled (or pooled)
   * @public
   */
  dispose() {
    sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`dispose ${this.toString()}`);
    sceneryLog && sceneryLog.Instance && sceneryLog.push();
    assert && assert(this.active, 'Seems like we tried to dispose this Instance twice, it is not active');
    this.active = false;

    // Remove the bidirectional branch index reference data from this instance and any referenced instances.
    while (this.branchIndexReferences.length) {
      const referenceInstance = this.branchIndexReferences.pop();
      delete this.branchIndexMap[referenceInstance.id];
      delete referenceInstance.branchIndexMap[this.id];
      arrayRemove(referenceInstance.branchIndexReferences, this);
    }

    // order is somewhat important
    this.groupDrawable && this.groupDrawable.disposeImmediately(this.display);
    this.sharedCacheDrawable && this.sharedCacheDrawable.disposeImmediately(this.display);
    this.selfDrawable && this.selfDrawable.disposeImmediately(this.display);

    // Dispose the rest of our subtree
    const numChildren = this.children.length;
    for (let i = 0; i < numChildren; i++) {
      this.children[i].dispose();
    }
    // Check for child instances that were removed (we are still responsible for disposing them, since we didn't get
    // synctree to happen for them).
    while (this.instanceRemovalCheckList.length) {
      const child = this.instanceRemovalCheckList.pop();

      // they could have already been disposed, so we need a guard here
      if (child.active) {
        child.dispose();
      }
    }

    // we don't originally add in the listener if we are stateless
    if (!this.stateless) {
      this.detachNodeListeners();
    }
    this.node.removeInstance(this);

    // release our reference to a shared cache if applicable, and dispose if there are no other references
    if (this.sharedCacheInstance) {
      this.sharedCacheInstance.externalReferenceCount--;
      if (this.sharedCacheInstance.externalReferenceCount === 0) {
        delete this.display._sharedCanvasInstances[this.node.getId()];
        this.sharedCacheInstance.dispose();
      }
    }

    // clean our variables out to release memory
    this.cleanInstance(null, null);
    this.visibleEmitter.removeAllListeners();
    this.relativeVisibleEmitter.removeAllListeners();
    this.selfVisibleEmitter.removeAllListeners();
    this.canVoiceEmitter.removeAllListeners();
    this.freeToPool();
    sceneryLog && sceneryLog.Instance && sceneryLog.pop();
  }

  /**
   * @public
   *
   * @param {number} frameId
   * @param {boolean} allowValidationNotNeededChecks
   */
  audit(frameId, allowValidationNotNeededChecks) {
    if (assertSlow) {
      if (frameId === undefined) {
        frameId = this.display._frameId;
      }
      assertSlow(!this.stateless, 'State is required for all display instances');
      assertSlow(this.firstDrawable === null === (this.lastDrawable === null), 'First/last drawables need to both be null or non-null');
      assertSlow(!this.isBackbone && !this.isSharedCanvasCachePlaceholder || this.groupDrawable, 'If we are a backbone or shared cache, we need to have a groupDrawable reference');
      assertSlow(!this.isSharedCanvasCachePlaceholder || !this.node.isPainted() || this.selfDrawable, 'We need to have a selfDrawable if we are painted and not a shared cache');
      assertSlow(!this.isTransformed && !this.isCanvasCache || this.groupDrawable, 'We need to have a groupDrawable if we are a backbone or any type of canvas cache');
      assertSlow(!this.isSharedCanvasCachePlaceholder || this.sharedCacheDrawable, 'We need to have a sharedCacheDrawable if we are a shared cache');
      assertSlow(this.addRemoveCounter === 0, 'Our addRemoveCounter should always be 0 at the end of syncTree');

      // validate the subtree
      for (let i = 0; i < this.children.length; i++) {
        const childInstance = this.children[i];
        childInstance.audit(frameId, allowValidationNotNeededChecks);
      }
      this.relativeTransform.audit(frameId, allowValidationNotNeededChecks);
      this.fittability.audit();
    }
  }

  /**
   * Applies checks to make sure our visibility tracking is working as expected.
   * @public
   *
   * @param {boolean} parentVisible
   */
  auditVisibility(parentVisible) {
    if (assertSlow) {
      const visible = parentVisible && this.node.isVisible();
      const trailVisible = this.trail.isVisible();
      assertSlow(visible === trailVisible, 'Trail visibility failure');
      assertSlow(visible === this.visible, 'Visible flag failure');
      assertSlow(this.voicingVisible === _.reduce(this.trail.nodes, (value, node) => value && node.voicingVisibleProperty.value, true), 'When this Instance is voicingVisible: true, all Trail Nodes must also be voicingVisible: true');

      // validate the subtree
      for (let i = 0; i < this.children.length; i++) {
        const childInstance = this.children[i];
        childInstance.auditVisibility(visible);
      }
    }
  }

  /**
   * @private
   *
   * @param {Drawable|null} oldFirstDrawable
   * @param {Drawable|null} oldLastDrawable
   * @param {Drawable|null} newFirstDrawable
   * @param {Drawable|null} newLastDrawable
   */
  auditChangeIntervals(oldFirstDrawable, oldLastDrawable, newFirstDrawable, newLastDrawable) {
    if (oldFirstDrawable) {
      let oldOne = oldFirstDrawable;

      // should hit, or will have NPE
      while (oldOne !== oldLastDrawable) {
        oldOne = oldOne.oldNextDrawable;
      }
    }
    if (newFirstDrawable) {
      let newOne = newFirstDrawable;

      // should hit, or will have NPE
      while (newOne !== newLastDrawable) {
        newOne = newOne.nextDrawable;
      }
    }
    function checkBetween(a, b) {
      // have the body of the function stripped (it's not inside the if statement due to JSHint)
      if (assertSlow) {
        assertSlow(a !== null);
        assertSlow(b !== null);
        while (a !== b) {
          assertSlow(a.nextDrawable === a.oldNextDrawable, 'Change interval mismatch');
          a = a.nextDrawable;
        }
      }
    }
    if (assertSlow) {
      const firstChangeInterval = this.firstChangeInterval;
      const lastChangeInterval = this.lastChangeInterval;
      if (!firstChangeInterval || firstChangeInterval.drawableBefore !== null) {
        assertSlow(oldFirstDrawable === newFirstDrawable, 'If we have no changes, or our first change interval is not open, our firsts should be the same');
      }
      if (!lastChangeInterval || lastChangeInterval.drawableAfter !== null) {
        assertSlow(oldLastDrawable === newLastDrawable, 'If we have no changes, or our last change interval is not open, our lasts should be the same');
      }
      if (!firstChangeInterval) {
        assertSlow(!lastChangeInterval, 'We should not be missing only one change interval');

        // with no changes, everything should be identical
        oldFirstDrawable && checkBetween(oldFirstDrawable, oldLastDrawable);
      } else {
        assertSlow(lastChangeInterval, 'We should not be missing only one change interval');

        // endpoints
        if (firstChangeInterval.drawableBefore !== null) {
          // check to the start if applicable
          checkBetween(oldFirstDrawable, firstChangeInterval.drawableBefore);
        }
        if (lastChangeInterval.drawableAfter !== null) {
          // check to the end if applicable
          checkBetween(lastChangeInterval.drawableAfter, oldLastDrawable);
        }

        // between change intervals (should always be guaranteed to be fixed)
        let interval = firstChangeInterval;
        while (interval && interval.nextChangeInterval) {
          const nextInterval = interval.nextChangeInterval;
          assertSlow(interval.drawableAfter !== null);
          assertSlow(nextInterval.drawableBefore !== null);
          checkBetween(interval.drawableAfter, nextInterval.drawableBefore);
          interval = nextInterval;
        }
      }
    }
  }

  /**
   * Returns a string form of this object
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `${this.id}#${this.node ? `${this.node.constructor.name ? this.node.constructor.name : '?'}#${this.node.id}` : '-'}`;
  }
}
scenery.register('Instance', Instance);

// object pooling
Poolable.mixInto(Instance);
export default Instance;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsImFycmF5UmVtb3ZlIiwiY2xlYW5BcnJheSIsIlBvb2xhYmxlIiwiQmFja2JvbmVEcmF3YWJsZSIsIkNhbnZhc0Jsb2NrIiwiQ2hhbmdlSW50ZXJ2YWwiLCJEcmF3YWJsZSIsIkZpdHRhYmlsaXR5IiwiSW5saW5lQ2FudmFzQ2FjaGVEcmF3YWJsZSIsIlJlbGF0aXZlVHJhbnNmb3JtIiwiUmVuZGVyZXIiLCJzY2VuZXJ5IiwiU2hhcmVkQ2FudmFzQ2FjaGVEcmF3YWJsZSIsIlRyYWlsIiwiVXRpbHMiLCJnbG9iYWxJZENvdW50ZXIiLCJkZWZhdWx0UHJlZmVycmVkUmVuZGVyZXJzIiwiY3JlYXRlT3JkZXJCaXRtYXNrIiwiYml0bWFza1NWRyIsImJpdG1hc2tDYW52YXMiLCJiaXRtYXNrRE9NIiwiYml0bWFza1dlYkdMIiwiSW5zdGFuY2UiLCJjb25zdHJ1Y3RvciIsImRpc3BsYXkiLCJ0cmFpbCIsImlzRGlzcGxheVJvb3QiLCJpc1NoYXJlZENhbnZhc0NhY2hlUm9vdCIsImFjdGl2ZSIsImluaXRpYWxpemUiLCJhc3NlcnQiLCJzZXRJbW11dGFibGUiLCJpZCIsImlzV2ViR0xTdXBwb3J0ZWQiLCJpc1dlYkdMQWxsb3dlZCIsInJlbGF0aXZlVHJhbnNmb3JtIiwiZml0dGFiaWxpdHkiLCJ2aXNpYmxlIiwicmVsYXRpdmVWaXNpYmxlIiwic2VsZlZpc2libGUiLCJ2aXNpYmlsaXR5RGlydHkiLCJjaGlsZFZpc2liaWxpdHlEaXJ0eSIsInZvaWNpbmdWaXNpYmxlIiwiYnJhbmNoSW5kZXhNYXAiLCJicmFuY2hJbmRleFJlZmVyZW5jZXMiLCJhZGRSZW1vdmVDb3VudGVyIiwic3RpdGNoQ2hhbmdlRnJhbWUiLCJfZnJhbWVJZCIsInN0aXRjaENoYW5nZUJlZm9yZSIsInN0aXRjaENoYW5nZUFmdGVyIiwic3RpdGNoQ2hhbmdlT25DaGlsZHJlbiIsInN0aXRjaENoYW5nZUluY2x1ZGVkIiwiY2hpbGRJbnNlcnRlZExpc3RlbmVyIiwib25DaGlsZEluc2VydGVkIiwiYmluZCIsImNoaWxkUmVtb3ZlZExpc3RlbmVyIiwib25DaGlsZFJlbW92ZWQiLCJjaGlsZHJlblJlb3JkZXJlZExpc3RlbmVyIiwib25DaGlsZHJlblJlb3JkZXJlZCIsInZpc2liaWxpdHlMaXN0ZW5lciIsIm9uVmlzaWJpbGl0eUNoYW5nZSIsIm1hcmtSZW5kZXJTdGF0ZURpcnR5TGlzdGVuZXIiLCJtYXJrUmVuZGVyU3RhdGVEaXJ0eSIsInZpc2libGVFbWl0dGVyIiwicmVsYXRpdmVWaXNpYmxlRW1pdHRlciIsInNlbGZWaXNpYmxlRW1pdHRlciIsImNhblZvaWNlRW1pdHRlciIsImNsZWFuSW5zdGFuY2UiLCJub2RlIiwiYWRkSW5zdGFuY2UiLCJleHRlcm5hbFJlZmVyZW5jZUNvdW50Iiwic3RhdGVsZXNzIiwicHJlZmVycmVkUmVuZGVyZXJzIiwiaXNVbmRlckNhbnZhc0NhY2hlIiwiaXNCYWNrYm9uZSIsImlzVHJhbnNmb3JtZWQiLCJpc1Zpc2liaWxpdHlBcHBsaWVkIiwiaXNJbnN0YW5jZUNhbnZhc0NhY2hlIiwiaXNTaGFyZWRDYW52YXNDYWNoZVBsYWNlaG9sZGVyIiwiaXNTaGFyZWRDYW52YXNDYWNoZVNlbGYiLCJzZWxmUmVuZGVyZXIiLCJncm91cFJlbmRlcmVyIiwic2hhcmVkQ2FjaGVSZW5kZXJlciIsInJlbmRlclN0YXRlRGlydHlGcmFtZSIsInNraXBQcnVuaW5nRnJhbWUiLCJzY2VuZXJ5TG9nIiwidG9TdHJpbmciLCJsYXN0Tm9kZSIsInBhcmVudCIsIm9sZFBhcmVudCIsImNoaWxkcmVuIiwic2hhcmVkQ2FjaGVJbnN0YW5jZSIsImluc3RhbmNlUmVtb3ZhbENoZWNrTGlzdCIsInNlbGZEcmF3YWJsZSIsImdyb3VwRHJhd2FibGUiLCJzaGFyZWRDYWNoZURyYXdhYmxlIiwiZmlyc3REcmF3YWJsZSIsImxhc3REcmF3YWJsZSIsImZpcnN0SW5uZXJEcmF3YWJsZSIsImxhc3RJbm5lckRyYXdhYmxlIiwic3ZnR3JvdXBzIiwiY2xlYW5TeW5jVHJlZVJlc3VsdHMiLCJiZWZvcmVTdGFibGVJbmRleCIsImxlbmd0aCIsImFmdGVyU3RhYmxlSW5kZXgiLCJmaXJzdENoYW5nZUludGVydmFsIiwibGFzdENoYW5nZUludGVydmFsIiwiaW5jb21wYXRpYmxlU3RhdGVDaGFuZ2UiLCJncm91cENoYW5nZWQiLCJjYXNjYWRpbmdTdGF0ZUNoYW5nZSIsImFueVN0YXRlQ2hhbmdlIiwidXBkYXRlUmVuZGVyaW5nU3RhdGUiLCJwdXNoIiwiZ2V0U3RhdGVTdHJpbmciLCJ3YXNCYWNrYm9uZSIsIndhc1RyYW5zZm9ybWVkIiwid2FzVmlzaWJpbGl0eUFwcGxpZWQiLCJ3YXNJbnN0YW5jZUNhbnZhc0NhY2hlIiwid2FzU2hhcmVkQ2FudmFzQ2FjaGVTZWxmIiwid2FzU2hhcmVkQ2FudmFzQ2FjaGVQbGFjZWhvbGRlciIsIndhc1VuZGVyQ2FudmFzQ2FjaGUiLCJvbGRTZWxmUmVuZGVyZXIiLCJvbGRHcm91cFJlbmRlcmVyIiwib2xkU2hhcmVkQ2FjaGVSZW5kZXJlciIsIm9sZFByZWZlcnJlZFJlbmRlcmVycyIsImhpbnRzIiwiX2hpbnRzIiwicmVuZGVyZXIiLCJwdXNoT3JkZXJCaXRtYXNrIiwiaGFzQ2xpcCIsImhhc0NsaXBBcmVhIiwiaGFzRmlsdGVycyIsImVmZmVjdGl2ZU9wYWNpdHkiLCJ1c2VzT3BhY2l0eSIsIl9maWx0ZXJzIiwiaGFzTm9uU1ZHRmlsdGVyIiwiaGFzTm9uQ2FudmFzRmlsdGVyIiwiaSIsImZpbHRlciIsImlzU1ZHQ29tcGF0aWJsZSIsImlzQ2FudmFzQ29tcGF0aWJsZSIsInJlcXVpcmVzU3BsaXQiLCJjc3NUcmFuc2Zvcm0iLCJsYXllclNwbGl0IiwiYmFja2JvbmVSZXF1aXJlZCIsImFwcGx5VHJhbnNwYXJlbmN5V2l0aEJsb2NrIiwiX3JlbmRlcmVyU3VtbWFyeSIsImlzU3VidHJlZVJlbmRlcmVkRXhjbHVzaXZlbHlTVkciLCJpc1N1YnRyZWVSZW5kZXJlZEV4Y2x1c2l2ZWx5Q2FudmFzIiwidXNlQmFja2JvbmUiLCJjYW52YXNDYWNoZSIsImlzU2luZ2xlQ2FudmFzU3VwcG9ydGVkIiwibmFtZSIsInNpbmdsZUNhY2hlIiwiYXJlQm91bmRzVmFsaWQiLCJpc1BhaW50ZWQiLCJzdXBwb3J0ZWROb2RlQml0bWFzayIsIl9yZW5kZXJlckJpdG1hc2siLCJpbnZhbGlkQml0bWFza3MiLCJiaXRtYXNrT3JkZXIiLCJtYXJrQ2hpbGRWaXNpYmlsaXR5RGlydHkiLCJjaGVja1NlbGZGaXR0YWJpbGl0eSIsInBvcCIsInJlc3VsdCIsImJhc2VTeW5jVHJlZSIsInN5bmNUcmVlIiwiaXNMb2dnaW5nUGVyZm9ybWFuY2UiLCJwZXJmU3luY1RyZWVDb3VudCIsIndhc1N0YXRlbGVzcyIsImFzc2VydFNsb3ciLCJtYXJrVHJhbnNmb3JtUm9vdERpcnR5IiwiYXR0YWNoTm9kZUxpc3RlbmVycyIsInNoYXJlZFN5bmNUcmVlIiwicHJlcGFyZUNoaWxkSW5zdGFuY2VzIiwib2xkRmlyc3REcmF3YWJsZSIsIm9sZExhc3REcmF3YWJsZSIsIm9sZEZpcnN0SW5uZXJEcmF3YWJsZSIsIm9sZExhc3RJbm5lckRyYXdhYmxlIiwic2VsZkNoYW5nZWQiLCJ1cGRhdGVTZWxmRHJhd2FibGUiLCJsb2NhbFN5bmNUcmVlIiwiYXVkaXRDaGFuZ2VJbnRlcnZhbHMiLCJncm91cFN5bmNUcmVlIiwiZnJhbWVJZCIsImN1cnJlbnREcmF3YWJsZSIsIm5ld0ZvckRpc3BsYXkiLCJjdXJyZW50Q2hhbmdlSW50ZXJ2YWwiLCJsYXN0VW5jaGFuZ2VkRHJhd2FibGUiLCJjaGlsZEluc3RhbmNlIiwiaXNDb21wYXRpYmxlIiwidXBkYXRlSW5jb21wYXRpYmxlQ2hpbGRJbnN0YW5jZSIsImluY2x1ZGVDaGlsZERyYXdhYmxlcyIsInNob3VsZEluY2x1ZGVJblBhcmVudERyYXdhYmxlcyIsImNvbm5lY3REcmF3YWJsZXMiLCJ3YXNJbmNsdWRlZCIsImlzSW5jbHVkZWQiLCJmaXJzdENoaWxkQ2hhbmdlSW50ZXJ2YWwiLCJpc0JlZm9yZU9wZW4iLCJkcmF3YWJsZUFmdGVyIiwiaXNBZnRlck9wZW4iLCJkcmF3YWJsZUJlZm9yZSIsIm5lZWRzQnJpZGdlIiwiYnJpZGdlIiwibmV4dENoYW5nZUludGVydmFsIiwiZW5kaW5nQnJpZGdlIiwiZmlyc3REcmF3YWJsZUNoZWNrIiwiaiIsImxhc3REcmF3YWJsZUNoZWNrIiwiayIsImJpdG1hc2tSZW5kZXJlckFyZWEiLCJtYXJrRm9yRGlzcG9zYWwiLCJjcmVhdGVTZWxmRHJhd2FibGUiLCJhbmNlc3RvcnNGaXR0YWJsZSIsImluZGV4IiwiYWZmZWN0ZWRJbnN0YW5jZUNvdW50IiwiZ2V0RGVzY2VuZGFudENvdW50IiwiUGVyZkNyaXRpY2FsIiwidG9QYXRoU3RyaW5nIiwiUGVyZk1ham9yIiwiUGVyZk1pbm9yIiwibWFya0luc3RhbmNlUm9vdEZvckRpc3Bvc2FsIiwicmVwbGFjZW1lbnRJbnN0YW5jZSIsImNyZWF0ZUZyb21Qb29sIiwiY29weSIsImFkZERlc2NlbmRhbnQiLCJyZXBsYWNlSW5zdGFuY2VXaXRoSW5kZXgiLCJkaXNjb25uZWN0QmVmb3JlIiwiZGlzY29ubmVjdEFmdGVyIiwiZ2V0VHJhbnNmb3JtUm9vdEluc3RhbmNlIiwic3RpdGNoIiwic2V0Rml0dGFibGUiLCJlbnN1cmVTaGFyZWRDYWNoZUluaXRpYWxpemVkIiwiaW5zdGFuY2VUb01hcmsiLCJjaGlsZCIsImFwcGVuZEluc3RhbmNlIiwiaW5zdGFuY2VLZXkiLCJnZXRJZCIsIl9zaGFyZWRDYW52YXNJbnN0YW5jZXMiLCJpc1Zpc2libGUiLCJpc0V4Y2x1ZGVJbnZpc2libGUiLCJmaW5kUHJldmlvdXNEcmF3YWJsZSIsImNoaWxkSW5kZXgiLCJvcHRpb24iLCJmaW5kTmV4dERyYXdhYmxlIiwibGVuIiwiaW5zdGFuY2UiLCJpbnNlcnRJbnN0YW5jZSIsIkluc3RhbmNlVHJlZSIsInNwbGljZSIsIm9uSW5zZXJ0IiwicmVtb3ZlSW5zdGFuY2UiLCJyZW1vdmVJbnN0YW5jZVdpdGhJbmRleCIsIl8iLCJpbmRleE9mIiwib25SZW1vdmUiLCJyZW9yZGVySW5zdGFuY2VzIiwibWluQ2hhbmdlSW5kZXgiLCJtYXhDaGFuZ2VJbmRleCIsImZpbmRDaGlsZEluc3RhbmNlT25Ob2RlIiwiX2NoaWxkcmVuIiwiTWF0aCIsIm1pbiIsIm1heCIsImluc3RhbmNlcyIsImdldEluc3RhbmNlcyIsImNoaWxkTm9kZSIsIm1hcmtTa2lwUHJ1bmluZyIsIm9uT3BhY2l0eUNoYW5nZSIsInVwZGF0ZURyYXdhYmxlRml0dGFiaWxpdHkiLCJmaXR0YWJsZSIsInVwZGF0ZVZpc2liaWxpdHkiLCJwYXJlbnRHbG9iYWxseVZpc2libGUiLCJwYXJlbnRHbG9iYWxseVZvaWNpbmdWaXNpYmxlIiwicGFyZW50UmVsYXRpdmVseVZpc2libGUiLCJ1cGRhdGVGdWxsU3VidHJlZSIsIm5vZGVWaXNpYmxlIiwid2FzVmlzaWJsZSIsIndhc1JlbGF0aXZlVmlzaWJsZSIsIndhc1NlbGZWaXNpYmxlIiwibm9kZVZvaWNpbmdWaXNpYmxlIiwidm9pY2luZ1Zpc2libGVQcm9wZXJ0eSIsInZhbHVlIiwid2FzVm9pY2luZ1Zpc2libGUiLCJjb3VsZFZvaWNlIiwiZW1pdCIsImNhblZvaWNlIiwiY291bnQiLCJhZGRTVkdHcm91cCIsImdyb3VwIiwicmVtb3ZlU1ZHR3JvdXAiLCJsb29rdXBTVkdHcm91cCIsImJsb2NrIiwiZ2V0RmlsdGVyUm9vdEluc3RhbmNlIiwiZ2V0VmlzaWJpbGl0eVJvb3RJbnN0YW5jZSIsImNoaWxkSW5zZXJ0ZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJjaGlsZFJlbW92ZWRFbWl0dGVyIiwiY2hpbGRyZW5SZW9yZGVyZWRFbWl0dGVyIiwidmlzaWJsZVByb3BlcnR5IiwibGF6eUxpbmsiLCJmaWx0ZXJDaGFuZ2VFbWl0dGVyIiwiY2xpcEFyZWFQcm9wZXJ0eSIsImluc3RhbmNlUmVmcmVzaEVtaXR0ZXIiLCJkZXRhY2hOb2RlTGlzdGVuZXJzIiwicmVtb3ZlTGlzdGVuZXIiLCJ1bmxpbmsiLCJnZXRCcmFuY2hJbmRleFRvIiwiY2FjaGVkVmFsdWUiLCJ1bmRlZmluZWQiLCJicmFuY2hJbmRleCIsImRpc3Bvc2UiLCJyZWZlcmVuY2VJbnN0YW5jZSIsImRpc3Bvc2VJbW1lZGlhdGVseSIsIm51bUNoaWxkcmVuIiwicmVtb3ZlQWxsTGlzdGVuZXJzIiwiZnJlZVRvUG9vbCIsImF1ZGl0IiwiYWxsb3dWYWxpZGF0aW9uTm90TmVlZGVkQ2hlY2tzIiwiaXNDYW52YXNDYWNoZSIsImF1ZGl0VmlzaWJpbGl0eSIsInBhcmVudFZpc2libGUiLCJ0cmFpbFZpc2libGUiLCJyZWR1Y2UiLCJub2RlcyIsIm5ld0ZpcnN0RHJhd2FibGUiLCJuZXdMYXN0RHJhd2FibGUiLCJvbGRPbmUiLCJvbGROZXh0RHJhd2FibGUiLCJuZXdPbmUiLCJuZXh0RHJhd2FibGUiLCJjaGVja0JldHdlZW4iLCJhIiwiYiIsImludGVydmFsIiwibmV4dEludGVydmFsIiwicmVnaXN0ZXIiLCJtaXhJbnRvIl0sInNvdXJjZXMiOlsiSW5zdGFuY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQW4gaW5zdGFuY2UgdGhhdCBpcyBzcGVjaWZpYyB0byB0aGUgZGlzcGxheSAobm90IG5lY2Vzc2FyaWx5IGEgZ2xvYmFsIGluc3RhbmNlLCBjb3VsZCBiZSBpbiBhIENhbnZhcyBjYWNoZSwgZXRjKSxcclxuICogdGhhdCBpcyBuZWVkZWQgdG8gdHJhY2tpbmcgaW5zdGFuY2Utc3BlY2lmaWMgZGlzcGxheSBpbmZvcm1hdGlvbiwgYW5kIHNpZ25hbHMgdG8gdGhlIGRpc3BsYXkgc3lzdGVtIHdoZW4gb3RoZXJcclxuICogY2hhbmdlcyBhcmUgbmVjZXNzYXJ5LlxyXG4gKlxyXG4gKiBJbnN0YW5jZXMgZ2VuZXJhbGx5IGZvcm0gYSB0cnVlIHRyZWUsIGFzIG9wcG9zZWQgdG8gdGhlIERBRyBvZiBub2Rlcy4gVGhlIG9uZSBleGNlcHRpb24gaXMgZm9yIHNoYXJlZCBDYW52YXMgY2FjaGVzLFxyXG4gKiB3aGVyZSBtdWx0aXBsZSBpbnN0YW5jZXMgY2FuIHBvaW50IHRvIG9uZSBnbG9iYWxseS1zdG9yZWQgKHNoYXJlZCkgY2FjaGUgaW5zdGFuY2UuXHJcbiAqXHJcbiAqIEFuIEluc3RhbmNlIGlzIHBvb2xlZCwgYnV0IHdoZW4gY29uc3RydWN0ZWQgd2lsbCBub3QgYXV0b21hdGljYWxseSBjcmVhdGUgY2hpbGRyZW4sIGRyYXdhYmxlcywgZXRjLlxyXG4gKiBzeW5jVHJlZSgpIGlzIHJlc3BvbnNpYmxlIGZvciBzeW5jaHJvbml6aW5nIHRoZSBpbnN0YW5jZSBpdHNlbGYgYW5kIGl0cyBlbnRpcmUgc3VidHJlZS5cclxuICpcclxuICogSW5zdGFuY2VzIGFyZSBjcmVhdGVkIGFzICdzdGF0ZWxlc3MnIGluc3RhbmNlcywgYnV0IGR1cmluZyBzeW5jVHJlZSB0aGUgcmVuZGVyaW5nIHN0YXRlIChwcm9wZXJ0aWVzIHRvIGRldGVybWluZVxyXG4gKiBob3cgdG8gY29uc3RydWN0IHRoZSBkcmF3YWJsZSB0cmVlIGZvciB0aGlzIGluc3RhbmNlIGFuZCBpdHMgc3VidHJlZSkgYXJlIHNldC5cclxuICpcclxuICogV2hpbGUgSW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkICdzdGF0ZWZ1bCcsIHRoZXkgd2lsbCBoYXZlIGxpc3RlbmVycyBhZGRlZCB0byB0aGVpciBOb2RlIHdoaWNoIHJlY29yZHMgYWN0aW9ucyB0YWtlblxyXG4gKiBpbi1iZXR3ZWVuIERpc3BsYXkudXBkYXRlRGlzcGxheSgpLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIuanMnO1xyXG5pbXBvcnQgYXJyYXlSZW1vdmUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2FycmF5UmVtb3ZlLmpzJztcclxuaW1wb3J0IGNsZWFuQXJyYXkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2NsZWFuQXJyYXkuanMnO1xyXG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcclxuaW1wb3J0IHsgQmFja2JvbmVEcmF3YWJsZSwgQ2FudmFzQmxvY2ssIENoYW5nZUludGVydmFsLCBEcmF3YWJsZSwgRml0dGFiaWxpdHksIElubGluZUNhbnZhc0NhY2hlRHJhd2FibGUsIFJlbGF0aXZlVHJhbnNmb3JtLCBSZW5kZXJlciwgc2NlbmVyeSwgU2hhcmVkQ2FudmFzQ2FjaGVEcmF3YWJsZSwgVHJhaWwsIFV0aWxzIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG5sZXQgZ2xvYmFsSWRDb3VudGVyID0gMTtcclxuXHJcbi8vIHByZWZlcmVuY2VzIHRvcCB0byBib3R0b20gaW4gZ2VuZXJhbFxyXG5jb25zdCBkZWZhdWx0UHJlZmVycmVkUmVuZGVyZXJzID0gUmVuZGVyZXIuY3JlYXRlT3JkZXJCaXRtYXNrKFxyXG4gIFJlbmRlcmVyLmJpdG1hc2tTVkcsXHJcbiAgUmVuZGVyZXIuYml0bWFza0NhbnZhcyxcclxuICBSZW5kZXJlci5iaXRtYXNrRE9NLFxyXG4gIFJlbmRlcmVyLmJpdG1hc2tXZWJHTFxyXG4pO1xyXG5cclxuY2xhc3MgSW5zdGFuY2Uge1xyXG4gIC8qKlxyXG4gICAqIEBtaXhlcyBQb29sYWJsZVxyXG4gICAqXHJcbiAgICogU2VlIGluaXRpYWxpemUoKSBmb3IgZG9jdW1lbnRhdGlvblxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XHJcbiAgICogQHBhcmFtIHtUcmFpbH0gdHJhaWxcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzRGlzcGxheVJvb3RcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzU2hhcmVkQ2FudmFzQ2FjaGVSb290XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGRpc3BsYXksIHRyYWlsLCBpc0Rpc3BsYXlSb290LCBpc1NoYXJlZENhbnZhc0NhY2hlUm9vdCApIHtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn1cclxuICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5pbml0aWFsaXplKCBkaXNwbGF5LCB0cmFpbCwgaXNEaXNwbGF5Um9vdCwgaXNTaGFyZWRDYW52YXNDYWNoZVJvb3QgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RGlzcGxheX0gZGlzcGxheSAtIEluc3RhbmNlcyBhcmUgYm91bmQgdG8gYSBzaW5nbGUgZGlzcGxheVxyXG4gICAqIEBwYXJhbSB7VHJhaWx9IHRyYWlsIC0gVGhlIGxpc3Qgb2YgYW5jZXN0b3JzIGdvaW5nIGJhY2sgdXAgdG8gb3VyIHJvb3QgaW5zdGFuY2UgKGZvciB0aGUgZGlzcGxheSwgb3IgZm9yIGEgY2FjaGUpXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0Rpc3BsYXlSb290IC0gV2hldGhlciBvdXIgaW5zdGFuY2UgaXMgZm9yIHRoZSByb290IG5vZGUgcHJvdmlkZWQgdG8gdGhlIERpc3BsYXkuXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpc1NoYXJlZENhbnZhc0NhY2hlUm9vdCAtIFdoZXRoZXIgb3VyIGluc3RhbmNlIGlzIHRoZSByb290IGZvciBhIHNoYXJlZCBDYW52YXMgY2FjaGUgKHdoaWNoIGNhblxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZSB1c2VkIG11bHRpcGxlIHBsYWNlcyBpbiB0aGUgbWFpbiBpbnN0YW5jZSB0cmVlKVxyXG4gICAqL1xyXG4gIGluaXRpYWxpemUoIGRpc3BsYXksIHRyYWlsLCBpc0Rpc3BsYXlSb290LCBpc1NoYXJlZENhbnZhc0NhY2hlUm9vdCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmFjdGl2ZSxcclxuICAgICAgJ1dlIHNob3VsZCBuZXZlciB0cnkgdG8gaW5pdGlhbGl6ZSBhbiBhbHJlYWR5IGFjdGl2ZSBvYmplY3QnICk7XHJcblxyXG4gICAgLy8gcHJldmVudCB0aGUgdHJhaWwgcGFzc2VkIGluIGZyb20gYmVpbmcgbXV0YXRlZCBhZnRlciB0aGlzIHBvaW50ICh3ZSB3YW50IGEgY29uc2lzdGVudCB0cmFpbClcclxuICAgIHRyYWlsLnNldEltbXV0YWJsZSgpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMuaWQgPSB0aGlzLmlkIHx8IGdsb2JhbElkQ291bnRlcisrO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59XHJcbiAgICB0aGlzLmlzV2ViR0xTdXBwb3J0ZWQgPSBkaXNwbGF5LmlzV2ViR0xBbGxvd2VkKCkgJiYgVXRpbHMuaXNXZWJHTFN1cHBvcnRlZDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtSZWxhdGl2ZVRyYW5zZm9ybX0gLSBwcm92aWRlcyBoaWdoLXBlcmZvcm1hbmNlIGFjY2VzcyB0byAncmVsYXRpdmUnIHRyYW5zZm9ybXMgKGZyb20gb3VyIG5lYXJlc3RcclxuICAgIC8vIHRyYW5zZm9ybSByb290KSwgYW5kIGFsbG93cyBmb3IgbGlzdGVuaW5nIHRvIHdoZW4gb3VyIHJlbGF0aXZlIHRyYW5zZm9ybSBjaGFuZ2VzIChjYWxsZWQgZHVyaW5nIGEgcGhhc2Ugb2ZcclxuICAgIC8vIERpc3BsYXkudXBkYXRlRGlzcGxheSgpKS5cclxuICAgIHRoaXMucmVsYXRpdmVUcmFuc2Zvcm0gPSAoIHRoaXMucmVsYXRpdmVUcmFuc2Zvcm0gfHwgbmV3IFJlbGF0aXZlVHJhbnNmb3JtKCB0aGlzICkgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtGaXR0YWJpbGl0eX0gLSBwcm92aWRlcyBsb2dpYyBmb3Igd2hldGhlciBvdXIgZHJhd2FibGVzIChvciBjb21tb24tZml0IGFuY2VzdG9ycykgd2lsbCBzdXBwb3J0IGZpdHRpbmdcclxuICAgIC8vIGZvciBGaXR0ZWRCbG9jayBzdWJ0eXBlcy4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy80MDYuXHJcbiAgICB0aGlzLmZpdHRhYmlsaXR5ID0gKCB0aGlzLmZpdHRhYmlsaXR5IHx8IG5ldyBGaXR0YWJpbGl0eSggdGhpcyApICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn0gLSBUcmFja2luZyBvZiB2aXNpYmlsaXR5IHtib29sZWFufSBhbmQgYXNzb2NpYXRlZCBib29sZWFuIGZsYWdzLlxyXG4gICAgdGhpcy52aXNpYmxlID0gdHJ1ZTsgLy8gZ2xvYmFsIHZpc2liaWxpdHkgKHdoZXRoZXIgdGhpcyBpbnN0YW5jZSB3aWxsIGVuZCB1cCBhcHBlYXJpbmcgb24gdGhlIGRpc3BsYXkpXHJcbiAgICB0aGlzLnJlbGF0aXZlVmlzaWJsZSA9IHRydWU7IC8vIHJlbGF0aXZlIHZpc2liaWxpdHkgKGlnbm9yZXMgdGhlIGNsb3Nlc3QgYW5jZXN0cmFsIHZpc2liaWxpdHkgcm9vdCBhbmQgYmVsb3cpXHJcbiAgICB0aGlzLnNlbGZWaXNpYmxlID0gdHJ1ZTsgLy8gbGlrZSByZWxhdGl2ZSB2aXNpYmlsaXR5LCBidXQgaXMgYWx3YXlzIHRydWUgaWYgd2UgYXJlIGEgdmlzaWJpbGl0eSByb290XHJcbiAgICB0aGlzLnZpc2liaWxpdHlEaXJ0eSA9IHRydWU7IC8vIGVudGlyZSBzdWJ0cmVlIG9mIHZpc2liaWxpdHkgd2lsbCBuZWVkIHRvIGJlIHVwZGF0ZWRcclxuICAgIHRoaXMuY2hpbGRWaXNpYmlsaXR5RGlydHkgPSB0cnVlOyAvLyBhbiBhbmNlc3RvciBuZWVkcyBpdHMgdmlzaWJpbGl0eSB1cGRhdGVkXHJcbiAgICB0aGlzLnZvaWNpbmdWaXNpYmxlID0gdHJ1ZTsgLy8gd2hldGhlciB0aGlzIGluc3RhbmNlIGlzIFwidmlzaWJsZVwiIGZvciBWb2ljaW5nIGFuZCBhbGxvd3Mgc3BlZWNoIHdpdGggdGhhdCBmZWF0dXJlXHJcblxyXG4gICAgLy8gQHByaXZhdGUge09iamVjdC48aW5zdGFuY2VJZDpudW1iZXIsbnVtYmVyPn0gLSBNYXBzIGFub3RoZXIgaW5zdGFuY2UncyBgaW5zdGFuY2UuaWRgIHtudW1iZXJ9ID0+IGJyYW5jaCBpbmRleFxyXG4gICAgLy8ge251bWJlcn0gKGZpcnN0IGluZGV4IHdoZXJlIHRoZSB0d28gdHJhaWxzIGFyZSBkaWZmZXJlbnQpLiBUaGlzIGVmZmVjdGl2ZWx5IG9wZXJhdGVzIGFzIGEgY2FjaGUgKHNpbmNlIGl0J3MgbW9yZVxyXG4gICAgLy8gZXhwZW5zaXZlIHRvIGNvbXB1dGUgdGhlIHZhbHVlIHRoYW4gaXQgaXMgdG8gbG9vayB1cCB0aGUgdmFsdWUpLlxyXG4gICAgLy8gSXQgaXMgYWxzbyBcImJpZGlyZWN0aW9uYWxcIiwgc3VjaCB0aGF0IGlmIHdlIGFkZCBpbnN0YW5jZSBBJ3MgYnJhbmNoIGluZGV4IHRvIHRoaXMgbWFwLCB3ZSB3aWxsIGFsc28gYWRkIHRoZVxyXG4gICAgLy8gc2FtZSB2YWx1ZSB0byBpbnN0YW5jZSBBJ3MgbWFwIChyZWZlcmVuY2luZyB0aGlzIGluc3RhbmNlKS4gSW4gb3JkZXIgdG8gY2xlYW4gdXAgYW5kIHByZXZlbnQgbGVha3MsIHRoZVxyXG4gICAgLy8gaW5zdGFuY2UgcmVmZXJlbmNlcyBhcmUgcHJvdmlkZWQgaW4gdGhpcy5icmFuY2hJbmRleFJlZmVyZW5jZXMgKG9uIGJvdGggZW5kcyksIHNvIHRoYXQgd2hlbiBvbmUgaW5zdGFuY2UgaXNcclxuICAgIC8vIGRpc3Bvc2VkIGl0IGNhbiByZW1vdmUgdGhlIHJlZmVyZW5jZXMgYmlkaXJlY3Rpb25hbGx5LlxyXG4gICAgdGhpcy5icmFuY2hJbmRleE1hcCA9IHRoaXMuYnJhbmNoSW5kZXhNYXAgfHwge307XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPEluc3RhbmNlPn0gLSBBbGwgaW5zdGFuY2VzIHdoZXJlIHdlIGhhdmUgZW50cmllcyBpbiBvdXIgbWFwLiBTZWUgZG9jcyBmb3IgYnJhbmNoSW5kZXhNYXAuXHJcbiAgICB0aGlzLmJyYW5jaEluZGV4UmVmZXJlbmNlcyA9IGNsZWFuQXJyYXkoIHRoaXMuYnJhbmNoSW5kZXhSZWZlcmVuY2VzICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBJbiB0aGUgcmFuZ2UgKC0xLDApLCB0byBoZWxwIHVzIHRyYWNrIGluc2VydGlvbnMgYW5kIHJlbW92YWxzIG9mIHRoaXMgaW5zdGFuY2UncyBub2RlIHRvIGl0c1xyXG4gICAgLy8gcGFyZW50IChkaWQgd2UgZ2V0IHJlbW92ZWQgYnV0IGFkZGVkIGJhY2s/KS5cclxuICAgIC8vIElmIGl0J3MgLTEgYXQgaXRzIHBhcmVudCdzIHN5bmNUcmVlLCB3ZSdsbCBlbmQgdXAgcmVtb3Zpbmcgb3VyIHJlZmVyZW5jZSB0byBpdC5cclxuICAgIC8vIFdlIHVzZSBhbiBpbnRlZ2VyIGp1c3QgZm9yIHNhbml0eSBjaGVja3MgKGlmIGl0IGV2ZXIgcmVhY2hlcyAtMiBvciAxLCB3ZSd2ZSByZWFjaGVkIGFuIGludmFsaWQgc3RhdGUpXHJcbiAgICB0aGlzLmFkZFJlbW92ZUNvdW50ZXIgPSAwO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gSWYgZXF1YWwgdG8gdGhlIGN1cnJlbnQgZnJhbWUgSUQgKGl0IGlzIGluaXRpYWxpemVkIGFzIHN1Y2gpLCB0aGVuIGl0IGlzIHRyZWF0ZWQgZHVyaW5nIHRoZVxyXG4gICAgLy8gY2hhbmdlIGludGVydmFsIHdhdGVyZmFsbCBhcyBcImNvbXBsZXRlbHkgY2hhbmdlZFwiLCBhbmQgYW4gaW50ZXJ2YWwgZm9yIHRoZSBlbnRpcmUgaW5zdGFuY2UgaXMgdXNlZC5cclxuICAgIHRoaXMuc3RpdGNoQ2hhbmdlRnJhbWUgPSBkaXNwbGF5Ll9mcmFtZUlkO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gSWYgZXF1YWwgdG8gdGhlIGN1cnJlbnQgZnJhbWUgSUQsIGFuIGluc3RhbmNlIHdhcyByZW1vdmVkIGZyb20gYmVmb3JlIG9yIGFmdGVyIHRoaXMgaW5zdGFuY2UsXHJcbiAgICAvLyBzbyB3ZSdsbCB3YW50IHRvIGFkZCBpbiBhIHByb3BlciBjaGFuZ2UgaW50ZXJ2YWwgKHJlbGF0ZWQgdG8gc2libGluZ3MpXHJcbiAgICB0aGlzLnN0aXRjaENoYW5nZUJlZm9yZSA9IDA7XHJcbiAgICB0aGlzLnN0aXRjaENoYW5nZUFmdGVyID0gMDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIElmIGVxdWFsIHRvIHRoZSBjdXJyZW50IGZyYW1lIElELCBjaGlsZCBpbnN0YW5jZXMgd2VyZSBhZGRlZCBvciByZW1vdmVkIGZyb20gdGhpcyBpbnN0YW5jZS5cclxuICAgIHRoaXMuc3RpdGNoQ2hhbmdlT25DaGlsZHJlbiA9IDA7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gd2hldGhlciB3ZSBoYXZlIGJlZW4gaW5jbHVkZWQgaW4gb3VyIHBhcmVudCdzIGRyYXdhYmxlcyB0aGUgcHJldmlvdXMgZnJhbWVcclxuICAgIHRoaXMuc3RpdGNoQ2hhbmdlSW5jbHVkZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259IC0gTm9kZSBsaXN0ZW5lcnMgZm9yIHRyYWNraW5nIGNoaWxkcmVuLiBMaXN0ZW5lcnMgc2hvdWxkIGJlIGFkZGVkIG9ubHkgd2hlbiB3ZSBiZWNvbWVcclxuICAgIC8vIHN0YXRlZnVsXHJcbiAgICB0aGlzLmNoaWxkSW5zZXJ0ZWRMaXN0ZW5lciA9IHRoaXMuY2hpbGRJbnNlcnRlZExpc3RlbmVyIHx8IHRoaXMub25DaGlsZEluc2VydGVkLmJpbmQoIHRoaXMgKTtcclxuICAgIHRoaXMuY2hpbGRSZW1vdmVkTGlzdGVuZXIgPSB0aGlzLmNoaWxkUmVtb3ZlZExpc3RlbmVyIHx8IHRoaXMub25DaGlsZFJlbW92ZWQuYmluZCggdGhpcyApO1xyXG4gICAgdGhpcy5jaGlsZHJlblJlb3JkZXJlZExpc3RlbmVyID0gdGhpcy5jaGlsZHJlblJlb3JkZXJlZExpc3RlbmVyIHx8IHRoaXMub25DaGlsZHJlblJlb3JkZXJlZC5iaW5kKCB0aGlzICk7XHJcbiAgICB0aGlzLnZpc2liaWxpdHlMaXN0ZW5lciA9IHRoaXMudmlzaWJpbGl0eUxpc3RlbmVyIHx8IHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlLmJpbmQoIHRoaXMgKTtcclxuICAgIHRoaXMubWFya1JlbmRlclN0YXRlRGlydHlMaXN0ZW5lciA9IHRoaXMubWFya1JlbmRlclN0YXRlRGlydHlMaXN0ZW5lciB8fCB0aGlzLm1hcmtSZW5kZXJTdGF0ZURpcnR5LmJpbmQoIHRoaXMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtUaW55RW1pdHRlcn1cclxuICAgIHRoaXMudmlzaWJsZUVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXIoKTtcclxuICAgIHRoaXMucmVsYXRpdmVWaXNpYmxlRW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xyXG4gICAgdGhpcy5zZWxmVmlzaWJsZUVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXIoKTtcclxuICAgIHRoaXMuY2FuVm9pY2VFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XHJcblxyXG4gICAgdGhpcy5jbGVhbkluc3RhbmNlKCBkaXNwbGF5LCB0cmFpbCApO1xyXG5cclxuICAgIC8vIFdlIG5lZWQgdG8gYWRkIHRoaXMgcmVmZXJlbmNlIG9uIHN0YXRlbGVzcyBpbnN0YW5jZXMsIHNvIHRoYXQgd2UgY2FuIGZpbmQgb3V0IGlmIGl0IHdhcyByZW1vdmVkIGJlZm9yZSBvdXJcclxuICAgIC8vIHN5bmNUcmVlIHdhcyBjYWxsZWQuXHJcbiAgICB0aGlzLm5vZGUuYWRkSW5zdGFuY2UoIHRoaXMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIE91dHN0YW5kaW5nIGV4dGVybmFsIHJlZmVyZW5jZXMuIHVzZWQgZm9yIHNoYXJlZCBjYWNoZSBpbnN0YW5jZXMsIHdoZXJlIG11bHRpcGxlIGluc3RhbmNlc1xyXG4gICAgLy8gY2FuIHBvaW50IHRvIHVzLlxyXG4gICAgdGhpcy5leHRlcm5hbFJlZmVyZW5jZUNvdW50ID0gMDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufSAtIFdoZXRoZXIgd2UgaGF2ZSBoYWQgb3VyIHN0YXRlIGluaXRpYWxpemVkIHlldFxyXG4gICAgdGhpcy5zdGF0ZWxlc3MgPSB0cnVlO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gV2hldGhlciB3ZSBhcmUgdGhlIHJvb3QgaW5zdGFuY2UgZm9yIGEgRGlzcGxheS4gUmVuZGVyaW5nIHN0YXRlIGNvbnN0YW50ICh3aWxsIG5vdCBjaGFuZ2VcclxuICAgIC8vIG92ZXIgdGhlIGxpZmUgb2YgYW4gaW5zdGFuY2UpXHJcbiAgICB0aGlzLmlzRGlzcGxheVJvb3QgPSBpc0Rpc3BsYXlSb290O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gV2hldGhlciB3ZSBhcmUgdGhlIHJvb3Qgb2YgYSBDYW52YXMgY2FjaGUuIFJlbmRlcmluZyBzdGF0ZSBjb25zdGFudCAod2lsbCBub3QgY2hhbmdlIG92ZXIgdGhlXHJcbiAgICAvLyBsaWZlIG9mIGFuIGluc3RhbmNlKVxyXG4gICAgdGhpcy5pc1NoYXJlZENhbnZhc0NhY2hlUm9vdCA9IGlzU2hhcmVkQ2FudmFzQ2FjaGVSb290O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gW0NBU0NBRElORyBSRU5ERVIgU1RBVEVdIFBhY2tlZCByZW5kZXJlciBvcmRlciBiaXRtYXNrICh3aGF0IG91ciByZW5kZXJlciBwcmVmZXJlbmNlcyBhcmUpLlxyXG4gICAgLy8gUGFydCBvZiB0aGUgJ2Nhc2NhZGluZycgcmVuZGVyIHN0YXRlIGZvciB0aGUgaW5zdGFuY2UgdHJlZS4gVGhlc2UgYXJlIHByb3BlcnRpZXMgdGhhdCBjYW4gYWZmZWN0IHRoZSBlbnRpcmVcclxuICAgIC8vIHN1YnRyZWUgd2hlbiBzZXRcclxuICAgIHRoaXMucHJlZmVycmVkUmVuZGVyZXJzID0gMDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBbQ0FTQ0FESU5HIFJFTkRFUiBTVEFURV0gV2hldGhlciB3ZSBhcmUgYmVuZWF0aCBhIENhbnZhcyBjYWNoZSAoQ2FudmFzIHJlcXVpcmVkKS4gUGFydCBvZlxyXG4gICAgLy8gdGhlICdjYXNjYWRpbmcnIHJlbmRlciBzdGF0ZSBmb3IgdGhlIGluc3RhbmNlIHRyZWUuIFRoZXNlIGFyZSBwcm9wZXJ0aWVzIHRoYXQgY2FuIGFmZmVjdCB0aGUgZW50aXJlIHN1YnRyZWUgd2hlblxyXG4gICAgLy8gc2V0XHJcbiAgICB0aGlzLmlzVW5kZXJDYW52YXNDYWNoZSA9IGlzU2hhcmVkQ2FudmFzQ2FjaGVSb290O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gW1JFTkRFUiBTVEFURSBFWFBPUlRdIFdoZXRoZXIgd2Ugd2lsbCBoYXZlIGEgQmFja2JvbmVEcmF3YWJsZSBncm91cCBkcmF3YWJsZVxyXG4gICAgdGhpcy5pc0JhY2tib25lID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn0gLSBbUkVOREVSIFNUQVRFIEVYUE9SVF0gV2hldGhlciB0aGlzIGluc3RhbmNlIGNyZWF0ZXMgYSBuZXcgXCJyb290XCIgZm9yIHRoZSByZWxhdGl2ZSB0cmFpbFxyXG4gICAgLy8gdHJhbnNmb3Jtc1xyXG4gICAgdGhpcy5pc1RyYW5zZm9ybWVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gW1JFTkRFUiBTVEFURSBFWFBPUlRdIFdoZXRoZXIgdGhpcyBpbnN0YW5jZSBoYW5kbGVzIHZpc2liaWxpdHkgd2l0aCBhIGdyb3VwIGRyYXdhYmxlXHJcbiAgICB0aGlzLmlzVmlzaWJpbGl0eUFwcGxpZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBbUkVOREVSIFNUQVRFIEVYUE9SVF0gV2hldGhlciB3ZSBoYXZlIGEgQ2FudmFzIGNhY2hlIHNwZWNpZmljIHRvIHRoaXMgaW5zdGFuY2UncyBwb3NpdGlvblxyXG4gICAgdGhpcy5pc0luc3RhbmNlQ2FudmFzQ2FjaGUgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBbUkVOREVSIFNUQVRFIEVYUE9SVF1cclxuICAgIHRoaXMuaXNTaGFyZWRDYW52YXNDYWNoZVBsYWNlaG9sZGVyID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gW1JFTkRFUiBTVEFURSBFWFBPUlRdXHJcbiAgICB0aGlzLmlzU2hhcmVkQ2FudmFzQ2FjaGVTZWxmID0gaXNTaGFyZWRDYW52YXNDYWNoZVJvb3Q7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBbUkVOREVSIFNUQVRFIEVYUE9SVF0gUmVuZGVyZXIgYml0bWFzayBmb3IgdGhlICdzZWxmJyBkcmF3YWJsZSAoaWYgb3VyIE5vZGUgaXMgcGFpbnRlZClcclxuICAgIHRoaXMuc2VsZlJlbmRlcmVyID0gMDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIFtSRU5ERVIgU1RBVEUgRVhQT1JUXSBSZW5kZXJlciBiaXRtYXNrIGZvciB0aGUgJ2dyb3VwJyBkcmF3YWJsZSAoaWYgYXBwbGljYWJsZSlcclxuICAgIHRoaXMuZ3JvdXBSZW5kZXJlciA9IDA7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBbUkVOREVSIFNUQVRFIEVYUE9SVF0gUmVuZGVyZXIgYml0bWFzayBmb3IgdGhlIGNhY2hlIGRyYXdhYmxlIChpZiBhcHBsaWNhYmxlKVxyXG4gICAgdGhpcy5zaGFyZWRDYWNoZVJlbmRlcmVyID0gMDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIFdoZW4gZXF1YWwgdG8gdGhlIGN1cnJlbnQgZnJhbWUgaXQgaXMgY29uc2lkZXJlZCBcImRpcnR5XCIuIElzIGEgcHJ1bmluZyBmbGFnICh3aGV0aGVyIHdlIG5lZWRcclxuICAgIC8vIHRvIGJlIHZpc2l0ZWQsIHdoZXRoZXIgdXBkYXRlUmVuZGVyaW5nU3RhdGUgaXMgcmVxdWlyZWQsIGFuZCB3aGV0aGVyIHRvIHZpc2l0IGNoaWxkcmVuKVxyXG4gICAgdGhpcy5yZW5kZXJTdGF0ZURpcnR5RnJhbWUgPSBkaXNwbGF5Ll9mcmFtZUlkO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gV2hlbiBlcXVhbCB0byB0aGUgY3VycmVudCBmcmFtZSB3ZSBjYW4ndCBwcnVuZSBhdCB0aGlzIGluc3RhbmNlLiBJcyBhIHBydW5pbmcgZmxhZyAod2hldGhlclxyXG4gICAgLy8gd2UgbmVlZCB0byBiZSB2aXNpdGVkLCB3aGV0aGVyIHVwZGF0ZVJlbmRlcmluZ1N0YXRlIGlzIHJlcXVpcmVkLCBhbmQgd2hldGhlciB0byB2aXNpdCBjaGlsZHJlbilcclxuICAgIHRoaXMuc2tpcFBydW5pbmdGcmFtZSA9IGRpc3BsYXkuX2ZyYW1lSWQ7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UoIGBpbml0aWFsaXplZCAke3RoaXMudG9TdHJpbmcoKX1gICk7XHJcblxyXG4gICAgLy8gV2hldGhlciB3ZSBoYXZlIGJlZW4gaW5zdGFudGlhdGVkLiBmYWxzZSBpZiB3ZSBhcmUgaW4gYSBwb29sIHdhaXRpbmcgdG8gYmUgaW5zdGFudGlhdGVkLlxyXG4gICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGZvciBpbml0aWFsaXphdGlvbiBvZiBwcm9wZXJ0aWVzICh2aWEgaW5pdGlhbGl6ZSgpLCB2aWEgY29uc3RydWN0b3IpLCBhbmQgdG8gY2xlYW4gdGhlIGluc3RhbmNlIGZvclxyXG4gICAqIHBsYWNlbWVudCBpbiB0aGUgcG9vbCAoZG9uJ3QgbGVhayBtZW1vcnkpLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBJZiB0aGUgcGFyYW1ldGVycyBhcmUgbnVsbCwgd2UgcmVtb3ZlIGFsbCBleHRlcm5hbCByZWZlcmVuY2VzIHNvIHRoYXQgd2UgZG9uJ3QgbGVhayBtZW1vcnkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Rpc3BsYXl8bnVsbH0gZGlzcGxheSAtIEluc3RhbmNlcyBhcmUgYm91bmQgdG8gYSBzaW5nbGUgZGlzcGxheVxyXG4gICAqIEBwYXJhbSB7VHJhaWx8bnVsbH0gdHJhaWwgLSBUaGUgbGlzdCBvZiBhbmNlc3RvcnMgZ29pbmcgYmFjayB1cCB0byBvdXIgcm9vdCBpbnN0YW5jZSAoZm9yIHRoZSBkaXNwbGF5LCBvciBmb3IgYSBjYWNoZSlcclxuICAgKi9cclxuICBjbGVhbkluc3RhbmNlKCBkaXNwbGF5LCB0cmFpbCApIHtcclxuICAgIC8vIEBwdWJsaWMge0Rpc3BsYXl8bnVsbH1cclxuICAgIHRoaXMuZGlzcGxheSA9IGRpc3BsYXk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7VHJhaWx8bnVsbH1cclxuICAgIHRoaXMudHJhaWwgPSB0cmFpbDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtOb2RlfG51bGx9XHJcbiAgICB0aGlzLm5vZGUgPSB0cmFpbCA/IHRyYWlsLmxhc3ROb2RlKCkgOiBudWxsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0luc3RhbmNlfG51bGx9IC0gd2lsbCBiZSBzZXQgYXMgbmVlZGVkXHJcbiAgICB0aGlzLnBhcmVudCA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0luc3RhbmNlfG51bGx9IC0gc2V0IHdoZW4gcmVtb3ZlZCBmcm9tIHVzLCBzbyB0aGF0IHdlIGNhbiBlYXNpbHkgcmVhdHRhY2ggaXQgd2hlbiBuZWNlc3NhcnlcclxuICAgIHRoaXMub2xkUGFyZW50ID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48SW5zdGFuY2U+fSAtIE5PVEU6IHJlbGlhbmNlIG9uIGNvcnJlY3Qgb3JkZXIgYWZ0ZXIgc3luY1RyZWUgYnkgYXQgbGVhc3QgU1ZHQmxvY2svU1ZHR3JvdXBcclxuICAgIHRoaXMuY2hpbGRyZW4gPSBjbGVhbkFycmF5KCB0aGlzLmNoaWxkcmVuICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0luc3RhbmNlfG51bGx9IC0gcmVmZXJlbmNlIHRvIGEgc2hhcmVkIGNhY2hlIGluc3RhbmNlIChkaWZmZXJlbnQgdGhhbiBhIGNoaWxkKVxyXG4gICAgdGhpcy5zaGFyZWRDYWNoZUluc3RhbmNlID0gbnVsbDtcclxuXHJcbiAgICAvLyBpbml0aWFsaXplL2NsZWFuIHN1Yi1jb21wb25lbnRzXHJcbiAgICB0aGlzLnJlbGF0aXZlVHJhbnNmb3JtLmluaXRpYWxpemUoIGRpc3BsYXksIHRyYWlsICk7XHJcbiAgICB0aGlzLmZpdHRhYmlsaXR5LmluaXRpYWxpemUoIGRpc3BsYXksIHRyYWlsICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0FycmF5LjxJbnN0YW5jZT59IC0gQ2hpbGQgaW5zdGFuY2VzIGFyZSBwdXNoZWQgdG8gaGVyZSB3aGVuIHRoZWlyIG5vZGUgaXMgcmVtb3ZlZCBmcm9tIG91ciBub2RlLlxyXG4gICAgLy8gV2UgZG9uJ3QgaW1tZWRpYXRlbHkgZGlzcG9zZSwgc2luY2UgaXQgbWF5IGJlIGFkZGVkIGJhY2suXHJcbiAgICB0aGlzLmluc3RhbmNlUmVtb3ZhbENoZWNrTGlzdCA9IGNsZWFuQXJyYXkoIHRoaXMuaW5zdGFuY2VSZW1vdmFsQ2hlY2tMaXN0ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RHJhd2FibGV8bnVsbH0gLSBPdXIgc2VsZi1kcmF3YWJsZSBpbiB0aGUgZHJhd2FibGUgdHJlZVxyXG4gICAgdGhpcy5zZWxmRHJhd2FibGUgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0RyYXdhYmxlfG51bGx9IC0gT3VyIGJhY2tib25lIG9yIG5vbi1zaGFyZWQgY2FjaGVcclxuICAgIHRoaXMuZ3JvdXBEcmF3YWJsZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RHJhd2FibGV8bnVsbH0gLSBPdXIgZHJhd2FibGUgaWYgd2UgYXJlIGEgc2hhcmVkIGNhY2hlXHJcbiAgICB0aGlzLnNoYXJlZENhY2hlRHJhd2FibGUgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtEcmF3YWJsZX0gLSByZWZlcmVuY2VzIGludG8gdGhlIGxpbmtlZCBsaXN0IG9mIGRyYXdhYmxlcyAobnVsbCBpZiBub3RoaW5nIGlzIGRyYXdhYmxlIHVuZGVyIHRoaXMpXHJcbiAgICB0aGlzLmZpcnN0RHJhd2FibGUgPSBudWxsO1xyXG4gICAgdGhpcy5sYXN0RHJhd2FibGUgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtEcmF3YWJsZX0gLSByZWZlcmVuY2VzIGludG8gdGhlIGxpbmtlZCBsaXN0IG9mIGRyYXdhYmxlcyAoZXhjbHVkZXMgYW55IGdyb3VwIGRyYXdhYmxlcyBoYW5kbGluZylcclxuICAgIHRoaXMuZmlyc3RJbm5lckRyYXdhYmxlID0gbnVsbDtcclxuICAgIHRoaXMubGFzdElubmVyRHJhd2FibGUgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBcnJheS48U1ZHR3JvdXA+fSAtIExpc3Qgb2YgU1ZHIGdyb3VwcyBhc3NvY2lhdGVkIHdpdGggdGhpcyBkaXNwbGF5IGluc3RhbmNlXHJcbiAgICB0aGlzLnN2Z0dyb3VwcyA9IGNsZWFuQXJyYXkoIHRoaXMuc3ZnR3JvdXBzICk7XHJcblxyXG4gICAgdGhpcy5jbGVhblN5bmNUcmVlUmVzdWx0cygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgb3IgY2xlYXJzIHByb3BlcnRpZXMgdGhhdCBhcmUgYWxsIHNldCBhcyBwc2V1ZG8gJ3JldHVybiB2YWx1ZXMnIG9mIHRoZSBzeW5jVHJlZSgpIG1ldGhvZC4gSXQgaXMgdGhlXHJcbiAgICogcmVzcG9uc2liaWxpdHkgb2YgdGhlIGNhbGxlciBvZiBzeW5jVHJlZSgpIHRvIGFmdGVyd2FyZHMgKG9wdGlvbmFsbHkgcmVhZCB0aGVzZSByZXN1bHRzIGFuZCkgY2xlYXIgdGhlIHJlZmVyZW5jZXNcclxuICAgKiB1c2luZyB0aGlzIG1ldGhvZCB0byBwcmV2ZW50IG1lbW9yeSBsZWFrcy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogVE9ETzogY29uc2lkZXIgYSBwb29sIG9mIChvciBhIHNpbmdsZSBnbG9iYWwpIHR5cGVkIHJldHVybiBvYmplY3QocyksIHNpbmNlIHNldHRpbmcgdGhlc2UgdmFsdWVzIG9uIHRoZSBpbnN0YW5jZVxyXG4gICAqIGdlbmVyYWxseSBtZWFucyBoaXR0aW5nIHRoZSBoZWFwLCBhbmQgY2FuIHNsb3cgdXMgZG93bi5cclxuICAgKi9cclxuICBjbGVhblN5bmNUcmVlUmVzdWx0cygpIHtcclxuICAgIC8vIFRyYWNraW5nIGJvdW5kaW5nIGluZGljZXMgLyBkcmF3YWJsZXMgZm9yIHdoYXQgaGFzIGNoYW5nZWQsIHNvIHdlIGRvbid0IGhhdmUgdG8gb3Zlci1zdGl0Y2ggdGhpbmdzLlxyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gaWYgKG5vdCBpZmYpIGNoaWxkJ3MgaW5kZXggPD0gYmVmb3JlU3RhYmxlSW5kZXgsIGl0IGhhc24ndCBiZWVuIGFkZGVkL3JlbW92ZWQuIHJlbGV2YW50IHRvXHJcbiAgICAvLyBjdXJyZW50IGNoaWxkcmVuLlxyXG4gICAgdGhpcy5iZWZvcmVTdGFibGVJbmRleCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gaWYgKG5vdCBpZmYpIGNoaWxkJ3MgaW5kZXggPj0gYWZ0ZXJTdGFibGVJbmRleCwgaXQgaGFzbid0IGJlZW4gYWRkZWQvcmVtb3ZlZC4gcmVsZXZhbnQgdG9cclxuICAgIC8vIGN1cnJlbnQgY2hpbGRyZW4uXHJcbiAgICB0aGlzLmFmdGVyU3RhYmxlSW5kZXggPSAtMTtcclxuXHJcbiAgICAvLyBOT1RFOiBib3RoIG9mIHRoZXNlIGJlaW5nIG51bGwgaW5kaWNhdGVzIFwidGhlcmUgYXJlIG5vIGNoYW5nZSBpbnRlcnZhbHNcIiwgb3RoZXJ3aXNlIGl0IGFzc3VtZXMgaXQgcG9pbnRzIHRvXHJcbiAgICAvLyBhIGxpbmtlZC1saXN0IG9mIGNoYW5nZSBpbnRlcnZhbHMuIFdlIHVzZSB7Q2hhbmdlSW50ZXJ2YWx9cyB0byBob2xkIHRoaXMgaW5mb3JtYXRpb24sIHNlZSBDaGFuZ2VJbnRlcnZhbCB0byBzZWVcclxuICAgIC8vIHRoZSBpbmRpdmlkdWFsIHByb3BlcnRpZXMgdGhhdCBhcmUgY29uc2lkZXJlZCBwYXJ0IG9mIGEgY2hhbmdlIGludGVydmFsLlxyXG5cclxuICAgIC8vIEBwcml2YXRlIHtDaGFuZ2VJbnRlcnZhbH0sIGZpcnN0IGNoYW5nZSBpbnRlcnZhbCAoc2hvdWxkIGhhdmUgbmV4dENoYW5nZUludGVydmFsIGxpbmtlZC1saXN0IHRvXHJcbiAgICAvLyBsYXN0Q2hhbmdlSW50ZXJ2YWwpXHJcbiAgICB0aGlzLmZpcnN0Q2hhbmdlSW50ZXJ2YWwgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtDaGFuZ2VJbnRlcnZhbH0sIGxhc3QgY2hhbmdlIGludGVydmFsXHJcbiAgICB0aGlzLmxhc3RDaGFuZ2VJbnRlcnZhbCA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gcmVuZGVyIHN0YXRlIGNoYW5nZSBmbGFncywgYWxsIHNldCBpbiB1cGRhdGVSZW5kZXJpbmdTdGF0ZSgpXHJcbiAgICB0aGlzLmluY29tcGF0aWJsZVN0YXRlQ2hhbmdlID0gZmFsc2U7IC8vIFdoZXRoZXIgd2UgbmVlZCB0byByZWNyZWF0ZSB0aGUgaW5zdGFuY2UgdHJlZVxyXG4gICAgdGhpcy5ncm91cENoYW5nZWQgPSBmYWxzZTsgLy8gV2hldGhlciB3ZSBuZWVkIHRvIGZvcmNlIGEgcmVidWlsZCBvZiB0aGUgZ3JvdXAgZHJhd2FibGVcclxuICAgIHRoaXMuY2FzY2FkaW5nU3RhdGVDaGFuZ2UgPSBmYWxzZTsgLy8gV2hldGhlciB3ZSBoYWQgYSByZW5kZXIgc3RhdGUgY2hhbmdlIHRoYXQgcmVxdWlyZXMgdmlzaXRpbmcgYWxsIGNoaWxkcmVuXHJcbiAgICB0aGlzLmFueVN0YXRlQ2hhbmdlID0gZmFsc2U7IC8vIFdoZXRoZXIgdGhlcmUgd2FzIGFueSBjaGFuZ2Ugb2YgcmVuZGVyaW5nIHN0YXRlIHdpdGggdGhlIGxhc3QgdXBkYXRlUmVuZGVyaW5nU3RhdGUoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgcmVuZGVyaW5nIHN0YXRlIHByb3BlcnRpZXMsIGFuZCByZXR1cm5zIGEge2Jvb2xlYW59IGZsYWcgb2Ygd2hldGhlciBpdCB3YXMgc3VjY2Vzc2Z1bCBpZiB3ZSB3ZXJlXHJcbiAgICogYWxyZWFkeSBzdGF0ZWZ1bC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogUmVuZGVyaW5nIHN0YXRlIHByb3BlcnRpZXMgZGV0ZXJtaW5lIGhvdyB3ZSBjb25zdHJ1Y3QgdGhlIGRyYXdhYmxlIHRyZWUgZnJvbSBvdXIgaW5zdGFuY2UgdHJlZSAoZS5nLiBkbyB3ZVxyXG4gICAqIGNyZWF0ZSBhbiBTVkcgb3IgQ2FudmFzIHJlY3RhbmdsZSwgd2hlcmUgdG8gcGxhY2UgQ1NTIHRyYW5zZm9ybXMsIGhvdyB0byBoYW5kbGUgb3BhY2l0eSwgZXRjLilcclxuICAgKlxyXG4gICAqIEluc3RhbmNlcyBzdGFydCBvdXQgYXMgJ3N0YXRlbGVzcycgdW50aWwgdXBkYXRlUmVuZGVyaW5nU3RhdGUoKSBpcyBjYWxsZWQgdGhlIGZpcnN0IHRpbWUuXHJcbiAgICpcclxuICAgKiBOb2RlIGNoYW5nZXMgdGhhdCBjYW4gY2F1c2UgYSBwb3RlbnRpYWwgc3RhdGUgY2hhbmdlICh1c2luZyBOb2RlIGV2ZW50IGxpc3RlbmVycyk6XHJcbiAgICogLSBoaW50c1xyXG4gICAqIC0gb3BhY2l0eVxyXG4gICAqIC0gY2xpcEFyZWFcclxuICAgKiAtIF9yZW5kZXJlclN1bW1hcnlcclxuICAgKiAtIF9yZW5kZXJlckJpdG1hc2tcclxuICAgKlxyXG4gICAqIFN0YXRlIGNoYW5nZXMgdGhhdCBjYW4gY2F1c2UgY2FzY2FkaW5nIHN0YXRlIGNoYW5nZXMgaW4gZGVzY2VuZGFudHM6XHJcbiAgICogLSBpc1VuZGVyQ2FudmFzQ2FjaGVcclxuICAgKiAtIHByZWZlcnJlZFJlbmRlcmVyc1xyXG4gICAqL1xyXG4gIHVwZGF0ZVJlbmRlcmluZ1N0YXRlKCkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UoIGB1cGRhdGVSZW5kZXJpbmdTdGF0ZSAke3RoaXMudG9TdHJpbmcoKVxyXG4gICAgfSR7dGhpcy5zdGF0ZWxlc3MgPyAnIChzdGF0ZWxlc3MpJyA6ICcnfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSggYG9sZDogJHt0aGlzLmdldFN0YXRlU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIC8vIG9sZCBzdGF0ZSBpbmZvcm1hdGlvbiwgc28gd2UgY2FuIGNvbXBhcmUgd2hhdCB3YXMgY2hhbmdlZFxyXG4gICAgY29uc3Qgd2FzQmFja2JvbmUgPSB0aGlzLmlzQmFja2JvbmU7XHJcbiAgICBjb25zdCB3YXNUcmFuc2Zvcm1lZCA9IHRoaXMuaXNUcmFuc2Zvcm1lZDtcclxuICAgIGNvbnN0IHdhc1Zpc2liaWxpdHlBcHBsaWVkID0gdGhpcy5pc1Zpc2liaWxpdHlBcHBsaWVkO1xyXG4gICAgY29uc3Qgd2FzSW5zdGFuY2VDYW52YXNDYWNoZSA9IHRoaXMuaXNJbnN0YW5jZUNhbnZhc0NhY2hlO1xyXG4gICAgY29uc3Qgd2FzU2hhcmVkQ2FudmFzQ2FjaGVTZWxmID0gdGhpcy5pc1NoYXJlZENhbnZhc0NhY2hlU2VsZjtcclxuICAgIGNvbnN0IHdhc1NoYXJlZENhbnZhc0NhY2hlUGxhY2Vob2xkZXIgPSB0aGlzLmlzU2hhcmVkQ2FudmFzQ2FjaGVQbGFjZWhvbGRlcjtcclxuICAgIGNvbnN0IHdhc1VuZGVyQ2FudmFzQ2FjaGUgPSB0aGlzLmlzVW5kZXJDYW52YXNDYWNoZTtcclxuICAgIGNvbnN0IG9sZFNlbGZSZW5kZXJlciA9IHRoaXMuc2VsZlJlbmRlcmVyO1xyXG4gICAgY29uc3Qgb2xkR3JvdXBSZW5kZXJlciA9IHRoaXMuZ3JvdXBSZW5kZXJlcjtcclxuICAgIGNvbnN0IG9sZFNoYXJlZENhY2hlUmVuZGVyZXIgPSB0aGlzLnNoYXJlZENhY2hlUmVuZGVyZXI7XHJcbiAgICBjb25zdCBvbGRQcmVmZXJyZWRSZW5kZXJlcnMgPSB0aGlzLnByZWZlcnJlZFJlbmRlcmVycztcclxuXHJcbiAgICAvLyBkZWZhdWx0IHZhbHVlcyB0byBzZXQgKG1ha2VzIHRoZSBsb2dpYyBtdWNoIHNpbXBsZXIpXHJcbiAgICB0aGlzLmlzQmFja2JvbmUgPSBmYWxzZTtcclxuICAgIHRoaXMuaXNUcmFuc2Zvcm1lZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc1Zpc2liaWxpdHlBcHBsaWVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzSW5zdGFuY2VDYW52YXNDYWNoZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc1NoYXJlZENhbnZhc0NhY2hlU2VsZiA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc1NoYXJlZENhbnZhc0NhY2hlUGxhY2Vob2xkZXIgPSBmYWxzZTtcclxuICAgIHRoaXMuc2VsZlJlbmRlcmVyID0gMDtcclxuICAgIHRoaXMuZ3JvdXBSZW5kZXJlciA9IDA7XHJcbiAgICB0aGlzLnNoYXJlZENhY2hlUmVuZGVyZXIgPSAwO1xyXG5cclxuICAgIGNvbnN0IGhpbnRzID0gdGhpcy5ub2RlLl9oaW50cztcclxuXHJcbiAgICB0aGlzLmlzVW5kZXJDYW52YXNDYWNoZSA9IHRoaXMuaXNTaGFyZWRDYW52YXNDYWNoZVJvb3QgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCB0aGlzLnBhcmVudCA/ICggdGhpcy5wYXJlbnQuaXNVbmRlckNhbnZhc0NhY2hlIHx8IHRoaXMucGFyZW50LmlzSW5zdGFuY2VDYW52YXNDYWNoZSB8fCB0aGlzLnBhcmVudC5pc1NoYXJlZENhbnZhc0NhY2hlU2VsZiApIDogZmFsc2UgKTtcclxuXHJcbiAgICAvLyBzZXQgdXAgb3VyIHByZWZlcnJlZCByZW5kZXJlciBsaXN0IChnZW5lcmFsbHkgYmFzZWQgb24gdGhlIHBhcmVudClcclxuICAgIHRoaXMucHJlZmVycmVkUmVuZGVyZXJzID0gdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5wcmVmZXJyZWRSZW5kZXJlcnMgOiBkZWZhdWx0UHJlZmVycmVkUmVuZGVyZXJzO1xyXG4gICAgLy8gYWxsb3cgdGhlIG5vZGUgdG8gbW9kaWZ5IGl0cyBwcmVmZXJyZWQgcmVuZGVyZXJzIChhbmQgdGhvc2Ugb2YgaXRzIGRlc2NlbmRhbnRzKVxyXG4gICAgaWYgKCBoaW50cy5yZW5kZXJlciApIHtcclxuICAgICAgdGhpcy5wcmVmZXJyZWRSZW5kZXJlcnMgPSBSZW5kZXJlci5wdXNoT3JkZXJCaXRtYXNrKCB0aGlzLnByZWZlcnJlZFJlbmRlcmVycywgaGludHMucmVuZGVyZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBoYXNDbGlwID0gdGhpcy5ub2RlLmhhc0NsaXBBcmVhKCk7XHJcbiAgICBjb25zdCBoYXNGaWx0ZXJzID0gdGhpcy5ub2RlLmVmZmVjdGl2ZU9wYWNpdHkgIT09IDEgfHwgaGludHMudXNlc09wYWNpdHkgfHwgdGhpcy5ub2RlLl9maWx0ZXJzLmxlbmd0aCA+IDA7XHJcbiAgICAvLyBsZXQgaGFzTm9uRE9NRmlsdGVyID0gZmFsc2U7XHJcbiAgICBsZXQgaGFzTm9uU1ZHRmlsdGVyID0gZmFsc2U7XHJcbiAgICBsZXQgaGFzTm9uQ2FudmFzRmlsdGVyID0gZmFsc2U7XHJcbiAgICAvLyBsZXQgaGFzTm9uV2ViR0xGaWx0ZXIgPSBmYWxzZTtcclxuICAgIGlmICggaGFzRmlsdGVycyApIHtcclxuICAgICAgLy8gTk9URTogb3BhY2l0eSBpcyBPSyB3aXRoIGFsbCBvZiB0aG9zZSAoY3VycmVudGx5KVxyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm5vZGUuX2ZpbHRlcnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgZmlsdGVyID0gdGhpcy5ub2RlLl9maWx0ZXJzWyBpIF07XHJcblxyXG4gICAgICAgIC8vIFRPRE86IGhvdyB0byBoYW5kbGUgdGhpcywgaWYgd2Ugc3BsaXQgQVQgdGhlIG5vZGU/XHJcbiAgICAgICAgLy8gaWYgKCAhZmlsdGVyLmlzRE9NQ29tcGF0aWJsZSgpICkge1xyXG4gICAgICAgIC8vICAgaGFzTm9uRE9NRmlsdGVyID0gdHJ1ZTtcclxuICAgICAgICAvLyB9XHJcbiAgICAgICAgaWYgKCAhZmlsdGVyLmlzU1ZHQ29tcGF0aWJsZSgpICkge1xyXG4gICAgICAgICAgaGFzTm9uU1ZHRmlsdGVyID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCAhZmlsdGVyLmlzQ2FudmFzQ29tcGF0aWJsZSgpICkge1xyXG4gICAgICAgICAgaGFzTm9uQ2FudmFzRmlsdGVyID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaWYgKCAhZmlsdGVyLmlzV2ViR0xDb21wYXRpYmxlKCkgKSB7XHJcbiAgICAgICAgLy8gICBoYXNOb25XZWJHTEZpbHRlciA9IHRydWU7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCByZXF1aXJlc1NwbGl0ID0gaGludHMuY3NzVHJhbnNmb3JtIHx8IGhpbnRzLmxheWVyU3BsaXQ7XHJcbiAgICBjb25zdCBiYWNrYm9uZVJlcXVpcmVkID0gdGhpcy5pc0Rpc3BsYXlSb290IHx8ICggIXRoaXMuaXNVbmRlckNhbnZhc0NhY2hlICYmIHJlcXVpcmVzU3BsaXQgKTtcclxuXHJcbiAgICAvLyBTdXBwb3J0IGVpdGhlciBcImFsbCBDYW52YXNcIiBvciBcImFsbCBTVkdcIiBvcGFjaXR5L2NsaXBcclxuICAgIGNvbnN0IGFwcGx5VHJhbnNwYXJlbmN5V2l0aEJsb2NrID0gIWJhY2tib25lUmVxdWlyZWQgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBoYXNGaWx0ZXJzIHx8IGhhc0NsaXAgKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoICggIWhhc05vblNWR0ZpbHRlciAmJiB0aGlzLm5vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1N1YnRyZWVSZW5kZXJlZEV4Y2x1c2l2ZWx5U1ZHKCB0aGlzLnByZWZlcnJlZFJlbmRlcmVycyApICkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoICFoYXNOb25DYW52YXNGaWx0ZXIgJiYgdGhpcy5ub2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTdWJ0cmVlUmVuZGVyZWRFeGNsdXNpdmVseUNhbnZhcyggdGhpcy5wcmVmZXJyZWRSZW5kZXJlcnMgKSApICk7XHJcbiAgICBjb25zdCB1c2VCYWNrYm9uZSA9IGFwcGx5VHJhbnNwYXJlbmN5V2l0aEJsb2NrID8gZmFsc2UgOiAoIGJhY2tib25lUmVxdWlyZWQgfHwgaGFzRmlsdGVycyB8fCBoYXNDbGlwICk7XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgd2UgbmVlZCBhIGJhY2tib25lIG9yIGNhY2hlXHJcbiAgICAvLyBpZiB3ZSBhcmUgdW5kZXIgYSBjYW52YXMgY2FjaGUsIHdlIHdpbGwgTkVWRVIgaGF2ZSBhIGJhY2tib25lXHJcbiAgICAvLyBzcGxpdHMgYXJlIGFjY29tcGxpc2hlZCBqdXN0IGJ5IGhhdmluZyBhIGJhY2tib25lXHJcbiAgICAvLyBOT1RFOiBJZiBjaGFuZ2luZywgY2hlY2sgUmVuZGVyZXJTdW1tYXJ5LnN1bW1hcnlCaXRtYXNrRm9yTm9kZVNlbGZcclxuICAgIC8vT0hUV08gVE9ETzogVXBkYXRlIHRoaXMgdG8gcHJvcGVybHkgaWRlbnRpZnkgd2hlbiBiYWNrYm9uZXMgYXJlIG5lY2Vzc2FyeS9hbmQtb3Igd2hlbiB3ZSBmb3J3YXJkIG9wYWNpdHkvY2xpcHBpbmdcclxuICAgIGlmICggdXNlQmFja2JvbmUgKSB7XHJcbiAgICAgIHRoaXMuaXNCYWNrYm9uZSA9IHRydWU7XHJcbiAgICAgIHRoaXMuaXNWaXNpYmlsaXR5QXBwbGllZCA9IHRydWU7XHJcbiAgICAgIHRoaXMuaXNUcmFuc2Zvcm1lZCA9IHRoaXMuaXNEaXNwbGF5Um9vdCB8fCAhIWhpbnRzLmNzc1RyYW5zZm9ybTsgLy8gZm9yIG5vdywgb25seSB0cmlnZ2VyIENTUyB0cmFuc2Zvcm0gaWYgd2UgaGF2ZSB0aGUgc3BlY2lmaWMgaGludFxyXG4gICAgICAvL09IVFdPIFRPRE86IGNoZWNrIHdoZXRoZXIgdGhlIGZvcmNlIGFjY2VsZXJhdGlvbiBoaW50IGlzIGJlaW5nIHVzZWQgYnkgb3VyIERPTUJsb2NrXHJcbiAgICAgIHRoaXMuZ3JvdXBSZW5kZXJlciA9IFJlbmRlcmVyLmJpdG1hc2tET007IC8vIHByb2JhYmx5IHdvbid0IGJlIHVzZWRcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCAhYXBwbHlUcmFuc3BhcmVuY3lXaXRoQmxvY2sgJiYgKCBoYXNGaWx0ZXJzIHx8IGhhc0NsaXAgfHwgaGludHMuY2FudmFzQ2FjaGUgKSApIHtcclxuICAgICAgLy8gZXZlcnl0aGluZyB1bmRlcm5lYXRoIG5lZWRzIHRvIGJlIHJlbmRlcmFibGUgd2l0aCBDYW52YXMsIG90aGVyd2lzZSB3ZSBjYW5ub3QgY2FjaGVcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5ub2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTaW5nbGVDYW52YXNTdXBwb3J0ZWQoKSxcclxuICAgICAgICBgaGludHMuY2FudmFzQ2FjaGUgcHJvdmlkZWQsIGJ1dCBub3QgYWxsIG5vZGUgY29udGVudHMgY2FuIGJlIHJlbmRlcmVkIHdpdGggQ2FudmFzIHVuZGVyICR7XHJcbiAgICAgICAgICB0aGlzLm5vZGUuY29uc3RydWN0b3IubmFtZX1gICk7XHJcblxyXG4gICAgICBpZiAoIGhpbnRzLnNpbmdsZUNhY2hlICkge1xyXG4gICAgICAgIC8vIFRPRE86IHNjYWxlIG9wdGlvbnMgLSBmaXhlZCBzaXplLCBtYXRjaCBoaWdoZXN0IHJlc29sdXRpb24gKGFkYXB0aXZlKSwgb3IgbWlwbWFwcGVkXHJcbiAgICAgICAgaWYgKCB0aGlzLmlzU2hhcmVkQ2FudmFzQ2FjaGVSb290ICkge1xyXG4gICAgICAgICAgdGhpcy5pc1NoYXJlZENhbnZhc0NhY2hlU2VsZiA9IHRydWU7XHJcblxyXG4gICAgICAgICAgdGhpcy5zaGFyZWRDYWNoZVJlbmRlcmVyID0gdGhpcy5pc1dlYkdMU3VwcG9ydGVkID8gUmVuZGVyZXIuYml0bWFza1dlYkdMIDogUmVuZGVyZXIuYml0bWFza0NhbnZhcztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAvLyBldmVyeXRoaW5nIHVuZGVybmVhdGggbmVlZHMgdG8gZ3VhcmFudGVlIHRoYXQgaXRzIGJvdW5kcyBhcmUgdmFsaWRcclxuICAgICAgICAgIC8vT0hUV08gVE9ETzogV2UnbGwgcHJvYmFibHkgcmVtb3ZlIHRoaXMgaWYgd2UgZ28gd2l0aCB0aGUgXCJzYWZlIGJvdW5kc1wiIGFwcHJvYWNoXHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm5vZGUuX3JlbmRlcmVyU3VtbWFyeS5hcmVCb3VuZHNWYWxpZCgpLFxyXG4gICAgICAgICAgICBgaGludHMuc2luZ2xlQ2FjaGUgcHJvdmlkZWQsIGJ1dCBub3QgYWxsIG5vZGUgY29udGVudHMgaGF2ZSB2YWxpZCBib3VuZHMgdW5kZXIgJHtcclxuICAgICAgICAgICAgICB0aGlzLm5vZGUuY29uc3RydWN0b3IubmFtZX1gICk7XHJcblxyXG4gICAgICAgICAgdGhpcy5pc1NoYXJlZENhbnZhc0NhY2hlUGxhY2Vob2xkZXIgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmlzSW5zdGFuY2VDYW52YXNDYWNoZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5pc1VuZGVyQ2FudmFzQ2FjaGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBSZW5kZXJlciA9IHRoaXMuaXNXZWJHTFN1cHBvcnRlZCA/IFJlbmRlcmVyLmJpdG1hc2tXZWJHTCA6IFJlbmRlcmVyLmJpdG1hc2tDYW52YXM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMubm9kZS5pc1BhaW50ZWQoKSApIHtcclxuICAgICAgaWYgKCB0aGlzLmlzVW5kZXJDYW52YXNDYWNoZSApIHtcclxuICAgICAgICB0aGlzLnNlbGZSZW5kZXJlciA9IFJlbmRlcmVyLmJpdG1hc2tDYW52YXM7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgbGV0IHN1cHBvcnRlZE5vZGVCaXRtYXNrID0gdGhpcy5ub2RlLl9yZW5kZXJlckJpdG1hc2s7XHJcbiAgICAgICAgaWYgKCAhdGhpcy5pc1dlYkdMU3VwcG9ydGVkICkge1xyXG4gICAgICAgICAgY29uc3QgaW52YWxpZEJpdG1hc2tzID0gUmVuZGVyZXIuYml0bWFza1dlYkdMO1xyXG4gICAgICAgICAgc3VwcG9ydGVkTm9kZUJpdG1hc2sgPSBzdXBwb3J0ZWROb2RlQml0bWFzayBeICggc3VwcG9ydGVkTm9kZUJpdG1hc2sgJiBpbnZhbGlkQml0bWFza3MgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHVzZSB0aGUgcHJlZmVycmVkIHJlbmRlcmluZyBvcmRlciBpZiBzcGVjaWZpZWQsIG90aGVyd2lzZSB1c2UgdGhlIGRlZmF1bHRcclxuICAgICAgICB0aGlzLnNlbGZSZW5kZXJlciA9ICggc3VwcG9ydGVkTm9kZUJpdG1hc2sgJiBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIHRoaXMucHJlZmVycmVkUmVuZGVyZXJzLCAwICkgKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBzdXBwb3J0ZWROb2RlQml0bWFzayAmIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggdGhpcy5wcmVmZXJyZWRSZW5kZXJlcnMsIDEgKSApIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIHN1cHBvcnRlZE5vZGVCaXRtYXNrICYgUmVuZGVyZXIuYml0bWFza09yZGVyKCB0aGlzLnByZWZlcnJlZFJlbmRlcmVycywgMiApICkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICggc3VwcG9ydGVkTm9kZUJpdG1hc2sgJiBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIHRoaXMucHJlZmVycmVkUmVuZGVyZXJzLCAzICkgKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBzdXBwb3J0ZWROb2RlQml0bWFzayAmIFJlbmRlcmVyLmJpdG1hc2tTVkcgKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBzdXBwb3J0ZWROb2RlQml0bWFzayAmIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBzdXBwb3J0ZWROb2RlQml0bWFzayAmIFJlbmRlcmVyLmJpdG1hc2tET00gKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBzdXBwb3J0ZWROb2RlQml0bWFzayAmIFJlbmRlcmVyLmJpdG1hc2tXZWJHTCApIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAwO1xyXG5cclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnNlbGZSZW5kZXJlciwgJ3NldFNlbGZSZW5kZXJlciBmYWlsdXJlPycgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHdoZXRoZXIgd2UgbmVlZCB0byBmb3JjZSByZWJ1aWxkaW5nIHRoZSBncm91cCBkcmF3YWJsZVxyXG4gICAgdGhpcy5ncm91cENoYW5nZWQgPSAoIHdhc0JhY2tib25lICE9PSB0aGlzLmlzQmFja2JvbmUgKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoIHdhc0luc3RhbmNlQ2FudmFzQ2FjaGUgIT09IHRoaXMuaXNJbnN0YW5jZUNhbnZhc0NhY2hlICkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKCB3YXNTaGFyZWRDYW52YXNDYWNoZVNlbGYgIT09IHRoaXMuaXNTaGFyZWRDYW52YXNDYWNoZVNlbGYgKTtcclxuXHJcbiAgICAvLyB3aGV0aGVyIGFueSBvZiBvdXIgcmVuZGVyIHN0YXRlIGNoYW5nZXMgY2FuIGNoYW5nZSBkZXNjZW5kYW50IHJlbmRlciBzdGF0ZXNcclxuICAgIHRoaXMuY2FzY2FkaW5nU3RhdGVDaGFuZ2UgPSAoIHdhc1VuZGVyQ2FudmFzQ2FjaGUgIT09IHRoaXMuaXNVbmRlckNhbnZhc0NhY2hlICkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIG9sZFByZWZlcnJlZFJlbmRlcmVycyAhPT0gdGhpcy5wcmVmZXJyZWRSZW5kZXJlcnMgKTtcclxuXHJcbiAgICAvKlxyXG4gICAgICogV2hldGhlciB3ZSBjYW4ganVzdCB1cGRhdGUgdGhlIHN0YXRlIG9uIGFuIEluc3RhbmNlIHdoZW4gY2hhbmdpbmcgZnJvbSB0aGlzIHN0YXRlID0+IG90aGVyU3RhdGUuXHJcbiAgICAgKiBUaGlzIGlzIGdlbmVyYWxseSBub3QgcG9zc2libGUgaWYgdGhlcmUgaXMgYSBjaGFuZ2UgaW4gd2hldGhlciB0aGUgaW5zdGFuY2Ugc2hvdWxkIGJlIGEgdHJhbnNmb3JtIHJvb3RcclxuICAgICAqIChlLmcuIGJhY2tib25lL3NpbmdsZS1jYWNoZSksIHNvIHdlIHdpbGwgaGF2ZSB0byByZWNyZWF0ZSB0aGUgaW5zdGFuY2UgYW5kIGl0cyBzdWJ0cmVlIGlmIHRoYXQgaXMgdGhlIGNhc2UuXHJcbiAgICAgKlxyXG4gICAgICogT25seSByZWxldmFudCBpZiB3ZSB3ZXJlIHByZXZpb3VzbHkgc3RhdGVmdWwsIHNvIGl0IGNhbiBiZSBpZ25vcmVkIGlmIHRoaXMgaXMgb3VyIGZpcnN0IHVwZGF0ZVJlbmRlcmluZ1N0YXRlKClcclxuICAgICAqL1xyXG4gICAgdGhpcy5pbmNvbXBhdGlibGVTdGF0ZUNoYW5nZSA9ICggdGhpcy5pc1RyYW5zZm9ybWVkICE9PSB3YXNUcmFuc2Zvcm1lZCApIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCB0aGlzLmlzU2hhcmVkQ2FudmFzQ2FjaGVQbGFjZWhvbGRlciAhPT0gd2FzU2hhcmVkQ2FudmFzQ2FjaGVQbGFjZWhvbGRlciApO1xyXG5cclxuICAgIC8vIHdoZXRoZXIgdGhlcmUgd2FzIGFueSByZW5kZXIgc3RhdGUgY2hhbmdlXHJcbiAgICB0aGlzLmFueVN0YXRlQ2hhbmdlID0gdGhpcy5ncm91cENoYW5nZWQgfHwgdGhpcy5jYXNjYWRpbmdTdGF0ZUNoYW5nZSB8fCB0aGlzLmluY29tcGF0aWJsZVN0YXRlQ2hhbmdlIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKCBvbGRTZWxmUmVuZGVyZXIgIT09IHRoaXMuc2VsZlJlbmRlcmVyICkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAoIG9sZEdyb3VwUmVuZGVyZXIgIT09IHRoaXMuZ3JvdXBSZW5kZXJlciApIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKCBvbGRTaGFyZWRDYWNoZVJlbmRlcmVyICE9PSB0aGlzLnNoYXJlZENhY2hlUmVuZGVyZXIgKTtcclxuXHJcbiAgICAvLyBpZiBvdXIgdmlzaWJpbGl0eSBhcHBsaWNhdGlvbnMgY2hhbmdlZCwgdXBkYXRlIHRoZSBlbnRpcmUgc3VidHJlZVxyXG4gICAgaWYgKCB3YXNWaXNpYmlsaXR5QXBwbGllZCAhPT0gdGhpcy5pc1Zpc2liaWxpdHlBcHBsaWVkICkge1xyXG4gICAgICB0aGlzLnZpc2liaWxpdHlEaXJ0eSA9IHRydWU7XHJcbiAgICAgIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50Lm1hcmtDaGlsZFZpc2liaWxpdHlEaXJ0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIG91ciBmaXR0YWJpbGl0eSBoYXMgY2hhbmdlZCwgcHJvcGFnYXRlIHRob3NlIGNoYW5nZXMuIChJdCdzIGdlbmVyYWxseSBhIGhpbnQgY2hhbmdlIHdoaWNoIHdpbGwgdHJpZ2dlciBhblxyXG4gICAgLy8gdXBkYXRlIG9mIHJlbmRlcmluZyBzdGF0ZSkuXHJcbiAgICB0aGlzLmZpdHRhYmlsaXR5LmNoZWNrU2VsZkZpdHRhYmlsaXR5KCk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UoIGBuZXc6ICR7dGhpcy5nZXRTdGF0ZVN0cmluZygpfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBzaG9ydCBzdHJpbmcgdGhhdCBjb250YWlucyBhIHN1bW1hcnkgb2YgdGhlIHJlbmRlcmluZyBzdGF0ZSwgZm9yIGRlYnVnZ2luZy9sb2dnaW5nIHB1cnBvc2VzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0U3RhdGVTdHJpbmcoKSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBgU1sgJHtcclxuICAgICAgdGhpcy5pc0Rpc3BsYXlSb290ID8gJ2Rpc3BsYXlSb290ICcgOiAnJ1xyXG4gICAgfSR7dGhpcy5pc0JhY2tib25lID8gJ2JhY2tib25lICcgOiAnJ1xyXG4gICAgfSR7dGhpcy5pc0luc3RhbmNlQ2FudmFzQ2FjaGUgPyAnaW5zdGFuY2VDYWNoZSAnIDogJydcclxuICAgIH0ke3RoaXMuaXNTaGFyZWRDYW52YXNDYWNoZVBsYWNlaG9sZGVyID8gJ3NoYXJlZENhY2hlUGxhY2Vob2xkZXIgJyA6ICcnXHJcbiAgICB9JHt0aGlzLmlzU2hhcmVkQ2FudmFzQ2FjaGVTZWxmID8gJ3NoYXJlZENhY2hlU2VsZiAnIDogJydcclxuICAgIH0ke3RoaXMuaXNUcmFuc2Zvcm1lZCA/ICdUUiAnIDogJydcclxuICAgIH0ke3RoaXMuaXNWaXNpYmlsaXR5QXBwbGllZCA/ICdWSVMgJyA6ICcnXHJcbiAgICB9JHt0aGlzLnNlbGZSZW5kZXJlciA/IHRoaXMuc2VsZlJlbmRlcmVyLnRvU3RyaW5nKCAxNiApIDogJy0nfSwke1xyXG4gICAgICB0aGlzLmdyb3VwUmVuZGVyZXIgPyB0aGlzLmdyb3VwUmVuZGVyZXIudG9TdHJpbmcoIDE2ICkgOiAnLSd9LCR7XHJcbiAgICAgIHRoaXMuc2hhcmVkQ2FjaGVSZW5kZXJlciA/IHRoaXMuc2hhcmVkQ2FjaGVSZW5kZXJlci50b1N0cmluZyggMTYgKSA6ICctJ30gYDtcclxuICAgIHJldHVybiBgJHtyZXN1bHR9XWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgbWFpbiBlbnRyeSBwb2ludCBmb3Igc3luY1RyZWUoKSwgY2FsbGVkIG9uIHRoZSByb290IGluc3RhbmNlLiBTZWUgc3luY1RyZWUoKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYmFzZVN5bmNUcmVlKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0Rpc3BsYXlSb290LCAnYmFzZVN5bmNUcmVlKCkgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIG9uIHRoZSByb290IGluc3RhbmNlJyApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlKCBgLS0tLS0tLS0gU1RBUlQgYmFzZVN5bmNUcmVlICR7dGhpcy50b1N0cmluZygpfSAtLS0tLS0tLWAgKTtcclxuICAgIHRoaXMuc3luY1RyZWUoKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlKCBgLS0tLS0tLS0gRU5EIGJhc2VTeW5jVHJlZSAke3RoaXMudG9TdHJpbmcoKX0gLS0tLS0tLS1gICk7XHJcbiAgICB0aGlzLmNsZWFuU3luY1RyZWVSZXN1bHRzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSByZW5kZXJpbmcgc3RhdGUsIHN5bmNocm9uaXplcyB0aGUgaW5zdGFuY2Ugc3ViLXRyZWUgKHNvIHRoYXQgb3VyIGluc3RhbmNlIHRyZWUgbWF0Y2hlc1xyXG4gICAqIHRoZSBOb2RlIHRyZWUgdGhlIGNsaWVudCBwcm92aWRlZCksIGFuZCBiYWNrLXByb3BhZ2F0ZXMge0NoYW5nZUludGVydmFsfSBpbmZvcm1hdGlvbiBmb3Igc3RpdGNoaW5nIGJhY2tib25lc1xyXG4gICAqIGFuZC9vciBjYWNoZXMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIHN5bmNUcmVlKCkgYWxzbyBzZXRzIGEgbnVtYmVyIG9mIHBzZXVkbyAncmV0dXJuIHZhbHVlcycgKGRvY3VtZW50ZWQgaW4gY2xlYW5TeW5jVHJlZVJlc3VsdHMoKSkuIEFmdGVyIGNhbGxpbmdcclxuICAgKiBzeW5jVHJlZSgpIGFuZCBvcHRpb25hbGx5IHJlYWRpbmcgdGhvc2UgcmVzdWx0cywgY2xlYW5TeW5jVHJlZVJlc3VsdHMoKSBzaG91bGQgYmUgY2FsbGVkIG9uIHRoZSBzYW1lIGluc3RhbmNlXHJcbiAgICogaW4gb3JkZXIgdG8gcHJldmVudCBtZW1vcnkgbGVha3MuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoZSBzeW5jIHdhcyBwb3NzaWJsZS4gSWYgaXQgd2Fzbid0LCBhIG5ldyBpbnN0YW5jZSBzdWJ0cmVlIHdpbGwgbmVlZCB0byBiZSBjcmVhdGVkLlxyXG4gICAqL1xyXG4gIHN5bmNUcmVlKCkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UoIGBzeW5jVHJlZSAke3RoaXMudG9TdHJpbmcoKX0gJHt0aGlzLmdldFN0YXRlU3RyaW5nKClcclxuICAgIH0ke3RoaXMuc3RhdGVsZXNzID8gJyAoc3RhdGVsZXNzKScgOiAnJ31gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgaWYgKCBzY2VuZXJ5TG9nICYmIHNjZW5lcnkuaXNMb2dnaW5nUGVyZm9ybWFuY2UoKSApIHtcclxuICAgICAgdGhpcy5kaXNwbGF5LnBlcmZTeW5jVHJlZUNvdW50Kys7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbWF5IGFjY2VzcyBpc1RyYW5zZm9ybWVkIHVwIHRvIHJvb3QgdG8gZGV0ZXJtaW5lIHJlbGF0aXZlIHRyYWlsc1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMucGFyZW50IHx8ICF0aGlzLnBhcmVudC5zdGF0ZWxlc3MsICdXZSBzaG91bGQgbm90IGhhdmUgYSBzdGF0ZWxlc3MgcGFyZW50IGluc3RhbmNlJyApO1xyXG5cclxuICAgIGNvbnN0IHdhc1N0YXRlbGVzcyA9IHRoaXMuc3RhdGVsZXNzO1xyXG4gICAgaWYgKCB3YXNTdGF0ZWxlc3MgfHxcclxuICAgICAgICAgKCB0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5jYXNjYWRpbmdTdGF0ZUNoYW5nZSApIHx8IC8vIGlmIG91ciBwYXJlbnQgaGFkIGNhc2NhZGluZyBzdGF0ZSBjaGFuZ2VzLCB3ZSBuZWVkIHRvIHJlY29tcHV0ZVxyXG4gICAgICAgICAoIHRoaXMucmVuZGVyU3RhdGVEaXJ0eUZyYW1lID09PSB0aGlzLmRpc3BsYXkuX2ZyYW1lSWQgKSApIHsgLy8gaWYgb3VyIHJlbmRlciBzdGF0ZSBpcyBkaXJ0eVxyXG4gICAgICB0aGlzLnVwZGF0ZVJlbmRlcmluZ1N0YXRlKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gd2UgY2FuIGNoZWNrIHdoZXRoZXIgdXBkYXRpbmcgc3RhdGUgd291bGQgaGF2ZSBtYWRlIGFueSBjaGFuZ2VzIHdoZW4gd2Ugc2tpcCBpdCAoZm9yIHNsb3cgYXNzZXJ0aW9ucylcclxuICAgICAgaWYgKCBhc3NlcnRTbG93ICkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlUmVuZGVyaW5nU3RhdGUoKTtcclxuICAgICAgICBhc3NlcnRTbG93KCAhdGhpcy5hbnlTdGF0ZUNoYW5nZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCAhd2FzU3RhdGVsZXNzICYmIHRoaXMuaW5jb21wYXRpYmxlU3RhdGVDaGFuZ2UgKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlKCBgaW5jb21wYXRpYmxlIGluc3RhbmNlICR7dGhpcy50b1N0cmluZygpfSAke3RoaXMuZ2V0U3RhdGVTdHJpbmcoKX0sIGFib3J0aW5nYCApO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuXHJcbiAgICAgIC8vIFRoZSBmYWxzZSByZXR1cm4gd2lsbCBzaWduYWwgdGhhdCBhIG5ldyBpbnN0YW5jZSBuZWVkcyB0byBiZSB1c2VkLiBvdXIgdHJlZSB3aWxsIGJlIGRpc3Bvc2VkIHNvb24uXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMuc3RhdGVsZXNzID0gZmFsc2U7XHJcblxyXG4gICAgLy8gbm8gbmVlZCB0byBvdmVyd3JpdGUsIHNob3VsZCBhbHdheXMgYmUgdGhlIHNhbWVcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF3YXNTdGF0ZWxlc3MgfHwgdGhpcy5jaGlsZHJlbi5sZW5ndGggPT09IDAsXHJcbiAgICAgICdXZSBzaG91bGQgbm90IGhhdmUgY2hpbGQgaW5zdGFuY2VzIG9uIGFuIGluc3RhbmNlIHdpdGhvdXQgc3RhdGUnICk7XHJcblxyXG4gICAgaWYgKCB3YXNTdGF0ZWxlc3MgKSB7XHJcbiAgICAgIC8vIElmIHdlIGFyZSBhIHRyYW5zZm9ybSByb290LCBub3RpZnkgdGhlIGRpc3BsYXkgdGhhdCB3ZSBhcmUgZGlydHkuIFdlJ2xsIGJlIHZhbGlkYXRlZCB3aGVuIGl0J3MgYXQgdGhhdCBwaGFzZVxyXG4gICAgICAvLyBhdCB0aGUgbmV4dCB1cGRhdGVEaXNwbGF5KCkuXHJcbiAgICAgIGlmICggdGhpcy5pc1RyYW5zZm9ybWVkICkge1xyXG4gICAgICAgIHRoaXMuZGlzcGxheS5tYXJrVHJhbnNmb3JtUm9vdERpcnR5KCB0aGlzLCB0cnVlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuYXR0YWNoTm9kZUxpc3RlbmVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE86IHBydW5pbmcgb2Ygc2hhcmVkIGNhY2hlc1xyXG4gICAgaWYgKCB0aGlzLmlzU2hhcmVkQ2FudmFzQ2FjaGVQbGFjZWhvbGRlciApIHtcclxuICAgICAgdGhpcy5zaGFyZWRTeW5jVHJlZSgpO1xyXG4gICAgfVxyXG4gICAgLy8gcHJ1bmluZyBzbyB0aGF0IGlmIG5vIGNoYW5nZXMgd291bGQgYWZmZWN0IGEgc3VidHJlZSBpdCBpcyBza2lwcGVkXHJcbiAgICBlbHNlIGlmICggd2FzU3RhdGVsZXNzIHx8IHRoaXMuc2tpcFBydW5pbmdGcmFtZSA9PT0gdGhpcy5kaXNwbGF5Ll9mcmFtZUlkIHx8IHRoaXMuYW55U3RhdGVDaGFuZ2UgKSB7XHJcblxyXG4gICAgICAvLyBtYXJrIGZ1bGx5LXJlbW92ZWQgaW5zdGFuY2VzIGZvciBkaXNwb3NhbCwgYW5kIGluaXRpYWxpemUgY2hpbGQgaW5zdGFuY2VzIGlmIHdlIHdlcmUgc3RhdGVsZXNzXHJcbiAgICAgIHRoaXMucHJlcGFyZUNoaWxkSW5zdGFuY2VzKCB3YXNTdGF0ZWxlc3MgKTtcclxuXHJcbiAgICAgIGNvbnN0IG9sZEZpcnN0RHJhd2FibGUgPSB0aGlzLmZpcnN0RHJhd2FibGU7XHJcbiAgICAgIGNvbnN0IG9sZExhc3REcmF3YWJsZSA9IHRoaXMubGFzdERyYXdhYmxlO1xyXG4gICAgICBjb25zdCBvbGRGaXJzdElubmVyRHJhd2FibGUgPSB0aGlzLmZpcnN0SW5uZXJEcmF3YWJsZTtcclxuICAgICAgY29uc3Qgb2xkTGFzdElubmVyRHJhd2FibGUgPSB0aGlzLmxhc3RJbm5lckRyYXdhYmxlO1xyXG5cclxuICAgICAgY29uc3Qgc2VsZkNoYW5nZWQgPSB0aGlzLnVwZGF0ZVNlbGZEcmF3YWJsZSgpO1xyXG5cclxuICAgICAgLy8gU3luY2hyb25pemVzIG91ciBjaGlsZHJlbiBhbmQgc2VsZiwgd2l0aCB0aGUgZHJhd2FibGVzIGFuZCBjaGFuZ2UgaW50ZXJ2YWxzIG9mIGJvdGggY29tYmluZWRcclxuICAgICAgdGhpcy5sb2NhbFN5bmNUcmVlKCBzZWxmQ2hhbmdlZCApO1xyXG5cclxuICAgICAgaWYgKCBhc3NlcnRTbG93ICkge1xyXG4gICAgICAgIC8vIGJlZm9yZSBhbmQgYWZ0ZXIgZmlyc3QvbGFzdCBkcmF3YWJsZXMgKGluc2lkZSBhbnkgcG90ZW50aWFsIGdyb3VwIGRyYXdhYmxlKVxyXG4gICAgICAgIHRoaXMuYXVkaXRDaGFuZ2VJbnRlcnZhbHMoIG9sZEZpcnN0SW5uZXJEcmF3YWJsZSwgb2xkTGFzdElubmVyRHJhd2FibGUsIHRoaXMuZmlyc3RJbm5lckRyYXdhYmxlLCB0aGlzLmxhc3RJbm5lckRyYXdhYmxlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIHdlIHVzZSBhIGdyb3VwIGRyYXdhYmxlIChiYWNrYm9uZSwgZXRjLiksIHdlJ2xsIGNvbGxhcHNlIG91ciBkcmF3YWJsZXMgYW5kIGNoYW5nZSBpbnRlcnZhbHMgdG8gcmVmZXJlbmNlXHJcbiAgICAgIC8vIHRoZSBncm91cCBkcmF3YWJsZSAoYXMgYXBwbGljYWJsZSkuXHJcbiAgICAgIHRoaXMuZ3JvdXBTeW5jVHJlZSggd2FzU3RhdGVsZXNzICk7XHJcblxyXG4gICAgICBpZiAoIGFzc2VydFNsb3cgKSB7XHJcbiAgICAgICAgLy8gYmVmb3JlIGFuZCBhZnRlciBmaXJzdC9sYXN0IGRyYXdhYmxlcyAob3V0c2lkZSBvZiBhbnkgcG90ZW50aWFsIGdyb3VwIGRyYXdhYmxlKVxyXG4gICAgICAgIHRoaXMuYXVkaXRDaGFuZ2VJbnRlcnZhbHMoIG9sZEZpcnN0RHJhd2FibGUsIG9sZExhc3REcmF3YWJsZSwgdGhpcy5maXJzdERyYXdhYmxlLCB0aGlzLmxhc3REcmF3YWJsZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gb3VyIHN1Yi10cmVlIHdhcyBub3QgdmlzaXRlZCwgc2luY2UgdGhlcmUgd2VyZSBubyByZWxldmFudCBjaGFuZ2VzIHRvIGl0ICh0aGF0IG5lZWQgaW5zdGFuY2Ugc3luY2hyb25pemF0aW9uXHJcbiAgICAgIC8vIG9yIGRyYXdhYmxlIGNoYW5nZXMpXHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlKCAncHJ1bmVkJyApO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzcG9uc2libGUgZm9yIHN5bmNpbmcgY2hpbGRyZW4sIGNvbm5lY3RpbmcgdGhlIGRyYXdhYmxlIGxpbmtlZCBsaXN0IGFzIG5lZWRlZCwgYW5kIG91dHB1dHRpbmcgY2hhbmdlIGludGVydmFsc1xyXG4gICAqIGFuZCBmaXJzdC9sYXN0IGRyYXdhYmxlIGluZm9ybWF0aW9uLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNlbGZDaGFuZ2VkXHJcbiAgICovXHJcbiAgbG9jYWxTeW5jVHJlZSggc2VsZkNoYW5nZWQgKSB7XHJcbiAgICBjb25zdCBmcmFtZUlkID0gdGhpcy5kaXNwbGF5Ll9mcmFtZUlkO1xyXG5cclxuICAgIC8vIGxvY2FsIHZhcmlhYmxlcywgc2luY2Ugd2UgY2FuJ3Qgb3ZlcndyaXRlIG91ciBpbnN0YW5jZSBwcm9wZXJ0aWVzIHlldFxyXG4gICAgbGV0IGZpcnN0RHJhd2FibGUgPSB0aGlzLnNlbGZEcmF3YWJsZTsgLy8gcG9zc2libHkgbnVsbFxyXG4gICAgbGV0IGN1cnJlbnREcmF3YWJsZSA9IGZpcnN0RHJhd2FibGU7IC8vIHBvc3NpYmx5IG51bGxcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmZpcnN0Q2hhbmdlSW50ZXJ2YWwgPT09IG51bGwgJiYgdGhpcy5sYXN0Q2hhbmdlSW50ZXJ2YWwgPT09IG51bGwsXHJcbiAgICAgICdzYW5pdHkgY2hlY2tzIHRoYXQgY2xlYW5TeW5jVHJlZVJlc3VsdHMgd2VyZSBjYWxsZWQnICk7XHJcblxyXG4gICAgbGV0IGZpcnN0Q2hhbmdlSW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgaWYgKCBzZWxmQ2hhbmdlZCApIHtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNoYW5nZUludGVydmFsICYmIHNjZW5lcnlMb2cuQ2hhbmdlSW50ZXJ2YWwoICdzZWxmJyApO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2hhbmdlSW50ZXJ2YWwgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcbiAgICAgIGZpcnN0Q2hhbmdlSW50ZXJ2YWwgPSBDaGFuZ2VJbnRlcnZhbC5uZXdGb3JEaXNwbGF5KCBudWxsLCBudWxsLCB0aGlzLmRpc3BsYXkgKTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNoYW5nZUludGVydmFsICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgICB9XHJcbiAgICBsZXQgY3VycmVudENoYW5nZUludGVydmFsID0gZmlyc3RDaGFuZ2VJbnRlcnZhbDtcclxuICAgIGxldCBsYXN0VW5jaGFuZ2VkRHJhd2FibGUgPSBzZWxmQ2hhbmdlZCA/IG51bGwgOiB0aGlzLnNlbGZEcmF3YWJsZTsgLy8gcG9zc2libHkgbnVsbFxyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGxldCBjaGlsZEluc3RhbmNlID0gdGhpcy5jaGlsZHJlblsgaSBdO1xyXG5cclxuICAgICAgY29uc3QgaXNDb21wYXRpYmxlID0gY2hpbGRJbnN0YW5jZS5zeW5jVHJlZSgpO1xyXG4gICAgICBpZiAoICFpc0NvbXBhdGlibGUgKSB7XHJcbiAgICAgICAgY2hpbGRJbnN0YW5jZSA9IHRoaXMudXBkYXRlSW5jb21wYXRpYmxlQ2hpbGRJbnN0YW5jZSggY2hpbGRJbnN0YW5jZSwgaSApO1xyXG4gICAgICAgIGNoaWxkSW5zdGFuY2Uuc3luY1RyZWUoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgaW5jbHVkZUNoaWxkRHJhd2FibGVzID0gY2hpbGRJbnN0YW5jZS5zaG91bGRJbmNsdWRlSW5QYXJlbnREcmF3YWJsZXMoKTtcclxuXHJcbiAgICAgIC8vT0hUV08gVE9ETzogb25seSBzdHJpcCBvdXQgaW52aXNpYmxlIENhbnZhcyBkcmF3YWJsZXMsIHdoaWxlIGxlYXZpbmcgU1ZHIChzaW5jZSB3ZSBjYW4gbW9yZSBlZmZpY2llbnRseSBoaWRlXHJcbiAgICAgIC8vIFNWRyB0cmVlcywgbWVtb3J5LXdpc2UpXHJcbiAgICAgIC8vIGhlcmUgd2Ugc3RyaXAgb3V0IGludmlzaWJsZSBkcmF3YWJsZSBzZWN0aW9ucyBvdXQgb2YgdGhlIGRyYXdhYmxlIGxpbmtlZCBsaXN0XHJcbiAgICAgIGlmICggaW5jbHVkZUNoaWxkRHJhd2FibGVzICkge1xyXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBhbnkgZHJhd2FibGVzIGZvciB0aGF0IGNoaWxkLCBsaW5rIHRoZW0gdXAgaW4gb3VyIGxpbmtlZCBsaXN0XHJcbiAgICAgICAgaWYgKCBjaGlsZEluc3RhbmNlLmZpcnN0RHJhd2FibGUgKSB7XHJcbiAgICAgICAgICBpZiAoIGN1cnJlbnREcmF3YWJsZSApIHtcclxuICAgICAgICAgICAgLy8gdGhlcmUgaXMgYWxyZWFkeSBhbiBlbmQgb2YgdGhlIGxpbmtlZCBsaXN0LCBzbyBqdXN0IGFwcGVuZCB0byBpdFxyXG4gICAgICAgICAgICBEcmF3YWJsZS5jb25uZWN0RHJhd2FibGVzKCBjdXJyZW50RHJhd2FibGUsIGNoaWxkSW5zdGFuY2UuZmlyc3REcmF3YWJsZSwgdGhpcy5kaXNwbGF5ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gc3RhcnQgb3V0IHRoZSBsaW5rZWQgbGlzdFxyXG4gICAgICAgICAgICBmaXJzdERyYXdhYmxlID0gY2hpbGRJbnN0YW5jZS5maXJzdERyYXdhYmxlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gdXBkYXRlIHRoZSBsYXN0IGRyYXdhYmxlIG9mIHRoZSBsaW5rZWQgbGlzdFxyXG4gICAgICAgICAgY3VycmVudERyYXdhYmxlID0gY2hpbGRJbnN0YW5jZS5sYXN0RHJhd2FibGU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgICAgICogQ2hhbmdlIGludGVydmFsc1xyXG4gICAgICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNoYW5nZUludGVydmFsICYmIHNjZW5lcnlMb2cuQ2hhbmdlSW50ZXJ2YWwoIGBjaGFuZ2VzIGZvciAke2NoaWxkSW5zdGFuY2UudG9TdHJpbmcoKVxyXG4gICAgICB9IGluICR7dGhpcy50b1N0cmluZygpfWAgKTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNoYW5nZUludGVydmFsICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgY29uc3Qgd2FzSW5jbHVkZWQgPSBjaGlsZEluc3RhbmNlLnN0aXRjaENoYW5nZUluY2x1ZGVkO1xyXG4gICAgICBjb25zdCBpc0luY2x1ZGVkID0gaW5jbHVkZUNoaWxkRHJhd2FibGVzO1xyXG4gICAgICBjaGlsZEluc3RhbmNlLnN0aXRjaENoYW5nZUluY2x1ZGVkID0gaXNJbmNsdWRlZDtcclxuXHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DaGFuZ2VJbnRlcnZhbCAmJiBzY2VuZXJ5TG9nLkNoYW5nZUludGVydmFsKCBgaW5jbHVkZWQ6ICR7d2FzSW5jbHVkZWR9ID0+ICR7aXNJbmNsdWRlZH1gICk7XHJcblxyXG4gICAgICAvLyBjaGVjayBmb3IgZm9yY2luZyBmdWxsIGNoYW5nZS1pbnRlcnZhbCBvbiBjaGlsZFxyXG4gICAgICBpZiAoIGNoaWxkSW5zdGFuY2Uuc3RpdGNoQ2hhbmdlRnJhbWUgPT09IGZyYW1lSWQgKSB7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNoYW5nZUludGVydmFsICYmIHNjZW5lcnlMb2cuQ2hhbmdlSW50ZXJ2YWwoICdzdGl0Y2hDaGFuZ2VGcmFtZSBmdWxsIGNoYW5nZSBpbnRlcnZhbCcgKTtcclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2hhbmdlSW50ZXJ2YWwgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgICAgIC8vIGUuZy4gaXQgd2FzIGFkZGVkLCBtb3ZlZCwgb3IgaGFkIHZpc2liaWxpdHkgY2hhbmdlcy4gcmVxdWlyZXMgZnVsbCBjaGFuZ2UgaW50ZXJ2YWxcclxuICAgICAgICBjaGlsZEluc3RhbmNlLmZpcnN0Q2hhbmdlSW50ZXJ2YWwgPSBjaGlsZEluc3RhbmNlLmxhc3RDaGFuZ2VJbnRlcnZhbCA9IENoYW5nZUludGVydmFsLm5ld0ZvckRpc3BsYXkoIG51bGwsIG51bGwsIHRoaXMuZGlzcGxheSApO1xyXG5cclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2hhbmdlSW50ZXJ2YWwgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB3YXNJbmNsdWRlZCA9PT0gaXNJbmNsdWRlZCxcclxuICAgICAgICAgICdJZiB3ZSBkbyBub3QgaGF2ZSBzdGl0Y2hDaGFuZ2VGcmFtZSBhY3RpdmF0ZWQsIG91ciBpbmNsdXNpb24gc2hvdWxkIG5vdCBoYXZlIGNoYW5nZWQnICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGZpcnN0Q2hpbGRDaGFuZ2VJbnRlcnZhbCA9IGNoaWxkSW5zdGFuY2UuZmlyc3RDaGFuZ2VJbnRlcnZhbDtcclxuICAgICAgbGV0IGlzQmVmb3JlT3BlbiA9IGN1cnJlbnRDaGFuZ2VJbnRlcnZhbCAmJiBjdXJyZW50Q2hhbmdlSW50ZXJ2YWwuZHJhd2FibGVBZnRlciA9PT0gbnVsbDtcclxuICAgICAgY29uc3QgaXNBZnRlck9wZW4gPSBmaXJzdENoaWxkQ2hhbmdlSW50ZXJ2YWwgJiYgZmlyc3RDaGlsZENoYW5nZUludGVydmFsLmRyYXdhYmxlQmVmb3JlID09PSBudWxsO1xyXG4gICAgICBjb25zdCBuZWVkc0JyaWRnZSA9IGNoaWxkSW5zdGFuY2Uuc3RpdGNoQ2hhbmdlQmVmb3JlID09PSBmcmFtZUlkICYmICFpc0JlZm9yZU9wZW4gJiYgIWlzQWZ0ZXJPcGVuO1xyXG5cclxuICAgICAgLy8gV2UgbmVlZCB0byBpbnNlcnQgYW4gYWRkaXRpb25hbCBjaGFuZ2UgaW50ZXJ2YWwgKGJyaWRnZSkgd2hlbiB3ZSBub3RpY2UgYSBsaW5rIGluIHRoZSBkcmF3YWJsZSBsaW5rZWQgbGlzdFxyXG4gICAgICAvLyB3aGVyZSB0aGVyZSB3ZXJlIG5vZGVzIHRoYXQgbmVlZGVkIHN0aXRjaCBjaGFuZ2VzIHRoYXQgYXJlbid0IHN0aWxsIGNoaWxkcmVuLCBvciB3ZXJlIG1vdmVkLiBXZSBjcmVhdGUgYVxyXG4gICAgICAvLyBcImJyaWRnZVwiIGNoYW5nZSBpbnRlcnZhbCB0byBzcGFuIHRoZSBnYXAgd2hlcmUgbm9kZXMgd2VyZSByZW1vdmVkLlxyXG4gICAgICBpZiAoIG5lZWRzQnJpZGdlICkge1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DaGFuZ2VJbnRlcnZhbCAmJiBzY2VuZXJ5TG9nLkNoYW5nZUludGVydmFsKCAnYnJpZGdlJyApO1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DaGFuZ2VJbnRlcnZhbCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAgICAgY29uc3QgYnJpZGdlID0gQ2hhbmdlSW50ZXJ2YWwubmV3Rm9yRGlzcGxheSggbGFzdFVuY2hhbmdlZERyYXdhYmxlLCBudWxsLCB0aGlzLmRpc3BsYXkgKTtcclxuICAgICAgICBpZiAoIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbCApIHtcclxuICAgICAgICAgIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbC5uZXh0Q2hhbmdlSW50ZXJ2YWwgPSBicmlkZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbCA9IGJyaWRnZTtcclxuICAgICAgICBmaXJzdENoYW5nZUludGVydmFsID0gZmlyc3RDaGFuZ2VJbnRlcnZhbCB8fCBjdXJyZW50Q2hhbmdlSW50ZXJ2YWw7IC8vIHN0b3JlIGlmIGl0IGlzIHRoZSBmaXJzdFxyXG4gICAgICAgIGlzQmVmb3JlT3BlbiA9IHRydWU7XHJcblxyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DaGFuZ2VJbnRlcnZhbCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBFeGNsdWRlIGNoaWxkIGluc3RhbmNlcyB0aGF0IGFyZSBub3cgKGFuZCB3ZXJlIGJlZm9yZSkgbm90IGluY2x1ZGVkLiBOT1RFOiBXZSBzdGlsbCBuZWVkIHRvIGluY2x1ZGUgdGhvc2UgaW5cclxuICAgICAgLy8gYnJpZGdlIGNhbGN1bGF0aW9ucywgc2luY2UgYSByZW1vdmVkIChiZWZvcmUtaW5jbHVkZWQpIGluc3RhbmNlIGNvdWxkIGJlIGJldHdlZW4gdHdvIHN0aWxsLWludmlzaWJsZVxyXG4gICAgICAvLyBpbnN0YW5jZXMuXHJcbiAgICAgIGlmICggd2FzSW5jbHVkZWQgfHwgaXNJbmNsdWRlZCApIHtcclxuICAgICAgICBpZiAoIGlzQmVmb3JlT3BlbiApIHtcclxuICAgICAgICAgIC8vIHdlIHdhbnQgdG8gdHJ5IHRvIGdsdWUgb3VyIGxhc3QgQ2hhbmdlSW50ZXJ2YWwgdXBcclxuICAgICAgICAgIGlmICggZmlyc3RDaGlsZENoYW5nZUludGVydmFsICkge1xyXG4gICAgICAgICAgICBpZiAoIGZpcnN0Q2hpbGRDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUJlZm9yZSA9PT0gbnVsbCApIHtcclxuICAgICAgICAgICAgICAvLyB3ZSB3YW50IHRvIGdsdWUgZnJvbSBib3RoIHNpZGVzXHJcblxyXG4gICAgICAgICAgICAgIC8vIGJhc2ljYWxseSBoYXZlIG91ciBjdXJyZW50IGNoYW5nZSBpbnRlcnZhbCByZXBsYWNlIHRoZSBjaGlsZCdzIGZpcnN0IGNoYW5nZSBpbnRlcnZhbFxyXG4gICAgICAgICAgICAgIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUFmdGVyID0gZmlyc3RDaGlsZENoYW5nZUludGVydmFsLmRyYXdhYmxlQWZ0ZXI7XHJcbiAgICAgICAgICAgICAgY3VycmVudENoYW5nZUludGVydmFsLm5leHRDaGFuZ2VJbnRlcnZhbCA9IGZpcnN0Q2hpbGRDaGFuZ2VJbnRlcnZhbC5uZXh0Q2hhbmdlSW50ZXJ2YWw7XHJcblxyXG4gICAgICAgICAgICAgIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbCA9IGNoaWxkSW5zdGFuY2UubGFzdENoYW5nZUludGVydmFsID09PSBmaXJzdENoaWxkQ2hhbmdlSW50ZXJ2YWwgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbCA6IC8vIHNpbmNlIHdlIGFyZSByZXBsYWNpbmcsIGRvbid0IGdpdmUgYW4gb3JpZ2luIHJlZmVyZW5jZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSW5zdGFuY2UubGFzdENoYW5nZUludGVydmFsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgIC8vIG9ubHkgYSBkZXNpcmUgdG8gZ2x1ZSBmcm9tIGJlZm9yZVxyXG4gICAgICAgICAgICAgIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUFmdGVyID0gY2hpbGRJbnN0YW5jZS5maXJzdERyYXdhYmxlOyAvLyBlaXRoZXIgbnVsbCBvciB0aGUgY29ycmVjdCBkcmF3YWJsZVxyXG4gICAgICAgICAgICAgIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbC5uZXh0Q2hhbmdlSW50ZXJ2YWwgPSBmaXJzdENoaWxkQ2hhbmdlSW50ZXJ2YWw7XHJcbiAgICAgICAgICAgICAgY3VycmVudENoYW5nZUludGVydmFsID0gY2hpbGRJbnN0YW5jZS5sYXN0Q2hhbmdlSW50ZXJ2YWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBubyBjaGFuZ2VzIHRvIHRoZSBjaGlsZC4gZ3JhYnMgdGhlIGZpcnN0IGRyYXdhYmxlIHJlZmVyZW5jZSBpdCBjYW5cclxuICAgICAgICAgICAgY3VycmVudENoYW5nZUludGVydmFsLmRyYXdhYmxlQWZ0ZXIgPSBjaGlsZEluc3RhbmNlLmZpcnN0RHJhd2FibGU7IC8vIGVpdGhlciBudWxsIG9yIHRoZSBjb3JyZWN0IGRyYXdhYmxlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBmaXJzdENoaWxkQ2hhbmdlSW50ZXJ2YWwgKSB7XHJcbiAgICAgICAgICBmaXJzdENoYW5nZUludGVydmFsID0gZmlyc3RDaGFuZ2VJbnRlcnZhbCB8fCBmaXJzdENoaWxkQ2hhbmdlSW50ZXJ2YWw7IC8vIHN0b3JlIGlmIGl0IGlzIHRoZSBmaXJzdFxyXG4gICAgICAgICAgaWYgKCBmaXJzdENoaWxkQ2hhbmdlSW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgPT09IG51bGwgKSB7XHJcbiAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFjdXJyZW50Q2hhbmdlSW50ZXJ2YWwgfHwgbGFzdFVuY2hhbmdlZERyYXdhYmxlLFxyXG4gICAgICAgICAgICAgICdJZiB3ZSBoYXZlIGEgY3VycmVudCBjaGFuZ2UgaW50ZXJ2YWwsIHdlIHNob3VsZCBiZSBndWFyYW50ZWVkIGEgbm9uLW51bGwgJyArXHJcbiAgICAgICAgICAgICAgJ2xhc3RVbmNoYW5nZWREcmF3YWJsZScgKTtcclxuICAgICAgICAgICAgZmlyc3RDaGlsZENoYW5nZUludGVydmFsLmRyYXdhYmxlQmVmb3JlID0gbGFzdFVuY2hhbmdlZERyYXdhYmxlOyAvLyBlaXRoZXIgbnVsbCBvciB0aGUgY29ycmVjdCBkcmF3YWJsZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKCBjdXJyZW50Q2hhbmdlSW50ZXJ2YWwgKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbC5uZXh0Q2hhbmdlSW50ZXJ2YWwgPSBmaXJzdENoaWxkQ2hhbmdlSW50ZXJ2YWw7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjdXJyZW50Q2hhbmdlSW50ZXJ2YWwgPSBjaGlsZEluc3RhbmNlLmxhc3RDaGFuZ2VJbnRlcnZhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGFzdFVuY2hhbmdlZERyYXdhYmxlID0gKCBjdXJyZW50Q2hhbmdlSW50ZXJ2YWwgJiYgY3VycmVudENoYW5nZUludGVydmFsLmRyYXdhYmxlQWZ0ZXIgPT09IG51bGwgKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBjaGlsZEluc3RhbmNlLmxhc3REcmF3YWJsZSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZEluc3RhbmNlLmxhc3REcmF3YWJsZSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0VW5jaGFuZ2VkRHJhd2FibGUgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaWYgdGhlIGxhc3QgaW5zdGFuY2UsIGNoZWNrIGZvciBwb3N0LWJyaWRnZVxyXG4gICAgICBpZiAoIGkgPT09IHRoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMSApIHtcclxuICAgICAgICBpZiAoIGNoaWxkSW5zdGFuY2Uuc3RpdGNoQ2hhbmdlQWZ0ZXIgPT09IGZyYW1lSWQgJiYgISggY3VycmVudENoYW5nZUludGVydmFsICYmIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUFmdGVyID09PSBudWxsICkgKSB7XHJcbiAgICAgICAgICBjb25zdCBlbmRpbmdCcmlkZ2UgPSBDaGFuZ2VJbnRlcnZhbC5uZXdGb3JEaXNwbGF5KCBsYXN0VW5jaGFuZ2VkRHJhd2FibGUsIG51bGwsIHRoaXMuZGlzcGxheSApO1xyXG4gICAgICAgICAgaWYgKCBjdXJyZW50Q2hhbmdlSW50ZXJ2YWwgKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbC5uZXh0Q2hhbmdlSW50ZXJ2YWwgPSBlbmRpbmdCcmlkZ2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjdXJyZW50Q2hhbmdlSW50ZXJ2YWwgPSBlbmRpbmdCcmlkZ2U7XHJcbiAgICAgICAgICBmaXJzdENoYW5nZUludGVydmFsID0gZmlyc3RDaGFuZ2VJbnRlcnZhbCB8fCBjdXJyZW50Q2hhbmdlSW50ZXJ2YWw7IC8vIHN0b3JlIGlmIGl0IGlzIHRoZSBmaXJzdFxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gY2xlYW4gdXAgdGhlIG1ldGFkYXRhIG9uIG91ciBjaGlsZCAoY2FuJ3QgYmUgZG9uZSBpbiB0aGUgY2hpbGQgY2FsbCwgc2luY2Ugd2UgdXNlIHRoZXNlIHZhbHVlcyBsaWtlIGFcclxuICAgICAgLy8gY29tcG9zaXRlIHJldHVybiB2YWx1ZSlcclxuICAgICAgLy9PSFRXTyBUT0RPOiBvbmx5IGRvIHRoaXMgb24gaW5zdGFuY2VzIHRoYXQgd2VyZSBhY3R1YWxseSB0cmF2ZXJzZWRcclxuICAgICAgY2hpbGRJbnN0YW5jZS5jbGVhblN5bmNUcmVlUmVzdWx0cygpO1xyXG5cclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNoYW5nZUludGVydmFsICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaXQncyByZWFsbHkgdGhlIGVhc2llc3Qgd2F5IHRvIGNvbXBhcmUgaWYgdHdvIHRoaW5ncyAoY2FzdGVkIHRvIGJvb2xlYW5zKSBhcmUgdGhlIHNhbWU/XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhIWZpcnN0Q2hhbmdlSW50ZXJ2YWwgPT09ICEhY3VycmVudENoYW5nZUludGVydmFsLFxyXG4gICAgICAnUHJlc2VuY2Ugb2YgZmlyc3QgYW5kIGN1cnJlbnQgY2hhbmdlIGludGVydmFscyBzaG91bGQgYmUgZXF1YWwnICk7XHJcblxyXG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdlIGFyZSBlbXB0aWVkIGFuZCBtYXJrZWQgYXMgY2hhbmdlZCAoYnV0IHdpdGhvdXQgY2hhbmdlIGludGVydmFscykuIFRoaXMgc2hvdWxkIGltcGx5IHdlIGhhdmVcclxuICAgIC8vIG5vIGNoaWxkcmVuIChhbmQgdGh1cyBubyBzdGl0Y2hDaGFuZ2VCZWZvcmUgLyBzdGl0Y2hDaGFuZ2VBZnRlciB0byB1c2UpLCBzbyB3ZSdsbCB3YW50IHRvIGNyZWF0ZSBhIGNoYW5nZVxyXG4gICAgLy8gaW50ZXJ2YWwgdG8gY292ZXIgb3VyIGVudGlyZSByYW5nZS5cclxuICAgIGlmICggIWZpcnN0Q2hhbmdlSW50ZXJ2YWwgJiYgdGhpcy5zdGl0Y2hDaGFuZ2VPbkNoaWxkcmVuID09PSB0aGlzLmRpc3BsYXkuX2ZyYW1lSWQgJiYgdGhpcy5jaGlsZHJlbi5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgIGZpcnN0Q2hhbmdlSW50ZXJ2YWwgPSBjdXJyZW50Q2hhbmdlSW50ZXJ2YWwgPSBDaGFuZ2VJbnRlcnZhbC5uZXdGb3JEaXNwbGF5KCBudWxsLCBudWxsLCB0aGlzLmRpc3BsYXkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzdG9yZSBvdXIgcmVzdWx0c1xyXG4gICAgLy8gTk9URTogdGhlc2UgbWF5IGdldCBvdmVyd3JpdHRlbiB3aXRoIHRoZSBncm91cCBjaGFuZ2UgaW50ZXJ2YWxzIChpbiB0aGF0IGNhc2UsIGdyb3VwU3luY1RyZWUgd2lsbCByZWFkIGZyb20gdGhlc2UpXHJcbiAgICB0aGlzLmZpcnN0Q2hhbmdlSW50ZXJ2YWwgPSBmaXJzdENoYW5nZUludGVydmFsO1xyXG4gICAgdGhpcy5sYXN0Q2hhbmdlSW50ZXJ2YWwgPSBjdXJyZW50Q2hhbmdlSW50ZXJ2YWw7XHJcblxyXG4gICAgLy8gTk9URTogdGhlc2UgbWF5IGdldCBvdmVyd3JpdHRlbiB3aXRoIHRoZSBncm91cCBkcmF3YWJsZSAoaW4gdGhhdCBjYXNlLCBncm91cFN5bmNUcmVlIHdpbGwgcmVhZCBmcm9tIHRoZXNlKVxyXG4gICAgdGhpcy5maXJzdERyYXdhYmxlID0gdGhpcy5maXJzdElubmVyRHJhd2FibGUgPSBmaXJzdERyYXdhYmxlO1xyXG4gICAgdGhpcy5sYXN0RHJhd2FibGUgPSB0aGlzLmxhc3RJbm5lckRyYXdhYmxlID0gY3VycmVudERyYXdhYmxlOyAvLyBlaXRoZXIgbnVsbCwgb3IgdGhlIGRyYXdhYmxlIGl0c2VsZlxyXG5cclxuICAgIC8vIGVuc3VyZSB0aGF0IG91ciBmaXJzdERyYXdhYmxlIGFuZCBsYXN0RHJhd2FibGUgYXJlIGNvcnJlY3RcclxuICAgIGlmICggYXNzZXJ0U2xvdyApIHtcclxuICAgICAgbGV0IGZpcnN0RHJhd2FibGVDaGVjayA9IG51bGw7XHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgaWYgKCB0aGlzLmNoaWxkcmVuWyBqIF0uc2hvdWxkSW5jbHVkZUluUGFyZW50RHJhd2FibGVzKCkgJiYgdGhpcy5jaGlsZHJlblsgaiBdLmZpcnN0RHJhd2FibGUgKSB7XHJcbiAgICAgICAgICBmaXJzdERyYXdhYmxlQ2hlY2sgPSB0aGlzLmNoaWxkcmVuWyBqIF0uZmlyc3REcmF3YWJsZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoIHRoaXMuc2VsZkRyYXdhYmxlICkge1xyXG4gICAgICAgIGZpcnN0RHJhd2FibGVDaGVjayA9IHRoaXMuc2VsZkRyYXdhYmxlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgbGFzdERyYXdhYmxlQ2hlY2sgPSB0aGlzLnNlbGZEcmF3YWJsZTtcclxuICAgICAgZm9yICggbGV0IGsgPSB0aGlzLmNoaWxkcmVuLmxlbmd0aCAtIDE7IGsgPj0gMDsgay0tICkge1xyXG4gICAgICAgIGlmICggdGhpcy5jaGlsZHJlblsgayBdLnNob3VsZEluY2x1ZGVJblBhcmVudERyYXdhYmxlcygpICYmIHRoaXMuY2hpbGRyZW5bIGsgXS5sYXN0RHJhd2FibGUgKSB7XHJcbiAgICAgICAgICBsYXN0RHJhd2FibGVDaGVjayA9IHRoaXMuY2hpbGRyZW5bIGsgXS5sYXN0RHJhd2FibGU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFzc2VydFNsb3coIGZpcnN0RHJhd2FibGVDaGVjayA9PT0gdGhpcy5maXJzdERyYXdhYmxlICk7XHJcbiAgICAgIGFzc2VydFNsb3coIGxhc3REcmF3YWJsZUNoZWNrID09PSB0aGlzLmxhc3REcmF3YWJsZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSWYgbmVjZXNzYXJ5LCBjcmVhdGUvcmVwbGFjZS9yZW1vdmUgb3VyIHNlbGZEcmF3YWJsZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMgd2hldGhlciB0aGUgc2VsZkRyYXdhYmxlIGNoYW5nZWRcclxuICAgKi9cclxuICB1cGRhdGVTZWxmRHJhd2FibGUoKSB7XHJcbiAgICBpZiAoIHRoaXMubm9kZS5pc1BhaW50ZWQoKSApIHtcclxuICAgICAgY29uc3Qgc2VsZlJlbmRlcmVyID0gdGhpcy5zZWxmUmVuZGVyZXI7IC8vIG91ciBuZXcgc2VsZiByZW5kZXJlciBiaXRtYXNrXHJcblxyXG4gICAgICAvLyBiaXR3aXNlIHRyaWNrLCBzaW5jZSBvbmx5IG9uZSBvZiBDYW52YXMvU1ZHL0RPTS9XZWJHTC9ldGMuIGZsYWdzIHdpbGwgYmUgY2hvc2VuLCBhbmQgYml0bWFza1JlbmRlcmVyQXJlYSBpc1xyXG4gICAgICAvLyB0aGUgbWFzayBmb3IgdGhvc2UgZmxhZ3MuIEluIEVuZ2xpc2gsIFwiSXMgdGhlIGN1cnJlbnQgc2VsZkRyYXdhYmxlIGNvbXBhdGlibGUgd2l0aCBvdXIgc2VsZlJlbmRlcmVyIChpZiBhbnkpLFxyXG4gICAgICAvLyBvciBkbyB3ZSBuZWVkIHRvIGNyZWF0ZSBhIHNlbGZEcmF3YWJsZT9cIlxyXG4gICAgICAvL09IVFdPIFRPRE86IEZvciBDYW52YXMsIHdlIHdvbid0IGNhcmUgYWJvdXQgYW55dGhpbmcgZWxzZSBmb3IgdGhlIGRyYXdhYmxlLCBidXQgZm9yIERPTSB3ZSBjYXJlIGFib3V0IHRoZVxyXG4gICAgICAvLyBmb3JjZS1hY2NlbGVyYXRpb24gZmxhZyEgVGhhdCdzIHN0cmlwcGVkIG91dCBoZXJlLlxyXG4gICAgICBpZiAoICF0aGlzLnNlbGZEcmF3YWJsZSB8fCAoICggdGhpcy5zZWxmRHJhd2FibGUucmVuZGVyZXIgJiBzZWxmUmVuZGVyZXIgJiBSZW5kZXJlci5iaXRtYXNrUmVuZGVyZXJBcmVhICkgPT09IDAgKSApIHtcclxuICAgICAgICBpZiAoIHRoaXMuc2VsZkRyYXdhYmxlICkge1xyXG4gICAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UoIGByZXBsYWNpbmcgb2xkIGRyYXdhYmxlICR7dGhpcy5zZWxmRHJhd2FibGUudG9TdHJpbmcoKX0gd2l0aCBuZXcgcmVuZGVyZXJgICk7XHJcblxyXG4gICAgICAgICAgLy8gc2NyYXAgdGhlIHByZXZpb3VzIHNlbGZEcmF3YWJsZSwgd2UgbmVlZCB0byBjcmVhdGUgb25lIHdpdGggYSBkaWZmZXJlbnQgcmVuZGVyZXIuXHJcbiAgICAgICAgICB0aGlzLnNlbGZEcmF3YWJsZS5tYXJrRm9yRGlzcG9zYWwoIHRoaXMuZGlzcGxheSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZWxmRHJhd2FibGUgPSBSZW5kZXJlci5jcmVhdGVTZWxmRHJhd2FibGUoIHRoaXMsIHRoaXMubm9kZSwgc2VsZlJlbmRlcmVyLCB0aGlzLmZpdHRhYmlsaXR5LmFuY2VzdG9yc0ZpdHRhYmxlICk7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zZWxmRHJhd2FibGUgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnNlbGZEcmF3YWJsZSA9PT0gbnVsbCwgJ05vbi1wYWludGVkIG5vZGVzIHNob3VsZCBub3QgaGF2ZSBhIHNlbGZEcmF3YWJsZScgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB1cC10by1kYXRlIGluc3RhbmNlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBjaGlsZEluc3RhbmNlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XHJcbiAgICogQHJldHVybnMge0luc3RhbmNlfVxyXG4gICAqL1xyXG4gIHVwZGF0ZUluY29tcGF0aWJsZUNoaWxkSW5zdGFuY2UoIGNoaWxkSW5zdGFuY2UsIGluZGV4ICkge1xyXG4gICAgaWYgKCBzY2VuZXJ5TG9nICYmIHNjZW5lcnkuaXNMb2dnaW5nUGVyZm9ybWFuY2UoKSApIHtcclxuICAgICAgY29uc3QgYWZmZWN0ZWRJbnN0YW5jZUNvdW50ID0gY2hpbGRJbnN0YW5jZS5nZXREZXNjZW5kYW50Q291bnQoKSArIDE7IC8vICsxIGZvciBpdHNlbGZcclxuXHJcbiAgICAgIGlmICggYWZmZWN0ZWRJbnN0YW5jZUNvdW50ID4gMTAwICkge1xyXG4gICAgICAgIHNjZW5lcnlMb2cuUGVyZkNyaXRpY2FsICYmIHNjZW5lcnlMb2cuUGVyZkNyaXRpY2FsKCBgaW5jb21wYXRpYmxlIGluc3RhbmNlIHJlYnVpbGQgYXQgJHt0aGlzLnRyYWlsLnRvUGF0aFN0cmluZygpfTogJHthZmZlY3RlZEluc3RhbmNlQ291bnR9YCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBhZmZlY3RlZEluc3RhbmNlQ291bnQgPiA0MCApIHtcclxuICAgICAgICBzY2VuZXJ5TG9nLlBlcmZNYWpvciAmJiBzY2VuZXJ5TG9nLlBlcmZNYWpvciggYGluY29tcGF0aWJsZSBpbnN0YW5jZSByZWJ1aWxkIGF0ICR7dGhpcy50cmFpbC50b1BhdGhTdHJpbmcoKX06ICR7YWZmZWN0ZWRJbnN0YW5jZUNvdW50fWAgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggYWZmZWN0ZWRJbnN0YW5jZUNvdW50ID4gMCApIHtcclxuICAgICAgICBzY2VuZXJ5TG9nLlBlcmZNaW5vciAmJiBzY2VuZXJ5TG9nLlBlcmZNaW5vciggYGluY29tcGF0aWJsZSBpbnN0YW5jZSByZWJ1aWxkIGF0ICR7dGhpcy50cmFpbC50b1BhdGhTdHJpbmcoKX06ICR7YWZmZWN0ZWRJbnN0YW5jZUNvdW50fWAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIG1hcmsgaXQgZm9yIGRpc3Bvc2FsXHJcbiAgICB0aGlzLmRpc3BsYXkubWFya0luc3RhbmNlUm9vdEZvckRpc3Bvc2FsKCBjaGlsZEluc3RhbmNlICk7XHJcblxyXG4gICAgLy8gc3dhcCBpbiBhIG5ldyBpbnN0YW5jZVxyXG4gICAgY29uc3QgcmVwbGFjZW1lbnRJbnN0YW5jZSA9IEluc3RhbmNlLmNyZWF0ZUZyb21Qb29sKCB0aGlzLmRpc3BsYXksIHRoaXMudHJhaWwuY29weSgpLmFkZERlc2NlbmRhbnQoIGNoaWxkSW5zdGFuY2Uubm9kZSwgaW5kZXggKSwgZmFsc2UsIGZhbHNlICk7XHJcbiAgICB0aGlzLnJlcGxhY2VJbnN0YW5jZVdpdGhJbmRleCggY2hpbGRJbnN0YW5jZSwgcmVwbGFjZW1lbnRJbnN0YW5jZSwgaW5kZXggKTtcclxuICAgIHJldHVybiByZXBsYWNlbWVudEluc3RhbmNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gd2FzU3RhdGVsZXNzXHJcbiAgICovXHJcbiAgZ3JvdXBTeW5jVHJlZSggd2FzU3RhdGVsZXNzICkge1xyXG4gICAgY29uc3QgZ3JvdXBSZW5kZXJlciA9IHRoaXMuZ3JvdXBSZW5kZXJlcjtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICggdGhpcy5pc0JhY2tib25lID8gMSA6IDAgKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAoIHRoaXMuaXNJbnN0YW5jZUNhbnZhc0NhY2hlID8gMSA6IDAgKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAoIHRoaXMuaXNTaGFyZWRDYW52YXNDYWNoZVNlbGYgPyAxIDogMCApID09PSAoIGdyb3VwUmVuZGVyZXIgPyAxIDogMCApLFxyXG4gICAgICAnV2Ugc2hvdWxkIGhhdmUgcHJlY2lzZWx5IG9uZSBvZiB0aGVzZSBmbGFncyBzZXQgZm9yIHVzIHRvIGhhdmUgYSBncm91cFJlbmRlcmVyJyApO1xyXG5cclxuICAgIC8vIGlmIHdlIHN3aXRjaGVkIHRvL2F3YXkgZnJvbSBhIGdyb3VwLCBvdXIgZ3JvdXAgdHlwZSBjaGFuZ2VkLCBvciBvdXIgZ3JvdXAgcmVuZGVyZXIgY2hhbmdlZFxyXG4gICAgY29uc3QgZ3JvdXBDaGFuZ2VkID0gKCAhIWdyb3VwUmVuZGVyZXIgIT09ICEhdGhpcy5ncm91cERyYXdhYmxlICkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICggIXdhc1N0YXRlbGVzcyAmJiB0aGlzLmdyb3VwQ2hhbmdlZCApIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAoIHRoaXMuZ3JvdXBEcmF3YWJsZSAmJiB0aGlzLmdyb3VwRHJhd2FibGUucmVuZGVyZXIgIT09IGdyb3VwUmVuZGVyZXIgKTtcclxuXHJcbiAgICAvLyBpZiB0aGVyZSBpcyBhIGNoYW5nZSwgcHJlcGFyZVxyXG4gICAgaWYgKCBncm91cENoYW5nZWQgKSB7XHJcbiAgICAgIGlmICggdGhpcy5ncm91cERyYXdhYmxlICkge1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlKCBgcmVwbGFjaW5nIGdyb3VwIGRyYXdhYmxlICR7dGhpcy5ncm91cERyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwRHJhd2FibGUubWFya0ZvckRpc3Bvc2FsKCB0aGlzLmRpc3BsYXkgKTtcclxuICAgICAgICB0aGlzLmdyb3VwRHJhd2FibGUgPSBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBjaGFuZ2UgZXZlcnl0aGluZywgc2luY2Ugd2UgbWF5IG5lZWQgYSBmdWxsIHJlc3RpdGNoXHJcbiAgICAgIHRoaXMuZmlyc3RDaGFuZ2VJbnRlcnZhbCA9IHRoaXMubGFzdENoYW5nZUludGVydmFsID0gQ2hhbmdlSW50ZXJ2YWwubmV3Rm9yRGlzcGxheSggbnVsbCwgbnVsbCwgdGhpcy5kaXNwbGF5ICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBncm91cFJlbmRlcmVyICkge1xyXG4gICAgICAvLyBlbnN1cmUgb3VyIGxpbmtlZCBsaXN0IGlzIGZ1bGx5IGRpc2Nvbm5lY3RlZCBmcm9tIG90aGVyc1xyXG4gICAgICB0aGlzLmZpcnN0RHJhd2FibGUgJiYgRHJhd2FibGUuZGlzY29ubmVjdEJlZm9yZSggdGhpcy5maXJzdERyYXdhYmxlLCB0aGlzLmRpc3BsYXkgKTtcclxuICAgICAgdGhpcy5sYXN0RHJhd2FibGUgJiYgRHJhd2FibGUuZGlzY29ubmVjdEFmdGVyKCB0aGlzLmxhc3REcmF3YWJsZSwgdGhpcy5kaXNwbGF5ICk7XHJcblxyXG4gICAgICBpZiAoIHRoaXMuaXNCYWNrYm9uZSApIHtcclxuICAgICAgICBpZiAoIGdyb3VwQ2hhbmdlZCApIHtcclxuICAgICAgICAgIHRoaXMuZ3JvdXBEcmF3YWJsZSA9IEJhY2tib25lRHJhd2FibGUuY3JlYXRlRnJvbVBvb2woIHRoaXMuZGlzcGxheSwgdGhpcywgdGhpcy5nZXRUcmFuc2Zvcm1Sb290SW5zdGFuY2UoKSwgZ3JvdXBSZW5kZXJlciwgdGhpcy5pc0Rpc3BsYXlSb290ICk7XHJcblxyXG4gICAgICAgICAgaWYgKCB0aGlzLmlzVHJhbnNmb3JtZWQgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheS5tYXJrVHJhbnNmb3JtUm9vdERpcnR5KCB0aGlzLCB0cnVlICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIHRoaXMuZmlyc3RDaGFuZ2VJbnRlcnZhbCApIHtcclxuICAgICAgICAgIHRoaXMuZ3JvdXBEcmF3YWJsZS5zdGl0Y2goIHRoaXMuZmlyc3REcmF3YWJsZSwgdGhpcy5sYXN0RHJhd2FibGUsIHRoaXMuZmlyc3RDaGFuZ2VJbnRlcnZhbCwgdGhpcy5sYXN0Q2hhbmdlSW50ZXJ2YWwgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHRoaXMuaXNJbnN0YW5jZUNhbnZhc0NhY2hlICkge1xyXG4gICAgICAgIGlmICggZ3JvdXBDaGFuZ2VkICkge1xyXG4gICAgICAgICAgdGhpcy5ncm91cERyYXdhYmxlID0gSW5saW5lQ2FudmFzQ2FjaGVEcmF3YWJsZS5jcmVhdGVGcm9tUG9vbCggZ3JvdXBSZW5kZXJlciwgdGhpcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHRoaXMuZmlyc3RDaGFuZ2VJbnRlcnZhbCApIHtcclxuICAgICAgICAgIHRoaXMuZ3JvdXBEcmF3YWJsZS5zdGl0Y2goIHRoaXMuZmlyc3REcmF3YWJsZSwgdGhpcy5sYXN0RHJhd2FibGUsIHRoaXMuZmlyc3RDaGFuZ2VJbnRlcnZhbCwgdGhpcy5sYXN0Q2hhbmdlSW50ZXJ2YWwgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHRoaXMuaXNTaGFyZWRDYW52YXNDYWNoZVNlbGYgKSB7XHJcbiAgICAgICAgaWYgKCBncm91cENoYW5nZWQgKSB7XHJcbiAgICAgICAgICB0aGlzLmdyb3VwRHJhd2FibGUgPSBDYW52YXNCbG9jay5jcmVhdGVGcm9tUG9vbCggZ3JvdXBSZW5kZXJlciwgdGhpcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL09IVFdPIFRPRE86IHJlc3RpdGNoIGhlcmU/Pz8gaW1wbGVtZW50IGl0XHJcbiAgICAgIH1cclxuICAgICAgLy8gVXBkYXRlIHRoZSBmaXR0YWJsZSBmbGFnXHJcbiAgICAgIHRoaXMuZ3JvdXBEcmF3YWJsZS5zZXRGaXR0YWJsZSggdGhpcy5maXR0YWJpbGl0eS5hbmNlc3RvcnNGaXR0YWJsZSApO1xyXG5cclxuICAgICAgdGhpcy5maXJzdERyYXdhYmxlID0gdGhpcy5sYXN0RHJhd2FibGUgPSB0aGlzLmdyb3VwRHJhd2FibGU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hhbmdlIGludGVydmFsIGhhbmRsaW5nXHJcbiAgICBpZiAoIGdyb3VwQ2hhbmdlZCApIHtcclxuICAgICAgLy8gaWYgb3VyIGdyb3VwIHN0YXR1cyBjaGFuZ2VkLCBtYXJrIEVWRVJZVEhJTkcgYXMgcG90ZW50aWFsbHkgY2hhbmdlZFxyXG4gICAgICB0aGlzLmZpcnN0Q2hhbmdlSW50ZXJ2YWwgPSB0aGlzLmxhc3RDaGFuZ2VJbnRlcnZhbCA9IENoYW5nZUludGVydmFsLm5ld0ZvckRpc3BsYXkoIG51bGwsIG51bGwsIHRoaXMuZGlzcGxheSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGdyb3VwUmVuZGVyZXIgKSB7XHJcbiAgICAgIC8vIG91ciBncm91cCBkaWRuJ3QgaGF2ZSB0byBjaGFuZ2UgYXQgYWxsLCBzbyB3ZSBwcmV2ZW50IGFueSBjaGFuZ2UgaW50ZXJ2YWxzXHJcbiAgICAgIHRoaXMuZmlyc3RDaGFuZ2VJbnRlcnZhbCA9IHRoaXMubGFzdENoYW5nZUludGVydmFsID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgc2hhcmVkU3luY1RyZWUoKSB7XHJcbiAgICAvL09IVFdPIFRPRE86IHdlIGFyZSBwcm9iYWJseSBtaXNzaW5nIHN5bmNUcmVlIGZvciBzaGFyZWQgdHJlZXMgcHJvcGVybHkgd2l0aCBwcnVuaW5nLiBpbnZlc3RpZ2F0ZSEhXHJcblxyXG4gICAgdGhpcy5lbnN1cmVTaGFyZWRDYWNoZUluaXRpYWxpemVkKCk7XHJcblxyXG4gICAgY29uc3Qgc2hhcmVkQ2FjaGVSZW5kZXJlciA9IHRoaXMuc2hhcmVkQ2FjaGVSZW5kZXJlcjtcclxuXHJcbiAgICBpZiAoICF0aGlzLnNoYXJlZENhY2hlRHJhd2FibGUgfHwgdGhpcy5zaGFyZWRDYWNoZURyYXdhYmxlLnJlbmRlcmVyICE9PSBzaGFyZWRDYWNoZVJlbmRlcmVyICkge1xyXG4gICAgICAvL09IVFdPIFRPRE86IG1hcmsgZXZlcnl0aGluZyBhcyBjaGFuZ2VkIChiaWcgY2hhbmdlIGludGVydmFsKVxyXG5cclxuICAgICAgaWYgKCB0aGlzLnNoYXJlZENhY2hlRHJhd2FibGUgKSB7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UoIGByZXBsYWNpbmcgc2hhcmVkIGNhY2hlIGRyYXdhYmxlICR7dGhpcy5zaGFyZWRDYWNoZURyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgICAgICB0aGlzLnNoYXJlZENhY2hlRHJhd2FibGUubWFya0ZvckRpc3Bvc2FsKCB0aGlzLmRpc3BsYXkgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy9PSFRXTyBUT0RPOiBhY3R1YWxseSBjcmVhdGUgdGhlIHByb3BlciBzaGFyZWQgY2FjaGUgZHJhd2FibGUgZGVwZW5kaW5nIG9uIHRoZSBzcGVjaWZpZWQgcmVuZGVyZXJcclxuICAgICAgLy8gKHVwZGF0ZSBpdCBpZiBuZWNlc3NhcnkpXHJcbiAgICAgIHRoaXMuc2hhcmVkQ2FjaGVEcmF3YWJsZSA9IG5ldyBTaGFyZWRDYW52YXNDYWNoZURyYXdhYmxlKCB0aGlzLnRyYWlsLCBzaGFyZWRDYWNoZVJlbmRlcmVyLCB0aGlzLCB0aGlzLnNoYXJlZENhY2hlSW5zdGFuY2UgKTtcclxuICAgICAgdGhpcy5maXJzdERyYXdhYmxlID0gdGhpcy5zaGFyZWRDYWNoZURyYXdhYmxlO1xyXG4gICAgICB0aGlzLmxhc3REcmF3YWJsZSA9IHRoaXMuc2hhcmVkQ2FjaGVEcmF3YWJsZTtcclxuXHJcbiAgICAgIC8vIGJhc2ljYWxseSBldmVyeXRoaW5nIGNoYW5nZWQgbm93LCBhbmQgd29uJ3QgZnJvbSBub3cgb25cclxuICAgICAgdGhpcy5maXJzdENoYW5nZUludGVydmFsID0gdGhpcy5sYXN0Q2hhbmdlSW50ZXJ2YWwgPSBDaGFuZ2VJbnRlcnZhbC5uZXdGb3JEaXNwbGF5KCBudWxsLCBudWxsLCB0aGlzLmRpc3BsYXkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHdhc1N0YXRlbGVzc1xyXG4gICAqL1xyXG4gIHByZXBhcmVDaGlsZEluc3RhbmNlcyggd2FzU3RhdGVsZXNzICkge1xyXG4gICAgLy8gbWFyayBhbGwgcmVtb3ZlZCBpbnN0YW5jZXMgdG8gYmUgZGlzcG9zZWQgKGFsb25nIHdpdGggdGhlaXIgc3VidHJlZXMpXHJcbiAgICB3aGlsZSAoIHRoaXMuaW5zdGFuY2VSZW1vdmFsQ2hlY2tMaXN0Lmxlbmd0aCApIHtcclxuICAgICAgY29uc3QgaW5zdGFuY2VUb01hcmsgPSB0aGlzLmluc3RhbmNlUmVtb3ZhbENoZWNrTGlzdC5wb3AoKTtcclxuICAgICAgaWYgKCBpbnN0YW5jZVRvTWFyay5hZGRSZW1vdmVDb3VudGVyID09PSAtMSApIHtcclxuICAgICAgICBpbnN0YW5jZVRvTWFyay5hZGRSZW1vdmVDb3VudGVyID0gMDsgLy8gcmVzZXQgaXQsIHNvIHdlIGRvbid0IG1hcmsgaXQgZm9yIGRpc3Bvc2FsIG1vcmUgdGhhbiBvbmNlXHJcbiAgICAgICAgdGhpcy5kaXNwbGF5Lm1hcmtJbnN0YW5jZVJvb3RGb3JEaXNwb3NhbCggaW5zdGFuY2VUb01hcmsgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICggd2FzU3RhdGVsZXNzICkge1xyXG4gICAgICAvLyB3ZSBuZWVkIHRvIGNyZWF0ZSBhbGwgb2YgdGhlIGNoaWxkIGluc3RhbmNlc1xyXG4gICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCB0aGlzLm5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBrKysgKSB7XHJcbiAgICAgICAgLy8gY3JlYXRlIGEgY2hpbGQgaW5zdGFuY2VcclxuICAgICAgICBjb25zdCBjaGlsZCA9IHRoaXMubm9kZS5jaGlsZHJlblsgayBdO1xyXG4gICAgICAgIHRoaXMuYXBwZW5kSW5zdGFuY2UoIEluc3RhbmNlLmNyZWF0ZUZyb21Qb29sKCB0aGlzLmRpc3BsYXksIHRoaXMudHJhaWwuY29weSgpLmFkZERlc2NlbmRhbnQoIGNoaWxkLCBrICksIGZhbHNlLCBmYWxzZSApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZW5zdXJlU2hhcmVkQ2FjaGVJbml0aWFsaXplZCgpIHtcclxuICAgIC8vIHdlIG9ubHkgbmVlZCB0byBpbml0aWFsaXplIHRoaXMgc2hhcmVkIGNhY2hlIHJlZmVyZW5jZSBvbmNlXHJcbiAgICBpZiAoICF0aGlzLnNoYXJlZENhY2hlSW5zdGFuY2UgKSB7XHJcbiAgICAgIGNvbnN0IGluc3RhbmNlS2V5ID0gdGhpcy5ub2RlLmdldElkKCk7XHJcbiAgICAgIC8vIFRPRE86IGhhdmUgdGhpcyBhYnN0cmFjdGVkIGF3YXkgaW4gdGhlIERpc3BsYXk/XHJcbiAgICAgIHRoaXMuc2hhcmVkQ2FjaGVJbnN0YW5jZSA9IHRoaXMuZGlzcGxheS5fc2hhcmVkQ2FudmFzSW5zdGFuY2VzWyBpbnN0YW5jZUtleSBdO1xyXG5cclxuICAgICAgLy8gVE9ETzogaW5jcmVtZW50IHJlZmVyZW5jZSBjb3VudGluZz9cclxuICAgICAgaWYgKCAhdGhpcy5zaGFyZWRDYWNoZUluc3RhbmNlICkge1xyXG4gICAgICAgIHRoaXMuc2hhcmVkQ2FjaGVJbnN0YW5jZSA9IEluc3RhbmNlLmNyZWF0ZUZyb21Qb29sKCB0aGlzLmRpc3BsYXksIG5ldyBUcmFpbCggdGhpcy5ub2RlICksIGZhbHNlLCB0cnVlICk7XHJcbiAgICAgICAgdGhpcy5zaGFyZWRDYWNoZUluc3RhbmNlLnN5bmNUcmVlKCk7XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5Ll9zaGFyZWRDYW52YXNJbnN0YW5jZXNbIGluc3RhbmNlS2V5IF0gPSB0aGlzLnNoYXJlZENhY2hlSW5zdGFuY2U7XHJcbiAgICAgICAgLy8gVE9ETzogcmVmZXJlbmNlIGNvdW50aW5nP1xyXG5cclxuICAgICAgICAvLyBUT0RPOiB0aGlzLnNoYXJlZENhY2hlSW5zdGFuY2UuaXNUcmFuc2Zvcm1lZD9cclxuXHJcbiAgICAgICAgLy9PSFRXTyBUT0RPOiBpcyB0aGlzIG5lY2Vzc2FyeT9cclxuICAgICAgICB0aGlzLmRpc3BsYXkubWFya1RyYW5zZm9ybVJvb3REaXJ0eSggdGhpcy5zaGFyZWRDYWNoZUluc3RhbmNlLCB0cnVlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuc2hhcmVkQ2FjaGVJbnN0YW5jZS5leHRlcm5hbFJlZmVyZW5jZUNvdW50Kys7XHJcblxyXG4gICAgICAvL09IVFdPIFRPRE86IGlzIHRoaXMgbmVjZXNzYXJ5P1xyXG4gICAgICBpZiAoIHRoaXMuaXNUcmFuc2Zvcm1lZCApIHtcclxuICAgICAgICB0aGlzLmRpc3BsYXkubWFya1RyYW5zZm9ybVJvb3REaXJ0eSggdGhpcywgdHJ1ZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIG91dCBkcmF3YWJsZXMgKGZyb20gZmlyc3REcmF3YWJsZSB0byBsYXN0RHJhd2FibGUpIHNob3VsZCBiZSBpbmNsdWRlZCBpbiBvdXIgcGFyZW50J3MgZHJhd2FibGVzXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIHNob3VsZEluY2x1ZGVJblBhcmVudERyYXdhYmxlcygpIHtcclxuICAgIHJldHVybiB0aGlzLm5vZGUuaXNWaXNpYmxlKCkgfHwgIXRoaXMubm9kZS5pc0V4Y2x1ZGVJbnZpc2libGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmRzIHRoZSBjbG9zZXN0IGRyYXdhYmxlIChub3QgaW5jbHVkaW5nIHRoZSBjaGlsZCBpbnN0YW5jZSBhdCBjaGlsZEluZGV4KSB1c2luZyBsYXN0RHJhd2FibGUsIG9yIG51bGxcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogVE9ETzogY2hlY2sgdXNhZ2U/XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gY2hpbGRJbmRleFxyXG4gICAqIEByZXR1cm5zIHtEcmF3YWJsZXxudWxsfVxyXG4gICAqL1xyXG4gIGZpbmRQcmV2aW91c0RyYXdhYmxlKCBjaGlsZEluZGV4ICkge1xyXG4gICAgZm9yICggbGV0IGkgPSBjaGlsZEluZGV4IC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuY2hpbGRyZW5bIGkgXS5sYXN0RHJhd2FibGU7XHJcbiAgICAgIGlmICggb3B0aW9uICE9PSBudWxsICkge1xyXG4gICAgICAgIHJldHVybiBvcHRpb247XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmRzIHRoZSBjbG9zZXN0IGRyYXdhYmxlIChub3QgaW5jbHVkaW5nIHRoZSBjaGlsZCBpbnN0YW5jZSBhdCBjaGlsZEluZGV4KSB1c2luZyBuZXh0RHJhd2FibGUsIG9yIG51bGxcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogVE9ETzogY2hlY2sgdXNhZ2U/XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gY2hpbGRJbmRleFxyXG4gICAqIEByZXR1cm5zIHtEcmF3YWJsZXxudWxsfVxyXG4gICAqL1xyXG4gIGZpbmROZXh0RHJhd2FibGUoIGNoaWxkSW5kZXggKSB7XHJcbiAgICBjb25zdCBsZW4gPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDtcclxuICAgIGZvciAoIGxldCBpID0gY2hpbGRJbmRleCArIDE7IGkgPCBsZW47IGkrKyApIHtcclxuICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5jaGlsZHJlblsgaSBdLmZpcnN0RHJhd2FibGU7XHJcbiAgICAgIGlmICggb3B0aW9uICE9PSBudWxsICkge1xyXG4gICAgICAgIHJldHVybiBvcHRpb247XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIENoaWxkcmVuIGhhbmRsaW5nXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgYXBwZW5kSW5zdGFuY2UoIGluc3RhbmNlICkge1xyXG4gICAgdGhpcy5pbnNlcnRJbnN0YW5jZSggaW5zdGFuY2UsIHRoaXMuY2hpbGRyZW4ubGVuZ3RoICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogTk9URTogZGlmZmVyZW50IHBhcmFtZXRlciBvcmRlciBjb21wYXJlZCB0byBOb2RlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxyXG4gICAqL1xyXG4gIGluc2VydEluc3RhbmNlKCBpbnN0YW5jZSwgaW5kZXggKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbnN0YW5jZSBpbnN0YW5jZW9mIEluc3RhbmNlICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCA+PSAwICYmIGluZGV4IDw9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoLFxyXG4gICAgICBgSW5zdGFuY2UgaW5zZXJ0aW9uIGJvdW5kcyBjaGVjayBmb3IgaW5kZXggJHtpbmRleH0gd2l0aCBwcmV2aW91cyBjaGlsZHJlbiBsZW5ndGggJHtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmxlbmd0aH1gICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlVHJlZSAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlVHJlZShcclxuICAgICAgYGluc2VydGluZyAke2luc3RhbmNlLnRvU3RyaW5nKCl9IGludG8gJHt0aGlzLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlVHJlZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBtYXJrIGl0IGFzIGNoYW5nZWQgZHVyaW5nIHRoaXMgZnJhbWUsIHNvIHRoYXQgd2UgY2FuIHByb3Blcmx5IHNldCB0aGUgY2hhbmdlIGludGVydmFsXHJcbiAgICBpbnN0YW5jZS5zdGl0Y2hDaGFuZ2VGcmFtZSA9IHRoaXMuZGlzcGxheS5fZnJhbWVJZDtcclxuICAgIHRoaXMuc3RpdGNoQ2hhbmdlT25DaGlsZHJlbiA9IHRoaXMuZGlzcGxheS5fZnJhbWVJZDtcclxuXHJcbiAgICB0aGlzLmNoaWxkcmVuLnNwbGljZSggaW5kZXgsIDAsIGluc3RhbmNlICk7XHJcbiAgICBpbnN0YW5jZS5wYXJlbnQgPSB0aGlzO1xyXG4gICAgaW5zdGFuY2Uub2xkUGFyZW50ID0gdGhpcztcclxuXHJcbiAgICAvLyBtYWludGFpbiBvdXIgc3RpdGNoLWNoYW5nZSBpbnRlcnZhbFxyXG4gICAgaWYgKCBpbmRleCA8PSB0aGlzLmJlZm9yZVN0YWJsZUluZGV4ICkge1xyXG4gICAgICB0aGlzLmJlZm9yZVN0YWJsZUluZGV4ID0gaW5kZXggLSAxO1xyXG4gICAgfVxyXG4gICAgaWYgKCBpbmRleCA+IHRoaXMuYWZ0ZXJTdGFibGVJbmRleCApIHtcclxuICAgICAgdGhpcy5hZnRlclN0YWJsZUluZGV4ID0gaW5kZXggKyAxO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuYWZ0ZXJTdGFibGVJbmRleCsrO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1haW50YWluIGZpdHRhYmxlIGZsYWdzXHJcbiAgICB0aGlzLmZpdHRhYmlsaXR5Lm9uSW5zZXJ0KCBpbnN0YW5jZS5maXR0YWJpbGl0eSApO1xyXG5cclxuICAgIHRoaXMucmVsYXRpdmVUcmFuc2Zvcm0uYWRkSW5zdGFuY2UoIGluc3RhbmNlICk7XHJcblxyXG4gICAgdGhpcy5tYXJrQ2hpbGRWaXNpYmlsaXR5RGlydHkoKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2VUcmVlICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gaW5zdGFuY2VcclxuICAgKi9cclxuICByZW1vdmVJbnN0YW5jZSggaW5zdGFuY2UgKSB7XHJcbiAgICB0aGlzLnJlbW92ZUluc3RhbmNlV2l0aEluZGV4KCBpbnN0YW5jZSwgXy5pbmRleE9mKCB0aGlzLmNoaWxkcmVuLCBpbnN0YW5jZSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gaW5zdGFuY2VcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcclxuICAgKi9cclxuICByZW1vdmVJbnN0YW5jZVdpdGhJbmRleCggaW5zdGFuY2UsIGluZGV4ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5zdGFuY2UgaW5zdGFuY2VvZiBJbnN0YW5jZSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoLFxyXG4gICAgICBgSW5zdGFuY2UgcmVtb3ZhbCBib3VuZHMgY2hlY2sgZm9yIGluZGV4ICR7aW5kZXh9IHdpdGggcHJldmlvdXMgY2hpbGRyZW4gbGVuZ3RoICR7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5sZW5ndGh9YCApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZVRyZWUgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZVRyZWUoXHJcbiAgICAgIGByZW1vdmluZyAke2luc3RhbmNlLnRvU3RyaW5nKCl9IGZyb20gJHt0aGlzLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlVHJlZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBjb25zdCBmcmFtZUlkID0gdGhpcy5kaXNwbGF5Ll9mcmFtZUlkO1xyXG5cclxuICAgIC8vIG1hcmsgaXQgYXMgY2hhbmdlZCBkdXJpbmcgdGhpcyBmcmFtZSwgc28gdGhhdCB3ZSBjYW4gcHJvcGVybHkgc2V0IHRoZSBjaGFuZ2UgaW50ZXJ2YWxcclxuICAgIGluc3RhbmNlLnN0aXRjaENoYW5nZUZyYW1lID0gZnJhbWVJZDtcclxuICAgIHRoaXMuc3RpdGNoQ2hhbmdlT25DaGlsZHJlbiA9IGZyYW1lSWQ7XHJcblxyXG4gICAgLy8gbWFyayBuZWlnaGJvcnMgc28gdGhhdCB3ZSBjYW4gYWRkIGEgY2hhbmdlIGludGVydmFsIGZvciBvdXIgcmVtb3ZhbCBhcmVhXHJcbiAgICBpZiAoIGluZGV4IC0gMSA+PSAwICkge1xyXG4gICAgICB0aGlzLmNoaWxkcmVuWyBpbmRleCAtIDEgXS5zdGl0Y2hDaGFuZ2VBZnRlciA9IGZyYW1lSWQ7XHJcbiAgICB9XHJcbiAgICBpZiAoIGluZGV4ICsgMSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoICkge1xyXG4gICAgICB0aGlzLmNoaWxkcmVuWyBpbmRleCArIDEgXS5zdGl0Y2hDaGFuZ2VCZWZvcmUgPSBmcmFtZUlkO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKCBpbmRleCwgMSApOyAvLyBUT0RPOiByZXBsYWNlIHdpdGggYSAncmVtb3ZlJyBmdW5jdGlvbiBjYWxsXHJcbiAgICBpbnN0YW5jZS5wYXJlbnQgPSBudWxsO1xyXG4gICAgaW5zdGFuY2Uub2xkUGFyZW50ID0gdGhpcztcclxuXHJcbiAgICAvLyBtYWludGFpbiBvdXIgc3RpdGNoLWNoYW5nZSBpbnRlcnZhbFxyXG4gICAgaWYgKCBpbmRleCA8PSB0aGlzLmJlZm9yZVN0YWJsZUluZGV4ICkge1xyXG4gICAgICB0aGlzLmJlZm9yZVN0YWJsZUluZGV4ID0gaW5kZXggLSAxO1xyXG4gICAgfVxyXG4gICAgaWYgKCBpbmRleCA+PSB0aGlzLmFmdGVyU3RhYmxlSW5kZXggKSB7XHJcbiAgICAgIHRoaXMuYWZ0ZXJTdGFibGVJbmRleCA9IGluZGV4O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuYWZ0ZXJTdGFibGVJbmRleC0tO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1haW50YWluIGZpdHRhYmxlIGZsYWdzXHJcbiAgICB0aGlzLmZpdHRhYmlsaXR5Lm9uUmVtb3ZlKCBpbnN0YW5jZS5maXR0YWJpbGl0eSApO1xyXG5cclxuICAgIHRoaXMucmVsYXRpdmVUcmFuc2Zvcm0ucmVtb3ZlSW5zdGFuY2UoIGluc3RhbmNlICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlVHJlZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGNoaWxkSW5zdGFuY2VcclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSByZXBsYWNlbWVudEluc3RhbmNlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XHJcbiAgICovXHJcbiAgcmVwbGFjZUluc3RhbmNlV2l0aEluZGV4KCBjaGlsZEluc3RhbmNlLCByZXBsYWNlbWVudEluc3RhbmNlLCBpbmRleCApIHtcclxuICAgIC8vIFRPRE86IG9wdGltaXphdGlvbj8gaG9wZWZ1bGx5IGl0IHdvbid0IGhhcHBlbiBvZnRlbiwgc28gd2UganVzdCBkbyB0aGlzIGZvciBub3dcclxuICAgIHRoaXMucmVtb3ZlSW5zdGFuY2VXaXRoSW5kZXgoIGNoaWxkSW5zdGFuY2UsIGluZGV4ICk7XHJcbiAgICB0aGlzLmluc2VydEluc3RhbmNlKCByZXBsYWNlbWVudEluc3RhbmNlLCBpbmRleCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRm9yIGhhbmRsaW5nIHBvdGVudGlhbCByZW9yZGVyaW5nIG9mIGNoaWxkIGluc3RhbmNlcyBpbmNsdXNpdmVseSBiZXR3ZWVuIHRoZSBtaW4gYW5kIG1heCBpbmRpY2VzLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWluQ2hhbmdlSW5kZXhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4Q2hhbmdlSW5kZXhcclxuICAgKi9cclxuICByZW9yZGVySW5zdGFuY2VzKCBtaW5DaGFuZ2VJbmRleCwgbWF4Q2hhbmdlSW5kZXggKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbWluQ2hhbmdlSW5kZXggPT09ICdudW1iZXInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbWF4Q2hhbmdlSW5kZXggPT09ICdudW1iZXInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtaW5DaGFuZ2VJbmRleCA8PSBtYXhDaGFuZ2VJbmRleCApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZVRyZWUgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZVRyZWUoIGBSZW9yZGVyaW5nICR7dGhpcy50b1N0cmluZygpfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZVRyZWUgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gTk9URTogRm9yIGltcGxlbWVudGF0aW9uLCB3ZSd2ZSBiYXNpY2FsbHkgc2V0IHBhcmFtZXRlcnMgYXMgaWYgd2UgcmVtb3ZlZCBhbGwgb2YgdGhlIHJlbGV2YW50IGluc3RhbmNlcyBhbmRcclxuICAgIC8vIHRoZW4gYWRkZWQgdGhlbSBiYWNrIGluLiBUaGVyZSBtYXkgYmUgbW9yZSBlZmZpY2llbnQgd2F5cyB0byBkbyB0aGlzLCBidXQgdGhlIHN0aXRjaGluZyBhbmQgY2hhbmdlIGludGVydmFsXHJcbiAgICAvLyBwcm9jZXNzIGlzIGEgYml0IGNvbXBsaWNhdGVkIHJpZ2h0IG5vdy5cclxuXHJcbiAgICBjb25zdCBmcmFtZUlkID0gdGhpcy5kaXNwbGF5Ll9mcmFtZUlkO1xyXG5cclxuICAgIC8vIFJlbW92ZSB0aGUgb2xkIG9yZGVyaW5nIG9mIGluc3RhbmNlc1xyXG4gICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UoIG1pbkNoYW5nZUluZGV4LCBtYXhDaGFuZ2VJbmRleCAtIG1pbkNoYW5nZUluZGV4ICsgMSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgaW5zdGFuY2VzIGJhY2sgaW4gdGhlIGNvcnJlY3Qgb3JkZXJcclxuICAgIGZvciAoIGxldCBpID0gbWluQ2hhbmdlSW5kZXg7IGkgPD0gbWF4Q2hhbmdlSW5kZXg7IGkrKyApIHtcclxuICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLmZpbmRDaGlsZEluc3RhbmNlT25Ob2RlKCB0aGlzLm5vZGUuX2NoaWxkcmVuWyBpIF0gKTtcclxuICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UoIGksIDAsIGNoaWxkICk7XHJcbiAgICAgIGNoaWxkLnN0aXRjaENoYW5nZUZyYW1lID0gZnJhbWVJZDtcclxuXHJcbiAgICAgIC8vIG1hcmsgbmVpZ2hib3JzIHNvIHRoYXQgd2UgY2FuIGFkZCBhIGNoYW5nZSBpbnRlcnZhbCBmb3Igb3VyIGNoYW5nZSBhcmVhXHJcbiAgICAgIGlmICggaSA+IG1pbkNoYW5nZUluZGV4ICkge1xyXG4gICAgICAgIGNoaWxkLnN0aXRjaENoYW5nZUFmdGVyID0gZnJhbWVJZDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGkgPCBtYXhDaGFuZ2VJbmRleCApIHtcclxuICAgICAgICBjaGlsZC5zdGl0Y2hDaGFuZ2VCZWZvcmUgPSBmcmFtZUlkO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zdGl0Y2hDaGFuZ2VPbkNoaWxkcmVuID0gZnJhbWVJZDtcclxuICAgIHRoaXMuYmVmb3JlU3RhYmxlSW5kZXggPSBNYXRoLm1pbiggdGhpcy5iZWZvcmVTdGFibGVJbmRleCwgbWluQ2hhbmdlSW5kZXggLSAxICk7XHJcbiAgICB0aGlzLmFmdGVyU3RhYmxlSW5kZXggPSBNYXRoLm1heCggdGhpcy5hZnRlclN0YWJsZUluZGV4LCBtYXhDaGFuZ2VJbmRleCArIDEgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2VUcmVlICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJZiB3ZSBoYXZlIGEgY2hpbGQgaW5zdGFuY2UgdGhhdCBjb3JyZXNwb25kcyB0byB0aGlzIG5vZGUsIHJldHVybiBpdCAob3RoZXJ3aXNlIG51bGwpLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcclxuICAgKiBAcmV0dXJucyB7SW5zdGFuY2V8bnVsbH1cclxuICAgKi9cclxuICBmaW5kQ2hpbGRJbnN0YW5jZU9uTm9kZSggbm9kZSApIHtcclxuICAgIGNvbnN0IGluc3RhbmNlcyA9IG5vZGUuZ2V0SW5zdGFuY2VzKCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBpbnN0YW5jZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGlmICggaW5zdGFuY2VzWyBpIF0ub2xkUGFyZW50ID09PSB0aGlzICkge1xyXG4gICAgICAgIHJldHVybiBpbnN0YW5jZXNbIGkgXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFdmVudCBjYWxsYmFjayBmb3IgTm9kZSdzICdjaGlsZEluc2VydGVkJyBldmVudCwgdXNlZCB0byB0cmFjayBjaGlsZHJlbi5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOb2RlfSBjaGlsZE5vZGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcclxuICAgKi9cclxuICBvbkNoaWxkSW5zZXJ0ZWQoIGNoaWxkTm9kZSwgaW5kZXggKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZShcclxuICAgICAgYGluc2VydGluZyBjaGlsZCBub2RlICR7Y2hpbGROb2RlLmNvbnN0cnVjdG9yLm5hbWV9IyR7Y2hpbGROb2RlLmlkfSBpbnRvICR7dGhpcy50b1N0cmluZygpfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5zdGF0ZWxlc3MsICdJZiB3ZSBhcmUgc3RhdGVsZXNzLCB3ZSBzaG91bGQgbm90IHJlY2VpdmUgdGhlc2Ugbm90aWZpY2F0aW9ucycgKTtcclxuXHJcbiAgICBsZXQgaW5zdGFuY2UgPSB0aGlzLmZpbmRDaGlsZEluc3RhbmNlT25Ob2RlKCBjaGlsZE5vZGUgKTtcclxuXHJcbiAgICBpZiAoIGluc3RhbmNlICkge1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSggJ2luc3RhbmNlIGFscmVhZHkgZXhpc3RzJyApO1xyXG4gICAgICAvLyBpdCBtdXN0IGhhdmUgYmVlbiBhZGRlZCBiYWNrLiBpbmNyZW1lbnQgaXRzIGNvdW50ZXJcclxuICAgICAgaW5zdGFuY2UuYWRkUmVtb3ZlQ291bnRlciArPSAxO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbnN0YW5jZS5hZGRSZW1vdmVDb3VudGVyID09PSAwICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UoICdjcmVhdGluZyBzdHViIGluc3RhbmNlJyApO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcbiAgICAgIGluc3RhbmNlID0gSW5zdGFuY2UuY3JlYXRlRnJvbVBvb2woIHRoaXMuZGlzcGxheSwgdGhpcy50cmFpbC5jb3B5KCkuYWRkRGVzY2VuZGFudCggY2hpbGROb2RlLCBpbmRleCApLCBmYWxzZSwgZmFsc2UgKTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pbnNlcnRJbnN0YW5jZSggaW5zdGFuY2UsIGluZGV4ICk7XHJcblxyXG4gICAgLy8gbWFrZSBzdXJlIHdlIGFyZSB2aXNpdGVkIGZvciBzeW5jVHJlZSgpXHJcbiAgICB0aGlzLm1hcmtTa2lwUHJ1bmluZygpO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXZlbnQgY2FsbGJhY2sgZm9yIE5vZGUncyAnY2hpbGRSZW1vdmVkJyBldmVudCwgdXNlZCB0byB0cmFjayBjaGlsZHJlbi5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOb2RlfSBjaGlsZE5vZGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcclxuICAgKi9cclxuICBvbkNoaWxkUmVtb3ZlZCggY2hpbGROb2RlLCBpbmRleCApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlKFxyXG4gICAgICBgcmVtb3ZpbmcgY2hpbGQgbm9kZSAke2NoaWxkTm9kZS5jb25zdHJ1Y3Rvci5uYW1lfSMke2NoaWxkTm9kZS5pZH0gZnJvbSAke3RoaXMudG9TdHJpbmcoKX1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuc3RhdGVsZXNzLCAnSWYgd2UgYXJlIHN0YXRlbGVzcywgd2Ugc2hvdWxkIG5vdCByZWNlaXZlIHRoZXNlIG5vdGlmaWNhdGlvbnMnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNoaWxkcmVuWyBpbmRleCBdLm5vZGUgPT09IGNoaWxkTm9kZSwgJ0Vuc3VyZSB0aGF0IG91ciBpbnN0YW5jZSBtYXRjaGVzIHVwJyApO1xyXG5cclxuICAgIGNvbnN0IGluc3RhbmNlID0gdGhpcy5maW5kQ2hpbGRJbnN0YW5jZU9uTm9kZSggY2hpbGROb2RlICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbnN0YW5jZSAhPT0gbnVsbCwgJ1dlIHNob3VsZCBhbHdheXMgaGF2ZSBhIHJlZmVyZW5jZSB0byBhIHJlbW92ZWQgaW5zdGFuY2UnICk7XHJcblxyXG4gICAgaW5zdGFuY2UuYWRkUmVtb3ZlQ291bnRlciAtPSAxO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5zdGFuY2UuYWRkUmVtb3ZlQ291bnRlciA9PT0gLTEgKTtcclxuXHJcbiAgICAvLyB0cmFjayB0aGUgcmVtb3ZlZCBpbnN0YW5jZSBoZXJlLiBpZiBpdCBkb2Vzbid0IGdldCBhZGRlZCBiYWNrLCB0aGlzIHdpbGwgYmUgdGhlIG9ubHkgcmVmZXJlbmNlIHdlIGhhdmUgKHdlJ2xsXHJcbiAgICAvLyBuZWVkIHRvIGRpc3Bvc2UgaXQpXHJcbiAgICB0aGlzLmluc3RhbmNlUmVtb3ZhbENoZWNrTGlzdC5wdXNoKCBpbnN0YW5jZSApO1xyXG5cclxuICAgIHRoaXMucmVtb3ZlSW5zdGFuY2VXaXRoSW5kZXgoIGluc3RhbmNlLCBpbmRleCApO1xyXG5cclxuICAgIC8vIG1ha2Ugc3VyZSB3ZSBhcmUgdmlzaXRlZCBmb3Igc3luY1RyZWUoKVxyXG4gICAgdGhpcy5tYXJrU2tpcFBydW5pbmcoKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV2ZW50IGNhbGxiYWNrIGZvciBOb2RlJ3MgJ2NoaWxkcmVuUmVvcmRlcmVkJyBldmVudFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWluQ2hhbmdlSW5kZXhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4Q2hhbmdlSW5kZXhcclxuICAgKi9cclxuICBvbkNoaWxkcmVuUmVvcmRlcmVkKCBtaW5DaGFuZ2VJbmRleCwgbWF4Q2hhbmdlSW5kZXggKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZShcclxuICAgICAgYHJlb3JkZXJpbmcgY2hpbGRyZW4gZm9yICR7dGhpcy50b1N0cmluZygpfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICB0aGlzLnJlb3JkZXJJbnN0YW5jZXMoIG1pbkNoYW5nZUluZGV4LCBtYXhDaGFuZ2VJbmRleCApO1xyXG5cclxuICAgIC8vIG1ha2Ugc3VyZSB3ZSBhcmUgdmlzaXRlZCBmb3Igc3luY1RyZWUoKVxyXG4gICAgdGhpcy5tYXJrU2tpcFBydW5pbmcoKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV2ZW50IGNhbGxiYWNrIGZvciBOb2RlJ3MgJ3Zpc2liaWxpdHknIGV2ZW50LCB1c2VkIHRvIG5vdGlmeSBhYm91dCBzdGl0Y2ggY2hhbmdlcy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIG9uVmlzaWJpbGl0eUNoYW5nZSgpIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLnN0YXRlbGVzcywgJ0lmIHdlIGFyZSBzdGF0ZWxlc3MsIHdlIHNob3VsZCBub3QgcmVjZWl2ZSB0aGVzZSBub3RpZmljYXRpb25zJyApO1xyXG5cclxuICAgIC8vIGZvciBub3csIGp1c3QgbWFyayB3aGljaCBmcmFtZSB3ZSB3ZXJlIGNoYW5nZWQgZm9yIG91ciBjaGFuZ2UgaW50ZXJ2YWxcclxuICAgIHRoaXMuc3RpdGNoQ2hhbmdlRnJhbWUgPSB0aGlzLmRpc3BsYXkuX2ZyYW1lSWQ7XHJcblxyXG4gICAgLy8gbWFrZSBzdXJlIHdlIGFyZW4ndCBwcnVuZWQgaW4gdGhlIG5leHQgc3luY1RyZWUoKVxyXG4gICAgdGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQubWFya1NraXBQcnVuaW5nKCk7XHJcblxyXG4gICAgLy8gbWFyayB2aXNpYmlsaXR5IGNoYW5nZXNcclxuICAgIHRoaXMudmlzaWJpbGl0eURpcnR5ID0gdHJ1ZTtcclxuICAgIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50Lm1hcmtDaGlsZFZpc2liaWxpdHlEaXJ0eSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXZlbnQgY2FsbGJhY2sgZm9yIE5vZGUncyAnb3BhY2l0eScgY2hhbmdlIGV2ZW50LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgb25PcGFjaXR5Q2hhbmdlKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuc3RhdGVsZXNzLCAnSWYgd2UgYXJlIHN0YXRlbGVzcywgd2Ugc2hvdWxkIG5vdCByZWNlaXZlIHRoZXNlIG5vdGlmaWNhdGlvbnMnICk7XHJcblxyXG4gICAgdGhpcy5tYXJrUmVuZGVyU3RhdGVEaXJ0eSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBtYXJrQ2hpbGRWaXNpYmlsaXR5RGlydHkoKSB7XHJcbiAgICBpZiAoICF0aGlzLmNoaWxkVmlzaWJpbGl0eURpcnR5ICkge1xyXG4gICAgICB0aGlzLmNoaWxkVmlzaWJpbGl0eURpcnR5ID0gdHJ1ZTtcclxuICAgICAgdGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQubWFya0NoaWxkVmlzaWJpbGl0eURpcnR5KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSBjdXJyZW50bHkgZml0dGFiaWxpdHkgZm9yIGFsbCBvZiB0aGUgZHJhd2FibGVzIGF0dGFjaGVkIHRvIHRoaXMgaW5zdGFuY2UuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBmaXR0YWJsZVxyXG4gICAqL1xyXG4gIHVwZGF0ZURyYXdhYmxlRml0dGFiaWxpdHkoIGZpdHRhYmxlICkge1xyXG4gICAgdGhpcy5zZWxmRHJhd2FibGUgJiYgdGhpcy5zZWxmRHJhd2FibGUuc2V0Rml0dGFibGUoIGZpdHRhYmxlICk7XHJcbiAgICB0aGlzLmdyb3VwRHJhd2FibGUgJiYgdGhpcy5ncm91cERyYXdhYmxlLnNldEZpdHRhYmxlKCBmaXR0YWJsZSApO1xyXG4gICAgLy8gdGhpcy5zaGFyZWRDYWNoZURyYXdhYmxlICYmIHRoaXMuc2hhcmVkQ2FjaGVEcmF3YWJsZS5zZXRGaXR0YWJsZSggZml0dGFibGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIHZpc2libGUvcmVsYXRpdmVWaXNpYmxlIGZsYWdzIG9uIHRoZSBJbnN0YW5jZSBhbmQgaXRzIGVudGlyZSBzdWJ0cmVlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gcGFyZW50R2xvYmFsbHlWaXNpYmxlIC0gV2hldGhlciBvdXIgcGFyZW50IChpZiBhbnkpIGlzIGdsb2JhbGx5IHZpc2libGVcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHBhcmVudEdsb2JhbGx5Vm9pY2luZ1Zpc2libGUgLSBXaGV0aGVyIG91ciBwYXJlbnQgKGlmIGFueSkgaXMgZ2xvYmFsbHkgdm9pY2luZ1Zpc2libGUuXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBwYXJlbnRSZWxhdGl2ZWx5VmlzaWJsZSAtIFdoZXRoZXIgb3VyIHBhcmVudCAoaWYgYW55KSBpcyByZWxhdGl2ZWx5IHZpc2libGVcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVwZGF0ZUZ1bGxTdWJ0cmVlIC0gSWYgdHJ1ZSwgd2Ugd2lsbCB2aXNpdCB0aGUgZW50aXJlIHN1YnRyZWUgdG8gZW5zdXJlIHZpc2liaWxpdHkgaXMgY29ycmVjdC5cclxuICAgKi9cclxuICB1cGRhdGVWaXNpYmlsaXR5KCBwYXJlbnRHbG9iYWxseVZpc2libGUsIHBhcmVudEdsb2JhbGx5Vm9pY2luZ1Zpc2libGUsIHBhcmVudFJlbGF0aXZlbHlWaXNpYmxlLCB1cGRhdGVGdWxsU3VidHJlZSApIHtcclxuICAgIC8vIElmIG91ciB2aXNpYmlsaXR5IGZsYWcgZm9yIG91cnNlbGYgaXMgZGlydHksIHdlIG5lZWQgdG8gdXBkYXRlIG91ciBlbnRpcmUgc3VidHJlZVxyXG4gICAgaWYgKCB0aGlzLnZpc2liaWxpdHlEaXJ0eSApIHtcclxuICAgICAgdXBkYXRlRnVsbFN1YnRyZWUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNhbGN1bGF0ZSBvdXIgdmlzaWJpbGl0aWVzXHJcbiAgICBjb25zdCBub2RlVmlzaWJsZSA9IHRoaXMubm9kZS5pc1Zpc2libGUoKTtcclxuICAgIGNvbnN0IHdhc1Zpc2libGUgPSB0aGlzLnZpc2libGU7XHJcbiAgICBjb25zdCB3YXNSZWxhdGl2ZVZpc2libGUgPSB0aGlzLnJlbGF0aXZlVmlzaWJsZTtcclxuICAgIGNvbnN0IHdhc1NlbGZWaXNpYmxlID0gdGhpcy5zZWxmVmlzaWJsZTtcclxuICAgIGNvbnN0IG5vZGVWb2ljaW5nVmlzaWJsZSA9IHRoaXMubm9kZS52b2ljaW5nVmlzaWJsZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgY29uc3Qgd2FzVm9pY2luZ1Zpc2libGUgPSB0aGlzLnZvaWNpbmdWaXNpYmxlO1xyXG4gICAgY29uc3QgY291bGRWb2ljZSA9IHdhc1Zpc2libGUgJiYgd2FzVm9pY2luZ1Zpc2libGU7XHJcbiAgICB0aGlzLnZpc2libGUgPSBwYXJlbnRHbG9iYWxseVZpc2libGUgJiYgbm9kZVZpc2libGU7XHJcbiAgICB0aGlzLnZvaWNpbmdWaXNpYmxlID0gcGFyZW50R2xvYmFsbHlWb2ljaW5nVmlzaWJsZSAmJiBub2RlVm9pY2luZ1Zpc2libGU7XHJcbiAgICB0aGlzLnJlbGF0aXZlVmlzaWJsZSA9IHBhcmVudFJlbGF0aXZlbHlWaXNpYmxlICYmIG5vZGVWaXNpYmxlO1xyXG4gICAgdGhpcy5zZWxmVmlzaWJsZSA9IHRoaXMuaXNWaXNpYmlsaXR5QXBwbGllZCA/IHRydWUgOiB0aGlzLnJlbGF0aXZlVmlzaWJsZTtcclxuXHJcbiAgICBjb25zdCBsZW4gPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbjsgaSsrICkge1xyXG4gICAgICBjb25zdCBjaGlsZCA9IHRoaXMuY2hpbGRyZW5bIGkgXTtcclxuXHJcbiAgICAgIGlmICggdXBkYXRlRnVsbFN1YnRyZWUgfHwgY2hpbGQudmlzaWJpbGl0eURpcnR5IHx8IGNoaWxkLmNoaWxkVmlzaWJpbGl0eURpcnR5ICkge1xyXG4gICAgICAgIC8vIGlmIHdlIGFyZSBhIHZpc2liaWxpdHkgcm9vdCAoaXNWaXNpYmlsaXR5QXBwbGllZD09PXRydWUpLCBkaXNyZWdhcmQgYW5jZXN0b3IgdmlzaWJpbGl0eVxyXG4gICAgICAgIGNoaWxkLnVwZGF0ZVZpc2liaWxpdHkoIHRoaXMudmlzaWJsZSwgdGhpcy52b2ljaW5nVmlzaWJsZSwgdGhpcy5pc1Zpc2liaWxpdHlBcHBsaWVkID8gdHJ1ZSA6IHRoaXMucmVsYXRpdmVWaXNpYmxlLCB1cGRhdGVGdWxsU3VidHJlZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy52aXNpYmlsaXR5RGlydHkgPSBmYWxzZTtcclxuICAgIHRoaXMuY2hpbGRWaXNpYmlsaXR5RGlydHkgPSBmYWxzZTtcclxuXHJcbiAgICAvLyB0cmlnZ2VyIGNoYW5nZXMgYWZ0ZXIgd2UgZG8gdGhlIGZ1bGwgdmlzaWJpbGl0eSB1cGRhdGVcclxuICAgIGlmICggdGhpcy52aXNpYmxlICE9PSB3YXNWaXNpYmxlICkge1xyXG4gICAgICB0aGlzLnZpc2libGVFbWl0dGVyLmVtaXQoKTtcclxuICAgIH1cclxuICAgIGlmICggdGhpcy5yZWxhdGl2ZVZpc2libGUgIT09IHdhc1JlbGF0aXZlVmlzaWJsZSApIHtcclxuICAgICAgdGhpcy5yZWxhdGl2ZVZpc2libGVFbWl0dGVyLmVtaXQoKTtcclxuICAgIH1cclxuICAgIGlmICggdGhpcy5zZWxmVmlzaWJsZSAhPT0gd2FzU2VsZlZpc2libGUgKSB7XHJcbiAgICAgIHRoaXMuc2VsZlZpc2libGVFbWl0dGVyLmVtaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBbiBJbnN0YW5jZSBjYW4gdm9pY2Ugd2hlbiBpdCBpcyBnbG9iYWxseSB2aXNpYmxlIGFuZCB2b2ljaW5nVmlzaWJsZS4gTm90aWZ5IHdoZW4gdGhpcyBzdGF0ZSBoYXMgY2hhbmdlZFxyXG4gICAgLy8gYmFzZWQgb24gdGhlc2UgZGVwZW5kZW5jaWVzLlxyXG4gICAgY29uc3QgY2FuVm9pY2UgPSB0aGlzLnZvaWNpbmdWaXNpYmxlICYmIHRoaXMudmlzaWJsZTtcclxuICAgIGlmICggY2FuVm9pY2UgIT09IGNvdWxkVm9pY2UgKSB7XHJcbiAgICAgIHRoaXMuY2FuVm9pY2VFbWl0dGVyLmVtaXQoIGNhblZvaWNlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXREZXNjZW5kYW50Q291bnQoKSB7XHJcbiAgICBsZXQgY291bnQgPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvdW50ICs9IHRoaXMuY2hpbGRyZW5bIGkgXS5nZXREZXNjZW5kYW50Q291bnQoKTtcclxuICAgIH1cclxuICAgIHJldHVybiBjb3VudDtcclxuICB9XHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIE1pc2NlbGxhbmVvdXNcclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSByZWZlcmVuY2UgZm9yIGFuIFNWRyBncm91cCAoZmFzdGVzdCB3YXkgdG8gdHJhY2sgdGhlbSlcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NWR0dyb3VwfSBncm91cFxyXG4gICAqL1xyXG4gIGFkZFNWR0dyb3VwKCBncm91cCApIHtcclxuICAgIHRoaXMuc3ZnR3JvdXBzLnB1c2goIGdyb3VwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYSByZWZlcmVuY2UgZm9yIGFuIFNWRyBncm91cCAoZmFzdGVzdCB3YXkgdG8gdHJhY2sgdGhlbSlcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NWR0dyb3VwfSBncm91cFxyXG4gICAqL1xyXG4gIHJlbW92ZVNWR0dyb3VwKCBncm91cCApIHtcclxuICAgIGFycmF5UmVtb3ZlKCB0aGlzLnN2Z0dyb3VwcywgZ3JvdXAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgbnVsbCB3aGVuIGEgbG9va3VwIGZhaWxzICh3aGljaCBpcyBsZWdpdGltYXRlKVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U1ZHQmxvY2t9IGJsb2NrXHJcbiAgICogQHJldHVybnMge1NWR0dyb3VwfG51bGx9XHJcbiAgICovXHJcbiAgbG9va3VwU1ZHR3JvdXAoIGJsb2NrICkge1xyXG4gICAgY29uc3QgbGVuID0gdGhpcy5zdmdHcm91cHMubGVuZ3RoO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGdyb3VwID0gdGhpcy5zdmdHcm91cHNbIGkgXTtcclxuICAgICAgaWYgKCBncm91cC5ibG9jayA9PT0gYmxvY2sgKSB7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoYXQgaW5zdGFuY2UgaGF2ZSBmaWx0ZXJzIChvcGFjaXR5L3Zpc2liaWxpdHkvY2xpcCkgYmVlbiBhcHBsaWVkIHVwIHRvP1xyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtJbnN0YW5jZX1cclxuICAgKi9cclxuICBnZXRGaWx0ZXJSb290SW5zdGFuY2UoKSB7XHJcbiAgICBpZiAoIHRoaXMuaXNCYWNrYm9uZSB8fCB0aGlzLmlzSW5zdGFuY2VDYW52YXNDYWNoZSB8fCAhdGhpcy5wYXJlbnQgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnBhcmVudC5nZXRGaWx0ZXJSb290SW5zdGFuY2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoYXQgaW5zdGFuY2UgdHJhbnNmb3JtcyBoYXZlIGJlZW4gYXBwbGllZCB1cCB0bz9cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7SW5zdGFuY2V9XHJcbiAgICovXHJcbiAgZ2V0VHJhbnNmb3JtUm9vdEluc3RhbmNlKCkge1xyXG4gICAgaWYgKCB0aGlzLmlzVHJhbnNmb3JtZWQgfHwgIXRoaXMucGFyZW50ICkge1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnQuZ2V0VHJhbnNmb3JtUm9vdEluc3RhbmNlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7SW5zdGFuY2V9XHJcbiAgICovXHJcbiAgZ2V0VmlzaWJpbGl0eVJvb3RJbnN0YW5jZSgpIHtcclxuICAgIGlmICggdGhpcy5pc1Zpc2liaWxpdHlBcHBsaWVkIHx8ICF0aGlzLnBhcmVudCApIHtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmdldFZpc2liaWxpdHlSb290SW5zdGFuY2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgYXR0YWNoTm9kZUxpc3RlbmVycygpIHtcclxuICAgIC8vIGF0dGFjaCBsaXN0ZW5lcnMgdG8gb3VyIG5vZGVcclxuICAgIHRoaXMucmVsYXRpdmVUcmFuc2Zvcm0uYXR0YWNoTm9kZUxpc3RlbmVycygpO1xyXG5cclxuICAgIGlmICggIXRoaXMuaXNTaGFyZWRDYW52YXNDYWNoZVBsYWNlaG9sZGVyICkge1xyXG4gICAgICB0aGlzLm5vZGUuY2hpbGRJbnNlcnRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuY2hpbGRJbnNlcnRlZExpc3RlbmVyICk7XHJcbiAgICAgIHRoaXMubm9kZS5jaGlsZFJlbW92ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLmNoaWxkUmVtb3ZlZExpc3RlbmVyICk7XHJcbiAgICAgIHRoaXMubm9kZS5jaGlsZHJlblJlb3JkZXJlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuY2hpbGRyZW5SZW9yZGVyZWRMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLm5vZGUudmlzaWJsZVByb3BlcnR5LmxhenlMaW5rKCB0aGlzLnZpc2liaWxpdHlMaXN0ZW5lciApO1xyXG5cclxuICAgICAgLy8gTWFya3MgYWxsIHZpc2liaWxpdHkgZGlydHkgd2hlbiB2b2ljaW5nVmlzaWJsZSBjaGFuZ2VzIHRvIGNhdXNlIG5lY2Vzc2FyeSB1cGRhdGVzIGZvciB2b2ljaW5nVmlzaWJsZVxyXG4gICAgICB0aGlzLm5vZGUudm9pY2luZ1Zpc2libGVQcm9wZXJ0eS5sYXp5TGluayggdGhpcy52aXNpYmlsaXR5TGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIHRoaXMubm9kZS5maWx0ZXJDaGFuZ2VFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLm1hcmtSZW5kZXJTdGF0ZURpcnR5TGlzdGVuZXIgKTtcclxuICAgICAgdGhpcy5ub2RlLmNsaXBBcmVhUHJvcGVydHkubGF6eUxpbmsoIHRoaXMubWFya1JlbmRlclN0YXRlRGlydHlMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLm5vZGUuaW5zdGFuY2VSZWZyZXNoRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5tYXJrUmVuZGVyU3RhdGVEaXJ0eUxpc3RlbmVyICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGRldGFjaE5vZGVMaXN0ZW5lcnMoKSB7XHJcbiAgICB0aGlzLnJlbGF0aXZlVHJhbnNmb3JtLmRldGFjaE5vZGVMaXN0ZW5lcnMoKTtcclxuXHJcbiAgICBpZiAoICF0aGlzLmlzU2hhcmVkQ2FudmFzQ2FjaGVQbGFjZWhvbGRlciApIHtcclxuICAgICAgdGhpcy5ub2RlLmNoaWxkSW5zZXJ0ZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLmNoaWxkSW5zZXJ0ZWRMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLm5vZGUuY2hpbGRSZW1vdmVkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5jaGlsZFJlbW92ZWRMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLm5vZGUuY2hpbGRyZW5SZW9yZGVyZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLmNoaWxkcmVuUmVvcmRlcmVkTGlzdGVuZXIgKTtcclxuICAgICAgdGhpcy5ub2RlLnZpc2libGVQcm9wZXJ0eS51bmxpbmsoIHRoaXMudmlzaWJpbGl0eUxpc3RlbmVyICk7XHJcbiAgICAgIHRoaXMubm9kZS52b2ljaW5nVmlzaWJsZVByb3BlcnR5LnVubGluayggdGhpcy52aXNpYmlsaXR5TGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIHRoaXMubm9kZS5maWx0ZXJDaGFuZ2VFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLm1hcmtSZW5kZXJTdGF0ZURpcnR5TGlzdGVuZXIgKTtcclxuICAgICAgdGhpcy5ub2RlLmNsaXBBcmVhUHJvcGVydHkudW5saW5rKCB0aGlzLm1hcmtSZW5kZXJTdGF0ZURpcnR5TGlzdGVuZXIgKTtcclxuICAgICAgdGhpcy5ub2RlLmluc3RhbmNlUmVmcmVzaEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMubWFya1JlbmRlclN0YXRlRGlydHlMaXN0ZW5lciApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRW5zdXJlIHRoYXQgdGhlIHJlbmRlciBzdGF0ZSBpcyB1cGRhdGVkIGluIHRoZSBuZXh0IHN5bmNUcmVlKClcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIG1hcmtSZW5kZXJTdGF0ZURpcnR5KCkge1xyXG4gICAgdGhpcy5yZW5kZXJTdGF0ZURpcnR5RnJhbWUgPSB0aGlzLmRpc3BsYXkuX2ZyYW1lSWQ7XHJcblxyXG4gICAgLy8gZW5zdXJlIHdlIGFyZW4ndCBwcnVuZWQgKG5vdCBzZXQgb24gdGhpcyBpbnN0YW5jZSwgc2luY2Ugd2UgbWF5IG5vdCBuZWVkIHRvIHZpc2l0IG91ciBjaGlsZHJlbilcclxuICAgIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50Lm1hcmtTa2lwUHJ1bmluZygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRW5zdXJlIHRoYXQgdGhpcyBpbnN0YW5jZSBhbmQgaXRzIGNoaWxkcmVuIHdpbGwgYmUgdmlzaXRlZCBpbiB0aGUgbmV4dCBzeW5jVHJlZSgpXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBtYXJrU2tpcFBydW5pbmcoKSB7XHJcbiAgICB0aGlzLnNraXBQcnVuaW5nRnJhbWUgPSB0aGlzLmRpc3BsYXkuX2ZyYW1lSWQ7XHJcblxyXG4gICAgLy8gd2FsayBpdCB1cCB0byB0aGUgcm9vdFxyXG4gICAgdGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQubWFya1NraXBQcnVuaW5nKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBOT1RFOiB1c2VkIGluIENhbnZhc0Jsb2NrIGludGVybmFscywgcGVyZm9ybWFuY2UtY3JpdGljYWwuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0QnJhbmNoSW5kZXhUbyggaW5zdGFuY2UgKSB7XHJcbiAgICBjb25zdCBjYWNoZWRWYWx1ZSA9IHRoaXMuYnJhbmNoSW5kZXhNYXBbIGluc3RhbmNlLmlkIF07XHJcbiAgICBpZiAoIGNhY2hlZFZhbHVlICE9PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgIHJldHVybiBjYWNoZWRWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBicmFuY2hJbmRleCA9IHRoaXMudHJhaWwuZ2V0QnJhbmNoSW5kZXhUbyggaW5zdGFuY2UudHJhaWwgKTtcclxuICAgIHRoaXMuYnJhbmNoSW5kZXhNYXBbIGluc3RhbmNlLmlkIF0gPSBicmFuY2hJbmRleDtcclxuICAgIGluc3RhbmNlLmJyYW5jaEluZGV4TWFwWyB0aGlzLmlkIF0gPSBicmFuY2hJbmRleDtcclxuICAgIHRoaXMuYnJhbmNoSW5kZXhSZWZlcmVuY2VzLnB1c2goIGluc3RhbmNlICk7XHJcbiAgICBpbnN0YW5jZS5icmFuY2hJbmRleFJlZmVyZW5jZXMucHVzaCggdGhpcyApO1xyXG5cclxuICAgIHJldHVybiBicmFuY2hJbmRleDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFuIHVwIGxpc3RlbmVycyBhbmQgZ2FyYmFnZSwgc28gdGhhdCB3ZSBjYW4gYmUgcmVjeWNsZWQgKG9yIHBvb2xlZClcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlKCBgZGlzcG9zZSAke3RoaXMudG9TdHJpbmcoKX1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5hY3RpdmUsICdTZWVtcyBsaWtlIHdlIHRyaWVkIHRvIGRpc3Bvc2UgdGhpcyBJbnN0YW5jZSB0d2ljZSwgaXQgaXMgbm90IGFjdGl2ZScgKTtcclxuXHJcbiAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgIC8vIFJlbW92ZSB0aGUgYmlkaXJlY3Rpb25hbCBicmFuY2ggaW5kZXggcmVmZXJlbmNlIGRhdGEgZnJvbSB0aGlzIGluc3RhbmNlIGFuZCBhbnkgcmVmZXJlbmNlZCBpbnN0YW5jZXMuXHJcbiAgICB3aGlsZSAoIHRoaXMuYnJhbmNoSW5kZXhSZWZlcmVuY2VzLmxlbmd0aCApIHtcclxuICAgICAgY29uc3QgcmVmZXJlbmNlSW5zdGFuY2UgPSB0aGlzLmJyYW5jaEluZGV4UmVmZXJlbmNlcy5wb3AoKTtcclxuICAgICAgZGVsZXRlIHRoaXMuYnJhbmNoSW5kZXhNYXBbIHJlZmVyZW5jZUluc3RhbmNlLmlkIF07XHJcbiAgICAgIGRlbGV0ZSByZWZlcmVuY2VJbnN0YW5jZS5icmFuY2hJbmRleE1hcFsgdGhpcy5pZCBdO1xyXG4gICAgICBhcnJheVJlbW92ZSggcmVmZXJlbmNlSW5zdGFuY2UuYnJhbmNoSW5kZXhSZWZlcmVuY2VzLCB0aGlzICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gb3JkZXIgaXMgc29tZXdoYXQgaW1wb3J0YW50XHJcbiAgICB0aGlzLmdyb3VwRHJhd2FibGUgJiYgdGhpcy5ncm91cERyYXdhYmxlLmRpc3Bvc2VJbW1lZGlhdGVseSggdGhpcy5kaXNwbGF5ICk7XHJcbiAgICB0aGlzLnNoYXJlZENhY2hlRHJhd2FibGUgJiYgdGhpcy5zaGFyZWRDYWNoZURyYXdhYmxlLmRpc3Bvc2VJbW1lZGlhdGVseSggdGhpcy5kaXNwbGF5ICk7XHJcbiAgICB0aGlzLnNlbGZEcmF3YWJsZSAmJiB0aGlzLnNlbGZEcmF3YWJsZS5kaXNwb3NlSW1tZWRpYXRlbHkoIHRoaXMuZGlzcGxheSApO1xyXG5cclxuICAgIC8vIERpc3Bvc2UgdGhlIHJlc3Qgb2Ygb3VyIHN1YnRyZWVcclxuICAgIGNvbnN0IG51bUNoaWxkcmVuID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1DaGlsZHJlbjsgaSsrICkge1xyXG4gICAgICB0aGlzLmNoaWxkcmVuWyBpIF0uZGlzcG9zZSgpO1xyXG4gICAgfVxyXG4gICAgLy8gQ2hlY2sgZm9yIGNoaWxkIGluc3RhbmNlcyB0aGF0IHdlcmUgcmVtb3ZlZCAod2UgYXJlIHN0aWxsIHJlc3BvbnNpYmxlIGZvciBkaXNwb3NpbmcgdGhlbSwgc2luY2Ugd2UgZGlkbid0IGdldFxyXG4gICAgLy8gc3luY3RyZWUgdG8gaGFwcGVuIGZvciB0aGVtKS5cclxuICAgIHdoaWxlICggdGhpcy5pbnN0YW5jZVJlbW92YWxDaGVja0xpc3QubGVuZ3RoICkge1xyXG4gICAgICBjb25zdCBjaGlsZCA9IHRoaXMuaW5zdGFuY2VSZW1vdmFsQ2hlY2tMaXN0LnBvcCgpO1xyXG5cclxuICAgICAgLy8gdGhleSBjb3VsZCBoYXZlIGFscmVhZHkgYmVlbiBkaXNwb3NlZCwgc28gd2UgbmVlZCBhIGd1YXJkIGhlcmVcclxuICAgICAgaWYgKCBjaGlsZC5hY3RpdmUgKSB7XHJcbiAgICAgICAgY2hpbGQuZGlzcG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gd2UgZG9uJ3Qgb3JpZ2luYWxseSBhZGQgaW4gdGhlIGxpc3RlbmVyIGlmIHdlIGFyZSBzdGF0ZWxlc3NcclxuICAgIGlmICggIXRoaXMuc3RhdGVsZXNzICkge1xyXG4gICAgICB0aGlzLmRldGFjaE5vZGVMaXN0ZW5lcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm5vZGUucmVtb3ZlSW5zdGFuY2UoIHRoaXMgKTtcclxuXHJcbiAgICAvLyByZWxlYXNlIG91ciByZWZlcmVuY2UgdG8gYSBzaGFyZWQgY2FjaGUgaWYgYXBwbGljYWJsZSwgYW5kIGRpc3Bvc2UgaWYgdGhlcmUgYXJlIG5vIG90aGVyIHJlZmVyZW5jZXNcclxuICAgIGlmICggdGhpcy5zaGFyZWRDYWNoZUluc3RhbmNlICkge1xyXG4gICAgICB0aGlzLnNoYXJlZENhY2hlSW5zdGFuY2UuZXh0ZXJuYWxSZWZlcmVuY2VDb3VudC0tO1xyXG4gICAgICBpZiAoIHRoaXMuc2hhcmVkQ2FjaGVJbnN0YW5jZS5leHRlcm5hbFJlZmVyZW5jZUNvdW50ID09PSAwICkge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLmRpc3BsYXkuX3NoYXJlZENhbnZhc0luc3RhbmNlc1sgdGhpcy5ub2RlLmdldElkKCkgXTtcclxuICAgICAgICB0aGlzLnNoYXJlZENhY2hlSW5zdGFuY2UuZGlzcG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2xlYW4gb3VyIHZhcmlhYmxlcyBvdXQgdG8gcmVsZWFzZSBtZW1vcnlcclxuICAgIHRoaXMuY2xlYW5JbnN0YW5jZSggbnVsbCwgbnVsbCApO1xyXG5cclxuICAgIHRoaXMudmlzaWJsZUVtaXR0ZXIucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XHJcbiAgICB0aGlzLnJlbGF0aXZlVmlzaWJsZUVtaXR0ZXIucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XHJcbiAgICB0aGlzLnNlbGZWaXNpYmxlRW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcclxuICAgIHRoaXMuY2FuVm9pY2VFbWl0dGVyLnJlbW92ZUFsbExpc3RlbmVycygpO1xyXG5cclxuICAgIHRoaXMuZnJlZVRvUG9vbCgpO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGZyYW1lSWRcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFsbG93VmFsaWRhdGlvbk5vdE5lZWRlZENoZWNrc1xyXG4gICAqL1xyXG4gIGF1ZGl0KCBmcmFtZUlkLCBhbGxvd1ZhbGlkYXRpb25Ob3ROZWVkZWRDaGVja3MgKSB7XHJcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XHJcbiAgICAgIGlmICggZnJhbWVJZCA9PT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgIGZyYW1lSWQgPSB0aGlzLmRpc3BsYXkuX2ZyYW1lSWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFzc2VydFNsb3coICF0aGlzLnN0YXRlbGVzcyxcclxuICAgICAgICAnU3RhdGUgaXMgcmVxdWlyZWQgZm9yIGFsbCBkaXNwbGF5IGluc3RhbmNlcycgKTtcclxuXHJcbiAgICAgIGFzc2VydFNsb3coICggdGhpcy5maXJzdERyYXdhYmxlID09PSBudWxsICkgPT09ICggdGhpcy5sYXN0RHJhd2FibGUgPT09IG51bGwgKSxcclxuICAgICAgICAnRmlyc3QvbGFzdCBkcmF3YWJsZXMgbmVlZCB0byBib3RoIGJlIG51bGwgb3Igbm9uLW51bGwnICk7XHJcblxyXG4gICAgICBhc3NlcnRTbG93KCAoICF0aGlzLmlzQmFja2JvbmUgJiYgIXRoaXMuaXNTaGFyZWRDYW52YXNDYWNoZVBsYWNlaG9sZGVyICkgfHwgdGhpcy5ncm91cERyYXdhYmxlLFxyXG4gICAgICAgICdJZiB3ZSBhcmUgYSBiYWNrYm9uZSBvciBzaGFyZWQgY2FjaGUsIHdlIG5lZWQgdG8gaGF2ZSBhIGdyb3VwRHJhd2FibGUgcmVmZXJlbmNlJyApO1xyXG5cclxuICAgICAgYXNzZXJ0U2xvdyggIXRoaXMuaXNTaGFyZWRDYW52YXNDYWNoZVBsYWNlaG9sZGVyIHx8ICF0aGlzLm5vZGUuaXNQYWludGVkKCkgfHwgdGhpcy5zZWxmRHJhd2FibGUsXHJcbiAgICAgICAgJ1dlIG5lZWQgdG8gaGF2ZSBhIHNlbGZEcmF3YWJsZSBpZiB3ZSBhcmUgcGFpbnRlZCBhbmQgbm90IGEgc2hhcmVkIGNhY2hlJyApO1xyXG5cclxuICAgICAgYXNzZXJ0U2xvdyggKCAhdGhpcy5pc1RyYW5zZm9ybWVkICYmICF0aGlzLmlzQ2FudmFzQ2FjaGUgKSB8fCB0aGlzLmdyb3VwRHJhd2FibGUsXHJcbiAgICAgICAgJ1dlIG5lZWQgdG8gaGF2ZSBhIGdyb3VwRHJhd2FibGUgaWYgd2UgYXJlIGEgYmFja2JvbmUgb3IgYW55IHR5cGUgb2YgY2FudmFzIGNhY2hlJyApO1xyXG5cclxuICAgICAgYXNzZXJ0U2xvdyggIXRoaXMuaXNTaGFyZWRDYW52YXNDYWNoZVBsYWNlaG9sZGVyIHx8IHRoaXMuc2hhcmVkQ2FjaGVEcmF3YWJsZSxcclxuICAgICAgICAnV2UgbmVlZCB0byBoYXZlIGEgc2hhcmVkQ2FjaGVEcmF3YWJsZSBpZiB3ZSBhcmUgYSBzaGFyZWQgY2FjaGUnICk7XHJcblxyXG4gICAgICBhc3NlcnRTbG93KCB0aGlzLmFkZFJlbW92ZUNvdW50ZXIgPT09IDAsXHJcbiAgICAgICAgJ091ciBhZGRSZW1vdmVDb3VudGVyIHNob3VsZCBhbHdheXMgYmUgMCBhdCB0aGUgZW5kIG9mIHN5bmNUcmVlJyApO1xyXG5cclxuICAgICAgLy8gdmFsaWRhdGUgdGhlIHN1YnRyZWVcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBjaGlsZEluc3RhbmNlID0gdGhpcy5jaGlsZHJlblsgaSBdO1xyXG5cclxuICAgICAgICBjaGlsZEluc3RhbmNlLmF1ZGl0KCBmcmFtZUlkLCBhbGxvd1ZhbGlkYXRpb25Ob3ROZWVkZWRDaGVja3MgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5yZWxhdGl2ZVRyYW5zZm9ybS5hdWRpdCggZnJhbWVJZCwgYWxsb3dWYWxpZGF0aW9uTm90TmVlZGVkQ2hlY2tzICk7XHJcblxyXG4gICAgICB0aGlzLmZpdHRhYmlsaXR5LmF1ZGl0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBsaWVzIGNoZWNrcyB0byBtYWtlIHN1cmUgb3VyIHZpc2liaWxpdHkgdHJhY2tpbmcgaXMgd29ya2luZyBhcyBleHBlY3RlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHBhcmVudFZpc2libGVcclxuICAgKi9cclxuICBhdWRpdFZpc2liaWxpdHkoIHBhcmVudFZpc2libGUgKSB7XHJcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XHJcbiAgICAgIGNvbnN0IHZpc2libGUgPSBwYXJlbnRWaXNpYmxlICYmIHRoaXMubm9kZS5pc1Zpc2libGUoKTtcclxuICAgICAgY29uc3QgdHJhaWxWaXNpYmxlID0gdGhpcy50cmFpbC5pc1Zpc2libGUoKTtcclxuICAgICAgYXNzZXJ0U2xvdyggdmlzaWJsZSA9PT0gdHJhaWxWaXNpYmxlLCAnVHJhaWwgdmlzaWJpbGl0eSBmYWlsdXJlJyApO1xyXG4gICAgICBhc3NlcnRTbG93KCB2aXNpYmxlID09PSB0aGlzLnZpc2libGUsICdWaXNpYmxlIGZsYWcgZmFpbHVyZScgKTtcclxuXHJcbiAgICAgIGFzc2VydFNsb3coIHRoaXMudm9pY2luZ1Zpc2libGUgPT09IF8ucmVkdWNlKCB0aGlzLnRyYWlsLm5vZGVzLCAoIHZhbHVlLCBub2RlICkgPT4gdmFsdWUgJiYgbm9kZS52b2ljaW5nVmlzaWJsZVByb3BlcnR5LnZhbHVlLCB0cnVlICksXHJcbiAgICAgICAgJ1doZW4gdGhpcyBJbnN0YW5jZSBpcyB2b2ljaW5nVmlzaWJsZTogdHJ1ZSwgYWxsIFRyYWlsIE5vZGVzIG11c3QgYWxzbyBiZSB2b2ljaW5nVmlzaWJsZTogdHJ1ZScgKTtcclxuXHJcbiAgICAgIC8vIHZhbGlkYXRlIHRoZSBzdWJ0cmVlXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgY2hpbGRJbnN0YW5jZSA9IHRoaXMuY2hpbGRyZW5bIGkgXTtcclxuXHJcbiAgICAgICAgY2hpbGRJbnN0YW5jZS5hdWRpdFZpc2liaWxpdHkoIHZpc2libGUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV8bnVsbH0gb2xkRmlyc3REcmF3YWJsZVxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV8bnVsbH0gb2xkTGFzdERyYXdhYmxlXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZXxudWxsfSBuZXdGaXJzdERyYXdhYmxlXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZXxudWxsfSBuZXdMYXN0RHJhd2FibGVcclxuICAgKi9cclxuICBhdWRpdENoYW5nZUludGVydmFscyggb2xkRmlyc3REcmF3YWJsZSwgb2xkTGFzdERyYXdhYmxlLCBuZXdGaXJzdERyYXdhYmxlLCBuZXdMYXN0RHJhd2FibGUgKSB7XHJcbiAgICBpZiAoIG9sZEZpcnN0RHJhd2FibGUgKSB7XHJcbiAgICAgIGxldCBvbGRPbmUgPSBvbGRGaXJzdERyYXdhYmxlO1xyXG5cclxuICAgICAgLy8gc2hvdWxkIGhpdCwgb3Igd2lsbCBoYXZlIE5QRVxyXG4gICAgICB3aGlsZSAoIG9sZE9uZSAhPT0gb2xkTGFzdERyYXdhYmxlICkge1xyXG4gICAgICAgIG9sZE9uZSA9IG9sZE9uZS5vbGROZXh0RHJhd2FibGU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIG5ld0ZpcnN0RHJhd2FibGUgKSB7XHJcbiAgICAgIGxldCBuZXdPbmUgPSBuZXdGaXJzdERyYXdhYmxlO1xyXG5cclxuICAgICAgLy8gc2hvdWxkIGhpdCwgb3Igd2lsbCBoYXZlIE5QRVxyXG4gICAgICB3aGlsZSAoIG5ld09uZSAhPT0gbmV3TGFzdERyYXdhYmxlICkge1xyXG4gICAgICAgIG5ld09uZSA9IG5ld09uZS5uZXh0RHJhd2FibGU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjaGVja0JldHdlZW4oIGEsIGIgKSB7XHJcbiAgICAgIC8vIGhhdmUgdGhlIGJvZHkgb2YgdGhlIGZ1bmN0aW9uIHN0cmlwcGVkIChpdCdzIG5vdCBpbnNpZGUgdGhlIGlmIHN0YXRlbWVudCBkdWUgdG8gSlNIaW50KVxyXG4gICAgICBpZiAoIGFzc2VydFNsb3cgKSB7XHJcbiAgICAgICAgYXNzZXJ0U2xvdyggYSAhPT0gbnVsbCApO1xyXG4gICAgICAgIGFzc2VydFNsb3coIGIgIT09IG51bGwgKTtcclxuXHJcbiAgICAgICAgd2hpbGUgKCBhICE9PSBiICkge1xyXG4gICAgICAgICAgYXNzZXJ0U2xvdyggYS5uZXh0RHJhd2FibGUgPT09IGEub2xkTmV4dERyYXdhYmxlLCAnQ2hhbmdlIGludGVydmFsIG1pc21hdGNoJyApO1xyXG4gICAgICAgICAgYSA9IGEubmV4dERyYXdhYmxlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICggYXNzZXJ0U2xvdyApIHtcclxuICAgICAgY29uc3QgZmlyc3RDaGFuZ2VJbnRlcnZhbCA9IHRoaXMuZmlyc3RDaGFuZ2VJbnRlcnZhbDtcclxuICAgICAgY29uc3QgbGFzdENoYW5nZUludGVydmFsID0gdGhpcy5sYXN0Q2hhbmdlSW50ZXJ2YWw7XHJcblxyXG4gICAgICBpZiAoICFmaXJzdENoYW5nZUludGVydmFsIHx8IGZpcnN0Q2hhbmdlSW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgIT09IG51bGwgKSB7XHJcbiAgICAgICAgYXNzZXJ0U2xvdyggb2xkRmlyc3REcmF3YWJsZSA9PT0gbmV3Rmlyc3REcmF3YWJsZSxcclxuICAgICAgICAgICdJZiB3ZSBoYXZlIG5vIGNoYW5nZXMsIG9yIG91ciBmaXJzdCBjaGFuZ2UgaW50ZXJ2YWwgaXMgbm90IG9wZW4sIG91ciBmaXJzdHMgc2hvdWxkIGJlIHRoZSBzYW1lJyApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggIWxhc3RDaGFuZ2VJbnRlcnZhbCB8fCBsYXN0Q2hhbmdlSW50ZXJ2YWwuZHJhd2FibGVBZnRlciAhPT0gbnVsbCApIHtcclxuICAgICAgICBhc3NlcnRTbG93KCBvbGRMYXN0RHJhd2FibGUgPT09IG5ld0xhc3REcmF3YWJsZSxcclxuICAgICAgICAgICdJZiB3ZSBoYXZlIG5vIGNoYW5nZXMsIG9yIG91ciBsYXN0IGNoYW5nZSBpbnRlcnZhbCBpcyBub3Qgb3Blbiwgb3VyIGxhc3RzIHNob3VsZCBiZSB0aGUgc2FtZScgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCAhZmlyc3RDaGFuZ2VJbnRlcnZhbCApIHtcclxuICAgICAgICBhc3NlcnRTbG93KCAhbGFzdENoYW5nZUludGVydmFsLCAnV2Ugc2hvdWxkIG5vdCBiZSBtaXNzaW5nIG9ubHkgb25lIGNoYW5nZSBpbnRlcnZhbCcgKTtcclxuXHJcbiAgICAgICAgLy8gd2l0aCBubyBjaGFuZ2VzLCBldmVyeXRoaW5nIHNob3VsZCBiZSBpZGVudGljYWxcclxuICAgICAgICBvbGRGaXJzdERyYXdhYmxlICYmIGNoZWNrQmV0d2Vlbiggb2xkRmlyc3REcmF3YWJsZSwgb2xkTGFzdERyYXdhYmxlICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgYXNzZXJ0U2xvdyggbGFzdENoYW5nZUludGVydmFsLCAnV2Ugc2hvdWxkIG5vdCBiZSBtaXNzaW5nIG9ubHkgb25lIGNoYW5nZSBpbnRlcnZhbCcgKTtcclxuXHJcbiAgICAgICAgLy8gZW5kcG9pbnRzXHJcbiAgICAgICAgaWYgKCBmaXJzdENoYW5nZUludGVydmFsLmRyYXdhYmxlQmVmb3JlICE9PSBudWxsICkge1xyXG4gICAgICAgICAgLy8gY2hlY2sgdG8gdGhlIHN0YXJ0IGlmIGFwcGxpY2FibGVcclxuICAgICAgICAgIGNoZWNrQmV0d2Vlbiggb2xkRmlyc3REcmF3YWJsZSwgZmlyc3RDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUJlZm9yZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGxhc3RDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUFmdGVyICE9PSBudWxsICkge1xyXG4gICAgICAgICAgLy8gY2hlY2sgdG8gdGhlIGVuZCBpZiBhcHBsaWNhYmxlXHJcbiAgICAgICAgICBjaGVja0JldHdlZW4oIGxhc3RDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUFmdGVyLCBvbGRMYXN0RHJhd2FibGUgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGJldHdlZW4gY2hhbmdlIGludGVydmFscyAoc2hvdWxkIGFsd2F5cyBiZSBndWFyYW50ZWVkIHRvIGJlIGZpeGVkKVxyXG4gICAgICAgIGxldCBpbnRlcnZhbCA9IGZpcnN0Q2hhbmdlSW50ZXJ2YWw7XHJcbiAgICAgICAgd2hpbGUgKCBpbnRlcnZhbCAmJiBpbnRlcnZhbC5uZXh0Q2hhbmdlSW50ZXJ2YWwgKSB7XHJcbiAgICAgICAgICBjb25zdCBuZXh0SW50ZXJ2YWwgPSBpbnRlcnZhbC5uZXh0Q2hhbmdlSW50ZXJ2YWw7XHJcblxyXG4gICAgICAgICAgYXNzZXJ0U2xvdyggaW50ZXJ2YWwuZHJhd2FibGVBZnRlciAhPT0gbnVsbCApO1xyXG4gICAgICAgICAgYXNzZXJ0U2xvdyggbmV4dEludGVydmFsLmRyYXdhYmxlQmVmb3JlICE9PSBudWxsICk7XHJcblxyXG4gICAgICAgICAgY2hlY2tCZXR3ZWVuKCBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyLCBuZXh0SW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgKTtcclxuXHJcbiAgICAgICAgICBpbnRlcnZhbCA9IG5leHRJbnRlcnZhbDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzdHJpbmcgZm9ybSBvZiB0aGlzIG9iamVjdFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgdG9TdHJpbmcoKSB7XHJcbiAgICByZXR1cm4gYCR7dGhpcy5pZH0jJHt0aGlzLm5vZGUgPyBgJHt0aGlzLm5vZGUuY29uc3RydWN0b3IubmFtZSA/IHRoaXMubm9kZS5jb25zdHJ1Y3Rvci5uYW1lIDogJz8nfSMke3RoaXMubm9kZS5pZH1gIDogJy0nfWA7XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnSW5zdGFuY2UnLCBJbnN0YW5jZSApO1xyXG5cclxuLy8gb2JqZWN0IHBvb2xpbmdcclxuUG9vbGFibGUubWl4SW50byggSW5zdGFuY2UgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEluc3RhbmNlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLGlDQUFpQztBQUN6RCxPQUFPQyxXQUFXLE1BQU0sc0NBQXNDO0FBQzlELE9BQU9DLFVBQVUsTUFBTSxxQ0FBcUM7QUFDNUQsT0FBT0MsUUFBUSxNQUFNLG1DQUFtQztBQUN4RCxTQUFTQyxnQkFBZ0IsRUFBRUMsV0FBVyxFQUFFQyxjQUFjLEVBQUVDLFFBQVEsRUFBRUMsV0FBVyxFQUFFQyx5QkFBeUIsRUFBRUMsaUJBQWlCLEVBQUVDLFFBQVEsRUFBRUMsT0FBTyxFQUFFQyx5QkFBeUIsRUFBRUMsS0FBSyxFQUFFQyxLQUFLLFFBQVEsZUFBZTtBQUU5TSxJQUFJQyxlQUFlLEdBQUcsQ0FBQzs7QUFFdkI7QUFDQSxNQUFNQyx5QkFBeUIsR0FBR04sUUFBUSxDQUFDTyxrQkFBa0IsQ0FDM0RQLFFBQVEsQ0FBQ1EsVUFBVSxFQUNu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