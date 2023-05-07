// Copyright 2013-2023, University of Colorado Boulder

/**
 * A Path draws a Shape with a specific type of fill and stroke. Mixes in Paintable.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import { Shape } from '../../../kite/js/imports.js';
import { Node, Paint, Paintable, PAINTABLE_DRAWABLE_MARK_FLAGS, PAINTABLE_OPTION_KEYS, PathCanvasDrawable, PathSVGDrawable, Renderer, scenery } from '../imports.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
const PATH_OPTION_KEYS = ['boundsMethod', 'shape'];
const DEFAULT_OPTIONS = {
  shape: null,
  boundsMethod: 'accurate'
};
export default class Path extends Paintable(Node) {
  // The Shape used for displaying this Path.
  // NOTE: _shape can be lazily constructed in subtypes (may be null) if hasShape() is overridden to return true,
  //       like in Rectangle. This is because usually the actual Shape is already implied by other parameters,
  //       so it is best to not have to compute it on changes.
  // NOTE: Please use hasShape() to determine if we are actually drawing things, as it is subtype-safe.
  // (scenery-internal)

  // This stores a stroked copy of the Shape which is lazily computed. This can be required for computing bounds
  // of a Shape with a stroke.
  // (scenery-internal)
  // Used as a listener to Shapes for when they are invalidated. The listeners are not added if the Shape is
  // immutable, and if the Shape becomes immutable, then the listeners are removed.
  // Whether our shape listener is attached to a shape.
  /**
   * Creates a Path with a given shape specifier (a Shape, a string in the SVG path format, or null to indicate no
   * shape).
   *
   * Path has two additional options (above what Node provides):
   * - shape: The actual Shape (or a string representing an SVG path, or null).
   * - boundsMethod: Determines how the bounds of a shape are determined.
   *
   * @param shape - The initial Shape to display. See setShape() for more details and documentation.
   * @param [providedOptions] - Path-specific options are documented in PATH_OPTION_KEYS above, and can be provided
   *                             along-side options for Node
   */
  constructor(shape, providedOptions) {
    assert && assert(providedOptions === undefined || Object.getPrototypeOf(providedOptions) === Object.prototype, 'Extra prototype on Node options object is a code smell');
    if (shape || providedOptions?.shape) {
      assert && assert(!shape || !providedOptions?.shape, 'Do not define shape twice. Check constructor and providedOptions.');
    }
    const options = optionize()({
      shape: shape,
      boundsMethod: DEFAULT_OPTIONS.boundsMethod
    }, providedOptions);
    super();
    this._shape = DEFAULT_OPTIONS.shape;
    this._strokedShape = null;
    this._boundsMethod = DEFAULT_OPTIONS.boundsMethod;
    this._invalidShapeListener = this.invalidateShape.bind(this);
    this._invalidShapeListenerAttached = false;
    this.invalidateSupportedRenderers();
    this.mutate(options);
  }
  setShape(shape) {
    assert && assert(shape === null || typeof shape === 'string' || shape instanceof Shape, 'A path\'s shape should either be null, a string, or a Shape');
    if (this._shape !== shape) {
      // Remove Shape invalidation listener if applicable
      if (this._invalidShapeListenerAttached) {
        this.detachShapeListener();
      }
      if (typeof shape === 'string') {
        // be content with setShape always invalidating the shape?
        shape = new Shape(shape);
      }
      this._shape = shape;
      this.invalidateShape();

      // Add Shape invalidation listener if applicable
      if (this._shape && !this._shape.isImmutable()) {
        this.attachShapeListener();
      }
    }
    return this;
  }
  set shape(value) {
    this.setShape(value);
  }
  get shape() {
    return this.getShape();
  }

  /**
   * Returns the shape that was set for this Path (or for subtypes like Line and Rectangle, will return an immutable
   * Shape that is equivalent in appearance).
   *
   * It is best to generally assume modifications to the Shape returned is not supported. If there is no shape
   * currently, null will be returned.
   */
  getShape() {
    return this._shape;
  }

  /**
   * Returns a lazily-created Shape that has the appearance of the Path's shape but stroked using the current
   * stroke style of the Path.
   *
   * NOTE: It is invalid to call this on a Path that does not currently have a Shape (usually a Path where
   *       the shape is set to null).
   */
  getStrokedShape() {
    assert && assert(this.hasShape(), 'We cannot stroke a non-existing shape');

    // Lazily compute the stroked shape. It should be set to null when we need to recompute it
    if (!this._strokedShape) {
      this._strokedShape = this.getShape().getStrokedShape(this._lineDrawingStyles);
    }
    return this._strokedShape;
  }

  /**
   * Returns a bitmask representing the supported renderers for the current configuration of the Path or subtype.
   *
   * Should be overridden by subtypes to either extend or restrict renderers, depending on what renderers are
   * supported.
   *
   * @returns - A bitmask that includes supported renderers, see Renderer for details.
   */
  getPathRendererBitmask() {
    // By default, Canvas and SVG are accepted.
    return Renderer.bitmaskCanvas | Renderer.bitmaskSVG;
  }

  /**
   * Triggers a check and update for what renderers the current configuration of this Path or subtype supports.
   * This should be called whenever something that could potentially change supported renderers happen (which can
   * be the shape, properties of the strokes or fills, etc.)
   */
  invalidateSupportedRenderers() {
    this.setRendererBitmask(this.getFillRendererBitmask() & this.getStrokeRendererBitmask() & this.getPathRendererBitmask());
  }

  /**
   * Notifies the Path that the Shape has changed (either the Shape itself has be mutated, a new Shape has been
   * provided).
   *
   * NOTE: This should not be called on subtypes of Path after they have been constructed, like Line, Rectangle, etc.
   */
  invalidateShape() {
    this.invalidatePath();
    const stateLen = this._drawables.length;
    for (let i = 0; i < stateLen; i++) {
      this._drawables[i].markDirtyShape(); // subtypes of Path may not have this, but it's called during construction
    }

    // Disconnect our Shape listener if our Shape has become immutable.
    // see https://github.com/phetsims/sun/issues/270#issuecomment-250266174
    if (this._invalidShapeListenerAttached && this._shape && this._shape.isImmutable()) {
      this.detachShapeListener();
    }
  }

  /**
   * Invalidates the node's self-bounds and any other recorded metadata about the outline or bounds of the Shape.
   *
   * This is meant to be used for all Path subtypes (unlike invalidateShape).
   */
  invalidatePath() {
    this._strokedShape = null;
    this.invalidateSelf(); // We don't immediately compute the bounds
  }

  /**
   * Attaches a listener to our Shape that will be called whenever the Shape changes.
   */
  attachShapeListener() {
    assert && assert(!this._invalidShapeListenerAttached, 'We do not want to have two listeners attached!');

    // Do not attach shape listeners if we are disposed
    if (!this.isDisposed) {
      this._shape.invalidatedEmitter.addListener(this._invalidShapeListener);
      this._invalidShapeListenerAttached = true;
    }
  }

  /**
   * Detaches a previously-attached listener added to our Shape (see attachShapeListener).
   */
  detachShapeListener() {
    assert && assert(this._invalidShapeListenerAttached, 'We cannot detach an unattached listener');
    this._shape.invalidatedEmitter.removeListener(this._invalidShapeListener);
    this._invalidShapeListenerAttached = false;
  }

  /**
   * Computes a more efficient selfBounds for our Path.
   *
   * @returns - Whether the self bounds changed.
   */
  updateSelfBounds() {
    const selfBounds = this.hasShape() ? this.computeShapeBounds() : Bounds2.NOTHING;
    const changed = !selfBounds.equals(this.selfBoundsProperty._value);
    if (changed) {
      this.selfBoundsProperty._value.set(selfBounds);
    }
    return changed;
  }
  setBoundsMethod(boundsMethod) {
    assert && assert(boundsMethod === 'accurate' || boundsMethod === 'unstroked' || boundsMethod === 'tightPadding' || boundsMethod === 'safePadding' || boundsMethod === 'none');
    if (this._boundsMethod !== boundsMethod) {
      this._boundsMethod = boundsMethod;
      this.invalidatePath();
      this.rendererSummaryRefreshEmitter.emit(); // whether our self bounds are valid may have changed
    }

    return this;
  }
  set boundsMethod(value) {
    this.setBoundsMethod(value);
  }
  get boundsMethod() {
    return this.getBoundsMethod();
  }

  /**
   * Returns the current bounds method. See setBoundsMethod for details.
   */
  getBoundsMethod() {
    return this._boundsMethod;
  }

  /**
   * Computes the bounds of the Path (or subtype when overridden). Meant to be overridden in subtypes for more
   * efficient bounds computations (but this will work as a fallback). Includes the stroked region if there is a
   * stroke applied to the Path.
   */
  computeShapeBounds() {
    const shape = this.getShape();
    // boundsMethod: 'none' will return no bounds
    if (this._boundsMethod === 'none' || !shape) {
      return Bounds2.NOTHING;
    } else {
      // boundsMethod: 'unstroked', or anything without a stroke will then just use the normal shape bounds
      if (!this.hasPaintableStroke() || this._boundsMethod === 'unstroked') {
        return shape.bounds;
      } else {
        // 'accurate' will always require computing the full stroked shape, and taking its bounds
        if (this._boundsMethod === 'accurate') {
          return shape.getStrokedBounds(this.getLineStyles());
        }
        // Otherwise we compute bounds based on 'tightPadding' and 'safePadding', the one difference being that
        // 'safePadding' will include whatever bounds necessary to include miters. Square line-cap requires a
        // slightly extended bounds in either case.
        else {
          let factor;
          // If miterLength (inside corner to outside corner) exceeds miterLimit * strokeWidth, it will get turned to
          // a bevel, so our factor will be based just on the miterLimit.
          if (this._boundsMethod === 'safePadding' && this.getLineJoin() === 'miter') {
            factor = this.getMiterLimit();
          } else if (this.getLineCap() === 'square') {
            factor = Math.SQRT2;
          } else {
            factor = 1;
          }
          return shape.bounds.dilated(factor * this.getLineWidth() / 2);
        }
      }
    }
  }

  /**
   * Whether this Node's selfBounds are considered to be valid (always containing the displayed self content
   * of this node). Meant to be overridden in subtypes when this can change (e.g. Text).
   *
   * If this value would potentially change, please trigger the event 'selfBoundsValid'.
   */
  areSelfBoundsValid() {
    if (this._boundsMethod === 'accurate' || this._boundsMethod === 'safePadding') {
      return true;
    } else if (this._boundsMethod === 'none') {
      return false;
    } else {
      return !this.hasStroke(); // 'tightPadding' and 'unstroked' options
    }
  }

  /**
   * Returns our self bounds when our rendered self is transformed by the matrix.
   */
  getTransformedSelfBounds(matrix) {
    assert && assert(this.hasShape());
    return (this._stroke ? this.getStrokedShape() : this.getShape()).getBoundsWithTransform(matrix);
  }

  /**
   * Returns our safe self bounds when our rendered self is transformed by the matrix.
   */
  getTransformedSafeSelfBounds(matrix) {
    return this.getTransformedSelfBounds(matrix);
  }

  /**
   * Called from (and overridden in) the Paintable trait, invalidates our current stroke, triggering recomputation of
   * anything that depended on the old stroke's value. (scenery-internal)
   */
  invalidateStroke() {
    this.invalidatePath();
    this.rendererSummaryRefreshEmitter.emit(); // Stroke changing could have changed our self-bounds-validitity (unstroked/etc)

    super.invalidateStroke();
  }

  /**
   * Returns whether this Path has an associated Shape (instead of no shape, represented by null)
   */
  hasShape() {
    return !!this._shape;
  }

  /**
   * Draws the current Node's self representation, assuming the wrapper's Canvas context is already in the local
   * coordinate frame of this node.
   *
   * @param wrapper
   * @param matrix - The transformation matrix already applied to the context.
   */
  canvasPaintSelf(wrapper, matrix) {
    //TODO: Have a separate method for this, instead of touching the prototype. Can make 'this' references too easily.
    PathCanvasDrawable.prototype.paintCanvas(wrapper, this, matrix);
  }

  /**
   * Creates a SVG drawable for this Path. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createSVGDrawable(renderer, instance) {
    // @ts-expect-error
    return PathSVGDrawable.createFromPool(renderer, instance);
  }

  /**
   * Creates a Canvas drawable for this Path. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createCanvasDrawable(renderer, instance) {
    // @ts-expect-error
    return PathCanvasDrawable.createFromPool(renderer, instance);
  }

  /**
   * Whether this Node itself is painted (displays something itself).
   */
  isPainted() {
    // Always true for Path nodes
    return true;
  }

  /**
   * Computes whether the provided point is "inside" (contained) in this Path's self content, or "outside".
   *
   * @param point - Considered to be in the local coordinate frame
   */
  containsPointSelf(point) {
    let result = false;
    if (!this.hasShape()) {
      return result;
    }

    // if this node is fillPickable, we will return true if the point is inside our fill area
    if (this._fillPickable) {
      result = this.getShape().containsPoint(point);
    }

    // also include the stroked region in the hit area if strokePickable
    if (!result && this._strokePickable) {
      result = this.getStrokedShape().containsPoint(point);
    }
    return result;
  }

  /**
   * Returns a Shape that represents the area covered by containsPointSelf.
   */
  getSelfShape() {
    return Shape.union([...(this.hasShape() && this._fillPickable ? [this.getShape()] : []), ...(this.hasShape() && this._strokePickable ? [this.getStrokedShape()] : [])]);
  }

  /**
   * Returns whether this Path's selfBounds is intersected by the specified bounds.
   *
   * @param bounds - Bounds to test, assumed to be in the local coordinate frame.
   */
  intersectsBoundsSelf(bounds) {
    // TODO: should a shape's stroke be included?
    return this._shape ? this._shape.intersectsBounds(bounds) : false;
  }

  /**
   * Returns whether we need to apply a transform workaround for https://github.com/phetsims/scenery/issues/196, which
   * only applies when we have a pattern or gradient (e.g. subtypes of Paint).
   */
  requiresSVGBoundsWorkaround() {
    if (!this._stroke || !(this._stroke instanceof Paint) || !this.hasShape()) {
      return false;
    }
    const bounds = this.computeShapeBounds();
    return bounds.x * bounds.y === 0; // at least one of them was zero, so the bounding box has no area
  }

  /**
   * Override for extra information in the debugging output (from Display.getDebugHTML()). (scenery-internal)
   */
  getDebugHTMLExtras() {
    return this._shape ? ` (<span style="color: #88f" onclick="window.open( 'data:text/plain;charset=utf-8,' + encodeURIComponent( '${this._shape.getSVGPath()}' ) );">path</span>)` : '';
  }

  /**
   * Disposes the path, releasing shape listeners if needed (and preventing new listeners from being added).
   */
  dispose() {
    if (this._invalidShapeListenerAttached) {
      this.detachShapeListener();
    }
    super.dispose();
  }
  mutate(options) {
    return super.mutate(options);
  }

  // Initial values for most Node mutator options
  static DEFAULT_PATH_OPTIONS = combineOptions({}, Node.DEFAULT_NODE_OPTIONS, DEFAULT_OPTIONS);
}

