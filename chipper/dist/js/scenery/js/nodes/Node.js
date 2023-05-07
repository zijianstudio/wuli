// Copyright 2012-2023, University of Colorado Boulder

/**
 * A Node for the Scenery scene graph. Supports general directed acyclic graphics (DAGs).
 * Handles multiple layers with assorted types (Canvas 2D, SVG, DOM, WebGL, etc.).
 *
 * ## General description of Nodes
 *
 * In Scenery, the visual output is determined by a group of connected Nodes (generally known as a scene graph).
 * Each Node has a list of 'child' Nodes. When a Node is visually displayed, its child Nodes (children) will also be
 * displayed, along with their children, etc. There is typically one 'root' Node that is passed to the Scenery Display
 * whose descendants (Nodes that can be traced from the root by child relationships) will be displayed.
 *
 * For instance, say there are Nodes named A, B, C, D and E, who have the relationships:
 * - B is a child of A (thus A is a parent of B)
 * - C is a child of A (thus A is a parent of C)
 * - D is a child of C (thus C is a parent of D)
 * - E is a child of C (thus C is a parent of E)
 * where A would be the root Node. This can be visually represented as a scene graph, where a line connects a parent
 * Node to a child Node (where the parent is usually always at the top of the line, and the child is at the bottom):
 * For example:
 *
 *   A
 *  / \
 * B   C
 *    / \
 *   D   E
 *
 * Additionally, in this case:
 * - D is a 'descendant' of A (due to the C being a child of A, and D being a child of C)
 * - A is an 'ancestor' of D (due to the reverse)
 * - C's 'subtree' is C, D and E, which consists of C itself and all of its descendants.
 *
 * Note that Scenery allows some more complicated forms, where Nodes can have multiple parents, e.g.:
 *
 *   A
 *  / \
 * B   C
 *  \ /
 *   D
 *
 * In this case, D has two parents (B and C). Scenery disallows any Node from being its own ancestor or descendant,
 * so that loops are not possible. When a Node has two or more parents, it means that the Node's subtree will typically
 * be displayed twice on the screen. In the above case, D would appear both at B's position and C's position. Each
 * place a Node would be displayed is known as an 'instance'.
 *
 * Each Node has a 'transform' associated with it, which determines how its subtree (that Node and all of its
 * descendants) will be positioned. Transforms can contain:
 * - Translation, which moves the position the subtree is displayed
 * - Scale, which makes the displayed subtree larger or smaller
 * - Rotation, which displays the subtree at an angle
 * - or any combination of the above that uses an affine matrix (more advanced transforms with shear and combinations
 *   are possible).
 *
 * Say we have the following scene graph:
 *
 *   A
 *   |
 *   B
 *   |
 *   C
 *
 * where there are the following transforms:
 * - A has a 'translation' that moves the content 100 pixels to the right
 * - B has a 'scale' that doubles the size of the content
 * - C has a 'rotation' that rotates 180-degrees around the origin
 *
 * If C displays a square that fills the area with 0 <= x <= 10 and 0 <= y <= 10, we can determine the position on
 * the display by applying transforms starting at C and moving towards the root Node (in this case, A):
 * 1. We apply C's rotation to our square, so the filled area will now be -10 <= x <= 0 and -10 <= y <= 0
 * 2. We apply B's scale to our square, so now we have -20 <= x <= 0 and -20 <= y <= 0
 * 3. We apply A's translation to our square, moving it to 80 <= x <= 100 and -20 <= y <= 0
 *
 * Nodes also have a large number of properties that will affect how their entire subtree is rendered, such as
 * visibility, opacity, etc.
 *
 * ## Creating Nodes
 *
 * Generally, there are two types of Nodes:
 * - Nodes that don't display anything, but serve as a container for other Nodes (e.g. Node itself, HBox, VBox)
 * - Nodes that display content, but ALSO serve as a container (e.g. Circle, Image, Text)
 *
 * When a Node is created with the default Node constructor, e.g.:
 *   var node = new Node();
 * then that Node will not display anything by itself.
 *
 * Generally subtypes of Node are used for displaying things, such as Circle, e.g.:
 *   var circle = new Circle( 20 ); // radius of 20
 *
 * Almost all Nodes (with the exception of leaf-only Nodes like Spacer) can contain children.
 *
 * ## Connecting Nodes, and rendering order
 *
 * To make a 'childNode' become a 'parentNode', the typical way is to call addChild():
 *   parentNode.addChild( childNode );
 *
 * To remove this connection, you can call:
 *   parentNode.removeChild( childNode );
 *
 * Adding a child Node with addChild() puts it at the end of parentNode's list of child Nodes. This is important,
 * because the order of children affects what Nodes are drawn on the 'top' or 'bottom' visually. Nodes that are at the
 * end of the list of children are generally drawn on top.
 *
 * This is generally easiest to represent by notating scene graphs with children in order from left to right, thus:
 *
 *   A
 *  / \
 * B   C
 *    / \
 *   D   E
 *
 * would indicate that A's children are [B,C], so C's subtree is drawn ON TOP of B. The same is true of C's children
 * [D,E], so E is drawn on top of D. If a Node itself has content, it is drawn below that of its children (so C itself
 * would be below D and E).
 *
 * This means that for every scene graph, Nodes instances can be ordered from bottom to top. For the above example, the
 * order is:
 * 1. A (on the very bottom visually, may get covered up by other Nodes)
 * 2. B
 * 3. C
 * 4. D
 * 5. E (on the very top visually, may be covering other Nodes)
 *
 * ## Trails
 *
 * For examples where there are multiple parents for some Nodes (also referred to as DAG in some code, as it represents
 * a Directed Acyclic Graph), we need more information about the rendering order (as otherwise Nodes could appear
 * multiple places in the visual bottom-to-top order.
 *
 * A Trail is basically a list of Nodes, where every Node in the list is a child of its previous element, and a parent
 * of its next element. Thus for the scene graph:
 *
 *   A
 *  / \
 * B   C
 *  \ / \
 *   D   E
 *    \ /
 *     F
 *
 * there are actually three instances of F being displayed, with three trails:
 * - [A,B,D,F]
 * - [A,C,D,F]
 * - [A,C,E,F]
 * Note that the trails are essentially listing Nodes used in walking from the root (A) to the relevant Node (F) using
 * connections between parents and children.
 *
 * The trails above are in order from bottom to top (visually), due to the order of children. Thus since A's children
 * are [B,C] in that order, F with the trail [A,B,D,F] is displayed below [A,C,D,F], because C is after B.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import EnabledProperty from '../../../axon/js/EnabledProperty.js';
import Property from '../../../axon/js/Property.js';
import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import TinyForwardingProperty from '../../../axon/js/TinyForwardingProperty.js';
import TinyProperty from '../../../axon/js/TinyProperty.js';
import TinyStaticProperty from '../../../axon/js/TinyStaticProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Transform3 from '../../../dot/js/Transform3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import arrayDifference from '../../../phet-core/js/arrayDifference.js';
import deprecationWarning from '../../../phet-core/js/deprecationWarning.js';
import Tandem from '../../../tandem/js/Tandem.js';
import BooleanIO from '../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import { ACCESSIBILITY_OPTION_KEYS, CanvasContextWrapper, Features, Filter, Image, isHeightSizable, isWidthSizable, Mouse, ParallelDOM, Picker, Renderer, RendererSummary, scenery, serializeConnectedNodes, Trail } from '../imports.js';
import optionize, { combineOptions, optionize3 } from '../../../phet-core/js/optionize.js';
import Utils from '../../../dot/js/Utils.js';
let globalIdCounter = 1;
const scratchBounds2 = Bounds2.NOTHING.copy(); // mutable {Bounds2} used temporarily in methods
const scratchBounds2Extra = Bounds2.NOTHING.copy(); // mutable {Bounds2} used temporarily in methods
const scratchMatrix3 = new Matrix3();
const ENABLED_PROPERTY_TANDEM_NAME = EnabledProperty.TANDEM_NAME;
const VISIBLE_PROPERTY_TANDEM_NAME = 'visibleProperty';
const INPUT_ENABLED_PROPERTY_TANDEM_NAME = 'inputEnabledProperty';
const PHET_IO_STATE_DEFAULT = false;

// Store the number of parents from the single Node instance that has the most parents in the whole runtime.
let maxParentCount = 0;
export const REQUIRES_BOUNDS_OPTION_KEYS = ['leftTop',
// {Vector2} - The upper-left corner of this Node's bounds, see setLeftTop() for more documentation
'centerTop',
// {Vector2} - The top-center of this Node's bounds, see setCenterTop() for more documentation
'rightTop',
// {Vector2} - The upper-right corner of this Node's bounds, see setRightTop() for more documentation
'leftCenter',
// {Vector2} - The left-center of this Node's bounds, see setLeftCenter() for more documentation
'center',
// {Vector2} - The center of this Node's bounds, see setCenter() for more documentation
'rightCenter',
// {Vector2} - The center-right of this Node's bounds, see setRightCenter() for more documentation
'leftBottom',
// {Vector2} - The bottom-left of this Node's bounds, see setLeftBottom() for more documentation
'centerBottom',
// {Vector2} - The middle center of this Node's bounds, see setCenterBottom() for more documentation
'rightBottom',
// {Vector2} - The bottom right of this Node's bounds, see setRightBottom() for more documentation
'left',
// {number} - The left side of this Node's bounds, see setLeft() for more documentation
'right',
// {number} - The right side of this Node's bounds, see setRight() for more documentation
'top',
// {number} - The top side of this Node's bounds, see setTop() for more documentation
'bottom',
// {number} - The bottom side of this Node's bounds, see setBottom() for more documentation
'centerX',
// {number} - The x-center of this Node's bounds, see setCenterX() for more documentation
'centerY' // {number} - The y-center of this Node's bounds, see setCenterY() for more documentation
];

// Node options, in the order they are executed in the constructor/mutate()
const NODE_OPTION_KEYS = ['children',
// List of children to add (in order), see setChildren for more documentation
'cursor',
// CSS cursor to display when over this Node, see setCursor() for more documentation

'phetioVisiblePropertyInstrumented',
// When true, create an instrumented visibleProperty when this Node is instrumented, see setPhetioVisiblePropertyInstrumented() for more documentation
'visibleProperty',
// Sets forwarding of the visibleProperty, see setVisibleProperty() for more documentation
'visible',
// Whether the Node is visible, see setVisible() for more documentation

'pickableProperty',
// Sets forwarding of the pickableProperty, see setPickableProperty() for more documentation
'pickable',
// Whether the Node is pickable, see setPickable() for more documentation

'phetioEnabledPropertyInstrumented',
// When true, create an instrumented enabledProperty when this Node is instrumented, see setPhetioEnabledPropertyInstrumented() for more documentation
'enabledProperty',
// Sets forwarding of the enabledProperty, see setEnabledProperty() for more documentation
'enabled',
// Whether the Node is enabled, see setEnabled() for more documentation

'phetioInputEnabledPropertyInstrumented',
// When true, create an instrumented inputEnabledProperty when this Node is instrumented, see setPhetioInputEnabledPropertyInstrumented() for more documentation
'inputEnabledProperty',
// Sets forwarding of the inputEnabledProperty, see setInputEnabledProperty() for more documentation
'inputEnabled',
// {boolean} Whether input events can reach into this subtree, see setInputEnabled() for more documentation
'inputListeners',
// The input listeners attached to the Node, see setInputListeners() for more documentation
'opacity',
// Opacity of this Node's subtree, see setOpacity() for more documentation
'disabledOpacity',
// A multiplier to the opacity of this Node's subtree when the node is disabled, see setDisabledOpacity() for more documentation
'filters',
// Non-opacity filters, see setFilters() for more documentation
'matrix',
// Transformation matrix of the Node, see setMatrix() for more documentation
'translation',
// x/y translation of the Node, see setTranslation() for more documentation
'x',
// x translation of the Node, see setX() for more documentation
'y',
// y translation of the Node, see setY() for more documentation
'rotation',
// rotation (in radians) of the Node, see setRotation() for more documentation
'scale',
// scale of the Node, see scale() for more documentation
'excludeInvisibleChildrenFromBounds',
// Controls bounds depending on child visibility, see setExcludeInvisibleChildrenFromBounds() for more documentation
'layoutOptions',
// Provided to layout containers for options, see setLayoutOptions() for more documentation
'localBounds',
// bounds of subtree in local coordinate frame, see setLocalBounds() for more documentation
'maxWidth',
// Constrains width of this Node, see setMaxWidth() for more documentation
'maxHeight',
// Constrains height of this Node, see setMaxHeight() for more documentation
'renderer',
// The preferred renderer for this subtree, see setRenderer() for more documentation
'layerSplit',
// Forces this subtree into a layer of its own, see setLayerSplit() for more documentation
'usesOpacity',
// Hint that opacity will be changed, see setUsesOpacity() for more documentation
'cssTransform',
// Hint that can trigger using CSS transforms, see setCssTransform() for more documentation
'excludeInvisible',
// If this is invisible, exclude from DOM, see setExcludeInvisible() for more documentation
'webglScale',
// Hint to adjust WebGL scaling quality for this subtree, see setWebglScale() for more documentation
'preventFit',
// Prevents layers from fitting this subtree, see setPreventFit() for more documentation
'mouseArea',
// Changes the area the mouse can interact with, see setMouseArea() for more documentation
'touchArea',
// Changes the area touches can interact with, see setTouchArea() for more documentation
'clipArea',
// Makes things outside of a shape invisible, see setClipArea() for more documentation
'transformBounds',
// Flag that makes bounds tighter, see setTransformBounds() for more documentation
...REQUIRES_BOUNDS_OPTION_KEYS];
const DEFAULT_OPTIONS = {
  phetioVisiblePropertyInstrumented: true,
  visible: true,
  opacity: 1,
  disabledOpacity: 1,
  pickable: null,
  enabled: true,
  phetioEnabledPropertyInstrumented: false,
  inputEnabled: true,
  phetioInputEnabledPropertyInstrumented: false,
  clipArea: null,
  mouseArea: null,
  touchArea: null,
  cursor: null,
  transformBounds: false,
  maxWidth: null,
  maxHeight: null,
  renderer: null,
  usesOpacity: false,
  layerSplit: false,
  cssTransform: false,
  excludeInvisible: false,
  webglScale: null,
  preventFit: false
};

// Isolated so that we can delay options that are based on bounds of the Node to after construction.
// See https://github.com/phetsims/scenery/issues/1332
// All translation options (includes those based on bounds and those that are not)
// All transform options (includes translation options)
// All base Node options
class Node extends ParallelDOM {
  // NOTE: All member properties with names starting with '_' are assumed to be private/protected!

  // Assigns a unique ID to this Node (allows trails to get a unique list of IDs)

  // All of the Instances tracking this Node

  // All displays where this Node is the root. (scenery-internal)

  // Drawable states that need to be updated on mutations. Generally added by SVG and
  // DOM elements that need to closely track state (possibly by Canvas to maintain dirty state).
  // (scenery-internal)
  // Whether this Node (and its children) will be visible when the scene is updated.
  // Visible Nodes by default will not be pickable either.
  // NOTE: This is fired synchronously when the visibility of the Node is toggled
  // Opacity, in the range from 0 (fully transparent) to 1 (fully opaque).
  // NOTE: This is fired synchronously when the opacity of the Node is toggled
  // Disabled opacity, in the range from 0 (fully transparent) to 1 (fully opaque).
  // Combined with the normal opacity ONLY when the node is disabled.
  // NOTE: This is fired synchronously when the opacity of the Node is toggled
  // See setPickable() and setPickableProperty()
  // NOTE: This is fired synchronously when the pickability of the Node is toggled
  // See setEnabled() and setEnabledProperty()
  // Whether input event listeners on this Node or descendants on a trail will have
  // input listeners. triggered. Note that this does NOT effect picking, and only prevents some listeners from being
  // fired.
  // This Node and all children will be clipped by this shape (in addition to any
  // other clipping shapes). The shape should be in the local coordinate frame.
  // NOTE: This is fired synchronously when the clipArea of the Node is toggled
  // Whether this Node and its subtree can announce content with Voicing and SpeechSynthesis. Though
  // related to Voicing it exists in Node because it is useful to set voicingVisible on a subtree where the
  // root does not compose Voicing. This is not ideal but the entirety of Voicing cannot be composed into every
  // Node because it would produce incorrect behaviors and have a massive memory footprint. See setVoicingVisible()
  // and Voicing.ts for more information about Voicing.
  // Areas for hit intersection. If set on a Node, no descendants can handle events.
  // (scenery-internal)
  // for mouse position in the local coordinate frame
  // for touch and pen position in the local coordinate frame
  // The CSS cursor to be displayed over this Node. null should be the default (inherit) value.
  // Ordered array of child Nodes.
  // (scenery-internal)
  // Unordered array of parent Nodes.
  // (scenery-internal)
  // Whether we will do more accurate (and tight) bounds computations for rotations and shears.
  // Set up the transform reference. we add a listener so that the transform itself can be modified directly
  // by reference, triggering the event notifications for Scenery The reference to the Transform3 will never change.
  // (scenery-internal)
  // Maximum dimensions for the Node's local bounds before a corrective scaling factor is applied to maintain size.
  // The maximum dimensions are always compared to local bounds, and applied "before" the Node's transform.
  // Whenever the local bounds or maximum dimensions of this Node change and it has at least one maximum dimension
  // (width or height), an ideal scale is computed (either the smallest scale for our local bounds to fit the
  // dimension constraints, OR 1, whichever is lower). Then the Node's transform will be scaled (prepended) with
  // a scale adjustment of ( idealScale / alreadyAppliedScaleFactor ).
  // In the simple case where the Node isn't otherwise transformed, this will apply and update the Node's scale so that
  // the Node matches the maximum dimensions, while never scaling over 1. Note that manually applying transforms to
  // the Node is fine, but may make the Node's width greater than the maximum width.
  // NOTE: If a dimension constraint is null, no resizing will occur due to it. If both maxWidth and maxHeight are null,
  // no scale adjustment will be applied.
  //
  // Also note that setting maxWidth/maxHeight is like adding a local bounds listener (will trigger validation of
  // bounds during the updateDisplay step). NOTE: this means updates to the transform (on a local bounds change) will
  // happen when bounds are validated (validateBounds()), which does not happen synchronously on a child's size
  // change. It does happen at least once in updateDisplay() before rendering, and calling validateBounds() can force
  // a re-check and transform.
  // Scale applied due to the maximum dimension constraints.
  // For user input handling (mouse/touch). (scenery-internal)
  // [mutable] Bounds for this Node and its children in the "parent" coordinate frame.
  // NOTE: The reference here will not change, we will just notify using the equivalent static notification method.
  // NOTE: This is fired **asynchronously** (usually as part of a Display.updateDisplay()) when the bounds of the Node
  // is changed.
  // [mutable] Bounds for this Node and its children in the "local" coordinate frame.
  // NOTE: The reference here will not change, we will just notify using the equivalent static notification method.
  // NOTE: This is fired **asynchronously** (usually as part of a Display.updateDisplay()) when the localBounds of
  // the Node is changed.
  // [mutable] Bounds just for children of this Node (and sub-trees), in the "local" coordinate frame.
  // NOTE: The reference here will not change, we will just notify using the equivalent static notification method.
  // NOTE: This is fired **asynchronously** (usually as part of a Display.updateDisplay()) when the childBounds of the
  // Node is changed.
  // [mutable] Bounds just for this Node, in the "local" coordinate frame.
  // NOTE: The reference here will not change, we will just notify using the equivalent static notification method.
  // NOTE: This event can be fired synchronously, and happens with the self-bounds of a Node is changed. This is NOT
  // like the other bounds Properties, which usually fire asynchronously
  // Whether our localBounds have been set (with the ES5 setter/setLocalBounds()) to a custom
  // overridden value. If true, then localBounds itself will not be updated, but will instead always be the
  // overridden value.
  // (scenery-internal)
  // [mutable] Whether invisible children will be excluded from this Node's bounds
  // Options that can be provided to layout managers to adjust positioning for this node.
  // Whether bounds needs to be recomputed to be valid.
  // (scenery-internal)
  // Whether localBounds needs to be recomputed to be valid.
  // (scenery-internal)
  // Whether selfBounds needs to be recomputed to be valid.
  // (scenery-internal)
  // Whether childBounds needs to be recomputed to be valid.
  // (scenery-internal)
  // (scenery-internal)
  // If assertions are enabled
  // If assertions are enabled
  // If assertions are enabled
  // If assertions are enabled
  // Where rendering-specific settings are stored. They are generally modified internally, so there is no ES5 setter
  // for hints.
  // (scenery-internal)
  // This is fired only once for any single operation that may change the children of a Node.
  // For example, if a Node's children are [ a, b ] and setChildren( [ a, x, y, z ] ) is called on it, the
  // childrenChanged event will only be fired once after the entire operation of changing the children is completed.
  // For every single added child Node, emits with {Node} Node, {number} indexOfChild
  // For every single removed child Node, emits with {Node} Node, {number} indexOfChild
  // Provides a given range that may be affected by the reordering
  // Fired whenever a parent is added
  parentAddedEmitter = new TinyEmitter();

  // Fired whenever a parent is removed
  parentRemovedEmitter = new TinyEmitter();

  // Fired synchronously when the transform (transformation matrix) of a Node is changed. Any
  // change to a Node's translation/rotation/scale/etc. will trigger this event.
  // Should be emitted when we need to check full metadata updates directly on Instances,
  // to see if we need to change drawable types, etc.
  // Emitted to when we need to potentially recompute our renderer summary (bitmask flags, or
  // things that could affect descendants)
  // Emitted to when we change filters (either opacity or generalized filters)
  // Fired when an instance is changed (added/removed)
  // Fired when layoutOptions changes
  // A bitmask which specifies which renderers this Node (and only this Node, not its subtree) supports.
  // (scenery-internal)
  // A bitmask-like summary of what renderers and options are supported by this Node and all of its descendants
  // (scenery-internal)
  // So we can traverse only the subtrees that require bounds validation for events firing.
  // This is a sum of the number of events requiring bounds validation on this Node, plus the number of children whose
  // count is non-zero.
  // NOTE: this means that if A has a child B, and B has a boundsEventCount of 5, it only contributes 1 to A's count.
  // This allows us to have changes localized (increasing B's count won't change A or any of A's ancestors), and
  // guarantees that we will know whether a subtree has bounds listeners. Also important: decreasing B's
  // boundsEventCount down to 0 will allow A to decrease its count by 1, without having to check its other children
  // (if we were just using a boolean value, this operation would require A to check if any OTHER children besides
  // B had bounds listeners)
  // (scenery-internal)
  // This signals that we can validateBounds() on this subtree and we don't have to traverse further
  // (scenery-internal)
  // Subcomponent dedicated to hit testing
  // (scenery-internal)
  // There are certain specific cases (in this case due to a11y) where we need
  // to know that a Node is getting removed from its parent BUT that process has not completed yet. It would be ideal
  // to not need this.
  // (scenery-internal)
  // {Object} - A mapping of all of options that require Bounds to be applied properly. Most often these should be set through `mutate` in the end of the construcor instead of being passed through `super()`
  static REQUIRES_BOUNDS_OPTION_KEYS = REQUIRES_BOUNDS_OPTION_KEYS;

  // Used by sceneryDeserialize
  // (scenery-internal)
  // Tracks any layout constraint, so that we can avoid having multiple layout constraints on the same node
  // (and avoid the infinite loops that can happen if that is triggered).
  // (scenery-internal)
  _activeParentLayoutConstraint = null;

  // This is an array of property (setter) names for Node.mutate(), which are also used when creating
  // Nodes with parameter objects.
  //
  // E.g. new phet.scenery.Node( { x: 5, rotation: 20 } ) will create a Path, and apply setters in the order below
  // (node.x = 5; node.rotation = 20)
  //
  // Some special cases exist (for function names). new phet.scenery.Node( { scale: 2 } ) will actually call
  // node.scale( 2 ).
  //
  // The order below is important! Don't change this without knowing the implications.
  //
  // NOTE: Translation-based mutators come before rotation/scale, since typically we think of their operations
  //       occurring "after" the rotation / scaling
  // NOTE: left/right/top/bottom/centerX/centerY are at the end, since they rely potentially on rotation / scaling
  //       changes of bounds that may happen beforehand
  // (scenery-internal)
  // List of all dirty flags that should be available on drawables created from this Node (or
  // subtype). Given a flag (e.g. radius), it indicates the existence of a function
  // drawable.markDirtyRadius() that will indicate to the drawable that the radius has changed.
  // (scenery-internal)
  //
  // Should be overridden by subtypes.
  /**
   * Creates a Node with options.
   *
   * NOTE: Directly created Nodes (not of any subtype, but created with "new Node( ... )") are generally used as
   *       containers, which can hold other Nodes, subtypes of Node that can display things.
   *
   * Node and its subtypes generally have the last constructor parameter reserved for the 'options' object. This is a
   * key-value map that specifies relevant options that are used by Node and subtypes.
   *
   * For example, one of Node's options is bottom, and one of Circle's options is radius. When a circle is created:
   *   var circle = new Circle( {
   *     radius: 10,
   *     bottom: 200
   *   } );
   * This will create a Circle, set its radius (by executing circle.radius = 10, which uses circle.setRadius()), and
   * then will align the bottom of the circle along y=200 (by executing circle.bottom = 200, which uses
   * node.setBottom()).
   *
   * The options are executed in the order specified by each types _mutatorKeys property.
   *
   * The options object is currently not checked to see whether there are property (key) names that are not used, so it
   * is currently legal to do "new Node( { fork_kitchen_spoon: 5 } )".
   *
   * Usually, an option (e.g. 'visible'), when used in a constructor or mutate() call, will directly use the ES5 setter
   * for that property (e.g. node.visible = ...), which generally forwards to a non-ES5 setter function
   * (e.g. node.setVisible( ... )) that is responsible for the behavior. Documentation is generally on these methods
   * (e.g. setVisible), although some methods may be dynamically created to avoid verbosity (like node.leftTop).
   *
   * Sometimes, options invoke a function instead (e.g. 'scale') because the verb and noun are identical. In this case,
   * instead of setting the setter (node.scale = ..., which would override the function), it will instead call
   * the method directly (e.g. node.scale( ... )).
   */
  constructor(options) {
    super();
    this._id = globalIdCounter++;
    this._instances = [];
    this._rootedDisplays = [];
    this._drawables = [];
    this._visibleProperty = new TinyForwardingProperty(DEFAULT_OPTIONS.visible, DEFAULT_OPTIONS.phetioVisiblePropertyInstrumented, this.onVisiblePropertyChange.bind(this));
    this.opacityProperty = new TinyProperty(DEFAULT_OPTIONS.opacity, this.onOpacityPropertyChange.bind(this));
    this.disabledOpacityProperty = new TinyProperty(DEFAULT_OPTIONS.disabledOpacity, this.onDisabledOpacityPropertyChange.bind(this));
    this._pickableProperty = new TinyForwardingProperty(DEFAULT_OPTIONS.pickable, false, this.onPickablePropertyChange.bind(this));
    this._enabledProperty = new TinyForwardingProperty(DEFAULT_OPTIONS.enabled, DEFAULT_OPTIONS.phetioEnabledPropertyInstrumented, this.onEnabledPropertyChange.bind(this));
    this._inputEnabledProperty = new TinyForwardingProperty(DEFAULT_OPTIONS.inputEnabled, DEFAULT_OPTIONS.phetioInputEnabledPropertyInstrumented);
    this.clipAreaProperty = new TinyProperty(DEFAULT_OPTIONS.clipArea);
    this.voicingVisibleProperty = new TinyProperty(true);
    this._mouseArea = DEFAULT_OPTIONS.mouseArea;
    this._touchArea = DEFAULT_OPTIONS.touchArea;
    this._cursor = DEFAULT_OPTIONS.cursor;
    this._children = [];
    this._parents = [];
    this._transformBounds = DEFAULT_OPTIONS.transformBounds;
    this._transform = new Transform3();
    this._transformListener = this.onTransformChange.bind(this);
    this._transform.changeEmitter.addListener(this._transformListener);
    this._maxWidth = DEFAULT_OPTIONS.maxWidth;
    this._maxHeight = DEFAULT_OPTIONS.maxHeight;
    this._appliedScaleFactor = 1;
    this._inputListeners = [];
    this.inputEnabledProperty.lazyLink(this.pdomBoundInputEnabledListener);

    // Add listener count change notifications into these Properties, since we need to know when their number of listeners
    // changes dynamically.
    const boundsListenersAddedOrRemovedListener = this.onBoundsListenersAddedOrRemoved.bind(this);
    const boundsInvalidationListener = this.validateBounds.bind(this);
    const selfBoundsInvalidationListener = this.validateSelfBounds.bind(this);
    this.boundsProperty = new TinyStaticProperty(Bounds2.NOTHING.copy(), boundsInvalidationListener);
    this.boundsProperty.changeCount = boundsListenersAddedOrRemovedListener;
    this.localBoundsProperty = new TinyStaticProperty(Bounds2.NOTHING.copy(), boundsInvalidationListener);
    this.localBoundsProperty.changeCount = boundsListenersAddedOrRemovedListener;
    this.childBoundsProperty = new TinyStaticProperty(Bounds2.NOTHING.copy(), boundsInvalidationListener);
    this.childBoundsProperty.changeCount = boundsListenersAddedOrRemovedListener;
    this.selfBoundsProperty = new TinyStaticProperty(Bounds2.NOTHING.copy(), selfBoundsInvalidationListener);
    this._localBoundsOverridden = false;
    this._excludeInvisibleChildrenFromBounds = false;
    this._layoutOptions = null;
    this._boundsDirty = true;
    this._localBoundsDirty = true;
    this._selfBoundsDirty = true;
    this._childBoundsDirty = true;
    if (assert) {
      // for assertions later to ensure that we are using the same Bounds2 copies as before
      this._originalBounds = this.boundsProperty._value;
      this._originalLocalBounds = this.localBoundsProperty._value;
      this._originalSelfBounds = this.selfBoundsProperty._value;
      this._originalChildBounds = this.childBoundsProperty._value;
    }
    this._filters = [];
    this._hints = {
      renderer: DEFAULT_OPTIONS.renderer === null ? 0 : Renderer.fromName(DEFAULT_OPTIONS.renderer),
      usesOpacity: DEFAULT_OPTIONS.usesOpacity,
      layerSplit: DEFAULT_OPTIONS.layerSplit,
      cssTransform: DEFAULT_OPTIONS.cssTransform,
      fullResolution: false,
      excludeInvisible: DEFAULT_OPTIONS.excludeInvisible,
      webglScale: DEFAULT_OPTIONS.webglScale,
      preventFit: DEFAULT_OPTIONS.preventFit
    };
    this.childrenChangedEmitter = new TinyEmitter();
    this.childInsertedEmitter = new TinyEmitter();
    this.childRemovedEmitter = new TinyEmitter();
    this.childrenReorderedEmitter = new TinyEmitter();
    this.transformEmitter = new TinyEmitter();
    this.instanceRefreshEmitter = new TinyEmitter();
    this.rendererSummaryRefreshEmitter = new TinyEmitter();
    this.filterChangeEmitter = new TinyEmitter();
    this.changedInstanceEmitter = new TinyEmitter();
    this.layoutOptionsChangedEmitter = new TinyEmitter();
    this._rendererBitmask = Renderer.bitmaskNodeDefault;
    this._rendererSummary = new RendererSummary(this);
    this._boundsEventCount = 0;
    this._boundsEventSelfCount = 0;
    this._picker = new Picker(this);
    this._isGettingRemovedFromParent = false;
    if (options) {
      this.mutate(options);
    }
  }

  /**
   * Inserts a child Node at a specific index.
   *
   * node.insertChild( 0, childNode ) will insert the child into the beginning of the children array (on the bottom
   * visually).
   *
   * node.insertChild( node.children.length, childNode ) is equivalent to node.addChild( childNode ), and appends it
   * to the end (top visually) of the children array. It is recommended to use node.addChild when possible.
   *
   * NOTE: overridden by Leaf for some subtypes
   *
   * @param index - Index where the inserted child Node will be after this operation.
   * @param node - The new child to insert.
   * @param [isComposite] - (scenery-internal) If true, the childrenChanged event will not be sent out.
   */
  insertChild(index, node, isComposite) {
    assert && assert(node !== null && node !== undefined, 'insertChild cannot insert a null/undefined child');
    assert && assert(!_.includes(this._children, node), 'Parent already contains child');
    assert && assert(node !== this, 'Cannot add self as a child');
    assert && assert(node._parents !== null, 'Tried to insert a disposed child node?');
    assert && assert(!node.isDisposed, 'Tried to insert a disposed Node');

    // needs to be early to prevent re-entrant children modifications
    this._picker.onInsertChild(node);
    this.changeBoundsEventCount(node._boundsEventCount > 0 ? 1 : 0);
    this._rendererSummary.summaryChange(RendererSummary.bitmaskAll, node._rendererSummary.bitmask);
    node._parents.push(this);
    if (assert && window.phet?.chipper?.queryParameters && isFinite(phet.chipper.queryParameters.parentLimit)) {
      const parentCount = node._parents.length;
      if (maxParentCount < parentCount) {
        maxParentCount = parentCount;
        console.log(`Max Node parents: ${maxParentCount}`);
        assert(maxParentCount <= phet.chipper.queryParameters.parentLimit, `parent count of ${maxParentCount} above ?parentLimit=${phet.chipper.queryParameters.parentLimit}`);
      }
    }
    this._children.splice(index, 0, node);

    // If this added subtree contains PDOM content, we need to notify any relevant displays
    if (!node._rendererSummary.hasNoPDOM()) {
      this.onPDOMAddChild(node);
    }
    node.invalidateBounds();

    // like calling this.invalidateBounds(), but we already marked all ancestors with dirty child bounds
    this._boundsDirty = true;
    this.childInsertedEmitter.emit(node, index);
    node.parentAddedEmitter.emit(this);
    !isComposite && this.childrenChangedEmitter.emit();
    if (assertSlow) {
      this._picker.audit();
    }
    return this; // allow chaining
  }

  /**
   * Appends a child Node to our list of children.
   *
   * The new child Node will be displayed in front (on top) of all of this node's other children.
   *
   * @param node
   * @param [isComposite] - (scenery-internal) If true, the childrenChanged event will not be sent out.
   */
  addChild(node, isComposite) {
    this.insertChild(this._children.length, node, isComposite);
    return this; // allow chaining
  }

  /**
   * Removes a child Node from our list of children, see http://phetsims.github.io/scenery/doc/#node-removeChild
   * Will fail an assertion if the Node is not currently one of our children
   *
   * @param node
   * @param [isComposite] - (scenery-internal) If true, the childrenChanged event will not be sent out.
   */
  removeChild(node, isComposite) {
    assert && assert(node && node instanceof Node, 'Need to call node.removeChild() with a Node.');
    assert && assert(this.hasChild(node), 'Attempted to removeChild with a node that was not a child.');
    const indexOfChild = _.indexOf(this._children, node);
    this.removeChildWithIndex(node, indexOfChild, isComposite);
    return this; // allow chaining
  }

  /**
   * Removes a child Node at a specific index (node.children[ index ]) from our list of children.
   * Will fail if the index is out of bounds.
   *
   * @param index
   * @param [isComposite] - (scenery-internal) If true, the childrenChanged event will not be sent out.
   */
  removeChildAt(index, isComposite) {
    assert && assert(index >= 0);
    assert && assert(index < this._children.length);
    const node = this._children[index];
    this.removeChildWithIndex(node, index, isComposite);
    return this; // allow chaining
  }

  /**
   * Internal method for removing a Node (always has the Node and index).
   *
   * NOTE: overridden by Leaf for some subtypes
   *
   * @param node - The child node to remove from this Node (it's parent)
   * @param indexOfChild - Should satisfy this.children[ indexOfChild ] === node
   * @param [isComposite] - (scenery-internal) If true, the childrenChanged event will not be sent out.
   */
  removeChildWithIndex(node, indexOfChild, isComposite) {
    assert && assert(node && node instanceof Node, 'Need to call node.removeChildWithIndex() with a Node.');
    assert && assert(this.hasChild(node), 'Attempted to removeChild with a node that was not a child.');
    assert && assert(this._children[indexOfChild] === node, 'Incorrect index for removeChildWithIndex');
    assert && assert(node._parents !== null, 'Tried to remove a disposed child node?');
    const indexOfParent = _.indexOf(node._parents, this);
    node._isGettingRemovedFromParent = true;

    // If this added subtree contains PDOM content, we need to notify any relevant displays
    // NOTE: Potentially removes bounds listeners here!
    if (!node._rendererSummary.hasNoPDOM()) {
      this.onPDOMRemoveChild(node);
    }

    // needs to be early to prevent re-entrant children modifications
    this._picker.onRemoveChild(node);
    this.changeBoundsEventCount(node._boundsEventCount > 0 ? -1 : 0);
    this._rendererSummary.summaryChange(node._rendererSummary.bitmask, RendererSummary.bitmaskAll);
    node._parents.splice(indexOfParent, 1);
    this._children.splice(indexOfChild, 1);
    node._isGettingRemovedFromParent = false; // It is "complete"

    this.invalidateBounds();
    this._childBoundsDirty = true; // force recomputation of child bounds after removing a child

    this.childRemovedEmitter.emit(node, indexOfChild);
    node.parentRemovedEmitter.emit(this);
    !isComposite && this.childrenChangedEmitter.emit();
    if (assertSlow) {
      this._picker.audit();
    }
  }

  /**
   * If a child is not at the given index, it is moved to the given index. This reorders the children of this Node so
   * that `this.children[ index ] === node`.
   *
   * @param node - The child Node to move in the order
   * @param index - The desired index (into the children array) of the child.
   */
  moveChildToIndex(node, index) {
    assert && assert(this.hasChild(node), 'Attempted to moveChildToIndex with a node that was not a child.');
    assert && assert(index % 1 === 0 && index >= 0 && index < this._children.length, `Invalid index: ${index}`);
    const currentIndex = this.indexOfChild(node);
    if (this._children[index] !== node) {
      // Apply the actual children change
      this._children.splice(currentIndex, 1);
      this._children.splice(index, 0, node);
      if (!this._rendererSummary.hasNoPDOM()) {
        this.onPDOMReorderedChildren();
      }
      this.childrenReorderedEmitter.emit(Math.min(currentIndex, index), Math.max(currentIndex, index));
      this.childrenChangedEmitter.emit();
    }
    return this;
  }

  /**
   * Removes all children from this Node.
   */
  removeAllChildren() {
    this.setChildren([]);
    return this; // allow chaining
  }

  /**
   * Sets the children of the Node to be equivalent to the passed-in array of Nodes.
   *
   * NOTE: Meant to be overridden in some cases
   */
  setChildren(children) {
    // The implementation is split into basically three stages:
    // 1. Remove current children that are not in the new children array.
    // 2. Reorder children that exist both before/after the change.
    // 3. Insert in new children

    const beforeOnly = []; // Will hold all nodes that will be removed.
    const afterOnly = []; // Will hold all nodes that will be "new" children (added)
    const inBoth = []; // Child nodes that "stay". Will be ordered for the "after" case.
    let i;

    // Compute what things were added, removed, or stay.
    arrayDifference(children, this._children, afterOnly, beforeOnly, inBoth);

    // Remove any nodes that are not in the new children.
    for (i = beforeOnly.length - 1; i >= 0; i--) {
      this.removeChild(beforeOnly[i], true);
    }
    assert && assert(this._children.length === inBoth.length, 'Removing children should not have triggered other children changes');

    // Handle the main reordering (of nodes that "stay")
    let minChangeIndex = -1; // What is the smallest index where this._children[ index ] !== inBoth[ index ]
    let maxChangeIndex = -1; // What is the largest index where this._children[ index ] !== inBoth[ index ]
    for (i = 0; i < inBoth.length; i++) {
      const desired = inBoth[i];
      if (this._children[i] !== desired) {
        this._children[i] = desired;
        if (minChangeIndex === -1) {
          minChangeIndex = i;
        }
        maxChangeIndex = i;
      }
    }
    // If our minChangeIndex is still -1, then none of those nodes that "stay" were reordered. It's important to check
    // for this case, so that `node.children = node.children` is effectively a no-op performance-wise.
    const hasReorderingChange = minChangeIndex !== -1;

    // Immediate consequences/updates from reordering
    if (hasReorderingChange) {
      if (!this._rendererSummary.hasNoPDOM()) {
        this.onPDOMReorderedChildren();
      }
      this.childrenReorderedEmitter.emit(minChangeIndex, maxChangeIndex);
    }

    // Add in "new" children.
    // Scan through the "ending" children indices, adding in things that were in the "afterOnly" part. This scan is
    // done through the children array instead of the afterOnly array (as determining the index in children would
    // then be quadratic in time, which would be unacceptable here). At this point, a forward scan should be
    // sufficient to insert in-place, and should move the least amount of nodes in the array.
    if (afterOnly.length) {
      let afterIndex = 0;
      let after = afterOnly[afterIndex];
      for (i = 0; i < children.length; i++) {
        if (children[i] === after) {
          this.insertChild(i, after, true);
          after = afterOnly[++afterIndex];
        }
      }
    }

    // If we had any changes, send the generic "changed" event.
    if (beforeOnly.length !== 0 || afterOnly.length !== 0 || hasReorderingChange) {
      this.childrenChangedEmitter.emit();
    }

    // Sanity checks to make sure our resulting children array is correct.
    if (assert) {
      for (let j = 0; j < this._children.length; j++) {
        assert(children[j] === this._children[j], 'Incorrect child after setChildren, possibly a reentrancy issue');
      }
    }

    // allow chaining
    return this;
  }

  /**
   * See setChildren() for more information
   */
  set children(value) {
    this.setChildren(value);
  }

  /**
   * See getChildren() for more information
   */
  get children() {
    return this.getChildren();
  }

  /**
   * Returns a defensive copy of the array of direct children of this node, ordered by what is in front (nodes at
   * the end of the array are in front of nodes at the start).
   *
   * Making changes to the returned result will not affect this node's children.
   */
  getChildren() {
    // TODO: ensure we are not triggering this in Scenery code when not necessary!
    return this._children.slice(0); // create a defensive copy
  }

  /**
   * Returns a count of children, without needing to make a defensive copy.
   */
  getChildrenCount() {
    return this._children.length;
  }

  /**
   * Returns a defensive copy of our parents. This is an array of parent nodes that is returned in no particular
   * order (as order is not important here).
   *
   * NOTE: Modifying the returned array will not in any way modify this node's parents.
   */
  getParents() {
    return this._parents.slice(0); // create a defensive copy
  }

  /**
   * See getParents() for more information
   */
  get parents() {
    return this.getParents();
  }

  /**
   * Returns a single parent if it exists, otherwise null (no parents), or an assertion failure (multiple parents).
   */
  getParent() {
    assert && assert(this._parents.length <= 1, 'Cannot call getParent on a node with multiple parents');
    return this._parents.length ? this._parents[0] : null;
  }

  /**
   * See getParent() for more information
   */
  get parent() {
    return this.getParent();
  }

  /**
   * Gets the child at a specific index into the children array.
   */
  getChildAt(index) {
    return this._children[index];
  }

  /**
   * Finds the index of a parent Node in the parents array.
   *
   * @param parent - Should be a parent of this node.
   * @returns - An index such that this.parents[ index ] === parent
   */
  indexOfParent(parent) {
    return _.indexOf(this._parents, parent);
  }

  /**
   * Finds the index of a child Node in the children array.
   *
   * @param child - Should be a child of this node.
   * @returns - An index such that this.children[ index ] === child
   */
  indexOfChild(child) {
    return _.indexOf(this._children, child);
  }

  /**
   * Moves this Node to the front (end) of all of its parents children array.
   */
  moveToFront() {
    _.each(this._parents.slice(), parent => parent.moveChildToFront(this));
    return this; // allow chaining
  }

  /**
   * Moves one of our children to the front (end) of our children array.
   *
   * @param child - Our child to move to the front.
   */
  moveChildToFront(child) {
    return this.moveChildToIndex(child, this._children.length - 1);
  }

  /**
   * Move this node one index forward in each of its parents.  If the Node is already at the front, this is a no-op.
   */
  moveForward() {
    this._parents.forEach(parent => parent.moveChildForward(this)); // TODO: Do we need slice like moveToFront has?
    return this; // chaining
  }

  /**
   * Moves the specified child forward by one index.  If the child is already at the front, this is a no-op.
   */
  moveChildForward(child) {
    const index = this.indexOfChild(child);
    if (index < this.getChildrenCount() - 1) {
      this.moveChildToIndex(child, index + 1);
    }
    return this; // chaining
  }

  /**
   * Move this node one index backward in each of its parents.  If the Node is already at the back, this is a no-op.
   */
  moveBackward() {
    this._parents.forEach(parent => parent.moveChildBackward(this)); // TODO: Do we need slice like moveToFront has?
    return this; // chaining
  }

  /**
   * Moves the specified child forward by one index.  If the child is already at the back, this is a no-op.
   */
  moveChildBackward(child) {
    const index = this.indexOfChild(child);
    if (index > 0) {
      this.moveChildToIndex(child, index - 1);
    }
    return this; // chaining
  }

  /**
   * Moves this Node to the back (front) of all of its parents children array.
   */
  moveToBack() {
    _.each(this._parents.slice(), parent => parent.moveChildToBack(this));
    return this; // allow chaining
  }

  /**
   * Moves one of our children to the back (front) of our children array.
   *
   * @param child - Our child to move to the back.
   */
  moveChildToBack(child) {
    return this.moveChildToIndex(child, 0);
  }

  /**
   * Replace a child in this node's children array with another node. If the old child had DOM focus and
   * the new child is focusable, the new child will receive focus after it is added.
   */
  replaceChild(oldChild, newChild) {
    assert && assert(this.hasChild(oldChild), 'Attempted to replace a node that was not a child.');

    // information that needs to be restored
    const index = this.indexOfChild(oldChild);
    const oldChildFocused = oldChild.focused;
    this.removeChild(oldChild, true);
    this.insertChild(index, newChild, true);
    this.childrenChangedEmitter.emit();
    if (oldChildFocused && newChild.focusable) {
      newChild.focus();
    }
    return this; // allow chaining
  }

  /**
   * Removes this Node from all of its parents.
   */
  detach() {
    _.each(this._parents.slice(0), parent => parent.removeChild(this));
    return this; // allow chaining
  }

  /**
   * Update our event count, usually by 1 or -1. See documentation on _boundsEventCount in constructor.
   *
   * @param n - How to increment/decrement the bounds event listener count
   */
  changeBoundsEventCount(n) {
    if (n !== 0) {
      const zeroBefore = this._boundsEventCount === 0;
      this._boundsEventCount += n;
      assert && assert(this._boundsEventCount >= 0, 'subtree bounds event count should be guaranteed to be >= 0');
      const zeroAfter = this._boundsEventCount === 0;
      if (zeroBefore !== zeroAfter) {
        // parents will only have their count
        const parentDelta = zeroBefore ? 1 : -1;
        const len = this._parents.length;
        for (let i = 0; i < len; i++) {
          this._parents[i].changeBoundsEventCount(parentDelta);
        }
      }
    }
  }

  /**
   * Ensures that the cached selfBounds of this Node is accurate. Returns true if any sort of dirty flag was set
   * before this was called.
   *
   * @returns - Was the self-bounds potentially updated?
   */
  validateSelfBounds() {
    // validate bounds of ourself if necessary
    if (this._selfBoundsDirty) {
      const oldSelfBounds = scratchBounds2.set(this.selfBoundsProperty._value);

      // Rely on an overloadable method to accomplish computing our self bounds. This should update
      // this.selfBounds itself, returning whether it was actually changed. If it didn't change, we don't want to
      // send a 'selfBounds' event.
      const didSelfBoundsChange = this.updateSelfBounds();
      this._selfBoundsDirty = false;
      if (didSelfBoundsChange) {
        this.selfBoundsProperty.notifyListeners(oldSelfBounds);
      }
      return true;
    }
    return false;
  }

  /**
   * Ensures that cached bounds stored on this Node (and all children) are accurate. Returns true if any sort of dirty
   * flag was set before this was called.
   *
   * @returns - Was something potentially updated?
   */
  validateBounds() {
    sceneryLog && sceneryLog.bounds && sceneryLog.bounds(`validateBounds #${this._id}`);
    sceneryLog && sceneryLog.bounds && sceneryLog.push();
    let i;
    const notificationThreshold = 1e-13;
    let wasDirtyBefore = this.validateSelfBounds();

    // We're going to directly mutate these instances
    const ourChildBounds = this.childBoundsProperty._value;
    const ourLocalBounds = this.localBoundsProperty._value;
    const ourSelfBounds = this.selfBoundsProperty._value;
    const ourBounds = this.boundsProperty._value;

    // validate bounds of children if necessary
    if (this._childBoundsDirty) {
      wasDirtyBefore = true;
      sceneryLog && sceneryLog.bounds && sceneryLog.bounds('childBounds dirty');

      // have each child validate their own bounds
      i = this._children.length;
      while (i--) {
        const child = this._children[i];

        // Reentrancy might cause the child to be removed
        if (child) {
          child.validateBounds();
        }
      }

      // and recompute our childBounds
      const oldChildBounds = scratchBounds2.set(ourChildBounds); // store old value in a temporary Bounds2
      ourChildBounds.set(Bounds2.NOTHING); // initialize to a value that can be unioned with includeBounds()

      i = this._children.length;
      while (i--) {
        const child = this._children[i];

        // Reentrancy might cause the child to be removed
        if (child && !this._excludeInvisibleChildrenFromBounds || child.isVisible()) {
          ourChildBounds.includeBounds(child.bounds);
        }
      }

      // run this before firing the event
      this._childBoundsDirty = false;
      sceneryLog && sceneryLog.bounds && sceneryLog.bounds(`childBounds: ${ourChildBounds}`);
      if (!ourChildBounds.equals(oldChildBounds)) {
        // notifies only on an actual change
        if (!ourChildBounds.equalsEpsilon(oldChildBounds, notificationThreshold)) {
          this.childBoundsProperty.notifyListeners(oldChildBounds); // RE-ENTRANT CALL HERE, it will validateBounds()
        }
      }

      // WARNING: Think twice before adding code here below the listener notification. The notifyListeners() call can
      // trigger re-entrancy, so this function needs to work when that happens. DO NOT set things based on local
      // variables here.
    }

    if (this._localBoundsDirty) {
      wasDirtyBefore = true;
      sceneryLog && sceneryLog.bounds && sceneryLog.bounds('localBounds dirty');
      this._localBoundsDirty = false; // we only need this to set local bounds as dirty

      const oldLocalBounds = scratchBounds2.set(ourLocalBounds); // store old value in a temporary Bounds2

      // Only adjust the local bounds if it is not overridden
      if (!this._localBoundsOverridden) {
        // local bounds are a union between our self bounds and child bounds
        ourLocalBounds.set(ourSelfBounds).includeBounds(ourChildBounds);

        // apply clipping to the bounds if we have a clip area (all done in the local coordinate frame)
        const clipArea = this.clipArea;
        if (clipArea) {
          ourLocalBounds.constrainBounds(clipArea.bounds);
        }
      }
      sceneryLog && sceneryLog.bounds && sceneryLog.bounds(`localBounds: ${ourLocalBounds}`);

      // NOTE: we need to update max dimensions still even if we are setting overridden localBounds
      // adjust our transform to match maximum bounds if necessary on a local bounds change
      if (this._maxWidth !== null || this._maxHeight !== null) {
        // needs to run before notifications below, otherwise reentrancy that hits this codepath will have its
        // updateMaxDimension overridden by the eventual original function call, with the now-incorrect local bounds.
        // See https://github.com/phetsims/joist/issues/725
        this.updateMaxDimension(ourLocalBounds);
      }
      if (!ourLocalBounds.equals(oldLocalBounds)) {
        // sanity check, see https://github.com/phetsims/scenery/issues/1071, we're running this before the localBounds
        // listeners are notified, to support limited re-entrance.
        this._boundsDirty = true;
        if (!ourLocalBounds.equalsEpsilon(oldLocalBounds, notificationThreshold)) {
          this.localBoundsProperty.notifyListeners(oldLocalBounds); // RE-ENTRANT CALL HERE, it will validateBounds()
        }
      }

      // WARNING: Think twice before adding code here below the listener notification. The notifyListeners() call can
      // trigger re-entrancy, so this function needs to work when that happens. DO NOT set things based on local
      // variables here.
    }

    // TODO: layout here?

    if (this._boundsDirty) {
      wasDirtyBefore = true;
      sceneryLog && sceneryLog.bounds && sceneryLog.bounds('bounds dirty');

      // run this before firing the event
      this._boundsDirty = false;
      const oldBounds = scratchBounds2.set(ourBounds); // store old value in a temporary Bounds2

      // no need to do the more expensive bounds transformation if we are still axis-aligned
      if (this._transformBounds && !this._transform.getMatrix().isAxisAligned()) {
        // mutates the matrix and bounds during recursion

        const matrix = scratchMatrix3.set(this.getMatrix()); // calls below mutate this matrix
        ourBounds.set(Bounds2.NOTHING);
        // Include each painted self individually, transformed with the exact transform matrix.
        // This is expensive, as we have to do 2 matrix transforms for every descendant.
        this._includeTransformedSubtreeBounds(matrix, ourBounds); // self and children

        const clipArea = this.clipArea;
        if (clipArea) {
          ourBounds.constrainBounds(clipArea.getBoundsWithTransform(matrix));
        }
      } else {
        // converts local to parent bounds. mutable methods used to minimize number of created bounds instances
        // (we create one so we don't change references to the old one)
        ourBounds.set(ourLocalBounds);
        this.transformBoundsFromLocalToParent(ourBounds);
      }
      sceneryLog && sceneryLog.bounds && sceneryLog.bounds(`bounds: ${ourBounds}`);
      if (!ourBounds.equals(oldBounds)) {
        // if we have a bounds change, we need to invalidate our parents so they can be recomputed
        i = this._parents.length;
        while (i--) {
          this._parents[i].invalidateBounds();
        }

        // TODO: consider changing to parameter object (that may be a problem for the GC overhead)
        if (!ourBounds.equalsEpsilon(oldBounds, notificationThreshold)) {
          this.boundsProperty.notifyListeners(oldBounds); // RE-ENTRANT CALL HERE, it will validateBounds()
        }
      }

      // WARNING: Think twice before adding code here below the listener notification. The notifyListeners() call can
      // trigger re-entrancy, so this function needs to work when that happens. DO NOT set things based on local
      // variables here.
    }

    // if there were side-effects, run the validation again until we are clean
    if (this._childBoundsDirty || this._boundsDirty) {
      sceneryLog && sceneryLog.bounds && sceneryLog.bounds('revalidation');

      // TODO: if there are side-effects in listeners, this could overflow the stack. we should report an error
      // instead of locking up
      this.validateBounds(); // RE-ENTRANT CALL HERE, it will validateBounds()
    }

    if (assert) {
      assert(this._originalBounds === this.boundsProperty._value, 'Reference for bounds changed!');
      assert(this._originalLocalBounds === this.localBoundsProperty._value, 'Reference for localBounds changed!');
      assert(this._originalSelfBounds === this.selfBoundsProperty._value, 'Reference for selfBounds changed!');
      assert(this._originalChildBounds === this.childBoundsProperty._value, 'Reference for childBounds changed!');
    }

    // double-check that all of our bounds handling has been accurate
    if (assertSlow) {
      // new scope for safety
      (() => {
        const epsilon = 0.000001;
        const childBounds = Bounds2.NOTHING.copy();
        _.each(this._children, child => {
          if (!this._excludeInvisibleChildrenFromBounds || child.isVisible()) {
            childBounds.includeBounds(child.boundsProperty._value);
          }
        });
        let localBounds = this.selfBoundsProperty._value.union(childBounds);
        const clipArea = this.clipArea;
        if (clipArea) {
          localBounds = localBounds.intersection(clipArea.bounds);
        }
        const fullBounds = this.localToParentBounds(localBounds);
        assertSlow && assertSlow(this.childBoundsProperty._value.equalsEpsilon(childBounds, epsilon), `Child bounds mismatch after validateBounds: ${this.childBoundsProperty._value.toString()}, expected: ${childBounds.toString()}`);
        assertSlow && assertSlow(this._localBoundsOverridden || this._transformBounds || this.boundsProperty._value.equalsEpsilon(fullBounds, epsilon), `Bounds mismatch after validateBounds: ${this.boundsProperty._value.toString()}, expected: ${fullBounds.toString()}. This could have happened if a bounds instance owned by a Node` + ' was directly mutated (e.g. bounds.erode())');
      })();
    }
    sceneryLog && sceneryLog.bounds && sceneryLog.pop();
    return wasDirtyBefore; // whether any dirty flags were set
  }

  /**
   * Recursion for accurate transformed bounds handling. Mutates bounds with the added bounds.
   * Mutates the matrix (parameter), but mutates it back to the starting point (within floating-point error).
   */
  _includeTransformedSubtreeBounds(matrix, bounds) {
    if (!this.selfBounds.isEmpty()) {
      bounds.includeBounds(this.getTransformedSelfBounds(matrix));
    }
    const numChildren = this._children.length;
    for (let i = 0; i < numChildren; i++) {
      const child = this._children[i];
      matrix.multiplyMatrix(child._transform.getMatrix());
      child._includeTransformedSubtreeBounds(matrix, bounds);
      matrix.multiplyMatrix(child._transform.getInverse());
    }
    return bounds;
  }

  /**
   * Traverses this subtree and validates bounds only for subtrees that have bounds listeners (trying to exclude as
   * much as possible for performance). This is done so that we can do the minimum bounds validation to prevent any
   * bounds listeners from being triggered in further validateBounds() calls without other Node changes being done.
   * This is required for Display's atomic (non-reentrant) updateDisplay(), so that we don't accidentally trigger
   * bounds listeners while computing bounds during updateDisplay(). (scenery-internal)
   *
   * NOTE: this should pass by (ignore) any overridden localBounds, to trigger listeners below.
   */
  validateWatchedBounds() {
    // Since a bounds listener on one of the roots could invalidate bounds on the other, we need to keep running this
    // until they are all clean. Otherwise, side-effects could occur from bounds validations
    // TODO: consider a way to prevent infinite loops here that occur due to bounds listeners triggering cycles
    while (this.watchedBoundsScan()) {
      // do nothing
    }
  }

  /**
   * Recursive function for validateWatchedBounds. Returned whether any validateBounds() returned true (means we have
   * to traverse again) - scenery-internal
   *
   * @returns - Whether there could have been any changes.
   */
  watchedBoundsScan() {
    if (this._boundsEventSelfCount !== 0) {
      // we are a root that should be validated. return whether we updated anything
      return this.validateBounds();
    } else if (this._boundsEventCount > 0 && this._childBoundsDirty) {
      // descendants have watched bounds, traverse!
      let changed = false;
      const numChildren = this._children.length;
      for (let i = 0; i < numChildren; i++) {
        changed = this._children[i].watchedBoundsScan() || changed;
      }
      return changed;
    } else {
      // if _boundsEventCount is zero, no bounds are watched below us (don't traverse), and it wasn't changed
      return false;
    }
  }

  /**
   * Marks the bounds of this Node as invalid, so they are recomputed before being accessed again.
   */
  invalidateBounds() {
    // TODO: sometimes we won't need to invalidate local bounds! it's not too much of a hassle though?
    this._boundsDirty = true;
    this._localBoundsDirty = true;

    // and set flags for all ancestors
    let i = this._parents.length;
    while (i--) {
      this._parents[i].invalidateChildBounds();
    }
  }

  /**
   * Recursively tag all ancestors with _childBoundsDirty (scenery-internal)
   */
  invalidateChildBounds() {
    // don't bother updating if we've already been tagged
    if (!this._childBoundsDirty) {
      this._childBoundsDirty = true;
      this._localBoundsDirty = true;
      let i = this._parents.length;
      while (i--) {
        this._parents[i].invalidateChildBounds();
      }
    }
  }

  /**
   * Should be called to notify that our selfBounds needs to change to this new value.
   */
  invalidateSelf(newSelfBounds) {
    assert && assert(newSelfBounds === undefined || newSelfBounds instanceof Bounds2, 'invalidateSelf\'s newSelfBounds, if provided, needs to be Bounds2');
    const ourSelfBounds = this.selfBoundsProperty._value;

    // If no self bounds are provided, rely on the bounds validation to trigger computation (using updateSelfBounds()).
    if (!newSelfBounds) {
      this._selfBoundsDirty = true;
      this.invalidateBounds();
      this._picker.onSelfBoundsDirty();
    }
    // Otherwise, set the self bounds directly
    else {
      assert && assert(newSelfBounds.isEmpty() || newSelfBounds.isFinite(), 'Bounds must be empty or finite in invalidateSelf');

      // Don't recompute the self bounds
      this._selfBoundsDirty = false;

      // if these bounds are different than current self bounds
      if (!ourSelfBounds.equals(newSelfBounds)) {
        const oldSelfBounds = scratchBounds2.set(ourSelfBounds);

        // set repaint flags
        this.invalidateBounds();
        this._picker.onSelfBoundsDirty();

        // record the new bounds
        ourSelfBounds.set(newSelfBounds);

        // fire the event immediately
        this.selfBoundsProperty.notifyListeners(oldSelfBounds);
      }
    }
    if (assertSlow) {
      this._picker.audit();
    }
  }

  /**
   * Meant to be overridden by Node sub-types to compute self bounds (if invalidateSelf() with no arguments was called).
   *
   * @returns - Whether the self bounds changed.
   */
  updateSelfBounds() {
    // The Node implementation (un-overridden) will never change the self bounds (always NOTHING).
    assert && assert(this.selfBoundsProperty._value.equals(Bounds2.NOTHING));
    return false;
  }

  /**
   * Returns whether a Node is a child of this node.
   *
   * @returns - Whether potentialChild is actually our child.
   */
  hasChild(potentialChild) {
    assert && assert(potentialChild && potentialChild instanceof Node, 'hasChild needs to be called with a Node');
    const isOurChild = _.includes(this._children, potentialChild);
    assert && assert(isOurChild === _.includes(potentialChild._parents, this), 'child-parent reference should match parent-child reference');
    return isOurChild;
  }

  /**
   * Returns a Shape that represents the area covered by containsPointSelf.
   */
  getSelfShape() {
    const selfBounds = this.selfBounds;
    if (selfBounds.isEmpty()) {
      return new Shape();
    } else {
      return Shape.bounds(this.selfBounds);
    }
  }

  /**
   * Returns our selfBounds (the bounds for this Node's content in the local coordinates, excluding anything from our
   * children and descendants).
   *
   * NOTE: Do NOT mutate the returned value!
   */
  getSelfBounds() {
    return this.selfBoundsProperty.value;
  }

  /**
   * See getSelfBounds() for more information
   */
  get selfBounds() {
    return this.getSelfBounds();
  }

  /**
   * Returns a bounding box that should contain all self content in the local coordinate frame (our normal self bounds
   * aren't guaranteed this for Text, etc.)
   *
   * Override this to provide different behavior.
   */
  getSafeSelfBounds() {
    return this.selfBoundsProperty.value;
  }

  /**
   * See getSafeSelfBounds() for more information
   */
  get safeSelfBounds() {
    return this.getSafeSelfBounds();
  }

  /**
   * Returns the bounding box that should contain all content of our children in our local coordinate frame. Does not
   * include our "self" bounds.
   *
   * NOTE: Do NOT mutate the returned value!
   */
  getChildBounds() {
    return this.childBoundsProperty.value;
  }

  /**
   * See getChildBounds() for more information
   */
  get childBounds() {
    return this.getChildBounds();
  }

  /**
   * Returns the bounding box that should contain all content of our children AND our self in our local coordinate
   * frame.
   *
   * NOTE: Do NOT mutate the returned value!
   */
  getLocalBounds() {
    return this.localBoundsProperty.value;
  }

  /**
   * See getLocalBounds() for more information
   */
  get localBounds() {
    return this.getLocalBounds();
  }

  /**
   * See setLocalBounds() for more information
   */
  set localBounds(value) {
    this.setLocalBounds(value);
  }
  get localBoundsOverridden() {
    return this._localBoundsOverridden;
  }

  /**
   * Allows overriding the value of localBounds (and thus changing things like 'bounds' that depend on localBounds).
   * If it's set to a non-null value, that value will always be used for localBounds until this function is called
   * again. To revert to having Scenery compute the localBounds, set this to null.  The bounds should not be reduced
   * smaller than the visible bounds on the screen.
   */
  setLocalBounds(localBounds) {
    assert && assert(localBounds === null || localBounds instanceof Bounds2, 'localBounds override should be set to either null or a Bounds2');
    assert && assert(localBounds === null || !isNaN(localBounds.minX), 'minX for localBounds should not be NaN');
    assert && assert(localBounds === null || !isNaN(localBounds.minY), 'minY for localBounds should not be NaN');
    assert && assert(localBounds === null || !isNaN(localBounds.maxX), 'maxX for localBounds should not be NaN');
    assert && assert(localBounds === null || !isNaN(localBounds.maxY), 'maxY for localBounds should not be NaN');
    const ourLocalBounds = this.localBoundsProperty._value;
    const oldLocalBounds = ourLocalBounds.copy();
    if (localBounds === null) {
      // we can just ignore this if we weren't actually overriding local bounds before
      if (this._localBoundsOverridden) {
        this._localBoundsOverridden = false;
        this.localBoundsProperty.notifyListeners(oldLocalBounds);
        this.invalidateBounds();
      }
    } else {
      // just an instance check for now. consider equals() in the future depending on cost
      const changed = !localBounds.equals(ourLocalBounds) || !this._localBoundsOverridden;
      if (changed) {
        ourLocalBounds.set(localBounds);
      }
      if (!this._localBoundsOverridden) {
        this._localBoundsOverridden = true; // NOTE: has to be done before invalidating bounds, since this disables localBounds computation
      }

      if (changed) {
        this.localBoundsProperty.notifyListeners(oldLocalBounds);
        this.invalidateBounds();
      }
    }
    return this; // allow chaining
  }

  /**
   * Meant to be overridden in sub-types that have more accurate bounds determination for when we are transformed.
   * Usually rotation is significant here, so that transformed bounds for non-rectangular shapes will be different.
   */
  getTransformedSelfBounds(matrix) {
    // assume that we take up the entire rectangular bounds by default
    return this.selfBounds.transformed(matrix);
  }

  /**
   * Meant to be overridden in sub-types that have more accurate bounds determination for when we are transformed.
   * Usually rotation is significant here, so that transformed bounds for non-rectangular shapes will be different.
   *
   * This should include the "full" bounds that guarantee everything rendered should be inside (e.g. Text, where the
   * normal bounds may not be sufficient).
   */
  getTransformedSafeSelfBounds(matrix) {
    return this.safeSelfBounds.transformed(matrix);
  }

  /**
   * Returns the visual "safe" bounds that are taken up by this Node and its subtree. Notably, this is essentially the
   * combined effects of the "visible" bounds (i.e. invisible nodes do not contribute to bounds), and "safe" bounds
   * (e.g. Text, where we need a larger bounds area to guarantee there is nothing outside). It also tries to "fit"
   * transformed bounds more tightly, where it will handle rotated Path bounds in an improved way.
   *
   * NOTE: This method is not optimized, and may create garbage and not be the fastest.
   *
   * @param [matrix] - If provided, will return the bounds assuming the content is transformed with the
   *                             given matrix.
   */
  getSafeTransformedVisibleBounds(matrix) {
    const localMatrix = (matrix || Matrix3.IDENTITY).timesMatrix(this.matrix);
    const bounds = Bounds2.NOTHING.copy();
    if (this.visibleProperty.value) {
      if (!this.selfBounds.isEmpty()) {
        bounds.includeBounds(this.getTransformedSafeSelfBounds(localMatrix));
      }
      if (this._children.length) {
        for (let i = 0; i < this._children.length; i++) {
          bounds.includeBounds(this._children[i].getSafeTransformedVisibleBounds(localMatrix));
        }
      }
    }
    return bounds;
  }

  /**
   * See getSafeTransformedVisibleBounds() for more information -- This is called without any initial parameter
   */
  get safeTransformedVisibleBounds() {
    return this.getSafeTransformedVisibleBounds();
  }

  /**
   * Sets the flag that determines whether we will require more accurate (and expensive) bounds computation for this
   * node's transform.
   *
   * If set to false (default), Scenery will get the bounds of content, and then if rotated will determine the on-axis
   * bounds that completely cover the rotated bounds (potentially larger than actual content).
   * If set to true, Scenery will try to get the bounds of the actual rotated/transformed content.
   *
   * A good example of when this is necessary is if there are a bunch of nested children that each have pi/4 rotations.
   *
   * @param transformBounds - Whether accurate transform bounds should be used.
   */
  setTransformBounds(transformBounds) {
    if (this._transformBounds !== transformBounds) {
      this._transformBounds = transformBounds;
      this.invalidateBounds();
    }
    return this; // allow chaining
  }

  /**
   * See setTransformBounds() for more information
   */
  set transformBounds(value) {
    this.setTransformBounds(value);
  }

  /**
   * See getTransformBounds() for more information
   */
  get transformBounds() {
    return this.getTransformBounds();
  }

  /**
   * Returns whether accurate transformation bounds are used in bounds computation (see setTransformBounds).
   */
  getTransformBounds() {
    return this._transformBounds;
  }

  /**
   * Returns the bounding box of this Node and all of its sub-trees (in the "parent" coordinate frame).
   *
   * NOTE: Do NOT mutate the returned value!
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */
  getBounds() {
    return this.boundsProperty.value;
  }

  /**
   * See getBounds() for more information
   */
  get bounds() {
    return this.getBounds();
  }

  /**
   * Like getLocalBounds() in the "local" coordinate frame, but includes only visible nodes.
   */
  getVisibleLocalBounds() {
    // defensive copy, since we use mutable modifications below
    const bounds = this.selfBounds.copy();
    let i = this._children.length;
    while (i--) {
      bounds.includeBounds(this._children[i].getVisibleBounds());
    }
    assert && assert(bounds.isFinite() || bounds.isEmpty(), 'Visible bounds should not be infinite');
    return bounds;
  }

  /**
   * See getVisibleLocalBounds() for more information
   */
  get visibleLocalBounds() {
    return this.getVisibleLocalBounds();
  }

  /**
   * Like getBounds() in the "parent" coordinate frame, but includes only visible nodes
   */
  getVisibleBounds() {
    if (this.isVisible()) {
      return this.getVisibleLocalBounds().transform(this.getMatrix());
    } else {
      return Bounds2.NOTHING;
    }
  }

  /**
   * See getVisibleBounds() for more information
   */
  get visibleBounds() {
    return this.getVisibleBounds();
  }

  /**
   * Tests whether the given point is "contained" in this node's subtree (optionally using mouse/touch areas), and if
   * so returns the Trail (rooted at this node) to the top-most (in stacking order) Node that contains the given
   * point.
   *
   * NOTE: This is optimized for the current input system (rather than what gets visually displayed on the screen), so
   * pickability (Node's pickable property, visibility, and the presence of input listeners) all may affect the
   * returned value.
   *
   * For example, hit-testing a simple shape (with no pickability) will return null:
   * > new phet.scenery.Circle( 20 ).hitTest( phet.dot.v2( 0, 0 ) ); // null
   *
   * If the same shape is made to be pickable, it will return a trail:
   * > new phet.scenery.Circle( 20, { pickable: true } ).hitTest( phet.dot.v2( 0, 0 ) );
   * > // returns a Trail with the circle as the only node.
   *
   * It will return the result that is visually stacked on top, so e.g.:
   * > new phet.scenery.Node( {
   * >   pickable: true,
   * >   children: [
   * >     new phet.scenery.Circle( 20 ),
   * >     new phet.scenery.Circle( 15 )
   * >   ]
   * > } ).hitTest( phet.dot.v2( 0, 0 ) ); // returns the "top-most" circle (the one with radius:15).
   *
   * This is used by Scenery's internal input system by calling hitTest on a Display's rootNode with the
   * global-coordinate point.
   *
   * @param point - The point (in the parent coordinate frame) to check against this node's subtree.
   * @param [isMouse] - Whether mouseAreas should be used.
   * @param [isTouch] - Whether touchAreas should be used.
   * @returns - Returns null if the point is not contained in the subtree.
   */
  hitTest(point, isMouse, isTouch) {
    assert && assert(point.isFinite(), 'The point should be a finite Vector2');
    assert && assert(isMouse === undefined || typeof isMouse === 'boolean', 'If isMouse is provided, it should be a boolean');
    assert && assert(isTouch === undefined || typeof isTouch === 'boolean', 'If isTouch is provided, it should be a boolean');
    return this._picker.hitTest(point, !!isMouse, !!isTouch);
  }

  /**
   * Hit-tests what is under the pointer, and returns a {Trail} to that Node (or null if there is no matching node).
   *
   * See hitTest() for more details about what will be returned.
   */
  trailUnderPointer(pointer) {
    return pointer.point === null ? null : this.hitTest(pointer.point, pointer instanceof Mouse, pointer.isTouchLike());
  }

  /**
   * Returns whether a point (in parent coordinates) is contained in this node's sub-tree.
   *
   * See hitTest() for more details about what will be returned.
   *
   * @returns - Whether the point is contained.
   */
  containsPoint(point) {
    return this.hitTest(point) !== null;
  }

  /**
   * Override this for computation of whether a point is inside our self content (defaults to selfBounds check).
   *
   * @param point - Considered to be in the local coordinate frame
   */
  containsPointSelf(point) {
    // if self bounds are not null default to checking self bounds
    return this.selfBounds.containsPoint(point);
  }

  /**
   * Returns whether this node's selfBounds is intersected by the specified bounds.
   *
   * @param bounds - Bounds to test, assumed to be in the local coordinate frame.
   */
  intersectsBoundsSelf(bounds) {
    // if self bounds are not null, child should override this
    return this.selfBounds.intersectsBounds(bounds);
  }
  isPhetioMouseHittable(point) {
    // invisible things cannot be autoselected
    if (!this.visible) {
      return false;
    }

    // unpickable things cannot be autoselected
    if (this.pickable === false) {
      return false;
    }

    // Transform the point in the local coordinate frame, so we can test it with the clipArea/children
    const localPoint = this._transform.getInverse().timesVector2(point);

    // If our point is outside of the local-coordinate clipping area, there should be no hit.
    if (this.clipArea !== null && !this.clipArea.containsPoint(localPoint)) {
      return false;
    }
    return true;
  }

  // Used in Studio Autoselect.  Returns an instrumented PhET-iO Element Node if possible.
  // Adapted from Picker.recursiveHitTest
  // @returns - may not be a Node.  For instance, ThreeIsometricNode hits Mass instances
  getPhetioMouseHit(point) {
    if (!this.isPhetioMouseHittable(point)) {
      return null;
    }

    // Transform the point in the local coordinate frame, so we can test it with the clipArea/children
    const localPoint = this._transform.getInverse().timesVector2(point);

    // Check children before our "self", since the children are rendered on top.
    // Manual iteration here so we can return directly, and so we can iterate backwards (last node is in front).
    for (let i = this._children.length - 1; i >= 0; i--) {
      const child = this._children[i];
      const childHit = child.getPhetioMouseHit(localPoint);

      // If there was a hit, immediately add our node to the start of the Trail (will recursively build the Trail).
      if (childHit) {
        return childHit.isPhetioInstrumented() ? childHit : this;
      }
    }

    // Tests for mouse and touch hit areas before testing containsPointSelf
    if (this._mouseArea) {
      // NOTE: both Bounds2 and Shape have containsPoint! We use both here!
      return this._mouseArea.containsPoint(localPoint) ? this : null;
    }

    // Didn't hit our children, so check ourself as a last resort. Check our selfBounds first, so we can potentially
    // avoid hit-testing the actual object (which may be more expensive).
    if (this.selfBounds.containsPoint(localPoint)) {
      if (this.containsPointSelf(localPoint)) {
        return this;
      }
    }

    // No hit
    return null;
  }

  /**
   * Whether this Node itself is painted (displays something itself). Meant to be overridden.
   */
  isPainted() {
    // Normal nodes don't render anything
    return false;
  }

  /**
   * Whether this Node's selfBounds are considered to be valid (always containing the displayed self content
   * of this node). Meant to be overridden in subtypes when this can change (e.g. Text).
   *
   * If this value would potentially change, please trigger the event 'selfBoundsValid'.
   */
  areSelfBoundsValid() {
    return true;
  }

  /**
   * Returns whether this Node has any parents at all.
   */
  hasParent() {
    return this._parents.length !== 0;
  }

  /**
   * Returns whether this Node has any children at all.
   */
  hasChildren() {
    return this._children.length > 0;
  }

  /**
   * Returns whether a child should be included for layout (if this Node is a layout container).
   */
  isChildIncludedInLayout(child) {
    return child.bounds.isValid() && (!this._excludeInvisibleChildrenFromBounds || child.visible);
  }

  /**
   * Calls the callback on nodes recursively in a depth-first manner.
   */
  walkDepthFirst(callback) {
    callback(this);
    const length = this._children.length;
    for (let i = 0; i < length; i++) {
      this._children[i].walkDepthFirst(callback);
    }
  }

  /**
   * Adds an input listener.
   *
   * See Input.js documentation for information about how event listeners are used.
   *
   * Additionally, the following fields are supported on a listener:
   *
   * - interrupt {function()}: When a pointer is interrupted, it will attempt to call this method on the input listener
   * - cursor {string|null}: If node.cursor is null, any non-null cursor of an input listener will effectively
   *                         "override" it. NOTE: this can be implemented as an es5 getter, if the cursor can change
   */
  addInputListener(listener) {
    assert && assert(!_.includes(this._inputListeners, listener), 'Input listener already registered on this Node');
    assert && assert(listener !== null, 'Input listener cannot be null');
    assert && assert(listener !== undefined, 'Input listener cannot be undefined');

    // don't allow listeners to be added multiple times
    if (!_.includes(this._inputListeners, listener)) {
      this._inputListeners.push(listener);
      this._picker.onAddInputListener();
      if (assertSlow) {
        this._picker.audit();
      }
    }
    return this;
  }

  /**
   * Removes an input listener that was previously added with addInputListener.
   */
  removeInputListener(listener) {
    const index = _.indexOf(this._inputListeners, listener);

    // ensure the listener is in our list (ignore assertion for disposal, see https://github.com/phetsims/sun/issues/394)
    assert && assert(this.isDisposed || index >= 0, 'Could not find input listener to remove');
    if (index >= 0) {
      this._inputListeners.splice(index, 1);
      this._picker.onRemoveInputListener();
      if (assertSlow) {
        this._picker.audit();
      }
    }
    return this;
  }

  /**
   * Returns whether this input listener is currently listening to this node.
   *
   * More efficient than checking node.inputListeners, as that includes a defensive copy.
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
   * Interrupts all input listeners that are attached to this node.
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
   * Interrupts all input listeners that are attached to either this node, or a descendant node.
   */
  interruptSubtreeInput() {
    this.interruptInput();
    const children = this._children.slice();
    for (let i = 0; i < children.length; i++) {
      children[i].interruptSubtreeInput();
    }
    return this;
  }

  /**
   * Changes the transform of this Node by adding a transform. The default "appends" the transform, so that it will
   * appear to happen to the Node before the rest of the transform would apply, but if "prepended", the rest of the
   * transform would apply first.
   *
   * As an example, if a Node is centered at (0,0) and scaled by 2:
   * translate( 100, 0 ) would cause the center of the Node (in the parent coordinate frame) to be at (200,0).
   * translate( 100, 0, true ) would cause the center of the Node (in the parent coordinate frame) to be at (100,0).
   *
   * Allowed call signatures:
   * translate( x {number}, y {number} )
   * translate( x {number}, y {number}, prependInstead {boolean} )
   * translate( vector {Vector2} )
   * translate( vector {Vector2}, prependInstead {boolean} )
   *
   * @param x - The x coordinate
   * @param y - The y coordinate
   * @param [prependInstead] - Whether the transform should be prepended (defaults to false)
   */

  // eslint-disable-line @typescript-eslint/explicit-member-accessibility
  translate(x, y, prependInstead) {
    // eslint-disable-line @typescript-eslint/explicit-member-accessibility
    if (typeof x === 'number') {
      // translate( x, y, prependInstead )
      assert && assert(isFinite(x), 'x should be a finite number');
      assert && assert(typeof y === 'number' && isFinite(y), 'y should be a finite number'); // eslint-disable-line no-simple-type-checking-assertions

      if (Math.abs(x) < 1e-12 && Math.abs(y) < 1e-12) {
        return;
      } // bail out if both are zero
      if (prependInstead) {
        this.prependTranslation(x, y);
      } else {
        this.appendMatrix(scratchMatrix3.setToTranslation(x, y));
      }
    } else {
      // translate( vector, prependInstead )
      const vector = x;
      assert && assert(vector.isFinite(), 'translation should be a finite Vector2 if not finite numbers');
      if (!vector.x && !vector.y) {
        return;
      } // bail out if both are zero
      this.translate(vector.x, vector.y, y); // forward to full version
    }
  }

  /**
   * Scales the node's transform. The default "appends" the transform, so that it will
   * appear to happen to the Node before the rest of the transform would apply, but if "prepended", the rest of the
   * transform would apply first.
   *
   * As an example, if a Node is translated to (100,0):
   * scale( 2 ) will leave the Node translated at (100,0), but it will be twice as big around its origin at that location.
   * scale( 2, true ) will shift the Node to (200,0).
   *
   * Allowed call signatures:
   * (s invocation): scale( s {number|Vector2}, [prependInstead] {boolean} )
   * (x,y invocation): scale( x {number}, y {number}, [prependInstead] {boolean} )
   *
   * @param x - (s invocation): {number} scales both dimensions equally, or {Vector2} scales independently
   *          - (x,y invocation): {number} scale for the x-dimension
   * @param [y] - (s invocation): {boolean} prependInstead - Whether the transform should be prepended (defaults to false)
   *            - (x,y invocation): {number} y - scale for the y-dimension
   * @param [prependInstead] - (x,y invocation) Whether the transform should be prepended (defaults to false)
   */

  // eslint-disable-line @typescript-eslint/explicit-member-accessibility

  // eslint-disable-line @typescript-eslint/explicit-member-accessibility
  scale(x, y, prependInstead) {
    // eslint-disable-line @typescript-eslint/explicit-member-accessibility
    if (typeof x === 'number') {
      assert && assert(isFinite(x), 'scales should be finite');
      if (y === undefined || typeof y === 'boolean') {
        // scale( scale, [prependInstead] )
        this.scale(x, x, y);
      } else {
        // scale( x, y, [prependInstead] )
        assert && assert(isFinite(y), 'scales should be finite numbers');
        assert && assert(prependInstead === undefined || typeof prependInstead === 'boolean', 'If provided, prependInstead should be boolean');
        if (x === 1 && y === 1) {
          return;
        } // bail out if we are scaling by 1 (identity)
        if (prependInstead) {
          this.prependMatrix(Matrix3.scaling(x, y));
        } else {
          this.appendMatrix(Matrix3.scaling(x, y));
        }
      }
    } else {
      // scale( vector, [prependInstead] )
      const vector = x;
      assert && assert(vector.isFinite(), 'scale should be a finite Vector2 if not a finite number');
      this.scale(vector.x, vector.y, y); // forward to full version
    }
  }

  /**
   * Rotates the node's transform. The default "appends" the transform, so that it will
   * appear to happen to the Node before the rest of the transform would apply, but if "prepended", the rest of the
   * transform would apply first.
   *
   * As an example, if a Node is translated to (100,0):
   * rotate( Math.PI ) will rotate the Node around (100,0)
   * rotate( Math.PI, true ) will rotate the Node around the origin, moving it to (-100,0)
   *
   * @param angle - The angle (in radians) to rotate by
   * @param [prependInstead] - Whether the transform should be prepended (defaults to false)
   */
  rotate(angle, prependInstead) {
    assert && assert(isFinite(angle), 'angle should be a finite number');
    assert && assert(prependInstead === undefined || typeof prependInstead === 'boolean');
    if (angle % (2 * Math.PI) === 0) {
      return;
    } // bail out if our angle is effectively 0
    if (prependInstead) {
      this.prependMatrix(Matrix3.rotation2(angle));
    } else {
      this.appendMatrix(Matrix3.rotation2(angle));
    }
  }

  /**
   * Rotates the node's transform around a specific point (in the parent coordinate frame) by prepending the transform.
   *
   * TODO: determine whether this should use the appendMatrix method
   *
   * @param point - In the parent coordinate frame
   * @param angle - In radians
   */
  rotateAround(point, angle) {
    assert && assert(point.isFinite(), 'point should be a finite Vector2');
    assert && assert(isFinite(angle), 'angle should be a finite number');
    let matrix = Matrix3.translation(-point.x, -point.y);
    matrix = Matrix3.rotation2(angle).timesMatrix(matrix);
    matrix = Matrix3.translation(point.x, point.y).timesMatrix(matrix);
    this.prependMatrix(matrix);
    return this;
  }

  /**
   * Shifts the x coordinate (in the parent coordinate frame) of where the node's origin is transformed to.
   */
  setX(x) {
    assert && assert(isFinite(x), 'x should be a finite number');
    this.translate(x - this.getX(), 0, true);
    return this;
  }

  /**
   * See setX() for more information
   */
  set x(value) {
    this.setX(value);
  }

  /**
   * See getX() for more information
   */
  get x() {
    return this.getX();
  }

  /**
   * Returns the x coordinate (in the parent coordinate frame) of where the node's origin is transformed to.
   */
  getX() {
    return this._transform.getMatrix().m02();
  }

  /**
   * Shifts the y coordinate (in the parent coordinate frame) of where the node's origin is transformed to.
   */
  setY(y) {
    assert && assert(isFinite(y), 'y should be a finite number');
    this.translate(0, y - this.getY(), true);
    return this;
  }

  /**
   * See setY() for more information
   */
  set y(value) {
    this.setY(value);
  }

  /**
   * See getY() for more information
   */
  get y() {
    return this.getY();
  }

  /**
   * Returns the y coordinate (in the parent coordinate frame) of where the node's origin is transformed to.
   */
  getY() {
    return this._transform.getMatrix().m12();
  }

  /**
   * Typically without rotations or negative parameters, this sets the scale for each axis. In its more general form,
   * it modifies the node's transform so that:
   * - Transforming (1,0) with our transform will result in a vector with magnitude abs( x-scale-magnitude )
   * - Transforming (0,1) with our transform will result in a vector with magnitude abs( y-scale-magnitude )
   * - If parameters are negative, it will flip orientation in that direct.
   *
   * Allowed call signatures:
   * setScaleMagnitude( s )
   * setScaleMagnitude( sx, sy )
   * setScaleMagnitude( vector )
   *
   * @param a - Scale for both axes, or scale for x-axis if using the 2-parameter call
   * @param [b] - Scale for the Y axis (only for the 2-parameter call)
   */

  // eslint-disable-line @typescript-eslint/explicit-member-accessibility

  // eslint-disable-line @typescript-eslint/explicit-member-accessibility
  setScaleMagnitude(a, b) {
    // eslint-disable-line @typescript-eslint/explicit-member-accessibility
    const currentScale = this.getScaleVector();
    if (typeof a === 'number') {
      if (b === undefined) {
        // to map setScaleMagnitude( scale ) => setScaleMagnitude( scale, scale )
        b = a;
      }
      assert && assert(isFinite(a), 'setScaleMagnitude parameters should be finite numbers');
      assert && assert(isFinite(b), 'setScaleMagnitude parameters should be finite numbers');
      // setScaleMagnitude( x, y )
      this.appendMatrix(Matrix3.scaling(a / currentScale.x, b / currentScale.y));
    } else {
      // setScaleMagnitude( vector ), where we set the x-scale to vector.x and y-scale to vector.y
      assert && assert(a.isFinite(), 'first parameter should be a finite Vector2');
      this.appendMatrix(Matrix3.scaling(a.x / currentScale.x, a.y / currentScale.y));
    }
    return this;
  }

  /**
   * Returns a vector with an entry for each axis, e.g. (5,2) for an affine matrix with rows ((5,0,0),(0,2,0),(0,0,1)).
   *
   * It is equivalent to:
   * ( T(1,0).magnitude(), T(0,1).magnitude() ) where T() transforms points with our transform.
   */
  getScaleVector() {
    return this._transform.getMatrix().getScaleVector();
  }

  /**
   * Rotates this node's transform so that a unit (1,0) vector would be rotated by this node's transform by the
   * specified amount.
   *
   * @param rotation - In radians
   */
  setRotation(rotation) {
    assert && assert(isFinite(rotation), 'rotation should be a finite number');
    this.appendMatrix(scratchMatrix3.setToRotationZ(rotation - this.getRotation()));
    return this;
  }

  /**
   * See setRotation() for more information
   */
  set rotation(value) {
    this.setRotation(value);
  }

  /**
   * See getRotation() for more information
   */
  get rotation() {
    return this.getRotation();
  }

  /**
   * Returns the rotation (in radians) that would be applied to a unit (1,0) vector when transformed with this Node's
   * transform.
   */
  getRotation() {
    return this._transform.getMatrix().getRotation();
  }

  /**
   * Modifies the translation of this Node's transform so that the node's local-coordinate origin will be transformed
   * to the passed-in x/y.
   *
   * Allowed call signatures:
   * setTranslation( x, y )
   * setTranslation( vector )
   *
   * @param a - X translation - or Vector with x/y translation in components
   * @param [b] - Y translation
   */

  // eslint-disable-line @typescript-eslint/explicit-member-accessibility
  setTranslation(a, b) {
    // eslint-disable-line @typescript-eslint/explicit-member-accessibility
    const m = this._transform.getMatrix();
    const tx = m.m02();
    const ty = m.m12();
    let dx;
    let dy;
    if (typeof a === 'number') {
      assert && assert(isFinite(a), 'Parameters to setTranslation should be finite numbers');
      assert && assert(b !== undefined && isFinite(b), 'Parameters to setTranslation should be finite numbers');
      dx = a - tx;
      dy = b - ty;
    } else {
      assert && assert(a.isFinite(), 'Should be a finite Vector2');
      dx = a.x - tx;
      dy = a.y - ty;
    }
    this.translate(dx, dy, true);
    return this;
  }

  /**
   * See setTranslation() for more information - this should only be used with Vector2
   */
  set translation(value) {
    this.setTranslation(value);
  }

  /**
   * See getTranslation() for more information
   */
  get translation() {
    return this.getTranslation();
  }

  /**
   * Returns a vector of where this Node's local-coordinate origin will be transformed by it's own transform.
   */
  getTranslation() {
    const matrix = this._transform.getMatrix();
    return new Vector2(matrix.m02(), matrix.m12());
  }

  /**
   * Appends a transformation matrix to this Node's transform. Appending means this transform is conceptually applied
   * first before the rest of the Node's current transform (i.e. applied in the local coordinate frame).
   */
  appendMatrix(matrix) {
    assert && assert(matrix.isFinite(), 'matrix should be a finite Matrix3');
    assert && assert(matrix.getDeterminant() !== 0, 'matrix should not map plane to a line or point');
    this._transform.append(matrix);
  }

  /**
   * Prepends a transformation matrix to this Node's transform. Prepending means this transform is conceptually applied
   * after the rest of the Node's current transform (i.e. applied in the parent coordinate frame).
   */
  prependMatrix(matrix) {
    assert && assert(matrix.isFinite(), 'matrix should be a finite Matrix3');
    assert && assert(matrix.getDeterminant() !== 0, 'matrix should not map plane to a line or point');
    this._transform.prepend(matrix);
  }

  /**
   * Prepends an (x,y) translation to our Node's transform in an efficient manner without allocating a matrix.
   * see https://github.com/phetsims/scenery/issues/119
   */
  prependTranslation(x, y) {
    assert && assert(isFinite(x), 'x should be a finite number');
    assert && assert(isFinite(y), 'y should be a finite number');
    if (!x && !y) {
      return;
    } // bail out if both are zero

    this._transform.prependTranslation(x, y);
  }

  /**
   * Changes this Node's transform to match the passed-in transformation matrix.
   */
  setMatrix(matrix) {
    assert && assert(matrix.isFinite(), 'matrix should be a finite Matrix3');
    assert && assert(matrix.getDeterminant() !== 0, 'matrix should not map plane to a line or point');
    this._transform.setMatrix(matrix);
  }

  /**
   * See setMatrix() for more information
   */
  set matrix(value) {
    this.setMatrix(value);
  }

  /**
   * See getMatrix() for more information
   */
  get matrix() {
    return this.getMatrix();
  }

  /**
   * Returns a Matrix3 representing our Node's transform.
   *
   * NOTE: Do not mutate the returned matrix.
   */
  getMatrix() {
    return this._transform.getMatrix();
  }

  /**
   * Returns a reference to our Node's transform
   */
  getTransform() {
    // for now, return an actual copy. we can consider listening to changes in the future
    return this._transform;
  }

  /**
   * See getTransform() for more information
   */
  get transform() {
    return this.getTransform();
  }

  /**
   * Resets our Node's transform to an identity transform (i.e. no transform is applied).
   */
  resetTransform() {
    this.setMatrix(Matrix3.IDENTITY);
  }

  /**
   * Callback function that should be called when our transform is changed.
   */
  onTransformChange() {
    // TODO: why is local bounds invalidation needed here?
    this.invalidateBounds();
    this._picker.onTransformChange();
    if (assertSlow) {
      this._picker.audit();
    }
    this.transformEmitter.emit();
  }

  /**
   * Called when our summary bitmask changes (scenery-internal)
   */
  onSummaryChange(oldBitmask, newBitmask) {
    // Defined in ParallelDOM.js
    this._pdomDisplaysInfo.onSummaryChange(oldBitmask, newBitmask);
  }

  /**
   * Updates our node's scale and applied scale factor if we need to change our scale to fit within the maximum
   * dimensions (maxWidth and maxHeight). See documentation in constructor for detailed behavior.
   */
  updateMaxDimension(localBounds) {
    assert && this.auditMaxDimensions();
    const currentScale = this._appliedScaleFactor;
    let idealScale = 1;
    if (this._maxWidth !== null) {
      const width = localBounds.width;
      if (width > this._maxWidth) {
        idealScale = Math.min(idealScale, this._maxWidth / width);
      }
    }
    if (this._maxHeight !== null) {
      const height = localBounds.height;
      if (height > this._maxHeight) {
        idealScale = Math.min(idealScale, this._maxHeight / height);
      }
    }
    const scaleAdjustment = idealScale / currentScale;
    if (scaleAdjustment !== 1) {
      // Set this first, for supporting re-entrancy if our content changes based on the scale
      this._appliedScaleFactor = idealScale;
      this.scale(scaleAdjustment);
    }
  }

  /**
   * Scenery-internal method for verifying maximum dimensions are NOT smaller than preferred dimensions
   * NOTE: This has to be public due to mixins not able to access protected/private methods
   */
  auditMaxDimensions() {
    assert && assert(this._maxWidth === null || !isWidthSizable(this) || this.preferredWidth === null || this._maxWidth >= this.preferredWidth - 1e-7, 'If maxWidth and preferredWidth are both non-null, maxWidth should NOT be smaller than the preferredWidth. If that happens, it would trigger an infinite loop');
    assert && assert(this._maxHeight === null || !isHeightSizable(this) || this.preferredHeight === null || this._maxHeight >= this.preferredHeight - 1e-7, 'If maxHeight and preferredHeight are both non-null, maxHeight should NOT be smaller than the preferredHeight. If that happens, it would trigger an infinite loop');
  }

  /**
   * Increments/decrements bounds "listener" count based on the values of maxWidth/maxHeight before and after.
   * null is like no listener, non-null is like having a listener, so we increment for null => non-null, and
   * decrement for non-null => null.
   */
  onMaxDimensionChange(beforeMaxLength, afterMaxLength) {
    if (beforeMaxLength === null && afterMaxLength !== null) {
      this.changeBoundsEventCount(1);
      this._boundsEventSelfCount++;
    } else if (beforeMaxLength !== null && afterMaxLength === null) {
      this.changeBoundsEventCount(-1);
      this._boundsEventSelfCount--;
    }
  }

  /**
   * Sets the maximum width of the Node (see constructor for documentation on how maximum dimensions work).
   */
  setMaxWidth(maxWidth) {
    assert && assert(maxWidth === null || typeof maxWidth === 'number' && maxWidth > 0, 'maxWidth should be null (no constraint) or a positive number');
    if (this._maxWidth !== maxWidth) {
      // update synthetic bounds listener count (to ensure our bounds are validated at the start of updateDisplay)
      this.onMaxDimensionChange(this._maxWidth, maxWidth);
      this._maxWidth = maxWidth;
      this.updateMaxDimension(this.localBoundsProperty.value);
    }
  }

  /**
   * See setMaxWidth() for more information
   */
  set maxWidth(value) {
    this.setMaxWidth(value);
  }

  /**
   * See getMaxWidth() for more information
   */
  get maxWidth() {
    return this.getMaxWidth();
  }

  /**
   * Returns the maximum width (if any) of the Node.
   */
  getMaxWidth() {
    return this._maxWidth;
  }

  /**
   * Sets the maximum height of the Node (see constructor for documentation on how maximum dimensions work).
   */
  setMaxHeight(maxHeight) {
    assert && assert(maxHeight === null || typeof maxHeight === 'number' && maxHeight > 0, 'maxHeight should be null (no constraint) or a positive number');
    if (this._maxHeight !== maxHeight) {
      // update synthetic bounds listener count (to ensure our bounds are validated at the start of updateDisplay)
      this.onMaxDimensionChange(this._maxHeight, maxHeight);
      this._maxHeight = maxHeight;
      this.updateMaxDimension(this.localBoundsProperty.value);
    }
  }

  /**
   * See setMaxHeight() for more information
   */
  set maxHeight(value) {
    this.setMaxHeight(value);
  }

  /**
   * See getMaxHeight() for more information
   */
  get maxHeight() {
    return this.getMaxHeight();
  }

  /**
   * Returns the maximum height (if any) of the Node.
   */
  getMaxHeight() {
    return this._maxHeight;
  }

  /**
   * Shifts this Node horizontally so that its left bound (in the parent coordinate frame) is equal to the passed-in
   * 'left' X value.
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   *
   * @param left - After this operation, node.left should approximately equal this value.
   */
  setLeft(left) {
    const currentLeft = this.getLeft();
    if (isFinite(currentLeft)) {
      this.translate(left - currentLeft, 0, true);
    }
    return this; // allow chaining
  }

  /**
   * See setLeft() for more information
   */
  set left(value) {
    this.setLeft(value);
  }

  /**
   * See getLeft() for more information
   */
  get left() {
    return this.getLeft();
  }

  /**
   * Returns the X value of the left side of the bounding box of this Node (in the parent coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */
  getLeft() {
    return this.getBounds().minX;
  }

  /**
   * Shifts this Node horizontally so that its right bound (in the parent coordinate frame) is equal to the passed-in
   * 'right' X value.
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   *
   * @param right - After this operation, node.right should approximately equal this value.
   */
  setRight(right) {
    const currentRight = this.getRight();
    if (isFinite(currentRight)) {
      this.translate(right - currentRight, 0, true);
    }
    return this; // allow chaining
  }

  /**
   * See setRight() for more information
   */
  set right(value) {
    this.setRight(value);
  }

  /**
   * See getRight() for more information
   */
  get right() {
    return this.getRight();
  }

  /**
   * Returns the X value of the right side of the bounding box of this Node (in the parent coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */
  getRight() {
    return this.getBounds().maxX;
  }

  /**
   * Shifts this Node horizontally so that its horizontal center (in the parent coordinate frame) is equal to the
   * passed-in center X value.
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   *
   * @param x - After this operation, node.centerX should approximately equal this value.
   */
  setCenterX(x) {
    const currentCenterX = this.getCenterX();
    if (isFinite(currentCenterX)) {
      this.translate(x - currentCenterX, 0, true);
    }
    return this; // allow chaining
  }

  /**
   * See setCenterX() for more information
   */
  set centerX(value) {
    this.setCenterX(value);
  }

  /**
   * See getCenterX() for more information
   */
  get centerX() {
    return this.getCenterX();
  }

  /**
   * Returns the X value of this node's horizontal center (in the parent coordinate frame)
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */
  getCenterX() {
    return this.getBounds().getCenterX();
  }

  /**
   * Shifts this Node vertically so that its vertical center (in the parent coordinate frame) is equal to the
   * passed-in center Y value.
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   *
   * @param y - After this operation, node.centerY should approximately equal this value.
   */
  setCenterY(y) {
    const currentCenterY = this.getCenterY();
    if (isFinite(currentCenterY)) {
      this.translate(0, y - currentCenterY, true);
    }
    return this; // allow chaining
  }

  /**
   * See setCenterY() for more information
   */
  set centerY(value) {
    this.setCenterY(value);
  }

  /**
   * See getCenterX() for more information
   */
  get centerY() {
    return this.getCenterY();
  }

  /**
   * Returns the Y value of this node's vertical center (in the parent coordinate frame)
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */
  getCenterY() {
    return this.getBounds().getCenterY();
  }

  /**
   * Shifts this Node vertically so that its top (in the parent coordinate frame) is equal to the passed-in Y value.
   *
   * NOTE: top is the lowest Y value in our bounds.
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   *
   * @param top - After this operation, node.top should approximately equal this value.
   */
  setTop(top) {
    const currentTop = this.getTop();
    if (isFinite(currentTop)) {
      this.translate(0, top - currentTop, true);
    }
    return this; // allow chaining
  }

  /**
   * See setTop() for more information
   */
  set top(value) {
    this.setTop(value);
  }

  /**
   * See getTop() for more information
   */
  get top() {
    return this.getTop();
  }

  /**
   * Returns the lowest Y value of this node's bounding box (in the parent coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */
  getTop() {
    return this.getBounds().minY;
  }

  /**
   * Shifts this Node vertically so that its bottom (in the parent coordinate frame) is equal to the passed-in Y value.
   *
   * NOTE: bottom is the highest Y value in our bounds.
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   *
   * @param bottom - After this operation, node.bottom should approximately equal this value.
   */
  setBottom(bottom) {
    const currentBottom = this.getBottom();
    if (isFinite(currentBottom)) {
      this.translate(0, bottom - currentBottom, true);
    }
    return this; // allow chaining
  }

  /**
   * See setBottom() for more information
   */
  set bottom(value) {
    this.setBottom(value);
  }

  /**
   * See getBottom() for more information
   */
  get bottom() {
    return this.getBottom();
  }

  /**
   * Returns the highest Y value of this node's bounding box (in the parent coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */
  getBottom() {
    return this.getBounds().maxY;
  }

  /*
   * Convenience locations
   *
   * Upper is in terms of the visual layout in Scenery and other programs, so the minY is the "upper", and minY is the "lower"
   *
   *             left (x)     centerX        right
   *          ---------------------------------------
   * top  (y) | leftTop     centerTop     rightTop
   * centerY  | leftCenter  center        rightCenter
   * bottom   | leftBottom  centerBottom  rightBottom
   *
   * NOTE: This requires computation of this node's subtree bounds, which may incur some performance loss.
   */

  /**
   * Sets the position of the upper-left corner of this node's bounds to the specified point.
   */
  setLeftTop(leftTop) {
    assert && assert(leftTop.isFinite(), 'leftTop should be a finite Vector2');
    const currentLeftTop = this.getLeftTop();
    if (currentLeftTop.isFinite()) {
      this.translate(leftTop.minus(currentLeftTop), true);
    }
    return this;
  }

  /**
   * See setLeftTop() for more information
   */
  set leftTop(value) {
    this.setLeftTop(value);
  }

  /**
   * See getLeftTop() for more information
   */
  get leftTop() {
    return this.getLeftTop();
  }

  /**
   * Returns the upper-left corner of this node's bounds.
   */
  getLeftTop() {
    return this.getBounds().getLeftTop();
  }

  /**
   * Sets the position of the center-top location of this node's bounds to the specified point.
   */
  setCenterTop(centerTop) {
    assert && assert(centerTop.isFinite(), 'centerTop should be a finite Vector2');
    const currentCenterTop = this.getCenterTop();
    if (currentCenterTop.isFinite()) {
      this.translate(centerTop.minus(currentCenterTop), true);
    }
    return this;
  }

  /**
   * See setCenterTop() for more information
   */
  set centerTop(value) {
    this.setCenterTop(value);
  }

  /**
   * See getCenterTop() for more information
   */
  get centerTop() {
    return this.getCenterTop();
  }

  /**
   * Returns the center-top location of this node's bounds.
   */
  getCenterTop() {
    return this.getBounds().getCenterTop();
  }

  /**
   * Sets the position of the upper-right corner of this node's bounds to the specified point.
   */
  setRightTop(rightTop) {
    assert && assert(rightTop.isFinite(), 'rightTop should be a finite Vector2');
    const currentRightTop = this.getRightTop();
    if (currentRightTop.isFinite()) {
      this.translate(rightTop.minus(currentRightTop), true);
    }
    return this;
  }

  /**
   * See setRightTop() for more information
   */
  set rightTop(value) {
    this.setRightTop(value);
  }

  /**
   * See getRightTop() for more information
   */
  get rightTop() {
    return this.getRightTop();
  }

  /**
   * Returns the upper-right corner of this node's bounds.
   */
  getRightTop() {
    return this.getBounds().getRightTop();
  }

  /**
   * Sets the position of the center-left of this node's bounds to the specified point.
   */
  setLeftCenter(leftCenter) {
    assert && assert(leftCenter.isFinite(), 'leftCenter should be a finite Vector2');
    const currentLeftCenter = this.getLeftCenter();
    if (currentLeftCenter.isFinite()) {
      this.translate(leftCenter.minus(currentLeftCenter), true);
    }
    return this;
  }

  /**
   * See setLeftCenter() for more information
   */
  set leftCenter(value) {
    this.setLeftCenter(value);
  }

  /**
   * See getLeftCenter() for more information
   */
  get leftCenter() {
    return this.getLeftCenter();
  }

  /**
   * Returns the center-left corner of this node's bounds.
   */
  getLeftCenter() {
    return this.getBounds().getLeftCenter();
  }

  /**
   * Sets the center of this node's bounds to the specified point.
   */
  setCenter(center) {
    assert && assert(center.isFinite(), 'center should be a finite Vector2');
    const currentCenter = this.getCenter();
    if (currentCenter.isFinite()) {
      this.translate(center.minus(currentCenter), true);
    }
    return this;
  }

  /**
   * See setCenter() for more information
   */
  set center(value) {
    this.setCenter(value);
  }

  /**
   * See getCenter() for more information
   */
  get center() {
    return this.getCenter();
  }

  /**
   * Returns the center of this node's bounds.
   */
  getCenter() {
    return this.getBounds().getCenter();
  }

  /**
   * Sets the position of the center-right of this node's bounds to the specified point.
   */
  setRightCenter(rightCenter) {
    assert && assert(rightCenter.isFinite(), 'rightCenter should be a finite Vector2');
    const currentRightCenter = this.getRightCenter();
    if (currentRightCenter.isFinite()) {
      this.translate(rightCenter.minus(currentRightCenter), true);
    }
    return this;
  }

  /**
   * See setRightCenter() for more information
   */
  set rightCenter(value) {
    this.setRightCenter(value);
  }

  /**
   * See getRightCenter() for more information
   */
  get rightCenter() {
    return this.getRightCenter();
  }

  /**
   * Returns the center-right of this node's bounds.
   */
  getRightCenter() {
    return this.getBounds().getRightCenter();
  }

  /**
   * Sets the position of the lower-left corner of this node's bounds to the specified point.
   */
  setLeftBottom(leftBottom) {
    assert && assert(leftBottom.isFinite(), 'leftBottom should be a finite Vector2');
    const currentLeftBottom = this.getLeftBottom();
    if (currentLeftBottom.isFinite()) {
      this.translate(leftBottom.minus(currentLeftBottom), true);
    }
    return this;
  }

  /**
   * See setLeftBottom() for more information
   */
  set leftBottom(value) {
    this.setLeftBottom(value);
  }

  /**
   * See getLeftBottom() for more information
   */
  get leftBottom() {
    return this.getLeftBottom();
  }

  /**
   * Returns the lower-left corner of this node's bounds.
   */
  getLeftBottom() {
    return this.getBounds().getLeftBottom();
  }

  /**
   * Sets the position of the center-bottom of this node's bounds to the specified point.
   */
  setCenterBottom(centerBottom) {
    assert && assert(centerBottom.isFinite(), 'centerBottom should be a finite Vector2');
    const currentCenterBottom = this.getCenterBottom();
    if (currentCenterBottom.isFinite()) {
      this.translate(centerBottom.minus(currentCenterBottom), true);
    }
    return this;
  }

  /**
   * See setCenterBottom() for more information
   */
  set centerBottom(value) {
    this.setCenterBottom(value);
  }

  /**
   * See getCenterBottom() for more information
   */
  get centerBottom() {
    return this.getCenterBottom();
  }

  /**
   * Returns the center-bottom of this node's bounds.
   */
  getCenterBottom() {
    return this.getBounds().getCenterBottom();
  }

  /**
   * Sets the position of the lower-right corner of this node's bounds to the specified point.
   */
  setRightBottom(rightBottom) {
    assert && assert(rightBottom.isFinite(), 'rightBottom should be a finite Vector2');
    const currentRightBottom = this.getRightBottom();
    if (currentRightBottom.isFinite()) {
      this.translate(rightBottom.minus(currentRightBottom), true);
    }
    return this;
  }

  /**
   * See setRightBottom() for more information
   */
  set rightBottom(value) {
    this.setRightBottom(value);
  }

  /**
   * See getRightBottom() for more information
   */
  get rightBottom() {
    return this.getRightBottom();
  }

  /**
   * Returns the lower-right corner of this node's bounds.
   */
  getRightBottom() {
    return this.getBounds().getRightBottom();
  }

  /**
   * Returns the width of this node's bounding box (in the parent coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */
  getWidth() {
    return this.getBounds().getWidth();
  }

  /**
   * See getWidth() for more information
   */
  get width() {
    return this.getWidth();
  }

  /**
   * Returns the height of this node's bounding box (in the parent coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */
  getHeight() {
    return this.getBounds().getHeight();
  }

  /**
   * See getHeight() for more information
   */
  get height() {
    return this.getHeight();
  }

  /**
   * Returns the width of this node's bounding box (in the local coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */
  getLocalWidth() {
    return this.getLocalBounds().getWidth();
  }

  /**
   * See getLocalWidth() for more information
   */
  get localWidth() {
    return this.getLocalWidth();
  }

  /**
   * Returns the height of this node's bounding box (in the local coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */
  getLocalHeight() {
    return this.getLocalBounds().getHeight();
  }

  /**
   * See getLocalHeight() for more information
   */
  get localHeight() {
    return this.getLocalHeight();
  }

  /**
   * Returns the X value of the left side of the bounding box of this Node (in the local coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */
  getLocalLeft() {
    return this.getLocalBounds().minX;
  }

  /**
   * See getLeft() for more information
   */
  get localLeft() {
    return this.getLocalLeft();
  }

  /**
   * Returns the X value of the right side of the bounding box of this Node (in the local coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */
  getLocalRight() {
    return this.getLocalBounds().maxX;
  }

  /**
   * See getRight() for more information
   */
  get localRight() {
    return this.getLocalRight();
  }

  /**
   * Returns the X value of this node's horizontal center (in the local coordinate frame)
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */
  getLocalCenterX() {
    return this.getLocalBounds().getCenterX();
  }

  /**
   * See getCenterX() for more information
   */
  get localCenterX() {
    return this.getLocalCenterX();
  }

  /**
   * Returns the Y value of this node's vertical center (in the local coordinate frame)
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */
  getLocalCenterY() {
    return this.getLocalBounds().getCenterY();
  }

  /**
   * See getCenterX() for more information
   */
  get localCenterY() {
    return this.getLocalCenterY();
  }

  /**
   * Returns the lowest Y value of this node's bounding box (in the local coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */
  getLocalTop() {
    return this.getLocalBounds().minY;
  }

  /**
   * See getTop() for more information
   */
  get localTop() {
    return this.getLocalTop();
  }

  /**
   * Returns the highest Y value of this node's bounding box (in the local coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */
  getLocalBottom() {
    return this.getLocalBounds().maxY;
  }

  /**
   * See getLocalBottom() for more information
   */
  get localBottom() {
    return this.getLocalBottom();
  }

  /**
   * Returns the upper-left corner of this node's localBounds.
   */
  getLocalLeftTop() {
    return this.getLocalBounds().getLeftTop();
  }

  /**
   * See getLocalLeftTop() for more information
   */
  get localLeftTop() {
    return this.getLocalLeftTop();
  }

  /**
   * Returns the center-top location of this node's localBounds.
   */
  getLocalCenterTop() {
    return this.getLocalBounds().getCenterTop();
  }

  /**
   * See getLocalCenterTop() for more information
   */
  get localCenterTop() {
    return this.getLocalCenterTop();
  }

  /**
   * Returns the upper-right corner of this node's localBounds.
   */
  getLocalRightTop() {
    return this.getLocalBounds().getRightTop();
  }

  /**
   * See getLocalRightTop() for more information
   */
  get localRightTop() {
    return this.getLocalRightTop();
  }

  /**
   * Returns the center-left corner of this node's localBounds.
   */
  getLocalLeftCenter() {
    return this.getLocalBounds().getLeftCenter();
  }

  /**
   * See getLocalLeftCenter() for more information
   */
  get localLeftCenter() {
    return this.getLocalLeftCenter();
  }

  /**
   * Returns the center of this node's localBounds.
   */
  getLocalCenter() {
    return this.getLocalBounds().getCenter();
  }

  /**
   * See getLocalCenter() for more information
   */
  get localCenter() {
    return this.getLocalCenter();
  }

  /**
   * Returns the center-right of this node's localBounds.
   */
  getLocalRightCenter() {
    return this.getLocalBounds().getRightCenter();
  }

  /**
   * See getLocalRightCenter() for more information
   */
  get localRightCenter() {
    return this.getLocalRightCenter();
  }

  /**
   * Returns the lower-left corner of this node's localBounds.
   */
  getLocalLeftBottom() {
    return this.getLocalBounds().getLeftBottom();
  }

  /**
   * See getLocalLeftBottom() for more information
   */
  get localLeftBottom() {
    return this.getLocalLeftBottom();
  }

  /**
   * Returns the center-bottom of this node's localBounds.
   */
  getLocalCenterBottom() {
    return this.getLocalBounds().getCenterBottom();
  }

  /**
   * See getLocalCenterBottom() for more information
   */
  get localCenterBottom() {
    return this.getLocalCenterBottom();
  }

  /**
   * Returns the lower-right corner of this node's localBounds.
   */
  getLocalRightBottom() {
    return this.getLocalBounds().getRightBottom();
  }

  /**
   * See getLocalRightBottom() for more information
   */
  get localRightBottom() {
    return this.getLocalRightBottom();
  }

  /**
   * Returns the unique integral ID for this node.
   */
  getId() {
    return this._id;
  }

  /**
   * See getId() for more information
   */
  get id() {
    return this.getId();
  }

  /**
   * Called when our visibility Property changes values.
   */
  onVisiblePropertyChange(visible) {
    // changing visibility can affect pickability pruning, which affects mouse/touch bounds
    this._picker.onVisibilityChange();
    if (assertSlow) {
      this._picker.audit();
    }

    // Defined in ParallelDOM.js
    this._pdomDisplaysInfo.onVisibilityChange(visible);
    for (let i = 0; i < this._parents.length; i++) {
      const parent = this._parents[i];
      if (parent._excludeInvisibleChildrenFromBounds) {
        parent.invalidateChildBounds();
      }
    }
  }

  /**
   * Sets what Property our visibleProperty is backed by, so that changes to this provided Property will change this
   * Node's visibility, and vice versa. This does not change this._visibleProperty. See TinyForwardingProperty.setTargetProperty()
   * for more info.
   *
   * NOTE For PhET-iO use:
   * All PhET-iO instrumented Nodes create their own instrumented visibleProperty (if one is not passed in as
   * an option). Once a Node's visibleProperty has been registered with PhET-iO, it cannot be "swapped out" for another.
   * If you need to "delay" setting an instrumented visibleProperty to this node, pass phetioVisiblePropertyInstrumented
   * to instrumentation call to this Node (where Tandem is provided).
   */
  setVisibleProperty(newTarget) {
    return this._visibleProperty.setTargetProperty(this, VISIBLE_PROPERTY_TANDEM_NAME, newTarget);
  }

  /**
   * See setVisibleProperty() for more information
   */
  set visibleProperty(property) {
    this.setVisibleProperty(property);
  }

  /**
   * See getVisibleProperty() for more information
   */
  get visibleProperty() {
    return this.getVisibleProperty();
  }

  /**
   * Get this Node's visibleProperty. Note! This is not the reciprocal of setVisibleProperty. Node.prototype._visibleProperty
   * is a TinyForwardingProperty, and is set up to listen to changes from the visibleProperty provided by
   * setVisibleProperty(), but the underlying reference does not change. This means the following:
   *     * const myNode = new Node();
   * const visibleProperty = new Property( false );
   * myNode.setVisibleProperty( visibleProperty )
   * => myNode.getVisibleProperty() !== visibleProperty (!!!!!!)
   *
   * Please use this with caution. See setVisibleProperty() for more information.
   */
  getVisibleProperty() {
    return this._visibleProperty;
  }

  /**
   * Sets whether this Node is visible.  DO NOT override this as a way of adding additional behavior when a Node's
   * visibility changes, add a listener to this.visibleProperty instead.
   */
  setVisible(visible) {
    this.visibleProperty.set(visible);
    return this;
  }

  /**
   * See setVisible() for more information
   */
  set visible(value) {
    this.setVisible(value);
  }

  /**
   * See isVisible() for more information
   */
  get visible() {
    return this.isVisible();
  }

  /**
   * Returns whether this Node is visible.
   */
  isVisible() {
    return this.visibleProperty.value;
  }

  /**
   * Use this to automatically create a forwarded, PhET-iO instrumented visibleProperty internal to Node.
   */
  setPhetioVisiblePropertyInstrumented(phetioVisiblePropertyInstrumented) {
    return this._visibleProperty.setTargetPropertyInstrumented(phetioVisiblePropertyInstrumented, this);
  }

  /**
   * See setPhetioVisiblePropertyInstrumented() for more information
   */
  set phetioVisiblePropertyInstrumented(value) {
    this.setPhetioVisiblePropertyInstrumented(value);
  }

  /**
   * See getPhetioVisiblePropertyInstrumented() for more information
   */
  get phetioVisiblePropertyInstrumented() {
    return this.getPhetioVisiblePropertyInstrumented();
  }
  getPhetioVisiblePropertyInstrumented() {
    return this._visibleProperty.getTargetPropertyInstrumented();
  }

  /**
   * Swap the visibility of this node with another node. The Node that is made visible will receive keyboard focus
   * if it is focusable and the previously visible Node had focus.
   */
  swapVisibility(otherNode) {
    assert && assert(this.visible !== otherNode.visible);
    const visibleNode = this.visible ? this : otherNode;
    const invisibleNode = this.visible ? otherNode : this;

    // if the visible node has focus we will restore focus on the invisible Node once it is visible
    const visibleNodeFocused = visibleNode.focused;
    visibleNode.visible = false;
    invisibleNode.visible = true;
    if (visibleNodeFocused && invisibleNode.focusable) {
      invisibleNode.focus();
    }
    return this; // allow chaining
  }

  /**
   * Sets the opacity of this Node (and its sub-tree), where 0 is fully transparent, and 1 is fully opaque.  Values
   * outside of that range throw an Error.
   * @throws Error if opacity out of range
   */
  setOpacity(opacity) {
    assert && assert(isFinite(opacity), 'opacity should be a finite number');
    if (opacity < 0 || opacity > 1) {
      throw new Error(`opacity out of range: ${opacity}`);
    }
    this.opacityProperty.value = opacity;
  }

  /**
   * See setOpacity() for more information
   */
  set opacity(value) {
    this.setOpacity(value);
  }

  /**
   * See getOpacity() for more information
   */
  get opacity() {
    return this.getOpacity();
  }

  /**
   * Returns the opacity of this node.
   */
  getOpacity() {
    return this.opacityProperty.value;
  }

  /**
   * Sets the disabledOpacity of this Node (and its sub-tree), where 0 is fully transparent, and 1 is fully opaque.
   * Values outside of that range throw an Error.
   * @throws Error if disabledOpacity out of range
   */
  setDisabledOpacity(disabledOpacity) {
    assert && assert(isFinite(disabledOpacity), 'disabledOpacity should be a finite number');
    if (disabledOpacity < 0 || disabledOpacity > 1) {
      throw new Error(`disabledOpacity out of range: ${disabledOpacity}`);
    }
    this.disabledOpacityProperty.value = disabledOpacity;
    return this;
  }

  /**
   * See setDisabledOpacity() for more information
   */
  set disabledOpacity(value) {
    this.setDisabledOpacity(value);
  }

  /**
   * See getDisabledOpacity() for more information
   */
  get disabledOpacity() {
    return this.getDisabledOpacity();
  }

  /**
   * Returns the disabledOpacity of this node.
   */
  getDisabledOpacity() {
    return this.disabledOpacityProperty.value;
  }

  /**
   * Returns the opacity actually applied to the node.
   */
  getEffectiveOpacity() {
    return this.opacityProperty.value * (this.enabledProperty.value ? 1 : this.disabledOpacityProperty.value);
  }

  /**
   * See getDisabledOpacity() for more information
   */
  get effectiveOpacity() {
    return this.getEffectiveOpacity();
  }

  /**
   * Called when our opacity or other filter changes values
   */
  onOpacityPropertyChange() {
    this.filterChangeEmitter.emit();
  }

  /**
   * Called when our opacity or other filter changes values
   */
  onDisabledOpacityPropertyChange() {
    if (!this._enabledProperty.value) {
      this.filterChangeEmitter.emit();
    }
  }

  /**
   * Sets the non-opacity filters for this Node.
   *
   * The default is an empty array (no filters). It should be an array of Filter objects, which will be effectively
   * applied in-order on this Node (and its subtree), and will be applied BEFORE opacity/clipping.
   *
   * NOTE: Some filters may decrease performance (and this may be platform-specific). Please read documentation for each
   * filter before using.
   *
   * Typical filter types to use are:
   * - Brightness
   * - Contrast
   * - DropShadow (EXPERIMENTAL)
   * - GaussianBlur (EXPERIMENTAL)
   * - Grayscale (Grayscale.FULL for the full effect)
   * - HueRotate
   * - Invert (Invert.FULL for the full effect)
   * - Saturate
   * - Sepia (Sepia.FULL for the full effect)
   *
   * Filter.js has more information in general on filters.
   */
  setFilters(filters) {
    assert && assert(Array.isArray(filters), 'filters should be an array');
    assert && assert(_.every(filters, filter => filter instanceof Filter), 'filters should consist of Filter objects only');

    // We re-use the same array internally, so we don't reference a potentially-mutable array from outside.
    this._filters.length = 0;
    this._filters.push(...filters);
    this.invalidateHint();
    this.filterChangeEmitter.emit();
  }

  /**
   * See setFilters() for more information
   */
  set filters(value) {
    this.setFilters(value);
  }

  /**
   * See getFilters() for more information
   */
  get filters() {
    return this.getFilters();
  }

  /**
   * Returns the non-opacity filters for this Node.
   */
  getFilters() {
    return this._filters.slice();
  }

  /**
   * Sets what Property our pickableProperty is backed by, so that changes to this provided Property will change this
   * Node's pickability, and vice versa. This does not change this._pickableProperty. See TinyForwardingProperty.setTargetProperty()
   * for more info.
   *
   * PhET-iO Instrumented Nodes do not by default create their own instrumented pickableProperty, even though Node.visibleProperty does.
   */
  setPickableProperty(newTarget) {
    return this._pickableProperty.setTargetProperty(this, null, newTarget);
  }

  /**
   * See setPickableProperty() for more information
   */
  set pickableProperty(property) {
    this.setPickableProperty(property);
  }

  /**
   * See getPickableProperty() for more information
   */
  get pickableProperty() {
    return this.getPickableProperty();
  }

  /**
   * Get this Node's pickableProperty. Note! This is not the reciprocal of setPickableProperty. Node.prototype._pickableProperty
   * is a TinyForwardingProperty, and is set up to listen to changes from the pickableProperty provided by
   * setPickableProperty(), but the underlying reference does not change. This means the following:
   * const myNode = new Node();
   * const pickableProperty = new Property( false );
   * myNode.setPickableProperty( pickableProperty )
   * => myNode.getPickableProperty() !== pickableProperty (!!!!!!)
   *
   * Please use this with caution. See setPickableProperty() for more information.
   */
  getPickableProperty() {
    return this._pickableProperty;
  }

  /**
   * Sets whether this Node (and its subtree) will allow hit-testing (and thus user interaction), controlling what
   * Trail is returned from node.trailUnderPoint().
   *
   * Pickable can take one of three values:
   * - null: (default) pass-through behavior. Hit-testing will prune this subtree if there are no
   *         ancestors/descendants with either pickable: true set or with any input listeners.
   * - false: Hit-testing is pruned, nothing in this node or its subtree will respond to events or be picked.
   * - true: Hit-testing will not be pruned in this subtree, except for pickable: false cases.
   *
   * Hit testing is accomplished mainly with node.trailUnderPointer() and node.trailUnderPoint(), following the
   * above rules. Nodes that are not pickable (pruned) will not have input events targeted to them.
   *
   * The following rules (applied in the given order) determine whether a Node (really, a Trail) will receive input events:
   * 1. If the node or one of its ancestors has pickable: false OR is invisible, the Node *will not* receive events
   *    or hit testing.
   * 2. If the Node or one of its ancestors or descendants is pickable: true OR has an input listener attached, it
   *    *will* receive events or hit testing.
   * 3. Otherwise, it *will not* receive events or hit testing.
   *
   * This is useful for semi-transparent overlays or other visual elements that should be displayed but should not
   * prevent objects below from being manipulated by user input, and the default null value is used to increase
   * performance by ignoring areas that don't need user input.
   *
   * NOTE: If you want something to be picked "mouse is over it", but block input events even if there are listeners,
   *       then pickable:false is not appropriate, and inputEnabled:false is preferred.
   *
   * For a visual example of how pickability interacts with input listeners and visibility, see the notes at the
   * bottom of http://phetsims.github.io/scenery/doc/implementation-notes, or scenery/assets/pickability.svg.
   */
  setPickable(pickable) {
    assert && assert(pickable === null || typeof pickable === 'boolean');
    this._pickableProperty.set(pickable);
    return this;
  }

  /**
   * See setPickable() for more information
   */
  set pickable(value) {
    this.setPickable(value);
  }

  /**
   * See isPickable() for more information
   */
  get pickable() {
    return this.isPickable();
  }

  /**
   * Returns the pickability of this node.
   */
  isPickable() {
    return this._pickableProperty.value;
  }

  /**
   * Called when our pickableProperty changes values.
   */
  onPickablePropertyChange(pickable, oldPickable) {
    this._picker.onPickableChange(oldPickable, pickable);
    if (assertSlow) {
      this._picker.audit();
    }
    // TODO: invalidate the cursor somehow? #150
  }

  /**
   * Sets what Property our enabledProperty is backed by, so that changes to this provided Property will change this
   * Node's enabled, and vice versa. This does not change this._enabledProperty. See TinyForwardingProperty.setTargetProperty()
   * for more info.
   *
   *
   * NOTE For PhET-iO use:
   * All PhET-iO instrumented Nodes create their own instrumented enabledProperty (if one is not passed in as
   * an option). Once a Node's enabledProperty has been registered with PhET-iO, it cannot be "swapped out" for another.
   * If you need to "delay" setting an instrumented enabledProperty to this node, pass phetioEnabledPropertyInstrumented
   * to instrumentation call to this Node (where Tandem is provided).
   */
  setEnabledProperty(newTarget) {
    return this._enabledProperty.setTargetProperty(this, ENABLED_PROPERTY_TANDEM_NAME, newTarget);
  }

  /**
   * See setEnabledProperty() for more information
   */
  set enabledProperty(property) {
    this.setEnabledProperty(property);
  }

  /**
   * See getEnabledProperty() for more information
   */
  get enabledProperty() {
    return this.getEnabledProperty();
  }

  /**
   * Get this Node's enabledProperty. Note! This is not the reciprocal of setEnabledProperty. Node.prototype._enabledProperty
   * is a TinyForwardingProperty, and is set up to listen to changes from the enabledProperty provided by
   * setEnabledProperty(), but the underlying reference does not change. This means the following:
   * const myNode = new Node();
   * const enabledProperty = new Property( false );
   * myNode.setEnabledProperty( enabledProperty )
   * => myNode.getEnabledProperty() !== enabledProperty (!!!!!!)
   *
   * Please use this with caution. See setEnabledProperty() for more information.
   */
  getEnabledProperty() {
    return this._enabledProperty;
  }

  /**
   * Use this to automatically create a forwarded, PhET-iO instrumented enabledProperty internal to Node. This is different
   * from visible because enabled by default doesn't not create this forwarded Property.
   */
  setPhetioEnabledPropertyInstrumented(phetioEnabledPropertyInstrumented) {
    return this._enabledProperty.setTargetPropertyInstrumented(phetioEnabledPropertyInstrumented, this);
  }

  /**
   * See setPhetioEnabledPropertyInstrumented() for more information
   */
  set phetioEnabledPropertyInstrumented(value) {
    this.setPhetioEnabledPropertyInstrumented(value);
  }

  /**
   * See getPhetioEnabledPropertyInstrumented() for more information
   */
  get phetioEnabledPropertyInstrumented() {
    return this.getPhetioEnabledPropertyInstrumented();
  }
  getPhetioEnabledPropertyInstrumented() {
    return this._enabledProperty.getTargetPropertyInstrumented();
  }

  /**
   * Sets whether this Node is enabled
   */
  setEnabled(enabled) {
    assert && assert(enabled === null || typeof enabled === 'boolean');
    this._enabledProperty.set(enabled);
    return this;
  }

  /**
   * See setEnabled() for more information
   */
  set enabled(value) {
    this.setEnabled(value);
  }

  /**
   * See isEnabled() for more information
   */
  get enabled() {
    return this.isEnabled();
  }

  /**
   * Returns the enabled of this node.
   */
  isEnabled() {
    return this._enabledProperty.value;
  }

  /**
   * Called when enabledProperty changes values.
   * - override this to change the behavior of enabled
   */
  onEnabledPropertyChange(enabled) {
    !enabled && this.interruptSubtreeInput();
    this.inputEnabled = enabled;
    if (this.disabledOpacityProperty.value !== 1) {
      this.filterChangeEmitter.emit();
    }
  }

  /**
   * Sets what Property our inputEnabledProperty is backed by, so that changes to this provided Property will change this whether this
   * Node's input is enabled, and vice versa. This does not change this._inputEnabledProperty. See TinyForwardingProperty.setTargetProperty()
   * for more info.
   *
   * NOTE For PhET-iO use:
   * All PhET-iO instrumented Nodes create their own instrumented inputEnabledProperty (if one is not passed in as
   * an option). Once a Node's inputEnabledProperty has been registered with PhET-iO, it cannot be "swapped out" for another.
   * If you need to "delay" setting an instrumented inputEnabledProperty to this node, pass phetioInputEnabledPropertyInstrumented
   * to instrumentation call to this Node (where Tandem is provided).
   */
  setInputEnabledProperty(newTarget) {
    return this._inputEnabledProperty.setTargetProperty(this, INPUT_ENABLED_PROPERTY_TANDEM_NAME, newTarget);
  }

  /**
   * See setInputEnabledProperty() for more information
   */
  set inputEnabledProperty(property) {
    this.setInputEnabledProperty(property);
  }

  /**
   * See getInputEnabledProperty() for more information
   */
  get inputEnabledProperty() {
    return this.getInputEnabledProperty();
  }

  /**
   * Get this Node's inputEnabledProperty. Note! This is not the reciprocal of setInputEnabledProperty. Node.prototype._inputEnabledProperty
   * is a TinyForwardingProperty, and is set up to listen to changes from the inputEnabledProperty provided by
   * setInputEnabledProperty(), but the underlying reference does not change. This means the following:
   * const myNode = new Node();
   * const inputEnabledProperty = new Property( false );
   * myNode.setInputEnabledProperty( inputEnabledProperty )
   * => myNode.getInputEnabledProperty() !== inputEnabledProperty (!!!!!!)
   *
   * Please use this with caution. See setInputEnabledProperty() for more information.
   */
  getInputEnabledProperty() {
    return this._inputEnabledProperty;
  }

  /**
   * Use this to automatically create a forwarded, PhET-iO instrumented inputEnabledProperty internal to Node. This is different
   * from visible because inputEnabled by default doesn't not create this forwarded Property.
   */
  setPhetioInputEnabledPropertyInstrumented(phetioInputEnabledPropertyInstrumented) {
    return this._inputEnabledProperty.setTargetPropertyInstrumented(phetioInputEnabledPropertyInstrumented, this);
  }

  /**
   * See setPhetioInputEnabledPropertyInstrumented() for more information
   */
  set phetioInputEnabledPropertyInstrumented(value) {
    this.setPhetioInputEnabledPropertyInstrumented(value);
  }

  /**
   * See getPhetioInputEnabledPropertyInstrumented() for more information
   */
  get phetioInputEnabledPropertyInstrumented() {
    return this.getPhetioInputEnabledPropertyInstrumented();
  }
  getPhetioInputEnabledPropertyInstrumented() {
    return this._inputEnabledProperty.getTargetPropertyInstrumented();
  }

  /**
   * Sets whether input is enabled for this Node and its subtree. If false, input event listeners will not be fired
   * on this Node or its descendants in the picked Trail. This does NOT effect picking (what Trail/nodes are under
   * a pointer), but only effects what listeners are fired.
   *
   * Additionally, this will affect cursor behavior. If inputEnabled=false, descendants of this Node will not be
   * checked when determining what cursor will be shown. Instead, if a pointer (e.g. mouse) is over a descendant,
   * this Node's cursor will be checked first, then ancestors will be checked as normal.
   */
  setInputEnabled(inputEnabled) {
    this.inputEnabledProperty.value = inputEnabled;
  }

  /**
   * See setInputEnabled() for more information
   */
  set inputEnabled(value) {
    this.setInputEnabled(value);
  }

  /**
   * See isInputEnabled() for more information
   */
  get inputEnabled() {
    return this.isInputEnabled();
  }

  /**
   * Returns whether input is enabled for this Node and its subtree. See setInputEnabled for more documentation.
   */
  isInputEnabled() {
    return this.inputEnabledProperty.value;
  }

  /**
   * Sets all of the input listeners attached to this Node.
   *
   * This is equivalent to removing all current input listeners with removeInputListener() and adding all new
   * listeners (in order) with addInputListener().
   */
  setInputListeners(inputListeners) {
    assert && assert(Array.isArray(inputListeners));

    // Remove all old input listeners
    while (this._inputListeners.length) {
      this.removeInputListener(this._inputListeners[0]);
    }

    // Add in all new input listeners
    for (let i = 0; i < inputListeners.length; i++) {
      this.addInputListener(inputListeners[i]);
    }
    return this;
  }

  /**
   * See setInputListeners() for more information
   */
  set inputListeners(value) {
    this.setInputListeners(value);
  }

  /**
   * See getInputListeners() for more information
   */
  get inputListeners() {
    return this.getInputListeners();
  }

  /**
   * Returns a copy of all of our input listeners.
   */
  getInputListeners() {
    return this._inputListeners.slice(0); // defensive copy
  }

  /**
   * Sets the CSS cursor string that should be used when the mouse is over this node. null is the default, and
   * indicates that ancestor nodes (or the browser default) should be used.
   *
   * @param cursor - A CSS cursor string, like 'pointer', or 'none' - Examples are:
   * auto default none inherit help pointer progress wait crosshair text vertical-text alias copy move no-drop not-allowed
   * e-resize n-resize w-resize s-resize nw-resize ne-resize se-resize sw-resize ew-resize ns-resize nesw-resize nwse-resize
   * context-menu cell col-resize row-resize all-scroll url( ... ) --> does it support data URLs?
   */
  setCursor(cursor) {
    // TODO: consider a mapping of types to set reasonable defaults

    // allow the 'auto' cursor type to let the ancestors or scene pick the cursor type
    this._cursor = cursor === 'auto' ? null : cursor;
  }

  /**
   * See setCursor() for more information
   */
  set cursor(value) {
    this.setCursor(value);
  }

  /**
   * See getCursor() for more information
   */
  get cursor() {
    return this.getCursor();
  }

  /**
   * Returns the CSS cursor string for this node, or null if there is no cursor specified.
   */
  getCursor() {
    return this._cursor;
  }

  /**
   * Returns the CSS cursor that could be applied either by this Node itself, or from any of its input listeners'
   * preferences. (scenery-internal)
   */
  getEffectiveCursor() {
    if (this._cursor) {
      return this._cursor;
    }
    for (let i = 0; i < this._inputListeners.length; i++) {
      const inputListener = this._inputListeners[i];
      if (inputListener.cursor) {
        return inputListener.cursor;
      }
    }
    return null;
  }

  /**
   * Sets the hit-tested mouse area for this Node (see constructor for more advanced documentation). Use null for the
   * default behavior.
   */
  setMouseArea(area) {
    assert && assert(area === null || area instanceof Shape || area instanceof Bounds2, 'mouseArea needs to be a phet.kite.Shape, phet.dot.Bounds2, or null');
    if (this._mouseArea !== area) {
      this._mouseArea = area; // TODO: could change what is under the mouse, invalidate!

      this._picker.onMouseAreaChange();
      if (assertSlow) {
        this._picker.audit();
      }
    }
    return this;
  }

  /**
   * See setMouseArea() for more information
   */
  set mouseArea(value) {
    this.setMouseArea(value);
  }

  /**
   * See getMouseArea() for more information
   */
  get mouseArea() {
    return this.getMouseArea();
  }

  /**
   * Returns the hit-tested mouse area for this node.
   */
  getMouseArea() {
    return this._mouseArea;
  }

  /**
   * Sets the hit-tested touch area for this Node (see constructor for more advanced documentation). Use null for the
   * default behavior.
   */
  setTouchArea(area) {
    assert && assert(area === null || area instanceof Shape || area instanceof Bounds2, 'touchArea needs to be a phet.kite.Shape, phet.dot.Bounds2, or null');
    if (this._touchArea !== area) {
      this._touchArea = area; // TODO: could change what is under the touch, invalidate!

      this._picker.onTouchAreaChange();
      if (assertSlow) {
        this._picker.audit();
      }
    }
    return this;
  }

  /**
   * See setTouchArea() for more information
   */
  set touchArea(value) {
    this.setTouchArea(value);
  }

  /**
   * See getTouchArea() for more information
   */
  get touchArea() {
    return this.getTouchArea();
  }

  /**
   * Returns the hit-tested touch area for this node.
   */
  getTouchArea() {
    return this._touchArea;
  }

  /**
   * Sets a clipped shape where only content in our local coordinate frame that is inside the clip area will be shown
   * (anything outside is fully transparent).
   */
  setClipArea(shape) {
    assert && assert(shape === null || shape instanceof Shape, 'clipArea needs to be a phet.kite.Shape, or null');
    if (this.clipArea !== shape) {
      this.clipAreaProperty.value = shape;
      this.invalidateBounds();
      this._picker.onClipAreaChange();
      if (assertSlow) {
        this._picker.audit();
      }
    }
  }

  /**
   * See setClipArea() for more information
   */
  set clipArea(value) {
    this.setClipArea(value);
  }

  /**
   * See getClipArea() for more information
   */
  get clipArea() {
    return this.getClipArea();
  }

  /**
   * Returns the clipped area for this node.
   */
  getClipArea() {
    return this.clipAreaProperty.value;
  }

  /**
   * Returns whether this Node has a clip area.
   */
  hasClipArea() {
    return this.clipArea !== null;
  }

  /**
   * Sets what self renderers (and other bitmask flags) are supported by this node.
   */
  setRendererBitmask(bitmask) {
    assert && assert(isFinite(bitmask));
    if (bitmask !== this._rendererBitmask) {
      this._rendererBitmask = bitmask;
      this._rendererSummary.selfChange();
      this.instanceRefreshEmitter.emit();
    }
  }

  /**
   * Meant to be overridden, so that it can be called to ensure that the renderer bitmask will be up-to-date.
   */
  invalidateSupportedRenderers() {
    // see docs
  }

  /*---------------------------------------------------------------------------*
   * Hints
   *----------------------------------------------------------------------------*/

  /**
   * When ANY hint changes, we refresh everything currently (for safety, this may be possible to make more specific
   * in the future, but hint changes are not particularly common performance bottleneck).
   */
  invalidateHint() {
    this.rendererSummaryRefreshEmitter.emit();
    this.instanceRefreshEmitter.emit();
  }

  /**
   * Sets a preferred renderer for this Node and its sub-tree. Scenery will attempt to use this renderer under here
   * unless it isn't supported, OR another preferred renderer is set as a closer ancestor. Acceptable values are:
   * - null (default, no preference)
   * - 'canvas'
   * - 'svg'
   * - 'dom'
   * - 'webgl'
   */
  setRenderer(renderer) {
    assert && assert(renderer === null || renderer === 'canvas' || renderer === 'svg' || renderer === 'dom' || renderer === 'webgl', 'Renderer input should be null, or one of: "canvas", "svg", "dom" or "webgl".');
    let newRenderer = 0;
    if (renderer === 'canvas') {
      newRenderer = Renderer.bitmaskCanvas;
    } else if (renderer === 'svg') {
      newRenderer = Renderer.bitmaskSVG;
    } else if (renderer === 'dom') {
      newRenderer = Renderer.bitmaskDOM;
    } else if (renderer === 'webgl') {
      newRenderer = Renderer.bitmaskWebGL;
    }
    assert && assert(renderer === null === (newRenderer === 0), 'We should only end up with no actual renderer if renderer is null');
    if (this._hints.renderer !== newRenderer) {
      this._hints.renderer = newRenderer;
      this.invalidateHint();
    }
  }

  /**
   * See setRenderer() for more information
   */
  set renderer(value) {
    this.setRenderer(value);
  }

  /**
   * See getRenderer() for more information
   */
  get renderer() {
    return this.getRenderer();
  }

  /**
   * Returns the preferred renderer (if any) of this node, as a string.
   */
  getRenderer() {
    if (this._hints.renderer === 0) {
      return null;
    } else if (this._hints.renderer === Renderer.bitmaskCanvas) {
      return 'canvas';
    } else if (this._hints.renderer === Renderer.bitmaskSVG) {
      return 'svg';
    } else if (this._hints.renderer === Renderer.bitmaskDOM) {
      return 'dom';
    } else if (this._hints.renderer === Renderer.bitmaskWebGL) {
      return 'webgl';
    }
    assert && assert(false, 'Seems to be an invalid renderer?');
    return null;
  }

  /**
   * Sets whether or not Scenery will try to put this Node (and its descendants) into a separate SVG/Canvas/WebGL/etc.
   * layer, different from other siblings or other nodes. Can be used for performance purposes.
   */
  setLayerSplit(split) {
    if (split !== this._hints.layerSplit) {
      this._hints.layerSplit = split;
      this.invalidateHint();
    }
  }

  /**
   * See setLayerSplit() for more information
   */
  set layerSplit(value) {
    this.setLayerSplit(value);
  }

  /**
   * See isLayerSplit() for more information
   */
  get layerSplit() {
    return this.isLayerSplit();
  }

  /**
   * Returns whether the layerSplit performance flag is set.
   */
  isLayerSplit() {
    return this._hints.layerSplit;
  }

  /**
   * Sets whether or not Scenery will take into account that this Node plans to use opacity. Can have performance
   * gains if there need to be multiple layers for this node's descendants.
   */
  setUsesOpacity(usesOpacity) {
    if (usesOpacity !== this._hints.usesOpacity) {
      this._hints.usesOpacity = usesOpacity;
      this.invalidateHint();
    }
  }

  /**
   * See setUsesOpacity() for more information
   */
  set usesOpacity(value) {
    this.setUsesOpacity(value);
  }

  /**
   * See getUsesOpacity() for more information
   */
  get usesOpacity() {
    return this.getUsesOpacity();
  }

  /**
   * Returns whether the usesOpacity performance flag is set.
   */
  getUsesOpacity() {
    return this._hints.usesOpacity;
  }

  /**
   * Sets a flag for whether whether the contents of this Node and its children should be displayed in a separate
   * DOM element that is transformed with CSS transforms. It can have potential speedups, since the browser may not
   * have to re-rasterize contents when it is animated.
   */
  setCSSTransform(cssTransform) {
    if (cssTransform !== this._hints.cssTransform) {
      this._hints.cssTransform = cssTransform;
      this.invalidateHint();
    }
  }

  /**
   * See setCSSTransform() for more information
   */
  set cssTransform(value) {
    this.setCSSTransform(value);
  }

  /**
   * See isCSSTransformed() for more information
   */
  get cssTransform() {
    return this.isCSSTransformed();
  }

  /**
   * Returns whether the cssTransform performance flag is set.
   */
  isCSSTransformed() {
    return this._hints.cssTransform;
  }

  /**
   * Sets a performance flag for whether layers/DOM elements should be excluded (or included) when things are
   * invisible. The default is false, and invisible content is in the DOM, but hidden.
   */
  setExcludeInvisible(excludeInvisible) {
    if (excludeInvisible !== this._hints.excludeInvisible) {
      this._hints.excludeInvisible = excludeInvisible;
      this.invalidateHint();
    }
  }

  /**
   * See setExcludeInvisible() for more information
   */
  set excludeInvisible(value) {
    this.setExcludeInvisible(value);
  }

  /**
   * See isExcludeInvisible() for more information
   */
  get excludeInvisible() {
    return this.isExcludeInvisible();
  }

  /**
   * Returns whether the excludeInvisible performance flag is set.
   */
  isExcludeInvisible() {
    return this._hints.excludeInvisible;
  }

  /**
   * If this is set to true, child nodes that are invisible will NOT contribute to the bounds of this node.
   *
   * The default is for child nodes bounds' to be included in this node's bounds, but that would in general be a
   * problem for layout containers or other situations, see https://github.com/phetsims/joist/issues/608.
   */
  setExcludeInvisibleChildrenFromBounds(excludeInvisibleChildrenFromBounds) {
    if (excludeInvisibleChildrenFromBounds !== this._excludeInvisibleChildrenFromBounds) {
      this._excludeInvisibleChildrenFromBounds = excludeInvisibleChildrenFromBounds;
      this.invalidateBounds();
    }
  }

  /**
   * See setExcludeInvisibleChildrenFromBounds() for more information
   */
  set excludeInvisibleChildrenFromBounds(value) {
    this.setExcludeInvisibleChildrenFromBounds(value);
  }

  /**
   * See isExcludeInvisibleChildrenFromBounds() for more information
   */
  get excludeInvisibleChildrenFromBounds() {
    return this.isExcludeInvisibleChildrenFromBounds();
  }

  /**
   * Returns whether the excludeInvisibleChildrenFromBounds flag is set, see
   * setExcludeInvisibleChildrenFromBounds() for documentation.
   */
  isExcludeInvisibleChildrenFromBounds() {
    return this._excludeInvisibleChildrenFromBounds;
  }

  /**
   * Sets options that are provided to layout managers in order to customize positioning of this node.
   */
  setLayoutOptions(layoutOptions) {
    assert && assert(layoutOptions === null || typeof layoutOptions === 'object' && Object.getPrototypeOf(layoutOptions) === Object.prototype, 'layoutOptions should be null or an plain options-style object');
    if (layoutOptions !== this._layoutOptions) {
      this._layoutOptions = layoutOptions;
      this.layoutOptionsChangedEmitter.emit();
    }
  }
  set layoutOptions(value) {
    this.setLayoutOptions(value);
  }
  get layoutOptions() {
    return this.getLayoutOptions();
  }
  getLayoutOptions() {
    return this._layoutOptions;
  }
  mutateLayoutOptions(layoutOptions) {
    this.layoutOptions = optionize3()({}, this.layoutOptions || {}, layoutOptions);
  }

  // Defaults indicating that we don't mix in WidthSizable/HeightSizable
  get widthSizable() {
    return false;
  }
  get heightSizable() {
    return false;
  }
  get extendsWidthSizable() {
    return false;
  }
  get extendsHeightSizable() {
    return false;
  }
  get extendsSizable() {
    return false;
  }

  /**
   * Sets the preventFit performance flag.
   */
  setPreventFit(preventFit) {
    if (preventFit !== this._hints.preventFit) {
      this._hints.preventFit = preventFit;
      this.invalidateHint();
    }
  }

  /**
   * See setPreventFit() for more information
   */
  set preventFit(value) {
    this.setPreventFit(value);
  }

  /**
   * See isPreventFit() for more information
   */
  get preventFit() {
    return this.isPreventFit();
  }

  /**
   * Returns whether the preventFit performance flag is set.
   */
  isPreventFit() {
    return this._hints.preventFit;
  }

  /**
   * Sets whether there is a custom WebGL scale applied to the Canvas, and if so what scale.
   */
  setWebGLScale(webglScale) {
    assert && assert(webglScale === null || typeof webglScale === 'number' && isFinite(webglScale));
    if (webglScale !== this._hints.webglScale) {
      this._hints.webglScale = webglScale;
      this.invalidateHint();
    }
  }

  /**
   * See setWebGLScale() for more information
   */
  set webglScale(value) {
    this.setWebGLScale(value);
  }

  /**
   * See getWebGLScale() for more information
   */
  get webglScale() {
    return this.getWebGLScale();
  }

  /**
   * Returns the value of the webglScale performance flag.
   */
  getWebGLScale() {
    return this._hints.webglScale;
  }

  /*---------------------------------------------------------------------------*
   * Trail operations
   *----------------------------------------------------------------------------*/

  /**
   * Returns the one Trail that starts from a node with no parents (or if the predicate is present, a Node that
   * satisfies it), and ends at this node. If more than one Trail would satisfy these conditions, an assertion is
   * thrown (please use getTrails() for those cases).
   *
   * @param [predicate] - If supplied, we will only return trails rooted at a Node that satisfies predicate( node ) == true
   */
  getUniqueTrail(predicate) {
    // Without a predicate, we'll be able to bail out the instant we hit a Node with 2+ parents, and it makes the
    // logic easier.
    if (!predicate) {
      const trail = new Trail();

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let node = this; // eslint-disable-line consistent-this

      while (node) {
        assert && assert(node._parents.length <= 1, `getUniqueTrail found a Node with ${node._parents.length} parents.`);
        trail.addAncestor(node);
        node = node._parents[0]; // should be undefined if there aren't any parents
      }

      return trail;
    }
    // With a predicate, we need to explore multiple parents (since the predicate may filter out all but one)
    else {
      const trails = this.getTrails(predicate);
      assert && assert(trails.length === 1, `getUniqueTrail found ${trails.length} matching trails for the predicate`);
      return trails[0];
    }
  }

  /**
   * Returns a Trail rooted at rootNode and ends at this node. Throws an assertion if the number of trails that match
   * this condition isn't exactly 1.
   */
  getUniqueTrailTo(rootNode) {
    return this.getUniqueTrail(node => rootNode === node);
  }

  /**
   * Returns an array of all Trails that start from nodes with no parent (or if a predicate is present, those that
   * satisfy the predicate), and ends at this node.
   *
   * @param [predicate] - If supplied, we will only return Trails rooted at nodes that satisfy predicate( node ) == true.
   */
  getTrails(predicate) {
    predicate = predicate || Node.defaultTrailPredicate;
    const trails = [];
    const trail = new Trail(this);
    Trail.appendAncestorTrailsWithPredicate(trails, trail, predicate);
    return trails;
  }

  /**
   * Returns an array of all Trails rooted at rootNode and end at this node.
   */
  getTrailsTo(rootNode) {
    return this.getTrails(node => node === rootNode);
  }

  /**
   * Returns an array of all Trails rooted at this Node and end with nodes with no children (or if a predicate is
   * present, those that satisfy the predicate).
   *
   * @param [predicate] - If supplied, we will only return Trails ending at nodes that satisfy predicate( node ) == true.
   */
  getLeafTrails(predicate) {
    predicate = predicate || Node.defaultLeafTrailPredicate;
    const trails = [];
    const trail = new Trail(this);
    Trail.appendDescendantTrailsWithPredicate(trails, trail, predicate);
    return trails;
  }

  /**
   * Returns an array of all Trails rooted at this Node and end with leafNode.
   */
  getLeafTrailsTo(leafNode) {
    return this.getLeafTrails(node => node === leafNode);
  }

  /**
   * Returns a Trail rooted at this node and ending at a Node that has no children (or if a predicate is provided, a
   * Node that satisfies the predicate). If more than one trail matches this description, an assertion will be fired.
   *
   * @param [predicate] - If supplied, we will return a Trail that ends with a Node that satisfies predicate( node ) == true
   */
  getUniqueLeafTrail(predicate) {
    const trails = this.getLeafTrails(predicate);
    assert && assert(trails.length === 1, `getUniqueLeafTrail found ${trails.length} matching trails for the predicate`);
    return trails[0];
  }

  /**
   * Returns a Trail rooted at this Node and ending at leafNode. If more than one trail matches this description,
   * an assertion will be fired.
   */
  getUniqueLeafTrailTo(leafNode) {
    return this.getUniqueLeafTrail(node => node === leafNode);
  }

  /**
   * Returns all nodes in the connected component, returned in an arbitrary order, including nodes that are ancestors
   * of this node.
   */
  getConnectedNodes() {
    const result = [];
    let fresh = this._children.concat(this._parents).concat(this);
    while (fresh.length) {
      const node = fresh.pop();
      if (!_.includes(result, node)) {
        result.push(node);
        fresh = fresh.concat(node._children, node._parents);
      }
    }
    return result;
  }

  /**
   * Returns all nodes in the subtree with this Node as its root, returned in an arbitrary order. Like
   * getConnectedNodes, but doesn't include parents.
   */
  getSubtreeNodes() {
    const result = [];
    let fresh = this._children.concat(this);
    while (fresh.length) {
      const node = fresh.pop();
      if (!_.includes(result, node)) {
        result.push(node);
        fresh = fresh.concat(node._children);
      }
    }
    return result;
  }

  /**
   * Returns all nodes that are connected to this node, sorted in topological order.
   */
  getTopologicallySortedNodes() {
    // see http://en.wikipedia.org/wiki/Topological_sorting
    const edges = {};
    const s = [];
    const l = [];
    let n;
    _.each(this.getConnectedNodes(), node => {
      edges[node.id] = {};
      _.each(node._children, m => {
        edges[node.id][m.id] = true;
      });
      if (!node.parents.length) {
        s.push(node);
      }
    });
    function handleChild(m) {
      delete edges[n.id][m.id];
      if (_.every(edges, children => !children[m.id])) {
        // there are no more edges to m
        s.push(m);
      }
    }
    while (s.length) {
      n = s.pop();
      l.push(n);
      _.each(n._children, handleChild);
    }

    // ensure that there are no edges left, since then it would contain a circular reference
    assert && assert(_.every(edges, children => _.every(children, final => false)), 'circular reference check');
    return l;
  }

  /**
   * Returns whether this.addChild( child ) will not cause circular references.
   */
  canAddChild(child) {
    if (this === child || _.includes(this._children, child)) {
      return false;
    }

    // see http://en.wikipedia.org/wiki/Topological_sorting
    // TODO: remove duplication with above handling?
    const edges = {};
    const s = [];
    const l = [];
    let n;
    _.each(this.getConnectedNodes().concat(child.getConnectedNodes()), node => {
      edges[node.id] = {};
      _.each(node._children, m => {
        edges[node.id][m.id] = true;
      });
      if (!node.parents.length && node !== child) {
        s.push(node);
      }
    });
    edges[this.id][child.id] = true; // add in our 'new' edge
    function handleChild(m) {
      delete edges[n.id][m.id];
      if (_.every(edges, children => !children[m.id])) {
        // there are no more edges to m
        s.push(m);
      }
    }
    while (s.length) {
      n = s.pop();
      l.push(n);
      _.each(n._children, handleChild);

      // handle our new edge
      if (n === this) {
        handleChild(child);
      }
    }

    // ensure that there are no edges left, since then it would contain a circular reference
    return _.every(edges, children => _.every(children, final => false));
  }

  /**
   * To be overridden in paintable Node types. Should hook into the drawable's prototype (presumably).
   *
   * Draws the current Node's self representation, assuming the wrapper's Canvas context is already in the local
   * coordinate frame of this node.
   *
   * @param wrapper
   * @param matrix - The transformation matrix already applied to the context.
   */
  canvasPaintSelf(wrapper, matrix) {
    // See subclass for implementation
  }

  /**
   * Renders this Node only (its self) into the Canvas wrapper, in its local coordinate frame.
   *
   * @param wrapper
   * @param matrix - The transformation matrix already applied to the context.
   */
  renderToCanvasSelf(wrapper, matrix) {
    if (this.isPainted() && this._rendererBitmask & Renderer.bitmaskCanvas) {
      this.canvasPaintSelf(wrapper, matrix);
    }
  }

  /**
   * Renders this Node and its descendants into the Canvas wrapper.
   *
   * @param wrapper
   * @param [matrix] - Optional transform to be applied
   */
  renderToCanvasSubtree(wrapper, matrix) {
    matrix = matrix || Matrix3.identity();
    wrapper.resetStyles();
    this.renderToCanvasSelf(wrapper, matrix);
    for (let i = 0; i < this._children.length; i++) {
      const child = this._children[i];

      // Ignore invalid (empty) bounds, since this would show nothing (and we couldn't compute fitted bounds for it).
      if (child.isVisible() && child.bounds.isValid()) {
        // For anything filter-like, we'll need to create a Canvas, render our child's content into that Canvas,
        // and then (applying the filter) render that into the Canvas provided.
        const requiresScratchCanvas = child.effectiveOpacity !== 1 || child.clipArea || child._filters.length;
        wrapper.context.save();
        matrix.multiplyMatrix(child._transform.getMatrix());
        matrix.canvasSetTransform(wrapper.context);
        if (requiresScratchCanvas) {
          // We'll attempt to fit the Canvas to the content to minimize memory use, see
          // https://github.com/phetsims/function-builder/issues/148

          // We're going to ignore content outside our wrapper context's canvas.
          // Added padding and round-out for cases where Canvas bounds might not be fully accurate
          // The matrix already includes the child's transform (so we use localBounds).
          // We won't go outside our parent canvas' bounds, since this would be a waste of memory (wouldn't be written)
          // The round-out will make sure we have pixel alignment, so that we won't get blurs or aliasing/blitting
          // effects when copying things over.
          const childCanvasBounds = child.localBounds.transformed(matrix).dilate(4).roundOut().constrainBounds(scratchBounds2Extra.setMinMax(0, 0, wrapper.canvas.width, wrapper.canvas.height));
          if (childCanvasBounds.width > 0 && childCanvasBounds.height > 0) {
            const canvas = document.createElement('canvas');

            // We'll set our Canvas to the fitted width, and will handle the offsets below.
            canvas.width = childCanvasBounds.width;
            canvas.height = childCanvasBounds.height;
            const context = canvas.getContext('2d');
            const childWrapper = new CanvasContextWrapper(canvas, context);

            // After our ancestor transform is applied, we'll need to apply another offset for fitted Canvas. We'll
            // need to pass this to descendants AND apply it to the sub-context.
            const subMatrix = matrix.copy().prependTranslation(-childCanvasBounds.minX, -childCanvasBounds.minY);
            subMatrix.canvasSetTransform(context);
            child.renderToCanvasSubtree(childWrapper, subMatrix);
            wrapper.context.save();
            if (child.clipArea) {
              wrapper.context.beginPath();
              child.clipArea.writeToContext(wrapper.context);
              wrapper.context.clip();
            }
            wrapper.context.setTransform(1, 0, 0, 1, 0, 0); // identity
            wrapper.context.globalAlpha = child.effectiveOpacity;
            let setFilter = false;
            if (child._filters.length) {
              // Filters shouldn't be too often, so less concerned about the GC here (and this is so much easier to read).
              // Performance bottleneck for not using this fallback style, so we're allowing it for Chrome even though
              // the visual differences may be present, see https://github.com/phetsims/scenery/issues/1139
              if (Features.canvasFilter && _.every(child._filters, filter => filter.isDOMCompatible())) {
                wrapper.context.filter = child._filters.map(filter => filter.getCSSFilterString()).join(' ');
                setFilter = true;
              } else {
                child._filters.forEach(filter => filter.applyCanvasFilter(childWrapper));
              }
            }

            // The inverse transform is applied to handle fitting
            wrapper.context.drawImage(canvas, childCanvasBounds.minX, childCanvasBounds.minY);
            wrapper.context.restore();
            if (setFilter) {
              wrapper.context.filter = 'none';
            }
          }
        } else {
          child.renderToCanvasSubtree(wrapper, matrix);
        }
        matrix.multiplyMatrix(child._transform.getInverse());
        wrapper.context.restore();
      }
    }
  }

  /**
   * @deprecated
   * Render this Node to the Canvas (clearing it first)
   */
  renderToCanvas(canvas, context, callback, backgroundColor) {
    assert && deprecationWarning('Node.renderToCanvas() is deprecated, please use Node.rasterized() instead');

    // should basically reset everything (and clear the Canvas)
    canvas.width = canvas.width; // eslint-disable-line no-self-assign

    if (backgroundColor) {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    const wrapper = new CanvasContextWrapper(canvas, context);
    this.renderToCanvasSubtree(wrapper, Matrix3.identity());
    callback && callback(); // this was originally asynchronous, so we had a callback
  }

  /**
   * Renders this Node to an HTMLCanvasElement. If toCanvas( callback ) is used, the canvas will contain the node's
   * entire bounds (if no x/y/width/height is provided)
   *
   * @param callback - callback( canvas, x, y, width, height ) is called, where x,y are computed if not specified.
   * @param [x] - The X offset for where the upper-left of the content drawn into the Canvas
   * @param [y] - The Y offset for where the upper-left of the content drawn into the Canvas
   * @param [width] - The width of the Canvas output
   * @param [height] - The height of the Canvas output
   */
  toCanvas(callback, x, y, width, height) {
    assert && assert(x === undefined || typeof x === 'number', 'If provided, x should be a number');
    assert && assert(y === undefined || typeof y === 'number', 'If provided, y should be a number');
    assert && assert(width === undefined || typeof width === 'number' && width >= 0 && width % 1 === 0, 'If provided, width should be a non-negative integer');
    assert && assert(height === undefined || typeof height === 'number' && height >= 0 && height % 1 === 0, 'If provided, height should be a non-negative integer');
    const padding = 2; // padding used if x and y are not set

    // for now, we add an unpleasant hack around Text and safe bounds in general. We don't want to add another Bounds2 object per Node for now.
    const bounds = this.getBounds().union(this.localToParentBounds(this.getSafeSelfBounds()));
    assert && assert(!bounds.isEmpty() || x !== undefined && y !== undefined && width !== undefined && height !== undefined, 'Should not call toCanvas on a Node with empty bounds, unless all dimensions are provided');
    x = x !== undefined ? x : Math.ceil(padding - bounds.minX);
    y = y !== undefined ? y : Math.ceil(padding - bounds.minY);
    width = width !== undefined ? width : Math.ceil(bounds.getWidth() + 2 * padding);
    height = height !== undefined ? height : Math.ceil(bounds.getHeight() + 2 * padding);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    // shift our rendering over by the desired amount
    context.translate(x, y);

    // for API compatibility, we apply our own transform here
    this._transform.getMatrix().canvasAppendTransform(context);
    const wrapper = new CanvasContextWrapper(canvas, context);
    this.renderToCanvasSubtree(wrapper, Matrix3.translation(x, y).timesMatrix(this._transform.getMatrix()));
    callback(canvas, x, y, width, height); // we used to be asynchronous
  }

  /**
   * Renders this Node to a Canvas, then calls the callback with the data URI from it.
   *
   * @param callback - callback( dataURI {string}, x, y, width, height ) is called, where x,y are computed if not specified.
   * @param [x] - The X offset for where the upper-left of the content drawn into the Canvas
   * @param [y] - The Y offset for where the upper-left of the content drawn into the Canvas
   * @param [width] - The width of the Canvas output
   * @param [height] - The height of the Canvas output
   */
  toDataURL(callback, x, y, width, height) {
    assert && assert(x === undefined || typeof x === 'number', 'If provided, x should be a number');
    assert && assert(y === undefined || typeof y === 'number', 'If provided, y should be a number');
    assert && assert(width === undefined || typeof width === 'number' && width >= 0 && width % 1 === 0, 'If provided, width should be a non-negative integer');
    assert && assert(height === undefined || typeof height === 'number' && height >= 0 && height % 1 === 0, 'If provided, height should be a non-negative integer');
    this.toCanvas((canvas, x, y, width, height) => {
      // this x and y shadow the outside parameters, and will be different if the outside parameters are undefined
      callback(canvas.toDataURL(), x, y, width, height);
    }, x, y, width, height);
  }

  /**
   * Calls the callback with an HTMLImageElement that contains this Node's subtree's visual form.
   * Will always be asynchronous.
   * @deprecated - Use node.rasterized() for creating a rasterized copy, or generally it's best to get the data
   *               URL instead directly.
   *
   * @param callback - callback( image {HTMLImageElement}, x, y ) is called
   * @param [x] - The X offset for where the upper-left of the content drawn into the Canvas
   * @param [y] - The Y offset for where the upper-left of the content drawn into the Canvas
   * @param [width] - The width of the Canvas output
   * @param [height] - The height of the Canvas output
   */
  toImage(callback, x, y, width, height) {
    assert && deprecationWarning('Node.toImage() is deprecated, please use Node.rasterized() instead');
    assert && assert(x === undefined || typeof x === 'number', 'If provided, x should be a number');
    assert && assert(y === undefined || typeof y === 'number', 'If provided, y should be a number');
    assert && assert(width === undefined || typeof width === 'number' && width >= 0 && width % 1 === 0, 'If provided, width should be a non-negative integer');
    assert && assert(height === undefined || typeof height === 'number' && height >= 0 && height % 1 === 0, 'If provided, height should be a non-negative integer');
    this.toDataURL((url, x, y) => {
      // this x and y shadow the outside parameters, and will be different if the outside parameters are undefined
      const img = document.createElement('img');
      img.onload = () => {
        callback(img, x, y);
        try {
          // @ts-expect-error - I believe we need to delete this
          delete img.onload;
        } catch (e) {
          // do nothing
        } // fails on Safari 5.1
      };

      img.src = url;
    }, x, y, width, height);
  }

  /**
   * Calls the callback with an Image Node that contains this Node's subtree's visual form. This is always
   * asynchronous, but the resulting image Node can be used with any back-end (Canvas/WebGL/SVG/etc.)
   * @deprecated - Use node.rasterized() instead (should avoid the asynchronous-ness)
   *
   * @param callback - callback( imageNode {Image} ) is called
   * @param [x] - The X offset for where the upper-left of the content drawn into the Canvas
   * @param [y] - The Y offset for where the upper-left of the content drawn into the Canvas
   * @param [width] - The width of the Canvas output
   * @param [height] - The height of the Canvas output
   */
  toImageNodeAsynchronous(callback, x, y, width, height) {
    assert && deprecationWarning('Node.toImageNodeAsyncrhonous() is deprecated, please use Node.rasterized() instead');
    assert && assert(x === undefined || typeof x === 'number', 'If provided, x should be a number');
    assert && assert(y === undefined || typeof y === 'number', 'If provided, y should be a number');
    assert && assert(width === undefined || typeof width === 'number' && width >= 0 && width % 1 === 0, 'If provided, width should be a non-negative integer');
    assert && assert(height === undefined || typeof height === 'number' && height >= 0 && height % 1 === 0, 'If provided, height should be a non-negative integer');
    this.toImage((image, x, y) => {
      callback(new Node({
        // eslint-disable-line no-html-constructors
        children: [new Image(image, {
          x: -x,
          y: -y
        })]
      }));
    }, x, y, width, height);
  }

  /**
   * Creates a Node containing an Image Node that contains this Node's subtree's visual form. This is always
   * synchronous, but the resulting image Node can ONLY used with Canvas/WebGL (NOT SVG).
   * @deprecated - Use node.rasterized() instead, should be mostly equivalent if useCanvas:true is provided.
   *
   * @param [x] - The X offset for where the upper-left of the content drawn into the Canvas
   * @param [y] - The Y offset for where the upper-left of the content drawn into the Canvas
   * @param [width] - The width of the Canvas output
   * @param [height] - The height of the Canvas output
   */
  toCanvasNodeSynchronous(x, y, width, height) {
    assert && deprecationWarning('Node.toCanvasNodeSynchronous() is deprecated, please use Node.rasterized() instead');
    assert && assert(x === undefined || typeof x === 'number', 'If provided, x should be a number');
    assert && assert(y === undefined || typeof y === 'number', 'If provided, y should be a number');
    assert && assert(width === undefined || typeof width === 'number' && width >= 0 && width % 1 === 0, 'If provided, width should be a non-negative integer');
    assert && assert(height === undefined || typeof height === 'number' && height >= 0 && height % 1 === 0, 'If provided, height should be a non-negative integer');
    let result = null;
    this.toCanvas((canvas, x, y) => {
      result = new Node({
        // eslint-disable-line no-html-constructors
        children: [new Image(canvas, {
          x: -x,
          y: -y
        })]
      });
    }, x, y, width, height);
    assert && assert(result, 'toCanvasNodeSynchronous requires that the node can be rendered only using Canvas');
    return result;
  }

  /**
   * Returns an Image that renders this Node. This is always synchronous, and sets initialWidth/initialHeight so that
   * we have the bounds immediately.  Use this method if you need to reduce the number of parent Nodes.
   *
   * NOTE: the resultant Image should be positioned using its bounds rather than (x,y).  To create a Node that can be
   * positioned like any other node, please use toDataURLNodeSynchronous.
   * @deprecated - Use node.rasterized() instead, should be mostly equivalent if wrap:false is provided.
   *
   * @param [x] - The X offset for where the upper-left of the content drawn into the Canvas
   * @param [y] - The Y offset for where the upper-left of the content drawn into the Canvas
   * @param [width] - The width of the Canvas output
   * @param [height] - The height of the Canvas output
   */
  toDataURLImageSynchronous(x, y, width, height) {
    assert && deprecationWarning('Node.toDataURLImageSychronous() is deprecated, please use Node.rasterized() instead');
    assert && assert(x === undefined || typeof x === 'number', 'If provided, x should be a number');
    assert && assert(y === undefined || typeof y === 'number', 'If provided, y should be a number');
    assert && assert(width === undefined || typeof width === 'number' && width >= 0 && width % 1 === 0, 'If provided, width should be a non-negative integer');
    assert && assert(height === undefined || typeof height === 'number' && height >= 0 && height % 1 === 0, 'If provided, height should be a non-negative integer');
    let result = null;
    this.toDataURL((dataURL, x, y, width, height) => {
      result = new Image(dataURL, {
        x: -x,
        y: -y,
        initialWidth: width,
        initialHeight: height
      });
    }, x, y, width, height);
    assert && assert(result, 'toDataURL failed to return a result synchronously');
    return result;
  }

  /**
   * Returns a Node that contains this Node's subtree's visual form. This is always synchronous, and sets
   * initialWidth/initialHeight so that we have the bounds immediately.  An extra wrapper Node is provided
   * so that transforms can be done independently.  Use this method if you need to be able to transform the node
   * the same way as if it had not been rasterized.
   * @deprecated - Use node.rasterized() instead, should be mostly equivalent
   *
   * @param [x] - The X offset for where the upper-left of the content drawn into the Canvas
   * @param [y] - The Y offset for where the upper-left of the content drawn into the Canvas
   * @param [width] - The width of the Canvas output
   * @param [height] - The height of the Canvas output
   */
  toDataURLNodeSynchronous(x, y, width, height) {
    assert && deprecationWarning('Node.toDataURLNodeSynchronous() is deprecated, please use Node.rasterized() instead');
    assert && assert(x === undefined || typeof x === 'number', 'If provided, x should be a number');
    assert && assert(y === undefined || typeof y === 'number', 'If provided, y should be a number');
    assert && assert(width === undefined || typeof width === 'number' && width >= 0 && width % 1 === 0, 'If provided, width should be a non-negative integer');
    assert && assert(height === undefined || typeof height === 'number' && height >= 0 && height % 1 === 0, 'If provided, height should be a non-negative integer');
    return new Node({
      // eslint-disable-line no-html-constructors
      children: [this.toDataURLImageSynchronous(x, y, width, height)]
    });
  }

  /**
   * Returns a Node (backed by a scenery Image) that is a rasterized version of this node.
   *
   * @param [options] - See below options. This is also passed directly to the created Image object.
   */
  rasterized(providedOptions) {
    const options = optionize()({
      // {number} - Controls the resolution of the image relative to the local view units. For example, if our Node is
      // ~100 view units across (in the local coordinate frame) but you want the image to actually have a ~200-pixel
      // resolution, provide resolution:2.
      resolution: 1,
      // {Bounds2|null} - If provided, it will control the x/y/width/height of the toCanvas call. See toCanvas for
      // details on how this controls the rasterization. This is in the "parent" coordinate frame, similar to
      // node.bounds.
      sourceBounds: null,
      // {boolean} - If true, the localBounds of the result will be set in a way such that it will precisely match
      // the visible bounds of the original Node (this). Note that antialiased content (with a much lower resolution)
      // may somewhat spill outside these bounds if this is set to true. Usually this is fine and should be the
      // recommended option. If sourceBounds are provided, they will restrict the used bounds (so it will just
      // represent the bounds of the sliced part of the image).
      useTargetBounds: true,
      // {boolean} - If true, the created Image Node gets wrapped in an extra Node so that it can be transformed
      // independently. If there is no need to transform the resulting node, wrap:false can be passed so that no extra
      // Node is created.
      wrap: true,
      // {boolean} - If true, it will directly use the <canvas> element (only works with canvas/webgl renderers)
      // instead of converting this into a form that can be used with any renderer. May have slightly better
      // performance if svg/dom renderers do not need to be used.
      useCanvas: false,
      // To be passed to the Image node created from the rasterization. See below for options that will override
      // what is passed in.
      imageOptions: {}
    }, providedOptions);
    const resolution = options.resolution;
    const sourceBounds = options.sourceBounds;
    if (assert) {
      assert(typeof resolution === 'number' && resolution > 0, 'resolution should be a positive number');
      assert(sourceBounds === null || sourceBounds instanceof Bounds2, 'sourceBounds should be null or a Bounds2');
      if (sourceBounds) {
        assert(sourceBounds.isValid(), 'sourceBounds should be valid (finite non-negative)');
        assert(Number.isInteger(sourceBounds.width), 'sourceBounds.width should be an integer');
        assert(Number.isInteger(sourceBounds.height), 'sourceBounds.height should be an integer');
      }
    }

    // We'll need to wrap it in a container Node temporarily (while rasterizing) for the scale
    const wrapperNode = new Node({
      // eslint-disable-line no-html-constructors
      scale: resolution,
      children: [this]
    });
    let transformedBounds = sourceBounds || this.getSafeTransformedVisibleBounds().dilated(2).roundedOut();

    // Unfortunately if we provide a resolution AND bounds, we can't use the source bounds directly.
    if (resolution !== 1) {
      transformedBounds = new Bounds2(resolution * transformedBounds.minX, resolution * transformedBounds.minY, resolution * transformedBounds.maxX, resolution * transformedBounds.maxY);
      // Compensate for non-integral transformedBounds after our resolution transform
      if (transformedBounds.width % 1 !== 0) {
        transformedBounds.maxX += 1 - transformedBounds.width % 1;
      }
      if (transformedBounds.height % 1 !== 0) {
        transformedBounds.maxY += 1 - transformedBounds.height % 1;
      }
    }
    let image = null;

    // NOTE: This callback is executed SYNCHRONOUSLY
    function callback(canvas, x, y, width, height) {
      const imageSource = options.useCanvas ? canvas : canvas.toDataURL();
      image = new Image(imageSource, combineOptions({}, options.imageOptions, {
        x: -x,
        y: -y,
        initialWidth: width,
        initialHeight: height
      }));

      // We need to prepend the scale due to order of operations
      image.scale(1 / resolution, 1 / resolution, true);
    }

    // NOTE: Rounding necessary due to floating point arithmetic in the width/height computation of the bounds
    wrapperNode.toCanvas(callback, -transformedBounds.minX, -transformedBounds.minY, Utils.roundSymmetric(transformedBounds.width), Utils.roundSymmetric(transformedBounds.height));
    assert && assert(image, 'The toCanvas should have executed synchronously');
    wrapperNode.dispose();

    // For our useTargetBounds option, we do NOT want to include any "safe" bounds, and instead want to stay true to
    // the original bounds. We do filter out invisible subtrees to set the bounds.
    let finalParentBounds = this.getVisibleBounds();
    if (sourceBounds) {
      // If we provide sourceBounds, don't have resulting bounds that go outside.
      finalParentBounds = sourceBounds.intersection(finalParentBounds);
    }
    if (options.useTargetBounds) {
      image.imageBounds = image.parentToLocalBounds(finalParentBounds);
    }
    if (options.wrap) {
      const wrappedNode = new Node({
        children: [image]
      }); // eslint-disable-line no-html-constructors
      if (options.useTargetBounds) {
        wrappedNode.localBounds = finalParentBounds;
      }
      return wrappedNode;
    } else {
      if (options.useTargetBounds) {
        image.localBounds = image.parentToLocalBounds(finalParentBounds);
      }
      return image;
    }
  }

  /**
   * Creates a DOM drawable for this Node's self representation. (scenery-internal)
   *
   * Implemented by subtypes that support DOM self drawables. There is no need to implement this for subtypes that
   * do not allow the DOM renderer (not set in its rendererBitmask).
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createDOMDrawable(renderer, instance) {
    throw new Error('createDOMDrawable is abstract. The subtype should either override this method, or not support the DOM renderer');
  }

  /**
   * Creates an SVG drawable for this Node's self representation. (scenery-internal)
   *
   * Implemented by subtypes that support SVG self drawables. There is no need to implement this for subtypes that
   * do not allow the SVG renderer (not set in its rendererBitmask).
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createSVGDrawable(renderer, instance) {
    throw new Error('createSVGDrawable is abstract. The subtype should either override this method, or not support the DOM renderer');
  }

  /**
   * Creates a Canvas drawable for this Node's self representation. (scenery-internal)
   *
   * Implemented by subtypes that support Canvas self drawables. There is no need to implement this for subtypes that
   * do not allow the Canvas renderer (not set in its rendererBitmask).
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createCanvasDrawable(renderer, instance) {
    throw new Error('createCanvasDrawable is abstract. The subtype should either override this method, or not support the DOM renderer');
  }

  /**
   * Creates a WebGL drawable for this Node's self representation. (scenery-internal)
   *
   * Implemented by subtypes that support WebGL self drawables. There is no need to implement this for subtypes that
   * do not allow the WebGL renderer (not set in its rendererBitmask).
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createWebGLDrawable(renderer, instance) {
    throw new Error('createWebGLDrawable is abstract. The subtype should either override this method, or not support the DOM renderer');
  }

  /*---------------------------------------------------------------------------*
   * Instance handling
   *----------------------------------------------------------------------------*/

  /**
   * Returns a reference to the instances array. (scenery-internal)
   */
  getInstances() {
    return this._instances;
  }

  /**
   * See getInstances() for more information (scenery-internal)
   */
  get instances() {
    return this.getInstances();
  }

  /**
   * Adds an Instance reference to our array. (scenery-internal)
   */
  addInstance(instance) {
    this._instances.push(instance);
    this.changedInstanceEmitter.emit(instance, true);
  }

  /**
   * Removes an Instance reference from our array. (scenery-internal)
   */
  removeInstance(instance) {
    const index = _.indexOf(this._instances, instance);
    assert && assert(index !== -1, 'Cannot remove a Instance from a Node if it was not there');
    this._instances.splice(index, 1);
    this.changedInstanceEmitter.emit(instance, false);
  }

  /**
   * Returns whether this Node was visually rendered/displayed by any Display in the last updateDisplay() call. Note
   * that something can be independently displayed visually, and in the PDOM; this method only checks visually.
   *
   * @param [display] - if provided, only check if was visible on this particular Display
   */
  wasVisuallyDisplayed(display) {
    for (let i = 0; i < this._instances.length; i++) {
      const instance = this._instances[i];

      // If no display is provided, any instance visibility is enough to be visually displayed
      if (instance.visible && (!display || instance.display === display)) {
        return true;
      }
    }
    return false;
  }

  /*---------------------------------------------------------------------------*
   * Display handling
   *----------------------------------------------------------------------------*/

  /**
   * Returns a reference to the display array. (scenery-internal)
   */
  getRootedDisplays() {
    return this._rootedDisplays;
  }

  /**
   * See getRootedDisplays() for more information (scenery-internal)
   */
  get rootedDisplays() {
    return this.getRootedDisplays();
  }

  /**
   * Adds an display reference to our array. (scenery-internal)
   */
  addRootedDisplay(display) {
    this._rootedDisplays.push(display);

    // Defined in ParallelDOM.js
    this._pdomDisplaysInfo.onAddedRootedDisplay(display);
  }

  /**
   * Removes a Display reference from our array. (scenery-internal)
   */
  removeRootedDisplay(display) {
    const index = _.indexOf(this._rootedDisplays, display);
    assert && assert(index !== -1, 'Cannot remove a Display from a Node if it was not there');
    this._rootedDisplays.splice(index, 1);

    // Defined in ParallelDOM.js
    this._pdomDisplaysInfo.onRemovedRootedDisplay(display);
  }
  getRecursiveConnectedDisplays(displays) {
    if (this.rootedDisplays.length) {
      displays.push(...this.rootedDisplays);
    }
    for (let i = 0; i < this._parents.length; i++) {
      displays.push(...this._parents[i].getRecursiveConnectedDisplays(displays));
    }

    // do not allow duplicate Displays to get collected infinitely
    return _.uniq(displays);
  }

  /**
   * Get a list of the displays that are connected to this Node. Gathered by looking up the scene graph ancestors and
   * collected all rooted Displays along the way.
   */
  getConnectedDisplays() {
    return _.uniq(this.getRecursiveConnectedDisplays([]));
  }

  /*---------------------------------------------------------------------------*
   * Coordinate transform methods
   *----------------------------------------------------------------------------*/

  /**
   * Returns a point transformed from our local coordinate frame into our parent coordinate frame. Applies our node's
   * transform to it.
   */
  localToParentPoint(point) {
    return this._transform.transformPosition2(point);
  }

  /**
   * Returns bounds transformed from our local coordinate frame into our parent coordinate frame. If it includes a
   * rotation, the resulting bounding box will include every point that could have been in the original bounding box
   * (and it can be expanded).
   */
  localToParentBounds(bounds) {
    return this._transform.transformBounds2(bounds);
  }

  /**
   * Returns a point transformed from our parent coordinate frame into our local coordinate frame. Applies the inverse
   * of our node's transform to it.
   */
  parentToLocalPoint(point) {
    return this._transform.inversePosition2(point);
  }

  /**
   * Returns bounds transformed from our parent coordinate frame into our local coordinate frame. If it includes a
   * rotation, the resulting bounding box will include every point that could have been in the original bounding box
   * (and it can be expanded).
   */
  parentToLocalBounds(bounds) {
    return this._transform.inverseBounds2(bounds);
  }

  /**
   * A mutable-optimized form of localToParentBounds() that will modify the provided bounds, transforming it from our
   * local coordinate frame to our parent coordinate frame.
   * @returns - The same bounds object.
   */
  transformBoundsFromLocalToParent(bounds) {
    return bounds.transform(this._transform.getMatrix());
  }

  /**
   * A mutable-optimized form of parentToLocalBounds() that will modify the provided bounds, transforming it from our
   * parent coordinate frame to our local coordinate frame.
   * @returns - The same bounds object.
   */
  transformBoundsFromParentToLocal(bounds) {
    return bounds.transform(this._transform.getInverse());
  }

  /**
   * Returns a new matrix (fresh copy) that would transform points from our local coordinate frame to the global
   * coordinate frame.
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */
  getLocalToGlobalMatrix() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node = this; // eslint-disable-line consistent-this

    // we need to apply the transformations in the reverse order, so we temporarily store them
    const matrices = [];

    // concatenation like this has been faster than getting a unique trail, getting its transform, and applying it
    while (node) {
      matrices.push(node._transform.getMatrix());
      assert && assert(node._parents[1] === undefined, 'getLocalToGlobalMatrix unable to work for DAG');
      node = node._parents[0];
    }
    const matrix = Matrix3.identity(); // will be modified in place

    // iterate from the back forwards (from the root Node to here)
    for (let i = matrices.length - 1; i >= 0; i--) {
      matrix.multiplyMatrix(matrices[i]);
    }

    // NOTE: always return a fresh copy, getGlobalToLocalMatrix depends on it to minimize instance usage!
    return matrix;
  }

  /**
   * Returns a Transform3 that would transform things from our local coordinate frame to the global coordinate frame.
   * Equivalent to getUniqueTrail().getTransform(), but faster.
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */
  getUniqueTransform() {
    return new Transform3(this.getLocalToGlobalMatrix());
  }

  /**
   * Returns a new matrix (fresh copy) that would transform points from the global coordinate frame to our local
   * coordinate frame.
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */
  getGlobalToLocalMatrix() {
    return this.getLocalToGlobalMatrix().invert();
  }

  /**
   * Transforms a point from our local coordinate frame to the global coordinate frame.
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */
  localToGlobalPoint(point) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node = this; // eslint-disable-line consistent-this
    const resultPoint = point.copy();
    while (node) {
      // in-place multiplication
      node._transform.getMatrix().multiplyVector2(resultPoint);
      assert && assert(node._parents[1] === undefined, 'localToGlobalPoint unable to work for DAG');
      node = node._parents[0];
    }
    return resultPoint;
  }

  /**
   * Transforms a point from the global coordinate frame to our local coordinate frame.
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */
  globalToLocalPoint(point) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node = this; // eslint-disable-line consistent-this
    // TODO: performance: test whether it is faster to get a total transform and then invert (won't compute individual inverses)

    // we need to apply the transformations in the reverse order, so we temporarily store them
    const transforms = [];
    while (node) {
      transforms.push(node._transform);
      assert && assert(node._parents[1] === undefined, 'globalToLocalPoint unable to work for DAG');
      node = node._parents[0];
    }

    // iterate from the back forwards (from the root Node to here)
    const resultPoint = point.copy();
    for (let i = transforms.length - 1; i >= 0; i--) {
      // in-place multiplication
      transforms[i].getInverse().multiplyVector2(resultPoint);
    }
    return resultPoint;
  }

  /**
   * Transforms bounds from our local coordinate frame to the global coordinate frame. If it includes a
   * rotation, the resulting bounding box will include every point that could have been in the original bounding box
   * (and it can be expanded).
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */
  localToGlobalBounds(bounds) {
    // apply the bounds transform only once, so we can minimize the expansion encountered from multiple rotations
    // it also seems to be a bit faster this way
    return bounds.transformed(this.getLocalToGlobalMatrix());
  }

  /**
   * Transforms bounds from the global coordinate frame to our local coordinate frame. If it includes a
   * rotation, the resulting bounding box will include every point that could have been in the original bounding box
   * (and it can be expanded).
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */
  globalToLocalBounds(bounds) {
    // apply the bounds transform only once, so we can minimize the expansion encountered from multiple rotations
    return bounds.transformed(this.getGlobalToLocalMatrix());
  }

  /**
   * Transforms a point from our parent coordinate frame to the global coordinate frame.
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */
  parentToGlobalPoint(point) {
    assert && assert(this.parents.length <= 1, 'parentToGlobalPoint unable to work for DAG');
    return this.parents.length ? this.parents[0].localToGlobalPoint(point) : point;
  }

  /**
   * Transforms bounds from our parent coordinate frame to the global coordinate frame. If it includes a
   * rotation, the resulting bounding box will include every point that could have been in the original bounding box
   * (and it can be expanded).
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */
  parentToGlobalBounds(bounds) {
    assert && assert(this.parents.length <= 1, 'parentToGlobalBounds unable to work for DAG');
    return this.parents.length ? this.parents[0].localToGlobalBounds(bounds) : bounds;
  }

  /**
   * Transforms a point from the global coordinate frame to our parent coordinate frame.
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */
  globalToParentPoint(point) {
    assert && assert(this.parents.length <= 1, 'globalToParentPoint unable to work for DAG');
    return this.parents.length ? this.parents[0].globalToLocalPoint(point) : point;
  }

  /**
   * Transforms bounds from the global coordinate frame to our parent coordinate frame. If it includes a
   * rotation, the resulting bounding box will include every point that could have been in the original bounding box
   * (and it can be expanded).
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */
  globalToParentBounds(bounds) {
    assert && assert(this.parents.length <= 1, 'globalToParentBounds unable to work for DAG');
    return this.parents.length ? this.parents[0].globalToLocalBounds(bounds) : bounds;
  }

  /**
   * Returns a bounding box for this Node (and its sub-tree) in the global coordinate frame.
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   *
   * NOTE: This requires computation of this node's subtree bounds, which may incur some performance loss.
   */
  getGlobalBounds() {
    assert && assert(this.parents.length <= 1, 'globalBounds unable to work for DAG');
    return this.parentToGlobalBounds(this.getBounds());
  }

  /**
   * See getGlobalBounds() for more information
   */
  get globalBounds() {
    return this.getGlobalBounds();
  }

  /**
   * Returns the bounds of any other Node in our local coordinate frame.
   *
   * NOTE: If this node or the passed in Node have multiple instances (e.g. this or one ancestor has two parents), it will fail
   * with an assertion.
   *
   * TODO: Possible to be well-defined and have multiple instances of each.
   */
  boundsOf(node) {
    return this.globalToLocalBounds(node.getGlobalBounds());
  }

  /**
   * Returns the bounds of this Node in another node's local coordinate frame.
   *
   * NOTE: If this node or the passed in Node have multiple instances (e.g. this or one ancestor has two parents), it will fail
   * with an assertion.
   *
   * TODO: Possible to be well-defined and have multiple instances of each.
   */
  boundsTo(node) {
    return node.globalToLocalBounds(this.getGlobalBounds());
  }

  /*---------------------------------------------------------------------------*
   * Drawable handling
   *----------------------------------------------------------------------------*/

  /**
   * Adds the drawable to our list of drawables to notify of visual changes. (scenery-internal)
   */
  attachDrawable(drawable) {
    this._drawables.push(drawable);
    return this; // allow chaining
  }

  /**
   * Removes the drawable from our list of drawables to notify of visual changes. (scenery-internal)
   */
  detachDrawable(drawable) {
    const index = _.indexOf(this._drawables, drawable);
    assert && assert(index >= 0, 'Invalid operation: trying to detach a non-referenced drawable');
    this._drawables.splice(index, 1); // TODO: replace with a remove() function
    return this;
  }

  /**
   * Scans the options object for key names that correspond to ES5 setters or other setter functions, and calls those
   * with the values.
   *
   * For example:
   *
   * node.mutate( { top: 0, left: 5 } );
   *
   * will be equivalent to:
   *
   * node.left = 5;
   * node.top = 0;
   *
   * In particular, note that the order is different. Mutators will be applied in the order of _mutatorKeys, which can
   * be added to by subtypes.
   *
   * Additionally, some keys are actually direct function names, like 'scale'. mutate( { scale: 2 } ) will call
   * node.scale( 2 ) instead of activating an ES5 setter directly.
   */
  mutate(options) {
    if (!options) {
      return this;
    }
    assert && assert(Object.getPrototypeOf(options) === Object.prototype, 'Extra prototype on Node options object is a code smell');

    // @ts-expect-error
    assert && assert(_.filter(['translation', 'x', 'left', 'right', 'centerX', 'centerTop', 'rightTop', 'leftCenter', 'center', 'rightCenter', 'leftBottom', 'centerBottom', 'rightBottom'], key => options[key] !== undefined).length <= 1, `More than one mutation on this Node set the x component, check ${Object.keys(options).join(',')}`);

    // @ts-expect-error
    assert && assert(_.filter(['translation', 'y', 'top', 'bottom', 'centerY', 'centerTop', 'rightTop', 'leftCenter', 'center', 'rightCenter', 'leftBottom', 'centerBottom', 'rightBottom'], key => options[key] !== undefined).length <= 1, `More than one mutation on this Node set the y component, check ${Object.keys(options).join(',')}`);
    if (assert && options.hasOwnProperty('enabled') && options.hasOwnProperty('enabledProperty')) {
      assert && assert(options.enabledProperty.value === options.enabled, 'If both enabled and enabledProperty are provided, then values should match');
    }
    if (assert && options.hasOwnProperty('inputEnabled') && options.hasOwnProperty('inputEnabledProperty')) {
      assert && assert(options.inputEnabledProperty.value === options.inputEnabled, 'If both inputEnabled and inputEnabledProperty are provided, then values should match');
    }
    if (assert && options.hasOwnProperty('visible') && options.hasOwnProperty('visibleProperty')) {
      assert && assert(options.visibleProperty.value === options.visible, 'If both visible and visibleProperty are provided, then values should match');
    }
    if (assert && options.hasOwnProperty('pickable') && options.hasOwnProperty('pickableProperty')) {
      assert && assert(options.pickableProperty.value === options.pickable, 'If both pickable and pickableProperty are provided, then values should match');
    }
    _.each(this._mutatorKeys, key => {
      // See https://github.com/phetsims/scenery/issues/580 for more about passing undefined.
      // @ts-expect-error
      assert && assert(!options.hasOwnProperty(key) || options[key] !== undefined, `Undefined not allowed for Node key: ${key}`);

      // @ts-expect-error - Hmm, better way to check this?
      if (options[key] !== undefined) {
        const descriptor = Object.getOwnPropertyDescriptor(Node.prototype, key);

        // if the key refers to a function that is not ES5 writable, it will execute that function with the single argument
        if (descriptor && typeof descriptor.value === 'function') {
          // @ts-expect-error
          this[key](options[key]);
        } else {
          // @ts-expect-error
          this[key] = options[key];
        }
      }
    });
    this.initializePhetioObject({
      phetioType: Node.NodeIO,
      phetioState: PHET_IO_STATE_DEFAULT
    }, options);
    return this; // allow chaining
  }

  initializePhetioObject(baseOptions, config) {
    // Track this, so we only override our visibleProperty once.
    const wasInstrumented = this.isPhetioInstrumented();
    super.initializePhetioObject(baseOptions, config);
    if (Tandem.PHET_IO_ENABLED && !wasInstrumented && this.isPhetioInstrumented()) {
      // For each supported TinyForwardingProperty, if a Property was already specified in the options (in the
      // constructor or mutate), then it will be set as this.targetProperty there. Here we only create the default
      // instrumented one if another hasn't already been specified.

      this._visibleProperty.initializePhetio(this, VISIBLE_PROPERTY_TANDEM_NAME, () => new BooleanProperty(this.visible, combineOptions({
        // by default, use the value from the Node
        phetioReadOnly: this.phetioReadOnly,
        tandem: this.tandem.createTandem(VISIBLE_PROPERTY_TANDEM_NAME),
        phetioDocumentation: 'Controls whether the Node will be visible (and interactive).'
      }, config.visiblePropertyOptions)));
      this._enabledProperty.initializePhetio(this, ENABLED_PROPERTY_TANDEM_NAME, () => new EnabledProperty(this.enabled, combineOptions({
        // by default, use the value from the Node
        phetioReadOnly: this.phetioReadOnly,
        phetioDocumentation: 'Sets whether the node is enabled. This will set whether input is enabled for this Node and ' + 'most often children as well. It will also control and toggle the "disabled look" of the node.',
        tandem: this.tandem.createTandem(ENABLED_PROPERTY_TANDEM_NAME)
      }, config.enabledPropertyOptions)));
      this._inputEnabledProperty.initializePhetio(this, INPUT_ENABLED_PROPERTY_TANDEM_NAME, () => new Property(this.inputEnabled, combineOptions({
        // by default, use the value from the Node
        phetioReadOnly: this.phetioReadOnly,
        tandem: this.tandem.createTandem(INPUT_ENABLED_PROPERTY_TANDEM_NAME),
        phetioValueType: BooleanIO,
        phetioFeatured: true,
        // Since this property is opt-in, we typically only opt-in when it should be featured
        phetioDocumentation: 'Sets whether the element will have input enabled, and hence be interactive.'
      }, config.inputEnabledPropertyOptions)));
    }
  }

  /**
   * Set the visibility of this Node with respect to the Voicing feature. Totally separate from graphical display.
   * When visible, this Node and all of its ancestors will be able to speak with Voicing. When voicingVisible
   * is false, all Voicing under this Node will be muted. `voicingVisible` properties exist in Node.ts because
   * it is useful to set `voicingVisible` on a root that is composed with Voicing.ts. We cannot put all of the
   * Voicing.ts implementation in Node because that would have a massive memory impact. See Voicing.ts for more
   * information.
   */
  setVoicingVisible(visible) {
    if (this.voicingVisibleProperty.value !== visible) {
      this.voicingVisibleProperty.value = visible;
    }
  }
  set voicingVisible(visible) {
    this.setVoicingVisible(visible);
  }
  get voicingVisible() {
    return this.isVoicingVisible();
  }

  /**
   * Returns whether this Node is voicingVisible. When true Utterances for this Node can be announced with the
   * Voicing feature, see Voicing.ts for more information.
   */
  isVoicingVisible() {
    return this.voicingVisibleProperty.value;
  }

  /**
   * Override for extra information in the debugging output (from Display.getDebugHTML()). (scenery-internal)
   */
  getDebugHTMLExtras() {
    return '';
  }

  /**
   * Makes this Node's subtree available for inspection.
   */
  inspect() {
    localStorage.scenerySnapshot = JSON.stringify({
      type: 'Subtree',
      rootNodeId: this.id,
      nodes: serializeConnectedNodes(this)
    });
  }

  /**
   * Returns a debugging string that is an attempted serialization of this node's sub-tree.
   *
   * @param spaces - Whitespace to add
   * @param [includeChildren]
   */
  toString(spaces, includeChildren) {
    return `${this.constructor.name}#${this.id}`;
  }

  /**
   * Performs checks to see if the internal state of Instance references is correct at a certain point in/after the
   * Display's updateDisplay(). (scenery-internal)
   */
  auditInstanceSubtreeForDisplay(display) {
    if (assertSlow) {
      const numInstances = this._instances.length;
      for (let i = 0; i < numInstances; i++) {
        const instance = this._instances[i];
        if (instance.display === display) {
          assertSlow(instance.trail.isValid(), `Invalid trail on Instance: ${instance.toString()} with trail ${instance.trail.toString()}`);
        }
      }

      // audit all of the children
      this.children.forEach(child => {
        child.auditInstanceSubtreeForDisplay(display);
      });
    }
  }

  /**
   * When we add or remove any number of bounds listeners, we want to increment/decrement internal information.
   *
   * @param deltaQuantity - If positive, the number of listeners being added, otherwise the number removed
   */
  onBoundsListenersAddedOrRemoved(deltaQuantity) {
    this.changeBoundsEventCount(deltaQuantity);
    this._boundsEventSelfCount += deltaQuantity;
  }

  /**
   * Disposes the node, releasing all references that it maintained.
   */
  dispose() {
    // remove all PDOM input listeners
    this.disposeParallelDOM();

    // When disposing, remove all children and parents. See https://github.com/phetsims/scenery/issues/629
    this.removeAllChildren();
    this.detach();

    // In opposite order of creation
    this._inputEnabledProperty.dispose();
    this._enabledProperty.dispose();
    this._pickableProperty.dispose();
    this._visibleProperty.dispose();

    // Tear-down in the reverse order Node was created
    super.dispose();
  }

  /**
   * Disposes this Node and all other descendant nodes.
   *
   * NOTE: Use with caution, as you should not re-use any Node touched by this. Not compatible with most DAG
   *       techniques.
   */
  disposeSubtree() {
    if (!this.isDisposed) {
      // makes a copy before disposing
      const children = this.children;
      this.dispose();
      for (let i = 0; i < children.length; i++) {
        children[i].disposeSubtree();
      }
    }
  }

  /**
   * A default for getTrails() searches, returns whether the Node has no parents.
   */
  static defaultTrailPredicate(node) {
    return node._parents.length === 0;
  }

  /**
   * A default for getLeafTrails() searches, returns whether the Node has no parents.
   */
  static defaultLeafTrailPredicate(node) {
    return node._children.length === 0;
  }
  // A mapping of all of the default options provided to Node
  static DEFAULT_NODE_OPTIONS = DEFAULT_OPTIONS;
}
Node.prototype._mutatorKeys = ACCESSIBILITY_OPTION_KEYS.concat(NODE_OPTION_KEYS);

/**
 * {Array.<String>} - List of all dirty flags that should be available on drawables created from this Node (or
 *                    subtype). Given a flag (e.g. radius), it indicates the existence of a function
 *                    drawable.markDirtyRadius() that will indicate to the drawable that the radius has changed.
 * (scenery-internal)
 *
 * Should be overridden by subtypes.
 */
Node.prototype.drawableMarkFlags = [];
scenery.register('Node', Node);

// {IOType}
Node.NodeIO = new IOType('NodeIO', {
  valueType: Node,
  documentation: 'The base type for graphical and potentially interactive objects.',
  metadataDefaults: {
    phetioState: PHET_IO_STATE_DEFAULT
  }
});

// We use interface extension, so we can't export Node at its declaration location
export default Node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbmFibGVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlRpbnlFbWl0dGVyIiwiVGlueUZvcndhcmRpbmdQcm9wZXJ0eSIsIlRpbnlQcm9wZXJ0eSIsIlRpbnlTdGF0aWNQcm9wZXJ0eSIsIkJvdW5kczIiLCJNYXRyaXgzIiwiVHJhbnNmb3JtMyIsIlZlY3RvcjIiLCJTaGFwZSIsImFycmF5RGlmZmVyZW5jZSIsImRlcHJlY2F0aW9uV2FybmluZyIsIlRhbmRlbSIsIkJvb2xlYW5JTyIsIklPVHlwZSIsIkFDQ0VTU0lCSUxJVFlfT1BUSU9OX0tFWVMiLCJDYW52YXNDb250ZXh0V3JhcHBlciIsIkZlYXR1cmVzIiwiRmlsdGVyIiwiSW1hZ2UiLCJpc0hlaWdodFNpemFibGUiLCJpc1dpZHRoU2l6YWJsZSIsIk1vdXNlIiwiUGFyYWxsZWxET00iLCJQaWNrZXIiLCJSZW5kZXJlciIsIlJlbmRlcmVyU3VtbWFyeSIsInNjZW5lcnkiLCJzZXJpYWxpemVDb25uZWN0ZWROb2RlcyIsIlRyYWlsIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJvcHRpb25pemUzIiwiVXRpbHMiLCJnbG9iYWxJZENvdW50ZXIiLCJzY3JhdGNoQm91bmRzMiIsIk5PVEhJTkciLCJjb3B5Iiwic2NyYXRjaEJvdW5kczJFeHRyYSIsInNjcmF0Y2hNYXRyaXgzIiwiRU5BQkxFRF9QUk9QRVJUWV9UQU5ERU1fTkFNRSIsIlRBTkRFTV9OQU1FIiwiVklTSUJMRV9QUk9QRVJUWV9UQU5ERU1fTkFNRSIsIklOUFVUX0VOQUJMRURfUFJPUEVSVFlfVEFOREVNX05BTUUiLCJQSEVUX0lPX1NUQVRFX0RFRkFVTFQiLCJtYXhQYXJlbnRDb3VudCIsIlJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZUyIsIk5PREVfT1BUSU9OX0tFWVMiLCJERUZBVUxUX09QVElPTlMiLCJwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJ2aXNpYmxlIiwib3BhY2l0eSIsImRpc2FibGVkT3BhY2l0eSIsInBpY2thYmxlIiwiZW5hYmxlZCIsInBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsImlucHV0RW5hYmxlZCIsInBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwiY2xpcEFyZWEiLCJtb3VzZUFyZWEiLCJ0b3VjaEFyZWEiLCJjdXJzb3IiLCJ0cmFuc2Zvcm1Cb3VuZHMiLCJtYXhXaWR0aCIsIm1heEhlaWdodCIsInJlbmRlcmVyIiwidXNlc09wYWNpdHkiLCJsYXllclNwbGl0IiwiY3NzVHJhbnNmb3JtIiwiZXhjbHVkZUludmlzaWJsZSIsIndlYmdsU2NhbGUiLCJwcmV2ZW50Rml0IiwiTm9kZSIsInBhcmVudEFkZGVkRW1pdHRlciIsInBhcmVudFJlbW92ZWRFbWl0dGVyIiwiX2FjdGl2ZVBhcmVudExheW91dENvbnN0cmFpbnQiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJfaWQiLCJfaW5zdGFuY2VzIiwiX3Jvb3RlZERpc3BsYXlzIiwiX2RyYXdhYmxlcyIsIl92aXNpYmxlUHJvcGVydHkiLCJvblZpc2libGVQcm9wZXJ0eUNoYW5nZSIsImJpbmQiLCJvcGFjaXR5UHJvcGVydHkiLCJvbk9wYWNpdHlQcm9wZXJ0eUNoYW5nZSIsImRpc2FibGVkT3BhY2l0eVByb3BlcnR5Iiwib25EaXNhYmxlZE9wYWNpdHlQcm9wZXJ0eUNoYW5nZSIsIl9waWNrYWJsZVByb3BlcnR5Iiwib25QaWNrYWJsZVByb3BlcnR5Q2hhbmdlIiwiX2VuYWJsZWRQcm9wZXJ0eSIsIm9uRW5hYmxlZFByb3BlcnR5Q2hhbmdlIiwiX2lucHV0RW5hYmxlZFByb3BlcnR5IiwiY2xpcEFyZWFQcm9wZXJ0eSIsInZvaWNpbmdWaXNpYmxlUHJvcGVydHkiLCJfbW91c2VBcmVhIiwiX3RvdWNoQXJlYSIsIl9jdXJzb3IiLCJfY2hpbGRyZW4iLCJfcGFyZW50cyIsIl90cmFuc2Zvcm1Cb3VuZHMiLCJfdHJhbnNmb3JtIiwiX3RyYW5zZm9ybUxpc3RlbmVyIiwib25UcmFuc2Zvcm1DaGFuZ2UiLCJjaGFuZ2VFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJfbWF4V2lkdGgiLCJfbWF4SGVpZ2h0IiwiX2FwcGxpZWRTY2FsZUZhY3RvciIsIl9pbnB1dExpc3RlbmVycyIsImlucHV0RW5hYmxlZFByb3BlcnR5IiwibGF6eUxpbmsiLCJwZG9tQm91bmRJbnB1dEVuYWJsZWRMaXN0ZW5lciIsImJvdW5kc0xpc3RlbmVyc0FkZGVkT3JSZW1vdmVkTGlzdGVuZXIiLCJvbkJvdW5kc0xpc3RlbmVyc0FkZGVkT3JSZW1vdmVkIiwiYm91bmRzSW52YWxpZGF0aW9uTGlzdGVuZXIiLCJ2YWxpZGF0ZUJvdW5kcyIsInNlbGZCb3VuZHNJbnZhbGlkYXRpb25MaXN0ZW5lciIsInZhbGlkYXRlU2VsZkJvdW5kcyIsImJvdW5kc1Byb3BlcnR5IiwiY2hhbmdlQ291bnQiLCJsb2NhbEJvdW5kc1Byb3BlcnR5IiwiY2hpbGRCb3VuZHNQcm9wZXJ0eSIsInNlbGZCb3VuZHNQcm9wZXJ0eSIsIl9sb2NhbEJvdW5kc092ZXJyaWRkZW4iLCJfZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyIsIl9sYXlvdXRPcHRpb25zIiwiX2JvdW5kc0RpcnR5IiwiX2xvY2FsQm91bmRzRGlydHkiLCJfc2VsZkJvdW5kc0RpcnR5IiwiX2NoaWxkQm91bmRzRGlydHkiLCJhc3NlcnQiLCJfb3JpZ2luYWxCb3VuZHMiLCJfdmFsdWUiLCJfb3JpZ2luYWxMb2NhbEJvdW5kcyIsIl9vcmlnaW5hbFNlbGZCb3VuZHMiLCJfb3JpZ2luYWxDaGlsZEJvdW5kcyIsIl9maWx0ZXJzIiwiX2hpbnRzIiwiZnJvbU5hbWUiLCJmdWxsUmVzb2x1dGlvbiIsImNoaWxkcmVuQ2hhbmdlZEVtaXR0ZXIiLCJjaGlsZEluc2VydGVkRW1pdHRlciIsImNoaWxkUmVtb3ZlZEVtaXR0ZXIiLCJjaGlsZHJlblJlb3JkZXJlZEVtaXR0ZXIiLCJ0cmFuc2Zvcm1FbWl0dGVyIiwiaW5zdGFuY2VSZWZyZXNoRW1pdHRlciIsInJlbmRlcmVyU3VtbWFyeVJlZnJlc2hFbWl0dGVyIiwiZmlsdGVyQ2hhbmdlRW1pdHRlciIsImNoYW5nZWRJbnN0YW5jZUVtaXR0ZXIiLCJsYXlvdXRPcHRpb25zQ2hhbmdlZEVtaXR0ZXIiLCJfcmVuZGVyZXJCaXRtYXNrIiwiYml0bWFza05vZGVEZWZhdWx0IiwiX3JlbmRlcmVyU3VtbWFyeSIsIl9ib3VuZHNFdmVudENvdW50IiwiX2JvdW5kc0V2ZW50U2VsZkNvdW50IiwiX3BpY2tlciIsIl9pc0dldHRpbmdSZW1vdmVkRnJvbVBhcmVudCIsIm11dGF0ZSIsImluc2VydENoaWxkIiwiaW5kZXgiLCJub2RlIiwiaXNDb21wb3NpdGUiLCJ1bmRlZmluZWQiLCJfIiwiaW5jbHVkZXMiLCJpc0Rpc3Bvc2VkIiwib25JbnNlcnRDaGlsZCIsImNoYW5nZUJvdW5kc0V2ZW50Q291bnQiLCJzdW1tYXJ5Q2hhbmdlIiwiYml0bWFza0FsbCIsImJpdG1hc2siLCJwdXNoIiwid2luZG93IiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJpc0Zpbml0ZSIsInBhcmVudExpbWl0IiwicGFyZW50Q291bnQiLCJsZW5ndGgiLCJjb25zb2xlIiwibG9nIiwic3BsaWNlIiwiaGFzTm9QRE9NIiwib25QRE9NQWRkQ2hpbGQiLCJpbnZhbGlkYXRlQm91bmRzIiwiZW1pdCIsImFzc2VydFNsb3ciLCJhdWRpdCIsImFkZENoaWxkIiwicmVtb3ZlQ2hpbGQiLCJoYXNDaGlsZCIsImluZGV4T2ZDaGlsZCIsImluZGV4T2YiLCJyZW1vdmVDaGlsZFdpdGhJbmRleCIsInJlbW92ZUNoaWxkQXQiLCJpbmRleE9mUGFyZW50Iiwib25QRE9NUmVtb3ZlQ2hpbGQiLCJvblJlbW92ZUNoaWxkIiwibW92ZUNoaWxkVG9JbmRleCIsImN1cnJlbnRJbmRleCIsIm9uUERPTVJlb3JkZXJlZENoaWxkcmVuIiwiTWF0aCIsIm1pbiIsIm1heCIsInJlbW92ZUFsbENoaWxkcmVuIiwic2V0Q2hpbGRyZW4iLCJjaGlsZHJlbiIsImJlZm9yZU9ubHkiLCJhZnRlck9ubHkiLCJpbkJvdGgiLCJpIiwibWluQ2hhbmdlSW5kZXgiLCJtYXhDaGFuZ2VJbmRleCIsImRlc2lyZWQiLCJoYXNSZW9yZGVyaW5nQ2hhbmdlIiwiYWZ0ZXJJbmRleCIsImFmdGVyIiwiaiIsInZhbHVlIiwiZ2V0Q2hpbGRyZW4iLCJzbGljZSIsImdldENoaWxkcmVuQ291bnQiLCJnZXRQYXJlbnRzIiwicGFyZW50cyIsImdldFBhcmVudCIsInBhcmVudCIsImdldENoaWxkQXQiLCJjaGlsZCIsIm1vdmVUb0Zyb250IiwiZWFjaCIsIm1vdmVDaGlsZFRvRnJvbnQiLCJtb3ZlRm9yd2FyZCIsImZvckVhY2giLCJtb3ZlQ2hpbGRGb3J3YXJkIiwibW92ZUJhY2t3YXJkIiwibW92ZUNoaWxkQmFja3dhcmQiLCJtb3ZlVG9CYWNrIiwibW92ZUNoaWxkVG9CYWNrIiwicmVwbGFjZUNoaWxkIiwib2xkQ2hpbGQiLCJuZXdDaGlsZCIsIm9sZENoaWxkRm9jdXNlZCIsImZvY3VzZWQiLCJmb2N1c2FibGUiLCJmb2N1cyIsImRldGFjaCIsIm4iLCJ6ZXJvQmVmb3JlIiwiemVyb0FmdGVyIiwicGFyZW50RGVsdGEiLCJsZW4iLCJvbGRTZWxmQm91bmRzIiwic2V0IiwiZGlkU2VsZkJvdW5kc0NoYW5nZSIsInVwZGF0ZVNlbGZCb3VuZHMiLCJub3RpZnlMaXN0ZW5lcnMiLCJzY2VuZXJ5TG9nIiwiYm91bmRzIiwibm90aWZpY2F0aW9uVGhyZXNob2xkIiwid2FzRGlydHlCZWZvcmUiLCJvdXJDaGlsZEJvdW5kcyIsIm91ckxvY2FsQm91bmRzIiwib3VyU2VsZkJvdW5kcyIsIm91ckJvdW5kcyIsIm9sZENoaWxkQm91bmRzIiwiaXNWaXNpYmxlIiwiaW5jbHVkZUJvdW5kcyIsImVxdWFscyIsImVxdWFsc0Vwc2lsb24iLCJvbGRMb2NhbEJvdW5kcyIsImNvbnN0cmFpbkJvdW5kcyIsInVwZGF0ZU1heERpbWVuc2lvbiIsIm9sZEJvdW5kcyIsImdldE1hdHJpeCIsImlzQXhpc0FsaWduZWQiLCJtYXRyaXgiLCJfaW5jbHVkZVRyYW5zZm9ybWVkU3VidHJlZUJvdW5kcyIsImdldEJvdW5kc1dpdGhUcmFuc2Zvcm0iLCJ0cmFuc2Zvcm1Cb3VuZHNGcm9tTG9jYWxUb1BhcmVudCIsImVwc2lsb24iLCJjaGlsZEJvdW5kcyIsImxvY2FsQm91bmRzIiwidW5pb24iLCJpbnRlcnNlY3Rpb24iLCJmdWxsQm91bmRzIiwibG9jYWxUb1BhcmVudEJvdW5kcyIsInRvU3RyaW5nIiwicG9wIiwic2VsZkJvdW5kcyIsImlzRW1wdHkiLCJnZXRUcmFuc2Zvcm1lZFNlbGZCb3VuZHMiLCJudW1DaGlsZHJlbiIsIm11bHRpcGx5TWF0cml4IiwiZ2V0SW52ZXJzZSIsInZhbGlkYXRlV2F0Y2hlZEJvdW5kcyIsIndhdGNoZWRCb3VuZHNTY2FuIiwiY2hhbmdlZCIsImludmFsaWRhdGVDaGlsZEJvdW5kcyIsImludmFsaWRhdGVTZWxmIiwibmV3U2VsZkJvdW5kcyIsIm9uU2VsZkJvdW5kc0RpcnR5IiwicG90ZW50aWFsQ2hpbGQiLCJpc091ckNoaWxkIiwiZ2V0U2VsZlNoYXBlIiwiZ2V0U2VsZkJvdW5kcyIsImdldFNhZmVTZWxmQm91bmRzIiwic2FmZVNlbGZCb3VuZHMiLCJnZXRDaGlsZEJvdW5kcyIsImdldExvY2FsQm91bmRzIiwic2V0TG9jYWxCb3VuZHMiLCJsb2NhbEJvdW5kc092ZXJyaWRkZW4iLCJpc05hTiIsIm1pblgiLCJtaW5ZIiwibWF4WCIsIm1heFkiLCJ0cmFuc2Zvcm1lZCIsImdldFRyYW5zZm9ybWVkU2FmZVNlbGZCb3VuZHMiLCJnZXRTYWZlVHJhbnNmb3JtZWRWaXNpYmxlQm91bmRzIiwibG9jYWxNYXRyaXgiLCJJREVOVElUWSIsInRpbWVzTWF0cml4IiwidmlzaWJsZVByb3BlcnR5Iiwic2FmZVRyYW5zZm9ybWVkVmlzaWJsZUJvdW5kcyIsInNldFRyYW5zZm9ybUJvdW5kcyIsImdldFRyYW5zZm9ybUJvdW5kcyIsImdldEJvdW5kcyIsImdldFZpc2libGVMb2NhbEJvdW5kcyIsImdldFZpc2libGVCb3VuZHMiLCJ2aXNpYmxlTG9jYWxCb3VuZHMiLCJ0cmFuc2Zvcm0iLCJ2aXNpYmxlQm91bmRzIiwiaGl0VGVzdCIsInBvaW50IiwiaXNNb3VzZSIsImlzVG91Y2giLCJ0cmFpbFVuZGVyUG9pbnRlciIsInBvaW50ZXIiLCJpc1RvdWNoTGlrZSIsImNvbnRhaW5zUG9pbnQiLCJjb250YWluc1BvaW50U2VsZiIsImludGVyc2VjdHNCb3VuZHNTZWxmIiwiaW50ZXJzZWN0c0JvdW5kcyIsImlzUGhldGlvTW91c2VIaXR0YWJsZSIsImxvY2FsUG9pbnQiLCJ0aW1lc1ZlY3RvcjIiLCJnZXRQaGV0aW9Nb3VzZUhpdCIsImNoaWxkSGl0IiwiaXNQaGV0aW9JbnN0cnVtZW50ZWQiLCJpc1BhaW50ZWQiLCJhcmVTZWxmQm91bmRzVmFsaWQiLCJoYXNQYXJlbnQiLCJoYXNDaGlsZHJlbiIsImlzQ2hpbGRJbmNsdWRlZEluTGF5b3V0IiwiaXNWYWxpZCIsIndhbGtEZXB0aEZpcnN0IiwiY2FsbGJhY2siLCJhZGRJbnB1dExpc3RlbmVyIiwibGlzdGVuZXIiLCJvbkFkZElucHV0TGlzdGVuZXIiLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwib25SZW1vdmVJbnB1dExpc3RlbmVyIiwiaGFzSW5wdXRMaXN0ZW5lciIsImludGVycnVwdElucHV0IiwibGlzdGVuZXJzQ29weSIsImlucHV0TGlzdGVuZXJzIiwiaW50ZXJydXB0IiwiaW50ZXJydXB0U3VidHJlZUlucHV0IiwidHJhbnNsYXRlIiwieCIsInkiLCJwcmVwZW5kSW5zdGVhZCIsImFicyIsInByZXBlbmRUcmFuc2xhdGlvbiIsImFwcGVuZE1hdHJpeCIsInNldFRvVHJhbnNsYXRpb24iLCJ2ZWN0b3IiLCJzY2FsZSIsInByZXBlbmRNYXRyaXgiLCJzY2FsaW5nIiwicm90YXRlIiwiYW5nbGUiLCJQSSIsInJvdGF0aW9uMiIsInJvdGF0ZUFyb3VuZCIsInRyYW5zbGF0aW9uIiwic2V0WCIsImdldFgiLCJtMDIiLCJzZXRZIiwiZ2V0WSIsIm0xMiIsInNldFNjYWxlTWFnbml0dWRlIiwiYSIsImIiLCJjdXJyZW50U2NhbGUiLCJnZXRTY2FsZVZlY3RvciIsInNldFJvdGF0aW9uIiwicm90YXRpb24iLCJzZXRUb1JvdGF0aW9uWiIsImdldFJvdGF0aW9uIiwic2V0VHJhbnNsYXRpb24iLCJtIiwidHgiLCJ0eSIsImR4IiwiZHkiLCJnZXRUcmFuc2xhdGlvbiIsImdldERldGVybWluYW50IiwiYXBwZW5kIiwicHJlcGVuZCIsInNldE1hdHJpeCIsImdldFRyYW5zZm9ybSIsInJlc2V0VHJhbnNmb3JtIiwib25TdW1tYXJ5Q2hhbmdlIiwib2xkQml0bWFzayIsIm5ld0JpdG1hc2siLCJfcGRvbURpc3BsYXlzSW5mbyIsImF1ZGl0TWF4RGltZW5zaW9ucyIsImlkZWFsU2NhbGUiLCJ3aWR0aCIsImhlaWdodCIsInNjYWxlQWRqdXN0bWVudCIsInByZWZlcnJlZFdpZHRoIiwicHJlZmVycmVkSGVpZ2h0Iiwib25NYXhEaW1lbnNpb25DaGFuZ2UiLCJiZWZvcmVNYXhMZW5ndGgiLCJhZnRlck1heExlbmd0aCIsInNldE1heFdpZHRoIiwiZ2V0TWF4V2lkdGgiLCJzZXRNYXhIZWlnaHQiLCJnZXRNYXhIZWlnaHQiLCJzZXRMZWZ0IiwibGVmdCIsImN1cnJlbnRMZWZ0IiwiZ2V0TGVmdCIsInNldFJpZ2h0IiwicmlnaHQiLCJjdXJyZW50UmlnaHQiLCJnZXRSaWdodCIsInNldENlbnRlclgiLCJjdXJyZW50Q2VudGVyWCIsImdldENlbnRlclgiLCJjZW50ZXJYIiwic2V0Q2VudGVyWSIsImN1cnJlbnRDZW50ZXJZIiwiZ2V0Q2VudGVyWSIsImNlbnRlclkiLCJzZXRUb3AiLCJ0b3AiLCJjdXJyZW50VG9wIiwiZ2V0VG9wIiwic2V0Qm90dG9tIiwiYm90dG9tIiwiY3VycmVudEJvdHRvbSIsImdldEJvdHRvbSIsInNldExlZnRUb3AiLCJsZWZ0VG9wIiwiY3VycmVudExlZnRUb3AiLCJnZXRMZWZ0VG9wIiwibWludXMiLCJzZXRDZW50ZXJUb3AiLCJjZW50ZXJUb3AiLCJjdXJyZW50Q2VudGVyVG9wIiwiZ2V0Q2VudGVyVG9wIiwic2V0UmlnaHRUb3AiLCJyaWdodFRvcCIsImN1cnJlbnRSaWdodFRvcCIsImdldFJpZ2h0VG9wIiwic2V0TGVmdENlbnRlciIsImxlZnRDZW50ZXIiLCJjdXJyZW50TGVmdENlbnRlciIsImdldExlZnRDZW50ZXIiLCJzZXRDZW50ZXIiLCJjZW50ZXIiLCJjdXJyZW50Q2VudGVyIiwiZ2V0Q2VudGVyIiwic2V0UmlnaHRDZW50ZXIiLCJyaWdodENlbnRlciIsImN1cnJlbnRSaWdodENlbnRlciIsImdldFJpZ2h0Q2VudGVyIiwic2V0TGVmdEJvdHRvbSIsImxlZnRCb3R0b20iLCJjdXJyZW50TGVmdEJvdHRvbSIsImdldExlZnRCb3R0b20iLCJzZXRDZW50ZXJCb3R0b20iLCJjZW50ZXJCb3R0b20iLCJjdXJyZW50Q2VudGVyQm90dG9tIiwiZ2V0Q2VudGVyQm90dG9tIiwic2V0UmlnaHRCb3R0b20iLCJyaWdodEJvdHRvbSIsImN1cnJlbnRSaWdodEJvdHRvbSIsImdldFJpZ2h0Qm90dG9tIiwiZ2V0V2lkdGgiLCJnZXRIZWlnaHQiLCJnZXRMb2NhbFdpZHRoIiwibG9jYWxXaWR0aCIsImdldExvY2FsSGVpZ2h0IiwibG9jYWxIZWlnaHQiLCJnZXRMb2NhbExlZnQiLCJsb2NhbExlZnQiLCJnZXRMb2NhbFJpZ2h0IiwibG9jYWxSaWdodCIsImdldExvY2FsQ2VudGVyWCIsImxvY2FsQ2VudGVyWCIsImdldExvY2FsQ2VudGVyWSIsImxvY2FsQ2VudGVyWSIsImdldExvY2FsVG9wIiwibG9jYWxUb3AiLCJnZXRMb2NhbEJvdHRvbSIsImxvY2FsQm90dG9tIiwiZ2V0TG9jYWxMZWZ0VG9wIiwibG9jYWxMZWZ0VG9wIiwiZ2V0TG9jYWxDZW50ZXJUb3AiLCJsb2NhbENlbnRlclRvcCIsImdldExvY2FsUmlnaHRUb3AiLCJsb2NhbFJpZ2h0VG9wIiwiZ2V0TG9jYWxMZWZ0Q2VudGVyIiwibG9jYWxMZWZ0Q2VudGVyIiwiZ2V0TG9jYWxDZW50ZXIiLCJsb2NhbENlbnRlciIsImdldExvY2FsUmlnaHRDZW50ZXIiLCJsb2NhbFJpZ2h0Q2VudGVyIiwiZ2V0TG9jYWxMZWZ0Qm90dG9tIiwibG9jYWxMZWZ0Qm90dG9tIiwiZ2V0TG9jYWxDZW50ZXJCb3R0b20iLCJsb2NhbENlbnRlckJvdHRvbSIsImdldExvY2FsUmlnaHRCb3R0b20iLCJsb2NhbFJpZ2h0Qm90dG9tIiwiZ2V0SWQiLCJpZCIsIm9uVmlzaWJpbGl0eUNoYW5nZSIsInNldFZpc2libGVQcm9wZXJ0eSIsIm5ld1RhcmdldCIsInNldFRhcmdldFByb3BlcnR5IiwicHJvcGVydHkiLCJnZXRWaXNpYmxlUHJvcGVydHkiLCJzZXRWaXNpYmxlIiwic2V0UGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkIiwic2V0VGFyZ2V0UHJvcGVydHlJbnN0cnVtZW50ZWQiLCJnZXRQaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJnZXRUYXJnZXRQcm9wZXJ0eUluc3RydW1lbnRlZCIsInN3YXBWaXNpYmlsaXR5Iiwib3RoZXJOb2RlIiwidmlzaWJsZU5vZGUiLCJpbnZpc2libGVOb2RlIiwidmlzaWJsZU5vZGVGb2N1c2VkIiwic2V0T3BhY2l0eSIsIkVycm9yIiwiZ2V0T3BhY2l0eSIsInNldERpc2FibGVkT3BhY2l0eSIsImdldERpc2FibGVkT3BhY2l0eSIsImdldEVmZmVjdGl2ZU9wYWNpdHkiLCJlbmFibGVkUHJvcGVydHkiLCJlZmZlY3RpdmVPcGFjaXR5Iiwic2V0RmlsdGVycyIsImZpbHRlcnMiLCJBcnJheSIsImlzQXJyYXkiLCJldmVyeSIsImZpbHRlciIsImludmFsaWRhdGVIaW50IiwiZ2V0RmlsdGVycyIsInNldFBpY2thYmxlUHJvcGVydHkiLCJwaWNrYWJsZVByb3BlcnR5IiwiZ2V0UGlja2FibGVQcm9wZXJ0eSIsInNldFBpY2thYmxlIiwiaXNQaWNrYWJsZSIsIm9sZFBpY2thYmxlIiwib25QaWNrYWJsZUNoYW5nZSIsInNldEVuYWJsZWRQcm9wZXJ0eSIsImdldEVuYWJsZWRQcm9wZXJ0eSIsInNldFBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsImdldFBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsInNldEVuYWJsZWQiLCJpc0VuYWJsZWQiLCJzZXRJbnB1dEVuYWJsZWRQcm9wZXJ0eSIsImdldElucHV0RW5hYmxlZFByb3BlcnR5Iiwic2V0UGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJnZXRQaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsInNldElucHV0RW5hYmxlZCIsImlzSW5wdXRFbmFibGVkIiwic2V0SW5wdXRMaXN0ZW5lcnMiLCJnZXRJbnB1dExpc3RlbmVycyIsInNldEN1cnNvciIsImdldEN1cnNvciIsImdldEVmZmVjdGl2ZUN1cnNvciIsImlucHV0TGlzdGVuZXIiLCJzZXRNb3VzZUFyZWEiLCJhcmVhIiwib25Nb3VzZUFyZWFDaGFuZ2UiLCJnZXRNb3VzZUFyZWEiLCJzZXRUb3VjaEFyZWEiLCJvblRvdWNoQXJlYUNoYW5nZSIsImdldFRvdWNoQXJlYSIsInNldENsaXBBcmVhIiwic2hhcGUiLCJvbkNsaXBBcmVhQ2hhbmdlIiwiZ2V0Q2xpcEFyZWEiLCJoYXNDbGlwQXJlYSIsInNldFJlbmRlcmVyQml0bWFzayIsInNlbGZDaGFuZ2UiLCJpbnZhbGlkYXRlU3VwcG9ydGVkUmVuZGVyZXJzIiwic2V0UmVuZGVyZXIiLCJuZXdSZW5kZXJlciIsImJpdG1hc2tDYW52YXMiLCJiaXRtYXNrU1ZHIiwiYml0bWFza0RPTSIsImJpdG1hc2tXZWJHTCIsImdldFJlbmRlcmVyIiwic2V0TGF5ZXJTcGxpdCIsInNwbGl0IiwiaXNMYXllclNwbGl0Iiwic2V0VXNlc09wYWNpdHkiLCJnZXRVc2VzT3BhY2l0eSIsInNldENTU1RyYW5zZm9ybSIsImlzQ1NTVHJhbnNmb3JtZWQiLCJzZXRFeGNsdWRlSW52aXNpYmxlIiwiaXNFeGNsdWRlSW52aXNpYmxlIiwic2V0RXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyIsImV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMiLCJpc0V4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMiLCJzZXRMYXlvdXRPcHRpb25zIiwibGF5b3V0T3B0aW9ucyIsIk9iamVjdCIsImdldFByb3RvdHlwZU9mIiwicHJvdG90eXBlIiwiZ2V0TGF5b3V0T3B0aW9ucyIsIm11dGF0ZUxheW91dE9wdGlvbnMiLCJ3aWR0aFNpemFibGUiLCJoZWlnaHRTaXphYmxlIiwiZXh0ZW5kc1dpZHRoU2l6YWJsZSIsImV4dGVuZHNIZWlnaHRTaXphYmxlIiwiZXh0ZW5kc1NpemFibGUiLCJzZXRQcmV2ZW50Rml0IiwiaXNQcmV2ZW50Rml0Iiwic2V0V2ViR0xTY2FsZSIsImdldFdlYkdMU2NhbGUiLCJnZXRVbmlxdWVUcmFpbCIsInByZWRpY2F0ZSIsInRyYWlsIiwiYWRkQW5jZXN0b3IiLCJ0cmFpbHMiLCJnZXRUcmFpbHMiLCJnZXRVbmlxdWVUcmFpbFRvIiwicm9vdE5vZGUiLCJkZWZhdWx0VHJhaWxQcmVkaWNhdGUiLCJhcHBlbmRBbmNlc3RvclRyYWlsc1dpdGhQcmVkaWNhdGUiLCJnZXRUcmFpbHNUbyIsImdldExlYWZUcmFpbHMiLCJkZWZhdWx0TGVhZlRyYWlsUHJlZGljYXRlIiwiYXBwZW5kRGVzY2VuZGFudFRyYWlsc1dpdGhQcmVkaWNhdGUiLCJnZXRMZWFmVHJhaWxzVG8iLCJsZWFmTm9kZSIsImdldFVuaXF1ZUxlYWZUcmFpbCIsImdldFVuaXF1ZUxlYWZUcmFpbFRvIiwiZ2V0Q29ubmVjdGVkTm9kZXMiLCJyZXN1bHQiLCJmcmVzaCIsImNvbmNhdCIsImdldFN1YnRyZWVOb2RlcyIsImdldFRvcG9sb2dpY2FsbHlTb3J0ZWROb2RlcyIsImVkZ2VzIiwicyIsImwiLCJoYW5kbGVDaGlsZCIsImZpbmFsIiwiY2FuQWRkQ2hpbGQiLCJjYW52YXNQYWludFNlbGYiLCJ3cmFwcGVyIiwicmVuZGVyVG9DYW52YXNTZWxmIiwicmVuZGVyVG9DYW52YXNTdWJ0cmVlIiwiaWRlbnRpdHkiLCJyZXNldFN0eWxlcyIsInJlcXVpcmVzU2NyYXRjaENhbnZhcyIsImNvbnRleHQiLCJzYXZlIiwiY2FudmFzU2V0VHJhbnNmb3JtIiwiY2hpbGRDYW52YXNCb3VuZHMiLCJkaWxhdGUiLCJyb3VuZE91dCIsInNldE1pbk1heCIsImNhbnZhcyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImdldENvbnRleHQiLCJjaGlsZFdyYXBwZXIiLCJzdWJNYXRyaXgiLCJiZWdpblBhdGgiLCJ3cml0ZVRvQ29udGV4dCIsImNsaXAiLCJzZXRUcmFuc2Zvcm0iLCJnbG9iYWxBbHBoYSIsInNldEZpbHRlciIsImNhbnZhc0ZpbHRlciIsImlzRE9NQ29tcGF0aWJsZSIsIm1hcCIsImdldENTU0ZpbHRlclN0cmluZyIsImpvaW4iLCJhcHBseUNhbnZhc0ZpbHRlciIsImRyYXdJbWFnZSIsInJlc3RvcmUiLCJyZW5kZXJUb0NhbnZhcyIsImJhY2tncm91bmRDb2xvciIsImZpbGxTdHlsZSIsImZpbGxSZWN0IiwidG9DYW52YXMiLCJwYWRkaW5nIiwiY2VpbCIsImNhbnZhc0FwcGVuZFRyYW5zZm9ybSIsInRvRGF0YVVSTCIsInRvSW1hZ2UiLCJ1cmwiLCJpbWciLCJvbmxvYWQiLCJlIiwic3JjIiwidG9JbWFnZU5vZGVBc3luY2hyb25vdXMiLCJpbWFnZSIsInRvQ2FudmFzTm9kZVN5bmNocm9ub3VzIiwidG9EYXRhVVJMSW1hZ2VTeW5jaHJvbm91cyIsImRhdGFVUkwiLCJpbml0aWFsV2lkdGgiLCJpbml0aWFsSGVpZ2h0IiwidG9EYXRhVVJMTm9kZVN5bmNocm9ub3VzIiwicmFzdGVyaXplZCIsInByb3ZpZGVkT3B0aW9ucyIsInJlc29sdXRpb24iLCJzb3VyY2VCb3VuZHMiLCJ1c2VUYXJnZXRCb3VuZHMiLCJ3cmFwIiwidXNlQ2FudmFzIiwiaW1hZ2VPcHRpb25zIiwiTnVtYmVyIiwiaXNJbnRlZ2VyIiwid3JhcHBlck5vZGUiLCJ0cmFuc2Zvcm1lZEJvdW5kcyIsImRpbGF0ZWQiLCJyb3VuZGVkT3V0IiwiaW1hZ2VTb3VyY2UiLCJyb3VuZFN5bW1ldHJpYyIsImRpc3Bvc2UiLCJmaW5hbFBhcmVudEJvdW5kcyIsImltYWdlQm91bmRzIiwicGFyZW50VG9Mb2NhbEJvdW5kcyIsIndyYXBwZWROb2RlIiwiY3JlYXRlRE9NRHJhd2FibGUiLCJpbnN0YW5jZSIsImNyZWF0ZVNWR0RyYXdhYmxlIiwiY3JlYXRlQ2FudmFzRHJhd2FibGUiLCJjcmVhdGVXZWJHTERyYXdhYmxlIiwiZ2V0SW5zdGFuY2VzIiwiaW5zdGFuY2VzIiwiYWRkSW5zdGFuY2UiLCJyZW1vdmVJbnN0YW5jZSIsIndhc1Zpc3VhbGx5RGlzcGxheWVkIiwiZGlzcGxheSIsImdldFJvb3RlZERpc3BsYXlzIiwicm9vdGVkRGlzcGxheXMiLCJhZGRSb290ZWREaXNwbGF5Iiwib25BZGRlZFJvb3RlZERpc3BsYXkiLCJyZW1vdmVSb290ZWREaXNwbGF5Iiwib25SZW1vdmVkUm9vdGVkRGlzcGxheSIsImdldFJlY3Vyc2l2ZUNvbm5lY3RlZERpc3BsYXlzIiwiZGlzcGxheXMiLCJ1bmlxIiwiZ2V0Q29ubmVjdGVkRGlzcGxheXMiLCJsb2NhbFRvUGFyZW50UG9pbnQiLCJ0cmFuc2Zvcm1Qb3NpdGlvbjIiLCJ0cmFuc2Zvcm1Cb3VuZHMyIiwicGFyZW50VG9Mb2NhbFBvaW50IiwiaW52ZXJzZVBvc2l0aW9uMiIsImludmVyc2VCb3VuZHMyIiwidHJhbnNmb3JtQm91bmRzRnJvbVBhcmVudFRvTG9jYWwiLCJnZXRMb2NhbFRvR2xvYmFsTWF0cml4IiwibWF0cmljZXMiLCJnZXRVbmlxdWVUcmFuc2Zvcm0iLCJnZXRHbG9iYWxUb0xvY2FsTWF0cml4IiwiaW52ZXJ0IiwibG9jYWxUb0dsb2JhbFBvaW50IiwicmVzdWx0UG9pbnQiLCJtdWx0aXBseVZlY3RvcjIiLCJnbG9iYWxUb0xvY2FsUG9pbnQiLCJ0cmFuc2Zvcm1zIiwibG9jYWxUb0dsb2JhbEJvdW5kcyIsImdsb2JhbFRvTG9jYWxCb3VuZHMiLCJwYXJlbnRUb0dsb2JhbFBvaW50IiwicGFyZW50VG9HbG9iYWxCb3VuZHMiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwiZ2xvYmFsVG9QYXJlbnRCb3VuZHMiLCJnZXRHbG9iYWxCb3VuZHMiLCJnbG9iYWxCb3VuZHMiLCJib3VuZHNPZiIsImJvdW5kc1RvIiwiYXR0YWNoRHJhd2FibGUiLCJkcmF3YWJsZSIsImRldGFjaERyYXdhYmxlIiwia2V5Iiwia2V5cyIsImhhc093blByb3BlcnR5IiwiX211dGF0b3JLZXlzIiwiZGVzY3JpcHRvciIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsImluaXRpYWxpemVQaGV0aW9PYmplY3QiLCJwaGV0aW9UeXBlIiwiTm9kZUlPIiwicGhldGlvU3RhdGUiLCJiYXNlT3B0aW9ucyIsImNvbmZpZyIsIndhc0luc3RydW1lbnRlZCIsIlBIRVRfSU9fRU5BQkxFRCIsImluaXRpYWxpemVQaGV0aW8iLCJwaGV0aW9SZWFkT25seSIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwiZW5hYmxlZFByb3BlcnR5T3B0aW9ucyIsInBoZXRpb1ZhbHVlVHlwZSIsInBoZXRpb0ZlYXR1cmVkIiwiaW5wdXRFbmFibGVkUHJvcGVydHlPcHRpb25zIiwic2V0Vm9pY2luZ1Zpc2libGUiLCJ2b2ljaW5nVmlzaWJsZSIsImlzVm9pY2luZ1Zpc2libGUiLCJnZXREZWJ1Z0hUTUxFeHRyYXMiLCJpbnNwZWN0IiwibG9jYWxTdG9yYWdlIiwic2NlbmVyeVNuYXBzaG90IiwiSlNPTiIsInN0cmluZ2lmeSIsInR5cGUiLCJyb290Tm9kZUlkIiwibm9kZXMiLCJzcGFjZXMiLCJpbmNsdWRlQ2hpbGRyZW4iLCJuYW1lIiwiYXVkaXRJbnN0YW5jZVN1YnRyZWVGb3JEaXNwbGF5IiwibnVtSW5zdGFuY2VzIiwiZGVsdGFRdWFudGl0eSIsImRpc3Bvc2VQYXJhbGxlbERPTSIsImRpc3Bvc2VTdWJ0cmVlIiwiREVGQVVMVF9OT0RFX09QVElPTlMiLCJkcmF3YWJsZU1hcmtGbGFncyIsInJlZ2lzdGVyIiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsIm1ldGFkYXRhRGVmYXVsdHMiXSwic291cmNlcyI6WyJOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgTm9kZSBmb3IgdGhlIFNjZW5lcnkgc2NlbmUgZ3JhcGguIFN1cHBvcnRzIGdlbmVyYWwgZGlyZWN0ZWQgYWN5Y2xpYyBncmFwaGljcyAoREFHcykuXHJcbiAqIEhhbmRsZXMgbXVsdGlwbGUgbGF5ZXJzIHdpdGggYXNzb3J0ZWQgdHlwZXMgKENhbnZhcyAyRCwgU1ZHLCBET00sIFdlYkdMLCBldGMuKS5cclxuICpcclxuICogIyMgR2VuZXJhbCBkZXNjcmlwdGlvbiBvZiBOb2Rlc1xyXG4gKlxyXG4gKiBJbiBTY2VuZXJ5LCB0aGUgdmlzdWFsIG91dHB1dCBpcyBkZXRlcm1pbmVkIGJ5IGEgZ3JvdXAgb2YgY29ubmVjdGVkIE5vZGVzIChnZW5lcmFsbHkga25vd24gYXMgYSBzY2VuZSBncmFwaCkuXHJcbiAqIEVhY2ggTm9kZSBoYXMgYSBsaXN0IG9mICdjaGlsZCcgTm9kZXMuIFdoZW4gYSBOb2RlIGlzIHZpc3VhbGx5IGRpc3BsYXllZCwgaXRzIGNoaWxkIE5vZGVzIChjaGlsZHJlbikgd2lsbCBhbHNvIGJlXHJcbiAqIGRpc3BsYXllZCwgYWxvbmcgd2l0aCB0aGVpciBjaGlsZHJlbiwgZXRjLiBUaGVyZSBpcyB0eXBpY2FsbHkgb25lICdyb290JyBOb2RlIHRoYXQgaXMgcGFzc2VkIHRvIHRoZSBTY2VuZXJ5IERpc3BsYXlcclxuICogd2hvc2UgZGVzY2VuZGFudHMgKE5vZGVzIHRoYXQgY2FuIGJlIHRyYWNlZCBmcm9tIHRoZSByb290IGJ5IGNoaWxkIHJlbGF0aW9uc2hpcHMpIHdpbGwgYmUgZGlzcGxheWVkLlxyXG4gKlxyXG4gKiBGb3IgaW5zdGFuY2UsIHNheSB0aGVyZSBhcmUgTm9kZXMgbmFtZWQgQSwgQiwgQywgRCBhbmQgRSwgd2hvIGhhdmUgdGhlIHJlbGF0aW9uc2hpcHM6XHJcbiAqIC0gQiBpcyBhIGNoaWxkIG9mIEEgKHRodXMgQSBpcyBhIHBhcmVudCBvZiBCKVxyXG4gKiAtIEMgaXMgYSBjaGlsZCBvZiBBICh0aHVzIEEgaXMgYSBwYXJlbnQgb2YgQylcclxuICogLSBEIGlzIGEgY2hpbGQgb2YgQyAodGh1cyBDIGlzIGEgcGFyZW50IG9mIEQpXHJcbiAqIC0gRSBpcyBhIGNoaWxkIG9mIEMgKHRodXMgQyBpcyBhIHBhcmVudCBvZiBFKVxyXG4gKiB3aGVyZSBBIHdvdWxkIGJlIHRoZSByb290IE5vZGUuIFRoaXMgY2FuIGJlIHZpc3VhbGx5IHJlcHJlc2VudGVkIGFzIGEgc2NlbmUgZ3JhcGgsIHdoZXJlIGEgbGluZSBjb25uZWN0cyBhIHBhcmVudFxyXG4gKiBOb2RlIHRvIGEgY2hpbGQgTm9kZSAod2hlcmUgdGhlIHBhcmVudCBpcyB1c3VhbGx5IGFsd2F5cyBhdCB0aGUgdG9wIG9mIHRoZSBsaW5lLCBhbmQgdGhlIGNoaWxkIGlzIGF0IHRoZSBib3R0b20pOlxyXG4gKiBGb3IgZXhhbXBsZTpcclxuICpcclxuICogICBBXHJcbiAqICAvIFxcXHJcbiAqIEIgICBDXHJcbiAqICAgIC8gXFxcclxuICogICBEICAgRVxyXG4gKlxyXG4gKiBBZGRpdGlvbmFsbHksIGluIHRoaXMgY2FzZTpcclxuICogLSBEIGlzIGEgJ2Rlc2NlbmRhbnQnIG9mIEEgKGR1ZSB0byB0aGUgQyBiZWluZyBhIGNoaWxkIG9mIEEsIGFuZCBEIGJlaW5nIGEgY2hpbGQgb2YgQylcclxuICogLSBBIGlzIGFuICdhbmNlc3Rvcicgb2YgRCAoZHVlIHRvIHRoZSByZXZlcnNlKVxyXG4gKiAtIEMncyAnc3VidHJlZScgaXMgQywgRCBhbmQgRSwgd2hpY2ggY29uc2lzdHMgb2YgQyBpdHNlbGYgYW5kIGFsbCBvZiBpdHMgZGVzY2VuZGFudHMuXHJcbiAqXHJcbiAqIE5vdGUgdGhhdCBTY2VuZXJ5IGFsbG93cyBzb21lIG1vcmUgY29tcGxpY2F0ZWQgZm9ybXMsIHdoZXJlIE5vZGVzIGNhbiBoYXZlIG11bHRpcGxlIHBhcmVudHMsIGUuZy46XHJcbiAqXHJcbiAqICAgQVxyXG4gKiAgLyBcXFxyXG4gKiBCICAgQ1xyXG4gKiAgXFwgL1xyXG4gKiAgIERcclxuICpcclxuICogSW4gdGhpcyBjYXNlLCBEIGhhcyB0d28gcGFyZW50cyAoQiBhbmQgQykuIFNjZW5lcnkgZGlzYWxsb3dzIGFueSBOb2RlIGZyb20gYmVpbmcgaXRzIG93biBhbmNlc3RvciBvciBkZXNjZW5kYW50LFxyXG4gKiBzbyB0aGF0IGxvb3BzIGFyZSBub3QgcG9zc2libGUuIFdoZW4gYSBOb2RlIGhhcyB0d28gb3IgbW9yZSBwYXJlbnRzLCBpdCBtZWFucyB0aGF0IHRoZSBOb2RlJ3Mgc3VidHJlZSB3aWxsIHR5cGljYWxseVxyXG4gKiBiZSBkaXNwbGF5ZWQgdHdpY2Ugb24gdGhlIHNjcmVlbi4gSW4gdGhlIGFib3ZlIGNhc2UsIEQgd291bGQgYXBwZWFyIGJvdGggYXQgQidzIHBvc2l0aW9uIGFuZCBDJ3MgcG9zaXRpb24uIEVhY2hcclxuICogcGxhY2UgYSBOb2RlIHdvdWxkIGJlIGRpc3BsYXllZCBpcyBrbm93biBhcyBhbiAnaW5zdGFuY2UnLlxyXG4gKlxyXG4gKiBFYWNoIE5vZGUgaGFzIGEgJ3RyYW5zZm9ybScgYXNzb2NpYXRlZCB3aXRoIGl0LCB3aGljaCBkZXRlcm1pbmVzIGhvdyBpdHMgc3VidHJlZSAodGhhdCBOb2RlIGFuZCBhbGwgb2YgaXRzXHJcbiAqIGRlc2NlbmRhbnRzKSB3aWxsIGJlIHBvc2l0aW9uZWQuIFRyYW5zZm9ybXMgY2FuIGNvbnRhaW46XHJcbiAqIC0gVHJhbnNsYXRpb24sIHdoaWNoIG1vdmVzIHRoZSBwb3NpdGlvbiB0aGUgc3VidHJlZSBpcyBkaXNwbGF5ZWRcclxuICogLSBTY2FsZSwgd2hpY2ggbWFrZXMgdGhlIGRpc3BsYXllZCBzdWJ0cmVlIGxhcmdlciBvciBzbWFsbGVyXHJcbiAqIC0gUm90YXRpb24sIHdoaWNoIGRpc3BsYXlzIHRoZSBzdWJ0cmVlIGF0IGFuIGFuZ2xlXHJcbiAqIC0gb3IgYW55IGNvbWJpbmF0aW9uIG9mIHRoZSBhYm92ZSB0aGF0IHVzZXMgYW4gYWZmaW5lIG1hdHJpeCAobW9yZSBhZHZhbmNlZCB0cmFuc2Zvcm1zIHdpdGggc2hlYXIgYW5kIGNvbWJpbmF0aW9uc1xyXG4gKiAgIGFyZSBwb3NzaWJsZSkuXHJcbiAqXHJcbiAqIFNheSB3ZSBoYXZlIHRoZSBmb2xsb3dpbmcgc2NlbmUgZ3JhcGg6XHJcbiAqXHJcbiAqICAgQVxyXG4gKiAgIHxcclxuICogICBCXHJcbiAqICAgfFxyXG4gKiAgIENcclxuICpcclxuICogd2hlcmUgdGhlcmUgYXJlIHRoZSBmb2xsb3dpbmcgdHJhbnNmb3JtczpcclxuICogLSBBIGhhcyBhICd0cmFuc2xhdGlvbicgdGhhdCBtb3ZlcyB0aGUgY29udGVudCAxMDAgcGl4ZWxzIHRvIHRoZSByaWdodFxyXG4gKiAtIEIgaGFzIGEgJ3NjYWxlJyB0aGF0IGRvdWJsZXMgdGhlIHNpemUgb2YgdGhlIGNvbnRlbnRcclxuICogLSBDIGhhcyBhICdyb3RhdGlvbicgdGhhdCByb3RhdGVzIDE4MC1kZWdyZWVzIGFyb3VuZCB0aGUgb3JpZ2luXHJcbiAqXHJcbiAqIElmIEMgZGlzcGxheXMgYSBzcXVhcmUgdGhhdCBmaWxscyB0aGUgYXJlYSB3aXRoIDAgPD0geCA8PSAxMCBhbmQgMCA8PSB5IDw9IDEwLCB3ZSBjYW4gZGV0ZXJtaW5lIHRoZSBwb3NpdGlvbiBvblxyXG4gKiB0aGUgZGlzcGxheSBieSBhcHBseWluZyB0cmFuc2Zvcm1zIHN0YXJ0aW5nIGF0IEMgYW5kIG1vdmluZyB0b3dhcmRzIHRoZSByb290IE5vZGUgKGluIHRoaXMgY2FzZSwgQSk6XHJcbiAqIDEuIFdlIGFwcGx5IEMncyByb3RhdGlvbiB0byBvdXIgc3F1YXJlLCBzbyB0aGUgZmlsbGVkIGFyZWEgd2lsbCBub3cgYmUgLTEwIDw9IHggPD0gMCBhbmQgLTEwIDw9IHkgPD0gMFxyXG4gKiAyLiBXZSBhcHBseSBCJ3Mgc2NhbGUgdG8gb3VyIHNxdWFyZSwgc28gbm93IHdlIGhhdmUgLTIwIDw9IHggPD0gMCBhbmQgLTIwIDw9IHkgPD0gMFxyXG4gKiAzLiBXZSBhcHBseSBBJ3MgdHJhbnNsYXRpb24gdG8gb3VyIHNxdWFyZSwgbW92aW5nIGl0IHRvIDgwIDw9IHggPD0gMTAwIGFuZCAtMjAgPD0geSA8PSAwXHJcbiAqXHJcbiAqIE5vZGVzIGFsc28gaGF2ZSBhIGxhcmdlIG51bWJlciBvZiBwcm9wZXJ0aWVzIHRoYXQgd2lsbCBhZmZlY3QgaG93IHRoZWlyIGVudGlyZSBzdWJ0cmVlIGlzIHJlbmRlcmVkLCBzdWNoIGFzXHJcbiAqIHZpc2liaWxpdHksIG9wYWNpdHksIGV0Yy5cclxuICpcclxuICogIyMgQ3JlYXRpbmcgTm9kZXNcclxuICpcclxuICogR2VuZXJhbGx5LCB0aGVyZSBhcmUgdHdvIHR5cGVzIG9mIE5vZGVzOlxyXG4gKiAtIE5vZGVzIHRoYXQgZG9uJ3QgZGlzcGxheSBhbnl0aGluZywgYnV0IHNlcnZlIGFzIGEgY29udGFpbmVyIGZvciBvdGhlciBOb2RlcyAoZS5nLiBOb2RlIGl0c2VsZiwgSEJveCwgVkJveClcclxuICogLSBOb2RlcyB0aGF0IGRpc3BsYXkgY29udGVudCwgYnV0IEFMU08gc2VydmUgYXMgYSBjb250YWluZXIgKGUuZy4gQ2lyY2xlLCBJbWFnZSwgVGV4dClcclxuICpcclxuICogV2hlbiBhIE5vZGUgaXMgY3JlYXRlZCB3aXRoIHRoZSBkZWZhdWx0IE5vZGUgY29uc3RydWN0b3IsIGUuZy46XHJcbiAqICAgdmFyIG5vZGUgPSBuZXcgTm9kZSgpO1xyXG4gKiB0aGVuIHRoYXQgTm9kZSB3aWxsIG5vdCBkaXNwbGF5IGFueXRoaW5nIGJ5IGl0c2VsZi5cclxuICpcclxuICogR2VuZXJhbGx5IHN1YnR5cGVzIG9mIE5vZGUgYXJlIHVzZWQgZm9yIGRpc3BsYXlpbmcgdGhpbmdzLCBzdWNoIGFzIENpcmNsZSwgZS5nLjpcclxuICogICB2YXIgY2lyY2xlID0gbmV3IENpcmNsZSggMjAgKTsgLy8gcmFkaXVzIG9mIDIwXHJcbiAqXHJcbiAqIEFsbW9zdCBhbGwgTm9kZXMgKHdpdGggdGhlIGV4Y2VwdGlvbiBvZiBsZWFmLW9ubHkgTm9kZXMgbGlrZSBTcGFjZXIpIGNhbiBjb250YWluIGNoaWxkcmVuLlxyXG4gKlxyXG4gKiAjIyBDb25uZWN0aW5nIE5vZGVzLCBhbmQgcmVuZGVyaW5nIG9yZGVyXHJcbiAqXHJcbiAqIFRvIG1ha2UgYSAnY2hpbGROb2RlJyBiZWNvbWUgYSAncGFyZW50Tm9kZScsIHRoZSB0eXBpY2FsIHdheSBpcyB0byBjYWxsIGFkZENoaWxkKCk6XHJcbiAqICAgcGFyZW50Tm9kZS5hZGRDaGlsZCggY2hpbGROb2RlICk7XHJcbiAqXHJcbiAqIFRvIHJlbW92ZSB0aGlzIGNvbm5lY3Rpb24sIHlvdSBjYW4gY2FsbDpcclxuICogICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKCBjaGlsZE5vZGUgKTtcclxuICpcclxuICogQWRkaW5nIGEgY2hpbGQgTm9kZSB3aXRoIGFkZENoaWxkKCkgcHV0cyBpdCBhdCB0aGUgZW5kIG9mIHBhcmVudE5vZGUncyBsaXN0IG9mIGNoaWxkIE5vZGVzLiBUaGlzIGlzIGltcG9ydGFudCxcclxuICogYmVjYXVzZSB0aGUgb3JkZXIgb2YgY2hpbGRyZW4gYWZmZWN0cyB3aGF0IE5vZGVzIGFyZSBkcmF3biBvbiB0aGUgJ3RvcCcgb3IgJ2JvdHRvbScgdmlzdWFsbHkuIE5vZGVzIHRoYXQgYXJlIGF0IHRoZVxyXG4gKiBlbmQgb2YgdGhlIGxpc3Qgb2YgY2hpbGRyZW4gYXJlIGdlbmVyYWxseSBkcmF3biBvbiB0b3AuXHJcbiAqXHJcbiAqIFRoaXMgaXMgZ2VuZXJhbGx5IGVhc2llc3QgdG8gcmVwcmVzZW50IGJ5IG5vdGF0aW5nIHNjZW5lIGdyYXBocyB3aXRoIGNoaWxkcmVuIGluIG9yZGVyIGZyb20gbGVmdCB0byByaWdodCwgdGh1czpcclxuICpcclxuICogICBBXHJcbiAqICAvIFxcXHJcbiAqIEIgICBDXHJcbiAqICAgIC8gXFxcclxuICogICBEICAgRVxyXG4gKlxyXG4gKiB3b3VsZCBpbmRpY2F0ZSB0aGF0IEEncyBjaGlsZHJlbiBhcmUgW0IsQ10sIHNvIEMncyBzdWJ0cmVlIGlzIGRyYXduIE9OIFRPUCBvZiBCLiBUaGUgc2FtZSBpcyB0cnVlIG9mIEMncyBjaGlsZHJlblxyXG4gKiBbRCxFXSwgc28gRSBpcyBkcmF3biBvbiB0b3Agb2YgRC4gSWYgYSBOb2RlIGl0c2VsZiBoYXMgY29udGVudCwgaXQgaXMgZHJhd24gYmVsb3cgdGhhdCBvZiBpdHMgY2hpbGRyZW4gKHNvIEMgaXRzZWxmXHJcbiAqIHdvdWxkIGJlIGJlbG93IEQgYW5kIEUpLlxyXG4gKlxyXG4gKiBUaGlzIG1lYW5zIHRoYXQgZm9yIGV2ZXJ5IHNjZW5lIGdyYXBoLCBOb2RlcyBpbnN0YW5jZXMgY2FuIGJlIG9yZGVyZWQgZnJvbSBib3R0b20gdG8gdG9wLiBGb3IgdGhlIGFib3ZlIGV4YW1wbGUsIHRoZVxyXG4gKiBvcmRlciBpczpcclxuICogMS4gQSAob24gdGhlIHZlcnkgYm90dG9tIHZpc3VhbGx5LCBtYXkgZ2V0IGNvdmVyZWQgdXAgYnkgb3RoZXIgTm9kZXMpXHJcbiAqIDIuIEJcclxuICogMy4gQ1xyXG4gKiA0LiBEXHJcbiAqIDUuIEUgKG9uIHRoZSB2ZXJ5IHRvcCB2aXN1YWxseSwgbWF5IGJlIGNvdmVyaW5nIG90aGVyIE5vZGVzKVxyXG4gKlxyXG4gKiAjIyBUcmFpbHNcclxuICpcclxuICogRm9yIGV4YW1wbGVzIHdoZXJlIHRoZXJlIGFyZSBtdWx0aXBsZSBwYXJlbnRzIGZvciBzb21lIE5vZGVzIChhbHNvIHJlZmVycmVkIHRvIGFzIERBRyBpbiBzb21lIGNvZGUsIGFzIGl0IHJlcHJlc2VudHNcclxuICogYSBEaXJlY3RlZCBBY3ljbGljIEdyYXBoKSwgd2UgbmVlZCBtb3JlIGluZm9ybWF0aW9uIGFib3V0IHRoZSByZW5kZXJpbmcgb3JkZXIgKGFzIG90aGVyd2lzZSBOb2RlcyBjb3VsZCBhcHBlYXJcclxuICogbXVsdGlwbGUgcGxhY2VzIGluIHRoZSB2aXN1YWwgYm90dG9tLXRvLXRvcCBvcmRlci5cclxuICpcclxuICogQSBUcmFpbCBpcyBiYXNpY2FsbHkgYSBsaXN0IG9mIE5vZGVzLCB3aGVyZSBldmVyeSBOb2RlIGluIHRoZSBsaXN0IGlzIGEgY2hpbGQgb2YgaXRzIHByZXZpb3VzIGVsZW1lbnQsIGFuZCBhIHBhcmVudFxyXG4gKiBvZiBpdHMgbmV4dCBlbGVtZW50LiBUaHVzIGZvciB0aGUgc2NlbmUgZ3JhcGg6XHJcbiAqXHJcbiAqICAgQVxyXG4gKiAgLyBcXFxyXG4gKiBCICAgQ1xyXG4gKiAgXFwgLyBcXFxyXG4gKiAgIEQgICBFXHJcbiAqICAgIFxcIC9cclxuICogICAgIEZcclxuICpcclxuICogdGhlcmUgYXJlIGFjdHVhbGx5IHRocmVlIGluc3RhbmNlcyBvZiBGIGJlaW5nIGRpc3BsYXllZCwgd2l0aCB0aHJlZSB0cmFpbHM6XHJcbiAqIC0gW0EsQixELEZdXHJcbiAqIC0gW0EsQyxELEZdXHJcbiAqIC0gW0EsQyxFLEZdXHJcbiAqIE5vdGUgdGhhdCB0aGUgdHJhaWxzIGFyZSBlc3NlbnRpYWxseSBsaXN0aW5nIE5vZGVzIHVzZWQgaW4gd2Fsa2luZyBmcm9tIHRoZSByb290IChBKSB0byB0aGUgcmVsZXZhbnQgTm9kZSAoRikgdXNpbmdcclxuICogY29ubmVjdGlvbnMgYmV0d2VlbiBwYXJlbnRzIGFuZCBjaGlsZHJlbi5cclxuICpcclxuICogVGhlIHRyYWlscyBhYm92ZSBhcmUgaW4gb3JkZXIgZnJvbSBib3R0b20gdG8gdG9wICh2aXN1YWxseSksIGR1ZSB0byB0aGUgb3JkZXIgb2YgY2hpbGRyZW4uIFRodXMgc2luY2UgQSdzIGNoaWxkcmVuXHJcbiAqIGFyZSBbQixDXSBpbiB0aGF0IG9yZGVyLCBGIHdpdGggdGhlIHRyYWlsIFtBLEIsRCxGXSBpcyBkaXNwbGF5ZWQgYmVsb3cgW0EsQyxELEZdLCBiZWNhdXNlIEMgaXMgYWZ0ZXIgQi5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHksIHsgQm9vbGVhblByb3BlcnR5T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVuYWJsZWRQcm9wZXJ0eSwgeyBFbmFibGVkUHJvcGVydHlPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9FbmFibGVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHksIHsgUHJvcGVydHlPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUaW55RW1pdHRlciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RpbnlFbWl0dGVyLmpzJztcclxuaW1wb3J0IFRpbnlGb3J3YXJkaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UaW55Rm9yd2FyZGluZ1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRpbnlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RpbnlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUaW55U3RhdGljUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UaW55U3RhdGljUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFRyYW5zZm9ybTMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1RyYW5zZm9ybTMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGFycmF5RGlmZmVyZW5jZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvYXJyYXlEaWZmZXJlbmNlLmpzJztcclxuaW1wb3J0IGRlcHJlY2F0aW9uV2FybmluZyBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvZGVwcmVjYXRpb25XYXJuaW5nLmpzJztcclxuaW1wb3J0IFBoZXRpb09iamVjdCwgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBCb29sZWFuSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0Jvb2xlYW5JTy5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBBQ0NFU1NJQklMSVRZX09QVElPTl9LRVlTLCBDYW52YXNDb250ZXh0V3JhcHBlciwgQ2FudmFzU2VsZkRyYXdhYmxlLCBEaXNwbGF5LCBET01TZWxmRHJhd2FibGUsIERyYXdhYmxlLCBGZWF0dXJlcywgRmlsdGVyLCBJbWFnZSwgSW1hZ2VPcHRpb25zLCBJbnN0YW5jZSwgaXNIZWlnaHRTaXphYmxlLCBpc1dpZHRoU2l6YWJsZSwgTGF5b3V0Q29uc3RyYWludCwgTW91c2UsIFBhcmFsbGVsRE9NLCBQYXJhbGxlbERPTU9wdGlvbnMsIFBpY2tlciwgUG9pbnRlciwgUmVuZGVyZXIsIFJlbmRlcmVyU3VtbWFyeSwgc2NlbmVyeSwgc2VyaWFsaXplQ29ubmVjdGVkTm9kZXMsIFNWR1NlbGZEcmF3YWJsZSwgVElucHV0TGlzdGVuZXIsIFRMYXlvdXRPcHRpb25zLCBUcmFpbCwgV2ViR0xTZWxmRHJhd2FibGUgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucywgb3B0aW9uaXplMyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xyXG5cclxubGV0IGdsb2JhbElkQ291bnRlciA9IDE7XHJcblxyXG5jb25zdCBzY3JhdGNoQm91bmRzMiA9IEJvdW5kczIuTk9USElORy5jb3B5KCk7IC8vIG11dGFibGUge0JvdW5kczJ9IHVzZWQgdGVtcG9yYXJpbHkgaW4gbWV0aG9kc1xyXG5jb25zdCBzY3JhdGNoQm91bmRzMkV4dHJhID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTsgLy8gbXV0YWJsZSB7Qm91bmRzMn0gdXNlZCB0ZW1wb3JhcmlseSBpbiBtZXRob2RzXHJcbmNvbnN0IHNjcmF0Y2hNYXRyaXgzID0gbmV3IE1hdHJpeDMoKTtcclxuXHJcbmNvbnN0IEVOQUJMRURfUFJPUEVSVFlfVEFOREVNX05BTUUgPSBFbmFibGVkUHJvcGVydHkuVEFOREVNX05BTUU7XHJcbmNvbnN0IFZJU0lCTEVfUFJPUEVSVFlfVEFOREVNX05BTUUgPSAndmlzaWJsZVByb3BlcnR5JztcclxuY29uc3QgSU5QVVRfRU5BQkxFRF9QUk9QRVJUWV9UQU5ERU1fTkFNRSA9ICdpbnB1dEVuYWJsZWRQcm9wZXJ0eSc7XHJcblxyXG5jb25zdCBQSEVUX0lPX1NUQVRFX0RFRkFVTFQgPSBmYWxzZTtcclxuXHJcbi8vIFN0b3JlIHRoZSBudW1iZXIgb2YgcGFyZW50cyBmcm9tIHRoZSBzaW5nbGUgTm9kZSBpbnN0YW5jZSB0aGF0IGhhcyB0aGUgbW9zdCBwYXJlbnRzIGluIHRoZSB3aG9sZSBydW50aW1lLlxyXG5sZXQgbWF4UGFyZW50Q291bnQgPSAwO1xyXG5cclxuZXhwb3J0IGNvbnN0IFJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZUyA9IFtcclxuICAnbGVmdFRvcCcsIC8vIHtWZWN0b3IyfSAtIFRoZSB1cHBlci1sZWZ0IGNvcm5lciBvZiB0aGlzIE5vZGUncyBib3VuZHMsIHNlZSBzZXRMZWZ0VG9wKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICdjZW50ZXJUb3AnLCAvLyB7VmVjdG9yMn0gLSBUaGUgdG9wLWNlbnRlciBvZiB0aGlzIE5vZGUncyBib3VuZHMsIHNlZSBzZXRDZW50ZXJUb3AoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ3JpZ2h0VG9wJywgLy8ge1ZlY3RvcjJ9IC0gVGhlIHVwcGVyLXJpZ2h0IGNvcm5lciBvZiB0aGlzIE5vZGUncyBib3VuZHMsIHNlZSBzZXRSaWdodFRvcCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuICAnbGVmdENlbnRlcicsIC8vIHtWZWN0b3IyfSAtIFRoZSBsZWZ0LWNlbnRlciBvZiB0aGlzIE5vZGUncyBib3VuZHMsIHNlZSBzZXRMZWZ0Q2VudGVyKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICdjZW50ZXInLCAvLyB7VmVjdG9yMn0gLSBUaGUgY2VudGVyIG9mIHRoaXMgTm9kZSdzIGJvdW5kcywgc2VlIHNldENlbnRlcigpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuICAncmlnaHRDZW50ZXInLCAvLyB7VmVjdG9yMn0gLSBUaGUgY2VudGVyLXJpZ2h0IG9mIHRoaXMgTm9kZSdzIGJvdW5kcywgc2VlIHNldFJpZ2h0Q2VudGVyKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICdsZWZ0Qm90dG9tJywgLy8ge1ZlY3RvcjJ9IC0gVGhlIGJvdHRvbS1sZWZ0IG9mIHRoaXMgTm9kZSdzIGJvdW5kcywgc2VlIHNldExlZnRCb3R0b20oKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ2NlbnRlckJvdHRvbScsIC8vIHtWZWN0b3IyfSAtIFRoZSBtaWRkbGUgY2VudGVyIG9mIHRoaXMgTm9kZSdzIGJvdW5kcywgc2VlIHNldENlbnRlckJvdHRvbSgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuICAncmlnaHRCb3R0b20nLCAvLyB7VmVjdG9yMn0gLSBUaGUgYm90dG9tIHJpZ2h0IG9mIHRoaXMgTm9kZSdzIGJvdW5kcywgc2VlIHNldFJpZ2h0Qm90dG9tKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICdsZWZ0JywgLy8ge251bWJlcn0gLSBUaGUgbGVmdCBzaWRlIG9mIHRoaXMgTm9kZSdzIGJvdW5kcywgc2VlIHNldExlZnQoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ3JpZ2h0JywgLy8ge251bWJlcn0gLSBUaGUgcmlnaHQgc2lkZSBvZiB0aGlzIE5vZGUncyBib3VuZHMsIHNlZSBzZXRSaWdodCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuICAndG9wJywgLy8ge251bWJlcn0gLSBUaGUgdG9wIHNpZGUgb2YgdGhpcyBOb2RlJ3MgYm91bmRzLCBzZWUgc2V0VG9wKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICdib3R0b20nLCAvLyB7bnVtYmVyfSAtIFRoZSBib3R0b20gc2lkZSBvZiB0aGlzIE5vZGUncyBib3VuZHMsIHNlZSBzZXRCb3R0b20oKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ2NlbnRlclgnLCAvLyB7bnVtYmVyfSAtIFRoZSB4LWNlbnRlciBvZiB0aGlzIE5vZGUncyBib3VuZHMsIHNlZSBzZXRDZW50ZXJYKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICdjZW50ZXJZJyAvLyB7bnVtYmVyfSAtIFRoZSB5LWNlbnRlciBvZiB0aGlzIE5vZGUncyBib3VuZHMsIHNlZSBzZXRDZW50ZXJZKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG5dO1xyXG5cclxuLy8gTm9kZSBvcHRpb25zLCBpbiB0aGUgb3JkZXIgdGhleSBhcmUgZXhlY3V0ZWQgaW4gdGhlIGNvbnN0cnVjdG9yL211dGF0ZSgpXHJcbmNvbnN0IE5PREVfT1BUSU9OX0tFWVMgPSBbXHJcbiAgJ2NoaWxkcmVuJywgLy8gTGlzdCBvZiBjaGlsZHJlbiB0byBhZGQgKGluIG9yZGVyKSwgc2VlIHNldENoaWxkcmVuIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuICAnY3Vyc29yJywgLy8gQ1NTIGN1cnNvciB0byBkaXNwbGF5IHdoZW4gb3ZlciB0aGlzIE5vZGUsIHNlZSBzZXRDdXJzb3IoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcblxyXG4gICdwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQnLCAvLyBXaGVuIHRydWUsIGNyZWF0ZSBhbiBpbnN0cnVtZW50ZWQgdmlzaWJsZVByb3BlcnR5IHdoZW4gdGhpcyBOb2RlIGlzIGluc3RydW1lbnRlZCwgc2VlIHNldFBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuICAndmlzaWJsZVByb3BlcnR5JywgLy8gU2V0cyBmb3J3YXJkaW5nIG9mIHRoZSB2aXNpYmxlUHJvcGVydHksIHNlZSBzZXRWaXNpYmxlUHJvcGVydHkoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ3Zpc2libGUnLCAvLyBXaGV0aGVyIHRoZSBOb2RlIGlzIHZpc2libGUsIHNlZSBzZXRWaXNpYmxlKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG5cclxuICAncGlja2FibGVQcm9wZXJ0eScsIC8vIFNldHMgZm9yd2FyZGluZyBvZiB0aGUgcGlja2FibGVQcm9wZXJ0eSwgc2VlIHNldFBpY2thYmxlUHJvcGVydHkoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ3BpY2thYmxlJywgLy8gV2hldGhlciB0aGUgTm9kZSBpcyBwaWNrYWJsZSwgc2VlIHNldFBpY2thYmxlKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG5cclxuICAncGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkJywgLy8gV2hlbiB0cnVlLCBjcmVhdGUgYW4gaW5zdHJ1bWVudGVkIGVuYWJsZWRQcm9wZXJ0eSB3aGVuIHRoaXMgTm9kZSBpcyBpbnN0cnVtZW50ZWQsIHNlZSBzZXRQaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ2VuYWJsZWRQcm9wZXJ0eScsIC8vIFNldHMgZm9yd2FyZGluZyBvZiB0aGUgZW5hYmxlZFByb3BlcnR5LCBzZWUgc2V0RW5hYmxlZFByb3BlcnR5KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICdlbmFibGVkJywgLy8gV2hldGhlciB0aGUgTm9kZSBpcyBlbmFibGVkLCBzZWUgc2V0RW5hYmxlZCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuXHJcbiAgJ3BoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkJywgLy8gV2hlbiB0cnVlLCBjcmVhdGUgYW4gaW5zdHJ1bWVudGVkIGlucHV0RW5hYmxlZFByb3BlcnR5IHdoZW4gdGhpcyBOb2RlIGlzIGluc3RydW1lbnRlZCwgc2VlIHNldFBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICdpbnB1dEVuYWJsZWRQcm9wZXJ0eScsIC8vIFNldHMgZm9yd2FyZGluZyBvZiB0aGUgaW5wdXRFbmFibGVkUHJvcGVydHksIHNlZSBzZXRJbnB1dEVuYWJsZWRQcm9wZXJ0eSgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuICAnaW5wdXRFbmFibGVkJywgLy8ge2Jvb2xlYW59IFdoZXRoZXIgaW5wdXQgZXZlbnRzIGNhbiByZWFjaCBpbnRvIHRoaXMgc3VidHJlZSwgc2VlIHNldElucHV0RW5hYmxlZCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuICAnaW5wdXRMaXN0ZW5lcnMnLCAvLyBUaGUgaW5wdXQgbGlzdGVuZXJzIGF0dGFjaGVkIHRvIHRoZSBOb2RlLCBzZWUgc2V0SW5wdXRMaXN0ZW5lcnMoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ29wYWNpdHknLCAvLyBPcGFjaXR5IG9mIHRoaXMgTm9kZSdzIHN1YnRyZWUsIHNlZSBzZXRPcGFjaXR5KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICdkaXNhYmxlZE9wYWNpdHknLCAvLyBBIG11bHRpcGxpZXIgdG8gdGhlIG9wYWNpdHkgb2YgdGhpcyBOb2RlJ3Mgc3VidHJlZSB3aGVuIHRoZSBub2RlIGlzIGRpc2FibGVkLCBzZWUgc2V0RGlzYWJsZWRPcGFjaXR5KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICdmaWx0ZXJzJywgLy8gTm9uLW9wYWNpdHkgZmlsdGVycywgc2VlIHNldEZpbHRlcnMoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ21hdHJpeCcsIC8vIFRyYW5zZm9ybWF0aW9uIG1hdHJpeCBvZiB0aGUgTm9kZSwgc2VlIHNldE1hdHJpeCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuICAndHJhbnNsYXRpb24nLCAvLyB4L3kgdHJhbnNsYXRpb24gb2YgdGhlIE5vZGUsIHNlZSBzZXRUcmFuc2xhdGlvbigpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuICAneCcsIC8vIHggdHJhbnNsYXRpb24gb2YgdGhlIE5vZGUsIHNlZSBzZXRYKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICd5JywgLy8geSB0cmFuc2xhdGlvbiBvZiB0aGUgTm9kZSwgc2VlIHNldFkoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ3JvdGF0aW9uJywgLy8gcm90YXRpb24gKGluIHJhZGlhbnMpIG9mIHRoZSBOb2RlLCBzZWUgc2V0Um90YXRpb24oKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ3NjYWxlJywgLy8gc2NhbGUgb2YgdGhlIE5vZGUsIHNlZSBzY2FsZSgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuICAnZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcycsIC8vIENvbnRyb2xzIGJvdW5kcyBkZXBlbmRpbmcgb24gY2hpbGQgdmlzaWJpbGl0eSwgc2VlIHNldEV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ2xheW91dE9wdGlvbnMnLCAvLyBQcm92aWRlZCB0byBsYXlvdXQgY29udGFpbmVycyBmb3Igb3B0aW9ucywgc2VlIHNldExheW91dE9wdGlvbnMoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ2xvY2FsQm91bmRzJywgLy8gYm91bmRzIG9mIHN1YnRyZWUgaW4gbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSwgc2VlIHNldExvY2FsQm91bmRzKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICdtYXhXaWR0aCcsIC8vIENvbnN0cmFpbnMgd2lkdGggb2YgdGhpcyBOb2RlLCBzZWUgc2V0TWF4V2lkdGgoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ21heEhlaWdodCcsIC8vIENvbnN0cmFpbnMgaGVpZ2h0IG9mIHRoaXMgTm9kZSwgc2VlIHNldE1heEhlaWdodCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuICAncmVuZGVyZXInLCAvLyBUaGUgcHJlZmVycmVkIHJlbmRlcmVyIGZvciB0aGlzIHN1YnRyZWUsIHNlZSBzZXRSZW5kZXJlcigpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuICAnbGF5ZXJTcGxpdCcsIC8vIEZvcmNlcyB0aGlzIHN1YnRyZWUgaW50byBhIGxheWVyIG9mIGl0cyBvd24sIHNlZSBzZXRMYXllclNwbGl0KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICd1c2VzT3BhY2l0eScsIC8vIEhpbnQgdGhhdCBvcGFjaXR5IHdpbGwgYmUgY2hhbmdlZCwgc2VlIHNldFVzZXNPcGFjaXR5KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICdjc3NUcmFuc2Zvcm0nLCAvLyBIaW50IHRoYXQgY2FuIHRyaWdnZXIgdXNpbmcgQ1NTIHRyYW5zZm9ybXMsIHNlZSBzZXRDc3NUcmFuc2Zvcm0oKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ2V4Y2x1ZGVJbnZpc2libGUnLCAvLyBJZiB0aGlzIGlzIGludmlzaWJsZSwgZXhjbHVkZSBmcm9tIERPTSwgc2VlIHNldEV4Y2x1ZGVJbnZpc2libGUoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ3dlYmdsU2NhbGUnLCAvLyBIaW50IHRvIGFkanVzdCBXZWJHTCBzY2FsaW5nIHF1YWxpdHkgZm9yIHRoaXMgc3VidHJlZSwgc2VlIHNldFdlYmdsU2NhbGUoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ3ByZXZlbnRGaXQnLCAvLyBQcmV2ZW50cyBsYXllcnMgZnJvbSBmaXR0aW5nIHRoaXMgc3VidHJlZSwgc2VlIHNldFByZXZlbnRGaXQoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ21vdXNlQXJlYScsIC8vIENoYW5nZXMgdGhlIGFyZWEgdGhlIG1vdXNlIGNhbiBpbnRlcmFjdCB3aXRoLCBzZWUgc2V0TW91c2VBcmVhKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gICd0b3VjaEFyZWEnLCAvLyBDaGFuZ2VzIHRoZSBhcmVhIHRvdWNoZXMgY2FuIGludGVyYWN0IHdpdGgsIHNlZSBzZXRUb3VjaEFyZWEoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgJ2NsaXBBcmVhJywgLy8gTWFrZXMgdGhpbmdzIG91dHNpZGUgb2YgYSBzaGFwZSBpbnZpc2libGUsIHNlZSBzZXRDbGlwQXJlYSgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuICAndHJhbnNmb3JtQm91bmRzJywgLy8gRmxhZyB0aGF0IG1ha2VzIGJvdW5kcyB0aWdodGVyLCBzZWUgc2V0VHJhbnNmb3JtQm91bmRzKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gIC4uLlJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZU1xyXG5dO1xyXG5cclxuY29uc3QgREVGQVVMVF9PUFRJT05TID0ge1xyXG4gIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogdHJ1ZSxcclxuICB2aXNpYmxlOiB0cnVlLFxyXG4gIG9wYWNpdHk6IDEsXHJcbiAgZGlzYWJsZWRPcGFjaXR5OiAxLFxyXG4gIHBpY2thYmxlOiBudWxsLFxyXG4gIGVuYWJsZWQ6IHRydWUsXHJcbiAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZSxcclxuICBpbnB1dEVuYWJsZWQ6IHRydWUsXHJcbiAgcGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ6IGZhbHNlLFxyXG4gIGNsaXBBcmVhOiBudWxsLFxyXG4gIG1vdXNlQXJlYTogbnVsbCxcclxuICB0b3VjaEFyZWE6IG51bGwsXHJcbiAgY3Vyc29yOiBudWxsLFxyXG4gIHRyYW5zZm9ybUJvdW5kczogZmFsc2UsXHJcbiAgbWF4V2lkdGg6IG51bGwsXHJcbiAgbWF4SGVpZ2h0OiBudWxsLFxyXG4gIHJlbmRlcmVyOiBudWxsLFxyXG4gIHVzZXNPcGFjaXR5OiBmYWxzZSxcclxuICBsYXllclNwbGl0OiBmYWxzZSxcclxuICBjc3NUcmFuc2Zvcm06IGZhbHNlLFxyXG4gIGV4Y2x1ZGVJbnZpc2libGU6IGZhbHNlLFxyXG4gIHdlYmdsU2NhbGU6IG51bGwsXHJcbiAgcHJldmVudEZpdDogZmFsc2VcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFJlbmRlcmVyVHlwZSA9ICdzdmcnIHwgJ2NhbnZhcycgfCAnd2ViZ2wnIHwgJ2RvbScgfCBudWxsO1xyXG5cclxuLy8gSXNvbGF0ZWQgc28gdGhhdCB3ZSBjYW4gZGVsYXkgb3B0aW9ucyB0aGF0IGFyZSBiYXNlZCBvbiBib3VuZHMgb2YgdGhlIE5vZGUgdG8gYWZ0ZXIgY29uc3RydWN0aW9uLlxyXG4vLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzEzMzJcclxuZXhwb3J0IHR5cGUgTm9kZUJvdW5kc0Jhc2VkVHJhbnNsYXRpb25PcHRpb25zID0ge1xyXG4gIGxlZnRUb3A/OiBWZWN0b3IyO1xyXG4gIGNlbnRlclRvcD86IFZlY3RvcjI7XHJcbiAgcmlnaHRUb3A/OiBWZWN0b3IyO1xyXG4gIGxlZnRDZW50ZXI/OiBWZWN0b3IyO1xyXG4gIGNlbnRlcj86IFZlY3RvcjI7XHJcbiAgcmlnaHRDZW50ZXI/OiBWZWN0b3IyO1xyXG4gIGxlZnRCb3R0b20/OiBWZWN0b3IyO1xyXG4gIGNlbnRlckJvdHRvbT86IFZlY3RvcjI7XHJcbiAgcmlnaHRCb3R0b20/OiBWZWN0b3IyO1xyXG4gIGxlZnQ/OiBudW1iZXI7XHJcbiAgcmlnaHQ/OiBudW1iZXI7XHJcbiAgdG9wPzogbnVtYmVyO1xyXG4gIGJvdHRvbT86IG51bWJlcjtcclxuICBjZW50ZXJYPzogbnVtYmVyO1xyXG4gIGNlbnRlclk/OiBudW1iZXI7XHJcbn07XHJcblxyXG4vLyBBbGwgdHJhbnNsYXRpb24gb3B0aW9ucyAoaW5jbHVkZXMgdGhvc2UgYmFzZWQgb24gYm91bmRzIGFuZCB0aG9zZSB0aGF0IGFyZSBub3QpXHJcbmV4cG9ydCB0eXBlIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMgPSB7XHJcbiAgdHJhbnNsYXRpb24/OiBWZWN0b3IyO1xyXG4gIHg/OiBudW1iZXI7XHJcbiAgeT86IG51bWJlcjtcclxufSAmIE5vZGVCb3VuZHNCYXNlZFRyYW5zbGF0aW9uT3B0aW9ucztcclxuXHJcbi8vIEFsbCB0cmFuc2Zvcm0gb3B0aW9ucyAoaW5jbHVkZXMgdHJhbnNsYXRpb24gb3B0aW9ucylcclxuZXhwb3J0IHR5cGUgTm9kZVRyYW5zZm9ybU9wdGlvbnMgPSB7XHJcbiAgbWF0cml4PzogTWF0cml4MztcclxuICByb3RhdGlvbj86IG51bWJlcjtcclxuICBzY2FsZT86IG51bWJlciB8IFZlY3RvcjI7XHJcbn0gJiBOb2RlVHJhbnNsYXRpb25PcHRpb25zO1xyXG5cclxuLy8gQWxsIGJhc2UgTm9kZSBvcHRpb25zXHJcbmV4cG9ydCB0eXBlIE5vZGVPcHRpb25zID0ge1xyXG4gIGNoaWxkcmVuPzogTm9kZVtdO1xyXG4gIGN1cnNvcj86IHN0cmluZyB8IG51bGw7XHJcbiAgcGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkPzogYm9vbGVhbjtcclxuICB2aXNpYmxlUHJvcGVydHk/OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiB8IG51bGw7XHJcbiAgdmlzaWJsZT86IGJvb2xlYW47XHJcbiAgcGlja2FibGVQcm9wZXJ0eT86IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4gfCBudWxsPiB8IG51bGw7XHJcbiAgcGlja2FibGU/OiBib29sZWFuIHwgbnVsbDtcclxuICBwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ/OiBib29sZWFuO1xyXG4gIGVuYWJsZWRQcm9wZXJ0eT86IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+IHwgbnVsbDtcclxuICBlbmFibGVkPzogYm9vbGVhbjtcclxuICBwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZD86IGJvb2xlYW47XHJcbiAgaW5wdXRFbmFibGVkUHJvcGVydHk/OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiB8IG51bGw7XHJcbiAgaW5wdXRFbmFibGVkPzogYm9vbGVhbjtcclxuICBpbnB1dExpc3RlbmVycz86IFRJbnB1dExpc3RlbmVyW107XHJcbiAgb3BhY2l0eT86IG51bWJlcjtcclxuICBkaXNhYmxlZE9wYWNpdHk/OiBudW1iZXI7XHJcbiAgZmlsdGVycz86IEZpbHRlcltdO1xyXG4gIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM/OiBib29sZWFuO1xyXG4gIGxheW91dE9wdGlvbnM/OiBUTGF5b3V0T3B0aW9ucyB8IG51bGw7XHJcbiAgbG9jYWxCb3VuZHM/OiBCb3VuZHMyIHwgbnVsbDtcclxuICBtYXhXaWR0aD86IG51bWJlciB8IG51bGw7XHJcbiAgbWF4SGVpZ2h0PzogbnVtYmVyIHwgbnVsbDtcclxuICByZW5kZXJlcj86IFJlbmRlcmVyVHlwZTtcclxuICBsYXllclNwbGl0PzogYm9vbGVhbjtcclxuICB1c2VzT3BhY2l0eT86IGJvb2xlYW47XHJcbiAgY3NzVHJhbnNmb3JtPzogYm9vbGVhbjtcclxuICBleGNsdWRlSW52aXNpYmxlPzogYm9vbGVhbjtcclxuICB3ZWJnbFNjYWxlPzogbnVtYmVyIHwgbnVsbDtcclxuICBwcmV2ZW50Rml0PzogYm9vbGVhbjtcclxuICBtb3VzZUFyZWE/OiBTaGFwZSB8IEJvdW5kczIgfCBudWxsO1xyXG4gIHRvdWNoQXJlYT86IFNoYXBlIHwgQm91bmRzMiB8IG51bGw7XHJcbiAgY2xpcEFyZWE/OiBTaGFwZSB8IG51bGw7XHJcbiAgdHJhbnNmb3JtQm91bmRzPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gVGhpcyBvcHRpb24gaXMgdXNlZCB0byBjcmVhdGUgdGhlIGluc3RydW1lbnRlZCwgZGVmYXVsdCBQaEVULWlPIHZpc2libGVQcm9wZXJ0eS4gVGhlc2Ugb3B0aW9ucyBzaG91bGQgbm90XHJcbiAgLy8gYmUgcHJvdmlkZWQgaWYgYSBgdmlzaWJsZVByb3BlcnR5YCB3YXMgcHJvdmlkZWQgdG8gdGhpcyBOb2RlLCB0aG91Z2ggaWYgdGhleSBhcmUsIHRoZXkgd2lsbCBqdXN0IGJlIGlnbm9yZWQuXHJcbiAgLy8gVGhpcyBncmFjZSBpcyB0byBzdXBwb3J0IGRlZmF1bHQgb3B0aW9ucyBhY3Jvc3MgdGhlIGNvbXBvbmVudCBoaWVyYXJjaHkgbWVsZGluZyB3aXRoIHVzYWdlcyBwcm92aWRpbmcgYSB2aXNpYmxlUHJvcGVydHkuXHJcbiAgLy8gVGhpcyBvcHRpb24gaXMgYSBiaXQgYnVyaWVkIGJlY2F1c2UgaXQgY2FuIG9ubHkgYmUgdXNlZCB3aGVuIHRoZSBOb2RlIGlzIGJlaW5nIGluc3RydW1lbnRlZCwgd2hpY2ggaXMgd2hlblxyXG4gIC8vIHRoZSBkZWZhdWx0LCBpbnN0cnVtZW50ZWQgdmlzaWJsZVByb3BlcnR5IGlzIGNvbmRpdGlvbmFsbHkgY3JlYXRlZC4gV2UgZG9uJ3Qgd2FudCB0byBzdG9yZSB0aGVzZSBvbiB0aGUgTm9kZSxcclxuICAvLyBhbmQgdGh1cyB0aGV5IGFyZW4ndCBzdXBwb3J0IHRocm91Z2ggYG11dGF0ZSgpYC5cclxuICB2aXNpYmxlUHJvcGVydHlPcHRpb25zPzogUHJvcGVydHlPcHRpb25zPGJvb2xlYW4+O1xyXG4gIGVuYWJsZWRQcm9wZXJ0eU9wdGlvbnM/OiBQcm9wZXJ0eU9wdGlvbnM8Ym9vbGVhbj47XHJcbiAgaW5wdXRFbmFibGVkUHJvcGVydHlPcHRpb25zPzogUHJvcGVydHlPcHRpb25zPGJvb2xlYW4+O1xyXG59ICYgUGFyYWxsZWxET01PcHRpb25zICYgTm9kZVRyYW5zZm9ybU9wdGlvbnM7XHJcblxyXG50eXBlIFJhc3Rlcml6ZWRPcHRpb25zID0ge1xyXG4gIHJlc29sdXRpb24/OiBudW1iZXI7XHJcbiAgc291cmNlQm91bmRzPzogQm91bmRzMiB8IG51bGw7XHJcbiAgdXNlVGFyZ2V0Qm91bmRzPzogYm9vbGVhbjtcclxuICB3cmFwPzogYm9vbGVhbjtcclxuICB1c2VDYW52YXM/OiBib29sZWFuO1xyXG4gIGltYWdlT3B0aW9ucz86IEltYWdlT3B0aW9ucztcclxufTtcclxuXHJcbmNsYXNzIE5vZGUgZXh0ZW5kcyBQYXJhbGxlbERPTSB7XHJcbiAgLy8gTk9URTogQWxsIG1lbWJlciBwcm9wZXJ0aWVzIHdpdGggbmFtZXMgc3RhcnRpbmcgd2l0aCAnXycgYXJlIGFzc3VtZWQgdG8gYmUgcHJpdmF0ZS9wcm90ZWN0ZWQhXHJcblxyXG4gIC8vIEFzc2lnbnMgYSB1bmlxdWUgSUQgdG8gdGhpcyBOb2RlIChhbGxvd3MgdHJhaWxzIHRvIGdldCBhIHVuaXF1ZSBsaXN0IG9mIElEcylcclxuICBwdWJsaWMgX2lkOiBudW1iZXI7XHJcblxyXG4gIC8vIEFsbCBvZiB0aGUgSW5zdGFuY2VzIHRyYWNraW5nIHRoaXMgTm9kZVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgX2luc3RhbmNlczogSW5zdGFuY2VbXTtcclxuXHJcbiAgLy8gQWxsIGRpc3BsYXlzIHdoZXJlIHRoaXMgTm9kZSBpcyB0aGUgcm9vdC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgcHVibGljIHJlYWRvbmx5IF9yb290ZWREaXNwbGF5czogRGlzcGxheVtdO1xyXG5cclxuICAvLyBEcmF3YWJsZSBzdGF0ZXMgdGhhdCBuZWVkIHRvIGJlIHVwZGF0ZWQgb24gbXV0YXRpb25zLiBHZW5lcmFsbHkgYWRkZWQgYnkgU1ZHIGFuZFxyXG4gIC8vIERPTSBlbGVtZW50cyB0aGF0IG5lZWQgdG8gY2xvc2VseSB0cmFjayBzdGF0ZSAocG9zc2libHkgYnkgQ2FudmFzIHRvIG1haW50YWluIGRpcnR5IHN0YXRlKS5cclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICBwdWJsaWMgcmVhZG9ubHkgX2RyYXdhYmxlczogRHJhd2FibGVbXTtcclxuXHJcbiAgLy8gV2hldGhlciB0aGlzIE5vZGUgKGFuZCBpdHMgY2hpbGRyZW4pIHdpbGwgYmUgdmlzaWJsZSB3aGVuIHRoZSBzY2VuZSBpcyB1cGRhdGVkLlxyXG4gIC8vIFZpc2libGUgTm9kZXMgYnkgZGVmYXVsdCB3aWxsIG5vdCBiZSBwaWNrYWJsZSBlaXRoZXIuXHJcbiAgLy8gTk9URTogVGhpcyBpcyBmaXJlZCBzeW5jaHJvbm91c2x5IHdoZW4gdGhlIHZpc2liaWxpdHkgb2YgdGhlIE5vZGUgaXMgdG9nZ2xlZFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgX3Zpc2libGVQcm9wZXJ0eTogVGlueUZvcndhcmRpbmdQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gT3BhY2l0eSwgaW4gdGhlIHJhbmdlIGZyb20gMCAoZnVsbHkgdHJhbnNwYXJlbnQpIHRvIDEgKGZ1bGx5IG9wYXF1ZSkuXHJcbiAgLy8gTk9URTogVGhpcyBpcyBmaXJlZCBzeW5jaHJvbm91c2x5IHdoZW4gdGhlIG9wYWNpdHkgb2YgdGhlIE5vZGUgaXMgdG9nZ2xlZFxyXG4gIHB1YmxpYyByZWFkb25seSBvcGFjaXR5UHJvcGVydHk6IFRpbnlQcm9wZXJ0eTxudW1iZXI+O1xyXG5cclxuICAvLyBEaXNhYmxlZCBvcGFjaXR5LCBpbiB0aGUgcmFuZ2UgZnJvbSAwIChmdWxseSB0cmFuc3BhcmVudCkgdG8gMSAoZnVsbHkgb3BhcXVlKS5cclxuICAvLyBDb21iaW5lZCB3aXRoIHRoZSBub3JtYWwgb3BhY2l0eSBPTkxZIHdoZW4gdGhlIG5vZGUgaXMgZGlzYWJsZWQuXHJcbiAgLy8gTk9URTogVGhpcyBpcyBmaXJlZCBzeW5jaHJvbm91c2x5IHdoZW4gdGhlIG9wYWNpdHkgb2YgdGhlIE5vZGUgaXMgdG9nZ2xlZFxyXG4gIHB1YmxpYyByZWFkb25seSBkaXNhYmxlZE9wYWNpdHlQcm9wZXJ0eTogVGlueVByb3BlcnR5PG51bWJlcj47XHJcblxyXG4gIC8vIFNlZSBzZXRQaWNrYWJsZSgpIGFuZCBzZXRQaWNrYWJsZVByb3BlcnR5KClcclxuICAvLyBOT1RFOiBUaGlzIGlzIGZpcmVkIHN5bmNocm9ub3VzbHkgd2hlbiB0aGUgcGlja2FiaWxpdHkgb2YgdGhlIE5vZGUgaXMgdG9nZ2xlZFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgX3BpY2thYmxlUHJvcGVydHk6IFRpbnlGb3J3YXJkaW5nUHJvcGVydHk8Ym9vbGVhbiB8IG51bGw+O1xyXG5cclxuICAvLyBTZWUgc2V0RW5hYmxlZCgpIGFuZCBzZXRFbmFibGVkUHJvcGVydHkoKVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgX2VuYWJsZWRQcm9wZXJ0eTogVGlueUZvcndhcmRpbmdQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gV2hldGhlciBpbnB1dCBldmVudCBsaXN0ZW5lcnMgb24gdGhpcyBOb2RlIG9yIGRlc2NlbmRhbnRzIG9uIGEgdHJhaWwgd2lsbCBoYXZlXHJcbiAgLy8gaW5wdXQgbGlzdGVuZXJzLiB0cmlnZ2VyZWQuIE5vdGUgdGhhdCB0aGlzIGRvZXMgTk9UIGVmZmVjdCBwaWNraW5nLCBhbmQgb25seSBwcmV2ZW50cyBzb21lIGxpc3RlbmVycyBmcm9tIGJlaW5nXHJcbiAgLy8gZmlyZWQuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBfaW5wdXRFbmFibGVkUHJvcGVydHk6IFRpbnlGb3J3YXJkaW5nUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIFRoaXMgTm9kZSBhbmQgYWxsIGNoaWxkcmVuIHdpbGwgYmUgY2xpcHBlZCBieSB0aGlzIHNoYXBlIChpbiBhZGRpdGlvbiB0byBhbnlcclxuICAvLyBvdGhlciBjbGlwcGluZyBzaGFwZXMpLiBUaGUgc2hhcGUgc2hvdWxkIGJlIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lLlxyXG4gIC8vIE5PVEU6IFRoaXMgaXMgZmlyZWQgc3luY2hyb25vdXNseSB3aGVuIHRoZSBjbGlwQXJlYSBvZiB0aGUgTm9kZSBpcyB0b2dnbGVkXHJcbiAgcHVibGljIHJlYWRvbmx5IGNsaXBBcmVhUHJvcGVydHk6IFRpbnlQcm9wZXJ0eTxTaGFwZSB8IG51bGw+O1xyXG5cclxuICAvLyBXaGV0aGVyIHRoaXMgTm9kZSBhbmQgaXRzIHN1YnRyZWUgY2FuIGFubm91bmNlIGNvbnRlbnQgd2l0aCBWb2ljaW5nIGFuZCBTcGVlY2hTeW50aGVzaXMuIFRob3VnaFxyXG4gIC8vIHJlbGF0ZWQgdG8gVm9pY2luZyBpdCBleGlzdHMgaW4gTm9kZSBiZWNhdXNlIGl0IGlzIHVzZWZ1bCB0byBzZXQgdm9pY2luZ1Zpc2libGUgb24gYSBzdWJ0cmVlIHdoZXJlIHRoZVxyXG4gIC8vIHJvb3QgZG9lcyBub3QgY29tcG9zZSBWb2ljaW5nLiBUaGlzIGlzIG5vdCBpZGVhbCBidXQgdGhlIGVudGlyZXR5IG9mIFZvaWNpbmcgY2Fubm90IGJlIGNvbXBvc2VkIGludG8gZXZlcnlcclxuICAvLyBOb2RlIGJlY2F1c2UgaXQgd291bGQgcHJvZHVjZSBpbmNvcnJlY3QgYmVoYXZpb3JzIGFuZCBoYXZlIGEgbWFzc2l2ZSBtZW1vcnkgZm9vdHByaW50LiBTZWUgc2V0Vm9pY2luZ1Zpc2libGUoKVxyXG4gIC8vIGFuZCBWb2ljaW5nLnRzIGZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IFZvaWNpbmcuXHJcbiAgcHVibGljIHJlYWRvbmx5IHZvaWNpbmdWaXNpYmxlUHJvcGVydHk6IFRpbnlQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gQXJlYXMgZm9yIGhpdCBpbnRlcnNlY3Rpb24uIElmIHNldCBvbiBhIE5vZGUsIG5vIGRlc2NlbmRhbnRzIGNhbiBoYW5kbGUgZXZlbnRzLlxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gIHB1YmxpYyBfbW91c2VBcmVhOiBTaGFwZSB8IEJvdW5kczIgfCBudWxsOyAvLyBmb3IgbW91c2UgcG9zaXRpb24gaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWVcclxuICBwdWJsaWMgX3RvdWNoQXJlYTogU2hhcGUgfCBCb3VuZHMyIHwgbnVsbDsgLy8gZm9yIHRvdWNoIGFuZCBwZW4gcG9zaXRpb24gaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWVcclxuXHJcbiAgLy8gVGhlIENTUyBjdXJzb3IgdG8gYmUgZGlzcGxheWVkIG92ZXIgdGhpcyBOb2RlLiBudWxsIHNob3VsZCBiZSB0aGUgZGVmYXVsdCAoaW5oZXJpdCkgdmFsdWUuXHJcbiAgcHJpdmF0ZSBfY3Vyc29yOiBzdHJpbmcgfCBudWxsO1xyXG5cclxuICAvLyBPcmRlcmVkIGFycmF5IG9mIGNoaWxkIE5vZGVzLlxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gIHB1YmxpYyBfY2hpbGRyZW46IE5vZGVbXTtcclxuXHJcbiAgLy8gVW5vcmRlcmVkIGFycmF5IG9mIHBhcmVudCBOb2Rlcy5cclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICBwdWJsaWMgX3BhcmVudHM6IE5vZGVbXTtcclxuXHJcbiAgLy8gV2hldGhlciB3ZSB3aWxsIGRvIG1vcmUgYWNjdXJhdGUgKGFuZCB0aWdodCkgYm91bmRzIGNvbXB1dGF0aW9ucyBmb3Igcm90YXRpb25zIGFuZCBzaGVhcnMuXHJcbiAgcHJpdmF0ZSBfdHJhbnNmb3JtQm91bmRzOiBib29sZWFuO1xyXG5cclxuICAvLyBTZXQgdXAgdGhlIHRyYW5zZm9ybSByZWZlcmVuY2UuIHdlIGFkZCBhIGxpc3RlbmVyIHNvIHRoYXQgdGhlIHRyYW5zZm9ybSBpdHNlbGYgY2FuIGJlIG1vZGlmaWVkIGRpcmVjdGx5XHJcbiAgLy8gYnkgcmVmZXJlbmNlLCB0cmlnZ2VyaW5nIHRoZSBldmVudCBub3RpZmljYXRpb25zIGZvciBTY2VuZXJ5IFRoZSByZWZlcmVuY2UgdG8gdGhlIFRyYW5zZm9ybTMgd2lsbCBuZXZlciBjaGFuZ2UuXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgcHVibGljIF90cmFuc2Zvcm06IFRyYW5zZm9ybTM7XHJcbiAgcHVibGljIF90cmFuc2Zvcm1MaXN0ZW5lcjogKCkgPT4gdm9pZDtcclxuXHJcbiAgLy8gTWF4aW11bSBkaW1lbnNpb25zIGZvciB0aGUgTm9kZSdzIGxvY2FsIGJvdW5kcyBiZWZvcmUgYSBjb3JyZWN0aXZlIHNjYWxpbmcgZmFjdG9yIGlzIGFwcGxpZWQgdG8gbWFpbnRhaW4gc2l6ZS5cclxuICAvLyBUaGUgbWF4aW11bSBkaW1lbnNpb25zIGFyZSBhbHdheXMgY29tcGFyZWQgdG8gbG9jYWwgYm91bmRzLCBhbmQgYXBwbGllZCBcImJlZm9yZVwiIHRoZSBOb2RlJ3MgdHJhbnNmb3JtLlxyXG4gIC8vIFdoZW5ldmVyIHRoZSBsb2NhbCBib3VuZHMgb3IgbWF4aW11bSBkaW1lbnNpb25zIG9mIHRoaXMgTm9kZSBjaGFuZ2UgYW5kIGl0IGhhcyBhdCBsZWFzdCBvbmUgbWF4aW11bSBkaW1lbnNpb25cclxuICAvLyAod2lkdGggb3IgaGVpZ2h0KSwgYW4gaWRlYWwgc2NhbGUgaXMgY29tcHV0ZWQgKGVpdGhlciB0aGUgc21hbGxlc3Qgc2NhbGUgZm9yIG91ciBsb2NhbCBib3VuZHMgdG8gZml0IHRoZVxyXG4gIC8vIGRpbWVuc2lvbiBjb25zdHJhaW50cywgT1IgMSwgd2hpY2hldmVyIGlzIGxvd2VyKS4gVGhlbiB0aGUgTm9kZSdzIHRyYW5zZm9ybSB3aWxsIGJlIHNjYWxlZCAocHJlcGVuZGVkKSB3aXRoXHJcbiAgLy8gYSBzY2FsZSBhZGp1c3RtZW50IG9mICggaWRlYWxTY2FsZSAvIGFscmVhZHlBcHBsaWVkU2NhbGVGYWN0b3IgKS5cclxuICAvLyBJbiB0aGUgc2ltcGxlIGNhc2Ugd2hlcmUgdGhlIE5vZGUgaXNuJ3Qgb3RoZXJ3aXNlIHRyYW5zZm9ybWVkLCB0aGlzIHdpbGwgYXBwbHkgYW5kIHVwZGF0ZSB0aGUgTm9kZSdzIHNjYWxlIHNvIHRoYXRcclxuICAvLyB0aGUgTm9kZSBtYXRjaGVzIHRoZSBtYXhpbXVtIGRpbWVuc2lvbnMsIHdoaWxlIG5ldmVyIHNjYWxpbmcgb3ZlciAxLiBOb3RlIHRoYXQgbWFudWFsbHkgYXBwbHlpbmcgdHJhbnNmb3JtcyB0b1xyXG4gIC8vIHRoZSBOb2RlIGlzIGZpbmUsIGJ1dCBtYXkgbWFrZSB0aGUgTm9kZSdzIHdpZHRoIGdyZWF0ZXIgdGhhbiB0aGUgbWF4aW11bSB3aWR0aC5cclxuICAvLyBOT1RFOiBJZiBhIGRpbWVuc2lvbiBjb25zdHJhaW50IGlzIG51bGwsIG5vIHJlc2l6aW5nIHdpbGwgb2NjdXIgZHVlIHRvIGl0LiBJZiBib3RoIG1heFdpZHRoIGFuZCBtYXhIZWlnaHQgYXJlIG51bGwsXHJcbiAgLy8gbm8gc2NhbGUgYWRqdXN0bWVudCB3aWxsIGJlIGFwcGxpZWQuXHJcbiAgLy9cclxuICAvLyBBbHNvIG5vdGUgdGhhdCBzZXR0aW5nIG1heFdpZHRoL21heEhlaWdodCBpcyBsaWtlIGFkZGluZyBhIGxvY2FsIGJvdW5kcyBsaXN0ZW5lciAod2lsbCB0cmlnZ2VyIHZhbGlkYXRpb24gb2ZcclxuICAvLyBib3VuZHMgZHVyaW5nIHRoZSB1cGRhdGVEaXNwbGF5IHN0ZXApLiBOT1RFOiB0aGlzIG1lYW5zIHVwZGF0ZXMgdG8gdGhlIHRyYW5zZm9ybSAob24gYSBsb2NhbCBib3VuZHMgY2hhbmdlKSB3aWxsXHJcbiAgLy8gaGFwcGVuIHdoZW4gYm91bmRzIGFyZSB2YWxpZGF0ZWQgKHZhbGlkYXRlQm91bmRzKCkpLCB3aGljaCBkb2VzIG5vdCBoYXBwZW4gc3luY2hyb25vdXNseSBvbiBhIGNoaWxkJ3Mgc2l6ZVxyXG4gIC8vIGNoYW5nZS4gSXQgZG9lcyBoYXBwZW4gYXQgbGVhc3Qgb25jZSBpbiB1cGRhdGVEaXNwbGF5KCkgYmVmb3JlIHJlbmRlcmluZywgYW5kIGNhbGxpbmcgdmFsaWRhdGVCb3VuZHMoKSBjYW4gZm9yY2VcclxuICAvLyBhIHJlLWNoZWNrIGFuZCB0cmFuc2Zvcm0uXHJcbiAgcHJpdmF0ZSBfbWF4V2lkdGg6IG51bWJlciB8IG51bGw7XHJcbiAgcHJpdmF0ZSBfbWF4SGVpZ2h0OiBudW1iZXIgfCBudWxsO1xyXG5cclxuICAvLyBTY2FsZSBhcHBsaWVkIGR1ZSB0byB0aGUgbWF4aW11bSBkaW1lbnNpb24gY29uc3RyYWludHMuXHJcbiAgcHJpdmF0ZSBfYXBwbGllZFNjYWxlRmFjdG9yOiBudW1iZXI7XHJcblxyXG4gIC8vIEZvciB1c2VyIGlucHV0IGhhbmRsaW5nIChtb3VzZS90b3VjaCkuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gIHB1YmxpYyBfaW5wdXRMaXN0ZW5lcnM6IFRJbnB1dExpc3RlbmVyW107XHJcblxyXG4gIC8vIFttdXRhYmxlXSBCb3VuZHMgZm9yIHRoaXMgTm9kZSBhbmQgaXRzIGNoaWxkcmVuIGluIHRoZSBcInBhcmVudFwiIGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAgLy8gTk9URTogVGhlIHJlZmVyZW5jZSBoZXJlIHdpbGwgbm90IGNoYW5nZSwgd2Ugd2lsbCBqdXN0IG5vdGlmeSB1c2luZyB0aGUgZXF1aXZhbGVudCBzdGF0aWMgbm90aWZpY2F0aW9uIG1ldGhvZC5cclxuICAvLyBOT1RFOiBUaGlzIGlzIGZpcmVkICoqYXN5bmNocm9ub3VzbHkqKiAodXN1YWxseSBhcyBwYXJ0IG9mIGEgRGlzcGxheS51cGRhdGVEaXNwbGF5KCkpIHdoZW4gdGhlIGJvdW5kcyBvZiB0aGUgTm9kZVxyXG4gIC8vIGlzIGNoYW5nZWQuXHJcbiAgcHVibGljIHJlYWRvbmx5IGJvdW5kc1Byb3BlcnR5OiBUaW55U3RhdGljUHJvcGVydHk8Qm91bmRzMj47XHJcblxyXG4gIC8vIFttdXRhYmxlXSBCb3VuZHMgZm9yIHRoaXMgTm9kZSBhbmQgaXRzIGNoaWxkcmVuIGluIHRoZSBcImxvY2FsXCIgY29vcmRpbmF0ZSBmcmFtZS5cclxuICAvLyBOT1RFOiBUaGUgcmVmZXJlbmNlIGhlcmUgd2lsbCBub3QgY2hhbmdlLCB3ZSB3aWxsIGp1c3Qgbm90aWZ5IHVzaW5nIHRoZSBlcXVpdmFsZW50IHN0YXRpYyBub3RpZmljYXRpb24gbWV0aG9kLlxyXG4gIC8vIE5PVEU6IFRoaXMgaXMgZmlyZWQgKiphc3luY2hyb25vdXNseSoqICh1c3VhbGx5IGFzIHBhcnQgb2YgYSBEaXNwbGF5LnVwZGF0ZURpc3BsYXkoKSkgd2hlbiB0aGUgbG9jYWxCb3VuZHMgb2ZcclxuICAvLyB0aGUgTm9kZSBpcyBjaGFuZ2VkLlxyXG4gIHB1YmxpYyByZWFkb25seSBsb2NhbEJvdW5kc1Byb3BlcnR5OiBUaW55U3RhdGljUHJvcGVydHk8Qm91bmRzMj47XHJcblxyXG4gIC8vIFttdXRhYmxlXSBCb3VuZHMganVzdCBmb3IgY2hpbGRyZW4gb2YgdGhpcyBOb2RlIChhbmQgc3ViLXRyZWVzKSwgaW4gdGhlIFwibG9jYWxcIiBjb29yZGluYXRlIGZyYW1lLlxyXG4gIC8vIE5PVEU6IFRoZSByZWZlcmVuY2UgaGVyZSB3aWxsIG5vdCBjaGFuZ2UsIHdlIHdpbGwganVzdCBub3RpZnkgdXNpbmcgdGhlIGVxdWl2YWxlbnQgc3RhdGljIG5vdGlmaWNhdGlvbiBtZXRob2QuXHJcbiAgLy8gTk9URTogVGhpcyBpcyBmaXJlZCAqKmFzeW5jaHJvbm91c2x5KiogKHVzdWFsbHkgYXMgcGFydCBvZiBhIERpc3BsYXkudXBkYXRlRGlzcGxheSgpKSB3aGVuIHRoZSBjaGlsZEJvdW5kcyBvZiB0aGVcclxuICAvLyBOb2RlIGlzIGNoYW5nZWQuXHJcbiAgcHVibGljIHJlYWRvbmx5IGNoaWxkQm91bmRzUHJvcGVydHk6IFRpbnlTdGF0aWNQcm9wZXJ0eTxCb3VuZHMyPjtcclxuXHJcbiAgLy8gW211dGFibGVdIEJvdW5kcyBqdXN0IGZvciB0aGlzIE5vZGUsIGluIHRoZSBcImxvY2FsXCIgY29vcmRpbmF0ZSBmcmFtZS5cclxuICAvLyBOT1RFOiBUaGUgcmVmZXJlbmNlIGhlcmUgd2lsbCBub3QgY2hhbmdlLCB3ZSB3aWxsIGp1c3Qgbm90aWZ5IHVzaW5nIHRoZSBlcXVpdmFsZW50IHN0YXRpYyBub3RpZmljYXRpb24gbWV0aG9kLlxyXG4gIC8vIE5PVEU6IFRoaXMgZXZlbnQgY2FuIGJlIGZpcmVkIHN5bmNocm9ub3VzbHksIGFuZCBoYXBwZW5zIHdpdGggdGhlIHNlbGYtYm91bmRzIG9mIGEgTm9kZSBpcyBjaGFuZ2VkLiBUaGlzIGlzIE5PVFxyXG4gIC8vIGxpa2UgdGhlIG90aGVyIGJvdW5kcyBQcm9wZXJ0aWVzLCB3aGljaCB1c3VhbGx5IGZpcmUgYXN5bmNocm9ub3VzbHlcclxuICBwdWJsaWMgcmVhZG9ubHkgc2VsZkJvdW5kc1Byb3BlcnR5OiBUaW55U3RhdGljUHJvcGVydHk8Qm91bmRzMj47XHJcblxyXG4gIC8vIFdoZXRoZXIgb3VyIGxvY2FsQm91bmRzIGhhdmUgYmVlbiBzZXQgKHdpdGggdGhlIEVTNSBzZXR0ZXIvc2V0TG9jYWxCb3VuZHMoKSkgdG8gYSBjdXN0b21cclxuICAvLyBvdmVycmlkZGVuIHZhbHVlLiBJZiB0cnVlLCB0aGVuIGxvY2FsQm91bmRzIGl0c2VsZiB3aWxsIG5vdCBiZSB1cGRhdGVkLCBidXQgd2lsbCBpbnN0ZWFkIGFsd2F5cyBiZSB0aGVcclxuICAvLyBvdmVycmlkZGVuIHZhbHVlLlxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gIHB1YmxpYyBfbG9jYWxCb3VuZHNPdmVycmlkZGVuOiBib29sZWFuO1xyXG5cclxuICAvLyBbbXV0YWJsZV0gV2hldGhlciBpbnZpc2libGUgY2hpbGRyZW4gd2lsbCBiZSBleGNsdWRlZCBmcm9tIHRoaXMgTm9kZSdzIGJvdW5kc1xyXG4gIHByaXZhdGUgX2V4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM6IGJvb2xlYW47XHJcblxyXG4gIC8vIE9wdGlvbnMgdGhhdCBjYW4gYmUgcHJvdmlkZWQgdG8gbGF5b3V0IG1hbmFnZXJzIHRvIGFkanVzdCBwb3NpdGlvbmluZyBmb3IgdGhpcyBub2RlLlxyXG4gIHByaXZhdGUgX2xheW91dE9wdGlvbnM6IFRMYXlvdXRPcHRpb25zIHwgbnVsbDtcclxuXHJcbiAgLy8gV2hldGhlciBib3VuZHMgbmVlZHMgdG8gYmUgcmVjb21wdXRlZCB0byBiZSB2YWxpZC5cclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICBwdWJsaWMgX2JvdW5kc0RpcnR5OiBib29sZWFuO1xyXG5cclxuICAvLyBXaGV0aGVyIGxvY2FsQm91bmRzIG5lZWRzIHRvIGJlIHJlY29tcHV0ZWQgdG8gYmUgdmFsaWQuXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgcHVibGljIF9sb2NhbEJvdW5kc0RpcnR5OiBib29sZWFuO1xyXG5cclxuICAvLyBXaGV0aGVyIHNlbGZCb3VuZHMgbmVlZHMgdG8gYmUgcmVjb21wdXRlZCB0byBiZSB2YWxpZC5cclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICBwdWJsaWMgX3NlbGZCb3VuZHNEaXJ0eTogYm9vbGVhbjtcclxuXHJcbiAgLy8gV2hldGhlciBjaGlsZEJvdW5kcyBuZWVkcyB0byBiZSByZWNvbXB1dGVkIHRvIGJlIHZhbGlkLlxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gIHB1YmxpYyBfY2hpbGRCb3VuZHNEaXJ0eTogYm9vbGVhbjtcclxuXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgcHVibGljIF9maWx0ZXJzOiBGaWx0ZXJbXTtcclxuXHJcbiAgcHJpdmF0ZSBfb3JpZ2luYWxCb3VuZHM/OiBCb3VuZHMyOyAvLyBJZiBhc3NlcnRpb25zIGFyZSBlbmFibGVkXHJcbiAgcHJpdmF0ZSBfb3JpZ2luYWxMb2NhbEJvdW5kcz86IEJvdW5kczI7IC8vIElmIGFzc2VydGlvbnMgYXJlIGVuYWJsZWRcclxuICBwcml2YXRlIF9vcmlnaW5hbFNlbGZCb3VuZHM/OiBCb3VuZHMyOyAvLyBJZiBhc3NlcnRpb25zIGFyZSBlbmFibGVkXHJcbiAgcHJpdmF0ZSBfb3JpZ2luYWxDaGlsZEJvdW5kcz86IEJvdW5kczI7IC8vIElmIGFzc2VydGlvbnMgYXJlIGVuYWJsZWRcclxuXHJcbiAgLy8gV2hlcmUgcmVuZGVyaW5nLXNwZWNpZmljIHNldHRpbmdzIGFyZSBzdG9yZWQuIFRoZXkgYXJlIGdlbmVyYWxseSBtb2RpZmllZCBpbnRlcm5hbGx5LCBzbyB0aGVyZSBpcyBubyBFUzUgc2V0dGVyXHJcbiAgLy8gZm9yIGhpbnRzLlxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gIHB1YmxpYyBfaGludHM6IHtcclxuICAgIC8vIFdoYXQgdHlwZSBvZiByZW5kZXJlciBzaG91bGQgYmUgZm9yY2VkIGZvciB0aGlzIE5vZGUuIFVzZXMgdGhlIGludGVybmFsIGJpdG1hc2sgc3RydWN0dXJlIGRlY2xhcmVkIGluXHJcbiAgICAvLyBzY2VuZXJ5LmpzIGFuZCBSZW5kZXJlci5qcy5cclxuICAgIHJlbmRlcmVyOiBudW1iZXI7XHJcblxyXG4gICAgLy8gV2hldGhlciBpdCBpcyBhbnRpY2lwYXRlZCB0aGF0IG9wYWNpdHkgd2lsbCBiZSBzd2l0Y2hlZCBvbi4gSWYgc28sIGhhdmluZyB0aGlzIHNldCB0byB0cnVlIHdpbGwgbWFrZSBzd2l0Y2hpbmdcclxuICAgIC8vIGJhY2stYW5kLWZvcnRoIGJldHdlZW4gb3BhY2l0eToxIGFuZCBvdGhlciBvcGFjaXRpZXMgbXVjaCBmYXN0ZXIuXHJcbiAgICB1c2VzT3BhY2l0eTogYm9vbGVhbjtcclxuXHJcbiAgICAvLyBXaGV0aGVyIGxheWVycyBzaG91bGQgYmUgc3BsaXQgYmVmb3JlIGFuZCBhZnRlciB0aGlzIE5vZGUuXHJcbiAgICBsYXllclNwbGl0OiBib29sZWFuO1xyXG5cclxuICAgIC8vIFdoZXRoZXIgdGhpcyBOb2RlIGFuZCBpdHMgc3VidHJlZSBzaG91bGQgaGFuZGxlIHRyYW5zZm9ybXMgYnkgdXNpbmcgYSBDU1MgdHJhbnNmb3JtIG9mIGEgZGl2LlxyXG4gICAgY3NzVHJhbnNmb3JtOiBib29sZWFuO1xyXG5cclxuICAgIC8vIFdoZW4gcmVuZGVyZWQgYXMgQ2FudmFzLCB3aGV0aGVyIHdlIHNob3VsZCB1c2UgZnVsbCAoZGV2aWNlKSByZXNvbHV0aW9uIG9uIHJldGluYS1saWtlIGRldmljZXMuXHJcbiAgICAvLyBUT0RPOiBlbnN1cmUgdGhhdCB0aGlzIGlzIHdvcmtpbmc/IDAuMiBtYXkgaGF2ZSBjYXVzZWQgYSByZWdyZXNzaW9uLlxyXG4gICAgZnVsbFJlc29sdXRpb246IGJvb2xlYW47XHJcblxyXG4gICAgLy8gV2hldGhlciBTVkcgKG9yIG90aGVyKSBjb250ZW50IHNob3VsZCBiZSBleGNsdWRlZCBmcm9tIHRoZSBET00gdHJlZSB3aGVuIGludmlzaWJsZSAoaW5zdGVhZCBvZiBqdXN0IGJlaW5nIGhpZGRlbilcclxuICAgIGV4Y2x1ZGVJbnZpc2libGU6IGJvb2xlYW47XHJcblxyXG4gICAgLy8gSWYgbm9uLW51bGwsIGEgbXVsdGlwbGllciB0byB0aGUgZGV0ZWN0ZWQgcGl4ZWwtdG8tcGl4ZWwgc2NhbGluZyBvZiB0aGUgV2ViR0wgQ2FudmFzXHJcbiAgICB3ZWJnbFNjYWxlOiBudW1iZXIgfCBudWxsO1xyXG5cclxuICAgIC8vIElmIHRydWUsIFNjZW5lcnkgd2lsbCBub3QgZml0IGFueSBibG9ja3MgdGhhdCBjb250YWluIGRyYXdhYmxlcyBhdHRhY2hlZCB0byBOb2RlcyB1bmRlcm5lYXRoIHRoaXMgTm9kZSdzIHN1YnRyZWUuXHJcbiAgICAvLyBUaGlzIHdpbGwgdHlwaWNhbGx5IHByZXZlbnQgU2NlbmVyeSBmcm9tIHRyaWdnZXJpbmcgYm91bmRzIGNvbXB1dGF0aW9uIGZvciB0aGlzIHN1Yi10cmVlLCBhbmQgbW92ZW1lbnQgb2YgdGhpc1xyXG4gICAgLy8gTm9kZSBvciBpdHMgZGVzY2VuZGFudHMgd2lsbCBuZXZlciB0cmlnZ2VyIHRoZSByZWZpdHRpbmcgb2YgYSBibG9jay5cclxuICAgIHByZXZlbnRGaXQ6IGJvb2xlYW47XHJcbiAgfTtcclxuXHJcbiAgLy8gVGhpcyBpcyBmaXJlZCBvbmx5IG9uY2UgZm9yIGFueSBzaW5nbGUgb3BlcmF0aW9uIHRoYXQgbWF5IGNoYW5nZSB0aGUgY2hpbGRyZW4gb2YgYSBOb2RlLlxyXG4gIC8vIEZvciBleGFtcGxlLCBpZiBhIE5vZGUncyBjaGlsZHJlbiBhcmUgWyBhLCBiIF0gYW5kIHNldENoaWxkcmVuKCBbIGEsIHgsIHksIHogXSApIGlzIGNhbGxlZCBvbiBpdCwgdGhlXHJcbiAgLy8gY2hpbGRyZW5DaGFuZ2VkIGV2ZW50IHdpbGwgb25seSBiZSBmaXJlZCBvbmNlIGFmdGVyIHRoZSBlbnRpcmUgb3BlcmF0aW9uIG9mIGNoYW5naW5nIHRoZSBjaGlsZHJlbiBpcyBjb21wbGV0ZWQuXHJcbiAgcHVibGljIHJlYWRvbmx5IGNoaWxkcmVuQ2hhbmdlZEVtaXR0ZXI6IFRFbWl0dGVyO1xyXG5cclxuICAvLyBGb3IgZXZlcnkgc2luZ2xlIGFkZGVkIGNoaWxkIE5vZGUsIGVtaXRzIHdpdGgge05vZGV9IE5vZGUsIHtudW1iZXJ9IGluZGV4T2ZDaGlsZFxyXG4gIHB1YmxpYyByZWFkb25seSBjaGlsZEluc2VydGVkRW1pdHRlcjogVEVtaXR0ZXI8WyBub2RlOiBOb2RlLCBpbmRleE9mQ2hpbGQ6IG51bWJlciBdPjtcclxuXHJcbiAgLy8gRm9yIGV2ZXJ5IHNpbmdsZSByZW1vdmVkIGNoaWxkIE5vZGUsIGVtaXRzIHdpdGgge05vZGV9IE5vZGUsIHtudW1iZXJ9IGluZGV4T2ZDaGlsZFxyXG4gIHB1YmxpYyByZWFkb25seSBjaGlsZFJlbW92ZWRFbWl0dGVyOiBURW1pdHRlcjxbIG5vZGU6IE5vZGUsIGluZGV4T2ZDaGlsZDogbnVtYmVyIF0+O1xyXG5cclxuICAvLyBQcm92aWRlcyBhIGdpdmVuIHJhbmdlIHRoYXQgbWF5IGJlIGFmZmVjdGVkIGJ5IHRoZSByZW9yZGVyaW5nXHJcbiAgcHVibGljIHJlYWRvbmx5IGNoaWxkcmVuUmVvcmRlcmVkRW1pdHRlcjogVEVtaXR0ZXI8WyBtaW5DaGFuZ2VkSW5kZXg6IG51bWJlciwgbWF4Q2hhbmdlZEluZGV4OiBudW1iZXIgXT47XHJcblxyXG4gIC8vIEZpcmVkIHdoZW5ldmVyIGEgcGFyZW50IGlzIGFkZGVkXHJcbiAgcHVibGljIHJlYWRvbmx5IHBhcmVudEFkZGVkRW1pdHRlcjogVEVtaXR0ZXI8WyBub2RlOiBOb2RlIF0+ID0gbmV3IFRpbnlFbWl0dGVyKCk7XHJcblxyXG4gIC8vIEZpcmVkIHdoZW5ldmVyIGEgcGFyZW50IGlzIHJlbW92ZWRcclxuICBwdWJsaWMgcmVhZG9ubHkgcGFyZW50UmVtb3ZlZEVtaXR0ZXI6IFRFbWl0dGVyPFsgbm9kZTogTm9kZSBdPiA9IG5ldyBUaW55RW1pdHRlcigpO1xyXG5cclxuICAvLyBGaXJlZCBzeW5jaHJvbm91c2x5IHdoZW4gdGhlIHRyYW5zZm9ybSAodHJhbnNmb3JtYXRpb24gbWF0cml4KSBvZiBhIE5vZGUgaXMgY2hhbmdlZC4gQW55XHJcbiAgLy8gY2hhbmdlIHRvIGEgTm9kZSdzIHRyYW5zbGF0aW9uL3JvdGF0aW9uL3NjYWxlL2V0Yy4gd2lsbCB0cmlnZ2VyIHRoaXMgZXZlbnQuXHJcbiAgcHVibGljIHJlYWRvbmx5IHRyYW5zZm9ybUVtaXR0ZXI6IFRFbWl0dGVyO1xyXG5cclxuICAvLyBTaG91bGQgYmUgZW1pdHRlZCB3aGVuIHdlIG5lZWQgdG8gY2hlY2sgZnVsbCBtZXRhZGF0YSB1cGRhdGVzIGRpcmVjdGx5IG9uIEluc3RhbmNlcyxcclxuICAvLyB0byBzZWUgaWYgd2UgbmVlZCB0byBjaGFuZ2UgZHJhd2FibGUgdHlwZXMsIGV0Yy5cclxuICBwdWJsaWMgcmVhZG9ubHkgaW5zdGFuY2VSZWZyZXNoRW1pdHRlcjogVEVtaXR0ZXI7XHJcblxyXG4gIC8vIEVtaXR0ZWQgdG8gd2hlbiB3ZSBuZWVkIHRvIHBvdGVudGlhbGx5IHJlY29tcHV0ZSBvdXIgcmVuZGVyZXIgc3VtbWFyeSAoYml0bWFzayBmbGFncywgb3JcclxuICAvLyB0aGluZ3MgdGhhdCBjb3VsZCBhZmZlY3QgZGVzY2VuZGFudHMpXHJcbiAgcHVibGljIHJlYWRvbmx5IHJlbmRlcmVyU3VtbWFyeVJlZnJlc2hFbWl0dGVyOiBURW1pdHRlcjtcclxuXHJcbiAgLy8gRW1pdHRlZCB0byB3aGVuIHdlIGNoYW5nZSBmaWx0ZXJzIChlaXRoZXIgb3BhY2l0eSBvciBnZW5lcmFsaXplZCBmaWx0ZXJzKVxyXG4gIHB1YmxpYyByZWFkb25seSBmaWx0ZXJDaGFuZ2VFbWl0dGVyOiBURW1pdHRlcjtcclxuXHJcbiAgLy8gRmlyZWQgd2hlbiBhbiBpbnN0YW5jZSBpcyBjaGFuZ2VkIChhZGRlZC9yZW1vdmVkKVxyXG4gIHB1YmxpYyByZWFkb25seSBjaGFuZ2VkSW5zdGFuY2VFbWl0dGVyOiBURW1pdHRlcjxbIGluc3RhbmNlOiBJbnN0YW5jZSwgYWRkZWQ6IGJvb2xlYW4gXT47XHJcblxyXG4gIC8vIEZpcmVkIHdoZW4gbGF5b3V0T3B0aW9ucyBjaGFuZ2VzXHJcbiAgcHVibGljIHJlYWRvbmx5IGxheW91dE9wdGlvbnNDaGFuZ2VkRW1pdHRlcjogVEVtaXR0ZXI7XHJcblxyXG4gIC8vIEEgYml0bWFzayB3aGljaCBzcGVjaWZpZXMgd2hpY2ggcmVuZGVyZXJzIHRoaXMgTm9kZSAoYW5kIG9ubHkgdGhpcyBOb2RlLCBub3QgaXRzIHN1YnRyZWUpIHN1cHBvcnRzLlxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gIHB1YmxpYyBfcmVuZGVyZXJCaXRtYXNrOiBudW1iZXI7XHJcblxyXG4gIC8vIEEgYml0bWFzay1saWtlIHN1bW1hcnkgb2Ygd2hhdCByZW5kZXJlcnMgYW5kIG9wdGlvbnMgYXJlIHN1cHBvcnRlZCBieSB0aGlzIE5vZGUgYW5kIGFsbCBvZiBpdHMgZGVzY2VuZGFudHNcclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICBwdWJsaWMgX3JlbmRlcmVyU3VtbWFyeTogUmVuZGVyZXJTdW1tYXJ5O1xyXG5cclxuICAvLyBTbyB3ZSBjYW4gdHJhdmVyc2Ugb25seSB0aGUgc3VidHJlZXMgdGhhdCByZXF1aXJlIGJvdW5kcyB2YWxpZGF0aW9uIGZvciBldmVudHMgZmlyaW5nLlxyXG4gIC8vIFRoaXMgaXMgYSBzdW0gb2YgdGhlIG51bWJlciBvZiBldmVudHMgcmVxdWlyaW5nIGJvdW5kcyB2YWxpZGF0aW9uIG9uIHRoaXMgTm9kZSwgcGx1cyB0aGUgbnVtYmVyIG9mIGNoaWxkcmVuIHdob3NlXHJcbiAgLy8gY291bnQgaXMgbm9uLXplcm8uXHJcbiAgLy8gTk9URTogdGhpcyBtZWFucyB0aGF0IGlmIEEgaGFzIGEgY2hpbGQgQiwgYW5kIEIgaGFzIGEgYm91bmRzRXZlbnRDb3VudCBvZiA1LCBpdCBvbmx5IGNvbnRyaWJ1dGVzIDEgdG8gQSdzIGNvdW50LlxyXG4gIC8vIFRoaXMgYWxsb3dzIHVzIHRvIGhhdmUgY2hhbmdlcyBsb2NhbGl6ZWQgKGluY3JlYXNpbmcgQidzIGNvdW50IHdvbid0IGNoYW5nZSBBIG9yIGFueSBvZiBBJ3MgYW5jZXN0b3JzKSwgYW5kXHJcbiAgLy8gZ3VhcmFudGVlcyB0aGF0IHdlIHdpbGwga25vdyB3aGV0aGVyIGEgc3VidHJlZSBoYXMgYm91bmRzIGxpc3RlbmVycy4gQWxzbyBpbXBvcnRhbnQ6IGRlY3JlYXNpbmcgQidzXHJcbiAgLy8gYm91bmRzRXZlbnRDb3VudCBkb3duIHRvIDAgd2lsbCBhbGxvdyBBIHRvIGRlY3JlYXNlIGl0cyBjb3VudCBieSAxLCB3aXRob3V0IGhhdmluZyB0byBjaGVjayBpdHMgb3RoZXIgY2hpbGRyZW5cclxuICAvLyAoaWYgd2Ugd2VyZSBqdXN0IHVzaW5nIGEgYm9vbGVhbiB2YWx1ZSwgdGhpcyBvcGVyYXRpb24gd291bGQgcmVxdWlyZSBBIHRvIGNoZWNrIGlmIGFueSBPVEhFUiBjaGlsZHJlbiBiZXNpZGVzXHJcbiAgLy8gQiBoYWQgYm91bmRzIGxpc3RlbmVycylcclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICBwdWJsaWMgX2JvdW5kc0V2ZW50Q291bnQ6IG51bWJlcjtcclxuXHJcbiAgLy8gVGhpcyBzaWduYWxzIHRoYXQgd2UgY2FuIHZhbGlkYXRlQm91bmRzKCkgb24gdGhpcyBzdWJ0cmVlIGFuZCB3ZSBkb24ndCBoYXZlIHRvIHRyYXZlcnNlIGZ1cnRoZXJcclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICBwdWJsaWMgX2JvdW5kc0V2ZW50U2VsZkNvdW50OiBudW1iZXI7XHJcblxyXG4gIC8vIFN1YmNvbXBvbmVudCBkZWRpY2F0ZWQgdG8gaGl0IHRlc3RpbmdcclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICBwdWJsaWMgX3BpY2tlcjogUGlja2VyO1xyXG5cclxuICAvLyBUaGVyZSBhcmUgY2VydGFpbiBzcGVjaWZpYyBjYXNlcyAoaW4gdGhpcyBjYXNlIGR1ZSB0byBhMTF5KSB3aGVyZSB3ZSBuZWVkXHJcbiAgLy8gdG8ga25vdyB0aGF0IGEgTm9kZSBpcyBnZXR0aW5nIHJlbW92ZWQgZnJvbSBpdHMgcGFyZW50IEJVVCB0aGF0IHByb2Nlc3MgaGFzIG5vdCBjb21wbGV0ZWQgeWV0LiBJdCB3b3VsZCBiZSBpZGVhbFxyXG4gIC8vIHRvIG5vdCBuZWVkIHRoaXMuXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgcHVibGljIF9pc0dldHRpbmdSZW1vdmVkRnJvbVBhcmVudDogYm9vbGVhbjtcclxuXHJcbiAgLy8ge09iamVjdH0gLSBBIG1hcHBpbmcgb2YgYWxsIG9mIG9wdGlvbnMgdGhhdCByZXF1aXJlIEJvdW5kcyB0byBiZSBhcHBsaWVkIHByb3Blcmx5LiBNb3N0IG9mdGVuIHRoZXNlIHNob3VsZCBiZSBzZXQgdGhyb3VnaCBgbXV0YXRlYCBpbiB0aGUgZW5kIG9mIHRoZSBjb25zdHJ1Y29yIGluc3RlYWQgb2YgYmVpbmcgcGFzc2VkIHRocm91Z2ggYHN1cGVyKClgXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBSRVFVSVJFU19CT1VORFNfT1BUSU9OX0tFWVMgPSBSRVFVSVJFU19CT1VORFNfT1BUSU9OX0tFWVM7XHJcblxyXG4gIC8vIFVzZWQgYnkgc2NlbmVyeURlc2VyaWFsaXplXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgcHVibGljIF9zZXJpYWxpemF0aW9uPzogSW50ZW50aW9uYWxBbnk7XHJcblxyXG4gIC8vIFRyYWNrcyBhbnkgbGF5b3V0IGNvbnN0cmFpbnQsIHNvIHRoYXQgd2UgY2FuIGF2b2lkIGhhdmluZyBtdWx0aXBsZSBsYXlvdXQgY29uc3RyYWludHMgb24gdGhlIHNhbWUgbm9kZVxyXG4gIC8vIChhbmQgYXZvaWQgdGhlIGluZmluaXRlIGxvb3BzIHRoYXQgY2FuIGhhcHBlbiBpZiB0aGF0IGlzIHRyaWdnZXJlZCkuXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgcHVibGljIF9hY3RpdmVQYXJlbnRMYXlvdXRDb25zdHJhaW50OiBMYXlvdXRDb25zdHJhaW50IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8vIFRoaXMgaXMgYW4gYXJyYXkgb2YgcHJvcGVydHkgKHNldHRlcikgbmFtZXMgZm9yIE5vZGUubXV0YXRlKCksIHdoaWNoIGFyZSBhbHNvIHVzZWQgd2hlbiBjcmVhdGluZ1xyXG4gIC8vIE5vZGVzIHdpdGggcGFyYW1ldGVyIG9iamVjdHMuXHJcbiAgLy9cclxuICAvLyBFLmcuIG5ldyBwaGV0LnNjZW5lcnkuTm9kZSggeyB4OiA1LCByb3RhdGlvbjogMjAgfSApIHdpbGwgY3JlYXRlIGEgUGF0aCwgYW5kIGFwcGx5IHNldHRlcnMgaW4gdGhlIG9yZGVyIGJlbG93XHJcbiAgLy8gKG5vZGUueCA9IDU7IG5vZGUucm90YXRpb24gPSAyMClcclxuICAvL1xyXG4gIC8vIFNvbWUgc3BlY2lhbCBjYXNlcyBleGlzdCAoZm9yIGZ1bmN0aW9uIG5hbWVzKS4gbmV3IHBoZXQuc2NlbmVyeS5Ob2RlKCB7IHNjYWxlOiAyIH0gKSB3aWxsIGFjdHVhbGx5IGNhbGxcclxuICAvLyBub2RlLnNjYWxlKCAyICkuXHJcbiAgLy9cclxuICAvLyBUaGUgb3JkZXIgYmVsb3cgaXMgaW1wb3J0YW50ISBEb24ndCBjaGFuZ2UgdGhpcyB3aXRob3V0IGtub3dpbmcgdGhlIGltcGxpY2F0aW9ucy5cclxuICAvL1xyXG4gIC8vIE5PVEU6IFRyYW5zbGF0aW9uLWJhc2VkIG11dGF0b3JzIGNvbWUgYmVmb3JlIHJvdGF0aW9uL3NjYWxlLCBzaW5jZSB0eXBpY2FsbHkgd2UgdGhpbmsgb2YgdGhlaXIgb3BlcmF0aW9uc1xyXG4gIC8vICAgICAgIG9jY3VycmluZyBcImFmdGVyXCIgdGhlIHJvdGF0aW9uIC8gc2NhbGluZ1xyXG4gIC8vIE5PVEU6IGxlZnQvcmlnaHQvdG9wL2JvdHRvbS9jZW50ZXJYL2NlbnRlclkgYXJlIGF0IHRoZSBlbmQsIHNpbmNlIHRoZXkgcmVseSBwb3RlbnRpYWxseSBvbiByb3RhdGlvbiAvIHNjYWxpbmdcclxuICAvLyAgICAgICBjaGFuZ2VzIG9mIGJvdW5kcyB0aGF0IG1heSBoYXBwZW4gYmVmb3JlaGFuZFxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gIHB1YmxpYyBfbXV0YXRvcktleXMhOiBzdHJpbmdbXTtcclxuXHJcbiAgLy8gTGlzdCBvZiBhbGwgZGlydHkgZmxhZ3MgdGhhdCBzaG91bGQgYmUgYXZhaWxhYmxlIG9uIGRyYXdhYmxlcyBjcmVhdGVkIGZyb20gdGhpcyBOb2RlIChvclxyXG4gIC8vIHN1YnR5cGUpLiBHaXZlbiBhIGZsYWcgKGUuZy4gcmFkaXVzKSwgaXQgaW5kaWNhdGVzIHRoZSBleGlzdGVuY2Ugb2YgYSBmdW5jdGlvblxyXG4gIC8vIGRyYXdhYmxlLm1hcmtEaXJ0eVJhZGl1cygpIHRoYXQgd2lsbCBpbmRpY2F0ZSB0byB0aGUgZHJhd2FibGUgdGhhdCB0aGUgcmFkaXVzIGhhcyBjaGFuZ2VkLlxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gIC8vXHJcbiAgLy8gU2hvdWxkIGJlIG92ZXJyaWRkZW4gYnkgc3VidHlwZXMuXHJcbiAgcHVibGljIGRyYXdhYmxlTWFya0ZsYWdzITogc3RyaW5nW107XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBOb2RlIHdpdGggb3B0aW9ucy5cclxuICAgKlxyXG4gICAqIE5PVEU6IERpcmVjdGx5IGNyZWF0ZWQgTm9kZXMgKG5vdCBvZiBhbnkgc3VidHlwZSwgYnV0IGNyZWF0ZWQgd2l0aCBcIm5ldyBOb2RlKCAuLi4gKVwiKSBhcmUgZ2VuZXJhbGx5IHVzZWQgYXNcclxuICAgKiAgICAgICBjb250YWluZXJzLCB3aGljaCBjYW4gaG9sZCBvdGhlciBOb2Rlcywgc3VidHlwZXMgb2YgTm9kZSB0aGF0IGNhbiBkaXNwbGF5IHRoaW5ncy5cclxuICAgKlxyXG4gICAqIE5vZGUgYW5kIGl0cyBzdWJ0eXBlcyBnZW5lcmFsbHkgaGF2ZSB0aGUgbGFzdCBjb25zdHJ1Y3RvciBwYXJhbWV0ZXIgcmVzZXJ2ZWQgZm9yIHRoZSAnb3B0aW9ucycgb2JqZWN0LiBUaGlzIGlzIGFcclxuICAgKiBrZXktdmFsdWUgbWFwIHRoYXQgc3BlY2lmaWVzIHJlbGV2YW50IG9wdGlvbnMgdGhhdCBhcmUgdXNlZCBieSBOb2RlIGFuZCBzdWJ0eXBlcy5cclxuICAgKlxyXG4gICAqIEZvciBleGFtcGxlLCBvbmUgb2YgTm9kZSdzIG9wdGlvbnMgaXMgYm90dG9tLCBhbmQgb25lIG9mIENpcmNsZSdzIG9wdGlvbnMgaXMgcmFkaXVzLiBXaGVuIGEgY2lyY2xlIGlzIGNyZWF0ZWQ6XHJcbiAgICogICB2YXIgY2lyY2xlID0gbmV3IENpcmNsZSgge1xyXG4gICAqICAgICByYWRpdXM6IDEwLFxyXG4gICAqICAgICBib3R0b206IDIwMFxyXG4gICAqICAgfSApO1xyXG4gICAqIFRoaXMgd2lsbCBjcmVhdGUgYSBDaXJjbGUsIHNldCBpdHMgcmFkaXVzIChieSBleGVjdXRpbmcgY2lyY2xlLnJhZGl1cyA9IDEwLCB3aGljaCB1c2VzIGNpcmNsZS5zZXRSYWRpdXMoKSksIGFuZFxyXG4gICAqIHRoZW4gd2lsbCBhbGlnbiB0aGUgYm90dG9tIG9mIHRoZSBjaXJjbGUgYWxvbmcgeT0yMDAgKGJ5IGV4ZWN1dGluZyBjaXJjbGUuYm90dG9tID0gMjAwLCB3aGljaCB1c2VzXHJcbiAgICogbm9kZS5zZXRCb3R0b20oKSkuXHJcbiAgICpcclxuICAgKiBUaGUgb3B0aW9ucyBhcmUgZXhlY3V0ZWQgaW4gdGhlIG9yZGVyIHNwZWNpZmllZCBieSBlYWNoIHR5cGVzIF9tdXRhdG9yS2V5cyBwcm9wZXJ0eS5cclxuICAgKlxyXG4gICAqIFRoZSBvcHRpb25zIG9iamVjdCBpcyBjdXJyZW50bHkgbm90IGNoZWNrZWQgdG8gc2VlIHdoZXRoZXIgdGhlcmUgYXJlIHByb3BlcnR5IChrZXkpIG5hbWVzIHRoYXQgYXJlIG5vdCB1c2VkLCBzbyBpdFxyXG4gICAqIGlzIGN1cnJlbnRseSBsZWdhbCB0byBkbyBcIm5ldyBOb2RlKCB7IGZvcmtfa2l0Y2hlbl9zcG9vbjogNSB9IClcIi5cclxuICAgKlxyXG4gICAqIFVzdWFsbHksIGFuIG9wdGlvbiAoZS5nLiAndmlzaWJsZScpLCB3aGVuIHVzZWQgaW4gYSBjb25zdHJ1Y3RvciBvciBtdXRhdGUoKSBjYWxsLCB3aWxsIGRpcmVjdGx5IHVzZSB0aGUgRVM1IHNldHRlclxyXG4gICAqIGZvciB0aGF0IHByb3BlcnR5IChlLmcuIG5vZGUudmlzaWJsZSA9IC4uLiksIHdoaWNoIGdlbmVyYWxseSBmb3J3YXJkcyB0byBhIG5vbi1FUzUgc2V0dGVyIGZ1bmN0aW9uXHJcbiAgICogKGUuZy4gbm9kZS5zZXRWaXNpYmxlKCAuLi4gKSkgdGhhdCBpcyByZXNwb25zaWJsZSBmb3IgdGhlIGJlaGF2aW9yLiBEb2N1bWVudGF0aW9uIGlzIGdlbmVyYWxseSBvbiB0aGVzZSBtZXRob2RzXHJcbiAgICogKGUuZy4gc2V0VmlzaWJsZSksIGFsdGhvdWdoIHNvbWUgbWV0aG9kcyBtYXkgYmUgZHluYW1pY2FsbHkgY3JlYXRlZCB0byBhdm9pZCB2ZXJib3NpdHkgKGxpa2Ugbm9kZS5sZWZ0VG9wKS5cclxuICAgKlxyXG4gICAqIFNvbWV0aW1lcywgb3B0aW9ucyBpbnZva2UgYSBmdW5jdGlvbiBpbnN0ZWFkIChlLmcuICdzY2FsZScpIGJlY2F1c2UgdGhlIHZlcmIgYW5kIG5vdW4gYXJlIGlkZW50aWNhbC4gSW4gdGhpcyBjYXNlLFxyXG4gICAqIGluc3RlYWQgb2Ygc2V0dGluZyB0aGUgc2V0dGVyIChub2RlLnNjYWxlID0gLi4uLCB3aGljaCB3b3VsZCBvdmVycmlkZSB0aGUgZnVuY3Rpb24pLCBpdCB3aWxsIGluc3RlYWQgY2FsbFxyXG4gICAqIHRoZSBtZXRob2QgZGlyZWN0bHkgKGUuZy4gbm9kZS5zY2FsZSggLi4uICkpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9ucz86IE5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdGhpcy5faWQgPSBnbG9iYWxJZENvdW50ZXIrKztcclxuICAgIHRoaXMuX2luc3RhbmNlcyA9IFtdO1xyXG4gICAgdGhpcy5fcm9vdGVkRGlzcGxheXMgPSBbXTtcclxuICAgIHRoaXMuX2RyYXdhYmxlcyA9IFtdO1xyXG4gICAgdGhpcy5fdmlzaWJsZVByb3BlcnR5ID0gbmV3IFRpbnlGb3J3YXJkaW5nUHJvcGVydHkoIERFRkFVTFRfT1BUSU9OUy52aXNpYmxlLCBERUZBVUxUX09QVElPTlMucGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkLFxyXG4gICAgICB0aGlzLm9uVmlzaWJsZVByb3BlcnR5Q2hhbmdlLmJpbmQoIHRoaXMgKSApO1xyXG4gICAgdGhpcy5vcGFjaXR5UHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCBERUZBVUxUX09QVElPTlMub3BhY2l0eSwgdGhpcy5vbk9wYWNpdHlQcm9wZXJ0eUNoYW5nZS5iaW5kKCB0aGlzICkgKTtcclxuICAgIHRoaXMuZGlzYWJsZWRPcGFjaXR5UHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCBERUZBVUxUX09QVElPTlMuZGlzYWJsZWRPcGFjaXR5LCB0aGlzLm9uRGlzYWJsZWRPcGFjaXR5UHJvcGVydHlDaGFuZ2UuYmluZCggdGhpcyApICk7XHJcbiAgICB0aGlzLl9waWNrYWJsZVByb3BlcnR5ID0gbmV3IFRpbnlGb3J3YXJkaW5nUHJvcGVydHk8Ym9vbGVhbiB8IG51bGw+KCBERUZBVUxUX09QVElPTlMucGlja2FibGUsXHJcbiAgICAgIGZhbHNlLCB0aGlzLm9uUGlja2FibGVQcm9wZXJ0eUNoYW5nZS5iaW5kKCB0aGlzICkgKTtcclxuICAgIHRoaXMuX2VuYWJsZWRQcm9wZXJ0eSA9IG5ldyBUaW55Rm9yd2FyZGluZ1Byb3BlcnR5PGJvb2xlYW4+KCBERUZBVUxUX09QVElPTlMuZW5hYmxlZCxcclxuICAgICAgREVGQVVMVF9PUFRJT05TLnBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCwgdGhpcy5vbkVuYWJsZWRQcm9wZXJ0eUNoYW5nZS5iaW5kKCB0aGlzICkgKTtcclxuXHJcbiAgICB0aGlzLl9pbnB1dEVuYWJsZWRQcm9wZXJ0eSA9IG5ldyBUaW55Rm9yd2FyZGluZ1Byb3BlcnR5KCBERUZBVUxUX09QVElPTlMuaW5wdXRFbmFibGVkLFxyXG4gICAgICBERUZBVUxUX09QVElPTlMucGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQgKTtcclxuICAgIHRoaXMuY2xpcEFyZWFQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHk8U2hhcGUgfCBudWxsPiggREVGQVVMVF9PUFRJT05TLmNsaXBBcmVhICk7XHJcbiAgICB0aGlzLnZvaWNpbmdWaXNpYmxlUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5PGJvb2xlYW4+KCB0cnVlICk7XHJcbiAgICB0aGlzLl9tb3VzZUFyZWEgPSBERUZBVUxUX09QVElPTlMubW91c2VBcmVhO1xyXG4gICAgdGhpcy5fdG91Y2hBcmVhID0gREVGQVVMVF9PUFRJT05TLnRvdWNoQXJlYTtcclxuICAgIHRoaXMuX2N1cnNvciA9IERFRkFVTFRfT1BUSU9OUy5jdXJzb3I7XHJcbiAgICB0aGlzLl9jaGlsZHJlbiA9IFtdO1xyXG4gICAgdGhpcy5fcGFyZW50cyA9IFtdO1xyXG4gICAgdGhpcy5fdHJhbnNmb3JtQm91bmRzID0gREVGQVVMVF9PUFRJT05TLnRyYW5zZm9ybUJvdW5kcztcclxuICAgIHRoaXMuX3RyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm0zKCk7XHJcbiAgICB0aGlzLl90cmFuc2Zvcm1MaXN0ZW5lciA9IHRoaXMub25UcmFuc2Zvcm1DaGFuZ2UuYmluZCggdGhpcyApO1xyXG4gICAgdGhpcy5fdHJhbnNmb3JtLmNoYW5nZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuX3RyYW5zZm9ybUxpc3RlbmVyICk7XHJcbiAgICB0aGlzLl9tYXhXaWR0aCA9IERFRkFVTFRfT1BUSU9OUy5tYXhXaWR0aDtcclxuICAgIHRoaXMuX21heEhlaWdodCA9IERFRkFVTFRfT1BUSU9OUy5tYXhIZWlnaHQ7XHJcbiAgICB0aGlzLl9hcHBsaWVkU2NhbGVGYWN0b3IgPSAxO1xyXG4gICAgdGhpcy5faW5wdXRMaXN0ZW5lcnMgPSBbXTtcclxuXHJcbiAgICB0aGlzLmlucHV0RW5hYmxlZFByb3BlcnR5LmxhenlMaW5rKCB0aGlzLnBkb21Cb3VuZElucHV0RW5hYmxlZExpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gQWRkIGxpc3RlbmVyIGNvdW50IGNoYW5nZSBub3RpZmljYXRpb25zIGludG8gdGhlc2UgUHJvcGVydGllcywgc2luY2Ugd2UgbmVlZCB0byBrbm93IHdoZW4gdGhlaXIgbnVtYmVyIG9mIGxpc3RlbmVyc1xyXG4gICAgLy8gY2hhbmdlcyBkeW5hbWljYWxseS5cclxuICAgIGNvbnN0IGJvdW5kc0xpc3RlbmVyc0FkZGVkT3JSZW1vdmVkTGlzdGVuZXIgPSB0aGlzLm9uQm91bmRzTGlzdGVuZXJzQWRkZWRPclJlbW92ZWQuYmluZCggdGhpcyApO1xyXG5cclxuICAgIGNvbnN0IGJvdW5kc0ludmFsaWRhdGlvbkxpc3RlbmVyID0gdGhpcy52YWxpZGF0ZUJvdW5kcy5iaW5kKCB0aGlzICk7XHJcbiAgICBjb25zdCBzZWxmQm91bmRzSW52YWxpZGF0aW9uTGlzdGVuZXIgPSB0aGlzLnZhbGlkYXRlU2VsZkJvdW5kcy5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgdGhpcy5ib3VuZHNQcm9wZXJ0eSA9IG5ldyBUaW55U3RhdGljUHJvcGVydHkoIEJvdW5kczIuTk9USElORy5jb3B5KCksIGJvdW5kc0ludmFsaWRhdGlvbkxpc3RlbmVyICk7XHJcbiAgICB0aGlzLmJvdW5kc1Byb3BlcnR5LmNoYW5nZUNvdW50ID0gYm91bmRzTGlzdGVuZXJzQWRkZWRPclJlbW92ZWRMaXN0ZW5lcjtcclxuXHJcbiAgICB0aGlzLmxvY2FsQm91bmRzUHJvcGVydHkgPSBuZXcgVGlueVN0YXRpY1Byb3BlcnR5KCBCb3VuZHMyLk5PVEhJTkcuY29weSgpLCBib3VuZHNJbnZhbGlkYXRpb25MaXN0ZW5lciApO1xyXG4gICAgdGhpcy5sb2NhbEJvdW5kc1Byb3BlcnR5LmNoYW5nZUNvdW50ID0gYm91bmRzTGlzdGVuZXJzQWRkZWRPclJlbW92ZWRMaXN0ZW5lcjtcclxuXHJcbiAgICB0aGlzLmNoaWxkQm91bmRzUHJvcGVydHkgPSBuZXcgVGlueVN0YXRpY1Byb3BlcnR5KCBCb3VuZHMyLk5PVEhJTkcuY29weSgpLCBib3VuZHNJbnZhbGlkYXRpb25MaXN0ZW5lciApO1xyXG4gICAgdGhpcy5jaGlsZEJvdW5kc1Byb3BlcnR5LmNoYW5nZUNvdW50ID0gYm91bmRzTGlzdGVuZXJzQWRkZWRPclJlbW92ZWRMaXN0ZW5lcjtcclxuXHJcbiAgICB0aGlzLnNlbGZCb3VuZHNQcm9wZXJ0eSA9IG5ldyBUaW55U3RhdGljUHJvcGVydHkoIEJvdW5kczIuTk9USElORy5jb3B5KCksIHNlbGZCb3VuZHNJbnZhbGlkYXRpb25MaXN0ZW5lciApO1xyXG5cclxuICAgIHRoaXMuX2xvY2FsQm91bmRzT3ZlcnJpZGRlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5fZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyA9IGZhbHNlO1xyXG4gICAgdGhpcy5fbGF5b3V0T3B0aW9ucyA9IG51bGw7XHJcbiAgICB0aGlzLl9ib3VuZHNEaXJ0eSA9IHRydWU7XHJcbiAgICB0aGlzLl9sb2NhbEJvdW5kc0RpcnR5ID0gdHJ1ZTtcclxuICAgIHRoaXMuX3NlbGZCb3VuZHNEaXJ0eSA9IHRydWU7XHJcbiAgICB0aGlzLl9jaGlsZEJvdW5kc0RpcnR5ID0gdHJ1ZTtcclxuXHJcbiAgICBpZiAoIGFzc2VydCApIHtcclxuICAgICAgLy8gZm9yIGFzc2VydGlvbnMgbGF0ZXIgdG8gZW5zdXJlIHRoYXQgd2UgYXJlIHVzaW5nIHRoZSBzYW1lIEJvdW5kczIgY29waWVzIGFzIGJlZm9yZVxyXG4gICAgICB0aGlzLl9vcmlnaW5hbEJvdW5kcyA9IHRoaXMuYm91bmRzUHJvcGVydHkuX3ZhbHVlO1xyXG4gICAgICB0aGlzLl9vcmlnaW5hbExvY2FsQm91bmRzID0gdGhpcy5sb2NhbEJvdW5kc1Byb3BlcnR5Ll92YWx1ZTtcclxuICAgICAgdGhpcy5fb3JpZ2luYWxTZWxmQm91bmRzID0gdGhpcy5zZWxmQm91bmRzUHJvcGVydHkuX3ZhbHVlO1xyXG4gICAgICB0aGlzLl9vcmlnaW5hbENoaWxkQm91bmRzID0gdGhpcy5jaGlsZEJvdW5kc1Byb3BlcnR5Ll92YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9maWx0ZXJzID0gW107XHJcblxyXG4gICAgdGhpcy5faGludHMgPSB7XHJcbiAgICAgIHJlbmRlcmVyOiBERUZBVUxUX09QVElPTlMucmVuZGVyZXIgPT09IG51bGwgPyAwIDogUmVuZGVyZXIuZnJvbU5hbWUoIERFRkFVTFRfT1BUSU9OUy5yZW5kZXJlciApLFxyXG4gICAgICB1c2VzT3BhY2l0eTogREVGQVVMVF9PUFRJT05TLnVzZXNPcGFjaXR5LFxyXG4gICAgICBsYXllclNwbGl0OiBERUZBVUxUX09QVElPTlMubGF5ZXJTcGxpdCxcclxuICAgICAgY3NzVHJhbnNmb3JtOiBERUZBVUxUX09QVElPTlMuY3NzVHJhbnNmb3JtLFxyXG4gICAgICBmdWxsUmVzb2x1dGlvbjogZmFsc2UsXHJcbiAgICAgIGV4Y2x1ZGVJbnZpc2libGU6IERFRkFVTFRfT1BUSU9OUy5leGNsdWRlSW52aXNpYmxlLFxyXG4gICAgICB3ZWJnbFNjYWxlOiBERUZBVUxUX09QVElPTlMud2ViZ2xTY2FsZSxcclxuICAgICAgcHJldmVudEZpdDogREVGQVVMVF9PUFRJT05TLnByZXZlbnRGaXRcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5jaGlsZHJlbkNoYW5nZWRFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XHJcbiAgICB0aGlzLmNoaWxkSW5zZXJ0ZWRFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XHJcbiAgICB0aGlzLmNoaWxkUmVtb3ZlZEVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXIoKTtcclxuICAgIHRoaXMuY2hpbGRyZW5SZW9yZGVyZWRFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XHJcbiAgICB0aGlzLnRyYW5zZm9ybUVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXIoKTtcclxuICAgIHRoaXMuaW5zdGFuY2VSZWZyZXNoRW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xyXG4gICAgdGhpcy5yZW5kZXJlclN1bW1hcnlSZWZyZXNoRW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XHJcbiAgICB0aGlzLmNoYW5nZWRJbnN0YW5jZUVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXIoKTtcclxuICAgIHRoaXMubGF5b3V0T3B0aW9uc0NoYW5nZWRFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XHJcblxyXG4gICAgdGhpcy5fcmVuZGVyZXJCaXRtYXNrID0gUmVuZGVyZXIuYml0bWFza05vZGVEZWZhdWx0O1xyXG4gICAgdGhpcy5fcmVuZGVyZXJTdW1tYXJ5ID0gbmV3IFJlbmRlcmVyU3VtbWFyeSggdGhpcyApO1xyXG5cclxuICAgIHRoaXMuX2JvdW5kc0V2ZW50Q291bnQgPSAwO1xyXG4gICAgdGhpcy5fYm91bmRzRXZlbnRTZWxmQ291bnQgPSAwO1xyXG4gICAgdGhpcy5fcGlja2VyID0gbmV3IFBpY2tlciggdGhpcyApO1xyXG4gICAgdGhpcy5faXNHZXR0aW5nUmVtb3ZlZEZyb21QYXJlbnQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoIG9wdGlvbnMgKSB7XHJcbiAgICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogSW5zZXJ0cyBhIGNoaWxkIE5vZGUgYXQgYSBzcGVjaWZpYyBpbmRleC5cclxuICAgKlxyXG4gICAqIG5vZGUuaW5zZXJ0Q2hpbGQoIDAsIGNoaWxkTm9kZSApIHdpbGwgaW5zZXJ0IHRoZSBjaGlsZCBpbnRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGNoaWxkcmVuIGFycmF5IChvbiB0aGUgYm90dG9tXHJcbiAgICogdmlzdWFsbHkpLlxyXG4gICAqXHJcbiAgICogbm9kZS5pbnNlcnRDaGlsZCggbm9kZS5jaGlsZHJlbi5sZW5ndGgsIGNoaWxkTm9kZSApIGlzIGVxdWl2YWxlbnQgdG8gbm9kZS5hZGRDaGlsZCggY2hpbGROb2RlICksIGFuZCBhcHBlbmRzIGl0XHJcbiAgICogdG8gdGhlIGVuZCAodG9wIHZpc3VhbGx5KSBvZiB0aGUgY2hpbGRyZW4gYXJyYXkuIEl0IGlzIHJlY29tbWVuZGVkIHRvIHVzZSBub2RlLmFkZENoaWxkIHdoZW4gcG9zc2libGUuXHJcbiAgICpcclxuICAgKiBOT1RFOiBvdmVycmlkZGVuIGJ5IExlYWYgZm9yIHNvbWUgc3VidHlwZXNcclxuICAgKlxyXG4gICAqIEBwYXJhbSBpbmRleCAtIEluZGV4IHdoZXJlIHRoZSBpbnNlcnRlZCBjaGlsZCBOb2RlIHdpbGwgYmUgYWZ0ZXIgdGhpcyBvcGVyYXRpb24uXHJcbiAgICogQHBhcmFtIG5vZGUgLSBUaGUgbmV3IGNoaWxkIHRvIGluc2VydC5cclxuICAgKiBAcGFyYW0gW2lzQ29tcG9zaXRlXSAtIChzY2VuZXJ5LWludGVybmFsKSBJZiB0cnVlLCB0aGUgY2hpbGRyZW5DaGFuZ2VkIGV2ZW50IHdpbGwgbm90IGJlIHNlbnQgb3V0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpbnNlcnRDaGlsZCggaW5kZXg6IG51bWJlciwgbm9kZTogTm9kZSwgaXNDb21wb3NpdGU/OiBib29sZWFuICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbm9kZSAhPT0gbnVsbCAmJiBub2RlICE9PSB1bmRlZmluZWQsICdpbnNlcnRDaGlsZCBjYW5ub3QgaW5zZXJ0IGEgbnVsbC91bmRlZmluZWQgY2hpbGQnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhXy5pbmNsdWRlcyggdGhpcy5fY2hpbGRyZW4sIG5vZGUgKSwgJ1BhcmVudCBhbHJlYWR5IGNvbnRhaW5zIGNoaWxkJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbm9kZSAhPT0gdGhpcywgJ0Nhbm5vdCBhZGQgc2VsZiBhcyBhIGNoaWxkJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbm9kZS5fcGFyZW50cyAhPT0gbnVsbCwgJ1RyaWVkIHRvIGluc2VydCBhIGRpc3Bvc2VkIGNoaWxkIG5vZGU/JyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW5vZGUuaXNEaXNwb3NlZCwgJ1RyaWVkIHRvIGluc2VydCBhIGRpc3Bvc2VkIE5vZGUnICk7XHJcblxyXG4gICAgLy8gbmVlZHMgdG8gYmUgZWFybHkgdG8gcHJldmVudCByZS1lbnRyYW50IGNoaWxkcmVuIG1vZGlmaWNhdGlvbnNcclxuICAgIHRoaXMuX3BpY2tlci5vbkluc2VydENoaWxkKCBub2RlICk7XHJcbiAgICB0aGlzLmNoYW5nZUJvdW5kc0V2ZW50Q291bnQoIG5vZGUuX2JvdW5kc0V2ZW50Q291bnQgPiAwID8gMSA6IDAgKTtcclxuICAgIHRoaXMuX3JlbmRlcmVyU3VtbWFyeS5zdW1tYXJ5Q2hhbmdlKCBSZW5kZXJlclN1bW1hcnkuYml0bWFza0FsbCwgbm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmJpdG1hc2sgKTtcclxuXHJcbiAgICBub2RlLl9wYXJlbnRzLnB1c2goIHRoaXMgKTtcclxuICAgIGlmICggYXNzZXJ0ICYmIHdpbmRvdy5waGV0Py5jaGlwcGVyPy5xdWVyeVBhcmFtZXRlcnMgJiYgaXNGaW5pdGUoIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMucGFyZW50TGltaXQgKSApIHtcclxuICAgICAgY29uc3QgcGFyZW50Q291bnQgPSBub2RlLl9wYXJlbnRzLmxlbmd0aDtcclxuICAgICAgaWYgKCBtYXhQYXJlbnRDb3VudCA8IHBhcmVudENvdW50ICkge1xyXG4gICAgICAgIG1heFBhcmVudENvdW50ID0gcGFyZW50Q291bnQ7XHJcbiAgICAgICAgY29uc29sZS5sb2coIGBNYXggTm9kZSBwYXJlbnRzOiAke21heFBhcmVudENvdW50fWAgKTtcclxuICAgICAgICBhc3NlcnQoIG1heFBhcmVudENvdW50IDw9IHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMucGFyZW50TGltaXQsXHJcbiAgICAgICAgICBgcGFyZW50IGNvdW50IG9mICR7bWF4UGFyZW50Q291bnR9IGFib3ZlID9wYXJlbnRMaW1pdD0ke3BoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMucGFyZW50TGltaXR9YCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLl9jaGlsZHJlbi5zcGxpY2UoIGluZGV4LCAwLCBub2RlICk7XHJcblxyXG4gICAgLy8gSWYgdGhpcyBhZGRlZCBzdWJ0cmVlIGNvbnRhaW5zIFBET00gY29udGVudCwgd2UgbmVlZCB0byBub3RpZnkgYW55IHJlbGV2YW50IGRpc3BsYXlzXHJcbiAgICBpZiAoICFub2RlLl9yZW5kZXJlclN1bW1hcnkuaGFzTm9QRE9NKCkgKSB7XHJcbiAgICAgIHRoaXMub25QRE9NQWRkQ2hpbGQoIG5vZGUgKTtcclxuICAgIH1cclxuXHJcbiAgICBub2RlLmludmFsaWRhdGVCb3VuZHMoKTtcclxuXHJcbiAgICAvLyBsaWtlIGNhbGxpbmcgdGhpcy5pbnZhbGlkYXRlQm91bmRzKCksIGJ1dCB3ZSBhbHJlYWR5IG1hcmtlZCBhbGwgYW5jZXN0b3JzIHdpdGggZGlydHkgY2hpbGQgYm91bmRzXHJcbiAgICB0aGlzLl9ib3VuZHNEaXJ0eSA9IHRydWU7XHJcblxyXG4gICAgdGhpcy5jaGlsZEluc2VydGVkRW1pdHRlci5lbWl0KCBub2RlLCBpbmRleCApO1xyXG4gICAgbm9kZS5wYXJlbnRBZGRlZEVtaXR0ZXIuZW1pdCggdGhpcyApO1xyXG5cclxuICAgICFpc0NvbXBvc2l0ZSAmJiB0aGlzLmNoaWxkcmVuQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG5cclxuICAgIGlmICggYXNzZXJ0U2xvdyApIHsgdGhpcy5fcGlja2VyLmF1ZGl0KCk7IH1cclxuXHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGVuZHMgYSBjaGlsZCBOb2RlIHRvIG91ciBsaXN0IG9mIGNoaWxkcmVuLlxyXG4gICAqXHJcbiAgICogVGhlIG5ldyBjaGlsZCBOb2RlIHdpbGwgYmUgZGlzcGxheWVkIGluIGZyb250IChvbiB0b3ApIG9mIGFsbCBvZiB0aGlzIG5vZGUncyBvdGhlciBjaGlsZHJlbi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBub2RlXHJcbiAgICogQHBhcmFtIFtpc0NvbXBvc2l0ZV0gLSAoc2NlbmVyeS1pbnRlcm5hbCkgSWYgdHJ1ZSwgdGhlIGNoaWxkcmVuQ2hhbmdlZCBldmVudCB3aWxsIG5vdCBiZSBzZW50IG91dC5cclxuICAgKi9cclxuICBwdWJsaWMgYWRkQ2hpbGQoIG5vZGU6IE5vZGUsIGlzQ29tcG9zaXRlPzogYm9vbGVhbiApOiB0aGlzIHtcclxuICAgIHRoaXMuaW5zZXJ0Q2hpbGQoIHRoaXMuX2NoaWxkcmVuLmxlbmd0aCwgbm9kZSwgaXNDb21wb3NpdGUgKTtcclxuXHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBjaGlsZCBOb2RlIGZyb20gb3VyIGxpc3Qgb2YgY2hpbGRyZW4sIHNlZSBodHRwOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jLyNub2RlLXJlbW92ZUNoaWxkXHJcbiAgICogV2lsbCBmYWlsIGFuIGFzc2VydGlvbiBpZiB0aGUgTm9kZSBpcyBub3QgY3VycmVudGx5IG9uZSBvZiBvdXIgY2hpbGRyZW5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBub2RlXHJcbiAgICogQHBhcmFtIFtpc0NvbXBvc2l0ZV0gLSAoc2NlbmVyeS1pbnRlcm5hbCkgSWYgdHJ1ZSwgdGhlIGNoaWxkcmVuQ2hhbmdlZCBldmVudCB3aWxsIG5vdCBiZSBzZW50IG91dC5cclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlQ2hpbGQoIG5vZGU6IE5vZGUsIGlzQ29tcG9zaXRlPzogYm9vbGVhbiApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUgJiYgbm9kZSBpbnN0YW5jZW9mIE5vZGUsICdOZWVkIHRvIGNhbGwgbm9kZS5yZW1vdmVDaGlsZCgpIHdpdGggYSBOb2RlLicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaGFzQ2hpbGQoIG5vZGUgKSwgJ0F0dGVtcHRlZCB0byByZW1vdmVDaGlsZCB3aXRoIGEgbm9kZSB0aGF0IHdhcyBub3QgYSBjaGlsZC4nICk7XHJcblxyXG4gICAgY29uc3QgaW5kZXhPZkNoaWxkID0gXy5pbmRleE9mKCB0aGlzLl9jaGlsZHJlbiwgbm9kZSApO1xyXG5cclxuICAgIHRoaXMucmVtb3ZlQ2hpbGRXaXRoSW5kZXgoIG5vZGUsIGluZGV4T2ZDaGlsZCwgaXNDb21wb3NpdGUgKTtcclxuXHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBjaGlsZCBOb2RlIGF0IGEgc3BlY2lmaWMgaW5kZXggKG5vZGUuY2hpbGRyZW5bIGluZGV4IF0pIGZyb20gb3VyIGxpc3Qgb2YgY2hpbGRyZW4uXHJcbiAgICogV2lsbCBmYWlsIGlmIHRoZSBpbmRleCBpcyBvdXQgb2YgYm91bmRzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGluZGV4XHJcbiAgICogQHBhcmFtIFtpc0NvbXBvc2l0ZV0gLSAoc2NlbmVyeS1pbnRlcm5hbCkgSWYgdHJ1ZSwgdGhlIGNoaWxkcmVuQ2hhbmdlZCBldmVudCB3aWxsIG5vdCBiZSBzZW50IG91dC5cclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlQ2hpbGRBdCggaW5kZXg6IG51bWJlciwgaXNDb21wb3NpdGU/OiBib29sZWFuICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggPj0gMCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggPCB0aGlzLl9jaGlsZHJlbi5sZW5ndGggKTtcclxuXHJcbiAgICBjb25zdCBub2RlID0gdGhpcy5fY2hpbGRyZW5bIGluZGV4IF07XHJcblxyXG4gICAgdGhpcy5yZW1vdmVDaGlsZFdpdGhJbmRleCggbm9kZSwgaW5kZXgsIGlzQ29tcG9zaXRlICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnRlcm5hbCBtZXRob2QgZm9yIHJlbW92aW5nIGEgTm9kZSAoYWx3YXlzIGhhcyB0aGUgTm9kZSBhbmQgaW5kZXgpLlxyXG4gICAqXHJcbiAgICogTk9URTogb3ZlcnJpZGRlbiBieSBMZWFmIGZvciBzb21lIHN1YnR5cGVzXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbm9kZSAtIFRoZSBjaGlsZCBub2RlIHRvIHJlbW92ZSBmcm9tIHRoaXMgTm9kZSAoaXQncyBwYXJlbnQpXHJcbiAgICogQHBhcmFtIGluZGV4T2ZDaGlsZCAtIFNob3VsZCBzYXRpc2Z5IHRoaXMuY2hpbGRyZW5bIGluZGV4T2ZDaGlsZCBdID09PSBub2RlXHJcbiAgICogQHBhcmFtIFtpc0NvbXBvc2l0ZV0gLSAoc2NlbmVyeS1pbnRlcm5hbCkgSWYgdHJ1ZSwgdGhlIGNoaWxkcmVuQ2hhbmdlZCBldmVudCB3aWxsIG5vdCBiZSBzZW50IG91dC5cclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlQ2hpbGRXaXRoSW5kZXgoIG5vZGU6IE5vZGUsIGluZGV4T2ZDaGlsZDogbnVtYmVyLCBpc0NvbXBvc2l0ZT86IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlICYmIG5vZGUgaW5zdGFuY2VvZiBOb2RlLCAnTmVlZCB0byBjYWxsIG5vZGUucmVtb3ZlQ2hpbGRXaXRoSW5kZXgoKSB3aXRoIGEgTm9kZS4nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmhhc0NoaWxkKCBub2RlICksICdBdHRlbXB0ZWQgdG8gcmVtb3ZlQ2hpbGQgd2l0aCBhIG5vZGUgdGhhdCB3YXMgbm90IGEgY2hpbGQuJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fY2hpbGRyZW5bIGluZGV4T2ZDaGlsZCBdID09PSBub2RlLCAnSW5jb3JyZWN0IGluZGV4IGZvciByZW1vdmVDaGlsZFdpdGhJbmRleCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUuX3BhcmVudHMgIT09IG51bGwsICdUcmllZCB0byByZW1vdmUgYSBkaXNwb3NlZCBjaGlsZCBub2RlPycgKTtcclxuXHJcbiAgICBjb25zdCBpbmRleE9mUGFyZW50ID0gXy5pbmRleE9mKCBub2RlLl9wYXJlbnRzLCB0aGlzICk7XHJcblxyXG4gICAgbm9kZS5faXNHZXR0aW5nUmVtb3ZlZEZyb21QYXJlbnQgPSB0cnVlO1xyXG5cclxuICAgIC8vIElmIHRoaXMgYWRkZWQgc3VidHJlZSBjb250YWlucyBQRE9NIGNvbnRlbnQsIHdlIG5lZWQgdG8gbm90aWZ5IGFueSByZWxldmFudCBkaXNwbGF5c1xyXG4gICAgLy8gTk9URTogUG90ZW50aWFsbHkgcmVtb3ZlcyBib3VuZHMgbGlzdGVuZXJzIGhlcmUhXHJcbiAgICBpZiAoICFub2RlLl9yZW5kZXJlclN1bW1hcnkuaGFzTm9QRE9NKCkgKSB7XHJcbiAgICAgIHRoaXMub25QRE9NUmVtb3ZlQ2hpbGQoIG5vZGUgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBuZWVkcyB0byBiZSBlYXJseSB0byBwcmV2ZW50IHJlLWVudHJhbnQgY2hpbGRyZW4gbW9kaWZpY2F0aW9uc1xyXG4gICAgdGhpcy5fcGlja2VyLm9uUmVtb3ZlQ2hpbGQoIG5vZGUgKTtcclxuICAgIHRoaXMuY2hhbmdlQm91bmRzRXZlbnRDb3VudCggbm9kZS5fYm91bmRzRXZlbnRDb3VudCA+IDAgPyAtMSA6IDAgKTtcclxuICAgIHRoaXMuX3JlbmRlcmVyU3VtbWFyeS5zdW1tYXJ5Q2hhbmdlKCBub2RlLl9yZW5kZXJlclN1bW1hcnkuYml0bWFzaywgUmVuZGVyZXJTdW1tYXJ5LmJpdG1hc2tBbGwgKTtcclxuXHJcbiAgICBub2RlLl9wYXJlbnRzLnNwbGljZSggaW5kZXhPZlBhcmVudCwgMSApO1xyXG4gICAgdGhpcy5fY2hpbGRyZW4uc3BsaWNlKCBpbmRleE9mQ2hpbGQsIDEgKTtcclxuICAgIG5vZGUuX2lzR2V0dGluZ1JlbW92ZWRGcm9tUGFyZW50ID0gZmFsc2U7IC8vIEl0IGlzIFwiY29tcGxldGVcIlxyXG5cclxuICAgIHRoaXMuaW52YWxpZGF0ZUJvdW5kcygpO1xyXG4gICAgdGhpcy5fY2hpbGRCb3VuZHNEaXJ0eSA9IHRydWU7IC8vIGZvcmNlIHJlY29tcHV0YXRpb24gb2YgY2hpbGQgYm91bmRzIGFmdGVyIHJlbW92aW5nIGEgY2hpbGRcclxuXHJcbiAgICB0aGlzLmNoaWxkUmVtb3ZlZEVtaXR0ZXIuZW1pdCggbm9kZSwgaW5kZXhPZkNoaWxkICk7XHJcbiAgICBub2RlLnBhcmVudFJlbW92ZWRFbWl0dGVyLmVtaXQoIHRoaXMgKTtcclxuXHJcbiAgICAhaXNDb21wb3NpdGUgJiYgdGhpcy5jaGlsZHJlbkNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuXHJcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7IHRoaXMuX3BpY2tlci5hdWRpdCgpOyB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJZiBhIGNoaWxkIGlzIG5vdCBhdCB0aGUgZ2l2ZW4gaW5kZXgsIGl0IGlzIG1vdmVkIHRvIHRoZSBnaXZlbiBpbmRleC4gVGhpcyByZW9yZGVycyB0aGUgY2hpbGRyZW4gb2YgdGhpcyBOb2RlIHNvXHJcbiAgICogdGhhdCBgdGhpcy5jaGlsZHJlblsgaW5kZXggXSA9PT0gbm9kZWAuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbm9kZSAtIFRoZSBjaGlsZCBOb2RlIHRvIG1vdmUgaW4gdGhlIG9yZGVyXHJcbiAgICogQHBhcmFtIGluZGV4IC0gVGhlIGRlc2lyZWQgaW5kZXggKGludG8gdGhlIGNoaWxkcmVuIGFycmF5KSBvZiB0aGUgY2hpbGQuXHJcbiAgICovXHJcbiAgcHVibGljIG1vdmVDaGlsZFRvSW5kZXgoIG5vZGU6IE5vZGUsIGluZGV4OiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmhhc0NoaWxkKCBub2RlICksICdBdHRlbXB0ZWQgdG8gbW92ZUNoaWxkVG9JbmRleCB3aXRoIGEgbm9kZSB0aGF0IHdhcyBub3QgYSBjaGlsZC4nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCAlIDEgPT09IDAgJiYgaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMuX2NoaWxkcmVuLmxlbmd0aCxcclxuICAgICAgYEludmFsaWQgaW5kZXg6ICR7aW5kZXh9YCApO1xyXG5cclxuICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IHRoaXMuaW5kZXhPZkNoaWxkKCBub2RlICk7XHJcbiAgICBpZiAoIHRoaXMuX2NoaWxkcmVuWyBpbmRleCBdICE9PSBub2RlICkge1xyXG5cclxuICAgICAgLy8gQXBwbHkgdGhlIGFjdHVhbCBjaGlsZHJlbiBjaGFuZ2VcclxuICAgICAgdGhpcy5fY2hpbGRyZW4uc3BsaWNlKCBjdXJyZW50SW5kZXgsIDEgKTtcclxuICAgICAgdGhpcy5fY2hpbGRyZW4uc3BsaWNlKCBpbmRleCwgMCwgbm9kZSApO1xyXG5cclxuICAgICAgaWYgKCAhdGhpcy5fcmVuZGVyZXJTdW1tYXJ5Lmhhc05vUERPTSgpICkge1xyXG4gICAgICAgIHRoaXMub25QRE9NUmVvcmRlcmVkQ2hpbGRyZW4oKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5jaGlsZHJlblJlb3JkZXJlZEVtaXR0ZXIuZW1pdCggTWF0aC5taW4oIGN1cnJlbnRJbmRleCwgaW5kZXggKSwgTWF0aC5tYXgoIGN1cnJlbnRJbmRleCwgaW5kZXggKSApO1xyXG4gICAgICB0aGlzLmNoaWxkcmVuQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhbGwgY2hpbGRyZW4gZnJvbSB0aGlzIE5vZGUuXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZUFsbENoaWxkcmVuKCk6IHRoaXMge1xyXG4gICAgdGhpcy5zZXRDaGlsZHJlbiggW10gKTtcclxuXHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGNoaWxkcmVuIG9mIHRoZSBOb2RlIHRvIGJlIGVxdWl2YWxlbnQgdG8gdGhlIHBhc3NlZC1pbiBhcnJheSBvZiBOb2Rlcy5cclxuICAgKlxyXG4gICAqIE5PVEU6IE1lYW50IHRvIGJlIG92ZXJyaWRkZW4gaW4gc29tZSBjYXNlc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRDaGlsZHJlbiggY2hpbGRyZW46IE5vZGVbXSApOiB0aGlzIHtcclxuICAgIC8vIFRoZSBpbXBsZW1lbnRhdGlvbiBpcyBzcGxpdCBpbnRvIGJhc2ljYWxseSB0aHJlZSBzdGFnZXM6XHJcbiAgICAvLyAxLiBSZW1vdmUgY3VycmVudCBjaGlsZHJlbiB0aGF0IGFyZSBub3QgaW4gdGhlIG5ldyBjaGlsZHJlbiBhcnJheS5cclxuICAgIC8vIDIuIFJlb3JkZXIgY2hpbGRyZW4gdGhhdCBleGlzdCBib3RoIGJlZm9yZS9hZnRlciB0aGUgY2hhbmdlLlxyXG4gICAgLy8gMy4gSW5zZXJ0IGluIG5ldyBjaGlsZHJlblxyXG5cclxuICAgIGNvbnN0IGJlZm9yZU9ubHk6IE5vZGVbXSA9IFtdOyAvLyBXaWxsIGhvbGQgYWxsIG5vZGVzIHRoYXQgd2lsbCBiZSByZW1vdmVkLlxyXG4gICAgY29uc3QgYWZ0ZXJPbmx5OiBOb2RlW10gPSBbXTsgLy8gV2lsbCBob2xkIGFsbCBub2RlcyB0aGF0IHdpbGwgYmUgXCJuZXdcIiBjaGlsZHJlbiAoYWRkZWQpXHJcbiAgICBjb25zdCBpbkJvdGg6IE5vZGVbXSA9IFtdOyAvLyBDaGlsZCBub2RlcyB0aGF0IFwic3RheVwiLiBXaWxsIGJlIG9yZGVyZWQgZm9yIHRoZSBcImFmdGVyXCIgY2FzZS5cclxuICAgIGxldCBpO1xyXG5cclxuICAgIC8vIENvbXB1dGUgd2hhdCB0aGluZ3Mgd2VyZSBhZGRlZCwgcmVtb3ZlZCwgb3Igc3RheS5cclxuICAgIGFycmF5RGlmZmVyZW5jZSggY2hpbGRyZW4sIHRoaXMuX2NoaWxkcmVuLCBhZnRlck9ubHksIGJlZm9yZU9ubHksIGluQm90aCApO1xyXG5cclxuICAgIC8vIFJlbW92ZSBhbnkgbm9kZXMgdGhhdCBhcmUgbm90IGluIHRoZSBuZXcgY2hpbGRyZW4uXHJcbiAgICBmb3IgKCBpID0gYmVmb3JlT25seS5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcclxuICAgICAgdGhpcy5yZW1vdmVDaGlsZCggYmVmb3JlT25seVsgaSBdLCB0cnVlICk7XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fY2hpbGRyZW4ubGVuZ3RoID09PSBpbkJvdGgubGVuZ3RoLFxyXG4gICAgICAnUmVtb3ZpbmcgY2hpbGRyZW4gc2hvdWxkIG5vdCBoYXZlIHRyaWdnZXJlZCBvdGhlciBjaGlsZHJlbiBjaGFuZ2VzJyApO1xyXG5cclxuICAgIC8vIEhhbmRsZSB0aGUgbWFpbiByZW9yZGVyaW5nIChvZiBub2RlcyB0aGF0IFwic3RheVwiKVxyXG4gICAgbGV0IG1pbkNoYW5nZUluZGV4ID0gLTE7IC8vIFdoYXQgaXMgdGhlIHNtYWxsZXN0IGluZGV4IHdoZXJlIHRoaXMuX2NoaWxkcmVuWyBpbmRleCBdICE9PSBpbkJvdGhbIGluZGV4IF1cclxuICAgIGxldCBtYXhDaGFuZ2VJbmRleCA9IC0xOyAvLyBXaGF0IGlzIHRoZSBsYXJnZXN0IGluZGV4IHdoZXJlIHRoaXMuX2NoaWxkcmVuWyBpbmRleCBdICE9PSBpbkJvdGhbIGluZGV4IF1cclxuICAgIGZvciAoIGkgPSAwOyBpIDwgaW5Cb3RoLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBkZXNpcmVkID0gaW5Cb3RoWyBpIF07XHJcbiAgICAgIGlmICggdGhpcy5fY2hpbGRyZW5bIGkgXSAhPT0gZGVzaXJlZCApIHtcclxuICAgICAgICB0aGlzLl9jaGlsZHJlblsgaSBdID0gZGVzaXJlZDtcclxuICAgICAgICBpZiAoIG1pbkNoYW5nZUluZGV4ID09PSAtMSApIHtcclxuICAgICAgICAgIG1pbkNoYW5nZUluZGV4ID0gaTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWF4Q2hhbmdlSW5kZXggPSBpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBJZiBvdXIgbWluQ2hhbmdlSW5kZXggaXMgc3RpbGwgLTEsIHRoZW4gbm9uZSBvZiB0aG9zZSBub2RlcyB0aGF0IFwic3RheVwiIHdlcmUgcmVvcmRlcmVkLiBJdCdzIGltcG9ydGFudCB0byBjaGVja1xyXG4gICAgLy8gZm9yIHRoaXMgY2FzZSwgc28gdGhhdCBgbm9kZS5jaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW5gIGlzIGVmZmVjdGl2ZWx5IGEgbm8tb3AgcGVyZm9ybWFuY2Utd2lzZS5cclxuICAgIGNvbnN0IGhhc1Jlb3JkZXJpbmdDaGFuZ2UgPSBtaW5DaGFuZ2VJbmRleCAhPT0gLTE7XHJcblxyXG4gICAgLy8gSW1tZWRpYXRlIGNvbnNlcXVlbmNlcy91cGRhdGVzIGZyb20gcmVvcmRlcmluZ1xyXG4gICAgaWYgKCBoYXNSZW9yZGVyaW5nQ2hhbmdlICkge1xyXG4gICAgICBpZiAoICF0aGlzLl9yZW5kZXJlclN1bW1hcnkuaGFzTm9QRE9NKCkgKSB7XHJcbiAgICAgICAgdGhpcy5vblBET01SZW9yZGVyZWRDaGlsZHJlbigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmNoaWxkcmVuUmVvcmRlcmVkRW1pdHRlci5lbWl0KCBtaW5DaGFuZ2VJbmRleCwgbWF4Q2hhbmdlSW5kZXggKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBZGQgaW4gXCJuZXdcIiBjaGlsZHJlbi5cclxuICAgIC8vIFNjYW4gdGhyb3VnaCB0aGUgXCJlbmRpbmdcIiBjaGlsZHJlbiBpbmRpY2VzLCBhZGRpbmcgaW4gdGhpbmdzIHRoYXQgd2VyZSBpbiB0aGUgXCJhZnRlck9ubHlcIiBwYXJ0LiBUaGlzIHNjYW4gaXNcclxuICAgIC8vIGRvbmUgdGhyb3VnaCB0aGUgY2hpbGRyZW4gYXJyYXkgaW5zdGVhZCBvZiB0aGUgYWZ0ZXJPbmx5IGFycmF5IChhcyBkZXRlcm1pbmluZyB0aGUgaW5kZXggaW4gY2hpbGRyZW4gd291bGRcclxuICAgIC8vIHRoZW4gYmUgcXVhZHJhdGljIGluIHRpbWUsIHdoaWNoIHdvdWxkIGJlIHVuYWNjZXB0YWJsZSBoZXJlKS4gQXQgdGhpcyBwb2ludCwgYSBmb3J3YXJkIHNjYW4gc2hvdWxkIGJlXHJcbiAgICAvLyBzdWZmaWNpZW50IHRvIGluc2VydCBpbi1wbGFjZSwgYW5kIHNob3VsZCBtb3ZlIHRoZSBsZWFzdCBhbW91bnQgb2Ygbm9kZXMgaW4gdGhlIGFycmF5LlxyXG4gICAgaWYgKCBhZnRlck9ubHkubGVuZ3RoICkge1xyXG4gICAgICBsZXQgYWZ0ZXJJbmRleCA9IDA7XHJcbiAgICAgIGxldCBhZnRlciA9IGFmdGVyT25seVsgYWZ0ZXJJbmRleCBdO1xyXG4gICAgICBmb3IgKCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGlmICggY2hpbGRyZW5bIGkgXSA9PT0gYWZ0ZXIgKSB7XHJcbiAgICAgICAgICB0aGlzLmluc2VydENoaWxkKCBpLCBhZnRlciwgdHJ1ZSApO1xyXG4gICAgICAgICAgYWZ0ZXIgPSBhZnRlck9ubHlbICsrYWZ0ZXJJbmRleCBdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHdlIGhhZCBhbnkgY2hhbmdlcywgc2VuZCB0aGUgZ2VuZXJpYyBcImNoYW5nZWRcIiBldmVudC5cclxuICAgIGlmICggYmVmb3JlT25seS5sZW5ndGggIT09IDAgfHwgYWZ0ZXJPbmx5Lmxlbmd0aCAhPT0gMCB8fCBoYXNSZW9yZGVyaW5nQ2hhbmdlICkge1xyXG4gICAgICB0aGlzLmNoaWxkcmVuQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNhbml0eSBjaGVja3MgdG8gbWFrZSBzdXJlIG91ciByZXN1bHRpbmcgY2hpbGRyZW4gYXJyYXkgaXMgY29ycmVjdC5cclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLl9jaGlsZHJlbi5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICBhc3NlcnQoIGNoaWxkcmVuWyBqIF0gPT09IHRoaXMuX2NoaWxkcmVuWyBqIF0sXHJcbiAgICAgICAgICAnSW5jb3JyZWN0IGNoaWxkIGFmdGVyIHNldENoaWxkcmVuLCBwb3NzaWJseSBhIHJlZW50cmFuY3kgaXNzdWUnICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBhbGxvdyBjaGFpbmluZ1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgc2V0Q2hpbGRyZW4oKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgY2hpbGRyZW4oIHZhbHVlOiBOb2RlW10gKSB7XHJcbiAgICB0aGlzLnNldENoaWxkcmVuKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldENoaWxkcmVuKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGNoaWxkcmVuKCk6IE5vZGVbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRDaGlsZHJlbigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGRlZmVuc2l2ZSBjb3B5IG9mIHRoZSBhcnJheSBvZiBkaXJlY3QgY2hpbGRyZW4gb2YgdGhpcyBub2RlLCBvcmRlcmVkIGJ5IHdoYXQgaXMgaW4gZnJvbnQgKG5vZGVzIGF0XHJcbiAgICogdGhlIGVuZCBvZiB0aGUgYXJyYXkgYXJlIGluIGZyb250IG9mIG5vZGVzIGF0IHRoZSBzdGFydCkuXHJcbiAgICpcclxuICAgKiBNYWtpbmcgY2hhbmdlcyB0byB0aGUgcmV0dXJuZWQgcmVzdWx0IHdpbGwgbm90IGFmZmVjdCB0aGlzIG5vZGUncyBjaGlsZHJlbi5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q2hpbGRyZW4oKTogTm9kZVtdIHtcclxuICAgIC8vIFRPRE86IGVuc3VyZSB3ZSBhcmUgbm90IHRyaWdnZXJpbmcgdGhpcyBpbiBTY2VuZXJ5IGNvZGUgd2hlbiBub3QgbmVjZXNzYXJ5IVxyXG4gICAgcmV0dXJuIHRoaXMuX2NoaWxkcmVuLnNsaWNlKCAwICk7IC8vIGNyZWF0ZSBhIGRlZmVuc2l2ZSBjb3B5XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgY291bnQgb2YgY2hpbGRyZW4sIHdpdGhvdXQgbmVlZGluZyB0byBtYWtlIGEgZGVmZW5zaXZlIGNvcHkuXHJcbiAgICovXHJcbiAgcHVibGljIGdldENoaWxkcmVuQ291bnQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9jaGlsZHJlbi5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgZGVmZW5zaXZlIGNvcHkgb2Ygb3VyIHBhcmVudHMuIFRoaXMgaXMgYW4gYXJyYXkgb2YgcGFyZW50IG5vZGVzIHRoYXQgaXMgcmV0dXJuZWQgaW4gbm8gcGFydGljdWxhclxyXG4gICAqIG9yZGVyIChhcyBvcmRlciBpcyBub3QgaW1wb3J0YW50IGhlcmUpLlxyXG4gICAqXHJcbiAgICogTk9URTogTW9kaWZ5aW5nIHRoZSByZXR1cm5lZCBhcnJheSB3aWxsIG5vdCBpbiBhbnkgd2F5IG1vZGlmeSB0aGlzIG5vZGUncyBwYXJlbnRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRQYXJlbnRzKCk6IE5vZGVbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcGFyZW50cy5zbGljZSggMCApOyAvLyBjcmVhdGUgYSBkZWZlbnNpdmUgY29weVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldFBhcmVudHMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgcGFyZW50cygpOiBOb2RlW10ge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0UGFyZW50cygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHNpbmdsZSBwYXJlbnQgaWYgaXQgZXhpc3RzLCBvdGhlcndpc2UgbnVsbCAobm8gcGFyZW50cyksIG9yIGFuIGFzc2VydGlvbiBmYWlsdXJlIChtdWx0aXBsZSBwYXJlbnRzKS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UGFyZW50KCk6IE5vZGUgfCBudWxsIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3BhcmVudHMubGVuZ3RoIDw9IDEsICdDYW5ub3QgY2FsbCBnZXRQYXJlbnQgb24gYSBub2RlIHdpdGggbXVsdGlwbGUgcGFyZW50cycgKTtcclxuICAgIHJldHVybiB0aGlzLl9wYXJlbnRzLmxlbmd0aCA/IHRoaXMuX3BhcmVudHNbIDAgXSA6IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0UGFyZW50KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHBhcmVudCgpOiBOb2RlIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRQYXJlbnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGNoaWxkIGF0IGEgc3BlY2lmaWMgaW5kZXggaW50byB0aGUgY2hpbGRyZW4gYXJyYXkuXHJcbiAgICovXHJcbiAgcHVibGljIGdldENoaWxkQXQoIGluZGV4OiBudW1iZXIgKTogTm9kZSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY2hpbGRyZW5bIGluZGV4IF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGaW5kcyB0aGUgaW5kZXggb2YgYSBwYXJlbnQgTm9kZSBpbiB0aGUgcGFyZW50cyBhcnJheS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwYXJlbnQgLSBTaG91bGQgYmUgYSBwYXJlbnQgb2YgdGhpcyBub2RlLlxyXG4gICAqIEByZXR1cm5zIC0gQW4gaW5kZXggc3VjaCB0aGF0IHRoaXMucGFyZW50c1sgaW5kZXggXSA9PT0gcGFyZW50XHJcbiAgICovXHJcbiAgcHVibGljIGluZGV4T2ZQYXJlbnQoIHBhcmVudDogTm9kZSApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIF8uaW5kZXhPZiggdGhpcy5fcGFyZW50cywgcGFyZW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGaW5kcyB0aGUgaW5kZXggb2YgYSBjaGlsZCBOb2RlIGluIHRoZSBjaGlsZHJlbiBhcnJheS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjaGlsZCAtIFNob3VsZCBiZSBhIGNoaWxkIG9mIHRoaXMgbm9kZS5cclxuICAgKiBAcmV0dXJucyAtIEFuIGluZGV4IHN1Y2ggdGhhdCB0aGlzLmNoaWxkcmVuWyBpbmRleCBdID09PSBjaGlsZFxyXG4gICAqL1xyXG4gIHB1YmxpYyBpbmRleE9mQ2hpbGQoIGNoaWxkOiBOb2RlICk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gXy5pbmRleE9mKCB0aGlzLl9jaGlsZHJlbiwgY2hpbGQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmVzIHRoaXMgTm9kZSB0byB0aGUgZnJvbnQgKGVuZCkgb2YgYWxsIG9mIGl0cyBwYXJlbnRzIGNoaWxkcmVuIGFycmF5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBtb3ZlVG9Gcm9udCgpOiB0aGlzIHtcclxuICAgIF8uZWFjaCggdGhpcy5fcGFyZW50cy5zbGljZSgpLCBwYXJlbnQgPT4gcGFyZW50Lm1vdmVDaGlsZFRvRnJvbnQoIHRoaXMgKSApO1xyXG5cclxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZXMgb25lIG9mIG91ciBjaGlsZHJlbiB0byB0aGUgZnJvbnQgKGVuZCkgb2Ygb3VyIGNoaWxkcmVuIGFycmF5LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGNoaWxkIC0gT3VyIGNoaWxkIHRvIG1vdmUgdG8gdGhlIGZyb250LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBtb3ZlQ2hpbGRUb0Zyb250KCBjaGlsZDogTm9kZSApOiB0aGlzIHtcclxuICAgIHJldHVybiB0aGlzLm1vdmVDaGlsZFRvSW5kZXgoIGNoaWxkLCB0aGlzLl9jaGlsZHJlbi5sZW5ndGggLSAxICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlIHRoaXMgbm9kZSBvbmUgaW5kZXggZm9yd2FyZCBpbiBlYWNoIG9mIGl0cyBwYXJlbnRzLiAgSWYgdGhlIE5vZGUgaXMgYWxyZWFkeSBhdCB0aGUgZnJvbnQsIHRoaXMgaXMgYSBuby1vcC5cclxuICAgKi9cclxuICBwdWJsaWMgbW92ZUZvcndhcmQoKTogdGhpcyB7XHJcbiAgICB0aGlzLl9wYXJlbnRzLmZvckVhY2goIHBhcmVudCA9PiBwYXJlbnQubW92ZUNoaWxkRm9yd2FyZCggdGhpcyApICk7IC8vIFRPRE86IERvIHdlIG5lZWQgc2xpY2UgbGlrZSBtb3ZlVG9Gcm9udCBoYXM/XHJcbiAgICByZXR1cm4gdGhpczsgLy8gY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmVzIHRoZSBzcGVjaWZpZWQgY2hpbGQgZm9yd2FyZCBieSBvbmUgaW5kZXguICBJZiB0aGUgY2hpbGQgaXMgYWxyZWFkeSBhdCB0aGUgZnJvbnQsIHRoaXMgaXMgYSBuby1vcC5cclxuICAgKi9cclxuICBwdWJsaWMgbW92ZUNoaWxkRm9yd2FyZCggY2hpbGQ6IE5vZGUgKTogdGhpcyB7XHJcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuaW5kZXhPZkNoaWxkKCBjaGlsZCApO1xyXG4gICAgaWYgKCBpbmRleCA8IHRoaXMuZ2V0Q2hpbGRyZW5Db3VudCgpIC0gMSApIHtcclxuICAgICAgdGhpcy5tb3ZlQ2hpbGRUb0luZGV4KCBjaGlsZCwgaW5kZXggKyAxICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpczsgLy8gY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmUgdGhpcyBub2RlIG9uZSBpbmRleCBiYWNrd2FyZCBpbiBlYWNoIG9mIGl0cyBwYXJlbnRzLiAgSWYgdGhlIE5vZGUgaXMgYWxyZWFkeSBhdCB0aGUgYmFjaywgdGhpcyBpcyBhIG5vLW9wLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBtb3ZlQmFja3dhcmQoKTogdGhpcyB7XHJcbiAgICB0aGlzLl9wYXJlbnRzLmZvckVhY2goIHBhcmVudCA9PiBwYXJlbnQubW92ZUNoaWxkQmFja3dhcmQoIHRoaXMgKSApOyAvLyBUT0RPOiBEbyB3ZSBuZWVkIHNsaWNlIGxpa2UgbW92ZVRvRnJvbnQgaGFzP1xyXG4gICAgcmV0dXJuIHRoaXM7IC8vIGNoYWluaW5nXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlcyB0aGUgc3BlY2lmaWVkIGNoaWxkIGZvcndhcmQgYnkgb25lIGluZGV4LiAgSWYgdGhlIGNoaWxkIGlzIGFscmVhZHkgYXQgdGhlIGJhY2ssIHRoaXMgaXMgYSBuby1vcC5cclxuICAgKi9cclxuICBwdWJsaWMgbW92ZUNoaWxkQmFja3dhcmQoIGNoaWxkOiBOb2RlICk6IHRoaXMge1xyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmluZGV4T2ZDaGlsZCggY2hpbGQgKTtcclxuICAgIGlmICggaW5kZXggPiAwICkge1xyXG4gICAgICB0aGlzLm1vdmVDaGlsZFRvSW5kZXgoIGNoaWxkLCBpbmRleCAtIDEgKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzOyAvLyBjaGFpbmluZ1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZXMgdGhpcyBOb2RlIHRvIHRoZSBiYWNrIChmcm9udCkgb2YgYWxsIG9mIGl0cyBwYXJlbnRzIGNoaWxkcmVuIGFycmF5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBtb3ZlVG9CYWNrKCk6IHRoaXMge1xyXG4gICAgXy5lYWNoKCB0aGlzLl9wYXJlbnRzLnNsaWNlKCksIHBhcmVudCA9PiBwYXJlbnQubW92ZUNoaWxkVG9CYWNrKCB0aGlzICkgKTtcclxuXHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmVzIG9uZSBvZiBvdXIgY2hpbGRyZW4gdG8gdGhlIGJhY2sgKGZyb250KSBvZiBvdXIgY2hpbGRyZW4gYXJyYXkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gY2hpbGQgLSBPdXIgY2hpbGQgdG8gbW92ZSB0byB0aGUgYmFjay5cclxuICAgKi9cclxuICBwdWJsaWMgbW92ZUNoaWxkVG9CYWNrKCBjaGlsZDogTm9kZSApOiB0aGlzIHtcclxuICAgIHJldHVybiB0aGlzLm1vdmVDaGlsZFRvSW5kZXgoIGNoaWxkLCAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXBsYWNlIGEgY2hpbGQgaW4gdGhpcyBub2RlJ3MgY2hpbGRyZW4gYXJyYXkgd2l0aCBhbm90aGVyIG5vZGUuIElmIHRoZSBvbGQgY2hpbGQgaGFkIERPTSBmb2N1cyBhbmRcclxuICAgKiB0aGUgbmV3IGNoaWxkIGlzIGZvY3VzYWJsZSwgdGhlIG5ldyBjaGlsZCB3aWxsIHJlY2VpdmUgZm9jdXMgYWZ0ZXIgaXQgaXMgYWRkZWQuXHJcbiAgICovXHJcbiAgcHVibGljIHJlcGxhY2VDaGlsZCggb2xkQ2hpbGQ6IE5vZGUsIG5ld0NoaWxkOiBOb2RlICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5oYXNDaGlsZCggb2xkQ2hpbGQgKSwgJ0F0dGVtcHRlZCB0byByZXBsYWNlIGEgbm9kZSB0aGF0IHdhcyBub3QgYSBjaGlsZC4nICk7XHJcblxyXG4gICAgLy8gaW5mb3JtYXRpb24gdGhhdCBuZWVkcyB0byBiZSByZXN0b3JlZFxyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmluZGV4T2ZDaGlsZCggb2xkQ2hpbGQgKTtcclxuICAgIGNvbnN0IG9sZENoaWxkRm9jdXNlZCA9IG9sZENoaWxkLmZvY3VzZWQ7XHJcblxyXG4gICAgdGhpcy5yZW1vdmVDaGlsZCggb2xkQ2hpbGQsIHRydWUgKTtcclxuICAgIHRoaXMuaW5zZXJ0Q2hpbGQoIGluZGV4LCBuZXdDaGlsZCwgdHJ1ZSApO1xyXG5cclxuICAgIHRoaXMuY2hpbGRyZW5DaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcblxyXG4gICAgaWYgKCBvbGRDaGlsZEZvY3VzZWQgJiYgbmV3Q2hpbGQuZm9jdXNhYmxlICkge1xyXG4gICAgICBuZXdDaGlsZC5mb2N1cygpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyB0aGlzIE5vZGUgZnJvbSBhbGwgb2YgaXRzIHBhcmVudHMuXHJcbiAgICovXHJcbiAgcHVibGljIGRldGFjaCgpOiB0aGlzIHtcclxuICAgIF8uZWFjaCggdGhpcy5fcGFyZW50cy5zbGljZSggMCApLCBwYXJlbnQgPT4gcGFyZW50LnJlbW92ZUNoaWxkKCB0aGlzICkgKTtcclxuXHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSBvdXIgZXZlbnQgY291bnQsIHVzdWFsbHkgYnkgMSBvciAtMS4gU2VlIGRvY3VtZW50YXRpb24gb24gX2JvdW5kc0V2ZW50Q291bnQgaW4gY29uc3RydWN0b3IuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbiAtIEhvdyB0byBpbmNyZW1lbnQvZGVjcmVtZW50IHRoZSBib3VuZHMgZXZlbnQgbGlzdGVuZXIgY291bnRcclxuICAgKi9cclxuICBwcml2YXRlIGNoYW5nZUJvdW5kc0V2ZW50Q291bnQoIG46IG51bWJlciApOiB2b2lkIHtcclxuICAgIGlmICggbiAhPT0gMCApIHtcclxuICAgICAgY29uc3QgemVyb0JlZm9yZSA9IHRoaXMuX2JvdW5kc0V2ZW50Q291bnQgPT09IDA7XHJcblxyXG4gICAgICB0aGlzLl9ib3VuZHNFdmVudENvdW50ICs9IG47XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2JvdW5kc0V2ZW50Q291bnQgPj0gMCwgJ3N1YnRyZWUgYm91bmRzIGV2ZW50IGNvdW50IHNob3VsZCBiZSBndWFyYW50ZWVkIHRvIGJlID49IDAnICk7XHJcblxyXG4gICAgICBjb25zdCB6ZXJvQWZ0ZXIgPSB0aGlzLl9ib3VuZHNFdmVudENvdW50ID09PSAwO1xyXG5cclxuICAgICAgaWYgKCB6ZXJvQmVmb3JlICE9PSB6ZXJvQWZ0ZXIgKSB7XHJcbiAgICAgICAgLy8gcGFyZW50cyB3aWxsIG9ubHkgaGF2ZSB0aGVpciBjb3VudFxyXG4gICAgICAgIGNvbnN0IHBhcmVudERlbHRhID0gemVyb0JlZm9yZSA/IDEgOiAtMTtcclxuXHJcbiAgICAgICAgY29uc3QgbGVuID0gdGhpcy5fcGFyZW50cy5sZW5ndGg7XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XHJcbiAgICAgICAgICB0aGlzLl9wYXJlbnRzWyBpIF0uY2hhbmdlQm91bmRzRXZlbnRDb3VudCggcGFyZW50RGVsdGEgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEVuc3VyZXMgdGhhdCB0aGUgY2FjaGVkIHNlbGZCb3VuZHMgb2YgdGhpcyBOb2RlIGlzIGFjY3VyYXRlLiBSZXR1cm5zIHRydWUgaWYgYW55IHNvcnQgb2YgZGlydHkgZmxhZyB3YXMgc2V0XHJcbiAgICogYmVmb3JlIHRoaXMgd2FzIGNhbGxlZC5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIC0gV2FzIHRoZSBzZWxmLWJvdW5kcyBwb3RlbnRpYWxseSB1cGRhdGVkP1xyXG4gICAqL1xyXG4gIHB1YmxpYyB2YWxpZGF0ZVNlbGZCb3VuZHMoKTogYm9vbGVhbiB7XHJcbiAgICAvLyB2YWxpZGF0ZSBib3VuZHMgb2Ygb3Vyc2VsZiBpZiBuZWNlc3NhcnlcclxuICAgIGlmICggdGhpcy5fc2VsZkJvdW5kc0RpcnR5ICkge1xyXG4gICAgICBjb25zdCBvbGRTZWxmQm91bmRzID0gc2NyYXRjaEJvdW5kczIuc2V0KCB0aGlzLnNlbGZCb3VuZHNQcm9wZXJ0eS5fdmFsdWUgKTtcclxuXHJcbiAgICAgIC8vIFJlbHkgb24gYW4gb3ZlcmxvYWRhYmxlIG1ldGhvZCB0byBhY2NvbXBsaXNoIGNvbXB1dGluZyBvdXIgc2VsZiBib3VuZHMuIFRoaXMgc2hvdWxkIHVwZGF0ZVxyXG4gICAgICAvLyB0aGlzLnNlbGZCb3VuZHMgaXRzZWxmLCByZXR1cm5pbmcgd2hldGhlciBpdCB3YXMgYWN0dWFsbHkgY2hhbmdlZC4gSWYgaXQgZGlkbid0IGNoYW5nZSwgd2UgZG9uJ3Qgd2FudCB0b1xyXG4gICAgICAvLyBzZW5kIGEgJ3NlbGZCb3VuZHMnIGV2ZW50LlxyXG4gICAgICBjb25zdCBkaWRTZWxmQm91bmRzQ2hhbmdlID0gdGhpcy51cGRhdGVTZWxmQm91bmRzKCk7XHJcbiAgICAgIHRoaXMuX3NlbGZCb3VuZHNEaXJ0eSA9IGZhbHNlO1xyXG5cclxuICAgICAgaWYgKCBkaWRTZWxmQm91bmRzQ2hhbmdlICkge1xyXG4gICAgICAgIHRoaXMuc2VsZkJvdW5kc1Byb3BlcnR5Lm5vdGlmeUxpc3RlbmVycyggb2xkU2VsZkJvdW5kcyApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFbnN1cmVzIHRoYXQgY2FjaGVkIGJvdW5kcyBzdG9yZWQgb24gdGhpcyBOb2RlIChhbmQgYWxsIGNoaWxkcmVuKSBhcmUgYWNjdXJhdGUuIFJldHVybnMgdHJ1ZSBpZiBhbnkgc29ydCBvZiBkaXJ0eVxyXG4gICAqIGZsYWcgd2FzIHNldCBiZWZvcmUgdGhpcyB3YXMgY2FsbGVkLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgLSBXYXMgc29tZXRoaW5nIHBvdGVudGlhbGx5IHVwZGF0ZWQ/XHJcbiAgICovXHJcbiAgcHVibGljIHZhbGlkYXRlQm91bmRzKCk6IGJvb2xlYW4ge1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5ib3VuZHMgJiYgc2NlbmVyeUxvZy5ib3VuZHMoIGB2YWxpZGF0ZUJvdW5kcyAjJHt0aGlzLl9pZH1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuYm91bmRzICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGxldCBpO1xyXG4gICAgY29uc3Qgbm90aWZpY2F0aW9uVGhyZXNob2xkID0gMWUtMTM7XHJcblxyXG4gICAgbGV0IHdhc0RpcnR5QmVmb3JlID0gdGhpcy52YWxpZGF0ZVNlbGZCb3VuZHMoKTtcclxuXHJcbiAgICAvLyBXZSdyZSBnb2luZyB0byBkaXJlY3RseSBtdXRhdGUgdGhlc2UgaW5zdGFuY2VzXHJcbiAgICBjb25zdCBvdXJDaGlsZEJvdW5kcyA9IHRoaXMuY2hpbGRCb3VuZHNQcm9wZXJ0eS5fdmFsdWU7XHJcbiAgICBjb25zdCBvdXJMb2NhbEJvdW5kcyA9IHRoaXMubG9jYWxCb3VuZHNQcm9wZXJ0eS5fdmFsdWU7XHJcbiAgICBjb25zdCBvdXJTZWxmQm91bmRzID0gdGhpcy5zZWxmQm91bmRzUHJvcGVydHkuX3ZhbHVlO1xyXG4gICAgY29uc3Qgb3VyQm91bmRzID0gdGhpcy5ib3VuZHNQcm9wZXJ0eS5fdmFsdWU7XHJcblxyXG4gICAgLy8gdmFsaWRhdGUgYm91bmRzIG9mIGNoaWxkcmVuIGlmIG5lY2Vzc2FyeVxyXG4gICAgaWYgKCB0aGlzLl9jaGlsZEJvdW5kc0RpcnR5ICkge1xyXG4gICAgICB3YXNEaXJ0eUJlZm9yZSA9IHRydWU7XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuYm91bmRzICYmIHNjZW5lcnlMb2cuYm91bmRzKCAnY2hpbGRCb3VuZHMgZGlydHknICk7XHJcblxyXG4gICAgICAvLyBoYXZlIGVhY2ggY2hpbGQgdmFsaWRhdGUgdGhlaXIgb3duIGJvdW5kc1xyXG4gICAgICBpID0gdGhpcy5fY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgICB3aGlsZSAoIGktLSApIHtcclxuICAgICAgICBjb25zdCBjaGlsZCA9IHRoaXMuX2NoaWxkcmVuWyBpIF07XHJcblxyXG4gICAgICAgIC8vIFJlZW50cmFuY3kgbWlnaHQgY2F1c2UgdGhlIGNoaWxkIHRvIGJlIHJlbW92ZWRcclxuICAgICAgICBpZiAoIGNoaWxkICkge1xyXG4gICAgICAgICAgY2hpbGQudmFsaWRhdGVCb3VuZHMoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGFuZCByZWNvbXB1dGUgb3VyIGNoaWxkQm91bmRzXHJcbiAgICAgIGNvbnN0IG9sZENoaWxkQm91bmRzID0gc2NyYXRjaEJvdW5kczIuc2V0KCBvdXJDaGlsZEJvdW5kcyApOyAvLyBzdG9yZSBvbGQgdmFsdWUgaW4gYSB0ZW1wb3JhcnkgQm91bmRzMlxyXG4gICAgICBvdXJDaGlsZEJvdW5kcy5zZXQoIEJvdW5kczIuTk9USElORyApOyAvLyBpbml0aWFsaXplIHRvIGEgdmFsdWUgdGhhdCBjYW4gYmUgdW5pb25lZCB3aXRoIGluY2x1ZGVCb3VuZHMoKVxyXG5cclxuICAgICAgaSA9IHRoaXMuX2NoaWxkcmVuLmxlbmd0aDtcclxuICAgICAgd2hpbGUgKCBpLS0gKSB7XHJcbiAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLl9jaGlsZHJlblsgaSBdO1xyXG5cclxuICAgICAgICAvLyBSZWVudHJhbmN5IG1pZ2h0IGNhdXNlIHRoZSBjaGlsZCB0byBiZSByZW1vdmVkXHJcbiAgICAgICAgaWYgKCBjaGlsZCAmJiAhdGhpcy5fZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyB8fCBjaGlsZC5pc1Zpc2libGUoKSApIHtcclxuICAgICAgICAgIG91ckNoaWxkQm91bmRzLmluY2x1ZGVCb3VuZHMoIGNoaWxkLmJvdW5kcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcnVuIHRoaXMgYmVmb3JlIGZpcmluZyB0aGUgZXZlbnRcclxuICAgICAgdGhpcy5fY2hpbGRCb3VuZHNEaXJ0eSA9IGZhbHNlO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuYm91bmRzICYmIHNjZW5lcnlMb2cuYm91bmRzKCBgY2hpbGRCb3VuZHM6ICR7b3VyQ2hpbGRCb3VuZHN9YCApO1xyXG5cclxuICAgICAgaWYgKCAhb3VyQ2hpbGRCb3VuZHMuZXF1YWxzKCBvbGRDaGlsZEJvdW5kcyApICkge1xyXG4gICAgICAgIC8vIG5vdGlmaWVzIG9ubHkgb24gYW4gYWN0dWFsIGNoYW5nZVxyXG4gICAgICAgIGlmICggIW91ckNoaWxkQm91bmRzLmVxdWFsc0Vwc2lsb24oIG9sZENoaWxkQm91bmRzLCBub3RpZmljYXRpb25UaHJlc2hvbGQgKSApIHtcclxuICAgICAgICAgIHRoaXMuY2hpbGRCb3VuZHNQcm9wZXJ0eS5ub3RpZnlMaXN0ZW5lcnMoIG9sZENoaWxkQm91bmRzICk7IC8vIFJFLUVOVFJBTlQgQ0FMTCBIRVJFLCBpdCB3aWxsIHZhbGlkYXRlQm91bmRzKClcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFdBUk5JTkc6IFRoaW5rIHR3aWNlIGJlZm9yZSBhZGRpbmcgY29kZSBoZXJlIGJlbG93IHRoZSBsaXN0ZW5lciBub3RpZmljYXRpb24uIFRoZSBub3RpZnlMaXN0ZW5lcnMoKSBjYWxsIGNhblxyXG4gICAgICAvLyB0cmlnZ2VyIHJlLWVudHJhbmN5LCBzbyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIHdvcmsgd2hlbiB0aGF0IGhhcHBlbnMuIERPIE5PVCBzZXQgdGhpbmdzIGJhc2VkIG9uIGxvY2FsXHJcbiAgICAgIC8vIHZhcmlhYmxlcyBoZXJlLlxyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy5fbG9jYWxCb3VuZHNEaXJ0eSApIHtcclxuICAgICAgd2FzRGlydHlCZWZvcmUgPSB0cnVlO1xyXG5cclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLmJvdW5kcyAmJiBzY2VuZXJ5TG9nLmJvdW5kcyggJ2xvY2FsQm91bmRzIGRpcnR5JyApO1xyXG5cclxuICAgICAgdGhpcy5fbG9jYWxCb3VuZHNEaXJ0eSA9IGZhbHNlOyAvLyB3ZSBvbmx5IG5lZWQgdGhpcyB0byBzZXQgbG9jYWwgYm91bmRzIGFzIGRpcnR5XHJcblxyXG4gICAgICBjb25zdCBvbGRMb2NhbEJvdW5kcyA9IHNjcmF0Y2hCb3VuZHMyLnNldCggb3VyTG9jYWxCb3VuZHMgKTsgLy8gc3RvcmUgb2xkIHZhbHVlIGluIGEgdGVtcG9yYXJ5IEJvdW5kczJcclxuXHJcbiAgICAgIC8vIE9ubHkgYWRqdXN0IHRoZSBsb2NhbCBib3VuZHMgaWYgaXQgaXMgbm90IG92ZXJyaWRkZW5cclxuICAgICAgaWYgKCAhdGhpcy5fbG9jYWxCb3VuZHNPdmVycmlkZGVuICkge1xyXG4gICAgICAgIC8vIGxvY2FsIGJvdW5kcyBhcmUgYSB1bmlvbiBiZXR3ZWVuIG91ciBzZWxmIGJvdW5kcyBhbmQgY2hpbGQgYm91bmRzXHJcbiAgICAgICAgb3VyTG9jYWxCb3VuZHMuc2V0KCBvdXJTZWxmQm91bmRzICkuaW5jbHVkZUJvdW5kcyggb3VyQ2hpbGRCb3VuZHMgKTtcclxuXHJcbiAgICAgICAgLy8gYXBwbHkgY2xpcHBpbmcgdG8gdGhlIGJvdW5kcyBpZiB3ZSBoYXZlIGEgY2xpcCBhcmVhIChhbGwgZG9uZSBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSlcclxuICAgICAgICBjb25zdCBjbGlwQXJlYSA9IHRoaXMuY2xpcEFyZWE7XHJcbiAgICAgICAgaWYgKCBjbGlwQXJlYSApIHtcclxuICAgICAgICAgIG91ckxvY2FsQm91bmRzLmNvbnN0cmFpbkJvdW5kcyggY2xpcEFyZWEuYm91bmRzICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuYm91bmRzICYmIHNjZW5lcnlMb2cuYm91bmRzKCBgbG9jYWxCb3VuZHM6ICR7b3VyTG9jYWxCb3VuZHN9YCApO1xyXG5cclxuICAgICAgLy8gTk9URTogd2UgbmVlZCB0byB1cGRhdGUgbWF4IGRpbWVuc2lvbnMgc3RpbGwgZXZlbiBpZiB3ZSBhcmUgc2V0dGluZyBvdmVycmlkZGVuIGxvY2FsQm91bmRzXHJcbiAgICAgIC8vIGFkanVzdCBvdXIgdHJhbnNmb3JtIHRvIG1hdGNoIG1heGltdW0gYm91bmRzIGlmIG5lY2Vzc2FyeSBvbiBhIGxvY2FsIGJvdW5kcyBjaGFuZ2VcclxuICAgICAgaWYgKCB0aGlzLl9tYXhXaWR0aCAhPT0gbnVsbCB8fCB0aGlzLl9tYXhIZWlnaHQgIT09IG51bGwgKSB7XHJcbiAgICAgICAgLy8gbmVlZHMgdG8gcnVuIGJlZm9yZSBub3RpZmljYXRpb25zIGJlbG93LCBvdGhlcndpc2UgcmVlbnRyYW5jeSB0aGF0IGhpdHMgdGhpcyBjb2RlcGF0aCB3aWxsIGhhdmUgaXRzXHJcbiAgICAgICAgLy8gdXBkYXRlTWF4RGltZW5zaW9uIG92ZXJyaWRkZW4gYnkgdGhlIGV2ZW50dWFsIG9yaWdpbmFsIGZ1bmN0aW9uIGNhbGwsIHdpdGggdGhlIG5vdy1pbmNvcnJlY3QgbG9jYWwgYm91bmRzLlxyXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzcyNVxyXG4gICAgICAgIHRoaXMudXBkYXRlTWF4RGltZW5zaW9uKCBvdXJMb2NhbEJvdW5kcyApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoICFvdXJMb2NhbEJvdW5kcy5lcXVhbHMoIG9sZExvY2FsQm91bmRzICkgKSB7XHJcbiAgICAgICAgLy8gc2FuaXR5IGNoZWNrLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzEwNzEsIHdlJ3JlIHJ1bm5pbmcgdGhpcyBiZWZvcmUgdGhlIGxvY2FsQm91bmRzXHJcbiAgICAgICAgLy8gbGlzdGVuZXJzIGFyZSBub3RpZmllZCwgdG8gc3VwcG9ydCBsaW1pdGVkIHJlLWVudHJhbmNlLlxyXG4gICAgICAgIHRoaXMuX2JvdW5kc0RpcnR5ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYgKCAhb3VyTG9jYWxCb3VuZHMuZXF1YWxzRXBzaWxvbiggb2xkTG9jYWxCb3VuZHMsIG5vdGlmaWNhdGlvblRocmVzaG9sZCApICkge1xyXG4gICAgICAgICAgdGhpcy5sb2NhbEJvdW5kc1Byb3BlcnR5Lm5vdGlmeUxpc3RlbmVycyggb2xkTG9jYWxCb3VuZHMgKTsgLy8gUkUtRU5UUkFOVCBDQUxMIEhFUkUsIGl0IHdpbGwgdmFsaWRhdGVCb3VuZHMoKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gV0FSTklORzogVGhpbmsgdHdpY2UgYmVmb3JlIGFkZGluZyBjb2RlIGhlcmUgYmVsb3cgdGhlIGxpc3RlbmVyIG5vdGlmaWNhdGlvbi4gVGhlIG5vdGlmeUxpc3RlbmVycygpIGNhbGwgY2FuXHJcbiAgICAgIC8vIHRyaWdnZXIgcmUtZW50cmFuY3ksIHNvIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gd29yayB3aGVuIHRoYXQgaGFwcGVucy4gRE8gTk9UIHNldCB0aGluZ3MgYmFzZWQgb24gbG9jYWxcclxuICAgICAgLy8gdmFyaWFibGVzIGhlcmUuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETzogbGF5b3V0IGhlcmU/XHJcblxyXG4gICAgaWYgKCB0aGlzLl9ib3VuZHNEaXJ0eSApIHtcclxuICAgICAgd2FzRGlydHlCZWZvcmUgPSB0cnVlO1xyXG5cclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLmJvdW5kcyAmJiBzY2VuZXJ5TG9nLmJvdW5kcyggJ2JvdW5kcyBkaXJ0eScgKTtcclxuXHJcbiAgICAgIC8vIHJ1biB0aGlzIGJlZm9yZSBmaXJpbmcgdGhlIGV2ZW50XHJcbiAgICAgIHRoaXMuX2JvdW5kc0RpcnR5ID0gZmFsc2U7XHJcblxyXG4gICAgICBjb25zdCBvbGRCb3VuZHMgPSBzY3JhdGNoQm91bmRzMi5zZXQoIG91ckJvdW5kcyApOyAvLyBzdG9yZSBvbGQgdmFsdWUgaW4gYSB0ZW1wb3JhcnkgQm91bmRzMlxyXG5cclxuICAgICAgLy8gbm8gbmVlZCB0byBkbyB0aGUgbW9yZSBleHBlbnNpdmUgYm91bmRzIHRyYW5zZm9ybWF0aW9uIGlmIHdlIGFyZSBzdGlsbCBheGlzLWFsaWduZWRcclxuICAgICAgaWYgKCB0aGlzLl90cmFuc2Zvcm1Cb3VuZHMgJiYgIXRoaXMuX3RyYW5zZm9ybS5nZXRNYXRyaXgoKS5pc0F4aXNBbGlnbmVkKCkgKSB7XHJcbiAgICAgICAgLy8gbXV0YXRlcyB0aGUgbWF0cml4IGFuZCBib3VuZHMgZHVyaW5nIHJlY3Vyc2lvblxyXG5cclxuICAgICAgICBjb25zdCBtYXRyaXggPSBzY3JhdGNoTWF0cml4My5zZXQoIHRoaXMuZ2V0TWF0cml4KCkgKTsgLy8gY2FsbHMgYmVsb3cgbXV0YXRlIHRoaXMgbWF0cml4XHJcbiAgICAgICAgb3VyQm91bmRzLnNldCggQm91bmRzMi5OT1RISU5HICk7XHJcbiAgICAgICAgLy8gSW5jbHVkZSBlYWNoIHBhaW50ZWQgc2VsZiBpbmRpdmlkdWFsbHksIHRyYW5zZm9ybWVkIHdpdGggdGhlIGV4YWN0IHRyYW5zZm9ybSBtYXRyaXguXHJcbiAgICAgICAgLy8gVGhpcyBpcyBleHBlbnNpdmUsIGFzIHdlIGhhdmUgdG8gZG8gMiBtYXRyaXggdHJhbnNmb3JtcyBmb3IgZXZlcnkgZGVzY2VuZGFudC5cclxuICAgICAgICB0aGlzLl9pbmNsdWRlVHJhbnNmb3JtZWRTdWJ0cmVlQm91bmRzKCBtYXRyaXgsIG91ckJvdW5kcyApOyAvLyBzZWxmIGFuZCBjaGlsZHJlblxyXG5cclxuICAgICAgICBjb25zdCBjbGlwQXJlYSA9IHRoaXMuY2xpcEFyZWE7XHJcbiAgICAgICAgaWYgKCBjbGlwQXJlYSApIHtcclxuICAgICAgICAgIG91ckJvdW5kcy5jb25zdHJhaW5Cb3VuZHMoIGNsaXBBcmVhLmdldEJvdW5kc1dpdGhUcmFuc2Zvcm0oIG1hdHJpeCApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIGNvbnZlcnRzIGxvY2FsIHRvIHBhcmVudCBib3VuZHMuIG11dGFibGUgbWV0aG9kcyB1c2VkIHRvIG1pbmltaXplIG51bWJlciBvZiBjcmVhdGVkIGJvdW5kcyBpbnN0YW5jZXNcclxuICAgICAgICAvLyAod2UgY3JlYXRlIG9uZSBzbyB3ZSBkb24ndCBjaGFuZ2UgcmVmZXJlbmNlcyB0byB0aGUgb2xkIG9uZSlcclxuICAgICAgICBvdXJCb3VuZHMuc2V0KCBvdXJMb2NhbEJvdW5kcyApO1xyXG4gICAgICAgIHRoaXMudHJhbnNmb3JtQm91bmRzRnJvbUxvY2FsVG9QYXJlbnQoIG91ckJvdW5kcyApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuYm91bmRzICYmIHNjZW5lcnlMb2cuYm91bmRzKCBgYm91bmRzOiAke291ckJvdW5kc31gICk7XHJcblxyXG4gICAgICBpZiAoICFvdXJCb3VuZHMuZXF1YWxzKCBvbGRCb3VuZHMgKSApIHtcclxuICAgICAgICAvLyBpZiB3ZSBoYXZlIGEgYm91bmRzIGNoYW5nZSwgd2UgbmVlZCB0byBpbnZhbGlkYXRlIG91ciBwYXJlbnRzIHNvIHRoZXkgY2FuIGJlIHJlY29tcHV0ZWRcclxuICAgICAgICBpID0gdGhpcy5fcGFyZW50cy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUgKCBpLS0gKSB7XHJcbiAgICAgICAgICB0aGlzLl9wYXJlbnRzWyBpIF0uaW52YWxpZGF0ZUJvdW5kcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVE9ETzogY29uc2lkZXIgY2hhbmdpbmcgdG8gcGFyYW1ldGVyIG9iamVjdCAodGhhdCBtYXkgYmUgYSBwcm9ibGVtIGZvciB0aGUgR0Mgb3ZlcmhlYWQpXHJcbiAgICAgICAgaWYgKCAhb3VyQm91bmRzLmVxdWFsc0Vwc2lsb24oIG9sZEJvdW5kcywgbm90aWZpY2F0aW9uVGhyZXNob2xkICkgKSB7XHJcbiAgICAgICAgICB0aGlzLmJvdW5kc1Byb3BlcnR5Lm5vdGlmeUxpc3RlbmVycyggb2xkQm91bmRzICk7IC8vIFJFLUVOVFJBTlQgQ0FMTCBIRVJFLCBpdCB3aWxsIHZhbGlkYXRlQm91bmRzKClcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFdBUk5JTkc6IFRoaW5rIHR3aWNlIGJlZm9yZSBhZGRpbmcgY29kZSBoZXJlIGJlbG93IHRoZSBsaXN0ZW5lciBub3RpZmljYXRpb24uIFRoZSBub3RpZnlMaXN0ZW5lcnMoKSBjYWxsIGNhblxyXG4gICAgICAvLyB0cmlnZ2VyIHJlLWVudHJhbmN5LCBzbyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIHdvcmsgd2hlbiB0aGF0IGhhcHBlbnMuIERPIE5PVCBzZXQgdGhpbmdzIGJhc2VkIG9uIGxvY2FsXHJcbiAgICAgIC8vIHZhcmlhYmxlcyBoZXJlLlxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIHRoZXJlIHdlcmUgc2lkZS1lZmZlY3RzLCBydW4gdGhlIHZhbGlkYXRpb24gYWdhaW4gdW50aWwgd2UgYXJlIGNsZWFuXHJcbiAgICBpZiAoIHRoaXMuX2NoaWxkQm91bmRzRGlydHkgfHwgdGhpcy5fYm91bmRzRGlydHkgKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5ib3VuZHMgJiYgc2NlbmVyeUxvZy5ib3VuZHMoICdyZXZhbGlkYXRpb24nICk7XHJcblxyXG4gICAgICAvLyBUT0RPOiBpZiB0aGVyZSBhcmUgc2lkZS1lZmZlY3RzIGluIGxpc3RlbmVycywgdGhpcyBjb3VsZCBvdmVyZmxvdyB0aGUgc3RhY2suIHdlIHNob3VsZCByZXBvcnQgYW4gZXJyb3JcclxuICAgICAgLy8gaW5zdGVhZCBvZiBsb2NraW5nIHVwXHJcbiAgICAgIHRoaXMudmFsaWRhdGVCb3VuZHMoKTsgLy8gUkUtRU5UUkFOVCBDQUxMIEhFUkUsIGl0IHdpbGwgdmFsaWRhdGVCb3VuZHMoKVxyXG4gICAgfVxyXG5cclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICBhc3NlcnQoIHRoaXMuX29yaWdpbmFsQm91bmRzID09PSB0aGlzLmJvdW5kc1Byb3BlcnR5Ll92YWx1ZSwgJ1JlZmVyZW5jZSBmb3IgYm91bmRzIGNoYW5nZWQhJyApO1xyXG4gICAgICBhc3NlcnQoIHRoaXMuX29yaWdpbmFsTG9jYWxCb3VuZHMgPT09IHRoaXMubG9jYWxCb3VuZHNQcm9wZXJ0eS5fdmFsdWUsICdSZWZlcmVuY2UgZm9yIGxvY2FsQm91bmRzIGNoYW5nZWQhJyApO1xyXG4gICAgICBhc3NlcnQoIHRoaXMuX29yaWdpbmFsU2VsZkJvdW5kcyA9PT0gdGhpcy5zZWxmQm91bmRzUHJvcGVydHkuX3ZhbHVlLCAnUmVmZXJlbmNlIGZvciBzZWxmQm91bmRzIGNoYW5nZWQhJyApO1xyXG4gICAgICBhc3NlcnQoIHRoaXMuX29yaWdpbmFsQ2hpbGRCb3VuZHMgPT09IHRoaXMuY2hpbGRCb3VuZHNQcm9wZXJ0eS5fdmFsdWUsICdSZWZlcmVuY2UgZm9yIGNoaWxkQm91bmRzIGNoYW5nZWQhJyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGRvdWJsZS1jaGVjayB0aGF0IGFsbCBvZiBvdXIgYm91bmRzIGhhbmRsaW5nIGhhcyBiZWVuIGFjY3VyYXRlXHJcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XHJcbiAgICAgIC8vIG5ldyBzY29wZSBmb3Igc2FmZXR5XHJcbiAgICAgICggKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGVwc2lsb24gPSAwLjAwMDAwMTtcclxuXHJcbiAgICAgICAgY29uc3QgY2hpbGRCb3VuZHMgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpO1xyXG4gICAgICAgIF8uZWFjaCggdGhpcy5fY2hpbGRyZW4sIGNoaWxkID0+IHtcclxuICAgICAgICAgIGlmICggIXRoaXMuX2V4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMgfHwgY2hpbGQuaXNWaXNpYmxlKCkgKSB7XHJcbiAgICAgICAgICAgIGNoaWxkQm91bmRzLmluY2x1ZGVCb3VuZHMoIGNoaWxkLmJvdW5kc1Byb3BlcnR5Ll92YWx1ZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgbGV0IGxvY2FsQm91bmRzID0gdGhpcy5zZWxmQm91bmRzUHJvcGVydHkuX3ZhbHVlLnVuaW9uKCBjaGlsZEJvdW5kcyApO1xyXG5cclxuICAgICAgICBjb25zdCBjbGlwQXJlYSA9IHRoaXMuY2xpcEFyZWE7XHJcbiAgICAgICAgaWYgKCBjbGlwQXJlYSApIHtcclxuICAgICAgICAgIGxvY2FsQm91bmRzID0gbG9jYWxCb3VuZHMuaW50ZXJzZWN0aW9uKCBjbGlwQXJlYS5ib3VuZHMgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGZ1bGxCb3VuZHMgPSB0aGlzLmxvY2FsVG9QYXJlbnRCb3VuZHMoIGxvY2FsQm91bmRzICk7XHJcblxyXG4gICAgICAgIGFzc2VydFNsb3cgJiYgYXNzZXJ0U2xvdyggdGhpcy5jaGlsZEJvdW5kc1Byb3BlcnR5Ll92YWx1ZS5lcXVhbHNFcHNpbG9uKCBjaGlsZEJvdW5kcywgZXBzaWxvbiApLFxyXG4gICAgICAgICAgYENoaWxkIGJvdW5kcyBtaXNtYXRjaCBhZnRlciB2YWxpZGF0ZUJvdW5kczogJHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZEJvdW5kc1Byb3BlcnR5Ll92YWx1ZS50b1N0cmluZygpfSwgZXhwZWN0ZWQ6ICR7Y2hpbGRCb3VuZHMudG9TdHJpbmcoKX1gICk7XHJcbiAgICAgICAgYXNzZXJ0U2xvdyAmJiBhc3NlcnRTbG93KCB0aGlzLl9sb2NhbEJvdW5kc092ZXJyaWRkZW4gfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RyYW5zZm9ybUJvdW5kcyB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ib3VuZHNQcm9wZXJ0eS5fdmFsdWUuZXF1YWxzRXBzaWxvbiggZnVsbEJvdW5kcywgZXBzaWxvbiApLFxyXG4gICAgICAgICAgYEJvdW5kcyBtaXNtYXRjaCBhZnRlciB2YWxpZGF0ZUJvdW5kczogJHt0aGlzLmJvdW5kc1Byb3BlcnR5Ll92YWx1ZS50b1N0cmluZygpXHJcbiAgICAgICAgICB9LCBleHBlY3RlZDogJHtmdWxsQm91bmRzLnRvU3RyaW5nKCl9LiBUaGlzIGNvdWxkIGhhdmUgaGFwcGVuZWQgaWYgYSBib3VuZHMgaW5zdGFuY2Ugb3duZWQgYnkgYSBOb2RlYCArXHJcbiAgICAgICAgICAnIHdhcyBkaXJlY3RseSBtdXRhdGVkIChlLmcuIGJvdW5kcy5lcm9kZSgpKScgKTtcclxuICAgICAgfSApKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLmJvdW5kcyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG5cclxuICAgIHJldHVybiB3YXNEaXJ0eUJlZm9yZTsgLy8gd2hldGhlciBhbnkgZGlydHkgZmxhZ3Mgd2VyZSBzZXRcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlY3Vyc2lvbiBmb3IgYWNjdXJhdGUgdHJhbnNmb3JtZWQgYm91bmRzIGhhbmRsaW5nLiBNdXRhdGVzIGJvdW5kcyB3aXRoIHRoZSBhZGRlZCBib3VuZHMuXHJcbiAgICogTXV0YXRlcyB0aGUgbWF0cml4IChwYXJhbWV0ZXIpLCBidXQgbXV0YXRlcyBpdCBiYWNrIHRvIHRoZSBzdGFydGluZyBwb2ludCAod2l0aGluIGZsb2F0aW5nLXBvaW50IGVycm9yKS5cclxuICAgKi9cclxuICBwcml2YXRlIF9pbmNsdWRlVHJhbnNmb3JtZWRTdWJ0cmVlQm91bmRzKCBtYXRyaXg6IE1hdHJpeDMsIGJvdW5kczogQm91bmRzMiApOiBCb3VuZHMyIHtcclxuICAgIGlmICggIXRoaXMuc2VsZkJvdW5kcy5pc0VtcHR5KCkgKSB7XHJcbiAgICAgIGJvdW5kcy5pbmNsdWRlQm91bmRzKCB0aGlzLmdldFRyYW5zZm9ybWVkU2VsZkJvdW5kcyggbWF0cml4ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBudW1DaGlsZHJlbiA9IHRoaXMuX2NoaWxkcmVuLmxlbmd0aDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bUNoaWxkcmVuOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGNoaWxkID0gdGhpcy5fY2hpbGRyZW5bIGkgXTtcclxuXHJcbiAgICAgIG1hdHJpeC5tdWx0aXBseU1hdHJpeCggY2hpbGQuX3RyYW5zZm9ybS5nZXRNYXRyaXgoKSApO1xyXG4gICAgICBjaGlsZC5faW5jbHVkZVRyYW5zZm9ybWVkU3VidHJlZUJvdW5kcyggbWF0cml4LCBib3VuZHMgKTtcclxuICAgICAgbWF0cml4Lm11bHRpcGx5TWF0cml4KCBjaGlsZC5fdHJhbnNmb3JtLmdldEludmVyc2UoKSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBib3VuZHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmF2ZXJzZXMgdGhpcyBzdWJ0cmVlIGFuZCB2YWxpZGF0ZXMgYm91bmRzIG9ubHkgZm9yIHN1YnRyZWVzIHRoYXQgaGF2ZSBib3VuZHMgbGlzdGVuZXJzICh0cnlpbmcgdG8gZXhjbHVkZSBhc1xyXG4gICAqIG11Y2ggYXMgcG9zc2libGUgZm9yIHBlcmZvcm1hbmNlKS4gVGhpcyBpcyBkb25lIHNvIHRoYXQgd2UgY2FuIGRvIHRoZSBtaW5pbXVtIGJvdW5kcyB2YWxpZGF0aW9uIHRvIHByZXZlbnQgYW55XHJcbiAgICogYm91bmRzIGxpc3RlbmVycyBmcm9tIGJlaW5nIHRyaWdnZXJlZCBpbiBmdXJ0aGVyIHZhbGlkYXRlQm91bmRzKCkgY2FsbHMgd2l0aG91dCBvdGhlciBOb2RlIGNoYW5nZXMgYmVpbmcgZG9uZS5cclxuICAgKiBUaGlzIGlzIHJlcXVpcmVkIGZvciBEaXNwbGF5J3MgYXRvbWljIChub24tcmVlbnRyYW50KSB1cGRhdGVEaXNwbGF5KCksIHNvIHRoYXQgd2UgZG9uJ3QgYWNjaWRlbnRhbGx5IHRyaWdnZXJcclxuICAgKiBib3VuZHMgbGlzdGVuZXJzIHdoaWxlIGNvbXB1dGluZyBib3VuZHMgZHVyaW5nIHVwZGF0ZURpc3BsYXkoKS4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBOT1RFOiB0aGlzIHNob3VsZCBwYXNzIGJ5IChpZ25vcmUpIGFueSBvdmVycmlkZGVuIGxvY2FsQm91bmRzLCB0byB0cmlnZ2VyIGxpc3RlbmVycyBiZWxvdy5cclxuICAgKi9cclxuICBwdWJsaWMgdmFsaWRhdGVXYXRjaGVkQm91bmRzKCk6IHZvaWQge1xyXG4gICAgLy8gU2luY2UgYSBib3VuZHMgbGlzdGVuZXIgb24gb25lIG9mIHRoZSByb290cyBjb3VsZCBpbnZhbGlkYXRlIGJvdW5kcyBvbiB0aGUgb3RoZXIsIHdlIG5lZWQgdG8ga2VlcCBydW5uaW5nIHRoaXNcclxuICAgIC8vIHVudGlsIHRoZXkgYXJlIGFsbCBjbGVhbi4gT3RoZXJ3aXNlLCBzaWRlLWVmZmVjdHMgY291bGQgb2NjdXIgZnJvbSBib3VuZHMgdmFsaWRhdGlvbnNcclxuICAgIC8vIFRPRE86IGNvbnNpZGVyIGEgd2F5IHRvIHByZXZlbnQgaW5maW5pdGUgbG9vcHMgaGVyZSB0aGF0IG9jY3VyIGR1ZSB0byBib3VuZHMgbGlzdGVuZXJzIHRyaWdnZXJpbmcgY3ljbGVzXHJcbiAgICB3aGlsZSAoIHRoaXMud2F0Y2hlZEJvdW5kc1NjYW4oKSApIHtcclxuICAgICAgLy8gZG8gbm90aGluZ1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVjdXJzaXZlIGZ1bmN0aW9uIGZvciB2YWxpZGF0ZVdhdGNoZWRCb3VuZHMuIFJldHVybmVkIHdoZXRoZXIgYW55IHZhbGlkYXRlQm91bmRzKCkgcmV0dXJuZWQgdHJ1ZSAobWVhbnMgd2UgaGF2ZVxyXG4gICAqIHRvIHRyYXZlcnNlIGFnYWluKSAtIHNjZW5lcnktaW50ZXJuYWxcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIC0gV2hldGhlciB0aGVyZSBjb3VsZCBoYXZlIGJlZW4gYW55IGNoYW5nZXMuXHJcbiAgICovXHJcbiAgcHVibGljIHdhdGNoZWRCb3VuZHNTY2FuKCk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCB0aGlzLl9ib3VuZHNFdmVudFNlbGZDb3VudCAhPT0gMCApIHtcclxuICAgICAgLy8gd2UgYXJlIGEgcm9vdCB0aGF0IHNob3VsZCBiZSB2YWxpZGF0ZWQuIHJldHVybiB3aGV0aGVyIHdlIHVwZGF0ZWQgYW55dGhpbmdcclxuICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGVCb3VuZHMoKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLl9ib3VuZHNFdmVudENvdW50ID4gMCAmJiB0aGlzLl9jaGlsZEJvdW5kc0RpcnR5ICkge1xyXG4gICAgICAvLyBkZXNjZW5kYW50cyBoYXZlIHdhdGNoZWQgYm91bmRzLCB0cmF2ZXJzZSFcclxuICAgICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcclxuICAgICAgY29uc3QgbnVtQ2hpbGRyZW4gPSB0aGlzLl9jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bUNoaWxkcmVuOyBpKysgKSB7XHJcbiAgICAgICAgY2hhbmdlZCA9IHRoaXMuX2NoaWxkcmVuWyBpIF0ud2F0Y2hlZEJvdW5kc1NjYW4oKSB8fCBjaGFuZ2VkO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjaGFuZ2VkO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIGlmIF9ib3VuZHNFdmVudENvdW50IGlzIHplcm8sIG5vIGJvdW5kcyBhcmUgd2F0Y2hlZCBiZWxvdyB1cyAoZG9uJ3QgdHJhdmVyc2UpLCBhbmQgaXQgd2Fzbid0IGNoYW5nZWRcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFya3MgdGhlIGJvdW5kcyBvZiB0aGlzIE5vZGUgYXMgaW52YWxpZCwgc28gdGhleSBhcmUgcmVjb21wdXRlZCBiZWZvcmUgYmVpbmcgYWNjZXNzZWQgYWdhaW4uXHJcbiAgICovXHJcbiAgcHVibGljIGludmFsaWRhdGVCb3VuZHMoKTogdm9pZCB7XHJcbiAgICAvLyBUT0RPOiBzb21ldGltZXMgd2Ugd29uJ3QgbmVlZCB0byBpbnZhbGlkYXRlIGxvY2FsIGJvdW5kcyEgaXQncyBub3QgdG9vIG11Y2ggb2YgYSBoYXNzbGUgdGhvdWdoP1xyXG4gICAgdGhpcy5fYm91bmRzRGlydHkgPSB0cnVlO1xyXG4gICAgdGhpcy5fbG9jYWxCb3VuZHNEaXJ0eSA9IHRydWU7XHJcblxyXG4gICAgLy8gYW5kIHNldCBmbGFncyBmb3IgYWxsIGFuY2VzdG9yc1xyXG4gICAgbGV0IGkgPSB0aGlzLl9wYXJlbnRzLmxlbmd0aDtcclxuICAgIHdoaWxlICggaS0tICkge1xyXG4gICAgICB0aGlzLl9wYXJlbnRzWyBpIF0uaW52YWxpZGF0ZUNoaWxkQm91bmRzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWN1cnNpdmVseSB0YWcgYWxsIGFuY2VzdG9ycyB3aXRoIF9jaGlsZEJvdW5kc0RpcnR5IChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBpbnZhbGlkYXRlQ2hpbGRCb3VuZHMoKTogdm9pZCB7XHJcbiAgICAvLyBkb24ndCBib3RoZXIgdXBkYXRpbmcgaWYgd2UndmUgYWxyZWFkeSBiZWVuIHRhZ2dlZFxyXG4gICAgaWYgKCAhdGhpcy5fY2hpbGRCb3VuZHNEaXJ0eSApIHtcclxuICAgICAgdGhpcy5fY2hpbGRCb3VuZHNEaXJ0eSA9IHRydWU7XHJcbiAgICAgIHRoaXMuX2xvY2FsQm91bmRzRGlydHkgPSB0cnVlO1xyXG4gICAgICBsZXQgaSA9IHRoaXMuX3BhcmVudHMubGVuZ3RoO1xyXG4gICAgICB3aGlsZSAoIGktLSApIHtcclxuICAgICAgICB0aGlzLl9wYXJlbnRzWyBpIF0uaW52YWxpZGF0ZUNoaWxkQm91bmRzKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNob3VsZCBiZSBjYWxsZWQgdG8gbm90aWZ5IHRoYXQgb3VyIHNlbGZCb3VuZHMgbmVlZHMgdG8gY2hhbmdlIHRvIHRoaXMgbmV3IHZhbHVlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpbnZhbGlkYXRlU2VsZiggbmV3U2VsZkJvdW5kcz86IEJvdW5kczIgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBuZXdTZWxmQm91bmRzID09PSB1bmRlZmluZWQgfHwgbmV3U2VsZkJvdW5kcyBpbnN0YW5jZW9mIEJvdW5kczIsXHJcbiAgICAgICdpbnZhbGlkYXRlU2VsZlxcJ3MgbmV3U2VsZkJvdW5kcywgaWYgcHJvdmlkZWQsIG5lZWRzIHRvIGJlIEJvdW5kczInICk7XHJcblxyXG4gICAgY29uc3Qgb3VyU2VsZkJvdW5kcyA9IHRoaXMuc2VsZkJvdW5kc1Byb3BlcnR5Ll92YWx1ZTtcclxuXHJcbiAgICAvLyBJZiBubyBzZWxmIGJvdW5kcyBhcmUgcHJvdmlkZWQsIHJlbHkgb24gdGhlIGJvdW5kcyB2YWxpZGF0aW9uIHRvIHRyaWdnZXIgY29tcHV0YXRpb24gKHVzaW5nIHVwZGF0ZVNlbGZCb3VuZHMoKSkuXHJcbiAgICBpZiAoICFuZXdTZWxmQm91bmRzICkge1xyXG4gICAgICB0aGlzLl9zZWxmQm91bmRzRGlydHkgPSB0cnVlO1xyXG4gICAgICB0aGlzLmludmFsaWRhdGVCb3VuZHMoKTtcclxuICAgICAgdGhpcy5fcGlja2VyLm9uU2VsZkJvdW5kc0RpcnR5KCk7XHJcbiAgICB9XHJcbiAgICAvLyBPdGhlcndpc2UsIHNldCB0aGUgc2VsZiBib3VuZHMgZGlyZWN0bHlcclxuICAgIGVsc2Uge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBuZXdTZWxmQm91bmRzLmlzRW1wdHkoKSB8fCBuZXdTZWxmQm91bmRzLmlzRmluaXRlKCksICdCb3VuZHMgbXVzdCBiZSBlbXB0eSBvciBmaW5pdGUgaW4gaW52YWxpZGF0ZVNlbGYnICk7XHJcblxyXG4gICAgICAvLyBEb24ndCByZWNvbXB1dGUgdGhlIHNlbGYgYm91bmRzXHJcbiAgICAgIHRoaXMuX3NlbGZCb3VuZHNEaXJ0eSA9IGZhbHNlO1xyXG5cclxuICAgICAgLy8gaWYgdGhlc2UgYm91bmRzIGFyZSBkaWZmZXJlbnQgdGhhbiBjdXJyZW50IHNlbGYgYm91bmRzXHJcbiAgICAgIGlmICggIW91clNlbGZCb3VuZHMuZXF1YWxzKCBuZXdTZWxmQm91bmRzICkgKSB7XHJcbiAgICAgICAgY29uc3Qgb2xkU2VsZkJvdW5kcyA9IHNjcmF0Y2hCb3VuZHMyLnNldCggb3VyU2VsZkJvdW5kcyApO1xyXG5cclxuICAgICAgICAvLyBzZXQgcmVwYWludCBmbGFnc1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZUJvdW5kcygpO1xyXG4gICAgICAgIHRoaXMuX3BpY2tlci5vblNlbGZCb3VuZHNEaXJ0eSgpO1xyXG5cclxuICAgICAgICAvLyByZWNvcmQgdGhlIG5ldyBib3VuZHNcclxuICAgICAgICBvdXJTZWxmQm91bmRzLnNldCggbmV3U2VsZkJvdW5kcyApO1xyXG5cclxuICAgICAgICAvLyBmaXJlIHRoZSBldmVudCBpbW1lZGlhdGVseVxyXG4gICAgICAgIHRoaXMuc2VsZkJvdW5kc1Byb3BlcnR5Lm5vdGlmeUxpc3RlbmVycyggb2xkU2VsZkJvdW5kcyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9waWNrZXIuYXVkaXQoKTsgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWVhbnQgdG8gYmUgb3ZlcnJpZGRlbiBieSBOb2RlIHN1Yi10eXBlcyB0byBjb21wdXRlIHNlbGYgYm91bmRzIChpZiBpbnZhbGlkYXRlU2VsZigpIHdpdGggbm8gYXJndW1lbnRzIHdhcyBjYWxsZWQpLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgLSBXaGV0aGVyIHRoZSBzZWxmIGJvdW5kcyBjaGFuZ2VkLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCB1cGRhdGVTZWxmQm91bmRzKCk6IGJvb2xlYW4ge1xyXG4gICAgLy8gVGhlIE5vZGUgaW1wbGVtZW50YXRpb24gKHVuLW92ZXJyaWRkZW4pIHdpbGwgbmV2ZXIgY2hhbmdlIHRoZSBzZWxmIGJvdW5kcyAoYWx3YXlzIE5PVEhJTkcpLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zZWxmQm91bmRzUHJvcGVydHkuX3ZhbHVlLmVxdWFscyggQm91bmRzMi5OT1RISU5HICkgKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBhIE5vZGUgaXMgYSBjaGlsZCBvZiB0aGlzIG5vZGUuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyAtIFdoZXRoZXIgcG90ZW50aWFsQ2hpbGQgaXMgYWN0dWFsbHkgb3VyIGNoaWxkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBoYXNDaGlsZCggcG90ZW50aWFsQ2hpbGQ6IE5vZGUgKTogYm9vbGVhbiB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb3RlbnRpYWxDaGlsZCAmJiAoIHBvdGVudGlhbENoaWxkIGluc3RhbmNlb2YgTm9kZSApLCAnaGFzQ2hpbGQgbmVlZHMgdG8gYmUgY2FsbGVkIHdpdGggYSBOb2RlJyApO1xyXG4gICAgY29uc3QgaXNPdXJDaGlsZCA9IF8uaW5jbHVkZXMoIHRoaXMuX2NoaWxkcmVuLCBwb3RlbnRpYWxDaGlsZCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNPdXJDaGlsZCA9PT0gXy5pbmNsdWRlcyggcG90ZW50aWFsQ2hpbGQuX3BhcmVudHMsIHRoaXMgKSwgJ2NoaWxkLXBhcmVudCByZWZlcmVuY2Ugc2hvdWxkIG1hdGNoIHBhcmVudC1jaGlsZCByZWZlcmVuY2UnICk7XHJcbiAgICByZXR1cm4gaXNPdXJDaGlsZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBTaGFwZSB0aGF0IHJlcHJlc2VudHMgdGhlIGFyZWEgY292ZXJlZCBieSBjb250YWluc1BvaW50U2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0U2VsZlNoYXBlKCk6IFNoYXBlIHtcclxuICAgIGNvbnN0IHNlbGZCb3VuZHMgPSB0aGlzLnNlbGZCb3VuZHM7XHJcbiAgICBpZiAoIHNlbGZCb3VuZHMuaXNFbXB0eSgpICkge1xyXG4gICAgICByZXR1cm4gbmV3IFNoYXBlKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIFNoYXBlLmJvdW5kcyggdGhpcy5zZWxmQm91bmRzICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIG91ciBzZWxmQm91bmRzICh0aGUgYm91bmRzIGZvciB0aGlzIE5vZGUncyBjb250ZW50IGluIHRoZSBsb2NhbCBjb29yZGluYXRlcywgZXhjbHVkaW5nIGFueXRoaW5nIGZyb20gb3VyXHJcbiAgICogY2hpbGRyZW4gYW5kIGRlc2NlbmRhbnRzKS5cclxuICAgKlxyXG4gICAqIE5PVEU6IERvIE5PVCBtdXRhdGUgdGhlIHJldHVybmVkIHZhbHVlIVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRTZWxmQm91bmRzKCk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMuc2VsZkJvdW5kc1Byb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldFNlbGZCb3VuZHMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgc2VsZkJvdW5kcygpOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLmdldFNlbGZCb3VuZHMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBib3VuZGluZyBib3ggdGhhdCBzaG91bGQgY29udGFpbiBhbGwgc2VsZiBjb250ZW50IGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lIChvdXIgbm9ybWFsIHNlbGYgYm91bmRzXHJcbiAgICogYXJlbid0IGd1YXJhbnRlZWQgdGhpcyBmb3IgVGV4dCwgZXRjLilcclxuICAgKlxyXG4gICAqIE92ZXJyaWRlIHRoaXMgdG8gcHJvdmlkZSBkaWZmZXJlbnQgYmVoYXZpb3IuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFNhZmVTZWxmQm91bmRzKCk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMuc2VsZkJvdW5kc1Byb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldFNhZmVTZWxmQm91bmRzKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHNhZmVTZWxmQm91bmRzKCk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2FmZVNlbGZCb3VuZHMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGJvdW5kaW5nIGJveCB0aGF0IHNob3VsZCBjb250YWluIGFsbCBjb250ZW50IG9mIG91ciBjaGlsZHJlbiBpbiBvdXIgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZS4gRG9lcyBub3RcclxuICAgKiBpbmNsdWRlIG91ciBcInNlbGZcIiBib3VuZHMuXHJcbiAgICpcclxuICAgKiBOT1RFOiBEbyBOT1QgbXV0YXRlIHRoZSByZXR1cm5lZCB2YWx1ZSFcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q2hpbGRCb3VuZHMoKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gdGhpcy5jaGlsZEJvdW5kc1Byb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldENoaWxkQm91bmRzKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGNoaWxkQm91bmRzKCk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2hpbGRCb3VuZHMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGJvdW5kaW5nIGJveCB0aGF0IHNob3VsZCBjb250YWluIGFsbCBjb250ZW50IG9mIG91ciBjaGlsZHJlbiBBTkQgb3VyIHNlbGYgaW4gb3VyIGxvY2FsIGNvb3JkaW5hdGVcclxuICAgKiBmcmFtZS5cclxuICAgKlxyXG4gICAqIE5PVEU6IERvIE5PVCBtdXRhdGUgdGhlIHJldHVybmVkIHZhbHVlIVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRMb2NhbEJvdW5kcygpOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLmxvY2FsQm91bmRzUHJvcGVydHkudmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0TG9jYWxCb3VuZHMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgbG9jYWxCb3VuZHMoKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbEJvdW5kcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIHNldExvY2FsQm91bmRzKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IGxvY2FsQm91bmRzKCB2YWx1ZTogQm91bmRzMiB8IG51bGwgKSB7XHJcbiAgICB0aGlzLnNldExvY2FsQm91bmRzKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBsb2NhbEJvdW5kc092ZXJyaWRkZW4oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fbG9jYWxCb3VuZHNPdmVycmlkZGVuO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWxsb3dzIG92ZXJyaWRpbmcgdGhlIHZhbHVlIG9mIGxvY2FsQm91bmRzIChhbmQgdGh1cyBjaGFuZ2luZyB0aGluZ3MgbGlrZSAnYm91bmRzJyB0aGF0IGRlcGVuZCBvbiBsb2NhbEJvdW5kcykuXHJcbiAgICogSWYgaXQncyBzZXQgdG8gYSBub24tbnVsbCB2YWx1ZSwgdGhhdCB2YWx1ZSB3aWxsIGFsd2F5cyBiZSB1c2VkIGZvciBsb2NhbEJvdW5kcyB1bnRpbCB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZFxyXG4gICAqIGFnYWluLiBUbyByZXZlcnQgdG8gaGF2aW5nIFNjZW5lcnkgY29tcHV0ZSB0aGUgbG9jYWxCb3VuZHMsIHNldCB0aGlzIHRvIG51bGwuICBUaGUgYm91bmRzIHNob3VsZCBub3QgYmUgcmVkdWNlZFxyXG4gICAqIHNtYWxsZXIgdGhhbiB0aGUgdmlzaWJsZSBib3VuZHMgb24gdGhlIHNjcmVlbi5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0TG9jYWxCb3VuZHMoIGxvY2FsQm91bmRzOiBCb3VuZHMyIHwgbnVsbCApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxvY2FsQm91bmRzID09PSBudWxsIHx8IGxvY2FsQm91bmRzIGluc3RhbmNlb2YgQm91bmRzMiwgJ2xvY2FsQm91bmRzIG92ZXJyaWRlIHNob3VsZCBiZSBzZXQgdG8gZWl0aGVyIG51bGwgb3IgYSBCb3VuZHMyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbG9jYWxCb3VuZHMgPT09IG51bGwgfHwgIWlzTmFOKCBsb2NhbEJvdW5kcy5taW5YICksICdtaW5YIGZvciBsb2NhbEJvdW5kcyBzaG91bGQgbm90IGJlIE5hTicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxvY2FsQm91bmRzID09PSBudWxsIHx8ICFpc05hTiggbG9jYWxCb3VuZHMubWluWSApLCAnbWluWSBmb3IgbG9jYWxCb3VuZHMgc2hvdWxkIG5vdCBiZSBOYU4nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsb2NhbEJvdW5kcyA9PT0gbnVsbCB8fCAhaXNOYU4oIGxvY2FsQm91bmRzLm1heFggKSwgJ21heFggZm9yIGxvY2FsQm91bmRzIHNob3VsZCBub3QgYmUgTmFOJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbG9jYWxCb3VuZHMgPT09IG51bGwgfHwgIWlzTmFOKCBsb2NhbEJvdW5kcy5tYXhZICksICdtYXhZIGZvciBsb2NhbEJvdW5kcyBzaG91bGQgbm90IGJlIE5hTicgKTtcclxuXHJcbiAgICBjb25zdCBvdXJMb2NhbEJvdW5kcyA9IHRoaXMubG9jYWxCb3VuZHNQcm9wZXJ0eS5fdmFsdWU7XHJcbiAgICBjb25zdCBvbGRMb2NhbEJvdW5kcyA9IG91ckxvY2FsQm91bmRzLmNvcHkoKTtcclxuXHJcbiAgICBpZiAoIGxvY2FsQm91bmRzID09PSBudWxsICkge1xyXG4gICAgICAvLyB3ZSBjYW4ganVzdCBpZ25vcmUgdGhpcyBpZiB3ZSB3ZXJlbid0IGFjdHVhbGx5IG92ZXJyaWRpbmcgbG9jYWwgYm91bmRzIGJlZm9yZVxyXG4gICAgICBpZiAoIHRoaXMuX2xvY2FsQm91bmRzT3ZlcnJpZGRlbiApIHtcclxuXHJcbiAgICAgICAgdGhpcy5fbG9jYWxCb3VuZHNPdmVycmlkZGVuID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5sb2NhbEJvdW5kc1Byb3BlcnR5Lm5vdGlmeUxpc3RlbmVycyggb2xkTG9jYWxCb3VuZHMgKTtcclxuICAgICAgICB0aGlzLmludmFsaWRhdGVCb3VuZHMoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIGp1c3QgYW4gaW5zdGFuY2UgY2hlY2sgZm9yIG5vdy4gY29uc2lkZXIgZXF1YWxzKCkgaW4gdGhlIGZ1dHVyZSBkZXBlbmRpbmcgb24gY29zdFxyXG4gICAgICBjb25zdCBjaGFuZ2VkID0gIWxvY2FsQm91bmRzLmVxdWFscyggb3VyTG9jYWxCb3VuZHMgKSB8fCAhdGhpcy5fbG9jYWxCb3VuZHNPdmVycmlkZGVuO1xyXG5cclxuICAgICAgaWYgKCBjaGFuZ2VkICkge1xyXG4gICAgICAgIG91ckxvY2FsQm91bmRzLnNldCggbG9jYWxCb3VuZHMgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCAhdGhpcy5fbG9jYWxCb3VuZHNPdmVycmlkZGVuICkge1xyXG4gICAgICAgIHRoaXMuX2xvY2FsQm91bmRzT3ZlcnJpZGRlbiA9IHRydWU7IC8vIE5PVEU6IGhhcyB0byBiZSBkb25lIGJlZm9yZSBpbnZhbGlkYXRpbmcgYm91bmRzLCBzaW5jZSB0aGlzIGRpc2FibGVzIGxvY2FsQm91bmRzIGNvbXB1dGF0aW9uXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggY2hhbmdlZCApIHtcclxuICAgICAgICB0aGlzLmxvY2FsQm91bmRzUHJvcGVydHkubm90aWZ5TGlzdGVuZXJzKCBvbGRMb2NhbEJvdW5kcyApO1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZUJvdW5kcygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNZWFudCB0byBiZSBvdmVycmlkZGVuIGluIHN1Yi10eXBlcyB0aGF0IGhhdmUgbW9yZSBhY2N1cmF0ZSBib3VuZHMgZGV0ZXJtaW5hdGlvbiBmb3Igd2hlbiB3ZSBhcmUgdHJhbnNmb3JtZWQuXHJcbiAgICogVXN1YWxseSByb3RhdGlvbiBpcyBzaWduaWZpY2FudCBoZXJlLCBzbyB0aGF0IHRyYW5zZm9ybWVkIGJvdW5kcyBmb3Igbm9uLXJlY3Rhbmd1bGFyIHNoYXBlcyB3aWxsIGJlIGRpZmZlcmVudC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VHJhbnNmb3JtZWRTZWxmQm91bmRzKCBtYXRyaXg6IE1hdHJpeDMgKTogQm91bmRzMiB7XHJcbiAgICAvLyBhc3N1bWUgdGhhdCB3ZSB0YWtlIHVwIHRoZSBlbnRpcmUgcmVjdGFuZ3VsYXIgYm91bmRzIGJ5IGRlZmF1bHRcclxuICAgIHJldHVybiB0aGlzLnNlbGZCb3VuZHMudHJhbnNmb3JtZWQoIG1hdHJpeCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWVhbnQgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWItdHlwZXMgdGhhdCBoYXZlIG1vcmUgYWNjdXJhdGUgYm91bmRzIGRldGVybWluYXRpb24gZm9yIHdoZW4gd2UgYXJlIHRyYW5zZm9ybWVkLlxyXG4gICAqIFVzdWFsbHkgcm90YXRpb24gaXMgc2lnbmlmaWNhbnQgaGVyZSwgc28gdGhhdCB0cmFuc2Zvcm1lZCBib3VuZHMgZm9yIG5vbi1yZWN0YW5ndWxhciBzaGFwZXMgd2lsbCBiZSBkaWZmZXJlbnQuXHJcbiAgICpcclxuICAgKiBUaGlzIHNob3VsZCBpbmNsdWRlIHRoZSBcImZ1bGxcIiBib3VuZHMgdGhhdCBndWFyYW50ZWUgZXZlcnl0aGluZyByZW5kZXJlZCBzaG91bGQgYmUgaW5zaWRlIChlLmcuIFRleHQsIHdoZXJlIHRoZVxyXG4gICAqIG5vcm1hbCBib3VuZHMgbWF5IG5vdCBiZSBzdWZmaWNpZW50KS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VHJhbnNmb3JtZWRTYWZlU2VsZkJvdW5kcyggbWF0cml4OiBNYXRyaXgzICk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMuc2FmZVNlbGZCb3VuZHMudHJhbnNmb3JtZWQoIG1hdHJpeCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdmlzdWFsIFwic2FmZVwiIGJvdW5kcyB0aGF0IGFyZSB0YWtlbiB1cCBieSB0aGlzIE5vZGUgYW5kIGl0cyBzdWJ0cmVlLiBOb3RhYmx5LCB0aGlzIGlzIGVzc2VudGlhbGx5IHRoZVxyXG4gICAqIGNvbWJpbmVkIGVmZmVjdHMgb2YgdGhlIFwidmlzaWJsZVwiIGJvdW5kcyAoaS5lLiBpbnZpc2libGUgbm9kZXMgZG8gbm90IGNvbnRyaWJ1dGUgdG8gYm91bmRzKSwgYW5kIFwic2FmZVwiIGJvdW5kc1xyXG4gICAqIChlLmcuIFRleHQsIHdoZXJlIHdlIG5lZWQgYSBsYXJnZXIgYm91bmRzIGFyZWEgdG8gZ3VhcmFudGVlIHRoZXJlIGlzIG5vdGhpbmcgb3V0c2lkZSkuIEl0IGFsc28gdHJpZXMgdG8gXCJmaXRcIlxyXG4gICAqIHRyYW5zZm9ybWVkIGJvdW5kcyBtb3JlIHRpZ2h0bHksIHdoZXJlIGl0IHdpbGwgaGFuZGxlIHJvdGF0ZWQgUGF0aCBib3VuZHMgaW4gYW4gaW1wcm92ZWQgd2F5LlxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyBtZXRob2QgaXMgbm90IG9wdGltaXplZCwgYW5kIG1heSBjcmVhdGUgZ2FyYmFnZSBhbmQgbm90IGJlIHRoZSBmYXN0ZXN0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIFttYXRyaXhdIC0gSWYgcHJvdmlkZWQsIHdpbGwgcmV0dXJuIHRoZSBib3VuZHMgYXNzdW1pbmcgdGhlIGNvbnRlbnQgaXMgdHJhbnNmb3JtZWQgd2l0aCB0aGVcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2l2ZW4gbWF0cml4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRTYWZlVHJhbnNmb3JtZWRWaXNpYmxlQm91bmRzKCBtYXRyaXg/OiBNYXRyaXgzICk6IEJvdW5kczIge1xyXG4gICAgY29uc3QgbG9jYWxNYXRyaXggPSAoIG1hdHJpeCB8fCBNYXRyaXgzLklERU5USVRZICkudGltZXNNYXRyaXgoIHRoaXMubWF0cml4ICk7XHJcblxyXG4gICAgY29uc3QgYm91bmRzID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcclxuXHJcbiAgICBpZiAoIHRoaXMudmlzaWJsZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICBpZiAoICF0aGlzLnNlbGZCb3VuZHMuaXNFbXB0eSgpICkge1xyXG4gICAgICAgIGJvdW5kcy5pbmNsdWRlQm91bmRzKCB0aGlzLmdldFRyYW5zZm9ybWVkU2FmZVNlbGZCb3VuZHMoIGxvY2FsTWF0cml4ICkgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCB0aGlzLl9jaGlsZHJlbi5sZW5ndGggKSB7XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgICBib3VuZHMuaW5jbHVkZUJvdW5kcyggdGhpcy5fY2hpbGRyZW5bIGkgXS5nZXRTYWZlVHJhbnNmb3JtZWRWaXNpYmxlQm91bmRzKCBsb2NhbE1hdHJpeCApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGJvdW5kcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRTYWZlVHJhbnNmb3JtZWRWaXNpYmxlQm91bmRzKCkgZm9yIG1vcmUgaW5mb3JtYXRpb24gLS0gVGhpcyBpcyBjYWxsZWQgd2l0aG91dCBhbnkgaW5pdGlhbCBwYXJhbWV0ZXJcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHNhZmVUcmFuc2Zvcm1lZFZpc2libGVCb3VuZHMoKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRTYWZlVHJhbnNmb3JtZWRWaXNpYmxlQm91bmRzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBmbGFnIHRoYXQgZGV0ZXJtaW5lcyB3aGV0aGVyIHdlIHdpbGwgcmVxdWlyZSBtb3JlIGFjY3VyYXRlIChhbmQgZXhwZW5zaXZlKSBib3VuZHMgY29tcHV0YXRpb24gZm9yIHRoaXNcclxuICAgKiBub2RlJ3MgdHJhbnNmb3JtLlxyXG4gICAqXHJcbiAgICogSWYgc2V0IHRvIGZhbHNlIChkZWZhdWx0KSwgU2NlbmVyeSB3aWxsIGdldCB0aGUgYm91bmRzIG9mIGNvbnRlbnQsIGFuZCB0aGVuIGlmIHJvdGF0ZWQgd2lsbCBkZXRlcm1pbmUgdGhlIG9uLWF4aXNcclxuICAgKiBib3VuZHMgdGhhdCBjb21wbGV0ZWx5IGNvdmVyIHRoZSByb3RhdGVkIGJvdW5kcyAocG90ZW50aWFsbHkgbGFyZ2VyIHRoYW4gYWN0dWFsIGNvbnRlbnQpLlxyXG4gICAqIElmIHNldCB0byB0cnVlLCBTY2VuZXJ5IHdpbGwgdHJ5IHRvIGdldCB0aGUgYm91bmRzIG9mIHRoZSBhY3R1YWwgcm90YXRlZC90cmFuc2Zvcm1lZCBjb250ZW50LlxyXG4gICAqXHJcbiAgICogQSBnb29kIGV4YW1wbGUgb2Ygd2hlbiB0aGlzIGlzIG5lY2Vzc2FyeSBpcyBpZiB0aGVyZSBhcmUgYSBidW5jaCBvZiBuZXN0ZWQgY2hpbGRyZW4gdGhhdCBlYWNoIGhhdmUgcGkvNCByb3RhdGlvbnMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdHJhbnNmb3JtQm91bmRzIC0gV2hldGhlciBhY2N1cmF0ZSB0cmFuc2Zvcm0gYm91bmRzIHNob3VsZCBiZSB1c2VkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRUcmFuc2Zvcm1Cb3VuZHMoIHRyYW5zZm9ybUJvdW5kczogYm9vbGVhbiApOiB0aGlzIHtcclxuXHJcbiAgICBpZiAoIHRoaXMuX3RyYW5zZm9ybUJvdW5kcyAhPT0gdHJhbnNmb3JtQm91bmRzICkge1xyXG4gICAgICB0aGlzLl90cmFuc2Zvcm1Cb3VuZHMgPSB0cmFuc2Zvcm1Cb3VuZHM7XHJcblxyXG4gICAgICB0aGlzLmludmFsaWRhdGVCb3VuZHMoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRUcmFuc2Zvcm1Cb3VuZHMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgdHJhbnNmb3JtQm91bmRzKCB2YWx1ZTogYm9vbGVhbiApIHtcclxuICAgIHRoaXMuc2V0VHJhbnNmb3JtQm91bmRzKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldFRyYW5zZm9ybUJvdW5kcygpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCB0cmFuc2Zvcm1Cb3VuZHMoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRUcmFuc2Zvcm1Cb3VuZHMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBhY2N1cmF0ZSB0cmFuc2Zvcm1hdGlvbiBib3VuZHMgYXJlIHVzZWQgaW4gYm91bmRzIGNvbXB1dGF0aW9uIChzZWUgc2V0VHJhbnNmb3JtQm91bmRzKS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VHJhbnNmb3JtQm91bmRzKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybUJvdW5kcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGJvdW5kaW5nIGJveCBvZiB0aGlzIE5vZGUgYW5kIGFsbCBvZiBpdHMgc3ViLXRyZWVzIChpbiB0aGUgXCJwYXJlbnRcIiBjb29yZGluYXRlIGZyYW1lKS5cclxuICAgKlxyXG4gICAqIE5PVEU6IERvIE5PVCBtdXRhdGUgdGhlIHJldHVybmVkIHZhbHVlIVxyXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEJvdW5kcygpOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLmJvdW5kc1Byb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldEJvdW5kcygpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBib3VuZHMoKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRCb3VuZHMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExpa2UgZ2V0TG9jYWxCb3VuZHMoKSBpbiB0aGUgXCJsb2NhbFwiIGNvb3JkaW5hdGUgZnJhbWUsIGJ1dCBpbmNsdWRlcyBvbmx5IHZpc2libGUgbm9kZXMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFZpc2libGVMb2NhbEJvdW5kcygpOiBCb3VuZHMyIHtcclxuICAgIC8vIGRlZmVuc2l2ZSBjb3B5LCBzaW5jZSB3ZSB1c2UgbXV0YWJsZSBtb2RpZmljYXRpb25zIGJlbG93XHJcbiAgICBjb25zdCBib3VuZHMgPSB0aGlzLnNlbGZCb3VuZHMuY29weSgpO1xyXG5cclxuICAgIGxldCBpID0gdGhpcy5fY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgd2hpbGUgKCBpLS0gKSB7XHJcbiAgICAgIGJvdW5kcy5pbmNsdWRlQm91bmRzKCB0aGlzLl9jaGlsZHJlblsgaSBdLmdldFZpc2libGVCb3VuZHMoKSApO1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJvdW5kcy5pc0Zpbml0ZSgpIHx8IGJvdW5kcy5pc0VtcHR5KCksICdWaXNpYmxlIGJvdW5kcyBzaG91bGQgbm90IGJlIGluZmluaXRlJyApO1xyXG4gICAgcmV0dXJuIGJvdW5kcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRWaXNpYmxlTG9jYWxCb3VuZHMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgdmlzaWJsZUxvY2FsQm91bmRzKCk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VmlzaWJsZUxvY2FsQm91bmRzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBMaWtlIGdldEJvdW5kcygpIGluIHRoZSBcInBhcmVudFwiIGNvb3JkaW5hdGUgZnJhbWUsIGJ1dCBpbmNsdWRlcyBvbmx5IHZpc2libGUgbm9kZXNcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VmlzaWJsZUJvdW5kcygpOiBCb3VuZHMyIHtcclxuICAgIGlmICggdGhpcy5pc1Zpc2libGUoKSApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0VmlzaWJsZUxvY2FsQm91bmRzKCkudHJhbnNmb3JtKCB0aGlzLmdldE1hdHJpeCgpICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIEJvdW5kczIuTk9USElORztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRWaXNpYmxlQm91bmRzKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHZpc2libGVCb3VuZHMoKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRWaXNpYmxlQm91bmRzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUZXN0cyB3aGV0aGVyIHRoZSBnaXZlbiBwb2ludCBpcyBcImNvbnRhaW5lZFwiIGluIHRoaXMgbm9kZSdzIHN1YnRyZWUgKG9wdGlvbmFsbHkgdXNpbmcgbW91c2UvdG91Y2ggYXJlYXMpLCBhbmQgaWZcclxuICAgKiBzbyByZXR1cm5zIHRoZSBUcmFpbCAocm9vdGVkIGF0IHRoaXMgbm9kZSkgdG8gdGhlIHRvcC1tb3N0IChpbiBzdGFja2luZyBvcmRlcikgTm9kZSB0aGF0IGNvbnRhaW5zIHRoZSBnaXZlblxyXG4gICAqIHBvaW50LlxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyBpcyBvcHRpbWl6ZWQgZm9yIHRoZSBjdXJyZW50IGlucHV0IHN5c3RlbSAocmF0aGVyIHRoYW4gd2hhdCBnZXRzIHZpc3VhbGx5IGRpc3BsYXllZCBvbiB0aGUgc2NyZWVuKSwgc29cclxuICAgKiBwaWNrYWJpbGl0eSAoTm9kZSdzIHBpY2thYmxlIHByb3BlcnR5LCB2aXNpYmlsaXR5LCBhbmQgdGhlIHByZXNlbmNlIG9mIGlucHV0IGxpc3RlbmVycykgYWxsIG1heSBhZmZlY3QgdGhlXHJcbiAgICogcmV0dXJuZWQgdmFsdWUuXHJcbiAgICpcclxuICAgKiBGb3IgZXhhbXBsZSwgaGl0LXRlc3RpbmcgYSBzaW1wbGUgc2hhcGUgKHdpdGggbm8gcGlja2FiaWxpdHkpIHdpbGwgcmV0dXJuIG51bGw6XHJcbiAgICogPiBuZXcgcGhldC5zY2VuZXJ5LkNpcmNsZSggMjAgKS5oaXRUZXN0KCBwaGV0LmRvdC52MiggMCwgMCApICk7IC8vIG51bGxcclxuICAgKlxyXG4gICAqIElmIHRoZSBzYW1lIHNoYXBlIGlzIG1hZGUgdG8gYmUgcGlja2FibGUsIGl0IHdpbGwgcmV0dXJuIGEgdHJhaWw6XHJcbiAgICogPiBuZXcgcGhldC5zY2VuZXJ5LkNpcmNsZSggMjAsIHsgcGlja2FibGU6IHRydWUgfSApLmhpdFRlc3QoIHBoZXQuZG90LnYyKCAwLCAwICkgKTtcclxuICAgKiA+IC8vIHJldHVybnMgYSBUcmFpbCB3aXRoIHRoZSBjaXJjbGUgYXMgdGhlIG9ubHkgbm9kZS5cclxuICAgKlxyXG4gICAqIEl0IHdpbGwgcmV0dXJuIHRoZSByZXN1bHQgdGhhdCBpcyB2aXN1YWxseSBzdGFja2VkIG9uIHRvcCwgc28gZS5nLjpcclxuICAgKiA+IG5ldyBwaGV0LnNjZW5lcnkuTm9kZSgge1xyXG4gICAqID4gICBwaWNrYWJsZTogdHJ1ZSxcclxuICAgKiA+ICAgY2hpbGRyZW46IFtcclxuICAgKiA+ICAgICBuZXcgcGhldC5zY2VuZXJ5LkNpcmNsZSggMjAgKSxcclxuICAgKiA+ICAgICBuZXcgcGhldC5zY2VuZXJ5LkNpcmNsZSggMTUgKVxyXG4gICAqID4gICBdXHJcbiAgICogPiB9ICkuaGl0VGVzdCggcGhldC5kb3QudjIoIDAsIDAgKSApOyAvLyByZXR1cm5zIHRoZSBcInRvcC1tb3N0XCIgY2lyY2xlICh0aGUgb25lIHdpdGggcmFkaXVzOjE1KS5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdXNlZCBieSBTY2VuZXJ5J3MgaW50ZXJuYWwgaW5wdXQgc3lzdGVtIGJ5IGNhbGxpbmcgaGl0VGVzdCBvbiBhIERpc3BsYXkncyByb290Tm9kZSB3aXRoIHRoZVxyXG4gICAqIGdsb2JhbC1jb29yZGluYXRlIHBvaW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHBvaW50IC0gVGhlIHBvaW50IChpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUpIHRvIGNoZWNrIGFnYWluc3QgdGhpcyBub2RlJ3Mgc3VidHJlZS5cclxuICAgKiBAcGFyYW0gW2lzTW91c2VdIC0gV2hldGhlciBtb3VzZUFyZWFzIHNob3VsZCBiZSB1c2VkLlxyXG4gICAqIEBwYXJhbSBbaXNUb3VjaF0gLSBXaGV0aGVyIHRvdWNoQXJlYXMgc2hvdWxkIGJlIHVzZWQuXHJcbiAgICogQHJldHVybnMgLSBSZXR1cm5zIG51bGwgaWYgdGhlIHBvaW50IGlzIG5vdCBjb250YWluZWQgaW4gdGhlIHN1YnRyZWUuXHJcbiAgICovXHJcbiAgcHVibGljIGhpdFRlc3QoIHBvaW50OiBWZWN0b3IyLCBpc01vdXNlPzogYm9vbGVhbiwgaXNUb3VjaD86IGJvb2xlYW4gKTogVHJhaWwgfCBudWxsIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBvaW50LmlzRmluaXRlKCksICdUaGUgcG9pbnQgc2hvdWxkIGJlIGEgZmluaXRlIFZlY3RvcjInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc01vdXNlID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIGlzTW91c2UgPT09ICdib29sZWFuJyxcclxuICAgICAgJ0lmIGlzTW91c2UgaXMgcHJvdmlkZWQsIGl0IHNob3VsZCBiZSBhIGJvb2xlYW4nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc1RvdWNoID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIGlzVG91Y2ggPT09ICdib29sZWFuJyxcclxuICAgICAgJ0lmIGlzVG91Y2ggaXMgcHJvdmlkZWQsIGl0IHNob3VsZCBiZSBhIGJvb2xlYW4nICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuX3BpY2tlci5oaXRUZXN0KCBwb2ludCwgISFpc01vdXNlLCAhIWlzVG91Y2ggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhpdC10ZXN0cyB3aGF0IGlzIHVuZGVyIHRoZSBwb2ludGVyLCBhbmQgcmV0dXJucyBhIHtUcmFpbH0gdG8gdGhhdCBOb2RlIChvciBudWxsIGlmIHRoZXJlIGlzIG5vIG1hdGNoaW5nIG5vZGUpLlxyXG4gICAqXHJcbiAgICogU2VlIGhpdFRlc3QoKSBmb3IgbW9yZSBkZXRhaWxzIGFib3V0IHdoYXQgd2lsbCBiZSByZXR1cm5lZC5cclxuICAgKi9cclxuICBwdWJsaWMgdHJhaWxVbmRlclBvaW50ZXIoIHBvaW50ZXI6IFBvaW50ZXIgKTogVHJhaWwgfCBudWxsIHtcclxuICAgIHJldHVybiBwb2ludGVyLnBvaW50ID09PSBudWxsID8gbnVsbCA6IHRoaXMuaGl0VGVzdCggcG9pbnRlci5wb2ludCwgcG9pbnRlciBpbnN0YW5jZW9mIE1vdXNlLCBwb2ludGVyLmlzVG91Y2hMaWtlKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBhIHBvaW50IChpbiBwYXJlbnQgY29vcmRpbmF0ZXMpIGlzIGNvbnRhaW5lZCBpbiB0aGlzIG5vZGUncyBzdWItdHJlZS5cclxuICAgKlxyXG4gICAqIFNlZSBoaXRUZXN0KCkgZm9yIG1vcmUgZGV0YWlscyBhYm91dCB3aGF0IHdpbGwgYmUgcmV0dXJuZWQuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyAtIFdoZXRoZXIgdGhlIHBvaW50IGlzIGNvbnRhaW5lZC5cclxuICAgKi9cclxuICBwdWJsaWMgY29udGFpbnNQb2ludCggcG9pbnQ6IFZlY3RvcjIgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5oaXRUZXN0KCBwb2ludCApICE9PSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT3ZlcnJpZGUgdGhpcyBmb3IgY29tcHV0YXRpb24gb2Ygd2hldGhlciBhIHBvaW50IGlzIGluc2lkZSBvdXIgc2VsZiBjb250ZW50IChkZWZhdWx0cyB0byBzZWxmQm91bmRzIGNoZWNrKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwb2ludCAtIENvbnNpZGVyZWQgdG8gYmUgaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWVcclxuICAgKi9cclxuICBwdWJsaWMgY29udGFpbnNQb2ludFNlbGYoIHBvaW50OiBWZWN0b3IyICk6IGJvb2xlYW4ge1xyXG4gICAgLy8gaWYgc2VsZiBib3VuZHMgYXJlIG5vdCBudWxsIGRlZmF1bHQgdG8gY2hlY2tpbmcgc2VsZiBib3VuZHNcclxuICAgIHJldHVybiB0aGlzLnNlbGZCb3VuZHMuY29udGFpbnNQb2ludCggcG9pbnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIG5vZGUncyBzZWxmQm91bmRzIGlzIGludGVyc2VjdGVkIGJ5IHRoZSBzcGVjaWZpZWQgYm91bmRzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGJvdW5kcyAtIEJvdW5kcyB0byB0ZXN0LCBhc3N1bWVkIHRvIGJlIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpbnRlcnNlY3RzQm91bmRzU2VsZiggYm91bmRzOiBCb3VuZHMyICk6IGJvb2xlYW4ge1xyXG4gICAgLy8gaWYgc2VsZiBib3VuZHMgYXJlIG5vdCBudWxsLCBjaGlsZCBzaG91bGQgb3ZlcnJpZGUgdGhpc1xyXG4gICAgcmV0dXJuIHRoaXMuc2VsZkJvdW5kcy5pbnRlcnNlY3RzQm91bmRzKCBib3VuZHMgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBpc1BoZXRpb01vdXNlSGl0dGFibGUoIHBvaW50OiBWZWN0b3IyICk6IGJvb2xlYW4ge1xyXG5cclxuICAgIC8vIGludmlzaWJsZSB0aGluZ3MgY2Fubm90IGJlIGF1dG9zZWxlY3RlZFxyXG4gICAgaWYgKCAhdGhpcy52aXNpYmxlICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdW5waWNrYWJsZSB0aGluZ3MgY2Fubm90IGJlIGF1dG9zZWxlY3RlZFxyXG4gICAgaWYgKCB0aGlzLnBpY2thYmxlID09PSBmYWxzZSApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRyYW5zZm9ybSB0aGUgcG9pbnQgaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUsIHNvIHdlIGNhbiB0ZXN0IGl0IHdpdGggdGhlIGNsaXBBcmVhL2NoaWxkcmVuXHJcbiAgICBjb25zdCBsb2NhbFBvaW50ID0gdGhpcy5fdHJhbnNmb3JtLmdldEludmVyc2UoKS50aW1lc1ZlY3RvcjIoIHBvaW50ICk7XHJcblxyXG4gICAgLy8gSWYgb3VyIHBvaW50IGlzIG91dHNpZGUgb2YgdGhlIGxvY2FsLWNvb3JkaW5hdGUgY2xpcHBpbmcgYXJlYSwgdGhlcmUgc2hvdWxkIGJlIG5vIGhpdC5cclxuICAgIGlmICggdGhpcy5jbGlwQXJlYSAhPT0gbnVsbCAmJiAhdGhpcy5jbGlwQXJlYS5jb250YWluc1BvaW50KCBsb2NhbFBvaW50ICkgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLy8gVXNlZCBpbiBTdHVkaW8gQXV0b3NlbGVjdC4gIFJldHVybnMgYW4gaW5zdHJ1bWVudGVkIFBoRVQtaU8gRWxlbWVudCBOb2RlIGlmIHBvc3NpYmxlLlxyXG4gIC8vIEFkYXB0ZWQgZnJvbSBQaWNrZXIucmVjdXJzaXZlSGl0VGVzdFxyXG4gIC8vIEByZXR1cm5zIC0gbWF5IG5vdCBiZSBhIE5vZGUuICBGb3IgaW5zdGFuY2UsIFRocmVlSXNvbWV0cmljTm9kZSBoaXRzIE1hc3MgaW5zdGFuY2VzXHJcbiAgcHVibGljIGdldFBoZXRpb01vdXNlSGl0KCBwb2ludDogVmVjdG9yMiApOiBQaGV0aW9PYmplY3QgfCBudWxsIHtcclxuXHJcbiAgICBpZiAoICF0aGlzLmlzUGhldGlvTW91c2VIaXR0YWJsZSggcG9pbnQgKSApIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVHJhbnNmb3JtIHRoZSBwb2ludCBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSwgc28gd2UgY2FuIHRlc3QgaXQgd2l0aCB0aGUgY2xpcEFyZWEvY2hpbGRyZW5cclxuICAgIGNvbnN0IGxvY2FsUG9pbnQgPSB0aGlzLl90cmFuc2Zvcm0uZ2V0SW52ZXJzZSgpLnRpbWVzVmVjdG9yMiggcG9pbnQgKTtcclxuXHJcbiAgICAvLyBDaGVjayBjaGlsZHJlbiBiZWZvcmUgb3VyIFwic2VsZlwiLCBzaW5jZSB0aGUgY2hpbGRyZW4gYXJlIHJlbmRlcmVkIG9uIHRvcC5cclxuICAgIC8vIE1hbnVhbCBpdGVyYXRpb24gaGVyZSBzbyB3ZSBjYW4gcmV0dXJuIGRpcmVjdGx5LCBhbmQgc28gd2UgY2FuIGl0ZXJhdGUgYmFja3dhcmRzIChsYXN0IG5vZGUgaXMgaW4gZnJvbnQpLlxyXG4gICAgZm9yICggbGV0IGkgPSB0aGlzLl9jaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcclxuICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLl9jaGlsZHJlblsgaSBdO1xyXG4gICAgICBjb25zdCBjaGlsZEhpdCA9IGNoaWxkLmdldFBoZXRpb01vdXNlSGl0KCBsb2NhbFBvaW50ICk7XHJcblxyXG4gICAgICAvLyBJZiB0aGVyZSB3YXMgYSBoaXQsIGltbWVkaWF0ZWx5IGFkZCBvdXIgbm9kZSB0byB0aGUgc3RhcnQgb2YgdGhlIFRyYWlsICh3aWxsIHJlY3Vyc2l2ZWx5IGJ1aWxkIHRoZSBUcmFpbCkuXHJcbiAgICAgIGlmICggY2hpbGRIaXQgKSB7XHJcbiAgICAgICAgcmV0dXJuIGNoaWxkSGl0LmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgPyBjaGlsZEhpdCA6IHRoaXM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBUZXN0cyBmb3IgbW91c2UgYW5kIHRvdWNoIGhpdCBhcmVhcyBiZWZvcmUgdGVzdGluZyBjb250YWluc1BvaW50U2VsZlxyXG4gICAgaWYgKCB0aGlzLl9tb3VzZUFyZWEgKSB7XHJcbiAgICAgIC8vIE5PVEU6IGJvdGggQm91bmRzMiBhbmQgU2hhcGUgaGF2ZSBjb250YWluc1BvaW50ISBXZSB1c2UgYm90aCBoZXJlIVxyXG4gICAgICByZXR1cm4gdGhpcy5fbW91c2VBcmVhLmNvbnRhaW5zUG9pbnQoIGxvY2FsUG9pbnQgKSA/IHRoaXMgOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIERpZG4ndCBoaXQgb3VyIGNoaWxkcmVuLCBzbyBjaGVjayBvdXJzZWxmIGFzIGEgbGFzdCByZXNvcnQuIENoZWNrIG91ciBzZWxmQm91bmRzIGZpcnN0LCBzbyB3ZSBjYW4gcG90ZW50aWFsbHlcclxuICAgIC8vIGF2b2lkIGhpdC10ZXN0aW5nIHRoZSBhY3R1YWwgb2JqZWN0ICh3aGljaCBtYXkgYmUgbW9yZSBleHBlbnNpdmUpLlxyXG4gICAgaWYgKCB0aGlzLnNlbGZCb3VuZHMuY29udGFpbnNQb2ludCggbG9jYWxQb2ludCApICkge1xyXG4gICAgICBpZiAoIHRoaXMuY29udGFpbnNQb2ludFNlbGYoIGxvY2FsUG9pbnQgKSApIHtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIE5vIGhpdFxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoaXMgTm9kZSBpdHNlbGYgaXMgcGFpbnRlZCAoZGlzcGxheXMgc29tZXRoaW5nIGl0c2VsZikuIE1lYW50IHRvIGJlIG92ZXJyaWRkZW4uXHJcbiAgICovXHJcbiAgcHVibGljIGlzUGFpbnRlZCgpOiBib29sZWFuIHtcclxuICAgIC8vIE5vcm1hbCBub2RlcyBkb24ndCByZW5kZXIgYW55dGhpbmdcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgdGhpcyBOb2RlJ3Mgc2VsZkJvdW5kcyBhcmUgY29uc2lkZXJlZCB0byBiZSB2YWxpZCAoYWx3YXlzIGNvbnRhaW5pbmcgdGhlIGRpc3BsYXllZCBzZWxmIGNvbnRlbnRcclxuICAgKiBvZiB0aGlzIG5vZGUpLiBNZWFudCB0byBiZSBvdmVycmlkZGVuIGluIHN1YnR5cGVzIHdoZW4gdGhpcyBjYW4gY2hhbmdlIChlLmcuIFRleHQpLlxyXG4gICAqXHJcbiAgICogSWYgdGhpcyB2YWx1ZSB3b3VsZCBwb3RlbnRpYWxseSBjaGFuZ2UsIHBsZWFzZSB0cmlnZ2VyIHRoZSBldmVudCAnc2VsZkJvdW5kc1ZhbGlkJy5cclxuICAgKi9cclxuICBwdWJsaWMgYXJlU2VsZkJvdW5kc1ZhbGlkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBOb2RlIGhhcyBhbnkgcGFyZW50cyBhdCBhbGwuXHJcbiAgICovXHJcbiAgcHVibGljIGhhc1BhcmVudCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9wYXJlbnRzLmxlbmd0aCAhPT0gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIE5vZGUgaGFzIGFueSBjaGlsZHJlbiBhdCBhbGwuXHJcbiAgICovXHJcbiAgcHVibGljIGhhc0NoaWxkcmVuKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NoaWxkcmVuLmxlbmd0aCA+IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgYSBjaGlsZCBzaG91bGQgYmUgaW5jbHVkZWQgZm9yIGxheW91dCAoaWYgdGhpcyBOb2RlIGlzIGEgbGF5b3V0IGNvbnRhaW5lcikuXHJcbiAgICovXHJcbiAgcHVibGljIGlzQ2hpbGRJbmNsdWRlZEluTGF5b3V0KCBjaGlsZDogTm9kZSApOiBib29sZWFuIHtcclxuICAgIHJldHVybiBjaGlsZC5ib3VuZHMuaXNWYWxpZCgpICYmICggIXRoaXMuX2V4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMgfHwgY2hpbGQudmlzaWJsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIGNhbGxiYWNrIG9uIG5vZGVzIHJlY3Vyc2l2ZWx5IGluIGEgZGVwdGgtZmlyc3QgbWFubmVyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB3YWxrRGVwdGhGaXJzdCggY2FsbGJhY2s6ICggbm9kZTogTm9kZSApID0+IHZvaWQgKTogdm9pZCB7XHJcbiAgICBjYWxsYmFjayggdGhpcyApO1xyXG4gICAgY29uc3QgbGVuZ3RoID0gdGhpcy5fY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuX2NoaWxkcmVuWyBpIF0ud2Fsa0RlcHRoRmlyc3QoIGNhbGxiYWNrICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGFuIGlucHV0IGxpc3RlbmVyLlxyXG4gICAqXHJcbiAgICogU2VlIElucHV0LmpzIGRvY3VtZW50YXRpb24gZm9yIGluZm9ybWF0aW9uIGFib3V0IGhvdyBldmVudCBsaXN0ZW5lcnMgYXJlIHVzZWQuXHJcbiAgICpcclxuICAgKiBBZGRpdGlvbmFsbHksIHRoZSBmb2xsb3dpbmcgZmllbGRzIGFyZSBzdXBwb3J0ZWQgb24gYSBsaXN0ZW5lcjpcclxuICAgKlxyXG4gICAqIC0gaW50ZXJydXB0IHtmdW5jdGlvbigpfTogV2hlbiBhIHBvaW50ZXIgaXMgaW50ZXJydXB0ZWQsIGl0IHdpbGwgYXR0ZW1wdCB0byBjYWxsIHRoaXMgbWV0aG9kIG9uIHRoZSBpbnB1dCBsaXN0ZW5lclxyXG4gICAqIC0gY3Vyc29yIHtzdHJpbmd8bnVsbH06IElmIG5vZGUuY3Vyc29yIGlzIG51bGwsIGFueSBub24tbnVsbCBjdXJzb3Igb2YgYW4gaW5wdXQgbGlzdGVuZXIgd2lsbCBlZmZlY3RpdmVseVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgIFwib3ZlcnJpZGVcIiBpdC4gTk9URTogdGhpcyBjYW4gYmUgaW1wbGVtZW50ZWQgYXMgYW4gZXM1IGdldHRlciwgaWYgdGhlIGN1cnNvciBjYW4gY2hhbmdlXHJcbiAgICovXHJcbiAgcHVibGljIGFkZElucHV0TGlzdGVuZXIoIGxpc3RlbmVyOiBUSW5wdXRMaXN0ZW5lciApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFfLmluY2x1ZGVzKCB0aGlzLl9pbnB1dExpc3RlbmVycywgbGlzdGVuZXIgKSwgJ0lucHV0IGxpc3RlbmVyIGFscmVhZHkgcmVnaXN0ZXJlZCBvbiB0aGlzIE5vZGUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsaXN0ZW5lciAhPT0gbnVsbCwgJ0lucHV0IGxpc3RlbmVyIGNhbm5vdCBiZSBudWxsJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGlzdGVuZXIgIT09IHVuZGVmaW5lZCwgJ0lucHV0IGxpc3RlbmVyIGNhbm5vdCBiZSB1bmRlZmluZWQnICk7XHJcblxyXG4gICAgLy8gZG9uJ3QgYWxsb3cgbGlzdGVuZXJzIHRvIGJlIGFkZGVkIG11bHRpcGxlIHRpbWVzXHJcbiAgICBpZiAoICFfLmluY2x1ZGVzKCB0aGlzLl9pbnB1dExpc3RlbmVycywgbGlzdGVuZXIgKSApIHtcclxuICAgICAgdGhpcy5faW5wdXRMaXN0ZW5lcnMucHVzaCggbGlzdGVuZXIgKTtcclxuICAgICAgdGhpcy5fcGlja2VyLm9uQWRkSW5wdXRMaXN0ZW5lcigpO1xyXG4gICAgICBpZiAoIGFzc2VydFNsb3cgKSB7IHRoaXMuX3BpY2tlci5hdWRpdCgpOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYW4gaW5wdXQgbGlzdGVuZXIgdGhhdCB3YXMgcHJldmlvdXNseSBhZGRlZCB3aXRoIGFkZElucHV0TGlzdGVuZXIuXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZUlucHV0TGlzdGVuZXIoIGxpc3RlbmVyOiBUSW5wdXRMaXN0ZW5lciApOiB0aGlzIHtcclxuICAgIGNvbnN0IGluZGV4ID0gXy5pbmRleE9mKCB0aGlzLl9pbnB1dExpc3RlbmVycywgbGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBlbnN1cmUgdGhlIGxpc3RlbmVyIGlzIGluIG91ciBsaXN0IChpZ25vcmUgYXNzZXJ0aW9uIGZvciBkaXNwb3NhbCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzM5NClcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNEaXNwb3NlZCB8fCBpbmRleCA+PSAwLCAnQ291bGQgbm90IGZpbmQgaW5wdXQgbGlzdGVuZXIgdG8gcmVtb3ZlJyApO1xyXG4gICAgaWYgKCBpbmRleCA+PSAwICkge1xyXG4gICAgICB0aGlzLl9pbnB1dExpc3RlbmVycy5zcGxpY2UoIGluZGV4LCAxICk7XHJcbiAgICAgIHRoaXMuX3BpY2tlci5vblJlbW92ZUlucHV0TGlzdGVuZXIoKTtcclxuICAgICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9waWNrZXIuYXVkaXQoKTsgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgaW5wdXQgbGlzdGVuZXIgaXMgY3VycmVudGx5IGxpc3RlbmluZyB0byB0aGlzIG5vZGUuXHJcbiAgICpcclxuICAgKiBNb3JlIGVmZmljaWVudCB0aGFuIGNoZWNraW5nIG5vZGUuaW5wdXRMaXN0ZW5lcnMsIGFzIHRoYXQgaW5jbHVkZXMgYSBkZWZlbnNpdmUgY29weS5cclxuICAgKi9cclxuICBwdWJsaWMgaGFzSW5wdXRMaXN0ZW5lciggbGlzdGVuZXI6IFRJbnB1dExpc3RlbmVyICk6IGJvb2xlYW4ge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5faW5wdXRMaXN0ZW5lcnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGlmICggdGhpcy5faW5wdXRMaXN0ZW5lcnNbIGkgXSA9PT0gbGlzdGVuZXIgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVycnVwdHMgYWxsIGlucHV0IGxpc3RlbmVycyB0aGF0IGFyZSBhdHRhY2hlZCB0byB0aGlzIG5vZGUuXHJcbiAgICovXHJcbiAgcHVibGljIGludGVycnVwdElucHV0KCk6IHRoaXMge1xyXG4gICAgY29uc3QgbGlzdGVuZXJzQ29weSA9IHRoaXMuaW5wdXRMaXN0ZW5lcnM7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGlzdGVuZXJzQ29weS5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgbGlzdGVuZXIgPSBsaXN0ZW5lcnNDb3B5WyBpIF07XHJcblxyXG4gICAgICBsaXN0ZW5lci5pbnRlcnJ1cHQgJiYgbGlzdGVuZXIuaW50ZXJydXB0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnRlcnJ1cHRzIGFsbCBpbnB1dCBsaXN0ZW5lcnMgdGhhdCBhcmUgYXR0YWNoZWQgdG8gZWl0aGVyIHRoaXMgbm9kZSwgb3IgYSBkZXNjZW5kYW50IG5vZGUuXHJcbiAgICovXHJcbiAgcHVibGljIGludGVycnVwdFN1YnRyZWVJbnB1dCgpOiB0aGlzIHtcclxuICAgIHRoaXMuaW50ZXJydXB0SW5wdXQoKTtcclxuXHJcbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX2NoaWxkcmVuLnNsaWNlKCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY2hpbGRyZW5bIGkgXS5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoYW5nZXMgdGhlIHRyYW5zZm9ybSBvZiB0aGlzIE5vZGUgYnkgYWRkaW5nIGEgdHJhbnNmb3JtLiBUaGUgZGVmYXVsdCBcImFwcGVuZHNcIiB0aGUgdHJhbnNmb3JtLCBzbyB0aGF0IGl0IHdpbGxcclxuICAgKiBhcHBlYXIgdG8gaGFwcGVuIHRvIHRoZSBOb2RlIGJlZm9yZSB0aGUgcmVzdCBvZiB0aGUgdHJhbnNmb3JtIHdvdWxkIGFwcGx5LCBidXQgaWYgXCJwcmVwZW5kZWRcIiwgdGhlIHJlc3Qgb2YgdGhlXHJcbiAgICogdHJhbnNmb3JtIHdvdWxkIGFwcGx5IGZpcnN0LlxyXG4gICAqXHJcbiAgICogQXMgYW4gZXhhbXBsZSwgaWYgYSBOb2RlIGlzIGNlbnRlcmVkIGF0ICgwLDApIGFuZCBzY2FsZWQgYnkgMjpcclxuICAgKiB0cmFuc2xhdGUoIDEwMCwgMCApIHdvdWxkIGNhdXNlIHRoZSBjZW50ZXIgb2YgdGhlIE5vZGUgKGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSkgdG8gYmUgYXQgKDIwMCwwKS5cclxuICAgKiB0cmFuc2xhdGUoIDEwMCwgMCwgdHJ1ZSApIHdvdWxkIGNhdXNlIHRoZSBjZW50ZXIgb2YgdGhlIE5vZGUgKGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSkgdG8gYmUgYXQgKDEwMCwwKS5cclxuICAgKlxyXG4gICAqIEFsbG93ZWQgY2FsbCBzaWduYXR1cmVzOlxyXG4gICAqIHRyYW5zbGF0ZSggeCB7bnVtYmVyfSwgeSB7bnVtYmVyfSApXHJcbiAgICogdHJhbnNsYXRlKCB4IHtudW1iZXJ9LCB5IHtudW1iZXJ9LCBwcmVwZW5kSW5zdGVhZCB7Ym9vbGVhbn0gKVxyXG4gICAqIHRyYW5zbGF0ZSggdmVjdG9yIHtWZWN0b3IyfSApXHJcbiAgICogdHJhbnNsYXRlKCB2ZWN0b3Ige1ZlY3RvcjJ9LCBwcmVwZW5kSW5zdGVhZCB7Ym9vbGVhbn0gKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHggLSBUaGUgeCBjb29yZGluYXRlXHJcbiAgICogQHBhcmFtIHkgLSBUaGUgeSBjb29yZGluYXRlXHJcbiAgICogQHBhcmFtIFtwcmVwZW5kSW5zdGVhZF0gLSBXaGV0aGVyIHRoZSB0cmFuc2Zvcm0gc2hvdWxkIGJlIHByZXBlbmRlZCAoZGVmYXVsdHMgdG8gZmFsc2UpXHJcbiAgICovXHJcbiAgcHVibGljIHRyYW5zbGF0ZSggdjogVmVjdG9yMiwgcHJlcGVuZEluc3RlYWQ/OiBib29sZWFuICk6IHZvaWQ7XHJcbiAgdHJhbnNsYXRlKCB4OiBudW1iZXIsIHk6IG51bWJlciwgcHJlcGVuZEluc3RlYWQ/OiBib29sZWFuICk6IHZvaWQ7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1lbWJlci1hY2Nlc3NpYmlsaXR5XHJcbiAgdHJhbnNsYXRlKCB4OiBudW1iZXIgfCBWZWN0b3IyLCB5PzogbnVtYmVyIHwgYm9vbGVhbiwgcHJlcGVuZEluc3RlYWQ/OiBib29sZWFuICk6IHZvaWQgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9leHBsaWNpdC1tZW1iZXItYWNjZXNzaWJpbGl0eVxyXG4gICAgaWYgKCB0eXBlb2YgeCA9PT0gJ251bWJlcicgKSB7XHJcbiAgICAgIC8vIHRyYW5zbGF0ZSggeCwgeSwgcHJlcGVuZEluc3RlYWQgKVxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeCApLCAneCBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyJyApO1xyXG5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHkgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB5ICksICd5IHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXInICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2ltcGxlLXR5cGUtY2hlY2tpbmctYXNzZXJ0aW9uc1xyXG5cclxuICAgICAgaWYgKCBNYXRoLmFicyggeCApIDwgMWUtMTIgJiYgTWF0aC5hYnMoIHkgYXMgbnVtYmVyICkgPCAxZS0xMiApIHsgcmV0dXJuOyB9IC8vIGJhaWwgb3V0IGlmIGJvdGggYXJlIHplcm9cclxuICAgICAgaWYgKCBwcmVwZW5kSW5zdGVhZCApIHtcclxuICAgICAgICB0aGlzLnByZXBlbmRUcmFuc2xhdGlvbiggeCwgeSBhcyBudW1iZXIgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmFwcGVuZE1hdHJpeCggc2NyYXRjaE1hdHJpeDMuc2V0VG9UcmFuc2xhdGlvbiggeCwgeSBhcyBudW1iZXIgKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gdHJhbnNsYXRlKCB2ZWN0b3IsIHByZXBlbmRJbnN0ZWFkIClcclxuICAgICAgY29uc3QgdmVjdG9yID0geDtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdmVjdG9yLmlzRmluaXRlKCksICd0cmFuc2xhdGlvbiBzaG91bGQgYmUgYSBmaW5pdGUgVmVjdG9yMiBpZiBub3QgZmluaXRlIG51bWJlcnMnICk7XHJcbiAgICAgIGlmICggIXZlY3Rvci54ICYmICF2ZWN0b3IueSApIHsgcmV0dXJuOyB9IC8vIGJhaWwgb3V0IGlmIGJvdGggYXJlIHplcm9cclxuICAgICAgdGhpcy50cmFuc2xhdGUoIHZlY3Rvci54LCB2ZWN0b3IueSwgeSBhcyBib29sZWFuICk7IC8vIGZvcndhcmQgdG8gZnVsbCB2ZXJzaW9uXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTY2FsZXMgdGhlIG5vZGUncyB0cmFuc2Zvcm0uIFRoZSBkZWZhdWx0IFwiYXBwZW5kc1wiIHRoZSB0cmFuc2Zvcm0sIHNvIHRoYXQgaXQgd2lsbFxyXG4gICAqIGFwcGVhciB0byBoYXBwZW4gdG8gdGhlIE5vZGUgYmVmb3JlIHRoZSByZXN0IG9mIHRoZSB0cmFuc2Zvcm0gd291bGQgYXBwbHksIGJ1dCBpZiBcInByZXBlbmRlZFwiLCB0aGUgcmVzdCBvZiB0aGVcclxuICAgKiB0cmFuc2Zvcm0gd291bGQgYXBwbHkgZmlyc3QuXHJcbiAgICpcclxuICAgKiBBcyBhbiBleGFtcGxlLCBpZiBhIE5vZGUgaXMgdHJhbnNsYXRlZCB0byAoMTAwLDApOlxyXG4gICAqIHNjYWxlKCAyICkgd2lsbCBsZWF2ZSB0aGUgTm9kZSB0cmFuc2xhdGVkIGF0ICgxMDAsMCksIGJ1dCBpdCB3aWxsIGJlIHR3aWNlIGFzIGJpZyBhcm91bmQgaXRzIG9yaWdpbiBhdCB0aGF0IGxvY2F0aW9uLlxyXG4gICAqIHNjYWxlKCAyLCB0cnVlICkgd2lsbCBzaGlmdCB0aGUgTm9kZSB0byAoMjAwLDApLlxyXG4gICAqXHJcbiAgICogQWxsb3dlZCBjYWxsIHNpZ25hdHVyZXM6XHJcbiAgICogKHMgaW52b2NhdGlvbik6IHNjYWxlKCBzIHtudW1iZXJ8VmVjdG9yMn0sIFtwcmVwZW5kSW5zdGVhZF0ge2Jvb2xlYW59IClcclxuICAgKiAoeCx5IGludm9jYXRpb24pOiBzY2FsZSggeCB7bnVtYmVyfSwgeSB7bnVtYmVyfSwgW3ByZXBlbmRJbnN0ZWFkXSB7Ym9vbGVhbn0gKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHggLSAocyBpbnZvY2F0aW9uKToge251bWJlcn0gc2NhbGVzIGJvdGggZGltZW5zaW9ucyBlcXVhbGx5LCBvciB7VmVjdG9yMn0gc2NhbGVzIGluZGVwZW5kZW50bHlcclxuICAgKiAgICAgICAgICAtICh4LHkgaW52b2NhdGlvbik6IHtudW1iZXJ9IHNjYWxlIGZvciB0aGUgeC1kaW1lbnNpb25cclxuICAgKiBAcGFyYW0gW3ldIC0gKHMgaW52b2NhdGlvbik6IHtib29sZWFufSBwcmVwZW5kSW5zdGVhZCAtIFdoZXRoZXIgdGhlIHRyYW5zZm9ybSBzaG91bGQgYmUgcHJlcGVuZGVkIChkZWZhdWx0cyB0byBmYWxzZSlcclxuICAgKiAgICAgICAgICAgIC0gKHgseSBpbnZvY2F0aW9uKToge251bWJlcn0geSAtIHNjYWxlIGZvciB0aGUgeS1kaW1lbnNpb25cclxuICAgKiBAcGFyYW0gW3ByZXBlbmRJbnN0ZWFkXSAtICh4LHkgaW52b2NhdGlvbikgV2hldGhlciB0aGUgdHJhbnNmb3JtIHNob3VsZCBiZSBwcmVwZW5kZWQgKGRlZmF1bHRzIHRvIGZhbHNlKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzY2FsZSggczogbnVtYmVyLCBwcmVwZW5kSW5zdGVhZD86IGJvb2xlYW4gKTogdm9pZDtcclxuICBzY2FsZSggczogVmVjdG9yMiwgcHJlcGVuZEluc3RlYWQ/OiBib29sZWFuICk6IHZvaWQ7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1lbWJlci1hY2Nlc3NpYmlsaXR5XHJcbiAgc2NhbGUoIHg6IG51bWJlciwgeTogbnVtYmVyLCBwcmVwZW5kSW5zdGVhZD86IGJvb2xlYW4gKTogdm9pZDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvZXhwbGljaXQtbWVtYmVyLWFjY2Vzc2liaWxpdHlcclxuICBzY2FsZSggeDogbnVtYmVyIHwgVmVjdG9yMiwgeT86IG51bWJlciB8IGJvb2xlYW4sIHByZXBlbmRJbnN0ZWFkPzogYm9vbGVhbiApOiB2b2lkIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvZXhwbGljaXQtbWVtYmVyLWFjY2Vzc2liaWxpdHlcclxuICAgIGlmICggdHlwZW9mIHggPT09ICdudW1iZXInICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeCApLCAnc2NhbGVzIHNob3VsZCBiZSBmaW5pdGUnICk7XHJcbiAgICAgIGlmICggeSA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiB5ID09PSAnYm9vbGVhbicgKSB7XHJcbiAgICAgICAgLy8gc2NhbGUoIHNjYWxlLCBbcHJlcGVuZEluc3RlYWRdIClcclxuICAgICAgICB0aGlzLnNjYWxlKCB4LCB4LCB5ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gc2NhbGUoIHgsIHksIFtwcmVwZW5kSW5zdGVhZF0gKVxyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB5ICksICdzY2FsZXMgc2hvdWxkIGJlIGZpbml0ZSBudW1iZXJzJyApO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHByZXBlbmRJbnN0ZWFkID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHByZXBlbmRJbnN0ZWFkID09PSAnYm9vbGVhbicsICdJZiBwcm92aWRlZCwgcHJlcGVuZEluc3RlYWQgc2hvdWxkIGJlIGJvb2xlYW4nICk7XHJcblxyXG4gICAgICAgIGlmICggeCA9PT0gMSAmJiB5ID09PSAxICkgeyByZXR1cm47IH0gLy8gYmFpbCBvdXQgaWYgd2UgYXJlIHNjYWxpbmcgYnkgMSAoaWRlbnRpdHkpXHJcbiAgICAgICAgaWYgKCBwcmVwZW5kSW5zdGVhZCApIHtcclxuICAgICAgICAgIHRoaXMucHJlcGVuZE1hdHJpeCggTWF0cml4My5zY2FsaW5nKCB4LCB5ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmFwcGVuZE1hdHJpeCggTWF0cml4My5zY2FsaW5nKCB4LCB5ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBzY2FsZSggdmVjdG9yLCBbcHJlcGVuZEluc3RlYWRdIClcclxuICAgICAgY29uc3QgdmVjdG9yID0geDtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdmVjdG9yLmlzRmluaXRlKCksICdzY2FsZSBzaG91bGQgYmUgYSBmaW5pdGUgVmVjdG9yMiBpZiBub3QgYSBmaW5pdGUgbnVtYmVyJyApO1xyXG4gICAgICB0aGlzLnNjYWxlKCB2ZWN0b3IueCwgdmVjdG9yLnksIHkgYXMgYm9vbGVhbiApOyAvLyBmb3J3YXJkIHRvIGZ1bGwgdmVyc2lvblxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUm90YXRlcyB0aGUgbm9kZSdzIHRyYW5zZm9ybS4gVGhlIGRlZmF1bHQgXCJhcHBlbmRzXCIgdGhlIHRyYW5zZm9ybSwgc28gdGhhdCBpdCB3aWxsXHJcbiAgICogYXBwZWFyIHRvIGhhcHBlbiB0byB0aGUgTm9kZSBiZWZvcmUgdGhlIHJlc3Qgb2YgdGhlIHRyYW5zZm9ybSB3b3VsZCBhcHBseSwgYnV0IGlmIFwicHJlcGVuZGVkXCIsIHRoZSByZXN0IG9mIHRoZVxyXG4gICAqIHRyYW5zZm9ybSB3b3VsZCBhcHBseSBmaXJzdC5cclxuICAgKlxyXG4gICAqIEFzIGFuIGV4YW1wbGUsIGlmIGEgTm9kZSBpcyB0cmFuc2xhdGVkIHRvICgxMDAsMCk6XHJcbiAgICogcm90YXRlKCBNYXRoLlBJICkgd2lsbCByb3RhdGUgdGhlIE5vZGUgYXJvdW5kICgxMDAsMClcclxuICAgKiByb3RhdGUoIE1hdGguUEksIHRydWUgKSB3aWxsIHJvdGF0ZSB0aGUgTm9kZSBhcm91bmQgdGhlIG9yaWdpbiwgbW92aW5nIGl0IHRvICgtMTAwLDApXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYW5nbGUgLSBUaGUgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZSBieVxyXG4gICAqIEBwYXJhbSBbcHJlcGVuZEluc3RlYWRdIC0gV2hldGhlciB0aGUgdHJhbnNmb3JtIHNob3VsZCBiZSBwcmVwZW5kZWQgKGRlZmF1bHRzIHRvIGZhbHNlKVxyXG4gICAqL1xyXG4gIHB1YmxpYyByb3RhdGUoIGFuZ2xlOiBudW1iZXIsIHByZXBlbmRJbnN0ZWFkPzogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBhbmdsZSApLCAnYW5nbGUgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHByZXBlbmRJbnN0ZWFkID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHByZXBlbmRJbnN0ZWFkID09PSAnYm9vbGVhbicgKTtcclxuICAgIGlmICggYW5nbGUgJSAoIDIgKiBNYXRoLlBJICkgPT09IDAgKSB7IHJldHVybjsgfSAvLyBiYWlsIG91dCBpZiBvdXIgYW5nbGUgaXMgZWZmZWN0aXZlbHkgMFxyXG4gICAgaWYgKCBwcmVwZW5kSW5zdGVhZCApIHtcclxuICAgICAgdGhpcy5wcmVwZW5kTWF0cml4KCBNYXRyaXgzLnJvdGF0aW9uMiggYW5nbGUgKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuYXBwZW5kTWF0cml4KCBNYXRyaXgzLnJvdGF0aW9uMiggYW5nbGUgKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUm90YXRlcyB0aGUgbm9kZSdzIHRyYW5zZm9ybSBhcm91bmQgYSBzcGVjaWZpYyBwb2ludCAoaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lKSBieSBwcmVwZW5kaW5nIHRoZSB0cmFuc2Zvcm0uXHJcbiAgICpcclxuICAgKiBUT0RPOiBkZXRlcm1pbmUgd2hldGhlciB0aGlzIHNob3VsZCB1c2UgdGhlIGFwcGVuZE1hdHJpeCBtZXRob2RcclxuICAgKlxyXG4gICAqIEBwYXJhbSBwb2ludCAtIEluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZVxyXG4gICAqIEBwYXJhbSBhbmdsZSAtIEluIHJhZGlhbnNcclxuICAgKi9cclxuICBwdWJsaWMgcm90YXRlQXJvdW5kKCBwb2ludDogVmVjdG9yMiwgYW5nbGU6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBvaW50LmlzRmluaXRlKCksICdwb2ludCBzaG91bGQgYmUgYSBmaW5pdGUgVmVjdG9yMicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBhbmdsZSApLCAnYW5nbGUgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcclxuXHJcbiAgICBsZXQgbWF0cml4ID0gTWF0cml4My50cmFuc2xhdGlvbiggLXBvaW50LngsIC1wb2ludC55ICk7XHJcbiAgICBtYXRyaXggPSBNYXRyaXgzLnJvdGF0aW9uMiggYW5nbGUgKS50aW1lc01hdHJpeCggbWF0cml4ICk7XHJcbiAgICBtYXRyaXggPSBNYXRyaXgzLnRyYW5zbGF0aW9uKCBwb2ludC54LCBwb2ludC55ICkudGltZXNNYXRyaXgoIG1hdHJpeCApO1xyXG4gICAgdGhpcy5wcmVwZW5kTWF0cml4KCBtYXRyaXggKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2hpZnRzIHRoZSB4IGNvb3JkaW5hdGUgKGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSkgb2Ygd2hlcmUgdGhlIG5vZGUncyBvcmlnaW4gaXMgdHJhbnNmb3JtZWQgdG8uXHJcbiAgICovXHJcbiAgcHVibGljIHNldFgoIHg6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB4ICksICd4IHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXInICk7XHJcblxyXG4gICAgdGhpcy50cmFuc2xhdGUoIHggLSB0aGlzLmdldFgoKSwgMCwgdHJ1ZSApO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgc2V0WCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCB4KCB2YWx1ZTogbnVtYmVyICkge1xyXG4gICAgdGhpcy5zZXRYKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldFgoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0WCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgeCBjb29yZGluYXRlIChpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUpIG9mIHdoZXJlIHRoZSBub2RlJ3Mgb3JpZ2luIGlzIHRyYW5zZm9ybWVkIHRvLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRYKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtLmdldE1hdHJpeCgpLm0wMigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2hpZnRzIHRoZSB5IGNvb3JkaW5hdGUgKGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSkgb2Ygd2hlcmUgdGhlIG5vZGUncyBvcmlnaW4gaXMgdHJhbnNmb3JtZWQgdG8uXHJcbiAgICovXHJcbiAgcHVibGljIHNldFkoIHk6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB5ICksICd5IHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXInICk7XHJcblxyXG4gICAgdGhpcy50cmFuc2xhdGUoIDAsIHkgLSB0aGlzLmdldFkoKSwgdHJ1ZSApO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgc2V0WSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCB5KCB2YWx1ZTogbnVtYmVyICkge1xyXG4gICAgdGhpcy5zZXRZKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldFkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgeSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0WSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgeSBjb29yZGluYXRlIChpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUpIG9mIHdoZXJlIHRoZSBub2RlJ3Mgb3JpZ2luIGlzIHRyYW5zZm9ybWVkIHRvLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRZKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtLmdldE1hdHJpeCgpLm0xMigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHlwaWNhbGx5IHdpdGhvdXQgcm90YXRpb25zIG9yIG5lZ2F0aXZlIHBhcmFtZXRlcnMsIHRoaXMgc2V0cyB0aGUgc2NhbGUgZm9yIGVhY2ggYXhpcy4gSW4gaXRzIG1vcmUgZ2VuZXJhbCBmb3JtLFxyXG4gICAqIGl0IG1vZGlmaWVzIHRoZSBub2RlJ3MgdHJhbnNmb3JtIHNvIHRoYXQ6XHJcbiAgICogLSBUcmFuc2Zvcm1pbmcgKDEsMCkgd2l0aCBvdXIgdHJhbnNmb3JtIHdpbGwgcmVzdWx0IGluIGEgdmVjdG9yIHdpdGggbWFnbml0dWRlIGFicyggeC1zY2FsZS1tYWduaXR1ZGUgKVxyXG4gICAqIC0gVHJhbnNmb3JtaW5nICgwLDEpIHdpdGggb3VyIHRyYW5zZm9ybSB3aWxsIHJlc3VsdCBpbiBhIHZlY3RvciB3aXRoIG1hZ25pdHVkZSBhYnMoIHktc2NhbGUtbWFnbml0dWRlIClcclxuICAgKiAtIElmIHBhcmFtZXRlcnMgYXJlIG5lZ2F0aXZlLCBpdCB3aWxsIGZsaXAgb3JpZW50YXRpb24gaW4gdGhhdCBkaXJlY3QuXHJcbiAgICpcclxuICAgKiBBbGxvd2VkIGNhbGwgc2lnbmF0dXJlczpcclxuICAgKiBzZXRTY2FsZU1hZ25pdHVkZSggcyApXHJcbiAgICogc2V0U2NhbGVNYWduaXR1ZGUoIHN4LCBzeSApXHJcbiAgICogc2V0U2NhbGVNYWduaXR1ZGUoIHZlY3RvciApXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYSAtIFNjYWxlIGZvciBib3RoIGF4ZXMsIG9yIHNjYWxlIGZvciB4LWF4aXMgaWYgdXNpbmcgdGhlIDItcGFyYW1ldGVyIGNhbGxcclxuICAgKiBAcGFyYW0gW2JdIC0gU2NhbGUgZm9yIHRoZSBZIGF4aXMgKG9ubHkgZm9yIHRoZSAyLXBhcmFtZXRlciBjYWxsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRTY2FsZU1hZ25pdHVkZSggczogbnVtYmVyICk6IHRoaXM7XHJcbiAgc2V0U2NhbGVNYWduaXR1ZGUoIHY6IFZlY3RvcjIgKTogdGhpczsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvZXhwbGljaXQtbWVtYmVyLWFjY2Vzc2liaWxpdHlcclxuICBzZXRTY2FsZU1hZ25pdHVkZSggc3g6IG51bWJlciwgc3k6IG51bWJlciApOiB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9leHBsaWNpdC1tZW1iZXItYWNjZXNzaWJpbGl0eVxyXG4gIHNldFNjYWxlTWFnbml0dWRlKCBhOiBudW1iZXIgfCBWZWN0b3IyLCBiPzogbnVtYmVyICk6IHRoaXMgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9leHBsaWNpdC1tZW1iZXItYWNjZXNzaWJpbGl0eVxyXG4gICAgY29uc3QgY3VycmVudFNjYWxlID0gdGhpcy5nZXRTY2FsZVZlY3RvcigpO1xyXG5cclxuICAgIGlmICggdHlwZW9mIGEgPT09ICdudW1iZXInICkge1xyXG4gICAgICBpZiAoIGIgPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICAvLyB0byBtYXAgc2V0U2NhbGVNYWduaXR1ZGUoIHNjYWxlICkgPT4gc2V0U2NhbGVNYWduaXR1ZGUoIHNjYWxlLCBzY2FsZSApXHJcbiAgICAgICAgYiA9IGE7XHJcbiAgICAgIH1cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGEgKSwgJ3NldFNjYWxlTWFnbml0dWRlIHBhcmFtZXRlcnMgc2hvdWxkIGJlIGZpbml0ZSBudW1iZXJzJyApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYiApLCAnc2V0U2NhbGVNYWduaXR1ZGUgcGFyYW1ldGVycyBzaG91bGQgYmUgZmluaXRlIG51bWJlcnMnICk7XHJcbiAgICAgIC8vIHNldFNjYWxlTWFnbml0dWRlKCB4LCB5IClcclxuICAgICAgdGhpcy5hcHBlbmRNYXRyaXgoIE1hdHJpeDMuc2NhbGluZyggYSAvIGN1cnJlbnRTY2FsZS54LCBiIC8gY3VycmVudFNjYWxlLnkgKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIHNldFNjYWxlTWFnbml0dWRlKCB2ZWN0b3IgKSwgd2hlcmUgd2Ugc2V0IHRoZSB4LXNjYWxlIHRvIHZlY3Rvci54IGFuZCB5LXNjYWxlIHRvIHZlY3Rvci55XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGEuaXNGaW5pdGUoKSwgJ2ZpcnN0IHBhcmFtZXRlciBzaG91bGQgYmUgYSBmaW5pdGUgVmVjdG9yMicgKTtcclxuXHJcbiAgICAgIHRoaXMuYXBwZW5kTWF0cml4KCBNYXRyaXgzLnNjYWxpbmcoIGEueCAvIGN1cnJlbnRTY2FsZS54LCBhLnkgLyBjdXJyZW50U2NhbGUueSApICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSB2ZWN0b3Igd2l0aCBhbiBlbnRyeSBmb3IgZWFjaCBheGlzLCBlLmcuICg1LDIpIGZvciBhbiBhZmZpbmUgbWF0cml4IHdpdGggcm93cyAoKDUsMCwwKSwoMCwyLDApLCgwLDAsMSkpLlxyXG4gICAqXHJcbiAgICogSXQgaXMgZXF1aXZhbGVudCB0bzpcclxuICAgKiAoIFQoMSwwKS5tYWduaXR1ZGUoKSwgVCgwLDEpLm1hZ25pdHVkZSgpICkgd2hlcmUgVCgpIHRyYW5zZm9ybXMgcG9pbnRzIHdpdGggb3VyIHRyYW5zZm9ybS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0U2NhbGVWZWN0b3IoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtLmdldE1hdHJpeCgpLmdldFNjYWxlVmVjdG9yKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSb3RhdGVzIHRoaXMgbm9kZSdzIHRyYW5zZm9ybSBzbyB0aGF0IGEgdW5pdCAoMSwwKSB2ZWN0b3Igd291bGQgYmUgcm90YXRlZCBieSB0aGlzIG5vZGUncyB0cmFuc2Zvcm0gYnkgdGhlXHJcbiAgICogc3BlY2lmaWVkIGFtb3VudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSByb3RhdGlvbiAtIEluIHJhZGlhbnNcclxuICAgKi9cclxuICBwdWJsaWMgc2V0Um90YXRpb24oIHJvdGF0aW9uOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggcm90YXRpb24gKSxcclxuICAgICAgJ3JvdGF0aW9uIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXInICk7XHJcblxyXG4gICAgdGhpcy5hcHBlbmRNYXRyaXgoIHNjcmF0Y2hNYXRyaXgzLnNldFRvUm90YXRpb25aKCByb3RhdGlvbiAtIHRoaXMuZ2V0Um90YXRpb24oKSApICk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRSb3RhdGlvbigpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCByb3RhdGlvbiggdmFsdWU6IG51bWJlciApIHtcclxuICAgIHRoaXMuc2V0Um90YXRpb24oIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0Um90YXRpb24oKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgcm90YXRpb24oKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdldFJvdGF0aW9uKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSByb3RhdGlvbiAoaW4gcmFkaWFucykgdGhhdCB3b3VsZCBiZSBhcHBsaWVkIHRvIGEgdW5pdCAoMSwwKSB2ZWN0b3Igd2hlbiB0cmFuc2Zvcm1lZCB3aXRoIHRoaXMgTm9kZSdzXHJcbiAgICogdHJhbnNmb3JtLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRSb3RhdGlvbigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybS5nZXRNYXRyaXgoKS5nZXRSb3RhdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW9kaWZpZXMgdGhlIHRyYW5zbGF0aW9uIG9mIHRoaXMgTm9kZSdzIHRyYW5zZm9ybSBzbyB0aGF0IHRoZSBub2RlJ3MgbG9jYWwtY29vcmRpbmF0ZSBvcmlnaW4gd2lsbCBiZSB0cmFuc2Zvcm1lZFxyXG4gICAqIHRvIHRoZSBwYXNzZWQtaW4geC95LlxyXG4gICAqXHJcbiAgICogQWxsb3dlZCBjYWxsIHNpZ25hdHVyZXM6XHJcbiAgICogc2V0VHJhbnNsYXRpb24oIHgsIHkgKVxyXG4gICAqIHNldFRyYW5zbGF0aW9uKCB2ZWN0b3IgKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIGEgLSBYIHRyYW5zbGF0aW9uIC0gb3IgVmVjdG9yIHdpdGggeC95IHRyYW5zbGF0aW9uIGluIGNvbXBvbmVudHNcclxuICAgKiBAcGFyYW0gW2JdIC0gWSB0cmFuc2xhdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRUcmFuc2xhdGlvbiggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogdGhpcztcclxuICBzZXRUcmFuc2xhdGlvbiggdjogVmVjdG9yMiApOiB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9leHBsaWNpdC1tZW1iZXItYWNjZXNzaWJpbGl0eVxyXG4gIHNldFRyYW5zbGF0aW9uKCBhOiBudW1iZXIgfCBWZWN0b3IyLCBiPzogbnVtYmVyICk6IHRoaXMgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9leHBsaWNpdC1tZW1iZXItYWNjZXNzaWJpbGl0eVxyXG4gICAgY29uc3QgbSA9IHRoaXMuX3RyYW5zZm9ybS5nZXRNYXRyaXgoKTtcclxuICAgIGNvbnN0IHR4ID0gbS5tMDIoKTtcclxuICAgIGNvbnN0IHR5ID0gbS5tMTIoKTtcclxuXHJcbiAgICBsZXQgZHg7XHJcbiAgICBsZXQgZHk7XHJcblxyXG4gICAgaWYgKCB0eXBlb2YgYSA9PT0gJ251bWJlcicgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBhICksICdQYXJhbWV0ZXJzIHRvIHNldFRyYW5zbGF0aW9uIHNob3VsZCBiZSBmaW5pdGUgbnVtYmVycycgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYiAhPT0gdW5kZWZpbmVkICYmIGlzRmluaXRlKCBiICksICdQYXJhbWV0ZXJzIHRvIHNldFRyYW5zbGF0aW9uIHNob3VsZCBiZSBmaW5pdGUgbnVtYmVycycgKTtcclxuICAgICAgZHggPSBhIC0gdHg7XHJcbiAgICAgIGR5ID0gYiEgLSB0eTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhLmlzRmluaXRlKCksICdTaG91bGQgYmUgYSBmaW5pdGUgVmVjdG9yMicgKTtcclxuICAgICAgZHggPSBhLnggLSB0eDtcclxuICAgICAgZHkgPSBhLnkgLSB0eTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnRyYW5zbGF0ZSggZHgsIGR5LCB0cnVlICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgc2V0VHJhbnNsYXRpb24oKSBmb3IgbW9yZSBpbmZvcm1hdGlvbiAtIHRoaXMgc2hvdWxkIG9ubHkgYmUgdXNlZCB3aXRoIFZlY3RvcjJcclxuICAgKi9cclxuICBwdWJsaWMgc2V0IHRyYW5zbGF0aW9uKCB2YWx1ZTogVmVjdG9yMiApIHtcclxuICAgIHRoaXMuc2V0VHJhbnNsYXRpb24oIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0VHJhbnNsYXRpb24oKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgdHJhbnNsYXRpb24oKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRUcmFuc2xhdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHZlY3RvciBvZiB3aGVyZSB0aGlzIE5vZGUncyBsb2NhbC1jb29yZGluYXRlIG9yaWdpbiB3aWxsIGJlIHRyYW5zZm9ybWVkIGJ5IGl0J3Mgb3duIHRyYW5zZm9ybS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VHJhbnNsYXRpb24oKTogVmVjdG9yMiB7XHJcbiAgICBjb25zdCBtYXRyaXggPSB0aGlzLl90cmFuc2Zvcm0uZ2V0TWF0cml4KCk7XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIG1hdHJpeC5tMDIoKSwgbWF0cml4Lm0xMigpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBlbmRzIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4IHRvIHRoaXMgTm9kZSdzIHRyYW5zZm9ybS4gQXBwZW5kaW5nIG1lYW5zIHRoaXMgdHJhbnNmb3JtIGlzIGNvbmNlcHR1YWxseSBhcHBsaWVkXHJcbiAgICogZmlyc3QgYmVmb3JlIHRoZSByZXN0IG9mIHRoZSBOb2RlJ3MgY3VycmVudCB0cmFuc2Zvcm0gKGkuZS4gYXBwbGllZCBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXHJcbiAgICovXHJcbiAgcHVibGljIGFwcGVuZE1hdHJpeCggbWF0cml4OiBNYXRyaXgzICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWF0cml4LmlzRmluaXRlKCksICdtYXRyaXggc2hvdWxkIGJlIGEgZmluaXRlIE1hdHJpeDMnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXRyaXguZ2V0RGV0ZXJtaW5hbnQoKSAhPT0gMCwgJ21hdHJpeCBzaG91bGQgbm90IG1hcCBwbGFuZSB0byBhIGxpbmUgb3IgcG9pbnQnICk7XHJcbiAgICB0aGlzLl90cmFuc2Zvcm0uYXBwZW5kKCBtYXRyaXggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByZXBlbmRzIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4IHRvIHRoaXMgTm9kZSdzIHRyYW5zZm9ybS4gUHJlcGVuZGluZyBtZWFucyB0aGlzIHRyYW5zZm9ybSBpcyBjb25jZXB0dWFsbHkgYXBwbGllZFxyXG4gICAqIGFmdGVyIHRoZSByZXN0IG9mIHRoZSBOb2RlJ3MgY3VycmVudCB0cmFuc2Zvcm0gKGkuZS4gYXBwbGllZCBpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBwcmVwZW5kTWF0cml4KCBtYXRyaXg6IE1hdHJpeDMgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXRyaXguaXNGaW5pdGUoKSwgJ21hdHJpeCBzaG91bGQgYmUgYSBmaW5pdGUgTWF0cml4MycgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdHJpeC5nZXREZXRlcm1pbmFudCgpICE9PSAwLCAnbWF0cml4IHNob3VsZCBub3QgbWFwIHBsYW5lIHRvIGEgbGluZSBvciBwb2ludCcgKTtcclxuICAgIHRoaXMuX3RyYW5zZm9ybS5wcmVwZW5kKCBtYXRyaXggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByZXBlbmRzIGFuICh4LHkpIHRyYW5zbGF0aW9uIHRvIG91ciBOb2RlJ3MgdHJhbnNmb3JtIGluIGFuIGVmZmljaWVudCBtYW5uZXIgd2l0aG91dCBhbGxvY2F0aW5nIGEgbWF0cml4LlxyXG4gICAqIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTE5XHJcbiAgICovXHJcbiAgcHVibGljIHByZXBlbmRUcmFuc2xhdGlvbiggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeCApLCAneCBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHkgKSwgJ3kgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcclxuXHJcbiAgICBpZiAoICF4ICYmICF5ICkgeyByZXR1cm47IH0gLy8gYmFpbCBvdXQgaWYgYm90aCBhcmUgemVyb1xyXG5cclxuICAgIHRoaXMuX3RyYW5zZm9ybS5wcmVwZW5kVHJhbnNsYXRpb24oIHgsIHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoYW5nZXMgdGhpcyBOb2RlJ3MgdHJhbnNmb3JtIHRvIG1hdGNoIHRoZSBwYXNzZWQtaW4gdHJhbnNmb3JtYXRpb24gbWF0cml4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRNYXRyaXgoIG1hdHJpeDogTWF0cml4MyApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdHJpeC5pc0Zpbml0ZSgpLCAnbWF0cml4IHNob3VsZCBiZSBhIGZpbml0ZSBNYXRyaXgzJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWF0cml4LmdldERldGVybWluYW50KCkgIT09IDAsICdtYXRyaXggc2hvdWxkIG5vdCBtYXAgcGxhbmUgdG8gYSBsaW5lIG9yIHBvaW50JyApO1xyXG5cclxuICAgIHRoaXMuX3RyYW5zZm9ybS5zZXRNYXRyaXgoIG1hdHJpeCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIHNldE1hdHJpeCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBtYXRyaXgoIHZhbHVlOiBNYXRyaXgzICkge1xyXG4gICAgdGhpcy5zZXRNYXRyaXgoIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0TWF0cml4KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IG1hdHJpeCgpOiBNYXRyaXgzIHtcclxuICAgIHJldHVybiB0aGlzLmdldE1hdHJpeCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIE1hdHJpeDMgcmVwcmVzZW50aW5nIG91ciBOb2RlJ3MgdHJhbnNmb3JtLlxyXG4gICAqXHJcbiAgICogTk9URTogRG8gbm90IG11dGF0ZSB0aGUgcmV0dXJuZWQgbWF0cml4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRNYXRyaXgoKTogTWF0cml4MyB7XHJcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtLmdldE1hdHJpeCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byBvdXIgTm9kZSdzIHRyYW5zZm9ybVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRUcmFuc2Zvcm0oKTogVHJhbnNmb3JtMyB7XHJcbiAgICAvLyBmb3Igbm93LCByZXR1cm4gYW4gYWN0dWFsIGNvcHkuIHdlIGNhbiBjb25zaWRlciBsaXN0ZW5pbmcgdG8gY2hhbmdlcyBpbiB0aGUgZnV0dXJlXHJcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldFRyYW5zZm9ybSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCB0cmFuc2Zvcm0oKTogVHJhbnNmb3JtMyB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRUcmFuc2Zvcm0oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyBvdXIgTm9kZSdzIHRyYW5zZm9ybSB0byBhbiBpZGVudGl0eSB0cmFuc2Zvcm0gKGkuZS4gbm8gdHJhbnNmb3JtIGlzIGFwcGxpZWQpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZXNldFRyYW5zZm9ybSgpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0TWF0cml4KCBNYXRyaXgzLklERU5USVRZICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsYmFjayBmdW5jdGlvbiB0aGF0IHNob3VsZCBiZSBjYWxsZWQgd2hlbiBvdXIgdHJhbnNmb3JtIGlzIGNoYW5nZWQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvblRyYW5zZm9ybUNoYW5nZSgpOiB2b2lkIHtcclxuICAgIC8vIFRPRE86IHdoeSBpcyBsb2NhbCBib3VuZHMgaW52YWxpZGF0aW9uIG5lZWRlZCBoZXJlP1xyXG4gICAgdGhpcy5pbnZhbGlkYXRlQm91bmRzKCk7XHJcblxyXG4gICAgdGhpcy5fcGlja2VyLm9uVHJhbnNmb3JtQ2hhbmdlKCk7XHJcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7IHRoaXMuX3BpY2tlci5hdWRpdCgpOyB9XHJcblxyXG4gICAgdGhpcy50cmFuc2Zvcm1FbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIG91ciBzdW1tYXJ5IGJpdG1hc2sgY2hhbmdlcyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgb25TdW1tYXJ5Q2hhbmdlKCBvbGRCaXRtYXNrOiBudW1iZXIsIG5ld0JpdG1hc2s6IG51bWJlciApOiB2b2lkIHtcclxuICAgIC8vIERlZmluZWQgaW4gUGFyYWxsZWxET00uanNcclxuICAgIHRoaXMuX3Bkb21EaXNwbGF5c0luZm8ub25TdW1tYXJ5Q2hhbmdlKCBvbGRCaXRtYXNrLCBuZXdCaXRtYXNrICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIG91ciBub2RlJ3Mgc2NhbGUgYW5kIGFwcGxpZWQgc2NhbGUgZmFjdG9yIGlmIHdlIG5lZWQgdG8gY2hhbmdlIG91ciBzY2FsZSB0byBmaXQgd2l0aGluIHRoZSBtYXhpbXVtXHJcbiAgICogZGltZW5zaW9ucyAobWF4V2lkdGggYW5kIG1heEhlaWdodCkuIFNlZSBkb2N1bWVudGF0aW9uIGluIGNvbnN0cnVjdG9yIGZvciBkZXRhaWxlZCBiZWhhdmlvci5cclxuICAgKi9cclxuICBwcml2YXRlIHVwZGF0ZU1heERpbWVuc2lvbiggbG9jYWxCb3VuZHM6IEJvdW5kczIgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgdGhpcy5hdWRpdE1heERpbWVuc2lvbnMoKTtcclxuXHJcbiAgICBjb25zdCBjdXJyZW50U2NhbGUgPSB0aGlzLl9hcHBsaWVkU2NhbGVGYWN0b3I7XHJcbiAgICBsZXQgaWRlYWxTY2FsZSA9IDE7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9tYXhXaWR0aCAhPT0gbnVsbCApIHtcclxuICAgICAgY29uc3Qgd2lkdGggPSBsb2NhbEJvdW5kcy53aWR0aDtcclxuICAgICAgaWYgKCB3aWR0aCA+IHRoaXMuX21heFdpZHRoICkge1xyXG4gICAgICAgIGlkZWFsU2NhbGUgPSBNYXRoLm1pbiggaWRlYWxTY2FsZSwgdGhpcy5fbWF4V2lkdGggLyB3aWR0aCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLl9tYXhIZWlnaHQgIT09IG51bGwgKSB7XHJcbiAgICAgIGNvbnN0IGhlaWdodCA9IGxvY2FsQm91bmRzLmhlaWdodDtcclxuICAgICAgaWYgKCBoZWlnaHQgPiB0aGlzLl9tYXhIZWlnaHQgKSB7XHJcbiAgICAgICAgaWRlYWxTY2FsZSA9IE1hdGgubWluKCBpZGVhbFNjYWxlLCB0aGlzLl9tYXhIZWlnaHQgLyBoZWlnaHQgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNjYWxlQWRqdXN0bWVudCA9IGlkZWFsU2NhbGUgLyBjdXJyZW50U2NhbGU7XHJcbiAgICBpZiAoIHNjYWxlQWRqdXN0bWVudCAhPT0gMSApIHtcclxuICAgICAgLy8gU2V0IHRoaXMgZmlyc3QsIGZvciBzdXBwb3J0aW5nIHJlLWVudHJhbmN5IGlmIG91ciBjb250ZW50IGNoYW5nZXMgYmFzZWQgb24gdGhlIHNjYWxlXHJcbiAgICAgIHRoaXMuX2FwcGxpZWRTY2FsZUZhY3RvciA9IGlkZWFsU2NhbGU7XHJcblxyXG4gICAgICB0aGlzLnNjYWxlKCBzY2FsZUFkanVzdG1lbnQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNjZW5lcnktaW50ZXJuYWwgbWV0aG9kIGZvciB2ZXJpZnlpbmcgbWF4aW11bSBkaW1lbnNpb25zIGFyZSBOT1Qgc21hbGxlciB0aGFuIHByZWZlcnJlZCBkaW1lbnNpb25zXHJcbiAgICogTk9URTogVGhpcyBoYXMgdG8gYmUgcHVibGljIGR1ZSB0byBtaXhpbnMgbm90IGFibGUgdG8gYWNjZXNzIHByb3RlY3RlZC9wcml2YXRlIG1ldGhvZHNcclxuICAgKi9cclxuICBwdWJsaWMgYXVkaXRNYXhEaW1lbnNpb25zKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fbWF4V2lkdGggPT09IG51bGwgfHwgIWlzV2lkdGhTaXphYmxlKCB0aGlzICkgfHwgdGhpcy5wcmVmZXJyZWRXaWR0aCA9PT0gbnVsbCB8fCB0aGlzLl9tYXhXaWR0aCA+PSB0aGlzLnByZWZlcnJlZFdpZHRoIC0gMWUtNyxcclxuICAgICAgJ0lmIG1heFdpZHRoIGFuZCBwcmVmZXJyZWRXaWR0aCBhcmUgYm90aCBub24tbnVsbCwgbWF4V2lkdGggc2hvdWxkIE5PVCBiZSBzbWFsbGVyIHRoYW4gdGhlIHByZWZlcnJlZFdpZHRoLiBJZiB0aGF0IGhhcHBlbnMsIGl0IHdvdWxkIHRyaWdnZXIgYW4gaW5maW5pdGUgbG9vcCcgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9tYXhIZWlnaHQgPT09IG51bGwgfHwgIWlzSGVpZ2h0U2l6YWJsZSggdGhpcyApIHx8IHRoaXMucHJlZmVycmVkSGVpZ2h0ID09PSBudWxsIHx8IHRoaXMuX21heEhlaWdodCA+PSB0aGlzLnByZWZlcnJlZEhlaWdodCAtIDFlLTcsXHJcbiAgICAgICdJZiBtYXhIZWlnaHQgYW5kIHByZWZlcnJlZEhlaWdodCBhcmUgYm90aCBub24tbnVsbCwgbWF4SGVpZ2h0IHNob3VsZCBOT1QgYmUgc21hbGxlciB0aGFuIHRoZSBwcmVmZXJyZWRIZWlnaHQuIElmIHRoYXQgaGFwcGVucywgaXQgd291bGQgdHJpZ2dlciBhbiBpbmZpbml0ZSBsb29wJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5jcmVtZW50cy9kZWNyZW1lbnRzIGJvdW5kcyBcImxpc3RlbmVyXCIgY291bnQgYmFzZWQgb24gdGhlIHZhbHVlcyBvZiBtYXhXaWR0aC9tYXhIZWlnaHQgYmVmb3JlIGFuZCBhZnRlci5cclxuICAgKiBudWxsIGlzIGxpa2Ugbm8gbGlzdGVuZXIsIG5vbi1udWxsIGlzIGxpa2UgaGF2aW5nIGEgbGlzdGVuZXIsIHNvIHdlIGluY3JlbWVudCBmb3IgbnVsbCA9PiBub24tbnVsbCwgYW5kXHJcbiAgICogZGVjcmVtZW50IGZvciBub24tbnVsbCA9PiBudWxsLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgb25NYXhEaW1lbnNpb25DaGFuZ2UoIGJlZm9yZU1heExlbmd0aDogbnVtYmVyIHwgbnVsbCwgYWZ0ZXJNYXhMZW5ndGg6IG51bWJlciB8IG51bGwgKTogdm9pZCB7XHJcbiAgICBpZiAoIGJlZm9yZU1heExlbmd0aCA9PT0gbnVsbCAmJiBhZnRlck1heExlbmd0aCAhPT0gbnVsbCApIHtcclxuICAgICAgdGhpcy5jaGFuZ2VCb3VuZHNFdmVudENvdW50KCAxICk7XHJcbiAgICAgIHRoaXMuX2JvdW5kc0V2ZW50U2VsZkNvdW50Kys7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggYmVmb3JlTWF4TGVuZ3RoICE9PSBudWxsICYmIGFmdGVyTWF4TGVuZ3RoID09PSBudWxsICkge1xyXG4gICAgICB0aGlzLmNoYW5nZUJvdW5kc0V2ZW50Q291bnQoIC0xICk7XHJcbiAgICAgIHRoaXMuX2JvdW5kc0V2ZW50U2VsZkNvdW50LS07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBtYXhpbXVtIHdpZHRoIG9mIHRoZSBOb2RlIChzZWUgY29uc3RydWN0b3IgZm9yIGRvY3VtZW50YXRpb24gb24gaG93IG1heGltdW0gZGltZW5zaW9ucyB3b3JrKS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0TWF4V2lkdGgoIG1heFdpZHRoOiBudW1iZXIgfCBudWxsICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWF4V2lkdGggPT09IG51bGwgfHwgKCB0eXBlb2YgbWF4V2lkdGggPT09ICdudW1iZXInICYmIG1heFdpZHRoID4gMCApLFxyXG4gICAgICAnbWF4V2lkdGggc2hvdWxkIGJlIG51bGwgKG5vIGNvbnN0cmFpbnQpIG9yIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xyXG5cclxuICAgIGlmICggdGhpcy5fbWF4V2lkdGggIT09IG1heFdpZHRoICkge1xyXG4gICAgICAvLyB1cGRhdGUgc3ludGhldGljIGJvdW5kcyBsaXN0ZW5lciBjb3VudCAodG8gZW5zdXJlIG91ciBib3VuZHMgYXJlIHZhbGlkYXRlZCBhdCB0aGUgc3RhcnQgb2YgdXBkYXRlRGlzcGxheSlcclxuICAgICAgdGhpcy5vbk1heERpbWVuc2lvbkNoYW5nZSggdGhpcy5fbWF4V2lkdGgsIG1heFdpZHRoICk7XHJcblxyXG4gICAgICB0aGlzLl9tYXhXaWR0aCA9IG1heFdpZHRoO1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVNYXhEaW1lbnNpb24oIHRoaXMubG9jYWxCb3VuZHNQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIHNldE1heFdpZHRoKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IG1heFdpZHRoKCB2YWx1ZTogbnVtYmVyIHwgbnVsbCApIHtcclxuICAgIHRoaXMuc2V0TWF4V2lkdGgoIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0TWF4V2lkdGgoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgbWF4V2lkdGgoKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRNYXhXaWR0aCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbWF4aW11bSB3aWR0aCAoaWYgYW55KSBvZiB0aGUgTm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TWF4V2lkdGgoKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fbWF4V2lkdGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBtYXhpbXVtIGhlaWdodCBvZiB0aGUgTm9kZSAoc2VlIGNvbnN0cnVjdG9yIGZvciBkb2N1bWVudGF0aW9uIG9uIGhvdyBtYXhpbXVtIGRpbWVuc2lvbnMgd29yaykuXHJcbiAgICovXHJcbiAgcHVibGljIHNldE1heEhlaWdodCggbWF4SGVpZ2h0OiBudW1iZXIgfCBudWxsICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWF4SGVpZ2h0ID09PSBudWxsIHx8ICggdHlwZW9mIG1heEhlaWdodCA9PT0gJ251bWJlcicgJiYgbWF4SGVpZ2h0ID4gMCApLFxyXG4gICAgICAnbWF4SGVpZ2h0IHNob3VsZCBiZSBudWxsIChubyBjb25zdHJhaW50KSBvciBhIHBvc2l0aXZlIG51bWJlcicgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX21heEhlaWdodCAhPT0gbWF4SGVpZ2h0ICkge1xyXG4gICAgICAvLyB1cGRhdGUgc3ludGhldGljIGJvdW5kcyBsaXN0ZW5lciBjb3VudCAodG8gZW5zdXJlIG91ciBib3VuZHMgYXJlIHZhbGlkYXRlZCBhdCB0aGUgc3RhcnQgb2YgdXBkYXRlRGlzcGxheSlcclxuICAgICAgdGhpcy5vbk1heERpbWVuc2lvbkNoYW5nZSggdGhpcy5fbWF4SGVpZ2h0LCBtYXhIZWlnaHQgKTtcclxuXHJcbiAgICAgIHRoaXMuX21heEhlaWdodCA9IG1heEhlaWdodDtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlTWF4RGltZW5zaW9uKCB0aGlzLmxvY2FsQm91bmRzUHJvcGVydHkudmFsdWUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRNYXhIZWlnaHQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgbWF4SGVpZ2h0KCB2YWx1ZTogbnVtYmVyIHwgbnVsbCApIHtcclxuICAgIHRoaXMuc2V0TWF4SGVpZ2h0KCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldE1heEhlaWdodCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBtYXhIZWlnaHQoKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRNYXhIZWlnaHQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG1heGltdW0gaGVpZ2h0IChpZiBhbnkpIG9mIHRoZSBOb2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRNYXhIZWlnaHQoKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fbWF4SGVpZ2h0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2hpZnRzIHRoaXMgTm9kZSBob3Jpem9udGFsbHkgc28gdGhhdCBpdHMgbGVmdCBib3VuZCAoaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lKSBpcyBlcXVhbCB0byB0aGUgcGFzc2VkLWluXHJcbiAgICogJ2xlZnQnIFggdmFsdWUuXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIG1heSByZXF1aXJlIGNvbXB1dGF0aW9uIG9mIHRoaXMgbm9kZSdzIHN1YnRyZWUgYm91bmRzLCB3aGljaCBtYXkgaW5jdXIgc29tZSBwZXJmb3JtYW5jZSBsb3NzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGxlZnQgLSBBZnRlciB0aGlzIG9wZXJhdGlvbiwgbm9kZS5sZWZ0IHNob3VsZCBhcHByb3hpbWF0ZWx5IGVxdWFsIHRoaXMgdmFsdWUuXHJcbiAgICovXHJcbiAgcHVibGljIHNldExlZnQoIGxlZnQ6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGNvbnN0IGN1cnJlbnRMZWZ0ID0gdGhpcy5nZXRMZWZ0KCk7XHJcbiAgICBpZiAoIGlzRmluaXRlKCBjdXJyZW50TGVmdCApICkge1xyXG4gICAgICB0aGlzLnRyYW5zbGF0ZSggbGVmdCAtIGN1cnJlbnRMZWZ0LCAwLCB0cnVlICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgc2V0TGVmdCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBsZWZ0KCB2YWx1ZTogbnVtYmVyICkge1xyXG4gICAgdGhpcy5zZXRMZWZ0KCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldExlZnQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgbGVmdCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TGVmdCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgWCB2YWx1ZSBvZiB0aGUgbGVmdCBzaWRlIG9mIHRoZSBib3VuZGluZyBib3ggb2YgdGhpcyBOb2RlIChpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUpLlxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyBtYXkgcmVxdWlyZSBjb21wdXRhdGlvbiBvZiB0aGlzIG5vZGUncyBzdWJ0cmVlIGJvdW5kcywgd2hpY2ggbWF5IGluY3VyIHNvbWUgcGVyZm9ybWFuY2UgbG9zcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TGVmdCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCkubWluWDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNoaWZ0cyB0aGlzIE5vZGUgaG9yaXpvbnRhbGx5IHNvIHRoYXQgaXRzIHJpZ2h0IGJvdW5kIChpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUpIGlzIGVxdWFsIHRvIHRoZSBwYXNzZWQtaW5cclxuICAgKiAncmlnaHQnIFggdmFsdWUuXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIG1heSByZXF1aXJlIGNvbXB1dGF0aW9uIG9mIHRoaXMgbm9kZSdzIHN1YnRyZWUgYm91bmRzLCB3aGljaCBtYXkgaW5jdXIgc29tZSBwZXJmb3JtYW5jZSBsb3NzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHJpZ2h0IC0gQWZ0ZXIgdGhpcyBvcGVyYXRpb24sIG5vZGUucmlnaHQgc2hvdWxkIGFwcHJveGltYXRlbHkgZXF1YWwgdGhpcyB2YWx1ZS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0UmlnaHQoIHJpZ2h0OiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBjb25zdCBjdXJyZW50UmlnaHQgPSB0aGlzLmdldFJpZ2h0KCk7XHJcbiAgICBpZiAoIGlzRmluaXRlKCBjdXJyZW50UmlnaHQgKSApIHtcclxuICAgICAgdGhpcy50cmFuc2xhdGUoIHJpZ2h0IC0gY3VycmVudFJpZ2h0LCAwLCB0cnVlICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRSaWdodCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCByaWdodCggdmFsdWU6IG51bWJlciApIHtcclxuICAgIHRoaXMuc2V0UmlnaHQoIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0UmlnaHQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgcmlnaHQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdldFJpZ2h0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBYIHZhbHVlIG9mIHRoZSByaWdodCBzaWRlIG9mIHRoZSBib3VuZGluZyBib3ggb2YgdGhpcyBOb2RlIChpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUpLlxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyBtYXkgcmVxdWlyZSBjb21wdXRhdGlvbiBvZiB0aGlzIG5vZGUncyBzdWJ0cmVlIGJvdW5kcywgd2hpY2ggbWF5IGluY3VyIHNvbWUgcGVyZm9ybWFuY2UgbG9zcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UmlnaHQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdldEJvdW5kcygpLm1heFg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTaGlmdHMgdGhpcyBOb2RlIGhvcml6b250YWxseSBzbyB0aGF0IGl0cyBob3Jpem9udGFsIGNlbnRlciAoaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lKSBpcyBlcXVhbCB0byB0aGVcclxuICAgKiBwYXNzZWQtaW4gY2VudGVyIFggdmFsdWUuXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIG1heSByZXF1aXJlIGNvbXB1dGF0aW9uIG9mIHRoaXMgbm9kZSdzIHN1YnRyZWUgYm91bmRzLCB3aGljaCBtYXkgaW5jdXIgc29tZSBwZXJmb3JtYW5jZSBsb3NzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHggLSBBZnRlciB0aGlzIG9wZXJhdGlvbiwgbm9kZS5jZW50ZXJYIHNob3VsZCBhcHByb3hpbWF0ZWx5IGVxdWFsIHRoaXMgdmFsdWUuXHJcbiAgICovXHJcbiAgcHVibGljIHNldENlbnRlclgoIHg6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGNvbnN0IGN1cnJlbnRDZW50ZXJYID0gdGhpcy5nZXRDZW50ZXJYKCk7XHJcbiAgICBpZiAoIGlzRmluaXRlKCBjdXJyZW50Q2VudGVyWCApICkge1xyXG4gICAgICB0aGlzLnRyYW5zbGF0ZSggeCAtIGN1cnJlbnRDZW50ZXJYLCAwLCB0cnVlICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgc2V0Q2VudGVyWCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBjZW50ZXJYKCB2YWx1ZTogbnVtYmVyICkge1xyXG4gICAgdGhpcy5zZXRDZW50ZXJYKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldENlbnRlclgoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgY2VudGVyWCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2VudGVyWCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgWCB2YWx1ZSBvZiB0aGlzIG5vZGUncyBob3Jpem9udGFsIGNlbnRlciAoaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lKVxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyBtYXkgcmVxdWlyZSBjb21wdXRhdGlvbiBvZiB0aGlzIG5vZGUncyBzdWJ0cmVlIGJvdW5kcywgd2hpY2ggbWF5IGluY3VyIHNvbWUgcGVyZm9ybWFuY2UgbG9zcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q2VudGVyWCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCkuZ2V0Q2VudGVyWCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2hpZnRzIHRoaXMgTm9kZSB2ZXJ0aWNhbGx5IHNvIHRoYXQgaXRzIHZlcnRpY2FsIGNlbnRlciAoaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lKSBpcyBlcXVhbCB0byB0aGVcclxuICAgKiBwYXNzZWQtaW4gY2VudGVyIFkgdmFsdWUuXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIG1heSByZXF1aXJlIGNvbXB1dGF0aW9uIG9mIHRoaXMgbm9kZSdzIHN1YnRyZWUgYm91bmRzLCB3aGljaCBtYXkgaW5jdXIgc29tZSBwZXJmb3JtYW5jZSBsb3NzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHkgLSBBZnRlciB0aGlzIG9wZXJhdGlvbiwgbm9kZS5jZW50ZXJZIHNob3VsZCBhcHByb3hpbWF0ZWx5IGVxdWFsIHRoaXMgdmFsdWUuXHJcbiAgICovXHJcbiAgcHVibGljIHNldENlbnRlclkoIHk6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGNvbnN0IGN1cnJlbnRDZW50ZXJZID0gdGhpcy5nZXRDZW50ZXJZKCk7XHJcbiAgICBpZiAoIGlzRmluaXRlKCBjdXJyZW50Q2VudGVyWSApICkge1xyXG4gICAgICB0aGlzLnRyYW5zbGF0ZSggMCwgeSAtIGN1cnJlbnRDZW50ZXJZLCB0cnVlICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgc2V0Q2VudGVyWSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBjZW50ZXJZKCB2YWx1ZTogbnVtYmVyICkge1xyXG4gICAgdGhpcy5zZXRDZW50ZXJZKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldENlbnRlclgoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgY2VudGVyWSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2VudGVyWSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgWSB2YWx1ZSBvZiB0aGlzIG5vZGUncyB2ZXJ0aWNhbCBjZW50ZXIgKGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSlcclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXHJcbiAgICovXHJcbiAgcHVibGljIGdldENlbnRlclkoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdldEJvdW5kcygpLmdldENlbnRlclkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNoaWZ0cyB0aGlzIE5vZGUgdmVydGljYWxseSBzbyB0aGF0IGl0cyB0b3AgKGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSkgaXMgZXF1YWwgdG8gdGhlIHBhc3NlZC1pbiBZIHZhbHVlLlxyXG4gICAqXHJcbiAgICogTk9URTogdG9wIGlzIHRoZSBsb3dlc3QgWSB2YWx1ZSBpbiBvdXIgYm91bmRzLlxyXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdG9wIC0gQWZ0ZXIgdGhpcyBvcGVyYXRpb24sIG5vZGUudG9wIHNob3VsZCBhcHByb3hpbWF0ZWx5IGVxdWFsIHRoaXMgdmFsdWUuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFRvcCggdG9wOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBjb25zdCBjdXJyZW50VG9wID0gdGhpcy5nZXRUb3AoKTtcclxuICAgIGlmICggaXNGaW5pdGUoIGN1cnJlbnRUb3AgKSApIHtcclxuICAgICAgdGhpcy50cmFuc2xhdGUoIDAsIHRvcCAtIGN1cnJlbnRUb3AsIHRydWUgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRUb3AoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgdG9wKCB2YWx1ZTogbnVtYmVyICkge1xyXG4gICAgdGhpcy5zZXRUb3AoIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0VG9wKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHRvcCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBsb3dlc3QgWSB2YWx1ZSBvZiB0aGlzIG5vZGUncyBib3VuZGluZyBib3ggKGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSkuXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIG1heSByZXF1aXJlIGNvbXB1dGF0aW9uIG9mIHRoaXMgbm9kZSdzIHN1YnRyZWUgYm91bmRzLCB3aGljaCBtYXkgaW5jdXIgc29tZSBwZXJmb3JtYW5jZSBsb3NzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRUb3AoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdldEJvdW5kcygpLm1pblk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTaGlmdHMgdGhpcyBOb2RlIHZlcnRpY2FsbHkgc28gdGhhdCBpdHMgYm90dG9tIChpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUpIGlzIGVxdWFsIHRvIHRoZSBwYXNzZWQtaW4gWSB2YWx1ZS5cclxuICAgKlxyXG4gICAqIE5PVEU6IGJvdHRvbSBpcyB0aGUgaGlnaGVzdCBZIHZhbHVlIGluIG91ciBib3VuZHMuXHJcbiAgICogTk9URTogVGhpcyBtYXkgcmVxdWlyZSBjb21wdXRhdGlvbiBvZiB0aGlzIG5vZGUncyBzdWJ0cmVlIGJvdW5kcywgd2hpY2ggbWF5IGluY3VyIHNvbWUgcGVyZm9ybWFuY2UgbG9zcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBib3R0b20gLSBBZnRlciB0aGlzIG9wZXJhdGlvbiwgbm9kZS5ib3R0b20gc2hvdWxkIGFwcHJveGltYXRlbHkgZXF1YWwgdGhpcyB2YWx1ZS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0Qm90dG9tKCBib3R0b206IG51bWJlciApOiB0aGlzIHtcclxuICAgIGNvbnN0IGN1cnJlbnRCb3R0b20gPSB0aGlzLmdldEJvdHRvbSgpO1xyXG4gICAgaWYgKCBpc0Zpbml0ZSggY3VycmVudEJvdHRvbSApICkge1xyXG4gICAgICB0aGlzLnRyYW5zbGF0ZSggMCwgYm90dG9tIC0gY3VycmVudEJvdHRvbSwgdHJ1ZSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIHNldEJvdHRvbSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBib3R0b20oIHZhbHVlOiBudW1iZXIgKSB7XHJcbiAgICB0aGlzLnNldEJvdHRvbSggdmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRCb3R0b20oKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgYm90dG9tKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRCb3R0b20oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGhpZ2hlc3QgWSB2YWx1ZSBvZiB0aGlzIG5vZGUncyBib3VuZGluZyBib3ggKGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSkuXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIG1heSByZXF1aXJlIGNvbXB1dGF0aW9uIG9mIHRoaXMgbm9kZSdzIHN1YnRyZWUgYm91bmRzLCB3aGljaCBtYXkgaW5jdXIgc29tZSBwZXJmb3JtYW5jZSBsb3NzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRCb3R0b20oKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdldEJvdW5kcygpLm1heFk7XHJcbiAgfVxyXG5cclxuICAvKlxyXG4gICAqIENvbnZlbmllbmNlIGxvY2F0aW9uc1xyXG4gICAqXHJcbiAgICogVXBwZXIgaXMgaW4gdGVybXMgb2YgdGhlIHZpc3VhbCBsYXlvdXQgaW4gU2NlbmVyeSBhbmQgb3RoZXIgcHJvZ3JhbXMsIHNvIHRoZSBtaW5ZIGlzIHRoZSBcInVwcGVyXCIsIGFuZCBtaW5ZIGlzIHRoZSBcImxvd2VyXCJcclxuICAgKlxyXG4gICAqICAgICAgICAgICAgIGxlZnQgKHgpICAgICBjZW50ZXJYICAgICAgICByaWdodFxyXG4gICAqICAgICAgICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAqIHRvcCAgKHkpIHwgbGVmdFRvcCAgICAgY2VudGVyVG9wICAgICByaWdodFRvcFxyXG4gICAqIGNlbnRlclkgIHwgbGVmdENlbnRlciAgY2VudGVyICAgICAgICByaWdodENlbnRlclxyXG4gICAqIGJvdHRvbSAgIHwgbGVmdEJvdHRvbSAgY2VudGVyQm90dG9tICByaWdodEJvdHRvbVxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyByZXF1aXJlcyBjb21wdXRhdGlvbiBvZiB0aGlzIG5vZGUncyBzdWJ0cmVlIGJvdW5kcywgd2hpY2ggbWF5IGluY3VyIHNvbWUgcGVyZm9ybWFuY2UgbG9zcy5cclxuICAgKi9cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgcG9zaXRpb24gb2YgdGhlIHVwcGVyLWxlZnQgY29ybmVyIG9mIHRoaXMgbm9kZSdzIGJvdW5kcyB0byB0aGUgc3BlY2lmaWVkIHBvaW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRMZWZ0VG9wKCBsZWZ0VG9wOiBWZWN0b3IyICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGVmdFRvcC5pc0Zpbml0ZSgpLCAnbGVmdFRvcCBzaG91bGQgYmUgYSBmaW5pdGUgVmVjdG9yMicgKTtcclxuXHJcbiAgICBjb25zdCBjdXJyZW50TGVmdFRvcCA9IHRoaXMuZ2V0TGVmdFRvcCgpO1xyXG4gICAgaWYgKCBjdXJyZW50TGVmdFRvcC5pc0Zpbml0ZSgpICkge1xyXG4gICAgICB0aGlzLnRyYW5zbGF0ZSggbGVmdFRvcC5taW51cyggY3VycmVudExlZnRUb3AgKSwgdHJ1ZSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIHNldExlZnRUb3AoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgbGVmdFRvcCggdmFsdWU6IFZlY3RvcjIgKSB7XHJcbiAgICB0aGlzLnNldExlZnRUb3AoIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0TGVmdFRvcCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBsZWZ0VG9wKCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TGVmdFRvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdXBwZXItbGVmdCBjb3JuZXIgb2YgdGhpcyBub2RlJ3MgYm91bmRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRMZWZ0VG9wKCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCkuZ2V0TGVmdFRvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgcG9zaXRpb24gb2YgdGhlIGNlbnRlci10b3AgbG9jYXRpb24gb2YgdGhpcyBub2RlJ3MgYm91bmRzIHRvIHRoZSBzcGVjaWZpZWQgcG9pbnQuXHJcbiAgICovXHJcbiAgcHVibGljIHNldENlbnRlclRvcCggY2VudGVyVG9wOiBWZWN0b3IyICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2VudGVyVG9wLmlzRmluaXRlKCksICdjZW50ZXJUb3Agc2hvdWxkIGJlIGEgZmluaXRlIFZlY3RvcjInICk7XHJcblxyXG4gICAgY29uc3QgY3VycmVudENlbnRlclRvcCA9IHRoaXMuZ2V0Q2VudGVyVG9wKCk7XHJcbiAgICBpZiAoIGN1cnJlbnRDZW50ZXJUb3AuaXNGaW5pdGUoKSApIHtcclxuICAgICAgdGhpcy50cmFuc2xhdGUoIGNlbnRlclRvcC5taW51cyggY3VycmVudENlbnRlclRvcCApLCB0cnVlICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgc2V0Q2VudGVyVG9wKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IGNlbnRlclRvcCggdmFsdWU6IFZlY3RvcjIgKSB7XHJcbiAgICB0aGlzLnNldENlbnRlclRvcCggdmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRDZW50ZXJUb3AoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgY2VudGVyVG9wKCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2VudGVyVG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjZW50ZXItdG9wIGxvY2F0aW9uIG9mIHRoaXMgbm9kZSdzIGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q2VudGVyVG9wKCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCkuZ2V0Q2VudGVyVG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgdXBwZXItcmlnaHQgY29ybmVyIG9mIHRoaXMgbm9kZSdzIGJvdW5kcyB0byB0aGUgc3BlY2lmaWVkIHBvaW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRSaWdodFRvcCggcmlnaHRUb3A6IFZlY3RvcjIgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByaWdodFRvcC5pc0Zpbml0ZSgpLCAncmlnaHRUb3Agc2hvdWxkIGJlIGEgZmluaXRlIFZlY3RvcjInICk7XHJcblxyXG4gICAgY29uc3QgY3VycmVudFJpZ2h0VG9wID0gdGhpcy5nZXRSaWdodFRvcCgpO1xyXG4gICAgaWYgKCBjdXJyZW50UmlnaHRUb3AuaXNGaW5pdGUoKSApIHtcclxuICAgICAgdGhpcy50cmFuc2xhdGUoIHJpZ2h0VG9wLm1pbnVzKCBjdXJyZW50UmlnaHRUb3AgKSwgdHJ1ZSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIHNldFJpZ2h0VG9wKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IHJpZ2h0VG9wKCB2YWx1ZTogVmVjdG9yMiApIHtcclxuICAgIHRoaXMuc2V0UmlnaHRUb3AoIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0UmlnaHRUb3AoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgcmlnaHRUb3AoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRSaWdodFRvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdXBwZXItcmlnaHQgY29ybmVyIG9mIHRoaXMgbm9kZSdzIGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UmlnaHRUb3AoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRCb3VuZHMoKS5nZXRSaWdodFRvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgcG9zaXRpb24gb2YgdGhlIGNlbnRlci1sZWZ0IG9mIHRoaXMgbm9kZSdzIGJvdW5kcyB0byB0aGUgc3BlY2lmaWVkIHBvaW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRMZWZ0Q2VudGVyKCBsZWZ0Q2VudGVyOiBWZWN0b3IyICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGVmdENlbnRlci5pc0Zpbml0ZSgpLCAnbGVmdENlbnRlciBzaG91bGQgYmUgYSBmaW5pdGUgVmVjdG9yMicgKTtcclxuXHJcbiAgICBjb25zdCBjdXJyZW50TGVmdENlbnRlciA9IHRoaXMuZ2V0TGVmdENlbnRlcigpO1xyXG4gICAgaWYgKCBjdXJyZW50TGVmdENlbnRlci5pc0Zpbml0ZSgpICkge1xyXG4gICAgICB0aGlzLnRyYW5zbGF0ZSggbGVmdENlbnRlci5taW51cyggY3VycmVudExlZnRDZW50ZXIgKSwgdHJ1ZSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIHNldExlZnRDZW50ZXIoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgbGVmdENlbnRlciggdmFsdWU6IFZlY3RvcjIgKSB7XHJcbiAgICB0aGlzLnNldExlZnRDZW50ZXIoIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0TGVmdENlbnRlcigpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBsZWZ0Q2VudGVyKCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TGVmdENlbnRlcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY2VudGVyLWxlZnQgY29ybmVyIG9mIHRoaXMgbm9kZSdzIGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TGVmdENlbnRlcigpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLmdldEJvdW5kcygpLmdldExlZnRDZW50ZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGNlbnRlciBvZiB0aGlzIG5vZGUncyBib3VuZHMgdG8gdGhlIHNwZWNpZmllZCBwb2ludC5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q2VudGVyKCBjZW50ZXI6IFZlY3RvcjIgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjZW50ZXIuaXNGaW5pdGUoKSwgJ2NlbnRlciBzaG91bGQgYmUgYSBmaW5pdGUgVmVjdG9yMicgKTtcclxuXHJcbiAgICBjb25zdCBjdXJyZW50Q2VudGVyID0gdGhpcy5nZXRDZW50ZXIoKTtcclxuICAgIGlmICggY3VycmVudENlbnRlci5pc0Zpbml0ZSgpICkge1xyXG4gICAgICB0aGlzLnRyYW5zbGF0ZSggY2VudGVyLm1pbnVzKCBjdXJyZW50Q2VudGVyICksIHRydWUgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRDZW50ZXIoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgY2VudGVyKCB2YWx1ZTogVmVjdG9yMiApIHtcclxuICAgIHRoaXMuc2V0Q2VudGVyKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldENlbnRlcigpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBjZW50ZXIoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRDZW50ZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGNlbnRlciBvZiB0aGlzIG5vZGUncyBib3VuZHMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldENlbnRlcigpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLmdldEJvdW5kcygpLmdldENlbnRlcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgcG9zaXRpb24gb2YgdGhlIGNlbnRlci1yaWdodCBvZiB0aGlzIG5vZGUncyBib3VuZHMgdG8gdGhlIHNwZWNpZmllZCBwb2ludC5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0UmlnaHRDZW50ZXIoIHJpZ2h0Q2VudGVyOiBWZWN0b3IyICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmlnaHRDZW50ZXIuaXNGaW5pdGUoKSwgJ3JpZ2h0Q2VudGVyIHNob3VsZCBiZSBhIGZpbml0ZSBWZWN0b3IyJyApO1xyXG5cclxuICAgIGNvbnN0IGN1cnJlbnRSaWdodENlbnRlciA9IHRoaXMuZ2V0UmlnaHRDZW50ZXIoKTtcclxuICAgIGlmICggY3VycmVudFJpZ2h0Q2VudGVyLmlzRmluaXRlKCkgKSB7XHJcbiAgICAgIHRoaXMudHJhbnNsYXRlKCByaWdodENlbnRlci5taW51cyggY3VycmVudFJpZ2h0Q2VudGVyICksIHRydWUgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRSaWdodENlbnRlcigpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCByaWdodENlbnRlciggdmFsdWU6IFZlY3RvcjIgKSB7XHJcbiAgICB0aGlzLnNldFJpZ2h0Q2VudGVyKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldFJpZ2h0Q2VudGVyKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHJpZ2h0Q2VudGVyKCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmlnaHRDZW50ZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGNlbnRlci1yaWdodCBvZiB0aGlzIG5vZGUncyBib3VuZHMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFJpZ2h0Q2VudGVyKCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCkuZ2V0UmlnaHRDZW50ZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBsb3dlci1sZWZ0IGNvcm5lciBvZiB0aGlzIG5vZGUncyBib3VuZHMgdG8gdGhlIHNwZWNpZmllZCBwb2ludC5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0TGVmdEJvdHRvbSggbGVmdEJvdHRvbTogVmVjdG9yMiApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxlZnRCb3R0b20uaXNGaW5pdGUoKSwgJ2xlZnRCb3R0b20gc2hvdWxkIGJlIGEgZmluaXRlIFZlY3RvcjInICk7XHJcblxyXG4gICAgY29uc3QgY3VycmVudExlZnRCb3R0b20gPSB0aGlzLmdldExlZnRCb3R0b20oKTtcclxuICAgIGlmICggY3VycmVudExlZnRCb3R0b20uaXNGaW5pdGUoKSApIHtcclxuICAgICAgdGhpcy50cmFuc2xhdGUoIGxlZnRCb3R0b20ubWludXMoIGN1cnJlbnRMZWZ0Qm90dG9tICksIHRydWUgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRMZWZ0Qm90dG9tKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IGxlZnRCb3R0b20oIHZhbHVlOiBWZWN0b3IyICkge1xyXG4gICAgdGhpcy5zZXRMZWZ0Qm90dG9tKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldExlZnRCb3R0b20oKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgbGVmdEJvdHRvbSgpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLmdldExlZnRCb3R0b20oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGxvd2VyLWxlZnQgY29ybmVyIG9mIHRoaXMgbm9kZSdzIGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TGVmdEJvdHRvbSgpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLmdldEJvdW5kcygpLmdldExlZnRCb3R0b20oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBjZW50ZXItYm90dG9tIG9mIHRoaXMgbm9kZSdzIGJvdW5kcyB0byB0aGUgc3BlY2lmaWVkIHBvaW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRDZW50ZXJCb3R0b20oIGNlbnRlckJvdHRvbTogVmVjdG9yMiApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNlbnRlckJvdHRvbS5pc0Zpbml0ZSgpLCAnY2VudGVyQm90dG9tIHNob3VsZCBiZSBhIGZpbml0ZSBWZWN0b3IyJyApO1xyXG5cclxuICAgIGNvbnN0IGN1cnJlbnRDZW50ZXJCb3R0b20gPSB0aGlzLmdldENlbnRlckJvdHRvbSgpO1xyXG4gICAgaWYgKCBjdXJyZW50Q2VudGVyQm90dG9tLmlzRmluaXRlKCkgKSB7XHJcbiAgICAgIHRoaXMudHJhbnNsYXRlKCBjZW50ZXJCb3R0b20ubWludXMoIGN1cnJlbnRDZW50ZXJCb3R0b20gKSwgdHJ1ZSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIHNldENlbnRlckJvdHRvbSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBjZW50ZXJCb3R0b20oIHZhbHVlOiBWZWN0b3IyICkge1xyXG4gICAgdGhpcy5zZXRDZW50ZXJCb3R0b20oIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0Q2VudGVyQm90dG9tKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGNlbnRlckJvdHRvbSgpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLmdldENlbnRlckJvdHRvbSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY2VudGVyLWJvdHRvbSBvZiB0aGlzIG5vZGUncyBib3VuZHMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldENlbnRlckJvdHRvbSgpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLmdldEJvdW5kcygpLmdldENlbnRlckJvdHRvbSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgcG9zaXRpb24gb2YgdGhlIGxvd2VyLXJpZ2h0IGNvcm5lciBvZiB0aGlzIG5vZGUncyBib3VuZHMgdG8gdGhlIHNwZWNpZmllZCBwb2ludC5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0UmlnaHRCb3R0b20oIHJpZ2h0Qm90dG9tOiBWZWN0b3IyICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmlnaHRCb3R0b20uaXNGaW5pdGUoKSwgJ3JpZ2h0Qm90dG9tIHNob3VsZCBiZSBhIGZpbml0ZSBWZWN0b3IyJyApO1xyXG5cclxuICAgIGNvbnN0IGN1cnJlbnRSaWdodEJvdHRvbSA9IHRoaXMuZ2V0UmlnaHRCb3R0b20oKTtcclxuICAgIGlmICggY3VycmVudFJpZ2h0Qm90dG9tLmlzRmluaXRlKCkgKSB7XHJcbiAgICAgIHRoaXMudHJhbnNsYXRlKCByaWdodEJvdHRvbS5taW51cyggY3VycmVudFJpZ2h0Qm90dG9tICksIHRydWUgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRSaWdodEJvdHRvbSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCByaWdodEJvdHRvbSggdmFsdWU6IFZlY3RvcjIgKSB7XHJcbiAgICB0aGlzLnNldFJpZ2h0Qm90dG9tKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldFJpZ2h0Qm90dG9tKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHJpZ2h0Qm90dG9tKCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmlnaHRCb3R0b20oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGxvd2VyLXJpZ2h0IGNvcm5lciBvZiB0aGlzIG5vZGUncyBib3VuZHMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFJpZ2h0Qm90dG9tKCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCkuZ2V0UmlnaHRCb3R0b20oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHdpZHRoIG9mIHRoaXMgbm9kZSdzIGJvdW5kaW5nIGJveCAoaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lKS5cclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFdpZHRoKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRCb3VuZHMoKS5nZXRXaWR0aCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldFdpZHRoKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHdpZHRoKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRXaWR0aCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgaGVpZ2h0IG9mIHRoaXMgbm9kZSdzIGJvdW5kaW5nIGJveCAoaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lKS5cclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEhlaWdodCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCkuZ2V0SGVpZ2h0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0SGVpZ2h0KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGhlaWdodCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0SGVpZ2h0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB3aWR0aCBvZiB0aGlzIG5vZGUncyBib3VuZGluZyBib3ggKGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKS5cclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXHJcbiAgICovXHJcbiAgcHVibGljIGdldExvY2FsV2lkdGgoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdldExvY2FsQm91bmRzKCkuZ2V0V2lkdGgoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRMb2NhbFdpZHRoKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGxvY2FsV2lkdGgoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdldExvY2FsV2lkdGgoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGhlaWdodCBvZiB0aGlzIG5vZGUncyBib3VuZGluZyBib3ggKGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKS5cclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXHJcbiAgICovXHJcbiAgcHVibGljIGdldExvY2FsSGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbEJvdW5kcygpLmdldEhlaWdodCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldExvY2FsSGVpZ2h0KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGxvY2FsSGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbEhlaWdodCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgWCB2YWx1ZSBvZiB0aGUgbGVmdCBzaWRlIG9mIHRoZSBib3VuZGluZyBib3ggb2YgdGhpcyBOb2RlIChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIG1heSByZXF1aXJlIGNvbXB1dGF0aW9uIG9mIHRoaXMgbm9kZSdzIHN1YnRyZWUgYm91bmRzLCB3aGljaCBtYXkgaW5jdXIgc29tZSBwZXJmb3JtYW5jZSBsb3NzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRMb2NhbExlZnQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdldExvY2FsQm91bmRzKCkubWluWDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRMZWZ0KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGxvY2FsTGVmdCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxMZWZ0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBYIHZhbHVlIG9mIHRoZSByaWdodCBzaWRlIG9mIHRoZSBib3VuZGluZyBib3ggb2YgdGhpcyBOb2RlIChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIG1heSByZXF1aXJlIGNvbXB1dGF0aW9uIG9mIHRoaXMgbm9kZSdzIHN1YnRyZWUgYm91bmRzLCB3aGljaCBtYXkgaW5jdXIgc29tZSBwZXJmb3JtYW5jZSBsb3NzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRMb2NhbFJpZ2h0KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbEJvdW5kcygpLm1heFg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0UmlnaHQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgbG9jYWxSaWdodCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxSaWdodCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgWCB2YWx1ZSBvZiB0aGlzIG5vZGUncyBob3Jpem9udGFsIGNlbnRlciAoaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUpXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIG1heSByZXF1aXJlIGNvbXB1dGF0aW9uIG9mIHRoaXMgbm9kZSdzIHN1YnRyZWUgYm91bmRzLCB3aGljaCBtYXkgaW5jdXIgc29tZSBwZXJmb3JtYW5jZSBsb3NzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRMb2NhbENlbnRlclgoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdldExvY2FsQm91bmRzKCkuZ2V0Q2VudGVyWCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldENlbnRlclgoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgbG9jYWxDZW50ZXJYKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbENlbnRlclgoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIFkgdmFsdWUgb2YgdGhpcyBub2RlJ3MgdmVydGljYWwgY2VudGVyIChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSlcclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXHJcbiAgICovXHJcbiAgcHVibGljIGdldExvY2FsQ2VudGVyWSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxCb3VuZHMoKS5nZXRDZW50ZXJZKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0Q2VudGVyWCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBsb2NhbENlbnRlclkoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdldExvY2FsQ2VudGVyWSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbG93ZXN0IFkgdmFsdWUgb2YgdGhpcyBub2RlJ3MgYm91bmRpbmcgYm94IChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIG1heSByZXF1aXJlIGNvbXB1dGF0aW9uIG9mIHRoaXMgbm9kZSdzIHN1YnRyZWUgYm91bmRzLCB3aGljaCBtYXkgaW5jdXIgc29tZSBwZXJmb3JtYW5jZSBsb3NzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRMb2NhbFRvcCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxCb3VuZHMoKS5taW5ZO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldFRvcCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBsb2NhbFRvcCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxUb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGhpZ2hlc3QgWSB2YWx1ZSBvZiB0aGlzIG5vZGUncyBib3VuZGluZyBib3ggKGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKS5cclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXHJcbiAgICovXHJcbiAgcHVibGljIGdldExvY2FsQm90dG9tKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbEJvdW5kcygpLm1heFk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0TG9jYWxCb3R0b20oKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgbG9jYWxCb3R0b20oKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdldExvY2FsQm90dG9tKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB1cHBlci1sZWZ0IGNvcm5lciBvZiB0aGlzIG5vZGUncyBsb2NhbEJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TG9jYWxMZWZ0VG9wKCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxCb3VuZHMoKS5nZXRMZWZ0VG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0TG9jYWxMZWZ0VG9wKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGxvY2FsTGVmdFRvcCgpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLmdldExvY2FsTGVmdFRvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY2VudGVyLXRvcCBsb2NhdGlvbiBvZiB0aGlzIG5vZGUncyBsb2NhbEJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TG9jYWxDZW50ZXJUb3AoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbEJvdW5kcygpLmdldENlbnRlclRvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldExvY2FsQ2VudGVyVG9wKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGxvY2FsQ2VudGVyVG9wKCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxDZW50ZXJUb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHVwcGVyLXJpZ2h0IGNvcm5lciBvZiB0aGlzIG5vZGUncyBsb2NhbEJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TG9jYWxSaWdodFRvcCgpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLmdldExvY2FsQm91bmRzKCkuZ2V0UmlnaHRUb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRMb2NhbFJpZ2h0VG9wKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGxvY2FsUmlnaHRUb3AoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbFJpZ2h0VG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjZW50ZXItbGVmdCBjb3JuZXIgb2YgdGhpcyBub2RlJ3MgbG9jYWxCb3VuZHMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldExvY2FsTGVmdENlbnRlcigpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLmdldExvY2FsQm91bmRzKCkuZ2V0TGVmdENlbnRlcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldExvY2FsTGVmdENlbnRlcigpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBsb2NhbExlZnRDZW50ZXIoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbExlZnRDZW50ZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGNlbnRlciBvZiB0aGlzIG5vZGUncyBsb2NhbEJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TG9jYWxDZW50ZXIoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbEJvdW5kcygpLmdldENlbnRlcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldExvY2FsQ2VudGVyKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGxvY2FsQ2VudGVyKCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxDZW50ZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGNlbnRlci1yaWdodCBvZiB0aGlzIG5vZGUncyBsb2NhbEJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TG9jYWxSaWdodENlbnRlcigpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLmdldExvY2FsQm91bmRzKCkuZ2V0UmlnaHRDZW50ZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRMb2NhbFJpZ2h0Q2VudGVyKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGxvY2FsUmlnaHRDZW50ZXIoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbFJpZ2h0Q2VudGVyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBsb3dlci1sZWZ0IGNvcm5lciBvZiB0aGlzIG5vZGUncyBsb2NhbEJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TG9jYWxMZWZ0Qm90dG9tKCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxCb3VuZHMoKS5nZXRMZWZ0Qm90dG9tKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0TG9jYWxMZWZ0Qm90dG9tKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGxvY2FsTGVmdEJvdHRvbSgpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLmdldExvY2FsTGVmdEJvdHRvbSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY2VudGVyLWJvdHRvbSBvZiB0aGlzIG5vZGUncyBsb2NhbEJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TG9jYWxDZW50ZXJCb3R0b20oKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbEJvdW5kcygpLmdldENlbnRlckJvdHRvbSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldExvY2FsQ2VudGVyQm90dG9tKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGxvY2FsQ2VudGVyQm90dG9tKCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxDZW50ZXJCb3R0b20oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGxvd2VyLXJpZ2h0IGNvcm5lciBvZiB0aGlzIG5vZGUncyBsb2NhbEJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TG9jYWxSaWdodEJvdHRvbSgpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLmdldExvY2FsQm91bmRzKCkuZ2V0UmlnaHRCb3R0b20oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRMb2NhbFJpZ2h0Qm90dG9tKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGxvY2FsUmlnaHRCb3R0b20oKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbFJpZ2h0Qm90dG9tKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB1bmlxdWUgaW50ZWdyYWwgSUQgZm9yIHRoaXMgbm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0SWQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9pZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRJZCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBpZCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0SWQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIG91ciB2aXNpYmlsaXR5IFByb3BlcnR5IGNoYW5nZXMgdmFsdWVzLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgb25WaXNpYmxlUHJvcGVydHlDaGFuZ2UoIHZpc2libGU6IGJvb2xlYW4gKTogdm9pZCB7XHJcblxyXG4gICAgLy8gY2hhbmdpbmcgdmlzaWJpbGl0eSBjYW4gYWZmZWN0IHBpY2thYmlsaXR5IHBydW5pbmcsIHdoaWNoIGFmZmVjdHMgbW91c2UvdG91Y2ggYm91bmRzXHJcbiAgICB0aGlzLl9waWNrZXIub25WaXNpYmlsaXR5Q2hhbmdlKCk7XHJcblxyXG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9waWNrZXIuYXVkaXQoKTsgfVxyXG5cclxuICAgIC8vIERlZmluZWQgaW4gUGFyYWxsZWxET00uanNcclxuICAgIHRoaXMuX3Bkb21EaXNwbGF5c0luZm8ub25WaXNpYmlsaXR5Q2hhbmdlKCB2aXNpYmxlICk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcGFyZW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5fcGFyZW50c1sgaSBdO1xyXG4gICAgICBpZiAoIHBhcmVudC5fZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyApIHtcclxuICAgICAgICBwYXJlbnQuaW52YWxpZGF0ZUNoaWxkQm91bmRzKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgd2hhdCBQcm9wZXJ0eSBvdXIgdmlzaWJsZVByb3BlcnR5IGlzIGJhY2tlZCBieSwgc28gdGhhdCBjaGFuZ2VzIHRvIHRoaXMgcHJvdmlkZWQgUHJvcGVydHkgd2lsbCBjaGFuZ2UgdGhpc1xyXG4gICAqIE5vZGUncyB2aXNpYmlsaXR5LCBhbmQgdmljZSB2ZXJzYS4gVGhpcyBkb2VzIG5vdCBjaGFuZ2UgdGhpcy5fdmlzaWJsZVByb3BlcnR5LiBTZWUgVGlueUZvcndhcmRpbmdQcm9wZXJ0eS5zZXRUYXJnZXRQcm9wZXJ0eSgpXHJcbiAgICogZm9yIG1vcmUgaW5mby5cclxuICAgKlxyXG4gICAqIE5PVEUgRm9yIFBoRVQtaU8gdXNlOlxyXG4gICAqIEFsbCBQaEVULWlPIGluc3RydW1lbnRlZCBOb2RlcyBjcmVhdGUgdGhlaXIgb3duIGluc3RydW1lbnRlZCB2aXNpYmxlUHJvcGVydHkgKGlmIG9uZSBpcyBub3QgcGFzc2VkIGluIGFzXHJcbiAgICogYW4gb3B0aW9uKS4gT25jZSBhIE5vZGUncyB2aXNpYmxlUHJvcGVydHkgaGFzIGJlZW4gcmVnaXN0ZXJlZCB3aXRoIFBoRVQtaU8sIGl0IGNhbm5vdCBiZSBcInN3YXBwZWQgb3V0XCIgZm9yIGFub3RoZXIuXHJcbiAgICogSWYgeW91IG5lZWQgdG8gXCJkZWxheVwiIHNldHRpbmcgYW4gaW5zdHJ1bWVudGVkIHZpc2libGVQcm9wZXJ0eSB0byB0aGlzIG5vZGUsIHBhc3MgcGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkXHJcbiAgICogdG8gaW5zdHJ1bWVudGF0aW9uIGNhbGwgdG8gdGhpcyBOb2RlICh3aGVyZSBUYW5kZW0gaXMgcHJvdmlkZWQpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRWaXNpYmxlUHJvcGVydHkoIG5ld1RhcmdldDogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4gfCBudWxsICk6IHRoaXMge1xyXG4gICAgcmV0dXJuIHRoaXMuX3Zpc2libGVQcm9wZXJ0eS5zZXRUYXJnZXRQcm9wZXJ0eSggdGhpcywgVklTSUJMRV9QUk9QRVJUWV9UQU5ERU1fTkFNRSwgbmV3VGFyZ2V0IGFzIFRQcm9wZXJ0eTxib29sZWFuPiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIHNldFZpc2libGVQcm9wZXJ0eSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCB2aXNpYmxlUHJvcGVydHkoIHByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiB8IG51bGwgKSB7XHJcbiAgICB0aGlzLnNldFZpc2libGVQcm9wZXJ0eSggcHJvcGVydHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRWaXNpYmxlUHJvcGVydHkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgdmlzaWJsZVByb3BlcnR5KCk6IFRQcm9wZXJ0eTxib29sZWFuPiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRWaXNpYmxlUHJvcGVydHkoKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhpcyBOb2RlJ3MgdmlzaWJsZVByb3BlcnR5LiBOb3RlISBUaGlzIGlzIG5vdCB0aGUgcmVjaXByb2NhbCBvZiBzZXRWaXNpYmxlUHJvcGVydHkuIE5vZGUucHJvdG90eXBlLl92aXNpYmxlUHJvcGVydHlcclxuICAgKiBpcyBhIFRpbnlGb3J3YXJkaW5nUHJvcGVydHksIGFuZCBpcyBzZXQgdXAgdG8gbGlzdGVuIHRvIGNoYW5nZXMgZnJvbSB0aGUgdmlzaWJsZVByb3BlcnR5IHByb3ZpZGVkIGJ5XHJcbiAgICogc2V0VmlzaWJsZVByb3BlcnR5KCksIGJ1dCB0aGUgdW5kZXJseWluZyByZWZlcmVuY2UgZG9lcyBub3QgY2hhbmdlLiBUaGlzIG1lYW5zIHRoZSBmb2xsb3dpbmc6XHJcbiAgICogICAgICogY29uc3QgbXlOb2RlID0gbmV3IE5vZGUoKTtcclxuICAgKiBjb25zdCB2aXNpYmxlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICogbXlOb2RlLnNldFZpc2libGVQcm9wZXJ0eSggdmlzaWJsZVByb3BlcnR5IClcclxuICAgKiA9PiBteU5vZGUuZ2V0VmlzaWJsZVByb3BlcnR5KCkgIT09IHZpc2libGVQcm9wZXJ0eSAoISEhISEhKVxyXG4gICAqXHJcbiAgICogUGxlYXNlIHVzZSB0aGlzIHdpdGggY2F1dGlvbi4gU2VlIHNldFZpc2libGVQcm9wZXJ0eSgpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRWaXNpYmxlUHJvcGVydHkoKTogVFByb3BlcnR5PGJvb2xlYW4+IHtcclxuICAgIHJldHVybiB0aGlzLl92aXNpYmxlUHJvcGVydHk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHdoZXRoZXIgdGhpcyBOb2RlIGlzIHZpc2libGUuICBETyBOT1Qgb3ZlcnJpZGUgdGhpcyBhcyBhIHdheSBvZiBhZGRpbmcgYWRkaXRpb25hbCBiZWhhdmlvciB3aGVuIGEgTm9kZSdzXHJcbiAgICogdmlzaWJpbGl0eSBjaGFuZ2VzLCBhZGQgYSBsaXN0ZW5lciB0byB0aGlzLnZpc2libGVQcm9wZXJ0eSBpbnN0ZWFkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRWaXNpYmxlKCB2aXNpYmxlOiBib29sZWFuICk6IHRoaXMge1xyXG4gICAgdGhpcy52aXNpYmxlUHJvcGVydHkuc2V0KCB2aXNpYmxlICk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRWaXNpYmxlKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IHZpc2libGUoIHZhbHVlOiBib29sZWFuICkge1xyXG4gICAgdGhpcy5zZXRWaXNpYmxlKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGlzVmlzaWJsZSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCB2aXNpYmxlKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNWaXNpYmxlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBOb2RlIGlzIHZpc2libGUuXHJcbiAgICovXHJcbiAgcHVibGljIGlzVmlzaWJsZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLnZpc2libGVQcm9wZXJ0eS52YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVzZSB0aGlzIHRvIGF1dG9tYXRpY2FsbHkgY3JlYXRlIGEgZm9yd2FyZGVkLCBQaEVULWlPIGluc3RydW1lbnRlZCB2aXNpYmxlUHJvcGVydHkgaW50ZXJuYWwgdG8gTm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0UGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkKCBwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQ6IGJvb2xlYW4gKTogdGhpcyB7XHJcbiAgICByZXR1cm4gdGhpcy5fdmlzaWJsZVByb3BlcnR5LnNldFRhcmdldFByb3BlcnR5SW5zdHJ1bWVudGVkKCBwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQsIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRQaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgcGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkKCB2YWx1ZTogYm9vbGVhbiApIHtcclxuICAgIHRoaXMuc2V0UGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldFBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRQaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRQaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fdmlzaWJsZVByb3BlcnR5LmdldFRhcmdldFByb3BlcnR5SW5zdHJ1bWVudGVkKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTd2FwIHRoZSB2aXNpYmlsaXR5IG9mIHRoaXMgbm9kZSB3aXRoIGFub3RoZXIgbm9kZS4gVGhlIE5vZGUgdGhhdCBpcyBtYWRlIHZpc2libGUgd2lsbCByZWNlaXZlIGtleWJvYXJkIGZvY3VzXHJcbiAgICogaWYgaXQgaXMgZm9jdXNhYmxlIGFuZCB0aGUgcHJldmlvdXNseSB2aXNpYmxlIE5vZGUgaGFkIGZvY3VzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzd2FwVmlzaWJpbGl0eSggb3RoZXJOb2RlOiBOb2RlICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy52aXNpYmxlICE9PSBvdGhlck5vZGUudmlzaWJsZSApO1xyXG5cclxuICAgIGNvbnN0IHZpc2libGVOb2RlID0gdGhpcy52aXNpYmxlID8gdGhpcyA6IG90aGVyTm9kZTtcclxuICAgIGNvbnN0IGludmlzaWJsZU5vZGUgPSB0aGlzLnZpc2libGUgPyBvdGhlck5vZGUgOiB0aGlzO1xyXG5cclxuICAgIC8vIGlmIHRoZSB2aXNpYmxlIG5vZGUgaGFzIGZvY3VzIHdlIHdpbGwgcmVzdG9yZSBmb2N1cyBvbiB0aGUgaW52aXNpYmxlIE5vZGUgb25jZSBpdCBpcyB2aXNpYmxlXHJcbiAgICBjb25zdCB2aXNpYmxlTm9kZUZvY3VzZWQgPSB2aXNpYmxlTm9kZS5mb2N1c2VkO1xyXG5cclxuICAgIHZpc2libGVOb2RlLnZpc2libGUgPSBmYWxzZTtcclxuICAgIGludmlzaWJsZU5vZGUudmlzaWJsZSA9IHRydWU7XHJcblxyXG4gICAgaWYgKCB2aXNpYmxlTm9kZUZvY3VzZWQgJiYgaW52aXNpYmxlTm9kZS5mb2N1c2FibGUgKSB7XHJcbiAgICAgIGludmlzaWJsZU5vZGUuZm9jdXMoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIG9wYWNpdHkgb2YgdGhpcyBOb2RlIChhbmQgaXRzIHN1Yi10cmVlKSwgd2hlcmUgMCBpcyBmdWxseSB0cmFuc3BhcmVudCwgYW5kIDEgaXMgZnVsbHkgb3BhcXVlLiAgVmFsdWVzXHJcbiAgICogb3V0c2lkZSBvZiB0aGF0IHJhbmdlIHRocm93IGFuIEVycm9yLlxyXG4gICAqIEB0aHJvd3MgRXJyb3IgaWYgb3BhY2l0eSBvdXQgb2YgcmFuZ2VcclxuICAgKi9cclxuICBwdWJsaWMgc2V0T3BhY2l0eSggb3BhY2l0eTogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIG9wYWNpdHkgKSwgJ29wYWNpdHkgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcclxuXHJcbiAgICBpZiAoIG9wYWNpdHkgPCAwIHx8IG9wYWNpdHkgPiAxICkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBvcGFjaXR5IG91dCBvZiByYW5nZTogJHtvcGFjaXR5fWAgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm9wYWNpdHlQcm9wZXJ0eS52YWx1ZSA9IG9wYWNpdHk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgc2V0T3BhY2l0eSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBvcGFjaXR5KCB2YWx1ZTogbnVtYmVyICkge1xyXG4gICAgdGhpcy5zZXRPcGFjaXR5KCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldE9wYWNpdHkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgb3BhY2l0eSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0T3BhY2l0eSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgb3BhY2l0eSBvZiB0aGlzIG5vZGUuXHJcbiAgICovXHJcbiAgcHVibGljIGdldE9wYWNpdHkoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLm9wYWNpdHlQcm9wZXJ0eS52YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGRpc2FibGVkT3BhY2l0eSBvZiB0aGlzIE5vZGUgKGFuZCBpdHMgc3ViLXRyZWUpLCB3aGVyZSAwIGlzIGZ1bGx5IHRyYW5zcGFyZW50LCBhbmQgMSBpcyBmdWxseSBvcGFxdWUuXHJcbiAgICogVmFsdWVzIG91dHNpZGUgb2YgdGhhdCByYW5nZSB0aHJvdyBhbiBFcnJvci5cclxuICAgKiBAdGhyb3dzIEVycm9yIGlmIGRpc2FibGVkT3BhY2l0eSBvdXQgb2YgcmFuZ2VcclxuICAgKi9cclxuICBwdWJsaWMgc2V0RGlzYWJsZWRPcGFjaXR5KCBkaXNhYmxlZE9wYWNpdHk6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBkaXNhYmxlZE9wYWNpdHkgKSwgJ2Rpc2FibGVkT3BhY2l0eSBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyJyApO1xyXG5cclxuICAgIGlmICggZGlzYWJsZWRPcGFjaXR5IDwgMCB8fCBkaXNhYmxlZE9wYWNpdHkgPiAxICkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBkaXNhYmxlZE9wYWNpdHkgb3V0IG9mIHJhbmdlOiAke2Rpc2FibGVkT3BhY2l0eX1gICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kaXNhYmxlZE9wYWNpdHlQcm9wZXJ0eS52YWx1ZSA9IGRpc2FibGVkT3BhY2l0eTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXREaXNhYmxlZE9wYWNpdHkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgZGlzYWJsZWRPcGFjaXR5KCB2YWx1ZTogbnVtYmVyICkge1xyXG4gICAgdGhpcy5zZXREaXNhYmxlZE9wYWNpdHkoIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0RGlzYWJsZWRPcGFjaXR5KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGRpc2FibGVkT3BhY2l0eSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0RGlzYWJsZWRPcGFjaXR5KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBkaXNhYmxlZE9wYWNpdHkgb2YgdGhpcyBub2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXREaXNhYmxlZE9wYWNpdHkoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmRpc2FibGVkT3BhY2l0eVByb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgb3BhY2l0eSBhY3R1YWxseSBhcHBsaWVkIHRvIHRoZSBub2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRFZmZlY3RpdmVPcGFjaXR5KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5vcGFjaXR5UHJvcGVydHkudmFsdWUgKiAoIHRoaXMuZW5hYmxlZFByb3BlcnR5LnZhbHVlID8gMSA6IHRoaXMuZGlzYWJsZWRPcGFjaXR5UHJvcGVydHkudmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXREaXNhYmxlZE9wYWNpdHkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgZWZmZWN0aXZlT3BhY2l0eSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0RWZmZWN0aXZlT3BhY2l0eSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gb3VyIG9wYWNpdHkgb3Igb3RoZXIgZmlsdGVyIGNoYW5nZXMgdmFsdWVzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvbk9wYWNpdHlQcm9wZXJ0eUNoYW5nZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBvdXIgb3BhY2l0eSBvciBvdGhlciBmaWx0ZXIgY2hhbmdlcyB2YWx1ZXNcclxuICAgKi9cclxuICBwcml2YXRlIG9uRGlzYWJsZWRPcGFjaXR5UHJvcGVydHlDaGFuZ2UoKTogdm9pZCB7XHJcbiAgICBpZiAoICF0aGlzLl9lbmFibGVkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHRoaXMuZmlsdGVyQ2hhbmdlRW1pdHRlci5lbWl0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBub24tb3BhY2l0eSBmaWx0ZXJzIGZvciB0aGlzIE5vZGUuXHJcbiAgICpcclxuICAgKiBUaGUgZGVmYXVsdCBpcyBhbiBlbXB0eSBhcnJheSAobm8gZmlsdGVycykuIEl0IHNob3VsZCBiZSBhbiBhcnJheSBvZiBGaWx0ZXIgb2JqZWN0cywgd2hpY2ggd2lsbCBiZSBlZmZlY3RpdmVseVxyXG4gICAqIGFwcGxpZWQgaW4tb3JkZXIgb24gdGhpcyBOb2RlIChhbmQgaXRzIHN1YnRyZWUpLCBhbmQgd2lsbCBiZSBhcHBsaWVkIEJFRk9SRSBvcGFjaXR5L2NsaXBwaW5nLlxyXG4gICAqXHJcbiAgICogTk9URTogU29tZSBmaWx0ZXJzIG1heSBkZWNyZWFzZSBwZXJmb3JtYW5jZSAoYW5kIHRoaXMgbWF5IGJlIHBsYXRmb3JtLXNwZWNpZmljKS4gUGxlYXNlIHJlYWQgZG9jdW1lbnRhdGlvbiBmb3IgZWFjaFxyXG4gICAqIGZpbHRlciBiZWZvcmUgdXNpbmcuXHJcbiAgICpcclxuICAgKiBUeXBpY2FsIGZpbHRlciB0eXBlcyB0byB1c2UgYXJlOlxyXG4gICAqIC0gQnJpZ2h0bmVzc1xyXG4gICAqIC0gQ29udHJhc3RcclxuICAgKiAtIERyb3BTaGFkb3cgKEVYUEVSSU1FTlRBTClcclxuICAgKiAtIEdhdXNzaWFuQmx1ciAoRVhQRVJJTUVOVEFMKVxyXG4gICAqIC0gR3JheXNjYWxlIChHcmF5c2NhbGUuRlVMTCBmb3IgdGhlIGZ1bGwgZWZmZWN0KVxyXG4gICAqIC0gSHVlUm90YXRlXHJcbiAgICogLSBJbnZlcnQgKEludmVydC5GVUxMIGZvciB0aGUgZnVsbCBlZmZlY3QpXHJcbiAgICogLSBTYXR1cmF0ZVxyXG4gICAqIC0gU2VwaWEgKFNlcGlhLkZVTEwgZm9yIHRoZSBmdWxsIGVmZmVjdClcclxuICAgKlxyXG4gICAqIEZpbHRlci5qcyBoYXMgbW9yZSBpbmZvcm1hdGlvbiBpbiBnZW5lcmFsIG9uIGZpbHRlcnMuXHJcbiAgICovXHJcbiAgcHVibGljIHNldEZpbHRlcnMoIGZpbHRlcnM6IEZpbHRlcltdICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggZmlsdGVycyApLCAnZmlsdGVycyBzaG91bGQgYmUgYW4gYXJyYXknICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmV2ZXJ5KCBmaWx0ZXJzLCBmaWx0ZXIgPT4gZmlsdGVyIGluc3RhbmNlb2YgRmlsdGVyICksICdmaWx0ZXJzIHNob3VsZCBjb25zaXN0IG9mIEZpbHRlciBvYmplY3RzIG9ubHknICk7XHJcblxyXG4gICAgLy8gV2UgcmUtdXNlIHRoZSBzYW1lIGFycmF5IGludGVybmFsbHksIHNvIHdlIGRvbid0IHJlZmVyZW5jZSBhIHBvdGVudGlhbGx5LW11dGFibGUgYXJyYXkgZnJvbSBvdXRzaWRlLlxyXG4gICAgdGhpcy5fZmlsdGVycy5sZW5ndGggPSAwO1xyXG4gICAgdGhpcy5fZmlsdGVycy5wdXNoKCAuLi5maWx0ZXJzICk7XHJcblxyXG4gICAgdGhpcy5pbnZhbGlkYXRlSGludCgpO1xyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRGaWx0ZXJzKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IGZpbHRlcnMoIHZhbHVlOiBGaWx0ZXJbXSApIHtcclxuICAgIHRoaXMuc2V0RmlsdGVycyggdmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRGaWx0ZXJzKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGZpbHRlcnMoKTogRmlsdGVyW10ge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0RmlsdGVycygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbm9uLW9wYWNpdHkgZmlsdGVycyBmb3IgdGhpcyBOb2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRGaWx0ZXJzKCk6IEZpbHRlcltdIHtcclxuICAgIHJldHVybiB0aGlzLl9maWx0ZXJzLnNsaWNlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHdoYXQgUHJvcGVydHkgb3VyIHBpY2thYmxlUHJvcGVydHkgaXMgYmFja2VkIGJ5LCBzbyB0aGF0IGNoYW5nZXMgdG8gdGhpcyBwcm92aWRlZCBQcm9wZXJ0eSB3aWxsIGNoYW5nZSB0aGlzXHJcbiAgICogTm9kZSdzIHBpY2thYmlsaXR5LCBhbmQgdmljZSB2ZXJzYS4gVGhpcyBkb2VzIG5vdCBjaGFuZ2UgdGhpcy5fcGlja2FibGVQcm9wZXJ0eS4gU2VlIFRpbnlGb3J3YXJkaW5nUHJvcGVydHkuc2V0VGFyZ2V0UHJvcGVydHkoKVxyXG4gICAqIGZvciBtb3JlIGluZm8uXHJcbiAgICpcclxuICAgKiBQaEVULWlPIEluc3RydW1lbnRlZCBOb2RlcyBkbyBub3QgYnkgZGVmYXVsdCBjcmVhdGUgdGhlaXIgb3duIGluc3RydW1lbnRlZCBwaWNrYWJsZVByb3BlcnR5LCBldmVuIHRob3VnaCBOb2RlLnZpc2libGVQcm9wZXJ0eSBkb2VzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRQaWNrYWJsZVByb3BlcnR5KCBuZXdUYXJnZXQ6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4gfCBudWxsPiB8IG51bGwgKTogdGhpcyB7XHJcbiAgICByZXR1cm4gdGhpcy5fcGlja2FibGVQcm9wZXJ0eS5zZXRUYXJnZXRQcm9wZXJ0eSggdGhpcywgbnVsbCwgbmV3VGFyZ2V0IGFzIFRQcm9wZXJ0eTxib29sZWFuIHwgbnVsbD4gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRQaWNrYWJsZVByb3BlcnR5KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IHBpY2thYmxlUHJvcGVydHkoIHByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuIHwgbnVsbD4gfCBudWxsICkge1xyXG4gICAgdGhpcy5zZXRQaWNrYWJsZVByb3BlcnR5KCBwcm9wZXJ0eSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldFBpY2thYmxlUHJvcGVydHkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgcGlja2FibGVQcm9wZXJ0eSgpOiBUUHJvcGVydHk8Ym9vbGVhbiB8IG51bGw+IHtcclxuICAgIHJldHVybiB0aGlzLmdldFBpY2thYmxlUHJvcGVydHkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGlzIE5vZGUncyBwaWNrYWJsZVByb3BlcnR5LiBOb3RlISBUaGlzIGlzIG5vdCB0aGUgcmVjaXByb2NhbCBvZiBzZXRQaWNrYWJsZVByb3BlcnR5LiBOb2RlLnByb3RvdHlwZS5fcGlja2FibGVQcm9wZXJ0eVxyXG4gICAqIGlzIGEgVGlueUZvcndhcmRpbmdQcm9wZXJ0eSwgYW5kIGlzIHNldCB1cCB0byBsaXN0ZW4gdG8gY2hhbmdlcyBmcm9tIHRoZSBwaWNrYWJsZVByb3BlcnR5IHByb3ZpZGVkIGJ5XHJcbiAgICogc2V0UGlja2FibGVQcm9wZXJ0eSgpLCBidXQgdGhlIHVuZGVybHlpbmcgcmVmZXJlbmNlIGRvZXMgbm90IGNoYW5nZS4gVGhpcyBtZWFucyB0aGUgZm9sbG93aW5nOlxyXG4gICAqIGNvbnN0IG15Tm9kZSA9IG5ldyBOb2RlKCk7XHJcbiAgICogY29uc3QgcGlja2FibGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmFsc2UgKTtcclxuICAgKiBteU5vZGUuc2V0UGlja2FibGVQcm9wZXJ0eSggcGlja2FibGVQcm9wZXJ0eSApXHJcbiAgICogPT4gbXlOb2RlLmdldFBpY2thYmxlUHJvcGVydHkoKSAhPT0gcGlja2FibGVQcm9wZXJ0eSAoISEhISEhKVxyXG4gICAqXHJcbiAgICogUGxlYXNlIHVzZSB0aGlzIHdpdGggY2F1dGlvbi4gU2VlIHNldFBpY2thYmxlUHJvcGVydHkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UGlja2FibGVQcm9wZXJ0eSgpOiBUUHJvcGVydHk8Ym9vbGVhbiB8IG51bGw+IHtcclxuICAgIHJldHVybiB0aGlzLl9waWNrYWJsZVByb3BlcnR5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB3aGV0aGVyIHRoaXMgTm9kZSAoYW5kIGl0cyBzdWJ0cmVlKSB3aWxsIGFsbG93IGhpdC10ZXN0aW5nIChhbmQgdGh1cyB1c2VyIGludGVyYWN0aW9uKSwgY29udHJvbGxpbmcgd2hhdFxyXG4gICAqIFRyYWlsIGlzIHJldHVybmVkIGZyb20gbm9kZS50cmFpbFVuZGVyUG9pbnQoKS5cclxuICAgKlxyXG4gICAqIFBpY2thYmxlIGNhbiB0YWtlIG9uZSBvZiB0aHJlZSB2YWx1ZXM6XHJcbiAgICogLSBudWxsOiAoZGVmYXVsdCkgcGFzcy10aHJvdWdoIGJlaGF2aW9yLiBIaXQtdGVzdGluZyB3aWxsIHBydW5lIHRoaXMgc3VidHJlZSBpZiB0aGVyZSBhcmUgbm9cclxuICAgKiAgICAgICAgIGFuY2VzdG9ycy9kZXNjZW5kYW50cyB3aXRoIGVpdGhlciBwaWNrYWJsZTogdHJ1ZSBzZXQgb3Igd2l0aCBhbnkgaW5wdXQgbGlzdGVuZXJzLlxyXG4gICAqIC0gZmFsc2U6IEhpdC10ZXN0aW5nIGlzIHBydW5lZCwgbm90aGluZyBpbiB0aGlzIG5vZGUgb3IgaXRzIHN1YnRyZWUgd2lsbCByZXNwb25kIHRvIGV2ZW50cyBvciBiZSBwaWNrZWQuXHJcbiAgICogLSB0cnVlOiBIaXQtdGVzdGluZyB3aWxsIG5vdCBiZSBwcnVuZWQgaW4gdGhpcyBzdWJ0cmVlLCBleGNlcHQgZm9yIHBpY2thYmxlOiBmYWxzZSBjYXNlcy5cclxuICAgKlxyXG4gICAqIEhpdCB0ZXN0aW5nIGlzIGFjY29tcGxpc2hlZCBtYWlubHkgd2l0aCBub2RlLnRyYWlsVW5kZXJQb2ludGVyKCkgYW5kIG5vZGUudHJhaWxVbmRlclBvaW50KCksIGZvbGxvd2luZyB0aGVcclxuICAgKiBhYm92ZSBydWxlcy4gTm9kZXMgdGhhdCBhcmUgbm90IHBpY2thYmxlIChwcnVuZWQpIHdpbGwgbm90IGhhdmUgaW5wdXQgZXZlbnRzIHRhcmdldGVkIHRvIHRoZW0uXHJcbiAgICpcclxuICAgKiBUaGUgZm9sbG93aW5nIHJ1bGVzIChhcHBsaWVkIGluIHRoZSBnaXZlbiBvcmRlcikgZGV0ZXJtaW5lIHdoZXRoZXIgYSBOb2RlIChyZWFsbHksIGEgVHJhaWwpIHdpbGwgcmVjZWl2ZSBpbnB1dCBldmVudHM6XHJcbiAgICogMS4gSWYgdGhlIG5vZGUgb3Igb25lIG9mIGl0cyBhbmNlc3RvcnMgaGFzIHBpY2thYmxlOiBmYWxzZSBPUiBpcyBpbnZpc2libGUsIHRoZSBOb2RlICp3aWxsIG5vdCogcmVjZWl2ZSBldmVudHNcclxuICAgKiAgICBvciBoaXQgdGVzdGluZy5cclxuICAgKiAyLiBJZiB0aGUgTm9kZSBvciBvbmUgb2YgaXRzIGFuY2VzdG9ycyBvciBkZXNjZW5kYW50cyBpcyBwaWNrYWJsZTogdHJ1ZSBPUiBoYXMgYW4gaW5wdXQgbGlzdGVuZXIgYXR0YWNoZWQsIGl0XHJcbiAgICogICAgKndpbGwqIHJlY2VpdmUgZXZlbnRzIG9yIGhpdCB0ZXN0aW5nLlxyXG4gICAqIDMuIE90aGVyd2lzZSwgaXQgKndpbGwgbm90KiByZWNlaXZlIGV2ZW50cyBvciBoaXQgdGVzdGluZy5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdXNlZnVsIGZvciBzZW1pLXRyYW5zcGFyZW50IG92ZXJsYXlzIG9yIG90aGVyIHZpc3VhbCBlbGVtZW50cyB0aGF0IHNob3VsZCBiZSBkaXNwbGF5ZWQgYnV0IHNob3VsZCBub3RcclxuICAgKiBwcmV2ZW50IG9iamVjdHMgYmVsb3cgZnJvbSBiZWluZyBtYW5pcHVsYXRlZCBieSB1c2VyIGlucHV0LCBhbmQgdGhlIGRlZmF1bHQgbnVsbCB2YWx1ZSBpcyB1c2VkIHRvIGluY3JlYXNlXHJcbiAgICogcGVyZm9ybWFuY2UgYnkgaWdub3JpbmcgYXJlYXMgdGhhdCBkb24ndCBuZWVkIHVzZXIgaW5wdXQuXHJcbiAgICpcclxuICAgKiBOT1RFOiBJZiB5b3Ugd2FudCBzb21ldGhpbmcgdG8gYmUgcGlja2VkIFwibW91c2UgaXMgb3ZlciBpdFwiLCBidXQgYmxvY2sgaW5wdXQgZXZlbnRzIGV2ZW4gaWYgdGhlcmUgYXJlIGxpc3RlbmVycyxcclxuICAgKiAgICAgICB0aGVuIHBpY2thYmxlOmZhbHNlIGlzIG5vdCBhcHByb3ByaWF0ZSwgYW5kIGlucHV0RW5hYmxlZDpmYWxzZSBpcyBwcmVmZXJyZWQuXHJcbiAgICpcclxuICAgKiBGb3IgYSB2aXN1YWwgZXhhbXBsZSBvZiBob3cgcGlja2FiaWxpdHkgaW50ZXJhY3RzIHdpdGggaW5wdXQgbGlzdGVuZXJzIGFuZCB2aXNpYmlsaXR5LCBzZWUgdGhlIG5vdGVzIGF0IHRoZVxyXG4gICAqIGJvdHRvbSBvZiBodHRwOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2ltcGxlbWVudGF0aW9uLW5vdGVzLCBvciBzY2VuZXJ5L2Fzc2V0cy9waWNrYWJpbGl0eS5zdmcuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFBpY2thYmxlKCBwaWNrYWJsZTogYm9vbGVhbiB8IG51bGwgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwaWNrYWJsZSA9PT0gbnVsbCB8fCB0eXBlb2YgcGlja2FibGUgPT09ICdib29sZWFuJyApO1xyXG4gICAgdGhpcy5fcGlja2FibGVQcm9wZXJ0eS5zZXQoIHBpY2thYmxlICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgc2V0UGlja2FibGUoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgcGlja2FibGUoIHZhbHVlOiBib29sZWFuIHwgbnVsbCApIHtcclxuICAgIHRoaXMuc2V0UGlja2FibGUoIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgaXNQaWNrYWJsZSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBwaWNrYWJsZSgpOiBib29sZWFuIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5pc1BpY2thYmxlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBwaWNrYWJpbGl0eSBvZiB0aGlzIG5vZGUuXHJcbiAgICovXHJcbiAgcHVibGljIGlzUGlja2FibGUoKTogYm9vbGVhbiB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX3BpY2thYmxlUHJvcGVydHkudmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBvdXIgcGlja2FibGVQcm9wZXJ0eSBjaGFuZ2VzIHZhbHVlcy5cclxuICAgKi9cclxuICBwcml2YXRlIG9uUGlja2FibGVQcm9wZXJ0eUNoYW5nZSggcGlja2FibGU6IGJvb2xlYW4gfCBudWxsLCBvbGRQaWNrYWJsZTogYm9vbGVhbiB8IG51bGwgKTogdm9pZCB7XHJcbiAgICB0aGlzLl9waWNrZXIub25QaWNrYWJsZUNoYW5nZSggb2xkUGlja2FibGUsIHBpY2thYmxlICk7XHJcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7IHRoaXMuX3BpY2tlci5hdWRpdCgpOyB9XHJcbiAgICAvLyBUT0RPOiBpbnZhbGlkYXRlIHRoZSBjdXJzb3Igc29tZWhvdz8gIzE1MFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB3aGF0IFByb3BlcnR5IG91ciBlbmFibGVkUHJvcGVydHkgaXMgYmFja2VkIGJ5LCBzbyB0aGF0IGNoYW5nZXMgdG8gdGhpcyBwcm92aWRlZCBQcm9wZXJ0eSB3aWxsIGNoYW5nZSB0aGlzXHJcbiAgICogTm9kZSdzIGVuYWJsZWQsIGFuZCB2aWNlIHZlcnNhLiBUaGlzIGRvZXMgbm90IGNoYW5nZSB0aGlzLl9lbmFibGVkUHJvcGVydHkuIFNlZSBUaW55Rm9yd2FyZGluZ1Byb3BlcnR5LnNldFRhcmdldFByb3BlcnR5KClcclxuICAgKiBmb3IgbW9yZSBpbmZvLlxyXG4gICAqXHJcbiAgICpcclxuICAgKiBOT1RFIEZvciBQaEVULWlPIHVzZTpcclxuICAgKiBBbGwgUGhFVC1pTyBpbnN0cnVtZW50ZWQgTm9kZXMgY3JlYXRlIHRoZWlyIG93biBpbnN0cnVtZW50ZWQgZW5hYmxlZFByb3BlcnR5IChpZiBvbmUgaXMgbm90IHBhc3NlZCBpbiBhc1xyXG4gICAqIGFuIG9wdGlvbikuIE9uY2UgYSBOb2RlJ3MgZW5hYmxlZFByb3BlcnR5IGhhcyBiZWVuIHJlZ2lzdGVyZWQgd2l0aCBQaEVULWlPLCBpdCBjYW5ub3QgYmUgXCJzd2FwcGVkIG91dFwiIGZvciBhbm90aGVyLlxyXG4gICAqIElmIHlvdSBuZWVkIHRvIFwiZGVsYXlcIiBzZXR0aW5nIGFuIGluc3RydW1lbnRlZCBlbmFibGVkUHJvcGVydHkgdG8gdGhpcyBub2RlLCBwYXNzIHBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZFxyXG4gICAqIHRvIGluc3RydW1lbnRhdGlvbiBjYWxsIHRvIHRoaXMgTm9kZSAod2hlcmUgVGFuZGVtIGlzIHByb3ZpZGVkKS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0RW5hYmxlZFByb3BlcnR5KCBuZXdUYXJnZXQ6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+IHwgbnVsbCApOiB0aGlzIHtcclxuICAgIHJldHVybiB0aGlzLl9lbmFibGVkUHJvcGVydHkuc2V0VGFyZ2V0UHJvcGVydHkoIHRoaXMsIEVOQUJMRURfUFJPUEVSVFlfVEFOREVNX05BTUUsIG5ld1RhcmdldCBhcyBUUHJvcGVydHk8Ym9vbGVhbj4gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRFbmFibGVkUHJvcGVydHkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgZW5hYmxlZFByb3BlcnR5KCBwcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4gfCBudWxsICkge1xyXG4gICAgdGhpcy5zZXRFbmFibGVkUHJvcGVydHkoIHByb3BlcnR5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0RW5hYmxlZFByb3BlcnR5KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGVuYWJsZWRQcm9wZXJ0eSgpOiBUUHJvcGVydHk8Ym9vbGVhbj4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0RW5hYmxlZFByb3BlcnR5KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhpcyBOb2RlJ3MgZW5hYmxlZFByb3BlcnR5LiBOb3RlISBUaGlzIGlzIG5vdCB0aGUgcmVjaXByb2NhbCBvZiBzZXRFbmFibGVkUHJvcGVydHkuIE5vZGUucHJvdG90eXBlLl9lbmFibGVkUHJvcGVydHlcclxuICAgKiBpcyBhIFRpbnlGb3J3YXJkaW5nUHJvcGVydHksIGFuZCBpcyBzZXQgdXAgdG8gbGlzdGVuIHRvIGNoYW5nZXMgZnJvbSB0aGUgZW5hYmxlZFByb3BlcnR5IHByb3ZpZGVkIGJ5XHJcbiAgICogc2V0RW5hYmxlZFByb3BlcnR5KCksIGJ1dCB0aGUgdW5kZXJseWluZyByZWZlcmVuY2UgZG9lcyBub3QgY2hhbmdlLiBUaGlzIG1lYW5zIHRoZSBmb2xsb3dpbmc6XHJcbiAgICogY29uc3QgbXlOb2RlID0gbmV3IE5vZGUoKTtcclxuICAgKiBjb25zdCBlbmFibGVkUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICogbXlOb2RlLnNldEVuYWJsZWRQcm9wZXJ0eSggZW5hYmxlZFByb3BlcnR5IClcclxuICAgKiA9PiBteU5vZGUuZ2V0RW5hYmxlZFByb3BlcnR5KCkgIT09IGVuYWJsZWRQcm9wZXJ0eSAoISEhISEhKVxyXG4gICAqXHJcbiAgICogUGxlYXNlIHVzZSB0aGlzIHdpdGggY2F1dGlvbi4gU2VlIHNldEVuYWJsZWRQcm9wZXJ0eSgpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRFbmFibGVkUHJvcGVydHkoKTogVFByb3BlcnR5PGJvb2xlYW4+IHtcclxuICAgIHJldHVybiB0aGlzLl9lbmFibGVkUHJvcGVydHk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVc2UgdGhpcyB0byBhdXRvbWF0aWNhbGx5IGNyZWF0ZSBhIGZvcndhcmRlZCwgUGhFVC1pTyBpbnN0cnVtZW50ZWQgZW5hYmxlZFByb3BlcnR5IGludGVybmFsIHRvIE5vZGUuIFRoaXMgaXMgZGlmZmVyZW50XHJcbiAgICogZnJvbSB2aXNpYmxlIGJlY2F1c2UgZW5hYmxlZCBieSBkZWZhdWx0IGRvZXNuJ3Qgbm90IGNyZWF0ZSB0aGlzIGZvcndhcmRlZCBQcm9wZXJ0eS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0UGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkKCBwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ6IGJvb2xlYW4gKTogdGhpcyB7XHJcbiAgICByZXR1cm4gdGhpcy5fZW5hYmxlZFByb3BlcnR5LnNldFRhcmdldFByb3BlcnR5SW5zdHJ1bWVudGVkKCBwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQsIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRQaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkKCB2YWx1ZTogYm9vbGVhbiApIHtcclxuICAgIHRoaXMuc2V0UGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldFBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRQaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRQaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fZW5hYmxlZFByb3BlcnR5LmdldFRhcmdldFByb3BlcnR5SW5zdHJ1bWVudGVkKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHdoZXRoZXIgdGhpcyBOb2RlIGlzIGVuYWJsZWRcclxuICAgKi9cclxuICBwdWJsaWMgc2V0RW5hYmxlZCggZW5hYmxlZDogYm9vbGVhbiApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVuYWJsZWQgPT09IG51bGwgfHwgdHlwZW9mIGVuYWJsZWQgPT09ICdib29sZWFuJyApO1xyXG4gICAgdGhpcy5fZW5hYmxlZFByb3BlcnR5LnNldCggZW5hYmxlZCApO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIHNldEVuYWJsZWQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgZW5hYmxlZCggdmFsdWU6IGJvb2xlYW4gKSB7XHJcbiAgICB0aGlzLnNldEVuYWJsZWQoIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgaXNFbmFibGVkKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGVuYWJsZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5pc0VuYWJsZWQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGVuYWJsZWQgb2YgdGhpcyBub2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc0VuYWJsZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fZW5hYmxlZFByb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gZW5hYmxlZFByb3BlcnR5IGNoYW5nZXMgdmFsdWVzLlxyXG4gICAqIC0gb3ZlcnJpZGUgdGhpcyB0byBjaGFuZ2UgdGhlIGJlaGF2aW9yIG9mIGVuYWJsZWRcclxuICAgKi9cclxuICBwcm90ZWN0ZWQgb25FbmFibGVkUHJvcGVydHlDaGFuZ2UoIGVuYWJsZWQ6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICAhZW5hYmxlZCAmJiB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xyXG4gICAgdGhpcy5pbnB1dEVuYWJsZWQgPSBlbmFibGVkO1xyXG5cclxuICAgIGlmICggdGhpcy5kaXNhYmxlZE9wYWNpdHlQcm9wZXJ0eS52YWx1ZSAhPT0gMSApIHtcclxuICAgICAgdGhpcy5maWx0ZXJDaGFuZ2VFbWl0dGVyLmVtaXQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgd2hhdCBQcm9wZXJ0eSBvdXIgaW5wdXRFbmFibGVkUHJvcGVydHkgaXMgYmFja2VkIGJ5LCBzbyB0aGF0IGNoYW5nZXMgdG8gdGhpcyBwcm92aWRlZCBQcm9wZXJ0eSB3aWxsIGNoYW5nZSB0aGlzIHdoZXRoZXIgdGhpc1xyXG4gICAqIE5vZGUncyBpbnB1dCBpcyBlbmFibGVkLCBhbmQgdmljZSB2ZXJzYS4gVGhpcyBkb2VzIG5vdCBjaGFuZ2UgdGhpcy5faW5wdXRFbmFibGVkUHJvcGVydHkuIFNlZSBUaW55Rm9yd2FyZGluZ1Byb3BlcnR5LnNldFRhcmdldFByb3BlcnR5KClcclxuICAgKiBmb3IgbW9yZSBpbmZvLlxyXG4gICAqXHJcbiAgICogTk9URSBGb3IgUGhFVC1pTyB1c2U6XHJcbiAgICogQWxsIFBoRVQtaU8gaW5zdHJ1bWVudGVkIE5vZGVzIGNyZWF0ZSB0aGVpciBvd24gaW5zdHJ1bWVudGVkIGlucHV0RW5hYmxlZFByb3BlcnR5IChpZiBvbmUgaXMgbm90IHBhc3NlZCBpbiBhc1xyXG4gICAqIGFuIG9wdGlvbikuIE9uY2UgYSBOb2RlJ3MgaW5wdXRFbmFibGVkUHJvcGVydHkgaGFzIGJlZW4gcmVnaXN0ZXJlZCB3aXRoIFBoRVQtaU8sIGl0IGNhbm5vdCBiZSBcInN3YXBwZWQgb3V0XCIgZm9yIGFub3RoZXIuXHJcbiAgICogSWYgeW91IG5lZWQgdG8gXCJkZWxheVwiIHNldHRpbmcgYW4gaW5zdHJ1bWVudGVkIGlucHV0RW5hYmxlZFByb3BlcnR5IHRvIHRoaXMgbm9kZSwgcGFzcyBwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZFxyXG4gICAqIHRvIGluc3RydW1lbnRhdGlvbiBjYWxsIHRvIHRoaXMgTm9kZSAod2hlcmUgVGFuZGVtIGlzIHByb3ZpZGVkKS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0SW5wdXRFbmFibGVkUHJvcGVydHkoIG5ld1RhcmdldDogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4gfCBudWxsICk6IHRoaXMge1xyXG4gICAgcmV0dXJuIHRoaXMuX2lucHV0RW5hYmxlZFByb3BlcnR5LnNldFRhcmdldFByb3BlcnR5KCB0aGlzLCBJTlBVVF9FTkFCTEVEX1BST1BFUlRZX1RBTkRFTV9OQU1FLCBuZXdUYXJnZXQgYXMgVFByb3BlcnR5PGJvb2xlYW4+ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgc2V0SW5wdXRFbmFibGVkUHJvcGVydHkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgaW5wdXRFbmFibGVkUHJvcGVydHkoIHByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiB8IG51bGwgKSB7XHJcbiAgICB0aGlzLnNldElucHV0RW5hYmxlZFByb3BlcnR5KCBwcm9wZXJ0eSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldElucHV0RW5hYmxlZFByb3BlcnR5KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGlucHV0RW5hYmxlZFByb3BlcnR5KCk6IFRQcm9wZXJ0eTxib29sZWFuPiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRJbnB1dEVuYWJsZWRQcm9wZXJ0eSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoaXMgTm9kZSdzIGlucHV0RW5hYmxlZFByb3BlcnR5LiBOb3RlISBUaGlzIGlzIG5vdCB0aGUgcmVjaXByb2NhbCBvZiBzZXRJbnB1dEVuYWJsZWRQcm9wZXJ0eS4gTm9kZS5wcm90b3R5cGUuX2lucHV0RW5hYmxlZFByb3BlcnR5XHJcbiAgICogaXMgYSBUaW55Rm9yd2FyZGluZ1Byb3BlcnR5LCBhbmQgaXMgc2V0IHVwIHRvIGxpc3RlbiB0byBjaGFuZ2VzIGZyb20gdGhlIGlucHV0RW5hYmxlZFByb3BlcnR5IHByb3ZpZGVkIGJ5XHJcbiAgICogc2V0SW5wdXRFbmFibGVkUHJvcGVydHkoKSwgYnV0IHRoZSB1bmRlcmx5aW5nIHJlZmVyZW5jZSBkb2VzIG5vdCBjaGFuZ2UuIFRoaXMgbWVhbnMgdGhlIGZvbGxvd2luZzpcclxuICAgKiBjb25zdCBteU5vZGUgPSBuZXcgTm9kZSgpO1xyXG4gICAqIGNvbnN0IGlucHV0RW5hYmxlZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xyXG4gICAqIG15Tm9kZS5zZXRJbnB1dEVuYWJsZWRQcm9wZXJ0eSggaW5wdXRFbmFibGVkUHJvcGVydHkgKVxyXG4gICAqID0+IG15Tm9kZS5nZXRJbnB1dEVuYWJsZWRQcm9wZXJ0eSgpICE9PSBpbnB1dEVuYWJsZWRQcm9wZXJ0eSAoISEhISEhKVxyXG4gICAqXHJcbiAgICogUGxlYXNlIHVzZSB0aGlzIHdpdGggY2F1dGlvbi4gU2VlIHNldElucHV0RW5hYmxlZFByb3BlcnR5KCkgZm9yIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIGdldElucHV0RW5hYmxlZFByb3BlcnR5KCk6IFRQcm9wZXJ0eTxib29sZWFuPiB7XHJcbiAgICByZXR1cm4gdGhpcy5faW5wdXRFbmFibGVkUHJvcGVydHk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVc2UgdGhpcyB0byBhdXRvbWF0aWNhbGx5IGNyZWF0ZSBhIGZvcndhcmRlZCwgUGhFVC1pTyBpbnN0cnVtZW50ZWQgaW5wdXRFbmFibGVkUHJvcGVydHkgaW50ZXJuYWwgdG8gTm9kZS4gVGhpcyBpcyBkaWZmZXJlbnRcclxuICAgKiBmcm9tIHZpc2libGUgYmVjYXVzZSBpbnB1dEVuYWJsZWQgYnkgZGVmYXVsdCBkb2Vzbid0IG5vdCBjcmVhdGUgdGhpcyBmb3J3YXJkZWQgUHJvcGVydHkuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkKCBwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogYm9vbGVhbiApOiB0aGlzIHtcclxuICAgIHJldHVybiB0aGlzLl9pbnB1dEVuYWJsZWRQcm9wZXJ0eS5zZXRUYXJnZXRQcm9wZXJ0eUluc3RydW1lbnRlZCggcGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQsIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRQaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCggdmFsdWU6IGJvb2xlYW4gKSB7XHJcbiAgICB0aGlzLnNldFBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldFBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0UGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRQaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9pbnB1dEVuYWJsZWRQcm9wZXJ0eS5nZXRUYXJnZXRQcm9wZXJ0eUluc3RydW1lbnRlZCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB3aGV0aGVyIGlucHV0IGlzIGVuYWJsZWQgZm9yIHRoaXMgTm9kZSBhbmQgaXRzIHN1YnRyZWUuIElmIGZhbHNlLCBpbnB1dCBldmVudCBsaXN0ZW5lcnMgd2lsbCBub3QgYmUgZmlyZWRcclxuICAgKiBvbiB0aGlzIE5vZGUgb3IgaXRzIGRlc2NlbmRhbnRzIGluIHRoZSBwaWNrZWQgVHJhaWwuIFRoaXMgZG9lcyBOT1QgZWZmZWN0IHBpY2tpbmcgKHdoYXQgVHJhaWwvbm9kZXMgYXJlIHVuZGVyXHJcbiAgICogYSBwb2ludGVyKSwgYnV0IG9ubHkgZWZmZWN0cyB3aGF0IGxpc3RlbmVycyBhcmUgZmlyZWQuXHJcbiAgICpcclxuICAgKiBBZGRpdGlvbmFsbHksIHRoaXMgd2lsbCBhZmZlY3QgY3Vyc29yIGJlaGF2aW9yLiBJZiBpbnB1dEVuYWJsZWQ9ZmFsc2UsIGRlc2NlbmRhbnRzIG9mIHRoaXMgTm9kZSB3aWxsIG5vdCBiZVxyXG4gICAqIGNoZWNrZWQgd2hlbiBkZXRlcm1pbmluZyB3aGF0IGN1cnNvciB3aWxsIGJlIHNob3duLiBJbnN0ZWFkLCBpZiBhIHBvaW50ZXIgKGUuZy4gbW91c2UpIGlzIG92ZXIgYSBkZXNjZW5kYW50LFxyXG4gICAqIHRoaXMgTm9kZSdzIGN1cnNvciB3aWxsIGJlIGNoZWNrZWQgZmlyc3QsIHRoZW4gYW5jZXN0b3JzIHdpbGwgYmUgY2hlY2tlZCBhcyBub3JtYWwuXHJcbiAgICovXHJcbiAgcHVibGljIHNldElucHV0RW5hYmxlZCggaW5wdXRFbmFibGVkOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgdGhpcy5pbnB1dEVuYWJsZWRQcm9wZXJ0eS52YWx1ZSA9IGlucHV0RW5hYmxlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRJbnB1dEVuYWJsZWQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgaW5wdXRFbmFibGVkKCB2YWx1ZTogYm9vbGVhbiApIHtcclxuICAgIHRoaXMuc2V0SW5wdXRFbmFibGVkKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGlzSW5wdXRFbmFibGVkKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGlucHV0RW5hYmxlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmlzSW5wdXRFbmFibGVkKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgaW5wdXQgaXMgZW5hYmxlZCBmb3IgdGhpcyBOb2RlIGFuZCBpdHMgc3VidHJlZS4gU2VlIHNldElucHV0RW5hYmxlZCBmb3IgbW9yZSBkb2N1bWVudGF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc0lucHV0RW5hYmxlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmlucHV0RW5hYmxlZFByb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBhbGwgb2YgdGhlIGlucHV0IGxpc3RlbmVycyBhdHRhY2hlZCB0byB0aGlzIE5vZGUuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gcmVtb3ZpbmcgYWxsIGN1cnJlbnQgaW5wdXQgbGlzdGVuZXJzIHdpdGggcmVtb3ZlSW5wdXRMaXN0ZW5lcigpIGFuZCBhZGRpbmcgYWxsIG5ld1xyXG4gICAqIGxpc3RlbmVycyAoaW4gb3JkZXIpIHdpdGggYWRkSW5wdXRMaXN0ZW5lcigpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRJbnB1dExpc3RlbmVycyggaW5wdXRMaXN0ZW5lcnM6IFRJbnB1dExpc3RlbmVyW10gKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBpbnB1dExpc3RlbmVycyApICk7XHJcblxyXG4gICAgLy8gUmVtb3ZlIGFsbCBvbGQgaW5wdXQgbGlzdGVuZXJzXHJcbiAgICB3aGlsZSAoIHRoaXMuX2lucHV0TGlzdGVuZXJzLmxlbmd0aCApIHtcclxuICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9pbnB1dExpc3RlbmVyc1sgMCBdICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIGluIGFsbCBuZXcgaW5wdXQgbGlzdGVuZXJzXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBpbnB1dExpc3RlbmVycy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCBpbnB1dExpc3RlbmVyc1sgaSBdICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgc2V0SW5wdXRMaXN0ZW5lcnMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgaW5wdXRMaXN0ZW5lcnMoIHZhbHVlOiBUSW5wdXRMaXN0ZW5lcltdICkge1xyXG4gICAgdGhpcy5zZXRJbnB1dExpc3RlbmVycyggdmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRJbnB1dExpc3RlbmVycygpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBpbnB1dExpc3RlbmVycygpOiBUSW5wdXRMaXN0ZW5lcltdIHtcclxuICAgIHJldHVybiB0aGlzLmdldElucHV0TGlzdGVuZXJzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgY29weSBvZiBhbGwgb2Ygb3VyIGlucHV0IGxpc3RlbmVycy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0SW5wdXRMaXN0ZW5lcnMoKTogVElucHV0TGlzdGVuZXJbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5faW5wdXRMaXN0ZW5lcnMuc2xpY2UoIDAgKTsgLy8gZGVmZW5zaXZlIGNvcHlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIENTUyBjdXJzb3Igc3RyaW5nIHRoYXQgc2hvdWxkIGJlIHVzZWQgd2hlbiB0aGUgbW91c2UgaXMgb3ZlciB0aGlzIG5vZGUuIG51bGwgaXMgdGhlIGRlZmF1bHQsIGFuZFxyXG4gICAqIGluZGljYXRlcyB0aGF0IGFuY2VzdG9yIG5vZGVzIChvciB0aGUgYnJvd3NlciBkZWZhdWx0KSBzaG91bGQgYmUgdXNlZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjdXJzb3IgLSBBIENTUyBjdXJzb3Igc3RyaW5nLCBsaWtlICdwb2ludGVyJywgb3IgJ25vbmUnIC0gRXhhbXBsZXMgYXJlOlxyXG4gICAqIGF1dG8gZGVmYXVsdCBub25lIGluaGVyaXQgaGVscCBwb2ludGVyIHByb2dyZXNzIHdhaXQgY3Jvc3NoYWlyIHRleHQgdmVydGljYWwtdGV4dCBhbGlhcyBjb3B5IG1vdmUgbm8tZHJvcCBub3QtYWxsb3dlZFxyXG4gICAqIGUtcmVzaXplIG4tcmVzaXplIHctcmVzaXplIHMtcmVzaXplIG53LXJlc2l6ZSBuZS1yZXNpemUgc2UtcmVzaXplIHN3LXJlc2l6ZSBldy1yZXNpemUgbnMtcmVzaXplIG5lc3ctcmVzaXplIG53c2UtcmVzaXplXHJcbiAgICogY29udGV4dC1tZW51IGNlbGwgY29sLXJlc2l6ZSByb3ctcmVzaXplIGFsbC1zY3JvbGwgdXJsKCAuLi4gKSAtLT4gZG9lcyBpdCBzdXBwb3J0IGRhdGEgVVJMcz9cclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q3Vyc29yKCBjdXJzb3I6IHN0cmluZyB8IG51bGwgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gVE9ETzogY29uc2lkZXIgYSBtYXBwaW5nIG9mIHR5cGVzIHRvIHNldCByZWFzb25hYmxlIGRlZmF1bHRzXHJcblxyXG4gICAgLy8gYWxsb3cgdGhlICdhdXRvJyBjdXJzb3IgdHlwZSB0byBsZXQgdGhlIGFuY2VzdG9ycyBvciBzY2VuZSBwaWNrIHRoZSBjdXJzb3IgdHlwZVxyXG4gICAgdGhpcy5fY3Vyc29yID0gY3Vyc29yID09PSAnYXV0bycgPyBudWxsIDogY3Vyc29yO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIHNldEN1cnNvcigpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBjdXJzb3IoIHZhbHVlOiBzdHJpbmcgfCBudWxsICkge1xyXG4gICAgdGhpcy5zZXRDdXJzb3IoIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0Q3Vyc29yKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGN1cnNvcigpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLmdldEN1cnNvcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgQ1NTIGN1cnNvciBzdHJpbmcgZm9yIHRoaXMgbm9kZSwgb3IgbnVsbCBpZiB0aGVyZSBpcyBubyBjdXJzb3Igc3BlY2lmaWVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDdXJzb3IoKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fY3Vyc29yO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgQ1NTIGN1cnNvciB0aGF0IGNvdWxkIGJlIGFwcGxpZWQgZWl0aGVyIGJ5IHRoaXMgTm9kZSBpdHNlbGYsIG9yIGZyb20gYW55IG9mIGl0cyBpbnB1dCBsaXN0ZW5lcnMnXHJcbiAgICogcHJlZmVyZW5jZXMuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRFZmZlY3RpdmVDdXJzb3IoKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICBpZiAoIHRoaXMuX2N1cnNvciApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2N1cnNvcjtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9pbnB1dExpc3RlbmVycy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgaW5wdXRMaXN0ZW5lciA9IHRoaXMuX2lucHV0TGlzdGVuZXJzWyBpIF07XHJcblxyXG4gICAgICBpZiAoIGlucHV0TGlzdGVuZXIuY3Vyc29yICkge1xyXG4gICAgICAgIHJldHVybiBpbnB1dExpc3RlbmVyLmN1cnNvcjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgaGl0LXRlc3RlZCBtb3VzZSBhcmVhIGZvciB0aGlzIE5vZGUgKHNlZSBjb25zdHJ1Y3RvciBmb3IgbW9yZSBhZHZhbmNlZCBkb2N1bWVudGF0aW9uKS4gVXNlIG51bGwgZm9yIHRoZVxyXG4gICAqIGRlZmF1bHQgYmVoYXZpb3IuXHJcbiAgICovXHJcbiAgcHVibGljIHNldE1vdXNlQXJlYSggYXJlYTogU2hhcGUgfCBCb3VuZHMyIHwgbnVsbCApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFyZWEgPT09IG51bGwgfHwgYXJlYSBpbnN0YW5jZW9mIFNoYXBlIHx8IGFyZWEgaW5zdGFuY2VvZiBCb3VuZHMyLCAnbW91c2VBcmVhIG5lZWRzIHRvIGJlIGEgcGhldC5raXRlLlNoYXBlLCBwaGV0LmRvdC5Cb3VuZHMyLCBvciBudWxsJyApO1xyXG5cclxuICAgIGlmICggdGhpcy5fbW91c2VBcmVhICE9PSBhcmVhICkge1xyXG4gICAgICB0aGlzLl9tb3VzZUFyZWEgPSBhcmVhOyAvLyBUT0RPOiBjb3VsZCBjaGFuZ2Ugd2hhdCBpcyB1bmRlciB0aGUgbW91c2UsIGludmFsaWRhdGUhXHJcblxyXG4gICAgICB0aGlzLl9waWNrZXIub25Nb3VzZUFyZWFDaGFuZ2UoKTtcclxuICAgICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9waWNrZXIuYXVkaXQoKTsgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIHNldE1vdXNlQXJlYSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBtb3VzZUFyZWEoIHZhbHVlOiBTaGFwZSB8IEJvdW5kczIgfCBudWxsICkge1xyXG4gICAgdGhpcy5zZXRNb3VzZUFyZWEoIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgZ2V0TW91c2VBcmVhKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IG1vdXNlQXJlYSgpOiBTaGFwZSB8IEJvdW5kczIgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLmdldE1vdXNlQXJlYSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgaGl0LXRlc3RlZCBtb3VzZSBhcmVhIGZvciB0aGlzIG5vZGUuXHJcbiAgICovXHJcbiAgcHVibGljIGdldE1vdXNlQXJlYSgpOiBTaGFwZSB8IEJvdW5kczIgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9tb3VzZUFyZWE7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBoaXQtdGVzdGVkIHRvdWNoIGFyZWEgZm9yIHRoaXMgTm9kZSAoc2VlIGNvbnN0cnVjdG9yIGZvciBtb3JlIGFkdmFuY2VkIGRvY3VtZW50YXRpb24pLiBVc2UgbnVsbCBmb3IgdGhlXHJcbiAgICogZGVmYXVsdCBiZWhhdmlvci5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0VG91Y2hBcmVhKCBhcmVhOiBTaGFwZSB8IEJvdW5kczIgfCBudWxsICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYXJlYSA9PT0gbnVsbCB8fCBhcmVhIGluc3RhbmNlb2YgU2hhcGUgfHwgYXJlYSBpbnN0YW5jZW9mIEJvdW5kczIsICd0b3VjaEFyZWEgbmVlZHMgdG8gYmUgYSBwaGV0LmtpdGUuU2hhcGUsIHBoZXQuZG90LkJvdW5kczIsIG9yIG51bGwnICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl90b3VjaEFyZWEgIT09IGFyZWEgKSB7XHJcbiAgICAgIHRoaXMuX3RvdWNoQXJlYSA9IGFyZWE7IC8vIFRPRE86IGNvdWxkIGNoYW5nZSB3aGF0IGlzIHVuZGVyIHRoZSB0b3VjaCwgaW52YWxpZGF0ZSFcclxuXHJcbiAgICAgIHRoaXMuX3BpY2tlci5vblRvdWNoQXJlYUNoYW5nZSgpO1xyXG4gICAgICBpZiAoIGFzc2VydFNsb3cgKSB7IHRoaXMuX3BpY2tlci5hdWRpdCgpOyB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgc2V0VG91Y2hBcmVhKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IHRvdWNoQXJlYSggdmFsdWU6IFNoYXBlIHwgQm91bmRzMiB8IG51bGwgKSB7XHJcbiAgICB0aGlzLnNldFRvdWNoQXJlYSggdmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRUb3VjaEFyZWEoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgdG91Y2hBcmVhKCk6IFNoYXBlIHwgQm91bmRzMiB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VG91Y2hBcmVhKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBoaXQtdGVzdGVkIHRvdWNoIGFyZWEgZm9yIHRoaXMgbm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VG91Y2hBcmVhKCk6IFNoYXBlIHwgQm91bmRzMiB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX3RvdWNoQXJlYTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgYSBjbGlwcGVkIHNoYXBlIHdoZXJlIG9ubHkgY29udGVudCBpbiBvdXIgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSB0aGF0IGlzIGluc2lkZSB0aGUgY2xpcCBhcmVhIHdpbGwgYmUgc2hvd25cclxuICAgKiAoYW55dGhpbmcgb3V0c2lkZSBpcyBmdWxseSB0cmFuc3BhcmVudCkuXHJcbiAgICovXHJcbiAgcHVibGljIHNldENsaXBBcmVhKCBzaGFwZTogU2hhcGUgfCBudWxsICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2hhcGUgPT09IG51bGwgfHwgc2hhcGUgaW5zdGFuY2VvZiBTaGFwZSwgJ2NsaXBBcmVhIG5lZWRzIHRvIGJlIGEgcGhldC5raXRlLlNoYXBlLCBvciBudWxsJyApO1xyXG5cclxuICAgIGlmICggdGhpcy5jbGlwQXJlYSAhPT0gc2hhcGUgKSB7XHJcbiAgICAgIHRoaXMuY2xpcEFyZWFQcm9wZXJ0eS52YWx1ZSA9IHNoYXBlO1xyXG5cclxuICAgICAgdGhpcy5pbnZhbGlkYXRlQm91bmRzKCk7XHJcbiAgICAgIHRoaXMuX3BpY2tlci5vbkNsaXBBcmVhQ2hhbmdlKCk7XHJcblxyXG4gICAgICBpZiAoIGFzc2VydFNsb3cgKSB7IHRoaXMuX3BpY2tlci5hdWRpdCgpOyB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgc2V0Q2xpcEFyZWEoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgY2xpcEFyZWEoIHZhbHVlOiBTaGFwZSB8IG51bGwgKSB7XHJcbiAgICB0aGlzLnNldENsaXBBcmVhKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldENsaXBBcmVhKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGNsaXBBcmVhKCk6IFNoYXBlIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRDbGlwQXJlYSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY2xpcHBlZCBhcmVhIGZvciB0aGlzIG5vZGUuXHJcbiAgICovXHJcbiAgcHVibGljIGdldENsaXBBcmVhKCk6IFNoYXBlIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5jbGlwQXJlYVByb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgTm9kZSBoYXMgYSBjbGlwIGFyZWEuXHJcbiAgICovXHJcbiAgcHVibGljIGhhc0NsaXBBcmVhKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuY2xpcEFyZWEgIT09IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHdoYXQgc2VsZiByZW5kZXJlcnMgKGFuZCBvdGhlciBiaXRtYXNrIGZsYWdzKSBhcmUgc3VwcG9ydGVkIGJ5IHRoaXMgbm9kZS5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgc2V0UmVuZGVyZXJCaXRtYXNrKCBiaXRtYXNrOiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYml0bWFzayApICk7XHJcblxyXG4gICAgaWYgKCBiaXRtYXNrICE9PSB0aGlzLl9yZW5kZXJlckJpdG1hc2sgKSB7XHJcbiAgICAgIHRoaXMuX3JlbmRlcmVyQml0bWFzayA9IGJpdG1hc2s7XHJcblxyXG4gICAgICB0aGlzLl9yZW5kZXJlclN1bW1hcnkuc2VsZkNoYW5nZSgpO1xyXG5cclxuICAgICAgdGhpcy5pbnN0YW5jZVJlZnJlc2hFbWl0dGVyLmVtaXQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1lYW50IHRvIGJlIG92ZXJyaWRkZW4sIHNvIHRoYXQgaXQgY2FuIGJlIGNhbGxlZCB0byBlbnN1cmUgdGhhdCB0aGUgcmVuZGVyZXIgYml0bWFzayB3aWxsIGJlIHVwLXRvLWRhdGUuXHJcbiAgICovXHJcbiAgcHVibGljIGludmFsaWRhdGVTdXBwb3J0ZWRSZW5kZXJlcnMoKTogdm9pZCB7XHJcbiAgICAvLyBzZWUgZG9jc1xyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogSGludHNcclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBXaGVuIEFOWSBoaW50IGNoYW5nZXMsIHdlIHJlZnJlc2ggZXZlcnl0aGluZyBjdXJyZW50bHkgKGZvciBzYWZldHksIHRoaXMgbWF5IGJlIHBvc3NpYmxlIHRvIG1ha2UgbW9yZSBzcGVjaWZpY1xyXG4gICAqIGluIHRoZSBmdXR1cmUsIGJ1dCBoaW50IGNoYW5nZXMgYXJlIG5vdCBwYXJ0aWN1bGFybHkgY29tbW9uIHBlcmZvcm1hbmNlIGJvdHRsZW5lY2spLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgaW52YWxpZGF0ZUhpbnQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlbmRlcmVyU3VtbWFyeVJlZnJlc2hFbWl0dGVyLmVtaXQoKTtcclxuICAgIHRoaXMuaW5zdGFuY2VSZWZyZXNoRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGEgcHJlZmVycmVkIHJlbmRlcmVyIGZvciB0aGlzIE5vZGUgYW5kIGl0cyBzdWItdHJlZS4gU2NlbmVyeSB3aWxsIGF0dGVtcHQgdG8gdXNlIHRoaXMgcmVuZGVyZXIgdW5kZXIgaGVyZVxyXG4gICAqIHVubGVzcyBpdCBpc24ndCBzdXBwb3J0ZWQsIE9SIGFub3RoZXIgcHJlZmVycmVkIHJlbmRlcmVyIGlzIHNldCBhcyBhIGNsb3NlciBhbmNlc3Rvci4gQWNjZXB0YWJsZSB2YWx1ZXMgYXJlOlxyXG4gICAqIC0gbnVsbCAoZGVmYXVsdCwgbm8gcHJlZmVyZW5jZSlcclxuICAgKiAtICdjYW52YXMnXHJcbiAgICogLSAnc3ZnJ1xyXG4gICAqIC0gJ2RvbSdcclxuICAgKiAtICd3ZWJnbCdcclxuICAgKi9cclxuICBwdWJsaWMgc2V0UmVuZGVyZXIoIHJlbmRlcmVyOiBSZW5kZXJlclR5cGUgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZW5kZXJlciA9PT0gbnVsbCB8fCByZW5kZXJlciA9PT0gJ2NhbnZhcycgfHwgcmVuZGVyZXIgPT09ICdzdmcnIHx8IHJlbmRlcmVyID09PSAnZG9tJyB8fCByZW5kZXJlciA9PT0gJ3dlYmdsJyxcclxuICAgICAgJ1JlbmRlcmVyIGlucHV0IHNob3VsZCBiZSBudWxsLCBvciBvbmUgb2Y6IFwiY2FudmFzXCIsIFwic3ZnXCIsIFwiZG9tXCIgb3IgXCJ3ZWJnbFwiLicgKTtcclxuXHJcbiAgICBsZXQgbmV3UmVuZGVyZXIgPSAwO1xyXG4gICAgaWYgKCByZW5kZXJlciA9PT0gJ2NhbnZhcycgKSB7XHJcbiAgICAgIG5ld1JlbmRlcmVyID0gUmVuZGVyZXIuYml0bWFza0NhbnZhcztcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCByZW5kZXJlciA9PT0gJ3N2ZycgKSB7XHJcbiAgICAgIG5ld1JlbmRlcmVyID0gUmVuZGVyZXIuYml0bWFza1NWRztcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCByZW5kZXJlciA9PT0gJ2RvbScgKSB7XHJcbiAgICAgIG5ld1JlbmRlcmVyID0gUmVuZGVyZXIuYml0bWFza0RPTTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCByZW5kZXJlciA9PT0gJ3dlYmdsJyApIHtcclxuICAgICAgbmV3UmVuZGVyZXIgPSBSZW5kZXJlci5iaXRtYXNrV2ViR0w7XHJcbiAgICB9XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAoIHJlbmRlcmVyID09PSBudWxsICkgPT09ICggbmV3UmVuZGVyZXIgPT09IDAgKSxcclxuICAgICAgJ1dlIHNob3VsZCBvbmx5IGVuZCB1cCB3aXRoIG5vIGFjdHVhbCByZW5kZXJlciBpZiByZW5kZXJlciBpcyBudWxsJyApO1xyXG5cclxuICAgIGlmICggdGhpcy5faGludHMucmVuZGVyZXIgIT09IG5ld1JlbmRlcmVyICkge1xyXG4gICAgICB0aGlzLl9oaW50cy5yZW5kZXJlciA9IG5ld1JlbmRlcmVyO1xyXG5cclxuICAgICAgdGhpcy5pbnZhbGlkYXRlSGludCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIHNldFJlbmRlcmVyKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IHJlbmRlcmVyKCB2YWx1ZTogUmVuZGVyZXJUeXBlICkge1xyXG4gICAgdGhpcy5zZXRSZW5kZXJlciggdmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRSZW5kZXJlcigpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCByZW5kZXJlcigpOiBSZW5kZXJlclR5cGUge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVuZGVyZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHByZWZlcnJlZCByZW5kZXJlciAoaWYgYW55KSBvZiB0aGlzIG5vZGUsIGFzIGEgc3RyaW5nLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRSZW5kZXJlcigpOiBSZW5kZXJlclR5cGUge1xyXG4gICAgaWYgKCB0aGlzLl9oaW50cy5yZW5kZXJlciA9PT0gMCApIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5faGludHMucmVuZGVyZXIgPT09IFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKSB7XHJcbiAgICAgIHJldHVybiAnY2FudmFzJztcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLl9oaW50cy5yZW5kZXJlciA9PT0gUmVuZGVyZXIuYml0bWFza1NWRyApIHtcclxuICAgICAgcmV0dXJuICdzdmcnO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuX2hpbnRzLnJlbmRlcmVyID09PSBSZW5kZXJlci5iaXRtYXNrRE9NICkge1xyXG4gICAgICByZXR1cm4gJ2RvbSc7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5faGludHMucmVuZGVyZXIgPT09IFJlbmRlcmVyLmJpdG1hc2tXZWJHTCApIHtcclxuICAgICAgcmV0dXJuICd3ZWJnbCc7XHJcbiAgICB9XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ1NlZW1zIHRvIGJlIGFuIGludmFsaWQgcmVuZGVyZXI/JyApO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHdoZXRoZXIgb3Igbm90IFNjZW5lcnkgd2lsbCB0cnkgdG8gcHV0IHRoaXMgTm9kZSAoYW5kIGl0cyBkZXNjZW5kYW50cykgaW50byBhIHNlcGFyYXRlIFNWRy9DYW52YXMvV2ViR0wvZXRjLlxyXG4gICAqIGxheWVyLCBkaWZmZXJlbnQgZnJvbSBvdGhlciBzaWJsaW5ncyBvciBvdGhlciBub2Rlcy4gQ2FuIGJlIHVzZWQgZm9yIHBlcmZvcm1hbmNlIHB1cnBvc2VzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRMYXllclNwbGl0KCBzcGxpdDogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIGlmICggc3BsaXQgIT09IHRoaXMuX2hpbnRzLmxheWVyU3BsaXQgKSB7XHJcbiAgICAgIHRoaXMuX2hpbnRzLmxheWVyU3BsaXQgPSBzcGxpdDtcclxuXHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUhpbnQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRMYXllclNwbGl0KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IGxheWVyU3BsaXQoIHZhbHVlOiBib29sZWFuICkge1xyXG4gICAgdGhpcy5zZXRMYXllclNwbGl0KCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGlzTGF5ZXJTcGxpdCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBsYXllclNwbGl0KCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNMYXllclNwbGl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGxheWVyU3BsaXQgcGVyZm9ybWFuY2UgZmxhZyBpcyBzZXQuXHJcbiAgICovXHJcbiAgcHVibGljIGlzTGF5ZXJTcGxpdCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9oaW50cy5sYXllclNwbGl0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB3aGV0aGVyIG9yIG5vdCBTY2VuZXJ5IHdpbGwgdGFrZSBpbnRvIGFjY291bnQgdGhhdCB0aGlzIE5vZGUgcGxhbnMgdG8gdXNlIG9wYWNpdHkuIENhbiBoYXZlIHBlcmZvcm1hbmNlXHJcbiAgICogZ2FpbnMgaWYgdGhlcmUgbmVlZCB0byBiZSBtdWx0aXBsZSBsYXllcnMgZm9yIHRoaXMgbm9kZSdzIGRlc2NlbmRhbnRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRVc2VzT3BhY2l0eSggdXNlc09wYWNpdHk6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBpZiAoIHVzZXNPcGFjaXR5ICE9PSB0aGlzLl9oaW50cy51c2VzT3BhY2l0eSApIHtcclxuICAgICAgdGhpcy5faGludHMudXNlc09wYWNpdHkgPSB1c2VzT3BhY2l0eTtcclxuXHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUhpbnQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRVc2VzT3BhY2l0eSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCB1c2VzT3BhY2l0eSggdmFsdWU6IGJvb2xlYW4gKSB7XHJcbiAgICB0aGlzLnNldFVzZXNPcGFjaXR5KCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldFVzZXNPcGFjaXR5KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHVzZXNPcGFjaXR5KCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VXNlc09wYWNpdHkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgdXNlc09wYWNpdHkgcGVyZm9ybWFuY2UgZmxhZyBpcyBzZXQuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFVzZXNPcGFjaXR5KCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2hpbnRzLnVzZXNPcGFjaXR5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBhIGZsYWcgZm9yIHdoZXRoZXIgd2hldGhlciB0aGUgY29udGVudHMgb2YgdGhpcyBOb2RlIGFuZCBpdHMgY2hpbGRyZW4gc2hvdWxkIGJlIGRpc3BsYXllZCBpbiBhIHNlcGFyYXRlXHJcbiAgICogRE9NIGVsZW1lbnQgdGhhdCBpcyB0cmFuc2Zvcm1lZCB3aXRoIENTUyB0cmFuc2Zvcm1zLiBJdCBjYW4gaGF2ZSBwb3RlbnRpYWwgc3BlZWR1cHMsIHNpbmNlIHRoZSBicm93c2VyIG1heSBub3RcclxuICAgKiBoYXZlIHRvIHJlLXJhc3Rlcml6ZSBjb250ZW50cyB3aGVuIGl0IGlzIGFuaW1hdGVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRDU1NUcmFuc2Zvcm0oIGNzc1RyYW5zZm9ybTogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIGlmICggY3NzVHJhbnNmb3JtICE9PSB0aGlzLl9oaW50cy5jc3NUcmFuc2Zvcm0gKSB7XHJcbiAgICAgIHRoaXMuX2hpbnRzLmNzc1RyYW5zZm9ybSA9IGNzc1RyYW5zZm9ybTtcclxuXHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUhpbnQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRDU1NUcmFuc2Zvcm0oKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgY3NzVHJhbnNmb3JtKCB2YWx1ZTogYm9vbGVhbiApIHtcclxuICAgIHRoaXMuc2V0Q1NTVHJhbnNmb3JtKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGlzQ1NTVHJhbnNmb3JtZWQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgY3NzVHJhbnNmb3JtKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNDU1NUcmFuc2Zvcm1lZCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBjc3NUcmFuc2Zvcm0gcGVyZm9ybWFuY2UgZmxhZyBpcyBzZXQuXHJcbiAgICovXHJcbiAgcHVibGljIGlzQ1NTVHJhbnNmb3JtZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5faGludHMuY3NzVHJhbnNmb3JtO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBhIHBlcmZvcm1hbmNlIGZsYWcgZm9yIHdoZXRoZXIgbGF5ZXJzL0RPTSBlbGVtZW50cyBzaG91bGQgYmUgZXhjbHVkZWQgKG9yIGluY2x1ZGVkKSB3aGVuIHRoaW5ncyBhcmVcclxuICAgKiBpbnZpc2libGUuIFRoZSBkZWZhdWx0IGlzIGZhbHNlLCBhbmQgaW52aXNpYmxlIGNvbnRlbnQgaXMgaW4gdGhlIERPTSwgYnV0IGhpZGRlbi5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0RXhjbHVkZUludmlzaWJsZSggZXhjbHVkZUludmlzaWJsZTogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIGlmICggZXhjbHVkZUludmlzaWJsZSAhPT0gdGhpcy5faGludHMuZXhjbHVkZUludmlzaWJsZSApIHtcclxuICAgICAgdGhpcy5faGludHMuZXhjbHVkZUludmlzaWJsZSA9IGV4Y2x1ZGVJbnZpc2libGU7XHJcblxyXG4gICAgICB0aGlzLmludmFsaWRhdGVIaW50KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgc2V0RXhjbHVkZUludmlzaWJsZSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBleGNsdWRlSW52aXNpYmxlKCB2YWx1ZTogYm9vbGVhbiApIHtcclxuICAgIHRoaXMuc2V0RXhjbHVkZUludmlzaWJsZSggdmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBpc0V4Y2x1ZGVJbnZpc2libGUoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgZXhjbHVkZUludmlzaWJsZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmlzRXhjbHVkZUludmlzaWJsZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBleGNsdWRlSW52aXNpYmxlIHBlcmZvcm1hbmNlIGZsYWcgaXMgc2V0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc0V4Y2x1ZGVJbnZpc2libGUoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5faGludHMuZXhjbHVkZUludmlzaWJsZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElmIHRoaXMgaXMgc2V0IHRvIHRydWUsIGNoaWxkIG5vZGVzIHRoYXQgYXJlIGludmlzaWJsZSB3aWxsIE5PVCBjb250cmlidXRlIHRvIHRoZSBib3VuZHMgb2YgdGhpcyBub2RlLlxyXG4gICAqXHJcbiAgICogVGhlIGRlZmF1bHQgaXMgZm9yIGNoaWxkIG5vZGVzIGJvdW5kcycgdG8gYmUgaW5jbHVkZWQgaW4gdGhpcyBub2RlJ3MgYm91bmRzLCBidXQgdGhhdCB3b3VsZCBpbiBnZW5lcmFsIGJlIGFcclxuICAgKiBwcm9ibGVtIGZvciBsYXlvdXQgY29udGFpbmVycyBvciBvdGhlciBzaXR1YXRpb25zLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy82MDguXHJcbiAgICovXHJcbiAgcHVibGljIHNldEV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMoIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBpZiAoIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMgIT09IHRoaXMuX2V4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMgKSB7XHJcbiAgICAgIHRoaXMuX2V4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMgPSBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzO1xyXG5cclxuICAgICAgdGhpcy5pbnZhbGlkYXRlQm91bmRzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgc2V0RXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcygpIGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzKCB2YWx1ZTogYm9vbGVhbiApIHtcclxuICAgIHRoaXMuc2V0RXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyggdmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBpc0V4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcygpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmlzRXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIGZsYWcgaXMgc2V0LCBzZWVcclxuICAgKiBzZXRFeGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzKCkgZm9yIGRvY3VtZW50YXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIGlzRXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcygpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9leGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBvcHRpb25zIHRoYXQgYXJlIHByb3ZpZGVkIHRvIGxheW91dCBtYW5hZ2VycyBpbiBvcmRlciB0byBjdXN0b21pemUgcG9zaXRpb25pbmcgb2YgdGhpcyBub2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRMYXlvdXRPcHRpb25zKCBsYXlvdXRPcHRpb25zOiBUTGF5b3V0T3B0aW9ucyB8IG51bGwgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsYXlvdXRPcHRpb25zID09PSBudWxsIHx8ICggdHlwZW9mIGxheW91dE9wdGlvbnMgPT09ICdvYmplY3QnICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZiggbGF5b3V0T3B0aW9ucyApID09PSBPYmplY3QucHJvdG90eXBlICksXHJcbiAgICAgICdsYXlvdXRPcHRpb25zIHNob3VsZCBiZSBudWxsIG9yIGFuIHBsYWluIG9wdGlvbnMtc3R5bGUgb2JqZWN0JyApO1xyXG5cclxuICAgIGlmICggbGF5b3V0T3B0aW9ucyAhPT0gdGhpcy5fbGF5b3V0T3B0aW9ucyApIHtcclxuICAgICAgdGhpcy5fbGF5b3V0T3B0aW9ucyA9IGxheW91dE9wdGlvbnM7XHJcblxyXG4gICAgICB0aGlzLmxheW91dE9wdGlvbnNDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGxheW91dE9wdGlvbnMoIHZhbHVlOiBUTGF5b3V0T3B0aW9ucyB8IG51bGwgKSB7XHJcbiAgICB0aGlzLnNldExheW91dE9wdGlvbnMoIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGxheW91dE9wdGlvbnMoKTogVExheW91dE9wdGlvbnMgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLmdldExheW91dE9wdGlvbnMoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRMYXlvdXRPcHRpb25zKCk6IFRMYXlvdXRPcHRpb25zIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fbGF5b3V0T3B0aW9ucztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBtdXRhdGVMYXlvdXRPcHRpb25zKCBsYXlvdXRPcHRpb25zPzogVExheW91dE9wdGlvbnMgKTogdm9pZCB7XHJcbiAgICB0aGlzLmxheW91dE9wdGlvbnMgPSBvcHRpb25pemUzPFRMYXlvdXRPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBUTGF5b3V0T3B0aW9ucz4oKSgge30sIHRoaXMubGF5b3V0T3B0aW9ucyB8fCB7fSwgbGF5b3V0T3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLy8gRGVmYXVsdHMgaW5kaWNhdGluZyB0aGF0IHdlIGRvbid0IG1peCBpbiBXaWR0aFNpemFibGUvSGVpZ2h0U2l6YWJsZVxyXG4gIHB1YmxpYyBnZXQgd2lkdGhTaXphYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cclxuXHJcbiAgcHVibGljIGdldCBoZWlnaHRTaXphYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cclxuXHJcbiAgcHVibGljIGdldCBleHRlbmRzV2lkdGhTaXphYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cclxuXHJcbiAgcHVibGljIGdldCBleHRlbmRzSGVpZ2h0U2l6YWJsZSgpOiBib29sZWFuIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZXh0ZW5kc1NpemFibGUoKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBwcmV2ZW50Rml0IHBlcmZvcm1hbmNlIGZsYWcuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFByZXZlbnRGaXQoIHByZXZlbnRGaXQ6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBpZiAoIHByZXZlbnRGaXQgIT09IHRoaXMuX2hpbnRzLnByZXZlbnRGaXQgKSB7XHJcbiAgICAgIHRoaXMuX2hpbnRzLnByZXZlbnRGaXQgPSBwcmV2ZW50Rml0O1xyXG5cclxuICAgICAgdGhpcy5pbnZhbGlkYXRlSGludCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIHNldFByZXZlbnRGaXQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgcHJldmVudEZpdCggdmFsdWU6IGJvb2xlYW4gKSB7XHJcbiAgICB0aGlzLnNldFByZXZlbnRGaXQoIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgaXNQcmV2ZW50Rml0KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHByZXZlbnRGaXQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5pc1ByZXZlbnRGaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgcHJldmVudEZpdCBwZXJmb3JtYW5jZSBmbGFnIGlzIHNldC5cclxuICAgKi9cclxuICBwdWJsaWMgaXNQcmV2ZW50Rml0KCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2hpbnRzLnByZXZlbnRGaXQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHdoZXRoZXIgdGhlcmUgaXMgYSBjdXN0b20gV2ViR0wgc2NhbGUgYXBwbGllZCB0byB0aGUgQ2FudmFzLCBhbmQgaWYgc28gd2hhdCBzY2FsZS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0V2ViR0xTY2FsZSggd2ViZ2xTY2FsZTogbnVtYmVyIHwgbnVsbCApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdlYmdsU2NhbGUgPT09IG51bGwgfHwgKCB0eXBlb2Ygd2ViZ2xTY2FsZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHdlYmdsU2NhbGUgKSApICk7XHJcblxyXG4gICAgaWYgKCB3ZWJnbFNjYWxlICE9PSB0aGlzLl9oaW50cy53ZWJnbFNjYWxlICkge1xyXG4gICAgICB0aGlzLl9oaW50cy53ZWJnbFNjYWxlID0gd2ViZ2xTY2FsZTtcclxuXHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUhpbnQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRXZWJHTFNjYWxlKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IHdlYmdsU2NhbGUoIHZhbHVlOiBudW1iZXIgfCBudWxsICkge1xyXG4gICAgdGhpcy5zZXRXZWJHTFNjYWxlKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGdldFdlYkdMU2NhbGUoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgd2ViZ2xTY2FsZSgpOiBudW1iZXIgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLmdldFdlYkdMU2NhbGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSB3ZWJnbFNjYWxlIHBlcmZvcm1hbmNlIGZsYWcuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFdlYkdMU2NhbGUoKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5faGludHMud2ViZ2xTY2FsZTtcclxuICB9XHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIFRyYWlsIG9wZXJhdGlvbnNcclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBvbmUgVHJhaWwgdGhhdCBzdGFydHMgZnJvbSBhIG5vZGUgd2l0aCBubyBwYXJlbnRzIChvciBpZiB0aGUgcHJlZGljYXRlIGlzIHByZXNlbnQsIGEgTm9kZSB0aGF0XHJcbiAgICogc2F0aXNmaWVzIGl0KSwgYW5kIGVuZHMgYXQgdGhpcyBub2RlLiBJZiBtb3JlIHRoYW4gb25lIFRyYWlsIHdvdWxkIHNhdGlzZnkgdGhlc2UgY29uZGl0aW9ucywgYW4gYXNzZXJ0aW9uIGlzXHJcbiAgICogdGhyb3duIChwbGVhc2UgdXNlIGdldFRyYWlscygpIGZvciB0aG9zZSBjYXNlcykuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gW3ByZWRpY2F0ZV0gLSBJZiBzdXBwbGllZCwgd2Ugd2lsbCBvbmx5IHJldHVybiB0cmFpbHMgcm9vdGVkIGF0IGEgTm9kZSB0aGF0IHNhdGlzZmllcyBwcmVkaWNhdGUoIG5vZGUgKSA9PSB0cnVlXHJcbiAgICovXHJcbiAgcHVibGljIGdldFVuaXF1ZVRyYWlsKCBwcmVkaWNhdGU/OiAoIG5vZGU6IE5vZGUgKSA9PiBib29sZWFuICk6IFRyYWlsIHtcclxuXHJcbiAgICAvLyBXaXRob3V0IGEgcHJlZGljYXRlLCB3ZSdsbCBiZSBhYmxlIHRvIGJhaWwgb3V0IHRoZSBpbnN0YW50IHdlIGhpdCBhIE5vZGUgd2l0aCAyKyBwYXJlbnRzLCBhbmQgaXQgbWFrZXMgdGhlXHJcbiAgICAvLyBsb2dpYyBlYXNpZXIuXHJcbiAgICBpZiAoICFwcmVkaWNhdGUgKSB7XHJcbiAgICAgIGNvbnN0IHRyYWlsID0gbmV3IFRyYWlsKCk7XHJcblxyXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcclxuICAgICAgbGV0IG5vZGU6IE5vZGUgPSB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbnNpc3RlbnQtdGhpc1xyXG5cclxuICAgICAgd2hpbGUgKCBub2RlICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUuX3BhcmVudHMubGVuZ3RoIDw9IDEsXHJcbiAgICAgICAgICBgZ2V0VW5pcXVlVHJhaWwgZm91bmQgYSBOb2RlIHdpdGggJHtub2RlLl9wYXJlbnRzLmxlbmd0aH0gcGFyZW50cy5gICk7XHJcblxyXG4gICAgICAgIHRyYWlsLmFkZEFuY2VzdG9yKCBub2RlICk7XHJcbiAgICAgICAgbm9kZSA9IG5vZGUuX3BhcmVudHNbIDAgXTsgLy8gc2hvdWxkIGJlIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmVuJ3QgYW55IHBhcmVudHNcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRyYWlsO1xyXG4gICAgfVxyXG4gICAgLy8gV2l0aCBhIHByZWRpY2F0ZSwgd2UgbmVlZCB0byBleHBsb3JlIG11bHRpcGxlIHBhcmVudHMgKHNpbmNlIHRoZSBwcmVkaWNhdGUgbWF5IGZpbHRlciBvdXQgYWxsIGJ1dCBvbmUpXHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgdHJhaWxzID0gdGhpcy5nZXRUcmFpbHMoIHByZWRpY2F0ZSApO1xyXG5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHJhaWxzLmxlbmd0aCA9PT0gMSxcclxuICAgICAgICBgZ2V0VW5pcXVlVHJhaWwgZm91bmQgJHt0cmFpbHMubGVuZ3RofSBtYXRjaGluZyB0cmFpbHMgZm9yIHRoZSBwcmVkaWNhdGVgICk7XHJcblxyXG4gICAgICByZXR1cm4gdHJhaWxzWyAwIF07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgVHJhaWwgcm9vdGVkIGF0IHJvb3ROb2RlIGFuZCBlbmRzIGF0IHRoaXMgbm9kZS4gVGhyb3dzIGFuIGFzc2VydGlvbiBpZiB0aGUgbnVtYmVyIG9mIHRyYWlscyB0aGF0IG1hdGNoXHJcbiAgICogdGhpcyBjb25kaXRpb24gaXNuJ3QgZXhhY3RseSAxLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRVbmlxdWVUcmFpbFRvKCByb290Tm9kZTogTm9kZSApOiBUcmFpbCB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRVbmlxdWVUcmFpbCggbm9kZSA9PiByb290Tm9kZSA9PT0gbm9kZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgVHJhaWxzIHRoYXQgc3RhcnQgZnJvbSBub2RlcyB3aXRoIG5vIHBhcmVudCAob3IgaWYgYSBwcmVkaWNhdGUgaXMgcHJlc2VudCwgdGhvc2UgdGhhdFxyXG4gICAqIHNhdGlzZnkgdGhlIHByZWRpY2F0ZSksIGFuZCBlbmRzIGF0IHRoaXMgbm9kZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBbcHJlZGljYXRlXSAtIElmIHN1cHBsaWVkLCB3ZSB3aWxsIG9ubHkgcmV0dXJuIFRyYWlscyByb290ZWQgYXQgbm9kZXMgdGhhdCBzYXRpc2Z5IHByZWRpY2F0ZSggbm9kZSApID09IHRydWUuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFRyYWlscyggcHJlZGljYXRlPzogKCBub2RlOiBOb2RlICkgPT4gYm9vbGVhbiApOiBUcmFpbFtdIHtcclxuICAgIHByZWRpY2F0ZSA9IHByZWRpY2F0ZSB8fCBOb2RlLmRlZmF1bHRUcmFpbFByZWRpY2F0ZTtcclxuXHJcbiAgICBjb25zdCB0cmFpbHM6IFRyYWlsW10gPSBbXTtcclxuICAgIGNvbnN0IHRyYWlsID0gbmV3IFRyYWlsKCB0aGlzICk7XHJcbiAgICBUcmFpbC5hcHBlbmRBbmNlc3RvclRyYWlsc1dpdGhQcmVkaWNhdGUoIHRyYWlscywgdHJhaWwsIHByZWRpY2F0ZSApO1xyXG5cclxuICAgIHJldHVybiB0cmFpbHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGFsbCBUcmFpbHMgcm9vdGVkIGF0IHJvb3ROb2RlIGFuZCBlbmQgYXQgdGhpcyBub2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRUcmFpbHNUbyggcm9vdE5vZGU6IE5vZGUgKTogVHJhaWxbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRUcmFpbHMoIG5vZGUgPT4gbm9kZSA9PT0gcm9vdE5vZGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgYWxsIFRyYWlscyByb290ZWQgYXQgdGhpcyBOb2RlIGFuZCBlbmQgd2l0aCBub2RlcyB3aXRoIG5vIGNoaWxkcmVuIChvciBpZiBhIHByZWRpY2F0ZSBpc1xyXG4gICAqIHByZXNlbnQsIHRob3NlIHRoYXQgc2F0aXNmeSB0aGUgcHJlZGljYXRlKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBbcHJlZGljYXRlXSAtIElmIHN1cHBsaWVkLCB3ZSB3aWxsIG9ubHkgcmV0dXJuIFRyYWlscyBlbmRpbmcgYXQgbm9kZXMgdGhhdCBzYXRpc2Z5IHByZWRpY2F0ZSggbm9kZSApID09IHRydWUuXHJcbiAgICovXHJcbiAgcHVibGljIGdldExlYWZUcmFpbHMoIHByZWRpY2F0ZT86ICggbm9kZTogTm9kZSApID0+IGJvb2xlYW4gKTogVHJhaWxbXSB7XHJcbiAgICBwcmVkaWNhdGUgPSBwcmVkaWNhdGUgfHwgTm9kZS5kZWZhdWx0TGVhZlRyYWlsUHJlZGljYXRlO1xyXG5cclxuICAgIGNvbnN0IHRyYWlsczogVHJhaWxbXSA9IFtdO1xyXG4gICAgY29uc3QgdHJhaWwgPSBuZXcgVHJhaWwoIHRoaXMgKTtcclxuICAgIFRyYWlsLmFwcGVuZERlc2NlbmRhbnRUcmFpbHNXaXRoUHJlZGljYXRlKCB0cmFpbHMsIHRyYWlsLCBwcmVkaWNhdGUgKTtcclxuXHJcbiAgICByZXR1cm4gdHJhaWxzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgVHJhaWxzIHJvb3RlZCBhdCB0aGlzIE5vZGUgYW5kIGVuZCB3aXRoIGxlYWZOb2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRMZWFmVHJhaWxzVG8oIGxlYWZOb2RlOiBOb2RlICk6IFRyYWlsW10ge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TGVhZlRyYWlscyggbm9kZSA9PiBub2RlID09PSBsZWFmTm9kZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIFRyYWlsIHJvb3RlZCBhdCB0aGlzIG5vZGUgYW5kIGVuZGluZyBhdCBhIE5vZGUgdGhhdCBoYXMgbm8gY2hpbGRyZW4gKG9yIGlmIGEgcHJlZGljYXRlIGlzIHByb3ZpZGVkLCBhXHJcbiAgICogTm9kZSB0aGF0IHNhdGlzZmllcyB0aGUgcHJlZGljYXRlKS4gSWYgbW9yZSB0aGFuIG9uZSB0cmFpbCBtYXRjaGVzIHRoaXMgZGVzY3JpcHRpb24sIGFuIGFzc2VydGlvbiB3aWxsIGJlIGZpcmVkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIFtwcmVkaWNhdGVdIC0gSWYgc3VwcGxpZWQsIHdlIHdpbGwgcmV0dXJuIGEgVHJhaWwgdGhhdCBlbmRzIHdpdGggYSBOb2RlIHRoYXQgc2F0aXNmaWVzIHByZWRpY2F0ZSggbm9kZSApID09IHRydWVcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VW5pcXVlTGVhZlRyYWlsKCBwcmVkaWNhdGU/OiAoIG5vZGU6IE5vZGUgKSA9PiBib29sZWFuICk6IFRyYWlsIHtcclxuICAgIGNvbnN0IHRyYWlscyA9IHRoaXMuZ2V0TGVhZlRyYWlscyggcHJlZGljYXRlICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHJhaWxzLmxlbmd0aCA9PT0gMSxcclxuICAgICAgYGdldFVuaXF1ZUxlYWZUcmFpbCBmb3VuZCAke3RyYWlscy5sZW5ndGh9IG1hdGNoaW5nIHRyYWlscyBmb3IgdGhlIHByZWRpY2F0ZWAgKTtcclxuXHJcbiAgICByZXR1cm4gdHJhaWxzWyAwIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgVHJhaWwgcm9vdGVkIGF0IHRoaXMgTm9kZSBhbmQgZW5kaW5nIGF0IGxlYWZOb2RlLiBJZiBtb3JlIHRoYW4gb25lIHRyYWlsIG1hdGNoZXMgdGhpcyBkZXNjcmlwdGlvbixcclxuICAgKiBhbiBhc3NlcnRpb24gd2lsbCBiZSBmaXJlZC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VW5pcXVlTGVhZlRyYWlsVG8oIGxlYWZOb2RlOiBOb2RlICk6IFRyYWlsIHtcclxuICAgIHJldHVybiB0aGlzLmdldFVuaXF1ZUxlYWZUcmFpbCggbm9kZSA9PiBub2RlID09PSBsZWFmTm9kZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbGwgbm9kZXMgaW4gdGhlIGNvbm5lY3RlZCBjb21wb25lbnQsIHJldHVybmVkIGluIGFuIGFyYml0cmFyeSBvcmRlciwgaW5jbHVkaW5nIG5vZGVzIHRoYXQgYXJlIGFuY2VzdG9yc1xyXG4gICAqIG9mIHRoaXMgbm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q29ubmVjdGVkTm9kZXMoKTogTm9kZVtdIHtcclxuICAgIGNvbnN0IHJlc3VsdDogTm9kZVtdID0gW107XHJcbiAgICBsZXQgZnJlc2ggPSB0aGlzLl9jaGlsZHJlbi5jb25jYXQoIHRoaXMuX3BhcmVudHMgKS5jb25jYXQoIHRoaXMgKTtcclxuICAgIHdoaWxlICggZnJlc2gubGVuZ3RoICkge1xyXG4gICAgICBjb25zdCBub2RlID0gZnJlc2gucG9wKCkhO1xyXG4gICAgICBpZiAoICFfLmluY2x1ZGVzKCByZXN1bHQsIG5vZGUgKSApIHtcclxuICAgICAgICByZXN1bHQucHVzaCggbm9kZSApO1xyXG4gICAgICAgIGZyZXNoID0gZnJlc2guY29uY2F0KCBub2RlLl9jaGlsZHJlbiwgbm9kZS5fcGFyZW50cyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbGwgbm9kZXMgaW4gdGhlIHN1YnRyZWUgd2l0aCB0aGlzIE5vZGUgYXMgaXRzIHJvb3QsIHJldHVybmVkIGluIGFuIGFyYml0cmFyeSBvcmRlci4gTGlrZVxyXG4gICAqIGdldENvbm5lY3RlZE5vZGVzLCBidXQgZG9lc24ndCBpbmNsdWRlIHBhcmVudHMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFN1YnRyZWVOb2RlcygpOiBOb2RlW10ge1xyXG4gICAgY29uc3QgcmVzdWx0OiBOb2RlW10gPSBbXTtcclxuICAgIGxldCBmcmVzaCA9IHRoaXMuX2NoaWxkcmVuLmNvbmNhdCggdGhpcyApO1xyXG4gICAgd2hpbGUgKCBmcmVzaC5sZW5ndGggKSB7XHJcbiAgICAgIGNvbnN0IG5vZGUgPSBmcmVzaC5wb3AoKSE7XHJcbiAgICAgIGlmICggIV8uaW5jbHVkZXMoIHJlc3VsdCwgbm9kZSApICkge1xyXG4gICAgICAgIHJlc3VsdC5wdXNoKCBub2RlICk7XHJcbiAgICAgICAgZnJlc2ggPSBmcmVzaC5jb25jYXQoIG5vZGUuX2NoaWxkcmVuICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFsbCBub2RlcyB0aGF0IGFyZSBjb25uZWN0ZWQgdG8gdGhpcyBub2RlLCBzb3J0ZWQgaW4gdG9wb2xvZ2ljYWwgb3JkZXIuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFRvcG9sb2dpY2FsbHlTb3J0ZWROb2RlcygpOiBOb2RlW10ge1xyXG4gICAgLy8gc2VlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVG9wb2xvZ2ljYWxfc29ydGluZ1xyXG4gICAgY29uc3QgZWRnZXM6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+PiA9IHt9O1xyXG4gICAgY29uc3QgczogTm9kZVtdID0gW107XHJcbiAgICBjb25zdCBsOiBOb2RlW10gPSBbXTtcclxuICAgIGxldCBuOiBOb2RlO1xyXG4gICAgXy5lYWNoKCB0aGlzLmdldENvbm5lY3RlZE5vZGVzKCksIG5vZGUgPT4ge1xyXG4gICAgICBlZGdlc1sgbm9kZS5pZCBdID0ge307XHJcbiAgICAgIF8uZWFjaCggbm9kZS5fY2hpbGRyZW4sIG0gPT4ge1xyXG4gICAgICAgIGVkZ2VzWyBub2RlLmlkIF1bIG0uaWQgXSA9IHRydWU7XHJcbiAgICAgIH0gKTtcclxuICAgICAgaWYgKCAhbm9kZS5wYXJlbnRzLmxlbmd0aCApIHtcclxuICAgICAgICBzLnB1c2goIG5vZGUgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZUNoaWxkKCBtOiBOb2RlICk6IHZvaWQge1xyXG4gICAgICBkZWxldGUgZWRnZXNbIG4uaWQgXVsgbS5pZCBdO1xyXG4gICAgICBpZiAoIF8uZXZlcnkoIGVkZ2VzLCBjaGlsZHJlbiA9PiAhY2hpbGRyZW5bIG0uaWQgXSApICkge1xyXG4gICAgICAgIC8vIHRoZXJlIGFyZSBubyBtb3JlIGVkZ2VzIHRvIG1cclxuICAgICAgICBzLnB1c2goIG0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHdoaWxlICggcy5sZW5ndGggKSB7XHJcbiAgICAgIG4gPSBzLnBvcCgpITtcclxuICAgICAgbC5wdXNoKCBuICk7XHJcblxyXG4gICAgICBfLmVhY2goIG4uX2NoaWxkcmVuLCBoYW5kbGVDaGlsZCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGVuc3VyZSB0aGF0IHRoZXJlIGFyZSBubyBlZGdlcyBsZWZ0LCBzaW5jZSB0aGVuIGl0IHdvdWxkIGNvbnRhaW4gYSBjaXJjdWxhciByZWZlcmVuY2VcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uZXZlcnkoIGVkZ2VzLCBjaGlsZHJlbiA9PiBfLmV2ZXJ5KCBjaGlsZHJlbiwgZmluYWwgPT4gZmFsc2UgKSApLCAnY2lyY3VsYXIgcmVmZXJlbmNlIGNoZWNrJyApO1xyXG5cclxuICAgIHJldHVybiBsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMuYWRkQ2hpbGQoIGNoaWxkICkgd2lsbCBub3QgY2F1c2UgY2lyY3VsYXIgcmVmZXJlbmNlcy5cclxuICAgKi9cclxuICBwdWJsaWMgY2FuQWRkQ2hpbGQoIGNoaWxkOiBOb2RlICk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCB0aGlzID09PSBjaGlsZCB8fCBfLmluY2x1ZGVzKCB0aGlzLl9jaGlsZHJlbiwgY2hpbGQgKSApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RvcG9sb2dpY2FsX3NvcnRpbmdcclxuICAgIC8vIFRPRE86IHJlbW92ZSBkdXBsaWNhdGlvbiB3aXRoIGFib3ZlIGhhbmRsaW5nP1xyXG4gICAgY29uc3QgZWRnZXM6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+PiA9IHt9O1xyXG4gICAgY29uc3QgczogTm9kZVtdID0gW107XHJcbiAgICBjb25zdCBsOiBOb2RlW10gPSBbXTtcclxuICAgIGxldCBuOiBOb2RlO1xyXG4gICAgXy5lYWNoKCB0aGlzLmdldENvbm5lY3RlZE5vZGVzKCkuY29uY2F0KCBjaGlsZC5nZXRDb25uZWN0ZWROb2RlcygpICksIG5vZGUgPT4ge1xyXG4gICAgICBlZGdlc1sgbm9kZS5pZCBdID0ge307XHJcbiAgICAgIF8uZWFjaCggbm9kZS5fY2hpbGRyZW4sIG0gPT4ge1xyXG4gICAgICAgIGVkZ2VzWyBub2RlLmlkIF1bIG0uaWQgXSA9IHRydWU7XHJcbiAgICAgIH0gKTtcclxuICAgICAgaWYgKCAhbm9kZS5wYXJlbnRzLmxlbmd0aCAmJiBub2RlICE9PSBjaGlsZCApIHtcclxuICAgICAgICBzLnB1c2goIG5vZGUgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgZWRnZXNbIHRoaXMuaWQgXVsgY2hpbGQuaWQgXSA9IHRydWU7IC8vIGFkZCBpbiBvdXIgJ25ldycgZWRnZVxyXG4gICAgZnVuY3Rpb24gaGFuZGxlQ2hpbGQoIG06IE5vZGUgKTogdm9pZCB7XHJcbiAgICAgIGRlbGV0ZSBlZGdlc1sgbi5pZCBdWyBtLmlkIF07XHJcbiAgICAgIGlmICggXy5ldmVyeSggZWRnZXMsIGNoaWxkcmVuID0+ICFjaGlsZHJlblsgbS5pZCBdICkgKSB7XHJcbiAgICAgICAgLy8gdGhlcmUgYXJlIG5vIG1vcmUgZWRnZXMgdG8gbVxyXG4gICAgICAgIHMucHVzaCggbSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgd2hpbGUgKCBzLmxlbmd0aCApIHtcclxuICAgICAgbiA9IHMucG9wKCkhO1xyXG4gICAgICBsLnB1c2goIG4gKTtcclxuXHJcbiAgICAgIF8uZWFjaCggbi5fY2hpbGRyZW4sIGhhbmRsZUNoaWxkICk7XHJcblxyXG4gICAgICAvLyBoYW5kbGUgb3VyIG5ldyBlZGdlXHJcbiAgICAgIGlmICggbiA9PT0gdGhpcyApIHtcclxuICAgICAgICBoYW5kbGVDaGlsZCggY2hpbGQgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGVuc3VyZSB0aGF0IHRoZXJlIGFyZSBubyBlZGdlcyBsZWZ0LCBzaW5jZSB0aGVuIGl0IHdvdWxkIGNvbnRhaW4gYSBjaXJjdWxhciByZWZlcmVuY2VcclxuICAgIHJldHVybiBfLmV2ZXJ5KCBlZGdlcywgY2hpbGRyZW4gPT4gXy5ldmVyeSggY2hpbGRyZW4sIGZpbmFsID0+IGZhbHNlICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRvIGJlIG92ZXJyaWRkZW4gaW4gcGFpbnRhYmxlIE5vZGUgdHlwZXMuIFNob3VsZCBob29rIGludG8gdGhlIGRyYXdhYmxlJ3MgcHJvdG90eXBlIChwcmVzdW1hYmx5KS5cclxuICAgKlxyXG4gICAqIERyYXdzIHRoZSBjdXJyZW50IE5vZGUncyBzZWxmIHJlcHJlc2VudGF0aW9uLCBhc3N1bWluZyB0aGUgd3JhcHBlcidzIENhbnZhcyBjb250ZXh0IGlzIGFscmVhZHkgaW4gdGhlIGxvY2FsXHJcbiAgICogY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGlzIG5vZGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gd3JhcHBlclxyXG4gICAqIEBwYXJhbSBtYXRyaXggLSBUaGUgdHJhbnNmb3JtYXRpb24gbWF0cml4IGFscmVhZHkgYXBwbGllZCB0byB0aGUgY29udGV4dC5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgY2FudmFzUGFpbnRTZWxmKCB3cmFwcGVyOiBDYW52YXNDb250ZXh0V3JhcHBlciwgbWF0cml4OiBNYXRyaXgzICk6IHZvaWQge1xyXG4gICAgLy8gU2VlIHN1YmNsYXNzIGZvciBpbXBsZW1lbnRhdGlvblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVuZGVycyB0aGlzIE5vZGUgb25seSAoaXRzIHNlbGYpIGludG8gdGhlIENhbnZhcyB3cmFwcGVyLCBpbiBpdHMgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB3cmFwcGVyXHJcbiAgICogQHBhcmFtIG1hdHJpeCAtIFRoZSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggYWxyZWFkeSBhcHBsaWVkIHRvIHRoZSBjb250ZXh0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW5kZXJUb0NhbnZhc1NlbGYoIHdyYXBwZXI6IENhbnZhc0NvbnRleHRXcmFwcGVyLCBtYXRyaXg6IE1hdHJpeDMgKTogdm9pZCB7XHJcbiAgICBpZiAoIHRoaXMuaXNQYWludGVkKCkgJiYgKCB0aGlzLl9yZW5kZXJlckJpdG1hc2sgJiBSZW5kZXJlci5iaXRtYXNrQ2FudmFzICkgKSB7XHJcbiAgICAgIHRoaXMuY2FudmFzUGFpbnRTZWxmKCB3cmFwcGVyLCBtYXRyaXggKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbmRlcnMgdGhpcyBOb2RlIGFuZCBpdHMgZGVzY2VuZGFudHMgaW50byB0aGUgQ2FudmFzIHdyYXBwZXIuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gd3JhcHBlclxyXG4gICAqIEBwYXJhbSBbbWF0cml4XSAtIE9wdGlvbmFsIHRyYW5zZm9ybSB0byBiZSBhcHBsaWVkXHJcbiAgICovXHJcbiAgcHVibGljIHJlbmRlclRvQ2FudmFzU3VidHJlZSggd3JhcHBlcjogQ2FudmFzQ29udGV4dFdyYXBwZXIsIG1hdHJpeD86IE1hdHJpeDMgKTogdm9pZCB7XHJcbiAgICBtYXRyaXggPSBtYXRyaXggfHwgTWF0cml4My5pZGVudGl0eSgpO1xyXG5cclxuICAgIHdyYXBwZXIucmVzZXRTdHlsZXMoKTtcclxuXHJcbiAgICB0aGlzLnJlbmRlclRvQ2FudmFzU2VsZiggd3JhcHBlciwgbWF0cml4ICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLl9jaGlsZHJlblsgaSBdO1xyXG5cclxuICAgICAgLy8gSWdub3JlIGludmFsaWQgKGVtcHR5KSBib3VuZHMsIHNpbmNlIHRoaXMgd291bGQgc2hvdyBub3RoaW5nIChhbmQgd2UgY291bGRuJ3QgY29tcHV0ZSBmaXR0ZWQgYm91bmRzIGZvciBpdCkuXHJcbiAgICAgIGlmICggY2hpbGQuaXNWaXNpYmxlKCkgJiYgY2hpbGQuYm91bmRzLmlzVmFsaWQoKSApIHtcclxuXHJcbiAgICAgICAgLy8gRm9yIGFueXRoaW5nIGZpbHRlci1saWtlLCB3ZSdsbCBuZWVkIHRvIGNyZWF0ZSBhIENhbnZhcywgcmVuZGVyIG91ciBjaGlsZCdzIGNvbnRlbnQgaW50byB0aGF0IENhbnZhcyxcclxuICAgICAgICAvLyBhbmQgdGhlbiAoYXBwbHlpbmcgdGhlIGZpbHRlcikgcmVuZGVyIHRoYXQgaW50byB0aGUgQ2FudmFzIHByb3ZpZGVkLlxyXG4gICAgICAgIGNvbnN0IHJlcXVpcmVzU2NyYXRjaENhbnZhcyA9IGNoaWxkLmVmZmVjdGl2ZU9wYWNpdHkgIT09IDEgfHwgY2hpbGQuY2xpcEFyZWEgfHwgY2hpbGQuX2ZpbHRlcnMubGVuZ3RoO1xyXG5cclxuICAgICAgICB3cmFwcGVyLmNvbnRleHQuc2F2ZSgpO1xyXG4gICAgICAgIG1hdHJpeC5tdWx0aXBseU1hdHJpeCggY2hpbGQuX3RyYW5zZm9ybS5nZXRNYXRyaXgoKSApO1xyXG4gICAgICAgIG1hdHJpeC5jYW52YXNTZXRUcmFuc2Zvcm0oIHdyYXBwZXIuY29udGV4dCApO1xyXG4gICAgICAgIGlmICggcmVxdWlyZXNTY3JhdGNoQ2FudmFzICkge1xyXG4gICAgICAgICAgLy8gV2UnbGwgYXR0ZW1wdCB0byBmaXQgdGhlIENhbnZhcyB0byB0aGUgY29udGVudCB0byBtaW5pbWl6ZSBtZW1vcnkgdXNlLCBzZWVcclxuICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mdW5jdGlvbi1idWlsZGVyL2lzc3Vlcy8xNDhcclxuXHJcbiAgICAgICAgICAvLyBXZSdyZSBnb2luZyB0byBpZ25vcmUgY29udGVudCBvdXRzaWRlIG91ciB3cmFwcGVyIGNvbnRleHQncyBjYW52YXMuXHJcbiAgICAgICAgICAvLyBBZGRlZCBwYWRkaW5nIGFuZCByb3VuZC1vdXQgZm9yIGNhc2VzIHdoZXJlIENhbnZhcyBib3VuZHMgbWlnaHQgbm90IGJlIGZ1bGx5IGFjY3VyYXRlXHJcbiAgICAgICAgICAvLyBUaGUgbWF0cml4IGFscmVhZHkgaW5jbHVkZXMgdGhlIGNoaWxkJ3MgdHJhbnNmb3JtIChzbyB3ZSB1c2UgbG9jYWxCb3VuZHMpLlxyXG4gICAgICAgICAgLy8gV2Ugd29uJ3QgZ28gb3V0c2lkZSBvdXIgcGFyZW50IGNhbnZhcycgYm91bmRzLCBzaW5jZSB0aGlzIHdvdWxkIGJlIGEgd2FzdGUgb2YgbWVtb3J5ICh3b3VsZG4ndCBiZSB3cml0dGVuKVxyXG4gICAgICAgICAgLy8gVGhlIHJvdW5kLW91dCB3aWxsIG1ha2Ugc3VyZSB3ZSBoYXZlIHBpeGVsIGFsaWdubWVudCwgc28gdGhhdCB3ZSB3b24ndCBnZXQgYmx1cnMgb3IgYWxpYXNpbmcvYmxpdHRpbmdcclxuICAgICAgICAgIC8vIGVmZmVjdHMgd2hlbiBjb3B5aW5nIHRoaW5ncyBvdmVyLlxyXG4gICAgICAgICAgY29uc3QgY2hpbGRDYW52YXNCb3VuZHMgPSBjaGlsZC5sb2NhbEJvdW5kcy50cmFuc2Zvcm1lZCggbWF0cml4ICkuZGlsYXRlKCA0ICkucm91bmRPdXQoKS5jb25zdHJhaW5Cb3VuZHMoXHJcbiAgICAgICAgICAgIHNjcmF0Y2hCb3VuZHMyRXh0cmEuc2V0TWluTWF4KCAwLCAwLCB3cmFwcGVyLmNhbnZhcy53aWR0aCwgd3JhcHBlci5jYW52YXMuaGVpZ2h0IClcclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgaWYgKCBjaGlsZENhbnZhc0JvdW5kcy53aWR0aCA+IDAgJiYgY2hpbGRDYW52YXNCb3VuZHMuaGVpZ2h0ID4gMCApIHtcclxuICAgICAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFdlJ2xsIHNldCBvdXIgQ2FudmFzIHRvIHRoZSBmaXR0ZWQgd2lkdGgsIGFuZCB3aWxsIGhhbmRsZSB0aGUgb2Zmc2V0cyBiZWxvdy5cclxuICAgICAgICAgICAgY2FudmFzLndpZHRoID0gY2hpbGRDYW52YXNCb3VuZHMud2lkdGg7XHJcbiAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBjaGlsZENhbnZhc0JvdW5kcy5oZWlnaHQ7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApITtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRXcmFwcGVyID0gbmV3IENhbnZhc0NvbnRleHRXcmFwcGVyKCBjYW52YXMsIGNvbnRleHQgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFmdGVyIG91ciBhbmNlc3RvciB0cmFuc2Zvcm0gaXMgYXBwbGllZCwgd2UnbGwgbmVlZCB0byBhcHBseSBhbm90aGVyIG9mZnNldCBmb3IgZml0dGVkIENhbnZhcy4gV2UnbGxcclxuICAgICAgICAgICAgLy8gbmVlZCB0byBwYXNzIHRoaXMgdG8gZGVzY2VuZGFudHMgQU5EIGFwcGx5IGl0IHRvIHRoZSBzdWItY29udGV4dC5cclxuICAgICAgICAgICAgY29uc3Qgc3ViTWF0cml4ID0gbWF0cml4LmNvcHkoKS5wcmVwZW5kVHJhbnNsYXRpb24oIC1jaGlsZENhbnZhc0JvdW5kcy5taW5YLCAtY2hpbGRDYW52YXNCb3VuZHMubWluWSApO1xyXG5cclxuICAgICAgICAgICAgc3ViTWF0cml4LmNhbnZhc1NldFRyYW5zZm9ybSggY29udGV4dCApO1xyXG4gICAgICAgICAgICBjaGlsZC5yZW5kZXJUb0NhbnZhc1N1YnRyZWUoIGNoaWxkV3JhcHBlciwgc3ViTWF0cml4ICk7XHJcblxyXG4gICAgICAgICAgICB3cmFwcGVyLmNvbnRleHQuc2F2ZSgpO1xyXG4gICAgICAgICAgICBpZiAoIGNoaWxkLmNsaXBBcmVhICkge1xyXG4gICAgICAgICAgICAgIHdyYXBwZXIuY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICBjaGlsZC5jbGlwQXJlYS53cml0ZVRvQ29udGV4dCggd3JhcHBlci5jb250ZXh0ICk7XHJcbiAgICAgICAgICAgICAgd3JhcHBlci5jb250ZXh0LmNsaXAoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB3cmFwcGVyLmNvbnRleHQuc2V0VHJhbnNmb3JtKCAxLCAwLCAwLCAxLCAwLCAwICk7IC8vIGlkZW50aXR5XHJcbiAgICAgICAgICAgIHdyYXBwZXIuY29udGV4dC5nbG9iYWxBbHBoYSA9IGNoaWxkLmVmZmVjdGl2ZU9wYWNpdHk7XHJcblxyXG4gICAgICAgICAgICBsZXQgc2V0RmlsdGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmICggY2hpbGQuX2ZpbHRlcnMubGVuZ3RoICkge1xyXG4gICAgICAgICAgICAgIC8vIEZpbHRlcnMgc2hvdWxkbid0IGJlIHRvbyBvZnRlbiwgc28gbGVzcyBjb25jZXJuZWQgYWJvdXQgdGhlIEdDIGhlcmUgKGFuZCB0aGlzIGlzIHNvIG11Y2ggZWFzaWVyIHRvIHJlYWQpLlxyXG4gICAgICAgICAgICAgIC8vIFBlcmZvcm1hbmNlIGJvdHRsZW5lY2sgZm9yIG5vdCB1c2luZyB0aGlzIGZhbGxiYWNrIHN0eWxlLCBzbyB3ZSdyZSBhbGxvd2luZyBpdCBmb3IgQ2hyb21lIGV2ZW4gdGhvdWdoXHJcbiAgICAgICAgICAgICAgLy8gdGhlIHZpc3VhbCBkaWZmZXJlbmNlcyBtYXkgYmUgcHJlc2VudCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMTM5XHJcbiAgICAgICAgICAgICAgaWYgKCBGZWF0dXJlcy5jYW52YXNGaWx0ZXIgJiYgXy5ldmVyeSggY2hpbGQuX2ZpbHRlcnMsIGZpbHRlciA9PiBmaWx0ZXIuaXNET01Db21wYXRpYmxlKCkgKSApIHtcclxuICAgICAgICAgICAgICAgIHdyYXBwZXIuY29udGV4dC5maWx0ZXIgPSBjaGlsZC5fZmlsdGVycy5tYXAoIGZpbHRlciA9PiBmaWx0ZXIuZ2V0Q1NTRmlsdGVyU3RyaW5nKCkgKS5qb2luKCAnICcgKTtcclxuICAgICAgICAgICAgICAgIHNldEZpbHRlciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuX2ZpbHRlcnMuZm9yRWFjaCggZmlsdGVyID0+IGZpbHRlci5hcHBseUNhbnZhc0ZpbHRlciggY2hpbGRXcmFwcGVyICkgKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBpbnZlcnNlIHRyYW5zZm9ybSBpcyBhcHBsaWVkIHRvIGhhbmRsZSBmaXR0aW5nXHJcbiAgICAgICAgICAgIHdyYXBwZXIuY29udGV4dC5kcmF3SW1hZ2UoIGNhbnZhcywgY2hpbGRDYW52YXNCb3VuZHMubWluWCwgY2hpbGRDYW52YXNCb3VuZHMubWluWSApO1xyXG4gICAgICAgICAgICB3cmFwcGVyLmNvbnRleHQucmVzdG9yZSgpO1xyXG4gICAgICAgICAgICBpZiAoIHNldEZpbHRlciApIHtcclxuICAgICAgICAgICAgICB3cmFwcGVyLmNvbnRleHQuZmlsdGVyID0gJ25vbmUnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgY2hpbGQucmVuZGVyVG9DYW52YXNTdWJ0cmVlKCB3cmFwcGVyLCBtYXRyaXggKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWF0cml4Lm11bHRpcGx5TWF0cml4KCBjaGlsZC5fdHJhbnNmb3JtLmdldEludmVyc2UoKSApO1xyXG4gICAgICAgIHdyYXBwZXIuY29udGV4dC5yZXN0b3JlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBkZXByZWNhdGVkXHJcbiAgICogUmVuZGVyIHRoaXMgTm9kZSB0byB0aGUgQ2FudmFzIChjbGVhcmluZyBpdCBmaXJzdClcclxuICAgKi9cclxuICBwdWJsaWMgcmVuZGVyVG9DYW52YXMoIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FsbGJhY2s/OiAoKSA9PiB2b2lkLCBiYWNrZ3JvdW5kQ29sb3I/OiBzdHJpbmcgKTogdm9pZCB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGRlcHJlY2F0aW9uV2FybmluZyggJ05vZGUucmVuZGVyVG9DYW52YXMoKSBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIE5vZGUucmFzdGVyaXplZCgpIGluc3RlYWQnICk7XHJcblxyXG4gICAgLy8gc2hvdWxkIGJhc2ljYWxseSByZXNldCBldmVyeXRoaW5nIChhbmQgY2xlYXIgdGhlIENhbnZhcylcclxuICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy53aWR0aDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWFzc2lnblxyXG5cclxuICAgIGlmICggYmFja2dyb3VuZENvbG9yICkge1xyXG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGJhY2tncm91bmRDb2xvcjtcclxuICAgICAgY29udGV4dC5maWxsUmVjdCggMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0ICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgd3JhcHBlciA9IG5ldyBDYW52YXNDb250ZXh0V3JhcHBlciggY2FudmFzLCBjb250ZXh0ICk7XHJcblxyXG4gICAgdGhpcy5yZW5kZXJUb0NhbnZhc1N1YnRyZWUoIHdyYXBwZXIsIE1hdHJpeDMuaWRlbnRpdHkoKSApO1xyXG5cclxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCk7IC8vIHRoaXMgd2FzIG9yaWdpbmFsbHkgYXN5bmNocm9ub3VzLCBzbyB3ZSBoYWQgYSBjYWxsYmFja1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVuZGVycyB0aGlzIE5vZGUgdG8gYW4gSFRNTENhbnZhc0VsZW1lbnQuIElmIHRvQ2FudmFzKCBjYWxsYmFjayApIGlzIHVzZWQsIHRoZSBjYW52YXMgd2lsbCBjb250YWluIHRoZSBub2RlJ3NcclxuICAgKiBlbnRpcmUgYm91bmRzIChpZiBubyB4L3kvd2lkdGgvaGVpZ2h0IGlzIHByb3ZpZGVkKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIGNhbGxiYWNrIC0gY2FsbGJhY2soIGNhbnZhcywgeCwgeSwgd2lkdGgsIGhlaWdodCApIGlzIGNhbGxlZCwgd2hlcmUgeCx5IGFyZSBjb21wdXRlZCBpZiBub3Qgc3BlY2lmaWVkLlxyXG4gICAqIEBwYXJhbSBbeF0gLSBUaGUgWCBvZmZzZXQgZm9yIHdoZXJlIHRoZSB1cHBlci1sZWZ0IG9mIHRoZSBjb250ZW50IGRyYXduIGludG8gdGhlIENhbnZhc1xyXG4gICAqIEBwYXJhbSBbeV0gLSBUaGUgWSBvZmZzZXQgZm9yIHdoZXJlIHRoZSB1cHBlci1sZWZ0IG9mIHRoZSBjb250ZW50IGRyYXduIGludG8gdGhlIENhbnZhc1xyXG4gICAqIEBwYXJhbSBbd2lkdGhdIC0gVGhlIHdpZHRoIG9mIHRoZSBDYW52YXMgb3V0cHV0XHJcbiAgICogQHBhcmFtIFtoZWlnaHRdIC0gVGhlIGhlaWdodCBvZiB0aGUgQ2FudmFzIG91dHB1dFxyXG4gICAqL1xyXG4gIHB1YmxpYyB0b0NhbnZhcyggY2FsbGJhY2s6ICggY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyICkgPT4gdm9pZCwgeD86IG51bWJlciwgeT86IG51bWJlciwgd2lkdGg/OiBudW1iZXIsIGhlaWdodD86IG51bWJlciApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHggPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgeCA9PT0gJ251bWJlcicsICdJZiBwcm92aWRlZCwgeCBzaG91bGQgYmUgYSBudW1iZXInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB5ID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHkgPT09ICdudW1iZXInLCAnSWYgcHJvdmlkZWQsIHkgc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggd2lkdGggPT09IHVuZGVmaW5lZCB8fCAoIHR5cGVvZiB3aWR0aCA9PT0gJ251bWJlcicgJiYgd2lkdGggPj0gMCAmJiAoIHdpZHRoICUgMSA9PT0gMCApICksXHJcbiAgICAgICdJZiBwcm92aWRlZCwgd2lkdGggc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBoZWlnaHQgPT09IHVuZGVmaW5lZCB8fCAoIHR5cGVvZiBoZWlnaHQgPT09ICdudW1iZXInICYmIGhlaWdodCA+PSAwICYmICggaGVpZ2h0ICUgMSA9PT0gMCApICksXHJcbiAgICAgICdJZiBwcm92aWRlZCwgaGVpZ2h0IHNob3VsZCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyJyApO1xyXG5cclxuICAgIGNvbnN0IHBhZGRpbmcgPSAyOyAvLyBwYWRkaW5nIHVzZWQgaWYgeCBhbmQgeSBhcmUgbm90IHNldFxyXG5cclxuICAgIC8vIGZvciBub3csIHdlIGFkZCBhbiB1bnBsZWFzYW50IGhhY2sgYXJvdW5kIFRleHQgYW5kIHNhZmUgYm91bmRzIGluIGdlbmVyYWwuIFdlIGRvbid0IHdhbnQgdG8gYWRkIGFub3RoZXIgQm91bmRzMiBvYmplY3QgcGVyIE5vZGUgZm9yIG5vdy5cclxuICAgIGNvbnN0IGJvdW5kcyA9IHRoaXMuZ2V0Qm91bmRzKCkudW5pb24oIHRoaXMubG9jYWxUb1BhcmVudEJvdW5kcyggdGhpcy5nZXRTYWZlU2VsZkJvdW5kcygpICkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFib3VuZHMuaXNFbXB0eSgpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAoIHggIT09IHVuZGVmaW5lZCAmJiB5ICE9PSB1bmRlZmluZWQgJiYgd2lkdGggIT09IHVuZGVmaW5lZCAmJiBoZWlnaHQgIT09IHVuZGVmaW5lZCApLFxyXG4gICAgICAnU2hvdWxkIG5vdCBjYWxsIHRvQ2FudmFzIG9uIGEgTm9kZSB3aXRoIGVtcHR5IGJvdW5kcywgdW5sZXNzIGFsbCBkaW1lbnNpb25zIGFyZSBwcm92aWRlZCcgKTtcclxuXHJcbiAgICB4ID0geCAhPT0gdW5kZWZpbmVkID8geCA6IE1hdGguY2VpbCggcGFkZGluZyAtIGJvdW5kcy5taW5YICk7XHJcbiAgICB5ID0geSAhPT0gdW5kZWZpbmVkID8geSA6IE1hdGguY2VpbCggcGFkZGluZyAtIGJvdW5kcy5taW5ZICk7XHJcbiAgICB3aWR0aCA9IHdpZHRoICE9PSB1bmRlZmluZWQgPyB3aWR0aCA6IE1hdGguY2VpbCggYm91bmRzLmdldFdpZHRoKCkgKyAyICogcGFkZGluZyApO1xyXG4gICAgaGVpZ2h0ID0gaGVpZ2h0ICE9PSB1bmRlZmluZWQgPyBoZWlnaHQgOiBNYXRoLmNlaWwoIGJvdW5kcy5nZXRIZWlnaHQoKSArIDIgKiBwYWRkaW5nICk7XHJcblxyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApITtcclxuXHJcbiAgICAvLyBzaGlmdCBvdXIgcmVuZGVyaW5nIG92ZXIgYnkgdGhlIGRlc2lyZWQgYW1vdW50XHJcbiAgICBjb250ZXh0LnRyYW5zbGF0ZSggeCwgeSApO1xyXG5cclxuICAgIC8vIGZvciBBUEkgY29tcGF0aWJpbGl0eSwgd2UgYXBwbHkgb3VyIG93biB0cmFuc2Zvcm0gaGVyZVxyXG4gICAgdGhpcy5fdHJhbnNmb3JtLmdldE1hdHJpeCgpLmNhbnZhc0FwcGVuZFRyYW5zZm9ybSggY29udGV4dCApO1xyXG5cclxuICAgIGNvbnN0IHdyYXBwZXIgPSBuZXcgQ2FudmFzQ29udGV4dFdyYXBwZXIoIGNhbnZhcywgY29udGV4dCApO1xyXG5cclxuICAgIHRoaXMucmVuZGVyVG9DYW52YXNTdWJ0cmVlKCB3cmFwcGVyLCBNYXRyaXgzLnRyYW5zbGF0aW9uKCB4LCB5ICkudGltZXNNYXRyaXgoIHRoaXMuX3RyYW5zZm9ybS5nZXRNYXRyaXgoKSApICk7XHJcblxyXG4gICAgY2FsbGJhY2soIGNhbnZhcywgeCwgeSwgd2lkdGgsIGhlaWdodCApOyAvLyB3ZSB1c2VkIHRvIGJlIGFzeW5jaHJvbm91c1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVuZGVycyB0aGlzIE5vZGUgdG8gYSBDYW52YXMsIHRoZW4gY2FsbHMgdGhlIGNhbGxiYWNrIHdpdGggdGhlIGRhdGEgVVJJIGZyb20gaXQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gY2FsbGJhY2sgLSBjYWxsYmFjayggZGF0YVVSSSB7c3RyaW5nfSwgeCwgeSwgd2lkdGgsIGhlaWdodCApIGlzIGNhbGxlZCwgd2hlcmUgeCx5IGFyZSBjb21wdXRlZCBpZiBub3Qgc3BlY2lmaWVkLlxyXG4gICAqIEBwYXJhbSBbeF0gLSBUaGUgWCBvZmZzZXQgZm9yIHdoZXJlIHRoZSB1cHBlci1sZWZ0IG9mIHRoZSBjb250ZW50IGRyYXduIGludG8gdGhlIENhbnZhc1xyXG4gICAqIEBwYXJhbSBbeV0gLSBUaGUgWSBvZmZzZXQgZm9yIHdoZXJlIHRoZSB1cHBlci1sZWZ0IG9mIHRoZSBjb250ZW50IGRyYXduIGludG8gdGhlIENhbnZhc1xyXG4gICAqIEBwYXJhbSBbd2lkdGhdIC0gVGhlIHdpZHRoIG9mIHRoZSBDYW52YXMgb3V0cHV0XHJcbiAgICogQHBhcmFtIFtoZWlnaHRdIC0gVGhlIGhlaWdodCBvZiB0aGUgQ2FudmFzIG91dHB1dFxyXG4gICAqL1xyXG4gIHB1YmxpYyB0b0RhdGFVUkwoIGNhbGxiYWNrOiAoIGRhdGFVUkk6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyICkgPT4gdm9pZCwgeD86IG51bWJlciwgeT86IG51bWJlciwgd2lkdGg/OiBudW1iZXIsIGhlaWdodD86IG51bWJlciApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHggPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgeCA9PT0gJ251bWJlcicsICdJZiBwcm92aWRlZCwgeCBzaG91bGQgYmUgYSBudW1iZXInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB5ID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHkgPT09ICdudW1iZXInLCAnSWYgcHJvdmlkZWQsIHkgc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggd2lkdGggPT09IHVuZGVmaW5lZCB8fCAoIHR5cGVvZiB3aWR0aCA9PT0gJ251bWJlcicgJiYgd2lkdGggPj0gMCAmJiAoIHdpZHRoICUgMSA9PT0gMCApICksXHJcbiAgICAgICdJZiBwcm92aWRlZCwgd2lkdGggc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBoZWlnaHQgPT09IHVuZGVmaW5lZCB8fCAoIHR5cGVvZiBoZWlnaHQgPT09ICdudW1iZXInICYmIGhlaWdodCA+PSAwICYmICggaGVpZ2h0ICUgMSA9PT0gMCApICksXHJcbiAgICAgICdJZiBwcm92aWRlZCwgaGVpZ2h0IHNob3VsZCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyJyApO1xyXG5cclxuICAgIHRoaXMudG9DYW52YXMoICggY2FudmFzLCB4LCB5LCB3aWR0aCwgaGVpZ2h0ICkgPT4ge1xyXG4gICAgICAvLyB0aGlzIHggYW5kIHkgc2hhZG93IHRoZSBvdXRzaWRlIHBhcmFtZXRlcnMsIGFuZCB3aWxsIGJlIGRpZmZlcmVudCBpZiB0aGUgb3V0c2lkZSBwYXJhbWV0ZXJzIGFyZSB1bmRlZmluZWRcclxuICAgICAgY2FsbGJhY2soIGNhbnZhcy50b0RhdGFVUkwoKSwgeCwgeSwgd2lkdGgsIGhlaWdodCApO1xyXG4gICAgfSwgeCwgeSwgd2lkdGgsIGhlaWdodCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIGNhbGxiYWNrIHdpdGggYW4gSFRNTEltYWdlRWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoaXMgTm9kZSdzIHN1YnRyZWUncyB2aXN1YWwgZm9ybS5cclxuICAgKiBXaWxsIGFsd2F5cyBiZSBhc3luY2hyb25vdXMuXHJcbiAgICogQGRlcHJlY2F0ZWQgLSBVc2Ugbm9kZS5yYXN0ZXJpemVkKCkgZm9yIGNyZWF0aW5nIGEgcmFzdGVyaXplZCBjb3B5LCBvciBnZW5lcmFsbHkgaXQncyBiZXN0IHRvIGdldCB0aGUgZGF0YVxyXG4gICAqICAgICAgICAgICAgICAgVVJMIGluc3RlYWQgZGlyZWN0bHkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gY2FsbGJhY2sgLSBjYWxsYmFjayggaW1hZ2Uge0hUTUxJbWFnZUVsZW1lbnR9LCB4LCB5ICkgaXMgY2FsbGVkXHJcbiAgICogQHBhcmFtIFt4XSAtIFRoZSBYIG9mZnNldCBmb3Igd2hlcmUgdGhlIHVwcGVyLWxlZnQgb2YgdGhlIGNvbnRlbnQgZHJhd24gaW50byB0aGUgQ2FudmFzXHJcbiAgICogQHBhcmFtIFt5XSAtIFRoZSBZIG9mZnNldCBmb3Igd2hlcmUgdGhlIHVwcGVyLWxlZnQgb2YgdGhlIGNvbnRlbnQgZHJhd24gaW50byB0aGUgQ2FudmFzXHJcbiAgICogQHBhcmFtIFt3aWR0aF0gLSBUaGUgd2lkdGggb2YgdGhlIENhbnZhcyBvdXRwdXRcclxuICAgKiBAcGFyYW0gW2hlaWdodF0gLSBUaGUgaGVpZ2h0IG9mIHRoZSBDYW52YXMgb3V0cHV0XHJcbiAgICovXHJcbiAgcHVibGljIHRvSW1hZ2UoIGNhbGxiYWNrOiAoIGltYWdlOiBIVE1MSW1hZ2VFbGVtZW50LCB4OiBudW1iZXIsIHk6IG51bWJlciApID0+IHZvaWQsIHg/OiBudW1iZXIsIHk/OiBudW1iZXIsIHdpZHRoPzogbnVtYmVyLCBoZWlnaHQ/OiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGRlcHJlY2F0aW9uV2FybmluZyggJ05vZGUudG9JbWFnZSgpIGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgTm9kZS5yYXN0ZXJpemVkKCkgaW5zdGVhZCcgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB4ID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHggPT09ICdudW1iZXInLCAnSWYgcHJvdmlkZWQsIHggc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggeSA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiB5ID09PSAnbnVtYmVyJywgJ0lmIHByb3ZpZGVkLCB5IHNob3VsZCBiZSBhIG51bWJlcicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdpZHRoID09PSB1bmRlZmluZWQgfHwgKCB0eXBlb2Ygd2lkdGggPT09ICdudW1iZXInICYmIHdpZHRoID49IDAgJiYgKCB3aWR0aCAlIDEgPT09IDAgKSApLFxyXG4gICAgICAnSWYgcHJvdmlkZWQsIHdpZHRoIHNob3VsZCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaGVpZ2h0ID09PSB1bmRlZmluZWQgfHwgKCB0eXBlb2YgaGVpZ2h0ID09PSAnbnVtYmVyJyAmJiBoZWlnaHQgPj0gMCAmJiAoIGhlaWdodCAlIDEgPT09IDAgKSApLFxyXG4gICAgICAnSWYgcHJvdmlkZWQsIGhlaWdodCBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcclxuXHJcbiAgICB0aGlzLnRvRGF0YVVSTCggKCB1cmwsIHgsIHkgKSA9PiB7XHJcbiAgICAgIC8vIHRoaXMgeCBhbmQgeSBzaGFkb3cgdGhlIG91dHNpZGUgcGFyYW1ldGVycywgYW5kIHdpbGwgYmUgZGlmZmVyZW50IGlmIHRoZSBvdXRzaWRlIHBhcmFtZXRlcnMgYXJlIHVuZGVmaW5lZFxyXG4gICAgICBjb25zdCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaW1nJyApO1xyXG4gICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgIGNhbGxiYWNrKCBpbWcsIHgsIHkgKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIEkgYmVsaWV2ZSB3ZSBuZWVkIHRvIGRlbGV0ZSB0aGlzXHJcbiAgICAgICAgICBkZWxldGUgaW1nLm9ubG9hZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgICAgICAvLyBkbyBub3RoaW5nXHJcbiAgICAgICAgfSAvLyBmYWlscyBvbiBTYWZhcmkgNS4xXHJcbiAgICAgIH07XHJcbiAgICAgIGltZy5zcmMgPSB1cmw7XHJcbiAgICB9LCB4LCB5LCB3aWR0aCwgaGVpZ2h0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgY2FsbGJhY2sgd2l0aCBhbiBJbWFnZSBOb2RlIHRoYXQgY29udGFpbnMgdGhpcyBOb2RlJ3Mgc3VidHJlZSdzIHZpc3VhbCBmb3JtLiBUaGlzIGlzIGFsd2F5c1xyXG4gICAqIGFzeW5jaHJvbm91cywgYnV0IHRoZSByZXN1bHRpbmcgaW1hZ2UgTm9kZSBjYW4gYmUgdXNlZCB3aXRoIGFueSBiYWNrLWVuZCAoQ2FudmFzL1dlYkdML1NWRy9ldGMuKVxyXG4gICAqIEBkZXByZWNhdGVkIC0gVXNlIG5vZGUucmFzdGVyaXplZCgpIGluc3RlYWQgKHNob3VsZCBhdm9pZCB0aGUgYXN5bmNocm9ub3VzLW5lc3MpXHJcbiAgICpcclxuICAgKiBAcGFyYW0gY2FsbGJhY2sgLSBjYWxsYmFjayggaW1hZ2VOb2RlIHtJbWFnZX0gKSBpcyBjYWxsZWRcclxuICAgKiBAcGFyYW0gW3hdIC0gVGhlIFggb2Zmc2V0IGZvciB3aGVyZSB0aGUgdXBwZXItbGVmdCBvZiB0aGUgY29udGVudCBkcmF3biBpbnRvIHRoZSBDYW52YXNcclxuICAgKiBAcGFyYW0gW3ldIC0gVGhlIFkgb2Zmc2V0IGZvciB3aGVyZSB0aGUgdXBwZXItbGVmdCBvZiB0aGUgY29udGVudCBkcmF3biBpbnRvIHRoZSBDYW52YXNcclxuICAgKiBAcGFyYW0gW3dpZHRoXSAtIFRoZSB3aWR0aCBvZiB0aGUgQ2FudmFzIG91dHB1dFxyXG4gICAqIEBwYXJhbSBbaGVpZ2h0XSAtIFRoZSBoZWlnaHQgb2YgdGhlIENhbnZhcyBvdXRwdXRcclxuICAgKi9cclxuICBwdWJsaWMgdG9JbWFnZU5vZGVBc3luY2hyb25vdXMoIGNhbGxiYWNrOiAoIGltYWdlOiBOb2RlICkgPT4gdm9pZCwgeD86IG51bWJlciwgeT86IG51bWJlciwgd2lkdGg/OiBudW1iZXIsIGhlaWdodD86IG51bWJlciApOiB2b2lkIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgZGVwcmVjYXRpb25XYXJuaW5nKCAnTm9kZS50b0ltYWdlTm9kZUFzeW5jcmhvbm91cygpIGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgTm9kZS5yYXN0ZXJpemVkKCkgaW5zdGVhZCcgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB4ID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHggPT09ICdudW1iZXInLCAnSWYgcHJvdmlkZWQsIHggc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggeSA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiB5ID09PSAnbnVtYmVyJywgJ0lmIHByb3ZpZGVkLCB5IHNob3VsZCBiZSBhIG51bWJlcicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdpZHRoID09PSB1bmRlZmluZWQgfHwgKCB0eXBlb2Ygd2lkdGggPT09ICdudW1iZXInICYmIHdpZHRoID49IDAgJiYgKCB3aWR0aCAlIDEgPT09IDAgKSApLFxyXG4gICAgICAnSWYgcHJvdmlkZWQsIHdpZHRoIHNob3VsZCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaGVpZ2h0ID09PSB1bmRlZmluZWQgfHwgKCB0eXBlb2YgaGVpZ2h0ID09PSAnbnVtYmVyJyAmJiBoZWlnaHQgPj0gMCAmJiAoIGhlaWdodCAlIDEgPT09IDAgKSApLFxyXG4gICAgICAnSWYgcHJvdmlkZWQsIGhlaWdodCBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcclxuXHJcbiAgICB0aGlzLnRvSW1hZ2UoICggaW1hZ2UsIHgsIHkgKSA9PiB7XHJcbiAgICAgIGNhbGxiYWNrKCBuZXcgTm9kZSggeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWh0bWwtY29uc3RydWN0b3JzXHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgIG5ldyBJbWFnZSggaW1hZ2UsIHsgeDogLXgsIHk6IC15IH0gKVxyXG4gICAgICAgIF1cclxuICAgICAgfSApICk7XHJcbiAgICB9LCB4LCB5LCB3aWR0aCwgaGVpZ2h0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgTm9kZSBjb250YWluaW5nIGFuIEltYWdlIE5vZGUgdGhhdCBjb250YWlucyB0aGlzIE5vZGUncyBzdWJ0cmVlJ3MgdmlzdWFsIGZvcm0uIFRoaXMgaXMgYWx3YXlzXHJcbiAgICogc3luY2hyb25vdXMsIGJ1dCB0aGUgcmVzdWx0aW5nIGltYWdlIE5vZGUgY2FuIE9OTFkgdXNlZCB3aXRoIENhbnZhcy9XZWJHTCAoTk9UIFNWRykuXHJcbiAgICogQGRlcHJlY2F0ZWQgLSBVc2Ugbm9kZS5yYXN0ZXJpemVkKCkgaW5zdGVhZCwgc2hvdWxkIGJlIG1vc3RseSBlcXVpdmFsZW50IGlmIHVzZUNhbnZhczp0cnVlIGlzIHByb3ZpZGVkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIFt4XSAtIFRoZSBYIG9mZnNldCBmb3Igd2hlcmUgdGhlIHVwcGVyLWxlZnQgb2YgdGhlIGNvbnRlbnQgZHJhd24gaW50byB0aGUgQ2FudmFzXHJcbiAgICogQHBhcmFtIFt5XSAtIFRoZSBZIG9mZnNldCBmb3Igd2hlcmUgdGhlIHVwcGVyLWxlZnQgb2YgdGhlIGNvbnRlbnQgZHJhd24gaW50byB0aGUgQ2FudmFzXHJcbiAgICogQHBhcmFtIFt3aWR0aF0gLSBUaGUgd2lkdGggb2YgdGhlIENhbnZhcyBvdXRwdXRcclxuICAgKiBAcGFyYW0gW2hlaWdodF0gLSBUaGUgaGVpZ2h0IG9mIHRoZSBDYW52YXMgb3V0cHV0XHJcbiAgICovXHJcbiAgcHVibGljIHRvQ2FudmFzTm9kZVN5bmNocm9ub3VzKCB4PzogbnVtYmVyLCB5PzogbnVtYmVyLCB3aWR0aD86IG51bWJlciwgaGVpZ2h0PzogbnVtYmVyICk6IE5vZGUge1xyXG5cclxuICAgIGFzc2VydCAmJiBkZXByZWNhdGlvbldhcm5pbmcoICdOb2RlLnRvQ2FudmFzTm9kZVN5bmNocm9ub3VzKCkgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBOb2RlLnJhc3Rlcml6ZWQoKSBpbnN0ZWFkJyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHggPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgeCA9PT0gJ251bWJlcicsICdJZiBwcm92aWRlZCwgeCBzaG91bGQgYmUgYSBudW1iZXInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB5ID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHkgPT09ICdudW1iZXInLCAnSWYgcHJvdmlkZWQsIHkgc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggd2lkdGggPT09IHVuZGVmaW5lZCB8fCAoIHR5cGVvZiB3aWR0aCA9PT0gJ251bWJlcicgJiYgd2lkdGggPj0gMCAmJiAoIHdpZHRoICUgMSA9PT0gMCApICksXHJcbiAgICAgICdJZiBwcm92aWRlZCwgd2lkdGggc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBoZWlnaHQgPT09IHVuZGVmaW5lZCB8fCAoIHR5cGVvZiBoZWlnaHQgPT09ICdudW1iZXInICYmIGhlaWdodCA+PSAwICYmICggaGVpZ2h0ICUgMSA9PT0gMCApICksXHJcbiAgICAgICdJZiBwcm92aWRlZCwgaGVpZ2h0IHNob3VsZCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyJyApO1xyXG5cclxuICAgIGxldCByZXN1bHQ6IE5vZGUgfCBudWxsID0gbnVsbDtcclxuICAgIHRoaXMudG9DYW52YXMoICggY2FudmFzLCB4LCB5ICkgPT4ge1xyXG4gICAgICByZXN1bHQgPSBuZXcgTm9kZSggeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWh0bWwtY29uc3RydWN0b3JzXHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgIG5ldyBJbWFnZSggY2FudmFzLCB7IHg6IC14LCB5OiAteSB9IClcclxuICAgICAgICBdXHJcbiAgICAgIH0gKTtcclxuICAgIH0sIHgsIHksIHdpZHRoLCBoZWlnaHQgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlc3VsdCwgJ3RvQ2FudmFzTm9kZVN5bmNocm9ub3VzIHJlcXVpcmVzIHRoYXQgdGhlIG5vZGUgY2FuIGJlIHJlbmRlcmVkIG9ubHkgdXNpbmcgQ2FudmFzJyApO1xyXG4gICAgcmV0dXJuIHJlc3VsdCE7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIEltYWdlIHRoYXQgcmVuZGVycyB0aGlzIE5vZGUuIFRoaXMgaXMgYWx3YXlzIHN5bmNocm9ub3VzLCBhbmQgc2V0cyBpbml0aWFsV2lkdGgvaW5pdGlhbEhlaWdodCBzbyB0aGF0XHJcbiAgICogd2UgaGF2ZSB0aGUgYm91bmRzIGltbWVkaWF0ZWx5LiAgVXNlIHRoaXMgbWV0aG9kIGlmIHlvdSBuZWVkIHRvIHJlZHVjZSB0aGUgbnVtYmVyIG9mIHBhcmVudCBOb2Rlcy5cclxuICAgKlxyXG4gICAqIE5PVEU6IHRoZSByZXN1bHRhbnQgSW1hZ2Ugc2hvdWxkIGJlIHBvc2l0aW9uZWQgdXNpbmcgaXRzIGJvdW5kcyByYXRoZXIgdGhhbiAoeCx5KS4gIFRvIGNyZWF0ZSBhIE5vZGUgdGhhdCBjYW4gYmVcclxuICAgKiBwb3NpdGlvbmVkIGxpa2UgYW55IG90aGVyIG5vZGUsIHBsZWFzZSB1c2UgdG9EYXRhVVJMTm9kZVN5bmNocm9ub3VzLlxyXG4gICAqIEBkZXByZWNhdGVkIC0gVXNlIG5vZGUucmFzdGVyaXplZCgpIGluc3RlYWQsIHNob3VsZCBiZSBtb3N0bHkgZXF1aXZhbGVudCBpZiB3cmFwOmZhbHNlIGlzIHByb3ZpZGVkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIFt4XSAtIFRoZSBYIG9mZnNldCBmb3Igd2hlcmUgdGhlIHVwcGVyLWxlZnQgb2YgdGhlIGNvbnRlbnQgZHJhd24gaW50byB0aGUgQ2FudmFzXHJcbiAgICogQHBhcmFtIFt5XSAtIFRoZSBZIG9mZnNldCBmb3Igd2hlcmUgdGhlIHVwcGVyLWxlZnQgb2YgdGhlIGNvbnRlbnQgZHJhd24gaW50byB0aGUgQ2FudmFzXHJcbiAgICogQHBhcmFtIFt3aWR0aF0gLSBUaGUgd2lkdGggb2YgdGhlIENhbnZhcyBvdXRwdXRcclxuICAgKiBAcGFyYW0gW2hlaWdodF0gLSBUaGUgaGVpZ2h0IG9mIHRoZSBDYW52YXMgb3V0cHV0XHJcbiAgICovXHJcbiAgcHVibGljIHRvRGF0YVVSTEltYWdlU3luY2hyb25vdXMoIHg/OiBudW1iZXIsIHk/OiBudW1iZXIsIHdpZHRoPzogbnVtYmVyLCBoZWlnaHQ/OiBudW1iZXIgKTogSW1hZ2Uge1xyXG5cclxuICAgIGFzc2VydCAmJiBkZXByZWNhdGlvbldhcm5pbmcoICdOb2RlLnRvRGF0YVVSTEltYWdlU3ljaHJvbm91cygpIGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgTm9kZS5yYXN0ZXJpemVkKCkgaW5zdGVhZCcgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB4ID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHggPT09ICdudW1iZXInLCAnSWYgcHJvdmlkZWQsIHggc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggeSA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiB5ID09PSAnbnVtYmVyJywgJ0lmIHByb3ZpZGVkLCB5IHNob3VsZCBiZSBhIG51bWJlcicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdpZHRoID09PSB1bmRlZmluZWQgfHwgKCB0eXBlb2Ygd2lkdGggPT09ICdudW1iZXInICYmIHdpZHRoID49IDAgJiYgKCB3aWR0aCAlIDEgPT09IDAgKSApLFxyXG4gICAgICAnSWYgcHJvdmlkZWQsIHdpZHRoIHNob3VsZCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaGVpZ2h0ID09PSB1bmRlZmluZWQgfHwgKCB0eXBlb2YgaGVpZ2h0ID09PSAnbnVtYmVyJyAmJiBoZWlnaHQgPj0gMCAmJiAoIGhlaWdodCAlIDEgPT09IDAgKSApLFxyXG4gICAgICAnSWYgcHJvdmlkZWQsIGhlaWdodCBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcclxuXHJcbiAgICBsZXQgcmVzdWx0OiBJbWFnZSB8IG51bGwgPSBudWxsO1xyXG4gICAgdGhpcy50b0RhdGFVUkwoICggZGF0YVVSTCwgeCwgeSwgd2lkdGgsIGhlaWdodCApID0+IHtcclxuICAgICAgcmVzdWx0ID0gbmV3IEltYWdlKCBkYXRhVVJMLCB7IHg6IC14LCB5OiAteSwgaW5pdGlhbFdpZHRoOiB3aWR0aCwgaW5pdGlhbEhlaWdodDogaGVpZ2h0IH0gKTtcclxuICAgIH0sIHgsIHksIHdpZHRoLCBoZWlnaHQgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlc3VsdCwgJ3RvRGF0YVVSTCBmYWlsZWQgdG8gcmV0dXJuIGEgcmVzdWx0IHN5bmNocm9ub3VzbHknICk7XHJcbiAgICByZXR1cm4gcmVzdWx0ITtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBOb2RlIHRoYXQgY29udGFpbnMgdGhpcyBOb2RlJ3Mgc3VidHJlZSdzIHZpc3VhbCBmb3JtLiBUaGlzIGlzIGFsd2F5cyBzeW5jaHJvbm91cywgYW5kIHNldHNcclxuICAgKiBpbml0aWFsV2lkdGgvaW5pdGlhbEhlaWdodCBzbyB0aGF0IHdlIGhhdmUgdGhlIGJvdW5kcyBpbW1lZGlhdGVseS4gIEFuIGV4dHJhIHdyYXBwZXIgTm9kZSBpcyBwcm92aWRlZFxyXG4gICAqIHNvIHRoYXQgdHJhbnNmb3JtcyBjYW4gYmUgZG9uZSBpbmRlcGVuZGVudGx5LiAgVXNlIHRoaXMgbWV0aG9kIGlmIHlvdSBuZWVkIHRvIGJlIGFibGUgdG8gdHJhbnNmb3JtIHRoZSBub2RlXHJcbiAgICogdGhlIHNhbWUgd2F5IGFzIGlmIGl0IGhhZCBub3QgYmVlbiByYXN0ZXJpemVkLlxyXG4gICAqIEBkZXByZWNhdGVkIC0gVXNlIG5vZGUucmFzdGVyaXplZCgpIGluc3RlYWQsIHNob3VsZCBiZSBtb3N0bHkgZXF1aXZhbGVudFxyXG4gICAqXHJcbiAgICogQHBhcmFtIFt4XSAtIFRoZSBYIG9mZnNldCBmb3Igd2hlcmUgdGhlIHVwcGVyLWxlZnQgb2YgdGhlIGNvbnRlbnQgZHJhd24gaW50byB0aGUgQ2FudmFzXHJcbiAgICogQHBhcmFtIFt5XSAtIFRoZSBZIG9mZnNldCBmb3Igd2hlcmUgdGhlIHVwcGVyLWxlZnQgb2YgdGhlIGNvbnRlbnQgZHJhd24gaW50byB0aGUgQ2FudmFzXHJcbiAgICogQHBhcmFtIFt3aWR0aF0gLSBUaGUgd2lkdGggb2YgdGhlIENhbnZhcyBvdXRwdXRcclxuICAgKiBAcGFyYW0gW2hlaWdodF0gLSBUaGUgaGVpZ2h0IG9mIHRoZSBDYW52YXMgb3V0cHV0XHJcbiAgICovXHJcbiAgcHVibGljIHRvRGF0YVVSTE5vZGVTeW5jaHJvbm91cyggeD86IG51bWJlciwgeT86IG51bWJlciwgd2lkdGg/OiBudW1iZXIsIGhlaWdodD86IG51bWJlciApOiBOb2RlIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgZGVwcmVjYXRpb25XYXJuaW5nKCAnTm9kZS50b0RhdGFVUkxOb2RlU3luY2hyb25vdXMoKSBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIE5vZGUucmFzdGVyaXplZCgpIGluc3RlYWQnICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggeCA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJywgJ0lmIHByb3ZpZGVkLCB4IHNob3VsZCBiZSBhIG51bWJlcicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHkgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgeSA9PT0gJ251bWJlcicsICdJZiBwcm92aWRlZCwgeSBzaG91bGQgYmUgYSBudW1iZXInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB3aWR0aCA9PT0gdW5kZWZpbmVkIHx8ICggdHlwZW9mIHdpZHRoID09PSAnbnVtYmVyJyAmJiB3aWR0aCA+PSAwICYmICggd2lkdGggJSAxID09PSAwICkgKSxcclxuICAgICAgJ0lmIHByb3ZpZGVkLCB3aWR0aCBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGhlaWdodCA9PT0gdW5kZWZpbmVkIHx8ICggdHlwZW9mIGhlaWdodCA9PT0gJ251bWJlcicgJiYgaGVpZ2h0ID49IDAgJiYgKCBoZWlnaHQgJSAxID09PSAwICkgKSxcclxuICAgICAgJ0lmIHByb3ZpZGVkLCBoZWlnaHQgc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXInICk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBOb2RlKCB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8taHRtbC1jb25zdHJ1Y3RvcnNcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICB0aGlzLnRvRGF0YVVSTEltYWdlU3luY2hyb25vdXMoIHgsIHksIHdpZHRoLCBoZWlnaHQgKVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgTm9kZSAoYmFja2VkIGJ5IGEgc2NlbmVyeSBJbWFnZSkgdGhhdCBpcyBhIHJhc3Rlcml6ZWQgdmVyc2lvbiBvZiB0aGlzIG5vZGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gW29wdGlvbnNdIC0gU2VlIGJlbG93IG9wdGlvbnMuIFRoaXMgaXMgYWxzbyBwYXNzZWQgZGlyZWN0bHkgdG8gdGhlIGNyZWF0ZWQgSW1hZ2Ugb2JqZWN0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyByYXN0ZXJpemVkKCBwcm92aWRlZE9wdGlvbnM/OiBSYXN0ZXJpemVkT3B0aW9ucyApOiBOb2RlIHtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UmFzdGVyaXplZE9wdGlvbnMsIFJhc3Rlcml6ZWRPcHRpb25zPigpKCB7XHJcbiAgICAgIC8vIHtudW1iZXJ9IC0gQ29udHJvbHMgdGhlIHJlc29sdXRpb24gb2YgdGhlIGltYWdlIHJlbGF0aXZlIHRvIHRoZSBsb2NhbCB2aWV3IHVuaXRzLiBGb3IgZXhhbXBsZSwgaWYgb3VyIE5vZGUgaXNcclxuICAgICAgLy8gfjEwMCB2aWV3IHVuaXRzIGFjcm9zcyAoaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUpIGJ1dCB5b3Ugd2FudCB0aGUgaW1hZ2UgdG8gYWN0dWFsbHkgaGF2ZSBhIH4yMDAtcGl4ZWxcclxuICAgICAgLy8gcmVzb2x1dGlvbiwgcHJvdmlkZSByZXNvbHV0aW9uOjIuXHJcbiAgICAgIHJlc29sdXRpb246IDEsXHJcblxyXG4gICAgICAvLyB7Qm91bmRzMnxudWxsfSAtIElmIHByb3ZpZGVkLCBpdCB3aWxsIGNvbnRyb2wgdGhlIHgveS93aWR0aC9oZWlnaHQgb2YgdGhlIHRvQ2FudmFzIGNhbGwuIFNlZSB0b0NhbnZhcyBmb3JcclxuICAgICAgLy8gZGV0YWlscyBvbiBob3cgdGhpcyBjb250cm9scyB0aGUgcmFzdGVyaXphdGlvbi4gVGhpcyBpcyBpbiB0aGUgXCJwYXJlbnRcIiBjb29yZGluYXRlIGZyYW1lLCBzaW1pbGFyIHRvXHJcbiAgICAgIC8vIG5vZGUuYm91bmRzLlxyXG4gICAgICBzb3VyY2VCb3VuZHM6IG51bGwsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBJZiB0cnVlLCB0aGUgbG9jYWxCb3VuZHMgb2YgdGhlIHJlc3VsdCB3aWxsIGJlIHNldCBpbiBhIHdheSBzdWNoIHRoYXQgaXQgd2lsbCBwcmVjaXNlbHkgbWF0Y2hcclxuICAgICAgLy8gdGhlIHZpc2libGUgYm91bmRzIG9mIHRoZSBvcmlnaW5hbCBOb2RlICh0aGlzKS4gTm90ZSB0aGF0IGFudGlhbGlhc2VkIGNvbnRlbnQgKHdpdGggYSBtdWNoIGxvd2VyIHJlc29sdXRpb24pXHJcbiAgICAgIC8vIG1heSBzb21ld2hhdCBzcGlsbCBvdXRzaWRlIHRoZXNlIGJvdW5kcyBpZiB0aGlzIGlzIHNldCB0byB0cnVlLiBVc3VhbGx5IHRoaXMgaXMgZmluZSBhbmQgc2hvdWxkIGJlIHRoZVxyXG4gICAgICAvLyByZWNvbW1lbmRlZCBvcHRpb24uIElmIHNvdXJjZUJvdW5kcyBhcmUgcHJvdmlkZWQsIHRoZXkgd2lsbCByZXN0cmljdCB0aGUgdXNlZCBib3VuZHMgKHNvIGl0IHdpbGwganVzdFxyXG4gICAgICAvLyByZXByZXNlbnQgdGhlIGJvdW5kcyBvZiB0aGUgc2xpY2VkIHBhcnQgb2YgdGhlIGltYWdlKS5cclxuICAgICAgdXNlVGFyZ2V0Qm91bmRzOiB0cnVlLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gSWYgdHJ1ZSwgdGhlIGNyZWF0ZWQgSW1hZ2UgTm9kZSBnZXRzIHdyYXBwZWQgaW4gYW4gZXh0cmEgTm9kZSBzbyB0aGF0IGl0IGNhbiBiZSB0cmFuc2Zvcm1lZFxyXG4gICAgICAvLyBpbmRlcGVuZGVudGx5LiBJZiB0aGVyZSBpcyBubyBuZWVkIHRvIHRyYW5zZm9ybSB0aGUgcmVzdWx0aW5nIG5vZGUsIHdyYXA6ZmFsc2UgY2FuIGJlIHBhc3NlZCBzbyB0aGF0IG5vIGV4dHJhXHJcbiAgICAgIC8vIE5vZGUgaXMgY3JlYXRlZC5cclxuICAgICAgd3JhcDogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIElmIHRydWUsIGl0IHdpbGwgZGlyZWN0bHkgdXNlIHRoZSA8Y2FudmFzPiBlbGVtZW50IChvbmx5IHdvcmtzIHdpdGggY2FudmFzL3dlYmdsIHJlbmRlcmVycylcclxuICAgICAgLy8gaW5zdGVhZCBvZiBjb252ZXJ0aW5nIHRoaXMgaW50byBhIGZvcm0gdGhhdCBjYW4gYmUgdXNlZCB3aXRoIGFueSByZW5kZXJlci4gTWF5IGhhdmUgc2xpZ2h0bHkgYmV0dGVyXHJcbiAgICAgIC8vIHBlcmZvcm1hbmNlIGlmIHN2Zy9kb20gcmVuZGVyZXJzIGRvIG5vdCBuZWVkIHRvIGJlIHVzZWQuXHJcbiAgICAgIHVzZUNhbnZhczogZmFsc2UsXHJcblxyXG4gICAgICAvLyBUbyBiZSBwYXNzZWQgdG8gdGhlIEltYWdlIG5vZGUgY3JlYXRlZCBmcm9tIHRoZSByYXN0ZXJpemF0aW9uLiBTZWUgYmVsb3cgZm9yIG9wdGlvbnMgdGhhdCB3aWxsIG92ZXJyaWRlXHJcbiAgICAgIC8vIHdoYXQgaXMgcGFzc2VkIGluLlxyXG4gICAgICBpbWFnZU9wdGlvbnM6IHt9XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCByZXNvbHV0aW9uID0gb3B0aW9ucy5yZXNvbHV0aW9uO1xyXG4gICAgY29uc3Qgc291cmNlQm91bmRzID0gb3B0aW9ucy5zb3VyY2VCb3VuZHM7XHJcblxyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIGFzc2VydCggdHlwZW9mIHJlc29sdXRpb24gPT09ICdudW1iZXInICYmIHJlc29sdXRpb24gPiAwLCAncmVzb2x1dGlvbiBzaG91bGQgYmUgYSBwb3NpdGl2ZSBudW1iZXInICk7XHJcbiAgICAgIGFzc2VydCggc291cmNlQm91bmRzID09PSBudWxsIHx8IHNvdXJjZUJvdW5kcyBpbnN0YW5jZW9mIEJvdW5kczIsICdzb3VyY2VCb3VuZHMgc2hvdWxkIGJlIG51bGwgb3IgYSBCb3VuZHMyJyApO1xyXG4gICAgICBpZiAoIHNvdXJjZUJvdW5kcyApIHtcclxuICAgICAgICBhc3NlcnQoIHNvdXJjZUJvdW5kcy5pc1ZhbGlkKCksICdzb3VyY2VCb3VuZHMgc2hvdWxkIGJlIHZhbGlkIChmaW5pdGUgbm9uLW5lZ2F0aXZlKScgKTtcclxuICAgICAgICBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIHNvdXJjZUJvdW5kcy53aWR0aCApLCAnc291cmNlQm91bmRzLndpZHRoIHNob3VsZCBiZSBhbiBpbnRlZ2VyJyApO1xyXG4gICAgICAgIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggc291cmNlQm91bmRzLmhlaWdodCApLCAnc291cmNlQm91bmRzLmhlaWdodCBzaG91bGQgYmUgYW4gaW50ZWdlcicgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFdlJ2xsIG5lZWQgdG8gd3JhcCBpdCBpbiBhIGNvbnRhaW5lciBOb2RlIHRlbXBvcmFyaWx5ICh3aGlsZSByYXN0ZXJpemluZykgZm9yIHRoZSBzY2FsZVxyXG4gICAgY29uc3Qgd3JhcHBlck5vZGUgPSBuZXcgTm9kZSggeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWh0bWwtY29uc3RydWN0b3JzXHJcbiAgICAgIHNjYWxlOiByZXNvbHV0aW9uLFxyXG4gICAgICBjaGlsZHJlbjogWyB0aGlzIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBsZXQgdHJhbnNmb3JtZWRCb3VuZHMgPSBzb3VyY2VCb3VuZHMgfHwgdGhpcy5nZXRTYWZlVHJhbnNmb3JtZWRWaXNpYmxlQm91bmRzKCkuZGlsYXRlZCggMiApLnJvdW5kZWRPdXQoKTtcclxuXHJcbiAgICAvLyBVbmZvcnR1bmF0ZWx5IGlmIHdlIHByb3ZpZGUgYSByZXNvbHV0aW9uIEFORCBib3VuZHMsIHdlIGNhbid0IHVzZSB0aGUgc291cmNlIGJvdW5kcyBkaXJlY3RseS5cclxuICAgIGlmICggcmVzb2x1dGlvbiAhPT0gMSApIHtcclxuICAgICAgdHJhbnNmb3JtZWRCb3VuZHMgPSBuZXcgQm91bmRzMihcclxuICAgICAgICByZXNvbHV0aW9uICogdHJhbnNmb3JtZWRCb3VuZHMubWluWCxcclxuICAgICAgICByZXNvbHV0aW9uICogdHJhbnNmb3JtZWRCb3VuZHMubWluWSxcclxuICAgICAgICByZXNvbHV0aW9uICogdHJhbnNmb3JtZWRCb3VuZHMubWF4WCxcclxuICAgICAgICByZXNvbHV0aW9uICogdHJhbnNmb3JtZWRCb3VuZHMubWF4WVxyXG4gICAgICApO1xyXG4gICAgICAvLyBDb21wZW5zYXRlIGZvciBub24taW50ZWdyYWwgdHJhbnNmb3JtZWRCb3VuZHMgYWZ0ZXIgb3VyIHJlc29sdXRpb24gdHJhbnNmb3JtXHJcbiAgICAgIGlmICggdHJhbnNmb3JtZWRCb3VuZHMud2lkdGggJSAxICE9PSAwICkge1xyXG4gICAgICAgIHRyYW5zZm9ybWVkQm91bmRzLm1heFggKz0gMSAtICggdHJhbnNmb3JtZWRCb3VuZHMud2lkdGggJSAxICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCB0cmFuc2Zvcm1lZEJvdW5kcy5oZWlnaHQgJSAxICE9PSAwICkge1xyXG4gICAgICAgIHRyYW5zZm9ybWVkQm91bmRzLm1heFkgKz0gMSAtICggdHJhbnNmb3JtZWRCb3VuZHMuaGVpZ2h0ICUgMSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGltYWdlOiBJbWFnZSB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIC8vIE5PVEU6IFRoaXMgY2FsbGJhY2sgaXMgZXhlY3V0ZWQgU1lOQ0hST05PVVNMWVxyXG4gICAgZnVuY3Rpb24gY2FsbGJhY2soIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgICAgY29uc3QgaW1hZ2VTb3VyY2UgPSBvcHRpb25zLnVzZUNhbnZhcyA/IGNhbnZhcyA6IGNhbnZhcy50b0RhdGFVUkwoKTtcclxuXHJcbiAgICAgIGltYWdlID0gbmV3IEltYWdlKCBpbWFnZVNvdXJjZSwgY29tYmluZU9wdGlvbnM8SW1hZ2VPcHRpb25zPigge30sIG9wdGlvbnMuaW1hZ2VPcHRpb25zLCB7XHJcbiAgICAgICAgeDogLXgsXHJcbiAgICAgICAgeTogLXksXHJcbiAgICAgICAgaW5pdGlhbFdpZHRoOiB3aWR0aCxcclxuICAgICAgICBpbml0aWFsSGVpZ2h0OiBoZWlnaHRcclxuICAgICAgfSApICk7XHJcblxyXG4gICAgICAvLyBXZSBuZWVkIHRvIHByZXBlbmQgdGhlIHNjYWxlIGR1ZSB0byBvcmRlciBvZiBvcGVyYXRpb25zXHJcbiAgICAgIGltYWdlLnNjYWxlKCAxIC8gcmVzb2x1dGlvbiwgMSAvIHJlc29sdXRpb24sIHRydWUgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBOT1RFOiBSb3VuZGluZyBuZWNlc3NhcnkgZHVlIHRvIGZsb2F0aW5nIHBvaW50IGFyaXRobWV0aWMgaW4gdGhlIHdpZHRoL2hlaWdodCBjb21wdXRhdGlvbiBvZiB0aGUgYm91bmRzXHJcbiAgICB3cmFwcGVyTm9kZS50b0NhbnZhcyggY2FsbGJhY2ssIC10cmFuc2Zvcm1lZEJvdW5kcy5taW5YLCAtdHJhbnNmb3JtZWRCb3VuZHMubWluWSwgVXRpbHMucm91bmRTeW1tZXRyaWMoIHRyYW5zZm9ybWVkQm91bmRzLndpZHRoICksIFV0aWxzLnJvdW5kU3ltbWV0cmljKCB0cmFuc2Zvcm1lZEJvdW5kcy5oZWlnaHQgKSApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGltYWdlLCAnVGhlIHRvQ2FudmFzIHNob3VsZCBoYXZlIGV4ZWN1dGVkIHN5bmNocm9ub3VzbHknICk7XHJcblxyXG4gICAgd3JhcHBlck5vZGUuZGlzcG9zZSgpO1xyXG5cclxuICAgIC8vIEZvciBvdXIgdXNlVGFyZ2V0Qm91bmRzIG9wdGlvbiwgd2UgZG8gTk9UIHdhbnQgdG8gaW5jbHVkZSBhbnkgXCJzYWZlXCIgYm91bmRzLCBhbmQgaW5zdGVhZCB3YW50IHRvIHN0YXkgdHJ1ZSB0b1xyXG4gICAgLy8gdGhlIG9yaWdpbmFsIGJvdW5kcy4gV2UgZG8gZmlsdGVyIG91dCBpbnZpc2libGUgc3VidHJlZXMgdG8gc2V0IHRoZSBib3VuZHMuXHJcbiAgICBsZXQgZmluYWxQYXJlbnRCb3VuZHMgPSB0aGlzLmdldFZpc2libGVCb3VuZHMoKTtcclxuICAgIGlmICggc291cmNlQm91bmRzICkge1xyXG4gICAgICAvLyBJZiB3ZSBwcm92aWRlIHNvdXJjZUJvdW5kcywgZG9uJ3QgaGF2ZSByZXN1bHRpbmcgYm91bmRzIHRoYXQgZ28gb3V0c2lkZS5cclxuICAgICAgZmluYWxQYXJlbnRCb3VuZHMgPSBzb3VyY2VCb3VuZHMuaW50ZXJzZWN0aW9uKCBmaW5hbFBhcmVudEJvdW5kcyApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggb3B0aW9ucy51c2VUYXJnZXRCb3VuZHMgKSB7XHJcbiAgICAgIGltYWdlIS5pbWFnZUJvdW5kcyA9IGltYWdlIS5wYXJlbnRUb0xvY2FsQm91bmRzKCBmaW5hbFBhcmVudEJvdW5kcyApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggb3B0aW9ucy53cmFwICkge1xyXG4gICAgICBjb25zdCB3cmFwcGVkTm9kZSA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGltYWdlISBdIH0gKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1odG1sLWNvbnN0cnVjdG9yc1xyXG4gICAgICBpZiAoIG9wdGlvbnMudXNlVGFyZ2V0Qm91bmRzICkge1xyXG4gICAgICAgIHdyYXBwZWROb2RlLmxvY2FsQm91bmRzID0gZmluYWxQYXJlbnRCb3VuZHM7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHdyYXBwZWROb2RlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGlmICggb3B0aW9ucy51c2VUYXJnZXRCb3VuZHMgKSB7XHJcbiAgICAgICAgaW1hZ2UhLmxvY2FsQm91bmRzID0gaW1hZ2UhLnBhcmVudFRvTG9jYWxCb3VuZHMoIGZpbmFsUGFyZW50Qm91bmRzICk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGltYWdlITtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBET00gZHJhd2FibGUgZm9yIHRoaXMgTm9kZSdzIHNlbGYgcmVwcmVzZW50YXRpb24uIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogSW1wbGVtZW50ZWQgYnkgc3VidHlwZXMgdGhhdCBzdXBwb3J0IERPTSBzZWxmIGRyYXdhYmxlcy4gVGhlcmUgaXMgbm8gbmVlZCB0byBpbXBsZW1lbnQgdGhpcyBmb3Igc3VidHlwZXMgdGhhdFxyXG4gICAqIGRvIG5vdCBhbGxvdyB0aGUgRE9NIHJlbmRlcmVyIChub3Qgc2V0IGluIGl0cyByZW5kZXJlckJpdG1hc2spLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXHJcbiAgICogQHBhcmFtIGluc3RhbmNlIC0gSW5zdGFuY2Ugb2JqZWN0IHRoYXQgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGRyYXdhYmxlXHJcbiAgICovXHJcbiAgcHVibGljIGNyZWF0ZURPTURyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogRE9NU2VsZkRyYXdhYmxlIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ2NyZWF0ZURPTURyYXdhYmxlIGlzIGFic3RyYWN0LiBUaGUgc3VidHlwZSBzaG91bGQgZWl0aGVyIG92ZXJyaWRlIHRoaXMgbWV0aG9kLCBvciBub3Qgc3VwcG9ydCB0aGUgRE9NIHJlbmRlcmVyJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbiBTVkcgZHJhd2FibGUgZm9yIHRoaXMgTm9kZSdzIHNlbGYgcmVwcmVzZW50YXRpb24uIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogSW1wbGVtZW50ZWQgYnkgc3VidHlwZXMgdGhhdCBzdXBwb3J0IFNWRyBzZWxmIGRyYXdhYmxlcy4gVGhlcmUgaXMgbm8gbmVlZCB0byBpbXBsZW1lbnQgdGhpcyBmb3Igc3VidHlwZXMgdGhhdFxyXG4gICAqIGRvIG5vdCBhbGxvdyB0aGUgU1ZHIHJlbmRlcmVyIChub3Qgc2V0IGluIGl0cyByZW5kZXJlckJpdG1hc2spLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXHJcbiAgICogQHBhcmFtIGluc3RhbmNlIC0gSW5zdGFuY2Ugb2JqZWN0IHRoYXQgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGRyYXdhYmxlXHJcbiAgICovXHJcbiAgcHVibGljIGNyZWF0ZVNWR0RyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogU1ZHU2VsZkRyYXdhYmxlIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ2NyZWF0ZVNWR0RyYXdhYmxlIGlzIGFic3RyYWN0LiBUaGUgc3VidHlwZSBzaG91bGQgZWl0aGVyIG92ZXJyaWRlIHRoaXMgbWV0aG9kLCBvciBub3Qgc3VwcG9ydCB0aGUgRE9NIHJlbmRlcmVyJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIENhbnZhcyBkcmF3YWJsZSBmb3IgdGhpcyBOb2RlJ3Mgc2VsZiByZXByZXNlbnRhdGlvbi4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBJbXBsZW1lbnRlZCBieSBzdWJ0eXBlcyB0aGF0IHN1cHBvcnQgQ2FudmFzIHNlbGYgZHJhd2FibGVzLiBUaGVyZSBpcyBubyBuZWVkIHRvIGltcGxlbWVudCB0aGlzIGZvciBzdWJ0eXBlcyB0aGF0XHJcbiAgICogZG8gbm90IGFsbG93IHRoZSBDYW52YXMgcmVuZGVyZXIgKG5vdCBzZXQgaW4gaXRzIHJlbmRlcmVyQml0bWFzaykuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcmVuZGVyZXIgLSBJbiB0aGUgYml0bWFzayBmb3JtYXQgc3BlY2lmaWVkIGJ5IFJlbmRlcmVyLCB3aGljaCBtYXkgY29udGFpbiBhZGRpdGlvbmFsIGJpdCBmbGFncy5cclxuICAgKiBAcGFyYW0gaW5zdGFuY2UgLSBJbnN0YW5jZSBvYmplY3QgdGhhdCB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZHJhd2FibGVcclxuICAgKi9cclxuICBwdWJsaWMgY3JlYXRlQ2FudmFzRHJhd2FibGUoIHJlbmRlcmVyOiBudW1iZXIsIGluc3RhbmNlOiBJbnN0YW5jZSApOiBDYW52YXNTZWxmRHJhd2FibGUge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnY3JlYXRlQ2FudmFzRHJhd2FibGUgaXMgYWJzdHJhY3QuIFRoZSBzdWJ0eXBlIHNob3VsZCBlaXRoZXIgb3ZlcnJpZGUgdGhpcyBtZXRob2QsIG9yIG5vdCBzdXBwb3J0IHRoZSBET00gcmVuZGVyZXInICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgV2ViR0wgZHJhd2FibGUgZm9yIHRoaXMgTm9kZSdzIHNlbGYgcmVwcmVzZW50YXRpb24uIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogSW1wbGVtZW50ZWQgYnkgc3VidHlwZXMgdGhhdCBzdXBwb3J0IFdlYkdMIHNlbGYgZHJhd2FibGVzLiBUaGVyZSBpcyBubyBuZWVkIHRvIGltcGxlbWVudCB0aGlzIGZvciBzdWJ0eXBlcyB0aGF0XHJcbiAgICogZG8gbm90IGFsbG93IHRoZSBXZWJHTCByZW5kZXJlciAobm90IHNldCBpbiBpdHMgcmVuZGVyZXJCaXRtYXNrKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSByZW5kZXJlciAtIEluIHRoZSBiaXRtYXNrIGZvcm1hdCBzcGVjaWZpZWQgYnkgUmVuZGVyZXIsIHdoaWNoIG1heSBjb250YWluIGFkZGl0aW9uYWwgYml0IGZsYWdzLlxyXG4gICAqIEBwYXJhbSBpbnN0YW5jZSAtIEluc3RhbmNlIG9iamVjdCB0aGF0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBkcmF3YWJsZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjcmVhdGVXZWJHTERyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogV2ViR0xTZWxmRHJhd2FibGUge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnY3JlYXRlV2ViR0xEcmF3YWJsZSBpcyBhYnN0cmFjdC4gVGhlIHN1YnR5cGUgc2hvdWxkIGVpdGhlciBvdmVycmlkZSB0aGlzIG1ldGhvZCwgb3Igbm90IHN1cHBvcnQgdGhlIERPTSByZW5kZXJlcicgKTtcclxuICB9XHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIEluc3RhbmNlIGhhbmRsaW5nXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgaW5zdGFuY2VzIGFycmF5LiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0SW5zdGFuY2VzKCk6IEluc3RhbmNlW10ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2luc3RhbmNlcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRJbnN0YW5jZXMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvbiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGluc3RhbmNlcygpOiBJbnN0YW5jZVtdIHtcclxuICAgIHJldHVybiB0aGlzLmdldEluc3RhbmNlcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhbiBJbnN0YW5jZSByZWZlcmVuY2UgdG8gb3VyIGFycmF5LiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgYWRkSW5zdGFuY2UoIGluc3RhbmNlOiBJbnN0YW5jZSApOiB2b2lkIHtcclxuICAgIHRoaXMuX2luc3RhbmNlcy5wdXNoKCBpbnN0YW5jZSApO1xyXG5cclxuICAgIHRoaXMuY2hhbmdlZEluc3RhbmNlRW1pdHRlci5lbWl0KCBpbnN0YW5jZSwgdHJ1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhbiBJbnN0YW5jZSByZWZlcmVuY2UgZnJvbSBvdXIgYXJyYXkuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVJbnN0YW5jZSggaW5zdGFuY2U6IEluc3RhbmNlICk6IHZvaWQge1xyXG4gICAgY29uc3QgaW5kZXggPSBfLmluZGV4T2YoIHRoaXMuX2luc3RhbmNlcywgaW5zdGFuY2UgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4ICE9PSAtMSwgJ0Nhbm5vdCByZW1vdmUgYSBJbnN0YW5jZSBmcm9tIGEgTm9kZSBpZiBpdCB3YXMgbm90IHRoZXJlJyApO1xyXG4gICAgdGhpcy5faW5zdGFuY2VzLnNwbGljZSggaW5kZXgsIDEgKTtcclxuXHJcbiAgICB0aGlzLmNoYW5nZWRJbnN0YW5jZUVtaXR0ZXIuZW1pdCggaW5zdGFuY2UsIGZhbHNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBOb2RlIHdhcyB2aXN1YWxseSByZW5kZXJlZC9kaXNwbGF5ZWQgYnkgYW55IERpc3BsYXkgaW4gdGhlIGxhc3QgdXBkYXRlRGlzcGxheSgpIGNhbGwuIE5vdGVcclxuICAgKiB0aGF0IHNvbWV0aGluZyBjYW4gYmUgaW5kZXBlbmRlbnRseSBkaXNwbGF5ZWQgdmlzdWFsbHksIGFuZCBpbiB0aGUgUERPTTsgdGhpcyBtZXRob2Qgb25seSBjaGVja3MgdmlzdWFsbHkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gW2Rpc3BsYXldIC0gaWYgcHJvdmlkZWQsIG9ubHkgY2hlY2sgaWYgd2FzIHZpc2libGUgb24gdGhpcyBwYXJ0aWN1bGFyIERpc3BsYXlcclxuICAgKi9cclxuICBwdWJsaWMgd2FzVmlzdWFsbHlEaXNwbGF5ZWQoIGRpc3BsYXk/OiBEaXNwbGF5ICk6IGJvb2xlYW4ge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5faW5zdGFuY2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBpbnN0YW5jZSA9IHRoaXMuX2luc3RhbmNlc1sgaSBdO1xyXG5cclxuICAgICAgLy8gSWYgbm8gZGlzcGxheSBpcyBwcm92aWRlZCwgYW55IGluc3RhbmNlIHZpc2liaWxpdHkgaXMgZW5vdWdoIHRvIGJlIHZpc3VhbGx5IGRpc3BsYXllZFxyXG4gICAgICBpZiAoIGluc3RhbmNlLnZpc2libGUgJiYgKCAhZGlzcGxheSB8fCBpbnN0YW5jZS5kaXNwbGF5ID09PSBkaXNwbGF5ICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIERpc3BsYXkgaGFuZGxpbmdcclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBkaXNwbGF5IGFycmF5LiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Um9vdGVkRGlzcGxheXMoKTogRGlzcGxheVtdIHtcclxuICAgIHJldHVybiB0aGlzLl9yb290ZWREaXNwbGF5cztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRSb290ZWREaXNwbGF5cygpIGZvciBtb3JlIGluZm9ybWF0aW9uIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgcm9vdGVkRGlzcGxheXMoKTogRGlzcGxheVtdIHtcclxuICAgIHJldHVybiB0aGlzLmdldFJvb3RlZERpc3BsYXlzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGFuIGRpc3BsYXkgcmVmZXJlbmNlIHRvIG91ciBhcnJheS4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGFkZFJvb3RlZERpc3BsYXkoIGRpc3BsYXk6IERpc3BsYXkgKTogdm9pZCB7XHJcbiAgICB0aGlzLl9yb290ZWREaXNwbGF5cy5wdXNoKCBkaXNwbGF5ICk7XHJcblxyXG4gICAgLy8gRGVmaW5lZCBpbiBQYXJhbGxlbERPTS5qc1xyXG4gICAgdGhpcy5fcGRvbURpc3BsYXlzSW5mby5vbkFkZGVkUm9vdGVkRGlzcGxheSggZGlzcGxheSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhIERpc3BsYXkgcmVmZXJlbmNlIGZyb20gb3VyIGFycmF5LiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlUm9vdGVkRGlzcGxheSggZGlzcGxheTogRGlzcGxheSApOiB2b2lkIHtcclxuICAgIGNvbnN0IGluZGV4ID0gXy5pbmRleE9mKCB0aGlzLl9yb290ZWREaXNwbGF5cywgZGlzcGxheSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggIT09IC0xLCAnQ2Fubm90IHJlbW92ZSBhIERpc3BsYXkgZnJvbSBhIE5vZGUgaWYgaXQgd2FzIG5vdCB0aGVyZScgKTtcclxuICAgIHRoaXMuX3Jvb3RlZERpc3BsYXlzLnNwbGljZSggaW5kZXgsIDEgKTtcclxuXHJcbiAgICAvLyBEZWZpbmVkIGluIFBhcmFsbGVsRE9NLmpzXHJcbiAgICB0aGlzLl9wZG9tRGlzcGxheXNJbmZvLm9uUmVtb3ZlZFJvb3RlZERpc3BsYXkoIGRpc3BsYXkgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0UmVjdXJzaXZlQ29ubmVjdGVkRGlzcGxheXMoIGRpc3BsYXlzOiBEaXNwbGF5W10gKTogRGlzcGxheVtdIHtcclxuICAgIGlmICggdGhpcy5yb290ZWREaXNwbGF5cy5sZW5ndGggKSB7XHJcbiAgICAgIGRpc3BsYXlzLnB1c2goIC4uLnRoaXMucm9vdGVkRGlzcGxheXMgKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9wYXJlbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBkaXNwbGF5cy5wdXNoKCAuLi50aGlzLl9wYXJlbnRzWyBpIF0uZ2V0UmVjdXJzaXZlQ29ubmVjdGVkRGlzcGxheXMoIGRpc3BsYXlzICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkbyBub3QgYWxsb3cgZHVwbGljYXRlIERpc3BsYXlzIHRvIGdldCBjb2xsZWN0ZWQgaW5maW5pdGVseVxyXG4gICAgcmV0dXJuIF8udW5pcSggZGlzcGxheXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGxpc3Qgb2YgdGhlIGRpc3BsYXlzIHRoYXQgYXJlIGNvbm5lY3RlZCB0byB0aGlzIE5vZGUuIEdhdGhlcmVkIGJ5IGxvb2tpbmcgdXAgdGhlIHNjZW5lIGdyYXBoIGFuY2VzdG9ycyBhbmRcclxuICAgKiBjb2xsZWN0ZWQgYWxsIHJvb3RlZCBEaXNwbGF5cyBhbG9uZyB0aGUgd2F5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDb25uZWN0ZWREaXNwbGF5cygpOiBEaXNwbGF5W10ge1xyXG4gICAgcmV0dXJuIF8udW5pcSggdGhpcy5nZXRSZWN1cnNpdmVDb25uZWN0ZWREaXNwbGF5cyggW10gKSApO1xyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogQ29vcmRpbmF0ZSB0cmFuc2Zvcm0gbWV0aG9kc1xyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBwb2ludCB0cmFuc2Zvcm1lZCBmcm9tIG91ciBsb2NhbCBjb29yZGluYXRlIGZyYW1lIGludG8gb3VyIHBhcmVudCBjb29yZGluYXRlIGZyYW1lLiBBcHBsaWVzIG91ciBub2RlJ3NcclxuICAgKiB0cmFuc2Zvcm0gdG8gaXQuXHJcbiAgICovXHJcbiAgcHVibGljIGxvY2FsVG9QYXJlbnRQb2ludCggcG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtLnRyYW5zZm9ybVBvc2l0aW9uMiggcG9pbnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYm91bmRzIHRyYW5zZm9ybWVkIGZyb20gb3VyIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUgaW50byBvdXIgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUuIElmIGl0IGluY2x1ZGVzIGFcclxuICAgKiByb3RhdGlvbiwgdGhlIHJlc3VsdGluZyBib3VuZGluZyBib3ggd2lsbCBpbmNsdWRlIGV2ZXJ5IHBvaW50IHRoYXQgY291bGQgaGF2ZSBiZWVuIGluIHRoZSBvcmlnaW5hbCBib3VuZGluZyBib3hcclxuICAgKiAoYW5kIGl0IGNhbiBiZSBleHBhbmRlZCkuXHJcbiAgICovXHJcbiAgcHVibGljIGxvY2FsVG9QYXJlbnRCb3VuZHMoIGJvdW5kczogQm91bmRzMiApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm0udHJhbnNmb3JtQm91bmRzMiggYm91bmRzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgcG9pbnQgdHJhbnNmb3JtZWQgZnJvbSBvdXIgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgaW50byBvdXIgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZS4gQXBwbGllcyB0aGUgaW52ZXJzZVxyXG4gICAqIG9mIG91ciBub2RlJ3MgdHJhbnNmb3JtIHRvIGl0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBwYXJlbnRUb0xvY2FsUG9pbnQoIHBvaW50OiBWZWN0b3IyICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybS5pbnZlcnNlUG9zaXRpb24yKCBwb2ludCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBib3VuZHMgdHJhbnNmb3JtZWQgZnJvbSBvdXIgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgaW50byBvdXIgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZS4gSWYgaXQgaW5jbHVkZXMgYVxyXG4gICAqIHJvdGF0aW9uLCB0aGUgcmVzdWx0aW5nIGJvdW5kaW5nIGJveCB3aWxsIGluY2x1ZGUgZXZlcnkgcG9pbnQgdGhhdCBjb3VsZCBoYXZlIGJlZW4gaW4gdGhlIG9yaWdpbmFsIGJvdW5kaW5nIGJveFxyXG4gICAqIChhbmQgaXQgY2FuIGJlIGV4cGFuZGVkKS5cclxuICAgKi9cclxuICBwdWJsaWMgcGFyZW50VG9Mb2NhbEJvdW5kcyggYm91bmRzOiBCb3VuZHMyICk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybS5pbnZlcnNlQm91bmRzMiggYm91bmRzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBIG11dGFibGUtb3B0aW1pemVkIGZvcm0gb2YgbG9jYWxUb1BhcmVudEJvdW5kcygpIHRoYXQgd2lsbCBtb2RpZnkgdGhlIHByb3ZpZGVkIGJvdW5kcywgdHJhbnNmb3JtaW5nIGl0IGZyb20gb3VyXHJcbiAgICogbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSB0byBvdXIgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAgICogQHJldHVybnMgLSBUaGUgc2FtZSBib3VuZHMgb2JqZWN0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyB0cmFuc2Zvcm1Cb3VuZHNGcm9tTG9jYWxUb1BhcmVudCggYm91bmRzOiBCb3VuZHMyICk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIGJvdW5kcy50cmFuc2Zvcm0oIHRoaXMuX3RyYW5zZm9ybS5nZXRNYXRyaXgoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBtdXRhYmxlLW9wdGltaXplZCBmb3JtIG9mIHBhcmVudFRvTG9jYWxCb3VuZHMoKSB0aGF0IHdpbGwgbW9kaWZ5IHRoZSBwcm92aWRlZCBib3VuZHMsIHRyYW5zZm9ybWluZyBpdCBmcm9tIG91clxyXG4gICAqIHBhcmVudCBjb29yZGluYXRlIGZyYW1lIHRvIG91ciBsb2NhbCBjb29yZGluYXRlIGZyYW1lLlxyXG4gICAqIEByZXR1cm5zIC0gVGhlIHNhbWUgYm91bmRzIG9iamVjdC5cclxuICAgKi9cclxuICBwdWJsaWMgdHJhbnNmb3JtQm91bmRzRnJvbVBhcmVudFRvTG9jYWwoIGJvdW5kczogQm91bmRzMiApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiBib3VuZHMudHJhbnNmb3JtKCB0aGlzLl90cmFuc2Zvcm0uZ2V0SW52ZXJzZSgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IG1hdHJpeCAoZnJlc2ggY29weSkgdGhhdCB3b3VsZCB0cmFuc2Zvcm0gcG9pbnRzIGZyb20gb3VyIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUgdG8gdGhlIGdsb2JhbFxyXG4gICAqIGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAgICpcclxuICAgKiBOT1RFOiBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIHRoaXMgTm9kZSAoZS5nLiB0aGlzIG9yIG9uZSBhbmNlc3RvciBoYXMgdHdvIHBhcmVudHMpLCBpdCB3aWxsIGZhaWxcclxuICAgKiB3aXRoIGFuIGFzc2VydGlvbiAoc2luY2UgdGhlIHRyYW5zZm9ybSB3b3VsZG4ndCBiZSB1bmlxdWVseSBkZWZpbmVkKS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TG9jYWxUb0dsb2JhbE1hdHJpeCgpOiBNYXRyaXgzIHtcclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xyXG4gICAgbGV0IG5vZGU6IE5vZGUgPSB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbnNpc3RlbnQtdGhpc1xyXG5cclxuICAgIC8vIHdlIG5lZWQgdG8gYXBwbHkgdGhlIHRyYW5zZm9ybWF0aW9ucyBpbiB0aGUgcmV2ZXJzZSBvcmRlciwgc28gd2UgdGVtcG9yYXJpbHkgc3RvcmUgdGhlbVxyXG4gICAgY29uc3QgbWF0cmljZXMgPSBbXTtcclxuXHJcbiAgICAvLyBjb25jYXRlbmF0aW9uIGxpa2UgdGhpcyBoYXMgYmVlbiBmYXN0ZXIgdGhhbiBnZXR0aW5nIGEgdW5pcXVlIHRyYWlsLCBnZXR0aW5nIGl0cyB0cmFuc2Zvcm0sIGFuZCBhcHBseWluZyBpdFxyXG4gICAgd2hpbGUgKCBub2RlICkge1xyXG4gICAgICBtYXRyaWNlcy5wdXNoKCBub2RlLl90cmFuc2Zvcm0uZ2V0TWF0cml4KCkgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbm9kZS5fcGFyZW50c1sgMSBdID09PSB1bmRlZmluZWQsICdnZXRMb2NhbFRvR2xvYmFsTWF0cml4IHVuYWJsZSB0byB3b3JrIGZvciBEQUcnICk7XHJcbiAgICAgIG5vZGUgPSBub2RlLl9wYXJlbnRzWyAwIF07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbWF0cml4ID0gTWF0cml4My5pZGVudGl0eSgpOyAvLyB3aWxsIGJlIG1vZGlmaWVkIGluIHBsYWNlXHJcblxyXG4gICAgLy8gaXRlcmF0ZSBmcm9tIHRoZSBiYWNrIGZvcndhcmRzIChmcm9tIHRoZSByb290IE5vZGUgdG8gaGVyZSlcclxuICAgIGZvciAoIGxldCBpID0gbWF0cmljZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgIG1hdHJpeC5tdWx0aXBseU1hdHJpeCggbWF0cmljZXNbIGkgXSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE5PVEU6IGFsd2F5cyByZXR1cm4gYSBmcmVzaCBjb3B5LCBnZXRHbG9iYWxUb0xvY2FsTWF0cml4IGRlcGVuZHMgb24gaXQgdG8gbWluaW1pemUgaW5zdGFuY2UgdXNhZ2UhXHJcbiAgICByZXR1cm4gbWF0cml4O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIFRyYW5zZm9ybTMgdGhhdCB3b3VsZCB0cmFuc2Zvcm0gdGhpbmdzIGZyb20gb3VyIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUgdG8gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lLlxyXG4gICAqIEVxdWl2YWxlbnQgdG8gZ2V0VW5pcXVlVHJhaWwoKS5nZXRUcmFuc2Zvcm0oKSwgYnV0IGZhc3Rlci5cclxuICAgKlxyXG4gICAqIE5PVEU6IElmIHRoZXJlIGFyZSBtdWx0aXBsZSBpbnN0YW5jZXMgb2YgdGhpcyBOb2RlIChlLmcuIHRoaXMgb3Igb25lIGFuY2VzdG9yIGhhcyB0d28gcGFyZW50cyksIGl0IHdpbGwgZmFpbFxyXG4gICAqIHdpdGggYW4gYXNzZXJ0aW9uIChzaW5jZSB0aGUgdHJhbnNmb3JtIHdvdWxkbid0IGJlIHVuaXF1ZWx5IGRlZmluZWQpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRVbmlxdWVUcmFuc2Zvcm0oKTogVHJhbnNmb3JtMyB7XHJcbiAgICByZXR1cm4gbmV3IFRyYW5zZm9ybTMoIHRoaXMuZ2V0TG9jYWxUb0dsb2JhbE1hdHJpeCgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IG1hdHJpeCAoZnJlc2ggY29weSkgdGhhdCB3b3VsZCB0cmFuc2Zvcm0gcG9pbnRzIGZyb20gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lIHRvIG91ciBsb2NhbFxyXG4gICAqIGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAgICpcclxuICAgKiBOT1RFOiBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIHRoaXMgTm9kZSAoZS5nLiB0aGlzIG9yIG9uZSBhbmNlc3RvciBoYXMgdHdvIHBhcmVudHMpLCBpdCB3aWxsIGZhaWxcclxuICAgKiB3aXRoIGFuIGFzc2VydGlvbiAoc2luY2UgdGhlIHRyYW5zZm9ybSB3b3VsZG4ndCBiZSB1bmlxdWVseSBkZWZpbmVkKS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0R2xvYmFsVG9Mb2NhbE1hdHJpeCgpOiBNYXRyaXgzIHtcclxuICAgIHJldHVybiB0aGlzLmdldExvY2FsVG9HbG9iYWxNYXRyaXgoKS5pbnZlcnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyYW5zZm9ybXMgYSBwb2ludCBmcm9tIG91ciBsb2NhbCBjb29yZGluYXRlIGZyYW1lIHRvIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZS5cclxuICAgKlxyXG4gICAqIE5PVEU6IElmIHRoZXJlIGFyZSBtdWx0aXBsZSBpbnN0YW5jZXMgb2YgdGhpcyBOb2RlIChlLmcuIHRoaXMgb3Igb25lIGFuY2VzdG9yIGhhcyB0d28gcGFyZW50cyksIGl0IHdpbGwgZmFpbFxyXG4gICAqIHdpdGggYW4gYXNzZXJ0aW9uIChzaW5jZSB0aGUgdHJhbnNmb3JtIHdvdWxkbid0IGJlIHVuaXF1ZWx5IGRlZmluZWQpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBsb2NhbFRvR2xvYmFsUG9pbnQoIHBvaW50OiBWZWN0b3IyICk6IFZlY3RvcjIge1xyXG5cclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xyXG4gICAgbGV0IG5vZGU6IE5vZGUgPSB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbnNpc3RlbnQtdGhpc1xyXG4gICAgY29uc3QgcmVzdWx0UG9pbnQgPSBwb2ludC5jb3B5KCk7XHJcbiAgICB3aGlsZSAoIG5vZGUgKSB7XHJcbiAgICAgIC8vIGluLXBsYWNlIG11bHRpcGxpY2F0aW9uXHJcbiAgICAgIG5vZGUuX3RyYW5zZm9ybS5nZXRNYXRyaXgoKS5tdWx0aXBseVZlY3RvcjIoIHJlc3VsdFBvaW50ICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUuX3BhcmVudHNbIDEgXSA9PT0gdW5kZWZpbmVkLCAnbG9jYWxUb0dsb2JhbFBvaW50IHVuYWJsZSB0byB3b3JrIGZvciBEQUcnICk7XHJcbiAgICAgIG5vZGUgPSBub2RlLl9wYXJlbnRzWyAwIF07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0UG9pbnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2Zvcm1zIGEgcG9pbnQgZnJvbSB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUgdG8gb3VyIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAgICpcclxuICAgKiBOT1RFOiBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIHRoaXMgTm9kZSAoZS5nLiB0aGlzIG9yIG9uZSBhbmNlc3RvciBoYXMgdHdvIHBhcmVudHMpLCBpdCB3aWxsIGZhaWxcclxuICAgKiB3aXRoIGFuIGFzc2VydGlvbiAoc2luY2UgdGhlIHRyYW5zZm9ybSB3b3VsZG4ndCBiZSB1bmlxdWVseSBkZWZpbmVkKS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2xvYmFsVG9Mb2NhbFBvaW50KCBwb2ludDogVmVjdG9yMiApOiBWZWN0b3IyIHtcclxuXHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcclxuICAgIGxldCBub2RlOiBOb2RlID0gdGhpczsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjb25zaXN0ZW50LXRoaXNcclxuICAgIC8vIFRPRE86IHBlcmZvcm1hbmNlOiB0ZXN0IHdoZXRoZXIgaXQgaXMgZmFzdGVyIHRvIGdldCBhIHRvdGFsIHRyYW5zZm9ybSBhbmQgdGhlbiBpbnZlcnQgKHdvbid0IGNvbXB1dGUgaW5kaXZpZHVhbCBpbnZlcnNlcylcclxuXHJcbiAgICAvLyB3ZSBuZWVkIHRvIGFwcGx5IHRoZSB0cmFuc2Zvcm1hdGlvbnMgaW4gdGhlIHJldmVyc2Ugb3JkZXIsIHNvIHdlIHRlbXBvcmFyaWx5IHN0b3JlIHRoZW1cclxuICAgIGNvbnN0IHRyYW5zZm9ybXMgPSBbXTtcclxuICAgIHdoaWxlICggbm9kZSApIHtcclxuICAgICAgdHJhbnNmb3Jtcy5wdXNoKCBub2RlLl90cmFuc2Zvcm0gKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbm9kZS5fcGFyZW50c1sgMSBdID09PSB1bmRlZmluZWQsICdnbG9iYWxUb0xvY2FsUG9pbnQgdW5hYmxlIHRvIHdvcmsgZm9yIERBRycgKTtcclxuICAgICAgbm9kZSA9IG5vZGUuX3BhcmVudHNbIDAgXTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpdGVyYXRlIGZyb20gdGhlIGJhY2sgZm9yd2FyZHMgKGZyb20gdGhlIHJvb3QgTm9kZSB0byBoZXJlKVxyXG4gICAgY29uc3QgcmVzdWx0UG9pbnQgPSBwb2ludC5jb3B5KCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IHRyYW5zZm9ybXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgIC8vIGluLXBsYWNlIG11bHRpcGxpY2F0aW9uXHJcbiAgICAgIHRyYW5zZm9ybXNbIGkgXS5nZXRJbnZlcnNlKCkubXVsdGlwbHlWZWN0b3IyKCByZXN1bHRQb2ludCApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdFBvaW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJhbnNmb3JtcyBib3VuZHMgZnJvbSBvdXIgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSB0byB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUuIElmIGl0IGluY2x1ZGVzIGFcclxuICAgKiByb3RhdGlvbiwgdGhlIHJlc3VsdGluZyBib3VuZGluZyBib3ggd2lsbCBpbmNsdWRlIGV2ZXJ5IHBvaW50IHRoYXQgY291bGQgaGF2ZSBiZWVuIGluIHRoZSBvcmlnaW5hbCBib3VuZGluZyBib3hcclxuICAgKiAoYW5kIGl0IGNhbiBiZSBleHBhbmRlZCkuXHJcbiAgICpcclxuICAgKiBOT1RFOiBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIHRoaXMgTm9kZSAoZS5nLiB0aGlzIG9yIG9uZSBhbmNlc3RvciBoYXMgdHdvIHBhcmVudHMpLCBpdCB3aWxsIGZhaWxcclxuICAgKiB3aXRoIGFuIGFzc2VydGlvbiAoc2luY2UgdGhlIHRyYW5zZm9ybSB3b3VsZG4ndCBiZSB1bmlxdWVseSBkZWZpbmVkKS5cclxuICAgKi9cclxuICBwdWJsaWMgbG9jYWxUb0dsb2JhbEJvdW5kcyggYm91bmRzOiBCb3VuZHMyICk6IEJvdW5kczIge1xyXG4gICAgLy8gYXBwbHkgdGhlIGJvdW5kcyB0cmFuc2Zvcm0gb25seSBvbmNlLCBzbyB3ZSBjYW4gbWluaW1pemUgdGhlIGV4cGFuc2lvbiBlbmNvdW50ZXJlZCBmcm9tIG11bHRpcGxlIHJvdGF0aW9uc1xyXG4gICAgLy8gaXQgYWxzbyBzZWVtcyB0byBiZSBhIGJpdCBmYXN0ZXIgdGhpcyB3YXlcclxuICAgIHJldHVybiBib3VuZHMudHJhbnNmb3JtZWQoIHRoaXMuZ2V0TG9jYWxUb0dsb2JhbE1hdHJpeCgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2Zvcm1zIGJvdW5kcyBmcm9tIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZSB0byBvdXIgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZS4gSWYgaXQgaW5jbHVkZXMgYVxyXG4gICAqIHJvdGF0aW9uLCB0aGUgcmVzdWx0aW5nIGJvdW5kaW5nIGJveCB3aWxsIGluY2x1ZGUgZXZlcnkgcG9pbnQgdGhhdCBjb3VsZCBoYXZlIGJlZW4gaW4gdGhlIG9yaWdpbmFsIGJvdW5kaW5nIGJveFxyXG4gICAqIChhbmQgaXQgY2FuIGJlIGV4cGFuZGVkKS5cclxuICAgKlxyXG4gICAqIE5PVEU6IElmIHRoZXJlIGFyZSBtdWx0aXBsZSBpbnN0YW5jZXMgb2YgdGhpcyBOb2RlIChlLmcuIHRoaXMgb3Igb25lIGFuY2VzdG9yIGhhcyB0d28gcGFyZW50cyksIGl0IHdpbGwgZmFpbFxyXG4gICAqIHdpdGggYW4gYXNzZXJ0aW9uIChzaW5jZSB0aGUgdHJhbnNmb3JtIHdvdWxkbid0IGJlIHVuaXF1ZWx5IGRlZmluZWQpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnbG9iYWxUb0xvY2FsQm91bmRzKCBib3VuZHM6IEJvdW5kczIgKTogQm91bmRzMiB7XHJcbiAgICAvLyBhcHBseSB0aGUgYm91bmRzIHRyYW5zZm9ybSBvbmx5IG9uY2UsIHNvIHdlIGNhbiBtaW5pbWl6ZSB0aGUgZXhwYW5zaW9uIGVuY291bnRlcmVkIGZyb20gbXVsdGlwbGUgcm90YXRpb25zXHJcbiAgICByZXR1cm4gYm91bmRzLnRyYW5zZm9ybWVkKCB0aGlzLmdldEdsb2JhbFRvTG9jYWxNYXRyaXgoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJhbnNmb3JtcyBhIHBvaW50IGZyb20gb3VyIHBhcmVudCBjb29yZGluYXRlIGZyYW1lIHRvIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZS5cclxuICAgKlxyXG4gICAqIE5PVEU6IElmIHRoZXJlIGFyZSBtdWx0aXBsZSBpbnN0YW5jZXMgb2YgdGhpcyBOb2RlIChlLmcuIHRoaXMgb3Igb25lIGFuY2VzdG9yIGhhcyB0d28gcGFyZW50cyksIGl0IHdpbGwgZmFpbFxyXG4gICAqIHdpdGggYW4gYXNzZXJ0aW9uIChzaW5jZSB0aGUgdHJhbnNmb3JtIHdvdWxkbid0IGJlIHVuaXF1ZWx5IGRlZmluZWQpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBwYXJlbnRUb0dsb2JhbFBvaW50KCBwb2ludDogVmVjdG9yMiApOiBWZWN0b3IyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucGFyZW50cy5sZW5ndGggPD0gMSwgJ3BhcmVudFRvR2xvYmFsUG9pbnQgdW5hYmxlIHRvIHdvcmsgZm9yIERBRycgKTtcclxuICAgIHJldHVybiB0aGlzLnBhcmVudHMubGVuZ3RoID8gdGhpcy5wYXJlbnRzWyAwIF0ubG9jYWxUb0dsb2JhbFBvaW50KCBwb2ludCApIDogcG9pbnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2Zvcm1zIGJvdW5kcyBmcm9tIG91ciBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSB0byB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUuIElmIGl0IGluY2x1ZGVzIGFcclxuICAgKiByb3RhdGlvbiwgdGhlIHJlc3VsdGluZyBib3VuZGluZyBib3ggd2lsbCBpbmNsdWRlIGV2ZXJ5IHBvaW50IHRoYXQgY291bGQgaGF2ZSBiZWVuIGluIHRoZSBvcmlnaW5hbCBib3VuZGluZyBib3hcclxuICAgKiAoYW5kIGl0IGNhbiBiZSBleHBhbmRlZCkuXHJcbiAgICpcclxuICAgKiBOT1RFOiBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIHRoaXMgTm9kZSAoZS5nLiB0aGlzIG9yIG9uZSBhbmNlc3RvciBoYXMgdHdvIHBhcmVudHMpLCBpdCB3aWxsIGZhaWxcclxuICAgKiB3aXRoIGFuIGFzc2VydGlvbiAoc2luY2UgdGhlIHRyYW5zZm9ybSB3b3VsZG4ndCBiZSB1bmlxdWVseSBkZWZpbmVkKS5cclxuICAgKi9cclxuICBwdWJsaWMgcGFyZW50VG9HbG9iYWxCb3VuZHMoIGJvdW5kczogQm91bmRzMiApOiBCb3VuZHMyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucGFyZW50cy5sZW5ndGggPD0gMSwgJ3BhcmVudFRvR2xvYmFsQm91bmRzIHVuYWJsZSB0byB3b3JrIGZvciBEQUcnICk7XHJcbiAgICByZXR1cm4gdGhpcy5wYXJlbnRzLmxlbmd0aCA/IHRoaXMucGFyZW50c1sgMCBdLmxvY2FsVG9HbG9iYWxCb3VuZHMoIGJvdW5kcyApIDogYm91bmRzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJhbnNmb3JtcyBhIHBvaW50IGZyb20gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lIHRvIG91ciBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZS5cclxuICAgKlxyXG4gICAqIE5PVEU6IElmIHRoZXJlIGFyZSBtdWx0aXBsZSBpbnN0YW5jZXMgb2YgdGhpcyBOb2RlIChlLmcuIHRoaXMgb3Igb25lIGFuY2VzdG9yIGhhcyB0d28gcGFyZW50cyksIGl0IHdpbGwgZmFpbFxyXG4gICAqIHdpdGggYW4gYXNzZXJ0aW9uIChzaW5jZSB0aGUgdHJhbnNmb3JtIHdvdWxkbid0IGJlIHVuaXF1ZWx5IGRlZmluZWQpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnbG9iYWxUb1BhcmVudFBvaW50KCBwb2ludDogVmVjdG9yMiApOiBWZWN0b3IyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucGFyZW50cy5sZW5ndGggPD0gMSwgJ2dsb2JhbFRvUGFyZW50UG9pbnQgdW5hYmxlIHRvIHdvcmsgZm9yIERBRycgKTtcclxuICAgIHJldHVybiB0aGlzLnBhcmVudHMubGVuZ3RoID8gdGhpcy5wYXJlbnRzWyAwIF0uZ2xvYmFsVG9Mb2NhbFBvaW50KCBwb2ludCApIDogcG9pbnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2Zvcm1zIGJvdW5kcyBmcm9tIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZSB0byBvdXIgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUuIElmIGl0IGluY2x1ZGVzIGFcclxuICAgKiByb3RhdGlvbiwgdGhlIHJlc3VsdGluZyBib3VuZGluZyBib3ggd2lsbCBpbmNsdWRlIGV2ZXJ5IHBvaW50IHRoYXQgY291bGQgaGF2ZSBiZWVuIGluIHRoZSBvcmlnaW5hbCBib3VuZGluZyBib3hcclxuICAgKiAoYW5kIGl0IGNhbiBiZSBleHBhbmRlZCkuXHJcbiAgICpcclxuICAgKiBOT1RFOiBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIHRoaXMgTm9kZSAoZS5nLiB0aGlzIG9yIG9uZSBhbmNlc3RvciBoYXMgdHdvIHBhcmVudHMpLCBpdCB3aWxsIGZhaWxcclxuICAgKiB3aXRoIGFuIGFzc2VydGlvbiAoc2luY2UgdGhlIHRyYW5zZm9ybSB3b3VsZG4ndCBiZSB1bmlxdWVseSBkZWZpbmVkKS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2xvYmFsVG9QYXJlbnRCb3VuZHMoIGJvdW5kczogQm91bmRzMiApOiBCb3VuZHMyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucGFyZW50cy5sZW5ndGggPD0gMSwgJ2dsb2JhbFRvUGFyZW50Qm91bmRzIHVuYWJsZSB0byB3b3JrIGZvciBEQUcnICk7XHJcbiAgICByZXR1cm4gdGhpcy5wYXJlbnRzLmxlbmd0aCA/IHRoaXMucGFyZW50c1sgMCBdLmdsb2JhbFRvTG9jYWxCb3VuZHMoIGJvdW5kcyApIDogYm91bmRzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGJvdW5kaW5nIGJveCBmb3IgdGhpcyBOb2RlIChhbmQgaXRzIHN1Yi10cmVlKSBpbiB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAgICpcclxuICAgKiBOT1RFOiBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIHRoaXMgTm9kZSAoZS5nLiB0aGlzIG9yIG9uZSBhbmNlc3RvciBoYXMgdHdvIHBhcmVudHMpLCBpdCB3aWxsIGZhaWxcclxuICAgKiB3aXRoIGFuIGFzc2VydGlvbiAoc2luY2UgdGhlIHRyYW5zZm9ybSB3b3VsZG4ndCBiZSB1bmlxdWVseSBkZWZpbmVkKS5cclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgcmVxdWlyZXMgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEdsb2JhbEJvdW5kcygpOiBCb3VuZHMyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucGFyZW50cy5sZW5ndGggPD0gMSwgJ2dsb2JhbEJvdW5kcyB1bmFibGUgdG8gd29yayBmb3IgREFHJyApO1xyXG4gICAgcmV0dXJuIHRoaXMucGFyZW50VG9HbG9iYWxCb3VuZHMoIHRoaXMuZ2V0Qm91bmRzKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBnZXRHbG9iYWxCb3VuZHMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgZ2xvYmFsQm91bmRzKCk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0R2xvYmFsQm91bmRzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBib3VuZHMgb2YgYW55IG90aGVyIE5vZGUgaW4gb3VyIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAgICpcclxuICAgKiBOT1RFOiBJZiB0aGlzIG5vZGUgb3IgdGhlIHBhc3NlZCBpbiBOb2RlIGhhdmUgbXVsdGlwbGUgaW5zdGFuY2VzIChlLmcuIHRoaXMgb3Igb25lIGFuY2VzdG9yIGhhcyB0d28gcGFyZW50cyksIGl0IHdpbGwgZmFpbFxyXG4gICAqIHdpdGggYW4gYXNzZXJ0aW9uLlxyXG4gICAqXHJcbiAgICogVE9ETzogUG9zc2libGUgdG8gYmUgd2VsbC1kZWZpbmVkIGFuZCBoYXZlIG11bHRpcGxlIGluc3RhbmNlcyBvZiBlYWNoLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBib3VuZHNPZiggbm9kZTogTm9kZSApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLmdsb2JhbFRvTG9jYWxCb3VuZHMoIG5vZGUuZ2V0R2xvYmFsQm91bmRzKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGJvdW5kcyBvZiB0aGlzIE5vZGUgaW4gYW5vdGhlciBub2RlJ3MgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZS5cclxuICAgKlxyXG4gICAqIE5PVEU6IElmIHRoaXMgbm9kZSBvciB0aGUgcGFzc2VkIGluIE5vZGUgaGF2ZSBtdWx0aXBsZSBpbnN0YW5jZXMgKGUuZy4gdGhpcyBvciBvbmUgYW5jZXN0b3IgaGFzIHR3byBwYXJlbnRzKSwgaXQgd2lsbCBmYWlsXHJcbiAgICogd2l0aCBhbiBhc3NlcnRpb24uXHJcbiAgICpcclxuICAgKiBUT0RPOiBQb3NzaWJsZSB0byBiZSB3ZWxsLWRlZmluZWQgYW5kIGhhdmUgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIGVhY2guXHJcbiAgICovXHJcbiAgcHVibGljIGJvdW5kc1RvKCBub2RlOiBOb2RlICk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIG5vZGUuZ2xvYmFsVG9Mb2NhbEJvdW5kcyggdGhpcy5nZXRHbG9iYWxCb3VuZHMoKSApO1xyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogRHJhd2FibGUgaGFuZGxpbmdcclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBBZGRzIHRoZSBkcmF3YWJsZSB0byBvdXIgbGlzdCBvZiBkcmF3YWJsZXMgdG8gbm90aWZ5IG9mIHZpc3VhbCBjaGFuZ2VzLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgYXR0YWNoRHJhd2FibGUoIGRyYXdhYmxlOiBEcmF3YWJsZSApOiB0aGlzIHtcclxuICAgIHRoaXMuX2RyYXdhYmxlcy5wdXNoKCBkcmF3YWJsZSApO1xyXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIHRoZSBkcmF3YWJsZSBmcm9tIG91ciBsaXN0IG9mIGRyYXdhYmxlcyB0byBub3RpZnkgb2YgdmlzdWFsIGNoYW5nZXMuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBkZXRhY2hEcmF3YWJsZSggZHJhd2FibGU6IERyYXdhYmxlICk6IHRoaXMge1xyXG4gICAgY29uc3QgaW5kZXggPSBfLmluZGV4T2YoIHRoaXMuX2RyYXdhYmxlcywgZHJhd2FibGUgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCA+PSAwLCAnSW52YWxpZCBvcGVyYXRpb246IHRyeWluZyB0byBkZXRhY2ggYSBub24tcmVmZXJlbmNlZCBkcmF3YWJsZScgKTtcclxuXHJcbiAgICB0aGlzLl9kcmF3YWJsZXMuc3BsaWNlKCBpbmRleCwgMSApOyAvLyBUT0RPOiByZXBsYWNlIHdpdGggYSByZW1vdmUoKSBmdW5jdGlvblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTY2FucyB0aGUgb3B0aW9ucyBvYmplY3QgZm9yIGtleSBuYW1lcyB0aGF0IGNvcnJlc3BvbmQgdG8gRVM1IHNldHRlcnMgb3Igb3RoZXIgc2V0dGVyIGZ1bmN0aW9ucywgYW5kIGNhbGxzIHRob3NlXHJcbiAgICogd2l0aCB0aGUgdmFsdWVzLlxyXG4gICAqXHJcbiAgICogRm9yIGV4YW1wbGU6XHJcbiAgICpcclxuICAgKiBub2RlLm11dGF0ZSggeyB0b3A6IDAsIGxlZnQ6IDUgfSApO1xyXG4gICAqXHJcbiAgICogd2lsbCBiZSBlcXVpdmFsZW50IHRvOlxyXG4gICAqXHJcbiAgICogbm9kZS5sZWZ0ID0gNTtcclxuICAgKiBub2RlLnRvcCA9IDA7XHJcbiAgICpcclxuICAgKiBJbiBwYXJ0aWN1bGFyLCBub3RlIHRoYXQgdGhlIG9yZGVyIGlzIGRpZmZlcmVudC4gTXV0YXRvcnMgd2lsbCBiZSBhcHBsaWVkIGluIHRoZSBvcmRlciBvZiBfbXV0YXRvcktleXMsIHdoaWNoIGNhblxyXG4gICAqIGJlIGFkZGVkIHRvIGJ5IHN1YnR5cGVzLlxyXG4gICAqXHJcbiAgICogQWRkaXRpb25hbGx5LCBzb21lIGtleXMgYXJlIGFjdHVhbGx5IGRpcmVjdCBmdW5jdGlvbiBuYW1lcywgbGlrZSAnc2NhbGUnLiBtdXRhdGUoIHsgc2NhbGU6IDIgfSApIHdpbGwgY2FsbFxyXG4gICAqIG5vZGUuc2NhbGUoIDIgKSBpbnN0ZWFkIG9mIGFjdGl2YXRpbmcgYW4gRVM1IHNldHRlciBkaXJlY3RseS5cclxuICAgKi9cclxuICBwdWJsaWMgbXV0YXRlKCBvcHRpb25zPzogTm9kZU9wdGlvbnMgKTogdGhpcyB7XHJcblxyXG4gICAgaWYgKCAhb3B0aW9ucyApIHtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggT2JqZWN0LmdldFByb3RvdHlwZU9mKCBvcHRpb25zICkgPT09IE9iamVjdC5wcm90b3R5cGUsXHJcbiAgICAgICdFeHRyYSBwcm90b3R5cGUgb24gTm9kZSBvcHRpb25zIG9iamVjdCBpcyBhIGNvZGUgc21lbGwnICk7XHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5maWx0ZXIoIFsgJ3RyYW5zbGF0aW9uJywgJ3gnLCAnbGVmdCcsICdyaWdodCcsICdjZW50ZXJYJywgJ2NlbnRlclRvcCcsICdyaWdodFRvcCcsICdsZWZ0Q2VudGVyJywgJ2NlbnRlcicsICdyaWdodENlbnRlcicsICdsZWZ0Qm90dG9tJywgJ2NlbnRlckJvdHRvbScsICdyaWdodEJvdHRvbScgXSwga2V5ID0+IG9wdGlvbnNbIGtleSBdICE9PSB1bmRlZmluZWQgKS5sZW5ndGggPD0gMSxcclxuICAgICAgYE1vcmUgdGhhbiBvbmUgbXV0YXRpb24gb24gdGhpcyBOb2RlIHNldCB0aGUgeCBjb21wb25lbnQsIGNoZWNrICR7T2JqZWN0LmtleXMoIG9wdGlvbnMgKS5qb2luKCAnLCcgKX1gICk7XHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5maWx0ZXIoIFsgJ3RyYW5zbGF0aW9uJywgJ3knLCAndG9wJywgJ2JvdHRvbScsICdjZW50ZXJZJywgJ2NlbnRlclRvcCcsICdyaWdodFRvcCcsICdsZWZ0Q2VudGVyJywgJ2NlbnRlcicsICdyaWdodENlbnRlcicsICdsZWZ0Qm90dG9tJywgJ2NlbnRlckJvdHRvbScsICdyaWdodEJvdHRvbScgXSwga2V5ID0+IG9wdGlvbnNbIGtleSBdICE9PSB1bmRlZmluZWQgKS5sZW5ndGggPD0gMSxcclxuICAgICAgYE1vcmUgdGhhbiBvbmUgbXV0YXRpb24gb24gdGhpcyBOb2RlIHNldCB0aGUgeSBjb21wb25lbnQsIGNoZWNrICR7T2JqZWN0LmtleXMoIG9wdGlvbnMgKS5qb2luKCAnLCcgKX1gICk7XHJcblxyXG4gICAgaWYgKCBhc3NlcnQgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ2VuYWJsZWQnICkgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ2VuYWJsZWRQcm9wZXJ0eScgKSApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5lbmFibGVkUHJvcGVydHkhLnZhbHVlID09PSBvcHRpb25zLmVuYWJsZWQsICdJZiBib3RoIGVuYWJsZWQgYW5kIGVuYWJsZWRQcm9wZXJ0eSBhcmUgcHJvdmlkZWQsIHRoZW4gdmFsdWVzIHNob3VsZCBtYXRjaCcgKTtcclxuICAgIH1cclxuICAgIGlmICggYXNzZXJ0ICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdpbnB1dEVuYWJsZWQnICkgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ2lucHV0RW5hYmxlZFByb3BlcnR5JyApICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmlucHV0RW5hYmxlZFByb3BlcnR5IS52YWx1ZSA9PT0gb3B0aW9ucy5pbnB1dEVuYWJsZWQsICdJZiBib3RoIGlucHV0RW5hYmxlZCBhbmQgaW5wdXRFbmFibGVkUHJvcGVydHkgYXJlIHByb3ZpZGVkLCB0aGVuIHZhbHVlcyBzaG91bGQgbWF0Y2gnICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIGFzc2VydCAmJiBvcHRpb25zLmhhc093blByb3BlcnR5KCAndmlzaWJsZScgKSAmJiBvcHRpb25zLmhhc093blByb3BlcnR5KCAndmlzaWJsZVByb3BlcnR5JyApICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnZpc2libGVQcm9wZXJ0eSEudmFsdWUgPT09IG9wdGlvbnMudmlzaWJsZSwgJ0lmIGJvdGggdmlzaWJsZSBhbmQgdmlzaWJsZVByb3BlcnR5IGFyZSBwcm92aWRlZCwgdGhlbiB2YWx1ZXMgc2hvdWxkIG1hdGNoJyApO1xyXG4gICAgfVxyXG4gICAgaWYgKCBhc3NlcnQgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ3BpY2thYmxlJyApICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdwaWNrYWJsZVByb3BlcnR5JyApICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnBpY2thYmxlUHJvcGVydHkhLnZhbHVlID09PSBvcHRpb25zLnBpY2thYmxlLCAnSWYgYm90aCBwaWNrYWJsZSBhbmQgcGlja2FibGVQcm9wZXJ0eSBhcmUgcHJvdmlkZWQsIHRoZW4gdmFsdWVzIHNob3VsZCBtYXRjaCcgKTtcclxuICAgIH1cclxuXHJcbiAgICBfLmVhY2goIHRoaXMuX211dGF0b3JLZXlzLCBrZXkgPT4ge1xyXG5cclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy81ODAgZm9yIG1vcmUgYWJvdXQgcGFzc2luZyB1bmRlZmluZWQuXHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuaGFzT3duUHJvcGVydHkoIGtleSApIHx8IG9wdGlvbnNbIGtleSBdICE9PSB1bmRlZmluZWQsIGBVbmRlZmluZWQgbm90IGFsbG93ZWQgZm9yIE5vZGUga2V5OiAke2tleX1gICk7XHJcblxyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gSG1tLCBiZXR0ZXIgd2F5IHRvIGNoZWNrIHRoaXM/XHJcbiAgICAgIGlmICggb3B0aW9uc1sga2V5IF0gIT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICBjb25zdCBkZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciggTm9kZS5wcm90b3R5cGUsIGtleSApO1xyXG5cclxuICAgICAgICAvLyBpZiB0aGUga2V5IHJlZmVycyB0byBhIGZ1bmN0aW9uIHRoYXQgaXMgbm90IEVTNSB3cml0YWJsZSwgaXQgd2lsbCBleGVjdXRlIHRoYXQgZnVuY3Rpb24gd2l0aCB0aGUgc2luZ2xlIGFyZ3VtZW50XHJcbiAgICAgICAgaWYgKCBkZXNjcmlwdG9yICYmIHR5cGVvZiBkZXNjcmlwdG9yLnZhbHVlID09PSAnZnVuY3Rpb24nICkge1xyXG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICAgICAgdGhpc1sga2V5IF0oIG9wdGlvbnNbIGtleSBdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICAgICAgdGhpc1sga2V5IF0gPSBvcHRpb25zWyBrZXkgXTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmluaXRpYWxpemVQaGV0aW9PYmplY3QoIHsgcGhldGlvVHlwZTogTm9kZS5Ob2RlSU8sIHBoZXRpb1N0YXRlOiBQSEVUX0lPX1NUQVRFX0RFRkFVTFQgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGluaXRpYWxpemVQaGV0aW9PYmplY3QoIGJhc2VPcHRpb25zOiBQYXJ0aWFsPFBoZXRpb09iamVjdE9wdGlvbnM+LCBjb25maWc6IE5vZGVPcHRpb25zICk6IHZvaWQge1xyXG5cclxuICAgIC8vIFRyYWNrIHRoaXMsIHNvIHdlIG9ubHkgb3ZlcnJpZGUgb3VyIHZpc2libGVQcm9wZXJ0eSBvbmNlLlxyXG4gICAgY29uc3Qgd2FzSW5zdHJ1bWVudGVkID0gdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpO1xyXG5cclxuICAgIHN1cGVyLmluaXRpYWxpemVQaGV0aW9PYmplY3QoIGJhc2VPcHRpb25zLCBjb25maWcgKTtcclxuXHJcbiAgICBpZiAoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgJiYgIXdhc0luc3RydW1lbnRlZCAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XHJcblxyXG4gICAgICAvLyBGb3IgZWFjaCBzdXBwb3J0ZWQgVGlueUZvcndhcmRpbmdQcm9wZXJ0eSwgaWYgYSBQcm9wZXJ0eSB3YXMgYWxyZWFkeSBzcGVjaWZpZWQgaW4gdGhlIG9wdGlvbnMgKGluIHRoZVxyXG4gICAgICAvLyBjb25zdHJ1Y3RvciBvciBtdXRhdGUpLCB0aGVuIGl0IHdpbGwgYmUgc2V0IGFzIHRoaXMudGFyZ2V0UHJvcGVydHkgdGhlcmUuIEhlcmUgd2Ugb25seSBjcmVhdGUgdGhlIGRlZmF1bHRcclxuICAgICAgLy8gaW5zdHJ1bWVudGVkIG9uZSBpZiBhbm90aGVyIGhhc24ndCBhbHJlYWR5IGJlZW4gc3BlY2lmaWVkLlxyXG5cclxuICAgICAgdGhpcy5fdmlzaWJsZVByb3BlcnR5LmluaXRpYWxpemVQaGV0aW8oIHRoaXMsIFZJU0lCTEVfUFJPUEVSVFlfVEFOREVNX05BTUUsICgpID0+IG5ldyBCb29sZWFuUHJvcGVydHkoIHRoaXMudmlzaWJsZSwgY29tYmluZU9wdGlvbnM8Qm9vbGVhblByb3BlcnR5T3B0aW9ucz4oIHtcclxuXHJcbiAgICAgICAgICAvLyBieSBkZWZhdWx0LCB1c2UgdGhlIHZhbHVlIGZyb20gdGhlIE5vZGVcclxuICAgICAgICAgIHBoZXRpb1JlYWRPbmx5OiB0aGlzLnBoZXRpb1JlYWRPbmx5LFxyXG4gICAgICAgICAgdGFuZGVtOiB0aGlzLnRhbmRlbS5jcmVhdGVUYW5kZW0oIFZJU0lCTEVfUFJPUEVSVFlfVEFOREVNX05BTUUgKSxcclxuICAgICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdDb250cm9scyB3aGV0aGVyIHRoZSBOb2RlIHdpbGwgYmUgdmlzaWJsZSAoYW5kIGludGVyYWN0aXZlKS4nXHJcbiAgICAgICAgfSwgY29uZmlnLnZpc2libGVQcm9wZXJ0eU9wdGlvbnMgKSApXHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0aGlzLl9lbmFibGVkUHJvcGVydHkuaW5pdGlhbGl6ZVBoZXRpbyggdGhpcywgRU5BQkxFRF9QUk9QRVJUWV9UQU5ERU1fTkFNRSwgKCkgPT4gbmV3IEVuYWJsZWRQcm9wZXJ0eSggdGhpcy5lbmFibGVkLCBjb21iaW5lT3B0aW9uczxFbmFibGVkUHJvcGVydHlPcHRpb25zPigge1xyXG5cclxuICAgICAgICAgIC8vIGJ5IGRlZmF1bHQsIHVzZSB0aGUgdmFsdWUgZnJvbSB0aGUgTm9kZVxyXG4gICAgICAgICAgcGhldGlvUmVhZE9ubHk6IHRoaXMucGhldGlvUmVhZE9ubHksXHJcbiAgICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnU2V0cyB3aGV0aGVyIHRoZSBub2RlIGlzIGVuYWJsZWQuIFRoaXMgd2lsbCBzZXQgd2hldGhlciBpbnB1dCBpcyBlbmFibGVkIGZvciB0aGlzIE5vZGUgYW5kICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21vc3Qgb2Z0ZW4gY2hpbGRyZW4gYXMgd2VsbC4gSXQgd2lsbCBhbHNvIGNvbnRyb2wgYW5kIHRvZ2dsZSB0aGUgXCJkaXNhYmxlZCBsb29rXCIgb2YgdGhlIG5vZGUuJyxcclxuICAgICAgICAgIHRhbmRlbTogdGhpcy50YW5kZW0uY3JlYXRlVGFuZGVtKCBFTkFCTEVEX1BST1BFUlRZX1RBTkRFTV9OQU1FIClcclxuICAgICAgICB9LCBjb25maWcuZW5hYmxlZFByb3BlcnR5T3B0aW9ucyApIClcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHRoaXMuX2lucHV0RW5hYmxlZFByb3BlcnR5LmluaXRpYWxpemVQaGV0aW8oIHRoaXMsIElOUFVUX0VOQUJMRURfUFJPUEVSVFlfVEFOREVNX05BTUUsICgpID0+IG5ldyBQcm9wZXJ0eSggdGhpcy5pbnB1dEVuYWJsZWQsIGNvbWJpbmVPcHRpb25zPFByb3BlcnR5T3B0aW9uczxib29sZWFuPj4oIHtcclxuXHJcbiAgICAgICAgICAvLyBieSBkZWZhdWx0LCB1c2UgdGhlIHZhbHVlIGZyb20gdGhlIE5vZGVcclxuICAgICAgICAgIHBoZXRpb1JlYWRPbmx5OiB0aGlzLnBoZXRpb1JlYWRPbmx5LFxyXG4gICAgICAgICAgdGFuZGVtOiB0aGlzLnRhbmRlbS5jcmVhdGVUYW5kZW0oIElOUFVUX0VOQUJMRURfUFJPUEVSVFlfVEFOREVNX05BTUUgKSxcclxuICAgICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogQm9vbGVhbklPLFxyXG4gICAgICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWUsIC8vIFNpbmNlIHRoaXMgcHJvcGVydHkgaXMgb3B0LWluLCB3ZSB0eXBpY2FsbHkgb25seSBvcHQtaW4gd2hlbiBpdCBzaG91bGQgYmUgZmVhdHVyZWRcclxuICAgICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdTZXRzIHdoZXRoZXIgdGhlIGVsZW1lbnQgd2lsbCBoYXZlIGlucHV0IGVuYWJsZWQsIGFuZCBoZW5jZSBiZSBpbnRlcmFjdGl2ZS4nXHJcbiAgICAgICAgfSwgY29uZmlnLmlucHV0RW5hYmxlZFByb3BlcnR5T3B0aW9ucyApIClcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgdmlzaWJpbGl0eSBvZiB0aGlzIE5vZGUgd2l0aCByZXNwZWN0IHRvIHRoZSBWb2ljaW5nIGZlYXR1cmUuIFRvdGFsbHkgc2VwYXJhdGUgZnJvbSBncmFwaGljYWwgZGlzcGxheS5cclxuICAgKiBXaGVuIHZpc2libGUsIHRoaXMgTm9kZSBhbmQgYWxsIG9mIGl0cyBhbmNlc3RvcnMgd2lsbCBiZSBhYmxlIHRvIHNwZWFrIHdpdGggVm9pY2luZy4gV2hlbiB2b2ljaW5nVmlzaWJsZVxyXG4gICAqIGlzIGZhbHNlLCBhbGwgVm9pY2luZyB1bmRlciB0aGlzIE5vZGUgd2lsbCBiZSBtdXRlZC4gYHZvaWNpbmdWaXNpYmxlYCBwcm9wZXJ0aWVzIGV4aXN0IGluIE5vZGUudHMgYmVjYXVzZVxyXG4gICAqIGl0IGlzIHVzZWZ1bCB0byBzZXQgYHZvaWNpbmdWaXNpYmxlYCBvbiBhIHJvb3QgdGhhdCBpcyBjb21wb3NlZCB3aXRoIFZvaWNpbmcudHMuIFdlIGNhbm5vdCBwdXQgYWxsIG9mIHRoZVxyXG4gICAqIFZvaWNpbmcudHMgaW1wbGVtZW50YXRpb24gaW4gTm9kZSBiZWNhdXNlIHRoYXQgd291bGQgaGF2ZSBhIG1hc3NpdmUgbWVtb3J5IGltcGFjdC4gU2VlIFZvaWNpbmcudHMgZm9yIG1vcmVcclxuICAgKiBpbmZvcm1hdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0Vm9pY2luZ1Zpc2libGUoIHZpc2libGU6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBpZiAoIHRoaXMudm9pY2luZ1Zpc2libGVQcm9wZXJ0eS52YWx1ZSAhPT0gdmlzaWJsZSApIHtcclxuICAgICAgdGhpcy52b2ljaW5nVmlzaWJsZVByb3BlcnR5LnZhbHVlID0gdmlzaWJsZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgdm9pY2luZ1Zpc2libGUoIHZpc2libGU6IGJvb2xlYW4gKSB7IHRoaXMuc2V0Vm9pY2luZ1Zpc2libGUoIHZpc2libGUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHZvaWNpbmdWaXNpYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pc1ZvaWNpbmdWaXNpYmxlKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgTm9kZSBpcyB2b2ljaW5nVmlzaWJsZS4gV2hlbiB0cnVlIFV0dGVyYW5jZXMgZm9yIHRoaXMgTm9kZSBjYW4gYmUgYW5ub3VuY2VkIHdpdGggdGhlXHJcbiAgICogVm9pY2luZyBmZWF0dXJlLCBzZWUgVm9pY2luZy50cyBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgaXNWb2ljaW5nVmlzaWJsZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLnZvaWNpbmdWaXNpYmxlUHJvcGVydHkudmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBPdmVycmlkZSBmb3IgZXh0cmEgaW5mb3JtYXRpb24gaW4gdGhlIGRlYnVnZ2luZyBvdXRwdXQgKGZyb20gRGlzcGxheS5nZXREZWJ1Z0hUTUwoKSkuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXREZWJ1Z0hUTUxFeHRyYXMoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiAnJztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1ha2VzIHRoaXMgTm9kZSdzIHN1YnRyZWUgYXZhaWxhYmxlIGZvciBpbnNwZWN0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpbnNwZWN0KCk6IHZvaWQge1xyXG4gICAgbG9jYWxTdG9yYWdlLnNjZW5lcnlTbmFwc2hvdCA9IEpTT04uc3RyaW5naWZ5KCB7XHJcbiAgICAgIHR5cGU6ICdTdWJ0cmVlJyxcclxuICAgICAgcm9vdE5vZGVJZDogdGhpcy5pZCxcclxuICAgICAgbm9kZXM6IHNlcmlhbGl6ZUNvbm5lY3RlZE5vZGVzKCB0aGlzIClcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBkZWJ1Z2dpbmcgc3RyaW5nIHRoYXQgaXMgYW4gYXR0ZW1wdGVkIHNlcmlhbGl6YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3ViLXRyZWUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc3BhY2VzIC0gV2hpdGVzcGFjZSB0byBhZGRcclxuICAgKiBAcGFyYW0gW2luY2x1ZGVDaGlsZHJlbl1cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgdG9TdHJpbmcoIHNwYWNlczogc3RyaW5nLCBpbmNsdWRlQ2hpbGRyZW4/OiBib29sZWFuICk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSMke3RoaXMuaWR9YDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBlcmZvcm1zIGNoZWNrcyB0byBzZWUgaWYgdGhlIGludGVybmFsIHN0YXRlIG9mIEluc3RhbmNlIHJlZmVyZW5jZXMgaXMgY29ycmVjdCBhdCBhIGNlcnRhaW4gcG9pbnQgaW4vYWZ0ZXIgdGhlXHJcbiAgICogRGlzcGxheSdzIHVwZGF0ZURpc3BsYXkoKS4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGF1ZGl0SW5zdGFuY2VTdWJ0cmVlRm9yRGlzcGxheSggZGlzcGxheTogRGlzcGxheSApOiB2b2lkIHtcclxuICAgIGlmICggYXNzZXJ0U2xvdyApIHtcclxuICAgICAgY29uc3QgbnVtSW5zdGFuY2VzID0gdGhpcy5faW5zdGFuY2VzLmxlbmd0aDtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtSW5zdGFuY2VzOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSB0aGlzLl9pbnN0YW5jZXNbIGkgXTtcclxuICAgICAgICBpZiAoIGluc3RhbmNlLmRpc3BsYXkgPT09IGRpc3BsYXkgKSB7XHJcbiAgICAgICAgICBhc3NlcnRTbG93KCBpbnN0YW5jZS50cmFpbCEuaXNWYWxpZCgpLFxyXG4gICAgICAgICAgICBgSW52YWxpZCB0cmFpbCBvbiBJbnN0YW5jZTogJHtpbnN0YW5jZS50b1N0cmluZygpfSB3aXRoIHRyYWlsICR7aW5zdGFuY2UudHJhaWwhLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gYXVkaXQgYWxsIG9mIHRoZSBjaGlsZHJlblxyXG4gICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goIGNoaWxkID0+IHtcclxuICAgICAgICBjaGlsZC5hdWRpdEluc3RhbmNlU3VidHJlZUZvckRpc3BsYXkoIGRpc3BsYXkgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hlbiB3ZSBhZGQgb3IgcmVtb3ZlIGFueSBudW1iZXIgb2YgYm91bmRzIGxpc3RlbmVycywgd2Ugd2FudCB0byBpbmNyZW1lbnQvZGVjcmVtZW50IGludGVybmFsIGluZm9ybWF0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGRlbHRhUXVhbnRpdHkgLSBJZiBwb3NpdGl2ZSwgdGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgYmVpbmcgYWRkZWQsIG90aGVyd2lzZSB0aGUgbnVtYmVyIHJlbW92ZWRcclxuICAgKi9cclxuICBwcml2YXRlIG9uQm91bmRzTGlzdGVuZXJzQWRkZWRPclJlbW92ZWQoIGRlbHRhUXVhbnRpdHk6IG51bWJlciApOiB2b2lkIHtcclxuICAgIHRoaXMuY2hhbmdlQm91bmRzRXZlbnRDb3VudCggZGVsdGFRdWFudGl0eSApO1xyXG4gICAgdGhpcy5fYm91bmRzRXZlbnRTZWxmQ291bnQgKz0gZGVsdGFRdWFudGl0eTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc3Bvc2VzIHRoZSBub2RlLCByZWxlYXNpbmcgYWxsIHJlZmVyZW5jZXMgdGhhdCBpdCBtYWludGFpbmVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIHJlbW92ZSBhbGwgUERPTSBpbnB1dCBsaXN0ZW5lcnNcclxuICAgIHRoaXMuZGlzcG9zZVBhcmFsbGVsRE9NKCk7XHJcblxyXG4gICAgLy8gV2hlbiBkaXNwb3NpbmcsIHJlbW92ZSBhbGwgY2hpbGRyZW4gYW5kIHBhcmVudHMuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNjI5XHJcbiAgICB0aGlzLnJlbW92ZUFsbENoaWxkcmVuKCk7XHJcbiAgICB0aGlzLmRldGFjaCgpO1xyXG5cclxuICAgIC8vIEluIG9wcG9zaXRlIG9yZGVyIG9mIGNyZWF0aW9uXHJcbiAgICB0aGlzLl9pbnB1dEVuYWJsZWRQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLl9lbmFibGVkUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5fcGlja2FibGVQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLl92aXNpYmxlUHJvcGVydHkuZGlzcG9zZSgpO1xyXG5cclxuICAgIC8vIFRlYXItZG93biBpbiB0aGUgcmV2ZXJzZSBvcmRlciBOb2RlIHdhcyBjcmVhdGVkXHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwb3NlcyB0aGlzIE5vZGUgYW5kIGFsbCBvdGhlciBkZXNjZW5kYW50IG5vZGVzLlxyXG4gICAqXHJcbiAgICogTk9URTogVXNlIHdpdGggY2F1dGlvbiwgYXMgeW91IHNob3VsZCBub3QgcmUtdXNlIGFueSBOb2RlIHRvdWNoZWQgYnkgdGhpcy4gTm90IGNvbXBhdGlibGUgd2l0aCBtb3N0IERBR1xyXG4gICAqICAgICAgIHRlY2huaXF1ZXMuXHJcbiAgICovXHJcbiAgcHVibGljIGRpc3Bvc2VTdWJ0cmVlKCk6IHZvaWQge1xyXG4gICAgaWYgKCAhdGhpcy5pc0Rpc3Bvc2VkICkge1xyXG4gICAgICAvLyBtYWtlcyBhIGNvcHkgYmVmb3JlIGRpc3Bvc2luZ1xyXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW47XHJcblxyXG4gICAgICB0aGlzLmRpc3Bvc2UoKTtcclxuXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNoaWxkcmVuWyBpIF0uZGlzcG9zZVN1YnRyZWUoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIEEgZGVmYXVsdCBmb3IgZ2V0VHJhaWxzKCkgc2VhcmNoZXMsIHJldHVybnMgd2hldGhlciB0aGUgTm9kZSBoYXMgbm8gcGFyZW50cy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGRlZmF1bHRUcmFpbFByZWRpY2F0ZSggbm9kZTogTm9kZSApOiBib29sZWFuIHtcclxuICAgIHJldHVybiBub2RlLl9wYXJlbnRzLmxlbmd0aCA9PT0gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgZGVmYXVsdCBmb3IgZ2V0TGVhZlRyYWlscygpIHNlYXJjaGVzLCByZXR1cm5zIHdoZXRoZXIgdGhlIE5vZGUgaGFzIG5vIHBhcmVudHMuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBkZWZhdWx0TGVhZlRyYWlsUHJlZGljYXRlKCBub2RlOiBOb2RlICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIG5vZGUuX2NoaWxkcmVuLmxlbmd0aCA9PT0gMDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgTm9kZUlPOiBJT1R5cGU7XHJcblxyXG4gIC8vIEEgbWFwcGluZyBvZiBhbGwgb2YgdGhlIGRlZmF1bHQgb3B0aW9ucyBwcm92aWRlZCB0byBOb2RlXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBERUZBVUxUX05PREVfT1BUSU9OUyA9IERFRkFVTFRfT1BUSU9OUztcclxuXHJcbn1cclxuXHJcbk5vZGUucHJvdG90eXBlLl9tdXRhdG9yS2V5cyA9IEFDQ0VTU0lCSUxJVFlfT1BUSU9OX0tFWVMuY29uY2F0KCBOT0RFX09QVElPTl9LRVlTICk7XHJcblxyXG4vKipcclxuICoge0FycmF5LjxTdHJpbmc+fSAtIExpc3Qgb2YgYWxsIGRpcnR5IGZsYWdzIHRoYXQgc2hvdWxkIGJlIGF2YWlsYWJsZSBvbiBkcmF3YWJsZXMgY3JlYXRlZCBmcm9tIHRoaXMgTm9kZSAob3JcclxuICogICAgICAgICAgICAgICAgICAgIHN1YnR5cGUpLiBHaXZlbiBhIGZsYWcgKGUuZy4gcmFkaXVzKSwgaXQgaW5kaWNhdGVzIHRoZSBleGlzdGVuY2Ugb2YgYSBmdW5jdGlvblxyXG4gKiAgICAgICAgICAgICAgICAgICAgZHJhd2FibGUubWFya0RpcnR5UmFkaXVzKCkgdGhhdCB3aWxsIGluZGljYXRlIHRvIHRoZSBkcmF3YWJsZSB0aGF0IHRoZSByYWRpdXMgaGFzIGNoYW5nZWQuXHJcbiAqIChzY2VuZXJ5LWludGVybmFsKVxyXG4gKlxyXG4gKiBTaG91bGQgYmUgb3ZlcnJpZGRlbiBieSBzdWJ0eXBlcy5cclxuICovXHJcbk5vZGUucHJvdG90eXBlLmRyYXdhYmxlTWFya0ZsYWdzID0gW107XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnTm9kZScsIE5vZGUgKTtcclxuXHJcbi8vIHtJT1R5cGV9XHJcbk5vZGUuTm9kZUlPID0gbmV3IElPVHlwZSggJ05vZGVJTycsIHtcclxuICB2YWx1ZVR5cGU6IE5vZGUsXHJcbiAgZG9jdW1lbnRhdGlvbjogJ1RoZSBiYXNlIHR5cGUgZm9yIGdyYXBoaWNhbCBhbmQgcG90ZW50aWFsbHkgaW50ZXJhY3RpdmUgb2JqZWN0cy4nLFxyXG4gIG1ldGFkYXRhRGVmYXVsdHM6IHtcclxuICAgIHBoZXRpb1N0YXRlOiBQSEVUX0lPX1NUQVRFX0RFRkFVTFRcclxuICB9XHJcbn0gKTtcclxuXHJcbi8vIFdlIHVzZSBpbnRlcmZhY2UgZXh0ZW5zaW9uLCBzbyB3ZSBjYW4ndCBleHBvcnQgTm9kZSBhdCBpdHMgZGVjbGFyYXRpb24gbG9jYXRpb25cclxuZXhwb3J0IGRlZmF1bHQgTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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