/**
 * {Array.<string>} - String keys for all of the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */
Path.prototype._mutatorKeys = [...PAINTABLE_OPTION_KEYS, ...PATH_OPTION_KEYS, ...Node.prototype._mutatorKeys];

/**
 * {Array.<String>} - List of all dirty flags that should be available on drawables created from this node (or
 *                    subtype). Given a flag (e.g. radius), it indicates the existence of a function
 *                    drawable.markDirtyRadius() that will indicate to the drawable that the radius has changed.
 * (scenery-internal)
 * @override
 */
Path.prototype.drawableMarkFlags = [...Node.prototype.drawableMarkFlags, ...PAINTABLE_DRAWABLE_MARK_FLAGS, 'shape'];
scenery.register('Path', Path);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiU2hhcGUiLCJOb2RlIiwiUGFpbnQiLCJQYWludGFibGUiLCJQQUlOVEFCTEVfRFJBV0FCTEVfTUFSS19GTEFHUyIsIlBBSU5UQUJMRV9PUFRJT05fS0VZUyIsIlBhdGhDYW52YXNEcmF3YWJsZSIsIlBhdGhTVkdEcmF3YWJsZSIsIlJlbmRlcmVyIiwic2NlbmVyeSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiUEFUSF9PUFRJT05fS0VZUyIsIkRFRkFVTFRfT1BUSU9OUyIsInNoYXBlIiwiYm91bmRzTWV0aG9kIiwiUGF0aCIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwiYXNzZXJ0IiwidW5kZWZpbmVkIiwiT2JqZWN0IiwiZ2V0UHJvdG90eXBlT2YiLCJwcm90b3R5cGUiLCJvcHRpb25zIiwiX3NoYXBlIiwiX3N0cm9rZWRTaGFwZSIsIl9ib3VuZHNNZXRob2QiLCJfaW52YWxpZFNoYXBlTGlzdGVuZXIiLCJpbnZhbGlkYXRlU2hhcGUiLCJiaW5kIiwiX2ludmFsaWRTaGFwZUxpc3RlbmVyQXR0YWNoZWQiLCJpbnZhbGlkYXRlU3VwcG9ydGVkUmVuZGVyZXJzIiwibXV0YXRlIiwic2V0U2hhcGUiLCJkZXRhY2hTaGFwZUxpc3RlbmVyIiwiaXNJbW11dGFibGUiLCJhdHRhY2hTaGFwZUxpc3RlbmVyIiwidmFsdWUiLCJnZXRTaGFwZSIsImdldFN0cm9rZWRTaGFwZSIsImhhc1NoYXBlIiwiX2xpbmVEcmF3aW5nU3R5bGVzIiwiZ2V0UGF0aFJlbmRlcmVyQml0bWFzayIsImJpdG1hc2tDYW52YXMiLCJiaXRtYXNrU1ZHIiwic2V0UmVuZGVyZXJCaXRtYXNrIiwiZ2V0RmlsbFJlbmRlcmVyQml0bWFzayIsImdldFN0cm9rZVJlbmRlcmVyQml0bWFzayIsImludmFsaWRhdGVQYXRoIiwic3RhdGVMZW4iLCJfZHJhd2FibGVzIiwibGVuZ3RoIiwiaSIsIm1hcmtEaXJ0eVNoYXBlIiwiaW52YWxpZGF0ZVNlbGYiLCJpc0Rpc3Bvc2VkIiwiaW52YWxpZGF0ZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJyZW1vdmVMaXN0ZW5lciIsInVwZGF0ZVNlbGZCb3VuZHMiLCJzZWxmQm91bmRzIiwiY29tcHV0ZVNoYXBlQm91bmRzIiwiTk9USElORyIsImNoYW5nZWQiLCJlcXVhbHMiLCJzZWxmQm91bmRzUHJvcGVydHkiLCJfdmFsdWUiLCJzZXQiLCJzZXRCb3VuZHNNZXRob2QiLCJyZW5kZXJlclN1bW1hcnlSZWZyZXNoRW1pdHRlciIsImVtaXQiLCJnZXRCb3VuZHNNZXRob2QiLCJoYXNQYWludGFibGVTdHJva2UiLCJib3VuZHMiLCJnZXRTdHJva2VkQm91bmRzIiwiZ2V0TGluZVN0eWxlcyIsImZhY3RvciIsImdldExpbmVKb2luIiwiZ2V0TWl0ZXJMaW1pdCIsImdldExpbmVDYXAiLCJNYXRoIiwiU1FSVDIiLCJkaWxhdGVkIiwiZ2V0TGluZVdpZHRoIiwiYXJlU2VsZkJvdW5kc1ZhbGlkIiwiaGFzU3Ryb2tlIiwiZ2V0VHJhbnNmb3JtZWRTZWxmQm91bmRzIiwibWF0cml4IiwiX3N0cm9rZSIsImdldEJvdW5kc1dpdGhUcmFuc2Zvcm0iLCJnZXRUcmFuc2Zvcm1lZFNhZmVTZWxmQm91bmRzIiwiaW52YWxpZGF0ZVN0cm9rZSIsImNhbnZhc1BhaW50U2VsZiIsIndyYXBwZXIiLCJwYWludENhbnZhcyIsImNyZWF0ZVNWR0RyYXdhYmxlIiwicmVuZGVyZXIiLCJpbnN0YW5jZSIsImNyZWF0ZUZyb21Qb29sIiwiY3JlYXRlQ2FudmFzRHJhd2FibGUiLCJpc1BhaW50ZWQiLCJjb250YWluc1BvaW50U2VsZiIsInBvaW50IiwicmVzdWx0IiwiX2ZpbGxQaWNrYWJsZSIsImNvbnRhaW5zUG9pbnQiLCJfc3Ryb2tlUGlja2FibGUiLCJnZXRTZWxmU2hhcGUiLCJ1bmlvbiIsImludGVyc2VjdHNCb3VuZHNTZWxmIiwiaW50ZXJzZWN0c0JvdW5kcyIsInJlcXVpcmVzU1ZHQm91bmRzV29ya2Fyb3VuZCIsIngiLCJ5IiwiZ2V0RGVidWdIVE1MRXh0cmFzIiwiZ2V0U1ZHUGF0aCIsImRpc3Bvc2UiLCJERUZBVUxUX1BBVEhfT1BUSU9OUyIsIkRFRkFVTFRfTk9ERV9PUFRJT05TIiwiX211dGF0b3JLZXlzIiwiZHJhd2FibGVNYXJrRmxhZ3MiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBhdGgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBQYXRoIGRyYXdzIGEgU2hhcGUgd2l0aCBhIHNwZWNpZmljIHR5cGUgb2YgZmlsbCBhbmQgc3Ryb2tlLiBNaXhlcyBpbiBQYWludGFibGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IENhbnZhc0NvbnRleHRXcmFwcGVyLCBDYW52YXNTZWxmRHJhd2FibGUsIEluc3RhbmNlLCBUUGF0aERyYXdhYmxlLCBOb2RlLCBOb2RlT3B0aW9ucywgUGFpbnQsIFBhaW50YWJsZSwgUEFJTlRBQkxFX0RSQVdBQkxFX01BUktfRkxBR1MsIFBBSU5UQUJMRV9PUFRJT05fS0VZUywgUGFpbnRhYmxlT3B0aW9ucywgUGF0aENhbnZhc0RyYXdhYmxlLCBQYXRoU1ZHRHJhd2FibGUsIFJlbmRlcmVyLCBzY2VuZXJ5LCBTVkdTZWxmRHJhd2FibGUgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5cclxuY29uc3QgUEFUSF9PUFRJT05fS0VZUyA9IFtcclxuICAnYm91bmRzTWV0aG9kJyxcclxuICAnc2hhcGUnXHJcbl07XHJcblxyXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XHJcbiAgc2hhcGU6IG51bGwsXHJcbiAgYm91bmRzTWV0aG9kOiAnYWNjdXJhdGUnIGFzIGNvbnN0XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBQYXRoQm91bmRzTWV0aG9kID0gJ2FjY3VyYXRlJyB8ICd1bnN0cm9rZWQnIHwgJ3RpZ2h0UGFkZGluZycgfCAnc2FmZVBhZGRpbmcnIHwgJ25vbmUnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICAvKipcclxuICAgKiBUaGlzIHNldHMgdGhlIHNoYXBlIG9mIHRoZSBQYXRoLCB3aGljaCBkZXRlcm1pbmVzIHRoZSBzaGFwZSBvZiBpdHMgYXBwZWFyYW5jZS4gSXQgc2hvdWxkIGdlbmVyYWxseSBub3QgYmUgY2FsbGVkXHJcbiAgICogb24gUGF0aCBzdWJ0eXBlcyBsaWtlIExpbmUsIFJlY3RhbmdsZSwgZXRjLlxyXG4gICAqXHJcbiAgICogTk9URTogV2hlbiB5b3UgY3JlYXRlIGEgUGF0aCB3aXRoIGEgc2hhcGUgaW4gdGhlIGNvbnN0cnVjdG9yLCB0aGlzIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkLlxyXG4gICAqXHJcbiAgICogVGhlIHZhbGlkIHBhcmFtZXRlciB0eXBlcyBhcmU6XHJcbiAgICogLSBTaGFwZTogKGZyb20gS2l0ZSksIG5vcm1hbGx5IHVzZWQuXHJcbiAgICogLSBzdHJpbmc6IFVzZXMgdGhlIFNWRyBQYXRoIGZvcm1hdCwgc2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9TVkcvcGF0aHMuaHRtbCAodGhlIFBBVEggcGFydCBvZiA8cGF0aCBkPVwiUEFUSFwiLz4pLlxyXG4gICAqICAgICAgICAgICBUaGlzIHdpbGwgaW1tZWRpYXRlbHkgYmUgY29udmVydGVkIHRvIGEgU2hhcGUgb2JqZWN0LCBhbmQgZ2V0U2hhcGUoKSBvciBlcXVpdmFsZW50cyB3aWxsIHJldHVybiB0aGUgbmV3XHJcbiAgICogICAgICAgICAgIFNoYXBlIG9iamVjdCBpbnN0ZWFkIG9mIHRoZSBvcmlnaW5hbCBzdHJpbmcuXHJcbiAgICogLSBudWxsOiBJbmRpY2F0ZXMgdGhhdCB0aGVyZSBpcyBubyBTaGFwZSwgYW5kIG5vdGhpbmcgaXMgZHJhd24uIFVzdWFsbHkgdXNlZCBhcyBhIHBsYWNlaG9sZGVyLlxyXG4gICAqXHJcbiAgICogTk9URTogQmUgYXdhcmUgb2YgdGhlIHBvdGVudGlhbCBmb3IgbWVtb3J5IGxlYWtzLiBJZiBhIFNoYXBlIGlzIG5vdCBtYXJrZWQgYXMgaW1tdXRhYmxlICh3aXRoIG1ha2VJbW11dGFibGUoKSksXHJcbiAgICogICAgICAgUGF0aCB3aWxsIGFkZCBhIGxpc3RlbmVyIHNvIHRoYXQgaXQgaXMgdXBkYXRlZCB3aGVuIHRoZSBTaGFwZSBpdHNlbGYgY2hhbmdlcy4gSWYgdGhlcmUgaXMgYSBsaXN0ZW5lclxyXG4gICAqICAgICAgIGFkZGVkLCBrZWVwaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBTaGFwZSB3aWxsIGFsc28ga2VlcCBhIHJlZmVyZW5jZSB0byB0aGUgUGF0aCBvYmplY3QgKGFuZCB0aHVzIHdoYXRldmVyXHJcbiAgICogICAgICAgTm9kZXMgYXJlIGNvbm5lY3RlZCB0byB0aGUgUGF0aCkuIEZvciBub3csIHNldCBwYXRoLnNoYXBlID0gbnVsbCBpZiB5b3UgbmVlZCB0byByZWxlYXNlIHRoZSByZWZlcmVuY2VcclxuICAgKiAgICAgICB0aGF0IHRoZSBTaGFwZSB3b3VsZCBoYXZlLCBvciBjYWxsIGRpc3Bvc2UoKSBvbiB0aGUgUGF0aCBpZiBpdCBpcyBub3QgbmVlZGVkIGFueW1vcmUuXHJcbiAgICovXHJcbiAgc2hhcGU/OiBTaGFwZSB8IHN0cmluZyB8IG51bGw7XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGJvdW5kcyBtZXRob2QgZm9yIHRoZSBQYXRoLiBUaGlzIGRldGVybWluZXMgaG93IG91ciAoc2VsZikgYm91bmRzIGFyZSBjb21wdXRlZCwgYW5kIGNhbiBwYXJ0aWN1bGFybHlcclxuICAgKiBkZXRlcm1pbmUgaG93IGV4cGVuc2l2ZSB0byBjb21wdXRlIG91ciBib3VuZHMgYXJlIGlmIHdlIGhhdmUgYSBzdHJva2UuXHJcbiAgICpcclxuICAgKiBUaGVyZSBhcmUgdGhlIGZvbGxvd2luZyBvcHRpb25zOlxyXG4gICAqIC0gJ2FjY3VyYXRlJyAtIEFsd2F5cyB1c2VzIHRoZSBtb3N0IGFjY3VyYXRlIHdheSBvZiBnZXR0aW5nIGJvdW5kcy4gQ29tcHV0ZXMgdGhlIGV4YWN0IHN0cm9rZWQgYm91bmRzLlxyXG4gICAqIC0gJ3Vuc3Ryb2tlZCcgLSBJZ25vcmVzIGFueSBzdHJva2UsIGp1c3QgZ2l2ZXMgdGhlIGZpbGxlZCBib3VuZHMuXHJcbiAgICogICAgICAgICAgICAgICAgIElmIHRoZXJlIGlzIGEgc3Ryb2tlLCB0aGUgYm91bmRzIHdpbGwgYmUgbWFya2VkIGFzIGluYWNjdXJhdGVcclxuICAgKiAtICd0aWdodFBhZGRpbmcnIC0gUGFkcyB0aGUgZmlsbGVkIGJvdW5kcyBieSBlbm91Z2ggdG8gY292ZXIgZXZlcnl0aGluZyBleGNlcHQgbWl0ZXJlZCBqb2ludHMuXHJcbiAgICogICAgICAgICAgICAgICAgICAgICBJZiB0aGVyZSBpcyBhIHN0cm9rZSwgdGhlIGJvdW5kcyB3aWwgYmUgbWFya2VkIGFzIGluYWNjdXJhdGUuXHJcbiAgICogLSAnc2FmZVBhZGRpbmcnIC0gUGFkcyB0aGUgZmlsbGVkIGJvdW5kcyBieSBlbm91Z2ggdG8gY292ZXIgYWxsIGxpbmUgam9pbnMvY2Fwcy5cclxuICAgKiAtICdub25lJyAtIFJldHVybnMgQm91bmRzMi5OT1RISU5HLiBUaGUgYm91bmRzIHdpbGwgYmUgbWFya2VkIGFzIGluYWNjdXJhdGUuXHJcbiAgICogICAgICAgICAgICBOT1RFOiBJdCdzIGltcG9ydGFudCB0byBwcm92aWRlIGEgbG9jYWxCb3VuZHMgb3ZlcnJpZGUgaWYgeW91IHVzZSB0aGlzIG9wdGlvbiwgc28gaXRzIGJvdW5kcyBjb3ZlciB0aGVcclxuICAgKiAgICAgICAgICAgIFBhdGgncyBzaGFwZS4gKHBhdGgubG9jYWxCb3VuZHMgPSAuLi4pXHJcbiAgICovXHJcbiAgYm91bmRzTWV0aG9kPzogUGF0aEJvdW5kc01ldGhvZDtcclxufTtcclxudHlwZSBQYXJlbnRPcHRpb25zID0gUGFpbnRhYmxlT3B0aW9ucyAmIE5vZGVPcHRpb25zO1xyXG5leHBvcnQgdHlwZSBQYXRoT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGFyZW50T3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhdGggZXh0ZW5kcyBQYWludGFibGUoIE5vZGUgKSB7XHJcblxyXG4gIC8vIFRoZSBTaGFwZSB1c2VkIGZvciBkaXNwbGF5aW5nIHRoaXMgUGF0aC5cclxuICAvLyBOT1RFOiBfc2hhcGUgY2FuIGJlIGxhemlseSBjb25zdHJ1Y3RlZCBpbiBzdWJ0eXBlcyAobWF5IGJlIG51bGwpIGlmIGhhc1NoYXBlKCkgaXMgb3ZlcnJpZGRlbiB0byByZXR1cm4gdHJ1ZSxcclxuICAvLyAgICAgICBsaWtlIGluIFJlY3RhbmdsZS4gVGhpcyBpcyBiZWNhdXNlIHVzdWFsbHkgdGhlIGFjdHVhbCBTaGFwZSBpcyBhbHJlYWR5IGltcGxpZWQgYnkgb3RoZXIgcGFyYW1ldGVycyxcclxuICAvLyAgICAgICBzbyBpdCBpcyBiZXN0IHRvIG5vdCBoYXZlIHRvIGNvbXB1dGUgaXQgb24gY2hhbmdlcy5cclxuICAvLyBOT1RFOiBQbGVhc2UgdXNlIGhhc1NoYXBlKCkgdG8gZGV0ZXJtaW5lIGlmIHdlIGFyZSBhY3R1YWxseSBkcmF3aW5nIHRoaW5ncywgYXMgaXQgaXMgc3VidHlwZS1zYWZlLlxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gIHB1YmxpYyBfc2hhcGU6IFNoYXBlIHwgbnVsbDtcclxuXHJcbiAgLy8gVGhpcyBzdG9yZXMgYSBzdHJva2VkIGNvcHkgb2YgdGhlIFNoYXBlIHdoaWNoIGlzIGxhemlseSBjb21wdXRlZC4gVGhpcyBjYW4gYmUgcmVxdWlyZWQgZm9yIGNvbXB1dGluZyBib3VuZHNcclxuICAvLyBvZiBhIFNoYXBlIHdpdGggYSBzdHJva2UuXHJcbiAgcHJpdmF0ZSBfc3Ryb2tlZFNoYXBlOiBTaGFwZSB8IG51bGw7XHJcblxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gIHB1YmxpYyBfYm91bmRzTWV0aG9kOiBQYXRoQm91bmRzTWV0aG9kO1xyXG5cclxuICAvLyBVc2VkIGFzIGEgbGlzdGVuZXIgdG8gU2hhcGVzIGZvciB3aGVuIHRoZXkgYXJlIGludmFsaWRhdGVkLiBUaGUgbGlzdGVuZXJzIGFyZSBub3QgYWRkZWQgaWYgdGhlIFNoYXBlIGlzXHJcbiAgLy8gaW1tdXRhYmxlLCBhbmQgaWYgdGhlIFNoYXBlIGJlY29tZXMgaW1tdXRhYmxlLCB0aGVuIHRoZSBsaXN0ZW5lcnMgYXJlIHJlbW92ZWQuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBfaW52YWxpZFNoYXBlTGlzdGVuZXI6ICgpID0+IHZvaWQ7XHJcblxyXG4gIC8vIFdoZXRoZXIgb3VyIHNoYXBlIGxpc3RlbmVyIGlzIGF0dGFjaGVkIHRvIGEgc2hhcGUuXHJcbiAgcHJpdmF0ZSBfaW52YWxpZFNoYXBlTGlzdGVuZXJBdHRhY2hlZDogYm9vbGVhbjtcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIFBhdGggd2l0aCBhIGdpdmVuIHNoYXBlIHNwZWNpZmllciAoYSBTaGFwZSwgYSBzdHJpbmcgaW4gdGhlIFNWRyBwYXRoIGZvcm1hdCwgb3IgbnVsbCB0byBpbmRpY2F0ZSBub1xyXG4gICAqIHNoYXBlKS5cclxuICAgKlxyXG4gICAqIFBhdGggaGFzIHR3byBhZGRpdGlvbmFsIG9wdGlvbnMgKGFib3ZlIHdoYXQgTm9kZSBwcm92aWRlcyk6XHJcbiAgICogLSBzaGFwZTogVGhlIGFjdHVhbCBTaGFwZSAob3IgYSBzdHJpbmcgcmVwcmVzZW50aW5nIGFuIFNWRyBwYXRoLCBvciBudWxsKS5cclxuICAgKiAtIGJvdW5kc01ldGhvZDogRGV0ZXJtaW5lcyBob3cgdGhlIGJvdW5kcyBvZiBhIHNoYXBlIGFyZSBkZXRlcm1pbmVkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHNoYXBlIC0gVGhlIGluaXRpYWwgU2hhcGUgdG8gZGlzcGxheS4gU2VlIHNldFNoYXBlKCkgZm9yIG1vcmUgZGV0YWlscyBhbmQgZG9jdW1lbnRhdGlvbi5cclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc10gLSBQYXRoLXNwZWNpZmljIG9wdGlvbnMgYXJlIGRvY3VtZW50ZWQgaW4gUEFUSF9PUFRJT05fS0VZUyBhYm92ZSwgYW5kIGNhbiBiZSBwcm92aWRlZFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbG9uZy1zaWRlIG9wdGlvbnMgZm9yIE5vZGVcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNoYXBlOiBTaGFwZSB8IHN0cmluZyB8IG51bGwsIHByb3ZpZGVkT3B0aW9ucz86IFBhdGhPcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvdmlkZWRPcHRpb25zID09PSB1bmRlZmluZWQgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKCBwcm92aWRlZE9wdGlvbnMgKSA9PT0gT2JqZWN0LnByb3RvdHlwZSxcclxuICAgICAgJ0V4dHJhIHByb3RvdHlwZSBvbiBOb2RlIG9wdGlvbnMgb2JqZWN0IGlzIGEgY29kZSBzbWVsbCcgKTtcclxuXHJcbiAgICBpZiAoIHNoYXBlIHx8IHByb3ZpZGVkT3B0aW9ucz8uc2hhcGUgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFzaGFwZSB8fCAhcHJvdmlkZWRPcHRpb25zPy5zaGFwZSwgJ0RvIG5vdCBkZWZpbmUgc2hhcGUgdHdpY2UuIENoZWNrIGNvbnN0cnVjdG9yIGFuZCBwcm92aWRlZE9wdGlvbnMuJyApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UGF0aE9wdGlvbnMsIFNlbGZPcHRpb25zLCBQYXJlbnRPcHRpb25zPigpKCB7XHJcbiAgICAgIHNoYXBlOiBzaGFwZSxcclxuICAgICAgYm91bmRzTWV0aG9kOiBERUZBVUxUX09QVElPTlMuYm91bmRzTWV0aG9kXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIHRoaXMuX3NoYXBlID0gREVGQVVMVF9PUFRJT05TLnNoYXBlO1xyXG4gICAgdGhpcy5fc3Ryb2tlZFNoYXBlID0gbnVsbDtcclxuICAgIHRoaXMuX2JvdW5kc01ldGhvZCA9IERFRkFVTFRfT1BUSU9OUy5ib3VuZHNNZXRob2Q7XHJcbiAgICB0aGlzLl9pbnZhbGlkU2hhcGVMaXN0ZW5lciA9IHRoaXMuaW52YWxpZGF0ZVNoYXBlLmJpbmQoIHRoaXMgKTtcclxuICAgIHRoaXMuX2ludmFsaWRTaGFwZUxpc3RlbmVyQXR0YWNoZWQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmludmFsaWRhdGVTdXBwb3J0ZWRSZW5kZXJlcnMoKTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldFNoYXBlKCBzaGFwZTogU2hhcGUgfCBzdHJpbmcgfCBudWxsICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2hhcGUgPT09IG51bGwgfHwgdHlwZW9mIHNoYXBlID09PSAnc3RyaW5nJyB8fCBzaGFwZSBpbnN0YW5jZW9mIFNoYXBlLFxyXG4gICAgICAnQSBwYXRoXFwncyBzaGFwZSBzaG91bGQgZWl0aGVyIGJlIG51bGwsIGEgc3RyaW5nLCBvciBhIFNoYXBlJyApO1xyXG5cclxuICAgIGlmICggdGhpcy5fc2hhcGUgIT09IHNoYXBlICkge1xyXG4gICAgICAvLyBSZW1vdmUgU2hhcGUgaW52YWxpZGF0aW9uIGxpc3RlbmVyIGlmIGFwcGxpY2FibGVcclxuICAgICAgaWYgKCB0aGlzLl9pbnZhbGlkU2hhcGVMaXN0ZW5lckF0dGFjaGVkICkge1xyXG4gICAgICAgIHRoaXMuZGV0YWNoU2hhcGVMaXN0ZW5lcigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIHR5cGVvZiBzaGFwZSA9PT0gJ3N0cmluZycgKSB7XHJcbiAgICAgICAgLy8gYmUgY29udGVudCB3aXRoIHNldFNoYXBlIGFsd2F5cyBpbnZhbGlkYXRpbmcgdGhlIHNoYXBlP1xyXG4gICAgICAgIHNoYXBlID0gbmV3IFNoYXBlKCBzaGFwZSApO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuX3NoYXBlID0gc2hhcGU7XHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZVNoYXBlKCk7XHJcblxyXG4gICAgICAvLyBBZGQgU2hhcGUgaW52YWxpZGF0aW9uIGxpc3RlbmVyIGlmIGFwcGxpY2FibGVcclxuICAgICAgaWYgKCB0aGlzLl9zaGFwZSAmJiAhdGhpcy5fc2hhcGUuaXNJbW11dGFibGUoKSApIHtcclxuICAgICAgICB0aGlzLmF0dGFjaFNoYXBlTGlzdGVuZXIoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHNoYXBlKCB2YWx1ZTogU2hhcGUgfCBzdHJpbmcgfCBudWxsICkgeyB0aGlzLnNldFNoYXBlKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgc2hhcGUoKTogU2hhcGUgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0U2hhcGUoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBzaGFwZSB0aGF0IHdhcyBzZXQgZm9yIHRoaXMgUGF0aCAob3IgZm9yIHN1YnR5cGVzIGxpa2UgTGluZSBhbmQgUmVjdGFuZ2xlLCB3aWxsIHJldHVybiBhbiBpbW11dGFibGVcclxuICAgKiBTaGFwZSB0aGF0IGlzIGVxdWl2YWxlbnQgaW4gYXBwZWFyYW5jZSkuXHJcbiAgICpcclxuICAgKiBJdCBpcyBiZXN0IHRvIGdlbmVyYWxseSBhc3N1bWUgbW9kaWZpY2F0aW9ucyB0byB0aGUgU2hhcGUgcmV0dXJuZWQgaXMgbm90IHN1cHBvcnRlZC4gSWYgdGhlcmUgaXMgbm8gc2hhcGVcclxuICAgKiBjdXJyZW50bHksIG51bGwgd2lsbCBiZSByZXR1cm5lZC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0U2hhcGUoKTogU2hhcGUgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9zaGFwZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBsYXppbHktY3JlYXRlZCBTaGFwZSB0aGF0IGhhcyB0aGUgYXBwZWFyYW5jZSBvZiB0aGUgUGF0aCdzIHNoYXBlIGJ1dCBzdHJva2VkIHVzaW5nIHRoZSBjdXJyZW50XHJcbiAgICogc3Ryb2tlIHN0eWxlIG9mIHRoZSBQYXRoLlxyXG4gICAqXHJcbiAgICogTk9URTogSXQgaXMgaW52YWxpZCB0byBjYWxsIHRoaXMgb24gYSBQYXRoIHRoYXQgZG9lcyBub3QgY3VycmVudGx5IGhhdmUgYSBTaGFwZSAodXN1YWxseSBhIFBhdGggd2hlcmVcclxuICAgKiAgICAgICB0aGUgc2hhcGUgaXMgc2V0IHRvIG51bGwpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRTdHJva2VkU2hhcGUoKTogU2hhcGUge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5oYXNTaGFwZSgpLCAnV2UgY2Fubm90IHN0cm9rZSBhIG5vbi1leGlzdGluZyBzaGFwZScgKTtcclxuXHJcbiAgICAvLyBMYXppbHkgY29tcHV0ZSB0aGUgc3Ryb2tlZCBzaGFwZS4gSXQgc2hvdWxkIGJlIHNldCB0byBudWxsIHdoZW4gd2UgbmVlZCB0byByZWNvbXB1dGUgaXRcclxuICAgIGlmICggIXRoaXMuX3N0cm9rZWRTaGFwZSApIHtcclxuICAgICAgdGhpcy5fc3Ryb2tlZFNoYXBlID0gdGhpcy5nZXRTaGFwZSgpIS5nZXRTdHJva2VkU2hhcGUoIHRoaXMuX2xpbmVEcmF3aW5nU3R5bGVzICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuX3N0cm9rZWRTaGFwZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBiaXRtYXNrIHJlcHJlc2VudGluZyB0aGUgc3VwcG9ydGVkIHJlbmRlcmVycyBmb3IgdGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbiBvZiB0aGUgUGF0aCBvciBzdWJ0eXBlLlxyXG4gICAqXHJcbiAgICogU2hvdWxkIGJlIG92ZXJyaWRkZW4gYnkgc3VidHlwZXMgdG8gZWl0aGVyIGV4dGVuZCBvciByZXN0cmljdCByZW5kZXJlcnMsIGRlcGVuZGluZyBvbiB3aGF0IHJlbmRlcmVycyBhcmVcclxuICAgKiBzdXBwb3J0ZWQuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyAtIEEgYml0bWFzayB0aGF0IGluY2x1ZGVzIHN1cHBvcnRlZCByZW5kZXJlcnMsIHNlZSBSZW5kZXJlciBmb3IgZGV0YWlscy5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgZ2V0UGF0aFJlbmRlcmVyQml0bWFzaygpOiBudW1iZXIge1xyXG4gICAgLy8gQnkgZGVmYXVsdCwgQ2FudmFzIGFuZCBTVkcgYXJlIGFjY2VwdGVkLlxyXG4gICAgcmV0dXJuIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgfCBSZW5kZXJlci5iaXRtYXNrU1ZHO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZ2dlcnMgYSBjaGVjayBhbmQgdXBkYXRlIGZvciB3aGF0IHJlbmRlcmVycyB0aGUgY3VycmVudCBjb25maWd1cmF0aW9uIG9mIHRoaXMgUGF0aCBvciBzdWJ0eXBlIHN1cHBvcnRzLlxyXG4gICAqIFRoaXMgc2hvdWxkIGJlIGNhbGxlZCB3aGVuZXZlciBzb21ldGhpbmcgdGhhdCBjb3VsZCBwb3RlbnRpYWxseSBjaGFuZ2Ugc3VwcG9ydGVkIHJlbmRlcmVycyBoYXBwZW4gKHdoaWNoIGNhblxyXG4gICAqIGJlIHRoZSBzaGFwZSwgcHJvcGVydGllcyBvZiB0aGUgc3Ryb2tlcyBvciBmaWxscywgZXRjLilcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgaW52YWxpZGF0ZVN1cHBvcnRlZFJlbmRlcmVycygpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0UmVuZGVyZXJCaXRtYXNrKCB0aGlzLmdldEZpbGxSZW5kZXJlckJpdG1hc2soKSAmIHRoaXMuZ2V0U3Ryb2tlUmVuZGVyZXJCaXRtYXNrKCkgJiB0aGlzLmdldFBhdGhSZW5kZXJlckJpdG1hc2soKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTm90aWZpZXMgdGhlIFBhdGggdGhhdCB0aGUgU2hhcGUgaGFzIGNoYW5nZWQgKGVpdGhlciB0aGUgU2hhcGUgaXRzZWxmIGhhcyBiZSBtdXRhdGVkLCBhIG5ldyBTaGFwZSBoYXMgYmVlblxyXG4gICAqIHByb3ZpZGVkKS5cclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgc2hvdWxkIG5vdCBiZSBjYWxsZWQgb24gc3VidHlwZXMgb2YgUGF0aCBhZnRlciB0aGV5IGhhdmUgYmVlbiBjb25zdHJ1Y3RlZCwgbGlrZSBMaW5lLCBSZWN0YW5nbGUsIGV0Yy5cclxuICAgKi9cclxuICBwcml2YXRlIGludmFsaWRhdGVTaGFwZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuaW52YWxpZGF0ZVBhdGgoKTtcclxuXHJcbiAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xyXG4gICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVFBhdGhEcmF3YWJsZSApLm1hcmtEaXJ0eVNoYXBlKCk7IC8vIHN1YnR5cGVzIG9mIFBhdGggbWF5IG5vdCBoYXZlIHRoaXMsIGJ1dCBpdCdzIGNhbGxlZCBkdXJpbmcgY29uc3RydWN0aW9uXHJcbiAgICB9XHJcblxyXG4gICAgLy8gRGlzY29ubmVjdCBvdXIgU2hhcGUgbGlzdGVuZXIgaWYgb3VyIFNoYXBlIGhhcyBiZWNvbWUgaW1tdXRhYmxlLlxyXG4gICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzI3MCNpc3N1ZWNvbW1lbnQtMjUwMjY2MTc0XHJcbiAgICBpZiAoIHRoaXMuX2ludmFsaWRTaGFwZUxpc3RlbmVyQXR0YWNoZWQgJiYgdGhpcy5fc2hhcGUgJiYgdGhpcy5fc2hhcGUuaXNJbW11dGFibGUoKSApIHtcclxuICAgICAgdGhpcy5kZXRhY2hTaGFwZUxpc3RlbmVyKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnZhbGlkYXRlcyB0aGUgbm9kZSdzIHNlbGYtYm91bmRzIGFuZCBhbnkgb3RoZXIgcmVjb3JkZWQgbWV0YWRhdGEgYWJvdXQgdGhlIG91dGxpbmUgb3IgYm91bmRzIG9mIHRoZSBTaGFwZS5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgbWVhbnQgdG8gYmUgdXNlZCBmb3IgYWxsIFBhdGggc3VidHlwZXMgKHVubGlrZSBpbnZhbGlkYXRlU2hhcGUpLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBpbnZhbGlkYXRlUGF0aCgpOiB2b2lkIHtcclxuICAgIHRoaXMuX3N0cm9rZWRTaGFwZSA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5pbnZhbGlkYXRlU2VsZigpOyAvLyBXZSBkb24ndCBpbW1lZGlhdGVseSBjb21wdXRlIHRoZSBib3VuZHNcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGFjaGVzIGEgbGlzdGVuZXIgdG8gb3VyIFNoYXBlIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbmV2ZXIgdGhlIFNoYXBlIGNoYW5nZXMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhdHRhY2hTaGFwZUxpc3RlbmVyKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuX2ludmFsaWRTaGFwZUxpc3RlbmVyQXR0YWNoZWQsICdXZSBkbyBub3Qgd2FudCB0byBoYXZlIHR3byBsaXN0ZW5lcnMgYXR0YWNoZWQhJyApO1xyXG5cclxuICAgIC8vIERvIG5vdCBhdHRhY2ggc2hhcGUgbGlzdGVuZXJzIGlmIHdlIGFyZSBkaXNwb3NlZFxyXG4gICAgaWYgKCAhdGhpcy5pc0Rpc3Bvc2VkICkge1xyXG4gICAgICB0aGlzLl9zaGFwZSEuaW52YWxpZGF0ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLl9pbnZhbGlkU2hhcGVMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLl9pbnZhbGlkU2hhcGVMaXN0ZW5lckF0dGFjaGVkID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGFjaGVzIGEgcHJldmlvdXNseS1hdHRhY2hlZCBsaXN0ZW5lciBhZGRlZCB0byBvdXIgU2hhcGUgKHNlZSBhdHRhY2hTaGFwZUxpc3RlbmVyKS5cclxuICAgKi9cclxuICBwcml2YXRlIGRldGFjaFNoYXBlTGlzdGVuZXIoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9pbnZhbGlkU2hhcGVMaXN0ZW5lckF0dGFjaGVkLCAnV2UgY2Fubm90IGRldGFjaCBhbiB1bmF0dGFjaGVkIGxpc3RlbmVyJyApO1xyXG5cclxuICAgIHRoaXMuX3NoYXBlIS5pbnZhbGlkYXRlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuX2ludmFsaWRTaGFwZUxpc3RlbmVyICk7XHJcbiAgICB0aGlzLl9pbnZhbGlkU2hhcGVMaXN0ZW5lckF0dGFjaGVkID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wdXRlcyBhIG1vcmUgZWZmaWNpZW50IHNlbGZCb3VuZHMgZm9yIG91ciBQYXRoLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgLSBXaGV0aGVyIHRoZSBzZWxmIGJvdW5kcyBjaGFuZ2VkLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBvdmVycmlkZSB1cGRhdGVTZWxmQm91bmRzKCk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3Qgc2VsZkJvdW5kcyA9IHRoaXMuaGFzU2hhcGUoKSA/IHRoaXMuY29tcHV0ZVNoYXBlQm91bmRzKCkgOiBCb3VuZHMyLk5PVEhJTkc7XHJcbiAgICBjb25zdCBjaGFuZ2VkID0gIXNlbGZCb3VuZHMuZXF1YWxzKCB0aGlzLnNlbGZCb3VuZHNQcm9wZXJ0eS5fdmFsdWUgKTtcclxuICAgIGlmICggY2hhbmdlZCApIHtcclxuICAgICAgdGhpcy5zZWxmQm91bmRzUHJvcGVydHkuX3ZhbHVlLnNldCggc2VsZkJvdW5kcyApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNoYW5nZWQ7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0Qm91bmRzTWV0aG9kKCBib3VuZHNNZXRob2Q6IFBhdGhCb3VuZHNNZXRob2QgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBib3VuZHNNZXRob2QgPT09ICdhY2N1cmF0ZScgfHxcclxuICAgICAgICAgICAgICAgICAgICAgIGJvdW5kc01ldGhvZCA9PT0gJ3Vuc3Ryb2tlZCcgfHxcclxuICAgICAgICAgICAgICAgICAgICAgIGJvdW5kc01ldGhvZCA9PT0gJ3RpZ2h0UGFkZGluZycgfHxcclxuICAgICAgICAgICAgICAgICAgICAgIGJvdW5kc01ldGhvZCA9PT0gJ3NhZmVQYWRkaW5nJyB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgYm91bmRzTWV0aG9kID09PSAnbm9uZScgKTtcclxuICAgIGlmICggdGhpcy5fYm91bmRzTWV0aG9kICE9PSBib3VuZHNNZXRob2QgKSB7XHJcbiAgICAgIHRoaXMuX2JvdW5kc01ldGhvZCA9IGJvdW5kc01ldGhvZDtcclxuICAgICAgdGhpcy5pbnZhbGlkYXRlUGF0aCgpO1xyXG5cclxuICAgICAgdGhpcy5yZW5kZXJlclN1bW1hcnlSZWZyZXNoRW1pdHRlci5lbWl0KCk7IC8vIHdoZXRoZXIgb3VyIHNlbGYgYm91bmRzIGFyZSB2YWxpZCBtYXkgaGF2ZSBjaGFuZ2VkXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgYm91bmRzTWV0aG9kKCB2YWx1ZTogUGF0aEJvdW5kc01ldGhvZCApIHsgdGhpcy5zZXRCb3VuZHNNZXRob2QoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBib3VuZHNNZXRob2QoKTogUGF0aEJvdW5kc01ldGhvZCB7IHJldHVybiB0aGlzLmdldEJvdW5kc01ldGhvZCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGN1cnJlbnQgYm91bmRzIG1ldGhvZC4gU2VlIHNldEJvdW5kc01ldGhvZCBmb3IgZGV0YWlscy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Qm91bmRzTWV0aG9kKCk6IFBhdGhCb3VuZHNNZXRob2Qge1xyXG4gICAgcmV0dXJuIHRoaXMuX2JvdW5kc01ldGhvZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbXB1dGVzIHRoZSBib3VuZHMgb2YgdGhlIFBhdGggKG9yIHN1YnR5cGUgd2hlbiBvdmVycmlkZGVuKS4gTWVhbnQgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJ0eXBlcyBmb3IgbW9yZVxyXG4gICAqIGVmZmljaWVudCBib3VuZHMgY29tcHV0YXRpb25zIChidXQgdGhpcyB3aWxsIHdvcmsgYXMgYSBmYWxsYmFjaykuIEluY2x1ZGVzIHRoZSBzdHJva2VkIHJlZ2lvbiBpZiB0aGVyZSBpcyBhXHJcbiAgICogc3Ryb2tlIGFwcGxpZWQgdG8gdGhlIFBhdGguXHJcbiAgICovXHJcbiAgcHVibGljIGNvbXB1dGVTaGFwZUJvdW5kcygpOiBCb3VuZHMyIHtcclxuICAgIGNvbnN0IHNoYXBlID0gdGhpcy5nZXRTaGFwZSgpO1xyXG4gICAgLy8gYm91bmRzTWV0aG9kOiAnbm9uZScgd2lsbCByZXR1cm4gbm8gYm91bmRzXHJcbiAgICBpZiAoIHRoaXMuX2JvdW5kc01ldGhvZCA9PT0gJ25vbmUnIHx8ICFzaGFwZSApIHtcclxuICAgICAgcmV0dXJuIEJvdW5kczIuTk9USElORztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBib3VuZHNNZXRob2Q6ICd1bnN0cm9rZWQnLCBvciBhbnl0aGluZyB3aXRob3V0IGEgc3Ryb2tlIHdpbGwgdGhlbiBqdXN0IHVzZSB0aGUgbm9ybWFsIHNoYXBlIGJvdW5kc1xyXG4gICAgICBpZiAoICF0aGlzLmhhc1BhaW50YWJsZVN0cm9rZSgpIHx8IHRoaXMuX2JvdW5kc01ldGhvZCA9PT0gJ3Vuc3Ryb2tlZCcgKSB7XHJcbiAgICAgICAgcmV0dXJuIHNoYXBlLmJvdW5kcztcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyAnYWNjdXJhdGUnIHdpbGwgYWx3YXlzIHJlcXVpcmUgY29tcHV0aW5nIHRoZSBmdWxsIHN0cm9rZWQgc2hhcGUsIGFuZCB0YWtpbmcgaXRzIGJvdW5kc1xyXG4gICAgICAgIGlmICggdGhpcy5fYm91bmRzTWV0aG9kID09PSAnYWNjdXJhdGUnICkge1xyXG4gICAgICAgICAgcmV0dXJuIHNoYXBlLmdldFN0cm9rZWRCb3VuZHMoIHRoaXMuZ2V0TGluZVN0eWxlcygpICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIHdlIGNvbXB1dGUgYm91bmRzIGJhc2VkIG9uICd0aWdodFBhZGRpbmcnIGFuZCAnc2FmZVBhZGRpbmcnLCB0aGUgb25lIGRpZmZlcmVuY2UgYmVpbmcgdGhhdFxyXG4gICAgICAgICAgLy8gJ3NhZmVQYWRkaW5nJyB3aWxsIGluY2x1ZGUgd2hhdGV2ZXIgYm91bmRzIG5lY2Vzc2FyeSB0byBpbmNsdWRlIG1pdGVycy4gU3F1YXJlIGxpbmUtY2FwIHJlcXVpcmVzIGFcclxuICAgICAgICAvLyBzbGlnaHRseSBleHRlbmRlZCBib3VuZHMgaW4gZWl0aGVyIGNhc2UuXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBsZXQgZmFjdG9yO1xyXG4gICAgICAgICAgLy8gSWYgbWl0ZXJMZW5ndGggKGluc2lkZSBjb3JuZXIgdG8gb3V0c2lkZSBjb3JuZXIpIGV4Y2VlZHMgbWl0ZXJMaW1pdCAqIHN0cm9rZVdpZHRoLCBpdCB3aWxsIGdldCB0dXJuZWQgdG9cclxuICAgICAgICAgIC8vIGEgYmV2ZWwsIHNvIG91ciBmYWN0b3Igd2lsbCBiZSBiYXNlZCBqdXN0IG9uIHRoZSBtaXRlckxpbWl0LlxyXG4gICAgICAgICAgaWYgKCB0aGlzLl9ib3VuZHNNZXRob2QgPT09ICdzYWZlUGFkZGluZycgJiYgdGhpcy5nZXRMaW5lSm9pbigpID09PSAnbWl0ZXInICkge1xyXG4gICAgICAgICAgICBmYWN0b3IgPSB0aGlzLmdldE1pdGVyTGltaXQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCB0aGlzLmdldExpbmVDYXAoKSA9PT0gJ3NxdWFyZScgKSB7XHJcbiAgICAgICAgICAgIGZhY3RvciA9IE1hdGguU1FSVDI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZmFjdG9yID0gMTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBzaGFwZS5ib3VuZHMuZGlsYXRlZCggZmFjdG9yICogdGhpcy5nZXRMaW5lV2lkdGgoKSAvIDIgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgdGhpcyBOb2RlJ3Mgc2VsZkJvdW5kcyBhcmUgY29uc2lkZXJlZCB0byBiZSB2YWxpZCAoYWx3YXlzIGNvbnRhaW5pbmcgdGhlIGRpc3BsYXllZCBzZWxmIGNvbnRlbnRcclxuICAgKiBvZiB0aGlzIG5vZGUpLiBNZWFudCB0byBiZSBvdmVycmlkZGVuIGluIHN1YnR5cGVzIHdoZW4gdGhpcyBjYW4gY2hhbmdlIChlLmcuIFRleHQpLlxyXG4gICAqXHJcbiAgICogSWYgdGhpcyB2YWx1ZSB3b3VsZCBwb3RlbnRpYWxseSBjaGFuZ2UsIHBsZWFzZSB0cmlnZ2VyIHRoZSBldmVudCAnc2VsZkJvdW5kc1ZhbGlkJy5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgYXJlU2VsZkJvdW5kc1ZhbGlkKCk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCB0aGlzLl9ib3VuZHNNZXRob2QgPT09ICdhY2N1cmF0ZScgfHwgdGhpcy5fYm91bmRzTWV0aG9kID09PSAnc2FmZVBhZGRpbmcnICkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLl9ib3VuZHNNZXRob2QgPT09ICdub25lJyApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiAhdGhpcy5oYXNTdHJva2UoKTsgLy8gJ3RpZ2h0UGFkZGluZycgYW5kICd1bnN0cm9rZWQnIG9wdGlvbnNcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgb3VyIHNlbGYgYm91bmRzIHdoZW4gb3VyIHJlbmRlcmVkIHNlbGYgaXMgdHJhbnNmb3JtZWQgYnkgdGhlIG1hdHJpeC5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0VHJhbnNmb3JtZWRTZWxmQm91bmRzKCBtYXRyaXg6IE1hdHJpeDMgKTogQm91bmRzMiB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmhhc1NoYXBlKCkgKTtcclxuXHJcbiAgICByZXR1cm4gKCB0aGlzLl9zdHJva2UgPyB0aGlzLmdldFN0cm9rZWRTaGFwZSgpIDogdGhpcy5nZXRTaGFwZSgpICkhLmdldEJvdW5kc1dpdGhUcmFuc2Zvcm0oIG1hdHJpeCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBvdXIgc2FmZSBzZWxmIGJvdW5kcyB3aGVuIG91ciByZW5kZXJlZCBzZWxmIGlzIHRyYW5zZm9ybWVkIGJ5IHRoZSBtYXRyaXguXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGdldFRyYW5zZm9ybWVkU2FmZVNlbGZCb3VuZHMoIG1hdHJpeDogTWF0cml4MyApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLmdldFRyYW5zZm9ybWVkU2VsZkJvdW5kcyggbWF0cml4ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgZnJvbSAoYW5kIG92ZXJyaWRkZW4gaW4pIHRoZSBQYWludGFibGUgdHJhaXQsIGludmFsaWRhdGVzIG91ciBjdXJyZW50IHN0cm9rZSwgdHJpZ2dlcmluZyByZWNvbXB1dGF0aW9uIG9mXHJcbiAgICogYW55dGhpbmcgdGhhdCBkZXBlbmRlZCBvbiB0aGUgb2xkIHN0cm9rZSdzIHZhbHVlLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgaW52YWxpZGF0ZVN0cm9rZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuaW52YWxpZGF0ZVBhdGgoKTtcclxuXHJcbiAgICB0aGlzLnJlbmRlcmVyU3VtbWFyeVJlZnJlc2hFbWl0dGVyLmVtaXQoKTsgLy8gU3Ryb2tlIGNoYW5naW5nIGNvdWxkIGhhdmUgY2hhbmdlZCBvdXIgc2VsZi1ib3VuZHMtdmFsaWRpdGl0eSAodW5zdHJva2VkL2V0YylcclxuXHJcbiAgICBzdXBlci5pbnZhbGlkYXRlU3Ryb2tlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBQYXRoIGhhcyBhbiBhc3NvY2lhdGVkIFNoYXBlIChpbnN0ZWFkIG9mIG5vIHNoYXBlLCByZXByZXNlbnRlZCBieSBudWxsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBoYXNTaGFwZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAhIXRoaXMuX3NoYXBlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRHJhd3MgdGhlIGN1cnJlbnQgTm9kZSdzIHNlbGYgcmVwcmVzZW50YXRpb24sIGFzc3VtaW5nIHRoZSB3cmFwcGVyJ3MgQ2FudmFzIGNvbnRleHQgaXMgYWxyZWFkeSBpbiB0aGUgbG9jYWxcclxuICAgKiBjb29yZGluYXRlIGZyYW1lIG9mIHRoaXMgbm9kZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB3cmFwcGVyXHJcbiAgICogQHBhcmFtIG1hdHJpeCAtIFRoZSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggYWxyZWFkeSBhcHBsaWVkIHRvIHRoZSBjb250ZXh0LlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBvdmVycmlkZSBjYW52YXNQYWludFNlbGYoIHdyYXBwZXI6IENhbnZhc0NvbnRleHRXcmFwcGVyLCBtYXRyaXg6IE1hdHJpeDMgKTogdm9pZCB7XHJcbiAgICAvL1RPRE86IEhhdmUgYSBzZXBhcmF0ZSBtZXRob2QgZm9yIHRoaXMsIGluc3RlYWQgb2YgdG91Y2hpbmcgdGhlIHByb3RvdHlwZS4gQ2FuIG1ha2UgJ3RoaXMnIHJlZmVyZW5jZXMgdG9vIGVhc2lseS5cclxuICAgIFBhdGhDYW52YXNEcmF3YWJsZS5wcm90b3R5cGUucGFpbnRDYW52YXMoIHdyYXBwZXIsIHRoaXMsIG1hdHJpeCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIFNWRyBkcmF3YWJsZSBmb3IgdGhpcyBQYXRoLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKlxyXG4gICAqIEBwYXJhbSByZW5kZXJlciAtIEluIHRoZSBiaXRtYXNrIGZvcm1hdCBzcGVjaWZpZWQgYnkgUmVuZGVyZXIsIHdoaWNoIG1heSBjb250YWluIGFkZGl0aW9uYWwgYml0IGZsYWdzLlxyXG4gICAqIEBwYXJhbSBpbnN0YW5jZSAtIEluc3RhbmNlIG9iamVjdCB0aGF0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBkcmF3YWJsZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBjcmVhdGVTVkdEcmF3YWJsZSggcmVuZGVyZXI6IG51bWJlciwgaW5zdGFuY2U6IEluc3RhbmNlICk6IFNWR1NlbGZEcmF3YWJsZSB7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICByZXR1cm4gUGF0aFNWR0RyYXdhYmxlLmNyZWF0ZUZyb21Qb29sKCByZW5kZXJlciwgaW5zdGFuY2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBDYW52YXMgZHJhd2FibGUgZm9yIHRoaXMgUGF0aC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcmVuZGVyZXIgLSBJbiB0aGUgYml0bWFzayBmb3JtYXQgc3BlY2lmaWVkIGJ5IFJlbmRlcmVyLCB3aGljaCBtYXkgY29udGFpbiBhZGRpdGlvbmFsIGJpdCBmbGFncy5cclxuICAgKiBAcGFyYW0gaW5zdGFuY2UgLSBJbnN0YW5jZSBvYmplY3QgdGhhdCB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZHJhd2FibGVcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgY3JlYXRlQ2FudmFzRHJhd2FibGUoIHJlbmRlcmVyOiBudW1iZXIsIGluc3RhbmNlOiBJbnN0YW5jZSApOiBDYW52YXNTZWxmRHJhd2FibGUge1xyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgcmV0dXJuIFBhdGhDYW52YXNEcmF3YWJsZS5jcmVhdGVGcm9tUG9vbCggcmVuZGVyZXIsIGluc3RhbmNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoaXMgTm9kZSBpdHNlbGYgaXMgcGFpbnRlZCAoZGlzcGxheXMgc29tZXRoaW5nIGl0c2VsZikuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGlzUGFpbnRlZCgpOiBib29sZWFuIHtcclxuICAgIC8vIEFsd2F5cyB0cnVlIGZvciBQYXRoIG5vZGVzXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbXB1dGVzIHdoZXRoZXIgdGhlIHByb3ZpZGVkIHBvaW50IGlzIFwiaW5zaWRlXCIgKGNvbnRhaW5lZCkgaW4gdGhpcyBQYXRoJ3Mgc2VsZiBjb250ZW50LCBvciBcIm91dHNpZGVcIi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwb2ludCAtIENvbnNpZGVyZWQgdG8gYmUgaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWVcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgY29udGFpbnNQb2ludFNlbGYoIHBvaW50OiBWZWN0b3IyICk6IGJvb2xlYW4ge1xyXG4gICAgbGV0IHJlc3VsdCA9IGZhbHNlO1xyXG4gICAgaWYgKCAhdGhpcy5oYXNTaGFwZSgpICkge1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIHRoaXMgbm9kZSBpcyBmaWxsUGlja2FibGUsIHdlIHdpbGwgcmV0dXJuIHRydWUgaWYgdGhlIHBvaW50IGlzIGluc2lkZSBvdXIgZmlsbCBhcmVhXHJcbiAgICBpZiAoIHRoaXMuX2ZpbGxQaWNrYWJsZSApIHtcclxuICAgICAgcmVzdWx0ID0gdGhpcy5nZXRTaGFwZSgpIS5jb250YWluc1BvaW50KCBwb2ludCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFsc28gaW5jbHVkZSB0aGUgc3Ryb2tlZCByZWdpb24gaW4gdGhlIGhpdCBhcmVhIGlmIHN0cm9rZVBpY2thYmxlXHJcbiAgICBpZiAoICFyZXN1bHQgJiYgdGhpcy5fc3Ryb2tlUGlja2FibGUgKSB7XHJcbiAgICAgIHJlc3VsdCA9IHRoaXMuZ2V0U3Ryb2tlZFNoYXBlKCkuY29udGFpbnNQb2ludCggcG9pbnQgKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgU2hhcGUgdGhhdCByZXByZXNlbnRzIHRoZSBhcmVhIGNvdmVyZWQgYnkgY29udGFpbnNQb2ludFNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGdldFNlbGZTaGFwZSgpOiBTaGFwZSB7XHJcbiAgICByZXR1cm4gU2hhcGUudW5pb24oIFtcclxuICAgICAgLi4uKCAoIHRoaXMuaGFzU2hhcGUoKSAmJiB0aGlzLl9maWxsUGlja2FibGUgKSA/IFsgdGhpcy5nZXRTaGFwZSgpISBdIDogW10gKSxcclxuICAgICAgLi4uKCAoIHRoaXMuaGFzU2hhcGUoKSAmJiB0aGlzLl9zdHJva2VQaWNrYWJsZSApID8gWyB0aGlzLmdldFN0cm9rZWRTaGFwZSgpIF0gOiBbXSApXHJcbiAgICBdICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBQYXRoJ3Mgc2VsZkJvdW5kcyBpcyBpbnRlcnNlY3RlZCBieSB0aGUgc3BlY2lmaWVkIGJvdW5kcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBib3VuZHMgLSBCb3VuZHMgdG8gdGVzdCwgYXNzdW1lZCB0byBiZSBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZS5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgaW50ZXJzZWN0c0JvdW5kc1NlbGYoIGJvdW5kczogQm91bmRzMiApOiBib29sZWFuIHtcclxuICAgIC8vIFRPRE86IHNob3VsZCBhIHNoYXBlJ3Mgc3Ryb2tlIGJlIGluY2x1ZGVkP1xyXG4gICAgcmV0dXJuIHRoaXMuX3NoYXBlID8gdGhpcy5fc2hhcGUuaW50ZXJzZWN0c0JvdW5kcyggYm91bmRzICkgOiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB3ZSBuZWVkIHRvIGFwcGx5IGEgdHJhbnNmb3JtIHdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xOTYsIHdoaWNoXHJcbiAgICogb25seSBhcHBsaWVzIHdoZW4gd2UgaGF2ZSBhIHBhdHRlcm4gb3IgZ3JhZGllbnQgKGUuZy4gc3VidHlwZXMgb2YgUGFpbnQpLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgcmVxdWlyZXNTVkdCb3VuZHNXb3JrYXJvdW5kKCk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCAhdGhpcy5fc3Ryb2tlIHx8ICEoIHRoaXMuX3N0cm9rZSBpbnN0YW5jZW9mIFBhaW50ICkgfHwgIXRoaXMuaGFzU2hhcGUoKSApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJvdW5kcyA9IHRoaXMuY29tcHV0ZVNoYXBlQm91bmRzKCk7XHJcbiAgICByZXR1cm4gYm91bmRzLnggKiBib3VuZHMueSA9PT0gMDsgLy8gYXQgbGVhc3Qgb25lIG9mIHRoZW0gd2FzIHplcm8sIHNvIHRoZSBib3VuZGluZyBib3ggaGFzIG5vIGFyZWFcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE92ZXJyaWRlIGZvciBleHRyYSBpbmZvcm1hdGlvbiBpbiB0aGUgZGVidWdnaW5nIG91dHB1dCAoZnJvbSBEaXNwbGF5LmdldERlYnVnSFRNTCgpKS4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGdldERlYnVnSFRNTEV4dHJhcygpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NoYXBlID8gYCAoPHNwYW4gc3R5bGU9XCJjb2xvcjogIzg4ZlwiIG9uY2xpY2s9XCJ3aW5kb3cub3BlbiggJ2RhdGE6dGV4dC9wbGFpbjtjaGFyc2V0PXV0Zi04LCcgKyBlbmNvZGVVUklDb21wb25lbnQoICcke3RoaXMuX3NoYXBlLmdldFNWR1BhdGgoKX0nICkgKTtcIj5wYXRoPC9zcGFuPilgIDogJyc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwb3NlcyB0aGUgcGF0aCwgcmVsZWFzaW5nIHNoYXBlIGxpc3RlbmVycyBpZiBuZWVkZWQgKGFuZCBwcmV2ZW50aW5nIG5ldyBsaXN0ZW5lcnMgZnJvbSBiZWluZyBhZGRlZCkuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBpZiAoIHRoaXMuX2ludmFsaWRTaGFwZUxpc3RlbmVyQXR0YWNoZWQgKSB7XHJcbiAgICAgIHRoaXMuZGV0YWNoU2hhcGVMaXN0ZW5lcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBtdXRhdGUoIG9wdGlvbnM/OiBQYXRoT3B0aW9ucyApOiB0aGlzIHtcclxuICAgIHJldHVybiBzdXBlci5tdXRhdGUoIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8vIEluaXRpYWwgdmFsdWVzIGZvciBtb3N0IE5vZGUgbXV0YXRvciBvcHRpb25zXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBERUZBVUxUX1BBVEhfT1BUSU9OUyA9IGNvbWJpbmVPcHRpb25zPFBhdGhPcHRpb25zPigge30sIE5vZGUuREVGQVVMVF9OT0RFX09QVElPTlMsIERFRkFVTFRfT1BUSU9OUyApO1xyXG59XHJcblxyXG4vKipcclxuICoge0FycmF5LjxzdHJpbmc+fSAtIFN0cmluZyBrZXlzIGZvciBhbGwgb2YgdGhlIGFsbG93ZWQgb3B0aW9ucyB0aGF0IHdpbGwgYmUgc2V0IGJ5IG5vZGUubXV0YXRlKCBvcHRpb25zICksIGluIHRoZVxyXG4gKiBvcmRlciB0aGV5IHdpbGwgYmUgZXZhbHVhdGVkIGluLlxyXG4gKlxyXG4gKiBOT1RFOiBTZWUgTm9kZSdzIF9tdXRhdG9yS2V5cyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGhvdyB0aGlzIG9wZXJhdGVzLCBhbmQgcG90ZW50aWFsIHNwZWNpYWxcclxuICogICAgICAgY2FzZXMgdGhhdCBtYXkgYXBwbHkuXHJcbiAqL1xyXG5QYXRoLnByb3RvdHlwZS5fbXV0YXRvcktleXMgPSBbIC4uLlBBSU5UQUJMRV9PUFRJT05fS0VZUywgLi4uUEFUSF9PUFRJT05fS0VZUywgLi4uTm9kZS5wcm90b3R5cGUuX211dGF0b3JLZXlzIF07XHJcblxyXG4vKipcclxuICoge0FycmF5LjxTdHJpbmc+fSAtIExpc3Qgb2YgYWxsIGRpcnR5IGZsYWdzIHRoYXQgc2hvdWxkIGJlIGF2YWlsYWJsZSBvbiBkcmF3YWJsZXMgY3JlYXRlZCBmcm9tIHRoaXMgbm9kZSAob3JcclxuICogICAgICAgICAgICAgICAgICAgIHN1YnR5cGUpLiBHaXZlbiBhIGZsYWcgKGUuZy4gcmFkaXVzKSwgaXQgaW5kaWNhdGVzIHRoZSBleGlzdGVuY2Ugb2YgYSBmdW5jdGlvblxyXG4gKiAgICAgICAgICAgICAgICAgICAgZHJhd2FibGUubWFya0RpcnR5UmFkaXVzKCkgdGhhdCB3aWxsIGluZGljYXRlIHRvIHRoZSBkcmF3YWJsZSB0aGF0IHRoZSByYWRpdXMgaGFzIGNoYW5nZWQuXHJcbiAqIChzY2VuZXJ5LWludGVybmFsKVxyXG4gKiBAb3ZlcnJpZGVcclxuICovXHJcblBhdGgucHJvdG90eXBlLmRyYXdhYmxlTWFya0ZsYWdzID0gWyAuLi5Ob2RlLnByb3RvdHlwZS5kcmF3YWJsZU1hcmtGbGFncywgLi4uUEFJTlRBQkxFX0RSQVdBQkxFX01BUktfRkxBR1MsICdzaGFwZScgXTtcclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdQYXRoJywgUGF0aCApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxTQUFTQyxLQUFLLFFBQVEsNkJBQTZCO0FBR25ELFNBQTRFQyxJQUFJLEVBQWVDLEtBQUssRUFBRUMsU0FBUyxFQUFFQyw2QkFBNkIsRUFBRUMscUJBQXFCLEVBQW9CQyxrQkFBa0IsRUFBRUMsZUFBZSxFQUFFQyxRQUFRLEVBQUVDLE9BQU8sUUFBeUIsZUFBZTtBQUN2UixPQUFPQyxTQUFTLElBQUlDLGNBQWMsUUFBUSxvQ0FBb0M7QUFFOUUsTUFBTUMsZ0JBQWdCLEdBQUcsQ0FDdkIsY0FBYyxFQUNkLE9BQU8sQ0FDUjtBQUVELE1BQU1DLGVBQWUsR0FBRztFQUN0QkMsS0FBSyxFQUFFLElBQUk7RUFDWEMsWUFBWSxFQUFFO0FBQ2hCLENBQUM7QUE4Q0QsZUFBZSxNQUFNQyxJQUFJLFNBQVNiLFNBQVMsQ0FBRUYsSUFBSyxDQUFDLENBQUM7RUFFbEQ7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBOztFQUdBO0VBQ0E7RUFHQTtFQUdBO0VBQ0E7RUFHQTtFQUdBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTZ0IsV0FBV0EsQ0FBRUgsS0FBNEIsRUFBRUksZUFBNkIsRUFBRztJQUNoRkMsTUFBTSxJQUFJQSxNQUFNLENBQUVELGVBQWUsS0FBS0UsU0FBUyxJQUFJQyxNQUFNLENBQUNDLGNBQWMsQ0FBRUosZUFBZ0IsQ0FBQyxLQUFLRyxNQUFNLENBQUNFLFNBQVMsRUFDOUcsd0RBQXlELENBQUM7SUFFNUQsSUFBS1QsS0FBSyxJQUFJSSxlQUFlLEVBQUVKLEtBQUssRUFBRztNQUNyQ0ssTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQ0wsS0FBSyxJQUFJLENBQUNJLGVBQWUsRUFBRUosS0FBSyxFQUFFLG1FQUFvRSxDQUFDO0lBQzVIO0lBRUEsTUFBTVUsT0FBTyxHQUFHZCxTQUFTLENBQTBDLENBQUMsQ0FBRTtNQUNwRUksS0FBSyxFQUFFQSxLQUFLO01BQ1pDLFlBQVksRUFBRUYsZUFBZSxDQUFDRTtJQUNoQyxDQUFDLEVBQUVHLGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUFDLENBQUM7SUFFUCxJQUFJLENBQUNPLE1BQU0sR0FBR1osZUFBZSxDQUFDQyxLQUFLO0lBQ25DLElBQUksQ0FBQ1ksYUFBYSxHQUFHLElBQUk7SUFDekIsSUFBSSxDQUFDQyxhQUFhLEdBQUdkLGVBQWUsQ0FBQ0UsWUFBWTtJQUNqRCxJQUFJLENBQUNhLHFCQUFxQixHQUFHLElBQUksQ0FBQ0MsZUFBZSxDQUFDQyxJQUFJLENBQUUsSUFBSyxDQUFDO0lBQzlELElBQUksQ0FBQ0MsNkJBQTZCLEdBQUcsS0FBSztJQUUxQyxJQUFJLENBQUNDLDRCQUE0QixDQUFDLENBQUM7SUFFbkMsSUFBSSxDQUFDQyxNQUFNLENBQUVULE9BQVEsQ0FBQztFQUN4QjtFQUVPVSxRQUFRQSxDQUFFcEIsS0FBNEIsRUFBUztJQUNwREssTUFBTSxJQUFJQSxNQUFNLENBQUVMLEtBQUssS0FBSyxJQUFJLElBQUksT0FBT0EsS0FBSyxLQUFLLFFBQVEsSUFBSUEsS0FBSyxZQUFZZCxLQUFLLEVBQ3JGLDZEQUE4RCxDQUFDO0lBRWpFLElBQUssSUFBSSxDQUFDeUIsTUFBTSxLQUFLWCxLQUFLLEVBQUc7TUFDM0I7TUFDQSxJQUFLLElBQUksQ0FBQ2lCLDZCQUE2QixFQUFHO1FBQ3hDLElBQUksQ0FBQ0ksbUJBQW1CLENBQUMsQ0FBQztNQUM1QjtNQUVBLElBQUssT0FBT3JCLEtBQUssS0FBSyxRQUFRLEVBQUc7UUFDL0I7UUFDQUEsS0FBSyxHQUFHLElBQUlkLEtBQUssQ0FBRWMsS0FBTSxDQUFDO01BQzVCO01BQ0EsSUFBSSxDQUFDVyxNQUFNLEdBQUdYLEtBQUs7TUFDbkIsSUFBSSxDQUFDZSxlQUFlLENBQUMsQ0FBQzs7TUFFdEI7TUFDQSxJQUFLLElBQUksQ0FBQ0osTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDQSxNQUFNLENBQUNXLFdBQVcsQ0FBQyxDQUFDLEVBQUc7UUFDL0MsSUFBSSxDQUFDQyxtQkFBbUIsQ0FBQyxDQUFDO01BQzVCO0lBQ0Y7SUFDQSxPQUFPLElBQUk7RUFDYjtFQUVBLElBQVd2QixLQUFLQSxDQUFFd0IsS0FBNEIsRUFBRztJQUFFLElBQUksQ0FBQ0osUUFBUSxDQUFFSSxLQUFNLENBQUM7RUFBRTtFQUUzRSxJQUFXeEIsS0FBS0EsQ0FBQSxFQUFpQjtJQUFFLE9BQU8sSUFBSSxDQUFDeUIsUUFBUSxDQUFDLENBQUM7RUFBRTs7RUFFM0Q7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU0EsUUFBUUEsQ0FBQSxFQUFpQjtJQUM5QixPQUFPLElBQUksQ0FBQ2QsTUFBTTtFQUNwQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTZSxlQUFlQSxDQUFBLEVBQVU7SUFDOUJyQixNQUFNLElBQUlBLE1BQU0sQ0FBRSxJQUFJLENBQUNzQixRQUFRLENBQUMsQ0FBQyxFQUFFLHVDQUF3QyxDQUFDOztJQUU1RTtJQUNBLElBQUssQ0FBQyxJQUFJLENBQUNmLGFBQWEsRUFBRztNQUN6QixJQUFJLENBQUNBLGFBQWEsR0FBRyxJQUFJLENBQUNhLFFBQVEsQ0FBQyxDQUFDLENBQUVDLGVBQWUsQ0FBRSxJQUFJLENBQUNFLGtCQUFtQixDQUFDO0lBQ2xGO0lBRUEsT0FBTyxJQUFJLENBQUNoQixhQUFhO0VBQzNCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDWWlCLHNCQUFzQkEsQ0FBQSxFQUFXO0lBQ3pDO0lBQ0EsT0FBT25DLFFBQVEsQ0FBQ29DLGFBQWEsR0FBR3BDLFFBQVEsQ0FBQ3FDLFVBQVU7RUFDckQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNrQmIsNEJBQTRCQSxDQUFBLEVBQVM7SUFDbkQsSUFBSSxDQUFDYyxrQkFBa0IsQ0FBRSxJQUFJLENBQUNDLHNCQUFzQixDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNDLHdCQUF3QixDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNMLHNCQUFzQixDQUFDLENBQUUsQ0FBQztFQUM1SDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDVWQsZUFBZUEsQ0FBQSxFQUFTO0lBQzlCLElBQUksQ0FBQ29CLGNBQWMsQ0FBQyxDQUFDO0lBRXJCLE1BQU1DLFFBQVEsR0FBRyxJQUFJLENBQUNDLFVBQVUsQ0FBQ0MsTUFBTTtJQUN2QyxLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0gsUUFBUSxFQUFFRyxDQUFDLEVBQUUsRUFBRztNQUNqQyxJQUFJLENBQUNGLFVBQVUsQ0FBRUUsQ0FBQyxDQUFFLENBQStCQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekU7O0lBRUE7SUFDQTtJQUNBLElBQUssSUFBSSxDQUFDdkIsNkJBQTZCLElBQUksSUFBSSxDQUFDTixNQUFNLElBQUksSUFBSSxDQUFDQSxNQUFNLENBQUNXLFdBQVcsQ0FBQyxDQUFDLEVBQUc7TUFDcEYsSUFBSSxDQUFDRCxtQkFBbUIsQ0FBQyxDQUFDO0lBQzVCO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNZYyxjQUFjQSxDQUFBLEVBQVM7SUFDL0IsSUFBSSxDQUFDdkIsYUFBYSxHQUFHLElBQUk7SUFFekIsSUFBSSxDQUFDNkIsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3pCOztFQUVBO0FBQ0Y7QUFDQTtFQUNVbEIsbUJBQW1CQSxDQUFBLEVBQVM7SUFDbENsQixNQUFNLElBQUlBLE1BQU0sQ0FBRSxDQUFDLElBQUksQ0FBQ1ksNkJBQTZCLEVBQUUsZ0RBQWlELENBQUM7O0lBRXpHO0lBQ0EsSUFBSyxDQUFDLElBQUksQ0FBQ3lCLFVBQVUsRUFBRztNQUN0QixJQUFJLENBQUMvQixNQUFNLENBQUVnQyxrQkFBa0IsQ0FBQ0MsV0FBVyxDQUFFLElBQUksQ0FBQzlCLHFCQUFzQixDQUFDO01BQ3pFLElBQUksQ0FBQ0csNkJBQTZCLEdBQUcsSUFBSTtJQUMzQztFQUNGOztFQUVBO0FBQ0Y7QUFDQTtFQUNVSSxtQkFBbUJBLENBQUEsRUFBUztJQUNsQ2hCLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ1ksNkJBQTZCLEVBQUUseUNBQTBDLENBQUM7SUFFakcsSUFBSSxDQUFDTixNQUFNLENBQUVnQyxrQkFBa0IsQ0FBQ0UsY0FBYyxDQUFFLElBQUksQ0FBQy9CLHFCQUFzQixDQUFDO0lBQzVFLElBQUksQ0FBQ0csNkJBQTZCLEdBQUcsS0FBSztFQUM1Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ3FCNkIsZ0JBQWdCQSxDQUFBLEVBQVk7SUFDN0MsTUFBTUMsVUFBVSxHQUFHLElBQUksQ0FBQ3BCLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDcUIsa0JBQWtCLENBQUMsQ0FBQyxHQUFHL0QsT0FBTyxDQUFDZ0UsT0FBTztJQUNoRixNQUFNQyxPQUFPLEdBQUcsQ0FBQ0gsVUFBVSxDQUFDSSxNQUFNLENBQUUsSUFBSSxDQUFDQyxrQkFBa0IsQ0FBQ0MsTUFBTyxDQUFDO0lBQ3BFLElBQUtILE9BQU8sRUFBRztNQUNiLElBQUksQ0FBQ0Usa0JBQWtCLENBQUNDLE1BQU0sQ0FBQ0MsR0FBRyxDQUFFUCxVQUFXLENBQUM7SUFDbEQ7SUFDQSxPQUFPRyxPQUFPO0VBQ2hCO0VBRU9LLGVBQWVBLENBQUV0RCxZQUE4QixFQUFTO0lBQzdESSxNQUFNLElBQUlBLE1BQU0sQ0FBRUosWUFBWSxLQUFLLFVBQVUsSUFDM0JBLFlBQVksS0FBSyxXQUFXLElBQzVCQSxZQUFZLEtBQUssY0FBYyxJQUMvQkEsWUFBWSxLQUFLLGFBQWEsSUFDOUJBLFlBQVksS0FBSyxNQUFPLENBQUM7SUFDM0MsSUFBSyxJQUFJLENBQUNZLGFBQWEsS0FBS1osWUFBWSxFQUFHO01BQ3pDLElBQUksQ0FBQ1ksYUFBYSxHQUFHWixZQUFZO01BQ2pDLElBQUksQ0FBQ2tDLGNBQWMsQ0FBQyxDQUFDO01BRXJCLElBQUksQ0FBQ3FCLDZCQUE2QixDQUFDQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0M7O0lBQ0EsT0FBTyxJQUFJO0VBQ2I7RUFFQSxJQUFXeEQsWUFBWUEsQ0FBRXVCLEtBQXVCLEVBQUc7SUFBRSxJQUFJLENBQUMrQixlQUFlLENBQUUvQixLQUFNLENBQUM7RUFBRTtFQUVwRixJQUFXdkIsWUFBWUEsQ0FBQSxFQUFxQjtJQUFFLE9BQU8sSUFBSSxDQUFDeUQsZUFBZSxDQUFDLENBQUM7RUFBRTs7RUFFN0U7QUFDRjtBQUNBO0VBQ1NBLGVBQWVBLENBQUEsRUFBcUI7SUFDekMsT0FBTyxJQUFJLENBQUM3QyxhQUFhO0VBQzNCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDU21DLGtCQUFrQkEsQ0FBQSxFQUFZO0lBQ25DLE1BQU1oRCxLQUFLLEdBQUcsSUFBSSxDQUFDeUIsUUFBUSxDQUFDLENBQUM7SUFDN0I7SUFDQSxJQUFLLElBQUksQ0FBQ1osYUFBYSxLQUFLLE1BQU0sSUFBSSxDQUFDYixLQUFLLEVBQUc7TUFDN0MsT0FBT2YsT0FBTyxDQUFDZ0UsT0FBTztJQUN4QixDQUFDLE1BQ0k7TUFDSDtNQUNBLElBQUssQ0FBQyxJQUFJLENBQUNVLGtCQUFrQixDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM5QyxhQUFhLEtBQUssV0FBVyxFQUFHO1FBQ3RFLE9BQU9iLEtBQUssQ0FBQzRELE1BQU07TUFDckIsQ0FBQyxNQUNJO1FBQ0g7UUFDQSxJQUFLLElBQUksQ0FBQy9DLGFBQWEsS0FBSyxVQUFVLEVBQUc7VUFDdkMsT0FBT2IsS0FBSyxDQUFDNkQsZ0JBQWdCLENBQUUsSUFBSSxDQUFDQyxhQUFhLENBQUMsQ0FBRSxDQUFDO1FBQ3ZEO1FBQ0U7UUFDQTtRQUNGO1FBQUEsS0FDSztVQUNILElBQUlDLE1BQU07VUFDVjtVQUNBO1VBQ0EsSUFBSyxJQUFJLENBQUNsRCxhQUFhLEtBQUssYUFBYSxJQUFJLElBQUksQ0FBQ21ELFdBQVcsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFHO1lBQzVFRCxNQUFNLEdBQUcsSUFBSSxDQUFDRSxhQUFhLENBQUMsQ0FBQztVQUMvQixDQUFDLE1BQ0ksSUFBSyxJQUFJLENBQUNDLFVBQVUsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFHO1lBQ3pDSCxNQUFNLEdBQUdJLElBQUksQ0FBQ0MsS0FBSztVQUNyQixDQUFDLE1BQ0k7WUFDSEwsTUFBTSxHQUFHLENBQUM7VUFDWjtVQUNBLE9BQU8vRCxLQUFLLENBQUM0RCxNQUFNLENBQUNTLE9BQU8sQ0FBRU4sTUFBTSxHQUFHLElBQUksQ0FBQ08sWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFFLENBQUM7UUFDakU7TUFDRjtJQUNGO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ2tCQyxrQkFBa0JBLENBQUEsRUFBWTtJQUM1QyxJQUFLLElBQUksQ0FBQzFELGFBQWEsS0FBSyxVQUFVLElBQUksSUFBSSxDQUFDQSxhQUFhLEtBQUssYUFBYSxFQUFHO01BQy9FLE9BQU8sSUFBSTtJQUNiLENBQUMsTUFDSSxJQUFLLElBQUksQ0FBQ0EsYUFBYSxLQUFLLE1BQU0sRUFBRztNQUN4QyxPQUFPLEtBQUs7SUFDZCxDQUFDLE1BQ0k7TUFDSCxPQUFPLENBQUMsSUFBSSxDQUFDMkQsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVCO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0VBQ2tCQyx3QkFBd0JBLENBQUVDLE1BQWUsRUFBWTtJQUNuRXJFLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ3NCLFFBQVEsQ0FBQyxDQUFFLENBQUM7SUFFbkMsT0FBTyxDQUFFLElBQUksQ0FBQ2dELE9BQU8sR0FBRyxJQUFJLENBQUNqRCxlQUFlLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0QsUUFBUSxDQUFDLENBQUMsRUFBSW1ELHNCQUFzQixDQUFFRixNQUFPLENBQUM7RUFDdEc7O0VBRUE7QUFDRjtBQUNBO0VBQ2tCRyw0QkFBNEJBLENBQUVILE1BQWUsRUFBWTtJQUN2RSxPQUFPLElBQUksQ0FBQ0Qsd0JBQXdCLENBQUVDLE1BQU8sQ0FBQztFQUNoRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNrQkksZ0JBQWdCQSxDQUFBLEVBQVM7SUFDdkMsSUFBSSxDQUFDM0MsY0FBYyxDQUFDLENBQUM7SUFFckIsSUFBSSxDQUFDcUIsNkJBQTZCLENBQUNDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7SUFFM0MsS0FBSyxDQUFDcUIsZ0JBQWdCLENBQUMsQ0FBQztFQUMxQjs7RUFFQTtBQUNGO0FBQ0E7RUFDU25ELFFBQVFBLENBQUEsRUFBWTtJQUN6QixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUNoQixNQUFNO0VBQ3RCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ3FCb0UsZUFBZUEsQ0FBRUMsT0FBNkIsRUFBRU4sTUFBZSxFQUFTO0lBQ3pGO0lBQ0FsRixrQkFBa0IsQ0FBQ2lCLFNBQVMsQ0FBQ3dFLFdBQVcsQ0FBRUQsT0FBTyxFQUFFLElBQUksRUFBRU4sTUFBTyxDQUFDO0VBQ25FOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNrQlEsaUJBQWlCQSxDQUFFQyxRQUFnQixFQUFFQyxRQUFrQixFQUFvQjtJQUN6RjtJQUNBLE9BQU8zRixlQUFlLENBQUM0RixjQUFjLENBQUVGLFFBQVEsRUFBRUMsUUFBUyxDQUFDO0VBQzdEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNrQkUsb0JBQW9CQSxDQUFFSCxRQUFnQixFQUFFQyxRQUFrQixFQUF1QjtJQUMvRjtJQUNBLE9BQU81RixrQkFBa0IsQ0FBQzZGLGNBQWMsQ0FBRUYsUUFBUSxFQUFFQyxRQUFTLENBQUM7RUFDaEU7O0VBRUE7QUFDRjtBQUNBO0VBQ2tCRyxTQUFTQSxDQUFBLEVBQVk7SUFDbkM7SUFDQSxPQUFPLElBQUk7RUFDYjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ2tCQyxpQkFBaUJBLENBQUVDLEtBQWMsRUFBWTtJQUMzRCxJQUFJQyxNQUFNLEdBQUcsS0FBSztJQUNsQixJQUFLLENBQUMsSUFBSSxDQUFDL0QsUUFBUSxDQUFDLENBQUMsRUFBRztNQUN0QixPQUFPK0QsTUFBTTtJQUNmOztJQUVBO0lBQ0EsSUFBSyxJQUFJLENBQUNDLGFBQWEsRUFBRztNQUN4QkQsTUFBTSxHQUFHLElBQUksQ0FBQ2pFLFFBQVEsQ0FBQyxDQUFDLENBQUVtRSxhQUFhLENBQUVILEtBQU0sQ0FBQztJQUNsRDs7SUFFQTtJQUNBLElBQUssQ0FBQ0MsTUFBTSxJQUFJLElBQUksQ0FBQ0csZUFBZSxFQUFHO01BQ3JDSCxNQUFNLEdBQUcsSUFBSSxDQUFDaEUsZUFBZSxDQUFDLENBQUMsQ0FBQ2tFLGFBQWEsQ0FBRUgsS0FBTSxDQUFDO0lBQ3hEO0lBQ0EsT0FBT0MsTUFBTTtFQUNmOztFQUVBO0FBQ0Y7QUFDQTtFQUNrQkksWUFBWUEsQ0FBQSxFQUFVO0lBQ3BDLE9BQU81RyxLQUFLLENBQUM2RyxLQUFLLENBQUUsQ0FDbEIsSUFBTyxJQUFJLENBQUNwRSxRQUFRLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQ2dFLGFBQWEsR0FBSyxDQUFFLElBQUksQ0FBQ2xFLFFBQVEsQ0FBQyxDQUFDLENBQUcsR0FBRyxFQUFFLENBQUUsRUFDNUUsSUFBTyxJQUFJLENBQUNFLFFBQVEsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDa0UsZUFBZSxHQUFLLENBQUUsSUFBSSxDQUFDbkUsZUFBZSxDQUFDLENBQUMsQ0FBRSxHQUFHLEVBQUUsQ0FBRSxDQUNwRixDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNrQnNFLG9CQUFvQkEsQ0FBRXBDLE1BQWUsRUFBWTtJQUMvRDtJQUNBLE9BQU8sSUFBSSxDQUFDakQsTUFBTSxHQUFHLElBQUksQ0FBQ0EsTUFBTSxDQUFDc0YsZ0JBQWdCLENBQUVyQyxNQUFPLENBQUMsR0FBRyxLQUFLO0VBQ3JFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ1VzQywyQkFBMkJBLENBQUEsRUFBWTtJQUM3QyxJQUFLLENBQUMsSUFBSSxDQUFDdkIsT0FBTyxJQUFJLEVBQUcsSUFBSSxDQUFDQSxPQUFPLFlBQVl2RixLQUFLLENBQUUsSUFBSSxDQUFDLElBQUksQ0FBQ3VDLFFBQVEsQ0FBQyxDQUFDLEVBQUc7TUFDN0UsT0FBTyxLQUFLO0lBQ2Q7SUFFQSxNQUFNaUMsTUFBTSxHQUFHLElBQUksQ0FBQ1osa0JBQWtCLENBQUMsQ0FBQztJQUN4QyxPQUFPWSxNQUFNLENBQUN1QyxDQUFDLEdBQUd2QyxNQUFNLENBQUN3QyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7RUFDcEM7O0VBRUE7QUFDRjtBQUNBO0VBQ2tCQyxrQkFBa0JBLENBQUEsRUFBVztJQUMzQyxPQUFPLElBQUksQ0FBQzFGLE1BQU0sR0FBSSw2R0FBNEcsSUFBSSxDQUFDQSxNQUFNLENBQUMyRixVQUFVLENBQUMsQ0FBRSxzQkFBcUIsR0FBRyxFQUFFO0VBQ3ZMOztFQUVBO0FBQ0Y7QUFDQTtFQUNrQkMsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCLElBQUssSUFBSSxDQUFDdEYsNkJBQTZCLEVBQUc7TUFDeEMsSUFBSSxDQUFDSSxtQkFBbUIsQ0FBQyxDQUFDO0lBQzVCO0lBRUEsS0FBSyxDQUFDa0YsT0FBTyxDQUFDLENBQUM7RUFDakI7RUFFZ0JwRixNQUFNQSxDQUFFVCxPQUFxQixFQUFTO0lBQ3BELE9BQU8sS0FBSyxDQUFDUyxNQUFNLENBQUVULE9BQVEsQ0FBQztFQUNoQzs7RUFFQTtFQUNBLE9BQXVCOEYsb0JBQW9CLEdBQUczRyxjQUFjLENBQWUsQ0FBQyxDQUFDLEVBQUVWLElBQUksQ0FBQ3NILG9CQUFvQixFQUFFMUcsZUFBZ0IsQ0FBQztBQUM3SDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBRyxJQUFJLENBQUNPLFNBQVMsQ0FBQ2lHLFlBQVksR0FBRyxDQUFFLEdBQUduSCxxQkFBcUIsRUFBRSxHQUFHTyxnQkFBZ0IsRUFBRSxHQUFHWCxJQUFJLENBQUNzQixTQUFTLENBQUNpRyxZQUFZLENBQUU7O0FBRS9HO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0F4RyxJQUFJLENBQUNPLFNBQVMsQ0FBQ2tHLGlCQUFpQixHQUFHLENBQUUsR0FBR3hILElBQUksQ0FBQ3NCLFNBQVMsQ0FBQ2tHLGlCQUFpQixFQUFFLEdBQUdySCw2QkFBNkIsRUFBRSxPQUFPLENBQUU7QUFFckhLLE9BQU8sQ0FBQ2lILFFBQVEsQ0FBRSxNQUFNLEVBQUUxRyxJQUFLLENBQUMifQ==